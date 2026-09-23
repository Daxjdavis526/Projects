/* =============================================================================
   SHIP — the house you arrived in
   -----------------------------------------------------------------------------
   No vehicle like this exists and none is planned. The whole thing is fiction.
   What is not fiction is the set of constraints it is shaped by, and those are
   worth writing down, because they are the reason the shape looks inevitable
   rather than styled.

   Volume decides the hull. NASA's habitable volume guidance for long duration
   missions is about 25 cubic metres per person; crew quarters want about 5.4;
   the Apollo lunar module cabin was 6.7 cubic metres of which 4.5 was usable,
   and two people lived in it for three days. This ship carries just over 150
   cubic metres of pressurised volume for a crew of three, of which about 120 is
   inside the rack line where people actually are. That is generous by the
   guidance and unremarkable by the standards of a house. It is split over two
   decks rather than one because a single deck of the same volume would need a
   nine metre floor span, and because the continuous noise limits are NC-50 in a
   working area and NC-40 where people sleep. Putting the pumps, the scrubber
   and the airlock on one deck and the bunk on the other is cheaper than
   soundproofing them.

   The interior is a rounded square inside a round shell, for the same reason
   the International Space Station is: equipment racks fill the space between a
   flat wall you can use and a curved pressure hull you cannot, and the four
   crescents left over are exactly where the stowage, the avionics and the
   plumbing want to live. It costs about five square metres of floor per deck
   and buys back every cubic metre of it as somewhere to put things.

   Dust decides the lower deck. Gaier's survey of the Apollo dust problems runs
   to nine separate failure modes, from clogged seals and abraded visors to
   radiators whose solar absorptance doubled under eleven per cent coverage. So
   the airlock opens into a vestibule and never into the cabin, the vestibule
   floor is a grating over a collection tray, the suits stop at the rack they
   hang on, and the route from the hatch to the ladder is a dogleg rather than a
   straight line, because a straight line is a line of sight for dust.

   Heat decides the roof. There is no air to convect into, so every watt the
   crew and the avionics make has to leave as radiation. Roughly five kilowatts
   at cabin temperatures needs something like twenty five square metres of
   panel, which is why the two radiators are as large as the roof they stand on.
   They stand edge on to the ecliptic so the Sun only ever grazes them, they
   lean apart so they radiate at the sky instead of at each other, and they are
   on the roof rather than the flanks because that is as far as it is possible
   to get from boots and from the landing plume.

   The legs are Apollo's answer with a generation added: four splayed legs with
   crushable aluminium honeycomb in the primary struts and in the footpads,
   because nobody can know the local slope and bearing strength to better than a
   few degrees and a few kilopascals before they arrive. The pads are broad
   because the top few centimetres of regolith are weak. The engines sit inside
   a blast shield because the landing plume throws particles out at one to three
   degrees above the horizontal at kilometres per second, and anything below the
   shield is going to be sandblasted by its own arrival.

   The outer hatch opens outward. That is the opposite of the usual rule that
   pressure should seat a hatch, and it costs a ring of positive latches, but a
   hatch that opens outward can always be opened by somebody standing inside a
   pressurised airlock. Apollo 1 is why anybody cares about that.

   Windows are few and small because every one of them is a hole in a pressure
   vessel, a radiator, and a radiation path. There are three: the cockpit wrap,
   a porthole beside the bunk, and one in the living area, which exists for the
   same reason the plant tray does.

   The ship is landed and stays landed. There is no ascent stage, no gimbal
   animation and no launch. It arrived once under its own power and it is now
   architecture.

   Frame: +Y up, +X east, +Z south, origin on the ground under the ship's axis.
   The caller places and rotates the group.
   ========================================================================== */

import * as THREE from 'three';
import { SIDEREAL_MONTH } from '../config.js';

/* --- the dimensions everything else is derived from ------------------------ */

const SIDES     = 12;                 // facets around the pressure hull
const FACET     = Math.PI * 2 / SIDES;
const HULL_R    = 3.60;               // circumradius, m
const APOTHEM   = HULL_R * Math.cos(FACET / 2);        // 3.477, the flat faces
const FACET_W   = 2 * HULL_R * Math.sin(FACET / 2);    // 1.863, one facet wide

const DECK_A    = 2.55;               // lower deck floor, m above the regolith
const CLEAR     = 2.15;               // clear height on each deck
const CEIL_A    = DECK_A + CLEAR;     // 4.70
const DECK_B    = 4.95;               // upper deck floor
const CEIL_B    = DECK_B + CLEAR;     // 7.10
const HULL_BOT  = 2.30;               // underside of the pressure hull
const HULL_TOP  = 7.35;               // roof deck

/* The clear half width inside the rack faces. The racks themselves stand in the
   crescents between this square and the hull. */
const RACK      = 2.75;

const LEG_R     = 6.20;               // footpad centres, so 12.4 m across the gear
const PAD_R     = 0.72;               // footpad radius

/* ISS EVA handrails are 1.25 inches across, because that is what a pressurised
   glove can close around. Every rail, rung and grab bar on this ship is the
   same tube for the same reason. */
const RAIL_R    = 0.016;

/* --- quality tiers --------------------------------------------------------- */
/* Everything optional is listed here rather than scattered through the build,
   so the difference between tiers is one table to read. */
const TIERS = {
  performance: { seg: 8,  lights: 2, spots: false, bolts: 0,   clutter: 0, panelLines: false },
  balanced:    { seg: 10, lights: 3, spots: false, bolts: 90,  clutter: 1, panelLines: true },
  high:        { seg: 12, lights: 5, spots: true,  bolts: 240, clutter: 2, panelLines: true },
  ultra:       { seg: 16, lights: 7, spots: true,  bolts: 360, clutter: 3, panelLines: true },
};

/* --- scratch, allocated once ----------------------------------------------- */
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _sc = new THREE.Vector3(1, 1, 1);
const _nm = new THREE.Matrix3();

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function smooth01(x) { const t = clamp01(x); return t * t * (3 - 2 * t); }

/* Textures are drawn on a canvas at build time so the ship carries no image
   files. Off a browser there is no canvas, and the materials fall back to flat
   colour, which is what the headless tests see. */
const HAS_CANVAS = typeof document !== 'undefined' && !!document.createElement;

/* --- textures, drawn once at build time ------------------------------------ */

function canvasTexture(kit, w, h, draw, repeatX = 1, repeatY = 1) {
  if (!HAS_CANVAS) return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = 4;
  return kit.tex(t);
}

/* Structural panelling: seams, fasteners and the streaks that a vehicle picks
   up from its own plume on the way down. The map is near white so the material
   colour still sets the albedo. */
function hullTexture(kit) {
  return canvasTexture(kit, 256, 256, (g, w, h) => {
    g.fillStyle = '#c9c9cc'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(70,70,76,0.55)'; g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      const p = i * 64 + 0.5;
      g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke();
      g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke();
    }
    g.fillStyle = 'rgba(60,60,66,0.5)';
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      g.fillRect(x, y, 2, 2);
    }
    /* Vertical grime, heavier towards the bottom of the tile. */
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * w, len = 20 + Math.random() * 90;
      g.fillStyle = `rgba(96,88,78,${0.05 + Math.random() * 0.12})`;
      g.fillRect(x, h - len, 1 + Math.random() * 3, len);
    }
  }, 3, 2);
}

/* Hazard stripes. Black and yellow because that convention is older than
   spaceflight and every crew already reads it. */
function stripeTexture(kit) {
  return canvasTexture(kit, 64, 64, (g, w, h) => {
    g.fillStyle = '#d9a51e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#16151a';
    g.save(); g.translate(-h, 0); g.rotate(-Math.PI / 4);
    for (let i = 0; i < 8; i++) g.fillRect(i * 32, -h, 16, h * 4);
    g.restore();
  }, 6, 1);
}

function labelTexture(kit, text, sub) {
  return canvasTexture(kit, 256, 64, (g, w, h) => {
    g.fillStyle = '#1b1b1f'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#5c5c62'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#e6e3dc';
    g.font = 'bold 30px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, sub ? h / 2 - 8 : h / 2);
    if (sub) { g.font = '15px monospace'; g.fillStyle = '#8f8a82'; g.fillText(sub, w / 2, h / 2 + 16); }
  });
}

/* Screens. Four kinds, so a wall of them does not read as wallpaper. These are
   emissive maps: what they show is deliberately dim and monochrome, the way a
   cockpit display is when the cabin lights are down. */
function screenTexture(kit, kind) {
  return canvasTexture(kit, 256, 256, (g, w, h) => {
    g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h);
    const ink = kind === 'caution' ? '#ffb454' : kind === 'nav' ? '#8fd0ff' : '#a8e0a0';
    g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 1.5;
    g.globalAlpha = 0.22;
    for (let y = 8; y < h; y += 16) { g.fillRect(0, y, w, 1); }
    g.globalAlpha = 1;
    g.font = '13px monospace'; g.textBaseline = 'top';
    if (kind === 'nav') {
      g.strokeRect(18, 18, 220, 130);
      g.beginPath();
      for (let x = 0; x <= 220; x += 4) {
        const t = x / 220;
        g.lineTo(18 + x, 118 - 70 * Math.sin(t * 3.1) * Math.exp(-t * 0.8));
      }
      g.stroke();
      g.fillText('SITE 04  BRG 118  RNG 2.41 KM', 18, 162);
      g.fillText('SLOPE 6.2  SUN EL 21.4', 18, 182);
      g.fillText('TRAVERSE PLAN LOADED', 18, 202);
    } else if (kind === 'ecls') {
      const rows = ['O2  PP 21.4 kPa', 'CO2 2.1 mmHg', 'H2O LOOP 291 K', 'CABIN 65.5 kPa',
                    'SCRUB A  ONLINE', 'SCRUB B  STANDBY'];
      rows.forEach((r, i) => {
        g.fillText(r, 18, 26 + i * 30);
        g.globalAlpha = 0.35; g.fillRect(18, 46 + i * 30, 60 + (i * 37) % 150, 3); g.globalAlpha = 1;
      });
    } else if (kind === 'caution') {
      g.font = 'bold 20px monospace';
      g.fillText('DUST', 30, 40);
      g.font = '14px monospace';
      g.fillText('VESTIBULE CYCLE', 30, 74);
      g.fillText('SUIT VAC 340 s', 30, 96);
      g.fillText('TRAY 61 % FULL', 30, 118);
      g.strokeRect(28, 150, 200, 26);
      g.fillRect(30, 152, 122, 22);
    } else {
      const rows = ['PWR  4.16 kW', 'BATT 88 %', 'RAD A 2.4 kW', 'RAD B 2.1 kW',
                    'PROP 41 %', 'COMMS LOCK'];
      rows.forEach((r, i) => g.fillText(r, 18 + (i % 2) * 120, 30 + Math.floor(i / 2) * 60));
      g.globalAlpha = 0.4;
      for (let i = 0; i < 3; i++) g.strokeRect(18, 190, 220 - i * 20, 14 - i * 4);
    }
  });
}

/* Deck plating and the vestibule grating. The grating is the dust trap: it is
   drawn dark because there is a tray under it that is never quite empty. */
function deckTexture(kit, grate) {
  return canvasTexture(kit, 128, 128, (g, w, h) => {
    g.fillStyle = grate ? '#26262a' : '#8e8a84'; g.fillRect(0, 0, w, h);
    if (grate) {
      g.fillStyle = '#0a0a0c';
      for (let x = 6; x < w; x += 16) g.fillRect(x, 0, 9, h);
      g.fillStyle = '#3a3a40';
      for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 3);
    } else {
      g.strokeStyle = 'rgba(40,40,44,0.45)'; g.lineWidth = 2;
      for (let i = 0; i <= 2; i++) {
        g.beginPath(); g.moveTo(i * 64 + 1, 0); g.lineTo(i * 64 + 1, h); g.stroke();
        g.beginPath(); g.moveTo(0, i * 64 + 1); g.lineTo(w, i * 64 + 1); g.stroke();
      }
      /* Non-slip dimples, worn away along the traffic route. */
      g.fillStyle = 'rgba(50,50,54,0.5)';
      for (let y = 6; y < h; y += 9) for (let x = 6; x < w; x += 9) {
        if (Math.abs(y - h / 2) < 22 && Math.random() < 0.6) continue;
        g.fillRect(x, y, 3, 3);
      }
    }
  }, grate ? 3 : 5, grate ? 3 : 5);
}

/* --- the build kit --------------------------------------------------------- */
/* Small primitives placed by hand, then merged. Merging matters here: the ship
   is a few hundred little parts and the terrain already spends its draw call
   budget on tiles, so everything static collapses into one mesh per material
   before the group is handed back. */

