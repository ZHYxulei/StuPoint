# Authorization and Parent Binding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce shared Web/API resource authorization and replace automatic student-number parent binding with single-use invitations plus optional head-teacher review.

**Architecture:** Retain role middleware as coarse routing protection, move resource decisions into `UserPolicy` and `ParentChildPolicy`, and centralize invitation consumption/review transitions in `ParentBindingService`. Model invitation codes as a dedicated hashed domain entity and evolve `parent_child` from a boolean approval flag to explicit status while preserving compatibility during migration.

**Tech Stack:** Laravel 13 policies, Gates, Form Requests, Eloquent, MySQL/SQLite migrations, Inertia/API controllers, Pest 4.

---

## File Map

- Create `app/Models/ParentBindingInvitation.php`: hashed invitation lifecycle and relationships.
- Create `app/Policies/UserPolicy.php`: role assignment, registration review, invitation-generation rules.
- Create `app/Policies/ParentChildPolicy.php`: approved access, unlinking, and class-scoped review.
- Create `app/Services/ParentBindingService.php`: transactional issue, consume, approve, reject operations.
- Create parent/admin Form Requests and two focused admin controllers.
- Modify parent Web/API controllers to share request/service/policy paths.
- Modify user administration controllers to authorize registration review and role assignment.
- Add two migrations and an invitation factory.
- Add focused Web/API/admin Pest feature tests.

### Task 1: Prove Existing Authorization Gaps

**Files:**
- Create: `tests/Feature/AdminUserAuthorizationTest.php`
- Create: `tests/Feature/ParentBindingAuthorizationTest.php`

- [ ] **Step 1: Generate tests**

```bash
php artisan make:test --pest AdminUserAuthorizationTest --no-interaction
php artisan make:test --pest ParentBindingAuthorizationTest --no-interaction
```

- [ ] **Step 2: Write the role-escalation failing test**

```php
<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('forbids a non super admin from assigning a higher role than their own', function () {
    $adminRole = Role::factory()->create(['slug' => 'admin', 'level' => 90]);
    $principalRole = Role::factory()->create(['slug' => 'principal', 'level' => 95]);

    $actor = User::factory()->approved()->create();
    $actor->assignRole($adminRole);

    $target = User::factory()->approved()->create();

    actingAs($actor)
        ->put(route('admin.users.updateRoles', $target), [
            'role_id' => $principalRole->id,
        ])
        ->assertForbidden();
});
```

Adjust the route parameter form to the existing named route, not the production contract.

- [ ] **Step 3: Write failing parent access tests**

```php
it('forbids a pending parent relation from viewing child data', function () {
    $parent = User::factory()->approved()->create();
    $parent->assignRole('parent');
    $student = User::factory()->approved()->create();
    $student->assignRole('student');

    ParentChild::query()->create([
        'parent_id' => $parent->id,
        'child_id' => $student->id,
        'relationship' => '父亲',
        'is_approved' => false,
    ]);

    actingAs($parent)
        ->get(route('parent.children.show', $student))
        ->assertForbidden();
});
```

Add an API variant using Passport authentication and `assertForbidden()`.

- [ ] **Step 4: Run and confirm red**

```bash
php artisan test --compact tests/Feature/AdminUserAuthorizationTest.php
php artisan test --compact tests/Feature/ParentBindingAuthorizationTest.php
```

Expected: FAIL because role escalation is allowed and pending relationships are hidden as 404 or otherwise mishandled.

- [ ] **Step 5: Commit tests**

```bash
git add tests/Feature/AdminUserAuthorizationTest.php tests/Feature/ParentBindingAuthorizationTest.php
git commit -m "test: expose authorization and parent access gaps"
```

### Task 2: Add Invitation and Relationship Status Schema

**Files:**
- Create: `database/migrations/*_create_parent_binding_invitations_table.php`
- Create: `database/migrations/*_add_status_and_review_fields_to_parent_child_table.php`
- Create: `app/Models/ParentBindingInvitation.php`
- Create: `database/factories/ParentBindingInvitationFactory.php`
- Modify: `app/Models/ParentChild.php`

