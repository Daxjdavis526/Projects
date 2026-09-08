/* =============================================================================
   ROVER — driving on a sixth of a gravity
   -----------------------------------------------------------------------------
   Pure: no DOM, no three.js, so the whole vehicle runs in the tests.

   Driving on the Moon is dominated by one fact. The wheels can only push as
   hard as the ground can hold them down, and the ground holds them down with a
   sixth of the weight it would on Earth. Regolith's friction is not especially
   low, around 0.6 for a wire mesh wheel, but 0.6 of a sixth is 0.1, so the best
   acceleration available is about a tenth of a gravity and the best braking is
   the same. Everything else follows from that: long stopping distances, wide
   slow corners, and a genuine risk of simply sliding downhill.

   The Apollo crews found all of it. The Lunar Roving Vehicle was rated for
   about 10 km/h, recorded 18 downhill, and averaged 8; John Young got all four
   wheels off the ground during the Grand Prix, and Gene Cernan spent a
   memorable minute talking about how the back end came round on him. This
   vehicle is bigger, heavier and faster, and it is fiction, but the handling
   it is given comes from that record rather than from a racing game.

   The suspension is four independent spring and damper legs sampling the real
   heightfield, which is what makes the ground shape matter: a crater rim
   unloads the uphill wheels, and unloaded wheels have no grip at all.

   Energy is unlimited by design. The brief asks for exploration, not for mining
   in order to keep driving. What is not unlimited is what the people inside
   need, which is why the rover carries days of consumables and the suit carries
   hours, and why a long expedition is a planning problem.
   ========================================================================== */

import { ROVER, GM_MOON, R_MOON } from '../config.js';
import { llhToXyz, xyzToLlh, enuBasis, offsetLatLon } from './frames.js';

export const MODE = { OPEN: 'open', CLOSING: 'closing', CLOSED: 'closed', OPENING: 'opening' };

/* Wheel positions in the vehicle frame: x right, z forward. */
const WHEELS = [
  { x: -ROVER.track / 2, z: ROVER.wheelBase / 2, front: true },
  { x: ROVER.track / 2, z: ROVER.wheelBase / 2, front: true },
  { x: -ROVER.track / 2, z: -ROVER.wheelBase / 2, front: false },
  { x: ROVER.track / 2, z: -ROVER.wheelBase / 2, front: false },
];

export class Rover {
  /**
   * @param {object} opts { lat, lon, heading, ground }
   */
  constructor(opts) {
    this.ground = opts.ground;
    this.lat = opts.lat ?? 0;
    this.lon = opts.lon ?? 0;
    this.heading = opts.heading ?? 0;        // degrees, 0 north
    this.speed = 0;                          // m/s along the heading, signed
    this.yawRate = 0;                        // rad/s
    this.vertical = 0;                       // m/s, positive up
    this.height = 0;                         // m of the hull above the ground
    this.pitch = 0; this.roll = 0;
    this.wheelAngle = 0;
    this.steer = 0;
    this.suspension = [0, 0, 0, 0];
    this.contact = [true, true, true, true];
    this.mode = MODE.OPEN;
    this.canopy = 0;                          // 0 open, 1 sealed
    this.pressure = 0;
    this.boost = false;
    this.boostHeat = 0;
    this.rolled = false;
    this.distance = 0;
    this.airborneFor = 0;
    this.supplies = { ...ROVER.supplies };
    this.place(this.lat, this.lon, this.heading);
  }

  place(lat, lon, heading = this.heading) {
    this.lat = lat; this.lon = lon; this.heading = heading;
    this.speed = 0; this.yawRate = 0; this.vertical = 0;
    this.height = ROVER.clearance;
    this.rolled = false;
    this.vertical = 0;
    return this;
  }

  get groundHeight() { return this.ground.heightAt(this.lat, this.lon); }
  /* Height is measured above the mean of the four contact patches, which is
     the plane the vehicle actually rides on. */
  get altitude() { return (this.meanGround ?? this.groundHeight) + this.height; }

