<?php

namespace App\Console\Commands\Crudly\Generators;

use App\Console\Commands\Crudly\Generators\Backend\MigrationGenerator;
use App\Console\Commands\Crudly\Generators\Backend\ValidationGenerator;
use Illuminate\Support\Str;

class BackendGenerator
{
    protected $name;
    protected $fields;
    protected $migrationGenerator;
    protected $validationGenerator;

    public function __construct($name, $fields)
    {
        $this->name = $name;
        $this->fields = $fields;
        $this->migrationGenerator = new MigrationGenerator($name, $fields);
        $this->validationGenerator = new ValidationGenerator($fields);
    }

    public function generateMigration()
    {
        $this->migrationGenerator->generate();
    }

    public function generateModel()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/backend/model.stub'));
        
        $fillableFields = $this->generateFillableFields();
        $castFields = $this->generateCastFields();
        $relationshipImports = $this->generateRelationshipImports();
        $relationshipMethods = $this->generateRelationshipMethods();

        $replacements = [
            '{{model_name}}' => $this->name,
            '{{fillable_fields}}' => $fillableFields,
            '{{cast_fields}}' => $castFields,
            '{{relationship_imports}}' => $relationshipImports,
            '{{relationship_methods}}' => $relationshipMethods,
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $path = app_path("Models/{$this->name}.php");
        file_put_contents($path, $content);
    }

    public function generateController()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/backend/controller.stub'));

        $replacements = [
            '{{model_name}}' => $this->name,
            '{{controller_name}}' => $this->name . 'Controller',
            '{{variable_name}}' => $this->getVariableName(),
            '{{singular_name}}' => $this->getSingularName(),
            '{{plural_name}}' => $this->getPluralName(),
            '{{permission_name}}' => $this->getPermissionName(),
            '{{route_name}}' => $this->getRouteName(),
            '{{table_name}}' => $this->getTableName(),
            '{{validation_rules}}' => $this->validationGenerator->generateRules(),
            '{{update_validation_rules}}' => $this->validationGenerator->generateUpdateRules($this->getTableName(), $this->getSingularName()),
            '{{filters}}' => $this->validationGenerator->generateFilters($this->getVariableName()),
            '{{filter_columns}}' => $this->validationGenerator->generateFilterColumns(),
            '{{filter_options}}' => $this->validationGenerator->generateFilterOptions(),
            '{{filter_options_data}}' => $this->validationGenerator->generateFilterOptionsData(),
            '{{relationship_imports}}' => $this->generateControllerRelationshipImports(),
            '{{relationship_with}}' => $this->generateControllerRelationshipWith(),
            '{{relationship_data}}' => $this->generateControllerRelationshipData(),
            '{{relationship_columns}}' => $this->generateRelationshipColumns(),
            '{{relationship_load_array}}' => $this->generateRelationshipLoadArray(),
            '{{relationship_multi_methods}}' => $this->generateRelationshipMultiMethods(),
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $path = app_path("Http/Controllers/{$this->name}Controller.php");
        file_put_contents($path, $content);
    }

    public function generateSeeder()
    {
        // This method is now handled by CrudlyGenerator::addToSeeder()
    }

    public function generateDataSeeder()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/backend/data-seeder.stub'));
        
        $replacements = [
            '{{model_name}}' => $this->name,
            '{{variable_name}}' => $this->getVariableName(),
            '{{singular_name}}' => $this->getSingularName(),
            '{{sample_data}}' => $this->generateSampleData(),
            '{{first_field}}' => $this->getFirstFieldName(),
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $path = database_path("seeders/{$this->name}Seeder.php");
        file_put_contents($path, $content);
    }

