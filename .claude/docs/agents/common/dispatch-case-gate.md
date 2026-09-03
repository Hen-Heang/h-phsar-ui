---
name: dispatch-case-gate
description: dev-backend·dev-frontend 공통 — 케이스 A/B/C 디스패치 케이스 정의 + 3단계 자동 생략 게이트 + 안전망. 영역명(BE/FE)·페이즈 파일명 슬러그는 호출 에이전트 본문에서 명시.
---

> **Single source**: this file is the master for the 케이스 A/B/C entry conditions, auto-skip judgment, safety net, and execution principles. Do not inline-copy the schema into the dev-backend·dev-frontend bodies — edit only this file and both agents pick it up automatically.

---

## Case definitions (A/B/C)

| Case | Entry condition (common) | Basis for auto-skip |
| ------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **A**  | dev-plan phase meta input — an area=BE or FE phase (`phases/{페이즈 파일명 슬러그}` path)   | Passing the dev-planner step-4.5 phase-partition review gate = implementation scope already agreed |
| **B**  | develop Plan Mode input (Plan content that passed ExitPlanMode)                              | Passing ExitPlanMode = implementation scope already agreed           |
| **C**  | Direct request meeting neither entry condition above / handoff of 미처리 항목               | Auto-skip not applied — print the 3-2 output, then get user confirmation |

> **The area-name and phase-filename-slug mapping** is specified in the calling agent's body (e.g. dev-backend → area=BE / slug=`phase-N-{slug}.md`, dev-frontend → area=FE / slug=`phase-N-fe-{slug}.md`).

---

## 3-1 Auto-skip judgment

- **케이스 A·B**: enter step 4 without printing the 3-2 output. Use the phase §3 implementation-target files or the Plan content received as input, as-is.
- **케이스 C**: print the 3-2 output, then get user confirmation.

**Safety net when the case marker is missing**: if main Claude did not state the literal _케이스 A_ or _케이스 B_ in the sub-agent call prompt, the called agent **treats it as 케이스 C** and prints the 3-2 output + gets user confirmation (auto-skip rule disabled). This safety net blocks the risk of generating code without user agreement when dispatch information is missing.

---

## 3-2 Implementation-scope output template (케이스 C only)

```markdown
## {영역명} 구현 범위

**프로젝트:** {project} ({유형})
**모듈:** {module} (해당 시)

### 구현 파일 목록

| #   | 구분 | {영역 고유 컬럼 1} | {영역 고유 컬럼 2} | 파일 경로 | 설명   |
| --- | ---- | ------------------ | ------------------ | --------- | ------ |
| 1   | NEW  | {값}               | {값}               | {path}    | {설명} |
| 2   | NEW  | {값}               | {값}               | {path}    | {설명} |
| ... | ...  | ...                | ...                | ...       | ...    |

### 제외 항목 (영역 외)

| #   | 파일   | 사유                       |
| --- | ------ | -------------------------- |
| 1   | {path} | {대상 에이전트명} 에이전트 대상 |

위 범위로 진행할까요?
```

> **Area-specific columns**:
> - BE (dev-backend): `레이어` (Controller/Service/Mapper/DTO/XML etc.)
> - FE (dev-frontend): `유형` (HTML/JS/CSS) + add `JS 패턴` + `AJAX 방식` headers at the top of the body

> The exact names and value domains of the area-specific columns/headers are specified in one line in the calling agent's body.

---

## Safety net + execution principles

| Item                                            | Policy                                                                                                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Condition disabling the auto-skip rule          | The literal `케이스 A` or `케이스 B` is absent from the first line of the call prompt → apply the 케이스 C safety net                                                                |
| Duty to state the case on the call prompt's first line | Responsibility of `.claude/skills/plan-loader/SKILL.md §9` — main Claude / plan-loader must state the case on the first line when calling a sub-agent                          |
| Handling files outside the area                 | Files not belonging to the calling agent's area (BE/FE) are listed as _미처리 항목_ in the step-5 report + main Claude dispatches them to the next phase (the calling agent does not auto-call — consistent with workflow S1+B) |
| Behavior after user confirmation / after auto-skip | Generate all files continuously (do not stop at each confirmation reply). Stop and report only when an error occurs.                                                              |

---

## Area-specific info the calling agent must state in its body

This shared file defines only the schema; the items below are stated _one line each in the calling agent's body_:

1. **Area name**: BE or FE
2. **Phase filename slug**: the filename pattern used when dev-plan frontmatter `phases[].file` dispatches to this agent (e.g. `phase-N-{slug}.md` / `phase-N-fe-{slug}.md`)
3. **3-2 area-specific columns**: the column names and value domains for the `영역 고유 컬럼 N` slots in the _3-2 implementation-scope output template_ above
4. **3-2 extra headers** (FE only): meta info such as JS 패턴·AJAX 방식 exposed at the top of the area body

For all schema other than these 4 items (case definitions, auto-skip judgment, safety net, execution principles), this shared file is the single source.
