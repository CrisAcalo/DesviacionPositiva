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

    public function exportCsv(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $questions = QuestionBank::orderBy('target_group')->orderBy('order')->get();

        return response()->streamDownload(function () use ($questions) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM para Excel
            fputcsv($handle, ['Grupo', 'Orden', 'Pregunta', 'Tipo', 'Opciones', 'Activa'], ';');

            foreach ($questions as $question) {
                $optionsStr = '';
                if (is_array($question->options)) {
                    $opts = array_map(function ($opt) {
                        return ($opt['value'] ?? '') . ': ' . ($opt['label'] ?? '');
                    }, $question->options);
                    $optionsStr = implode(' | ', $opts);
                }

                fputcsv($handle, [
                    $question->target_group,
                    $question->order,
                    $question->question_text,
                    $question->type,
                    $optionsStr,
                    $question->is_active ? 'Sí' : 'No',
                ], ';');
            }

            fclose($handle);
        }, 'banco_de_preguntas.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
