// The HALBERD: a single-stage surface-to-orbit lifter, built out of lofted
// cross-sections rather than boxes, because the silhouette is the whole point.
//
// Ship-local axes: -Z is forward, +Y is up, +X is starboard.

import * as THREE from 'three';
import { lerp, clamp } from '../math/noise.js';

// --- a tiny mesh toolkit ---------------------------------------------------

export class Hull {
  constructor() { this.p = []; this.c = []; this.e = []; this.i = []; }
  get n() { return this.p.length / 3; }
  vert(x, y, z, col, emis = 0) {
    this.p.push(x, y, z);
    this.c.push(col[0], col[1], col[2]);
    this.e.push(emis);
    return this.n - 1;
  }
  tri(a, b, c) { this.i.push(a, b, c); }
  quad(a, b, c, d) { this.i.push(a, b, c, a, c, d); }

  /** Bridge two equal-length rings of vertex indices. */
  bridge(ringA, ringB, closed = true) {
    const n = ringA.length;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const j = (i + 1) % n;
      this.quad(ringA[i], ringA[j], ringB[j], ringB[i]);
    }
  }

  /** Emit a polygon ring at a station and return its indices. */
  ring(pts, z, col, emis = 0, scaleX = 1, scaleY = 1, offY = 0) {
    return pts.map(([x, y]) => this.vert(x * scaleX, y * scaleY + offY, z, col, emis));
  }

  /** A flat convex polygon (fan). */
  poly(pts3, col, emis = 0, flip = false) {
    const idx = pts3.map(p => this.vert(p[0], p[1], p[2], col, emis));
    for (let i = 1; i < idx.length - 1; i++) {
      if (flip) this.tri(idx[0], idx[i + 1], idx[i]);
      else this.tri(idx[0], idx[i], idx[i + 1]);
    }
    return idx;
  }

  /** A slab: a polygon extruded along Y. Used for wings and fins. */
  slab(outline, thickness, col, taper = 1) {
    const top = outline.map(p => this.vert(p[0], p[1] + thickness * 0.5 * taper, p[2], col));
    const bot = outline.map(p => this.vert(p[0], p[1] - thickness * 0.5, p[2], col));
    for (let i = 1; i < outline.length - 1; i++) {
      this.tri(top[0], top[i], top[i + 1]);
      this.tri(bot[0], bot[i + 1], bot[i]);
    }
    for (let i = 0; i < outline.length; i++) {
      const j = (i + 1) % outline.length;
      this.quad(top[i], top[j], bot[j], bot[i]);
    }
    return { top, bot };
  }

  /** A cylinder along Z between two stations. */
  tube(z0, z1, r0, r1, seg, col, emis = 0, cx = 0, cy = 0) {
    const a = [], b = [];
    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      a.push(this.vert(cx + Math.cos(t) * r0, cy + Math.sin(t) * r0, z0, col, emis));
      b.push(this.vert(cx + Math.cos(t) * r1, cy + Math.sin(t) * r1, z1, col, emis));
    }
    this.bridge(a, b);
    return { a, b };
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('aEmis', new THREE.Float32BufferAttribute(this.e, 1));
    g.setIndex(this.i);
    g.computeVertexNormals();
    return g;
  }
}

// --- palette ---------------------------------------------------------------
const HULL_DARK = [0.055, 0.058, 0.065];
const HULL = [0.105, 0.112, 0.122];
const HULL_LIT = [0.175, 0.185, 0.198];
const PANEL = [0.235, 0.245, 0.258];
const TRIM = [0.62, 0.30, 0.06];
const TRIM_HOT = [1.0, 0.48, 0.10];
const GLASS = [0.020, 0.032, 0.045];
const STEEL = [0.30, 0.31, 0.33];
const CYAN = [0.35, 0.85, 1.0];
const WHITEHOT = [0.86, 0.95, 1.0];

/** Chined cross-section, normalised to a unit half-width. */
const SECTION = [
  [0.00, 1.00], [0.52, 0.82], [0.88, 0.34], [1.00, -0.04],
  [0.72, -0.52], [0.30, -0.76], [-0.30, -0.76], [-0.72, -0.52],
  [-1.00, -0.04], [-0.88, 0.34], [-0.52, 0.82],
];

