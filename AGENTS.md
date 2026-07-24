# H-Phsar Frontend Instructions

This repository is the Next.js frontend for one H-Phsar product with three
roles: `BUYER`, `SUPPLIER`, and `ADMIN`.

## Working behavior

- Inspect before editing and preserve existing modified or untracked work.
- Modernize incrementally; do not commit, push, rewrite history, or delete
  unrelated files unless explicitly requested.
- Keep Buyer, Supplier, and Admin layouts separate while sharing one brand,
  design system, API foundation, and authentication foundation.
- The backend is authoritative for roles, endpoints, payloads, pagination,
  order statuses, and allowed order transitions.
- Do not invent endpoints, metrics, trends, statuses, or Admin features.

## Frontend architecture

- Next.js App Router with mixed React/TypeScript and legacy JavaScript
- Tailwind CSS and shadcn-style/Radix primitives
- Redux Toolkit plus TanStack Query in selected features
- Axios through `src/utils/api.ts`
- Vitest and Testing Library

Use `Buyer`, `Supplier`, and `Admin` in newly touched code and visible UI.
Prefer focused renames only when a legacy file is materially changed.

## Design and accessibility

- Use semantic tokens instead of repeated raw colors.
- Share typography, geometry, buttons, inputs, cards, dialogs, tables, badges,
  loading, empty, error, and confirmation states.
- Use the existing H-Phsar assets in `public/logo/`; do not redraw the logo.
- Touched UI needs semantic landmarks, one clear `h1`, visible focus, labels,
  keyboard-accessible controls, descriptive alt text, 44x44px touch targets,
  reduced-motion support, and responsive behavior from 360px upward.

## Navigation and authorization

- Use `src/config/navigation.ts` as the central role-navigation source.
- Use one shared role guard and show an accessible loading state while checking.
- Frontend guards are a UX boundary, not an authorization security boundary.
- Admin navigation may link only to implemented pages.

## API and state

- Prefer `apiGet`, `apiPost`, `apiPut`, `apiPatch`, and `apiDelete` from
  `src/utils/api.ts` for touched code.
- Do not add another Axios instance or fetch wrapper.
- Keep existing local-storage compatibility unless the verified backend contract
  supports a safer replacement.
- Do not globally rewrite Redux or TanStack Query usage.

## Order workflow

Use only these backend statuses internally:

- `CART`
- `DRAFT`
- `PENDING`
- `PROCESSING`
- `DISPATCHED`
- `COMPLETED`
- `REJECTED`
- `CANCELLED`

Supplier actions: accept/reject `PENDING`, dispatch `PROCESSING`, and never
complete `DISPATCHED`. Buyer may confirm receipt only for `DISPATCHED`. Never
auto-complete an order, and never communicate status by color alone.

## Required checks

Run targeted tests first, followed by:

```bash
npm test
npm run build
git diff --check
```

Report exact results and any remaining legacy screens.
