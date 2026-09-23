/* =============================================================================
   ORBIT — choosing where to land
   -----------------------------------------------------------------------------
   The game opens here, in orbit, looking at the real Moon. Turn it, zoom in,
   pick a spot, and go down.

   Nothing here is a separate globe. It is the same streaming terrain the rest of
   the game renders, seen from a few hundred kilometres up, which is the whole
   point: the crater you pick out from orbit is the crater you land in, at the
   size and shape LOLA measured it.

   Picking a point is done by intersecting the view ray with the sphere and then
   walking the intersection down onto the real surface, rather than by hit
   testing the terrain meshes. At this altitude a tile is tens of kilometres
   across and may not be resident yet, and the heightfield knows the elevation
   everywhere regardless of what has been built.

   The readouts are the ones that decide whether a place is landable: how high it
   is, how steep it is, what the geology map calls it, where the Sun is, and what
   the nearest named thing is. There are eight and a half thousand named features
   on the Moon and the search box will find any of them.
   ========================================================================== */

import { R_MOON } from '../config.js';
import { llhToXyz, xyzToLlh, enuBasis } from '../physics/frames.js';
import { clearLanding, explain as explainKeepOut } from '../game/keepout.js';
import { FEATURED } from '../data/featured.js';
import { drawPreview, spanLabel } from './preview.js';

const el = (id) => document.getElementById(id);

export class OrbitPicker {
  /**
   * @param {object} opts {
   *   heightfield, names, sites, geology, cam, getSky, onLand, onOverlay
   * }
   */
  constructor(opts) {
    this.hf = opts.heightfield;
    this.names = opts.names;
    this.sites = opts.sites;
    this.geology = opts.geology;
    this.cam = opts.cam;
    this.onLand = opts.onLand;
    this.onOverlay = opts.onOverlay || (() => {});
    this.getSky = opts.getSky;
    /* The clock, so the picker can set the epoch it will land at. */
    this.getTime = opts.getTime || (() => Date.now());
    /* The LROC colour mosaic as a plain image, for the previews. Optional:
       without it they come out as greyscale relief, which still reads. */
    this.colour = opts.colour || null;
    this.onTime = opts.onTime || (() => {});
    this.kind = 'crewed';
    this.root = el('orbit');
    this.pick = null;
    this.visible = false;
    this.build();
  }

