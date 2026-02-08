<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_no',
        'user_id',
        'product_id',
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
        $oldStatus = $this->status;

        $this->update(['status' => $newStatus]);

        $this->statusHistory()->create([
            'from_status' => $oldStatus,
            'to_status' => $newStatus,
            'note' => $note,
            'operator_id' => $operatorId,
        ]);
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
