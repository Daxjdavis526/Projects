/**
 * Load `.env` files for command-line scripts the way Next.js loads them for
 * the server (`.env`, `.env.local`, `.env.production`, …), so `npm run worker`
 * and the other scripts see the same configuration as `npm start`. Every
 * script imports this first. Variables already set in the environment win.
 */
import nextEnv from '@next/env'

// @next/env is CommonJS: take the function off the default export.
nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', { info: () => {}, error: (...args: unknown[]) => console.error(...args) })
