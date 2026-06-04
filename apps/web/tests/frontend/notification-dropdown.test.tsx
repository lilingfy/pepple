import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import { OFFICIAL_NOTIFICATIONS } from '@/lib/notifications';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('NotificationDropdown', () => {
  it('renders trigger button with aria-label="通知"', () => {
    render(<NotificationDropdown />);
    const trigger = screen.getByRole('button', { name: '通知' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('clicking trigger opens dropdown with aria-label="通知列表"', () => {
    render(<NotificationDropdown />);
    const trigger = screen.getByRole('button', { name: '通知' });

    fireEvent.click(trigger);

    const dropdown = screen.getByRole('menu', { name: '通知列表' });
    expect(dropdown).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('dropdown shows static official messages', () => {
    render(<NotificationDropdown />);
    const trigger = screen.getByRole('button', { name: '通知' });
    fireEvent.click(trigger);

    // Verify each notification title is rendered
    OFFICIAL_NOTIFICATIONS.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });

    // Verify notification count in header
    const unreadCount = OFFICIAL_NOTIFICATIONS.filter((i) => !i.read).length;
    expect(screen.getByText(`${unreadCount} 条未读`)).toBeInTheDocument();
  });

  it('Escape key closes the dropdown', () => {
    render(<NotificationDropdown />);
    const trigger = screen.getByRole('button', { name: '通知' });

    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: '通知列表' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu', { name: '通知列表' })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking outside closes the dropdown', () => {
    render(
      <div>
        <NotificationDropdown />
        <button data-testid="outside">Outside</button>
      </div>
    );
    const trigger = screen.getByRole('button', { name: '通知' });

    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: '通知列表' })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(screen.queryByRole('menu', { name: '通知列表' })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
