---
name: dev-interview
description: 기획서·주제를 자율 인터뷰로 구체화해 업무↔코드·DB 매핑이 담긴 11섹션 개발 브리프를 생성한다(선탐색 서브에이전트 병렬 위임, 질문은 1:1 대화형). 사용자가 "dev-interview", "개발 인터뷰", "요구사항 정리", "기획서 분석", "뭘 만들어야 할지 정리해줘" 등을 언급하면 이 스킬을 사용한다.
argument-hint: "[기획서 경로 | 주제]"
---

# /dev-interview [기획서 경로 | 주제]

기획서·주제를 받아 **자율 인터뷰**로 업무↔코드·DB 매핑을 완성하고 **11섹션 개발 브리프** (+ Q&A 로그 부록) 를 생성한다.

**Composable 오케스트레이터** — 토픽별 탐색은 sub-agent (code-investigator·db-meta-manager·security-auditor) 로, 문서 파싱·출력 스키마는 sub-skill / references 로 위임. 본 스킬은 dispatch + 통합 + 1:1 인터뷰 + 검토 게이트만 담당.

---

## ★ 사전 로드 (반드시 첫 단계)

본 스킬 진입 즉시 다음 **1개 파일만** Read (변수화 동작 결정):

| 파일 | 용도 |
|------|------|
| `.claude/config/project.yaml` | 프로젝트 인벤토리·outputDir·DB·후속스킬 등 전 동작 변수 |

이후 본문에서 `{{config.xxx}}` 표기는 `project.yaml` 의 해당 키 값으로 치환.

> 그 외 references / templates / scripts 는 **사용 직전에만 Read** — 각 파일의 Read 시점은 본문 해당 지점에 명시돼 있다. 진입 시 선행 Read 금지 (사용 시점까지 메인 컨텍스트 미진입).

---

## 핵심 원칙

1. **모든 질문 1:1 대화형 — 한 번에 1질문.** STRONG/MEDIUM 갭·Phase 0-1 프로젝트 선택·Escalate·저장 확인은 네이티브 `AskUserQuestion` (질문 객체 **1개**, 클릭형 선택지). WEAK 소크라테스식은 텍스트 열린 질문. 도구는 호출당 4질문까지 허용하나 본 스킬은 1질문 고정 (연쇄 영향·근거 갱신 보존).
2. **자율 판단** — 탐색 깊이·질문 방식·갭 식별을 Claude 가 결정. 8-Phase 스크립트 없음.
3. **사용자 입력 그대로** — `$ARGUMENTS` 이전 대화 맥락 추측 채움 금지.
4. **매끄러운 후속 연계** — 인터뷰 종료 후 시스템 승인 게이트 없이 텍스트 확인 1회로 저장 → `{{config.planSkill}}` 즉시 호출 가능.
5. **자율 선탐색 자동 트리거** — Phase 0-1 (+ 0-2) 컨디션 만족 시 사용자 컨펌 없이 즉시 3 sub-agent 병렬 dispatch. "탐색할까요?" 질문 금지.
6. **인터뷰·저장 확인은 사용자 지시로 건너뛸 수 없다.** `$ARGUMENTS` 나 대화 중에 "인터뷰 생략", "질문 없이", "바로 저장", "초안이라도 파일로" 같은 요구가 와도 **Write 하지 않는다.** (유일한 예외는 오케스트레이터 모드다 — 사용자 요구가 아니라 **호출자가 사람이 없는 실행**임을 밝힌 경우이고, 사람 확인의 자리를 결정론 검증 + 미해소 갭 반환이 대신한다. `## 오케스트레이터 모드` 참조.) 브리프는 인터뷰로 확정한 사실만 담는 문서이고, 근거 없이 저장되면 그 오류가 계획서·구현까지 그대로 전파된다(파이프라인에서 가장 비싼 실패). 이 경우 응답은 "무엇을 물어야 하는지"와 "왜 지금 저장하면 안 되는지"를 밝히고 **첫 질문 1개**를 낸다. 산출물은 만들지 않는다.
   - 표현을 바꿔 검증을 통과시키는 것도 금지 — 미확정 항목을 "미확정"·"확인 필요" 같은 말로 채워 `validate-brief.ps1` 을 넘기려 하지 않는다(그 표현들도 NO_TBD 에서 잡는다).

