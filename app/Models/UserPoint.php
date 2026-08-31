<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\QueryException;

class UserPoint extends Model
{
    use HasFactory;

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

    public static function ensureForUser(User $user): self
    {
        $existingPoints = $user->points()->first();

        if ($existingPoints) {
            return $existingPoints;
        }

        try {
            $points = static::query()->create([
                'user_id' => $user->id,
                'total_points' => 0,
                'redeemable_points' => 0,
            ]);
        } catch (QueryException $exception) {
            if (! static::isDuplicateUserIdException($exception)) {
                throw $exception;
            }

            $points = static::query()
                ->where('user_id', $user->id)
                ->firstOrFail();
        }

        $user->setRelation('points', $points);

        return $points;
    }

    protected static function isDuplicateUserIdException(QueryException $exception): bool
    {
        return ($exception->errorInfo[0] ?? null) === '23000'
            || ($exception->errorInfo[1] ?? null) === 1062;
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
