---
title: 공통 관행
type: common
updated: 2026-09-02
---

플랫폼 전반에 반복되는 패턴(§0). 모듈이 하나뿐이라 모두 `h-phsar-ui` 안에서 관찰됐지만, 여러 화면/역할에 걸쳐 반복되므로 한 번만 적는다.

## 핵심

- [확실][표준] 모든 백엔드 호출은 `src/utils/api.ts`의 `apiGet/apiPost/apiPut/apiPatch/apiDelete`를 통해서만 이뤄진다 — 별도 Axios 인스턴스나 fetch 래퍼를 새로 만들지 않는다(`AGENTS.md`).
- [확실][표준] 역할 게이트(`RoleGuard`, `useRoleGuard`)는 localStorage의 role/token을 확인하는 UX 경계일 뿐 보안 경계가 아니다 — 실제 인가는 항상 백엔드(`h-phsar-api`)가 책임진다.
- [확실][고유] 주문 상태 변경 액션(수락/거절/발송/수취확인/취소)은 백엔드의 가드된 UPDATE와 맞물려 409 Conflict로 동시성 충돌을 알리며, 여러 화면(BuyerOrderPage, SupplierNewOrder)이 동일하게 409를 잡아 사용자에게 그대로 노출한다.
- [확실][고유] 프론트 상태(`BackendOrderStatus`, `ORDER_STATUS_META`, `src/config/order-status.ts`)는 백엔드 `OrderStatus` 이름을 그대로 미러링한다 — 프론트에서 새 상태를 만들거나 이름을 바꾸지 않는다.
- [확실][고유] **레거시 네이밍 기술부채**: 라우트 레벨에서는 `/buyer`·`/supplier`가 유일하게 살아있는 트리이고 `/retailer`·`/distributor`는 전부 `redirect()`뿐인 하위호환 shim이지만(코드 중복 아님), 그 실제 화면들을 구현하는 컴포넌트·서비스·Redux 슬라이스·일부 UI 문구는 여전히 "Retailer"/"Distributor" 용어를 광범위하게 쓴다(`AccountRetailer.tsx`, `DistributorStoreRetailer.tsx`, `accountRetailerSlice`, `DistributorAddProductPage`, `"Active Distributor Account"` 등). 백엔드 CLAUDE.md는 "SUPPLIER/BUYER/ADMIN만 사용, Distributor/Retailer 재도입 금지"를 명시하므로, 새로 작성/수정하는 코드에서는 이 구용어를 쓰지 않는다. 전체 리네임은 별도 작업으로 판단(광범위한 변경).
- [추정][고유] `/supplier/update-product`(제출 핸들러 없음)와 `/supplier/inventory`(필수 props 누락)는 미완성/결함 상태로 확인됨 — 실제 사용 전 확인 필요.

## 관련
- [[modules/h-phsar-ui]]
