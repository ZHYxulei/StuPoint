# Class Points Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add install-time selection for class points calculation mode and display current class points on the homepage using the selected mode.

**Architecture:** Store the chosen mode in settings during the install site step. Compute class points in `HomeController@index()` using SQL aggregates and pass to the `welcome` page. Render a new stats card for class points on the homepage. The chosen mode is immutable post-install by hiding/removing it from admin settings.

**Tech Stack:** Laravel 12, Inertia React v2, Tailwind CSS v4, Pest 3

---

### Task 1: Add install-time field and persist to settings

**Files:**
- Modify: `resources/js/pages/install/site.tsx`
- Modify: `app/Http/Controllers/Install/InstallController.php`
- Modify: `app/Services/SettingsService.php` (if helper needed)
- Modify: `app/Providers/AppServiceProvider.php` (if shared settings used)
- Test: `tests/Feature/InstallClassPointsModeTest.php`

**Step 1: Write the failing test**

```php
<?php

use App\Models\Setting;

it('stores class points mode during install site step', function () {
    $payload = [
        'app_name' => 'StuPoint',
        'app_url' => 'http://localhost:8000',
        'locale' => 'zh',
        'class_points_mode' => 'avg',
    ];

    $this->post('/install/site', $payload)
        ->assertRedirect('/install/account');

    expect(Setting::get('class_points_mode'))->toBe('avg');
});
```

**Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/InstallClassPointsModeTest.php`
Expected: FAIL (missing field / not stored)

**Step 3: Implement minimal changes**

- Add radio group to `install/site.tsx` with values `avg | sum | separate` and form field `class_points_mode`.
- In `InstallController@storeSite` validate `class_points_mode` and call `Setting::set('class_points_mode', $validated['class_points_mode'], 'string', 'site')`.

**Step 4: Run test to verify it passes**

Run: `php artisan test --compact tests/Feature/InstallClassPointsModeTest.php`
Expected: PASS

**Step 5: Commit**

```bash
git add resources/js/pages/install/site.tsx app/Http/Controllers/Install/InstallController.php tests/Feature/InstallClassPointsModeTest.php
git commit -m "feat: store class points mode during install"
```

---

### Task 2: Compute class points in HomeController

**Files:**
- Modify: `app/Http/Controllers/HomeController.php`
- Test: `tests/Feature/HomeClassPointsTest.php`

**Step 1: Write the failing test**

```php
<?php

use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns class points using avg mode', function () {
    Setting::set('class_points_mode', 'avg');

    $role = Role::create([
        'name' => 'Student',
        'slug' => 'student',
        'description' => 'Student',
        'is_system' => true,
        'level' => 10,
    ]);

    $studentA = User::factory()->create(['class_id' => 1, 'grade_id' => 1]);
    $studentB = User::factory()->create(['class_id' => 1, 'grade_id' => 1]);
    $studentA->assignRole($role);
    $studentB->assignRole($role);

    UserPoint::create(['user_id' => $studentA->id, 'total_points' => 100, 'redeemable_points' => 0]);
    UserPoint::create(['user_id' => $studentB->id, 'total_points' => 300, 'redeemable_points' => 0]);

    $this->actingAs($studentA)
        ->get('/')
        ->assertInertia(fn ($page) => $page->where('userStats.class_points', 200));
});
```

**Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/HomeClassPointsTest.php`
Expected: FAIL (missing class_points)

**Step 3: Implement minimal code**

In `HomeController@index()`:
- Load class points only when `$user->class_id` present.
- Use `Setting::get('class_points_mode', 'avg')` to decide.
- For avg/sum: aggregate `users` in same class with role `student` joined to `user_points`.
- For separate: set `null` (until separate storage is implemented).

**Step 4: Run test to verify it passes**

Run: `php artisan test --compact tests/Feature/HomeClassPointsTest.php`
Expected: PASS

**Step 5: Commit**

```bash
git add app/Http/Controllers/HomeController.php tests/Feature/HomeClassPointsTest.php
git commit -m "feat: compute class points for homepage"
```

---

### Task 3: Display class points on homepage

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

**Step 1: Write the failing test**

(If no front-end test framework, skip this step; rely on manual verification.)

**Step 2: Implement UI**

- Add a new card in the stats grid labeled "当前班级积分".
- Display `localStats.class_points` or `--` when null.
- Keep styles consistent with existing cards.

**Step 3: Verify manually**

- Run `npm run dev` and confirm the card renders with correct value.

**Step 4: Commit**

```bash
git add resources/js/pages/welcome.tsx
git commit -m "feat: show class points on homepage"
```

---

### Task 4: Make mode immutable post-install

**Files:**
- Modify: `resources/js/pages/admin/settings/index.tsx`
- Modify: `app/Http/Controllers/Admin/SettingsController.php` (if needed to ignore edits)

**Step 1: Implement**

- Do not render `class_points_mode` in admin settings.
- (Optional) Ignore any incoming `class_points_mode` in update handler.

**Step 2: Verify**

- Ensure settings UI does not show class points mode.
- POST to settings should not change mode.

**Step 3: Commit**

```bash
git add resources/js/pages/admin/settings/index.tsx app/Http/Controllers/Admin/SettingsController.php
git commit -m "chore: lock class points mode after install"
```

---

### Task 5: Run formatting + tests + update changelog

**Files:**
- Modify: `README.md` (更新日志)

**Steps:**
1. Run Pint: `./vendor/bin/pint --dirty`
2. Run relevant tests:
   - `php artisan test --compact tests/Feature/InstallClassPointsModeTest.php`
   - `php artisan test --compact tests/Feature/HomeClassPointsTest.php`
3. Update README 更新日志.

**Commit:**
```bash
git add README.md
git commit -m "docs: update changelog for class points mode"
```

---

## Notes
- If Inertia assertions aren’t available, replace with response JSON or view data checks.
- For average calculation, use SQL aggregation (`SUM/COUNT`) to avoid N+1.
- For `separate` mode, return `null` until a class points store is implemented.
