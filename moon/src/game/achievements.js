/* =============================================================================
   ACHIEVEMENTS — a list of real places, not a list of tasks
   -----------------------------------------------------------------------------
   The brief was specific about this: a non-blocking list marking real places
   reached rather than things the game asked you to do. So there is nothing here
   to complete, nothing that unlocks anything, and nothing that appears until it
   has already happened. Every entry is a fact about the Moon and about where
   you have actually stood on it.

   Four kinds, and each one is checked against measured data rather than against
   a flag the game set for itself:

     places     named features you have been inside, from the IAU gazetteer
     landings   the sites of real spacecraft, from data/sites.json
     ground     what the terrain says about where you have been: the deepest,
                the highest, the steepest, the furthest from the ship
     distance   how far you have walked and driven

   Nothing is ranked and nothing is scored. The whole point of the list is that
   reading it back is a description of a real expedition on a real Moon.

   Pure: no DOM and no three.js, checked in Node like everything else that
   decides anything.
   ========================================================================== */

import { surfaceDistance } from '../physics/frames.js';

/* The distance from a site's published coordinates that counts as having been
   there. Fifty metres is close enough to see the hardware and far enough that
   the published precision — a few metres at best, worse for the Luna craft —
   does not decide it. */
const AT_SITE = 50;
/* The skylights are 55 and 100 metres across, so the rim is the thing to be
   near rather than the published centre. */
const AT_PIT = 150;

/* Milestones in metres. Apollo 17 drove 35.7 km, which is the most anyone has
   travelled on another world, so that is the one worth naming. */
const WALKED = [
  [1000, 'a kilometre on foot'],
  [7600, 'further on foot than any Apollo crew walked in a day'],
  [25000, 'twenty-five kilometres on foot'],
];
const DRIVEN = [
  [10000, 'ten kilometres driven'],
  [35700, 'further than Apollo 17 drove, which is the record on another world'],
  [100000, 'a hundred kilometres driven'],
  [500000, 'five hundred kilometres driven'],
];

export class Achievements {
  /**
   * @param {object} opts { sites: data/sites.json, names: data/names.json }
   */
  constructor(opts = {}) {
    this.sites = (opts.sites && opts.sites.sites) || [];
    this.names = (opts.names && opts.names.features) || [];
    this.earned = new Map();          // id -> { id, title, note, simMs }
    this.extremes = {
      deepest: null, highest: null, steepest: null, furthest: null,
    };
  }

  /** Record one, once. Returns the entry if it is new. */
  award(id, title, note, simMs) {
    if (this.earned.has(id)) return null;
    const e = { id, title, note: note || '', simMs: Number.isFinite(simMs) ? simMs : null };
    this.earned.set(id, e);
    return e;
  }

  get size() { return this.earned.size; }
  has(id) { return this.earned.has(id); }

  /**
   * Everything the game knows about where you are, once a second or so.
   *
   * @param {object} s {
   *   lat, lon, elevation, slope, simMs, onFoot,
   *   walked, driven, homeRange, nearestFeature, visited
   * }
   * @returns {Array} whatever was newly earned, for the caller to announce
   */
  step(s) {
    const got = [];
    const push = (e) => { if (e) got.push(e); };
    if (!Number.isFinite(s.lat) || !Number.isFinite(s.lon)) return got;

    /* Real hardware. Being at a landing site is the single most specific thing
       you can do on this Moon, and it is checked against the published
       coordinates rather than against a trigger volume someone placed.

       The two lava-tube skylights come with them, at a radius that matches
       their published diameters rather than a lander's: standing on the roof
       of an intact lava tube is the only known way anyone would get into the
       lunar subsurface, which makes them worth reaching for what they are.
       Every other landmark is a place you pass through, and `visited` records
       those. */
    for (const site of this.sites) {
      const pit = site.kind === 'landmark' && /_pit$/.test(site.id);
      if (site.kind === 'landmark' && !pit) continue;
      if (this.has('site:' + site.id)) continue;
      if (surfaceDistance(s.lat, s.lon, site.lat, site.lon) > (pit ? AT_PIT : AT_SITE)) continue;
      push(this.award('site:' + site.id, site.name,
                      site.sub || 'a real landing site', s.simMs));
    }

    /* Named ground. `visited` already records what you have been inside, so
       this only adds the ones worth saying out loud: a feature big enough to
       be a place rather than a satellite crater. */
    const near = s.nearestFeature;
    if (near && near.inside && (near.f[4] || 0) >= 20) {
      const name = near.f[0];
      push(this.award('feature:' + name, name,
                      `${near.f[1]}, ${(near.f[4] || 0).toFixed(0)} km across`, s.simMs));
    }

    /* What the ground says. These are records rather than badges: the deepest
       place you have stood is a fact about your expedition. */
    this.record('deepest', s, (v, best) => v < best, s.elevation, 'the lowest ground you have stood on');
    this.record('highest', s, (v, best) => v > best, s.elevation, 'the highest ground you have stood on');
    this.record('steepest', s, (v, best) => v > best, s.slope, 'the steepest ground you have stood on');
    this.record('furthest', s, (v, best) => v > best, s.homeRange, 'the furthest you have been from the ship');

    for (const [m, title] of WALKED) {
      if (s.walked >= m) push(this.award('walked:' + m, title, '', s.simMs));
    }
    for (const [m, title] of DRIVEN) {
      if (s.driven >= m) push(this.award('driven:' + m, title, '', s.simMs));
    }

    /* Two places on the Moon that are their own achievement for what they are
       rather than for anything anyone left there. */
    if (Math.abs(s.lat) > 89 && !this.has('pole')) {
      push(this.award('pole', 'a lunar pole',
                      'where the Sun never rises more than a couple of degrees', s.simMs));
    }
    if (Math.abs(((s.lon + 180) % 360 + 360) % 360 - 180) > 100 && !this.has('farside')) {
      push(this.award('farside', 'the far side',
                      'no Earth in the sky, and no line of sight home', s.simMs));
    }
    return got;
  }

  /** Keep a running extreme, with where and when it happened. */
  record(key, s, better, value, note) {
    if (!Number.isFinite(value)) return;
    const cur = this.extremes[key];
    if (cur && !better(value, cur.value)) return;
    this.extremes[key] = { value, lat: s.lat, lon: s.lon, simMs: s.simMs, note };
  }

  /** Most recent first, which is how a log wants to be read. */
  list() { return [...this.earned.values()].reverse(); }

  capture() {
    return { earned: [...this.earned.values()], extremes: this.extremes };
  }

  load(data) {
    this.earned.clear();
    this.extremes = { deepest: null, highest: null, steepest: null, furthest: null };
    if (!data) return this;
    if (Array.isArray(data.earned)) {
      for (const e of data.earned) {
        if (e && typeof e.id === 'string') this.earned.set(e.id, { ...e });
      }
    }
    if (data.extremes && typeof data.extremes === 'object') {
      for (const k of Object.keys(this.extremes)) {
        const v = data.extremes[k];
        if (v && Number.isFinite(v.value)) this.extremes[k] = { ...v };
      }
    }
    return this;
  }
}
