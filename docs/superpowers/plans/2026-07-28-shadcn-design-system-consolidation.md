# Shadcn Design System Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the existing shadcn/ui foundation into one calm-campus token, primitive, composition, and layout system before page-by-page migration.

**Architecture:** Keep `components.json` and locally customized shadcn primitives; do not reinitialize or bulk-overwrite them with the CLI. Make `app.css` the single token source, keep `components/ui` presentation-only, place Inertia/Laravel-aware adapters under `components`, and make layouts own page chrome and mobile state.

**Tech Stack:** shadcn/ui New York, Radix UI, Tailwind CSS v4, React 19, Inertia v3, TypeScript, Vite SSR.

---

## File Map

- Modify `resources/css/app.css`: calm-campus semantic/status/surface tokens.
- Modify selected primitives: Badge, Alert, Skeleton, Pagination.
- Consolidate `InputError` and `PaginationBar` adapter boundaries.
- Add reusable `Empty`, page header/filter/form/mobile-list compositions.
- Add Public and Install layouts; make Settings layout SSR-safe.
- Refactor PublicNavbar and shared link/button semantics.
- Touch only representative consumers in this plan; broad page adoption belongs to the page-migration plan.

### Task 1: Capture Design-System Static Baseline

**Files:**
- No source changes

- [ ] **Step 1: Generate Wayfinder and run frontend gates**

```bash
npm run types
npm run format:check
npx eslint "resources/js/components/**/*.{ts,tsx}" "resources/js/layouts/**/*.{ts,tsx}" "resources/js/hooks/**/*.{ts,tsx}"
npm run build
npm run build:ssr
```

Expected: record exact pre-existing failures.

- [ ] **Step 2: Inventory duplicate imports and nested controls**

```bash
rg -n "components/ui/input-error|components/input-error" resources/js
rg -n "components/ui/pagination|components/pagination-bar" resources/js
rg -n -U "<Link[^>]*>\s*<Button|<a[^>]*>\s*<Button" resources/js
```

Expected: create a working checklist; do not commit generated reports.

### Task 2: Add Calm-Campus Semantic Tokens

**Files:**
- Modify: `resources/css/app.css:9-191`
- Modify: `resources/js/components/ui/badge.tsx`
- Modify: `resources/js/components/ui/alert.tsx`
- Modify: `resources/js/components/ui/skeleton.tsx`

- [ ] **Step 1: Extend Tailwind theme mappings**

Add mappings for success/warning/info and surfaces:

```css
--color-success: var(--success);
--color-success-foreground: var(--success-foreground);
--color-success-soft: var(--success-soft);
--color-warning: var(--warning);
--color-warning-foreground: var(--warning-foreground);
--color-warning-soft: var(--warning-soft);
--color-info: var(--info);
--color-info-foreground: var(--info-foreground);
--color-info-soft: var(--info-soft);
--color-surface-1: var(--surface-1);
--color-surface-2: var(--surface-2);
--color-surface-3: var(--surface-3);
```

- [ ] **Step 2: Define light and dark values**

Use low-chroma green-gray success, warm amber warning, restrained blue-gray info, and neutral layered surfaces. Preserve existing theme selection and primary hue behavior.

- [ ] **Step 3: Make variants consume tokens**

Badge variants:

```ts
success: 'border-transparent bg-success-soft text-success-foreground',
warning: 'border-transparent bg-warning-soft text-warning-foreground',
info: 'border-transparent bg-info-soft text-info-foreground',
```

Alert adds the same semantic variants through `cva`. Skeleton changes from brand-tinted `bg-primary/10` to `bg-muted`.

- [ ] **Step 4: Verify**

```bash
npm run types
npx eslint resources/js/components/ui/badge.tsx resources/js/components/ui/alert.tsx resources/js/components/ui/skeleton.tsx
npm run build:ssr
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add resources/css/app.css resources/js/components/ui/badge.tsx resources/js/components/ui/alert.tsx resources/js/components/ui/skeleton.tsx
git commit -m "design-system: add calm campus semantic tokens"
```

### Task 3: Unify Input Error Boundary

**Files:**
- Modify: `resources/js/components/input-error.tsx`
- Modify: `resources/js/components/ui/input-error.tsx`
- Modify representative imports in parent/grades/subjects/users create/edit pages

- [ ] **Step 1: Make the root component the canonical API**

```tsx
import * as React from 'react';

export type InputErrorProps = React.ComponentProps<'p'> & {
    message?: string | null;
};

export default function InputError({
    message,
    className,
    ...props
}: InputErrorProps): React.JSX.Element | null {
    if (!message) {
        return null;
    }

    return (
        <p
            role="alert"
            aria-live="polite"
            className={cn('text-sm text-destructive', className)}
            {...props}
        >
            {message}
        </p>
    );
}
```

