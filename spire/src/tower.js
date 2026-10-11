// =============================================================================
// The tower, as numbers.
//
// The master is the architect's acrylic study model: a stack of clear plates
// on a brass rod, one plate a floor. Read from it, plate by plate:
//
//   - one big, nearly square plate a level, threaded on the rod off centre.
//     The plates come in clusters of about six: within a cluster each plate
//     steps a little further out and turns a little, and each new cluster
//     starts sharply round from the last, leaning out the other way. That
//     gives the model its fanned, tiered, twisting look;
//   - the model is missing its top, so above where it stops the clusters
//     simply carry on, smaller and shorter in proportion, until the last
//     plate carries a short steeple, and the mast - the model's brass rod -
//     stands on that.
//
// Built for real, each plate becomes a floor: a slab whose edge reads as the
// plate, with a storey of glass beneath it set back a little.
//
// This module imports nothing - no DOM, no three.js - so the form can be
// checked headlessly (node spire/test/tower.test.mjs). It returns plain
// polyhedra: every solid is a loft between a bottom polygon and a top polygon
// with the same number of vertices, faces listed counter-clockwise when seen
// from outside. Units are metres, y is up, the water line is y = 0.
// =============================================================================

export const PARAMS = {
  plaza: 1.6,          // top of the stone plinth the tower stands on
  floor: 4.0,          // one plate, one floor
  slab: 1.3,           // the slab's share of it (the acrylic plate's thickness)
  inset: 0.9,          // how far the glass sits back from the slab edge
  // one big, nearly square plate a level, threaded on the rod off centre.
  // The plates come in clusters: within a cluster each plate steps a little
  // further out and turns a little; each new cluster starts sharply round
  // from the last and leans out the other way. That is the model's tiered,
  // fanned look. Above where the model stops, the clusters carry on, smaller
  // and shorter in proportion, up to a short steeple.
  clusters: [6, 6, 6, 6, 6, 6, 5, 5, 5, 4, 4], // plates in each cluster, bottom up
  clusterTurn: 58,     // degrees between one cluster and the next
  turn: 5,             // degrees each plate turns within a cluster
  shift: 6,            // the first plate of a cluster sits this far off the rod
  step: 2.6,           // and each plate after it this much further out
  // (both at full size; they shrink with the plates)
  fullSide: 66,
  bodySide: [[0, 54], [6, 60], [16, 76], [22, 76], [27, 68], [30, 58],
             [36, 48], [41, 40], [46, 33], [51, 26], [55, 21], [58, 17]],
  bodyAspect: 1.25,    // long side / short side
  steeple: 44,         // the short steeple on the last plate
  steepleBase: 0.85,   // its base, as a fraction of the last plate's short side
  mast: 30,
  cables: 0,
};

const lerp = (a, b, t) => a + (b - a) * t;
const rad = d => d * Math.PI / 180;

// Piecewise-linear lookup in a [[x, y], ...] table.
export function curve(table, x) {
  if (x <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    const [x1, y1] = table[i];
    if (x <= x1) { const [x0, y0] = table[i - 1]; return lerp(y0, y1, (x - x0) / (x1 - x0)); }
  }
  return table[table.length - 1][1];
}

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

// A plate's outline: a rectangle running along direction `angle` from `-back`
// to `reach` past the rod, `width` across, shifted sideways by `offset`.
// Counter-clockwise from above, in the order the loft expects.
export function plateOutline({ reach, back, width, offset = 0, angle }) {
  const h = width / 2;
  return [[reach, offset + h], [reach, offset - h], [-back, offset - h], [-back, offset + h]]
    .map(([x, z]) => rotY([x, 0, z], angle));
}

function shrink(pl, d) {
  return { ...pl, reach: pl.reach - d, back: pl.back - d, width: pl.width - 2 * d };
}

// One plate as a floor: glass storey below, slab on top.
function floorSolids(name, plate, f, p) {
  // the glass starts a hair above the slab below, so no two faces share a plane
  const base = p.plaza + f * p.floor, y2 = base + p.floor;
  const y0 = base + 0.05, y1 = y2 - p.slab - 0.05;
  const at = (outline, y) => outline.map(([x, , z]) => [x, y, z]);
  const glass = plateOutline(shrink(plate, p.inset));
  const slab = plateOutline(plate);
  return [
    { name: `${name}.glass`, kind: 'glass', floor: f, ...loft(at(glass, y0), at(glass, y1)) },
    { name: `${name}.slab`, kind: 'slab', floor: f, plate, ...loft(at(slab, y2 - p.slab), at(slab, y2)) },
  ];
}

// Every plate in the tower, as { name, floor, part, plate }.
export function plates(p = PARAMS) {
  const out = [];
  let f = 0;
  p.clusters.forEach((n, g) => {
    for (let j = 0; j < n; j++, f++) {
      const side = curve(p.bodySide, f), long = side * Math.sqrt(p.bodyAspect), short = side / Math.sqrt(p.bodyAspect);
      const theta = rad(g * p.clusterTurn + j * p.turn);
      // each cluster pushes out along its plates' long direction, alternating
      // ends, so successive tiers lean out to opposite sides; how far scales
      // with the plates, so the small clusters up top keep the same rhythm
      const scale = side / p.fullSide;
      const out_ = (p.shift + j * p.step) * scale * (g % 2 ? -1 : 1);
      out.push({
        name: `body${f}`, floor: f, part: 'body', cluster: g,
        plate: { reach: long / 2 + out_, back: long / 2 - out_, width: short, offset: 0, angle: theta },
      });
    }
  });
  return out;
}

export function floorCount(p = PARAMS) {
  return p.clusters.reduce((a, b) => a + b, 0);
}

// The steeple: a slender square pyramid on the rod, standing on the last
// plate and turned with it.
export function steeple(p = PARAMS, last) {
  const y0 = p.plaza + floorCount(p) * p.floor, y1 = y0 + p.steeple;
  const h = last.plate.width * p.steepleBase / 2, tip = 0.4;
  const sq = (r, y) => [[r, y, r], [r, y, -r], [-r, y, -r], [-r, y, r]].map(v => rotY(v, last.plate.angle));
  return { name: 'steeple', kind: 'sail', part: 'steeple', ...loft(sq(h, y0), sq(tip, y1)) };
}

export function buildTower(p = PARAMS) {
  const all = plates(p);
  const solids = all.flatMap(({ name, plate, floor, part }) =>
    floorSolids(name, plate, floor, p).map(s => ({ ...s, part })));
  solids.push(steeple(p, all.at(-1)));
  // the mast stands on the steeple: the model's brass rod, carried on up
  const yTop = p.plaza + floorCount(p) * p.floor + p.steeple;
  return {
    params: p,
    plates: all,
    solids,
    cables: [],
    mast: { from: [0, yTop, 0], to: [0, yTop + p.mast, 0], radius: 0.8 },
    height: yTop + p.mast,
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
