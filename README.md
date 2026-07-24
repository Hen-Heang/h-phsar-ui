# H-Phsar Commerce

H-Phsar is one B2B marketplace with three role-specific experiences:

- Buyer: marketplace discovery, drafts, ordering, and receipt confirmation
- Supplier: products, inventory, order fulfilment, and reporting
- Admin: Supplier and Buyer account management

The roles share one brand, semantic design system, API client, authentication
foundation, and exact backend order workflow while retaining separate layouts
and navigation.

## Stack

- Next.js 16 App Router
- React and TypeScript with legacy JavaScript during incremental migration
- Tailwind CSS and shadcn-style/Radix primitives
- Redux Toolkit and TanStack Query
- Axios through `src/utils/api.ts`
- Vitest and Testing Library

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm test
npm run build
git diff --check
```

## App Router areas

- `/buyer/**`
- `/supplier/**`
- `/admin/**`
- `/sign-in`
- `/sign-up`

Legacy `/retailer/**` and `/distributor/**` routes remain temporarily while
screens are migrated. New work must use Buyer and Supplier terminology.

## Shared foundations

- API helpers: `src/utils/api.ts`
- Roles and home routes: `src/config/roles.ts`, `src/config/routes.ts`
- Navigation: `src/config/navigation.ts`
- Order status UX: `src/config/order-status.ts`
- Brand logo: `src/components/brand/HPhsarLogo.tsx`
- Role access state: `src/components/auth/RoleGuard.tsx`
- Global tokens: `src/index.css`

## Backend order statuses

`CART`, `DRAFT`, `PENDING`, `PROCESSING`, `DISPATCHED`, `COMPLETED`,
`REJECTED`, and `CANCELLED` are the only internal status values.

Suppliers accept or reject `PENDING` orders and dispatch `PROCESSING` orders.
Only Buyers confirm receipt, and only from `DISPATCHED`. The UI must never
auto-complete an order.
