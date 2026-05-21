<?php

namespace App\Console\Commands\Crudly\Generators;

use Illuminate\Support\Str;

class CrudlyGenerator
{
    protected $name;
    protected $fields;
    protected $icon;
    protected $fieldMapper;
    protected $backendGenerator;
    protected $frontendGenerator;
    protected $testGenerator;

    public function __construct($name, $fieldsString, $icon = 'Building2')
    {
        $this->name = $name;
        $this->icon = $icon;
        $this->fieldMapper = new FieldMapper();
        $this->fields = $this->fieldMapper->parseFields($fieldsString);
        $this->backendGenerator = new BackendGenerator($this->name, $this->fields);
        $this->frontendGenerator = new FrontendGenerator($this->name, $this->fields, $this->icon);
        $this->testGenerator = new TestGenerator($this->name, $this->fields);
    }

    public function generate()
    {
        // Generate backend files
        $this->backendGenerator->generateMigration();
        $this->backendGenerator->generateModel();
        $this->backendGenerator->generateController();
        $this->backendGenerator->generateSeeder();
        $this->backendGenerator->generateDataSeeder();

        // Generate frontend files
        $this->frontendGenerator->generateTypes();
        $this->frontendGenerator->generateIndex();
        $this->frontendGenerator->generateCreate();
        $this->frontendGenerator->generateEdit();
        $this->frontendGenerator->generateView();

        // Generate test files
        $this->testGenerator->generateFactory();
        $this->testGenerator->generateUnitTest();
        $this->testGenerator->generateFeatureTest();

        // Generate route
        $this->generateRoute();
        
        // Add to sidebar
        $this->addToSidebar();
        
        // Add to seeder
        $this->addToSeeder();
        
        // Add to database seeder
        $this->addToDatabaseSeeder();
        
        // Add language keys
        $this->addLanguageKeys();
    }

    protected function generateRoute()
    {
        $routeStub = file_get_contents(base_path('stubs/crudly/templates/frontend/routes/web.stub'));
        
        $replacements = [
            '{{route_name}}' => Str::kebab(Str::plural($this->name)),
            '{{controller_name}}' => $this->name . 'Controller',
            '{{relationship_multi_routes}}' => $this->generateRelationshipMultiRoutes(),
        ];

        $routeContent = str_replace(array_keys($replacements), array_values($replacements), $routeStub);
        
        // Add route to web.php inside auth middleware group
        $webPhpPath = base_path('routes/web.php');
        $webPhpContent = file_get_contents($webPhpPath);
        
        // Find the position to insert the route (before the closing bracket of auth middleware group)
        $authGroupEnd = strrpos($webPhpContent, '});');
        if ($authGroupEnd !== false) {
            $beforeClosing = substr($webPhpContent, 0, $authGroupEnd);
            $afterClosing = substr($webPhpContent, $authGroupEnd);
            
            // Add the route with proper indentation inside the auth group
            $newContent = $beforeClosing . "    " . trim($routeContent) . "\n    \n" . $afterClosing;
            file_put_contents($webPhpPath, $newContent);
            
            echo "Route added to web.php inside auth middleware group\n";
        }
    }

    protected function addToSidebar()
    {
        $sidebarPath = resource_path('js/components/app-sidebar.tsx');
        $sidebarContent = file_get_contents($sidebarPath);
        
        $menuItemName = Str::plural($this->name);
        $routeName = Str::kebab(Str::plural($this->name));
        $permissionName = Str::snake(Str::lower($this->name));
        
        // Create the menu item
        $menuItem = "        {
            title: t('{$menuItemName}'),
            url: '/{$routeName}',
            icon: {$this->icon},
            permissions: ['manage_all_{$permissionName}', 'manage_own_{$permissionName}'],
        },";
        
        // Add icon import if not already present
        if (strpos($sidebarContent, $this->icon) === false && $this->icon !== 'Building2') {
            // Find the current import line
            $pattern = '/import\s*{([^}]+)}\s*from\s*[\'"]lucide-react[\'"];/';
            if (preg_match($pattern, $sidebarContent, $matches)) {
                $currentImports = $matches[1];
                $newImports = $currentImports . ', ' . $this->icon;
                $newImportLine = "import { {$newImports} } from 'lucide-react';";
                $sidebarContent = preg_replace($pattern, $newImportLine, $sidebarContent);
            }
        }
        
