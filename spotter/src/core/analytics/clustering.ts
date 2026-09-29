/**
 * Semantic clustering of posts into trends.
 *
 * Posts are embedded (see core/ai) and grouped by cosine similarity, never by
 * shared hashtags alone. Cluster identity is kept stable across runs so a
 * trend can have a history ("first detected", score over time):
 *
 *   1. assign   new posts join the most similar existing cluster above `join`
 *   2. create   leftovers are grouped by leader clustering with one refinement
 *               pass (order-independent enough in practice, and linear-ish)
 *   3. merge    clusters whose centroids converge above `merge` are merged
 *               into the older one
 */

export type Vector = ArrayLike<number>

export function dot(a: Vector, b: Vector): number {
  let s = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) s += a[i]! * b[i]!
  return s
}

export function norm(a: Vector): number {
  return Math.sqrt(dot(a, a))
}

export function cosine(a: Vector, b: Vector): number {
  const na = norm(a)
  const nb = norm(b)
  return na === 0 || nb === 0 ? 0 : dot(a, b) / (na * nb)
}

export function normalize(v: Vector): number[] {
  const n = norm(v)
  const out = new Array<number>(v.length)
  for (let i = 0; i < v.length; i++) out[i] = n === 0 ? 0 : v[i]! / n
  return out
}

export function meanVector(vectors: Vector[], weights?: number[]): number[] | null {
  if (vectors.length === 0) return null
  const dims = vectors[0]!.length
  const acc = new Array<number>(dims).fill(0)
  vectors.forEach((v, i) => {
    const w = weights?.[i] ?? 1
    for (let d = 0; d < dims; d++) acc[d]! += v[d]! * w
  })
  return normalize(acc)
}

export interface ClusterThresholds {
  /** Minimum similarity for a post to join an existing cluster. */
  join: number
  /** Minimum similarity for posts to form a new cluster together. */
  create: number
  /** Clusters whose centroids are at least this similar are merged. */
  merge: number
}

export interface Candidate {
  id: string
  vector: Vector
  /** Processing priority: higher first (e.g. views per hour). Ties break on id. */
  weight: number
}

export interface ExistingCluster {
  id: string
  centroid: Vector
  firstDetectedAt: Date
}

export interface Assignment {
  itemId: string
  clusterId: string
  similarity: number
}

export function assignToExisting(
  candidates: Candidate[],
  clusters: ExistingCluster[],
  threshold: number,
): { assigned: Assignment[]; unassigned: Candidate[] } {
  const assigned: Assignment[] = []
  const unassigned: Candidate[] = []
  for (const c of candidates) {
    let best: { id: string; sim: number } | null = null
    for (const cluster of clusters) {
      const sim = cosine(c.vector, cluster.centroid)
      if (!best || sim > best.sim) best = { id: cluster.id, sim }
    }
    if (best && best.sim >= threshold) assigned.push({ itemId: c.id, clusterId: best.id, similarity: best.sim })
    else unassigned.push(c)
  }
  return { assigned, unassigned }
}

export interface NewGroup {
  memberIds: string[]
  similarities: number[]
  centroid: number[]
}

function byPriority(a: Candidate, b: Candidate): number {
  return b.weight - a.weight || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

/**
 * Leader clustering with one refinement pass. Returns groups of at least
 * `minSize` members; smaller groups are left unclustered (they may join a
 * trend on a later run, or count as a single-post breakout elsewhere).
 */
export function formNewClusters(candidates: Candidate[], threshold: number, minSize = 2): NewGroup[] {
  const sorted = [...candidates].sort(byPriority)
  const groups: Array<{ sum: number[]; members: Candidate[] }> = []
  for (const c of sorted) {
    let best: { g: (typeof groups)[number]; sim: number } | null = null
    for (const g of groups) {
      const sim = cosine(c.vector, g.sum)
      if (!best || sim > best.sim) best = { g, sim }
    }
    if (best && best.sim >= threshold) {
      best.g.members.push(c)
      for (let d = 0; d < best.g.sum.length; d++) best.g.sum[d]! += c.vector[d]!
    } else {
      groups.push({ sum: Array.from(c.vector), members: [c] })
    }
  }
  // Refinement: re-assign every candidate to its best final centroid.
  const centroids = groups.map((g) => normalize(g.sum))
  const refined = centroids.map(() => [] as Array<{ c: Candidate; sim: number }>)
  for (const c of sorted) {
    let bestIndex = -1
    let bestSim = -Infinity
    centroids.forEach((centroid, i) => {
      const sim = cosine(c.vector, centroid)
      if (sim > bestSim) {
        bestSim = sim
        bestIndex = i
      }
    })
    if (bestIndex >= 0 && bestSim >= threshold) refined[bestIndex]!.push({ c, sim: bestSim })
  }
  const out: NewGroup[] = []
  for (const members of refined) {
    if (members.length < minSize) continue
    const centroid = meanVector(members.map((m) => m.c.vector))!
    out.push({
      memberIds: members.map((m) => m.c.id),
      similarities: members.map((m) => cosine(m.c.vector, centroid)),
      centroid,
    })
  }
  return out
}

/** Pairs of clusters to merge, most similar first; the older cluster survives. */
export function findMerges(clusters: ExistingCluster[], threshold: number): Array<{ keepId: string; mergeId: string; similarity: number }> {
  const pairs: Array<{ a: ExistingCluster; b: ExistingCluster; sim: number }> = []
  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      const sim = cosine(clusters[i]!.centroid, clusters[j]!.centroid)
      if (sim >= threshold) pairs.push({ a: clusters[i]!, b: clusters[j]!, sim })
    }
  }
  pairs.sort((x, y) => y.sim - x.sim)
  const consumed = new Set<string>()
  const merges: Array<{ keepId: string; mergeId: string; similarity: number }> = []
  for (const { a, b, sim } of pairs) {
    if (consumed.has(a.id) || consumed.has(b.id)) continue
    const [keep, drop] = a.firstDetectedAt <= b.firstDetectedAt ? [a, b] : [b, a]
    merges.push({ keepId: keep.id, mergeId: drop.id, similarity: sim })
    consumed.add(drop.id)
  }
  return merges
}

/** Mean similarity of members to their centroid: how tight a cluster is. */
export function cohesion(vectors: Vector[], centroid: Vector): number {
  if (vectors.length === 0) return 0
  return vectors.reduce((s, v) => s + cosine(v, centroid), 0) / vectors.length
}
