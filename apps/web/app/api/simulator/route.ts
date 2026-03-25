/**
 * Simulator API Route
 * POST /api/simulator
 */

import { NextRequest, NextResponse } from 'next/server';
import { simulatorService } from '@/lib/backend/services/simulator-service';
import { getCurrentGuestSession } from '@/lib/backend/sessions/guest';
import { simulatorRateLimiter, assertRateLimit } from '@/lib/backend/policy/rate-limit';
import { normalizeApiFailure, generateRequestId, toErrorResponse } from '@/lib/backend/errors';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const body = await request.json();
    const guestSession = await getCurrentGuestSession();

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimitKey = guestSession?.id || clientIp;
    assertRateLimit(rateLimitKey, simulatorRateLimiter);

    if (body.action === 'end' && body.sessionId) {
      const result = await simulatorService.endSession(body.sessionId);
      return NextResponse.json({ success: true, data: result });
    }

    if (body.action === 'restart' && body.sessionId) {
      const result = await simulatorService.restartSession(
        body.sessionId,
        guestSession?.id
      );
      return NextResponse.json({ success: true, data: result });
    }

    if (!body.sessionId && body.scenarioId) {
      const result = await simulatorService.startSession(
        body.scenarioId,
        guestSession?.id
      );
      return NextResponse.json({ success: true, data: result });
    }

    if (body.sessionId && body.message) {
      const result = await simulatorService.processTurn(
        body.sessionId,
        body.message,
        guestSession?.id
      );
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: '无效的请求参数组合',
          requestId,
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Simulator error:', error);
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
