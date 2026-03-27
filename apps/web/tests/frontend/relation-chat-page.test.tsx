import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'relation-1' }),
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
  },
}));

vi.mock('@/store/relation-store', () => ({
  useRelationStore: () => ({
    nodes: [
      {
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
      },
    ],
    loadNodes: vi.fn(),
  }),
}));

vi.mock('@/lib/frontend/relation-client', () => ({
  sendChatMessage: vi.fn(),
}));

import RelationChatPage from '@/app/(main)/relations/[id]/chat/page';

describe('RelationChatPage accessibility', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('消息输入框可以通过显式标签访问', () => {
    render(<RelationChatPage />);

    expect(screen.getByLabelText('消息输入')).toBeInTheDocument();
  });
});
