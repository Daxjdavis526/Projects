/* =============================================================================
   ROVER — the machine that turns into a room
   -----------------------------------------------------------------------------
   No vehicle like this exists. It is invented for SELENE, and the honest way to
   read this file is as a design argument rather than as a datasheet. What
   follows is why it has the shape it has.

   The problem it exists to solve is that a pressure suit is a miserable place
   to spend a week. Apollo drove an open buggy for three hours at a stretch and
   the crews came back tired and coated in dust that never came off. Every
   serious study since has split the difference the same way and then stopped
   halfway: NASA's Space Exploration Vehicle carries a small pressurised cabin
   so the crew can get out of the suit, and the Lunar Terrain Vehicle keeps the
   open buggy because it is lighter, simpler and far quicker to get off. This
   rover refuses to choose. It is an open buggy that closes.

   The transformation is the whole design, and everything else is arranged
   around making it mechanically possible.

   A rigid canopy has to go somewhere when it is open, and a vehicle this size
   has nowhere to put a 2.2 metre dome. The answer used here is the one used by
   telescopic swimming pool enclosures and by retractable stadium roofs: three
   concentric shells, all struck about the same centre of curvature, that nest
   inside one another and run on curved tracks. Because they share a centre they
   slide through each other's shadow without ever touching, and because they run
   on tracks the centre itself does not have to exist as a shaft. That matters
   here, because the centre of curvature falls at about seat height between the
   two crew, which is the one place in the vehicle a bearing cannot go.

   The tracks have to be carried by something, so each side of the cabin has a
   structural arch: a tube boom with a machined web plate hanging inboard of it,
   the plate carrying three grooves at the three shell radii. The arch is
   permanent. That is not a compromise, it is the point. It gives the vehicle
   rollover protection it would want anyway, it carries the forward floodlights
   and the hand rails, and it means the open configuration is a proper caged
   buggy rather than a bare platform with a lump on the back.

   Below the arches the sides are open in the open configuration. Two panels a
   side hang outboard and down, where they double as the flank guards and carry
   the boarding steps. Each swings a hundred and eighty degrees up on a plain
   piano hinge at the waist rail, driven by a ball screw in the sill, and stands
   vertical between the waist rail and the underside of the arch web. Their top
   edges are struck on the same centre as the shells, so a panel closes against
   a fixed lip on the web rather than against another moving part.

   Sealing is done in the order a real pressure door does it. The shells run
   forward and land on a bead along the cowl, the side panels come up and land
   on beads in the sill and along the web, and only then do twelve rotating dogs
   swing across and pull everything down onto the beads. Nothing is sealed by
   the drive mechanism, which is the standard rule: a screw or a rack holds
   position, a dog holds pressure.

   What is grounded in real hardware and what is not:

   Grounded. The wheels are woven wire mesh with chevron treads over part of the
   circumference, which is what Apollo used and for the reason Apollo used it:
   an elastomer goes glassy somewhere around 200 K and the ground here reaches
   100 K at night, while a solid wheel has no compliance at all. The wheel is 1.04 m across against the LRV's 0.82 m, carrying
   about twice the LRV's per wheel load. Motors sit in the hubs behind harmonic
   drives, again as on the LRV. All four wheels steer, counter phase at low
   speed for a tight turn and slightly in phase at speed so the vehicle can crab
   across a slope. Ground clearance is 0.55 m against the LRV's 0.36 to 0.43 m.
   The suspension is a double wishbone with 0.42 m of travel and springs stiff
   enough that at one sixth g the whole 1450 kg vehicle settles them by only
   about 13 mm, which is why the authored pose here is also the static pose.

   Invented. The pressurisable canopy, the whole nesting mechanism, and the
   cabin fit out. The consumable load in config.js is chosen to give a few days
   of habitation and is not derived from a closed mass budget. The radiator
   panel is sized by eye; a vehicle driving in full sun with a crew inside would
   want several square metres of radiator or a water sublimator, and the honest
   position is that this one is a token.

   Frame convention, as everywhere else in SELENE: +Y up, +X east, +Z south,
   origin on the ground on the centreline midway between the axles. The vehicle
   faces -Z, which is north at zero yaw and matches both the player's heading
   convention and the direction a three.js camera looks, so a camera parented to
   the interior anchor needs no correction. Left means -X.
   ========================================================================== */

import * as THREE from 'three';
import { ROVER } from '../config.js';

const DEG = Math.PI / 180;

/* --- principal dimensions --------------------------------------------------
   The running gear numbers come straight from config.js so that the contact
   patch the physics integrates and the tyre the player sees are in the same
   place. Everything else is authored here. */
const WHEELBASE = ROVER.wheelBase;      // 3.10 m, axle to axle
const TRACK     = ROVER.track;          // 2.40 m, centre to centre
const WHEEL_R   = ROVER.wheelRadius;    // 0.52 m
const WHEEL_W   = 0.28;                 // m, a little wider in proportion than the LRV
const TRAVEL    = ROVER.suspTravel;     // 0.42 m, bump stop to bump stop
const Z_AXLE    = WHEELBASE / 2;        // front axle at -Z_AXLE, rear at +Z_AXLE

/* Lateral stack on the right hand side, in metres from the centreline. The left
   is an exact mirror. These are listed together because the clearances between
   them are the whole reason the mechanism does not intersect itself. */
const X_CABIN   = 0.840;   // inboard face of the cabin skin
const X_SHELL   = 0.870;   // outboard edge of a canopy shell
const X_SKIN    = 0.900;   // outer body skin below the waist
const X_JACK    = 0.945;   // ball screws, in the open sill channel
const X_PANEL   = 1.000;   // hinge line of a rising side panel
const X_WEB     = 1.040;   // arch web plate
const X_ARCH    = 1.105;   // centreline of the roll arch tube
const X_LEG     = 0.995;   // arch legs, ducked inboard to clear the tyres
const R_ARCHTUBE = 0.055;
const X_FENDER0 = 1.045, X_FENDER1 = 1.345;

/* The rising panels sweep a half disc outboard of their hinge, so nothing at
   all may sit between X_PANEL and the tyre over the length of the door. That
   single constraint fixes most of the numbers above: the tub skin and its sill
   channel end inboard of the hinge, the arch legs duck inboard of the tyres,
   and the wheel arches are carried on the suspension rather than on the body. */

/* Heights. */
const Y_DECK = 0.70;   // top of the floor pan
const Y_SILL = 1.50;   // waist rail, hip high to a crew member standing outside
const Y_HINGE = 1.53;  // panel hinge line, proud of the rail so the crank clears it
const Y_SEAT = 1.10;   // seat pan
const Y_EYE  = 1.88;   // seated eye height in a suit

/* The canopy's centre of curvature, and the radii struck about it. The centre
   sits between the crew at about seat height, which is exactly why the shells
   run on tracks instead of on a shaft. */
const C_Y = 1.0265, C_Z = 0.2650;
const R_SHELL = [1.24, 1.30, 1.36];    // inner, middle, outer
const R_WEB_IN = 1.18, R_WEB_OUT = 1.40;
const R_ARCH_C = 1.44;                 // arch tube centreline radius

/* Angles are measured at the centre of curvature from straight up, positive
   forwards. Each shell subtends fifty degrees, and consecutive shells overlap
   by six of those so there is something for a lip seal to bear on. The inner
   shell travels exactly twice as far as the middle one, which is what lets a
   single drive per side run both through a two to one reeving. */
const SHELL_HALF  = 25 * DEG;
/* The ray the innermost shell's leading rib lands on, which is where the cowl,
   its seal bead and the four dogs all have to be. */
const PHI_LATCH   = 75 * DEG;
const PHI_STOW    = -38 * DEG;
const PHI_OPEN    = [50 * DEG, 6 * DEG, -38 * DEG];
const PHI_ARCH_0  = -70 * DEG, PHI_ARCH_1 = 80 * DEG;
const PHI_WEB_0   = -66 * DEG, PHI_WEB_1  = 78 * DEG;

/* The door aperture. Its ends are set by where the arch web is still high
   enough above the waist rail to be worth glazing, and its rear end by where
   the rear wheel starts. */
const Z_DOOR_0 = -0.80, Z_DOOR_1 = 0.95;

const MAX_STEER = 32 * DEG;

/* --- quality ---------------------------------------------------------------
   Segment counts and the optional detail. The vehicle is drawn alongside a
   streaming planetary surface, so nothing here is allowed to be generous. */
const TIER = {
  performance: { wheel: 14, spokes: 8,  chev: 6,  tube: 5, shell: 10, ring: 10,
                 dish: 10, springs: false, greebles: false, screens: 1 },
  balanced:    { wheel: 18, spokes: 10, chev: 8,  tube: 6, shell: 13, ring: 12,
                 dish: 12, springs: false, greebles: false, screens: 3 },
  high:        { wheel: 24, spokes: 12, chev: 10, tube: 8, shell: 16, ring: 16,
                 dish: 16, springs: true,  greebles: true,  screens: 5 },
  ultra:       { wheel: 30, spokes: 16, chev: 14, tube: 9, shell: 20, ring: 20,
                 dish: 20, springs: true,  greebles: true,  screens: 5 },
};

/* --- procedural textures ---------------------------------------------------
   Everything is drawn into a canvas at build time. No image files, because the
   page has no build step and a rover that waits on a network fetch to look
   right is a rover that pops. In a headless import there is no document, and
   every one of these returns null; the materials are written to work without
   their maps. */
function canvas2d(w, h) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/** The wire mesh of the tyre, as an alpha cutout. Cheaper and far better
    looking than modelling woven wire, and it casts a wire shadow for free
    because the depth pass honours alphaTest. */
