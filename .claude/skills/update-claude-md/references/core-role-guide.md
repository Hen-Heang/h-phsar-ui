# Core-role writing guide

Follow this guide when `### 핵심 역할` is missing or when creating a new project CLAUDE.md.

> **Generic skeleton vs workspace examples (for external ports):**
> This guide's **methodology (Steps 1–6) · writing format · quality criteria** are workspace-agnostic and generic.
> The **concrete examples** (`app-core`, the async response holder, business table names, method-name rules, schema names, etc.), on the other hand, are examples replaced per workspace.
> Infrastructure values are isolated behind the `project.yaml` adapter — the common-utils artifact is `commonUtilsArtifact`, the DB schema is `db.schema`, the package pattern is `baseNamespacePattern`.
> To port to another workspace, fill in `project.yaml` and replace only this guide's domain examples.

---

## Business-comprehension methodology

To write `### 핵심 역할`, you must understand "why this service exists on the platform".
The goal is not to merely enumerate code, but to grasp the service's reason for existing from a **business perspective**.

### Step 1 — Grasp the big picture (5 min)

**Read:** the project `CLAUDE.md`'s `## Overview` + the workspace `CLAUDE.md`'s project list

**Figure out:**
- Where this project sits in the overall platform (app API? admin screens? post-processing?)
- Who calls this service (a mobile app? other services? a scheduler?)
- If multi-module, the relationships between modules (who references common)

### Step 2 — Grasp the domain structure from the entry points (10 min)

**Entry points differ by project type:**

| Type | Entry point | How to check |
|------|--------|-----------|
| web-api | `controller/**/*` | Classify domains by routing paths. Same path prefix = same domain |
| web-fullstack | `controller/**/*` | Controller names and routing paths. Check the domain folder structure |
| batch | `jobs/**/*` | Job entry-point annotations/config. Job count = batch scale |
| daemon | `*Scheduler.*` or `*Task.*` | Schedule-config methods. Schedule intervals and processing targets |
| proxy/router | `controller/**/*` or `handler/**/*` | External systems called and the message specs |
| message-consumer | `consumer/**/*` | Subscribed topic names. Topic = unit of business |
| library | Facade classes (e.g. `OrderBiz.*`) | Public method list = list of provided features |

**Key question:** "How many domains does this service have, and what does each domain do?"

> **Tip:** the Controller/Job list alone reveals 80% of the domain range.
> If there are many classes, check the package directory structure (`ls`) first.

### Step 3 — Grasp the core business logic (15 min)

Read the Service classes invoked from Controllers/Jobs.
**There is no need to read every Service.** Select only the core ones by these criteria:

**Selection criteria:**
1. **The largest Service** — the most code = the core business
2. **Externally integrated Services** — calls to `app-core`, TCP communication, Kafka Producers
3. **Factory patterns** — a `*Factory` marks the core of the branching logic

**Clues to read for in a Service:**

| Clue | Meaning | Example |
|------|------|------|
| Shared-library calls | Common-feature integration | `orderBiz.submit(conn, ordrId)` |
| Async response-wait pattern | Waiting on async external-system responses | app-api's order/cancel flows |
| Message-queue publishing | Async event publishing | Notifications, point-accrual triggers |
| HTTP client calls | External API calls | External PG, identity verification |
| Transaction-boundary declarations | Transaction boundaries | Atomic handling across multiple tables |
| Factory pattern | Branching per version/channel | URL versions (`/v1/`, `/v2/`), per-channel handling |

### Step 4 — Grasp the data range (5 min)

Scan the **method/query names** of the data-access layer (DAO / Mapper / Repository etc., per language).
Many projects include table names in method names by naming convention, which reveals which tables are handled.

```
예: ordrLdgrR001      → ORDR_LDGR 테이블 조회
    invntryC001      → INVNTRY 테이블 생성
    userActvtyU001   → USER_ACTVTY 테이블 수정
```

