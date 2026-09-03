---
name: pack
description: "세션 종료 전 워크스페이스 루트 HANDOFF.md(진행중 컨텍스트)와 HANDOFF_HISTORY.md(완료 누적)를 갱신한다 — 루트 두 파일만, 프로젝트별 HANDOFF 는 만들지 않는다. 사용자가 '/pack', '세션 정리', '핸드오프', '인수인계', '퇴근', '저장하고 끝내자', '다음에 계속' 등 세션 마무리를 언급하면 이 스킬을 사용한다."
---

# Pack — 세션 핸드오프 스킬

<Overview>

세션이 길어지면 컨텍스트가 흐려지고, 새 세션에서 처음부터 다시 설명해야 하는 비용이 크다. `/pack` 은 현재 세션의 정보를 워크스페이스 루트의 두 파일로 보존한다.

| 자산                 | 경로                                     | 역할                                                                                                       | 갱신 방식             |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------- |
| `HANDOFF.md`         | `{워크스페이스 루트}/HANDOFF.md`         | 모든 프로젝트의 **진행중 컨텍스트** (Plan / Next / Caution / Files + Cross-Cutting Caution + Common Files) | 매 pack 마다 덮어쓰기 |
| `HANDOFF_HISTORY.md` | `{워크스페이스 루트}/HANDOFF_HISTORY.md` | **완료 작업 + 그 시점 진행중 스냅샷** 누적 이력 (세션 단위)                                                | 시간 역순 prepend     |

> **프로젝트별 `{project}/HANDOFF.md` 는 작성하지 않는다.** 모든 진행중 컨텍스트는 워크스페이스 루트의 단일 `HANDOFF.md` 안에 프로젝트별 섹션으로 통합된다.

**책임 분리 원칙**: HANDOFF.md 에는 `### Done` 을 절대 두지 않는다. 완료 작업은 HISTORY 의 Done 으로만. 브랜치를 전환했다 다시 돌아와도 HISTORY 의 `@ {브랜치명}` entry 에서 그 브랜치의 마지막 컨텍스트를 조회 가능하다.

**상세 형식**:

- HANDOFF.md 템플릿 → [`templates/handoff-template.md`](templates/handoff-template.md)
- HANDOFF_HISTORY.md 형식 → [`templates/history-format.md`](templates/history-format.md)

</Overview>

<Workflow>

### 0단계 (전처리): stale 프로젝트 섹션 자동 보존 (P2)

**Layer 3 script 위임** — 결정론 처리:

```powershell
powershell .claude/skills/pack/scripts/pack-stale.ps1
```

`scripts/pack-stale.ps1` 가 HANDOFF.md frontmatter `projects:` 표 파싱 → 각 프로젝트 `git branch --show-current` 비교 → stale 섹션 (`### Plan` / `### Next` / `### Caution`) 을 HANDOFF_HISTORY.md 에 stale 보존 entry 로 prepend (`### In-progress (snapshot)` 만, **`### Done` 없음**) → HANDOFF.md 에서 해당 섹션 제거.

반환 JSON: `{ stale: [...], preserved: n, historyTotal: n, overflow: bool }`.

- `overflow: true` → 5단계 출력에서 "HISTORY 100개 초과" 안내 메시지 추가.
- `preserved: 0` → stale 없음, 정상 흐름 진행.
- DryRun 모드(`-DryRun`) 가 필요하면 사용자 검토 후 별도 실행.

> 사용자 모달 없이 자동 수행. 데이터 손실 없음 — stale 컨텍스트는 HISTORY 에 보존된다.
> entry 형식 상세 → [`templates/history-format.md`](templates/history-format.md) 의 `<Entry_Conditions>` P2 변형.

### 1단계: 워크스페이스 루트 감지

아래 마커를 **우선순위 순** 으로 탐색한다:

1. **`.claude/` 디렉토리** — 최우선 마커. 이 디렉토리가 있으면 개별 하위 프로젝트의 `.git` 보다 우선한다.
2. `.git`, `package.json`, `pyproject.toml`, `Cargo.toml` 등 — `.claude/` 가 없을 때 폴백.

감지 실패 시: 현재 작업 디렉토리를 루트로 사용하고 "⚠️ 워크스페이스 루트를 자동 감지하지 못했습니다. 현재 디렉토리를 사용합니다." 안내한다.

