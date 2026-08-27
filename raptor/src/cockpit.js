// First-person cockpit.
//
// Laid out like the real thing: a wide-angle HUD combiner on the glareshield,
// up-front controls beneath it, a large primary multifunction display low and
// centred with secondary displays flanking it, a throttle quadrant on the left
// console and — the detail everyone gets wrong — a *side-stick* on the right
// console, not a centre stick. The Raptor is flown with the right hand on the
// console, F-16 style.
//
// Everything on the displays is drawn live from the simulation.

import * as THREE from 'three';
import { AC } from './config.js';
import { worldToGeo, AIRPORTS, CITIES } from './world.js';

const D = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const M_TO_FT = 3.28084;
const MS_TO_KT = 1.94384;

class MFD {
  constructor(w = 512, h = 512) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = w; this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex });
  }
  begin(bg = '#062416') {
    const c = this.ctx;
    c.fillStyle = bg;
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.strokeStyle = '#46e08c'; c.fillStyle = '#8dffc4';
    c.lineWidth = 2.2;
    c.font = '500 20px "JetBrains Mono", ui-monospace, monospace';
    c.textBaseline = 'middle'; c.textAlign = 'left';
  }
  end() { this.tex.needsUpdate = true; }
}

export class Cockpit {
  constructor(scene, aircraft) {
    this.group = new THREE.Group();
    aircraft.group.add(this.group);
    this.group.position.set(0, 0.86, -4.95);   // pilot design eye position

    const mkMat = (color, o = {}) => new THREE.MeshStandardMaterial({
      color, roughness: 0.82, metalness: 0.12, ...o,
    });
    const shell = mkMat(0x24262b);
    const panel = mkMat(0x1d1f24);
    const grey = mkMat(0x3d424a, { metalness: 0.35, roughness: 0.6 });
    const black = mkMat(0x121317, { roughness: 0.95 });
    const seatMat = mkMat(0x2a2d33, { roughness: 0.9 });
    const green = new THREE.MeshBasicMaterial({ color: 0x2b6b45 });

    const add = (geo, mat, parent = this.group) => {
      const m = new THREE.Mesh(geo, mat); parent.add(m); return m;
    };
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

    // ---- tub ----
    add(box(0.98, 0.05, 2.30), shell).position.set(0, -1.12, 0.18);
    for (const s of [-1, 1]) {
      const wall = add(box(0.05, 0.72, 2.30), shell);
      wall.position.set(s * 0.48, -0.72, 0.18);
      // console top: the flat shelf the throttle and stick sit on
      const cons = add(box(0.24, 0.06, 1.45), panel);
      cons.position.set(s * 0.36, -0.50, 0.02);
      // switch blocks along each console
      for (let i = 0; i < 5; i++) {
        const sw = add(box(0.035, 0.022, 0.05), grey);
        sw.position.set(s * 0.36 + (i % 2 ? 0.05 : -0.05), -0.462, -0.42 + i * 0.20);
      }
    }
    add(box(0.94, 1.05, 0.06), shell).position.set(0, -0.52, 1.28);

    // ---- ejection seat ----
    const seat = new THREE.Group();
    seat.position.set(0, -0.66, 0.66);
    seat.add(new THREE.Mesh(box(0.50, 0.10, 0.52), seatMat));                      // pan
    const back = new THREE.Mesh(box(0.50, 0.86, 0.11), seatMat);
    back.position.set(0, 0.46, 0.24); back.rotation.x = -13 * D;
    seat.add(back);
    const head = new THREE.Mesh(box(0.34, 0.24, 0.13), black);
    head.position.set(0, 0.92, 0.31);
    seat.add(head);
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(box(0.05, 1.10, 0.05), grey);
      rail.position.set(s * 0.28, 0.55, 0.34);
      seat.add(rail);
    }
    this.group.add(seat);

    // ---- glareshield and instrument panel ----
    const glare = add(box(1.00, 0.085, 0.30), black);
    glare.position.set(0, -0.30, -1.16);
    glare.rotation.x = -13 * D;

