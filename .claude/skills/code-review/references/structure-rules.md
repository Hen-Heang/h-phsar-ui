# TypeScript 구조 결함 룰

> code-review 스킬에서 참조하는 TypeScript 모듈 구성 점검 절차(프레임워크 무관).

<Detection>

변경된 파일 목록에서 다음 패턴 파일을 추출한다:
- `**/*.ts`, `**/*.tsx`
- `**/index.ts` (배럴 파일)

해당 파일이 **없으면** → 이 스텝 건너뜀
해당 파일이 **있으면** → 아래 규칙 순서대로 점검

</Detection>

<Rule_Circular_Dependency>

**순환 의존(Circular Dependency) 탐지**

패턴: 모듈 A가 B를 import하고 B가 다시 A를 import하는 구조. 런타임 `undefined` 참조(부분 초기화) 유발 가능.

탐지 방법:
1. 변경 파일의 최상위 `import` 대상 수집
2. 두 모듈이 서로를 최상위에서 import하는지 확인
3. 배럴 파일(`index.ts`)을 통한 간접 순환 주의
4. 공통 의존은 별도 하위 모듈로 추출 권고

심각도: 런타임 오류 가능 → **High** 이상 마킹.

</Rule_Circular_Dependency>

<Rule_Unhandled_Promise>

**미처리 Promise / 누락 await 탐지**

패턴: `async` 함수 내부에서 Promise 반환 호출에 `await`가 없거나 `.catch()` 없이 floating promise 발생.

탐지 포인트:
1. **Floating Promise**: `async` 함수 안에서 `await` 없는 promise-returning 호출(결과를 변수에 담지도 `await`도 안 함)
2. **void 캐스팅 남용**: `void doAsync()` — 의도적 fire-and-forget인지 확인, 에러 무시 시 경고
3. **생성자 내 async 호출**: 생성자에서 직접 async 호출은 완료 보장 불가 → 초기화 메서드로 분리 권고
4. **`Promise.all` 없는 병렬 호출**: 독립 async 작업을 순차 `await` 나열 → `Promise.all([...])` 병렬화 권고

</Rule_Unhandled_Promise>

<Rule_Barrel_And_Layering>

**모듈 경계·레이어 분리 탐지**

패턴: 레이어 간 단방향 의존 위반, 배럴 파일 오남용.

탐지 포인트:
1. 하위(저수준) 모듈이 상위(고수준) 모듈을 import → 역방향 의존 경고
2. `default export` 사용 → named export 권고(컨벤션)
3. 배럴(`index.ts`)이 거대해져 순환·과결합을 유발하는지 확인

탐지 결과는 리뷰 출력에 코드 위치와 함께 통합된다. 별도 파일로 저장하지 않는다.

</Rule_Barrel_And_Layering>
