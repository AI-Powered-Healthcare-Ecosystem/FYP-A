<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test doctor can send message to assigned patient
     */
    public function test_doctor_can_send_message_to_assigned_patient(): void
    {
        // Create doctor and patient
        $doctor = User::factory()->create(['role' => 'doctor']);
        $patient = Patient::factory()->create([
            'assigned_doctor_id' => $doctor->id,
            'user_id' => null
        ]);

        // Send message
        $response = $this->actingAs($doctor)->postJson('/api/messages', [
            'patient_id' => $patient->id,
            'sender_type' => 'doctor',
            'body' => 'Hello, how are you feeling today?'
        ]);

        $response->assertStatus(201);
        
        // Verify message was created
        $this->assertDatabaseHas('messages', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'sender_type' => 'doctor',
            'body' => 'Hello, how are you feeling today?'
        ]);
    }

    /**
     * Test cannot send message to patient without assigned doctor
     */
    public function test_cannot_send_message_without_assigned_doctor(): void
    {
        $user = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create([
            'assigned_doctor_id' => null,
            'user_id' => $user->id
        ]);

        $response = $this->actingAs($user)->postJson('/api/messages', [
            'patient_id' => $patient->id,
            'sender_type' => 'patient',
            'body' => 'Test message'
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test can retrieve message thread
     */
    public function test_can_retrieve_message_thread(): void
    {
        $doctor = User::factory()->create(['role' => 'doctor']);
        $patient = Patient::factory()->create(['assigned_doctor_id' => $doctor->id]);

        // Create some messages
        Message::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'sender_type' => 'doctor',
            'body' => 'First message'
        ]);

        Message::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'sender_type' => 'patient',
            'body' => 'Second message'
        ]);

        $response = $this->actingAs($doctor)->getJson("/api/messages/thread/{$patient->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(2);
    }

    /**
     * Test message requires authentication
     */
    public function test_message_requires_authentication(): void
    {
        $response = $this->postJson('/api/messages', [
            'patient_id' => 1,
            'sender_type' => 'doctor',
            'body' => 'Test'
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test message validation requires body
     */
    public function test_message_validation_requires_body(): void
    {
        $doctor = User::factory()->create(['role' => 'doctor']);
        $patient = Patient::factory()->create(['assigned_doctor_id' => $doctor->id]);

        $response = $this->actingAs($doctor)->postJson('/api/messages', [
            'patient_id' => $patient->id,
            'sender_type' => 'doctor',
            // Missing body
        ]);

        // Should fail with either 422 (validation) or 400 (bad request)
        $this->assertContains($response->status(), [400, 422]);
    }

    /**
     * Test can mark message as read
     */
    public function test_can_mark_message_as_read(): void
    {
        $doctor = User::factory()->create(['role' => 'doctor']);
        $patient = Patient::factory()->create(['assigned_doctor_id' => $doctor->id]);

        $message = Message::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'sender_type' => 'patient',
            'read_at' => null
        ]);

        $response = $this->actingAs($doctor)->patchJson("/api/messages/{$message->id}/read");

        $response->assertStatus(200);
        
        $message->refresh();
        $this->assertNotNull($message->read_at);
    }
}
