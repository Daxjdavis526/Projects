/* =============================================================================
   ASTRONAUT — the suit, and how a person moves inside one
   -----------------------------------------------------------------------------
   The character in SELENE is not a person. It is a pressure vessel with a person
   folded up inside it, and almost everything odd about lunar movement comes from
   that fact rather than from the gravity.

   A suit at 29.6 kPa against vacuum wants to be a sphere. Every joint is a place
   where somebody defeated that tendency: convolutes, which are fabric bellows
   that keep a constant enclosed volume as they bend so the pressure does not
   fight the motion, and bearings, which are ball races that let a section rotate
   with no work at all. So the figure here has visible ribbed sleeves at the
   shoulder, elbow, wrist, hip, knee and ankle, and metal rings at the waist,
   scye and wrist, because that is what the hardware is. The torso between them
   is a rigid shell, since a hard upper torso is cheaper to seal and stiffer to
   hang a backpack off than fabric is. The consequences are visible in the
   animation too: the neutral posture has the arms forward and the knees slightly
   bent, because that is where the pressurised garment rests, and the ankle gets
   about ten degrees of travel, which is why the walk is a flat footed shuffle.

   The suit itself is FICTIONAL. No flight article of the Artemis xEMU is public
   in this much detail, so the proportions are drawn from the published
   architecture and from Apollo's A7L, not from a drawing. The architecture is
   real: hard upper torso, soft mobility elements, waist and scye bearings,
   life support on the back, display and control unit on the chest, gold coated
   visor over a polycarbonate bubble.

   Geometry is procedural primitives and nothing else. SELENE spends its budget
   streaming real terrain, so the whole figure is a few thousand triangles and
   sixteen meshes: every rigid section is merged into one buffer at build time,
   with material groups, so a limb segment is one draw call rather than nine.

   Authoring frame: +Y up, +X east, +Z south, metres, origin between the boots.
   The figure faces -Z, which in that frame is north, and its right hand is on
   +X, matching the usual three.js convention of a model facing its own -Z. The
   caller owns position and heading; nothing here touches them.

   One thing the caller must know about animate(): the vertical arc of a lope
   belongs to the physics, not to this file. player.js gives a bound a real
   push off and a real ballistic flight, so the group is already rising and
   falling. Adding a bob here would double it. What this file does instead is
   make the limbs read as floating during the airborne half.
   ========================================================================== */

import * as THREE from 'three';

