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

test('each band climbs, turns one way and narrows', () => {
  for (let k = 0; k < PARAMS.strands; k++) {
    const band = t.solids.filter(s => s.strand === k).sort((a, b) => a.index - b.index);
    assert.equal(band.length, PARAMS.segments);
    for (let i = 1; i < band.length; i++) {
      const lo = Math.min(...band[i].verts.map(v => v[1])), prev = Math.min(...band[i - 1].verts.map(v => v[1]));
      assert.ok(lo > prev, 'bands rise');
      assert.ok(band[i].angle > band[i - 1].angle, 'bands turn one way');
    }
    assert.ok(volume(band[1]) < volume(band[0]) && volume(band[PARAMS.segments - 2]) < volume(band[1]), 'bands narrow going up');
  }
});

test('each band is continuous: a length starts as high as the last one ended', () => {
  for (let k = 0; k < PARAMS.strands; k++) {
    const band = t.solids.filter(s => s.kind === 'wing' && s.strand === k).sort((a, b) => a.index - b.index);
    for (let i = 1; i < band.length; i++) {
      const end = Math.max(...band[i - 1].verts.slice(0, 4).map(v => v[1]));
      const start = Math.min(...band[i].verts.slice(0, 4).map(v => v[1]));
      assert.ok(Math.abs(end - start) < 1e-9, `${band[i].name} starts at ${start}, last ended at ${end}`);
      // and it starts where the last one turned the corner: the previous
      // length's tip and this length's outer trailing corner are close
      const tip = band[i - 1].verts[1], tail = band[i].verts[0];
      assert.ok(Math.hypot(tip[0] - tail[0], tip[2] - tail[2]) < 25, `${band[i].name} is not next to the last length`);
    }
  }
});

test('the bands start together at the ground, half a turn apart', () => {
  const firsts = t.solids.filter(s => s.index === 0);
  assert.equal(firsts.length, PARAMS.strands);
  for (const f of firsts) assert.equal(Math.min(...f.verts.map(v => v[1])), PARAMS.plaza);
  assert.ok(Math.abs(Math.abs(firsts[1].angle - firsts[0].angle) - Math.PI) < 1e-9);
});

test('the sail is the highest solid and the mast stands on it', () => {
  const top = Math.max(...t.solids.flatMap(s => s.verts.map(v => v[1])));
  const sail = t.solids.find(s => s.name === 'sail0');
  assert.equal(Math.max(...sail.verts.map(v => v[1])), top);
  assert.ok(Math.abs(t.mast.from[1] - top) < 1e-9);
  assert.ok(t.mast.to[1] > t.mast.from[1]);
  assert.equal(t.height, t.mast.to[1]);
  assert.ok(t.height > 400, 'tall: the acrylic model is missing its top, so it is no guide to height');
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
