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
    /* Everything the suspension remembers about the ground it was on, because
       it is not on that ground any more. `lastMean` and `groundRate` used to
       survive a teleport, so restoring a save computed a climb rate from the
       old site to the new one -- thousands of metres across one frame -- and
       launched the vehicle on arrival. */
    this.lastMean = undefined;
    this.groundRate = 0;
    this.meanGround = undefined;
    this.wasDown = undefined;
    this.airborneFor = 0;
    this.suspension = [0, 0, 0, 0];
    this.contact = [true, true, true, true];
    return this;
  }

  get groundHeight() { return this.ground.heightAt(this.lat, this.lon); }
  /* Height is measured above the mean of the four contact patches, which is
     the plane the vehicle actually rides on. */
  get altitude() { return (this.meanGround ?? this.groundHeight) + this.height; }

  /**
   * Maximum tractive force the ground can accept, in newtons.
   *
   * This, not the motor, is what decides how hard the rover accelerates. In a
   * sixth of a gravity the vehicle weighs 2.3 kN, so even good regolith grip
   * gives under two kilonewtons to push against, well below what the motors
   * can ask for. Which is why the boost has to work here rather than on the
   * torque: multiplying a force that is already being clamped away changes
   * nothing at all, and for a long time that is exactly what it did.
   *
   * Boosting therefore raises the effective grip, not the torque -- the drive
   * shifting torque between wheels to use what the surface will actually
   * take. That is the fiction, and it is a small one.
   */
  tractionLimit(boosting = this.boost) {
    const g = GM_MOON / Math.pow(R_MOON + this.altitude, 2);
    const onGround = this.contact.reduce((n, c) => n + (c ? 1 : 0), 0) / 4;
    const grip = ROVER.grip * (boosting ? ROVER.boostGrip : 1);
    return grip * ROVER.mass * g * onGround;
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

    /* --- getting air -------------------------------------------------------
       `height` is measured from the mean of the contact patches, so the body
       has no memory of how fast that mean was itself rising. Drive off a cliff
       and the existing model works -- the ground falls away, the springs run
       out of travel, the wheels lose contact. But drive *up* a ramp and over
       its lip and nothing happened: the vehicle had been climbing at its speed
       times the sine of the slope, and all of that was thrown away the instant
       the ground levelled, because it only ever existed in the ground's frame.
       So when the ground stops rising, the body keeps the speed it had.

       The previous attempt at this was wrong in four ways at once, and between
       them they are why the rover levitated and flew off with the camera. It
       took `groundRate - rate`, which is POSITIVE when the ground drops -- so
       a downward step threw the vehicle upward. It compared single frames, so
       it was really measuring d2h/dt2 across one 60th of a second and was
       frame-rate dependent: at 144 fps a three-centimetre step saturated it.
       It had no way to tell terrain from a data artefact, and the terrain
       system serves plenty -- a tile refining, a raster landing, a 125 m pit
       being cut -- each of which is a step of metres in one frame. And its
       0.5 m/s threshold only filtered pebbles at walking pace: at the boost
       ceiling the vehicle covers half a metre per frame against a 25 cm
       procedural noise floor, which is below Nyquist, so the "rate" was
       aliased noise of several m/s and it fired on most frames.

       This version measures the thing it actually wants -- how fast the ground
       under the wheels is climbing -- and:
         - takes the climb rate only while the wheels are down, since a body in
           the air has no ground rate to inherit;
         - low-passes it over about a fifth of a second, so one bad sample
           cannot launch anything and the number stops being frame-rate
           dependent;
         - throws away any single step bigger than the suspension can absorb,
           because real terrain at a plausible speed cannot do that and a
           refining tile can;
         - and launches on the climb rate being LOST, which is the sign the
           old code had backwards.
       The band limit added in the same pass as this comment is what makes the
       low-pass meaningful: physics now samples the same surface the mesh
       carries, so there is real signal in there rather than noise. */
    const climb = dt > 0 ? (mean - (this.lastMean ?? mean)) / dt : 0;
    this.lastMean = mean;
    const anyDown = this.contact.some(Boolean);
    /* A step no plausible speed could produce is the data moving, not the
       ground. `suspTravel` is the natural scale: anything the springs could
       have swallowed is terrain, anything larger is a discontinuity. */
    const plausible = Math.abs(climb * dt) <= ROVER.suspTravel;
    const climbNow = (anyDown && plausible) ? climb : 0;
    const tau = 0.2;
    const wasRate = this.groundRate ?? 0;
    this.groundRate = wasRate + (climbNow - wasRate) * Math.min(1, dt / tau);

    /* And this is what the launch actually is.
       `height` and `vertical` are measured against the mean of the contact
       patches, which makes that mean a moving reference frame. A frame that
       accelerates shows up inside itself as a pseudo-force -- a_rel = a_body -
       a_frame -- and that single term is the whole of getting air. On a
       constant ramp the ground's climb rate is constant, the term is zero, and
       nothing happens, correctly. At the lip the climb rate collapses to nil,
       the term goes sharply positive, and the body is thrown exactly as hard
       as the ground stopped coming up. Drive off a drop and it works the other
       way round, which is the case that worked all along.
       It is bounded by construction: the filter above limits how fast the rate
       can change, the clamp below limits the worst case anyway, and because
       terrain noise is symmetric the term averages to nothing over bumps
       instead of accumulating. The previous attempt only ever ADDED, which is
       why it levitated. */
    const framePush = dt > 0 ? (this.groundRate - wasRate) / dt : 0;
    const pseudo = Math.max(-4 * g, Math.min(4 * g, framePush));

    const weight = ROVER.mass * g;
    this.vertical += ((load - weight) / ROVER.mass - pseudo) * dt;
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
    /* The slope is wanted twice -- once for what the wheels can push against
       and once for what gravity is doing to you -- so it is measured here,
       above both, rather than only in front of the second. */
    const slopeDeg = this.ground.slopeAt ? this.ground.slopeAt(this.lat, this.lon, 4) : 0;
    const slope = slopeDeg * Math.PI / 180;
    const limit = this.tractionLimit() * Math.cos(slope);
    const maxSpeed = this.boost ? ROVER.speedBoost : ROVER.speedMax;
    const throttle = Math.max(-1, Math.min(1, input.throttle || 0));
    let force = throttle * ROVER.motorForce;
    /* Whether the parking brake is actually winning. It matters twice: once
       for pinning the vehicle at a standstill, and once below, where the
       anti-jitter guard must not become a second, unconditional parking brake
       that holds it on ground no wheel could hold it on. */
    let holding = false;
    if (input.brake) force = -Math.sign(this.speed) * ROVER.brakeForce;
    else if (Math.abs(throttle) < 0.02) {
      /* Coasting, or parked. With nobody aboard this is the parking brake, and
         it needs to be a real one: the residual drag is 0.12 of the brake
         force, which over 1450 kg is 0.43 m/s^2, and gravity down a slope beats
         that from fifteen degrees. So a rover left on anything but the flat
         drove itself away, and because the ship flattens sixteen metres of pad
         around itself you only ever saw it after parking somewhere real.
         Parked it gets the whole brake, and is held at a standstill only where
         the ground can actually hold it: the wheels can resist `limit` and
         gravity is pulling with mg·sin(slope), so past the friction angle the
         pin is released and it slides, brake or no brake. Pinning
         unconditionally would have made a 48 degree slope as good as a
         car park. */
      const parked = input.parked === true;
      force = -Math.sign(this.speed) * ROVER.brakeForce * (parked ? 1 : 0.12);
      const downhill = ROVER.mass * g * Math.sin(slope);
      holding = parked && downhill <= limit;
      if (holding && Math.abs(this.speed) < 0.05) {
        this.speed = 0;
        force = 0;
      }
    }
    /* Grip saturation: ask for more than the surface can give and the wheels
       spin, which on the Moon throws a rooster tail and gets you nowhere. */
    this.slipping = Math.abs(force) > limit;
    force = Math.max(-limit, Math.min(limit, force));

    const before = this.speed;
    this.speed += force / ROVER.mass * dt;
    if (Math.abs(this.speed) > maxSpeed) this.speed = Math.sign(this.speed) * maxSpeed;
    /* A brake that overshoots through zero should stop, not reverse. But only
       where something is holding it: on ground past the friction angle this
       guard was quietly pinning a sliding vehicle at a standstill every frame,
       and the slope never got a chance. */
    if (before !== 0 && Math.sign(this.speed) !== Math.sign(before) && !input.throttle
        && (holding || !input.parked)) this.speed = 0;

    /* Slope. On anything past the friction angle the rover slides whatever the
       driver does, which is what makes a crater wall a decision. That angle is
       atan(grip) and it falls out of the two terms rather than being declared:
       traction is scaled by the cosine above, the pull below by the sine, and
       where the sine wins the wheels cannot hold. */
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

  /**
   * Top a suit up from the rover's own stores. Returns false when there is not
   * enough left, because a recharge that costs nothing is not a range tier —
   * the point of the middle tier is that it can run out too.
   *
   * What it charges for is mass: oxygen, scrubber and feedwater. It does not
   * charge for the suit's battery, and that is deliberate rather than an
   * oversight. The rover's own drive energy is unlimited by design, so the
   * vehicle carries a power source this game never meters; billing for a
   * kilowatt-hour into a backpack while the traction motors draw on the same
   * supply for free would be an inconsistency, not a constraint. Electricity
   * is the one thing out here that is genuinely cheap.
   */
  rechargeSuit(suit) {
    const need = suit.refillCost ? suit.refillCost() : { o2: 1.0, co2: 0.6, water: 4.5 };
    if (this.supplies.o2 < need.o2 || this.supplies.co2 < need.co2 ||
        this.supplies.water < need.water) return false;
    this.supplies.o2 -= need.o2;
    this.supplies.co2 -= need.co2;
    this.supplies.water -= need.water;
    suit.recharge();
    return true;
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
