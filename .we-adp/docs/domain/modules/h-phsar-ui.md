---
title: h-phsar-ui
type: module
product: h-phsar-ui
domain: marketplace
updated: 2026-09-02
---

# h-phsar-ui

H-Phsar B2B 도매 마켓플레이스의 Next.js App Router 프론트엔드. 인증/온보딩, 관리자(ADMIN) 계정관리, 구매자(BUYER) 쇼핑·발주, 공급자(SUPPLIER) 카탈로그·재고·주문이행 화면을 한 애플리케이션이 함께 제공하며 `h-phsar-api`(별도 저장소) REST API와 통신한다.

## 역할·구조

- **인증·관리자**: `/`, `/sign-in`, `/sign-up`(회원가입 → 역할선택 → OTP 인증) + `/admin/**`(ADMIN 전용, `AdminShell`의 `RoleGuard`가 게이트).
- **구매자(BUYER)**: `/buyer/**` — 매장 탐색·북마크·주문(장바구니→체크아웃→추적→수취확인)·리포트·프로필. `BUYER_NAV`가 단일 소스.
- **공급자(SUPPLIER)**: `/supplier/**` — 상품/카테고리/재고/매장/주문이행(수락·거절→발송)/리포트/프로필. `DistributorShell`이 공유 셸.
- **레거시 리다이렉트**: `/retailer/**`(11)·`/distributor/**`(13) 라우트는 전부 `redirect()`만 수행하는 하위호환 shim이다 — 실제 로직/중복 구현 없음(자세한 근거는 "## 핵심" 참고). 단, 이 라우트들이 가리키던 실제 화면 내부의 컴포넌트·서비스·Redux 슬라이스 명칭(`AccountRetailer`, `DistributorStoreRetailer`, `accountRetailerSlice`, `DistributorAddProductPage`, `state.distributorOrder` 등)과 일부 UI 문구("Active Distributor Account")는 여전히 구용어를 쓴다 — 백엔드 CLAUDE.md의 "SUPPLIER/BUYER/ADMIN만 사용, Distributor/Retailer 재도입 금지" 원칙과 어긋나는 프론트엔드 전용 네이밍 기술부채.
- 계층: `src/app/**/page.tsx`(대부분 얇은 wrapper) → `src/screens/**` 또는 `src/components/{Admin,Buyer,Supplier}/**`(실제 화면) → `src/redux/services/**`(API 호출, 일부는 `src/lib/**/*.service.ts`) → `src/utils/api.ts`(단일 Axios 인스턴스). 상태는 Redux Toolkit(`src/redux/slices/**`) + 일부 TanStack Query.

