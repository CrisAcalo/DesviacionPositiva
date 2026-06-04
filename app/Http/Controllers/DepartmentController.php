<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'code' => 'nullable|string|max:20|unique:departments,code',
        ]);

        Department::create($data);

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => 'Departamento creado correctamente.']);
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $data = $request->validate([
            'name' => "required|string|max:255|unique:departments,name,{$department->id}",
            'code' => "nullable|string|max:20|unique:departments,code,{$department->id}",
        ]);

        $department->update($data);

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => 'Departamento actualizado correctamente.']);
    }

    public function destroy(Department $department): RedirectResponse
    {
        if ($department->careers()->exists()) {
            return redirect()->route('catalogs.index')
                ->with('toast', ['type' => 'error', 'message' => "No se puede eliminar: el departamento tiene {$department->careers()->count()} carrera(s) asociadas."]);
        }

        $department->delete();

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => "Departamento \"{$department->name}\" eliminado."]);
    }
}
