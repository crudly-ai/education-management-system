<?php

namespace App\Console\Commands\Crudly\Generators;

use App\Console\Commands\Crudly\Generators\Frontend\TypesGenerator;
use App\Console\Commands\Crudly\Generators\Frontend\FormGenerator;
use App\Console\Commands\Crudly\Generators\Frontend\TableGenerator;
use Illuminate\Support\Str;

class FrontendGenerator
{
    protected $name;
    protected $fields;
    protected $icon;
    protected $typesGenerator;
    protected $formGenerator;
    protected $tableGenerator;

    public function __construct($name, $fields, $icon = 'Building2')
    {
        $this->name = $name;
        $this->fields = $fields;
        $this->icon = $icon;
        $this->typesGenerator = new TypesGenerator($name, $fields);
        $this->formGenerator = new FormGenerator($name, $fields);
        $this->tableGenerator = new TableGenerator($name, $fields);
    }

    public function generateTypes()
    {
        $this->typesGenerator->generate();
    }

    public function generateIndex()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/frontend/pages/index.stub'));
        
        $replacements = [
            '{{imports}}' => $this->tableGenerator->generateImports(),
            '{{model_name}}' => $this->name,
            '{{singular_name}}' => $this->getSingularName(),
            '{{plural_name}}' => $this->getPluralName(),
            '{{plural_name_title}}' => ucfirst($this->getPluralName()),
            '{{route_name}}' => $this->getRouteName(),
            '{{permission_name}}' => $this->getPermissionName(),
            '{{columns}}' => $this->tableGenerator->generateColumns(),
            '{{filters}}' => $this->tableGenerator->generateFilters(),
            '{{filter_options_data}}' => $this->tableGenerator->generateFilterOptionsData(),
            '{{grid_item}}' => $this->generateGridItem(),
            '{{relationship_multi_filter_states}}' => $this->generateRelationshipMultiFilterStates(),
            '{{relationship_multi_filter_effects}}' => $this->generateRelationshipMultiFilterEffects(),
            '{{icon_name}}' => $this->icon,
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $dir = resource_path("js/pages/{$this->getPluralRouteName()}");
        file_put_contents("{$dir}/index.tsx", $content);
    }

    public function generateCreate()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/frontend/pages/create.stub'));
        
        $replacements = [
            '{{imports}}' => $this->formGenerator->generateImports(),
            '{{model_name}}' => $this->name,
            '{{singular_name}}' => $this->getSingularName(),
            '{{route_name}}' => $this->getRouteName(),
            '{{form_fields}}' => $this->formGenerator->generateFields(),
            '{{form_data}}' => $this->formGenerator->generateFormData(),
            '{{relationship_multi_states}}' => $this->generateRelationshipMultiStates(),
            '{{relationship_multi_effects}}' => $this->generateRelationshipMultiEffects(),
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $dir = resource_path("js/pages/{$this->getPluralRouteName()}");
        file_put_contents("{$dir}/create.tsx", $content);
    }

    public function generateEdit()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/frontend/pages/edit.stub'));
        
        $replacements = [
            '{{imports}}' => $this->formGenerator->generateImports(),
            '{{model_name}}' => $this->name,
            '{{singular_name}}' => $this->getSingularName(),
            '{{route_name}}' => $this->getRouteName(),
            '{{form_fields}}' => $this->formGenerator->generateFields(),
            '{{form_data}}' => $this->formGenerator->generateFormData(),
            '{{set_form_data}}' => $this->formGenerator->generateSetFormData(),
            '{{relationship_multi_states}}' => $this->generateRelationshipMultiStates(),
            '{{relationship_multi_effects}}' => $this->generateRelationshipMultiEffects(),
            '{{relationship_multi_initial_load}}' => $this->generateRelationshipMultiInitialLoad(),
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $dir = resource_path("js/pages/{$this->getPluralRouteName()}");
        file_put_contents("{$dir}/edit.tsx", $content);
    }

    public function generateView()
    {
        $stub = file_get_contents(base_path('stubs/crudly/templates/frontend/pages/view.stub'));
        
        $replacements = [
            '{{model_name}}' => $this->name,
            '{{singular_name}}' => $this->getSingularName(),
            '{{view_fields}}' => $this->generateViewFields(),
        ];

        $content = str_replace(array_keys($replacements), array_values($replacements), $stub);
        
        $dir = resource_path("js/pages/{$this->getPluralRouteName()}");
        file_put_contents("{$dir}/view.tsx", $content);
    }