const TAU = Math.PI * 2;
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
/** Hermite ease between two edges, clamped outside them. */
function smooth(a, b, x) {
  const t = clamp((x - a) / (b - a || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

/* --- dimensions ------------------------------------------------------------
   Every number below is a height or a radius in the authoring frame, so the
   figure can be read off the file without running it. A suited 50th percentile
   crew member stands about 1.9 m to the top of the helmet shell; the eye sits
   at 1.62, which is PLAYER.eye in config.js, so a camera parented to `head`
   lands where the physics thinks the eye is.                                */

const SOLE_TOP  = 0.038;   // top of the boot sole
const ANKLE_Y   = 0.200;   // ankle joint centre
const KNEE_Y    = 0.620;
const HIP_Y     = 1.000;
const WAIST_Y   = 1.120;   // waist bearing, and the pivot of the upper body
const SHLD_Y    = 1.400;   // scye bearing centre
const SHLD_X    = 0.235;
const NECK_Y    = 1.470;   // neck ring
const ELBOW_Y   = 1.100;
const WRIST_Y   = 0.840;
const HIP_X     = 0.105;
const BUBBLE_Y  = 1.685;   // centre of the helmet bubble, and of the visor arc
const BUBBLE_R  = 0.175;
const EYE_Y     = 1.620;

const THIGH_LEN = HIP_Y - KNEE_Y;      // 0.38
const SHIN_LEN  = KNEE_Y - ANKLE_Y;    // 0.42

/* --- quality ---------------------------------------------------------------
   Radial segments dominate the count because almost everything is a cylinder.
   `detail` gates the optional meshes: hoses and tether rings first, then
   stripes, tread and radiator fins, then the small things nobody sees below
   about two metres away.                                                    */

const TIERS = {
  performance: { rad: 6,  sphW: 10, sphH: 6,  ribs: 2, detail: 0 },
  balanced:    { rad: 8,  sphW: 14, sphH: 8,  ribs: 2, detail: 1 },
  high:        { rad: 12, sphW: 18, sphH: 11, ribs: 3, detail: 2 },
  ultra:       { rad: 16, sphW: 24, sphH: 15, ribs: 3, detail: 3 },
};

/* --- materials -------------------------------------------------------------
   One directional sun, no ambient, and shadows that go properly black. That
   rules out dark albedos for anything whose shape has to read: a black boot in
   shadow is a hole. The suit fabric is off white rather than white because the
   Apollo TMG outer layer was Beta cloth, which photographs as a warm grey once
   the exposure is set for sunlit regolith, and because pure white clips.    */

const M_FABRIC = 0, M_JOINT = 1, M_SHELL = 2, M_METAL = 3, M_DARK = 4,
      M_GOLD = 5, M_LAMP = 6, M_SCREEN = 7, M_ACCENT = 8, M_THIN = 9,
      M_GLASS = 10;

function makeMaterials(accent) {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const m = [];
  m[M_FABRIC] = std({ color: 0xd7d4cb, roughness: 0.86, metalness: 0.0 });
  /* Convolutes are the same cloth, but they are always in their own shadow
     between the ribs, so they read darker in every photograph ever taken. */
  m[M_JOINT]  = std({ color: 0x8e8a82, roughness: 0.92, metalness: 0.0 });
  m[M_SHELL]  = std({ color: 0xc6c3bb, roughness: 0.48, metalness: 0.12 });
  m[M_METAL]  = std({ color: 0xb2b6bc, roughness: 0.30, metalness: 0.92 });
  m[M_DARK]   = std({ color: 0x2a2b2e, roughness: 0.78, metalness: 0.15 });
  /* Gold over the visor is not decoration: a few hundred nanometres of it
     reflects most of the infrared and keeps the head out of a 120 C sun. */
  m[M_GOLD]   = std({ color: 0xffc860, roughness: 0.11, metalness: 0.95,
                      side: THREE.DoubleSide });
  m[M_LAMP]   = std({ color: 0x1d1e20, roughness: 0.22, metalness: 0.5,
                      emissive: 0xfff0d4, emissiveIntensity: 0 });
  m[M_SCREEN] = std({ color: 0x101317, roughness: 0.35, metalness: 0.0,
                      emissive: 0x6fd0ff, emissiveIntensity: 0 });
  m[M_ACCENT] = std({ color: accent, roughness: 0.82, metalness: 0.0 });
  /* Shells with no thickness: the helmet cap and the visor are single surfaces
     and have to be visible from inside as well. */
  m[M_THIN]   = std({ color: 0xc6c3bb, roughness: 0.44, metalness: 0.12,
                      side: THREE.DoubleSide });
  /* The bubble. Nearly clear, but dark enough that the empty interior reads as
     shadow rather than as an empty helmet, which is what it looks like in
     Apollo photographs with the visor up. */
  m[M_GLASS]  = std({ color: 0x0b0d10, roughness: 0.05, metalness: 0.0,
                      transparent: true, opacity: 0.30, depthWrite: false,
                      side: THREE.DoubleSide });
  return m;
}

/* --- primitive helpers ------------------------------------------------------ */

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, seg) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, false);
const tube = (r, h, seg) => new THREE.CylinderGeometry(r, r, h, seg, 1, true);

/**
 * A convolute: the fabric bellows that lets a pressurised joint bend without
 * changing the volume it encloses. Built as one open cylinder whose rows are
 * pushed out into ribs, which is both cheaper and a better silhouette than
 * stacking separate rings.
 */
function convolute(r, len, ribs, seg) {
  const g = new THREE.CylinderGeometry(r, r, len, seg, ribs * 2, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const u = y / len + 0.5;
    const k = 1 + 0.17 * (0.5 - 0.5 * Math.cos(u * ribs * TAU));
    p.setXYZ(i, x * k, y, z * k);
  }
  g.computeVertexNormals();
  return g;
}

/* --- merging ----------------------------------------------------------------
   Without BufferGeometryUtils in the vendored set, and wanting one mesh per
   rigid section anyway, the merge is done here. Primitives are sorted by
   material so each material becomes a single contiguous group, which is what
   keeps a limb at one or two draw calls instead of one per primitive.       */

const _p = new THREE.Vector3(), _q = new THREE.Quaternion();
const _e = new THREE.Euler(), _s = new THREE.Vector3(), _n = new THREE.Matrix3();

/** Start a part. Everything stamped into it is authored in the world frame and
    rebased onto (ox, oy, oz), which is where its node will sit. */
const part = (ox, oy, oz) => ({ o: [ox, oy, oz], list: [] });

/** Stamp one primitive into a part. pos is world; rot and scale are optional. */
function put(pt, geo, mat, pos, rot, scale) {
  _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0);
  _q.setFromEuler(_e);
  _p.set(pos[0] - pt.o[0], pos[1] - pt.o[1], pos[2] - pt.o[2]);
  _s.set(scale ? scale[0] : 1, scale ? scale[1] : 1, scale ? scale[2] : 1);
  pt.list.push({ g: geo, m: new THREE.Matrix4().compose(_p, _q, _s), i: mat });
  return pt;
}

