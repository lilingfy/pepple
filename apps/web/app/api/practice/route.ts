/**
 * Practice API Routes
 * GET /api/practice - List entries
 * POST /api/practice - Create entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { practiceService } from '@/lib/backend/services/practice-service';
import { resolvePracticeOwner } from './_lib/current-user';
import { normalizeApiFailure, generateRequestId, toErrorResponse, createBackendError } from '@/lib/backend/errors';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const { userId, guestSessionId } = await resolvePracticeOwner();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get('sourceType') as 'decode' | 'simulator' | undefined;
    const isFavorite = searchParams.has('isFavorite')
      ? searchParams.get('isFavorite') === 'true'
      : undefined;
    const isArchived = searchParams.has('isArchived')
      ? searchParams.get('isArchived') === 'true'
      : undefined;
    const limit = searchParams.has('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : 20;
    const cursor = searchParams.get('cursor') ?? undefined;

    // Validate limit
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw createBackendError('BAD_REQUEST', 'limit must be a positive integer between 1 and 100');
    }

    // Validate cursor
    if (cursor !== undefined && isNaN(Date.parse(cursor))) {
      throw createBackendError('BAD_REQUEST', 'cursor must be a valid ISO date string');
    }

    const result = await practiceService.list({
      userId,
      guestSessionId,
      filters: {
        sourceType,
        isFavorite,
        isArchived,
        limit,
        cursor,
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Practice list error:', error);
    const backendError = normalizeApiFailure(error);

    return NextResponse.json(
      {
        success: false,
        error: toErrorResponse(backendError, requestId),
      },
      { status: backendError.status }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const body = await request.json();
    const { userId, guestSessionId } = await resolvePracticeOwner();

    // Validate base fields
    if (!body.sourceType || !['decode', 'simulator'].includes(body.sourceType)) {
      throw createBackendError('BAD_REQUEST', 'Invalid source type');
    }

    if (!body.primaryReply || typeof body.primaryReply !== 'string') {
      throw createBackendError('BAD_REQUEST', 'Primary reply is required');
    }

    if (!body.content || typeof body.content !== 'object') {
      throw createBackendError('BAD_REQUEST', 'Content is required');
    }

    let entry;

    if (body.sourceType === 'decode') {
      // Validate decode content structure
      if (!body.content.originalText || !body.content.analysis || !body.content.replyOptions) {
        throw createBackendError('BAD_REQUEST', 'Invalid decode content structure');
      }

      if (!Array.isArray(body.content.replyOptions)) {
        throw createBackendError('BAD_REQUEST', 'replyOptions must be an array');
      }

      // Provide defaults for missing analysis fields
      const analysis = {
        attackType: body.content.analysis.attackType || 'general',
        scenario: body.content.analysis.scenario || 'general',
        subtext: body.content.analysis.subtext || '',
        emotionScore: body.content.analysis.emotionScore ?? 50,
        neutralityScore: body.content.analysis.neutralityScore ?? (100 - (body.content.analysis.emotionScore ?? 50)),
        emotionStatus: body.content.analysis.emotionStatus || '',
      };

      // Normalize replyOptions to include tone
      const replyOptions = body.content.replyOptions.map((opt: { id: string; label: string; content: string; tone?: string }) => ({
        id: opt.id,
        label: opt.label,
        content: opt.content,
        tone: opt.tone || 'neutral',
      }));

      // Validate selectedReplyId is present and matches a reply option
      if (!body.content.selectedReplyId || typeof body.content.selectedReplyId !== 'string') {
        throw createBackendError('BAD_REQUEST', 'selectedReplyId is required');
      }

      const selectedReply = replyOptions.find((r: { id: string; content: string }) => r.id === body.content.selectedReplyId);
      if (!selectedReply) {
        throw createBackendError('BAD_REQUEST', 'selectedReplyId does not match any reply option');
      }

      if (body.primaryReply !== selectedReply.content) {
        throw createBackendError('BAD_REQUEST', 'primaryReply must match the selected reply content');
      }

      entry = await practiceService.createFromDecode({
        userId,
        guestSessionId,
        originalText: body.content.originalText,
        surfaceMeaning: body.content.surfaceMeaning || '',
        analysis,
        replyOptions,
        selectedReplyId: body.content.selectedReplyId,
        primaryReply: body.primaryReply,
        relationId: body.content.relationId,
        relationName: body.content.relationName,
      });
    } else {
      // Validate simulator content structure
      if (!body.content.scenarioId || !body.content.scenarioName || !body.content.turns) {
        throw createBackendError('BAD_REQUEST', 'Invalid simulator content structure');
      }

      if (!Array.isArray(body.content.turns)) {
        throw createBackendError('BAD_REQUEST', 'turns must be an array');
      }

      for (const turn of body.content.turns) {
        if (!turn || typeof turn !== 'object') {
          throw createBackendError('BAD_REQUEST', 'Each turn must be an object');
        }
        if (!['user', 'assistant'].includes(turn.role)) {
          throw createBackendError('BAD_REQUEST', 'Each turn role must be user or assistant');
        }
        if (typeof turn.content !== 'string') {
          throw createBackendError('BAD_REQUEST', 'Each turn content must be a string');
        }
      }

      entry = await practiceService.createFromSimulator({
        userId,
        guestSessionId,
        scenarioId: body.content.scenarioId,
        scenarioName: body.content.scenarioName,
        turns: body.content.turns,
        primaryReply: body.primaryReply,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: entry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Practice create error:', error);
    const backendError = normalizeApiFailure(error);

    return NextResponse.json(
      {
        success: false,
        error: toErrorResponse(backendError, requestId),
      },
      { status: backendError.status }
    );
  }
}