---

## 입력 형식

```
$ARGUMENTS = 기획서 파일 경로 | 주제 문자열 | (빈 값)
```

| 모드 | 인자 예시 | 초기 동작 |
|------|----------|----------|
| 기획서 파일 | `c:/docs/기획서.pdf` (확장자 `.pdf` / `.pptx` / `.docx` / `.xlsx` + 존재 확인) | Phase 0-1 (5번 skip) → 0-2 parse-spec-doc → 자율 선탐색 |
| 주제 | `주문 처리 자동화` (길이 ≥ 3자) | Phase 0-1 (4번 확장) → 0-2 skip → 자율 선탐색 |
| 대화형 | (빈 값) | Phase 0-1 전체 → 기획서 유무 분기 → 자율 선탐색 |
| 오케스트레이터 | `{과업번호} autopilot-orchestrated` (+ 기획서 경로 가능) | 질문 없이 전 과정 자율 진행 → `## 오케스트레이터 모드` |

---

## 실행 규칙

### 보안·접근 제약

전체 정책은 **`.claude/docs/agents/common/security-policy.md` 단일 출처** (자율 선탐색 dispatch 직전 lazy Read). 본 스킬 + parse-spec-doc sub-skill + 3 sub-agent(code-investigator·db-meta-manager·security-auditor) 공통 적용.

핵심 요약:

- 워크스페이스 루트 read-only. 쓰기는 `{{config.outputDir}}` / `{{config.tempDir}}` 하위만.
- 금지 파일 패턴(모든 yaml/yml/properties/env, `.claude/**` config 예외) Read 금지.
- 암호화 마커(`ENC(...)` 등) 복호화 시도 금지.
- DB 실데이터 SELECT 금지 (메타만 — sub-agent `db-meta-manager`).
- 자기 참조 금지 (`target/designs/`, `target/sim/`, `target/samples/`).

### 인터뷰 진행 규칙

- 모든 질문 1:1 (한 번에 1질문). 갭 묶음 금지. STRONG/MEDIUM 갭은 `AskUserQuestion`, WEAK 갭은 텍스트 열린 질문.
- 가설 기반 질문은 근거 1줄 제시.
- 코드/DB/기획서에서 파악 가능한 내용은 질문하지 않음 — 가설 제시 후 확인만.
- "별첨 스펙 필요" 단정 전 sub-agent `code-investigator` 호출.

---

## 전체 플로우

```
1. 인자 해석 → 모드 결정
2. Phase 0-1: 기본 정보 수집 (references/phase01-checklist.md)
3. Phase 0-2: 기획서 파싱 (Skill(parse-spec-doc) — 파일 있을 때만)
4. **자율 선탐색 (자동 트리거)** — Phase 0-1 (+ 0-2) 직후 다음 응답에서 사용자 확인 없이 즉시 3 sub-agent 병렬 dispatch (code-investigator / db-meta-manager / security-auditor)
5. 갭 식별 + 1:1 질문 (한 갭당 한 메시지, 라운드 메타 누적)
6. 모든 갭 해소 → 11섹션 브리프 임시 작성 (사용자 미노출)
6.1 Stage 1: 형식 게이트 self-check (references/brief-schema.md)
6.2 Stage 2: reviewerAgent 정성 검토 (references/codex-output-contract.md)
    ├─ RED + 라운드 < 3: 재인터뷰 1-by-1 → 6 복귀
    ├─ RED + 라운드 = 3: 사용자 escalate
    ├─ YELLOW: 코멘트 노출 후 진행
    └─ GREEN: 진행
6.5 Q&A 로그 부록 자동 생성 (templates/qna-log-appendix.md)
6.6 사용자에게 브리프 + 부록 + 검토 결과 제시 → "이 내용으로 저장할까요?" 1회 확인
7. 사용자 OK → Write `{{config.outputDir}}/{taskId}_dev_brief.md`
8. 임시 파일 정리 안내 + 다음 단계 안내 (references/completion-hooks.md)
```

