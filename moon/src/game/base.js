/* =============================================================================
   BASE — the ship, once it is on the ground
   -----------------------------------------------------------------------------
   Everything about the ship that is not its geometry: where it stands, what the
   ground under it looks like afterwards, how you walk around inside it, and
   where the boundary between vacuum and air actually is.

   The ship is the only object in the game that edits the Moon. It lands on a
   circle of ground about sixteen metres across which is flattened and feathered
   back into the real terrain, because four rigid legs on a two degree slope is
   a problem for an engineer and not an interesting one for a player. That pad
   is labelled FICTIONAL in the science overlay, and it is the only place in the
   game where measured topography is overwritten rather than added to.

   Walking inside is handled by putting the ship's own floors in front of the
   terrain. When you are within the hull's footprint and above a deck, the deck
   is the ground; the walls are solid boxes that push you back out. That keeps
   one locomotion model for the whole game rather than a separate mode for being
   indoors, which is what makes stepping through the hatch seamless.

   The airlock is a real volume with a real state. Pressure goes from nothing to
   a full cabin over about twenty seconds, and everything that cares about
   pressure, the sound most of all, reads it from here.
   ========================================================================== */

import * as THREE from 'three';
import { SHIP } from '../config.js';
import { Pad } from '../terrain/heightfield.js';
import { enuBasis, llhToXyz, xyzToLlh, offsetLatLon, surfaceDistance } from '../physics/frames.js';

/* Where the decks are in the ship's own frame, from models/ship.js. */
const DECKS = [2.55, 4.95];
const DECK_CLEAR = 2.15;
/* The free floor inside the rack line, with the corners of the twelve-sided
   hull cut off. */
const FLOOR_HALF = 2.75;
const FLOOR_DIAG = 1.9;

export class Base {
  /**
   * @param {object} opts { stage, heightfield, terrain, quality, lat, lon, heading }
   */
  constructor(opts) {
    this.stage = opts.stage;
    this.hf = opts.heightfield;
    this.terrain = opts.terrain;
    this.lat = opts.lat;
    this.lon = opts.lon;
    this.heading = opts.heading ?? 0;
    this.model = null;
    this.airlock = 1;            // 1 = open to the cabin, 0 = open to vacuum
    this.airlockTarget = 1;
    this.pressure = 1;
    this.interiorLevel = 0.85;
    this.group = new THREE.Group();
    opts.stage.world.add(this.group);

    /* Flatten the ground under the legs. This is the one terrain edit. */
    this.groundHeight = this.hf.heightAt(this.lat, this.lon);
    this.pad = new Pad({
      lat: this.lat, lon: this.lon,
      radius: SHIP.padRadius, feather: SHIP.padFeather, height: this.groundHeight,
    });
    this.hf.addPad(this.pad);
    if (this.terrain) {
      const d = SHIP.padRadius * 2.4 / 30300;    // degrees, generously
      this.terrain.invalidateArea([this.lon - d, this.lat - d, this.lon + d, this.lat + d]);
    }

    this._m = new THREE.Matrix4();
    this._e = new THREE.Vector3();
    this._u = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this._pos = { x: 0, y: 0, z: 0 };
  }

  setModel(model) {
    if (this.model) this.group.remove(this.model.group);
    this.model = model;
    if (!model) return;
    this.group.add(model.group);
    model.setInteriorLights(this.interiorLevel);
    model.setLandingLights(true);
    model.setAirlock(this.airlock);
  }

  /** Put the ship in the world, with the floating origin subtracted. */
  place(origin) {
    if (!this.model) return;
    const b = enuBasis(this.lat, this.lon);
    const cy = Math.cos(this.heading * Math.PI / 180), sy = Math.sin(this.heading * Math.PI / 180);
    /* Model +X east, +Y up, +Z south, turned by the landing heading. */
    this._e.set(b.e.x * cy - b.n.x * sy, b.e.y * cy - b.n.y * sy, b.e.z * cy - b.n.z * sy);
    this._s.set(-(b.n.x * cy + b.e.x * sy), -(b.n.y * cy + b.e.y * sy), -(b.n.z * cy + b.e.z * sy));
    this._u.set(b.u.x, b.u.y, b.u.z);
    this._m.makeBasis(this._e, this._u, this._s);
    this.model.group.quaternion.setFromRotationMatrix(this._m);
    llhToXyz(this.lat, this.lon, this.groundHeight, this._pos);
    this.model.group.position.set(
      this._pos.x - origin.x, this._pos.y - origin.y, this._pos.z - origin.z);
  }

  /**
   * A point on the surface expressed in the ship's own frame.
   * @returns {{x, y, z, range}} metres; x east of the ship, z south of it
   */
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
    if (p.range > 12 || !Base.onFloor(p.x, p.z)) return null;
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
    const deck = this.floorAt(lat, lon, alt);
    if (deck === null) return null;
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
    /* Back to geographic. */
    const h = this.heading * Math.PI / 180;
    const c = Math.cos(h), s = Math.sin(h);
    const dLon = x * c - (-z) * s;
    const dLat = (-z) * c + x * s;
    return {
      lat: this.lat + dLat / 1737400 * 180 / Math.PI,
      lon: this.lon + dLon / (1737400 * Math.cos(this.lat * Math.PI / 180)) * 180 / Math.PI,
    };
  }

  /** Open the airlock towards vacuum (0) or towards the cabin (1). */
  cycleAirlock(toward) { this.airlockTarget = toward; }

  step(dt, playerLlh) {
    const rate = dt / SHIP.airlockCycle;
    if (this.airlock < this.airlockTarget) this.airlock = Math.min(this.airlockTarget, this.airlock + rate);
    else if (this.airlock > this.airlockTarget) this.airlock = Math.max(this.airlockTarget, this.airlock - rate);
    /* Pressure follows the inner door, which is what the sound listens to. */
    this.pressure = Math.max(0, Math.min(1, this.airlock));
    if (this.model) {
      this.model.setAirlock(this.airlock);
      this.model.animate({ airlock: this.airlock, interiorLevel: this.interiorLevel,
                           timeOfDaySeconds: 0, dt });
    }
    return this;
  }

  snapshot(playerLlh) {
    const inside = playerLlh ? this.inside(playerLlh.lat, playerLlh.lon, playerLlh.h) : false;
    return {
      lat: this.lat, lon: this.lon, heading: this.heading,
      airlock: this.airlock, pressure: inside ? this.pressure : 0,
      inside, interiorLevel: this.interiorLevel,
      range: playerLlh ? surfaceDistance(playerLlh.lat, playerLlh.lon, this.lat, this.lon) : Infinity,
    };
  }
}
