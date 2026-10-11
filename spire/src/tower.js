// =============================================================================
// The tower, as numbers.
//
// The master is the architect's acrylic study model: a stack of clear plates
// on a brass rod, one plate a floor. Read from it, plate by plate:
//
//   - the body: one big, nearly square plate a level, threaded on the rod
//     off centre. The plates come in clusters of about six: within a cluster
//     each plate steps a little further out and turns a little, and each new
//     cluster starts sharply round from the last, leaning out the other way.
//     That gives the model its fanned, tiered, twisting look;
//   - the top of the body steps in quickly as a small pyramid of squares
//     round the rod;
//   - above it rises a triangle of long plates: one end of each stands
//     straight over the last, beside the rod, while the other steps back on a
//     diagonal - the tall triangle of the pen sketch. The acrylic model stops
//     part-way up it; here it is carried on to its point, and the mast (the
//     model's brass rod) stands on top.
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
  // body: one big, nearly square plate a level, threaded on the rod off
  // centre. The plates come in clusters: within a cluster each plate steps a
  // little further out and turns a little; each new cluster starts sharply
  // round from the last. That is the model's tiered, fanned look.
  bodyFloors: 31,
  cluster: 6,          // plates per cluster
  clusterTurn: 58,     // degrees between one cluster and the next
  turn: 5,             // degrees each plate turns within a cluster
  shift: 6,            // the first plate of a cluster sits this far off the rod
  step: 2.6,           // and each plate after it this much further out
  bodySide: [[0, 54], [6, 60], [16, 76], [22, 76], [27, 68], [30, 58]],
  bodyAspect: 1.25,    // long side / short side
  // the pyramid of squares that caps the body: side by floor
  pyramid: [[29, 52], [37, 10]],
  // the triangle: plates from floor 26 up to its point
  sailFrom: 26,
  sailTo: 62,
  sailBack: 9,         // its vertical edge stands this far behind the rod
  sailWidth: 22,
  sailTurn: 1,         // degrees each sail plate turns
  sailTurn0: 200,      // the sail's direction at its foot, degrees
  // length of a sail plate from its vertical edge, by floor
  sailLength: [[26, 58], [33, 50], [48, 26], [62, 5]],
  mast: 46,
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
  for (let f = 0; f < p.bodyFloors; f++) {
    const side = curve(p.bodySide, f), long = side * Math.sqrt(p.bodyAspect), short = side / Math.sqrt(p.bodyAspect);
    const g = Math.floor(f / p.cluster), j = f % p.cluster;
    const theta = rad(g * p.clusterTurn + j * p.turn);
    // each cluster pushes out along its plates' long direction, alternating
    // ends, so successive tiers lean out to opposite sides
    const out_ = (p.shift + j * p.step) * (g % 2 ? -1 : 1);
    out.push({
      name: `body${f}`, floor: f, part: 'body',
      plate: { reach: long / 2 + out_, back: long / 2 - out_, width: short, offset: 0, angle: theta },
    });
  }
  for (let f = p.pyramid[0][0]; f <= p.pyramid[1][0]; f++) {
    const side = curve(p.pyramid, f);
    out.push({
      name: `pyramid${f}`, floor: f, part: 'pyramid',
      plate: { reach: side / 2, back: side / 2, width: side, angle: rad(f * p.turn) },
    });
  }
  for (let f = p.sailFrom; f <= p.sailTo; f++) {
    out.push({
      name: `sail${f}`, floor: f, part: 'sail',
      plate: {
        reach: curve(p.sailLength, f) - p.sailBack, back: p.sailBack, width: p.sailWidth,
        angle: rad(p.sailTurn0 + (f - p.sailFrom) * p.sailTurn),
      },
    });
  }
  return out;
}

export function buildTower(p = PARAMS) {
  const all = plates(p);
  const solids = all.flatMap(({ name, plate, floor, part }) =>
    floorSolids(name, plate, floor, p).map(s => ({ ...s, part })));
  // the mast stands on the triangle's last plate, on its vertical edge
  const top = all.filter(x => x.part === 'sail').at(-1);
  const edge = rotY([-top.plate.back + 1.2, 0, 0], top.plate.angle);
  const yTop = p.plaza + (top.floor + 1) * p.floor;
  const mastBase = [edge[0], yTop, edge[2]];
  return {
    params: p,
    plates: all,
    solids,
    cables: [],
    mast: { from: mastBase, to: [edge[0], yTop + p.mast, edge[2]], radius: 0.9 },
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
