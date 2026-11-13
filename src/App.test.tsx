import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

vi.mock('./components/LivePreview', () => ({ LivePreview: () => <div>preview</div> }));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
    ok: true,
    json: async () => url === '/api/config'
      ? { envKeys: { google: true, anthropic: true } }
      : { code: 'render(<div>Saved</div>)' },
  })));
});
afterEach(() => vi.unstubAllGlobals());

it('입력한 API 키를 리마운트 후 복원한다', () => {
  const first = render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'my-key' } });
  first.unmount();
  render(<App />);
  expect(screen.getByLabelText('API 키')).toHaveValue('my-key');
});

it('선택한 provider를 복원하고 전환 시 키 초기화를 저장한다', () => {
  const first = render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'google-key' } });
  fireEvent.change(screen.getByLabelText('AI 프로바이더'), { target: { value: 'anthropic' } });
  first.unmount();
  render(<App />);
  expect(screen.getByLabelText('AI 프로바이더')).toHaveValue('anthropic');
  expect(screen.getByLabelText('API 키')).toHaveValue('');
});

it('제출한 프롬프트 히스토리를 복원하고 다시 입력할 수 있다', async () => {
  const first = render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'key' } });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '프로필 카드' } });
  fireEvent.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '프로필 카드' })).toBeInTheDocument());
  first.unmount();
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: '프로필 카드' }));
  expect(screen.getByRole('textbox')).toHaveValue('프로필 카드');
});

it('생성 결과와 날짜를 복원하고 전체 삭제도 유지한다', async () => {
  const first = render(<App />);
  fireEvent.change(screen.getByLabelText('API 키'), { target: { value: 'key' } });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '저장할 카드' } });
  fireEvent.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '전체 삭제' })).toBeInTheDocument());
  first.unmount();
  const second = render(<App />);
  expect(screen.getByRole('button', { name: '전체 삭제' })).toBeInTheDocument();
  expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '전체 삭제' }));
  second.unmount();
  render(<App />);
  expect(screen.queryByRole('button', { name: '전체 삭제' })).not.toBeInTheDocument();
});