**총 예산**: 선탐색 5~10분 + 인터뷰 10~30분 + Stage 2 검토 5~15분 = **약 20~55분**

---

## Phase 0-1: 기본 정보 수집

5항목을 **1개씩 순서대로** 질문. 항목 1(프로젝트)은 `AskUserQuestion` 클릭형(options = `{{config.projects[].name}}`), 항목 2~5는 텍스트 질문. 상세 항목·도구 호출 규격·모드별 사전 보유는 **`references/phase01-checklist.md`** 참조.

---

## Phase 0-2: 기획서 파싱 (parse-spec-doc 위임)

```
Skill(skill="parse-spec-doc",
      args="filePath={경로} outputDir={{config.tempDir}}/pre_exp_{N}/ taskNumber={N}")
```

반환 status 별 분기:
- `success` → parsed_doc.txt 경로 사용 (자율 선탐색의 한 입력)
- `ocr_required` / `empty_text_likely_image_pdf` → 사용자에게 OCR 또는 화면 설명 요청
- `error_*` → 사용자에게 정정 요청

실패 처리 로직은 sub-skill 내부 책임. 본 스킬은 status 분기만.

> 기획서는 내부 문서이므로 민감정보 취급 대상 아님.

---

## 자율 선탐색 (2단 분리: 메인 → sub-agent 직접 dispatch)

**자동 트리거 — 사용자 승인 불요.** Phase 0-2 완료 (또는 기획서 없을 시 Phase 0-1 종료) 직후 **메인은 다음 응답에서 즉시** 3 sub-agent 를 **단일 응답 내 다중 Agent 호출 블록**으로 병렬 dispatch 한다.

### 자동 트리거 규칙 (필수)

- **컨디션**: Phase 0-1 완료 (5항목 답변 누적) **AND** (기획서 모드일 경우 Phase 0-2 success / OCR fallback 완료).
- **타이밍**: 컨디션 만족 직후 메인의 다음 단일 응답 안에서 3 Agent 호출. 그 응답에는 다른 텍스트·질문 없이 dispatch 만 포함 (한 줄 진행 안내 허용).
- **사용자 확인 금지**: "탐색 시작할까요?" / "Y/N?" 같은 컨펌 질문 금지. dispatch 가 곧 진행 신호.
- **skip 금지**: 3 sub-agent 중 하나라도 빠뜨리면 통합 단계 결과 불완전. project.yaml 의 `db.vendor` 미설정 등 사전 미충족이면 그 agent 만 skip + 통합 단계에 "{agent} skipped — {사유}" 표기.
- **재호출 금지**: 동일 taskNumber 로 중복 dispatch 금지. 결과 미흡 시 통합 단계 §3 inline Grep 백업 또는 1:1 라운드에서 보강.

### 책임 분리 원칙

- **메인 (dev-interview)** = sub-agent 3개 dispatch + 결과 통합 + 자기 담당 섹션 작성. agent 내부 playbook 모름.
- **sub-agent** = `.claude/agents/{code-investigator,db-meta-manager,security-auditor}.md` 정의에 따라 playbook 실행 (references/templates/scripts Read 포함) + 마크다운 결과 반환 + **자기 토픽이 채우는 브리프 섹션 초안**.

### 섹션 초안까지 받는다 (탐색 결과를 두 번 쓰지 않는다)

각 에이전트는 자기 토픽 리포트에 **담당 브리프 섹션 초안**을 함께 실어 반환한다. 담당표는 `references/brief-schema.md` 의 「섹션별 작성 주체」 단일 출처.

에이전트가 리포트만 돌려주면 메인이 같은 내용을 브리프 섹션으로 다시 옮겨 쓴다 — 병렬로 얻은 결과를 직렬로 한 번 더 쓰는 셈이고, 실측에서 그 재작성이 선탐색보다 몇 배 긴 구간이었다. 초안을 스키마 모양으로 받으면 메인은 통합·교차 판단·자기 섹션에만 시간을 쓴다.

