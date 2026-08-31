<?php

namespace App\Services;

use App\Events\PointsChanged;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class PointService
{
    public function addPoints(User $user, int $amount, string $source, array $metadata = []): void
    {
        $this->ensurePositiveAmount($amount);

        DB::transaction(function () use ($user, $amount, $source, $metadata) {
            $points = $this->lockUserPoints($user);
            $operatorId = $metadata['operator_id'] ?? null;

            $points->total_points += $amount;
            $points->redeemable_points += $amount;
            $points->save();

            PointTransaction::create([
                'user_id' => $user->id,
                'type' => 'total',
                'amount' => $amount,
                'balance_after' => $points->total_points,
                'source' => $source,
                'description' => $metadata['description'] ?? "Added {$amount} total points",
                'metadata' => $metadata,
                'operator_id' => $operatorId,
            ]);

            PointTransaction::create([
                'user_id' => $user->id,
                'type' => 'redeemable',
                'amount' => $amount,
                'balance_after' => $points->redeemable_points,
                'source' => $source,
                'description' => $metadata['description'] ?? "Added {$amount} redeemable points",
                'metadata' => $metadata,
                'operator_id' => $operatorId,
            ]);

            event(new PointsChanged($user, $amount, 'total', $source));
            event(new PointsChanged($user, $amount, 'redeemable', $source));
        }, attempts: 5);
    }

    public function deductRedeemablePoints(User $user, int $amount, string $source, array $metadata = []): void
    {
        $this->ensurePositiveAmount($amount);

        DB::transaction(function () use ($user, $amount, $source, $metadata) {
            $points = $this->lockUserPoints($user);
            $operatorId = $metadata['operator_id'] ?? null;

            if ($points->redeemable_points < $amount) {
                throw new \Exception('可兑换积分不足');
            }

            $points->redeemable_points -= $amount;
            $points->save();

            PointTransaction::create([
                'user_id' => $user->id,
                'type' => 'redeemable',
                'amount' => -$amount,
                'balance_after' => $points->redeemable_points,
                'source' => $source,
                'description' => $metadata['description'] ?? "Deducted {$amount} redeemable points",
                'metadata' => $metadata,
                'operator_id' => $operatorId,
            ]);

            event(new PointsChanged($user, -$amount, 'redeemable', $source));
        }, attempts: 5);
    }

    public function getBalance(User $user): array
    {
        $points = $user->points;

        return [
            'total_points' => $points?->total_points ?? 0,
            'redeemable_points' => $points?->redeemable_points ?? 0,
        ];
    }

    public function getTransactionHistory(User $user, ?string $type = null, int $limit = 50)
    {
        $query = PointTransaction::query()->forUser($user->id)->recent();

        if ($type) {
            $query->byType($type);
        }

        return $query->limit($limit)->get();
    }

    public function canModifyPoints(User $operator, User $target): bool
    {
        if ($operator->id === $target->id) {
            return false;
        }

        if ($operator->registration_status !== 'approved') {
            return false;
        }

        if ($operator->hasRole('student_union_member') && $target->hasRole('student')) {
            return true;
        }

        if ($operator->hasRole('teacher') && $target->hasRole('student')) {
            $teachingClassIds = $operator->teachingClasses()->pluck('classes.id')->toArray();

            return in_array($target->class_id, $teachingClassIds);
        }

        if ($operator->hasRole('admin') || $operator->hasRole('super_admin')) {
            return true;
        }

        return false;
    }

    protected function ensurePositiveAmount(int $amount): void
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException('积分数量必须为正整数');
        }
    }

    protected function lockUserPoints(User $user): UserPoint
    {
        $points = $user->points()->lockForUpdate()->first();

        if ($points) {
            $user->setRelation('points', $points);

            return $points;
        }

        UserPoint::ensureForUser($user);

        $lockedPoints = $user->points()->lockForUpdate()->first();

        if (! $lockedPoints) {
            throw new RuntimeException('用户积分记录不存在');
        }

        $user->setRelation('points', $lockedPoints);

        return $lockedPoints;
    }
}
