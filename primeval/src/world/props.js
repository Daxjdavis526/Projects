// Procedural geometry for everything that grows or sits on the ground.
// All builders return a single merged, vertex-coloured BufferGeometry with an
// `aSway` attribute so the wind shader knows what may bend.

import * as THREE from 'three';
import { rng32 } from '../math/noise.js';
import { ATLAS } from './textures.js';

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

/**
 * Remap a geometry's existing 0..1 UVs into one cell of the foliage atlas.
 * Everything that grows shares a single texture and therefore a single draw
 * call, which is the only reason a forest of alpha-cut leaves is affordable.
 */
export function remapUV(geo, cell, repeatU = 1, repeatV = 1) {
  ensureUv(geo);
  const [x, y, w, h] = ATLAS[cell];
  const uv = geo.attributes.uv;
  const inset = 0.003;
  for (let i = 0; i < uv.count; i++) {
    const u = ((uv.getX(i) * repeatU) % 1 + 1) % 1;
    const v = ((uv.getY(i) * repeatV) % 1 + 1) % 1;
    uv.setXY(i, x + inset + u * (w - inset * 2), y + inset + v * (h - inset * 2));
  }
  uv.needsUpdate = true;
  return geo;
}

/** Point every UV at the flat white strip, so only the vertex colour shows. */
export function solidUV(geo) {
  ensureUv(geo);
  const [x, y, w, h] = ATLAS.solid;
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, x + w * 0.5, y + h * 0.5);
  uv.needsUpdate = true;
  return geo;
}

/**
 * A cluster of alpha-cut leaf cards filling a lobe. Vertex normals point out
 * from the lobe centre rather than along each card, which is what makes a
 * canopy light like a soft mass instead of a stack of flat planes.
 */
export function leafCluster(cx, cy, cz, radius, count, r, colLow, colHigh, cell = 'leaf') {
  const pos = [], nrm = [], uvs = [], cols = [], idx = [];
  const lo = new THREE.Color(colLow), hi = new THREE.Color(colHigh);
  const [ax, ay, aw, ah] = ATLAS[cell];
  const inset = 0.004;
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  const up = new THREE.Vector3(), side = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    // Distribute over the lobe surface, biased outward.
    const th = r() * Math.PI * 2;
    const ph = Math.acos(1 - 2 * r());
    const rr = radius * (0.45 + 0.55 * Math.cbrt(r()));
    const px = cx + Math.sin(ph) * Math.cos(th) * rr;
    const py = cy + Math.cos(ph) * rr * 0.72;
    const pz = cz + Math.sin(ph) * Math.sin(th) * rr;
    n.set(px - cx, (py - cy) * 1.4, pz - cz);
    if (n.lengthSq() < 1e-6) n.set(0, 1, 0);
    n.normalize();

    // A frame perpendicular to the outward normal, spun at random.
    up.set(0, 1, 0);
    if (Math.abs(n.y) > 0.94) up.set(1, 0, 0);
    side.crossVectors(up, n).normalize();
    up.crossVectors(n, side).normalize();
    const spin = r() * Math.PI * 2;
    const cs = Math.cos(spin), sn = Math.sin(spin);
    const ex = side.clone().multiplyScalar(cs).addScaledVector(up, sn);
    const ey = side.clone().multiplyScalar(-sn).addScaledVector(up, cs);
    const size = radius * (0.46 + r() * 0.34);

    const base = pos.length / 3;
    const shade = 0.55 + r() * 0.45;
    const c = lo.clone().lerp(hi, shade);
    for (const [sx, sy, u, vv] of [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, 1, 0, 1]]) {
      v.set(
        px + ex.x * sx * size + ey.x * sy * size,
        py + ex.y * sx * size + ey.y * sy * size,
        pz + ex.z * sx * size + ey.z * sy * size
      );
      pos.push(v.x, v.y, v.z);
      // Soft outward normal, tilted a little toward the card so it is not flat.
      nrm.push(n.x * 0.82 + ex.x * sx * 0.18, n.y * 0.82 + 0.20, n.z * 0.82 + ex.z * sx * 0.18);
      uvs.push(ax + inset + u * (aw - inset * 2), ay + inset + vv * (ah - inset * 2));
      cols.push(c.r, c.g, c.b);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  g.setIndex(idx);
  return g;
}