    protected function generateViewFields()
    {
        $fields = '';
        foreach ($this->fields as $field) {
            $fieldName = $field['name'];
            $fieldLabel = $field['type'] === 'relationship' || $field['type'] === 'relationship-multi' 
                ? $field['mapping']['related_model'] 
                : ucfirst(str_replace('_', ' ', $fieldName));
            
            $fields .= "                        <div>\n";
            $fields .= "                            <h3 className=\"text-sm font-medium text-gray-500\">{t('" . $fieldLabel . "')}</h3>\n";
            
            if ($field['type'] === 'switch') {
                $fields .= "                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize \${\n";
                $fields .= "                                {$this->getSingularName()}.{$fieldName} === 'active' \n";
                $fields .= "                                    ? 'bg-green-100 text-green-800' \n";
                $fields .= "                                    : 'bg-red-100 text-red-800'\n";
                $fields .= "                            }`}>\n";
                $fields .= "                                {{$this->getSingularName()}.{$fieldName}}\n";
                $fields .= "                            </span>\n";
            } else if ($field['type'] === 'textarea') {
                $fields .= "                            <p className=\"mt-1 text-sm text-gray-900\">\n";
                $fields .= "                                {{$this->getSingularName()}.{$fieldName} || t('No description provided')}\n";
                $fields .= "                            </p>\n";
            } else if ($field['type'] === 'relationship' || $field['type'] === 'relationship-multi') {
                $relationshipName = str_replace('_id', '', $fieldName);
                $fields .= "                            <p className=\"mt-1 text-sm text-gray-900\">\n";
                $fields .= "                                {{$this->getSingularName()}.{$relationshipName}?.name || {$this->getSingularName()}.{$relationshipName}?.title || '-'}\n";
                $fields .= "                            </p>\n";
            } else {
                $fields .= "                            <p className=\"mt-1 text-sm text-gray-900\">{{$this->getSingularName()}.{$fieldName}}</p>\n";
            }
            
            $fields .= "                        </div>\n                        \n";
        }
        
        return $fields;
    }

