import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/decode/route';
import { NextRequest } from 'next/server';

// Mock LLM module
vi.mock('@/lib/llm', () => ({
  analyzeText: vi.fn(),
  getDefaultProvider: vi.fn(() => 'zhipu'),
  isProviderAvailable: vi.fn(() => false), // default to mock mode
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/decode', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/decode', () => {
  it('返回标准字段结构', async () => {
    const req = makeRequest({ text: '你怎么这么笨' });
    const res = await POST(req);
    const data = await res.json();

    expect(data).toHaveProperty('surfaceMeaning');
    expect(data).toHaveProperty('subtext');
    expect(data).toHaveProperty('emotionStatus');
    expect(data).toHaveProperty('emotionScore');
    expect(data).toHaveProperty('replySuggestions');
    expect(data.replySuggestions).toHaveProperty('A');
    expect(data.replySuggestions).toHaveProperty('B');
    expect(data.replySuggestions).toHaveProperty('C');
    expect(data.replySuggestions).toHaveProperty('strategy');
    expect(data.replySuggestions.strategy).toHaveProperty('A');
    expect(data.replySuggestions.strategy).toHaveProperty('B');
    expect(data.replySuggestions.strategy).toHaveProperty('C');
  });

  it('不包含旧字段', async () => {
    const req = makeRequest({ text: '你怎么这么笨' });
    const res = await POST(req);
    const data = await res.json();

    expect(data).not.toHaveProperty('trueIntent');
    expect(data).not.toHaveProperty('attackType');
    expect(data).not.toHaveProperty('culturalContext');
    expect(data).not.toHaveProperty('tacticalTip');
    expect(data).not.toHaveProperty('replies');
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
    expect(typeof data.emotionScore).toBe('number');
    expect(data.emotionScore).toBeGreaterThanOrEqual(0);
    expect(data.emotionScore).toBeLessThanOrEqual(100);
  });
});
