<?php

namespace Database\Factories;

use App\Models\AcademicPeriod;
use App\Models\Career;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NrcFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code'               => strtoupper($this->faker->bothify('NRC-####')),
            'subject_id'         => Subject::factory(),
            'career_id'          => Career::factory(),
            'academic_period_id' => AcademicPeriod::factory(),
            'uploaded_by'        => User::factory(),
            'status'             => 'pending',
        ];
    }
}
