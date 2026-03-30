/**
 * Relations Route Helpers
 * Shared response builders for relations API routes
 */

import { NextResponse } from 'next/server';
import { toErrorResponse, normalizeApiFailure, type BackendError } from '@/lib/backend/errors';
import { isAuthError, UnauthenticatedError, DatabaseUnavailableError } from '@/lib/auth/errors';

export interface ResponseHelpers {
  requestId: string;
  unauthorized: () => NextResponse;
  notFound: (message?: string) => NextResponse;
  error: (error: unknown) => NextResponse;
  authError: (error: unknown) => NextResponse;
}

export function createResponseHelpers(requestId: string): ResponseHelpers {
  return {
    requestId,

    unauthorized() {
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse({ code: 'UNAUTHORIZED', message: '未登录', status: 401 }, requestId),
        },
        { status: 401 }
      );
    },

    notFound(message = '关系不存在') {
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse({ code: 'NOT_FOUND', message, status: 404 }, requestId),
        },
        { status: 404 }
      );
    },

    error(err: unknown) {
      const backendError = normalizeApiFailure(err);
      return NextResponse.json(
        {
          success: false,
          error: toErrorResponse(backendError, requestId),
        },
        { status: backendError.status }
      );
    },

    authError(err: unknown) {
      // Handle auth-specific errors with appropriate status codes
      if (isAuthError(err)) {
        if (err instanceof UnauthenticatedError) {
          return this.unauthorized();
        }
        if (err instanceof DatabaseUnavailableError) {
          return NextResponse.json(
            {
              success: false,
              error: toErrorResponse({ 
                code: 'SERVICE_UNAVAILABLE', 
                message: err.message, 
                status: 503 
              }, requestId),
            },
            { status: 503 }
          );
        }
        // Profile resolution errors map to 500
        return NextResponse.json(
          {
            success: false,
            error: toErrorResponse({ 
              code: 'INTERNAL_ERROR', 
              message: err.message, 
              status: 500 
            }, requestId),
          },
          { status: 500 }
        );
      }
      // Fall back to generic error handling
      return this.error(err);
    },
  };
}

/**
 * Maps service-layer 403 errors to 404 for security (don't leak existence)
 */
export function mapForbiddenToNotFound(status: number): number {
  return status === 403 ? 404 : status;
}
