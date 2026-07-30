<?php

use App\Models\ParentChild;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('lists only children for the authenticated parent on the web route', function () {
    $parent = User::factory()->approved()->create();
    $child = User::factory()->approved()->create([
        'student_id' => 'STU-1001',
        'grade' => '一年级',
        'class' => '1班',
    ]);
    $otherParent = User::factory()->approved()->create();
    $unrelatedChild = User::factory()->approved()->create([
        'student_id' => 'STU-1002',
    ]);

    UserPoint::query()->create([
        'user_id' => $child->id,
        'total_points' => 120,
        'redeemable_points' => 80,
    ]);
    UserPoint::query()->create([
        'user_id' => $unrelatedChild->id,
        'total_points' => 300,
        'redeemable_points' => 200,
    ]);

    ParentChild::create([
        'parent_id' => $parent->id,
        'child_id' => $child->id,
        'relationship' => '父亲',
        'is_approved' => true,
        'approved_at' => now(),
    ]);

    ParentChild::create([
        'parent_id' => $child->id,
        'child_id' => $parent->id,
        'relationship' => '其他',
        'is_approved' => true,
        'approved_at' => now(),
    ]);

    ParentChild::create([
        'parent_id' => $otherParent->id,
        'child_id' => $unrelatedChild->id,
        'relationship' => '母亲',
        'is_approved' => true,
        'approved_at' => now(),
    ]);

    actingAs($parent)
        ->get(route('parent.children.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('parent/children/index')
            ->has('children', 1)
            ->has('children.0', fn (Assert $childPage) => $childPage
                ->where('id', $child->id)
                ->where('name', $child->name)
                ->where('student_id', 'STU-1001')
                ->where('relationship', '父亲')
                ->where('points.total_points', 120)
                ->where('points.redeemable_points', 80)
                ->etc()
            )
        );
});
