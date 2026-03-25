import { NextResponse } from 'next/server';
import { simulatorService } from '@/lib/backend/services/simulator-service';
import { generateRequestId } from '@/lib/backend/errors';

export async function GET(): Promise<NextResponse> {
  const requestId = generateRequestId();

  try {
    const scenarios = simulatorService.getScenarios();
    return NextResponse.json({
      success: true,
      data: { scenarios },
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取场景列表失败',
          requestId,
        },
      },
      { status: 500 }
    );
  }
}
