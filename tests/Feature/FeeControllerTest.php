<?php

namespace Tests\Feature;

use App\Models\Fee;
use App\Models\User;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class FeeControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // CRITICAL: DO NOT CHANGE THIS LINE - FIXES CSRF 419 ERRORS
        // This disables CSRF middleware while preserving auth and permission middleware
        // DO NOT MODIFY: This has been tested and works correctly
        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
        
        // Create permissions
        Permission::create(['name' => 'view_fee']);
        Permission::create(['name' => 'create_fee']);
        Permission::create(['name' => 'edit_fee']);
        Permission::create(['name' => 'delete_fee']);
        Permission::create(['name' => 'manage_all_fee']);
        Permission::create(['name' => 'manage_own_fee']);
    }

    public function test_index_requires_permission()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/fees');
        
        $response->assertStatus(403);
    }

    public function test_index_returns_fees_for_authorized_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_fee');
        
        Fee::factory()->count(3)->create();
        
        $response = $this->actingAs($user)->get('/fees');
        
        $response->assertStatus(200);
    }

    public function test_store_creates_fee_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_fee');
        $student = Student::factory()->create();
        
        $data = [
            'student_id' => $student->id,
            'amount' => 100.00,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/fees', $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('fees', [
            // Add key assertions here
            'created_by' => $user->id,
        ]);
    }

    public function test_store_requires_permission()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create();
        
        $data = [
            'student_id' => $student->id,
            'amount' => 100.00,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/fees', $data);
        
        $response->assertStatus(403);
    }

    public function test_store_validates_required_fields()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_fee');
        
        $response = $this->actingAs($user)->post('/fees', []);
        
        $response->assertSessionHasErrors(['amount', 'status']);
    }

    public function test_show_returns_fee_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_fee');
        
        $fee = Fee::factory()->create();
        
        $response = $this->actingAs($user)->get("/fees/{$fee->id}");
        
        $response->assertStatus(200);
    }

    public function test_update_modifies_fee_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit_fee', 'manage_all_fee');
        
        $fee = Fee::factory()->create();
        $student = Student::factory()->create();
        
        $data = [
            'student_id' => $student->id,
            'amount' => 100.00,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/fees/{$fee->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_update_requires_permission()
    {
        $user = User::factory()->create();
        $fee = Fee::factory()->create();
        
        $response = $this->actingAs($user)->put("/fees/{$fee->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_update_own_fee_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['edit_fee', 'manage_own_fee']);
        
        $fee = Fee::factory()->create(['created_by' => $user->id]);
        $student = Student::factory()->create();
        
        $data = [
            'student_id' => $student->id,
            'amount' => 100.00,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/fees/{$fee->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_cannot_update_others_fee_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['edit_fee', 'manage_own_fee']);
        
        $fee = Fee::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->put("/fees/{$fee->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_destroy_deletes_fee()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete_fee', 'manage_all_fee');
        
        $fee = Fee::factory()->create();
        
        $response = $this->actingAs($user)->delete("/fees/{$fee->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('fees', ['id' => $fee->id]);
    }

    public function test_destroy_requires_permission()
    {
        $user = User::factory()->create();
        $fee = Fee::factory()->create();
        
        $response = $this->actingAs($user)->delete("/fees/{$fee->id}");
        
        $response->assertStatus(403);
    }

    public function test_destroy_own_fee_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['delete_fee', 'manage_own_fee']);
        
        $fee = Fee::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)->delete("/fees/{$fee->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('fees', ['id' => $fee->id]);
    }

    public function test_cannot_delete_others_fee_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['delete_fee', 'manage_own_fee']);
        
        $fee = Fee::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->delete("/fees/{$fee->id}");
        
        $response->assertStatus(403);
    }
}