/**
 * Decode API Route
 * POST /api/decode
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/backend/services/decode-service';
import { Schemas, assertValid } from '@/lib/backend/policy/validation';
import { decodeRateLimiter, assertRateLimit } from '@/lib/backend/policy/rate-limit';
import { normalizeApiFailure, generateRequestId, toErrorResponse } from '@/lib/backend/errors';
import { getCurrentGuestSession } from '@/lib/backend/sessions/guest';
import type { DecodeResponse } from '@pebble/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const guestSession = await getCurrentGuestSession();
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimitKey = guestSession?.id || clientIp;
    assertRateLimit(rateLimitKey, decodeRateLimiter);

    // Parse and validate request body
    const body = await request.json();
    const validated = assertValid(Schemas.decodeRequest, body);

    // Analyze text
    const result: DecodeResponse = await analyzeText({
      text: validated.text,
      context: validated.context,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Decode API error:', error);
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

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Decode API is ready',
      version: '1.0',
    },
  });
}

// Enable CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
