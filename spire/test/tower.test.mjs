// Headless checks on the tower's form: node spire/test/tower.test.mjs
import assert from 'node:assert/strict';
import { buildTower, plates, plateOutline, volume, isClosed, faceNormal, PARAMS } from '../src/tower.js';

let n = 0;
const test = (name, fn) => { fn(); n++; console.log('ok', name); };
const t = buildTower();
const all = plates();

// is (x, z) inside a convex outline (counter-clockwise from above)?
function inside(outline, x, z) {
  let sign = 0;
  for (let i = 0; i < outline.length; i++) {
    const [ax, , az] = outline[i], [bx, , bz] = outline[(i + 1) % outline.length];
    const c = (bx - ax) * (z - az) - (bz - az) * (x - ax);
    if (sign === 0) sign = Math.sign(c); else if (Math.sign(c) !== sign) return false;
  }
  return true;
}

test('every solid is closed and wound outward', () => {
  for (const s of t.solids) {
    assert.ok(isClosed(s), `${s.name} has an open or doubled edge`);
    assert.ok(volume(s) > 0, `${s.name} is inside out (volume ${volume(s)})`);
  }
});

test('faces point away from their solid', () => {
  for (const s of t.solids) {
    const c = s.verts.reduce((a, v) => a.map((x, i) => x + v[i] / s.verts.length), [0, 0, 0]);
    for (const f of s.faces) {
      const nrm = faceNormal(s.verts, f);
      const p = f.map(i => s.verts[i]).reduce((a, v) => a.map((x, i) => x + v[i] / f.length), [0, 0, 0]);
      const d = (p[0] - c[0]) * nrm[0] + (p[1] - c[1]) * nrm[1] + (p[2] - c[2]) * nrm[2];
      assert.ok(d > 0, `${s.name}: a face points inward`);
    }
  }
});

test('nothing goes below the plinth', () => {
  for (const s of t.solids) for (const v of s.verts) assert.ok(v[1] >= PARAMS.plaza - 1e-9, `${s.name} dips to ${v[1]}`);
});

test('every plate is a floor: glass set back under a slab', () => {
  const byName = new Map(t.solids.map(s => [s.name, s]));
  for (const { name, plate } of all) {
    const glass = byName.get(`${name}.glass`), slab = byName.get(`${name}.slab`);
    assert.ok(glass && slab, `${name} is missing a part`);
    assert.ok(Math.max(...glass.verts.map(v => v[1])) < Math.min(...slab.verts.map(v => v[1])), `${name}: glass runs into the slab`);
    const outline = plateOutline(plate);
    for (const [x, , z] of glass.verts) assert.ok(inside(outline, x, z), `${name}: glass pokes out past its slab`);
  }
});

test('every plate is threaded on the rod, as in the model', () => {
  const [mx, , mz] = t.mast.from;
  for (const { name, part, plate } of all) {
    const [x, z] = part === 'sail' ? [mx, mz] : [0, 0];
    assert.ok(inside(plateOutline(plate), x, z), `${name} misses the rod`);
  }
});

test('the body turns one way, cluster by cluster', () => {
  const body = all.filter(p => p.part === 'body');
  assert.equal(body.length, PARAMS.bodyFloors);
  for (let i = 1; i < body.length; i++) assert.ok(body[i].plate.angle > body[i - 1].plate.angle);
});

test('the blade, as drawn: one vertical edge straight over the rod, carried on by the mast', () => {
  const blade = t.solids.find(s => s.name === 'sail');
  const y0 = PARAMS.plaza + PARAMS.sailFrom * PARAMS.floor, y1 = y0 + PARAMS.sailHeight;
  const on = (y) => blade.verts.some(([x, vy, z]) => Math.hypot(x, z) < 1e-9 && Math.abs(vy - y) < 1e-9);
  assert.ok(on(y0) && on(y1), 'the vertical edge runs from foot to tip over the rod');
  assert.deepEqual([t.mast.from[0], t.mast.from[2]], [0, 0]);
  assert.equal(t.mast.from[1], y1);
  // its main face is sailBase wide at the foot and comes to a point
  const foot = blade.verts.filter(v => Math.abs(v[1] - y0) < 1e-9).map(([x, , z]) => Math.hypot(x, z));
  const tip = blade.verts.filter(v => Math.abs(v[1] - y1) < 1e-9).map(([x, , z]) => Math.hypot(x, z));
  assert.ok(Math.abs(Math.max(...foot) - PARAMS.sailBase) < 1e-9);
  assert.ok(Math.max(...tip) < 1);
});

test('the fin folds out the other way, high on the blade', () => {
  const a = PARAMS.sailFacing * Math.PI / 180, along = [Math.cos(a), -Math.sin(a)];
  const y0 = PARAMS.plaza + PARAMS.sailFrom * PARAMS.floor;
  for (const name of ['fin.low', 'fin.high']) {
    const fin = t.solids.find(s => s.name === name);
    for (const [x, y, z] of fin.verts) {
      assert.ok(x * along[0] + z * along[1] <= 1e-9, `${name} reaches the main face's side`);
      assert.ok(y >= y0 + 0.5 * PARAMS.sailHeight, `${name} starts too low`);
    }
  }
});

test('finished above the model, in the drawing\'s proportions', () => {
  const top = Math.max(...t.solids.flatMap(s => s.verts.map(v => v[1])));
  const foot = PARAMS.plaza + PARAMS.sailFrom * PARAMS.floor;
  // drawn, the blade is about 0.8 of the body beneath it
  assert.ok(PARAMS.sailHeight >= 0.75 * (foot - PARAMS.plaza), 'the blade is not cut short');
  assert.ok(top > PARAMS.plaza + 48 * PARAMS.floor * 1.15, 'carried well past where the acrylic model stops');
  assert.ok(Math.abs(t.mast.from[1] - top) < 1e-9 && t.height === t.mast.to[1]);
});

test('the form is deterministic', () => {
  assert.deepEqual(buildTower(), t);
});

console.log(`${n} tests passed`);
