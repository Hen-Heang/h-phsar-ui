---
name: react-testing
description: 'Get best practices for testing React components with vitest and @testing-library/react'
---

# React Component Testing Best Practices

Your goal is to help write effective component tests for React using vitest and `@testing-library/react`.

> React는 lang-typescript 기본 러너 vitest를 그대로 쓴다. 컴포넌트는 `@testing-library/react`로 사용자 관점에서 테스트한다.

## Project Setup

- Place test files alongside source: `user-card.test.tsx` next to `user-card.tsx`.
- Dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`.
- Set `test.environment = 'jsdom'` in vitest config.
- Run: `npx vitest run` (CI) / `npx vitest` (watch).

## Test from the User's Perspective

- Query by accessible role/label/text, not by class or test-id: `screen.getByRole('button', { name: /submit/i })`.
- Reserve `getByTestId` for cases with no accessible handle.
- Assert on what the user sees, not on internal state or implementation details.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from './user-card';

it('should call onSelect with the user id when clicked', async () => {
  const onSelect = vi.fn();
  render(<UserCard user={{ id: 1, name: 'Alice' }} onSelect={onSelect} />);

  await userEvent.click(screen.getByRole('button', { name: 'Alice' }));

  expect(onSelect).toHaveBeenCalledWith(1);
});
```

## Interactions & Async

- Use `userEvent` (not `fireEvent`) for realistic interactions; it is async — always `await`.
- For state that appears after async work use `findBy*` (auto-retries) or `await waitFor(...)`.
- Avoid asserting on intermediate loading flags unless that is the behavior under test.

## Mocking

- Mock network at the boundary (e.g. `vi.mock` the data module, or use an HTTP mock).
- Reset mocks in `afterEach(() => vi.restoreAllMocks())`.
- Do not mock React itself or the component under test.

## What Not to Test

- Don't test third-party libraries or framework internals.
- Don't snapshot large trees as the primary assertion — prefer explicit role/text assertions.
