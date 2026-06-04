<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use App\Models\Career;
use App\Models\Department;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        // Departamentos ESPE
        $dtic = Department::firstOrCreate(['name' => 'Departamento de Ciencias de la Computación'], ['code' => 'DTIC']);
        $dmat = Department::firstOrCreate(['name' => 'Departamento de Matemáticas'], ['code' => 'DMAT']);
        $dcie = Department::firstOrCreate(['name' => 'Departamento de Ciencias Exactas'], ['code' => 'DCIE']);

        // Carreras
        Career::firstOrCreate(['name' => 'Ingeniería de Software', 'department_id' => $dtic->id], ['code' => 'ISW']);
        Career::firstOrCreate(['name' => 'Ingeniería en Tecnologías de la Información', 'department_id' => $dtic->id], ['code' => 'ITI']);
        Career::firstOrCreate(['name' => 'Ingeniería en Sistemas e Informática', 'department_id' => $dtic->id], ['code' => 'ISI']);

        // Materias (independientes de carrera)
        $materias = [
            ['name' => 'Algoritmos y Programación', 'code' => 'ALP'],
            ['name' => 'Estructuras de Datos', 'code' => 'EDD'],
            ['name' => 'Programación Orientada a Objetos', 'code' => 'POO'],
            ['name' => 'Bases de Datos', 'code' => 'BDD'],
            ['name' => 'Desarrollo Web', 'code' => 'DWE'],
            ['name' => 'Redes de Computadoras', 'code' => 'REC'],
            ['name' => 'Sistemas Operativos', 'code' => 'SOP'],
            ['name' => 'Ingeniería de Software', 'code' => 'ISW'],
            ['name' => 'Arquitectura de Software', 'code' => 'ASW'],
            ['name' => 'Cálculo Diferencial', 'code' => 'CAD'],
            ['name' => 'Cálculo Integral', 'code' => 'CAI'],
            ['name' => 'Álgebra Lineal', 'code' => 'ALI'],
            ['name' => 'Matemáticas Discretas', 'code' => 'MAD'],
        ];

        foreach ($materias as $materia) {
            Subject::firstOrCreate(['code' => $materia['code']], ['name' => $materia['name']]);
        }

        // Períodos académicos ESPE (formato AAAA-X)
        $periods = ['2023-A', '2023-B', '2024-A', '2024-B', '2025-A', '2025-B', '2026-A'];
        foreach ($periods as $period) {
            AcademicPeriod::firstOrCreate(
                ['name' => $period],
                ['is_active' => in_array($period, ['2025-B', '2026-A'])]
            );
        }
    }
}
