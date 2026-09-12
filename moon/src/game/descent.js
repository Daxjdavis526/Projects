/* =============================================================================
   DESCENT — going down
   -----------------------------------------------------------------------------
   The one piece of theatre in the game, and it is kept honest by being flown
   rather than animated: the guidance below commands a height and a speed from
   the range still to run, the engine supplies what acceleration it can against
   gravity, and where that ends is where the ship is for the rest of the game.
   Nothing is teleported and nothing is interpolated.

   What it is not is a propulsion model. There is no propellant, no mass flow
   and no engine: the thrust available is stated as a thrust-to-weight ratio and
   a horizontal braking limit, both from what a lander of this class can do, and
   the guidance law is a pair of proportional terms rather than anything Apollo
   would recognise. The trajectory is physical; the vehicle is not simulated.

   The shape comes from how the Apollo landings actually went, which is the only
   crewed lunar approach anyone has flown. High gate at a couple of kilometres,
   pitched well over and travelling fast, with the landing site visible out of
   the window. Low gate at a few hundred metres, pitching upright as the
   horizontal speed washes off. Then a slow vertical descent, one to two metres
   a second, from about thirty metres down, which is where the crew is looking
   at the ground rather than at the instruments.

   The last hundred metres are the interesting part. There is no atmosphere to
   spread the exhaust, so the plume is a thin radial sheet of dust leaving the
   surface at a very shallow angle and travelling extremely fast: Apollo 11's
   crew saw it from about forty metres up and described a transparent sheet
   moving outwards, like a thin ground fog, and it obscured the surface without
   ever billowing. The dust here follows that description rather than the
   mushroom cloud a rocket makes on Earth.

   The whole thing can be skipped. It is a landing, not a cutscene.
   ========================================================================== */

import { GM_MOON, R_MOON } from '../config.js';
import { offsetLatLon, bearing, surfaceDistance } from '../physics/frames.js';

/* Where the approach begins: high, fast and off to one side, so the site comes
   into view rather than simply appearing underneath. */
const START_ALT = 1150;          // m above the ground
/* Stays at 3100. Trimming it to 2500 does remove six seconds of unchanging
   cruise, and it also removes the ship's only margin above its own commanded
   profile -- and the profile commands height above the LOCAL ground, so
   approaching over ground that rises towards the site the ship goes below
   profile, cannot climb back (there is no upward authority in the guidance,
   deliberately), and flies into the hill. It missed Apollo 11 by 464 m over
   the kind of relief Tycho actually has. The time comes out of the tail
   instead, which is where it was. */
const START_RANGE = 3100;        // m short of the site
const APPROACH_BEARING = 250;    // degrees; the Sun is usually behind you at dawn
/* Where the glide path ends: fifty metres up at a hundred and forty out, from
   which the last stretch is flown nearly vertically. The slope between there
   and the start follows from those, so the ship begins the approach exactly on
   its own profile rather than above it. That matters now that the descent is
   flown against gravity: a ship above its commanded height can only get back
   down to it at free fall and no faster, so a profile it starts off is a
   profile it never catches. */
const LOW_GATE_ALT = 48, LOW_GATE_RANGE = 140;
const GLIDE = (START_ALT - LOW_GATE_ALT) / (START_RANGE - LOW_GATE_RANGE);
const FINAL_SLOPE = LOW_GATE_ALT / LOW_GATE_RANGE;
const START_SPEED = 175;         // m/s of horizontal closure at high gate

/* What the ship can actually pull.
   A lander's descent engine is sized for a thrust-to-weight of two to three at
   lunar gravity — Apollo's LM descent stage could hold about 2.9 g_moon at low
   mass — so the vertical acceleration available above gravity is a couple of
   lunar gravities, and the horizontal braking authority is set by how far the
   thrust vector can be tilted from vertical. Both are limits here rather than
   an engine model: the file's claim is that the descent is flown against
   gravity, not that it burns propellant. */
const THRUST_TO_WEIGHT = 2.9;
const BRAKE_ACCEL = 34;          // m/s^2 of horizontal deceleration available
const PUSH_ACCEL = 20;           // m/s^2 of horizontal acceleration available

export class Descent {
  /**
   * @param {object} opts { heightfield, target: {lat, lon}, onDone }
   */
  constructor(opts) {
    this.hf = opts.heightfield;
    this.target = opts.target;
    this.onDone = opts.onDone || (() => {});
    this.done = false;
    this.t = 0;

    const from = offsetLatLon(opts.target.lat, opts.target.lon,
                              (APPROACH_BEARING + 180) % 360, START_RANGE);
    this.lat = from.lat;
    this.lon = from.lon;
    this.alt = this.hf.heightAt(from.lat, from.lon) + START_ALT;
    this.heading = APPROACH_BEARING;
    this.pitch = -34 * Math.PI / 180;
    this.speed = START_SPEED;
    this.vDown = GLIDE * START_SPEED;     // on the slope from the first frame
    this.dust = 0;                // 0..1, how much the plume is lifting
    this.thrust = 1;              // multiples of hover thrust, 0 = engine off
    this.touchdown = false;
  }

  /** Give up on the theatre and put the ship on the ground now. */
  skip() {
    this.lat = this.target.lat;
    this.lon = this.target.lon;
    this.alt = this.hf.heightAt(this.lat, this.lon);
    this.finish();
  }

  finish() {
    if (this.done) return;
    this.done = true;
    this.touchdown = true;
    this.dust = 0;
    this.onDone({ lat: this.lat, lon: this.lon, heading: this.heading });
  }

