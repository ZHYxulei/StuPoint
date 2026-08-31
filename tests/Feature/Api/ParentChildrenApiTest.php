<?php

use App\Models\ParentChild;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;

uses(RefreshDatabase::class);

it('does not expose child points for an unapproved parent relation on the api route', function () {
    $parent = User::factory()->approved()->create();
    $child = User::factory()->approved()->create([
        'student_id' => 'PENDING-API-1001',
    ]);

    UserPoint::query()->create([
        'user_id' => $child->id,
        'total_points' => 900,
        'redeemable_points' => 800,
    ]);

    ParentChild::query()->create([
        'parent_id' => $parent->id,
        'child_id' => $child->id,
        'relationship' => '其他',
        'is_approved' => false,
        'approved_at' => null,
    ]);

    $response = $this->actingAs($parent, 'api')
        ->getJson('/api/parent/children');

    $response->assertOk();

    expect(json_encode($response->json()))
        ->not->toContain('900')
        ->not->toContain('800');
});

it('lists only children for the authenticated parent on the api route', function () {
    $parent = User::factory()->approved()->create();
    $child = User::factory()->approved()->create([
        'student_id' => 'API-STU-1001',
        'grade' => '二年级',
        'class' => '2班',
    ]);
    $otherParent = User::factory()->approved()->create();
    $unrelatedChild = User::factory()->approved()->create([
        'student_id' => 'API-STU-1002',
    ]);

    UserPoint::query()->create([
        'user_id' => $child->id,
        'total_points' => 88,
        'redeemable_points' => 66,
    ]);
    UserPoint::query()->create([
        'user_id' => $unrelatedChild->id,
        'total_points' => 500,
        'redeemable_points' => 400,
    ]);

    ParentChild::create([
        'parent_id' => $parent->id,
        'child_id' => $child->id,
        'relationship' => '母亲',
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
        'relationship' => '父亲',
        'is_approved' => true,
        'approved_at' => now(),
    ]);

    $this->actingAs($parent, 'api')
        ->getJson('/api/parent/children')
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->where('success', true)
            ->has('data', 1)
            ->has('data.0', fn (AssertableJson $childJson) => $childJson
                ->where('id', $child->id)
                ->where('name', $child->name)
                ->where('student_id', 'API-STU-1001')
                ->where('relationship', '母亲')
                ->where('points.total_points', 88)
                ->where('points.redeemable_points', 66)
                ->etc()
            )
            ->etc()
        );
});
