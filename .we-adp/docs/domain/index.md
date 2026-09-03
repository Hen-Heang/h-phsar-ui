---
title: 도메인 색인
type: index
updated: 2026-09-02
---

H-Phsar(`h-phsar-ui`) 도메인 분석 번들의 진입점. 소스를 탐색하기 전 이 페이지 → 대상 모듈/도메인 페이지 순으로 참조한다.

## 매트릭스

| 모듈 | 도메인 |
|---|---|
| h-phsar-ui | [[domains/marketplace]] |

## 페이지 목록

| 페이지 | 종류 | 설명 |
|---|---|---|
| [[modules/h-phsar-ui]] | module | 유일한 물리 모듈 — 인증/관리자, 구매자, 공급자 3영역 + 레거시 리다이렉트 shim |
| [[domains/marketplace]] | domain | H-Phsar 마켓플레이스 도메인 개요 |
| [[common]] | common | 플랫폼 공통 관행(§0) — 레거시 네이밍 기술부채 포함 |
| taxonomy.md | taxonomy | 도메인 분류 체계(등재값: marketplace) |
| tables/catalog.md | tables | (프론트라 테이블 없음 — 참고용) |

## 소스맵

- 라우트: `src/app/**/page.tsx` (55개 — /admin, /buyer, /distributor(레거시), /retailer(레거시), /supplier, /sign-in, /sign-up)
- 화면: `src/screens/**`, `src/components/{Admin,Buyer,Supplier}/**`
- 상태: `src/redux/slices/**` (Redux Toolkit) + 일부 TanStack Query
- API: `src/redux/services/**`, `src/lib/**/*.service.ts` → `src/utils/api.ts`(단일 Axios 인스턴스)
- 역할/라우트 설정: `src/config/{roles,routes,navigation,order-status}.ts`

## 모듈 커버리지

| 모듈(경로) | 티어 | 방문 | 룰 | 흐름 | 비고 |
|-----------|------|:---:|:--:|:---:|------|
| h-phsar-ui | 도메인 | ✓ | 24 | 8 | 단일 모듈, 3개 병렬 서브에이전트 배치(인증/관리자, 구매자+레거시retailer, 공급자+레거시distributor)로 전수 방문 |

<!-- catalog-ledger:begin -->
| 모듈(경로) | 카탈로그 행 | 의미 채움 | 테이블 수 |
|---|---|---|---|
| h-phsar-ui | 55 | 55/55 | 0 |
<!-- catalog-ledger:end -->

<!-- domain-tables-index:begin -->
| 도메인 | 핵심 테이블 (상위 10) |
|---|---|
| marketplace |  |
<!-- domain-tables-index:end -->

## 관련
- [[modules/h-phsar-ui]]
- [[domains/marketplace]]
- [[common]]