  /** Maximum tractive force the ground can accept, in newtons. */
  tractionLimit() {
    const g = GM_MOON / Math.pow(R_MOON + this.altitude, 2);
    const onGround = this.contact.reduce((n, c) => n + (c ? 1 : 0), 0) / 4;
    return ROVER.grip * ROVER.mass * g * onGround;
  }

  /**
   * @param {number} dt seconds
   * @param {object} input { throttle -1..1, steer -1..1, brake, boost, toggleCanopy }
   */
  step(dt, input = {}) {
    const g = GM_MOON / Math.pow(R_MOON + this.altitude, 2);

    /* --- suspension --------------------------------------------------------
       Each wheel samples the ground where it actually is, so the vehicle
       pitches and rolls with the terrain rather than following a single point,
       and a wheel over a hollow simply stops contributing. */
    const c = Math.cos(this.heading * Math.PI / 180), s = Math.sin(this.heading * Math.PI / 180);
    /* Where each wheel's patch of ground actually is. */
    const gh = [0, 0, 0, 0];
    for (let i = 0; i < WHEELS.length; i++) {
      const w = WHEELS[i];
      /* Vehicle frame to compass: z forward along the heading, x to the right. */
      const north = w.z * c - w.x * s;
      const east = w.z * s + w.x * c;
      const p = offsetLatLon(this.lat, this.lon,
        Math.atan2(east, north) * 180 / Math.PI, Math.hypot(east, north));
      gh[i] = this.ground.heightAt(p.lat, p.lon);
    }
    /* The body rides above the mean of the four contact patches, and it leans
       to match them. Both parts matter. On a twenty degree slope the front
       wheels are over a metre higher than the back ones, which is nearly three
       times the suspension travel, so a body held level cannot sit on a hill at
       all: the uphill springs bottom out, the downhill ones hang in the air,
       and the vehicle has no grip anywhere. A real vehicle pitches with the
       ground and the springs only absorb what is left. */
    const mean = (gh[0] + gh[1] + gh[2] + gh[3]) / 4;
    const staticSag = ROVER.mass * g / (4 * ROVER.suspK);
    this.meanGround = mean;
    const riseForward = ((gh[0] + gh[1]) - (gh[2] + gh[3])) / (2 * ROVER.wheelBase);
    const riseRight = ((gh[1] + gh[3]) - (gh[0] + gh[2])) / (2 * ROVER.track);
    const wantPitch = Math.atan(riseForward);
    const wantRoll = Math.atan(riseRight);
    /* Lean towards it rather than snapping, so a crater rim is felt rather
       than teleported through. */
    this.pitch += (wantPitch - this.pitch) * Math.min(1, dt * 6);
    this.roll += (wantRoll - this.roll) * Math.min(1, dt * 6);

    let load = 0;
    for (let i = 0; i < WHEELS.length; i++) {
      const w = WHEELS[i];
      /* Where this corner of the leaning body sits, against where its ground
         is. Whatever is left over is spring travel. */
      const corner = this.height + w.z * Math.tan(this.pitch) + w.x * Math.tan(this.roll);
      const rest = corner - (gh[i] - mean);
      /* The springs are preloaded so that standing still gives exactly the
         static sag that carries the weight. Get this wrong and the vehicle
         either sinks through the ground or is fired off it on the first frame. */
      const compression = Math.max(0, Math.min(ROVER.suspTravel,
        ROVER.clearance + staticSag - rest));
      this.suspension[i] = compression;
      this.contact[i] = compression > 0.001;
      load += compression * ROVER.suspK - this.vertical * ROVER.suspC * (this.contact[i] ? 1 : 0);
    }

    const weight = ROVER.mass * g;
    this.vertical += (load - weight) / ROVER.mass * dt;
    this.height += this.vertical * dt;
    if (this.height < 0.05) { this.height = 0.05; this.vertical = Math.max(0, this.vertical); }
    const anyContact = this.contact.some(Boolean);
    this.airborneFor = anyContact ? 0 : this.airborneFor + dt;

    /* --- rolling over ------------------------------------------------------
       Past about forty degrees of roll the centre of mass is outside the
       wheels and it goes over. Recovery is a button, not a reload. */
    if (Math.abs(this.roll) > 0.7 || Math.abs(this.pitch) > 0.8) this.rolled = true;
    if (this.rolled) {
      this.speed *= Math.max(0, 1 - dt * 2);
      this.yawRate = 0;
      this.boost = false;
      return this;
    }

    /* --- drive -------------------------------------------------------------
       Nothing here is limited by the motors. It is limited by the ground,
       which can only accept about a tenth of a gravity's worth of push. */
    this.boost = !!input.boost && this.boostHeat < 1;
    const limit = this.tractionLimit();
    const maxSpeed = this.boost ? ROVER.speedBoost : ROVER.speedMax;
    const throttle = Math.max(-1, Math.min(1, input.throttle || 0));
    let force = throttle * (this.boost ? ROVER.motorForce * ROVER.boostFactor : ROVER.motorForce);
    if (input.brake) force = -Math.sign(this.speed) * ROVER.brakeForce;
    else if (Math.abs(throttle) < 0.02) force = -Math.sign(this.speed) * ROVER.brakeForce * 0.12;
    /* Grip saturation: ask for more than the surface can give and the wheels
       spin, which on the Moon throws a rooster tail and gets you nowhere. */
    this.slipping = Math.abs(force) > limit;
    force = Math.max(-limit, Math.min(limit, force));

    const before = this.speed;
    this.speed += force / ROVER.mass * dt;
    if (Math.abs(this.speed) > maxSpeed) this.speed = Math.sign(this.speed) * maxSpeed;
    if (before !== 0 && Math.sign(this.speed) !== Math.sign(before) && !input.throttle) this.speed = 0;

    /* Slope. On anything past the friction angle the rover slides whatever the
       driver does, which is what makes a crater wall a decision. */
    const slopeDeg = this.ground.slopeAt ? this.ground.slopeAt(this.lat, this.lon, 4) : 0;
    const slope = slopeDeg * Math.PI / 180;
    if (slope > 0.02 && anyContact) {
      const n = this.ground.normalAt ? this.ground.normalAt(this.lat, this.lon, 4) : null;
      /* The horizontal part of the surface normal points downhill and already
         carries the sine of the slope in its length, so it has to be
         normalised before it is used as a direction or the pull comes out as
         the square of the sine and a steep hill feels like a gentle one. */
      const dl = n ? Math.hypot(n.e, n.n) : 0;
      if (dl > 1e-6) {
        const along = (-n.n * c + -n.e * s) / dl;
        this.speed -= g * Math.sin(slope) * along * dt;
      }
    }

    /* --- steering ----------------------------------------------------------
       All four wheels steer, so it turns tightly, but the cornering force is
       the same traction budget the drive is spending. Ask for too much and it
       understeers, then slides. */
    this.steer += ((input.steer || 0) - this.steer) * Math.min(1, dt * 4);
    const speedAbs = Math.abs(this.speed);
    const maxLateral = limit / ROVER.mass;
    const wanted = this.steer * speedAbs / (ROVER.wheelBase * 0.85);
    const lateral = wanted * speedAbs;
    this.sliding = Math.abs(lateral) > maxLateral;
    const capped = this.sliding ? Math.sign(wanted) * maxLateral / Math.max(speedAbs, 0.1) : wanted;
    this.yawRate = anyContact ? capped : this.yawRate * Math.max(0, 1 - dt);
    this.heading = (this.heading + this.yawRate * dt * 180 / Math.PI * Math.sign(this.speed || 1) + 360) % 360;

    /* --- move --------------------------------------------------------------- */
    const step = this.speed * dt;
    if (Math.abs(step) > 1e-9) {
      const p = offsetLatLon(this.lat, this.lon, this.heading, step);
      this.lat = p.lat; this.lon = p.lon;
      this.distance += Math.abs(step);
    }
    this.wheelAngle = (this.wheelAngle + this.speed * dt / ROVER.wheelRadius) % (Math.PI * 2);

    /* --- boost heat --------------------------------------------------------
       A high-power electric drive mode, not nitrous. It is limited by what the
       motors and their radiators can shed, so it runs for a while and then has
       to cool. */
    this.boostHeat = this.boost
      ? Math.min(1, this.boostHeat + ROVER.boostHeatUp * dt)
      : Math.max(0, this.boostHeat - ROVER.boostHeatDown * dt);

    this.stepCanopy(dt, input);
    return this;
  }