## 카탈로그
<!-- catalog:begin -->
| 진입점 | 종류 | 라우트/트리거 | 테이블 | 조작 | 근거 | 의미 |
|---|---|---|---|---|---|---|
| / | http | / |  |  | `src/app/page.tsx:1` | 랜딩 페이지. 실질 UX 로직 없음(정적 마케팅 페이지 + Sign Up/Sign In 링크) — CRUD |
| /admin | http | /admin |  |  | `src/app/admin/page.tsx:1` | CRUD (즉시 /admin/dashboard로 redirect하는 stub) |
| /admin/buyers | http | /admin/buyers |  |  | `src/app/admin/buyers/page.tsx:1` | Buyer 계정 목록 검색/페이지네이션/활성화-비활성화 토글 |
| /admin/dashboard | http | /admin/dashboard |  |  | `src/app/admin/dashboard/page.tsx:1` | CRUD (정적 내비게이션 카드 허브, 데이터 페칭 없음 — 게이트 로직은 RoleGuard 담당) |
| /admin/suppliers | http | /admin/suppliers |  |  | `src/app/admin/suppliers/page.tsx:1` | Supplier 계정 목록 검색/페이지네이션/활성화-비활성화 토글 |
| /buyer | http | /buyer |  |  | `src/app/buyer/page.tsx:1` | CRUD (redirect shim → /buyer/home) |
| /buyer/beverage | http | /buyer/beverage |  |  | `src/app/buyer/beverage/page.tsx:1` | 카테고리 상세 데모/미완성 화면 — 하드코딩 샘플 상품만 표시, 실제 스토어/카트 미연동 |
| /buyer/bookmarks | http | /buyer/bookmarks |  |  | `src/app/buyer/bookmarks/page.tsx:1` | 구매자가 즐겨찾기한 공급자 매장 목록 관리(등록/해제, 매장 이동) |
| /buyer/drafts | http | /buyer/drafts |  |  | `src/app/buyer/drafts/page.tsx:1` | 저장된 장바구니(Draft)를 검토 후 정식 발주 요청으로 전환하거나 폐기 |
| /buyer/home | http | /buyer/home |  |  | `src/app/buyer/home/page.tsx:1` | 홈 대시보드 — 카테고리/신규매장/전체매장 캐러셀, 정렬 |
| /buyer/order-history | http | /buyer/order-history |  |  | `src/app/buyer/order-history/page.tsx:1` | 완료/취소된 주문 이력 조회, 완료건 인보이스 발급 |
| /buyer/orders | http | /buyer/orders |  |  | `src/app/buyer/orders/page.tsx:1` | 진행 중 주문의 상태별 액션(수취확인/취소요청) 처리, 완료건 평점 등록 |
| /buyer/profile | http | /buyer/profile |  |  | `src/app/buyer/profile/page.tsx:1` | 구매자 프로필 생성/수정 (CRUD, 유효성 검증 포함) |
| /buyer/reports | http | /buyer/reports |  |  | `src/app/buyer/reports/page.tsx:1` | 구매 지출/카테고리/매장평점 분석 대시보드 (read-only) |
| /buyer/search | http | /buyer/search |  |  | `src/app/buyer/search/page.tsx:1` | 매장 검색 결과 목록 |
| /buyer/store | http | /buyer/store |  |  | `src/app/buyer/store/page.tsx:1` | 개별 매장 상세 — 상품 목록/정렬/카테고리 필터, 북마크 토글 |
| /distributor | http | /distributor |  |  | `src/app/distributor/page.tsx:1` | CRUD (redirect shim → /supplier/dashboard, 하위호환용, 실제 로직 없음) |
| /distributor/account | http | /distributor/account |  |  | `src/app/distributor/account/page.tsx:1` | CRUD (redirect shim → /supplier/profile) |
| /distributor/add-product | http | /distributor/add-product |  |  | `src/app/distributor/add-product/page.tsx:1` | CRUD (redirect shim → /supplier/add-product) |
| /distributor/category | http | /distributor/category |  |  | `src/app/distributor/category/page.tsx:1` | CRUD (redirect shim → /supplier/categories) |
| /distributor/history | http | /distributor/history |  |  | `src/app/distributor/history/page.tsx:1` | CRUD (redirect shim → /supplier/import-history 추정) |
| /distributor/home | http | /distributor/home |  |  | `src/app/distributor/home/page.tsx:1` | CRUD (redirect shim → /supplier/dashboard) |
| /distributor/import-product | http | /distributor/import-product |  |  | `src/app/distributor/import-product/page.tsx:1` | CRUD (redirect shim → /supplier/inventory 추정) |
| /distributor/order | http | /distributor/order |  |  | `src/app/distributor/order/page.tsx:1` | CRUD (redirect shim → /supplier/orders) |
| /distributor/order-history | http | /distributor/order-history |  |  | `src/app/distributor/order-history/page.tsx:1` | CRUD (redirect shim → /supplier/order-history) |
| /distributor/product | http | /distributor/product |  |  | `src/app/distributor/product/page.tsx:1` | CRUD (redirect shim → /supplier/products) |
| /distributor/report | http | /distributor/report |  |  | `src/app/distributor/report/page.tsx:1` | CRUD (redirect shim → /supplier/reports) |
| /distributor/store | http | /distributor/store |  |  | `src/app/distributor/store/page.tsx:1` | CRUD (redirect shim → /supplier/store) |
| /distributor/update-product | http | /distributor/update-product |  |  | `src/app/distributor/update-product/page.tsx:1` | CRUD (redirect shim → /supplier/update-product) |
| /retailer | http | /retailer |  |  | `src/app/retailer/page.tsx:1` | CRUD (redirect shim → /buyer/home, 하위호환용, 실제 로직 없음) |
| /retailer/beverage | http | /retailer/beverage |  |  | `src/app/retailer/beverage/page.tsx:1` | CRUD (redirect shim → /buyer/beverage) |
| /retailer/distributor-shop | http | /retailer/distributor-shop |  |  | `src/app/retailer/distributor-shop/page.tsx:1` | CRUD (redirect shim → /buyer/store 추정) |
| /retailer/draft | http | /retailer/draft |  |  | `src/app/retailer/draft/page.tsx:1` | CRUD (redirect shim → /buyer/drafts) |
| /retailer/favorite | http | /retailer/favorite |  |  | `src/app/retailer/favorite/page.tsx:1` | CRUD (redirect shim → /buyer/bookmarks) |
| /retailer/home | http | /retailer/home |  |  | `src/app/retailer/home/page.tsx:1` | CRUD (redirect shim → /buyer/home) |
| /retailer/order | http | /retailer/order |  |  | `src/app/retailer/order/page.tsx:1` | CRUD (redirect shim → /buyer/orders) |
| /retailer/order-history | http | /retailer/order-history |  |  | `src/app/retailer/order-history/page.tsx:1` | CRUD (redirect shim → /buyer/order-history) |
| /retailer/profile | http | /retailer/profile |  |  | `src/app/retailer/profile/page.tsx:1` | CRUD (redirect shim → /buyer/profile) |
| /retailer/report | http | /retailer/report |  |  | `src/app/retailer/report/page.tsx:1` | CRUD (redirect shim → /buyer/reports) |
| /retailer/searching-shop | http | /retailer/searching-shop |  |  | `src/app/retailer/searching-shop/page.tsx:1` | CRUD (redirect shim → /buyer/search 추정) |
| /sign-in | http | /sign-in |  |  | `src/app/sign-in/page.tsx:1` | 로그인 + 비번 찾기 + 이메일 미인증 시 OTP 인증까지 상태머신으로 한 화면에서 처리 |
| /sign-up | http | /sign-up |  |  | `src/app/sign-up/page.tsx:1` | 회원가입(이메일/비번) → 역할 선택(Supplier/Buyer) → OTP 이메일 인증 3단계 위저드 |
| /supplier | http | /supplier |  |  | `src/app/supplier/page.tsx:1` | CRUD (redirect shim → /supplier/dashboard) |
| /supplier/add-product | http | /supplier/add-product |  |  | `src/app/supplier/add-product/page.tsx:1` | 신규 상품 등록, 이미지 업로드 필수(스키마 미검증, JS로 강제) |
| /supplier/categories | http | /supplier/categories |  |  | `src/app/supplier/categories/page.tsx:1` | CRUD (카테고리 추가/수정/삭제, 페이지네이션) |
| /supplier/dashboard | http | /supplier/dashboard |  |  | `src/app/supplier/dashboard/page.tsx:1` | 최근 6개월 주문 활동 요약 + 월별 주문 추이 차트 대시보드 |
| /supplier/import-history | http | /supplier/import-history |  |  | `src/app/supplier/import-history/page.tsx:1` | CRUD (재고 임포트 이력 조회, 합계/수량 집계) |
| /supplier/inventory | http | /supplier/inventory |  |  | `src/app/supplier/inventory/page.tsx:1` | 재고 임포트 다이얼로그(기존 상품 수량+단가 추가 또는 신규 즉석 등록) — 단, 필수 props 누락 결함 확인됨 |
| /supplier/order-history | http | /supplier/order-history |  |  | `src/app/supplier/order-history/page.tsx:1` | 완료/거절/취소 주문 이력 조회 + 인보이스 미리보기(COMPLETED만) |
| /supplier/orders | http | /supplier/orders |  |  | `src/app/supplier/orders/page.tsx:1` | 주문 처리: Pending 수락/거절 → Preparing 발송(DISPATCH) → Dispatched/Awaiting/Completed 탭 |
| /supplier/products | http | /supplier/products |  |  | `src/app/supplier/products/page.tsx:1` | 상품 카탈로그 목록 + 게시/비공개 토글(별도 API), 삭제 |
| /supplier/profile | http | /supplier/profile |  |  | `src/app/supplier/profile/page.tsx:1` | 담당자 프로필(이름/성별/사진) 등록/수정 |
| /supplier/reports | http | /supplier/reports |  |  | `src/app/supplier/reports/page.tsx:1` | 기간별 매출/이익/주문수 통계 + 막대 차트 |
| /supplier/store | http | /supplier/store |  |  | `src/app/supplier/store/page.tsx:1` | 매장 프로필(이름/주소/연락처/배너) 등록·수정, 최초 add/이후 update API 분기 |
| /supplier/update-product | http | /supplier/update-product |  |  | `src/app/supplier/update-product/page.tsx:1` | 미완성 스텁 — submit 핸들러/서비스 호출 없음(실제로 동작 안 함) |
<!-- catalog:end -->

