<?php

namespace Tests\Unit;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_attendance_can_be_created()
    {
        $user = User::factory()->create();
        
        $attendance = Attendance::create([
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('attendances', [
            'created_by' => $user->id,
        ]);
    }

    public function test_attendance_has_fillable_attributes()
    {
        $attendance = new Attendance();
        
        $this->assertContains('date', $attendance->getFillable());
        $this->assertContains('student_id', $attendance->getFillable());
        $this->assertContains('status', $attendance->getFillable());
        $this->assertContains('created_by', $attendance->getFillable());
    }

    public function test_attendance_has_proper_casts()
    {
        $attendance = new Attendance();
        $casts = $attendance->getCasts();
        
        $this->assertEquals('date', $casts['date']);
        $this->assertEquals('string', $casts['status']);
    }

    public function test_attendance_belongs_to_student()
    {
        $student = Student::factory()->create();
        $attendance = Attendance::factory()->create(['student_id' => $student->id]);
        
        $this->assertInstanceOf(Student::class, $attendance->student);
        $this->assertEquals($student->id, $attendance->student->id);
    }

    public function test_attendance_belongs_to_creator()
    {
        $user = User::factory()->create();
        $attendance = Attendance::factory()->create(['created_by' => $user->id]);
        
        $this->assertInstanceOf(User::class, $attendance->creator);
        $this->assertEquals($user->id, $attendance->creator->id);
    }

    public function test_attendance_factory_creates_valid_attendance()
    {
        $attendance = Attendance::factory()->create();

        $this->assertNotNull($attendance->created_by);
    }

    public function test_attendance_factory_active_state()
    {
        $attendance = Attendance::factory()->active()->create();

        $this->assertEquals('active', $attendance->status);
    }

    public function test_attendance_factory_inactive_state()
    {
        $attendance = Attendance::factory()->inactive()->create();

        $this->assertEquals('inactive', $attendance->status);
    }
}