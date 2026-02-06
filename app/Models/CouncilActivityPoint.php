<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CouncilActivityPoint extends Model
{
    protected $fillable = [
        'activity_id',
        'user_id',
        'amount',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
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
