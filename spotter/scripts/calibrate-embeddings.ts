/**
 * Suggest clustering thresholds for the configured embedding model, from
 * posts already collected (method: src/core/analytics/calibration.ts):
 *
 *   npm run calibrate:embeddings
 *
 * Reads stored vectors only: no API calls, no cost. Run it after a few
 * collection runs with the model configured, then set EMBEDDING_THRESHOLDS
 * in the server environment if the suggestion differs from the defaults.
 */
import './load-env'
import { and, eq, gte, inArray, ne } from 'drizzle-orm'
import { selectProviders } from '../src/core/ai/registry'
import { separation, similarityProfile, suggestThresholds } from '../src/core/analytics/calibration'
import { getEnv } from '../src/core/config/env'
import { parseSettings } from '../src/core/config/settings'
import { openDatabase } from '../src/core/db/client'
import { aiAnalysis, contentEmbeddings, contentItems, creatorProfiles } from '../src/core/db/schema'
import { originsFor } from '../src/core/pipeline/context'

const env = getEnv()
const handle = await openDatabase({ runMigrations: true })
const db = handle.db
const [profile] = await db.select().from(creatorProfiles).limit(1)
if (!profile) {
  console.error('No creator profile yet: open the app and finish setup first.')
  process.exit(1)
}
const { embedder, notes } = selectProviders(parseSettings(profile.settings), env)
for (const note of notes) console.log(`note: ${note}`)
const rows = await db
  .select({ topicKey: aiAnalysis.topicKey, vector: contentEmbeddings.vector })
  .from(contentItems)
  .innerJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded'), ne(aiAnalysis.topicKey, 'general_training')))
  .innerJoin(contentEmbeddings, and(eq(contentEmbeddings.contentItemId, contentItems.id), eq(contentEmbeddings.model, embedder.model)))
  .where(and(inArray(contentItems.dataOrigin, originsFor(profile.dataMode)), gte(contentItems.publishedAt, new Date(Date.now() - 90 * 86_400_000))))
await handle.close()

console.log(`\nEmbedding model: ${embedder.name} · ${embedder.model} (${profile.dataMode} data, ${rows.length} labelled posts)`)
const result = similarityProfile(rows.filter((r): r is { topicKey: string; vector: number[] } => r.topicKey !== null))
if (!result) {
  console.log('Not enough to calibrate yet: at least 4 topics with 5+ posts each, embedded with this model, are needed. Let a few collection runs finish first.')
  process.exit(0)
}
const suggested = suggestThresholds(result)
const row = (label: string, d: typeof result.same) => `  ${label.padEnd(16)} ${[d.p05, d.p25, d.p50, d.p75, d.p95].map((v) => v.toFixed(3).padStart(7)).join('')}`
console.log(`\nCosine similarity of post pairs (${result.topics} topics, ${result.posts} posts)`)
console.log(`  ${''.padEnd(16)}${['p5', 'p25', 'median', 'p75', 'p95'].map((h) => h.padStart(7)).join('')}`)
console.log(row(`same topic`, result.same))
console.log(row(`different topic`, result.cross))
console.log(`\nSeparation: ${separation(result)} (1 = related and unrelated pairs never overlap; near 0 or below = the model barely tells them apart)`)
console.log('\n                 current  suggested')
for (const key of ['join', 'create', 'merge', 'fitLow', 'fitHigh'] as const) {
  console.log(`  ${key.padEnd(14)} ${embedder.thresholds[key].toFixed(2).padStart(7)} ${suggested[key].toFixed(2).padStart(10)}`)
}
if (!embedder.remote) console.log('\nThe built-in model’s defaults were tuned by hand on varied real captions; keep them unless trends look clearly wrong.')
console.log(`\nTo use the suggestion, set this in the server environment and restart:\n  EMBEDDING_THRESHOLDS='${JSON.stringify(suggested)}'\n`)
