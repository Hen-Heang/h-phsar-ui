---
name: finish-task
description: Verify a completed H-Phsar UI task with targeted tests, a build check, and a concise final report.
argument-hint: "[optional targeted test file or pattern]"
disable-model-invocation: true
context: fork
agent: test-runner
---

Verify the current task.

1. Inspect changed files (`git status --short`, `git diff --stat`).
2. If an argument is provided, run that targeted test: $ARGUMENTS
3. Otherwise infer the narrowest relevant Vitest file from changed files.
4. Run `git diff --check`.
5. Run `npm run build` only when targeted verification succeeds and the scope warrants a full build check.
6. Do not modify code, commit, or push.
7. Return a concise verification report and smallest next action.
