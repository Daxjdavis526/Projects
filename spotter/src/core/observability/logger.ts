/**
 * Structured logging. One JSON object per line in production (easy to ship
 * to any log store), a readable single line in development. Every context
 * object is passed through redact() before it is written.
 */
import { redact } from './redact'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

export interface LogEntry {
  time: string
  level: LogLevel
  msg: string
  [key: string]: unknown
}

export interface Logger {
  debug(msg: string, context?: Record<string, unknown>): void
  info(msg: string, context?: Record<string, unknown>): void
  warn(msg: string, context?: Record<string, unknown>): void
  error(msg: string, context?: Record<string, unknown>): void
  child(bindings: Record<string, unknown>): Logger
}

export interface LoggerOptions {
  level?: LogLevel
  format?: 'json' | 'pretty'
  bindings?: Record<string, unknown>
  /** Where entries go. Defaults to stdout/stderr. */
  sink?: (entry: LogEntry, line: string) => void
}

const COLORS: Record<LogLevel, string> = { debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m' }

function formatPretty(entry: LogEntry): string {
  const { time, level, msg, component, ...rest } = entry
  const clock = time.slice(11, 19)
  const tag = component ? ` [${String(component)}]` : ''
  const extras = Object.entries(rest)
    .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join(' ')
  const useColor = process.stdout.isTTY
  const lvl = level.toUpperCase().padEnd(5)
  return `${clock} ${useColor ? `${COLORS[level]}${lvl}\x1b[0m` : lvl}${tag} ${msg}${extras ? ` ${extras}` : ''}`
}

function defaultSink(entry: LogEntry, line: string): void {
  if (entry.level === 'error' || entry.level === 'warn') process.stderr.write(`${line}\n`)
  else process.stdout.write(`${line}\n`)
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const threshold = LEVEL_ORDER[options.level ?? defaultLevel()]
  const format = options.format ?? defaultFormat()
  const bindings = options.bindings ?? {}
  const sink = options.sink ?? defaultSink

  const write = (level: LogLevel, msg: string, context?: Record<string, unknown>) => {
    if (LEVEL_ORDER[level] < threshold) return
    const safe = redact({ ...bindings, ...(context ?? {}) }) as Record<string, unknown>
    const entry: LogEntry = { time: new Date().toISOString(), level, msg: String(redact(msg)), ...safe }
    const line = format === 'json' ? JSON.stringify(entry) : formatPretty(entry)
    try {
      sink(entry, line)
    } catch {
      // Logging must never throw into the caller.
    }
  }

  return {
    debug: (msg, ctx) => write('debug', msg, ctx),
    info: (msg, ctx) => write('info', msg, ctx),
    warn: (msg, ctx) => write('warn', msg, ctx),
    error: (msg, ctx) => write('error', msg, ctx),
    child: (more) => createLogger({ ...options, bindings: { ...bindings, ...more } }),
  }
}

function defaultLevel(): LogLevel {
  const fromEnv = process.env.LOG_LEVEL as LogLevel | undefined
  if (fromEnv && fromEnv in LEVEL_ORDER) return fromEnv
  if (process.env.NODE_ENV === 'test') return 'warn'
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function defaultFormat(): 'json' | 'pretty' {
  const fromEnv = process.env.LOG_FORMAT
  if (fromEnv === 'json' || fromEnv === 'pretty') return fromEnv
  return process.env.NODE_ENV === 'production' ? 'json' : 'pretty'
}

/** Collects entries in memory. Used by tests to assert on what was logged. */
export function createMemoryLogger(level: LogLevel = 'debug'): Logger & { entries: LogEntry[]; lines: string[] } {
  const entries: LogEntry[] = []
  const lines: string[] = []
  const logger = createLogger({
    level,
    format: 'json',
    sink: (entry, line) => {
      entries.push(entry)
      lines.push(line)
    },
  })
  return Object.assign(logger, { entries, lines })
}

let rootLogger: Logger | null = null

export function getLogger(component?: string): Logger {
  rootLogger ??= createLogger({ bindings: { app: 'spotter' } })
  return component ? rootLogger.child({ component }) : rootLogger
}