function texWireMesh() {
  const c = canvas2d(128, 128);
  if (!c) return null;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'square';
  for (let i = -4; i <= 8; i++) {
    g.beginPath(); g.moveTo(i * 32, -8); g.lineTo(i * 32 + 136, 136); g.stroke();
    g.beginPath(); g.moveTo(i * 32, 136); g.lineTo(i * 32 + 136, -8); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(26, 3);
  return t;
}

/** Diamond grip plate, for the floor, the steps and the deck. */
function texGrip() {
  const c = canvas2d(64, 64);
  if (!c) return null;
  const g = c.getContext('2d');
  g.fillStyle = '#5a5d61'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#8b8f94';
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
    g.save(); g.translate(16 + x * 32, 16 + y * 32); g.rotate(Math.PI / 4);
    g.fillRect(-9, -4, 18, 8); g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** One instrument screen. Three layouts, drawn flat and emissive: a moving map,
    a systems synoptic, and a consumables bar stack. */
function texScreen(kind) {
  const c = canvas2d(256, 160);
  if (!c) return null;
  const g = c.getContext('2d');
  g.fillStyle = '#04070a'; g.fillRect(0, 0, 256, 160);
  if (kind === 0) {
    g.strokeStyle = '#1d5f4a'; g.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 160); g.stroke();
      g.beginPath(); g.moveTo(0, i * 22); g.lineTo(256, i * 22); g.stroke();
    }
    g.strokeStyle = '#7fe0b0'; g.lineWidth = 2;
    g.beginPath();
    g.moveTo(20, 130); g.bezierCurveTo(90, 120, 110, 60, 190, 46); g.stroke();
    g.fillStyle = '#ffd27f';
    g.beginPath(); g.moveTo(128, 74); g.lineTo(120, 92); g.lineTo(136, 92); g.fill();
  } else if (kind === 1) {
    g.strokeStyle = '#2a4f6e'; g.lineWidth = 2;
    g.strokeRect(14, 14, 110, 60); g.strokeRect(134, 14, 108, 60);
    g.strokeRect(14, 88, 228, 58);
    g.fillStyle = '#9fd2ff'; g.font = '13px monospace';
    g.fillText('BUS A  118V', 22, 40); g.fillText('BUS B  117V', 142, 40);
    g.fillText('DRIVE  4/4  OK', 22, 116);
    g.fillStyle = '#ffb454'; g.fillText('CANOPY  SEAL  ARMED', 22, 138);
  } else {
    const bars = ['O2', 'CO2', 'H2O', 'PWR', 'N2'];
    const fill = [0.86, 0.34, 0.72, 0.61, 0.93];
    g.font = '12px monospace';
    for (let i = 0; i < bars.length; i++) {
      const y = 16 + i * 28;
      g.fillStyle = '#5f7386'; g.fillText(bars[i], 12, y + 13);
      g.fillStyle = '#101820'; g.fillRect(56, y, 186, 16);
      g.fillStyle = fill[i] < 0.4 ? '#ff8a5c' : '#7fe0b0';
      g.fillRect(56, y, 186 * fill[i], 16);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* --- materials -------------------------------------------------------------
   One directional sun, no ambient, very dark shadows. Under that light a
   surface has exactly one chance to read, so the albedos are chosen wide apart
   and the metals are kept rough enough to catch something off the ground.
   MeshStandardMaterial throughout. */
function makeMaterials(q) {
  const wire = texWireMesh();
  const grip = texGrip();
  const M = {
    /* Structure. Dark grey anodised aluminium: dark enough that the gold and
       the white read as accents rather than as noise. */
    struct: new THREE.MeshStandardMaterial({ color: 0x3c4045, roughness: 0.74, metalness: 0.20 }),
    /* Bare machined joints, pins, arms and rails. */
    metal: new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.34, metalness: 0.95 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.85, metalness: 0.10 }),
    /* Multi layer insulation. Real MLI is aluminised Kapton and it is that
       colour because the polyimide is amber, not because anyone chose gold. */
    mli: new THREE.MeshStandardMaterial({ color: 0xd6a63a, roughness: 0.28, metalness: 0.90 }),
    /* Radiator. White paint with a high infrared emittance is the standard
       trick; it is the brightest thing on the vehicle. */
    white: new THREE.MeshStandardMaterial({ color: 0xe9e7e1, roughness: 0.52, metalness: 0.04 }),
    /* Smoked canopy. Low roughness so it reads as glass under a hard source,
       low opacity so the interior survives, and it does not cast a shadow
       because an alpha blended surface in the depth pass would cast a solid
       black one. */
    glass: new THREE.MeshStandardMaterial({
      color: 0x1d242b, roughness: 0.045, metalness: 0.0,
      transparent: true, opacity: 0.30, side: THREE.DoubleSide,
    }),
    /* The tyre, cut out to a wire weave. */
    tyre: new THREE.MeshStandardMaterial({
      color: 0x8e9298, roughness: 0.55, metalness: 0.80,
      alphaMap: wire, alphaTest: 0.5, side: THREE.DoubleSide,
    }),
    tread: new THREE.MeshStandardMaterial({ color: 0x7b7f84, roughness: 0.62, metalness: 0.85 }),
    seat: new THREE.MeshStandardMaterial({ color: 0x2b3138, roughness: 0.92, metalness: 0.0 }),
    /* Zero thickness sheets: the arch web, its tracks, the console face and the
       dish. They need two sides, and they are separate instances so that asking
       for that does not turn the whole vehicle inside out. */
    sheet: new THREE.MeshStandardMaterial({ color: 0x3c4045, roughness: 0.74,
      metalness: 0.20, side: THREE.DoubleSide }),
    sheetMetal: new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.34,
      metalness: 0.95, side: THREE.DoubleSide }),
    sheetWhite: new THREE.MeshStandardMaterial({ color: 0xe9e7e1, roughness: 0.52,
      metalness: 0.04, side: THREE.DoubleSide }),
    /* The grip plate is white so the drawn pattern comes through unchanged;
       without a canvas to draw on there is no pattern, so it falls back to the
       colour the pattern averages to. */
    grip: new THREE.MeshStandardMaterial({ color: grip ? 0xffffff : 0x6f7378,
      map: grip, roughness: 0.80, metalness: 0.35 }),
    /* Lamps. Black when off, blinding when on; setLights drives the intensity. */
    lampWhite: new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0xfff2dc,
      roughness: 0.25, metalness: 0.1, emissiveIntensity: 0 }),
    lampRed: new THREE.MeshStandardMaterial({ color: 0x140505, emissive: 0xff4422,
      roughness: 0.3, metalness: 0.1, emissiveIntensity: 0 }),
    lampCabin: new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0xbfd4ff,
      roughness: 0.4, metalness: 0.0, emissiveIntensity: 0 }),
    /* Screens are pure emission: with no ambient light a lit panel that also
       had a diffuse colour would look like a grey card in shadow. */
    screen: [],
  };
  for (let i = 0; i < 3; i++) {
    const tex = texScreen(i);
    M.screen.push(new THREE.MeshStandardMaterial({
      color: 0x000000, emissive: 0xffffff, emissiveMap: tex,
      emissiveIntensity: 1.4, roughness: 1.0, metalness: 0.0,
    }));
    if (!tex) M.screen[i].emissive.setHex(0x16303f);
  }
  M._textures = [wire, grip];
  return M;
}

/* --- small builders --------------------------------------------------------
   Unit primitives are shared and the meshes are scaled, which costs nothing at
   draw time and keeps the geometry count down to a handful. */
function unitBox(ctx) {
  return ctx.u.box || (ctx.u.box = new THREE.BoxGeometry(1, 1, 1));
}
function unitCyl(ctx, seg) {
  const k = 'c' + seg;
  return ctx.u[k] || (ctx.u[k] = new THREE.CylinderGeometry(0.5, 0.5, 1, seg));
}
function unitSphere(ctx, seg) {
  const k = 's' + seg;
  return ctx.u[k] || (ctx.u[k] = new THREE.SphereGeometry(0.5, seg, Math.max(4, seg >> 1)));
}
function box(ctx, parent, mat, w, h, d, x, y, z) {
  const m = new THREE.Mesh(unitBox(ctx), mat);
  m.scale.set(w, h, d); m.position.set(x, y, z);
  parent.add(m); return m;
}
function cyl(ctx, parent, mat, r, h, x, y, z, seg) {
  const m = new THREE.Mesh(unitCyl(ctx, seg || ctx.q.tube), mat);
  m.scale.set(r * 2, h, r * 2); m.position.set(x, y, z);
  parent.add(m); return m;
}
/** A tube lying along X, which is what almost every cross member here is. */
function xTube(ctx, parent, mat, r, len, x, y, z, seg) {
  const m = cyl(ctx, parent, mat, r, len, x, y, z, seg);
  m.rotation.z = Math.PI / 2; return m;
}
/** A tube lying along Z. */
function zTube(ctx, parent, mat, r, len, x, y, z, seg) {
  const m = cyl(ctx, parent, mat, r, len, x, y, z, seg);
  m.rotation.x = Math.PI / 2; return m;
}

/* Where a point at angle phi on radius R sits in the vehicle frame. Used often
   enough at build time to be worth naming; nothing calls it per frame. */
function arcY(R, phi) { return C_Y + R * Math.cos(phi); }
function arcZ(R, phi) { return C_Z - R * Math.sin(phi); }

/**
 * A strip of cylinder whose axis lies along X: the shape of every canopy shell,
 * every track groove and the wheel arches. Built centred on its own arc so the
 * caller can hang it off a pivot and rotate it.
 *
 * three.js lays a cylinder out with its axis on Y and theta starting at +Z.
 * Rotating the geometry a quarter turn about Z puts the axis on X and leaves
 * the circular coordinate as Y = R sin(theta), Z = R cos(theta), so an angle
 * measured from up towards the front is theta = 90 degrees + phi.
 */
function arcStrip(R, halfArc, width, segs) {
  const g = new THREE.CylinderGeometry(R, R, width, segs, 1, true,
                                       Math.PI / 2 - halfArc, halfArc * 2);
  g.rotateZ(Math.PI / 2);
  return g;
}

/** A flat sector in the plane x = const, struck about the canopy centre. */
function arcPlate(rIn, rOut, phi0, phi1, segs) {
  const g = new THREE.RingGeometry(rIn, rOut, segs, 1,
                                   Math.PI / 2 - phi1, phi1 - phi0);
  g.rotateY(Math.PI / 2);
  g.translate(0, C_Y, C_Z);
  return g;
}

