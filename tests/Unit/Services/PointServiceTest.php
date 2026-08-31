<?php

use App\Events\PointsChanged;
use App\Models\PointTransaction;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use App\Services\PointService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = new PointService;
    $this->studentRole = Role::factory()->student()->create();
    $this->adminRole = Role::factory()->admin()->create();
});

it('adds points to user', function () {
    $user = User::factory()->create();
    $user->assignRole($this->studentRole);

    $this->service->addPoints($user, 100, 'test', ['description' => 'Test add']);

    expect($user->fresh()->points->total_points)->toBe(100);
    expect($user->fresh()->points->redeemable_points)->toBe(100);
});

it('creates user points record if not exists', function () {
    $user = User::factory()->create();
    $user->assignRole($this->studentRole);

    expect($user->points)->toBeNull();

    $this->service->addPoints($user, 50, 'test');

    expect($user->fresh()->points)->not->toBeNull();
    expect($user->fresh()->points->total_points)->toBe(50);
});

it('records two transactions when adding points', function () {
    $user = User::factory()->create();
    $user->assignRole($this->studentRole);

    $this->service->addPoints($user, 100, 'test');

    $transactions = PointTransaction::where('user_id', $user->id)->get();
    expect($transactions)->toHaveCount(2);
    expect($transactions->where('type', 'total')->first()->amount)->toBe(100);
    expect($transactions->where('type', 'redeemable')->first()->amount)->toBe(100);
});

it('records operator id and ledger balances when adding points', function () {
    $user = User::factory()->create();
    $operator = User::factory()->create();

    $this->service->addPoints($user, 100, 'manual_adjust', [
        'operator_id' => $operator->id,
        'operator_type' => 'admin',
    ]);

    $transactions = PointTransaction::query()
        ->where('user_id', $user->id)
        ->get()
        ->keyBy('type');

    expect($transactions['total']->operator_id)->toBe($operator->id)
        ->and($transactions['redeemable']->operator_id)->toBe($operator->id)
        ->and($transactions['total']->balance_after)->toBe(100)
        ->and($transactions['redeemable']->balance_after)->toBe(100)
        ->and($transactions['total']->metadata['operator_type'])->toBe('admin');
});

it('does not dispatch point events when an outer transaction rolls back', function () {
    Event::fake();
    $user = User::factory()->create();

    try {
        DB::transaction(function () use ($user) {
            $this->service->addPoints($user, 25, 'test');

            throw new RuntimeException('force rollback');
        });
    } catch (RuntimeException) {
    }

    expect(UserPoint::query()->where('user_id', $user->id)->exists())->toBeFalse()
        ->and(PointTransaction::query()->where('user_id', $user->id)->exists())->toBeFalse();
    Event::assertNotDispatched(PointsChanged::class);
});

it('rejects non-positive amounts', function (string $method, int $amount) {
    $user = User::factory()->create();
    UserPoint::ensureForUser($user);

    $this->service->{$method}($user, $amount, 'test');
})->with([
    ['addPoints', 0],
    ['addPoints', -1],
    ['deductRedeemablePoints', 0],
    ['deductRedeemablePoints', -1],
])->throws(InvalidArgumentException::class, '积分数量必须为正整数');

it('deducts redeemable points', function () {
    $user = User::factory()->create();
    $user->assignRole($this->studentRole);
    UserPoint::create(['user_id' => $user->id, 'total_points' => 100, 'redeemable_points' => 100]);

    $this->service->deductRedeemablePoints($user, 30, 'test');

    expect($user->fresh()->points->total_points)->toBe(100); // unchanged
    expect($user->fresh()->points->redeemable_points)->toBe(70);
});

it('throws exception when deducting more than redeemable balance', function () {
    $user = User::factory()->create();
    $user->assignRole($this->studentRole);
    UserPoint::create(['user_id' => $user->id, 'total_points' => 100, 'redeemable_points' => 50]);

    $this->service->deductRedeemablePoints($user, 100, 'test');
})->throws(Exception::class, '可兑换积分不足');

it('returns false for self modification', function () {
    $user = User::factory()->create();
    $user->assignRole($this->studentRole);

    expect($this->service->canModifyPoints($user, $user))->toBeFalse();
});

it('returns true when admin targets student', function () {
    $admin = User::factory()->create(['registration_status' => 'approved']);
    $admin->assignRole($this->adminRole);
    $student = User::factory()->create(['registration_status' => 'approved']);
    $student->assignRole($this->studentRole);

    expect($this->service->canModifyPoints($admin, $student))->toBeTrue();
});

it('returns balance correctly', function () {
    $user = User::factory()->create();
    UserPoint::create(['user_id' => $user->id, 'total_points' => 150, 'redeemable_points' => 75]);

    $balance = $this->service->getBalance($user);

    expect($balance)->toBe(['total_points' => 150, 'redeemable_points' => 75]);
});

it('returns zero balance for user without points', function () {
    $user = User::factory()->create();

    $balance = $this->service->getBalance($user);

    expect($balance)->toBe(['total_points' => 0, 'redeemable_points' => 0]);
});
