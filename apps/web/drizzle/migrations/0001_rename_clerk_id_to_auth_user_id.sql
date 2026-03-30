-- Migration: Rename clerk_id to auth_user_id
-- This aligns the database schema with Supabase Auth

--> statement-breakpoint
-- Rename the column
ALTER TABLE "user_profiles" RENAME COLUMN "clerk_id" TO "auth_user_id";

--> statement-breakpoint
-- Rename the unique constraint
ALTER TABLE "user_profiles" RENAME CONSTRAINT "user_profiles_clerk_id_unique" TO "user_profiles_auth_user_id_unique";
