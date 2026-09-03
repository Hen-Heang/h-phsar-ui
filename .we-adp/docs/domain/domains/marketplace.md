---
title: 마켓플레이스
type: domain
domain: marketplace
updated: 2026-09-02
---

H-Phsar B2B 도매 마켓플레이스의 프론트엔드. 백엔드(`h-phsar-api`)와 동일한 도메인 개념(SUPPLIER/BUYER/ADMIN, 주문 생애주기)을 공유하며, `h-phsar-ui` 단일 Next.js 앱으로 세 역할의 화면을 모두 제공한다([[modules/h-phsar-ui]] 참고).

## 개요

- **인증/관리자**: 이메일/비번 가입 + 역할선택 + OTP 인증, 로그인/비번찾기, ADMIN의 Supplier/Buyer 계정 활성화 관리.
- **구매자 흐름**: 매장 탐색·북마크 → 장바구니(Draft 가능) → 체크아웃(PENDING) → 추적 → 수취확인(COMPLETED) → 평점.
- **공급자 흐름**: 상품/카테고리/재고 관리 → 대기주문 수락/거절 → 준비→발송 → (수취확인은 구매자 전용, 공급자 측 완료 액션 없음).
- **레거시 네이밍**: `/retailer`·`/distributor` 라우트는 죽은 리다이렉트 shim이지만, 실제 구현 내부에는 그 용어가 코드/UI 텍스트에 남아있다([[common]] 참고).

## 흐름

주문 생애주기는 백엔드 `OrderStatus`(`CART → DRAFT → PENDING → PROCESSING → DISPATCHED → COMPLETED`, 또는 `REJECTED`/`CANCELLED`)를 `src/config/order-status.ts`가 그대로 미러링한다. 자세한 화면별 흐름은 [[modules/h-phsar-ui]]의 "## 흐름" 절 참고.

## 관련
- [[modules/h-phsar-ui]]
- [[common]]

<!-- domain-tables:begin -->
- 소속 모듈: h-phsar-ui
- 테이블 (상위 20): 
<!-- domain-tables:end -->