class Kit {
  constructor(tier) {
    this.tier = tier;
    this.geoms = new Set();
    this.mats = new Set();
    this.textures = new Set();
    this.triangles = 0;
    /* Shadow flags are a property of where we are in the build rather than of
       each part, so they are set here and switched once when the interior
       starts. Interior meshes neither cast nor receive: the hull already casts
       the shadow they would be inside of. */
    this.cast = true;
    this.receive = true;
  }

  geo(g) { this.geoms.add(g); return g; }
  mat(m) { this.mats.add(m); return m; }
  tex(t) { this.textures.add(t); return t; }

  count(g, n = 1) {
    const idx = g.index ? g.index.count : g.attributes.position.count;
    this.triangles += (idx / 3) * n;
  }

  mesh(parent, g, m) {
    const mesh = new THREE.Mesh(this.geo(g), m);
    mesh.castShadow = this.cast;
    mesh.receiveShadow = this.receive;
    this.count(g);
    parent.add(mesh);
    return mesh;
  }

  /** A box given by its extents rather than its centre, which is how rooms are
      actually reasoned about. */
  box(parent, m, x0, x1, y0, y1, z0, z1) {
    const mesh = this.mesh(parent, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m);
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return mesh;
  }

  /** A box by centre and size, for parts that get rotated afterwards. */
  slab(parent, m, cx, cy, cz, sx, sy, sz) {
    const mesh = this.mesh(parent, new THREE.BoxGeometry(sx, sy, sz), m);
    mesh.position.set(cx, cy, cz);
    return mesh;
  }

  cyl(parent, m, cx, cy, cz, rTop, rBot, h, seg, open = false) {
    const mesh = this.mesh(parent, new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, open), m);
    mesh.position.set(cx, cy, cz);
    return mesh;
  }

  /** A tube between two points: struts, plumbing, cable runs. */
  tube(parent, m, ax, ay, az, bx, by, bz, r, seg = 6) {
    _v.set(ax, ay, az); _v2.set(bx, by, bz).sub(_v);
    const len = _v2.length() || 1e-4;
    const mesh = this.mesh(parent, new THREE.CylinderGeometry(r, r, len, seg, 1, true), m);
    mesh.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    _v2.divideScalar(len);
    mesh.quaternion.setFromUnitVectors(_up, _v2);
    return mesh;
  }

  disc(parent, m, r, seg, y, faceUp = true) {
    const mesh = this.mesh(parent, new THREE.CircleGeometry(r, seg, -FACET / 2, Math.PI * 2), m);
    mesh.rotation.x = faceUp ? -Math.PI / 2 : Math.PI / 2;
    mesh.position.y = y;
    return mesh;
  }

  /** A flat panel on hull facet k: u runs along the facet, out is clearance
      above the skin. Everything bolted to the outside is placed this way. */
  facetPlane(parent, m, k, u, y, w, h, out) {
    const mesh = this.mesh(parent, new THREE.PlaneGeometry(w, h), m);
    this.placeOnFacet(mesh, k, u, y, out);
    return mesh;
  }

  facetBox(parent, m, k, u, y, w, h, t, out) {
    const mesh = this.mesh(parent, new THREE.BoxGeometry(w, h, t), m);
    this.placeOnFacet(mesh, k, u, y, out + t / 2);
    return mesh;
  }

  placeOnFacet(obj, k, u, y, out) {
    const a = k * FACET;
    const s = Math.sin(a), c = Math.cos(a);
    const r = APOTHEM + out;
    obj.position.set(s * r + c * u, y, c * r - s * u);
    obj.rotation.y = a;
    return obj;
  }
}

/* Every rail, rung and grab bar is one instanced tube. Collecting them and
   emitting a single InstancedMesh keeps a hundred hand holds at one draw call. */
