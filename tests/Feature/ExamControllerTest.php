<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\User;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ExamControllerTest extends TestCase
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
        Permission::create(['name' => 'view_exam']);
        Permission::create(['name' => 'create_exam']);
        Permission::create(['name' => 'edit_exam']);
        Permission::create(['name' => 'delete_exam']);
        Permission::create(['name' => 'manage_all_exam']);
        Permission::create(['name' => 'manage_own_exam']);
    }

    public function test_index_requires_permission()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/exams');
        
        $response->assertStatus(403);
    }

    public function test_index_returns_exams_for_authorized_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_exam');
        
        Exam::factory()->count(3)->create();
        
        $response = $this->actingAs($user)->get('/exams');
        
        $response->assertStatus(200);
    }

    public function test_store_creates_exam_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_exam');
        $subject = Subject::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'subject_id' => $subject->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/exams', $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('exams', [
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
        
        $response = $this->actingAs($user)->post('/exams', $data);
        
        $response->assertStatus(403);
    }

    public function test_store_validates_required_fields()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_exam');
        
        $response = $this->actingAs($user)->post('/exams', []);
        
        $response->assertSessionHasErrors(['name', 'status']);
    }

    public function test_show_returns_exam_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_exam');
        
        $exam = Exam::factory()->create();
        
        $response = $this->actingAs($user)->get("/exams/{$exam->id}");
        
        $response->assertStatus(200);
    }

    public function test_update_modifies_exam_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit_exam', 'manage_all_exam');
        
        $exam = Exam::factory()->create();
        $subject = Subject::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'subject_id' => $subject->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/exams/{$exam->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_update_requires_permission()
    {
        $user = User::factory()->create();
        $exam = Exam::factory()->create();
        
        $response = $this->actingAs($user)->put("/exams/{$exam->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_update_own_exam_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['edit_exam', 'manage_own_exam']);
        
        $exam = Exam::factory()->create(['created_by' => $user->id]);
        $subject = Subject::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'subject_id' => $subject->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/exams/{$exam->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_cannot_update_others_exam_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['edit_exam', 'manage_own_exam']);
        
        $exam = Exam::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->put("/exams/{$exam->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_destroy_deletes_exam()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete_exam', 'manage_all_exam');
        
        $exam = Exam::factory()->create();
        
        $response = $this->actingAs($user)->delete("/exams/{$exam->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('exams', ['id' => $exam->id]);
    }

    public function test_destroy_requires_permission()
    {
        $user = User::factory()->create();
        $exam = Exam::factory()->create();
        
        $response = $this->actingAs($user)->delete("/exams/{$exam->id}");
        
        $response->assertStatus(403);
    }

    public function test_destroy_own_exam_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['delete_exam', 'manage_own_exam']);
        
        $exam = Exam::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)->delete("/exams/{$exam->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('exams', ['id' => $exam->id]);
    }

    public function test_cannot_delete_others_exam_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['delete_exam', 'manage_own_exam']);
        
        $exam = Exam::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->delete("/exams/{$exam->id}");
        
        $response->assertStatus(403);
    }
}