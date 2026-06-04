import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const clearSelectedRelation = vi.fn();
const loadSelectedRelation = vi.fn();
const { userCenterState } = vi.hoisted(() => ({
  userCenterState: { selectedRelation: null as any },
}));

vi.mock('@/app/(main)/login/actions', () => ({
  signOutAction: vi.fn(),
}));

vi.mock('@/store/user-center-store', () => ({
  useUserCenterStore: () => ({
    selectedRelation: userCenterState.selectedRelation,
    loadSelectedRelation,
    clearSelectedRelation,
  }),
}));

vi.mock('@/components/layout/AppHeader', () => ({
  AppHeader: ({ activeHref }: { activeHref?: string }) => (
    <header data-active-href={activeHref}>Header</header>
  ),
}));

vi.mock('@/components/ui/MaterialSymbol', () => ({
  MaterialSymbol: ({ icon, className }: { icon: string; className?: string }) => (
    <span className={className} data-icon={icon} />
  ),
}));

import MePage from '@/app/(main)/me/page';

describe('MePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userCenterState.selectedRelation = null;
  });

  it('renders account security logout section', () => {
    render(<MePage />);

    expect(screen.getByText('账户安全')).toBeInTheDocument();
    expect(
      screen.getByText('退出后，你需要重新登录才能访问个人中心和关系档案。'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /退出当前账户/ }),
    ).toBeInTheDocument();
  });

  it('clears selected relation before submitting logout', () => {
    render(<MePage />);

    const logoutButton = screen.getByRole('button', { name: /退出当前账户/ });
    fireEvent.submit(logoutButton.closest('form')!);

    expect(clearSelectedRelation).toHaveBeenCalledTimes(1);
  });

  it('does not crash when stale selected relation state is an API wrapper without a name', () => {
    userCenterState.selectedRelation = {
      success: true,
      data: {
        id: 'relation-1',
        name: '我的老板',
      },
    };

    expect(() => render(<MePage />)).not.toThrow();
    expect(screen.getByText('还没有选择关系对象')).toBeInTheDocument();
  });

  it('allows cancelling the current relation without deleting relation data', () => {
    userCenterState.selectedRelation = {
      id: 'relation-1',
      userId: 'user-1',
      name: '我的老板',
      tags: ['职场'],
      relationshipType: '老板',
      对方特点: '经常否定我',
      期望结果: '减少冲突',
      情境补充: null,
      generatedContext: null,
      position: 0,
      createdAt: '2026-03-27T00:00:00Z',
      updatedAt: '2026-03-27T00:00:00Z',
    };

    render(<MePage />);

    fireEvent.click(screen.getByRole('button', { name: '取消使用当前关系' }));

    expect(clearSelectedRelation).toHaveBeenCalledTimes(1);
  });

  it('renders the 练习本 entry point linking to /me/practice', () => {
    render(<MePage />);

    const practiceLink = screen.getByRole('link', { name: /练习本/ });
    expect(practiceLink).toBeInTheDocument();
    expect(practiceLink).toHaveAttribute('href', '/me/practice');
  });
});