**Method-name rule (example):** `{tableNameCamelCase}{C|R|U|D}{###}`
- C = INSERT, R = SELECT, U = UPDATE, D = DELETE
- This encoding is **only one example**; the actual naming rule follows the project's language-pack convention (`.claude/rules/{{config.lang.conventionFile}}`).

> Other workspaces may have different Mapper method-naming rules — replace with that workspace's convention.

> If table names are unclear, check the schema via the PostgreSQL MCP (the schema name is `project.yaml` `db.schema`):
> ```sql
> SELECT table_name FROM information_schema.tables
> WHERE table_schema = '{{config.db.schema}}' ORDER BY table_name;
> ```

### Step 5 — Grasp the integration relationships (5 min)

Check the **in-house library dependencies** in the build config file:

| Dependency | Meaning |
|--------|------|
| `{공유 승인 라이브러리}` | Uses transaction-approval processing |
| `{공통 유틸 라이브러리}` | Uses common utils (typical) |
| Message-queue integration | Publishes/consumes topics |
| Cache integration | Uses Redis/cache sessions |

**Check the Service code for patterns of calling other services:**
- HTTP client calls (REST clients etc.) → HTTP calls to internal services
- Socket/TCP-related code → external-system message communication
- Direct calls to shared-library facades (e.g. `orderBiz.*()`) → direct calls to the common core

### Step 6 — Synthesis: the "one-sentence summary" test

Based on the analysis above, you should be able to complete this sentence:

> "{프로젝트명}는 {누가} {무엇을} 할 수 있도록 {어떻게} 처리하는 {유형}이다."

If this sentence comes out naturally, you are ready to write `### 핵심 역할`.
If not, reinforce whichever of Steps 2–5 is lacking.

---

## Per-type analysis checklists

### web-api / web-fullstack

- [ ] Controller/router count = grasp the domain count
- [ ] Grasp the CRUD range per major domain
- [ ] Whether the shared approval library is used (which entry points call it)
- [ ] Whether the Factory pattern is used (version branching)
- [ ] Authentication · session · token approach
- [ ] Whether processing is async (async-wait patterns, message-queue integration)

### Batch / Daemon

- [ ] Grasp the total Job/schedule count
- [ ] Classify Jobs into categories (package structure = categories)
- [ ] Dual datasource or not (primary DB + external DB, etc.)
- [ ] External file reception/generation or not
- [ ] Whether `app-core` is used

### Proxy / Router

- [ ] Proxy module count = number of integration targets
- [ ] Which external system each module talks to
- [ ] Message spec/protocol (TCP, HTTP, file)
- [ ] Error handling/reprocessing approach

### Kafka Consumer

- [ ] Consumer module count and subscribed topics
- [ ] What each Consumer does after receiving (DB writes? external calls? approvals?)
- [ ] Multi-threaded structure
- [ ] MDC propagation approach

### library

- [ ] The facade classes' public method list = provided features
- [ ] Which projects depend on this library
- [ ] Framework dependence (pure language core or not)
- [ ] Design patterns (Template Method, Strategy, etc.)
- [ ] Transaction boundaries (managed by the caller, or by the library)

---

## Writing format

```markdown
### 핵심 역할

{서비스 설명 단락}
```

### Length criteria

| Project scale | Lines |
|---------------|-------|
| Small (single service, Library) | 3–5 lines |
| Medium (Batch, Daemon, Proxy) | 5–8 lines |
| Large (API, WebMVC) | 6–10 lines + bullets for major business areas |

### Items to include (by importance)

1. **Service identity** — the role this service plays on the platform (1 sentence)
2. **Main functional range** — which domains/features it handles
3. **Integrated systems** — external services it depends on or calls (`app-core`, Kafka, TCP communication, etc.)
4. **Technical particulars** — patterns, architecture, performance handling, etc. (only what is unusual)

### Emphasis rules

- Emphasize key terms in **bold** (`**...**`)
  - Role within the platform (`**모바일 앱 전 기능**`, `**야간/정기 배치 처리**`)
  - Integrated system names (`**app-core**`, the async response holder, etc.)
  - Figures (`**85개 Job**`, `**23종 업무구분코드**`)
