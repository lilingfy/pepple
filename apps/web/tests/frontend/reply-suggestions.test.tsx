import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider } from '@/components/ui/Toast';
import { ReplySuggestions } from '@/components/translator/ReplySuggestions';

vi.mock('@/lib/frontend/practice-client', () => ({
  savePractice: vi.fn().mockResolvedValue(undefined),
}));

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

  it('保存 B 卡片时 primaryReply 为 B 的内容', async () => {
    const { savePractice } = await import('@/lib/frontend/practice-client');
    render(<ReplySuggestions suggestions={mockSuggestions} originalText="原始输入" />, { wrapper });

    const saveButtons = screen.getAllByRole('button', { name: /存入练习本|保存/ });
    fireEvent.click(saveButtons[1]); // B 卡片

    await waitFor(() =>
      expect(savePractice).toHaveBeenCalledWith({
        primaryReply: '回复B内容',
        originalText: '原始输入',
      })
    );
  });

  it('savePractice 失败时展示 toast 不阻断页面', async () => {
    const { savePractice } = await import('@/lib/frontend/practice-client');
    (savePractice as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('网络错误'));

    render(<ReplySuggestions suggestions={mockSuggestions} originalText="原文" />, { wrapper });
    const saveButtons = screen.getAllByRole('button', { name: /存入练习本|保存/ });
    fireEvent.click(saveButtons[0]);

    await waitFor(() =>
      expect(screen.getByText(/保存失败/)).toBeInTheDocument()
    );
    // 三张卡片仍然存在
    expect(screen.getAllByText(/方案\s*[ABC]/)).toHaveLength(3);
  });
});