class Tubes {
  constructor(radius, seg) { this.radius = radius; this.seg = seg; this.segs = []; }
  add(ax, ay, az, bx, by, bz) { this.segs.push(ax, ay, az, bx, by, bz); return this; }
  /** A run of rail with stanchions down to a surface at `base`. */
  rail(ax, az, bx, bz, top, base) {
    this.add(ax, top, az, bx, top, bz);
    this.add(ax, base, az, ax, top, az);
    this.add(bx, base, bz, bx, top, bz);
    return this;
  }
  build(kit, parent, material) {
    const n = this.segs.length / 6;
    if (n === 0) return null;
    const g = kit.geo(new THREE.CylinderGeometry(this.radius, this.radius, 1, this.seg, 1, false));
    const mesh = new THREE.InstancedMesh(g, material, n);
    for (let i = 0; i < n; i++) {
      const o = i * 6;
      _v.set(this.segs[o], this.segs[o + 1], this.segs[o + 2]);
      _v2.set(this.segs[o + 3], this.segs[o + 4], this.segs[o + 5]).sub(_v);
      const len = _v2.length() || 1e-4;
      _v.addScaledVector(_v2, 0.5);
      _q.setFromUnitVectors(_up, _v2.divideScalar(len));
      _sc.set(1, len, 1);
      _m.compose(_v, _q, _sc);
      mesh.setMatrixAt(i, _m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    kit.count(g, n);
    parent.add(mesh);
    return mesh;
  }
}

/* Fasteners. Nobody models a bolt because it is a bolt; they get modelled
   because a hull with no fasteners on it reads as a rendering rather than as a
   thing that was assembled. */
class Bolts {
  constructor(limit) { this.limit = limit; this.p = []; }
  ring(cx, cy, cz, r, n, axis) {
    for (let i = 0; i < n && this.p.length / 6 < this.limit; i++) {
      const a = (i / n) * Math.PI * 2;
      if (axis === 'y') this.p.push(cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r, 0, 1, 0);
      else if (axis === 'z') this.p.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz, 0, 0, 1);
      else this.p.push(cx, cy + Math.sin(a) * r, cz + Math.cos(a) * r, 1, 0, 0);
    }
    return this;
  }
  row(x0, y0, z0, x1, y1, z1, n, nx, ny, nz) {
    for (let i = 0; i < n && this.p.length / 6 < this.limit; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      this.p.push(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z0 + (z1 - z0) * t, nx, ny, nz);
    }
    return this;
  }
  build(kit, parent, material) {
    const n = this.p.length / 6;
    if (n === 0) return null;
    const g = kit.geo(new THREE.CylinderGeometry(0.013, 0.015, 0.012, 6));
    const mesh = new THREE.InstancedMesh(g, material, n);
    for (let i = 0; i < n; i++) {
      const o = i * 6;
      _v.set(this.p[o], this.p[o + 1], this.p[o + 2]);
      _v2.set(this.p[o + 3], this.p[o + 4], this.p[o + 5]);
      _q.setFromUnitVectors(_up, _v2);
      _sc.set(1, 1, 1);
      _m.compose(_v, _q, _sc);
      mesh.setMatrixAt(i, _m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    kit.count(g, n);
    parent.add(mesh);
    return mesh;
  }
}

/* --- merging --------------------------------------------------------------- */

function mergeParts(parts) {
  let nv = 0, ni = 0;
  for (const p of parts) {
    nv += p.geo.attributes.position.count;
    ni += p.geo.index ? p.geo.index.count : p.geo.attributes.position.count;
  }
  const pos = new Float32Array(nv * 3);
  const nrm = new Float32Array(nv * 3);
  const uv = new Float32Array(nv * 2);
  const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  let vo = 0, io = 0;
  for (const p of parts) {
    const g = p.geo, mat = p.matrix;
    _nm.getNormalMatrix(mat);
    const gp = g.attributes.position, gn = g.attributes.normal, gu = g.attributes.uv;
    for (let i = 0; i < gp.count; i++) {
      _v.fromBufferAttribute(gp, i).applyMatrix4(mat).toArray(pos, (vo + i) * 3);
      if (gn) _v.fromBufferAttribute(gn, i).applyMatrix3(_nm).normalize().toArray(nrm, (vo + i) * 3);
      if (gu) { uv[(vo + i) * 2] = gu.getX(i); uv[(vo + i) * 2 + 1] = gu.getY(i); }
    }
    if (g.index) for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.getX(i) + vo;
    else for (let i = 0; i < gp.count; i++) idx[io + i] = i + vo;
    vo += gp.count;
    io += g.index ? g.index.count : gp.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  return out;
}

function isDynamic(o, root) {
  let p = o;
  while (p && p !== root) { if (p.userData.shipDynamic) return true; p = p.parent; }
  return false;
}

/** Collapse every static mesh under `root` into one mesh per material. */
function bake(kit, root) {
  root.updateMatrixWorld(true);
  const byMat = new Map();
  const doomed = [];
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || isDynamic(o, root)) return;
    let e = byMat.get(o.material);
    if (!e) { e = { parts: [], cast: false, receive: false }; byMat.set(o.material, e); }
    e.parts.push({ geo: o.geometry, matrix: o.matrixWorld.clone() });
    e.cast = e.cast || o.castShadow;
    e.receive = e.receive || o.receiveShadow;
    doomed.push(o);
  });
  for (const o of doomed) if (o.parent) o.parent.remove(o);
  for (const [material, e] of byMat) {
    const g = mergeParts(e.parts);
    kit.geo(g);
    const mesh = new THREE.Mesh(g, material);
    mesh.castShadow = e.cast;
    mesh.receiveShadow = e.receive;
    root.add(mesh);
    for (const p of e.parts) { p.geo.dispose(); kit.geoms.delete(p.geo); }
  }
}

/* --- materials ------------------------------------------------------------- */
/* Outside there is one directional sun, no ambient and no bounce worth the
   name, so albedo has to do all the work of separating one part from another.
   Mid greys read; pure white and pure black do not. The only true white is the
   radiator, which is white because it has to be, and the only true black is
   scorched, which is black for the same kind of reason.

   shadowSide is set to FrontSide on everything that encloses the cabin. Three.js
   defaults to rendering back faces into the shadow map, which is the right
   choice for avoiding acne on a lone box and the wrong one for a room: with the
   default, the depth recorded for the hull is its far wall, and the interior
   ends up in front of it, sunlit through the skin. */

function buildMaterials(kit, tier) {
  const std = (o) => kit.mat(new THREE.MeshStandardMaterial(o));
  const hullMap = tier.panelLines ? hullTexture(kit) : null;
  const M = {
    /* Structural composite, the darkest large surface on the vehicle. */
    shell: std({ color: 0x6f7176, roughness: 0.78, metalness: 0.12, map: hullMap,
                 side: THREE.DoubleSide, shadowSide: THREE.FrontSide }),
    frame: std({ color: 0x3a3b40, roughness: 0.72, metalness: 0.35 }),
    alum:  std({ color: 0xa8adb3, roughness: 0.44, metalness: 0.88 }),
    steel: std({ color: 0x8b9096, roughness: 0.3,  metalness: 0.95 }),
    /* Multi layer insulation. It is gold because the outer layer is aluminised
       Kapton and Kapton is amber; it is crinkled because it is twenty layers of
       foil that nobody managed to make lie flat. */
    mli:   std({ color: 0xc9a03c, roughness: 0.36, metalness: 0.82 }),
    /* Radiator white: high emissivity, low solar absorptance. */
    white: std({ color: 0xe6e4de, roughness: 0.52, metalness: 0.04 }),
    scorch: std({ color: 0x1d1a18, roughness: 0.92, metalness: 0.25 }),
    /* Refractory nozzles run coppery when they have been fired. */
    nozzle: std({ color: 0x6b4f3e, roughness: 0.45, metalness: 0.85 }),
    /* Everything that touches regolith ends up the colour of regolith. */
    dust:  std({ color: 0x8a8378, roughness: 0.95, metalness: 0.02 }),
    hazard: std({ color: 0xffffff, roughness: 0.7, metalness: 0.1, map: stripeTexture(kit) }),

    /* Inside, warm and slightly yellowed. Cabin surfaces are pale because the
       only light in here is the light this file creates. */
    cabin: std({ color: 0xb6b0a3, roughness: 0.88, metalness: 0.02 }),
    trim:  std({ color: 0x5d5a55, roughness: 0.7,  metalness: 0.25 }),
    deck:  std({ color: 0x9a958c, roughness: 0.9,  metalness: 0.05, map: deckTexture(kit, false) }),
    grate: std({ color: 0x8f8b86, roughness: 0.85, metalness: 0.3, map: deckTexture(kit, true) }),
    fabric: std({ color: 0x4a4c52, roughness: 0.96, metalness: 0.0 }),
    bunkTextile: std({ color: 0x6d5f52, roughness: 0.98, metalness: 0.0 }),
    suit:  std({ color: 0xd8d5cc, roughness: 0.8,  metalness: 0.05 }),
    plant: std({ color: 0x4e6b34, roughness: 0.85, metalness: 0.0 }),
    /* Glass is a compromise: a thin transparent pane with a little emissive so
       the windows carry light out of the ship at night, which is most of what
       they are for from outside. */
    glass: std({ color: 0x93a7b4, roughness: 0.06, metalness: 0.0,
                 transparent: true, opacity: 0.16, depthWrite: false,
                 emissive: 0xffc98a, emissiveIntensity: 0.0, side: THREE.DoubleSide }),
  };

  /* Emissive surfaces. Each is its own material so the level control can move
     them independently, and each one merges into a single mesh, so setting an
     intensity touches one object however many panels there are. */
  M.lightPanel = std({ color: 0x101010, roughness: 0.5, metalness: 0.0,
                       emissive: 0xffd6a0, emissiveIntensity: 1.0 });
  M.stripLight = std({ color: 0x101010, roughness: 0.5, metalness: 0.0,
                       emissive: 0xffc98a, emissiveIntensity: 1.0 });
  M.failing = std({ color: 0x101010, roughness: 0.5, metalness: 0.0,
                    emissive: 0xffd6a0, emissiveIntensity: 1.0 });
  M.floodLens = std({ color: 0x15161a, roughness: 0.25, metalness: 0.4,
                      emissive: 0xfff4e0, emissiveIntensity: 0.0 });
  M.strobe = std({ color: 0x1a1a1e, roughness: 0.3, metalness: 0.2,
                   emissive: 0xffffff, emissiveIntensity: 0.0 });
  M.markerRed = std({ color: 0x2a1010, roughness: 0.4, metalness: 0.1,
                      emissive: 0xff2a18, emissiveIntensity: 0.6 });
  M.markerGreen = std({ color: 0x0e2010, roughness: 0.4, metalness: 0.1,
                        emissive: 0x38ff6a, emissiveIntensity: 0.6 });
  M.status = std({ color: 0x101014, roughness: 0.4, metalness: 0.1,
                   emissive: 0xff3020, emissiveIntensity: 1.4 });

  const screen = (kind, tint) => std({
    color: 0x07080a, roughness: 0.35, metalness: 0.0,
    emissive: tint, emissiveIntensity: 1.0, emissiveMap: screenTexture(kit, kind),
  });
  M.screenNav = screen('nav', 0x8fd0ff);
  M.screenEcls = screen('ecls', 0xa8e0a0);
  M.screenSys = screen('sys', 0xa8e0a0);
  M.screenCaution = screen('caution', 0xffb454);

  M.label = std({ color: 0xffffff, roughness: 0.75, metalness: 0.05,
                  map: labelTexture(kit, 'SELENE', 'LSV-1') });
  M.labelHatch = std({ color: 0xffffff, roughness: 0.75, metalness: 0.05,
                       map: labelTexture(kit, 'EVA', 'HATCH 1') });
  M.labelTank = std({ color: 0xffffff, roughness: 0.75, metalness: 0.05,
                      map: labelTexture(kit, 'O2 / H2O', 'SERVICE') });
  M.labelDock = std({ color: 0xffffff, roughness: 0.75, metalness: 0.05,
                      map: labelTexture(kit, 'ROVER 1', 'CHARGE') });

  return M;
}

/* --- hull ------------------------------------------------------------------ */

function buildHull(kit, M, ex, tier) {
  const lowY = (HULL_BOT + DECK_B) / 2, lowH = DECK_B - HULL_BOT;
  const upY = (DECK_B + HULL_TOP) / 2, upH = HULL_TOP - DECK_B;
  const half = FACET_W / 2;

  for (let k = 0; k < SIDES; k++) {
    /* Facet 0 low is missing because the airlock module is bolted over it and
       serves as the hull there. */
    if (k !== 0) kit.facetPlane(ex, M.shell, k, 0, lowY, FACET_W, lowH, 0);

    if (k >= 5 && k <= 7) {
      /* The cockpit wrap: three panes across three facets, so the pilot can see
         the ground ahead of the pads without leaning. */
      const wHalf = 0.72, sill = 5.90, head = 6.90;
      kit.facetPlane(ex, M.shell, k, 0, (DECK_B + sill) / 2, FACET_W, sill - DECK_B, 0);
      kit.facetPlane(ex, M.shell, k, 0, (head + HULL_TOP) / 2, FACET_W, HULL_TOP - head, 0);
      kit.facetPlane(ex, M.shell, k, -(wHalf + half) / 2, (sill + head) / 2, half - wHalf, head - sill, 0);
      kit.facetPlane(ex, M.shell, k, (wHalf + half) / 2, (sill + head) / 2, half - wHalf, head - sill, 0);
      /* The frame stands proud of the skin: a window is a thick fitting, not a
         hole with a pane taped over it. */
      kit.facetBox(ex, M.alum, k, 0, sill - 0.04, wHalf * 2 + 0.16, 0.09, 0.14, 0);
      kit.facetBox(ex, M.alum, k, 0, head + 0.04, wHalf * 2 + 0.16, 0.09, 0.14, 0);
      kit.facetBox(ex, M.alum, k, -wHalf - 0.04, (sill + head) / 2, 0.09, head - sill, 0.14, 0);
      kit.facetBox(ex, M.alum, k, wHalf + 0.04, (sill + head) / 2, 0.09, head - sill, 0.14, 0);
      kit.facetPlane(ex, M.glass, k, 0, (sill + head) / 2, wHalf * 2, head - sill, -0.03);
    } else if (k === 0 || k === 3) {
      /* Two portholes: one over the bunk, one in the living area. */
      const y = 5.95, hh = 0.22;
      kit.facetPlane(ex, M.shell, k, -(hh + half) / 2, upY, half - hh, upH, 0);
      kit.facetPlane(ex, M.shell, k, (hh + half) / 2, upY, half - hh, upH, 0);
      kit.facetPlane(ex, M.shell, k, 0, (DECK_B + y - hh) / 2, hh * 2, y - hh - DECK_B, 0);
      kit.facetPlane(ex, M.shell, k, 0, (y + hh + HULL_TOP) / 2, hh * 2, HULL_TOP - y - hh, 0);
      const ring = kit.mesh(ex, new THREE.RingGeometry(0.20, 0.34, 16), M.alum);
      kit.placeOnFacet(ring, k, 0, y, 0.015);
      const pane = kit.mesh(ex, new THREE.CircleGeometry(0.215, 16), M.glass);
      kit.placeOnFacet(pane, k, 0, y, -0.02);
    } else {
      kit.facetPlane(ex, M.shell, k, 0, upY, FACET_W, upH, 0);
    }

    /* A rib on every hull edge. They are the frames the skin is stretched over
       and they are what stops the silhouette reading as a drum. */
    const a = (k + 0.5) * FACET;
    kit.tube(ex, M.frame, Math.sin(a) * HULL_R, HULL_BOT, Math.cos(a) * HULL_R,
             Math.sin(a) * HULL_R, HULL_TOP, Math.cos(a) * HULL_R, 0.055, 6);
    /* The deck ring: the frame the upper floor lands on, visible outside
       because that is where the hull is thickest. */
    kit.facetBox(ex, M.frame, k, 0, DECK_B, FACET_W, 0.16, 0.07, 0);
  }

  /* Roof and floor. The roof is walked on during servicing, so it is plate. */
  kit.disc(ex, M.shell, HULL_R, SIDES, HULL_TOP, true);
  kit.disc(ex, M.scorch, HULL_R, SIDES, HULL_BOT, false);

  /* The machinery skirt between the hull floor and the engines: tanks, valves,
     the pressurisation panel and the fold where the legs attach. */
  kit.cyl(ex, M.frame, 0, 1.95, 0, HULL_R * 0.97, HULL_R * 0.80, 0.70, SIDES, true);
}

/* --- landing gear ---------------------------------------------------------- */

function buildLegs(kit, M, ex, tubes, bolts) {
  /* Four legs on the diagonals. That is not symmetry for its own sake: it keeps
     the four cardinal faces clear for the airlock, the rover dock and the two
     service panels, and it puts a leg under each of the main hull frames. */
  for (let i = 0; i < 4; i++) {
    const a = (i + 0.5) * Math.PI / 2;
    const s = Math.sin(a), c = Math.cos(a);
    const px = s * LEG_R, pz = c * LEG_R;              // footpad centre
    const tx = s * 2.55, tz = c * 2.55;                // primary strut top
    const bx = s * 3.05, bz = c * 3.05;                // secondary strut root

    /* Primary strut. The upper half is the crushable member: aluminium
       honeycomb inside a tube, sized to absorb a two metre per second arrival
       and then stay crushed. */
    kit.tube(ex, M.alum, tx, 2.62, tz, px, 0.34, pz, 0.115, 8);
    kit.tube(ex, M.frame, tx, 2.62, tz, tx * 0.72 + px * 0.28, 2.02, tz * 0.72 + pz * 0.28, 0.145, 8);

    /* Two secondary struts, splayed, taking the sideways loads that arrive when
       one pad touches a rock before the others do. */
    const lat = 0.95;
    kit.tube(ex, M.alum, bx - c * lat, 1.62, bz + s * lat, px, 0.34, pz, 0.075, 6);
    kit.tube(ex, M.alum, bx + c * lat, 1.62, bz - s * lat, px, 0.34, pz, 0.075, 6);
    /* The deployment truss that held the leg folded during transit. */
    kit.tube(ex, M.frame, bx - c * lat, 1.62, bz + s * lat, bx + c * lat, 1.62, bz - s * lat, 0.05, 6);

    /* Footpad: broad, shallow and dished, because the top few centimetres of
       regolith carry almost nothing and the load has to be spread until it
       reaches soil that does. */
    kit.cyl(ex, M.alum, px, 0.30, pz, PAD_R * 0.55, PAD_R, 0.16, 12);
    kit.cyl(ex, M.dust, px, 0.14, pz, PAD_R, PAD_R * 0.94, 0.18, 12);
    kit.cyl(ex, M.frame, px, 0.44, pz, 0.17, 0.20, 0.14, 8);

    /* Contact probes: a metre and a half of rod that touches first and lights a
       lamp in the cabin. Three of the four are modelled bent, because that is
       what they look like after they have done their job. */
    if (i !== 2) {
      const bend = i === 0 ? 0.35 : -0.25;
      kit.tube(ex, M.steel, px + s * 0.55, 0.24, pz + c * 0.55,
               px + s * 1.65, 0.05 + Math.abs(bend) * 0.2, pz + c * 1.65 + bend, 0.018, 5);
    }

    /* Hand holds on the leg, because a suited crew member will climb one. */
    tubes.add(tx + c * 0.22, 2.30, tz - s * 0.22, tx + c * 0.22, 1.62, tz - s * 0.22);
    bolts.ring(px, 0.39, pz, 0.30, 6, 'y');
    bolts.ring(tx, 2.66, tz, 0.22, 6, 'y');
  }
}

/* --- descent propulsion ---------------------------------------------------- */

function buildEngines(kit, M, ex, bolts, tier) {
  /* Four throttleable engines on a ring instead of one big one on a gimbal.
     Differential throttle then does what a gimbal would have done, and losing
     one engine costs a quarter of the thrust rather than the vehicle. */
  const seg = Math.max(8, Math.min(12, tier.seg));
  const profile = [
    new THREE.Vector2(0.17, 0.30), new THREE.Vector2(0.14, 0.14),
    new THREE.Vector2(0.10, 0.00), new THREE.Vector2(0.155, -0.14),
    new THREE.Vector2(0.225, -0.30), new THREE.Vector2(0.295, -0.47),
    new THREE.Vector2(0.345, -0.60), new THREE.Vector2(0.365, -0.66),
  ];
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const x = Math.sin(a) * 1.15, z = Math.cos(a) * 1.15;
    const bell = kit.mesh(ex, new THREE.LatheGeometry(profile, seg), M.nozzle);
    bell.position.set(x, 1.62, z);
    /* Chamber, injector and the two propellant lines feeding it. */
    kit.cyl(ex, M.steel, x, 2.03, z, 0.19, 0.17, 0.24, 8);
    kit.tube(ex, M.steel, x, 2.15, z, x * 0.55, 2.24, z * 0.55, 0.045, 6);
    kit.tube(ex, M.alum, x + 0.16, 2.10, z, x * 0.6 + 0.16, 2.26, z * 0.6, 0.035, 6);
    bolts.ring(x, 2.16, z, 0.20, 8, 'y');
  }
  /* The blast shield. Below this line everything is in the plume, and the plume
     is regolith moving at kilometres per second at one to three degrees above
     the horizontal, so the shield is a shallow cone that throws it outward
     rather than a flat plate that lets it run along the underside. */
  kit.cyl(ex, M.scorch, 0, 2.10, 0, 2.95, 2.35, 0.14, SIDES);
  kit.cyl(ex, M.scorch, 0, 1.80, 0, 2.35, 1.85, 0.48, SIDES, true);
  kit.disc(ex, M.scorch, 1.85, SIDES, 1.56, false);
}

