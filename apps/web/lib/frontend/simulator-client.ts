import type { SimulatorRequest, SimulatorResponse, EndSessionResponse } from '@/types/dojo';

const NETWORK_ERROR_MESSAGE = '网络连接失败，请检查本地服务或稍后重试';
const DEFAULT_SCORE_BREAKDOWN = {
  neutrality: 50,
  brevity: 50,
  boundaryClarity: 50,
  jadeAvoidance: 50,
  empathy: 50,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') return error.message;
    if ('error' in error) return getErrorMessage(error.error, fallback);
  }
  return fallback;
}

async function fetchSimulator(request: SimulatorRequest): Promise<Response> {
  try {
    return await fetch('/api/simulator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
}

// 开始新会话
export async function startSession(scenarioId: string): Promise<SimulatorResponse> {
  const response = await fetchSimulator({
    scenarioId,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, '启动会话失败'));
  }

  const result = await response.json();
  const data = result.data || result;

  // Map backend response to frontend format
  return {
    sessionId: data.session?.id || data.sessionId,
    aiResponse: data.reply || data.aiResponse,
    rightPanel: data.rightPanel || {
      analysisScore: data.analysis?.emotionScore || 50,
      analysisLabel: '一般',
      analysisSummary: data.analysis?.subtext || '',
      instantFeedback: '保持冷静，运用灰岩技巧',
      attentionPoint: '注意对方的情绪操控',
      scoreSource: 'fallback',
      scoreBreakdown: DEFAULT_SCORE_BREAKDOWN,
    },
  };
}

// 发送消息
export async function sendMessage(sessionId: string, message: string): Promise<SimulatorResponse> {
  const response = await fetchSimulator({
    sessionId,
    message,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, '发送消息失败'));
  }

  const result = await response.json();
  const data = result.data || result;

  // Map backend response to frontend format
  return {
    sessionId: data.session?.id || data.sessionId || sessionId,
    aiResponse: data.reply || data.aiResponse,
    rightPanel: data.rightPanel || {
      analysisScore: data.analysis?.emotionScore || 50,
      analysisLabel: '一般',
      analysisSummary: data.analysis?.subtext || '',
      instantFeedback: '保持冷静，运用灰岩技巧',
      attentionPoint: '注意对方的情绪操控',
      scoreSource: 'fallback',
      scoreBreakdown: DEFAULT_SCORE_BREAKDOWN,
    },
  };
}

// 重启会话
export async function restartSession(sessionId: string): Promise<SimulatorResponse> {
  const response = await fetchSimulator({
    sessionId,
    action: 'restart',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, '重启会话失败'));
  }

  const result = await response.json();
  const data = result.data || result;

  // Map backend response to frontend format
  return {
    sessionId: data.session?.id || data.sessionId || sessionId,
    aiResponse: data.reply || data.aiResponse,
    rightPanel: data.rightPanel || {
      analysisScore: data.analysis?.emotionScore || 50,
      analysisLabel: '一般',
      analysisSummary: data.analysis?.subtext || '',
      instantFeedback: '保持冷静，运用灰岩技巧',
      attentionPoint: '注意对方的情绪操控',
      scoreSource: 'fallback',
      scoreBreakdown: DEFAULT_SCORE_BREAKDOWN,
    },
  };
}

// 结束会话
export async function endSession(sessionId: string): Promise<EndSessionResponse> {
  const response = await fetchSimulator({
    sessionId,
    action: 'end',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, '结束会话失败'));
  }

  const result = await response.json();
  const data = result.data || result;

  // Map backend response to frontend format
  return {
    finalScore: data.summary?.averageNeutrality || data.finalScore || 50,
    overallFeedback: data.summary?.keyLearning || data.overallFeedback || '练习完成',
    improvements: data.improvements || [],
    sessionDuration: data.sessionDuration || 0,
  };
}
