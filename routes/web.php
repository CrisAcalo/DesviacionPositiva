<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\CareerController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\NrcController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\QuestionBankController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\SurveyResponseController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Encuesta pública — acceso por token, sin autenticación
Route::get('/encuesta/{token}', [SurveyResponseController::class, 'show'])->name('survey.respond');
Route::post('/encuesta/{token}', [SurveyResponseController::class, 'store'])->name('survey.respond.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware(['role:admin'])->group(function () {
        // Gestión de usuarios y roles
        Route::resource('users', UserController::class)->except(['show']);
        Route::resource('roles', \App\Http\Controllers\RoleController::class)->only(['index', 'update']);

        // Catálogos (departamentos, carreras, materias)
        Route::get('catalogs', [CatalogController::class, 'index'])->name('catalogs.index');
        Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store');
        Route::put('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
        Route::delete('departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
        Route::post('careers', [CareerController::class, 'store'])->name('careers.store');
        Route::put('careers/{career}', [CareerController::class, 'update'])->name('careers.update');
        Route::delete('careers/{career}', [CareerController::class, 'destroy'])->name('careers.destroy');
        Route::post('subjects', [SubjectController::class, 'store'])->name('subjects.store');
        Route::put('subjects/{subject}', [SubjectController::class, 'update'])->name('subjects.update');
        Route::delete('subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');
    });

    Route::middleware(['role:admin|coordinator'])->group(function () {
        // NRCs
        Route::resource('nrcs', NrcController::class)->only(['index', 'create', 'store', 'show', 'destroy']);

        // Encuestas por NRC
        Route::post('nrcs/{nrc}/surveys/activate', [SurveyController::class, 'activate'])->name('nrcs.surveys.activate');
        Route::delete('nrcs/{nrc}/surveys/reset', [SurveyController::class, 'reset'])->name('nrcs.surveys.reset');
        Route::post('nrcs/{nrc}/surveys/{survey}/close', [SurveyController::class, 'close'])->name('nrcs.surveys.close');
        Route::post('nrcs/{nrc}/surveys/{survey}/reopen', [SurveyController::class, 'reopen'])->name('nrcs.surveys.reopen');
        Route::post('nrcs/{nrc}/surveys/{survey}/send-emails', [SurveyController::class, 'sendEmails'])->name('nrcs.surveys.send-emails');
        Route::get('nrcs/{nrc}/surveys/tokens.csv', [SurveyController::class, 'downloadCsv'])->name('nrcs.surveys.csv');
        Route::get('api/surveys/{survey}/tokens', [SurveyController::class, 'tokens'])->name('surveys.tokens');

        // Banco de preguntas
        Route::get('question-bank/export', [QuestionBankController::class, 'exportCsv'])->name('question-bank.export');
        Route::resource('question-bank', QuestionBankController::class)
            ->parameters(['question-bank' => 'questionBank'])
            ->except(['show']);

        // Análisis de desviación positiva
        Route::post('nrcs/{nrc}/analysis/run', [AnalysisController::class, 'run'])->name('nrcs.analysis.run');
        Route::get('nrcs/{nrc}/analysis', [AnalysisController::class, 'show'])->name('nrcs.analysis.show');

        // Reportes
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/{nrc}', [ReportController::class, 'show'])->name('reports.show');
        Route::get('reports/{nrc}/recommendations.csv', [ReportController::class, 'downloadCsv'])->name('reports.csv');
    });
});

require __DIR__.'/settings.php';