    protected function generateGridItem()
    {
        // Find key fields for display
        $titleField = $this->findTitleField();
        $subtitleField = $this->findSubtitleField();
        $statusFields = $this->findStatusFields();
        $displayFields = $this->findDisplayFields();
        $imageField = $this->findImageField();
        
        $gridItem = "        <Card className=\"bg-white border hover:shadow-md transition-shadow\">\n";
        $gridItem .= "            <CardContent className=\"p-4\">\n";
        $gridItem .= "                <div className=\"space-y-3\">\n";
        
        // Header with icon/image, title, subtitle and actions
        $gridItem .= "                    <div className=\"flex items-start gap-3\">\n";
        
        // Icon or Image
        if ($imageField) {
            $gridItem .= "                        <div className=\"w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0\">\n";
            $gridItem .= "                            {{$this->getSingularName()}.{$imageField['name']} ? (\n";
            $gridItem .= "                                <img \n";
            $gridItem .= "                                    src={`/storage/\${{$this->getSingularName()}.{$imageField['name']}}`} \n";
            $gridItem .= "                                    alt=\"Image\" \n";
            $gridItem .= "                                    className=\"w-full h-full object-cover\"\n";
            $gridItem .= "                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}\n";
            $gridItem .= "                                />\n";
            $gridItem .= "                            ) : null}\n";
            $gridItem .= "                            <div className=\"w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center\" style={{display: {$this->getSingularName()}.{$imageField['name']} ? 'none' : 'flex'}}>\n";
            $gridItem .= "                                <{$this->icon} className=\"h-6 w-6 text-blue-600\" />\n";
            $gridItem .= "                            </div>\n";
            $gridItem .= "                        </div>\n";
        } else {
            $gridItem .= "                        <div className=\"w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-blue-200 flex-shrink-0\">\n";
            $gridItem .= "                            <{$this->icon} className=\"h-6 w-6 text-blue-600\" />\n";
            $gridItem .= "                        </div>\n";
        }
        
        // Title and subtitle
        $gridItem .= "                        <div className=\"flex-1 min-w-0\">\n";
        $gridItem .= "                            <h3 className=\"font-semibold text-gray-900 truncate text-sm leading-tight\">\n";
        $gridItem .= "                                {{$this->getSingularName()}.{$titleField} || `{$this->name} #\${{$this->getSingularName()}.id}`}\n";
        $gridItem .= "                            </h3>\n";
        
        if ($subtitleField) {
            $gridItem .= "                            <p className=\"text-xs text-gray-500 truncate mt-0.5\">\n";
            if ($subtitleField['type'] === 'relationship') {
                $relationshipName = Str::camel(str_replace('_id', '', $subtitleField['name']));
                $gridItem .= "                                {{$this->getSingularName()}.{$relationshipName}?.name || {$this->getSingularName()}.{$relationshipName}?.title || '-'}\n";
            } else {
                $gridItem .= "                                {{$this->getSingularName()}.{$subtitleField['name']} || '-'}\n";
            }
            $gridItem .= "                            </p>\n";
        } else {
            $gridItem .= "                            <p className=\"text-xs text-gray-500\">{t('" . ucfirst($this->name) . "')}</p>\n";
        }
        $gridItem .= "                        </div>\n";
        
        // Actions
        $gridItem .= "                        <div className=\"flex items-center gap-1 flex-shrink-0\">\n";
        $gridItem .= "                            {customRowActions({$this->getSingularName()})}\n";
        $gridItem .= "                        </div>\n";
        $gridItem .= "                    </div>\n";
        
        // Status badges and key info
        if (!empty($statusFields) || !empty($displayFields)) {
            $gridItem .= "                    \n";
            $gridItem .= "                    <div className=\"space-y-2\">\n";
            
            // Status badges
            if (!empty($statusFields)) {
                $gridItem .= "                        <div className=\"flex flex-wrap gap-1\">\n";
                foreach ($statusFields as $field) {
                    $gridItem .= $this->generateFieldDisplay($field, 'badge');
                }
                $gridItem .= "                        </div>\n";
            }
            
            // Display fields
            if (!empty($displayFields)) {
                $gridItem .= "                        <div className=\"grid grid-cols-2 gap-2 text-xs\">\n";
                foreach ($displayFields as $field) {
                    $gridItem .= "                            <div className=\"flex justify-between\">\n";
                    $gridItem .= "                                <span className=\"text-gray-600 truncate\">" . $this->formatFieldName($field['name']) . ":</span>\n";
                    $gridItem .= "                                <span className=\"font-medium text-gray-900 truncate ml-1\">\n";
                    $gridItem .= $this->generateFieldDisplay($field, 'inline');
                    $gridItem .= "                                </span>\n";
                    $gridItem .= "                            </div>\n";
                }
                $gridItem .= "                        </div>\n";
            }
            
            $gridItem .= "                    </div>\n";
        }
        
        // Footer
        $gridItem .= "                    \n";
        $gridItem .= "                    <div className=\"flex items-center justify-between text-xs text-gray-500 pt-2 border-t\">\n";
        $gridItem .= "                        <div className=\"flex items-center gap-1\">\n";
        $gridItem .= "                            <{$this->icon} className=\"h-3 w-3\" />\n";
        $gridItem .= "                            <span>{t('" . ucfirst($this->name) . "')}</span>\n";
        $gridItem .= "                        </div>\n";
        $gridItem .= "                        <div className=\"flex items-center gap-1\">\n";
        $gridItem .= "                            <Calendar className=\"h-3 w-3\" />\n";
        $gridItem .= "                            <span>{formatDate({$this->getSingularName()}.created_at_formatted)}</span>\n";
        $gridItem .= "                        </div>\n";
        $gridItem .= "                    </div>\n";
        $gridItem .= "                </div>\n";
        $gridItem .= "            </CardContent>\n";
        $gridItem .= "        </Card>";
        
        return $gridItem;
    }
    
    protected function findTitleField()
    {
        // Priority: name, title, label, first text field, first field
        $priorities = ['name', 'title', 'label'];
        
        foreach ($priorities as $priority) {
            foreach ($this->fields as $field) {
                if ($field['name'] === $priority && !isset($field['mapping']['hidden'])) {
                    return $field['name'];
                }
            }
        }
        
        // Find first text field
        foreach ($this->fields as $field) {
            if ($field['type'] === 'text' && !isset($field['mapping']['hidden'])) {
                return $field['name'];
            }
        }
        
        // Return first field
        return $this->fields[0]['name'] ?? 'id';
    }
    
    protected function findSubtitleField()
    {
        // Priority: description, subtitle, summary, first textarea, first relationship
        $priorities = ['description', 'subtitle', 'summary', 'email', 'phone'];
        
        foreach ($priorities as $priority) {
            foreach ($this->fields as $field) {
                if ($field['name'] === $priority && !isset($field['mapping']['hidden'])) {
                    return $field;
                }
            }
        }
        
        // Find first textarea or relationship
        foreach ($this->fields as $field) {
            if (($field['type'] === 'textarea' || $field['type'] === 'relationship') && !isset($field['mapping']['hidden'])) {
                return $field;
            }
        }
        
        return null;
    }
    