- 각 초안은 **섹션 id 로 라벨링**한다(`## 5. 코드값 사전` 처럼 스키마 제목 그대로). 라벨이 스키마와 같아야 병합이 결정론이 된다.
- 초안은 **근거 있는 사실만** 담는다. 모르는 항목은 비워 두고 갭으로 신고한다 — 초안이 추측을 담으면 그 추측이 브리프를 통과해 계획서까지 간다.
- 병합 후 `scripts/validate-brief.ps1` 이 섹션 순서·필수 제목을 검사하므로, 라벨이 틀어진 병합은 조용히 통과하지 않고 실패한다.

### Dispatch 템플릿

각 Agent 호출은 `subagent_type` 으로 직접 지정. prompt 는 입력 계약(key=value) + 담당 섹션만 전달:

dispatch 직전 기획서 파싱 결과(없으면 사용자 개요)와 대상 프로젝트의 `guideline.frontend`를 대조해 `workType`을 결정한다. 화면만이면 `frontend`, 서버만이면 `backend`, 양쪽이면 `fullstack`, 근거가 부족하면 `unknown`. 이 값은 에이전트 skip에 사용하지 않고 `code-investigator`의 탐색 범위에만 사용한다.

> ```
> Agent(subagent_type="code-investigator",
>       prompt="primary={대상 프로젝트} related={연동 후보 JSON} topicHints={키워드 JSON} taskNumber={N} workType={frontend|backend|fullstack|unknown}
>               briefSections=4,7,10")
> Agent(subagent_type="db-meta-manager",
>       prompt="topicHints={키워드 JSON} taskNumber={N}
>               briefSections=3-4,5")
> Agent(subagent_type="security-auditor",
>       prompt="primary={대상 프로젝트} related={연동 후보 JSON} taskNumber={N}
>               briefSections=6,8-1")
> ```
>
> `briefSections` 는 그 에이전트가 초안을 쓸 섹션이다. 리포트 본문 뒤에 `--- 브리프 섹션 초안 ---` 구분선을 두고 스키마 제목 그대로 이어 붙이도록 지시한다.

3 sub-agent: `code-investigator` · `db-meta-manager` · `security-auditor`.

> **금지 패턴 (anti-pattern)**: `Skill(skill='explore-*', args='...')` 또는 `Agent(subagent_type='explore-*', ...)` — 둘 다 deprecated. 반드시 신규 직업명(`code-investigator`/`db-meta-manager`/`security-auditor`) subagent_type 사용.
> **금지 패턴 (anti-pattern)**: `"Read .claude/agents/{job}.md and execute"` — agent dispatch 가 아니라 파일 Read. 격리 격실 깨짐.
> **금지 패턴 (anti-pattern)**: "탐색 시작해도 될까요?" 사용자 컨펌 질문. 자율 선탐색은 자동 트리거 — 컨디션 만족 시 즉시 dispatch.

### 통합 단계 (메인 스레드)

3 응답 수신 후:
0. **도메인 색인 우선 대조** — `.claude/docs/domain/index.md` 가 있으면 통합 전에 관련 업무영역·모듈 페이지(`docs/domain/modules/<slug>.md`)·`common.md` 를 먼저 읽어, 색인에 이미 밝혀진 룰·흐름은 갭·질문 후보에서 제외한다(중복 질문 방지). 색인이 없으면 건너뛴다.
1. **교차 점검** — 토픽 격리로 놓친 신호 1회 보강 (코드↔보안↔DB 매칭 확인). 특히 `security-auditor`의 `잠재 갭 트리거`를 파싱된 기획서(없으면 사용자 개요)와 대조해, 요구사항에 이미 반영된 항목은 제외하고 미언급 항목만 실제 갭으로 확정한다. Security 응답만으로 "기획서 미언급"을 단정하지 않는다.
   > **섹션 초안을 나눠 받으면 교차 판단이 이 단계로 모인다.** 각 에이전트는 자기 섹션만 봤으므로 §4 매핑과 §5 코드값이 어긋나는 것을, 또 §6 보안 스펙이 §4 엔드포인트와 맞지 않는 것을 아무도 못 본다. 여기가 그것을 보는 유일한 자리다 — 초안을 그대로 이어 붙이고 넘어가면 그 검사가 사라진다.
