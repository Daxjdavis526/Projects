/* =============================================================================
   APOLLO 11 — Tranquility Base
   -----------------------------------------------------------------------------
   This is the one place in SELENE where nothing may be invented. Everything in
   this file is a thing that is actually lying at 0.67415 north, 23.47314 east,
   and the arrangement comes from the Apollo 11 Preliminary Science Report
   (SP-214), the Apollo Lunar Surface Journal, and Wagner, Speyerer and Robinson
   2012, which located the hardware from seventeen LROC narrow angle camera
   images. RESEARCH.md section 2 is the source table and every position below
   cites its row.

   What is at the site. The descent stage of the lunar module Eagle, standing on
   four legs where it was left on 20 July 1969. Twenty two metres south south
   west of it, the Laser Ranging Retroreflector, which is the only object here
   that is still doing science: observatories on Earth have been bouncing pulses
   off it continuously since August 1969 and it is the reason the Earth to Moon
   distance is known to a few millimetres. Twenty eight metres south, the
   Passive Seismic Experiment Package, which ran for three weeks and then died
   of the lunar night. Twenty metres north west, the television camera, still on
   its tripod at the end of its cable. The Solar Wind Composition staff. Two
   backpacks and a jettison bag thrown out of the hatch before liftoff. And the
   flag.

   Why the flag is on the ground. Aldrin watched it through the window as the
   ascent stage lit, and reported that the exhaust knocked it over. Every later
   mission planted its flag further out for exactly that reason, and LRO can see
   the shadows of the Apollo 12, 16 and 17 flags still standing while Apollo 11
   has none. So the flag here lies where it fell, pointing away from the lunar
   module. A standing flag at Tranquility Base would be the single most visible
   falsehood this project could commit, which is why it is called out here and
   again at the geometry that draws it.

   What is approximate, and said so plainly. The Solar Wind Composition
   experiment appears on the site maps in SP-214 figures 3-15 and 3-16 but no
   numeric offset was ever published, so it is read off a drawing and its items
   entry carries note: 'position approximate'. The bearings to the television
   camera and to the flag are qualitative in the sources, which give a distance
   and a compass quadrant and nothing finer; the distances are documented and
   the bearings are not. The landing yaw of 13.3 degrees is documented but its
   sign convention is not stated in a form this file can verify, so it is
   applied clockwise seen from above, which is the ordinary sense for a reported
   yaw, and the consequence is noted where it is applied.

   What is here that is not hardware. The ground itself is disturbed. LROC
   images of the site show darkened, compacted trails radiating from the ladder
   and a brighter halo where the descent engine plume swept the surface, and
   both are drawn here as flat decals rather than as displaced terrain, because
   the images show discolouration and not trenches. The darkening and the
   brightening go in opposite directions for a physical reason that is worth
   stating: undisturbed regolith is a fairy castle structure of loosely stacked
   grains, and that structure is what produces the opposition surge, so soil a
   boot has compacted loses its surge and reads darker at low phase, while soil
   the plume has stripped of its finest fraction reads brighter.

   Frame, as everywhere else in SELENE: +Y up, +X east, +Z south, origin at the
   centre of the descent stage footprint and on the ground. Offsets in the items
   array are metres east and metres north, and the latitude and longitude on
   each entry are derived from those with the site radius, so a caller can place
   a label either way round.
   ========================================================================== */

import * as THREE from 'three';

/** Wagner, Speyerer, Robinson et al. 2012, ISPRS Archives XXXIX-B4:517,
    Table 2: the descent stage, from seventeen LROC NAC images. */
export const APOLLO11_SITE = { lat: 0.67415, lon: 23.47314 };

const DEG = Math.PI / 180;

/* The local radius from the same table, 1 735 471 m, rather than the 1737.4 km
   datum sphere. The difference is a tenth of a percent, which is two
   centimetres over the longest offset in this file, but the measured radius is
   the one the measured coordinates were reduced against. */
const R_SITE = 1735471;
const M_PER_DEG_LAT = R_SITE * DEG;
const M_PER_DEG_LON = M_PER_DEG_LAT * Math.cos(APOLLO11_SITE.lat * DEG);

/* Landing yaw, ALSJ a11.postland.html. The strut assignment fixes the
   quadrant on its own: the ladder is on the west strut, the minus Y strut
   points south and the minus Z strut points east. The 13.3 degrees is the fine
   correction on top of that, applied here as a clockwise rotation seen from
   above, which in a right handed frame with +Y up is a negative rotation about
   +Y. That puts the ladder a little north of due west. If the reported sign is
   the other way it sits a little south of due west instead, and nothing else in
   this file depends on which. */
const LANDING_YAW = 13.3;
const YAW_Y = -LANDING_YAW * DEG;
const YAW_C = Math.cos(YAW_Y), YAW_S = Math.sin(YAW_Y);

/* Descent stage principal dimensions. The octagon is 4.2 m across the flats and
   the stage is 3.2 m from the footpads to the top deck; the legs span 9.4 m pad
   to pad and each pad is 0.94 m across. */
const OCT_FLATS = 4.20;
const OCT_APO   = OCT_FLATS / 2;                       // 2.10 m, flat to axis
const OCT_R     = OCT_APO / Math.cos(22.5 * DEG);      // 2.273 m, circumradius
const OCT_T0    = -22.5 * DEG;                         // puts flats on the axes
const BODY_Y0 = 1.50, BODY_Y1 = 3.10, DECK_Y = 3.20;
const PAD_SPAN = 9.40, PAD_R = PAD_SPAN / 2;
const PAD_DIA = 0.94;

/* Footpad penetration and skid, SP-214 pp. 35, 46, 89: the pads sank one to
   three inches and "skidded along the surface", dragged south. Four
   centimetres of sink and five of southward skid sit in the middle of both
   reported ranges. The skid is expressed in the authored frame so that it comes
   out southward after the yaw is applied. */
const PAD_SINK = 0.04;
const PAD_SKID = 0.05;

/* --- quality ---------------------------------------------------------------
   The site is drawn on top of a streaming heightfield that has already spent
   the frame budget, so the tiers cut segment counts and then cut whole classes
   of small object. The corner cube array is the one thing that collapses
   completely: a hundred instanced discs become a single panel with a drawn
   grid, which at the distance a player ever sees it from is the same picture
   for one two hundredth of the geometry. */
const TIER = {
  performance: { seg: 6,  pad: 8,  bell: 10, battens: false, cubes: false,
                 prints: 44,  trailStep: 3.2, flagGrid: 3 },
  balanced:    { seg: 6,  pad: 10, bell: 14, battens: false, cubes: true,
                 prints: 90,  trailStep: 2.4, flagGrid: 4 },
  high:        { seg: 8,  pad: 12, bell: 18, battens: true,  cubes: true,
                 prints: 165, trailStep: 1.7, flagGrid: 6 },
  ultra:       { seg: 10, pad: 16, bell: 24, battens: true,  cubes: true,
                 prints: 250, trailStep: 1.2, flagGrid: 8 },
};

/* --- scratch ---------------------------------------------------------------
   Module scope so nothing in the build or in animate() allocates. The two
   prefixed with _a belong to animate() alone and are never borrowed. */
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
const _sc = new THREE.Vector3(1, 1, 1), _up = new THREE.Vector3(0, 1, 0);
const _box = new THREE.Box3();
const _av = new THREE.Vector3(), _aq = new THREE.Quaternion();

/* --- compass helpers -------------------------------------------------------
   Bearings are degrees clockwise from north, which is how every source in
   RESEARCH.md section 2 quotes them. */
const eastOf  = (bearing, d) => d * Math.sin(bearing * DEG);
const northOf = (bearing, d) => d * Math.cos(bearing * DEG);

/** The rotation about +Y that points an object's local +X along a bearing. */
const rotForBearing = (bearing) => (90 - bearing) * DEG;

/** Apply the landing yaw to a point in the authored stage frame. */
function yaw(x, z, out) {
  out.x = x * YAW_C + z * YAW_S;
  out.z = -x * YAW_S + z * YAW_C;
  return out;
}

/* --- what is here ----------------------------------------------------------
   One row per object, with the offsets in metres east and north of the descent
   stage and the source that fixes it. Two rows carry measured coordinates and
   have their offsets derived from those; the rest carry chosen offsets and have
   their coordinates derived instead, which is why both directions of the
   conversion exist below.

   Anything whose position is not published says so in `note`, and its `source`
   says which drawing or which sentence it came from instead. */

/** Offsets from a measured latitude and longitude. */
function offsetsFrom(lat, lon) {
  return {
    offsetEast: (lon - APOLLO11_SITE.lon) * M_PER_DEG_LON,
    offsetNorth: (lat - APOLLO11_SITE.lat) * M_PER_DEG_LAT,
  };
}

/** Latitude and longitude from a chosen offset. */
function coordsFrom(offsetEast, offsetNorth) {
  return {
    lat: APOLLO11_SITE.lat + offsetNorth / M_PER_DEG_LAT,
    lon: APOLLO11_SITE.lon + offsetEast / M_PER_DEG_LON,
  };
}

/* The retroreflector and the seismometer were both located by LROC and by
   laser ranging, so their offsets come out of their coordinates. The rest are
   placed from prose and from site maps. */
const LRRR_LL = { lat: 0.673440, lon: 23.473073 };
const PSEP_LL = { lat: 0.673220, lon: 23.473150 };

/* Bearings and distances for the objects the sources describe in words. The
   distances are documented; where the bearing is not, the row says so. */
const TV_BEARING = 315, TV_RANGE = 20.0;
const FLAG_BEARING = 300, FLAG_RANGE = 8.0;
const SWC_BEARING = 265, SWC_RANGE = 5.5;
const JETT_BEARING = 289, JETT_RANGE = 6.4;

