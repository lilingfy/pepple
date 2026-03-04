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
// Analysis Logs (metadata only, content in IndexedDB)
// ==========================================

export const analysisLogs = pgTable('analysis_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  attackType: varchar('attack_type', { length: 100 }),
  scenario: varchar('scenario', { length: 100 }),
  responseOptionUsed: varchar('response_option_used', { length: 20 }),
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

export type AnalysisLog = typeof analysisLogs.$inferSelect;
export type NewAnalysisLog = typeof analysisLogs.$inferInsert;

export type SimulationSession = typeof simulationSessions.$inferSelect;
export type NewSimulationSession = typeof simulationSessions.$inferInsert;

export type PanicSession = typeof panicSessions.$inferSelect;
export type NewPanicSession = typeof panicSessions.$inferInsert;

export type UserActivityStat = typeof userActivityStats.$inferSelect;
export type NewUserActivityStat = typeof userActivityStats.$inferInsert;
