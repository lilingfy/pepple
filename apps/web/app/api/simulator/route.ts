import { NextRequest, NextResponse } from 'next/server';
import scenarios from '@/public/scenarios.json';
import {
  simulateConversation,
  getDefaultProvider,
  isProviderAvailable,
} from '@/lib/llm';

interface SimulatorRequest {
  scenarioId: string;
  userMessage: string;
  history: Array<{ role: 'user' | 'antagonist'; content: string }>;
}

interface CoachFeedback {
  score: number;
  analysis: string;
  culturalContext: string;
  suggestion: string;
  betterReply: string;
}

interface SimulatorResponse {
  coachFeedback: CoachFeedback;
  nextAttack: string;
}

/**
 * Analyzes user message for JADE patterns (Justify, Argue, Defend, Explain)
 * 本地分析逻辑，作为LLM不可用的fallback
 */
function analyzeJADE(message: string): {
  hasJADE: boolean;
  jadeType?: string;
  neutralityScore: number;
} {
  const lowerMessage = message.toLowerCase();

  // Justify indicators
  const justifyPatterns = [
    '因为', '所以', '只不过', '只是', '但是', '不过',
    'because', 'but', 'however', 'only'
  ];

  // Argue indicators
  const arguePatterns = [
    '不是', '不对', '其实', '你错了', '你想错了', '不是你想的那样',
    'no', "you're wrong", 'actually', 'that\'s not true'
  ];

  // Defend indicators
  const defendPatterns = [
    '我已经', '我正在', '我有', '我会', '我做了',
    'i did', 'i have', 'i am', 'i was'
  ];

  // Explain indicators
  const explainPatterns = [
    '原因是', '其实我想', '我的意思是', '也就是说',
    'the reason is', 'what i mean', 'let me explain'
  ];

  const hasJustify = justifyPatterns.some((p) => lowerMessage.includes(p));
  const hasArgue = arguePatterns.some((p) => lowerMessage.includes(p));
  const hasDefend = defendPatterns.some((p) => lowerMessage.includes(p));
  const hasExplain = explainPatterns.some((p) => lowerMessage.includes(p));

  const hasJADE = hasJustify || hasArgue || hasDefend || hasExplain;

  let jadeType: string | undefined;
  if (hasArgue) jadeType = 'Argue (争辩)';
  else if (hasDefend) jadeType = 'Defend (辩解)';
  else if (hasExplain) jadeType = 'Explain (解释)';
  else if (hasJustify) jadeType = 'Justify (合理化)';

  // Calculate neutrality score (0-100)
  let score = 100;
  const messageLength = message.trim().split(/\s+/).length;

  // Deduct for JADE
  if (hasJADE) score -= 30;

  // Deduct for length (longer = more likely to be JADE)
  if (messageLength > 20) score -= 20;
  if (messageLength > 10) score -= 10;

  // Deduct for emotional words
  const emotionalPatterns = [
    '!', '！！', '!', '?!', '？!？？', '生气', '难过', '委屈',
    '很', '非常', '特别', '真的', '真的真的'
  ];
  const hasEmotional = emotionalPatterns.some((p) => message.includes(p));
  if (hasEmotional) score -= 15;

  // Bonus for neutral responses
  const neutralPatterns = [
    '嗯', '哦', '好', '知道了', '明白了', '了解',
    '我听到了', '收到', 'mhmm', 'ok', 'i see', 'understood'
  ];
  const hasNeutral = neutralPatterns.some((p) => lowerMessage.includes(p));
  if (hasNeutral && !hasJADE) score += 10;

  score = Math.max(0, Math.min(100, score));

  return { hasJADE, jadeType, neutralityScore: score };
}

/**
 * Generates cultural context based on scenario
 */
