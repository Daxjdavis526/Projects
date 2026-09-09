/* =============================================================================
   VEHICLE — the rover, once it is on the ground
   -----------------------------------------------------------------------------
   Ties the rover's physics to its model and to the player: where it stands, how
   you get on and off, where the camera goes when you are driving, and what
   happens to your suit when the cabin is sealed and pressurised around you.

   Three ranges, and this is the middle one. The suit carries hours, the rover
   carries days, and the ship carries as much as you like. So an expedition is a
   planning problem: how far out, how long there, how far back, and is the rover
   going to be within walking distance when the suit runs down.

   Driving is done from the seat, because the whole appeal of an open rover is
   that you are outside on it. Closing the canopy changes that: the cabin comes
   up to pressure over about half a minute, the suit stops spending anything,
   and the sound changes completely, because there is now air around you.
   ========================================================================== */

import * as THREE from 'three';
import { ROVER } from '../config.js';
import { Rover, MODE } from '../physics/rover.js';
import { enuBasis, llhToXyz, surfaceDistance, offsetLatLon } from '../physics/frames.js';

/* How close you have to be to climb on. */
const BOARD_RANGE = 4.0;

export class Vehicle {
  constructor(opts) {
    this.stage = opts.stage;
    this.hf = opts.heightfield;
    this.rover = new Rover({
      lat: opts.lat, lon: opts.lon, heading: opts.heading ?? 0, ground: opts.heightfield,
    });
    this.model = null;
    this.driving = false;
    this.group = new THREE.Group();
    opts.stage.world.add(this.group);
    this._m = new THREE.Matrix4();
    this._e = new THREE.Vector3();
    this._u = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this._p = { x: 0, y: 0, z: 0 };
    this.dust = 0;
    this.canopyEdge = false;
  }

  setModel(model) {
    if (this.model) this.group.remove(this.model.group);
    this.model = model;
    if (model) this.group.add(model.group);
  }

  /** Near enough to climb on? */
  canBoard(lat, lon) {
    return surfaceDistance(lat, lon, this.rover.lat, this.rover.lon) < BOARD_RANGE;
  }

  /** Where a person standing next to it would be, to get off. */
  dismountPoint() {
    return offsetLatLon(this.rover.lat, this.rover.lon,
      (this.rover.heading + 270) % 360, 2.2);
  }

  step(dt, input, driving) {
    this.driving = driving;
    const r = this.rover;
    const toggle = input.toggleCanopy && !this.canopyEdge;
    this.canopyEdge = !!input.toggleCanopy;
    r.step(dt, driving ? { ...input, toggleCanopy: toggle } : { throttle: 0, toggleCanopy: toggle });

    /* Dust builds up while the wheels are turning and never comes off on its
       own: lunar dust is electrostatically bonded and abrasive, and brushing
       only grinds it in. It is cleaned at the ship, not out here. */
    if (Math.abs(r.speed) > 0.5) this.dust = Math.min(1, this.dust + dt * 0.004);
    return this;
  }

  /** Put the model where the physics says the vehicle is. */
  place(origin, dt) {
    if (!this.model) return;
    const r = this.rover;
    const b = enuBasis(r.lat, r.lon);
    const cy = Math.cos(r.heading * Math.PI / 180), sy = Math.sin(r.heading * Math.PI / 180);
    /* Model +X east, +Y up, +Z south; the vehicle's nose is model -Z. */
    this._e.set(b.e.x * cy - b.n.x * sy, b.e.y * cy - b.n.y * sy, b.e.z * cy - b.n.z * sy);
    this._s.set(-(b.n.x * cy + b.e.x * sy), -(b.n.y * cy + b.e.y * sy), -(b.n.z * cy + b.e.z * sy));
    this._u.set(b.u.x, b.u.y, b.u.z);
    this._m.makeBasis(this._e, this._u, this._s);
    this.model.group.quaternion.setFromRotationMatrix(this._m);
    /* Lean with the ground. Pitch is about the vehicle's own right-hand axis
       and roll about its nose, both already worked out by the physics. */
    const lean = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-r.pitch, 0, -r.roll, 'XZY'));
    this.model.group.quaternion.multiply(lean);
    /* Rolled over is a real state, not a message: put it on its side. */
    if (r.rolled) {
      this.model.group.quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * 0.42));
    }

    const ground = r.meanGround ?? this.hf.heightAt(r.lat, r.lon);
    llhToXyz(r.lat, r.lon, ground + r.height - ROVER.clearance, this._p);
    this.model.group.position.set(
      this._p.x - origin.x, this._p.y - origin.y, this._p.z - origin.z);

    this.model.animate({
      wheelAngle: r.wheelAngle, steer: r.steer, suspension: r.suspension,
      speed: r.speed, canopy: r.canopy, boost: r.boost, dt,
    });
    this.model.setCanopy(r.canopy);
    this.model.setDust(this.dust);
  }

  /**
   * Where the driver's eyes are, in world coordinates.
   */
  camera(yaw, pitch, origin) {
    const r = this.rover;
    const b = enuBasis(r.lat, r.lon);
    const ground = r.meanGround ?? this.hf.heightAt(r.lat, r.lon);
    const p = { x: 0, y: 0, z: 0 };
    /* Seated on the left, eyes about a metre and a half above the ground, which
       on this vehicle is above the waist line and clear of the roll arch. */
    const seat = offsetLatLon(r.lat, r.lon, (r.heading + 270) % 360, 0.55);
    llhToXyz(seat.lat, seat.lon, ground + r.height + 1.05, p);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return {
      eye: p, up: b.u,
      dir: {
        x: (b.n.x * cy + b.e.x * sy) * cp + b.u.x * sp,
        y: (b.n.y * cy + b.e.y * sy) * cp + b.u.y * sp,
        z: (b.n.z * cy + b.e.z * sy) * cp + b.u.z * sp,
      },
      head: p, fov: 62,
    };
  }

  snapshot(playerLlh) {
    const s = this.rover.snapshot();
    s.driving = this.driving;
    s.dust = this.dust;
    s.range = playerLlh
      ? surfaceDistance(playerLlh.lat, playerLlh.lon, this.rover.lat, this.rover.lon) : Infinity;
    s.boardable = s.range < BOARD_RANGE;
    return s;
  }
}

export { MODE };
