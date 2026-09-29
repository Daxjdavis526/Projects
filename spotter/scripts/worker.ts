/**
 * The background collector on its own:
 *
 *   npm run worker
 *
 * Use this with RUN_WORKER_IN_WEB=false when the web server and the worker
 * run as separate processes (several workers may share one PostgreSQL).
 */
import { getEnv } from '../src/core/config/env'
import { closeDb, getDbHandle } from '../src/core/db/client'
import { getLogger } from '../src/core/observability/logger'
import { startWorker } from '../src/core/pipeline/worker'

const log = getLogger('worker')
const env = getEnv()
await getDbHandle()
const worker = startWorker({ env, logger: log })
const stop = async (signal: string) => {
  log.info('Stopping', { signal })
  await worker.stop()
  await closeDb()
  process.exit(0)
}
process.once('SIGINT', () => void stop('SIGINT'))
process.once('SIGTERM', () => void stop('SIGTERM'))
