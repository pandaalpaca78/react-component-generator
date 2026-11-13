import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ComponentCard } from './ComponentCard';
vi.mock('./LivePreview', () => ({LivePreview: () => <div>Rendered preview</div>}));
it('shows code during generation and preview only after success', () => {
  const component = {id:'1', prompt:'button', code:'partial code', createdAt:new Date(), status:'streaming' as const};
  const props = {onRemove:vi.fn(), onRegenerate:vi.fn(), isLoading:true};
  const {rerender} = render(<ComponentCard {...props} component={component} />);
  expect(screen.getByText('partial code')).toBeInTheDocument();
  expect(screen.queryByText('Rendered preview')).not.toBeInTheDocument();
  rerender(<ComponentCard {...props} component={{...component, status:'complete'}} />);
  expect(screen.getByText('Rendered preview')).toBeInTheDocument();
});
