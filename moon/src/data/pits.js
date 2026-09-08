/* =============================================================================
   PITS — the holes in the Moon, from the catalogue that measured them
   -----------------------------------------------------------------------------
   A lunar pit is a collapse in the roof of a void, and 278 of them have been
   catalogued. A handful sit in mare basalt with vertical walls and overhanging
   rims, which is what you would expect of a lava tube whose ceiling has given
   way, and one of those has now been shown by radar to open into a conduit that
   is still there.

   The reason this file exists rather than a shrug is that the pits ARE measured,
   and I had assumed they were not. The elevation products this game streams top
   out at 118 m per pixel over all of them, so nothing that arrives through
   src/data/surface.js can resolve a hole a hundred metres across — which is
   true, and which I mistook for "the shape is unknown". It is not. The LROC
   team catalogued these pits from oblique NAC images and stereo models and
   published the numbers: funnel diameters, inner diameters, depths, the azimuth
   of the long axis, whether the rim overhangs, whether debris has built a way
   in. That is a measurement; it simply arrives as a table rather than as a
   raster.

   So the shape here is DERIVED — an axisymmetric-with-ellipticity profile fitted
   to published dimensions — and never MEASURED, because a profile fitted to six
   numbers is not the same thing as a height field sampled off the Moon. The
   overlay says DERIVED when you stand in one, and the source line names the
   catalogue entry. Everything below the resolution of those numbers is
   procedural and says so, exactly as it does everywhere else.

   And the honest next step, written here because it is the thing that would
   make this file unnecessary: a height field sampled off the Moon does exist.
   NAC_DTM_TRANQPIT1 is a two-metre stereo model of the Mare Tranquillitatis pit
   with a relative vertical accuracy of 0.72 m, and there are equivalents over
   Marius Hills and Mare Ingenii. They are on the LROC RDR archive as 32-bit
   GeoTIFFs and not on NASA Trek, which is the only reason this game does not
   stream them. Vendor those and every one of these pits becomes MEASURED.

   Fields, and where each one comes from:

     funnelMin/funnelMax   atlas, metres — the outer collapse cone, elliptical
     innerMin/innerMax     atlas, metres — the vertical shaft below it
     azimuth               atlas, degrees from north — bearing of the long axis
     depth                 metres below the SURROUNDING SURFACE, which is not
                           always the atlas's Depth field: see depthNote
     funnelDepth           metres of that depth which is funnel, from the atlas
                           description where it gives one
     overhang              atlas flag, verbatim: 'Y', 'Y?', 'N' or '?'
     overhangM             metres, only where the description states a figure
     ramp                  bearing of the entrance ramp in degrees, where the
                           atlas flags one and the description says which side;
                           null where the atlas says there is none
     inferred              every value above that is NOT straight off the atlas
                           page, named, so the overlay and the docs can say so

   A note on the Depth field, because it changes how far you fall. The atlas's
   Depth is surface-to-floor for three of these four — Depth 1, described as "to
   center of pit", agrees with it closely — but for the Mare Tranquillitatis pit
   the description says outright that the 105 m is "measured from bottom of
   funnel". Adding the ~20 m funnel puts that floor 125 m below the plain, which
   is the number used here and is also what makes Carrer et al.'s radar conduit
   at 130-170 m depth sit just under the floor rather than well below it.

   Source: LROC Lunar Pits Atlas, https://lroc.im-ldi.com/atlases/pits
   Longitudes on the atlas are east-positive 0-360 and are converted here.
   ========================================================================== */

import { LABEL } from '../config.js';

/**
 * The mare pits, which are the ones that look like collapsed lava tubes.
 *
 * Only pits whose atlas entry carries a full set of dimensions are here. The
 * released catalogue holds 278: 257 impact-melt pits, 16 mare, 5 highland. The
 * impact-melt ones are the overwhelming majority and are a different thing —
 * melt ponds crack as they cool and the holes are not tube skylights — and
 * they are much smaller, with a median diameter of 15 m against 100 m for the
 * mare pits.
 */
