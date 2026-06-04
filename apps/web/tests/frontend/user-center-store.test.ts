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
});