function makeItems() {
  const item = (id, name, e, n, note, source) => {
    const c = coordsFrom(e, n);
    return { id, name, lat: c.lat, lon: c.lon, offsetEast: e, offsetNorth: n, note, source };
  };
  const measured = (id, name, ll, note, source) => {
    const o = offsetsFrom(ll.lat, ll.lon);
    return { id, name, lat: ll.lat, lon: ll.lon,
             offsetEast: o.offsetEast, offsetNorth: o.offsetNorth, note, source };
  };

  return [
    {
      id: 'lm', name: 'LM Eagle, descent stage',
      lat: APOLLO11_SITE.lat, lon: APOLLO11_SITE.lon,
      offsetEast: 0, offsetNorth: 0,
      note: 'descent stage only; the ascent stage lifted off on 21 July 1969',
      source: 'Wagner, Speyerer, Robinson et al. 2012, ISPRS Archives XXXIX-B4:517, Table 2, from 17 LROC NAC images. Landing yaw 13.3 deg and the west ladder strut from ALSJ a11.postland.html.',
    },
    measured('lrrr', 'Laser Ranging Retroreflector', LRRR_LL,
      'still in use; observatories on Earth have ranged to it since August 1969',
      'Williams et al. 2008 via Wagner 2012 Table 1. ALSJ places it "60 feet (18 meters) from the center of the minus-Y (southern) foot pad", which agrees with the 21.6 m at bearing 185 deg these coordinates give.'),
    measured('psep', 'Passive Seismic Experiment Package', PSEP_LL,
      'operated for three weeks and did not survive the first lunar night',
      'Wagner 2012 Table 2. Apollo 11 PSR SP-214 p. 27 records it as placed "behind the large rock to shield the experiment from the effects of liftoff"; ALSJ gives "about 80 feet (24 meters)", against the 28.2 m these coordinates give.'),
    item('tv', 'Television camera and tripod',
      eastOf(TV_BEARING, TV_RANGE), northOf(TV_BEARING, TV_RANGE),
      'distance documented, bearing approximate: the source gives a quadrant and not an angle',
      'ALSJ a11.step.html: set up about 20 m north west of the LM, "the length of the cable".'),
    item('flag', 'US flag, fallen',
      eastOf(FLAG_BEARING, FLAG_RANGE), northOf(FLAG_BEARING, FLAG_RANGE),
      'lying on the ground; distance documented, bearing approximate',
      'Aldrin reported the ascent engine knocked it over, and LRO sees no flag shadow at Apollo 11 where it sees one at 12, 16 and 17 (NASA/LROC 2012). Distance about 27 ft from the LM centreline, staff penetration 6 to 8 in., PSR SP-214 p. 35.'),
    item('swc', 'Solar Wind Composition experiment',
      eastOf(SWC_BEARING, SWC_RANGE), northOf(SWC_BEARING, SWC_RANGE),
      'position approximate',
      'Apollo 11 PSR SP-214 pp. 47-48 and the site maps at Fig. 3-15 and 3-16 show it near the LM, but no numeric offset was ever published, so this position is read off the drawing and is an estimate. The foil sheet itself was rolled up and returned to Earth at the end of the EVA; only the staff was left behind, and only the staff is drawn unless the simulated clock is inside the EVA of 21 July 1969.'),
    item('jettison', 'Two PLSS backpacks and the jettison bag',
      eastOf(JETT_BEARING, JETT_RANGE), northOf(JETT_BEARING, JETT_RANGE),
      'thrown from the porch before liftoff; the pile position is approximate',
      'ALSJ a11.posteva.html and PSR SP-214 Fig. 3-16 place them near the +Z (west) footpad. The footpad itself is fixed by the 9.4 m gear span and the landing yaw; the metre or so past it that puts the pile clear of the pad is not.'),
    item('disturbance', 'Disturbed ground', 0, 0,
      'extent approximate: LROC resolves the trails but not their edges',
      'LROC NAC imaging of the site (NASA/LROC 2012) shows darkened compacted trails radiating from the ladder, the longest running about 60 m east to Little West crater, and a brighter plume-swept halo around the descent stage. PSR SP-214 pp. 35, 45-46, 77 records that the swept ground "does not appear to extend much past the footpads" and that the predicted erosion crater did not form. Armstrong reached Little West crater 60 m east, PSR SP-214 p. 40.'),
  ];
}

/* --- the build kit ---------------------------------------------------------
   Small primitives placed by hand. Nothing here merges, because the whole site
   is a few hundred parts rather than a few thousand and the draw calls are
   cheaper than the code that would collapse them. The kit exists mainly to keep
   a record of every geometry, material and texture, so that dispose() can free
   the marker as well, which by then is not in the scene graph at all. */

class Kit {
  constructor() {
    this.geoms = new Set();
    this.mats = new Set();
    this.texs = new Set();
    this.cast = true;
    this.receive = true;
  }

  geo(g) { this.geoms.add(g); return g; }
  mat(m) { this.mats.add(m); return m; }
  tex(t) { if (t) this.texs.add(t); return t; }

  mesh(parent, g, m) {
    const mesh = new THREE.Mesh(this.geo(g), m);
    mesh.castShadow = this.cast;
    mesh.receiveShadow = this.receive;
    parent.add(mesh);
    return mesh;
  }

  /** A box by centre and size. */
  box(parent, m, cx, cy, cz, sx, sy, sz) {
    const mesh = this.mesh(parent, new THREE.BoxGeometry(sx, sy, sz), m);
    mesh.position.set(cx, cy, cz);
    return mesh;
  }

  cyl(parent, m, cx, cy, cz, rTop, rBot, h, seg, open = false, t0 = 0) {
    const mesh = this.mesh(parent,
      new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, open, t0, Math.PI * 2), m);
    mesh.position.set(cx, cy, cz);
    return mesh;
  }

  /** A tube between two points: struts, rails, cable runs, probe rods. */
  tube(parent, m, ax, ay, az, bx, by, bz, r, seg = 6) {
    _v.set(ax, ay, az);
    _v2.set(bx, by, bz).sub(_v);
    const len = _v2.length() || 1e-4;
    const mesh = this.mesh(parent,
      new THREE.CylinderGeometry(r, r, len, seg, 1, true), m);
    mesh.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    _v2.divideScalar(len);
    mesh.quaternion.setFromUnitVectors(_up, _v2);
    return mesh;
  }

}

/* --- procedural textures ---------------------------------------------------
   Drawn into a canvas at build time. There is no build step in this project and
   no asset pipeline, so a file on disk would be a fetch the page has to wait
   for. In a headless import there is no document and every one of these returns
   null; the materials are all written to look right without their maps, which
   is also what the lower quality tiers get. */

function canvas2d(w, h) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function makeTexture(canvas, srgb) {
  if (!canvas) return null;
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Multi layer insulation. Kapton over a stack of aluminised mylar, taped down
    at the seams and never flat anywhere, which is why every photograph of the
    descent stage shows a surface made entirely of highlights. */
function texMLI(base, seam) {
  const c = canvas2d(128, 128);
  if (!c) return null;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  /* Crinkle: short bright and dark strokes at random angles. A blanket has no
     grain, so neither does this. */
  let s = 0x2f6d3b;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < 340; i++) {
    const x = rnd() * 128, y = rnd() * 128, a = rnd() * Math.PI, l = 3 + rnd() * 11;
    g.strokeStyle = rnd() < 0.5 ? 'rgba(255,242,205,0.10)' : 'rgba(24,16,4,0.13)';
    g.lineWidth = 1 + rnd() * 1.2;
    g.beginPath();
    g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  /* Seams where the panels are taped together. Two of them, because a blanket
     course on the descent stage is around half a metre and the bands here are
     about that: any more and the surface reads as corduroy. */
  g.strokeStyle = seam; g.lineWidth = 2;
  for (let i = 0; i < 2; i++) {
    g.beginPath(); g.moveTo(0, i * 64 + 14); g.lineTo(128, i * 64 + 14); g.stroke();
  }
  const t = makeTexture(c, true);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2.2);
  return t;
}

/** The plaque on the ladder strut. Stainless steel, etched, 23 by 19 cm, so at
    the size it is actually drawn none of this is legible and that is honest:
    what a player sees is a bright rectangle with dark writing on it, which is
    what it looks like from two metres away. */
function texPlaque() {
  const c = canvas2d(256, 212);
  if (!c) return null;
  const g = c.getContext('2d');
  g.fillStyle = '#b9bcc0'; g.fillRect(0, 0, 256, 212);
  g.strokeStyle = '#7d8288'; g.lineWidth = 2; g.strokeRect(6, 6, 244, 200);
  /* The two hemispheres at the top. */
  g.strokeStyle = '#43484d'; g.lineWidth = 2;
  for (const cx of [72, 184]) {
    g.beginPath(); g.arc(cx, 46, 28, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx - 28, 46); g.lineTo(cx + 28, 46); g.stroke();
    g.beginPath(); g.ellipse(cx, 46, 12, 28, 0, 0, Math.PI * 2); g.stroke();
  }
  g.fillStyle = '#2b2f33';
  g.textAlign = 'center';
  g.font = '13px "Times New Roman", serif';
  const lines = ['HERE MEN FROM THE PLANET EARTH',
                 'FIRST SET FOOT UPON THE MOON',
                 'JULY 1969, A.D.',
                 'WE CAME IN PEACE FOR ALL MANKIND'];
  lines.forEach((l, i) => g.fillText(l, 128, 100 + i * 17));
  /* Four signatures, drawn as marks rather than as anybody's hand. */
  g.strokeStyle = '#2b2f33'; g.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    const x = 26 + (i % 2) * 116, y = 180 + Math.floor(i / 2) * 16;
    g.beginPath();
    g.moveTo(x, y);
    g.bezierCurveTo(x + 24, y - 9, x + 48, y + 7, x + 84, y - 3);
    g.stroke();
  }
  return makeTexture(c, true);
}

/** The corner cube array, for the tier that draws it as one panel: a hundred
    dark circles in a ten by ten grid on an aluminium plate. */
