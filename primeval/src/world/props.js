// Procedural geometry for everything that grows or sits on the ground.
// All builders return a single merged, vertex-coloured BufferGeometry with an
// `aSway` attribute so the wind shader knows what may bend.

import * as THREE from 'three';
import { rng32 } from '../math/noise.js';

const ATTRS = ['position', 'normal', 'uv', 'color', 'aSway'];
const SIZES = { position: 3, normal: 3, uv: 2, color: 3, aSway: 1 };

/** Merge a list of geometries (all non-indexed or all indexed) into one. */
export function mergeGeometries(geos) {
  const present = ATTRS.filter(a => geos.every(g => g.attributes[a]));
  let vTotal = 0, iTotal = 0;
  for (const g of geos) {
    vTotal += g.attributes.position.count;
    iTotal += g.index ? g.index.count : g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  const buffers = {};
  for (const a of present) buffers[a] = new Float32Array(vTotal * SIZES[a]);
  const idx = new Uint32Array(iTotal);
  let vOff = 0, iOff = 0;
  for (const g of geos) {
    const n = g.attributes.position.count;
    for (const a of present) {
      buffers[a].set(g.attributes[a].array.subarray(0, n * SIZES[a]), vOff * SIZES[a]);
    }
    if (g.index) {
      for (let i = 0; i < g.index.count; i++) idx[iOff + i] = g.index.array[i] + vOff;
      iOff += g.index.count;
    } else {
      for (let i = 0; i < n; i++) idx[iOff + i] = vOff + i;
      iOff += n;
    }
    vOff += n;
  }
  for (const a of present) out.setAttribute(a, new THREE.BufferAttribute(buffers[a], SIZES[a]));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

/** Paint a whole geometry one colour (or blend along its height). */
export function paint(geo, colorLow, colorHigh = null) {
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const lo = new THREE.Color(colorLow);
  const hi = colorHigh ? new THREE.Color(colorHigh) : lo;
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const h = Math.max(0.0001, bb.max.y - bb.min.y);
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - bb.min.y) / h;
    col[i * 3] = lo.r + (hi.r - lo.r) * t;
    col[i * 3 + 1] = lo.g + (hi.g - lo.g) * t;
    col[i * 3 + 2] = lo.b + (hi.b - lo.b) * t;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

/** Constant sway weight across a geometry. */
export function sway(geo, value) {
  const n = geo.attributes.position.count;
  const a = new Float32Array(n);
  a.fill(value);
  geo.setAttribute('aSway', new THREE.BufferAttribute(a, 1));
  return geo;
}

/** Sway ramped from 0 at the base to `top` at the highest vertex. */
export function swayRamp(geo, top = 1, power = 1.6, from = 0) {
  const pos = geo.attributes.position;
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const h = Math.max(0.0001, bb.max.y - bb.min.y);
  const a = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const t = Math.max(0, ((pos.getY(i) - bb.min.y) / h - from) / (1 - from));
    a[i] = Math.pow(Math.max(0, t), power) * top;
  }
  geo.setAttribute('aSway', new THREE.BufferAttribute(a, 1));
  return geo;
}

function ensureUv(geo) {
  if (!geo.attributes.uv) {
    const n = geo.attributes.position.count;
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  }
  return geo;
}

function xform(geo, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = {}) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], 'YXZ'));
  m.compose(new THREE.Vector3(pos[0], pos[1], pos[2]), q, new THREE.Vector3(scale[0], scale[1], scale[2]));
  geo.applyMatrix4(m);
  return geo;
}

/** A tapered limb: cylinder from a to b with independent end radii. */
function limb(x0, y0, z0, x1, y1, z1, r0, r1, seg = 6) {
  const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
  const len = Math.hypot(dx, dy, dz) || 0.0001;
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1, true);
  g.translate(0, len / 2, 0);
  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3(dx, dy, dz).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
  g.applyQuaternion(q);
  g.translate(x0, y0, z0);
  return ensureUv(g);
}

