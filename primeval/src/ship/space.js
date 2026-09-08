// Getting off a planet, crossing to the other one, and coming back down.
//
// The trick is that there is only ever one flat world under you. Above about
// 22 km the ground fades into haze and a sphere fades in behind it; from then
// on you are looking at a planet instead of standing on one. Coming down runs
// the same band in reverse, so the seam is inside a layer of atmosphere you
// cannot see through anyway.

import * as THREE from 'three';
import { clamp, lerp, smoothstep } from '../math/noise.js';
import { SHIP } from '../config.js';

export const FADE_LOW = 21000;      // metres — ground still solid below this
export const FADE_HIGH = 44000;     // metres — pure orbital view above this

/** Visual radii. Not the real numbers; the numbers that look right. */
export const BODY_RADIUS = { planet: 2_600_000, moon: 720_000 };
export const TRANSIT_DISTANCE = 402_000_000;   // metres, THERA to ANVIL

export class SpaceStage {
  constructor(game) {
    this.game = game;
    this.orbitT = 0;
    this.transit = null;
    this.arrivalAltitude = 220000;
    this.starStreak = 0;
    this.destination = null;
  }

  /** Which body are we leaving, and which are we aiming at? */
  bodies() {
    const g = this.game;
    return g.locale.id === 'moon'
      ? { local: g.moonBody, dest: g.planetBody, localKind: 'moon', destKind: 'planet' }
      : { local: g.planetBody, dest: g.moonBody, localKind: 'planet', destKind: 'moon' };
  }

  destinationName() {
    return this.game.locale.id === 'moon' ? 'THERA' : 'ANVIL';
  }

  update(dt, game) {
    const ship = game.ship;
    const alt = ship && game.mode === 'SHIP' ? ship.pos.y : game.camera.position.y;
    this.orbitT = game.locale.hasAtmosphere || game.locale.id === 'moon'
      ? smoothstep(FADE_LOW, FADE_HIGH, alt) : 0;

    const { local, dest, localKind, destKind } = this.bodies();

    if (this.orbitT <= 0.001 && !this.transit) {
      // On or near the surface: the sky handles the small moon overhead.
      local.visible = false;
      return;
    }

    // --- the world below --------------------------------------------------
    const R = BODY_RADIUS[localKind];
    const h = Math.max(1200, alt);
    local.visible = true;
    local.setDirection(new THREE.Vector3(0, -1, 0));
    local.setAngularRadius(Math.asin(clamp(R / (R + h), 0, 0.99999)));
    local.uniforms.uAtmoStrength.value = localKind === 'planet' ? 1 : 0;
    if (local.halo) local.halo.material.uniforms.uCol.value.setRGB(0.30, 0.58, 1.0);

    // --- the world ahead --------------------------------------------------
    const Rd = BODY_RADIUS[destKind];
    const dist = this.transit ? this.transit.remaining : TRANSIT_DISTANCE;
    dest.visible = true;
    dest.setAngularRadius(Math.asin(clamp(Rd / (Rd + dist), 0, 0.99999)));
    // The destination sits ahead and a little above the flight path, so that
    // pointing the nose at it is a thing you can actually do.
    const dir = this.destinationDirection(game);
    dest.setDirection(dir);

    if (this.transit) this.stepTransit(dt, game);
  }

  destinationDirection(game) {
    // A fixed inertial bearing per locale — the other body does not wander
    // while you are trying to line up on it.
    const a = game.locale.id === 'moon' ? 1.15 : 2.35;
    return new THREE.Vector3(Math.cos(a) * 0.62, 0.30, Math.sin(a) * 0.62).normalize();
  }

  /** Nose-to-destination alignment, 1 = dead on. */
  alignment(game) {
    if (!game.ship) return 0;
    return game.ship.forward.dot(this.destinationDirection(game));
  }

  canTransit(game) {
    const s = game.ship;
    if (!s || game.mode !== 'SHIP') return false;
    if (this.transit) return false;
    if (s.state !== 'SPACE') return false;
    if (s.fuel < 12) return false;
    return this.alignment(game) > 0.90 && s.throttle > 0.55;
  }

