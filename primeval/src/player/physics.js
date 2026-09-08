// Minimal collision world: yaw-aligned boxes, plus whatever the ground says.
// Enough for base interiors, ship hulls, boulders and crates; nothing here
// pretends to be a rigid body solver.

import * as THREE from 'three';

const _v = new THREE.Vector3();

export class Box {
  constructor(cx, cy, cz, hx, hy, hz, yaw = 0, tag = '') {
    this.c = new THREE.Vector3(cx, cy, cz);
    this.h = new THREE.Vector3(hx, hy, hz);
    this.yaw = yaw;
    this.cos = Math.cos(-yaw); this.sin = Math.sin(-yaw);
    this.tag = tag;
    this.enabled = true;
    this.climbable = true;     // can the player step onto its top face
  }
  /** World point -> box-local coordinates. */
  toLocal(x, y, z, out) {
    const dx = x - this.c.x, dz = z - this.c.z;
    out.set(dx * this.cos - dz * this.sin, y - this.c.y, dx * this.sin + dz * this.cos);
    return out;
  }
  toWorldDelta(lx, lz, out) {
    // inverse rotation
    out.x = lx * this.cos + lz * this.sin;
    out.z = -lx * this.sin + lz * this.cos;
    return out;
  }
  get top() { return this.c.y + this.h.y; }
  get bottom() { return this.c.y - this.h.y; }
}

export class Colliders {
  constructor() { this.boxes = []; }
  clear() { this.boxes.length = 0; }
  add(box) { this.boxes.push(box); return box; }
  addBox(cx, cy, cz, hx, hy, hz, yaw = 0, tag = '') {
    return this.add(new Box(cx, cy, cz, hx, hy, hz, yaw, tag));
  }
  remove(box) {
    const i = this.boxes.indexOf(box);
    if (i >= 0) this.boxes.splice(i, 1);
  }
  removeByTag(tag) {
    this.boxes = this.boxes.filter(b => b.tag !== tag);
  }

  /**
   * Highest walkable surface at (x, z) that is at or below `maxY`.
   * Returns -Infinity when nothing qualifies.
   */
  surfaceAt(x, z, maxY, radius = 0) {
    let best = -Infinity;
    for (const b of this.boxes) {
      if (!b.enabled || !b.climbable) continue;
      if (b.top > maxY) continue;
      b.toLocal(x, 0, z, _v);
      if (Math.abs(_v.x) <= b.h.x + radius && Math.abs(_v.z) <= b.h.z + radius) {
        if (b.top > best) best = b.top;
      }
    }
    return best;
  }

  /**
   * Push a vertical cylinder out of every box it overlaps.
   * Mutates `pos` (which is the cylinder's base) and returns true if it moved.
   */
  resolve(pos, radius, height) {
    let moved = false;
    const feet = pos.y, head = pos.y + height;
    for (let iter = 0; iter < 3; iter++) {
      let any = false;
      for (const b of this.boxes) {
        if (!b.enabled) continue;
        if (b.top <= feet + 0.02 || b.bottom >= head - 0.02) continue;
        b.toLocal(pos.x, 0, pos.z, _v);
        const ox = b.h.x + radius - Math.abs(_v.x);
        const oz = b.h.z + radius - Math.abs(_v.z);
        if (ox <= 0 || oz <= 0) continue;
        // Push along the shallower axis.
        let lx = 0, lz = 0;
        if (ox < oz) lx = Math.sign(_v.x || 1) * ox;
        else lz = Math.sign(_v.z || 1) * oz;
        const d = new THREE.Vector3();
        b.toWorldDelta(lx, lz, d);
        pos.x += d.x; pos.z += d.z;
        any = true; moved = true;
      }
      if (!any) break;
    }
    return moved;
  }

  /** True if a point is inside any box (used to keep spawns out of walls). */
  contains(x, y, z, pad = 0) {
    for (const b of this.boxes) {
      if (!b.enabled) continue;
      b.toLocal(x, y, z, _v);
      if (Math.abs(_v.x) <= b.h.x + pad && Math.abs(_v.y) <= b.h.y + pad && Math.abs(_v.z) <= b.h.z + pad) return true;
    }
    return false;
  }

  /** Ray vs boxes, returns nearest hit distance along dir or Infinity. */
  raycast(origin, dir, maxDist = 200) {
    let best = maxDist;
    const o = new THREE.Vector3(), d = new THREE.Vector3();
    for (const b of this.boxes) {
      if (!b.enabled) continue;
      b.toLocal(origin.x, origin.y, origin.z, o);
      // rotate direction into box space
      d.set(dir.x * b.cos - dir.z * b.sin, dir.y, dir.x * b.sin + dir.z * b.cos);
      let tmin = 0, tmax = best;
      let ok = true;
      for (let a = 0; a < 3; a++) {
        const oa = a === 0 ? o.x : a === 1 ? o.y : o.z;
        const da = a === 0 ? d.x : a === 1 ? d.y : d.z;
        const ha = a === 0 ? b.h.x : a === 1 ? b.h.y : b.h.z;
        if (Math.abs(da) < 1e-6) { if (Math.abs(oa) > ha) { ok = false; break; } continue; }
        let t1 = (-ha - oa) / da, t2 = (ha - oa) / da;
        if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
        if (t1 > tmin) tmin = t1;
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) { ok = false; break; }
      }
      if (ok && tmin < best && tmin >= 0) best = tmin;
    }
    return best;
  }
}
