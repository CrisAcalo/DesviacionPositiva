<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNrcRequest;
use App\Jobs\SegmentStudentsJob;
use App\Models\AcademicPeriod;
use App\Models\Career;
use App\Models\Department;
use App\Models\Nrc;
use App\Models\Subject;
use App\Services\GradeImportService;
use App\Services\SurveyActivationService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Response;
use Illuminate\Support\Str;

class NrcController extends Controller
{
    public function __construct(
        private readonly GradeImportService $importService,
        private readonly SurveyActivationService $surveyService,
    ) {}

    public function index(): Response
    {
        $nrcs = Nrc::with(['uploader', 'subject', 'career', 'career.department', 'academicPeriod'])
            ->when(! auth()->user()->hasRole('admin'), fn ($q) => $q->where('uploaded_by', auth()->id()))
            ->latest()
            ->paginate(20);

        return inertia('nrcs/index', ['nrcs' => $nrcs]);
    }

    public function create(): Response
    {
        return inertia('nrcs/create', [
            'departments'     => Department::with('careers')->orderBy('name')->get(),
            'careers'         => Career::with('department')->orderBy('name')->get(),
            'subjects'        => Subject::orderBy('name')->get(),
            'academicPeriods' => AcademicPeriod::orderByDesc('name')->get(),
        ]);
    }

    public function store(StoreNrcRequest $request): RedirectResponse
    {
        $results   = [];
        $hasErrors = false;

        // Get or create academic period
        $periodName = $request->input('academic_period');
        $period = AcademicPeriod::firstOrCreate(
            ['name' => $periodName],
            ['is_active' => true]
        );

        foreach ($request->file('files') as $index => $file) {
            $meta = $request->input("uploads.{$index}");

            $nrc = Nrc::create([
                'code'               => $meta['code'],
                'subject_id'         => $meta['subject_id'],
                'career_id'          => $meta['career_id'],
                'academic_period_id' => $period->id,
                'uploaded_by'        => auth()->id(),
            ]);

            try {
                $result = $this->importService->importFromFile($nrc, $file);
            } catch (UniqueConstraintViolationException) {
                $nrc->forceDelete();
                $hasErrors = true;
                $results[] = [
                    'file'    => $file->getClientOriginalName(),
                    'success' => false,
                    'errors'  => ['El archivo contiene cédulas duplicadas en sus propias filas. Cada estudiante debe aparecer una sola vez por archivo. Nota: un mismo estudiante sí puede estar en NRCs de materias distintas.'],
                ];
                continue;
            }

            if (! empty($result['errors'])) {
                $nrc->forceDelete();
                $hasErrors = true;

                $results[] = [
                    'file'    => $file->getClientOriginalName(),
                    'success' => false,
                    'errors'  => $result['errors'],
                ];
            } else {
                // For sync imports, trigger segmentation now.
                // For queued imports, SegmentStudentsJob is dispatched by ImportGradesJob after it finishes.
                if (! $result['queued']) {
                    SegmentStudentsJob::dispatch($nrc);
                }

                $results[] = [
                    'file'    => $file->getClientOriginalName(),
                    'success' => true,
                    'count'   => count($result['rows']),
                    'queued'  => $result['queued'],
                ];
            }
        }

        $total   = array_sum(array_column(array_filter($results, fn ($r) => $r['success']), 'count'));
        $message = count($results) === 1
            ? "{$total} estudiante(s) importados exitosamente."
            : count(array_filter($results, fn ($r) => $r['success'])).' NRC(s) importados ('.$total.' estudiantes en total).';

        if ($hasErrors) {
            $errorCount = count(array_filter($results, fn ($r) => ! $r['success']));
            return back()
                ->withInput()
                ->with('importResults', $results)
                ->with('toast', [
                    'type'    => 'error',
                    'message' => "{$errorCount} archivo(s) con errores. Revisa los detalles y corrige el archivo antes de volver a subir.",
                ]);
        }

        return redirect()->route('nrcs.index')
            ->with('toast', ['type' => 'success', 'message' => $message]);
    }

    public function show(Nrc $nrc): Response
    {
        Gate::authorize('view', $nrc);

        $nrc->load(['uploader', 'subject', 'career.department', 'academicPeriod', 'students.grade', 'students.group']);

        $groupCounts = $nrc->studentGroups()
            ->select('group', DB::raw('count(*) as total'))
            ->groupBy('group')
            ->pluck('total', 'group');

        $surveyCompliance = $nrc->status === 'surveying' || $nrc->status === 'analyzed'
            ? $this->surveyService->getComplianceData($nrc)
            : null;

        $surveys = $nrc->surveys()->select('id', 'group', 'status', 'closes_at', 'activated_at')->get()->keyBy('group');

        $activeQuestionCounts = [
            'high' => \App\Models\QuestionBank::active()->forGroup('high')->count(),
            'medium' => \App\Models\QuestionBank::active()->forGroup('medium')->count(),
            'at_risk' => \App\Models\QuestionBank::active()->forGroup('at_risk')->count(),
        ];

        return inertia('nrcs/show', [
            'nrc'                  => $nrc,
            'groupCounts'          => $groupCounts,
            'surveyCompliance'     => $surveyCompliance,
            'surveys'              => $surveys,
            'activeQuestionCounts' => $activeQuestionCounts,
        ]);
    }

    public function destroy(Nrc $nrc): RedirectResponse
    {
        Gate::authorize('delete', $nrc);

        $nrc->forceDelete();

        return redirect()->route('nrcs.index')
            ->with('toast', ['type' => 'success', 'message' => "NRC {$nrc->code} eliminado correctamente."]);
    }
}
