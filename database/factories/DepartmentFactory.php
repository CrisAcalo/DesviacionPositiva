<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'Departamento '.$this->faker->words(2, true),
            'code' => strtoupper($this->faker->bothify('DEP-###')),
        ];
    }
}
