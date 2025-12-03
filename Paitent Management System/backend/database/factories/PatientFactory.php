<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'age' => fake()->numberBetween(30, 80),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'assigned_doctor_id' => null,
            'user_id' => null,
        ];
    }
}