function texCubeArray() {
  const c = canvas2d(256, 256);
  if (!c) return null;
  const g = c.getContext('2d');
  g.fillStyle = '#a8aeb4'; g.fillRect(0, 0, 256, 256);
  for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) {
    const x = 12.8 + i * 25.6, y = 12.8 + j * 25.6;
    g.fillStyle = '#1b1f24';
    g.beginPath(); g.arc(x, y, 10.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#6a7178'; g.lineWidth = 1.5;
    g.beginPath(); g.arc(x, y, 10.2, 0, Math.PI * 2); g.stroke();
  }
  return makeTexture(c, true);
}

/** The flag. Fifty stars is more than the weave of a 1.5 m nylon flag would
    resolve at this size, so they are drawn as a grid of dots. The colours are
    deliberately faded: nothing has photographed this flag since 1969, and fifty
    seven years of unfiltered ultraviolet is not a thing dye survives. That is
    an inference and not a measurement, and it is the only appearance judgement
    in this file. */
function texFlag() {
  const c = canvas2d(200, 120);
  if (!c) return null;
  const g = c.getContext('2d');
  const RED = '#8e6a62', WHITE = '#c6c1b6', BLUE = '#5a6072';
  g.fillStyle = WHITE; g.fillRect(0, 0, 200, 120);
  g.fillStyle = RED;
  for (let i = 0; i < 7; i++) g.fillRect(0, i * (120 / 6.5), 200, 120 / 13);
  g.fillStyle = BLUE; g.fillRect(0, 0, 80, 120 * 7 / 13);
  g.fillStyle = '#c9c4b8';
  for (let r = 0; r < 9; r++) {
    const n = r % 2 === 0 ? 6 : 5;
    for (let i = 0; i < n; i++) {
      const x = (r % 2 === 0 ? 7 : 13.5) + i * 13, y = 6 + r * 6.6;
      g.beginPath(); g.arc(x, y, 1.9, 0, Math.PI * 2); g.fill();
    }
  }
  /* Regolith. The side lying on the ground has been in contact with it since
     1969 and lunar dust does not come off. */
  g.fillStyle = 'rgba(96,88,76,0.38)';
  let s = 0x51ac13;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < 300; i++) {
    g.beginPath();
    g.arc(rnd() * 200, rnd() * 120, 1 + rnd() * 7, 0, Math.PI * 2);
    g.fill();
  }
  return makeTexture(c, true);
}

/** One boot print, as an alpha mask. The Apollo overshoe sole was a set of
    transverse ribs, which is exactly why the prints are still sharp: there is
    no wind and no water, and the only thing that erases them is a micrometeorite
    at a rate of a few centimetres per million years. */
function texBootprint() {
  const c = canvas2d(64, 128);
  if (!c) return null;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 64, 128);
  g.fillStyle = '#fff';
  g.beginPath();
  g.ellipse(32, 64, 25, 58, 0, 0, Math.PI * 2);
  g.fill();
  /* The ribs, cut back out. */
  g.fillStyle = 'rgba(0,0,0,0.55)';
  for (let i = 0; i < 11; i++) g.fillRect(4, 12 + i * 10, 56, 4);
  return makeTexture(c, false);
}

/** The one marker. Three short lines of small type on transparent ground. */
function texMarker() {
  const c = canvas2d(512, 176);
  if (!c) return null;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 176);
  g.textAlign = 'center';
  g.fillStyle = '#cdc8bd';
  try { g.letterSpacing = '5px'; } catch (e) { /* older canvas, no tracking */ }
  g.font = '46px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('TRANQUILITY BASE', 256, 52);
  g.fillStyle = '#9d988e';
  g.font = '32px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('APOLLO 11', 256, 104);
  g.font = '28px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText('20 JULY 1969', 256, 148);
  return makeTexture(c, true);
}

/* --- materials -------------------------------------------------------------
   One directional sun, no ambient light, very dark shadows. Under that light a
   surface gets exactly one chance to read, so the albedos are spread wide and
   the metals are held back from fully metallic: with nothing in the sky to
   reflect but the Sun, metalness 1.0 renders as black everywhere it is not
   catching a specular, which is arguably the truth in a vacuum and is
   nonetheless a way to lose the hardware entirely.

   The regolith the descent stage is standing on has a normal albedo of about
   0.07 in Mare Tranquillitatis, so anything the game wants a player to see has
   to sit well above that. Aged gold, amber and white blanket all do. The dusted
   variants at the end do not, and that is the point of them: everything below
   about a metre at an Apollo site is the colour of the ground, because lunar
   dust is electrostatically charged, angular, and cannot be brushed off. Every
   crew came home with grey suits from the knees down. */

function makeMaterials(kit, q) {
  const std = (o) => kit.mat(new THREE.MeshStandardMaterial(o));
  const M = {};

  /* Multi layer insulation, in two shades: the amber Kapton over the quadrant
     bays and a darker gold on the structure between them.

     The map carries no hue of its own. It is crinkle and seams on a near
     neutral ground, and the colour comes from the material. Painting the hue
     into both multiplies it, and the descent stage comes out the colour of a
     traffic cone rather than of aged Kapton. */
  M.foilAmber = std({ color: 0xb9862f, roughness: 0.40, metalness: 0.50,
                      map: kit.tex(texMLI('#c6c0b4', 'rgba(52,42,26,0.40)')) });
  M.foilGold  = std({ color: 0xa5761f, roughness: 0.33, metalness: 0.58,
                      map: kit.tex(texMLI('#bcb6aa', 'rgba(44,34,18,0.45)')) });
  /* Black blanketing. Held at about 0.05 rather than at zero: a genuinely black
     surface next to a black sky in a scene with no ambient is not a shape, it
     is a hole. */
  M.blanket   = std({ color: 0x24242a, roughness: 0.88, metalness: 0.06 });
  M.white     = std({ color: 0xcfcabd, roughness: 0.9,  metalness: 0.0 });
  M.alum      = std({ color: 0xb0b5ba, roughness: 0.42, metalness: 0.66 });
  M.steel     = std({ color: 0xc2c6ca, roughness: 0.28, metalness: 0.7 });
  /* The descent engine bell and the base heat shield. Ablative and sooted, and
     on Apollo 11 it never touched the ground. */
  M.ablative  = std({ color: 0x2e2a26, roughness: 0.82, metalness: 0.12 });
  M.dark      = std({ color: 0x2c2e31, roughness: 0.74, metalness: 0.2 });

  /* Regolith on hardware. Two strengths: a light coating for things that stood
     in the plume, and the full colour of the ground for things lying on it. */
  M.dusted    = std({ color: 0x6f6759, roughness: 0.95, metalness: 0.04 });
  M.dustedDark  = std({ color: 0x5e564b, roughness: 0.97, metalness: 0.02 });

  /* Fused silica corner cubes. Very smooth, nearly black in diffuse, and with
     an emissive term that animate() drives. The real array has lost roughly a
     factor of ten in return since 1969 and dust on the front faces is one of
     the leading explanations, so this is not a mirror. */
  M.silica    = std({ color: 0x14171c, roughness: 0.05, metalness: 0.1,
                      emissive: 0xfff0d2, emissiveIntensity: 0.0 });
  /* Only the tier that draws the array as one quad needs a drawn array. */
  M.cubePanel = q.cubes ? null
    : std({ color: 0xa8aeb4, roughness: 0.4, metalness: 0.5,
            map: kit.tex(texCubeArray()) });
  /* Solar cells on the seismometer wings. */
  M.solar     = std({ color: 0x2a3450, roughness: 0.25, metalness: 0.35 });
  /* Bare aluminium foil, for the Solar Wind Composition sheet. This is the one
     thing at the site that is a mirror by design. */
  M.foilSheet = std({ color: 0xd6d9dc, roughness: 0.16, metalness: 0.8,
                      side: THREE.DoubleSide });
  M.flag      = std({ color: 0xa9a498, roughness: 0.94, metalness: 0.0,
                      map: kit.tex(texFlag()), side: THREE.DoubleSide });
  M.beta      = std({ color: 0xb9b3a5, roughness: 0.92, metalness: 0.0 });

  /* --- ground decals -------------------------------------------------------
     Trails and boot prints darken, the plume swept halo brightens, for the
     reason set out in the file header. All three are plain Lambert diffuse
     where the terrain underneath runs a Hapke style regolith BRDF with an
     opposition surge, so a decal automatically loses the surge the terrain has,
     which is conveniently the right behaviour for soil whose fairy castle
     structure a boot has just crushed. None of them writes depth.

     A decal is held off the terrain by a couple of centimetres of lift and by
     nothing else. Polygon offset was the obvious alternative and is the wrong
     tool here: it pulls a decal forward in depth by enough to punch through the
     things that are also lying on this ground, and the boot prints came out
     drawn over the top of the flag and the equipment bay covers. The lift is
     unambiguous, and everything resting on the surface is seated above the
     tallest decal. */
  M.trail = std({ color: 0x3c3833, roughness: 1.0, metalness: 0.0,
                  transparent: true, depthWrite: false, vertexColors: true });
  M.swept = std({ color: 0x8b8172, roughness: 1.0, metalness: 0.0,
                  transparent: true, depthWrite: false, vertexColors: true });
  M.print = std({ color: 0x322f2b, roughness: 1.0, metalness: 0.0,
                  transparent: true, depthWrite: false, vertexColors: true,
                  alphaMap: kit.tex(texBootprint()) });

  /* --- the marker ----------------------------------------------------------
     Off by default and built only if asked for. A hairline and small type. The
     emissive on the caption is the least that keeps it legible on the night
     side, and it is kept low deliberately: this site does not need a glow. */
  M.markerLine = std({ color: 0x8e8a82, roughness: 0.5, metalness: 0.2,
                       emissive: 0x30302e, emissiveIntensity: 0.5 });
  M.markerText = std({ color: 0x000000, roughness: 1.0, metalness: 0.0,
                       map: kit.tex(texMarker()),
                       emissive: 0xffffff, emissiveIntensity: 0.30,
                       transparent: true, depthWrite: false });
  if (M.markerText.map) M.markerText.emissiveMap = M.markerText.map;

  /* Dust rule: what each clean material turns into when the part it is on sits
     below about a metre. Applied by height after the build, so a part that
     moves does not have to remember. */
  M.dustMap = new Map([
    [M.foilAmber, M.dusted], [M.foilGold, M.dusted], [M.alum, M.dusted],
    [M.white, M.dusted], [M.blanket, M.dustedDark], [M.steel, M.dusted],
    [M.beta, M.dusted],
  ]);
  return M;
}

