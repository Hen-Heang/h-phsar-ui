# Root CLAUDE.md 템플릿

워크스페이스 루트 `.claude/CLAUDE.md`의 표준 구조.

---

## 표준 섹션 순서

```
1.  # CLAUDE.md — {워크스페이스명}
    {플랫폼 서머리 단락 — 3~5줄}

2.  ## 산출물 경로 규칙
    (target/ 디렉토리 위치 등 워크스페이스 전반 산출물 규칙)

3.  ## 세션 시작 규칙
    (HANDOFF.md / HANDOFF_HISTORY.md 운영 규칙)

4.  ## 프로젝트 인벤토리
    (project.yaml projects[] 포인터 안내 — 표·목록 작성 금지)
```

> **분리 원칙:** 보안 규칙·코딩 컨벤션·개발 규칙·DB 쿼리 규칙은 `.claude/rules/base-rule.md`, 프로젝트 유형 분류·공통 유틸 사용 원칙·로깅 설정은 `.claude/rules/dev-guide.md`, {{config.lang.name}} 코딩 컨벤션은 `.claude/rules/{{config.lang.conventionFile}}`, 테스트 요구사항은 `.claude/rules/testing.md`, **프로젝트 인벤토리(이름·유형·role·multiModule)는 `.claude/config/project.yaml projects[]`** 가 단일 출처다. Root CLAUDE.md 에 이 내용을 중복 기재하지 않는다.

---

## 플랫폼 서머리 작성 규칙

`#` 제목 바로 아래에 위치하며, 플랫폼 전체를 3~5줄로 요약한다.

**포함 항목:**
1. 플랫폼 정체성 — 무엇을 위한 시스템인가 (1문장)
2. 주요 사용자/채널 — 누가 사용하는가 (모바일 앱, 관리자, 파트너, 외부 파트너 등)
3. 핵심 업무 범위 — 어떤 업무를 처리하는가 (주문, 처리, 집계 등)
4. 서비스 규모 — 프로젝트 수, 서비스 구성

---

## 프로젝트 인벤토리 섹션 작성 규칙

Root CLAUDE.md 에 **프로젝트 목록 표를 작성하지 않는다.** 단일 출처는 `.claude/config/project.yaml projects[]`.

본 섹션은 포인터 안내 3~5줄만 포함한다:

```markdown
## 프로젝트 인벤토리

> **단일 출처**: `.claude/config/project.yaml` `projects[]` — 프로젝트명·shortName·multiModule·role·buildArgs·guideline 모두 본 파일이 마스터.
>
> 각 프로젝트의 상세 역할은 프로젝트 루트의 `CLAUDE.md` 도입부 참조.
>
> 신규 프로젝트 추가·기존 항목 변경 시 `project.yaml` 만 수정한다 (본 CLAUDE.md 동기화 불필요).
```

### project.yaml `role` 필드 작성 기준

- 각 프로젝트의 `### 핵심 역할` 섹션을 읽고 **비즈니스 역할 1줄 (15자 이내) 로 축약**
- 기술 스택이 아닌 **"무엇을 하는 서비스인지"** 에 집중
- 상세 설명은 프로젝트 CLAUDE.md 도입부에 위임

**좋은 예:**
- `모바일 앱 전 기능 API`
- `운영자 백오피스`

**나쁜 예:**
- `배치 서비스` (가이드 분류와 중복)
- `회원·주문·구매·선물·파트너·집계·배치` (지나친 상세 — 프로젝트 CLAUDE.md 로)
