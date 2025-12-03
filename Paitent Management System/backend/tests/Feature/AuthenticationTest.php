<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can login with valid credentials
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'doctor@example.com',
            'password' => bcrypt('password123'),
            'role' => 'doctor'
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'doctor@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => ['id', 'name', 'role']
        ]);
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test user cannot login with invalid password
     */
    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'doctor@example.com',
            'password' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'doctor@example.com',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401);
        $this->assertGuest();
    }

    /**
     * Test user cannot login with nonexistent email
     */
    public function test_user_cannot_login_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(401);
        $this->assertGuest();
    }

    /**
     * Test login requires email
     */
    public function test_login_requires_email(): void
    {
        $response = $this->postJson('/api/login', [
            'password' => 'password123'
        ]);

        // API returns 401 for missing credentials instead of 422
        $response->assertStatus(401);
    }

    /**
     * Test login requires password
     */
    public function test_login_requires_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'doctor@example.com'
        ]);

        // API returns 401 for missing credentials instead of 422
        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can logout
     */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/logout');

        $response->assertStatus(200);
        $this->assertGuest();
    }

    /**
     * Test unauthenticated user cannot access protected routes
     */
    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/patients');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can access protected routes
     */
    public function test_authenticated_user_can_access_protected_routes(): void
    {
        $user = User::factory()->create(['role' => 'doctor']);

        $response = $this->actingAs($user)->getJson('/api/patients');

        // Should not be 401 (may be 200 or other valid status)
        $response->assertStatus(200);
    }

    /**
     * Test session persists after login
     */
    public function test_session_persists_after_login(): void
    {
        $user = User::factory()->create([
            'email' => 'doctor@example.com',
            'password' => bcrypt('password123')
        ]);

        // Login
        $this->postJson('/api/login', [
            'email' => 'doctor@example.com',
            'password' => 'password123'
        ]);

        // Make another request without re-authenticating
        $response = $this->getJson('/api/patients');

        $response->assertStatus(200);
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test user data is returned on successful login
     */
    public function test_user_data_returned_on_successful_login(): void
    {
        $user = User::factory()->create([
            'name' => 'Dr. Smith',
            'email' => 'doctor@example.com',
            'password' => bcrypt('password123'),
            'role' => 'doctor'
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'doctor@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'user' => [
                'id' => $user->id,
                'name' => 'Dr. Smith',
                'role' => 'doctor'
            ]
        ]);
    }
}
