/**
 * Drizzle Schema for Pebble
 * PostgreSQL database schema for user data and analytics
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';

// ==========================================
// User Profiles (extends Clerk user data)
// ==========================================

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
  llmPreference: varchar('llm_preference', { length: 50 }).default('zhipu'),
  apiKeyEncrypted: text('api_key_encrypted'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// Guest Sessions (for anonymous users)
// ==========================================

export const guestSessions = pgTable('guest_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).unique().notNull(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// Practice Entries (saved from decode/simulator)
// ==========================================

export const practiceEntries = pgTable('practice_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestSessionId: uuid('guest_session_id').references(() => guestSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  sourceType: varchar('source_type', { length: 20 }).notNull(), // 'decode' | 'simulator'
  primaryReply: text('primary_reply').notNull(),
  contentJsonb: jsonb('content_jsonb').notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// Simulation Turns (individual messages in a session)
// ==========================================

export const simulationTurns = pgTable('simulation_turns', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => simulationSessions.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  analysisJsonb: jsonb('analysis_jsonb'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// Analysis Logs (metadata only, content in IndexedDB)
// ==========================================

export const analysisLogs = pgTable('analysis_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  guestSessionId: uuid('guest_session_id').references(() => guestSessions.id, { onDelete: 'cascade' }),
  attackType: varchar('attack_type', { length: 100 }),
  scenario: varchar('scenario', { length: 100 }),
  responseOptionUsed: varchar('response_option_used', { length: 20 }),
  emotionScore: integer('emotion_score'),
  neutralityScore: integer('neutrality_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// Simulation Sessions
// ==========================================

export const simulationSessions = pgTable('simulation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  scenarioId: varchar('scenario_id', { length: 50 }).notNull(),
  finalScore: integer('final_score'),
  turnsCount: integer('turns_count').default(0),
  completed: boolean('completed').default(false),
  historySnapshot: jsonb('history_snapshot'), // Store last state
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// Panic Session Records
// ==========================================

export const panicSessions = pgTable('panic_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  durationSeconds: integer('duration_seconds').default(0),
  technique: varchar('technique', { length: 20 }).default('4-7-8'),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// User Activity Stats (daily aggregation)
// ==========================================

export const userActivityStats = pgTable('user_activity_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  analysisCount: integer('analysis_count').default(0),
  simulationCount: integer('simulation_count').default(0),
  panicSessionCount: integer('panic_session_count').default(0),
  averageNeutralityScore: integer('average_neutrality_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// Type Exports
// ==========================================

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type GuestSession = typeof guestSessions.$inferSelect;
export type NewGuestSession = typeof guestSessions.$inferInsert;

export type PracticeEntry = typeof practiceEntries.$inferSelect;
export type NewPracticeEntry = typeof practiceEntries.$inferInsert;

export type AnalysisLog = typeof analysisLogs.$inferSelect;
export type NewAnalysisLog = typeof analysisLogs.$inferInsert;

export type SimulationSession = typeof simulationSessions.$inferSelect;
export type NewSimulationSession = typeof simulationSessions.$inferInsert;

export type SimulationTurn = typeof simulationTurns.$inferSelect;
export type NewSimulationTurn = typeof simulationTurns.$inferInsert;

export type PanicSession = typeof panicSessions.$inferSelect;
export type NewPanicSession = typeof panicSessions.$inferInsert;

export type UserActivityStat = typeof userActivityStats.$inferSelect;
export type NewUserActivityStat = typeof userActivityStats.$inferInsert;