  /** Open and closed, and the pressurisation that goes with closed. */
  stepCanopy(dt, input) {
    if (input.toggleCanopy) {
      if (this.mode === MODE.OPEN) this.mode = MODE.CLOSING;
      else if (this.mode === MODE.CLOSED) this.mode = MODE.OPENING;
    }
    const rate = dt / (ROVER.pressuriseTime * 0.35);
    if (this.mode === MODE.CLOSING) {
      this.canopy = Math.min(1, this.canopy + rate);
      if (this.canopy >= 1) this.mode = MODE.CLOSED;
    } else if (this.mode === MODE.OPENING) {
      /* Depressurise before the seal breaks: the canopy does not move until
         the cabin is down to vacuum. */
      if (this.pressure > 0.01) this.pressure = Math.max(0, this.pressure - dt / 12);
      else {
        this.canopy = Math.max(0, this.canopy - rate);
        if (this.canopy <= 0) this.mode = MODE.OPEN;
      }
    }
    if (this.mode === MODE.CLOSED) {
      this.pressure = Math.min(1, this.pressure + dt / (ROVER.pressuriseTime * 0.65));
    } else if (this.mode === MODE.OPEN) {
      this.pressure = 0;
    }
  }

  /** Put it back on its wheels where it stands. */
  recover() {
    this.rolled = false;
    this.roll = 0; this.pitch = 0;
    this.speed = 0; this.yawRate = 0; this.vertical = 0;
    this.height = ROVER.clearance;
    return this;
  }

