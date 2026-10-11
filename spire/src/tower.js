// =============================================================================
// The tower, as numbers.
//
// Read from three things: a pen sketch, a 3D print and an acrylic study model.
// All three agree on the same idea: a square core rising and tapering, with a
// stack of wedge-shaped wings bolted to it, each turned a quarter turn further
// round than the one below, so the sloping wing tops read from any side as
// bands climbing in a spiral. The core finishes in a tall glazed sail and a
// mast; at the foot, cables fan out to anchors on the ground.
//
// This module imports nothing - no DOM, no three.js - so the form can be
// checked headlessly (node spire/test/tower.test.mjs). It returns plain
// polyhedra: every solid is a loft between a bottom polygon and a top polygon
// with the same number of vertices, faces listed counter-clockwise when seen
// from outside. Units are metres, y is up, the water line is y = 0.
// =============================================================================

export const PARAMS = {
  plaza: 1.6,          // top of the stone plinth the tower stands on
  legTop: 24,          // where the twisted legs meet the first wing
  coreBase: 19,        // half-width of the core at the ground
  coreTop: 9,          // half-width where the core turns into the sail
  wings: 6,            // number of wings
  wingPitch: 44,       // vertical spacing between successive wings
  wingDepth: 64,       // height of a wing at its root (so wings overlap)
  wingReach: 30,       // how far the lowest wing reaches beyond the core face
  wingTaper: 0.07,     // each wing reaches this fraction less than the one below
  wingGrow: 0.45,      // underside starts at this fraction of the reach (cantilever)
  wingWide: 1.12,      // the wing's half-width across, as a multiple of the core's
  wingTwist: 0.1,      // each block's top turned this far past its underside (rad)
  wingSlope: 0.6,      // rise per metre along the wing face (the spiral band)
  turn: Math.PI / 2,   // rotation from one wing to the next
  turnExtra: 0.1,      // and a little more, so it spirals rather than pinwheels
  sail: 96,            // height of the sail above the core top
  mast: 40,            // mast above the sail
  cables: 6,
};

const lerp = (a, b, t) => a + (b - a) * t;

function rotY([x, y, z], a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

// Loft a closed solid between two polygons. Both are lists of [x,y,z], wound
// counter-clockwise when seen from above. Faces: the bottom (reversed, so it
// faces down), the top, and one quad per side.
export function loft(bottom, top) {
  const n = bottom.length;
  if (top.length !== n) throw new Error('loft: polygons differ in length');
  const verts = [...bottom, ...top];
  const faces = [];
  faces.push([...Array(n).keys()].reverse());
  faces.push([...Array(n).keys()].map(i => i + n));
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    faces.push([i, j, j + n, i + n]);
  }
  return { verts, faces };
}

export function coreHalf(y, p = PARAMS) {
  const top = coreTopY(p);
  return lerp(p.coreBase, p.coreTop, Math.min(1, Math.max(0, y / top)));
}

export function coreTopY(p = PARAMS) {
  return p.legTop + (p.wings - 1) * p.wingPitch + p.wingDepth * 0.9;
}

// The square core, from the plinth to the foot of the sail.
function core(p) {
  const y0 = p.plaza, y1 = coreTopY(p);
  const sq = (h, y) => [[h, y, h], [h, y, -h], [-h, y, -h], [-h, y, h]];
  // counter-clockwise from above (+y): +x+z -> +x-z -> -x-z -> -x+z
  return { name: 'core', kind: 'core', ...loft(sq(coreHalf(y0, p), y0), sq(coreHalf(y1, p), y1)) };
}

// One wing. Built in a local frame where it hangs off the core face x = +h,
// running along that face from z = -h to z = +h. Its plan is a wedge: the
// leading edge continues the core's side out to the tip, the trailing edge
// swings back to the far corner (the pinwheel in the 3D print's top view).
// Top and bottom are planes tilted along the face, which is what draws the
// spiral bands; and the underside reaches less far than the top, so each wing
// steps out as it rises, like the stacked plates of the acrylic model.
export function wing(i, p = PARAMS) {
  const yRoot = p.legTop + i * p.wingPitch;
  const hMid = coreHalf(yRoot + p.wingDepth / 2, p);
  const h0 = coreHalf(yRoot, p), h1 = coreHalf(yRoot + p.wingDepth, p);
  const reach = p.wingReach * Math.pow(1 - p.wingTaper, i) + hMid * 0.4;
  const angle = i * (p.turn + p.turnExtra);
  const rise = z => (z + hMid * p.wingWide) * p.wingSlope * (hMid / p.coreBase);

  // Plan at the underside and at the top: a block wider than the core,
  // pushed off-centre so it cantilevers out on one side. Vertex order is
  // counter-clockwise from above: front-trailing, front-leading (the tip),
  // back-leading, back-trailing. The core is only glimpsed between blocks.
  const W = p.wingWide;
  const plan = (h, r) => [
    [h + r, 0, h * W],
    [h + r, 0, -h * W],
    [-h * 0.95, 0, -h * W],
    [-h * 0.95, 0, h * W],
  ];
  const lift = (pts, y0) => pts.map(([x, , z]) => [x, y0 + rise(z), z]);
  let bottom = lift(plan(h0, reach * p.wingGrow), yRoot);
  let top = lift(plan(h1, reach), yRoot + p.wingDepth).map(v => rotY(v, p.wingTwist));
  bottom = bottom.map(v => rotY(v, angle));
  top = top.map(v => rotY(v, angle));
  return { name: `wing${i}`, kind: 'wing', index: i, angle, reach, ...loft(bottom, top) };
}

