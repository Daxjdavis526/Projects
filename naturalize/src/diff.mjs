/*
 * diff.mjs — word-level diff for the Changes view.
 *
 * Myers' O(ND) algorithm over word tokens. Linear in the size of the
 * edit, which matters here: a good rewrite changes very little, so the
 * common case is fast even on a long document.
 */

/** Split into words and the whitespace between them, keeping both. */
export function tokenize(text) {
  return String(text).match(/\s+|[^\s]+/g) || [];
}

function isSpace(tok) {
  return /^\s+$/.test(tok);
}

/**
 * Diff two token arrays.
 * Returns [{ type: 'equal' | 'insert' | 'delete', tokens: [...] }].
 */
export function diffTokens(a, b) {
  const N = a.length;
  const M = b.length;
  const MAX = N + M;

  // Trim the common prefix and suffix first — usually most of the text.
  let start = 0;
  while (start < N && start < M && a[start] === b[start]) start++;
  let endA = N;
  let endB = M;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }

  const head = start ? [{ type: 'equal', tokens: a.slice(0, start) }] : [];
  const tail = endA < N ? [{ type: 'equal', tokens: a.slice(endA) }] : [];
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);

  if (!midA.length && !midB.length) return merge([...head, ...tail]);
  if (!midA.length) return merge([...head, { type: 'insert', tokens: midB }, ...tail]);
  if (!midB.length) return merge([...head, { type: 'delete', tokens: midA }, ...tail]);

  // Guard against pathological inputs; a whole-block replace is still
  // an honest rendering of the change.
  if (midA.length * midB.length > 4_000_000) {
    return merge([...head, { type: 'delete', tokens: midA }, { type: 'insert', tokens: midB }, ...tail]);
  }

  const n = midA.length;
  const m = midB.length;
  const max = n + m;
  const offset = max;
  const v = new Int32Array(2 * max + 1);
  const trace = [];

  let d = 0;
  outer: for (; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x;
      if (k === -d || (k !== d && v[k - 1 + offset] < v[k + 1 + offset])) x = v[k + 1 + offset];
      else x = v[k - 1 + offset] + 1;
      let y = x - k;
      while (x < n && y < m && midA[x] === midB[y]) { x++; y++; }
      v[k + offset] = x;
      if (x >= n && y >= m) break outer;
    }
  }

  // Walk the trace backwards to recover the edit script.
  const ops = [];
  let x = n;
  let y = m;
  for (let depth = Math.min(d, trace.length - 1); depth >= 0 && (x > 0 || y > 0); depth--) {
    const vPrev = trace[depth];
    const k = x - y;
    let prevK;
    if (k === -depth || (k !== depth && vPrev[k - 1 + offset] < vPrev[k + 1 + offset])) prevK = k + 1;
    else prevK = k - 1;
    const prevX = vPrev[prevK + offset];
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) { ops.push({ type: 'equal', token: midA[x - 1] }); x--; y--; }
    if (depth === 0) break;
    if (x === prevX) { ops.push({ type: 'insert', token: midB[y - 1] }); y--; }
    else { ops.push({ type: 'delete', token: midA[x - 1] }); x--; }
  }
  ops.reverse();

  const mid = [];
  for (const op of ops) {
    const last = mid[mid.length - 1];
    if (last && last.type === op.type) last.tokens.push(op.token);
    else mid.push({ type: op.type, tokens: [op.token] });
  }

  return merge([...head, ...mid, ...tail]);
}

/**
 * Tidy the raw edit script: fold adjacent runs together and stop
 * whitespace-only edits from being highlighted as changes on their own,
 * which otherwise litters the view with meaningless marks.
 */
function merge(parts) {
  const out = [];
  for (const part of parts) {
    if (!part.tokens.length) continue;
    if (part.type !== 'equal' && part.tokens.every(isSpace)) {
      part = { type: 'equal', tokens: part.tokens };
    }
    const last = out[out.length - 1];
    if (last && last.type === part.type) last.tokens.push(...part.tokens);
    else out.push({ type: part.type, tokens: [...part.tokens] });
  }
  return out;
}

export function diffWords(before, after) {
  return diffTokens(tokenize(before), tokenize(after));
}

/**
 * Merge changed regions that are separated by only a word or two of
 * shared text.
 *
 * A minimal diff is correct but unreadable when a phrase is rewritten:
 * "In today's evolving landscape, data pipelines" against "Data
 * pipelines" comes back as del(In) ins(Data) equal( ) del(today's …
 * landscape, data) — five fragments for one edit. Coalescing gives one
 * deletion followed by one insertion, which is what a reader wants to
 * see. Short shared runs are duplicated into both sides, so the text of
 * each side still reads as a complete phrase.
 */
export function coalesce(parts, minEqualWords = 3) {
  const out = [];
  let del = [];
  let ins = [];

  const flush = () => {
    const d = trimEnds(del);
    const i = trimEnds(ins);
    if (d.length) out.push({ type: 'delete', tokens: d });
    if (i.length) out.push({ type: 'insert', tokens: i });
    del = [];
    ins = [];
  };

  for (const part of parts) {
    if (part.type === 'delete') { del.push(...part.tokens); continue; }
    if (part.type === 'insert') { ins.push(...part.tokens); continue; }

    const wordsHere = part.tokens.filter((t) => !/^\s+$/.test(t)).length;
    const open = del.length || ins.length;
    if (open && wordsHere < minEqualWords) {
      // Short bridge: it belongs to both sides of the edit.
      del.push(...part.tokens);
      ins.push(...part.tokens);
      continue;
    }
    flush();
    out.push({ type: 'equal', tokens: [...part.tokens] });
  }
  flush();

  // Fold neighbours of the same type back together.
  const merged = [];
  for (const p of out) {
    const last = merged[merged.length - 1];
    if (last && last.type === p.type) last.tokens.push(...p.tokens);
    else merged.push({ type: p.type, tokens: [...p.tokens] });
  }
  return merged.filter((p) => p.tokens.length);
}

/** Move leading and trailing whitespace out of a changed run. */
function trimEnds(tokens) {
  let a = 0;
  let b = tokens.length;
  while (a < b && isSpace(tokens[a])) a++;
  while (b > a && isSpace(tokens[b - 1])) b--;
  return tokens.slice(a, b);
}

/** Rough measure of how much of the original survived, 0..1. */
export function retention(before, after) {
  const parts = diffWords(before, after);
  let kept = 0;
  let total = 0;
  for (const p of parts) {
    const n = p.tokens.filter((t) => !isSpace(t)).length;
    if (p.type === 'equal') { kept += n; total += n; }
    else if (p.type === 'delete') total += n;
  }
  return total ? kept / total : 1;
}
