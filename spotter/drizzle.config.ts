import { defineConfig } from 'drizzle-kit'

// Generates SQL migrations from src/core/db/schema.ts into ./drizzle.
// Applying them is done by the app itself (npm run db:migrate, or
// automatically at startup unless AUTO_MIGRATE=false).
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/core/db/schema.ts',
  out: './drizzle',
  strict: true,
  verbose: true,
})
