/* =============================================================================
   TILEBUILDER — one quadtree tile of geometry
   -----------------------------------------------------------------------------
   Pure JS, so it runs in the terrain workers and in the Node tests.

   A tile is a 33x33 grid of vertices on a cube-sphere face, plus a skirt around
   the edge to hide the crack where it meets a coarser neighbour. Vertices are
   stored relative to the tile's own centre so they fit comfortably in float32:
   a level 18 tile is ten metres across, and the renderer places it by
   subtracting the current floating origin from a double-precision centre.

   Two things beyond positions come out of here.

   The height grid is handed back so the physics can stand on exactly the
   triangles that get drawn, rather than re-deriving a slightly different
   surface and leaving your boots hovering.

   The horizon map is eight angles per vertex, one every 45 degrees of azimuth,
   giving the elevation of the highest terrain in that direction. Comparing the
   Sun's elevation against it is what makes a crater floor go dark when the real
   crater geometry blocks the Sun, at any distance, without needing a shadow map
   that reaches to the horizon. Near-field horizons are marched over the tile's
   own apron; the far field is inherited from the parent tile, so the rings tile
   outwards to hundreds of kilometres for the cost of a few hundred samples.
   ========================================================================== */

import { R_MOON, TERRAIN } from '../config.js';
import { faceUvToUnit, tileVertexUv, tileCentre, edgeArc } from './cubesphere.js';
import { unitToLl } from '../physics/frames.js';

const DEG = Math.PI / 180;

/**
 * @param {object} spec  { face, level, i, j, verts, apron, horizon, rocks }
 * @param {object} src   { heightAt(lat, lon), rocksIn(latMin, lonMin, latMax, lonMax, res)
 *                         , resAt(lat, lon) }
 * @param {Float32Array|null} parentHorizon  the parent tile's far-field rings
 */
