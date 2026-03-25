import { NextRequest, NextResponse } from 'next/server';
import { simulatorService } from '@/lib/backend/services/simulator-service';
import { normalizeApiFailure, generateRequestId, toErrorResponse } from '@/lib/backend/errors';

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const { sessionId } = await params;
    const result = await simulatorService.endSession(sessionId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('End session error:', error);
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
