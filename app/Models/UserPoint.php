<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserPoint extends Model
{
    protected $fillable = [
        'user_id',
        'total_points',
        'redeemable_points',
    ];

    protected function casts(): array
    {
        return [
            'total_points' => 'integer',
            'redeemable_points' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class, 'user_id');
    }

    public function addTotalPoints(int $amount): void
    {
        $this->total_points += $amount;
        $this->save();
    }

    public function addRedeemablePoints(int $amount): void
    {
        $this->redeemable_points += $amount;
        $this->save();
    }

    public function deductRedeemablePoints(int $amount): bool
    {
        if ($this->redeemable_points < $amount) {
            return false;
        }

        $this->redeemable_points -= $amount;
        $this->save();

        return true;
    }
}
