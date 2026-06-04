import { beforeEach, describe, expect, it, vi } from 'vitest';

const { simulateConversationMock, repositoryMock, sessions } = vi.hoisted(() => {
  const sessions = new Map<string, any>();
  const repositoryMock = {
    createSession: vi.fn(async (data: { scenarioId: string; initialMessage: string }) => {
      const now = new Date('2026-06-02T00:00:00Z');
      const session = {
        id: 'session-1',
        userId: null,
        scenarioId: data.scenarioId,
        turnsCount: 1,
        completed: false,
        finalScore: null,
        completedAt: null,
        historySnapshot: null,
        createdAt: now,
        turns: [
          {
            id: 'turn-1',
            sessionId: 'session-1',
            role: 'assistant',
            content: data.initialMessage,
            timestamp: now,
            analysisJsonb: null,
            createdAt: now,
          },
        ],
      };
      sessions.set(session.id, session);
      return session;
    }),
    findById: vi.fn(async (id: string) => sessions.get(id) ?? null),
    addTurn: vi.fn(async (data: { sessionId: string; role: string; content: string; analysisJsonb?: unknown }) => {
      const session = sessions.get(data.sessionId);
      if (!session) throw new Error('Session not found');
      const turn = {
        id: `turn-${session.turns.length + 1}`,
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        timestamp: new Date('2026-06-02T00:00:00Z'),
        analysisJsonb: data.analysisJsonb ?? null,
        createdAt: new Date('2026-06-02T00:00:00Z'),
      };
      session.turns.push(turn);
      session.turnsCount = session.turns.length;
      return turn;
    }),
    completeSession: vi.fn(),
  };
  return {
    simulateConversationMock: vi.fn(),
    repositoryMock,
    sessions,
  };
});

vi.mock('@/lib/llm', () => ({
  simulateConversation: simulateConversationMock,
}));

vi.mock('@/lib/backend/repositories/simulator-repository', () => ({
  simulatorRepository: repositoryMock,
}));

import { SimulatorService } from '@/lib/backend/services/simulator-service';