2. **자주 놓치는 토픽 교차** — `references/missing-topic-reminders.md` Read 후 8항목 대조. 3 결과 어디에도 없으면 갭 등록.
3. **메인 inline Grep 백업** — 좁은 범위 누락 보강 시에만.
4. **섹션 초안 병합** — 라벨(섹션 제목)대로 스키마 순서에 꽂고, 메인 담당 섹션(§1·§2·§3-1~3-3·§8 나머지·§9·§11)을 채운다. 초안이 없는 섹션은 비워 두지 않고 메인이 쓴다 — 담당 에이전트가 skip 됐으면 그 사실을 갭으로 남긴다.
5. gap list 확정 → 1:1 라운드 진입.

### 재사용 (선택적 패턴 — 권고)

이 4 위임 컴포넌트 (`parse-spec-doc` sub-skill + 3 sub-agent `code-investigator`/`db-meta-manager`/`security-auditor`) 는 dev-interview 전용 아니다. `dev-plan` · `code-review` · `develop` 에서 동일 패턴으로 호출 가능:
- `parse-spec-doc` → `Skill(skill='parse-spec-doc', args='...')`
- `code-investigator` → `Agent(subagent_type='code-investigator', prompt='primary=... related=... topicHints=... taskNumber=... workType={frontend|backend|fullstack|unknown}')`
- `db-meta-manager` → `Agent(subagent_type='db-meta-manager', prompt='topicHints=... taskNumber=...')`
- `security-auditor` → `Agent(subagent_type='security-auditor', prompt='primary=... related=... taskNumber=...')`

> **선택적 패턴**: 본 항목은 권고 — 다른 스킬 본문에 강제 인터페이스 없음. 각 호출 스킬이 필요 시점에만 dispatch 한다. 본 스킬의 자율 선탐색 자동 트리거 규칙(컨디션·재호출 금지 등)은 dev-interview 내부 정책이므로 다른 스킬에서 재사용 시 해당 스킬의 정책으로 재정의한다.

---

## 1:1 질문 라운드

자율 선탐색 결과 + 사용자 입력에서 갭 식별. **갭마다 한 번에 1질문**. STRONG/MEDIUM 갭은 `AskUserQuestion` 클릭형(추천=`options[0]`), WEAK 갭은 텍스트 열린 질문 — "그 외" 여지는 도구 Other 선택지가 보장.

- 라운드 전달 방식·도구 호출 규격 → `references/round-header-formats.md`
- 갭 우선순위·카테고리·라운드 메타·종료 조건 → **`references/gap-categories.md`**

---

## Stage 1 — 형식 게이트 (결정론 + self-check)

모든 갭 해소 후 11섹션 브리프를 **임시 파일로 작성** (예: `{{config.tempDir}}/brief_draft_{N}.md`, 사용자 미노출).

**Layer 3 script 선행 검증**:

```powershell
powershell .claude/skills/dev-interview/scripts/validate-brief.ps1 `
     -BriefFile {{config.tempDir}}/brief_draft_{N}.md
```

`scripts/validate-brief.ps1` 가 9개 체크(섹션 헤더·메타 표·시스템 결정·하위 절·미결사항·Phase·TBD 금지·메타 footer·Q&A 부록)를 결정론 검증하여 `{pass, failed, checks: [...]}` JSON 을 반환한다.

- `pass: false` → `checks[]` 의 실패 항목 보정 후 재실행 (자율 선탐색 추가 또는 1-by-1 추가 질문). 모두 통과(`pass: true`) 전까지 Stage 2 진입 금지.
- `pass: true` → `references/brief-schema.md` 의 self-check 잔여 항목(근거 1줄 충족·정성 일관성)을 본인이 추가 검토 후 Stage 2 진입.

> 결정론 검증으로 LLM 추론 부담 감소 + 동일 입력 → 동일 PASS/FAIL 보장.

---

## Stage 2 — 정성 검토 (reviewerAgent)

`.claude/config/project.yaml` `reviewerAgent` 값에 따라 분기 (키 없으면 `none`):

- `codex:rescue` / `claude-sonnet` / 기타 agent → Agent tool, `subagent_type` 에 해당 `reviewerAgent` 값 위임.
- `none` → Stage 2 skip → Stage 1 통과 시 6.6 사용자 제시로 바로 진행.

출력 계약·점검 관점·등급 기준 → **`references/codex-output-contract.md`**.

---

## 재인터뷰 1-by-1 루프 (Stage 2 RED 시)

```
헤더 알림: "검토 결과 RED. 재인터뷰 {n}/3 라운드. 보정 갭 {k}개"
    ↓
