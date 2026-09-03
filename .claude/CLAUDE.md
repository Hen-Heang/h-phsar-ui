# CLAUDE.md — app-workspace

> 워크스페이스 메타·인벤토리·가이드 매핑: `.claude/config/project.yaml`. 도메인 키워드: `.claude/config/project-meta.yaml`. 툴 동작·gitlab·scope 토글: `.claude/config/system.yaml`. 스코프 데이터(scope 기능 사용 시): `.claude/config/scope.yaml`.

이 워크스페이스는 H-Phsar의 B2B 도매 마켓플레이스 프론트엔드입니다.

- 프로젝트 1개 (h-phsar-ui) — Next.js App Router 애플리케이션
- 기술 스택: TypeScript / Next.js / React 18 / Redux Toolkit + TanStack Query / MUI + Tailwind(shadcn 스타일) / Vitest
- 역할별 화면: BUYER / SUPPLIER / ADMIN — 하나의 브랜드·디자인 시스템·인증 기반을 공유하며 레이아웃만 분리
- 백엔드(`h-phsar-api`, 별도 저장소)가 역할·엔드포인트·페이로드·페이지네이션·주문 상태·전이 규칙의 단일 출처입니다. 엔드포인트·지표·상태를 프론트에서 임의로 지어내지 않습니다.

## 이 프로젝트의 관행 (감지 기반)

**명명**: 역할별 화면은 `src/screens/{buyer|supplier|admin|auth}/`에 위치. 역할·네비게이션·라우트·주문상태 매핑은 `src/config/{navigation,roles,routes,order-status}.ts`에 중앙화되어 있고 각각 대응하는 `*.test.ts`가 함께 있습니다(예: `order-status.ts` + `order-status.test.ts`).

**API 통신**: 단일 Axios 인스턴스(`src/utils/api.ts`)의 `apiGet/apiPost/apiPut/apiPatch/apiDelete` 헬퍼만 사용합니다 — 새 Axios 인스턴스나 별도 fetch 래퍼를 추가하지 않습니다.

**상태관리**: Redux Toolkit(전역) + TanStack Query(서버 상태, 일부 기능)를 병행합니다. 전면 재작성 없이 기존 패턴을 따릅니다.

**타입 계약**: 백엔드 주문 상태(`CART/DRAFT/PENDING/PROCESSING/DISPATCHED/COMPLETED/REJECTED/CANCELLED`)를 `BackendOrderStatus` 타입(`src/types/order`)과 `ORDER_STATUS_META`(`src/config/order-status.ts`)로 그대로 미러링합니다 — 백엔드 상태 이름과 프론트 타입이 어긋나면 안 됩니다.

**권한 가드**: 역할 네비게이션 가드는 UX 경계일 뿐 보안 경계가 아닙니다(실제 인가는 백엔드가 책임). 로딩 중에는 접근 가능한 상태를 보여주지 않습니다.

**테스트**: Vitest + Testing Library. 설정 로직(`config/*.ts`)은 동일 폴더의 `*.test.ts`로 유닛 테스트됩니다.

**디자인**: 반복되는 raw color 대신 semantic 토큰 사용, 공통 버튼/입력/카드/다이얼로그/테이블/배지/로딩/빈 상태/에러/확인 상태를 역할 간 공유합니다. 접근성: 시맨틱 랜드마크, `h1` 1개, 포커스 표시, 라벨, 키보드 접근성, 44×44px 터치 타깃, reduced-motion, 360px 이상 반응형.

이 프로젝트의 도메인 페이지: `.claude/docs/domain/modules/h-phsar-ui.md`. 공통 관행: `.claude/docs/domain/common.md`. 전체 색인: `.claude/docs/domain/index.md`.
---

## 산출물 경로 규칙

- **`target/` 디렉토리는 항상 워크스페이스 루트(이 `CLAUDE.md`가 위치한 디렉토리)를 기준으로 생성한다.**
- `/develop`로 스코프가 설정되어 있더라도 프로젝트 하위가 아닌 **워크스페이스 루트 아래** `target/`에 생성한다.
- 워크스페이스 루트 디렉토리명은 개발자마다 다를 수 있으므로, `.claude/` 디렉토리의 부모 경로로 결정한다.
- 예시: `{워크스페이스 루트}/{{config.outputDir}}/plans/`, `{워크스페이스 루트}/{{config.outputDir}}/`, `{워크스페이스 루트}/target/optimized/`

---

## 세션 시작 규칙

- HANDOFF 는 **2개 자산**으로 관리된다 (둘 다 워크스페이스 루트):
  - `HANDOFF.md` — 진행중 컨텍스트 (모든 프로젝트의 Plan / Next / Caution / Files 를 프로젝트별 섹션으로 통합 + Cross-Cutting Caution + Common Files)
  - `HANDOFF_HISTORY.md` — 완료 작업 + 진행중 스냅샷 누적 이력 (세션 단위, 시간 역순 prepend)
- **프로젝트별 `{project}/HANDOFF.md` 는 작성하지 않는다.** 모든 진행중 컨텍스트는 루트 `HANDOFF.md` 안에 통합된다.
- 세션 시작 시:
  1. 루트 `HANDOFF.md` 가 존재하면 **반드시 읽는다** (진행중 컨텍스트 — 이것만으로 세션 재개에 충분하다)
  2. 루트 `HANDOFF_HISTORY.md` 는 **기본적으로 읽지 않는다.** HANDOFF.md 만으로 맥락이 부족할 때만 **최신 1개 entry** 를 본다 (`awk '/^## /{c++} c>1{exit} {print}' HANDOFF_HISTORY.md`) — 그 너머는 토큰 낭비, 필요 시 아래 "이력 조회" awk 로 특정 entry 만 조회
- **브랜치 정합성 인지**: `HANDOFF.md` frontmatter `projects:` 의 각 항목 브랜치가 해당 프로젝트의 현재 git 브랜치와 다르면 그 프로젝트 섹션은 **stale 컨텍스트로 인지**한다 (정보용으로만 활용, Next 항목 행동은 `/develop` 호출 후 5.5단계 surface 를 거쳐 진행).
- **stale 섹션 자동 보존은 `/pack` 0단계(P2)가 담당**: 다음 pack 호출 시 stale 프로젝트 섹션의 진행중 컨텍스트는 `HANDOFF_HISTORY.md` 에 자동 prepend 되고 HANDOFF.md 의 해당 섹션은 비워진다 (사용자 모달 없음, 데이터 손실 없음).
- **이력 조회** (각 entry 끝에 `---` 종결 마커 있음, awk 사용):
  - 단일 entry (가장 최근): `awk '/— {project} @ {branch}$/{f=1} f; f && /^---$/{exit}' HANDOFF_HISTORY.md`
  - 브랜치별 모든 entry: `awk '/@ {branch}$/,/^---$/' HANDOFF_HISTORY.md`

---

## 프로젝트 인벤토리

> **단일 출처**: `.claude/config/project.yaml` `projects[]` — 프로젝트명·shortName·multiModule·role·buildArgs·guideline 모두 본 파일이 마스터.
>
> 각 프로젝트의 상세 역할은 프로젝트 루트의 `CLAUDE.md` 도입부 참조.
>
> 신규 프로젝트 등록·소멸 프로젝트 정리·항목 변경은 `/config-update` 로 동기화한다 — 인스턴스 정본(`.we-adp/config/`)과 `.claude/` 산출물을 함께 갱신하므로 `we-adp update` 에 유실되지 않는다. `.claude/config/project.yaml` 을 손으로 고치지 않는다 (본 CLAUDE.md 동기화도 불필요).
