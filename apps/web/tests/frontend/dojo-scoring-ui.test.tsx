import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmotionScoreCard } from '@/components/dojo/EmotionScoreCard';
import type { RightPanel } from '@/types/dojo';

const { state } = vi.hoisted(() => ({
  state: { rightPanel: null as RightPanel | null },
}));

vi.mock('@/store/dojo-store', () => ({
  useDojoStore: () => state,
}));

describe('EmotionScoreCard', () => {
  beforeEach(() => {
    state.rightPanel = null;
  });

  it('keeps the original score card shape before the first user reply', () => {
    state.rightPanel = {
      analysisScore: null,
      analysisLabel: '待评分',
      analysisSummary: '等待你的第一句回应后开始评分。',
      instantFeedback: '先观察对方的话术。',
      attentionPoint: '注意对方的情绪操控意图。',
      scoreSource: 'pending',
    };

    render(<EmotionScoreCard />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('中性度得分: 需改进')).toBeInTheDocument();
    expect(screen.queryByText('等待评分')).not.toBeInTheDocument();
  });

  it('keeps scored state in the original compact score card layout', () => {
    state.rightPanel = {
      analysisScore: 88,
      analysisLabel: '良好',
      analysisSummary: '你保持了边界，没有过度解释。',
      instantFeedback: '继续使用短句确认边界。',
      attentionPoint: '可以尝试这样回应。',
      scoreSource: 'ai',
      scoreBreakdown: {
        neutrality: 90,
        brevity: 85,
        boundaryClarity: 88,
        jadeAvoidance: 92,
        empathy: 75,
      },
    };

    render(<EmotionScoreCard />);

    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('中性度得分: 优秀')).toBeInTheDocument();
    expect(screen.queryByText('AI 教练评分')).not.toBeInTheDocument();
    expect(screen.queryByText('边界清晰')).not.toBeInTheDocument();
    expect(screen.getByText('你保持了边界，没有过度解释。')).toBeInTheDocument();
  });

  it('shows moderately long analysis text completely in the compact score card', () => {
    const longSummary = '用户回复“我知道后果”虽然简短，但隐含了辩解和解释的痕迹，暗示在回应对方的道德指控，试图证明自己有认知。';

    state.rightPanel = {
      analysisScore: 88,
      analysisLabel: '良好',
      analysisSummary: longSummary,
      instantFeedback: '继续使用短句确认边界。',
      attentionPoint: '可以尝试这样回应。',
      scoreSource: 'ai',
    };

    render(<EmotionScoreCard />);

    expect(screen.getByText(longSummary)).toBeInTheDocument();
  });

  it('truncates unusually long analysis text so the compact score card does not overflow', () => {
    const veryLongSummary = '你这次回应整体稳定，能够表达自己的边界，但中间仍然加入了一些解释，容易让对方继续抓住细节进行拉扯，所以最好把回应压缩成一句清楚的边界，避免继续证明自己是对的，也不要进入对方设定的道德审判框架。后续可以只保留决定，不回应评价，也不补充理由。若对方继续施压，可以重复同一句边界，不添加背景细节。';

    state.rightPanel = {
      analysisScore: 88,
      analysisLabel: '良好',
      analysisSummary: veryLongSummary,
      instantFeedback: '继续使用短句确认边界。',
      attentionPoint: '可以尝试这样回应。',
      scoreSource: 'ai',
    };

    render(<EmotionScoreCard />);

    expect(screen.getByText(`${Array.from(veryLongSummary).slice(0, 120).join('')}…`)).toBeInTheDocument();
  });

  it('does not expand the score card for deterministic fallback details', () => {
    state.rightPanel = {
      analysisScore: 64,
      analysisLabel: '一般',
      analysisSummary: '方向是对的，但还可以更短。',
      instantFeedback: '减少解释。',
      attentionPoint: '注意 JADE。',
      scoreSource: 'rule',
      scoreBreakdown: {
        neutrality: 70,
        brevity: 55,
        boundaryClarity: 60,
        jadeAvoidance: 62,
        empathy: 65,
      },
    };

    render(<EmotionScoreCard />);

    expect(screen.getByText('64')).toBeInTheDocument();
    expect(screen.getByText('中性度得分: 良好')).toBeInTheDocument();
    expect(screen.queryByText('基础规则评分')).not.toBeInTheDocument();
    expect(screen.queryByText('情绪中立')).not.toBeInTheDocument();
  });
});