function merge(pt) {
  const list = pt.list;
  list.sort((a, b) => a.i - b.i);
  let nv = 0, ni = 0;
  for (let k = 0; k < list.length; k++) {
    nv += list[k].g.attributes.position.count;
    ni += list[k].g.index.count;
  }
  const pos = new Float32Array(nv * 3);
  const nrm = new Float32Array(nv * 3);
  const uvs = new Float32Array(nv * 2);
  const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  const geo = new THREE.BufferGeometry();
  let vo = 0, io = 0, runAt = 0, runMat = list.length ? list[0].i : 0;

  for (let k = 0; k < list.length; k++) {
    const e = list[k], g = e.g;
    if (e.i !== runMat) { geo.addGroup(runAt, io - runAt, runMat); runAt = io; runMat = e.i; }
    const ap = g.attributes.position, an = g.attributes.normal, au = g.attributes.uv;
    _n.getNormalMatrix(e.m);
    for (let i = 0; i < ap.count; i++) {
      _p.fromBufferAttribute(ap, i).applyMatrix4(e.m);
      pos[(vo + i) * 3] = _p.x; pos[(vo + i) * 3 + 1] = _p.y; pos[(vo + i) * 3 + 2] = _p.z;
      _p.fromBufferAttribute(an, i).applyMatrix3(_n).normalize();
      nrm[(vo + i) * 3] = _p.x; nrm[(vo + i) * 3 + 1] = _p.y; nrm[(vo + i) * 3 + 2] = _p.z;
      uvs[(vo + i) * 2] = au ? au.getX(i) : 0;
      uvs[(vo + i) * 2 + 1] = au ? au.getY(i) : 0;
    }
    const gi = g.index;
    for (let i = 0; i < gi.count; i++) idx[io + i] = gi.getX(i) + vo;
    vo += ap.count; io += gi.count;
    g.dispose();
  }
  geo.addGroup(runAt, io - runAt, runMat);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeBoundingSphere();
  return geo;
}

/** An empty node at a world position, placed relative to its parent's. */
function pivot(parent, ox, oy, oz) {
  const n = new THREE.Object3D();
  const o = parent.userData.o;
  n.position.set(ox - o[0], oy - o[1], oz - o[2]);
  n.userData.o = [ox, oy, oz];
  parent.add(n);
  return n;
}

/** Merge a part and hang the single resulting mesh on its node. */
function attach(n, pt, materials, shadows) {
  if (!pt.list.length) return null;
  const mesh = new THREE.Mesh(merge(pt), materials);
  mesh.castShadow = shadows;
  mesh.receiveShadow = shadows;
  n.add(mesh);
  return mesh;
}

/* --- the suit --------------------------------------------------------------
   Each function below fills one rigid section. They are written in world
   coordinates so the numbers stay readable against the table of dimensions
   above; `put` rebases them onto the node.                                  */

function buildPelvis(pt, Q, D) {
  /* The brief. Soft, and a truncated cone rather than a cylinder because the
     bearing above it is smaller than the hips below, which is also why a
     pressurised suit will not let you sit down comfortably. */
  put(pt, cyl(0.170, 0.158, 0.205, Q.rad), M_FABRIC, [0, 1.017, 0], null, [1, 1, 0.86]);
  put(pt, box(0.230, 0.100, 0.180), M_FABRIC, [0, 0.938, 0]);
}

