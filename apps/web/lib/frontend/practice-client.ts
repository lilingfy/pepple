import type { PracticeRequest } from '@/types/translator';

export class PracticeError extends Error {
  constructor(
    public readonly code: 'HTTP_ERROR' | 'NETWORK_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'PracticeError';
  }
}

export async function savePractice(request: PracticeRequest): Promise<void> {
  try {
    const response = await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new PracticeError('HTTP_ERROR', `HTTP ${response.status}`);
    }
  } catch (error) {
    if (error instanceof PracticeError) throw error;
    throw new PracticeError('NETWORK_ERROR', '保存失败，请稍后重试');
  }
}
