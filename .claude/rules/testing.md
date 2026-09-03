# Testing Requirements

> **적용 대상:** `**/*`

## 권장 테스트 커버리지: 80%

테스트 유형:
1. **Unit Tests** — Service, Util 등 개별 클래스/메소드 단위 검증
2. **Integration Tests** — Controller MockMvc, API 엔드포인트, DB 연동 검증
3. **E2E Tests** — Playwright MCP를 활용한 브라우저 기반 사용자 플로우 검증 (HTML 프로젝트만)

## 테스트 기술 스택

| 항목 | 기술 |
|------|------|
| Language | TypeScript (Node.js) |
| Framework | vitest (프레임워크가 별도 러너를 정하면 그쪽 — 프레임워크 팩 참조, 예: NestJS는 감지값/기본 vitest) |
| Mock | `vi.fn()`, `vi.spyOn()`, `vi.mock()` |
| 매개변수화 | `test.each` / `describe.each` |
| HTTP 테스트 | `supertest` 또는 프레임워크 테스트 유틸 |
| E2E | Playwright MCP 도구 (브라우저 직접 조작) |
| Build/Run | npm/pnpm (`npm test`) |
## Test-Driven Development

권장 워크플로:
1. 테스트 먼저 작성 (RED)
2. 테스트 실행 — 실패 확인
3. 최소 구현 작성 (GREEN)
4. 테스트 실행 — 통과 확인
5. 리팩토링 (IMPROVE)
6. 커버리지 확인 (목표: 80%+)

## 작업유형별 방법론 선택

작업 항목마다 방법론을 가른다 (프로젝트 나이가 아니라 *이번 작업이 무엇이냐*가 기준):

| 이번 작업 | 유형 | 방법론 |
|----------|------|--------|
| 신규 순수 단위 (util·계산 로직·신규 메서드, 외부 의존 없음) | NEW | TDD — 실패 테스트 먼저 → 구현 → GREEN → 리팩토링 |
| 기존 플로우 수정 | MODIFY | DDD — 특성화 게이트 (아래) |
| 버그 수정 | BUGFIX | RED 재현 → 수정 → GREEN |

> 기본 자세: 수정 작업은 DDD(특성화) 우선, 신규 단위는 TDD.

## DDD — 특성화 테스트 트랙 (수정 작업)

특성화 테스트(characterization test) = 현재 동작을 *정답 검증이 아니라 현 상태 그대로* 박제하는 테스트. 변경 후 still GREEN 인지로 회귀(잘 돌던 동작이 변경 때문에 망가짐)를 탐지한다.

> 비유: 리모델링 전 집 사진. 정답을 검증하는 게 아니라 현재 상태를 박제해 두고, 변경 후 사진과 비교해 사라진 것을 잡는다.

### PRESERVE 게이트 (수정 작업 5단계)

1. **변경 대상 경로 식별** — 수정할 함수/쿼리가 현재 내는 입출력을 확인한다.
2. **특성화 테스트 작성** — 현재 동작을 그대로 스냅샷한다 (정답 검증 아님). 외부 의존이 강하면 통합 테스트 레벨로.
3. **GREEN 확인** — 특성화 테스트가 현재 코드에서 통과 (안전망 구축 완료).
4. **변경 수행** — IMPROVE.
5. **변경 후 still GREEN 확인** — 의도한 동작 변화만 특성화 테스트에 반영하고, 의도치 않은 회귀는 즉시 드러나게 한다.

> 종료 신호: "특성화 테스트 still GREEN(= 회귀 없음)". 신규(NEW) 작업은 본 게이트를 생략하고 TDD/RED 흐름을 따른다.

## 커버리지 원칙

- **소급 금지** — 레거시 전체에 특성화 테스트를 백필하지 않는다. *이번에 건드리는 경로만* 안전망을 구축한다.
- 커버리지 80% 는 **신규 코드 기준** 목표다 (레거시 전체에 강제하면 우회만 늘어난다).

## 테스트 실행

```bash
# 전체 테스트
npm test

# 특정 테스트 파일
npm test -- path/to/user.test.ts

# 이름으로 선택
npm test -- -t "should return user by id"

# 커버리지 확인
npm test -- --coverage
```

> 프레임워크가 별도 테스트 스킬을 두는 경우(예: NestJS — 러너는 프로젝트가 정함: 감지값 또는 기본 vitest) 명령·러너는 프레임워크 팩 가이드를 따른다.

## 테스트 실패 트러블슈팅

1. 테스트 격리 확인 (다른 테스트에 의존하지 않는지, `beforeEach`/`afterEach` 클린업 확인)
2. Mock 설정 검증 (`vi.fn()` 반환값 누락, `mockResolvedValue` vs `mockReturnValue` 혼용 확인)
3. 구현을 수정한다, 테스트를 수정하지 않는다 (테스트가 잘못된 경우 제외)

## 커맨드 지원

| 커맨드 | 역할 |
|--------|------|
| `/qa-test {계획서.md}` | 테스트 계획서 기반으로 기존 테스트 실행 + 결과 집계 (GREEN/RED 판정) |
| `/qa-test {계획서.md} e2e` | 위 + Playwright E2E 테스트 추가 실행 |
