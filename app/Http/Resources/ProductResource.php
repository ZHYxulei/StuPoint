<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'image' => $this->image,
            'points_required' => $this->points_required,
            'stock' => $this->stock,
            'category_id' => $this->category_id,
            'status' => $this->status,
            'requires_verification' => $this->requires_verification,
            'max_per_user' => $this->max_per_user,
            'created_at' => $this->created_at?->toIso8601String(),

            // Relations
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
        ];
    }
}
