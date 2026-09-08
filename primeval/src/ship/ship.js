// Flying the HALBERD.
//
// Not a study simulator. Enough aerodynamics that the ship feels heavy and
// fast and behaves differently in thick air, thin air and vacuum, with an
// assist layer so that pointing the nose somewhere and pushing the throttle
// does what you want.

import * as THREE from 'three';
import { buildShip, buildCockpit } from './model.js';
import { SHIP, PLANET } from '../config.js';
import { clamp, lerp, smoothstep } from '../math/noise.js';

export const SHIP_STATE = {
  LANDED: 'LANDED', BOARDING: 'BOARDING', FLIGHT: 'FLIGHT', SPACE: 'SPACE', TRANSIT: 'TRANSIT',
};

const _f = new THREE.Vector3();
const _u = new THREE.Vector3();
const _r = new THREE.Vector3();
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

export class Ship {
  constructor(scene, camera) {
    this.name = SHIP.name;
    const built = buildShip();
    this.art = built;
    this.group = built.group;
    this.cockpit = buildCockpit();
    // Raised with the seat so the coaming sits below the sight line.
    this.cockpit.group.position.y = 0.46;
    this.group.add(this.cockpit.group);
    scene.add(this.group);
    this.camera = camera;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.angVel = new THREE.Vector3();

    this.throttle = 0;
    this.vtol = true;
    this.gearDown = true;
    this.gearT = 1;
    this.rampT = 1;
    this.rampOpen = true;
    this.state = SHIP_STATE.LANDED;
    this.fuel = SHIP.maxFuel;
    this.hull = 100;
    this.skinTemp = 18;
    this.piloted = false;
    this.thirdPerson = false;
    this.chase = new THREE.Vector3();
    this.lightsOn = false;
    this.burn = 0;
    this.shake = 0;
    this.landedNormalY = 1;
    this.entryHeat = 0;
    this.transit = null;
    this.message = '';
    this.messageT = 0;
    this.plasma = null;
    this.locale = null;
    this.reentryG = 0;
  }

  /** Drop the ship onto the ground at a spot, powered down. */
  placeOn(x, z, world, yaw = 0) {
    const y = world.heightAt(x, z);
    this.pos.set(x, y + 3.4, z);
    this.vel.set(0, 0, 0);
    this.quat.setFromEuler(new THREE.Euler(0, yaw, 0, 'YXZ'));
    this.state = SHIP_STATE.LANDED;
    this.gearDown = true; this.gearT = 1;
    this.rampOpen = true; this.rampT = 1;
    this.throttle = 0;
    this.sync();
  }

  sync() {
    this.group.position.copy(this.pos);
    this.group.quaternion.copy(this.quat);
  }

  get forward() { return _f.set(0, 0, -1).applyQuaternion(this.quat); }
  get up() { return _u.set(0, 1, 0).applyQuaternion(this.quat); }
  get right() { return _r.set(1, 0, 0).applyQuaternion(this.quat); }
  get speed() { return this.vel.length(); }
  get headingDeg() {
    const f = this.forward;
    let d = Math.atan2(f.x, -f.z) * 180 / Math.PI;
    return d < 0 ? d + 360 : d;
  }
  get altitude() {
    return this.locale ? this.pos.y - this.locale.heightAt(this.pos.x, this.pos.z) : this.pos.y;
  }

  /**
   * How close is the player to the boarding point? Measured to the foot of the
   * ramp, and generous enough that the spot you step off onto is inside it —
   * disembarking somewhere you cannot immediately re-board is a bad afternoon.
   */
  entryDistance(p) {
    const ramp = _v.set(0.6, -2.0, 6.4).applyQuaternion(this.quat).add(this.pos);
    return p.distanceTo(ramp);
  }

  /** Where the player stands after stepping off — clear of hull and wing. */
  boardingPoint() {
    return new THREE.Vector3(1.9, -2.2, 9.2).applyQuaternion(this.quat).add(this.pos);
  }

  say(msg, seconds = 3) { this.message = msg; this.messageT = seconds; }

  // -------------------------------------------------------------------------

