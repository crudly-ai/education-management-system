<?php

namespace App\Console\Commands\Crudly\Generators;

use Illuminate\Support\Str;

class TestGenerator
{
    protected $name;
    protected $fields;

    public function __construct($name, $fields)
    {
        $this->name = $name;
        $this->fields = $fields;
    }

    public function generateFactory()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/tests/factory.stub'));
        
        $replacements = [
            '{{model_name}}' => $this->name,
            '{{factory_definition}}' => $this->generateFactoryDefinition(),
            '{{factory_states}}' => $this->generateFactoryStates(),
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $path = database_path("factories/{$this->name}Factory.php");
        file_put_contents($path, $content);
    }

    public function generateUnitTest()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/tests/unit-test.stub'));
        
        $replacements = [
            '{{model_name}}' => $this->name,
            '{{variable_name}}' => $this->getVariableName(),
            '{{table_name}}' => $this->getTableName(),
            '{{test_data}}' => $this->generateUnitTestData(),
            '{{test_assertions}}' => $this->generateUnitTestAssertions(),
            '{{fillable_tests}}' => $this->generateFillableTests(),
            '{{cast_tests}}' => $this->generateCastTests(),
            '{{relationship_tests}}' => $this->generateRelationshipTests(),
            '{{attribute_tests}}' => $this->generateAttributeTests(),
            '{{factory_tests}}' => $this->generateFactoryTests(),
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $path = base_path("tests/Unit/{$this->name}Test.php");
        file_put_contents($path, $content);
    }

    public function generateFeatureTest()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/tests/feature-test.stub'));
        
        $replacements = [
            '{{model_name}}' => $this->name,
            '{{variable_name}}' => $this->getVariableName(),
            '{{table_name}}' => $this->getTableName(),
            '{{permission_name}}' => $this->getPermissionName(),
            '{{route_name}}' => $this->getRouteName(),
            '{{related_model_imports}}' => $this->generateRelatedModelImports(),
            '{{related_model_setup}}' => $this->generateRelatedModelSetup(),

            '{{create_data}}' => $this->generateCreateTestData(),
            '{{update_data}}' => $this->generateUpdateTestData(),
            '{{required_fields}}' => $this->generateRequiredFields(),

        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $path = base_path("tests/Feature/{$this->name}ControllerTest.php");
        file_put_contents($path, $content);
    }

    protected function generateFactoryDefinition()
    {
        $definition = '';
        
        foreach ($this->fields as $field) {
            $definition .= $this->generateFactoryField($field);
        }
        
        // Add created_by field
        $definition .= "            'created_by' => User::factory(),\n";
        
        return $definition;
    }

    protected function generateFactoryField($field)
    {
        $fieldName = $field['name'];
        
        switch ($field['type']) {
            case 'text':
                if (strpos($fieldName, 'name') !== false) {
                    return "            '{$fieldName}' => \$this->faker->name(),\n";
                } elseif (strpos($fieldName, 'title') !== false) {
                    return "            '{$fieldName}' => \$this->faker->jobTitle(),\n";
                } elseif (strpos($fieldName, 'email') !== false) {
                    return "            '{$fieldName}' => \$this->faker->unique()->safeEmail(),\n";
                } elseif (strpos($fieldName, 'phone') !== false) {
                    return "            '{$fieldName}' => \$this->faker->phoneNumber(),\n";
                } elseif (strpos($fieldName, 'address') !== false) {
                    return "            '{$fieldName}' => \$this->faker->address(),\n";
                } elseif (strpos($fieldName, 'city') !== false) {
                    return "            '{$fieldName}' => \$this->faker->city(),\n";
                } elseif (strpos($fieldName, 'country') !== false) {
                    return "            '{$fieldName}' => \$this->faker->country(),\n";
                } else {
                    return "            '{$fieldName}' => \$this->faker->words(3, true),\n";
                }
                
            case 'textarea':
                return "            '{$fieldName}' => \$this->faker->paragraph(),\n";
                
            case 'switch':
                $options = $field['mapping']['filter_options'] ?? [['value' => 'active'], ['value' => 'inactive']];
                $optionValues = array_map(function($opt) { return "'{$opt['value']}'"; }, $options);
                return "            '{$fieldName}' => \$this->faker->randomElement([" . implode(', ', $optionValues) . "]),\n";
                
            case 'checkbox':
                return "            '{$fieldName}' => \$this->faker->boolean(),\n";
                
            case 'select':
            case 'radio':
                $options = $field['mapping']['filter_options'] ?? [['value' => 'option1'], ['value' => 'option2']];
                $optionValues = array_map(function($opt) { return "'{$opt['value']}'"; }, $options);
                return "            '{$fieldName}' => \$this->faker->randomElement([" . implode(', ', $optionValues) . "]),\n";
                
            case 'multiselect':
                return "            '{$fieldName}' => \$this->faker->randomElements(['tag1', 'tag2', 'tag3'], \$this->faker->numberBetween(1, 3)),\n";
                
            case 'date-picker':
                return "            '{$fieldName}' => \$this->faker->date(),\n";
                
            case 'time-picker':
                return "            '{$fieldName}' => \$this->faker->time(),\n";
                
            case 'rating':
                return "            '{$fieldName}' => \$this->faker->numberBetween(1, 5),\n";
                
            case 'color-picker':
                return "            '{$fieldName}' => \$this->faker->hexColor(),\n";
                
            case 'currency':
                return "            '{$fieldName}' => \$this->faker->randomFloat(2, 100, 10000),\n";
                
            case 'relationship':
            case 'relationship-multi':
                $relatedModel = $field['mapping']['related_model'];
                return "            '{$fieldName}' => {$relatedModel}::factory(),\n";
                
            case 'image-single':
            case 'file-single':
                return "            '{$fieldName}' => \$this->faker->imageUrl(),\n";
                
            case 'file-multi':
                return "            '{$fieldName}' => [\$this->faker->imageUrl(), \$this->faker->imageUrl()],\n";
                
            default:
                return "            '{$fieldName}' => \$this->faker->words(2, true),\n";
        }
    }