function buildThigh(pt, Q, D, s) {
  const x = s * HIP_X;
  /* Hip bearing above, convolute below. The bearing carries the swing and the
     convolute carries the fold, which is the standard division of labour in
     every pressure garment since the A7L. */
  put(pt, tube(0.122, 0.038, Q.rad), M_METAL, [x, 0.985, 0]);
  put(pt, convolute(0.114, 0.150, Q.ribs, Q.rad), M_JOINT, [x, 0.905, 0]);
  put(pt, cyl(0.110, 0.096, 0.250, Q.rad), M_FABRIC, [x, 0.745, 0], null, [1, 1, 0.94]);
  /* Crew identification stripes. Apollo added them to the commander's suit
     after Apollo 12, when nobody could tell the two figures apart in the
     photographs, and every programme since has kept the idea. */
  if (D >= 2) put(pt, tube(0.112, 0.052, Q.rad), M_ACCENT, [x, 0.800, 0], null, [1, 1, 0.95]);
}

function buildShin(pt, Q, D, s) {
  const x = s * HIP_X;
  put(pt, convolute(0.096, 0.150, Q.ribs, Q.rad), M_JOINT, [x, 0.625, 0]);
  /* A hard knee pad. Lunar surface work is done kneeling or not at all, and
     Apollo crews wore through the outer layer at the knee first. */
  if (D >= 1) put(pt, box(0.105, 0.115, 0.030), M_SHELL, [x, 0.630, -0.086]);
  put(pt, cyl(0.092, 0.076, 0.300, Q.rad), M_FABRIC, [x, 0.390, 0], null, [1, 1, 0.95]);
  put(pt, convolute(0.078, 0.100, 2, Q.rad), M_JOINT, [x, 0.215, 0]);
}

function buildBoot(pt, Q, D, s) {
  const x = s * HIP_X;
  /* An overboot: the pressure bladder ends at the ankle and this goes over it.
     The sole is a separate slab of silicone with a ribbed tread, which is what
     left the famous print, and it is deliberately larger than the foot to
     spread load on regolith with almost no bearing strength. */
  put(pt, box(0.158, 0.034, 0.330), M_DARK, [x, 0.029, -0.045]);
  put(pt, box(0.142, 0.130, 0.215), M_FABRIC, [x, 0.111, -0.020]);
  put(pt, box(0.128, 0.062, 0.115), M_FABRIC, [x, 0.078, -0.148]);
  if (D >= 1) put(pt, tube(0.088, 0.030, Q.rad), M_METAL, [x, 0.182, -0.020]);
  if (D >= 2) {
    for (let i = 0; i < 5; i++)
      put(pt, box(0.150, 0.014, 0.026), M_DARK, [x, 0.006, -0.185 + i * 0.075]);
  }
}

