<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20|unique:subjects,code',
        ]);

        Subject::create($data);

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => 'Materia creada correctamente.']);
    }

    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => "nullable|string|max:20|unique:subjects,code,{$subject->id}",
        ]);

        $subject->update($data);

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => 'Materia actualizada correctamente.']);
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        if ($subject->nrcs()->exists()) {
            return redirect()->route('catalogs.index')
                ->with('toast', ['type' => 'error', 'message' => "No se puede eliminar: la materia tiene {$subject->nrcs()->count()} NRC(s) asociados."]);
        }

        $subject->delete();

        return redirect()->route('catalogs.index')
            ->with('toast', ['type' => 'success', 'message' => "Materia \"{$subject->name}\" eliminada."]);
    }
}
