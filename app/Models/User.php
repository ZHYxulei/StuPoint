<?php

namespace App\Models;

use App\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
}
