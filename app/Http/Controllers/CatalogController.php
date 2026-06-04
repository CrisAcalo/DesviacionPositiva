<?php

namespace App\Http\Controllers;

use App\Models\Career;
use App\Models\Department;
use App\Models\Subject;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(): Response
    {
        return inertia('catalogs/index', [
            'departments' => Department::withCount('careers')
                ->orderBy('name')
                ->get(),
            'careers' => Career::with('department')
                ->withCount('nrcs')
                ->orderBy('name')
                ->get(),
            'subjects' => Subject::withCount('nrcs')
                ->orderBy('name')
                ->get(),
        ]);
    }
}
