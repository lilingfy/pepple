/**
 * Decode Service
 * Business logic for text analysis and reply generation
 */

import { db } from '@/lib/db';
import { analysisLogs, relationNodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { buildDecoderSystemWithContext } from '@/lib/llm/prompts';
import { redactSensitiveText } from '../policy/pii';
import { withTimeout } from '../policy/timeout';
import { createBackendError } from '../errors';
import { getCurrentGuestSession } from '../sessions/guest';
import type { DecodeResponse, EmotionAnalysis, ReplyOption } from '@pebble/types';

interface AnalyzeOptions {
  text: string;
  context?: string;
  relationId?: string;
  skipPII?: boolean;
}

const FALLBACK_TIMEOUT_MS = 10000;

// Map attack types to Chinese emotion status
const attackTypeToChinese: Record<string, string> = {
  general: '一般场景',
  guilt_trip: '愧疚诱导',
  moral_binding: '道德绑架',
  comparison: '比较打压',
  personal_attack: '人身攻击',
  gaslighting: '煤气灯操控',
};

const scenarioToChinese: Record<string, string> = {
  general: '一般场景',
  manipulation: '操控型',
  obligation: '义务型',
  criticism: '批评型',
  invalidation: '否定型',
};

/**
 * Analyze text and generate reply suggestions
 * This is the main service function for decode endpoint
 */
export async function analyzeText(options: AnalyzeOptions): Promise<DecodeResponse> {
  const { text, context, relationId, skipPII = false } = options;

  // Validate input
  if (!text || text.trim().length === 0) {
    throw createBackendError('BAD_REQUEST', '请输入需要分析的内容');
  }

  const MAX_TEXT_LENGTH = 5000;
  if (text.length > MAX_TEXT_LENGTH) {
    throw createBackendError('BAD_REQUEST', `输入内容过长，最多${MAX_TEXT_LENGTH}字`);
  }

  // PII redaction
  const processedText = skipPII ? text : redactSensitiveText(text).redactedText;

  // Get or create guest session for tracking
  const guestSession = await getCurrentGuestSession();
  const guestSessionId = guestSession?.id ?? null;
  const relationContext = relationId ? await buildRelationContext(relationId) : '';
  const fullContext = [context, relationContext].filter(Boolean).join('\n\n');

  try {
    // Try LLM analysis with timeout
    const analysis = await withTimeout(
      performLLMAnalysis(processedText, fullContext),
      FALLBACK_TIMEOUT_MS,
      'LLM analysis timed out'
    );

    // Persist analysis log
    await persistAnalysisLog({
      guestSessionId,
      attackType: analysis.attackType,
      scenario: analysis.scenario,
      emotionScore: analysis.emotionScore,
      neutralityScore: analysis.neutralityScore,
    });

    // Generate reply options based on analysis
    const replyOptions = generateReplyOptions(analysis);

    // Map to frontend format
    const emotionStatus = attackTypeToChinese[analysis.attackType]
      || scenarioToChinese[analysis.scenario]
      || '一般场景';

    return {
      surfaceMeaning: text,
      subtext: analysis.subtext,
      emotionStatus,
      emotionScore: analysis.emotionScore,
      replySuggestions: {
        A: replyOptions[0]?.content || '',
        B: replyOptions[1]?.content || '',
        C: replyOptions[2]?.content || '',
        strategy: {
          A: replyOptions[0]?.label || '',
          B: replyOptions[1]?.label || '',
          C: replyOptions[2]?.label || '',
        },
      },
    };
  } catch (error) {
    console.error('LLM analysis failed, using fallback:', error);

    // Fallback to heuristic analysis
    const fallbackAnalysis = performHeuristicAnalysis(processedText, fullContext);

    // Persist fallback analysis
    await persistAnalysisLog({
      guestSessionId,
      attackType: fallbackAnalysis.attackType,
      scenario: fallbackAnalysis.scenario,
      emotionScore: fallbackAnalysis.emotionScore,
      neutralityScore: fallbackAnalysis.neutralityScore,
    });

    const replyOptions = generateReplyOptions(fallbackAnalysis);

    // Map to frontend format
    const emotionStatus = attackTypeToChinese[fallbackAnalysis.attackType]
      || scenarioToChinese[fallbackAnalysis.scenario]
      || '一般场景';

    return {
      surfaceMeaning: text,
      subtext: fallbackAnalysis.subtext,
      emotionStatus,
      emotionScore: fallbackAnalysis.emotionScore,
      replySuggestions: {
        A: replyOptions[0]?.content || '',
        B: replyOptions[1]?.content || '',
        C: replyOptions[2]?.content || '',
        strategy: {
          A: replyOptions[0]?.label || '',
          B: replyOptions[1]?.label || '',
          C: replyOptions[2]?.label || '',
        },
      },
    };
  }
}

async function buildRelationContext(relationId: string): Promise<string> {
  if (!db) return '';

  try {
    const [relation] = await db
      .select()
      .from(relationNodes)
      .where(eq(relationNodes.id, relationId))
      .limit(1);

    if (!relation) return '';

    const parts: string[] = [];
    if (relation.name) parts.push(`- 姓名：${relation.name}`);
    if (relation.relationshipType) parts.push(`- 关系类型：${relation.relationshipType}`);
    if (relation.对方特点) parts.push(`- 对方特点：${relation.对方特点}`);
    if (relation.期望结果) parts.push(`- 期望结果：${relation.期望结果}`);
    if (relation.情境补充) parts.push(`- 情境补充：${relation.情境补充}`);
    if (relation.generatedContext) parts.push(`- 系统生成画像：${relation.generatedContext}`);

    return parts.join('\n');
  } catch (error) {
    console.error('Failed to build relation context:', error);
    return '';
  }
}

/**
 * Perform LLM-based analysis
 * Placeholder for actual LLM integration
 */
async function performLLMAnalysis(
  text: string,
  context?: string
): Promise<EmotionAnalysis> {
  // This would call the actual LLM service
  // For now, return a mock result to maintain compatibility
  // TODO: Integrate with actual LLM service

  const hasContext = Boolean(context?.trim());
  const systemPrompt = buildDecoderSystemWithContext(context ?? '');
  void systemPrompt;

  const lowerText = text.toLowerCase();

  const hasComparison = lowerText.includes('别人家') || lowerText.includes('人家');
  const hasMoralBinding = lowerText.includes('养你') || lowerText.includes('为了你好');
  const hasGuiltTrip = lowerText.includes('白眼狼') || lowerText.includes('不孝');
  const hasAttack = lowerText.includes('笨') || lowerText.includes('废物');

  let emotionScore = 40;
  let attackType = 'general';
  let scenario = 'general';

  if (hasGuiltTrip) {
    emotionScore = 75;
    attackType = 'guilt_trip';
    scenario = 'manipulation';
  } else if (hasMoralBinding) {
    emotionScore = 60;
    attackType = 'moral_binding';
    scenario = 'obligation';
  } else if (hasComparison) {
    emotionScore = 55;
    attackType = 'comparison';
    scenario = 'criticism';
  } else if (hasAttack) {
    emotionScore = 65;
    attackType = 'personal_attack';
    scenario = 'criticism';
  }

  return {
    attackType,
    scenario,
    subtext: hasContext
      ? '结合当前关系背景，对方试图通过情感操控来影响你的行为'
      : '对方试图通过情感操控来影响你的行为',
    emotionScore,
    neutralityScore: 100 - emotionScore,
  };
}

/**
 * Heuristic analysis as fallback when LLM fails
 */
function performHeuristicAnalysis(text: string, context?: string): EmotionAnalysis {
  const lowerText = text.toLowerCase();

  // Keywords detection
  const patterns = {
    guiltTrip: ['白眼狼', '不孝', '白养', '忘恩负义', '没良心'],
    moralBinding: ['养你', '为了你好', '孝顺', '听话', '为你付出'],
    comparison: ['别人家', '看看人家', '不如', '比不上'],
    attack: ['笨', '废物', '没用', '蠢', '傻', '丢人'],
    gaslighting: ['太敏感', '想多了', '开不起玩笑', '小题大做'],
  };

  let scores = {
    guiltTrip: 0,
    moralBinding: 0,
    comparison: 0,
    attack: 0,
    gaslighting: 0,
  };

  for (const [type, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[type as keyof typeof scores] += 1;
      }
    }
  }

  // Determine primary attack type
  const entries = Object.entries(scores);
  const maxEntry = entries.reduce((max, curr) =>
    curr[1] > max[1] ? curr : max
  );

  const attackTypeMap: Record<string, string> = {
    guiltTrip: 'guilt_trip',
    moralBinding: 'moral_binding',
    comparison: 'comparison',
    attack: 'personal_attack',
    gaslighting: 'gaslighting',
  };

  const attackType = maxEntry[1] > 0 ? attackTypeMap[maxEntry[0]] : 'general';

  const scenarioMap: Record<string, string> = {
    guiltTrip: 'manipulation',
    moralBinding: 'obligation',
    comparison: 'criticism',
    attack: 'criticism',
    gaslighting: 'invalidation',
  };

  const scenario = maxEntry[1] > 0 ? scenarioMap[maxEntry[0]] : 'general';

  // Calculate emotion score (0-100, higher = more negative)
  const totalKeywords = Object.values(scores).reduce((a, b) => a + b, 0);
  const baseScore = Math.min(30 + totalKeywords * 15, 90);

  return {
    attackType,
    scenario,
    subtext: generateSubtext(attackType, scenario, Boolean(context?.trim())),
    emotionScore: baseScore,
    neutralityScore: 100 - baseScore,
  };
}

