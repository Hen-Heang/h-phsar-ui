# Issue: Unify and Modernize H-Phsar UX/UI Across Buyer, Supplier, and Admin

## Repositories

- `./h-phsar-ui`
- `./h-phsar-api-full`

## Objective

Implement a polished, modern, accessible, and consistent H-Phsar user experience that matches the latest backend contracts.

The product must use:

- One shared H-Phsar brand
- One shared design system
- One API foundation
- Separate Buyer, Supplier, and Admin layouts
- Role-specific workflows and navigation

The three roles should feel like parts of the same product, but they must not be identical:

- Buyer: modern marketplace
- Supplier: operational business dashboard
- Admin: secure management console

Work directly in the repositories.
Do not commit or push.

---

## Background to verify from the current codebase

The frontend has moved toward:

- `/buyer/**`
- `/supplier/**`
- `/admin/**`
- centralized role constants
- centralized role home routes
- centralized API helpers
- exact backend order-status types

However, the UI remains partly legacy:

- Visible and internal Distributor/Retailer naming remains
- Buyer and Supplier shells duplicate role-guard behavior
- Navigation sources are duplicated
- Buyer navigation mixes search, cart, notifications, WebSocket, local storage, API calls, Redux, and dialogs in one oversized component
- Supplier navigation still uses hardcoded menus and old text
- Admin has only a minimal shell and limited implemented pages
- Global CSS and Tailwind colors overlap and contain stale role-specific tokens
- Pages use inconsistent radii, shadows, spacing, and status colors
- Some pages still use old order labels such as Preparing, Confirming, Shipping, Complete, or Declined
- Some dashboard trends are hardcoded rather than returned by the backend
- README and UI documentation are stale

Confirm these points before changing code.

---

# Acceptance criteria

The task is complete when:

1. Buyer, Supplier, and Admin share one coherent H-Phsar visual system.
2. Each role has a distinct layout optimized for its workflow.
3. The existing H-Phsar logo is used consistently through one reusable component.
4. Semantic design tokens are the source of truth for touched screens.
5. Shared role-guard logic replaces repeated blank-page redirect logic.
6. Navigation is driven by central configuration.
7. Buyer header responsibilities are decomposed into focused components/hooks.
8. Supplier shell uses shared navigation and correct terminology.
9. Admin has a usable shell for implemented pages only.
10. All touched order UI uses exact backend statuses internally.
11. Supplier cannot see a completion action after dispatch.
12. Buyer confirms receipt only when an order is `DISPATCHED`.
13. There is no automatic order completion.
14. Rejected and Cancelled states are clear.
15. Fake trends and unsupported metrics are removed.
16. Loading, empty, error, retry, and confirmation states are standardized.
17. Touched pages work at mobile and desktop widths.
18. Touched UI has visible focus, labels, and accessible interactions.
19. Frontend tests pass.
20. Frontend production build passes.
21. Backend remains unchanged unless a verified contract defect requires a minimal fix.
22. Documentation reflects three roles and the current architecture.

---

# Phase 1 — Inspect and protect the workspace

Run:

```bash
git -C h-phsar-ui status --short
git -C h-phsar-ui branch --show-current
git -C h-phsar-ui log -1 --oneline
git -C h-phsar-ui diff --stat

git -C h-phsar-api-full status --short
git -C h-phsar-api-full branch --show-current
git -C h-phsar-api-full log -1 --oneline
git -C h-phsar-api-full diff --stat
```

Read all applicable `AGENTS.md` files before editing.

Inspect at least:

```text
h-phsar-ui/package.json
h-phsar-ui/tailwind.config.js
h-phsar-ui/src/index.css
h-phsar-ui/src/app/**/layout.tsx
h-phsar-ui/src/config/navigation.ts
h-phsar-ui/src/config/roles.ts
h-phsar-ui/src/config/routes.ts
h-phsar-ui/src/types/order.ts
h-phsar-ui/src/utils/api.ts
h-phsar-ui/src/components/ui/**
h-phsar-ui/src/components/Buyer/**
h-phsar-ui/src/components/Supplier/**
h-phsar-ui/src/components/Admin/**
h-phsar-ui/src/screens/auth/**
h-phsar-ui/src/screens/buyer/**
h-phsar-ui/src/screens/supplier/**
h-phsar-ui/src/screens/admin/**

h-phsar-api-full/src/main/resources/application.yaml
h-phsar-api-full/src/main/java/**/controller/**/*.java
h-phsar-api-full/src/main/java/**/common/api/**/*.java
h-phsar-api-full/src/main/java/**/model/appUser/Role.java
h-phsar-api-full/src/main/java/**/model/order/OrderStatus.java
h-phsar-api-full/docs/ORDER_WORKFLOW.md
```

