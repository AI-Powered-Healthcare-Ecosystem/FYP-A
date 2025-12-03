<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => User::factory(['role' => 'doctor']),
            'sender_type' => fake()->randomElement(['doctor', 'patient']),
            'body' => fake()->sentence(),
            'read_at' => null,
        ];
    }
}
