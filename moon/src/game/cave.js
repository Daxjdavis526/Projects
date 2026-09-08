/* =============================================================================
   CAVE — the conduit under the Mare Tranquillitatis pit
   -----------------------------------------------------------------------------
   In July 2024 Carrer, Pozzobon, Sauro, Castelletti, Patterson and Bruzzone
   published radar evidence that the Mare Tranquillitatis pit opens into a cave
   conduit that is still there. They took Mini-RF images the Lunar
   Reconnaissance Orbiter made in 2010, built a forward model of the radar
   return from the pit, and found that no model of the pit alone could produce
   the observed anomaly — an unlit void below and to one side of the pit could.
   Nature Astronomy 8, 1119-1126, doi 10.1038/s41550-024-02302-y.

   That is the only cave on the Moon anyone has evidence for, and it is the
   reason this file exists at all. It is also the reason this file is careful,
   because it is easy to overstate. Nobody has seen inside it. What exists is a
   radar anomaly and a family of geometries that reproduce it, and the paper is
   explicit that the radar cannot pick between two of them:

     model A   roof and floor both dipping about 3 degrees
     model B   roof dipping 55 degrees, floor dipping 45 degrees

   B is the better fit and is the one built here; A is equally admissible and
   would be a nearly level chamber rather than a ramp. The overlay says so.
   Everything about this cave is labelled DERIVED at best, and the walls in the
   game say what they are made of.

   WHAT IS PUBLISHED, and where each number comes from:

     the conduit exists            Carrer et al. 2024, from the Mini-RF anomaly
     "tens of metres long"         Carrer et al. 2024, abstract
     it is below the WEST wall     Carrer et al. 2024, Fig. 2 caption, verbatim:
                                   "an accessible conduit-like cave is present
                                   below the MTP west wall"
     roof 55 +/- 5 deg,            Carrer et al. 2024, Fig. 3 caption, model B
     floor 45 +/- 5 deg
     about 30 m of horizontal      the value reported for model B; the shallow
     extent for model B            model A reaches about 80 m instead
     width at least 45 m           and it is a lower bound, not a measurement:
                                   the radar-derived width saturates against the
                                   true width, so 45 m is a floor. Simulations
                                   ran 15, 30, 55, 100 and 200 m
     130-170 m below the surface   Carrer et al. 2024
     overhangs of 10-15 m on the   LROC Lunar Pits Atlas
     east, west and north
     floor boulders 1-4 m, plus    Carrer et al. 2024, Extended Data Fig. 6,
     two of 8-10 m in the          measured off LROC NAC image M155016845R at
     south-west of the floor       0.41 m per pixel

   WHICH SIDE, because this file had it wrong and the wrong answer was
   reasonable. The LROC atlas describes the visible pit floor as "flat and
   covered in boulders, floor under the E wall slopes downward" — so the side
   that optically looks like a way in is the EAST. The radar found the void
   under the WEST wall, and the reason is in the observation itself: the
   Mini-RF product they used, lsz_06587_2s1_eku_10n033, was taken looking LEFT
   at a look azimuth of 270.2 degrees. Due west. The beam entered the pit
   travelling west and could only illuminate the base of the far wall, so the
   paper constrains a westward conduit and is silent about an eastward one. The
   two observations are not in conflict; they are of different walls. This
   builds the one that was measured, and says here that the other side is where
   the floor visibly slopes.

   WHAT IS NOT, and is therefore shape rather than measurement:

     the height of the mouth       Not published, and not free either: a roof at
                                   55 degrees closes on a floor at 45 over the
                                   published 30 m of extent, which fixes the
                                   opening at 30 * (tan 55 - tan 45), about
                                   thirteen metres.
     the arched cross-section      A lava tube is arched. The paper models the
                                   conduit as a simple void because radar at
                                   13 cm does not care.
   What is deliberately NOT here is a walkable recess running round the pit
   under the overhanging rim. The overhang is real and the atlas measures it,
   but how much of it is open void and how much is talus is not published, and
   a ring of floor under the rim is a big, prominent, invented room. The pit
   wall is a wall; the one void here is the one the radar found.

   No DOM, no three.js: this is geometry and collision only, so the tests can
   walk a player through the cave in Node. src/models/cave.js draws it.
   ========================================================================== */

