<?php

namespace Database\Seeders;

use App\Models\Result;
use Illuminate\Database\Seeder;

class ResultSeeder extends Seeder
{
    public function run(): void
    {
        $results = [
            ['student_id' => 1, 'exam_id' => 1, 'marks' => 2, 'status' => 'active'],
            ['student_id' => 2, 'exam_id' => 2, 'marks' => 3, 'status' => 'active'],
            ['student_id' => 3, 'exam_id' => 3, 'marks' => 4, 'status' => 'active'],

        ];
        
        foreach ($results as $result) {
            Result::firstOrCreate(['student_id' => $result['student_id']], array_merge($result, ['created_by' => 1]));
        }
    }
}