/** A flat leaf blade: a tapering strip with a droop. */
function blade(length, width, droop, seg = 5, curveOut = 0.0) {
  const g = new THREE.PlaneGeometry(width, length, 1, seg);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) + length / 2;          // 0..length from base
    // Clamp: float32 round-off at the base row can go a hair negative, and
    // Math.pow(-1e-8, 0.62) is NaN, which quietly poisons a whole forest.
    const t = Math.min(1, Math.max(0, y / length));
    const taper = Math.sin(Math.PI * Math.pow(t, 0.62)) * 0.9 + 0.12;
    pos.setX(i, pos.getX(i) * taper);
    pos.setY(i, y - droop * t * t * length * 0.5);
    pos.setZ(i, pos.getZ(i) + t * t * curveOut * length);
  }
  g.computeVertexNormals();
  return ensureUv(g);
}

// ---------------------------------------------------------------------------
// Species builders. Each takes a seed so a forest is not full of clones.
// ---------------------------------------------------------------------------

/** CANOPY GIANT — the tall buttressed tree that closes the jungle overhead. */
export function canopyTree(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (16 + r() * 13) * scale;
  const trunkR = (0.42 + r() * 0.26) * scale;
  const bark = new THREE.Color(0.115, 0.086, 0.062);
  const barkTop = new THREE.Color(0.19, 0.155, 0.11);

  // Buttress roots flaring at the base.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + r();
    const g = limb(Math.cos(a) * trunkR * 2.6, 0, Math.sin(a) * trunkR * 2.6,
      Math.cos(a) * trunkR * 0.4, H * 0.19, Math.sin(a) * trunkR * 0.4,
      trunkR * 0.62, trunkR * 0.16, 5);
    parts.push(sway(paint(g, bark, bark), 0));
  }
  // Trunk in two leaning sections.
  const lean = (r() - 0.5) * 0.16 * H;
  const midY = H * 0.62;
  parts.push(sway(paint(limb(0, 0, 0, lean * 0.4, midY, lean * 0.3, trunkR, trunkR * 0.52, 8), bark, barkTop), 0));
  parts.push(swayRamp(paint(limb(lean * 0.4, midY, lean * 0.3, lean, H * 0.92, lean * 0.8, trunkR * 0.52, trunkR * 0.2, 7), barkTop, barkTop), 0.22, 2.0));

  // Crown: a few flattened lobes of foliage, the classic emergent silhouette.
  const leafA = new THREE.Color(0.055, 0.185, 0.075);
  const leafB = new THREE.Color(0.13, 0.32, 0.115);
  const lobes = 4 + Math.floor(r() * 3);
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + r() * 0.9;
    const rad = (2.4 + r() * 2.3) * scale;
    const dist = (1.3 + r() * 2.6) * scale;
    const y = H * (0.80 + r() * 0.20);
    const g = new THREE.IcosahedronGeometry(rad, 0);
    ensureUv(g);
    xform(g, {
      pos: [lean + Math.cos(a) * dist, y, lean * 0.8 + Math.sin(a) * dist],
      scale: [1.25, 0.60 + r() * 0.2, 1.25],
      rot: [0, r() * 3, 0],
    });
    parts.push(swayRamp(paint(g, leafA, leafB), 0.85, 0.6, 0.0));
    // A branch out to each lobe so the crown is not floating.
    const b = limb(lean * 0.5, H * 0.6, lean * 0.4,
      lean + Math.cos(a) * dist * 0.75, y - rad * 0.4, lean * 0.8 + Math.sin(a) * dist * 0.75,
      trunkR * 0.24, trunkR * 0.08, 4);
    parts.push(swayRamp(paint(b, bark, barkTop), 0.3, 1.4));
  }
  return mergeGeometries(parts);
}