## 핵심

### 인증·관리자
- [확실][고유] roleId는 숫자 코드로 저장되며 1=SUPPLIER, 2=BUYER, 3=ADMIN으로 매핑된다 — 근거 `src/config/roles.ts:12-22` "case 1: return ROLES.SUPPLIER ... case 3: return ROLES.ADMIN"
- [확실][고유] 모든 admin 하위 라우트는 `AdminShell`을 통해 `RoleGuard(role=ADMIN)`로 감싸지며, localStorage의 role이 ADMIN이 아니거나 토큰이 없으면 `/sign-in`으로 강제 이동한다 — 근거 `src/lib/auth/useRoleGuard.ts:25-26` "if (!token || role !== requiredRole) { router.replace(\"/sign-in\"); }"
- [확실][고유] 회원가입 시 역할 선택은 SUPPLIER(1)/BUYER(2) 두 개만 제공되며 ADMIN은 가입 UI에서 선택 불가하다 — 근거 `src/components/modern/auth/role-selection.tsx:15-28` "{ id: 1, label: \"Supplier\" ... { id: 2, label: \"Buyer\""
- [확실][고유] 로그인 응답이 HTTP 409면 이메일 미인증으로 간주해 OTP 인증 뷰로 전환한다(에러 텍스트가 아닌 상태코드로 분기) — 근거 `src/hooks/auth/useAuth.ts:96-98` "} else if (response.status === 409) { onEmailNotVerified?.(variables.email);"
- [확실][고유] 비밀번호 재설정은 별도 "OTP 발송" 엔드포인트 없이 가입 인증과 같은 `/authorization/api/v1/otp/generate`를 재사용하며, 실제 재설정은 `PUT /authorization/forget`으로 OTP+새 비번을 한 번에 검증/적용한다 — 근거 `src/lib/auth/auth.service.ts:41-49`
- [확실][표준] 로그인 폼은 zod 스키마로 이메일 형식과 비밀번호 최소 8자를 클라이언트 검증한다 — 근거 `src/components/modern/auth/signin-form.tsx:15-18` "password: z.string().min(8, \"Password must be at least 8 characters.\")"

