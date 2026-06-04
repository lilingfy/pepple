import { beforeEach, describe, expect, it, vi } from 'vitest';

const { returning, values, insert, deleteReturning, deleteWhere, deleteFn } = vi.hoisted(() => {
  const returning = vi.fn();
  const values = vi.fn(() => ({ returning }));
  const insert = vi.fn(() => ({ values }));

  const deleteReturning = vi.fn();
  const deleteWhere = vi.fn(() => ({ returning: deleteReturning }));
  const deleteFn = vi.fn(() => ({ where: deleteWhere }));

  return { returning, values, insert, deleteReturning, deleteWhere, deleteFn };
});

vi.mock('@/lib/db', () => ({
  db: {
    insert,
    delete: deleteFn,
  },
}));

import { findFirstAvailablePosition, RelationRepository } from '@/lib/backend/repositories/relation-repository';

describe('RelationRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('创建关系时使用 crypto.randomUUID 生成主键', async () => {
    const randomUUID = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('uuid-123');
    returning.mockResolvedValue([
      {
        id: 'uuid-123',
        userId: 'user-1',
        name: '我的老板',
        tags: '[]',
        relationshipType: null,
        对方特点: null,
        期望结果: null,
        情境补充: null,
        generatedContext: null,
        position: 0,
        createdAt: new Date('2026-03-27T00:00:00Z'),
        updatedAt: new Date('2026-03-27T00:00:00Z'),
      },
    ]);

    const repository = new RelationRepository();
    await repository.create({
      userId: 'user-1',
      name: '我的老板',
      tags: [],
      relationshipType: null,
      对方特点: null,
      期望结果: null,
      情境补充: null,
      generatedContext: null,
      position: 0,
    });

    expect(randomUUID).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'uuid-123',
      })
    );

    randomUUID.mockRestore();
  });

  it('新增关系位置使用第一个空槽位，避免删除后继续追加导致顺序混乱', () => {
    expect(findFirstAvailablePosition([0, 1, 3, 4])).toBe(2);
    expect(findFirstAvailablePosition([1, 2, 3])).toBe(0);
    expect(findFirstAvailablePosition([0, 1, 2])).toBe(3);
  });

  it('delete should return true when a row is deleted', async () => {
    deleteReturning.mockResolvedValue([{ id: 'relation-1' }]);

    const repository = new RelationRepository();
    const result = await repository.delete('relation-1');

    expect(result).toBe(true);
    expect(deleteFn).toHaveBeenCalled();
  });

  it('delete should return false when no row is deleted', async () => {
    deleteReturning.mockResolvedValue([]);

    const repository = new RelationRepository();
    const result = await repository.delete('non-existent-id');

    expect(result).toBe(false);
    expect(deleteFn).toHaveBeenCalled();
  });
});
