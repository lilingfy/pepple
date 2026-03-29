import { eq } from "drizzle-orm";
import { db, userProfiles } from "@/lib/db";

const LOCAL_DEV_CLERK_ID = "local_dev_clerk_id";

async function ensureLocalDevUser() {
  if (!db) return null;

  try {
    // 查找或创建本地开发用户
    const existing = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.clerkId, LOCAL_DEV_CLERK_ID),
    });

    if (existing) return existing;

    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        clerkId: LOCAL_DEV_CLERK_ID,
        llmPreference: "zhipu",
      })
      .returning();

    return newProfile;
  } catch (error) {
    console.error("Failed to ensure local dev user:", error);
    return null;
  }
}

export async function getCurrentRelationUserId(): Promise<string | null> {
  // 本地开发模式：返回固定用户 ID
  if (process.env.NODE_ENV === "development") {
    const profile = await ensureLocalDevUser();
    return profile?.id ?? null;
  }

  // 生产环境：TODO 实现真实的用户认证
  return null;
}
