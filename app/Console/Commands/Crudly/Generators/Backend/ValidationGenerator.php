<?php

namespace App\Console\Commands\Crudly\Generators\Backend;

class ValidationGenerator
{
    protected $fields;

    public function __construct($fields)
    {
        $this->fields = $fields;
    }

    public function generateRules()
    {
        $rules = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'date-range-picker') {
                $startField = $field['name'] . '_start';
                $endField = $field['name'] . '_end';
                $rules .= "            '{$startField}' => '{$field['mapping']['validation']}',\n";
                $rules .= "            '{$endField}' => '{$field['mapping']['validation_end']}',\n";
            } else {
                $validation = $field['validation'] ?? $field['mapping']['validation'] ?? 'nullable|string';
                $rules .= "            '{$field['name']}' => '{$validation}',\n";
            }
        }
        return $rules;
    }
    
    public function generateUpdateRules($tableName, $primaryKey = 'id')
    {
        $rules = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'date-range-picker') {
                $startField = $field['name'] . '_start';
                $endField = $field['name'] . '_end';
                $validation = $field['mapping']['validation'];
                $validationEnd = $field['mapping']['validation_end'];
                
                // Handle unique validation for update
                if (strpos($validation, 'unique:') !== false) {
                    if (preg_match('/unique:([^|,]+),([^|,]+)/', $validation)) {
                        $validation = preg_replace('/unique:([^|,]+),([^|,]+)/', "unique:$1,$2,'.\${$primaryKey}->id.'", $validation);
                    } else {
                        $validation = preg_replace('/unique:([^|,]+)/', "unique:$1,{$startField},'.\${$primaryKey}->id.'", $validation);
                    }
                }
                if (strpos($validationEnd, 'unique:') !== false) {
                    if (preg_match('/unique:([^|,]+),([^|,]+)/', $validationEnd)) {
                        $validationEnd = preg_replace('/unique:([^|,]+),([^|,]+)/', "unique:$1,$2,'.\${$primaryKey}->id.'", $validationEnd);
                    } else {
                        $validationEnd = preg_replace('/unique:([^|,]+)/', "unique:$1,{$endField},'.\${$primaryKey}->id.'", $validationEnd);
                    }
                }
                
                $rules .= "            '{$startField}' => '{$validation}',\n";
                $rules .= "            '{$endField}' => '{$validationEnd}',\n";
            } else {
                $validation = $field['validation'] ?? $field['mapping']['validation'];
                
                // Handle unique validation for update
                if (strpos($validation, 'unique:') !== false) {
                    if (preg_match('/unique:([^|,]+),([^|,]+)/', $validation)) {
                        $validation = preg_replace('/unique:([^|,]+),([^|,]+)/', "unique:$1,$2,'.\${$primaryKey}->id.'", $validation);
                    } else {
                        $validation = preg_replace('/unique:([^|,]+)/', "unique:$1,{$field['name']},'.\${$primaryKey}->id.'", $validation);
                    }
                }
                
                $rules .= "            '{$field['name']}' => '{$validation}',\n";
            }
        }
        return $rules;
    }
    
    public function extractOptionsFromValidation($validation)
    {
        if (preg_match('/in:([^|]+)/', $validation, $matches)) {
            $options = explode(',', $matches[1]);
            $filterOptions = [];
            foreach ($options as $option) {
                $option = trim($option);
                $filterOptions[] = [
                    'value' => $option,
                    'label' => ucfirst(str_replace('_', ' ', $option))
                ];
            }
            return $filterOptions;
        }
        return [];
    }

    public function generateFilters($variableName)
    {
        $filters = '';
        
        foreach ($this->fields as $field) {
            if ($field['mapping']['filterable']) {
                if (isset($field['mapping']['filter_type']) && $field['mapping']['filter_type'] === 'date_range') {
                    $filterFromName = $field['name'] . '_from';
                    $filterToName = $field['name'] . '_to';
                    $filters .= "            // Apply {$field['name']} date range filter\n";
                    $filters .= "            if (\$request->filled('{$filterFromName}')) {\n";
                    $filters .= "                \${$variableName}->whereDate('{$field['name']}', '>=', \$request->{$filterFromName});\n";
                    $filters .= "            }\n";
                    $filters .= "            if (\$request->filled('{$filterToName}')) {\n";
                    $filters .= "                \${$variableName}->whereDate('{$field['name']}', '<=', \$request->{$filterToName});\n";
                    $filters .= "            }\n            \n";
                } elseif (isset($field['mapping']['filter_type']) && $field['mapping']['filter_type'] === 'time_range') {
                    $filterFromName = $field['name'] . '_from';
                    $filterToName = $field['name'] . '_to';
                    $filters .= "            // Apply {$field['name']} time range filter\n";
                    $filters .= "            if (\$request->filled('{$filterFromName}')) {\n";
                    $filters .= "                \${$variableName}->whereTime('{$field['name']}', '>=', \$request->{$filterFromName});\n";
                    $filters .= "            }\n";
                    $filters .= "            if (\$request->filled('{$filterToName}')) {\n";
                    $filters .= "                \${$variableName}->whereTime('{$field['name']}', '<=', \$request->{$filterToName});\n";
                    $filters .= "            }\n            \n";
                } elseif (isset($field['mapping']['filter_type']) && $field['mapping']['filter_type'] === 'rating_range') {
                    $filterMinName = $field['name'] . '_min';
                    $filterMaxName = $field['name'] . '_max';
                    $filters .= "            // Apply {$field['name']} rating range filter\n";
                    $filters .= "            if (\$request->filled('{$filterMinName}')) {\n";
                    $filters .= "                \${$variableName}->where('{$field['name']}', '>=', \$request->{$filterMinName});\n";
                    $filters .= "            }\n";
                    $filters .= "            if (\$request->filled('{$filterMaxName}')) {\n";
                    $filters .= "                \${$variableName}->where('{$field['name']}', '<=', \$request->{$filterMaxName});\n";
                    $filters .= "            }\n            \n";
                } elseif (isset($field['mapping']['filter_type']) && $field['mapping']['filter_type'] === 'currency_range') {
                    $filterMinName = $field['name'] . '_min';
                    $filterMaxName = $field['name'] . '_max';
                    $filters .= "            // Apply {$field['name']} currency range filter\n";
                    $filters .= "            if (\$request->filled('{$filterMinName}')) {\n";
                    $filters .= "                \${$variableName}->where('{$field['name']}', '>=', \$request->{$filterMinName});\n";
                    $filters .= "            }\n";
                    $filters .= "            if (\$request->filled('{$filterMaxName}')) {\n";
                    $filters .= "                \${$variableName}->where('{$field['name']}', '<=', \$request->{$filterMaxName});\n";
                    $filters .= "            }\n            \n";
                } elseif ($field['mapping']['filterable']) {
                    $filterName = $field['name'] . '_filter';
                    $filters .= "            // Apply {$field['name']} filter\n";
                    if ($field['type'] === 'checkbox') {
                        $filters .= "            if (\$request->has('{$filterName}') && \$request->{$filterName} !== null && \$request->{$filterName} !== '') {\n";
                        $filters .= "                \${$variableName}->where('{$field['name']}', \$request->{$filterName});\n";
                        $filters .= "            }\n            \n";
                    } elseif ($field['type'] === 'text') {
                        $filters .= "            if (\$request->filled('{$filterName}')) {\n";
                        $filters .= "                \${$variableName}->where('{$field['name']}', 'like', '%' . \$request->{$filterName} . '%');\n";
                        $filters .= "            }\n            \n";
                    } else {
                        $filters .= "            if (\$request->filled('{$filterName}')) {\n";
                        if ($field['type'] === 'multiselect') {
                        $filters .= "                \$filterValues = \$request->{$filterName};\n";
                        $filters .= "                if (is_array(\$filterValues)) {\n";
                        $filters .= "                    \${$variableName}->where(function(\$query) use (\$filterValues) {\n";
                        $filters .= "                        foreach (\$filterValues as \$value) {\n";
                        $filters .= "                            \$query->orWhereJsonContains('{$field['name']}', \$value);\n";
                        $filters .= "                        }\n";
                        $filters .= "                    });\n";
                        $filters .= "                } else {\n";
                        $filters .= "                    \${$variableName}->whereJsonContains('{$field['name']}', \$filterValues);\n";
                        $filters .= "                }\n";
                        } else {
                            $filters .= "                \${$variableName}->where('{$field['name']}', \$request->{$filterName});\n";
                        }
                        $filters .= "            }\n            \n";
                    }
                }
            }
        }

        // Add date range filter
        $filters .= "            // Apply date range filter\n";
        $filters .= "            if (\$request->filled('date_from')) {\n";
        $filters .= "                \${$variableName}->whereDate('created_at', '>=', \$request->date_from);\n";
        $filters .= "            }\n";
        $filters .= "            if (\$request->filled('date_to')) {\n";
        $filters .= "                \${$variableName}->whereDate('created_at', '<=', \$request->date_to);\n";
        $filters .= "            }\n";

        return $filters;
    }

    public function generateFilterColumns()
    {
        $filterColumns = '';
        
        foreach ($this->fields as $field) {
            if ($field['mapping']['filterable'] && $field['mapping']['searchable']) {
                $filterColumns .= "                ->filterColumn('{$field['name']}', function(\$query, \$keyword) {\n";
                $filterColumns .= "                    \$query->where('{$field['name']}', 'like', \"%{\$keyword}%\");\n";
                $filterColumns .= "                })\n";
            }
        }
        
        return $filterColumns;
    }

    public function generateFilterOptions()
    {
        $filterOptions = '';
        
        foreach ($this->fields as $field) {
            if ($field['mapping']['filterable'] && isset($field['mapping']['filter_options'])) {
                $optionsVar = $field['name'] . 'Options';
                $filterOptions .= "        \${$optionsVar} = [\n";
                foreach ($field['mapping']['filter_options'] as $option) {
                    $filterOptions .= "            ['value' => '{$option['value']}', 'label' => '{$option['label']}'],\n";
                }
                $filterOptions .= "        ];\n\n";
            }
        }
        
        return $filterOptions;
    }

    public function generateFilterOptionsData()
    {
        $filterOptionsData = '';
        
        foreach ($this->fields as $field) {
            if ($field['mapping']['filterable'] && isset($field['mapping']['filter_options'])) {
                $optionsVar = $field['name'] . 'Options';
                $filterOptionsData .= "            '{$optionsVar}' => \${$optionsVar},\n";
            }
        }
        
        return $filterOptionsData;
    }
}