import { describe, expect, it } from 'vitest';
import { isPromptLengthValid } from './validatePromptLength';

describe('isPromptLengthValid', () => {
  it.each([0, 1, 499, 500])('%i자 입력을 허용한다', (length) => {
    expect(isPromptLengthValid('가'.repeat(length))).toBe(true);
  });
  it('앞뒤 공백을 제거하지 않고 길이에 포함한다', () => {
    expect(isPromptLengthValid(' ' + '가'.repeat(499) + ' ')).toBe(false);
  });
  it('501자 입력을 거부한다', () => {
    expect(isPromptLengthValid('가'.repeat(501))).toBe(false);
  });
});