/** Swap materials on anything whose geometry sits entirely below `yLimit`.
    Instanced meshes are skipped: their geometry bounds say nothing about where
    the instances are, so those are assigned by hand where they are built. */
function dustBelow(root, dustMap, yLimit) {
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const swap = dustMap.get(o.material);
    if (!swap) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    _box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    if (_box.max.y < yLimit) o.material = swap;
  });
}

/* --- LM Eagle, descent stage -----------------------------------------------
   The ascent stage is not here. It lifted off at 17:54 UTC on 21 July 1969,
   docked, was jettisoned in lunar orbit and eventually hit the surface at an
   unknown place, so what stands at Tranquility Base is the bottom half: an
   octagonal box 4.2 m across the flats, 3.2 m from the pads to the top deck,
   on four legs spanning 9.4 m.

   The octagon is authored with its flats on the axes and the legs running out
   along them, which is the real arrangement: the four propellant and helium
   bays sit behind the chamfers on the diagonals, and the landing gear
   outriggers come out of the middle of each flat. That is why the ladder is in
   line with a leg rather than beside one.

   The whole stage is then yawed by the landing yaw, so anything positioned in
   this function is in the stage's own frame and comes out rotated. */

function buildDescentStage(kit, M, q) {
  const g = new THREE.Group();
  g.name = 'lmDescentStage';
  g.rotation.y = YAW_Y;

  /* --- the body ------------------------------------------------------------
     The colour is organised by face and not by height, which matters more than
     it sounds: horizontal bands of gold and black make a barrel, and the
     descent stage is not a barrel, it is a dark box with four bright quadrant
     bays let into its corners.

     The four flats the legs come out of are the ends of the cruciform beams and
     are dark, with a gold skirt at the bottom where the blanket wraps under the
     tank bulges. The four chamfers between them are the quadrant bays, and
     those are the amber Kapton that everybody remembers. */
  kit.cyl(g, M.blanket, 0, (BODY_Y0 + 2.92) / 2, 0, OCT_R, OCT_R,
          2.92 - BODY_Y0, 8, true, OCT_T0);
  kit.cyl(g, M.alum, 0, 3.01, 0, OCT_R * 1.004, OCT_R * 1.004, 0.18, 8, true, OCT_T0);

  const FACE_W = 2 * OCT_APO * Math.tan(22.5 * DEG);      // 1.74 m per side
  for (let k = 0; k < 8; k++) {
    const a = k * 45 * DEG;
    const nx = Math.sin(a), nz = Math.cos(a);
    const r = OCT_APO + 0.014;
    /* Even faces sit on the axes and carry the legs; odd faces are the bays. */
    const legFace = (k % 2) === 0;
    const panel = (mat, y0, y1) => {
      const m = kit.mesh(g, new THREE.PlaneGeometry(FACE_W - 0.06, y1 - y0), mat);
      m.position.set(nx * r, (y0 + y1) / 2, nz * r);
      m.rotation.y = a;
      return m;
    };
    if (legFace) panel(M.foilGold, 1.54, 2.06);
    else panel(M.foilAmber, 1.56, 2.84);
  }

  /* Top deck. The ascent stage sat on this and left when it went: the four
     attach fittings, the interstage umbilical stub and a torn blanket edge are
     all that is up there now. Nobody has photographed it since. */
  kit.cyl(g, M.alum, 0, (BODY_Y1 + DECK_Y) / 2, 0, OCT_R * 0.96, OCT_R * 0.99,
          DECK_Y - BODY_Y1, 8, true, OCT_T0);
  const deck = kit.mesh(g, new THREE.CircleGeometry(OCT_R * 0.96, 8, OCT_T0), M.alum);
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = DECK_Y;
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 + 45) * DEG;
    const x = Math.sin(a) * 0.78, z = Math.cos(a) * 0.78;
    kit.box(g, M.steel, x, DECK_Y + 0.06, z, 0.20, 0.12, 0.20);
  }
  kit.cyl(g, M.dark, 0.0, DECK_Y + 0.13, 0.62, 0.11, 0.11, 0.26, 8);
  kit.box(g, M.blanket, -0.55, DECK_Y + 0.04, -0.30, 0.62, 0.08, 0.44);

  /* Vertical battens over the blanket seams, on every face. Straps rather than
     structure: the blankets are held down against nothing at all, because there
     is no air to lift them, but they still have to survive a launch. */
  if (q.battens) {
    for (let k = 0; k < 8; k++) {
      const a = k * 45 * DEG;
      const nx = Math.sin(a), nz = Math.cos(a);
      const tx = Math.cos(a), tz = -Math.sin(a);
      for (const u of [-0.62, 0, 0.62]) {
        const r = OCT_APO + 0.018;
        const b = kit.box(g, M.dark, nx * r + tx * u, 2.30, nz * r + tz * u,
                          0.045, 1.56, 0.014);
        b.rotation.y = a;
      }
    }
  }

  /* --- base and descent engine ---------------------------------------------
     The base heat shield closes the bottom of the box, and the descent
     propulsion system nozzle hangs through it. Nozzle exit 1.51 m across. On
     Apollo 11 the bell came within about half a metre of the surface and did
     not touch, and the crew commented on how little of a crater it dug: SP-214
     records that the swept ground did not extend much past the footpads and
     that the erosion crater predicted before the flight simply did not form. */
  const shield = kit.mesh(g, new THREE.CircleGeometry(OCT_R * 0.99, 8, OCT_T0), M.ablative);
  shield.rotation.x = Math.PI / 2;
  shield.position.y = BODY_Y0 - 0.01;
  kit.cyl(g, M.ablative, 0, BODY_Y0 - 0.12, 0, 0.42, 0.30, 0.26, q.bell, true);
  kit.cyl(g, M.ablative, 0, 0.90, 0, 0.24, 0.755, 1.00, q.bell, true);
  kit.cyl(g, M.dark, 0, 0.42, 0, 0.755, 0.745, 0.06, q.bell, true);

  /* --- landing gear --------------------------------------------------------
     One leg per flat: west carries the ladder and the porch, the other three
     carry lunar contact probes. Apollo 11 flew with the probe removed from the
     ladder leg, out of a worry that a bent probe would be in the way of the
     first person down. Every later mission kept that change. */
  const legs = [
    { dx: -1, dz: 0, ladder: true,  probe: false },   // west, the ladder strut
    { dx: 1,  dz: 0, ladder: false, probe: true },    // east
    { dx: 0,  dz: -1, ladder: false, probe: true },   // north
    { dx: 0,  dz: 1, ladder: false, probe: true },    // south
  ];
  for (const leg of legs) buildLeg(kit, M, q, g, leg);

  /* --- scientific equipment bay --------------------------------------------
     Quadrant II, which is the corner bay diagonally opposite the equipment
     table and so on the far side from the ladder: an astronaut coming down
     faces the vehicle with north on their left, and this is round to that side.
     Aldrin took the retroreflector and the seismometer out of it, and the
     covers came off and were left on the ground, which is where photographs at
     the end of the EVA show them. Which of the four chamfers it is comes from
     photographs rather than from a drawing, so the bearing is approximate; that
     the covers are lying on the surface is not. */
  const bay = new THREE.Group();
  bay.rotation.y = 135 * DEG;
  g.add(bay);
  kit.box(bay, M.dark, 0, 2.22, OCT_APO - 0.05, 1.30, 0.96, 0.10);
  kit.box(bay, M.alum, 0, 2.74, OCT_APO - 0.02, 1.38, 0.08, 0.16);
  kit.box(bay, M.alum, 0, 1.72, OCT_APO - 0.02, 1.38, 0.08, 0.16);
  /* The covers, on the ground beyond the bay, dust side down. Seated at five
     centimetres rather than at zero so that they sit clear of the boot print
     decals, which is the same reason the flag and the contact probes are. */
  const c1 = kit.box(bay, M.alum, -0.42, 0.052, 3.30, 1.20, 0.024, 0.88);
  c1.rotation.y = 0.34;
  const c2 = kit.box(bay, M.alum, 0.66, 0.050, 2.98, 1.12, 0.024, 0.80);
  c2.rotation.y = -0.62;

  return g;
}

/** One landing gear leg, in the stage frame. `dx, dz` is the outward unit
    direction along a flat; `sx, sz` is the sideways unit. */
