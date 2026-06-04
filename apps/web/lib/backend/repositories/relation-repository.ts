/**
 * Relation Repository
 * Data access layer for relation nodes
 */

import { db } from '@/lib/db';
import { relationNodes } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { RelationNode, NewRelationNode } from '@/lib/db/schema';

type RelationRecordInput = Omit<NewRelationNode, 'tags'> & {
  tags?: string[] | string | null;
};

const MAX_RELATION_POSITIONS = 10;

export function findFirstAvailablePosition(positions: number[], maxPositions = MAX_RELATION_POSITIONS): number {
  const occupied = new Set(positions.filter((position) => position >= 0 && position < maxPositions));

  for (let position = 0; position < maxPositions; position += 1) {
    if (!occupied.has(position)) return position;
  }

  return maxPositions;
}

function generateId(): string {
  return crypto.randomUUID();
}

export class RelationRepository {
  private requireDB() {
    if (!db) {
      throw new Error('Database is not available');
    }

    return db;
  }

  private serializeTags(tags: RelationRecordInput['tags']): string {
    if (Array.isArray(tags)) {
      return JSON.stringify(tags);
    }

    if (typeof tags === 'string' && tags.trim().length > 0) {
      return tags;
    }

    return '[]';
  }

  /**
   * Find a relation node by ID
   */
  async findById(id: string): Promise<RelationNode | null> {
    const database = this.requireDB();
    const [node] = await database
      .select()
      .from(relationNodes)
      .where(eq(relationNodes.id, id))
      .limit(1);

    return node ?? null;
  }

  /**
   * Find all relation nodes for a user, ordered by position
   */
  async findManyByUserId(userId: string): Promise<RelationNode[]> {
    const database = this.requireDB();
    return database
      .select()
      .from(relationNodes)
      .where(eq(relationNodes.userId, userId))
      .orderBy(asc(relationNodes.position));
  }

  /**
   * Create a new relation node
   */
  async create(data: Omit<RelationRecordInput, 'id' | 'createdAt' | 'updatedAt'>): Promise<RelationNode> {
    const now = new Date();
    const { tags, ...rest } = data;
    const database = this.requireDB();
    const [node] = await database
      .insert(relationNodes)
      .values({
        ...rest,
        tags: this.serializeTags(tags),
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return node;
  }

  /**
   * Update a relation node
   */
  async update(id: string, data: Partial<Omit<RelationRecordInput, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<RelationNode | null> {
    const { tags, ...rest } = data;
    const nextValues = {
      ...rest,
      ...(tags !== undefined ? { tags: this.serializeTags(tags) } : {}),
      updatedAt: new Date(),
    };

    const database = this.requireDB();
    const [node] = await database
      .update(relationNodes)
      .set(nextValues)
      .where(eq(relationNodes.id, id))
      .returning();

    return node ?? null;
  }

  /**
   * Delete a relation node
   */
  async delete(id: string): Promise<boolean> {
    const database = this.requireDB();
    const [deleted] = await database
      .delete(relationNodes)
      .where(eq(relationNodes.id, id))
      .returning({ id: relationNodes.id });

    return !!deleted;
  }

  /**
   * Get the next available position for a user
   */
  async getNextPosition(userId: string): Promise<number> {
    const nodes = await this.findManyByUserId(userId);
    return findFirstAvailablePosition(nodes.map(n => n.position));
  }
}

export const relationRepository = new RelationRepository();
