import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
    line: (props: React.SVGProps<SVGLineElement>) => <line {...props} />,
  },
}));

vi.mock('@/store/relation-store', () => ({
  useRelationStore: vi.fn(),
}));

import { useRelationStore } from '@/store/relation-store';
import RelationsPage from '@/app/(main)/relations/page';
import { RelationDetail } from '@/components/relations/RelationDetail';
import { RelationNodeCard } from '@/components/relations/RelationNode';

const mockStore = useRelationStore as unknown as ReturnType<typeof vi.fn>;

describe('Relations experience accessibility', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue({
      nodes: [
        {
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
        },
      ],
      isLoading: false,
      error: null,
      loadNodes: vi.fn(),
      selectNode: vi.fn(),
      selectedNodeId: null,
    });
  });

  it('关系页的返回和新增按钮都有可读名称', () => {
    render(<RelationsPage />);

    expect(screen.getByRole('button', { name: '返回上一页' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '添加关系' })).toBeInTheDocument();
  });

  it('详情卡关闭按钮具有可读名称', () => {
    render(
      <RelationDetail
        node={{
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
        }}
        onStartChat={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: '关闭详情' })).toBeInTheDocument();
  });

  it('关系节点保留 group 类以启用 hover 光晕', () => {
    render(
      <RelationNodeCard
        node={{
          id: 'relation-1',
          userId: 'user-1',
          name: '我的老板',
          tags: ['职场'],
          relationshipType: '老板',
          对方特点: null,
          期望结果: null,
          情境补充: null,
          generatedContext: null,
          position: 0,
          createdAt: '2026-03-27T00:00:00Z',
          updatedAt: '2026-03-27T00:00:00Z',
        }}
        index={0}
        onClick={vi.fn()}
        isSelected={false}
      />
    );

    expect(screen.getByRole('button', { name: /我的老板/ })).toHaveClass('group');
  });

  it('关系节点对长名称暴露完整可访问名称', () => {
    render(
      <RelationNodeCard
        node={{
          id: 'relation-2',
          userId: 'user-1',
          name: '特别重要的老板',
          tags: ['职场'],
          relationshipType: '老板',
          对方特点: null,
          期望结果: null,
          情境补充: null,
          generatedContext: null,
          position: 1,
          createdAt: '2026-03-27T00:00:00Z',
          updatedAt: '2026-03-27T00:00:00Z',
        }}
        index={1}
        onClick={vi.fn()}
        isSelected={false}
      />
    );

    expect(screen.getByRole('button', { name: '特别重要的老板' })).toBeInTheDocument();
  });

  it('详情卡在重复标签时不会触发 React 重复 key 警告', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RelationDetail
        node={{
          id: 'relation-1',
          userId: 'user-1',
          name: '我的老板',
          tags: ['职场', '职场'],
          relationshipType: '老板',
          对方特点: '经常否定我',
          期望结果: '减少冲突',
          情境补充: null,
          generatedContext: null,
          position: 0,
          createdAt: '2026-03-27T00:00:00Z',
          updatedAt: '2026-03-27T00:00:00Z',
        }}
        onStartChat={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(
      consoleErrorSpy.mock.calls.some(([message]) =>
        String(message).includes('Encountered two children with the same key')
      )
    ).toBe(false);

    consoleErrorSpy.mockRestore();
  });
});
