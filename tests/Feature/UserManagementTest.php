<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    private function adminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function coordinatorUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('coordinator');
        return $user;
    }

    #[Test]
    public function admin_can_list_users(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->get('/users')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('users/index'));
    }

    #[Test]
    public function coordinator_cannot_access_user_list(): void
    {
        $coordinator = $this->coordinatorUser();

        $this->actingAs($coordinator)
            ->get('/users')
            ->assertForbidden();
    }

    #[Test]
    public function unauthenticated_user_cannot_access_users(): void
    {
        $this->get('/users')
            ->assertRedirect('/login');
    }

    #[Test]
    public function admin_can_create_user_form(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->get('/users/create')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('users/create'));
    }

    #[Test]
    public function admin_can_create_coordinator(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->post('/users', [
                'name'     => 'María García',
                'email'    => 'maria@espe.edu.ec',
                'password' => 'Password1!',
                'role'     => 'coordinator',
            ])
            ->assertRedirect('/users');

        $this->assertDatabaseHas('users', ['email' => 'maria@espe.edu.ec']);

        $newUser = User::where('email', 'maria@espe.edu.ec')->first();
        $this->assertTrue($newUser->hasRole('coordinator'));
    }

    #[Test]
    public function create_user_requires_valid_email(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->post('/users', [
                'name'     => 'Test User',
                'email'    => 'not-an-email',
                'password' => 'Password1!',
                'role'     => 'coordinator',
            ])
            ->assertSessionHasErrors('email');
    }

    #[Test]
    public function create_user_requires_strong_password(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->post('/users', [
                'name'     => 'Test User',
                'email'    => 'test@espe.edu.ec',
                'password' => '123456',
                'role'     => 'coordinator',
            ])
            ->assertSessionHasErrors('password');
    }

    #[Test]
    public function create_user_requires_valid_role(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->post('/users', [
                'name'     => 'Test User',
                'email'    => 'test@espe.edu.ec',
                'password' => 'Password1!',
                'role'     => 'student',
            ])
            ->assertSessionHasErrors('role');
    }

    #[Test]
    public function admin_can_edit_user(): void
    {
        $admin = $this->adminUser();
        $target = $this->coordinatorUser();

        $this->actingAs($admin)
            ->get("/users/{$target->id}/edit")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('users/edit'));
    }

    #[Test]
    public function admin_can_update_user_name_and_email(): void
    {
        $admin = $this->adminUser();
        $target = $this->coordinatorUser();

        $this->actingAs($admin)
            ->patch("/users/{$target->id}", [
                'name'  => 'Nuevo Nombre',
                'email' => $target->email,
                'role'  => 'coordinator',
            ])
            ->assertRedirect('/users');

        $this->assertDatabaseHas('users', [
            'id'   => $target->id,
            'name' => 'Nuevo Nombre',
        ]);
    }

    #[Test]
    public function admin_can_change_user_password(): void
    {
        $admin = $this->adminUser();
        $target = $this->coordinatorUser();

        $this->actingAs($admin)
            ->patch("/users/{$target->id}", [
                'name'     => $target->name,
                'email'    => $target->email,
                'password' => 'NewPassword1!',
                'role'     => 'coordinator',
            ])
            ->assertRedirect('/users');

        $this->assertTrue(Hash::check('NewPassword1!', $target->fresh()->password));
    }

    #[Test]
    public function admin_can_delete_user(): void
    {
        $admin = $this->adminUser();
        $target = $this->coordinatorUser();

        $this->actingAs($admin)
            ->delete("/users/{$target->id}")
            ->assertRedirect('/users');

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    #[Test]
    public function admin_cannot_delete_themselves(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->delete("/users/{$admin->id}")
            ->assertForbidden();
    }

    #[Test]
    public function create_user_requires_unique_email(): void
    {
        $admin = $this->adminUser();
        $existing = $this->coordinatorUser();

        $this->actingAs($admin)
            ->post('/users', [
                'name'     => 'Otro Usuario',
                'email'    => $existing->email,
                'password' => 'Password1!',
                'role'     => 'coordinator',
            ])
            ->assertSessionHasErrors('email');
    }
}
