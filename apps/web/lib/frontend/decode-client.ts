import { DecodeError, type DecodeResponse } from '@/types/translator';
import type { DecodeRequest } from '@pebble/types';

const DECODE_TIMEOUT_MS = 35_000;

function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    }, ms);
  });
}

export async function decode(request: DecodeRequest): Promise<DecodeResponse> {
  const controller = new AbortController();

  const fetchPromise = fetch('/api/decode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: controller.signal,
  });

  let response: Response;
  try {
    response = await Promise.race([fetchPromise, createTimeoutPromise(DECODE_TIMEOUT_MS)]);
  } catch (error) {
    controller.abort();

    if (error instanceof DecodeError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new DecodeError('TIMEOUT', '请求超时，请稍后重试');
    }

    throw new DecodeError('NETWORK_ERROR', '网络连接失败，请检查网络');
  }

  if (!response.ok) {
    throw new DecodeError('HTTP_ERROR', `HTTP ${response.status}`);
  }

  try {
    const apiResponse = await response.json();
    const data = apiResponse.data || apiResponse;

    // Map backend response to frontend DecodeResponse format
    // Backend returns: surfaceMeaning, subtext, emotionStatus, emotionScore, replySuggestions
    const decodeResponse: DecodeResponse = {
      surfaceMeaning: data.surfaceMeaning || '',
      subtext: data.subtext || '',
      emotionStatus: data.emotionStatus || '一般场景',
      emotionScore: data.emotionScore || 50,
      replySuggestions: data.replySuggestions || {
        A: '',
        B: '',
        C: '',
        strategy: { A: '', B: '', C: '' },
      },
    };

    return decodeResponse;
  } catch {
    throw new DecodeError('PARSE_ERROR', '响应解析失败');
  }
}
