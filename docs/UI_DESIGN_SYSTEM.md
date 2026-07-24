# H-Phsar UI Design System

## Brand

Use `HPhsarLogo` with the existing files in `public/logo/`. Choose `icon` for
small controls, `compact` for sidebars, and `wordmark` for public/auth surfaces.
Use the `dark` surface option on navy or dark teal backgrounds.

## Semantic colors

Global CSS variables in `src/index.css` are the source of truth:

- Primary teal: `--brand-primary`
- Secondary teal-blue: `--brand-secondary`
- Brand navy: `--brand-navy`
- Buyer accent: indigo `--buyer-accent` (`#4f46e5`)
- Supplier accent: `--supplier-accent`
- Admin accent: `--admin-accent`
- Surfaces: `--background`, `--surface`, `--surface-muted`
- Content: `--text-primary`, `--text-secondary`, `--text-muted`
- Feedback: `--success`, `--warning`, `--danger`, `--info`

Use role accents for active navigation and key workflow emphasis, not for every
control. Shared actions default to brand teal.

## Type, spacing, and geometry

- Use the system sans-serif stack for interface text.
- Prefer page spacing of 16px on mobile and 32px on desktop.
- Use 10–12px radii for controls, 14–16px for cards, and 20–24px for panels.
- Prefer a subtle border and small shadow. Avoid oversized 40–48px radii.
- Interactive touch targets must be at least 44x44px.

## Components

Reuse primitives in `src/components/ui` before adding a component. Use shared
components for branding, role guards, and status badges. Buttons support
default, secondary, outline, ghost, destructive, success, and link variants.

Navigation comes only from `src/config/navigation.ts`. Admin navigation exposes
implemented routes only.

## Order status

`src/config/order-status.ts` maps every backend status to a label, description,
icon, tone, progress, terminal state, and allowed Buyer/Supplier actions. UI
must render a text label and icon in addition to color.

## Accessibility

- Use semantic landmarks and one clear `h1` per page.
- Associate labels with inputs and name icon-only buttons.
- Preserve visible keyboard focus and Escape behavior in dialogs.
- Respect reduced-motion preferences.
- Provide descriptive image alternatives and explicit dimensions.
- Do not expose restricted content while role access is being checked.

## Responsive behavior

Check touched screens at 360, 390, 428, 768, 1024, 1280, and 1440px. Role
sidebars become mobile drawers below desktop widths. Complex tables should use
a mobile card presentation or safe horizontal containment.

## Role examples

- Buyer: indigo accents, marketplace cards, prominent search and cart.
- Supplier: teal active states, operational navigation, scannable inventory and orders.
- Admin: navy shell, restrained account-management tools, no invented metrics.
