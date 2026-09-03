# 개발 가이드 — 공통 정책

> **적용 대상:** `**/*`

---

## 1. 가이드라인 매핑

> **데이터 위치**: `.claude/config/project.yaml`
> - `projects[].guideline` (프로젝트별 직접 지정 — `{backend, frontend?}`)
> - `conditionalGuides` (조건부, 프로젝트 무관)
>
> 본 파일에는 매핑 표를 두지 않는다. 변경 시 `project.yaml` 만 수정한다.

해석 규칙:

1. 프로젝트 → `project.yaml projects[]` 에서 해당 항목 조회
2. `projects[].guideline.backend` 적용 (필수)
3. ORM/매퍼 도구 작업(쿼리 매퍼 작성·수정) 시, 사용하는 언어팩의 매퍼/쿼리 가이드를 추가로 로드한다.

가이드라인 파일은 자동 로드되지 않으며, 해당 프로젝트 작업 시 필요에 따라 Read 로 참조한다. 작업 대상 프로젝트의 가이드 파일과 **프로젝트 루트의 CLAUDE.md** 를 반드시 확인한다.

프론트엔드 포함 프로젝트는 `projects[].guideline.frontend` 배열을 함께 로드한다.

---

## 2. 공통 유틸 라이브러리 사용 원칙

### 2-1. 기본 원칙

1. 유틸 기능이 필요할 때 **직접 구현 전에 반드시 공통 유틸 라이브러리·표준 라이브러리에서 먼저 찾는다.**
2. 공통 유틸에 필요한 기능이 **없을 경우, 신규 추가 여부를 반드시 사용자에게 확인한 후 진행한다.**
3. 모듈 전용 유틸(`utils/` 디렉토리)은 해당 모듈에서만 사용되는 기능에 한해 허용한다.

### 2-2. 라이브러리 정보

- **패키지**: `project.yaml commonUtilsPackage` 단일 출처. 버전은 각 프로젝트 `package.json` 참조.
- **소스 위치**: 외부 패키지 (별도 관리)
- **인벤토리**: 공통 유틸 프로젝트 루트의 `CLAUDE.md` 참조.

### 2-3. 모듈 전용 utils/ 허용 기준

- **허용**: 해당 모듈에서만 사용되는 특수 로직 (예: 도메인 코드 매핑, 외부 시스템 어댑터)
- **금지**: 공통 유틸·표준 라이브러리에 이미 존재하는 기능의 중복 구현
- **금지**: 여러 모듈에서 공통으로 필요한 유틸을 개별 모듈의 `utils/` 에 구현 (→ 공통 유틸 추가 요청)

---

## 3. 로깅 설정 공통 원칙 (pino / winston)

- 로그 레벨은 환경별로 분리한다. (`local` → `debug` / `dev` → `info` / `prod` → `warn`)
- `LOG_LEVEL` 환경 변수를 단일 출처로 제어한다.
- 분산 추적 키는 `project.yaml tracing.mdcKey` 단일 출처. `AsyncLocalStorage` 로 모든 로그 항목·비동기 컨텍스트에 전파한다.
- 파일 로테이션이 필요한 경우 로거 전송기(`pino-roll` 등) 또는 외부 로그 수집기(예: Loki, CloudWatch)를 사용하며, 보존 정책은 서버·인프라에 위임한다.

---

## 4. npm/pnpm 빌드/테스트

- 표준 스크립트 명령 사용 (`npm run build` / `npm test` / `npm run dev`).
- 모노레포 환경에서는 `pnpm -F {package-name} {script}` 형식을 사용한다.
- 의존성·빌드 메타는 `package.json` 단일 출처. 잠금 파일(`package-lock.json`/`pnpm-lock.yaml`)을 함께 커밋한다.
- 프로젝트별 `CLAUDE.md ## Build & Run` 에 표준 명령 반복 기재 금지.
