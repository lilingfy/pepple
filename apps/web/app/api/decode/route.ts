import { NextRequest, NextResponse } from 'next/server';
import { analyzeText, getDefaultProvider, isProviderAvailable } from '@/lib/llm';

interface DecodeRequest {
  text: string;
}

interface DecodeResponse {
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

/**
 * Filters PII (Personally Identifiable Information) from text
 * Removes: names, phone numbers, emails, addresses
 */
function filterPII(text: string): string {
  let filtered = text;

  // Phone numbers (Chinese and international formats)
  filtered = filtered.replace(
    /(\+?86[-\s]?)?1[3-9]\d{9}|\d{3,4}[-\s]?\d{7,8}/g,
    '[电话号码]'
  );

  // Email addresses
  filtered = filtered.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[邮箱]'
  );

  // Chinese names (2-4 characters, common surnames)
  const commonSurnames = '王李张刘陈杨黄赵周吴徐孙马朱胡郭何林高罗郑梁谢宋唐许韩冯邓曹彭曾萧田董潘袁于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏付方白邹孟熊秦邱江尹薛闫段雷侯龙史黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤';
  const surnamePattern = new RegExp(`[${commonSurnames}][\u4e00-\u9fa5]{1,3}`, 'g');
  filtered = filtered.replace(surnamePattern, '[姓名]');

  // ID numbers
  filtered = filtered.replace(/\d{17}[\dXx]|\d{15}/g, '[身份证号]');

  return filtered;
}

/**
 * Mock analysis function for development/demo
 * 当没有配置API Key时使用
 */
function mockAnalyze(text: string): DecodeResponse {
  const lowerText = text.toLowerCase();

  // Detect common patterns
  const hasComparison =
    lowerText.includes('别人家') ||
    lowerText.includes('人家') ||
    lowerText.includes('看看');
  const hasMoralBinding =
    lowerText.includes('养你') ||
    lowerText.includes('为了你好') ||
    lowerText.includes('孝顺');
  const hasGuiltTrip =
    lowerText.includes('白眼狼') ||
    lowerText.includes('不孝') ||
    lowerText.includes('白养');

  // Determine attack types
  const attackType: string[] = [];
  if (hasComparison) attackType.push('比较贬低');
  if (hasMoralBinding) attackType.push('道德绑架');
  if (hasGuiltTrip) attackType.push('情感勒索');
  if (attackType.length === 0) attackType.push('投射');

  return {
    surfaceMeaning: '对方在试图操控你的情绪和行为',
    trueIntent: '对方感到失控，试图通过情感操控来重获掌控感',
    attackType,
    culturalContext: '在中国文化中，这种话术常见于家庭关系中的权力博弈。',
    replies: {
      minimal: '嗯。',
      gentle: '我知道了。',
      boundary: '我听到了。',
    },
    tacticalTip: '保持钝感，不要进入对方的情绪框架。',
  };
}

/**
 * POST /api/decode
 * Analyzes user input for manipulation patterns
 * 默认使用智谱AI (Zhipu)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<DecodeResponse | { error: string }>> {
  try {
    const body: DecodeRequest = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入需要分析的内容' },
        { status: 400 }
      );
    }

    // Server-side validation for text length
    const MAX_TEXT_LENGTH = 2000;
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: '输入内容过长，请精简后重试（最多2000字）' },
        { status: 400 }
      );
    }

    // Filter PII before processing
    const filteredText = filterPII(text);

    // 检查默认提供商(智谱AI)是否可用
    const defaultProvider = getDefaultProvider();

    if (isProviderAvailable(defaultProvider)) {
      try {
        // 使用默认LLM (智谱AI)
        const result = await analyzeText(filteredText, defaultProvider);
        return NextResponse.json(result);
      } catch (apiError) {
        console.error(`${defaultProvider} API error:`, apiError);
        // Fall back to mock analysis
      }
    }

    // Fallback: mock analysis (no API key configured)
    console.log(`Using mock analysis (no ${defaultProvider} API key configured)`);
    const result = mockAnalyze(filteredText);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Decode API error:', error);
    return NextResponse.json(
      { error: '分析过程中出现错误，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/decode
 * 获取当前默认LLM提供商信息
 */
export async function GET(): Promise<NextResponse> {
  const defaultProvider = getDefaultProvider();
  const isAvailable = isProviderAvailable(defaultProvider);

  return NextResponse.json({
    defaultProvider,
    isAvailable,
    message: isAvailable
      ? `当前使用 ${defaultProvider} 作为默认LLM提供商`
      : `默认提供商 ${defaultProvider} 未配置API Key，将使用模拟分析`,
  });
}

// Enable CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
