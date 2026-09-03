# severity-rules — code-review 패턴 데이터 (L3 결정론 자산)

> **단일 출처**. SKILL.md 가 STEP 1 매칭 시 본 파일을 Read 한다. 조직별 룰 추가/수정은 본 파일만 편집.
>
> severity_rules 매칭 알고리즘은 [`severity-algorithm.md`](severity-algorithm.md) STEP 1 참조.
>
> **변수 치환**: `{{config.commonUtilsArtifact}}` 같은 표기는 `.claude/config/project.yaml` 의 해당 키로 치환된다.
>
> **심각도는 ID 접두가 정한다** — `C**`=Critical / `W**`=Warning / `S**`=Suggestion. 본 파일은 층별 단편(core → 언어팩 → 프레임워크팩)을 이어 붙인 결과이고, 프레임워크 단편은 `## {프레임워크} 특화 룰` 같은 자체 제목 아래에 여러 심각도의 룰을 함께 둔다. **섹션 제목이 아니라 ID 접두로 판정한다** (스캐너·리뷰 에이전트 공통). 심각도 컬럼을 따로 가진 표(`| 코드 | 심각도 | 룰 | 축 |`)는 그 컬럼이 우선이다.

---

## Critical

> 런타임 장애 또는 보안 사고 직결 이슈만 해당. 코드 스타일/컨벤션은 절대 Critical 이 아니다.

| ID | 이름 | keywords | 설명 | 축 | 표준 |
|----|------|----------|------|----|------|
| C01 | null/undefined 역참조 | null 체크 없이, undefined 역참조, TypeError, optional chaining 미사용 | null 또는 undefined 체크 없이 프로퍼티 접근 또는 메서드 호출 | R |  |
| C02 | 미처리 Promise rejection | unhandled rejection, await 누락, .catch 없음, Promise 미처리 | async 함수에서 await 또는 .catch() 없이 Promise 방치 → 런타임 충돌 | R |  |
| C03 | SQL/NoSQL Injection | SQL Injection, 쿼리 직접 조합, 파라미터 미바인딩, template literal SQL | 파라미터 바인딩 없이 사용자 입력을 쿼리에 직접 삽입 | S | CWE-89 / OWASP-A03:2021 |
| C04 | XSS 취약점 | XSS, innerHTML, dangerouslySetInnerHTML, eval, 사용자 입력 HTML 삽입 | 사용자 입력을 이스케이프 없이 HTML/JS에 직접 삽입 | S | CWE-79 / OWASP-A03:2021 |
| C06 | 민감정보 하드코딩 | 하드코딩, 비밀번호, API Key, 토큰, secret, password | 비밀번호·API Key·토큰 등 민감정보를 코드·설정 파일에 하드코딩 | S | CWE-798 / OWASP-A07:2021 |
| C07 | 데이터 손실 가능성 | 트랜잭션 미적용, 롤백 불가, 데이터 손실 | 트랜잭션 미적용·롤백 불가로 인한 데이터 손실 가능성 | R |  |
| C08 | 무한루프/무한재귀 | 무한루프, 무한재귀, 종료 조건 없음, setInterval 미정리 | 무한루프·무한재귀 또는 정리되지 않는 타이머/구독 | R |  |
| C09 | 리소스 누수 | 커넥션 누수, 메모리 누수, 리소스 미해제, 스트림 미닫기, 리스너 미해제 | DB·파일·스트림·이벤트 리스너 미해제로 인한 누수 | R |  |
| C10 | `any` 타입 남용 | any 타입, as any, 타입 캐스팅 무력화, 타입 안전성 손실 | `any` 또는 `as any` 로 타입 시스템을 우회하여 런타임 오류 위험 초래 | R |  |
| C11 | `eval` / 동적 코드 실행 | eval, Function constructor, new Function, 동적 코드 실행 | `eval()` 또는 `new Function()` 사용으로 인한 코드 인젝션 취약점 | S | CWE-95 / OWASP-A03:2021 |

