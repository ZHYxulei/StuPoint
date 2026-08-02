<?php

use App\Models\PointPreset;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

function createApprovedUser(array $attributes = []): User
{
    return User::factory()->approved()->create($attributes);
}

function assignRoles(User $user, Role ...$roles): User
{
    foreach ($roles as $role) {
        $user->assignRole($role);
    }

    return $user;
}

function createSchoolClass(array $attributes = []): SchoolClass
{
    return SchoolClass::create(array_merge([
        'name' => fake()->randomElement(['1班', '2班', '3班']),
        'grade' => '一年级',
        'grade_id' => null,
        'head_teacher_id' => null,
    ], $attributes));
}

test('head teacher cannot access another class in quick grading', function () {
    $headTeacherRole = Role::factory()->headTeacher()->create();
    $studentRole = Role::factory()->student()->create();

    $headTeacher = assignRoles(createApprovedUser(), $headTeacherRole);

    $ownClass = createSchoolClass([
        'grade' => '一年级',
        'head_teacher_id' => $headTeacher->id,
    ]);

    $otherClass = createSchoolClass([
        'grade' => '一年级',
    ]);

    assignRoles(createApprovedUser(['class_id' => $ownClass->id]), $studentRole);
    assignRoles(createApprovedUser(['class_id' => $otherClass->id]), $studentRole);

    actingAs($headTeacher)
        ->get(route('admin.quick-grading.index', ['class_id' => $otherClass->id]))
        ->assertForbidden();
});

test('head teacher can open quick grading for their own class', function () {
    $headTeacherRole = Role::factory()->headTeacher()->create();
    $studentRole = Role::factory()->student()->create();

    $headTeacher = assignRoles(createApprovedUser(), $headTeacherRole);

    $ownClass = createSchoolClass([
        'grade' => '一年级',
        'head_teacher_id' => $headTeacher->id,
    ]);

    $ownStudent = assignRoles(createApprovedUser([
        'name' => 'Own Student',
        'class_id' => $ownClass->id,
    ]), $studentRole);

    $otherClass = createSchoolClass([
        'grade' => '一年级',
    ]);

    assignRoles(createApprovedUser([
        'name' => 'Other Student',
        'class_id' => $otherClass->id,
    ]), $studentRole);

    $response = actingAs($headTeacher)
        ->get(route('admin.quick-grading.index', ['class_id' => $ownClass->id]));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/quick-grading/index')
            ->where('selectedClassId', $ownClass->id)
            ->has('classes', 1)
            ->has('students', 1)
            ->where('students.0.id', $ownStudent->id)
            ->where('students.0.name', 'Own Student')
        );
});

test('head teacher cannot save class scoped presets for another class', function () {
    $headTeacherRole = Role::factory()->headTeacher()->create();

    $headTeacher = assignRoles(createApprovedUser(), $headTeacherRole);

    createSchoolClass([
        'grade' => '一年级',
        'head_teacher_id' => $headTeacher->id,
    ]);

    $otherClass = createSchoolClass([
        'grade' => '一年级',
    ]);

    actingAs($headTeacher)
        ->post(route('admin.quick-grading.presets.save'), [
            'presets' => [
                [
                    'name' => '违规加分',
                    'type' => 'add',
                    'amount' => 5,
                    'reason' => '不应被允许',
                ],
            ],
            'scope' => 'class',
            'scope_id' => $otherClass->id,
        ])
        ->assertForbidden();

    expect(PointPreset::count())->toBe(0);
});
