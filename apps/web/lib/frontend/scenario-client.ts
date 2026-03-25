import type { ScenariosResponse, SimulatorResponse, EndSessionResponse } from '@/types/dojo';

// 获取场景列表
export async function getScenarios(): Promise<ScenariosResponse> {
  const response = await fetch('/api/scenarios');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取场景失败');
  }

  const result = await response.json();
  // API returns { success: true, data: { scenarios } }
  return result.data || result;
}