function getCulturalContext(scenarioId: string): string {
  const contexts: Record<string, string> = {
    parent_marriage_pressure:
      '中国文化中，父母常用"别人家孩子"来施压，制造焦虑感。',
    parent_career_interference:
      '中国父母认为"稳定"是最高优先级，公务员被视为"铁饭碗"。',
    partner_financial_control:
      '传统观念中，夫妻不分你我，但这常被用作操控手段。',
    partner_social_restriction:
      '"以家庭为重"常被用来限制个人社交自由。',
    boss_overtime_demands:
      '中国职场文化中，加班被视为"上进"和"忠诚"的表现。',
    relative_borrowing_money:
      '中国式人情社会，借钱不还常被包装为"亲情"。',
    in_law_comparison:
      '比较是婆媳关系中最常见的操控手段。',
    parent_guilt_trip:
      '"牺牲感"是中国式父母常见的情感操控方式。'
  };

  return contexts[scenarioId] || '这是一个典型的操控情境。';
}

/**
 * Generates suggestion based on JADE analysis
 */
function getSuggestion(hasJADE: boolean, jadeType?: string): string {
  if (!hasJADE) {
    return '做得很好！保持这种简短、中立的回应方式。';
  }

  const suggestions: Record<string, string> = {
    'Argue (争辩)':
      '不要试图改变对方的观点。争论只会让你看起来情绪化。',
    'Defend (辩解)':
      '对方不是真心寻求信息，辩解没有意义。试试"钝感法"。',
    'Explain (解释)':
      '解释会被对方当作新的攻击点。保持沉默或简短回应。',
    'Justify (合理化)':
      '你不需要向对方证明什么。一个简单的"嗯"就足够了。'
  };

  return suggestions[jadeType || ''] || '试试"钝感法"——保持简短、乏味、无情绪。';
}

/**
 * Generates a better reply based on the context
 */
function getBetterReply(hasJADE: boolean): string {
  if (!hasJADE) {
    return '你的回应已经很好了！';
  }

  const replies = [
    '嗯。',
    '哦。',
    '我知道了。',
    '明白了。',
    '我听到了。',
    '好的。',
    '收到。',
    '了解了。'
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

/**
 * Selects next attack from scenario
 */
function getNextAttack(scenarioId: string): string {
  const scenario = scenarios.scenarios.find((s) => s.id === scenarioId);
  if (!scenario || scenario.attacks.length === 0) {
    return '继续...';
  }

  return scenario.attacks[Math.floor(Math.random() * scenario.attacks.length)];
}

/**
 * 本地模拟分析（当LLM不可用时使用）
 */
function localSimulate(
  scenarioId: string,
  userMessage: string
): SimulatorResponse {
  // Analyze user message
  const { hasJADE, jadeType, neutralityScore } = analyzeJADE(userMessage);

  // Build response
  const coachFeedback: CoachFeedback = {
    score: neutralityScore,
    analysis: hasJADE
      ? `你在${jadeType}。这给了对方继续操控的机会。`
      : '很好！你保持了情绪边界。',
    culturalContext: getCulturalContext(scenarioId),
    suggestion: getSuggestion(hasJADE, jadeType),
    betterReply: getBetterReply(hasJADE)
  };

  const nextAttack = getNextAttack(scenarioId);

  return {
    coachFeedback,
    nextAttack
  };
}

/**
 * POST /api/simulator
 * Simulates a conversation scenario
 * 优先使用智谱AI (Zhipu)，不可用时使用本地分析
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SimulatorResponse | { error: string }>> {
  try {
    const body: SimulatorRequest = await request.json();
    const { scenarioId, userMessage, history } = body;

    // Validate scenario
    const scenario = scenarios.scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: 'Invalid scenario ID' },
        { status: 400 }
      );
    }

    // 检查默认LLM提供商(智谱AI)是否可用
    const defaultProvider = getDefaultProvider();

    if (isProviderAvailable(defaultProvider)) {
      try {
        // 使用Zhipu AI进行智能分析
        const result = await simulateConversation(
          scenarioId,
          userMessage,
          history,
          defaultProvider
        );
        return NextResponse.json(result);
      } catch (apiError) {
        console.error(`${defaultProvider} API error:`, apiError);
        // Fall back to local analysis
      }
    }

    // Fallback: 使用本地JADE分析
    console.log(`Using local analysis (no ${defaultProvider} API key configured)`);
    const result = localSimulate(scenarioId, userMessage);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Simulator API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/simulator
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
      : `默认提供商 ${defaultProvider} 未配置API Key，将使用本地分析`,
  });
}

// Enable CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
