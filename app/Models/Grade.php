<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = [
        'student_id',
        'nrc_id',
        'partial_1',
        'partial_2',
        'partial_3',
        'final_grade',
        'locked_at',
    ];

    protected function casts(): array
    {
        return [
            'partial_1'   => 'decimal:2',
            'partial_2'   => 'decimal:2',
            'partial_3'   => 'decimal:2',
            'final_grade' => 'decimal:2',
            'locked_at'   => 'datetime',
        ];
    }

    public function isLocked(): bool
    {
        return $this->locked_at !== null;
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function nrc(): BelongsTo
    {
        return $this->belongsTo(Nrc::class);
    }
}
