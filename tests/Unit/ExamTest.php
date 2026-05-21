<?php

namespace Tests\Unit;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamTest extends TestCase
{
    use RefreshDatabase;

    public function test_exam_can_be_created()
    {
        $user = User::factory()->create();
        
        $exam = Exam::create([
            'name' => 'Test Name',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('exams', [
            'name' => 'Test Name',
            'created_by' => $user->id,
        ]);
    }

    public function test_exam_has_fillable_attributes()
    {
        $exam = new Exam();
        
        $this->assertContains('name', $exam->getFillable());
        $this->assertContains('subject_id', $exam->getFillable());
        $this->assertContains('status', $exam->getFillable());
        $this->assertContains('created_by', $exam->getFillable());
    }

    public function test_exam_has_proper_casts()
    {
        $exam = new Exam();
        $casts = $exam->getCasts();
        
        $this->assertEquals('string', $casts['status']);
    }

    public function test_exam_belongs_to_subject()
    {
        $subject = Subject::factory()->create();
        $exam = Exam::factory()->create(['subject_id' => $subject->id]);
        
        $this->assertInstanceOf(Subject::class, $exam->subject);
        $this->assertEquals($subject->id, $exam->subject->id);
    }

    public function test_exam_belongs_to_creator()
    {
        $user = User::factory()->create();
        $exam = Exam::factory()->create(['created_by' => $user->id]);
        
        $this->assertInstanceOf(User::class, $exam->creator);
        $this->assertEquals($user->id, $exam->creator->id);
    }

    public function test_exam_factory_creates_valid_exam()
    {
        $exam = Exam::factory()->create();

        $this->assertNotNull($exam->name);
        $this->assertNotNull($exam->created_by);
    }

    public function test_exam_factory_active_state()
    {
        $exam = Exam::factory()->active()->create();

        $this->assertEquals('active', $exam->status);
    }

    public function test_exam_factory_inactive_state()
    {
        $exam = Exam::factory()->inactive()->create();

        $this->assertEquals('inactive', $exam->status);
    }
}