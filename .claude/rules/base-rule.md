# Base Rule — 개발팀 공통 개발 규격

> **적용 대상:** `**/*`

> **품질 헌장**: 흩어진 게이트의 축별 조회는 `skills/code-review/references/quality-charter.md`(TRUST 5축). 헌장은 게이트를 추가하지 않는다 — 분류·가시화만.

---

## 1. 기밀 정보 보호 (원칙)

본 섹션은 **원칙(WHY)** 만 선언한다. 차단 패턴·실행 정책·우회 방식 등 실행 규칙(HOW) 단일 출처: [`.claude/skills/secrets-guard/SKILL.md`](../skills/secrets-guard/SKILL.md).

- **민감 정보 코드 노출 금지** — 설정 파일의 DB 접속 정보·API Key·비밀번호 등은 코드·문서·로그에 하드코딩하지 않는다.
- **암호화 값 복호화 금지** — 암호화된 설정 값은 원문 복원을 시도하지 않는다.
- **복호화 키 격리** — 복호화 키는 코드·설정 파일에 하드코딩하지 않고, 환경 변수 / 런타임 인수로만 주입한다.

> 언어·프레임워크별 암호화 도구와 토큰 형식(차단 패턴 포함)은 사용하는 언어팩의 규칙·secrets-guard 정책을 따른다.

---

## 2. Git 브랜치 전략

브랜치 구조는 다음을 따른다:

```
main
├── develop
│   ├── release-{yyyy.MM.dd}-v{N}               ← 사업부 요청 배포 대상
│   │   └── feature/{과업번호}/{사용자 ID}         ← 과업 기반 기능 개발
│   ├── internal-{yyyy.MM.dd}-v{N}              ← 개발팀 자체 개선 배포 대상
│   │   └── feature/internal/{기능명}/{사용자 ID} ← 내부 기능 개발
└── hotfix/{버그수정명}/{사용자 ID}                ← 긴급 버그 수정 (main 기준)
```

| 브랜치 유형          | 네이밍 규칙                                 | 부모 브랜치 | 병합 대상         | 용도                       |
| -------------------- | ------------------------------------------- | ----------- | ----------------- | -------------------------- |
| `main`               | -                                           | -           | -                 | 운영 릴리즈 기준           |
| `develop`            | -                                           | `main`      | `main`            | 통합 개발 브랜치           |
| `release`            | `release-{yyyy.MM.dd}-v{N}`                 | `develop`   | `develop`         | 사업부 요청 배포 대상      |
| `internal`           | `internal-{yyyy.MM.dd}-v{N}`                | `develop`   | `develop`         | 개발팀 자체 개선 배포 대상 |
| `feature/*`          | `feature/{과업번호}/{git 사용자 ID}`        | `release`   | `release`         | 과업 기반 기능 개발        |
| `feature/internal/*` | `feature/internal/{기능명}/{git 사용자 ID}` | `internal`  | `internal`        | 내부 기능 개발             |
| `hotfix/*`           | `hotfix/{버그수정명}/{git 사용자 ID}`       | `main`      | `main`, `develop` | 운영 긴급 버그 수정        |

---

## 3. 작업 브랜치 원칙

- **`main`, `develop`, `release-*`, `internal-*` 브랜치에서 직접 작업하지 않는다.**
- 모든 작업은 반드시 `feature/*` 또는 `hotfix/*` 브랜치에서 진행한다.
- 작업 완료 후 GitLab Merge Request(MR)를 통해 부모 브랜치로 병합한다.

---

## 4. 커밋 전 코드 리뷰 원칙

- 커밋 이전에 반드시 **`/code-review`** 스킬(`.claude/skills/code-review/`)을 수행한다.
- 코드 리뷰 결과 **`WARNING`** 또는 **`CRITICAL`** 등급의 이슈가 존재할 경우 **커밋하지 않는다.**
- 모든 이슈를 해결한 후 재검토를 거쳐 커밋을 진행한다.
- **재검토는 최대 2회.** 2회 후에도 `WARNING` 이상이 남으면 반복하지 않고 남은 이슈와 판단 근거를 사용자에게 제시한 뒤 지시를 기다린다. 리뷰 1회는 격리 에이전트가 룰·템플릿을 다시 로드하는 비용이 들어, 무한 반복은 진척 없이 비용만 늘린다.
- 재검토는 **변경된 부분만** 대상으로 한다(직전 지적의 수정분). 전체 diff 를 처음부터 다시 훑지 않는다.

```
CRITICAL  → 즉시 수정 필수, 커밋 불가
WARNING   → 수정 후 커밋, 커밋 불가
INFO      → 참고 사항, 커밋 가능
```