export const PITS = [
  {
    id: 'tranquillitatis_pit',
    name: 'Mare Tranquillitatis pit',
    lat: 8.3355, lon: 33.222,
    funnelMin: 140, funnelMax: 146,
    innerMin: 88, innerMax: 100,
    depth: 125, funnelDepth: 20,
    depthNote: 'Atlas Depth is 105 m and the description says it is measured '
             + 'from the bottom of the ~20 m funnel, so the floor is 125 m '
             + 'below the surrounding plain.',
    azimuth: 170,
    overhang: 'Y', overhangM: 10,
    ramp: null,
    host: 'Mare Tranquillitatis',
    note: 'The deepest known lunar pit, and the only one shown by radar to open '
        + 'into a conduit that is still there. Vertical walls visible to about '
        + '80 m down, with a recess running right around the pit at about 40 m, '
        + 'and overhangs of at least 10-15 m on the east, west and north sides.',
    /* The funnel depth is the atlas's own "~20 m"; the overhang figure is the
       floor of its "at least 10-15 m" rather than the middle of it. */
    inferred: ['funnelDepth is the description\'s "~20 m"',
               'overhangM takes the low end of "at least 10-15 m"'],
    atlas: 'https://lroc.im-ldi.com/atlases/pits/3',
  },
  {
    id: 'marius_pit',
    name: 'Marius Hills pit',
    lat: 14.0917, lon: -56.7701,
    funnelMin: 79, funnelMax: 92,
    innerMin: 49, innerMax: 55,
    depth: 40, funnelDepth: 10,
    depthNote: 'Atlas Depth, read as surface-to-floor: the atlas flags the one '
             + 'entry where it is not, and does not flag this one.',
    azimuth: 65,
    /* "Slight overhangs near floor-level on both sides" — a flag, with no
       figure attached, so there is no figure here either. */
    overhang: 'Y', overhangM: null,
    ramp: null,
    host: 'Marius Hills',
    note: 'An elliptical pit in the floor of a sinuous rille, in the middle of '
        + 'the Moon’s largest field of volcanic domes. The floor is mostly flat '
        + 'and covered in boulders, with slight overhangs near floor level on '
        + 'both sides — though the atlas doubts there is a way past the debris '
        + 'into any deeper void.',
    inferred: ['funnelDepth is the description\'s "~10 m"'],
    atlas: 'https://lroc.im-ldi.com/atlases/pits/1',
  },
  {
    id: 'west_marius_pit',
    name: 'West Marius Hills pit',
    lat: 13.5507, lon: -58.1733,
    funnelMin: 70, funnelMax: 95,
    /* The atlas gives Inner Min. Diam. 47 and Inner Max. Diam. N/A, so the
       shaft is modelled as circular at the one published diameter. */
    innerMin: 47, innerMax: 47,
    depth: 16, funnelDepth: 6,
    depthNote: 'Atlas Depth, surface-to-floor; Depth 1, "to center of pit", '
             + 'is 15.5 m and agrees.',
    azimuth: 55,
    overhang: 'Y?', overhangM: null,
    /* Entrance Ramp: Y, and the description says which side — "SW side is a
       ramp from rim to floor" — so the bearing is 225 and is quoted, not
       guessed. This is the only one of the four you can walk into. */
    ramp: 225,
    host: 'Marius Hills',
    note: 'Diamond-shaped, with a bowl floor and a ramp of collapse debris '
        + 'running from the rim all the way to the floor on the south-west '
        + 'side. A large linear collapse two kilometres north-west lines up '
        + 'with its long axis, which may be the tube still standing.',
    inferred: ['innerMax: the atlas gives N/A, so the shaft is circular at the '
               + 'published 47 m',
               'funnelDepth: not published for this pit at all'],
    atlas: 'https://lroc.im-ldi.com/atlases/pits/2',
  },
  {
    id: 'sw_tranquillitatis_pit',
    name: 'Southwest Mare Tranquillitatis pit',
    lat: 4.1438, lon: 24.6871,
    funnelMin: 80, funnelMax: 100,
    innerMin: 26, innerMax: 32,
    /* The description puts the funnel at "~20-25 m" of a 25 m pit, so almost
       all of this one is funnel and the inner drop is a step, not a shaft. */
    depth: 25, funnelDepth: 22,
    depthNote: 'Atlas Depth, surface-to-floor; Depth 1, "to center of pit", '
             + 'is 27.9 m.',
    azimuth: 165,
    overhang: '?', overhangM: null,
    ramp: null,
    host: 'Mare Tranquillitatis',
    note: 'A round pit with several floor levels, and a funnel of stepped lava '
        + 'layers exposed in its walls. The west side of the floor drops again '
        + 'into a second pit. It sits on the uphill side of a wrinkle ridge '
        + '2.3 km to the south-east.',
    inferred: ['funnelDepth is the middle of the description\'s "~20-25 m"'],
    atlas: 'https://lroc.im-ldi.com/atlases/pits/4',
  },
];

