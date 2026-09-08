/* =============================================================================
   CAVE — drawing the conduit under the Mare Tranquillitatis pit
   -----------------------------------------------------------------------------
   The geometry and every number behind it are argued in src/game/cave.js, which
   imports no three.js so the tests can walk through the place in Node. This file
   only turns that description into triangles.

   Four things it does that are worth explaining.

   It draws through a wall. A height field gives one height per point, so it can
   describe a hole in the ground but never a ceiling over one, and the pit's
   shaft wall is therefore drawn straight across the cave mouth. There is no
   arrangement of height values that fixes that — carve the wall away and the
   pit stops being the shape the atlas measured. So the mouth is a stencil
   portal: a band inside the shaft wall marks where the void is, and the cave
   draws only inside that mark, ignoring the depth the wall wrote. The band is
   depth-tested normally, so it only marks where it can actually be seen; stand
   on the funnel above and the near rim hides its own recess exactly as it
   should. Once you are inside the cave none of this is needed — nothing is
   between you and the walls any more — so the portal switches off and ordinary
   depth testing comes back.

   The roof casts and the floor receives. There is no way to tell a shader "the
   Sun cannot see this" — light layers in three.js filter against the camera, not
   the object — so the cave is dark for the physically correct reason instead:
   the rock above it is a shadow caster, and the shadow map does the rest. That
   also gets the good part for free, which is the shaft of sunlight coming down
   the pit and landing on the floor while everything under the overhang stays
   black.

   The walls are rough and the floor is not. Displacement is capped at 40 cm and
   only ever pushes a surface AWAY from the void — walls outward, roof upward —
   so the room you can see is never smaller than the room the collision code
   thinks you are in. The floor is left exactly flat because that is the surface
   you stand on. Radar at 13 cm has no opinion about anything this small, so
   this is sub-resolution detail in the same sense the regolith outside is.

   The boulders are measured. Carrer et al. read a 1-4 m size range off LROC NAC
   image M155016845R, and named two of 8-10 m in the south-west of the floor that
   they left out of their own model as outliers. Both are drawn.
   ========================================================================== */

import * as THREE from 'three';
import { CONDUIT, breakdownBlocks } from '../game/cave.js';
import { enuBasis, llhToXyz } from '../physics/frames.js';

const DEG = Math.PI / 180;

/* Matches src/game/cave.js: how far inside the shaft wall the cave reaches, so
   the doorway has no lip where the mesh meets the ground. */
const OVERLAP = 2;

/* Segment counts. This is drawn alongside a streaming planetary surface, so
   nothing here is allowed to be generous. */
const TIER = {
  performance: { along: 14, across: 8,  ring: 40, rough: 0,   boulders: 40 },
  balanced:    { along: 22, across: 12, ring: 56, rough: 0.8, boulders: 70 },
  high:        { along: 32, across: 18, ring: 80, rough: 1.2, boulders: 90 },
  ultra:       { along: 44, across: 24, ring: 110, rough: 1.2, boulders: 120 },
};

/* A cheap deterministic hash, so the same rock is in the same place every time
   you come back and no seeded RNG has to be threaded through. */
function hash3(a, b, c) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Basalt. Mare basalt is genuinely dark — normal albedo around 0.07 in the
 * maria — so this is nearly black and reads as rock only once a lamp is on it,
 * which is the point.
 */
function materials() {
  const rock = new THREE.MeshStandardMaterial({
    color: 0x413d38, roughness: 0.97, metalness: 0.0, flatShading: true,
  });
  const floor = new THREE.MeshStandardMaterial({
    color: 0x4c463d, roughness: 1.0, metalness: 0.0,
  });
  /* The underside of the overhang and the roof of the conduit. Slightly cooler,
     because it is a fracture face rather than a dust-covered one. */
  const roof = new THREE.MeshStandardMaterial({
    color: 0x3a3733, roughness: 0.95, metalness: 0.0, flatShading: true,
  });
  /* The boulders sit out on the open pit floor rather than inside the portal,
     so they keep ordinary depth testing and need their own instance of the
     material to keep it. */
  const bould = rock.clone();
  return { rock, floor, roof, bould };
}

/**
 * The portal: a rectangle of nothing standing in the doorway, three metres
 * inside the shaft wall so every triangle of the cave is behind it. It writes
 * the stencil and no pixels, and it is depth-tested normally, so it only marks
 * the doorway where the doorway can actually be seen.
 */
function buildPortal(cave, group) {
  const x = -OVERLAP - 1;
  const lo = cave.floorU - 2, hi = cave.floorU + cave.mouthHeight + 1;
  const geo = grid(1, 1, (i, j) => T(
    cave, x, -cave.halfW + CONDUIT.width * i, j === 0 ? lo : hi));
  const mat = new THREE.MeshBasicMaterial({
    colorWrite: false, depthWrite: false, side: THREE.DoubleSide,
    stencilWrite: true, stencilRef: 1,
    stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
  });
  const m = new THREE.Mesh(geo, mat);
  m.name = 'cave.portal';
  m.renderOrder = 10;
  group.add(m);
  return { mesh: m, mat };
}

