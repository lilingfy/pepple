import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PebbleInputShell } from '@/components/ui/PebbleInputShell';
import { StatusPill } from '@/components/ui/StatusPill';

describe('PebbleInputShell', () => {
  it('renders a label and content slot', () => {
    render(
      <PebbleInputShell label="输入消息">
        <textarea aria-label="输入消息" />
      </PebbleInputShell>
    );

    expect(screen.getByText('输入消息')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '输入消息' })).toBeInTheDocument();
  });
});

describe('StatusPill', () => {
  it('renders tone-specific status content', () => {
    render(<StatusPill tone="calm">平静</StatusPill>);

    const status = screen.getByText('平静');
    expect(status).toHaveClass('rounded-full');
    expect(status).toHaveAttribute('data-tone', 'calm');
  });
});
