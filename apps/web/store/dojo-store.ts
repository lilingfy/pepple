import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  DojoStore,
  Message,
  RightPanel,
  Scenario,
  SessionStatus,
} from '@/types/dojo';
import { getScenarios } from '@/lib/frontend/scenario-client';
import {
  startSession as startSessionApi,
  sendMessage as sendMessageApi,
  restartSession as restartSessionApi,
  endSession as endSessionApi,
} from '@/lib/frontend/simulator-client';

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 初始状态
const initialState = {
  currentScenario: null,
  scenarios: [],
  messages: [],
  isTyping: false,
  rightPanel: null,
  sessionId: null,
  sessionStatus: 'idle' as SessionStatus,
  startTime: null,
  scenarioSessions: {},
  error: null,
};

function saveCurrentScenarioSession(state: DojoStore) {
  if (!state.currentScenario) return;

  state.scenarioSessions[state.currentScenario.id] = {
    currentScenario: state.currentScenario,
    messages: state.messages.slice(),
    rightPanel: state.rightPanel ? { ...state.rightPanel } : null,
    sessionId: state.sessionId,
    sessionStatus: state.sessionStatus,
    startTime: state.startTime,
  };
}

function hasAssistantOpening(messages: Message[]) {
  return messages.some((message) => message.role === 'assistant' && message.content.trim().length > 0);
}

function isRestorableActiveSession(session: DojoStore['scenarioSessions'][string] | undefined) {
  return Boolean(
    session?.sessionStatus === 'active' &&
    session.sessionId &&
    hasAssistantOpening(session.messages)
  );
}

export const useDojoStore = create<DojoStore>()(
  immer((set, get) => ({
    ...initialState,

    // 选择场景 - 恢复未结束会话；无会话或已结束则开始新会话
    selectScenario: async (scenario: Scenario) => {
      const current = get();
      const cachedSession = current.scenarioSessions[scenario.id];

      if (current.currentScenario?.id === scenario.id && current.sessionStatus === 'active') {
        return;
      }

      if (isRestorableActiveSession(cachedSession)) {
        set((state) => {
          saveCurrentScenarioSession(state);
          state.currentScenario = cachedSession.currentScenario;
          state.messages = cachedSession.messages.slice();
          state.rightPanel = cachedSession.rightPanel ? { ...cachedSession.rightPanel } : null;
          state.sessionId = cachedSession.sessionId;
          state.sessionStatus = cachedSession.sessionStatus;
          state.startTime = cachedSession.startTime;
          state.error = null;
          state.isTyping = false;
        });
        return;
      }

      set((state) => {
        saveCurrentScenarioSession(state);
        state.currentScenario = scenario;
        state.sessionId = null;
        state.sessionStatus = 'active';
        state.startTime = new Date();
        state.messages = [];
        state.rightPanel = null;
        state.error = null;
        state.isTyping = true;
      });

      try {
        // 调用 API 开始新会话
        const response = await startSessionApi(scenario.id);
        set((state) => {
          state.sessionId = response.sessionId;
          state.isTyping = false;
          // 添加 AI 开场白
          state.messages.push({
            id: generateId(),
            role: 'assistant',
            content: response.aiResponse,
            timestamp: new Date(),
          });
          // 更新右侧面板（如果有）
          if (response.rightPanel) {
            state.rightPanel = response.rightPanel;
          }
          saveCurrentScenarioSession(state);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '启动会话失败';
        set((state) => {
          state.isTyping = false;
          state.error = message;
          state.sessionStatus = 'idle';
          saveCurrentScenarioSession(state);
        });
      }
    },

    // 加载场景列表
    loadScenarios: async () => {
      try {
        const response = await getScenarios();
        set((state) => {
          state.scenarios = response.scenarios;
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '加载场景失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    // 发送消息
    sendMessage: async (content: string) => {
      const { sessionId, currentScenario, sessionStatus } = get();

      if (!sessionId || sessionStatus !== 'active') {
        set((state) => {
          state.error = '会话未开始或已结束';
        });
        return;
      }

      if (!content.trim()) {
        set((state) => {
          state.error = '消息不能为空';
        });
        return;
      }

      // 添加用户消息
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      set((state) => {
        state.messages.push(userMessage);
        state.isTyping = true;
        state.error = null;
        saveCurrentScenarioSession(state);
      });

      try {
        // 调用 API 发送消息
        const response = await sendMessageApi(sessionId, content.trim());
        set((state) => {
          state.isTyping = false;
          // 添加 AI 回复
          state.messages.push({
            id: generateId(),
            role: 'assistant',
            content: response.aiResponse,
            timestamp: new Date(),
          });
          // 更新右侧面板
          state.rightPanel = response.rightPanel;
          // 更新用户消息的得分
          const userMessages = state.messages.filter(
            (m) => m.role === 'user' && m.id === userMessage.id
          );
          const lastUserMessage = userMessages[userMessages.length - 1];
          if (lastUserMessage && response.rightPanel.analysisScore !== null) {
            lastUserMessage.emotionScore = response.rightPanel.analysisScore;
          }
          saveCurrentScenarioSession(state);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '发送消息失败';
        set((state) => {
          state.isTyping = false;
          state.error = message;
          saveCurrentScenarioSession(state);
        });
      }
    },

    // 重启会话
    restartSession: async () => {
      const { sessionId, currentScenario } = get();

      if (!sessionId || !currentScenario) {
        set((state) => {
          state.error = '没有可重启的会话';
        });
        return;
      }

      set((state) => {
        state.isTyping = true;
        state.error = null;
        state.messages = [];
        state.rightPanel = null;
      });

      try {
        const response = await restartSessionApi(sessionId);
        set((state) => {
          state.sessionId = response.sessionId;
          state.isTyping = false;
          // 添加新的开场白
          state.messages.push({
            id: generateId(),
            role: 'assistant',
            content: response.aiResponse,
            timestamp: new Date(),
          });
          if (response.rightPanel) {
            state.rightPanel = response.rightPanel;
          }
          saveCurrentScenarioSession(state);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '重启会话失败';
        set((state) => {
          state.isTyping = false;
          state.error = message;
          saveCurrentScenarioSession(state);
        });
      }
    },

    // 结束会话
    endSession: async () => {
      const { sessionId, sessionStatus } = get();

      if (!sessionId) {
        set((state) => {
          state.error = '没有可结束的会话';
          state.sessionStatus = 'idle';
        });
        return;
      }

      if (sessionStatus !== 'active') {
        return;
      }

      try {
        const response = await endSessionApi(sessionId);
        set((state) => {
          state.sessionStatus = 'ended';
          state.error = null;
          saveCurrentScenarioSession(state);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '结束会话失败';
        set((state) => {
          state.error = message;
          saveCurrentScenarioSession(state);
        });
      }
    },

    // 重置错误
    resetError: () => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);
