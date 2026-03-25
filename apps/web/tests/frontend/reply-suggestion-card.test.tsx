import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastProvider } from '@/components/ui/Toast';
import { ReplySuggestionCard } from '@/components/translator/ReplySuggestionCard';

vi.mock('@/lib/frontend/practice-client', () => ({
  savePractice: vi.fn().mockResolvedValue(undefined),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('ReplySuggestionCard', () => {
  it('渲染建议文本', () => {
    render(
      <ReplySuggestionCard label="A" content="这是回复A" strategy="提供确定感" originalText="原文" />,
      { wrapper }
    );
    expect(screen.getByText('这是回复A')).toBeInTheDocument();
  });

  it('渲染 strategy 标签', () => {
    render(
      <ReplySuggestionCard label="A" content="这是回复A" strategy="提供确定感" originalText="原文" />,
      { wrapper }
    );
    expect(screen.getByText('提供确定感')).toBeInTheDocument();
  });

  it('渲染卡片标签 A', () => {
    render(
      <ReplySuggestionCard label="A" content="回复" strategy="提供确定感" originalText="原文" />,
      { wrapper }
    );
    expect(screen.getByText(/方案\s*A|A/)).toBeInTheDocument();
  });

  it('复制按钮写入剪贴板', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <ReplySuggestionCard label="A" content="复制我" strategy="提供确定感" originalText="原文" />,
      { wrapper }
    );
    fireEvent.click(screen.getByRole('button', { name: /复制/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('复制我'));
  });

  it('保存按钮调用 savePractice 传入当前卡片文本', async () => {
    const { savePractice } = await import('@/lib/frontend/practice-client');
    render(
      <ReplySuggestionCard label="B" content="这是回复B" strategy="温和但坚定" originalText="原始输入" />,
      { wrapper }
    );
    fireEvent.click(screen.getByRole('button', { name: /保存/ }));
    await waitFor(() =>
      expect(savePractice).toHaveBeenCalledWith({
        primaryReply: '这是回复B',
        originalText: '原始输入',
      })
    );
  });
});
