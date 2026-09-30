/**
 * The background worker: a single loop that
 *   1. marks runs abandoned by a crashed worker as failed,
 *   2. enqueues scheduled runs that are due,
 *   3. claims and executes queued runs one at a time,
 *   4. runs retention once a day.
 *
 * It runs inside the web server by default (RUN_WORKER_IN_WEB=true), or on
 * its own with `npm run worker`. Several workers can run against the same
 * PostgreSQL database safely; with embedded PGlite, run only one process.
 */
import { hostname } from 'node:os'
import { randomUUID } from 'node:crypto'
import type { Env } from '../config/env'
import { getDb } from '../db/client'
import type { Database } from '../db/client'
import type { Logger } from '../observability/logger'
import { eq } from 'drizzle-orm'
import { collectionRuns } from '../db/schema'
import { runDemoSetupJob } from '../demo/seed'
import { runRetention } from './retention'
import { executeRun } from './runner'
import { claimNextRun, enqueueDueRuns, recoverStaleRuns } from './scheduler'

export interface WorkerHandle {
  readonly id: string
  /** Run a tick as soon as possible (e.g. right after "Refresh now"). */
  wake(): void
  stop(): Promise<void>
  status(): { running: boolean; lastTickAt: Date | null; lastError: string | null; currentRunId: string | null }
}

export function startWorker(options: { env: Env; logger: Logger; db?: Database; pollIntervalMs?: number }): WorkerHandle {
  const id = `${hostname()}-${process.pid}-${randomUUID().slice(0, 8)}`
  const logger = options.logger.child({ component: 'worker', workerId: id })
  const pollMs = options.pollIntervalMs ?? options.env.WORKER_POLL_INTERVAL_MS
  let timer: NodeJS.Timeout | null = null
  let stopped = false
  let busy: Promise<void> | null = null
  let lastTickAt: Date | null = null
  let lastError: string | null = null
  let currentRunId: string | null = null
  let lastRetention = 0

  const tick = async () => {
    const db = options.db ?? (await getDb())
    const now = new Date()
    lastTickAt = now
    const recovered = await recoverStaleRuns(db, now)
    if (recovered) logger.warn('Recovered stale runs', { count: recovered })
    const queued = await enqueueDueRuns(db, now)
    if (queued) logger.info('Scheduled runs queued', { count: queued })
    for (let i = 0; i < 5 && !stopped; i++) {
      const runId = await claimNextRun(db, id, new Date())
      if (!runId) break
      currentRunId = runId
      try {
        const [run] = await db.select({ trigger: collectionRuns.trigger }).from(collectionRuns).where(eq(collectionRuns.id, runId)).limit(1)
        if (run?.trigger === 'demo_setup') await runDemoSetupJob(db, options.env, runId, logger)
        else await executeRun(db, options.env, runId, { logger })
      } finally {
        currentRunId = null
      }
    }
    if (Date.now() - lastRetention > 24 * 3_600_000 && !stopped) {
      lastRetention = Date.now()
      await runRetention(db, options.env, new Date(), logger)
    }
  }

  const loop = () => {
    if (stopped) return
    busy = tick()
      .then(() => {
        lastError = null
      })
      .catch((err) => {
        lastError = err instanceof Error ? err.message : String(err)
        logger.error('Worker tick failed', { error: err })
      })
      .finally(() => {
        busy = null
        if (!stopped) {
          timer = setTimeout(loop, pollMs)
          timer.unref?.()
        }
      })
  }

  logger.info('Worker started', { pollMs })
  timer = setTimeout(loop, 1_000)
  timer.unref?.()

  return {
    id,
    wake() {
      if (stopped || busy) return
      if (timer) clearTimeout(timer)
      loop()
    },
    async stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      if (busy) await busy
      logger.info('Worker stopped')
    },
    status: () => ({ running: !stopped, lastTickAt, lastError, currentRunId }),
  }
}

const globalForWorker = globalThis as unknown as { __spotterWorker?: WorkerHandle }

/** The in-process worker, if this process runs one. */
export function inProcessWorker(): WorkerHandle | null {
  return globalForWorker.__spotterWorker ?? null
}

export function ensureInProcessWorker(env: Env, logger: Logger): WorkerHandle {
  globalForWorker.__spotterWorker ??= startWorker({ env, logger })
  return globalForWorker.__spotterWorker
}