/** TREE FERN — the mid-storey umbrella you actually walk under. */
export function treeFern(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (3.2 + r() * 2.8) * scale;
  const stemR = 0.13 * scale;
  parts.push(swayRamp(paint(limb(0, 0, 0, (r() - 0.5) * 0.5, H, (r() - 0.5) * 0.5, stemR * 1.5, stemR * 0.8, 6),
    new THREE.Color(0.15, 0.115, 0.078), new THREE.Color(0.20, 0.16, 0.10)), 0.35, 1.8));
  const fronds = 7 + Math.floor(r() * 4);
  const leafA = new THREE.Color(0.09, 0.27, 0.10);
  const leafB = new THREE.Color(0.22, 0.44, 0.15);
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + r() * 0.4;
    const len = (2.0 + r() * 1.3) * scale;
    const g = blade(len, 0.62 * scale, 0.75 + r() * 0.4, 6, 0.05);
    xform(g, { rot: [-1.15 - r() * 0.35, a, 0], pos: [0, H, 0] });
    parts.push(swayRamp(paint(g, leafA, leafB), 1.0, 0.9));
  }
  return mergeGeometries(parts);
}

/** GIANT FERN — ground-level, shoulder height, everywhere in the wet lowlands. */
export function giantFern(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const fronds = 6 + Math.floor(r() * 5);
  const leafA = new THREE.Color(0.07, 0.22, 0.085);
  const leafB = new THREE.Color(0.20, 0.42, 0.14);
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + r() * 0.6;
    const len = (0.95 + r() * 0.8) * scale;
    const g = blade(len, 0.28 * scale, 0.55 + r() * 0.5, 5, 0.12);
    xform(g, { rot: [-0.75 - r() * 0.5, a, 0], pos: [0, 0.09 * scale, 0] });
    parts.push(swayRamp(paint(g, leafA, leafB), 1.1, 0.85));
  }
  return mergeGeometries(parts);
}

/** CYCAD PALM — stiff crown on a squat scaly trunk. Plains and coast. */
export function cycad(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (1.4 + r() * 1.8) * scale;
  parts.push(swayRamp(paint(limb(0, 0, 0, 0, H, 0, 0.24 * scale, 0.18 * scale, 7),
    new THREE.Color(0.17, 0.13, 0.09), new THREE.Color(0.24, 0.19, 0.12)), 0.18, 2.0));
  const fronds = 9 + Math.floor(r() * 5);
  const leafA = new THREE.Color(0.10, 0.22, 0.10);
  const leafB = new THREE.Color(0.26, 0.40, 0.16);
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + r() * 0.3;
    const len = (1.3 + r() * 0.8) * scale;
    const g = blade(len, 0.24 * scale, 0.25, 4, 0.03);
    xform(g, { rot: [-1.35 - r() * 0.25, a, 0], pos: [0, H, 0] });
    parts.push(swayRamp(paint(g, leafA, leafB), 0.75, 1.0));
  }
  return mergeGeometries(parts);
}

/** STILT TREE — mangrove-like, walks out over the swamp on prop roots. */
export function stiltTree(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (6 + r() * 5) * scale;
  const bark = new THREE.Color(0.10, 0.082, 0.065);
  const barkT = new THREE.Color(0.16, 0.14, 0.10);
  const bodyY = H * 0.34;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + r() * 0.6;
    const rad = (1.0 + r() * 0.9) * scale;
    parts.push(sway(paint(limb(Math.cos(a) * rad, 0, Math.sin(a) * rad, 0, bodyY, 0,
      0.10 * scale, 0.13 * scale, 5), bark, bark), 0));
  }
  parts.push(swayRamp(paint(limb(0, bodyY, 0, (r() - 0.5), H, (r() - 0.5), 0.30 * scale, 0.13 * scale, 7), bark, barkT), 0.25, 2.0));
  const leafA = new THREE.Color(0.055, 0.16, 0.085);
  const leafB = new THREE.Color(0.11, 0.27, 0.12);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + r();
    const g = new THREE.IcosahedronGeometry((1.5 + r() * 1.1) * scale, 0);
    ensureUv(g);
    xform(g, { pos: [Math.cos(a) * 1.3 * scale, H * (0.86 + r() * 0.16), Math.sin(a) * 1.3 * scale], scale: [1.2, 0.62, 1.2] });
    parts.push(swayRamp(paint(g, leafA, leafB), 0.7, 0.7));
  }
  return mergeGeometries(parts);
}