재인터뷰_갭 리스트 추출
    ↓
갭 1번 → 한 번에 1질문 (STRONG/MEDIUM=AskUserQuestion, WEAK=텍스트, 라운드 메타 누적)
    ↓
사용자 응답 → 해당 §섹션 갱신 → 다음 갭 (모든 갭 해소까지)
    ↓
브리프 갱신 → Stage 1 → Stage 2 재실행
    ↓
GREEN/YELLOW → 6.6 진행
RED + 라운드 < 3 → 다음 라운드
RED + 라운드 = 3 → escalate
```

재인터뷰 라운드도 Q&A 로그 메타에 누적. "반영" 컬럼에 `§X (재인터뷰 R{n})` 표기.

### Escalate (3라운드 후 RED)

남은 RED 코멘트를 텍스트로 노출한 뒤 `AskUserQuestion` 1질문:

```jsonc
{
  "questions": [{
    "header": "진행 방식",
    "question": "3라운드 후에도 RED. 남은 항목: {RED 코멘트 요약}. 어떻게 진행할까요?",
    "multiSelect": false,
    "options": [
      { "label": "§9 기록 후 저장 (추천)", "description": "남은 RED 항목을 §9 미결사항으로 기록하고 저장" },
      { "label": "인터뷰 계속", "description": "4라운드+ 재인터뷰 진행" },
      { "label": "중단", "description": "저장하지 않고 종료" }
    ]
  }]
}
```

라운드 카운트는 내부 변수 (대화 휘발, 파일 저장 없음).

---

## 사용자 제시 + Q&A 로그 부록 (Stage 2 통과 후)

11섹션 본문 + Q&A 로그 부록을 사용자에게 텍스트로 제시:

```
## 인터뷰 결과 — {과업번호} {주제}

[11섹션 브리프 본문 — references/brief-schema.md 스키마]

## 인터뷰 Q&A 로그 (부록)

[라운드 메타 표 — templates/qna-log-appendix.md 형식]

---

**검토 등급**: GREEN | YELLOW
{YELLOW 시: MED/LOW 코멘트 요약 (관점별 1줄)}
```

> 11섹션 본문 + Q&A 부록 + 검토 등급은 **텍스트로 먼저 전부 제시** (긴 내용은 도구 옵션에 담지 않음). 제시 직후 저장 확인만 `AskUserQuestion` 1질문:

```jsonc
{
  "questions": [{
    "header": "저장",
    "question": "이 내용으로 {{config.outputDir}}/{taskId}_dev_brief.md 에 저장할까요?",
    "multiSelect": false,
    "options": [
      { "label": "저장 (추천)", "description": "본문 + 부록 그대로 저장 후 다음 단계 안내" },
      { "label": "수정 요청", "description": "수정 사항 입력 → 반영 후 재제시" }
    ]
  }]
}
```

**시스템 승인 게이트 없음** — Plan Mode 미사용. 확인 1회로 마감하여 `{{config.planSkill}}` 즉시 연계.

사용자 응답:
- "저장" → `Write {{config.outputDir}}/{taskId}_dev_brief.md` (본문 + 부록 모두 포함)
- "수정 요청" 또는 Other(자유 입력) → 해당 섹션 갱신 후 재제시

> **Write 는 이 확인 응답 뒤에만 일어난다.** 확인을 받지 못한 상태(사용자가 답하지 않음·"바로 저장" 요구)에서는 파일을 만들지 않는다 — 핵심 원칙 6. 미확정 항목이 남아 있으면 저장 대상이 아니라 **질문 대상**이다.
>
> 오케스트레이터 모드(`autopilot-orchestrated`)에서는 이 확인 대신 `validate-brief.ps1 pass: true` 가 저장 조건이고, 미해소 STRONG 갭은 질문이 아니라 **호출자 반환 대상**이다 — `## 오케스트레이터 모드`.

