<?php

namespace Tests\Feature;

use App\Models\Result;
use App\Models\User;
use App\Models\Student;
use App\Models\Exam;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ResultControllerTest extends TestCase
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
        Permission::create(['name' => 'view_result']);
        Permission::create(['name' => 'create_result']);
        Permission::create(['name' => 'edit_result']);
        Permission::create(['name' => 'delete_result']);
        Permission::create(['name' => 'manage_all_result']);
        Permission::create(['name' => 'manage_own_result']);
    }

    public function test_index_requires_permission()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/results');
        
        $response->assertStatus(403);
    }

    public function test_index_returns_results_for_authorized_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_result');
        
        Result::factory()->count(3)->create();
        
        $response = $this->actingAs($user)->get('/results');
        
        $response->assertStatus(200);
    }

    public function test_store_creates_result_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_result');
        $student = Student::factory()->create();
        $exam = Exam::factory()->create();
        
        $data = [
            'student_id' => $student->id,
            'exam_id' => $exam->id,
            'marks' => 5,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/results', $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('results', [
            // Add key assertions here
            'created_by' => $user->id,
        ]);
    }

    public function test_store_requires_permission()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create();
        $exam = Exam::factory()->create();
        
        $data = [
            'student_id' => $student->id,
            'exam_id' => $exam->id,
            'marks' => 5,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/results', $data);
        
        $response->assertStatus(403);
    }

    public function test_store_validates_required_fields()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_result');
        
        $response = $this->actingAs($user)->post('/results', []);
        
        $response->assertSessionHasErrors(['marks', 'status']);
    }

    public function test_show_returns_result_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_result');
        
        $result = Result::factory()->create();
        
        $response = $this->actingAs($user)->get("/results/{$result->id}");
        
        $response->assertStatus(200);
    }

    public function test_update_modifies_result_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit_result', 'manage_all_result');
        
        $result = Result::factory()->create();
        $student = Student::factory()->create();
        $exam = Exam::factory()->create();
        
        $data = [
            'student_id' => $student->id,
            'exam_id' => $exam->id,
            'marks' => 5,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/results/{$result->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_update_requires_permission()
    {
        $user = User::factory()->create();
        $result = Result::factory()->create();
        
        $response = $this->actingAs($user)->put("/results/{$result->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_update_own_result_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['edit_result', 'manage_own_result']);
        
        $result = Result::factory()->create(['created_by' => $user->id]);
        $student = Student::factory()->create();
        $exam = Exam::factory()->create();
        
        $data = [
            'student_id' => $student->id,
            'exam_id' => $exam->id,
            'marks' => 5,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/results/{$result->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_cannot_update_others_result_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['edit_result', 'manage_own_result']);
        
        $result = Result::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->put("/results/{$result->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_destroy_deletes_result()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete_result', 'manage_all_result');
        
        $result = Result::factory()->create();
        
        $response = $this->actingAs($user)->delete("/results/{$result->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('results', ['id' => $result->id]);
    }

    public function test_destroy_requires_permission()
    {
        $user = User::factory()->create();
        $result = Result::factory()->create();
        
        $response = $this->actingAs($user)->delete("/results/{$result->id}");
        
        $response->assertStatus(403);
    }

    public function test_destroy_own_result_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['delete_result', 'manage_own_result']);
        
        $result = Result::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)->delete("/results/{$result->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('results', ['id' => $result->id]);
    }

    public function test_cannot_delete_others_result_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['delete_result', 'manage_own_result']);
        
        $result = Result::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->delete("/results/{$result->id}");
        
        $response->assertStatus(403);
    }
}