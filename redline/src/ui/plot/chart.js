/* Strip chart — the most important widget in the simulator.

   Canvas 2D. One y-axis per chart, in one physical quantity (pressures with
   pressures, never pressure against thrust on a second axis); discrete
   channels (valve commands, limit switches) are drawn as logic lanes along
   the bottom, which is how a DAQ display shows them.

   Data comes from any source with query(id, t0, t1, columns): the live
   store or a recorded run. When there are more samples than pixels the
   source returns a per-column min/max envelope, so a one-sample spike is
   still drawn at any zoom — an averaged trace would quietly hide it.

   Charts in a stack share a TimeAxis, so zooming or hovering one moves them
   all: the crosshair lines up the valve command, the chamber pressure and
   the thrust at the same instant. */

import { h } from '../dom.js';
import { toDisplay, fromDisplay, fmt, unitLabel, fmtT, QUANTITIES, DISPLAY } from '../../lib/units.js';

export const SERIES = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
const LEVEL_COLOR = { caution: '#f2b21c', warning: '#ec835a', redline: '#e5484d' };
const MIN_SPAN = { pressure: { psi: 2, bar: 0.15, kPa: 15 }, force: { N: 0.2, lbf: 0.05 }, temperature: { C: 1, K: 1, F: 2 },
                   massflow: { 'g/s': 0.5, 'lbm/s': 0.001 }, current: { A: 0.1 }, time: { s: 0.01 }, ratio: { '': 0.1 } };

export class TimeAxis {
  constructor({ live = true, window = 10 } = {}) {
    this.live = live; this.window = window;
    this.t0 = 0; this.t1 = window;
    this.hoverT = null;
    this.charts = new Set();
    this.bounds = null;          // [min, max] for static sources
    this.onChange = null;
  }
  resolve(tLatest) {
    if (this.live && Number.isFinite(tLatest)) { this.t1 = tLatest; this.t0 = tLatest - this.window; }
    return [this.t0, this.t1];
  }
  setWindow(w) { this.window = w; if (!this.live) { const c = this.t1; this.t0 = c - w; } this.changed(); }
  zoom(f, at) {
    const t0 = this.t0, t1 = this.t1;
    const c = at ?? (t0 + t1) / 2;
    let n0 = c - (c - t0) * f, n1 = c + (t1 - c) * f;
    if (n1 - n0 < 0.002) return;
    if (this.bounds) { const [b0, b1] = this.bounds; const span = n1 - n0; if (span > b1 - b0) { n0 = b0; n1 = b1; } }
    this.live = false; this.t0 = n0; this.t1 = n1; this.window = n1 - n0; this.changed();
  }
  pan(dt) { this.live = false; this.t0 += dt; this.t1 += dt; this.changed(); }
  setRange(t0, t1) { this.live = false; this.t0 = t0; this.t1 = t1; this.window = t1 - t0; this.changed(); }
  goLive() { this.live = true; this.changed(); }
  changed() { if (this.onChange) this.onChange(this); }
}

function niceStep(span, n) {
  const raw = span / Math.max(1, n);
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}

export class Chart {
  constructor(host, opts) {
    this.host = host;
    this.o = opts;
    this.axis = opts.axis;
    this.axis.charts.add(this);
    this.traces = opts.traces || [];
    this.yAuto = true;
    this._fresh = true;
    this.yLo = 0; this.yHi = 1;
    this.canvas = h('canvas');
    this.legend = h('div.plot-legend');
    this.tools = h('div.plot-tools');
    this.tip = h('div.plot-tip');
    host.append(this.canvas, this.legend, this.tools, this.tip);
    this.ctx = this.canvas.getContext('2d');
    this.dpr = 1;
    this.w = 0; this.hgt = 0;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this._bind();
    this.buildLegend();
    this.dirty = true;
  }

  destroy() { this.ro.disconnect(); this.axis.charts.delete(this); this.host.innerHTML = ''; }

  setTraces(traces) { this.traces = traces; this.yAuto = true; this._fresh = true; this.buildLegend(); this.dirty = true; }