### 2단계: 멀티 프로젝트 감지

워크스페이스 루트에 `.git` 이 없고, 하위 디렉토리에 독립 `.git` 이 2개 이상 존재하면 **멀티 프로젝트 워크스페이스** 로 판단한다. 변경된 파일이 속한 프로젝트를 식별하여 프로젝트별 그룹화를 적용한다.

### 3단계: develop 세션 확인 + 세션 요약 + 파일 수집

**develop 세션 활성 시**: HANDOFF.md 생성 전에 develop 스킬의 **10단계(기밀 보안 자가 점검)** 를 먼저 수행하여 결과를 출력한다. 위반 항목은 해당 프로젝트 섹션의 `Caution` 에 자동 포함한다.

**현재 세션 요약** — 대화 컨텍스트에서 추출:

- **Plan**: 세션 중 plan 모드에서 수립·합의한 구현 계획 (없으면 생략)
- **Done**: 이 세션에서 완료한 작업
- **Next**: 다음 세션에서 이어야 할 작업
- **Caution**: 주의사항, 알려진 이슈, 함정

**파일 목록 수집** — 두 소스를 합집합:

- **git 기반**: 각 프로젝트 디렉토리에서 `git status --short` 또는 `git diff --name-only`
- **대화 컨텍스트 기반**: 세션 중 Write/Edit 도구로 생성·수정한 파일

**브랜치 정보**: 작업한 프로젝트별로 `git branch --show-current` 실행. detached HEAD 면 `_detached_{short-sha}`.

**커밋 상태 확인**: `git status --short` 으로 스테이징/미커밋 상태 파악 → Files 섹션 태그 결정.

세션에서 파일 변경이 전혀 없을 때: "이 세션에서 파일 변경이 없습니다. HANDOFF.md를 갱신할까요?" 확인 후 진행.

### 4단계: 워크스페이스 루트 HANDOFF.md 갱신

`{workspace-root}/HANDOFF.md` 를 작성한다. 변경 프로젝트가 1개여도 항상 작성한다.

> **타임스탬프 규칙 (4·5단계 공통)**: `updated:` frontmatter 와 HISTORY entry 헤더의 시각은 **추측하지 말고** 아래 명령 출력을 그대로 사용한다 (KST 고정, 0단계 P2 스크립트와 동일 형식):
> ```powershell
> powershell -Command "(Get-Date).ToUniversalTime().AddHours(9).ToString('yyyy-MM-ddTHH:mm') + '+09:00'"
> ```
> 형식: `yyyy-MM-ddTHH:mm+09:00` (초 생략). harness 컨텍스트의 날짜만 보고 시:분을 지어내면 안 된다.

기존 파일이 있으면 (0단계 P2 가 stale 처리 후이므로 frontmatter `projects:` 의 모든 항목이 현재 git 브랜치와 일치):

1. 기존 내용을 읽는다.
2. 이번 세션에서 변경된 프로젝트의 섹션을 갱신한다 (Plan / Next / Caution / Files).
3. 이번 세션에 손대지 않은 다른 프로젝트의 섹션은 **그대로 유지** — 다른 진행 작업이 빠지면 안 된다.
4. **`### Done` 섹션이 남아있으면 제거** — Done 은 HISTORY 의 책임이며 HANDOFF.md 에는 두지 않는다.
5. frontmatter `projects:`, `updated:` 갱신.
6. **Cross-Cutting Caution / Common Files** 정합성 점검:
   - 단일 프로젝트 한정 항목이 Cross-Cutting 에 섞여 있으면 해당 프로젝트의 `Caution` 으로 이동.
   - Common Files 는 어떤 프로젝트에도 속하지 않는 파일(`.claude/`, `~/.claude/`, 워크스페이스 루트 직접 등) 만 등록.

> 템플릿·필드별 갱신 규칙 상세 → [`templates/handoff-template.md`](templates/handoff-template.md) Read.

### 5단계: HANDOFF_HISTORY.md prepend

각 프로젝트마다:

- **이번 세션 Done 1건 이상** → 정상 entry 추가 (`### Done` + `### In-progress (snapshot)`).
- **Done 0건** → entry 추가하지 않음 (HANDOFF.md 만 갱신).

