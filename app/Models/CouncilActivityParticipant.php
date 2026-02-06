<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CouncilActivityParticipant extends Model
{
    protected $fillable = [
        'activity_id',
        'user_id',
        'points_awarded',
        'awarded_at',
    ];

    protected function casts(): array
    {
        return [
            'points_awarded' => 'boolean',
            'awarded_at' => 'datetime',
        ];
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(CouncilActivity::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
