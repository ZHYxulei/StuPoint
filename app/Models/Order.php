<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_no',
        'user_id',
        'product_id',
        'quantity',
        'unit_points_spent',
        'points_spent',
        'status',
        'shipping_info',
        'third_party_order_id',
        'metadata',
        'verification_code',
        'verification_code_expires_at',
        'verified_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_points_spent' => 'integer',
            'points_spent' => 'integer',
            'shipping_info' => 'array',
            'metadata' => 'array',
            'verified_at' => 'datetime',
            'verification_code_expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function updateStatus(string $newStatus, ?string $note = null, ?int $operatorId = null): void
    {
        if ($newStatus === $this->status) {
            throw new RuntimeException('订单状态未发生变化');
        }

        if (! $this->canTransitionTo($newStatus)) {
            throw new RuntimeException('非法的订单状态流转');
        }

        DB::transaction(function () use ($newStatus, $note, $operatorId) {
            $order = static::query()->lockForUpdate()->with(['product', 'user.points'])->findOrFail($this->id);
            $oldStatus = $order->status;

            if ($newStatus === $oldStatus) {
                throw new RuntimeException('订单状态未发生变化');
            }

            if (! $order->canTransitionTo($newStatus)) {
                throw new RuntimeException('非法的订单状态流转');
            }

            if ($order->shouldCompensateForTransition($newStatus)) {
                $product = Product::query()->lockForUpdate()->findOrFail($order->product_id);
                $points = $order->user->points()->lockForUpdate()->first();

                $product->increaseStock($order->quantity);

                if (! $points) {
                    $points = UserPoint::create([
                        'user_id' => $order->user_id,
                        'total_points' => 0,
                        'redeemable_points' => 0,
                    ]);
                }

                $points->increment('redeemable_points', $order->points_spent);

                PointTransaction::create([
                    'user_id' => $order->user_id,
                    'type' => 'redeemable',
                    'amount' => $order->points_spent,
                    'balance_after' => $points->fresh()->redeemable_points,
                    'source' => 'order_compensation',
                    'description' => $note ?? "Order {$order->order_no} compensated",
                    'metadata' => [
                        'order_id' => $order->id,
                        'to_status' => $newStatus,
                        'quantity' => $order->quantity,
                    ],
                    'operator_id' => $operatorId,
                ]);
            }

            $order->forceFill(['status' => $newStatus])->save();

            $order->statusHistory()->create([
                'from_status' => $oldStatus,
                'to_status' => $newStatus,
                'note' => $note,
                'operator_id' => $operatorId,
            ]);

            $this->forceFill(['status' => $newStatus])->syncOriginal();
        });
    }

    public function canTransitionTo(string $newStatus): bool
    {
        return match ($this->status) {
            'pending' => in_array($newStatus, ['processing', 'completed', 'cancelled', 'failed'], true),
            'processing' => in_array($newStatus, ['completed', 'cancelled', 'failed'], true),
            'completed', 'cancelled', 'failed' => false,
            default => false,
        };
    }

    public function shouldCompensateForTransition(string $newStatus): bool
    {
        return in_array($this->status, ['pending', 'processing'], true)
            && in_array($newStatus, ['cancelled', 'failed'], true);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function isVerificationCodeExpired(): bool
    {
        if (! $this->verification_code_expires_at) {
            return true;
        }

        return $this->verification_code_expires_at->isPast();
    }

    public function scopePendingVerification($query)
    {
        return $query->whereNull('verified_at')->where('status', '!=', 'cancelled');
    }
}
