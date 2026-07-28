# Full-Site Shadcn Page Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all Inertia React page families to the consolidated calm-campus shadcn/ui system while preserving backend contracts and improving responsive, keyboard, and feedback behavior.

**Architecture:** Execute only after the security/business plans and design-system consolidation plan are green. Pages consume shared primitives and composition components; they do not recreate tokens, pagination, errors, empty states, or page chrome. Each page-family commit is independently buildable and browser-smokeable.

**Tech Stack:** Inertia v3 React, React 19, shadcn/ui, Radix UI, Tailwind CSS v4, Wayfinder, TypeScript, Vite client/SSR; optional Playwright/axe foundation from the baseline plan.

---

## Global Migration Contract

Every page task must obey these rules:

1. Keep route names, URL/query keys, request methods, payload fields, and backend business semantics unchanged unless an earlier approved backend plan changed that contract.
2. Replace page-local shells with `PageHeader`, `FilterCard`, `FormActions`, `Empty`, `StatusBadge`, `PaginationBar`, `MobileDataList`, `PublicLayout`, or `InstallLayout` as appropriate.
3. Use semantic classes such as `bg-background`, `bg-card`, `text-muted-foreground`, `border-border`, and status token variants; remove unnecessary fixed gray/blue/green/purple classes.
4. Use `Button asChild` for links and anchors; never nest interactive controls.
5. Desktop data grids use `Table`; mobile uses cards or a deliberate scroll container.
6. Every icon-only control has an accessible name; active navigation/tab/page state has ARIA semantics; fields connect errors with `aria-invalid` and `aria-describedby`.
7. Before each family, run current tests/builds; after changes, run exact gates and browser URLs listed below.

### Task 1: Migrate Class and Grade Administration

**Files:**
- Modify: `resources/js/pages/admin/classes/index.tsx`
- Modify: `resources/js/pages/admin/classes/create.tsx`
- Modify: `resources/js/pages/admin/classes/edit.tsx`
- Modify: `resources/js/pages/admin/classes/show.tsx`
- Modify: `resources/js/pages/admin/grades/index.tsx`
- Modify: `resources/js/pages/admin/grades/create.tsx`
- Modify: `resources/js/pages/admin/grades/edit.tsx`
- Modify: `resources/js/pages/admin/grades/show.tsx`

- [ ] **Step 1: Run the pre-change gate**

```bash
npm run types
npm run build:ssr
```

Expected: baseline status recorded.

- [ ] **Step 2: Normalize list pages**

For both index pages:

- use `PageHeader` for title/description/create action;
- wrap filters in `FilterCard`;
- use `Table` at `md` and above plus `MobileDataList` below `md`;
- render no-data through `Empty`;
- use `PaginationBar` for Laravel links;
- map edit/detail actions through `Button asChild` and Wayfinder/named route helpers.

The structural target is:

```tsx
<>
    <PageHeader
        title="班级管理"
        description="管理班级、班主任与学生归属"
        actions={<Button asChild><Link href={create()}>新建班级</Link></Button>}
    />
    <FilterCard>{filterFields}</FilterCard>
    {classes.data.length === 0 ? (
        <Empty title="暂无班级" description="创建第一个班级后即可开始分配学生。" />
    ) : (
        <ResponsiveClassList classes={classes.data} />
    )}
    <PaginationBar links={classes.links} />
</>
```

Keep each page's actual route helper and prop names.

- [ ] **Step 3: Normalize create/edit forms**

Use existing `Input`, `Select`, `Label`, canonical `InputError`, and `FormActions`. Every error-bound field receives:

```tsx
<Input
    id="name"
    value={data.name}
    onChange={(event) => setData('name', event.target.value)}
    aria-invalid={Boolean(errors.name)}
    aria-describedby={errors.name ? 'name-error' : undefined}
/>
<InputError id="name-error" message={errors.name} />
```

Preserve all existing form fields and submission URLs.

- [ ] **Step 4: Normalize detail pages**

Use Cards for summary sections, token-driven StatusBadge values, and mobile-safe member lists. Destructive actions use `AlertDialog`.

- [ ] **Step 5: Verify**