/**
 * Generate subtext based on attack type and scenario
 */
function generateSubtext(attackType: string, _scenario: string, hasContext = false): string {
  const subtexts: Record<string, string> = {
    guilt_trip: '对方感到失控，试图通过唤起愧疚感来重新获得控制权',
    moral_binding: '对方在用道德义务约束你，但真正的关心不需要 guilt',
    comparison: '对方的比较反映的是他们自己的焦虑，而非你的价值',
    personal_attack: '攻击性的言语背后是对方的无力感，不是你的问题',
    gaslighting: '对方在否认你的感受，这是操控的典型手法',
    general: '这段对话中可能存在隐含的操控意图，值得留意',
  };

  const baseSubtext = subtexts[attackType] || subtexts.general;
  return hasContext ? `结合当前关系背景，${baseSubtext}` : baseSubtext;
}

/**
 * Generate reply options based on analysis
 */
function generateReplyOptions(analysis: EmotionAnalysis): ReplyOption[] {
  const strategies: Record<string, Array<{ label: string; content: string; tone: ReplyOption['tone'] }>> = {
    guilt_trip: [
      { label: '确认感受', content: '我理解你的想法，让我消化一下。', tone: 'neutral' },
      { label: '温和边界', content: '我尊重你的感受，同时我也有自己的想法。', tone: 'assertive' },
      { label: '暂停对话', content: '现在不是讨论这个的好时机，我们改天再聊。', tone: 'assertive' },
    ],
    moral_binding: [
      { label: '表达感谢', content: '谢谢你的关心，我会考虑的。', tone: 'neutral' },
      { label: '明确选择', content: '我理解你的建议，但这是我需要自己做决定的事。', tone: 'assertive' },
      { label: '转移焦点', content: '我们先不聊这个，说说别的吧。', tone: 'neutral' },
    ],
    comparison: [
      { label: '不比较', content: '每个人情况不同，比较没有太大意义。', tone: 'assertive' },
      { label: '承认差异', content: '确实不一样，我们走自己的路。', tone: 'neutral' },
      { label: '幽默化解', content: '哈哈，那我确实是独一无二的。', tone: 'empathetic' },
    ],
    personal_attack: [
      { label: '不内化', content: '你有权发表看法，但我不接受这样的评价。', tone: 'assertive' },
      { label: '暂停', content: '这样的对话让我不舒服，我们先冷静一下。', tone: 'assertive' },
      { label: '最小回应', content: '嗯。', tone: 'neutral' },
    ],
    gaslighting: [
      { label: '坚持感受', content: '我的感受是真实的，不管你怎么说。', tone: 'assertive' },
      { label: '不争论', content: '我们有不同的看法，这很正常。', tone: 'neutral' },
      { label: '结束对话', content: '我觉得我们没有建设性沟通的余地了。', tone: 'assertive' },
    ],
    general: [
      { label: '中性回应', content: '我知道了，谢谢分享。', tone: 'neutral' },
      { label: '询问意图', content: '你这样说是什么意思呢？', tone: 'neutral' },
      { label: '保持距离', content: '让我想想，晚点回复你。', tone: 'neutral' },
    ],
  };

  const options = strategies[analysis.attackType] || strategies.general;

  return options.map((opt, index) => ({
    id: String.fromCharCode(97 + index), // a, b, c
    label: opt.label,
    content: opt.content,
    tone: opt.tone,
  }));
}

/**
 * Persist analysis log to database
 */
async function persistAnalysisLog(params: {
  guestSessionId: string | null;
  attackType: string;
  scenario: string;
  emotionScore: number;
  neutralityScore: number;
  }): Promise<void> {
  try {
    if (!db) return;
    await db.insert(analysisLogs).values({
      guestSessionId: params.guestSessionId,
      attackType: params.attackType,
      scenario: params.scenario,
      emotionScore: params.emotionScore,
      neutralityScore: params.neutralityScore,
    });
  } catch (error) {
    // Log but don't fail the request
    console.error('Failed to persist analysis log:', error);
  }
}
