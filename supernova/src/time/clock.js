/* =============================================================================
   CLOCK — the narrative timeline
   -----------------------------------------------------------------------------
   The story spans fourteen orders of magnitude: milliseconds at bounce, three
   thousand years at the end. No linear timeline can hold that, so there are
   two clocks:

   The PHYSICS clock is simulation time t (s, zero at bounce). The engine steps
   it with phase-appropriate substeps.

   The NARRATIVE clock is u in [0,1] — the scrub bar. Each phase segment owns a
   hand-tuned share of u (core bounce gets ~8% of the bar despite occupying
   1e-14 of the physical duration), and inside a segment time is exponentially
   warped so the interesting end of the segment gets the resolution.

   In narrative mode the story plays at constant du/dt_wall, so the displayed
   "speed" is the instantaneous derivative dt_sim/dt_wall — an honest number
   that says 0.0003x during bounce and 3e9x in the remnant. In physical mode
   dt_sim/dt_wall is locked to a chosen multiplier instead.
   ========================================================================== */

/* Segment table for the core-collapse scenario.
   D: duration (s), share: fraction of the scrub bar, k: log-stretch inside the
   segment (0 = linear; larger = more of the bar spent at the segment's END for
   pre-bounce phases / START for post-bounce phases, where the action is). */
export function buildSegments(model) {
  const DAY = 86400, YR = 3.15576e7;
  if (model.id === 'ia') {
    return normalize([
      { phase: 'progenitor', t0: -600,     t1: -2,        share: 0.16, k: 5 },
      { phase: 'deflagration', t0: -2,     t1: 0,         share: 0.12, k: 2 },
      { phase: 'detonation',  t0: 0,       t1: 4,         share: 0.16, k: 2 },
      { phase: 'fireball',    t0: 4,       t1: 30 * DAY,  share: 0.20, k: 7 },
      { phase: 'tail',        t0: 30 * DAY, t1: 2 * YR,   share: 0.14, k: 5 },
      { phase: 'free',        t0: 2 * YR,  t1: 200 * YR,  share: 0.10, k: 5 },
      { phase: 'sedov',       t0: 200 * YR, t1: 3000 * YR, share: 0.12, k: 5 },
    ]);
  }
  const seg = [
    { phase: 'progenitor', t0: -600,    t1: -0.45,     share: 0.13, k: 6 },
    { phase: 'collapse',   t0: -0.45,   t1: 0,         share: 0.15, k: 4 },
    { phase: 'bounce',     t0: 0,       t1: 0.015,     share: 0.08, k: 3 },
    { phase: 'stall',      t0: 0.015,   t1: 0.45,      share: 0.12, k: 2 },
    { phase: 'explosion',  t0: 0.45,    t1: 1.0 * DAY, share: 0.14, k: 8 },
    { phase: 'light',      t0: 1 * DAY, t1: 2 * YR,    share: 0.14, k: 6 },
    { phase: 'free',       t0: 2 * YR,  t1: 200 * YR,  share: 0.11, k: 5 },
    { phase: 'sedov',      t0: 200 * YR, t1: 3000 * YR, share: 0.13, k: 5 },
  ];
  if (model.id === 'ccsn40bh') {
    /* Same skeleton; the engine decides the outcome. Give the stall segment
       more room — the black hole forms there. */
    seg[3] = { phase: 'stall', t0: 0.015, t1: 3.0, share: 0.20, k: 3 };
    seg[4] = { phase: 'explosion', t0: 3.0, t1: 1 * DAY, share: 0.10, k: 8 };
  }
  return normalize(seg);
}

function normalize(seg) {
  const total = seg.reduce((s, x) => s + x.share, 0);
  let u = 0;
  for (const x of seg) { x.u0 = u; u += x.share / total; x.u1 = u; }
  seg[seg.length - 1].u1 = 1;
  return seg;
}

export class SimClock {
  constructor(model) {
    this.segments = buildSegments(model);
    this.tMin = this.segments[0].t0;
    this.tMax = this.segments[this.segments.length - 1].t1;

    this.mode = 'hold';        // 'hold' | 'narrative' | 'physical'
    this.playing = false;
    this.storySeconds = 330;   // wall time for the full bar at rate 1
    this.rate = 1;             // narrative rate multiplier
    this.physRate = 1;         // physical mode multiplier
    this.t = this.tMin;
    this.u = 0;
    this.dtdwall = 0;          // instantaneous sim-seconds per wall-second
  }

  /* --- u <-> t, exponentially warped inside each segment ----------------- */
  tOfU(u) {
    u = Math.min(Math.max(u, 0), 1);
    const s = this.segments.find(x => u <= x.u1) ?? this.segments.at(-1);
    const f = (u - s.u0) / Math.max(s.u1 - s.u0, 1e-12);
    const D = s.t1 - s.t0;
    if (s.k === 0) return s.t0 + D * f;
    /* Exponential warp: slow at the start of the segment, fast at the end —
       which, because every segment ends at its most eventful moment (collapse
       ends at bounce; light ends deep in the tail), puts resolution where the
       action is. */
    const g = (Math.exp(s.k * f) - 1) / (Math.exp(s.k) - 1);
    return s.t0 + D * g;
  }

  uOfT(t) {
    t = Math.min(Math.max(t, this.tMin), this.tMax);
    const s = this.segments.find(x => t <= x.t1) ?? this.segments.at(-1);
    const g = (t - s.t0) / Math.max(s.t1 - s.t0, 1e-30);
    let f;
    if (s.k === 0) f = g;
    else f = Math.log(1 + g * (Math.exp(s.k) - 1)) / s.k;
    return s.u0 + f * (s.u1 - s.u0);
  }

  /* dt_sim/du at the current position — the warp's local slope. */
  dtdu(u) {
    const e = 1e-5;
    return (this.tOfU(u + e) - this.tOfU(Math.max(u - e, 0))) / (u + e - Math.max(u - e, 0));
  }

  /* --- transport --------------------------------------------------------- */
  play(mode = 'narrative') { this.mode = mode; this.playing = true; }
  pause() { this.playing = false; }
  seekU(u) { this.u = Math.min(Math.max(u, 0), 1); this.t = this.tOfU(this.u); }
  seekT(t) { this.t = Math.min(Math.max(t, this.tMin), this.tMax); this.u = this.uOfT(this.t); }

  /* Advance by one frame of wall time. Returns the target sim time. */
  advance(wallDt) {
    if (!this.playing) { this.dtdwall = 0; return this.t; }
    if (this.mode === 'physical') {
      this.dtdwall = this.physRate;
      this.seekT(this.t + wallDt * this.physRate);
    } else {
      const du = wallDt * this.rate / this.storySeconds;
      this.dtdwall = this.dtdu(this.u) * this.rate / this.storySeconds;
      this.seekU(this.u + du);
    }
    if (this.u >= 1) this.playing = false;
    return this.t;
  }

  get phase() {
    const s = this.segments.find(x => this.t <= x.t1) ?? this.segments.at(-1);
    return s.phase;
  }
}
