import type { Difficulty, RightPanel } from '@/types/dojo';

// 场景数据结构
export interface ScenarioDTO {
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

// GET /api/scenarios 响应
export interface ScenariosResponseDTO {
  scenarios: ScenarioDTO[];
}

// POST /api/simulator 请求
export interface SimulatorRequestDTO {
  scenarioId: string;
  sessionId?: string;
  message?: string;
  action?: 'restart';
}

// POST /api/simulator 响应
export interface SimulatorResponseDTO {
  sessionId: string;
  aiResponse: string;
  rightPanel: RightPanel;
}

// POST /api/simulator/[sessionId]/end 响应
export interface EndSessionResponseDTO {
  finalScore: number;
  overallFeedback: string;
  improvements: string[];
  sessionDuration: number;
}

// 错误响应
export interface ErrorResponseDTO {
  error: string;
  code?: string;
}
