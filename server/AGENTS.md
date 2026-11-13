# Server Rules

## Module Context

Bun 서버가 프로바이더를 호출하고 응답을 실행 가능한 코드로 정규화한다. 정규화와 모델 폴백은 서버 구동 없이 테스트할 수 있는 순수 모듈로 분리되어 있다.

## Tech Stack & Constraints

- Bun.serve, TypeScript, fetch, Vitest. Bun의 타입 선언은 `@types/bun`을 사용한다.
- 현재 프로바이더 연동은 fetch 기반이다. API 응답 구조와 오류 처리를 프로바이더별로 유지한다.

## Implementation Patterns

- 새 응답 정규화는 `generator.ts`, 순차 모델 재시도는 `fallback.ts`의 기존 패턴에 맞춘다. 테스트 대상 순수 모듈에서 서버 엔트리포인트를 import하지 않는다.
- 응답은 `Response.json`과 기존 CORS 헤더를 사용한다. API 경로 수정 시 OPTIONS·오류·404 응답도 함께 검토한다.
- 프로바이더 종류를 추가하면 서버의 `Provider`·`ENV_KEYS`·분기와 클라이언트의 타입·설정을 함께 확인한다.

## Testing Strategy

- 서버 단위 테스트: `bun run test -- server/generator.test.ts server/fallback.test.ts`
- 코드 정규화 변경은 기존 render 호출 보존·선언 탐지·펜스 제거를 검증한다. 폴백 변경은 호출 순서·첫 성공 종료·모든 실패 시 마지막 오류·빈 목록을 검증한다.
- `server/index.ts`는 import 시 `Bun.serve`를 실행한다. 기존 단위 테스트는 HTTP 라우팅이나 실제 프로바이더 응답을 검증하지 않는다. 라우팅 변경은 mock fetch 또는 로컬 요청으로 별도 확인하고 외부 API 호출 여부를 보고한다.

## Local Golden Rules

- **출력 제약:** 생성 코드는 import·TypeScript 구문·CSS import 없이 inline style과 JavaScript/JSX로 작성하고 마지막에 `render(...)`를 호출하도록 유지한다. 프로젝트 자체의 TypeScript 규칙을 생성 코드에 적용하지 않는다. 근거: [index.ts:9](index.ts#L9), [index.ts:20](index.ts#L20).
- **이중 방어:** 시스템 프롬프트가 코드만 출력하도록 요구하더라도 `stripCodeFences` 다음 `ensureRenderCall` 적용을 제거하지 않는다. 기존 render 호출을 중복 삽입하지 않는 동작도 보존한다. 근거: [index.ts:16](index.ts#L16), [index.ts:188](index.ts#L188), [generator.ts:16](generator.ts#L16), [generator.test.ts:20](generator.test.ts#L20).
- **비대칭:** Google에만 순차 모델 폴백과 `MAX_TOKENS` 잘림 검사가 있다. 공통화하면서 이 처리를 누락하거나 Anthropic에도 동일한 응답 필드가 있다고 가정하지 않는다. 근거: [index.ts:92](index.ts#L92), [index.ts:122](index.ts#L122), [index.ts:134](index.ts#L134).
- **폴백 의미:** 모델 순서를 지키고 첫 성공에 종료하며, 모두 실패하면 마지막 오류를 던진다. 현재 모든 종류의 실패가 다음 모델 시도로 이어지므로 재시도 조건 변경은 명시적으로 검증한다. 근거: [fallback.ts:7](fallback.ts#L7), [fallback.ts:12](fallback.ts#L12), [fallback.test.ts:4](fallback.test.ts#L4).
- **기본값 비대칭:** UI 초기값은 Google이지만 API에서 provider 생략 시 Anthropic이다. 기본값을 변경할 때 양쪽이 이미 같다고 가정하지 않는다. 근거: [../src/App.tsx:17](../src/App.tsx#L17), [index.ts:161](index.ts#L161).
- **키 우선순위:** 클라이언트가 보낸 키가 있으면 서버 환경변수보다 우선한다. Google 요청 URL에는 키가 포함되므로 전체 URL을 로그·에러 응답에 남기지 않는다. 근거: [index.ts:64](index.ts#L64), [index.ts:98](index.ts#L98).
- **오류 매핑:** 외부 요청 실패의 상태 코드를 유지한다. 현재 상위 catch는 메시지에 포함된 `503`·`429`를 검사하므로 메시지 형식을 바꾸면 이 매핑도 함께 수정한다. 근거: [index.ts:84](index.ts#L84), [index.ts:111](index.ts#L111), [index.ts:194](index.ts#L194).
