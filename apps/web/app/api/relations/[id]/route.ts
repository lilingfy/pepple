/**
 * Relation by ID API Routes
 * GET /api/relations/[id] - Get a relation node
 * PATCH /api/relations/[id] - Update a relation node
 * DELETE /api/relations/[id] - Delete a relation node
 */

import { NextRequest, NextResponse } from 'next/server';
import { relationService } from '@/lib/backend/services/relation-service';
import { normalizeApiFailure, generateRequestId, toErrorResponse } from '@/lib/backend/errors';
import { getCurrentRelationUserId } from '../_lib/current-user';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const requestId = generateRequestId();
  const { id } = await params;

  try {
    const userId = await getCurrentRelationUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse({ code: 'NOT_FOUND', message: '用户不存在', status: 404 }, requestId),
        },
        { status: 404 }
      );
    }

    const node = await relationService.getById(id);

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse({ code: 'NOT_FOUND', message: '关系不存在', status: 404 }, requestId),
        },
        { status: 404 }
      );
    }

    if (node.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse({ code: 'NOT_FOUND', message: '关系不存在', status: 404 }, requestId),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: node,
    });
  } catch (error) {
    console.error('Relation get error:', error);
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

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const requestId = generateRequestId();
  const { id } = await params;

  try {
    const userId = await getCurrentRelationUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse({ code: 'NOT_FOUND', message: '用户不存在', status: 404 }, requestId),
        },
        { status: 404 }
      );
    }

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
    const backendError = normalizeApiFailure(error);
    const status = backendError.status === 403 ? 404 : backendError.status;

    return NextResponse.json(
      {
        success: false,
        error: toErrorResponse(
          status === 404
            ? { code: 'NOT_FOUND', message: '关系不存在', status: 404 }
            : backendError,
          requestId
        ),
      },
      { status }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const requestId = generateRequestId();
  const { id } = await params;

  try {
    const userId = await getCurrentRelationUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse({ code: 'NOT_FOUND', message: '用户不存在', status: 404 }, requestId),
        },
        { status: 404 }
      );
    }

    await relationService.delete(id, userId);

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Relation delete error:', error);
    const backendError = normalizeApiFailure(error);
    const status = backendError.status === 403 ? 404 : backendError.status;

    return NextResponse.json(
      {
        success: false,
        error: toErrorResponse(
          status === 404
            ? { code: 'NOT_FOUND', message: '关系不存在', status: 404 }
            : backendError,
          requestId
        ),
      },
      { status }
    );
  }
}
