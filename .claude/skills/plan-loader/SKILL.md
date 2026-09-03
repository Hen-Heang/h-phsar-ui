---
name: plan-loader
description: dev-planner 산출물(개발 계획서)의 schema 파싱·페이즈 디스패치·자동 모드 시퀀스를 담당하는 마이크로 스킬. develop·qa-test·pack 가 위임 호출한다. 사용자 발화 트리거 없음 — 오케스트레이터 스킬 내부 사용.
user-invocable: false
---

# plan-loader — development plan loader · phase dispatcher

> **Purpose**: loads the phase-split structure produced by dev-planner (`{{config.outputDir}}/plans/{과업번호}/`) or the legacy single document, and parses phase meta · BE/FE areas · automatic-mode entry conditions.
>
> **Invoked from**: `/develop` step 6, `/qa-test` plan reference, `/pack` phase-progress tracking.
>
> **External sharing**: deals only with the dev-plan deliverable schema — organization-agnostic. Ships paired with dev-planner.

---

## 0. Caller mapping (delegation contract)

This skill's phase-meta extraction is handled by a **deterministic script** — [`scripts/plan-manifest.mjs`](scripts/plan-manifest.mjs) parses the root document's YAML frontmatter, produces `plan-manifest.json`, and returns the validated JSON on stdout.

```
# 계획서 생성·변경 직후 1회 (manifest 생성 + 검증)
node .claude/skills/plan-loader/scripts/plan-manifest.mjs build --plan-root {{config.outputDir}}/plans/{과업번호}

# 이후 읽을 때 (기존 manifest 검증 + 반환)
node .claude/skills/plan-loader/scripts/plan-manifest.mjs validate --plan-root {{config.outputDir}}/plans/{과업번호}

# exit 0 = 정상(JSON stdout) / 1 = 검증 위반(stderr 목록) / 2 = 오류(한 줄 stderr)
```

Validation items: required keys (`id`·`slug`·`area`·`file`) / `area` is `BE`\|`FE` / duplicate phase ids / **phase documents actually exist** / `dependsOn` reference integrity / **dependency cycles** / anchor format · **duplicate anchors**.

> Anchors carry the original string **as-is** — no prefixing, no re-encoding. The original anchor already identifies the screen; if rewritten, "0 losses" can no longer be confirmed by set comparison.

> Previously, an LLM read a free-form markdown table (§5-1), and when the table broke, the area was guessed by a slug regex.
> As the guessing path effectively became the main path, BE/FE routing could go silently wrong. It was replaced with frontmatter + validation.
> **If validation fails, do not guess** — stop and hand the violation list to the caller as-is.

Body prose (§3·§4·§7 excerpts etc.) is still read by the LLM. What the script owns is **the phase list · areas · dependencies · file paths** only.

| Caller           | When invoked              | What this skill returns                            | What the caller does next              |
| ---------------- | ------------------------- | ------------------------------------------------- | -------------------------------------- |
| `/develop` step 6 | After scope + task number are fixed | Phase list + area (BE/FE) + dependencies + automatic-mode eligibility | Dispatch dev-backend/dev-frontend      |
| `/qa-test` entry | Right before TC generation | Phase slug · area · implementation-file mapping   | Pass TC + phase context to qa-tester   |
| `/pack` step 0   | When updating HANDOFF.md  | Phase progress state (done/in-progress/waiting)   | Update HANDOFF's Plan section          |

**One-way delegation**: plan-loader → returns results to the caller only. This skill does not invoke other skills.

---

## 1. Determining the task number (priority)

| Priority | Source             | Extraction method                    | Example                        |
| -------- | ------------------ | ------------------------------------ | ------------------------------ |
| 1        | Explicit argument  | Number included in the call arguments | `/develop webview 057` → `057` |
| 2        | Auto-extraction from the branch name | The **leading number** of the second segment of `feature/{두번째 세그먼트}/{사용자ID}` | `feature/057/bcj408` → `057`<br>`feature/057-phase2-auth/bcj408` → `057` |

- The explicit argument wins
- The second segment may be the task number alone (`057`) or a phase compound (`057-phase2-auth`) — the extended form for phase-level incremental deployment (`root-doc-schema.md` §10). In both forms take **only the leading number**.
- `feature/internal/*`, `hotfix/*` + no argument given → this skill returns skip
- Extraction impossible → return skip

