import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider } from '@/components/ui/Toast';
import { ReplySuggestions } from '@/components/translator/ReplySuggestions';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

const mockSuggestions = {
  A: '回复A内容',
  B: '回复B内容',
  C: '回复C内容',
  strategy: { A: '提供确定感', B: '温和但坚定', C: '极简终结' },
};

describe('ReplySuggestions', () => {
  it('A→B→C 顺序渲染三张卡片', () => {
    render(<ReplySuggestions suggestions={mockSuggestions} originalText="原文" />, { wrapper });
    const cards = screen.getAllByText(/方案\s*[ABC]/);
    expect(cards[0].textContent).toMatch(/A/);
    expect(cards[1].textContent).toMatch(/B/);
    expect(cards[2].textContent).toMatch(/C/);
  });

  it('每张卡片渲染对应的 strategy 标签', () => {
    render(<ReplySuggestions suggestions={mockSuggestions} originalText="原文" />, { wrapper });
    expect(screen.getByText('提供确定感')).toBeInTheDocument();
    expect(screen.getByText('温和但坚定')).toBeInTheDocument();
    expect(screen.getByText('极简终结')).toBeInTheDocument();
  });
});
