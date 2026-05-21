<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use App\Models\ClassModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class StudentControllerTest extends TestCase
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
        Permission::create(['name' => 'view_student']);
        Permission::create(['name' => 'create_student']);
        Permission::create(['name' => 'edit_student']);
        Permission::create(['name' => 'delete_student']);
        Permission::create(['name' => 'manage_all_student']);
        Permission::create(['name' => 'manage_own_student']);
    }

    public function test_index_requires_permission()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/students');
        
        $response->assertStatus(403);
    }

    public function test_index_returns_students_for_authorized_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_student');
        
        Student::factory()->count(3)->create();
        
        $response = $this->actingAs($user)->get('/students');
        
        $response->assertStatus(200);
    }

    public function test_store_creates_student_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_student');
        $class = ClassModel::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'class_id' => $class->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/students', $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('students', [
            // Add key assertions here
            'created_by' => $user->id,
        ]);
    }

    public function test_store_requires_permission()
    {
        $user = User::factory()->create();
        $class = ClassModel::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'class_id' => $class->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/students', $data);
        
        $response->assertStatus(403);
    }

    public function test_store_validates_required_fields()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_student');
        
        $response = $this->actingAs($user)->post('/students', []);
        
        $response->assertSessionHasErrors(['name', 'status']);
    }

    public function test_show_returns_student_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_student');
        
        $student = Student::factory()->create();
        
        $response = $this->actingAs($user)->get("/students/{$student->id}");
        
        $response->assertStatus(200);
    }

    public function test_update_modifies_student_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit_student', 'manage_all_student');
        
        $student = Student::factory()->create();
        $class = ClassModel::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'class_id' => $class->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/students/{$student->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_update_requires_permission()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create();
        
        $response = $this->actingAs($user)->put("/students/{$student->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_update_own_student_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['edit_student', 'manage_own_student']);
        
        $student = Student::factory()->create(['created_by' => $user->id]);
        $class = ClassModel::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'class_id' => $class->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/students/{$student->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_cannot_update_others_student_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['edit_student', 'manage_own_student']);
        
        $student = Student::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->put("/students/{$student->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_destroy_deletes_student()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete_student', 'manage_all_student');
        
        $student = Student::factory()->create();
        
        $response = $this->actingAs($user)->delete("/students/{$student->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('students', ['id' => $student->id]);
    }

    public function test_destroy_requires_permission()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create();
        
        $response = $this->actingAs($user)->delete("/students/{$student->id}");
        
        $response->assertStatus(403);
    }

    public function test_destroy_own_student_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['delete_student', 'manage_own_student']);
        
        $student = Student::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)->delete("/students/{$student->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('students', ['id' => $student->id]);
    }

    public function test_cannot_delete_others_student_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['delete_student', 'manage_own_student']);
        
        $student = Student::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->delete("/students/{$student->id}");
        
        $response->assertStatus(403);
    }
}