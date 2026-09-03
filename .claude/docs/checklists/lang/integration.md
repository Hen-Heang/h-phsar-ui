# Integration — TypeScript 구현 예시

> Core 원칙: `docs/checklists/integration.md` 참조.
> 이 파일은 TypeScript 언어 특화 탐지 키워드 및 코드 예시를 제공한다.

---

## INTG-01 — 생산자 응답 형태 ↔ 소비자 기대 타입 정합

**탐지 키워드:** `fetchJson<`, `as `, `response.json()`, 제네릭 캐스팅, 래핑 응답

**안티패턴:**

```typescript
// 생산자: GET /api/orders -> { orders: Order[] }
// 소비자: 배열로 기대 (제네릭 캐스팅이 불일치를 가림)
const orders = await fetchJson<Order[]>('/api/orders');
orders.filter((o) => o.active); // ❌ 런타임: orders.filter is not a function
```

**모범 패턴:**

```typescript
type OrdersResponse = { orders: Order[] };
const { orders } = await fetchJson<OrdersResponse>('/api/orders');
orders.filter((o) => o.active); // ✅ 봉투를 타입으로 명시하고 unwrap
```

---

## INTG-02 — 직렬화 경계 필드명·옵셔널 일관성

**탐지 키워드:** snake_case, camelCase, `?:`, `undefined`, 응답 매핑

**안티패턴:**

```typescript
// API 응답: { thumbnail_url: string }
interface Theme { thumbnailUrl: string } // ❌ 항상 undefined
const t = (await fetchJson('/api/theme')) as Theme;
img.src = t.thumbnailUrl; // undefined
```

**모범 패턴:**

```typescript
const raw = await fetchJson<{ thumbnail_url: string }>('/api/theme');
const theme = { thumbnailUrl: raw.thumbnail_url }; // ✅ 경계에서 명시적 변환
```

---

## INTG-03 — 유한 집합(유니온) ↔ 분기 완전성

**탐지 키워드:** discriminated union, `switch`, `never`, `as const`, `status ===`

**안티패턴:**

```typescript
type Status = 'pending' | 'approved' | 'rejected';
function label(s: Status) {
  switch (s) {
    case 'pending': return '대기';
    case 'approved': return '승인';
    // ❌ 'rejected' 분기 누락 — 새 상태 추가 시 조용히 빠짐
  }
}
```

**모범 패턴:**

```typescript
function label(s: Status): string {
  switch (s) {
    case 'pending': return '대기';
    case 'approved': return '승인';
    case 'rejected': return '거절';
    default: { const _exhaustive: never = s; return _exhaustive; } // ✅ 컴파일 시 누락 탐지
  }
}
```

---

## INTG-05 — 동기/비동기 응답 형태 구분

**탐지 키워드:** `202`, `Accepted`, 백그라운드, 즉시 응답, 폴링

**안티패턴:**

```typescript
// 생산자: 즉시 { status: 'processing' } 반환, 결과는 비동기
const res = await fetchJson<{ status: string; failedIndices: number[] }>('/api/generate');
res.failedIndices.length; // ❌ 즉시 응답엔 아직 없음 → 크래시
```

**모범 패턴:**

```typescript
type Accepted = { status: 'processing' };
type Done = { status: 'done'; failedIndices: number[] };
const res = await fetchJson<Accepted | Done>('/api/generate');
if (res.status === 'done') res.failedIndices.length; // ✅ 형태 구분 후 접근
```
