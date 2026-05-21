<?php

namespace Database\Seeders;

use App\Models\Attendance;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $attendances = [
            ['date' => '2025-01-01', 'student_id' => 1, 'status' => 'active'],
            ['date' => '2025-01-02', 'student_id' => 2, 'status' => 'active'],
            ['date' => '2025-01-03', 'student_id' => 3, 'status' => 'active'],

        ];
        
        foreach ($attendances as $attendance) {
            Attendance::firstOrCreate(['date' => $attendance['date']], array_merge($attendance, ['created_by' => 1]));
        }
    }
}