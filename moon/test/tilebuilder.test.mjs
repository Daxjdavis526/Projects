/* Headless checks on tile geometry.

   The two properties that matter: neighbouring tiles agree exactly along their
   shared edge (otherwise the surface has cracks and the player falls through),
   and the height grid handed to the physics is the same surface the GPU draws
   (otherwise your boots hover or sink). */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTile, heightInTile, buildHorizon, horizonQuadrant } from '../src/terrain/tilebuilder.js';
import { faceUvToUnit, tileVertexUv, edgeArc, vertexSpacing,
         tileForLatLon } from '../src/terrain/cubesphere.js';
import { Heightfield, Raster } from '../src/terrain/heightfield.js';
import { Detail } from '../src/terrain/detail.js';
import { loadVendoredHeightfield } from '../src/terrain/loader.js';
import { unitToLl } from '../src/physics/frames.js';
import { R_MOON } from '../src/config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, '..', 'data');

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* A smooth analytic surface makes the geometry checks exact. */
const analytic = {
  heightAt(lat, lon) {
    return 800 * Math.sin(lat * 0.07) * Math.cos(lon * 0.05) + 40 * Math.sin(lon * 1.3);
  },
};

console.log('tile geometry');
{
  const t = buildTile({ face: 0, level: 6, i: 20, j: 20, verts: 33, apron: 8 }, analytic);
  const n = 33 * 33;
  check('vertex and index counts are right',
    t.positions.length === (n + 4 * 33) * 3 && t.index.length === 32 * 32 * 6 + 32 * 6 * 4,
    `${t.positions.length / 3} vertices, ${t.index.length / 3} triangles`);

  check('positions are small enough for float32',
    t.bounds.radius < edgeArc(6), (t.bounds.radius / 1000).toFixed(1) + ' km from the tile centre');

  /* Every vertex must be exactly where the heightfield says the surface is. */
  let worst = 0;
  for (let b = 0; b < 33; b++) {
    for (let a = 0; a < 33; a++) {
      const uv = tileVertexUv(6, 20, 20, a, b, 33);
      const d = faceUvToUnit(0, uv.u, uv.v);
      const ll = unitToLl(d.x, d.y, d.z);
      const want = R_MOON + analytic.heightAt(ll.lat, ll.lon);
      const idx = (b * 33 + a) * 3;
      const got = Math.hypot(t.positions[idx] + t.centre.x,
                             t.positions[idx + 1] + t.centre.y,
                             t.positions[idx + 2] + t.centre.z);
      worst = Math.max(worst, Math.abs(got - want));
    }
  }
  check('every vertex sits on the surface the heightfield defines', worst < 0.02,
    worst.toExponential(1) + ' m worst');

  let normalsUnit = true;
  for (let i = 0; i < n; i++) {
    const l = Math.hypot(t.normals[i * 3], t.normals[i * 3 + 1], t.normals[i * 3 + 2]);
    if (Math.abs(l - 1) > 1e-5) normalsUnit = false;
  }
  check('normals are unit length', normalsUnit);

  /* Skirt vertices hang below the edge they copy. */
  const edgeIdx = 0, skirtIdx = n;
  const dEdge = Math.hypot(t.positions[edgeIdx * 3] + t.centre.x,
                           t.positions[edgeIdx * 3 + 1] + t.centre.y,
                           t.positions[edgeIdx * 3 + 2] + t.centre.z);
  const dSkirt = Math.hypot(t.positions[skirtIdx * 3] + t.centre.x,
                            t.positions[skirtIdx * 3 + 1] + t.centre.y,
                            t.positions[skirtIdx * 3 + 2] + t.centre.z);
  check('skirts hang below the tile edge, in proportion to the tile',
    dSkirt < dEdge && dEdge - dSkirt < edgeArc(6) * 0.01 && dEdge - dSkirt > 0.3,
    (dEdge - dSkirt).toFixed(1) + ' m below a ' + (edgeArc(6) / 1000).toFixed(0) + ' km tile');

  check('the height grid is kept for the physics', t.heights.length === n);
}