Import `cn` from the existing utility.

- [ ] **Step 2: Convert UI duplicate into a compatibility re-export**

```ts
export { default } from '@/components/input-error';
export type { InputErrorProps } from '@/components/input-error';
```

Delete duplicated Alert implementation from that file.

- [ ] **Step 3: Migrate known consumers to canonical import**

Update:

- `resources/js/pages/parent/children/create.tsx`
- `resources/js/pages/admin/grades/create.tsx`
- `resources/js/pages/admin/grades/edit.tsx`
- `resources/js/pages/admin/subjects/create.tsx`
- `resources/js/pages/admin/subjects/edit.tsx`
- `resources/js/pages/admin/users/create.tsx`

- [ ] **Step 4: Verify and commit**

```bash
npm run types
npx eslint resources/js/components/input-error.tsx resources/js/pages/parent/children/create.tsx resources/js/pages/admin/grades/*.tsx resources/js/pages/admin/subjects/*.tsx resources/js/pages/admin/users/create.tsx
git add resources/js/components/input-error.tsx resources/js/components/ui/input-error.tsx resources/js/pages
git commit -m "design-system: unify field error presentation"
```

### Task 4: Restore Pagination Primitive/Adapter Boundary

**Files:**
- Modify: `resources/js/components/ui/pagination.tsx`
- Modify: `resources/js/components/pagination-bar.tsx`
- Modify: `resources/js/pages/parent/children/transactions.tsx`
- Modify: `resources/js/pages/parent/children/orders.tsx`

- [ ] **Step 1: Keep UI pagination presentation-only**

It may expose `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, and `PaginationEllipsis`, but no Laravel page/links shape.

- [ ] **Step 2: Define Laravel adapter types**

```ts
export type LaravelPaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginationBarProps = {
    links: LaravelPaginationLink[];
    preserveScroll?: boolean;
    preserveState?: boolean;
    className?: string;
};
```

Render UI primitives and use Inertia router/Link behavior only in `PaginationBar`. Sanitize encoded labels, map previous/next text, and set `aria-current="page"` for the active link.

- [ ] **Step 3: Fix the two known business consumers**

Both parent transactions and orders must import `PaginationBar` from `@/components/pagination-bar` and pass the Laravel `links` array.

- [ ] **Step 4: Verify and commit**

```bash
npm run types
npx eslint resources/js/components/ui/pagination.tsx resources/js/components/pagination-bar.tsx resources/js/pages/parent/children/transactions.tsx resources/js/pages/parent/children/orders.tsx
git add resources/js/components resources/js/pages/parent/children
git commit -m "design-system: separate pagination primitive and adapter"
```

### Task 5: Add Reusable Composition Components

**Files:**
- Create: `resources/js/components/ui/empty.tsx`
- Create: `resources/js/components/page-header.tsx`
- Create: `resources/js/components/filter-card.tsx`
- Create: `resources/js/components/form-actions.tsx`
- Create: `resources/js/components/status-badge.tsx`
- Create: `resources/js/components/mobile-data-list.tsx`

- [ ] **Step 1: Add `Empty` primitive**

```tsx
export type EmptyProps = React.ComponentProps<'div'> & {
    icon?: React.ElementType;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    size?: 'sm' | 'default' | 'lg';
};
```

Render icon with `aria-hidden`, a descriptive title, optional description/action, and token-driven spacing.

- [ ] **Step 2: Add page composition contracts**

```ts
export type PageHeaderProps = {
    title: React.ReactNode;
    description?: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
};

export type FilterCardProps = React.ComponentProps<typeof Card> & {
    children: React.ReactNode;
};

export type FormActionsProps = {
    primary: React.ReactNode;
    secondary?: React.ReactNode;
    destructive?: React.ReactNode;
};
```

`MobileDataList` is a structural wrapper accepting children/className, not business field definitions.

- [ ] **Step 3: Add centralized status mapping**

```ts
export type StatusTone = 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';