function buildLeg(kit, M, q, g, leg) {
  const { dx, dz } = leg;
  const sx = dz, sz = -dx;
  const out = (r, u = 0) => [dx * r + sx * u, dz * r + sz * u];

  /* The skid. The pads dragged south at touchdown, so the offset is expressed
     here in the stage frame, un-yawed, and comes out southward once the stage
     rotation is applied. */
  const skidX = -YAW_S * PAD_SKID, skidZ = YAW_C * PAD_SKID;

  /* Primary strut: from the top outer corner of the box down and out to the
     pad, about thirty degrees off vertical, with the shock absorber cartridge
     inside it. 0.23 m outside diameter, and dark rather than bare: the struts
     are wrapped in Kapton over thermal paint, and in every surface photograph
     they read as black tubes with a gold collar down near the pad, not as
     polished metal. */
  const [ax, az] = out(1.94);
  const ay = 2.86;
  const [fx, fz] = out(PAD_R);
  const px = fx + skidX, pz = fz + skidZ;
  const padY = 0.10 - PAD_SINK;                        // pad centre height
  kit.tube(g, M.dark, ax, ay, az, px, padY + 0.14, pz, 0.115, q.seg);

  /* Secondary struts, two per leg, from the lower corners of the box out to the
     primary near the pad. */
  for (const side of [-1, 1]) {
    const [bx, bz] = out(1.62, side * 0.80);
    const [cx, cz] = out(PAD_R - 0.55, side * 0.11);
    kit.tube(g, M.dark, bx, 1.58, bz, cx + skidX, padY + 0.55, cz + skidZ, 0.048, q.seg);
  }
  /* Deployment truss, two per leg, from the upper corners down to the primary
     at about a third of its length. These are what held the gear folded inside
     the SLA shroud on the way out. */
  for (const side of [-1, 1]) {
    const [bx, bz] = out(1.86, side * 0.66);
    const [cx, cz] = out(2.94, side * 0.07);
    kit.tube(g, M.dark, bx, 2.66, bz, cx + skidX, 2.02, cz + skidZ, 0.036, q.seg);
  }

  /* Footpad. 0.94 m across, a shallow dish of crushable honeycomb, sunk the
     four centimetres SP-214's one to three inch range brackets. */
  kit.cyl(g, M.alum, px, padY, pz, PAD_DIA / 2, PAD_DIA / 2 * 0.86, 0.16, q.pad);
  kit.cyl(g, M.alum, px, padY + 0.14, pz, 0.13, 0.17, 0.14, q.pad);
  kit.cyl(g, M.foilGold, px, padY + 0.34, pz, 0.125, 0.125, 0.26, q.seg, true);

  /* Lunar contact probe. 1.7 m of rod hanging below the pad, wired to a light
     in the cabin. Both crew called the contact light and then, in the checklist
     order they had rehearsed, shut the engine down. The probes bent on landing
     and photographs show them lying along the surface, so that is how they are
     drawn: a short drop from the pad and then a run out along the ground. */
  if (leg.probe) {
    const [ex, ez] = out(PAD_R + 0.34);
    const [gx, gz] = out(PAD_R + 1.62);
    kit.tube(g, M.dark, px + dx * 0.42, padY - 0.02, pz + dz * 0.42,
             ex + skidX, 0.056, ez + skidZ, 0.011, 5);
    kit.tube(g, M.dark, ex + skidX, 0.056, ez + skidZ,
             gx + skidX, 0.048, gz + skidZ, 0.011, 5);
    kit.cyl(g, M.dark, gx + skidX, 0.058, gz + skidZ, 0.028, 0.028, 0.05, 6);
  }

  if (leg.ladder) buildLadderAndPorch(kit, M, q, g, leg, px, pz, padY);
}

/** The ladder, the porch above it, and the plaque on the strut.
    Nine rungs, 0.58 m wide, on the west strut. Armstrong came down these at
    02:56 UTC on 21 July 1969, stood on the pad, and said what he said. */
function buildLadderAndPorch(kit, M, q, g, leg, px, pz, padY) {
  const { dx, dz } = leg;
  const sx = dz, sz = -dx;
  /* The ladder hangs vertically off the porch, just inboard of the primary
     strut, and the strut leans out past it on the way down. The lowest rung
     ends up about 0.7 m above the footpad, which is the gap Armstrong had to
     jump back up for and reported on. */
  const RAD = 2.76;
  const HALF = 0.29;                // rungs 0.58 m across
  const Y0 = 0.66, Y1 = 2.84;
  const at = (u, y) => [dx * RAD + sx * u, y, dz * RAD + sz * u];
  /* Where the primary strut is at a given height, so the stand-offs reach the
     thing they are actually bolted to. */
  const strutR = (y) => 1.94 + (2.86 - y) / 2.62 * 2.76;

  for (const side of [-1, 1]) {
    const a = at(side * HALF, Y0), b = at(side * HALF, Y1);
    kit.tube(g, M.alum, a[0], a[1], a[2], b[0], b[1], b[2], 0.024, q.seg);
  }
  for (let i = 0; i < 9; i++) {
    const y = Y0 + i * (Y1 - Y0) / 8;
    const c = at(0, y);
    const r = kit.box(g, M.alum, c[0], c[1], c[2], 0.60, 0.022, 0.05);
    r.rotation.y = Math.atan2(dx, dz);
  }
  /* Two stand-off brackets out to the primary strut. */
  for (const y of [1.06, 1.78]) {
    const c = at(0, y);
    const r = strutR(y);
    kit.tube(g, M.alum, c[0], c[1], c[2], dx * r, y, dz * r, 0.018, 5);
  }

  /* The porch. A grating platform outside the forward hatch, at the top of the
     ladder, with a handrail on the far side. About 0.86 by 0.90 m. */
  const porchY = 2.92;
  const pcx = dx * 2.50, pcz = dz * 2.50;
  const porch = kit.box(g, M.alum, pcx, porchY, pcz, 0.92, 0.05, 0.82);
  porch.rotation.y = Math.atan2(dx, dz);
  /* A low rail across the outboard edge, hip high to somebody kneeling to get
     through a hatch that is not quite a metre square. */
  const railY = porchY + 0.38;
  for (const side of [-1, 1]) {
    const a = at(side * 0.44, porchY + 0.02), b = at(side * 0.44, railY);
    kit.tube(g, M.alum, a[0], a[1], a[2], b[0], b[1], b[2], 0.018, 5);
  }
  const h0 = at(-0.44, railY), h1 = at(0.44, railY);
  kit.tube(g, M.alum, h0[0], h0[1], h0[2], h1[0], h1[1], h1[2], 0.018, 5);

  /* The plaque. 23 by 19 cm of stainless steel bolted to the ladder strut,
     unveiled by Armstrong during the EVA and read aloud on the air. It is on
     the strut and not on the ladder, facing outward, so it is the first thing
     anybody walking up to the vehicle sees. */
  const plaqueY = 1.62;
  const pr = strutR(plaqueY) + 0.12;
  const back = kit.box(g, M.steel, dx * pr, plaqueY, dz * pr, 0.25, 0.21, 0.02);
  back.rotation.y = Math.atan2(dx, dz);
  const face = kit.mesh(g, new THREE.PlaneGeometry(0.23, 0.19),
    kit.mat(new THREE.MeshStandardMaterial({
      color: 0xc9ccd0, roughness: 0.3, metalness: 0.6, map: kit.tex(texPlaque()),
    })));
  face.position.set(dx * (pr + 0.012), plaqueY, dz * (pr + 0.012));
  face.rotation.y = Math.atan2(dx, dz);
}

/* --- Laser Ranging Retroreflector ------------------------------------------
   The only thing at Tranquility Base that is still working. A hundred fused
   silica corner cubes, 3.8 cm across, in a ten by ten array on a 46 cm
   aluminium panel, with a folding sun shade and a small tilting mount. It needs
   no power and it will not wear out; observatories have been ranging to it
   since August 1969 and the Earth to Moon distance is known to a few
   millimetres because of it.

   The panel is aimed at Earth, which from 23.47 east is about 23.5 degrees off
   the local vertical towards the west. Libration walks the sub Earth point
   around by eight degrees or so either way over a month, and the corner cubes
   have enough acceptance angle to not care.

   Returns the panel so that animate() can find the glint. */
function buildLRRR(kit, M, q) {
  const g = new THREE.Group();
  g.name = 'lrrr';

  /* Pallet and legs. It sits on the surface on three short feet and was
     levelled by hand with a bubble and aligned with a sun compass, which is
     the whole of its deployment procedure. */
  kit.box(g, M.alum, 0, 0.10, 0, 0.62, 0.05, 0.56);
  for (const [x, z] of [[-0.26, 0.22], [0.26, 0.22], [0, -0.24]]) {
    kit.cyl(g, M.alum, x, 0.05, z, 0.022, 0.045, 0.10, 6);
  }
  /* Carry handle, which is also how it was set down. */
  kit.tube(g, M.alum, -0.20, 0.30, -0.26, 0.20, 0.30, -0.26, 0.014, 5);
  kit.tube(g, M.alum, -0.20, 0.13, -0.26, -0.20, 0.30, -0.26, 0.014, 5);
  kit.tube(g, M.alum, 0.20, 0.13, -0.26, 0.20, 0.30, -0.26, 0.014, 5);

  /* The tilt. Rotating about +Z swings the panel normal towards -X, which is
     west, which is where Earth is from here. */
  const tilt = new THREE.Group();
  tilt.position.set(0, 0.14, 0);
  tilt.rotation.z = 23.5 * DEG;
  g.add(tilt);

  const panel = kit.box(tilt, M.alum, 0, 0.03, 0, 0.50, 0.05, 0.50);

  /* The array itself. One instanced disc per corner cube at the tiers that can
     afford it, a drawn panel at the tier that cannot. The instanced version
     carries the emissive material animate() drives, and the flat version
     carries the same material on a single quad, so the glint works either way. */
  let glint;
  if (q.cubes) {
    const cell = new THREE.CircleGeometry(0.019, 8);
    kit.geo(cell);
    const arr = new THREE.InstancedMesh(cell, M.silica, 100);
    arr.castShadow = false;
    arr.receiveShadow = false;
    for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) {
      _v.set((i - 4.5) * 0.042, 0.056, (j - 4.5) * 0.042);
      _q.setFromAxisAngle(_v2.set(1, 0, 0), -Math.PI / 2);
      _m.compose(_v, _q, _sc);
      arr.setMatrixAt(j * 10 + i, _m);
    }
    arr.instanceMatrix.needsUpdate = true;
    tilt.add(arr);
    glint = arr;
  } else {
    const flat = kit.mesh(tilt, new THREE.PlaneGeometry(0.44, 0.44), M.cubePanel);
    flat.rotation.x = -Math.PI / 2;
    flat.position.y = 0.056;
    /* A second, coincident quad carries the glint so the drawn panel keeps its
       ordinary shading underneath it. */
    const sheen = kit.mesh(tilt, new THREE.PlaneGeometry(0.44, 0.44), M.silica);
    sheen.rotation.x = -Math.PI / 2;
    sheen.position.y = 0.058;
    sheen.castShadow = false;
    glint = sheen;
  }

  /* The array sits in a shallow recessed frame, and one folding plate stands up
     along the sunward edge. Both exist for the same reason: a low sun getting
     in sideways would put a thermal gradient across the silica, and a corner
     cube with a gradient across it does not send the beam back where it came
     from. */
  for (const side of [-1, 1]) {
    kit.box(tilt, M.alum, side * 0.235, 0.075, 0, 0.03, 0.05, 0.50);
    kit.box(tilt, M.alum, 0, 0.075, side * 0.235, 0.50, 0.05, 0.03);
  }
  const shade = kit.mesh(tilt, new THREE.PlaneGeometry(0.48, 0.20), M.alum);
  shade.position.set(0.245, 0.155, 0);
  shade.rotation.set(0, -Math.PI / 2, -1.15);

  return { group: g, panel, glint };
}