/**
 * Build a mesh from a parametric grid.
 *
 * @param {number} nu, nv grid divisions
 * @param {function} at (i, j) -> {x, y, z} or null where there is no surface
 * @param {boolean} flip wind the other way, for surfaces seen from below
 */
function grid(nu, nv, at, flip = false) {
  const pos = [], idx = [];
  const ids = new Int32Array((nu + 1) * (nv + 1)).fill(-1);
  for (let i = 0; i <= nu; i++) {
    for (let j = 0; j <= nv; j++) {
      const p = at(i, j);
      if (!p) continue;
      ids[i * (nv + 1) + j] = pos.length / 3;
      pos.push(p.x, p.y, p.z);
    }
  }
  const id = (i, j) => ids[i * (nv + 1) + j];
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = id(i, j), b = id(i + 1, j), c = id(i + 1, j + 1), d = id(i, j + 1);
      if (a < 0 || b < 0 || c < 0 || d < 0) continue;
      if (flip) idx.push(a, c, b, a, d, c);
      else idx.push(a, b, c, a, c, d);
    }
  }
  if (!idx.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* Model space is the ENU frame at the pit centre, on the surrounding plain:
   +X east, +Y up, +Z south. So a cave-local (e, n, u) lands at (e, u, -n). */
const V = (e, n, u) => ({ x: e, y: u, z: -n });

/* And a point in the conduit's own frame — x metres out from the mouth, y
   across it — which is the frame every function below thinks in, so that
   turning the passage round is one sign in src/game/cave.js and nothing here.
   The two candidate bearings differ by 180 degrees about the vertical, which
   is a rotation: triangle winding is unaffected. */
const T = (cave, x, y, u) => {
  const l = cave.fromAxis(cave.mouthR + x, y);
  return V(l.e, l.n, u);
};

/**
 * The conduit itself: floor, two walls, and an arched roof that comes down to
 * meet the floor and closes the far end without needing a cap.
 */
function buildConduit(cave, tier, M, group) {
  const x0 = -2, x1 = cave.length;
  const nu = tier.along, nv = tier.across;
  const xAt = (i) => x0 + (x1 - x0) * (i / nu);
  const yAt = (j) => -cave.halfW + CONDUIT.width * (j / nv);
  const at0 = (x, y) => cave.fromAxis(cave.mouthR + x, y);
  const f = (x) => { const l = at0(x, 0); return cave.floorLocal(l.e, l.n); };
  const roofAt = (x, y) => { const l = at0(x, y); return cave.ceilingLocal(l.e, l.n); };

  /* Outward-only roughness, keyed on the grid index so neighbouring faces
     agree and the surface is continuous rather than sparkling. */
  const bump = (i, j, k) => tier.rough * (hash3(i + 1, j + 1, k) * 2 - 1);

  const floor = grid(nu, nv, (i, j) => {
    const x = xAt(i), y = yAt(j);
    return T(cave, x, y, f(x));
  });
  if (floor) {
    const m = new THREE.Mesh(floor, M.floor);
    m.receiveShadow = true;
    m.name = 'cave.floor';
    group.add(m);
  }

  const roof = grid(nu, nv, (i, j) => {
    const x = xAt(i), y = yAt(j);
    const u = roofAt(x, y);
    const head = u - f(x);
    /* Push up, never down, and taper the roughness out as the roof closes so
       the far end still meets the floor exactly. */
    const r = Math.max(0, Math.abs(bump(i, j, 7))) * Math.min(1, head / 3);
    return T(cave, x, y, u + r);
  }, true);
  if (roof) {
    const m = new THREE.Mesh(roof, M.roof);
    m.castShadow = true;
    m.name = 'cave.roof';
    group.add(m);
  }

  /* The side walls, one grid each, from floor to roof. */
  for (const side of [-1, 1]) {
    const wall = grid(nu, 6, (i, k) => {
      const x = xAt(i), y = side * cave.halfW;
      const lo = f(x), hi = roofAt(x, y);
      const t = k / 6;
      const out = Math.max(0, Math.abs(bump(i, k, side > 0 ? 11 : 13))) *
        Math.sin(Math.PI * t);
      return T(cave, x, y + side * out, lo + (hi - lo) * t);
    }, side > 0);
    if (!wall) continue;
    const m = new THREE.Mesh(wall, M.rock);
    m.receiveShadow = true;
    m.name = `cave.wall.${side > 0 ? 'north' : 'south'}`;
    group.add(m);
  }
}

/**
 * The boulders on the pit floor, from the sizes the paper measured.
 * One instanced mesh; the two named outliers get their own so they can be a
 * different shape without a second draw call mattering.
 */
function buildBoulders(cave, rocks, tier, M, group, name = 'cave.boulders') {
  if (!rocks.length) return null;
  const geo = new THREE.IcosahedronGeometry(0.5, 1);
  /* Squash each vertex a little so they are not obviously spheres. Lunar
     boulders are angular; this is the cheapest honest gesture at that. */
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const s = 0.72 + hash3(Math.round(p.getX(i) * 97), Math.round(p.getY(i) * 97),
      Math.round(p.getZ(i) * 97)) * 0.56;
    p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s);
  }
  geo.computeVertexNormals();

  const use = rocks.slice(0, tier.boulders).concat(rocks.filter(r => r.outlier));
  const mesh = new THREE.InstancedMesh(
    geo, name === 'cave.boulders' ? M.bould : M.rock, use.length);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  const e = new THREE.Euler(), sc = new THREE.Vector3(), tr = new THREE.Vector3();
  use.forEach((r, i) => {
    const h = hash3(Math.round(r.e * 10), Math.round(r.n * 10), 17);
    e.set(h * 6.28, hash3(i, 1, 19) * 6.28, hash3(i, 2, 23) * 6.28);
    q.setFromEuler(e);
    /* Sunk a third of the way in, the way a rock that has been sitting in
       regolith for a billion years is. */
    sc.set(r.size, r.size * (0.6 + h * 0.3), r.size);
    tr.set(r.e, (r.u ?? cave.floorU) + r.size * 0.18, -r.n);
    mesh.setMatrixAt(i, m.compose(tr, q, sc));
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.renderOrder = 20;
  group.add(mesh);
  return mesh;
}

/**
 * Build the cave.
 *
 * @param {object} opts { cave, boulders, quality }
 * @returns {{group: THREE.Group, place: function, dispose: function}}
 */
export function buildCave(opts) {
  const cave = opts.cave;
  const tier = TIER[opts.quality] || TIER.high;
  const M = materials();

  const group = new THREE.Group();
  group.name = 'cave';
  const portal = buildPortal(cave, group);
  buildConduit(cave, tier, M, group);
  buildBoulders(cave, opts.boulders || [], tier, M, group);
  /* Roof breakdown on the conduit floor. Drawn with the rest of the interior
     rather than with the pit's boulders, because it is behind the portal. */
  const rubble = buildBoulders(cave, breakdownBlocks(cave, tier.boulders), tier, M, group,
    'cave.rubble');

  /* Draw order inside the portal, where there is no depth buffer to sort by:
     roof first, then the walls, then the floor on top. That is the order they
     occlude each other in from the one place the portal can be looked through
     from, which is the pit floor, looking down and in. */
  const ORDER = {
    'cave.roof': 11,
    'cave.wall.north': 12, 'cave.wall.south': 12,
    'cave.floor': 13, 'cave.rubble': 14,
  };
  const inner = [];
  group.traverse((o) => { if (ORDER[o.name]) inner.push(o); });
  if (rubble) rubble.renderOrder = ORDER['cave.rubble'];

  /* Two ways to draw the same room. Outside it, through the portal: no depth
     test, because the wall in front already wrote depth, and the stencil is
     what keeps the room inside the doorway. Inside it: ordinary depth testing,
     because nothing is in the way any more and the room deserves to be sorted
     properly once you are standing in it. */
  let inside = null;
  const setInside = (v) => {
    if (v === inside) return;
    inside = v;
    if (portal) portal.mesh.visible = !v;
    for (const o of inner) {
      const m = o.material;
      m.stencilWrite = !v;
      m.stencilRef = 1;
      m.stencilFunc = THREE.EqualStencilFunc;
      m.depthTest = v;
      m.depthWrite = v;
      m.needsUpdate = true;
      o.renderOrder = v ? 0 : ORDER[o.name];
    }
  };
  setInside(false);

  /* Orientation never changes — the cave is part of the Moon — so the basis is
     built once and only the position moves as the floating origin does. */
  const b = enuBasis(cave.pit.lat, cave.pit.lon);
  const mat = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(b.e.x, b.e.y, b.e.z),
    new THREE.Vector3(b.u.x, b.u.y, b.u.z),
    new THREE.Vector3(-b.n.x, -b.n.y, -b.n.z));
  group.quaternion.setFromRotationMatrix(mat);
  const world = llhToXyz(cave.pit.lat, cave.pit.lon, cave.base, new THREE.Vector3());

  return {
    group,
    /** Re-seat the group after the floating origin has moved. */
    place(origin) {
      group.position.set(world.x - origin.x, world.y - origin.y, world.z - origin.z);
    },
    /**
     * Whether to draw at all, and which way.
     *
     * The portal writes stencil wherever it is on screen and visible, so it has
     * to be off when the pit is not: from a kilometre away it would still mark
     * its band and the cave would be drawn hanging in the middle of the mare.
     * Below the plain and within a hundred and sixty metres is the whole of
     * where any of this can be seen from.
     */
    update(lat, lon, alt) {
      const l = cave.toLocal(lat, lon);
      const near = Math.hypot(l.e, l.n) < 160 && alt < cave.base;
      group.visible = near;
      if (near) setInside(cave.inside(lat, lon, alt));
    },
    dispose() {
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      for (const k of Object.keys(M)) M[k].dispose();
    },
  };
}
