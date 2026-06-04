<?php

namespace Database\Factories;

use App\Models\AnalysisResult;
use App\Models\Nrc;
use App\Models\SurveyQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnalysisResultFactory extends Factory
{
    protected $model = AnalysisResult::class;

    public function definition(): array
    {
        $topCount = $this->faker->numberBetween(3, 10);
        $total    = $this->faker->numberBetween($topCount, 15);
        $pct      = round(($topCount / $total) * 100, 2);

        return [
            'nrc_id'             => Nrc::factory(),
            'survey_question_id' => SurveyQuestion::factory(),
            'group'              => $this->faker->randomElement(['high', 'medium', 'at_risk']),
            'frequencies'        => ['1' => 2, '2' => 3, '3' => $topCount],
            'top_answer_value'   => '3',
            'top_answer_label'   => 'A veces',
            'top_count'          => $topCount,
            'total_responses'    => $total,
            'top_percentage'     => $pct,
            'is_validated'       => $pct >= 60,
        ];
    }
}
