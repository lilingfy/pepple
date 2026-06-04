import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReplySuggestionCard } from '@/components/translator/ReplySuggestionCard';
import { ToastProvider } from '@/components/ui/Toast';

describe('ReplySuggestionCard Hover Effects', () => {
  const mockProps = {
    content: '测试回复内容',
    strategy: '测试策略',
    originalText: '原始文本',
    isSelected: false,
    onSelect: () => {},
  };

  it('方案 A 具有 translate-x-2 位移', () => {
    render(
      <ToastProvider>
        <ReplySuggestionCard label="A" {...mockProps} />
      </ToastProvider>
    );

    const card = screen.getByText('测试回复内容').closest('div[class*="translate"]');
    expect(card).toBeInTheDocument();
  });

  it('方案 B 具有 translate-x-1 位移', () => {
    render(
      <ToastProvider>
        <ReplySuggestionCard label="B" {...mockProps} />
      </ToastProvider>
    );

    const card = screen.getByText('测试回复内容').closest('div[class*="translate"]');
    expect(card).toBeInTheDocument();
  });

  it('方案 C 具有 translate-x-2 位移', () => {
    render(
      <ToastProvider>
        <ReplySuggestionCard label="C" {...mockProps} />
      </ToastProvider>
    );

    const card = screen.getByText('测试回复内容').closest('div[class*="translate"]');
    expect(card).toBeInTheDocument();
  });

  it('所有卡片悬停时复位为 translate-x-0', () => {
    render(
      <ToastProvider>
        <ReplySuggestionCard label="A" {...mockProps} />
      </ToastProvider>
    );

    const card = screen.getByText('测试回复内容').closest('div[class*="hover:translate-x-0"]');
    expect(card).toBeInTheDocument();
  });

  it('方案 A 标签使用绿色背景', () => {
    render(
      <ToastProvider>
        <ReplySuggestionCard label="A" {...mockProps} />
      </ToastProvider>
    );

    const badge = screen.getByText('方案 A');
    expect(badge.className).toContain('bg-[#A8D8B9]/10');
  });

  it('方案 B 标签使用黄色背景带边框', () => {
    render(
      <ToastProvider>
        <ReplySuggestionCard label="B" {...mockProps} />
      </ToastProvider>
    );

    const badge = screen.getByText('方案 B');
    expect(badge.className).toContain('border');
  });

  it('方案 C 标签使用灰色背景', () => {
    render(
      <ToastProvider>
        <ReplySuggestionCard label="C" {...mockProps} />
      </ToastProvider>
    );

    const badge = screen.getByText('方案 C');
    expect(badge.className).toContain('bg-slate-100');
  });

  it('卡片使用异形圆角', () => {
    render(
      <ToastProvider>
        <ReplySuggestionCard label="A" {...mockProps} />
      </ToastProvider>
    );

    const card = screen.getByText('测试回复内容').closest('div[class*="rounded"]');
    expect(card).toBeInTheDocument();
  });
});
