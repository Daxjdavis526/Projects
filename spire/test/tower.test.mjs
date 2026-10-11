// Headless checks on the tower's form: node spire/test/tower.test.mjs
import assert from 'node:assert/strict';
import { buildTower, volume, isClosed, faceNormal, cablePoint, PARAMS } from '../src/tower.js';

let n = 0;
const test = (name, fn) => { fn(); n++; console.log('ok', name); };
const t = buildTower();

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

test('the wings climb, turn and shrink', () => {
  const wings = t.solids.filter(s => s.kind === 'wing');
  assert.equal(wings.length, PARAMS.wings);
  for (let i = 1; i < wings.length; i++) {
    const lo = Math.min(...wings[i].verts.map(v => v[1])), prev = Math.min(...wings[i - 1].verts.map(v => v[1]));
    assert.ok(lo > prev, 'wings rise');
    assert.ok(wings[i].angle > wings[i - 1].angle, 'wings turn one way');
    assert.ok(volume(wings[i]) < volume(wings[i - 1]), 'wings get smaller going up');
  }
});

test('each wing wraps the core, so it hangs from it', () => {
  // the tower's axis passes through every wing's plan, top and bottom
  const contains = (poly) => {
    let sign = 0;
    for (let i = 0; i < poly.length; i++) {
      const [ax, , az] = poly[i], [bx, , bz] = poly[(i + 1) % poly.length];
      const c = (bx - ax) * (0 - az) - (bz - az) * (0 - ax);
      if (sign === 0) sign = Math.sign(c); else if (Math.sign(c) !== sign) return false;
    }
    return true;
  };
  for (const w of t.solids.filter(s => s.kind === 'wing')) {
    assert.ok(contains(w.verts.slice(0, 4)) && contains(w.verts.slice(4)), `${w.name} floats free of the core`);
  }
});

test('the sail is the highest solid and the mast stands on it', () => {
  const top = Math.max(...t.solids.flatMap(s => s.verts.map(v => v[1])));
  const sail = t.solids.find(s => s.kind === 'sail');
  assert.equal(Math.max(...sail.verts.map(v => v[1])), top);
  assert.ok(Math.abs(t.mast.from[1] - top) < 1e-9);
  assert.ok(t.mast.to[1] > t.mast.from[1]);
  assert.equal(t.height, t.mast.to[1]);
});

test('cables run from the wings down to anchors on the plinth, sagging', () => {
  assert.equal(t.cables.length, PARAMS.cables);
  for (const c of t.cables) {
    assert.ok(c.from[1] > 40);
    assert.equal(c.to[1], PARAMS.plaza);
    const mid = cablePoint(c, 0.5);
    assert.ok(mid[1] < (c.from[1] + c.to[1]) / 2, 'a cable sags below its chord');
    assert.ok(Math.hypot(c.to[0], c.to[2]) < 92, 'anchors are on the plinth');
  }
});

test('the form is deterministic', () => {
  assert.deepEqual(buildTower(), t);
});

console.log(`${n} tests passed`);
