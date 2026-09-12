/* =============================================================================
   THE MAP — where you are, where you have been, and where you want to go
   -----------------------------------------------------------------------------
   The rover already had a map: a 240 pixel hillshade in the nav console,
   fixed at two and a half kilometres across, shown only while driving, with
   two buttons that dropped a waypoint at your feet. On foot there was nothing
   at all, and the waypoint you dropped was drawn as a three pixel blue square
   on a panel you could not see unless you were in the vehicle.

   This is the same ground at any scale you like, on foot or driving, with a
   pointer. It reuses everything: the hillshade is ui/relief.js, the waypoints
   are the same array the console mutates and the save round-trips, the tracks
   are the same Track objects the console draws. What is new is the scale, the
   pointer, and being able to see it while walking.

   North is up and it does not rotate. A map that turns under you is harder to
   plan on than one that does not, so the heading marker turns instead — the
   same decision the nav console made, for the same reason.

   Zoom runs from 400 m, which is a few minutes' walk, to the whole Moon. The
   relief is sampled from the resident global elevation at 16 pixels per
   degree, so past about 50 km across there is no more detail to be had and
   the map is honest about that in its caption rather than inventing any.
   ========================================================================== */

import { surfaceDistance, bearing } from '../physics/frames.js';
import { drawRelief, toXY as project, fromXY } from './relief.js';
import { compass } from './nav.js';

const el = (id) => document.getElementById(id);

/* The span ladder, in metres across. Powers of roughly 1.6 so a step is a
   noticeable change but not a jump, from a few minutes' walk to the globe. */
const SPANS = [400, 650, 1000, 1600, 2500, 4000, 6500, 10000, 16000, 25000,
               40000, 65000, 100000, 160000, 250000, 400000, 650000, 1000000,
               1600000, 2500000, 4000000, 6000000];
const DEFAULT_SPAN = 4;              // index into SPANS: 2.5 km

/* Below this the elevation data has real detail; above it the global 16 ppd
   raster is about 1.9 km a pixel and the map is a regional sketch. Said in the
   caption rather than pretended away. */
const DETAIL_SPAN = 60000;

export class MapView {
  /**
   * @param {object} opts {
   *   heightfield, waypoints, tracks: { boots, wheels }, sites
   * }
   */
  constructor(opts = {}) {
    this.hf = opts.heightfield || null;
    this.waypoints = opts.waypoints || [];
    this.tracks = opts.tracks || {};
    this.sites = opts.sites || [];
    this.root = el('map');
    this.canvas = el('map-canvas');
    this.visible = false;
    this.spanIndex = DEFAULT_SPAN;
    /* The centre. Follows you until you drag, then stays where you put it so
       you can look at somewhere else without losing it every frame. */
    this.centre = null;
    this.panned = false;
    this.at = { lat: 0, lon: 0, heading: 0 };
    this.image = null;
    this.dirty = true;
    this._drag = null;
    if (this.canvas) this.bind();
  }

  get span() { return SPANS[this.spanIndex]; }

