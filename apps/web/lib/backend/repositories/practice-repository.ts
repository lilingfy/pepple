/**
 * Practice Repository
 * Data access layer for practice entries
 */

import { db } from '@/lib/db';
import { practiceEntries } from '@/lib/db/schema';
import { eq, and, desc, lt, isNull, or } from 'drizzle-orm';
import type { PracticeEntry, NewPracticeEntry } from '@/lib/db/schema';
import type { PracticeSourceType } from '@pebble/types';

export interface PracticeListFilters {
  sourceType?: PracticeSourceType;
  isFavorite?: boolean;
  isArchived?: boolean;
  limit?: number;
  cursor?: string;
}

export class PracticeRepository {
  /**
   * Find a practice entry by ID
   */
  async findById(id: string): Promise<PracticeEntry | null> {
    const [entry] = await db
      .select()
      .from(practiceEntries)
      .where(eq(practiceEntries.id, id))
      .limit(1);

    return entry ?? null;
  }

  /**
   * Find all practice entries for a user or guest session
   */
  async findMany(params: {
    userId?: string | null;
    guestSessionId?: string | null;
    filters?: PracticeListFilters;
  }): Promise<{ entries: PracticeEntry[]; nextCursor?: string }> {
    const { userId, guestSessionId, filters } = params;
    const limit = filters?.limit ?? 20;

    // Build where conditions
    const conditions: ReturnType<typeof eq>[] = [];

    if (userId) {
      conditions.push(eq(practiceEntries.userId, userId));
    } else if (guestSessionId) {
      conditions.push(eq(practiceEntries.guestSessionId, guestSessionId));
    }

    if (filters?.sourceType) {
      conditions.push(eq(practiceEntries.sourceType, filters.sourceType));
    }

    if (filters?.isFavorite !== undefined) {
      conditions.push(eq(practiceEntries.isFavorite, filters.isFavorite));
    }

    if (filters?.isArchived !== undefined) {
      conditions.push(eq(practiceEntries.isArchived, filters.isArchived));
    } else {
      // By default, exclude archived entries
      conditions.push(eq(practiceEntries.isArchived, false));
    }

    if (filters?.cursor) {
      conditions.push(lt(practiceEntries.createdAt, new Date(filters.cursor)));
    }

    const whereClause = conditions.length > 0
      ? conditions.reduce((acc, condition) => and(acc!, condition)!)
      : undefined;

    const entries = await db
      .select()
      .from(practiceEntries)
      .where(whereClause)
      .orderBy(desc(practiceEntries.createdAt))
      .limit(limit + 1); // Get one extra to check for more

    // Check if there are more entries
    const hasMore = entries.length > limit;
    const results = hasMore ? entries.slice(0, limit) : entries;

    return {
      entries: results,
      nextCursor: hasMore && results.length > 0
        ? results[results.length - 1].createdAt.toISOString()
        : undefined,
    };
  }

  /**
   * Create a new practice entry
   */
  async create(data: {
    guestSessionId?: string | null;
    userId?: string | null;
    sourceType: PracticeSourceType;
    primaryReply: string;
    contentJsonb: unknown;
    isFavorite?: boolean;
    isArchived?: boolean;
  }): Promise<PracticeEntry> {
    const [entry] = await db
      .insert(practiceEntries)
      .values({
        guestSessionId: data.guestSessionId ?? null,
        userId: data.userId ?? null,
        sourceType: data.sourceType,
        primaryReply: data.primaryReply,
        contentJsonb: data.contentJsonb,
        isFavorite: data.isFavorite ?? false,
        isArchived: data.isArchived ?? false,
      })
      .returning();

    if (!entry) {
      throw new Error('Failed to create practice entry');
    }

    return entry;
  }

  /**
   * Update a practice entry
   */
  async update(
    id: string,
    data: {
      isFavorite?: boolean;
      isArchived?: boolean;
      primaryReply?: string;
    }
  ): Promise<PracticeEntry | null> {
    const [entry] = await db
      .update(practiceEntries)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(practiceEntries.id, id))
      .returning();

    return entry ?? null;
  }

  /**
   * Delete a practice entry
   */
  async delete(id: string): Promise<boolean> {
    const [entry] = await db
      .delete(practiceEntries)
      .where(eq(practiceEntries.id, id))
      .returning({ id: practiceEntries.id });

    return !!entry;
  }

  /**
   * Count entries for a user or guest session
   */
  async count(params: {
    userId?: string | null;
    guestSessionId?: string | null;
    filters?: Omit<PracticeListFilters, 'limit' | 'cursor'>;
  }): Promise<number> {
    const { userId, guestSessionId, filters } = params;

    const conditions: ReturnType<typeof eq>[] = [];

    if (userId) {
      conditions.push(eq(practiceEntries.userId, userId));
    } else if (guestSessionId) {
      conditions.push(eq(practiceEntries.guestSessionId, guestSessionId));
    }

    if (filters?.sourceType) {
      conditions.push(eq(practiceEntries.sourceType, filters.sourceType));
    }

    if (filters?.isFavorite !== undefined) {
      conditions.push(eq(practiceEntries.isFavorite, filters.isFavorite));
    }

    if (filters?.isArchived !== undefined) {
      conditions.push(eq(practiceEntries.isArchived, filters.isArchived));
    }

    const whereClause = conditions.length > 0
      ? conditions.reduce((acc, condition) => and(acc!, condition)!)
      : undefined;

    const result = await db
      .select({ count: count() })
      .from(practiceEntries)
      .where(whereClause);

    return Number(result[0]?.count ?? 0);
  }
}

// Import count function
import { count } from 'drizzle-orm';

// Singleton instance
export const practiceRepository = new PracticeRepository();