### 구매자(BUYER)
- [확실][고유] 주문 상태별 버튼 노출은 문자열 하드코딩이 아니라 중앙화된 `isBuyerActionAllowed(status, action)` 로 게이팅된다 — 근거 `src/components/Buyer/OrderPage.tsx:303` "isBuyerActionAllowed(item.status, \"CONFIRM_RECEIPT\")"
- [확실][고유] 코드 주석 자체가 COMPLETED는 오직 구매자의 의도적 수취확인 클릭으로만 도달하며 절대 자동 전이되지 않음을 명시한다 — 근거 `src/components/Buyer/OrderPage.tsx:127-129` "this must be a deliberate action, never automatic"
- [확실][표준] 수취확인(CONFIRM_RECEIPT)은 `PUT /buyers/orders/{id}/receive`, 취소요청(CANCEL_REQUEST)은 `POST /buyers/orders/{id}/cancel`, 카트 체크아웃은 `PUT buyers/orders/confirm`을 호출한다 — 근거 `src/redux/services/buyer/orderDetail.service.js:28,49-55`, `src/redux/services/buyer/retailerHomepage.service.js:236`
- [확실][고유] Draft → 정식 발주 전환은 `PUT /buyers/history/draft/{id}`를 호출하며, 이미 진행 중 카트가 있으면 409 충돌로 실패해 서버 메시지를 그대로 토스트에 노출한다 — 근거 `src/redux/services/buyer/draftHistory.service.js:26`, `src/components/Buyer/DraftHistory.jsx:110-111`
- [확실][고유] 실시간 알림은 메시지 내용을 파싱하지 않고 단순 트리거로만 사용해 무조건 재조회(refetch)한다 — 근거 `src/components/Buyer/OrderPage.tsx:95-97` "any message means \"refresh notifications\""
- [추정][고유] `/buyer/beverage`는 실 데이터/장바구니와 연동되지 않은 하드코딩 데모 화면으로 보인다 — 근거 `src/screens/buyer/CategoryBeverages.tsx:73,77`

