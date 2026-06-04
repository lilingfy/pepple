/**
 * Practice Repository
 * Data access layer for practice entries
 */

import { db } from '@/lib/db';
import { practiceEntries } from '@/lib/db/schema';
import { eq, and, desc, lt, isNull, or, count } from 'drizzle-orm';
import type { PracticeEntry, NewPracticeEntry } from '@/lib/db/schema';
import type { PracticeSourceType } from '@pebble/types';

export interface PracticeListFilters {
  sourceType?: PracticeSourceType;
  isFavorite?: boolean;
  isArchived?: boolean;
  limit?: number;
  cursor?: string;
}

function checkDB() {
  if (!db) {
    throw new Error('Database is not available');
  }
  return db;
}

export class PracticeRepository {
  /**
   * Find a practice entry by ID
   */
  async findById(
    id: string,
    params: {
      userId?: string | null;
      guestSessionId?: string | null;
    }
  ): Promise<PracticeEntry | null> {
    const database = checkDB();

    if (!params.userId && !params.guestSessionId) {
      throw new Error('Authentication required');
    }

    const conditions: ReturnType<typeof eq>[] = [eq(practiceEntries.id, id)];

    if (params.userId) {
      conditions.push(eq(practiceEntries.userId, params.userId));
    } else if (params.guestSessionId) {
      conditions.push(eq(practiceEntries.guestSessionId, params.guestSessionId));
    }

    const whereClause = conditions.reduce((acc, condition) => and(acc!, condition)!);

    const [entry] = await database
      .select()
      .from(practiceEntries)
      .where(whereClause)
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
    const database = checkDB();
    const { userId, guestSessionId, filters } = params;
    const limit = filters?.limit ?? 20;

    if (!userId && !guestSessionId) {
      throw new Error('Authentication required');
    }

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
    }

    if (filters?.cursor) {
      conditions.push(lt(practiceEntries.createdAt, new Date(filters.cursor)));
    }

    const whereClause = conditions.length > 0
      ? conditions.reduce((acc, condition) => and(acc!, condition)!)
      : undefined;

    const entries = await database
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
    const database = checkDB();
    const [entry] = await database
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
    params: {
      userId?: string | null;
      guestSessionId?: string | null;
      data: {
        isFavorite?: boolean;
        isArchived?: boolean;
        primaryReply?: string;
      };
    }
  ): Promise<PracticeEntry | null> {
    const database = checkDB();

    if (!params.userId && !params.guestSessionId) {
      throw new Error('Authentication required');
    }

    const conditions: ReturnType<typeof eq>[] = [eq(practiceEntries.id, id)];

    if (params.userId) {
      conditions.push(eq(practiceEntries.userId, params.userId));
    } else if (params.guestSessionId) {
      conditions.push(eq(practiceEntries.guestSessionId, params.guestSessionId));
    }

    const whereClause = conditions.reduce((acc, condition) => and(acc!, condition)!);

    const [entry] = await database
      .update(practiceEntries)
      .set({
        ...params.data,
        updatedAt: new Date(),
      })
      .where(whereClause)
      .returning();

    return entry ?? null;
  }

  /**
   * Delete a practice entry
   */
  async delete(
    id: string,
    params: {
      userId?: string | null;
      guestSessionId?: string | null;
    }
  ): Promise<boolean> {
    const database = checkDB();

    if (!params.userId && !params.guestSessionId) {
      throw new Error('Authentication required');
    }

    const conditions: ReturnType<typeof eq>[] = [eq(practiceEntries.id, id)];

    if (params.userId) {
      conditions.push(eq(practiceEntries.userId, params.userId));
    } else if (params.guestSessionId) {
      conditions.push(eq(practiceEntries.guestSessionId, params.guestSessionId));
    }

    const whereClause = conditions.reduce((acc, condition) => and(acc!, condition)!);

    const [entry] = await database
      .delete(practiceEntries)
      .where(whereClause)
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
    const database = checkDB();
    const { userId, guestSessionId, filters } = params;

    if (!userId && !guestSessionId) {
      throw new Error('Authentication required');
    }

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

    const result = await database
      .select({ count: count() })
      .from(practiceEntries)
      .where(whereClause);

    return Number(result[0]?.count ?? 0);
  }
}

// Singleton instance
export const practiceRepository = new PracticeRepository();
