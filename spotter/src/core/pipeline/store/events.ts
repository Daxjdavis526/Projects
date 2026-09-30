/**
 * Notable events for the dashboard's activity feed. Always redacted.
 */
import type { Database, Executor } from '../../db/client'
import { systemEvents } from '../../db/schema'
import type { Platform } from '../../domain/types'
import { getLogger } from '../../observability/logger'
import { redact } from '../../observability/redact'

export type EventCategory = 'collection' | 'auth' | 'ai' | 'connector' | 'analysis' | 'system'

export async function recordEvent(
  db: Database | Executor,
  event: {
    profileId: string | null
    level: 'debug' | 'info' | 'warn' | 'error'
    category: EventCategory
    platform?: Platform | null
    message: string
    context?: Record<string, unknown>
    at?: Date
  },
): Promise<void> {
  try {
    await db.insert(systemEvents).values({
      creatorProfileId: event.profileId,
      level: event.level,
      category: event.category,
      platform: event.platform ?? null,
      message: String(redact(event.message)).slice(0, 2000),
      context: event.context ? (redact(event.context) as Record<string, unknown>) : null,
      createdAt: event.at ?? new Date(),
    })
  } catch (err) {
    // Event recording must never break the pipeline.
    getLogger('events').warn('Could not record event', { error: err })
  }
}
