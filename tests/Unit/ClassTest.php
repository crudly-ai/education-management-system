<?php

namespace Tests\Unit;

use App\Models\ClassModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassTest extends TestCase
{
    use RefreshDatabase;

    public function test_class_can_be_created()
    {
        $user = User::factory()->create();
        
        $class = ClassModel::create([
            'name' => 'Test Name',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('classes', [
            'name' => 'Test Name',
            'created_by' => $user->id,
        ]);
    }

    public function test_class_has_fillable_attributes()
    {
        $class = new ClassModel();
        
        $this->assertContains('name', $class->getFillable());
        $this->assertContains('description', $class->getFillable());
        $this->assertContains('status', $class->getFillable());
        $this->assertContains('created_by', $class->getFillable());
    }

    public function test_class_has_proper_casts()
    {
        $class = new ClassModel();
        $casts = $class->getCasts();
        
        $this->assertEquals('string', $casts['status']);
    }

    public function test_class_belongs_to_creator()
    {
        $user = User::factory()->create();
        $class = ClassModel::factory()->create(['created_by' => $user->id]);
        
        $this->assertInstanceOf(User::class, $class->creator);
        $this->assertEquals($user->id, $class->creator->id);
    }

    public function test_class_factory_creates_valid_class()
    {
        $class = ClassModel::factory()->create();

        $this->assertNotNull($class->name);
        $this->assertNotNull($class->created_by);
    }

    public function test_class_factory_active_state()
    {
        $class = ClassModel::factory()->active()->create();

        $this->assertEquals('active', $class->status);
    }

    public function test_class_factory_inactive_state()
    {
        $class = ClassModel::factory()->inactive()->create();

        $this->assertEquals('inactive', $class->status);
    }
}