/** A single flat card: fronds, blades, reeds. */
export function card(width, height, cell, r, colLow, colHigh, bend = 0, cup = 0) {
  const g = new THREE.PlaneGeometry(width, height, cup > 0 ? 2 : 1, bend > 0 ? 4 : 1);
  g.translate(0, height / 2, 0);
  if (bend > 0 || cup > 0) {
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i) / height;
      let z = pos.getZ(i);
      // A flat card seen edge-on disappears. Curling the cross section into a
      // shallow channel — which is what a real frond does — keeps a sliver of
      // it facing you from every angle, and gives the normals somewhere to go.
      if (cup > 0) {
        const u = Math.abs(pos.getX(i)) / (width * 0.5);
        z += u * u * cup * width * 0.5;
      }
      if (bend > 0) {
        z += t * t * bend * height;
        pos.setY(i, pos.getY(i) - t * t * bend * height * 0.35);
      }
      pos.setZ(i, z);
    }
    g.computeVertexNormals();
  }
  remapUV(g, cell);
  const lo = new THREE.Color(colLow), hi = new THREE.Color(colHigh);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  const shade = 0.6 + (r ? r() : 0.5) * 0.4;
  const c = lo.clone().lerp(hi, shade);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
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
  const bark = new THREE.Color(0.55, 0.48, 0.40);
  const barkTop = new THREE.Color(0.72, 0.64, 0.53);

  // Buttress roots flaring at the base.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + r();
    const g = limb(Math.cos(a) * trunkR * 2.6, 0, Math.sin(a) * trunkR * 2.6,
      Math.cos(a) * trunkR * 0.4, H * 0.19, Math.sin(a) * trunkR * 0.4,
      trunkR * 0.62, trunkR * 0.16, 5);
    parts.push(sway(paint(remapUV(g, 'bark', 1, 2), bark, bark), 0));
  }
  const lean = (r() - 0.5) * 0.16 * H;
  const midY = H * 0.62;
  parts.push(sway(paint(remapUV(limb(0, 0, 0, lean * 0.4, midY, lean * 0.3, trunkR, trunkR * 0.52, 8), 'bark', 2, 6),
    bark, barkTop), 0));
  parts.push(swayRamp(paint(remapUV(limb(lean * 0.4, midY, lean * 0.3, lean, H * 0.92, lean * 0.8, trunkR * 0.52, trunkR * 0.2, 7), 'bark', 2, 4),
    barkTop, barkTop), 0.22, 2.0));

  // Crown: lobes of alpha-cut leaf cards.
  const leafA = '#28401a', leafB = '#7ba33c';
  const lobes = 4 + Math.floor(r() * 3);
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + r() * 0.9;
    const rad = (2.4 + r() * 2.3) * scale;
    const dist = (1.3 + r() * 2.6) * scale;
    const y = H * (0.80 + r() * 0.20);
    const cards = 16 + Math.floor(r() * 10);
    parts.push(swayRamp(leafCluster(
      lean + Math.cos(a) * dist, y, lean * 0.8 + Math.sin(a) * dist,
      rad, cards, r, leafA, leafB), 0.9, 0.6, 0.0));
    const b = limb(lean * 0.5, H * 0.6, lean * 0.4,
      lean + Math.cos(a) * dist * 0.75, y - rad * 0.4, lean * 0.8 + Math.sin(a) * dist * 0.75,
      trunkR * 0.24, trunkR * 0.08, 4);
    parts.push(swayRamp(paint(remapUV(b, 'bark', 1, 3), bark, barkTop), 0.3, 1.4));
  }
  return mergeGeometries(parts);
}

