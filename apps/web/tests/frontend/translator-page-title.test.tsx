import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock store
vi.mock('@/store/translator-store', () => ({
  useTranslatorStore: vi.fn(),
}));

// Mock Toast
vi.mock('@/components/ui/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToast: () => ({ showToast: vi.fn() }),
}));

import { useTranslatorStore } from '@/store/translator-store';
import TranslatorPage from '@/app/(main)/translator/page';

const mockStore = useTranslatorStore as unknown as ReturnType<typeof vi.fn>;

const defaultStore = {
  status: 'idle' as const,
  inputText: '',
  result: null,
  error: null,
  setInput: vi.fn(),
  decode: vi.fn(),
  clearResult: vi.fn(),
};

describe('TranslatorPage Title Area', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue(defaultStore);
  });

  it('渲染金色 AI 大字号文字', () => {
    render(<TranslatorPage />);
    const aiText = screen.getByText('AI');
    expect(aiText).toBeInTheDocument();
    expect(aiText).toHaveClass('text-[#BCA564]', 'text-6xl', 'font-black');
  });

  it('渲染横线装饰在 AI 文字下方', () => {
    render(<TranslatorPage />);
    const aiText = screen.getByText('AI');
    const aiParent = aiText.parentElement;
    expect(aiParent).toBeInTheDocument();

    // 检查横线装饰元素存在（通过查找 div 子元素）
    const lineDecoration = aiParent?.querySelector('div');
    expect(lineDecoration).toBeInTheDocument();
  });

  it('渲染竖线分隔符', () => {
    render(<TranslatorPage />);
    const aiText = screen.getByText('AI');
    const titleContainer = aiText.closest('div')?.parentElement;
    expect(titleContainer).toBeInTheDocument();

    // 竖线分隔符是 titleContainer 的第二个子元素
    const children = titleContainer?.children;
    expect(children?.length).toBeGreaterThanOrEqual(3);

    // 第二个子元素应该是竖线（一个只有样式的 div）
    const verticalLine = children?.[1];
    expect(verticalLine).toBeInTheDocument();
    expect(verticalLine?.tagName.toLowerCase()).toBe('div');
  });

  it('渲染 "读心翻译器" 标题', () => {
    render(<TranslatorPage />);
    const title = screen.getByText('读心翻译器');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-3xl');
  });

  it('渲染副标题 "Empathic Insight Engine"', () => {
    render(<TranslatorPage />);
    const subtitle = screen.getByText('Empathic Insight Engine');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass('text-xs', 'font-serif', 'italic');
  });

  it('副标题包含呼吸灯绿点', () => {
    render(<TranslatorPage />);
    const subtitle = screen.getByText('Empathic Insight Engine');
    const parent = subtitle.parentElement;

    // 检查父元素中是否有呼吸灯动画元素
    const pulseDot = parent?.querySelector('.animate-ping, .animate-pulse');
    expect(pulseDot).toBeInTheDocument();
  });

  it('标题区整体使用正确的布局结构', () => {
    render(<TranslatorPage />);

    // AI 文字应该在
    expect(screen.getByText('AI')).toBeInTheDocument();

    // 读心翻译器标题应该在
    expect(screen.getByText('读心翻译器')).toBeInTheDocument();

    // 检查它们在同一区域内
    const aiElement = screen.getByText('AI');
    const titleElement = screen.getByText('读心翻译器');

    // 它们应该有共同的父容器
    const aiParent = aiElement.closest('div');
    const titleParent = titleElement.closest('div');

    // 两个元素应该在标题区域内
    expect(aiParent?.parentElement).toBeTruthy();
    expect(titleParent?.parentElement).toBeTruthy();
  });
});
