// Traces of three classic algorithms, frame by frame, for the py-sort
// simulation: insertion sort, bottom-up merge sort and a binary search for the
// bracket T[i] ≤ x < T[i+1] in a sorted table. DOM-free, so the traces are
// tested headlessly (test/py-sort.test.mjs).
//
// A frame is { arr, note, comparisons, mark } where `mark` says what to
// highlight: { sorted: [lo, hi), key, compare: [i, j], runs: [[lo, hi), …],
// merged: [lo, hi), lo, hi, mid, found, faded: [lo, hi) outside the range }.

/** Insertion sort: one frame per comparison, shift and insertion. */
export function insertionTrace(values) {
  const a = [...values];
  const frames = [];
  let comparisons = 0, moves = 0;
  const push = (note, mark) => frames.push({ arr: [...a], note, comparisons, moves, mark });
  push('The sorted part starts as the first item alone (blue).', { sorted: [0, 1] });
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    push(`Pass ${i}: take the key ${fmt(key)} and walk it left through the sorted part.`, { sorted: [0, i], key: i });
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      if (a[j] > key) {
        a[j + 1] = a[j]; moves++;
        a[j] = key;          // drawn in its moving position; Python leaves a copy until the key lands
        push(`${fmt(a[j + 1])} > ${fmt(key)}: shift ${fmt(a[j + 1])} one place right.`, { sorted: [0, i + 1], key: j, compare: [j, j + 1] });
        j--;
      } else {
        push(`${fmt(a[j])} ≤ ${fmt(key)}: the key stops here.`, { sorted: [0, i + 1], key: j + 1, compare: [j, j + 1] });
        break;
      }
    }
    if (j < 0) push(`The key ${fmt(key)} reached the front.`, { sorted: [0, i + 1], key: 0 });
  }
  push(`Sorted, after ${comparisons} comparisons.`, { sorted: [0, a.length] });
  return frames;
}

/** Bottom-up merge sort: runs of width 1, 2, 4, … merged pairwise. */
export function mergeTrace(values) {
  let a = [...values];
  const n = a.length;
  const frames = [];
  let comparisons = 0, moves = 0;
  const push = (note, mark) => frames.push({ arr: [...a], note, comparisons, moves, mark });
  push(`Start with ${n} runs of length 1 — each one is already sorted.`, {});
  for (let w = 1; w < n; w *= 2) {
    for (let lo = 0; lo < n - w; lo += 2 * w) {
      const mid = lo + w, hi = Math.min(lo + 2 * w, n);
      push(`Merge the runs [${lo}:${mid}] and [${mid}:${hi}] (width ${w}).`, { runs: [[lo, mid], [mid, hi]] });
      const out = [];
      let i = lo, j = mid;
      while (i < mid && j < hi) { comparisons++; out.push(a[i] <= a[j] ? a[i++] : a[j++]); }
      while (i < mid) out.push(a[i++]);
      while (j < hi) out.push(a[j++]);
      moves += out.length;
      a = [...a.slice(0, lo), ...out, ...a.slice(hi)];
      push(`Merged into one sorted run [${lo}:${hi}].`, { merged: [lo, hi] });
    }
  }
  push(`Sorted, after ${comparisons} comparisons.`, { merged: [0, n] });
  return frames;
}

/**
 * Binary search for the bracket i with T[i] ≤ x < T[i+1] in a sorted table
 * (x must lie in [T[0], T[n−1])). Each probe halves the candidate intervals.
 */
export function searchTrace(table, x) {
  const frames = [];
  let lo = 0, hi = table.length - 1, probes = 0;
  const push = (note, mark) => frames.push({ arr: [...table], note, comparisons: probes, moves: 0, mark: { lo, hi, faded: [lo, hi + 1], ...mark } });
  push(`Looking for ${fmt(x)}: it lies somewhere between index ${lo} and index ${hi} (${hi - lo} intervals).`, {});
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    probes++;
    const goRight = table[mid] <= x;
    push(`Probe ${probes}: the middle entry, index ${mid}, holds ${fmt(table[mid])}, which is ${goRight ? 'at most' : 'more than'} ${fmt(x)} — so keep the ${goRight ? 'upper' : 'lower'} half.`, { mid });
    if (goRight) lo = mid; else hi = mid;
  }
  push(`Found after ${probes} probes: ${fmt(table[lo])} ≤ ${fmt(x)} < ${fmt(table[hi])}, between indices ${lo} and ${hi}.`, { found: lo });
  return frames;
}

/** The bracket a binary search returns (for tests). */
export function bracket(table, x) {
  const f = searchTrace(table, x);
  return f[f.length - 1].mark.found;
}

function fmt(v) { return Number.isInteger(v) ? String(v) : String(+v.toPrecision(4)); }
