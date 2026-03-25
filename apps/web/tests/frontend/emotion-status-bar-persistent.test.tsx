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

const mockResult = {
  surfaceMeaning: '表面语义内容',
  subtext: '潜台词内容',
  emotionStatus: '检测到轻微焦虑',
  emotionScore: 45,
  replySuggestions: {
    A: '回复A', B: '回复B', C: '回复C',
    strategy: { A: '提供确定感', B: '温和但坚定', C: '极简终结' },
  },
};

describe('EmotionStatusBar Persistent', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue(defaultStore);
  });

  it('idle 态显示默认情绪状态条', () => {
    render(<TranslatorPage />);
    expect(screen.getByText('情绪检测：平稳观察中')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('analyzing 态保持显示情绪状态条', () => {
    mockStore.mockReturnValue({ ...defaultStore, status: 'analyzing' });
    render(<TranslatorPage />);
    expect(screen.getByText('情绪检测：平稳观察中')).toBeInTheDocument();
  });

  it('result 态显示真实情绪数据', () => {
    mockStore.mockReturnValue({ ...defaultStore, status: 'result', result: mockResult });
    render(<TranslatorPage />);
    expect(screen.getByText('检测到轻微焦虑')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('error 态保持显示情绪状态条', () => {
    mockStore.mockReturnValue({ ...defaultStore, status: 'error', error: '请求失败' });
    render(<TranslatorPage />);
    expect(screen.getByText('情绪检测：平稳观察中')).toBeInTheDocument();
  });

  it('默认状态显示辅助文本', () => {
    render(<TranslatorPage />);
    expect(screen.getByText(/频率正常，适合进行理性解码/)).toBeInTheDocument();
  });

  it('显示心率图标', () => {
    render(<TranslatorPage />);
    const heartIcon = document.querySelector('.material-symbols-outlined');
    expect(heartIcon).toBeInTheDocument();
  });
});
