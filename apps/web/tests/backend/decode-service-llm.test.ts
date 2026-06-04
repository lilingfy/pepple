import { beforeEach, describe, expect, it, vi } from 'vitest';

const { analyzeTextWithLLM } = vi.hoisted(() => ({
  analyzeTextWithLLM: vi.fn(),
}));

vi.mock('@/lib/llm', () => ({
  analyzeText: analyzeTextWithLLM,
}));

vi.mock('@/lib/db', () => ({
  db: null,
}));

vi.mock('@/lib/backend/sessions/guest', () => ({
  getCurrentGuestSession: vi.fn(() => Promise.resolve(null)),
}));

import { analyzeText } from '@/lib/backend/services/decode-service';

describe('decode service LLM integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses LLM output for translator response when provider succeeds', async () => {
    analyzeTextWithLLM.mockResolvedValue({
      surfaceMeaning: '表面是在表达关心',
      trueIntent: '对方希望通过亏欠感影响你的选择',
      attackType: ['道德绑架'],
      culturalContext: '利用了家庭义务感',
      replies: {
        minimal: '嗯。',
        gentle: '我知道你是担心我。',
        boundary: '这件事我会自己决定。',
      },
      tacticalTip: '不要进入长篇解释。',
    });

    const result = await analyzeText({ text: '我养你这么大，你就这样对我？' });

    expect(analyzeTextWithLLM).toHaveBeenCalledWith(
      expect.stringContaining('我养你这么大'),
      expect.objectContaining({ systemPrompt: expect.stringContaining('输出格式') }),
    );
    expect(result.surfaceMeaning).toBe('表面是在表达关心');
    expect(result.subtext).toContain('亏欠感');
    expect(result.emotionStatus).toBe('道德绑架');
    expect(result.replySuggestions.A).toBe('嗯。');
    expect(result.replySuggestions.C).toBe('这件事我会自己决定。');
  });

  it('falls back to heuristic response when LLM fails', async () => {
    analyzeTextWithLLM.mockRejectedValue(new Error('provider unavailable'));

    const result = await analyzeText({ text: '你这个白眼狼，真是不孝。' });

    expect(result.emotionStatus).toBe('愧疚诱导');
    expect(result.replySuggestions.A).toBeTruthy();
    expect(result.emotionScore).toBeGreaterThan(0);
  });
});
