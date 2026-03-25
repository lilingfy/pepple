/**
 * Practice Single Entry API Routes
 * GET /api/practice/[practiceId] - Get single entry
 * PATCH /api/practice/[practiceId] - Update entry
 * DELETE /api/practice/[practiceId] - Delete entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { practiceService } from '@/lib/backend/services/practice-service';
import { getCurrentGuestSession } from '@/lib/backend/sessions/guest';
import { normalizeApiFailure, generateRequestId, toErrorResponse, createBackendError } from '@/lib/backend/errors';

interface RouteParams {
  params: Promise<{ practiceId: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const { practiceId } = await params;
    const guestSession = await getCurrentGuestSession();

    const entry = await practiceService.get(practiceId);

    if (!entry) {
      throw createBackendError('NOT_FOUND', 'Practice entry not found');
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Practice get error:', error);
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

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const { practiceId } = await params;
    const body = await request.json();

    // Validate update fields
    const updates: {
      isFavorite?: boolean;
      isArchived?: boolean;
      primaryReply?: string;
    } = {};

    if (body.isFavorite !== undefined) {
      updates.isFavorite = Boolean(body.isFavorite);
    }

    if (body.isArchived !== undefined) {
      updates.isArchived = Boolean(body.isArchived);
    }

    if (body.primaryReply !== undefined) {
      if (typeof body.primaryReply !== 'string' || body.primaryReply.length === 0) {
        throw createBackendError('BAD_REQUEST', 'Primary reply must be a non-empty string');
      }
      updates.primaryReply = body.primaryReply;
    }

    if (Object.keys(updates).length === 0) {
      throw createBackendError('BAD_REQUEST', 'No valid fields to update');
    }

    const entry = await practiceService.update(practiceId, updates);

    if (!entry) {
      throw createBackendError('NOT_FOUND', 'Practice entry not found');
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Practice update error:', error);
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

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const { practiceId } = await params;

    const deleted = await practiceService.delete(practiceId);

    if (!deleted) {
      throw createBackendError('NOT_FOUND', 'Practice entry not found');
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Practice delete error:', error);
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
