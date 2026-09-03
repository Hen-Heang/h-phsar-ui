# Next.js 결함 룰 (fw-nextjs)

> code-review 스킬에서 참조하는 Next.js(App Router) 특화 점검 절차. lang-typescript 위 가산.

<Detection>

변경된 파일 목록에서 다음 패턴을 추출한다:
- `app/**/*.tsx`, `app/**/*.ts` (page·layout·route·loading·error)
- `**/actions/**`, `'use server'`/`'use client'` 지시문 포함 파일
- `next.config.*`

해당 파일이 **없으면** → 이 스텝 건너뜀
해당 파일이 **있으면** → 아래 규칙 순서대로 점검

</Detection>

<Rule_Secret_In_Client>

**비밀 값 클라이언트 노출 탐지**

패턴: `NEXT_PUBLIC_` 접두사가 붙은 환경변수에 API 키·시크릿·토큰·DB 자격증명이 담김, 또는 서버 전용 비밀을 클라이언트 컴포넌트(`'use client'`)에서 참조.

문제: 클라이언트 번들에 비밀이 박혀 영구 유출.
안전 패턴: 비밀은 접두사 없는 서버 전용 env로, 서버 코드에서만 사용.
탐지 시: **Critical** 마킹, 변수명·위치 명시.

</Rule_Secret_In_Client>

<Rule_Unsafe_Server_Action>

**Server Action 검증·인가 누락 탐지**

패턴: `'use server'` 함수가 입력(`FormData`·인자)을 검증·인가 없이 DB·외부에 그대로 사용.

문제: 임의 입력으로 무단 쓰기·권한 우회.
안전 패턴: 서버에서 스키마 검증(Zod 등) + 인증/인가 확인 후 처리.
탐지 시: 액션명·위치 명시.

</Rule_Unsafe_Server_Action>

<Rule_Client_Effect_Fetch>

**클라이언트 초기 패칭 탐지**

패턴: `'use client'` 컴포넌트의 `useEffect`에서 서버 컴포넌트로 옮길 수 있는 초기 데이터 패칭.

문제: 불필요한 클라이언트 워터폴·번들 증가·SEO 손해.
안전 패턴: 서버 컴포넌트에서 패칭해 props로 전달, 또는 데이터 패칭 라이브러리.

</Rule_Client_Effect_Fetch>

<Rule_Missing_Cache_Intent>

**캐싱 의도 누락 탐지**

패턴: 서버 패칭 `fetch`에 `cache`/`next.revalidate` 미지정으로 의도 불명확(특히 사용자별·실시간 데이터).

문제: 의도치 않은 정적 캐싱으로 stale 데이터 노출, 또는 과도한 동적 렌더.
안전 패턴: 데이터 성격에 맞는 캐싱 옵션 명시.

</Rule_Missing_Cache_Intent>

<Rule_Overbroad_Use_Client>

**`'use client'` 과용 탐지**

패턴: 상호작용·상태·브라우저 API가 없는 컴포넌트 최상단에 `'use client'`.

문제: 서버 렌더 이점 상실, 번들 비대화.
안전 패턴: 클라이언트 경계를 상호작용 잎 컴포넌트로 좁힌다.

</Rule_Overbroad_Use_Client>
