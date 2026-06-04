<?php

namespace App\Jobs;

use App\Models\Nrc;
use App\Services\GradeImportService;
use App\Jobs\SegmentStudentsJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ImportGradesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public int $tries = 3;

    public function __construct(
        private readonly Nrc $nrc,
        private readonly string $storagePath,
    ) {}

    public function handle(GradeImportService $service): void
    {
        $rows = json_decode(Storage::get($this->storagePath), true);

        $service->import($this->nrc, $rows);

        Storage::delete($this->storagePath);

        SegmentStudentsJob::dispatch($this->nrc);
    }

    public function failed(\Throwable $e): void
    {
        Storage::delete($this->storagePath);
    }
}
