<?php

namespace App\Http\Controllers;

use App\Models\AnalysisResult;
use App\Models\Nrc;
use App\Models\Recommendation;
use App\Models\StudentGroup;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Dashboard: lista todos los NRCs analizados con resumen.
     */
    public function index(): Response
    {
        $nrcs = Nrc::where('status', 'analyzed')
            ->with(['subject', 'career.department', 'academicPeriod'])
            ->withCount([
                'students',
            ])
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (Nrc $nrc) {
                $practices = Recommendation::where('nrc_id', $nrc->id)->where('type', 'practice')->count();
                $barriers  = Recommendation::where('nrc_id', $nrc->id)->where('type', 'barrier')->count();

                $groups = StudentGroup::where('nrc_id', $nrc->id)
                    ->select('group', DB::raw('COUNT(*) as total'))
                    ->groupBy('group')
                    ->pluck('total', 'group')
                    ->toArray();

                return [
                    'id'         => $nrc->id,
                    'code'       => $nrc->code,
                    'subject'    => $nrc->subject->name,
                    'career'     => $nrc->career->name,
                    'department' => $nrc->career->department->name,
                    'period'     => $nrc->academicPeriod->name,
                    'students'   => $nrc->students_count,
                    'groups'     => $groups,
                    'practices'  => $practices,
                    'barriers'   => $barriers,
                ];
            });

        return Inertia::render('reports/index', [
            'nrcs' => $nrcs,
        ]);
    }

    /**
     * Reporte completo de un NRC analizado (imprimible / exportable).
     */
    public function show(Nrc $nrc): Response
    {
        abort_unless($nrc->status === 'analyzed', 404);

        $nrc->load(['subject', 'career.department', 'academicPeriod']);

        // Distribución de grupos
        $groupDist = StudentGroup::where('nrc_id', $nrc->id)
            ->select('group', DB::raw('COUNT(*) as total'))
            ->groupBy('group')
            ->pluck('total', 'group')
            ->toArray();

        $totalStudents = array_sum($groupDist);

        // Resultados de análisis agrupados por grupo
        $results = AnalysisResult::where('nrc_id', $nrc->id)
            ->with('surveyQuestion')
            ->orderBy('group')
            ->orderByDesc('top_percentage')
            ->get()
            ->groupBy('group');

        // Recomendaciones
        $recommendations = Recommendation::where('nrc_id', $nrc->id)
            ->orderByRaw("FIELD(type, 'practice', 'barrier')")
            ->orderByDesc('percentage')
            ->get()
            ->groupBy('type');

        // Totales
        $totals = [
            'practices' => ($recommendations['practice'] ?? collect())->count(),
            'barriers'  => ($recommendations['barrier'] ?? collect())->count(),
            'validated' => AnalysisResult::where('nrc_id', $nrc->id)->where('is_validated', true)->count(),
            'total'     => AnalysisResult::where('nrc_id', $nrc->id)->count(),
        ];

        return Inertia::render('reports/show', [
            'nrc' => [
                'id'         => $nrc->id,
                'code'       => $nrc->code,
                'subject'    => $nrc->subject->name,
                'career'     => $nrc->career->name,
                'department' => $nrc->career->department->name,
                'period'     => $nrc->academicPeriod->name,
            ],
            'groupDistribution' => $groupDist,
            'totalStudents'     => $totalStudents,
            'results'           => $results,
            'recommendations'   => $recommendations,
            'totals'            => $totals,
        ]);
    }

    /**
     * Descarga CSV de recomendaciones de un NRC (sin datos identificativos).
     */
    public function downloadCsv(Nrc $nrc): HttpResponse
    {
        abort_unless($nrc->status === 'analyzed', 404);

        $recommendations = Recommendation::where('nrc_id', $nrc->id)
            ->orderByRaw("FIELD(type, 'practice', 'barrier')")
            ->orderByDesc('percentage')
            ->get();

        $rows = [];
        $rows[] = implode(',', [
            'Tipo',
            'Pregunta',
            'Respuesta predominante',
            'Frecuencia',
            'Total respondentes',
            'Porcentaje (%)',
        ]);

        foreach ($recommendations as $rec) {
            $rows[] = implode(',', [
                '"'.($rec->type === 'practice' ? 'Práctica validada' : 'Barrera detectada').'"',
                '"'.str_replace('"', '""', $rec->question_snapshot).'"',
                '"'.str_replace('"', '""', $rec->answer_snapshot).'"',
                $rec->frequency,
                $rec->total,
                number_format((float) $rec->percentage, 1),
            ]);
        }

        $csv = "\xEF\xBB\xBF".implode("\n", $rows); // BOM UTF-8

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"reporte_nrc_{$nrc->code}.csv\"",
        ]);
    }
}
