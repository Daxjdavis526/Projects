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
import { enuBasis, llhToXyz, xyzToLlh, surfaceDistance, offsetLatLon, bearing } from '../physics/frames.js';

/* How close you have to be to climb on. */
const BOARD_RANGE = 4.0;

/* Driving views, cycled by the same key the astronaut's are. */
export const VIEW = { SEAT: 'seat', CHASE: 'chase' };
const VIEW_CYCLE = [VIEW.SEAT, VIEW.CHASE];

export class Vehicle {
  constructor(opts) {
    this.stage = opts.stage;
    this.hf = opts.heightfield;
    this.rover = new Rover({
      lat: opts.lat, lon: opts.lon, heading: opts.heading ?? 0, ground: opts.heightfield,
    });
    this.model = null;
    this.driving = false;
    this.view = VIEW.SEAT;
    this.group = new THREE.Group();
    opts.stage.world.add(this.group);
    this._m = new THREE.Matrix4();
    this._e = new THREE.Vector3();
    this._u = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this._p = { x: 0, y: 0, z: 0 };
    /* The lean and the rollover twist, allocated once. `place` runs every
       frame and everything else in it already works this way. */
    this._lean = new THREE.Quaternion();
    this._leanE = new THREE.Euler(0, 0, 0, 'XZY');
    this._twist = new THREE.Quaternion();
    this._rollAxis = new THREE.Vector3(0, 0, 1);
    this.dust = 0;
    this.canopyEdge = false;
    this.rider = null;              // an astronaut model parented into the seat
    this.riderHome = null;          // where to put it back on dismount
    this.rollSide = 0;              // which way it went over, latched while rolled
  }

  setModel(model) {
    /* A rider is parented into the old model's seat, so it has to come out
       before that model is thrown away or it goes with it -- which is what
       changing quality tier mid-drive would otherwise do. */
    const rider = this.rider;
    const home = this.riderHome;
    if (rider) this.releaseRider();
    if (this.model) this.group.remove(this.model.group);
    this.model = model;
    if (model) this.group.add(model.group);
    if (rider) this.seatRider(rider, home);
  }

  /** Near enough to climb on? */
  canBoard(lat, lon) {
    return surfaceDistance(lat, lon, this.rover.lat, this.rover.lon) < BOARD_RANGE;
  }

  /**
   * Where a person standing next to it would be, to get off.
   *
   * Clear of the vehicle, which 2.2 m was not: the track is 2.4 m, so half of
   * it is 1.2 m before the tyre even has width, and the seat is on this side
   * too. You were put down inside the bodywork and nothing noticed, because
   * the rover's colliders were built and never read by anything.
   */
  dismountPoint() {
    const clear = ROVER.track / 2 + 1.6;
    return offsetLatLon(this.rover.lat, this.rover.lon,
      (this.rover.heading + 270) % 360, clear);
  }

  /**
   * Push a body out of the hull, in the same shape `Base.resolve` uses so the
   * EVA substep loop can treat a vehicle and a ship identically.
   *
   * The boxes have existed since the model was written and nothing has ever
   * consulted them, so until now you could walk straight through the rover.
   */
  resolve(lat, lon, h, radius = 0.34) {
    const boxes = this.model && this.model.colliders;
    if (!boxes || !boxes.length || this.driving) return null;
    const r = this.rover;
    const d = surfaceDistance(lat, lon, r.lat, r.lon);
    if (d > 6) return null;                       // nowhere near it

    /* Into the vehicle frame, which the colliders are written in: x to the
       right of the heading, y up from the wheel contact plane, z forward. */
    const rel = (bearing(r.lat, r.lon, lat, lon) - r.heading) * Math.PI / 180;
    let fwd = d * Math.cos(rel), side = d * Math.sin(rel);
    const wheelPlane = (r.meanGround ?? this.hf.heightAt(r.lat, r.lon))
      + r.height - ROVER.clearance;
    const up = h - wheelPlane;

    /* Open, there is nothing above the waist to walk into — that is the point
       of the open configuration. Sealed, the whole pressure shell counts. */
    const sealed = r.canopy > 0.5;
    let pushed = false;
    for (const b of boxes) {
      if (!sealed && b.centre[1] > 1.25) continue;
      const hx = b.half[0] + radius, hy = b.half[1], hz = b.half[2] + radius;
      const dx = side - b.centre[0], dy = up - b.centre[1], dz = fwd - b.centre[2];
      if (Math.abs(dx) >= hx || Math.abs(dy) >= hy || Math.abs(dz) >= hz) continue;
      /* Out through whichever of the two horizontal faces is nearer. Never
         vertically: being put on the roof is a worse answer than being inside
         the bodywork, and the deck is something you are meant to stand on. */
      if (hx - Math.abs(dx) <= hz - Math.abs(dz)) side = b.centre[0] + Math.sign(dx || 1) * hx;
      else fwd = b.centre[2] + Math.sign(dz || 1) * hz;
      pushed = true;
    }
    if (!pushed) return null;
    const out = Math.hypot(fwd, side);
    const outBrg = (r.heading + Math.atan2(side, fwd) * 180 / Math.PI + 360) % 360;
    return offsetLatLon(r.lat, r.lon, outBrg, out);
  }

