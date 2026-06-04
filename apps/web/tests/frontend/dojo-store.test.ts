import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Scenario } from '@/types/dojo';

const { startSessionMock, sendMessageMock, endSessionMock, getScenariosMock } = vi.hoisted(() => ({
  startSessionMock: vi.fn(),
  sendMessageMock: vi.fn(),
  endSessionMock: vi.fn(),
  getScenariosMock: vi.fn(),
}));

vi.mock('@/lib/frontend/scenario-client', () => ({
  getScenarios: getScenariosMock,
}));

vi.mock('@/lib/frontend/simulator-client', () => ({
  startSession: startSessionMock,
  sendMessage: sendMessageMock,
  restartSession: vi.fn(),
  endSession: endSessionMock,
}));

import { useDojoStore } from '@/store/dojo-store';

const relationshipScenario: Scenario = {
  id: 'relationship',
  name: '亲密关系',
  description: 'relationship scenario',
  difficulty: 'medium',
  context: 'relationship context',
  goal: 'relationship goal',
  tips: [],
};

const workplaceScenario: Scenario = {
  id: 'workplace',
  name: '职场越界',
  description: 'workplace scenario',
  difficulty: 'medium',
  context: 'workplace context',
  goal: 'workplace goal',
  tips: [],
};

describe('dojo store scenario switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDojoStore.setState({
      currentScenario: null,
      scenarios: [],
      messages: [],
      isTyping: false,
      rightPanel: null,
      sessionId: null,
      sessionStatus: 'idle',
      startTime: null,
      error: null,
      scenarioSessions: {},
    });
  });

  it('restores an unfinished session when switching back to that scenario', async () => {
    startSessionMock
      .mockResolvedValueOnce({
        sessionId: 'workplace-session',
        aiResponse: '职场开场白',
        rightPanel: { analysisScore: null, analysisLabel: '待评分', analysisSummary: '', instantFeedback: '', attentionPoint: '' },
      })
      .mockResolvedValueOnce({
        sessionId: 'relationship-session',
        aiResponse: '关系开场白',
        rightPanel: { analysisScore: null, analysisLabel: '待评分', analysisSummary: '', instantFeedback: '', attentionPoint: '' },
      });
    sendMessageMock.mockResolvedValue({
      sessionId: 'workplace-session',
      aiResponse: '职场回复',
      rightPanel: { analysisScore: 80, analysisLabel: '优秀', analysisSummary: '保持边界', instantFeedback: '很好', attentionPoint: '继续简短' },
    });

    await useDojoStore.getState().selectScenario(workplaceScenario);
    await useDojoStore.getState().sendMessage('我不能加班。');
    await useDojoStore.getState().selectScenario(relationshipScenario);
    await useDojoStore.getState().selectScenario(workplaceScenario);

    const state = useDojoStore.getState();
    expect(startSessionMock).toHaveBeenCalledTimes(2);
    expect(state.currentScenario?.id).toBe('workplace');
    expect(state.sessionId).toBe('workplace-session');
    expect(state.sessionStatus).toBe('active');
    expect(state.messages.map((message) => message.content)).toEqual([
      '职场开场白',
      '我不能加班。',
      '职场回复',
    ]);
    expect(state.rightPanel?.analysisScore).toBe(80);
  });

  it('starts a new session for a scenario whose previous session ended', async () => {
    startSessionMock
      .mockResolvedValueOnce({
        sessionId: 'old-workplace-session',
        aiResponse: '旧开场白',
        rightPanel: { analysisScore: null, analysisLabel: '待评分', analysisSummary: '', instantFeedback: '', attentionPoint: '' },
      })
      .mockResolvedValueOnce({
        sessionId: 'relationship-session',
        aiResponse: '关系开场白',
        rightPanel: { analysisScore: null, analysisLabel: '待评分', analysisSummary: '', instantFeedback: '', attentionPoint: '' },
      })
      .mockResolvedValueOnce({
        sessionId: 'new-workplace-session',
        aiResponse: '新开场白',
        rightPanel: { analysisScore: null, analysisLabel: '待评分', analysisSummary: '', instantFeedback: '', attentionPoint: '' },
      });
    endSessionMock.mockResolvedValue({ finalScore: 70, overallFeedback: '完成', improvements: [], sessionDuration: 60 });

    await useDojoStore.getState().selectScenario(workplaceScenario);
    await useDojoStore.getState().endSession();
    await useDojoStore.getState().selectScenario(relationshipScenario);
    await useDojoStore.getState().selectScenario(workplaceScenario);

    const state = useDojoStore.getState();
    expect(startSessionMock).toHaveBeenCalledTimes(3);
    expect(state.currentScenario?.id).toBe('workplace');
    expect(state.sessionId).toBe('new-workplace-session');
    expect(state.sessionStatus).toBe('active');
    expect(state.messages.map((message) => message.content)).toEqual(['新开场白']);
  });

  it('starts a new relationship session instead of restoring an incomplete active cache without an opening message', async () => {
    startSessionMock.mockResolvedValueOnce({
      sessionId: 'relationship-session',
      aiResponse: '如果你真的在乎我，就不会在这种时候还想着去和朋友聚会。',
      rightPanel: { analysisScore: null, analysisLabel: '待评分', analysisSummary: '', instantFeedback: '', attentionPoint: '' },
    });
    useDojoStore.setState({
      currentScenario: workplaceScenario,
      sessionId: 'workplace-session',
      sessionStatus: 'active',
      scenarioSessions: {
        relationship: {
          currentScenario: relationshipScenario,
          messages: [],
          rightPanel: null,
          sessionId: null,
          sessionStatus: 'active',
          startTime: new Date(),
        },
      },
    });

    await useDojoStore.getState().selectScenario(relationshipScenario);

    const state = useDojoStore.getState();
    expect(startSessionMock).toHaveBeenCalledWith('relationship');
    expect(state.currentScenario?.id).toBe('relationship');
    expect(state.sessionId).toBe('relationship-session');
    expect(state.messages.map((message) => message.content)).toEqual([
      '如果你真的在乎我，就不会在这种时候还想着去和朋友聚会。',
    ]);
  });
});
