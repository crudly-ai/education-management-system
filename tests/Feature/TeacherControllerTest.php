<?php

namespace Tests\Feature;

use App\Models\Teacher;
use App\Models\User;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class TeacherControllerTest extends TestCase
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
        Permission::create(['name' => 'view_teacher']);
        Permission::create(['name' => 'create_teacher']);
        Permission::create(['name' => 'edit_teacher']);
        Permission::create(['name' => 'delete_teacher']);
        Permission::create(['name' => 'manage_all_teacher']);
        Permission::create(['name' => 'manage_own_teacher']);
    }

    public function test_index_requires_permission()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/teachers');
        
        $response->assertStatus(403);
    }

    public function test_index_returns_teachers_for_authorized_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_teacher');
        
        Teacher::factory()->count(3)->create();
        
        $response = $this->actingAs($user)->get('/teachers');
        
        $response->assertStatus(200);
    }

    public function test_store_creates_teacher_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_teacher');
        $subject = Subject::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'subject_id' => $subject->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/teachers', $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('teachers', [
            // Add key assertions here
            'created_by' => $user->id,
        ]);
    }

    public function test_store_requires_permission()
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'subject_id' => $subject->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/teachers', $data);
        
        $response->assertStatus(403);
    }

    public function test_store_validates_required_fields()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_teacher');
        
        $response = $this->actingAs($user)->post('/teachers', []);
        
        $response->assertSessionHasErrors(['name', 'status']);
    }

    public function test_show_returns_teacher_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_teacher');
        
        $teacher = Teacher::factory()->create();
        
        $response = $this->actingAs($user)->get("/teachers/{$teacher->id}");
        
        $response->assertStatus(200);
    }

    public function test_update_modifies_teacher_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit_teacher', 'manage_all_teacher');
        
        $teacher = Teacher::factory()->create();
        $subject = Subject::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'subject_id' => $subject->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/teachers/{$teacher->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_update_requires_permission()
    {
        $user = User::factory()->create();
        $teacher = Teacher::factory()->create();
        
        $response = $this->actingAs($user)->put("/teachers/{$teacher->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_update_own_teacher_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['edit_teacher', 'manage_own_teacher']);
        
        $teacher = Teacher::factory()->create(['created_by' => $user->id]);
        $subject = Subject::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'subject_id' => $subject->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/teachers/{$teacher->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_cannot_update_others_teacher_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['edit_teacher', 'manage_own_teacher']);
        
        $teacher = Teacher::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->put("/teachers/{$teacher->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_destroy_deletes_teacher()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete_teacher', 'manage_all_teacher');
        
        $teacher = Teacher::factory()->create();
        
        $response = $this->actingAs($user)->delete("/teachers/{$teacher->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);
    }

    public function test_destroy_requires_permission()
    {
        $user = User::factory()->create();
        $teacher = Teacher::factory()->create();
        
        $response = $this->actingAs($user)->delete("/teachers/{$teacher->id}");
        
        $response->assertStatus(403);
    }

    public function test_destroy_own_teacher_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['delete_teacher', 'manage_own_teacher']);
        
        $teacher = Teacher::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)->delete("/teachers/{$teacher->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);
    }

    public function test_cannot_delete_others_teacher_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['delete_teacher', 'manage_own_teacher']);
        
        $teacher = Teacher::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->delete("/teachers/{$teacher->id}");
        
        $response->assertStatus(403);
    }
}