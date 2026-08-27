// Procedural F-22A exterior.
//
// The Raptor is a faceted aeroplane: flat panels, hard chine lines, sharp
// edges, nothing round anywhere except the radome and the canopy. So this is
// built from explicit polygonal cross-sections and flat lifting surfaces with
// flat shading, rather than smooth lofted tubes — smooth shading is what makes
// a procedural fighter read as a generic dart.
//
// Body axes match the flight model: +X right, +Y up, -Z forward.
// Geometry follows published dimensions: 18.92 m long, 13.56 m span, 5.08 m
// to the top of the fins, 42 degrees of leading-edge sweep, 28 degrees of fin
// cant.

import * as THREE from 'three';
import { AC } from './config.js';

const D = Math.PI / 180;

// ---------------------------------------------------------------------------
// Hull sections. Each station is a chined diamond: a flat top deck, a hard
// chine at maximum half-width, and a flatter underside. Points run clockwise
// seen from the front, starting at the top centreline.
// ---------------------------------------------------------------------------
function section(w, top, bot, chineY, shoulder = 0.55) {
  return [
    [0, top],
    [w * shoulder, top * 0.78 + chineY * 0.22],
    [w, chineY],
    [w * 0.66, -bot * 0.72 + chineY * 0.28],
    [0, -bot],
    [-w * 0.66, -bot * 0.72 + chineY * 0.28],
    [-w, chineY],
    [-w * shoulder, top * 0.78 + chineY * 0.22],
  ];
}

/** Stitch a list of {z, pts} rings into a closed hull with unshared vertices. */
function hull(stations, capFront = true, capBack = true) {
  const pos = [];
  const tri = (a, b, c) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
  const P = stations.map(st => st.pts.map(p => [p[0], p[1], st.z]));

  for (let s = 0; s < P.length - 1; s++) {
    const a = P[s], b = P[s + 1];
    const n = a.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      tri(a[i], b[i], a[j]);
      tri(a[j], b[i], b[j]);
    }
  }
  const cap = (ring, flip) => {
    const c = [0, 0, ring[0][2]];
    for (const p of ring) { c[0] += p[0] / ring.length; c[1] += p[1] / ring.length; }
    for (let i = 0; i < ring.length; i++) {
      const j = (i + 1) % ring.length;
      if (flip) tri(c, ring[j], ring[i]); else tri(c, ring[i], ring[j]);
    }
  };
  if (capFront) cap(P[0], true);
  if (capBack) cap(P[P.length - 1], false);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/**
 * An open shell: stitches only the listed points of each ring, leaving the
 * rest of the section open. A canopy has to be built this way — as a closed
 * hull its underside skin sits right under the pilot's chin and hides the
 * whole instrument panel.
 */
