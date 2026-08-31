<?php

namespace App\Services;

use App\Models\ParentBindingInvitation;
use App\Models\ParentChild;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ParentBindingService
{
    /**
     * Bind a parent to a child through a single-use invitation code.
     *
     * @throws ValidationException when the invitation is invalid, expired, consumed, or revoked.
     */
    public function bindParent(
        User $parent,
        string $studentId,
        string $invitationCode,
        string $relationship,
    ): ParentChild {
        return DB::transaction(function () use ($parent, $studentId, $invitationCode, $relationship) {
            $student = User::query()
                ->where('student_id', $studentId)
                ->firstOrFail();

            $invitation = ParentBindingInvitation::query()
                ->where('student_id', $student->id)
                ->where('code_hash', hash('sha256', strtoupper($invitationCode)))
                ->lockForUpdate()
                ->first();

            if ($invitation === null
                || $invitation->isExpired()
                || $invitation->isConsumed()
                || $invitation->isRevoked()) {
                throw ValidationException::withMessages([
                    'invitation_code' => '邀请码无效、已过期或已使用。',
                ]);
            }

            $relation = ParentChild::query()->updateOrCreate(
                ['parent_id' => $parent->id, 'child_id' => $student->id],
                [
                    'relationship' => $relationship,
                    'is_approved' => true,
                    'approved_at' => now(),
                ],
            );

            $invitation->update([
                'consumed_at' => now(),
                'consumed_by_parent_id' => $parent->id,
            ]);

            return $relation;
        }, attempts: 3);
    }
}