    const ip = new THREE.Group();
    ip.position.set(0, -0.44, -0.90);
    ip.rotation.x = 27 * D;
    this.group.add(ip);
    add(box(1.00, 0.62, 0.06), panel, ip);

    // display bezels and screens
    this.mfds = { left: new MFD(), center: new MFD(640, 640), right: new MFD(), upper: new MFD(384, 256) };
    const mount = (mfd, w, h, x, y) => {
      const bez = add(box(w + 0.045, h + 0.045, 0.028), grey, ip);
      bez.position.set(x, y, 0.040);
      const scr = add(new THREE.PlaneGeometry(w, h), mfd.mat, ip);
      scr.position.set(x, y, 0.056);
      // bezel buttons: five a side, the way a real MFD is framed
      for (let i = 0; i < 5; i++) {
        const t = (i - 2) * (w / 5.4);
        for (const [bx, by] of [[t, y + h / 2 + 0.028], [t, y - h / 2 - 0.028]]) {
          const b = add(box(w / 8, 0.018, 0.012), grey, ip);
          b.position.set(x + bx - x, by, 0.046);
          b.position.x = x + t;
        }
        for (const sx of [-1, 1]) {
          const b = add(box(0.018, h / 8, 0.012), grey, ip);
          b.position.set(x + sx * (w / 2 + 0.028), y + t * (h / w), 0.046);
        }
      }
      return scr;
    };
    // The real jet stacks the primary display low and the secondaries above
    // it. Here the primary sits a little higher than that, because a display
    // mounted at the real height disappears behind the aeroplane's own nose
    // from the design eye position at this field of view.
    mount(this.mfds.center, 0.30, 0.30, 0, -0.02);
    mount(this.mfds.left, 0.19, 0.19, -0.345, 0.105);
    mount(this.mfds.right, 0.19, 0.19, 0.345, 0.105);
    mount(this.mfds.upper, 0.26, 0.115, 0, 0.215);