---

## 2. Plan discovery (priority)

New structure → legacy, in order:

| Priority | Path                                             | Format                                  |
| -------- | ------------------------------------------------ | --------------------------------------- |
| 1        | `{{config.outputDir}}/plans/{과업번호}/{과업번호}_dev_plan.md` | Root document (phase-split) — **new official** |
| 2        | `{{config.outputDir}}/plans/{과업번호}_dev_brief_plan.md`      | Single document — **legacy**            |

Additional information for the new structure:

- Phase documents: `{{config.outputDir}}/plans/{과업번호}/phases/phase-*.md`
- The root document's **frontmatter `phases[]`** provides area (`area`) · slug (`slug`) · dependencies (`depends`) · document path (`file`)
  → extract·validate with `scripts/plan-manifest.mjs build|validate --plan-root <계획 디렉토리>`

---

## 3. The two progress modes

| Mode                 | Entry trigger               | How it proceeds                                     | User-utterance frequency                          |
| -------------------- | --------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| **Default mode** (serial) | `/develop {scope} {N}`      | One phase at a time, triggered by user utterances   | Phase count + 1 to start                          |
| **Automatic mode**   | `/develop {scope} {N} 자동` | BE·FE dispatched simultaneously in one message, phase sets auto-advance | 1 to start + 1 functional verification (+ 1 confirmation at N=3 accumulation) |

Automatic mode applies **only when the dev-planner §6-3 DTO field spec is usable as a contract**. "Usable" is judged as all 3 of the following holding — not a subjective quality assessment:

1. Section §6-3 exists.
2. Every DTO this phase set touches has **at least 1** field row.
3. Those rows' type and required-flag cells are not empty (`—`·`TBD`·`미정` count as empty).

If even one fails, **proceed in default mode and state the failed item as the reason.** In automatic mode, sub-agents trust this spec as the signature contract and build BE·FE simultaneously — if cells are empty, each guesses differently and two mismatched sets of code come out. That is why there is no middle state of "thin, but present, so proceed".

---

## 4. Core principles (default mode)

| Principle                            | Definition                                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Phase = user-acceptance unit         | The essence of dev-planner R10 — the work-split unit coincides with the user-acceptance unit                     |
| Only one phase at a time             | Main Claude dispatches only one phase to a sub-agent at a time. No auto-advancing                                |
| Next phase = explicit user utterance | After printing the sub-agent result, pause naturally → the user decides the next action with `phase N` / `다음` / `/qa-test` / `커밋해줘` etc. |
| No acceptance vocabulary             | Main Claude only prints the sub-agent result as-is — the words _검수_ / _검수 게이트_ / _데모_ / _시연_ are forbidden |
| qa-test·commit·review = explicit user invocation | No automatic entry by main Claude                                                                        |

---

## 5. Core principles (automatic mode — scenario C opt-in)

| Principle                    | Definition                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| The plan is the contract     | The dev-planner deliverable (§6-3 DTO field spec + phase §4 signatures) is the single source of truth. When drift is found, *reinforcing the plan* is the root-cause fix |
| Always parallel              | Invoke the BE phase and FE phase of the same phase set simultaneously via multi-Agent invoke in one response. The dependency column only matters at functional-verification time |
| Phase sets auto-advance      | One set (BE + FE) finishes → the next set is dispatched automatically. No user-utterance trigger needed                        |
| N=3 accumulation safety net  | After 3 phase sets pass automatically, ask the user _"진행 OK?"_ once. Tasks with 1–2 sets never trigger it                     |
| Stop immediately on RED      | BE test run RED, or sub-agent code generation failure → brake the auto-advance → report to the user                            |
| Functional verification = performed by the user | After all phases finish, the user verifies by clicking in the browser. **The qa-planner §5-2 functional verification checklist is the official gate** |
| No acceptance vocabulary     | Even in automatic mode, the per-phase words _검수_ / _데모_ are forbidden. Only one functional-verification guidance at the end |

---

## 6. Dispatch sequence (default mode)

