/* =============================================================================
   NAVIGATION — knowing whether you can get back
   -----------------------------------------------------------------------------
   The rover's console, and the reason it exists is the one number at the bottom
   of it: how far you can still go and return. Three ranges stack here. Fuel is
   unlimited by design, so what limits an expedition is what the people inside
   need, and the honest question at any moment is whether the rover has enough
   left to get you home and whether your suit has enough left to walk it if the
   rover does not.

   Nothing here is a minimap. There is no fog of war to reveal and no icons to
   collect. It is a bearing, a distance, a rate, and the arithmetic that turns
   those into a decision, which is what a real traverse was planned on: Apollo
   crews drove under a walkback constraint, never going further from the lander
   than they could walk home on the oxygen they were carrying.

   There is a map, because the brief asked for one and because a topographic
   map is the instrument that decides whether the ground ahead is drivable. It
   is sampled live out of the same heightfield the wheels are on, shaded by
   slope rather than coloured by height — what a driver needs to know is where
   it gets steep, not what the datum is — and it carries the ship, the
   waypoints, and the line of where you have actually been. Nothing on it is
   revealed by exploring; it is measured ground and it was always there.
   ========================================================================== */

import { surfaceDistance, bearing, offsetLatLon } from '../physics/frames.js';
import { ROVER } from '../config.js';

