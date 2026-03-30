/**
 * Relation by ID API Routes
 * GET /api/relations/[id] - Get a relation node
 * PATCH /api/relations/[id] - Update a relation node
 * DELETE /api/relations/[id] - Delete a relation node
 */

import { NextRequest, NextResponse } from 'next/server';
import { relationService } from '@/lib/backend/services/relation-service';
import { generateRequestId, toErrorResponse, normalizeApiFailure } from '@/lib/backend/errors';
import { getCurrentRelationUserId } from '../_lib/current-user';
import { createResponseHelpers, mapForbiddenToNotFound } from '../_lib/route-helpers';
import { isAuthError } from '@/lib/auth/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const helpers = createResponseHelpers(generateRequestId());
  const { id } = await params;

  try {
    const userId = await getCurrentRelationUserId();

    const node = await relationService.getById(id);

    if (!node) {
      return helpers.notFound();
    }

    if (node.userId !== userId) {
      return helpers.notFound();
    }

    return NextResponse.json({
      success: true,
      data: node,
    });
  } catch (error) {
    console.error('Relation get error:', error);
    if (isAuthError(error)) {
      return helpers.authError(error);
    }
    return helpers.error(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const helpers = createResponseHelpers(generateRequestId());
  const { id } = await params;

  try {
    const userId = await getCurrentRelationUserId();

    const body = await request.json();

    const node = await relationService.update(id, userId, {
      name: body.name,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      relationshipType: body.relationshipType,
      对方特点: body.对方特点,
      期望结果: body.期望结果,
      情境补充: body.情境补充,
      generatedContext: body.generatedContext,
      position: body.position,
    });

    return NextResponse.json({
      success: true,
      data: node,
    });
  } catch (error) {
    console.error('Relation update error:', error);
    if (isAuthError(error)) {
      return helpers.authError(error);
    }
    const backendError = normalizeApiFailure(error);
    const status = mapForbiddenToNotFound(backendError.status);

    return NextResponse.json(
      {
        success: false,
        error: toErrorResponse(
          status === 404
            ? { code: 'NOT_FOUND', message: '关系不存在', status: 404 }
            : backendError,
          helpers.requestId
        ),
      },
      { status }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const helpers = createResponseHelpers(generateRequestId());
  const { id } = await params;

  try {
    const userId = await getCurrentRelationUserId();

    await relationService.delete(id, userId);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Relation delete error:', error);
    if (isAuthError(error)) {
      return helpers.authError(error);
    }
    const backendError = normalizeApiFailure(error);
    const status = mapForbiddenToNotFound(backendError.status);

    return NextResponse.json(
      {
        success: false,
        error: toErrorResponse(
          status === 404
            ? { code: 'NOT_FOUND', message: '关系不存在', status: 404 }
            : backendError,
          helpers.requestId
        ),
      },
      { status }
    );
  }
}
