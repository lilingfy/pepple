/**
 * Schema Validation Utilities
 * Zod-based validation for API inputs
 */

import { z, type ZodSchema, type ZodError } from 'zod';
import { createBackendError, BackendErrorException } from '../errors';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError; formattedErrors: Record<string, string[]> };

/**
 * Validate data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result
 */
export function validateWithSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const formattedErrors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(issue.message);
  }

  return {
    success: false,
    error: result.error,
    formattedErrors,
  };
}

/**
 * Assert validation and throw on failure
 * @param schema - Zod schema
 * @param data - Data to validate
 * @throws BackendErrorException on validation failure
 */
export function assertValid<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = validateWithSchema(schema, data);

  if (!result.success) {
    throw new BackendErrorException(
      'BAD_REQUEST',
      'Validation failed',
      400,
      { errors: result.formattedErrors }
    );
  }

  return result.data;
}

// Common schemas
export const Schemas = {
  uuid: z.string().uuid(),

  pagination: z.object({
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(20),
  }),

  decodeRequest: z.object({
    text: z.string().min(1).max(5000),
    context: z.string().max(1000).optional(),
  }),

  practiceCreate: z.object({
    sourceType: z.enum(['decode', 'simulator']),
    primaryReply: z.string().min(1).max(2000),
    content: z.record(z.unknown()),
  }),

  practiceUpdate: z.object({
    isFavorite: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    primaryReply: z.string().min(1).max(2000).optional(),
  }),

  simulatorStart: z.object({
    scenarioId: z.string().min(1),
  }),

  simulatorContinue: z.object({
    sessionId: z.string().uuid(),
    message: z.string().min(1).max(2000),
  }),
};