  step(dt, input, driving) {
    this.driving = driving;
    const r = this.rover;
    const toggle = input.toggleCanopy && !this.canopyEdge;
    this.canopyEdge = !!input.toggleCanopy;
    /* `parked` is the parking brake, and this is the layer that knows to set
       it: nobody is aboard, so the vehicle is not coasting with its foot off
       the throttle, it is standing still and should go on standing still. */
    r.step(dt, driving
      ? { ...input, toggleCanopy: toggle }
      : { throttle: 0, parked: true, toggleCanopy: toggle });

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
    /* Lean with the ground, in the vehicle's own frame: pitch about its right
       hand axis, roll about its nose. The physics fits a plane through the four
       contact patches and hands both over already, with positive pitch meaning
       nose up and negative roll meaning the right side is the low one.

       Both of these used to be negated here, which drew the lean backwards:
       climbing a twenty degree slope the physics said twenty degrees nose up
       and the model was drawn twenty degrees nose DOWN, a forty degree error
       against the hill, with the uphill wheels buried and the downhill pair in
       the air. The signs are worth stating rather than re-deriving, because
       this is the second time they have been got wrong here. In this frame
       (+X east, +Y up, +Z south, nose at -Z):

         a rotation of +t about +X sends the nose (0,0,-1) to (0, sin t, -cos t)
         a rotation of +f about +Z sends the right (1,0,0) to (cos f, sin f, 0)

       so nose-up wants +pitch and right-side-low wants the already negative
       +roll. Both pass through untouched. `test/vehicle.test.mjs` pins it. */
    this._leanE.set(r.pitch, 0, r.roll, 'XZY');
    this._lean.setFromEuler(this._leanE);
    this.model.group.quaternion.multiply(this._lean);
    /* Rolled over is a real state, not a message: put it on its side. On the
       side it actually went over — this was a bare `+0.42 PI` regardless, so a
       vehicle that dropped its right wheels and tipped right was drawn lying
       on its left. The direction is latched when it goes over rather than read
       live, because `roll` keeps moving afterwards and the wreck should not
       roll back and forth under the camera. */
    if (r.rolled) {
      if (!this.rollSide) this.rollSide = (r.roll || 0) <= 0 ? -1 : 1;
      this._twist.setFromAxisAngle(this._rollAxis, this.rollSide * Math.PI * 0.42);
      this.model.group.quaternion.multiply(this._twist);
    } else if (this.rollSide) {
      this.rollSide = 0;
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
   * Hang an astronaut model in the driver's seat.
   *
   * Reparenting rather than placing. The rider used to be positioned every
   * frame from the player's own coordinates -- at the vehicle's centre with no
   * seat offset, 0.9 m above a single `heightAt` sample while the vehicle body
   * was drawn from the mean of its four contact patches, and yawed to the
   * mouse rather than to the rover. Two different ground references meant the
   * figure floated and sank against its own seat over every bump and stayed on
   * the ground whenever the rover got air.
   *
   * Parented to the seat, none of that arithmetic exists to get wrong: the
   * rider inherits the body's position, its heading, its lean and its
   * suspension squat because it is part of it.
   *
   * @param {object} model an astronaut model, or null to release the current one
   * @param {THREE.Object3D} home where to put it back when it gets out
   */
  seatRider(model, home) {
    if (this.rider && this.rider !== model) this.releaseRider();
    const anchor = this.model && this.model.riders && this.model.riders[0];
    if (!model || !anchor) return false;
    this.rider = model;
    this.riderHome = home || null;
    anchor.add(model.group);
    /* The anchor is the hip joint and the model is built with its origin at
       the boot soles a metre below that. Facing the nose, which is -Z in the
       vehicle's frame and the model's own forward too, so no rotation. */
    model.group.position.set(0, -1.0, 0);
    model.group.quaternion.identity();
    model.group.scale.setScalar(1);
    return true;
  }

  /** Put the rider back in the world, standing on its own again. */
  releaseRider() {
    const model = this.rider;
    if (!model) return null;
    if (this.riderHome) this.riderHome.add(model.group);
    else model.group.removeFromParent();
    model.group.position.set(0, 0, 0);
    this.rider = null;
    this.riderHome = null;
    return model;
  }

  /**
   * Round to the next view, the same way the astronaut's `F` does.
   * @returns {string} the view now in use
   */
  toggleView() {
    const i = VIEW_CYCLE.indexOf(this.view);
    this.view = VIEW_CYCLE[(i + 1) % VIEW_CYCLE.length];
    return this.view;
  }

  /**
   * Where the camera is, in world coordinates.
   *
   * Two views. From the seat, because the whole appeal of an open rover is
   * being outside on it; and from behind, because you cannot see a vehicle
   * jump while you are sitting in it. The chase eye is built the same way the
   * astronaut's third person is (`game/eva.js`): pull back along the view,
   * lift, refuse to go underground, then aim at the subject rather than along
   * the original ray, so the rover stays framed while the view swings.
   */
  camera(yaw, pitch) {
    const r = this.rover;
    const b = enuBasis(r.lat, r.lon);
    const ground = r.meanGround ?? this.hf.heightAt(r.lat, r.lon);
    const p = { x: 0, y: 0, z: 0 };
    /* Seated on the left, eyes about a metre and a half above the ground, which
       on this vehicle is above the waist line and clear of the roll arch. */
    const seat = offsetLatLon(r.lat, r.lon, (r.heading + 270) % 360, 0.55);
    llhToXyz(seat.lat, seat.lon, ground + r.height + 1.05, p);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const dir = {
      x: (b.n.x * cy + b.e.x * sy) * cp + b.u.x * sp,
      y: (b.n.y * cy + b.e.y * sy) * cp + b.u.y * sp,
      z: (b.n.z * cy + b.e.z * sy) * cp + b.u.z * sp,
    };
    if (this.view !== VIEW.CHASE) {
      return { eye: p, up: b.u, dir, head: p, fov: 62 };
    }

    /* Behind and above. Eleven metres because the hull is three long and the
       arches stand two and a half up, and anything nearer is inside the
       bodywork -- the astronaut's 4.2 m would put the camera in the cabin. */
    const back = 11.0, lift = 3.4;
    const hub = { x: 0, y: 0, z: 0 };
    llhToXyz(r.lat, r.lon, ground + r.height + 0.9, hub);
    const e = {
      x: hub.x - dir.x * back + b.u.x * lift,
      y: hub.y - dir.y * back + b.u.y * lift,
      z: hub.z - dir.z * back + b.u.z * lift,
    };
    /* Never underground. Looking at the rover from inside a crater wall is
       both useless and the first thing a chase camera does on rough terrain. */
    const llh = xyzToLlh(e.x, e.y, e.z);
    const floor = this.hf.heightAt(llh.lat, llh.lon) + 1.5;
    if (llh.h < floor) {
      const up = floor - llh.h;
      e.x += b.u.x * up; e.y += b.u.y * up; e.z += b.u.z * up;
    }
    const look = { x: hub.x - e.x, y: hub.y - e.y, z: hub.z - e.z };
    const ll = Math.hypot(look.x, look.y, look.z) || 1;
    return {
      eye: e, up: b.u,
      dir: { x: look.x / ll, y: look.y / ll, z: look.z / ll },
      head: hub, fov: 55,
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