/* --- tanks ----------------------------------------------------------------- */

function buildTanks(kit, M, ex, tier) {
  const seg = Math.max(8, tier.seg);
  /* Four propellant spheres under the deck. Spheres because a sphere is the
     lightest pressure vessel there is, and under the deck because that is where
     the load path to the legs already runs. Gold because they are wrapped in
     aluminised Kapton: the surface sees 390 K at noon and 95 K before dawn, and
     nothing else keeps a cryogen alive across both. */
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    const x = Math.sin(a) * 2.15, z = Math.cos(a) * 2.15;
    const t = kit.mesh(ex, new THREE.SphereGeometry(0.70, seg, Math.max(6, seg - 4)), M.mli);
    t.position.set(x, 1.42, z);
    kit.tube(ex, M.frame, x, 2.05, z, x, 1.42, z, 0.05, 6);
    kit.tube(ex, M.steel, x, 0.78, z, x * 0.35, 1.30, z * 0.35, 0.035, 6);
  }
  /* Consumables on the outside of the hull where they can be swapped without
     opening anything: water, oxygen, nitrogen. The water tank sits against the
     bunk wall, because a few hundred kilograms of water is the cheapest
     radiation shielding anybody has ever found and it is going to be aboard
     anyway. Facet 9 faces west and its tangent runs north to south, so the
     tanks lie along Z. */
  const tankX = -(APOTHEM + 0.36);
  for (let i = 0; i < 3; i++) {
    const y = 3.05 + i * 0.80;
    const t = kit.mesh(ex, new THREE.CylinderGeometry(0.30, 0.30, 1.50, 10), M.mli);
    t.position.set(tankX, y, 0);
    t.rotation.x = Math.PI / 2;
    kit.facetBox(ex, M.frame, 9, -0.62, y, 0.12, 0.76, 0.40, 0.0);
    kit.facetBox(ex, M.frame, 9, 0.62, y, 0.12, 0.76, 0.40, 0.0);
    kit.tube(ex, M.steel, tankX, y - 0.32, 0.70, tankX + 0.30, y - 0.32, 0.90, 0.028, 5);
  }
  kit.facetPlane(ex, M.labelTank, 9, 0, 5.15, 0.9, 0.24, 0.02);
}

/* --- thermal --------------------------------------------------------------- */

function buildRadiators(kit, M, ex, tubes, bolts) {
  /* Two panels, each three metres by two, both faces active: about twenty four
     square metres of radiating area, which is what five kilowatts needs at
     cabin loop temperatures. They lie in the east to west plane so their faces
     look north and south, which is where the Sun never goes from a low latitude
     site, and they lean fifteen degrees apart so each one radiates at the sky
     rather than at the other. */
  for (let i = 0; i < 2; i++) {
    const sgn = i === 0 ? -1 : 1;
    const g = new THREE.Group();
    g.position.set(0, HULL_TOP + 0.15, sgn * 1.55);
    g.rotation.x = -sgn * 0.26;
    ex.add(g);
    kit.slab(g, M.white, 0, 1.05, 0, 3.10, 2.05, 0.055);
    /* Flow tubes on the shaded face and the manifolds at each end. The tubes
       are what makes a radiator a radiator rather than a white board. */
    for (let j = 0; j < 9; j++) {
      const x = -1.40 + j * 0.35;
      kit.tube(g, M.steel, x, 0.10, -0.045, x, 2.00, -0.045, 0.017, 5);
    }
    kit.tube(g, M.steel, -1.48, 0.10, -0.045, 1.48, 0.10, -0.045, 0.032, 6);
    kit.tube(g, M.steel, -1.48, 2.00, -0.045, 1.48, 2.00, -0.045, 0.032, 6);
    /* Hinges and the struts that held the panel folded during descent. */
    kit.tube(g, M.frame, -1.45, 0.06, 0, 1.45, 0.06, 0, 0.05, 6);
    kit.tube(ex, M.alum, sgn * 1.05, HULL_TOP + 0.08, sgn * 0.55,
             sgn * 0.35, HULL_TOP + 1.30, sgn * 2.05, 0.04, 6);
    kit.tube(ex, M.alum, -sgn * 1.05, HULL_TOP + 0.08, sgn * 0.55,
             -sgn * 0.35, HULL_TOP + 1.30, sgn * 2.05, 0.04, 6);
    bolts.row(-1.3, HULL_TOP + 0.06, sgn * 1.45, 1.3, HULL_TOP + 0.06, sgn * 1.45, 7, 0, 1, 0);
  }
  /* The roof is a work surface during servicing, so it gets a rail on the two
     open edges and nothing where the panels already block the fall. */
  tubes.rail(-2.6, -0.35, -2.6, 0.35, HULL_TOP + 1.05, HULL_TOP);
  tubes.rail(2.6, -0.35, 2.6, 0.35, HULL_TOP + 1.05, HULL_TOP);
}

/* --- communications -------------------------------------------------------- */

function buildComms(kit, M, ex, tier) {
  /* The high gain dish barely moves. Seen from one place on the Moon the Earth
     hangs almost still in the sky: libration walks it around an ellipse about
     sixteen degrees wide over a month and that is all. So the mount is a small
     two axis gimbal with a slow drive, not a tracker. */
  const mast = new THREE.Group();
  mast.position.set(2.05, HULL_TOP, -0.15);
  ex.add(mast);
  kit.tube(mast, M.frame, 0, 0, 0, 0, 0.95, 0, 0.075, 8);
  kit.cyl(mast, M.alum, 0, 1.02, 0, 0.17, 0.17, 0.16, 10);

  const yaw = new THREE.Group();
  yaw.position.set(0, 1.14, 0);
  yaw.userData.shipDynamic = true;
  mast.add(yaw);
  const pitch = new THREE.Group();
  pitch.userData.shipDynamic = true;
  yaw.add(pitch);

  const seg = Math.max(10, tier.seg);
  const prof = [];
  for (let i = 0; i <= 6; i++) {
    const r = (i / 6) * 0.75;
    prof.push(new THREE.Vector2(r, r * r * 0.55));
  }
  const dish = new THREE.Mesh(kit.geo(new THREE.LatheGeometry(prof, seg)), M.white);
  dish.castShadow = true;
  kit.count(dish.geometry);
  dish.rotation.x = -Math.PI / 2;
  pitch.add(dish);
  /* Feed on a tripod at the focus, and the waveguide down the back. */
  const feedY = 0.42;
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    kit.tube(pitch, M.steel, Math.cos(a) * 0.62, 0.0, Math.sin(a) * 0.62,
             0, feedY, 0, 0.012, 4);
  }
  kit.cyl(pitch, M.alum, 0, feedY + 0.06, 0, 0.07, 0.05, 0.16, 8);

  /* Two omnidirectional blades that carry the low rate link when the dish is
     stowed, pointed away from each other so the hull never shadows both. */
  for (let i = 0; i < 2; i++) {
    const sgn = i ? 1 : -1;
    kit.slab(ex, M.alum, sgn * 2.7, HULL_TOP + 0.62, sgn * -1.9, 0.06, 1.24, 0.22);
    kit.cyl(ex, M.frame, sgn * 2.7, HULL_TOP + 0.06, sgn * -1.9, 0.09, 0.11, 0.12, 8);
  }
  /* A low gain conical spiral on the hull, which is the antenna that still
     works when everything else is pointing the wrong way. */
  const cone = kit.mesh(ex, new THREE.ConeGeometry(0.14, 0.34, 8, 1, true), M.alum);
  kit.placeOnFacet(cone, 6, 0.65, 5.05, 0.28);
  cone.rotation.z = -0.5;

  return { yaw, pitch };
}

/* --- airlock, porch and the ladder to the surface -------------------------- */

/* The module is a box rather than a cylinder. A pressure vessel wants to be
   round, but this one is small enough that the mass penalty is a few tens of
   kilograms, and flat walls mean a flat hatch frame, a flat suit rack and a
   floor you can stand on without a false deck. Six and a bit cubic metres,
   which is half again what the Quest crew lock has. */
const AL_X = 1.00;                    // half width
const AL_Z0 = 3.30, AL_Z1 = 5.20;     // hull side and outside face
const AL_HATCH_R = 0.45;              // 0.9 m clear, against the LM's 0.81 m square
const AL_HATCH_Y = DECK_A + 0.62;

function hatchWall(kit, M, parent, z, facing) {
  /* A wall with a round hole in it: four panels and a ring, same trick as the
     portholes. */
  const r = AL_HATCH_R, y0 = DECK_A, y1 = CEIL_A, cy = AL_HATCH_Y;
  kit.box(parent, M.shell, -AL_X, -r, y0, y1, z - 0.06, z + 0.06);
  kit.box(parent, M.shell, r, AL_X, y0, y1, z - 0.06, z + 0.06);
  kit.box(parent, M.shell, -r, r, y0, cy - r, z - 0.06, z + 0.06);
  kit.box(parent, M.shell, -r, r, cy + r, y1, z - 0.06, z + 0.06);
  const ring = kit.mesh(parent, new THREE.RingGeometry(r - 0.02, r + 0.14, 20), M.alum);
  ring.position.set(0, cy, z + facing * 0.07);
  if (facing < 0) ring.rotation.y = Math.PI;
  return ring;
}

