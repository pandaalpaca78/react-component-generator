import type { GeneratedComponent, Provider } from '../types';

export const decodeApiKey = (value: unknown): string => typeof value === 'string' ? value : '';
export const decodeProvider = (value: unknown): Provider => value === 'anthropic' ? value : 'google';
export const decodeHistory = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export function decodeComponents(value: unknown): GeneratedComponent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object' || !('id' in item) || typeof item.id !== 'string'
      || !('prompt' in item) || typeof item.prompt !== 'string'
      || !('code' in item) || typeof item.code !== 'string'
      || !('createdAt' in item) || typeof item.createdAt !== 'string') return [];
    const createdAt = new Date(item.createdAt);
    return Number.isNaN(createdAt.getTime()) ? [] : [{ id: item.id, prompt: item.prompt, code: item.code, createdAt }];
  });
}
