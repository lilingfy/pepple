/**
 * Simulator Service
 * Business logic for simulation sessions with PostgreSQL persistence
 */

import { simulatorRepository } from '../repositories/simulator-repository';
import { createBackendError } from '../errors';
import { withTimeout } from '../policy/timeout';
import { simulateConversation, type SimulatorResult } from '@/lib/llm';
import type {
  ScenarioItem,
  SimulatorResponse,
  SimulatorSession,
  SimulatorEndResponse,
} from '@pebble/types';
import type { SimulationSession as DbSession, SimulationTurn } from '@/lib/db/schema';
import type { SessionWithTurns } from '../repositories/simulator-repository';

const SIMULATOR_LLM_TIMEOUT_MS = 30000;
const SCORE_CARD_ANALYSIS_MAX_CHARS = 120;

interface CoachingAnalysis {
  score: number | null;
  label: string;
  summary: string;
  feedback: string;
  attentionPoint: string;
  scoreSource: 'pending' | 'ai' | 'rule' | 'fallback';
  scoreBreakdown?: ScoreBreakdown;
}

interface ScoreBreakdown {
  neutrality: number;
  brevity: number;
  boundaryClarity: number;
  jadeAvoidance: number;
  empathy: number;
}

interface AIResponseResult {
  reply: string;
  analysis: CoachingAnalysis;
}

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

    return {
      session: this.toSessionDTO(session),
      reply: opening,
      rightPanel: {
        analysisScore: null,
        analysisLabel: '待评分',
        analysisSummary: '等待你的第一句回应后开始评分。',
        instantFeedback: '先观察对方的话术，再用一句简短回应表达边界。',
        attentionPoint: '注意对方的情绪操控意图。',
        scoreSource: 'pending',
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

    // Generate AI response and coaching analysis. Falls back internally when
    // the provider is missing, slow, or returns malformed output.
    const aiResult = await this.generateAIResponse(
      session.scenarioId,
      message,
      session.turns,
    );

    // Add AI turn with analysis
    await this.repository.addTurn({
      sessionId,
      role: 'assistant',
      content: aiResult.reply,
      analysisJsonb: {
        score: aiResult.analysis.score,
        label: aiResult.analysis.label,
        feedback: aiResult.analysis.feedback,
      },
    });

    return {
      session: this.toSessionDTO(await this.repository.findById(sessionId) as SessionWithTurns),
      reply: aiResult.reply,
      rightPanel: {
        analysisScore: aiResult.analysis.score,
        analysisLabel: aiResult.analysis.label,
        analysisSummary: aiResult.analysis.summary,
        instantFeedback: aiResult.analysis.feedback,
        attentionPoint: aiResult.analysis.attentionPoint,
        scoreSource: aiResult.analysis.scoreSource,
        scoreBreakdown: aiResult.analysis.scoreBreakdown,
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
  private analyzeEmotion(message: string): CoachingAnalysis {
    const lowerMsg = message.toLowerCase();
    const length = Array.from(message.trim()).length;

    const hasBoundary =
      /我[^，。！？,.!?]{0,8}(不能|不会|需要|决定|选择|可以|会|无法)/.test(message) ||
      lowerMsg.includes('不行') ||
      lowerMsg.includes('无法') ||
      lowerMsg.includes('不能');

    const hasEmpathy =
      lowerMsg.includes('理解') ||
      lowerMsg.includes('知道') ||
      lowerMsg.includes('明白') ||
      lowerMsg.includes('在乎') ||
      lowerMsg.includes('感受');

    const hasAttack =
      lowerMsg.includes('你总是') ||
      lowerMsg.includes('你从来') ||
      lowerMsg.includes('你根本') ||
      lowerMsg.includes('有病') ||
      lowerMsg.includes('闭嘴');

    const explanationMarkers = ['因为', '所以', '但是', '其实', '只是', '如果你理解', '我都已经'];
    const explanationCount = explanationMarkers.filter((marker) => lowerMsg.includes(marker)).length;
    const overExplained = explanationCount >= 2 || length > 80;

    const breakdown: ScoreBreakdown = {
      neutrality: this.clampScore(80 - (hasAttack ? 45 : 0) - (overExplained ? 12 : 0)),
      brevity: this.clampScore(length <= 35 ? 90 : length <= 60 ? 72 : length <= 90 ? 55 : 35),
      boundaryClarity: this.clampScore(hasBoundary ? 88 : 45),
      jadeAvoidance: this.clampScore(90 - explanationCount * 18 - (overExplained ? 15 : 0) - (hasAttack ? 20 : 0)),
      empathy: this.clampScore(hasEmpathy ? 78 : 55),
    };

    const score = this.weightedScore(breakdown);
    const strengths = [];
    const improvements = [];

    if (breakdown.boundaryClarity >= 75) strengths.push('边界表达清楚');
    else improvements.push('更直接说出你的边界或决定');
    if (breakdown.jadeAvoidance >= 75) strengths.push('没有明显陷入解释或争辩');
    else improvements.push('减少“因为/所以/但是”等解释链');
    if (breakdown.brevity < 65) improvements.push('把回应压缩成一到两句');
    if (breakdown.neutrality < 65) improvements.push('避免反击或评价对方');

    return {
      score,
      label: this.labelForScore(score),
      summary: strengths.length > 0
        ? `这次回应的优势是：${strengths.join('、')}。${improvements.length > 0 ? `下一步可以：${improvements.join('、')}。` : '整体已经比较稳定。'}`
        : `这次回应还容易给对方继续拉扯的空间。建议：${improvements.join('、')}。`,
      feedback: score >= 80
        ? '回应稳定且边界清楚，可以继续保持。'
        : score >= 60
          ? '方向是对的，但还可以更短、更少解释。'
          : '先降低解释和反击，直接表达一个清楚边界。',
      attentionPoint: breakdown.jadeAvoidance < 70
        ? '注意 JADE：不要辩解、争论、防御或长篇解释。'
        : '继续保持短句回应，不给对方新的情绪抓手。',
      scoreSource: 'rule',
      scoreBreakdown: breakdown,
    };
  }

  /**
   * Generate AI response based on scenario and history
   */
  private async generateAIResponse(
    scenarioId: string,
    userMessage: string,
    history: SimulationTurn[]
  ): Promise<AIResponseResult> {
    try {
      const llmResult = await withTimeout(
        simulateConversation(
          scenarioId,
          userMessage,
          this.toLLMHistory(history, userMessage),
        ),
        SIMULATOR_LLM_TIMEOUT_MS,
        'Simulator LLM timed out',
      );
      return this.mapLLMResult(llmResult);
    } catch (error) {
      console.error('Simulator LLM failed, using fallback:', error);
      return {
        reply: this.generateFallbackAIResponse(scenarioId, history),
        analysis: this.analyzeEmotion(userMessage),
      };
    }
  }

  private generateFallbackAIResponse(
    scenarioId: string,
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

  private toLLMHistory(
    history: SimulationTurn[],
    userMessage: string,
  ): Array<{ role: 'user' | 'antagonist'; content: string }> {
    return [
      ...history.map((turn) => ({
        role: turn.role === 'user' ? 'user' as const : 'antagonist' as const,
        content: turn.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];
  }

  private mapLLMResult(result: SimulatorResult): AIResponseResult {
    const score = Math.max(0, Math.min(100, Math.round(result.coachFeedback.score)));
    const scoreBreakdown = this.normalizeBreakdown(result.coachFeedback.scoreBreakdown, score);
    return {
      reply: result.nextAttack,
      analysis: {
        score,
        label: this.labelForScore(score),
        summary: this.truncateForScoreCard(result.coachFeedback.analysis || 'AI 已分析你的回应。'),
        feedback: result.coachFeedback.suggestion || '继续保持简短、稳定的边界表达。',
        attentionPoint: result.coachFeedback.betterReply
          ? `可以尝试这样回应：${result.coachFeedback.betterReply}`
          : '保持冷静，避免进入解释或争辩。',
        scoreSource: 'ai',
        scoreBreakdown,
      },
    };
  }

  private truncateForScoreCard(text: string): string {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const chars = Array.from(normalized);
    if (chars.length <= SCORE_CARD_ANALYSIS_MAX_CHARS) return normalized;
    return `${chars.slice(0, SCORE_CARD_ANALYSIS_MAX_CHARS).join('')}…`;
  }

  private normalizeBreakdown(
    breakdown: SimulatorResult['coachFeedback']['scoreBreakdown'],
    fallbackScore: number,
  ): ScoreBreakdown {
    return {
      neutrality: this.clampScore(breakdown?.neutrality ?? fallbackScore),
      brevity: this.clampScore(breakdown?.brevity ?? fallbackScore),
      boundaryClarity: this.clampScore(breakdown?.boundaryClarity ?? fallbackScore),
      jadeAvoidance: this.clampScore(breakdown?.jadeAvoidance ?? fallbackScore),
      empathy: this.clampScore(breakdown?.empathy ?? fallbackScore),
    };
  }

  private weightedScore(breakdown: ScoreBreakdown): number {
    return Math.round(
      breakdown.neutrality * 0.3 +
      breakdown.boundaryClarity * 0.25 +
      breakdown.jadeAvoidance * 0.25 +
      breakdown.brevity * 0.1 +
      breakdown.empathy * 0.1
    );
  }

  private clampScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private labelForScore(score: number): string {
    if (score >= 90) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    return '需要练习';
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
      })),
      status: session.completed ? 'completed' : 'active',
      turnCount: session.turnsCount ?? session.turns.length,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.createdAt.toISOString(), // Use createdAt as fallback
    };
  }
}

// Singleton instance
export const simulatorService = new SimulatorService();