```bash
npm run types
npx eslint resources/js/pages/admin/classes/*.tsx resources/js/pages/admin/grades/*.tsx
npm run format:check
npm run build:ssr
```

Browser smoke: `/admin/classes`, `/admin/classes/create`, `/admin/classes/{id}`, `/admin/classes/{id}/edit`, `/admin/grades`, `/admin/grades/create`, `/admin/grades/{id}`, `/admin/grades/{id}/edit` at 1440×900 and 390×844.

- [ ] **Step 6: Commit**

```bash
git add resources/js/pages/admin/classes resources/js/pages/admin/grades
git commit -m "ui: migrate class and grade administration"
```

### Task 2: Migrate Product and Subject Administration

**Files:**
- Modify: `resources/js/pages/admin/products/index.tsx`
- Modify: `resources/js/pages/admin/products/create.tsx`
- Modify: `resources/js/pages/admin/products/edit.tsx`
- Modify: `resources/js/pages/admin/subjects/index.tsx`
- Modify: `resources/js/pages/admin/subjects/create.tsx`
- Modify: `resources/js/pages/admin/subjects/edit.tsx`

- [ ] **Step 1: Normalize index pages**

Apply PageHeader, FilterCard, Empty, StatusBadge, responsive list/table, PaginationBar, and Button-as-child link semantics. Product state, stock, and point cost remain visible in both desktop and mobile representations.

- [ ] **Step 2: Normalize forms**

Use Card sections for basic information, pricing/inventory, and status. Preserve file upload handling and Inertia form progress. Use `FormActions` with save first and cancel second.

- [ ] **Step 3: Verify**

```bash
npm run types
npx eslint resources/js/pages/admin/products/*.tsx resources/js/pages/admin/subjects/*.tsx
npm run format:check
npm run build:ssr
```

Browser smoke: `/admin/products`, `/admin/products/create`, `/admin/products/{id}/edit`, `/admin/subjects`, `/admin/subjects/create`, `/admin/subjects/{id}/edit`.

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/admin/products resources/js/pages/admin/subjects
git commit -m "ui: migrate product and subject administration"
```

### Task 3: Migrate Dashboard and Point Pages

**Files:**
- Modify: `resources/js/pages/dashboard.tsx`
- Modify: `resources/js/pages/points/index.tsx`
- Modify: `resources/js/pages/points/history.tsx`

- [ ] **Step 1: Rebuild statistics with calm-campus Cards**

Use a consistent stat-card pattern: label, value, optional trend text/icon, no large gradients. Retain all computed values and links.

- [ ] **Step 2: Normalize history and empty states**

Use FilterCard, responsive list/table, StatusBadge for transaction type, PaginationBar, and Empty. Replace English UI strings with the project's existing locale helper where keys exist; add only required missing keys to `resources/js/locales/zh-CN.ts` and `resources/js/locales/en.ts`.

- [ ] **Step 3: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/dashboard.tsx resources/js/pages/points/*.tsx resources/js/locales/*.ts
npm run format:check
npm run build:ssr
git add resources/js/pages/dashboard.tsx resources/js/pages/points resources/js/locales
git commit -m "ui: migrate dashboard and point pages"
```

Browser smoke: `/dashboard`, `/points`, `/points/history` in light/dark and both viewports.

### Task 4: Migrate Student Shop Pages

**Files:**
- Modify: `resources/js/pages/shop/index.tsx`
- Modify: `resources/js/pages/shop/product.tsx`
- Modify: `resources/js/pages/shop/orders.tsx`
- Modify: `resources/js/pages/shop/order-detail.tsx`

- [ ] **Step 1: Update order types for approved backend contract**

Types must include the backend plan's `quantity`, `unit_points`, total `points_spent`, and corrected status-history shape. Do not invent frontend fallback fields.

- [ ] **Step 2: Normalize shop catalogue/product pages**

Use calm cards, semantic stock/status badges, accessible quantity control, and a clear order summary showing `unit_points × quantity = total`. Disable submission during processing and when stock/points constraints are not met.

- [ ] **Step 3: Normalize order pages**

