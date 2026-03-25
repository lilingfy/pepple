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
      analysis: {
        attackType: string;
        scenario?: string;
        subtext: string;
        emotionScore: number;
        neutralityScore?: number;
      };
      replyOptions: Array<{
        id: string;
        label: string;
        content: string;
        tone?: string;
      }>;
      selectedReplyId?: string;
    }
  ): Promise<PracticeEntryType> {
    // Use first reply option as primary if not specified
    const primaryReply = params.selectedReplyId
      ? params.replyOptions.find(r => r.id === params.selectedReplyId)?.content
      : params.replyOptions[0]?.content;

    if (!primaryReply) {
      throw createBackendError('BAD_REQUEST', 'No reply options provided');
    }

    const entry = await this.repository.create({
      guestSessionId: params.guestSessionId,
      userId: params.userId,
      sourceType: 'decode',
      primaryReply,
      contentJsonb: {
        originalText: params.originalText,
        analysis: params.analysis,
        replyOptions: params.replyOptions,
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
    const { entries, nextCursor } = await this.repository.findMany({
      userId: params.userId,
      guestSessionId: params.guestSessionId,
      filters: params.filters,
    });

    return {
      entries: entries.map(e => this.toDTO(e)),
      total: entries.length,
      hasMore: !!nextCursor,
    };
  }

  /**
   * Get a single practice entry
   */
  async get(id: string): Promise<PracticeEntryType | null> {
    const entry = await this.repository.findById(id);
    return entry ? this.toDTO(entry) : null;
  }

  /**
   * Update a practice entry
   */
  async update(
    id: string,
    data: PracticeUpdateRequest
  ): Promise<PracticeEntryType | null> {
    const entry = await this.repository.update(id, {
      isFavorite: data.isFavorite,
      isArchived: data.isArchived,
      primaryReply: data.primaryReply,
    });

    return entry ? this.toDTO(entry) : null;
  }

  /**
   * Delete a practice entry
   */
  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
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
