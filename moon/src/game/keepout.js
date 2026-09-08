/* =============================================================================
   KEEP-OUT — not landing a rocket on somebody else's spacecraft
   -----------------------------------------------------------------------------
   The ship is the only thing in this game that edits the Moon. It flattens
   sixteen metres of ground under its legs, and a descent engine firing at the
   surface throws regolith outward at kilometres per second in a sheet a couple
   of degrees above the horizontal. Doing that on top of Tranquility Base would
   sandblast the descent stage, bury the retroreflector that is still being
   ranged from Earth every week, and erase the bootprints — which is a real
   concern and not a squeamish one, because those are the reasons the actual
   guidance on approaching these sites exists.

   So the landing site picker will not put you on top of hardware. Ask to land
   at Tranquility Base and you land two kilometres short of it, on the bearing
   you asked from, and walk or drive the rest. That is about twenty minutes on
   foot and eight in the rover, and it turns arriving at the site into an
   approach rather than a spawn point. You can still walk right up to the
   descent stage; nothing stops you standing next to it.

   ---------------------------------------------------------------------------
   HONESTY NOTE. NASA published recommendations in 2011 for how to approach the
   US government's lunar artifacts, and they do set descent, landing and
   surface-mobility limits of roughly this shape. This session could not
   retrieve that document to quote its numbers, so the radii below are this
   game's own and are not presented as anyone's published figure. They are
   sized from what the hardware is: two kilometres at the two sites whose
   surface equipment is both extensive and still in scientific use, five
   hundred metres at the rest of the crewed sites, and two hundred at robotic
   landers, which are small and mostly single objects. RESEARCH.md carries the
   same caveat.
   ========================================================================== */

import { surfaceDistance, bearing, offsetLatLon } from '../physics/frames.js';

/* The two sites with the most surface equipment still on them and still in
   use: Apollo 11's retroreflector and Apollo 17's are ranged from Earth to
   this day, and Apollo 17 left the largest experiment package of the
   programme. */
const WIDEST = new Set(['apollo11', 'apollo17']);

/** Metres of clear ground the ship keeps between itself and other hardware. */
export function keepOutRadius(site) {
  if (!site) return 0;
  if (WIDEST.has(site.id)) return 2000;
  if (site.kind === 'crewed') return 500;
  if (site.kind === 'robotic' || site.kind === 'rover') return 200;
  return 0;                        // landmarks are scenery, not hardware
}

/**
 * The nearest site whose keep-out a point falls inside, or null.
 *
 * @param {Array} sites  data/sites.json `sites`
 * @param {number} lat
 * @param {number} lon
 */
export function violated(sites, lat, lon) {
  let worst = null;
  for (const s of sites) {
    const r = keepOutRadius(s);
    if (!r) continue;
    const d = surfaceDistance(lat, lon, s.lat, s.lon);
    if (d >= r) continue;
    /* Deepest intrusion wins, so asking to land between two sites moves you
       clear of the one you were closest to breaking. */
    const depth = (r - d) / r;
    if (!worst || depth > worst.depth) worst = { site: s, radius: r, distance: d, depth };
  }
  return worst;
}

/**
 * Move a landing target out of any keep-out it falls inside.
 *
 * The direction is preserved: the ship ends up on the bearing from the site
 * towards where you asked to land, so picking a spot north of Tranquility Base
 * lands you north of it. Asking for the site itself has no bearing to preserve,
 * and gets `defaultBearing`, which for Apollo 11 points west — away from the
 * EASEP packages to the south and Little West crater to the east, and onto the
 * open mare the LM came in over.
 *
 * @returns {{lat, lon, moved, site, radius, distance, bearing}}
 */
export function clearLanding(sites, lat, lon, defaultBearing = 270) {
  const first = violated(sites, lat, lon);
  if (!first) return { lat, lon, moved: 0, site: null };

  /* Push out of the deepest violation, then look again, because the keep-outs
     overlap: Apollo 12 and Surveyor 3 are a hundred and sixty metres apart, so
     stepping clear of the Surveyor lands you inside the Apollo. Two passes
     settle that pair and the loop is bounded for anything worse. */
  let p = { lat, lon };
  let hit = first, b = 0;
  for (let n = 0; n < 8 && hit; n++) {
    b = hit.distance < 1 ? defaultBearing : bearing(hit.site.lat, hit.site.lon, p.lat, p.lon);
    /* Ten per cent past the boundary, so a rounding error at the edge does not
       leave you technically still inside it. */
    p = offsetLatLon(hit.site.lat, hit.site.lon, b, hit.radius * 1.1);
    hit = violated(sites, p.lat, p.lon);
  }

  /* If pushing out ever cycles between two discs, walk outwards from the
     original target instead and take the first clear ground found. This
     terminates whatever the site database grows into. */
  if (hit) {
    let best = null;
    for (let r = 300; r <= 12000 && !best; r += 300) {
      for (let a = 0; a < 360; a += 30) {
        const q = offsetLatLon(lat, lon, (defaultBearing + a) % 360, r);
        if (!violated(sites, q.lat, q.lon)) { best = q; break; }
      }
    }
    if (best) p = best;
  }

  return {
    lat: p.lat, lon: p.lon,
    moved: surfaceDistance(lat, lon, p.lat, p.lon),
    site: first.site, radius: first.radius, distance: first.distance, bearing: b,
  };
}

/* How much ground the modelled hardware itself stands on. Walking through this
   is fine and is the whole point of going; being *put* inside it is not, which
   is what `?site=apollo11` did before this existed: it dropped the camera in
   the middle of Eagle's descent stage, between the legs. */
const ARTIFACT_RADIUS = 25;
const STAND_OFF = 40;

/**
 * Nudge a standing position out of the hardware, facing it.
 *
 * Only a spawn is moved. Nothing stops you walking back in afterwards, and
 * nothing should: the site is a place to stand next to, not behind glass.
 *
 * @returns {{lat, lon, yaw, site}} yaw is the bearing back towards the site
 */
export function standClearOf(sites, lat, lon, defaultBearing = 270) {
  let near = null;
  for (const s of sites) {
    if (!keepOutRadius(s)) continue;                 // landmarks have no hardware
    const d = surfaceDistance(lat, lon, s.lat, s.lon);
    if (d < ARTIFACT_RADIUS && (!near || d < near.d)) near = { s, d };
  }
  if (!near) return { lat, lon, yaw: null, site: null };
  const b = near.d < 1 ? defaultBearing : bearing(near.s.lat, near.s.lon, lat, lon);
  const out = offsetLatLon(near.s.lat, near.s.lon, b, STAND_OFF);
  return { lat: out.lat, lon: out.lon, yaw: (b + 180) % 360, site: near.s };
}

/** One line for the picker, explaining what the game just did and why. */
export function explain(res) {
  if (!res || !res.site) return '';
  const km = res.radius >= 1000
    ? `${(res.radius / 1000).toFixed(0)} km` : `${res.radius} m`;
  return `${res.site.name} has hardware on the ground. Setting down ${km} away ` +
         `so the descent engine does not throw regolith over it — walk or drive in from there.`;
}
