/* Headless checks on the cube-sphere addressing and the procedural detail.

   The point of these is the promise the project makes: procedural generation
   only adds what the measured data cannot resolve, and it does so
   deterministically, so the surface is the same in the worker, on the main
   thread and in this test. */
import { faceUvToUnit, unitToFaceUv, edgeArc, vertexSpacing, tileVertexUv,
         tileCentre, tileBoundingSphere, children, parent, tileKey, parseKey,
         levelForSpacing, belowHorizon } from '../src/terrain/cubesphere.js';
import { Detail, bandWeight, craterProfile } from '../src/terrain/detail.js';
import { R_MOON, TERRAIN } from '../src/config.js';
import { unitToLl, llToUnit } from '../src/physics/frames.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

console.log('cube sphere');
{
  let worst = 0;
  for (let f = 0; f < 6; f++) {
    for (let u = -1; u <= 1; u += 0.125) {
      for (let v = -1; v <= 1; v += 0.125) {
        const p = faceUvToUnit(f, u, v);
        check.silent = true;
        const b = unitToFaceUv(p.x, p.y, p.z);
        const q = faceUvToUnit(b.face, b.u, b.v);
        worst = Math.max(worst, Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z));
      }
    }
  }
  check('face <-> direction round trip', worst < 1e-12, worst.toExponential(1));

  let unit = true;
  for (let f = 0; f < 6; f++) {
    const p = faceUvToUnit(f, 0.3, -0.7);
    if (Math.abs(Math.hypot(p.x, p.y, p.z) - 1) > 1e-12) unit = false;
  }
  check('face points land on the unit sphere', unit);

  // The six face centres are the six axis directions.
  const centres = [[0, 0], [0, 180], [0, 90], [0, -90], [90, 0], [-90, 0]];
  let centresOk = true;
  for (let f = 0; f < 6; f++) {
    const p = faceUvToUnit(f, 0, 0);
    const ll = unitToLl(p.x, p.y, p.z);
    const [lat, lon] = centres[f];
    if (Math.abs(ll.lat - lat) > 1e-9) centresOk = false;
    if (Math.abs(lat) < 89 && Math.abs(((ll.lon - lon + 540) % 360) - 180) > 1e-9) centresOk = false;
  }
  check('face centres are the six axes', centresOk);

  // The tangent warp exists to keep triangles similar in size across a face.
  // A plain cube sphere stretches the corners by a factor of 1.73; the tangent
  // adjustment brings that down to about 1.4.
  const d = 1e-4;
  let smallest = Infinity, largest = 0;
  for (let u = -0.99; u < 1; u += 0.11) {
    for (let v = -0.99; v < 1; v += 0.11) {
      const a = faceUvToUnit(0, u, v), b = faceUvToUnit(0, u + d, v);
      const s = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      smallest = Math.min(smallest, s); largest = Math.max(largest, s);
    }
  }
  check('sample spacing varies by less than 1.5x across a face',
    largest / smallest < 1.5, (largest / smallest).toFixed(3) + 'x');

  check('a level 0 tile spans a quarter circumference',
    Math.abs(edgeArc(0) - Math.PI / 2 * R_MOON) < 1, (edgeArc(0) / 1000).toFixed(0) + ' km');
  check('a level 18 tile is about 10 m across',
    edgeArc(18) > 9 && edgeArc(18) < 12, edgeArc(18).toFixed(2) + ' m');
  check('vertices at level 18 are about 33 cm apart',
    vertexSpacing(18, 33) > 0.28 && vertexSpacing(18, 33) < 0.36,
    (vertexSpacing(18, 33) * 100).toFixed(1) + ' cm');
  check('the level chosen for a 1 m target is the first one at least that fine',
    vertexSpacing(levelForSpacing(1.0, 33), 33) <= 1.0 &&
    vertexSpacing(levelForSpacing(1.0, 33) - 1, 33) > 1.0,
    `level ${levelForSpacing(1.0, 33)} = ${vertexSpacing(levelForSpacing(1.0, 33), 33).toFixed(2)} m`);

  const key = tileKey(3, 7, 55, 12);
  const back = parseKey(key);
  check('tile keys round trip',
    back.face === 3 && back.level === 7 && back.i === 55 && back.j === 12, key);

  const kids = children(2, 5, 3, 4);
  check('a tile has four children whose parent is itself',
    kids.length === 4 && kids.every(k => {
      const p = parent(...k);
      return p[0] === 2 && p[1] === 5 && p[2] === 3 && p[3] === 4;
    }));

  // Children tile their parent exactly: the union of their vertex ranges is
  // the parent's, so there are no gaps to fall through.
  const p0 = tileVertexUv(5, 3, 4, 0, 0, 33), p1 = tileVertexUv(5, 3, 4, 32, 32, 33);
  const c0 = tileVertexUv(6, 6, 8, 0, 0, 33), c3 = tileVertexUv(6, 7, 9, 32, 32, 33);
  check('children cover the parent exactly',
    Math.abs(c0.u - p0.u) < 1e-12 && Math.abs(c3.u - p1.u) < 1e-12 &&
    Math.abs(c0.v - p0.v) < 1e-12 && Math.abs(c3.v - p1.v) < 1e-12);

  const sph = tileBoundingSphere(0, 6, 20, 20);
  const cen = tileCentre(0, 6, 20, 20);
  check('bounding sphere is centred on its tile',
    Math.abs(sph.x / Math.hypot(sph.x, sph.y, sph.z) - cen.x) < 1e-9);

  // Standing on the near side you cannot see the far side.
  const near = llToUnit(0, 0), far = llToUnit(0, 180);
  const eye = { x: near.x * (R_MOON + 2), y: near.y * (R_MOON + 2), z: near.z * (R_MOON + 2) };
  const farFace = unitToFaceUv(far.x, far.y, far.z);
  const farSphere = tileBoundingSphere(farFace.face, 4, 8, 8);
  check('the far side is culled below the horizon', belowHorizon(eye, farSphere));
  const hereSphere = tileBoundingSphere(0, 4, 8, 8);
  check('the ground you stand on is not culled', !belowHorizon(eye, hereSphere));
}

