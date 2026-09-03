---
name: phase-doc-schema
description: 7단계 페이즈 문서 §1~§9 출력 schema — 페이즈 메타·목적·구현 대상 파일·파일별 상세(시그니처/DTO 필드 표)·DB 명세·외부 연동·Task 분해·인계사항 템플릿 + 병렬 Write 가이드. dev-planner 7단계 각 페이즈 Write 직전 Read.
---

# Phase Document Schema — 7단계

> dev-planner 7단계 페이즈 문서 출력 schema 단일 출처. 9섹션 구조 (§9 완료의 정의(DoD) = develop 수렴 루프 종료 판정표 / §검증 방법(테스트 파일·커버리지)은 qa-plan 위임).

---

## 7단계: 페이즈 문서 생성 (페이즈 수만큼)

> **한 에이전트가 페이즈 문서 전부를 쓴다.** 페이즈당 에이전트 1개로 나눠 병렬로 띄우는 형태를 시도했다가 되돌렸다 — 페이즈 문서는 서로 참조하지 않으니 나눌 수 있어 보이지만, 실측에서 나눈 쪽이 **느렸다**(단일 23분 → 루트 13분 + 페이즈 병렬 16분 = 29분). 에이전트마다 같은 브리프·루트 계획서를 다시 읽고 각자 자기 예산을 다 썼다. 나누는 대신 **아래 재서술 금지로 잡는다.**

## 재서술 금지 (필수)

**분량은 아래를 넣지 않는 것으로 지킨다. 행수를 목표로 깎지 않는다.** 6행 전부 이미 다른 문서가 소유한 내용이라, 지우면 정보가 사라지지 않고 소유자에게 남는다:

| 넣지 않는 것 | 소유자 |
|---|---|
| 브리프 문장 재서술 (요구사항 배경·업무 설명) | 브리프. 필요하면 `브리프 §N` 으로 가리킨다 |
| 루트 문서 재서술 (스코프·전제·위험·커밋 전략·외부 연동 공통) | 루트. 참조는 상수·외부연동·재사용 자산 3개로 제한 |
| 다른 페이즈 내용 | 그 페이즈 문서. §8 인계사항에 한 줄로 가리킨다 |
| 메서드 본문·SQL 본문·JS 함수 본문 | `/develop`. §4 는 시그니처·책임·의존까지다 |
| 테스트 카테고리·커버리지·TC 시나리오 | qa-plan. §3 에 테스트 소스 **경로**만 |
| 같은 표를 두 번 (§3 파일 목록 ↔ §4 소절, §7 수락 기준 ↔ §9 AC) | 한쪽만. §9 AC 는 §7 수락 기준을 **가리키고** 다시 쓰지 않는다 |

**남은 것을 어떻게 쓰나는 문체 계약이 정한다** — 전보체(명사구 종결·1항목 1줄), 단일 출처 `docs/agents/common/artifact-style.md`. 재서술 금지는 *무엇을 넣지 않나*, 문체 계약은 *남은 것의 문장 형태*다. 둘 다 행수 상한이 아니다.

**이 표에 없는 것은 줄이지 않는다.** §4 시그니처·의존, §5 DB 명세, §7 Task 분해, §9 DoD 판정표는 소유자가 이 문서다 — 지우면 정보가 사라지고, 구현 에이전트가 그 자리를 **추론으로 메운다.** 계획서가 존재하는 이유가 구현의 재해석을 막는 것이므로, 그 재해석은 상한을 지킨 대가가 아니라 상한이 만든 결함이다.

**행수는 규범이 아니라 신호다.** 위 6행을 다 지킨 문서가 700행을 넘으면 페이즈가 큰 것이므로 루트에 재분할을 신고한다 — **순서가 이 방향이다.** 6행을 지키지 않은 채로 행수를 맞추면, 잘리는 것은 자르기 쉬운 쪽이고 자르기 쉬운 것과 불필요한 것은 같지 않다.

