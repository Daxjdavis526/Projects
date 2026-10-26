/**
 * Set a new password for a SPOTTER account, for when it is forgotten.
 *
 *   npm run reset-password                      # the only account (or lists them)
 *   npm run reset-password -- you@example.com
 *
 * Asks for the new password, or makes a random one when you just press Enter,
 * and signs the account out everywhere. With the embedded database, close
 * SPOTTER first: only one program may open it at a time.
 */
import './load-env'
import { randomInt } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import { getEnv } from '../src/core/config/env'
import { openDatabase } from '../src/core/db/client'
import { users } from '../src/core/db/schema'
import { normalizeEmail, setPassword, UserInputError } from '../src/core/services/users'

const say = (msg = '') => process.stdout.write(`${msg}\n`)
const stop = (msg: string): never => {
  say(`\n  ${msg}\n`)
  process.exit(1)
}

const env = getEnv()
if (!env.DATABASE_URL) {
  const running = await fetch(new URL('/api/health', env.APP_URL), { signal: AbortSignal.timeout(2000) }).then(
    () => true,
    () => false,
  )
  if (running) stop('SPOTTER is running. Close its window first, then run this again.')
}

const handle = await openDatabase({ runMigrations: true })
try {
  const wanted = process.argv[2]
  const accounts = await handle.db.select({ id: users.id, email: users.email }).from(users)
  const account = wanted ? accounts.find((a) => a.email === normalizeEmail(wanted)) : accounts.length === 1 ? accounts[0] : undefined
  if (!account) {
    if (accounts.length === 0) stop('There is no account yet: start SPOTTER and create one.')
    stop(
      wanted
        ? `No account uses ${wanted}. The accounts are: ${accounts.map((a) => a.email).join(', ')}`
        : `Say which account: npm run reset-password -- you@example.com  (accounts: ${accounts.map((a) => a.email).join(', ')})`,
    )
  }

  let password = ''
  if (process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    say(`\n  New password for ${account!.email}`)
    password = (await rl.question('  Type it (at least 10 characters), or just press Enter for a random one: ')).trim()
    rl.close()
  }
  const random = !password
  if (random) {
    // Easy to read aloud and type: no 0/O, 1/l/I.
    const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
    password = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join('')).join('-')
  }
  try {
    await setPassword(handle.db, account!.id, password)
  } catch (err) {
    if (err instanceof UserInputError) stop(`${err.message} Nothing was changed; run this again.`)
    throw err
  }
  say()
  say(random ? `  ✔ The password for ${account!.email} is now:  ${password}` : `  ✔ The password for ${account!.email} has been changed.`)
  say('    Start SPOTTER and sign in with it. Write it down somewhere safe.')
  say()
} finally {
  await handle.close()
}
