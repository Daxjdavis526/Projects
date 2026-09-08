/* =============================================================================
   DESCENT — going down
   -----------------------------------------------------------------------------
   The one piece of theatre in the game, and it is kept honest by being flown
   rather than animated: the profile below is a real descent trajectory, thrust
   against gravity, and where it ends is where the ship is for the rest of the
   game. Nothing is teleported.

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
const START_RANGE = 3100;        // m short of the site
const APPROACH_BEARING = 250;    // degrees; the Sun is usually behind you at dawn

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
    this.vDown = 26;
    this.speed = 175;             // m/s of horizontal closure at high gate
    this.dust = 0;                // 0..1, how much the plume is lifting
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
       a shaft: the ship arrives at the site and at the ground together. The
       vertical rate then chases that commanded height, and both rates are
       limited so nothing snaps. */
    const wantAgl = range > 2200 ? START_ALT
      : range > 140 ? 48 + (range - 140) * 0.46
      : range * 0.42;
    const wantDown = clamp((agl - wantAgl) * 0.55, -9, 44);
    const wantSpeed = range > 2000 ? 175
      : range > 700 ? 95
      : range > 180 ? 34
      : range > 35 ? 11
      : 2.4;

    this.vDown += clamp(wantDown - this.vDown, -14 * dt, 26 * dt);
    this.speed += clamp(wantSpeed - this.speed, -34 * dt, 20 * dt);
    /* The last few metres are flown slowly, by eye, exactly as they were on
       every Apollo landing. */
    if (agl < 14) this.vDown = Math.min(this.vDown, 1.2);

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
      gravity: GM_MOON / Math.pow(R_MOON + this.alt, 2),
    };
  }
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
