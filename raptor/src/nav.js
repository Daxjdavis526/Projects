// Navigation: the world map, waypoints, route estimates, and an autopilot that
// flies through the same control inputs a human uses.

import * as THREE from 'three';
import { AIRPORTS, CITIES, worldToGeo, geoToWorld } from './world.js';
import { heightAt } from './terrain.js';

const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const D = Math.PI / 180;
const NM = 1852;

export class Nav {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.open = false;
    this.waypoint = null;
    this.route = [];
    this.mfdRange = 40;
    this.zoom = 1;              // metres per pixel = 400 / zoom
    this.center = new THREE.Vector2(0, 0);
    this.follow = true;
    this.autopilot = { on: false, altitude: 8000, heading: 0, mode: 'off' };
    this._relief = null;
    this._reliefKey = '';
    this._dpr = 1;
  }

  resize(w, h, dpr) {
    this._dpr = dpr;
    this.canvas.width = w * dpr; this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.w = w; this.h = h;
    this._reliefKey = '';
  }

  get mppx() { return 400 / this.zoom; }

  toggle() { this.open = !this.open; }

  zoomBy(f, fm) {
    this.zoom = clamp(this.zoom * f, 0.006, 90);
    this._reliefKey = '';
  }

  screenToWorld(sx, sy) {
    return {
      x: this.center.x + (sx - this.w / 2) * this.mppx,
      z: this.center.y + (sy - this.h / 2) * this.mppx,
    };
  }
  worldToScreen(x, z) {
    return {
      x: this.w / 2 + (x - this.center.x) / this.mppx,
      y: this.h / 2 + (z - this.center.y) / this.mppx,
    };
  }

  setWaypoint(x, z, name, altitude) {
    const ground = heightAt(x, z);
    this.waypoint = {
      x, z, name: name || 'WPT',
      y: altitude !== undefined ? altitude : Math.max(ground + 3000, 3000),
    };
  }
  setWaypointAirport(a) {
    this.setWaypoint(a.x, a.z, a.icao, a.elev + 600);
  }
  clearWaypoint() { this.waypoint = null; }

  distanceTo(fm) {
    if (!this.waypoint) return null;
    return Math.hypot(this.waypoint.x - fm.position.x, this.waypoint.z - fm.position.z);
  }

  bearingTo(fm) {
    if (!this.waypoint) return null;
    const dx = this.waypoint.x - fm.position.x, dz = this.waypoint.z - fm.position.z;
    return ((Math.atan2(dx, -dz) / D) + 360) % 360;
  }

  // -------------------------------------------------------------------------
  /** Autopilot: writes into the same pilot input struct the stick uses. */
  updateAutopilot(dt, fm, prop) {
    const ap = this.autopilot;
    if (!ap.on) return false;

    let targetHdg = ap.heading;
    if (ap.mode === 'waypoint' && this.waypoint) {
      targetHdg = this.bearingTo(fm);
      const d = this.distanceTo(fm);
      if (d < 2500) { ap.mode = 'heading'; ap.heading = targetHdg; }
      ap.altitude = this.waypoint.y;
    }

    // --- bank to turn, limited and rate-damped ---
    let err = targetHdg - fm.heading;
    while (err > 180) err -= 360;
    while (err < -180) err += 360;
    const bankCmd = clamp(err * 1.6, -55, 55) * D;
    const bankErr = bankCmd - fm.bankAngle;
    fm.input.roll = clamp(bankErr * 1.7, -0.8, 0.8);

    // --- altitude hold through a vertical-speed command ---
    const altErr = ap.altitude - fm.position.y;
    const vsCmd = clamp(altErr * 0.10, -120, 120);
    const vsErr = vsCmd - fm.verticalSpeed;
    // in a bank you need more back-stick just to hold level
    const bankComp = (1 / Math.max(0.35, Math.cos(fm.bankAngle)) - 1) * 0.35;
    fm.input.pitch = clamp(vsErr * 0.045 + bankComp, -0.6, 0.85);
    fm.input.yaw = 0;

    // --- speed hold on the throttle ---
    const targetMach = fm.position.y > 11000 ? 1.5 : 0.85;
    const machErr = targetMach - fm.mach;
    prop.throttle = clamp(prop.throttle + machErr * dt * 2.2, 0.25, fm.position.y > 9000 ? 1.5 : 1.0);
    return true;
  }

  // -------------------------------------------------------------------------
  /** Hypsometric relief, cached per view. Sampling the real height field. */
  _buildRelief() {
    const key = `${Math.round(this.center.x)}|${Math.round(this.center.y)}|${this.zoom.toFixed(4)}|${this.w}x${this.h}`;
    if (this._reliefKey === key) return;
    this._reliefKey = key;
    const RW = Math.min(320, Math.floor(this.w / 3)), RH = Math.min(320, Math.floor(this.h / 3));
    const img = this.ctx.createImageData(RW, RH);
    const mppxX = this.mppx * this.w / RW, mppxY = this.mppx * this.h / RH;
    for (let j = 0; j < RH; j++) {
      for (let i = 0; i < RW; i++) {
        const wx = this.center.x + (i - RW / 2) * mppxX;
        const wz = this.center.y + (j - RH / 2) * mppxY;
        const h = heightAt(wx, wz);
        // hill shading from a north-west sun
        const hx = heightAt(wx + mppxX, wz) - h;
        const hz = heightAt(wx, wz + mppxY) - h;
        const shade = clamp(0.55 + (-hx - hz) / (mppxX * 0.06 + 1) * 0.9, 0.25, 1.45);
        let r, g, b;
        if (h < 0) { r = 10; g = 26 + clamp(h / -900, 0, 1) * -14 + 14; b = 52 + clamp(1 + h / 900, 0, 1) * 30; }
        else if (h < 400) { r = 88; g = 104; b = 74; }
        else if (h < 1200) { r = 128; g = 120; b = 78; }
        else if (h < 2200) { r = 148; g = 122; b = 88; }
        else if (h < 3000) { r = 150; g = 138; b = 128; }
        else { r = 226; g = 230; b = 238; }
        const k = (j * RW + i) * 4;
        img.data[k] = clamp(r * shade, 0, 255);
        img.data[k + 1] = clamp(g * shade, 0, 255);
        img.data[k + 2] = clamp(b * shade, 0, 255);
        img.data[k + 3] = 255;
      }
    }
    const off = document.createElement('canvas');
    off.width = RW; off.height = RH;
    off.getContext('2d').putImageData(img, 0, 0);
    this._relief = off;
  }

  draw(fm, weather, timeOfDay) {
    if (!this.open) return;
    const c = this.ctx;
    c.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    c.clearRect(0, 0, this.w, this.h);

    if (this.follow) this.center.set(fm.position.x, fm.position.z);
    this._buildRelief();

    c.fillStyle = '#04070c';
    c.fillRect(0, 0, this.w, this.h);
    if (this._relief) {
      c.imageSmoothingEnabled = true;
      c.globalAlpha = 0.95;
      c.drawImage(this._relief, 0, 0, this.w, this.h);
      c.globalAlpha = 1;
    }

    // --- scale-dependent overlays ---
    const px = this.mppx;
    c.font = '500 12px "JetBrains Mono", ui-monospace, monospace';
    c.textBaseline = 'middle';

    for (const ct of CITIES) {
      const s = this.worldToScreen(ct.x, ct.z);
      if (s.x < -80 || s.x > this.w + 80 || s.y < -40 || s.y > this.h + 40) continue;
      const r = Math.max(2.5, ct.radius / px);
      c.fillStyle = 'rgba(255,220,150,0.20)';
      c.beginPath(); c.arc(s.x, s.y, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,230,190,0.9)';
      c.beginPath(); c.arc(s.x, s.y, 2.5, 0, Math.PI * 2); c.fill();
      if (px < 900) {
        c.fillStyle = 'rgba(255,240,215,0.85)';
        c.textAlign = 'left';
        c.fillText(ct.name, s.x + 7, s.y);
      }
    }

    for (const a of AIRPORTS) {
      const s = this.worldToScreen(a.x, a.z);
      if (s.x < -40 || s.x > this.w + 40 || s.y < -30 || s.y > this.h + 30) continue;
      c.strokeStyle = a.mil ? '#ffcc55' : '#66ddff';
      c.lineWidth = 1.6;
      c.beginPath(); c.arc(s.x, s.y, 5, 0, Math.PI * 2); c.stroke();
      // runway tick
      const dx = Math.sin(a.hdgRad) * 9, dz = -Math.cos(a.hdgRad) * 9;
      c.beginPath(); c.moveTo(s.x - dx, s.y - dz); c.lineTo(s.x + dx, s.y + dz); c.stroke();
      if (px < 2600) {
        c.fillStyle = a.mil ? '#ffcc55' : '#66ddff';
        c.textAlign = 'left';
        c.fillText(a.icao, s.x + 9, s.y - 9);
      }
    }

    // --- route ---
    const ac = this.worldToScreen(fm.position.x, fm.position.z);
    if (this.waypoint) {
      const wp = this.worldToScreen(this.waypoint.x, this.waypoint.z);
      c.strokeStyle = '#66ddff'; c.lineWidth = 1.8; c.setLineDash([8, 6]);
      c.beginPath(); c.moveTo(ac.x, ac.y); c.lineTo(wp.x, wp.y); c.stroke();
      c.setLineDash([]);
      c.strokeStyle = '#66ddff';
      c.beginPath(); c.arc(wp.x, wp.y, 8, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(wp.x - 12, wp.y); c.lineTo(wp.x + 12, wp.y);
      c.moveTo(wp.x, wp.y - 12); c.lineTo(wp.x, wp.y + 12); c.stroke();
    }

    // --- aircraft symbol + ground track ---
    c.save();
    c.translate(ac.x, ac.y);
    c.rotate(fm.heading * D);
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.moveTo(0, -11); c.lineTo(7, 8); c.lineTo(0, 4); c.lineTo(-7, 8);
    c.closePath(); c.fill();
    c.restore();
    // velocity vector over the next 2 minutes
    const lead = 120;
    const tv = this.worldToScreen(fm.position.x + fm.velocity.x * lead, fm.position.z + fm.velocity.z * lead);
    c.strokeStyle = 'rgba(255,255,255,0.45)';
    c.beginPath(); c.moveTo(ac.x, ac.y); c.lineTo(tv.x, tv.y); c.stroke();

    // --- scale bar ---
    const barNM = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000]
      .find(v => v * NM / px > 60) || 1000;
    const barPx = barNM * NM / px;
    c.strokeStyle = '#dfe6f2'; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(24, this.h - 34); c.lineTo(24 + barPx, this.h - 34);
    c.moveTo(24, this.h - 40); c.lineTo(24, this.h - 28);
    c.moveTo(24 + barPx, this.h - 40); c.lineTo(24 + barPx, this.h - 28);
    c.stroke();
    c.fillStyle = '#dfe6f2'; c.textAlign = 'left';
    c.fillText(`${barNM} NM`, 24, this.h - 50);

    // --- readout ---
    const geo = worldToGeo(fm.position.x, fm.position.z);
    const lines = [
      `POS  ${geo.lat.toFixed(4)}  ${geo.lon.toFixed(4)}`,
      `ALT  ${(fm.position.y * 3.28084).toFixed(0)} ft    HDG ${fm.heading.toFixed(0).padStart(3, '0')}`,
      `GS   ${(Math.hypot(fm.velocity.x, fm.velocity.z) * 1.94384).toFixed(0)} kt   M ${fm.mach.toFixed(2)}`,
    ];
    if (this.waypoint) {
      const d = this.distanceTo(fm) / NM;
      const gs = Math.hypot(fm.velocity.x, fm.velocity.z);
      const eta = gs > 5 ? (this.distanceTo(fm) / gs) : Infinity;
      lines.push(`WPT  ${this.waypoint.name}  ${d.toFixed(1)} NM  ${this.bearingTo(fm).toFixed(0).padStart(3, '0')}°`);
      lines.push(`ETE  ${isFinite(eta) ? `${Math.floor(eta / 60)}m ${Math.floor(eta % 60)}s` : '--'}`);
    }
    c.fillStyle = 'rgba(4,8,14,0.72)';
    c.fillRect(16, 16, 330, 22 * lines.length + 14);
    c.fillStyle = '#cfe0f5';
    lines.forEach((l, i) => c.fillText(l, 28, 34 + i * 22));
  }
}
