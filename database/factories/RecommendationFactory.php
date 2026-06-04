<?php

namespace Database\Factories;

use App\Models\AnalysisResult;
use App\Models\Nrc;
use App\Models\Recommendation;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecommendationFactory extends Factory
{
    protected $model = Recommendation::class;

    public function definition(): array
    {
        $frequency = $this->faker->numberBetween(4, 10);
        $total     = $this->faker->numberBetween($frequency, 12);

        return [
            'nrc_id'             => Nrc::factory(),
            'analysis_result_id' => AnalysisResult::factory(),
            'type'               => $this->faker->randomElement(['practice', 'barrier']),
            'question_snapshot'  => $this->faker->sentence() . '?',
            'answer_snapshot'    => $this->faker->words(3, true),
            'percentage'         => round(($frequency / $total) * 100, 2),
            'frequency'          => $frequency,
            'total'              => $total,
        ];
    }
}
