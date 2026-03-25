/**
 * Database Connection for Pebble
 * Uses Drizzle ORM with PostgreSQL (Neon via standard pg driver)
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * Create database client
 * DATABASE_URL should be set in environment variables
 */
function createDB() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('DATABASE_URL not set. Database features will be disabled.');
    return null;
  }

  try {
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });
    return drizzle(pool, { schema });
  } catch (error) {
    console.error('Failed to create database pool:', error);
    return null;
  }
}

export const db = createDB();

/**
 * Check if database is available
 */
export function isDBAvailable(): boolean {
  return db !== null;
}

// Re-export schema
export * from './schema';
