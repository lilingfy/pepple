/**
 * Simulator Service
 * Business logic for simulation sessions with PostgreSQL persistence
 */

import { simulatorRepository } from '../repositories/simulator-repository';
import { createBackendError } from '../errors';
import type {
  ScenarioItem,
  SimulatorResponse,
  SimulatorSession,
  SimulatorEndResponse,
} from '@pebble/types';
import type { SimulationSession as DbSession, SimulationTurn } from '@/lib/db/schema';

// Preset scenarios data - matches frontend expectations
const scenariosData: Record<string, ScenarioItem & {
  context: string;
  goal: string;
  tips: Array<{ name: string; description: string }>;
  openings: string[];
}> = {
  workplace: {
    id: 'workplace',
    name: '职场越界',
    description: '应对不合理的加班要求或越界行为',
    difficulty: 'medium',
    category: 'work',
    context: '一位资深同事试图让你在周末无偿加班，并带有道德绑架。你需要温和但坚定地拒绝。',
    goal: '维持职业边界，不JADE（辩解、辩论、解释）。',
    tips: [
      { name: '灰岩法 (Gray Rock)', description: '像灰岩一样平平无奇，不提供情感刺激。' },
      { name: '肯定+否定', description: '"我很理解项目的紧迫性，但我这周末已有安排，无法协助。"' },
    ],
    openings: [
      '大家都在为了这个项目冲刺，你作为核心成员，这周末如果不来盯着，万一出问题谁负责？这种时候不应该有点团队精神吗？',
      '公司现在正处于关键时期，每个人都需要多付出一点。你之前的表现一直很好，这次应该不会让我们失望吧？',
    ],
    initialMessage: '', // Will be set from openings
  },
  relationship: {
    id: 'relationship',
    name: '亲密关系',
    description: '处理伴侣或家人的情感操控',
    difficulty: 'hard',
    category: 'family',
    context: '伴侣试图用内疚感操控你放弃个人计划来满足他们的需求。',
    goal: '保持情感边界，不被内疚感左右，同时表达关心。',
    tips: [
      { name: '灰岩法 (Gray Rock)', description: '保持平静，不回应情绪挑衅。' },
      { name: '验证+坚持', description: '"我理解你的感受，但我仍然需要坚持自己的安排。"' },
    ],
    openings: [
      '如果你真的在乎我，就不会在这种时候还想着去和朋友聚会。你从来不把我的需求放在第一位。',
      '每次我需要你的时候，你总有各种借口。也许我在你心里根本不重要吧。',
    ],
    initialMessage: '',
  },
  social: {
    id: 'social',
    name: '社交应对',
    description: '应对无端指责和杠精',
    difficulty: 'easy',
    category: 'social',
    context: '在社交媒体或聚会中遇到无端指责或抬杠的人。',
    goal: '保持冷静，不参与无意义的争论，保护自己的能量。',
    tips: [
      { name: '灰岩法 (Gray Rock)', description: '不给予任何情绪反应，表现得平淡无趣。' },
      { name: '简短回应', description: '"嗯，我知道了。"然后转移话题或离开。' },
    ],
    openings: [
      '你这种想法也太天真了吧？现在的社会哪有你说的那么简单。你这样的想法迟早会吃亏的。',
      '我觉得你应该多听听别人的意见，不要总是这么固执。你这样做明显是错的。',
    ],
    initialMessage: '',
  },
};

// Set initial messages from openings
for (const scenario of Object.values(scenariosData)) {
  scenario.initialMessage = scenario.openings[0];
}

export class SimulatorService {
  private repository = simulatorRepository;

