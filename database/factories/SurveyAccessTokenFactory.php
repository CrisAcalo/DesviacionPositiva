<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\Survey;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SurveyAccessTokenFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'survey_id'  => Survey::factory(),
            'token'      => Str::random(64),
            'used_at'    => null,
            'expires_at' => null,
        ];
    }
}
