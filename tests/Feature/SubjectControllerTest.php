<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SubjectControllerTest extends TestCase
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
        Permission::create(['name' => 'view_subject']);
        Permission::create(['name' => 'create_subject']);
        Permission::create(['name' => 'edit_subject']);
        Permission::create(['name' => 'delete_subject']);
        Permission::create(['name' => 'manage_all_subject']);
        Permission::create(['name' => 'manage_own_subject']);
    }

    public function test_index_requires_permission()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/subjects');
        
        $response->assertStatus(403);
    }

    public function test_index_returns_subjects_for_authorized_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_subject');
        
        Subject::factory()->count(3)->create();
        
        $response = $this->actingAs($user)->get('/subjects');
        
        $response->assertStatus(200);
    }

    public function test_store_creates_subject_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_subject');
        
        $data = [
            'name' => 'Test Name',
            'description' => 'Test description',
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/subjects', $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('subjects', [
            // Add key assertions here
            'created_by' => $user->id,
        ]);
    }

    public function test_store_requires_permission()
    {
        $user = User::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'description' => 'Test description',
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/subjects', $data);
        
        $response->assertStatus(403);
    }

    public function test_store_validates_required_fields()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_subject');
        
        $response = $this->actingAs($user)->post('/subjects', []);
        
        $response->assertSessionHasErrors(['name', 'status']);
    }

    public function test_show_returns_subject_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_subject');
        
        $subject = Subject::factory()->create();
        
        $response = $this->actingAs($user)->get("/subjects/{$subject->id}");
        
        $response->assertStatus(200);
    }

    public function test_update_modifies_subject_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit_subject', 'manage_all_subject');
        
        $subject = Subject::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'description' => 'Test description',
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/subjects/{$subject->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_update_requires_permission()
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        
        $response = $this->actingAs($user)->put("/subjects/{$subject->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_update_own_subject_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['edit_subject', 'manage_own_subject']);
        
        $subject = Subject::factory()->create(['created_by' => $user->id]);
        
        $data = [
            'name' => 'Test Name',
            'description' => 'Test description',
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/subjects/{$subject->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_cannot_update_others_subject_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['edit_subject', 'manage_own_subject']);
        
        $subject = Subject::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->put("/subjects/{$subject->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_destroy_deletes_subject()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete_subject', 'manage_all_subject');
        
        $subject = Subject::factory()->create();
        
        $response = $this->actingAs($user)->delete("/subjects/{$subject->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('subjects', ['id' => $subject->id]);
    }

    public function test_destroy_requires_permission()
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        
        $response = $this->actingAs($user)->delete("/subjects/{$subject->id}");
        
        $response->assertStatus(403);
    }

    public function test_destroy_own_subject_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['delete_subject', 'manage_own_subject']);
        
        $subject = Subject::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)->delete("/subjects/{$subject->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('subjects', ['id' => $subject->id]);
    }

    public function test_cannot_delete_others_subject_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['delete_subject', 'manage_own_subject']);
        
        $subject = Subject::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->delete("/subjects/{$subject->id}");
        
        $response->assertStatus(403);
    }
}