/* --- Passive Seismic Experiment Package ------------------------------------
   The other half of EASEP. A low box with two solar panel wings folded out
   either side, on a levelling mount, placed twenty eight metres south and
   behind a large rock so that the ascent stage liftoff would not knock it over.
   It returned data for three weeks and then failed in the first lunar night,
   which is what a package with no radioisotope heater does at 90 K. */
function buildPSEP(kit, M) {
  const g = new THREE.Group();
  g.name = 'psep';

  /* Levelling mount: a shallow tripod stool with a ball joint. */
  for (const [x, z] of [[-0.20, 0.16], [0.20, 0.16], [0, -0.22]]) {
    kit.cyl(g, M.alum, x, 0.06, z, 0.02, 0.05, 0.12, 6);
    kit.tube(g, M.alum, x, 0.11, z, 0, 0.24, 0, 0.014, 5);
  }
  kit.cyl(g, M.alum, 0, 0.25, 0, 0.05, 0.05, 0.05, 8);

  /* The instrument box, with its thermal skirt. */
  kit.box(g, M.white, 0, 0.42, 0, 0.46, 0.30, 0.39);
  kit.box(g, M.blanket, 0, 0.27, 0, 0.54, 0.05, 0.47);
  kit.box(g, M.alum, 0, 0.59, 0, 0.40, 0.04, 0.34);
  /* The gnomon and the small dome the crew used to level and align it. */
  kit.cyl(g, M.alum, 0.14, 0.64, 0.10, 0.035, 0.035, 0.06, 8);
  kit.cyl(g, M.dark, -0.15, 0.63, -0.10, 0.025, 0.025, 0.05, 6);

  /* Two solar panel wings, unfolded either side. The array had to be pointed
     at the sun by hand, which is why the whole package needed levelling first. */
  for (const side of [-1, 1]) {
    const hinge = new THREE.Group();
    hinge.position.set(side * 0.24, 0.44, 0);
    hinge.rotation.z = -side * 6 * DEG;
    g.add(hinge);
    kit.box(hinge, M.solar, side * 0.31, 0, 0, 0.60, 0.012, 0.46);
    kit.box(hinge, M.alum, side * 0.31, -0.012, 0, 0.62, 0.012, 0.48);
    kit.tube(hinge, M.alum, 0, 0, -0.18, 0, 0, 0.18, 0.012, 5);
  }
  return g;
}

/* --- television camera -----------------------------------------------------
   The Westinghouse lunar surface camera, on its tripod, set up about twenty
   metres north west of the LM at the end of its cable and left pointing back at
   the vehicle. Six hundred million people watched the EVA through it. The
   distance is the length of the cable and is documented; the exact bearing is
   not, so this is a quadrant and a range. */
function buildTVCamera(kit, M, toLMBearing) {
  const g = new THREE.Group();
  g.name = 'tvCamera';

  const H = 0.62;
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 + 30) * DEG;
    const x = Math.sin(a) * 0.30, z = Math.cos(a) * 0.30;
    kit.tube(g, M.alum, x, 0.0, z, 0, H, 0, 0.014, 5);
    kit.cyl(g, M.alum, x, 0.015, z, 0.02, 0.05, 0.03, 6);
  }
  kit.cyl(g, M.alum, 0, H + 0.02, 0, 0.045, 0.055, 0.06, 8);

  /* The camera itself, aimed back at the lunar module. */
  const head = new THREE.Group();
  head.position.set(0, H + 0.14, 0);
  head.rotation.y = rotForBearing(toLMBearing);
  g.add(head);
  kit.box(head, M.white, 0, 0, 0, 0.20, 0.16, 0.27);
  kit.box(head, M.blanket, 0, 0.10, 0, 0.16, 0.05, 0.22);
  kit.cyl(head, M.dark, 0.13, 0, 0, 0.05, 0.05, 0.10, 10).rotation.z = Math.PI / 2;
  kit.cyl(head, M.alum, 0.19, 0, 0, 0.055, 0.05, 0.03, 10).rotation.z = Math.PI / 2;

  return g;
}

/** A slack cable lying on the ground between two points, drawn as a run of
    tubes with a little wander. Deterministic, so it does not change between
    loads. */
function buildCable(kit, M, parent, x0, z0, x1, z1, seed) {
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const n = 12;
  let px = x0, pz = z0;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    /* A cable paid out by somebody walking backwards does not lie straight. */
    const wob = Math.sin(t * Math.PI) * (rnd() - 0.5) * 1.6;
    const nx = x0 + (x1 - x0) * t - (z1 - z0) / Math.hypot(x1 - x0, z1 - z0) * wob;
    const nz = z0 + (z1 - z0) * t + (x1 - x0) / Math.hypot(x1 - x0, z1 - z0) * wob;
    kit.tube(parent, M.dark, px, 0.046, pz, nx, 0.046, nz, 0.008, 4);
    px = nx; pz = nz;
  }
}

/* --- the flag, fallen ------------------------------------------------------
   The Lunar Flag Assembly: a 1.52 by 0.91 m nylon flag on a 2.44 m two piece
   staff with a telescoping horizontal crossbar to hold it out, because there is
   no air to hold it out instead. Aldrin drove the staff in six to eight inches,
   which was as far as it would go.

   It is not standing. Aldrin saw it go over in the ascent engine exhaust, and
   LRO can resolve the shadows of the Apollo 12, 16 and 17 flags where at
   Apollo 11 there is nothing. So the assembly lies flat, pointing away from the
   lunar module, which is the direction the plume pushed it. This is the single
   most important accuracy point in the file, and the reason it is worth being
   careful about is that a standing flag here is the thing everybody expects to
   see and it has not been there since 1969. */
function buildFlag(kit, M, q) {
  const g = new THREE.Group();
  g.name = 'flagFallen';

  /* Local +X runs out along the staff from the base. Everything is a few
     centimetres off the ground, because a flag lying on regolith is not a flat
     plane and never was. */
  kit.tube(g, M.alum, 0.0, 0.052, 0, 1.24, 0.058, 0.02, 0.012, 6);
  kit.tube(g, M.alum, 1.24, 0.058, 0.02, 2.44, 0.054, 0.06, 0.011, 6);
  /* The crossbar, at the top of the staff, now lying across the ground. */
  kit.tube(g, M.alum, 2.30, 0.056, 0.04, 2.30, 0.056, -1.50, 0.009, 5);

  /* The fabric. Rumpled by displacing the plane's own normal before it is laid
     down, so the cloth reads as cloth under a hard light rather than as a
     printed rectangle. */
  const n = q.flagGrid;
  const geo = kit.geo(new THREE.PlaneGeometry(0.91, 1.52, n, n));
  const pos = geo.attributes.position;
  let s = 0x1f7cd3;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i), v = pos.getY(i);
    pos.setZ(i, 0.018 * Math.sin(u * 7.1 + 1.2) * Math.cos(v * 4.3)
                + 0.012 * (rnd() - 0.5));
  }
  geo.computeVertexNormals();
  const cloth = kit.mesh(g, geo, M.flag);
  cloth.rotation.x = -Math.PI / 2;
  cloth.position.set(1.845, 0.048, -0.75);
  cloth.castShadow = false;

  return g;
}

/* --- Solar Wind Composition ------------------------------------------------
   An aluminium foil sheet on a staff, unrolled facing the sun for 77 minutes
   so that solar wind ions would embed themselves in it. Its position is on the
   SP-214 site maps and nowhere else: no numeric offset was ever published, so
   what is here is read off a drawing and is an estimate, and the items entry
   says exactly that.

   One further thing the geometry cannot say for itself. The foil was rolled up
   and carried home for analysis in Bern; only the staff was left on the Moon.
   So the sheet is built, on a mesh called swcFoil, and shown only when the
   simulated clock is inside the EVA of 21 July 1969 — see setEpoch() at the
   end of this file. The default scene is the site as it stands today, which is
   a staff and no foil. */
function buildSWC(kit, M) {
  const g = new THREE.Group();
  g.name = 'swc';
  /* The staff, driven in and leaning slightly, because everything driven into
     regolith by hand leans slightly. */
  const lean = new THREE.Group();
  lean.rotation.z = 5 * DEG;
  g.add(lean);
  kit.cyl(lean, M.alum, 0, 0.72, 0, 0.011, 0.013, 1.44, 6);
  kit.cyl(lean, M.dark, 0, 1.46, 0, 0.022, 0.022, 0.06, 8);
  kit.tube(lean, M.alum, -0.16, 1.44, 0, 0.16, 1.44, 0, 0.008, 5);

  const foil = kit.mesh(lean, new THREE.PlaneGeometry(0.30, 1.06), M.foilSheet);
  foil.name = 'swcFoil';
  foil.position.set(0, 0.92, 0.013);
  foil.castShadow = false;
  return g;
}

/* --- jettisoned equipment --------------------------------------------------
   Before liftoff the crew threw everything they were not taking out of the
   hatch to save ascent mass: two portable life support system backpacks, the
   jettison bag, boots, urine bags and armrests. The two backpacks and the bag
   are the pieces the site maps mark, near the west footpad and roughly under
   the porch, which is where somebody standing in a hatch would put them. */
