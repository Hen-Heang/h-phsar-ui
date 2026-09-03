---
name: implement-feature
description: Implement one scoped H-Phsar UI feature or bug fix using the project's frontend architecture and verification workflow.
argument-hint: "[feature or bug description]"
disable-model-invocation: true
model: sonnet
effort: medium
---

Implement this task: $ARGUMENTS

Rules:
1. Inspect the working tree and protect existing changes.
2. Read only the directly relevant page, component, hook, API util, test, and `AGENTS.md`.
3. State the outcome and a 3–6-step plan.
4. Implement the smallest coherent change.
5. Preserve role separation (Buyer/Supplier/Admin), the `src/utils/api.ts` API layer, `src/config/navigation.ts` role guarding, order-status values and transitions, and the accessibility rules in `AGENTS.md`.
6. Do not invent endpoints, metrics, trends, statuses, or Admin features the backend doesn't confirm.
7. Add or update the narrowest meaningful tests (Vitest/Testing Library).
8. Run `npm test` for the targeted scope, then `npm run build`, then `git diff --check`.
9. Do not commit or push.
10. End with changed files, commands/results, risks, and one learning point.

Stop rather than expanding into unrelated cleanup.
