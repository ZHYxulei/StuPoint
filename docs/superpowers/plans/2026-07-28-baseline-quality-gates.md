# Baseline and Quality Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish non-mutating static checks, reliable PHP/TypeScript/client/SSR gates, focused MySQL compatibility coverage, and an optional approved browser-test foundation before security and UI work begins.

**Architecture:** Keep the fast Pest suite on SQLite, isolate MySQL-specific behavior in a tagged smoke suite, and split CI by responsibility. Generate Wayfinder artifacts before TypeScript/build checks. Browser automation is a separate dependency-gated task because this repository forbids dependency changes without approval.

**Tech Stack:** Laravel 13, PHP 8.4, Pest 4, Inertia v3, React 19, TypeScript 6, Vite 8, Wayfinder, GitHub Actions, MySQL 8.4; optional Playwright and axe.

---

## File Map

- Modify `package.json`: add non-mutating frontend gates while preserving the user's existing `allowScripts` change.
- Modify `composer.json`: add explicit PHP audit, SQLite test, and MySQL smoke commands.
- Modify `resources/js/app.tsx`: hydrate SSR markup instead of always recreating the root.
- Create `tests/Feature/Web/PublicPagesTest.php`: lock public Inertia component mappings.
- Create `tests/Feature/Web/AuthPagesTest.php`: lock authentication page mappings.
- Create `tests/Feature/Infrastructure/MySqlCompatibilityTest.php`: verify MySQL-only JSON, enum, FK, and indexed-query behavior.
- Modify `.github/workflows/lint.yml`: make quality checks read-only.
- Modify `.github/workflows/tests.yml`: separate SQLite tests, frontend builds, and MySQL smoke.
- Optional create `playwright.config.ts`, `tests/Browser/auth.smoke.spec.ts`, and `database/seeders/BrowserTestUserSeeder.php` only after explicit dependency approval.

### Task 1: Record the Existing Baseline

**Files:**
- No source changes
- Inspect: `package.json`, `composer.json`, `.github/workflows/*.yml`, `phpunit.xml`

- [ ] **Step 1: Run the current PHP suite**

Run:

```bash
php artisan test --compact
```

Expected: capture the exact pass/fail count. Do not repair failures in this task.

- [ ] **Step 2: Run current frontend checks independently**

Run:

```bash
npm run types
npm run format:check
npx eslint .
npm run build
npm run build:ssr
```

Expected: record every existing failure separately. `npx eslint .` must not use `--fix`.

- [ ] **Step 3: Run dependency audits**

Run:

```bash
composer audit --locked
npm audit --audit-level=high --omit=optional
```

Expected: record advisories and existing Composer ignores. Do not broaden ignore lists.

- [ ] **Step 4: Confirm the working tree boundary**

Run:

```bash
git status --short
git diff -- package.json
```

Expected: `package.json` contains the user's pre-existing `allowScripts` change. Preserve it exactly in later edits.

### Task 2: Add Non-Mutating Frontend Gate Scripts

**Files:**
- Modify: `package.json:4-13`

- [ ] **Step 1: Edit only the `scripts` object**

Merge these keys without replacing `dependencies`, `optionalDependencies`, or `allowScripts`:

```json
{
  "wayfinder:generate": "php artisan wayfinder:generate --with-form --no-interaction",
  "build": "npm run wayfinder:generate && vite build",
  "build:ssr": "npm run wayfinder:generate && vite build && vite build --ssr",
  "dev": "vite",
  "format": "prettier --write resources/",
  "format:check": "prettier --check resources/",
  "lint": "eslint . --fix",
  "lint:check": "eslint .",
  "types": "npm run wayfinder:generate && tsc --noEmit",
  "audit:js": "npm audit --audit-level=high --omit=optional",
  "gate:frontend:static": "npm run format:check && npm run lint:check && npm run types",
  "gate:frontend:build": "npm run build && npm run build:ssr",
  "update_env": "node scripts/update_env.cjs"
}
```

- [ ] **Step 2: Verify the new static gate is non-mutating**

Run:

