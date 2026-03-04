/**
 * Zhipu AI (智谱AI) Provider for Pebble
 * Uses glm-4-flash-250414 model
 */

import { DECODER_SYSTEM, SIMULATOR_SYSTEM } from './prompts';

export interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ZhipuResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const MODEL = 'glm-4-flash-250414';

/**
 * Call Zhipu AI API for decoder analysis
 */
export async function callZhipuDecoder(
  text: string,
  apiKey: string
): Promise<{
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
}> {
  const response = await fetch(ZHIPU_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: DECODER_SYSTEM },
        { role: 'user', content: `请分析以下对话：\n\n"${text}"` },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zhipu API error: ${response.status} - ${error}`);
  }

  const data: ZhipuResponse = await response.json();

  // Defensive check for API response structure
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Invalid response structure from Zhipu API');
  }

  // Try to parse JSON response
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                      content.match(/```\n?([\s\S]*?)\n?```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (e) {
    // Fallback: wrap the content in a default structure
    console.error('Failed to parse Zhipu response as JSON:', e);
    return {
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
    };
  }
}

/**
 * Call Zhipu AI API for simulator coaching
 */
export async function callZhipuSimulator(
  scenarioId: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'antagonist'; content: string }>,
  apiKey: string
): Promise<{
  coachFeedback: {
    score: number;
    analysis: string;
    culturalContext: string;
    suggestion: string;
    betterReply: string;
  };
  nextAttack: string;
}> {
  const historyStr = history.map(h => `${h.role}: ${h.content}`).join('\n');

  const response = await fetch(ZHIPU_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SIMULATOR_SYSTEM },
        {
          role: 'user',
          content: `场景: ${scenarioId}\n历史对话:\n${historyStr}\n\n用户回复: ${userMessage}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zhipu API error: ${response.status} - ${error}`);
  }

  const data: ZhipuResponse = await response.json();

  // Defensive check for API response structure
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Invalid response structure from Zhipu API');
  }

  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                      content.match(/```\n?([\s\S]*?)\n?```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Zhipu response as JSON:', e);
    return {
      coachFeedback: {
        score: 50,
        analysis: '解析失败',
        culturalContext: '',
        suggestion: '请重试',
        betterReply: '嗯。',
      },
      nextAttack: '继续说...',
    };
  }
}

/**
 * Test the Zhipu API connection
 */
export async function testZhipuConnection(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: '你好' },
        ],
        max_tokens: 10,
      }),
    });
    return response.ok;
  } catch (e) {
    console.error('Zhipu connection test failed:', e);
    return false;
  }
}
