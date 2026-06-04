<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicPeriodFactory extends Factory
{
    public function definition(): array
    {
        static $seq = 0;
        $seq++;
        return [
            'name'      => "2024-TEST-{$seq}",
            'is_active' => true,
        ];
    }
}
