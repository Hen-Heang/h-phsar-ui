# 구조 스켈레톤 (we-init 입력 — 도메인-중립)

> 결정론 스캔이 뽑은 구조 사실이다. 그룹 라벨은 관찰된 패키지 조각일 뿐 도메인 판단이 아니다.
> we-init 이 이 위에 도메인 이름·업무 흐름·룰을 입힌다. 각 항목의 `파일:줄` 은 실재 근거다.

## 모듈 지도

### 모듈: h-phsar-ui  (`.`)
- 그룹 `(무그룹)` (55개 진입점)
  - http /admin/buyers /admin/buyers — `src/app/admin/buyers/page.tsx:1`
  - http /admin/dashboard /admin/dashboard — `src/app/admin/dashboard/page.tsx:1`
  - http /admin /admin — `src/app/admin/page.tsx:1`
  - http /admin/suppliers /admin/suppliers — `src/app/admin/suppliers/page.tsx:1`
  - http /buyer/beverage /buyer/beverage — `src/app/buyer/beverage/page.tsx:1`
  - http /buyer/bookmarks /buyer/bookmarks — `src/app/buyer/bookmarks/page.tsx:1`
  - http /buyer/drafts /buyer/drafts — `src/app/buyer/drafts/page.tsx:1`
  - http /buyer/home /buyer/home — `src/app/buyer/home/page.tsx:1`
  - http /buyer/order-history /buyer/order-history — `src/app/buyer/order-history/page.tsx:1`
  - http /buyer/orders /buyer/orders — `src/app/buyer/orders/page.tsx:1`
  - http /buyer /buyer — `src/app/buyer/page.tsx:1`
  - http /buyer/profile /buyer/profile — `src/app/buyer/profile/page.tsx:1`
  - http /buyer/reports /buyer/reports — `src/app/buyer/reports/page.tsx:1`
  - http /buyer/search /buyer/search — `src/app/buyer/search/page.tsx:1`
  - http /buyer/store /buyer/store — `src/app/buyer/store/page.tsx:1`
  - http /distributor/account /distributor/account — `src/app/distributor/account/page.tsx:1`
  - http /distributor/add-product /distributor/add-product — `src/app/distributor/add-product/page.tsx:1`
  - http /distributor/category /distributor/category — `src/app/distributor/category/page.tsx:1`
  - http /distributor/history /distributor/history — `src/app/distributor/history/page.tsx:1`
  - http /distributor/home /distributor/home — `src/app/distributor/home/page.tsx:1`
  - …외 35개

## 호출 흐름 (얕은 정적 근사)

### /admin/buyers /admin/buyers (http)
- 경로: /admin/buyers

### /admin/dashboard /admin/dashboard (http)
- 경로: /admin/dashboard

### /admin /admin (http)
- 경로: /admin

### /admin/suppliers /admin/suppliers (http)
- 경로: /admin/suppliers

### /buyer/beverage /buyer/beverage (http)
- 경로: /buyer/beverage

### /buyer/bookmarks /buyer/bookmarks (http)
- 경로: /buyer/bookmarks

### /buyer/drafts /buyer/drafts (http)
- 경로: /buyer/drafts

### /buyer/home /buyer/home (http)
- 경로: /buyer/home

### /buyer/order-history /buyer/order-history (http)
- 경로: /buyer/order-history

### /buyer/orders /buyer/orders (http)
- 경로: /buyer/orders

### /buyer /buyer (http)
- 경로: /buyer

### /buyer/profile /buyer/profile (http)
- 경로: /buyer/profile

### /buyer/reports /buyer/reports (http)
- 경로: /buyer/reports

### /buyer/search /buyer/search (http)
- 경로: /buyer/search

### /buyer/store /buyer/store (http)
- 경로: /buyer/store

### /distributor/account /distributor/account (http)
- 경로: /distributor/account

### /distributor/add-product /distributor/add-product (http)
- 경로: /distributor/add-product

### /distributor/category /distributor/category (http)
- 경로: /distributor/category

### /distributor/history /distributor/history (http)
- 경로: /distributor/history

### /distributor/home /distributor/home (http)
- 경로: /distributor/home

### /distributor/import-product /distributor/import-product (http)
- 경로: /distributor/import-product

### /distributor/order-history /distributor/order-history (http)
- 경로: /distributor/order-history

### /distributor/order /distributor/order (http)
- 경로: /distributor/order

### /distributor /distributor (http)
- 경로: /distributor

### /distributor/product /distributor/product (http)
- 경로: /distributor/product

### /distributor/report /distributor/report (http)
- 경로: /distributor/report

### /distributor/store /distributor/store (http)
- 경로: /distributor/store

### /distributor/update-product /distributor/update-product (http)
- 경로: /distributor/update-product

### / / (http)
- 경로: /

### /retailer/beverage /retailer/beverage (http)
- 경로: /retailer/beverage

### /retailer/distributor-shop /retailer/distributor-shop (http)
- 경로: /retailer/distributor-shop

### /retailer/draft /retailer/draft (http)
- 경로: /retailer/draft

### /retailer/favorite /retailer/favorite (http)
- 경로: /retailer/favorite

### /retailer/home /retailer/home (http)
- 경로: /retailer/home

### /retailer/order-history /retailer/order-history (http)
- 경로: /retailer/order-history

### /retailer/order /retailer/order (http)
- 경로: /retailer/order

### /retailer /retailer (http)
- 경로: /retailer

### /retailer/profile /retailer/profile (http)
- 경로: /retailer/profile

### /retailer/report /retailer/report (http)
- 경로: /retailer/report

### /retailer/searching-shop /retailer/searching-shop (http)
- 경로: /retailer/searching-shop

### /sign-in /sign-in (http)
- 경로: /sign-in

### /sign-up /sign-up (http)
- 경로: /sign-up

### /supplier/add-product /supplier/add-product (http)
- 경로: /supplier/add-product

### /supplier/categories /supplier/categories (http)
- 경로: /supplier/categories

### /supplier/dashboard /supplier/dashboard (http)
- 경로: /supplier/dashboard

### /supplier/import-history /supplier/import-history (http)
- 경로: /supplier/import-history

### /supplier/inventory /supplier/inventory (http)
- 경로: /supplier/inventory

### /supplier/order-history /supplier/order-history (http)
- 경로: /supplier/order-history

### /supplier/orders /supplier/orders (http)
- 경로: /supplier/orders

### /supplier /supplier (http)
- 경로: /supplier

### /supplier/products /supplier/products (http)
- 경로: /supplier/products

### /supplier/profile /supplier/profile (http)
- 경로: /supplier/profile

### /supplier/reports /supplier/reports (http)
- 경로: /supplier/reports

### /supplier/store /supplier/store (http)
- 경로: /supplier/store

### /supplier/update-product /supplier/update-product (http)
- 경로: /supplier/update-product

## 관찰 용어 (project-meta 시드)

- 패키지 그룹: (없음)
- 테이블: (없음)
- 상수(상위 50): (없음)
- 민감 토큰: (없음)
