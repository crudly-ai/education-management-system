<?php

namespace Tests\Unit;

use App\Models\Fee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeeTest extends TestCase
{
    use RefreshDatabase;

    public function test_fee_can_be_created()
    {
        $user = User::factory()->create();
        
        $fee = Fee::create([
            'amount' => 100.00,
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('fees', [
            'created_by' => $user->id,
        ]);
    }

    public function test_fee_has_fillable_attributes()
    {
        $fee = new Fee();
        
        $this->assertContains('student_id', $fee->getFillable());
        $this->assertContains('amount', $fee->getFillable());
        $this->assertContains('status', $fee->getFillable());
        $this->assertContains('created_by', $fee->getFillable());
    }

    public function test_fee_has_proper_casts()
    {
        $fee = new Fee();
        $casts = $fee->getCasts();
        
        $this->assertEquals('decimal:2', $casts['amount']);
        $this->assertEquals('string', $casts['status']);
    }

    public function test_fee_belongs_to_student()
    {
        $student = Student::factory()->create();
        $fee = Fee::factory()->create(['student_id' => $student->id]);
        
        $this->assertInstanceOf(Student::class, $fee->student);
        $this->assertEquals($student->id, $fee->student->id);
    }

    public function test_fee_belongs_to_creator()
    {
        $user = User::factory()->create();
        $fee = Fee::factory()->create(['created_by' => $user->id]);
        
        $this->assertInstanceOf(User::class, $fee->creator);
        $this->assertEquals($user->id, $fee->creator->id);
    }

    public function test_fee_factory_creates_valid_fee()
    {
        $fee = Fee::factory()->create();

        $this->assertNotNull($fee->created_by);
    }

    public function test_fee_factory_active_state()
    {
        $fee = Fee::factory()->active()->create();

        $this->assertEquals('active', $fee->status);
    }

    public function test_fee_factory_inactive_state()
    {
        $fee = Fee::factory()->inactive()->create();

        $this->assertEquals('inactive', $fee->status);
    }
}