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

describe('InputArea Styling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue(defaultStore);
  });

  it('输入区容器使用异形圆角样式', () => {
    render(<TranslatorPage />);
    const textarea = screen.getByRole('textbox');
    const container = textarea.closest('div[class*="rounded"]');
    expect(container).toBeInTheDocument();
  });

  it('输入区容器具有玻璃拟态背景', () => {
    render(<TranslatorPage />);
    const textarea = screen.getByRole('textbox');
    const container = textarea.closest('div[class*="bg-white"]');
    expect(container).toBeInTheDocument();
  });

  it('textarea 聚焦状态可用', () => {
    render(<TranslatorPage />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).not.toBeDisabled();
  });

  it('输入区标签显示正确', () => {
    render(<TranslatorPage />);
    expect(screen.getByText('收到信息')).toBeInTheDocument();
  });
});
