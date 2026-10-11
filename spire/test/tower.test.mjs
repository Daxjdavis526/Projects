// Headless checks on the tower's form: node spire/test/tower.test.mjs
import assert from 'node:assert/strict';
import { buildTower, plates, plateOutline, floorCount, volume, isClosed, faceNormal, PARAMS } from '../src/tower.js';

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
  for (const { name, plate } of all) assert.ok(inside(plateOutline(plate), 0, 0), `${name} misses the rod`);
});

test('the clusters turn one way, all the way up', () => {
  assert.equal(all.length, floorCount());
  for (let i = 1; i < all.length; i++) assert.ok(all[i].plate.angle > all[i - 1].plate.angle);
});

test('above the model the clusters carry on, each smaller than the last', () => {
  const area = ({ plate }) => (plate.reach + plate.back) * plate.width;
  const byCluster = PARAMS.clusters.map((_, g) => all.filter(p => p.cluster === g));
  const mean = c => c.reduce((a, p) => a + area(p), 0) / c.length;
  // from the widest cluster up, every cluster is smaller in plan than the one below
  const widest = byCluster.map(mean).indexOf(Math.max(...byCluster.map(mean)));
  for (let g = widest + 1; g < byCluster.length; g++) assert.ok(mean(byCluster[g]) < mean(byCluster[g - 1]), `cluster ${g} is not smaller`);
  // and no taller: clusters shorten as they shrink
  for (let g = 1; g < PARAMS.clusters.length; g++) assert.ok(PARAMS.clusters[g] <= PARAMS.clusters[g - 1]);
  assert.ok(floorCount() > 48 * 1.15, 'carried well past where the acrylic model stops');
});

test('a short steeple on the last plate, centred on the rod, the mast on top', () => {
  const st = t.solids.find(s => s.name === 'steeple');
  const y0 = PARAMS.plaza + floorCount() * PARAMS.floor;
  const base = st.verts.filter(v => Math.abs(v[1] - y0) < 1e-9);
  assert.equal(base.length, 4, 'it stands on the last slab');
  const cx = base.reduce((a, v) => a + v[0], 0) / 4, cz = base.reduce((a, v) => a + v[2], 0) / 4;
  assert.ok(Math.hypot(cx, cz) < 1e-9, 'centred on the rod');
  const top = Math.max(...t.solids.flatMap(s => s.verts.map(v => v[1])));
  assert.ok(top - y0 < 0.2 * (y0 - PARAMS.plaza), 'short: a steeple, not a second tower');
  assert.ok(inside(plateOutline(all.at(-1).plate), ...base.slice(0, 1).map(v => [v[0], v[2]])[0]), 'it sits within the last plate');
  assert.deepEqual([t.mast.from[0], t.mast.from[1], t.mast.from[2]], [0, top, 0]);
  assert.equal(t.height, t.mast.to[1]);
});

test('the form is deterministic', () => {
  assert.deepEqual(buildTower(), t);
});

console.log(`${n} tests passed`);
