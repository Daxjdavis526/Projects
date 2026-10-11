// =============================================================================
// Turning tower.js's polyhedra into three.js geometry.
//
// Every face is flat-shaded and carries a "facade" coordinate: u runs along
// the face horizontally in metres, v is world height. The glass and the ink
// shaders both draw their grids from it, so mullions, floor lines and the
// sketch's hand-ruled squares all land on the same building.
// =============================================================================

import * as THREE from 'three';
import { faceNormal, cablePoint } from './tower.js';

const KIND = { core: 0, wing: 1, sail: 2, leg: 3, glass: 1, slab: 4 };

// Simple deterministic hash so a rebuild draws the same building.
export function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function solidGeometry(solid, solidIndex) {
  const pos = [], nrm = [], fac = [], kind = [], seed = [];
  const up = new THREE.Vector3(0, 1, 0);
  solid.faces.forEach((f, fi) => {
    const n = new THREE.Vector3(...faceNormal(solid.verts, f));
    // horizontal direction along the face; for near-flat faces pick one
    let t = new THREE.Vector3().crossVectors(up, n);
    if (t.lengthSq() < 1e-4) t.set(1, 0, 0); else t.normalize();
    // walls: u along the face, v = height. Roofs and soffits: a grid in
    // the face's own plane instead, so their panels stay square.
    const b = new THREE.Vector3().crossVectors(n, t);
    const flat = Math.abs(n.y) > 0.7;
    const s = hash(solidIndex * 31 + fi);
    const k = KIND[solid.kind] ?? 0;
    // fan triangulation (faces are convex quads or polygons)
    for (let i = 1; i < f.length - 1; i++) {
      for (const vi of [f[0], f[i], f[i + 1]]) {
        const v = solid.verts[vi];
        pos.push(...v);
        nrm.push(n.x, n.y, n.z);
        fac.push(v[0] * t.x + v[2] * t.z, flat ? v[0] * b.x + v[1] * b.y + v[2] * b.z : v[1]);
        kind.push(k);
        seed.push(s);
      }
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('facade', new THREE.Float32BufferAttribute(fac, 2));
  g.setAttribute('kind', new THREE.Float32BufferAttribute(kind, 1));
  g.setAttribute('seed', new THREE.Float32BufferAttribute(seed, 1));
  g.computeBoundingSphere();
  return g;
}

export function towerGeometry(tower, keep = () => true) {
  const parts = tower.solids.map((s, i) => keep(s) ? solidGeometry(s, i) : null).filter(Boolean);
  return mergeNonIndexed(parts);
}

function mergeNonIndexed(list) {
  const out = new THREE.BufferGeometry();
  for (const name of Object.keys(list[0].attributes)) {
    const size = list[0].attributes[name].itemSize;
    const total = list.reduce((n, g) => n + g.attributes[name].array.length, 0);
    const arr = new Float32Array(total);
    let o = 0;
    for (const g of list) { arr.set(g.attributes[name].array, o); o += g.attributes[name].array.length; }
    out.setAttribute(name, new THREE.BufferAttribute(arr, size));
  }
  out.computeBoundingSphere();
  return out;
}

// The edges a hand would draw: every plate's outline, top and bottom, once
// each (the glass behind is left to the hatching), ordered from the ground
// up - the order a hand would draw them in.
export function towerEdges(tower) {
  const segs = [];
  for (const s of tower.solids) {
    if (s.kind === 'glass') continue;
    const seen = new Set();
    for (const f of s.faces) {
      for (let i = 0; i < f.length; i++) {
        const a = f[i], b = f[(i + 1) % f.length];
        // plate outlines only: the top edge of each slab, nothing else
        if (s.kind === 'slab') {
          const top = Math.max(...s.verts.map(v => v[1]));
          if (s.verts[a][1] < top - 1e-6 || s.verts[b][1] < top - 1e-6) continue;
        }
        const k = a < b ? `${a},${b}` : `${b},${a}`;
        if (seen.has(k)) continue;
        seen.add(k);
        segs.push([s.verts[a], s.verts[b]]);
      }
    }
  }
  for (const c of tower.cables) {
    const N = 6;
    for (let i = 0; i < N; i++) segs.push([cablePoint(c, i / N), cablePoint(c, (i + 1) / N)]);
  }
  segs.push([tower.mast.from, tower.mast.to]);
  return segs;
}