function buildAirlock(kit, M, ex, tubes, bolts) {
  const g = new THREE.Group();
  ex.add(g);

  /* Side walls, floor and roof. */
  kit.box(g, M.shell, -AL_X - 0.06, -AL_X + 0.06, DECK_A, CEIL_A, AL_Z0, AL_Z1);
  kit.box(g, M.shell, AL_X - 0.06, AL_X + 0.06, DECK_A, CEIL_A, AL_Z0, AL_Z1);
  /* Floor and roof run the full depth of the hull facet the module is bolted
     over, because that facet is missing: the module is the hull there. */
  kit.box(g, M.shell, -AL_X, AL_X, DECK_A - 0.25, DECK_A, AL_Z0, AL_Z1);
  kit.box(g, M.shell, -AL_X, AL_X, CEIL_A, DECK_B, AL_Z0, AL_Z1);
  /* The floor inside is grating over the same dust tray the vestibule uses. */
  kit.box(g, M.grate, -AL_X + 0.06, AL_X - 0.06, DECK_A - 0.02, DECK_A, AL_Z0 + 0.1, AL_Z1 - 0.1);

  hatchWall(kit, M, g, AL_Z0 + 0.06, -1);
  hatchWall(kit, M, g, AL_Z1 - 0.06, 1);

  /* Depress and repress plumbing on the outside of the module, where a pump
     that is going to be serviced in a suit should be. */
  kit.cyl(g, M.alum, -AL_X - 0.22, 3.30, 4.30, 0.16, 0.16, 0.42, 8);
  kit.tube(g, M.steel, -AL_X - 0.22, 3.51, 4.30, -AL_X - 0.22, 4.30, 4.30, 0.03, 5);
  kit.tube(g, M.steel, -AL_X - 0.22, 4.30, 4.30, -AL_X - 0.05, 4.30, 3.60, 0.03, 5);
  kit.slab(g, M.frame, AL_X + 0.16, 3.55, 4.30, 0.14, 0.70, 0.60);

  /* Both hatches. The inner one swings into the cabin so pressure holds it
     shut whenever the lock is down to vacuum. The outer one swings out over the
     porch, which pressure fights rather than helps, so it carries a ring of
     positive latches: the point of it is that somebody inside a pressurised
     lock can always get out. */
  const inner = new THREE.Group();
  inner.position.set(-AL_HATCH_R + 0.02, AL_HATCH_Y, AL_Z0 + 0.02);
  inner.userData.shipDynamic = true;
  g.add(inner);
  const innerLeaf = kit.mesh(inner, new THREE.CylinderGeometry(AL_HATCH_R, AL_HATCH_R, 0.09, 20), M.alum);
  innerLeaf.rotation.x = Math.PI / 2;
  innerLeaf.position.set(AL_HATCH_R - 0.02, 0, -0.05);
  kit.tube(inner, M.steel, AL_HATCH_R - 0.02, -0.18, -0.12, AL_HATCH_R - 0.02, 0.18, -0.12, 0.026, 6);

  const outer = new THREE.Group();
  outer.position.set(AL_HATCH_R - 0.02, AL_HATCH_Y, AL_Z1 - 0.02);
  outer.userData.shipDynamic = true;
  g.add(outer);
  const outerLeaf = kit.mesh(outer, new THREE.CylinderGeometry(AL_HATCH_R, AL_HATCH_R, 0.11, 20), M.alum);
  outerLeaf.rotation.x = Math.PI / 2;
  outerLeaf.position.set(-AL_HATCH_R + 0.02, 0, 0.06);
  kit.cyl(outer, M.frame, -AL_HATCH_R + 0.02, 0, 0.13, 0.10, 0.10, 0.05, 8);
  kit.tube(outer, M.steel, -AL_HATCH_R + 0.24, -0.16, 0.14, -AL_HATCH_R + 0.24, 0.16, 0.14, 0.026, 6);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    kit.slab(outer, M.steel, -AL_HATCH_R + 0.02 + Math.cos(a) * 0.37, Math.sin(a) * 0.37, 0.10,
             0.07, 0.07, 0.06);
  }

  /* Pressure status: red at vacuum, green at cabin pressure, above the inner
     hatch where it can be read from the vestibule. */
  const status = kit.mesh(g, new THREE.PlaneGeometry(0.26, 0.09), M.status);
  status.position.set(0, AL_HATCH_Y + 0.62, AL_Z0 - 0.08);
  status.rotation.y = Math.PI;

  /* Porch, ladder and the rails a suited arm actually reaches for. The porch is
     level with the airlock floor so nobody steps down onto a hatch sill in a
     suit they cannot see their feet through. */
  kit.box(ex, M.grate, -0.90, 0.90, DECK_A - 0.10, DECK_A, AL_Z1, 6.30);
  kit.tube(ex, M.frame, -0.85, DECK_A - 0.08, 6.25, -0.85, 1.55, 5.35, 0.05, 6);
  kit.tube(ex, M.frame, 0.85, DECK_A - 0.08, 6.25, 0.85, 1.55, 5.35, 0.05, 6);
  tubes.rail(-0.86, 5.25, -0.86, 6.28, DECK_A + 1.05, DECK_A);
  tubes.rail(0.86, 5.25, 0.86, 6.28, DECK_A + 1.05, DECK_A);

  /* Nine rungs at 280 mm. A suited crew member comes down this backwards and
     the last step is a drop, which is exactly what Apollo did. */
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const y = 0.36 + t * 2.05;
    const z = 6.62 - t * 0.30;
    tubes.add(-0.32, y, z, 0.32, y, z);
  }
  tubes.add(-0.32, 0.30, 6.66, -0.32, DECK_A + 0.55, 6.20);
  tubes.add(0.32, 0.30, 6.66, 0.32, DECK_A + 0.55, 6.20);

  bolts.ring(0, AL_HATCH_Y, AL_Z1 + 0.02, AL_HATCH_R + 0.10, 12, 'z');
  bolts.ring(0, AL_HATCH_Y, AL_Z0 - 0.02, AL_HATCH_R + 0.10, 10, 'z');

  /* Markings. A hatch nobody can find in a hurry is a hatch that failed. */
  const label = kit.mesh(ex, new THREE.PlaneGeometry(0.62, 0.16), M.labelHatch);
  label.position.set(0, AL_HATCH_Y + 0.72, AL_Z1 + 0.02);
  const stripe = kit.mesh(ex, new THREE.PlaneGeometry(1.9, 0.14), M.hazard);
  stripe.position.set(0, DECK_A + 0.04, AL_Z1 + 0.02);

  return { inner, outer, status };
}

/* --- rover dock ------------------------------------------------------------ */

function buildRoverDock(kit, M, ex, tubes, bolts) {
  /* The rover noses in from the east and plugs into a post rather than a
     socket in the hull, so a rover that arrives with a damaged nose can still
     be charged by hand from the same post. */
  const px = 5.30;
  kit.box(ex, M.frame, px - 0.22, px + 0.22, 0.0, 1.05, -0.26, 0.26);
  kit.box(ex, M.alum, px - 0.30, px + 0.30, 1.05, 1.35, -0.34, 0.34);
  kit.cyl(ex, M.steel, px, 1.20, 0.0, 0.11, 0.11, 0.30, 10).rotation.z = Math.PI / 2;
  /* Umbilical: power and coolant, slung so it never lies in the dust. */
  kit.tube(ex, M.trim, APOTHEM + 0.10, 3.10, 0.55, px - 0.10, 1.55, 0.30, 0.045, 6);
  kit.tube(ex, M.trim, APOTHEM + 0.10, 3.10, 0.30, px - 0.10, 1.42, 0.10, 0.045, 6);
  kit.facetBox(ex, M.frame, 3, 0.40, 3.30, 0.80, 1.00, 0.22, 0.0);
  kit.facetPlane(ex, M.labelDock, 3, 0.40, 3.90, 0.66, 0.17, 0.13);

  /* Guide rails on the ground and a painted box, because parking a rover in a
     suit with no depth cues and no mirrors is harder than it sounds. */
  for (let i = 0; i < 2; i++) {
    const z = i ? 1.15 : -1.15;
    kit.box(ex, M.hazard, 4.30, 8.10, 0.02, 0.16, z - 0.07, z + 0.07);
    tubes.add(4.40, 0.16, z, 4.40, 0.70, z);
    tubes.add(4.40, 0.70, z, 7.90, 0.70, z);
  }
  bolts.row(px - 0.18, 1.36, -0.30, px + 0.18, 1.36, -0.30, 3, 0, 1, 0);
  bolts.row(px - 0.18, 1.36, 0.30, px + 0.18, 1.36, 0.30, 3, 0, 1, 0);
}

/* --- markings, floods and beacons ------------------------------------------ */

function buildExteriorDetail(kit, M, ex, tubes, bolts, tier) {
  /* The name, at the height a photograph of the ship would be taken from. */
  const name = kit.mesh(ex, new THREE.PlaneGeometry(1.30, 0.33), M.label);
  kit.placeOnFacet(name, 4, 0, 6.20, 0.02);

  /* Hazard bands where the plume scoured the vehicle and where anything on the
     underside is hot for hours after a burn. */
  for (let k = 0; k < SIDES; k += 3) {
    kit.facetPlane(ex, M.hazard, k, 0, HULL_BOT + 0.10, FACET_W * 0.9, 0.13, 0.02);
  }
  /* NO STEP on the pads: a footpad is a load path with a crushable core in it,
     not a doorstep. */
  for (let i = 0; i < 4; i++) {
    const a = (i + 0.5) * Math.PI / 2;
    const m = kit.mesh(ex, new THREE.PlaneGeometry(PAD_R * 1.3, 0.11), M.hazard);
    m.position.set(Math.sin(a) * LEG_R, 0.40, Math.cos(a) * LEG_R);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = -a;
  }

  /* Handrails run continuously from the ladder head around to both service
     panels, because a suited crew member outside should never have to let go of
     one rail before reaching the next. */
  const rr = APOTHEM + 0.13;
  for (let k = 0; k < SIDES; k++) {
    const a0 = k * FACET, a1 = (k + 1) * FACET;
    if (k >= 4 && k <= 8) continue;                 // the cockpit facets stay clear
    tubes.add(Math.sin(a0) * rr, DECK_A + 1.05, Math.cos(a0) * rr,
              Math.sin(a1) * rr, DECK_A + 1.05, Math.cos(a1) * rr);
    if (k % 3 === 0) {
      tubes.add(Math.sin(a0) * rr, DECK_A + 1.05, Math.cos(a0) * rr,
                Math.sin(a0) * (APOTHEM + 0.02), DECK_A + 1.05, Math.cos(a0) * (APOTHEM + 0.02));
    }
  }
  /* And a climb from the porch to the roof for servicing the radiators. */
  for (let i = 0; i < 12; i++) {
    const y = DECK_A + 0.55 + i * 0.42;
    if (y > HULL_TOP) break;
    tubes.add(Math.sin(FACET) * (APOTHEM + 0.10) - 0.22, y, Math.cos(FACET) * (APOTHEM + 0.10) - 0.22,
              Math.sin(FACET) * (APOTHEM + 0.10) + 0.22, y, Math.cos(FACET) * (APOTHEM + 0.10) + 0.22);
  }

  /* Floodlights: one over the porch aimed down the ladder, one on the dock, one
     under the hull for the legs. In vacuum a beam has no visible cone, so the
     lamp housing and the pool of light on the ground are the whole effect. */
  const lamp = (x, y, z, ry) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    ex.add(g);
    kit.slab(g, M.frame, 0, 0, 0, 0.26, 0.20, 0.16);
    const lens = kit.mesh(g, new THREE.CircleGeometry(0.10, 12), M.floodLens);
    lens.position.set(0, -0.04, 0.09);
    lens.rotation.x = -0.9;
  };
  lamp(0, 4.55, AL_Z1 - 0.10, 0);
  lamp(APOTHEM + 0.12, 4.35, 0.5, Math.PI / 2);
  lamp(0, HULL_BOT + 0.12, -APOTHEM - 0.10, Math.PI);
  bolts.ring(0, 4.55, AL_Z1 - 0.02, 0.17, 4, 'z');

  /* Anticollision beacons. There is nothing here to collide with, which is
     precisely why they are on: from two kilometres out on a traverse, in a
     landscape with no scale and no horizon lights, a flashing point is the only
     thing that tells you where home is. */
  for (let i = 0; i < 4; i++) {
    const a = (i + 0.5) * Math.PI / 2;
    const s = kit.mesh(ex, new THREE.SphereGeometry(0.075, 8, 6), M.strobe);
    s.position.set(Math.sin(a) * (HULL_R - 0.15), HULL_TOP + 0.10, Math.cos(a) * (HULL_R - 0.15));
  }
  /* Port and starboard markers, which on a vehicle that never moves are simply
     how the crew agrees which way round the ship is. */
  const mr = kit.mesh(ex, new THREE.SphereGeometry(0.06, 8, 6), M.markerRed);
  kit.placeOnFacet(mr, 9, 0, HULL_TOP - 0.25, 0.10);
  const mg = kit.mesh(ex, new THREE.SphereGeometry(0.06, 8, 6), M.markerGreen);
  kit.placeOnFacet(mg, 3, 0, HULL_TOP - 0.25, 0.10);
}

/* --- interior structure ---------------------------------------------------- */

/* A rack face: the flat wall the crew sees, with drawer fronts on it. Behind it
   is the crescent between the square and the hull, which is where the tanks,
   the wiring and the spares live and which nobody ever looks at. */
function rackFace(kit, M, p, axis, at, from, to, y0, y1, inward) {
  const t = 0.09;
  const a = at, b = at - inward * t;
  if (axis === 'x') kit.box(p, M.cabin, Math.min(a, b), Math.max(a, b), y0, y1, from, to);
  else kit.box(p, M.cabin, from, to, y0, y1, Math.min(a, b), Math.max(a, b));

  const n = Math.max(1, Math.round((to - from) / 0.84));
  const w = (to - from) / n;
  for (let i = 0; i < n; i++) {
    const c = from + (i + 0.5) * w;
    for (let j = 0; j < 2; j++) {
      const cy = y0 + 0.42 + j * 0.78;
      if (axis === 'x') kit.slab(p, M.trim, at + inward * 0.028, cy, c, 0.055, 0.62, w * 0.86);
      else kit.slab(p, M.trim, c, cy, at + inward * 0.028, w * 0.86, 0.62, 0.055);
    }
  }
}

/* A cabinet across a hull corner. It is turned to face the diagonal because the
   hull corner is diagonal: the alternative is a square cabinet with its back
   corner outside the pressure vessel. */
function cornerCabinet(kit, M, p, sx, sz, y0, y1) {
  const d = 3.0 / Math.SQRT2;
  const g = new THREE.Group();
  g.position.set(sx * d, (y0 + y1) / 2, sz * d);
  g.rotation.y = Math.atan2(sx, sz);
  p.add(g);
  kit.slab(g, M.cabin, 0, 0, 0, 1.0, y1 - y0, 0.55);
  for (let j = 0; j < 3; j++) {
    kit.slab(g, M.trim, 0, -(y1 - y0) / 2 + 0.42 + j * 0.62, 0.30, 0.86, 0.44, 0.04);
  }
  return g;
}

