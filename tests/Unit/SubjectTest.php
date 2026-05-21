<?php

namespace Tests\Unit;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_subject_can_be_created()
    {
        $user = User::factory()->create();
        
        $subject = Subject::create([
            'name' => 'Test Name',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('subjects', [
            'name' => 'Test Name',
            'created_by' => $user->id,
        ]);
    }

    public function test_subject_has_fillable_attributes()
    {
        $subject = new Subject();
        
        $this->assertContains('name', $subject->getFillable());
        $this->assertContains('description', $subject->getFillable());
        $this->assertContains('status', $subject->getFillable());
        $this->assertContains('created_by', $subject->getFillable());
    }

    public function test_subject_has_proper_casts()
    {
        $subject = new Subject();
        $casts = $subject->getCasts();
        
        $this->assertEquals('string', $casts['status']);
    }

    public function test_subject_belongs_to_creator()
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create(['created_by' => $user->id]);
        
        $this->assertInstanceOf(User::class, $subject->creator);
        $this->assertEquals($user->id, $subject->creator->id);
    }

    public function test_subject_factory_creates_valid_subject()
    {
        $subject = Subject::factory()->create();

        $this->assertNotNull($subject->name);
        $this->assertNotNull($subject->created_by);
    }

    public function test_subject_factory_active_state()
    {
        $subject = Subject::factory()->active()->create();

        $this->assertEquals('active', $subject->status);
    }

    public function test_subject_factory_inactive_state()
    {
        $subject = Subject::factory()->inactive()->create();

        $this->assertEquals('inactive', $subject->status);
    }
}