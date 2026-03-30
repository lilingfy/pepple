# Pebble Supabase Auth Design

## Goal

Replace placeholder auth with real Supabase Auth so Pebble has real login, real users, protected `/me` routes, and authenticated relation APIs.

## Migration Strategy: GREENFIELD CUTOVER

**This auth migration is treated as a fresh/clean cutover from Clerk to Supabase Auth.**

- No legacy Clerk user mapping is implemented
- Prior Clerk-linked identities are NOT preserved
- Users must re-register with Supabase Auth
- The `user_profiles` table uses `auth_user_id` column to map Supabase Auth users to local profiles

This is an intentional product decision to start fresh with a clean auth system.

## Implemented scope

- Supabase SSR clients for browser, server, and middleware
- Protected `/me` and `/me/*` routes via middleware
- Real email/password sign in and sign up
- Real current-user resolution from Supabase session
- Lazy local `user_profiles` creation
- `user_profiles` uses `authUserId` to map to Supabase Auth users
- Relation APIs return `401 UNAUTHORIZED` when unauthenticated
- Relation APIs return `503 SERVICE_UNAVAILABLE` when database is unavailable
- Relation APIs return `500 INTERNAL_ERROR` when profile resolution fails

## Architecture

### Supabase clients

- `apps/web/lib/supabase/client.ts`
- `apps/web/lib/supabase/server.ts`
- `apps/web/lib/supabase/middleware.ts`
- `apps/web/lib/supabase/env.ts`

### Route protection

`apps/web/middleware.ts` delegates to `updateSession()`.

Protected routes:

- `/me`
- `/me/:path*`

If no authenticated Supabase user exists, middleware redirects to:

- `/login?redirect=<pathname+search>`

### Login flow

- `apps/web/app/(main)/login/page.tsx` is the server entrypoint
- `apps/web/app/(main)/login/LoginForm.tsx` is the client form component
- `apps/web/app/(main)/login/actions.ts` owns sign-in, sign-up, and sign-out server actions

This split is intentional: the page stays a server component while the form uses `useActionState` correctly in a client boundary.

### User identity model

- Supabase Auth user ID = authentication identity
- `user_profiles.id` = local business identity
- `user_profiles.authUserId` maps the two

Business tables still reference `user_profiles.id`.

## Database

The `user_profiles.auth_user_id` column maps Supabase Auth users to local profiles:

- `apps/web/drizzle/migrations/0000_init.sql` creates `user_profiles` with `auth_user_id` column

Profile creation is lazy:

1. resolve Supabase user with `auth.getUser()`
2. look up local profile by `authUserId`
3. create one if missing
4. return local `user_profiles.id`

The implementation includes a retry-safe path for concurrent first-time requests.

## API behavior

Routes:

- `apps/web/app/api/relations/route.ts`
- `apps/web/app/api/relations/[id]/route.ts`

Rules:

- unauthenticated => `401`, code `UNAUTHORIZED`, message `未登录`
- authenticated but missing/not-owned resource => existing `404` behavior remains

Shared response helpers live in:

- `apps/web/app/api/relations/_lib/route-helpers.ts`

## Tests

Focused coverage added for:

- current-user/profile resolution
- Supabase middleware route protection
- login page rendering
- login form state handling
- login server actions
- relation API auth responses

## Out of scope

- OAuth providers
- magic links
- forgot password
- guest-session merge
