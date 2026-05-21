<?php

namespace Database\Seeders;

use App\Models\Exam;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $exams = [
            ['name' => 'Sample Exam 1', 'subject_id' => 1, 'status' => 'active'],
            ['name' => 'Sample Exam 2', 'subject_id' => 2, 'status' => 'active'],
            ['name' => 'Sample Exam 3', 'subject_id' => 3, 'status' => 'active'],

        ];
        
        foreach ($exams as $exam) {
            Exam::firstOrCreate(['name' => $exam['name']], array_merge($exam, ['created_by' => 1]));
        }
    }
}