<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $userRole = Role::firstOrCreate(['name' => 'User']);

        // Give admin all permissions
        $adminRole->syncPermissions(Permission::all());

        // Give user specific permissions
        $userPermissions = [
            // Media permissions
            'upload_media',
            'manage_media',
            'manage_folders',// Own project management
            'manage_own_projects',
            'view_projects',
            'create_projects',
            'edit_projects',
            'delete_projects',

            // Own task management
            'manage_own_tasks',
            'view_tasks',
            'create_tasks',
            'edit_tasks',
            'delete_tasks',

            // Own invoice management
            'manage_own_invoice',
            'view_invoice',
            'create_invoice',
            'edit_invoice',
            'delete_invoice',

            // Charts permissions
            'view_charts',

            // Own orders management
            'manage_own_orders',
            'view_orders',
            'create_orders',
            'edit_orders',
            'delete_orders',

            // Own email management
            'manage_own_email',
            'view_email',
            'create_email',
            'send_email',
            'delete_email',

            // Own chat management
            'manage_own_chat',
            'view_chat',
            'send_message',
            'delete_message',
            'make_call',

            // Own blog management
            'manage_own_blog',
            'view_blog',
            'create_blog',
            'edit_blog',
            'delete_blog',
            'publish_blog',
        ];

        $userRole->syncPermissions($userPermissions);
    }
}