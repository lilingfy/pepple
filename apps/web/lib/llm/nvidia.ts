/**
 * NVIDIA OpenAI-compatible provider for Pebble.
 *
 * The provider intentionally uses raw fetch instead of adding an SDK so the
 * rest of the app can keep one provider abstraction and swap endpoints later.
 */

import { DECODER_SYSTEM, SIMULATOR_SYSTEM } from './prompts';

interface NvidiaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NvidiaResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export interface NvidiaDecoderResult {
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

export interface NvidiaSimulatorResult {
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

const DEFAULT_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const DEFAULT_MODEL = 'qwen/qwen3-next-80b-a3b-instruct';

export async function callNvidiaDecoder(
  text: string,
  apiKey: string,
  options: {
    baseUrl?: string;
    model?: string;
    systemPrompt?: string;
  } = {},
): Promise<NvidiaDecoderResult> {
  const content = await callNvidiaChat({
    apiKey,
    baseUrl: options.baseUrl,
    model: options.model,
    messages: [
      { role: 'system', content: options.systemPrompt || DECODER_SYSTEM },
      { role: 'user', content: `请分析以下对话：\n\n"${text}"` },
    ],
    maxTokens: 2000,
  });

  return parseJsonOrFallback<NvidiaDecoderResult>(content, {
    surfaceMeaning: content.substring(0, 100) + '...',
    trueIntent: '解析失败，请重试',
    attackType: ['未知'],
    culturalContext: '',
    replies: {
      minimal: '嗯。',
      gentle: '我知道了。',
      boundary: '我需要考虑一下。',
    },
    tacticalTip: '保持冷静，简短回应。',
  });
}

export async function callNvidiaSimulator(
  scenarioId: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'antagonist'; content: string }>,
  apiKey: string,
  options: {
    baseUrl?: string;
    model?: string;
  } = {},
): Promise<NvidiaSimulatorResult> {
  const historyStr = history.map((h) => `${h.role}: ${h.content}`).join('\n');
  const content = await callNvidiaChat({
    apiKey,
    baseUrl: options.baseUrl,
    model: options.model,
    messages: [
      { role: 'system', content: SIMULATOR_SYSTEM },
      {
        role: 'user',
        content: `场景: ${scenarioId}\n历史对话:\n${historyStr}\n\n用户回复: ${userMessage}`,
      },
    ],
    maxTokens: 1200,
  });

  return parseJsonOrFallback<NvidiaSimulatorResult>(content, {
    coachFeedback: {
      score: 50,
      scoreBreakdown: {
        neutrality: 50,
        brevity: 50,
        boundaryClarity: 50,
        jadeAvoidance: 50,
        empathy: 50,
      },
      analysis: '解析失败',
      culturalContext: '',
      suggestion: '请重试',
      betterReply: '嗯。',
    },
    nextAttack: '继续说...',
  });
}

async function callNvidiaChat(params: {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  messages: NvidiaMessage[];
  maxTokens: number;
}): Promise<string> {
  const baseUrl = (params.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model || DEFAULT_MODEL,
      messages: params.messages,
      temperature: 0.7,
      top_p: 1,
      max_tokens: params.maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as NvidiaResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Invalid response structure from NVIDIA API');
  }
  return content;
}

function parseJsonOrFallback<T>(content: string, fallback: T): T {
  try {
    const codeBlockMatch =
      content.match(/```json\n?([\s\S]*?)\n?```/) ||
      content.match(/```\n?([\s\S]*?)\n?```/);
    const candidate = (codeBlockMatch ? codeBlockMatch[1] : content).trim();
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    return JSON.parse(objectMatch ? objectMatch[0] : candidate) as T;
  } catch (error) {
    console.error('Failed to parse NVIDIA response as JSON:', error);
    return fallback;
  }
}