export function buildTile(spec, src, parentHorizon = null) {
  const verts = spec.verts ?? TERRAIN.verts;
  const apron = spec.apron ?? TERRAIN.apron;
  const { face, level, i, j } = spec;
  const N = verts + 2 * apron;                 // sampled grid including the apron
  const spacing = edgeArc(level) / (verts - 1);

  /* --- sample the surface, apron included ------------------------------- */
  const H = new Float32Array(N * N);
  const dir = { x: 0, y: 0, z: 0 };
  const ll = { lat: 0, lon: 0 };
  const uv = { u: 0, v: 0 };
  let latMin = 90, latMax = -90, lonMin = 180, lonMax = -180;
  for (let b = 0; b < N; b++) {
    for (let a = 0; a < N; a++) {
      tileVertexUv(level, i, j, a - apron, b - apron, verts, uv);
      faceUvToUnit(face, uv.u, uv.v, dir);
      unitToLl(dir.x, dir.y, dir.z, ll);
      H[b * N + a] = src.heightAt(ll.lat, ll.lon);
      if (a >= apron && a < apron + verts && b >= apron && b < apron + verts) {
        if (ll.lat < latMin) latMin = ll.lat;
        if (ll.lat > latMax) latMax = ll.lat;
        if (ll.lon < lonMin) lonMin = ll.lon;
        if (ll.lon > lonMax) lonMax = ll.lon;
      }
    }
  }

  /* --- centre, in doubles ----------------------------------------------- */
  const c = tileCentre(face, level, i, j);
  const centre = { x: c.x * R_MOON, y: c.y * R_MOON, z: c.z * R_MOON };

  /* --- positions, normals, uv ------------------------------------------- */
  const n = verts * verts;
  const skirtCount = 4 * verts;
  const total = n + skirtCount;
  const positions = new Float32Array(total * 3);
  const normals = new Float32Array(total * 3);
  const uvs = new Float32Array(total * 2);
  const detailXY = new Float32Array(total * 2);
  const heights = new Float32Array(n);
  let rMin = Infinity, rMax = -Infinity;

  const put = (idx, a, b, drop) => {
    const s = (b + apron) * N + (a + apron);
    const h = H[s];
    tileVertexUv(level, i, j, a, b, verts, uv);
    faceUvToUnit(face, uv.u, uv.v, dir);
    unitToLl(dir.x, dir.y, dir.z, ll);
    const r = R_MOON + h - drop;
    positions[idx * 3] = dir.x * r - centre.x;
    positions[idx * 3 + 1] = dir.y * r - centre.y;
    positions[idx * 3 + 2] = dir.z * r - centre.z;

    /* Normal from central differences in the local East/North frame. The apron
       means edge vertices get true neighbours instead of a clamped guess, so
       lighting is continuous across a tile boundary. */
    const hE = H[s + 1], hW = H[s - 1], hN = H[s - N], hS = H[s + N];
    const dhde = (hE - hW) / (2 * spacing);
    const dhdn = (hS - hN) / (2 * spacing);
    const la = ll.lat * DEG, lo = ll.lon * DEG;
    const sla = Math.sin(la), cla = Math.cos(la), slo = Math.sin(lo), clo = Math.cos(lo);
    const ex = -slo, ey = clo, ez = 0;
    const nx = -sla * clo, ny = -sla * slo, nz = cla;
    let vx = dir.x - dhde * ex - dhdn * nx;
    let vy = dir.y - dhde * ey - dhdn * ny;
    let vz = dir.z - dhde * ez - dhdn * nz;
    const vl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
    normals[idx * 3] = vx / vl; normals[idx * 3 + 1] = vy / vl; normals[idx * 3 + 2] = vz / vl;

    /* Equirectangular UV for the global colour map, unwrapped so a tile that
       straddles the date line does not sample the whole texture backwards. */
    uvs[idx * 2] = (ll.lon + 180) / 360;
    uvs[idx * 2 + 1] = (90 - ll.lat) / 180;

    /* Coordinates for the shader's procedural detail, keyed to a coarse world
       lattice so re-basing the floating origin never shifts the pattern. */
    detailXY[idx * 2] = ((dir.x * R_MOON) % 4096 + 4096) % 4096;
    detailXY[idx * 2 + 1] = ((dir.y * R_MOON + dir.z * R_MOON) % 4096 + 4096) % 4096;

    if (drop === 0) {
      if (r < rMin) rMin = r;
      if (r > rMax) rMax = r;
    }
    return h;
  };

  for (let b = 0; b < verts; b++) {
    for (let a = 0; a < verts; a++) {
      const idx = b * verts + a;
      heights[idx] = put(idx, a, b, 0);
    }
  }

  /* --- skirts ------------------------------------------------------------ */
  /* A ring of vertices dropped straight down, so the gap against a coarser
     neighbour is filled by a vertical wall of the same material instead of
     showing black space through the crack. */
  const drop = Math.max(0.35, edgeArc(level) * TERRAIN.skirt);
  let s = n;
  const edges = [];
  for (let a = 0; a < verts; a++) edges.push([a, 0]);
  for (let a = 0; a < verts; a++) edges.push([a, verts - 1]);
  for (let b = 0; b < verts; b++) edges.push([0, b]);
  for (let b = 0; b < verts; b++) edges.push([verts - 1, b]);
  for (const [a, b] of edges) put(s++, a, b, drop);

  /* --- indices ----------------------------------------------------------- */
  const quads = (verts - 1) * (verts - 1);
  const index = new Uint32Array(quads * 6 + (verts - 1) * 6 * 4);
  let k = 0;
  for (let b = 0; b < verts - 1; b++) {
    for (let a = 0; a < verts - 1; a++) {
      /* Counter-clockwise seen from outside: the u tangent crossed with the v
         tangent points away from the Moon on every face. */
      const i0 = b * verts + a, i1 = i0 + 1, i2 = i0 + verts, i3 = i2 + 1;
      index[k++] = i0; index[k++] = i1; index[k++] = i2;
      index[k++] = i1; index[k++] = i3; index[k++] = i2;
    }
  }
  const skirtBase = n;
  /* Each skirt wall faces away from the tile it hangs off, so two of the four
     edges need the opposite winding from the other two. */
  const stitch = (edgeIdx, topOf, flip) => {
    const base = skirtBase + edgeIdx * verts;
    for (let a = 0; a < verts - 1; a++) {
      const t0 = topOf(a), t1 = topOf(a + 1), b0 = base + a, b1 = base + a + 1;
      if (flip) {
        index[k++] = t0; index[k++] = t1; index[k++] = b0;
        index[k++] = t1; index[k++] = b1; index[k++] = b0;
      } else {
        index[k++] = t0; index[k++] = b0; index[k++] = t1;
        index[k++] = t1; index[k++] = b0; index[k++] = b1;
      }
    }
  };
  stitch(0, (a) => a, false);                            // b = 0
  stitch(1, (a) => (verts - 1) * verts + a, true);       // b = verts-1
  stitch(2, (b) => b * verts, true);                     // a = 0
  stitch(3, (b) => b * verts + (verts - 1), false);      // a = verts-1

  /* --- horizon map ------------------------------------------------------- */
  /* Only tiles whose vertices are metres apart march their own horizon. On a
     level 17 tile the neighbouring vertex is 65 cm away, so a 20 cm bump there
     subtends 17 degrees and every vertex would decide it was in the shadow of
     the one next to it. The horizon map is about crater rims and mountains, not
     about gravel: fine tiles inherit the rings their parent measured, and the
     shadow map handles everything close enough to matter. */
  const horizon = spec.horizon === false ? null
    : (spacing >= HORIZON_MIN_SPACING || !parentHorizon
        ? buildHorizon(H, N, apron, verts, spacing, parentHorizon)
        : inheritHorizon(parentHorizon, verts));

  /* --- rocks ------------------------------------------------------------- */
  let rocks = null;
  if (spec.rocks && src.rocksIn) {
    const list = src.rocksIn(latMin, lonMin, latMax, lonMax);
    rocks = new Float32Array(list.length * 5);
    for (let r = 0; r < list.length; r++) {
      const rk = list[r];
      faceUvToUnit(face, 0, 0, dir);                    // reuse dir
      const la = rk.lat * DEG, lo = rk.lon * DEG, cl = Math.cos(la);
      const px = cl * Math.cos(lo), py = cl * Math.sin(lo), pz = Math.sin(la);
      const rr = R_MOON + src.heightAt(rk.lat, rk.lon);
      rocks[r * 5] = px * rr - centre.x;
      rocks[r * 5 + 1] = py * rr - centre.y;
      rocks[r * 5 + 2] = pz * rr - centre.z;
      rocks[r * 5 + 3] = rk.radius;
      rocks[r * 5 + 4] = rk.tilt;
    }
  }

  return {
    key: `${face}:${level}:${i}:${j}`,
    face, level, i, j, verts,
    centre,
    positions, normals, uv: uvs, detail: detailXY, index, heights, horizon, rocks,
    bounds: {
      rMin, rMax,
      radius: boundingRadius(positions, n),
      latMin, latMax, lonMin, lonMax,
    },
    spacing,
  };
}

