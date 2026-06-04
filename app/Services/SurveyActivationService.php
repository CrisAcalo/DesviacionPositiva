<?php

namespace App\Services;

use App\Models\Nrc;
use App\Models\QuestionBank;
use App\Models\Survey;
use App\Models\SurveyAccessToken;
use App\Models\SurveyQuestion;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SurveyActivationService
{
    private const GROUP_LABELS = [
        'high'    => 'Alto rendimiento',
        'medium'  => 'Rendimiento promedio',
        'at_risk' => 'En riesgo',
    ];

    public function activate(Nrc $nrc, User $activatedBy, ?string $closesAt = null): void
    {
        DB::transaction(function () use ($nrc, $activatedBy, $closesAt) {
            foreach (array_keys(self::GROUP_LABELS) as $group) {
                $survey = Survey::create([
                    'nrc_id'       => $nrc->id,
                    'group'        => $group,
                    'title'        => self::GROUP_LABELS[$group].' — NRC '.$nrc->code,
                    'status'       => 'active',
                    'activated_at' => now(),
                    'activated_by' => $activatedBy->id,
                    'closes_at'    => $closesAt,
                ]);

                $this->copyQuestionsFromBank($survey, $group);
                $this->generateTokensForGroup($survey, $nrc, $group);
            }

            $nrc->update(['status' => 'surveying']);
        });
    }

    public function closeSurvey(Survey $survey): void
    {
        $survey->update(['status' => 'closed']);
    }

    public function getComplianceData(Nrc $nrc): array
    {
        $surveys = $nrc->surveys()->with('accessTokens')->get()->keyBy('group');
        $data    = [];

        foreach (array_keys(self::GROUP_LABELS) as $group) {
            $survey = $surveys->get($group);

            if (! $survey) {
                $data[$group] = ['total' => 0, 'responded' => 0, 'percent' => 0, 'survey' => null];
                continue;
            }

            $total     = $survey->accessTokens->count();
            $responded = $survey->accessTokens->whereNotNull('used_at')->count();

            $data[$group] = [
                'total'     => $total,
                'responded' => $responded,
                'percent'   => $total > 0 ? round(($responded / $total) * 100) : 0,
                'survey'    => $survey,
            ];
        }

        return $data;
    }

    public function getTokensForSurvey(Survey $survey): \Illuminate\Support\Collection
    {
        $surveyOpen = $survey->status === 'active';

        return $survey->accessTokens()
            ->with('student')
            ->get()
            ->map(fn ($t) => [
                'id'            => $t->id,
                'token'         => $t->token,
                'email'         => $t->student->email,
                'used'          => $t->isUsed(),
                'survey_open'   => $surveyOpen,
                'url'           => route('survey.respond', $t->token),
            ]);
    }

    private function copyQuestionsFromBank(Survey $survey, string $group): void
    {
        $bankQuestions = QuestionBank::active()
            ->forGroup($group)
            ->orderBy('order')
            ->get();

        foreach ($bankQuestions as $idx => $bq) {
            SurveyQuestion::create([
                'survey_id'        => $survey->id,
                'question_bank_id' => $bq->id,
                'question_text'    => $bq->question_text,
                'type'             => $bq->type,
                'options'          => $bq->options,
                'order'            => $idx + 1,
            ]);
        }
    }

    /**
     * Regenera tokens para encuestas existentes que los hayan perdido (ej: rollback de migración).
     * Es idempotente: no duplica tokens si ya existen.
     */
    public function regenerateMissingTokens(Nrc $nrc): array
    {
        $generated = [];
        foreach ($nrc->surveys as $survey) {
            $existing = SurveyAccessToken::where('survey_id', $survey->id)->count();
            if ($existing > 0) {
                continue;
            }
            $this->generateTokensForGroup($survey, $nrc, $survey->group);
            $generated[$survey->group] = $nrc->studentGroups()->where('group', $survey->group)->count();
        }
        return $generated;
    }

    private function generateTokensForGroup(Survey $survey, Nrc $nrc, string $group): void
    {
        $studentIds = $nrc->studentGroups()
            ->where('group', $group)
            ->pluck('student_id');

        foreach ($studentIds as $studentId) {
            SurveyAccessToken::create([
                'student_id' => $studentId,
                'survey_id'  => $survey->id,
                'token'      => Str::random(64),
                'expires_at' => $survey->closes_at,
            ]);
        }
    }
}
