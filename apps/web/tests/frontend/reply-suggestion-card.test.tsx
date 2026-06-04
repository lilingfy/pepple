import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider } from '@/components/ui/Toast';
import { ReplySuggestionCard } from '@/components/translator/ReplySuggestionCard';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('ReplySuggestionCard', () => {
  it('渲染建议文本', () => {
    render(
      <ReplySuggestionCard label="A" content="这是回复A" strategy="提供确定感" originalText="原文" isSelected={false} onSelect={() => {}} />,
      { wrapper }
    );
    expect(screen.getByText('这是回复A')).toBeInTheDocument();
  });

  it('渲染 strategy 标签', () => {
    render(
      <ReplySuggestionCard label="A" content="这是回复A" strategy="提供确定感" originalText="原文" isSelected={false} onSelect={() => {}} />,
      { wrapper }
    );
    expect(screen.getByText('提供确定感')).toBeInTheDocument();
  });

  it('渲染卡片标签 A', () => {
    render(
      <ReplySuggestionCard label="A" content="回复" strategy="提供确定感" originalText="原文" isSelected={false} onSelect={() => {}} />,
      { wrapper }
    );
    expect(screen.getByText(/方案\s*A|A/)).toBeInTheDocument();
  });
});