  get quantity() { return (this.traces.find(t => !t.discrete && !t.hidden) || this.traces.find(t => !t.discrete))?.quantity || null; }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.w = Math.max(10, r.width); this.hgt = Math.max(10, r.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.hgt * this.dpr);
    this.dirty = true;
  }

  buildLegend() {
    this.legend.innerHTML = '';
    this.legendVals = [];
    for (const t of this.traces) {
      const val = h('span.val');
      const li = h('span.li' + (t.hidden ? '.off' : ''), { title: t.desc || t.id, onclick: () => { t.hidden = !t.hidden; li.classList.toggle('off', !!t.hidden); this.dirty = true; } },
        h('i', { style: t.dash ? { background: `repeating-linear-gradient(90deg, ${t.color} 0 4px, transparent 4px 7px)` } : { background: t.color } }), h('span', t.label || t.id), val);
      this.legend.append(li);
      this.legendVals.push({ t, el: val });
    }
  }

  /* ---- geometry ---- */
  get lanes() { return this.traces.filter(t => t.discrete && !t.hidden); }
  plotRect() {
    const L = 54, R = 10, T = 20, B = 16 + this.lanes.length * 13;
    return { x: L, y: T, w: Math.max(10, this.w - L - R), h: Math.max(10, this.hgt - T - B) };
  }
  xOf(t) { const r = this.plotRect(); return r.x + (t - this.axis.t0) / (this.axis.t1 - this.axis.t0) * r.w; }
  tOf(x) { const r = this.plotRect(); return this.axis.t0 + (x - r.x) / r.w * (this.axis.t1 - this.axis.t0); }
  yOf(v) { const r = this.plotRect(); return r.y + r.h - (v - this.yLo) / (this.yHi - this.yLo) * r.h; }

  /* ---- interaction ---- */
  _bind() {
    const c = this.canvas;
    let drag = null;
    c.addEventListener('wheel', e => {
      e.preventDefault();
      const f = e.deltaY > 0 ? 1.25 : 0.8;
      if (e.shiftKey) {
        const r = this.plotRect();
        const v = this.yLo + (r.y + r.h - e.offsetY) / r.h * (this.yHi - this.yLo);
        this.yAuto = false;
        this.yLo = v - (v - this.yLo) * f; this.yHi = v + (this.yHi - v) * f;
        this.dirty = true;
      } else this.axis.zoom(f, this.tOf(e.offsetX));
    }, { passive: false });
    c.addEventListener('mousedown', e => {
      const cur = this.o.cursors;
      if (cur && !e.altKey) {
        const hit = ['A', 'B'].find(k => cur[k] !== null && Math.abs(this.xOf(cur[k]) - e.offsetX) < 6);
        if (hit) { drag = { cursor: hit }; return; }
      }
      drag = { x: e.offsetX, y: e.offsetY, t0: this.axis.t0, moved: false, yLo: this.yLo, yHi: this.yHi, shift: e.shiftKey };
    });
    window.addEventListener('mousemove', e => {
      if (!drag) return;
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (drag.cursor) { this.o.cursors[drag.cursor] = this.tOf(x); this.o.onCursor?.(); this.axis.charts.forEach(ch => ch.dirty = true); return; }
      if (Math.abs(x - drag.x) > 3 || Math.abs(y - drag.y) > 3) drag.moved = true;
      if (!drag.moved) return;
      if (drag.shift) {
        const pr = this.plotRect(), dv = (y - drag.y) / pr.h * (drag.yHi - drag.yLo);
        this.yAuto = false; this.yLo = drag.yLo + dv; this.yHi = drag.yHi + dv; this.dirty = true;
      } else {
        const span = this.axis.t1 - this.axis.t0;
        const dt = -(x - drag.x) / this.plotRect().w * span;
        this.axis.live = false;
        this.axis.t0 = drag.t0 + dt; this.axis.t1 = this.axis.t0 + span; this.axis.changed();
      }
    });
    window.addEventListener('mouseup', e => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved && !d.cursor && this.o.cursors && e.target === c) {
        const k = e.shiftKey ? 'B' : 'A';
        this.o.cursors[k] = this.tOf(e.offsetX);
        this.o.onCursor?.();
        this.axis.charts.forEach(ch => ch.dirty = true);
      }
    });
    c.addEventListener('mousemove', e => { this.axis.hoverT = this.tOf(e.offsetX); this.hoverY = e.offsetY; this.axis.charts.forEach(ch => ch.dirty = true); this._hoverChart = true; });
    c.addEventListener('mouseleave', () => { this.axis.hoverT = null; this._hoverChart = false; this.tip.style.display = 'none'; this.axis.charts.forEach(ch => ch.dirty = true); });
    c.addEventListener('dblclick', () => { this.yAuto = true; this.o.onReset ? this.o.onReset() : this.axis.goLive(); this.dirty = true; });
  }

  /* ---- drawing ---- */
  draw(tLatest) {
    const ax = this.axis;
    ax.resolve(tLatest);
    const ctx = this.ctx, dpr = this.dpr;
    const W = this.w, H = this.hgt;
    const r = this.plotRect();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const t0 = ax.t0, t1 = ax.t1;
    const cols = Math.max(20, Math.floor(r.w));
    const q = this.quantity;

    // fetch
    const data = this.traces.map(t => (t.hidden ? null : t.source.query(t.id, t0 - (t.shift || 0), t1 - (t.shift || 0), cols)));

    // y range
    if (this.yAuto && q) {
      let lo = Infinity, hi = -Infinity;
      this.traces.forEach((t, i) => {
        const d = data[i]; if (!d || t.discrete) return;
        if (d.mode === 'raw') for (let k = 0; k < d.n; k++) { const v = d.v[k]; if (v < lo) lo = v; if (v > hi) hi = v; }
        else for (let k = 0; k < d.n; k++) { if (d.lo[k] < lo) lo = d.lo[k]; if (d.hi[k] > hi) hi = d.hi[k]; }
      });
      if (Number.isFinite(lo)) {
        let dlo = toDisplay(lo, q), dhi = toDisplay(hi, q);
        const minSpan = (MIN_SPAN[q] || {})[DISPLAY[q]] ?? 0;
        if (dhi - dlo < minSpan) { const c = (dhi + dlo) / 2; dlo = c - minSpan / 2; dhi = c + minSpan / 2; }
        const pad = (dhi - dlo) * 0.08;
        const tLo = dlo - pad, tHi = dhi + pad;
        // expand at once, contract slowly: a jittering scale is unreadable
        const cLo = toDisplay(this.yLo, q), cHi = toDisplay(this.yHi, q);
        const nLo = !Number.isFinite(cLo) || tLo < cLo || this._fresh ? tLo : cLo + (tLo - cLo) * 0.08;
        const nHi = !Number.isFinite(cHi) || tHi > cHi || this._fresh ? tHi : cHi + (tHi - cHi) * 0.08;
        this.yLo = fromDisp(nLo, q); this.yHi = fromDisp(nHi, q);
        this._fresh = false;
      }
    }
    if (!(this.yHi > this.yLo) || (this._fresh && q)) {
      // no data yet: a neutral 0…10 (display units) rather than a scale in raw pascals
      this.yLo = q ? fromDisp(0, q) : 0; this.yHi = q ? fromDisp(10, q) : 1;
    }

    // frame + grid
    ctx.fillStyle = '#0a0d11';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.font = '10px ' + getComputedStyle(document.body).getPropertyValue('--mono');
    ctx.textBaseline = 'middle';
    if (q) {
      const dLo = toDisplay(this.yLo, q), dHi = toDisplay(this.yHi, q);
      const step = niceStep(dHi - dLo, Math.max(2, Math.floor(r.h / 34)));
      const dec = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
      ctx.textAlign = 'right';
      for (let v = Math.ceil(dLo / step) * step; v <= dHi + 1e-9; v += step) {
        const y = Math.round(this.yOf(fromDisp(v, q))) + 0.5;
        ctx.strokeStyle = Math.abs(v) < step * 1e-6 ? '#2a333d' : '#141a20';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke();
        ctx.fillStyle = '#6e7986';
        ctx.fillText(v.toFixed(Math.min(dec, 4)), r.x - 6, y);
      }
      ctx.save();
      ctx.translate(10, r.y + r.h / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center'; ctx.fillStyle = '#4a5460';
      ctx.fillText(unitLabel(q, this.traces.find(t => t.quantity === q)?.gauge), 0, 0);
      ctx.restore();
    }
    // time grid
    const ref = this.o.timeRef ? this.o.timeRef() : null;
    const span = t1 - t0;
    const tstep = niceStep(span, Math.max(2, Math.floor(r.w / 90)));
    const base = ref ?? 0;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const H0 = this.hgt - 13;
    for (let tt = Math.ceil((t0 - base) / tstep) * tstep; tt <= t1 - base + 1e-9; tt += tstep) {
      const x = Math.round(this.xOf(tt + base)) + 0.5;
      ctx.strokeStyle = Math.abs(tt) < tstep * 1e-6 && ref !== null ? '#3b4652' : '#141a20';
      ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke();
      ctx.fillStyle = '#6e7986';
      const dp = tstep < 0.01 ? 3 : tstep < 0.1 ? 2 : tstep < 1 ? 1 : 0;
      ctx.fillText(ref !== null ? (tt >= 0 ? '+' : '−') + Math.abs(tt).toFixed(dp) : clockLabel(tt + base, dp, this.o.clockBase), x, H0);
    }
    if (ref !== null) { ctx.textAlign = 'left'; ctx.fillStyle = '#4a5460'; ctx.fillText('T', 2, H0); }

    // event markers
    const evs = this.o.events ? this.o.events(t0, t1) : [];
    ctx.textBaseline = 'top';
    let lastLabelX = -1e9;
    for (const ev of evs) {
      const x = Math.round(this.xOf(ev.t)) + 0.5;
      if (x < r.x || x > r.x + r.w) continue;
      ctx.strokeStyle = ev.color || '#3a4552';
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke();
      ctx.setLineDash([]);
      if (x - lastLabelX > 60 && ev.label) {
        ctx.fillStyle = ev.color || '#6e7986';
        ctx.textAlign = 'left';
        ctx.fillText(ev.label, x + 3, r.y + r.h - 12);
        lastLabelX = x;
      }
    }

    // limits
    if (this.o.limits && q) {
      for (const L of this.o.limits(this.traces.filter(t => !t.hidden && !t.discrete).map(t => t.id))) {
        const y = Math.round(this.yOf(L.v)) + 0.5;
        if (y < r.y || y > r.y + r.h) continue;
        ctx.strokeStyle = LEVEL_COLOR[L.level] || '#888';
        ctx.globalAlpha = L.active ? 0.9 : 0.35;
        ctx.setLineDash(L.level === 'redline' ? [6, 3] : [3, 3]);
        ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = LEVEL_COLOR[L.level];
        ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText(L.label, r.x + r.w - 3, y - 1);
        ctx.globalAlpha = 1;
      }
    }

    // traces
    ctx.save();
    ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    this.traces.forEach((t, i) => {
      const d = data[i]; if (!d || t.discrete) return;
      ctx.strokeStyle = t.color; ctx.lineWidth = t.width || 1.5; ctx.lineJoin = 'round';
      ctx.globalAlpha = t.alpha ?? 1;
      ctx.setLineDash(t.dash || []);
      ctx.beginPath();
      let pen = false;
      const sh = t.shift || 0;
      if (d.mode === 'raw') {
        for (let k = 0; k < d.n; k++) {
          const v = d.v[k];
          if (Number.isNaN(v)) { pen = false; continue; }
          const x = this.xOf(d.t[k] + sh), y = this.yOf(v);
          if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y);
        }
      } else {
        for (let k = 0; k < d.n; k++) {
          const lo = d.lo[k], hi = d.hi[k];
          if (Number.isNaN(lo)) { pen = false; continue; }
          const x = this.xOf(d.t[k] + sh);
          if (!pen) { ctx.moveTo(x, this.yOf(hi)); pen = true; } else ctx.lineTo(x, this.yOf(hi));
          ctx.lineTo(x, this.yOf(lo));
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    });
    ctx.restore();

    // logic lanes
    const lanes = this.lanes;
    lanes.forEach((t, li) => {
      const d = data[this.traces.indexOf(t)]; if (!d) return;
      const y0 = r.y + r.h + 4 + li * 13, y1 = y0 + 9;
      ctx.fillStyle = '#0c1014'; ctx.fillRect(r.x, y0 - 1, r.w, 11);
      ctx.strokeStyle = t.color; ctx.lineWidth = 1.5;
      ctx.beginPath();
      let pen = false;
      const pts = d.mode === 'raw' ? Array.from({ length: d.n }, (_, k) => [d.t[k], d.v[k], d.v[k]]) : Array.from({ length: d.n }, (_, k) => [d.t[k], d.lo[k], d.hi[k]]);
      for (const [tt, lo, hi] of pts) {
        if (Number.isNaN(lo)) { pen = false; continue; }
        const x = this.xOf(tt + (t.shift || 0));
        const yv = v => (v >= 0.5 ? y0 : y1);
        if (!pen) { ctx.moveTo(x, yv(lo)); pen = true; }
        ctx.lineTo(x, yv(lo)); if (hi !== lo) ctx.lineTo(x, yv(hi));
      }
      ctx.stroke();
      // label inside the lane, at the left, on a backing so the trace does not strike through it
      const lab = t.label || t.id;
      ctx.font = '9.5px ' + getComputedStyle(document.body).getPropertyValue('--mono');
      const tw = ctx.measureText(lab).width;
      ctx.fillStyle = '#0c1014'; ctx.fillRect(r.x + 2, y0 - 1, tw + 6, 11);
      ctx.fillStyle = '#8391a0'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(lab, r.x + 5, y0 + 4.5);
    });

    // cursors
    const cur = this.o.cursors;
    if (cur) {
      for (const k of ['A', 'B']) {
        if (cur[k] === null || cur[k] === undefined) continue;
        const x = Math.round(this.xOf(cur[k])) + 0.5;
        if (x < r.x || x > r.x + r.w) continue;
        ctx.strokeStyle = k === 'A' ? '#8fd0ee' : '#e6d39a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillRect(x - 6, r.y, 12, 11); ctx.fillStyle = '#0a0d11'; ctx.fillText(k, x, r.y + 1);
      }
      if (cur.A !== null && cur.B !== null && cur.A !== undefined && cur.B !== undefined) {
        const xa = this.xOf(Math.min(cur.A, cur.B)), xb = this.xOf(Math.max(cur.A, cur.B));
        ctx.fillStyle = 'rgba(143,208,238,0.05)'; ctx.fillRect(xa, r.y, xb - xa, r.h);
      }
    }

    // crosshair + tooltip
    const ht = ax.hoverT;
    if (ht !== null && ht >= t0 && ht <= t1) {
      const x = Math.round(this.xOf(ht)) + 0.5;
      ctx.strokeStyle = '#56636f'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h + lanes.length * 13 + 4); ctx.stroke();
      if (this._hoverChart) this._tooltip(ht, x, data, ref);
    }

    ctx.strokeStyle = '#1c232b'; ctx.lineWidth = 1;
    ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    this.dirty = false;
  }

  _tooltip(t, x, data, ref) {
    const rows = [];
    this.traces.forEach((tr, i) => {
      const d = data[i]; if (!d || !d.n) return;
      const tt = t - (tr.shift || 0);
      let v = NaN;
      if (d.mode === 'raw') {
        let best = -1, bd = Infinity;
        for (let k = 0; k < d.n; k++) { const dd = Math.abs(d.t[k] - tt); if (dd < bd) { bd = dd; best = k; } }
        if (best >= 0) v = d.v[best];
        rows.push({ tr, text: tr.discrete ? (v >= 0.5 ? '1' : '0') : fmt(v, tr.quantity) });
      } else {
        const k = Math.round((tt - d.t[0]) / (d.t[1] - d.t[0] || 1));
        if (k >= 0 && k < d.n) rows.push({ tr, text: tr.discrete ? `${d.lo[k] >= 0.5 ? 1 : 0}…${d.hi[k] >= 0.5 ? 1 : 0}` : `${fmt(d.lo[k], tr.quantity)} … ${fmt(d.hi[k], tr.quantity)}` });
      }
    });
    const tip = this.tip;
    tip.innerHTML = '';
    tip.append(h('div.tt', ref !== null ? fmtT(t - ref, 4) : clockLabel(t, 3, this.o.clockBase)));
    for (const r of rows) tip.append(h('div.r', h('i', { style: { background: r.tr.color } }), h('b', r.text), h('span', r.tr.label || r.tr.id)));
    tip.style.display = 'block';
    const tw = tip.offsetWidth;
    tip.style.left = (x + 12 + tw > this.w ? x - tw - 12 : x + 12) + 'px';
    tip.style.top = Math.min(this.hgt - tip.offsetHeight - 4, Math.max(4, (this.hoverY || 20) - 10)) + 'px';
  }

  updateLegend(valueOf) {
    for (const { t, el } of this.legendVals) {
      const v = valueOf(t);
      const s = t.discrete ? (Number.isNaN(v) ? '-' : v >= 0.5 ? '1' : '0') : fmt(v, t.quantity);
      if (el.textContent !== s) el.textContent = s;
    }
  }
}

const fromDisp = (v, q) => (QUANTITIES[q] ? fromDisplay(v, q) : v);

function clockLabel(t, dp, base = 0) {
  const s = t + base;
  const m = Math.floor(s / 60), sec = s - m * 60;
  const hh = Math.floor(m / 60) % 24, mm = m % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${sec.toFixed(dp).padStart(dp ? 3 + dp : 2, '0')}`;
}
