import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders the primary variant by default', () => {
    render(<Button>开始体验</Button>);

    const button = screen.getByRole('button', { name: '开始体验' });
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('rounded-full');
  });

  it('supports loading state and disables interaction', () => {
    render(<Button isLoading>处理中</Button>);

    const button = screen.getByRole('button', { name: /处理中/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('button-loading-indicator')).toBeInTheDocument();
  });

  it('supports secondary and ghost variants', () => {
    const { rerender } = render(<Button variant="secondary">次要</Button>);
    expect(screen.getByRole('button', { name: '次要' })).toHaveClass('pebble-glass');

    rerender(<Button variant="ghost">幽灵</Button>);
    expect(screen.getByRole('button', { name: '幽灵' })).toHaveClass('bg-transparent');
  });
});
