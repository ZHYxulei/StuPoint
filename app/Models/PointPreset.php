<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    public static function forUser(User $user): \Illuminate\Support\Collection
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
     * Default presets when none are configured.
     */
    public static function defaults(): array
    {
        return [
            ['name' => '上课回答问题', 'type' => 'add', 'amount' => 5, 'reason' => '上课积极回答问题'],
            ['name' => '作业优秀', 'type' => 'add', 'amount' => 3, 'reason' => '作业完成质量优秀'],
            ['name' => '帮助同学', 'type' => 'add', 'amount' => 3, 'reason' => '主动帮助同学学习'],
            ['name' => '课堂表现好', 'type' => 'add', 'amount' => 2, 'reason' => '课堂纪律表现好'],
            ['name' => '上课说话', 'type' => 'deduct', 'amount' => 2, 'reason' => '上课随意说话'],
            ['name' => '上课睡觉', 'type' => 'deduct', 'amount' => 3, 'reason' => '上课打瞌睡'],
            ['name' => '未交作业', 'type' => 'deduct', 'amount' => 5, 'reason' => '未按时提交作业'],
            ['name' => '迟到', 'type' => 'deduct', 'amount' => 2, 'reason' => '上课迟到'],
        ];
    }
}