Before editing, return a concise plan containing:

- Current working-tree risk
- Areas to change
- Areas intentionally not changed
- Verification plan

Then proceed without waiting unless a destructive conflict is found.

---

# Phase 2 — Establish the shared design system

## 2.1 Brand component

Create or standardize:

```text
src/components/brand/HPhsarLogo.tsx
```

Use existing assets in `public/logo/`.

Support:

- Icon only
- Horizontal wordmark
- Compact sidebar form
- Light surface
- Dark surface
- Accessible alt text
- Explicit dimensions to avoid layout shift

Do not generate or redraw the logo in code.

## 2.2 Semantic tokens

Refactor the global styling foundation so touched pages use semantic CSS variables.

Use this coherent starting palette:

```css
--brand-primary: #0f766e;
--brand-primary-hover: #0d665f;
--brand-secondary: #164e63;
--brand-navy: #173b57;

--buyer-accent: #f97316;
--supplier-accent: #0f766e;
--admin-accent: #1e3a5f;

--background: #f8fafc;
--surface: #ffffff;
--surface-muted: #f1f5f9;
--border: #e2e8f0;

--text-primary: #0f172a;
--text-secondary: #475569;
--text-muted: #64748b;

--success: #16a34a;
--warning: #d97706;
--danger: #dc2626;
--info: #2563eb;
```

Adjust only when contrast or existing logo colors justify it.

Requirements:

- Remove clearly unused stale tokens
- Remove broken nested media-query CSS
- Preserve styles used by untouched screens
- Add consistent focus-ring tokens
- Add reduced-motion behavior
- Prevent horizontal overflow
- Do not replace every raw color in the repository in one pass

## 2.3 Geometry

Standardize touched components:

- Small radius: 10–12px
- Standard radius: 14–16px
- Large panel: 20–24px
- Avoid excessive 40–48px card radii
- Use border plus subtle shadow instead of strong shadow on every surface
- Use consistent page spacing

## 2.4 Shared primitives

Audit existing components first, then improve or add only missing pieces:

```text
src/components/ui/button.tsx
src/components/ui/input.tsx
src/components/ui/select.tsx
src/components/ui/textarea.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
src/components/ui/badge.tsx
src/components/ui/skeleton.tsx

src/components/shared/PageHeader.tsx
src/components/shared/SectionHeader.tsx
src/components/shared/StatCard.tsx
src/components/shared/StatusBadge.tsx
src/components/shared/SearchField.tsx
src/components/shared/FilterBar.tsx
src/components/shared/DataTable.tsx
src/components/shared/Pagination.tsx
src/components/shared/LoadingState.tsx
src/components/shared/EmptyState.tsx
src/components/shared/ErrorState.tsx
src/components/shared/ConfirmDialog.tsx
```

Avoid duplicate components.

Button should support:

- default
- secondary
- outline
- ghost
- destructive
- success
- link
- loading/disabled behavior

---

# Phase 3 — Centralize role guards and navigation

## 3.1 Shared RoleGuard

Create:

```text
src/components/auth/RoleGuard.tsx
```

It must:

- Read token and role safely
- Validate the expected role
- Show an accessible loading state instead of a blank screen
- Redirect unauthorized users to `/sign-in`
- Avoid rendering restricted content before validation
- Preserve current localStorage compatibility
- Be used by Buyer, Supplier, and Admin shells

Do not treat the frontend guard as authorization security.

## 3.2 Navigation configuration

Use `src/config/navigation.ts` as the only role-navigation source.

Extend navigation items when useful:

```ts
interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  implemented?: boolean;
}
```

Use:

- `BUYER_NAV`
- `SUPPLIER_NAV`
- `ADMIN_NAV`

Remove duplicated hardcoded arrays from touched shells.

Admin navigation must include only implemented routes as active links.
Unsupported routes must be omitted or clearly disabled.

---

# Phase 4 — Modernize role shells

## 4.1 Buyer shell

Create or rename toward:

```text
BuyerShell
BuyerHeader
BuyerDesktopNavigation
BuyerMobileNavigation
BuyerSearch
BuyerCartButton
BuyerCartDrawer
BuyerNotificationMenu
BuyerProfileMenu
```

Decompose the oversized Buyer navigation.

Move:

- Search logic into a focused search component/hook
- Cart logic into a cart component/hook
- Notification fetching and WebSocket logic into a notification hook/menu
- Profile and sign-out behavior into a profile menu

Requirements:

- Marketplace-oriented desktop header
- Mobile-friendly compact header
- Optional bottom navigation for key Buyer destinations
- Search, cart, notifications, and profile remain discoverable
- No new header/navigation file becomes another multipurpose giant

