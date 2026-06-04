<?php

namespace App\Jobs;

use App\Models\Nrc;
use App\Services\AnalysisEngine;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RunAnalysisJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Nrc $nrc
    ) {}

    public function handle(AnalysisEngine $engine): void
    {
        $engine->analyze($this->nrc);
    }
}
