// 陪练场会话状态枚举
export type SessionStatus = 'idle' | 'active' | 'ended';

// 场景难度
export type Difficulty = 'easy' | 'medium' | 'hard';

// 情绪得分等级
export type ScoreLevel = 'excellent' | 'good' | 'average' | 'needs-improvement';
export type ScoreSource = 'pending' | 'ai' | 'rule' | 'fallback';

export interface ScoreBreakdown {
  neutrality: number;
  brevity: number;
  boundaryClarity: number;
  jadeAvoidance: number;
  empathy: number;
}

// 场景数据结构
export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  context: string;
  goal: string;
  tips: Array<{
    name: string;
    description: string;
  }>;
}

// 消息角色
export type MessageRole = 'assistant' | 'user';

// 消息数据结构
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  emotionScore?: number; // 用户消息的情绪得分
}

// 实时分析面板数据
export interface RightPanel {
  analysisScore: number | null; // 0-100; null until first user reply
  analysisLabel: string; // 优秀/良好/一般/需改进
  analysisSummary: string; // 评语
  instantFeedback: string; // 即时反馈
  attentionPoint: string; // 注意点
  scoreSource?: ScoreSource; // 评分来源
  scoreBreakdown?: ScoreBreakdown; // 多维评分
}

// GET /api/scenarios 响应
export interface ScenariosResponse {
  scenarios: Scenario[];
}

// POST /api/simulator 请求
export interface SimulatorRequest {
  scenarioId?: string;
  sessionId?: string; // 首次为空，后续携带
  message?: string; // 用户回复内容
  action?: 'restart' | 'end'; // 重启或结束标记
}

// POST /api/simulator 响应
export interface SimulatorResponse {
  sessionId: string;
  aiResponse: string;
  rightPanel: RightPanel;
}

// POST /api/simulator/[sessionId]/end 响应
export interface EndSessionResponse {
  finalScore: number;
  overallFeedback: string;
  improvements: string[];
  sessionDuration: number; // 秒
}

// 陪练场状态
export interface DojoState {
  // 场景
  currentScenario: Scenario | null;
  scenarios: Scenario[];

  // 消息
  messages: Message[];
  isTyping: boolean;

  // 实时分析
  rightPanel: RightPanel | null;

  // 会话
  sessionId: string | null;
  sessionStatus: SessionStatus;
  startTime: Date | null;

  // 错误
  error: string | null;
}

// 陪练场动作
export interface DojoActions {
  // 场景选择
  selectScenario: (scenario: Scenario) => void;
  loadScenarios: () => Promise<void>;

  // 消息发送
  sendMessage: (content: string) => Promise<void>;

  // 会话控制
  restartSession: () => Promise<void>;
  endSession: () => Promise<void>;
  resetError: () => void;
}

// 完整 Store 类型
export type DojoStore = DojoState & DojoActions;

// 根据分数获取等级
export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'needs-improvement';
}

// 根据等级获取颜色
export function getScoreColor(level: ScoreLevel): string {
  const colors: Record<ScoreLevel, string> = {
    excellent: '#A8D8B9', // 安全绿
    good: '#FCD34D', // 黄色
    average: '#FB923C', // 橙色
    'needs-improvement': '#F87171', // 红色
  };
  return colors[level];
}

// 根据等级获取标签文本
export function getScoreLabel(level: ScoreLevel): string {
  const labels: Record<ScoreLevel, string> = {
    excellent: '优秀',
    good: '良好',
    average: '一般',
    'needs-improvement': '需改进',
  };
  return labels[level];
}

// 错误类型
export type DojoErrorCode =
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'SESSION_NOT_FOUND';

export class DojoError extends Error {
  constructor(
    public readonly code: DojoErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DojoError';
  }
}