// The sail: the core's last length, sharpened into a tall blade that leans
// on one vertical edge - the triangle the sketch ends in.
function sail(p) {
  const y0 = coreTopY(p) - 14, y1 = coreTopY(p) + p.sail;
  const h = coreHalf(y0, p);
  const a = p.wings * (p.turn + p.turnExtra);
  const r = h * 1.1;   // the sail's base runs out past the core, like a wing
  const bottom = [[h + r, y0, h * 1.3], [h + r, y0, -h], [-h, y0, -h], [-h, y0, h * 1.3]];
  // the top is pinched to a short edge standing straight over the tip
  const top = [[h + r, y1, -h + 1.4], [h + r, y1, -h], [h + r - 1.8, y1, -h], [h + r - 1.8, y1, -h + 1.4]];
  return {
    name: 'sail', kind: 'sail',
    ...loft(bottom.map(v => rotY(v, a)), top.map(v => rotY(v, a))),
    tip: rotY([h + r - 0.9, y1, -h + 0.7], a),
  };
}

// Three twisted legs carrying the core down to the plinth: the sketch's base
// is not a box but a knot of leaning piers with the shadow between them.
function legs(p) {
  const out = [];
  const h0 = p.coreBase;
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2;
    const footR = h0 * 1.25, w = h0 * 0.36;
    // a squat quad at the foot, rotated a little, rising to a corner of the core
    const foot = [[footR - w, p.plaza, -w], [footR + w, p.plaza, -w], [footR + w, p.plaza, w], [footR - w, p.plaza, w]]
      .map(v => rotY(v, a + 0.55));
    const y1 = p.legTop + 6;
    const hc = coreHalf(y1, p);
    const head = [[hc * 0.3, y1, hc * 0.3], [hc, y1, hc * 0.3], [hc, y1, hc], [hc * 0.3, y1, hc]]
      .map(v => rotY(v, a));
    // both counter-clockwise from above
    out.push({ name: `leg${k}`, kind: 'leg', ...loft(foot.reverse(), head.reverse()) });
  }
  return out;
}

// Stays: from the tips of the lower wings down to anchors on the plinth,
// sagging a little under their own weight.
function cables(p, wings) {
  const out = [];
  for (let k = 0; k < p.cables; k++) {
    const w = wings[k % 3];
    const tip = w.verts[5]; // top polygon, tip vertex
    const a = Math.atan2(tip[2], tip[0]) + (k < 3 ? 0.35 : -0.35);
    const r = 80 + 6 * (k % 2);
    out.push({ from: [tip[0], tip[1] - 2, tip[2]], to: [Math.cos(a) * r, p.plaza, Math.sin(a) * r], sag: 0.025 });
  }
  return out;
}

export function buildTower(p = PARAMS) {
  const wings = [...Array(p.wings).keys()].map(i => wing(i, p));
  const s = sail(p);
  const solids = [core(p), ...legs(p), ...wings, s];
  const mastBase = s.tip;
  const mastTop = [mastBase[0], mastBase[1] + p.mast, mastBase[2]];
  return {
    params: p,
    solids,
    cables: cables(p, wings),
    mast: { from: mastBase, to: mastTop, radius: 0.9 },
    height: mastTop[1],
  };
}

// Point on a sagging cable, t in [0, 1].
export function cablePoint(c, t) {
  const L = Math.hypot(c.to[0] - c.from[0], c.to[1] - c.from[1], c.to[2] - c.from[2]);
  return [
    lerp(c.from[0], c.to[0], t),
    lerp(c.from[1], c.to[1], t) - 4 * c.sag * L * t * (1 - t),
    lerp(c.from[2], c.to[2], t),
  ];
}

// --- geometry checks, shared with the tests --------------------------------

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// Newell's method: robust normal for a possibly non-planar polygon.
export function faceNormal(verts, face) {
  const n = [0, 0, 0];
  for (let i = 0; i < face.length; i++) {
    const a = verts[face[i]], b = verts[face[(i + 1) % face.length]];
    n[0] += (a[1] - b[1]) * (a[2] + b[2]);
    n[1] += (a[2] - b[2]) * (a[0] + b[0]);
    n[2] += (a[0] - b[0]) * (a[1] + b[1]);
  }
  const l = Math.hypot(...n) || 1;
  return n.map(v => v / l);
}

// Signed volume by the divergence theorem over a fan of each face.
export function volume({ verts, faces }) {
  let v = 0;
  for (const f of faces) {
    for (let i = 1; i < f.length - 1; i++) {
      const a = verts[f[0]], b = verts[f[i]], c = verts[f[i + 1]];
      v += dot(a, cross(b, c)) / 6;
    }
  }
  return v;
}

export function isClosed({ faces }) {
  const edges = new Map();
  for (const f of faces) {
    for (let i = 0; i < f.length; i++) {
      const a = f[i], b = f[(i + 1) % f.length];
      const k = `${a}>${b}`;
      if (edges.has(k)) return false;
      edges.set(k, true);
    }
  }
  for (const k of edges.keys()) {
    const [a, b] = k.split('>');
    if (!edges.has(`${b}>${a}`)) return false;
  }
  return true;
}

export { sub, cross, dot };
