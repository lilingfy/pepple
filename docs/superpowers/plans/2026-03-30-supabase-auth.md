# Supabase Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Pebble's placeholder auth with real Supabase email/password authentication, protected `/me` routes, and real `user_profiles` mapped by `authUserId`.

**Architecture:** Add Supabase SSR clients for browser, server, and middleware usage; protect `/me` routes in middleware; replace fake auth resolution with a real helper that resolves the current Supabase user to a local `user_profiles` row. Keep business tables keyed by `user_profiles.id` and lazily create a profile on first authenticated access.

**Tech Stack:** Next.js 15, Supabase Auth, `@supabase/ssr`, `@supabase/supabase-js`, Drizzle ORM, Vitest

---

## File Map

### Create

- `apps/web/lib/supabase/client.ts` - browser Supabase client
- `apps/web/lib/supabase/server.ts` - server Supabase client using Next.js cookies
- `apps/web/lib/supabase/middleware.ts` - middleware session refresh + route protection helper
- `apps/web/app/(main)/login/actions.ts` - sign in, sign up, sign out server actions
- `apps/web/tests/api/current-user-auth.test.ts` - tests for real current-user/profile resolution
- `apps/web/tests/middleware/supabase-auth-guard.test.ts` - tests for protected-route middleware
- `apps/web/tests/frontend/login-page.test.tsx` - tests for login page copy/form rendering
- `apps/web/tests/backend/login-actions.test.ts` - tests for sign-in/sign-up/sign-out actions
- `apps/web/drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql` - auth column rename migration

### Modify

- `apps/web/package.json` - add Supabase dependencies
- `apps/web/.env.example` - document required Supabase env vars
- `apps/web/lib/db/schema.ts` - rename `clerkId` to `authUserId`
- `apps/web/middleware.ts` - replace fake `pebble_auth` flow with Supabase middleware flow
- `apps/web/app/(main)/login/page.tsx` - replace placeholder page with real auth page
- `apps/web/app/api/relations/_lib/current-user.ts` - resolve current Supabase user and local profile
- `apps/web/app/api/relations/route.ts` - keep `401` flow while using real auth helper
- `apps/web/app/api/relations/[id]/route.ts` - keep `401` flow while using real auth helper
- `apps/web/tests/api/auth-placeholder.test.ts` - update or replace placeholder assumptions
- `apps/web/tests/middleware/auth-guard.test.ts` - remove placeholder-cookie assumptions or replace with Supabase middleware tests

---

### Task 1: Install Supabase dependencies and scaffold shared clients

**Files:**

- Modify: `apps/web/package.json`
- Modify: `apps/web/.env.example`
- Create: `apps/web/lib/supabase/client.ts`
- Create: `apps/web/lib/supabase/server.ts`
- Create: `apps/web/lib/supabase/middleware.ts`

- [ ] **Step 1: Add package dependencies**

Update `apps/web/package.json` dependencies to include:

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.56.0"
  }
}
```

- [ ] **Step 2: Install the new packages**

Run: `npm install`

Expected: install completes and `package-lock.json` is updated.

- [ ] **Step 3: Document required auth env vars**

Update `apps/web/.env.example` to contain these lines near other app env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

If the file already contains Supabase values, normalize the names above and remove Clerk-key comments from the active auth section.

- [ ] **Step 4: Add browser client**

Create `apps/web/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 5: Add server client**

Create `apps/web/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Middleware owns refresh persistence when set is unavailable.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 6: Add middleware client helper**

Create `apps/web/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIX = "/me";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith(PROTECTED_PREFIX)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
```

- [ ] **Step 7: Smoke-check the new files compile in isolation**

Run: `npm test -- --runInBand`

Expected: existing suite may still have unrelated failures; the important outcome is that none of the new Supabase client files cause syntax errors during transform.

- [ ] **Step 8: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json apps/web/.env.example apps/web/lib/supabase/client.ts apps/web/lib/supabase/server.ts apps/web/lib/supabase/middleware.ts
git commit -m "feat: scaffold supabase auth clients"
```

---

### Task 2: Rename `clerkId` to `authUserId` and cover profile resolution

**Files:**

- Modify: `apps/web/lib/db/schema.ts`
- Create: `apps/web/drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql`
- Modify: `apps/web/app/api/relations/_lib/current-user.ts`
- Test: `apps/web/tests/api/current-user-auth.test.ts`

- [ ] **Step 1: Write the failing auth helper test**