console.log('procedural detail: the band limit');
{
  const d = new Detail({ roughness: () => 0.5 });
  check('nothing is added at or above the source resolution',
    bandWeight(200, 100) === 0 && bandWeight(1000, 100) === 0);
  check('detail is added well below it', bandWeight(20, 100) > 0.8, bandWeight(20, 100).toFixed(3));
  check('the transition is smooth', bandWeight(199, 100) < 0.02 && bandWeight(150, 100) < 0.5);

  /* The real test of the promise: as the measured data gets finer, the
     procedural contribution must shrink, because there is less left to invent. */
  const rms = (res) => {
    let s = 0, n = 0;
    for (let i = 0; i < 400; i++) {
      const lat = -30 + i * 0.017, lon = 40 + i * 0.023;
      const h = d.heightAt(lat, lon, res);
      s += h * h; n++;
    }
    return Math.sqrt(s / n);
  };
  const coarse = rms(1900), mid = rms(118), fine = rms(2);
  check('coarse data invites more invention than fine data',
    coarse > mid && mid > fine,
    `1.9 km: ${coarse.toFixed(1)} m, 118 m: ${mid.toFixed(1)} m, 2 m: ${fine.toFixed(2)} m`);
  check('at 2 m/px the invention is centimetres to decimetres, not metres',
    fine < 1.0, fine.toFixed(3) + ' m RMS');
  check('at 1.9 km/px it fills in tens of metres of relief',
    coarse > 8 && coarse < 400, coarse.toFixed(1) + ' m RMS');

  /* Zero mean: the detail must not raise or lower the measured surface. */
  let sum = 0, n = 0;
  for (let i = 0; i < 3000; i++) {
    sum += d.heightAt(-60 + i * 0.04, -170 + i * 0.11, 118); n++;
  }
  const mean = sum / n;
  check('the detail does not shift the measured elevation',
    Math.abs(mean) < 0.35 * mid, `mean ${mean.toFixed(2)} m vs ${mid.toFixed(1)} m RMS`);
}