/** SPIRE CONIFER — highland tree, dark and narrow. */
export function spireTree(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (7 + r() * 6) * scale;
  parts.push(sway(paint(limb(0, 0, 0, 0, H, 0, 0.26 * scale, 0.06 * scale, 6),
    new THREE.Color(0.10, 0.078, 0.062), new THREE.Color(0.14, 0.11, 0.085)), 0));
  const tiers = 5 + Math.floor(r() * 3);
  const leafA = new THREE.Color(0.045, 0.115, 0.078);
  const leafB = new THREE.Color(0.09, 0.20, 0.12);
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const y = H * (0.22 + t * 0.74);
    const rad = (2.1 - t * 1.55) * scale * (0.8 + r() * 0.4);
    const g = new THREE.ConeGeometry(rad, (2.4 - t * 1.2) * scale, 7, 1);
    ensureUv(g);
    g.translate(0, y, 0);
    parts.push(swayRamp(paint(g, leafA, leafB), 0.45, 1.2));
  }
  return mergeGeometries(parts);
}

/** CHARRED SNAG — dead trunk in the ash fields, or after a fire. */
export function snag(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (3 + r() * 5) * scale;
  const c = new THREE.Color(0.055, 0.048, 0.046);
  const c2 = new THREE.Color(0.12, 0.10, 0.095);
  parts.push(sway(paint(limb(0, 0, 0, (r() - 0.5) * 0.9, H, (r() - 0.5) * 0.9, 0.30 * scale, 0.09 * scale, 6), c, c2), 0));
  const arms = 1 + Math.floor(r() * 3);
  for (let i = 0; i < arms; i++) {
    const a = r() * Math.PI * 2, y = H * (0.35 + r() * 0.5);
    parts.push(sway(paint(limb(0, y, 0, Math.cos(a) * (1 + r()) * scale, y + (r() - 0.2) * 1.6 * scale, Math.sin(a) * (1 + r()) * scale,
      0.10 * scale, 0.03 * scale, 4), c, c2), 0));
  }
  return mergeGeometries(parts);
}

/** BERRY BUSH — the reason you are still alive. Berries are separate geometry. */
export function berryBush(seed = 1, scale = 1, withBerries = true) {
  const r = rng32(seed);
  const parts = [];
  const leafA = new THREE.Color(0.075, 0.19, 0.095);
  const leafB = new THREE.Color(0.17, 0.31, 0.13);
  const lobes = 3 + Math.floor(r() * 3);
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + r();
    const rad = (0.42 + r() * 0.30) * scale;
    const g = new THREE.IcosahedronGeometry(rad, 0);
    ensureUv(g);
    xform(g, { pos: [Math.cos(a) * 0.28 * scale, rad * 0.85, Math.sin(a) * 0.28 * scale], scale: [1.1, 0.85, 1.1] });
    parts.push(swayRamp(paint(g, leafA, leafB), 0.6, 0.8));
  }
  if (withBerries) {
    const berry = new THREE.Color(0.34, 0.045, 0.16);
    const glow = new THREE.Color(0.62, 0.14, 0.30);
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, rr = (0.30 + r() * 0.36) * scale;
      const g = new THREE.IcosahedronGeometry(0.05 * scale, 0);
      ensureUv(g);
      g.translate(Math.cos(a) * rr, (0.32 + r() * 0.62) * scale, Math.sin(a) * rr);
      parts.push(swayRamp(paint(g, berry, glow), 0.6, 0.8));
    }
  }
  return mergeGeometries(parts);
}

/** BLADE GRASS — a clump of crossed strips. Cheap, and there are thousands. */
export function grassClump(seed = 1, scale = 1, tall = false) {
  const r = rng32(seed);
  const parts = [];
  const n = tall ? 6 : 4;
  const lo = new THREE.Color(0.115, 0.155, 0.055);
  const hi = new THREE.Color(0.32, 0.40, 0.13);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const len = (tall ? 0.62 + r() * 0.55 : 0.26 + r() * 0.30) * scale;
    const g = blade(len, (tall ? 0.13 : 0.10) * scale, 0.42 + r() * 0.4, 3, 0.08);
    xform(g, { rot: [-0.12 - r() * 0.25, a, 0], pos: [(r() - 0.5) * 0.22 * scale, 0, (r() - 0.5) * 0.22 * scale] });
    parts.push(swayRamp(paint(g, lo, hi), 1.5, 1.1));
  }
  return mergeGeometries(parts);
}

