import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/backend/repositories/relation-repository', () => ({
  relationRepository: {
    findManyByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getNextPosition: vi.fn(),
  },
}));

import { relationRepository } from '@/lib/backend/repositories/relation-repository';
import { RelationService } from '@/lib/backend/services/relation-service';

const repository = relationRepository as unknown as {
  findManyByUserId: ReturnType<typeof vi.fn>;
};

describe('RelationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('将数据库中的 JSON 文本标签归一化为字符串数组', async () => {
    repository.findManyByUserId.mockResolvedValue([
      {
        id: 'relation-1',
        userId: 'user-1',
        name: '我的老板',
        tags: '["职场","NPD"]',
        relationshipType: '老板',
        对方特点: null,
        期望结果: null,
        情境补充: null,
        generatedContext: null,
        position: 0,
        createdAt: new Date('2026-03-27T00:00:00Z'),
        updatedAt: new Date('2026-03-27T00:00:00Z'),
      },
    ]);

    const service = new RelationService();
    const nodes = await service.list('user-1');

    expect(nodes[0]?.tags).toEqual(['职场', 'NPD']);
  });
});
