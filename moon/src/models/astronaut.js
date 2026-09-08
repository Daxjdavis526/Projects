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

const ANKLE_Y   = 0.200;   // ankle joint centre, above the top of the sole
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

/* The boot, measured from the ankle joint, which is what the foot planting in
   animate() needs: how far the sole is below it, and how far the sole reaches
   ahead of and behind it. A suited boot is a long flat slab and it tips about
   this joint, so those overhangs are what actually touches the ground. */
const SOLE_DROP   = 0.188;
const TOE_AHEAD   = 0.210;
const HEEL_BEHIND = 0.120;
const SOLE_Y0     = ANKLE_Y - SOLE_DROP;   // where the sole sits at rest, 0.012

/* How far the lowest corner of one boot sits below the hip joint, given the
   three joint angles and the lean of the body carrying them. Every angle is
   taken into the world by subtracting the lean, because the body pitches about
   the boots and a leg cannot be measured in a frame that is tipping.

   Both legs are pin joints in one plane, so this is the whole of the inverse
   kinematics in this file, and the last two terms are what makes it a boot
   rather than a point: a suited sole is a long flat slab, and when it tips it
   is a corner that touches, not the ankle. */
function soleBelowHip(hip, knee, ankle, lean) {
  const a = hip - lean;              // thigh, against the vertical
  const b = a - knee;                // shin
  const phi = b + ankle;             // the sole's own pitch
  const s = Math.sin(phi);
  return THIGH_LEN * Math.cos(a) + SHIN_LEN * Math.cos(b) + SOLE_DROP * Math.cos(phi)
       + (s > 0 ? HEEL_BEHIND : TOE_AHEAD) * Math.abs(s);
}