  bind() {
    const c = this.canvas;
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    /* A click places a waypoint; a drag moves the map. Distinguished by how
       far the pointer travelled, so a slightly shaky click still marks. */
    c.addEventListener('pointerdown', (e) => {
      this._drag = { x: e.offsetX, y: e.offsetY, moved: 0,
                     from: { ...this.viewCentre() } };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      const d = this._drag;
      if (!d) return;
      const dx = e.offsetX - d.x, dy = e.offsetY - d.y;
      d.moved = Math.max(d.moved, Math.hypot(dx, dy));
      if (d.moved > 4) {
        /* Drag the ground under the pointer: the point that was grabbed should
           stay under it, which means moving the centre the other way. */
        const W = this.canvas.width, H = this.canvas.height;
        this.centre = fromXY(d.from, W / 2 - dx, H / 2 - dy, this.span, W, H);
        this.panned = true;
        this.dirty = true;
      }
    });
    c.addEventListener('pointerup', (e) => {
      const d = this._drag;
      this._drag = null;
      if (!d) return;
      if (d.moved <= 4) this.mark(e.offsetX, e.offsetY);
    });
    /* Right-click clears the nearest mark, which is the only way to remove one
       individually — the console's button clears the lot. */
    c.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.unmark(e.offsetX, e.offsetY);
    });
    if (el('map-close')) el('map-close').addEventListener('click', () => this.show(false));
    if (el('map-in')) el('map-in').addEventListener('click', () => this.zoom(-1));
    if (el('map-out')) el('map-out').addEventListener('click', () => this.zoom(1));
    if (el('map-here')) {
      el('map-here').addEventListener('click', () => {
        this.panned = false; this.centre = null; this.dirty = true;
      });
    }
    if (el('map-clear')) {
      el('map-clear').addEventListener('click', () => {
        this.waypoints.length = 0; this.dirty = true;
      });
    }
  }

  /** Where the view is centred: you, unless you have dragged it somewhere. */
  viewCentre() {
    return this.panned && this.centre ? this.centre : { lat: this.at.lat, lon: this.at.lon };
  }

  zoom(dir) {
    const next = Math.max(0, Math.min(SPANS.length - 1, this.spanIndex + dir));
    if (next === this.spanIndex) return;
    this.spanIndex = next;
    this.dirty = true;
  }

  /** Drop a waypoint under the pointer. */
  mark(x, y) {
    const W = this.canvas.width, H = this.canvas.height;
    const p = fromXY(this.viewCentre(), x, y, this.span, W, H);
    this.waypoints.push({ lat: p.lat, lon: p.lon });
    this.dirty = true;
    return p;
  }

  /** Remove whichever mark is nearest the pointer, if it is near enough. */
  unmark(x, y) {
    const W = this.canvas.width, H = this.canvas.height;
    const c = this.viewCentre();
    let best = -1, bestD = 18;
    this.waypoints.forEach((w, i) => {
      const [wx, wy] = project(c, w.lat, w.lon, this.span, W, H);
      const d = Math.hypot(wx - x, wy - y);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best >= 0) { this.waypoints.splice(best, 1); this.dirty = true; }
    return best >= 0;
  }

  show(on) {
    if (on === this.visible) return this.visible;
    this.visible = !!on;
    if (this.root) this.root.style.display = this.visible ? 'flex' : 'none';
    /* Opening the map has to give the pointer back, or the mouse is still
       captured for looking around and none of this is clickable. */
    if (this.visible && document.pointerLockElement) document.exitPointerLock();
    this.dirty = true;
    return this.visible;
  }

  toggle() { return this.show(!this.visible); }

  /**
   * @param {object} s { lat, lon, heading, home, elevation }
   */
  update(s) {
    this.at = { lat: s.lat, lon: s.lon, heading: s.heading ?? 0 };
    this.home = s.home || null;
    if (!this.visible || !this.canvas) return;
    /* Redraw when something has changed, and otherwise a few times a second so
       the marker keeps up while you drive with the map open. The hillshade is
       9216 heightfield samples and is not worth doing at frame rate. */
    const now = this._t = (this._t || 0) + 1;
    if (!this.dirty && now % 20 !== 0) return;
    this.dirty = false;
    this.draw();
  }

  draw() {
    const c = this.canvas;
    /* Sized from its own box, so the map fills the window at any shape. */
    const box = c.getBoundingClientRect();
    const W = Math.max(200, Math.floor(box.width)), H = Math.max(200, Math.floor(box.height));
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; this.image = null; }
    const ctx = c.getContext('2d');
    if (!ctx) return;
    if (!this.image || this.image.width !== W) this.image = ctx.createImageData(W, H);

    const span = this.span;
    const centre = this.viewCentre();
    const { lo, hi } = drawRelief(ctx, this.image, {
      hf: this.hf, lat: centre.lat, lon: centre.lon, span, W, H,
    });
    const xy = (lat, lon) => project(centre, lat, lon, span, W, H);

    /* A grid, so distance is readable without measuring. SQUARE cells — the
       spacing is a tenth of the span both ways, which is a tenth of the width
       in pixels both ways, not a tenth of each side. A grid of rectangles on
       an isotropic map would be a lie about the one thing a grid is for. */
    const cell = W / 10;
    ctx.strokeStyle = 'rgba(232,201,160,.10)';
    ctx.lineWidth = 1;
    for (let x = W / 2 % cell; x < W; x += cell) {
      const px = Math.round(x) + 0.5;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    for (let y = H / 2 % cell; y < H; y += cell) {
      const py = Math.round(y) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    /* Where you have been: boots in warm grey, wheels brighter, both clipped
       generously rather than exactly because a line crossing the edge should
       still be drawn to it. */
    for (const [name, stroke, width] of [['boots', 'rgba(232,201,160,.65)', 1.5],
                                         ['wheels', 'rgba(159,208,204,.8)', 2]]) {
      const t = this.tracks[name];
      if (!t || t.size < 2) continue;
      ctx.strokeStyle = stroke; ctx.lineWidth = width;
      ctx.beginPath();
      let started = false;
      for (const p of t.tail(4000)) {
        const [x, y] = xy(p.lat, p.lon);
        if (x < -W || x > 2 * W || y < -H || y > 2 * H) { started = false; continue; }
        if (started) ctx.lineTo(x, y); else { ctx.moveTo(x, y); started = true; }
      }
      ctx.stroke();
    }

    /* Named places, once the view is wide enough for them to mean anything. */
    if (span >= 20000 && this.sites.length) {
      ctx.font = '11px ui-monospace, monospace';
      for (const site of this.sites) {
        const [x, y] = xy(site.lat, site.lon);
        if (x < 8 || x > W - 8 || y < 8 || y > H - 8) continue;
        ctx.fillStyle = 'rgba(232,201,160,.55)';
        ctx.fillRect(x - 1, y - 1, 2, 2);
        ctx.fillStyle = 'rgba(232,201,160,.45)';
        ctx.fillText(site.name, x + 5, y + 3);
      }
    }

    /* The ship. This is the one mark on here you cannot afford to lose. */
    if (this.home) {
      const [x, y] = xy(this.home.lat, this.home.lon);
      ctx.strokeStyle = '#9fd0cc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y);
      ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7);
      ctx.stroke();
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = 'rgba(159,208,204,.85)';
      ctx.fillText('ship', x + 10, y + 4);
    }

    /* The marks, numbered, with the last one — the one the HUD is steering you
       towards — ringed. */
    ctx.font = '11px ui-monospace, monospace';
    this.waypoints.forEach((w, i) => {
      const [x, y] = xy(w.lat, w.lon);
      const last = i === this.waypoints.length - 1;
      ctx.fillStyle = '#8fb8e8';
      ctx.beginPath(); ctx.arc(x, y, last ? 4.5 : 3, 0, Math.PI * 2); ctx.fill();
      if (last) {
        ctx.strokeStyle = 'rgba(143,184,232,.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(143,184,232,.8)';
      ctx.fillText(String(i + 1), x + 7, y - 6);
    });

    /* You, pointing where you are pointing. */
    const [px, py] = xy(this.at.lat, this.at.lon);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(this.at.heading * Math.PI / 180);
    ctx.fillStyle = '#e8c9a0';
    ctx.beginPath();
    ctx.moveTo(0, -9); ctx.lineTo(6, 7); ctx.lineTo(0, 3.5); ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    /* If the view has been dragged away from you, say which way you are. */
    if (this.panned && (px < 0 || px > W || py < 0 || py > H)) {
      ctx.fillStyle = 'rgba(232,201,160,.6)';
      ctx.fillText(`you are ${(surfaceDistance(centre.lat, centre.lon, this.at.lat, this.at.lon) / 1000).toFixed(0)} km `
        + compass(bearing(centre.lat, centre.lon, this.at.lat, this.at.lon)), 12, H - 14);
    }

    this.caption(span, lo, hi, centre);
  }

  caption(span, lo, hi, centre) {
    const wide = span >= DETAIL_SPAN;
    if (el('map-scale')) {
      el('map-scale').textContent = span >= 1000
        ? `${(span / 1000).toFixed(span >= 10000 ? 0 : 1)} km across`
        : `${span} m across`;
    }
    if (el('map-relief')) {
      el('map-relief').textContent = Number.isFinite(hi - lo)
        ? `${(hi - lo).toFixed(0)} m of relief` : '—';
    }
    if (el('map-note')) {
      /* Honest about the resolution rather than letting a smooth sheet imply
         detail the measurements do not have. */
      el('map-note').textContent = wide
        ? 'regional — global elevation is 1.9 km a pixel at this scale'
        : 'north up · click to mark · right-click a mark to remove it';
    }
    if (el('map-where')) {
      el('map-where').textContent =
        `${Math.abs(centre.lat).toFixed(3)}° ${centre.lat >= 0 ? 'N' : 'S'}  `
        + `${Math.abs(centre.lon).toFixed(3)}° ${centre.lon >= 0 ? 'E' : 'W'}`;
    }
  }
}