export type StatusBadgeProps = {
    label: React.ReactNode;
    tone?: StatusTone;
};
```

Business pages map their statuses to label/tone at the boundary; the component does not know order/user-specific enums.

- [ ] **Step 4: Adopt in two representative pages only**

Use `Empty` and `PageHeader` in one simple list page and one dashboard/list page to prove the API. Broad adoption is deferred to page migration.

- [ ] **Step 5: Verify and commit**

```bash
npm run types
npx eslint resources/js/components/**/*.tsx
npm run build:ssr
git add resources/js/components resources/js/pages
git commit -m "design-system: add shared page composition components"
```

### Task 6: Make Settings Navigation SSR-Safe

**Files:**
- Modify: `resources/js/hooks/use-current-url.ts`
- Modify: `resources/js/layouts/settings/layout.tsx`

- [ ] **Step 1: Reproduce the SSR boundary**

Confirm `SettingsLayout` currently returns `null` server-side and `use-current-url` references `window` for path/origin.

- [ ] **Step 2: Make URL resolution independent of `window`**

Use Inertia page URL or router-provided state as the primary source. The hook should expose:

```ts
export function useCurrentUrl(): {
    currentUrl: string;
    isCurrentUrl: (url: string, exact?: boolean) => boolean;
};
```

No render path may require `window` to exist.

- [ ] **Step 3: Remove SSR bailout and add responsive navigation**

Render the layout on server and client. Desktop keeps side navigation; mobile uses an existing Select, Tabs, or Sheet pattern. Use `Button asChild` around `Link`, not nested controls.

- [ ] **Step 4: Verify SSR**

```bash
npm run types
npm run build:ssr
```

Expected: exit 0 and no server-side `window` error.

- [ ] **Step 5: Commit**

```bash
git add resources/js/hooks/use-current-url.ts resources/js/layouts/settings/layout.tsx
git commit -m "design-system: make settings layout ssr safe"
```

### Task 7: Add Public Layout and Simplify Navbar

**Files:**
- Create: `resources/js/layouts/public-layout.tsx`
- Modify: `resources/js/components/public-navbar.tsx`
- Modify representative: `resources/js/pages/welcome.tsx`, `resources/js/pages/ranking/index.tsx`, `resources/js/pages/profile/show.tsx`

- [ ] **Step 1: Define public layout**

```ts
export type PublicLayoutProps = {
    children: React.ReactNode;
    contentClassName?: string;
    withContainer?: boolean;
};
```

The layout owns PublicNavbar, background, mobile menu state, and content container.

- [ ] **Step 2: Reduce navbar public API**

```ts
interface PublicNavbarProps {
    className?: string;
}
```

Move duplicated guest/auth navigation data into shared arrays, ensure menu button has `aria-expanded`, `aria-controls`, and accessible label, and convert all navigation CTA structures to `Button asChild`.

- [ ] **Step 3: Adopt layout in representative public pages**

Wrap welcome, ranking, and public profile without changing their business data or routing.

- [ ] **Step 4: Verify and commit**

```bash
npm run types
npx eslint resources/js/layouts/public-layout.tsx resources/js/components/public-navbar.tsx resources/js/pages/welcome.tsx resources/js/pages/ranking/index.tsx resources/js/pages/profile/show.tsx
npm run build:ssr
git add resources/js/layouts/public-layout.tsx resources/js/components/public-navbar.tsx resources/js/pages
git commit -m "design-system: add unified public application shell"
```

### Task 8: Add Install Layout Without Changing Submission Semantics

**Files:**
- Create: `resources/js/layouts/install-layout.tsx`
- Create: `resources/js/components/install-stepper.tsx`
- Modify shell structure in `resources/js/pages/install/*.tsx`

- [ ] **Step 1: Define layout contract**

```ts
export type InstallLayoutProps = {
    children: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    step?: { current: number; total: number };
    maxWidth?: 'md' | 'lg';
    actions?: React.ReactNode;
};
```

- [ ] **Step 2: Implement accessible stepper**

Render ordered steps with current step text and `aria-current="step"`. Keep it presentation-only.

- [ ] **Step 3: Migrate only repeated shells**

Apply layout/stepper to all install pages while preserving:

- existing HTML form action/method;
- CSRF hidden fields;
- old input values and session errors;
- step order and route targets.

Convert nested anchor/button structures to `Button asChild` but do not convert the workflow to a different request model.

- [ ] **Step 4: Verify and commit**

```bash
npm run types
npx eslint resources/js/layouts/install-layout.tsx resources/js/components/install-stepper.tsx resources/js/pages/install/*.tsx
npm run build
npm run build:ssr
git add resources/js/layouts/install-layout.tsx resources/js/components/install-stepper.tsx resources/js/pages/install
git commit -m "design-system: add consistent install wizard shell"
```

### Task 9: Consolidation Verification

- [ ] **Step 1: Confirm no duplicate implementation remains**

```bash
rg -n "components/ui/input-error" resources/js
rg -n -U "<Link[^>]*>\s*<Button|<a[^>]*>\s*<Button" resources/js/components resources/js/layouts
```

Expected: only intentional compatibility re-export remains for input error; shared shells contain no nested interactive controls.

- [ ] **Step 2: Run frontend gates**

```bash
npm run gate:frontend:static
npm run gate:frontend:build
```

Expected: exit 0.

- [ ] **Step 3: Smoke key shells**

Verify desktop 1440×900 and mobile 390×844 for `/`, `/ranking`, `/settings/profile`, `/install/check`, light/dark theme, keyboard navigation, and no console errors.
