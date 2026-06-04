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
                    'errors'  => ['Este archivo contiene estudiantes que ya fueron importados en este NRC. Verifica que no estés subiendo el mismo archivo dos veces.'],
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

        if ($hasErrors) {
            return back()
                ->withInput()
                ->with('importResults', $results)
                ->with('toast', ['type' => 'error', 'message' => 'Uno o más archivos tuvieron errores.']);
        }

        $total   = array_sum(array_column(array_filter($results, fn ($r) => $r['success']), 'count'));
        $message = count($results) === 1
            ? "{$total} estudiantes importados exitosamente."
            : count($results).' NRCs importados ('.$total.' estudiantes en total).';

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

        return inertia('nrcs/show', [
            'nrc'              => $nrc,
            'groupCounts'      => $groupCounts,
            'surveyCompliance' => $surveyCompliance,
            'surveys'          => $surveys,
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
