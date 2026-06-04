<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyResponse extends Model
{
    use HasFactory;
    protected $fillable = ['student_id', 'survey_question_id', 'nrc_id', 'answer', 'submitted_at'];

    protected function casts(): array
    {
        return [
            'answer'       => 'array',
            'submitted_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(SurveyQuestion::class, 'survey_question_id');
    }

    public function nrc(): BelongsTo
    {
        return $this->belongsTo(Nrc::class);
    }
}