> 왜 행수를 차단 기준으로 두지 않는가: 구현 에이전트의 컨텍스트 압박은 실측됐지만(306k 토큰 / 도구 54회 지점에서 `529 Overloaded`, 재개도 즉시 재실패), 그 실측이 지목한 원인은 **에이전트가 브리프·루트 계획서까지 다시 읽은 것**이고 처방도 그것이었다(태스크 에이전트 읽기 예산 — 그 뒤 두 페이즈 모두 완주). 페이즈 문서 자체의 몫은 그 컨텍스트에서 소수이고, 그 몫을 재는 수치는 아직 없다. 근거가 측정되지 않은 상한이 정확성을 깎는 쪽으로 작동하면 순 손실이다.

**경로:** `{workspace_root}/{{config.outputDir}}/plans/{task_number}/phases/phase-{N}-{slug}.md`

**페이즈 문서 스키마 (9섹션 — §9 완료의 정의(DoD) 종료 판정표 포함, §검증 방법(테스트 파일·커버리지)은 qa-plan 위임):**

````markdown
# Phase {N} — {페이즈명} ({slug})

## 1. 페이즈 메타
| 항목| 값|
|------|-----|
| 페이즈 번호| {N}|
| 페이즈명| {한글명}|
| slug| {slug}|
| 프로젝트| {projects[].name} — 루트 frontmatter `project` 와 같은 값. §3·§4 경로는 이 프로젝트 루트 기준|
| 의존 페이즈| {N-1} 또는 —|
| 예상 기간| {Nd}|
| 독립 배포 가능| /|
| 제안 브랜치| `feature/{task_number}-phase{N}-{slug}/{userId}`|
| 참조 루트 문서| `../{task_number}_dev_plan.md`|

## 2. 목적 & 범위
### 2-1. 목적
이 페이즈가 해결하는 업무 가치 (2~3줄).

### 2-2. 포함
- {브리프 §4 매핑 중 이 페이즈가 커버하는 엔드포인트/화면 나열}

### 2-3. 제외 (다른 페이즈 소관)
- {명시적으로 이 페이즈가 다루지 않는 것}

## 3. 구현 대상 파일 목록
| 구분| 파일 경로| 클래스/기능| 변경 요약|
|------|---------|-----------|---------|
| NEW| `src/main/java/.../auth/AuthController.java`| 로그인/OTP 엔드포인트| —|
| MODIFY| `src/main/java/.../config/SecurityConfig.java`| 로그인 경로 허용 추가| `/auth/**` 허용|
| NEW| `src/main/resources/templates/auth/login.html`| 로그인 페이지| Thymeleaf + JS|
| NEW| `src/main/resources/static/js/auth/login.js`| 로그인 클라이언트 로직| OTP 요청/확인|
| NEW| `src/main/resources/mapper/AuthMapper.xml`| 사용자 조회 SQL| —|
| NEW| `src/test/java/.../auth/AuthServiceTest.java`| OTP 검증 계약| §9 DoD 테스트 GREEN 대상|

> **§9 DoD 가 테스트 GREEN 을 요구하면 그 테스트 소스 경로를 이 표에 넣는다.** 구현 에이전트는 이 목록으로
> 작업하므로, 목록에 없는 파일은 아무도 쓰지 않는다. 그 상태에서 DoD 심판이 "테스트 GREEN" 이면 페이즈는
> 영원히 미충족이거나 테스트 없이 GREEN 으로 적히고(vacuous GREEN), 실측에서는 페이즈 도중 테스트 도입용
> 에이전트를 다시 띄우는 비용으로 나타났다.
>
> **경로만 넣는다.** 테스트 카테고리·커버리지·TC 시나리오는 그대로 qa-plan 영역이다(R5). 이 표가 답하는 것은
> "이 페이즈가 어떤 파일을 만드는가" 이고, 테스트 파일이 만들어지는 파일이라는 사실은 그 질문의 답에 속한다.