- [ ] **Step 1: Generate files using Artisan**

```bash
php artisan make:model ParentBindingInvitation --factory --no-interaction
php artisan make:migration create_parent_binding_invitations_table --create=parent_binding_invitations --no-interaction
php artisan make:migration add_status_and_review_fields_to_parent_child_table --table=parent_child --no-interaction
```

- [ ] **Step 2: Define invitation schema**

```php
Schema::create('parent_binding_invitations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
    $table->string('code_hash', 64)->unique();
    $table->string('code_last_four', 4);
    $table->string('purpose', 32)->default('parent_binding');
    $table->timestamp('expires_at');
    $table->timestamp('consumed_at')->nullable();
    $table->foreignId('consumed_by_parent_id')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('revoked_at')->nullable();
    $table->timestamps();

    $table->index(['student_id', 'expires_at']);
    $table->index(['student_id', 'consumed_at']);
});
```

- [ ] **Step 3: Evolve `parent_child` compatibly**

```php
Schema::table('parent_child', function (Blueprint $table) {
    $table->enum('status', ['pending', 'approved', 'rejected'])
        ->default('pending')
        ->after('relationship');
    $table->foreignId('invitation_id')->nullable()
        ->after('is_approved')
        ->constrained('parent_binding_invitations')
        ->nullOnDelete();
    $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('reviewed_at')->nullable();
    $table->text('rejection_reason')->nullable();
    $table->index(['parent_id', 'status']);
    $table->index(['child_id', 'status']);
});

DB::table('parent_child')->where('is_approved', true)->update(['status' => 'approved']);
```

Keep `is_approved` during this plan and synchronize it from service transitions.

- [ ] **Step 4: Implement invitation model**

```php
final class ParentBindingInvitation extends Model
{
    /** @use HasFactory<\Database\Factories\ParentBindingInvitationFactory> */
    use HasFactory;

    protected $fillable = [
        'student_id',
        'code_hash',
        'code_last_four',
        'purpose',
        'expires_at',
        'consumed_at',
        'consumed_by_parent_id',
        'created_by',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'consumed_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }
}
```

Add typed `BelongsTo` methods for student, creator, and consumer.

- [ ] **Step 5: Upgrade `ParentChild`**

Add casts, invitation/reviewer relations, `approved`, `pending`, `rejected` scopes, and `isApproved()`, `isPending()`, `isRejected()` helpers. Existing `approved()` queries must use `status = approved` while preserving compatibility.

- [ ] **Step 6: Run migration/model tests**

```bash
php artisan test --compact tests/Feature/ParentBindingAuthorizationTest.php
```

Expected: test still fails at authorization, not schema/model errors.

- [ ] **Step 7: Commit**

```bash
git add app/Models/ParentBindingInvitation.php app/Models/ParentChild.php database/factories/ParentBindingInvitationFactory.php database/migrations
git commit -m "feat: add parent binding invitation lifecycle"
```

### Task 3: Implement User and Parent-Child Policies

**Files:**
- Create: `app/Policies/UserPolicy.php`
- Create: `app/Policies/ParentChildPolicy.php`
- Modify: `app/Providers/AppServiceProvider.php`
- Modify: `app/Http/Controllers/Admin/UserApprovalController.php`
- Modify: `app/Http/Controllers/Admin/UserController.php`

- [ ] **Step 1: Generate policies**

```bash
php artisan make:policy UserPolicy --model=User --no-interaction
php artisan make:policy ParentChildPolicy --model=ParentChild --no-interaction
```

- [ ] **Step 2: Implement `UserPolicy` methods**

