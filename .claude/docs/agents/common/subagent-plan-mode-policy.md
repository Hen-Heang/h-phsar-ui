---
name: subagent-plan-mode-policy
description: dev-planner·qa-planner·dev-backend·dev-frontend 등 sub-agent 가 Plan Mode 를 랩핑하지 않는 공통 사유 + 사용자 게이트 위치 매핑.
---

> **Single source**: this file is the master for the sub-agent Plan Mode policy, its common rationale, and the gate-location mapping. Do not inline-copy the rationale into a calling agent's body — edit only this file and every sub-agent picks it up automatically.

---

## Policy

**Sub-agents do not wrap Plan Mode.**

---

## Common rationale

1. Sub-agents conflict with the main session's mode (Plan Mode) in a **host-guest relationship** — a sub-agent runs in an isolated context, while Plan Mode is a behavior mode of the main session. Applying both layers together makes it ambiguous what ExitPlanMode is approving.
2. **The output itself is a "plan" or code** — dev-planner/qa-planner outputs are themselves plans, and dev-backend/dev-frontend outputs are code. Wrapping Plan Mode creates the meta structure of _"a plan that produces a plan"_, making it ambiguous what gets approved at ExitPlanMode.
3. **Automatic chained flows get cut by the ExitPlanMode approval prompt** — automatic flows such as dev-planner return → the `/dev-plan` skill's automatic qa-planner dispatch break at the ExitPlanMode user prompt if a sub-agent wraps Plan Mode (same pattern in dev-interview v3→v4, dev-planner, and qa-planner).
4. **Read-only / write enforcement is sufficient via `<Security_Rules>` + `allowedTools`** — even without a separate Plan Mode, the sub-agent's tool-permission constraints guarantee safety.
5. **User review gates are limited to a single step** — each sub-agent has only _one_ user gate defined in its body (the gate location is stated in the calling agent's body).

---

## User gate location mapping

| sub-agent     | User review gate location             |
| ------------- | ------------------------------------ |
| dev-planner   | Step 4.5 phase-partition review      |
| qa-planner    | Step 6.5 TC distribution review      |
| dev-backend   | Step 3 implementation-scope confirmation (케이스 C only) |
| dev-frontend  | Step 3 implementation-scope confirmation (케이스 C only) |

> When a gate location changes, update the delegation line in the calling agent's body as well.

---

## Step where Plan Mode fits

`/develop` (actual code changes — matches the plan→execute pattern) — the right moment for the main session to enter Plan Mode to reach user agreement is the develop slash-command step. Sub-agents such as dev-planner / qa-planner / dev-backend / dev-frontend do not wrap Plan Mode, per this policy.
