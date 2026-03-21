<?php

use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('allows head teacher to mark first approval for student union member', function () {
    $headTeacherRole = Role::create([
        'name' => 'Head Teacher',
        'slug' => 'head_teacher',
        'description' => 'Head teacher',
        'is_system' => false,
        'level' => 65,
    ]);

    $studentUnionRole = Role::create([
        'name' => 'Student Union Member',
        'slug' => 'student_union_member',
        'description' => 'Student union member',
        'is_system' => false,
        'level' => 30,
    ]);

    $headTeacher = User::factory()->create([
        'is_head_teacher' => true,
        'registration_status' => 'approved',
        'requires_review' => false,
    ]);
    $headTeacher->assignRole($headTeacherRole);

    $schoolClass = SchoolClass::create([
        'name' => '1班',
        'grade' => '一年级',
        'grade_id' => null,
        'head_teacher_id' => $headTeacher->id,
    ]);

    $headTeacher->refresh();

    expect($headTeacher->headOfClass?->id)->toBe($schoolClass->id);

    $student = User::factory()->create([
        'class_id' => $schoolClass->id,
        'grade_id' => $schoolClass->grade_id,
        'registration_status' => 'pending',
        'requires_review' => true,
    ]);
    $student->save();
    $student->assignRole($studentUnionRole);

    actingAs($headTeacher)
        ->post(route('admin.approvals.approve', $student->id), ['note' => 'ok'])
        ->assertRedirect();

    $student->refresh();

    expect($student->head_teacher_approved_at)->not->toBeNull();
    expect($student->registration_status)->toBe('pending');
});