function boundingRadius(positions, n) {
  let m = 0;
  for (let i = 0; i < n; i++) {
    const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
    const d = x * x + y * y + z * z;
    if (d > m) m = d;
  }
  return Math.sqrt(m);
}

/* --- horizon map ------------------------------------------------------------
   For each of eight compass directions, the angle above the local horizontal of
   the highest thing in that direction. Stored as a byte, 0 to 90 degrees.

   The near field is marched over the tile's own sampled grid, apron included, so
   it reaches half a tile beyond the edge. The far field comes from the parent,
   whose samples are twice as coarse and reach twice as far; chaining that up the
   tree covers hundreds of kilometres, which is as far as the curvature of a
   1737 km sphere lets anything be visible anyway. */

const DIRS = 8;
const DX = [0, 1, 1, 1, 0, -1, -1, -1];      // east is +a, north is -b
const DY = [-1, -1, 0, 1, 1, 1, 0, -1];

/* Below this vertex spacing a tile stops measuring its own horizon. */
export const HORIZON_MIN_SPACING = 4.0;      // metres

/** Turn a parent's far-field rings straight into a child's stored horizon. */
export function inheritHorizon(parentHorizon, verts) {
  const out = new Uint8Array(verts * verts * DIRS);
  const far = new Float32Array(verts * verts * DIRS);
  for (let i = 0; i < far.length; i++) {
    far[i] = parentHorizon[i];
    out[i] = Math.max(0, Math.min(255, Math.round(parentHorizon[i] / (Math.PI / 2) * 255)));
  }
  out.far = far;
  return out;
}

