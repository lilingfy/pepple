import { afterEach, describe, expect, it, vi } from 'vitest';
import { callNvidiaDecoder } from '@/lib/llm/nvidia';

describe('NVIDIA LLM provider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls the OpenAI-compatible chat completions endpoint and parses JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                surfaceMeaning: '表面是在批评你',
                trueIntent: '对方想让你感到愧疚',
                attackType: ['道德绑架'],
                culturalContext: '这利用了孝道压力',
                replies: {
                  minimal: '嗯。',
                  gentle: '我理解你的感受。',
                  boundary: '这件事我会自己决定。',
                },
                tacticalTip: '保持简短，不进入解释。',
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await callNvidiaDecoder('我养你这么大', 'test-key', {
      baseUrl: 'https://integrate.api.nvidia.com/v1/',
      model: 'z-ai/glm-5.1',
      systemPrompt: '请只返回 JSON',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.model).toBe('z-ai/glm-5.1');
    expect(body.stream).toBe(false);
    expect(result.replies.boundary).toBe('这件事我会自己决定。');
  });
});