## 4. 파일별 구현 상세 (책임·의존·시그니처 수준)

> dev-planner는 **HOW의 골격**까지만 작성한다. 실제 코드 본문은 `/develop` 단계 책임.
> 코드 블록은 **인터페이스/시그니처가 핵심 결정사항인 경우에만** 사용한다.
>
> **필드 명세 의무**: 본 페이즈에서 다루는 모든 Request/Response DTO·화면 input 필드는 §4 안에 *필드 단위 표*로 명세한다. **여기가 필드 계약의 단일 출처다** — 루트는 DTO 목록과 소유 페이즈만 갖는다.
> - **BE 페이즈**(`be` / `be-*`): §4-X 에 Request DTO 필드 표 + (별도) §4-X+1 에 Response DTO 필드 표 (예시: §4-5 Request, §4-6 Response)
> - **FE 페이즈**(`fe-*`): §4-N 에 화면 input 필드 표 (name·type·maxlength·pattern·placeholder)
> - **§4-X / §4-N 의 X·N**: §4 sub-section 의 다음 번호. 페이즈 §3 구현 대상 파일 수에 따라 §4-1·§4-2·... 다음에 이어지는 번호이며, 페이즈마다 다르다.
> - **계약**: BE Request DTO 필드명 == FE input name == AJAX payload 키 (3 곳 동일). 검증 규칙도 양쪽 동일 (FE ≤ BE).

### 4-1. `AuthController.java` (NEW)

**책임**: HTTP 엔드포인트 노출, AuthService 위임
**위치**: `src/main/java/com/acme/platform/{project}/auth/AuthController.java`
**의존**: `AuthService`, `ResponseTemplate`
**주요 메서드**:

| 메서드| HTTP| 경로| Request| Response|
|-------|------|-----|---------|----------|
| loginPage| GET| /auth/login| —| View `auth/login`|
| requestOtp| POST| /auth/login/otp| OtpRequest| ResponseTemplate<Void>|
| verify| POST| /auth/login/verify| VerifyRequest| ResponseTemplate<Void> + Session|

**에러 처리**: `GlobalExceptionHandler` 위임 (페이즈별 신규 핸들링 없음)

### 4-2. `login.html` (NEW)

**위치**: `src/main/resources/templates/auth/login.html`
**레이아웃**: `common/layout/layout.html` 확장
**주요 DOM 요소**: `#userId`, `#password` (SecureKeypad 연동), `#sendOtpBtn`, `#otpCode`, `#verifyBtn`
**스크립트**: `/js/auth/login.js`

### 4-3. `login.js` (NEW)

**위치**: `src/main/resources/static/js/auth/login.js`
**책임**: SecureKeypad 초기화, OTP 요청·검증 AJAX 처리
**주요 함수 (시그니처만)**:
- `initSecureKeypad(targetEl)` — 비밀번호 입력 영역에 보안키패드 바인딩
- `requestOtp()` — `ajax.send('/auth/login/otp', ...)`
- `verifyOtp()` — `ajax.send('/auth/login/verify', ...)`

**구체 구현**: `/develop phase-2-auth` 단계에서 결정

### 4-4. `AuthMapper.xml` (NEW)

**위치**: `src/main/resources/mapper/AuthMapper.xml`
**주요 SQL**:
- `selectUserByLoginId` — 사용자 조회 (user_info 기준)
- `updateOtpAttempt` — OTP 시도 기록

> SQL 본문은 `/develop` 단계에서 작성. 본 §4는 SQL ID와 책임만 명시.

### 4-5. Request DTO 필드 (BE 페이즈 의무 — `LoginVerifyReq`)

**사용 엔드포인트**: `POST /auth/login/verify`
**FE input 매핑**: `fe-login` 페이즈 §4-N 화면 input 표 (name 일치)

