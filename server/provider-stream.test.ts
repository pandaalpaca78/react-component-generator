import { expect, it } from 'vitest';
import { consumeProvider } from './stream';
const response = (events: unknown[]) => new Response(events.map(e => `data: ${JSON.stringify(e)}\n\n`).join(''));
it('streams Anthropic text and waits for message_stop', async () => {
 const codes: string[] = [];
 const result = await consumeProvider(response([{type:'content_block_delta',delta:{type:'text_delta',text:'hello'}},{type:'message_stop'}]), 'anthropic', c=>codes.push(c));
 expect(codes).toEqual(['hello']); expect(result).toBe('hello');
});
it('streams Google text chunks', async () => {
 const codes: string[] = [];
 expect(await consumeProvider(response([{candidates:[{content:{parts:[{text:'a'}]}}]},{candidates:[{content:{parts:[{text:'b'}]},finishReason:'STOP'}]}]), 'google', c=>codes.push(c))).toBe('ab');
 expect(codes).toEqual(['a','ab']);
});
it('rejects truncated Google output', async () => {
 await expect(consumeProvider(response([{candidates:[{finishReason:'MAX_TOKENS'}]}]), 'google', ()=>{})).rejects.toThrow('잘렸습니다');
});
it('rejects disconnected provider streams', async () => {
 await expect(consumeProvider(response([]), 'anthropic', ()=>{})).rejects.toThrow();
});