// Fuselage stations: [z, halfWidth, halfHeight, yOffset, colour]
const STATIONS = [
  [-10.6, 0.16, 0.13, 0.05, HULL_DARK],
  [-9.60, 0.52, 0.36, 0.02, HULL],
  [-8.20, 1.05, 0.62, 0.00, HULL],
  [-6.40, 1.62, 0.86, -0.02, HULL_LIT],
  [-4.20, 2.10, 1.02, -0.04, HULL],
  [-1.60, 2.42, 1.14, -0.04, HULL_LIT],
  [1.40, 2.46, 1.16, -0.02, HULL],
  [4.20, 2.28, 1.10, 0.02, HULL_LIT],
  [6.40, 1.98, 0.96, 0.06, HULL],
  [8.10, 1.72, 0.84, 0.08, HULL_DARK],
];

function buildFuselage(h) {
  let prev = null;
  for (const [z, sx, sy, oy, col] of STATIONS) {
    const ring = h.ring(SECTION, z, col, 0, sx, sy, oy);
    if (prev) h.bridge(prev, ring);
    prev = ring;
  }
  // Nose cap.
  const tip = h.vert(0, 0.05, -10.95, HULL_DARK);
  const first = h.ring(SECTION, -10.6, HULL_DARK, 0, 0.16, 0.13, 0.05);
  for (let i = 0; i < first.length; i++) {
    h.tri(first[i], first[(i + 1) % first.length], tip);
  }
  // Tail plate.
  const last = h.ring(SECTION, 8.10, HULL_DARK, 0, 1.72, 0.84, 0.08);
  const centre = h.vert(0, 0.08, 8.10, HULL_DARK);
  for (let i = 0; i < last.length; i++) {
    h.tri(last[(i + 1) % last.length], last[i], centre);
  }
  return h;
}

function buildWings(h) {
  // Main delta: swept, with a leading-edge root extension that blends forward.
  for (const s of [-1, 1]) {
    const outline = [
      [s * 2.10, -0.28, -5.20],   // root leading, forward on the LERX
      [s * 5.30, -0.62, 0.60],    // mid leading edge
      [s * 7.35, -0.95, 4.10],    // tip leading
      [s * 6.95, -0.98, 5.35],    // tip trailing
      [s * 3.60, -0.55, 6.60],    // trailing root
      [s * 2.20, -0.30, 5.90],
    ];
    h.slab(s > 0 ? outline : outline.slice().reverse(), 0.30, HULL, 0.6);
    // Leading-edge strake, brighter so the planform reads at distance.
    const strake = [
      [s * 1.95, -0.16, -7.40],
      [s * 3.20, -0.36, -3.20],
      [s * 2.05, -0.30, -3.60],
    ];
    h.slab(s > 0 ? strake : strake.slice().reverse(), 0.16, PANEL, 0.7);
    // Wing fence / pylon.
    const fence = [
      [s * 5.05, -0.55, 1.30], [s * 5.05, -0.55, 4.20],
      [s * 5.05, 0.28, 3.90], [s * 5.05, 0.20, 1.70],
    ];
    h.slab(s > 0 ? fence : fence.slice().reverse(), 0.09, HULL_DARK);
    // Amber identification stripe along the leading edge.
    const stripe = [
      [s * 2.30, -0.14, -5.05], [s * 5.20, -0.48, 0.62], [s * 5.05, -0.48, 1.00], [s * 2.35, -0.14, -4.60],
    ];
    h.slab(s > 0 ? stripe : stripe.slice().reverse(), 0.34, TRIM);
  }
  // Canards, high and forward.
  for (const s of [-1, 1]) {
    const c = [
      [s * 1.35, 0.42, -7.30], [s * 3.35, 0.30, -6.10],
      [s * 3.15, 0.28, -5.20], [s * 1.40, 0.40, -5.60],
    ];
    h.slab(s > 0 ? c : c.slice().reverse(), 0.16, PANEL, 0.8);
  }
  return h;
}

