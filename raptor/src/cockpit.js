// First-person cockpit: structure, HUD combiner, three multi-function displays
// driven by live canvas textures, and the stick, throttle and switches that
// move with your inputs. A handful of controls are clickable.

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
  begin(bg = '#04120c') {
    const c = this.ctx;
    c.fillStyle = bg;
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.strokeStyle = '#2fbf74'; c.fillStyle = '#5fffa8';
    c.font = '500 20px "JetBrains Mono", ui-monospace, monospace';
    c.textBaseline = 'middle';
  }
  end() { this.tex.needsUpdate = true; }
}

export class Cockpit {
  constructor(scene, aircraft) {
    this.group = new THREE.Group();
    aircraft.group.add(this.group);
    this.group.position.set(0, 0.78, -4.95);   // pilot eye datum

    const dark = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.88, metalness: 0.1 });
    const panel = new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: 0.75, metalness: 0.2 });
    const grey = new THREE.MeshStandardMaterial({ color: 0x3a3e45, roughness: 0.7, metalness: 0.3 });

    // ---- tub: floor, side walls, rear bulkhead, glareshield ----
    // Built as separate panels rather than a box: an enclosing box would put a
    // back-face right across the forward view.
    const floor = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.04, 2.1), dark);
    floor.position.set(0, -1.10, 0.20);
    this.group.add(floor);
    for (const sgn of [-1, 1]) {
      // low side walls: high enough to enclose the tub, low enough that they
      // stay out of the over-the-shoulder view
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 1.7), dark);
      wall.position.set(sgn * 0.44, -0.74, 0.15);
      this.group.add(wall);
      const cons = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 1.0), panel);
      cons.position.set(sgn * 0.35, -0.62, 0.02);
      this.group.add(cons);
    }
    const bulkhead = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.95, 0.05), dark);
    bulkhead.position.set(0, -0.60, 1.15);
    this.group.add(bulkhead);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.90, 0.16), dark);
    seat.position.set(0, -0.62, 0.58);
    this.group.add(seat);

    const coaming = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.14, 0.30), dark);
    coaming.position.set(0, -0.40, -1.00);
    coaming.rotation.x = -12 * D;
    this.group.add(coaming);

    // main instrument panel, canted back, low enough to see over
    const ip = new THREE.Group();
    ip.position.set(0, -0.80, -1.00);
    ip.rotation.x = 26 * D;
    this.group.add(ip);
    const ipBody = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.52, 0.06), panel);
    ip.add(ipBody);

    // ---- three MFDs ----
    this.mfds = { left: new MFD(), center: new MFD(640, 640), right: new MFD() };
    const mk = (mfd, w, h, x, y) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mfd.mat);
      m.position.set(x, y, 0.048);
      ip.add(m);
      const bez = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, h + 0.05, 0.03), grey);
      bez.position.set(x, y, 0.038);
      ip.add(bez);
      return m;
    };
    mk(this.mfds.center, 0.30, 0.30, 0, -0.02);
    mk(this.mfds.left, 0.22, 0.22, -0.33, 0.02);
    mk(this.mfds.right, 0.22, 0.22, 0.33, 0.02);

    // up-front controls strip
    for (let i = 0; i < 8; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.03, 0.02), grey);
      b.position.set(-0.24 + i * 0.068, -0.25, 0.04);
      ip.add(b);
    }

    // ---- HUD combiner glass ----
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.34, 0.24),
      new THREE.MeshPhysicalMaterial({
        color: 0x88ffcc, transparent: true, opacity: 0.022,
        roughness: 0.05, metalness: 0, side: THREE.DoubleSide,
      }));
    glass.position.set(0, -0.10, -0.66);
    glass.rotation.x = -10 * D;
    this.group.add(glass);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.010, 0.016), grey);
    frame.position.set(0, 0.055, -0.66);
    this.group.add(frame);

    // ---- control stick (centre-mounted) ----
    this.stick = new THREE.Group();
    this.stick.position.set(0, -1.05, -0.26);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.30, 12), grey);
    shaft.position.y = 0.15;
    this.stick.add(shaft);
    const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.10, 4, 10), dark);
    grip.position.y = 0.34;
    this.stick.add(grip);
    this.group.add(this.stick);

    // ---- throttle quadrant, left console ----
    this.throttle = new THREE.Group();
    this.throttle.position.set(-0.35, -0.55, 0.02);
    const tlever = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.05, 0.20), dark);
    tlever.position.z = -0.08;
    this.throttle.add(tlever);
    const tknob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), dark);
    tknob.position.set(0, 0.02, -0.17);
    this.throttle.add(tknob);
    this.group.add(this.throttle);
    const quad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.44), panel);
    quad.position.set(-0.35, -0.61, 0.02);
    this.group.add(quad);

    // ---- gear handle, right console ----
    this.gearHandle = new THREE.Group();
    this.gearHandle.position.set(0.33, -0.62, -0.70);
    const gh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), grey);
    gh.position.y = 0.07;
    this.gearHandle.add(gh);
    const gk = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 }));
    gk.position.y = 0.15;
    this.gearHandle.add(gk);
    this.group.add(this.gearHandle);
    this.gearHandle.userData.hotspot = 'gear';
    gk.userData.hotspot = 'gear';

    // ---- warning / caution panel ----
    this.lamps = {};
    const lampMat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.10 });
    const lampSpecs = [
      ['master', 0xff3322, -0.34, 0.24], ['stall', 0xffaa22, -0.205, 0.24],
      ['fuel', 0xffaa22, -0.07, 0.24], ['gear', 0x33ff66, 0.07, 0.24],
      ['ab', 0xff8833, 0.205, 0.24], ['brake', 0xffcc33, 0.34, 0.24],
    ];
    for (const [k, c, x, y] of lampSpecs) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.032), lampMat(c));
      m.position.set(x, y, 0.042);
      ip.add(m);
      this.lamps[k] = m;
    }

    // ---- canopy rail / bow frame in view ----
    const railMat = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.8 });
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.03, 2.2), railMat);
      rail.position.set(s * 0.45, -0.26, 0.30);
      this.group.add(rail);
    }
    // No canopy bow: the real F-22 canopy is a single frameless piece, which
    // is exactly why the forward view out of one is so good.

    // ---- rain on the canopy ----
    this.rainPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 0.95),
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
              vec2 g = vUv * vec2(14.0 + fi*9.0, 9.0 + fi*6.0);
              g.y += uT * (0.7 + uSpeed * 5.0) * (1.0 + fi);
              vec2 id = floor(g); vec2 f = fract(g);
              float r = h(id + fi * 17.0);
              if (r < 0.55) continue;
              vec2 c = vec2(0.5 + (h(id + 3.0) - 0.5) * 0.6, fract(r * 9.0 + uT * (1.0 + uSpeed*4.0)));
              float d = length((f - c) * vec2(1.0, 0.35 + uSpeed * 2.2));
              a += smoothstep(0.16, 0.0, d) * 0.55;
            }
            gl_FragColor = vec4(0.75, 0.82, 0.92, clamp(a,0.0,1.0) * uAmt * 0.55);
          }`,
        transparent: true, depthWrite: false, depthTest: false,
      }));
    this.rainPlane.position.set(0, 0.0, -0.72);
    this.rainPlane.renderOrder = 900;
    this.group.add(this.rainPlane);

    // instrument backlighting
    this.panelLight = new THREE.PointLight(0x66ffaa, 0.0, 2.2);
    this.panelLight.position.set(0, -0.30, -0.55);
    this.group.add(this.panelLight);

    this._mfdTimer = 0;
    this.visible = true;
    this.hotspots = [gk];
  }

  setVisible(v) { this.group.visible = v; }

  update(dt, fm, prop, weather, nav, sky) {
    // stick and throttle follow the inputs
    this.stick.rotation.x = fm.input.pitch * -14 * D;
    this.stick.rotation.z = fm.input.roll * -14 * D;
    this.throttle.position.z = 0.10 + clamp(prop.throttle, 0, 1.5) * 0.16;
    this.gearHandle.rotation.x = fm.gearDown ? 0 : 34 * D;

    // lamps
    const set = (k, on, glow = 1) => { this.lamps[k].material.opacity = on ? 0.10 + 0.85 * glow : 0.08; };
    set('stall', fm.stalled);
    set('fuel', fm.fuel / AC.fuelCapacity < 0.08);
    set('gear', fm.gearPos > 0.99, 1);
    set('ab', prop.afterburner > 0.05, prop.afterburner);
    set('brake', fm.brakes > 0.05);
    set('master', fm.stalled || Math.abs(fm.gLoad) > 8.5 || fm.fuel <= 0);

    const night = sky ? sky.isNight : false;
    this.panelLight.intensity = night ? 0.55 : 0.12;

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
    }
  }

  _drawEngine(fm, prop) {
    const m = this.mfds.left, c = m.ctx, W = 512;
    m.begin();
    c.fillText('ENGINES', 16, 24);
    const e = prop.engines;
    for (let i = 0; i < 2; i++) {
      const x = 40 + i * 230;
      c.strokeStyle = '#2fbf74';
      c.strokeRect(x, 60, 190, 250);
      c.fillStyle = '#5fffa8';
      c.fillText(`ENG ${i + 1}`, x + 12, 82);
      const rows = [
        ['N1', (e[i].n1 * 100).toFixed(1)],
        ['EGT', (e[i].egt - 273).toFixed(0) + 'C'],
        ['THR', (e[i].thrust / 1000).toFixed(0) + 'kN'],
        ['AB', (e[i].ab * 100).toFixed(0) + '%'],
        ['FF', (e[i].fuelFlow * 3600).toFixed(0)],
      ];
      rows.forEach((r, j) => {
        c.fillStyle = '#2fbf74'; c.fillText(r[0], x + 12, 118 + j * 34);
        c.fillStyle = '#5fffa8'; c.fillText(r[1], x + 90, 118 + j * 34);
      });
      // N1 bar
      c.fillStyle = e[i].ab > 0.02 ? '#ffa040' : '#5fffa8';
      c.fillRect(x + 12, 292, 166 * e[i].n1, 10);
      c.strokeRect(x + 12, 292, 166, 10);
    }
    c.fillStyle = '#2fbf74';
    c.fillText('FUEL', 40, 350);
    c.fillStyle = '#5fffa8';
    c.fillText(`${(fm.fuel / 1000).toFixed(2)} t   ${(fm.fuel / AC.fuelCapacity * 100).toFixed(0)}%`, 130, 350);
    const endurance = prop.fuelFlow > 0.01 ? fm.fuel / prop.fuelFlow : Infinity;
    c.fillStyle = '#2fbf74'; c.fillText('ENDUR', 40, 386);
    c.fillStyle = '#5fffa8';
    c.fillText(isFinite(endurance)
      ? `${Math.floor(endurance / 3600)}h ${Math.floor(endurance % 3600 / 60)}m` : '--', 130, 386);
    c.strokeRect(40, 404, 430, 22);
    c.fillStyle = fm.fuel / AC.fuelCapacity < 0.1 ? '#ff6644' : '#5fffa8';
    c.fillRect(40, 404, 430 * (fm.fuel / AC.fuelCapacity), 22);
    m.end();
  }

  _drawNav(fm, nav) {
    const m = this.mfds.center, c = m.ctx, W = 640, cx = W / 2, cy = W / 2 + 40;
    m.begin('#03100a');
    c.fillText('HSI', 16, 24);
    const rangeNM = nav ? nav.mfdRange : 40;
    c.fillStyle = '#5fffa8';
    c.textAlign = 'right'; c.fillText(`${rangeNM} NM`, W - 16, 24); c.textAlign = 'left';

    const R = 230;
    const scale = R / (rangeNM * 1852);
    c.save();
    c.translate(cx, cy);
    // compass rose
    c.rotate(-fm.heading * D);
    c.strokeStyle = '#2fbf74';
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
        c.textAlign = 'center';
        c.fillStyle = '#5fffa8';
        c.font = '500 18px monospace';
        c.fillText(String(d / 10).padStart(2, '0'), 0, 0);
        c.restore();
      }
    }
    // airports and cities in range
    for (const a of AIRPORTS) {
      const dx = (a.x - fm.position.x) * scale, dz = (a.z - fm.position.z) * scale;
      if (Math.hypot(dx, dz) > R) continue;
      c.fillStyle = a.mil ? '#ffcc55' : '#66ddff';
      c.beginPath(); c.arc(dx, dz, 5, 0, Math.PI * 2); c.fill();
      c.save(); c.translate(dx + 8, dz); c.rotate(fm.heading * D);
      c.font = '500 15px monospace'; c.textAlign = 'left';
      c.fillText(a.icao, 0, 0); c.restore();
    }
    for (const ct of CITIES) {
      const dx = (ct.x - fm.position.x) * scale, dz = (ct.z - fm.position.z) * scale;
      if (Math.hypot(dx, dz) > R) continue;
      c.fillStyle = 'rgba(120,200,255,0.35)';
      c.beginPath(); c.arc(dx, dz, Math.max(3, ct.radius * scale), 0, Math.PI * 2); c.fill();
    }
    // waypoint and course line
    if (nav && nav.waypoint) {
      const dx = (nav.waypoint.x - fm.position.x) * scale, dz = (nav.waypoint.z - fm.position.z) * scale;
      c.strokeStyle = '#66ddff'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 0);
      const len = Math.min(R, Math.hypot(dx, dz));
      const ang = Math.atan2(dx, -dz);
      c.lineTo(Math.sin(ang) * len, -Math.cos(ang) * len); c.stroke();
      if (Math.hypot(dx, dz) < R) {
        c.beginPath(); c.arc(dx, dz, 9, 0, Math.PI * 2); c.stroke();
      }
      c.lineWidth = 1;
    }
    c.restore();

    // aircraft symbol
    c.strokeStyle = '#ffffff'; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx, cy - 14); c.lineTo(cx, cy + 12);
    c.moveTo(cx - 12, cy + 2); c.lineTo(cx + 12, cy + 2);
    c.moveTo(cx - 6, cy + 12); c.lineTo(cx + 6, cy + 12);
    c.stroke(); c.lineWidth = 1;

    const geo = worldToGeo(fm.position.x, fm.position.z);
    c.fillStyle = '#5fffa8'; c.font = '500 18px monospace';
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
      c.fillStyle = '#2fbf74'; c.fillText(r[0], 24, 66 + i * 34);
      c.fillStyle = '#5fffa8'; c.fillText(r[1], 150, 66 + i * 34);
    });
    if (weather) {
      c.fillStyle = '#2fbf74'; c.fillText('WX', 24, 450);
      c.fillStyle = '#5fffa8'; c.fillText(weather.target.name, 90, 450);
      c.fillStyle = '#2fbf74'; c.fillText('WIND', 24, 484);
      c.fillStyle = '#5fffa8';
      c.fillText(`${(weather.windSpeed * MS_TO_KT).toFixed(0)} kt`, 110, 484);
    }
    m.end();
  }
}
