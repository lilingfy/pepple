import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startSession } from '@/lib/frontend/simulator-client';
import { getScenarios } from '@/lib/frontend/scenario-client';

describe('simulator-client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('网络错误时为启动会话抛出友好错误而不是 Failed to fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(startSession('relationship')).rejects.toThrow('网络连接失败，请检查本地服务或稍后重试');
  });

  it('网络错误时为场景列表抛出友好错误而不是 Failed to fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(getScenarios()).rejects.toThrow('网络连接失败，请检查本地服务或稍后重试');
  });

  it('启动会话失败时显示后端返回的嵌套错误消息', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: '场景不存在' } }),
    }));

    await expect(startSession('relationship')).rejects.toThrow('场景不存在');
  });

  it('加载场景失败时显示后端返回的嵌套错误消息', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: '获取场景列表失败' } }),
    }));

    await expect(getScenarios()).rejects.toThrow('获取场景列表失败');
  });
});