function buildDeckPlates(kit, M, p, deck, opening) {
  /* Three plates, sized so their corners stay inside a twelve sided hull, and
     split around the companionway where there is one. The underside of each is
     the ceiling of the deck below, which is why they are boxes and not planes. */
  const y0 = deck - 0.25, y1 = deck;
  if (opening) {
    kit.box(p, M.deck, -2.00, opening[0], y0, y1, -2.85, 2.85);
    kit.box(p, M.deck, opening[1], 2.00, y0, y1, -2.85, 2.85);
    kit.box(p, M.deck, opening[0], opening[1], y0, y1, -2.85, opening[2]);
    kit.box(p, M.deck, opening[0], opening[1], y0, y1, opening[3], 2.85);
  } else {
    kit.box(p, M.deck, -2.00, 2.00, y0, y1, -2.85, 2.85);
  }
  kit.box(p, M.deck, -2.85, -2.00, y0, y1, -2.00, 2.00);
  kit.box(p, M.deck, 2.00, 2.85, y0, y1, -2.00, 2.00);
}

/* --- lower deck: engineering, the vestibule and the way up ----------------- */

function buildLowerDeck(kit, M, p, tubes, tier) {
  const y0 = DECK_A, y1 = CEIL_A;
  buildDeckPlates(kit, M, p, DECK_A, null);
  /* The ceiling hangs a few centimetres under the deck above it, which is where
     the ducting runs and which keeps two coplanar surfaces from fighting each
     other for the depth buffer. */
  kit.disc(p, M.cabin, HULL_R - 0.3, SIDES, CEIL_A - 0.045, false);

  /* Lining. The south run is broken either side of the airlock, because the
     alcove in front of the inner hatch has to be deep enough to swing a hatch
     into and wide enough to turn a backpack around in. */
  rackFace(kit, M, p, 'z', -RACK, -2.02, 2.02, y0, y1, 1);
  rackFace(kit, M, p, 'x', RACK, -2.02, 2.02, y0, y1, -1);
  rackFace(kit, M, p, 'x', -RACK, -2.02, 2.02, y0, y1, 1);
  rackFace(kit, M, p, 'z', RACK, -2.02, -1.00, y0, y1, -1);
  rackFace(kit, M, p, 'z', RACK, 1.00, 2.02, y0, y1, -1);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) cornerCabinet(kit, M, p, sx, sz, y0, y1);

  /* Partitions. Engineering to the west, the vestibule to the south, and a
     corridor between them that is deliberately not a straight line from the
     hatch to the ladder. */
  kit.box(p, M.cabin, -1.40, -1.30, y0, y1, -2.75, -0.10);
  kit.box(p, M.cabin, -1.40, -1.30, y0, y1, 1.00, 2.75);
  kit.box(p, M.cabin, -1.40, -1.30, y1 - 0.35, y1, -0.10, 1.00);      // header over the door
  kit.box(p, M.cabin, -1.30, 1.30, y0, y1, 1.10, 1.20);
  kit.box(p, M.cabin, 2.40, 2.75, y0, y1, 1.10, 1.20);
  kit.box(p, M.cabin, 1.30, 2.40, y1 - 0.35, y1, 1.10, 1.20);

  /* --- engineering bay --- */
  /* Everything here is meant to be reached with a spanner, so it is on the wall
     rather than inside a box, and it is labelled. This is also where the noise
     lives, which is the reason the bunk is on the other deck. */
  kit.box(p, M.trim, -2.70, -1.95, y0 + 0.85, y0 + 0.94, -1.90, 0.30);     // bench top
  kit.box(p, M.trim, -2.70, -2.60, y0, y0 + 0.85, -1.90, 0.30);
  kit.box(p, M.trim, -2.10, -1.95, y0, y0 + 0.85, -1.90, 0.30);
  kit.cyl(p, M.steel, -2.35, y0 + 1.02, -1.55, 0.06, 0.06, 0.18, 8);       // vice
  kit.slab(p, M.steel, -2.35, y0 + 1.10, -1.55, 0.20, 0.10, 0.16);

  for (let i = 0; i < 2; i++) {
    const z = -0.90 + i * 1.55;
    const pump = kit.cyl(p, M.alum, -2.35, y0 + 1.55, z, 0.20, 0.20, 0.46, 10);
    pump.rotation.z = Math.PI / 2;
    kit.cyl(p, M.steel, -2.35, y0 + 1.55, z + 0.28, 0.09, 0.09, 0.14, 8).rotation.x = Math.PI / 2;
    kit.tube(p, M.steel, -2.35, y0 + 1.35, z, -2.35, y0 + 0.95, z, 0.035, 6);
  }
  /* Water: the loop, the tank and the sublimator feed, all where a leak can be
     seen before it becomes an atmosphere problem. */
  kit.cyl(p, M.white, -2.30, y0 + 0.75, 1.55, 0.42, 0.42, 1.35, 10);
  kit.cyl(p, M.trim, -2.30, y0 + 1.46, 1.55, 0.44, 0.40, 0.10, 10);
  for (let i = 0; i < 7; i++) {
    const z = -2.30 + i * 0.72;
    kit.tube(p, M.steel, -2.62, y1 - 0.18, z, -1.45, y1 - 0.18, z, 0.032, 5);
    if (i % 2 === 0) kit.tube(p, M.trim, -2.62, y1 - 0.30, z, -1.45, y1 - 0.30, z, 0.026, 5);
  }
  kit.tube(p, M.steel, -2.62, y0 + 0.30, -2.30, -2.62, y1 - 0.18, -2.30, 0.032, 5);
  kit.tube(p, M.steel, -2.55, y0 + 0.30, 2.10, -2.55, y1 - 0.18, 2.10, 0.032, 5);
  /* Valve handwheels, which is the one control on this ship that works with the
     power off. */
  for (let i = 0; i < 4; i++) {
    const v = kit.mesh(p, new THREE.TorusGeometry(0.10, 0.018, 5, 10), M.markerRed);
    v.position.set(-2.52, y0 + 1.30, -2.05 + i * 0.42);
    v.rotation.y = Math.PI / 2;
  }
  const eScreen = kit.mesh(p, new THREE.PlaneGeometry(0.52, 0.36), M.screenEcls);
  eScreen.position.set(-2.62, y0 + 1.60, 0.85);
  eScreen.rotation.y = Math.PI / 2;
  tubes.add(-1.95, y0 + 1.05, -1.90, -1.95, y0 + 1.05, 0.30);

  /* --- vestibule and EVA preparation --- */
  /* The grating is the dust trap. Under it is a tray, and emptying that tray is
     somebody's job every few days, which is the honest version of dust
     mitigation: not a clever seal, a chore. */
  kit.box(p, M.grate, -1.30, 2.00, DECK_A - 0.01, DECK_A + 0.015, 1.25, 2.60);
  /* Suit stowage. Two suits on the rack, backpacks against the wall, which is
     the furthest into the ship any of this is allowed to come. */
  for (let i = 0; i < 2; i++) {
    const x = -0.75 + i * 0.85;
    kit.box(p, M.trim, x - 0.36, x + 0.36, y0 + 1.95, y0 + 2.05, 2.30, 2.70);
    kit.slab(p, M.suit, x, y0 + 1.12, 2.42, 0.52, 0.66, 0.34);          // torso
    kit.cyl(p, M.suit, x, y0 + 1.56, 2.42, 0.15, 0.17, 0.22, 8);        // neck ring
    const helm = kit.mesh(p, new THREE.SphereGeometry(0.20, 10, 8), M.glass);
    helm.position.set(x, y0 + 1.74, 2.42);
    kit.slab(p, M.trim, x, y0 + 1.15, 2.62, 0.46, 0.72, 0.22);          // backpack
    kit.slab(p, M.suit, x - 0.17, y0 + 0.52, 2.42, 0.18, 0.62, 0.24);   // legs
    kit.slab(p, M.suit, x + 0.17, y0 + 0.52, 2.42, 0.18, 0.62, 0.24);
    kit.slab(p, M.dust, x - 0.17, y0 + 0.14, 2.44, 0.20, 0.14, 0.32);   // boots, dusty
    kit.slab(p, M.dust, x + 0.17, y0 + 0.14, 2.44, 0.20, 0.14, 0.32);
  }
  /* Vacuum point, hose and brush. The suits are cleaned here and only here. */
  kit.cyl(p, M.alum, 1.55, y0 + 0.55, 2.45, 0.22, 0.22, 0.70, 10);
  kit.tube(p, M.trim, 1.55, y0 + 0.92, 2.45, 1.95, y0 + 0.45, 2.30, 0.035, 5);
  kit.slab(p, M.trim, 2.05, y0 + 0.35, 2.28, 0.16, 0.10, 0.24);
  kit.slab(p, M.trim, 2.18, y0 + 1.20, 2.42, 0.30, 0.60, 0.24);
  const dScreen = kit.mesh(p, new THREE.PlaneGeometry(0.44, 0.30), M.screenCaution);
  dScreen.position.set(0.60, y0 + 1.60, 1.19);
  dScreen.rotation.y = Math.PI;

  /* --- corridor and companionway --- */
  /* Vertical rather than an inclined stair: at a sixth of a gravity a ladder is
     faster and takes a quarter of the floor. */
  const lx0 = -0.85, lx1 = 0.45, lz = -0.35;
  tubes.add(lx0, DECK_A, lz, lx0, DECK_B + 0.95, lz);
  tubes.add(lx1, DECK_A, lz, lx1, DECK_B + 0.95, lz);
  for (let i = 0; i < 8; i++) {
    const y = DECK_A + 0.30 + i * 0.29;
    tubes.add(lx0, y, lz, lx1, y, lz);
  }
  /* A guard round three sides of the opening upstairs and a grab loop at the
     head of it, which is what you actually pull on coming up. */
  tubes.rail(-1.00, -1.60, 0.60, -1.60, DECK_B + 0.95, DECK_B);
  tubes.rail(-1.00, -1.60, -1.00, -0.10, DECK_B + 0.95, DECK_B);
  tubes.rail(0.60, -1.60, 0.60, -0.10, DECK_B + 0.95, DECK_B);

  /* Stowage and the systems wall opposite the ladder. */
  for (let i = 0; i < 2; i++) {
    kit.slab(p, M.trim, 1.15 + i * 0.60, y0 + 1.15, -2.35, 0.52, 1.30, 0.30);
  }
  const sScreen = kit.mesh(p, new THREE.PlaneGeometry(0.60, 0.40), M.screenSys);
  sScreen.position.set(0.30, y0 + 1.62, -2.62);
}

/* --- upper deck: cockpit, living area, galley, bunk ------------------------ */

