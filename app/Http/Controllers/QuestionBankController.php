<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Models\QuestionBank;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class QuestionBankController extends Controller
{
    public function index(): Response
    {
        $questions = QuestionBank::orderBy('target_group')
            ->orderBy('order')
            ->get()
            ->groupBy('target_group');

        return inertia('question-bank/index', ['questions' => $questions]);
    }

    public function create(): Response
    {
        return inertia('question-bank/create');
    }

    public function store(StoreQuestionRequest $request): RedirectResponse
    {
        QuestionBank::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
            'is_active'  => $request->boolean('is_active', true),
        ]);

        return redirect()->route('question-bank.index')
            ->with('toast', ['type' => 'success', 'message' => 'Pregunta creada correctamente.']);
    }

    public function edit(QuestionBank $questionBank): Response
    {
        return inertia('question-bank/edit', ['question' => $questionBank]);
    }

    public function update(UpdateQuestionRequest $request, QuestionBank $questionBank): RedirectResponse
    {
        $questionBank->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('question-bank.index')
            ->with('toast', ['type' => 'success', 'message' => 'Pregunta actualizada correctamente.']);
    }

    public function destroy(QuestionBank $questionBank): RedirectResponse
    {
        $questionBank->delete();

        return redirect()->route('question-bank.index')
            ->with('toast', ['type' => 'success', 'message' => 'Pregunta eliminada correctamente.']);
    }
}