console.log('neighbouring tiles');
{
  const a = buildTile({ face: 0, level: 6, i: 20, j: 20, verts: 33, apron: 8 }, analytic);
  const b = buildTile({ face: 0, level: 6, i: 21, j: 20, verts: 33, apron: 8 }, analytic);
  /* The east edge of a is the west edge of b. Positions are relative to
     different centres, so compare in world coordinates. */
  let worst = 0;
  for (let r = 0; r < 33; r++) {
    const ia = (r * 33 + 32) * 3, ib = (r * 33) * 3;
    worst = Math.max(worst, Math.abs((a.positions[ia] + a.centre.x) - (b.positions[ib] + b.centre.x)));
    worst = Math.max(worst, Math.abs((a.positions[ia + 1] + a.centre.y) - (b.positions[ib + 1] + b.centre.y)));
    worst = Math.max(worst, Math.abs((a.positions[ia + 2] + a.centre.z) - (b.positions[ib + 2] + b.centre.z)));
  }
  check('shared edges match to float32 precision', worst < 0.02, worst.toExponential(1) + ' m');

  /* Normals must match too, or the lighting seams even when the geometry does
     not. This is what the apron is for. */
  let worstN = 0;
  for (let r = 1; r < 32; r++) {
    const ia = (r * 33 + 32) * 3, ib = (r * 33) * 3;
    for (let c = 0; c < 3; c++) worstN = Math.max(worstN, Math.abs(a.normals[ia + c] - b.normals[ib + c]));
  }
  check('normals match across the seam (the apron earning its keep)', worstN < 1e-5,
    worstN.toExponential(1));

  /* A child covers exactly one quadrant of its parent. */
  const parent = buildTile({ face: 0, level: 6, i: 20, j: 20, verts: 33, apron: 8 }, analytic);
  const child = buildTile({ face: 0, level: 7, i: 40, j: 40, verts: 33, apron: 8 }, analytic);
  const pw = Math.hypot(parent.positions[0] + parent.centre.x,
                        parent.positions[1] + parent.centre.y,
                        parent.positions[2] + parent.centre.z);
  const cw = Math.hypot(child.positions[0] + child.centre.x,
                        child.positions[1] + child.centre.y,
                        child.positions[2] + child.centre.z);
  check('a child starts at its parent\'s corner', Math.abs(pw - cw) < 0.02,
    Math.abs(pw - cw).toExponential(1) + ' m');
}

console.log('physics agrees with what is drawn');
{
  const t = buildTile({ face: 2, level: 10, i: 300, j: 512, verts: 33, apron: 8 }, analytic);
  let worst = 0;
  for (let b = 0; b < 32; b++) {
    for (let a = 0; a < 32; a++) {
      /* At a vertex the interpolation must return the vertex height exactly. */
      worst = Math.max(worst, Math.abs(heightInTile(t, a, b) - t.heights[b * 33 + a]));
    }
  }
  check('height lookup is exact at vertices', worst < 1e-4, worst.toExponential(1) + ' m');

  /* Inside a triangle it must stay between the corner heights. */
  let inside = true;
  for (let k = 0; k < 200; k++) {
    const a = Math.random() * 31, b = Math.random() * 31;
    const a0 = Math.floor(a), b0 = Math.floor(b);
    const hs = [t.heights[b0 * 33 + a0], t.heights[b0 * 33 + a0 + 1],
                t.heights[(b0 + 1) * 33 + a0], t.heights[(b0 + 1) * 33 + a0 + 1]];
    const h = heightInTile(t, a, b);
    if (h < Math.min(...hs) - 1e-6 || h > Math.max(...hs) + 1e-6) inside = false;
  }
  check('height lookup stays inside its cell', inside);
}

console.log('horizon map');
{
  /* A cone-shaped hill: from the bottom, the horizon in every direction is the
     rim; from the top, everything is below. */
  const hill = {
    heightAt(lat, lon) {
      const d = Math.hypot(lat - 20, (lon - 30) * Math.cos(20 * Math.PI / 180)) * 111000 / 1000;
      return Math.max(0, 400 - d * 200);          // 400 m high, 2 km radius
    },
  };
  const hillAt = tileForLatLon(12, 20, 30);
  const t = buildTile({ ...hillAt, verts: 33, apron: 16 }, hill);
  check('a horizon angle is stored for every vertex and direction',
    t.horizon.length === 33 * 33 * 8);
  const maxAngle = Math.max(...t.horizon) / 255 * 90;
  check('horizon angles are in range and non-trivial', maxAngle > 0 && maxAngle <= 90,
    maxAngle.toFixed(1) + ' deg highest');

  /* Flat ground: the horizon should be slightly *below* level, because the
     surface curves away. At 300 m the drop is about 3 cm, which is 0.006 deg. */
  const flat = { heightAt: () => 0 };
  const ft = buildTile({ ...tileForLatLon(12, 20, 30), verts: 33, apron: 16 }, flat);
  check('on flat ground the horizon sits at or below the local horizontal',
    Math.max(...ft.horizon) === 0);

  /* A crater floor must see its own rim above the horizontal in every
     direction. That is what makes it go dark when the Sun is low. */
  const bowl = {
    heightAt(lat, lon) {
      const dLat = (lat - 20) * 111000 / 1000, dLon = (lon - 30) * 111000 * Math.cos(20 * Math.PI / 180) / 1000;
      const d = Math.hypot(dLat, dLon);          // km from the centre
      return d < 1.5 ? -300 * (1 - (d / 1.5) ** 2) : 0;
    },
  };
  const bowlAt = tileForLatLon(12, 20, 30);
  const bt = buildTile({ ...bowlAt, verts: 33, apron: 16 }, bowl);
  const centreIdx = (Math.round(bowlAt.b) * 33 + Math.round(bowlAt.a)) * 8;
  let allAbove = true;
  for (let d = 0; d < 8; d++) if (bt.horizon[centreIdx + d] === 0) allAbove = false;
  check('a crater floor sees its rim above the horizontal in all directions', allAbove,
    'lowest ' + (Math.min(...Array.from({ length: 8 }, (_, d) => bt.horizon[centreIdx + d])) / 255 * 90).toFixed(1) + ' deg');

  const q = horizonQuadrant(bt.horizon.far, 33, 0, 0);
  check('a parent quadrant can be handed to a child', q && q.length === 33 * 33 * 8);
}

