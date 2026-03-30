import { eq } from "drizzle-orm";
import { db, userProfiles } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import {
  UnauthenticatedError,
  ProfileResolutionError,
  DatabaseUnavailableError,
} from "@/lib/auth/errors";

/**
 * Get the current authenticated user's local profile ID.
 * Uses Supabase Auth to get the authenticated user, then lazy-resolves
 * the local user_profiles record by authUserId.
 *
 * This function handles concurrent profile creation safely:
 * - If two requests race to create the same profile, the unique constraint
 *   prevents duplicates, and the loser retries the lookup.
 *
 * Throws:
 * - UnauthenticatedError: No Supabase user is authenticated (maps to 401)
 * - DatabaseUnavailableError: Database is not available (maps to 503)
 * - ProfileResolutionError: Profile resolution/creation fails for authenticated user (maps to 500/503)
 *
 * Note: This auth migration is treated as a GREENFIELD/clean cutover from Clerk.
 * No legacy Clerk user mapping is implemented - users must re-register.
 */
export async function getCurrentRelationUserId(): Promise<string> {
  if (!db) {
    throw new DatabaseUnavailableError("Database connection not available");
  }

  // Get authenticated user from Supabase
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthenticatedError("未登录");
  }

  const authUserId = user.id;

  try {
    // Try to find existing profile by authUserId
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.authUserId, authUserId),
    });

    if (existingProfile) {
      return existingProfile.id;
    }

    // Attempt to create new profile
    // If a concurrent request created it first, the unique constraint will throw.
    // In that case, we retry the lookup once.
    try {
      const [newProfile] = await db
        .insert(userProfiles)
        .values({ authUserId }) // llmPreference uses schema default
        .returning();

      if (!newProfile?.id) {
        throw new ProfileResolutionError("Failed to create user profile: empty result");
      }

      return newProfile.id;
    } catch (insertError) {
      // Check for unique constraint violation (PostgreSQL code 23505)
      // pg errors have a 'code' property we can check directly
      const isUniqueViolation =
        insertError instanceof Error &&
        ((insertError as Error & { code?: string }).code === "23505" ||
          insertError.message?.includes("unique constraint"));

      if (isUniqueViolation) {
        // Another request created the profile concurrently; retry lookup
        const retriedProfile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.authUserId, authUserId),
        });
        if (retriedProfile?.id) {
          return retriedProfile.id;
        }
        throw new ProfileResolutionError(
          "Profile was created concurrently but could not be retrieved",
          insertError
        );
      }

      // Re-throw other errors as profile resolution failures
      throw new ProfileResolutionError(
        "Failed to create user profile",
        insertError
      );
    }
  } catch (error) {
    // Re-throw auth errors as-is
    if (error instanceof UnauthenticatedError) {
      throw error;
    }
    // Re-throw database unavailable errors as-is
    if (error instanceof DatabaseUnavailableError) {
      throw error;
    }
    // Re-throw profile resolution errors as-is
    if (error instanceof ProfileResolutionError) {
      throw error;
    }
    // Wrap unknown errors
    throw new ProfileResolutionError(
      "Unexpected error during profile resolution",
      error
    );
  }
}
