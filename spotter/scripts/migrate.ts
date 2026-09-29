/**
 * Apply database migrations (./drizzle) to DATABASE_URL, or to the embedded
 * PGlite database when DATABASE_URL is unset.
 *
 *   npm run db:migrate
 */
import { openDatabase } from '../src/core/db/client'
import { getLogger } from '../src/core/observability/logger'

const log = getLogger('migrate')
const handle = await openDatabase({ runMigrations: true })
log.info('Migrations applied', { driver: handle.kind })
await handle.close()
