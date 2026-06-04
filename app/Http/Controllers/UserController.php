<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', User::class);

        $users = User::with('roles')
            ->orderByDesc('created_at')
            ->paginate(20);

        return inertia('users/index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return inertia('users/create', [
            'roles' => ['admin', 'coordinator'],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
        ]);

        $user->assignRole($request->validated('role'));

        return redirect()->route('users.index')
            ->with('toast', ['type' => 'success', 'message' => "Usuario {$user->name} creado correctamente."]);
    }

    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        return inertia('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name,
            ],
            'roles' => ['admin', 'coordinator'],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $user->update([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
        ]);

        if ($request->has('password') && $request->validated('password')) {
            $user->update(['password' => $request->validated('password')]);
        }

        if ($request->validated('role')) {
            $user->syncRoles([$request->validated('role')]);
        }

        return redirect()->route('users.index')
            ->with('toast', ['type' => 'success', 'message' => "Usuario {$user->name} actualizado correctamente."]);
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        abort_if($user->id === auth()->id(), 403, 'No puedes eliminar tu propio usuario.');

        $name = $user->name;
        $user->forceDelete();

        return redirect()->route('users.index')
            ->with('toast', ['type' => 'success', 'message' => "Usuario $name eliminado correctamente."]);
    }
}
