/**
 * OpenRouter Provider for Pebble
 * Supports free models like stepfun/step-3.5-flash:free
 */

import { DECODER_SYSTEM } from './prompts';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'stepfun/step-3.5-flash:free';

/**
 * Call OpenRouter API for decoder analysis
 */
export async function callOpenRouterDecoder(
  text: string,
  apiKey: string,
  siteUrl?: string,
  siteName?: string
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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (siteUrl) {
    headers['HTTP-Referer'] = siteUrl;
  }
  if (siteName) {
    headers['X-OpenRouter-Title'] = siteName;
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: DECODER_SYSTEM },
        { role: 'user', content: `请分析以下对话：\n\n"${text}"` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data: OpenRouterResponse = await response.json();

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Invalid response structure from OpenRouter API');
  }

  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                      content.match(/```\n?([\s\S]*?)\n?```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();

    // Try to find JSON object boundaries if still not valid
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    const finalJsonStr = objectMatch ? objectMatch[0] : jsonStr;

    return JSON.parse(finalJsonStr);
  } catch (e) {
    console.error('Failed to parse OpenRouter response as JSON:', e);
    console.error('Raw content:', content);
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
 * Test the OpenRouter API connection
 */
export async function testOpenRouterConnection(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'user', content: '你好' },
        ],
        max_tokens: 10,
      }),
    });
    return response.ok;
  } catch (e) {
    console.error('OpenRouter connection test failed:', e);
    return false;
  }
}
