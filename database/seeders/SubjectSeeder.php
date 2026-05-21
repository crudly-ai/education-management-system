<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name' => 'Sample Subject 1', 'description' => 'Sample description for Subject 1', 'status' => 'active'],
            ['name' => 'Sample Subject 2', 'description' => 'Sample description for Subject 2', 'status' => 'active'],
            ['name' => 'Sample Subject 3', 'description' => 'Sample description for Subject 3', 'status' => 'active'],

        ];
        
        foreach ($subjects as $subject) {
            Subject::firstOrCreate(['name' => $subject['name']], array_merge($subject, ['created_by' => 1]));
        }
    }
}