    protected function findStatusFields()
    {
        $statusFields = [];
        foreach ($this->fields as $field) {
            if (in_array($field['type'], ['switch', 'select', 'radio', 'checkbox']) && !isset($field['mapping']['hidden'])) {
                $statusFields[] = $field;
            }
        }
        return array_slice($statusFields, 0, 3); // Limit to 3 status fields
    }
    
    protected function findDisplayFields()
    {
        $displayFields = [];
        $excludeTypes = ['textarea', 'switch', 'select', 'radio', 'checkbox', 'image-single', 'file-single', 'file-multi'];
        $titleField = $this->findTitleField();
        $subtitleField = $this->findSubtitleField();
        
        foreach ($this->fields as $field) {
            // Skip if it's already used as title/subtitle or is a status field
            if ($field['name'] === $titleField || 
                ($subtitleField && $field['name'] === $subtitleField['name']) ||
                in_array($field['type'], $excludeTypes) ||
                isset($field['mapping']['hidden'])) {
                continue;
            }
            
            $displayFields[] = $field;
        }
        
        return array_slice($displayFields, 0, 4); // Limit to 4 display fields
    }
    
    protected function findImageField()
    {
        foreach ($this->fields as $field) {
            if ($field['type'] === 'image-single' && !isset($field['mapping']['hidden'])) {
                return $field;
            }
        }
        return null;
    }
    
    protected function generateFieldDisplay($field, $context = 'inline')
    {
        $fieldName = $field['name'];
        $singularName = $this->getSingularName();
        
        switch ($field['type']) {
            case 'switch':
                if ($context === 'badge') {
                    return "                            <Badge variant={{$singularName}.{$fieldName} === 'active' ? 'default' : 'secondary'} className=\"text-xs px-2 py-0.5 capitalize\">\n" .
                           "                                {{$singularName}.{$fieldName}}\n" .
                           "                            </Badge>\n";
                } else {
                    return "{{$singularName}.{$fieldName}}";
                }
                
            case 'select':
            case 'radio':
                if ($context === 'badge') {
                    return "                            <Badge variant=\"outline\" className=\"text-xs px-2 py-0.5 capitalize\">\n" .
                           "                                {{$singularName}.{$fieldName}}\n" .
                           "                            </Badge>\n";
                } else {
                    return "{{$singularName}.{$fieldName}}";
                }
                
            case 'checkbox':
                if ($context === 'badge') {
                    return "                            <Badge variant={{$singularName}.{$fieldName} ? 'default' : 'secondary'} className=\"text-xs px-2 py-0.5\">\n" .
                           "                                {{$singularName}.{$fieldName} ? 'Yes' : 'No'}\n" .
                           "                            </Badge>\n";
                } else {
                    return "{{$singularName}.{$fieldName} ? 'Yes' : 'No'}";
                }
                
            case 'currency':
                return "{{$singularName}.{$fieldName} ? `$\${{$singularName}.{$fieldName}}` : '-'}";
                
            case 'rating':
                return "{{$singularName}.{$fieldName} ? `\${{$singularName}.{$fieldName}}/5 ⭐` : '-'}";
                
            case 'date-picker':
                return "{{$singularName}.{$fieldName} ? formatDate({$singularName}.{$fieldName}) : '-'}";
                
            case 'relationship':
                $relationshipName = Str::camel(str_replace('_id', '', $fieldName));
                return "{{$singularName}.{$relationshipName}?.name || {$singularName}.{$relationshipName}?.title || '-'}";
                
            case 'color-picker':
                return "{{$singularName}.{$fieldName} || '-'}";
                
            default:
                return "{{$singularName}.{$fieldName} || '-'}";
        }
    }
    
