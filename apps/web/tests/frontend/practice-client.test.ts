import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  savePractice,
  listPracticeEntries,
  getPracticeEntry,
  updatePracticeEntry,
  deletePracticeEntry,
  PracticeError,
} from '@/lib/frontend/practice-client';
import type { PracticeEntry, PracticeListResponse } from '@pebble/types';

const mockEntry: PracticeEntry = {
  id: 'practice-1',
  sourceType: 'decode',
  primaryReply: '回复A',
  content: {
    originalText: '原始文本',
    surfaceMeaning: '表面意思',
    analysis: {
      attackType: 'general',
      scenario: 'decode',
      subtext: '潜台词',
      emotionScore: 72,
      neutralityScore: 28,
      emotionStatus: '高压',
    },
    replyOptions: [
      { id: 'A', label: 'A', content: '回复A', tone: 'neutral' },
    ],
    selectedReplyId: 'A',
  },
  isFavorite: false,
  isArchived: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockListResponse: PracticeListResponse = {
  entries: [mockEntry],
  total: 1,
  hasMore: false,
};

function mockFetchSuccess(data: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true, data }),
  }));
}

function mockFetchHttpError(status: number) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ success: false, error: { message: `HTTP ${status}` } }),
  }));
}

function mockFetchMalformedJson() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.reject(new SyntaxError('Unexpected token')),
  }));
}

function mockFetchApiError(message: string) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: false, error: { message } }),
  }));
}

function mockFetchNetworkError() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
}

