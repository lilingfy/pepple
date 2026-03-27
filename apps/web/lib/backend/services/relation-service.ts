/**
 * Relation Service
 * Business logic for relation nodes management
 */

import { relationRepository } from '../repositories/relation-repository';
import { createBackendError } from '../errors';
import type { RelationNode } from '@/lib/db/schema';

export interface RelationNodeDTO {
  id: string;
  userId: string;
  name: string;
  tags: string[];
  relationshipType: string | null;
  对方特点: string | null;
  期望结果: string | null;
  情境补充: string | null;
  generatedContext: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRelationParams {
  userId: string;
  name: string;
  tags?: string[];
  relationshipType?: string;
  对方特点?: string;
  期望结果?: string;
  情境补充?: string;
}

export interface UpdateRelationParams {
  name?: string;
  tags?: string[];
  relationshipType?: string;
  对方特点?: string;
  期望结果?: string;
  情境补充?: string;
  generatedContext?: string;
  position?: number;
}

const RELATIONSHIP_TYPES = ['老板', '上司', '同事', '下属', '客户', '父母', '配偶', '伴侣', '子女', '兄弟姐妹', '朋友', '密友', '普通朋友', '同学', '老师', '其他'] as const;

const SocraticPromptTemplate = `【角色】你现在是我的【{relationshipType}】，【{对方特点}】。
【目标】我希望【{期望结果}】。
【情境】{情境补充}

请以苏格拉底方式引导我思考和应对这个关系中的困境。通过提问帮助我发现自己内心的力量和智慧，不要直接给结论或建议。记住，真正的改变来自内心的觉醒，而不是外在的指导。`;

export class RelationService {
  private repository = relationRepository;

  private normalizeTags(tags: RelationNode['tags']): string[] {
    if (Array.isArray(tags)) {
      return tags.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);
    }

    if (typeof tags !== 'string' || tags.trim().length === 0) {
      return [];
    }

    try {
      const parsed = JSON.parse(tags);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);
    } catch {
      return [];
    }
  }

  /**
   * List all relation nodes for a user
   */
  async list(userId: string): Promise<RelationNodeDTO[]> {
    const nodes = await this.repository.findManyByUserId(userId);
    return nodes.map((node) => this.toDTO(node));
  }

  /**
   * Get a single relation node by ID
   */
  async getById(id: string): Promise<RelationNodeDTO | null> {
    const node = await this.repository.findById(id);
    return node ? this.toDTO(node) : null;
  }

  /**
   * Create a new relation node
   */
  async create(params: CreateRelationParams): Promise<RelationNodeDTO> {
    if (!params.name || params.name.trim().length === 0) {
      throw createBackendError('BAD_REQUEST', '关系名称不能为空');
    }

    if (params.name.length > 100) {
      throw createBackendError('BAD_REQUEST', '关系名称不能超过100个字符');
    }

    const position = await this.repository.getNextPosition(params.userId);

    if (position >= 10) {
      throw createBackendError('BAD_REQUEST', '最多只能添加10个关系节点');
    }

    const node = await this.repository.create({
      userId: params.userId,
      name: params.name.trim(),
      tags: params.tags ?? [],
      relationshipType: params.relationshipType,
      对方特点: params.对方特点,
      期望结果: params.期望结果,
      情境补充: params.情境补充,
      generatedContext: this.generateContext(params),
      position,
    });

    return this.toDTO(node);
  }

  /**
   * Update a relation node
   */
  async update(id: string, userId: string, params: UpdateRelationParams): Promise<RelationNodeDTO> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw createBackendError('NOT_FOUND', '关系不存在');
    }

    if (existing.userId !== userId) {
      throw createBackendError('FORBIDDEN', '无权修改此关系');
    }

    if (params.name !== undefined) {
      if (params.name.trim().length === 0) {
        throw createBackendError('BAD_REQUEST', '关系名称不能为空');
      }
      if (params.name.length > 100) {
        throw createBackendError('BAD_REQUEST', '关系名称不能超过100个字符');
      }
    }

    const updated = await this.repository.update(id, {
      ...params,
      name: params.name?.trim(),
    });

    if (!updated) {
      throw createBackendError('NOT_FOUND', '关系不存在');
    }

    return this.toDTO(updated);
  }

  /**
   * Delete a relation node
   */
  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw createBackendError('NOT_FOUND', '关系不存在');
    }

    if (existing.userId !== userId) {
      throw createBackendError('FORBIDDEN', '无权删除此关系');
    }

    await this.repository.delete(id);
  }

  /**
   * Regenerate the context for a relation node
   */
  async regenerateContext(id: string, userId: string): Promise<RelationNodeDTO> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw createBackendError('NOT_FOUND', '关系不存在');
    }

    if (existing.userId !== userId) {
      throw createBackendError('FORBIDDEN', '无权修改此关系');
    }

    const newContext = this.generateContext({
      relationshipType: existing.relationshipType ?? undefined,
      对方特点: existing.对方特点 ?? undefined,
      期望结果: existing.期望结果 ?? undefined,
      情境补充: existing.情境补充 ?? undefined,
    });

    const updated = await this.repository.update(id, { generatedContext: newContext });

    if (!updated) {
      throw createBackendError('NOT_FOUND', '关系不存在');
    }

    return this.toDTO(updated);
  }

  /**
   * Get all available relationship types
   */
  getAvailableTypes(): readonly string[] {
    return RELATIONSHIP_TYPES;
  }

  /**
   * Generate context prompt from template
   */
  private generateContext(params: Partial<CreateRelationParams>): string {
    return SocraticPromptTemplate
      .replace('{relationshipType}', params.relationshipType ?? '重要的人')
      .replace('{对方特点}', params.对方特点 ?? '有独特的性格特点')
      .replace('{期望结果}', params.期望结果 ?? '建立更健康的关系')
      .replace('{情境补充}', params.情境补充 ?? '在相处过程中遇到一些困惑和挑战');
  }

  /**
   * Convert database model to DTO
   */
  private toDTO(node: RelationNode): RelationNodeDTO {
    return {
      id: node.id,
      userId: node.userId,
      name: node.name,
      tags: this.normalizeTags(node.tags),
      relationshipType: node.relationshipType,
      对方特点: node.对方特点,
      期望结果: node.期望结果,
      情境补充: node.情境补充,
      generatedContext: node.generatedContext,
      position: node.position,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    };
  }
}

export const relationService = new RelationService();
