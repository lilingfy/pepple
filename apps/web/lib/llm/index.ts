/**
 * Unified LLM Interface for Pebble
 * 统一的LLM调用接口，默认使用 NVIDIA OpenAI-compatible endpoint
 */

import {
  LLMProvider,
  getDefaultProvider,
  getApiKey,
  isProviderAvailable,
  getProviderBaseUrl,
  getProviderModel,
} from './config';
import { callZhipuDecoder, callZhipuSimulator } from './zhipu';
import { callNvidiaDecoder, callNvidiaSimulator } from './nvidia';

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
    scoreBreakdown?: {
      neutrality: number;
      brevity: number;
      boundaryClarity: number;
      jadeAvoidance: number;
      empathy: number;
    };
    analysis: string;
    culturalContext: string;
    suggestion: string;
    betterReply: string;
  };
  nextAttack: string;
}

export interface AnalyzeTextOptions {
  provider?: LLMProvider;
  systemPrompt?: string;
}

export interface SimulateConversationOptions {
  provider?: LLMProvider;
}

/**
 * 分析文本中的操控模式（Decoder）
 * 默认使用配置的 LLM provider
 */
export async function analyzeText(
  text: string,
  options: LLMProvider | AnalyzeTextOptions = {},
): Promise<DecoderResult> {
  const provider = typeof options === 'string'
    ? options
    : options.provider || getDefaultProvider();
  const apiKey = getApiKey(provider);

  if (!apiKey) {
    throw new Error(
      `LLM提供商 ${provider} 未配置API Key。请设置对应的环境变量。`
    );
  }

  switch (provider) {
    case 'nvidia':
      return callNvidiaDecoder(text, apiKey, {
        baseUrl: getProviderBaseUrl(provider),
        model: getProviderModel(provider),
        systemPrompt: typeof options === 'string' ? undefined : options.systemPrompt,
      });
    case 'zhipu':
      return callZhipuDecoder(
        text,
        apiKey,
        typeof options === 'string' ? undefined : options.systemPrompt,
      );
    default:
      throw new Error(`LLM提供商 ${provider} 尚未实现 decoder 调用`);
  }
}

/**
 * 模拟陪练场对话（Simulator）
 * 默认使用配置的 LLM provider
 */
export async function simulateConversation(
  scenarioId: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'antagonist'; content: string }>,
  options: LLMProvider | SimulateConversationOptions = {},
): Promise<SimulatorResult> {
  const provider = typeof options === 'string'
    ? options
    : options.provider || getDefaultProvider();
  const apiKey = getApiKey(provider);

  if (!apiKey) {
    throw new Error(
      `LLM提供商 ${provider} 未配置API Key。请设置对应的环境变量。`
    );
  }

  switch (provider) {
    case 'nvidia':
      return callNvidiaSimulator(scenarioId, userMessage, history, apiKey, {
        baseUrl: getProviderBaseUrl(provider),
        model: getProviderModel(provider),
      });
    case 'zhipu':
      return callZhipuSimulator(scenarioId, userMessage, history, apiKey);
    default:
      throw new Error(`LLM提供商 ${provider} 尚未实现 simulator 调用`);
  }
}

// Re-export types and config
export type { LLMProvider } from './config';
export {
  getDefaultProvider,
  getApiKey,
  isProviderAvailable,
} from './config';
