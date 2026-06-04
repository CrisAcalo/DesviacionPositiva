<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalysisResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'nrc_id',
        'survey_question_id',
        'group',
        'frequencies',
        'top_answer_value',
        'top_answer_label',
        'top_count',
        'total_responses',
        'top_percentage',
        'is_validated',
    ];

    protected function casts(): array
    {
        return [
            'frequencies'    => 'array',
            'top_percentage' => 'decimal:2',
            'is_validated'   => 'boolean',
        ];
    }

    public function nrc(): BelongsTo
    {
        return $this->belongsTo(Nrc::class);
    }

    public function surveyQuestion(): BelongsTo
    {
        return $this->belongsTo(SurveyQuestion::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class);
    }
}