function buildTorso(pt, Q, D) {
  /* Waist bearing. Without one you cannot turn to look behind you, and on the
     Moon you cannot look down at your own boots either. */
  put(pt, tube(0.162, 0.052, Q.rad), M_METAL, [0, 1.122, 0], null, [1, 1, 0.90]);
  /* The hard upper torso: one composite shell carrying the neck ring, both
     scye bearings, the waist bearing and the whole mass of the backpack. Oval
     in section, wider than deep, like the rib cage it replaces. */
  put(pt, cyl(0.214, 0.172, 0.230, Q.rad), M_SHELL, [0, 1.255, 0], null, [1, 1, 0.78]);
  put(pt, cyl(0.222, 0.214, 0.100, Q.rad), M_SHELL, [0, 1.415, 0], null, [1.04, 1, 0.80]);
  put(pt, tube(0.100, 0.048, Q.rad), M_METAL, [0, 1.480, 0]);
  /* Scye bearings, angled outward and slightly forward. The arm hangs off the
     ring, so where the ring points is where the shoulder's neutral is, and
     that is why a suited arm rests in front of the body rather than beside it. */
  for (let s = -1; s <= 1; s += 2)
    put(pt, tube(0.086, 0.058, Q.rad), M_METAL, [s * 0.220, 1.398, -0.008],
        [0.22, 0, -s * Math.PI / 2]);

  /* Display and control unit, tilted up. It has to be, because the helmet does
     not let the wearer look down: everything on the chest is read at a glance
     across the top of the visor, or in a wrist mirror. */
  put(pt, box(0.205, 0.140, 0.055), M_SHELL, [0, 1.288, -0.172], [0.34, 0, 0]);
  put(pt, box(0.125, 0.058, 0.012), M_SCREEN, [0, 1.299, -0.203], [0.34, 0, 0]);
  if (D >= 2) {
    const bx = [-0.072, -0.024, 0.024, 0.072];
    for (let i = 0; i < 4; i++)
      put(pt, cyl(0.013, 0.013, 0.014, 6), M_DARK, [bx[i], 1.253, -0.187],
          [-Math.PI / 2 + 0.34, 0, 0]);
  }
  /* Umbilical connectors: oxygen out, oxygen return, cooling water, power and
     comms. They cluster on the chest so a second crew member can reach them. */
  if (D >= 1) {
    const cn = [[-0.128, 1.362], [0.128, 1.362], [0.116, 1.202]];
    for (let i = 0; i < cn.length; i++)
      put(pt, cyl(0.028, 0.024, 0.048, 6), M_METAL, [cn[i][0], cn[i][1], -0.150],
          [-Math.PI / 2, 0, 0]);
    /* Tether rings. Everything on a lunar EVA is tied to something. */
    for (let s = -1; s <= 1; s += 2)
      put(pt, new THREE.TorusGeometry(0.036, 0.011, 4, 8), M_METAL,
          [s * 0.196, 1.192, -0.050], [0, Math.PI / 2, 0.4]);
  }

  /* Portable life support. Oxygen, a regenerable amine bed for the carbon
     dioxide, feedwater for the sublimator, batteries and the radio. It masses
     more than the pressure garment does and it all hangs behind the shoulder
     blades, which is the entire reason this figure leans forward when it
     moves: the crews did, because the alternative is falling over backwards. */
  put(pt, box(0.420, 0.460, 0.200), M_SHELL, [0, 1.290, 0.225]);
  put(pt, box(0.380, 0.400, 0.048), M_SHELL, [0, 1.290, 0.348]);
  put(pt, box(0.400, 0.050, 0.220), M_SHELL, [0, 1.545, 0.225]);
  put(pt, box(0.400, 0.042, 0.210), M_DARK, [0, 1.040, 0.225]);
  if (D >= 1) {
    for (let s = -1; s <= 1; s += 2)
      put(pt, box(0.022, 0.440, 0.024), M_METAL, [s * 0.216, 1.290, 0.225]);
    /* The two hoses that make the suit a closed loop: gas out of the pack into
       the helmet, gas back out of the torso into the scrubber. They run around
       the side rather than over the shoulder so the wearer can still see. */
    for (let s = -1; s <= 1; s += 2) {
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.150, 1.085, 0.130),
        new THREE.Vector3(s * 0.232, 1.130, 0.020),
        new THREE.Vector3(s * 0.212, 1.290, -0.108),
        new THREE.Vector3(s * 0.128, 1.352, -0.168),
      ]);
      put(pt, new THREE.TubeGeometry(path, 8, 0.024, 5, false), M_DARK, [0, 0, 0]);
    }
  }
  if (D >= 2) {
    /* Radiator fins on the back face. A sublimator throws most of the heat
       away as ice, but the electronics still need somewhere to put theirs. */
    for (let i = 0; i < 5; i++)
      put(pt, box(0.340, 0.014, 0.030), M_METAL, [0, 1.130 + i * 0.082, 0.378]);
  }
  if (D >= 3) put(pt, box(0.014, 0.130, 0.055), M_DARK, [0.145, 1.620, 0.300]);
}

function buildUpperArm(pt, Q, D, s) {
  const x = s * SHLD_X;
  put(pt, convolute(0.082, 0.140, Q.ribs, Q.rad), M_JOINT, [x, 1.362, -0.010]);
  put(pt, cyl(0.076, 0.068, 0.200, Q.rad), M_FABRIC, [x, 1.200, -0.010]);
  if (D >= 2) put(pt, tube(0.078, 0.052, Q.rad), M_ACCENT, [x, 1.245, -0.010]);
}

function buildForearm(pt, Q, D, s) {
  const x = s * SHLD_X;
  put(pt, convolute(0.070, 0.130, Q.ribs, Q.rad), M_JOINT, [x, 1.098, -0.010]);
  put(pt, cyl(0.064, 0.056, 0.190, Q.rad), M_FABRIC, [x, 0.945, -0.010]);
  /* Wrist bearing. The one bearing that matters most: without it you cannot
     turn a bolt, you can only push it. */
  put(pt, tube(0.058, 0.032, Q.rad), M_METAL, [x, 0.848, -0.010]);
  /* The cuff checklist, which is where the EVA timeline actually lived on
     Apollo, printed on the back of the wrist where it could be read. */
  if (D >= 3) put(pt, box(0.062, 0.052, 0.012), M_SHELL, [x, 0.905, -0.072], [0.2, 0, 0]);
}

