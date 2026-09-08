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
import { ShipInterior } from './interior.js';

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
    this.interior = new ShipInterior({
      lat: this.lat, lon: this.lon, heading: this.heading,
      groundHeight: this.groundHeight,
    });
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
  /* The geometry and the airlock live in game/interior.js, which imports no
     three.js so it can be checked in Node. Everything below is the same call
     on that object; the split exists because this is the code that had no
     callers and no test, and both of those were the same problem. */
  toLocal(lat, lon, alt) { return this.interior.toLocal(lat, lon, alt); }
  toGeographic(x, z) { return this.interior.toGeographic(x, z); }
  floorAt(lat, lon, alt) { return this.interior.floorAt(lat, lon, alt); }
  inside(lat, lon, alt) { return this.interior.inside(lat, lon, alt); }
  resolve(lat, lon, alt, radius) { return this.interior.resolve(lat, lon, alt, radius); }
  ladderFoot() { return this.interior.ladderFoot(); }
  insideStand() { return this.interior.insideStand(); }
  canEnter(lat, lon, alt) { return this.interior.canEnter(lat, lon, alt); }
  canExit(lat, lon, alt) { return this.interior.canExit(lat, lon, alt); }
  cycleAirlock(toward) { this.interior.cycleAirlock(toward); }
  admit(suit) { this.interior.admit(suit); }
  describeDust() { return this.interior.describeDust(); }
  get airlock() { return this.interior.airlock; }
  get pressure() { return this.interior.pressure; }
  get cabinDust() { return this.interior.cabinDust; }

  step(dt, playerLlh) {
    this.interior.step(dt);
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
      cabinDust: this.cabinDust, dustNote: this.describeDust(),
      range: playerLlh ? surfaceDistance(playerLlh.lat, playerLlh.lon, this.lat, this.lon) : Infinity,
    };
  }
}
