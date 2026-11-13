import { readSSE } from '../src/stream';
interface ProviderEvent {
 type?: string;
 delta?: {type?: string; text?: string; stop_reason?: string};
 error?: {message?: string; status?: number};
 candidates?: Array<{content?: {parts?: Array<{text?: string; thought?: boolean}>}; finishReason?: string}>;
}
export async function consumeProvider(response: Response, provider: 'google' | 'anthropic', onCode: (code: string) => void): Promise<string> {
 if (!response.body) throw new Error('스트리밍 응답이 없습니다.');
 let code = '', complete = false;
 await readSSE<ProviderEvent>(response.body, event => {
   if (event.error) throw new Error(`API error: ${event.error.status ?? ''} ${event.error.message ?? 'Unknown error'}`);
   let text = '';
   if (provider === 'anthropic') {
     if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') text = event.delta.text ?? '';
     if (event.type === 'message_stop') complete = true;
   } else {
     const candidate = event.candidates?.[0];
     if (candidate?.finishReason === 'MAX_TOKENS') throw new Error('생성된 코드가 너무 길어 잘렸습니다. 더 간단한 컴포넌트를 요청해주세요.');
     if (candidate?.finishReason && candidate.finishReason !== 'STOP') throw new Error('코드 생성이 중단되었습니다. 다시 시도해주세요.');
     if (candidate?.finishReason === 'STOP') complete = true;
     text = candidate?.content?.parts?.filter(p => !p.thought).map(p => p.text ?? '').join('') ?? '';
   }
   if (text) { code += text; onCode(code); }
 });
 if (!complete || !code.trim()) throw new Error('코드 생성 중 연결이 끊어졌거나 응답이 비어 있습니다. 다시 시도해주세요.');
 return code;
}
