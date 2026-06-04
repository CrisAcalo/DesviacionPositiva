<?php

namespace App\Http\Controllers;

use App\Models\Nrc;
use App\Models\Survey;
use App\Models\StudentGroup;
use App\Models\AnalysisResult;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Total NRCs
        $totalNrcs = Nrc::count();

        // Total students
        $totalStudents = StudentGroup::distinct('student_id')->count();

        // Active surveys
        $activeSurveys = Survey::where('status', 'active')->count();

        // Completed analyses
        $completedAnalyses = Nrc::where('status', 'analyzed')->count();

        // Student distribution by group
        $groupDistribution = StudentGroup::selectRaw('`group`, COUNT(*) as total')
            ->groupBy('group')
            ->pluck('total', 'group')
            ->toArray();

        // Validated results per NRC (for chart)
        $validatedResultsPerNrc = AnalysisResult::where('is_validated', true)
            ->selectRaw('nrc_id, COUNT(*) as count')
            ->groupBy('nrc_id')
            ->pluck('count', 'nrc_id')
            ->toArray();

        // NRC status breakdown
        $nrcsByStatus = Nrc::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return inertia('dashboard', [
            'stats' => [
                'totalNrcs' => $totalNrcs,
                'totalStudents' => $totalStudents,
                'activeSurveys' => $activeSurveys,
                'completedAnalyses' => $completedAnalyses,
            ],
            'groupDistribution' => $groupDistribution,
            'validatedResultsPerNrc' => $validatedResultsPerNrc,
            'nrcsByStatus' => $nrcsByStatus,
        ]);
    }
}
