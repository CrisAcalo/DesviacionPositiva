<?php

namespace Database\Factories;

use App\Models\Survey;
use Illuminate\Database\Eloquent\Factories\Factory;

class SurveyQuestionFactory extends Factory
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
                ['value' => 'a', 'label' => 'Opción A'],
                ['value' => 'b', 'label' => 'Opción B'],
                ['value' => 'c', 'label' => 'Opción C'],
            ];

        return [
            'survey_id'     => Survey::factory(),
            'question_text' => $this->faker->sentence(8).'?',
            'type'          => $type,
            'options'       => $options,
            'order'         => $this->faker->numberBetween(1, 10),
        ];
    }
}
