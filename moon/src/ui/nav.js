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
   ========================================================================== */

import { surfaceDistance, bearing } from '../physics/frames.js';
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
    this.visible = false;
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
  }
}
