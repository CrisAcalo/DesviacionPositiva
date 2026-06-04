<?php

namespace App\Jobs;

use App\Models\Nrc;
use App\Services\SegmentationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SegmentStudentsJob implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Nrc $nrc) {}

    public function handle(SegmentationService $service): void
    {
        $service->segment($this->nrc);
    }
}