/** TREE FERN — the mid-storey umbrella you actually walk under. */
export function treeFern(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (3.2 + r() * 2.8) * scale;
  const stemR = 0.13 * scale;
  parts.push(swayRamp(paint(remapUV(limb(0, 0, 0, (r() - 0.5) * 0.5, H, (r() - 0.5) * 0.5, stemR * 1.5, stemR * 0.8, 6), 'bark', 1, 5),
    new THREE.Color(0.42, 0.34, 0.24), new THREE.Color(0.58, 0.48, 0.33)), 0.35, 1.8));
  const fronds = 10 + Math.floor(r() * 5);
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + r() * 0.4;
    const len = (2.2 + r() * 1.4) * scale;
    const g = card(len * 0.34, len, 'frond', r, '#365a24', '#8fc04c', 0.42, 0.62);
    xform(g, { rot: [-0.92 - r() * 0.40, a, 0], pos: [0, H, 0] });
    parts.push(swayRamp(g, 1.0, 0.9));
  }
  return mergeGeometries(parts);
}

/** GIANT FERN — ground level, shoulder height, everywhere in the wet lowlands. */
export function giantFern(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const fronds = 8 + Math.floor(r() * 5);
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + r() * 0.6;
    const len = (0.82 + r() * 0.62) * scale;
    const g = card(len * 0.34, len, 'frond', r, '#2b4a1e', '#7cad42', 0.5, 0.66);
    xform(g, { rot: [-0.68 - r() * 0.55, a, 0], pos: [0, 0.06 * scale, 0] });
    parts.push(swayRamp(g, 1.1, 0.85));
  }
  return mergeGeometries(parts);
}

/** CYCAD PALM — stiff crown on a squat scaly trunk. Plains and coast. */
export function cycad(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (1.4 + r() * 1.8) * scale;
  parts.push(swayRamp(paint(remapUV(limb(0, 0, 0, 0, H, 0, 0.24 * scale, 0.18 * scale, 7), 'bark', 1, 4),
    new THREE.Color(0.40, 0.33, 0.22), new THREE.Color(0.55, 0.46, 0.30)), 0.18, 2.0));
  const fronds = 15 + Math.floor(r() * 7);
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + r() * 0.3;
    const len = (1.6 + r() * 1.0) * scale;
    // Wide, cupped and lifted well off the horizontal: at eye level you look
    // up at a cycad crown, so near-flat fronds present nothing at all.
    const g = card(len * 0.36, len, 'frond', r, '#3f5c24', '#9cc052', 0.30, 0.56);
    xform(g, { rot: [-0.72 - r() * 0.42, a, 0], pos: [0, H * 0.97, 0] });
    parts.push(swayRamp(g, 0.75, 1.0));
  }
  return mergeGeometries(parts);
}

/** STILT TREE — mangrove-like, walks out over the swamp on prop roots. */
export function stiltTree(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (6 + r() * 5) * scale;
  const bark = new THREE.Color(0.38, 0.32, 0.25);
  const barkT = new THREE.Color(0.52, 0.45, 0.34);
  const bodyY = H * 0.34;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + r() * 0.6;
    const rad = (1.0 + r() * 0.9) * scale;
    parts.push(sway(paint(remapUV(limb(Math.cos(a) * rad, 0, Math.sin(a) * rad, 0, bodyY, 0,
      0.10 * scale, 0.13 * scale, 5), 'bark', 1, 3), bark, bark), 0));
  }
  parts.push(swayRamp(paint(remapUV(limb(0, bodyY, 0, (r() - 0.5), H, (r() - 0.5), 0.30 * scale, 0.13 * scale, 7), 'bark', 1, 4),
    bark, barkT), 0.25, 2.0));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + r();
    parts.push(swayRamp(leafCluster(
      Math.cos(a) * 1.3 * scale, H * (0.86 + r() * 0.16), Math.sin(a) * 1.3 * scale,
      (1.5 + r() * 1.0) * scale, 14 + Math.floor(r() * 6), r, '#1c3315', '#5c8830'), 0.7, 0.7));
  }
  return mergeGeometries(parts);
}

