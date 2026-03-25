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

vi.mock('@/lib/backend/sessions/guest', () => ({
  ensureGuestSession: vi.fn(() => Promise.resolve({
    id: 'test-guest-id',
    sessionToken: 'test-token',
    userId: null,
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
  })),
  getCurrentGuestSession: vi.fn(() => Promise.resolve({
    id: 'test-guest-id',
    sessionToken: 'test-token',
    userId: null,
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
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

    // This will fail until implementation is done
    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { analysis: unknown } };
    expect(data.success).toBe(true);
    expect(data.data.analysis).toBeDefined();
    expect(data.data.analysis).toHaveProperty('attackType');
    expect(data.data.analysis).toHaveProperty('subtext');
    expect(data.data.analysis).toHaveProperty('emotionScore');
  });

  it('should return fallback when LLM is unavailable', async () => {
    const request = createMockRequest({ text: '测试文本' });
    const response = await POST(request);

    // Should still return 200 with fallback analysis
    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { analysis: unknown } };
    expect(data.success).toBe(true);
    expect(data.data.analysis).toBeDefined();
  });

  it('should persist analysis log to database', async () => {
    const request = createMockRequest({ text: '测试文本' });
    await POST(request);

    // Verify database was called - will fail until implementation
    const { db } = await import('@/lib/db');
    expect(db.insert).toHaveBeenCalled();
  });

  it('should associate analysis with guest session', async () => {
    const { ensureGuestSession } = await import('@/lib/backend/sessions/guest');
    const request = createMockRequest({ text: '测试文本' });
    await POST(request);

    expect(ensureGuestSession).toHaveBeenCalled();
  });
});
