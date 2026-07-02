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

    public function activate(
        Nrc $nrc, 
        User $activatedBy, 
        array $groups, 
        ?string $closesAt = null, 
        array $questionIds = [], 
        string $questionSelection = 'ordered', 
        int $questionsPerPage = 1
    ): void {
        DB::transaction(function () use ($nrc, $activatedBy, $groups, $closesAt, $questionIds, $questionSelection, $questionsPerPage) {
            foreach ($groups as $group) {
                if (!isset(self::GROUP_LABELS[$group])) continue;
                
                $survey = Survey::create([
                    'nrc_id'             => $nrc->id,
                    'group'              => $group,
                    'title'              => self::GROUP_LABELS[$group].' — NRC '.$nrc->code,
                    'status'             => 'active',
                    'questions_per_page' => $questionsPerPage,
                    'activated_at'       => now(),
                    'activated_by'       => $activatedBy->id,
                    'closes_at'          => $closesAt,
                ]);

                $this->copyQuestionsFromBank($survey, $group, $questionIds, $questionSelection);
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
                'opened'        => !is_null($t->opened_at),
                'survey_open'   => $surveyOpen,
                'url'           => route('survey.respond', $t->token),
            ]);
    }

    private function copyQuestionsFromBank(Survey $survey, string $group, array $questionIds, string $selection): void
    {
        $query = QuestionBank::active()->forGroup($group);

        if (!empty($questionIds)) {
            $query->whereIn('id', $questionIds);
        }

        if ($selection === 'random') {
            $query->inRandomOrder();
        } else {
            $query->orderBy('order');
        }

        $bankQuestions = $query->get();

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