```php
public function reviewRegistration(User $actor, User $subject): bool
{
    return $actor->canReview($subject);
}

public function generateParentBindingInvitation(User $actor, User $student): bool
{
    if (! $student->hasRole('student')) {
        return false;
    }

    if ($actor->hasAnyRole(['super_admin', 'admin', 'principal'])) {
        return true;
    }

    return $actor->hasRole('head_teacher')
        && $student->class?->head_teacher_id === $actor->id;
}

public function assignRole(User $actor, User $subject, Role $role): bool
{
    if ($actor->hasRole('super_admin')) {
        return true;
    }

    if ($subject->hasAnyRole(['super_admin', 'principal']) || $role->slug === 'super_admin') {
        return false;
    }

    return $role->level < $actor->roles()->max('level');
}
```

Use existing helpers actually available on `User`; if `hasAnyRole` is absent, use the repository's equivalent.

- [ ] **Step 3: Implement `ParentChildPolicy`**

```php
public function view(User $actor, ParentChild $relation): bool
{
    return $relation->parent_id === $actor->id && $relation->isApproved();
}

public function delete(User $actor, ParentChild $relation): bool
{
    return $relation->parent_id === $actor->id;
}

public function review(User $actor, ParentChild $relation): bool
{
    return $relation->isPending()
        && $actor->hasRole('head_teacher')
        && $relation->child->class?->head_teacher_id === $actor->id;
}
```

- [ ] **Step 4: Register policies and bind ability**

In `AppServiceProvider::boot()`:

```php
Gate::policy(User::class, UserPolicy::class);
Gate::policy(ParentChild::class, ParentChildPolicy::class);
Gate::define('bind-parent-child', fn (User $user): bool =>
    $user->hasRole('parent') && $user->isApproved()
);
```

Do not add a broad `Gate::before` bypass.

- [ ] **Step 5: Route existing admin actions through policies**

In user approval:

```php
Gate::authorize('reviewRegistration', $studentUnionMember);
```

In role update, resolve the requested role, then:

```php
Gate::authorize('assignRole', [$user, $role]);
```

Authorize before mutating roles.

- [ ] **Step 6: Run focused tests**

```bash
php artisan test --compact tests/Feature/AdminUserAuthorizationTest.php
php artisan test --compact tests/Feature/AdminApprovalsTest.php
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/Policies app/Providers/AppServiceProvider.php app/Http/Controllers/Admin/UserApprovalController.php app/Http/Controllers/Admin/UserController.php
git commit -m "feat: enforce resource policies for user administration"
```

### Task 4: Test Invitation Issue and Consumption Rules

**Files:**
- Create: `tests/Feature/ParentBindingInvitationTest.php`
- Create: `tests/Feature/Api/ParentBindingApiTest.php`

- [ ] **Step 1: Generate tests**

```bash
php artisan make:test --pest ParentBindingInvitationTest --no-interaction
php artisan make:test --pest Api/ParentBindingApiTest --no-interaction
```

- [ ] **Step 2: Add invitation lifecycle tests**

Add these complete behaviors:

```php
it('requires a valid invitation code to bind a child', function () { /* arrange parent/student, post invalid code, assert validation error and zero relationships */ });
it('rejects an expired parent binding invitation', function () { /* factory expired state, post, assert error */ });
it('does not allow reusing a consumed parent binding invitation', function () { /* first succeeds, second fails */ });
it('creates an approved relation when review is disabled', function () { /* set false, bind, assert approved fields */ });
it('creates a pending relation when review is enabled', function () { /* set true, bind, assert pending fields */ });
```

Use factory states with real hashed codes. The factory should expose a helper that returns the plaintext only to the test setup; never store plaintext in the database.

- [ ] **Step 3: Add API parity tests**

```php
it('binds a child through api with the same rules as web', function () { /* postJson and assert status */ });
it('returns forbidden for a pending relationship in api', function () { /* access child transactions */ });
```

- [ ] **Step 4: Run and confirm red**

```bash
php artisan test --compact tests/Feature/ParentBindingInvitationTest.php
php artisan test --compact tests/Feature/Api/ParentBindingApiTest.php
```

Expected: FAIL because requests/service do not exist.

