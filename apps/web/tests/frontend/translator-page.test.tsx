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

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock Toast
vi.mock('@/components/ui/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('@/lib/frontend/practice-client', () => ({
  savePractice: vi.fn().mockResolvedValue({ id: 'practice-1' }),
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
  emotionStatus: '平稳',
  emotionScore: 30,
  replySuggestions: {
    A: '回复A', B: '回复B', C: '回复C',
    strategy: { A: '提供确定感', B: '温和但坚定', C: '极简终结' },
  },
};

describe('TranslatorPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue(defaultStore);
    (mockStore as unknown as { getState: () => typeof defaultStore }).getState = () => defaultStore;
  });

  it('idle 态渲染输入区', () => {
    render(<TranslatorPage />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('idle 态不显示结果区', () => {
    render(<TranslatorPage />);
    expect(screen.queryByText('表面语义内容')).not.toBeInTheDocument();
  });

  it('result 态显示分析结果', () => {
    mockStore.mockReturnValue({ ...defaultStore, status: 'result', result: mockResult });
    render(<TranslatorPage />);
    expect(screen.getByText('表面语义内容')).toBeInTheDocument();
    expect(screen.getByText('潜台词内容')).toBeInTheDocument();
  });

  it('result 态显示回复建议', () => {
    mockStore.mockReturnValue({ ...defaultStore, status: 'result', result: mockResult });
    render(<TranslatorPage />);
    expect(screen.getByText('回复A')).toBeInTheDocument();
    expect(screen.getByText('回复B')).toBeInTheDocument();
    expect(screen.getByText('回复C')).toBeInTheDocument();
  });

  it('error 态显示错误提示', () => {
    mockStore.mockReturnValue({ ...defaultStore, status: 'error', error: '请求失败' });
    render(<TranslatorPage />);
    expect(screen.getByText('请求失败')).toBeInTheDocument();
  });

  it('analyzing 态显示解码中按钮', () => {
    mockStore.mockReturnValue({ ...defaultStore, status: 'analyzing' });
    render(<TranslatorPage />);
    expect(screen.getByText(/解码中/)).toBeInTheDocument();
  });

  it('页面包含 main 元素', () => {
    render(<TranslatorPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
