# 유형별 CLAUDE.md 템플릿

---

## 공통 기반 (전 유형)

```markdown
# {프로젝트명}
{한 줄 설명 — 유형 + 기술스택}

---

## Overview

| 항목       | 값                                       |
| ---------- | ---------------------------------------- |
| 유형       | {web-api / web-fullstack / batch / daemon / library / ...} |
| 프레임워크 | {백엔드 프레임워크}                      |
| 언어       | {언어 및 버전}                           |
| 빌드       | 빌드 도구 {단일/멀티} 모듈               |

---

## 업무 설명

### 핵심 역할

{3~8줄 단락 — 프로젝트 목적, 주요 기능 범위, 연동 시스템, 기술 특이사항}

> 작성 가이드(분량 기준 / 유형별 작성 패턴 7종 / 품질 기준)는 `references/core-role-guide.md` 단일 출처를 참조한다.

### {도메인명} — {설명}

- **기능** (`/경로`): 설명

---

## Base Package

`{{config.baseNamespacePattern}}.{project}`

---

## 패키지 구조

```
{{config.baseNamespacePattern}}.{project}/
├── config/
├── controller/
├── mapper/
├── model/
├── service/
└── util/
```

---

## 주요 의존성

| 의존성              | 버전  | 용도          |
| ------------------- | ----- | ------------- |
| {ORM 라이브러리}    | x.x.x | ORM           |
| {암호화 라이브러리} | x.x.x | 설정 암호화   |
| {공통 유틸}         | x.x.x | 공통 유틸     |
| {SQL 로거}          | x.x.x | SQL 로깅      |

---

## Build & Run

표준 빌드 명령은 `.claude/rules/dev-guide.md` §4 단일 출처를 따른다. 본 섹션에는 **프로젝트 고유 명령** (Job 단위 빌드, 특수 인자 등) 이 있을 때만 기재한다. 일반 빌드 명령은 반복 기재하지 않는다.

---

## Development Guide

상세 가이드: `.claude/docs/guideline/guide-{type}.md`

---

## Project-Specific Notes

- {프로젝트 고유 주의사항 — 표준 패턴은 가이드 참조이고 본 섹션은 프로젝트 고유 항목만 기재}

> **작성 원칙:** 가이드(`.claude/docs/guideline/{guideline}`) 와 중복되는 일반 패턴(명명 규칙·공통 어노테이션·공통 응답 래퍼 정의 등)은 본 섹션에 적지 않는다. 프로젝트 고유 quirk(전용 보안 모듈, 특정 클래스명, 빌드 프로파일 특이사항, gotcha 등) 만 기재한다. 고유 항목이 없는 프로젝트는 한 줄(`표준 패턴은 Development Guide 참조. 본 프로젝트 고유 항목 없음.`) 만 남긴다.
```

---

## 유형별 추가 섹션

프로젝트 유형(web-api / web-fullstack / batch / daemon / library 등)에 따라 공통 골격 위에 덧붙는 섹션과, `guideline` 파일명 → 유형 분류 매핑은 **설치된 언어/프레임워크 팩**이 제공한다.

- 팩이 `skills/update-claude-md/templates/type-templates.md` 를 조립했으면(언어/프레임워크 팩 설치 시) 그 파일의 유형별 섹션·분류표를 따른다.
- 팩 유형 템플릿이 없으면 공통 골격만 적용하고, 유형은 `## Overview` 라벨 또는 `project.yaml` `guideline`(backend/frontend) 파일명으로 표시만 한다.

### [멀티모듈] Overview 아래 서브모듈 테이블

대상: project.yaml `projects[].multiModule: true`

```markdown
### 서브모듈

| 모듈       | 역할         |
| ---------- | ------------ |
| `common`   | 공통 라이브러리 |
| `{module}` | {설명}       |
```

사용 가능한 `{module}` 값은 `## Overview` 의 서브모듈 표를 그대로 참조하면 되므로, `## Build & Run` 에 모듈별 빌드 명령을 반복 나열하지 않는다. 모듈 단위 빌드/테스트 명령의 단일 출처는 `.claude/rules/dev-guide.md` 다.

---

## 프로젝트 분류 매핑

> **프로젝트 목록·분류의 단일 출처는 `.claude/config/project.yaml projects[]` 다.**
> 개별 프로젝트의 분류는 `project.yaml` `projects[].guideline`(backend 또는 frontend) 가이드 파일명에서 읽는다. 해당 프로젝트 `CLAUDE.md` `## Overview` 의 한국어 라벨은 보조 표시용.
> 이 파일에 목록을 별도로 관리하지 않는다 — 중복 관리로 인한 불일치를 방지하기 위함이다.
>
> **가이드 파일명 → 분류 코드** 변환표는 언어/프레임워크마다 다르므로 설치된 팩(`skills/update-claude-md/templates/type-templates.md`)이 소유한다. 팩 미설치 시 `## Overview` 라벨을 그대로 유형 표시로 쓴다.