/* --- wheels and suspension -------------------------------------------------
   A wire mesh wheel is a rim, an inner load ring, radial spokes and a chevron
   tread over part of the circumference. Apollo's wheels were exactly that, and
   for the reason that still applies: a gas filled tyre cannot hold pressure at
   100 K, and a solid one transmits every rock straight into the frame.

   The hub carries the motor, because a wheel motor behind a harmonic drive is
   the only arrangement that gives a rover four independent traction sources
   without a driveshaft crossing the pressure hull.
*/
function buildWheel(ctx, index) {
  const M = ctx.M, q = ctx.q;
  const hub = new THREE.Object3D();
  hub.name = 'wheel.' + index;

  /* Rim and inner ring: two thin bands the mesh is stretched between. */
  const rimGeo = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.035, q.wheel, 1, true);
  rimGeo.rotateZ(Math.PI / 2);
  for (const s of [-1, 1]) {
    const rim = new THREE.Mesh(rimGeo, M.metal);
    rim.position.x = s * WHEEL_W * 0.5;
    hub.add(rim);
  }
  ctx.geo.push(rimGeo);

  /* The mesh itself: one open cylinder, cut out to a weave. */
  const meshGeo = new THREE.CylinderGeometry(WHEEL_R * 0.985, WHEEL_R * 0.985,
                                             WHEEL_W, q.wheel, 1, true);
  meshGeo.rotateZ(Math.PI / 2);
  const tyre = new THREE.Mesh(meshGeo, M.tyre);
  tyre.name = 'tyre.' + index;
  hub.add(tyre);
  ctx.geo.push(meshGeo);

  /* Chevron treads. Apollo covered about half the circumference, on the
     argument that full coverage buys traction the soil cannot deliver and
     costs mass and dust pickup on every revolution. */
  const chevGeo = new THREE.BoxGeometry(WHEEL_W * 0.42, 0.030, 0.075);
  const chev = new THREE.InstancedMesh(chevGeo, M.tread, q.chev * 2);
  const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion();
  const pos = new THREE.Vector3(), scl = new THREE.Vector3(1, 1, 1);
  const eu = new THREE.Euler();
  for (let i = 0; i < q.chev; i++) {
    /* Two rows in a shallow V, which is what makes a chevron a chevron: it
       sheds soil sideways instead of packing it under the wheel. */
    const a = (i / q.chev) * Math.PI * 2;
    for (let s = 0; s < 2; s++) {
      const sx = s ? 1 : -1;
      /* The placement puts z at -sin(a), so the tilt has to be -a as well or
         the tread ends up pointing off the rim instead of along it. */
      eu.set(-(a + sx * 0.10), 0, 0);
      qt.setFromEuler(eu);
      pos.set(sx * WHEEL_W * 0.24,
              Math.cos(a) * (WHEEL_R + 0.012),
              -Math.sin(a) * (WHEEL_R + 0.012));
      m4.compose(pos, qt, scl);
      chev.setMatrixAt(i * 2 + s, m4);
    }
  }
  chev.instanceMatrix.needsUpdate = true;
  hub.add(chev);
  ctx.geo.push(chevGeo);

  /* Spokes, from the hub barrel out to the rim, splayed into two cones so the
     wheel resists side load as well as radial load. */
  const spokeGeo = new THREE.BoxGeometry(0.014, WHEEL_R - 0.13, 0.020);
  const spokes = new THREE.InstancedMesh(spokeGeo, M.metal, q.spokes * 2);
  for (let i = 0; i < q.spokes; i++) {
    const a = (i / q.spokes) * Math.PI * 2;
    for (let s = 0; s < 2; s++) {
      const sx = s ? 1 : -1;
      eu.set(-a, 0, sx * 0.16);
      qt.setFromEuler(eu);
      pos.set(sx * WHEEL_W * 0.20,
              Math.cos(a) * (WHEEL_R * 0.5 + 0.06),
              -Math.sin(a) * (WHEEL_R * 0.5 + 0.06));
      m4.compose(pos, qt, scl);
      spokes.setMatrixAt(i * 2 + s, m4);
    }
  }
  spokes.instanceMatrix.needsUpdate = true;
  hub.add(spokes);
  ctx.geo.push(spokeGeo);

  /* Hub barrel, motor housing and brake disc. */
  xTube(ctx, hub, M.struct, 0.135, WHEEL_W * 0.86, 0, 0, 0, q.tube + 2);
  xTube(ctx, hub, M.metal, 0.105, WHEEL_W * 1.02, 0, 0, 0, q.tube + 2);
  const disc = xTube(ctx, hub, M.dark, 0.175, 0.016, -WHEEL_W * 0.42, 0, 0, q.wheel);
  disc.name = 'brake.' + index;

  return { hub, tyre };
}

/**
 * One corner. A double wishbone, a coil over, an upright and the wheel.
 *
 * The arms are laid out so the wheel sits at its authored height with the lower
 * arm about seven degrees below horizontal, which puts the whole 0.42 m of
 * travel either side of a shallow arc and keeps the scrub down to a few
 * centimetres. At one sixth g a 1450 kg vehicle deflects 46 kN/m springs by
 * only about 13 mm, so the authored pose is also very nearly the static one and
 * the caller does not have to hunt for a ride height.
 */
function buildCorner(ctx, index, side, zAxle, front) {
  const M = ctx.M, q = ctx.q;
  const root = new THREE.Object3D();     // fixed to the chassis
  root.name = 'corner.' + index;

  /* Arm lengths and rest angles are chosen; the inboard pivots then follow from
     the track, so moving the track in config.js moves the whole corner with it
     instead of leaving the wheel hanging off the end of an arm. The upper ball
     joint is set 113 mm inboard of the lower one, which is where the kingpin
     inclination comes from. */
  const LOW_L = 0.780, LOW_PY = 0.620, LOW_A0 = -7.4 * DEG;
  const UPP_L = 0.620, UPP_PY = 0.980, UPP_A0 = -6.0 * DEG;
  const LOW_PX = TRACK / 2 - LOW_L * Math.cos(LOW_A0);
  const UPP_PX = TRACK / 2 - 0.113 - UPP_L * Math.cos(UPP_A0);

  /* The arms. Each is a wishbone: two legs meeting at the upright, so it is
     drawn as two slim boxes splayed fore and aft of the axle line. */
  function wishbone(len, px, py, a0, thick) {
    const pivot = new THREE.Object3D();
    pivot.position.set(side * px, py, zAxle);
    pivot.rotation.z = side * a0;
    for (const s of [-1, 1]) {
      const leg = box(ctx, pivot, M.metal, len, thick, thick,
                      side * len * 0.5, 0, s * 0.16);
      leg.rotation.y = -side * s * 0.20;
    }
    box(ctx, pivot, M.metal, 0.06, thick * 1.6, 0.40, side * len, 0, 0);
    root.add(pivot);
    return pivot;
  }
  const lower = wishbone(LOW_L, LOW_PX, LOW_PY, LOW_A0, 0.055);
  const upper = wishbone(UPP_L, UPP_PX, UPP_PY, UPP_A0, 0.042);

  /* The travelling part: everything outboard of the ball joints. */
  const susp = new THREE.Object3D();
  susp.name = 'susp.' + index;
  const restX = side * (LOW_PX + LOW_L * Math.cos(LOW_A0));
  const restY = LOW_PY + LOW_L * Math.sin(LOW_A0);
  susp.position.set(restX, restY, zAxle);
  root.add(susp);

  /* Wheel arch, carried on the suspension instead of on the body. A fender
     bolted to the frame has to be struck at the bump stop, which over 0.42 m of
     travel is an arch a metre across; carried on the upright it can sit 80 mm
     off the tyre and stay there through the whole stroke. Rally cars do this
     for the same reason. */
  if (!ctx.u.fender) {
    const fg = new THREE.CylinderGeometry(0.60, 0.60, X_FENDER1 - X_FENDER0,
                                          q.ring, 1, true,
                                          Math.PI / 2 - 42 * DEG, 84 * DEG);
    fg.rotateZ(Math.PI / 2);
    ctx.u.fender = fg;
  }
  const fender = new THREE.Mesh(ctx.u.fender, M.struct);
  fender.position.x = side * ((X_FENDER0 + X_FENDER1) / 2 - TRACK / 2);
  susp.add(fender);
  ctx.dustyMesh.push(fender);
  /* The mud flap. Regolith thrown by a wheel follows a clean ballistic arc and
     lands a very long way away, so what the flap is really protecting is the
     radiator and the seals, not the paint. */
  const flap = box(ctx, susp, M.struct, X_FENDER1 - X_FENDER0, 0.26, 0.025,
                   fender.position.x, 0.30, front ? -0.44 : 0.44);
  ctx.dustyMesh.push(flap);

  /* Upright, then the steering knuckle above it. All four wheels steer, so
     every corner carries the same hardware. */
  box(ctx, susp, M.struct, 0.075, 0.46, 0.13, side * -0.02, 0.19, 0);
  const steer = new THREE.Object3D();
  steer.name = 'steer.' + index;
  susp.add(steer);
  cyl(ctx, steer, M.metal, 0.05, 0.30, side * -0.02, 0.16, 0, q.tube);

  const wheel = buildWheel(ctx, index);
  steer.add(wheel.hub);
  /* A short track rod, so the steering reads as linkage rather than as magic. */
  box(ctx, steer, M.metal, 0.30, 0.035, 0.035, side * -0.17, 0.10, front ? -0.16 : 0.16);

  /* Coil over. The barrel is fixed length and the rod slides, because a damper
     that stretched as a whole would be the one obviously fake part of the
     corner. The spring is a real helix and it is scaled along its axis, which
     is what a spring actually does. */
  const damper = new THREE.Object3D();
  damper.position.set(side * 0.30, 1.06, zAxle);
  root.add(damper);
  cyl(ctx, damper, M.dark, 0.052, 0.30, 0, 0.16, 0, q.tube);
  const rod = cyl(ctx, damper, M.metal, 0.020, 1.0, 0, 0.5, 0, q.tube);
  let spring = null;
  if (q.springs) {
    const pts = [];
    const turns = 7, n = 48;
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = t * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.058, t, Math.sin(a) * 0.058));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const sgeo = new THREE.TubeGeometry(curve, n, 0.011, 3, false);
    ctx.geo.push(sgeo);
    spring = new THREE.Mesh(sgeo, M.metal);
    damper.add(spring);
  } else {
    spring = cyl(ctx, damper, M.metal, 0.062, 1.0, 0, 0.5, 0, q.tube);
  }

  /* Where the damper's lower eye sits on the lower arm, as a fraction of the
     arm, and the geometry the animation needs. */
  const geom = {
    side, zAxle, front,
    lowL: LOW_L, lowPX: LOW_PX, lowPY: LOW_PY, lowA0: LOW_A0,
    uppL: UPP_L, uppA0: UPP_A0,
    damperFrac: 0.72, damperX: 0.30, damperY: 1.06,
    barrel: 0.30, springCentred: !q.springs,
  };
  return { root, susp, steer, hub: wheel.hub, tyre: wheel.tyre,
           lower, upper, damper, rod, spring, geom };
}

