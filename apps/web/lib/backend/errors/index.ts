/**
 * Backend Error Handling
 * Unified error creation and normalization
 */

import type { BackendErrorResponse } from '@pebble/types';

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface BackendError {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export function createBackendError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): BackendError {
  const statusMap: Record<ErrorCode, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    RATE_LIMITED: 429,
    TIMEOUT: 408,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  };

  return {
    code,
    message,
    status: statusMap[code],
    details,
  };
}

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function toErrorResponse(
  error: BackendError,
  requestId: string = generateRequestId()
): BackendErrorResponse {
  return {
    code: error.code,
    message: error.message,
    details: error.details,
    requestId,
  };
}

export function normalizeApiFailure(error: unknown): BackendError {
  if (isBackendError(error)) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return createBackendError('TIMEOUT', 'Request timed out');
    }
    return createBackendError('INTERNAL_ERROR', error.message);
  }

  return createBackendError('INTERNAL_ERROR', 'An unexpected error occurred');
}

function isBackendError(error: unknown): error is BackendError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'status' in error
  );
}

export class BackendErrorException extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BackendErrorException';
  }

  toResponse(requestId: string): BackendErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      requestId,
    };
  }
}
