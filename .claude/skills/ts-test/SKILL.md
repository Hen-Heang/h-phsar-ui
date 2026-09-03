---
name: ts-test
description: 'Get best practices for TypeScript unit and integration testing with vitest'
---

# TypeScript vitest Testing Best Practices

Your goal is to help write effective unit and integration tests for TypeScript applications using vitest.

> 프레임워크가 별도 테스트 스킬을 두는 경우(예: NestJS — 러너는 프로젝트가 정함: 감지값 또는 기본 vitest)는 해당 프레임워크 팩의 테스트 스킬을 따른다.

## Project Setup

- Place test files alongside source: `user-service.test.ts` next to `user-service.ts`.
- Include dev dependencies: `vitest`, `@vitest/coverage-v8`.
- Run tests with: `npx vitest run` (CI) or `npx vitest` (watch).
- Run a single file: `npx vitest run path/to/user-service.test.ts`.
- Run by name: `npx vitest run -t "should return user by id"`.
- Run with coverage: `npx vitest run --coverage`.

## Test Structure

- Use `describe` blocks to group tests by unit or feature.
- Use `it` or `test` for individual cases.
- Follow Arrange-Act-Assert (AAA).
- Name tests: `should <expected behavior> when <scenario>`.
- Use `beforeEach`/`afterEach` for per-test setup/teardown; `beforeAll`/`afterAll` for per-suite.
- Make tests independent and idempotent (no shared mutable state).

## Assertions

- Use vitest `expect`: `expect(x).toBe(y)`, `toEqual`, `toBeNull`, `toHaveBeenCalledWith`.
- Async errors: `await expect(svc.findOne(-1)).rejects.toThrow(NotFoundError)`.

## Mocking

- Use `vi.fn()` for function mocks, `vi.spyOn(obj, 'method')` to spy.
- Mock modules with `vi.mock('module-name')`.
- Reset between tests: `afterEach(() => vi.restoreAllMocks())`.
- Use `mockResolvedValue` / `mockRejectedValue` for async; don't confuse with `mockReturnValue`.

## Parameterized Tests

```typescript
import { test, expect } from 'vitest';

test.each([
  [1, true],
  [0, false],
  [-1, false],
])('isPositive(%i) === %s', (input, expected) => {
  expect(isPositive(input)).toBe(expected);
});
```

## Test Organization

- Mirror the source directory structure.
- Use `it.skip` / `it.todo` to disable tests; always add a comment explaining why.
- Tag slow/external tests and exclude them in fast runs via vitest config.