function buildTails(h) {
  for (const s of [-1, 1]) {
    // Canted outward twin fins.
    const fin = [
      [s * 1.90, 1.05, 4.30], [s * 3.10, 3.55, 6.10],
      [s * 3.55, 3.55, 7.10], [s * 2.05, 1.05, 7.60],
    ];
    h.slab(s > 0 ? fin : fin.slice().reverse(), 0.20, HULL);
    const tipMark = [
      [s * 3.10, 3.30, 6.16], [s * 3.50, 3.30, 7.02],
      [s * 3.54, 3.55, 7.08], [s * 3.12, 3.55, 6.10],
    ];
    h.slab(s > 0 ? tipMark : tipMark.slice().reverse(), 0.22, TRIM);
    // Ventral strake, so the tail does not look bolted on.
    const vent = [
      [s * 1.70, -0.95, 5.10], [s * 2.35, -1.95, 6.60],
      [s * 2.45, -1.95, 7.20], [s * 1.78, -0.95, 7.30],
    ];
    h.slab(s > 0 ? vent : vent.slice().reverse(), 0.16, HULL_DARK);
  }
  return h;
}

function buildEngines(h) {
  const glow = [];
  for (const s of [-1, 1]) {
    const cx = s * 1.62;
    // Nacelle: a faceted barrel with a flared bell.
    h.tube(2.4, 6.6, 1.02, 1.14, 10, HULL_LIT, 0, cx, -0.16);
    h.tube(6.6, 7.5, 1.14, 1.30, 10, PANEL, 0, cx, -0.16);
    h.tube(7.5, 8.35, 1.30, 1.05, 10, HULL_DARK, 0, cx, -0.16);
    // Cooling ribs.
    for (let i = 0; i < 5; i++) {
      const z = 3.1 + i * 0.72;
      h.tube(z, z + 0.13, 1.20, 1.20, 10, STEEL, 0, cx, -0.16);
    }
    // Throat: emissive, and the thing the player will actually look at.
    const inner = h.tube(7.9, 8.45, 0.94, 0.86, 12, [0.9, 0.35, 0.08], 0.55, cx, -0.16);
    glow.push({ cx, cy: -0.16, z: 8.45, r: 0.86 });
    const core = [];
    for (let i = 0; i < 12; i++) {
      const t = (i / 12) * Math.PI * 2;
      core.push(h.vert(cx + Math.cos(t) * 0.80, -0.16 + Math.sin(t) * 0.80, 8.45, WHITEHOT, 1.0));
    }
    const mid = h.vert(cx, -0.16, 8.62, WHITEHOT, 1.0);
    for (let i = 0; i < 12; i++) h.tri(core[i], core[(i + 1) % 12], mid);
    // Pylon tying the nacelle to the fuselage.
    const pylon = [
      [cx - s * 0.55, -0.10, 2.9], [cx - s * 0.55, -0.10, 6.4],
      [cx - s * 1.35, 0.55, 6.0], [cx - s * 1.35, 0.55, 3.3],
    ];
    h.slab(s > 0 ? pylon : pylon.slice().reverse(), 0.26, HULL);
  }
  // Two smaller upper attitude thrusters between the tails.
  for (const s of [-1, 1]) {
    h.tube(6.2, 7.4, 0.34, 0.40, 8, PANEL, 0, s * 0.62, 1.05);
    h.tube(7.4, 7.7, 0.36, 0.30, 8, [0.8, 0.4, 0.12], 0.5, s * 0.62, 1.05);
  }
  return glow;
}

function buildDetails(h) {
  // Dorsal spine and panel breaks.
  for (let i = 0; i < 7; i++) {
    const z = -6.2 + i * 2.0;
    h.slab([
      [-0.30, 1.10, z], [0.30, 1.10, z], [0.30, 1.14, z + 0.14], [-0.30, 1.14, z + 0.14],
    ], 0.10, PANEL);
  }
  // Belly heat-shield tiles, darker and slightly proud of the hull.
  for (let i = 0; i < 9; i++) {
    const z = -7.6 + i * 1.75;
    const w = 1.5 + Math.sin(i * 0.5) * 0.35;
    h.slab([
      [-w, -1.02, z], [w, -1.02, z], [w * 0.95, -1.02, z + 1.5], [-w * 0.95, -1.02, z + 1.5],
    ], 0.07, HULL_DARK);
  }
  // Intake ramps under the LERX.
  for (const s of [-1, 1]) {
    h.slab([
      [s * 1.30, -0.55, -3.10], [s * 2.30, -0.75, -3.10],
      [s * 2.30, -0.75, -0.60], [s * 1.30, -0.55, -0.60],
    ], 0.55, HULL_DARK);
    h.slab([
      [s * 1.45, -0.30, -3.05], [s * 2.20, -0.48, -3.05],
      [s * 2.20, -0.48, -2.85], [s * 1.45, -0.30, -2.85],
    ], 0.60, [0.02, 0.02, 0.025]);
  }
  // Formation lighting strips.
  for (const s of [-1, 1]) {
    h.slab([
      [s * 2.32, 0.30, -3.4], [s * 2.32, 0.30, 3.2],
      [s * 2.32, 0.42, 3.0], [s * 2.32, 0.42, -3.2],
    ], 0.05, [0.30, 0.55, 0.75], 1);
  }
  // Hull number, as a block of trim on the nose.
  h.slab([
    [-0.85, 0.55, -8.30], [0.85, 0.55, -8.30], [0.85, 0.62, -7.60], [-0.85, 0.62, -7.60],
  ], 0.06, TRIM);
  return h;
}