function buildJettison(kit, M) {
  const g = new THREE.Group();
  g.name = 'jettison';

  /* A PLSS is about 0.66 by 0.46 by 0.25 m and it is the heaviest thing either
     of them handled all day, at 47 kg on Earth. */
  const plss = (x, z, rot, tip) => {
    const b = new THREE.Group();
    b.position.set(x, 0, z);
    b.rotation.set(0, rot, tip);
    g.add(b);
    kit.box(b, M.white, 0, 0.13, 0, 0.66, 0.25, 0.46);
    kit.box(b, M.blanket, 0, 0.26, 0, 0.52, 0.03, 0.36);
    kit.cyl(b, M.alum, 0.24, 0.20, 0.18, 0.035, 0.035, 0.16, 6);
  };
  plss(0, 0, 0.4, 0.06);
  plss(0.86, -0.42, -0.9, -0.10);

  /* The jettison bag: beta cloth, and by the time it was thrown it had a day's
     worth of dust on it. */
  const bag = new THREE.Group();
  bag.position.set(0.30, 0, 0.74);
  bag.rotation.y = 1.1;
  g.add(bag);
  kit.box(bag, M.beta, 0, 0.16, 0, 0.60, 0.32, 0.42);
  kit.box(bag, M.beta, 0.10, 0.33, -0.05, 0.30, 0.06, 0.22);

  return g;
}

/* --- disturbed ground ------------------------------------------------------
   Everything here is a flat decal a few centimetres above the terrain, not a
   deformation of it. That is the right call for the same reason it is the right
   picture: the LROC images of Tranquility Base show discolouration, not relief.
   The trails are a metre or two wide and darker, which is wider than a person,
   because nobody in a pressure suit walks a straight line twice and what LROC
   resolves is the whole scuffed corridor rather than one set of prints. The
   plume swept ground around the descent stage is a broad brighter halo. Neither
   is a trench.

   Alpha is carried in the vertex colours so the edges dissolve instead of
   ending. The alpha channel needs a four component colour attribute, which
   three.js reads as premultiplied RGBA on a material with vertexColors set.

   Because these are authored flat, a caller putting the site on rough ground
   should expect the longest trail to clip where the terrain rolls more than
   about four centimetres over a span. The site is on the Upper Mare Unit and is
   as flat as anywhere on the Moon, so this has not been worth solving. */

/** A tapered ribbon following a path in the ground plane.
    @param path flat [x, z, x, z, ...] in site metres
    @param fade function of t along the path returning 0..1 */
function ribbon(kit, parent, mat, path, halfWidth, step, fade, lift) {
  /* Resample so long straight runs still have enough vertices to fade along. */
  const px = [], pz = [];
  for (let i = 0; i + 3 < path.length; i += 2) {
    const x0 = path[i], z0 = path[i + 1], x1 = path[i + 2], z1 = path[i + 3];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step));
    for (let k = 0; k < n; k++) {
      px.push(x0 + (x1 - x0) * k / n);
      pz.push(z0 + (z1 - z0) * k / n);
    }
  }
  px.push(path[path.length - 2]);
  pz.push(path[path.length - 1]);

  const n = px.length;
  if (n < 2) return null;

  /* Arc length, for the fade. */
  const s = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    s[i] = s[i - 1] + Math.hypot(px[i] - px[i - 1], pz[i] - pz[i - 1]);
  }
  const total = s[n - 1] || 1;

  const OFF = [-1, -0.5, 0.5, 1];
  const pos = new Float32Array(n * 4 * 3);
  const nrm = new Float32Array(n * 4 * 3);
  const col = new Float32Array(n * 4 * 4);
  for (let i = 0; i < n; i++) {
    /* Lateral direction from the average of the two adjacent segments, so the
       ribbon does not pinch on a corner. */
    const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
    let dx = px[i1] - px[i0], dz = pz[i1] - pz[i0];
    const dl = Math.hypot(dx, dz) || 1;
    dx /= dl; dz /= dl;
    const a = fade(s[i] / total);
    for (let j = 0; j < 4; j++) {
      const o = (i * 4 + j) * 3, w = OFF[j] * halfWidth;
      pos[o] = px[i] + dz * w;
      pos[o + 1] = lift;
      pos[o + 2] = pz[i] - dx * w;
      nrm[o + 1] = 1;
      const c = (i * 4 + j) * 4;
      col[c] = col[c + 1] = col[c + 2] = 1;
      col[c + 3] = (j === 0 || j === 3) ? 0 : a;
    }
  }
  const idx = [];
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < 3; j++) {
    const a = i * 4 + j, b = a + 1, c = a + 4, d = a + 5;
    idx.push(a, c, b, b, c, d);
  }
  const geo = kit.geo(new THREE.BufferGeometry());
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/** The plume swept halo: a soft annulus centred under the descent engine.
    SP-214 says the swept ground did not extend much past the footpads and that
    the erosion crater everybody expected did not form, so this reaches about
    five and a half metres and then stops. */
