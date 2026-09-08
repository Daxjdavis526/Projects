// ANVIL STATION.
//
// A single-shell habitat: the walls you see from outside are the walls you
// walk between inside. Rooms are rectangles with doorways cut out of them,
// and every wall segment registers a collider as it is built, so the geometry
// and the physics can never disagree.

import * as THREE from 'three';
import { injectCurve } from './shaders.js';
import { clamp, lerp } from '../math/noise.js';

const WALL = 0.34;
const C = {
  floor: [0.105, 0.110, 0.118],
  floorLine: [0.30, 0.20, 0.07],
  wall: [0.145, 0.152, 0.163],
  wallDark: [0.075, 0.079, 0.088],
  rib: [0.225, 0.233, 0.245],
  trim: [0.62, 0.30, 0.06],
  hull: [0.185, 0.192, 0.203],
  pad: [0.085, 0.088, 0.095],
  padMark: [0.55, 0.28, 0.06],
  light: [0.62, 0.86, 1.0],
  amber: [1.0, 0.62, 0.18],
};

class Build {
  constructor() { this.p = []; this.c = []; this.e = []; this.i = []; }
  get n() { return this.p.length / 3; }
  v(x, y, z, col, e = 0) { this.p.push(x, y, z); this.c.push(col[0], col[1], col[2]); this.e.push(e); return this.n - 1; }
  quad(a, b, c, d) { this.i.push(a, b, c, a, c, d); }
  /** An axis-aligned box from min/max corners. */
  box(x0, y0, z0, x1, y1, z1, col, e = 0) {
    const v = [
      this.v(x0, y0, z0, col, e), this.v(x1, y0, z0, col, e), this.v(x1, y0, z1, col, e), this.v(x0, y0, z1, col, e),
      this.v(x0, y1, z0, col, e), this.v(x1, y1, z0, col, e), this.v(x1, y1, z1, col, e), this.v(x0, y1, z1, col, e),
    ];
    this.quad(v[0], v[3], v[2], v[1]);   // bottom
    this.quad(v[4], v[5], v[6], v[7]);   // top
    this.quad(v[0], v[1], v[5], v[4]);
    this.quad(v[1], v[2], v[6], v[5]);
    this.quad(v[2], v[3], v[7], v[6]);
    this.quad(v[3], v[0], v[4], v[7]);
    return v;
  }
  cyl(cx, cy, cz, r, h, seg, col, e = 0, axis = 'y') {
    const a = [], b = [];
    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      const c1 = Math.cos(t) * r, s1 = Math.sin(t) * r;
      if (axis === 'y') { a.push(this.v(cx + c1, cy, cz + s1, col, e)); b.push(this.v(cx + c1, cy + h, cz + s1, col, e)); }
      else { a.push(this.v(cx, cy + c1, cz + s1, col, e)); b.push(this.v(cx + h, cy + c1, cz + s1, col, e)); }
    }
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      this.quad(a[i], a[j], b[j], b[i]);
    }
    return { a, b };
  }
  disc(cx, cy, cz, r, seg, col, e = 0, up = true) {
    const c0 = this.v(cx, cy, cz, col, e);
    const ring = [];
    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      ring.push(this.v(cx + Math.cos(t) * r, cy, cz + Math.sin(t) * r, col, e));
    }
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      if (up) this.i.push(c0, ring[i], ring[j]); else this.i.push(c0, ring[j], ring[i]);
    }
    return ring;
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('aEmis', new THREE.Float32BufferAttribute(this.e, 1));
    g.setIndex(this.i);
    g.computeVertexNormals();
    return g;
  }
}

