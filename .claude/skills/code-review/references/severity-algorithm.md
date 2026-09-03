# Severity classification algorithm

> The 4-step severity classification procedure (STEP 0–3) referenced from Step 3 of the code-review skill.

<Algorithm>

Apply the **4-step severity classification algorithm** below strictly in order:

## STEP 0: Domain-router checklist matching + incident-log cross-reference (highest priority, depends on customDocs)

If `{{config.customDocs.antiPatterns}}` is empty, **skip STEP 0 → proceed to STEP 1**. If it has a value, follow the order below.

1. **Identify the business area · signals** — grasp the changed code's business context (auth · concurrency · batch etc.) and obtain the **priority rule ID** list via `{{config.customDocs.antiPatterns}}` (= the `domain-profile.md` router).
2. **Check against category checklists** — compare candidate rules with the category checklists (`docs/checklists/{cat}.md` principles + `docs/checklists/lang/{cat}.md` detection keywords · examples).
3. **Incident-log listed → production-verified** — (if `docs/incidents/incident-log.md` is missing or empty → treat as step 4.) If a matched rule is listed as an incident in `docs/incidents/incident-log.md`, **fix the severity** (the rule's baseline severity as-is — Critical for a Critical rule, Warning for a Warning rule) + **exempt from STEP 3 cross-verification**. Notation: `[{ID}] — {사고ID} 회귀 위험` (the incident ID comes from the incident-log).
4. **Not in the incident log** — a matched rule not listed in the incident-log gets its **baseline severity** and **proceeds to STEP 1** (no exemption — treated as general best practice).
5. **No match** → proceed to STEP 1.

> **Key point**: the authority for automatic Critical (STEP 3 exemption) comes from the **project incident log (incident-log)**. In a new project without an incident log, rules ride the normal flow at baseline severity.

## STEP 1: severity_rules pattern matching (severity-rules.md single source)

Compare discovered issues against the Critical/Warning/Suggestion pattern `keywords` in [`severity-rules.md`](severity-rules.md).

- **Match found** → assign that severity's pattern ID and fix the severity. **Skip STEP 2.**
- **Simultaneous matches across severities** → **adopt the higher severity** (Critical over Warning).
- **No match** → proceed to STEP 2.
- **Variable substitution**: substitute `{{config.commonUtilsArtifact}}` etc. in `severity-rules.md` with `project.yaml` values before matching.

### STEP: Axis tagging (TRUST)
Read the **axis column** value (`Te/R/U/S/Tr`) of the matched severity rule row and annotate the finding with `[축]`.
Incident anti-pattern matches default to `R`. Heuristic `[H]` may omit the axis.
Mapping criteria · axis definitions = see `quality-charter.md`.

**Security-axis (S) international-standard attachment (lazy-load)**: if a finding's axis is **S**, only then Read `sec-standards/references/standards-catalog.md`, check the `표준` column of that severity rule (e.g. `CWE-79 / OWASP-A03:2021`), and annotate the finding with it. If the rule has a `표준` value, cite that CWE/OWASP; if a human-readable explanation is needed, include the catalog body's rationale. **If the axis is not S, do not read the catalog** (0 tokens in the normal case). For dependency risks (outdated · vulnerable components), do not bake a list — recommend running the per-stack scanner in `sec-standards/references/dependency-scan-guide.md`. Output notation: `[{ID}] {이름} — {CWE} / {OWASP}`.

## STEP 1.5: AST structural rule matching (astgrep-scan.ps1, deterministic)

Deterministically detect **structural defects** that keywords (STEP 1) cannot catch, via AST patterns. The caller (agent) runs `scripts/astgrep-scan.ps1` on the changed source files.

- **A match's rule id coincides with the severity ID.** Therefore look up that ID's baseline severity and **axis** in [`severity-rules.md`](severity-rules.md) and assign them (same as STEP 1 — single source).
- **Combine** with STEP 1 keyword candidates, but for **multiple matches at the same location, adopt the higher severity**.
- If an AST match is Critical, **it goes through STEP 3 cross-verification** (only STEP 0 incident-log-listed rules are exempt).
- If `sg` is not installed / the ruleset is absent / timeout / execution error, **skip** STEP 1.5 and note the reason in the output — the review **proceeds normally** on the keyword layer (non-blocking).

## STEP 2: Heuristic judgment (only when no pattern matched)

Assign `[H]` instead of a pattern ID, and judge by these criteria:

| Severity      | Criterion                                            |
| ------------- | ---------------------------------------------------- |
| 🔴 Critical   | Causes an **immediate** outage in production or leads directly to a security incident |
| 🟡 Warning    | Possible problems under specific conditions (performance, maintainability, latent bugs) |
| 🔵 Suggestion | Quality/readability improvements unrelated to functionality |

## STEP 3: Critical cross-verification (mandatory — STEP 0 incident-log-listed rules are exempt)

For every issue judged Critical in STEP 1 or STEP 2, verify these questions:

1. "Does this issue cause an **immediate** outage or security incident in production?"
2. "Would it not fit a **warning or suggestion** pattern in severity_rules better?"

→ If even one answer is **"no"** → **downgrade** to Warning or Suggestion.

> **A rule confirmed as incident-log-listed in STEP 0 is exempt from this cross-verification.** That rule is an anti-pattern already verified by a production outage case, so *direct immediate-outage linkage* is guaranteed. Downgrading is forbidden.

</Algorithm>

<Absolute_Rules>

> **Wildcard imports, naming violations, brace style, missing API doc comments, and other coding-convention/documentation issues are never Critical under any circumstances.**
> These issues are explicitly designated Warning[W07a~f] or Suggestion[S01] in severity_rules, and must follow those severities.

</Absolute_Rules>

<Calibration_Examples>

Frequently occurring **misclassification cases** and the correct verdicts. Always consult these when judging severity.

| Discovered issue                                   | ❌ Wrong verdict | ✅ Correct verdict      | Reason                                             |
| -------------------------------------------------- | -------------- | ----------------------- | -------------------------------------------------- |
| Wildcard import (star import)                      | 🔴 Critical    | 🟡 **[W07a]** Warning   | Convention violation, unrelated to runtime outages |
| Naming-rule violation (lowerCamelCase etc.)        | 🔴 Critical    | 🟡 **[W07b]** Warning   | Convention violation, unrelated to runtime outages |
| Brace style not followed                           | 🔴 Critical    | 🟡 **[W07c]** Warning   | Convention violation, unrelated to runtime outages |
| Missing API doc comments                           | 🟡 Warning     | 🔵 **[S01]** Suggestion | Documentation issue unrelated to functionality     |
| `catch (Exception e) {}` (empty catch)             | 🔵 Suggestion  | 🟡 **[W05]** Warning    | Swallowed exceptions make outages untraceable      |
| Leftover `console.log()`                           | 🟡 Warning     | 🔵 **[S05]** Suggestion | Debug code unrelated to functionality              |
| MDC not propagated inside direct thread creation   | 🔴 Critical    | 🟡 **[W11]** Warning    | Missing tracing, but not an immediate outage       |
| `return null` from a Factory                       | 🔴 Critical    | 🟡 **[W12]** Warning    | Null possibility, but depends on caller null checks |
| Direct reimplementation of a common util (exists in `{{config.commonUtilsArtifact}}`) | 🔵 Suggestion  | 🟡 **[W13]** Warning    | Duplicate implementation of the common library, raises maintenance cost |
| `Optional.get()` without isPresent                 | 🟡 Warning     | 🔴 **[C11]** Critical   | Directly linked to null dereference                |
| `th:utext` with user input                         | 🟡 Warning     | 🔴 **[C04]** Critical   | XSS vulnerability                                  |
| UI action button lacks double-click defense (disabled/loading) | 🟡 [W02] Warning | 🔴 **[CONC-01]** Critical (STEP 0 priority) | Missing double-submit defense → duplicate processing — see the project incident log |
| Endpoint without idempotency and no external-transaction duplicate check | 🟡 [W04] Warning | 🔴 **[CONC-02]** Critical (STEP 0 priority) | No idempotency → duplicate processing on external retries — see the project incident log |
| User-input-driven range query without an upper-bound check | 🟡 [W04] Warning | 🔴 **[DATA-01]** Critical (STEP 0 priority) | Unbounded user-input-driven range → DoS / DB load — see the project incident log |

> **Note**: examples marked `(STEP 0 priority)` assume the rule is listed in the project's incident-log. If not listed in the incident-log, handle as step 4 (baseline severity).

For language/framework-specific calibration cases, see the language pack's review-checklist-lang.

</Calibration_Examples>
