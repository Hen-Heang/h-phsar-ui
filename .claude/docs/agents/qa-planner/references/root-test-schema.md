---
name: root-test-schema
description: 루트 테스트 계획서 §1~§8 출력 schema (테스트 메타·범위·환경·페이즈별 TC 집계·전역 테스트 데이터·전역 DoD·우선순위·qa-tester 실행 가이드). qa-planner 7단계 진입 시(루트 테스트 계획서 Write 직전) Read.
---

# 루트 테스트 계획서 schema

> qa-planner 7단계 (루트 테스트 계획서 생성) 단일 출처. 본문에서는 본 파일로 위임한다.

---

## 경로

```
{workspace_root}/{{config.outputDir}}/plans/{task_number}/{task_number}_test_plan.md
```

디렉토리가 없으면 생성:

```bash
mkdir -p "{workspace_root}/{{config.outputDir}}/plans/{task_number}/phases"
```

---

## 루트 테스트 계획서 스키마 (8섹션)

````markdown
# 테스트 계획서 — {과업번호} {주제}

## 1. 테스트 메타
| 항목| 값|
|------|-----|
| 브리프 파일| {브리프 절대경로}|
| 개발 계획서 (루트)| {루트 개발계획서 절대경로}|
| 페이즈 수| N|
| 테스트 계획 생성일| {YYYY-MM-DD}|
| 대상 프로젝트| {project_root}|
| 프로젝트 유형| (브리프 §2)|
| 커버리지 목표| 80% (Line Coverage)|
| 총 TC 수| {N개}|

## 2. 테스트 범위

### 2-1. 포함
- {브리프 §3 Primary 프로젝트 범위}
- {페이즈 목록 나열 — phases/phase-N-{slug}-test.md 링크}

### 2-2. 제외
- {브리프 §3 Related 프로젝트(읽기·참조만) — 변경 없으므로 테스트 제외}
- {레거시 검증된 기능 중 본 과업 영향 없는 것}

## 3. 테스트 환경
테스트 런타임·프레임워크·Mock·빌드 도구는 프로젝트 언어에 따른다. 사용하는 언어팩의 `docs/agents/qa-planner/references/test-schema-lang.md`(있으면)를 참조한다.

| 항목| 내용|
|------|------|
| E2E| {Playwright MCP 또는 "해당 없음 — API 프로젝트"}|
| DB| {프로젝트 DB 테스트 프로파일}|

## 4. 페이즈별 TC 집계

| Phase| 페이즈명| 테스트 문서| Unit| Integration| E2E| P0| P1| P2| P3| 합계|
|:--:|---------|-----------|:---:|:-----------:|:---:|:--:|:--:|:--:|:--:|:----:|
| 1| 인프라 & 공통| `phases/phase-1-infra-test.md`| 5| 3| 0| 1| 5| 2| 0| 8|
| 2| Auth & Account| `phases/phase-2-auth-test.md`| 8| 5| 3| 3| 9| 4| 0| 16|
| ...|
| **합계**| —| —| **N**| **N**| **N**| **N**| **N**| **N**| **N**| **N**|

## 5. 전역 테스트 데이터 설계

### 5-1. 공유 테이블 (여러 페이즈 공용)
| 테이블| 사용 페이즈| 정상값| 경계값| 무효값|
|-------|-----------|-------|-------|-------|
| {테이블명}| 2, 4, 7| ...| ...| ...|

### 5-2. 전역 상수 (루트 개발계획 §6)
| 상수| 값| 테스트 시 주입 방법|

## 6. 전역 DoD 체크리스트

> **출처 단일화**: 본 체크리스트의 각 항목은 외부 단일 출처를 인용하며, qa-plan은 *어떤 항목을 페이즈 종료 게이트로 적용하는가* 의 명시 책임만 가진다.

- [ ] 모든 페이즈 테스트 Green (출처: `rules/testing.md`)
- [ ] 전체 Line Coverage 80% 이상 (빌드 도구 커버리지 측정 결과 — 출처: `rules/testing.md` + `rules/base-rule.md` 체크리스트)
- [ ] `/code-review` WARNING/CRITICAL 0건 (출처: `rules/base-rule.md §4`)
- [ ] API 문서 주석 전 클래스·메서드 작성 (출처: `rules/base-rule.md` 「문서화 규칙」 절 — 절 번호는 언어팩에 따라 §5 또는 §6 — 자동 측정)
- [ ] `.yml/.properties` 하드코딩 없음, 암호화 적용 (출처: `rules/base-rule.md §1` + 워크스페이스 `CLAUDE.md` *설정 보안 규칙*)
- [ ] 커밋 메시지 컨벤션 준수 (출처: `rules/base-rule.md §7` + `/git` 스킬 `commit-convention.md` 단일 출처)

## 7. 우선순위 분류 기준
| P| 기준| 본 과업 대표 TC 영역|
|:-:|------|-------------------|
| P0| 인증·권한·보안·핵심 변경 연산| Auth(Phase 2), Keypad(Phase 1), 지급승인(Phase 4)|
| P1| 주요 기능 정상 플로우| 대상자 조회·신청 완료·카드 발급|
| P2| 예외·경계값·에러| 응답코드 100/200/300/400 분기, 입력 검증|
| P3| UI·편의| 페이지 렌더링·메시지 표시|

## 8. qa-tester 실행 가이드

### 8-1. 전체 실행
```
/qa-test {과업번호}
```
→ 루트 테스트 계획서 로드 → 모든 페이즈 TC 병렬 실행 → 통합 결과 집계

### 8-2. 페이즈 단위 실행
```
/qa-test {과업번호} phase-{N}
```
→ 해당 페이즈 테스트 계획서만 로드 → 해당 페이즈 TC만 실행

### 8-3. 유형 필터
```
/qa-test {과업번호} unit ← Unit 테스트만
/qa-test {과업번호} integration ← Integration만
/qa-test {과업번호} e2e ← E2E만 (지원 프로젝트 한정)
```

### 8-4. 페이즈 + 유형 조합
```
/qa-test {과업번호} phase-2 integration
```
````