function buildUpperDeck(kit, M, p, tubes, tier) {
  const y0 = DECK_B, y1 = CEIL_B;
  buildDeckPlates(kit, M, p, DECK_B, [-1.00, 0.60, -1.60, -0.10]);
  kit.disc(p, M.cabin, HULL_R - 0.3, SIDES, CEIL_B - 0.001, false);

  /* Lining, broken for the bunk alcove on the east and the living area window
     on the south. The north side has no lining at all: that is the cockpit, and
     the cockpit is a bay open to the hull because the window is the point. */
  rackFace(kit, M, p, 'x', RACK, -2.02, -1.05, y0, y1, -1);
  rackFace(kit, M, p, 'x', RACK, 0.65, 2.02, y0, y1, -1);
  rackFace(kit, M, p, 'x', -RACK, -2.02, 2.02, y0, y1, 1);
  rackFace(kit, M, p, 'z', RACK, -2.02, -0.80, y0, y1, -1);
  rackFace(kit, M, p, 'z', RACK, 0.80, 2.02, y0, y1, -1);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) cornerCabinet(kit, M, p, sx, sz, y0, y1);

  /* --- cockpit --- */
  kit.box(p, M.cabin, -2.75, -0.65, y0, y1, -2.20, -2.10);
  kit.box(p, M.cabin, 0.55, 2.75, y0, y1, -2.20, -2.10);
  kit.box(p, M.cabin, -0.65, 0.55, y1 - 0.32, y1, -2.20, -2.10);

  /* The instrument wrap. Three facets of panel under three facets of window,
     canted back so a seated crew member reads them without leaning and so dust
     cannot settle on the faces that matter. */
  for (let i = 5; i <= 7; i++) {
    const cons = kit.facetBox(p, M.trim, i, 0, y0 + 0.72, FACET_W * 0.94, 0.62, 0.42, -0.55);
    cons.rotation.x = 0.26;
    const scr = kit.facetPlane(p, i === 6 ? M.screenNav : M.screenSys, i, 0, y0 + 0.80,
                               FACET_W * 0.62, 0.30, -0.78);
    scr.rotation.x = 0.26;
    /* Overhead panel: circuit breakers and the switches that must never be
       operated by a knee, which is why they are above head height. */
    const ovh = kit.facetBox(p, M.trim, i, 0, y1 - 0.16, FACET_W * 0.9, 0.30, 0.14, -0.42);
    ovh.rotation.x = -0.35;
  }
  /* Two seats. Rails on the floor because a seat in a vehicle that will be
     lived in for years is a seat that gets moved. */
  for (let i = 0; i < 2; i++) {
    const x = i ? 0.72 : -0.72;
    kit.slab(p, M.fabric, x, y0 + 0.46, -2.60, 0.52, 0.10, 0.50);
    kit.slab(p, M.fabric, x, y0 + 0.78, -2.38, 0.52, 0.62, 0.10);
    kit.slab(p, M.trim, x, y0 + 0.22, -2.60, 0.16, 0.44, 0.16);
    kit.box(p, M.steel, x - 0.24, x + 0.24, y0, y0 + 0.04, -2.85, -2.25);
    /* Hand controller on a stalk, on the inboard side of each seat. */
    kit.tube(p, M.trim, x + (i ? -0.32 : 0.32), y0 + 0.50, -2.72, x + (i ? -0.32 : 0.32), y0 + 0.74, -2.80, 0.03, 6);
    kit.slab(p, M.trim, x + (i ? -0.32 : 0.32), y0 + 0.80, -2.82, 0.08, 0.12, 0.08);
  }

  /* --- living area --- */
  /* One table, three places. The crew is three and the guidance says twenty five
     cubic metres each; what the guidance does not say, and what every long
     duration crew does say, is that the volume matters less than having one
     place where all of you fit at once. */
  kit.box(p, M.trim, -0.45, 0.75, y0 + 0.66, y0 + 0.72, 0.55, 1.75);
  kit.cyl(p, M.steel, 0.15, y0 + 0.33, 1.15, 0.09, 0.13, 0.66, 8);
  kit.cyl(p, M.steel, 0.15, y0 + 0.02, 1.15, 0.34, 0.34, 0.04, 10);
  tubes.add(-0.45, y0 + 0.75, 0.55, 0.75, y0 + 0.75, 0.55);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.5;
    const x = 0.15 + Math.cos(a) * 0.95, z = 1.15 + Math.sin(a) * 0.95;
    kit.cyl(p, M.fabric, x, y0 + 0.44, z, 0.24, 0.22, 0.10, 10);
    kit.cyl(p, M.trim, x, y0 + 0.22, z, 0.06, 0.09, 0.34, 8);
    kit.cyl(p, M.trim, x, y0 + 0.03, z, 0.22, 0.22, 0.05, 10);
  }
  /* The wall the crew actually uses: a big screen, the schedule, and the things
     people bring from home and never put away. */
  const wall = kit.mesh(p, new THREE.PlaneGeometry(1.10, 0.66), M.screenNav);
  wall.position.set(-1.60, y0 + 1.35, RACK - 0.06);
  wall.rotation.y = Math.PI;
  if (tier.clutter >= 1) {
    for (let i = 0; i < 7; i++) {
      const x = -1.30 + (i % 4) * 0.42, y = y0 + 1.15 + Math.floor(i / 4) * 0.34;
      kit.slab(p, i % 3 ? M.label : M.labelDock, x, y, RACK - 0.10, 0.22, 0.16, 0.012);
    }
  }
  /* A tray of green things under a light. It is there because every long
     duration crew that has had one has said it mattered, and because it is the
     only thing aboard that is alive and not a person. */
  kit.box(p, M.trim, 1.05, 1.75, y0 + 0.60, y0 + 0.74, 2.05, 2.55);
  kit.box(p, M.plant, 1.10, 1.70, y0 + 0.74, y0 + 0.92, 2.10, 2.50);
  kit.box(p, M.stripLight, 1.05, 1.75, y0 + 1.32, y0 + 1.36, 2.05, 2.55);

  /* --- galley --- */
  /* Water is the whole galley: hot at 65 C, ambient, and a spigot that measures
     what it gives you, because water is mass and mass is accounted for. */
  kit.box(p, M.trim, -2.72, -2.05, y0 + 0.86, y0 + 0.94, -1.95, 0.95);
  kit.box(p, M.cabin, -2.72, -2.10, y0, y0 + 0.86, -1.95, 0.95);
  kit.box(p, M.trim, -2.72, -2.20, y0 + 1.55, y1 - 0.12, -1.95, 0.95);
  kit.slab(p, M.alum, -2.42, y0 + 1.22, -1.35, 0.44, 0.52, 0.42);
  kit.cyl(p, M.steel, -2.30, y0 + 0.99, -1.35, 0.025, 0.025, 0.14, 6);
  kit.cyl(p, M.steel, -2.30, y0 + 0.99, -1.10, 0.025, 0.025, 0.14, 6);
  const gScreen = kit.mesh(p, new THREE.PlaneGeometry(0.26, 0.18), M.screenEcls);
  gScreen.position.set(-2.19, y0 + 1.34, -1.35);
  gScreen.rotation.y = Math.PI / 2;
  kit.slab(p, M.trim, -2.42, y0 + 1.20, 0.35, 0.44, 0.46, 0.52);         // rehydration oven
  kit.slab(p, M.glass, -2.19, y0 + 1.20, 0.35, 0.02, 0.24, 0.30);
  for (let i = 0; i < 4; i++) {
    kit.slab(p, M.trim, -2.36, y0 + 1.78, -1.60 + i * 0.62, 0.60, 0.40, 0.50);
  }
  tubes.add(-2.05, y0 + 1.02, -1.90, -2.05, y0 + 1.02, 0.90);

  /* --- sleep compartment --- */
  /* Five and a half cubic metres is the crew quarters guidance; this is nearer
     eight, and every one of them is here because it is private rather than
     because it is large. A door, a light you control, and a window nobody else
     looks through. */
  kit.box(p, M.cabin, 1.70, 1.80, y0, y1, -2.15, -0.55);
  kit.box(p, M.cabin, 1.70, 1.80, y0, y1, 0.45, 1.05);
  kit.box(p, M.cabin, 1.70, 1.80, y1 - 0.30, y1, -0.55, 0.45);
  kit.box(p, M.cabin, 1.80, 2.75, y0, y1, 1.00, 1.10);
  /* The bunk fills the alcove between the lining runs, with the water tank on
     the far side of that wall. */
  kit.box(p, M.trim, 2.00, 3.02, y0 + 0.30, y0 + 0.42, -1.62, 0.35);
  kit.box(p, M.bunkTextile, 2.02, 3.00, y0 + 0.42, y0 + 0.58, -1.60, 0.33);
  kit.box(p, M.bunkTextile, 2.20, 2.96, y0 + 0.58, y0 + 0.70, -0.10, 0.30);   // a rolled blanket
  kit.box(p, M.trim, 1.95, 3.02, y0, y0 + 0.30, -1.62, 0.40);                  // stowage under
  kit.box(p, M.trim, 2.30, 3.00, y0 + 1.30, y0 + 1.62, -1.60, -1.30);          // shelf
  kit.slab(p, M.stripLight, 2.45, y0 + 1.22, -0.70, 0.30, 0.03, 0.34);
  if (tier.clutter >= 2) {
    kit.slab(p, M.label, 2.72, y0 + 1.48, -1.50, 0.16, 0.12, 0.01);
    kit.slab(p, M.trim, 2.55, y0 + 1.68, -1.50, 0.26, 0.04, 0.20);
  }
}

/* --- interior lighting ----------------------------------------------------- */

/* Outside there is one light and it is 150 million kilometres away. Inside
   there is nothing at all unless this function makes it, so the cabin carries
   its own: emissive ceiling panels for the look of it and point lights for the
   shading. Each light's range is clipped short enough that it dies before it
   reaches the regolith under the floor, because three.js has no walls, only
   geometry, and an unbounded point light indoors lights the ground outside. */

const LIGHT_PLAN = [
  { at: [0.15, CEIL_B - 0.32, 0.90], i: 2.4, d: 5.2, c: 0xffd9b0 },
  { at: [0.00, CEIL_A - 0.32, -0.60], i: 2.2, d: 3.9, c: 0xffd2a4 },
  { at: [0.00, CEIL_B - 0.30, -2.50], i: 1.6, d: 3.4, c: 0xffd9b0 },
  { at: [-2.10, CEIL_B - 0.30, -0.50], i: 1.5, d: 3.0, c: 0xffe0bc },
  { at: [2.45, CEIL_B - 0.40, -0.70], i: 1.0, d: 2.6, c: 0xffc890 },
  { at: [-2.10, CEIL_A - 0.30, -0.40], i: 1.6, d: 3.0, c: 0xdfe6ee },
  { at: [0.60, CEIL_A - 0.30, 2.10], i: 1.4, d: 2.9, c: 0xffd2a4 },
];

function buildInteriorLighting(kit, M, p, tier) {
  const panel = (mat, cx, cy, cz, w, d) => {
    const m = kit.mesh(p, new THREE.PlaneGeometry(w, d), mat);
    m.position.set(cx, cy, cz);
    m.rotation.x = Math.PI / 2;
    return m;
  };
  panel(M.lightPanel, 0.15, CEIL_B - 0.02, 0.90, 1.30, 0.60);
  panel(M.lightPanel, 0.00, CEIL_B - 0.02, -2.45, 1.60, 0.36);
  panel(M.lightPanel, -2.15, CEIL_B - 0.02, -0.50, 0.44, 1.60);
  panel(M.lightPanel, 0.00, CEIL_A - 0.02, -0.60, 1.20, 0.50);
  panel(M.lightPanel, 0.60, CEIL_A - 0.02, 2.05, 1.30, 0.44);
  /* The one in the engineering bay has a ballast on the way out. Nobody has
     changed it because it works if you thump it, which is the most realistic
     detail on this ship. */
  panel(M.failing, -2.10, CEIL_A - 0.02, -0.40, 0.90, 0.44);

  const lights = [];
  const n = Math.min(tier.lights, LIGHT_PLAN.length);
  for (let i = 0; i < n; i++) {
    const s = LIGHT_PLAN[i];
    const l = new THREE.PointLight(s.c, 0, s.d, 2);
    l.position.set(s.at[0], s.at[1], s.at[2]);
    p.add(l);
    lights.push({ light: l, base: s.i });
  }
  return lights;
}

/* --- colliders ------------------------------------------------------------- */

/* Axis aligned, in model space, and deliberately a little larger than the thing
   they stand for: being stopped by half a metre of empty corner is a nuisance,
   walking through a rack is a bug. Doorways and the two hatch apertures are
   left open on purpose; the airlock hatches are state, not geometry, so the
   caller gates those with whatever it passes to setAirlock. */
