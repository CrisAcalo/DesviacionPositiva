<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class CareerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'          => 'Ingeniería '.$this->faker->words(2, true),
            'code'          => strtoupper($this->faker->bothify('CAR-###')),
            'department_id' => Department::factory(),
        ];
    }
}
