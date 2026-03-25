/**
 * Guest Session Management
 * Anonymous session handling via cookies
 */

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { guestSessions } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { generateRequestId, createBackendError } from '../errors';

const GUEST_SESSION_COOKIE = 'pebble_guest_session';
const SESSION_EXPIRY_DAYS = 30;

export interface GuestSession {
  id: string;
  sessionToken: string;
  userId: string | null;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Ensure a guest session exists
 * Returns existing session or creates a new one
 */
export async function ensureGuestSession(): Promise<GuestSession> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(GUEST_SESSION_COOKIE)?.value;

  if (existingToken) {
    const session = await getSessionByToken(existingToken);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
  }

  return createGuestSession();
}

/**
 * Get current guest session without creating one
 */
export async function getCurrentGuestSession(): Promise<GuestSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await getSessionByToken(token);
  if (session && session.expiresAt > new Date()) {
    return session;
  }

  return null;
}

/**
 * Create a new guest session
 */
async function createGuestSession(): Promise<GuestSession> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  const [session] = await db
    .insert(guestSessions)
    .values({
      sessionToken,
      userId: null,
      expiresAt,
    })
    .returning();

  if (!session) {
    throw createBackendError('INTERNAL_ERROR', 'Failed to create guest session');
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(GUEST_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  });

  return {
    id: session.id,
    sessionToken: session.sessionToken,
    userId: session.userId,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
  };
}

/**
 * Get session by token
 */
async function getSessionByToken(token: string): Promise<GuestSession | null> {
  const [session] = await db
    .select()
    .from(guestSessions)
    .where(
      and(
        eq(guestSessions.sessionToken, token),
        gt(guestSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) return null;

  return {
    id: session.id,
    sessionToken: session.sessionToken,
    userId: session.userId,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
  };
}

/**
 * Link guest session to a Clerk user
 */
export async function linkGuestSessionToUser(
  guestSessionId: string,
  userId: string
): Promise<void> {
  await db
    .update(guestSessions)
    .set({ userId })
    .where(eq(guestSessions.id, guestSessionId));
}

/**
 * Generate a cryptographically secure session token
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Clear guest session cookie
 */
export async function clearGuestSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_SESSION_COOKIE);
}