```
USER → /develop {scope} {과업번호}
MAIN ← scripts/plan-manifest.mjs validate --plan-root {{config.outputDir}}/plans/{과업번호} → phases[] JSON
 (exit 1 = 검증 위반 → 위반 목록 출력 후 멈춤. 추측하지 않는다)
MAIN → 페이즈 목록 출력 + "어느 페이즈부터 시작할까요?" 질문
USER → "phase 1"
MAIN ← 해당 페이즈의 area 필드 확인 → BE 또는 FE 판정
MAIN ← phases/phase-N-{slug}.md read (페이즈 §3·§4·§7·§9)
MAIN → dev-backend (영역=BE) 또는 dev-frontend (영역=FE) 디스패치
 (입력: 페이즈 문서 경로 + 슬러그 + 영역 + §3·§4·§7 본문)
SUB ← 코드 생성 + §8 DoD 자체 보고
SUB → 메인에 결과 반환 (생성 파일 + DoD 충족 표 + 미처리 항목)
MAIN → 사용자에게 sub-agent 결과 그대로 출력
[자연 멈춤 — 사용자 다음 발화 대기]

USER 자유 선택:
 • "phase 2" / "다음" → 다음 페이즈 디스패치 (위 흐름 반복)
 • "/qa-test" → qa-tester 별도 호출
 • "커밋해줘" / git 스킬 → 페이즈 단위 커밋
 • "/code-review" → 코드 리뷰
 • 침묵 → 세션 종료, /pack 실행 권장
```

---

## 7. Dispatch sequence (automatic mode — scenario C)

> **Entry condition**: the user's utterance includes the word `자동` / `auto` (`/develop {scope} {N} 자동`).
> If the dev-plan does not exist, or the §6-3 DTO field spec fails the 3 checks in §3, refuse automatic mode → default-mode fallback + reason.

```
USER → /develop {scope} {과업번호} 자동
MAIN ← {{config.outputDir}}/plans/{과업번호}/{과업번호}_dev_plan.md read
 (plan-manifest.mjs validate 통과 + §6-3 DTO 필드 명세 존재 검증)
MAIN ← §6-3 미존재 → 기본 모드 fallback + "/dev-plan 재실행으로 §6-3 보강 권장"
MAIN → 페이즈 set 그룹핑 (의존 컬럼 기준) — set 1 = {phase-1-be, phase-2-fe-* …}
MAIN → 페이즈 목록 출력 + "자동 모드 진입 — 첫 페이즈 set 디스패치 시작"

[페이즈 set 1]
MAIN ← phases/phase-1-be.md + phases/phase-2-fe-*.md read (set 멤버 모두)
MAIN → dev-backend + dev-frontend 한 응답에 동시 디스패치 (multi-Agent invoke)
SUB-BE ← 코드 생성 + 모듈 테스트 실행 → GREEN 결과 보고
SUB-FE ← 코드 생성 → 완료 보고
MAIN → set 1 결과 그대로 출력 (BE GREEN / FE 완료)

[자동 진행]
MAIN ← 다음 페이즈 set 검사
 - 다음 set 존재 → 자동 디스패치 (위 흐름 반복)
 - N=3 누적 도달 → "여기까지 OK? 다음 set 진행할까요?" 1회 확인
 - 모든 set 종료 → 기능 검증 안내 (qa-planner §5-2 체크리스트 출력)

[RED 시 즉시 멈춤]
MAIN ← BE 테스트 RED 또는 FE 코드 생성 실패 감지
MAIN → 자동 진행 brake + 실패 페이즈·실패 사유 출력 + 사용자 발화 대기

[기능 검증 — 모든 페이즈 종료 후]
MAIN → qa-planner §5-2 기능 검증 체크리스트 출력
USER → 브라우저 시연으로 항목별 통과/실패 확인
USER → "/qa-test" / "커밋해줘" / "/code-review" 등 자유 선택
```

---

## 8. Automatic-mode safety-net rules

| Situation                 | Main Claude's action                                  |
| ------------------------- | ----------------------------------------------------- |
| No dev-plan               | Refuse automatic mode + point to `/dev-plan {N}`      |
| dev-plan exists + §6-3 missing | Refuse automatic mode + "§6-3 DTO 필드 명세 보강 후 재실행" |
| dev-plan exists + §6-3 present but no field rows · empty type/required cells | Refuse automatic mode + state which DTO and which cells are empty, then "보강 뒤 재실행" (§3 checks 2·3) |
| Phase set 1 finishes      | Auto-advance (no confirmation utterance)              |
| Phase set 2 finishes      | Auto-advance                                          |
| Phase set 3 finishes      | One user confirmation "여기까지 OK?" — wait for an utterance |
| BE tests RED              | Immediate brake — print the RED result + wait for the user |
| FE code generation fails  | Immediate brake — print the sub-agent error + wait for the user |
| All phases finish         | Functional verification guidance (qa-planner §5-2) — no per-phase acceptance vocabulary |

