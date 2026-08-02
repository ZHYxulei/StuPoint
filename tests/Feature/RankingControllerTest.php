<?php

use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

function inertiaPayload(TestResponse $response): array
{
    /** @var array{component:string,props:array<string,mixed>,url:string,version:mixed} $page */
    $page = $response->viewData('page');

    return $page;
}

function createStudentRole(): Role
{
    return Role::factory()->student()->create();
}

function createRankedStudent(Role $studentRole, int $totalPoints, int $redeemablePoints, array $attributes = []): User
{
    $user = User::factory()->approved()->create(array_merge([
        'name' => fake()->name(),
        'nickname' => fake()->firstName(),
        'email' => fake()->unique()->safeEmail(),
        'phone' => fake()->phoneNumber(),
        'student_id' => fake()->numerify('STU####'),
        'id_number' => fake()->numerify('##################'),
        'grade' => '一年级',
        'class' => '1班',
        'last_login_ip' => fake()->ipv4(),
        'registration_status' => 'approved',
        'requires_review' => false,
    ], $attributes));

    $user->assignRole($studentRole);

    UserPoint::create([
        'user_id' => $user->id,
        'total_points' => $totalPoints,
        'redeemable_points' => $redeemablePoints,
    ]);

    return $user->refresh();
}

it('does not expose sensitive student fields in the public ranking response', function () {
    $this->withoutVite();

    $studentRole = createStudentRole();

    $reviewer = User::factory()->approved()->create();

    $topStudent = createRankedStudent($studentRole, 300, 250, [
        'name' => 'Top Student',
        'nickname' => 'Champion',
        'email' => 'top@example.com',
        'phone' => '13800000001',
        'student_id' => 'STU-001',
        'id_number' => '110101200001010001',
        'grade' => '高一',
        'class' => '1班',
        'last_login_ip' => '10.0.0.1',
        'reviewer_id' => $reviewer->id,
    ]);

    $secondStudent = createRankedStudent($studentRole, 200, 180, [
        'name' => 'Second Student',
        'nickname' => null,
        'email' => 'second@example.com',
        'phone' => '13800000002',
        'student_id' => 'STU-002',
        'id_number' => '110101200001010002',
        'grade' => '高一',
        'class' => '2班',
        'last_login_ip' => '10.0.0.2',
    ]);

    $response = $this->get(route('ranking'))->assertSuccessful();
    $page = inertiaPayload($response);

    expect($page['component'])->toBe('ranking/index');
    expect($page['props']['userRanking'])->toBeNull();
    expect($page['props']['rankings']['current_page'])->toBe(1);
    expect($page['props']['rankings']['last_page'])->toBe(1);
    expect($page['props']['rankings']['total'])->toBe(2);
    expect($page['props']['rankings']['data'])->toHaveCount(2);

    expect($page['props']['rankings']['data'][0])->toMatchArray([
        'id' => $topStudent->id,
        'display_name' => 'Champion',
        'grade' => '高一',
        'class' => '1班',
        'total_points' => 300,
        'redeemable_points' => 250,
        'rank' => 1,
    ]);
    expect($page['props']['rankings']['data'][1])->toMatchArray([
        'id' => $secondStudent->id,
        'display_name' => 'Second Student',
        'grade' => '高一',
        'class' => '2班',
        'total_points' => 200,
        'redeemable_points' => 180,
        'rank' => 2,
    ]);

    foreach (['name', 'email', 'phone', 'student_id', 'id_number', 'last_login_ip', 'registration_status', 'requires_review', 'reviewer_id'] as $sensitiveField) {
        expect($page['props']['rankings']['data'][0])->not->toHaveKey($sensitiveField);
    }

    foreach (['email', 'student_id'] as $sensitiveField) {
        expect($page['props']['rankings']['data'][1])->not->toHaveKey($sensitiveField);
    }
});

it('returns safe paginated ranking data and a safe current user ranking', function () {
    $this->withoutVite();

    $studentRole = createStudentRole();

    createRankedStudent($studentRole, 300, 260, [
        'name' => 'Top Student',
        'nickname' => 'Topper',
        'grade' => '高二',
        'class' => '1班',
    ]);

    $currentUser = createRankedStudent($studentRole, 200, 150, [
        'name' => 'Current User',
        'nickname' => 'Me',
        'email' => 'current@example.com',
        'phone' => '13800000003',
        'student_id' => 'STU-003',
        'id_number' => '110101200001010003',
        'grade' => '高二',
        'class' => '2班',
        'last_login_ip' => '10.0.0.3',
    ]);

    createRankedStudent($studentRole, 100, 80, [
        'name' => 'Third Student',
        'nickname' => 'Bronze',
        'grade' => '高二',
        'class' => '3班',
    ]);

    actingAs($currentUser);

    $response = $this->get(route('ranking', ['per_page' => 1, 'page' => 2]))->assertSuccessful();
    $page = inertiaPayload($response);

    expect($page['component'])->toBe('ranking/index');
    expect($page['props']['rankings']['current_page'])->toBe(2);
    expect($page['props']['rankings']['last_page'])->toBe(3);
    expect($page['props']['rankings']['total'])->toBe(3);
    expect($page['props']['rankings']['data'])->toHaveCount(1);
    expect($page['props']['rankings']['data'][0])->toMatchArray([
        'id' => $currentUser->id,
        'display_name' => 'Me',
        'grade' => '高二',
        'class' => '2班',
        'total_points' => 200,
        'redeemable_points' => 150,
        'rank' => 2,
    ]);
    expect($page['props']['userRanking'])->toMatchArray([
        'id' => $currentUser->id,
        'display_name' => 'Me',
        'grade' => '高二',
        'class' => '2班',
        'total_points' => 200,
        'redeemable_points' => 150,
        'rank' => 2,
    ]);

    foreach (['email', 'phone', 'student_id', 'id_number', 'last_login_ip'] as $sensitiveField) {
        expect($page['props']['rankings']['data'][0])->not->toHaveKey($sensitiveField);
        expect($page['props']['userRanking'])->not->toHaveKey($sensitiveField);
    }

    foreach (['registration_status', 'requires_review'] as $sensitiveField) {
        expect($page['props']['userRanking'])->not->toHaveKey($sensitiveField);
    }
});
