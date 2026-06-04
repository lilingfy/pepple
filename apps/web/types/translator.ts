// 翻译器页面四态枚举
export type TranslatorStatus = 'idle' | 'analyzing' | 'result' | 'error';

// POST /api/decode 请求体
export interface DecodeRequest {
  text: string;
}

// 回复建议结构（包含策略标签）
export interface ReplySuggestions {
  A: string;
  B: string;
  C: string;
  strategy: {
    A: string;
    B: string;
    C: string;
  };
}

// POST /api/decode 标准响应
export interface DecodeResponse {
  surfaceMeaning: string;
  subtext: string;
  emotionStatus: string;
  emotionScore: number;
  replySuggestions: ReplySuggestions;
}

// POST /api/practice 请求体
export interface PracticeRequest {
  sourceType: 'decode' | 'simulator';
  primaryReply: string;
  content: {
    originalText: string;
    surfaceMeaning?: string;
    analysis?: {
      attackType?: string;
      scenario?: string;
      subtext?: string;
      emotionScore?: number;
      neutralityScore?: number;
      emotionStatus?: string;
    };
    replyOptions?: Array<{
      id: string;
      label: string;
      content: string;
      tone?: string;
    }>;
    selectedReplyId?: string;
    relationId?: string;
    relationName?: string;
    scenarioId?: string;
    scenarioName?: string;
    turns?: unknown[];
  };
}

// 错误类型
export type DecodeErrorCode =
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR';

export class DecodeError extends Error {
  constructor(
    public readonly code: DecodeErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DecodeError';
  }
}

// 情绪档位
export type EmotionTier = 'calm' | 'anxious' | 'stressed';

export function getEmotionTier(score: number): EmotionTier {
  if (score < 40) return 'calm';
  if (score <= 70) return 'anxious';
  return 'stressed';
}