    protected function generateFactoryStates()
    {
        $states = '';
        
        // Find status/switch fields to create states
        foreach ($this->fields as $field) {
            if ($field['type'] === 'switch' && isset($field['mapping']['filter_options'])) {
                foreach ($field['mapping']['filter_options'] as $option) {
                    $stateName = Str::camel($option['value']);
                    $states .= "\n    public function {$stateName}(): static\n";
                    $states .= "    {\n";
                    $states .= "        return \$this->state(fn (array \$attributes) => [\n";
                    $states .= "            '{$field['name']}' => '{$option['value']}',\n";
                    $states .= "        ]);\n";
                    $states .= "    }\n";
                }
                break; // Only create states for the first switch field
            }
        }
        
        return $states;
    }

    protected function generateFillableTests()
    {
        $fillableFields = [];
        foreach ($this->fields as $field) {
            $fillableFields[] = "'{$field['name']}'";
        }
        $fillableFields[] = "'created_by'";
        
        $tests = '';
        foreach ($fillableFields as $field) {
            $tests .= "        \$this->assertContains({$field}, \${$this->getVariableName()}->getFillable());\n";
        }
        
        return $tests;
    }

    protected function generateCastTests()
    {
        $tests = '';
        
        foreach ($this->fields as $field) {
            $castType = $this->getCastType($field);
            if ($castType) {
                $tests .= "        \$this->assertEquals('{$castType}', \$casts['{$field['name']}']);\n";
            }
        }
        
        return $tests;
    }

    protected function getCastType($field)
    {
        switch ($field['type']) {
            case 'switch':
                return 'string';
            case 'checkbox':
                return 'boolean';
            case 'multiselect':
            case 'file-multi':
                return 'array';
            case 'date-picker':
                return 'date';
            case 'rating':
                return 'integer';
            case 'currency':
                return 'decimal:2';
            default:
                return null;
        }
    }