import { shaftRadiusAt, funnelRadiusAt } from '../data/pits.js';
import { LABEL } from '../config.js';

const DEG = Math.PI / 180;
const R = 1737400;

/**
 * The conduit, in metres and degrees. Every field is sourced in the header.
 */
export const CONDUIT = {
  /* West. Not east, which is where the floor visibly slopes: see the header. */
  bearing: 270,
  /* A lower bound rather than a width. The radar-derived figure saturates
     against the true one, so the paper's 45 m is a floor and the Padova release
     puts the minimum at 55-60 m "and possibly several hundred". 45 is the most
     quoted and the most conservative. */
  width: 45,
  roofSlope: 55,
  roofSlopeErr: 5,
  floorSlope: 45,
  floorSlopeErr: 5,
  /* Horizontal extent from the mouth, for model B. Model A, which the radar
     cannot rule out, would be a nearly level chamber reaching about 80 m. */
  extent: 30,
  /* The bearings the atlas reports overhangs on, and how wide an arc each one
     covers. The south side is not overhung. Nothing is built from this — the
     overhang is not walkable floor here — but the conduit opens under one of
     them, and the overlay says which. */
  overhangs: [0, 90, 270],
  overhangArc: 55,
};

/* The mouth height is not published, and it is not a free choice either. A roof
   dipping 55 degrees closes on a floor dipping 45 over the conduit's 30 m of
   horizontal extent, and that fixes the opening: 30 * (tan 55 - tan 45). About
   thirteen metres, which also puts the deepest floor 155 m below the plain,
   inside the published 130-170 m band. */
const CONVERGE = Math.tan(CONDUIT.roofSlope * DEG) - Math.tan(CONDUIT.floorSlope * DEG);
const MOUTH_H = CONDUIT.extent * CONVERGE;

/* Which way along the east-west axis the passage runs. The two candidate
   bearings are 90 and 270, and 270 is a 180 degree rotation of 90 about the
   vertical — a rotation, not a reflection, so nothing downstream has to think
   about triangle winding. */
const DIR = CONDUIT.bearing === 270 ? -1 : 1;

/* How far inside the shaft wall the cave also owns the floor.

   The pit's height field is one metre per pixel and its shaft wall is a 105 m
   cliff, so bilinear sampling smears that cliff across the last pixel: read the
   ground 0.6 m inside the wall and it comes back sixty metres up. Everywhere
   else in the pit that is harmless — it is a wall either way, and the slope is
   still eighty-nine degrees — but at the cave mouth it would be a step down
   into the doorway. The cave knows that floor is flat, so it says so for the
   last two metres and the smear never shows. */
const OVERLAP = 2;

/* How much headroom a person in a suit needs before the passage stops being a
   passage. */
const STAND = 1.9;

/**
 * A walkable void under a pit.
 *
 * Coordinates are metres east and north of the pit centre, and metres relative
 * to the surrounding plain — `u` — so the pit floor is at `-pit.depth` and
 * everything in here reads like the papers do. Absolute elevations only appear
 * at the edges, where the player's latitude, longitude and altitude come in.
 */
export class Cave {
  /**
   * @param {object} opts { pit, baseHeight } — baseHeight is the elevation of
   *   the plain around the pit, which PitField already had to work out to cut
   *   the hole, so the cave and the hole agree by construction.
   */
  constructor(opts) {
    this.pit = opts.pit;
    this.base = opts.baseHeight;
    this.floorU = -opts.pit.depth;
    /* The shaft radius on the conduit's bearing: where the mouth starts. */
    this.mouthR = shaftRadiusAt(opts.pit, CONDUIT.bearing);
    this.halfW = CONDUIT.width / 2;
    this.axis = DIR;
    this.mouthHeight = MOUTH_H;
    this.length = CONDUIT.extent;
    this.deepestU = this.floorU - CONDUIT.extent * Math.tan(CONDUIT.floorSlope * DEG);
    this.label = LABEL.DERIVED;
    this.source = 'Carrer et al. 2024, Nature Astronomy 8:1119, model B';
    /* One-entry memo. The player's ground source asks for the height, the
       slope and the normal at the same point in the same substep, and each of
       those resolves a region, a floor and a ceiling, so the same dozen
       trigonometric calls were being made three times over at 120 Hz. */
    this._memo = { lat: NaN, lon: NaN, e: NaN, n: NaN, region: null, floor: null, ceil: null };
  }

