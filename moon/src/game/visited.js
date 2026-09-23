/* =============================================================================
   VISITED — the list of real places you have actually stood in
   -----------------------------------------------------------------------------
   The brief is explicit that discovery is the content, so the record of a run
   is not a task list but a list of real named lunar features that you have
   been inside. Nothing here blocks, scores or rewards; it exists so that
   coming back to a save tells you where you have been, and so that the log is
   a list of places on the Moon rather than a list of things the game asked you
   to do.

   A place counts as reached when you are inside its mapped radius, on foot or
   in the rover — the same containment test the orbital picker uses, so the
   two agree about what "inside Tycho" means. Arrivals are recorded once, with
   the simulated time and the coordinates where the boundary was crossed,
   because when you got somewhere is part of the story of a traverse.

   Pure: no DOM, no three.js, so it is checked in Node with everything else.
   ========================================================================== */

/* A generous cap. Roughly nine thousand features are named on the Moon and
   you are not going to stand in all of them, but a save should not grow
   without bound if someone tries. */
const LIMIT = 4000;

export class Visited {
  constructor(entries) {
    this.entries = [];
    this.index = new Map();
    this.load(entries);
  }

  /**
   * Record an arrival. Later arrivals at a place already recorded are ignored,
   * so the timestamp is always the first time you got there.
   * @returns {object|null} the new entry, or null if it was not new
   */
  record(name, opts = {}) {
    if (!name || this.index.has(name)) return null;
    if (this.entries.length >= LIMIT) return null;
    const e = {
      name,
      lat: Number.isFinite(opts.lat) ? opts.lat : null,
      lon: Number.isFinite(opts.lon) ? opts.lon : null,
      simMs: Number.isFinite(opts.simMs) ? opts.simMs : null,
      kind: opts.kind || 'feature',
    };
    this.entries.push(e);
    this.index.set(name, e);
    return e;
  }

  has(name) { return this.index.has(name); }
  get size() { return this.entries.length; }

  /**
   * Feed the current position in. `near` is what `Orbit.nearestFeature`
   * returns — the caller already has one every frame, so this costs nothing.
   */
  step(near, opts = {}) {
    if (!near || !near.inside) return null;
    return this.record(near.f[0], opts);
  }

  /** Most recent first, which is the order a log wants to be read in. */
  list() { return this.entries.slice().reverse(); }

  /** Plain array of objects, for the save file. */
  capture() { return this.entries.map((e) => ({ ...e })); }

  load(entries) {
    this.entries.length = 0;
    this.index.clear();
    if (!Array.isArray(entries)) return this;
    for (const e of entries) {
      if (!e || typeof e.name !== 'string' || this.index.has(e.name)) continue;
      if (this.entries.length >= LIMIT) break;
      const c = {
        name: e.name,
        lat: Number.isFinite(e.lat) ? e.lat : null,
        lon: Number.isFinite(e.lon) ? e.lon : null,
        simMs: Number.isFinite(e.simMs) ? e.simMs : null,
        kind: e.kind || 'feature',
      };
      this.entries.push(c);
      this.index.set(c.name, c);
    }
    return this;
  }
}