  /** Draw down what the people inside are using, in hours of simulated time. */
  consume(hours, crew = 1) {
    this.supplies.o2 = Math.max(0, this.supplies.o2 - 0.084 * crew * hours);
    this.supplies.co2 = Math.max(0, this.supplies.co2 - 0.098 * crew * hours);
    this.supplies.water = Math.max(0, this.supplies.water - 0.26 * crew * hours);
    this.supplies.food = Math.max(0, this.supplies.food - hours / 24 * crew);
    return this;
  }

  /** How long the rover can keep someone alive, in hours. */
  endurance(crew = 1) {
    return Math.min(
      this.supplies.o2 / (0.084 * crew),
      this.supplies.co2 / (0.098 * crew),
      this.supplies.water / (0.26 * crew),
      this.supplies.food * 24 / crew);
  }

  restock() { this.supplies = { ...ROVER.supplies }; return this; }

  snapshot() {
    return {
      lat: this.lat, lon: this.lon, heading: this.heading,
      speed: this.speed, kph: this.speed * 3.6,
      pitch: this.pitch, roll: this.roll, height: this.height,
      wheelAngle: this.wheelAngle, steer: this.steer,
      suspension: this.suspension.slice(), contact: this.contact.slice(),
      mode: this.mode, canopy: this.canopy, pressure: this.pressure,
      boost: this.boost, boostHeat: this.boostHeat,
      rolled: this.rolled, slipping: !!this.slipping, sliding: !!this.sliding,
      airborne: this.airborneFor > 0.05, distance: this.distance,
      supplies: { ...this.supplies }, enduranceHours: this.endurance(),
    };
  }
}
