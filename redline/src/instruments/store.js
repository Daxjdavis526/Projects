/* Where samples live.

   Two tiers, so the strip charts can show a whole session and still resolve
   a 3-millisecond valve transient:

   · Ring    every sample at the full DAQ rate, for the most recent stretch
             (as many seconds as fit in a fixed budget).
   · History min / max / last per channel in fixed 0.1 s bins, for the whole
             session. Keeping min and max — not an average — is what makes a
             one-sample spike still visible when a chart is zoomed out to an
             hour.

   A chart asks for (channel, t0, t1, columns) and gets back either raw
   points or a per-column min/max envelope from whichever tier covers the
   request best. The same query works on a recorded Run (see RunData). */

export const BIN = 0.1;

export class GrowArray {
  constructor(Type = Float32Array, cap = 1024) { this.T = Type; this.a = new Type(cap); this.n = 0; }
  push(v) {
    if (this.n === this.a.length) { const b = new this.T(this.a.length * 2); b.set(this.a); this.a = b; }
    this.a[this.n++] = v;
  }
  view() { return this.a.subarray(0, this.n); }
}

export class Ring {
  constructor(nch, cap) {
    this.nch = nch;
    this.cap = cap;
    this.t = new Float64Array(cap);
    this.v = Array.from({ length: nch }, () => new Float32Array(cap));
    this.head = 0;     // next write index
    this.count = 0;
  }
  push(t, vals) {
    const i = this.head;
    this.t[i] = t;
    for (let c = 0; c < this.nch; c++) this.v[c][i] = vals[c];
    this.head = (i + 1) % this.cap;
    if (this.count < this.cap) this.count++;
  }
  get tFirst() { return this.count ? this.t[(this.head - this.count + this.cap) % this.cap] : Infinity; }
  get tLast() { return this.count ? this.t[(this.head - 1 + this.cap) % this.cap] : -Infinity; }
  /* logical index k (0 = oldest) → physical */
  idx(k) { return (this.head - this.count + k + this.cap * 2) % this.cap; }
  /* first logical index with t >= x */
  lower(x) {
    let lo = 0, hi = this.count;
    while (lo < hi) { const m = (lo + hi) >> 1; if (this.t[this.idx(m)] < x) lo = m + 1; else hi = m; }
    return lo;
  }
}

export class History {
  constructor(nch) {
    this.nch = nch;
    this.t0 = null;
    this.min = Array.from({ length: nch }, () => new GrowArray(Float32Array, 4096));
    this.max = Array.from({ length: nch }, () => new GrowArray(Float32Array, 4096));
    this.last = Array.from({ length: nch }, () => new GrowArray(Float32Array, 4096));
    this.cur = -1;
    this.acc = null;
  }
  push(t, vals) {
    if (this.t0 === null) this.t0 = Math.floor(t / BIN) * BIN;
    const b = Math.floor((t - this.t0) / BIN);
    if (b !== this.cur) {
      if (this.acc) this._flush();
      // fill any gap (DAQ was off) with NaN bins
      while (this.cur >= 0 && this.cur < b - 1) { this.cur++; this._pushBin(null); }
      this.cur = b;
      this.acc = { min: Array.from(vals), max: Array.from(vals), last: Array.from(vals) };
      return;
    }
    const a = this.acc;
    for (let c = 0; c < this.nch; c++) {
      const v = vals[c];
      if (v < a.min[c] || Number.isNaN(a.min[c])) a.min[c] = v;
      if (v > a.max[c] || Number.isNaN(a.max[c])) a.max[c] = v;
      a.last[c] = v;
    }
  }
  _pushBin(a) {
    for (let c = 0; c < this.nch; c++) {
      this.min[c].push(a ? a.min[c] : NaN);
      this.max[c].push(a ? a.max[c] : NaN);
      this.last[c].push(a ? a.last[c] : NaN);
    }
  }
  _flush() { this._pushBin(this.acc); this.acc = null; }
  get nBins() { return this.min[0].n; }
}

/* Query result reused between calls to avoid garbage. */
function envelope(cols) {
  return { mode: 'env', n: 0, t: new Float64Array(cols), lo: new Float32Array(cols), hi: new Float32Array(cols) };
}

