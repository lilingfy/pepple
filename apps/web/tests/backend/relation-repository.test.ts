import { beforeEach, describe, expect, it, vi } from 'vitest';

const { returning, values, insert } = vi.hoisted(() => {
  const returning = vi.fn();
  const values = vi.fn(() => ({ returning }));
  const insert = vi.fn(() => ({ values }));

  return { returning, values, insert };
});

vi.mock('@/lib/db', () => ({
  db: {
    insert,
  },
}));

import { RelationRepository } from '@/lib/backend/repositories/relation-repository';

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
});