---

## 9. Sub-agent dispatch input standard

| Area | sub-agent      | Required input                                                                                                          |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------------------- |
| BE   | `dev-backend`  | Phase document absolute path + slug (`be`·`be-{레이어}`) + **§3·§4·§7 body excerpts** + **explicit case A/B**          |
| FE   | `dev-frontend` | Phase document absolute path + slug (`fe-{화면}`) + screen id (frontmatter `screens[]`) + **§3·§4·§7 body excerpts** + **explicit case A/B** |

### On parsing failure

If `plan-manifest.mjs` exits non-zero, **stop without guessing.**

- exit 1 (validation violation) → print the stderr violation list to the user as-is, and point to re-running `/dev-plan {과업번호}`.
- exit 2 (parse error) → means the root document's frontmatter is broken. Same guidance.

> The previous version's slug-regex fallback (`^be` → BE, `^fe` → FE) was removed. If the area is guessed, a BE phase can
> go to dev-frontend with nobody noticing — better to stop than to be silently wrong.

### Why body excerpts are mandatory

- Main Claude excerpts the phase's §3 implementation targets · §4 per-file details · §7 Task breakdown into the prompt → saves sub-agent context + missing items can be discovered early at dispatch time
- The sub-agent consults the excerpted body first / on omission falls back to its own Read of the phase document's absolute path
- If excerpting is hard or the phase document's §3·§4·§7 are very short — main Claude may substitute the _path-only + sub-agent self-read_ pattern

### Responsibility for explicit case marking

**Main Claude's responsibility**: state `케이스 A` or `케이스 B` on the **first line** of the sub-agent invocation prompt.

```
케이스 A — dev-plan 페이즈 디스패치
페이즈 문서: {{config.outputDir}}/plans/8888/phases/phase-1-be.md
슬러그: be
영역: BE
{페이즈 §3·§4·§7 본문 발췌}
```

**Sub-agent safety net**: if the case marking (A or B) is missing, **treat as case C** → print the 3-step gate and confirm with the user. This blocks the risk of generating code without user agreement when dispatch information is missing.

Explicit `케이스 A` = activates the sub-agent's rule to auto-skip the 3-step gate (passing the step 4.5 phase-split review gate = implementation scope agreed).
Explicit `케이스 B` = activates ExitPlanMode passage as the auto-skip justification.

---

## 10. Branch when no plan exists

```
 개발 계획서가 없습니다:
 - 신규: {{config.outputDir}}/plans/{과업번호}/{과업번호}_dev_plan.md
 - 레거시: {{config.outputDir}}/plans/{과업번호}_dev_brief_plan.md

 1) 계획서 없이 바로 개발 진행 (소규모 ad-hoc)
 2) 먼저 계획서 생성 → /dev-plan {과업번호}
```

- **Choice 1**: proceed to step 7. Later, on entering code writing: Plan Mode → pass ExitPlanMode → BE/FE classification → dispatch dev-backend·dev-frontend (case B)
- **Choice 2**: point to running `/dev-plan {과업번호}`, then the calling skill ends

---

## 11. External sharing

- This skill is paired with the dev-planner deliverable schema — ship them together.
- Organization-agnostic. It follows only dev-planner's frontmatter `phases[]` / §6-3 / phase §3·§4·§7 schema.
- `scripts/plan-manifest.mjs` ships with this skill (the **single** implementation of the frontmatter contract — no other layer builds the same parser again).
- `/develop`, `/qa-test`, `/pack`, `/dev-autopilot` all invoke this skill's script, ensuring consistent phase-info reads.

---

## 12. Manifest-first principle

`{{config.outputDir}}/plans/{과업번호}/plan-manifest.json` is the single source for routing (phase ids · BE/FE · dependencies · document paths · screens · anchors). If absent, create it with `build`; if present, confirm with `validate` before use.

The phase Markdown is for reading **design intent and implementation detail** — routing information is not inferred from it. In particular, **after validation fails, do not fall back to the prose and guess.** Stop and hand the violation list to the caller.