/* Build a per-column min/max envelope from a sorted sample source. */
function bucketize(get, n0, n1, t0, t1, cols) {
  const out = envelope(cols);
  const w = (t1 - t0) / cols;
  for (let c = 0; c < cols; c++) { out.lo[c] = NaN; out.hi[c] = NaN; out.t[c] = t0 + (c + 0.5) * w; }
  for (let k = n0; k < n1; k++) {
    const [t, v] = get(k);
    if (Number.isNaN(v)) continue;
    const c = Math.floor((t - t0) / w);
    if (c < 0 || c >= cols) continue;
    if (Number.isNaN(out.lo[c]) || v < out.lo[c]) out.lo[c] = v;
    if (Number.isNaN(out.hi[c]) || v > out.hi[c]) out.hi[c] = v;
  }
  out.n = cols;
  return out;
}

/* Live store for a DAQ: ring + history. */
export class LiveStore {
  constructor(ids, rate, ringBudget = 2.4e6) {
    this.ids = ids;
    this.index = new Map(ids.map((id, i) => [id, i]));
    this.rate = rate;
    const cap = Math.max(1000, Math.min(Math.floor(ringBudget / ids.length), Math.floor(rate * 180)));
    this.ring = new Ring(ids.length, cap);
    this.hist = new History(ids.length);
  }
  push(t, vals) { this.ring.push(t, vals); this.hist.push(t, vals); }
  /* A new sample rate needs a new ring; the history carries on. */
  setRate(rate, ringBudget = 2.4e6) {
    this.rate = rate;
    const cap = Math.max(1000, Math.min(Math.floor(ringBudget / this.ids.length), Math.floor(rate * 180)));
    this.ring = new Ring(this.ids.length, cap);
  }
  get ringSeconds() { return this.ring.cap / this.rate; }
  latest(id) {
    const c = this.index.get(id);
    if (c === undefined || !this.ring.count) return NaN;
    return this.ring.v[c][(this.ring.head - 1 + this.ring.cap) % this.ring.cap];
  }
  get tLast() { return this.ring.tLast; }

  /* Series for plotting. Raw points if they fit comfortably, else an
     envelope. */
  query(id, t0, t1, cols) {
    const c = this.index.get(id);
    if (c === undefined) return null;
    const r = this.ring;
    if (r.count && t0 >= r.tFirst - 1e-9) {
      const k0 = Math.max(0, r.lower(t0) - 1), k1 = Math.min(r.count, r.lower(t1) + 1);
      const n = k1 - k0;
      const vArr = r.v[c], tArr = r.t;
      if (n <= cols * 2) {
        const out = { mode: 'raw', n, t: new Float64Array(n), v: new Float32Array(n) };
        for (let k = 0; k < n; k++) { const p = r.idx(k0 + k); out.t[k] = tArr[p]; out.v[k] = vArr[p]; }
        return out;
      }
      return bucketize(k => { const p = r.idx(k); return [tArr[p], vArr[p]]; }, k0, k1, t0, t1, cols);
    }
    // history tier
    const h = this.hist;
    if (h.t0 === null) return { mode: 'raw', n: 0, t: new Float64Array(0), v: new Float32Array(0) };
    const b0 = Math.max(0, Math.floor((t0 - h.t0) / BIN) - 1), b1 = Math.min(h.nBins, Math.ceil((t1 - h.t0) / BIN) + 1);
    const lo = h.min[c].a, hi = h.max[c].a;
    const out = envelope(Math.max(1, cols));
    const w = (t1 - t0) / cols;
    for (let k = 0; k < cols; k++) { out.lo[k] = NaN; out.hi[k] = NaN; out.t[k] = t0 + (k + 0.5) * w; }
    for (let b = b0; b < b1; b++) {
      const tb = h.t0 + (b + 0.5) * BIN;
      const k = Math.floor((tb - t0) / w);
      if (k < 0 || k >= cols) continue;
      const l = lo[b], u = hi[b];
      if (Number.isNaN(l)) continue;
      if (Number.isNaN(out.lo[k]) || l < out.lo[k]) out.lo[k] = l;
      if (Number.isNaN(out.hi[k]) || u > out.hi[k]) out.hi[k] = u;
    }
    // stitch the ring onto the end at bin resolution if the window runs into it
    if (r.count && t1 > r.tFirst) {
      const k0 = r.lower(Math.max(t0, r.tFirst)), k1 = r.count;
      const vArr = r.v[c], tArr = r.t;
      for (let kk = k0; kk < k1; kk++) {
        const p = r.idx(kk), v = vArr[p];
        if (Number.isNaN(v)) continue;
        const k = Math.floor((tArr[p] - t0) / w);
        if (k < 0 || k >= cols) continue;
        if (Number.isNaN(out.lo[k]) || v < out.lo[k]) out.lo[k] = v;
        if (Number.isNaN(out.hi[k]) || v > out.hi[k]) out.hi[k] = v;
      }
    }
    out.n = cols;
    return out;
  }

