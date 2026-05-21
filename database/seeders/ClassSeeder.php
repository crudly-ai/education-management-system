<?php

namespace Database\Seeders;

use App\Models\ClassModel as ClassModel;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['name' => 'Sample Class 1', 'description' => 'Sample description for Class 1', 'status' => 'active'],
            ['name' => 'Sample Class 2', 'description' => 'Sample description for Class 2', 'status' => 'active'],
            ['name' => 'Sample Class 3', 'description' => 'Sample description for Class 3', 'status' => 'active'],

        ];
        
        foreach ($classes as $class) {
            ClassModel::firstOrCreate(['name' => $class['name']], array_merge($class, ['created_by' => 1]));
        }
    }
}