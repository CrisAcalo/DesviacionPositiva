<?php

namespace App\Http\Controllers;

use App\Jobs\RunAnalysisJob;
use App\Models\Nrc;
use App\Services\AnalysisEngine;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AnalysisController extends Controller
{
    public function __construct(
        private readonly AnalysisEngine $engine
    ) {}

    /**
     * Ejecuta el análisis para un NRC (bajo demanda, sin mínimo de muestra).
     * Usa la cola sync para ejecución inmediata; cambiar a dispatch() para async.
     */
    public function run(Nrc $nrc): RedirectResponse
    {
        abort_unless(
            in_array($nrc->status, ['surveying', 'analyzed']),
            422,
            'El NRC debe tener encuestas activas para ejecutar el análisis.'
        );

        // Ejecutar de forma sincrónica (QUEUE_CONNECTION=sync en .env)
        // Para async: RunAnalysisJob::dispatch($nrc);
        $this->engine->analyze($nrc);

        // Volver al NRC para que el coordinador pueda seguir viendo las encuestas activas
        // y acceder a los resultados desde el botón "Ver resultados" que aparece ahí.
        return redirect()
            ->route('nrcs.show', $nrc)
            ->with('toast', ['type' => 'success', 'message' => 'Análisis completado. Las encuestas siguen activas hasta que las cierres manualmente.']);
    }

    /**
     * Muestra los resultados del análisis de un NRC.
     */
    public function show(Nrc $nrc): Response
    {
        abort_unless($nrc->status === 'analyzed', 404);

        $nrc->load(['subject', 'career', 'academicPeriod']);
        $data = $this->engine->getResultsForNrc($nrc);

        return Inertia::render('analysis/show', [
            'nrc'             => [
                'id'      => $nrc->id,
                'code'    => $nrc->code,
                'subject' => $nrc->subject->name,
                'career'  => $nrc->career->name,
                'period'  => $nrc->academicPeriod->name,
            ],
            'results'         => $data['results'],
            'recommendations' => $data['recommendations'],
            'totals'          => $data['totals'],
        ]);
    }
}