  update(dt, input, game) {
    this.locale = game.locale;
    const grav = game.locale.gravity;
    const alt = this.altitude;
    const atmos = game.locale.hasAtmosphere
      ? clamp(Math.exp(-Math.max(0, this.pos.y) / 11000), 0, 1) : 0;

    this.messageT = Math.max(0, this.messageT - dt);
    if (this.messageT <= 0) this.message = '';

    if (this.piloted) this.control(dt, input, game, atmos, grav);
    else this.throttle = lerp(this.throttle, 0, 1 - Math.exp(-dt * 2));

    if (this.state !== SHIP_STATE.LANDED || this.piloted) {
      this.integrate(dt, atmos, grav, game);
    }

    this.animate(dt, atmos, game);
    this.sync();
    if (this.piloted) this.driveCamera(dt, input, game);
    this.paintScreens(game);
  }

  control(dt, input, game, atmos, grav) {
    const s = this.speed;

    // --- attitude ---
    const authority = this.state === SHIP_STATE.SPACE || !game.locale.hasAtmosphere
      ? 1.0
      : lerp(0.35, 1.25, smoothstep(0, 190, s)) * lerp(0.55, 1.0, atmos);
    const mx = input.mouse.dx * input.sensitivity * 34;
    const my = input.mouse.dy * input.sensitivity * 34;
    const roll = (input.down('KeyA') ? 1 : 0) - (input.down('KeyD') ? 1 : 0);

    this.angVel.x = lerp(this.angVel.x, clamp(-my, -2.2, 2.2) * authority, 1 - Math.exp(-dt * 9));
    this.angVel.y = lerp(this.angVel.y, clamp(-mx, -2.2, 2.2) * authority * 0.55, 1 - Math.exp(-dt * 9));
    this.angVel.z = lerp(this.angVel.z, roll * 2.4 * authority, 1 - Math.exp(-dt * 6));

    _e.set(this.angVel.x * dt, this.angVel.y * dt, this.angVel.z * dt, 'XYZ');
    _q.setFromEuler(_e);
    this.quat.multiply(_q).normalize();

    // --- throttle ---
    if (input.down('KeyW')) this.throttle = clamp(this.throttle + dt * 0.62, 0, 1);
    if (input.down('KeyS')) this.throttle = clamp(this.throttle - dt * 0.9, 0, 1);
    this.after = input.any(['ShiftLeft', 'ShiftRight']) && this.fuel > 0 ? 1 : 0;

    // --- vertical / VTOL ---
    this.lift = 0;
    if (input.down('Space')) this.lift = 1;
    if (input.down('KeyC') || input.down('ControlLeft')) this.lift = -0.7;

    // --- discrete ---
    if (input.hit('KeyG')) {
      this.gearDown = !this.gearDown;
      this.say(this.gearDown ? 'GEAR DOWN' : 'GEAR UP', 2);
    }
    if (input.hit('KeyR')) {
      this.vtol = !this.vtol;
      this.say(this.vtol ? 'VECTORED THRUST — VTOL' : 'AERODYNAMIC MODE', 2.4);
    }
    if (input.hit('KeyV')) this.thirdPerson = !this.thirdPerson;
    if (input.hit('KeyF')) {
      this.lightsOn = !this.lightsOn;
      this.say(this.lightsOn ? 'LANDING LIGHTS ON' : 'LANDING LIGHTS OFF', 1.6);
    }
  }

