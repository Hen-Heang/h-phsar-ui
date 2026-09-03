# React 개발 가이드

> **적용 대상:** React 기반 프런트엔드(SPA·컴포넌트 UI). lang-typescript 위 가산 레이어.
> 도구 버전은 프로젝트 `package.json` 단일 출처(버전 무관 저작).

## 1. 컴포넌트 — 함수형 + 순수 렌더

- 컴포넌트는 함수형으로 작성한다. 렌더 함수는 **순수**해야 한다 — 같은 props·state면 같은 결과. [ref: react/components]
- 렌더 중에 외부 변수 변경·DOM 직접 조작·네트워크 호출 등 부작용 금지. 부작용은 이벤트 핸들러나 `useEffect`로.
- props는 읽기 전용이다. 컴포넌트 안에서 props를 변경하지 않는다.

```tsx
type UserCardProps = { user: User; onSelect: (id: number) => void };

export function UserCard({ user, onSelect }: UserCardProps) {
  return <button onClick={() => onSelect(user.id)}>{user.name}</button>;
}
```

## 2. Hook 규칙

- Hook은 **컴포넌트·커스텀 Hook의 최상위에서만** 호출한다. 조건문·반복문·중첩 함수 안에서 호출 금지. [ref: react/rules-of-hooks]
- 조건이 필요하면 조건을 Hook 안으로 넣는다(Hook 호출 자체를 조건부로 만들지 않는다).
- 커스텀 Hook 이름은 `use`로 시작한다. `eslint-plugin-react-hooks`를 활성화한다.

```tsx
// ❌ 조건부 Hook 호출
if (isLoggedIn) { useEffect(() => fetchUser(), []); }

// ✅ 조건을 Hook 안으로
useEffect(() => { if (isLoggedIn) fetchUser(); }, [isLoggedIn]);
```

## 3. 상태 관리

- 상태는 불변으로 다룬다. 객체·배열을 직접 변경하지 말고 새 값으로 교체한다(`setState(prev => ...)`).
- **파생 가능한 값은 상태로 두지 않는다** — 렌더 중 계산하거나 `useMemo`로. 상태 중복은 동기화 버그의 원인.
- 상태는 그것을 함께 쓰는 컴포넌트들의 가장 가까운 공통 부모로 끌어올린다(lifting state up).
- 전역적으로 공유되는 값만 Context로. Context 남용은 불필요한 리렌더를 부른다.

## 4. useEffect — 최후의 수단

- Effect는 **외부 시스템과의 동기화**(구독·타이머·수동 DOM·비-React 위젯)에만 쓴다. [ref: react/synchronizing-with-effects]
- 사용자 동작에 대한 반응은 Effect가 아니라 **이벤트 핸들러**에 둔다.
- 정리(cleanup)가 필요한 구독·타이머·리스너는 반드시 cleanup 함수를 반환한다.
- 의존성 배열에는 Effect가 읽는 모든 반응형 값을 빠짐없이 넣는다(린터 경고 무시 금지).

```tsx
useEffect(() => {
  const conn = createConnection(roomId);
  conn.connect();
  return () => conn.disconnect();   // cleanup — 누수·중복 구독 방지
}, [roomId]);
```

## 5. 리스트 렌더링 — key

- 리스트 항목에는 **안정적이고 고유한 `key`**를 준다(데이터의 id). [ref: react/rendering-lists]
- **배열 인덱스를 key로 쓰지 않는다** — 순서가 바뀌면 상태가 엉키고 렌더가 깨진다.

## 6. 서버 상태·데이터 패칭

- 서버 데이터는 `useEffect` + `fetch` 수동 조합 대신 **데이터 패칭 라이브러리**(예: `@tanstack/react-query`)로 캐싱·로딩·에러·재시도를 일관 처리한다. [ref: tanstack-query/queries]
- 폼·외부 입력은 Zod 등으로 경계에서 검증한다(lang-typescript 규약).

## 7. 성능

- `useMemo`/`useCallback`/`React.memo`는 **측정된 병목에만** 적용한다. 선제적 남용은 코드만 복잡하게 만든다.
- 큰 리스트는 가상화(windowing)를 검토한다.

## 체크리스트

- [ ] 렌더 함수가 순수한가? (렌더 중 부작용·props 변경 없음)
- [ ] Hook이 최상위에서만 호출되는가? (조건·반복문 안 호출 없음)
- [ ] 상태를 불변으로 갱신하는가? 파생값을 상태로 중복 저장하지 않는가?
- [ ] Effect가 외부 동기화에만 쓰이고, 정리가 필요한 경우 cleanup을 반환하는가?
- [ ] Effect 의존성 배열이 완전한가? (린터 경고 억제 없음)
- [ ] 리스트 `key`가 안정적 고유값인가? (인덱스 key 아님)
- [ ] 서버 상태를 데이터 패칭 라이브러리로 다루는가? (수동 useEffect 패칭 지양)
