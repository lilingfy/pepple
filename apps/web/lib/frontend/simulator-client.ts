import type { SimulatorRequest, SimulatorResponse, EndSessionResponse } from '@/types/dojo';

// 开始新会话
export async function startSession(scenarioId: string): Promise<SimulatorResponse> {
  const response = await fetch('/api/simulator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      scenarioId,
    } as SimulatorRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '启动会话失败');
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
    },
  };
}

// 发送消息
export async function sendMessage(sessionId: string, message: string): Promise<SimulatorResponse> {
  const response = await fetch('/api/simulator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      message,
    } as SimulatorRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '发送消息失败');
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
    },
  };
}

// 重启会话
export async function restartSession(sessionId: string): Promise<SimulatorResponse> {
  const response = await fetch('/api/simulator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      action: 'restart',
    } as SimulatorRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '重启会话失败');
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
    },
  };
}

// 结束会话
export async function endSession(sessionId: string): Promise<EndSessionResponse> {
  const response = await fetch('/api/simulator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      action: 'end',
    } as SimulatorRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '结束会话失败');
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