  transitBlocker(game) {
    const s = game.ship;
    if (!s || s.state !== 'SPACE') return 'CLEAR ATMOSPHERE FIRST';
    if (s.fuel < 12) return 'FUEL TOO LOW FOR TRANSIT';
    if (this.alignment(game) <= 0.90) return `ALIGN NOSE TO ${this.destinationName()}`;
    if (s.throttle <= 0.55) return 'THROTTLE UP FOR TRANSIT BURN';
    return null;
  }

  begin(game) {
    if (!this.canTransit(game)) return false;
    this.transit = { remaining: TRANSIT_DISTANCE, t: 0, duration: 17, peak: 0 };
    this.destination = this.destinationName();
    game.ship.state = 'TRANSIT';
    game.ship.say(`TRANSIT BURN — ${this.destination}`, 4);
    game.emit('transitStart', this.destination);
    return true;
  }

  abort(game) {
    if (!this.transit) return;
    this.transit = null;
    game.ship.state = 'SPACE';
    game.ship.say('TRANSIT ABORTED', 3);
  }

  stepTransit(dt, game) {
    const tr = this.transit;
    const ship = game.ship;
    tr.t += dt;
    // Ease in, hold, ease out — the ship is never simply teleported.
    const p = clamp(tr.t / tr.duration, 0, 1);
    const eased = p < 0.18 ? (p / 0.18) * 0.5 * 0.18
      : p > 0.82 ? 1 - (1 - p) * (1 - p) / 0.18 * 0.5
        : p;
    tr.remaining = TRANSIT_DISTANCE * (1 - clamp(eased, 0, 1));
    tr.peak = Math.sin(p * Math.PI);
    this.starStreak = tr.peak;
    ship.burn = 1;
    ship.fuel = clamp(ship.fuel - dt * 1.35, 0, SHIP.maxFuel);
    ship.shake = Math.max(ship.shake, 0.14 + tr.peak * 0.18);

    if (game.input.down('KeyS') && tr.t > 1.5) { this.abort(game); return; }

    if (p >= 1) {
      this.arrive(game);
    }
  }

  /** Drop into the destination's local space, high and fast. */
  arrive(game) {
    const dest = this.destination;
    this.transit = null;
    this.starStreak = 0;
    const ship = game.ship;
    game.emit('transitArrive', dest);
    game.switchLocale(dest === 'ANVIL' ? 'moon' : 'planet', { fromSpace: true });
    const site = dest === 'ANVIL' ? game.moonSite : game.landingSite;
    ship.pos.set(site.x + 2600, this.arrivalAltitude, site.z + 4200);
    ship.vel.set(-140, -820, -220);
    // Point the nose down the velocity vector so the first thing you see is
    // the surface coming up at you.
    const look = ship.vel.clone().normalize();
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), look.clone().negate(), new THREE.Vector3(0, 1, 0));
    ship.quat.setFromRotationMatrix(m);
    ship.state = 'SPACE';
    ship.throttle = 0.25;
    ship.gearDown = false;
    ship.say(`${dest} — ${(this.arrivalAltitude / 1000).toFixed(0)} KM · DESCEND`, 5);
  }

  /** Range/target text for the HUD and the cockpit nav display. */
  navText(game) {
    if (this.transit) {
      const km = this.transit.remaining / 1000;
      return { target: this.destination, range: km > 1000 ? `${(km / 1000).toFixed(1)} Mm` : `${km.toFixed(0)} km` };
    }
    const s = game.ship;
    if (!s) return { target: '—', range: '—' };
    if (s.state === 'SPACE') {
      return { target: this.destinationName(), range: `${(TRANSIT_DISTANCE / 1e6).toFixed(0)} Mm` };
    }
    // In atmosphere: point at the interesting thing on the ground.
    const site = game.locale.id === 'moon' ? game.moonSite : game.landingSite;
    if (!site) return { target: '—', range: '—' };
    const d = Math.hypot(s.pos.x - site.x, s.pos.z - site.z);
    return {
      target: game.locale.id === 'moon' ? 'ANVIL STATION' : 'ECHO-7',
      range: d > 1000 ? `${(d / 1000).toFixed(1)} km` : `${d.toFixed(0)} m`,
    };
  }
}
