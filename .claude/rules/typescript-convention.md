# TypeScript Coding Conventions

Enforce the following coding standards for TypeScript files.

> **적용 대상:** `**/*.ts`, `**/*.tsx` (테스트 파일 포함)

---

## Naming Conventions

- **Classes / Interfaces / Decorators**: PascalCase. Pattern: `^[A-Z][a-zA-Z0-9]*$`
  - ✅ `UserService`, `CreateUserDto`, `AuthGuard`
  - ❌ `userService`, `createUserDTO`, `auth_guard`
- **Methods / Variables / Parameters**: camelCase. Pattern: `^[a-z][a-zA-Z0-9]*$`
  - ✅ `findAll`, `userId`, `isActive`
  - ❌ `FindAll`, `user_id`, `IsActive`
- **Constants (module-level)**: UPPER_SNAKE_CASE.
  - ✅ `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT_MS`
  - ❌ `maxRetryCount`, `defaultTimeoutMs`
- **Enums**: PascalCase 이름, 멤버는 UPPER_SNAKE_CASE.
  - ✅ `enum UserStatus { ACTIVE, INACTIVE }`
  - ❌ `enum userStatus { active, inactive }`
- **Type Aliases / Interfaces**: PascalCase. `I` 접두사 사용 금지.
  - ✅ `type UserPayload = ...`, `interface PaginationOptions`
  - ❌ `type userPayload`, `interface IUserService`

---

## File Naming

- **kebab-case** 강제. 역할을 접미로 표시.
  - ✅ `user-service.ts`, `auth-controller.ts`, `create-user.dto.ts`
  - ❌ `UserService.ts`, `authController.ts`
- **테스트 파일**: 대상 파일명 + `.test.ts` 또는 `.spec.ts` (프로젝트 컨벤션 일관 유지)
  - ❌ `UserServiceTest.ts`

---

## Formatting (Prettier 위임)

- **들여쓰기**: 2 spaces (탭 문자 사용 금지).
- **줄 끝**: LF (Unix style). **인코딩**: UTF-8. **후행 공백**: 제거.
- **세미콜론**: 문장 끝에 항상 붙임.
  - ✅ `const x = 1;`  ❌ `const x = 1`
- 줄 길이·따옴표 등 세부는 Prettier 설정에 위임, 수동 정렬 금지.

---

## Type Safety

- **`tsconfig` strict 모드**를 켠다(`strict: true`). [ref: typescript/tsconfig]
- **`any` 금지**: 불가피하면 `unknown` + 좁히기. `as any` 캐스팅으로 타입 시스템 우회 금지.
- 공개 함수·메서드는 반환 타입을 명시한다.
  - ✅ `async findAll(): Promise<User[]>`
  - ❌ `findAll() { return repo.find(); }` (반환 타입 미명시)
- `null`/`undefined` 가능 값은 옵셔널 체이닝(`?.`)·널 병합(`??`)으로 안전 접근.

---

## Imports

- **와일드카드 임포트 금지**: `import * as` 사용 금지 (타입 전용 제외).
  - ✅ `import { readFile } from 'node:fs/promises';`
  - ❌ `import * as fs from 'node:fs';`
- **순서** (각 그룹 사이 빈 줄):
  1. Node.js 내장 (`node:fs`, `node:path` 등)
  2. 서드파티
  3. 내부 절대 경로 (path alias `@app/*` 등)
  4. 상대 경로 (`../`, `./`)
- **타입 임포트**: `import type` 사용 권장 (런타임 불필요 타입).

---

## Exports

- **Named export 우선**: `default export` 사용 금지.
  - ✅ `export class UserService {}`
  - ❌ `export default class UserService {}`
- **배럴 파일(`index.ts`)**: feature 루트에 두어 외부 노출 표면을 명시적으로 관리.

---

## Async

- **async/await 일관성**: `Promise`를 반환하는 함수는 `async`로 선언하거나 반환 타입을 명시한다.
- floating promise 금지: 결과를 쓰지 않는 비동기 호출은 `await` 하거나 의도적 fire-and-forget이면 `void` + 에러 처리.
