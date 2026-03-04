/**
 * Unified LLM Interface for Pebble
 * 统一的LLM调用接口，默认使用智谱AI
 */

import {
  LLMProvider,
  getDefaultProvider,
  getApiKey,
  isProviderAvailable,
} from './config';
import { callZhipuDecoder, callZhipuSimulator } from './zhipu';

export interface DecoderResult {
  surfaceMeaning: string;
  trueIntent: string;
  attackType: string[];
  culturalContext: string;
  replies: {
    minimal: string;
    gentle: string;
    boundary: string;
  };
  tacticalTip: string;
}

export interface SimulatorResult {
  coachFeedback: {
    score: number;
    analysis: string;
    culturalContext: string;
    suggestion: string;
    betterReply: string;
  };
  nextAttack: string;
}

/**
 * 分析文本中的操控模式（Decoder）
 * 默认使用Zhipu AI
 */
export async function analyzeText(
  text: string,
  provider: LLMProvider = getDefaultProvider()
): Promise<DecoderResult> {
  const apiKey = getApiKey(provider);

  if (!apiKey) {
    throw new Error(
      `LLM提供商 ${provider} 未配置API Key。请设置对应的环境变量。`
    );
  }

  switch (provider) {
    case 'zhipu':
      return callZhipuDecoder(text, apiKey);
    default:
      // 默认使用Zhipu
      return callZhipuDecoder(text, apiKey);
  }
}

/**
 * 模拟陪练场对话（Simulator）
 * 默认使用Zhipu AI
 */
export async function simulateConversation(
  scenarioId: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'antagonist'; content: string }>,
  provider: LLMProvider = getDefaultProvider()
): Promise<SimulatorResult> {
  const apiKey = getApiKey(provider);

  if (!apiKey) {
    throw new Error(
      `LLM提供商 ${provider} 未配置API Key。请设置对应的环境变量。`
    );
  }

  switch (provider) {
    case 'zhipu':
      return callZhipuSimulator(scenarioId, userMessage, history, apiKey);
    default:
      // 默认使用Zhipu
      return callZhipuSimulator(scenarioId, userMessage, history, apiKey);
  }
}

// Re-export types and config
export type { LLMProvider } from './config';
export {
  getDefaultProvider,
  getApiKey,
  isProviderAvailable,
} from './config';
