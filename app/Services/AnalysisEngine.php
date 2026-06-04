<?php

namespace App\Services;

use App\Models\AnalysisResult;
use App\Models\Nrc;
use App\Models\Recommendation;
use App\Models\SurveyResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalysisEngine
{
    /**
     * Umbral para considerar una práctica como validada (60%).
     */
    private const VALIDATION_THRESHOLD = 60.0;

    /**
     * Ejecuta el análisis de desviación positiva para un NRC.
     * Borra resultados anteriores si los hubiera y genera nuevos.
     */
    public function analyze(Nrc $nrc): void
    {
        DB::transaction(function () use ($nrc) {
            // Limpiar análisis previo
            AnalysisResult::where('nrc_id', $nrc->id)->delete();
            Recommendation::where('nrc_id', $nrc->id)->delete();

            // Procesar cada grupo que tenga encuesta activa o cerrada
            $surveys = $nrc->surveys()
                ->whereIn('status', ['active', 'closed'])
                ->with(['questions.responses'])
                ->get();

            foreach ($surveys as $survey) {
                $this->processSurvey($nrc, $survey);
            }

            // Actualizar estado del NRC
            $nrc->update(['status' => 'analyzed']);
        });
    }

    /**
     * Procesa las respuestas de una encuesta y genera AnalysisResult + Recommendations.
     */
    private function processSurvey(Nrc $nrc, $survey): void
    {
        foreach ($survey->questions as $question) {
            $responses = $question->responses;
            $totalResponses = $responses->count();

            if ($totalResponses === 0) {
                continue; // Sin respuestas — saltar
            }

            // Calcular frecuencia de cada valor de respuesta
            $frequencies = $this->calculateFrequencies($question, $responses);

            if (empty($frequencies['counts'])) {
                continue;
            }

            // Encontrar la respuesta más frecuente
            arsort($frequencies['counts']);
            $topValue = array_key_first($frequencies['counts']);
            $topCount = $frequencies['counts'][$topValue];
            $topLabel = $frequencies['labels'][$topValue] ?? $topValue;
            $topPercentage = round(($topCount / $totalResponses) * 100, 2);
            $isValidated = $topPercentage >= self::VALIDATION_THRESHOLD;

            $result = AnalysisResult::create([
                'nrc_id'            => $nrc->id,
                'survey_question_id' => $question->id,
                'group'             => $survey->group,
                'frequencies'       => $frequencies['counts'],
                'top_answer_value'  => $topValue,
                'top_answer_label'  => $topLabel,
                'top_count'         => $topCount,
                'total_responses'   => $totalResponses,
                'top_percentage'    => $topPercentage,
                'is_validated'      => $isValidated,
            ]);

            // Generar recomendación si aplica
            if ($survey->group === 'high' && $isValidated) {
                // Práctica validada del grupo alto
                Recommendation::create([
                    'nrc_id'            => $nrc->id,
                    'analysis_result_id' => $result->id,
                    'type'              => 'practice',
                    'question_snapshot' => $question->question_text,
                    'answer_snapshot'   => $topLabel,
                    'percentage'        => $topPercentage,
                    'frequency'         => $topCount,
                    'total'             => $totalResponses,
                ]);
            } elseif ($survey->group === 'at_risk' && $isValidated) {
                // Barrera predominante del grupo en riesgo
                Recommendation::create([
                    'nrc_id'            => $nrc->id,
                    'analysis_result_id' => $result->id,
                    'type'              => 'barrier',
                    'question_snapshot' => $question->question_text,
                    'answer_snapshot'   => $topLabel,
                    'percentage'        => $topPercentage,
                    'frequency'         => $topCount,
                    'total'             => $totalResponses,
                ]);
            }
        }
    }

    /**
     * Calcula las frecuencias de respuestas para una pregunta.
     * Retorna ['counts' => [valor => n], 'labels' => [valor => etiqueta]].
     */
    private function calculateFrequencies($question, Collection $responses): array
    {
        if ($responses->isEmpty()) {
            return [];
        }

        // Construir mapa valor → etiqueta desde las opciones de la pregunta
        $labelMap = [];
        if (is_array($question->options)) {
            foreach ($question->options as $opt) {
                if (isset($opt['value'], $opt['label'])) {
                    $labelMap[$opt['value']] = $opt['label'];
                }
            }
        }

        $counts = [];
        foreach ($responses as $response) {
            $value = $response->answer;

            if (is_array($value)) {
                // multiple_choice — contar cada opción seleccionada
                foreach ($value as $v) {
                    $key = (string) $v;
                    $counts[$key] = ($counts[$key] ?? 0) + 1;
                }
            } else {
                $key = (string) $value;
                $counts[$key] = ($counts[$key] ?? 0) + 1;
            }
        }

        // Para Likert usar el valor numérico como etiqueta si no hay mapa
        $labels = [];
        foreach (array_keys($counts) as $v) {
            $labels[$v] = $labelMap[$v] ?? $v;
        }

        return ['counts' => $counts, 'labels' => $labels];
    }

    /**
     * Devuelve el resumen de resultados de un NRC para la vista React.
     */
    public function getResultsForNrc(Nrc $nrc): array
    {
        $results = AnalysisResult::where('nrc_id', $nrc->id)
            ->with('surveyQuestion')
            ->orderBy('group')
            ->orderBy('top_percentage', 'desc')
            ->get();

        $recommendations = Recommendation::where('nrc_id', $nrc->id)
            ->orderByRaw("FIELD(type, 'practice', 'barrier')")
            ->orderBy('percentage', 'desc')
            ->get();

        return [
            'results'         => $results->groupBy('group'),
            'recommendations' => $recommendations->groupBy('type'),
            'totals' => [
                'practices' => $recommendations->where('type', 'practice')->count(),
                'barriers'  => $recommendations->where('type', 'barrier')->count(),
                'validated' => $results->where('is_validated', true)->count(),
                'total'     => $results->count(),
            ],
        ];
    }
}
