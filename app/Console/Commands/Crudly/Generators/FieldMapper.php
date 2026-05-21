<?php

namespace App\Console\Commands\Crudly\Generators;

use App\Crudly\FieldRegistry;

class FieldMapper
{
    protected $fieldMappings = [];

    public function __construct()
    {
        $this->loadFieldMappings();
    }

    protected function loadFieldMappings()
    {
        $this->fieldMappings = FieldRegistry::getAllFields();
    }

    public function getMapping($fieldType)
    {
        return $this->fieldMappings[$fieldType] ?? null;
    }

    public function getAllMappings()
    {
        return $this->fieldMappings;
    }

    public function parseFields($fieldsString)
    {
        $fields = [];
        
        // Use semicolon as field separator to avoid conflicts with validation rules
        $fieldPairs = explode(';', $fieldsString);

        foreach ($fieldPairs as $fieldPair) {
            // Split only on the first 2 colons, then handle the rest manually
            $parts = explode(':', trim($fieldPair), 3);
            
            // Handle relationship field format: name:relationship:related_model:validation:filterable
            // Handle multi-relationship field format: name:relationship-multi:related_model:parent_field:validation:filterable
            $relatedModel = null;
            $dependsOn = null;
            if (count($parts) >= 3 && (trim($parts[1]) === 'relationship' || trim($parts[1]) === 'relationship-multi')) {
                // For relationship fields, split the third part to get model, validation, and args
                $thirdPart = $parts[2];
                
                // Check for display arg (::hidden)
                if (strpos($thirdPart, '::') !== false) {
                    $validationAndArgs = explode('::', $thirdPart, 2);
                    $validationPart = $validationAndArgs[0];
                    $displayArg = $validationAndArgs[1] ?? null;
                } else {
                    $validationPart = $thirdPart;
                    $displayArg = null;
                }
                
                // Split model:parent_field:validation:filterable for multi-level relationships
                $relationshipParts = explode(':', $validationPart);
                $relatedModel = trim($relationshipParts[0]);
                
                // For relationship-multi, second part is the parent field dependency
                if (trim($parts[1]) === 'relationship-multi' && count($relationshipParts) > 1) {
                    $dependsOn = trim($relationshipParts[1]);
                    // Remove the dependency from parts for validation processing
                    array_splice($relationshipParts, 1, 1);
                }
                
                // Handle validation that may contain colons (like exists:table,column)
                if (count($relationshipParts) > 2) {
                    // Check if last part is 'filterable'
                    $lastPart = trim($relationshipParts[count($relationshipParts) - 1]);
                    if ($lastPart === 'filterable') {
                        $filterableArg = 'filterable';
                        // Rebuild validation without the filterable part
                        $validationParts = array_slice($relationshipParts, 1, -1);
                        $validation = implode(':', $validationParts);
                    } else {
                        $filterableArg = null;
                        // Rebuild validation from all parts except the model
                        $validationParts = array_slice($relationshipParts, 1);
                        $validation = implode(':', $validationParts);
                    }
                } else {
                    $validation = isset($relationshipParts[1]) && !empty(trim($relationshipParts[1])) ? trim($relationshipParts[1]) : null;
                    $filterableArg = null;
                }
            } else {
                // If we have validation rules, we need to split them from filterable/display args
                if (count($parts) >= 3 && !empty($parts[2])) {
                    // Look for double colon which indicates start of display arg
                    if (strpos($parts[2], '::') !== false) {
                        $validationAndArgs = explode('::', $parts[2], 2);
                        $validation = $validationAndArgs[0];
                        $displayArg = $validationAndArgs[1] ?? null;
                        $filterableArg = null;
                    } else {
                        // Split validation from filterable arg (last part after last colon)
                        $lastColonPos = strrpos($parts[2], ':');
                        if ($lastColonPos !== false && substr($parts[2], $lastColonPos + 1) === 'filterable') {
                            $validation = substr($parts[2], 0, $lastColonPos);
                            $filterableArg = 'filterable';
                            $displayArg = null;
                        } else {
                            $validation = $parts[2];
                            $filterableArg = null;
                            $displayArg = null;
                        }
                    }
                } else {
                    $validation = isset($parts[2]) && !empty(trim($parts[2])) ? trim($parts[2]) : null;
                    $filterableArg = null;
                    $displayArg = null;
                }
            }
            
            if (count($parts) >= 2) {
                $fieldName = trim($parts[0]);
                $fieldType = trim($parts[1]);
                
                // Clean up validation string
                if ($validation) {
                    $validation = trim($validation);
                    // Fix truncated validation rules
                    if (strpos($validation, '|max') !== false && !preg_match('/\|max:\d+/', $validation)) {
                        $validation = str_replace('|max', '|max:255', $validation);
                    }
                    if (strpos($validation, '|min') !== false && !preg_match('/\|min:\d+/', $validation)) {
                        $validation = str_replace('|min', '|min:0', $validation);
                    }
                    if (preg_match('/\|in(?![a-z])/', $validation) && !preg_match('/\|in:[^|]+/', $validation)) {
                        // Remove incomplete |in rules - they should be properly specified with options
                        $validation = preg_replace('/\|in(?![a-z])/', '', $validation);
                        // Clean up any double pipes
                        $validation = preg_replace('/\|+/', '|', $validation);
                        $validation = trim($validation, '|');
                    }
                }
                
                $mapping = $this->getMapping($fieldType);
                if ($mapping) {
                    // Handle relationship fields
                    if (($fieldType === 'relationship' || $fieldType === 'relationship-multi') && $relatedModel) {
                        $relatedTable = \Illuminate\Support\Str::snake(\Illuminate\Support\Str::plural($relatedModel));
                        $mapping['migration'] = str_replace('{{related_table}}', $relatedTable, $mapping['migration']);
                        $mapping['validation'] = str_replace('{{related_table}}', $relatedTable, $mapping['validation']);
                        $mapping['related_model'] = $relatedModel;
                        $mapping['related_table'] = $relatedTable;
                        
                        // For multi-level relationships, add dependency information
                        if ($fieldType === 'relationship-multi' && $dependsOn) {
                            $mapping['depends_on'] = $dependsOn;
                        }
                    }
                    
                    // Override validation if provided
                    if ($validation && !empty(trim($validation))) {
                        $mapping['validation'] = $validation;
                        
                        // For radio, select and checkboxgroup fields, extract options from validation
                        if ((($fieldType === 'radio' || $fieldType === 'select') && strpos($validation, 'in:') !== false) || 
                            ($fieldType === 'checkboxgroup' && strpos($validation, 'array') !== false)) {
                            if (($fieldType === 'radio' || $fieldType === 'select') && preg_match('/in:([^|]+)/', $validation, $matches)) {
                                $options = explode(',', $matches[1]);
                                $filterOptions = [];
                                foreach ($options as $option) {
                                    $option = trim($option);
                                    $filterOptions[] = [
                                        'value' => $option,
                                        'label' => ucfirst(str_replace('_', ' ', $option))
                                    ];
                                }
                                $mapping['filter_options'] = $filterOptions;
                            }
                        }
                    }
                    
                    // Override filterable only if explicitly provided
                    if ($filterableArg === 'filterable') {
                        $mapping['filterable'] = true;
                    }
                    
                    // Override display only if explicitly provided
                    if ($displayArg === 'hidden') {
                        $mapping['display'] = false;
                    }
                    
                    $fields[] = [
                        'name' => $fieldName,
                        'type' => $fieldType,
                        'validation' => $validation,
                        'mapping' => $mapping
                    ];
                }
            }
        }

        return $fields;
    }
}