    protected function generateRelationshipTests()
    {
        $tests = '';
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relatedModel = $field['mapping']['related_model'];
                $relationshipName = Str::camel(str_replace('_id', '', $field['name']));
                
                $tests .= "\n    public function test_{$this->getVariableName()}_belongs_to_{$relationshipName}()\n";
                $tests .= "    {\n";
                $tests .= "        \${$relationshipName} = {$relatedModel}::factory()->create();\n";
                $tests .= "        \${$this->getVariableName()} = {$this->name}::factory()->create(['{$field['name']}' => \${$relationshipName}->id]);\n";
                $tests .= "        \n";
                $tests .= "        \$this->assertInstanceOf({$relatedModel}::class, \${$this->getVariableName()}->{$relationshipName});\n";
                $tests .= "        \$this->assertEquals(\${$relationshipName}->id, \${$this->getVariableName()}->{$relationshipName}->id);\n";
                $tests .= "    }\n";
            }
        }
        
        return $tests;
    }

    protected function generateAttributeTests()
    {
        $tests = '';
        
        // Check for common attribute patterns
        $hasFirstLastName = false;
        foreach ($this->fields as $field) {
            if ($field['name'] === 'first_name') {
                foreach ($this->fields as $otherField) {
                    if ($otherField['name'] === 'last_name') {
                        $hasFirstLastName = true;
                        break;
                    }
                }
                break;
            }
        }
        
        if ($hasFirstLastName) {
            $tests .= "\n    public function test_{$this->getVariableName()}_full_name_attribute()\n";
            $tests .= "    {\n";
            $tests .= "        \${$this->getVariableName()} = {$this->name}::factory()->create([\n";
            $tests .= "            'first_name' => 'John',\n";
            $tests .= "            'last_name' => 'Doe'\n";
            $tests .= "        ]);\n";
            $tests .= "        \n";
            $tests .= "        \$this->assertEquals('John Doe', \${$this->getVariableName()}->full_name);\n";
            $tests .= "    }\n";
        }
        
        return $tests;
    }

    protected function generateFactoryTests()
    {
        $tests = "\n    public function test_{$this->getVariableName()}_factory_creates_valid_{$this->getVariableName()}()\n";
        $tests .= "    {\n";
        $tests .= "        \${$this->getVariableName()} = {$this->name}::factory()->create();\n\n";
        
        // Test key fields are not null
        foreach ($this->fields as $field) {
            if (in_array($field['type'], ['text', 'textarea']) && strpos($field['validation'], 'required') !== false) {
                $tests .= "        \$this->assertNotNull(\${$this->getVariableName()}->{$field['name']});\n";
            }
        }
        
        $tests .= "        \$this->assertNotNull(\${$this->getVariableName()}->created_by);\n";
        $tests .= "    }\n";
        
        // Add state tests
        foreach ($this->fields as $field) {
            if ($field['type'] === 'switch' && isset($field['mapping']['filter_options'])) {
                foreach ($field['mapping']['filter_options'] as $option) {
                    $stateName = Str::camel($option['value']);
                    $tests .= "\n    public function test_{$this->getVariableName()}_factory_{$stateName}_state()\n";
                    $tests .= "    {\n";
                    $tests .= "        \${$this->getVariableName()} = {$this->name}::factory()->{$stateName}()->create();\n\n";
                    $tests .= "        \$this->assertEquals('{$option['value']}', \${$this->getVariableName()}->{$field['name']});\n";
                    $tests .= "    }\n";
                }
                break;
            }
        }
        
        return $tests;
    }

    protected function generateValidationTests()
    {
        $tests = '';
        
        // Test unique fields
        foreach ($this->fields as $field) {
            if (strpos($field['validation'], 'unique') !== false) {
                $tests .= "\n    public function test_store_validates_unique_{$field['name']}()\n";
                $tests .= "    {\n";
                $tests .= "        \$user = User::factory()->create();\n";
                $tests .= "        \$user->givePermissionTo('create_{{permission_name}}');\n";
                $tests .= "        \n";
                $tests .= "        {$this->name}::factory()->create(['{$field['name']}' => 'duplicate-value']);\n";
                $tests .= "        \n";
                $tests .= "        \$data = " . $this->generateCreateTestData() . ";\n";
                $tests .= "        \$data['{$field['name']}'] = 'duplicate-value';\n";
                $tests .= "        \n";
                $tests .= "        \$response = \$this->actingAs(\$user)->post('/{{route_name}}', \$data);\n";
                $tests .= "        \n";
                $tests .= "        \$response->assertSessionHasErrors(['{$field['name']}']);\n";
                $tests .= "    }\n";
            }
        }
        
        // Test enum validation
        foreach ($this->fields as $field) {
            if ($field['type'] === 'switch' && isset($field['mapping']['filter_options'])) {
                $tests .= "\n    public function test_store_validates_{$field['name']}_enum()\n";
                $tests .= "    {\n";
                $tests .= "        \$user = User::factory()->create();\n";
                $tests .= "        \$user->givePermissionTo('create_{{permission_name}}');\n";
                $tests .= "        \n";
                $tests .= "        \$data = " . $this->generateCreateTestData() . ";\n";
                $tests .= "        \$data['{$field['name']}'] = 'invalid_value';\n";
                $tests .= "        \n";
                $tests .= "        \$response = \$this->actingAs(\$user)->post('/{{route_name}}', \$data);\n";
                $tests .= "        \n";
                $tests .= "        \$response->assertSessionHasErrors(['{$field['name']}']);\n";
                $tests .= "    }\n";
                break;
            }
        }
        
        return $tests;
    }

    protected function generateCreateTestData()
    {
        $data = "[\n";
        
        foreach ($this->fields as $field) {
            $data .= $this->generateTestDataField($field);
        }
        
        $data .= "        ]";
        return $data;
    }

    protected function generateUpdateTestData()
    {
        return $this->generateCreateTestData();
    }

    protected function generateTestDataField($field)
    {
        $fieldName = $field['name'];
        
        switch ($field['type']) {
            case 'text':
                if (strpos($fieldName, 'email') !== false) {
                    return "            '{$fieldName}' => 'test@example.com',\n";
                } else {
                    return "            '{$fieldName}' => 'Test " . Str::title(str_replace('_', ' ', $fieldName)) . "',\n";
                }
                
            case 'textarea':
                return "            '{$fieldName}' => 'Test description',\n";
                
            case 'switch':
                $options = $field['mapping']['filter_options'] ?? [['value' => 'active']];
                return "            '{$fieldName}' => '{$options[0]['value']}',\n";
                
            case 'checkbox':
                return "            '{$fieldName}' => true,\n";
                
            case 'select':
            case 'radio':
                $options = $field['mapping']['filter_options'] ?? [['value' => 'option1']];
                return "            '{$fieldName}' => '{$options[0]['value']}',\n";
                
            case 'date-picker':
                return "            '{$fieldName}' => '2024-01-01',\n";
                
            case 'time-picker':
                return "            '{$fieldName}' => '09:00',\n";
                
            case 'rating':
                return "            '{$fieldName}' => 5,\n";
                
            case 'currency':
                return "            '{$fieldName}' => 100.00,\n";
                
            case 'relationship':
            case 'relationship-multi':
                $relatedModel = $field['mapping']['related_model'];
                return "            '{$fieldName}' => \${$this->getRelatedVariableName($relatedModel)}->id,\n";
                
            default:
                return "            '{$fieldName}' => 'Test Value',\n";
        }
    }

    protected function generateRequiredFields()
    {
        $requiredFields = [];
        
        foreach ($this->fields as $field) {
            if (strpos($field['validation'], 'required') !== false) {
                $requiredFields[] = "'{$field['name']}'";
            }
        }
        
        return '[' . implode(', ', $requiredFields) . ']';
    }

    protected function generateUniqueFieldTests()
    {
        return $this->generateValidationTests();
    }

    protected function getVariableName()
    {
        return Str::camel($this->name);
    }

    protected function getPermissionName()
    {
        return Str::snake(Str::lower($this->name));
    }

    protected function getRouteName()
    {
        return Str::kebab(Str::plural($this->name));
    }

    protected function getRelatedVariableName($modelName)
    {
        return Str::camel($modelName);
    }

    protected function getTableName()
    {
        return Str::snake(Str::plural($this->name));
    }

    protected function generateUnitTestData()
    {
        $data = '';
        foreach ($this->fields as $field) {
            if (strpos($field['validation'], 'required') !== false) {
                $data .= $this->generateTestDataField($field);
            }
        }
        $data .= "            'created_by' => \$user->id,\n";
        return $data;
    }

    protected function generateUnitTestAssertions()
    {
        $assertions = '';
        foreach ($this->fields as $field) {
            if (strpos($field['validation'], 'required') !== false) {
                if ($field['type'] === 'text' && strpos($field['name'], 'name') !== false) {
                    $assertions .= "            '{$field['name']}' => 'Test " . Str::title(str_replace('_', ' ', $field['name'])) . "',\n";
                }
            }
        }
        $assertions .= "            'created_by' => \$user->id,\n";
        return $assertions;
    }

    protected function generateRelatedModelImports()
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

    protected function generateRelatedModelSetup()
    {
        $setup = '';
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relatedModel = $field['mapping']['related_model'];
                $variableName = $this->getRelatedVariableName($relatedModel);
                $setup .= "        \${$variableName} = {$relatedModel}::factory()->create();\n";
            }
        }
        
        return $setup;
    }
}