<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\User;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class AttendanceControllerTest extends TestCase
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
        Permission::create(['name' => 'view_attendance']);
        Permission::create(['name' => 'create_attendance']);
        Permission::create(['name' => 'edit_attendance']);
        Permission::create(['name' => 'delete_attendance']);
        Permission::create(['name' => 'manage_all_attendance']);
        Permission::create(['name' => 'manage_own_attendance']);
    }

    public function test_index_requires_permission()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/attendances');
        
        $response->assertStatus(403);
    }

    public function test_index_returns_attendances_for_authorized_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_attendance');
        
        Attendance::factory()->count(3)->create();
        
        $response = $this->actingAs($user)->get('/attendances');
        
        $response->assertStatus(200);
    }

    public function test_store_creates_attendance_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_attendance');
        $student = Student::factory()->create();
        
        $data = [
            'date' => '2024-01-01',
            'student_id' => $student->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/attendances', $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('attendances', [
            // Add key assertions here
            'created_by' => $user->id,
        ]);
    }

    public function test_store_requires_permission()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create();
        
        $data = [
            'date' => '2024-01-01',
            'student_id' => $student->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/attendances', $data);
        
        $response->assertStatus(403);
    }

    public function test_store_validates_required_fields()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_attendance');
        
        $response = $this->actingAs($user)->post('/attendances', []);
        
        $response->assertSessionHasErrors(['status']);
    }

    public function test_show_returns_attendance_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_attendance');
        
        $attendance = Attendance::factory()->create();
        
        $response = $this->actingAs($user)->get("/attendances/{$attendance->id}");
        
        $response->assertStatus(200);
    }

    public function test_update_modifies_attendance_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit_attendance', 'manage_all_attendance');
        
        $attendance = Attendance::factory()->create();
        $student = Student::factory()->create();
        
        $data = [
            'date' => '2024-01-01',
            'student_id' => $student->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/attendances/{$attendance->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_update_requires_permission()
    {
        $user = User::factory()->create();
        $attendance = Attendance::factory()->create();
        
        $response = $this->actingAs($user)->put("/attendances/{$attendance->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_update_own_attendance_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['edit_attendance', 'manage_own_attendance']);
        
        $attendance = Attendance::factory()->create(['created_by' => $user->id]);
        $student = Student::factory()->create();
        
        $data = [
            'date' => '2024-01-01',
            'student_id' => $student->id,
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/attendances/{$attendance->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_cannot_update_others_attendance_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['edit_attendance', 'manage_own_attendance']);
        
        $attendance = Attendance::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->put("/attendances/{$attendance->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_destroy_deletes_attendance()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete_attendance', 'manage_all_attendance');
        
        $attendance = Attendance::factory()->create();
        
        $response = $this->actingAs($user)->delete("/attendances/{$attendance->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('attendances', ['id' => $attendance->id]);
    }

    public function test_destroy_requires_permission()
    {
        $user = User::factory()->create();
        $attendance = Attendance::factory()->create();
        
        $response = $this->actingAs($user)->delete("/attendances/{$attendance->id}");
        
        $response->assertStatus(403);
    }

    public function test_destroy_own_attendance_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['delete_attendance', 'manage_own_attendance']);
        
        $attendance = Attendance::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)->delete("/attendances/{$attendance->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('attendances', ['id' => $attendance->id]);
    }

    public function test_cannot_delete_others_attendance_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['delete_attendance', 'manage_own_attendance']);
        
        $attendance = Attendance::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->delete("/attendances/{$attendance->id}");
        
        $response->assertStatus(403);
    }
}