  integrate(dt, atmos, grav, game) {
    const fwd = this.forward.clone();
    const up = this.up.clone();
    const s = this.speed;

    // --- thrust ---
    const thrustMag = this.throttle * SHIP.maxThrust * (1 + this.after * 0.85);
    this.burn = lerp(this.burn, this.throttle * (0.5 + this.after * 0.5), 1 - Math.exp(-dt * 6));
    const accel = _v.set(0, 0, 0).addScaledVector(fwd, thrustMag);

    // --- vertical thrusters ---
    if (this.vtol || !game.locale.hasAtmosphere) {
      const hover = grav * SHIP.hoverPower;
      // Holding nothing hovers; the assist cancels gravity so a hover is a hover.
      const cmd = this.lift ?? 0;
      const vertical = grav + cmd * hover * 0.9;
      accel.addScaledVector(up, vertical);
      this.burn = Math.max(this.burn, 0.35 + Math.abs(cmd) * 0.5);
    } else if (this.lift > 0) {
      accel.addScaledVector(up, grav * 0.55);
    }

    // --- gravity ---
    accel.y -= grav;

    if (atmos > 0.001) {
      // --- lift: only meaningful with air and airspeed ---
      const q = 0.5 * atmos * s * s;
      const alphaVec = this.vel.clone().normalize();
      const alpha = s > 4 ? Math.asin(clamp(-alphaVec.dot(up), -1, 1)) : 0;
      const cl = clamp(alpha * 4.6, -1.25, 1.25);
      accel.addScaledVector(up, q * cl * 0.00135);

      // --- drag ---
      const cd = 0.020 + Math.abs(cl) * 0.055 + (this.gearDown ? 0.030 : 0);
      accel.addScaledVector(this.vel, -q * cd * 0.00052);

      // --- grip: bleed sideways velocity so it flies, not skids ---
      const along = fwd.clone().multiplyScalar(this.vel.dot(fwd));
      const side = this.vel.clone().sub(along);
      accel.addScaledVector(side, -clamp(atmos * 1.6, 0, 2.2));
    }

    this.vel.addScaledVector(accel, dt);
    this.pos.addScaledVector(this.vel, dt);

    // --- fuel ---
    const burnRate = (this.throttle * 0.55 + this.after * 1.4 + Math.abs(this.lift ?? 0) * 0.5
      + (this.vtol ? 0.35 : 0)) * (game.locale.hasAtmosphere ? 1 : 0.7);
    this.fuel = clamp(this.fuel - burnRate * dt * 0.55, 0, SHIP.maxFuel);
    if (this.fuel <= 0) { this.throttle = Math.min(this.throttle, 0.12); this.after = 0; }

    // --- reentry heating ---
    const heatLoad = atmos * Math.pow(s / 260, 3);
    this.entryHeat = lerp(this.entryHeat, clamp(heatLoad, 0, 1.4), 1 - Math.exp(-dt * 1.4));
    this.skinTemp = lerp(this.skinTemp, 18 + this.entryHeat * 1480, 1 - Math.exp(-dt * 1.2));
    this.shake = Math.max(this.shake - dt * 1.4, this.entryHeat * 0.55 + (atmos * s > 260 ? 0.15 : 0));
    if (this.entryHeat > 1.05) {
      this.hull = clamp(this.hull - (this.entryHeat - 1.05) * 34 * dt, 0, 100);
    }

    // --- ground ---
    const groundY = game.locale.heightAt(this.pos.x, this.pos.z);
    const clearance = this.gearDown ? 3.35 : 1.5;
    if (this.pos.y - groundY < clearance) {
      const vy = this.vel.y;
      this.pos.y = groundY + clearance;
      const level = this.up.y;
      const horizontal = Math.hypot(this.vel.x, this.vel.z);
      if (vy < -14 || (!this.gearDown && vy < -4) || level < 0.72 || horizontal > 26) {
        // A bad arrival.
        this.hull = clamp(this.hull - Math.min(70, Math.abs(vy) * 3.4 + horizontal * 1.4), 0, 100);
        this.shake = 1.2;
        this.say('IMPACT — HULL DAMAGE', 3.5);
        game.emit('shipCrash', Math.abs(vy));
      } else if (this.state !== SHIP_STATE.LANDED && vy < 0.5 && horizontal < 8) {
        this.touchdown(game);
      }
      this.vel.y = Math.max(0, this.vel.y);
      this.vel.x *= 1 - Math.min(1, dt * 4.5);
      this.vel.z *= 1 - Math.min(1, dt * 4.5);
      if (this.state === SHIP_STATE.LANDED) {
        // Sit level on the pad.
        _q.setFromEuler(new THREE.Euler(0, this.yawOf(this.quat), 0, 'YXZ'));
        this.quat.slerp(_q, 1 - Math.exp(-dt * 3));
        this.vel.multiplyScalar(1 - Math.min(1, dt * 6));
      }
    } else if (this.state === SHIP_STATE.LANDED && this.pos.y - groundY > clearance + 0.6) {
      this.state = SHIP_STATE.FLIGHT;
      this.say('AIRBORNE', 2);
      game.emit('shipLaunch');
    }

    // --- space boundary ---
    if (game.locale.hasAtmosphere) {
      if (this.pos.y > SHIP.spaceAltitude && this.state !== SHIP_STATE.SPACE) {
        this.state = SHIP_STATE.SPACE;
        this.say('ATMOSPHERE CLEARED — VACUUM', 4);
        game.emit('enterSpace');
      } else if (this.pos.y < SHIP.spaceAltitude * 0.92 && this.state === SHIP_STATE.SPACE) {
        this.state = SHIP_STATE.FLIGHT;
        game.emit('enterAtmosphere');
      }
    }
  }

  yawOf(q) {
    const f = _f.set(0, 0, -1).applyQuaternion(q);
    return Math.atan2(f.x, -f.z) + Math.PI;
  }

