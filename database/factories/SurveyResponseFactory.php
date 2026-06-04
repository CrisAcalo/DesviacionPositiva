<?php

namespace Database\Factories;

use App\Models\Nrc;
use App\Models\Student;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use Illuminate\Database\Eloquent\Factories\Factory;

class SurveyResponseFactory extends Factory
{
    protected $model = SurveyResponse::class;

    public function definition(): array
    {
        return [
            'survey_question_id' => SurveyQuestion::factory(),
            'student_id'         => Student::factory(),
            'nrc_id'             => Nrc::factory(),
            'answer'             => $this->faker->randomElement(['1', '2', '3', '4', '5']),
            'submitted_at'       => now(),
        ];
    }
}