export function buildHorizon(H, N, apron, verts, spacing, parentHorizon) {
  const out = new Uint8Array(verts * verts * DIRS);
  const far = new Float32Array(verts * verts * DIRS);
  const steps = Math.max(4, apron);
  for (let b = 0; b < verts; b++) {
    for (let a = 0; a < verts; a++) {
      const s = (b + apron) * N + (a + apron);
      const h0 = H[s];
      const o = (b * verts + a) * DIRS;
      for (let d = 0; d < DIRS; d++) {
        const dx = DX[d], dy = DY[d];
        const diag = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
        let best = -Math.PI / 2;
        for (let t = 1; t <= steps; t++) {
          const ax = a + apron + dx * t, ay = b + apron + dy * t;
          if (ax < 0 || ay < 0 || ax >= N || ay >= N) break;
          const dh = H[ay * N + ax] - h0;
          const dist = t * spacing * diag;
          /* Subtract the drop of the sphere over that distance: the horizon of
             a flat plain is below the local horizontal, not level with it. */
          const angle = Math.atan2(dh - dist * dist / (2 * R_MOON), dist);
          if (angle > best) best = angle;
        }
        /* Inherit whatever the parent could see beyond the apron. */
        let inherited = -Math.PI / 2;
        if (parentHorizon) {
          inherited = sampleParentHorizon(parentHorizon, verts, a, b, d);
        }
        const combined = Math.max(best, inherited);
        far[o + d] = combined;
        out[o + d] = Math.max(0, Math.min(255,
          Math.round(combined / (Math.PI / 2) * 255)));
      }
    }
  }
  out.far = far;
  return out;
}

/**
 * Bilinear lookup into the parent's horizon rings. A child covers one quadrant
 * of its parent, so vertex (a, b) of the child sits at (a/2, b/2) of the parent
 * plus the quadrant offset, which the caller has already folded into the array
 * it passes in.
 */
function sampleParentHorizon(parent, verts, a, b, d) {
  if (!parent || !parent.length) return -Math.PI / 2;
  const pa = a / 2, pb = b / 2;
  const a0 = Math.min(verts - 1, Math.floor(pa)), b0 = Math.min(verts - 1, Math.floor(pb));
  const a1 = Math.min(verts - 1, a0 + 1), b1 = Math.min(verts - 1, b0 + 1);
  const fa = pa - a0, fb = pb - b0;
  const g = (aa, bb) => parent[(bb * verts + aa) * DIRS + d];
  return (g(a0, b0) * (1 - fa) + g(a1, b0) * fa) * (1 - fb) +
         (g(a0, b1) * (1 - fa) + g(a1, b1) * fa) * fb;
}

/**
 * Extract the quadrant of a parent's far-field horizon that a child needs, so
 * the child's own buildHorizon call can inherit it directly.
 */
export function horizonQuadrant(parentFar, verts, quadA, quadB) {
  if (!parentFar) return null;
  const out = new Float32Array(verts * verts * DIRS);
  const off = (verts - 1) / 2;
  for (let b = 0; b < verts; b++) {
    for (let a = 0; a < verts; a++) {
      const pa = Math.min(verts - 1, Math.round(a / 2 + quadA * off));
      const pb = Math.min(verts - 1, Math.round(b / 2 + quadB * off));
      for (let d = 0; d < DIRS; d++) {
        out[(b * verts + a) * DIRS + d] = parentFar[(pb * verts + pa) * DIRS + d];
      }
    }
  }
  return out;
}

/**
 * Height at an arbitrary point inside a built tile, from its own height grid,
 * using the same triangulation the GPU draws. This is what the player stands on.
 */
export function heightInTile(tile, a, b) {
  const v = tile.verts;
  const x = Math.min(v - 1.001, Math.max(0, a));
  const y = Math.min(v - 1.001, Math.max(0, b));
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const h = tile.heights;
  const h00 = h[y0 * v + x0], h10 = h[y0 * v + x0 + 1];
  const h01 = h[(y0 + 1) * v + x0], h11 = h[(y0 + 1) * v + x0 + 1];
  /* Match the triangle split used when the indices were generated. */
  return fx + fy < 1
    ? h00 + (h10 - h00) * fx + (h01 - h00) * fy
    : h11 + (h01 - h11) * (1 - fx) + (h10 - h11) * (1 - fy);
}