---

## Warning

> 즉시 장애는 아니지만 유지보수·성능·코드 품질에 부정적 영향을 주는 이슈. 컨벤션 위반은 여기에 해당.

| ID | 이름 | keywords | 설명 | 축 | 표준 |
|----|------|----------|------|----|------|
| W01 | 미사용 import/변수 | 미사용 import, 미사용 변수, unused, no-unused-vars | 미사용 import 또는 미사용 변수 | U |  |
| W03 | `==` 대신 `===` 미사용 | ==, ===, 타입 비교 | 동등 비교에 `==` 대신 `===` 미사용 | U |  |
| W04 | 성능 저하 가능성 | N+1, 불필요한 루프, 성능 저하, 대량 조회 | N+1 쿼리·불필요한 루프 등 성능 저하 가능성 | R |  |
| W05 | 예외 삼킴 | 예외 삼킴, catch 블록, 로그 없이 무시, 빈 catch | catch 블록에서 로그 없이 예외 무시 | R |  |
| W06 | 주석 처리된 코드 잔재 | 주석 처리된 코드, commented out, 코드 블록 잔재 | 주석 처리된 코드 블록 잔재 | U |  |
| W07a | 스타 임포트 | import *, 스타 임포트, wildcard import | `import * as ...` 등 불필요한 와일드카드 임포트 | U |  |
| W07b | 네이밍 규칙 위반 | 네이밍 위반, camelCase, PascalCase, 명명 규칙 | 클래스/메서드/변수 네이밍 컨벤션 위반 | U |  |
| W07c | `var` 사용 | var 사용, var 선언 | 신규 코드에서 `var` 사용 (`let`/`const` 권장) | U |  |
| W07d | `console.log` 잔재 (프로덕션) | console.log, 디버그 로그, 프로덕션 로그 | 프로덕션 코드에 `console.log` 잔재 (Logger 사용 권장) | U |  |
| W07e | 프로젝트 코딩 패턴 불일치 | 패턴 불일치, 코딩 패턴 불일치 | 해당 프로젝트의 기존 코딩 패턴 미준수 | U |  |
| W10 | 객체 불변성 위반 | readonly 미사용, 입력 객체 변이 | 입력 DTO/파라미터 객체를 `readonly` 없이 직접 변이 | R |  |
| W11 | 비동기 컨텍스트 추적 ID 전파 누락 | AsyncLocalStorage, x-request-id, 비동기 컨텍스트, 추적 ID | 비동기 경계에서 요청 추적 ID 전파 누락 | Tr |  |
| W14 | 비동기 예외 유실 | Promise void, 비동기 예외, fire-and-forget | fire-and-forget Promise 에서 예외 처리 누락 → 오류 유실 | R |  |
| W15 | 루프 내 로깅 | 루프 내 log, for문 logger, while logger, 반복 로깅 | 반복문 내부 반복 로그 호출 → 로그 폭증·성능 저하 | R |  |

---

## Suggestion

> 기능에 영향 없는 품질 개선 제안. 문서화·스타일·구조 개선 등.

| ID | 이름 | keywords | 설명 | 축 | 표준 |
|----|------|----------|------|----|------|
| S01 | TSDoc 미작성 | TSDoc, 문서화, 주석 미작성 | TSDoc 내용 오류 또는 미작성 | Tr |  |
| S02 | `const` 미사용 | const, let, 재할당 없는 | 재할당 없는 변수에 `const` 대신 `let` 사용 | U |  |
| S03 | 파일 끝 개행 없음 | 개행 없음, EOF, newline | 파일 끝 개행 없음 | U |  |
| S04 | 코드 구조 개선 | 구조 개선, 리팩토링, 가독성 | 코드 구조 개선 아이디어 | U |  |
| S05 | `console.log` 잔재 (개발) | console.log, 디버그 로그 | 개발용 `console.log` 잔재 (Logger로 교체 권장) | U |  |

---

## Suggestion