function buildColliders() {
  const out = [];
  const box = (x0, x1, y0, y1, z0, z1) => out.push({
    type: 'box',
    centre: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    half: [(x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2],
  });
  const cyl = (x, y, z, r, halfH) => out.push({
    type: 'cylinder', centre: [x, y, z], half: [r, halfH, r],
  });

  /* Deck plates. The plus shape keeps every corner inside a twelve sided hull;
     the four squares it leaves out are under the corner cabinets. */
  const plates = (deck, hole) => {
    const y0 = deck - 0.25, y1 = deck;
    if (hole) {
      box(-2.00, hole[0], y0, y1, -2.90, 2.90);
      box(hole[1], 2.00, y0, y1, -2.90, 2.90);
      box(hole[0], hole[1], y0, y1, -2.90, hole[2]);
      box(hole[0], hole[1], y0, y1, hole[3], 2.90);
    } else {
      box(-2.00, 2.00, y0, y1, -2.90, 2.90);
    }
    box(-2.90, -2.00, y0, y1, -2.00, 2.00);
    box(2.00, 2.90, y0, y1, -2.00, 2.00);
  };
  plates(DECK_A, null);
  plates(DECK_B, [-1.00, 0.60, -1.60, -0.10]);

  /* Lower deck: lining, corner cabinets, partitions. */
  box(-3.60, 3.60, DECK_A, CEIL_A, -3.60, -RACK);
  box(-3.60, -1.00, DECK_A, CEIL_A, RACK, 3.60);
  box(1.00, 3.60, DECK_A, CEIL_A, RACK, 3.60);
  box(-3.60, -RACK, DECK_A, CEIL_A, -3.60, 3.60);
  box(RACK, 3.60, DECK_A, CEIL_A, -3.60, 3.60);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(Math.min(sx * 1.90, sx * 2.80), Math.max(sx * 1.90, sx * 2.80), DECK_A, CEIL_A,
        Math.min(sz * 1.90, sz * 2.80), Math.max(sz * 1.90, sz * 2.80));
  }
  box(-1.40, -1.30, DECK_A, CEIL_A, -2.75, -0.10);
  box(-1.40, -1.30, DECK_A, CEIL_A, 1.00, 2.75);
  box(-1.30, 1.30, DECK_A, CEIL_A, 1.10, 1.20);
  box(2.40, 2.75, DECK_A, CEIL_A, 1.10, 1.20);
  box(-2.72, -1.95, DECK_A, DECK_A + 0.95, -1.95, 0.35);        // work bench
  box(-2.72, -1.90, DECK_A, CEIL_A, 1.10, 2.00);                // water tank

  /* Upper deck. The north side has no lining because it is the cockpit, so the
     hull itself has to be described there instead. */
  box(-3.60, -1.05, DECK_B, CEIL_B, RACK, 3.60);
  box(-3.60, -RACK, DECK_B, CEIL_B, -3.60, 3.60);
  box(RACK, 3.60, DECK_B, CEIL_B, -3.60, -1.05);
  box(RACK, 3.60, DECK_B, CEIL_B, 0.65, 3.60);
  box(-3.60, -0.80, DECK_B, CEIL_B, RACK, 3.60);
  box(0.80, 3.60, DECK_B, CEIL_B, RACK, 3.60);
  box(-3.60, 3.60, DECK_B, CEIL_B, -3.80, -2.95);
  box(1.90, 3.60, DECK_B, CEIL_B, -3.00, -1.90);
  box(-3.60, -1.90, DECK_B, CEIL_B, -3.00, -1.90);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(Math.min(sx * 1.90, sx * 2.80), Math.max(sx * 1.90, sx * 2.80), DECK_B, CEIL_B,
        Math.min(sz * 1.90, sz * 2.80), Math.max(sz * 1.90, sz * 2.80));
  }
  box(-2.75, -0.65, DECK_B, CEIL_B, -2.20, -2.10);
  box(0.55, 2.75, DECK_B, CEIL_B, -2.20, -2.10);
  box(1.70, 1.80, DECK_B, CEIL_B, -2.15, -0.55);
  box(1.70, 1.80, DECK_B, CEIL_B, 0.45, 1.05);
  box(1.80, 2.75, DECK_B, CEIL_B, 1.00, 1.10);
  box(-2.85, -2.05, DECK_B, CEIL_B, -1.95, 0.95);               // galley run
  box(1.95, 3.60, DECK_B, DECK_B + 0.60, -1.80, 0.40);          // bunk
  box(-0.45, 0.75, DECK_B, DECK_B + 0.72, 0.55, 1.75);          // table
  box(-2.00, 2.00, DECK_B, DECK_B + 0.95, -3.00, -2.60);        // cockpit console
  cyl(0, (CEIL_B + HULL_TOP) / 2, 0, HULL_R, (HULL_TOP - CEIL_B) / 2);

  /* Airlock module, porch and the outside of the machinery skirt. */
  box(-AL_X - 0.08, -AL_X + 0.08, DECK_A, CEIL_A, AL_Z0, AL_Z1);
  box(AL_X - 0.08, AL_X + 0.08, DECK_A, CEIL_A, AL_Z0, AL_Z1);
  box(-AL_X, AL_X, DECK_A - 0.16, DECK_A, AL_Z0, AL_Z1);
  box(-AL_X, AL_X, CEIL_A, CEIL_A + 0.16, AL_Z0, AL_Z1);
  box(-0.90, 0.90, DECK_A - 0.12, DECK_A, AL_Z1, 6.30);
  cyl(0, 1.62, 0, 3.05, 0.72);
  for (let i = 0; i < 4; i++) {
    const a = (i + 0.5) * Math.PI / 2;
    cyl(Math.sin(a) * LEG_R, 0.22, Math.cos(a) * LEG_R, PAD_R, 0.22);
  }
  return out;
}

/* --- sockets --------------------------------------------------------------- */

/* Anchors the game hangs things on. Each one sits where a person's feet go, and
   its local +Z is the direction that person should be facing. The two
   exceptions are the bunk, whose +Z runs from head to feet because whoever is
   in it is lying down, and the rover dock, whose +Z is the direction a parked
   rover points. */
const SOCKET_PLAN = {
  airlockOutside: [0.00, DECK_A, 5.75, 0],
  airlockInside: [0.00, DECK_A, 4.25, Math.PI],
  cockpitSeat: [-0.72, DECK_B + 0.47, -2.50, Math.PI],
  bunk: [2.60, DECK_B + 0.58, -1.55, 0],
  galley: [-1.85, DECK_B, -0.50, -Math.PI / 2],
  evaPrep: [0.55, DECK_A, 1.85, -0.30],
  engineering: [-1.85, DECK_A, -0.60, -Math.PI / 2],
  roverDock: [6.40, 0.00, 0.00, -Math.PI / 2],
  ladderTop: [-0.20, DECK_B, 0.25, Math.PI],
  ladderBottom: [-0.20, DECK_A, 0.25, Math.PI],
};

/* =============================================================================
   buildShip
   ========================================================================== */

/**
 * @param {object} opts { quality: 'performance'|'balanced'|'high'|'ultra' }
 * @returns {object} { group, animate, colliders, sockets, setInteriorLights,
 *                     setAirlock, setLandingLights, dispose, triangles }
 */
export function buildShip(opts = {}) {
  const tier = TIERS[opts.quality] || TIERS.high;
  const kit = new Kit(tier);
  const M = buildMaterials(kit, tier);

  const group = new THREE.Group();
  group.name = 'ship';
  const ex = new THREE.Group();
  ex.name = 'ship.exterior';
  const inG = new THREE.Group();
  inG.name = 'ship.interior';
  group.add(ex, inG);

  const rails = new Tubes(RAIL_R, 6);
  const grabs = new Tubes(RAIL_R, 5);
  const bolts = new Bolts(tier.bolts);

  buildHull(kit, M, ex, tier);
  buildLegs(kit, M, ex, rails, bolts);
  buildEngines(kit, M, ex, bolts, tier);
  buildTanks(kit, M, ex, tier);
  buildRadiators(kit, M, ex, rails, bolts);
  const dish = buildComms(kit, M, ex, tier);
  const airlock = buildAirlock(kit, M, ex, rails, bolts);
  buildRoverDock(kit, M, ex, rails, bolts);
  buildExteriorDetail(kit, M, ex, rails, bolts, tier);
  rails.build(kit, ex, M.alum);
  bolts.build(kit, ex, M.steel);

  /* Nothing indoors casts or receives the Sun: the hull already casts the
     shadow the whole interior is standing in. */
  kit.cast = false;
  kit.receive = false;
  buildLowerDeck(kit, M, inG, grabs, tier);
  buildUpperDeck(kit, M, inG, grabs, tier);
  const lights = buildInteriorLighting(kit, M, inG, tier);
  grabs.build(kit, inG, M.steel);

  bake(kit, ex);
  bake(kit, inG);

  /* Floodlights. Two of them, and only above the tier where a third and fourth
     shadowless light in the scene is affordable. */
  const spots = [];
  if (tier.spots) {
    const spot = (x, y, z, tx, ty, tz) => {
      const l = new THREE.SpotLight(0xfff2dd, 0, 22, 0.58, 0.45, 2);
      l.position.set(x, y, z);
      l.target.position.set(tx, ty, tz);
      group.add(l, l.target);
      spots.push(l);
    };
    spot(0, 4.50, AL_Z1 - 0.12, 0, 0, 7.40);
    spot(APOTHEM + 0.10, 4.30, 0.50, 6.60, 0, 0.20);
  }

  const sockets = {};
  for (const key in SOCKET_PLAN) {
    const s = SOCKET_PLAN[key];
    const o = new THREE.Object3D();
    o.name = 'ship.' + key;
    o.position.set(s[0], s[1], s[2]);
    o.rotation.y = s[3];
    group.add(o);
    sockets[key] = o;
  }

  /* --- state, all of it primitive so nothing here can allocate ------------- */
  let airlockT = -1;
  let interiorT = -1;
  let landing = false;
  let strobePhase = 0;
  let flickerPhase = 0;

  function setAirlock(t) {
    const v = clamp01(t);
    airlockT = v;
    /* Fully open at the ends of the travel and shut through the middle, so the
       chamber is never open at both ends, which is the only rule an airlock
       really has. */
    const outerOpen = 1 - smooth01(v / 0.30);
    const innerOpen = smooth01((v - 0.70) / 0.30);
    airlock.outer.rotation.y = outerOpen * 1.66;
    airlock.inner.rotation.y = innerOpen * 1.75;
    /* Red at vacuum, amber cycling, green at cabin pressure. */
    const a = smooth01(v * 2), b = smooth01((v - 0.5) * 2);
    M.status.emissive.setRGB(1 - 0.78 * b, 0.18 + 0.52 * a + 0.30 * b, 0.10 + 0.10 * a + 0.32 * b);
  }

  function setInteriorLights(level) {
    const v = clamp01(level);
    interiorT = v;
    for (let i = 0; i < lights.length; i++) lights[i].light.intensity = lights[i].base * v;
    /* Never quite dark: there is always a standby circuit, because finding a
       ladder in a blacked out cabin is how people break ankles. */
    M.lightPanel.emissiveIntensity = 0.06 + 1.25 * v;
    M.failing.emissiveIntensity = 0.06 + 1.25 * v;
    M.stripLight.emissiveIntensity = 0.10 + 0.90 * v;
    /* Screens run off their own bus and stay legible with the cabin lights
       down, which is why a ship at night reads as blue through the windows. */
    const s = 0.55 + 0.45 * v;
    M.screenNav.emissiveIntensity = s;
    M.screenEcls.emissiveIntensity = s;
    M.screenSys.emissiveIntensity = s;
    M.screenCaution.emissiveIntensity = s;
    /* What the windows carry outside. */
    M.glass.emissiveIntensity = 0.02 + 0.24 * v;
  }

  function setLandingLights(on) {
    landing = !!on;
    M.floodLens.emissiveIntensity = landing ? 2.6 : 0;
    for (let i = 0; i < spots.length; i++) spots[i].intensity = landing ? 14 : 0;
  }

  function animate(state) {
    const dt = state && typeof state.dt === 'number' && state.dt > 0 ? state.dt : 0;
    if (state) {
      if (typeof state.airlock === 'number' && state.airlock !== airlockT) setAirlock(state.airlock);
      if (typeof state.interiorLevel === 'number' && state.interiorLevel !== interiorT) {
        setInteriorLights(state.interiorLevel);
      }
    }

    /* Beacons. The phase runs on clamped real time rather than on the
       simulation clock: at six hundred times speed a one second flash is a
       strobe nobody can look at, and the beacon is not what the time control is
       for. */
    strobePhase += dt > 0.05 ? 0.05 : dt;
    const ph = strobePhase % 1.6;
    const flash = (ph < 0.055 || (ph > 0.17 && ph < 0.225)) ? 7.0 : 0.0;
    M.strobe.emissiveIntensity = flash;

    /* The failing panel in the engineering bay: quiet for a minute or so, then
       a few seconds of stutter. */
    flickerPhase += dt > 0.05 ? 0.05 : dt;
    const env = Math.sin(flickerPhase * 0.21);
    if (env > 0.86) {
      const s = Math.sin(flickerPhase * 41.3) + Math.sin(flickerPhase * 17.7);
      M.failing.emissiveIntensity = (0.06 + 1.25 * (interiorT > 0 ? interiorT : 0)) *
        (s > 0.2 ? 1 : 0.18);
    } else {
      M.failing.emissiveIntensity = 0.06 + 1.25 * (interiorT > 0 ? interiorT : 0);
    }

    /* The dish tracks libration and nothing else. From a fixed site the Earth
       stays inside an ellipse about sixteen degrees across over a month, so
       this is the whole of the pointing problem. */
    const tod = state && typeof state.timeOfDaySeconds === 'number' ? state.timeOfDaySeconds : 0;
    const w = tod * (Math.PI * 2 / SIDEREAL_MONTH);
    dish.yaw.rotation.y = 0.42 + 0.14 * Math.sin(w);
    dish.pitch.rotation.x = -0.62 + 0.12 * Math.sin(w + 1.1);
  }

  function dispose() {
    for (const g of kit.geoms) g.dispose();
    for (const m of kit.mats) m.dispose();
    for (const t of kit.textures) t.dispose();
    kit.geoms.clear(); kit.mats.clear(); kit.textures.clear();
    for (let i = 0; i < spots.length; i++) spots[i].dispose();
    for (let i = 0; i < lights.length; i++) lights[i].light.dispose();
    group.clear();
    if (group.parent) group.parent.remove(group);
  }

  setAirlock(1);
  setInteriorLights(0.85);
  setLandingLights(false);

  return {
    group,
    animate,
    colliders: buildColliders(),
    sockets,
    setInteriorLights,
    setAirlock,
    setLandingLights,
    dispose,
    /* Reported rather than guessed at: the render panel shows a triangle count
       and this is the ship's share of it. */
    triangles: kit.triangles,
  };
}
