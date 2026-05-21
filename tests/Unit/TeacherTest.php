<?php

namespace Tests\Unit;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_be_created()
    {
        $user = User::factory()->create();
        
        $teacher = Teacher::create([
            'name' => 'Test Name',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('teachers', [
            'name' => 'Test Name',
            'created_by' => $user->id,
        ]);
    }

    public function test_teacher_has_fillable_attributes()
    {
        $teacher = new Teacher();
        
        $this->assertContains('name', $teacher->getFillable());
        $this->assertContains('subject_id', $teacher->getFillable());
        $this->assertContains('status', $teacher->getFillable());
        $this->assertContains('created_by', $teacher->getFillable());
    }

    public function test_teacher_has_proper_casts()
    {
        $teacher = new Teacher();
        $casts = $teacher->getCasts();
        
        $this->assertEquals('string', $casts['status']);
    }

    public function test_teacher_belongs_to_subject()
    {
        $subject = Subject::factory()->create();
        $teacher = Teacher::factory()->create(['subject_id' => $subject->id]);
        
        $this->assertInstanceOf(Subject::class, $teacher->subject);
        $this->assertEquals($subject->id, $teacher->subject->id);
    }

    public function test_teacher_belongs_to_creator()
    {
        $user = User::factory()->create();
        $teacher = Teacher::factory()->create(['created_by' => $user->id]);
        
        $this->assertInstanceOf(User::class, $teacher->creator);
        $this->assertEquals($user->id, $teacher->creator->id);
    }

    public function test_teacher_factory_creates_valid_teacher()
    {
        $teacher = Teacher::factory()->create();

        $this->assertNotNull($teacher->name);
        $this->assertNotNull($teacher->created_by);
    }

    public function test_teacher_factory_active_state()
    {
        $teacher = Teacher::factory()->active()->create();

        $this->assertEquals('active', $teacher->status);
    }

    public function test_teacher_factory_inactive_state()
    {
        $teacher = Teacher::factory()->inactive()->create();

        $this->assertEquals('inactive', $teacher->status);
    }
}