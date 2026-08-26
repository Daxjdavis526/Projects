// Head-up display. In the cockpit it is drawn conformally — the flight path
// marker sits where the aircraft is actually going, and the pitch ladder is
// projected through the same camera as the world. In third person the same
// data is available as a minimal, toggleable overlay.

import * as THREE from 'three';
import { worldToGeo } from './world.js';

const D = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const MS_TO_KT = 1.94384;
const M_TO_FT = 3.28084;

export class HUD {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = 'full';          // 'full' | 'minimal' | 'off'
    this.color = '#4dff9a';
    this.dpr = 1;
    this._v = new THREE.Vector3();
    this._p = new THREE.Vector3();
    this.gEffect = 0;            // 0 = fine, 1 = greyed out, -1 = redout
  }

  resize(w, h, dpr) {
    this.dpr = dpr;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.w = w; this.h = h;
  }

  /** Project a world-space direction from the camera into screen pixels. */
  _project(dirWorld, camera) {
    this._p.copy(camera.position).add(dirWorld);
    this._p.project(camera);
    if (this._p.z > 1) return null;
    return { x: (this._p.x * 0.5 + 0.5) * this.w, y: (-this._p.y * 0.5 + 0.5) * this.h };
  }

  draw(state) {
    const { fm, prop, camera, nav, cockpit, weather } = state;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    if (this.mode === 'off') { this._drawGEffect(ctx, state); return; }

    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1.4;
    ctx.font = '500 13px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = cockpit ? 0.95 : 0.82;

    const cx = this.w / 2, cy = this.h / 2;
    const kias = fm.tas * MS_TO_KT * Math.sqrt(Math.max(0.02, 1.225 / 1.225));
    const alt = fm.position.y * M_TO_FT;

    if (this.mode === 'full') {
      this._pitchLadder(ctx, fm, camera, cx, cy);
      this._flightPath(ctx, fm, camera);
      this._tape(ctx, 92, cy, fm.tas * MS_TO_KT, 'KIAS', 'left', 20, 5);
      this._tape(ctx, this.w - 92, cy, alt, 'FT', 'right', 500, 100);
      this._heading(ctx, cx, 46, fm.heading);
      this._boresight(ctx, cx, cy);
    }
    this._readouts(ctx, state, kias, alt);
    if (nav && nav.waypoint) this._waypoint(ctx, state);
    ctx.restore();

    this._drawGEffect(ctx, state);
  }

  _boresight(ctx, cx, cy) {
    ctx.globalAlpha *= 0.7;
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy); ctx.lineTo(cx - 12, cy);
    ctx.moveTo(cx + 12, cy); ctx.lineTo(cx + 26, cy);
    ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy - 2);
    ctx.stroke();
    ctx.globalAlpha /= 0.7;
  }

  _pitchLadder(ctx, fm, camera, cx, cy) {
    const pitch = fm.pitchAngle;
    const bank = fm.bankAngle;
    const hdg = fm.heading * D;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(bank);

    // pixels per degree from the vertical FOV
    const ppd = this.h / camera.fov;

    for (let p = -90; p <= 90; p += 5) {
      const dy = (pitch / D - p) * ppd;
      if (Math.abs(dy) > this.h * 0.52) continue;
      const major = p % 10 === 0;
      const wHalf = major ? 92 : 52;
      ctx.globalAlpha *= p === 0 ? 1 : 0.8;
      ctx.beginPath();
      if (p === 0) {
        ctx.moveTo(-this.w * 0.42, dy); ctx.lineTo(-46, dy);
        ctx.moveTo(46, dy); ctx.lineTo(this.w * 0.42, dy);
      } else if (p > 0) {
        ctx.moveTo(-wHalf, dy); ctx.lineTo(-wHalf + 20, dy);
        ctx.moveTo(wHalf - 20, dy); ctx.lineTo(wHalf, dy);
        ctx.moveTo(-wHalf, dy); ctx.lineTo(-wHalf, dy + 8);
        ctx.moveTo(wHalf, dy); ctx.lineTo(wHalf, dy + 8);
      } else {
        ctx.setLineDash([7, 6]);
        ctx.moveTo(-wHalf, dy); ctx.lineTo(-wHalf + 22, dy);
        ctx.moveTo(wHalf - 22, dy); ctx.lineTo(wHalf, dy);
        ctx.setLineDash([]);
        ctx.moveTo(-wHalf, dy); ctx.lineTo(-wHalf, dy - 8);
        ctx.moveTo(wHalf, dy); ctx.lineTo(wHalf, dy - 8);
      }
      ctx.stroke();
      if (major && p !== 0) {
        ctx.save();
        ctx.textAlign = 'right';
        ctx.fillText(String(Math.abs(p)), -wHalf - 6, dy);
        ctx.textAlign = 'left';
        ctx.fillText(String(Math.abs(p)), wHalf + 6, dy);
        ctx.restore();
      }
      ctx.globalAlpha /= p === 0 ? 1 : 0.8;
    }
    ctx.restore();

    // bank scale
    ctx.save();
    ctx.translate(cx, cy);
    const R = Math.min(this.w, this.h) * 0.30;
    ctx.globalAlpha *= 0.75;
    for (const a of [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60]) {
      const th = (a - 90) * D;
      const l = a % 30 === 0 ? 12 : 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(th) * R, Math.sin(th) * R);
      ctx.lineTo(Math.cos(th) * (R + l), Math.sin(th) * (R + l));
      ctx.stroke();
    }
    ctx.globalAlpha /= 0.75;
    // bank pointer
    ctx.rotate(bank);
    ctx.beginPath();
    ctx.moveTo(0, -R); ctx.lineTo(-7, -R + 12); ctx.lineTo(7, -R + 12); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** The flight path marker: where the velocity vector actually points. */
  _flightPath(ctx, fm, camera) {
    if (fm.tas < 12) return;
    this._v.copy(fm.velocity).normalize().multiplyScalar(100);
    const s = this._project(this._v, camera);
    if (!s) return;
    const x = clamp(s.x, 30, this.w - 30), y = clamp(s.y, 30, this.h - 30);
    ctx.save();
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.moveTo(x - 9, y); ctx.lineTo(x - 22, y);
    ctx.moveTo(x + 9, y); ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 9); ctx.lineTo(x, y - 18);
    ctx.stroke();
    // AoA bracket on the FPM when it matters
    if (fm.alpha > 10 * D) {
      ctx.globalAlpha *= fm.stalled ? 1 : 0.7;
      ctx.strokeStyle = fm.stalled ? '#ff4d4d' : this.color;
      ctx.beginPath();
      ctx.arc(x, y, 15, Math.PI * 0.75, Math.PI * 1.25);
      ctx.stroke();
      ctx.strokeStyle = this.color;
      ctx.globalAlpha /= fm.stalled ? 1 : 0.7;
    }
    ctx.restore();
  }

  _tape(ctx, x, cy, value, label, side, major, minor) {
    const h = this.h * 0.34;
    const pxPer = h / (major * 5);
    ctx.save();
    ctx.globalAlpha *= 0.9;
    ctx.beginPath();
    ctx.moveTo(x, cy - h / 2); ctx.lineTo(x, cy + h / 2);
    ctx.stroke();
    const dir = side === 'left' ? 1 : -1;
    const start = Math.floor((value - major * 2.5) / minor) * minor;
    for (let v = start; v < value + major * 2.5; v += minor) {
      const y = cy + (value - v) * pxPer;
      if (y < cy - h / 2 || y > cy + h / 2) continue;
      const isMajor = Math.abs(v % major) < 1e-6;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + dir * (isMajor ? 11 : 6), y);
      ctx.stroke();
      if (isMajor) {
        ctx.textAlign = side === 'left' ? 'left' : 'right';
        ctx.globalAlpha *= 0.85;
        ctx.fillText(String(Math.round(v)), x + dir * 15, y);
        ctx.globalAlpha /= 0.85;
      }
    }
    // current-value box
    ctx.globalAlpha = 1;
    ctx.beginPath();
    const bw = 62, bh = 22;
    const bx = side === 'left' ? x - bw - 4 : x + 4;
    ctx.rect(bx, cy - bh / 2, bw, bh);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = '600 15px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(String(Math.round(value)), bx + bw / 2, cy);
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(label, bx + bw / 2, cy + bh / 2 + 11);
    ctx.font = '500 13px "JetBrains Mono", ui-monospace, monospace';
    ctx.restore();
  }

  _heading(ctx, cx, y, hdg) {
    const w = Math.min(this.w * 0.42, 430);
    const pxPerDeg = w / 60;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - w / 2, y - 16, w, 32);
    ctx.clip();
    for (let d = -35; d <= 35; d += 5) {
      const v = Math.round(hdg / 5) * 5 + d;
      const x = cx + (v - hdg) * pxPerDeg;
      const major = ((v % 10) + 10) % 10 === 0;
      ctx.beginPath();
      ctx.moveTo(x, y + 8); ctx.lineTo(x, y + (major ? -2 : 3));
      ctx.stroke();
      if (major) {
        ctx.textAlign = 'center';
        ctx.globalAlpha *= 0.85;
        ctx.fillText(String(((v % 360) + 360) % 360 / 10 | 0).padStart(2, '0'), x, y - 9);
        ctx.globalAlpha /= 0.85;
      }
    }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(cx, y + 12); ctx.lineTo(cx - 6, y + 20); ctx.lineTo(cx + 6, y + 20);
    ctx.closePath(); ctx.fill();
  }

  _readouts(ctx, state, kias, alt) {
    const { fm, prop, weather } = state;
    const left = 26, right = this.w - 26;
    const bottom = this.h - 26;
    ctx.save();
    ctx.font = '500 13px "JetBrains Mono", ui-monospace, monospace';

    const rows = [
      ['M', fm.mach.toFixed(2)],
      ['G', fm.gLoad.toFixed(1)],
      ['AOA', (fm.alpha / D).toFixed(1) + '°'],
      ['VS', (fm.verticalSpeed * M_TO_FT * 60).toFixed(0)],
    ];
    ctx.textAlign = 'left';
    rows.forEach((r, i) => {
      const y = bottom - (rows.length - 1 - i) * 19;
      ctx.globalAlpha *= 0.7; ctx.fillText(r[0], left, y); ctx.globalAlpha /= 0.7;
      ctx.fillText(r[1], left + 42, y);
    });

    const fuelPct = fm.fuel / 8200 * 100;
    const thr = prop.throttle;
    const rows2 = [
      ['THR', (thr > 1 ? 'AB ' + Math.round((thr - 1) * 200) : Math.round(thr * 100) + '%')],
      ['N1', (prop.n1 * 100).toFixed(0) + '%'],
      ['FUEL', Math.round(fuelPct) + '%'],
      ['GEAR', fm.gearPos > 0.99 ? 'DN' : fm.gearPos < 0.01 ? 'UP' : 'TRAN'],
    ];
    ctx.textAlign = 'right';
    rows2.forEach((r, i) => {
      const y = bottom - (rows2.length - 1 - i) * 19;
      ctx.globalAlpha *= 0.7; ctx.fillText(r[0], right - 78, y); ctx.globalAlpha /= 0.7;
      ctx.fillText(r[1], right, y);
    });

    // warnings
    const warns = [];
    if (fm.stalled) warns.push(['STALL', '#ff4d4d']);
    if (Math.abs(fm.gLoad) > 8.5) warns.push(['G-LIMIT', '#ffcc33']);
    if (fm.mach > 2.1) warns.push(['MACH', '#ffcc33']);
    if (fuelPct < 8) warns.push(['FUEL LOW', '#ffcc33']);
    if (fm.altAGL < 300 && fm.verticalSpeed < -25 && fm.gearPos < 0.5) warns.push(['PULL UP', '#ff4d4d']);
    if (fm.gearPos > 0.5 && fm.tas > 154) warns.push(['GEAR SPD', '#ffcc33']);
    ctx.textAlign = 'center';
    ctx.font = '600 16px "JetBrains Mono", ui-monospace, monospace';
    warns.forEach((wn, i) => {
      ctx.fillStyle = wn[1];
      ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(performance.now() / 220));
      ctx.fillText(wn[0], this.w / 2, this.h * 0.72 + i * 22);
    });
    ctx.restore();
  }

  _waypoint(ctx, state) {
    const { fm, nav, camera } = state;
    const wp = nav.waypoint;
    const dx = wp.x - fm.position.x, dz = wp.z - fm.position.z;
    const dist = Math.hypot(dx, dz);
    const brg = ((Math.atan2(dx, -dz) / D) + 360) % 360;
    const eta = fm.tas > 5 ? dist / fm.tas : Infinity;

    // caret on the heading tape
    ctx.save();
    ctx.fillStyle = '#66ddff'; ctx.strokeStyle = '#66ddff';
    const cx = this.w / 2;
    if (this.mode === 'full') {
      const w = Math.min(this.w * 0.42, 430), pxPerDeg = w / 60;
      let rel = brg - fm.heading;
      while (rel > 180) rel -= 360;
      while (rel < -180) rel += 360;
      const x = clamp(cx + rel * pxPerDeg, cx - w / 2, cx + w / 2);
      ctx.beginPath();
      ctx.moveTo(x, 66); ctx.lineTo(x - 6, 74); ctx.lineTo(x + 6, 74); ctx.closePath();
      ctx.fill();
    }
    // marker in 3D space
    const dir = new THREE.Vector3(dx, wp.y - fm.position.y, dz).normalize().multiplyScalar(100);
    const s = this._project(dir, camera);
    if (s && s.x > 0 && s.x < this.w && s.y > 0 && s.y < this.h) {
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.rect(s.x - 9, s.y - 9, 18, 18);
      ctx.moveTo(s.x - 14, s.y); ctx.lineTo(s.x - 9, s.y);
      ctx.moveTo(s.x + 9, s.y); ctx.lineTo(s.x + 14, s.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.9;
    ctx.textAlign = 'center';
    ctx.font = '500 13px "JetBrains Mono", ui-monospace, monospace';
    const nm = dist / 1852;
    const etaTxt = isFinite(eta) ? `${Math.floor(eta / 60)}:${String(Math.floor(eta % 60)).padStart(2, '0')}` : '--:--';
    ctx.fillText(`${wp.name}  ${nm.toFixed(1)} NM  ${brg.toFixed(0).padStart(3, '0')}°  ${etaTxt}`,
      this.w / 2, this.h - 26);
    ctx.restore();
  }

  /** Grey-out / red-out. Only ever drawn in the cockpit. */
  _drawGEffect(ctx, state) {
    const { fm, cockpit } = state;
    if (!cockpit) { this.gEffect *= 0.9; return; }
    const g = fm.gLoad;
    let target = 0;
    if (g > 5.5) target = clamp((g - 5.5) / 4.0, 0, 1);
    else if (g < -1.5) target = -clamp((-g - 1.5) / 2.2, 0, 1);
    // onset is slow, recovery slower still — blood takes time either way
    const rate = Math.abs(target) > Math.abs(this.gEffect) ? 0.020 : 0.010;
    this.gEffect += (target - this.gEffect) * rate * 3;

    const a = Math.abs(this.gEffect);
    if (a < 0.01) return;
    const cx = this.w / 2, cy = this.h / 2;
    const r = Math.hypot(cx, cy);
    const grad = ctx.createRadialGradient(cx, cy, r * (0.62 - a * 0.60), cx, cy, r);
    if (this.gEffect > 0) {
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.985, a * 1.15)})`);
    } else {
      grad.addColorStop(0, 'rgba(90,0,0,0)');
      grad.addColorStop(1, `rgba(150,10,10,${Math.min(0.9, a)})`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.w, this.h);
  }
}
