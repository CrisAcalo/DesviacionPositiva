<?php

namespace Database\Factories;

use App\Models\Nrc;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StudentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'uuid'            => Str::uuid()->toString(),
            'identifier_hash' => hash('sha3-256', $this->faker->unique()->numerify('##########').config('app.key', 'secret')),
            'nrc_id'          => Nrc::factory(),
            'email'           => $this->faker->optional(0.7)->safeEmail(),
        ];
    }
}