    protected function formatFieldName($fieldName)
    {
        return Str::title(str_replace('_', ' ', $fieldName));
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
    
    protected function getPluralRouteName()
    {
        return Str::plural(Str::kebab($this->name));
    }

    protected function generateRelationshipMultiStates()
    {
        $states = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship-multi' && isset($field['mapping']['depends_on'])) {
                $fieldName = Str::camel(Str::plural($field['mapping']['related_model']));
                $states .= "    const [{$fieldName}, set" . ucfirst($fieldName) . "] = useState([]);\n";
            }
        }
        return $states;
    }

    protected function generateRelationshipMultiEffects()
    {
        $effects = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship-multi' && isset($field['mapping']['depends_on'])) {
                $dependsOn = $field['mapping']['depends_on'];
                $fieldName = Str::camel(Str::plural($field['mapping']['related_model']));
                $relatedTable = $field['mapping']['related_table'];
                
                $effects .= "\n    // Fetch {$fieldName} when {$dependsOn} changes\n";
                $effects .= "    useEffect(() => {\n";
                $effects .= "        if (data.{$dependsOn}) {\n";
                $effects .= "            fetch(`/api/{$relatedTable}-by-" . str_replace('_id', '', $dependsOn) . "?" . str_replace('_id', '', $dependsOn) . "_id=\${data.{$dependsOn}}`)\n";
                $effects .= "                .then(res => res.json())\n";
                $effects .= "                .then(data => set" . ucfirst($fieldName) . "(data))\n";
                $effects .= "                .catch(err => console.error('Failed to fetch {$fieldName}:', err));\n";
                $effects .= "        } else {\n";
                $effects .= "            set" . ucfirst($fieldName) . "([]);\n";
                $effects .= "            setData('{$field['name']}', '');\n";
                $effects .= "        }\n";
                $effects .= "    }, [data.{$dependsOn}]);\n";
            }
        }
        return $effects;
    }

    protected function generateRelationshipMultiInitialLoad()
    {
        $loads = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship-multi' && isset($field['mapping']['depends_on'])) {
                $dependsOn = $field['mapping']['depends_on'];
                $fieldName = Str::camel(Str::plural($field['mapping']['related_model']));
                $relatedTable = $field['mapping']['related_table'];
                
                $loads .= "\n            // Load {$fieldName} for the current {$dependsOn}\n";
                $loads .= "            if ({$this->getSingularName()}.{$dependsOn}) {\n";
                $loads .= "                fetch(`/api/{$relatedTable}-by-" . str_replace('_id', '', $dependsOn) . "?" . str_replace('_id', '', $dependsOn) . "_id=\${{$this->getSingularName()}.{$dependsOn}}`)\n";
                $loads .= "                    .then(res => res.json())\n";
                $loads .= "                    .then(data => set" . ucfirst($fieldName) . "(data))\n";
                $loads .= "                    .catch(err => console.error('Failed to fetch {$fieldName}:', err));\n";
                $loads .= "            }\n";
            }
        }
        return $loads;
    }

    protected function generateRelationshipMultiFilterStates()
    {
        $states = '';
        $hasMultiRelationship = false;
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship-multi' && isset($field['mapping']['depends_on'])) {
                $hasMultiRelationship = true;
                $fieldName = Str::camel(Str::plural($field['mapping']['related_model']));
                $dependsOn = $field['mapping']['depends_on'];
                $states .= "    const [{$fieldName}Options, set" . ucfirst($fieldName) . "Options] = useState([]);\n";
                $states .= "    const [selected" . ucfirst(str_replace('_id', '', $dependsOn)) . "Filter, setSelected" . ucfirst(str_replace('_id', '', $dependsOn)) . "Filter] = useState('');\n";
            }
        }
        
        return $hasMultiRelationship ? $states : '';
    }

    protected function generateRelationshipMultiFilterEffects()
    {
        $effects = '';
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship-multi' && isset($field['mapping']['depends_on'])) {
                $dependsOn = $field['mapping']['depends_on'];
                $fieldName = Str::camel(Str::plural($field['mapping']['related_model']));
                $relatedTable = $field['mapping']['related_table'];
                $parentFilter = 'selected' . ucfirst(str_replace('_id', '', $dependsOn)) . 'Filter';
                
                $effects .= "\n    // Load {$fieldName} when " . str_replace('_id', '', $dependsOn) . " filter changes\n";
                $effects .= "    useEffect(() => {\n";
                $effects .= "        if ({$parentFilter}) {\n";
                $effects .= "            fetch(`/api/{$relatedTable}-by-" . str_replace('_id', '', $dependsOn) . "?" . str_replace('_id', '', $dependsOn) . "_id=\${{$parentFilter}}`)\n";
                $effects .= "                .then(res => res.json())\n";
                $effects .= "                .then(data => {\n";
                $effects .= "                    const options = data.map((sub: any) => ({\n";
                $effects .= "                        value: sub.id.toString(),\n";
                $effects .= "                        label: sub.name\n";
                $effects .= "                    }));\n";
                $effects .= "                    set" . ucfirst($fieldName) . "Options(options);\n";
                $effects .= "                })\n";
                $effects .= "                .catch(err => console.error('Failed to fetch {$fieldName}:', err));\n";
                $effects .= "        } else {\n";
                $effects .= "            set" . ucfirst($fieldName) . "Options([]);\n";
                $effects .= "        }\n";
                $effects .= "    }, [{$parentFilter}]);\n";
            }
        }
        return $effects;
    }
}