        // Find the position to insert (before Media item)
        $insertPosition = strpos($sidebarContent, "title: t('Media')");
        if ($insertPosition !== false) {
            // Find the start of the Media item
            $lineStart = strrpos($sidebarContent, '        {', $insertPosition - strlen($sidebarContent));
            
            $beforeMedia = substr($sidebarContent, 0, $lineStart);
            $afterMedia = substr($sidebarContent, $lineStart);
            
            $newContent = $beforeMedia . $menuItem . "\n" . $afterMedia;
            file_put_contents($sidebarPath, $newContent);
            
            echo "Menu item added to sidebar\n";
        }
    }
    
    protected function addToSeeder()
    {
        $seederPath = database_path('seeders/PermissionSeeder.php');
        $seederContent = file_get_contents($seederPath);
        
        $permissionName = Str::snake(Str::lower($this->name));
        $modelName = $this->name;
        
        $permissions = "            
            // {$modelName} permissions
            'manage_all_{$permissionName}',
            'manage_own_{$permissionName}',
            'view_{$permissionName}',
            'create_{$permissionName}', 
            'edit_{$permissionName}',
            'delete_{$permissionName}',";
        
        // Find the position to insert (before the closing array bracket)
        $insertPosition = strrpos($seederContent, '];');
        if ($insertPosition !== false) {
            $beforeClosing = substr($seederContent, 0, $insertPosition);
            $afterClosing = substr($seederContent, $insertPosition);
            
            $newContent = $beforeClosing . $permissions . "\n            \n        " . $afterClosing;
            file_put_contents($seederPath, $newContent);
            
            echo "Permissions added to seeder\n";
        }
    }
    
    protected function addToDatabaseSeeder()
    {
        $databaseSeederPath = database_path('seeders/DatabaseSeeder.php');
        $databaseSeederContent = file_get_contents($databaseSeederPath);
        
        $seederClass = $this->name . 'Seeder::class,';
        
        // Find the position to insert (before the closing array bracket)
        $insertPosition = strrpos($databaseSeederContent, ']);');
        if ($insertPosition !== false) {
            $beforeClosing = substr($databaseSeederContent, 0, $insertPosition);
            $afterClosing = substr($databaseSeederContent, $insertPosition);
            
            $newContent = $beforeClosing . "            {$seederClass}\n        " . $afterClosing;
            file_put_contents($databaseSeederPath, $newContent);
            
            echo "Seeder added to DatabaseSeeder\n";
        }
    }
    
    protected function addLanguageKeys()
    {
        $langPath = base_path('lang/en.json');
        $langContent = file_get_contents($langPath);
        $langData = json_decode($langContent, true);
        
        $modelName = $this->name;
        $pluralName = Str::plural($modelName);
        
        // Add new language keys
        $newKeys = [
            $pluralName => $pluralName,
            $modelName => $modelName,
            "Create {$modelName}" => "Create {$modelName}",
            "Edit {$modelName}" => "Edit {$modelName}",
            "Update {$modelName}" => "Update {$modelName}",
            "Delete {$modelName}" => "Delete {$modelName}",
            "{$modelName} Details" => "{$modelName} Details",
        ];
        
        // Add field-specific keys
        foreach ($this->fields as $field) {
            $fieldName = Str::title(str_replace('_', ' ', $field['name']));
            $newKeys[$fieldName] = $fieldName;
            $newKeys["Filter by " . strtolower(str_replace('_', ' ', $field['name']))] = "Filter by " . strtolower(str_replace('_', ' ', $field['name']));
        }
        
        // Merge with existing keys
        $langData = array_merge($langData, $newKeys);
        
        // Sort keys alphabetically
        ksort($langData);
        
        // Write back to file
        file_put_contents($langPath, json_encode($langData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        echo "Language keys added to en.json\n";
    }
    
    protected function generateRelationshipMultiRoutes()
    {
        $routes = '';
        
        foreach ($this->fields as $field) {
            if ($field['type'] === 'relationship-multi' && isset($field['mapping']['depends_on'])) {
                $relatedModel = $field['mapping']['related_model'];
                $relatedTable = $field['mapping']['related_table'];
                $dependsOn = $field['mapping']['depends_on'];
                $parentField = str_replace('_id', '', $dependsOn);
                $controllerName = $this->name . 'Controller';
                $methodName = 'get' . ucfirst(Str::camel(Str::plural($relatedModel))) . 'By' . ucfirst(Str::camel($parentField));
                
                $routes .= "\n    // API route for cascading dropdowns\n";
                $routes .= "    Route::get('api/{$relatedTable}-by-{$parentField}', [\\App\\Http\\Controllers\\{$controllerName}::class, '{$methodName}'])->name('api.{$relatedTable}-by-{$parentField}');";
            }
        }
        
        return $routes;
    }
}