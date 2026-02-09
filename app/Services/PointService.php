<?php

namespace App\Services;

use App\Events\PointsChanged;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Support\Facades\DB;

class PointService
{
    /**
     * Add points to user (both total and redeemable).
     */
    public function addPoints(User $user, int $amount, string $source, array $metadata = []): void
    {
        DB::transaction(function () use ($user, $amount, $source, $metadata) {
            $points = $user->points ?? UserPoint::create(['user_id' => $user->id]);

            // Update total points and redeemable points
            $points->total_points += $amount;
            $points->redeemable_points += $amount;
            $points->save();

            // Record total points transaction
            PointTransaction::create([
                'user_id' => $user->id,
                'type' => 'total',
                'amount' => $amount,
                'balance_after' => $points->total_points,
                'source' => $source,
                'description' => $metadata['description'] ?? "Added {$amount} total points",
                'metadata' => $metadata,
            ]);

            // Record redeemable points transaction
            PointTransaction::create([
                'user_id' => $user->id,
                'type' => 'redeemable',
                'amount' => $amount,
                'balance_after' => $points->redeemable_points,
                'source' => $source,
                'description' => $metadata['description'] ?? "Added {$amount} redeemable points",
                'metadata' => $metadata,
            ]);

            // Trigger events
            event(new PointsChanged($user, $amount, 'total', $source));
            event(new PointsChanged($user, $amount, 'redeemable', $source));
        });
    }

    /**
     * Deduct only redeemable points (total points unchanged).
     */
    public function deductRedeemablePoints(User $user, int $amount, string $source, array $metadata = []): void
    {
        DB::transaction(function () use ($user, $amount, $source, $metadata) {
            $points = $user->points;

            if (! $points || $points->redeemable_points < $amount) {
                throw new \Exception('Insufficient redeemable points');
            }

            // Only deduct redeemable points, total points unchanged
            $points->redeemable_points -= $amount;
            $points->save();

            // Record redeemable points transaction
            PointTransaction::create([
                'user_id' => $user->id,
                'type' => 'redeemable',
                'amount' => -$amount,
                'balance_after' => $points->redeemable_points,
                'source' => $source,
                'description' => $metadata['description'] ?? "Deducted {$amount} redeemable points",
                'metadata' => $metadata,
            ]);

            event(new PointsChanged($user, -$amount, 'redeemable', $source));
        });
    }

    /**
     * Get user's current point balance.
     */
    public function getBalance(User $user): array
    {
        $points = $user->points;

        return [
            'total_points' => $points?->total_points ?? 0,
            'redeemable_points' => $points?->redeemable_points ?? 0,
        ];
    }

    /**
     * Get user's point transaction history.
     */
    public function getTransactionHistory(User $user, ?string $type = null, int $limit = 50)
    {
        $query = PointTransaction::query()->forUser($user->id)->recent();

        if ($type) {
            $query->byType($type);
        }

        return $query->limit($limit)->get();
    }

    /**
     * Check if operator can modify target user's points.
     * Student union members can modify points of students from other classes.
     */
    public function canModifyPoints(User $operator, User $target): bool
    {
        // Users cannot modify their own points through this method
        if ($operator->id === $target->id) {
            return false;
        }

        // Only approved users can modify points
        if ($operator->registration_status !== 'approved') {
            return false;
        }

        // Student union members can modify any student's points
        if ($operator->hasRole('student_union_member') && $target->hasRole('student')) {
            return true;
        }

        // Teachers can modify points of students in their teaching classes
        if ($operator->hasRole('teacher') && $target->hasRole('student')) {
            $teachingClassIds = $operator->teachingClasses()->pluck('classes.id')->toArray();

            return in_array($target->class_id, $teachingClassIds);
        }

        // Admins can modify anyone's points
        if ($operator->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return false;
    }
}