```bash
before=$(git status --porcelain)
npm run gate:frontend:static
after=$(git status --porcelain)
test "$before" = "$after"
```

Expected: check result reflects current code quality, and the command introduces no new tracked changes.

- [ ] **Step 3: Verify build gates**

Run:

```bash
npm run gate:frontend:build
```

Expected: client and SSR bundles build, or the pre-existing failures are reproduced exactly.

- [ ] **Step 4: Commit only script changes**

```bash
git add package.json
git commit -m "build: add read-only frontend quality gates"
```

### Task 3: Add Explicit PHP Gate Scripts

**Files:**
- Modify: `composer.json:58-105`

- [ ] **Step 1: Merge the new Composer script entries**

Keep all unrelated existing scripts. The relevant target entries are:

```json
{
  "audit:php": "composer audit --locked",
  "test:lint": [
    "pint --parallel --test"
  ],
  "test:php": [
    "@php artisan config:clear --ansi",
    "@test:lint",
    "@php artisan test --compact"
  ],
  "test:mysql": [
    "@php artisan test --compact --group=mysql"
  ],
  "test": [
    "@test:php"
  ]
}
```

- [ ] **Step 2: Verify the PHP gates**

Run:

```bash
composer audit:php
composer test:php
```

Expected: audit respects the existing locked advisory baseline; tests and Pint report their exact current status.

- [ ] **Step 3: Commit**

```bash
git add composer.json
git commit -m "build: add explicit php audit and test gates"
```

### Task 4: Lock Core Inertia Page Mappings

**Files:**
- Create: `tests/Feature/Web/PublicPagesTest.php`
- Create: `tests/Feature/Web/AuthPagesTest.php`

- [ ] **Step 1: Generate tests**

```bash
php artisan make:test --pest Web/PublicPagesTest --no-interaction
php artisan make:test --pest Web/AuthPagesTest --no-interaction
```

- [ ] **Step 2: Write public page tests**

Use the actual route availability from `routes/web.php`:

```php
<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders the public welcome page', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
        );
});

it('renders the public ranking page', function () {
    $this->get('/ranking')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ranking/index')
        );
});
```

If `/ranking` requires seeded records, create them with existing factories rather than weakening assertions.

- [ ] **Step 3: Write auth page tests**

```php
<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the login page', function () {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
        );
});

it('renders the dashboard for an approved user', function () {
    $user = User::factory()->approved()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
        );
});
```

- [ ] **Step 4: Run the focused tests**

```bash
php artisan test --compact tests/Feature/Web/PublicPagesTest.php
php artisan test --compact tests/Feature/Web/AuthPagesTest.php
```

Expected: PASS. If a component name differs, fix the test to the route's real component; do not change production routing in this baseline task.

- [ ] **Step 5: Commit**

```bash
git add tests/Feature/Web/PublicPagesTest.php tests/Feature/Web/AuthPagesTest.php
git commit -m "test: cover core inertia page mappings"
```

### Task 5: Make Client Boot SSR-Aware

**Files:**
- Modify: `resources/js/app.tsx:1-31`

- [ ] **Step 1: Confirm the current failure mode**

Inspect the setup callback and verify it always calls `createRoot` even when SSR markup exists.

- [ ] **Step 2: Implement hydration with a client-only fallback**

Update imports and setup logic:

```tsx
import { createRoot, hydrateRoot } from 'react-dom/client';

setup({ el, App, props }) {
    const application = (
        <StrictMode>
            <App {...props} />
        </StrictMode>
    );

    if (el.hasChildNodes()) {
        hydrateRoot(el, application);

        return;
    }

    createRoot(el).render(application);
},
```

Keep existing title, resolve, progress, and appearance initialization behavior unchanged.

- [ ] **Step 3: Verify type and builds**

```bash
npm run types
npm run build
npm run build:ssr
```

Expected: all commands exit 0.

- [ ] **Step 4: Commit**

```bash
git add resources/js/app.tsx
git commit -m "fix: hydrate inertia ssr markup"
```

### Task 6: Add Focused MySQL Compatibility Tests

