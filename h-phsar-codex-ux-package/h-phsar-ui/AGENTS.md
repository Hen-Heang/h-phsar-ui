# H-Phsar Frontend Instructions

These instructions apply to the `h-phsar-ui` repository.

## Current architecture

- Next.js App Router
- React and TypeScript mixed with legacy JavaScript
- Tailwind CSS
- shadcn-style/Radix primitives
- Redux Toolkit
- TanStack Query in selected features
- Axios through `src/utils/api.ts`
- Vitest and Testing Library

Preserve compatibility while modernizing incrementally.

## UX architecture

Keep the roles distinct:

- Buyer: marketplace, discovery, cart, drafts, order tracking, mobile-first
- Supplier: operational dashboard, products, inventory, orders, reports
- Admin: secure account-management console

They must share:

- H-Phsar branding
- Typography
- Semantic color tokens
- Spacing and radius rules
- Buttons, inputs, dialogs, tables, badges
- Loading, empty, error, and confirmation states
- Accessibility behavior
- API and authentication foundations

## Naming

Use `Buyer`, `Supplier`, and `Admin` in all newly touched code and visible UI.

When a legacy file is materially changed, prefer a focused rename such as:

- `RetailerShell` → `BuyerShell`
- `DistributorShell` → `SupplierShell`
- `HomeDistributor` → `SupplierDashboard`

Do not run a blind global rename.
Do not rename untouched files only for cosmetic consistency.

## Design system

Use semantic tokens rather than repeated raw colors.

Preferred shared foundation:

- Brand primary: teal
- Brand secondary/navy: deep blue
- Buyer accent: orange
- Supplier accent: teal
- Admin accent: navy
- Shared neutral surfaces: slate-based

Keep role accents, but do not make the roles look like unrelated products.

Use consistent geometry:

- Small radius: 10–12px
- Normal radius: 14–16px
- Large panel radius: 20–24px
- Avoid excessive `rounded-[2.5rem]` and `rounded-[3rem]` unless justified
- Use subtle shadows and clear borders

## Shared components

Before duplicating UI, search and reuse existing components.

Prefer or create shared components for:

- Brand logo
- Role guard
- Page header
- Section header
- Button
- Input/select/textarea
- Card
- Badge/status badge
- Search/filter bar
- Data table
- Pagination
- Loading state
- Empty state
- Error/retry state
- Confirmation dialog
- Profile menu
- Notification menu

Do not create two components with the same responsibility in different folders.

## Navigation and shells

Use central navigation configuration.
Do not keep hardcoded navigation arrays inside role shell components when `src/config/navigation.ts` can provide them.
Each role must have a separate layout and shell.

Extract mixed responsibilities from large navigation files. Navigation components must not own unrelated cart, search, notification, WebSocket, API, and business logic together.

Prefer focused components and hooks. New shell/navigation files should normally stay below roughly 250–300 lines.

## API rules

Use `src/utils/api.ts` as the API foundation for touched code.

Prefer:

- `apiGet`
- `apiPost`
- `apiPut`
- `apiPatch`
- `apiDelete`

Do not add another Axios instance or fetch wrapper.
Verify request and response types against backend code before changing UI logic.
Keep shared types for standard responses, paged responses, errors, roles, and statuses.
Do not expose raw Axios errors to users.

## Order workflow

Use exact backend status values internally:

- `CART`
- `DRAFT`
- `PENDING`
- `PROCESSING`
- `DISPATCHED`
- `COMPLETED`
- `REJECTED`
- `CANCELLED`

Use one central status metadata map for labels, icons, colors, progress, and allowed UI actions.

Rules:

- Supplier may accept or reject `PENDING`.
- Supplier may dispatch `PROCESSING`.
- Supplier must not complete `DISPATCHED`.
- Buyer may confirm receipt only for `DISPATCHED`.
- Do not auto-complete an order.
- Show `REJECTED` and `CANCELLED` clearly.
- Do not use color alone to communicate status.

## State management

Do not globally rewrite state management.

For touched features:

- Use TanStack Query for remote server state where already established.
- Keep Redux for existing global client state.
- Avoid duplicating the same API data in Redux and Query.
- Keep local UI state near the component.
- Extract reusable interactions into hooks.
- Do not introduce Zustand or another state library.

## Accessibility

Touched UI must include:

- Semantic landmarks
- One clear `h1`
- Correct heading hierarchy
- Labels for inputs
- Visible keyboard focus
- Keyboard-accessible menus and dialogs
- Descriptive alt text
- At least 44×44px touch targets
- Accessible icon-only button labels
- Reduced-motion support
- Responsive behavior at 360, 390, 428, 768, 1024, 1280, and 1440px

Do not disable accessibility rules to hide issues.

## Code quality

For touched files:

- Remove dead commented code.
- Remove console debugging.
- Avoid `@ts-nocheck` when practical.
- Add useful types.
- Use stable keys.
- Split mixed-responsibility components.
- Avoid formatting unrelated files.
- Do not add fake dashboard trends or metrics.

## Required checks

Run targeted tests first, then:

```bash
npm test
npm run build
git diff --check
```

If the full suite cannot run, report the exact reason and the narrowest successful verification.
