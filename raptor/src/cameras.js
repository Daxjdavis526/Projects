// Camera system. Every mode is a full way to fly: the flight model never sees
// which one is active. Positions are computed in world metres and converted to
// render space, so the floating origin is invisible to the player.

import * as THREE from 'three';
import { toRender, origin } from './world.js';
import { heightAt } from './terrain.js';

const D = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

export const MODES = [
  { id: 'cockpit', name: 'Cockpit', cockpit: true },
  { id: 'chase', name: 'Chase' },
  { id: 'chaseClose', name: 'Close chase' },
  { id: 'chaseFar', name: 'Distant chase' },
  { id: 'orbit', name: 'Free orbit' },
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'flyby', name: 'Flyby' },
  { id: 'wing', name: 'Wing' },
  { id: 'nose', name: 'Nose' },
  { id: 'tail', name: 'Tail' },
  { id: 'ground', name: 'Ground observer' },
];

const DEFAULTS = {
  chaseDistance: 1.0,      // multiplier
  stiffness: 1.0,
  lag: 1.0,
  zoomSensitivity: 1.0,
  orbitSensitivity: 1.0,
  fov: 62,
  shake: 1.0,
  mode: 'cockpit',
};

export class CameraRig {
  constructor(aspect) {
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.35, 900000);
    this.settings = { ...DEFAULTS };
    this.load();
    this.mode = this.settings.mode;

    // world-space smoothed state
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.look = new THREE.Vector3();
    this.lookVel = new THREE.Vector3();
    this.up = new THREE.Vector3(0, 1, 0);
    this.quat = new THREE.Quaternion();

    this.orbitYaw = 20 * D;
    this.orbitPitch = 12 * D;
    this.orbitDist = 55;
    this.userOrbit = false;      // true once the player drags in a chase mode
    this.headYaw = 0;            // cockpit look-around
    this.headPitch = 0;

