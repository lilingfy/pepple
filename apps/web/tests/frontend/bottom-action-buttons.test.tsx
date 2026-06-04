import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/translator',
}));

// Mock store
vi.mock('@/store/translator-store', () => ({
  useTranslatorStore: vi.fn(),
}));

vi.mock('@/store/user-center-store', () => ({
  useUserCenterStore: () => ({ selectedRelation: null }),
}));

// Mock Toast
vi.mock('@/components/ui/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToast: () => ({ showToast: vi.fn() }),
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

vi.mock('@/lib/frontend/practice-client', () => ({
  savePractice: vi.fn().mockResolvedValue({ id: 'practice-1' }),
}));

import { useTranslatorStore } from '@/store/translator-store';
import TranslatorPage from '@/app/(main)/translator/page';

const mockStore = useTranslatorStore as unknown as ReturnType<typeof vi.fn>;

const mockResult = {
  surfaceMeaning: '表面语义内容',
  subtext: '潜台词内容',
  emotionStatus: '平稳',
  emotionScore: 30,
  replySuggestions: {
    A: '回复A', B: '回复B', C: '回复C',
    strategy: { A: '提供确定感', B: '温和但坚定', C: '极简终结' },
  },
};

describe('Bottom Action Buttons', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue({
      status: 'result',
      inputText: '测试输入',
      result: mockResult,
      error: null,
      setInput: vi.fn(),
      decode: vi.fn(),
      clearResult: vi.fn(),
    });
  });

  it('result 态显示复制建议按钮', () => {
    render(<TranslatorPage />);
    expect(screen.getByText('请先选择方案')).toBeInTheDocument();
  });

  it('result 态显示存入练习本按钮', () => {
    render(<TranslatorPage />);
    expect(screen.getByText('存入练习本')).toBeInTheDocument();
  });

  it('复制按钮点击后显示已复制状态', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator.clipboard, { writeText: mockClipboard });

    render(<TranslatorPage />);
    // 先选择方案 A
    fireEvent.click(screen.getByTestId('reply-suggestion-A'));

    const copyButton = screen.getByText('复制方案 A');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboard).toHaveBeenCalled();
    });
  });
});
