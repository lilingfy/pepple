/**
 * Database Connection for Pebble
 * Uses Drizzle ORM with PostgreSQL (Neon)
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
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
    const sql = neon(connectionString);
    return drizzle(sql, { schema });
  } catch (error) {
    console.error('Failed to connect to database:', error);
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