    this.groundPos = null;
    this.flybyPos = null;
    this.flybyT = 0;
    this.cinemaT = 0;
    this.cinemaShot = 0;
    this.shakeAmp = 0;
    this._shakeT = 0;
    this._t = 0;
    this._prevAircraftVel = new THREE.Vector3();
    this._accelLag = new THREE.Vector3();
    this._tmp = new THREE.Vector3();
    this._tmp2 = new THREE.Vector3();
    this._m = new THREE.Matrix4();
    this._initialised = false;
  }

  save() {
    try {
      localStorage.setItem('raptor.camera', JSON.stringify({ ...this.settings, mode: this.mode }));
    } catch (e) { /* private browsing */ }
  }
  load() {
    try {
      const s = JSON.parse(localStorage.getItem('raptor.camera') || '{}');
      Object.assign(this.settings, s);
    } catch (e) { /* ignore */ }
  }

  get isCockpit() { return this.mode === 'cockpit'; }
  get info() { return MODES.find(m => m.id === this.mode); }

  setMode(id, fm) {
    if (!MODES.some(m => m.id === id)) return;
    this.mode = id;
    this.settings.mode = id;
    this.userOrbit = false;
    if (id === 'ground' && !this.groundPos && fm) this.placeGround(fm);
    if (id === 'flyby') this.flybyT = 0;
    if (id === 'cinematic') { this.cinemaT = 0; this.cinemaShot = 0; }
    this.save();
  }

  cycle(dir, fm) {
    const i = MODES.findIndex(m => m.id === this.mode);
    this.setMode(MODES[(i + dir + MODES.length) % MODES.length].id, fm);
  }

  /**
   * Drop a ground observer out in front of the aircraft, far enough ahead and
   * offset far enough to the side that the jet flies *toward* the camera and
   * past it. A close, arbitrary spot beside the aeroplane is the one thing
   * that makes this mode useless.
   */
  placeGround(fm, ahead = null, side = null) {
    const V = Math.max(fm.tas, 60);
    if (ahead === null) ahead = clamp(V * 9, 1400, 11000);
    if (side === null) side = (Math.random() < 0.5 ? -1 : 1) * clamp(V * 0.75, 200, 900);
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(fm.quaternion).setY(0).normalize();
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
    const p = fm.position.clone()
      .addScaledVector(fwd, ahead)
      .addScaledVector(right, side);
    p.y = heightAt(p.x, p.z) + 2.2;
    this.groundPos = p;
  }

  orbitDrag(dx, dy) {
    const s = this.settings.orbitSensitivity;
    if (this.mode === 'cockpit') {
      this.headYaw = clamp(this.headYaw - dx * 0.0032 * s, -150 * D, 150 * D);
      this.headPitch = clamp(this.headPitch - dy * 0.0032 * s, -75 * D, 80 * D);
    } else {
      this.orbitYaw -= dx * 0.005 * s;
      this.orbitPitch = clamp(this.orbitPitch - dy * 0.004 * s, -80 * D, 82 * D);
      this.userOrbit = true;
    }
  }
  recenter() { this.headYaw = this.headPitch = 0; this.userOrbit = false; }

  zoom(delta) {
    const s = this.settings.zoomSensitivity;
    if (this.mode === 'cockpit') {
      this.settings.fov = clamp(this.settings.fov - delta * 0.02 * s, 22, 100);
    } else {
      this.orbitDist = clamp(this.orbitDist * (1 + delta * 0.0012 * s), 12, 4000);
      this.settings.chaseDistance = clamp(this.settings.chaseDistance * (1 + delta * 0.0012 * s), 0.25, 14);
    }
    this.save();
  }

  // -------------------------------------------------------------------------
  update(dt, fm, weather, prop) {
    this._t += dt;
    const st = this.settings;
    const q = fm.quaternion;
    const speed = fm.tas;

    // aircraft-frame basis
    const fwd = this._tmp.set(0, 0, -1).applyQuaternion(q).clone();
    const upA = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const rightA = new THREE.Vector3(1, 0, 0).applyQuaternion(q);

    // acceleration lag: the camera falls behind when the jet accelerates
    const accel = this._tmp2.copy(fm.velocity).sub(this._prevAircraftVel).divideScalar(Math.max(dt, 1e-4));
    this._prevAircraftVel.copy(fm.velocity);
    this._accelLag.lerp(accel, clamp(dt * 2.2, 0, 1));

    let target = new THREE.Vector3();
    let lookAt = new THREE.Vector3();
    let desiredUp = new THREE.Vector3(0, 1, 0);
    let stiff = 6.0 * st.stiffness;
    let lookStiff = 8.0 * st.stiffness;
    let fov = st.fov;
    let hard = false;             // snap instead of spring

    switch (this.mode) {
      case 'cockpit': {
        target.copy(fm.position).addScaledVector(rightA, 0)
          .addScaledVector(upA, 0.86).addScaledVector(fwd, 4.95);
        hard = true;
        fov = st.fov;
        break;
      }
      case 'nose': {
        target.copy(fm.position).addScaledVector(fwd, 8.6).addScaledVector(upA, 0.10);
        hard = true;
        break;
      }
      case 'tail': {
        target.copy(fm.position).addScaledVector(fwd, -8.4).addScaledVector(upA, 1.65);
        hard = true;
        break;
      }
      case 'wing': {
        target.copy(fm.position).addScaledVector(rightA, 6.2)
          .addScaledVector(upA, 0.55).addScaledVector(fwd, 1.4);
        hard = true;
        break;
      }
      case 'chase': case 'chaseClose': case 'chaseFar': {
        const base = this.mode === 'chaseClose' ? 24 : this.mode === 'chaseFar' ? 110 : 38;
        const dist = base * st.chaseDistance;
        // blend between an aircraft-fixed and a velocity-aligned offset so
        // that loops and rolls stay readable
        const vdir = fm.velocity.lengthSq() > 25
          ? this._tmp2.copy(fm.velocity).normalize() : fwd;
        const blend = clamp(speed / 120, 0, 1) * 0.55;
        const back = new THREE.Vector3()
          .addScaledVector(fwd, -(1 - blend)).addScaledVector(vdir, -blend).normalize();

        const yaw = this.userOrbit ? this.orbitYaw : 0;
        const pitch = this.userOrbit ? this.orbitPitch : 9 * D;
        const off = back.clone().multiplyScalar(dist);
        // orbit the offset around the aircraft's up axis
        off.applyAxisAngle(upA, yaw);
        const axis = new THREE.Vector3().crossVectors(off, upA).normalize();
        off.applyAxisAngle(axis, -pitch);
        // acceleration pushes the camera back a little, the way a real rig lags
        const lagVec = this._accelLag.clone().multiplyScalar(-0.055 * st.lag);
        lagVec.clampLength(0, dist * 0.4);

        target.copy(fm.position).add(off).add(lagVec)
          .addScaledVector(upA, dist * 0.13);
        lookAt.copy(fm.position).addScaledVector(fwd, dist * 0.16);
        // roll with the aircraft, but only partly, so the horizon stays legible
        desiredUp.copy(upA).lerp(new THREE.Vector3(0, 1, 0), 0.45).normalize();
        stiff = (this.mode === 'chaseClose' ? 7.5 : 4.2) * st.stiffness;
        lookStiff = 6.5 * st.stiffness;
        fov = st.fov + clamp((fm.mach - 0.6) * 9, 0, 12);
        break;
      }
      case 'orbit': {
        const dist = this.orbitDist;
        const off = new THREE.Vector3(
          Math.sin(this.orbitYaw) * Math.cos(this.orbitPitch),
          Math.sin(this.orbitPitch),
          Math.cos(this.orbitYaw) * Math.cos(this.orbitPitch)).multiplyScalar(dist);
        target.copy(fm.position).add(off);
        lookAt.copy(fm.position);
        stiff = 9 * st.stiffness; lookStiff = 12 * st.stiffness;
        break;
      }
      case 'flyby': {
        this.flybyT += dt;
        const rel = this.flybyPos ? this._tmp2.copy(fm.position).sub(this.flybyPos) : null;
        const passed = rel && rel.dot(fm.velocity) > 0 && rel.length() > 700;
        if (!this.flybyPos || passed || this.flybyT > 14) {
          this.flybyT = 0;
          const lead = clamp(speed * 6.5, 700, 9000);
          const side = (Math.random() > 0.5 ? 1 : -1) * clamp(speed * 0.9, 120, 900);
          const vdir = fm.velocity.lengthSq() > 25
            ? fm.velocity.clone().normalize() : fwd.clone();
          const rightW = new THREE.Vector3(vdir.z, 0, -vdir.x).normalize();
          const p = fm.position.clone().addScaledVector(vdir, lead).addScaledVector(rightW, side);
          const g = heightAt(p.x, p.z);
          p.y = fm.altAGL < 900 ? g + 12 + Math.random() * 40
            : fm.position.y + (Math.random() - 0.5) * 260;
          p.y = Math.max(p.y, g + 8);
          this.flybyPos = p;
        }
        target.copy(this.flybyPos);
        lookAt.copy(fm.position);
        stiff = 30; lookStiff = 5.0;
        fov = clamp(st.fov - 22 + clamp(fm.position.distanceTo(this.flybyPos) / 120, 0, 30), 24, 80);
        break;
      }
      case 'cinematic': {
        this.cinemaT += dt;
        if (this.cinemaT > 9) { this.cinemaT = 0; this.cinemaShot = (this.cinemaShot + 1) % 6; }
        const g = heightAt(fm.position.x, fm.position.z);
        switch (this.cinemaShot) {
          case 0:   // rear-quarter afterburner
            target.copy(fm.position).addScaledVector(fwd, -34).addScaledVector(rightA, 14).addScaledVector(upA, 5);
            break;
          case 1:   // side profile tracking
            target.copy(fm.position).addScaledVector(rightA, 62).addScaledVector(upA, 3);
            break;
          case 2:   // low-angle from the ground
            target.set(fm.position.x + 220, g + 6, fm.position.z + 220);
            break;
          case 3:   // high orbital
            target.copy(fm.position).addScaledVector(upA, 180).addScaledVector(fwd, -120);
            break;
          case 4:   // nose-on approach
            target.copy(fm.position).addScaledVector(fwd, 210).addScaledVector(upA, 18);
            break;
          default:  // cloud-top chase
            target.copy(fm.position).addScaledVector(fwd, -85).addScaledVector(upA, 22);
        }
        lookAt.copy(fm.position);
        desiredUp.set(0, 1, 0);
        stiff = 2.6; lookStiff = 4.5;
        fov = st.fov - 10;
        break;
      }
      case 'ground': {
        if (!this.groundPos) this.placeGround(fm);
        target.copy(this.groundPos);
        lookAt.copy(fm.position);
        stiff = 40; lookStiff = 3.2;
        // zoom in on a distant jet, the way a spotter's long lens would
        const d = target.distanceTo(fm.position);
        fov = clamp(52 - Math.log10(Math.max(d, 60)) * 11, 8, 55);
        break;
      }
    }

    // --- spring integration in world space ---
    if (!this._initialised) { this.pos.copy(target); this.look.copy(lookAt); this._initialised = true; }
    if (hard) {
      this.pos.copy(target);
    } else {
      const k = clamp(stiff * dt, 0, 1);
      this.pos.lerp(target, k);
    }

    // --- orientation ---
    if (this.mode === 'cockpit' || this.mode === 'nose' || this.mode === 'wing' || this.mode === 'tail') {
      this.quat.copy(q);
      if (this.mode === 'cockpit') {
        this.quat.multiply(new THREE.Quaternion().setFromEuler(
          new THREE.Euler(this.headPitch, this.headYaw, 0, 'YXZ')));
      } else if (this.mode === 'tail') {
        this.quat.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-6 * D, 0, 0)));
      } else if (this.mode === 'wing') {
        this.quat.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -55 * D, 0, 'YXZ')));
      }
    } else {
      const lk = clamp(lookStiff * dt, 0, 1);
      this.look.lerp(lookAt, lk);
      this._m.lookAt(this.pos, this.look, desiredUp);
      const targetQ = new THREE.Quaternion().setFromRotationMatrix(this._m);
      this.quat.slerp(targetQ, clamp(lookStiff * dt, 0, 1));
    }

    // --- collision: never let a chase camera end up underground ---
    if (this.mode !== 'cockpit' && this.mode !== 'ground') {
      const g = heightAt(this.pos.x, this.pos.z);
      if (this.pos.y < g + 3) this.pos.y = g + 3;
    }

    // --- shake ---
    this._shakeT += dt;
    const cockpit = this.isCockpit;
    let amp = 0;
    amp += clamp((Math.abs(fm.gLoad) - 2.5) / 7, 0, 1) * (cockpit ? 0.10 : 0.05);
    amp += fm.stalled ? (cockpit ? 0.16 : 0.06) : 0;
    amp += clamp((fm.mach - 0.92) * 5, 0, 1) * clamp((1.25 - fm.mach) * 4, 0, 1) * (cockpit ? 0.10 : 0.05);
    amp += clamp(fm.mach - 1.2, 0, 1.2) * (cockpit ? 0.035 : 0.028);
    amp += (weather ? weather.turbulence : 0) * (cockpit ? 0.11 : 0.05);
    amp += fm.onGround ? clamp(Math.hypot(fm.velocity.x, fm.velocity.z) / 90, 0, 1) * (cockpit ? 0.09 : 0.03) : 0;
    amp += prop ? prop.afterburner * (cockpit ? 0.03 : 0.02) : 0;
    amp *= st.shake;
    this.shakeAmp += (amp - this.shakeAmp) * clamp(dt * 6, 0, 1);

    // --- publish to the render camera ---
    toRender(this.pos, this.camera.position);
    this.camera.quaternion.copy(this.quat);
    if (this.shakeAmp > 0.0005) {
      const t = this._shakeT;
      const sx = Math.sin(t * 47.3) * Math.sin(t * 13.1);
      const sy = Math.sin(t * 61.7 + 1.3) * Math.sin(t * 9.7);
      const sz = Math.sin(t * 39.1 + 2.7);
      this.camera.rotateX(sy * this.shakeAmp * 0.012);
      this.camera.rotateY(sx * this.shakeAmp * 0.012);
      this.camera.rotateZ(sz * this.shakeAmp * 0.006);
      this.camera.position.x += sx * this.shakeAmp * 0.05;
      this.camera.position.y += sy * this.shakeAmp * 0.05;
    }

    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov += (fov - this.camera.fov) * clamp(dt * 5, 0, 1);
      this.camera.updateProjectionMatrix();
    }

    // world position of the camera, for audio and terrain streaming
    this.worldPosition = this.pos;
    this.rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(this.quat);
  }
}
