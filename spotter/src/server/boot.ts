import { getEnv } from '@/core/config/env'
import { closeDb, getDbHandle } from '@/core/db/client'
import { getLogger } from '@/core/observability/logger'
import { ensureInProcessWorker, inProcessWorker } from '@/core/pipeline/worker'

const g = globalThis as unknown as { __spotterBooted?: boolean }

export async function boot(): Promise<void> {
  if (g.__spotterBooted) return
  g.__spotterBooted = true
  const log = getLogger('boot')
  let env
  try {
    env = getEnv()
  } catch (err) {
    // Invalid configuration: pages will show the error; do not crash the process.
    log.error('Invalid environment configuration', { error: err })
    return
  }
  try {
    const handle = await getDbHandle()
    log.info('Database connected', { driver: handle.kind })
  } catch (err) {
    log.error('Database unavailable at startup; retrying on first request', { error: err })
  }
  if (env.RUN_WORKER_IN_WEB) {
    ensureInProcessWorker(env, getLogger('worker'))
  } else {
    log.info('In-process worker disabled (RUN_WORKER_IN_WEB=false); run `npm run worker` separately')
  }
  const shutdown = async (signal: string) => {
    log.info('Shutting down', { signal })
    await inProcessWorker()?.stop()
    await closeDb()
    process.exit(0)
  }
  process.once('SIGTERM', () => void shutdown('SIGTERM'))
  process.once('SIGINT', () => void shutdown('SIGINT'))
}
