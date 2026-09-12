/* =============================================================================
   THE COMPASS — which way you are facing, and how far you have walked
   -----------------------------------------------------------------------------
   A heading tape across the top of the screen: cardinal letters and ten degree
   ticks sliding past a centre mark, the bearing under it, and the distance you
   have covered beside it. Transparent, no panel behind it, because it is an
   instrument rather than a readout — the ground should show through.

   Almost none of this is new. `compass()` has been in ui/nav.js since the nav
   console was written, `player.heading` has been in the player's snapshot the
   whole time, and `player.distance` has been accumulating every step. None of
   the three was read by anything you could see on foot. The distance was
   displayed, but in a slot it shares with the jetpack heat readout, so it
   vanished exactly when you were moving most.

   The marked-waypoint pip is here rather than on the map because it answers a
   question the map cannot while you are looking at the ground: not "where is
   it" but "am I pointing at it". It only ever shows the last mark, which is
   the one the nav console also reports.
   ========================================================================== */

import { surfaceDistance, bearing } from '../physics/frames.js';
import { compass } from './nav.js';

const el = (id) => document.getElementById(id);

/* How much of the horizon the tape shows. 120 degrees means a third of the
   compass is visible at once, which is enough to see the next cardinal coming
   without the ticks crowding together. */
const FIELD = 120;

export class Compass {
  constructor(opts = {}) {
    this.canvas = el('compass-tape');
    this.waypoints = opts.waypoints || [];
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.visible = true;
  }

  show(on) {
    this.visible = !!on;
    const r = el('compass');
    if (r) r.style.display = this.visible ? 'block' : 'none';
  }

  /**
   * @param {object} s {
   *   heading   degrees, 0 north — the rover's while driving, yours on foot
   *   lat, lon  for the waypoint bearing and range
   *   walked    metres on foot
   *   driven    metres in the rover
   *   driving   which of the two to lead with
   * }
   */
  update(s) {
    if (!this.visible) return;
    const hdg = ((s.heading ?? 0) % 360 + 360) % 360;

    if (el('compass-deg')) {
      el('compass-deg').textContent = `${hdg.toFixed(0).padStart(3, '0')}°  ${compass(hdg)}`;
    }
    if (el('compass-dist')) {
      /* Both, always, and never sharing a slot with anything that can hide
         them. Walked leads on foot and driven leads in the rover, because that
         is the number you are adding to. */
      const km = (m) => (m / 1000).toFixed(m < 10000 ? 2 : 1);
      el('compass-dist').textContent = s.driving
        ? `${km(s.driven || 0)} km driven · ${km(s.walked || 0)} walked`
        : `${km(s.walked || 0)} km walked · ${km(s.driven || 0)} driven`;
    }

    const wp = this.waypoints[this.waypoints.length - 1];
    let mark = null;
    if (wp && Number.isFinite(s.lat)) {
      mark = {
        brg: bearing(s.lat, s.lon, wp.lat, wp.lon),
        range: surfaceDistance(s.lat, s.lon, wp.lat, wp.lon),
      };
    }
    if (el('compass-mark')) {
      el('compass-mark').textContent = mark
        ? `mark ${(mark.range / 1000).toFixed(mark.range < 10000 ? 2 : 1)} km ${compass(mark.brg)}`
        : '';
    }
    this.draw(hdg, mark);
  }

  draw(hdg, mark) {
    const c = this.canvas, ctx = this.ctx;
    if (!c || !ctx) return;
    /* Size the backing store from the box CSS gave it, times the device pixel
       ratio, and then scale the context so everything below is drawn in CSS
       pixels. Without this the canvas keeps its markup size and the browser
       scales it to fit: the first version was 840 wide inside a 420 wide box,
       so every tick and letter came out at half the size it was drawn at, and
       11px type rendered at five. */
    const box = c.getBoundingClientRect();
    const W = Math.max(120, Math.round(box.width));
    const H = Math.max(20, Math.round(box.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    /* Where a bearing sits on the tape, wrapped to the nearest way round so a
       tick does not fly across the width as you pass north. */
    const xOf = (deg) => {
      let d = ((deg - hdg) % 360 + 540) % 360 - 180;
      return W / 2 + d / FIELD * W;
    };

    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    for (let deg = 0; deg < 360; deg += 10) {
      const x = xOf(deg);
      if (x < -20 || x > W + 20) continue;
      const cardinal = deg % 90 === 0;
      const major = deg % 30 === 0;
      /* Fade at the edges, so the tape reads as a band of horizon rather than
         a strip that stops. */
      const edge = Math.min(1, Math.min(x, W - x) / (W * 0.16));
      ctx.globalAlpha = Math.max(0, edge) * (cardinal ? 0.95 : major ? 0.6 : 0.35);
      ctx.strokeStyle = '#e8c9a0';
      ctx.lineWidth = cardinal ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(x, H - (cardinal ? 12 : major ? 9 : 6));
      ctx.lineTo(x, H - 1);
      ctx.stroke();
      if (cardinal) {
        ctx.fillStyle = '#e8c9a0';
        ctx.fillText('NESW'[deg / 90], x, H - 15);
      }
    }

    /* The mark, if there is one, in the map's blue so the two agree. */
    if (mark) {
      const x = xOf(mark.brg);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#8fb8e8';
      if (x >= 0 && x <= W) {
        ctx.beginPath();
        ctx.moveTo(x, H - 20); ctx.lineTo(x + 4.5, H - 27); ctx.lineTo(x - 4.5, H - 27);
        ctx.closePath();
        ctx.fill();
      } else {
        /* Behind you: an arrow at the edge pointing the short way round. */
        const left = x < 0;
        const ex = left ? 7 : W - 7;
        ctx.beginPath();
        ctx.moveTo(left ? ex - 5 : ex + 5, H - 23);
        ctx.lineTo(ex, H - 28); ctx.lineTo(ex, H - 18);
        ctx.closePath();
        ctx.fill();
      }
    }

    /* The centre mark, last, over everything. */
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(W / 2 + 0.5, H - 17); ctx.lineTo(W / 2 + 0.5, H);
    ctx.stroke();
  }
}