// --- assembled ship --------------------------------------------------------

export function buildShip() {
  const group = new THREE.Group();
  group.name = 'HALBERD';

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.52, metalness: 0.44,
    side: THREE.DoubleSide, dithering: true,
  });
  const emisU = { value: 1 };
  const heatU = { value: 0 };
  mat.userData.emis = emisU;
  mat.userData.heat = heatU;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uEmis = emisU;
    sh.uniforms.uHeat = heatU;
    sh.vertexShader = 'attribute float aEmis;\nvarying float vEmis;\nvarying vec3 vLocal;\n' + sh.vertexShader;
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n vEmis = aEmis; vLocal = position;');
    sh.fragmentShader = 'uniform float uEmis;\nuniform float uHeat;\nvarying float vEmis;\nvarying vec3 vLocal;\n' + sh.fragmentShader;
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `
      #include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(0.55, 0.82, 1.0) * vEmis * uEmis * 2.6;
      // Reentry: leading edges and the belly go orange, then white.
      if (uHeat > 0.001) {
        float lead = smoothstep(-2.0, -9.0, vLocal.z) + smoothstep(-0.3, -1.1, vLocal.y);
        lead = clamp(lead, 0.0, 1.6);
        vec3 hot = mix(vec3(1.4, 0.32, 0.04), vec3(2.6, 1.9, 1.5), clamp(uHeat - 0.55, 0.0, 1.0) * 1.6);
        totalEmissiveRadiance += hot * lead * uHeat * 1.8;
      }
    `);
  };
  mat.customProgramCacheKey = () => 'primeval-ship';

  const h = new Hull();
  buildFuselage(h);
  buildWings(h);
  buildTails(h);
  const glowRings = buildEngines(h);
  buildDetails(h);
  const body = new THREE.Mesh(h.build(), mat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // --- canopy ---------------------------------------------------------------
  const gh = new Hull();
  const canopySections = [
    [-8.10, 0.62, 0.30, 0.52], [-7.10, 0.92, 0.52, 0.60],
    [-6.00, 1.05, 0.62, 0.66], [-4.90, 1.00, 0.58, 0.70],
    [-4.10, 0.80, 0.40, 0.72],
  ];
  let prev = null;
  for (const [z, sx, sy, oy] of canopySections) {
    const ring = gh.ring(SECTION.slice(0, 5).concat(SECTION.slice(-4)), z, GLASS, 0, sx, sy, oy);
    if (prev) gh.bridge(ring, prev, false);
    prev = ring;
  }
  // Barely there. A smooth, shiny canopy mirrors the whole sky and, seen from
  // the seat, paints the entire view whatever colour the sun happens to be.
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x121a20, roughness: 0.42, metalness: 0.0,
    transparent: true, opacity: 0.42, depthWrite: false,
    side: THREE.DoubleSide, envMapIntensity: 0.5,
  });
  const canopy = new THREE.Mesh(gh.build(), glassMat);
  canopy.name = 'canopy';
  group.add(canopy);

  // --- landing gear ---------------------------------------------------------
  const gearMat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.46, metalness: 0.62, side: THREE.DoubleSide,
  });
  const gear = [];
  const makeLeg = (x, z, len, splay) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, -0.75, z);
    const lh = new Hull();
    lh.tube(0, len * 0.55, 0.15, 0.13, 8, STEEL);
    lh.tube(len * 0.5, len, 0.11, 0.10, 8, PANEL);
    // Pad.
    const padY = len;
    const pad = [];
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2;
      pad.push(lh.vert(Math.cos(t) * 0.52, padY + 0.10, Math.sin(t) * 0.52, HULL_DARK));
    }
    const padC = lh.vert(0, padY + 0.16, 0, PANEL);
    for (let i = 0; i < 8; i++) lh.tri(pad[i], pad[(i + 1) % 8], padC);
    const padB = [];
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2;
      padB.push(lh.vert(Math.cos(t) * 0.46, padY + 0.30, Math.sin(t) * 0.46, STEEL));
    }
    lh.bridge(pad, padB);
    // Drag brace.
    lh.tube(0.1, len * 0.72, 0.055, 0.05, 6, STEEL, 0, 0.24, 0);
    const leg = new THREE.Mesh(lh.build(), gearMat);
    leg.rotation.x = Math.PI;      // legs are built pointing +Y, hang them down
    leg.castShadow = true;
    pivot.add(leg);
    pivot.userData.splay = splay;
    group.add(pivot);
    gear.push(pivot);
    return pivot;
  };
  makeLeg(0, -6.2, 2.35, 0.0);
  makeLeg(-2.55, 3.0, 2.55, -0.22);
  makeLeg(2.55, 3.0, 2.55, 0.22);

  // --- boarding ramp --------------------------------------------------------
  const rampPivot = new THREE.Group();
  rampPivot.position.set(0, -0.95, 1.10);
  const rh = new Hull();
  rh.slab([[-1.05, 0, 0], [1.05, 0, 0], [1.05, 0, 3.0], [-1.05, 0, 3.0]], 0.14, HULL_LIT);
  for (let i = 0; i < 5; i++) {
    rh.slab([[-0.95, 0.09, 0.35 + i * 0.55], [0.95, 0.09, 0.35 + i * 0.55],
      [0.95, 0.09, 0.45 + i * 0.55], [-0.95, 0.09, 0.45 + i * 0.55]], 0.06, PANEL);
  }
  const ramp = new THREE.Mesh(rh.build(), mat);
  ramp.castShadow = true;
  rampPivot.add(ramp);
  rampPivot.name = 'ramp';
  group.add(rampPivot);

  // --- lights ---------------------------------------------------------------
  const landingLight = new THREE.SpotLight(0xfff2dd, 0, 130, 0.5, 0.55, 1.2);
  landingLight.position.set(0, -0.9, -7.5);
  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, -6, -14);
  group.add(landingLight, lightTarget);
  landingLight.target = lightTarget;

  const engineLight = new THREE.PointLight(0x66ccff, 0, 46, 2);
  engineLight.position.set(0, -0.2, 9.2);
  group.add(engineLight);

  // Strobes.
  const strobeGeo = new THREE.SphereGeometry(0.12, 6, 4);
  const strobeMat = new THREE.MeshBasicMaterial({ color: 0xff4030 });
  const strobeMatG = new THREE.MeshBasicMaterial({ color: 0x40ff70 });
  const strobes = [];
  for (const [x, y, z, m] of [[-7.3, -0.9, 4.1, strobeMat], [7.3, -0.9, 4.1, strobeMatG],
    [0, 1.25, 5.0, strobeMat]]) {
    const s = new THREE.Mesh(strobeGeo, m);
    s.position.set(x, y, z);
    group.add(s);
    strobes.push(s);
  }

  // --- engine plume ---------------------------------------------------------
  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0x88ddff, transparent: true, opacity: 0.0,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const plumes = [];
  for (const g of glowRings) {
    const cone = new THREE.ConeGeometry(g.r * 0.95, 7.0, 12, 1, true);
    cone.rotateX(Math.PI / 2);
    cone.translate(g.cx, g.cy, g.z + 3.4);
    const m = new THREE.Mesh(cone, plumeMat);
    m.frustumCulled = false;
    group.add(m);
    plumes.push(m);
  }

  return {
    group, body, canopy, gear, ramp: rampPivot, plumes, plumeMat,
    landingLight, engineLight, strobes, material: mat, glassMat,
    emisU, heatU,
  };
}