function buildGlove(pt, Q, D, s) {
  const x = s * SHLD_X;
  const inward = -s;      // the thumb side
  put(pt, convolute(0.052, 0.055, 2, Q.rad), M_JOINT, [x, 0.818, -0.010]);
  put(pt, box(0.078, 0.105, 0.062), M_FABRIC, [x, 0.735, -0.014]);
  /* The palm and finger pads are a different, grippier material on every suit
     ever flown, and they are the part that wears out. */
  put(pt, box(0.076, 0.070, 0.052), M_DARK, [x, 0.672, -0.026], [0.38, 0, 0]);
  if (D >= 1) {
    put(pt, cyl(0.017, 0.015, 0.058, 6), M_DARK,
        [x + inward * 0.042, 0.706, -0.030], [0.5, 0, inward * 0.5]);
  }
}

function buildHelmet(pt, Q, D) {
  const sw = Q.sphW, sh = Q.sphH;
  /* The neck yoke, then the bubble itself: one piece of polycarbonate, because
     a sphere is the shape that needs no reinforcement and gives the widest
     field of view for the least mass. */
  put(pt, cyl(0.100, 0.114, 0.070, Q.rad), M_FABRIC, [0, 1.500, 0]);
  put(pt, new THREE.SphereGeometry(BUBBLE_R, sw, sh), M_GLASS, [0, BUBBLE_Y, -0.005]);
  /* A soft communications cap inside. It is there so the helmet does not read
     as empty; under this lighting it is mostly a dark shape behind glass,
     which is exactly how it looks in the Apollo surface photography. */
  if (D >= 2)
    put(pt, new THREE.SphereGeometry(0.104, 8, 6), M_DARK, [0, 1.702, 0.012]);

  /* The protective shell over the back and top of the bubble, open at the
     face. It carries the lamps, takes the micrometeoroid risk and stops the
     bubble being scratched by everything the wearer walks into. */
  const shw = Math.max(6, Math.round(sw * 4.10 / TAU));
  const shh = Math.max(3, Math.round(sh * 2.00 / Math.PI));
  put(pt, new THREE.SphereGeometry(0.196, shw, shh, Math.PI / 2 - 2.05, 4.10, 0, 2.00),
      M_THIN, [0, BUBBLE_Y, -0.005]);
  if (D >= 2)
    put(pt, new THREE.SphereGeometry(0.204, 8, 1, -Math.PI / 2 - 1.05, 2.10, 0.60, 0.22),
        M_THIN, [0, BUBBLE_Y, -0.005]);

  /* Suit lights, one either side, aimed a little below the horizon. Shadows on
     the Moon are absolute, so a lamp is not a convenience: at a low sun the
     inside of every crater and every one of your own footprints is unlit. */
  for (let s = -1; s <= 1; s += 2) {
    const rx = -Math.PI / 2 - 0.14, ry = s * 0.22;
    put(pt, cyl(0.034, 0.038, 0.062, 6), M_SHELL, [s * 0.132, 1.700, -0.086], [rx, ry, 0]);
    put(pt, cyl(0.029, 0.029, 0.008, 6), M_LAMP, [s * 0.126, 1.696, -0.116], [rx, ry, 0]);
    if (D >= 1)
      put(pt, box(0.030, 0.026, 0.045), M_SHELL, [s * 0.148, 1.706, -0.052], [0, ry, 0]);
  }
}

function buildVisor(pt, Q, D) {
  /* Gold over the front of the bubble. A coating a few hundred nanometres
     thick reflects most of the infrared and keeps a head out of a sun that has
     nothing between it and the surface. It slides on the same centre as the
     bubble, so raising it is a rotation about that centre and nothing else. */
  const w = Math.max(10, Math.round(Q.sphW * 0.62));
  const h = Math.max(5, Math.round(Q.sphH * 0.58));
  put(pt, new THREE.SphereGeometry(0.186, w, h, -Math.PI / 2 - 1.15, 2.30, 0.52, 1.42),
      M_GOLD, [0, BUBBLE_Y, -0.005]);
  if (D >= 2)
    put(pt, new THREE.SphereGeometry(0.190, w, 1, -Math.PI / 2 - 1.16, 2.32, 0.50, 0.055),
        M_METAL, [0, BUBBLE_Y, -0.005]);
}
