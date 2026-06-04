<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'nrc_id',
        'analysis_result_id',
        'type',
        'question_snapshot',
        'answer_snapshot',
        'percentage',
        'frequency',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:2',
        ];
    }

    public function nrc(): BelongsTo
    {
        return $this->belongsTo(Nrc::class);
    }

    public function analysisResult(): BelongsTo
    {
        return $this->belongsTo(AnalysisResult::class);
    }
}