  /* Mean and slope of a channel over the last `span` seconds (for holds and
     leak checks — the same arithmetic an engineer would do with a cursor). */
  stats(id, span) {
    const c = this.index.get(id), r = this.ring;
    if (c === undefined || !r.count) return null;
    const t1 = r.tLast, k0 = r.lower(t1 - span);
    let n = 0, st = 0, sv = 0, stt = 0, stv = 0, mn = Infinity, mx = -Infinity;
    for (let k = k0; k < r.count; k++) {
      const p = r.idx(k), t = r.t[p] - t1, v = r.v[c][p];
      if (Number.isNaN(v)) continue;
      n++; st += t; sv += v; stt += t * t; stv += t * v;
      if (v < mn) mn = v; if (v > mx) mx = v;
    }
    if (n < 2) return null;
    const mean = sv / n, den = n * stt - st * st;
    const slope = den ? (n * stv - st * sv) / den : 0;
    let ss = 0;
    for (let k = k0; k < r.count; k++) { const v = r.v[c][r.idx(k)]; if (!Number.isNaN(v)) ss += (v - mean) ** 2; }
    return { n, mean, slope, min: mn, max: mx, std: Math.sqrt(ss / (n - 1)) };
  }
}

/* A recorded test run at full rate. Same query interface as LiveStore. */
export class RunData {
  constructor(ids, rate) {
    this.ids = ids;
    this.index = new Map(ids.map((id, i) => [id, i]));
    this.rate = rate;
    this.t = new GrowArray(Float64Array, 8192);
    this.v = ids.map(() => new GrowArray(Float32Array, 8192));
  }
  push(t, vals) { this.t.push(t); for (let c = 0; c < vals.length; c++) this.v[c].push(vals[c]); }
  /* Rebuild a finalized run from stored arrays (test history). */
  static fromArrays(ids, rate, T, V) {
    const r = Object.create(RunData.prototype);
    r.ids = ids; r.index = new Map(ids.map((id, i) => [id, i])); r.rate = rate; r.T = T; r.V = V;
    return r;
  }
  finalize() {
    this.T = this.t.view().slice();
    this.V = this.v.map(g => g.view().slice());
    delete this.t; delete this.v;
    return this;
  }
  get n() { return this.T ? this.T.length : this.t.n; }
  series(id) { const c = this.index.get(id); return c === undefined ? null : this.V[c]; }
  lower(x) {
    const T = this.T; let lo = 0, hi = T.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (T[m] < x) lo = m + 1; else hi = m; }
    return lo;
  }
  query(id, t0, t1, cols) {
    const c = this.index.get(id);
    if (c === undefined) return null;
    const T = this.T, V = this.V[c];
    const k0 = Math.max(0, this.lower(t0) - 1), k1 = Math.min(T.length, this.lower(t1) + 1);
    const n = k1 - k0;
    if (n <= cols * 2) return { mode: 'raw', n, t: T.subarray(k0, k1), v: V.subarray(k0, k1) };
    return bucketize(k => [T[k], V[k]], k0, k1, t0, t1, cols);
  }
  valueAt(id, t) {
    const V = this.series(id); if (!V) return NaN;
    const k = Math.min(this.T.length - 1, Math.max(0, this.lower(t)));
    return V[k];
  }
  get tFirst() { return this.T[0]; }
  get tLast() { return this.T[this.T.length - 1]; }
}