| 필드명| 타입| 필수| 검증| 의미|
|--------|-----|-----|------|------|
| userId| String| Y| `@NotBlank @Pattern(^[a-zA-Z0-9]{4,20}$)`| 사용자 로그인 ID|
| passwordEnc| String| Y| `@NotBlank`| 보안키패드 암호화 비밀번호|
| otpCode| String| Y| `@Pattern(^\d{6}$)`| 6자리 OTP 인증코드|

### 4-6. Response DTO 필드 (BE 페이즈 의무 — `LoginVerifyRes`)

| 필드명| 타입| 필수| 검증| 의미|
|--------|-----|-----|------|------|
| memberId| Long| Y| —| 회원 ID|
| memberNm| String| Y| —| 회원명 (마스킹 적용)|
| sessionExpireSec| Integer| Y| —| 세션 만료 잔여 초|

> **BE/FE 정합 룰**: BE 페이즈 §4-X 가 필드 계약의 단일 출처다. FE 페이즈 §4-N 화면 input 표가 그 표를
> 참조해 필드명을 일치시키고 검증을 FE ≤ BE 로 둔다(BE 가 최종 게이트). 루트에 같은 표를 복사해 두고
> 양쪽을 동시 갱신하는 방식은 쓰지 않는다 — 그 동시 갱신이 곧 드리프트의 정의다.

### 4-N. 화면 input 필드 (FE 페이즈 한정 — `login.html`)

> **FE 페이즈** 에서 Request DTO 표 대신 화면 input 필드 표를 작성한다 (BE Request DTO 필드명 == FE input name).

| name| type| maxlength| pattern| placeholder| 비고|
|------|------|-----------|---------|-------------|------|
| userId| text| 20| `[a-zA-Z0-9]{4,20}`| 아이디| —|
| password| password| 30| —| 비밀번호| SecureKeypad 바인딩 (`#password`)|
| otpCode| text| 6| `\d{6}`| 인증코드 6자리| inputmode="numeric"|

> AJAX payload 키는 `name` 컬럼과 동일. 단 `password` 는 `passwordEnc` 로 암호화 후 전송 (보안키패드 RSA OAEP).
> FE 검증 규칙은 BE 검증과 동일하거나 약함 (BE 가 최종 게이트). FE 가 BE 보다 강한 검증 두지 않음.

---

**가이드 라인**:
- 클래스 책임, 의존 주입 대상, 메서드 시그니처, 파일 경로 — **명시**
- HTTP 엔드포인트 매핑, DOM 주요 요소, AJAX 호출 함수명 — **명시**
- **Request/Response DTO 필드 표 (BE 페이즈) / 화면 input 필드 표 (FE 페이즈)** — **필드 명세 의무**
- 메서드 본문 구현, SQL 쿼리 본문, JS 함수 본문 — **`/develop` 단계 위임**
- ️ 코드 블록은 시그니처가 결정사항일 때만 (예: 인터페이스, DTO 필드, Enum)
- ️ **SQL 본문을 부득이 §4·§5에 작성하는 경우** (예: 짧은 SELECT, 시그니처가 결정사항인 경우) — **함수 시그니처 호환성 검증 의무**: 5단계 §5-3 (코드 탐색의 DB 스키마 탐색 부절) 메타데이터로 사용 컬럼 `data_type`을 확인하고, `TO_CHAR`/`TO_DATE`/`CAST`/`||`/산술 등 모든 함수의 입력 인자 타입이 PostgreSQL 함수 오버로드 표에 존재하는지 확인한다. 특히 `TO_CHAR(varchar, format)`은 시그니처 부존재로 런타임 에러 → 명시 캐스팅(`TO_DATE` 경유) 사용. 검증을 생략한 채 SQL 본문을 작성한 경우 `/develop` 위임으로 후퇴한다.

## 5. DB 명세 (이 페이즈에서 필요한 것만)

