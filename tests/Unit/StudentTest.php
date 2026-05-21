<?php

namespace Tests\Unit;

use App\Models\Student;
use App\Models\User;
use App\Models\ClassModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_be_created()
    {
        $user = User::factory()->create();
        
        $student = Student::create([
            'name' => 'Test Name',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('students', [
            'name' => 'Test Name',
            'created_by' => $user->id,
        ]);
    }

    public function test_student_has_fillable_attributes()
    {
        $student = new Student();
        
        $this->assertContains('name', $student->getFillable());
        $this->assertContains('class_id', $student->getFillable());
        $this->assertContains('status', $student->getFillable());
        $this->assertContains('created_by', $student->getFillable());
    }

    public function test_student_has_proper_casts()
    {
        $student = new Student();
        $casts = $student->getCasts();
        
        $this->assertEquals('string', $casts['status']);
    }

    public function test_student_belongs_to_class()
    {
        $class = ClassModel::factory()->create();
        $student = Student::factory()->create(['class_id' => $class->id]);
        
        $this->assertInstanceOf(ClassModel::class, $student->class);
        $this->assertEquals($class->id, $student->class->id);
    }

    public function test_student_belongs_to_creator()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['created_by' => $user->id]);
        
        $this->assertInstanceOf(User::class, $student->creator);
        $this->assertEquals($user->id, $student->creator->id);
    }

    public function test_student_factory_creates_valid_student()
    {
        $student = Student::factory()->create();

        $this->assertNotNull($student->name);
        $this->assertNotNull($student->created_by);
    }

    public function test_student_factory_active_state()
    {
        $student = Student::factory()->active()->create();

        $this->assertEquals('active', $student->status);
    }

    public function test_student_factory_inactive_state()
    {
        $student = Student::factory()->inactive()->create();

        $this->assertEquals('inactive', $student->status);
    }
}