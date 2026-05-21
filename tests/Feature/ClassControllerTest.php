<?php

namespace Tests\Feature;

use App\Models\ClassModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ClassControllerTest extends TestCase
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
        Permission::create(['name' => 'view_class']);
        Permission::create(['name' => 'create_class']);
        Permission::create(['name' => 'edit_class']);
        Permission::create(['name' => 'delete_class']);
        Permission::create(['name' => 'manage_all_class']);
        Permission::create(['name' => 'manage_own_class']);
    }

    public function test_index_requires_permission()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/classes');
        
        $response->assertStatus(403);
    }

    public function test_index_returns_classes_for_authorized_user()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_class');
        
        ClassModel::factory()->count(3)->create();
        
        $response = $this->actingAs($user)->get('/classes');
        
        $response->assertStatus(200);
    }

    public function test_store_creates_class_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_class');
        
        $data = [
            'name' => 'Test Name',
            'description' => 'Test description',
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->post('/classes', $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('classes', [
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
        
        $response = $this->actingAs($user)->post('/classes', $data);
        
        $response->assertStatus(403);
    }

    public function test_store_validates_required_fields()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create_class');
        
        $response = $this->actingAs($user)->post('/classes', []);
        
        $response->assertSessionHasErrors(['name', 'status']);
    }

    public function test_show_returns_class_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view_class');
        
        $class = ClassModel::factory()->create();
        
        $response = $this->actingAs($user)->get("/classes/{$class->id}");
        
        $response->assertStatus(200);
    }

    public function test_update_modifies_class_with_valid_data()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit_class', 'manage_all_class');
        
        $class = ClassModel::factory()->create();
        
        $data = [
            'name' => 'Test Name',
            'description' => 'Test description',
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/classes/{$class->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_update_requires_permission()
    {
        $user = User::factory()->create();
        $class = ClassModel::factory()->create();
        
        $response = $this->actingAs($user)->put("/classes/{$class->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_update_own_class_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['edit_class', 'manage_own_class']);
        
        $class = ClassModel::factory()->create(['created_by' => $user->id]);
        
        $data = [
            'name' => 'Test Name',
            'description' => 'Test description',
            'status' => 'active',
        ];
        
        $response = $this->actingAs($user)->put("/classes/{$class->id}", $data);
        
        $response->assertRedirect();
    }

    public function test_cannot_update_others_class_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['edit_class', 'manage_own_class']);
        
        $class = ClassModel::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->put("/classes/{$class->id}", []);
        
        $response->assertStatus(403);
    }

    public function test_destroy_deletes_class()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete_class', 'manage_all_class');
        
        $class = ClassModel::factory()->create();
        
        $response = $this->actingAs($user)->delete("/classes/{$class->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('classes', ['id' => $class->id]);
    }

    public function test_destroy_requires_permission()
    {
        $user = User::factory()->create();
        $class = ClassModel::factory()->create();
        
        $response = $this->actingAs($user)->delete("/classes/{$class->id}");
        
        $response->assertStatus(403);
    }

    public function test_destroy_own_class_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['delete_class', 'manage_own_class']);
        
        $class = ClassModel::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)->delete("/classes/{$class->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('classes', ['id' => $class->id]);
    }

    public function test_cannot_delete_others_class_with_manage_own_permission()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $user->givePermissionTo(['delete_class', 'manage_own_class']);
        
        $class = ClassModel::factory()->create(['created_by' => $otherUser->id]);
        
        $response = $this->actingAs($user)->delete("/classes/{$class->id}");
        
        $response->assertStatus(403);
    }
}