Create `apps/web/tests/api/current-user-auth.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: { userProfiles: { findFirst: vi.fn() } },
    insert: vi.fn(),
  },
  userProfiles: { authUserId: "auth_user_id" },
}));

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { getCurrentRelationUserId } from "@/app/api/relations/_lib/current-user";

describe("getCurrentRelationUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no Supabase user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    await expect(getCurrentRelationUserId()).resolves.toBeNull();
  });

  it("returns existing local profile id", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "auth-1" } } }),
      },
    } as never);

    vi.mocked(db.query.userProfiles.findFirst).mockResolvedValue({
      id: "profile-1",
    } as never);

    await expect(getCurrentRelationUserId()).resolves.toBe("profile-1");
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `npm test -- tests/api/current-user-auth.test.ts`

Expected: FAIL because `current-user.ts` still imports the old fake dev-user flow and schema still uses `clerkId`.

- [ ] **Step 3: Write the migration**

Create `apps/web/drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql`:

```sql
ALTER TABLE "user_profiles" RENAME COLUMN "clerk_id" TO "auth_user_id";
ALTER TABLE "user_profiles" RENAME CONSTRAINT "user_profiles_clerk_id_unique" TO "user_profiles_auth_user_id_unique";
```

- [ ] **Step 4: Update the Drizzle schema**

Change `apps/web/lib/db/schema.ts` user profile block to:

```ts
// User Profiles (extends authenticated user data)
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: varchar("auth_user_id", { length: 255 }).unique().notNull(),
  llmPreference: varchar("llm_preference", { length: 50 }).default("zhipu"),
  apiKeyEncrypted: text("api_key_encrypted"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

- [ ] **Step 5: Replace fake current-user resolution with real Supabase logic**

Update `apps/web/app/api/relations/_lib/current-user.ts` to:

```ts
import { eq } from "drizzle-orm";
import { db, userProfiles } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function resolveOrCreateUserProfile(authUserId: string) {
  if (!db) {
    throw new Error("Database unavailable while resolving authenticated user");
  }

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, authUserId),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(userProfiles)
    .values({ authUserId, llmPreference: "zhipu" })
    .returning();

  if (!created) {
    throw new Error("Failed to create user profile for authenticated user");
  }

  return created;
}

export async function getCurrentRelationUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await resolveOrCreateUserProfile(user.id);
  return profile.id;
}
```

- [ ] **Step 6: Expand the test to cover lazy profile creation**

Append this case to `apps/web/tests/api/current-user-auth.test.ts`:

```ts
it("creates a local profile when the Supabase user has none", async () => {
  vi.mocked(createClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "auth-2" } } }),
    },
  } as never);

  vi.mocked(db.query.userProfiles.findFirst).mockResolvedValue(null as never);
  vi.mocked(db.insert).mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: "profile-2" }]),
    }),
  } as never);

  await expect(getCurrentRelationUserId()).resolves.toBe("profile-2");
});
```

- [ ] **Step 7: Run the auth helper test to verify it passes**

Run: `npm test -- tests/api/current-user-auth.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/web/lib/db/schema.ts apps/web/drizzle/migrations/0001_rename_clerk_id_to_auth_user_id.sql apps/web/app/api/relations/_lib/current-user.ts apps/web/tests/api/current-user-auth.test.ts
git commit -m "feat: resolve authenticated users via supabase"
```

---

### Task 3: Replace placeholder middleware auth with Supabase route protection

**Files:**

- Modify: `apps/web/middleware.ts`
- Test: `apps/web/tests/middleware/supabase-auth-guard.test.ts`

- [ ] **Step 1: Write the failing middleware test**

Create `apps/web/tests/middleware/supabase-auth-guard.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn(),
}));

import { updateSession } from "@/lib/supabase/middleware";
import { middleware } from "@/middleware";

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates every request to the Supabase middleware helper", async () => {
    vi.mocked(updateSession).mockResolvedValue({ ok: true } as never);

    const request = {
      nextUrl: new URL("http://localhost/me"),
      url: "http://localhost/me",
    } as never;
    const result = await middleware(request);

    expect(updateSession).toHaveBeenCalledWith(request);
    expect(result).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run the middleware test to verify it fails**

Run: `npm test -- tests/middleware/supabase-auth-guard.test.ts`

Expected: FAIL because `middleware.ts` still contains placeholder cookie logic.

- [ ] **Step 3: Replace middleware implementation**

Update `apps/web/middleware.ts` to:

```ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 4: Add direct behavior coverage for protected `/me` routes**

Extend `apps/web/tests/middleware/supabase-auth-guard.test.ts` with a focused test of `updateSession` itself by mocking `@supabase/ssr` and asserting:

```ts
it("redirects unauthenticated /me requests to /login with redirect param", async () => {
  // mock createServerClient().auth.getUser() => { data: { user: null } }
  // call updateSession on request to /me/relations
  // assert returned response redirects to /login?redirect=%2Fme%2Frelations
});
```

Use the same expectation for an authenticated request:

```ts
it("allows authenticated /me requests through", async () => {
  // mock getUser() => authenticated user
  // assert response is NextResponse.next()
});
```

- [ ] **Step 5: Run the middleware test suite to verify it passes**

Run: `npm test -- tests/middleware/supabase-auth-guard.test.ts`

Expected: PASS.

- [ ] **Step 6: Remove obsolete placeholder middleware test file**

Delete `apps/web/tests/middleware/auth-guard.test.ts` once the new Supabase middleware tests cover the route-protection behavior.

- [ ] **Step 7: Commit**

```bash
git add apps/web/middleware.ts apps/web/tests/middleware/supabase-auth-guard.test.ts apps/web/tests/middleware/auth-guard.test.ts
git commit -m "feat: protect me routes with supabase auth"
```

---

### Task 4: Build the real login page and auth server actions

**Files:**

- Modify: `apps/web/app/(main)/login/page.tsx`
- Create: `apps/web/app/(main)/login/actions.ts`
- Test: `apps/web/tests/frontend/login-page.test.tsx`
- Test: `apps/web/tests/backend/login-actions.test.ts`

- [ ] **Step 1: Write the failing login page test**

Create `apps/web/tests/frontend/login-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoginPage from "@/app/(main)/login/page";

describe("LoginPage", () => {
  it("renders email/password auth controls", async () => {
    const page = await LoginPage({
      searchParams: Promise.resolve({ redirect: "/me" }),
    });
    render(page);

    expect(
      screen.getByRole("heading", { name: "登录 Pebble AI" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("邮箱")).toBeInTheDocument();
    expect(screen.getByLabelText("密码")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "注册" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Write the failing server action test**

Create `apps/web/tests/backend/login-actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signInAction } from "@/app/(main)/login/actions";

