# StuPoint Security and Shadcn Migration Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coordinate the approved security audit, business-integrity fixes, and full-site calm-campus shadcn/ui migration as independently testable delivery phases.

**Architecture:** This master plan is an execution index, not a replacement for the detailed subplans. Establish quality gates first, implement independent backend security domains second, consolidate the design system third, and migrate pages only after their backend contracts and shared components are stable. Each subplan must finish its own focused verification before the next dependent phase begins.

**Tech Stack:** Laravel 13, PHP 8.4, Pest 4, MySQL/SQLite, Inertia v3, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI, Vite SSR, GitHub Actions; optional approved Playwright/axe.

---

## Detailed Plans

1. `docs/superpowers/plans/2026-07-28-baseline-quality-gates.md`
2. `docs/superpowers/plans/2026-07-28-authorization-parent-binding.md`
3. `docs/superpowers/plans/2026-07-28-plugin-security-hardening.md`
4. `docs/superpowers/plans/2026-07-28-points-orders-verification.md`
5. `docs/superpowers/plans/2026-07-28-shadcn-design-system-consolidation.md`
6. `docs/superpowers/plans/2026-07-28-full-site-shadcn-page-migration.md`

## Dependency Graph

```text
Baseline/quality gates
├── Authorization + parent binding ─┐
├── Plugin security ────────────────┼── Design-system consolidation ── Full-site page migration
└── Points/orders/verification ─────┘
```

The three backend plans are independent enough to execute separately after the baseline. They must not edit UI pages. Design-system consolidation starts only after backend response contracts are stable enough to type. Full-site page migration starts after all five prior plans are green.

### Task 1: Establish Baseline and Quality Gates

**Plan:** `2026-07-28-baseline-quality-gates.md`

- [ ] **Step 1: Execute Tasks 1–9 from the baseline plan**

Required deliverables:

- read-only frontend gate scripts;
- explicit PHP audit/test scripts;
- Inertia page smoke tests;
- correct SSR hydration;
- MySQL compatibility suite;
- split GitHub quality/test/build/MySQL jobs;
- explicit CircleCI ownership decision.

- [ ] **Step 2: Decide optional browser dependencies**

Ask for approval before adding:

```text
@playwright/test
@axe-core/playwright
```

If denied, continue without Task 10 and use manual browser verification in later phases.

- [ ] **Step 3: Pass baseline gates**

```bash
composer audit:php
composer test:php
npm run gate:frontend:static
npm run gate:frontend:build
DB_CONNECTION=mysql composer test:mysql
```

Expected: all implemented gates exit 0. Record any accepted baseline exception explicitly.

- [ ] **Step 4: Checkpoint commit**

All baseline commits are already defined in the detailed plan. Do not squash them before review.

### Task 2: Implement Shared Authorization and Parent Binding

**Plan:** `2026-07-28-authorization-parent-binding.md`

- [ ] **Step 1: Execute detailed Tasks 1–9 with TDD**

Deliverables:

- User and ParentChild policies;
- no role escalation above actor authority;
- dedicated hashed parent invitations;
- explicit pending/approved/rejected relationships;
- optional head-teacher review setting;
- Web/API parity and approved-only data access.

- [ ] **Step 2: Pass focused verification**

```bash
php artisan test --compact tests/Feature/ParentBindingInvitationTest.php
php artisan test --compact tests/Feature/ParentBindingAuthorizationTest.php
php artisan test --compact tests/Feature/Api/ParentBindingApiTest.php
php artisan test --compact tests/Feature/AdminUserAuthorizationTest.php
php artisan test --compact tests/Feature/AdminApprovalsTest.php
```

Expected: all pass.

- [ ] **Step 3: Run complete PHP suite and checkpoint review**

```bash
vendor/bin/pint --dirty --format agent
php artisan test --compact
```

Expected: exit 0 before marking this backend contract stable.

### Task 3: Harden Plugin Deployment and Runtime

**Plan:** `2026-07-28-plugin-security-hardening.md`

- [ ] **Step 1: Execute detailed Tasks 1–7 with TDD**

Deliverables:

- real ZIP traversal rejection;
- one `manifest.json` contract;
- upload-as-inert-artifact behavior;
- no automatic Composer, migration, class loading, or plugin lifecycle execution;
- enabled-only runtime boot;
- isolated disable/uninstall plus operation logs and rollback.

- [ ] **Step 2: Pass plugin security verification**

```bash
php artisan test --compact tests/Unit/Services/PluginArchiveInspectorTest.php
php artisan test --compact tests/Unit/Services/PluginManifestValidatorTest.php
php artisan test --compact tests/Unit/Services/PluginManagerTest.php
php artisan test --compact tests/Feature/AdminPluginLifecycleTest.php
php artisan route:list --name=admin.plugins --except-vendor
```

Expected: all tests pass and lifecycle operations never invoke Composer/migrations/plugin hooks.

- [ ] **Step 3: Run full PHP suite**

```bash
vendor/bin/pint --dirty --format agent
php artisan test --compact
```

### Task 4: Fix Points, Orders, and Verification Lifecycles

**Plan:** `2026-07-28-points-orders-verification.md`

- [ ] **Step 1: Execute detailed Tasks 1–9 with TDD**

Deliverables:

- locked point account mutations and ledger consistency;
- order quantity and unit-point snapshot;
- transactional placement;
- legal state machine;
- idempotent refund/restock;
- purpose-isolated SMS code consumption;
- persisted atomic order-code consumption;
- no login-password redemption method and no sensitive logging.

- [ ] **Step 2: Pass focused verification**