export const pitById = (id) => PITS.find((p) => p.id === id) || null;

const DEG = Math.PI / 180;
const R = 1737400;

/* How much of the pit's circumference the debris ramp occupies, degrees to
   either side of its bearing, and how far its toe spreads across the floor as
   a fraction of the shaft radius. Both are shape, not measurement: the atlas
   records that a ramp is there and which side it is on, not its plan form. */
const RAMP_ARC = 45;
const RAMP_TOE = 0.25;

/**
 * The radius of an ellipse at a bearing, given its two axes and orientation.
 * The atlas gives a min and a max diameter and the azimuth of the long axis,
 * which is exactly an ellipse and is worth honouring: these pits are visibly
 * elongated along their tube.
 */
function ellipseRadius(minD, maxD, azimuthDeg, bearingDeg) {
  const a = maxD / 2, b = minD / 2;
  const t = (bearingDeg - azimuthDeg) * DEG;
  const c = Math.cos(t), s = Math.sin(t);
  /* r(theta) for an ellipse measured from its centre. */
  return (a * b) / Math.sqrt(b * b * c * c + a * a * s * s);
}

/**
 * The radius of a pit's vertical shaft at a bearing, in metres.
 *
 * Exported because the cave under the Mare Tranquillitatis pit has to open off
 * the shaft wall at exactly the radius the terrain puts it, or there is a step
 * where the mesh meets the ground.
 */
export function shaftRadiusAt(pit, bearingDeg) {
  return ellipseRadius(pit.innerMin, pit.innerMax, pit.azimuth, bearingDeg);
}

/** The same, for the outer margin of the collapse funnel. */
export function funnelRadiusAt(pit, bearingDeg) {
  return ellipseRadius(pit.funnelMin, pit.funnelMax, pit.azimuth, bearingDeg);
}

/**
 * Depth below the surrounding surface at a point, in metres, for one pit.
 *
 * Three regions, which is what the atlas describes rather than what looks good:
 *
 *   outside the funnel   nothing
 *   the funnel           a concave cone from the margin down to the shaft mouth
 *   the shaft            vertical, to the floor
 *
 * The funnel is concave rather than straight because that is what a collapse
 * cone in loose regolith does: it eases out of the surrounding plain at its
 * margin and steepens as it approaches the hole. That is also why the atlas's
 * funnel diameter is a soft edge rather than a crest — there is no rim to stand
 * on, the ground simply starts going down. The exponent is the one free
 * parameter in this file and it is a shape, not a measurement.
 *
 * @returns {number} metres below the local surface, zero or negative
 */