  /**
   * Get all available scenarios
   */
  getScenarios(): ScenarioItem[] {
    return Object.values(scenariosData).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      difficulty: s.difficulty,
      category: s.category,
      initialMessage: s.initialMessage,
      context: s.context,
      goal: s.goal,
      tips: s.tips,
    }));
  }

  /**
   * Start a new simulation session
   */
  async startSession(
    scenarioId: string,
    guestSessionId?: string | null,
    userId?: string | null
  ): Promise<SimulatorResponse> {
    const scenario = scenariosData[scenarioId];
    if (!scenario) {
      throw createBackendError('NOT_FOUND', '场景不存在');
    }

    const opening = scenario.openings[Math.floor(Math.random() * scenario.openings.length)];

    const session = await this.repository.createSession({
      userId,
      guestSessionId,
      scenarioId,
      initialMessage: opening,
    });

    const analysis = this.analyzeEmotion(opening);

    return {
      session: this.toSessionDTO(session),
      reply: opening,
      rightPanel: {
        analysisScore: analysis.score,
        analysisLabel: analysis.label,
        analysisSummary: analysis.summary,
        instantFeedback: analysis.feedback,
        attentionPoint: '注意对方的情绪操控意图',
      },
    };
  }

  /**
   * Process a user turn and generate AI response
   */
  async processTurn(
    sessionId: string,
    message: string,
    guestSessionId?: string | null
  ): Promise<SimulatorResponse> {
    const session = await this.repository.findById(sessionId);
    if (!session) {
      throw createBackendError('NOT_FOUND', '会话不存在或已过期');
    }

    if (session.completed) {
      throw createBackendError('BAD_REQUEST', '会话已结束');
    }

    // Add user turn
    await this.repository.addTurn({
      sessionId,
      role: 'user',
      content: message,
    });

    // Analyze user message
    const analysis = this.analyzeEmotion(message);

    // Generate AI response
    const aiResponse = this.generateAIResponse(session.scenarioId, message, session.turns);

    // Add AI turn with analysis
    await this.repository.addTurn({
      sessionId,
      role: 'assistant',
      content: aiResponse,
      analysisJsonb: {
        score: analysis.score,
        label: analysis.label,
        feedback: analysis.feedback,
      },
    });

    return {
      session: this.toSessionDTO(await this.repository.findById(sessionId) as SessionWithTurns),
      reply: aiResponse,
      rightPanel: {
        analysisScore: analysis.score,
        analysisLabel: analysis.label,
        analysisSummary: analysis.summary,
        instantFeedback: analysis.feedback,
        attentionPoint: '保持冷静，避免情绪被带动',
      },
    };
  }

  /**
   * Restart a session (create new one with same scenario)
   */
  async restartSession(
    sessionId: string,
    guestSessionId?: string | null,
    userId?: string | null
  ): Promise<SimulatorResponse> {
    const oldSession = await this.repository.findById(sessionId);
    if (!oldSession) {
      throw createBackendError('NOT_FOUND', '会话不存在');
    }

    // Mark old session as completed
    await this.repository.completeSession(sessionId, {
      finalScore: 0,
      summary: { reason: 'restarted' },
    });

    // Start new session
    return this.startSession(oldSession.scenarioId, guestSessionId, userId);
  }

  /**
   * End a session and return summary
   */
  async endSession(sessionId: string): Promise<SimulatorEndResponse> {
    const session = await this.repository.findById(sessionId);
    if (!session) {
      throw createBackendError('NOT_FOUND', '会话不存在或已过期');
    }

    if (session.completed) {
      throw createBackendError('BAD_REQUEST', '会话已结束');
    }

    // Calculate final score (average of turn analysis scores)
    const userTurns = session.turns.filter(t => t.role === 'user');
    const finalScore = userTurns.length > 0
      ? Math.round(userTurns.reduce((sum, t) => {
          const analysis = t.analysisJsonb as { score?: number } | null;
          return sum + (analysis?.score ?? 50);
        }, 0) / userTurns.length)
      : 50;

    // Complete session
    await this.repository.completeSession(sessionId, {
      finalScore,
      summary: {
        totalTurns: userTurns.length,
        averageScore: finalScore,
      },
    });

    return {
      session: this.toSessionDTO(await this.repository.findById(sessionId) as SessionWithTurns),
      summary: {
        totalTurns: userTurns.length,
        averageNeutrality: finalScore,
        keyLearning: finalScore >= 80
          ? '你在本次练习中表现出色，成功运用了灰岩技巧维护边界。'
          : finalScore >= 60
            ? '整体表现不错，继续练习可以进一步提升应对能力。'
            : '建议多了解灰岩技巧，练习保持中性回应。',
      },
    };
  }

  /**
   * Analyze emotion in a message
   */
  private analyzeEmotion(message: string): {
    score: number;
    label: string;
    summary: string;
    feedback: string;
  } {
    const lowerMsg = message.toLowerCase();

    const hasGrayRock =
      lowerMsg.includes('抱歉') ||
      lowerMsg.includes('理解') ||
      lowerMsg.includes('但是') ||
      message.length < 50;

    const overExplained =
      lowerMsg.includes('因为') &&
      (lowerMsg.includes('所以') || message.length > 100);

    if (hasGrayRock && !overExplained) {
      return {
        score: 85,
        label: '优秀',
        summary: '你成功识别了情绪陷阱。当前语气非常克制，有效避免了对抗性升级。',
        feedback: '简洁有力，未陷入"解释"陷阱。保持住！',
      };
    } else if (hasGrayRock) {
      return {
        score: 70,
        label: '良好',
        summary: '整体表现不错，但可以更简洁，减少解释。',
        feedback: '回应的方向是对的，但解释部分可以删减。',
      };
    } else if (overExplained) {
      return {
        score: 50,
        label: '一般',
        summary: '注意对方在试图激怒你，保持冷静。',
        feedback: '解释过多可能让对方觉得你在辩解。',
      };
    }

    return {
      score: 65,
      label: '良好',
      summary: '整体表现不错，但可以更简洁，减少解释。',
      feedback: '回应的方向是对的，还有提升空间。',
    };
  }

  /**
   * Generate AI response based on scenario and history
   */
  private generateAIResponse(
    scenarioId: string,
    _userMessage: string,
    history: SimulationTurn[]
  ): string {
    const scenario = scenariosData[scenarioId];
    if (!scenario) return '让我想想...';

    const responses = [
      '规划好的事情可以推迟嘛，毕竟公司的事更紧急。你这么坚持，是不是对团队有什么意见？',
      '你的态度让我很意外。我以为你是个有担当的人，没想到在这种关键时刻退缩。',
      '好吧，既然你这么坚决，那我就不勉强了。不过希望你知道，你的选择会影响别人对你的看法。',
      '我还是不理解，你就不能为了团队牺牲一下个人时间吗？现在的年轻人太自我了。',
    ];

    const userTurns = history.filter(t => t.role === 'user').length;
    return responses[userTurns % responses.length];
  }

  /**
   * Convert DB session to DTO
   */
  private toSessionDTO(session: { turns: SimulationTurn[] } & DbSession): SimulatorSession {
    return {
      id: session.id,
      scenarioId: session.scenarioId,
      scenarioName: scenariosData[session.scenarioId]?.name ?? '未知场景',
      messages: session.turns.map(t => ({
        role: t.role as 'user' | 'assistant',
        content: t.content,
        timestamp: t.timestamp.toISOString(),
        analysis: t.analysisJsonb as { score: number; label: string; feedback: string } | undefined,
      })),
      status: session.completed ? 'completed' : 'active',
      turnCount: session.turnsCount,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.createdAt.toISOString(), // Use createdAt as fallback
    };
  }
}

// Singleton instance
export const simulatorService = new SimulatorService();