/** SPIRE CONIFER — highland tree, dark and narrow. */
export function spireTree(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (7 + r() * 6) * scale;
  parts.push(sway(paint(remapUV(limb(0, 0, 0, 0, H, 0, 0.26 * scale, 0.06 * scale, 6), 'bark', 1, 6),
    new THREE.Color(0.34, 0.28, 0.22), new THREE.Color(0.44, 0.37, 0.29)), 0));
  const tiers = 5 + Math.floor(r() * 3);
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const y = H * (0.22 + t * 0.74);
    const rad = (2.0 - t * 1.45) * scale * (0.8 + r() * 0.4);
    parts.push(swayRamp(leafCluster(0, y, 0, rad, 10 + Math.floor((1 - t) * 10), r,
      '#152a1c', '#3f6b34'), 0.45, 1.2));
  }
  return mergeGeometries(parts);
}

/** CHARRED SNAG — dead trunk in the ash fields, or after a fire. */
export function snag(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const H = (3 + r() * 5) * scale;
  const c = new THREE.Color(0.16, 0.14, 0.13);
  const c2 = new THREE.Color(0.30, 0.27, 0.25);
  parts.push(sway(paint(remapUV(limb(0, 0, 0, (r() - 0.5) * 0.9, H, (r() - 0.5) * 0.9, 0.30 * scale, 0.09 * scale, 6), 'bark', 1, 4), c, c2), 0));
  const arms = 1 + Math.floor(r() * 3);
  for (let i = 0; i < arms; i++) {
    const a = r() * Math.PI * 2, y = H * (0.35 + r() * 0.5);
    parts.push(sway(paint(remapUV(limb(0, y, 0, Math.cos(a) * (1 + r()) * scale, y + (r() - 0.2) * 1.6 * scale, Math.sin(a) * (1 + r()) * scale,
      0.10 * scale, 0.03 * scale, 4), 'bark', 1, 2), c, c2), 0));
  }
  return mergeGeometries(parts);
}

/** BERRY BUSH — the reason you are still alive. */
export function berryBush(seed = 1, scale = 1, withBerries = true) {
  const r = rng32(seed);
  const parts = [];
  const lobes = 3 + Math.floor(r() * 3);
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + r();
    const rad = (0.44 + r() * 0.32) * scale;
    parts.push(swayRamp(leafCluster(
      Math.cos(a) * 0.28 * scale, rad * 0.85, Math.sin(a) * 0.28 * scale,
      rad, 9 + Math.floor(r() * 5), r, '#20381a', '#6a9433'), 0.6, 0.8));
  }
  if (withBerries) {
    const berry = new THREE.Color(0.34, 0.045, 0.16);
    const glow = new THREE.Color(0.62, 0.14, 0.30);
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, rr = (0.30 + r() * 0.36) * scale;
      const g = new THREE.IcosahedronGeometry(0.05 * scale, 0);
      solidUV(g);
      g.translate(Math.cos(a) * rr, (0.32 + r() * 0.62) * scale, Math.sin(a) * rr);
      parts.push(swayRamp(paint(g, berry, glow), 0.6, 0.8));
    }
  }
  return mergeGeometries(parts);
}

/** BLADE GRASS — crossed cards. Cheap, and there are thousands. */
export function grassClump(seed = 1, scale = 1, tall = false) {
  const r = rng32(seed);
  const parts = [];
  // Four or five crossed cards, not two: at one clump per eight square metres
  // a two-card tuft is invisible from standing height.
  const n = tall ? 5 : 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI + r() * 0.5;
    const h = (tall ? 0.70 + r() * 0.62 : 0.38 + r() * 0.34) * scale;
    const g = card(h * 1.45, h, 'grass', r, '#243c12', '#7d9c34', 0.06);
    xform(g, { rot: [0, a, 0], pos: [(r() - 0.5) * 0.14 * scale, 0, (r() - 0.5) * 0.14 * scale] });
    parts.push(swayRamp(g, 1.5, 1.1));
  }
  return mergeGeometries(parts);
}

