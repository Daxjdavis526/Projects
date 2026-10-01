/**
 * Runs once when the Next.js server starts: opens the database (applying
 * migrations when AUTO_MIGRATE is on) and, unless RUN_WORKER_IN_WEB=false,
 * starts the background collector inside this process.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  const { boot } = await import('./server/boot')
  await boot()
}

export async function onRequestError(err: unknown, request: { path: string; method: string }) {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { getLogger } = await import('./core/observability/logger')
  getLogger('web').error('Request failed', { error: err, path: request.path, method: request.method })
}