Use Buyer terminology in touched code and visible text.

## 4.2 Supplier shell

Create or rename toward:

```text
SupplierShell
SupplierSidebar
SupplierTopbar
SupplierMobileHeader
SupplierNotificationMenu
SupplierProfileMenu
```

Requirements:

- Use centralized Supplier navigation
- Strong active route indication
- Mobile drawer
- H-Phsar brand
- Optional store identity summary
- Clear sign-out confirmation
- No “distributor session” text
- Consistent page content width and padding

## 4.3 Admin shell

Build a complete shell for implemented Admin features.

Required active routes:

```text
/admin/dashboard
/admin/suppliers
/admin/buyers
```

Include:

- Desktop sidebar
- Mobile drawer
- Topbar
- Admin identity
- Active navigation
- Sign out
- Page container

Do not create links to non-working Admin pages.

---

# Phase 5 — Centralize order status UX

Create:

```text
src/config/order-status.ts
```

Use exact internal values:

```ts
type BackendOrderStatus =
  | "CART"
  | "DRAFT"
  | "PENDING"
  | "PROCESSING"
  | "DISPATCHED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";
```

Create one exhaustive metadata map for:

- Friendly label
- Description
- Tone
- Icon
- Progress
- Terminal state
- Buyer actions
- Supplier actions

Suggested friendly labels:

- `CART` → Cart
- `DRAFT` → Draft
- `PENDING` → Pending
- `PROCESSING` → Preparing
- `DISPATCHED` → Dispatched
- `COMPLETED` → Completed
- `REJECTED` → Rejected
- `CANCELLED` → Cancelled

All touched badges, filters, timelines, cards, and action visibility must use this configuration.

Rules:

- Supplier accepts/rejects only `PENDING`
- Supplier dispatches only `PROCESSING`
- Supplier has no completion action for `DISPATCHED`
- Buyer confirms receipt only for `DISPATCHED`
- No automatic confirmation/completion
- Terminal states have no next action
- Status is never represented by color alone

Remove touched usages of:

- Confirming
- Shipping
- Delivered
- Declined
- Complete as an internal status

---

# Phase 6 — Modernize public authentication UX

Modernize:

- Landing
- Sign in
- Sign up
- OTP verification
- Forgot password
- Password reset

Requirements:

- Shared H-Phsar brand
- One consistent auth layout
- Clear Buyer and Supplier value propositions
- No public Admin registration
- Accessible labels
- Password reveal control
- Inline validation
- Loading state
- API error state
- Success state
- Mobile layout at 360px+
- Correct role redirect
- Preserve backend request contracts

Do not redesign authentication architecture.

---

# Phase 7 — Modernize highest-value Buyer pages

Modernize:

- `/buyer/home`
- `/buyer/search`
- `/buyer/orders`
- `/buyer/drafts`
- `/buyer/order-history`
- Buyer cart drawer/page

Requirements:

- Marketplace hierarchy
- Consistent store/product cards
- Responsive images with fallback
- Search and filter clarity
- Clear cart totals and actions
- Clear order progress/timeline
- Correct action visibility from status metadata
- Rejected and Cancelled states
- Buyer receipt confirmation only for `DISPATCHED`
- No auto-completion
- Order-history access when supported
- Empty, error, loading, and retry states

Replace touched visible “Distributor” text with “Supplier”.
Do not change order business rules.

---

# Phase 8 — Modernize highest-value Supplier pages

Modernize:

- `/supplier/dashboard`
- `/supplier/products`
- `/supplier/categories`
- `/supplier/inventory`
- `/supplier/orders`
- `/supplier/order-history`
- `/supplier/reports`

Requirements:

- Operational scanning and clear hierarchy
- Pending orders first
- Consistent table/filter/pagination patterns
- Clear inventory warnings
- Clear form validation
- Correct status actions
- No Supplier completion action after dispatch
- Responsive tables or mobile card fallback
- Real API values only

Remove hardcoded fake trends such as `+12%`, `-2%`, and `+5%`.
When comparison data is unavailable, omit the trend.

Update old activity labels to current concepts.

---

# Phase 9 — Modernize Admin pages

Modernize:

- `/admin/dashboard`
- `/admin/suppliers`
- `/admin/buyers`

Use only existing backend Admin endpoints.

Admin dashboard must not invent platform metrics.

It may provide:

- Clear shortcuts
- Scope explanation
- Account-management entry points
- Counts only when returned by existing APIs

Account management must include:

- Debounced search
- Responsive desktop table
- Mobile card layout
- Loading skeleton
- Error plus retry
- Empty state
- Verified status
- Active/inactive status
- Confirmation before activation/deactivation
- Loading state during mutation
- Accessible action labels
- Pagination matching backend data

