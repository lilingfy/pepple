/**
 * Simulator API Tests
 * TDD: Initial failing tests for simulator endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/simulator/route';
import { GET as getScenarios } from '@/app/api/scenarios/route';
import { POST as endSession } from '@/app/api/simulator/[sessionId]/end/route';
import { createMockRequest, getJson } from './setup';

// Mock simulator service to avoid DB/LLM dependencies
vi.mock('@/lib/backend/services/simulator-service', () => ({
  simulatorService: {
    getScenarios: vi.fn(() => [
      { id: 'workplace', name: '职场越界', description: '应对不合理的加班要求', difficulty: 'medium', category: 'work', initialMessage: '测试开场白' },
      { id: 'relationship', name: '亲密关系', description: '处理伴侣或家人的情感操控', difficulty: 'hard', category: 'family', initialMessage: '测试开场白' },
      { id: 'social', name: '社交应对', description: '应对无端指责和杠精', difficulty: 'easy', category: 'social', initialMessage: '测试开场白' },
    ]),
    startSession: vi.fn(async () => ({
      session: { id: 'test-session-id', scenarioId: 'workplace', scenarioName: '职场越界', messages: [], status: 'active', turnCount: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      reply: '测试开场白',
      rightPanel: {
        analysisScore: null,
        analysisLabel: '待评分',
        analysisSummary: '等待你的第一句回应后开始评分。',
        instantFeedback: '先观察对方的话术，再用一句简短回应表达边界。',
        attentionPoint: '注意对方的情绪操控意图。',
        scoreSource: 'pending',
      },
    })),
    processTurn: vi.fn(async () => ({
      session: { id: 'test-session-id', scenarioId: 'workplace', scenarioName: '职场越界', messages: [], status: 'active', turnCount: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      reply: 'AI回复',
      rightPanel: {
        analysisScore: 65,
        analysisLabel: '一般',
        analysisSummary: '分析摘要',
        instantFeedback: '反馈',
        attentionPoint: '注意点',
        scoreSource: 'rule',
      },
    })),
    endSession: vi.fn(async () => ({
      session: { id: 'test-session-id', scenarioId: 'workplace', scenarioName: '职场越界', messages: [], status: 'completed', turnCount: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      summary: {
        totalTurns: 2,
        averageNeutrality: 65,
        keyLearning: '建议多了解灰岩技巧，练习保持中性回应。',
      },
    })),
  },
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
    const request = createMockRequest({ action: 'start', scenarioId: 'workplace' });
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
});

describe('POST /api/simulator/[sessionId]/end', () => {
  it('should end session and return summary', async () => {
    const response = await endSession(
      {} as unknown as import('next/server').NextRequest,
      { params: Promise.resolve({ sessionId: 'test-session-id' }) }
    );

    expect(response.status).toBe(200);
    const data = await getJson(response) as { success: boolean; data: { summary: { totalTurns: number } } };
    expect(data.success).toBe(true);
    expect(data.data.summary).toBeDefined();
    expect(data.data.summary.totalTurns).toBeGreaterThanOrEqual(0);
  });
});
