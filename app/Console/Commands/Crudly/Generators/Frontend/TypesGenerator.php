<?php

namespace App\Console\Commands\Crudly\Generators\Frontend;

use Illuminate\Support\Str;

class TypesGenerator
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
        $stub = file_get_contents(base_path('stubs/crudly/templates/frontend/pages/types.stub'));
        
        $interfaceFields = $this->generateInterfaceFields();
        $formDataFields = $this->generateFormDataFields();
        $indexProps = $this->generateIndexProps();

        $replacements = [
            '{{model_name}}' => $this->name,
            '{{singular_name}}' => $this->getSingularName(),
            '{{interface_fields}}' => $interfaceFields,
            '{{form_data_fields}}' => $formDataFields,
            '{{index_props}}' => $indexProps,
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $dir = resource_path("js/pages/{$this->getPluralRouteName()}");
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        file_put_contents("{$dir}/types.ts", $content);
    }

    protected function generateInterfaceFields()
    {
        $fields = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'switch') {
                $fields .= "    {$field['name']}: 'active' | 'inactive';\n";
            } elseif ($field['type'] === 'multiselect') {
                $fields .= "    {$field['name']}: string[];\n";
            } elseif ($field['type'] === 'relationship') {
                $fields .= "    {$field['name']}: number;\n";
            } elseif ($field['type'] === 'checkbox') {
                $fields .= "    {$field['name']}: boolean;\n";
            } elseif ($field['type'] === 'file-multi') {
                $fields .= "    {$field['name']}: string[];\n";
            } else {
                $fields .= "    {$field['name']}: string;\n";
            }
        }
        return $fields;
    }

    protected function generateFormDataFields()
    {
        $fields = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'switch') {
                $fields .= "    {$field['name']}: 'active' | 'inactive';\n";
            } elseif ($field['type'] === 'multiselect') {
                $fields .= "    {$field['name']}: string[];\n";
            } elseif ($field['type'] === 'relationship') {
                $fields .= "    {$field['name']}: number | null;\n";
            } elseif ($field['type'] === 'checkbox') {
                $fields .= "    {$field['name']}: boolean;\n";
            } elseif ($field['type'] === 'file-multi') {
                $fields .= "    {$field['name']}: string[];\n";
            } else {
                $fields .= "    {$field['name']}: string;\n";
            }
        }
        return $fields;
    }

    protected function generateIndexProps()
    {
        $props = '';
        $relatedModels = [];
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship') {
                $relatedModel = $field['mapping']['related_model'];
                $relatedVariable = Str::camel(Str::plural($relatedModel));
                if (!in_array($relatedVariable, $relatedModels)) {
                    $relatedModels[] = $relatedVariable;
                    $props .= "    {$relatedVariable}?: { id: number; name?: string; title?: string }[];\n";
                }
            }
            
            if ($field['mapping']['filterable']) {
                $optionsVar = $field['name'] . 'Options';
                $props .= "    {$optionsVar}?: { value: string; label: string }[];\n";
            }
        }
        return $props;
    }

    protected function getSingularName()
    {
        return Str::camel($this->name);
    }

    protected function getRouteName()
    {
        return Str::kebab(Str::plural($this->name));
    }
    
    protected function getPluralRouteName()
    {
        return Str::plural(Str::kebab($this->name));
    }
}