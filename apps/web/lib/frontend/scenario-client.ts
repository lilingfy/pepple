import type { ScenariosResponse } from '@/types/dojo';

const NETWORK_ERROR_MESSAGE = '网络连接失败，请检查本地服务或稍后重试';

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') return error.message;
    if ('error' in error) return getErrorMessage(error.error, fallback);
  }
  return fallback;
}

// 获取场景列表
export async function getScenarios(): Promise<ScenariosResponse> {
  let response: Response;
  try {
    response = await fetch('/api/scenarios');
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, '获取场景失败'));
  }

  const result = await response.json();
  // API returns { success: true, data: { scenarios } }
  return result.data || result;
}