export function pitDepthAt(pit, east, north) {
  const r = Math.hypot(east, north);
  const bearing = r < 1e-6 ? 0 : Math.atan2(east, north) / DEG;
  const rFunnel = ellipseRadius(pit.funnelMin, pit.funnelMax, pit.azimuth, bearing);
  if (r >= rFunnel) return 0;
  const rInner = ellipseRadius(pit.innerMin, pit.innerMax, pit.azimuth, bearing);

  let drop;
  if (r <= rInner) {
    drop = pit.depth;
  } else {
    /* Between the two: the funnel. `t` runs 0 at the outer margin to 1 at the
       shaft mouth. */
    const t = (rFunnel - r) / Math.max(1e-6, rFunnel - rInner);
    drop = pit.funnelDepth * Math.pow(t, 1.7);
  }

  /* Where the atlas flags an entrance ramp, collapse debris has piled against
     one side and spilled across the floor, and you can walk down it. That is
     the only way into any of these pits without flying.

     West Marius is the only one, and the atlas is specific about it: a ramp
     "from rim to floor" on the south-west side. So the ramp is modelled as a
     straight talus running the whole way — from the funnel margin, not from the
     shaft mouth — meeting the floor at a toe spread a little across it rather
     than at a cliff. Its flanks blend back into the wall over an arc, which is
     why the ground beside the ramp is still a wall: a wedge of debris banked
     against a vertical face is exactly that shape. */
  if (pit.ramp !== null && pit.ramp !== undefined) {
    const off = Math.abs(((bearing - pit.ramp + 540) % 360) - 180);
    if (off < RAMP_ARC) {
      /* Raised cosine: zero slope at the ramp's centre and at both its edges,
         so the sides of the pile are not ridges of their own. */
      const across = 0.5 * (1 + Math.cos(Math.PI * off / RAMP_ARC));
      const rToe = rInner * RAMP_TOE;
      const s = Math.min(1, (rFunnel - r) / Math.max(1e-6, rFunnel - rToe));
      drop = drop * (1 - across) + pit.depth * s * across;
    }
  }
  return -drop;
}

/**
 * Build a small high-resolution raster for one pit, ready for
 * `Heightfield.addRaster`.
 *
 * The patch is square, centred on the pit, and sized to hold the funnel with
 * room to blend out. One metre per pixel: fine enough that the shaft wall lands
 * within a pixel of vertical, coarse enough that the whole thing is under a
 * megabyte, and — the part that matters — fine enough that the band-limited
 * procedural detail stops inventing anything down to two-metre wavelengths, so
 * nothing is added on top of the published shape.
 *
 * @param {object} pit one of PITS
 * @param {number} baseHeight the surrounding surface elevation, metres
 * @param {object} opts { res_m }
 */
export function buildPitRaster(pit, baseHeight, opts = {}) {
  const res = opts.res_m ?? 1;
  /* Three funnel radii across, so the blend margin never touches the rim. */
  const halfM = Math.max(pit.funnelMax * 1.5, pit.funnelMax / 2 + 60);
  const n = Math.max(33, Math.ceil((halfM * 2) / res) | 1);
  const data = new Float32Array(n * n);
  const half = (n - 1) / 2;

  for (let j = 0; j < n; j++) {
    /* Row 0 is the north edge, so north decreases with j. */
    const north = (half - j) * res;
    for (let i = 0; i < n; i++) {
      const east = (i - half) * res;
      data[j * n + i] = baseHeight + pitDepthAt(pit, east, north);
    }
  }

  const mPerDeg = R * DEG;
  const dLat = halfM / mPerDeg;
  const dLon = dLat / Math.max(0.05, Math.cos(pit.lat * DEG));
  return {
    spec: {
      id: `pit:${pit.id}`,
      bbox: [pit.lon - dLon, pit.lat - dLat, pit.lon + dLon, pit.lat + dLat],
      width: n, height: n, res_m: res,
      /* Ahead of everything streamed: this is the only description of this
         ground at this scale that exists. */
      priority: 0,
      source: `LROC Lunar Pits Atlas: ${pit.name}`,
      label: LABEL.DERIVED,
      /* A wide blend, because the surrounding LOLA is 118 m per pixel and the
         seam between that and a metre-scale patch has to be a slope. */
      margin: dLat * 0.22,
    },
    data,
  };
}

/** Metres from a pit's centre, for range tests. */
export function distanceToPit(pit, lat, lon) {
  const dLat = (lat - pit.lat) * DEG;
  const dLon = (lon - pit.lon) * DEG * Math.cos(pit.lat * DEG);
  return Math.hypot(dLat, dLon) * R;
}
