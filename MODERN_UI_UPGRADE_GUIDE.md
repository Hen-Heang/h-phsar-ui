# Modern UI Upgrade Guide (2026)

This workspace now runs on Next.js (`next dev`, `next build`, `next start`).
Current architecture is a migration bridge:
- Next App Router shell in `src/app`
- Legacy client app mounted via `src/app/[[...slug]]/page.next.jsx` and `src/App.js` (`react-router-dom`)

You have a modern UI starter implemented in `src/components/modern` and `src/components/ui`.

## 1) Tailwind in Next.js

For new greenfield projects, use:

```bash
npx create-next-app@latest my-app --ts --tailwind --eslint --app --src-dir
cd my-app
npm install framer-motion lucide-react react-hook-form zod @hookform/resolvers class-variance-authority clsx tailwind-merge @radix-ui/react-slot
```

`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

## 2) Component Library Recommendation

Choose `shadcn/ui` for this project:

- Works perfectly with Tailwind design systems.
- Headless primitives with full customization.
- Easy to keep visual consistency across retailer/distributor areas.

In this repo, you already have shadcn-style base components:

- `src/components/ui/button.jsx`
- `src/components/ui/card.jsx`
- `src/lib/cn.js`

## 3) Framer Motion

Installed and used in:

- `src/components/modern/navbar.jsx`
- `src/components/modern/hero.jsx`
- `src/components/modern/project-grid.jsx`
- `src/components/modern/theme-toggle.jsx`

## 4) Icons

Installed `lucide-react` and used in navbar/theme/hero examples.

## 5) Dark Mode + System Detection

Implemented in:

- `src/components/modern/theme-provider.jsx`
- `src/components/modern/theme-toggle.jsx`

Mode cycles: `light -> dark -> system`, persists in localStorage, and tracks OS changes in system mode.

## 6) Forms + Validation

Implemented with `react-hook-form + zod` in:

- `src/components/modern/contact-form.jsx`

Uses `zodResolver` and inline validation messages.

## 7) Included Example UI Blocks

- Responsive navbar with hamburger: `src/components/modern/navbar.jsx`
- Animated hero section: `src/components/modern/hero.jsx`
- Project card grid: `src/components/modern/project-grid.jsx`
- Dark/light/system toggle: `src/components/modern/theme-toggle.jsx`
- Form validation example: `src/components/modern/contact-form.jsx`

Composed example page:

- `src/pages/ModernShowcase.jsx`

## 8) Using UI Components with Tailwind Utilities

Example:

```jsx
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export function Example() {
  return (
    <Card className="border-teal-200 dark:border-teal-900">
      <CardHeader>
        <CardTitle>Upgrade Ready</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="outline">Secondary</Button>
      </CardContent>
    </Card>
  );
}
```

## 9) SEO + Responsive Best Practices

- Use semantic tags: `header`, `main`, `section`, `article`, `footer`.
- Add unique `title` and `meta description` per page (Next.js `metadata` API).
- Ensure headings follow hierarchy (`h1` once per page).
- Add descriptive `alt` text on images.
- Prefer responsive utility classes (`sm: md: lg:`) and fluid widths.
- Keep tap targets >= 44x44 px for mobile usability.
- Avoid layout shift: set image dimensions or use aspect-ratio containers.
- Add `sitemap.xml` and clean `robots.txt`.

## 10) Folder Structure + Naming

Recommended target structure:

```txt
src/
  app/                     # Next.js app router (after migration)
  components/
    ui/                    # primitive reusable components
    modern/                # composed marketing/dashboard sections
  features/
    auth/
    distributor/
    retailer/
  lib/                     # shared helpers (cn, constants, utils)
  hooks/
  styles/
```

Conventions:

- Components: `PascalCase.jsx`
- Hooks: `useSomething.js`
- Utilities: `camelCase.js`
- Keep presentational components stateless where possible.
- Co-locate tests and story files near components.
- Keep one component per file once it grows beyond small helpers.
