/* =============================================================================
   TRACK — where you have actually been, as a line
   -----------------------------------------------------------------------------
   Two things in the brief want the same recording. The rover's console is asked
   for a "traveled path"; the surface is asked for tracks and footprints that
   persist. Both are the same question — where has this vehicle or this pair of
   boots been — so both read one recorder.

   The hard part is not remembering, it is remembering cheaply. A rover at 18
   km/h logging every frame produces four thousand points a minute and a save
   file that grows without bound, and almost all of them lie on a straight line
   between their neighbours. So points are only kept when they say something new:
   far enough from the last one to matter, or turning enough to be a corner.
   Douglas-Peucker on top of that would be tidier still and is not worth it —
   this runs live and the cheap test throws away better than ninety-five per
   cent of a straight drive on its own.

   Distances are in metres on the surface; the recorder is told them rather than
   computing a projection, so it is pure arithmetic with no frame conventions in
   it and can be checked in Node.
   ========================================================================== */

import { surfaceDistance, bearing } from '../physics/frames.js';

/* Far enough to be a new place, and a big enough turn to be a corner. Twelve
   metres is about two rover lengths; eight degrees is a deliberate steer
   rather than a correction. */
const MIN_STEP = 12;
const MIN_TURN = 8;
/* A long expedition is thousands of kilometres. At a point every twelve metres
   that is a lot of points, so the oldest are thinned rather than dropped: half
   of every second block goes, which keeps the shape of where you have been and
   loses only the fine detail of the earliest part of it. */
const LIMIT = 6000;

export class Track {
  /** @param {Array} points optional, from a save */
  constructor(points) {
    this.points = [];
    this.length = 0;
    this.load(points);
  }

  /**
   * Offer a position. Returns the point if it was kept, otherwise null.
   * @param {number} lat @param {number} lon
   */
  add(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const last = this.points[this.points.length - 1];
    if (!last) return this.push(lat, lon);

    const step = surfaceDistance(lat, lon, last.lat, last.lon);
    if (step < 0.5) return null;                 // standing still

    const prev = this.points[this.points.length - 2];
    let turned = 0;
    if (prev) {
      const a = bearing(prev.lat, prev.lon, last.lat, last.lon);
      const b = bearing(last.lat, last.lon, lat, lon);
      turned = Math.abs(((b - a + 540) % 360) - 180);
    }
    if (step < MIN_STEP && turned < MIN_TURN) return null;
    this.length += step;
    return this.push(lat, lon);
  }

  push(lat, lon) {
    const p = { lat, lon };
    this.points.push(p);
    if (this.points.length > LIMIT) this.thin();
    return p;
  }

  /** Drop every other point in the oldest half, keeping the ends. */
  thin() {
    const half = Math.floor(this.points.length / 2);
    const kept = [];
    for (let i = 0; i < half; i++) if (i % 2 === 0) kept.push(this.points[i]);
    this.points = kept.concat(this.points.slice(half));
  }

  get size() { return this.points.length; }
  clear() { this.points.length = 0; this.length = 0; return this; }

  /** The most recent `n` points, oldest first, for drawing. */
  tail(n = 400) {
    return this.points.slice(Math.max(0, this.points.length - n));
  }

  /** Flat pairs, which is what a save should hold. */
  capture() {
    return { m: Math.round(this.length),
             p: this.points.map(q => [Number(q.lat.toFixed(6)), Number(q.lon.toFixed(6))]) };
  }

  load(data) {
    this.points.length = 0;
    this.length = 0;
    if (!data) return this;
    const arr = Array.isArray(data) ? data : data.p;
    if (!Array.isArray(arr)) return this;
    for (const q of arr) {
      const lat = Array.isArray(q) ? q[0] : q && q.lat;
      const lon = Array.isArray(q) ? q[1] : q && q.lon;
      if (Number.isFinite(lat) && Number.isFinite(lon)) this.points.push({ lat, lon });
    }
    this.length = Number.isFinite(data.m) ? data.m : this.measure();
    return this;
  }

  /** Total ground covered along the kept points. */
  measure() {
    let m = 0;
    for (let i = 1; i < this.points.length; i++) {
      m += surfaceDistance(this.points[i - 1].lat, this.points[i - 1].lon,
                           this.points[i].lat, this.points[i].lon);
    }
    return m;
  }
}
