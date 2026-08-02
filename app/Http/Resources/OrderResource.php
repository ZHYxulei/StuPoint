<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_no' => $this->order_no,
            'user_id' => $this->user_id,
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'unit_points_spent' => $this->unit_points_spent,
            'points_spent' => $this->points_spent,
            'status' => $this->status,
            'verification_code' => $this->when(
                $this->canExposeVerificationCode($request),
                $this->verification_code
            ),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),

            // Relations
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'image' => $this->product->image,
                'points_required' => $this->product->points_required,
            ]),
            'statusHistory' => $this->whenLoaded('statusHistory', fn () => $this->statusHistory->map(fn ($history) => [
                'id' => $history->id,
                'from_status' => $history->from_status,
                'to_status' => $history->to_status,
                'note' => $history->note,
                'created_at' => $history->created_at?->toIso8601String(),
            ])),
        ];
    }

    private function canExposeVerificationCode(Request $request): bool
    {
        return $request->user()?->id === $this->user_id
            && $this->verification_code !== null
            && ! in_array($this->status, ['completed', 'cancelled'], true)
            && $this->verification_code_expires_at?->isFuture() === true;
    }
}
