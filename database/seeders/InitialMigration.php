<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class InitialMigration extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //roles spatie
        $adminRole = Role::create(['name' => 'admin']);
        $userRole = Role::create(['name' => 'estudiante']);
        $userRole = Role::create(['name' => 'profesor']);

        //Usuario administrador
        $adminUser = User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => bcrypt('21397028'),
        ]);

        $adminUser->assignRole($adminRole);
        
    }
}
