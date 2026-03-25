import { describe, it, expect, vi, beforeEach } from 'vitest';
import { savePractice } from '@/lib/frontend/practice-client';

class PracticeError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message); this.name = 'PracticeError';
  }
}

describe('practice-client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('成功时 resolve', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '123' }),
    }));

    await expect(
      savePractice({ primaryReply: '回复A', originalText: '原始文本' })
    ).resolves.not.toThrow();
  });

  it('失败时抛出可识别错误', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    await expect(
      savePractice({ primaryReply: '回复A', originalText: '原始文本' })
    ).rejects.toThrow();
  });

  it('网络失败时抛出错误', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(
      savePractice({ primaryReply: '回复A', originalText: '原始文本' })
    ).rejects.toThrow();
  });
});