---

## 5. TypeScript 개발 규칙

- 모든 설정 값은 **환경 변수(`.env`)** 또는 **설정 모듈**을 통해 주입한다. (`process.env` 직접 산재 접근 금지 — 설정 객체 한 곳 경유)
- 비밀 값(API Key·DB 비밀번호·토큰)은 절대 코드·`.env.example` 이외의 파일에 실제 값을 커밋하지 않는다.

```typescript
// ❌ 금지 — 환경 변수 직접 산재 접근
const dbUrl = process.env.DATABASE_URL;

// ✅ 허용 — 검증된 설정 객체 한 곳 경유
const config = loadConfig();          // 앱 시작 시 1회 로드·검증
const dbUrl = config.databaseUrl;
```

- 로그는 구조화 로거(예: `pino`·`winston`)를 사용한다(`console.log` 디버깅 금지).
  - 로그 레벨은 환경 변수 `LOG_LEVEL` 단일 제어 (`debug` / `info` / `warn` / `error`)
  - 로그 레벨은 환경별로 분리 관리한다. (`local` → `debug`, `dev` → `info`, `prod` → `warn`)
  - 분산 추적 컨텍스트(예: `x-request-id`)는 `AsyncLocalStorage` 로 비동기 경계까지 전파한다.

---

## 6. 문서화 규칙 (TSDoc)

- 모든 **클래스**와 **public 메서드**에는 **TSDoc** 형식의 주석을 작성한다.
- 타입은 TSDoc 산문이 아니라 타입 힌트로 표현한다(중복 금지).

```typescript
/**
 * 사용자 정보를 조회하는 서비스.
 *
 * @param userId - 조회할 사용자 ID
 * @returns 사용자 DTO
 * @throws NotFoundError 사용자가 존재하지 않을 경우
 */
async findById(userId: number): Promise<UserDto> { ... }
```

---

## 7. Git Commit 메시지 컨벤션

커밋 작업은 `/git commit` 사용 — TYPE·형식 컨벤션은 `/git` 스킬의 `commit-convention.md` 가 단일 출처다(여기 다시 적지 않는다).

---

## 8. DB 쿼리 공통 규칙

> **단일 출처**: vendor·schema·searchPath 활성 여부는 `.claude/config/project.yaml` `db.*` 가 마스터. 본 섹션은 `{{config.db.vendor}}`·`{{config.db.schema}}` 변수 치환 기반.

- **DB:** `{{config.db.vendor}}`, 운영 스키마 `{{config.db.schema}}`
- DB 연결에 `search_path` 가 설정되어 있으므로 (`project.yaml db.searchPathEnabled: true`) **테이블명에 스키마 접두사(`{{config.db.schema}}.`)를 붙이지 않는다.**

**적용 범위:**

- 쿼리 매퍼 파일 (`*Mapper.xml` 등)
- Java embedded SQL / `JdbcTemplate` / `EntityManager` 네이티브 쿼리
- ad-hoc 조회 (`mcp__postgres__query`, psql, DBeaver 등 DB 클라이언트)
- 문서·가이드 예시 SQL

**예외:** 명시적으로 시스템 카탈로그를 조회할 때만 스키마 접두사를 사용한다 (`pg_catalog.*`, `information_schema.*`).

```sql
-- ❌ 금지
SELECT USER_ID FROM {{config.db.schema}}.TB_USER

-- ✅ 허용
SELECT USER_ID FROM TB_USER

-- ✅ 허용 (시스템 카탈로그)
SELECT table_name FROM information_schema.tables
```

---

## 체크리스트 요약

커밋 전 아래 항목을 반드시 확인한다:

- [ ] `src/**/resources/**/*.yml`, `src/**/resources/**/*.properties` 민감 정보 하드코딩 여부 확인
- [ ] 암호화 값 복호화 시도 금지 확인
- [ ] 암호화 키가 환경 변수로 주입되는지 확인
- [ ] 작업 브랜치가 `feature/*` 또는 `hotfix/*` 인지 확인
- [ ] SQL 작성 시 스키마 접두사(`{{config.db.schema}}.`) 미부착 확인 (project.yaml `db.searchPathEnabled: true` 일 때)
- [ ] `/code-review` 수행 완료 (WARNING / CRITICAL 없음)
- [ ] (권장) 단위 테스트 케이스 작성 완료
- [ ] (권장) 테스트 커버리지 80% 이상 통과
- [ ] 클래스 및 메소드 API 문서 주석 작성 완료
- [ ] 커밋 메시지 컨벤션 준수
