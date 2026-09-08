// Builds a rigged animal out of numbers.
//
// Every creature on THERA is one SkinnedMesh with a procedurally generated
// skeleton: a spine running tail-tip to skull, a neck, a jaw, and two or four
// legs. One draw call each, and the bones give real bending instead of the
// segmented-toy look you get from parenting boxes together.
//
// Local space: +Z is forward, +Y is up.

import * as THREE from 'three';
import { rng32, clamp, lerp, smoothstep } from '../math/noise.js';

const RING = 8;                 // vertices around the trunk

// ---------------------------------------------------------------------------
// small geometry helpers writing into flat arrays
// ---------------------------------------------------------------------------

class MeshBuilder {
  constructor() {
    this.pos = []; this.nrm = []; this.col = [];
    this.si = []; this.sw = []; this.glow = [];
    this.idx = [];
  }
  get count() { return this.pos.length / 3; }

  vert(x, y, z, nx, ny, nz, r, g, b, bone0, w0, bone1 = 0, w1 = 0, glow = 0) {
    this.pos.push(x, y, z);
    this.nrm.push(nx, ny, nz);
    this.col.push(r, g, b);
    this.si.push(bone0, bone1, 0, 0);
    this.sw.push(w0, w1, 0, 0);
    this.glow.push(glow);
  }
  quad(a, b, c, d) { this.idx.push(a, b, c, a, c, d); }
  tri(a, b, c) { this.idx.push(a, b, c); }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(this.sw, 4));
    g.setAttribute('aGlow', new THREE.Float32BufferAttribute(this.glow, 1));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    return g;
  }
}

const _n = new THREE.Vector3();

/**
 * Emit a closed ring of vertices around a point on the trunk.
 * `rx`/`ry` are the half-width and half-height; `flat` squashes the belly.
 */
function emitRing(mb, cx, cy, cz, rx, ry, colorFn, bone0, w0, bone1, w1, flat = 0) {
  const start = mb.count;
  for (let i = 0; i < RING; i++) {
    const a = (i / RING) * Math.PI * 2;
    let sx = Math.cos(a), sy = Math.sin(a);
    if (flat > 0 && sy < 0) sy *= 1 - flat;         // flatter underside
    const x = cx + sx * rx, y = cy + sy * ry, z = cz;
    _n.set(sx / Math.max(0.001, rx), sy / Math.max(0.001, ry), 0).normalize();
    const c = colorFn(sy, cz, x, y);
    mb.vert(x, y, z, _n.x, _n.y, _n.z, c[0], c[1], c[2], bone0, w0, bone1, w1);
  }
  return start;
}

function bridgeRings(mb, a, b) {
  for (let i = 0; i < RING; i++) {
    const j = (i + 1) % RING;
    mb.quad(a + i, a + j, b + j, b + i);
  }
}

function capRing(mb, ring, cx, cy, cz, colorFn, bone, forward = true) {
  const c = colorFn(0, cz, cx, cy);
  const tip = mb.count;
  mb.vert(cx, cy, cz, 0, 0, forward ? 1 : -1, c[0], c[1], c[2], bone, 1);
  for (let i = 0; i < RING; i++) {
    const j = (i + 1) % RING;
    if (forward) mb.tri(ring + i, ring + j, tip);
    else mb.tri(ring + j, ring + i, tip);
  }
}

/** A tapered tube between two points, rigidly bound to one bone. */
function emitLimb(mb, from, to, r0, r1, color, bone, seg = 4, sides = 6) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length() || 0.001;
  dir.divideScalar(len);
  const up = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const sideV = new THREE.Vector3().crossVectors(up, dir).normalize();
  const upV = new THREE.Vector3().crossVectors(dir, sideV).normalize();
  let prev = -1;
  for (let s = 0; s <= seg; s++) {
    const t = s / seg;
    const r = lerp(r0, r1, t);
    const cx = from.x + dir.x * len * t, cy = from.y + dir.y * len * t, cz = from.z + dir.z * len * t;
    const start = mb.count;
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const ox = Math.cos(a) * r, oy = Math.sin(a) * r;
      const x = cx + sideV.x * ox + upV.x * oy;
      const y = cy + sideV.y * ox + upV.y * oy;
      const z = cz + sideV.z * ox + upV.z * oy;
      _n.set(sideV.x * ox + upV.x * oy, sideV.y * ox + upV.y * oy, sideV.z * ox + upV.z * oy).normalize();
      const shade = 0.82 + 0.18 * (oy / Math.max(0.001, r) * 0.5 + 0.5);
      mb.vert(x, y, z, _n.x, _n.y, _n.z, color[0] * shade, color[1] * shade, color[2] * shade, bone, 1);
    }
    if (prev >= 0) {
      for (let i = 0; i < sides; i++) {
        const j = (i + 1) % sides;
        mb.quad(prev + i, prev + j, start + j, start + i);
      }
    }
    prev = start;
  }
  return prev;
}

