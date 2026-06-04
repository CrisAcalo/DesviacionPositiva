<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    use HasFactory;
    protected $fillable = ['uuid', 'identifier_hash', 'nrc_id', 'email'];

    protected $hidden = ['identifier_hash', 'email'];

    public function nrc(): BelongsTo
    {
        return $this->belongsTo(Nrc::class);
    }

    public function grade(): HasOne
    {
        return $this->hasOne(Grade::class);
    }

    public function group(): HasOne
    {
        return $this->hasOne(StudentGroup::class);
    }

    public function surveyResponses(): HasMany
    {
        return $this->hasMany(SurveyResponse::class);
    }

    public function accessTokens(): HasMany
    {
        return $this->hasMany(SurveyAccessToken::class);
    }
}