- [ ] **Step 5: Commit tests**

```bash
git add tests/Feature/ParentBindingInvitationTest.php tests/Feature/Api/ParentBindingApiTest.php
git commit -m "test: define parent invitation binding behavior"
```

### Task 5: Implement Transactional Invitation Binding

**Files:**
- Create: `app/Http/Requests/Parent/StoreParentChildBindingRequest.php`
- Create: `app/Services/ParentBindingService.php`
- Modify: `app/Http/Controllers/ParentController.php`
- Modify: `app/Http/Controllers/Api/ParentController.php`

- [ ] **Step 1: Generate request and service**

```bash
php artisan make:request Parent/StoreParentChildBindingRequest --no-interaction
php artisan make:class Services/ParentBindingService --no-interaction
```

- [ ] **Step 2: Implement request authorization and rules**

```php
public function authorize(): bool
{
    return Gate::allows('bind-parent-child');
}

public function rules(): array
{
    return [
        'child_student_id' => ['required', 'string', 'exists:users,student_id'],
        'invitation_code' => ['required', 'string', 'size:8'],
        'relationship' => ['required', Rule::in(['父亲', '母亲', '其他'])],
    ];
}
```

- [ ] **Step 3: Implement `bindParent()`**

```php
public function bindParent(
    User $parent,
    string $studentId,
    string $invitationCode,
    string $relationship,
): ParentChild {
    return DB::transaction(function () use ($parent, $studentId, $invitationCode, $relationship) {
        $student = User::query()->where('student_id', $studentId)->firstOrFail();

        $invitation = ParentBindingInvitation::query()
            ->where('student_id', $student->id)
            ->where('code_hash', hash('sha256', strtoupper($invitationCode)))
            ->lockForUpdate()
            ->first();

        if (! $invitation || $invitation->isExpired() || $invitation->isConsumed() || $invitation->revoked_at) {
            throw ValidationException::withMessages([
                'invitation_code' => '邀请码无效、已过期或已使用。',
            ]);
        }

        $requiresReview = app(SettingsService::class)
            ->get('parent_binding_requires_head_teacher_review', false);

        $relation = ParentChild::query()->updateOrCreate(
            ['parent_id' => $parent->id, 'child_id' => $student->id],
            [
                'relationship' => $relationship,
                'status' => $requiresReview ? 'pending' : 'approved',
                'is_approved' => ! $requiresReview,
                'approved_at' => $requiresReview ? null : now(),
                'invitation_id' => $invitation->id,
            ],
        );

        $invitation->update([
            'consumed_at' => now(),
            'consumed_by_parent_id' => $parent->id,
        ]);

        return $relation->refresh();
    }, attempts: 3);
}
```

Use the actual `SettingsService` method signature found in the repository.

- [ ] **Step 4: Replace duplicate controller implementations**

Both Web `store()` and API `bindChild()` must call the same service with `$request->validated()` values. Web redirects with success status; API returns a JSON representation containing `status` and whether review is required.

- [ ] **Step 5: Run binding tests**

```bash
php artisan test --compact tests/Feature/ParentBindingInvitationTest.php
php artisan test --compact tests/Feature/Api/ParentBindingApiTest.php
```

Expected: invitation lifecycle tests pass except generation/review paths not implemented yet.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Requests/Parent app/Services/ParentBindingService.php app/Http/Controllers/ParentController.php app/Http/Controllers/Api/ParentController.php
git commit -m "feat: bind parents through single-use invitations"
```

### Task 6: Enforce Approved Relationship Access Everywhere

**Files:**
- Modify: `app/Http/Controllers/ParentController.php`
- Modify: `app/Http/Controllers/Api/ParentController.php`

- [ ] **Step 1: Add a shared relation lookup helper per controller**

Each controller should query by parent and child without filtering status:

```php
private function relationFor(User $parent, string $childId): ParentChild
{
    return ParentChild::query()
        ->where('parent_id', $parent->id)
        ->where('child_id', $childId)
        ->firstOrFail();
}
```

- [ ] **Step 2: Authorize every child-data action**

For show, points, ranking, transactions, and orders:

```php
$relation = $this->relationFor($request->user(), $childId);
Gate::authorize('view', $relation);
$child = $relation->child;
```

For unlink:

```php
Gate::authorize('delete', $relation);
```

- [ ] **Step 3: Run authorization and API tests**

```bash
php artisan test --compact tests/Feature/ParentBindingAuthorizationTest.php
php artisan test --compact tests/Feature/Api/ParentBindingApiTest.php
```

Expected: approved relations pass; pending/rejected relations return 403; missing relations remain 404.

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/ParentController.php app/Http/Controllers/Api/ParentController.php
git commit -m "fix: authorize all parent child data access"
```

