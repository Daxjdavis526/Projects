/* Seeded random numbers, so a session (its sensor offsets, its noise, and
   later its hidden faults) can be replayed exactly by the headless tests. */
export class Rng {
  constructor(seed = 1) { this.s = seed >>> 0 || 1; this._spare = null; }
  /* mulberry32 */
  next() {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  uniform(a = 0, b = 1) { return a + (b - a) * this.next(); }
  /* standard normal, Box–Muller with the spare kept */
  gauss() {
    if (this._spare !== null) { const v = this._spare; this._spare = null; return v; }
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    v = this.next();
    const r = Math.sqrt(-2 * Math.log(u));
    this._spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  chance(p) { return this.next() < p; }
}