  /** Metres east and north of the pit centre. */
  toLocal(lat, lon) {
    const p = this.pit;
    return {
      e: (lon - p.lon) * DEG * Math.cos(p.lat * DEG) * R,
      n: (lat - p.lat) * DEG * R,
    };
  }

  /** And back again. */
  toGeographic(e, n) {
    const p = this.pit;
    return {
      lat: p.lat + n / (DEG * R),
      lon: p.lon + e / (DEG * R * Math.cos(p.lat * DEG)),
    };
  }

  /** Region, floor and ceiling for a point, computed once per point. */
  _atLocal(e, n) {
    const m = this._memo;
    if (m.e === e && m.n === n) return m;
    m.e = e; m.n = n; m.lat = NaN;
    m.region = this.region(e, n);
    m.floor = this._floorOf(m.region, e);
    m.ceil = this._ceilOf(m.region, m.floor, e, n);
    return m;
  }

  /** The same, from geographic coordinates. */
  _at(lat, lon) {
    const m = this._memo;
    if (m.lat === lat && m.lon === lon) return m;
    const { e, n } = this.toLocal(lat, lon);
    const r = this._atLocal(e, n);
    r.lat = lat; r.lon = lon;
    return r;
  }

  /**
   * Which part of the void a point is over: 'shaft', 'conduit', or null for
   * solid rock. Horizontal only — the vertical test is separate,
   * because the answer to "is there rock above me" is a different question
   * from "is there floor below me".
   */
  region(e, n) {
    const r = Math.hypot(e, n);
    const bearing = r < 1e-6 ? 0 : Math.atan2(e, n) / DEG;
    const rIn = shaftRadiusAt(this.pit, bearing);

    /* The conduit runs away from the shaft wall along its bearing. Its own
       frame: x metres out from the wall, y metres either side of the axis. It
       reaches back inside the wall by OVERLAP so the doorway has no lip. */
    const { a, y } = this.toAxis(e, n);
    const x = a - this.mouthR;
    if (x >= -OVERLAP && x <= this.length && Math.abs(y) <= this.halfW) return 'conduit';

    if (r <= rIn) return 'shaft';
    return null;
  }

  /** Whether the atlas reports an overhang on this bearing. */
  overhung(bearingDeg) {
    for (const b of CONDUIT.overhangs) {
      if (Math.abs(((bearingDeg - b + 540) % 360) - 180) <= CONDUIT.overhangArc) return true;
    }
    return false;
  }

  /**
   * How far into the conduit a standing person can get, measured from the
   * shaft wall. The void carries on past this: the roof simply comes down to
   * meet the floor, and somewhere before it does you have to stop.
   */
  get walkableTo() {
    return (MOUTH_H - STAND) / CONVERGE;
  }

  /** Along-axis and across-axis metres, from pit-local east and north. */
  toAxis(e, n) { return { a: DIR * e, y: DIR * n }; }

  /** And back. */
  fromAxis(a, y) { return { e: DIR * a, n: DIR * y }; }

  /** Floor height relative to the plain, or null where there is no cave floor. */
  floorLocal(e, n) {
    return this._atLocal(e, n).floor;
  }

  _floorOf(where, e) {
    if (where === null) return null;
    /* The shaft floor is already in the height field — the pit patch put it
       there — so the cave does not own it and does not fight it for it. */
    if (where === 'shaft') return null;
    const x = Math.max(0, DIR * e - this.mouthR);
    return this.floorU - x * Math.tan(CONDUIT.floorSlope * DEG);
  }

  /**
   * Roof height relative to the plain, or null where the sky is the roof.
   *
   * Arched across the passage, because a lava tube is: 40 % of the headroom is
   * given up at the walls. The paper models a plain void, radar at 13 cm having
   * no opinion about arches, so the arch is shape.
   */
  ceilingLocal(e, n) {
    return this._atLocal(e, n).ceil;
  }

  _ceilOf(where, floor, e, n) {
    if (where === null || where === 'shaft') return null;
    const x = Math.max(0, DIR * e - this.mouthR);
    const head = MOUTH_H - x * CONVERGE;
    if (head <= 0) return floor;
    const arch = 1 - 0.4 * Math.pow(Math.min(1, Math.abs(n) / this.halfW), 2);
    return floor + head * arch;
  }