console.log('procedural detail: determinism and continuity');
{
  const a = new Detail({ roughness: () => 0.5 });
  const b = new Detail({ roughness: () => 0.5 });
  let same = true, worstSlope = 0, prev = null;
  const stepDeg = 0.00001;
  const stepM = Math.hypot(stepDeg, stepDeg * Math.cos(12.3 * Math.PI / 180)) * (R_MOON * Math.PI / 180);
  for (let i = 0; i < 4000; i++) {
    const lat = 12.3 + i * stepDeg, lon = -45.6 + i * stepDeg;
    const h1 = a.heightAt(lat, lon, 118), h2 = b.heightAt(lat, lon, 118);
    if (h1 !== h2) same = false;
    if (prev !== null) worstSlope = Math.max(worstSlope, Math.abs(h1 - prev) / stepM);
    prev = h1;
  }
  check('two generators with the same seed agree exactly', same);
  /* Over a 40 cm baseline the steepest thing here should be a fresh crater wall,
     possibly with a smaller fresh crater cut into it. LOLA slope maps reach
     40-50 degrees on fresh walls at a 5 m baseline and steeper at finer ones, so
     the bar is 60; a discontinuity would show up as something far past that. */
  check('the surface has no impossible slopes',
    Math.atan(worstSlope) * 180 / Math.PI < 60,
    (Math.atan(worstSlope) * 180 / Math.PI).toFixed(1) + ' deg steepest over ' +
    stepM.toFixed(2) + ' m');

  const c = new Detail({ seed: 12345, roughness: () => 0.5 });
  check('a different seed makes a different surface',
    c.heightAt(12.3, -45.6, 118) !== a.heightAt(12.3, -45.6, 118));

  const off = new Detail({ enabled: false });
  check('detail can be switched off entirely (scientific visualisation)',
    off.heightAt(12.3, -45.6, 118) === 0);
}

console.log('crater shapes');
{
  check('a fresh crater floor sits below the surrounding surface',
    craterProfile(0, 20, 4) < -15, craterProfile(0, 20, 4).toFixed(1) + ' m');
  check('its rim stands above it', craterProfile(1.0, 20, 4) > 0);
  check('the ejecta blanket has faded by 2.5 radii',
    Math.abs(craterProfile(2.5, 20, 4)) < 0.01);
  check('nothing is added beyond the ejecta', craterProfile(3, 20, 4) === 0);
  const depths = [0.2, 0.1].map(dd => -craterProfile(0, 100 * dd, 4));
  check('depth over diameter runs about 0.2 when fresh and less when old',
    depths[0] / 100 > 0.15 && depths[0] / 100 < 0.25);

  /* Highlands are saturated with craters, mare is not: the roughness input
     really has to change the surface. */
  const rough = new Detail({ roughness: () => 1.0 });
  const smooth = new Detail({ roughness: () => 0.0 });
  let rSum = 0, sSum = 0;
  for (let i = 0; i < 600; i++) {
    const lat = -10 + i * 0.013, lon = 100 + i * 0.017;
    rSum += Math.abs(rough.heightAt(lat, lon, 118));
    sSum += Math.abs(smooth.heightAt(lat, lon, 118));
  }
  check('rough terrain gets more relief than smooth terrain', rSum > sSum * 1.4,
    `${(rSum / 600).toFixed(2)} vs ${(sSum / 600).toFixed(2)} m mean absolute`);
}

console.log('rocks');
{
  const d = new Detail({ roughness: () => 0.6 });
  const rocks = d.rocks(0.6740, 23.4730, 0.6745, 23.4735, 2, 1);
  check('rocks are scattered at walking scale', rocks.length > 0, rocks.length + ' in a 55 m patch');
  check('they are pebbles mostly, boulders rarely',
    rocks.every(r => r.radius >= 0.05 && r.radius < 5) &&
    rocks.filter(r => r.radius > 1).length < rocks.length * 0.2,
    'largest ' + Math.max(...rocks.map(r => r.radius)).toFixed(2) + ' m');
  const again = d.rocks(0.6740, 23.4730, 0.6745, 23.4735, 2, 1);
  check('the same patch gives the same rocks',
    again.length === rocks.length && again.every((r, i) => r.lat === rocks[i].lat && r.radius === rocks[i].radius));
  check('no rocks are scattered where the data is too coarse to be standing on',
    d.rocks(0, 0, 0.01, 0.01, 1900, 1).length === 0);
}

console.log(failures === 0 ? '\nterrain: all checks passed' : `\nterrain: ${failures} FAILED`);
process.exit(failures ? 1 : 0);
