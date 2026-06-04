<?php

namespace App\Services;

use App\Models\Nrc;
use App\Models\StudentGroup;
use Illuminate\Support\Facades\DB;

class SegmentationService
{
    private const HIGH_THRESHOLD    = 8.5;
    private const AT_RISK_THRESHOLD = 6.0;

    public function segment(Nrc $nrc): void
    {
        $students = $nrc->students()->with('grade')->get();

        DB::transaction(function () use ($nrc, $students) {
            foreach ($students as $student) {
                if ($student->grade === null) {
                    continue;
                }

                $group = $this->classify((float) $student->grade->final_grade);

                StudentGroup::updateOrCreate(
                    ['student_id' => $student->id, 'nrc_id' => $nrc->id],
                    ['group' => $group]
                );
            }

            $nrc->update(['status' => 'segmented']);
        });
    }

    private function classify(float $grade): string
    {
        if ($grade > self::HIGH_THRESHOLD) {
            return 'high';
        }

        if ($grade >= self::AT_RISK_THRESHOLD) {
            return 'medium';
        }

        return 'at_risk';
    }
}
