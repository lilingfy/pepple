import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(__dirname, '.env.local') });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
