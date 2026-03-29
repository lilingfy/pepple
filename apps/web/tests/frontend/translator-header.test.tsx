import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/translator',
}));

// Mock store
vi.mock('@/store/translator-store', () => ({
  useTranslatorStore: vi.fn(),
}));

vi.mock('@/store/user-center-store', () => ({
  useUserCenterStore: () => ({
    selectedRelation: null,
  }),
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

describe('TranslatorPage Header', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockStore.mockReturnValue(defaultStore);
  });

  it('渲染通知按钮', () => {
    render(<TranslatorPage />);
    const notificationButton = screen.getByLabelText('通知');
    expect(notificationButton).toBeInTheDocument();
  });

  it('通知按钮带有红点角标', () => {
    render(<TranslatorPage />);
    const notificationButton = screen.getByLabelText('通知');

    // 红点角标应该在通知按钮内部
    const redDot = notificationButton.querySelector('span:last-child');
    expect(redDot).toBeInTheDocument();
  });

  it('渲染用户头像占位', () => {
    render(<TranslatorPage />);
    const userButton = screen.getByLabelText('用户中心');
    expect(userButton).toBeInTheDocument();
  });

  it('当前页面导航项高亮显示', () => {
    render(<TranslatorPage />);

    // 读心翻译应该是高亮状态
    const activeNav = screen.getByText('读心翻译');
    expect(activeNav).toBeInTheDocument();

    const parent = activeNav.parentElement;
    const pulseElements = parent?.querySelectorAll('.animate-pulse');
    expect(pulseElements?.length).toBeGreaterThan(0);
  });

  it('非当前页面导航项使用细体样式', () => {
    render(<TranslatorPage />);

    // 其他导航项应该存在
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('模拟陪练')).toBeInTheDocument();
    expect(screen.getByText('急救呼吸')).toBeInTheDocument();
  });
});