describe("signInAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to redirect target on successful sign in", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: null }) },
    } as never);

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password123");
    formData.set("redirectTo", "/me/relations");

    await signInAction(null, formData);
    expect(redirect).toHaveBeenCalledWith("/me/relations");
  });
});
```

- [ ] **Step 3: Run both tests to verify they fail**

Run: `npm test -- tests/frontend/login-page.test.tsx tests/backend/login-actions.test.ts`

Expected: FAIL because the page and actions do not yet provide real email/password auth.

- [ ] **Step 4: Implement auth server actions**

Create `apps/web/app/(main)/login/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error: string | null;
  message: string | null;
}

const INITIAL_STATE: AuthFormState = { error: null, message: null };

export async function signInAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/me");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message, message: null };

  revalidatePath("/", "layout");
  redirect(redirectTo || "/me");
}

export async function signUpAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/me");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message, message: null };
  if (!data.session) {
    return { error: null, message: "注册成功，请先完成邮箱验证后再登录。" };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo || "/me");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export { INITIAL_STATE };
```

- [ ] **Step 5: Replace the placeholder page with a real form**

Update `apps/web/app/(main)/login/page.tsx` to render a server component containing email/password inputs, hidden `redirectTo`, and two submit buttons using the server actions. The core form body should look like:

```tsx
<h1 className="text-2xl font-bold text-[#2C3E50] mb-4">登录 Pebble AI</h1>
<p className="text-[#7D8C9F] mb-6">使用真实账号进入你的用户中心。</p>
<form className="space-y-4">
  <input type="hidden" name="redirectTo" value={redirectUrl} />
  <label className="block text-sm font-medium text-[#2C3E50]" htmlFor="email">邮箱</label>
  <input id="email" name="email" type="email" required className="..." />
  <label className="block text-sm font-medium text-[#2C3E50]" htmlFor="password">密码</label>
  <input id="password" name="password" type="password" minLength={8} required className="..." />
  <div className="grid grid-cols-2 gap-3">
    <button formAction={signInAction} className="...">登录</button>
    <button formAction={signUpAction} className="...">注册</button>
  </div>
</form>
```

Keep the existing visual language; remove all copy about `pebble_auth` and browser-console cookies.

- [ ] **Step 6: Add additional action tests**

Extend `apps/web/tests/backend/login-actions.test.ts` to cover:

```ts
it("returns an error state when sign in fails", async () => {
  // mock signInWithPassword => { error: { message: "Invalid login credentials" } }
  // expect returned state.error to match message
});