function blastHalo(kit, parent, mat, seg, lift) {
  const rings = [[0.0, 0.30], [1.6, 0.62], [3.4, 0.52], [4.9, 0.24], [6.0, 0.0]];
  const pos = new Float32Array(rings.length * (seg + 1) * 3);
  const nrm = new Float32Array(rings.length * (seg + 1) * 3);
  const col = new Float32Array(rings.length * (seg + 1) * 4);
  let s = 0x77a2c1;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let r = 0; r < rings.length; r++) for (let i = 0; i <= seg; i++) {
    const a = i / seg * Math.PI * 2;
    /* The edge of a plume scoured area is not a circle, so the radius wanders
       by about a tenth. */
    const wob = r === 0 ? 1 : 1 + (rnd() - 0.5) * 0.22;
    const k = (r * (seg + 1) + i);
    pos[k * 3] = Math.cos(a) * rings[r][0] * wob;
    pos[k * 3 + 1] = lift;
    pos[k * 3 + 2] = Math.sin(a) * rings[r][0] * wob;
    nrm[k * 3 + 1] = 1;
    col[k * 4] = col[k * 4 + 1] = col[k * 4 + 2] = 1;
    col[k * 4 + 3] = rings[r][1];
  }
  const idx = [];
  for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < seg; i++) {
    const a = r * (seg + 1) + i, b = a + 1, c = a + seg + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const geo = kit.geo(new THREE.BufferGeometry());
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/** Boot prints, scattered along the trails as one instanced quad each. The
    geometry is a three by three grid whose border vertices have zero alpha, so
    a print has soft edges even on the tier that gets no alpha map. */
function bootprints(kit, mat, paths, count, seed) {
  const geo = kit.geo(new THREE.PlaneGeometry(0.33, 0.15, 2, 2));
  const col = new Float32Array(9 * 4);
  for (let i = 0; i < 9; i++) {
    col[i * 4] = col[i * 4 + 1] = col[i * 4 + 2] = 1;
    col[i * 4 + 3] = (i === 4) ? 0.85 : 0.0;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
  geo.rotateX(-Math.PI / 2);

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = false;
  mesh.receiveShadow = true;

  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < count; i++) {
    const path = paths[Math.floor(rnd() * paths.length)];
    const k = Math.floor(rnd() * (path.length / 2 - 1)) * 2;
    const t = rnd();
    const x = path[k] + (path[k + 2] - path[k]) * t;
    const z = path[k + 1] + (path[k + 3] - path[k + 1]) * t;
    const head = Math.atan2(path[k + 2] - path[k], path[k + 3] - path[k + 1]);
    /* Left and right feet either side of the line of travel, and a print is
       never quite square to it. */
    const side = (i % 2 ? 1 : -1) * (0.10 + rnd() * 0.08);
    _v.set(x + Math.cos(head) * side, 0.0, z - Math.sin(head) * side);
    _q.setFromAxisAngle(_up, head + (rnd() - 0.5) * 0.5);
    _sc.set(1, 1, 1);
    _m.compose(_v, _q, _sc);
    mesh.setMatrixAt(i, _m);
  }
  _sc.set(1, 1, 1);
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/* --- the marker ------------------------------------------------------------
   One, off by default, and deliberately almost nothing: a hairline out of the
   ground, a short rule across the top of it, and three lines of small type. No
   icon, no halo, no floating diamond, nothing that hovers or turns to follow
   the camera. It is placed well clear of the hardware and it faces the way a
   visitor arrives from.

   The caption is drawn on both sides of the same plane rather than billboarded,
   because billboarding would need a per frame update and animate() belongs to
   the retroreflector. Two coincident quads back to back cost four triangles and
   need no code at all.

   The restraint is the point. Six people have stood here and this is where the
   first two of them did it. It should not look like an attraction. */
function buildMarker(kit, M, x, z, bearing) {
  const g = new THREE.Group();
  g.name = 'apollo11Marker';
  g.position.set(x, 0, z);
  g.rotation.y = (180 - bearing) * DEG;

  const H = 1.86;
  kit.cast = false;
  kit.receive = false;
  kit.cyl(g, M.markerLine, 0, H / 2, 0, 0.006, 0.008, H, 5);
  kit.tube(g, M.markerLine, -0.26, H, 0, 0.26, H, 0, 0.005, 4);

  /* The caption sits just above the rule. Only drawn if there was a document to
     draw it on: a blank plate would be worse than no plate. */
  if (M.markerText.map) {
    for (const s of [1, -1]) {
      const p = kit.mesh(g, new THREE.PlaneGeometry(0.52, 0.179), M.markerText);
      p.position.set(0, H + 0.115, s * 0.002);
      p.rotation.y = s > 0 ? 0 : Math.PI;
    }
  }
  kit.cast = true;
  kit.receive = true;
  return g;
}

/* ===========================================================================
   BUILD
   ======================================================================== */

/**
 * Build Tranquility Base.
 *
 * @param {object} opts { quality: 'performance'|'balanced'|'high'|'ultra' }
 * @returns {{
 *   group: THREE.Group,
 *   items: Array<object>,
 *   setMarkers: (on: boolean) => void,
 *   animate: (state: {dt: number, sunDir: {x,y,z}}) => void,
 *   dispose: () => void,
 * }}
 */
export function buildApollo11(opts = {}) {
  const q = TIER[opts.quality] || TIER.high;
  const kit = new Kit();
  const M = makeMaterials(kit, q);

  const group = new THREE.Group();
  group.name = 'apollo11';

  const items = makeItems();
  const at = (id) => items.find((i) => i.id === id);
  /* Site coordinates from an items row: east is +X and north is -Z. */
  const px = (id) => at(id).offsetEast;
  const pz = (id) => -at(id).offsetNorth;

  /* --- hardware ------------------------------------------------------------ */
  group.add(buildDescentStage(kit, M, q));

  const lrrr = buildLRRR(kit, M, q);
  lrrr.group.position.set(px('lrrr'), 0, pz('lrrr'));
  group.add(lrrr.group);

  /* The seismometer's wings had to be pointed at the sun by hand, and the sun
     tracks along the east to west line at this latitude, so the wings face that
     way and the package is not turned at all. */
  const psep = buildPSEP(kit, M);
  psep.position.set(px('psep'), 0, pz('psep'));
  group.add(psep);

  /* The camera looks back at the lunar module from wherever the cable ran out,
     which is the bearing from it to the origin. */
  const tv = buildTVCamera(kit, M, (TV_BEARING + 180) % 360);
  tv.position.set(px('tv'), 0, pz('tv'));
  group.add(tv);
  buildCable(kit, M, group, px('tv'), pz('tv'),
             eastOf(TV_BEARING, 2.6), -northOf(TV_BEARING, 2.6), 0x9e31a7);

  /* The flag lies pointing away from the lunar module. */
  const flag = buildFlag(kit, M, q);
  flag.position.set(px('flag'), 0, pz('flag'));
  flag.rotation.y = rotForBearing(FLAG_BEARING);
  group.add(flag);

  const swc = buildSWC(kit, M);
  swc.position.set(px('swc'), 0, pz('swc'));
  /* The foil faces east, which is where the sun was during the 77 minutes it
     was exposed: the point of the experiment is the ions arriving down the
     normal, so the sheet is aimed at the sun and not merely stood up. */
  swc.rotation.y = 90 * DEG;
  group.add(swc);
  const swcFoil = swc.getObjectByName('swcFoil');

  const jett = buildJettison(kit, M);
  jett.position.set(px('jettison'), 0, pz('jettison'));
  jett.rotation.y = rotForBearing(JETT_BEARING);
  group.add(jett);

  /* --- ground -------------------------------------------------------------- */
  /* The foot of the ladder, after the landing yaw, is where every trail on the
     site begins, because it is the only way in and out of the vehicle. */
  const foot = yaw(-3.45, 0, new THREE.Vector3());
  const LX = foot.x, LZ = foot.z;

  const paths = {
    /* Milling about at the bottom of the ladder. Armstrong spent his first
       minutes here describing the soil and taking the contingency sample. */
    mill: [LX - 1.0, LZ + 0.9, LX + 0.5, LZ - 1.2, LX + 1.5, LZ + 0.7],
    swc:  [LX, LZ, px('swc'), pz('swc')],
    flag: [LX, LZ, -5.4, -2.6, px('flag'), pz('flag')],
    tv:   [LX, LZ, -5.8, -3.9, -9.6, -8.4, px('tv'), pz('tv')],
    bay:  [LX, LZ, -1.4, -3.5, 0.9, -3.3],
    /* South past the minus Y footpad to the retroreflector and on to the
       seismometer, which is the route the EASEP deployment took. */
    easep: [LX, LZ, -3.6, 1.7, -3.0, 5.4, -2.4, 12.0,
            px('lrrr'), pz('lrrr'), -0.6, 25.0, px('psep'), pz('psep')],
    /* Armstrong's run to Little West crater: about 60 m east and back in three
       minutes fifteen, the farthest anybody went from the vehicle all day. It
       is a single set of tracks out and back rather than a worked over path, so
       it fades with distance. */
    east: [LX, LZ, -2.6, -4.2, 1.0, -5.6, 5.4, -4.6, 11.0, -3.0,
           20.0, -2.0, 32.0, -1.2, 45.0, -0.4, 58.0, 0.2, 62.0, 0.4],
  };

  const ground = new THREE.Group();
  ground.name = 'disturbance';
  group.add(ground);

  const halo = blastHalo(kit, ground, M.swept, q.pad * 2, 0.014);
  halo.renderOrder = 1;

  const flat = (a) => () => a;
  const decay = (a, b) => (t) => a + (b - a) * t;
  const trails = [
    ribbon(kit, ground, M.trail, paths.mill, 1.90, q.trailStep, flat(0.60), 0.024),
    ribbon(kit, ground, M.trail, paths.swc, 0.70, q.trailStep, flat(0.50), 0.024),
    ribbon(kit, ground, M.trail, paths.flag, 0.78, q.trailStep, decay(0.58, 0.44), 0.024),
    ribbon(kit, ground, M.trail, paths.tv, 0.80, q.trailStep, decay(0.58, 0.40), 0.024),
    ribbon(kit, ground, M.trail, paths.bay, 0.95, q.trailStep, flat(0.55), 0.024),
    ribbon(kit, ground, M.trail, paths.easep, 0.90, q.trailStep, decay(0.62, 0.40), 0.024),
    ribbon(kit, ground, M.trail, paths.east, 0.62, q.trailStep, decay(0.58, 0.20), 0.024),
  ];
  for (const t of trails) if (t) t.renderOrder = 2;

  const prints = bootprints(kit, M.print, Object.values(paths), q.prints, 0x19690720);
  prints.position.y = 0.034;
  prints.renderOrder = 3;
  ground.add(prints);

  /* --- dust ---------------------------------------------------------------
     Apollo dust does not brush off. It is electrostatically charged, it is
     angular on a scale of microns, and every crew came home grey from the knees
     down. So anything on this site whose geometry sits entirely below a metre
     takes the colour of the ground: the footpads, the contact probes, the lower
     ladder rungs, the jettisoned backpacks, the discarded bay covers.

     The retroreflector is excluded on purpose. Dust on the corner cubes is a
     real and much studied problem, and is one of the leading explanations for
     why the array returns roughly a tenth of the signal it did in 1969, but
     turning its optical face the colour of regolith would remove the one object
     here that a player can see is still alive. It is noted instead. */
  dustBelow(group, M.dustMap, 1.0);

  /* --- markers -------------------------------------------------------------
     Genuinely off. Nothing is built until the first time it is asked for, and
     turning it off takes it back out of the scene graph rather than hiding it,
     so there is no marker geometry in the render at all. dispose() still frees
     it, because the kit kept the record. */
  let marker = null;
  function setMarkers(on) {
    if (on) {
      if (!marker) {
        marker = buildMarker(kit, M, eastOf(250, 9.0), -northOf(250, 9.0), 250);
      }
      if (!marker.parent) group.add(marker);
    } else if (marker && marker.parent) {
      group.remove(marker);
    }
  }

  /* --- the glint -----------------------------------------------------------
     The retroreflector returns light back along the direction it arrived from,
     which is the whole point: the beam from a telescope on Earth comes back to
     that telescope. A person standing at Tranquility Base is nowhere near the
     sun line, so what they would actually see off a hundred flat silica faces
     is an ordinary specular, brightest when the sun is square to the panel, and
     that is what this drives. The array is aimed at Earth, so the glint peaks
     when the sun is behind Earth in this sky, which is to say near lunar
     midday at new Earth.

     Deliberately faint. The exposure model in this project is aggressive and a
     bright emissive here would bloom into a lens flare on a 46 cm panel.

     Allocates nothing: the two scratch objects are module scope and
     getWorldQuaternion writes into the one it is handed. */
  let glint = 0;
  function animate(state) {
    if (!state || !state.sunDir) return;
    const sd = state.sunDir;
    lrrr.panel.getWorldQuaternion(_aq);
    _av.set(0, 1, 0).applyQuaternion(_aq);
    const cosI = _av.x * sd.x + _av.y * sd.y + _av.z * sd.z;
    const target = cosI > 0 ? cosI * cosI * cosI * cosI * cosI : 0;
    /* A short lag, because the eye has one and so does the auto exposure. */
    const dt = state.dt > 0 ? state.dt : 0;
    glint += (target - glint) * (dt > 0 ? Math.min(1, dt / 0.18) : 1);
    M.silica.emissiveIntensity = 0.015 + 0.34 * glint;
  }

  function dispose() {
    for (const m of kit.mats) m.dispose();
    for (const t of kit.texs) t.dispose();
    for (const g of kit.geoms) g.dispose();
    if (marker) { marker.clear(); marker.removeFromParent(); marker = null; }
    group.clear();
    group.removeFromParent();
  }

  /* Author it dark, so a caller that never calls animate() still gets a panel
     that reads as glass rather than as a lamp. */
  M.silica.emissiveIntensity = 0.015;

  /**
   * The one object here that is not there any more.
   *
   * The Solar Wind Composition foil was unrolled, exposed for 77 minutes, then
   * rolled back up and carried home in the ascent stage; it is in a laboratory
   * on Earth. Only the staff was left standing. The file has said so in a
   * comment since it was written and drew the sheet deployed anyway, which
   * makes the default scene — 2026, the site as it is — show a piece of
   * hardware that is not on the Moon. At a site reconstructed object by object
   * from cited sources that matters more here than it would anywhere else.
   *
   * The window is the EVA itself rather than the 77 minutes, rounded outward,
   * because the deployment and retrieval minutes are not in this file's
   * sources and a guessed timestamp would be a worse answer than a stated
   * approximation. Set the clock to 21 July 1969 and it is there.
   *
   * @param {number} simMs simulated time, Unix milliseconds
   */
  const EVA_FROM = Date.UTC(1969, 6, 21, 2, 56, 15);
  const EVA_TO = Date.UTC(1969, 6, 21, 5, 30, 0);
  function setEpoch(simMs) {
    if (!swcFoil) return;
    const during = Number.isFinite(simMs) && simMs >= EVA_FROM && simMs <= EVA_TO;
    swcFoil.visible = during;
  }
  /* Author it absent, so a caller that never sets a clock gets the site as it
     is rather than as it was for 77 minutes in 1969. */
  setEpoch(NaN);

  return { group, items, setMarkers, animate, setEpoch, dispose };
}
