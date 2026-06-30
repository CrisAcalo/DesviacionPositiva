<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Survey extends Model
{
    use HasFactory;
    protected $fillable = [
        'nrc_id',
        'group',
        'title',
        'description',
        'status',
        'questions_per_page',
        'activated_at',
        'closes_at',
        'activated_by',
    ];

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
            'closes_at'    => 'datetime',
        ];
    }

    public function nrc(): BelongsTo
    {
        return $this->belongsTo(Nrc::class);
    }

    public function activator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'activated_by');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(SurveyQuestion::class)->orderBy('order');
    }

    public function accessTokens(): HasMany
    {
        return $this->hasMany(SurveyAccessToken::class);
    }

    public function isOpen(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        return $this->closes_at === null || now()->isBefore($this->closes_at);
    }

    public function responsesCount(): int
    {
        return $this->accessTokens()->whereNotNull('used_at')->count();
    }
}