### 공급자(SUPPLIER)
- [확실][고유] `/distributor` 루트와 `/supplier` 루트 모두 `/supplier/dashboard`로 리다이렉트되어 실제 진입점은 하나로 수렴한다 — 근거 `src/app/distributor/page.tsx:4` "redirect(\"/supplier/dashboard\");"
- [확실][고유] Pending 수락/거절, Preparing→Dispatch 액션은 백엔드의 가드된 UPDATE 동시성 충돌 시 409 응답을 처리하도록 구현되어 있다 — 근거 `src/components/Supplier/OrderPage/NewOrder.jsx:69` "if (res.status === 409) {"
- [확실][고유] 코드 주석으로 "공급자용 실시간 WebSocket 토픽이 백엔드에 아직 없음"을 명시하고, 대신 수동 Sync/재조회로 신규 주문을 감지한다 — 근거 `src/components/Supplier/OrderPage/NewOrder.jsx:50`
- [확실][고유] 상품 게시/비공개는 단일 PATCH가 아니라 publish/unpublish 별도 엔드포인트로 분리 호출된다 — 근거 `src/screens/supplier/ProductDistributor.tsx:96-98`
- [확실][고유] 신규 상품 등록 시 이미지 업로드는 yup 스키마엔 없지만 JS 로직에서 강제되는 필수 규칙이다 — 근거 `src/screens/supplier/AddProductDistributor.tsx:106` "toast.warning(\"Please select a product image\");"
- [확실][고유] `/supplier/inventory`는 다이얼로그 전용 컴포넌트 `NewImport`를 props 없이 그대로 렌더링해 `isOpenNewImport`/`handleShowImport`가 정의되지 않는 결함이 있다 — 근거 `src/app/supplier/inventory/page.tsx:8`, `src/components/Supplier/NewImport.jsx:159`
- [확실][고유] `/supplier/update-product` 화면은 폼 submit 핸들러·API 서비스 호출이 전혀 없는 미완성 스텁이다(Save 버튼이 아무 동작도 하지 않음) — 근거 `src/screens/supplier/UpdateProductDistributor.tsx:34,193`
- [확실][고유] URL은 `/supplier/**`로 이관됐지만 내부 컴포넌트·함수·Redux 상태 키·일부 UI 문구는 여전히 "Distributor" 용어를 쓴다(명명 이관 미완료) — 근거 `src/app/supplier/add-product/page.tsx:7` "DistributorAddProductPage", `src/screens/supplier/StorePage.tsx:219` "Active Distributor Account"

