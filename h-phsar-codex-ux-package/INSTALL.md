# Install the H-Phsar Codex Rules

Expected local structure:

```text
H-Phsar/
├── AGENTS.md
├── h-phsar-ui/
│   ├── AGENTS.md
│   └── ...
└── h-phsar-api-full/
    ├── AGENTS.md
    └── ...
```

## Copy the files

1. Copy `workspace-AGENTS.md` to `H-Phsar/AGENTS.md`.
2. Copy `h-phsar-ui/AGENTS.md` to `H-Phsar/h-phsar-ui/AGENTS.md`.
3. Copy `h-phsar-api-full/AGENTS.md` to `H-Phsar/h-phsar-api-full/AGENTS.md`.
4. Start Codex from the parent workspace:

```powershell
cd C:\path\to\H-Phsar
codex
```

5. Paste `CODEX_UX_UI_MODERNIZATION_PROMPT.md` into the session.

Use normal approval mode for the first large migration so commands and edits remain reviewable.

Do not place the entire task prompt inside `AGENTS.md`. Keep `AGENTS.md` for stable project rules and use the task prompt for this specific issue.
