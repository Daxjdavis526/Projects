/**
 * Liveness/readiness for load balancers and uptime checks. Reports whether
 * the database answers and whether this process runs the worker. No data,
 * no configuration values.
 */
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/core/db/client'
import { inProcessWorker } from '@/core/pipeline/worker'

export const dynamic = 'force-dynamic'

export async function GET() {
  let database = 'ok'
  try {
    const db = await getDb()
    await db.execute(sql`select 1`)
  } catch {
    database = 'unavailable'
  }
  const worker = inProcessWorker()?.status() ?? null
  const body = {
    status: database === 'ok' ? 'ok' : 'degraded',
    database,
    worker: worker ? { running: worker.running, lastTickAt: worker.lastTickAt, busy: !!worker.currentRunId, lastError: worker.lastError ? 'see server log' : null } : 'not in this process',
    time: new Date().toISOString(),
  }
  return NextResponse.json(body, { status: database === 'ok' ? 200 : 503, headers: { 'cache-control': 'no-store' } })
}
