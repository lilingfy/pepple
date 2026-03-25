/**
 * Simulator API Tests
 * TDD: Initial failing tests for simulator endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/simulator/route';
import { GET as getScenarios } from '@/app/api/scenarios/route';
import { POST as endSession } from '@/app/api/simulator/[sessionId]/end/route';
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

describe('GET /api/scenarios', () => {
  it('should return three fixed scenarios in stable order', async () => {
    const response = await getScenarios();

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { scenarios: unknown[] } };
    expect(data.success).toBe(true);
    expect(data.data.scenarios).toHaveLength(3);
  });

  it('should include required scenario fields', async () => {
    const response = await getScenarios();
    const data = await getJson(response) as { success: boolean; data: { scenarios: Array<{ id: string; name: string; description: string; difficulty: string; category: string; initialMessage: string }> } };

    const scenario = data.data.scenarios[0];
    expect(scenario.id).toBeDefined();
    expect(scenario.name).toBeDefined();
    expect(scenario.description).toBeDefined();
    expect(scenario.difficulty).toMatch(/easy|medium|hard/);
    expect(scenario.category).toBeDefined();
    expect(scenario.initialMessage).toBeDefined();
  });
});

describe('POST /api/simulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start new session', async () => {
    const request = createMockRequest({ action: 'start', scenarioId: 'scenario-1' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { session: { id: string } } };
    expect(data.success).toBe(true);
    expect(data.data.session.id).toBeDefined();
  });

  it('should continue existing session', async () => {
    const request = createMockRequest({
      action: 'continue',
      sessionId: 'test-session-id',
      message: '用户回复',
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { reply: string } };
    expect(data.success).toBe(true);
    expect(data.data.reply).toBeDefined();
  });

  it('should persist turns to database', async () => {
    const request = createMockRequest({
      action: 'continue',
      sessionId: 'test-session-id',
      message: '用户回复',
    });
    await POST(request);

    const { db } = await import('@/lib/db');
    expect(db.insert).toHaveBeenCalled();
  });
});

describe('POST /api/simulator/[sessionId]/end', () => {
  it('should end session and return summary', async () => {
    const response = await endSession(
      { params: Promise.resolve({ sessionId: 'test-session-id' }) }
    );

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { summary: { totalTurns: number } } };
    expect(data.success).toBe(true);
    expect(data.data.summary).toBeDefined();
    expect(data.data.summary.totalTurns).toBeGreaterThanOrEqual(0);
  });
});