  build() {
    /* The shortlist, with a picture each. `data/featured.js` says which places
       and how wide to draw them; the catalogue still says where they are and
       what they are. The cards carry `data-id` and the delegate below resolves
       it exactly as the old plain buttons did, so nothing about picking has
       changed — only that you can now see what you are picking. */
    const presets = FEATURED
      .map(f => ({ f, s: this.sites.sites.find(s => s.id === f.id) }))
      .filter(x => x.s);
    el('orbit-presets').innerHTML = presets.map(({ f, s }) => `
      <button class="card" data-id="${s.id}">
        <canvas class="thumb" width="240" height="104" data-for="${s.id}"></canvas>
        <b>${s.name}</b>
        <span>${f.why}</span>
        <i>${spanLabel(f.span)} &middot; ${fmtLatLon(s.lat, s.lon)}</i>
      </button>`).join('');
    el('orbit-presets').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const s = presets.find(p => p.s.id === b.dataset.id);
      if (s) this.select(s.s.lat, s.s.lon, s.s);
    });
    this._featured = presets;

    this.buildSites();
    this.buildWhen();

    const search = el('orbit-search');
    search.addEventListener('input', () => this.search(search.value));
    el('orbit-results').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      this.select(Number(b.dataset.lat), Number(b.dataset.lon),
                  { name: b.dataset.name, sub: b.dataset.sub });
      search.value = '';
      el('orbit-results').innerHTML = '';
    });

    /* The overlays. Each one is a dataset rather than a view of the Moon, so
       each carries a line saying what it is and where it came from. */
    const overlays = [
      ['imagery', 0, 'LROC imagery and the LOLA colour map, lit by the real Sun'],
      ['elevation', 1, 'LOLA elevation, -9.0 to +10.7 km about the 1737.4 km datum'],
      ['slope', 2, 'surface slope over one pixel, 0 to 35 degrees'],
      ['geology', 3, 'USGS Unified Geologic Map of the Moon, 1:5 M, unit colours'],
      ['sunlight', 4, 'lit or shadowed right now, from the real Sun and the terrain skyline'],
      ['temperature', 5, 'Diviner daytime maximum; purple is ground that never passes 60 K'],
    ];
    el('orbit-overlays').innerHTML = overlays
      .map(([name, v]) => `<button data-o="${v}">${name}</button>`).join('');
    el('orbit-overlays').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const v = Number(b.dataset.o);
      this.onOverlay(v);
      for (const x of el('orbit-overlays').querySelectorAll('button')) {
        x.classList.toggle('on', Number(x.dataset.o) === v);
      }
      el('orbit-legend').textContent = (overlays.find(o => o[1] === v) || [])[2] || '';
    });
    el('orbit-overlays').querySelector('button').classList.add('on');
    el('orbit-legend').textContent = overlays[0][2];

    el('orbit-land').addEventListener('click', () => {
      if (this.pick) this.onLand(this.pick);
    });
  }

  show(on) {
    this.visible = on;
    this.root.style.display = on ? 'block' : 'none';
    if (on) this.drawPreviews();
  }

  /**
   * Fill in the featured cards' thumbnails.
   *
   * Deferred rather than done in `build()`, which runs before the global
   * elevation has finished loading and before the colour mosaic exists as an
   * image — a card drawn then would be a flat grey rectangle, permanently.
   * Called on every `show`, and cheap enough to be: thirteen cards at a 96
   * sample grid is about a hundred and twenty thousand `heightAt` calls
   * against a resident raster, which is a few tens of milliseconds once.
   * `done` stops it repeating for cards that already came out right.
   */
  drawPreviews() {
    if (!this._featured) return;
    this._drawn = this._drawn || new Set();
    for (const { f, s } of this._featured) {
      if (this._drawn.has(s.id)) continue;
      const canvas = this.root.querySelector(`canvas[data-for="${s.id}"]`);
      if (!canvas) continue;
      const ok = drawPreview(canvas, {
        heightfield: this.hf, colour: this.colour,
        lat: s.lat, lon: s.lon, spanKm: f.span,
      });
      /* Only remember it as done once the photograph is in it as well as the
         relief, or a card drawn during the first second keeps its grey. */
      if (ok && this.colour && this.colour.complete) this._drawn.add(s.id);
    }
  }

  /** The colour mosaic, once the game has it. Redraws whatever was grey. */
  setColour(image) {
    this.colour = image;
    this._drawn = new Set();
    if (this.visible) this.drawPreviews();
  }

  /** Find named features by prefix, nearest first among equal matches. */
  /* --- where people and machines have landed ---------------------------------
     Every site in data/sites.json, grouped by what put it there. The file has
     carried all forty-five since the first commit — six crewed landings, two
     rovers, twenty robotic craft and seventeen landmarks, each with published
     coordinates, a citation and a sentence about why it matters — and the
     picker offered eight of them as presets and no way to reach the rest. The
     brief asked for historic sites as a first-class thing to go and find, and
     a list of real places is the whole content of this game. */
  buildSites() {
    const host = el('orbit-sites'), kinds = el('orbit-kinds');
    if (!host || !kinds) return;
    const KINDS = [
      ['crewed', 'crewed'], ['rover', 'rovers'],
      ['robotic', 'robotic'], ['landmark', 'landmarks'],
    ];
    const have = KINDS.filter(([k]) => this.sites.sites.some(s => s.kind === k));
    kinds.innerHTML = have.map(([k, label]) =>
      `<button data-kind="${k}">${label}</button>`).join('');
    kinds.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      this.kind = b.dataset.kind;
      this.renderSites();
    });
    host.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const site = this.sites.sites.find(x => x.id === b.dataset.id);
      if (site) this.select(site.lat, site.lon, site);
    });
    this.renderSites();
  }

  renderSites() {
    const host = el('orbit-sites'), kinds = el('orbit-kinds');
    if (!host) return;
    for (const b of kinds.querySelectorAll('button')) {
      b.classList.toggle('on', b.dataset.kind === this.kind);
    }
    const list = this.sites.sites.filter(s => s.kind === this.kind);
    host.innerHTML = list.map(s =>
      `<button data-id="${s.id}"><b>${s.name}</b>` +
      `<span>${s.sub || fmtLatLon(s.lat, s.lon)}</span></button>`).join('') ||
      '<div class="none">none of those</div>';
  }

  /* --- when ------------------------------------------------------------------
     A lunar day is twenty-nine and a half Earth days, so when you arrive
     decides what a place looks like more than almost anything else: the same
     coordinates are a flat grey plain at noon and a landscape of kilometre
     shadows two Earth-days either side of sunrise. That was settable only by
     editing the URL. */
  buildWhen() {
    const date = el('orbit-date'), time = el('orbit-time'), now = el('orbit-now');
    if (!date || !time) return;
    const push = () => {
      if (!date.value) return;
      const ms = Date.parse(`${date.value}T${time.value || '00:00'}:00Z`);
      if (Number.isFinite(ms)) { this.onTime(ms); this.renderWhen(); }
    };
    date.addEventListener('change', push);
    time.addEventListener('change', push);
    if (now) now.addEventListener('click', () => { this.onTime(Date.now()); this.syncWhen(); });
    this.syncWhen();
  }

  /** Put the current simulated time into the two fields. */
  syncWhen() {
    const date = el('orbit-date'), time = el('orbit-time');
    if (!date || !time) return;
    const iso = new Date(this.getTime()).toISOString();
    date.value = iso.slice(0, 10);
    time.value = iso.slice(11, 16);
    this.renderWhen();
  }

  renderWhen() {
    const node = el('orbit-when');
    if (!node) return;
    const p = this.pick;
    const sky = p && this.getSky ? this.getSky(p.lat, p.lon) : null;
    node.textContent = sky
      ? `${new Date(this.getTime()).toISOString().replace('T', ' ').slice(0, 16)} UTC · ` +
        `sun ${sky.sunEl.toFixed(1)}° at the chosen site`
      : `${new Date(this.getTime()).toISOString().replace('T', ' ').slice(0, 16)} UTC`;
  }

  /**
   * Coordinates, if that is what was typed.
   *
   * The Moon has nine thousand named features and rather more than nine
   * thousand places, and every published landing site, every candidate, every
   * Artemis region and every set of coordinates in a paper is a pair of
   * numbers rather than a name. Typing one used to return "nothing by that
   * name", which is a search that refuses the most precise thing you can ask
   * it. Accepts `0.674, 23.473`, `0.674N 23.473E`, `23.473E 0.674N`, degrees
   * with or without a sign, and a decimal point or a comma between the two.
   */
  static parseCoordinates(text) {
    const t = text.trim().replace(/[°\u00ba]/g, ' ');
    /* Two signed decimals with a separator, each optionally carrying a
       hemisphere letter. */
    const NUM = '([+-]?\\d+(?:\\.\\d+)?)\\s*([NSEWnsew])?';
    const m = t.match(new RegExp(`^\\s*${NUM}\\s*[,;\\s]\\s*${NUM}\\s*$`));
    if (!m) return null;
    const a = Number(m[1]), b = Number(m[3]);
    const aTag = (m[2] || '').toUpperCase(), bTag = (m[4] || '').toUpperCase();
    const signed = (v, tag, neg) => (tag === neg ? -Math.abs(v) : tag ? Math.abs(v) : v);
    let lat, lon;
    /* Either order, when the letters say which is which; latitude first when
       they do not, which is how every source in this project quotes it. */
    const aIsLon = aTag === 'E' || aTag === 'W';
    const bIsLat = bTag === 'N' || bTag === 'S';
    if (aIsLon || bIsLat) {
      lon = signed(a, aTag, 'W');
      lat = signed(b, bTag, 'S');
    } else {
      lat = signed(a, aTag, 'S');
      lon = signed(b, bTag, 'W');
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (Math.abs(lat) > 90) return null;
    /* Positive east: a paper quoting 337 E means the same place as one quoting
       -23. Only rewritten when it needs to be, so a typed 23.473 comes back as
       23.473 and not as 23.472999999999956. */
    if (lon > 180 || lon < -180) lon = ((lon + 180) % 360 + 360) % 360 - 180;
    return { lat, lon };
  }

  search(query) {
    const q = query.trim().toLowerCase();
    const out = el('orbit-results');
    if (q.length < 2) { out.innerHTML = ''; return; }

    const coord = OrbitPicker.parseCoordinates(query);
    if (coord) {
      const near = this.nearestFeature(coord.lat, coord.lon);
      const where = near
        ? (near.inside ? `inside ${near.f[0]}` : `${near.km.toFixed(0)} km from ${near.f[0]}`)
        : 'open ground';
      const name = `${Math.abs(coord.lat).toFixed(4)}° ${coord.lat >= 0 ? 'N' : 'S'}, ` +
                   `${Math.abs(coord.lon).toFixed(4)}° ${coord.lon >= 0 ? 'E' : 'W'}`;
      out.innerHTML =
        `<button data-lat="${coord.lat}" data-lon="${coord.lon}" ` +
        `data-name="${name}" data-sub="${where}">` +
        `<b>${name}</b><span>${where}</span></button>`;
      return;
    }

    const hits = [];
    for (const f of this.names.features) {
      const name = f[0];
      const i = name.toLowerCase().indexOf(q);
      if (i < 0) continue;
      hits.push({ f, score: i === 0 ? 0 : 1, size: f[4] || 0 });
      if (hits.length > 400) break;
    }
    hits.sort((a, b) => a.score - b.score || b.size - a.size);
    out.innerHTML = hits.slice(0, 12).map(({ f }) => {
      const [name, type, lat, lon, diam] = f;
      const sub = diam ? `${type} · ${diam.toFixed(0)} km` : type;
      return `<button data-lat="${lat}" data-lon="${lon}" data-name="${name}" data-sub="${sub}">` +
             `<b>${name}</b><span>${sub}</span></button>`;
    }).join('') ||
      '<div class="none">nothing by that name — coordinates work too, ' +
      'as <span class="mono">0.674, 23.473</span></div>';
  }

  /** Turn the globe to a place and mark it as the candidate landing site. */
  select(lat, lon, meta = null) {
    this.cam.lat = lat;
    this.cam.lon = lon;
    this.setPick(lat, lon, meta);
  }

  setPick(lat, lon, meta = null) {
    const h = this.hf.heightAt(lat, lon);
    const slope = this.hf.slopeAt(lat, lon, 60);
    const probe = this.hf.probe ? this.hf.probe(lat, lon) : null;
    this.pick = { lat, lon, elevation: h, slope, meta, probe };
    this.render();
    this.renderWhen();
  }

  /**
   * Where a ray from the camera meets the ground.
   *
   * The sphere gives a first guess and then the real elevation is stepped in:
   * a 5 km mountain seen at a shallow angle is nearly a kilometre away from
   * where the sphere says it is, which is the difference between landing on
   * Malapert massif and landing beside it.
   *
   * @returns {{lat, lon}|null}
   */
  rayToGround(origin, dir) {
    let radius = R_MOON;
    for (let i = 0; i < 6; i++) {
      const t = intersectSphere(origin, dir, radius);
      if (t === null) return null;
      const p = { x: origin.x + dir.x * t, y: origin.y + dir.y * t, z: origin.z + dir.z * t };
      const llh = xyzToLlh(p.x, p.y, p.z);
      const h = this.hf.heightAt(llh.lat, llh.lon);
      if (Math.abs(radius - (R_MOON + h)) < 20) return { lat: llh.lat, lon: llh.lon };
      radius = R_MOON + h;
    }
    const t = intersectSphere(origin, dir, radius);
    if (t === null) return null;
    const p = { x: origin.x + dir.x * t, y: origin.y + dir.y * t, z: origin.z + dir.z * t };
    const llh = xyzToLlh(p.x, p.y, p.z);
    return { lat: llh.lat, lon: llh.lon };
  }

  /** The named feature a point falls inside or nearest to. */
  nearestFeature(lat, lon) {
    let best = null, bestScore = Infinity;
    const clat = Math.cos(lat * Math.PI / 180);
    for (const f of this.names.features) {
      const dLat = (f[2] - lat), dLon = angleDelta(f[3], lon) * clat;
      const km = Math.hypot(dLat, dLon) * Math.PI / 180 * R_MOON / 1000;
      const r = (f[4] || 1) / 2;
      /* Inside a feature beats being near a bigger one further away. */
      const score = km < r ? -r : km - r;
      if (score < bestScore) { bestScore = score; best = { f, km, inside: km < r }; }
    }
    return best;
  }

  render() {
    const p = this.pick;
    if (!p) return;
    const near = this.nearestFeature(p.lat, p.lon);
    const sky = this.getSky ? this.getSky(p.lat, p.lon) : null;

    el('o-latlon').textContent = fmtLatLon(p.lat, p.lon);
    el('o-elev').textContent = p.elevation.toFixed(0) + ' m';
    el('o-slope').textContent = p.slope.toFixed(1) + '°';
    el('o-near').textContent = near
      ? (near.inside ? `inside ${near.f[0]}` : `${near.km.toFixed(0)} km from ${near.f[0]}`)
      : '—';
    el('o-sun').textContent = sky
      ? `${sky.sunEl.toFixed(1)}° elevation, ${sky.sunAz.toFixed(0)}° azimuth`
      : '—';
    /* Three answers, not two. Below the horizon *now* and out of the Earth's
       reach *for good* are different facts, and `ephemerisAt` has always
       separated them — this printed "never visible: far side" for any negative
       elevation, which is the exact bug the README records fixing elsewhere,
       still live in the picker. Shackleton is 90.2 degrees from the mean
       sub-Earth point: the Earth sits on its horizon and rises and sets over a
       month, and calling that the far side is simply wrong. */
    el('o-earth').textContent = !sky ? '—'
      : sky.farSide ? 'never visible: far side'
      : sky.earthEl > 0 ? `${sky.earthEl.toFixed(0)}° above the horizon`
      : 'below the horizon now; librates into view over a month';

    const unit = this.geologyAt(p.lat, p.lon);
    el('o-geol').textContent = unit || '—';
    el('o-data').textContent = p.probe
      ? `${p.probe.res_m < 10 ? p.probe.res_m.toFixed(1) : p.probe.res_m.toFixed(0)} m/px ${p.probe.label}`
      : '—';

    /* A warning rather than a prohibition. Steep is a bad idea, not illegal.
       The keep-out is the exception: that one is not advice, it is what the
       game is about to do, so it is said before you press the button rather
       than discovered when the ship comes down two kilometres off. */
    const warn = [];
    const clear = clearLanding(this.sites.sites, p.lat, p.lon);
    if (clear.site) warn.push(explainKeepOut(clear));
    if (p.slope > 15) warn.push(`${p.slope.toFixed(0)}° slope: the ship will land, but the rover will struggle`);
    if (sky && sky.sunEl < 3 && sky.sunEl > -3) warn.push('the Sun is on the horizon: shadows will run for kilometres');
    if (sky && sky.sunEl <= -3) warn.push('lunar night: nothing but earthshine and your lamps');
    el('o-warn').innerHTML = warn.map(w => `<div>${w}</div>`).join('');

    el('orbit-name').textContent = p.meta && p.meta.name ? p.meta.name
      : near && near.inside ? near.f[0] : 'unnamed ground';
    el('orbit-sub').textContent = p.meta && p.meta.sub ? p.meta.sub
      : near ? `${near.f[1]}` : '';
    el('orbit-blurb').textContent = p.meta && p.meta.blurb ? p.meta.blurb : '';
  }

  geologyAt(lat, lon) {
    const g = this.geology;
    if (!g || !g.legend) return null;
    const x = Math.min(g.width - 1, Math.max(0, ((lon + 180) / 360 * g.width) | 0));
    const y = Math.min(g.height - 1, Math.max(0, ((90 - lat) / 180 * g.height) | 0));
    const u = g.legend.units[String(g.data[y * g.width + x])];
    return u ? `${u.name} (${u.code})` : null;
  }
}

/* --- geometry --------------------------------------------------------------- */

/** Nearest positive intersection of a ray with a sphere about the origin. */
function intersectSphere(o, d, radius) {
  const b = o.x * d.x + o.y * d.y + o.z * d.z;
  const c = o.x * o.x + o.y * o.y + o.z * o.z - radius * radius;
  const disc = b * b - c;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  const t1 = -b - s, t2 = -b + s;
  if (t1 > 0) return t1;
  if (t2 > 0) return t2;
  return null;
}

function angleDelta(a, b) {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

export function fmtLatLon(lat, lon) {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}  ` +
         `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;
}