  touchdown(game) {
    this.state = SHIP_STATE.LANDED;
    this.say('TOUCHDOWN', 3);
    this.shake = 0.35;
    game.emit('shipLanded');
  }

  animate(dt, atmos, game) {
    const a = this.art;
    // Gear and ramp.
    this.gearT = lerp(this.gearT, this.gearDown ? 1 : 0, 1 - Math.exp(-dt * 1.9));
    for (const g of a.gear) {
      g.rotation.x = (1 - this.gearT) * 1.55;
      g.visible = this.gearT > 0.02;
    }
    this.rampOpen = this.state === SHIP_STATE.LANDED && !this.piloted;
    this.rampT = lerp(this.rampT, this.rampOpen ? 1 : 0, 1 - Math.exp(-dt * 2.4));
    a.ramp.rotation.x = this.rampT * 0.92;

    // Engines.
    const glow = 0.35 + this.burn * 1.9;
    a.emisU.value = glow;
    a.heatU.value = this.entryHeat;
    a.plumeMat.opacity = clamp(this.burn * 0.55 + this.after * 0.25, 0, 0.85)
      * (0.85 + Math.sin(performance.now() * 0.05) * 0.15);
    for (const p of a.plumes) p.scale.z = 0.4 + this.burn * 1.5 + this.after * 0.9;
    a.engineLight.intensity = this.burn * 30;
    a.engineLight.distance = 30 + this.burn * 40;
    a.landingLight.intensity = this.lightsOn ? 190 : 0;
    a.cockpit ??= null;
    this.cockpit.emisU.value = this.piloted || this.state === SHIP_STATE.LANDED ? 1 : 0.35;

    // From the seat, the hull is around you and there is no aperture cut in
    // it — so hide the exterior shell and let the cockpit interior do the
    // framing. Standard practice, and far more reliable than trying to make a
    // closed lofted tube transparent from one side.
    const inside = this.piloted && !this.thirdPerson;
    a.body.visible = !inside;
    a.canopy.visible = !inside;
    this.cockpit.group.visible = this.piloted || this.state === SHIP_STATE.LANDED;

    // Strobes.
    const t = performance.now() * 0.001;
    const on = (t % 1.6) < 0.09 || ((t + 0.18) % 1.6) < 0.06;
    for (const s of a.strobes) s.visible = on;
  }

  driveCamera(dt, input, game) {
    const cam = this.camera;
    const shakeAmp = this.shake * this.shake * 0.16;
    const t = performance.now() * 0.001;
    if (this.thirdPerson) {
      const back = this.forward.clone().multiplyScalar(-26 - this.speed * 0.035);
      const up = this.up.clone().multiplyScalar(7.5);
      const want = this.pos.clone().add(back).add(up);
      this.chase.lerp(want, 1 - Math.exp(-dt * 4.5));
      cam.position.copy(this.chase);
      cam.up.copy(this.up);
      cam.lookAt(this.pos.clone().addScaledVector(this.forward, 14));
    } else {
      // Inside the canopy bubble, above the fuselage top line. Sit any lower and
      // you are looking at the inside of a closed tube.
      const seat = new THREE.Vector3(0, 1.06, -6.35).applyQuaternion(this.quat).add(this.pos);
      cam.position.copy(seat);
      cam.quaternion.copy(this.quat);
      cam.up.set(0, 1, 0).applyQuaternion(this.quat);
      cam.rotateY(0);
    }
    if (shakeAmp > 0.0001) {
      cam.position.x += Math.sin(t * 47) * shakeAmp * 2.4;
      cam.position.y += Math.sin(t * 39) * shakeAmp * 2.4;
      cam.rotateZ(Math.sin(t * 31) * shakeAmp * 0.5);
    }
  }

