/**
 * Practice API Routes
 * GET /api/practice - List entries
 * POST /api/practice - Create entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { practiceService } from '@/lib/backend/services/practice-service';
import { Schemas, assertValid } from '@/lib/backend/policy/validation';
import { getCurrentGuestSession } from '@/lib/backend/sessions/guest';
import { normalizeApiFailure, generateRequestId, toErrorResponse } from '@/lib/backend/errors';
import type { PracticeCreateRequest } from '@pebble/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const guestSession = await getCurrentGuestSession();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get('sourceType') as 'decode' | 'simulator' | undefined;
    const isFavorite = searchParams.has('isFavorite')
      ? searchParams.get('isFavorite') === 'true'
      : undefined;
    const isArchived = searchParams.has('isArchived')
      ? searchParams.get('isArchived') === 'true'
      : false; // Default to false
    const limit = searchParams.has('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : 20;
    const cursor = searchParams.get('cursor') ?? undefined;

    const result = await practiceService.list({
      guestSessionId: guestSession?.id,
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
    const guestSession = await getCurrentGuestSession();

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

      // Provide defaults for missing analysis fields
      const analysis = {
        attackType: body.content.analysis.attackType || 'general',
        scenario: body.content.analysis.scenario || 'general',
        subtext: body.content.analysis.subtext || '',
        emotionScore: body.content.analysis.emotionScore ?? 50,
        neutralityScore: body.content.analysis.neutralityScore ?? (100 - (body.content.analysis.emotionScore ?? 50)),
      };

      // Normalize replyOptions to include tone
      const replyOptions = body.content.replyOptions.map((opt: { id: string; label: string; content: string; tone?: string }) => ({
        id: opt.id,
        label: opt.label,
        content: opt.content,
        tone: opt.tone || 'neutral',
      }));

      entry = await practiceService.createFromDecode({
        guestSessionId: guestSession?.id,
        originalText: body.content.originalText,
        analysis,
        replyOptions,
        selectedReplyId: body.content.selectedReplyId,
      });
    } else {
      // Validate simulator content structure
      if (!body.content.scenarioId || !body.content.scenarioName || !body.content.turns) {
        throw createBackendError('BAD_REQUEST', 'Invalid simulator content structure');
      }

      entry = await practiceService.createFromSimulator({
        guestSessionId: guestSession?.id,
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

// Import createBackendError for use in POST
import { createBackendError } from '@/lib/backend/errors';
