<?php

namespace Database\Factories;

use App\Models\Nrc;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SurveyFactory extends Factory
{
    public function definition(): array
    {
        $group = $this->faker->randomElement(['high', 'medium', 'at_risk']);
        $labels = ['high' => 'Alto rendimiento', 'medium' => 'Promedio', 'at_risk' => 'En riesgo'];

        return [
            'nrc_id'       => Nrc::factory(),
            'group'        => $group,
            'title'        => $labels[$group].' — Encuesta',
            'status'       => 'active',
            'activated_at' => now(),
            'activated_by' => User::factory(),
            'closes_at'    => null,
        ];
    }
}
