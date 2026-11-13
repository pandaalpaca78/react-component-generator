import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useComponentGenerator } from './useComponentGenerator';
afterEach(() => vi.unstubAllGlobals());
it('shows partial code immediately and completes with normalized code', async () => {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new ReadableStream({start(c) { controller = c; }}), {headers: {'Content-Type':'text/event-stream'}})));
  const {result} = renderHook(() => useComponentGenerator());
  let pending!: Promise<void>;
  act(() => {pending = result.current.generate('button', undefined, 'google');});
  expect(result.current.components[0]?.status).toBe('streaming');
  await act(async () => {controller.enqueue(new TextEncoder().encode('data: {"code":"const Button"}\n\n'));});
  await waitFor(() => expect(result.current.components[0].code).toBe('const Button'));
  await act(async () => {controller.enqueue(new TextEncoder().encode('data: {"code":"render(<Button />)","done":true}\n\n')); controller.close(); await pending;});
  expect(result.current.components[0]).toMatchObject({status:'complete', code:'render(<Button />)'});
});
it('keeps partial code and reports an interrupted stream without previewing it', async () => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('data: {"code":"partial"}\n\n', {headers:{'Content-Type':'text/event-stream'}})));
 const {result} = renderHook(() => useComponentGenerator());
 await act(async () => { await result.current.generate('button', undefined, 'google'); });
 expect(result.current.components[0]).toMatchObject({code:'partial',status:'error'});
 expect(result.current.error).toContain('연결이 끊어졌습니다');
});
it('replaces partial output when a fallback model restarts', async () => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('data: {"code":"old"}\n\ndata: {"code":""}\n\ndata: {"code":"new","done":true}\n\n')));
 const {result} = renderHook(() => useComponentGenerator());
 await act(async () => { await result.current.generate('button', undefined, 'google'); });
 expect(result.current.components[0]).toMatchObject({code:'new',status:'complete'});
});
