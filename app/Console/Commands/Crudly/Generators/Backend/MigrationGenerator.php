<?php

namespace App\Console\Commands\Crudly\Generators\Backend;

use Illuminate\Support\Str;

class MigrationGenerator
{
    protected $name;
    protected $fields;

    public function __construct($name, $fields)
    {
        $this->name = $name;
        $this->fields = $fields;
    }

    public function generate()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/backend/migration.stub'));
        
        $migrationFields = $this->generateMigrationFields();

        $replacements = [
            '{{table_name}}' => Str::snake(Str::plural($this->name)),
            '{{migration_fields}}' => $migrationFields,
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        // Add delay for tables with relationships to ensure proper order
        $hasRelationships = $this->hasRelationshipFields();
        $timestamp = date('Y_m_d_His');
        if ($hasRelationships) {
            sleep(1); // Ensure different timestamp for dependent tables
            $timestamp = date('Y_m_d_His');
        }
        
        $filename = "{$timestamp}_create_" . Str::snake(Str::plural($this->name)) . "_table.php";
        $path = database_path("migrations/{$filename}");
        
        file_put_contents($path, $content);
    }
    
    protected function hasRelationshipFields()
    {
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                return true;
            }
        }
        return false;
    }

    protected function generateMigrationFields()
    {
        $fields = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'date-range-picker') {
                // Handle dual fields for date range picker
                $migrationField = str_replace('{{name}}', $field['name'], $field['mapping']['migration']);
                $fields .= "            \$table->{$migrationField};\n";
            } else {
                $migrationField = str_replace('{{name}}', $field['name'], $field['mapping']['migration']);
                
                // For radio fields, extract enum values from validation
                if ($field['type'] === 'radio' && isset($field['mapping']['validation'])) {
                    if (preg_match('/in:([^|]+)/', $field['mapping']['validation'], $matches)) {
                        $options = explode(',', $matches[1]);
                        $enumValues = "['" . implode("', '", array_map('trim', $options)) . "']";
                        $defaultValue = trim($options[0]);
                        $migrationField = "enum('{$field['name']}', {$enumValues})->default('{$defaultValue}')";
                    }
                }
                
                $fields .= "            \$table->{$migrationField};\n";
            }
        }
        return $fields;
    }
}