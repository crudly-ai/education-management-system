<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use App\Console\Commands\Crudly\Generators\CrudlyGenerator;

class MakeCrudlyCommand extends Command
{
    protected $signature = 'make:crudly {name} {--fields=} {--icon=Building2}';
    protected $description = 'Generate a complete CRUD module with frontend and backend files';

    public function handle()
    {
        $name = $this->argument('name');
        $fields = $this->option('fields');
        $icon = $this->option('icon') ?: 'Building2';

        if (!$fields) {
            $this->error('Please provide fields using --fields option');
            $this->info('Example: php artisan make:crudly Product --fields="name:text:required|string|max:255;description:textarea:nullable|string;status:switch:required|in:active,inactive:filterable;sort_order:text:required|integer::hidden" --icon="Package"');
            return 1;
        }

        $generator = new CrudlyGenerator($name, $fields, $icon);
        
        try {
            $generator->generate();
            
            $this->info("\n✅ CRUD module '{$name}' generated successfully!");
            
            $this->info("\n📁 Generated Files:");
            $this->info("   Backend:");
            $this->info("   ├── Migration: database/migrations/*_create_" . Str::snake(Str::plural($name)) . "_table.php");
            $this->info("   ├── Model: app/Models/{$name}.php");
            $this->info("   ├── Controller: app/Http/Controllers/{$name}Controller.php");
            $this->info("   └── Seeder: database/seeders/{$name}Seeder.php");
            
            $this->info("   Tests:");
            $this->info("   ├── Factory: database/factories/{$name}Factory.php");
            $this->info("   ├── Unit Test: tests/Unit/{$name}Test.php");
            $this->info("   └── Feature Test: tests/Feature/{$name}ControllerTest.php");
            
            $this->info("   Frontend:");
            $this->info("   ├── Types: resources/js/pages/" . Str::plural(Str::kebab($name)) . "/types.ts");
            $this->info("   ├── Index: resources/js/pages/" . Str::plural(Str::kebab($name)) . "/index.tsx");
            $this->info("   ├── Create: resources/js/pages/" . Str::plural(Str::kebab($name)) . "/create.tsx");
            $this->info("   ├── Edit: resources/js/pages/" . Str::plural(Str::kebab($name)) . "/edit.tsx");
            $this->info("   └── View: resources/js/pages/" . Str::plural(Str::kebab($name)) . "/view.tsx");
            
            $this->info("\n🔧 Updated Files:");
            $this->info("   ├── Routes: routes/web.php");
            $this->info("   ├── Sidebar: resources/js/components/app-sidebar.tsx");
            $this->info("   ├── Permissions: database/seeders/PermissionSeeder.php");
            $this->info("   ├── Database Seeder: database/seeders/DatabaseSeeder.php");
            $this->info("   └── Language Keys: lang/en.json");
            
            $this->info("\n🚀 Next steps:");
            $this->info("   1. php artisan migrate:fresh --seed");
            $this->info("   2. php artisan test --filter={$name}Test");
            $this->info("   3. php artisan test --filter={$name}ControllerTest");
            
            $this->info("\n💡 Icon used: {$icon}");
            $this->info("   Available icons: Building2, Package, Users, ShoppingCart, FileText, Settings, etc.");
            $this->info("   (Any Lucide React icon name)");
            
        } catch (\Exception $e) {
            $this->error("Error generating CRUD: " . $e->getMessage());
            return 1;
        }

        return 0;
    }


}