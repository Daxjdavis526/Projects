/**
 * One-step launcher for running SPOTTER on your own computer:
 *
 *   double-click "Start SPOTTER" (Mac: .command, Windows: .bat), or
 *   npm run app
 *
 * First run: creates .env with a fresh encryption key, installs the
 * dependencies and builds the app (a few minutes). Every run: starts SPOTTER
 * on this computer only (127.0.0.1), waits until it answers, and opens it in
 * the browser. Closing the window (or Ctrl+C) stops it.
 *
 * Uses only Node.js built-ins, so it works before `npm install` has run.
 */
import { spawn } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, appendFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 3000
const HOST = '127.0.0.1'
// The one address SPOTTER answers on; the app redirects "localhost" here so sign-ins stay on one origin.
const URL_LOCAL = `http://${HOST}:${PORT}`
const say = (msg = '') => console.log(msg)
const fail = (msg) => {
  say()
  say(`  ✖ ${msg}`)
  say()
  process.exit(1)
}

// 1. Node.js version ----------------------------------------------------------
const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 22 || (major === 22 && minor < 12)) {
  fail(`SPOTTER needs Node.js 22.12 or newer; this computer has ${process.versions.node}. Install the "LTS" version from https://nodejs.org and try again.`)
}

say()
say('  SPOTTER')
say('  ───────')

// 2. Settings file (.env) with an encryption key --------------------------------
const envPath = path.join(ROOT, '.env')
if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    [
      '# SPOTTER settings for this computer. Created automatically on first start.',
      '# Keep this file private: the key below protects your account connections.',
      `APP_URL=${URL_LOCAL}`,
      `TOKEN_ENCRYPTION_KEY=${randomBytes(32).toString('base64')}`,
      '',
    ].join('\n'),
    { mode: 0o600 },
  )
  say('  • Created your private settings file (.env).')
} else if (!/^TOKEN_ENCRYPTION_KEY=\S+/m.test(readFileSync(envPath, 'utf8'))) {
  appendFileSync(envPath, `\nTOKEN_ENCRYPTION_KEY=${randomBytes(32).toString('base64')}\n`)
  say('  • Added an encryption key to your settings file (.env).')
}

// Helpers ---------------------------------------------------------------------
// Child processes find this same Node.js first, so an older one elsewhere on PATH cannot get in the way.
const childEnv = { ...process.env }
const pathKey = Object.keys(childEnv).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH'
childEnv[pathKey] = [path.dirname(process.execPath), childEnv[pathKey]].filter(Boolean).join(path.delimiter)

function run(command, args, label) {
  return new Promise((resolve) => {
    say(`  • ${label}`)
    // A bare `npm` is a script on Windows (npm.cmd), so it needs a shell; the arguments are fixed, never user input.
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', env: childEnv, shell: process.platform === 'win32' && command === 'npm' })
    child.on('exit', (code) => resolve(code ?? 1))
    child.on('error', () => resolve(1))
  })
}

/** The npm that came with this Node.js (Windows keeps it beside node.exe, Mac and Linux under lib/), else whatever `npm` is. */
function npm(args) {
  const dir = path.dirname(process.execPath)
  const cli = [path.join(dir, 'node_modules', 'npm', 'bin', 'npm-cli.js'), path.join(dir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js')].find((f) => existsSync(f))
  return cli ? [process.execPath, [cli, ...args]] : ['npm', args]
}

const nextBin = () => path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next')

/** A fingerprint of everything the build depends on, so an edited or updated copy rebuilds itself. */
function sourceStamp() {
  const hash = createHash('sha256')
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else {
        const s = statSync(full)
        hash.update(`${path.relative(ROOT, full)}:${s.size}:${Math.floor(s.mtimeMs)}\n`)
      }
    }
  }
  walk(path.join(ROOT, 'src'))
  for (const f of ['package.json', 'package-lock.json', 'next.config.ts', 'postcss.config.mjs', 'tsconfig.json']) {
    const full = path.join(ROOT, f)
    if (existsSync(full)) hash.update(`${f}:${readFileSync(full, 'utf8')}\n`)
  }
  return hash.digest('hex')
}