- Avoid excessive emphasis — 1–2 per sentence

---

## Per-type writing patterns

### REST API microservice

```
{프로젝트명}는 {주요 사용자/클라이언트}의 {핵심 기능} 요청을 처리하는 REST API {설명}이다.
{도메인1}, {도메인2}, {도메인3} 등 {범위 설명}.
{라우팅/서비스 디스커버리 특이사항}.
{핵심 연동 라이브러리/시스템}를 통해 {처리 방식}.
{비동기/패턴 등 기술 특이사항}.
```

### web-fullstack (full-stack web)

```
{프로젝트명}는 {주요 사용자}를 위한 {설명} 웹 시스템이다.
{관리/운영 대상}, {기능 범위 요약} 등 **{규모}**를 제공한다.
{특수 기술 — 동적 메뉴, 권한 관리, 세션 관리 등}.
{연동 시스템 — 공유 승인 라이브러리, 공통 유틸 등}.
```

### Batch

```
{프로젝트명}는 플랫폼의 **{정기/야간} 배치 처리 서비스**다.
{실행 방식 — CommandLineRunner, @Scheduled 등}으로 {총 N개 Job}을 {카테고리 수}개 카테고리로 관리한다.
{데이터소스 특이사항 — 이중 DB, MS SQL 등}.
**주요 업무 영역 ({N}개 Job / {M}개 카테고리):**
- **{카테고리} ({n}개)**: {설명}
```

### Daemon

```
{프로젝트명}는 플랫폼의 **{역할} 데몬 서비스**다.
{N}개의 독립 Daemon 모듈이 각각 {스케줄/이벤트} 기반으로 {처리 내용}을 담당한다.
{스케줄링 방식 — @Scheduled, Quartz 등}.
{연동 시스템}.
```

### Proxy / Router

```
{프로젝트명}는 플랫폼과 {외부 시스템} 간 요청을 중계하는 **{역할} 프록시**다.
{N}개의 독립 Proxy 모듈이 {기관/채널}별 {처리 방식}을 처리한다.
{전문 규격/프로토콜 특이사항}.
{트랜잭션/에러 처리 특이사항}.
```

### Kafka Consumer

```
{프로젝트명}는 플랫폼의 **Kafka 메시지 소비 서비스**다.
{N}개의 독립 Consumer 모듈이 각각 특정 Kafka 토픽을 구독하여 {처리 내용}을 담당한다.
각 Consumer는 {실행 방식}으로 멀티스레드 소비자를 실행한다.
{MDC 전파, 중복 방지 등 특이사항}.
```

### Library

```
{프로젝트명}는 플랫폼에서 {핵심 기능}을 처리하는 **공유 라이브러리**다.
{의존 프로젝트 목록}이 의존하는 핵심 모듈이다.
{기술 특이사항 — ORM 미사용/저수준 DB 접근 등}.
{설계 패턴 — Template Method, 퍼사드 등}.
{트랜잭션 경계 등 사용 계약}.
```

### Single service (cache / document etc.)

```
{프로젝트명}는 플랫폼 내부 서비스가 {기능}을 공유할 수 있도록 **REST API 형태로 {기능}을 중계하는 서비스**다.
{내부 호출 방식}.
{주요 API 또는 기능}.
{특이사항 — ORM 미사용/저수준 DB 접근 등}.
```

---

## Writing quality criteria

| Criterion | Good example | Bad example |
|------|---------|---------|
| Specificity | `**88개 Job**을 **17개 카테고리**로 관리` | `여러 배치 Job을 관리` |
| Explicit integrations | `app-core 1.3.7로 주문·승인 처리` | `승인 처리를 수행` |
| Clear role | `모바일 앱(iOS/Android)의 모든 API 요청을 처리` | `API를 제공` |
| Technical particulars | `비동기 응답 홀더로 TCP 응답 대기` | `비동기 처리 사용` |
