# H-Phsar UI — Claude Code Instructions

This project's coding instructions live in `AGENTS.md` in this repository
root. Read it before making any change — it is the canonical, shared
instructions file for this project (also used by other coding agents), and
this file exists only so Claude Code loads it automatically every session.

Do not duplicate `AGENTS.md`'s content here. If you need to change project
instructions, edit `AGENTS.md`, not this file.

## Quick reference

- Never commit, push, rewrite history, or delete unrelated files unless
  explicitly requested.
- Required checks before reporting a task done:

```bash
npm test
npm run build
git diff --check
```
