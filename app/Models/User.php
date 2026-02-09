<?php

namespace App\Models;

use App\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'nickname',
        'email',
        'password',
        'phone',
        'student_id',
        'id_number',
        'grade',
        'class',
        'is_head_teacher',
        'avatar',
        'last_login_at',
        'last_login_ip',
        'registration_status',
        'requires_review',
        'reviewer_id',
        'reviewed_at',
        'rejection_reason',
        'class_id',
        'grade_id',
        'student_union_department',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_head_teacher' => 'boolean',
            'requires_review' => 'boolean',
            'reviewed_at' => 'datetime',
        ];
    }

    public function points(): HasOne
    {
        return $this->hasOne(UserPoint::class);
    }

    public function headOfClass(): HasOne
    {
        return $this->hasOne(SchoolClass::class, 'head_teacher_id');
    }

    public function schoolClassesAsTeacher(): HasMany
    {
        return $this->hasMany(ClassTeacher::class, 'teacher_id');
    }

    public function schoolClassesAsStudent(): HasMany
    {
        return $this->hasMany(ClassStudent::class, 'student_id');
    }

    public function parentRelations(): HasMany
    {
        return $this->hasMany(ParentChild::class, 'parent_id');
    }

    public function childRelations(): HasMany
    {
        return $this->hasMany(ParentChild::class, 'child_id');
    }

    public function parents(): HasMany
    {
        return $this->hasMany(
            ParentChild::class,
            'child_id',
            'id',
            'parent'
        );
    }

    public function children(): HasMany
    {
        return $this->hasMany(
            ParentChild::class,
            'parent_id',
            'id',
            'child'
        );
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects', 'user_id', 'subject_id')
            ->withTimestamps();
    }

    public function teachingClasses(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_teachers', 'teacher_id', 'class_id')
            ->withPivot('subject')
            ->withTimestamps();
    }

    /**
     * Get the display name for the user.
     * Returns nickname if set, otherwise returns name.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nickname ?? $this->name;
    }

    /**
     * Approval relationships
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewedUsers(): HasMany
    {
        return $this->hasMany(User::class, 'reviewer_id');
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    /**
     * Approval scopes
     */
    public function scopePending($query)
    {
        return $query->where('registration_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('registration_status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('registration_status', 'rejected');
    }

    /**
     * Approval methods
     */
    public function isPendingApproval(): bool
    {
        return $this->registration_status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->registration_status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->registration_status === 'rejected';
    }

    public function requiresReview(): bool
    {
        return $this->requires_review;
    }

    public function approve(User $reviewer, ?string $note = null): void
    {
        $this->update([
            'registration_status' => 'approved',
            'reviewer_id' => $reviewer->id,
            'reviewed_at' => now(),
            'requires_review' => false,
        ]);

        // Send approval notification/email
    }

    public function reject(User $reviewer, string $reason): void
    {
        $this->update([
            'registration_status' => 'rejected',
            'reviewer_id' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
            'requires_review' => false,
        ]);

        // Send rejection notification/email
    }

    /**
     * Check if user can review another user
     */
    public function canReview(User $user): bool
    {
        // Grade directors can review teachers in their grade
        if ($this->hasRole('teacher') && $user->hasRole('grade_director')) {
            return $user->grade_id && $user->grade_id === $this->grade_id;
        }

        // Head teachers can review students in their class
        if ($this->hasRole('student') && $user->is_head_teacher) {
            return $this->class_id && $user->id === optional($this->class->headTeacher)?->id;
        }

        // Student union requires both head teacher and grade director approval
        if ($this->hasRole('student_union_member')) {
            if ($user->is_head_teacher) {
                return $this->class_id && $user->id === optional($this->class->headTeacher)?->id;
            }

            if ($user->hasRole('grade_director')) {
                return $this->grade_id && $user->grade_id === $this->grade_id;
            }

            return false;
        }

        return false;
    }
}
