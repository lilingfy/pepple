/**
 * Practice Single Entry API Routes
 * GET /api/practice/[practiceId] - Get single entry
 * PATCH /api/practice/[practiceId] - Update entry
 * DELETE /api/practice/[practiceId] - Delete entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { practiceService } from '@/lib/backend/services/practice-service';
import { resolvePracticeOwner } from '../_lib/current-user';
import { normalizeApiFailure, generateRequestId, toErrorResponse, createBackendError } from '@/lib/backend/errors';

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

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

    if (!isValidUUID(practiceId)) {
      throw createBackendError('BAD_REQUEST', 'Invalid practiceId format');
    }

    const { userId, guestSessionId } = await resolvePracticeOwner();

    const entry = await practiceService.get(practiceId, {
      userId,
      guestSessionId,
    });

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

    if (!isValidUUID(practiceId)) {
      throw createBackendError('BAD_REQUEST', 'Invalid practiceId format');
    }

    const body = await request.json();

    // Validate update fields
    const updates: {
      isFavorite?: boolean;
      isArchived?: boolean;
      primaryReply?: string;
    } = {};

    if (body.isFavorite !== undefined) {
      if (typeof body.isFavorite !== 'boolean') {
        throw createBackendError('BAD_REQUEST', 'isFavorite must be a boolean');
      }
      updates.isFavorite = body.isFavorite;
    }

    if (body.isArchived !== undefined) {
      if (typeof body.isArchived !== 'boolean') {
        throw createBackendError('BAD_REQUEST', 'isArchived must be a boolean');
      }
      updates.isArchived = body.isArchived;
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

    const { userId, guestSessionId } = await resolvePracticeOwner();

    const entry = await practiceService.update(practiceId, updates, {
      userId,
      guestSessionId,
    });

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

    if (!isValidUUID(practiceId)) {
      throw createBackendError('BAD_REQUEST', 'Invalid practiceId format');
    }

    const { userId, guestSessionId } = await resolvePracticeOwner();

    const deleted = await practiceService.delete(practiceId, {
      userId,
      guestSessionId,
    });

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
