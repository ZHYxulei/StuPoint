<?php

use App\Models\ParentBindingInvitation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

function createApprovedParentForBindingTest(): User
{
    $parentRole = Role::query()->firstOrCreate(
        ['slug' => 'parent'],
        [
            'name' => '家长',
            'is_system' => true,
            'level' => 10,
        ],
    );

    $parent = User::factory()->approved()->create();
    $parent->assignRole($parentRole);

    return $parent;
}

it('binds a parent with a valid single-use invitation', function () {
    $parent = createApprovedParentForBindingTest();
    $child = User::factory()->approved()->create([
        'student_id' => 'VALID-BIND-1001',
    ]);
    $code = 'ABCD2345';

    ParentBindingInvitation::query()->create([
        'student_id' => $child->id,
        'code_hash' => hash('sha256', $code),
        'code_last_four' => substr($code, -4),
        'expires_at' => now()->addMinutes(30),
    ]);

    actingAs($parent)
        ->post(route('parent.children.store'), [
            'child_student_id' => $child->student_id,
            'invitation_code' => $code,
            'relationship' => '父亲',
        ])
        ->assertRedirect(route('parent.children.index'));

    $this->assertDatabaseHas('parent_child', [
        'parent_id' => $parent->id,
        'child_id' => $child->id,
        'relationship' => '父亲',
        'is_approved' => true,
    ]);

    $invitation = ParentBindingInvitation::query()->firstOrFail();

    expect($invitation->consumed_at)->not->toBeNull()
        ->and($invitation->consumed_by_parent_id)->toBe($parent->id);
});

it('rejects invalid expired and consumed invitations', function (string $scenario, string $submittedCode) {
    $parent = createApprovedParentForBindingTest();
    $child = User::factory()->approved()->create([
        'student_id' => 'INVALID-BIND-'.fake()->unique()->numerify('####'),
    ]);
    $validCode = 'ZXCV6789';
    $invitationState = [];

    if ($scenario === 'expired') {
        $invitationState['expires_at'] = now()->subMinute();
    }

    if ($scenario === 'consumed') {
        $otherParent = createApprovedParentForBindingTest();
        $invitationState['consumed_at'] = now();
        $invitationState['consumed_by_parent_id'] = $otherParent->id;
    }

    ParentBindingInvitation::query()->create(array_merge([
        'student_id' => $child->id,
        'code_hash' => hash('sha256', $validCode),
        'code_last_four' => substr($validCode, -4),
        'expires_at' => now()->addMinutes(30),
    ], $invitationState));

    actingAs($parent)
        ->from(route('parent.children.create'))
        ->post(route('parent.children.store'), [
            'child_student_id' => $child->student_id,
            'invitation_code' => $submittedCode,
            'relationship' => '母亲',
        ])
        ->assertRedirect(route('parent.children.create'))
        ->assertSessionHasErrors('invitation_code');

    $this->assertDatabaseMissing('parent_child', [
        'parent_id' => $parent->id,
        'child_id' => $child->id,
    ]);
})->with([
    'incorrect code' => ['invalid', 'WRONG234'],
    'expired code' => ['expired', 'ZXCV6789'],
    'consumed code' => ['consumed', 'ZXCV6789'],
]);

it('forbids approved non-parent users from binding children', function () {
    $studentRole = Role::factory()->student()->create();
    $studentUser = User::factory()->approved()->create();
    $studentUser->assignRole($studentRole);
    $child = User::factory()->approved()->create([
        'student_id' => 'ROLE-BIND-1001',
    ]);

    actingAs($studentUser)
        ->post(route('parent.children.store'), [
            'child_student_id' => $child->student_id,
            'invitation_code' => 'ABCDEFGH',
            'relationship' => '其他',
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('parent_child', [
        'parent_id' => $studentUser->id,
        'child_id' => $child->id,
    ]);
});

it('requires an invitation code before binding a child on the web route', function () {
    $parent = createApprovedParentForBindingTest();
    $child = User::factory()->approved()->create([
        'student_id' => 'WEB-BIND-1001',
    ]);

    actingAs($parent)
        ->from(route('parent.children.create'))
        ->post(route('parent.children.store'), [
            'child_student_id' => $child->student_id,
            'relationship' => '父亲',
        ])
        ->assertRedirect(route('parent.children.create'))
        ->assertSessionHasErrors('invitation_code');

    $this->assertDatabaseMissing('parent_child', [
        'parent_id' => $parent->id,
        'child_id' => $child->id,
    ]);
});

it('requires an invitation code before binding a child on the api route', function () {
    $parent = createApprovedParentForBindingTest();
    $child = User::factory()->approved()->create([
        'student_id' => 'API-BIND-1001',
    ]);

    $this->actingAs($parent, 'api')
        ->postJson('/api/parent/bind-child', [
            'child_student_id' => $child->student_id,
            'relationship' => '母亲',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('invitation_code');

    $this->assertDatabaseMissing('parent_child', [
        'parent_id' => $parent->id,
        'child_id' => $child->id,
    ]);
});
