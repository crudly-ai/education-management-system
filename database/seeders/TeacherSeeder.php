<?php

namespace Database\Seeders;

use App\Models\Teacher;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            ['name' => 'Sample Teacher 1', 'subject_id' => 1, 'status' => 'active'],
            ['name' => 'Sample Teacher 2', 'subject_id' => 2, 'status' => 'active'],
            ['name' => 'Sample Teacher 3', 'subject_id' => 3, 'status' => 'active'],

        ];
        
        foreach ($teachers as $teacher) {
            Teacher::firstOrCreate(['name' => $teacher['name']], array_merge($teacher, ['created_by' => 1]));
        }
    }
}