/* --- quality ---------------------------------------------------------------
   Radial segments dominate the count because almost everything is a cylinder.
   `detail` gates the optional meshes: hoses and tether rings first, then
   stripes, tread and radiator fins, then the things nobody can make out from
   more than about two metres away.                                          */

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
  /* Convolutes are the same cloth, but the fabric between the ribs is always
     in its own shadow, so a joint reads darker than the limb it belongs to. */
  m[M_JOINT]  = std({ color: 0x8e8a82, roughness: 0.92, metalness: 0.0 });
  m[M_SHELL]  = std({ color: 0xc6c3bb, roughness: 0.48, metalness: 0.12 });
  /* Bearings and connectors. Metalness is held short of 1 deliberately: with
     one directional light and no environment map, a fully metallic surface has
     nothing to reflect except the Sun, and renders black everywhere else. That
     is arguably the truth in a vacuum, but it loses the hardware entirely, so
     these keep enough diffuse to stay readable. */
  m[M_METAL]  = std({ color: 0xc0c4ca, roughness: 0.34, metalness: 0.62 });
  m[M_DARK]   = std({ color: 0x2a2b2e, roughness: 0.78, metalness: 0.15 });
  /* Gold on the visor is not decoration: a few hundred nanometres of it
     reflects most of the infrared and keeps a head out of a 120 C sun. Same
     compromise as the metal above, and more visible here, because a mirror
     facing a black sky with nothing to reflect is a black visor. */
  m[M_GOLD]   = std({ color: 0xffc860, roughness: 0.20, metalness: 0.55,
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
    if (e.i !== runMat) {
      geo.addGroup(runAt, io - runAt, runMat);
      runAt = io; runMat = e.i;
    }
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
  /* The brief. Soft, and a truncated cone because the bearing above it is
     smaller than the hips below. This is the section a pressurised garment
     resists folding most, which is why sitting down in one is work. */
  put(pt, cyl(0.170, 0.158, 0.205, Q.rad), M_FABRIC, [0, 1.017, 0], null, [1, 1, 0.86]);
  put(pt, box(0.230, 0.100, 0.180), M_FABRIC, [0, 0.938, 0]);
}

function buildThigh(pt, Q, D, s) {
  const x = s * HIP_X;
  /* Hip bearing above, convolute below. The bearing carries the swing and the
     convolute carries the fold, which is the standard division of labour in
     every pressure garment since the A7L. */
  put(pt, tube(0.122, 0.038, Q.rad), M_METAL, [x, 0.985, 0]);
  put(pt, convolute(0.116, 0.150, Q.ribs, Q.rad), M_JOINT, [x, 0.905, 0]);
  /* Limb sections run well past the joints they meet, and the convolutes are
     open tubes with nothing inside them. Anywhere the overlap is short, the
     camera finds its way through the fabric and into an empty leg. */
  put(pt, cyl(0.110, 0.092, 0.340, Q.rad), M_FABRIC, [x, 0.750, 0], null, [1, 1, 0.94]);
  /* Crew identification stripes. Apollo added them to the commander's suit
     after Apollo 12, when nobody could tell the two figures apart in the
     photographs, and every programme since has kept the idea. */
  if (D >= 2)
    put(pt, tube(0.112, 0.052, Q.rad), M_ACCENT, [x, 0.800, 0], null, [1, 1, 0.95]);
}

function buildShin(pt, Q, D, s) {
  const x = s * HIP_X;
  put(pt, convolute(0.102, 0.150, Q.ribs, Q.rad), M_JOINT, [x, 0.625, 0]);
  /* A hard knee pad, because the knee is where the outer layer takes its
     abrasion on the way down. Apollo's tools were long handled precisely so
     that nobody had to get down there deliberately. */
  if (D >= 1) put(pt, box(0.105, 0.115, 0.032), M_SHELL, [x, 0.630, -0.118]);
  put(pt, cyl(0.092, 0.072, 0.390, Q.rad), M_FABRIC, [x, 0.385, 0], null, [1, 1, 0.95]);
  put(pt, convolute(0.084, 0.100, 2, Q.rad), M_JOINT, [x, 0.215, 0]);
}

function buildBoot(pt, Q, D, s) {
  const x = s * HIP_X;
  /* An overboot: the pressure bladder ends at the ankle and this goes over it.
     The sole is a separate slab of silicone with a ribbed tread, which is what
     left the famous print, and it is larger than the foot because until
     Surveyor landed nobody knew what the regolith would carry. */
  put(pt, box(0.158, 0.034, 0.330), M_DARK, [x, 0.029, -0.045]);
  put(pt, box(0.142, 0.130, 0.215), M_FABRIC, [x, 0.111, -0.020]);
  put(pt, box(0.132, 0.074, 0.115), M_FABRIC, [x, 0.086, -0.146], [0.13, 0, 0]);
  if (D >= 1) put(pt, tube(0.088, 0.030, Q.rad), M_METAL, [x, 0.182, -0.020]);
  if (D >= 2) {
    for (let i = 0; i < 5; i++)
      put(pt, box(0.150, 0.014, 0.026), M_DARK, [x, 0.006, -0.185 + i * 0.075]);
  }
}

function buildTorso(pt, Q, D) {
  /* Waist bearing. Apollo's A7L had none, and the crews turned by moving their
     feet; the A7LB added one for the last three missions largely so that a
     suited person could sit in the rover. */
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
     dioxide, feedwater for the sublimator, batteries and the radio. It is the
     heaviest single thing a crew member carries and all of it hangs behind the
     shoulder blades, which is the entire reason this figure leans forward when
     it moves. The crews did the same, and for the same reason. */
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
  put(pt, cyl(0.076, 0.068, 0.250, Q.rad), M_FABRIC, [x, 1.215, -0.010]);
  if (D >= 2) put(pt, tube(0.078, 0.052, Q.rad), M_ACCENT, [x, 1.245, -0.010]);
}

function buildForearm(pt, Q, D, s) {
  const x = s * SHLD_X;
  put(pt, convolute(0.073, 0.130, Q.ribs, Q.rad), M_JOINT, [x, 1.098, -0.010]);
  put(pt, cyl(0.066, 0.056, 0.250, Q.rad), M_FABRIC, [x, 0.975, -0.010]);
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
  /* The palm and finger pads are a different, grippier material, and they are
     the part that wears out: Apollo 17 came home with the outer layer worn
     through at the fingertips. */
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
     inside of every crater and every one of your own footprints is unlit.

     They sit proud of the shell rather than sunk into it. The bubble's radius
     is 0.175 and the shell's 0.196, so anything mounted nearer the centre than
     that is inside the helmet with the wearer. */
  for (let s = -1; s <= 1; s += 2) {
    const rx = -Math.PI / 2 - 0.14, ry = s * 0.24;
    put(pt, cyl(0.034, 0.038, 0.070, 6), M_SHELL, [s * 0.192, 1.702, -0.082], [rx, ry, 0]);
    put(pt, cyl(0.030, 0.030, 0.010, 6), M_LAMP, [s * 0.183, 1.697, -0.117], [rx, ry, 0]);
    if (D >= 1)
      put(pt, box(0.034, 0.028, 0.050), M_SHELL, [s * 0.180, 1.706, -0.026], [0, ry, 0]);
  }
}

function buildVisor(pt, Q, D) {
  /* Gold over the front of the bubble. A coating a few hundred nanometres
     thick reflects most of the infrared and keeps a head out of a sun that has
     nothing between it and the surface. It slides on the same centre as the
     bubble, so raising it is a rotation about that centre and nothing else. */
  const w = Math.max(10, Math.round(Q.sphW * 0.62));
  const h = Math.max(5, Math.round(Q.sphH * 0.58));
  put(pt, new THREE.SphereGeometry(0.186, w, h, -Math.PI / 2 - 1.15, 2.30, 0.30, 1.82),
      M_GOLD, [0, BUBBLE_Y, -0.005]);
  if (D >= 2)
    put(pt, new THREE.SphereGeometry(0.190, w, 1, -Math.PI / 2 - 1.16, 2.32, 0.28, 0.055),
        M_METAL, [0, BUBBLE_Y, -0.005]);
}

/* --- assembly and animation ------------------------------------------------- */

/** Angle the visor sweeps through to sit up under the shell, radians. */
const VISOR_UP = 1.92;

/** Substituted when the caller has nothing to say yet. */
const REST = { gait: 'stand', speed: 0, stepPhase: 0, grounded: true,
               jetOn: false, exertion: 0, dt: 1 / 60 };

/**
 * @param {object} opts
 *   quality  'performance' | 'balanced' | 'high' | 'ultra'   (default high)
 *   accent   crew stripe colour                              (default 0xb1462c)
 *   visor    'down' | 'up'                                   (default down)
 *   lights   whether the helmet lamps start lit              (default false)
 *   shadows  cast and receive shadows                        (default true)
 */
export function buildAstronaut(opts = {}) {
  const Q = TIERS[opts.quality] || TIERS.high;
  const D = Q.detail;
  const shadows = opts.shadows !== false;
  const mats = makeMaterials(opts.accent ?? 0xb1462c);

  /* --- skeleton -----------------------------------------------------------
     Three joints down each arm and each leg, and four nodes up the middle.
     The helmet is one of those four and it does not turn: an EVA helmet is
     bolted to the neck ring, so the wearer turns their whole body to look at
     something, and a camera parented to `head` has to carry its own yaw and
     pitch rather than expecting the model to supply them.                  */

  const group = new THREE.Group();
  group.name = 'astronaut';
  group.userData.o = [0, 0, 0];

  const body   = pivot(group, 0, 0, 0);
  const hips   = pivot(body, 0, HIP_Y, 0);
  const spine  = pivot(hips, 0, WAIST_Y, 0);
  const helmet = pivot(spine, 0, NECK_Y, 0);
  const visorNode = pivot(helmet, 0, BUBBLE_Y, -0.005);
  const head = pivot(helmet, 0, EYE_Y, -0.045);
  const lampAnchor = pivot(helmet, 0, 1.678, -0.150);
  /* The lamps are aimed a few degrees below the horizon, where the work is. */
  lampAnchor.rotation.x = -0.12;

  function limbs(s) {
    const leg  = pivot(hips, s * HIP_X, HIP_Y, 0);
    const shin = pivot(leg, s * HIP_X, KNEE_Y, 0);
    const foot = pivot(shin, s * HIP_X, ANKLE_Y, 0);
    const arm  = pivot(spine, s * SHLD_X, SHLD_Y, -0.010);
    const fore = pivot(arm, s * SHLD_X, ELBOW_Y, -0.010);
    const hand = pivot(fore, s * SHLD_X, WRIST_Y, -0.010);
    hand.rotation.x = 0.14;      // the glove rests slightly flexed, always
    const build = (n, ox, oy, oz, fn) => {
      const g = part(ox, oy, oz);
      fn(g, Q, D, s);
      attach(n, g, mats, shadows);
    };
    build(leg,  s * HIP_X,  HIP_Y,   0,      buildThigh);
    build(shin, s * HIP_X,  KNEE_Y,  0,      buildShin);
    build(foot, s * HIP_X,  ANKLE_Y, 0,      buildBoot);
    build(arm,  s * SHLD_X, SHLD_Y,  -0.010, buildUpperArm);
    build(fore, s * SHLD_X, ELBOW_Y, -0.010, buildForearm);
    build(hand, s * SHLD_X, WRIST_Y, -0.010, buildGlove);
    return { leg, shin, foot, arm, fore, hand };
  }
  const L = limbs(-1), R = limbs(1);

  let g = part(0, HIP_Y, 0);     buildPelvis(g, Q, D); attach(hips, g, mats, shadows);
  g = part(0, WAIST_Y, 0);       buildTorso(g, Q, D);  attach(spine, g, mats, shadows);
  g = part(0, NECK_Y, 0);        buildHelmet(g, Q, D); attach(helmet, g, mats, shadows);
  g = part(0, BUBBLE_Y, -0.005); buildVisor(g, Q, D);  attach(visorNode, g, mats, shadows);

  let triangles = 0;
  group.traverse((o) => { if (o.isMesh) triangles += o.geometry.index.count / 3; });
  group.userData.triangles = triangles;

  /* --- pose state ---------------------------------------------------------
     Two identical records of joint angles: what the gait is asking for, and
     what is currently being drawn. Blending one towards the other is what
     makes every transition free, and it costs one exponential per frame
     rather than a hand written transition per pair of gaits.

     Sign convention, once: every "pitch" here is positive forward, the way a
     person leans, and every "abduct" is positive away from the body. The
     frame's actual signs are put back at the single point of use at the
     bottom of animate, so none of the numbers above have to be read twice. */

  const tgt = {
    bodyY: 0, bodyZ: 0, bodyPitch: 0, bodyRoll: 0,
    hipsYaw: 0, hipsRoll: 0,
    spinePitch: 0, spineYaw: 0, spineRoll: 0,
    hipL: 0, hipR: 0, abdL: 0, abdR: 0, kneeL: 0, kneeR: 0, ankleL: 0, ankleR: 0,
    shPitchL: 0, shPitchR: 0, shAbdL: 0, shAbdR: 0, elbowL: 0, elbowR: 0,
    neckPitch: 0,
  };
  const cur = Object.assign({}, tgt);
  const KEYS = Object.keys(tgt);

  /* Two keyframes for the fall. A suited figure cannot land on its back with a
     PLSS in the way, so it goes down forwards onto the chest and comes back up
     through a crouch. This is keyframed rather than simulated, and it is the
     least honest thing in the file. */
  const DOWN = Object.assign({}, tgt, {
    /* Prone on the chest, head up, hands under the shoulders, boots trailing.
       The body pitches about the boots, so bodyZ carries the figure back until
       it straddles the point the physics still thinks it is standing on. */
    bodyPitch: 1.40, bodyY: 0.08, bodyZ: 0.62,
    hipL: 0.12, hipR: 0.18, kneeL: 0.80, kneeR: 0.95, ankleL: -0.15, ankleR: -0.15,
    abdL: 0.20, abdR: 0.16, shPitchL: 1.35, shPitchR: 1.25,
    shAbdL: 0.55, shAbdR: 0.48, elbowL: 1.30, elbowR: 1.15,
    spinePitch: -0.34, spineRoll: 0.08, neckPitch: -0.20,
  });
  const CROUCH = Object.assign({}, tgt, {
    /* Boots under the body, hips low, torso well forward, hands near the
       ground. Not a kneel: at 29.6 kPa you cannot kneel and then rise out of
       it, so the way up is to get the feet underneath and lever the pack over
       them. The heels come off the ground because the ankle runs out of travel
       long before the knee does, which is the suit's doing and not the pose's. */
    bodyPitch: 0.60, bodyZ: 0.50,
    hipL: 1.60, hipR: 1.50, kneeL: 2.00, kneeR: 1.90, ankleL: 0.17, ankleR: 0.17,
    abdL: 0.26, abdR: 0.24, shPitchL: 1.50, shPitchR: 1.35,
    shAbdL: 0.42, shAbdR: 0.38, elbowL: 0.90, elbowR: 1.05,
    spinePitch: 0.30, neckPitch: 0.10,
  });

  let time = 0;          // s since build, for the oscillations that are not gait
  let lopePhase = 0;     // stride carried on internally through the airborne half
  let lopeHold = 0;      // how much longer that is allowed to continue
  let lopeSpeed = 0;
  let plant = 1;         // 0..1, how firmly the boots are being held on the ground
  let fallT = 0;         // s since the figure went down
  let downW = 0;         // 0..1, how much of the prone keyframe is showing
  let lampWant = opts.lights ? 1 : 0, lampLevel = lampWant;
  let visorWant = opts.visor === 'up' ? VISOR_UP : 0;
  let visorAngle = visorWant;

  const _leg = { hip: 0, knee: 0, ankle: 0 };

  /* --- gaits --------------------------------------------------------------- */

  function poseStand(T) {
    /* Neutral for a pressurised garment, not for a person. The arms rest
       forward and low and the elbows stay bent, because that is where the
       convolutes sit with no work done on them; holding an arm straight down
       against 29.6 kPa is an exercise, and by the end of an EVA it hurts. */
    const s1 = Math.sin(time * 0.62), s2 = Math.sin(time * 0.41 + 1.1);
    T.spinePitch = 0.055 + 0.012 * s1;
    T.spineRoll = 0.014 * s2;
    T.hipsRoll = 0.012 * s1;
    T.hipsYaw = 0.010 * s2;
    T.hipL = 0.030; T.hipR = 0.030;
    T.kneeL = 0.075; T.kneeR = 0.075;
    T.abdL = 0.055; T.abdR = 0.055;
    /* The ankle is whatever keeps the sole flat on the ground, here and in
       every other gait: a boot is a slab and it lies on the regolith. */
    T.ankleL = T.kneeL - T.hipL; T.ankleR = T.kneeR - T.hipR;
    T.shPitchL = 0.34; T.shPitchR = 0.34;
    T.shAbdL = 0.26; T.shAbdR = 0.26;
    T.elbowL = 0.72; T.elbowR = 0.72;
    T.neckPitch = 0.02;
  }

  function poseWalk(T, phase, speed) {
    /* Walking stays stable only up to a Froude number near 0.37, which at
       1.62 m/s^2 and a 0.92 m leg is about 0.7 m/s, so this gait is never fast
       and the swing is never large. The knee barely bends and the ankle barely
       moves at all: an ankle convolute gives something like ten degrees, which
       is why the Apollo walk is a flat footed shuffle and not a stride. */
    const w = phase * TAU;
    const sL = Math.sin(w), sR = Math.sin(w + Math.PI);
    const amp = 0.26 * clamp(speed / 1.1, 0.25, 1.15);
    T.hipL = sL * amp; T.hipR = sR * amp;
    T.kneeL = 0.10 + 0.20 * Math.max(0, Math.sin(w - 0.7));
    T.kneeR = 0.10 + 0.20 * Math.max(0, Math.sin(w + Math.PI - 0.7));
    /* Flat footed, and clamped to the ten degrees or so an ankle convolute
       gives before the pressure wins. Past that the whole boot tips, which is
       exactly what the Apollo film shows a suited walk doing. */
    T.ankleL = clamp(T.kneeL - T.hipL, -0.17, 0.17);
    T.ankleR = clamp(T.kneeR - T.hipR, -0.17, 0.17);
    T.abdL = 0.050; T.abdR = 0.050;
    T.hipsYaw = -sL * 0.06; T.spineYaw = sL * 0.05;
    T.hipsRoll = sL * 0.022;
    T.spinePitch = 0.10;
    T.shPitchL = 0.36 + sR * 0.14; T.shPitchR = 0.36 + sL * 0.14;
    T.shAbdL = 0.24; T.shAbdR = 0.24;
    T.elbowL = 0.70; T.elbowR = 0.70;
    /* A small bob, and only a small one. Most of the rise and fall comes out
       of the leg angles by way of the foot planting below. */
    T.bodyY = 0.010 * Math.sin(2 * w);
    T.neckPitch = 0.03;
  }

  /* One leg through one bound, where `u` is 0..1 from the moment the boot
     touches. Contact is about a third of the stride and the rest is flight,
     which is what makes a bound a bound: a terrestrial run is nearer half and
     half. During the flight the leg hangs, then reaches, slowly, because at a
     sixth of a g there is nothing hurrying it back down. */
  function lopeLeg(u) {
    const C = 0.36;
    if (u < C) {
      const s = u / C;
      _leg.hip = lerp(0.42, -0.46, s);
      _leg.knee = 0.34 * (1 - Math.abs(2 * s - 1));
      _leg.ankle = clamp(_leg.knee - _leg.hip, -0.17, 0.17);
    } else {
      const f = (u - C) / (1 - C);
      _leg.hip = lerp(-0.46, 0.42, smooth(0.10, 0.92, f));
      _leg.knee = 0.62 * Math.sin(Math.PI * Math.pow(f, 0.85));
      /* Toe up a little on the way down, so the boot arrives flat. */
      _leg.ankle = clamp(_leg.knee - _leg.hip - 0.20 * (1 - f), -0.17, 0.17);
    }
  }

  function poseLope(T, phase, speed) {
    const load = clamp(speed / 3.6, 0, 1);
    /* Both legs swing nearly together with a small offset, which is what the
       Apollo 16 and 17 films show: a skipping bound, not an alternating run. */
    lopeLeg(phase - Math.floor(phase));
    T.hipL = _leg.hip; T.kneeL = _leg.knee; T.ankleL = _leg.ankle;
    const u2 = phase + 0.14;
    lopeLeg(u2 - Math.floor(u2));
    T.hipR = _leg.hip; T.kneeR = _leg.knee; T.ankleR = _leg.ankle;
    T.abdL = 0.10; T.abdR = 0.10;
    /* Forward, hard, over the toes. The pack is behind you, the bound throws
       you up as much as along, and stopping takes several paces. */
    T.spinePitch = 0.24 + 0.08 * load;
    const w = phase * TAU;
    T.hipsYaw = Math.sin(w) * 0.10;
    T.hipsRoll = Math.sin(w) * 0.05;
    T.spineRoll = -Math.sin(w) * 0.04;
    /* Arms wide and swinging across the body. With a sixth of the traction,
       balance is recovered with the arms; the feet cannot do it. */
    T.shAbdL = 0.54 + 0.14 * load; T.shAbdR = 0.54 + 0.14 * load;
    T.shPitchL = 0.30 - Math.sin(w) * 0.40;
    T.shPitchR = 0.30 + Math.sin(w) * 0.40;
    T.elbowL = 0.85; T.elbowR = 0.85;
    T.neckPitch = 0.05;
  }

  function poseFlight(T, speed, jet) {
    const load = clamp(speed / 3.6, 0, 1);
    const d1 = Math.sin(time * 1.3), d2 = Math.sin(time * 0.9 + 2.0);
    /* Nothing to push against. The legs trail and the arms come out, and the
       only authority anybody has in the air is the little that swinging a limb
       buys, which is why player.js gives flight about a tenth of the control. */
    T.hipL = -0.26 + 0.07 * d1; T.hipR = -0.20 - 0.07 * d1;
    T.kneeL = 0.40 + 0.08 * d2; T.kneeR = 0.46 - 0.08 * d2;
    T.ankleL = 0.10; T.ankleR = 0.10;
    T.abdL = 0.16; T.abdR = 0.16;
    T.shPitchL = 0.10 + 0.06 * d2; T.shPitchR = 0.10 - 0.06 * d2;
    T.shAbdL = 0.88; T.shAbdR = 0.88;
    T.elbowL = 0.28; T.elbowR = 0.28;
    T.spineRoll = 0.03 * d1;
    T.spinePitch = 0.18 + 0.16 * load;
    if (jet) {
      /* Thrust is mostly straight up, so the body comes upright under it, and
         the whole figure shakes. The pack is FICTIONAL; the shaking is the
         one honest thing about bolting a rocket to a rucksack. */
      T.spinePitch = 0.08 + 0.10 * load;
      T.hipL = -0.10; T.hipR = -0.14; T.kneeL = 0.26; T.kneeR = 0.30;
      const buzz = Math.sin(time * 47.0) * 0.004 + Math.sin(time * 31.3) * 0.003;
      T.bodyPitch = buzz; T.bodyRoll = buzz * 0.7;
    }
    T.neckPitch = 0.04;
  }

  function blendKey(T, K, w) {
    if (w <= 0.001) return;
    for (let i = 0; i < KEYS.length; i++) {
      const k = KEYS[i];
      T[k] += (K[k] - T[k]) * w;
    }
  }

  /* --- the frame -----------------------------------------------------------
     Nothing below allocates. Every vector, quaternion and scratch record was
     made at build time, the target record is rewritten in place, and the only
     objects touched are the pivots' own Euler angles.                       */

  function animate(pose) {
    const p = pose || REST;
    const dt = clamp(p.dt || 1 / 60, 0, 0.1);
    time += dt;

    const speed = p.speed || 0;
    const ex = clamp(p.exertion || 0, 0, 1);
    let gait = p.gait || 'stand';
    let phase = p.stepPhase || 0;

    /* The airborne half of a bound. player.js decides the gait from contact,
       so while a lope is in the air it reports FLIGHT, correctly: the boots
       really have left the ground. Freezing the legs on the last contact frame
       would make the stride stutter twice a second, so the phase is carried on
       here for as long as a bound's flight can plausibly last. Anything longer
       than that, or anything with the pack lit, is a real flight. */
    if (gait === 'lope') {
      lopePhase = phase; lopeSpeed = speed; lopeHold = 0.55;
    } else if (gait === 'flight' && lopeHold > 0 && !p.jetOn) {
      lopeHold -= dt;
      lopePhase += dt * lopeSpeed / (1.15 + 0.42 * lopeSpeed);
      lopePhase -= Math.floor(lopePhase);
      phase = lopePhase;
      gait = 'lope';
    } else {
      lopeHold = 0;
    }

    fallT = gait === 'fallen' ? Math.min(fallT + dt, 2.6) : 0;

    /* --- what the gait asks for ------------------------------------------ */
    for (let i = 0; i < KEYS.length; i++) tgt[KEYS[i]] = 0;

    downW = 0;
    if (gait === 'walk') poseWalk(tgt, phase, speed);
    else if (gait === 'lope') poseLope(tgt, phase, speed);
    else if (gait === 'flight' || gait === 'jet')
      poseFlight(tgt, speed, gait === 'jet' || !!p.jetOn);
    else if (gait === 'fallen') {
      /* Getting up in a suit takes seconds, and the 2.6 s here is the same
         2.6 s player.js holds the controls away from you for. Prone, then a
         crouch, then upright, each layered over the standing pose beneath. */
      poseStand(tgt);
      downW = 1 - smooth(0.65, 1.75, fallT);
      blendKey(tgt, CROUCH, 1 - smooth(1.75, 2.60, fallT));
      blendKey(tgt, DOWN, downW);
    } else poseStand(tgt);

    if (gait !== 'fallen') {
      /* The forward bias. Suit and pack together are PLAYER.suitMass, 55 kg,
         most of it behind the shoulder blades, and none of it stopped being
         massive on the way here. The crews walked leaning into that, and so
         does this. */
      tgt.bodyPitch += 0.02 + 0.05 * clamp(speed / 3.6, 0, 1);
      /* Breathing. A hard torso cannot show it, so it goes where a suit really
         does show it, in the shoulders and the set of the head. */
      const br = Math.sin(time * (1.05 + 1.75 * ex) * TAU) * (0.004 + 0.010 * ex);
      tgt.spinePitch -= br;
      tgt.shAbdL += br * 1.2; tgt.shAbdR += br * 1.2;
    }

    /* --- blend ------------------------------------------------------------ */
    /* One time constant for everything. At 0.10 s a gait change settles in
       about three tenths of a second and a stride of the better part of a
       second loses almost none of its amplitude. */
    const k = 1 - Math.exp(-dt / 0.10);
    for (let i = 0; i < KEYS.length; i++) {
      const key = KEYS[i];
      cur[key] += (tgt[key] - cur[key]) * k;
    }

    /* --- keep the boots on the ground ------------------------------------- */
    /* The group's origin is between the boots, so any bend at hip, knee or
       ankle would otherwise leave the figure hovering or buried. Whichever
       boot reaches lowest is the one standing on the ground, and the body
       drops to meet it. That is where the rise and fall of a walk comes from
       here: it is a consequence of the leg angles rather than a bob added on
       top of them.

       It fades out in the air, where there is no ground to stand on, and is
       switched off while down, where the keyframes place the body instead. */
    const dL = soleBelowHip(cur.hipL, cur.kneeL, cur.ankleL, cur.bodyPitch);
    const dR = soleBelowHip(cur.hipR, cur.kneeR, cur.ankleR, cur.bodyPitch);
    /* While the chest is on the ground there is no boot to stand on, so the
       planting fades out with the prone keyframe and comes back as the figure
       gets its feet underneath itself. */
    const want = gait === 'fallen' ? 1 - downW : p.grounded === false ? 0 : 1;
    plant += (want - plant) * Math.min(1, dt / 0.18);
    const drop = Math.max(dL, dR) - (HIP_Y * Math.cos(cur.bodyPitch) - SOLE_Y0);

    /* --- apply ------------------------------------------------------------ */
    body.position.y = cur.bodyY + plant * drop;
    body.position.z = cur.bodyZ;
    body.rotation.x = -cur.bodyPitch;
    body.rotation.z = cur.bodyRoll;

    hips.rotation.y = cur.hipsYaw;
    hips.rotation.z = cur.hipsRoll;

    spine.rotation.x = -cur.spinePitch;
    spine.rotation.y = cur.spineYaw;
    spine.rotation.z = cur.spineRoll;

    L.leg.rotation.x = cur.hipL;  L.leg.rotation.z = -cur.abdL;
    R.leg.rotation.x = cur.hipR;  R.leg.rotation.z = cur.abdR;
    L.shin.rotation.x = -cur.kneeL;
    R.shin.rotation.x = -cur.kneeR;
    L.foot.rotation.x = cur.ankleL;
    R.foot.rotation.x = cur.ankleR;

    L.arm.rotation.x = cur.shPitchL; L.arm.rotation.z = -cur.shAbdL;
    R.arm.rotation.x = cur.shPitchR; R.arm.rotation.z = cur.shAbdR;
    L.fore.rotation.x = cur.elbowL;
    R.fore.rotation.x = cur.elbowR;

    helmet.rotation.x = -cur.neckPitch;

    /* --- lights and visor -------------------------------------------------- */
    if (lampLevel !== lampWant) {
      lampLevel += (lampWant - lampLevel) * Math.min(1, dt / 0.09);
      if (Math.abs(lampWant - lampLevel) < 0.002) lampLevel = lampWant;
      glow();
    }
    if (visorAngle !== visorWant) {
      visorAngle += (visorWant - visorAngle) * Math.min(1, dt / 0.30);
      if (Math.abs(visorWant - visorAngle) < 0.002) visorAngle = visorWant;
      visorNode.rotation.x = visorAngle;
    }
  }

  /* The lamp lenses, and the chest display's backlight with them. The display
     keeps a standby glow whatever the lamps are doing, because a suit that has
     turned its own instrumentation off is a suit in trouble. */
  function glow() {
    mats[M_LAMP].emissiveIntensity = lampLevel * 2.6;
    mats[M_SCREEN].emissiveIntensity = 0.30 + 0.60 * lampLevel;
  }

  /** Turn the helmet lamps on or off. The SpotLights themselves belong to the
      caller and hang off lampAnchor; this is only the visible hardware. */
  function setHelmetLights(on) {
    lampWant = on ? 1 : 0;
  }

  /** setVisor(true) lowers the gold visor, setVisor(false) raises it. Down is
      the default and is what anyone would be wearing in sunlight; up is for
      shadow, and for a first person camera that should not be looking out
      through gold. */
  function setVisor(down) {
    visorWant = down === false ? VISOR_UP : 0;
  }

  function dispose() {
    group.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
    for (let i = 0; i < mats.length; i++) if (mats[i]) mats[i].dispose();
    if (group.parent) group.parent.remove(group);
  }

  visorNode.rotation.x = visorAngle;
  glow();
  /* Settle before handing the figure over. The blend starts from zero, so
     without this the first frame drawn is an unposed rest figure with its arms
     hanging and its legs locked, which is not a posture this suit has. */
  const settle = { gait: 'stand', speed: 0, stepPhase: 0, grounded: true, dt: 0.4 };
  for (let i = 0; i < 5; i++) animate(settle);
  time = 0;

  return { group, animate, setHelmetLights, setVisor, dispose, head, lampAnchor,
           materials: mats, triangles };
}