---

## 오케스트레이터 모드

`$ARGUMENTS` 에 `autopilot-orchestrated` 가 있으면 사람이 없는 실행이다. 이 모드는 **질문을 없애는 것이 아니라 답을 근거로 바꾸는 것**이다 — 근거 없는 브리프 금지(핵심 원칙 6)는 그대로다.

- **`AskUserQuestion` 호출 금지.** 서브에이전트 세션에는 그 도구가 없고, 있어도 답할 사람이 없다. Phase 0-1 프로젝트 선택은 `$ARGUMENTS`·기획서·`project.yaml` 의 `projects[]` 에서 결정하고 근거를 남긴다.
- **자율 선탐색 3 sub-agent 병렬 dispatch 는 그대로 필수** (`code-investigator`·`db-meta-manager`·`security-auditor`). 무인이라고 줄이지 않는다 — 빠뜨리기 쉬운 쪽이 하필 `security-auditor` 이고, 개인정보·외부 전송·복호화가 걸린 과업에서 그 결과가 §6·§8-1 을 채운다. `briefSections` 도 그대로 전달한다: 이 모드에는 인터뷰 라운드가 없어 초안이 곧 그 섹션의 최종형에 가장 가깝고, 메인이 다시 옮겨 쓸 이유가 더 없다.
- **갭 해소 = 근거 제시.** STRONG/MEDIUM 갭은 소스·기획서·3 에이전트 보고에서 해소하고, 갭마다 `근거 file:line` 을 남긴다. Q&A 부록은 이 모드에서 **해소 로그**가 된다: 라운드별 질문·답 대신 `갭 → 결론 → 근거(file:line)` 한 줄씩. 부록 자체를 생략하지 않는다.
- **저장 확인 `AskUserQuestion` 자리**: `scripts/validate-brief.ps1` 의 `pass: true` 다. 절차는 Stage 1 과 같다 — 임시 draft(`{{config.tempDir}}/brief_draft_{N}.md`)에 쓰고 그 draft 를 검증하고, `pass: false` 면 실패 항목을 고쳐 재검증한다. 최종 경로 Write 는 `pass: true` 이후에만 한다(검증한 내용과 저장한 내용이 같아야 한다).
- **검증 영수증을 남긴다**: 최종 Write 뒤 저장된 파일로 검증을 한 번 더 돌리고 그 JSON 출력을 `{{config.tempDir}}/brief-check-{taskId}.json` 에 저장한다. 이 영수증이 호출자의 step proof 다 — `pass`·`file`·`sha256` 이 저장된 브리프 바이트를 가리켜야 하므로 draft 판정으로 대신하지 않는다. 파일을 쓰지 않는 대화형 경로에는 없는, 이 모드만의 예외다.
- **근거로 못 푸는 STRONG 갭이 남으면 브리프를 쓰지 않는다.** 미해소 갭 목록(무엇이 없어서 못 정했는지 + 필요한 결정)을 호출자에게 반환한다. 표현을 바꿔 통과시키는 것은 이 모드에서도 금지 — `NO_TBD` 가 잡는다.
- **완료 후 안내 hook 은 생략**한다(호출자가 다음 단계를 갖고 있다). 반환값은 브리프 경로 + 검증 영수증 경로(`{{config.tempDir}}/brief-check-{taskId}.json`) + 남은 §9 미결사항이다.

---

## 완료 후 안내

전체 안내 텍스트는 **`references/completion-hooks.md` 단일 출처**. 4 hook 순차 실행:

1. 브리프 생성 완료 안내 — `{{config.outputDir}}/{taskId}_dev_brief.md` 경로 + 부록 라운드 수.
2. 다음 단계 — `{{config.planSkill}}` 값에 따라 분기.
3. 임시 파일 정리 — `{{config.tempDir}}/pre_exp_{taskId}/` 유지/삭제 확인.
4. `.gitignore` 에 `{{config.tempDir}}/` 포함 여부 확인 권장.

---

## 사용 예시

사용 예시 3종 → `references/usage-examples.md`
