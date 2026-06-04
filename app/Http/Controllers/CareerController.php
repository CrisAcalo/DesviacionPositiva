<?php

namespace App\Http\Controllers;

use App\Models\Career;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CareerController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'code'          => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
        ]);

        Career::create($data);

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => 'Carrera creada correctamente.']);
    }

    public function update(Request $request, Career $career): RedirectResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'code'          => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
        ]);

        $career->update($data);

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => 'Carrera actualizada correctamente.']);
    }

    public function destroy(Career $career): RedirectResponse
    {
        if ($career->nrcs()->exists()) {
            return redirect()->route('catalogs.index')
                ->with('toast', ['type' => 'error', 'message' => "No se puede eliminar: la carrera tiene {$career->nrcs()->count()} NRC(s) asociados."]);
        }

        $career->delete();

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => "Carrera \"{$career->name}\" eliminada."]);
    }
}
