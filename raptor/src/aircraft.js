// Procedural F-22 exterior model with animated control surfaces, thrust-
// vectoring nozzles, retractable gear and lights.
//
// Body axes match the flight model: +X right, +Y up, -Z forward.

import * as THREE from 'three';
import { AC } from './config.js';

const D = Math.PI / 180;

// ---------------------------------------------------------------------------
// Lofting: a chined superellipse ring per station, stitched into a hull.
// ---------------------------------------------------------------------------
function ring(halfW, halfH, cy, n, chine, seg) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const th = (i / seg) * Math.PI * 2;
    const c = Math.cos(th), s = Math.sin(th);
    const p = 2 / n;
    let x = Math.sign(c) * Math.pow(Math.abs(c), p) * halfW;
    let y = Math.sign(s) * Math.pow(Math.abs(s), p) * halfH;
    // chine: push the widest points outward and flatten the belly
    const flat = Math.exp(-Math.pow(s * 2.4, 2));
    x *= 1 + chine * flat * 0.30;
    if (y < 0) y *= 0.82;
    pts.push(new THREE.Vector3(x, y + cy, 0));
  }
  return pts;
}

function loft(stations, seg = 24) {
  const rings = stations.map(st => {
    const r = ring(st.w, st.h, st.cy, st.n || 2.3, st.chine || 0, seg);
    for (const p of r) p.z = st.z;
    return r;
  });
  const pos = [], idx = [];
  for (const r of rings) for (const p of r) pos.push(p.x, p.y, p.z);
  for (let s = 0; s < rings.length - 1; s++) {
    for (let i = 0; i < seg; i++) {
      const a = s * seg + i, b = s * seg + (i + 1) % seg;
      const c = a + seg, d = b + seg;
      idx.push(a, b, c, b, d, c);
    }
  }
  // caps
  const first = 0, last = (rings.length - 1) * seg;
  const cap = (base, z, flip) => {
    const ci = pos.length / 3;
    let cx = 0, cy = 0;
    for (let i = 0; i < seg; i++) { cx += pos[(base + i) * 3]; cy += pos[(base + i) * 3 + 1]; }
    pos.push(cx / seg, cy / seg, z);
    for (let i = 0; i < seg; i++) {
      const a = base + i, b = base + (i + 1) % seg;
      if (flip) idx.push(ci, a, b); else idx.push(ci, b, a);
    }
  };
  cap(first, stations[0].z, true);
  cap(last, stations[stations.length - 1].z, false);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A tapered, swept lifting surface built from a root and tip chord line. */
function panel({ rootZ, rootChord, rootY = 0, tipX, tipZ, tipChord, thickRoot, thickTip, dihedral = 0 }) {
  const shape = (chord, thick) => {
    // symmetric airfoil-ish section, 8 points per side
    const pts = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const yc = thick * (1.4845 * Math.sqrt(t) - 0.63 * t - 1.758 * t * t + 1.4215 * t * t * t - 0.5075 * Math.pow(t, 4));
      pts.push([t * chord, yc]);
    }
    return pts;
  };
  const rp = shape(rootChord, thickRoot), tp = shape(tipChord, thickTip);
  const pos = [], idx = [];
  const n = rp.length;
  const push = (x, y, z) => { pos.push(x, y, z); return pos.length / 3 - 1; };
  const top = [], bot = [];
  for (let i = 0; i < n; i++) {
    top.push([push(0, rootY + rp[i][1], rootZ + rp[i][0]), push(tipX, rootY + tipX * Math.tan(dihedral) + tp[i][1], tipZ + tp[i][0])]);
    bot.push([push(0, rootY - rp[i][1], rootZ + rp[i][0]), push(tipX, rootY + tipX * Math.tan(dihedral) - tp[i][1], tipZ + tp[i][0])]);
  }
  for (let i = 0; i < n - 1; i++) {
    idx.push(top[i][0], top[i][1], top[i + 1][0], top[i + 1][0], top[i][1], top[i + 1][1]);
    idx.push(bot[i][0], bot[i + 1][0], bot[i][1], bot[i][1], bot[i + 1][0], bot[i + 1][1]);
  }
  // close the tip and the trailing edge
  for (let i = 0; i < n - 1; i++) idx.push(top[i][1], bot[i][1], top[i + 1][1], top[i + 1][1], bot[i][1], bot[i + 1][1]);
  idx.push(top[n - 1][0], bot[n - 1][0], top[n - 1][1], top[n - 1][1], bot[n - 1][0], bot[n - 1][1]);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Flat control surface slab, hinged along its leading edge at local z = 0. */
function slab(spanInner, spanOuter, chordInner, chordOuter, thick, sweep = 0) {
  const g = new THREE.BufferGeometry();
  const p = [
    spanInner, 0, 0, spanOuter, 0, sweep,
    spanOuter, 0, sweep + chordOuter, spanInner, 0, chordInner,
  ];
  const pos = [];
  for (const s of [thick * 0.5, -thick * 0.5]) {
    for (let i = 0; i < 4; i++) pos.push(p[i * 3], p[i * 3 + 1] + s, p[i * 3 + 2]);
  }
  const idx = [0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6,
    0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 6, 2, 6, 3, 3, 6, 7, 3, 7, 0, 0, 7, 4];
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------

export class Aircraft {
  constructor(scene, renderer) {
    this.group = new THREE.Group();
    scene.add(this.group);

    const skin = new THREE.MeshStandardMaterial({
      color: 0x5c626b, metalness: 0.62, roughness: 0.52,
    });
    const skinDark = new THREE.MeshStandardMaterial({
      color: 0x484d55, metalness: 0.60, roughness: 0.58,
    });
    const radome = new THREE.MeshStandardMaterial({
      color: 0x33373d, metalness: 0.25, roughness: 0.72,
    });
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3c, metalness: 0.85, roughness: 0.38,
    });
    // The real canopy is gold-coated for radar reasons, and you can still see
    // out of it perfectly well — keep it thin or the cockpit view goes dark.
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xd8b46a, metalness: 0.9, roughness: 0.06,
      transparent: true, opacity: 0.13, side: THREE.DoubleSide,
      depthWrite: false, clearcoat: 1.0,
    });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.9, metalness: 0.0 });
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.9, roughness: 0.3 });
    this.materials = { skin, skinDark, radome, nozzleMat, glass };

    // ---- fuselage ----
    const stations = [
      { z: -9.46, w: 0.06, h: 0.06, cy: 0.10, n: 2.0 },
      { z: -8.70, w: 0.42, h: 0.30, cy: 0.08, n: 2.2, chine: 0.4 },
      { z: -7.60, w: 0.86, h: 0.52, cy: 0.05, n: 2.3, chine: 0.8 },
      { z: -6.30, w: 1.24, h: 0.68, cy: 0.02, n: 2.4, chine: 1.0 },
      { z: -4.90, w: 1.55, h: 0.82, cy: 0.00, n: 2.5, chine: 1.0 },
      { z: -3.10, w: 1.92, h: 0.95, cy: -0.04, n: 2.7, chine: 0.9 },
      { z: -1.20, w: 2.32, h: 1.05, cy: -0.08, n: 3.0, chine: 0.6 },
      { z: 0.80, w: 2.44, h: 1.06, cy: -0.10, n: 3.2, chine: 0.4 },
      { z: 2.80, w: 2.40, h: 1.02, cy: -0.09, n: 3.2, chine: 0.3 },
      { z: 4.80, w: 2.28, h: 0.96, cy: -0.07, n: 3.1, chine: 0.2 },
      { z: 6.60, w: 2.06, h: 0.88, cy: -0.04, n: 3.0 },
      { z: 8.20, w: 1.86, h: 0.76, cy: -0.02, n: 2.9 },
      { z: 9.20, w: 1.72, h: 0.66, cy: 0.00, n: 2.8 },
    ];
    const body = new THREE.Mesh(loft(stations, 28), skin);
    this.group.add(body);
    this.body = body;

    // radome
    const nose = new THREE.Mesh(loft(stations.slice(0, 4), 28), radome);
    this.group.add(nose);

    // ---- intakes: caret ducts either side of the forward fuselage ----
    for (const s of [-1, 1]) {
      const duct = new THREE.Mesh(loft([
        { z: -3.30, w: 0.62, h: 0.66, cy: -0.30, n: 2.6 },
        { z: -2.40, w: 0.70, h: 0.72, cy: -0.30, n: 2.8 },
        { z: -0.60, w: 0.72, h: 0.70, cy: -0.28, n: 3.0 },
      ], 16), skinDark);
      duct.position.x = s * 1.72;
      this.group.add(duct);
      const lip = new THREE.Mesh(new THREE.BoxGeometry(0.10, 1.5, 0.12), radome);
      lip.position.set(s * 2.38, -0.30, -3.30);
      lip.rotation.z = s * 22 * D;
      this.group.add(lip);
    }

    // ---- wings ----
    const wingGeom = panel({
      rootZ: -2.60, rootChord: 8.40, rootY: -0.15,
      tipX: 6.78, tipZ: 4.62, tipChord: 1.80,
      thickRoot: 0.42, thickTip: 0.10, dihedral: -1.5 * D,
    });
    this.wingL = new THREE.Mesh(wingGeom, skin);
    this.wingL.scale.x = -1;
    this.wingR = new THREE.Mesh(wingGeom, skin);
    this.group.add(this.wingL, this.wingR);

    // leading-edge flaps
    this.leFlaps = [];
    for (const s of [-1, 1]) {
      const g = slab(0, 1, 0.62, 0.30, 0.07, 0);
      const m = new THREE.Mesh(g, skinDark);
      const pivot = new THREE.Group();
      pivot.position.set(s * 2.30, -0.15, -2.55);
      pivot.rotation.y = -s * 42 * D;
      m.scale.set(s * 4.6, 1, 1);
      pivot.add(m);
      this.group.add(pivot);
      this.leFlaps.push({ pivot, sign: s });
    }

    // trailing-edge surfaces: flaperons inboard, ailerons outboard
    this.flaperons = []; this.ailerons = [];
    for (const s of [-1, 1]) {
      const fl = new THREE.Group();
      fl.position.set(s * 2.35, -0.16, 5.30);
      const flm = new THREE.Mesh(slab(0, 2.55, 1.55, 1.10, 0.10, -0.55), skin);
      flm.scale.x = s;
      fl.add(flm);
      this.group.add(fl);
      this.flaperons.push({ pivot: fl, sign: s });

      const al = new THREE.Group();
      al.position.set(s * 4.90, -0.16, 4.74);
      const alm = new THREE.Mesh(slab(0, 1.75, 1.05, 0.62, 0.08, -0.42), skin);
      alm.scale.x = s;
      al.add(alm);
      this.group.add(al);
      this.ailerons.push({ pivot: al, sign: s });
    }

    // ---- all-moving horizontal stabilators ----
    this.stabs = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 1.55, -0.05, 6.10);
      const g = panel({
        rootZ: -0.9, rootChord: 3.05, tipX: 3.05, tipZ: 1.35, tipChord: 1.05,
        thickRoot: 0.16, thickTip: 0.06,
      });
      const m = new THREE.Mesh(g, skin);
      m.scale.x = s;
      pivot.add(m);
      this.group.add(pivot);
      this.stabs.push({ pivot, sign: s });
    }

    // ---- twin canted vertical stabilisers with rudders ----
    this.rudders = [];
    for (const s of [-1, 1]) {
      const fin = new THREE.Group();
      fin.position.set(s * 2.05, 0.55, 3.10);
      fin.rotation.z = -s * 28 * D;
      const g = panel({
        rootZ: 0, rootChord: 4.10, tipX: 3.35, tipZ: 2.55, tipChord: 1.45,
        thickRoot: 0.22, thickTip: 0.08,
      });
      const m = new THREE.Mesh(g, skin);
      m.rotation.z = -90 * D;         // stand the panel up
      m.scale.x = 1;
      fin.add(m);
      this.group.add(fin);

      const rud = new THREE.Group();
      rud.position.set(s * 2.05, 0.55, 3.10);
      rud.rotation.z = -s * 28 * D;
      const rm = new THREE.Mesh(slab(0.35, 3.15, 1.05, 0.62, 0.10, 1.95), skinDark);
      rm.rotation.z = -90 * D;
      rm.position.z = 3.05;
      rud.add(rm);
      this.group.add(rud);
      this.rudders.push({ pivot: rud, sign: s, cant: -s * 28 * D });
    }

    // ---- canopy ----
    const canopy = new THREE.Mesh(loft([
      { z: -6.15, w: 0.10, h: 0.06, cy: 0.72, n: 2.0 },
      { z: -5.60, w: 0.52, h: 0.34, cy: 0.74, n: 2.2 },
      { z: -4.70, w: 0.72, h: 0.50, cy: 0.76, n: 2.4 },
      { z: -3.60, w: 0.74, h: 0.52, cy: 0.76, n: 2.4 },
      { z: -2.85, w: 0.60, h: 0.36, cy: 0.72, n: 2.4 },
      { z: -2.30, w: 0.30, h: 0.14, cy: 0.66, n: 2.2 },
    ], 20), glass);
    this.group.add(canopy);
    this.canopy = canopy;

    // ---- exhaust nozzles with vectoring petals ----
    this.nozzles = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.92, -0.05, 8.15);
      const shell = new THREE.Mesh(loft([
        { z: 0.0, w: 0.62, h: 0.58, cy: 0, n: 3.4 },
        { z: 0.75, w: 0.56, h: 0.44, cy: 0, n: 4.0 },
        { z: 1.35, w: 0.54, h: 0.30, cy: 0, n: 5.0 },
      ], 16), nozzleMat);
      pivot.add(shell);
      // 2D thrust-vectoring paddles above and below
      for (const v of [1, -1]) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.05, 0.85), nozzleMat);
        p.position.set(0, v * 0.30, 1.55);
        pivot.add(p);
      }
      const inner = new THREE.Mesh(new THREE.CircleGeometry(0.48, 20), new THREE.MeshBasicMaterial({ color: 0x0a0a0c }));
      inner.position.z = 1.34;
      inner.rotation.y = Math.PI;
      pivot.add(inner);
      this.group.add(pivot);
      this.nozzles.push({ pivot, sign: s });
    }

    // ---- landing gear ----
    this.gear = { nose: new THREE.Group(), mains: [], doors: [] };
    const wheel = (r, w) => {
      const g = new THREE.CylinderGeometry(r, r, w, 18);
      g.rotateZ(90 * D);
      return g;
    };
    // nose gear
    {
      const g = this.gear.nose;
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.09, 2.0, 10), strutMat);
      strut.position.y = -1.0;
      g.add(strut);
      const w1 = new THREE.Mesh(wheel(0.36, 0.22), rubber);
      w1.position.set(0, -2.0, 0);
      g.add(w1);
      g.position.set(0, -0.75, -3.80);
      this.group.add(g);
      this.gear.noseWheel = w1;
    }
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 2.15, 10), strutMat);
      strut.position.y = -1.07;
      g.add(strut);
      const w1 = new THREE.Mesh(wheel(0.48, 0.30), rubber);
      w1.position.set(0, -2.15, 0);
      g.add(w1);
      g.position.set(s * 1.60, -0.70, 2.30);
      this.group.add(g);
      this.gear.mains.push({ group: g, wheel: w1, sign: s });
    }
    // gear doors
    for (const spec of [
      { x: 0, z: -3.80, w: 0.55, l: 2.1, sign: 1 },
      { x: -1.60, z: 2.30, w: 0.75, l: 2.4, sign: -1 },
      { x: 1.60, z: 2.30, w: 0.75, l: 2.4, sign: 1 },
    ]) {
      const pivot = new THREE.Group();
      pivot.position.set(spec.x + spec.sign * spec.w * 0.5, -0.72, spec.z);
      const m = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.04, spec.l), skinDark);
      m.position.x = -spec.sign * spec.w * 0.5;
      pivot.add(m);
      this.group.add(pivot);
      this.gear.doors.push({ pivot, sign: spec.sign });
    }

    // ---- lights ----
    this.lights = { nav: [], strobe: [], form: [] };
    const navMat = (c) => new THREE.MeshBasicMaterial({ color: c });
    const lamp = (x, y, z, c, r = 0.09) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), navMat(c));
      m.position.set(x, y, z);
      this.group.add(m);
      return m;
    };
    this.lights.nav.push(lamp(-6.80, -0.10, 4.55, 0xff2222));   // port red
    this.lights.nav.push(lamp(6.80, -0.10, 4.55, 0x22ff44));    // starboard green
    this.lights.nav.push(lamp(0, 0.35, 9.20, 0xffffff, 0.07));  // tail white
    this.lights.strobe.push(lamp(-6.80, 0.02, 4.40, 0xffffff, 0.07));
    this.lights.strobe.push(lamp(6.80, 0.02, 4.40, 0xffffff, 0.07));
    for (const s of [-1, 1]) {
      this.lights.form.push(lamp(s * 2.20, 0.30, -1.20, 0x88ddff, 0.05));
      this.lights.form.push(lamp(s * 3.10, 1.90, 4.60, 0x88ddff, 0.05));
    }
    for (const l of [...this.lights.nav, ...this.lights.strobe, ...this.lights.form]) {
      l.material.transparent = true;
    }
    // a real point light in the cockpit for night flying
    this.cockpitGlow = new THREE.PointLight(0x66ff99, 0.0, 6);
    this.cockpitGlow.position.set(0, 0.55, -4.4);
    this.group.add(this.cockpitGlow);

    this._strobeT = 0;
  }

  /** Drive every animated part from the flight-model state. */
  update(fm, propulsion, dt, night) {
    const s = fm.surfaces;

    // control surfaces: 25 deg of authority, ailerons differential
    for (const f of this.flaperons) {
      const defl = (s.elevator * 0.35 + f.sign * s.aileron * 0.5) * 22 * D;
      f.pivot.rotation.x = defl;
    }
    for (const a of this.ailerons) {
      a.pivot.rotation.x = a.sign * s.aileron * 25 * D;
    }
    for (const st of this.stabs) {
      // differential tail for roll augmentation, symmetric for pitch
      st.pivot.rotation.x = (s.elevator * 22 + st.sign * s.aileron * 8) * D;
    }
    for (const r of this.rudders) {
      r.pivot.rotation.y = -s.rudder * 25 * D;
    }
    // leading-edge flaps schedule with angle of attack
    const le = Math.max(0, Math.min(1, fm.alpha / (18 * D))) * 26 * D;
    for (const f of this.leFlaps) f.pivot.rotation.x = -le;

    // nozzles: vectoring plus a petal-area change with throttle
    for (const n of this.nozzles) {
      n.pivot.rotation.x = -fm.nozzleVector;
      const open = 0.82 + 0.30 * propulsion.afterburner + 0.10 * propulsion.spool;
      n.pivot.scale.set(open, open, 1);
    }

    // gear: rotate down over the transit, doors lead the strut
    const g = fm.gearPos;
    const ease = g * g * (3 - 2 * g);
    this.gear.nose.rotation.x = (1 - ease) * 95 * D;
    this.gear.nose.visible = g > 0.01;
    // nosewheel steering
    this.gear.nose.rotation.y = fm.onGround
      ? fm.input.yaw * AC.noseWheelMaxSteer * Math.max(0, 1 - Math.hypot(fm.velocity.x, fm.velocity.z) / 45)
      : 0;
    for (const m of this.gear.mains) {
      m.group.rotation.z = m.sign * (1 - ease) * 88 * D;
      m.group.visible = g > 0.01;
    }
    const doorOpen = Math.min(1, g * 1.6) * (g < 0.99 ? 1 : 0.0) + (g > 0.99 ? 1 : 0);
    for (const d of this.gear.doors) {
      d.pivot.rotation.z = d.sign * doorOpen * 92 * D;
      d.pivot.visible = g > 0.01;
    }
    // wheel spin on the ground
    if (fm.onGround) {
      const gs = Math.hypot(fm.velocity.x, fm.velocity.z);
      const spin = gs / 0.48 * dt;
      this.gear.noseWheel.rotation.x += spin;
      for (const m of this.gear.mains) m.wheel.rotation.x += spin;
    }

    // lights
    this._strobeT += dt;
    const strobeOn = (this._strobeT % 1.35) < 0.06 || ((this._strobeT % 1.35) > 0.14 && (this._strobeT % 1.35) < 0.20);
    const navOn = night || fm.onGround;
    for (const l of this.lights.nav) l.material.opacity = navOn ? 1 : 0.25;
    for (const l of this.lights.strobe) l.material.opacity = strobeOn ? 1 : 0.0;
    for (const l of this.lights.form) l.material.opacity = night ? 0.75 : 0.1;
    this.cockpitGlow.intensity = night ? 0.7 : 0.0;
  }

  setVisible(v) { this.group.visible = v; }
}
