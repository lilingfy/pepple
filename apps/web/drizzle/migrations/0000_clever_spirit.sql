CREATE TABLE "analysis_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"guest_session_id" uuid,
	"attack_type" varchar(100),
	"scenario" varchar(100),
	"response_option_used" varchar(20),
	"emotion_score" integer,
	"neutrality_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" uuid,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guest_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "panic_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"duration_seconds" integer DEFAULT 0,
	"technique" varchar(20) DEFAULT '4-7-8',
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_session_id" uuid,
	"user_id" uuid,
	"source_type" varchar(20) NOT NULL,
	"primary_reply" text NOT NULL,
	"content_jsonb" jsonb NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"scenario_id" varchar(50) NOT NULL,
	"final_score" integer,
	"turns_count" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"history_snapshot" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulation_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"analysis_jsonb" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"date" timestamp NOT NULL,
	"analysis_count" integer DEFAULT 0,
	"simulation_count" integer DEFAULT 0,
	"panic_session_count" integer DEFAULT 0,
	"average_neutrality_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"llm_preference" varchar(50) DEFAULT 'zhipu',
	"api_key_encrypted" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "analysis_logs" ADD CONSTRAINT "analysis_logs_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_logs" ADD CONSTRAINT "analysis_logs_guest_session_id_guest_sessions_id_fk" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_sessions" ADD CONSTRAINT "guest_sessions_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panic_sessions" ADD CONSTRAINT "panic_sessions_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_entries" ADD CONSTRAINT "practice_entries_guest_session_id_guest_sessions_id_fk" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_entries" ADD CONSTRAINT "practice_entries_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulation_sessions" ADD CONSTRAINT "simulation_sessions_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulation_turns" ADD CONSTRAINT "simulation_turns_session_id_simulation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."simulation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_stats" ADD CONSTRAINT "user_activity_stats_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;