### 5-1. 기존 테이블 사용

> **컬럼 표기 의무**: "컬럼" 셀에는 `column_name (data_type)` 형식으로 표기한다 (예: `vld_dt (varchar(8))`, `usag_id (varchar)`, `sprt_amt (numeric)`). data_type 은 5단계 §5-3 (코드 탐색의 DB 스키마 탐색 부절) 에서 `information_schema.columns` 로 조회한 실제 메타데이터를 그대로 인용한다. dev-backend 는 4-1-1 에서 메타데이터를 자체 재조회하지만, 본 표는 dev-backend 4-1-2 함수 시그니처 호환성 검증의 *대조 참고 자료* 역할도 한다 (dev-planner 가 작성 시점에 이미 호환성 가드를 통과한 SQL 임을 의미).

| 테이블| 용도| 컬럼 (data_type)| 비고|

### 5-2. 신규 테이블 DDL 초안 (있는 경우)

> **사전 준비 제안서(`{과업번호}_dev_prepare.md`)가 입력에 있으면 DDL 원문의 소유자는 그 문서 §2 의 A항목이다.** 페이즈 문서는 실행문을 다시 쓰지 않고 `사전준비 A-1 (DDL) — 착수 전 반영 전제` 처럼 **항목 ID 로 가리킨다.** 원문이 두 곳에 있으면 사람이 실행한 것과 계획서가 적어 둔 것이 갈라지고, 어느 쪽이 진짜인지 판정할 방법이 없어진다. 제안서가 없을 때만 아래 형식으로 초안을 쓴다.
```sql
CREATE TABLE objn_info (
 objn_id VARCHAR(20) PRIMARY KEY,
 ...
);
COMMENT ON TABLE objn_info IS '이의신청 접수';
COMMENT ON COLUMN objn_info.objn_id IS '이의신청 ID';
...
```
> DBA 리뷰 필요 — Phase 착수 전 확인

### 5-3. 신규 인덱스
```sql
CREATE INDEX idx_objn_aply ON objn_info (aply_id);
```

## 6. 페이즈 내 외부 연동 (글로벌 §7 참조)
이 페이즈에서 호출하는 외부 API/시스템:

| 연동| 클래스 (루트 §7에서)| 이 페이즈의 사용처| 요청/응답 구체|
|-----|-------------------|-----------------|--------------|
| ext-api| `InnerApiManager`| 회원조회 → `POST /user/auth`| 요청: CI+주민번호 7자리 / 응답: 가입여부|

## 7. Task 분해 (기능 단위)
qa-planner가 TC 그룹으로 매핑할 핵심 입력.

| Task ID| Task 제목| 대상 파일| 예상 시간| 의존 Task| 수락 기준|
|---------|---------|---------|---------|---------|---------|
| P2-T01| 로그인 페이지 렌더링| `login.html` + `AuthController#loginPage`| 0.5d| —| GET /auth/login 200 응답|
| P2-T02| OTP 발송 엔드포인트| `AuthController#requestOtp` + `AuthService#sendOtp`| 1d| P2-T01| 정상 요청 시 OTP 발송 + DB 기록|
| P2-T03| OTP 검증 + 세션 생성| `AuthController#verify` + `AuthService#verifyOtp`| 1d| P2-T02| 검증 성공 시 세션 쿠키 발급|
| P2-T04| 로그인 JS + SecureKeypad 연동| `login.js`| 0.5d| P2-T01| 비번 암호화 전송, 평문 DOM 미노출|
| P2-T05| AuthMapper 작성| `AuthMapper.java` + `AuthMapper.xml`| 0.5d| —| 사용자 조회 SQL 통과|

## 8. 다음 페이즈로의 인계사항
이 페이즈가 남기는 가정·부채·연결점:

