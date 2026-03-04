/**
 * Clerk Authentication Configuration for Pebble
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { db, userProfiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * Get current authenticated user from Clerk
 */
export async function getCurrentUser() {
  return await currentUser();
}

/**
 * Get authentication status
 */
export async function getAuth() {
  return await auth();
}

/**
 * Ensure user profile exists in database
 * Creates profile if it doesn't exist
 */
export async function ensureUserProfile(clerkId: string) {
  if (!db) {
    console.warn('Database not available, skipping profile creation');
    return null;
  }

  try {
    // Check if profile exists
    const existing = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.clerkId, clerkId),
    });

    if (existing) {
      return existing;
    }

    // Create new profile
    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        clerkId,
        llmPreference: 'zhipu',
      })
      .returning();

    return newProfile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return null;
  }
}

/**
 * Get or create user profile
 */
export async function getUserProfile(clerkId: string) {
  if (!db) return null;

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.clerkId, clerkId),
  });

  return profile;
}

/**
 * Update user LLM preference
 */
export async function updateLLMPreference(
  clerkId: string,
  preference: string
) {
  if (!db) return null;

  const [updated] = await db
    .update(userProfiles)
    .set({
      llmPreference: preference,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.clerkId, clerkId))
    .returning();

  return updated;
}

// Re-export from Clerk
export { auth, currentUser } from '@clerk/nextjs/server';