/* --- chassis and bodywork --------------------------------------------------
   A flat frame carrying a shallow tub. The tub is the pressure vessel below the
   waist and the frame is everything the running gear and the payload bolt to,
   which is the arrangement every expedition vehicle converges on because it
   lets the two be designed by different people.
*/
function buildChassis(ctx, root) {
  const M = ctx.M, q = ctx.q;

  /* Main rails and cross members. */
  for (const s of [-1, 1]) {
    box(ctx, root, M.struct, 0.09, 0.15, 3.95, s * 0.86, 0.625, 0.25);
  }
  for (const z of [-1.55, -0.90, 0.10, 1.05, 1.55, 2.00]) {
    box(ctx, root, M.struct, 1.80, 0.10, 0.09, 0, 0.625, z);
  }
  /* Floor pan and the grip plate the crew stand on. */
  box(ctx, root, M.struct, 1.76, 0.05, 2.55, 0, 0.685, 0.25);
  const floor = box(ctx, root, M.grip, 1.70, 0.015, 2.45, 0, 0.712, 0.25);
  floor.material = M.grip;

  /* Tub sides, from the floor up to the waist rail, and the waist rail itself.
     Above the rail the side is either open or filled by a rising panel. */
  for (const s of [-1, 1]) {
    box(ctx, root, M.struct, 0.04, Y_SILL - Y_DECK - 0.10, 2.90, s * X_SKIN, (Y_SILL + Y_DECK) / 2 - 0.05, 0.25);
    /* The waist rail is an open channel, not a closed box: the drive cranks on
       the panel hinges swing through where its outboard face would be. It stops
       short of the arch legs at either end. */
    box(ctx, root, M.metal, 0.135, 0.10, 2.60, s * X_SKIN, Y_SILL - 0.05, 0.25);
    /* Inboard skin, so the cabin does not show its own structure. */
    box(ctx, root, M.struct, 0.02, Y_SILL - Y_DECK - 0.10, 2.60, s * X_CABIN, (Y_SILL + Y_DECK) / 2 - 0.05, 0.25);
  }

  /* Front bulkhead and cowl. The cowl top is where the innermost canopy shell
     lands, so its height is not a style choice: it is the point at 75 degrees
     on the 1.24 m radius. */
  const cowlY = arcY(R_SHELL[0], PHI_OPEN[0] + SHELL_HALF);
  const cowlZ = arcZ(R_SHELL[0], PHI_OPEN[0] + SHELL_HALF);
  box(ctx, root, M.struct, 1.80, cowlY - Y_DECK, 0.07, 0, (cowlY + Y_DECK) / 2, cowlZ - 0.03);
  const cowl = box(ctx, root, M.metal, 1.86, 0.06, 0.16, 0, cowlY + 0.01, cowlZ + 0.03);
  cowl.name = 'cowl';

  /* Rear bulkhead, up to where the outermost shell lands. */
  const bhY = arcY(R_SHELL[2], PHI_STOW - SHELL_HALF);
  const bhZ = arcZ(R_SHELL[2], PHI_STOW - SHELL_HALF);
  box(ctx, root, M.struct, 1.80, bhY - Y_DECK, 0.07, 0, (bhY + Y_DECK) / 2, bhZ - 0.02);
  box(ctx, root, M.metal, 1.86, 0.06, 0.18, 0, bhY + 0.01, bhZ - 0.06);

  /* Front and rear sub frames, bumpers and tie down points. */
  box(ctx, root, M.struct, 1.60, 0.09, 0.80, 0, 0.645, -1.78);
  box(ctx, root, M.struct, 1.60, 0.09, 0.70, 0, 0.645, 1.95);
  for (const z of [-2.20, 2.20]) {
    xTube(ctx, root, M.metal, 0.045, 1.92, 0, 0.66, z, q.tube);
  }
  for (const s of [-1, 1]) {
    box(ctx, root, M.metal, 0.06, 0.20, 0.06, s * 0.80, 0.62, -2.18);
    box(ctx, root, M.metal, 0.06, 0.20, 0.06, s * 0.80, 0.62, 2.18);
  }
  return { cowlY, cowlZ, bhY, bhZ };
}

/* --- the arches ------------------------------------------------------------
   The permanent structure. A tube boom with a web plate hanging inboard, the
   plate carrying three grooves at the three shell radii. This is a built up
   beam of a common kind: the tube takes the bending, the web takes the track
   loads, and between them they are stiff enough to be the rollover structure
   as well.
*/
function buildArch(ctx, root, side) {
  const M = ctx.M, q = ctx.q;
  const arch = new THREE.Object3D();
  arch.name = 'arch.' + (side < 0 ? 'L' : 'R');

  /* The boom. Sampled along the arc and swept, because a curve this shallow
     drawn as straight segments reads as a polygon from inside the cabin. */
  const pts = [];
  const n = Math.max(10, q.ring);
  for (let i = 0; i <= n; i++) {
    const phi = PHI_ARCH_0 + (PHI_ARCH_1 - PHI_ARCH_0) * (i / n);
    /* Over the last eighteen degrees at each end the boom ducks inboard. Both
       feet land inside a wheel's bump envelope, and a cage that could not duck
       would have to put its feet outboard of the tyres, which would then be the
       widest thing on the vehicle. */
    const e = Math.min(1, Math.min(phi - PHI_ARCH_0, PHI_ARCH_1 - phi) / (18 * DEG));
    const x = X_LEG + (X_ARCH - X_LEG) * (e * e * (3 - 2 * e));
    pts.push(new THREE.Vector3(side * x, arcY(R_ARCH_C, phi), arcZ(R_ARCH_C, phi)));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tgeo = new THREE.TubeGeometry(curve, n, R_ARCHTUBE, Math.max(5, q.tube), false);
  ctx.geo.push(tgeo);
  arch.add(new THREE.Mesh(tgeo, M.struct));

  /* Legs down to the frame. The boom passes below the waist rail well forward
     of the door aperture and well aft of it, so the legs never stand in the
     way of a crew member climbing in. */
  /* The boom has already ducked inboard by the time it reaches the deck, so
     the legs simply drop from where it ends. */
  for (const f of [pts[pts.length - 1], pts[0]]) {
    cyl(ctx, arch, M.struct, 0.045, f.y - Y_DECK + 0.06,
        side * X_LEG, (f.y + Y_DECK) / 2, f.z, q.tube);
    box(ctx, arch, M.struct, 0.10, 0.05, 0.16, side * X_LEG, Y_DECK + 0.02, f.z);
  }

  /* The web plate and the three tracks. */
  const web = new THREE.Mesh(arcPlate(R_WEB_IN, R_WEB_OUT, PHI_WEB_0, PHI_WEB_1, q.ring * 2),
                             M.sheet);
  web.position.x = side * X_WEB;
  arch.add(web);
  /* The lip the rising panels seal against. It is on fixed structure, which is
     the whole reason the panels close upward onto the web instead of against
     the shells: a seal wants one moving face, not two. */
  const lip = new THREE.Mesh(
    arcPlate(R_WEB_IN - 0.012, R_WEB_IN + 0.012, PHI_WEB_0, PHI_WEB_1, q.ring * 2), M.sheetMetal);
  lip.position.x = side * (X_WEB - 0.022);
  arch.add(lip);
  ctx.geo.push(lip.geometry);
  ctx.geo.push(web.geometry);
  for (let k = 0; k < 3; k++) {
    const groove = new THREE.Mesh(
      arcPlate(R_SHELL[k] - 0.022, R_SHELL[k] + 0.022, PHI_WEB_0, PHI_WEB_1, q.ring * 2),
      M.sheetMetal);
    groove.position.x = side * (X_WEB - 0.012);
    arch.add(groove);
    ctx.geo.push(groove.geometry);
  }

  /* Hand rails on the outboard face. Every real spacecraft is covered in them
     and a suited crew member cannot do anything without one. */
  for (let i = 0; i < 3; i++) {
    const phi = (-40 + i * 40) * DEG;
    const r = R_ARCH_C + R_ARCHTUBE + 0.055;
    const h = cyl(ctx, arch, M.metal, 0.020, 0.34, side * (X_ARCH + 0.09),
                  arcY(r, phi), arcZ(r, phi), 5);
    h.rotation.x = Math.PI / 2 - phi;
  }
  root.add(arch);
  return arch;
}

/* --- the canopy ------------------------------------------------------------
   Three shells struck about the same centre. The outermost is fixed and forms
   the permanent rear roof; the other two nest inside it when open and fan
   forward to close. The inner shell travels exactly twice as far as the middle
   one, so both can be run from one drive per side through a two to one reeving,
   the same arrangement a telescopic mast uses.
*/
function buildCanopy(ctx, root) {
  const M = ctx.M, q = ctx.q;
  const shells = [];
  for (let k = 0; k < 3; k++) {
    const pivot = new THREE.Object3D();
    pivot.name = 'shell.' + k;
    pivot.position.set(0, C_Y, C_Z);
    root.add(pivot);

    const R = R_SHELL[k];
    const g = arcStrip(R, SHELL_HALF, X_SHELL * 2, q.shell);
    ctx.geo.push(g);
    const glass = new THREE.Mesh(g, M.glass);
    glass.castShadow = false;
    pivot.add(glass);

    /* Frame: an edge rib at each end, two intermediate ribs, and a side rail
       down each edge that runs in the groove. */
    for (const e of [-1, 1]) {
      const phi = e * SHELL_HALF;
      const rr = R - 0.032;
      const rib = xTube(ctx, pivot, M.struct, 0.030, X_SHELL * 2,
                        0, rr * Math.cos(phi), -rr * Math.sin(phi), Math.max(5, q.tube - 2));
      rib.name = 'rib.' + k + '.' + (e > 0 ? 'lead' : 'trail');
    }
    for (const f of [-0.34, 0.34]) {
      const phi = f * SHELL_HALF;
      const rr = R - 0.021;
      xTube(ctx, pivot, M.struct, 0.019, X_SHELL * 2,
            0, rr * Math.cos(phi), -rr * Math.sin(phi), 5);
    }
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(arcStrip(R + 0.020, SHELL_HALF * 0.995, 0.045, q.shell), M.metal);
      rail.position.x = s * (X_SHELL - 0.022);
      pivot.add(rail);
      ctx.geo.push(rail.geometry);
      /* Two roller carriages a side, reaching out into the web groove, with the
         pinion gearbox on the leading one. */
      for (const f of [-0.55, 0.55]) {
        const phi = f * SHELL_HALF;
        const cr = R + 0.030;
        box(ctx, pivot, M.metal, 0.075, 0.06, 0.11,
            s * (X_WEB - 0.030), cr * Math.cos(phi), -cr * Math.sin(phi));
      }
      if (k < 2) {
        const phi = SHELL_HALF * 0.55, cr = R + 0.045;
        const gb = box(ctx, pivot, M.dark, 0.085, 0.10, 0.10,
                       s * (X_WEB - 0.055), cr * Math.cos(phi), -cr * Math.sin(phi));
        gb.name = 'canopyDrive.' + k;
      }
    }

    /* Lip seal along the leading rib. It is a separate object because the last
       tenth of the closing travel squashes it. */
    let seal = null;
    if (k < 2) {
      seal = xTube(ctx, pivot, M.dark, 0.020, X_SHELL * 1.98,
                   0, R * Math.cos(SHELL_HALF) + 0.035,
                   -R * Math.sin(SHELL_HALF) - 0.012, 6);
      seal.name = 'seal.shell.' + k;
    }
    shells.push({ pivot, seal, R });
  }
  return shells;
}

