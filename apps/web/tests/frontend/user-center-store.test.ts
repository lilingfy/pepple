import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserCenterStore } from '@/store/user-center-store';

const relation = {
  id: 'relation-1',
  userId: 'user-1',
  name: '我的老板',
  tags: ['职场'],
  relationshipType: '老板',
  对方特点: '经常否定我',
  期望结果: '减少冲突',
  情境补充: null,
  generatedContext: null,
  position: 0,
  createdAt: '2026-03-27T00:00:00Z',
  updatedAt: '2026-03-27T00:00:00Z',
};

describe('useUserCenterStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useUserCenterStore.setState({ selectedRelationId: null, selectedRelation: null });
  });

  it('loads selected relation from API response data instead of storing the wrapper object', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: relation }),
    } as Response);

    useUserCenterStore.setState({ selectedRelationId: relation.id, selectedRelation: null });

    await useUserCenterStore.getState().loadSelectedRelation();

    expect(useUserCenterStore.getState().selectedRelation).toEqual(relation);
    expect(useUserCenterStore.getState().selectedRelation?.name.charAt(0)).toBe('我');
  });

  it('clears selected relation when API returns 401 unauthorized and does not log to console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '未登录', requestId: 'req-1' },
      }),
    } as Response);

    useUserCenterStore.setState({ selectedRelationId: relation.id, selectedRelation: relation });

    await useUserCenterStore.getState().loadSelectedRelation();

    expect(useUserCenterStore.getState().selectedRelationId).toBeNull();
    expect(useUserCenterStore.getState().selectedRelation).toBeNull();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('logs error and keeps selectedRelationId on generic API failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '服务器错误', requestId: 'req-1' },
      }),
    } as Response);

    useUserCenterStore.setState({ selectedRelationId: relation.id, selectedRelation: null });

    await useUserCenterStore.getState().loadSelectedRelation();

    expect(useUserCenterStore.getState().selectedRelationId).toBe(relation.id);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