  /* --- the interface the player's ground source wants --------------------- */

  /**
   * Absolute floor elevation under a point, or null to leave it to the height
   * field.
   *
   * Gated on altitude: standing on the rim a hundred metres above the cave, the
   * ground under you is the rim, not the cave. Rock is only rock when you are
   * in the room.
   */
  floorAt(lat, lon, alt) {
    const m = this._at(lat, lon);
    if (m.floor === null) return null;
    if (typeof alt !== 'number') return this.base + m.floor;
    const u = alt - this.base;
    return (u > m.floor - 2 && u < m.ceil + 2) ? this.base + m.floor : null;
  }

  /** True when there is rock overhead. */
  inside(lat, lon, alt) {
    const m = this._at(lat, lon);
    if (m.ceil === null) return false;
    const u = alt - this.base;
    return u >= m.floor - 2 && u <= m.ceil;
  }

  /** The published 45 degree ramp, from the mouth inward. */
  slopeAt(lat, lon) {
    const m = this._at(lat, lon);
    if (m.region === null || m.region === 'shaft') return null;
    return (DIR * m.e - this.mouthR) > 0 ? CONDUIT.floorSlope : 0;
  }

  /** Downhill is along the conduit's bearing, into the Moon. */
  normalAt(lat, lon) {
    const s = this.slopeAt(lat, lon);
    if (s === null) return null;
    const t = s * DEG;
    return { e: -DIR * Math.sin(t), n: 0, u: Math.cos(t) };
  }

  /**
   * Push a body out of rock. Horizontal only, like `Base.resolve`, because the
   * floor is handled by the ground source and the ceiling by ducking.
   *
   * @returns {?{lat:number, lon:number}} where the body should be instead
   */
  resolve(lat, lon, alt, radius = 0.34) {
    const { e, n } = this.toLocal(lat, lon);
    const u = alt - this.base;
    /* Above the shaft mouth, everything here is a surface rather than a void
       and the height field already knows its shape. Only below it — inside the
       pit, where the walls are walls and the rim reaches over — is there rock
       that no height field can describe. Getting this bound wrong pushes
       someone walking across the funnel into the shaft, which is a hundred
       metre fall, so it is deliberately the shaft mouth and not the pit floor. */
    if (u > -this.pit.funnelDepth) return null;

    const where = this.region(e, n);
    const { a, y } = this.toAxis(e, n);
    const x = a - this.mouthR;

    if (where === 'conduit') {
      let nx = x, ny = y, moved = false;
      const lim = this.halfW - radius;
      if (Math.abs(y) > lim) { ny = Math.sign(y) * lim; moved = true; }
      /* The far end. The roof comes down to meet the floor, and a person in a
         suit runs out of headroom before it gets there. */
      const limX = Math.min(this.length - radius, this.walkableTo);
      if (x > limX) { nx = limX; moved = true; }
      if (!moved) return null;
      const l = this.fromAxis(this.mouthR + nx, ny);
      return this.toGeographic(l.e, l.n);
    }

    /* Outside every void and below the shaft mouth: solid rock, which you can
       only be in by having clipped through a wall. Push back out the shortest
       way — sideways if this is beside the conduit, radially otherwise. */
    const r = Math.hypot(e, n) || 1e-6;
    const bearing = Math.atan2(e, n) / DEG;
    if (x >= -OVERLAP && x <= this.length && Math.abs(y) > this.halfW) {
      const l = this.fromAxis(a, Math.sign(y) * (this.halfW - radius));
      return this.toGeographic(l.e, l.n);
    }
    /* Far enough out and this is not the cave's business: the pit's own walls
       and the plain beyond them are the height field's to defend. */
    if (r > funnelRadiusAt(this.pit, bearing) + 30) return null;
    const rMax = shaftRadiusAt(this.pit, bearing) - radius;
    return r > rMax ? this.toGeographic(e * rMax / r, n * rMax / r) : null;
  }

