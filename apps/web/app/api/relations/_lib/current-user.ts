import { eq } from 'drizzle-orm';
import { db, userProfiles } from '@/lib/db';
import { ensureUserProfile, getAuth } from '@/lib/clerk';

const LOCAL_DEV_CLERK_ID = 'local_dev_clerk_id';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function ensureLocalDevUser() {
  if (!db) return null;

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.clerkId, LOCAL_DEV_CLERK_ID),
  });

  if (existing) return existing;

  const [newProfile] = await db
    .insert(userProfiles)
    .values({
      id: generateId(),
      clerkId: LOCAL_DEV_CLERK_ID,
      llmPreference: 'zhipu',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newProfile;
}

export async function getCurrentRelationUserId(): Promise<string | null> {
  try {
    const { userId } = await getAuth();
    if (userId) {
      const profile = await ensureUserProfile(userId);
      return profile?.id ?? null;
    }
  } catch {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const profile = await ensureLocalDevUser();
  return profile?.id ?? null;
}
