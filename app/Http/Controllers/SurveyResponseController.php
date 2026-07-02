<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSurveyResponseRequest;
use App\Models\SurveyAccessToken;
use App\Models\SurveyResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class SurveyResponseController extends Controller
{
    public function show(string $token): Response
    {
        $accessToken = SurveyAccessToken::where('token', $token)
            ->with(['survey.questions', 'survey.nrc'])
            ->firstOrFail();

        if ($accessToken->isUsed()) {
            return inertia('surveys/respond', ['state' => 'used']);
        }

        if ($accessToken->isExpired() || ! $accessToken->survey->isOpen()) {
            return inertia('surveys/respond', ['state' => 'closed']);
        }

        if (is_null($accessToken->opened_at)) {
            $accessToken->update(['opened_at' => now()]);
            \App\Events\SurveyTokenUpdated::dispatch($accessToken);
        }

        return inertia('surveys/respond', [
            'state'   => 'open',
            'token'   => $token,
            'survey'  => [
                'title'     => $accessToken->survey->title,
                'group'              => $accessToken->survey->group,
                'questions_per_page' => $accessToken->survey->questions_per_page,
                'questions'          => $accessToken->survey->questions->map(fn ($q) => [
                    'id'      => $q->id,
                    'text'    => $q->question_text,
                    'type'    => $q->type,
                    'options' => $q->options,
                    'order'   => $q->order,
                ]),
            ],
        ]);
    }

    public function store(StoreSurveyResponseRequest $request, string $token): \Illuminate\Http\RedirectResponse
    {
        $accessToken = SurveyAccessToken::where('token', $token)
            ->with('survey.nrc')
            ->firstOrFail();

        if ($accessToken->isUsed()) {
            return back()->withErrors(['token' => 'Este enlace ya fue utilizado.']);
        }

        if ($accessToken->isExpired() || ! $accessToken->survey->isOpen()) {
            return back()->withErrors(['token' => 'Esta encuesta ya no está disponible.']);
        }

        DB::transaction(function () use ($accessToken, $request) {
            foreach ($request->input('responses') as $questionId => $answer) {
                SurveyResponse::create([
                    'student_id'         => $accessToken->student_id,
                    'survey_question_id' => (int) $questionId,
                    'nrc_id'             => $accessToken->survey->nrc_id,
                    'answer'             => is_array($answer) ? $answer : [$answer],
                    'submitted_at'       => now(),
                ]);
            }

            $accessToken->update(['used_at' => now()]);
        });

        \App\Events\SurveyTokenUpdated::dispatch($accessToken);

        return redirect()->route('survey.respond', $token)
            ->with('toast', ['type' => 'success', 'message' => 'Respuestas enviadas. ¡Gracias por participar!']);
    }
}