function strip(stations, idx) {
  const pos = [];
  const tri = (a, b, c) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
  const P = stations.map(st => idx.map(i => [st.pts[i][0], st.pts[i][1], st.z]));
  for (let s = 0; s < P.length - 1; s++) {
    const a = P[s], b = P[s + 1];
    for (let i = 0; i < a.length - 1; i++) {
      tri(a[i], b[i], a[i + 1]);
      tri(a[i + 1], b[i], b[i + 1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/**
 * A flat lifting surface from a planform outline. `pts` are [x, z] pairs in
 * order around the planform; the surface is given a symmetric thickness that
 * tapers to a sharp edge all the way round, which is what a fighter's wing
 * actually looks like in silhouette.
 */
function surface(pts, thickness, y = 0, taper = null) {
  const pos = [];
  const tri = (a, b, c) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
  // centroid, for the fan and for the thickness falloff
  let cx = 0, cz = 0;
  for (const p of pts) { cx += p[0] / pts.length; cz += p[1] / pts.length; }
  const th = (p) => {
    const t = taper ? taper(p[0], p[1]) : 1;
    return thickness * 0.5 * t;
  };
  const c = [cx, y, cz];
  const cTop = [cx, y + thickness * 0.5, cz];
  const cBot = [cx, y - thickness * 0.5, cz];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ea = [a[0], y, a[1]], eb = [b[0], y, b[1]];
    // upper and lower shells meet at the sharp planform edge
    tri(cTop, ea, eb);
    tri(cBot, eb, ea);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** A flat slab from a planform outline, used for control surfaces. */
function slabFrom(pts, thickness) {
  return surface(pts, thickness, 0);
}

/** Box helper with a corner-to-corner spec. */
function box(x0, y0, z0, x1, y1, z1) {
  const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return g;
}

// ---------------------------------------------------------------------------

export class Aircraft {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    // ---- materials: two-tone tactical grey, flat shaded ----
    const mk = (color, opts = {}) => new THREE.MeshStandardMaterial({
      color, metalness: 0.34, roughness: 0.54, flatShading: true,
      envMapIntensity: 0.55, ...opts,
    });
    const upper = mk(0x6c727a);
    const lower = mk(0x878e96);
    const dark = mk(0x51575e);
    const radome = mk(0x5e646c, { metalness: 0.06, roughness: 0.88 });
    const nozzleMat = mk(0x53565b, { metalness: 0.75, roughness: 0.34 });
    const burn = mk(0x2f3134, { metalness: 0.6, roughness: 0.5 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xd8b46a, metalness: 0.9, roughness: 0.06,
      transparent: true, opacity: 0.13, side: THREE.DoubleSide,
      depthWrite: false, clearcoat: 1.0,
    });
    const rubber = mk(0x141519, { metalness: 0.0, roughness: 0.92 });
    const strutMat = mk(0xa6acb4, { metalness: 0.85, roughness: 0.30 });
    this.materials = { upper, lower, dark, radome, glass };

    const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); this.group.add(m); return m; };

    // ---- forward fuselage: radome, chined forebody, cockpit deck ----
    // chineY rises toward the nose so the chine line sweeps up to the radome
    const fwd = [
      { z: -9.46, pts: section(0.07, 0.02, 0.07, -0.05) },
      { z: -9.10, pts: section(0.26, 0.07, 0.22, -0.04) },
      { z: -8.40, pts: section(0.55, 0.16, 0.38, -0.01) },
      { z: -7.40, pts: section(0.88, 0.26, 0.50, 0.03) },
      { z: -6.20, pts: section(1.22, 0.38, 0.58, 0.04) },
    ];
    add(hull(fwd, true, false), radome);

    const mid = [
      { z: -6.20, pts: section(1.22, 0.38, 0.58, 0.04) },
      { z: -5.20, pts: section(1.52, 0.50, 0.68, 0.02) },
      { z: -4.10, pts: section(1.80, 0.60, 0.78, -0.02) },
      { z: -2.60, pts: section(2.08, 0.62, 0.90, -0.06) },
      { z: -1.00, pts: section(2.26, 0.62, 0.97, -0.09) },
      { z: 0.80, pts: section(2.32, 0.60, 1.00, -0.10) },
      { z: 2.60, pts: section(2.30, 0.58, 0.99, -0.10) },
      { z: 4.40, pts: section(2.24, 0.56, 0.94, -0.09) },
      { z: 6.20, pts: section(2.12, 0.53, 0.86, -0.07) },
      { z: 7.60, pts: section(1.96, 0.50, 0.74, -0.05) },
      { z: 8.60, pts: section(1.82, 0.46, 0.62, -0.03) },
      { z: 9.30, pts: section(1.70, 0.42, 0.52, -0.02) },
    ];
    this.body = add(hull(mid, false, true), upper);

    // Belly plate, slightly lighter — real fighters are two-tone. It has to be
    // an open strip: as a closed hull its flat top deck sits just under the
    // pilot and reads as a floor across the whole forward view.
    const belly = mid.map(st => ({
      z: st.z,
      pts: st.pts.map(([x, y]) => [x * 0.992, y * 0.995]),
    }));
    add(strip(belly, [2, 3, 4, 5, 6]), lower);

    // ---- leading-edge root extensions: the chine running to the wing ----
    for (const s of [-1, 1]) {
      const lex = surface([
        [s * 1.15, -6.30], [s * 2.35, -2.70], [s * 2.35, -1.30], [s * 1.30, -4.60],
      ], 0.16, -0.02);
      const m = add(lex, upper);
      m.renderOrder = 1;
    }

    // ---- wings: clipped delta, 42 deg LE sweep, forward-swept trailing edge --
    // root LE z = -2.60, root chord 9.60, tip at x = 6.78, tip chord 1.62
    const WING = (s) => [
      [s * 1.90, -2.35],            // root leading edge (at the fuselage side)
      [s * 6.78, 3.50],             // tip leading edge
      [s * 6.78, 5.12],             // tip trailing edge
      [s * 1.90, 6.95],             // root trailing edge
    ];
    for (const s of [-1, 1]) {
      const w = surface(WING(s), 0.46, -0.14,
        (x) => Math.max(0.16, 1 - Math.abs(x) / 7.6));
      add(w, upper);
    }

    // ---- twin canted vertical stabilisers ----
    this.rudders = [];
    for (const s of [-1, 1]) {
      const fin = new THREE.Group();
      fin.position.set(s * 1.62, 0.48, 0);
      fin.rotation.z = -s * 28 * D;
      // planform in the fin's own plane: x is height, z is chord
      const finPts = [
        [0.05, 2.10], [3.32, 5.60], [3.32, 7.05], [0.05, 7.55],
      ];
      const fg = surface(finPts, 0.26, 0, (x) => Math.max(0.22, 1 - x / 4.0));
      // stand it up: the surface is built in the XZ plane, rotate into XY
      fg.rotateZ(90 * D);
      const m = new THREE.Mesh(fg, upper);
      fin.add(m);
      this.group.add(fin);

      // rudder: the aft third of the fin, hinged on its own axis
      const rud = new THREE.Group();
      rud.position.set(s * 1.62, 0.48, 0);
      rud.rotation.z = -s * 28 * D;
      const rudPts = [[0.10, 6.55], [3.15, 6.60], [3.15, 7.05], [0.10, 7.55]];
      const rg = surface(rudPts, 0.20, 0, (x) => Math.max(0.25, 1 - x / 4.2));
      rg.rotateZ(90 * D);
      const rm = new THREE.Mesh(rg, dark);
      rud.add(rm);
      this.group.add(rud);
      this.rudders.push({ pivot: rud, sign: s });
    }

    // ---- all-moving horizontal stabilators ----
    this.stabs = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 1.78, -0.08, 6.30);
      const pts = [
        [0, -1.10], [s * 2.75, 1.30], [s * 2.75, 2.40], [0, 2.55],
      ];
      const g = surface(pts, 0.24, 0, (x) => Math.max(0.20, 1 - Math.abs(x) / 3.2));
      pivot.add(new THREE.Mesh(g, upper));
      this.group.add(pivot);
      this.stabs.push({ pivot, sign: s });
    }

    // ---- caret intakes ----
    for (const s of [-1, 1]) {
      const duct = hull([
        { z: -4.30, pts: section(0.60, 0.42, 0.46, 0.00, 0.72) },
        { z: -3.40, pts: section(0.66, 0.46, 0.50, 0.00, 0.72) },
        { z: -1.60, pts: section(0.70, 0.46, 0.50, 0.00, 0.72) },
        { z: -0.20, pts: section(0.66, 0.42, 0.44, 0.00, 0.72) },
      ], false, false);
      const m = add(duct, dark);
      m.position.set(s * 1.98, -0.42, 0);

      // the caret lip: a swept diamond plate standing proud of the duct mouth
      const lip = surface([
        [s * 1.30, -4.34], [s * 2.66, -3.62], [s * 2.66, -3.26], [s * 1.30, -3.98],
      ], 0.10, -0.42);
      add(lip, radome);
      // splitter plate between the duct and the fuselage
      const split = box(s * 1.32, -0.88, -4.30, s * 1.40, 0.02, -1.40);
      add(split, dark);
      // inlet face, black
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.80), burn);
      face.position.set(s * 1.98, -0.42, -4.28);
      face.rotation.y = Math.PI;
      this.group.add(face);
    }

    // ---- weapon bay door outlines, faintly darker ----
    for (const s of [-1, 1]) {
      const bay = box(s * 0.35, -1.02, -1.60, s * 1.55, -0.99, 2.60);
      add(bay, dark);
    }
    const sideBay = (s) => box(s * 2.05, -0.62, -2.40, s * 2.12, 0.00, -0.90);
    for (const s of [-1, 1]) add(sideBay(s), dark);

    // ---- canopy ----
    const canopy = strip([
      { z: -6.60, pts: section(0.10, 0.06, 0.02, 0.02) },
      { z: -6.05, pts: section(0.48, 0.32, 0.06, 0.06) },
      { z: -5.30, pts: section(0.68, 0.48, 0.06, 0.02) },
      { z: -4.30, pts: section(0.72, 0.52, 0.06, -0.02) },
      { z: -3.40, pts: section(0.64, 0.44, 0.06, -0.04) },
      { z: -2.75, pts: section(0.42, 0.24, 0.04, -0.04) },
      { z: -2.40, pts: section(0.15, 0.07, 0.02, -0.02) },
    ], [6, 7, 0, 1, 2]);
    canopy.translate(0, 0.62, 0);
    this.canopy = add(canopy, glass);
    // canopy sill
    for (const s of [-1, 1]) {
      const sill = box(s * 0.60, 0.59, -6.40, s * 0.72, 0.66, -2.60);
      add(sill, dark);
    }

    // ---- nozzles: two-dimensional convergent-divergent, not round ----
    this.nozzles = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.92, -0.10, 8.10);
      const shell = hull([
        { z: 0.00, pts: section(0.62, 0.50, 0.50, 0.00, 0.80) },
        { z: 0.70, pts: section(0.58, 0.40, 0.40, 0.00, 0.86) },
        { z: 1.30, pts: section(0.56, 0.30, 0.30, 0.00, 0.92) },
      ], false, false);
      pivot.add(new THREE.Mesh(shell, nozzleMat));
      // the vectoring paddles above and below
      for (const v of [1, -1]) {
        const p = new THREE.Mesh(box(-0.56, -0.03, 0, 0.56, 0.03, 0.95), nozzleMat);
        p.position.set(0, v * 0.30, 1.28);
        p.rotation.x = -v * 6 * D;
        pivot.add(p);
      }
      const inner = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.56), burn);
      inner.position.z = 1.29;
      inner.rotation.y = Math.PI;
      pivot.add(inner);
      this.group.add(pivot);
      this.nozzles.push({ pivot, sign: s });
    }
    // the flat deck between the nozzles
    add(box(-0.42, -0.22, 7.80, 0.42, 0.24, 9.35), dark);

    // ---- flight control surfaces ----
    // Leading-edge flaps. Built as planform slabs like every other surface and
    // hinged about the *leading-edge line itself*, which is swept 42 degrees —
    // hinging them about the body X axis is what turns them into swords.
    this.leFlaps = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      const pts = [
        [s * 1.95, -2.28], [s * 6.70, 3.44], [s * 6.70, 4.02], [s * 1.95, -1.52],
      ];
      pivot.add(new THREE.Mesh(slabFrom(pts, 0.13), dark));
      this.group.add(pivot);
      const dx = 6.70 - 1.95, dz = 3.44 - (-2.28);
      const len = Math.hypot(dx, dz);
      this.leFlaps.push({
        pivot, sign: s,
        hinge: new THREE.Vector3(s * 1.95, -0.14, -2.28),
        axis: new THREE.Vector3(s * dx / len, 0, dz / len),
      });
    }
    // flaperons inboard, ailerons outboard, both on the trailing edge
    this.flaperons = []; this.ailerons = [];
    for (const s of [-1, 1]) {
      const fl = new THREE.Group();
      fl.position.set(0, -0.15, 0);
      const flPts = [
        [s * 1.95, 5.55], [s * 4.20, 4.75], [s * 4.20, 5.65], [s * 1.95, 6.92],
      ];
      fl.add(new THREE.Mesh(slabFrom(flPts, 0.16), upper));
      this.group.add(fl);
      this.flaperons.push({ pivot: fl, sign: s, hinge: new THREE.Vector3(s * 3.0, -0.15, 5.2) });

      const al = new THREE.Group();
      al.position.set(0, -0.15, 0);
      const alPts = [
        [s * 4.25, 4.72], [s * 6.70, 3.85], [s * 6.70, 5.10], [s * 4.25, 5.62],
      ];
      al.add(new THREE.Mesh(slabFrom(alPts, 0.12), upper));
      this.group.add(al);
      this.ailerons.push({ pivot: al, sign: s, hinge: new THREE.Vector3(s * 5.4, -0.15, 4.4) });
    }

    // ---- probes and antennae ----
    const pitot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 1.1, 6), strutMat);
    pitot.rotation.x = 90 * D;
    pitot.position.set(0, 0.06, -10.0);
    this.group.add(pitot);
    for (const s of [-1, 1]) {
      const aoa = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 6), strutMat);
      aoa.rotation.z = 90 * D;
      aoa.position.set(s * 0.92, 0.12, -7.55);
      this.group.add(aoa);
    }

    // ---- landing gear ----
    this.gear = { nose: new THREE.Group(), mains: [], doors: [] };
    const wheel = (r, w) => {
      const g = new THREE.CylinderGeometry(r, r, w, 20);
      g.rotateZ(90 * D);
      return g;
    };
    {
      const g = this.gear.nose;
      g.add(new THREE.Mesh(box(-0.055, -2.05, -0.055, 0.055, 0.05, 0.055), strutMat));
      const w1 = new THREE.Mesh(wheel(0.34, 0.20), rubber);
      w1.position.set(0, -2.05, 0);
      g.add(w1);
      const hub = new THREE.Mesh(wheel(0.16, 0.22), strutMat);
      hub.position.set(0, -2.05, 0);
      g.add(hub);
      g.position.set(0, -0.72, -4.90);
      this.group.add(g);
      this.gear.noseWheel = w1;
    }
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(box(-0.07, -2.20, -0.07, 0.07, 0.05, 0.07), strutMat));
      const w1 = new THREE.Mesh(wheel(0.46, 0.28), rubber);
      w1.position.set(0, -2.20, 0);
      g.add(w1);
      const hub = new THREE.Mesh(wheel(0.20, 0.30), strutMat);
      hub.position.set(0, -2.20, 0);
      g.add(hub);
      g.position.set(s * 1.60, -0.80, 1.22);
      this.group.add(g);
      this.gear.mains.push({ group: g, wheel: w1, sign: s });
    }
    for (const spec of [
      { x: 0, z: -4.90, w: 0.52, l: 2.3, sign: 1 },
      { x: -1.60, z: 1.22, w: 0.80, l: 2.6, sign: -1 },
      { x: 1.60, z: 1.22, w: 0.80, l: 2.6, sign: 1 },
    ]) {
      const pivot = new THREE.Group();
      pivot.position.set(spec.x + spec.sign * spec.w * 0.5, -0.86, spec.z);
      const m = new THREE.Mesh(box(-spec.w, -0.03, -spec.l / 2, 0, 0.0, spec.l / 2), dark);
      m.position.x = spec.sign > 0 ? 0 : spec.w;
      pivot.add(m);
      this.group.add(pivot);
      this.gear.doors.push({ pivot, sign: spec.sign });
    }

    // ---- lights ----
    this.lights = { nav: [], strobe: [], form: [] };
    const lamp = (x, y, z, c, r = 0.085) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6),
        new THREE.MeshBasicMaterial({ color: c, transparent: true }));
      m.position.set(x, y, z);
      this.group.add(m);
      return m;
    };
    this.lights.nav.push(lamp(-6.80, -0.12, 4.30, 0xff2222));
    this.lights.nav.push(lamp(6.80, -0.12, 4.30, 0x22ff44));
    this.lights.nav.push(lamp(0, 0.40, 9.30, 0xffffff, 0.065));
    this.lights.strobe.push(lamp(-6.80, 0.00, 4.20, 0xffffff, 0.065));
    this.lights.strobe.push(lamp(6.80, 0.00, 4.20, 0xffffff, 0.065));
    for (const s of [-1, 1]) {
      this.lights.form.push(lamp(s * 2.28, 0.10, -2.20, 0x88ddff, 0.045));
      this.lights.form.push(lamp(s * 2.90, 2.30, 5.60, 0x88ddff, 0.045));
    }
    this.cockpitGlow = new THREE.PointLight(0x66ff99, 0.0, 6);
    this.cockpitGlow.position.set(0, 0.62, -4.9);
    this.group.add(this.cockpitGlow);

    // taxi/landing light in the nose gear bay
    this.taxiLight = new THREE.SpotLight(0xfff4dd, 0, 400, 22 * D, 0.5, 1.2);
    this.taxiLight.position.set(0, -1.0, -5.0);
    this.taxiTarget = new THREE.Object3D();
    this.taxiTarget.position.set(0, -2.2, -60);
    this.group.add(this.taxiLight, this.taxiTarget);
    this.taxiLight.target = this.taxiTarget;

    this._strobeT = 0;
  }

  /** Rotate a control surface about an arbitrary hinge point and axis. */
  static hingeRotate(group, hinge, axis, angle) {
    group.position.copy(hinge);
    group.rotation.set(0, 0, 0);
    group.rotateOnAxis(axis, angle);
    group.position.sub(hinge.clone().applyAxisAngle(axis, angle));
  }

  update(fm, propulsion, dt, night) {
    const s = fm.surfaces;
    const X = new THREE.Vector3(1, 0, 0);

    // flaperons and ailerons pivot about their own hinge lines
    for (const f of this.flaperons) {
      const defl = (s.elevator * 0.35 + f.sign * s.aileron * 0.5) * 22 * D;
      Aircraft.hingeRotate(f.pivot, f.hinge, X, defl);
    }
    for (const a of this.ailerons) {
      Aircraft.hingeRotate(a.pivot, a.hinge, X, a.sign * s.aileron * 25 * D);
    }
    for (const st of this.stabs) {
      st.pivot.rotation.x = (s.elevator * 22 + st.sign * s.aileron * 8) * D;
    }
    for (const r of this.rudders) {
      // the fin is canted, so its hinge is the canted axis, not world vertical
      r.pivot.rotation.set(0, 0, -r.sign * 28 * D);
      r.pivot.rotateOnAxis(new THREE.Vector3(0, 1, 0), -s.rudder * 25 * D);
    }
    const le = Math.max(0, Math.min(1, fm.alpha / (18 * D))) * 28 * D;
    for (const f of this.leFlaps) {
      Aircraft.hingeRotate(f.pivot, f.hinge, f.axis, -f.sign * le);
    }

    for (const n of this.nozzles) {
      n.pivot.rotation.x = -fm.nozzleVector;
      const open = 0.84 + 0.28 * propulsion.afterburner + 0.10 * propulsion.spool;
      n.pivot.scale.set(1, open, 1);
    }

    const g = fm.gearPos;
    const ease = g * g * (3 - 2 * g);
    this.gear.nose.rotation.x = (1 - ease) * 95 * D;
    this.gear.nose.visible = g > 0.01;
    this.gear.nose.rotation.y = fm.onGround
      ? fm.input.yaw * AC.noseWheelMaxSteer * Math.max(0, 1 - Math.hypot(fm.velocity.x, fm.velocity.z) / 45)
      : 0;
    for (const m of this.gear.mains) {
      m.group.rotation.z = m.sign * (1 - ease) * 88 * D;
      m.group.visible = g > 0.01;
    }
    const doorOpen = g > 0.99 ? 1 : Math.min(1, g * 1.6);
    for (const d of this.gear.doors) {
      d.pivot.rotation.z = d.sign * doorOpen * 92 * D;
      d.pivot.visible = g > 0.01;
    }
    if (fm.onGround) {
      const spin = Math.hypot(fm.velocity.x, fm.velocity.z) / 0.46 * dt;
      this.gear.noseWheel.rotation.x += spin;
      for (const m of this.gear.mains) m.wheel.rotation.x += spin;
    }

    this._strobeT += dt;
    const ph = this._strobeT % 1.35;
    const strobeOn = ph < 0.055 || (ph > 0.14 && ph < 0.195);
    const navOn = night || fm.onGround;
    for (const l of this.lights.nav) l.material.opacity = navOn ? 1 : 0.22;
    for (const l of this.lights.strobe) l.material.opacity = strobeOn ? 1 : 0.0;
    for (const l of this.lights.form) l.material.opacity = night ? 0.7 : 0.08;
    this.cockpitGlow.intensity = night ? 0.7 : 0.0;
    this.taxiLight.intensity = (night && fm.gearPos > 0.5) ? 9 : 0;
  }

  setVisible(v) { this.group.visible = v; }
}
