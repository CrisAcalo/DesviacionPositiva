<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicPeriodFactory extends Factory
{
    public function definition(): array
    {
        $year = $this->faker->numberBetween(2024, 2027);
        $term = $this->faker->randomElement(['I', 'II']);

        return [
            'name' => "{$year}-{$term}",
        ];
    }
}
