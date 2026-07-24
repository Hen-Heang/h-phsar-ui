# H-Phsar Workspace Instructions

## Workspace

This workspace contains two related repositories:

- `h-phsar-ui`: Next.js frontend
- `h-phsar-api-full`: Spring Boot backend

Treat them as one product, but preserve their independent Git histories.

## Working behavior

- Act as a careful mid-level full-stack engineer with strong UX/UI judgment.
- Inspect before editing. Read the smallest relevant set of files.
- Protect all existing modified and untracked work.
- Prefer the smallest coherent change that fully solves the requested issue.
- Present a concise plan before a multi-file change.
- Implement in reviewable phases.
- Do not commit, push, create branches, rewrite history, hard reset, clean the worktree, or delete unrelated files unless explicitly requested.
- Never claim a command, test, build, or visual check succeeded unless it actually ran.
- Do not silently expand scope into dependency upgrades, architecture rewrites, or backend redesign.

## Product architecture

H-Phsar is one B2B marketplace product with three roles:

- `BUYER`
- `SUPPLIER`
- `ADMIN`

Use:

- One frontend application
- One shared brand and design system
- One API foundation
- Separate Buyer, Supplier, and Admin layouts
- Role-specific navigation and workflows

Do not create three frontend applications.
Do not create one giant role-conditioned dashboard.

## Backend source of truth

The backend implementation is authoritative for:

- Roles and authorization
- API methods and paths
- Request and response shapes
- Pagination
- Order statuses and transitions
- Admin feature availability

Current role names:

- `BUYER`
- `SUPPLIER`
- `ADMIN`

Current order statuses:

- `CART`
- `DRAFT`
- `PENDING`
- `PROCESSING`
- `DISPATCHED`
- `COMPLETED`
- `REJECTED`
- `CANCELLED`

Do not introduce frontend-only internal statuses such as `SHIPPING`, `CONFIRMING`, `DELIVERED`, `DECLINED`, or `COMPLETE`.

## Scope safety

Unless the task explicitly requires it, do not:

- Change the database schema
- Change order transitions
- Change inventory rules
- Change JWT architecture
- Replace MyBatis
- Upgrade Java, Spring Boot, Next.js, React, Tailwind, or other major dependencies
- Introduce another state-management or UI framework
- Invent unsupported Admin endpoints
- Add fake metrics, fake trends, or placeholder production data

## Cross-project verification

Before work:

```bash
git -C h-phsar-ui status --short
git -C h-phsar-ui branch --show-current
git -C h-phsar-ui log -1 --oneline

git -C h-phsar-api-full status --short
git -C h-phsar-api-full branch --show-current
git -C h-phsar-api-full log -1 --oneline
```

After work:

```bash
git -C h-phsar-ui diff --check
git -C h-phsar-ui status --short
git -C h-phsar-ui diff --stat

git -C h-phsar-api-full diff --check
git -C h-phsar-api-full status --short
git -C h-phsar-api-full diff --stat
```

Only run backend tests when backend files changed.

## Final report

Always report:

1. What was inspected
2. What changed
3. Commands actually run
4. Test/build results
5. Visual or manual verification
6. Remaining legacy screens
7. Risks and the next smallest step
