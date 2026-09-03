---
name: ai-ready
description: "세션 transcript와 git 이력을 분석해 개발자의 주간 AI 활용 리포트(HTML·루브릭 100점 채점·레이더 차트)를 생성한다. 사용자가 '/ai-ready', 'AI 활용 리포트', '주간 리포트', '주간회의 자료', '위클리 리포트', '내 점수 뽑아줘', 'AI 레포트' 등을 언급하면 이 스킬을 사용한다."
argument-hint: "[YYYY-MM-DD..YYYY-MM-DD]"
---

# ai-ready — 주간 AI 활용 리포트

<Overview>

주간회의에서 개발자 본인이 "Claude Code와 어떻게 일했는지"를 발표하기 위한 자기 발표 자료를 생성한다.
리포트의 주인공은 산출물이 아니라 **AI 활용 방식**이다 — 과업번호 없는 긴급 작업·조사·시행착오 세션도 동등하게 다룬다.

| 항목 | 값 |
| --- | --- |
| 산출물 | 자체완결 단일 HTML (외부 리소스 의존 없음) |
| 산출 경로 | `{워크스페이스 루트}/target/reports/ai-ready_{사용자ID}_{YYYYMMDD-YYYYMMDD}.html` |
| 사용자ID | `git config user.name` (브랜치 컨벤션의 git 사용자 ID와 동일) |
| 채점 | 루브릭 5영역 × 1~5점, 표기는 ×4 환산 100점 — [`references/rubric.md`](references/rubric.md) 단일 출처 |
| 전주 비교 | 직전 리포트 HTML의 `id="ai-ready-meta"` JSON 파싱 (DB 없음) |

아키텍처 — 3단계 composable 오케스트레이터:

```
① 수집 (scripts/collect_sessions.py)  →  기간 내 세션 인벤토리 JSON
② 세션별 서브에이전트 (병렬)          →  협업 서사 카드
③ 메인: git 교차 → 루브릭 채점 → 템플릿 주입 → target/reports/ 저장
```

</Overview>

## 0단계 — 인자 처리

- **무인자**: 최근 7일 (오늘 포함, `시작일 = 오늘 - 6일`)
- **`YYYY-MM-DD..YYYY-MM-DD`**: 해당 기간으로 재정의
- 사용자ID: `git config user.name` 실행으로 획득 (실패 시 사용자에게 질문)
- 워크스페이스 루트: `.claude/` 디렉토리의 부모 경로

## 1단계 — 수집

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass \
  -File "{스킬 루트}/scripts/collect-sessions.ps1" \
  -WorkspaceRoot "{워크스페이스 루트 (Windows 절대경로)}" \
  -Start {YYYY-MM-DD} -End {YYYY-MM-DD}
```

> Windows PowerShell 5.1(기본 내장) 호환 — 별도 런타임 설치 불필요. 출력 JSON의 한글이 콘솔에서 깨져 보여도 파일·파이프 데이터는 UTF-8로 무결하다.

출력 JSON의 `sessions[]` 각 항목: `file, session_id, start, end, duration_min, size_kb, cwd, user_turns, interrupts, tool_rejections, skills[], projects[], first_goal`.

처리 규칙:

- **세션 0건이면 안내 후 종료** (빈 리포트 생성 금지). 안내에 두 가지 가능성 포함:
  1. `cleanupPeriodDays` 보존 기간 만료로 transcript가 삭제됨
  2. `CLAUDE_CODE_SKIP_PROMPT_HISTORY` 환경변수로 기록이 꺼져 있음
- **`skills`에 `ai-ready`가 포함된 세션은 분석 대상에서 제외** (리포트 생성 세션 자체는 채점하지 않는다 — 자기 점수 순환 방지)
- `user_turns` 0건인 세션(훅·자동화만 기록)도 제외

## 2단계 — 세션별 협업 서사 카드 (서브에이전트 병렬)

세션당 Agent 1개를 **병렬 dispatch** 한다 (`run_in_background` 불필요, 단일 메시지 다중 호출). 프롬프트 템플릿:

```
다음 Claude Code 세션 transcript를 읽고 협업 서사 카드를 YAML로 반환하라.
transcript 경로: {file}

읽기 규칙:
- 파일 크기 {size_kb}KB. 200KB 초과 시 전체를 읽지 말고 사용자 발화(type=user) +
  Skill 도구 호출 + 에러/재시도 구간 중심으로 샘플링하라.
- 코드 원문을 카드에 인용하지 마라. ENC(...)·접속정보·비밀번호·API Key 패턴은 어떤 형태로도 옮기지 마라.
- 과업번호·브랜치 매핑은 대화 속 증거(/develop 호출, feature 브랜치 생성, {{config.outputDir}} 경로,
  사용자 언급)로만 판단하고 신뢰도(확실/추정/불명)를 표기하라. 증거 없으면 '불명' — 강제 매핑 금지.

반환 형식 (YAML만, 다른 텍스트 금지):
session: {session_id}
goal: 한 줄 — 무엇을 하려던 세션인가
outcome: 완료 | 부분 | 조사 | 중단
project: 추정 프로젝트
task: 과업번호·브랜치 (신뢰도: 확실/추정/불명)
workflow: 정식 파이프라인 | 부분 | 즉흥 지시
skills_used: [목록]
direction_pattern: 1회 완결 | N회 교정 — 재지시 지점과 이유 한 줄
interventions: interrupt·도구 거부 횟수와 맥락 한 줄
delegation: 전체 위임 | 부분 수동 개입 — 근거
verification: code-review·테스트 수행 여부
breakthrough: 막힘→돌파 서사 2~3문장 (없으면 생략)
quote: 잘 됐던 사용자 지시문 발췌 1개 (민감정보 제외, 없으면 생략)
```

## 3단계 — git 교차 검증

`.claude/config/project.yaml`의 `projects[]` 각 프로젝트에 대해:

```bash
git -C {워크스페이스 루트}/{프로젝트} log --all --since={start} --until={end+1일} \
  --format="%h|%an|%ad|%s|%D" --date=iso
