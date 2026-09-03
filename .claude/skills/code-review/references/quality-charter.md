# Quality charter (TRUST) — 5-axis classification criteria

> The quality classification charter code-review consults when attaching axis tags to findings.
> **It creates no new gates — naming · indexing · visualization only.** Blocking logic stays at the severity level.
> **Single source for the axis↔severity mapping = the axis column of each pack's `severity-rules`.** This charter defines only the axes' *frame* (concrete rule IDs are owned by the packs).

## 1. The TRUST 5 axes

| Axis | Code | Meaning | What it catches |
|----|:--:|----|----------|
| Tested | `Te` | Is it tested | Coverage · unit/integration/E2E (no severity ID = qa territory) |
| Reliable | `R` | Does it avoid outages | Runtime failures · concurrency · performance · resource leaks · transactions |
| Unified | `U` | Is it unified | Naming · formatting · common utils · conventions (readability included) |
| Secured | `S` | Is it secured | Secret exposure · injection · XSS · authorization · hard-coding |
| Trackable | `Tr` | Does it leave a trail | Commit rules · branch strategy · trace IDs · documentation |

> To avoid the two-T (Tested·Trackable) collision, the axis codes are distinguished as `Te`·`Tr`. The valid codes are exactly the 5: `Te/R/U/S/Tr`.

## 2. Gate signal lamp (1:1 with the existing severity levels)

- 🔴 **차단(BLOCK)**: Critical → commit/progress not allowed
- 🟡 **경고(WARN)**: Warning → proceed after fixing
- 🔵 **참고(INFO)**: Suggestion → may proceed

> The signal lamp is not a new gate — it puts name tags on the existing Critical/Warning/Suggestion.

## 3. Gate matrix (axis × pipeline stage) — structure only

| Axis | dev-interview | develop | code-review | git | qa-test | pack |
|----|:--:|:--:|:--:|:--:|:--:|:--:|
| Tested | | 🔵 | | | 🔵 | |
| Reliable | pre-exploration | | 🔴/🟡 | 🔴 | | |
| Unified | | | 🟡/🔵 | 🟡 | | |
| Secured | pre-exploration | 🔴 | 🔴/🟡 | 🔴 | | |
| Trackable | | 🔴 | | 🔴 | | 🔵 |

> The structure of where each axis is *primarily* evaluated. Concrete severity IDs and thresholds are defined by the packs' severity-rules.

## 4. Axis for incident anti-pattern matches

Incident anti-patterns (instance assets) are runtime/operational in nature, so tag them with the default axis 기본 R(Reliable). (Per-instance precise mapping is follow-up work.)