**Files:**
- Create: `tests/Feature/Infrastructure/MySqlCompatibilityTest.php`

- [ ] **Step 1: Generate the test**

```bash
php artisan make:test --pest Infrastructure/MySqlCompatibilityTest --no-interaction
```

- [ ] **Step 2: Add the MySQL group guard**

Start the file with:

```php
<?php

use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;

uses()->group('mysql');

beforeEach(function () {
    if (config('database.default') !== 'mysql') {
        $this->markTestSkipped('MySQL compatibility tests require DB_CONNECTION=mysql.');
    }
});
```

- [ ] **Step 3: Add JSON round-trip coverage**

```php
it('round trips json metadata and shipping information', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $transaction = PointTransaction::factory()->create([
        'user_id' => $user->id,
        'metadata' => ['source' => 'mysql-smoke'],
    ]);

    $order = Order::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'shipping_info' => ['name' => '测试用户', 'phone' => '13800000000'],
        'metadata' => ['channel' => 'mysql-smoke'],
    ]);

    expect($transaction->fresh()->metadata)->toBe(['source' => 'mysql-smoke'])
        ->and($order->fresh()->shipping_info['phone'])->toBe('13800000000')
        ->and($order->fresh()->metadata)->toBe(['channel' => 'mysql-smoke']);
});
```

Match actual factory-required attributes and casts; do not use raw SQL.

- [ ] **Step 4: Add FK behavior coverage**

```php
it('applies category nulling and order cascading foreign key rules', function () {
    $category = ProductCategory::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
    ]);

    $category->delete();
    expect($product->fresh()->category_id)->toBeNull();

    $user->delete();
    expect(Order::query()->whereKey($order->id)->exists())->toBeFalse();
});
```

- [ ] **Step 5: Run against MySQL**

```bash
DB_CONNECTION=mysql php artisan test --compact --group=mysql
```

Expected: PASS on a disposable MySQL test database. Never point this command at production or shared data.

- [ ] **Step 6: Commit**

```bash
git add tests/Feature/Infrastructure/MySqlCompatibilityTest.php
git commit -m "test: add mysql compatibility smoke coverage"
```

### Task 7: Make GitHub Quality Checks Read-Only

**Files:**
- Modify: `.github/workflows/lint.yml`

- [ ] **Step 1: Replace mutating frontend commands**

Ensure the job explicitly installs PHP and Node, prepares `.env`, then runs:

```yaml
- name: PHP audit
  run: composer audit --locked

- name: JS audit baseline
  continue-on-error: true
  run: npm run audit:js

- name: PHP style check
  run: vendor/bin/pint --test --parallel

- name: Frontend static gate
  run: npm run gate:frontend:static
```

Use `npm ci`, not `npm install`. Remove `contents: write` unless another active step requires it.

- [ ] **Step 2: Validate YAML structure locally**

Run the repository's available YAML linter if present. Otherwise inspect the workflow with:

```bash
git diff --check -- .github/workflows/lint.yml
```

Expected: no whitespace errors; job contains no `npm run format` or `npm run lint` mutating commands.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/lint.yml
git commit -m "ci: make quality checks non-mutating"
```

### Task 8: Split Test, Build, and MySQL CI Jobs

**Files:**
- Modify: `.github/workflows/tests.yml`

- [ ] **Step 1: Keep SQLite Pest in its own PHP matrix**

Create `pest-sqlite` with PHP 8.4 and 8.5. Install Composer dependencies, prepare `.env`, and run:

```yaml
- name: Run Pest
  run: php artisan test --compact
```

Upload coverage only on PHP 8.4 to avoid duplicate reports.

- [ ] **Step 2: Add a dedicated client/SSR build job**

Use PHP 8.4 and Node 22, `composer install`, `npm ci`, app preparation, then:

```yaml
- name: Build client and SSR bundles
  run: npm run gate:frontend:build
```

- [ ] **Step 3: Add a MySQL 8.4 service job**

Use an isolated database named `stupoint_test`, health checks, testing environment variables, and:

```yaml
- name: Run MySQL smoke suite
  run: composer test:mysql
