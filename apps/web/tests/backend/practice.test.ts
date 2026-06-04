/**
 * Practice API Tests
 * TDD: Initial failing tests for practice endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GET_LIST, POST } from '@/app/api/practice/route';
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/practice/[practiceId]/route';
import { createMockRequest, getJson } from './setup';
import { getCurrentGuestSession } from '@/lib/backend/sessions/guest';
import { resolvePracticeOwner } from '@/app/api/practice/_lib/current-user';
import { practiceRepository } from '@/lib/backend/repositories/practice-repository';
import { practiceService } from '@/lib/backend/services/practice-service';
import { db } from '@/lib/db';

vi.mock('@/lib/backend/sessions/guest', () => ({
  ensureGuestSession: vi.fn(() => Promise.resolve({
    id: 'test-guest-id',
    sessionToken: 'test-token',
    userId: null,
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
  })),
  getCurrentGuestSession: vi.fn(),
}));

vi.mock('@/app/api/practice/_lib/current-user', () => ({
  resolvePracticeOwner: vi.fn(() => Promise.resolve({ userId: null, guestSessionId: 'test-guest-id' })),
}));

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn((data: Record<string, unknown>) => ({
        returning: vi.fn(() => Promise.resolve([{
          id: 'test-practice-id',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }])),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => {
          const listResult = Promise.resolve([{
            id: 'test-id',
            sourceType: 'decode',
            primaryReply: 'test',
            contentJsonb: {},
            isFavorite: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }]);
          return {
            limit: vi.fn(() => listResult),
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => listResult),
            })),
            then: (resolve: any) => Promise.resolve([{ count: 5 }]).then(resolve),
          };
        }),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
  },
  isDBAvailable: vi.fn(() => true),
}));

describe('POST /api/practice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePracticeOwner).mockResolvedValue({ userId: null, guestSessionId: 'test-guest-id' });
  });

  it('should create practice entry from decode source', async () => {
    const request = createMockRequest({
      sourceType: 'decode',
      primaryReply: '回复A',
      content: {
        originalText: '测试文本',
        analysis: {
          attackType: 'accusation',
          scenario: 'criticism',
          subtext: '隐含意思',
          emotionScore: 75,
          neutralityScore: 25,
        },
        replyOptions: [
          { id: 'a', label: '方案A', content: '回复A', tone: 'neutral' },
        ],
        selectedReplyId: 'a',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await getJson(response) as { success: boolean; data: { id: string } };
    expect(data.success).toBe(true);
    expect(data.data.id).toBeDefined();
  });

  it('should preserve decode fields: surfaceMeaning, emotionStatus, selectedReplyId, relationId, relationName, and primaryReply from selected reply', async () => {
    const request = createMockRequest({
      sourceType: 'decode',
      primaryReply: '我听到了，但这个决定不会改变。',
      content: {
        originalText: '你如果真的在乎我，就不会这样做。',
        surfaceMeaning: '对方认为你的行为代表不在乎。',
        analysis: {
          attackType: '情感勒索',
          scenario: 'decode',
          subtext: '对方试图用内疚感迫使你让步。',
          emotionScore: 72,
          neutralityScore: 28,
          emotionStatus: '高压',
        },
        replyOptions: [
          { id: 'A', label: 'A', content: '我理解你的感受，但我需要按自己的安排来。', tone: '温和坚定' },
          { id: 'B', label: 'B', content: '我听到了，但这个决定不会改变。', tone: '边界清晰' },
          { id: 'C', label: 'C', content: '我知道了。', tone: '灰岩回应' },
        ],
        selectedReplyId: 'B',
        relationId: 'relation-123',
        relationName: '伴侣',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await getJson(response) as {
      success: boolean;
      data: {
        id: string;
        primaryReply: string;
        content: {
          originalText: string;
          surfaceMeaning: string;
          analysis: {
            emotionStatus: string;
          };
          selectedReplyId: string;
          relationId: string;
          relationName: string;
        };
      };
    };
    expect(data.success).toBe(true);
    expect(data.data.content.originalText).toBe('你如果真的在乎我，就不会这样做。');
    expect(data.data.content.surfaceMeaning).toBe('对方认为你的行为代表不在乎。');
    expect(data.data.content.analysis.emotionStatus).toBe('高压');
    expect(data.data.content.selectedReplyId).toBe('B');
    expect(data.data.content.relationId).toBe('relation-123');
    expect(data.data.content.relationName).toBe('伴侣');
    expect(data.data.primaryReply).toBe('我听到了，但这个决定不会改变。');
  });

  it('should create practice entry from simulator source', async () => {
    const request = createMockRequest({
      sourceType: 'simulator',
      primaryReply: '用户选定的回复',
      content: {
        scenarioId: 'scenario-1',
        scenarioName: '测试场景',
        turns: [
          { role: 'assistant', content: 'AI消息' },
          { role: 'user', content: '用户消息' },
        ],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await getJson(response) as { success: boolean; data: { id: string } };
    expect(data.success).toBe(true);
    expect(data.data.id).toBeDefined();
  });

  it('should reject simulator with invalid turns', async () => {
    const request = createMockRequest({
      sourceType: 'simulator',
      primaryReply: '用户选定的回复',
      content: {
        scenarioId: 'scenario-1',
        scenarioName: '测试场景',
        turns: [
          { role: 'invalid-role', content: 'AI消息' },
        ],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('turn role must be user or assistant');
  });

  it('should reject simulator with non-array turns', async () => {
    const request = createMockRequest({
      sourceType: 'simulator',
      primaryReply: '用户选定的回复',
      content: {
        scenarioId: 'scenario-1',
        scenarioName: '测试场景',
        turns: 'not-an-array',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('turns must be an array');
  });

  it('should validate required fields', async () => {
    const request = createMockRequest({
      sourceType: 'decode',
      // missing primaryReply
      content: {},
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
  });

  it('should return 400 for malformed replyOptions that is not an array', async () => {
    const request = createMockRequest({
      sourceType: 'decode',
      primaryReply: 'test',
      content: {
        originalText: '测试文本',
        analysis: {
          attackType: 'accusation',
          scenario: 'criticism',
          subtext: '隐含意思',
          emotionScore: 75,
          neutralityScore: 25,
        },
        replyOptions: 'not-an-array',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('replyOptions');
  });

  it('should reject primaryReply mismatch for decode', async () => {
    const request = createMockRequest({
      sourceType: 'decode',
      primaryReply: '不匹配的内容',
      content: {
        originalText: '测试文本',
        analysis: {
          attackType: 'accusation',
          scenario: 'criticism',
          subtext: '隐含意思',
          emotionScore: 75,
          neutralityScore: 25,
        },
        replyOptions: [
          { id: 'a', label: '方案A', content: '回复A', tone: 'neutral' },
        ],
        selectedReplyId: 'a',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('primaryReply must match the selected reply content');
  });

  it('should reject decode when selectedReplyId is missing', async () => {
    const request = createMockRequest({
      sourceType: 'decode',
      primaryReply: '回复A',
      content: {
        originalText: '测试文本',
        analysis: {
          attackType: 'accusation',
          scenario: 'criticism',
          subtext: '隐含意思',
          emotionScore: 75,
          neutralityScore: 25,
        },
        replyOptions: [
          { id: 'a', label: '方案A', content: '回复A', tone: 'neutral' },
        ],
        // selectedReplyId intentionally omitted
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('selectedReplyId is required');
  });

  it('should reject decode when selectedReplyId does not match any reply option', async () => {
    const request = createMockRequest({
      sourceType: 'decode',
      primaryReply: '回复A',
      content: {
        originalText: '测试文本',
        analysis: {
          attackType: 'accusation',
          scenario: 'criticism',
          subtext: '隐含意思',
          emotionScore: 75,
          neutralityScore: 25,
        },
        replyOptions: [
          { id: 'a', label: '方案A', content: '回复A', tone: 'neutral' },
        ],
        selectedReplyId: 'non-existent-id',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('selectedReplyId does not match any reply option');
  });
});

describe('GET /api/practice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePracticeOwner).mockResolvedValue({ userId: null, guestSessionId: 'test-guest-id' });
  });

  it('should return list of practice entries', async () => {
    const request = new Request('http://localhost:3000/api/practice');
    const response = await GET_LIST(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { entries: unknown[]; total: number } };
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.entries)).toBe(true);
    expect(data.data.total).toBe(5);
  });

  it('should support pagination', async () => {
    const request = new Request('http://localhost:3000/api/practice?limit=10');
    const response = await GET_LIST(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { entries: unknown[]; hasMore: boolean } };
    expect(data.success).toBe(true);
    expect(data.data.entries.length).toBeLessThanOrEqual(10);
  });

  it('should filter by source type', async () => {
    const request = new Request('http://localhost:3000/api/practice?sourceType=decode');
    const response = await GET_LIST(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { entries: unknown[] } };
    expect(data.success).toBe(true);
  });

  it('should return 400 for invalid limit', async () => {
    const request = new Request('http://localhost:3000/api/practice?limit=0');
    const response = await GET_LIST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('limit');
  });

  it('should return 400 for invalid cursor', async () => {
    const request = new Request('http://localhost:3000/api/practice?cursor=not-a-date');
    const response = await GET_LIST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('cursor');
  });

  it('should not return all entries when no session is available', async () => {
    vi.mocked(resolvePracticeOwner).mockRejectedValue({ code: 'UNAUTHORIZED', message: 'Authentication required', status: 401 });

    const request = new Request('http://localhost:3000/api/practice');
    const response = await GET_LIST(request);

    expect(response.status).toBe(401);
    const data = await getJson(response) as { success: boolean; error: { code: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });
});

describe('GET /api/practice/[practiceId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePracticeOwner).mockResolvedValue({ userId: null, guestSessionId: 'test-guest-id' });
  });

  it('should return 400 for invalid practiceId', async () => {
    const request = new Request('http://localhost:3000/api/practice/invalid-id');
    const response = await GET_BY_ID(request, { params: Promise.resolve({ practiceId: 'invalid-id' }) });

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('practiceId');
  });

  it('should return 404 for non-existent practiceId', async () => {
    vi.spyOn(practiceRepository, 'findById').mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/practice/550e8400-e29b-41d4-a716-446655440000');
    const response = await GET_BY_ID(request, { params: Promise.resolve({ practiceId: '550e8400-e29b-41d4-a716-446655440000' }) });

    expect(response.status).toBe(404);
    const data = await getJson(response) as { success: boolean; error: { code: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
  });
});

describe('PATCH /api/practice/[practiceId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePracticeOwner).mockResolvedValue({ userId: null, guestSessionId: 'test-guest-id' });
  });

  it('should reject string false for isFavorite', async () => {
    const request = createMockRequest(
      { isFavorite: 'false' },
      { method: 'PATCH' }
    );
    const response = await PATCH(request, { params: Promise.resolve({ practiceId: '550e8400-e29b-41d4-a716-446655440000' }) });

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('isFavorite must be a boolean');
  });

  it('should reject string false for isArchived', async () => {
    const request = createMockRequest(
      { isArchived: 'false' },
      { method: 'PATCH' }
    );
    const response = await PATCH(request, { params: Promise.resolve({ practiceId: '550e8400-e29b-41d4-a716-446655440000' }) });

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('isArchived must be a boolean');
  });

  it('should accept boolean true for isFavorite', async () => {
    const request = createMockRequest(
      { isFavorite: true },
      { method: 'PATCH' }
    );
    const response = await PATCH(request, { params: Promise.resolve({ practiceId: '550e8400-e29b-41d4-a716-446655440000' }) });

    // The existing db mock returns empty array for updates, so service returns null -> 404.
    // We verify the request passed validation (did not get 400) and reached the service layer.
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid practiceId', async () => {
    const request = createMockRequest(
      { isFavorite: true },
      { method: 'PATCH' }
    );
    const response = await PATCH(request, { params: Promise.resolve({ practiceId: 'invalid-id' }) });

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('practiceId');
  });
});

describe('DELETE /api/practice/[practiceId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePracticeOwner).mockResolvedValue({ userId: null, guestSessionId: 'test-guest-id' });
  });

  it('should return 400 for invalid practiceId', async () => {
    const request = new Request('http://localhost:3000/api/practice/invalid-id', { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ practiceId: 'invalid-id' }) });

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string; message: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
    expect(data.error.message).toContain('practiceId');
  });
});

describe('PracticeRepository.count', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not filter archived when isArchived is undefined (all entries)', async () => {
    // The existing db mock returns count: 5 regardless of where clause.
    // This test exercises the code path where count is called without isArchived filter,
    // and the repository implementation does NOT add a default isArchived=false condition.
    const result = await practiceRepository.count({
      userId: 'user-1',
      filters: {},
    });

    expect(result).toBe(5);
  });
});

describe('PracticeRepository.findMany', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not filter archived when isArchived is undefined (all entries)', async () => {
    const result = await practiceRepository.findMany({
      userId: 'user-1',
      filters: {},
    });

    expect(result.entries.length).toBe(1);
  });
});

describe('practiceService.createFromSimulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject non-array turns at service level', async () => {
    await expect(
      practiceService.createFromSimulator({
        guestSessionId: 'test-guest-id',
        scenarioId: 'scenario-1',
        scenarioName: '测试场景',
        turns: 'not-an-array' as unknown as Array<{ role: string; content: string }>,
        primaryReply: '用户选定的回复',
      })
    ).rejects.toThrow('turns must be an array');
  });

  it('should reject invalid turn role at service level', async () => {
    await expect(
      practiceService.createFromSimulator({
        guestSessionId: 'test-guest-id',
        scenarioId: 'scenario-1',
        scenarioName: '测试场景',
        turns: [{ role: 'invalid-role', content: 'AI消息' }],
        primaryReply: '用户选定的回复',
      })
    ).rejects.toThrow('turn role must be user or assistant');
  });

  it('should reject non-string turn content at service level', async () => {
    await expect(
      practiceService.createFromSimulator({
        guestSessionId: 'test-guest-id',
        scenarioId: 'scenario-1',
        scenarioName: '测试场景',
        turns: [{ role: 'assistant', content: 123 } as unknown as { role: string; content: string }],
        primaryReply: '用户选定的回复',
      })
    ).rejects.toThrow('turn content must be a string');
  });

  it('should accept valid turns at service level', async () => {
    const result = await practiceService.createFromSimulator({
      guestSessionId: 'test-guest-id',
      scenarioId: 'scenario-1',
      scenarioName: '测试场景',
      turns: [
        { role: 'assistant', content: 'AI消息' },
        { role: 'user', content: '用户消息' },
      ],
      primaryReply: '用户选定的回复',
    });

    expect(result.sourceType).toBe('simulator');
    expect(result.content).toMatchObject({
      scenarioId: 'scenario-1',
      scenarioName: '测试场景',
    });
  });
});
