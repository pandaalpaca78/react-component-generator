import { describe, it, expect } from 'vitest';
import { readSSE } from '../src/stream';
describe('SSE decoding', () => {
  it('delivers JSON events across UTF-8 and network boundaries', async () => {
    const bytes = new TextEncoder().encode('data: {"text":"한글"}\r\n\r\ndata: {"done":true}\n\n');
    const body = new ReadableStream<Uint8Array>({start(c) { for (const byte of bytes) c.enqueue(new Uint8Array([byte])); c.close(); }});
    const events: unknown[] = [];
    await readSSE(body, event => { events.push(event); });
    expect(events).toEqual([{text:'한글'}, {done:true}]);
  });
});
