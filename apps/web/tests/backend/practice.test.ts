/**
 * Practice API Tests
 * TDD: Initial failing tests for practice endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/practice/route';
import { createMockRequest, getJson } from './setup';

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

describe('POST /api/practice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create practice entry from decode source', async () => {
    const request = createMockRequest({
      sourceType: 'decode',
      primaryReply: '方案A内容',
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
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await getJson(response) as { success: boolean; data: { id: string } };
    expect(data.success).toBe(true);
    expect(data.data.id).toBeDefined();
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
});

describe('GET /api/practice', () => {
  it('should return list of practice entries', async () => {
    const request = new Request('http://localhost:3000/api/practice');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { entries: unknown[] } };
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.entries)).toBe(true);
  });

  it('should support pagination', async () => {
    const request = new Request('http://localhost:3000/api/practice?limit=10');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { entries: unknown[]; hasMore: boolean } };
    expect(data.success).toBe(true);
    expect(data.data.entries.length).toBeLessThanOrEqual(10);
  });

  it('should filter by source type', async () => {
    const request = new Request('http://localhost:3000/api/practice?sourceType=decode');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { entries: unknown[] } };
    expect(data.success).toBe(true);
  });
});
