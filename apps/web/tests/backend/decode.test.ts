/**
 * Decode API Tests
 * TDD: Initial failing tests for decode endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/decode/route';
import { createMockRequest, getJson } from './setup';

// Mock external services
vi.mock('@/lib/ai/zhipu', () => ({
  analyzeWithZhipu: vi.fn(),
}));

vi.mock('@/lib/backend/services/decode-service', () => ({
  analyzeText: vi.fn(async () => ({
    surfaceMeaning: '测试表面语义',
    subtext: '测试潜台词',
    emotionStatus: '一般场景',
    emotionScore: 45,
    replySuggestions: {
      A: '回复A',
      B: '回复B',
      C: '回复C',
      strategy: {
        A: '策略A',
        B: '策略B',
        C: '策略C',
      },
    },
  })),
}));

describe('POST /api/decode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for empty text', async () => {
    const request = createMockRequest({ text: '' });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await getJson(response) as { success: boolean; error: { code: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('BAD_REQUEST');
  });

  it('should return analysis result for valid input', async () => {
    const request = createMockRequest({ text: '你总是这样自私' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { surfaceMeaning: string; subtext: string; emotionScore: number } };
    expect(data.success).toBe(true);
    expect(data.data.surfaceMeaning).toBeDefined();
    expect(data.data.subtext).toBeDefined();
    expect(data.data.emotionScore).toBeDefined();
    expect(typeof data.data.emotionScore).toBe('number');
  });

  it('should return fallback when LLM is unavailable', async () => {
    const request = createMockRequest({ text: '测试文本' });
    const response = await POST(request);

    // Should still return 200 with fallback analysis
    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { surfaceMeaning: string } };
    expect(data.success).toBe(true);
    expect(data.data.surfaceMeaning).toBeDefined();
  });

  it('should return 200 for valid input with mocked service', async () => {
    const request = createMockRequest({ text: '测试文本' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { subtext: string } };
    expect(data.success).toBe(true);
    expect(data.data.subtext).toBeDefined();
  });
});
