<?php

namespace Database\Seeders;

use App\Models\Fee;
use Illuminate\Database\Seeder;

class FeeSeeder extends Seeder
{
    public function run(): void
    {
        $fees = [
            ['student_id' => 1, 'amount' => 25.99, 'status' => 'active'],
            ['student_id' => 2, 'amount' => 51.98, 'status' => 'active'],
            ['student_id' => 3, 'amount' => 77.97, 'status' => 'active'],

        ];
        
        foreach ($fees as $fee) {
            Fee::firstOrCreate(['student_id' => $fee['student_id']], array_merge($fee, ['created_by' => 1]));
        }
    }
}