const el = (id) => document.getElementById(id);

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function compass(deg) {
  return COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

export class Nav {
  constructor(opts = {}) {
    this.root = el('nav');
    this.waypoints = opts.waypoints || [];
    this.track = opts.track || null;
    this.hf = opts.heightfield || null;
    this.visible = false;
    this.map = el('n-map');
    this.ctx = this.map ? this.map.getContext('2d', { alpha: false }) : null;
    /* The map is 240 pixels of live heightfield sampling; at sixty frames a
       second that is three and a half million samples a second for a panel
       nobody is watching that closely. Twice a second is smooth enough to
       drive by. */
    this.mapAt = 0;
    this.mapSpan = 2400;               // metres across the whole map
    if (this.ctx) this.image = this.ctx.createImageData(this.map.width, this.map.height);
    if (el('n-mark')) {
      el('n-mark').addEventListener('click', () => {
        if (this.last) this.waypoints.push({ lat: this.last.lat, lon: this.last.lon });
      });
      el('n-clear').addEventListener('click', () => { this.waypoints.length = 0; });
    }
  }

  show(on) {
    if (this.visible === on) return;
    this.visible = on;
    if (this.root) this.root.style.display = on ? 'block' : 'none';
  }

  /**
   * @param {object} s {
   *   lat, lon, heading, elevation, slope, speed,
   *   home {lat, lon}, driven, roverHours, suitSeconds, nearest {name, km}
   * }
   */
  update(s) {
    if (!this.visible || !this.root) return;
    this.last = s;
    el('n-lat').textContent = `${Math.abs(s.lat).toFixed(4)}° ${s.lat >= 0 ? 'N' : 'S'}`;
    el('n-lon').textContent = `${Math.abs(s.lon).toFixed(4)}° ${s.lon >= 0 ? 'E' : 'W'}`;
    el('n-hdg').textContent = `${s.heading.toFixed(0)}°  ${compass(s.heading)}`;
    el('n-elev').textContent = s.elevation.toFixed(0) + ' m';
    el('n-slope').textContent = s.slope.toFixed(1) + '°';
    el('n-speed').textContent = (s.speed * 3.6).toFixed(1) + ' km/h';

    const home = s.home ? surfaceDistance(s.lat, s.lon, s.home.lat, s.home.lon) : null;
    el('n-home').textContent = home === null ? '—'
      : home > 1000 ? (home / 1000).toFixed(2) + ' km' : home.toFixed(0) + ' m';
    el('n-bearing').textContent = s.home
      ? `${bearing(s.lat, s.lon, s.home.lat, s.home.lon).toFixed(0)}°  ` +
        compass(bearing(s.lat, s.lon, s.home.lat, s.home.lon))
      : '—';
    el('n-driven').textContent = s.driven < 1000
      ? s.driven.toFixed(0) + ' m' : (s.driven / 1000).toFixed(2) + ' km';

    el('n-rover').textContent = Number.isFinite(s.roverHours)
      ? `${(s.roverHours / 24).toFixed(1)} days` : '—';
    el('n-suit').textContent = Number.isFinite(s.suitSeconds)
      ? `${Math.floor(s.suitSeconds / 3600)} h ${Math.floor(s.suitSeconds % 3600 / 60)} min` : '∞';

    /* The walkback constraint, which is how Apollo planned every traverse: never
       further from the lander than you could walk home on what you are
       carrying. Here that is the suit's remaining endurance at a lope, with a
       third of it held back for the fact that walking home is not a stroll and
       the ground is not flat. The rover's own consumables are the other bound,
       and the smaller of the two is the honest answer. */
    const roverReach = Number.isFinite(s.roverHours)
      ? s.roverHours * 3600 * ROVER.speedMax * 0.5 : Infinity;
    const walkReach = Number.isFinite(s.suitSeconds) ? s.suitSeconds * 1.35 * 0.66 : Infinity;
    const reach = Math.min(roverReach, walkReach);
    const node = el('n-reach');
    node.textContent = !Number.isFinite(reach) ? 'unlimited'
      : reach < 1000 ? `${reach.toFixed(0)} m from the ship`
      : `${(reach / 1000).toFixed(0)} km from the ship` +
        (walkReach < roverReach ? ', walkable' : '');
    node.className = 'v' + (home !== null && home > reach ? ' crit'
      : home !== null && home > reach * 0.7 ? ' warn' : '');

    el('n-near').textContent = s.nearest ? s.nearest.name : '—';
    el('n-neardist').textContent = s.nearest ? `${s.nearest.km.toFixed(1)} km` : '';
    const wp = this.waypoints[this.waypoints.length - 1];
    el('n-wp').textContent = wp
      ? `${(surfaceDistance(s.lat, s.lon, wp.lat, wp.lon) / 1000).toFixed(2)} km, ` +
        compass(bearing(s.lat, s.lon, wp.lat, wp.lon))
      : 'none';

    const now = performance.now();
    if (this.ctx && now - this.mapAt > 500) {
      this.mapAt = now;
      this.drawMap(s);
    }
  }

  /**
   * The ground around you, sampled out of the real heightfield.
   *
   * Slope shading rather than an elevation ramp: a driver needs to see where
   * the ground gets steep, and a colour ramp keyed to absolute height says
   * nothing useful inside a single crater. North is up and the map does not
   * rotate, because a map that turns under you is harder to plan on than one
   * that does not — the heading arrow turns instead.
   */
  drawMap(s) {
    const c = this.map, ctx = this.ctx, img = this.image;
    const W = c.width, H = c.height;
    const span = this.mapSpan;
    const half = span / 2;
    /* Sample coarsely and let the canvas scale it up: the map is 240 pixels
       and the ground it covers is two and a half kilometres, so ten metres a
       sample is already finer than the terrain under most of it. */
    const N = 96;
    const d = img.data;
    let lo = Infinity, hi = -Infinity;
    const h = new Float32Array(N * N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const north = half - (j + 0.5) / N * span;
        const east = (i + 0.5) / N * span - half;
        const p = offsetLatLon(s.lat, s.lon, Math.atan2(east, north) * 180 / Math.PI,
                               Math.hypot(east, north));
        const v = this.hf ? this.hf.heightAt(p.lat, p.lon) : 0;
        h[j * N + i] = v;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    const cell = span / N;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        /* Slope from the neighbours, lit from the north-west, which is the
           convention every topographic sheet uses. */
        const l = h[j * N + Math.max(0, i - 1)], r = h[j * N + Math.min(N - 1, i + 1)];
        const u = h[Math.max(0, j - 1) * N + i], dn = h[Math.min(N - 1, j + 1) * N + i];
        const gx = (r - l) / (2 * cell), gy = (dn - u) / (2 * cell);
        const shade = Math.max(0, Math.min(1, 0.55 + 0.75 * (gx * 0.7071 - gy * 0.7071)));
        /* Amber is a warning and has to stay one, so it starts where the
           rover starts to struggle rather than wherever the ground is not
           flat. Twenty-five degrees is past the traction limit on regolith at
           a sixth of a gravity; squaring it keeps the gentle majority grey. */
        const grade = Math.hypot(gx, gy) / 0.47;
        const steep = Math.min(1, grade * grade);
        const base = 30 + 160 * shade;
        const rr = base + 75 * steep, gg = base - 18 * steep, bb = base - 52 * steep;
        /* Scale the coarse grid up into the image. */
        const x0 = Math.floor(i * W / N), x1 = Math.floor((i + 1) * W / N);
        const y0 = Math.floor(j * H / N), y1 = Math.floor((j + 1) * H / N);
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const o = (y * W + x) * 4;
            d[o] = rr; d[o + 1] = gg; d[o + 2] = bb; d[o + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    /* Everything drawn on top is in metres north and east of the camera. */
    const toXY = (lat, lon) => {
      const range = surfaceDistance(s.lat, s.lon, lat, lon);
      const b = bearing(s.lat, s.lon, lat, lon) * Math.PI / 180;
      return [W / 2 + Math.sin(b) * range / span * W, H / 2 - Math.cos(b) * range / span * H];
    };

    /* Where you have been. */
    if (this.track && this.track.size > 1) {
      ctx.strokeStyle = 'rgba(232,201,160,.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (const p of this.track.tail(1200)) {
        const [x, y] = toXY(p.lat, p.lon);
        if (x < -W || x > 2 * W || y < -H || y > 2 * H) { started = false; continue; }
        if (started) ctx.lineTo(x, y); else { ctx.moveTo(x, y); started = true; }
      }
      ctx.stroke();
    }

    /* The ship, which is the number the whole console is about. */
    if (s.home) {
      const [x, y] = toXY(s.home.lat, s.home.lon);
      ctx.strokeStyle = '#9fd0cc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y);
      ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#8fb8e8';
    for (const w of this.waypoints) {
      const [x, y] = toXY(w.lat, w.lon);
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }

    /* You, pointing where you are pointing. */
    const yaw = (s.heading ?? 0) * Math.PI / 180;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(yaw);
    ctx.fillStyle = '#e8c9a0';
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(4, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (el('n-map-scale')) {
      el('n-map-scale').textContent = `${(span / 1000).toFixed(1)} km across, north up`;
    }
    if (el('n-map-relief')) {
      el('n-map-relief').textContent = Number.isFinite(hi - lo)
        ? `${(hi - lo).toFixed(0)} m of relief` : '—';
    }
  }
}
