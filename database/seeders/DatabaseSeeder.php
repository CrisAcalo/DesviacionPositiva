<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            CatalogSeeder::class,
            QuestionBankSeeder::class,
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@espe.edu.ec'],
            ['name' => 'Administrador ESPE', 'password' => bcrypt('password')]
        );
        $admin->assignRole('admin');

        $coordinator = User::firstOrCreate(
            ['email' => 'coordinador@espe.edu.ec'],
            ['name' => 'Coordinador Académico', 'password' => bcrypt('password')]
        );
        $coordinator->assignRole('coordinator');

        //teacher Cristian Acalo
        $teacher = User::firstOrCreate(
            ['email' => 'docente@espe.edu.ec'],
            ['name' => 'Cristian Acalo', 'password' => bcrypt('password')]
        );
        $teacher->assignRole('teacher');
    }
}
