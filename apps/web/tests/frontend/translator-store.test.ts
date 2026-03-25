import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTranslatorStore } from '@/store/translator-store';

vi.mock('@/lib/frontend/decode-client', () => ({
  decode: vi.fn(),
}));

import { decode } from '@/lib/frontend/decode-client';
const mockDecode = decode as ReturnType<typeof vi.fn>;

const mockResult = {
  surfaceMeaning: '表面语义',
  subtext: '潜台词',
  emotionStatus: '平稳',
  emotionScore: 30,
  replySuggestions: {
    A: '回复A', B: '回复B', C: '回复C',
    strategy: { A: '提供确定感', B: '温和但坚定', C: '极简终结' },
  },
};

describe('useTranslatorStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset store state between tests
    const store = useTranslatorStore.getState();
    store.clearResult();
    useTranslatorStore.setState({ inputText: '', status: 'idle', result: null, error: null });
  });

  it('初始状态为 idle', () => {
    const { result } = renderHook(() => useTranslatorStore());
    expect(result.current.status).toBe('idle');
    expect(result.current.inputText).toBe('');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('setInput 更新 inputText', () => {
    const { result } = renderHook(() => useTranslatorStore());
    act(() => { result.current.setInput('测试文本'); });
    expect(result.current.inputText).toBe('测试文本');
  });

  it('decode 成功：idle → analyzing → result', async () => {
    mockDecode.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useTranslatorStore());
    act(() => { result.current.setInput('测试文本'); });

    await act(async () => { await result.current.decode(); });

    expect(result.current.status).toBe('result');
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it('decode 失败：进入 error 态，error 有值', async () => {
    mockDecode.mockRejectedValue(new Error('网络错误'));
    const { result } = renderHook(() => useTranslatorStore());
    act(() => { result.current.setInput('测试文本'); });

    await act(async () => { await result.current.decode(); });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeTruthy();
    expect(result.current.result).toBeNull();
  });

  it('clearResult 重置为 idle', async () => {
    mockDecode.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useTranslatorStore());
    act(() => { result.current.setInput('测试文本'); });
    await act(async () => { await result.current.decode(); });
    expect(result.current.status).toBe('result');

    act(() => { result.current.clearResult(); });
    expect(result.current.status).toBe('idle');
    expect(result.current.result).toBeNull();
  });

  it('analyzing 状态下不能重复发起 decode', async () => {
    let resolve: (v: unknown) => void;
    mockDecode.mockImplementation(() => new Promise(r => { resolve = r; }));

    const { result } = renderHook(() => useTranslatorStore());
    act(() => { result.current.setInput('文本'); });

    // Start first decode
    act(() => { result.current.decode(); });
    expect(result.current.status).toBe('analyzing');

    // Second decode should be no-op
    act(() => { result.current.decode(); });
    expect(mockDecode).toHaveBeenCalledTimes(1);

    resolve!(mockResult);
  });
});