/* --- side panels -----------------------------------------------------------
   Two a side. Hinged on a piano hinge at the waist rail, hanging outboard and
   down when the vehicle is open, where they guard the flank and carry the
   boarding step. A ball screw in the sill swings each one through a hundred and
   eighty degrees. The top edge is struck on the canopy centre so it closes
   against a fixed lip on the arch web rather than against another moving part,
   which is the difference between a seal that can be inspected and one that
   cannot.
*/
function buildSidePanel(ctx, root, side, z0, z1, index) {
  const M = ctx.M, q = ctx.q;
  const hinge = new THREE.Object3D();
  hinge.name = 'sidepanel.' + index;
  hinge.position.set(side * X_PANEL, Y_HINGE, 0);
  root.add(hinge);

  /* The plate. Its top edge follows the underside of the arch web, so it is
     built column by column rather than as a box. */
  const cols = Math.max(5, q.ring >> 1);
  const pos = new Float32Array((cols + 1) * 2 * 3);
  const nrm = new Float32Array((cols + 1) * 2 * 3);
  const idx = [];
  for (let i = 0; i <= cols; i++) {
    const z = z0 + (z1 - z0) * (i / cols);
    /* Height of the web's inner edge above the waist rail at this station. */
    const dz = C_Z - z;
    const inside = R_WEB_IN * R_WEB_IN - dz * dz;
    const top = (inside > 0 ? C_Y + Math.sqrt(inside) : Y_HINGE) - Y_HINGE - 0.015;
    const b = i * 6;
    pos[b] = 0; pos[b + 1] = 0.02; pos[b + 2] = z;
    pos[b + 3] = 0; pos[b + 4] = Math.max(0.06, top); pos[b + 5] = z;
    nrm[b] = nrm[b + 3] = side; nrm[b + 1] = nrm[b + 4] = 0; nrm[b + 2] = nrm[b + 5] = 0;
    if (i < cols) {
      const a = i * 2;
      if (side > 0) idx.push(a, a + 2, a + 3, a, a + 3, a + 1);
      else idx.push(a, a + 3, a + 2, a, a + 1, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.setIndex(idx);
  ctx.geo.push(g);
  const pane = new THREE.Mesh(g, M.glass);
  pane.castShadow = false;
  hinge.add(pane);

  /* Frame, hinge knuckles, seal bead along the top edge, and the step plate on
     what is the outer face when the panel is down. */
  box(ctx, hinge, M.struct, 0.045, 0.055, z1 - z0, 0, 0.02, (z0 + z1) / 2);
  for (const e of [z0, z1]) {
    const dz = C_Z - e;
    const inside = R_WEB_IN * R_WEB_IN - dz * dz;
    const top = (inside > 0 ? C_Y + Math.sqrt(inside) : Y_HINGE) - Y_HINGE - 0.015;
    box(ctx, hinge, M.struct, 0.035, Math.max(0.06, top), 0.045, 0, Math.max(0.06, top) / 2, e);
  }
  for (const kz of [z0 + 0.10, (z0 + z1) / 2, z1 - 0.10]) {
    zTube(ctx, hinge, M.metal, 0.028, 0.10, side * -0.020, 0, kz, 6);
  }
  const seal = box(ctx, hinge, M.dark, 0.030, 0.030, z1 - z0 - 0.02, 0, 0.02, (z0 + z1) / 2);
  seal.name = 'seal.panel.' + index;
  /* The bead along the top edge, in three short lengths because the edge is an
     arc and one straight extrusion would stand off it at the ends. */
  for (let i = 0; i < 3; i++) {
    const za = z0 + (z1 - z0) * ((i + 0.5) / 3);
    const dz = C_Z - za, ins = R_WEB_IN * R_WEB_IN - dz * dz;
    const top = (ins > 0 ? C_Y + Math.sqrt(ins) : Y_HINGE) - Y_HINGE - 0.012;
    const bead = box(ctx, hinge, M.dark, 0.038, 0.030, (z1 - z0) / 3 - 0.02,
                     0, Math.max(0.05, top), za);
    bead.name = 'seal.panel.' + index;
  }
  /* The tread. It faces outboard when the panel is down and is therefore the
     boarding step; folded up it becomes a grab rail at shoulder height inside
     the cabin, which is where a suited crew member wants one anyway. */
  const step = box(ctx, hinge, M.grip, 0.020, 0.16, 0.44, -side * 0.034, 0.30, (z0 + z1) / 2);
  ctx.dustyMesh.push(step);

  /* The ball screw drives a crank on the hinge shaft rather than reaching up
     the panel, because the panel sweeps everything outboard of its hinge and
     nothing may stand in that half disc. The crank points the opposite way from
     the panel and stays within 75 mm of the shaft, which is small enough to
     swing through the open outboard face of the sill channel.

     Both anchors lie in one cross section, so the animation aims the screw with
     a single arc tangent and never needs a vector. */
  const jz = (z0 + z1) / 2;
  box(ctx, hinge, M.metal, 0.030, 0.075, 0.030, 0, -0.0375, jz);
  zTube(ctx, hinge, M.metal, 0.018, 0.05, 0, -0.075, jz, 6);
  const jack = new THREE.Object3D();
  jack.position.set(side * X_JACK, Y_HINGE - 0.30, jz);
  root.add(jack);
  cyl(ctx, jack, M.dark, 0.026, 0.20, 0, 0.10, 0, q.tube);
  const rod = cyl(ctx, jack, M.metal, 0.012, 1.0, 0, 0.5, 0, 5);
  const motor = box(ctx, jack, M.struct, 0.08, 0.08, 0.12, 0, 0.01, 0);
  motor.name = 'jackMotor.' + index;

  /* Two dogs on the web's lower lip, swinging inboard across the panel's top
     rail. Nothing in the drive train holds pressure; the dogs do. */
  const dogs = [];
  for (const dz of [z0 + 0.22, z1 - 0.22]) {
    const d = new THREE.Object3D();
    const off = C_Z - dz;
    const inside = R_WEB_IN * R_WEB_IN - off * off;
    d.position.set(side * (X_WEB - 0.012), (inside > 0 ? C_Y + Math.sqrt(inside) : Y_HINGE) + 0.020, dz);
    root.add(d);
    box(ctx, d, M.metal, 0.075, 0.026, 0.026, side * -0.036, 0, 0);
    box(ctx, d, M.metal, 0.026, 0.045, 0.026, side * -0.066, -0.020, 0);
    zTube(ctx, d, M.dark, 0.016, 0.05, 0, 0, 0, 6);
    dogs.push(d);
  }

  return { hinge, jack, rod, dogs, side };
}

/* --- the dogs on the cowl --------------------------------------------------
   Four across the front lip. They swing up and over the leading rib of the
   inner shell and pull it down onto the bead. */
function buildCowlDogs(ctx, root) {
  const M = ctx.M;
  const dogs = [];
  /* Each pivot sits well inside the shell's radius, so the parked hook is
     nowhere near the sweep, and the hook is long enough to reach out over the
     leading rib only in the last few degrees of its swing. A latch that had to
     be tucked out of the way by a hair's breadth would be a latch that jammed
     the first time something got bent. */
  const pr = 1.09;
  const py = C_Y + pr * Math.cos(PHI_LATCH), pz = C_Z - pr * Math.sin(PHI_LATCH);
  for (const x of [-0.70, -0.26, 0.26, 0.70]) {
    const d = new THREE.Object3D();
    d.name = 'cowlDog';
    d.position.set(x, py, pz);
    d.rotation.x = -PHI_LATCH;
    root.add(d);
    xTube(ctx, d, M.dark, 0.016, 0.075, 0, 0, 0, 6);
    box(ctx, d, M.metal, 0.048, 0.155, 0.028, 0, 0.0775, 0);
    box(ctx, d, M.metal, 0.048, 0.042, 0.048, 0, 0.150, -0.036);
    dogs.push(d);
  }
  return dogs;
}

/* --- payload ---------------------------------------------------------------
   Tanks, radiator, antennas, stowage, and the arm. All of it lives outside the
   pressure boundary, which is why the rear deck is as busy as it is: anything
   that can be serviced without breaking the seal should be.
*/
function buildRearDeck(ctx, root) {
  const M = ctx.M, q = ctx.q;

  /* Consumable tanks, wrapped in multi layer insulation. Two large ones for
     oxygen and nitrogen at pressure, two smaller for water. Cylinders with
     domed ends, because that is the only shape a pressure vessel takes. */
  const tanks = [
    { r: 0.175, len: 0.86, y: 1.00, z: 1.78 },
    { r: 0.175, len: 0.86, y: 1.00, z: 2.06 },
    { r: 0.125, len: 0.72, y: 0.80, z: 1.80 },
    { r: 0.125, len: 0.72, y: 0.80, z: 2.06 },
  ];
  for (const t of tanks) {
    xTube(ctx, root, M.mli, t.r, t.len, 0, t.y, t.z, q.tube + 3);
    for (const s of [-1, 1]) {
      const cap = new THREE.Mesh(unitSphere(ctx, q.tube + 3), M.mli);
      cap.scale.setScalar(t.r * 2);
      cap.position.set(s * t.len * 0.5, t.y, t.z);
      root.add(cap);
    }
    /* Straps and a valve pack, so the tanks read as installed rather than as
       floating cylinders. */
    for (const s of [-1, 1]) {
      box(ctx, root, M.metal, 0.03, t.r * 2.2, t.r * 2.2, s * t.len * 0.28, t.y, t.z);
    }
    box(ctx, root, M.metal, 0.10, 0.09, 0.09, t.len * 0.5 + 0.08, t.y, t.z);
  }

  /* Radiator. Aft facing, so it sees cold sky rather than hot ground: at noon
     the surface under the wheels is near 390 K and the sky is near zero, and a
     panel that looks down radiates into an oven. It is undersized for a real
     crewed thermal load and no amount of area on a vehicle this size would fix
     that; a real one would carry a water sublimator as well. */
  const rad = box(ctx, root, M.white, 1.66, 0.90, 0.030, 0, 1.20, 2.230);
  rad.name = 'radiator';
  for (let i = 0; i < 7; i++) {
    box(ctx, root, M.metal, 0.02, 0.88, 0.045, -0.72 + i * 0.24, 1.20, 2.200);
  }
  /* Frame and the two struts that carry it off the rear sub frame. */
  for (const dy of [-0.465, 0.465]) box(ctx, root, M.struct, 1.74, 0.05, 0.07, 0, 1.20 + dy, 2.215);
  for (const dx of [-0.845, 0.845]) box(ctx, root, M.struct, 0.05, 0.98, 0.07, dx, 1.20, 2.215);
  for (const dx of [-0.60, 0.60]) {
    const st = box(ctx, root, M.metal, 0.04, 0.60, 0.04, dx, 0.94, 2.115);
    st.rotation.x = -0.32;
  }

  /* High gain dish on a two axis gimbal, aimed at Earth by hand. A 0.55 m dish
     at S band closes a useful link from anywhere on the near side, which is the
     whole reason the vehicle can go over a horizon at all. */
  /* Both antennas stand on a pedestal off the rear cross member, because the
     tank deck below them is a service area and nothing structural can sit on a
     pressure vessel. */
  for (const px of [0.62, -0.68]) {
    box(ctx, root, M.struct, 0.16, 0.52, 0.16, px, 1.36, 1.89);
    box(ctx, root, M.struct, 0.30, 0.05, 0.30, px, 1.62, 1.89);
  }
  const mast = new THREE.Object3D();
  mast.name = 'hga';
  mast.position.set(0.62, 1.72, 1.89);
  root.add(mast);
  cyl(ctx, mast, M.struct, 0.038, 0.36, 0, -0.18, 0, q.tube);
  box(ctx, mast, M.struct, 0.10, 0.11, 0.10, 0, 0.02, 0);
  const dishPts = [];
  for (let i = 0; i <= 8; i++) {
    const r = (i / 8) * 0.275;
    dishPts.push(new THREE.Vector2(r, r * r * 1.15));
  }
  const dishGeo = new THREE.LatheGeometry(dishPts, q.dish);
  ctx.geo.push(dishGeo);
  const dish = new THREE.Mesh(dishGeo, M.sheetWhite);
  dish.position.y = 0.10;
  dish.rotation.set(-0.55, 0, 0.30);
  mast.add(dish);
  cyl(ctx, dish, M.metal, 0.014, 0.20, 0, 0.16, 0, 5);
  cyl(ctx, dish, M.metal, 0.030, 0.05, 0, 0.27, 0, 6);

  /* Low gain whip. It is the link that still works when the dish is pointed at
     the ground because the vehicle is on its side. */
  const whip = new THREE.Object3D();
  whip.name = 'whip';
  whip.position.set(-0.68, 1.66, 1.89);
  root.add(whip);
  cyl(ctx, whip, M.metal, 0.010, 1.30, 0, 0.65, 0, 5);
  const ball = new THREE.Mesh(unitSphere(ctx, 6), M.metal);
  ball.scale.setScalar(0.040); ball.position.y = 1.30;
  whip.add(ball);

  /* Sample stowage and the battery box. Sample containers are kept outboard
     and shaded; anything volatile in a sample is gone the moment it is warm. */
  for (const s of [-1, 1]) {
    box(ctx, root, M.struct, 0.30, 0.34, 0.52, s * 0.70, 0.90, 1.62);
    box(ctx, root, M.mli, 0.28, 0.05, 0.50, s * 0.70, 1.09, 1.62);
  }
  box(ctx, root, M.struct, 1.30, 0.26, 0.42, 0, 0.62, 1.28);

  return { whip, mast };
}

function buildFrontDeck(ctx, root) {
  const M = ctx.M, q = ctx.q;

  /* Robotic arm, stowed. Only the shoulder yoke and the first link are carried
     here; the rest of it is a separate problem and a separate file. Folded back
     along the deck it is out of the driver's sight line, which is the only
     place a boom on a rover is allowed to sit. */
  const arm = new THREE.Object3D();
  arm.name = 'arm';
  arm.position.set(-0.62, 0.80, -1.42);
  root.add(arm);
  cyl(ctx, arm, M.struct, 0.11, 0.22, 0, 0.02, 0, q.tube + 2);
  box(ctx, arm, M.metal, 0.18, 0.16, 0.16, 0, 0.16, 0);
  const link = box(ctx, arm, M.metal, 0.11, 0.11, 0.62, 0, 0.18, -0.34);
  link.rotation.x = 0.16;
  xTube(ctx, arm, M.dark, 0.055, 0.22, 0, 0.18, 0, 8);
  box(ctx, arm, M.metal, 0.09, 0.09, 0.16, 0, 0.24, -0.66);

  /* Tool and sample stowage on the front deck, and the two grab handles a
     suited crew member uses to lever themselves up onto it. */
  box(ctx, root, M.struct, 0.52, 0.26, 0.62, 0.55, 0.82, -1.55);
  box(ctx, root, M.mli, 0.50, 0.04, 0.60, 0.55, 0.96, -1.55);
  box(ctx, root, M.struct, 1.40, 0.16, 0.30, 0, 0.77, -2.02);
  for (const s of [-1, 1]) {
    const h = zTube(ctx, root, M.metal, 0.020, 0.36, s * 0.72, 0.94, -2.02, 5);
    h.rotation.x = Math.PI / 2;
    box(ctx, root, M.metal, 0.04, 0.14, 0.04, s * 0.72, 0.85, -1.86);
    box(ctx, root, M.metal, 0.04, 0.14, 0.04, s * 0.72, 0.85, -2.18);
  }

  /* Step plates below the door aperture, at a height a suited leg can reach.
     They get filthy first and stay filthy. */
  for (const s of [-1, 1]) {
    const st = box(ctx, root, M.grip, 0.34, 0.03, 0.44, s * (X_SKIN + 0.14), 0.86, 0.10);
    ctx.dustyMesh.push(st);
    box(ctx, root, M.struct, 0.30, 0.10, 0.05, s * (X_SKIN + 0.14), 0.80, 0.10);
  }
}

/* --- lights ----------------------------------------------------------------
   Emissive lenses only. With one directional sun and no ambient, a lamp that
   was merely a bright material would vanish in shadow, so these carry their
   light in the emissive channel and setLights drives the intensity. Real spot
   lights, if the integrator wants them, can be parented to the named housings.
*/
function buildLights(ctx, root, cowlY, cowlZ) {
  const M = ctx.M, q = ctx.q;
  const lamps = [];
  function lamp(mat, r, x, y, z, rx, name) {
    const g = new THREE.Object3D();
    g.position.set(x, y, z);
    g.rotation.x = rx;
    g.name = name;
    root.add(g);
    cyl(ctx, g, M.struct, r * 1.15, 0.09, 0, 0, 0, q.tube + 2).rotation.x = Math.PI / 2;
    const lens = new THREE.Mesh(unitCyl(ctx, q.tube + 2), mat);
    lens.scale.set(r * 2, 0.02, r * 2);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = -0.05;
    lens.castShadow = false;
    g.add(lens);
    lamps.push(g);
    return g;
  }
  /* Two on the cowl for close work and two high on the arches for the horizon.
     Driving into your own shadow is the standard lunar problem: with the Sun
     low behind you the ground ahead is featureless, and a light mounted where
     your eye is does not help. High and wide does. */
  lamp(M.lampWhite, 0.075, -0.62, cowlY - 0.16, cowlZ - 0.09, 0.10, 'headlamp.0');
  lamp(M.lampWhite, 0.075, 0.62, cowlY - 0.16, cowlZ - 0.09, 0.10, 'headlamp.1');
  for (const s of [-1, 1]) {
    const phi = 66 * DEG, r = R_ARCH_C + 0.02;
    lamp(M.lampWhite, 0.060, s * (X_ARCH + 0.07), arcY(r, phi), arcZ(r, phi), 0.35,
         'headlamp.' + (s < 0 ? 2 : 3));
  }
  /* Aft: two red position lamps and two white work lamps over the rear deck,
     because everything that goes wrong on a rover goes wrong at the back. */
  for (const s of [-1, 1]) {
    lamp(M.lampRed, 0.048, s * 0.78, 0.86, 2.24, Math.PI, 'taillamp.' + (s < 0 ? 0 : 1));
    lamp(M.lampWhite, 0.055, s * 0.50, 1.74, 2.10, Math.PI - 0.5,
         'worklamp.' + (s < 0 ? 0 : 1));
  }
  return lamps;
}

/* --- the cabin -------------------------------------------------------------
   Worth sitting in, because the point of closing the vehicle is to park
   somewhere and stay. Suits off, a meal, a night's sleep, and out again.

   The one structural constraint that shapes all of it: nothing can hang from
   the arch, because the shells sweep the whole band between 1.24 and 1.36 m
   from the centre of curvature. So the overhead panel and the cabin lights are
   carried on two braces cantilevered aft from the cowl, and a chord between two
   points inside a circle stays inside it.
*/
function buildInterior(ctx, root, cowlY, cowlZ) {
  const M = ctx.M, q = ctx.q;
  const cab = new THREE.Object3D();
  cab.name = 'interior';
  root.add(cab);

  /* Console. A shallow cylindrical face struck about a vertical axis behind the
     crew, so every part of it is the same distance from a gloved hand. */
  const console3 = new THREE.Object3D();
  console3.position.set(0, Y_SEAT + 0.06, -0.60);
  console3.rotation.x = -0.42;
  cab.add(console3);
  const faceGeo = new THREE.CylinderGeometry(1.50, 1.50, 0.34, q.ring, 1, true,
                                             Math.PI - 34.5 * DEG, 69 * DEG);
  ctx.geo.push(faceGeo);
  const face = new THREE.Mesh(faceGeo, M.sheet);
  face.position.z = 1.50 - 0.30;
  console3.add(face);
  box(ctx, console3, M.struct, 1.66, 0.06, 0.42, 0, -0.18, -0.14);

  /* Screens. Flat panels sitting on the console's arc. */
  const nScreen = q.screens;
  for (let i = 0; i < nScreen; i++) {
    const a = (i - (nScreen - 1) / 2) * (nScreen > 3 ? 15 : 22) * DEG;
    const w = nScreen > 3 ? 0.30 : 0.40;
    const sc = new THREE.Mesh(unitBox(ctx), M.screen[i % 3]);
    sc.scale.set(w, 0.22, 0.012);
    sc.position.set(-Math.sin(a) * 1.485, 0.02, (1.50 - 0.30) - Math.cos(a) * 1.485);
    sc.rotation.y = -a;
    sc.castShadow = false;
    console3.add(sc);
  }
  /* Drive mode strip, which is the one thing on the console the animation
     touches: it brightens in the high power mode. */
  const boost = new THREE.Mesh(unitBox(ctx), M.lampDrive);
  boost.scale.set(0.44, 0.030, 0.010);
  boost.position.set(0, -0.13, 1.50 - 0.30 - 1.49);
  boost.castShadow = false;
  console3.add(boost);

  /* Hand controllers. Two of them, one a side, because a rover that steers with
     a wheel needs a hand free for it and a suited hand has no spare. */
  for (const s of [-1, 1]) {
    const stick = new THREE.Object3D();
    stick.position.set(s * 0.46, Y_SEAT + 0.20, -0.16);
    cab.add(stick);
    box(ctx, stick, M.struct, 0.13, 0.07, 0.24, 0, -0.06, 0);
    cyl(ctx, stick, M.dark, 0.026, 0.20, 0, 0.08, 0, 6).rotation.x = -0.28;
    const grip = new THREE.Mesh(unitSphere(ctx, 6), M.dark);
    grip.scale.set(0.075, 0.10, 0.075);
    grip.position.set(0, 0.19, -0.05);
    stick.add(grip);
  }

  /* Overhead panel on its two braces, with switch rows and two light strips. */
  const braceY0 = cowlY, braceZ0 = cowlZ;
  for (const s of [-1, 1]) {
    const bx = s * 0.72;
    const dz = 0.05 - braceZ0, dy = 2.02 - braceY0;
    const len = Math.hypot(dy, dz);
    const b = box(ctx, cab, M.struct, 0.05, len, 0.05, bx, (braceY0 + 2.02) / 2,
                  (braceZ0 + 0.05) / 2);
    b.rotation.x = -Math.atan2(dz, dy);
  }
  const over = new THREE.Object3D();
  over.position.set(0, 2.02, 0.06);
  over.rotation.x = 0.22;
  cab.add(over);
  box(ctx, over, M.struct, 1.30, 0.05, 0.40, 0, 0, 0);
  if (q.greebles) {
    const swGeo = new THREE.BoxGeometry(0.030, 0.030, 0.045);
    const rows = 3, per = 9;
    const sw = new THREE.InstancedMesh(swGeo, M.metal, rows * per);
    const m4 = new THREE.Matrix4();
    for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) {
      m4.makeTranslation(-0.44 + i * 0.11, -0.035, -0.13 + r * 0.11);
      sw.setMatrixAt(r * per + i, m4);
    }
    sw.instanceMatrix.needsUpdate = true;
    over.add(sw);
    ctx.geo.push(swGeo);
  }
  /* Consumable gauges, on the overhead where both crew can read them. */
  const gauge = new THREE.Mesh(unitBox(ctx), M.screen[2]);
  gauge.scale.set(0.44, 0.010, 0.16);
  gauge.position.set(0.42, -0.032, 0.02);
  gauge.castShadow = false;
  over.add(gauge);
  /* Cabin lights: two strips along the braces. */
  for (const s of [-1, 1]) {
    const strip = new THREE.Mesh(unitBox(ctx), M.lampCabin);
    strip.scale.set(0.05, 0.014, 1.05);
    strip.position.set(s * 0.66, 1.94, 0.10);
    strip.rotation.x = -0.30;
    strip.castShadow = false;
    cab.add(strip);
  }

  /* Seats. A frame, a pan, a back and a five point harness, sized for a suit
     rather than for a person: nobody sits down in a hard upper torso, they get
     into it. */
  const seats = [];
  for (const s of [-1, 1]) {
    const seat = new THREE.Object3D();
    seat.position.set(s * 0.50, Y_SEAT, 0.10);
    cab.add(seat);
    box(ctx, seat, M.struct, 0.56, 0.06, 0.48, 0, 0, 0);
    box(ctx, seat, M.seat, 0.50, 0.07, 0.44, 0, 0.055, 0);
    const back = box(ctx, seat, M.seat, 0.50, 0.66, 0.09, 0, 0.38, 0.27);
    back.rotation.x = -0.20;
    box(ctx, seat, M.seat, 0.34, 0.16, 0.09, 0, 0.74, 0.30);
    for (const h of [-0.16, 0.16]) {
      const strap = box(ctx, seat, M.dark, 0.055, 0.62, 0.02, h, 0.36, 0.20);
      strap.rotation.x = -0.18;
    }
    box(ctx, seat, M.struct, 0.10, 0.36, 0.10, 0, -0.20, 0.10);
    /* Stowage locker under each seat. */
    box(ctx, seat, M.struct, 0.52, 0.30, 0.40, 0, -0.24, -0.06);

    const eye = new THREE.Object3D();
    eye.name = 'seat.' + (s < 0 ? 'L' : 'R');
    eye.position.set(s * 0.50, Y_EYE, 0.02);
    cab.add(eye);
    seats.push(eye);
  }

  /* Lockers along the rear bulkhead and the bunk that folds down over the
     seat backs once they are laid flat. It is drawn stowed, hinged low on the
     bulkhead subframe with a gas strut on each side, because that is the only
     place in a cabin this size where a 1.9 m panel can live. */
  box(ctx, cab, M.struct, 1.70, 0.44, 0.20, 0, 1.00, 1.40);
  for (const s of [-1, 1]) box(ctx, cab, M.metal, 0.03, 0.36, 0.03, s * 0.42, 1.00, 1.29);
  const bunk = new THREE.Object3D();
  bunk.name = 'bunk';
  bunk.position.set(0, 1.05, 1.27);
  cab.add(bunk);
  /* It stows as two leaves folded on each other, which is the only way a 1.9 m
     sleeping surface fits into a 0.5 m panel, and it is also what keeps the
     stowed height clear of the innermost shell's sweep. */
  box(ctx, bunk, M.struct, 1.66, 0.48, 0.05, 0, 0.240, 0);
  box(ctx, bunk, M.seat, 1.58, 0.44, 0.035, 0, 0.240, -0.04);
  box(ctx, bunk, M.struct, 1.60, 0.44, 0.030, 0, 0.240, -0.07);
  for (const s of [-1, 1]) {
    xTube(ctx, bunk, M.metal, 0.022, 0.10, s * 0.78, 0.02, 0, 6);
    const strut = box(ctx, bunk, M.metal, 0.026, 0.30, 0.026, s * 0.70, 0.18, 0.06);
    strut.rotation.x = 0.22;
  }

  /* Floor grating inside the cabin, and a footwell lip so the crew have
     something to brace against under braking. */
  box(ctx, cab, M.struct, 1.60, 0.05, 0.10, 0, Y_DECK + 0.10, -0.86);

  return { seats };
}

/* --- assembly --------------------------------------------------------------- */

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function smooth(x) { const t = clamp01(x); return t * t * (3 - 2 * t); }

/* Reused so animate() can be called with nothing and still be safe. */
const IDLE = { wheelAngle: 0, steer: 0, suspension: [0, 0, 0, 0],
               speed: 0, canopy: 0, boost: false, dt: 0 };

function countTriangles(root) {
  let n = 0;
  root.traverse(o => {
    if (!o.isMesh) return;
    const g = o.geometry;
    const tris = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    n += tris * (o.isInstancedMesh ? o.count : 1);
  });
  return Math.round(n);
}

/**
 * Build the rover.
 *
 * @param {object} opts
 *   quality  'performance' | 'balanced' | 'high' | 'ultra'. Anything else gets
 *            the 'high' table. Only segment counts and optional detail change;
 *            every dimension and every pivot is the same at all four.
 *
 * @returns {object}
 *   group           THREE.Group. Author frame, unscaled, origin on the ground.
 *   animate(state)  once a frame. See below. Allocates nothing.
 *   wheels          four { hub, tyre, steerPivot, suspension }, ordered front
 *                   left, front right, rear left, rear right, where left is -X.
 *                   suspension carries the whole corner and moves up as the
 *                   spring compresses; steerPivot is inside it; hub is inside
 *                   that and spins about X; tyre is the mesh, for dust or for
 *                   a raycast.
 *   seats           two THREE.Object3D at the crew eye positions, unrotated.
 *   interiorAnchor  THREE.Object3D between the crew at eye height, unrotated,
 *                   so a camera parented to it looks forward with no offset.
 *   colliders       ten { type:'box', centre, half } in model space, describing
 *                   the pressure hull. Turn them on when the cabin is sealed;
 *                   while it is open there is nothing above the waist to hit.
 *   setCanopy(t)    0 open, 1 closed and dogged. Allocates nothing.
 *   setLights(on)   drives the emissive lenses. The housings are named
 *                   headlamp.0..3, taillamp.0..1 and worklamp.0..1, so real
 *                   spot lights can be parented to them if the budget allows.
 *   setDust(a)      0..1. It only ever goes up in play; regolith does not brush
 *                   off, and there is no rain.
 *   dispose()       geometries, materials and canvas textures.
 *   lamps           the eight lamp housings, in the order named above.
 *   materials       the material table, for anyone who wants to retune it.
 *   triangles       the count for this build, for the render statistics panel.
 *
 * The state object passed to animate():
 *   wheelAngle   radians of roll, shared by all four. Positive is forwards.
 *   steer        -1..1. Positive turns right. The front wheels take the full
 *                32 degrees; the rear pair counter steer at low speed and come
 *                slightly into phase above about 3 m/s so the vehicle crabs.
 *   suspension   four travel values in metres, positive compressed, measured
 *                from the authored pose and clamped to ROVER.suspTravel. Zero
 *                is where the model is drawn, and at one sixth g that is also
 *                where it sits.
 *   speed        m/s, for the steering phase and the antenna.
 *   canopy       0..1, forwarded to setCanopy.
 *   boost        high power drive mode.
 *   dt           seconds. Only the antenna integrates it; everything else is
 *                a direct pose, so a dropped frame cannot desynchronise it.
 */
export function buildRover(opts = {}) {
  const q = TIER[opts.quality] || TIER.high;
  const M = makeMaterials(q);

  /* Separate material instances for everything below the waist and everything
     that touches the ground, so setDust can tint them without turning the
     radiator and the canopy frames brown as well. */
  M.structLow = M.struct.clone();
  M.metalLow = M.metal.clone();
  M.gripLow = M.grip.clone();
  M.lampDrive = M.lampRed.clone();
  M.lampDrive.emissive.setHex(0xffa63c);

  const ctx = { q, M, u: {}, geo: [], dustyMesh: [] };

  const group = new THREE.Group();
  group.name = 'rover';

  /* Frame, tub, arches. */
  const { cowlY, cowlZ } = buildChassis(ctx, group);
  buildArch(ctx, group, -1);
  buildArch(ctx, group, 1);

  /* Running gear. Index order is front left, front right, rear left, rear
     right, with left meaning -X, which is the driver's left when the vehicle
     faces north. */
  const corners = [
    buildCorner(ctx, 0, -1, -Z_AXLE, true),
    buildCorner(ctx, 1, 1, -Z_AXLE, true),
    buildCorner(ctx, 2, -1, Z_AXLE, false),
    buildCorner(ctx, 3, 1, Z_AXLE, false),
  ];
  for (const c of corners) {
    group.add(c.root);
    /* Everything on a corner is in the dust all day. */
    c.root.traverse(o => {
      if (!o.isMesh) return;
      if (o.material === M.struct) o.material = M.structLow;
      else if (o.material === M.metal) o.material = M.metalLow;
    });
  }

  /* The mechanism. */
  const shells = buildCanopy(ctx, group);
  const panels = [
    buildSidePanel(ctx, group, -1, Z_DOOR_0, 0.06, 0),
    buildSidePanel(ctx, group, -1, 0.09, Z_DOOR_1, 1),
    buildSidePanel(ctx, group, 1, Z_DOOR_0, 0.06, 2),
    buildSidePanel(ctx, group, 1, 0.09, Z_DOOR_1, 3),
  ];
  const cowlDogs = buildCowlDogs(ctx, group);

  /* Payload and cabin. */
  const rear = buildRearDeck(ctx, group);
  buildFrontDeck(ctx, group);
  const lamps = buildLights(ctx, group, cowlY, cowlZ);
  const cabin = buildInterior(ctx, group, cowlY, cowlZ);

  /* Anything pushed onto the dust list by a builder gets its own material. */
  for (const m of ctx.dustyMesh) {
    if (m.material === M.grip) m.material = M.gripLow;
    else if (m.material === M.struct) m.material = M.structLow;
    else if (m.material === M.metal) m.material = M.metalLow;
  }

  /* Shadows. Glass and every emissive lens are excluded: an alpha blended
     surface written into the depth pass casts a solid black shadow, which on a
     canopy is worse than no shadow at all. */
  const noShadow = new Set([M.glass, M.lampWhite, M.lampRed, M.lampCabin,
                            M.lampDrive, M.screen[0], M.screen[1], M.screen[2]]);
  group.traverse(o => {
    if (!o.isMesh) return;
    o.receiveShadow = true;
    o.castShadow = !noShadow.has(o.material);
  });

  /* --- interior anchor and seats -------------------------------------------
     The anchor sits on the centreline between the two crew at eye height, with
     no rotation, so a camera parented to it looks forward down -Z without any
     correction. */
  const interiorAnchor = new THREE.Object3D();
  interiorAnchor.name = 'interiorAnchor';
  interiorAnchor.position.set(0, Y_EYE - 0.08, 0.10);
  group.add(interiorAnchor);

  /* --- colliders -----------------------------------------------------------
     The pressure hull as a handful of boxes, in model space. The caller turns
     them on once the cabin is sealed; while the canopy is open there is nothing
     above the waist to walk into. */
  const colliders = [
    { type: 'box', centre: [0, Y_DECK - 0.10, 0.28], half: [0.90, 0.10, 1.24] },
    { type: 'box', centre: [0, 1.06, cowlZ - 0.02], half: [0.90, 0.36, 0.08] },
    { type: 'box', centre: [0, 1.14, 1.50], half: [0.90, 0.44, 0.08] },
    { type: 'box', centre: [-0.90, 1.10, 0.28], half: [0.05, 0.40, 1.24] },
    { type: 'box', centre: [0.90, 1.10, 0.28], half: [0.05, 0.40, 1.24] },
    { type: 'box', centre: [-0.94, 1.86, 0.08], half: [0.05, 0.36, 0.88] },
    { type: 'box', centre: [0.94, 1.86, 0.08], half: [0.05, 0.36, 0.88] },
    { type: 'box', centre: [0, 2.34, 0.20], half: [0.92, 0.10, 1.10] },
    { type: 'box', centre: [-0.50, 0.98, 0.34], half: [0.30, 0.28, 0.26] },
    { type: 'box', centre: [0.50, 0.98, 0.34], half: [0.30, 0.28, 0.26] },
  ];

  /* --- dust ---------------------------------------------------------------- */
  const dustMats = [M.tyre, M.tread, M.structLow, M.metalLow, M.gripLow];
  const dustClean = dustMats.map(m => m.color.clone());
  const dustRough = dustMats.map(m => m.roughness);
  /* Regolith fines are grey with a brown cast and they are electrostatically
     stuck to whatever they touch. Nothing brushes them off, so this only ever
     goes one way in play. */
  const REGOLITH = new THREE.Color(0x8d8377);

  let dust = 0;
  function setDust(amount) {
    dust = clamp01(amount);
    for (let i = 0; i < dustMats.length; i++) {
      const m = dustMats[i];
      m.color.copy(dustClean[i]).lerp(REGOLITH, dust * 0.82);
      /* Dust kills the specular before it kills the colour, which is why a
         dusty Apollo LRV photographs flat rather than merely dirty. */
      m.roughness = dustRough[i] + (0.96 - dustRough[i]) * dust;
    }
  }

  /* --- lights -------------------------------------------------------------- */
  let lightsOn = false;
  function setLights(on) {
    lightsOn = !!on;
    M.lampWhite.emissiveIntensity = lightsOn ? 7.0 : 0;
    M.lampRed.emissiveIntensity = lightsOn ? 2.2 : 0;
    M.lampCabin.emissiveIntensity = lightsOn ? 1.4 : 0;
  }

  /* --- the transformation ---------------------------------------------------
     One number drives the whole machine. The shells run first, the side panels
     start before the shells have finished so the vehicle never looks like it is
     waiting in a queue, and the last tenth is the seals compressing and the
     dogs swinging across. Order matters: nothing in the drive train is asked to
     hold pressure. */
  /* Gathered once at build time so setCanopy never has to search for them. */
  const panelSeals = [];
  for (const p of panels) {
    p.hinge.traverse(o => {
      if (o.name && o.name.indexOf('seal.panel') === 0) panelSeals.push(o);
    });
  }

  let canopyT = -1;
  function setCanopy(t) {
    const T = clamp01(t);
    if (T === canopyT) return;
    canopyT = T;

    const shellT = smooth(T / 0.62);
    const panelT = smooth((T - 0.42) / 0.46);
    const sealT = clamp01((T - 0.86) / 0.14);
    const dogT = smooth((T - 0.90) / 0.10);

    for (let k = 0; k < 3; k++) {
      const phi = PHI_STOW + (PHI_OPEN[k] - PHI_STOW) * shellT;
      shells[k].pivot.rotation.x = -phi;
      const s = shells[k].seal;
      if (s) { const r = 0.040 * (1 - 0.30 * sealT); s.scale.x = r; s.scale.z = r; }
    }

    for (let i = 0; i < panels.length; i++) {
      const p = panels[i];
      const psi = Math.PI * (1 - panelT);
      p.hinge.rotation.z = -p.side * psi;

      /* The ball screw and its crank, solved as a plane triangle. The crank
         pin sits 75 mm from the hinge on the far side of the shaft, so the
         screw pulls the panel closed and pushes it open. */
      const du = X_PANEL - 0.075 * Math.sin(psi) - X_JACK;
      const dy = 0.30 - 0.075 * Math.cos(psi);
      const len = Math.sqrt(du * du + dy * dy);
      p.jack.rotation.z = Math.atan2(-p.side * du, dy);
      const rl = len - 0.10 > 0.03 ? len - 0.10 : 0.03;
      p.rod.scale.y = rl;
      p.rod.position.y = 0.10 + rl * 0.5;

      for (let d = 0; d < p.dogs.length; d++) {
        p.dogs[d].rotation.z = p.side * 1.60 * (1 - dogT);
      }
    }
    /* The top beads squash as the dogs pull each panel down onto them. */
    for (let i = 0; i < panelSeals.length; i++) {
      panelSeals[i].scale.y = 0.030 * (1 - 0.30 * sealT);
    }

    for (let i = 0; i < cowlDogs.length; i++) {
      cowlDogs[i].rotation.x = -PHI_LATCH - 1.75 * (1 - dogT);
    }
  }

  /* --- per frame ------------------------------------------------------------
     No allocation here. Everything is a scalar written into an existing
     Object3D, which is why the corner geometry was precomputed into plain
     numbers at build time. */
  let prevSpeed = 0, whipA = 0, whipV = 0;

  function animate(state) {
    const s = state || IDLE;
    const dt = s.dt || 0;
    const susp = s.suspension || IDLE.suspension;
    const wheelAngle = s.wheelAngle || 0;
    const steerIn = s.steer || 0;
    const speed = s.speed || 0;

    /* Four wheel steering. Counter phase gives the tightest turn, which is what
       you want threading between boulders; in phase makes the vehicle crab,
       which is what you want traversing a slope without the tail sliding down
       it. Real systems blend between the two on speed and so does this one. */
    const phase = Math.min(1, Math.abs(speed) / 3.0);
    const rearGain = -1 + 1.25 * phase;

    for (let i = 0; i < 4; i++) {
      const c = corners[i], g = c.geom;

      c.hub.rotation.x = -wheelAngle;
      c.steer.rotation.y = -steerIn * MAX_STEER * (g.front ? 1 : rearGain);

      let d = susp[i] || 0;
      if (d < 0) d = 0; else if (d > TRAVEL) d = TRAVEL;

      let sa = Math.sin(g.lowA0) + d / g.lowL;
      if (sa < -1) sa = -1; else if (sa > 1) sa = 1;
      const a = Math.asin(sa);
      c.susp.position.x = g.side * (g.lowPX + g.lowL * Math.cos(a));
      c.susp.position.y = g.lowPY + g.lowL * Math.sin(a);
      c.lower.rotation.z = g.side * a;

      let su = Math.sin(g.uppA0) + d / g.uppL;
      if (su < -1) su = -1; else if (su > 1) su = 1;
      c.upper.rotation.z = g.side * Math.asin(su);

      /* The coil over. The barrel stays the length it was made and the rod
         slides, because a damper that stretched as a whole would be the one
         obviously fake thing on the vehicle. */
      const ex = g.lowPX + g.lowL * g.damperFrac * Math.cos(a);
      const ey = g.lowPY + g.lowL * g.damperFrac * Math.sin(a);
      const du = ex - g.damperX, dy = ey - g.damperY;
      const len = Math.sqrt(du * du + dy * dy);
      c.damper.rotation.z = Math.atan2(-g.side * du, dy);
      const rl = len - 0.10 > 0.04 ? len - 0.10 : 0.04;
      c.rod.scale.y = rl;
      c.rod.position.y = 0.10 + rl * 0.5;
      const sl = len - 0.06 > 0.08 ? len - 0.06 : 0.08;
      c.spring.scale.y = sl;
      if (g.springCentred) c.spring.position.y = sl * 0.5;
    }

    /* The whip antenna. A metre of spring steel on a vehicle with 0.42 m of
       suspension travel does not stand still, and at one sixth g it takes a
       long time to settle. Driven by longitudinal acceleration, damped, and
       clamped so it never looks like a windscreen wiper. */
    if (dt > 0) {
      const accel = (speed - prevSpeed) / dt;
      whipV += (-whipA * 26.0 - whipV * 3.2 - accel * 0.020) * dt;
      whipA += whipV * dt;
      if (whipA > 0.32) { whipA = 0.32; whipV = 0; }
      else if (whipA < -0.32) { whipA = -0.32; whipV = 0; }
      rear.whip.rotation.x = whipA;
      prevSpeed = speed;
    }

    if (s.canopy !== undefined) setCanopy(s.canopy);

    /* High power drive mode: the console strip is the only tell inside, and it
       is deliberately the only one, because a rover that announced itself with
       glowing hardware would be a spacecraft that had never met a mass budget. */
    M.lampDrive.emissiveIntensity = s.boost ? 3.0 : (lightsOn ? 0.35 : 0.10);
  }

  /* --- teardown ------------------------------------------------------------- */
  function dispose() {
    const geos = new Set(), mats = new Set(), texs = new Set();
    group.traverse(o => {
      if (o.geometry) geos.add(o.geometry);
      if (o.material) mats.add(o.material);
    });
    /* Anything in the material table that never reached a mesh would otherwise
       hold its GPU resources for the life of the page. */
    for (const k in M) {
      const v = M[k];
      if (v && v.isMaterial) mats.add(v);
      else if (Array.isArray(v)) for (const m of v) if (m && m.isMaterial) mats.add(m);
    }
    for (const g of ctx.geo) geos.add(g);
    for (const m of mats) {
      for (const k of ['map', 'alphaMap', 'emissiveMap', 'roughnessMap', 'normalMap']) {
        if (m[k]) texs.add(m[k]);
      }
      m.dispose();
    }
    for (const t of M._textures) if (t) texs.add(t);
    for (const t of texs) t.dispose();
    for (const g of geos) g.dispose();
    for (const k in ctx.u) ctx.u[k].dispose();
    group.clear();
    group.removeFromParent();
  }

  /* Author the vehicle open, then let the caller drive it. The suspension pose
     comes out of animate() rather than out of the builders, so it has to be run
     once here; without it the dampers and springs sit at their unit length,
     standing a metre out of the bodywork until the first frame. */
  animate(IDLE);
  setCanopy(0);
  setLights(false);
  setDust(0);

  return {
    group,
    animate,
    wheels: corners.map(c => ({ hub: c.hub, tyre: c.tyre,
                                steerPivot: c.steer, suspension: c.susp })),
    seats: cabin.seats,
    interiorAnchor,
    colliders,
    setCanopy,
    setLights,
    setDust,
    dispose,
    /* Extras the integrator may want and which cost nothing to expose. */
    lamps,
    materials: M,
    triangles: countTriangles(group),
  };
}
