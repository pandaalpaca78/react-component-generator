# Agent Rules

## Operational Commands

- 저장소 루트에서 실행한다. 개발 서버 실행과 초기 설정은 [README.md](README.md#실행-방법)를 따른다.
- 빌드: `bun run build`
- 정적 검사: `bun run lint`
- 전체 단위 테스트: `bun run test`
- 테스트 감시: `bun run test:watch`
- API만 실행: `bun run server`
- Bun을 기준으로 의존성을 관리하고 `bun.lock`을 갱신한다. 다른 패키지 관리자의 잠금 파일을 추가하지 않는다.
- Bun이 없는 환경에서 기존 의존성으로 검사할 때는 `node node_modules/typescript/bin/tsc -b`, `node node_modules/vite/bin/vite.js build`, `node node_modules/eslint/bin/eslint.js .`, `node node_modules/vitest/vitest.mjs run`을 사용한다. 이 대체 검사는 Bun API 서버 실행 검증을 대신하지 않는다.

## Golden Rules

- **보안 경계:** `/api/config`에는 서버 키의 존재 여부만 반환한다. 실제 환경변수 값을 응답·클라이언트 번들에 넣지 않고 `.env`의 Git 제외를 유지한다. 근거: [server/index.ts:59](server/index.ts#L59), [server/index.ts:147](server/index.ts#L147), [.gitignore:32](.gitignore#L32).
- **API 계약:** 생성 요청의 `prompt`, 선택적 `apiKey`, `provider` 및 성공 응답의 `code`, 실패 응답의 `error`를 바꾸면 양쪽 호출부를 함께 수정한다. 근거: [src/hooks/useComponentGenerator.ts:23](src/hooks/useComponentGenerator.ts#L23), [server/index.ts:159](server/index.ts#L159), [server/index.ts:188](server/index.ts#L188).
- **하드 제약:** API 포트와 Vite 프록시 목적지를 함께 유지한다. 프론트엔드는 상대 경로 `/api`를 호출한다. 근거: [server/index.ts:138](server/index.ts#L138), [vite.config.ts:8](vite.config.ts#L8), [src/hooks/useComponentGenerator.ts:23](src/hooks/useComponentGenerator.ts#L23).
- **검증 경계:** 빌드 성공을 서버 타입 검사나 API 통합 검증 성공으로 보고하지 않는다. TypeScript 프로젝트는 `src`와 `vite.config.ts`만 포함하고, Vitest는 서버 순수 함수와 UI 테스트를 실행한다. 근거: [tsconfig.app.json:27](tsconfig.app.json#L27), [tsconfig.node.json:25](tsconfig.node.json#L25), [vite.config.ts:16](vite.config.ts#L16), [server/generator.test.ts:2](server/generator.test.ts#L2), [server/fallback.test.ts:2](server/fallback.test.ts#L2).

## TDD Rule

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라.**

### 적용 기준과 우선순위

이 섹션은 **전역 기본값(fallback)**이다. 작업 대상의 **하위 디렉토리 `AGENTS.md`에 별도 TDD 규칙이 있으면 그 규칙을 우선** 적용한다.

- **TDD 필수:** 비즈니스 로직, API, 유틸리티, 버그 수정.
- **TDD 불필요:** 타입 정의만의 변경, 설정 파일만의 변경, 동작 없는 순수 UI·스타일 변경, SQL.
- 여러 종류가 섞인 변경은 **동작별로 판정**한다. UI에 포함된 검증·상태 전이·이벤트 처리 로직은 순수 UI가 아니다. **버그 수정은 회귀 테스트부터** 작성한다.

### RED → GREEN → REFACTOR

1. **RED**
   - **하나의 동작 = 하나의 테스트**로 기대 결과를 작성한다. 버그 수정은 재현 테스트를 먼저 작성한다.
   - 테스트를 **반드시 실행해 실패를 확인**한다. 신규 동작은 기능 미구현, 버그 수정은 기대 동작 미구현으로 실패해야 한다.
   - 문법 오류, import 오류, 환경·설정 오류는 유효한 RED가 아니다. 이를 해결한 뒤 **의도한 assertion 실패**를 확인한다.
2. **GREEN**
   - 해당 테스트를 통과시키는 **최소한의 프로덕션 코드만** 작성한다.
   - **YAGNI:** 미래 기능, 불필요한 추상화, 테스트가 요구하지 않은 동작을 추가하지 않는다.
   - **신규 테스트와 기존 테스트를 모두 실행하고 통과**를 확인한다.
3. **REFACTOR**
   - 중복 제거, 이름 개선, 헬퍼 추출로 구조를 정리한다.
   - 변경 중 테스트를 실행해 **GREEN을 유지**한다. **새 동작을 추가하지 않는다.**
4. **반복:** 다음 동작을 선택하고 **RED부터 다시 시작**한다.

### 삭제 강제 규칙

TDD 필수 대상에서 **실패하는 테스트를 작성·실행하기 전에 프로덕션 코드를 먼저 작성했다면, 그 선행 구현을 삭제하고 RED부터 재시작**한다. **주석·별도 파일·복사본 등 “참고용”으로 남기는 것도 금지**한다. 삭제 대상은 이번 작업에서 순서를 어겨 작성한 구현이며, 기존 코드나 사용자의 변경을 지우지 않는다.

### 변명 차단표

| 변명 | 반론 |
| --- | --- |
| “너무 단순해서 테스트 불필요” | **단순함은 제외 기준이 아니다.** TDD 필수 대상이면 작은 테스트부터 작성한다. |
| “나중에 추가하겠다” | 구현 후 테스트는 RED를 입증하지 못한다. **지금 실패부터 확인한다.** |
| “시간이 없다” | **범위를 줄이고 사이클을 지킨다.** 테스트 순서를 생략하지 않는다. |
| “삭제하면 낭비” | 순서를 어긴 구현은 **삭제하고 재시작한다.** 참고용 보관도 허용하지 않는다. |
| “프로토타입이다” | **프로토타입은 면제 사유가 아니다.** 적용 대상이면 동일하게 진행한다. |

## Project Context

제품 목적과 기술 스택은 [README.md](README.md#react-컴포넌트-생성기)를 참조한다. 변경 시 프롬프트 입력에서 생성 결과의 미리보기·코드 확인까지 이어지는 사용 흐름을 기준으로 판단한다.

## Standards & References

- 앱 소스는 TypeScript의 strict·verbatimModuleSyntax 설정을 따른다. 타입 전용 참조에는 `import type`을 사용한다. 생성되는 코드의 형식은 서버 규칙을 따른다.
- 브랜치 생성이나 병합은 요청 범위에 맞춘다. 커밋 요청 시 [.agents/skills/commit/SKILL.md](.agents/skills/commit/SKILL.md)를 적용하고 별도 승인 없이 논리적 단위로 커밋한다. 메시지는 `feat/fix/refactor/chore: 한국어 요약`으로 쓴다. push는 별도 요청 시에만 수행한다.
- 작업 결과에는 실제 실행한 검사와 미검증 범위를 구분해 보고한다.
- 규칙과 코드의 괴리가 발생하면 업데이트를 제안한다. 규칙을 수정할 때는 인용한 파일과 줄 번호를 다시 확인한다.
- 각 `AGENTS.md`는 500줄 미만으로 유지하고, README 내용이나 하위 규칙을 복제하지 않는다. 대응하는 `CLAUDE.md`의 `@AGENTS.md` 참조를 유지한다.

## Context Map

- **[UI·입력·생성 상태·미리보기 수정](src/AGENTS.md)** — 브라우저 상태와 react-live 실행 계약을 변경할 때.
- **[AI API·응답 정규화·모델 폴백 수정](server/AGENTS.md)** — Bun 서버와 프로바이더별 처리를 변경할 때.