### Task 7: Issue Secure Invitations

**Files:**
- Create: `app/Http/Requests/Admin/StoreParentBindingInvitationRequest.php`
- Create: `app/Http/Controllers/Admin/ParentBindingInvitationController.php`
- Modify: `app/Services/ParentBindingService.php`
- Modify: `routes/admin.php`
- Modify: `tests/Feature/ParentBindingInvitationTest.php`

- [ ] **Step 1: Add failing issue tests**

Cover:

```php
it('allows a head teacher to issue an invitation for their own student', function () {});
it('forbids a head teacher from issuing an invitation for another class', function () {});
it('stores only a hash and returns plaintext once', function () {});
```

Run to verify red.

- [ ] **Step 2: Generate request/controller**

```bash
php artisan make:request Admin/StoreParentBindingInvitationRequest --no-interaction
php artisan make:controller Admin/ParentBindingInvitationController --no-interaction
```

- [ ] **Step 3: Implement `createInvitation()`**

```php
/** @return array{invitation: ParentBindingInvitation, code: string} */
public function createInvitation(User $actor, User $student, int $expiresInMinutes = 30): array
{
    Gate::authorize('generateParentBindingInvitation', $student);

    $code = Str::password(length: 8, letters: true, numbers: true, symbols: false);
    $code = strtoupper(strtr($code, ['0' => '2', 'O' => '8', 'I' => '9', '1' => '7']));

    $invitation = ParentBindingInvitation::query()->create([
        'student_id' => $student->id,
        'code_hash' => hash('sha256', $code),
        'code_last_four' => substr($code, -4),
        'expires_at' => now()->addMinutes($expiresInMinutes),
        'created_by' => $actor->id,
    ]);

    return compact('invitation', 'code');
}
```

If `Str::password` cannot guarantee exactly eight characters after mapping, use a dedicated alphabet and `random_int` loop.

- [ ] **Step 4: Add route and response**

```php
Route::post('/users/{student}/parent-binding-invitations', [ParentBindingInvitationController::class, 'store'])
    ->name('users.parent-binding-invitations.store');
```

Return the plaintext in flash data only for the successful response; never persist or log it.

- [ ] **Step 5: Run tests and commit**

```bash
php artisan test --compact tests/Feature/ParentBindingInvitationTest.php
git add app/Http/Requests/Admin/StoreParentBindingInvitationRequest.php app/Http/Controllers/Admin/ParentBindingInvitationController.php app/Services/ParentBindingService.php routes/admin.php tests/Feature/ParentBindingInvitationTest.php
git commit -m "feat: issue scoped parent binding invitations"
```

### Task 8: Add Optional Head-Teacher Review

**Files:**
- Create: `app/Http/Requests/Admin/ApproveParentChildRequest.php`
- Create: `app/Http/Requests/Admin/RejectParentChildRequest.php`
- Create: `app/Http/Controllers/Admin/ParentChildApprovalController.php`
- Modify: `app/Services/ParentBindingService.php`
- Modify: `routes/admin.php`
- Modify: `tests/Feature/ParentBindingAuthorizationTest.php`

- [ ] **Step 1: Add failing review tests**

Cover own-class approval, other-class forbidden, rejection reason required, and rejected relation access forbidden.

