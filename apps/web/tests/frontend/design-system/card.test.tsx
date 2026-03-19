import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Card, GlassCard } from '@/components/ui/Card';

describe('Card', () => {
  it('renders icon, title, and content', () => {
    render(
      <Card icon="info" title="信息卡片">
        <p>卡片内容</p>
      </Card>
    );

    expect(screen.getByText('信息卡片')).toBeInTheDocument();
    expect(screen.getByText('卡片内容')).toBeInTheDocument();
  });

  it('supports clickable glass card shell', () => {
    const handleClick = vi.fn();

    render(
      <GlassCard title="点击卡片" onClick={handleClick}>
        <span>说明</span>
      </GlassCard>
    );

    const card = screen.getByRole('button', { name: /点击卡片/ });
    expect(card).toHaveClass('pebble-glass');
  });
});
