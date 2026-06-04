<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class QuestionBankFactory extends Factory
{
    public function definition(): array
    {
        $type = $this->faker->randomElement(['likert', 'single_choice', 'multiple_choice']);

        $options = $type === 'likert'
            ? [
                ['value' => '1', 'label' => 'Nunca'],
                ['value' => '2', 'label' => 'Raramente'],
                ['value' => '3', 'label' => 'A veces'],
                ['value' => '4', 'label' => 'Con frecuencia'],
                ['value' => '5', 'label' => 'Siempre'],
            ]
            : [
                ['value' => 'opt_a', 'label' => $this->faker->words(3, true)],
                ['value' => 'opt_b', 'label' => $this->faker->words(3, true)],
                ['value' => 'opt_c', 'label' => $this->faker->words(3, true)],
            ];

        return [
            'question_text' => $this->faker->sentence(8).'?',
            'type'          => $type,
            'options'       => $options,
            'target_group'  => $this->faker->randomElement(['high', 'medium', 'at_risk']),
            'order'         => $this->faker->numberBetween(1, 10),
            'is_active'     => true,
        ];
    }
}