/** A flat plate/spike/fin, bound to one bone. */
function emitPlate(mb, base, tip, width, color, bone, axis = 'x') {
  const start = mb.count;
  const wx = axis === 'x' ? width : 0, wz = axis === 'x' ? 0 : width;
  mb.vert(base.x - wx, base.y, base.z - wz, 0, 0, 1, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, bone, 1);
  mb.vert(base.x + wx, base.y, base.z + wz, 0, 0, 1, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, bone, 1);
  mb.vert(tip.x, tip.y, tip.z, 0, 0, 1, color[0], color[1], color[2], bone, 1);
  mb.tri(start, start + 1, start + 2);
  mb.tri(start + 2, start + 1, start);
  return start;
}

// ---------------------------------------------------------------------------
// the builder
// ---------------------------------------------------------------------------

/**
 * @returns { geometry, bones, rig } — rig holds named handles into `bones`.
 */
export function buildCreature(spec, seed = 1, bonesOnly = false) {
  const r = rng32(seed);
  const S = spec.scale ?? 1;
  const mb = new MeshBuilder();
  const bones = [];
  // Skin vertices live in mesh space, so every bone records where it rests.
  // There are no rotations in the bind pose, so world = sum of ancestors.
  const bone = (name, x, y, z, parent) => {
    const b = new THREE.Bone();
    b.name = name;
    b.position.set(x, y, z);
    if (parent) parent.add(b);
    const pw = parent ? parent.userData.world : new THREE.Vector3();
    b.userData.world = new THREE.Vector3(pw.x + x, pw.y + y, pw.z + z);
    b.userData.index = bones.length;
    bones.push(b);
    return b;
  };

  const hipH = spec.hipHeight * S;
  const shoulderH = (spec.shoulderHeight ?? spec.hipHeight) * S;
  const bodyLen = spec.bodyLength * S;
  const bodyR = spec.bodyRadius * S;
  const bodyD = (spec.bodyDepth ?? spec.bodyRadius * 1.15) * S;

  // --- colours -------------------------------------------------------------
  const cBack = new THREE.Color(spec.colors.back);
  const cSide = new THREE.Color(spec.colors.side);
  const cBelly = new THREE.Color(spec.colors.belly);
  const cAccent = new THREE.Color(spec.colors.accent ?? spec.colors.back);
  const pattern = spec.pattern ?? 'countershade';
  const hueJitter = (r() - 0.5) * 0.06;

  /** sy: -1 belly .. +1 back. cz: position along the body. */
  const colorFn = (sy, cz) => {
    const t = clamp(sy * 0.5 + 0.5, 0, 1);
    const c = new THREE.Color().copy(cBelly).lerp(cSide, smoothstep(0.05, 0.55, t)).lerp(cBack, smoothstep(0.5, 1.0, t));
    // Stripe and spot frequency is per-species: one band across a Dartleg is
    // a marking, one band across a Crestwail is a paint job.
    const pf = (spec.patternFreq ?? 4) / Math.max(0.4, S);
    if (pattern === 'stripes') {
      const k = Math.sin(cz * pf + 0.7) * 0.5 + 0.5;
      c.lerp(cAccent, smoothstep(0.68, 0.97, k) * smoothstep(0.25, 0.72, t) * 0.7);
    } else if (pattern === 'spots') {
      const k = Math.sin(cz * pf * 1.4) * Math.cos(sy * 7.3 + cz * pf * 0.6);
      c.lerp(cAccent, smoothstep(0.45, 0.85, k) * 0.7);
    } else if (pattern === 'dorsal') {
      c.lerp(cAccent, smoothstep(0.86, 1.0, t) * 0.8);
    }
    c.offsetHSL(hueJitter, 0, (r() - 0.5) * 0.012);
    return [c.r, c.g, c.b];
  };

  // --- skeleton ------------------------------------------------------------
  const root = bone('root', 0, 0, 0, null);
  const hips = bone('hips', 0, hipH, 0, root);

  const spineCount = spec.spineCount ?? 3;
  const spine = [];
  let parent = hips;
  for (let i = 0; i < spineCount; i++) {
    const t = (i + 1) / spineCount;
    const dz = bodyLen / spineCount;
    const dy = (shoulderH - hipH) / spineCount;
    const b = bone(`spine${i}`, 0, dy, dz, parent);
    spine.push(b); parent = b;
  }
  const chest = spine[spine.length - 1] || hips;

  const neckSpec = spec.neck;
  const neck = [];
  parent = chest;
  for (let i = 0; i < neckSpec.count; i++) {
    const dz = (neckSpec.length * S) / neckSpec.count;
    const rise = Math.sin((neckSpec.rise ?? 0.5) * Math.PI * 0.5) * dz;
    const b = bone(`neck${i}`, 0, i === 0 ? rise * 1.2 : rise, dz * 0.86, parent);
    neck.push(b); parent = b;
  }
  // Put the skull's pivot exactly where the neck skin ends. Deriving it from
  // the same expression the skin uses is the only way to guarantee the head is
  // attached to the animal.
  const neckEndY = shoulderH + Math.sin((neckSpec.rise ?? 0.5) * Math.PI * 0.5) * neckSpec.length * S;
  const neckEndZ = bodyLen + neckSpec.length * S * 0.86;
  const neckParentW = parent.userData.world;
  const headBone = bone('head', 0, neckEndY - neckParentW.y, neckEndZ - neckParentW.z, parent);
  const jawBone = bone('jaw', 0, -(spec.head.height ?? 0.3) * S * 0.32, (spec.head.length ?? 0.6) * S * 0.12, headBone);

  const tailSpec = spec.tail;
  const tail = [];
  parent = hips;
  for (let i = 0; i < tailSpec.count; i++) {
    const dz = -(tailSpec.length * S) / tailSpec.count;
    const droop = -(tailSpec.droop ?? 0.1) * S * (i / tailSpec.count);
    const b = bone(`tail${i}`, 0, i === 0 ? 0 : droop, dz, parent);
    tail.push(b); parent = b;
  }

  // Legs. Rear pair always; front pair only for quadrupeds.
  const L = spec.legs;
  const legs = [];
  const makeLeg = (side, front) => {
    const spread = (front ? (L.frontSpread ?? L.spread) : L.spread) * S;
    const attach = front ? chest : hips;
    const attachY = (front ? shoulderH : hipH);
    // Posture: `bend` runs 0 (columnar, sauropod) to 1 (deeply folded,
    // theropod). The femur goes forward, the tibia back, the metatarsus
    // forward again — the zigzag that makes a dinosaur leg read as one.
    const bend = (front ? (L.frontBend ?? L.bend ?? 0.5) : (L.bend ?? 0.5));
    const fa = bend * 0.44, ta = -bend * 0.54, ma = bend * 0.62;
    // outAngle swings the whole limb away from vertical, toward horizontal.
    // Legs use 0; a pterosaur's wings use most of a right angle.
    const oa = front ? (L.frontOut ?? 0) : (L.out ?? 0);
    const co = Math.cos(oa), so = Math.sin(oa) * side;
    let thighL = (front ? (L.frontThigh ?? L.thigh) : L.thigh) * S;
    let shinL = (front ? (L.frontShin ?? L.shin) : L.shin) * S;
    let footL = (front ? (L.frontFoot ?? L.foot) : L.foot) * S;
    // Rescale the segments so the toe lands exactly on the ground, whatever
    // the bend. Stated hip height wins over stated bone lengths.
    // `fit: false` opts a limb pair out — a pterosaur's wings are front limbs
    // that are emphatically not trying to reach the floor.
    const fit = front ? (L.frontFit ?? true) : (L.fit ?? true);
    if (fit) {
      const drop = (thighL * Math.cos(fa) + shinL * Math.cos(ta) + footL * Math.cos(ma)) * co;
      const k = (attachY - (front ? 0.04 * S : 0)) / Math.max(0.001, drop);
      thighL *= k; shinL *= k; footL *= k;
    }

    const tag = `${front ? 'f' : 'r'}${side > 0 ? 'R' : 'L'}`;
    // upper sits at the hip and swings the femur; lower is the knee;
    // ankle is the ankle; toe is the ball of the foot.
    const upper = bone(`${tag}upper`, side * spread, front ? -0.04 * S : 0,
      front ? 0.04 * S : -0.03 * S, attach);
    const lower = bone(`${tag}lower`, thighL * so, -thighL * Math.cos(fa) * co, thighL * Math.sin(fa), upper);
    const ankle = bone(`${tag}ankle`, shinL * so, -shinL * Math.cos(ta) * co, shinL * Math.sin(ta), lower);
    const toe = bone(`${tag}toe`, footL * so, -footL * Math.cos(ma) * co, footL * Math.sin(ma), ankle);
    const leg = { upper, lower, ankle, toe, side, front, thighL, shinL, footL, spread, bend, out: oa };
    legs.push(leg);
    return leg;
  };
  makeLeg(-1, false); makeLeg(1, false);
  if (!spec.biped) { makeLeg(-1, true); makeLeg(1, true); }

  const bi = (b) => b.userData.index;

  // Geometry is identical for every individual of a species, so the ecology
  // builds it once and then asks for bones alone.
  if (bonesOnly) {
    return { geometry: null, bones, rig: { root, hips, spine, neck, head: headBone, jaw: jawBone, tail, legs, chest } };
  }

  // --- trunk skin ----------------------------------------------------------
  // One continuous tube: tail tip -> hips -> chest -> neck -> skull base.
  const samples = [];
  // tail, back to front
  for (let i = tailSpec.count; i >= 1; i--) {
    const t = i / tailSpec.count;
    const z = -tailSpec.length * S * t;
    const rr = lerp(tailSpec.radius1 ?? 0.04, tailSpec.radius0 ?? bodyR * 0.6, 1 - t) * S;
    const yy = hipH - (tailSpec.droop ?? 0.1) * S * t * t * tailSpec.count * 0.5;
    const b = tail[Math.min(tail.length - 1, Math.floor(t * tailSpec.count))];
    const bPrev = tail[Math.max(0, Math.floor(t * tailSpec.count) - 1)];
    const frac = (t * tailSpec.count) % 1;
    samples.push({ z, y: yy, rx: rr, ry: rr * (tailSpec.flat ? 0.62 : 1.0), b0: bi(b), w0: 1 - frac, b1: bi(bPrev), w1: frac, flat: 0 });
  }
  // body, hips to chest
  const bodySamples = 5;
  for (let i = 0; i <= bodySamples; i++) {
    const t = i / bodySamples;
    const z = bodyLen * t;
    const y = lerp(hipH, shoulderH, t);
    // Widest just ahead of the hips, tapering into the shoulders. The
    // vertical profile is deliberately flatter than the horizontal one, or
    // every animal comes out looking like a teardrop on legs.
    const bulge = Math.pow(Math.sin(Math.PI * clamp(t * 0.82 + 0.13, 0, 1)), 0.78);
    const rx = bodyR * (0.70 + bulge * 0.40) * (spec.barrel ?? 1);
    const ry = bodyD * (0.74 + bulge * 0.28);
    const sIdx = clamp(Math.floor(t * spineCount), 0, spineCount - 1);
    const frac = clamp(t * spineCount - sIdx, 0, 1);
    const b0 = sIdx === 0 ? bi(hips) : bi(spine[sIdx - 1]);
    samples.push({ z, y, rx, ry, b0, w0: 1 - frac, b1: bi(spine[sIdx]), w1: frac, flat: spec.flatBelly ?? 0.18 });
  }
  // neck
  const neckSamples = Math.max(3, neckSpec.count * 2);
  for (let i = 1; i <= neckSamples; i++) {
    const t = i / neckSamples;
    const z = bodyLen + neckSpec.length * S * t * 0.86;
    const y = shoulderH + Math.sin((neckSpec.rise ?? 0.5) * Math.PI * 0.5) * neckSpec.length * S * t
      + (neckSpec.arch ?? 0) * S * Math.sin(t * Math.PI);
    const rr = lerp(neckSpec.radius0 ?? bodyR * 0.55, neckSpec.radius1 ?? bodyR * 0.3, t) * S;
    const nIdx = clamp(Math.floor(t * neckSpec.count), 0, neckSpec.count - 1);
    const frac = clamp(t * neckSpec.count - nIdx, 0, 1);
    const b0 = nIdx === 0 ? bi(chest) : bi(neck[nIdx - 1]);
    samples.push({ z, y, rx: rr, ry: rr * 1.06, b0, w0: 1 - frac, b1: bi(neck[nIdx]), w1: frac, flat: 0 });
  }

  let prevRing = -1;
  let firstRing = -1;
  for (const s of samples) {
    const ring = emitRing(mb, 0, s.y, s.z, s.rx, s.ry, colorFn, s.b0, s.w0, s.b1, s.w1, s.flat);
    if (prevRing >= 0) bridgeRings(mb, prevRing, ring);
    else firstRing = ring;
    prevRing = ring;
  }
  // Cap the tail tip and the neck end.
  const first = samples[0], last = samples[samples.length - 1];
  capRing(mb, firstRing, 0, first.y, first.z - first.rx, colorFn, first.b0, false);

  // --- head ----------------------------------------------------------------
  const H = spec.head;
  const hb = bi(headBone), jb = bi(jawBone);
  const hLen = H.length * S, hW = H.width * S, hH = H.height * S;
  const HW = headBone.userData.world;      // rest position of the skull
  const JW = jawBone.userData.world;
  {
    // Skull: a tapering tube from the neck join out to the snout tip.
    const segs = 4;
    let prev = -1;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const z = t * hLen;
      const taper = lerp(1.0, H.snout ?? 0.45, Math.pow(t, 0.85));
      const rx = hW * 0.5 * taper;
      const ry = hH * 0.5 * lerp(1.0, (H.snoutHeight ?? 0.55), Math.pow(t, 0.8));
      const yy = -hH * 0.06 * t + (H.brow ?? 0) * S * Math.sin(t * Math.PI) * 0.5;
      const start = mb.count;
      for (let k = 0; k < RING; k++) {
        const a = (k / RING) * Math.PI * 2;
        const sx = Math.cos(a), sy = Math.sin(a);
        const c = colorFn(sy, last.z + z);
        mb.vert(HW.x + sx * rx, HW.y + yy + sy * ry, HW.z + z, sx, sy, 0, c[0], c[1], c[2], hb, 1);
      }
      if (prev >= 0) bridgeRings(mb, prev, start);
      prev = start;
    }
    capRing(mb, prev, HW.x, HW.y - hH * 0.06, HW.z + hLen, colorFn, hb, true);

    // Jaw: a wedge hinged under the skull, on its own bone so it can open.
    const jStart = mb.count;
    const jw = hW * 0.42, jl = hLen * 0.92, jh = hH * 0.24;
    const sn = H.snout ?? 0.45;
    const jc = [cBelly.r * 0.85, cBelly.g * 0.85, cBelly.b * 0.85];
    const jv = [
      [-jw, 0, 0], [jw, 0, 0], [jw * sn, 0, jl], [-jw * sn, 0, jl],
      [-jw * 0.9, -jh, 0.05 * jl], [jw * 0.9, -jh, 0.05 * jl],
      [jw * sn * 0.8, -jh * 0.7, jl * 0.95], [-jw * sn * 0.8, -jh * 0.7, jl * 0.95],
    ];
    for (const v of jv) mb.vert(JW.x + v[0], JW.y + v[1], JW.z + v[2], 0, -1, 0, jc[0], jc[1], jc[2], jb, 1);
    const q = (a, b, c, d) => mb.quad(jStart + a, jStart + b, jStart + c, jStart + d);
    q(0, 1, 2, 3); q(7, 6, 5, 4); q(4, 5, 1, 0); q(3, 2, 6, 7); q(0, 3, 7, 4); q(5, 6, 2, 1);

    // Teeth, for the ones that have them.
    if (H.teeth) {
      const tc = [0.90, 0.88, 0.80];
      for (let i = 0; i < H.teeth; i++) {
        const t = 0.12 + (i / H.teeth) * 0.82;
        const zz = t * hLen;
        const xx = hW * 0.5 * lerp(1.0, sn, t) * 0.92;
        const sz = hH * (0.10 + 0.10 * Math.sin(i * 2.1)) * (H.toothScale ?? 1);
        for (const sgn of [-1, 1]) {
          emitPlate(mb,
            new THREE.Vector3(HW.x + sgn * xx, HW.y - hH * 0.26, HW.z + zz),
            new THREE.Vector3(HW.x + sgn * xx, HW.y - hH * 0.26 - sz, HW.z + zz + sz * 0.2),
            0.012 * S, tc, hb, 'z');
        }
      }
    }

    // Eyes. Bright vertices flagged with aGlow, which the material turns
    // emissive after dark — that is the pair of lights in the treeline.
    const eyeR = (H.eyeSize ?? 0.06) * S;
    const eyeAt = H.eyeAt ?? 0.34;
    const eyeZ = hLen * eyeAt;
    const eyeX = hW * 0.5 * lerp(1.0, sn, eyeAt) * 0.96;
    const eyeY = hH * 0.16 + (H.brow ?? 0) * S * 0.4;
    for (const sgn of [-1, 1]) {
      const s0 = mb.count;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        mb.vert(HW.x + sgn * eyeX, HW.y + eyeY + Math.sin(a) * eyeR, HW.z + eyeZ + Math.cos(a) * eyeR,
          sgn, 0, 0, 0.10, 0.075, 0.05, hb, 1, 0, 0, 0.15);
      }
      const c0 = mb.count;
      mb.vert(HW.x + sgn * (eyeX + eyeR * 0.55), HW.y + eyeY, HW.z + eyeZ, sgn, 0, 0,
        0.85, 0.62, 0.14, hb, 1, 0, 0, 1);
      for (let k = 0; k < 6; k++) {
        const j = (k + 1) % 6;
        if (sgn > 0) mb.tri(s0 + k, s0 + j, c0); else mb.tri(s0 + j, s0 + k, c0);
      }
    }

    // Head furniture: crest, horns, frill.
    const acc = [cAccent.r, cAccent.g, cAccent.b];
    if (H.crest) {
      emitPlate(mb,
        new THREE.Vector3(HW.x, HW.y + hH * 0.4, HW.z + hLen * 0.1),
        new THREE.Vector3(HW.x, HW.y + hH * 0.4 + H.crest * S, HW.z - hLen * (H.crestBack ?? 0.35)),
        0.02 * S, acc, hb, 'x');
    }
    if (H.horns) {
      for (const sgn of [-1, 1]) {
        emitLimb(mb,
          new THREE.Vector3(HW.x + sgn * hW * 0.32, HW.y + hH * 0.30, HW.z + hLen * 0.30),
          new THREE.Vector3(HW.x + sgn * hW * 0.52, HW.y + hH * 0.30 + H.horns * S, HW.z + hLen * 0.72),
          0.05 * S, 0.012 * S, acc, hb, 3, 5);
      }
      emitLimb(mb,
        new THREE.Vector3(HW.x, HW.y + hH * 0.1, HW.z + hLen * 0.78),
        new THREE.Vector3(HW.x, HW.y + hH * 0.1 + H.horns * S * 0.45, HW.z + hLen * 0.98),
        0.045 * S, 0.012 * S, acc, hb, 3, 5);
    }
    if (H.frill) {
      const fr = H.frill * S;
      const fStart = mb.count;
      const pts = 7;
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI - Math.PI * 0.5;
        mb.vert(HW.x + Math.sin(a) * hW * 0.45, HW.y + hH * 0.2 + Math.cos(a) * hH * 0.3, HW.z - hLen * 0.05,
          0, 0, -1, cBack.r, cBack.g, cBack.b, hb, 1);
        mb.vert(HW.x + Math.sin(a) * fr, HW.y + hH * 0.2 + Math.cos(a) * fr * 0.95,
          HW.z - hLen * 0.32 - Math.abs(Math.sin(a)) * fr * 0.2,
          0, 0, -1, cAccent.r * 0.9, cAccent.g * 0.9, cAccent.b * 0.9, hb, 1);
      }
      for (let i = 0; i < pts; i++) {
        const a = fStart + i * 2;
        mb.quad(a, a + 1, a + 3, a + 2);
        mb.quad(a + 2, a + 3, a + 1, a);
      }
    }
  }

  // --- legs ----------------------------------------------------------------
  const legCol = [cSide.r * 0.92, cSide.g * 0.92, cSide.b * 0.92];
  const footCol = [cBelly.r * 0.7, cBelly.g * 0.7, cBelly.b * 0.7];
  for (const leg of legs) {
    const thickness = (leg.front ? (L.frontThickness ?? L.thickness) : L.thickness) * S;
    const U = leg.upper.userData.world, Lo = leg.lower.userData.world;
    const An = leg.ankle.userData.world, To = leg.toe.userData.world;
    // The thigh carries the muscle mass; everything below it tapers hard.
    emitLimb(mb, U, Lo, thickness * 1.55, thickness * 0.80, legCol, bi(leg.upper), 3, 7);
    emitLimb(mb, Lo, An, thickness * 0.80, thickness * 0.52, legCol, bi(leg.lower), 3, 7);
    emitLimb(mb, An, To, thickness * 0.52, thickness * 0.40, footCol, bi(leg.ankle), 2, 6);
    const toeLen = Math.max(0.05, leg.footL * 0.55);
    for (let t = 0; t < 3; t++) {
      const a = (t - 1) * 0.44;
      emitLimb(mb, To,
        new THREE.Vector3(To.x + Math.sin(a) * toeLen * 0.75, To.y - thickness * 0.22,
          To.z + Math.cos(a) * toeLen),
        thickness * 0.34, thickness * 0.14, footCol, bi(leg.toe), 2, 4);
    }
    // A back claw, so the foot is not a stump.
    emitLimb(mb, To, new THREE.Vector3(To.x, To.y - thickness * 0.18, To.z - toeLen * 0.45),
      thickness * 0.24, thickness * 0.09, footCol, bi(leg.toe), 2, 4);
  }

  // Vestigial forelimbs. Small, but their absence is the first thing you
  // notice on a theropod silhouette.
  if (spec.arms) {
    const A2 = spec.arms;
    const zAt = bodyLen * (A2.at ?? 0.86);
    const yAt = lerp(hipH, shoulderH, A2.at ?? 0.86) - bodyD * 0.30;
    const sIdx = bi(spine[clamp(Math.floor((A2.at ?? 0.86) * spineCount), 0, spineCount - 1)]);
    for (const sgn of [-1, 1]) {
      const sh = new THREE.Vector3(sgn * bodyR * 0.72, yAt, zAt);
      const el = new THREE.Vector3(sgn * bodyR * 0.86, yAt - A2.upper * S * 0.82, zAt + A2.upper * S * 0.42);
      const hd = new THREE.Vector3(sgn * bodyR * 0.90, el.y - A2.fore * S * 0.5, el.z + A2.fore * S * 0.8);
      emitLimb(mb, sh, el, A2.thickness * S * 1.2, A2.thickness * S * 0.8, legCol, sIdx, 2, 5);
      emitLimb(mb, el, hd, A2.thickness * S * 0.8, A2.thickness * S * 0.5, legCol, sIdx, 2, 5);
      for (let cI = 0; cI < 2; cI++) {
        emitLimb(mb, hd,
          new THREE.Vector3(hd.x + sgn * 0.02 * S, hd.y - A2.claw * S * 0.4, hd.z + A2.claw * S * (0.8 + cI * 0.1)),
          A2.thickness * S * 0.35, A2.thickness * S * 0.08,
          [0.72, 0.68, 0.6], sIdx, 2, 4);
      }
    }
  }

  // --- dorsal furniture ----------------------------------------------------
  const A = spec.armor;
  if (A) {
    const acc = [cAccent.r, cAccent.g, cAccent.b];
    if (A.sail) {
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const z = lerp(-tailSpec.length * S * 0.25, bodyLen * 0.95, t);
        const sIdx = z < 0 ? bi(hips) : bi(spine[clamp(Math.floor((z / bodyLen) * spineCount), 0, spineCount - 1)]);
        const y = lerp(hipH, shoulderH, clamp(z / bodyLen, 0, 1)) + bodyD * 0.55;
        const hgt = A.sail * S * Math.sin(Math.PI * clamp(t * 0.94 + 0.06, 0, 1));
        emitPlate(mb, new THREE.Vector3(0, y, z), new THREE.Vector3(0, y + hgt, z - hgt * 0.16), 0.02 * S, acc, sIdx, 'x');
      }
    }
    if (A.plates) {
      for (let i = 0; i < A.plates; i++) {
        const t = i / (A.plates - 1 || 1);
        const z = lerp(-tailSpec.length * S * 0.35, bodyLen * 0.9, t);
        const onTail = z < 0;
        const idx = onTail
          ? bi(tail[clamp(Math.floor((-z / (tailSpec.length * S)) * tailSpec.count), 0, tail.length - 1)])
          : bi(spine[clamp(Math.floor((z / bodyLen) * spineCount), 0, spineCount - 1)]);
        const y = (onTail ? hipH : lerp(hipH, shoulderH, clamp(z / bodyLen, 0, 1))) + bodyD * 0.5;
        for (const sgn of [-1, 1]) {
          const w = bodyR * 0.72 * sgn;
          emitLimb(mb, new THREE.Vector3(w, y - bodyD * 0.18, z),
            new THREE.Vector3(w * 1.25, y + (A.plateSize ?? 0.25) * S, z - 0.05 * S),
            0.09 * S, 0.02 * S, acc, idx, 2, 5);
        }
      }
    }
    if (A.spikes) {
      for (let i = 0; i < A.spikes; i++) {
        const t = i / A.spikes;
        const z = -tailSpec.length * S * (0.45 + t * 0.5);
        const idx = bi(tail[clamp(Math.floor((-z / (tailSpec.length * S)) * tailSpec.count), 0, tail.length - 1)]);
        for (const sgn of [-1, 1]) {
          emitLimb(mb, new THREE.Vector3(0, hipH, z),
            new THREE.Vector3(sgn * (A.spikeSize ?? 0.3) * S, hipH + 0.06 * S, z - 0.1 * S),
            0.05 * S, 0.012 * S, acc, idx, 2, 5);
        }
      }
    }
    if (A.club) {
      const idx = bi(tail[tail.length - 1]);
      const z = -tailSpec.length * S * 1.0;
      const s0 = mb.count;
      const rr = A.club * S;
      for (let k = 0; k < RING; k++) {
        const a = (k / RING) * Math.PI * 2;
        mb.vert(Math.cos(a) * rr, hipH - (tailSpec.droop ?? 0) * S * 0.5 + Math.sin(a) * rr, z,
          Math.cos(a), Math.sin(a), 0, cAccent.r, cAccent.g, cAccent.b, idx, 1);
      }
      capRing(mb, s0, 0, hipH, z - rr * 1.1, () => [cAccent.r, cAccent.g, cAccent.b], idx, false);
      capRing(mb, s0, 0, hipH, z + rr * 0.9, () => [cAccent.r, cAccent.g, cAccent.b], idx, true);
    }
  }

  const geometry = mb.build();
  return { geometry, bones, rig: { root, hips, spine, neck, head: headBone, jaw: jawBone, tail, legs, chest } };
}

/** Material shared by every creature; eyes glow via the aGlow attribute. */
export function makeCreatureMaterial() {
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.85, metalness: 0.0,
    side: THREE.DoubleSide, dithering: true,
  });
  mat.userData.eye = { value: 0.0 };
  mat.userData.eyeColor = { value: new THREE.Color(1.0, 0.72, 0.22) };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uEye = mat.userData.eye;
    shader.uniforms.uEyeColor = mat.userData.eyeColor;
    shader.vertexShader = 'attribute float aGlow;\nvarying float vGlow;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>', '#include <begin_vertex>\n vGlow = aGlow;');
    shader.fragmentShader = 'uniform float uEye;\nuniform vec3 uEyeColor;\nvarying float vGlow;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance += vGlow * uEyeColor * uEye;');
  };
  mat.customProgramCacheKey = () => 'primeval-creature';
  return mat;
}