describe('practice-client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('savePractice', () => {
    it('成功时返回创建的条目', async () => {
      mockFetchSuccess(mockEntry);

      const result = await savePractice({
        sourceType: 'decode',
        primaryReply: '回复A',
        content: {
          originalText: '原始文本',
          surfaceMeaning: '表面意思',
          analysis: {
            attackType: 'general',
            scenario: 'decode',
            subtext: '潜台词',
            emotionScore: 72,
            neutralityScore: 28,
            emotionStatus: '高压',
          },
          replyOptions: [
            { id: 'A', label: 'A', content: '回复A', tone: 'neutral' },
          ],
          selectedReplyId: 'A',
        },
      });

      expect(result).toEqual(mockEntry);
      expect(result.id).toBe('practice-1');
    });

    it('失败时抛出 PracticeError', async () => {
      mockFetchHttpError(500);

      await expect(
        savePractice({
          sourceType: 'decode',
          primaryReply: '回复A',
          content: {
            originalText: '原始文本',
            surfaceMeaning: '表面意思',
            analysis: {
              attackType: 'general',
              scenario: 'decode',
              subtext: '潜台词',
              emotionScore: 72,
              neutralityScore: 28,
              emotionStatus: '高压',
            },
            replyOptions: [
              { id: 'A', label: 'A', content: '回复A', tone: 'neutral' },
            ],
            selectedReplyId: 'A',
          },
        })
      ).rejects.toThrow(PracticeError);
    });

    it('网络失败时抛出 PracticeError', async () => {
      mockFetchNetworkError();

      await expect(
        savePractice({
          sourceType: 'decode',
          primaryReply: '回复A',
          content: {
            originalText: '原始文本',
            surfaceMeaning: '表面意思',
            analysis: {
              attackType: 'general',
              scenario: 'decode',
              subtext: '潜台词',
              emotionScore: 72,
              neutralityScore: 28,
              emotionStatus: '高压',
            },
            replyOptions: [
              { id: 'A', label: 'A', content: '回复A', tone: 'neutral' },
            ],
            selectedReplyId: 'A',
          },
        })
      ).rejects.toThrow(PracticeError);
    });

    it('API 返回 success:false 时抛出 PracticeError', async () => {
      mockFetchApiError('Bad request');

      await expect(
        savePractice({
          sourceType: 'decode',
          primaryReply: '回复A',
          content: {
            originalText: '原始文本',
            surfaceMeaning: '表面意思',
            analysis: {
              attackType: 'general',
              scenario: 'decode',
              subtext: '潜台词',
              emotionScore: 72,
              neutralityScore: 28,
              emotionStatus: '高压',
            },
            replyOptions: [
              { id: 'A', label: 'A', content: '回复A', tone: 'neutral' },
            ],
            selectedReplyId: 'A',
          },
        })
      ).rejects.toThrow('Bad request');
    });

    it('返回畸形 JSON 时抛出 HTTP_ERROR', async () => {
      mockFetchMalformedJson();

      await expect(
        savePractice({
          sourceType: 'decode',
          primaryReply: '回复A',
          content: {
            originalText: '原始文本',
            surfaceMeaning: '表面意思',
            analysis: {
              attackType: 'general',
              scenario: 'decode',
              subtext: '潜台词',
              emotionScore: 72,
              neutralityScore: 28,
              emotionStatus: '高压',
            },
            replyOptions: [
              { id: 'A', label: 'A', content: '回复A', tone: 'neutral' },
            ],
            selectedReplyId: 'A',
          },
        })
      ).rejects.toThrow(PracticeError);
    });
  });

  describe('listPracticeEntries', () => {
    it('无参数时调用 /api/practice', async () => {
      mockFetchSuccess(mockListResponse);

      const result = await listPracticeEntries();

      const calledUrl = (fetch as any).mock.calls[0][0];
      expect(calledUrl).toMatch(/^\/api\/practice(?:\?|$)/);
      expect(result).toEqual(mockListResponse);
    });

    it('携带过滤参数时拼接到 URL', async () => {
      mockFetchSuccess(mockListResponse);

      await listPracticeEntries({
        sourceType: 'decode',
        isFavorite: true,
        isArchived: false,
        limit: 10,
        cursor: 'cursor-123',
      });

      const calledUrl = (fetch as any).mock.calls[0][0];
      expect(calledUrl).toContain('sourceType=decode');
      expect(calledUrl).toContain('isFavorite=true');
      expect(calledUrl).toContain('isArchived=false');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('cursor=cursor-123');
    });

    it('失败时抛出 PracticeError', async () => {
      mockFetchHttpError(500);

      await expect(listPracticeEntries()).rejects.toThrow(PracticeError);
    });

    it('API 返回 success:false 时抛出 PracticeError', async () => {
      mockFetchApiError('列表获取失败');

      await expect(listPracticeEntries()).rejects.toThrow('列表获取失败');
    });

    it('网络失败时抛出 PracticeError', async () => {
      mockFetchNetworkError();

      await expect(listPracticeEntries()).rejects.toThrow(PracticeError);
    });
  });

  describe('getPracticeEntry', () => {
    it('调用 /api/practice/:id 并返回条目', async () => {
      mockFetchSuccess(mockEntry);

      const result = await getPracticeEntry('practice-1');

      expect(fetch).toHaveBeenCalledWith('/api/practice/practice-1');
      expect(result).toEqual(mockEntry);
    });

    it('失败时抛出 PracticeError', async () => {
      mockFetchHttpError(404);

      await expect(getPracticeEntry('practice-1')).rejects.toThrow(PracticeError);
    });

    it('API 返回 success:false 时抛出 PracticeError', async () => {
      mockFetchApiError('条目不存在');

      await expect(getPracticeEntry('practice-1')).rejects.toThrow('条目不存在');
    });

    it('网络失败时抛出 PracticeError', async () => {
      mockFetchNetworkError();

      await expect(getPracticeEntry('practice-1')).rejects.toThrow(PracticeError);
    });
  });

  describe('updatePracticeEntry', () => {
    it('PATCH /api/practice/:id 并返回更新后的条目', async () => {
      const updatedEntry = { ...mockEntry, isFavorite: true };
      mockFetchSuccess(updatedEntry);

      const result = await updatePracticeEntry('practice-1', { isFavorite: true });

      expect(fetch).toHaveBeenCalledWith('/api/practice/practice-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: true }),
      });
      expect(result.isFavorite).toBe(true);
    });

    it('失败时抛出 PracticeError', async () => {
      mockFetchHttpError(500);

      await expect(updatePracticeEntry('practice-1', { isArchived: true })).rejects.toThrow(PracticeError);
    });

    it('API 返回 success:false 时抛出 PracticeError', async () => {
      mockFetchApiError('更新被拒绝');

      await expect(updatePracticeEntry('practice-1', { isArchived: true })).rejects.toThrow('更新被拒绝');
    });

    it('网络失败时抛出 PracticeError', async () => {
      mockFetchNetworkError();

      await expect(updatePracticeEntry('practice-1', { isArchived: true })).rejects.toThrow(PracticeError);
    });
  });

  describe('deletePracticeEntry', () => {
    it('DELETE /api/practice/:id 成功时返回 void', async () => {
      mockFetchSuccess(undefined);

      const result = await deletePracticeEntry('practice-1');

      expect(fetch).toHaveBeenCalledWith('/api/practice/practice-1', {
        method: 'DELETE',
      });
      expect(result).toBeUndefined();
    });

    it('失败时抛出 PracticeError', async () => {
      mockFetchHttpError(500);

      await expect(deletePracticeEntry('practice-1')).rejects.toThrow(PracticeError);
    });

    it('API 返回 success:false 时抛出 PracticeError', async () => {
      mockFetchApiError('删除被拒绝');

      await expect(deletePracticeEntry('practice-1')).rejects.toThrow('删除被拒绝');
    });

    it('网络失败时抛出 PracticeError', async () => {
      mockFetchNetworkError();

      await expect(deletePracticeEntry('practice-1')).rejects.toThrow(PracticeError);
    });
  });
});