/** REEDS — swamp and riverbank. Very tall, very thin, very loud in wind. */
export function reeds(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const lo = new THREE.Color(0.14, 0.155, 0.065);
  const hi = new THREE.Color(0.38, 0.35, 0.14);
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const len = (1.4 + r() * 1.3) * scale;
    const g = blade(len, 0.055 * scale, 0.12, 3, 0.02);
    xform(g, { rot: [-0.05 - r() * 0.18, a, 0], pos: [(r() - 0.5) * 0.3 * scale, 0, (r() - 0.5) * 0.3 * scale] });
    parts.push(swayRamp(paint(g, lo, hi), 2.0, 1.2));
  }
  return mergeGeometries(parts);
}

/** GLOWCAP — bioluminescent fungus. The only friendly light in the jungle. */
export function glowcap(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const stalk = new THREE.Color(0.16, 0.17, 0.19);
  const cap = new THREE.Color(0.10, 0.85, 0.72);
  for (let i = 0; i < 3 + Math.floor(r() * 3); i++) {
    const a = r() * Math.PI * 2, d = r() * 0.28 * scale;
    const h = (0.22 + r() * 0.34) * scale;
    parts.push(sway(paint(limb(Math.cos(a) * d, 0, Math.sin(a) * d, Math.cos(a) * d, h, Math.sin(a) * d,
      0.028 * scale, 0.020 * scale, 4), stalk, stalk), 0));
    const g = new THREE.SphereGeometry(0.10 * scale * (0.7 + r() * 0.7), 7, 4, 0, Math.PI * 2, 0, Math.PI * 0.55);
    ensureUv(g);
    g.translate(Math.cos(a) * d, h, Math.sin(a) * d);
    parts.push(sway(paint(g, cap, cap), 0));
  }
  return mergeGeometries(parts);
}

/** BOULDER — irregular rock, used everywhere from beaches to lava fields. */
export function boulder(seed = 1, scale = 1) {
  const r = rng32(seed);
  const g = new THREE.IcosahedronGeometry(scale, 1);
  ensureUv(g);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const k = 0.72 + r() * 0.56;
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * 0.78, pos.getZ(i) * k);
  }
  g.computeVertexNormals();
  g.translate(0, scale * 0.42, 0);
  return sway(paint(g, new THREE.Color(0.13, 0.125, 0.12), new THREE.Color(0.30, 0.29, 0.275)), 0);
}

/** OBSIDIAN SHARD — volcanic country. Sharp, black, faintly glassy. */
export function obsidian(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  for (let i = 0; i < 2 + Math.floor(r() * 3); i++) {
    const g = new THREE.ConeGeometry(scale * (0.18 + r() * 0.22), scale * (0.9 + r() * 1.5), 5, 1);
    ensureUv(g);
    xform(g, {
      pos: [(r() - 0.5) * scale, scale * 0.5, (r() - 0.5) * scale],
      rot: [(r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5],
    });
    parts.push(sway(paint(g, new THREE.Color(0.028, 0.026, 0.035), new THREE.Color(0.13, 0.10, 0.17)), 0));
  }
  return mergeGeometries(parts);
}

/** DRIFT LOG — beaches and riverbanks. */
export function driftwood(seed = 1, scale = 1) {
  const r = rng32(seed);
  const g = limb(-scale, 0.16 * scale, 0, scale * (0.7 + r() * 0.5), 0.20 * scale, (r() - 0.5) * scale,
    0.19 * scale, 0.13 * scale, 6);
  return sway(paint(g, new THREE.Color(0.22, 0.20, 0.17), new THREE.Color(0.34, 0.32, 0.29)), 0);
}
