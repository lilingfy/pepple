/**
 * Practice Service
 * Business logic for practice entries management
 */

import { practiceRepository } from '../repositories/practice-repository';
import { createBackendError } from '../errors';
import type { PracticeEntry as PracticeEntryType, PracticeCreateRequest, PracticeUpdateRequest, PracticeListResponse } from '@pebble/types';
import type { PracticeEntry } from '@/lib/db/schema';

export class PracticeService {
  private repository = practiceRepository;

  /**
   * Create a practice entry from decode result
   */
  async createFromDecode(
    params: {
      guestSessionId?: string | null;
      userId?: string | null;
      originalText: string;
      surfaceMeaning: string;
      analysis: {
        attackType: string;
        scenario?: string;
        subtext: string;
        emotionScore: number;
        neutralityScore?: number;
        emotionStatus: string;
      };
      replyOptions: Array<{
        id: string;
        label: string;
        content: string;
        tone?: string;
      }>;
      selectedReplyId: string;
      primaryReply: string;
      relationId?: string;
      relationName?: string;
    }
  ): Promise<PracticeEntryType> {
    if (!params.userId && !params.guestSessionId) {
      throw createBackendError('UNAUTHORIZED', 'Authentication required');
    }

    if (!Array.isArray(params.replyOptions)) {
      throw createBackendError('BAD_REQUEST', 'replyOptions must be an array');
    }

    if (!params.selectedReplyId) {
      throw createBackendError('BAD_REQUEST', 'selectedReplyId is required');
    }

    const selectedReply = params.replyOptions.find(r => r.id === params.selectedReplyId);
    if (!selectedReply) {
      throw createBackendError('BAD_REQUEST', 'selectedReplyId does not match any reply option');
    }

    const computedPrimaryReply = selectedReply.content;

    if (params.primaryReply !== computedPrimaryReply) {
      throw createBackendError('BAD_REQUEST', 'primaryReply must match the selected reply content');
    }

    const entry = await this.repository.create({
      guestSessionId: params.guestSessionId,
      userId: params.userId,
      sourceType: 'decode',
      primaryReply: params.primaryReply,
      contentJsonb: {
        originalText: params.originalText,
        surfaceMeaning: params.surfaceMeaning,
        analysis: params.analysis,
        replyOptions: params.replyOptions,
        selectedReplyId: params.selectedReplyId,
        relationId: params.relationId,
        relationName: params.relationName,
      },
    });

    return this.toDTO(entry);
  }

  /**
   * Create a practice entry from simulator session
   */
  async createFromSimulator(
    params: {
      guestSessionId?: string | null;
      userId?: string | null;
      scenarioId: string;
      scenarioName: string;
      turns: Array<{
        role: 'user' | 'assistant';
        content: string;
        analysis?: unknown;
      }>;
      primaryReply: string;
    }
  ): Promise<PracticeEntryType> {
    if (!params.userId && !params.guestSessionId) {
      throw createBackendError('UNAUTHORIZED', 'Authentication required');
    }

    if (!Array.isArray(params.turns)) {
      throw createBackendError('BAD_REQUEST', 'turns must be an array');
    }

    for (const turn of params.turns) {
      if (!turn || typeof turn !== 'object') {
        throw createBackendError('BAD_REQUEST', 'Each turn must be an object');
      }
      if (!['user', 'assistant'].includes(turn.role)) {
        throw createBackendError('BAD_REQUEST', 'turn role must be user or assistant');
      }
      if (typeof turn.content !== 'string') {
        throw createBackendError('BAD_REQUEST', 'turn content must be a string');
      }
    }

    const entry = await this.repository.create({
      guestSessionId: params.guestSessionId,
      userId: params.userId,
      sourceType: 'simulator',
      primaryReply: params.primaryReply,
      contentJsonb: {
        scenarioId: params.scenarioId,
        scenarioName: params.scenarioName,
        turns: params.turns,
      },
    });

    return this.toDTO(entry);
  }

  /**
   * List practice entries for a user or guest session
   */
  async list(
    params: {
      userId?: string | null;
      guestSessionId?: string | null;
      filters?: {
        sourceType?: 'decode' | 'simulator';
        isFavorite?: boolean;
        isArchived?: boolean;
        limit?: number;
        cursor?: string;
      };
    }
  ): Promise<PracticeListResponse> {
    if (!params.userId && !params.guestSessionId) {
      throw createBackendError('UNAUTHORIZED', 'Authentication required');
    }

    const { entries, nextCursor } = await this.repository.findMany({
      userId: params.userId,
      guestSessionId: params.guestSessionId,
      filters: params.filters,
    });

    const total = await this.repository.count({
      userId: params.userId,
      guestSessionId: params.guestSessionId,
      filters: {
        sourceType: params.filters?.sourceType,
        isFavorite: params.filters?.isFavorite,
        isArchived: params.filters?.isArchived,
      },
    });

    return {
      entries: entries.map(e => this.toDTO(e)),
      total,
      hasMore: !!nextCursor,
    };
  }

  /**
   * Get a single practice entry
   */
  async get(
    id: string,
    params: {
      userId?: string | null;
      guestSessionId?: string | null;
    }
  ): Promise<PracticeEntryType | null> {
    if (!params.userId && !params.guestSessionId) {
      throw createBackendError('UNAUTHORIZED', 'Authentication required');
    }

    // Repository already filters by owner (userId or guestSessionId)
    const entry = await this.repository.findById(id, {
      userId: params.userId,
      guestSessionId: params.guestSessionId,
    });

    return entry ? this.toDTO(entry) : null;
  }

  /**
   * Update a practice entry
   */
  async update(
    id: string,
    data: PracticeUpdateRequest,
    params: {
      userId?: string | null;
      guestSessionId?: string | null;
    }
  ): Promise<PracticeEntryType | null> {
    if (!params.userId && !params.guestSessionId) {
      throw createBackendError('UNAUTHORIZED', 'Authentication required');
    }

    const entry = await this.repository.update(id, {
      userId: params.userId,
      guestSessionId: params.guestSessionId,
      data: {
        isFavorite: data.isFavorite,
        isArchived: data.isArchived,
        primaryReply: data.primaryReply,
      },
    });

    return entry ? this.toDTO(entry) : null;
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
    if (!params.userId && !params.guestSessionId) {
      throw createBackendError('UNAUTHORIZED', 'Authentication required');
    }

    return this.repository.delete(id, {
      userId: params.userId,
      guestSessionId: params.guestSessionId,
    });
  }

  /**
   * Convert database entry to DTO
   */
  private toDTO(entry: PracticeEntry): PracticeEntryType {
    return {
      id: entry.id,
      sourceType: entry.sourceType as 'decode' | 'simulator',
      primaryReply: entry.primaryReply,
      content: entry.contentJsonb as PracticeEntryType['content'],
      isFavorite: entry.isFavorite,
      isArchived: entry.isArchived,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }
}

// Singleton instance
export const practiceService = new PracticeService();