- [ ] **Step 2: Generate request/controller files**

```bash
php artisan make:request Admin/ApproveParentChildRequest --no-interaction
php artisan make:request Admin/RejectParentChildRequest --no-interaction
php artisan make:controller Admin/ParentChildApprovalController --no-interaction
```

- [ ] **Step 3: Implement request rules**

Approve:

```php
public function authorize(): bool
{
    return Gate::allows('review', $this->route('relation'));
}

public function rules(): array
{
    return ['note' => ['nullable', 'string', 'max:500']];
}
```

Reject requires `reason` with max 500.

- [ ] **Step 4: Implement service transitions**

```php
public function approve(User $reviewer, ParentChild $relation, ?string $note = null): ParentChild
{
    return DB::transaction(function () use ($reviewer, $relation) {
        $locked = ParentChild::query()->lockForUpdate()->findOrFail($relation->id);
        Gate::authorize('review', $locked);

        $locked->update([
            'status' => 'approved',
            'is_approved' => true,
            'approved_at' => now(),
            'reviewer_id' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ]);

        return $locked->refresh();
    }, attempts: 3);
}
```

`reject()` mirrors this with `status = rejected`, false approval, null `approved_at`, and reason.

- [ ] **Step 5: Add admin routes**

```php
Route::prefix('parent-bindings')->name('parent-bindings.')->group(function () {
    Route::get('/', [ParentChildApprovalController::class, 'index'])->name('index');
    Route::post('/{relation}/approve', [ParentChildApprovalController::class, 'approve'])->name('approve');
    Route::post('/{relation}/reject', [ParentChildApprovalController::class, 'reject'])->name('reject');
});
```

- [ ] **Step 6: Run tests and commit**

```bash
php artisan test --compact tests/Feature/ParentBindingAuthorizationTest.php
git add app/Http/Requests/Admin app/Http/Controllers/Admin/ParentChildApprovalController.php app/Services/ParentBindingService.php routes/admin.php tests/Feature/ParentBindingAuthorizationTest.php
git commit -m "feat: add optional head teacher parent binding review"
```

### Task 9: Register the Review Setting

**Files:**
- Modify: existing setting seed/default location discovered during implementation
- Test: `tests/Feature/ParentBindingInvitationTest.php`

- [ ] **Step 1: Locate the existing default setting pattern**

Use `Setting`/`SettingsService` siblings and seeders. Do not create a new settings subsystem.

- [ ] **Step 2: Add default value**

Add:

```php
[
    'key' => 'parent_binding_requires_head_teacher_review',
    'value' => false,
    'type' => 'boolean',
    'group' => 'security',
]
```

Match the existing schema and helper signature exactly.

- [ ] **Step 3: Verify both branches**

```bash
php artisan test --compact --filter="creates an approved relation when review is disabled"
php artisan test --compact --filter="creates a pending relation when review is enabled"
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add database app tests/Feature/ParentBindingInvitationTest.php
git commit -m "feat: configure optional parent binding review"
```

### Task 10: Final Authorization Verification

**Files:**
- No new files expected

- [ ] **Step 1: Format PHP**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 2: Run focused tests**

```bash
php artisan test --compact tests/Feature/ParentBindingInvitationTest.php
php artisan test --compact tests/Feature/ParentBindingAuthorizationTest.php
php artisan test --compact tests/Feature/Api/ParentBindingApiTest.php
php artisan test --compact tests/Feature/AdminUserAuthorizationTest.php
php artisan test --compact tests/Feature/AdminApprovalsTest.php
```

Expected: all pass.

- [ ] **Step 3: Inspect routes**

```bash
php artisan route:list --except-vendor --path=parent
php artisan route:list --except-vendor --path=admin/parent-bindings
```

Expected: parent routes remain authenticated; invitation/review routes resolve to new controllers.

- [ ] **Step 4: Run complete PHP suite**

```bash
php artisan test --compact
```

Expected: exit 0.
