---
name: nextjs-testing
description: 'Get best practices for testing Next.js App Router apps with vitest and Playwright'
---

# Next.js Testing Best Practices

Your goal is to help write effective tests for Next.js (App Router) using vitest for units/components and Playwright for end-to-end flows.

> Next.js는 lang-typescript 기본 러너 vitest를 쓰고, 서버 렌더·라우팅·Server Action 같은 통합 동작은 Playwright E2E로 검증한다.

## Unit & Component (vitest)

- Test pure functions, utilities, and client components with `vitest` + `@testing-library/react` (jsdom 환경).
- Place tests alongside source: `format-date.test.ts`, `user-menu.test.tsx`.
- Query by accessible role/text; interact with `@testing-library/user-event` (await it).
- Mock data modules at the boundary; reset with `afterEach(() => vi.restoreAllMocks())`.

```tsx
import { render, screen } from '@testing-library/react';
import { UserMenu } from './user-menu';

it('should show the user name', () => {
  render(<UserMenu user={{ name: 'Alice' }} />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

## Server Components & Server Actions

- Server Components that fetch data are best covered by **E2E** (they run on the server in a request context).
- Extract pure logic (validation, mapping) out of Server Actions into plain functions and unit-test those directly.
- For a Server Action's effect (write + revalidate + redirect), assert the observable outcome via E2E.

## End-to-End (Playwright)

- Use the Playwright MCP browser tools to drive a running dev/preview server.
- Cover real flows: navigation between routes, form submission through Server Actions, auth-gated pages, loading/error boundaries.
- Assert on what the user sees (rendered text, URL, redirects), not on internal framework state.
- Keep E2E focused on critical paths; push detailed edge cases down to unit tests.

## What Not to Test

- Don't test Next.js routing/caching internals — test your behavior on top of them.
- Don't snapshot whole pages; assert specific visible outcomes.