  step(dt) {
    if (this.done) return this;
    this.t += dt;
    const ground = this.hf.heightAt(this.lat, this.lon);
    const agl = this.alt - ground;
    const range = surfaceDistance(this.lat, this.lon, this.target.lat, this.target.lon);

    /* Fly the profile rather than interpolate it. Height is commanded from
       range, which is what makes it a glide path rather than a lift descending
       a shaft: the ship arrives at the site and at the ground together.

       The commanded rate has two terms: the rate that holds the glide path at
       the current ground speed, plus whatever closes the height error that is
       left. Commanding the error alone — which is what this did — asks for
       zero descent exactly when the ship is on profile, so it slides off the
       path and chases it the whole way down. */
    const wantAgl = range > START_RANGE ? START_ALT
      : range > LOW_GATE_RANGE ? LOW_GATE_ALT + (range - LOW_GATE_RANGE) * GLIDE
      : range * FINAL_SLOPE;
    const onPath = (range > LOW_GATE_RANGE ? GLIDE : FINAL_SLOPE) * this.speed;
    /* Never negative. A lander has the thrust to climb and this one is not
       going to: finding itself low on the path, it descends more slowly rather
       than going back up, which is what the crews flew and what keeps the one
       piece of theatre in the game from looking like a yo-yo. */
    const wantDown = clamp(onPath + (agl - wantAgl) * 0.55, 0, 44);
    /* The gates, retuned because the whole thing took fifty-three seconds and
       twenty-one of them went on the last hundred and eighty metres. The shape
       of the profile is unchanged -- high gate, brake, low gate, a slow
       vertical finish -- but the terminal steps used to be 11 m/s and 2.4 m/s,
       which is a very long time to spend closing thirty-five metres. */
    const wantSpeed = range > 2000 ? START_SPEED
      : range > 700 ? 95
      : range > 180 ? 42
      : range > 35 ? 17
      : 4.5;

    /* Against gravity, which is what the header claims and what this used to
       only look like: the vertical rate was rate-limited straight to its
       commanded value and gravity appeared nowhere, so the ship descended the
       way a lift does. Now the guidance asks for an acceleration, the engine
       supplies what it can, and gravity has the rest.

       g is taken at the current radius rather than at the surface. Over a
       kilometre of descent it changes by a tenth of a percent, which is far
       too small to see and is free to be right about. */
    const g = GM_MOON / Math.pow(R_MOON + this.alt, 2);
    /* The commanded vertical acceleration: close the error on the commanded
       rate in about a second. Positive is downward, as vDown is. */
    const wantAccel = (wantDown - this.vDown) / 1.0;
    /* Thrust can push up by (T/W - 1) gravities and can never pull down: an
       engine that is off leaves you falling at exactly g, which is the floor
       on how fast the rate can be reduced and the reason a landing has to be
       started early. */
    const upMax = (THRUST_TO_WEIGHT - 1) * g;
    const accelDown = clamp(wantAccel, -upMax, g);
    this.thrust = clamp((g - accelDown) / g, 0, THRUST_TO_WEIGHT);
    this.vDown += accelDown * dt;

    /* Horizontal, the same way: a commanded speed, an acceleration limited by
       what the tilted thrust vector can do. */
    const wantHoriz = (wantSpeed - this.speed) / 1.0;
    this.speed += clamp(wantHoriz, -BRAKE_ACCEL, PUSH_ACCEL) * dt;
    this.speed = Math.max(0, this.speed);
    /* The last few metres are flown slowly, by eye, exactly as they were on
       every Apollo landing -- Armstrong touched down at about 0.5 m/s. This is
       the single biggest lever on how long the descent feels: at 1.2 m/s it
       imposed nearly twelve seconds on the final fourteen metres by itself. */
    if (agl < 14) this.vDown = Math.min(this.vDown, 2.2);

    /* Steer at the site the whole way in. */
    if (range > 3) this.heading = bearing(this.lat, this.lon, this.target.lat, this.target.lon);
    /* Pitch upright as the speed comes off: at high gate the ship is tilted
       well over to brake, and by low gate it is nearly vertical. */
    const upright = Math.min(1, Math.max(0, 1 - this.speed / 150));
    this.pitch = (-34 + 22 * upright) * Math.PI / 180;

    const moved = Math.min(range, this.speed * dt);
    if (moved > 0) {
      const p = offsetLatLon(this.lat, this.lon, this.heading, moved);
      this.lat = p.lat; this.lon = p.lon;
    }
    this.alt -= this.vDown * dt;

    /* The plume starts to reach the surface from about forty metres, which is
       where Apollo 11 reported first seeing dust move. */
    const target = agl < 45 ? Math.min(1, (45 - agl) / 32) : 0;
    this.dust += (target - this.dust) * Math.min(1, dt * 3);

    const newGround = this.hf.heightAt(this.lat, this.lon);
    if (this.alt <= newGround + 0.05 || (range < 4 && agl < 1.5)) {
      this.alt = newGround;
      this.finish();
    }
    return this;
  }

  /** What the camera should do: watching from the ship, looking ahead and down. */
  camera() {
    return {
      lat: this.lat, lon: this.lon, alt: this.alt + 3.4,
      yaw: this.heading * Math.PI / 180,
      pitch: this.pitch,
    };
  }

  status() {
    const ground = this.hf.heightAt(this.lat, this.lon);
    return {
      agl: this.alt - ground,
      range: surfaceDistance(this.lat, this.lon, this.target.lat, this.target.lon),
      vDown: this.vDown, speed: this.speed, dust: this.dust,
      thrust: this.thrust,
      gravity: GM_MOON / Math.pow(R_MOON + this.alt, 2),
    };
  }
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