> **과잉설계 공통 룰 (Core 소유).** 언어·프레임워크 무관하게 성립하는 "덜어낼 것" 판정. 스택 고유 과잉설계(특정 프레임워크 관용구)는 해당 팩 단편이 가진다.
>
> **baseline 심각도는 🔵 Suggestion 고정 — 어떤 경우에도 Warning 이상으로 올리지 않는다.** 과잉설계 판정에는 취향이 섞이므로 커밋 게이트(`base-rule` §4)를 잡으면 우회만 늘어난다. 덜어내기는 제안으로 남기고 차단은 결함에만 쓴다.

| ID | 이름 | keywords | 설명 | 축 | 표준 |
|----|------|----------|------|----|------|
| S90 | 표준 라이브러리 재구현 | 직접 구현, 손으로 구현, 수동 파싱, 재구현, 표준 라이브러리 | 언어 표준 라이브러리·런타임이 이미 제공하는 기능을 직접 구현 | U |  |
| S91 | 구현체 1개 추상화 | 인터페이스 1개, 구현체 하나, 팩토리, 래퍼 클래스, 추상화 계층 | 구현체 또는 호출자가 하나뿐인 인터페이스·팩토리·래퍼·계층 | U |  |
| S92 | 미사용 유연성 | 확장 포인트 미사용, 설정값 미사용, 죽은 분기, 도달 불가 코드 | 아무도 설정하지 않는 옵션, 아무도 타지 않는 분기·확장 포인트 | U |  |
| S93 | 불필요 의존 추가 | 의존 추가, 라이브러리 추가, 신규 의존 | 몇 줄로 되는 일에 새 외부 의존을 추가 | U |  |

> **오탐 방지 — 아래는 과잉설계가 아니다. 지적하지 않는다.**
> 요구사항·계약이 명시적으로 요구한 추상화, 신뢰 경계의 입력 검증, 데이터 손실을 막는 예외 처리, 보안 조치, 접근성 처리, 그리고 최소 단위 테스트 1개.

## Next.js 특화 룰 (fw-nextjs)

| 코드 | 심각도 | 룰 | 축 |
|---|---|---|---|
| NEXT-001 | Critical | 비밀 값(API 키·토큰·자격증명)이 `NEXT_PUBLIC_` 또는 클라이언트 컴포넌트에 노출 | S |
| NEXT-002 | Critical | Server Action(`'use server'`)이 입력 검증·인가 없이 쓰기 수행 | S |
| NEXT-003 | Warning | 클라이언트 `useEffect` 초기 패칭(서버 컴포넌트로 이동 가능) | R |
| NEXT-004 | Warning | 서버 `fetch` 캐싱 의도(force-cache/no-store/revalidate) 미명시 | R |
| NEXT-005 | Suggestion | 상호작용 없는 컴포넌트의 불필요한 `'use client'`(서버 렌더 이점 상실) | U |
| NEXT-006 | Suggestion | 쓰기 후 `revalidatePath`/`revalidateTag` 캐시 무효화 누락 | R |

## React 특화 룰 (fw-react)

| 코드 | 심각도 | 룰 | 축 |
|---|---|---|---|
| REACT-001 | Critical | Hook 규칙 위반: 조건문·반복문·조기 return 이후 Hook 호출(렌더 간 호출 순서 변동) | R |
| REACT-002 | Warning | `useEffect` 구독·타이머·리스너 생성 시 cleanup 미반환(누수·중복 구독) | R |
| REACT-003 | Warning | Effect 의존성 배열 누락 또는 `exhaustive-deps` 억제(stale closure) | R |
| REACT-004 | Warning | state 직접 변경(`push`/필드 대입) 또는 불변 갱신 누락 | R |
| REACT-005 | Warning | 리스트 `key` 누락 또는 배열 인덱스 key 사용 | U |
| REACT-006 | Suggestion | 렌더 본문 내 부작용(fetch·전역 변경·DOM 조작) → 핸들러/Effect로 이동 | R |
