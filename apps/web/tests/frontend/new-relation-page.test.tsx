import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  },
}));

vi.mock('@/store/relation-store', () => ({
  useRelationStore: vi.fn(),
}));

import { useRelationStore } from '@/store/relation-store';
import NewRelationPage from '@/app/(main)/relations/new/page';

const mockStore = useRelationStore as unknown as ReturnType<typeof vi.fn>;

describe('NewRelationPage form semantics', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue({
      addNode: vi.fn(),
      isLoading: false,
      error: null,
    });
  });

  it('关系名称和主要文本域都能通过标签访问', () => {
    render(<NewRelationPage />);

    expect(screen.getByLabelText(/^关系名称/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^对方特点$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^期望结果$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^情境补充（可选）$/)).toBeInTheDocument();
  });

  it('主输入字段带有稳定的 name 属性', () => {
    render(<NewRelationPage />);

    expect(screen.getByLabelText(/^关系名称/)).toHaveAttribute('name', 'name');
    expect(screen.getByLabelText(/^对方特点$/)).toHaveAttribute('name', 'traits');
    expect(screen.getByLabelText(/^期望结果$/)).toHaveAttribute('name', 'goal');
    expect(screen.getByLabelText(/^情境补充（可选）$/)).toHaveAttribute('name', 'context');
  });
});