```bash
php artisan test --compact tests/Unit/Services/PointServiceTest.php
php artisan test --compact tests/Feature/Api/Shop/CreateOrderQuantityTest.php
php artisan test --compact tests/Unit/Services/Orders/OrderStateMachineServiceTest.php
php artisan test --compact tests/Unit/Services/Orders/OrderRefundServiceTest.php
php artisan test --compact tests/Feature/Admin/Orders/TransitionOrderStatusTest.php
php artisan test --compact tests/Feature/Verification/SmsVerificationCodeConsumptionTest.php
php artisan test --compact tests/Feature/Admin/Orders/VerifyOrderTest.php
```

Expected: all pass.

- [ ] **Step 3: Prove MySQL concurrency**

```bash
DB_CONNECTION=mysql CACHE_STORE=file php artisan test --compact tests/Feature/Orders/MySqlOrderConcurrencyTest.php
```

Expected: deterministic single debit, single verification consumption, and single compensation.

- [ ] **Step 4: Run full PHP suite**

```bash
vendor/bin/pint --dirty --format agent
php artisan test --compact
```

### Task 5: Re-run Backend Security Review

**Files:**
- Review current backend diff only

- [ ] **Step 1: Review authorization, data integrity, plugin execution, and sensitive logging**

Use the repository review/security-review process. Verify findings against actual call paths; do not report speculative issues as confirmed.

- [ ] **Step 2: Add regression tests for confirmed review findings**

For each finding, write a failing test, verify red, implement the minimal fix, verify green, and commit independently.

- [ ] **Step 3: Pass backend gates again**

```bash
composer audit:php
composer test:php
DB_CONNECTION=mysql composer test:mysql
```

Expected: exit 0.

### Task 6: Consolidate the Shadcn Design System

**Plan:** `2026-07-28-shadcn-design-system-consolidation.md`

- [ ] **Step 1: Execute detailed Tasks 1–8**

Deliverables:

- calm-campus semantic tokens;
- unified InputError and pagination boundaries;
- shared Empty/page/filter/form/status/mobile compositions;
- SSR-safe Settings layout;
- Public and Install layouts;
- accessible Button-as-child and navigation patterns.

Do not reinitialize shadcn or overwrite local primitives with the CLI.

- [ ] **Step 2: Pass design-system gates**

```bash
npm run gate:frontend:static
npm run gate:frontend:build
```

Expected: exit 0.

- [ ] **Step 3: Smoke shared shells**

Check `/`, `/ranking`, `/settings/profile`, and `/install/check` at 1440×900 and 390×844, light/dark, keyboard-only, with no console errors.

### Task 7: Migrate All Page Families

**Plan:** `2026-07-28-full-site-shadcn-page-migration.md`

- [ ] **Step 1: Execute page Tasks 1–9**

Migrate lower-risk admin CRUD, dashboard/points, shop, parent, student council, public, auth, profile, and settings. Run each task's targeted static/build/browser checks and commit independently.

- [ ] **Step 2: Checkpoint frontend review**

Verify component reuse, responsive behavior, form semantics, and backend contract matching before complex admin pages.

- [ ] **Step 3: Execute page Tasks 10–16**

Migrate approvals, users, quick grading, orders, plugins, system settings, and the installation wizard. Do not re-open settled backend business logic while migrating UI.

- [ ] **Step 4: Run full-site gates**

```bash
npm run gate:frontend:static
npm run gate:frontend:build
php artisan test --compact
```

Expected: exit 0.

- [ ] **Step 5: Run browser suite if installed**

```bash
npx playwright test
```

Expected: exit 0.

### Task 8: Final End-to-End Verification

- [ ] **Step 1: Exercise critical business flows**

In a disposable environment, verify:

1. register/login/2FA/password reset;
2. invitation parent binding with review off and on;
3. role-based admin denial and allowed actions;
4. point adjustment and quick grading;
5. multi-quantity purchase, stock/points totals, cancellation compensation;
6. order code single-use verification;
7. plugin invalid ZIP rejection, inert upload, enable, disable, guarded uninstall;
8. settings save and full install wizard.

- [ ] **Step 2: Exercise role/viewport/theme matrix**

Roles: guest, student, parent, head teacher, admin, super admin.

Viewports: 1440×900 and 390×844.

Themes: light and dark; verify default calm-campus theme and existing theme choices.

- [ ] **Step 3: Run final automated gates**

```bash
composer audit:php
composer test:php
npm run gate:frontend:static
npm run gate:frontend:build
DB_CONNECTION=mysql composer test:mysql
```

If browser dependencies were approved:

```bash
npx playwright test
```

Expected: every command exits 0.

- [ ] **Step 4: Verify repository hygiene**

```bash
git status --short --untracked-files=all
git check-ignore -v .superpowers/brainstorm 2>/dev/null || true
```

Expected:

- no `.superpowers/` files are staged or committed;
- temporary test archives/databases are absent;
- user-owned pre-existing changes were preserved intentionally;
- only reviewed source, tests, migrations, CI, and approved docs are included.

### Task 9: Final Review and Delivery

- [ ] **Step 1: Run code and security review on the complete diff**

Confirm every finding with file/line and execution path. Fix confirmed issues through tests.

- [ ] **Step 2: Compare completed work to the approved specification**

Review each completion criterion in `docs/superpowers/specs/2026-07-28-security-audit-shadcn-ui-design.md` and link it to a passing test, verification command, or explicit accepted-risk decision.

- [ ] **Step 3: Prepare delivery summary**

Report:

- confirmed vulnerabilities and fixes;
- findings proven false;
- accepted risks;
- database and API contract changes;
- UI migration coverage;
- exact verification commands and results;
- any skipped optional dependency/browser work.
