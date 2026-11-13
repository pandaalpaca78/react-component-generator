export type Provider = 'anthropic' | 'google';

export interface GeneratedComponent {
  id: string;
  prompt: string;
  code: string;
  status?: 'streaming' | 'complete' | 'error';
  createdAt: Date;
}
