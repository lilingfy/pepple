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

const mockRelation = {
  id: 'relation-1',
  name: '测试关系',
  userId: 'user-1',
  tags: [],
  relationshipType: null,
  对方特点: null,
  期望结果: null,
  情境补充: null,
  generatedContext: null,
  position: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

vi.mock('@/store/user-center-store', () => ({
  useUserCenterStore: () => ({ selectedRelation: mockRelation }),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock Toast
const showToastMock = vi.fn();
vi.mock('@/components/ui/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToast: () => ({ showToast: showToastMock }),
}));

const savePracticeMock = vi.fn().mockResolvedValue({ id: 'practice-123' });
vi.mock('@/lib/frontend/practice-client', () => ({
  savePractice: (...args: unknown[]) => savePracticeMock(...args),
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

describe('Translator Save Practice', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    savePracticeMock.mockResolvedValue({ id: 'practice-123' });
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

  it('savePractice 收到完整 payload 包含关系元数据', async () => {
    render(<TranslatorPage />);

    // 选择方案 B
    fireEvent.click(screen.getByTestId('reply-suggestion-B'));

    // 点击存入练习本
    const saveButton = screen.getByText('存入练习本');
    fireEvent.click(saveButton);

    await waitFor(() => expect(savePracticeMock).toHaveBeenCalledTimes(1));

    const payload = savePracticeMock.mock.calls[0][0];
    expect(payload.sourceType).toBe('decode');
    expect(payload.primaryReply).toBe('回复B');
    expect(payload.content.originalText).toBe('测试输入');
    expect(payload.content.surfaceMeaning).toBe('表面语义内容');
    expect(payload.content.analysis).toEqual({
      attackType: 'general',
      scenario: 'decode',
      subtext: '潜台词内容',
      emotionScore: 30,
      neutralityScore: 70,
      emotionStatus: '平稳',
    });
    expect(payload.content.replyOptions).toHaveLength(3);
    expect(payload.content.replyOptions[0]).toMatchObject({
      id: 'A',
      label: '提供确定感',
      content: '回复A',
      tone: 'neutral',
    });
    expect(payload.content.selectedReplyId).toBe('B');
    expect(payload.content.relationId).toBe('relation-1');
    expect(payload.content.relationName).toBe('测试关系');
  });

  it('保存成功后显示查看链接', async () => {
    render(<TranslatorPage />);

    // 选择方案 A
    fireEvent.click(screen.getByTestId('reply-suggestion-A'));

    // 点击存入练习本
    const saveButton = screen.getByText('存入练习本');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('查看')).toBeInTheDocument();
    });

    const viewLink = screen.getByText('查看').closest('a');
    expect(viewLink).toHaveAttribute('href', '/me/practice?entry=practice-123');
  });

  it('保存失败时显示错误提示且不出现查看链接', async () => {
    savePracticeMock.mockRejectedValue(new Error('save failed'));

    render(<TranslatorPage />);

    // 选择方案 A
    fireEvent.click(screen.getByTestId('reply-suggestion-A'));

    // 点击存入练习本
    const saveButton = screen.getByText('存入练习本');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('保存失败，请稍后重试', 'error');
    });

    expect(screen.queryByText('查看')).not.toBeInTheDocument();
  });
});
