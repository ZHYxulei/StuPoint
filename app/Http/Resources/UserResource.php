<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'phone' => $this->phone,
            'student_id' => $this->student_id,
            'avatar' => $this->avatar_path,
            'grade_id' => $this->grade_id,
            'class_id' => $this->class_id,
            'is_head_teacher' => $this->is_head_teacher,
            'registration_status' => $this->registration_status,
            'created_at' => $this->created_at?->toIso8601String(),

            // Conditional fields
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('slug')),
            'points' => $this->whenLoaded('points', fn () => [
                'total_points' => $this->points?->total_points ?? 0,
                'redeemable_points' => $this->points?->redeemable_points ?? 0,
            ]),

            // Relations
            'grade' => $this->whenLoaded('grade', fn () => [
                'id' => $this->grade->id,
                'name' => $this->grade->name,
            ]),
            'class' => $this->whenLoaded('class', fn () => [
                'id' => $this->class->id,
                'name' => $this->class->name,
            ]),
        ];
    }
}
