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
    this.root = el('orbit');
    this.pick = null;
    this.visible = false;
    this.build();
  }

  build() {
    const presets = this.sites.presets
      .map(id => this.sites.sites.find(s => s.id === id))
      .filter(Boolean);
    el('orbit-presets').innerHTML = presets.map(s =>
      `<button data-id="${s.id}"><b>${s.name}</b><span>${s.sub || fmtLatLon(s.lat, s.lon)}</span></button>`
    ).join('');
    el('orbit-presets').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const s = presets.find(p => p.id === b.dataset.id);
      if (s) this.select(s.lat, s.lon, s);
    });

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
  }

  /** Find named features by prefix, nearest first among equal matches. */
  search(query) {
    const q = query.trim().toLowerCase();
    const out = el('orbit-results');
    if (q.length < 2) { out.innerHTML = ''; return; }
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
    }).join('') || '<div class="none">nothing by that name</div>';
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
    el('o-earth').textContent = sky
      ? (sky.earthEl > 0 ? `${sky.earthEl.toFixed(0)}° above the horizon` : 'never visible: far side')
      : '—';

    const unit = this.geologyAt(p.lat, p.lon);
    el('o-geol').textContent = unit || '—';
    el('o-data').textContent = p.probe
      ? `${p.probe.res_m < 10 ? p.probe.res_m.toFixed(1) : p.probe.res_m.toFixed(0)} m/px ${p.probe.label}`
      : '—';

    /* A warning rather than a prohibition. Steep is a bad idea, not illegal. */
    const warn = [];
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