/** Rooms, in station-local metres. +Z faces THERA. */
const ROOMS = [
  { name: 'corridor', x0: -2.4, x1: 2.4, z0: -16, z1: 11, h: 3.5,
    doors: [['+z', 0, 4.0], ['-z', 0, 3.0], ['-x', 4, 2.6], ['+x', 4, 2.6], ['-x', -8, 2.6], ['+x', -8, 3.4]] },
  // The +z gap is the window aperture, not a doorway — the glazing and its
  // surrounds are built separately below, so this side must be left open and
  // must not get a header beam across it.
  { name: 'lounge', x0: -10, x1: 10, z0: 11, z1: 24, h: 4.6,
    doors: [['-z', 0, 4.0], ['+z', 0, 16.9, true]], window: true },
  { name: 'armory', x0: -12, x1: -2.4, z0: 0.5, z1: 8.5, h: 3.5, doors: [['+x', 4, 2.6]] },
  { name: 'galley', x0: 2.4, x1: 12, z0: 0.5, z1: 8.5, h: 3.5, doors: [['-x', 4, 2.6]] },
  { name: 'quarters', x0: -12, x1: -2.4, z0: -12.5, z1: -4, h: 3.5, doors: [['+x', -8, 2.6]] },
  { name: 'mechbay', x0: 2.4, x1: 17, z0: -14, z1: -2, h: 8.5, doors: [['-x', -8, 3.4]] },
  { name: 'airlock', x0: -2.4, x1: 2.4, z0: -21, z1: -16, h: 3.2, doors: [['+z', 0, 3.0], ['-z', 0, 2.6]] },
];

function inDoor(doors, side, coord) {
  for (const [s, at, w] of doors) {
    if (s === side && Math.abs(coord - at) < w / 2) return true;
  }
  return false;
}

/**
 * @returns { group, colliders, terminals, lights, windowMesh, padCentres }
 */