it("returns verify-email message when sign up has no session", async () => {
  // mock signUp => { data: { session: null }, error: null }
  // expect returned state.message to contain 邮箱验证
});

it("redirects to login after sign out", async () => {
  // mock signOut success and expect redirect("/login")
});
```

- [ ] **Step 7: Run the page and action tests to verify they pass**

Run: `npm test -- tests/frontend/login-page.test.tsx tests/backend/login-actions.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/web/app/(main)/login/page.tsx apps/web/app/(main)/login/actions.ts apps/web/tests/frontend/login-page.test.tsx apps/web/tests/backend/login-actions.test.ts
git commit -m "feat: add supabase login and signup flows"
```

---

### Task 5: Wire relation APIs to real auth and retire placeholder tests

**Files:**

- Modify: `apps/web/app/api/relations/route.ts`
- Modify: `apps/web/app/api/relations/[id]/route.ts`
- Modify: `apps/web/tests/api/auth-placeholder.test.ts`

- [ ] **Step 1: Rewrite the API auth test around real auth semantics**

Update `apps/web/tests/api/auth-placeholder.test.ts` so it becomes the long-term auth behavior test. Rename the describe block to `Relations auth responses` and keep these assertions:

```ts
expect(res.status).toBe(401);
expect(data.success).toBe(false);
expect(data.error.code).toBe("UNAUTHORIZED");
```

Also add one authenticated-path smoke test by mocking `getCurrentRelationUserId` to return `"profile-1"` and mocking `relationService.list` to return an empty array for `GET /api/relations`.

- [ ] **Step 2: Run the API auth test to verify current failures**

Run: `npm test -- tests/api/auth-placeholder.test.ts`

Expected: FAIL if any route still depends on placeholder assumptions or if authenticated behavior is not mocked cleanly.

- [ ] **Step 3: Keep the route handlers simple and auth-agnostic**

Ensure `apps/web/app/api/relations/route.ts` and `apps/web/app/api/relations/[id]/route.ts` do not contain any provider-specific logic. The unauthenticated branch should stay in this shape:

```ts
if (!userId) {
  return NextResponse.json(
    {
      success: false,
      error: toErrorResponse(
        { code: "UNAUTHORIZED", message: "未登录", status: 401 },
        requestId,
      ),
    },
    { status: 401 },
  );
}
```

No fake local-dev fallback should remain anywhere in these files.

- [ ] **Step 4: Run the API auth test to verify it passes**

Run: `npm test -- tests/api/auth-placeholder.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/api/relations/route.ts apps/web/app/api/relations/[id]/route.ts apps/web/tests/api/auth-placeholder.test.ts
git commit -m "refactor: use real auth semantics in relations api"
```

---

### Task 6: Verify locally and document the new auth setup

**Files:**

- Modify: `docs/superpowers/specs/2026-03-30-supabase-auth-design.md` (only if implementation diverges)
- Modify: `apps/web/.env.example`

- [ ] **Step 1: Run focused test suites**

Run:

```bash
npm test -- tests/api/current-user-auth.test.ts tests/api/auth-placeholder.test.ts tests/middleware/supabase-auth-guard.test.ts tests/frontend/login-page.test.tsx tests/backend/login-actions.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run Drizzle migration generation/check command if used in this repo**

Run: `npm run db:generate`

Expected: migration metadata updates successfully or reports no further schema diff beyond the checked-in rename migration.

- [ ] **Step 3: Manually verify login redirect flow**

Run the app and verify:

1. visit `/me` while signed out
2. confirm redirect to `/login?redirect=%2Fme`
3. sign up or sign in with a real Supabase account
4. confirm redirect back to `/me`
5. confirm first authenticated relation request creates a `user_profiles` row with `auth_user_id = <supabase user id>`

- [ ] **Step 4: Update docs if implementation details changed**

If the final code differs from the approved spec, update `docs/superpowers/specs/2026-03-30-supabase-auth-design.md` so it matches the shipped implementation exactly.

- [ ] **Step 5: Final commit**

```bash
git add apps/web/.env.example docs/superpowers/specs/2026-03-30-supabase-auth-design.md
git commit -m "docs: document supabase auth setup"
```

---

## Self-Review

- Spec coverage check: covered Supabase clients, middleware route protection, real login page, server actions, `authUserId` rename migration, lazy `user_profiles` creation, API `401` behavior, and focused tests.
- Placeholder scan: no `TODO`, `TBD`, or undefined implementation gaps remain in the task list.
- Type consistency check: plan consistently uses `authUserId`, `createClient`, `updateSession`, and `getCurrentRelationUserId` across tasks.