Use responsive cards/table, StatusBadge, PaginationBar, accurate status timeline, and Alert for compensation/cancellation outcomes. Preserve backend-approved cancellation and code-display rules.

- [ ] **Step 4: Verify**

```bash
npm run types
npx eslint resources/js/pages/shop/*.tsx
npm run format:check
npm run build
npm run build:ssr
```

Browser smoke: `/shop`, `/shop/{id}`, `/shop/orders/list`, `/shop/orders/{id}`; place a multi-quantity order in a disposable test environment and observe total, stock, and resulting detail.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/shop
git commit -m "ui: migrate multi quantity shop experience"
```

### Task 5: Migrate Parent Center

**Files:**
- Modify: `resources/js/pages/parent/children/index.tsx`
- Modify: `resources/js/pages/parent/children/create.tsx`
- Modify: `resources/js/pages/parent/children/show.tsx`
- Modify: `resources/js/pages/parent/children/transactions.tsx`
- Modify: `resources/js/pages/parent/children/orders.tsx`

- [ ] **Step 1: Update binding form**

The form includes student number, eight-character invitation code, and relationship. Explain whether review is required using server-provided setting/response data; never display stored invitation hashes.

- [ ] **Step 2: Represent binding states**

Index/detail pages use StatusBadge for pending/approved/rejected. Pending/rejected entries must not render student point/order data or links that the backend forbids.

- [ ] **Step 3: Normalize child data lists**

Use PageHeader, Cards, PaginationBar, Empty, and mobile list patterns for transactions/orders. Preserve approved access and unlink confirmation semantics.

- [ ] **Step 4: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/parent/children/*.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/parent/children
git commit -m "ui: migrate secure parent binding center"
```

Browser smoke: `/parent/children`, `/parent/children/create`, child detail/transactions/orders; verify approved, pending, and rejected states with dedicated test users.

### Task 6: Migrate Student Council Pages

**Files:**
- Modify: `resources/js/pages/student-council/dashboard.tsx`
- Modify: `resources/js/pages/student-council/activities/index.tsx`
- Modify: `resources/js/pages/student-council/activities/create.tsx`
- Modify: `resources/js/pages/student-council/activities/edit.tsx`
- Modify: `resources/js/pages/student-council/activities/show.tsx`

- [ ] **Step 1: Normalize dashboard and activity lists**

Use calm stat Cards, PageHeader, FilterCard, StatusBadge, Empty, PaginationBar, and mobile activity cards. Preserve activity statuses and query parameters.

- [ ] **Step 2: Normalize create/edit/show**

Use canonical form controls/errors, Card sections, FormActions, and AlertDialog for destructive actions. Retain all fields and submission methods.

- [ ] **Step 3: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/student-council/**/*.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/student-council
git commit -m "ui: migrate student council pages"
```

Browser smoke: `/student-council`, activities list/create/detail/edit.

### Task 7: Migrate Public Pages

**Files:**
- Modify: `resources/js/pages/welcome.tsx`
- Modify: `resources/js/pages/ranking/index.tsx`
- Modify: `resources/js/pages/about/index.tsx`
- Modify: `resources/js/components/public-navbar.tsx` only for defects discovered during adoption

- [ ] **Step 1: Adopt `PublicLayout` fully**

Remove page-owned navbar/mobile-menu state. Use a neutral hero, constrained accent surfaces, token-driven statistic cards, and semantic CTA buttons.

- [ ] **Step 2: Normalize ranking/about content**

Ranking uses responsive rows/cards, accessible rank labels, PaginationBar, and Empty. About uses calm Card sections and Button-as-child external links.

- [ ] **Step 3: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/welcome.tsx resources/js/pages/ranking/index.tsx resources/js/pages/about/index.tsx resources/js/components/public-navbar.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/welcome.tsx resources/js/pages/ranking resources/js/pages/about resources/js/components/public-navbar.tsx
git commit -m "ui: migrate public calm campus pages"
```

Browser smoke: `/`, `/ranking`, `/about`, guest/auth navbar, mobile menu keyboard behavior, light/dark.

### Task 8: Migrate Authentication Pages

