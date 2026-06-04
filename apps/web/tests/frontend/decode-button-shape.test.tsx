import { render, screen, fireEvent } from '@testing-library/react';
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
  inputText: '测试文本',
  result: null,
  error: null,
  setInput: vi.fn(),
  decode: vi.fn(),
  clearResult: vi.fn(),
};

describe('DecodeButton Shape and Effects', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue(defaultStore);
  });

  it('渲染解码按钮', () => {
    render(<TranslatorPage />);
    const button = screen.getByLabelText('解码');
    expect(button).toBeInTheDocument();
  });

  it('解码按钮具有正确的尺寸', () => {
    render(<TranslatorPage />);
    const button = screen.getByLabelText('解码');
    expect(button).toBeInTheDocument();
    // 按钮应该具有响应式尺寸类
    expect(button.className).toContain('w-32');
    expect(button.className).toContain('h-32');
  });

  it('解码按钮具有异形圆角样式', () => {
    render(<TranslatorPage />);
    const button = screen.getByLabelText('解码');
    expect(button.className).toContain('rounded-[');
  });

  it('解码按钮具有装饰点', () => {
    render(<TranslatorPage />);
    const button = screen.getByLabelText('解码');

    // 装饰点应该是按钮的子元素 (span 元素)
    const children = button.querySelectorAll('span');
    expect(children.length).toBeGreaterThanOrEqual(2);
  });

  it('解码按钮包含黄色光晕图标', () => {
    render(<TranslatorPage />);
    const button = screen.getByLabelText('解码');
    const icon = button.querySelector('.material-symbols-outlined');
    expect(icon).toBeInTheDocument();
  });

  it('analyzing 态显示旋转动画', () => {
    mockStore.mockReturnValue({ ...defaultStore, status: 'analyzing' });
    render(<TranslatorPage />);
    const button = screen.getByLabelText('解码中');
    expect(button).toBeInTheDocument();
    expect(screen.getByText(/解码中/)).toBeInTheDocument();
  });

  it('禁用状态不可点击', () => {
    mockStore.mockReturnValue({ ...defaultStore, inputText: '' });
    render(<TranslatorPage />);
    const button = screen.getByLabelText('解码');
    expect(button).toBeDisabled();
  });
});
