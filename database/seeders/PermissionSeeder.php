<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Settings permissions
            'manage_settings',
            'edit_settings',

             // Media permissions
            'manage_media',
            'upload_media',
            'delete_media',
            'download_media',
            'manage_folders',

             // Role permissions
            'manage_all_role',
            'manage_own_role',
            'create_role',
            'view_role',
            'edit_role',
            'delete_role',

             // User permissions
            'manage_all_user',
            'manage_own_user',
            'create_user',
            'view_user',
            'edit_user',
            'delete_user',// Invoice permissions
            'manage_all_invoice',
            'manage_own_invoice',
            'view_invoice',
            'create_invoice',
            'edit_invoice',
            'delete_invoice',
            'export_invoice',

            // Project permissions
            'manage_all_projects',
            'manage_own_projects',
            'view_projects',
            'create_projects',
            'edit_projects',
            'delete_projects',
            'export_projects',

            // Task permissions
            'manage_all_tasks',
            'manage_own_tasks',
            'view_tasks',
            'create_tasks',
            'edit_tasks',
            'delete_tasks',
            'assign_tasks',

            // Charts permissions
            'view_charts',

            // Orders permissions
            'manage_all_orders',
            'manage_own_orders',
            'view_orders',
            'create_orders',
            'edit_orders',
            'delete_orders',
            'export_orders',

            // Email permissions
            'manage_all_email',
            'manage_own_email',
            'view_email',
            'create_email',
            'send_email',
            'delete_email',

            // Chat permissions
            'manage_all_chat',
            'manage_own_chat',
            'view_chat',
            'send_message',
            'delete_message',
            'make_call',

            // Blog permissions
            'manage_all_blog',
            'manage_own_blog',
            'view_blog',
            'create_blog',
            'edit_blog',
            'delete_blog',
            'publish_blog',

                    
            // Class permissions
            'manage_all_class',
            'manage_own_class',
            'view_class',
            'create_class', 
            'edit_class',
            'delete_class',
            
                    
            // Subject permissions
            'manage_all_subject',
            'manage_own_subject',
            'view_subject',
            'create_subject', 
            'edit_subject',
            'delete_subject',
            
                    
            // Student permissions
            'manage_all_student',
            'manage_own_student',
            'view_student',
            'create_student', 
            'edit_student',
            'delete_student',
            
                    
            // Teacher permissions
            'manage_all_teacher',
            'manage_own_teacher',
            'view_teacher',
            'create_teacher', 
            'edit_teacher',
            'delete_teacher',
            
                    
            // Attendance permissions
            'manage_all_attendance',
            'manage_own_attendance',
            'view_attendance',
            'create_attendance', 
            'edit_attendance',
            'delete_attendance',
            
                    
            // Exam permissions
            'manage_all_exam',
            'manage_own_exam',
            'view_exam',
            'create_exam', 
            'edit_exam',
            'delete_exam',
            
                    
            // Result permissions
            'manage_all_result',
            'manage_own_result',
            'view_result',
            'create_result', 
            'edit_result',
            'delete_result',
            
                    
            // Fee permissions
            'manage_all_fee',
            'manage_own_fee',
            'view_fee',
            'create_fee', 
            'edit_fee',
            'delete_fee',
            
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