    // up-front controls: keypad block on the glareshield face
    const ufc = new THREE.Group();
    ufc.position.set(0, -0.235, -1.02);
    ufc.rotation.x = 34 * D;
    this.group.add(ufc);
    add(box(0.44, 0.13, 0.04), panel, ufc);
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 7; i++) {
        const b = add(box(0.036, 0.026, 0.012), grey, ufc);
        b.position.set(-0.18 + i * 0.06, 0.028 - r * 0.048, 0.026);
      }
    }

    // ---- warning and caution lamps, either side of the glareshield ----
    this.lamps = {};
    const lampMat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.08 });
    const lampSpecs = [
      ['master', 0xff3322, -0.40], ['stall', 0xffaa22, -0.32],
      ['fuel', 0xffaa22, -0.24], ['gear', 0x33ff66, 0.24],
      ['ab', 0xff8833, 0.32], ['brake', 0xffcc33, 0.40],
    ];
    for (const [k, c, x] of lampSpecs) {
      const m = add(new THREE.PlaneGeometry(0.062, 0.030), lampMat(c));
      m.position.set(x, -0.268, -1.023);
      m.rotation.x = -13 * D;
      this.lamps[k] = m;
    }

    // ---- HUD combiner ----
    // Unlit on purpose: a physical material this smooth throws a specular
    // lobe from the sun that lands on the aeroplane's nose as a green blob.
    const combiner = add(new THREE.PlaneGeometry(0.40, 0.28),
      new THREE.MeshBasicMaterial({
        color: 0x9fffd8, transparent: true, opacity: 0.030,
        side: THREE.DoubleSide, depthWrite: false,
      }));
    combiner.position.set(0, -0.02, -0.72);
    combiner.rotation.x = -9 * D;
    // The frame sits at the very top of the glass. Anything thicker than this
    // draws a bar straight across the pitch ladder.
    add(box(0.40, 0.008, 0.014), grey).position.set(0, 0.155, -0.72);
    for (const s of [-1, 1]) {
      add(box(0.006, 0.19, 0.006), grey).position.set(s * 0.202, 0.06, -0.72);
    }

    // ---- side-stick, right console ----
    this.stick = new THREE.Group();
    this.stick.position.set(0.36, -0.47, -0.10);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.030, 0.15, 10), black);
    shaft.position.y = 0.075;
    this.stick.add(shaft);
    const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.11, 4, 10), black);
    grip.position.y = 0.21; grip.rotation.x = -8 * D;
    this.stick.add(grip);
    const trigger = new THREE.Mesh(box(0.020, 0.045, 0.020), grey);
    trigger.position.set(0, 0.19, -0.036);
    this.stick.add(trigger);
    this.group.add(this.stick);

    // ---- throttle quadrant, left console ----
    this.throttle = new THREE.Group();
    this.throttle.position.set(-0.36, -0.44, 0.02);
    for (const s of [-1, 1]) {
      const lever = new THREE.Mesh(box(0.045, 0.05, 0.24), black);
      lever.position.set(s * 0.028, 0, -0.10);
      this.throttle.add(lever);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.040, 10, 8), black);
      knob.position.set(s * 0.028, 0.02, -0.21);
      this.throttle.add(knob);
    }
    this.group.add(this.throttle);
    add(box(0.20, 0.05, 0.46), panel).position.set(-0.36, -0.50, 0.02);
    // throttle gate markings
    add(box(0.02, 0.012, 0.40), green).position.set(-0.245, -0.468, 0.02);

    // ---- rudder pedals ----
    this.pedals = [];
    for (const s of [-1, 1]) {
      const pedal = new THREE.Group();
      pedal.position.set(s * 0.17, -0.95, -0.62);
      const plate = new THREE.Mesh(box(0.11, 0.16, 0.03), grey);
      plate.rotation.x = 22 * D;
      pedal.add(plate);
      this.group.add(pedal);
      this.pedals.push({ pivot: pedal, sign: s });
    }

    // ---- canopy sill and rear arch ----
    for (const s of [-1, 1]) {
      const rail = add(box(0.030, 0.034, 2.2), black);
      rail.position.set(s * 0.46, -0.24, 0.28);
    }
    const arch = add(new THREE.TorusGeometry(0.42, 0.020, 8, 16, Math.PI), black);
    arch.position.set(0, -0.24, 1.22);
    arch.rotation.set(0, 0, 0);

    // ---- rain on the canopy ----
    this.rainPlane = add(new THREE.PlaneGeometry(1.5, 1.1),
      new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uAmt: { value: 0 }, uSpeed: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `precision highp float; varying vec2 vUv;
          uniform float uT; uniform float uAmt; uniform float uSpeed;
          float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
          void main(){
            float a = 0.0;
            for (int i = 0; i < 3; i++) {
              float fi = float(i);
              vec2 g = vUv * vec2(15.0 + fi*9.0, 10.0 + fi*6.0);
              vec2 id = floor(g); vec2 f = fract(g);
              float r = h(id + fi * 17.0);
              if (r < 0.55) continue;
              vec2 c = vec2(0.5 + (h(id + 3.0) - 0.5) * 0.6,
                            fract(r * 9.0 + uT * (1.0 + uSpeed * 4.0)));
              float d = length((f - c) * vec2(1.0, 0.35 + uSpeed * 2.2));
              a += smoothstep(0.15, 0.0, d) * 0.55;
            }
            gl_FragColor = vec4(0.78, 0.85, 0.94, clamp(a,0.0,1.0) * uAmt * 0.5);
          }`,
        transparent: true, depthWrite: false, depthTest: false,
      }));
    this.rainPlane.position.set(0, 0.02, -0.78);
    this.rainPlane.renderOrder = 900;

    // ---- lighting: a cockpit lit only by the sun is a black hole ----
    this.fill = new THREE.PointLight(0xbfd2e8, 0.55, 3.2, 1.6);
    this.fill.position.set(0, 0.25, -0.10);
    this.group.add(this.fill);
    // A tight, short-range wash on the panel itself. Anything with reach
    // spills out onto the aeroplane's nose and paints it green.
    this.panelLight = new THREE.PointLight(0x7dffb8, 0.0, 0.75, 2.4);
    this.panelLight.position.set(0, -0.30, -0.70);
    this.group.add(this.panelLight);

    this._mfdTimer = 0;
    this.hotspots = [grip, this.throttle.children[1]];
  }

  setVisible(v) { this.group.visible = v; }

  update(dt, fm, prop, weather, nav, sky) {
    // side-stick: a real one barely moves, so the deflection is small
    this.stick.rotation.x = fm.input.pitch * -7 * D;
    this.stick.rotation.z = fm.input.roll * -7 * D;
    this.throttle.position.z = 0.02 + clamp(prop.throttle, 0, 1.5) * 0.13;
    for (const p of this.pedals) {
      p.pivot.position.z = -0.62 + p.sign * fm.input.yaw * 0.05;
    }

    const set = (k, on, glow = 1) => {
      this.lamps[k].material.opacity = on ? 0.10 + 0.85 * glow : 0.07;
    };
    set('stall', fm.stalled);
    set('fuel', fm.fuel / AC.fuelCapacity < 0.08);
    set('gear', fm.gearPos > 0.99);
    set('ab', prop.afterburner > 0.05, prop.afterburner);
    set('brake', fm.brakes > 0.05);
    set('master', fm.stalled || Math.abs(fm.gLoad) > 8.5 || fm.fuel <= 0);

    const night = sky ? sky.isNight : false;
    const sunUp = sky ? Math.max(0, sky.sunDir.y) : 0.5;
    this.fill.intensity = 0.25 + 0.75 * Math.pow(sunUp, 0.4);
    this.panelLight.intensity = night ? 0.22 : 0.07;

    this.rainPlane.material.uniforms.uT.value += dt;
    this.rainPlane.material.uniforms.uAmt.value =
      (weather ? Math.max(weather.rain, weather.snow) : 0) * (fm.position.y < 7000 ? 1 : 0);
    this.rainPlane.material.uniforms.uSpeed.value = clamp(fm.tas / 260, 0, 1);

    this._mfdTimer -= dt;
    if (this._mfdTimer <= 0) {
      this._mfdTimer = 0.1;
      this._drawEngine(fm, prop);
      this._drawNav(fm, nav);
      this._drawSystems(fm, prop, weather);
      this._drawUpper(fm, prop);
    }
  }

  _drawUpper(fm, prop) {
    const m = this.mfds.upper, c = m.ctx;
    m.begin('#050f18');
    c.strokeStyle = '#6fc8ff'; c.fillStyle = '#9fdcff';
    c.font = '600 26px "JetBrains Mono", ui-monospace, monospace';
    c.fillText('UFC', 14, 24);
    c.font = '500 30px "JetBrains Mono", ui-monospace, monospace';
    c.fillText(`${(fm.tas * MS_TO_KT).toFixed(0)} KT`, 14, 76);
    c.fillText(`M ${fm.mach.toFixed(2)}`, 14, 118);
    c.fillText(`${(fm.position.y * M_TO_FT).toFixed(0)} FT`, 14, 160);
    c.fillText(`HDG ${fm.heading.toFixed(0).padStart(3, '0')}`, 14, 202);
    c.strokeRect(8, 8, m.canvas.width - 16, m.canvas.height - 16);
    m.end();
  }

  _drawEngine(fm, prop) {
    const m = this.mfds.left, c = m.ctx;
    m.begin();
    c.fillText('ENGINES', 16, 24);
    const e = prop.engines;
    for (let i = 0; i < 2; i++) {
      const x = 40 + i * 230;
      c.strokeStyle = '#46e08c';
      c.strokeRect(x, 60, 190, 250);
      c.fillStyle = '#a8ffd4';
      c.fillText(`ENG ${i + 1}`, x + 12, 82);
      const rows = [
        ['N1', (e[i].n1 * 100).toFixed(1)],
        ['EGT', (e[i].egt - 273).toFixed(0) + 'C'],
        ['THR', (e[i].thrust / 1000).toFixed(0) + 'kN'],
        ['AB', (e[i].ab * 100).toFixed(0) + '%'],
        ['FF', (e[i].fuelFlow * 3600).toFixed(0)],
      ];
      rows.forEach((r, j) => {
        c.fillStyle = '#46e08c'; c.fillText(r[0], x + 12, 118 + j * 34);
        c.fillStyle = '#a8ffd4'; c.fillText(r[1], x + 90, 118 + j * 34);
      });
      c.fillStyle = e[i].ab > 0.02 ? '#ffa040' : '#5fffa8';
      c.fillRect(x + 12, 292, 166 * e[i].n1, 10);
      c.strokeRect(x + 12, 292, 166, 10);
    }
    c.fillStyle = '#46e08c'; c.fillText('FUEL', 40, 350);
    c.fillStyle = '#a8ffd4';
    c.fillText(`${(fm.fuel / 1000).toFixed(2)} t   ${(fm.fuel / AC.fuelCapacity * 100).toFixed(0)}%`, 130, 350);
    const endurance = prop.fuelFlow > 0.01 ? fm.fuel / prop.fuelFlow : Infinity;
    c.fillStyle = '#46e08c'; c.fillText('ENDUR', 40, 386);
    c.fillStyle = '#a8ffd4';
    c.fillText(isFinite(endurance)
      ? `${Math.floor(endurance / 3600)}h ${Math.floor(endurance % 3600 / 60)}m` : '--', 130, 386);
    c.strokeRect(40, 404, 430, 22);
    c.fillStyle = fm.fuel / AC.fuelCapacity < 0.1 ? '#ff6644' : '#5fffa8';
    c.fillRect(40, 404, 430 * (fm.fuel / AC.fuelCapacity), 22);
    m.end();
  }

  _drawNav(fm, nav) {
    const m = this.mfds.center, c = m.ctx, W = 640, cx = W / 2, cy = W / 2 + 40;
    m.begin('#05200f');
    c.fillText('HSI', 16, 24);
    const rangeNM = nav ? nav.mfdRange : 40;
    c.fillStyle = '#a8ffd4';
    c.textAlign = 'right'; c.fillText(`${rangeNM} NM`, W - 16, 24); c.textAlign = 'left';

    const R = 230;
    const scale = R / (rangeNM * 1852);
    c.save();
    c.translate(cx, cy);
    c.rotate(-fm.heading * D);
    c.strokeStyle = '#46e08c';
    c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(0, 0, R * 0.5, 0, Math.PI * 2); c.setLineDash([5, 7]); c.stroke(); c.setLineDash([]);
    for (let d = 0; d < 360; d += 10) {
      const a = d * D;
      const l = d % 30 === 0 ? 18 : 9;
      c.beginPath();
      c.moveTo(Math.sin(a) * R, -Math.cos(a) * R);
      c.lineTo(Math.sin(a) * (R - l), -Math.cos(a) * (R - l));
      c.stroke();
      if (d % 30 === 0) {
        c.save();
        c.translate(Math.sin(a) * (R - 34), -Math.cos(a) * (R - 34));
        c.rotate(a);
        c.textAlign = 'center'; c.fillStyle = '#a8ffd4';
        c.font = '500 18px monospace';
        c.fillText(String(d / 10).padStart(2, '0'), 0, 0);
        c.restore();
      }
    }
    for (const ct of CITIES) {
      const dx = (ct.x - fm.position.x) * scale, dz = (ct.z - fm.position.z) * scale;
      if (Math.hypot(dx, dz) > R) continue;
      c.fillStyle = 'rgba(120,200,255,0.30)';
      c.beginPath(); c.arc(dx, dz, Math.max(3, ct.radius * scale), 0, Math.PI * 2); c.fill();
    }
    for (const a of AIRPORTS) {
      const dx = (a.x - fm.position.x) * scale, dz = (a.z - fm.position.z) * scale;
      if (Math.hypot(dx, dz) > R) continue;
      c.fillStyle = a.mil ? '#ffcc55' : '#66ddff';
      c.beginPath(); c.arc(dx, dz, 5, 0, Math.PI * 2); c.fill();
      c.save(); c.translate(dx + 8, dz); c.rotate(fm.heading * D);
      c.font = '500 15px monospace'; c.textAlign = 'left';
      c.fillText(a.icao, 0, 0); c.restore();
    }
    if (nav && nav.waypoint) {
      const dx = (nav.waypoint.x - fm.position.x) * scale, dz = (nav.waypoint.z - fm.position.z) * scale;
      c.strokeStyle = '#66ddff'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 0);
      const len = Math.min(R, Math.hypot(dx, dz));
      const ang = Math.atan2(dx, -dz);
      c.lineTo(Math.sin(ang) * len, -Math.cos(ang) * len); c.stroke();
      if (Math.hypot(dx, dz) < R) { c.beginPath(); c.arc(dx, dz, 9, 0, Math.PI * 2); c.stroke(); }
      c.lineWidth = 1.5;
    }
    c.restore();

    c.strokeStyle = '#ffffff'; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx, cy - 14); c.lineTo(cx, cy + 12);
    c.moveTo(cx - 12, cy + 2); c.lineTo(cx + 12, cy + 2);
    c.moveTo(cx - 6, cy + 12); c.lineTo(cx + 6, cy + 12);
    c.stroke(); c.lineWidth = 1.5;

    const geo = worldToGeo(fm.position.x, fm.position.z);
    c.fillStyle = '#a8ffd4'; c.font = '500 18px monospace';
    c.fillText(`${geo.lat.toFixed(3)}  ${geo.lon.toFixed(3)}`, 16, W - 20);
    c.textAlign = 'right';
    c.fillText(`HDG ${fm.heading.toFixed(0).padStart(3, '0')}`, W - 16, W - 20);
    c.textAlign = 'left';
    m.end();
  }

  _drawSystems(fm, prop, weather) {
    const m = this.mfds.right, c = m.ctx;
    m.begin();
    c.fillText('FLIGHT', 16, 24);
    const rows = [
      ['IAS', (fm.tas * MS_TO_KT).toFixed(0) + ' kt'],
      ['MACH', fm.mach.toFixed(3)],
      ['ALT', (fm.position.y * M_TO_FT).toFixed(0) + ' ft'],
      ['AGL', (fm.altAGL * M_TO_FT).toFixed(0) + ' ft'],
      ['VS', (fm.verticalSpeed * M_TO_FT * 60).toFixed(0) + ' fpm'],
      ['AOA', (fm.alpha / D).toFixed(1) + '°'],
      ['BETA', (fm.beta / D).toFixed(1) + '°'],
      ['G', fm.gLoad.toFixed(2)],
      ['PITCH', (fm.pitchAngle / D).toFixed(1) + '°'],
      ['BANK', (fm.bankAngle / D).toFixed(1) + '°'],
      ['TVC', (fm.nozzleVector / D).toFixed(1) + '°'],
    ];
    rows.forEach((r, i) => {
      c.fillStyle = '#46e08c'; c.fillText(r[0], 24, 66 + i * 34);
      c.fillStyle = '#a8ffd4'; c.fillText(r[1], 150, 66 + i * 34);
    });
    if (weather) {
      c.fillStyle = '#46e08c'; c.fillText('WX', 24, 450);
      c.fillStyle = '#a8ffd4'; c.fillText(weather.target.name, 90, 450);
      c.fillStyle = '#46e08c'; c.fillText('WIND', 24, 484);
      c.fillStyle = '#a8ffd4';
      c.fillText(`${(weather.windSpeed * MS_TO_KT).toFixed(0)} kt`, 110, 484);
    }
    m.end();
  }
}
