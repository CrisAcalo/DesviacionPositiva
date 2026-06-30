<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\RedirectResponse;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return inertia('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return back()->with('toast', ['type' => 'success', 'message' => "Permisos del rol {$role->name} actualizados."]);
    }
}
