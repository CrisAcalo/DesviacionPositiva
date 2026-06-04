<?php

namespace Database\Factories;

use App\Models\Nrc;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentGroupFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'nrc_id'     => Nrc::factory(),
            'group'      => $this->faker->randomElement(['high', 'medium', 'at_risk']),
        ];
    }
}
