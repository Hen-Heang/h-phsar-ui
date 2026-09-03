# code-investigator search profiles

Read only when `workType=frontend|fullstack|unknown`. The Core body of this file defines only the profile-selection contract; installed pack fragments append the concrete framework paths, extensions, and paired-file rules below.

1. If the target project's `projects[].guideline.frontend` exists, read it first and prefer the project's own paths and conventions. If absent, apply only the installed pack profiles.
2. Apply only the installed profiles that match the current project. If several profiles match, apply them all.
3. If neither a project frontend guideline nor an installed pack profile exists, do not guess arbitrary framework paths — record `조립된 프런트 프로필 없음` in the result.
4. Collect screen evidence in this order: similar screens, paired scripts/styles, event/data bindings, called APIs.

## Next.js 프로필

- 대상: app/pages 라우트의 page·layout·route 파일, 컴포넌트, 스타일, 데이터 접근 모듈.
- 연결: 파일 경로 라우트, Server/Client Component 경계, action/route handler와 fetch 호출을 따라간다.
- evidence: 유사 페이지·컴포넌트·라우트·서버 호출 연결을 반환한다.

## React 프로필

- 대상: `*.tsx`, `*.jsx`, `*.ts`, `*.js`, 스타일 파일과 라우트·API 모듈.
- 연결: 컴포넌트 import, props/state, 이벤트 핸들러, query/mutation 또는 HTTP 호출을 따라간다.
- evidence: 유사 컴포넌트·라우트·상태·API 연결을 반환한다.
