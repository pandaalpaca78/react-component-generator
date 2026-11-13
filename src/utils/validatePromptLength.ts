export const MAX_PROMPT_LENGTH = 500;

/** 입력 원문을 기준으로 공백과 줄바꿈도 길이에 포함한다. */
export function isPromptLengthValid(prompt: string): boolean {
  return prompt.length <= MAX_PROMPT_LENGTH;
}
