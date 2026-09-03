# Next.js 개발 가이드

> **적용 대상:** Next.js(App Router) 기반 풀스택 웹. lang-typescript 위 가산 레이어. React 규약(fw-react)을 함께 따른다.
> 도구 버전은 프로젝트 `package.json` 단일 출처(버전 무관 저작).

## 1. 서버 컴포넌트 우선

- App Router에서 컴포넌트는 **기본이 서버 컴포넌트**다. 서버에서 데이터를 직접 읽고 렌더한다. [ref: nextjs/server-components]
- `'use client'`는 **상호작용·브라우저 API·React 상태/Effect가 필요할 때만** 선언한다. 클라이언트 경계는 트리의 잎(leaf)에 가깝게 둔다.
- 클라이언트 컴포넌트에 무거운 의존성·서버 전용 코드를 끌고 들어가지 않는다(번들 비대화).

## 2. 데이터 패칭과 캐싱

- 서버 컴포넌트에서 `async`/`await`로 패칭한다. 캐싱 의도를 명시한다. [ref: nextjs/caching]
  - 정적: `fetch(url, { cache: 'force-cache' })` (기본)
  - 매 요청: `fetch(url, { cache: 'no-store' })`
  - 주기 재검증: `fetch(url, { next: { revalidate: 60 } })`
- 클라이언트에서 `useEffect`로 초기 데이터를 패칭하지 않는다 — 서버에서 가져와 props로 내린다.

## 3. 변경(Mutation) — Server Actions

- 폼 제출·쓰기 작업은 **Server Action**(`'use server'`)으로 처리한다. [ref: nextjs/server-actions]
- 쓰기 후 `revalidatePath`/`revalidateTag`로 캐시를 무효화하고, 필요하면 `redirect`한다.
- Server Action 입력은 신뢰하지 않는다 — 서버에서 Zod 등으로 검증하고 인가를 확인한다.

```tsx
'use server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const data = PostSchema.parse(Object.fromEntries(formData));  // 서버 검증
  await db.post.create({ data });
  revalidatePath('/posts');
}
```

## 4. 라우팅·파일 규약

- `app/` 디렉토리 규약을 따른다: `page.tsx`(경로 UI), `layout.tsx`(공유 레이아웃), `loading.tsx`(서스펜스 폴백), `error.tsx`(에러 경계), `route.ts`(API 핸들러).
- API는 `route.ts`의 `GET`/`POST` 등 명명 export로 구현한다.
- 동적 구간은 `[param]`, 병렬·인터셉트 라우트 규약을 남용하지 않는다.

## 5. 환경변수·비밀

- 서버 전용 비밀은 `process.env`로 서버 코드에서만 읽는다. **클라이언트에 노출할 값만 `NEXT_PUBLIC_` 접두사**를 붙인다. [ref: nextjs/environment-variables]
- 비밀(키·토큰)에 절대 `NEXT_PUBLIC_`을 붙이지 않는다 — 번들에 박혀 유출된다.

## 6. 메타데이터·성능

- SEO는 `metadata` export 또는 `generateMetadata`로 선언한다(수동 `<head>` 조작 지양).
- 이미지는 `next/image`, 폰트는 `next/font`로 최적화한다.

## 체크리스트

- [ ] 상호작용이 없는 컴포넌트가 불필요하게 `'use client'`로 선언되지 않았는가?
- [ ] 서버에서 패칭 가능한 데이터를 클라이언트 `useEffect`로 가져오지 않는가?
- [ ] `fetch` 캐싱 의도(force-cache/no-store/revalidate)가 명시됐는가?
- [ ] 쓰기 작업이 Server Action으로 처리되고, 입력 검증·인가·캐시 무효화가 있는가?
- [ ] 비밀 값에 `NEXT_PUBLIC_` 접두사가 붙지 않았는가?
- [ ] 파일 규약(page/layout/loading/error/route)을 따르는가?
