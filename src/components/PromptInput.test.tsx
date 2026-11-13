import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  it('500자까지 입력하고 제출할 수 있다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '가'.repeat(500) } });
    expect(screen.getByText('500 / 500자')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    expect(onGenerate).toHaveBeenCalledWith('가'.repeat(500));
  });

  it('501자 붙여넣기 시 오류를 표시하고 생성 버튼을 비활성화한다', async () => {
    const user = userEvent.setup();
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.paste('가'.repeat(501));
    expect(input).toHaveValue('가'.repeat(501));
    expect(screen.getByText('501 / 500자')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('프롬프트는 500자 이하로 입력해주세요.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/프롬프트는 500자 이하로 입력해주세요/);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it.each([{ ctrlKey: true }, { metaKey: true }])('길이 초과 시 단축키 제출을 차단한다: %o', (modifier) => {
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '가'.repeat(501) } });
    fireEvent.keyDown(input, { key: 'Enter', ...modifier });
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('500자로 줄이면 오류가 사라지고 다시 생성할 수 있다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '가'.repeat(501) } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '가'.repeat(500) } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeEnabled();
  });
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });
});