/** The cockpit you sit in: seat, coamings, side consoles, live displays. */
export function buildCockpit() {
  const group = new THREE.Group();
  const h = new Hull();
  // Very dark: this is an unlit interior seen against a bright sky, and any
  // lightness here reads as a white slab across the middle of the view.
  const DARK = [0.016, 0.018, 0.022];
  const PAD = [0.030, 0.032, 0.037];

  // Coaming / dash, wrapping the forward view.
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const a = lerp(-1.15, 1.15, t);
    const x0 = Math.sin(a) * 0.95, z0 = -8.05 - Math.cos(a) * 0.30;
    const x1 = Math.sin(a) * 1.10, z1 = -7.85 - Math.cos(a) * 0.34;
    h.slab([[x0, 0.22, z0], [x1, 0.22, z1], [x1, 0.22, z1 + 0.42], [x0, 0.22, z0 + 0.42]], 0.26, DARK);
  }
  // Side consoles, kept low and out of the sight line.
  for (const s of [-1, 1]) {
    h.slab([[s * 0.56, 0.10, -7.60], [s * 0.98, 0.10, -7.60],
      [s * 0.98, 0.10, -6.20], [s * 0.56, 0.10, -6.20]], 0.20, PAD);
    h.slab([[s * 0.60, 0.21, -7.50], [s * 0.94, 0.21, -7.50],
      [s * 0.94, 0.21, -6.50], [s * 0.60, 0.21, -6.50]], 0.02, [0.03, 0.10, 0.14], 1);
  }
  // Canopy frame arcs, so the view is framed rather than open.
  for (const zz of [-8.0, -7.1]) {
    for (let i = 0; i < 7; i++) {
      const a0 = (i / 7) * Math.PI, a1 = ((i + 1) / 7) * Math.PI;
      const r = 0.95;
      h.slab([
        [Math.cos(a0) * r, 0.28 + Math.sin(a0) * r * 0.62, zz],
        [Math.cos(a1) * r, 0.28 + Math.sin(a1) * r * 0.62, zz],
        [Math.cos(a1) * r * 0.94, 0.28 + Math.sin(a1) * r * 0.58, zz + 0.06],
        [Math.cos(a0) * r * 0.94, 0.28 + Math.sin(a0) * r * 0.58, zz + 0.06],
      ], 0.05, DARK);
    }
  }
  // Seat.
  h.slab([[-0.34, 0.08, -6.55], [0.34, 0.08, -6.55], [0.34, 0.08, -5.85], [-0.34, 0.08, -5.85]], 0.14, PAD);
  h.slab([[-0.34, 0.85, -5.95], [0.34, 0.85, -5.95], [0.34, 0.14, -5.80], [-0.34, 0.14, -5.80]], 0.16, PAD);
  // Rudder pedals.
  for (const s of [-1, 1]) {
    h.slab([[s * 0.10, 0.06, -7.55], [s * 0.30, 0.06, -7.55],
      [s * 0.30, 0.24, -7.35], [s * 0.10, 0.24, -7.35]], 0.06, [0.045, 0.048, 0.055]);
  }
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.85, metalness: 0.15, side: THREE.DoubleSide,
  });
  const emisU = { value: 1 };
  mat.userData.emis = emisU;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uEmis = emisU;
    sh.vertexShader = 'attribute float aEmis;\nvarying float vEmis;\n' + sh.vertexShader;
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vEmis = aEmis;');
    sh.fragmentShader = 'uniform float uEmis;\nvarying float vEmis;\n' + sh.fragmentShader;
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance += vec3(0.35,0.85,1.0) * vEmis * uEmis * 1.8;');
  };
  mat.customProgramCacheKey = () => 'primeval-cockpit';
  const mesh = new THREE.Mesh(h.build(), mat);
  group.add(mesh);

  // Three live displays. Their textures are redrawn by the flight code.
  const screens = [];
  const layout = [
    { pos: [0, 0.34, -7.72], rot: [-0.55, 0, 0], size: [0.56, 0.27] },
    { pos: [-0.70, 0.26, -7.00], rot: [-0.45, 0.5, 0], size: [0.30, 0.21] },
    { pos: [0.70, 0.26, -7.00], rot: [-0.45, -0.5, 0], size: [0.30, 0.21] },
  ];
  for (const l of layout) {
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 160;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sm = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(l.size[0], l.size[1]), sm);
    scr.position.set(...l.pos);
    scr.rotation.set(...l.rot);
    group.add(scr);
    screens.push({ canvas, ctx: canvas.getContext('2d'), tex });
  }

  return { group, screens, material: mat, emisU };
}
