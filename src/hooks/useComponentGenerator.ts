import { readSSE } from '../stream';
import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    const id = crypto.randomUUID();
    setComponents(prev => [{id, prompt, code: '', createdAt: new Date(), status: 'streaming'}, ...prev]);
    const update = (code: string, status: GeneratedComponent['status']) => setComponents(prev => prev.map(c => c.id === id ? {...c, code, status} : c));
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider, stream: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate component');
      }
      if (!res.body) throw new Error('스트리밍 응답이 없습니다.');
      let completed = false;
      await readSSE<{code?: string; done?: boolean; error?: string}>(res.body, event => {
        if (event.error) throw new Error(event.error);
        if (typeof event.code === 'string') update(event.code, event.done ? 'complete' : 'streaming');
        if (event.done) completed = true;
      });
      if (!completed) throw new Error('코드 생성 중 연결이 끊어졌습니다. 다시 시도해주세요.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setComponents(prev => prev.map(c => c.id === id ? {...c, status: 'error'} : c));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