/** REEDS — swamp and riverbank. Tall, thin, loud in wind. */
export function reeds(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI + r() * 0.6;
    const h = (1.5 + r() * 1.2) * scale;
    const g = card(h * 0.34, h, 'grass', r, '#33421a', '#93a03c', 0.04);
    xform(g, { rot: [0, a, 0], pos: [(r() - 0.5) * 0.24 * scale, 0, (r() - 0.5) * 0.24 * scale] });
    parts.push(swayRamp(g, 2.0, 1.2));
  }
  return mergeGeometries(parts);
}

/** GLOWCAP — bioluminescent fungus. The only friendly light in the jungle. */
export function glowcap(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  const stalk = new THREE.Color(0.30, 0.31, 0.34);
  const cap = new THREE.Color(0.10, 0.85, 0.72);
  for (let i = 0; i < 3 + Math.floor(r() * 3); i++) {
    const a = r() * Math.PI * 2, d = r() * 0.28 * scale;
    const h = (0.22 + r() * 0.34) * scale;
    parts.push(sway(paint(solidUV(limb(Math.cos(a) * d, 0, Math.sin(a) * d, Math.cos(a) * d, h, Math.sin(a) * d,
      0.028 * scale, 0.020 * scale, 4)), stalk, stalk), 0));
    const g = new THREE.SphereGeometry(0.10 * scale * (0.7 + r() * 0.7), 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55);
    solidUV(g);
    g.translate(Math.cos(a) * d, h, Math.sin(a) * d);
    parts.push(sway(paint(g, cap, cap), 0));
  }
  return mergeGeometries(parts);
}

/** BOULDER — irregular rock, used everywhere from beaches to lava fields. */
export function boulder(seed = 1, scale = 1) {
  const r = rng32(seed);
  const g = new THREE.IcosahedronGeometry(scale, 1);
  solidUV(g);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const k = 0.72 + r() * 0.56;
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * 0.78, pos.getZ(i) * k);
  }
  g.computeVertexNormals();
  g.translate(0, scale * 0.42, 0);
  return sway(paint(g, new THREE.Color(0.30, 0.29, 0.275), new THREE.Color(0.62, 0.60, 0.57)), 0);
}

/** OBSIDIAN SHARD — volcanic country. Sharp, black, faintly glassy. */
export function obsidian(seed = 1, scale = 1) {
  const r = rng32(seed);
  const parts = [];
  for (let i = 0; i < 2 + Math.floor(r() * 3); i++) {
    const g = new THREE.ConeGeometry(scale * (0.18 + r() * 0.22), scale * (0.9 + r() * 1.5), 5, 1);
    solidUV(g);
    xform(g, {
      pos: [(r() - 0.5) * scale, scale * 0.5, (r() - 0.5) * scale],
      rot: [(r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5],
    });
    parts.push(sway(paint(g, new THREE.Color(0.05, 0.048, 0.062), new THREE.Color(0.24, 0.19, 0.31)), 0));
  }
  return mergeGeometries(parts);
}

/** DRIFT LOG — beaches and riverbanks. */
export function driftwood(seed = 1, scale = 1) {
  const r = rng32(seed);
  const g = limb(-scale, 0.16 * scale, 0, scale * (0.7 + r() * 0.5), 0.20 * scale, (r() - 0.5) * scale,
    0.19 * scale, 0.13 * scale, 6);
  return sway(paint(remapUV(g, 'bark', 1, 2), new THREE.Color(0.48, 0.45, 0.40), new THREE.Color(0.68, 0.65, 0.60)), 0);
}