| 항목| 내용| 후속 페이즈|
|------|-----|----------|
| 공통 Config 완성| SecurityConfig, RedisConfig 이후 수정 없음 가정| 3, 5, 7|
| AuthUser 세션 객체| 이후 페이즈에서 `@SessionAttribute`로 참조| 3, 4|
| 미구현| ID/PW 찾기는 Phase 7에서 다룸| 7|

## 9. 완료의 정의 (DoD) — 이 페이즈의 종료 판정표

> develop 수렴 루프가 이 표를 대조해 페이즈 종료를 판정한다. 각 기준에 **심판 종류**를 태그한다:
> **객관**(테스트 GREEN·완성도·특성화) = develop 자동 루프가 채움 / **주관**(품질·정합) = 체크하되 사람에게 surface, 자동수정 금지.

- [ ] AC-1: {수용 기준 — §7 Task 분해의 수락 기준에서 도출} … [심판: 테스트 GREEN] (객관/자동)
- [ ] AC-2: {수용 기준} … [심판: 테스트 GREEN] (객관/자동)
- [ ] DoD-완성도: §3 구현 대상 파일·§7 Task 전부 구현 … [심판: 완성도 체크리스트] (객관/자동)
- [ ] DoD-회귀: MODIFY 항목 경로의 특성화 테스트 still GREEN … [심판: 특성화 GREEN] (객관/자동)
- [ ] DoD-품질: 기계적 컨벤션 게이트 통과(린터·포매터·빌드 경고) … [심판: 언어팩 정적 분석] (객관/자동)
- [ ] DoD-계약정합: §4 계약(필드명·시그니처·응답 형태)과 구현 일치 … [심판: 사람 확인 — 통합 리뷰에서 일괄] (주관/surface)

> NEW 항목만 있는 페이즈는 DoD-회귀 줄을 생략한다. AC 항목은 §7 Task 분해의 *수락 기준* 컬럼과 1:1로 맞춘다 (페이즈 단위로 모은 종료 체크리스트).

> **`/code-review` 를 페이즈 DoD 에 넣지 않는다.** 코드 리뷰는 **모든 페이즈 완료 후 누적 diff 대상으로 1회**만 수행하며, 그 소유자는 오케스트레이터(`dev-autopilot` 4단계 또는 사람)다. 페이즈마다 리뷰를 걸면 (a) 같은 지적을 통합 리뷰가 다시 내고 (b) 페이즈 경계에서만 보이는 모순(인계 주석이 다음 페이즈 미구현 동작을 사실처럼 서술하는 등)은 어차피 델타 리뷰가 못 잡는다. 실측: 페이즈 델타 리뷰 3회(총 7.4분 + 페이즈별 수정 라운드)를 돌고도 그 모순은 통합 리뷰에서 처음 검출됐다.

---
````

**모든 페이즈 문서에 대해 위 9섹션(§1~§7 + §8 인계 + §9 완료의 정의)을 채운다.** 각 페이즈 문서는 **독립적으로 읽고 개발 착수 가능**해야 한다 (루트 문서 참조는 상수·외부연동·재사용 자산 3개로 제한). **§검증 방법(테스트 카테고리·커버리지)은 작성하지 않는다 — qa-plan 페이즈별 테스트 문서 영역**. §9 DoD 는 종료 *판정표*일 뿐 테스트 코드/커버리지 명세가 아니다. 단 §9 가 테스트 GREEN 을 요구하면 그 테스트 소스 **경로**는 §3 에 들어간다 — 만들 파일 목록이지 테스트 명세가 아니다.

> **FE 페이즈는 BE 페이즈 §4-X 를 Read 한다.** 필드 계약의 단일 출처가 거기이므로, 화면 input 표를 쓸 때 그 문서를 열어 필드명을 맞추고 검증을 FE ≤ BE 로 둔다. 이 참조는 위 "루트 문서 참조 3개 제한" 과 다른 층이다 — 페이즈끼리의 계약 참조이고, 루트를 경유하지 않는 것이 요점이다.