describe('SimulatorService LLM integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    sessions.clear();
    await new SimulatorService().startSession('workplace');
  });

  it('does not score the antagonist opening before the user replies', async () => {
    const result = await new SimulatorService().startSession('relationship');

    expect(result.rightPanel.analysisScore).toBeNull();
    expect(result.rightPanel.scoreSource).toBe('pending');
    expect(result.rightPanel.analysisSummary).toBe('等待你的第一句回应后开始评分。');
  });

  it('uses LLM nextAttack and coach feedback for a user turn', async () => {
    simulateConversationMock.mockResolvedValue({
      coachFeedback: {
        score: 88,
        analysis: '你保持了边界，没有过度解释。',
        culturalContext: '职场中可以尊重团队，但不必牺牲个人安排。',
        suggestion: '继续使用短句确认边界。',
        betterReply: '我理解紧急性，但周末无法参与。',
        scoreBreakdown: {
          neutrality: 90,
          brevity: 85,
          boundaryClarity: 88,
          jadeAvoidance: 92,
          empathy: 75,
        },
      },
      nextAttack: '你这样让大家很难信任你，真的不再考虑一下吗？',
    });

    const result = await new SimulatorService().processTurn(
      'session-1',
      '我理解项目很急，但这周末我不能加班。',
    );

    expect(simulateConversationMock).toHaveBeenCalledWith(
      'workplace',
      '我理解项目很急，但这周末我不能加班。',
      expect.arrayContaining([
        expect.objectContaining({ role: 'antagonist' }),
        expect.objectContaining({ role: 'user', content: '我理解项目很急，但这周末我不能加班。' }),
      ]),
    );
    expect(result.reply).toBe('你这样让大家很难信任你，真的不再考虑一下吗？');
    expect(result.rightPanel.analysisScore).toBe(88);
    expect(result.rightPanel.analysisLabel).toBe('良好');
    expect(result.rightPanel.scoreSource).toBe('ai');
    expect(result.rightPanel.scoreBreakdown).toEqual({
      neutrality: 90,
      brevity: 85,
      boundaryClarity: 88,
      jadeAvoidance: 92,
      empathy: 75,
    });
    expect(result.rightPanel.instantFeedback).toBe('继续使用短句确认边界。');
    expect(result.rightPanel.attentionPoint).toContain('我理解紧急性');
  });

  it('keeps LLM score-card analysis concise enough for the compact right panel', async () => {
    const longAnalysis = '用户回复“我知道后果”虽然简短，但隐含了辩解和解释的痕迹，暗示在回应对方的道德指控，试图证明自己有认知。';

    simulateConversationMock.mockResolvedValue({
      coachFeedback: {
        score: 82,
        analysis: longAnalysis,
        culturalContext: '在中国职场语境中，过多解释常常会被理解为还可以继续商量。',
        suggestion: '保留边界句，删掉解释。',
        betterReply: '我理解项目很急，但周末无法参与。',
        scoreBreakdown: {
          neutrality: 85,
          brevity: 76,
          boundaryClarity: 84,
          jadeAvoidance: 80,
          empathy: 75,
        },
      },
      nextAttack: '你这样让大家很难信任你。',
    });

    const result = await new SimulatorService().processTurn(
      'session-1',
      '我理解项目很急，但这周末我不能加班，因为我已经安排好了。',
    );

    expect(Array.from(result.rightPanel.analysisSummary).length).toBeLessThanOrEqual(120);
    expect(result.rightPanel.analysisSummary).toBe(longAnalysis);
  });

  it('truncates unusually long LLM score-card analysis at a layout-safe length', async () => {
    const veryLongAnalysis = '你这次回应整体稳定，能够表达自己的边界，但中间仍然加入了一些解释，容易让对方继续抓住细节进行拉扯，所以最好把回应压缩成一句清楚的边界，避免继续证明自己是对的，也不要进入对方设定的道德审判框架。后续可以只保留决定，不回应评价，也不补充理由。若对方继续施压，可以重复同一句边界，不添加背景细节。';

    simulateConversationMock.mockResolvedValue({
      coachFeedback: {
        score: 82,
        analysis: veryLongAnalysis,
        culturalContext: '在中国职场语境中，过多解释常常会被理解为还可以继续商量。',
        suggestion: '保留边界句，删掉解释。',
        betterReply: '我理解项目很急，但周末无法参与。',
        scoreBreakdown: {
          neutrality: 85,
          brevity: 76,
          boundaryClarity: 84,
          jadeAvoidance: 80,
          empathy: 75,
        },
      },
      nextAttack: '你这样让大家很难信任你。',
    });

    const result = await new SimulatorService().processTurn(
      'session-1',
      '我理解项目很急，但这周末我不能加班，因为我已经安排好了。',
    );

    expect(Array.from(result.rightPanel.analysisSummary).length).toBeLessThanOrEqual(121);
    expect(result.rightPanel.analysisSummary).toBe(`${Array.from(veryLongAnalysis).slice(0, 120).join('')}…`);
  });

  it('falls back to deterministic response when LLM fails', async () => {
    simulateConversationMock.mockRejectedValue(new Error('provider unavailable'));

    const result = await new SimulatorService().processTurn(
      'session-1',
      '因为我之前已经安排好了，所以这次真的不能来。',
    );

    expect(result.reply).toContain('你的态度让我很意外');
    expect(result.rightPanel.analysisScore).toBeGreaterThan(0);
    expect(result.rightPanel.scoreSource).toBe('rule');
    expect(result.rightPanel.scoreBreakdown).toMatchObject({
      neutrality: expect.any(Number),
      brevity: expect.any(Number),
      boundaryClarity: expect.any(Number),
      jadeAvoidance: expect.any(Number),
      empathy: expect.any(Number),
    });
    expect(result.rightPanel.instantFeedback).toBeTruthy();
  });

  it('scores concise boundary replies higher than over-explaining replies in rule fallback', async () => {
    simulateConversationMock.mockRejectedValue(new Error('provider unavailable'));

    const concise = await new SimulatorService().processTurn(
      'session-1',
      '我理解你很失望，但我今晚需要按原计划休息。',
    );

    await new SimulatorService().startSession('workplace');
    const overExplaining = await new SimulatorService().processTurn(
      'session-1',
      '因为我昨天已经答应了朋友，而且我最近真的很累，所以我觉得如果你理解我的话就不应该继续逼我。',
    );

    expect(concise.rightPanel.analysisScore).toBeGreaterThan(overExplaining.rightPanel.analysisScore ?? 0);
    expect(concise.rightPanel.scoreBreakdown?.boundaryClarity).toBeGreaterThan(
      overExplaining.rightPanel.scoreBreakdown?.boundaryClarity ?? 0,
    );
    expect(concise.rightPanel.scoreBreakdown?.jadeAvoidance).toBeGreaterThan(
      overExplaining.rightPanel.scoreBreakdown?.jadeAvoidance ?? 0,
    );
  });
});