entry 헤더 타임스탬프는 4단계 **타임스탬프 규칙** 의 KST 고정 명령 출력을 그대로 사용한다 (`updated:` 와 동일 시각·형식).

0단계(P2)에서 stale 보존 entry 가 prepend 됐다면, 위 정상 entry 는 그 위에 prepend 된다 (시간 역순 — stale 보존이 먼저 작성되어 아래로, 정상 entry 가 최상단).

**100개 초과 안내**: HISTORY 의 `## ` 시작 헤더를 카운트. 100개 초과 시 마지막에 안내 메시지 1줄 출력.

> entry 헤더/본문/종결 마커/멀티 프로젝트 독립성/공통 경로 처리/100개 초과 메시지 전문 → [`templates/history-format.md`](templates/history-format.md) Read.

</Workflow>

<Scope_Rules>

세션 중 생성/수정한 파일의 경로에서 워크스페이스 루트 기준 첫 번째 디렉토리(프로젝트명)를 추출하여 작성 단위를 판정한다.

| 케이스                                                              | HANDOFF.md 처리                                                               | HISTORY entry             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| 프로젝트 디렉토리 하위 변경 + 진행중 컨텍스트 있음                  | 해당 프로젝트 섹션 작성/갱신                                                  | Done ≥ 1건이면 entry 추가 |
| 프로젝트 디렉토리 하위 변경 + 진행중 컨텍스트 없음 (단순 메타 작업) | 섹션 만들지 않음, 변경 파일은 다른 프로젝트 Files 또는 `Common Files` 에 흡수 | Done ≥ 1건이면 entry 추가 |
| 공통 경로(`.claude/`, `target/` 등) 만 변경, 영향 프로젝트 0개      | `Common Files` 만 갱신                                                        | entry 자체 생략           |
| 공통 경로 변경 + 영향 프로젝트 N개                                  | `Common Files` 갱신 + 각 프로젝트 entry Done 에 짧게 언급                     | 각 프로젝트별 entry       |
| 변경 프로젝트 0개                                                   | 사용자 확인 후 `Common Files` / `Cross-Cutting Caution` 만 갱신               | entry 없음                |

</Scope_Rules>

<Commit_Status>

Files / Common Files 의 각 파일에 커밋 상태 태그를 표기한다.

| 상태               | 표시            | 의미                                   |
| ------------------ | --------------- | -------------------------------------- |
| 커밋 완료          | `[커밋됨]`      | git 에 커밋된 상태                     |
| 미커밋 (tracked)   | `[미커밋]`      | 변경되었으나 아직 커밋되지 않음        |
| 미커밋 (untracked) | `[미커밋-신규]` | 새로 생성된 파일, git 에 추가되지 않음 |

`git status --short` 출력으로 판정.

</Commit_Status>

<Writing_Principles>

- **간결하게**: 각 항목은 1~2문장.
- **구체적으로**: "API 작업함" 대신 "POST /users 엔드포인트 구현 완료, 인증 미들웨어 연결됨".
- **결정 사항 포함**: HISTORY 의 Done 에는 단순 작업 목록뿐 아니라 왜 그렇게 했는지(결정 배경) 도 간단히 남긴다.
- **Caution 은 구체적 위험**: "조심해야 함" 대신 "DB 마이그레이션 아직 안 돌림, dev 환경에서 먼저 테스트 필요".
- **Files 는 변경 파일만**: 읽기만 한 파일은 제외.
- **공통 항목 태그**: `Cross-Cutting Caution` 항목에는 `[공통]` 또는 `[프로젝트A ↔ 프로젝트B]` 인라인 태그.
- **책임 분리**: HANDOFF = 진행중, HISTORY = 누적. HANDOFF.md 에 `### Done` 절대 금지.

</Writing_Principles>

<Final_Output>

5단계 완료 후 사용자에게 출력한다:

- 갱신된 파일 경로 목록 (HANDOFF.md + HANDOFF_HISTORY.md)
- HISTORY entry 추가 개수 (정상 entry + P2 stale 보존 entry 합계)
- 100개 초과 시 안내 메시지 (해당하는 경우)

</Final_Output>