```

- [ ] **Step 4: Verify no production credentials or databases are referenced**

Check that all credentials are hard-coded disposable CI credentials and that `APP_ENV=testing` is set.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/tests.yml
git commit -m "ci: split php builds and mysql smoke tests"
```

### Task 9: Decide CircleCI Ownership

**Files:**
- Inspect/optional modify: `.circleci/config.yml`

- [ ] **Step 1: Ask whether CircleCI remains an active required check**

Do not infer from the file's presence. Record one of these decisions:

- Active: mirror the GitHub job boundaries.
- Inactive but retained: leave it unchanged and document GitHub Actions as the source of truth in the plan execution notes.
- Retire: remove only with explicit user approval.

- [ ] **Step 2: If active, mirror commands rather than inventing new ones**

Use `npm run gate:frontend:static`, `npm run gate:frontend:build`, `composer test:php`, and `composer test:mysql` so both CI systems share command definitions.

- [ ] **Step 3: Commit only if the file changed**

```bash
git add .circleci/config.yml
git commit -m "ci: align circleci quality gates"
```

### Task 10: Optional Browser and Accessibility Foundation

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `playwright.config.ts`
- Create: `tests/Browser/auth.smoke.spec.ts`
- Create: `database/seeders/BrowserTestUserSeeder.php`
- Modify: `.github/workflows/tests.yml`

- [ ] **Step 1: Obtain explicit dependency approval**

Required packages:

```text
@playwright/test
@axe-core/playwright
```

Stop this task if approval is not granted. Other plan tasks remain executable.

- [ ] **Step 2: Install approved dev dependencies**

```bash
npm install --save-dev @playwright/test @axe-core/playwright
npx playwright install chromium
```

- [ ] **Step 3: Create deterministic browser user seeding**

Generate:

```bash
php artisan make:seeder BrowserTestUserSeeder --no-interaction
```

Seeder behavior:

```php
User::factory()->approved()->create([
    'email' => 'browser@example.test',
    'password' => Hash::make('Browser-Test-Password-123!'),
]);
```

Assign the minimum role needed for `/dashboard` using existing role helpers.

- [ ] **Step 4: Configure Playwright web server**

`playwright.config.ts` must start the Laravel app with an isolated testing database, create `storage/installed`, seed the browser user, and use Chromium. Do not reuse developer or production databases.

- [ ] **Step 5: Add login and axe smoke coverage**

`tests/Browser/auth.smoke.spec.ts` should:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('guest pages render without serious accessibility violations', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /登录/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

    expect(
        results.violations.filter((violation) =>
            ['serious', 'critical'].includes(violation.impact ?? ''),
        ),
    ).toEqual([]);
});
```

Add a second test that logs in and reaches `/dashboard` using accessible labels.

- [ ] **Step 6: Run browser tests**

```bash
npx playwright test
```

Expected: guest accessibility smoke and authenticated dashboard smoke pass.

- [ ] **Step 7: Add a browser CI job and commit**

```bash
git add package.json package-lock.json playwright.config.ts tests/Browser/auth.smoke.spec.ts database/seeders/BrowserTestUserSeeder.php .github/workflows/tests.yml
git commit -m "test: add browser and accessibility smoke coverage"
```

### Task 11: Final Baseline Verification

**Files:**
- No new changes expected

- [ ] **Step 1: Run all non-browser gates**

```bash
composer audit:php
composer test:php
npm run gate:frontend:static
npm run gate:frontend:build
```

Expected: exit 0 for each command.

- [ ] **Step 2: Run MySQL smoke**

```bash
DB_CONNECTION=mysql composer test:mysql
```

Expected: exit 0 against the disposable test database.

- [ ] **Step 3: Run browser tests if Task 10 was approved and implemented**

```bash
npx playwright test
```

Expected: exit 0.

- [ ] **Step 4: Confirm temporary and user-owned changes are excluded**

```bash
git status --short --untracked-files=all
git check-ignore -v .superpowers/brainstorm 2>/dev/null || true
```

Expected: no `.superpowers/` artifacts are staged; the user's `allowScripts` content remains present and was never discarded.
