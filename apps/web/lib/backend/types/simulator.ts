import type { RightPanel } from '@/types/dojo';

// 会话数据结构
export interface Session {
  id: string;
  scenarioId: string;
  messages: Array<{
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}

// AI 服务响应
export interface AIServiceResponse {
  aiResponse: string;
  rightPanel: RightPanel;
}

// 情绪分析结果
export interface EmotionAnalysis {
  score: number;
  label: string;
  summary: string;
  feedback: string;
  attention: string;
}