**Files:**
- Modify: `resources/js/pages/auth/login.tsx`
- Modify: `resources/js/pages/auth/register.tsx`
- Modify: `resources/js/pages/auth/forgot-password.tsx`
- Modify: `resources/js/pages/auth/reset-password.tsx`
- Modify: `resources/js/pages/auth/confirm-password.tsx`
- Modify: `resources/js/pages/auth/two-factor-challenge.tsx`
- Modify: `resources/js/pages/auth/verify-email.tsx`
- Modify: `resources/js/layouts/auth-layout.tsx`
- Modify: `resources/js/layouts/auth/auth-simple-layout.tsx`

- [ ] **Step 1: Standardize form accessibility and feedback**

Every control uses Label, `aria-invalid`, canonical InputError, disabled processing state, and consistent success Alert. Use `Button asChild` for navigation links.

- [ ] **Step 2: Normalize OTP/2FA presentation**

Keep InputOTP behavior and recovery-code mode, but unify headings, instructions, keyboard focus, and locale strings. Do not change Fortify endpoints or challenge payloads.

- [ ] **Step 3: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/auth/*.tsx resources/js/layouts/auth-layout.tsx resources/js/layouts/auth/auth-simple-layout.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/auth resources/js/layouts/auth-layout.tsx resources/js/layouts/auth/auth-simple-layout.tsx
git commit -m "ui: migrate authentication experience"
```

Browser smoke all auth routes, validation failures, processing states, keyboard-only flow, and two-factor challenge.

### Task 9: Migrate Profile and Settings

**Files:**
- Modify: `resources/js/pages/profile/show.tsx`
- Modify: `resources/js/pages/settings/profile.tsx`
- Modify: `resources/js/pages/settings/password.tsx`
- Modify: `resources/js/pages/settings/appearance.tsx`
- Modify: `resources/js/pages/settings/two-factor.tsx`
- Modify: `resources/js/components/appearance-tabs.tsx`
- Modify: `resources/js/components/delete-user.tsx`
- Modify: `resources/js/components/two-factor-recovery-codes.tsx`
- Modify: `resources/js/components/two-factor-setup-modal.tsx`

- [ ] **Step 1: Adopt responsive Settings layout**

Use the SSR-safe layout delivered by consolidation. Mobile navigation must not reserve fixed sidebar width.

- [ ] **Step 2: Standardize forms and destructive actions**

Use canonical field errors, FormActions, upload progress, AlertDialog, and token-driven statuses. Appearance selector uses Tabs/Toggle semantics with `aria-pressed` or proper Radix tabs.

- [ ] **Step 3: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/profile/*.tsx resources/js/pages/settings/*.tsx resources/js/components/appearance-tabs.tsx resources/js/components/delete-user.tsx resources/js/components/two-factor-*.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/profile resources/js/pages/settings resources/js/components
git commit -m "ui: migrate profile and settings pages"
```

Browser smoke profile/avatar, password error/success, theme changes, 2FA modal/recovery codes, delete account confirmation.

### Task 10: Migrate Approval Administration

**Files:**
- Modify: `resources/js/pages/admin/approvals/index.tsx`
- Modify: `resources/js/pages/admin/approvals/all.tsx`
- Modify: `resources/js/pages/admin/approvals/show.tsx`

- [ ] **Step 1: Normalize queues and detail**

Use PageHeader, FilterCard, StatusBadge, responsive list/table, Empty, PaginationBar, and clear approval/rejection action hierarchy. Preserve authorized stage rules supplied by backend.

- [ ] **Step 2: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/admin/approvals/*.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/admin/approvals
git commit -m "ui: migrate approval administration"
```

Browser smoke pending/all/detail with authorized and unauthorized reviewer roles.

### Task 11: Migrate User Administration

**Files:**
- Modify: `resources/js/pages/admin/users/index.tsx`
- Modify: `resources/js/pages/admin/users/create.tsx`
- Modify: `resources/js/pages/admin/users/show.tsx`
- Modify: `resources/js/pages/admin/users/statistics.tsx`
- Modify: `resources/js/pages/admin/users/transactions.tsx`
- Create: `resources/js/components/import-dropzone-card.tsx`
- Create: `resources/js/components/data-table-shell.tsx`

- [ ] **Step 1: Build focused composites**

`ImportDropzoneCard` handles visual drag/drop state and delegates chosen files to callbacks; it does not own upload endpoints. `DataTableShell` owns responsive table/card framing, loading, Empty, and PaginationBar slots.

- [ ] **Step 2: Normalize pages**

Index: filter/import/table/mobile cards. Create: canonical fields and role options only from authorized backend props. Show: Cards and gated actions. Statistics: calm metrics without gradients. Transactions: responsive list and PaginationBar.

- [ ] **Step 3: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/admin/users/*.tsx resources/js/components/import-dropzone-card.tsx resources/js/components/data-table-shell.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/admin/users resources/js/components/import-dropzone-card.tsx resources/js/components/data-table-shell.tsx
git commit -m "ui: migrate user administration"
```

Browser smoke list/filter/import/create/show/statistics/transactions with role-based action visibility.

### Task 12: Migrate Quick Grading

**Files:**
- Modify: `resources/js/pages/admin/quick-grading/index.tsx`

- [ ] **Step 1: Replace native controls and hard-coded states**

Use Input, Select, Label, Button, StatusBadge, Alert, and Card. Preserve selected students, point preset, amount, source, and submission payload. Make bulk selection keyboard accessible and expose selected count in text.

- [ ] **Step 2: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/admin/quick-grading/index.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/admin/quick-grading/index.tsx
git commit -m "ui: migrate quick grading workflow"
```

Browser smoke filters, selection, custom amount, preset, submit success/error, mobile list.

### Task 13: Migrate Order Administration

**Files:**
- Modify: `resources/js/pages/admin/orders/index.tsx`
- Modify: `resources/js/pages/admin/orders/show.tsx`
- Create: `resources/js/components/verification-panel.tsx`

- [ ] **Step 1: Correct TypeScript contracts**

Match approved backend order status, quantity, unit points, refund, verification methods, and status-history response. Remove nonexistent fields and fix any incomplete `useForm` destructuring such as missing `setData`.

- [ ] **Step 2: Normalize order list**

Use PageHeader, FilterCard, DataTableShell, responsive cards, StatusBadge, and PaginationBar. Status transitions offered by UI must come from allowed backend capabilities/props rather than hard-coded arbitrary statuses.

- [ ] **Step 3: Extract verification panel**

```ts
export type VerificationPanelProps = {
    orderId: number;
    allowedMethods: Array<'code' | 'direct'>;
    processing: boolean;
    onVerify: (payload: { method: 'code'; code: string } | { method: 'direct' }) => void;
};
```

Do not offer user-login-password verification. Connect errors accessibly and never log payload values.

- [ ] **Step 4: Normalize detail timeline and refund display**

Show accurate from/to history, quantity/cost breakdown, compensation status, and code lifecycle only when authorized.

- [ ] **Step 5: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/admin/orders/*.tsx resources/js/components/verification-panel.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/admin/orders resources/js/components/verification-panel.tsx
git commit -m "ui: migrate secure order administration"
```

Browser smoke list/detail/status change/code verification/repeated verification/refund state using disposable orders.

### Task 14: Migrate Plugin Administration

**Files:**
- Modify: `resources/js/pages/admin/plugins/index.tsx`
- Modify: `resources/js/pages/admin/plugins/show.tsx`

- [ ] **Step 1: Align with inert lifecycle API**

Upload UI clearly states that upload validates/archives but does not execute code. Statuses distinguish disabled/ enabled and operation failures. Use existing backend response contract; if current fetch/redirect mismatch remains, resolve it by using one explicit JSON or Inertia path without changing security behavior.

- [ ] **Step 2: Normalize controls**

Use Cards, StatusBadge, Alert, file input/drop zone, AlertDialog for disable/uninstall, and standard Select/Switch instead of native selects. Show operation logs without secret metadata.

- [ ] **Step 3: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/admin/plugins/*.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/admin/plugins
git commit -m "ui: migrate hardened plugin administration"
```

Browser smoke upload invalid/valid ZIP, enable, disable, guarded uninstall, operation errors, and role-based access.

### Task 15: Migrate System Settings

**Files:**
- Modify: `resources/js/pages/admin/settings/index.tsx`
- Create: `resources/js/components/admin-section-nav.tsx`

- [ ] **Step 1: Split navigation from content**

```ts
export type AdminSection = {
    id: string;
    label: string;
    description?: string;
    icon?: React.ElementType;
};

export type AdminSectionNavProps = {
    sections: AdminSection[];
    activeSection: string;
    onSectionChange: (section: string) => void;
};
```

Desktop uses vertical navigation; mobile uses Select/Sheet. Preserve one page request contract.

- [ ] **Step 2: Normalize settings sections**

Use Cards and canonical form controls/errors for site, mail, SMS, captcha, security, and other existing sections. Include `parent_binding_requires_head_teacher_review` in the appropriate security section. Sensitive values remain masked and are never echoed in full.

- [ ] **Step 3: Verify and commit**

```bash
npm run types
npx eslint resources/js/pages/admin/settings/index.tsx resources/js/components/admin-section-nav.tsx
npm run format:check
npm run build:ssr
git add resources/js/pages/admin/settings/index.tsx resources/js/components/admin-section-nav.tsx
git commit -m "ui: migrate responsive system settings"
```

Browser smoke every section, mobile section navigation, validation, save feedback, and masked secrets.

### Task 16: Migrate Installation Wizard

**Files:**
- Modify: `resources/js/pages/install/welcome.tsx`
- Modify: `resources/js/pages/install/language.tsx`
- Modify: `resources/js/pages/install/check.tsx`
- Modify: `resources/js/pages/install/database.tsx`
- Modify: `resources/js/pages/install/redis.tsx`
- Modify: `resources/js/pages/install/cache.tsx`
- Modify: `resources/js/pages/install/site.tsx`
- Modify: `resources/js/pages/install/account.tsx`
- Modify: `resources/js/pages/install/complete.tsx`

- [ ] **Step 1: Preserve traditional install semantics**

Before editing, record every form `action`, `method`, hidden CSRF field, old-input source, session error, and next/back route. The migration may not change these values.

- [ ] **Step 2: Adopt InstallLayout and Stepper**

Replace repeated backgrounds/cards/headings/actions. Convert native inputs/selects/radios to standard components only when they still submit ordinary named HTML controls correctly. Use Button-as-child for navigation anchors.

- [ ] **Step 3: Normalize checks and completion states**

Use Alert semantic variants and status icons/text. Do not use color alone. Keep actual requirement and connection-test results unchanged.

- [ ] **Step 4: Verify**

```bash
npm run types
npx eslint resources/js/pages/install/*.tsx
npm run format:check
npm run build
npm run build:ssr
```

Browser smoke the exact sequence `/install` → language → check → database → redis → cache → site → account → complete in a disposable environment. Verify error repopulation and mobile layout.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/install
git commit -m "ui: migrate installation wizard"
```

### Task 17: Full-Site Verification

- [ ] **Step 1: Run static and build gates**

```bash
npm run gate:frontend:static
npm run gate:frontend:build
```

Expected: exit 0.

- [ ] **Step 2: Run backend regression**

```bash
php artisan test --compact
```

Expected: exit 0.

- [ ] **Step 3: Run browser suite if installed**

```bash
npx playwright test
```

Expected: all smoke and accessibility tests pass.

- [ ] **Step 4: Perform role and viewport matrix**

Verify guest, student, parent, head teacher, administrator, and super administrator routes at 1440×900 and 390×844. Check navigation/action visibility, focus, dialogs, forms, tables/cards, light/dark, console errors, and failed network requests.

- [ ] **Step 5: Scan for design-system leaks**

```bash
rg -n "from-(blue|purple|violet)-|to-(blue|purple|violet)-|bg-gray-|text-gray-" resources/js/pages
rg -n -U "<Link[^>]*>\s*<Button|<a[^>]*>\s*<Button" resources/js
rg -n "components/ui/input-error" resources/js
```

Expected: only explicitly justified exceptions remain; document each exception in the execution notes rather than silently accepting it.