---

# Phase 10 — API and state alignment

For touched code:

- Use `src/utils/api.ts`
- Prefer `apiGet`, `apiPost`, `apiPut`, `apiPatch`, and `apiDelete`
- Do not add another HTTP client
- Define shared standard and paged backend response types
- Normalize safe error-message extraction
- Verify API types from backend classes/controllers
- Do not guess endpoint paths
- Keep React Query for remote state where established
- Keep Redux for existing global client state
- Avoid storing the same response in both without a justified need
- Keep token/role storage compatible for this session

Backend changes are allowed only for a verified, minimal contract defect.

---

# Phase 11 — Accessibility and responsive verification

Touched pages must support:

- Keyboard navigation
- Visible focus
- Correct labels and headings
- Accessible dialogs
- Escape to close
- Descriptive alt text
- 44×44px touch targets
- Reduced motion
- Status text plus color/icon
- Long name/email truncation
- No horizontal page overflow

Verify at:

- 360px
- 390px
- 428px
- 768px
- 1024px
- 1280px
- 1440px

Use mobile card layouts for complex tables when practical.

---

# Phase 12 — Code-quality cleanup for touched files

For touched files:

- Remove dead comments
- Remove console debugging
- Remove duplicate imports
- Replace index keys when a stable ID exists
- Add explicit types
- Remove `@ts-nocheck` when practical
- Extract mixed responsibilities
- Use shared tokens/components
- Avoid unrelated formatting
- Avoid a mass repository rename

---

# Phase 13 — Tests

Preserve existing tests.

Add or update focused tests for:

- RoleGuard
- Role redirects
- Navigation configuration
- Order status metadata exhaustiveness
- StatusBadge
- Buyer confirmation visibility
- Supplier action visibility
- Admin activation confirmation
- API error extraction
- Loading/error/empty components where meaningful

Run:

```bash
cd h-phsar-ui
npm install
npm test
npm run build
git diff --check
```

Only when backend changed:

```powershell
cd h-phsar-api-full
.\mvnw.cmd test
.\mvnw.cmd clean package
```

or:

```bash
cd h-phsar-api-full
./mvnw test
./mvnw clean package
```

Do not claim success unless commands actually pass.

---

# Phase 14 — Visual verification

When browser tooling is available:

- Start both applications with safe local configuration
- Do not expose secrets
- Inspect Buyer, Supplier, and Admin flows
- Inspect desktop and mobile views
- Check loading, empty, error, and populated states
- Check dialogs, menus, focus, and order actions

When browser tooling is unavailable, provide a route-by-route manual checklist.

---

# Phase 15 — Documentation

Update:

- `h-phsar-ui/README.md`
- `h-phsar-ui/MODERN_UI_UPGRADE_GUIDE.md`

Correct:

- Three roles
- Buyer/Supplier terminology
- App Router route structure
- Shared API client
- Current order statuses
- Current test/build commands

Create:

```text
h-phsar-ui/docs/UI_DESIGN_SYSTEM.md
```

Document:

- Brand use
- Semantic tokens
- Role accents
- Typography
- Spacing
- Radius
- Shadows
- Component rules
- Status metadata
- Accessibility
- Responsive breakpoints
- Buyer, Supplier, and Admin examples

---

# Scope control

Implement the shared foundation first.

Then modernize the listed highest-value pages.

If completing every page threatens build stability:

1. Finish design tokens, shared components, RoleGuard, navigation, shells, and order-status foundation.
2. Finish one vertical slice per role:
   - Buyer home plus orders
   - Supplier dashboard plus orders
   - Admin dashboard plus account table
3. Keep the build passing.
4. Report remaining pages as the next migration batch.

A stable partial migration is better than a broken broad rewrite.

---

# Required final report

Return:

1. Commits reviewed
2. Initial working-tree state
3. Confirmed UX problems
4. Implementation plan followed
5. Design tokens
6. Shared components
7. RoleGuard changes
8. Navigation changes
9. Buyer shell/pages
10. Supplier shell/pages
11. Admin shell/pages
12. Auth changes
13. Order-status corrections
14. API/state changes
15. Accessibility changes
16. Responsive verification
17. Tests added
18. `npm test` result
19. `npm run build` result
20. Backend test/build result if changed
21. Files modified
22. Remaining legacy screens
23. Known limitations
24. Exact next migration batch
25. Suggested commit messages

Suggested frontend commit:

```text
refactor(ui): unify H-Phsar role experiences and design system
```

Suggested backend commit only when needed:

```text
fix(api): align frontend integration contract
```

Do not commit.
Do not push.
