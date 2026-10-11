// =============================================================================
// The tower, as numbers.
//
// Read from three things: a pen sketch, a 3D print and an acrylic study model
// (the acrylic one is missing its top, so its height is not a guide). What
// they share is a spiral: two continuous bands of building winding up round a
// square core together, half a turn apart, a quarter turn at a time, each
// length running along one face of the core and out past the corner, rising
// all the way. From any side they read as the steep diagonal strips climbing
// the sketch, with the core glimpsed in the recess under each one; at the
// foot they are its two legs; from above they are the pinwheel of the print's
// top view. At the top one band's last length is drawn up into a tall glazed
// sail, and a mast stands on its leading edge. Cables fan out from the lower
// turns to anchors on the plinth.
//
// This module imports nothing - no DOM, no three.js - so the form can be
// checked headlessly (node spire/test/tower.test.mjs). It returns plain
// polyhedra: every solid is a loft between a bottom polygon and a top polygon
// with the same number of vertices, faces listed counter-clockwise when seen
// from outside. Units are metres, y is up, the water line is y = 0.
// =============================================================================

export const PARAMS = {
  plaza: 1.6,          // top of the stone plinth the tower stands on
  coreBase: 20,        // half-width of the core at the ground
  coreTop: 7,          // half-width at the top of the core
  strands: 2,          // bands winding up together, evenly spaced round the core
  segments: 10,        // lengths per band, one per face, a quarter turn each
  rise: 30,            // how far a band climbs along one length (120 m a full turn)
  band: 46,            // a band's height; with two bands each face gets one every
                       // 60 m, and the 14 m between is the recess
  depth: 1.05,         // how far a band stands out from the core, x the core half-width
  depthAdd: 4,         // ... plus this much
  turn: Math.PI / 2,   // one face per length
  twist: 0.03,         // and a slight extra turn each time, so the whole spiral twists
  sail: 96,            // the sail's tip above the top of the bands
  mast: 42,            // mast above the sail
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

// Top of the band (and of the core inside it), before the sail.
export function bandTopY(p = PARAMS) {
  return p.plaza + (p.segments - 1) * p.rise + p.band;
}

export function coreTopY(p = PARAMS) {
  return bandTopY(p) - p.band * 0.35;
}

export function coreHalf(y, p = PARAMS) {
  return lerp(p.coreBase, p.coreTop, Math.min(1, Math.max(0, y / coreTopY(p))));
}

// The square core, from the plinth up inside the last turn.
function core(p) {
  const y0 = p.plaza, y1 = coreTopY(p);
  const sq = (h, y) => [[h, y, h], [h, y, -h], [-h, y, -h], [-h, y, h]];
  return { name: 'core', kind: 'core', ...loft(sq(coreHalf(y0, p), y0), sq(coreHalf(y1, p), y1)) };
}

// One length of the spiral band. Built in a local frame where it runs along
// the core face x = +h, travelling toward -z: it starts just behind the corner
// it shares with the length below and runs on past the next corner, out to
// the band's outer face, so each length owns the corner it turns at - the
// print's pinwheel. Its underside and top climb steadily along the run, so
// where one length ends the next begins at the same height.
export function segmentPlan(j, p = PARAMS, strand = 0) {
  const yb = p.plaza + j * p.rise;
  const h = coreHalf(yb + p.band / 2, p);
  const d = h * p.depth + p.depthAdd;
  const xi = h * 0.85, xo = h + d;          // inner edge buried in the core
  const zt = h + 1.5, zl = -(h + d);        // trailing end, leading end
  const angle = j * (p.turn + p.twist) + strand * 2 * Math.PI / p.strands;
  return { yb, h, d, xi, xo, zt, zl, angle };
}

export function segment(j, p = PARAMS, strand = 0) {
  const { yb, xi, xo, zt, zl, angle } = segmentPlan(j, p, strand);
  const y = z => yb + p.rise * (zt - z) / (zt - zl);
  // counter-clockwise from above: outer-trailing, outer-leading (the tip),
  // inner-leading, inner-trailing - the same order as the core's square
  const plan = [[xo, zt], [xo, zl], [xi, zl], [xi, zt]];
  const bottom = plan.map(([x, z]) => rotY([x, y(z), z], angle));
  const top = plan.map(([x, z]) => rotY([x, y(z) + p.band, z], angle));
  return { name: `band${strand}.${j}`, kind: 'wing', strand, index: j, angle, ...loft(bottom, top) };
}

// A band's last length, drawn up into a sail: its trailing end keeps the
// band's height, its leading end stands straight up to the tip, so its top is
// one long edge climbing on the spiral's own diagonal - the sketch's triangle.
// The first band ends in the tall sail that carries the mast; the second in a
// lower one beside it.
function sail(p, strand, height) {
  const j = p.segments - 1;
  const { yb, xi, xo, zt, zl, angle } = segmentPlan(j, p, strand);
  const y = z => yb + p.rise * (zt - z) / (zt - zl);
  const tipY = bandTopY(p) + height;
  const plan = [[xo, zt], [xo, zl], [xi, zl], [xi, zt]];
  const bottom = plan.map(([x, z]) => rotY([x, y(z), z], angle));
  const top = [
    [xo, y(zt) + p.band, zt],
    [xo, tipY, zl],
    [xo - 2.6, tipY, zl],          // pinched to a short edge at the tip
    [xi, y(zt) + p.band, zt],
  ].map(v => rotY(v, angle));
  return {
    name: `sail${strand}`, kind: 'sail', strand, index: j, angle,
    ...loft(bottom, top),
    tip: rotY([xo - 1.3, tipY, zl], angle),
  };
}

// Stays: from the band tips of the first full turn down to anchors on the
// plinth, sagging a little under their own weight.
function cables(p, segs) {
  const out = [];
  const lower = segs.filter(s => s.index >= 2 && s.index <= 4);
  for (let k = 0; k < p.cables; k++) {
    const w = lower[k % lower.length];
    const tip = w.verts[5]; // top polygon, tip vertex
    const a = Math.atan2(tip[2], tip[0]) + 0.25;
    const r = 80 + 6 * (k % 2);
    out.push({ from: [tip[0], tip[1] - 2, tip[2]], to: [Math.cos(a) * r, p.plaza, Math.sin(a) * r], sag: 0.025 });
  }
  return out;
}

export function buildTower(p = PARAMS) {
  // every band's last length becomes a sail
  const segs = [];
  for (let k = 0; k < p.strands; k++) {
    for (let j = 0; j < p.segments - 1; j++) segs.push(segment(j, p, k));
  }
  const sails = [...Array(p.strands).keys()].map(k => sail(p, k, k === 0 ? p.sail : p.sail * 0.32));
  const s = sails[0];
  const solids = [core(p), ...segs, ...sails];
  const mastBase = s.tip;
  const mastTop = [mastBase[0], mastBase[1] + p.mast, mastBase[2]];
  return {
    params: p,
    solids,
    cables: cables(p, segs),
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
