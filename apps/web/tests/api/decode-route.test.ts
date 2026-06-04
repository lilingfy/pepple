import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/decode/route';
import { NextRequest } from 'next/server';

// Mock LLM module
vi.mock('@/lib/llm', () => ({
  analyzeText: vi.fn(),
  getDefaultProvider: vi.fn(() => 'zhipu'),
  isProviderAvailable: vi.fn(() => false), // default to mock mode
}));

// Mock decode service to avoid real LLM calls
vi.mock('@/lib/backend/services/decode-service', () => ({
  analyzeText: vi.fn(async () => ({
    surfaceMeaning: '表面语义',
    subtext: '潜台词',
    emotionStatus: '一般场景',
    emotionScore: 45,
    replySuggestions: {
      A: '回复A',
      B: '回复B',
      C: '回复C',
      strategy: {
        A: '策略A',
        B: '策略B',
        C: '策略C',
      },
    },
  })),
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/decode', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/decode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('返回标准字段结构', async () => {
    const req = makeRequest({ text: '你怎么这么笨' });
    const res = await POST(req);
    const data = await res.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('surfaceMeaning');
    expect(data.data).toHaveProperty('subtext');
    expect(data.data).toHaveProperty('emotionStatus');
    expect(data.data).toHaveProperty('emotionScore');
    expect(data.data).toHaveProperty('replySuggestions');
    expect(data.data.replySuggestions).toHaveProperty('A');
    expect(data.data.replySuggestions).toHaveProperty('B');
    expect(data.data.replySuggestions).toHaveProperty('C');
    expect(data.data.replySuggestions).toHaveProperty('strategy');
    expect(data.data.replySuggestions.strategy).toHaveProperty('A');
    expect(data.data.replySuggestions.strategy).toHaveProperty('B');
    expect(data.data.replySuggestions.strategy).toHaveProperty('C');
  });

  it('不包含旧字段', async () => {
    const req = makeRequest({ text: '你怎么这么笨' });
    const res = await POST(req);
    const data = await res.json();

    expect(data.data).not.toHaveProperty('trueIntent');
    expect(data.data).not.toHaveProperty('attackType');
    expect(data.data).not.toHaveProperty('culturalContext');
    expect(data.data).not.toHaveProperty('tacticalTip');
    expect(data.data).not.toHaveProperty('replies');
  });

  it('空文本返回 400', async () => {
    const req = makeRequest({ text: '' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('emotionScore 是 0-100 的数字', async () => {
    const req = makeRequest({ text: '你怎么这么笨' });
    const res = await POST(req);
    const data = await res.json();
    expect(typeof data.data.emotionScore).toBe('number');
    expect(data.data.emotionScore).toBeGreaterThanOrEqual(0);
    expect(data.data.emotionScore).toBeLessThanOrEqual(100);
  });
});
