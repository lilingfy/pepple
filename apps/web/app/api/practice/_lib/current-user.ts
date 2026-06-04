import { getCurrentRelationUserId } from '@/app/api/relations/_lib/current-user';
import { getCurrentGuestSession } from '@/lib/backend/sessions/guest';
import { createBackendError } from '@/lib/backend/errors';
import { UnauthenticatedError } from '@/lib/auth/errors';

export async function resolvePracticeOwner(): Promise<{ userId: string | null; guestSessionId: string | null }> {
  try {
    const userId = await getCurrentRelationUserId();
    return { userId, guestSessionId: null };
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      const guestSession = await getCurrentGuestSession();
      if (!guestSession) {
        throw createBackendError('UNAUTHORIZED', 'Authentication required');
      }
      return { userId: null, guestSessionId: guestSession.id };
    }
    throw error;
  }
}