    protected function generateFillableFields()
    {
        $fields = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'date-range-picker') {
                $fields .= "        '{$field['name']}_start',\n";
                $fields .= "        '{$field['name']}_end',\n";
            } else {
                $fields .= "        '{$field['name']}',\n";
            }
        }
        return $fields;
    }

    protected function generateCastFields()
    {
        $fields = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'switch') {
                $fields .= "        '{$field['name']}' => 'string',\n";
            } elseif ($field['type'] === 'checkbox') {
                $fields .= "        '{$field['name']}' => 'boolean',\n";
            } elseif ($field['type'] === 'multiselect') {
                $fields .= "        '{$field['name']}' => 'array',\n";
            } elseif ($field['type'] === 'date-picker') {
                $fields .= "        '{$field['name']}' => 'date',\n";
            } elseif ($field['type'] === 'date-range-picker') {
                $fields .= "        '{$field['name']}_start' => 'date',\n";
                $fields .= "        '{$field['name']}_end' => 'date',\n";
            } elseif ($field['type'] === 'rating') {
                $fields .= "        '{$field['name']}' => 'integer',\n";
            } elseif ($field['type'] === 'currency') {
                $fields .= "        '{$field['name']}' => 'decimal:2',\n";
            } elseif ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $fields .= "        '{$field['name']}' => 'integer',\n";
            } elseif ($field['type'] === 'file-multi') {
                $fields .= "        '{$field['name']}' => 'array',\n";
            }
        }
        return $fields;
    }
    
    protected function generateSampleData()
    {
        $data = '';
        $firstField = $this->getFirstFieldName();
        for ($i = 1; $i <= 3; $i++) {
            $data .= "            ['{$firstField}' => 'Sample {$this->name} {$i}'";
            
            foreach ($this->fields as $field) {
                if ($field['name'] !== $firstField) {
                    if ($field['type'] === 'textarea') {
                        $data .= ", '{$field['name']}' => 'Sample description for {$this->name} {$i}'";
                    } elseif ($field['type'] === 'switch') {
                        // Use dynamic options from field mapping or fallback to active
                        $options = $field['mapping']['filter_options'] ?? [['value' => 'active'], ['value' => 'inactive']];
                        $selectedOption = $options[0]['value'] ?? 'active';
                        $data .= ", '{$field['name']}' => '{$selectedOption}'";
                    } elseif ($field['type'] === 'checkbox') {
                        $data .= ", '{$field['name']}' => " . ($i % 2 === 0 ? 'true' : 'false');
                    } elseif ($field['type'] === 'radio') {
                        $options = $field['mapping']['filter_options'] ?? [['value' => 'option1'], ['value' => 'option2'], ['value' => 'option3']];
                        $selectedOption = $options[($i - 1) % count($options)]['value'];
                        $data .= ", '{$field['name']}' => '{$selectedOption}'";
                    } elseif ($field['type'] === 'select') {
                        $options = $field['mapping']['filter_options'] ?? [['value' => 'option1'], ['value' => 'option2'], ['value' => 'option3']];
                        $selectedOption = $options[($i - 1) % count($options)]['value'];
                        $data .= ", '{$field['name']}' => '{$selectedOption}'";
                    } elseif ($field['type'] === 'multiselect') {
                        $options = $field['mapping']['filter_options'] ?? [['value' => 'tag1'], ['value' => 'tag2'], ['value' => 'tag3']];
                        $selectedOptions = array_slice($options, 0, ($i % 3) + 1);
                        $optionValues = array_map(function($opt) { return $opt['value']; }, $selectedOptions);
                        $data .= ", '{$field['name']}' => [" . implode(', ', array_map(function($v) { return "'{$v}'"; }, $optionValues)) . "]";
                    } elseif ($field['type'] === 'date-picker') {
                        $date = date('Y-m-d', strtotime("+{$i} days"));
                        $data .= ", '{$field['name']}' => '{$date}'";
                    } elseif ($field['type'] === 'date-range-picker') {
                        $startDate = date('Y-m-d', strtotime("+{$i} days"));
                        $endDate = date('Y-m-d', strtotime("+" . ($i + 7) . " days"));
                        $data .= ", '{$field['name']}_start' => '{$startDate}'";
                        $data .= ", '{$field['name']}_end' => '{$endDate}'";
                    } elseif ($field['type'] === 'time-picker') {
                        $hour = 9 + ($i % 8);
                        $data .= ", '{$field['name']}' => '{$hour}:00'";
                    } elseif ($field['type'] === 'rating') {
                        $rating = ($i % 5) + 1;
                        $data .= ", '{$field['name']}' => {$rating}";
                    } elseif ($field['type'] === 'color-picker') {
                        $colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
                        $color = $colors[($i - 1) % count($colors)];
                        $data .= ", '{$field['name']}' => '{$color}'";
                    } elseif ($field['type'] === 'currency') {
                        $amount = ($i * 25.99);
                        $data .= ", '{$field['name']}' => {$amount}";
                    } elseif ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                        $data .= ", '{$field['name']}' => {$i}";
                    } elseif ($field['type'] === 'image-single' || $field['type'] === 'file-single') {
                        $data .= ", '{$field['name']}' => 'sample-files/sample-{$i}.jpg'";
                    } elseif ($field['type'] === 'file-multi') {
                        $data .= ", '{$field['name']}' => ['sample-files/doc-{$i}-1.pdf', 'sample-files/doc-{$i}-2.pdf']";
                    } else {
                        $data .= ", '{$field['name']}' => 'Sample {$field['name']} {$i}'";
                    }
                }
            }
            
            $data .= "],\n";
        }
        return $data;
    }

    protected function getVariableName()
    {
        return Str::camel(Str::plural($this->name));
    }

    protected function getSingularName()
    {
        return Str::camel($this->name);
    }

    protected function getPluralName()
    {
        return Str::plural(Str::lower($this->name));
    }

    protected function getPermissionName()
    {
        return Str::snake(Str::lower($this->name));
    }

    protected function getRouteName()
    {
        return Str::kebab(Str::plural($this->name));
    }

    protected function getTableName()
    {
        return Str::snake(Str::plural($this->name));
    }
    
    protected function getFirstFieldName()
    {
        return $this->fields[0]['name'] ?? 'name';
    }
    
    protected function generateRelationshipImports()
    {
        $imports = '';
        $hasRelationships = false;
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $hasRelationships = true;
                break;
            }
        }
        
        if ($hasRelationships) {
            $imports = "use Illuminate\Database\Eloquent\Relations\BelongsTo;\n";
        }
        
        return $imports;
    }
    
    protected function generateRelationshipMethods()
    {
        $methods = '';
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relatedModel = $field['mapping']['related_model'];
                $methodName = Str::camel(str_replace('_id', '', $field['name']));
                
                $methods .= "    public function {$methodName}(): BelongsTo\n";
                $methods .= "    {\n";
                $methods .= "        return \$this->belongsTo({$relatedModel}::class);\n";
                $methods .= "    }\n\n";
            }
        }
        
        return $methods;
    }
    
    protected function generateControllerRelationshipImports()
    {
        $imports = '';
        $relatedModels = [];
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relatedModel = $field['mapping']['related_model'];
                if (!in_array($relatedModel, $relatedModels)) {
                    $relatedModels[] = $relatedModel;
                    $imports .= "use App\\Models\\{$relatedModel};\n";
                }
            }
        }
        
        return $imports;
    }
    
    protected function generateControllerRelationshipWith()
    {
        $relationships = [];
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relationshipName = Str::camel(str_replace('_id', '', $field['name']));
                $relationships[] = $relationshipName;
            }
        }
        
        if (empty($relationships)) {
            return '';
        }
        
        return '->with([\'' . implode("', '", $relationships) . "'])";
    }
    
    protected function generateControllerRelationshipData()
    {
        $data = '';
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relatedModel = $field['mapping']['related_model'];
                $relatedVariable = Str::camel(Str::plural($relatedModel));
                $data .= "            '{$relatedVariable}' => {$relatedModel}::all(),\n";
            }
        }
        
        return $data;
    }
    
    protected function generateRelationshipMultiMethods()
    {
        $methods = '';
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship-multi' && isset($field['mapping']['depends_on'])) {
                $relatedModel = $field['mapping']['related_model'];
                $relatedTable = $field['mapping']['related_table'];
                $dependsOn = $field['mapping']['depends_on'];
                $parentField = str_replace('_id', '', $dependsOn);
                
                $methods .= "\n\n    public function get" . ucfirst(Str::camel(Str::plural($relatedModel))) . "By" . ucfirst(Str::camel($parentField)) . "(Request \$request)\n";
                $methods .= "    {\n";
                $methods .= "        \$" . $parentField . "Id = \$request->get('" . $parentField . "_id');\n";
                $methods .= "        if (!\$" . $parentField . "Id) {\n";
                $methods .= "            return response()->json([]);\n";
                $methods .= "        }\n";
                $methods .= "        \n";
                $methods .= "        \$" . Str::camel(Str::plural($relatedModel)) . " = {$relatedModel}::where('{$dependsOn}', \$" . $parentField . "Id)->get(['id', 'name']);\n";
                $methods .= "        return response()->json(\$" . Str::camel(Str::plural($relatedModel)) . ");\n";
                $methods .= "    }";
            }
        }
        
        return $methods;
    }
    
    protected function generateRelationshipColumns()
    {
        $columns = '';
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relationshipName = Str::camel(str_replace('_id', '', $field['name']));
                $columnName = str_replace('_id', '', $field['name']) . '_name';
                
                $columns .= "                ->addColumn('{$columnName}', function (\${$this->getSingularName()}) {\n";
                $columns .= "                    return \${$this->getSingularName()}->{$relationshipName} ? \${$this->getSingularName()}->{$relationshipName}->name : null;\n";
                $columns .= "                })\n";
            }
        }
        
        return $columns;
    }
    
    protected function generateRelationshipLoadArray()
    {
        $relationships = [];
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relationshipName = Str::camel(str_replace('_id', '', $field['name']));
                $relationships[] = "'{$relationshipName}'";
            }
        }
        
        return implode(', ', $relationships);
    }
}