  /** Redraw the cockpit MFDs. Cheap: 320×160 canvases, a few times a second. */
  paintScreens(game) {
    this._scrT = (this._scrT ?? 0) + 1;
    if (this._scrT % 6) return;
    const S = this.cockpit.screens;
    if (!S.length) return;
    const alt = this.altitude;

    // 1 — attitude and flight data.
    let c = S[0].ctx;
    c.fillStyle = '#04080a'; c.fillRect(0, 0, 320, 160);
    const pitchDeg = Math.asin(clamp(this.forward.y, -1, 1)) * 180 / Math.PI;
    const rollDeg = Math.atan2(this.right.y, this.up.y) * 180 / Math.PI;
    c.save();
    c.beginPath(); c.rect(8, 8, 150, 144); c.clip();
    c.translate(83, 80); c.rotate(-rollDeg * Math.PI / 180);
    c.fillStyle = '#123a52'; c.fillRect(-160, -160 + pitchDeg * 1.6, 320, 160);
    c.fillStyle = '#2a1d10'; c.fillRect(-160, pitchDeg * 1.6, 320, 160);
    c.strokeStyle = '#8fd8ff'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-70, pitchDeg * 1.6); c.lineTo(70, pitchDeg * 1.6); c.stroke();
    c.restore();
    c.strokeStyle = '#ffb347'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(63, 80); c.lineTo(78, 80); c.moveTo(88, 80); c.lineTo(103, 80); c.stroke();
    c.fillStyle = '#7de3ff'; c.font = '13px monospace';
    c.fillText(`ALT ${alt > 9999 ? (alt / 1000).toFixed(1) + 'k' : alt.toFixed(0)}`, 170, 34);
    c.fillText(`VEL ${this.speed.toFixed(0)}`, 170, 56);
    c.fillText(`THR ${(this.throttle * 100).toFixed(0)}%`, 170, 78);
    c.fillStyle = this.fuel < 22 ? '#ff5a44' : '#a8e05f';
    c.fillText(`FUEL ${this.fuel.toFixed(0)}%`, 170, 100);
    c.fillStyle = this.skinTemp > 900 ? '#ff5a44' : '#8a857c';
    c.fillText(`SKIN ${this.skinTemp.toFixed(0)}C`, 170, 122);
    S[0].tex.needsUpdate = true;

    // 2 — systems.
    c = S[1].ctx;
    c.fillStyle = '#04080a'; c.fillRect(0, 0, 320, 160);
    c.font = '15px monospace';
    const rows = [
      ['MODE', this.vtol ? 'VTOL' : 'AERO', '#7de3ff'],
      ['GEAR', this.gearDown ? 'DOWN' : 'UP', this.gearDown ? '#a8e05f' : '#ffb347'],
      ['HULL', `${this.hull.toFixed(0)}%`, this.hull < 60 ? '#ff5a44' : '#a8e05f'],
      ['ATMOS', game.locale.hasAtmosphere ? `${(game.atmosphere * 100).toFixed(0)}%` : 'VACUUM', '#8fd8ff'],
    ];
    rows.forEach(([k, v, col], i) => {
      c.fillStyle = '#5b6b72'; c.fillText(k, 16, 34 + i * 32);
      c.fillStyle = col; c.fillText(v, 150, 34 + i * 32);
    });
    S[1].tex.needsUpdate = true;

    // 3 — navigation.
    c = S[2].ctx;
    c.fillStyle = '#04080a'; c.fillRect(0, 0, 320, 160);
    c.font = '15px monospace';
    c.fillStyle = '#5b6b72'; c.fillText('DEST', 16, 34);
    c.fillStyle = '#ffb347'; c.fillText(game.navTarget ?? '—', 110, 34);
    c.fillStyle = '#5b6b72'; c.fillText('RANGE', 16, 66);
    c.fillStyle = '#7de3ff'; c.fillText(game.navRange ?? '—', 110, 66);
    c.fillStyle = '#5b6b72'; c.fillText('HDG', 16, 98);
    c.fillStyle = '#7de3ff'; c.fillText(`${this.headingDeg.toFixed(0)}°`, 110, 98);
    c.fillStyle = '#5b6b72'; c.fillText('STATE', 16, 130);
    c.fillStyle = '#a8e05f'; c.fillText(this.state, 110, 130);
    S[2].tex.needsUpdate = true;
  }

  hudState(game) {
    const alt = this.altitude;
    return {
      alt: alt > 9999 ? `${(alt / 1000).toFixed(1)}k` : alt.toFixed(0),
      speed: this.speed.toFixed(0),
      throttle: this.throttle,
      throttlePct: `${(this.throttle * 100).toFixed(0)}%`,
      mode: this.state === SHIP_STATE.TRANSIT ? 'TRANSIT' : (this.vtol ? 'VTOL' : 'AERO'),
      gear: this.gearDown ? 'DOWN' : 'UP',
      fuel: `${this.fuel.toFixed(0)}%`,
      hull: `${this.hull.toFixed(0)}%`,
      skin: `${this.skinTemp.toFixed(0)} C`,
      target: game.navTarget ?? '—',
      range: game.navRange ?? '—',
      att: `${(Math.asin(clamp(this.forward.y, -1, 1)) * 180 / Math.PI).toFixed(0)} / ${this.headingDeg.toFixed(0)}`,
    };
  }
}
