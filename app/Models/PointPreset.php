<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class PointPreset extends Model
{
    protected $fillable = [
        'name',
        'type',
        'amount',
        'reason',
        'scope',
        'scope_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'scope_id' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get presets for a user (global + school + grade + class).
     */
    public static function forUser(User $user): Collection
    {
        $query = static::query();

        // Global presets
        $query->where('scope', 'global');

        // School-wide presets
        $query->orWhere('scope', 'school');

        // Grade presets
        if ($user->grade_id) {
            $query->orWhere(function ($q) use ($user) {
                $q->where('scope', 'grade')->where('scope_id', $user->grade_id);
            });
        }

        // Class presets
        if ($user->class_id) {
            $query->orWhere(function ($q) use ($user) {
                $q->where('scope', 'class')->where('scope_id', $user->class_id);
            });
        }

        return $query->orderBy('type')->orderBy('amount', 'desc')->get();
    }

    /**
     * The locale-independent half of each default preset.
     *
     * @var array<string, array{type: string, amount: int}>
     */
    private const DEFAULT_PRESET_SHAPE = [
        'answer_question' => ['type' => 'add', 'amount' => 5],
        'good_homework' => ['type' => 'add', 'amount' => 3],
        'help_classmate' => ['type' => 'add', 'amount' => 3],
        'good_behaviour' => ['type' => 'add', 'amount' => 2],
        'talking' => ['type' => 'deduct', 'amount' => 2],
        'sleeping' => ['type' => 'deduct', 'amount' => 3],
        'missing_homework' => ['type' => 'deduct', 'amount' => 5],
        'late' => ['type' => 'deduct', 'amount' => 2],
    ];

    /**
     * Default presets when none are configured.
     *
     * Names and reasons come from lang/{locale}/presets.php so they follow the
     * active locale. They are code defaults rather than user data — unlike
     * stored rows, which are whatever an admin typed and must stay untouched.
     *
     * @return list<array{name: string, type: string, amount: int, reason: string}>
     */
    public static function defaults(): array
    {
        return collect(self::DEFAULT_PRESET_SHAPE)
            ->map(fn (array $shape, string $key): array => [
                'name' => __("presets.{$key}.name"),
                'type' => $shape['type'],
                'amount' => $shape['amount'],
                'reason' => __("presets.{$key}.reason"),
            ])
            ->values()
            ->all();
    }
}