async function health() {
  try {
    const res = await fetch(`http://${HOST}:${PORT}/api/health`, { signal: AbortSignal.timeout(2000) })
    const body = await res.json().catch(() => null)
    return body && typeof body === 'object' && 'database' in body ? 'spotter' : 'other'
  } catch {
    return 'none'
  }
}

function openBrowser(url) {
  const [cmd, args] =
    process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['rundll32', ['url.dll,FileProtocolHandler', url]] : ['xdg-open', [url]]
  // If no browser can be opened automatically, carry on: the address is printed in the window.
  try {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true })
    child.on('error', () => {})
    child.unref()
  } catch {
    // Same: never stop SPOTTER over this.
  }
}

// 3. Already running? -----------------------------------------------------------
const before = await health()
if (before === 'spotter') {
  say(`  • SPOTTER is already running. Opening ${URL_LOCAL}`)
  openBrowser(URL_LOCAL)
  process.exit(0)
}

// 4. Install (first run, or after an update) ----------------------------------------
const lock = path.join(ROOT, 'package-lock.json')
const installed = path.join(ROOT, 'node_modules', '.package-lock.json')
if (!existsSync(nextBin()) || !existsSync(installed) || statSync(lock).mtimeMs > statSync(installed).mtimeMs) {
  say('  • First-time setup: downloading the parts SPOTTER needs. This takes a few minutes…')
  say()
  const code = await run(...npm(['install', '--no-audit', '--no-fund']), 'Installing')
  if (code !== 0) fail('The download did not finish. Check the internet connection and start SPOTTER again.')
}

// 5. Build (first run, or after the code changed) -----------------------------------
const stampPath = path.join(ROOT, '.next', 'spotter-build-stamp')
const stamp = sourceStamp()
if (!existsSync(path.join(ROOT, '.next', 'BUILD_ID')) || !existsSync(stampPath) || readFileSync(stampPath, 'utf8') !== stamp) {
  say()
  const code = await run(process.execPath, [nextBin(), 'build'], 'Preparing SPOTTER (a minute or two, only the first time)…')
  if (code !== 0) fail('Preparing SPOTTER failed. Start it again; if it keeps failing, send the text above to whoever gave you SPOTTER.')
  writeFileSync(stampPath, stamp)
}

// 6. Start ---------------------------------------------------------------------
if ((await health()) === 'other') {
  fail(`Another program is already using port ${PORT} on this computer. Close it (or restart the computer) and start SPOTTER again.`)
}
say()
say('  • Starting SPOTTER…')
const server = spawn(process.execPath, [nextBin(), 'start', '--port', String(PORT), '--hostname', HOST], {
  cwd: ROOT,
  stdio: ['ignore', 'inherit', 'inherit'],
  // Quiet, readable output in this window: problems only.
  env: { ...childEnv, NODE_ENV: 'production', LOG_FORMAT: 'pretty', LOG_LEVEL: process.env.LOG_LEVEL ?? 'warn', NEXT_TELEMETRY_DISABLED: '1' },
})
let stopping = false
const stop = () => {
  stopping = true
  if (!server.killed) server.kill()
}
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, stop)
server.on('exit', (code, signal) => {
  // Ctrl+C or closing the window also reaches the server directly, which then exits with 128 + the signal number.
  const asked = stopping || signal !== null || code === 0 || code === 130 || code === 143 || code === 129
  say()
  say(asked ? '  SPOTTER has stopped. Start it again any time; everything is kept.' : `  SPOTTER stopped unexpectedly (code ${code}). Start it again.`)
  process.exit(asked ? 0 : (code ?? 1))
})

for (let i = 0; i < 120; i++) {
  if ((await health()) === 'spotter') {
    say()
    say('  ✔ SPOTTER is running.')
    say(`    Open ${URL_LOCAL} in your browser (it should open by itself).`)
    say('    Keep this window open while you use SPOTTER. Close it to stop SPOTTER.')
    say()
    openBrowser(URL_LOCAL)
    break
  }
  await new Promise((r) => setTimeout(r, 1000))
}
