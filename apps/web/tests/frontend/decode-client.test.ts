import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { decode } from '@/lib/frontend/decode-client';
import { DecodeError } from '@/types/translator';

describe('decode-client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('成功时返回 DecodeResponse', async () => {
    const mockResponse = {
      surfaceMeaning: '表面语义',
      subtext: '潜台词',
      emotionStatus: '平稳',
      emotionScore: 30,
      replySuggestions: {
        A: '回复A', B: '回复B', C: '回复C',
        strategy: { A: '提供确定感', B: '温和但坚定', C: '极简终结' },
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const result = await decode({ text: '测试文本' });
    expect(result).toEqual(mockResponse);
  });

  it('HTTP 4xx/5xx 时抛出 DecodeError(HTTP_ERROR)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: '服务器错误' }),
    }));

    await expect(decode({ text: '测试' })).rejects.toThrow(DecodeError);
    await expect(decode({ text: '测试' })).rejects.toMatchObject({ code: 'HTTP_ERROR' });
  });

  it('网络错误时抛出 DecodeError(NETWORK_ERROR)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(decode({ text: '测试' })).rejects.toThrow(DecodeError);
    await expect(decode({ text: '测试' })).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('超时时抛出 DecodeError(TIMEOUT)', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new DOMException('The operation was aborted.', 'AbortError')), 20000);
      })
    ));

    const decodePromise = decode({ text: '测试' });
    vi.advanceTimersByTime(16000);
    await expect(decodePromise).rejects.toMatchObject({ code: 'TIMEOUT' });
    vi.useRealTimers();
  });

  it('会把 relationId 一起提交给 decode API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ surfaceMeaning: '', subtext: '', emotionStatus: '一般场景', emotionScore: 50, replySuggestions: { A: '', B: '', C: '', strategy: { A: '', B: '', C: '' } } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await decode({ text: '测试文本', relationId: '550e8400-e29b-41d4-a716-446655440000' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/decode',
      expect.objectContaining({
        body: JSON.stringify({
          text: '测试文本',
          relationId: '550e8400-e29b-41d4-a716-446655440000',
        }),
      })
    );
  });
});
