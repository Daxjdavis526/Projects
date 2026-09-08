/* =============================================================================
   SHIP INTERIOR — the part of the ship that is a place rather than a model
   -----------------------------------------------------------------------------
   Where the decks are, where the walls are, where the hatch is, and what the
   airlock is doing. No three.js and no DOM, for the same reason `physics/` and
   `terrain/` have none: it can then be run and checked in Node, and this is
   exactly the code that most needed checking. All of it existed before and
   none of it had a caller — `floorAt` and `resolve` were dead, so the decks
   were geometry you fell through and the hull was open air, which took out the
   walkable interior, the airlock, the ship's cabin sound and the resupply that
   makes the ship a range tier at all.

   The frame is the hull's own: +X to starboard, +Y up, +Z forward towards the
   airlock, metres, with the origin on the pad under the axis. The pad is
   flattened to exactly the ground height the ship landed on, so a deck's height
   above the terrain is simply its height above that origin.
   ========================================================================== */

import { surfaceDistance } from '../physics/frames.js';
import { SHIP } from '../config.js';

/* Where the decks are in the ship's own frame, from models/ship.js. */
const DECKS = [2.55, 4.95];
const DECK_CLEAR = 2.15;
/* The free floor inside the rack line, with the corners of the twelve-sided
   hull cut off. */
const FLOOR_HALF = 2.75;
const FLOOR_DIAG = 1.9;
/* The airlock module runs from the hull face at z = 3.30 to its outer face at
   5.20, so the porch and ladder head sit just beyond it, and the inner hatch
   opens into the vestibule just inside the floor plan. See models/ship.js. */
const LADDER_Z = 5.9;
const INNER_Z = 2.2;

export { DECKS, FLOOR_HALF, FLOOR_DIAG, LADDER_Z, INNER_Z };

export class ShipInterior {
  /**
   * @param {object} opts { lat, lon, heading, groundHeight }
   */
  constructor(opts) {
    this.lat = opts.lat;
    this.lon = opts.lon;
    this.heading = opts.heading ?? 0;
    this.groundHeight = opts.groundHeight ?? 0;
    this.airlock = 1;            // 1 = open to the cabin, 0 = open to vacuum
    this.airlockTarget = 1;
    this.pressure = 1;
  }

  /** Geographic position to hull coordinates. */
  toLocal(lat, lon, alt) {
    const range = surfaceDistance(lat, lon, this.lat, this.lon);
    if (range > 400) return { x: 1e6, y: 0, z: 1e6, range };
    /* Close in, the surface is flat enough that a local tangent plane is exact
       to well under a millimetre, so this is a rotation and not a projection. */
    const dLat = (lat - this.lat) * Math.PI / 180 * 1737400;
    const dLon = (lon - this.lon) * Math.PI / 180 * 1737400 * Math.cos(this.lat * Math.PI / 180);
    const h = -this.heading * Math.PI / 180;
    const c = Math.cos(h), s = Math.sin(h);
    return {
      x: dLon * c - dLat * s,
      y: alt - this.groundHeight,
      z: -(dLat * c + dLon * s),
      range,
    };
  }

  /** The inverse: hull coordinates back to a latitude and longitude. */
  toGeographic(x, z) {
    const h = this.heading * Math.PI / 180;
    const c = Math.cos(h), s = Math.sin(h);
    const dLon = x * c - (-z) * s;
    const dLat = (-z) * c + x * s;
    return {
      lat: this.lat + dLat / 1737400 * 180 / Math.PI,
      lon: this.lon + dLon / (1737400 * Math.cos(this.lat * Math.PI / 180)) * 180 / Math.PI,
    };
  }

  /** True where the hull's floor plan is solid ground rather than a doorway. */
  static onFloor(x, z) {
    return Math.abs(x) < FLOOR_HALF && Math.abs(z) < FLOOR_HALF &&
           Math.abs(x) + Math.abs(z) < FLOOR_HALF + FLOOR_DIAG;
  }

  /**
   * The floor under a point inside the ship, or null if there is none.
   * Whichever deck is below you and within a step wins, so walking up the
   * companionway hands you from one to the next.
   */
  floorAt(lat, lon, alt) {
    const p = this.toLocal(lat, lon, alt);
    if (p.range > 12 || !ShipInterior.onFloor(p.x, p.z)) return null;
    let best = null;
    for (const d of DECKS) {
      if (p.y >= d - 0.6 && p.y < d + DECK_CLEAR) best = d;
    }
    return best === null ? null : this.groundHeight + best;
  }

  /** Are you breathing ship air? */
  inside(lat, lon, alt) { return this.floorAt(lat, lon, alt) !== null; }

  /**
   * Push a position out of the hull walls. Returns a corrected lat/lon, or
   * null if nothing was in the way.
   */
  resolve(lat, lon, alt, radius = 0.34) {
    const p = this.toLocal(lat, lon, alt);
    if (p.range > 14) return null;
    if (this.floorAt(lat, lon, alt) === null) return null;
    const lim = FLOOR_HALF - radius;
    let x = Math.max(-lim, Math.min(lim, p.x));
    let z = Math.max(-lim, Math.min(lim, p.z));
    /* The cut corners, as a single diagonal constraint. */
    const diag = Math.abs(x) + Math.abs(z);
    const diagLim = FLOOR_HALF + FLOOR_DIAG - radius;
    if (diag > diagLim) {
      const k = diagLim / diag;
      x *= k; z *= k;
    }
    if (Math.abs(x - p.x) < 1e-6 && Math.abs(z - p.z) < 1e-6) return null;
    return this.toGeographic(x, z);
  }

  /**
   * Getting in and out.
   *
   * There is no ladder-climbing physics here and there should not be: what was
   * asked for is a walkable interior and an airlock that means something, not a
   * climbing minigame. So the hatch is an interaction, exactly as boarding the
   * rover is, and the cycle it starts is the part with the physics in it.
   */
  ladderFoot() { return this.toGeographic(0, LADDER_Z); }

  /**
   * Where you stand once you are through. `agl` is height above the terrain,
   * which under the hull is the pad, and the pad is flattened to exactly
   * `groundHeight` — so the deck offset is what `Player.place` wants.
   */
  insideStand() {
    const g = this.toGeographic(0, INNER_Z);
    return { lat: g.lat, lon: g.lon, agl: DECKS[0] + 0.02 };
  }

  /** Close enough to the ladder, and outside, to climb in. */
  canEnter(lat, lon, alt) {
    if (this.floorAt(lat, lon, alt) !== null) return false;
    const f = this.ladderFoot();
    return surfaceDistance(lat, lon, f.lat, f.lon) < 2.6;
  }

  /** Close enough to the inner hatch, and inside, to climb out. */
  canExit(lat, lon, alt) {
    if (this.floorAt(lat, lon, alt) === null) return false;
    const p = this.toLocal(lat, lon, alt);
    return p.y < DECKS[0] + 1.2 && p.z > INNER_Z - 2.4;
  }

  /** Open the airlock towards vacuum (0) or towards the cabin (1). */
  cycleAirlock(toward) { this.airlockTarget = toward; }

  /** Advance the airlock. Pressure follows the inner door; the sound follows pressure. */
  step(dt) {
    const rate = dt / SHIP.airlockCycle;
    if (this.airlock < this.airlockTarget) {
      this.airlock = Math.min(this.airlockTarget, this.airlock + rate);
    } else if (this.airlock > this.airlockTarget) {
      this.airlock = Math.max(this.airlockTarget, this.airlock - rate);
    }
    this.pressure = Math.max(0, Math.min(1, this.airlock));
    return this;
  }
}