console.log('on the real Moon');
{
  const { heightfield: hf } = await loadVendoredHeightfield(DATA, { level: 3, mask: false });
  hf.attachDetail(new Detail({ roughness: () => 0.5 }));
  const src = { heightAt: (lat, lon) => hf.heightAt(lat, lon) };

  /* A tile over Tranquility Base, at a level whose vertices are about a metre
     apart, which is where the 2 m NAC window is the layer answering. */
  const t0 = Date.now();
  const at = tileForLatLon(16, 0.67415, 23.47314);
  const t = buildTile({ ...at, verts: 33, apron: 24 }, src);
  const ms = Date.now() - t0;
  check('a real tile builds in well under a second', ms < 600, ms + ' ms');
  check('its vertices are about a metre apart',
    t.spacing > 0.9 && t.spacing < 1.6, t.spacing.toFixed(2) + ' m');
  check('the terrain is not flat', t.bounds.rMax - t.bounds.rMin > 0.05,
    ((t.bounds.rMax - t.bounds.rMin)).toFixed(2) + ' m of relief across 42 m');
  check('it sits about 1.9 km below the datum',
    t.bounds.rMin - R_MOON < -1800 && t.bounds.rMin - R_MOON > -2050,
    (t.bounds.rMin - R_MOON).toFixed(0) + ' m');

  /* An orbital tile: coarse, cheap, and covering hundreds of kilometres. */
  const big = buildTile({ ...tileForLatLon(4, -43.31, -11.36), verts: 33, apron: 8 }, src);
  check('a level 4 tile spans about 170 km', edgeArc(4) > 150000 && edgeArc(4) < 190000,
    (edgeArc(4) / 1000).toFixed(0) + ' km');
  check('a 170 km tile over Tycho has kilometres of relief', big.bounds.rMax - big.bounds.rMin > 500,
    ((big.bounds.rMax - big.bounds.rMin) / 1000).toFixed(2) + ' km');
}

/* The invariant that matters more than any single number here: the surface the
   physics walks on and the surface the renderer draws must be the same surface.
   They are computed by different code on different threads, and when they
   drifted apart -- a streamed raster reaching one and not the other -- the
   player stood ninety metres inside a hillside and looked up through it. */
console.log('the ground you walk on is the ground that is drawn');
{
  const { heightfield: hf } = await loadVendoredHeightfield(DATA);
  hf.attachDetail(new Detail());
  const src = {
    heightAt: (lat, lon, minLambda) => hf.heightAt(lat, lon, minLambda),
    rocksIn: () => [],
  };
  let worst = 0, worstAt = null;
  for (const [lat, lon] of [[0.674, 23.473], [-43.31, -11.36], [-0.042, 179.618],
                            [26.13, 3.633], [-89.6, 129.8]]) {
    for (const level of [12, 15, 17]) {
      const spec = { ...tileForLatLon(level, lat, lon), verts: 33, apron: 8 };
      const t = buildTile(spec, src);
      const spacing = edgeArc(level) / 32;
      /* Compare the tile's own vertices against a fresh query at the same
         place, asking for the same band limit the tile was built with. */
      for (const [a, b] of [[0, 0], [16, 16], [32, 32], [8, 24]]) {
        const uv = tileVertexUv(level, spec.i, spec.j, a, b, 33, { u: 0, v: 0 });
        const d = faceUvToUnit(spec.face, uv.u, uv.v, { x: 0, y: 0, z: 0 });
        const ll = unitToLl(d.x, d.y, d.z, { lat: 0, lon: 0 });
        const drawn = heightInTile(t, a, b);   // grid coordinates, not lat/lon
        const walked = hf.heightAt(ll.lat, ll.lon, spacing * 3);
        if (drawn === null || !Number.isFinite(drawn)) continue;
        const e = Math.abs(drawn - walked);
        if (e > worst) { worst = e; worstAt = `${lat},${lon} L${level}`; }
      }
    }
  }
  check('the drawn surface and the queried surface agree to a centimetre',
    worst < 0.01, `worst ${worst.toFixed(4)} m at ${worstAt}`);
}

console.log(failures === 0 ? '\ntilebuilder: all checks passed' : `\ntilebuilder: ${failures} FAILED`);
process.exit(failures ? 1 : 0);