### 레거시 라우트(리다이렉트 shim)
- [확실][고유] `/retailer/**` 11개, `/distributor/**` 13개 라우트는 예외 없이 `redirect()` 한 줄짜리 함수이며 자체 화면/로직/API 호출이 없다 — 근거 `src/app/retailer/home/page.tsx:4` "redirect(\"/buyer/home\");", `src/app/distributor/account/page.tsx:4` "redirect(\"/supplier/profile\");"
- [확실][고유] 내비게이션(`BUYER_NAV`/`SUPPLIER_NAV`, `src/config/navigation.ts`)과 역할 홈 매핑(`src/config/routes.ts`)에는 `/retailer`·`/distributor` 링크가 전혀 없다 — 앱 안에서 이 경로들로 이동하는 실제 `<Link>`/`router.push`는 0건이므로 삭제해도 기능 손실은 없다(외부 북마크 호환성만 사라짐).

## 흐름

### 인증·관리자
- 회원가입 → 역할선택 → 이메일 인증 → 로그인 → 역할별 리다이렉트: `src/app/sign-up/page.tsx:6` → `src/screens/auth/SignUpPage.tsx:52-72`(roleId 1/2 선택) → `src/hooks/auth/useAuth.ts:32-48`(registerService+generateCodeService) → verifyEmail 성공 시 `/sign-in` → `src/hooks/auth/useAuth.ts:90-92`(roleIdToRole → `ROLE_HOME_ROUTE[role]`).
- 관리자 콘솔 접근 가드: `src/app/admin/layout.tsx:7-9`(AdminShell 동적 로드) → `src/components/Admin/AdminShell.jsx:78`(`<RoleGuard role={ROLES.ADMIN}>`) → `src/lib/auth/useRoleGuard.ts:20-26`(role 불일치 시 `/sign-in`) → 통과 시 자식 렌더.

### 구매자(BUYER)
- 매장 탐색→담기→체크아웃: 홈/검색에서 매장 클릭 → `/buyer/store`(DistributorStoreRetailer.tsx) → 헤더 +/- 버튼으로 `add_product_to_cart` → 카트 드롭다운 "Checkout" → `confirm_order_from_cart`(`PUT buyers/orders/confirm`, CART→PENDING) — `src/components/Buyer/NavBarRetailerComponent.jsx:296-302,566-582`.
- Draft 흐름: "Save Draft" → `save_to_draft`(`PUT buyers/orders/cart/draft`) → `/buyer/drafts`에서 "Review & Send" → `draft_to_request`(`PUT buyers/history/draft/{id}`) — `src/components/Buyer/DraftHistory.jsx:91-118`.
- 주문 추적→수취확인: `/buyer/orders`에서 `isBuyerActionAllowed`가 버튼 노출 → DISPATCHED에서 "Confirm Receipt" → `confirm_transaction`(`PUT /buyers/orders/{id}/receive`, →COMPLETED) → 평점 등록 가능 — `src/components/Buyer/OrderPage.tsx:130-150,267-315`.

### 공급자(SUPPLIER)
- 상품 등록→게시: `/supplier/add-product` → `add_new_product_distributor` → `/supplier/products`에서 publish/unpublish 토글 — `src/screens/supplier/AddProductDistributor.tsx:117-121`, `src/screens/supplier/ProductDistributor.tsx:96-101`.
- 재고 임포트: `/supplier/inventory`(NewImport)에서 기존 상품 수량+단가 추가 또는 신규 즉석 등록 — `src/components/Supplier/NewImport.jsx:112-154`.
- 주문 처리: Pending 탭 Accept/Reject(409 처리) → Preparing 탭 Dispatch(409 처리) → Dispatched/Awaiting/Completed 탭으로 자연 이동, 공급자 측 "Complete" 액션은 없음(백엔드 규칙과 일치) — `src/components/Supplier/OrderPage/NewOrder.jsx:65-106`, `src/components/Supplier/OrderPage/Preparing.jsx:56-77`.

## 관련
- [[common]]
- [[domains/marketplace]]
