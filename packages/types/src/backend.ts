/**
 * Backend DTO Types for Pebble
 * Shared types between frontend and backend
 */

// ==========================================
// Common Types
// ==========================================

export interface BackendErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: BackendErrorResponse };

// ==========================================
// Decode API Types
// ==========================================

export interface DecodeRequest {
  text: string;
  context?: string;
}

export interface DecodeResponse {
  surfaceMeaning: string;
  subtext: string;
  emotionStatus: string;
  emotionScore: number;
  replySuggestions: {
    A: string;
    B: string;
    C: string;
    strategy: {
      A: string;
      B: string;
      C: string;
    };
  };
}

// Internal analysis types (used by backend service)
export interface EmotionAnalysis {
  attackType: string;
  scenario: string;
  subtext: string;
  emotionScore: number;
  neutralityScore: number;
}

export interface ReplyOption {
  id: string;
  label: string;
  content: string;
  tone: 'neutral' | 'assertive' | 'empathetic';
}

// ==========================================
// Practice API Types
// ==========================================

export type PracticeSourceType = 'decode' | 'simulator';

export interface PracticeCreateRequest {
  sourceType: PracticeSourceType;
  primaryReply: string;
  content: PracticeContentDecode | PracticeContentSimulator;
}

export interface PracticeContentDecode {
  originalText: string;
  analysis: EmotionAnalysis;
  replyOptions: ReplyOption[];
}

export interface PracticeContentSimulator {
  scenarioId: string;
  scenarioName: string;
  turns: Array<{
    role: 'user' | 'assistant';
    content: string;
    analysis?: EmotionAnalysis;
  }>;
}

export interface PracticeEntry {
  id: string;
  sourceType: PracticeSourceType;
  primaryReply: string;
  content: PracticeContentDecode | PracticeContentSimulator;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeListResponse {
  entries: PracticeEntry[];
  total: number;
  hasMore: boolean;
}

export interface PracticeUpdateRequest {
  isFavorite?: boolean;
  isArchived?: boolean;
  primaryReply?: string;
}

// ==========================================
// Simulator API Types
// ==========================================

export interface ScenarioItem {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  initialMessage: string;
  context?: string;
  goal?: string;
  tips?: Array<{ name: string; description: string }>;
}

export interface SimulatorStartRequest {
  scenarioId: string;
}

export interface SimulatorContinueRequest {
  sessionId: string;
  message: string;
}

export interface SimulatorRestartRequest {
  sessionId: string;
}

export interface SimulatorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  analysis?: EmotionAnalysis;
}

export interface SimulatorSession {
  id: string;
  scenarioId: string;
  scenarioName: string;
  messages: SimulatorMessage[];
  status: 'active' | 'completed' | 'restarted';
  turnCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatorResponse {
  session: SimulatorSession;
  reply: string;
  rightPanel: {
    analysisScore: number;
    analysisLabel: string;
    analysisSummary: string;
    instantFeedback: string;
    attentionPoint: string;
  };
}

export interface SimulatorEndResponse {
  session: SimulatorSession;
  summary: {
    totalTurns: number;
    averageNeutrality: number;
    keyLearning: string;
  };
}

export interface SessionSnapshot {
  id: string;
  scenarioName: string;
  messageCount: number;
  lastMessage: string;
  updatedAt: string;
}

// ==========================================
// Guest Session Types
// ==========================================

export interface GuestSession {
  id: string;
  sessionToken: string;
  userId: string | null;
  expiresAt: string;
  createdAt: string;
}

// ==========================================
// Utility Types
// ==========================================

export type PaginatedRequest = {
  cursor?: string;
  limit?: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
};
