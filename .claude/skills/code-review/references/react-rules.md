# React 결함 룰 (fw-react)

> code-review 스킬에서 참조하는 React 특화 점검 절차. lang-typescript 위 가산.

<Detection>

변경된 파일 목록에서 다음 패턴을 추출한다:
- `**/*.tsx`, `**/*.jsx` 중 JSX·Hook(`use*`) 사용 파일
- `**/components/**`, `**/hooks/**`, `**/pages/**`

해당 파일이 **없으면** → 이 스텝 건너뜀
해당 파일이 **있으면** → 아래 규칙 순서대로 점검

</Detection>

<Rule_Conditional_Hook>

**Hook 규칙 위반 탐지**

패턴: `useState`/`useEffect` 등 Hook이 `if`/`for`/`&&`/조기 `return` 이후·중첩 함수 안에서 호출.

문제: 렌더마다 Hook 호출 순서가 달라져 상태가 어긋남(런타임 깨짐).
안전 패턴: Hook은 컴포넌트·커스텀 Hook 최상위에서만. 조건은 Hook 내부로.
탐지 시: 위치(파일·라인)와 위반 Hook명 명시.

</Rule_Conditional_Hook>

<Rule_Effect_Cleanup_Missing>

**Effect 정리 누락 탐지**

패턴: `useEffect` 안에서 구독(`addEventListener`·`subscribe`)·타이머(`setInterval`/`setTimeout`)·연결을 생성하면서 cleanup 함수 미반환.

문제: 언마운트·재실행 시 리스너·타이머 누수, 중복 구독.
안전 패턴: `return () => { ...정리... }`.
탐지 시: 누수 자원 종류와 위치 명시.

</Rule_Effect_Cleanup_Missing>

<Rule_Effect_Deps>

**Effect 의존성 배열 결함 탐지**

패턴: `useEffect`가 읽는 반응형 값(props·state·함수)이 의존성 배열에서 누락, 또는 `// eslint-disable react-hooks/exhaustive-deps`로 억제.

문제: 오래된 클로저(stale closure)로 갱신 누락 버그.
안전 패턴: 읽는 값 전부 의존성에 포함. 불필요하면 Effect 자체를 제거하거나 값을 Effect 안으로.

</Rule_Effect_Deps>

<Rule_State_Mutation>

**상태 직접 변경 탐지**

패턴: `state.push(...)`·`obj.field = ...` 등 state 객체/배열을 직접 변경 후 같은 참조로 setState, 또는 변경만 하고 setState 누락.

문제: React가 변경을 감지 못해 리렌더 누락.
안전 패턴: 새 객체/배열로 교체(`setItems(prev => [...prev, x])`).

</Rule_State_Mutation>

<Rule_List_Key>

**리스트 key 결함 탐지**

패턴: `.map(...)` 렌더에서 `key` 누락 또는 `key={index}`(배열 인덱스) 사용.

문제: 재정렬·삽입·삭제 시 컴포넌트 상태가 잘못된 항목에 매핑.
안전 패턴: 데이터의 안정적 고유 id를 key로.

</Rule_List_Key>

<Rule_Render_Side_Effect>

**렌더 중 부작용 탐지**

패턴: 컴포넌트 본문(렌더 경로)에서 직접 `fetch`·전역 변수 변경·`localStorage` 쓰기·DOM 조작.

문제: 렌더 비순수화 → 동시성 모드·StrictMode에서 예측 불가.
안전 패턴: 이벤트 핸들러 또는 `useEffect`로 이동.

</Rule_Render_Side_Effect>
