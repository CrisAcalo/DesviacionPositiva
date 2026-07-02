<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActivateSurveyRequest;
use App\Mail\SurveyInvitation;
use App\Models\Nrc;
use App\Models\QuestionBank;
use App\Models\Survey;
use App\Services\SurveyActivationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SurveyController extends Controller
{
    public function __construct(private readonly SurveyActivationService $activationService) {}

    public function activate(ActivateSurveyRequest $request, Nrc $nrc): RedirectResponse
    {
        Gate::authorize('view', $nrc);

        if ($nrc->status !== 'segmented') {
            return back()->with('toast', ['type' => 'error', 'message' => 'El NRC debe estar segmentado antes de activar encuestas.']);
        }

        if (! QuestionBank::active()->exists()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'No hay preguntas activas en el banco. Agrega preguntas antes de activar encuestas.']);
        }

        $this->activationService->activate(
            $nrc,
            auth()->user(),
            $request->input('groups'),
            $request->input('closes_at'),
            $request->input('question_ids'),
            $request->input('question_selection'),
            $request->input('questions_per_page')
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Encuestas activadas para los grupos seleccionados.']);
    }

    public function reset(Nrc $nrc)
    {
        Gate::authorize('update', $nrc);

        $nrc->surveys()->delete();
        $nrc->update(['status' => 'segmented']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Configuración de encuestas eliminada exitosamente.']);
    }

    public function close(Nrc $nrc, Survey $survey): RedirectResponse
    {
        Gate::authorize('view', $nrc);

        $this->activationService->closeSurvey($survey);

        return back()->with('toast', ['type' => 'success', 'message' => "Encuesta del grupo {$survey->group} cerrada. Los enlaces siguen visibles pero ya no aceptan respuestas."]);
    }

    public function reopen(Nrc $nrc, Survey $survey): RedirectResponse
    {
        Gate::authorize('view', $nrc);

        abort_unless($survey->status === 'closed', 422, 'La encuesta ya está activa.');

        $survey->update(['status' => 'active']);

        return back()->with('toast', ['type' => 'success', 'message' => "Encuesta del grupo {$survey->group} habilitada nuevamente."]);
    }

    public function tokens(Survey $survey): JsonResponse
    {
        Gate::authorize('view', $survey->nrc);

        return response()->json(
            $this->activationService->getTokensForSurvey($survey)
        );
    }

    public function sendEmails(Nrc $nrc, Survey $survey): RedirectResponse
    {
        Gate::authorize('view', $nrc);

        if ($survey->status !== 'active') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Solo se pueden enviar correos a encuestas activas.']);
        }

        $nrc->load('subject');

        $tokens = $survey->accessTokens()
            ->with('student')
            ->whereNull('used_at')
            ->get()
            ->filter(fn ($t) => filled($t->student?->email));

        if ($tokens->isEmpty()) {
            return back()->with('toast', ['type' => 'warning', 'message' => 'No hay estudiantes con correo electrónico pendientes de responder.']);
        }

        $groupLabels = ['high' => 'Alto rendimiento', 'medium' => 'Promedio', 'at_risk' => 'En riesgo'];

        $sent = 0;
        foreach ($tokens as $token) {
            Mail::to($token->student->email)->send(new SurveyInvitation(
                accessToken: $token,
                surveyUrl: route('survey.respond', $token->token),
                nrcCode: $nrc->code,
                subjectName: $nrc->subject->name,
                groupLabel: $groupLabels[$survey->group] ?? $survey->group,
            ));
            $sent++;
        }

        return back()->with('toast', ['type' => 'success', 'message' => "{$sent} correo(s) de invitación enviados correctamente."]);
    }

    public function downloadCsv(Nrc $nrc): StreamedResponse
    {
        Gate::authorize('view', $nrc);

        $surveys = $nrc->surveys()->with('accessTokens.student')->get();

        $groupLabels = ['high' => 'Alto rendimiento', 'medium' => 'Promedio', 'at_risk' => 'En riesgo'];

        return response()->streamDownload(function () use ($surveys, $groupLabels) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM para Excel
            fputcsv($handle, ['grupo', 'email', 'uuid_anonimizado', 'respondido', 'enlace'], ';');

            foreach ($surveys as $survey) {
                foreach ($survey->accessTokens as $token) {
                    fputcsv($handle, [
                        $groupLabels[$survey->group] ?? $survey->group,
                        $token->student->email ?? '',
                        substr($token->student->uuid, 0, 8),
                        $token->used_at ? 'Sí' : 'No',
                        route('survey.respond', $token->token),
                    ], ';');
                }
            }

            fclose($handle);
        }, "nrc_{$nrc->code}_encuestas.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
