<?php

namespace Tests\Unit;

use App\Models\Result;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResultTest extends TestCase
{
    use RefreshDatabase;

    public function test_result_can_be_created()
    {
        $user = User::factory()->create();
        
        $result = Result::create([
            'marks' => 5,
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('results', [
            'created_by' => $user->id,
        ]);
    }

    public function test_result_has_fillable_attributes()
    {
        $result = new Result();
        
        $this->assertContains('student_id', $result->getFillable());
        $this->assertContains('exam_id', $result->getFillable());
        $this->assertContains('marks', $result->getFillable());
        $this->assertContains('status', $result->getFillable());
        $this->assertContains('created_by', $result->getFillable());
    }

    public function test_result_has_proper_casts()
    {
        $result = new Result();
        $casts = $result->getCasts();
        
        $this->assertEquals('integer', $casts['marks']);
        $this->assertEquals('string', $casts['status']);
    }

    public function test_result_belongs_to_student()
    {
        $student = Student::factory()->create();
        $result = Result::factory()->create(['student_id' => $student->id]);
        
        $this->assertInstanceOf(Student::class, $result->student);
        $this->assertEquals($student->id, $result->student->id);
    }

    public function test_result_belongs_to_exam()
    {
        $exam = Exam::factory()->create();
        $result = Result::factory()->create(['exam_id' => $exam->id]);
        
        $this->assertInstanceOf(Exam::class, $result->exam);
        $this->assertEquals($exam->id, $result->exam->id);
    }

    public function test_result_belongs_to_creator()
    {
        $user = User::factory()->create();
        $result = Result::factory()->create(['created_by' => $user->id]);
        
        $this->assertInstanceOf(User::class, $result->creator);
        $this->assertEquals($user->id, $result->creator->id);
    }

    public function test_result_factory_creates_valid_result()
    {
        $result = Result::factory()->create();

        $this->assertNotNull($result->created_by);
    }

    public function test_result_factory_active_state()
    {
        $result = Result::factory()->active()->create();

        $this->assertEquals('active', $result->status);
    }

    public function test_result_factory_inactive_state()
    {
        $result = Result::factory()->inactive()->create();

        $this->assertEquals('inactive', $result->status);
    }
}