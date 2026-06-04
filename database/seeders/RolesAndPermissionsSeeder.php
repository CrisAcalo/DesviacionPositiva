<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'nrc.upload',
            'nrc.view',
            'nrc.manage',
            'survey.manage',
            'survey.respond',
            'analysis.view',
            'analysis.run',
            'reports.view',
            'reports.download',
            'users.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        Role::firstOrCreate(['name' => 'admin'])
            ->syncPermissions(Permission::all());

        Role::firstOrCreate(['name' => 'coordinator'])
            ->syncPermissions([
                'nrc.upload',
                'nrc.view',
                'nrc.manage',
                'survey.manage',
                'analysis.view',
                'analysis.run',
                'reports.view',
                'reports.download',
            ]);

        Role::firstOrCreate(['name' => 'teacher'])
            ->syncPermissions([
                'reports.view',
                'reports.download',
            ]);

        Role::firstOrCreate(['name' => 'project_director'])
            ->syncPermissions([
                'nrc.view',
                'analysis.view',
                'reports.view',
                'reports.download',
            ]);

        Role::firstOrCreate(['name' => 'student'])
            ->syncPermissions([
                'survey.respond',
            ]);
    }
}
