# Frontend Rules

## Module Context

브라우저 UI는 생성 요청과 결과 목록을 관리하고, 서버가 반환한 코드 문자열을 react-live에 전달한다. 프로바이더 API 호출은 서버에 둔다.

## Tech Stack & Constraints

- React 19, TypeScript 5.9, react-live 4, React Testing Library, Vitest/jsdom.
- 앱 소스의 TSX와 미리보기로 실행하는 JavaScript/JSX 문자열을 구분한다. 앱 컴파일러는 생성 코드 문자열을 검사하지 않는다.

## Implementation Patterns

- 생성 요청·오류·결과 목록 상태는 `useComponentGenerator`를 통해 변경한다. 입력 UI는 `onGenerate`와 `isLoading`으로 연결한다.
- 카드의 새로고침은 React `key` 변경으로 미리보기를 리마운트한다. 재생성은 같은 프롬프트로 새 API 요청을 보낸다. 두 동작을 구분한다.
- 기존 스타일 토큰은 `App.css`의 `:root`에 있다. 테마 변경은 토큰과 반응형·감소 모션 규칙을 함께 확인한다.

## Testing Strategy

- UI 단위 테스트: `bun run test -- src/components/PromptInput.test.tsx`
- UI 테스트는 `*.test.tsx`로 두고 역할·접근 가능한 이름으로 요소를 조회한다. `src/test/setup.ts`가 매 테스트 후 DOM을 정리한다.
- 기존 입력 테스트는 빈 값·일반 제출·로딩 버튼 상태를 검증한다. 단축키, 예시 선택, App 및 생성 훅, 미리보기 통합은 기존 테스트로 보장되지 않는다.
- 입력 동작 변경 시 해당 동작을 테스트하고, 스타일 변경은 브라우저에서 데스크톱·모바일 레이아웃을 확인한다. 현재 테스트 설정은 `css: false`라 시각적 정합성을 검증하지 않는다.

## Local Golden Rules

- **이중 방어:** 버튼의 disabled 처리와 `handleSubmit`의 `prompt.trim()`·`!isLoading` 검사를 모두 유지한다. Ctrl/Meta+Enter도 같은 핸들러를 호출하므로 버튼 상태만으로 제출을 방어할 수 없다. 근거: [components/PromptInput.tsx:22](components/PromptInput.tsx#L22), [components/PromptInput.tsx:47](components/PromptInput.tsx#L47), [components/PromptInput.tsx:58](components/PromptInput.tsx#L58).
- **하드 제약:** `LiveProvider noInline`은 `render(...)` 호출이 포함된 코드를 받는다. 미리보기 모드를 바꾸면 서버의 출력·정규화 계약도 검토하고 오류 표시를 유지한다. 근거: [components/LivePreview.tsx:14](components/LivePreview.tsx#L14), [components/LivePreview.tsx:18](components/LivePreview.tsx#L18), [../server/generator.ts:16](../server/generator.ts#L16).
- **실행 경계:** 생성 코드는 같은 페이지의 react-live에서 실행되며 별도 iframe 격리가 없다. API 키나 앱 내부 상태를 `scope`로 주입하지 않고 이 미리보기를 보안 샌드박스로 설명하지 않는다. 근거: [components/LivePreview.tsx:14](components/LivePreview.tsx#L14), [App.tsx:15](App.tsx#L15).
- **상태 형식:** `GeneratedComponent.createdAt`은 `Date`다. 저장·복원 기능 추가 시 문자열을 그대로 넘기지 말고 Date로 복원한다. 근거: [types/index.ts:7](types/index.ts#L7), [hooks/useComponentGenerator.ts:39](hooks/useComponentGenerator.ts#L39), [components/ComponentCard.tsx:18](components/ComponentCard.tsx#L18).
- **키 전환:** 프로바이더 선택 변경 시 직접 입력한 키를 초기화하는 동작을 유지한다. 근거: [App.tsx:53](App.tsx#L53).
- **리마운트:** 미리보기 새로고침을 단순 재렌더로 바꾸지 않는다. 새로고침 시 생성 코드의 로컬 상태가 초기화되어야 한다. 근거: [components/ComponentCard.tsx:33](components/ComponentCard.tsx#L33), [components/ComponentCard.tsx:70](components/ComponentCard.tsx#L70).