export function buildStation(colliders, opts = {}) {
  const b = new Build();
  const group = new THREE.Group();
  group.name = 'ANVIL STATION';
  const cols = [];
  const addCol = (x0, y0, z0, x1, y1, z1, tag) => {
    cols.push({
      cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, cz: (z0 + z1) / 2,
      hx: Math.abs(x1 - x0) / 2, hy: Math.abs(y1 - y0) / 2, hz: Math.abs(z1 - z0) / 2, tag,
    });
  };

  for (const r of ROOMS) {
    // Floor and ceiling.
    b.box(r.x0 - WALL, -0.5, r.z0 - WALL, r.x1 + WALL, 0, r.z1 + WALL, C.floor);
    addCol(r.x0 - WALL, -0.5, r.z0 - WALL, r.x1 + WALL, 0, r.z1 + WALL, 'floor');
    b.box(r.x0 - WALL, r.h, r.z0 - WALL, r.x1 + WALL, r.h + 0.3, r.z1 + WALL, C.wallDark);

    // Ceiling light strip.
    const cx = (r.x0 + r.x1) / 2;
    b.box(cx - 0.42, r.h - 0.14, r.z0 + 0.8, cx + 0.42, r.h - 0.06, r.z1 - 0.8, C.light, 1);

    // Floor guidance stripe.
    b.box(cx - 0.14, 0.001, r.z0 + 0.4, cx + 0.14, 0.02, r.z1 - 0.4, C.floorLine, 0.35);

    // Walls, cut into segments around the doorways.
    const seg = 0.6;
    for (const side of ['-x', '+x', '-z', '+z']) {
      const along = side.endsWith('x') ? 'z' : 'x';
      const a0 = along === 'z' ? r.z0 : r.x0;
      const a1 = along === 'z' ? r.z1 : r.x1;
      const fixed = side === '-x' ? r.x0 : side === '+x' ? r.x1 : side === '-z' ? r.z0 : r.z1;
      const inner = side.startsWith('-') ? -WALL : 0;
      let runStart = null;
      for (let t = a0; t <= a1 + 0.001; t += seg) {
        const open = inDoor(r.doors, side, (t + Math.min(seg, a1 - t) / 2));
        const isLast = t + seg > a1 + 0.001;
        if (!open && runStart === null) runStart = t;
        if ((open || isLast) && runStart !== null) {
          const end = open ? t : a1;
          if (end - runStart > 0.05) {
            // Doorways keep a header above them; walls run full height.
            if (along === 'z') {
              b.box(fixed + inner, 0, runStart, fixed + inner + WALL, r.h, end, C.wall);
              addCol(fixed + inner, 0, runStart, fixed + inner + WALL, r.h, end, 'wall');
            } else {
              b.box(runStart, 0, fixed + inner, end, r.h, fixed + inner + WALL, C.wall);
              addCol(runStart, 0, fixed + inner, end, r.h, fixed + inner + WALL, 'wall');
            }
          }
          runStart = null;
        }
      }
      // Header over each doorway on this side.
      for (const [s, at, w, noHeader] of r.doors) {
        if (s !== side || noHeader) continue;
        const top = Math.min(r.h, 2.6);
        if (along === 'z') {
          b.box(fixed + inner, top, at - w / 2, fixed + inner + WALL, r.h, at + w / 2, C.wallDark);
          addCol(fixed + inner, top, at - w / 2, fixed + inner + WALL, r.h, at + w / 2, 'header');
          // Door frame trim.
          b.box(fixed + inner - 0.03, 0, at - w / 2 - 0.12, fixed + inner + WALL + 0.03, top + 0.1, at - w / 2, C.trim);
          b.box(fixed + inner - 0.03, 0, at + w / 2, fixed + inner + WALL + 0.03, top + 0.1, at + w / 2 + 0.12, C.trim);
        } else {
          b.box(at - w / 2, top, fixed + inner, at + w / 2, r.h, fixed + inner + WALL, C.wallDark);
          addCol(at - w / 2, top, fixed + inner, at + w / 2, r.h, fixed + inner + WALL, 'header');
          b.box(at - w / 2 - 0.12, 0, fixed + inner - 0.03, at - w / 2, top + 0.1, fixed + inner + WALL + 0.03, C.trim);
          b.box(at + w / 2, 0, fixed + inner - 0.03, at + w / 2 + 0.12, top + 0.1, fixed + inner + WALL + 0.03, C.trim);
        }
      }
    }

    // Exterior ribs, so the hull does not read as a shoebox.
    if (r.name !== 'corridor') {
      const n = Math.max(2, Math.floor((r.z1 - r.z0) / 3));
      for (let i = 0; i <= n; i++) {
        const z = lerp(r.z0, r.z1, i / n);
        b.box(r.x0 - WALL - 0.14, 0, z - 0.16, r.x0 - WALL, r.h + 0.2, z + 0.16, C.rib);
        b.box(r.x1 + WALL, 0, z - 0.16, r.x1 + WALL + 0.14, r.h + 0.2, z + 0.16, C.rib);
      }
    }
  }

  // --- the window -----------------------------------------------------------
  // The lounge's +Z wall is mostly glass. THERA hangs in it.
  const lounge = ROOMS.find(r => r.name === 'lounge');
  const winY0 = 0.85, winY1 = lounge.h - 0.45;
  const winX = 8.4;
  // Mullions.
  for (let i = -2; i <= 2; i++) {
    const x = i * (winX / 2.5);
    b.box(x - 0.11, winY0 - 0.1, lounge.z1 - 0.05, x + 0.11, winY1 + 0.1, lounge.z1 + WALL + 0.05, C.rib);
  }
  b.box(-winX - 0.4, winY1, lounge.z1 - 0.05, winX + 0.4, winY1 + 0.35, lounge.z1 + WALL + 0.05, C.rib);
  b.box(-winX - 0.4, winY0 - 0.35, lounge.z1 - 0.05, winX + 0.4, winY0, lounge.z1 + WALL + 0.05, C.rib);
  // Solid wall either side of the glass.
  b.box(lounge.x0, 0, lounge.z1, -winX, lounge.h, lounge.z1 + WALL, C.wall);
  addCol(lounge.x0, 0, lounge.z1, -winX, lounge.h, lounge.z1 + WALL, 'wall');
  b.box(winX, 0, lounge.z1, lounge.x1, lounge.h, lounge.z1 + WALL, C.wall);
  addCol(winX, 0, lounge.z1, lounge.x1, lounge.h, lounge.z1 + WALL, 'wall');
  b.box(-winX, 0, lounge.z1, winX, winY0, lounge.z1 + WALL, C.wall);
  addCol(-winX, 0, lounge.z1, winX, winY0, lounge.z1 + WALL, 'wall');
  b.box(-winX, winY1, lounge.z1, winX, lounge.h, lounge.z1 + WALL, C.wall);
  addCol(-winX, winY1, lounge.z1, winX, lounge.h, lounge.z1 + WALL, 'wall');
  // The glass itself is a separate transparent mesh, and it stops the player.
  addCol(-winX, winY0, lounge.z1, winX, winY1, lounge.z1 + WALL, 'glass');

  // Lounge furniture: a rail at the window and two consoles.
  b.box(-winX + 0.6, 0.94, lounge.z1 - 1.5, winX - 0.6, 1.02, lounge.z1 - 1.35, C.rib);
  for (let i = -1; i <= 1; i += 2) {
    b.box(i * 5 - 0.9, 0, 14.5, i * 5 + 0.9, 1.0, 15.8, C.wallDark);
    b.box(i * 5 - 0.8, 1.0, 14.6, i * 5 + 0.8, 1.06, 15.7, C.light, 0.8);
    addCol(i * 5 - 0.9, 0, 14.5, i * 5 + 0.9, 1.0, 15.8, 'console');
  }

  // --- fittings -------------------------------------------------------------
  const terminals = [];
  const term = (x, y, z, label, tag, colr = C.amber) => {
    b.box(x - 0.55, 0, z - 0.28, x + 0.55, 1.15, z + 0.28, C.wallDark);
    b.box(x - 0.48, 1.15, z - 0.24, x + 0.48, 1.22, z + 0.24, colr, 0.9);
    b.box(x - 0.42, 1.22, z - 0.05, x + 0.42, 1.85, z + 0.05, C.wallDark);
    b.box(x - 0.38, 1.30, z - 0.02, x + 0.38, 1.78, z + 0.02, C.light, 1.0);
    addCol(x - 0.55, 0, z - 0.28, x + 0.55, 1.2, z + 0.28, 'fitting');
    terminals.push({ x, y, z, label, tag });
  };

  // Galley: ration printers and a long counter.
  term(9.4, 0, 4.5, 'RATION SYNTHESISER', 'food');
  b.box(3.2, 0, 1.2, 11.2, 0.95, 2.2, C.wallDark);
  addCol(3.2, 0, 1.2, 11.2, 0.95, 2.2, 'counter');
  for (let i = 0; i < 4; i++) {
    b.box(4.0 + i * 1.8, 0.95, 1.35, 4.9 + i * 1.8, 1.55, 2.05, C.rib);
  }

  // Armory: weapon racks and the SUNDER locker.
  term(-9.4, 0, 4.5, 'WEAPON LOCKER', 'rifle', [0.9, 0.2, 0.12]);
  for (let i = 0; i < 3; i++) {
    b.box(-11.4, 0.6, 1.4 + i * 2.2, -10.9, 2.4, 2.2 + i * 2.2, C.wallDark);
    b.box(-11.3, 1.1, 1.5 + i * 2.2, -11.0, 1.2, 2.1 + i * 2.2, C.trim, 0.5);
  }
  b.box(-8.6, 0, 6.6, -4.2, 0.9, 8.0, C.wallDark);
  addCol(-8.6, 0, 6.6, -4.2, 0.9, 8.0, 'crate');

  // Quarters: bunk and a suit rack.
  term(-9.4, 0, -6.0, 'CREW BUNK', 'sleep', [0.35, 0.62, 0.9]);
  b.box(-11.6, 0.45, -11.6, -8.0, 0.75, -8.4, C.rib);
  addCol(-11.6, 0.45, -11.6, -8.0, 0.75, -8.4, 'bunk');
  b.box(-11.6, 0.75, -11.6, -8.0, 0.95, -10.9, C.wallDark);
  for (let i = 0; i < 3; i++) {
    b.box(-5.4 + i * 0.9, 0, -12.2, -4.8 + i * 0.9, 2.1, -11.6, C.rib);
    b.box(-5.35 + i * 0.9, 0.4, -12.15, -4.85 + i * 0.9, 1.6, -11.9, C.trim, 0.3);
  }
  term(-4.2, 0, -5.0, 'SUIT STORAGE', 'suit', [0.35, 0.62, 0.9]);

  // Mech bay: gantry, floor markings, and the cradle the exosuit stands in.
  term(4.2, 0, -4.6, 'EXOSUIT CRADLE', 'mech', [0.75, 0.35, 0.9]);
  const mx = 11, mz = -8.5;
  b.disc(mx, 0.03, mz, 3.4, 32, C.padMark, 0.25);
  b.disc(mx, 0.04, mz, 2.9, 32, C.pad, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    b.box(mx + Math.cos(a) * 4.2 - 0.22, 0, mz + Math.sin(a) * 4.2 - 0.22,
      mx + Math.cos(a) * 4.2 + 0.22, 7.4, mz + Math.sin(a) * 4.2 + 0.22, C.rib);
    addCol(mx + Math.cos(a) * 4.2 - 0.22, 0, mz + Math.sin(a) * 4.2 - 0.22,
      mx + Math.cos(a) * 4.2 + 0.22, 7.4, mz + Math.sin(a) * 4.2 + 0.22, 'gantry');
  }
  b.box(mx - 4.6, 7.4, mz - 4.6, mx + 4.6, 7.7, mz + 4.6, C.wallDark);
  b.box(mx - 4.4, 7.2, mz - 0.3, mx + 4.4, 7.4, mz + 0.3, C.light, 0.9);

  // Airlock: hatch frames and warning stripes.
  b.box(-2.4, 0, -21 - WALL, 2.4, 0.04, -20.4, C.padMark, 0.4);
  b.box(-2.0, 2.4, -21.2, 2.0, 2.7, -20.9, C.amber, 0.8);
  term(1.7, 0, -18.0, 'AIRLOCK CONTROL', 'airlock', [0.35, 0.85, 0.55]);
  term(-1.7, 0, -18.0, 'MISSION BOARD', 'mission');

  // --- exterior -------------------------------------------------------------
  // Landing pads, out beyond the airlock.
  const padCentres = [];
  for (let i = 0; i < 2; i++) {
    const px = i === 0 ? -22 : 22, pz = -34;
    padCentres.push(new THREE.Vector3(px, 0, pz));
    b.disc(px, 0.02, pz, 15, 40, C.pad);
    b.disc(px, 0.05, pz, 13.6, 40, C.padMark, 0.30);
    b.disc(px, 0.08, pz, 12.4, 40, C.pad);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.box(px + Math.cos(a) * 14 - 0.4, 0.05, pz + Math.sin(a) * 14 - 0.4,
        px + Math.cos(a) * 14 + 0.4, 0.9, pz + Math.sin(a) * 14 + 0.4, C.amber, 1);
    }
    // Cross markings.
    b.box(px - 8, 0.09, pz - 0.5, px + 8, 0.11, pz + 0.5, C.padMark, 0.2);
    b.box(px - 0.5, 0.09, pz - 8, px + 0.5, 0.11, pz + 8, C.padMark, 0.2);
  }
  // Walkway from the airlock to the pads.
  b.box(-2.2, 0.02, -34, 2.2, 0.09, -21, C.pad);
  b.box(-22, 0.02, -34.6, 22, 0.09, -33.4, C.pad);

  // Comms mast and dish.
  b.cyl(-14, 0, 6, 0.32, 14, 8, C.rib);
  addCol(-14.4, 0, 5.6, -13.6, 14, 6.4, 'mast');
  for (let i = 0; i < 4; i++) {
    b.box(-14.9, 5 + i * 2.4, 5.5, -13.1, 5.2 + i * 2.4, 6.5, C.wallDark);
  }
  b.cyl(-14, 14, 6, 2.2, 0.4, 20, C.rib);
  b.box(-14.1, 14.4, 5.9, -13.9, 16.2, 6.1, C.rib);
  b.box(-14.3, 16.2, 5.8, -13.7, 16.6, 6.2, C.amber, 1);

  // Solar arrays.
  for (const s of [-1, 1]) {
    b.cyl(s * 16, 0, -18, 0.28, 6, 8, C.rib);
    for (let i = 0; i < 3; i++) {
      b.box(s * 16 - 4.4, 5.6 + i * 0.02, -20.5 + i * 3.2, s * 16 + 4.4, 5.75 + i * 0.02, -18.6 + i * 3.2,
        [0.05, 0.07, 0.16], 0.05);
      b.box(s * 16 - 4.5, 5.5 + i * 0.02, -20.6 + i * 3.2, s * 16 + 4.5, 5.6 + i * 0.02, -18.5 + i * 3.2, C.rib);
    }
  }

  // Floodlight pylons.
  const floods = [];
  for (const [fx, fz] of [[-13, -27], [13, -27], [-13, 16], [13, 16]]) {
    b.cyl(fx, 0, fz, 0.22, 8, 8, C.rib);
    b.box(fx - 0.6, 8, fz - 0.5, fx + 0.6, 8.7, fz + 0.5, C.wallDark);
    b.box(fx - 0.5, 7.85, fz - 0.4, fx + 0.5, 8.05, fz + 0.4, [1.0, 0.95, 0.85], 1);
    addCol(fx - 0.3, 0, fz - 0.3, fx + 0.3, 8, fz + 0.3, 'pylon');
    floods.push(new THREE.Vector3(fx, 8, fz));
  }

  // Hull plating over the roof so it reads as a station from the air.
  for (const r of ROOMS) {
    if (r.name === 'corridor') continue;
    const n = Math.max(2, Math.floor((r.x1 - r.x0) / 3.5));
    for (let i = 0; i < n; i++) {
      const x0 = lerp(r.x0, r.x1, i / n) + 0.2;
      const x1 = lerp(r.x0, r.x1, (i + 1) / n) - 0.2;
      b.box(x0, r.h + 0.3, r.z0 + 0.3, x1, r.h + 0.5, r.z1 - 0.3, C.hull);
    }
  }

  // --- materials ------------------------------------------------------------
  const mat = injectCurve(new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.62, metalness: 0.34,
    side: THREE.DoubleSide, dithering: true,
  }));
  const emisU = { value: 1 };
  mat.userData.emis = emisU;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, rend) => {
    prev(sh, rend);
    sh.uniforms.uEmis = emisU;
    sh.vertexShader = 'attribute float aEmis;\nvarying float vEmis;\n' + sh.vertexShader;
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vEmis = aEmis;');
    sh.fragmentShader = 'uniform float uEmis;\nvarying float vEmis;\n' + sh.fragmentShader;
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vEmis * uEmis * 3.2;');
  };
  mat.customProgramCacheKey = () => 'primeval-station';

  const mesh = new THREE.Mesh(b.geometry(), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Window glass.
  // The glass is a faint additive sheen, not a physical pane. A rough-and-shiny
  // material here reflects the room lights and blanks out the view, which is
  // the one thing this window must not do.
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(winX * 2, winY1 - winY0),
    new THREE.MeshBasicMaterial({
      color: 0x7fb4d0, transparent: true, opacity: 0.055,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      toneMapped: false,
    }));
  glass.position.set(0, (winY0 + winY1) / 2, lounge.z1 + WALL / 2);
  group.add(glass);

  // Interior lighting. A handful of point lights, not one per room fitting.
  const lights = [];
  for (const [lx, ly, lz, colr, inten, dist] of [
    [0, 3.0, 0, 0xbfe4ff, 26, 22],
    [0, 3.0, -12, 0xbfe4ff, 22, 20],
    [0, 4.0, 17, 0xd6ecff, 46, 30],
    [0, 4.0, 21, 0xbcd8f0, 30, 22],
    [-8, 3.0, 4.5, 0xffd9b0, 20, 16],
    [8, 3.0, 4.5, 0xffd9b0, 20, 16],
    [11, 6.5, -8.5, 0xd0b0ff, 30, 24],
    [-8, 3.0, -8, 0xa8c8ff, 16, 15],
  ]) {
    const l = new THREE.PointLight(colr, inten, dist, 2);
    l.position.set(lx, ly, lz);
    group.add(l);
    lights.push(l);
  }
  // Pad floodlights.
  for (const f of floods) {
    const l = new THREE.PointLight(0xfff0dd, 90, 78, 2);
    l.position.copy(f);
    group.add(l);
    lights.push(l);
  }
  // Pad lighting: the pads need to read from the air on approach.
  for (const p of padCentres) {
    const l = new THREE.PointLight(0xffc46a, 130, 62, 2);
    l.position.set(p.x, 7, p.z);
    group.add(l);
    lights.push(l);
  }

  return {
    group, mesh, material: mat, emisU, glass,
    colliders: cols, terminals, lights,
    padCentres,
    loungeWindow: new THREE.Vector3(0, 1.7, lounge.z1 - 3),
    spawn: new THREE.Vector3(0, 0, 16),
    airlockOut: new THREE.Vector3(0, 0, -24),
  };
}
