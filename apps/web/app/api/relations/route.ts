/**
 * Relations API Routes
 * GET /api/relations - List all relation nodes
 * POST /api/relations - Create a new relation node
 */

import { NextRequest, NextResponse } from 'next/server';
import { relationService } from '@/lib/backend/services/relation-service';
import { normalizeApiFailure, generateRequestId, toErrorResponse } from '@/lib/backend/errors';
import { getCurrentRelationUserId } from './_lib/current-user';

export async function GET(): Promise<NextResponse> {
  const requestId = generateRequestId();

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

    const nodes = await relationService.list(userId);

    return NextResponse.json({
      success: true,
      data: nodes,
    });
  } catch (error) {
    console.error('Relations list error:', error);
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

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse({ code: 'BAD_REQUEST', message: '关系名称不能为空', status: 400 }, requestId),
        },
        { status: 400 }
      );
    }

    const node = await relationService.create({
      userId,
      name: body.name,
      tags: Array.isArray(body.tags) ? body.tags : [],
      relationshipType: body.relationshipType,
      对方特点: body.对方特点,
      期望结果: body.期望结果,
      情境补充: body.情境补充,
    });

    return NextResponse.json(
      {
        success: true,
        data: node,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Relations create error:', error);
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