  /** For the overlay: what this is and how much of it is real. */
  describe() {
    return {
      label: this.label,
      source: this.source,
      what: 'cave conduit, radar-derived',
      /* The honest headline, and the caveat that goes with it. */
      note: 'Radar-constrained forward model, not an image. Carrer et al. '
          + 'report two geometries the Mini-RF data cannot separate: this is '
          + 'their better-fitting model B, a ramp; model A would be a nearly '
          + 'level chamber.',
      widthM: CONDUIT.width,
      lengthM: Math.round(this.length),
      deepestM: Math.round(-this.deepestU),
    };
  }
}

/**
 * The boulders on the pit floor, which are measured rather than invented.
 *
 * Carrer et al. populated their radar model with rocks 1-4 m across, a range
 * they took off LROC NAC image M155016845R at 0.41 m per pixel, and noted two
 * boulders of 8-10 m in the south-west of the floor that they left out as
 * outliers. Those two are placed here for the same reason they were excluded
 * there: they are real and they are unusual.
 *
 * Deterministic from the pit id, so the floor is the same floor every time.
 *
 * @returns {Array<{e:number, n:number, size:number, outlier:boolean}>}
 */
export function floorBoulders(pit, count = 90) {
  const out = [];
  /* A small integer hash, so this needs no seedable RNG and no dependency. */
  let s = 0;
  for (let i = 0; i < pit.id.length; i++) s = (s * 31 + pit.id.charCodeAt(i)) >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const bearing = rnd() * 360;
    const rIn = shaftRadiusAt(pit, bearing);
    /* sqrt for an even areal spread rather than a crowded middle. */
    const r = Math.sqrt(rnd()) * (rIn - 3);
    out.push({
      e: r * Math.sin(bearing * DEG),
      n: r * Math.cos(bearing * DEG),
      size: 1 + rnd() * 3,
      outlier: false,
    });
  }
  /* The two the paper names, in the south-west quarter of the floor. */
  const rSW = shaftRadiusAt(pit, 225);
  out.push({ e: -rSW * 0.45, n: -rSW * 0.42, size: 9.4, outlier: true });
  out.push({ e: -rSW * 0.62, n: -rSW * 0.24, size: 8.2, outlier: true });
  return out;
}

/**
 * Breakdown blocks on the conduit floor.
 *
 * Where a lava tube's roof has failed badly enough to open a skylight, the
 * floor near it carries the pieces: on Earth that debris is the single most
 * reliable thing about a collapsed tube, and Carrer et al. modelled the pit
 * floor itself with a rock population for exactly that reason. Nobody has seen
 * the inside of this conduit, so these are PROCEDURAL and the overlay says so.
 * What they are not is arbitrary — they thin out away from the mouth, because
 * that is where the roof has actually gone, and they are drawn from the same
 * 1-4 m distribution the paper measured off the NAC image next door.
 *
 * Deterministic, so the same blocks are in the same places every visit.
 *
 * @returns {Array<{e:number, n:number, u:number, size:number}>}
 */
export function breakdownBlocks(cave, count = 70) {
  const out = [];
  let s = 0x9e3779b9;
  for (const ch of cave.pit.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < count; i++) {
    /* Squared, so the pile is heaviest just inside the mouth. */
    const x = Math.pow(rnd(), 2) * cave.walkableTo;
    const y = (rnd() * 2 - 1) * (cave.halfW - 1.5);
    const { e, n } = cave.fromAxis(cave.mouthR + x, y);
    const floor = cave.floorLocal(e, n);
    if (floor === null) continue;
    const head = cave.ceilingLocal(e, n) - floor;
    const size = Math.min(1 + rnd() * 3, Math.max(0.6, head - 0.6));
    out.push({ e, n, u: floor, size });
  }
  return out;
}

/* The pits with a cave under them. Exactly one, because exactly one has been
   looked for and found: Kaku et al. found a Kaguya radar echo under the Marius
   Hills pit in 2017 and GRAIL gravity is consistent with voids under the Marius
   domes, but neither constrains a shape, and a shape is what it would take to
   put a room here. When somebody publishes one, this list grows. */
export const CAVE_PITS = ['tranquillitatis_pit'];

/**
 * The cave under a pit, or null where nobody has evidence of one.
 * @param {object} pit one of PITS
 * @param {number} baseHeight elevation of the plain around it, metres
 */
export function caveFor(pit, baseHeight) {
  return CAVE_PITS.includes(pit.id) ? new Cave({ pit, baseHeight }) : null;
}
