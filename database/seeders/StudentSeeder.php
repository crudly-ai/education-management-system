<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            ['name' => 'Sample Student 1', 'class_id' => 1, 'status' => 'active'],
            ['name' => 'Sample Student 2', 'class_id' => 2, 'status' => 'active'],
            ['name' => 'Sample Student 3', 'class_id' => 3, 'status' => 'active'],

        ];
        
        foreach ($students as $student) {
            Student::firstOrCreate(['name' => $student['name']], array_merge($student, ['created_by' => 1]));
        }
    }
}