```

용도:
1. **과업 매핑 보강** — 기간 내 feature 브랜치명(`feature/{과업번호}/...`)·커밋 시각을 세션 카드와 대조
2. **위임 수준 채점 근거** — 세션 카드의 작업 시각·파일과 맞지 않는 커밋(= 세션 외 수동 변경) 건수 산출

프로젝트 수가 많으므로 기간 내 커밋이 없는 프로젝트는 즉시 건너뛴다.

## 4단계 — 루브릭 채점

1. [`references/rubric.md`](references/rubric.md)를 Read 한다 — 채점 기준 정본. 팀 합의로 바뀔 수 있으므로 **이번 실행에서 아직 안 읽었으면 읽는다**(같은 실행 안에서 이미 읽었다면 다시 읽지 않는다).
2. 카드 + git 교차 결과로 5영역(workflow/direction/delegation/problem/verify)을 각 1~5점 채점
3. **각 점수마다 transcript 근거 문장 1개 이상 필수** — 근거 없는 점수 금지
4. 환산: 영역 표기 점수 = 1~5점 × 4 (20점 만점), 총점 = 5영역 합 × 4 (100점 만점)
5. 단계 배지: rubric.md의 가이드라인 구간 표(도입/적응/정착/숙련) 적용

## 5단계 — 전주 비교

1. `{워크스페이스 루트}/target/reports/ai-ready_{사용자ID}_*.html` 중 이번 기간 이전의 최신 파일 탐색
2. 있으면 `<script type="application/json" id="ai-ready-meta">` 블록의 JSON을 파싱 → 총점·영역별 델타 계산
   - TREND: `▲ +N (전주 M)` / `▼ -N (전주 M)` / `— (전주 동일)`
   - 표의 전주 셀: `<span class="delta-up">▲ +N</span>` / `delta-down` / `delta-flat`
3. 없으면(첫 실행): TREND·전주 셀 빈 문자열, 템플릿의 `BEGIN:RADAR_LAST ~ END:RADAR_LAST` 블록 전체 삭제

## 6단계 — 레이더 좌표 계산

- 중심 (150,150), 최대 반지름 110. 환산 점수 s(0~20) → r = s / 20 × 110
- 꼭짓점 k=1..5 의 (cos, sin): k1=(0,-1) k2=(0.951,-0.309) k3=(0.588,0.809) k4=(-0.588,0.809) k5=(-0.951,-0.309)
  - 순서: k1=workflow(상단), k2=direction, k3=delegation, k4=problem, k5=verify
- point_k = (150 + r·cos, 150 + r·sin), 소수 1자리 반올림
- `RADAR_THIS_POINTS` = 5개 점을 `x1,y1 x2,y2 …`로 연결, `RTX1~RTY5` = 각 점 좌표
- 전주 점수로 같은 계산 → `RADAR_LAST_POINTS`

## 7단계 — 렌더링·저장

1. [`assets/report-template.html`](assets/report-template.html)을 Read
2. 모든 `{{플레이스홀더}}`를 치환한다. 주요 항목:
   - `USER, PERIOD(표시용), PERIOD_ISO(YYYY-MM-DD..YYYY-MM-DD), SESSION_COUNT, TOTAL_HOURS(duration_min 합/60, 소수1), PROJECTS(쉼표 목록)`
   - `TOTAL, STAGE, TREND` / `S_* (환산점수), D_* (델타 셀 HTML), E_* (근거)`
   - `RADAR_THIS_POINTS, RTX1~RTY5, RADAR_LAST_POINTS(또는 블록 삭제)`
   - `SUMMARY` (한 단락 — 주요 과업 + 활용 방식 + 약점 1개)
   - `SESSION_CARD` 블록을 카드 수만큼 복제 후 각 카드 값 주입. `SC_BADGES`는 `<span class="badge ...">` 조합
     (proj/task/flow-full|flow-adhoc/outcome-done|outcome-part). 돌파 서사 없는 카드는 `SC_STORY` 블록 삭제
   - `SHOWN_COUNT, OMITTED_NOTE` — 카드 10건 초과 시 단순 조회 세션은 생략하고 생략 사유 기재. **생략을 숨기지 않는다**
   - `QUOTE_TEXT/SRC, BREAKTHROUGH_TEXT/SRC` — 카드의 quote·breakthrough 중 최고 1건씩
   - `LOWEST_AREA, NEXT_ITEMS` — 최저 영역 기준 개선 제안 `<li>` 1~3개
   - `GENERATED` — 오늘 날짜
3. `{워크스페이스 루트}/target/reports/` 에 Write (디렉토리 없으면 생성)
4. **완료 검사**: 산출 파일에 `{{` 잔존 0건 확인 후 경로 보고. 잔존 시 치환 누락 수정

## 안전 규칙

- transcript 를 Bash grep 등으로 검색할 때는 `--exclude=*.yml --exclude=*.yaml --exclude=*.properties` (따옴표 없이)를 붙인다 — check-file-access 훅 정책 준수
- 리포트에 코드 원문 대량 인용 금지, `ENC(...)`·접속정보·키 패턴 마스킹 (secrets-guard 원칙)
- 점수·랭킹을 인사평가에 쓰지 않는다 — 푸터의 "자기 발표 자료" 문구를 제거하지 않는다
- `target/reports/` 의 과거 리포트를 삭제하지 않는다 (전주 비교 소스)
