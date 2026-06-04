<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentGroup extends Model
{
    use HasFactory;
    protected $fillable = ['student_id', 'nrc_id', 'group'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function nrc(): BelongsTo
    {
        return $this->belongsTo(Nrc::class);
    }
}
