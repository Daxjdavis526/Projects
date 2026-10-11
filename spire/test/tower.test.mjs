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

test('the triangle: one edge straight up, the other stepping in to a point', () => {
  const sail = all.filter(p => p.part === 'sail');
  for (let i = 1; i < sail.length; i++) {
    const a = sail[i - 1].plate, b = sail[i].plate;
    assert.ok(b.reach < a.reach, 'the diagonal edge steps in');
    assert.equal(b.back, a.back, 'the vertical edge stands straight');
  }
  assert.ok(sail.at(-1).plate.reach + sail.at(-1).plate.back < 8, 'it comes to a point');
});

test('finished above the model: the triangle rises as far again as the body', () => {
  const top = Math.max(...t.solids.flatMap(s => s.verts.map(v => v[1])));
  const bodyTop = PARAMS.plaza + PARAMS.bodyFloors * PARAMS.floor;
  assert.ok(top - bodyTop >= bodyTop - PARAMS.plaza, 'the top is no shorter than the body');
  assert.ok(PARAMS.sailTo > 48 * 1.25, 'carried well past where the acrylic model stops');
  assert.ok(Math.abs(t.mast.from[1] - top) < 1e-9 && t.height === t.mast.to[1]);
});

test('the form is deterministic', () => {
  assert.deepEqual(buildTower(), t);
});

console.log(`${n} tests passed`);
