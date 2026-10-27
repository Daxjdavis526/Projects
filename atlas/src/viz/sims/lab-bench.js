// The virtual lab bench: a simulated experiment you run like a real one. A
// picture of the apparatus; a “Take a measurement” button that adds a noisy
// reading (realistic random scatter, rounded to the instrument’s resolution)
// to a data table; the data plotted with ±1σ error bars on linearized axes
// and fitted with a weighted least-squares line (slope ± σ, intercept ± σ,
// χ²/dof); the quantity the slope stands for compared with the accepted value;
// and a switch that injects a systematic error into the same readings. The
// experiments and all the statistics are model/lab-bench.js (tested
// headlessly with seeded noise). Readings repeated at one setting are shown as
// a dot histogram with the mean, the standard deviation and the standard error.
//
//   { type: 'lab-bench', params: {
//       exp: 'freefall',            // an experiment of model/lab-bench.js, or a list: a “Method” switch
//       view: 'bench',              // 'bench' (interactive) | 'plot' (static data plot) | 'apparatus' (picture only)
//       repeat: false,              // repeated readings at one setting (forced for experiments with no knob)
//       at: null,                   // repeat: the fixed setting (e.g. a launch angle)
//       params: {},                 // the experiment’s physical parameters (g, lengths, masses …)
//       seed: 1,                    // the noise: the same seed always gives the same readings
//       prefill: 'series',          // bench: start with one reading per standard setting ('series'), a number of readings, or 0
//       data: null,                 // static: explicit rows [[setting, reading1, reading2…], …] (repeat: [[reading], …])
//       settings: null, n: 10,      // static without data: generate at these settings / this many repeats
//       axes: null,                 // which linearization (default: the experiment’s); axesChoice: true offers the others
//       sys: false, sysKind: null,  // the systematic error on at the start, and which one; toggle: show its switch
//       fit: true, origin: false,   // draw the fit; also the fit forced through the origin (originToggle: a switch)
//       expected: false,            // the line the accepted value predicts (dashed green)
//       residuals: false,           // a residual panel under the plot
//       results: null,              // the fit numbers in the readout (default: on in bench, off in static views)
//       table: null,                // the data table (default: on in bench, off in static views)
//       latest: true,               // ring the newest point
//       aspect: null,               // static plot: canvas aspect ('wide' default)
//       labels: true,               // apparatus: dimension labels and the instrument display
//   } }

import { Plot, themeColors } from '../plot.js';
import { h } from '../../ui/dom.js';
import { makeRng } from '../../core/rng.js';
import * as B from '../model/lab-bench.js';

export const defaults = {
  exp: 'freefall', view: 'bench', repeat: false, at: null, params: {}, seed: 1, prefill: 'series',
  data: null, settings: null, n: 10, axes: null, axesChoice: true, sys: false, sysKind: null, toggle: true,
  fit: true, origin: false, originToggle: false, expected: false, residuals: false, results: null, table: null,
  latest: true, aspect: null, labels: true, alt: null,
};

const VIEWS = ['bench', 'plot', 'apparatus'];
const SERIES_COL = ['accent', 'violet'];
const D2R = Math.PI / 180;

// ─── text helpers ──────────────────────────────────────────────────────────
/** A unit as TeX: 'm/s²' → \mathrm{m}/\mathrm{s}^{2}, 's/√m' → \mathrm{s}/\sqrt{\mathrm{m}}, '°C' → {}^\circ\mathrm{C}. */
export function unitTeX(u) {
  if (!u) return '';
  let out = '';
  for (const m of String(u).matchAll(/√[A-Za-z]+|[A-Za-z]+|°C|°|⁻?[¹²³]|·|\/|\(|\)|\d+|./g)) {
    const tok = m[0];
    if (tok[0] === '√') out += `\\sqrt{\\mathrm{${tok.slice(1)}}}`;
    else if (/^[A-Za-z]+$/.test(tok)) out += `\\mathrm{${tok}}`;
    else if (tok === '°C') out += '{}^\\circ\\mathrm{C}';
    else if (tok === '°') out += '^\\circ';
    else if (/^⁻?[¹²³]$/.test(tok)) out += `^{${tok.replace('⁻', '-').replace('¹', '1').replace('²', '2').replace('³', '3')}}`;
    else if (tok === '·') out += '\\,';
    else if (tok.trim()) out += tok;
  }
  return out;
}
/** A canvas axis label from a symbol and unit: 't² (s²)'. */
const axisLabel = (sym, unit) => (unit ? `${sym} (${unit})` : sym);
const SYM_TEX = { 'θ': '\\theta', 'α': '\\alpha', 'μs': '\\mu_s', 'μk': '\\mu_k', 'τ_f': '\\tau_f', 'δ': '\\delta', 'Δt': '\\Delta t', 'v₀': 'v_0', 'x₀': 'x_0', 'R₀': 'R_0', 'a₀': 'a_0', 'T₀': 'T_0', 'T²₀': 'T^2_0', 'F₀': 'F_0', 'v²₀': 'v^2_0', 'θc': '\\theta_c', 't₁₀': 't_{10}', 'u₁': 'u_1', 'K/U': 'K/U', 'p_after/p_before': 'p_\\text{after}/p_\\text{before}' };
const symTeX = (s) => SYM_TEX[s] ?? s;
/** “value ± σ unit” as TeX, σ rounded to two figures and the value to match. */
function pmTeX(v, s, unit) {
  const r = B.pm(v, s);
  const u = unitTeX(unit);
  return `${r.v}${r.s ? ` \\pm ${r.s}` : ''}${u ? `\\ ${u}` : ''}`;
}
const numTxt = (x, n = 3) => {
  if (!Number.isFinite(x)) return '—';
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return x.toExponential(n - 1).replace('e', '×10^').replace(/\^\+?(-?\d+)/, (m, e) => `^{${e}}`);
  return String(+x.toPrecision(n));
};
/** A number to n significant figures, keeping trailing zeros (9.80, not 9.8). */
const keepTxt = (x, n = 3) => (Number.isFinite(x) ? (Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0) ? x.toExponential(n - 1) : x.toPrecision(n)) : '—');
/** A reading as printed by its instrument (resolution `res`). */
const readTxt = (x, res) => {
  if (!Number.isFinite(x)) return '—';
  const dec = Math.max(0, Math.ceil(-Math.log10(res || 1) - 1e-9));
  return x.toFixed(dec);
};
const setTxt = (E, s) => (E.setting ? readTxt(s, E.setting.step < 1 ? Math.min(E.setting.step, 0.01) : 1) : '');

// ─── mount ─────────────────────────────────────────────────────────────────
export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const ids = Array.isArray(P.exp) ? P.exp : [P.exp];
  const bench = P.view === 'bench';
  const showResults = P.results ?? bench;
  const showTable = P.table ?? bench;
  const state = { id: ids[0], latest: -1, flash: '' };

  // one stored data set per experiment (the Method switch keeps each)
  const store = {};
  const rngs = {};
  const expOf = (id) => B.experiment(id, P.params);
  const isRepeat = (id) => !B.EXPERIMENTS[id].setting || !!P.repeat;
  const sysKind = (id) => (P.sysKind && B.EXPERIMENTS[id].systematics?.[P.sysKind] ? P.sysKind : B.EXPERIMENTS[id].defaultSys);
  const sysOn = () => (F.params.sys ?? P.sys) ? sysKind(state.id) : null;
  const opts = () => {
    const { E } = expOf(state.id);
    const o = {};
    for (const op of E.options || []) o[op.key] = F.params[op.key] ?? P.params[op.key] ?? E.defaults[op.key];
    return o;
  };
  const params = () => ({ ...P.params, ...opts() });

  function initData(id) {
    const { E } = expOf(id);
    rngs[id] = makeRng(P.seed);
    let rows = [];
    if (P.data) {
      rows = P.data.map((d) => (isRepeat(id) && !E.setting ? { s: null, R: d.slice() } : isRepeat(id) ? { s: P.at, R: d.slice() } : { s: d[0], R: d.slice(1) }));
    } else {
      const list = isRepeat(id)
        ? Array(bench ? (typeof P.prefill === 'number' ? P.prefill : P.prefill ? 5 : 0) : P.n).fill(E.setting ? P.at : null)
        : bench
          ? (P.prefill === 'series' ? E.setting.series : typeof P.prefill === 'number' ? E.setting.series.slice(0, P.prefill) : [])
          : (P.settings || E.setting.series);
      rows = list.map((s) => ({ s, z: Array.from({ length: E.nz }, () => B.gaussian(rngs[id])) }));
    }
    store[id] = rows;
  }
  ids.forEach(initData);

  // the readings of every row for the current switches (the same scatter z)
  const rowsNow = () => {
    const { E, P: PP } = expOf(state.id);
    const pp = { ...PP, ...opts() };
    return store[state.id].map((r) => (r.z ? { ...r, R: B.readRow(E, pp, r.s, r.z, sysOn()) } : r));
  };

  // ─── layout ──────────────────────────────────────────────────────────────
  const compact = F.compact;
  let app = null, plotC = null, resC = null;
  if (bench || P.view === 'apparatus') app = F.canvas({ aspect: 'wide', label: P.alt || `The apparatus: ${B.EXPERIMENTS[state.id].title}` });
  if (bench || P.view === 'plot') plotC = F.canvas({ aspect: P.aspect || (bench ? '' : 'wide'), label: P.alt || 'The data with error bars and a least-squares line' });
  if (P.residuals && (bench || P.view === 'plot') && !isRepeat(state.id)) resC = F.canvas({ aspect: '', height: compact ? '96px' : '118px', label: 'Residuals: each point minus the fitted line' });
  const appPlot = app && new Plot(app.canvas, { x: [0, 20], y: [0, 10], equal: true, grid: false, axes: false, pad: { l: 4, r: 4, t: 4, b: 4 } });
  const dataPlot = plotC && new Plot(plotC.canvas, { x: [0, 1], y: [0, 1], pad: { l: 58, r: 14, t: 12, b: 36 } });
  const resPlot = resC && new Plot(resC.canvas, { x: [0, 1], y: [-1, 1], pad: { l: 58, r: 14, t: 8, b: 22 } });

  let tableBox = null;
  if (showTable && P.view !== 'apparatus') {
    tableBox = h('div.table-wrap', { style: { maxHeight: compact ? '180px' : '232px', overflowY: 'auto', margin: '.6rem 0 .2rem' } });
    const ctl = F.el.querySelector('.viz-controls');
    F.el.insertBefore(tableBox, ctl);
  }

  // ─── controls ───────────────────────────────────────────────────────────
  if (bench) {
    if (ids.length > 1) F.choice({ key: 'method', label: 'Method', options: ids.map((id) => [id, B.EXPERIMENTS[id].title.split(':')[0]]), value: ids[0], explain: 'Two ways to measure the same thing: each keeps its own data table.' });
    const E0 = B.EXPERIMENTS[ids[0]];
    if (!isRepeat(ids[0]) && E0.setting) {
      const st = E0.setting;
      F.slider({ key: 'set', label: st.label, min: st.min, max: st.max, step: st.step, value: st.value, unit: unitTeX(st.unit), explain: st.explain });
    }
    for (const op of E0.options || []) F.choice({ key: op.key, label: op.label, options: op.choices, value: P.params[op.key] ?? E0.defaults[op.key], explain: op.explain });
    if (P.toggle && E0.systematics) {
      const sk = sysKind(ids[0]), S = E0.systematics[sk];
      F.toggle({ key: 'sys', label: `Systematic error: ${S.label}`, value: !!P.sys, explain: `${S.explain} Switching re-runs the same readings — same random scatter — so only the fault’s effect changes.` });
    }
    const axKeys = E0.axes ? Object.keys(E0.axes) : [];
    if (!isRepeat(ids[0]) && P.axesChoice && axKeys.length > 1) {
      F.choice({ key: 'axes', label: 'Plot', options: axKeys.map((k) => [k, E0.axes[k].label]), value: P.axes || E0.defaultAxes, explain: 'Choose what to put on each axis: the right choice turns the expected relationship into a straight line.' });
    }
    if (!isRepeat(ids[0]) && P.originToggle) F.toggle({ key: 'origin', label: 'Also fit a line forced through the origin', value: !!P.origin, explain: 'The dashed line is the best line with no intercept. If the data do not pass through (0, 0), forcing it bends the slope.' });
    F.button({ label: 'Take a measurement', primary: true, onClick: () => take(1) });
    F.button({ label: isRepeat(ids[0]) ? 'Take 10 more' : 'Run the series', onClick: () => (isRepeat(ids[0]) ? take(10) : series()) });
    F.button({ label: 'Clear the table', onClick: () => { store[state.id] = []; state.latest = -1; redraw(); } });
  }

  function take(k) {
    const { E } = expOf(state.id);
    for (let i = 0; i < k; i++) {
      const s = isRepeat(state.id) ? (E.setting ? P.at : null) : F.params.set;
      store[state.id].push({ s, z: Array.from({ length: E.nz }, () => B.gaussian(rngs[state.id])) });
    }
    state.latest = store[state.id].length - 1;
    redraw();
  }
  function series() {
    const { E } = expOf(state.id);
    for (const s of E.setting.series) store[state.id].push({ s, z: Array.from({ length: E.nz }, () => B.gaussian(rngs[state.id])) });
    state.latest = store[state.id].length - 1;
    redraw();
  }

  F.onChange((key) => {
    if (key === 'method') { state.id = F.params.method; state.latest = store[state.id].length - 1; }
    redraw();
  });

  // ─── drawing ────────────────────────────────────────────────────────────
  function redraw() {
    const rows = rowsNow();
    const { E, P: PP0 } = expOf(state.id);
    const PP = { ...PP0, ...opts() };
    const rep = isRepeat(state.id);
    const axesKey = (bench ? F.params.axes : null) || P.axes || E.defaultAxes;
    const origin = bench && P.originToggle ? !!F.params.origin : !!P.origin;
    const an = !rep && E.axes ? B.analyse(state.id, rows, { axes: axesKey, sys: sysOn(), params: params(), origin: false }) : null;
    const anO = !rep && origin && E.axes ? B.analyse(state.id, rows, { axes: axesKey, sys: sysOn(), params: params(), origin: true }) : null;
    const rs = rep ? repeatOf(E, PP, rows) : null;
    const latestRow = rows[state.latest >= 0 ? Math.min(state.latest, rows.length - 1) : rows.length - 1];
    if (appPlot) drawApparatus(appPlot, E, PP, { row: latestRow, setting: bench && E.setting && !rep ? F.params.set : latestRow?.s ?? (E.setting ? (rep ? P.at : E.setting.value) : null), sys: sysOn(), labels: P.labels, rs, rep });
    if (dataPlot) { if (rep) drawRepeat(dataPlot, E, PP, rs); else drawFit(dataPlot, E, PP, an, anO, axesKey); }
    if (resPlot && an) drawResiduals(resPlot, an);
    if (tableBox) drawTable(tableBox, E, PP, rows, rep, an);
    readout(E, PP, an, anO, rs, rep);
  }

  function repeatOf(E, PP, rows) {
    const vals = rows.map((r) => E.repeat.of(r.s, r.R, PP));
    const st = B.stats(vals);
    const acc = E.repeat.accepted(PP, E.setting ? P.at : null);
    const sig = rows.length ? E.repeat.sigma(rows[0].s, rows[0].R, PP) : NaN;
    return { ...st, vals, accepted: acc, sigma: sig };
  }

  // the linearized data, the fit and (optionally) the expected and forced-origin lines
  function drawFit(pl, E, PP, an, anO, axesKey) {
    const A = E.axes[axesKey];
    const pts = an ? an.series.flatMap((s) => s.pts) : [];
    pl.o.xlabel = axisLabel(A.x.sym, A.x.unit);
    pl.o.ylabel = A.ys.length > 1 ? axisLabel('F', A.ys[0].unit) : axisLabel(A.ys[0].sym.split(' = ')[0], A.ys[0].unit);
    const ex = A.expect ? A.expect(PP, sysOn()) : null;
    const exs = ex ? (Array.isArray(ex) ? ex : [ex]) : [];
    const throughZero = exs.length && exs.every((e) => Math.abs(e.a) < 1e-12);
    const wantX0 = !!A.intercept || throughZero;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { x0 = Math.min(x0, p.x - p.sx); x1 = Math.max(x1, p.x + p.sx); y0 = Math.min(y0, p.y - p.sy); y1 = Math.max(y1, p.y + p.sy); }
    if (!pts.length) {
      // an empty bench: frame what noise-free readings over the knob’s range would show
      const st = E.setting, z0 = Array(E.nz).fill(0);
      for (const s of [st.min, st.max]) {
        const R = B.readRow(E, PP, s, z0, sysOn());
        const x = A.x.of(s, R, PP, sysOn());
        x0 = Math.min(x0, x); x1 = Math.max(x1, x);
        for (const Y of A.ys) { const y = Y.of(s, R, PP, sysOn()); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      }
    }
    if (wantX0) x0 = Math.min(0, x0);
    const fits = an ? an.series.map((s) => s.fit).filter(Boolean) : [];
    if (wantX0 && x0 <= 0) for (const f of fits) { y0 = Math.min(y0, f.a); y1 = Math.max(y1, f.a); }
    if (throughZero) y0 = Math.min(0, y0);
    if (!(x1 > x0)) { x1 = x0 + 1; }
    if (!(y1 > y0)) { y1 = y0 + 1; }
    const dx = x1 - x0, dy = y1 - y0;
    pl.setView([x0 - (wantX0 && x0 === 0 ? 0.02 : 0.08) * dx, x1 + 0.08 * dx], [y0 - (throughZero && y0 === 0 ? 0.03 : 0.1) * dy, y1 + 0.1 * dy]);
    pl.o.axesAt = 'edge';
    pl.clear();
    if (P.expected) exs.forEach((e) => pl.slopeLine(0, e.a, e.b, { color: 'good', width: 1.6, dash: [6, 5] }));
    if (anO && P.fit) anO.series.forEach((s) => s.fit && pl.slopeLine(0, 0, s.fit.b, { color: 'warn', width: 1.8, dash: [3, 4] }));
    if (P.fit && an && !A.noFit) an.series.forEach((s, k) => s.fit && pl.slopeLine(0, s.fit.a, s.fit.b, { color: an.series.length > 1 ? SERIES_COL[k] : 'gold', width: 2, alpha: 0.95 }));
    const g = pl.ctx;
    an?.series.forEach((s, k) => {
      const col = SERIES_COL[k];
      for (const [i, p] of s.pts.entries()) {
        errorBars(pl, p, col);
        pl.point(p.x, p.y, { color: col, r: compact ? 3.4 : 3.8 });
        if (P.latest && i === s.pts.length - 1 && bench && state.latest >= 0) ring(pl, p.x, p.y);
      }
    });
    if (an && an.series.length > 1) {
      // a small legend for two series
      an.series.forEach((s, k) => pl.text(`● ${s.Y.name}`, pl.L + 10, pl.T + 12 + 16 * k, { screen: true, color: SERIES_COL[k], size: 11.5, weight: 600 }));
    }
    if (!pts.length) pl.text('Take a measurement to start the table', (pl.L + pl.R) / 2, (pl.T + pl.B) / 2, { screen: true, align: 'center', color: 'ink3', size: 12.5 });
    else if (A.curved && P.fit) pl.text('Curved: a straight line is the wrong model on these axes', pl.R - 6, pl.T + 12, { screen: true, align: 'right', color: 'ink3', size: 11.5 });
    void g;
  }

  function errorBars(pl, p, col) {
    const g = pl.ctx, c = pl.color(col);
    g.save(); g.strokeStyle = c; g.lineWidth = 1.3; g.globalAlpha = 0.85;
    const X = pl.X(p.x), Y = pl.Y(p.y);
    if (p.sy > 0) {
      const ya = pl.Y(p.y + p.sy), yb = pl.Y(p.y - p.sy);
      if (Math.abs(yb - ya) > 2) {
        g.beginPath(); g.moveTo(X, ya); g.lineTo(X, yb);
        g.moveTo(X - 3.5, ya); g.lineTo(X + 3.5, ya); g.moveTo(X - 3.5, yb); g.lineTo(X + 3.5, yb); g.stroke();
      }
    }
    if (p.sx > 0) {
      const xa = pl.X(p.x - p.sx), xb = pl.X(p.x + p.sx);
      if (Math.abs(xb - xa) > 2) {
        g.beginPath(); g.moveTo(xa, Y); g.lineTo(xb, Y);
        g.moveTo(xa, Y - 3.5); g.lineTo(xa, Y + 3.5); g.moveTo(xb, Y - 3.5); g.lineTo(xb, Y + 3.5); g.stroke();
      }
    }
    g.restore();
  }

  function ring(pl, x, y) {
    const g = pl.ctx;
    g.save(); g.strokeStyle = pl.color('gold'); g.lineWidth = 2;
    g.beginPath(); g.arc(pl.X(x), pl.Y(y), 7.5, 0, Math.PI * 2); g.stroke(); g.restore();
  }

  function drawResiduals(pl, an) {
    const s = an.series[0];
    const f = s?.fit;
    pl.o.xlabel = ''; pl.o.ylabel = 'residual';
    const xr = [dataPlot.vx0, dataPlot.vx1];
    let m = 1e-12;
    if (f) s.pts.forEach((p, i) => { m = Math.max(m, Math.abs(f.residuals[i]) + p.sy); });
    pl.setView(xr, [-1.25 * m, 1.25 * m]);
    pl.o.axesAt = 'edge'; pl.o.yticks = 3;
    pl.clear();
    pl.line(xr[0], 0, xr[1], 0, { color: 'gold', width: 1.4 });
    if (!f) return;
    s.pts.forEach((p, i) => { const q = { x: p.x, y: f.residuals[i], sx: 0, sy: Math.sqrt(p.sy ** 2 + (f.b * p.sx) ** 2) }; errorBars(pl, q, 'accent'); pl.point(q.x, q.y, { color: 'accent', r: 3.2 }); });
  }

  // repeated readings: a dot histogram, the mean, ±1 SD, ±1 SEM and the accepted value
  function drawRepeat(pl, E, PP, rs) {
    const R = E.repeat;
    pl.o.xlabel = axisLabel(R.sym, R.unit); pl.o.ylabel = 'count'; pl.o.yticks = 4;
    const vals = rs.vals;
    const sd = Number.isFinite(rs.sd) ? rs.sd : rs.sigma;
    const center = vals.length ? rs.mean : rs.accepted;
    const half = Math.max(4 * (sd || rs.sigma || 1e-3), Math.abs(rs.accepted - center) * 1.25 + 2 * (sd || 0));
    const lo = Math.min(center - half, rs.accepted - 0.5 * half), hi = Math.max(center + half, rs.accepted + 0.5 * half);
    // bins: about 40 across the view, a whole number of the per-reading quantity’s resolution steps
    let q = 0;
    if (E.series.length === 1 && rs.n) { const s0 = P.at, r0 = E.series[0].res; q = Math.abs(E.repeat.of(s0, [1 + r0], PP) - E.repeat.of(s0, [1], PP)); }
    const want = Math.max((hi - lo) / 40, vals.length >= 5 && Number.isFinite(rs.sd) ? rs.sd / 2.5 : 0);
    const bw = q > 0 ? Math.max(1, Math.round(want / q)) * q : want;
    const bins = new Map();
    for (const v of vals) { const b = Math.round(v / bw); bins.set(b, (bins.get(b) || 0) + 1); }
    const top = Math.max(4, ...bins.values()) + 1.5;
    pl.setView([lo, hi], [0, top]);
    pl.o.axesAt = 'edge';
    pl.clear();
    if (vals.length >= 2 && Number.isFinite(rs.sd)) {
      pl.area(() => top, rs.mean - rs.sd, rs.mean + rs.sd, { color: 'accent', alpha: 0.1 });
      pl.text('±1 SD', pl.X(rs.mean + rs.sd) + 4, pl.T + 12, { screen: true, color: 'accent2', size: 11 });
    }
    // the dots, stacked in their bins
    const counted = new Map();
    vals.forEach((v, i) => {
      const b = Math.round(v / bw), k = (counted.get(b) || 0) + 1;
      counted.set(b, k);
      pl.point(b * bw, k - 0.45, { color: i === vals.length - 1 && bench && state.latest >= 0 ? 'gold' : 'accent', r: compact ? 3.6 : 4.2 });
    });
    if (Number.isFinite(rs.accepted)) {
      pl.line(rs.accepted, 0, rs.accepted, top, { color: 'good', width: 1.6, dash: [6, 5] });
      pl.text(R.acceptedLabel || 'accepted', pl.X(rs.accepted) + 5, pl.T + 26, { screen: true, color: 'good', size: 11 });
    }
    if (vals.length) {
      pl.line(rs.mean, 0, rs.mean, top - 0.4, { color: 'gold', width: 2 });
      if (vals.length >= 2 && Number.isFinite(rs.sem)) {
        const y = top - 0.75, g = pl.ctx;
        g.save(); g.strokeStyle = pl.color('gold'); g.lineWidth = 3;
        g.beginPath(); g.moveTo(pl.X(rs.mean - rs.sem), pl.Y(y)); g.lineTo(pl.X(rs.mean + rs.sem), pl.Y(y));
        g.moveTo(pl.X(rs.mean - rs.sem), pl.Y(y) - 5); g.lineTo(pl.X(rs.mean - rs.sem), pl.Y(y) + 5);
        g.moveTo(pl.X(rs.mean + rs.sem), pl.Y(y) - 5); g.lineTo(pl.X(rs.mean + rs.sem), pl.Y(y) + 5); g.stroke(); g.restore();
        pl.text('mean ± SEM', pl.X(rs.mean) - 6, pl.Y(y) - 11, { screen: true, color: 'gold', size: 11, align: 'right', weight: 600 });
      }
    } else pl.text('Take a measurement to start the table', (pl.L + pl.R) / 2, (pl.T + pl.B) / 2, { screen: true, align: 'center', color: 'ink3', size: 12.5 });
  }

  // the data table: raw readings, then the plotted quantities
  function drawTable(box, E, PP, rows, rep, an) {
    const head = ['#'];
    if (E.setting && !rep) head.push(`${E.setting.sym} (${E.setting.unit})`);
    E.series.forEach((q) => head.push(`${q.sym} (${q.unit})`));
    const A = !rep && E.axes ? (an?.A) : null;
    const showX = A && A.x.sym !== E.setting?.sym && !E.series.some((q) => q.sym === A.x.sym);
    const showY = A && A.ys.some((Y, k) => Y.sym !== E.series[k]?.sym);
    if (rep && E.repeat.sym !== E.series[0].sym) head.push(E.repeat.unit ? `${E.repeat.sym} (${E.repeat.unit})` : E.repeat.sym);
    if (showX) head.push(`${A.x.sym.split(' = ')[0]}${A.x.unit ? ` (${A.x.unit})` : ''}`);
    if (showY) A.ys.forEach((Y) => head.push(`${Y.sym.split(' = ')[0]}${Y.unit ? ` (${Y.unit})` : ''}`));
    const tr = (cells, th = false) => h('tr', cells.map((c) => h(th ? 'th' : 'td', { style: { padding: '.32rem .6rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', ...(th ? { textTransform: 'none', letterSpacing: 'normal', fontSize: '.78rem' } : {}) } }, c)));
    const body = rows.map((r, i) => {
      const cells = [String(i + 1)];
      if (E.setting && !rep) cells.push(setTxt(E, r.s));
      r.R.forEach((v, k) => cells.push(readTxt(v, E.series[k].res)));
      if (rep && E.repeat.sym !== E.series[0].sym) cells.push(numTxt(E.repeat.of(r.s, r.R, PP), 4));
      if (showX) cells.push(numTxt(A.x.of(r.s, r.R, PP, sysOn()), 4));
      if (showY) A.ys.forEach((Y) => cells.push(numTxt(Y.of(r.s, r.R, PP, sysOn()), 4)));
      return tr(cells);
    });
    const table = h('table.t', { 'aria-label': 'Data table' }, h('thead', tr(head, true)), h('tbody', body.length ? body : [tr([h('span', { style: { color: 'var(--ink-3)' } }, 'No readings yet.')])]));
    box.replaceChildren(table);
    box.scrollTop = box.scrollHeight;
  }

  function readout(E, PP, an, anO, rs, rep) {
    if (!showResults) { F.readout([]); return; }
    const rows = [];
    if (rep) {
      const u = unitTeX(E.repeat.unit);
      rows.push(['$N$', String(rs.n)]);
      if (rs.n >= 1) rows.push(['mean', `${numTxt(rs.mean, 5)}${u ? `\\ ${u}` : ''}`]);
      if (rs.n >= 2) {
        rows.push(['SD', `${numTxt(rs.sd, 2)}${u ? `\\ ${u}` : ''}`]);
        rows.push(['SEM = SD/$\\sqrt N$', `${numTxt(rs.sem, 2)}${u ? `\\ ${u}` : ''}`]);
        if (Number.isFinite(rs.accepted)) rows.push([`mean is from ${E.repeat.acceptedLabel || 'accepted'} ${keepTxt(rs.accepted, 4)}`, `${numTxt(Math.abs(rs.mean - rs.accepted) / rs.sem, 2)}\\ \\text{SEM}`]);
      }
      F.readout(rows);
      return;
    }
    if (!an) { F.readout([]); return; }
    const A = an.A;
    const many = an.series.length > 1;
    an.series.forEach((s) => {
      const f = s.fit;
      if (!f) return;
      if (!many) {
        rows.push(['slope', pmTeX(f.b, f.sb, slopeUnit(A, 0))]);
        rows.push(['intercept', pmTeX(f.a, f.sa, A.ys[0].unit)]);
      }
      if (f.dof > 0) rows.push([many ? `$\\chi^2$/dof (${s.Y.name.split(' ')[0]})` : '$\\chi^2$/dof', f.chi2r.toFixed(2)]);
    });
    if (anO) anO.series.forEach((s) => s.fit && rows.push(['slope through (0, 0)', pmTeX(s.fit.b, s.fit.sb, slopeUnit(A, 0))]));
    if (!A.curved) for (const r of an.results) {
      if (!Number.isFinite(r.value)) continue;
      rows.push([`$${symTeX(r.res.sym)}$`, pmTeX(r.value, r.sigma, r.res.unit)]);
      if (Number.isFinite(r.accepted)) {
        const lab = typeof r.res.acceptedLabel === 'function' ? r.res.acceptedLabel(PP) : r.res.acceptedLabel || 'accepted';
        rows.push([`from ${lab} ${keepTxt(r.accepted, 3)}`, `${numTxt(r.z, 2)}\\,\\sigma`]);
      }
    }
    if (A.curved && an.series[0].fit) rows.push(['', '\\text{curved — no slope to interpret}']);
    F.readout(rows);
  }

  // ─── apparatus ──────────────────────────────────────────────────────────
  function drawApparatus(pl, E, PP, st) {
    pl.clear();
    const fn = APPARATUS[E.apparatus];
    if (fn) fn(pl, E, PP, st, { compact });
  }

  F.draw(redraw);
  const { E } = expOf(state.id);
  F.caption(`${E.note} Error bars are ±1 standard uncertainty.${P.view === 'apparatus' ? ' Not to scale.' : ''} A simulation: the readings are computed, not measured.`);
  return { get: (k) => F.params[k] };
}

function slopeUnit(A, k) {
  if (A.slopeUnit !== undefined) return A.slopeUnit;
  const yu = A.ys[k].unit, xu = A.x.unit;
  if (!xu) return yu;
  if (!yu) return `1/${xu}`;
  if (yu === xu) return '';
  return `${yu}/${xu}`;
}

// ─── apparatus drawings (world box 20 × 10, y up) ─────────────────────────
// Each draws the set-up for the current setting and the latest reading, with
// the cause of the systematic error (when it is on) marked in amber.

function display(pl, x, y, lines, o = {}) {
  const g = pl.ctx, c = pl.col;
  const fs = o.compact ? 11 : 12.5;
  g.save();
  g.font = `600 ${fs}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  const w = Math.max(...lines.map((s) => g.measureText(s).width)) + 16, hh = lines.length * (fs + 5) + 8;
  const X = pl.X(x) - (o.align === 'right' ? w : o.align === 'center' ? w / 2 : 0), Y = pl.Y(y) - hh / 2;
  g.fillStyle = c.panel; g.strokeStyle = c.line3; g.lineWidth = 1.2;
  roundRect(g, X, Y, w, hh, 6); g.fill(); g.stroke();
  g.fillStyle = o.color ? pl.color(o.color) : c.good; g.textBaseline = 'top'; g.textAlign = 'left';
  lines.forEach((s, i) => g.fillText(s, X + 8, Y + 6 + i * (fs + 5)));
  if (o.title) { g.font = `500 ${fs - 1.5}px Inter, system-ui, sans-serif`; g.fillStyle = c.ink3; g.fillText(o.title, X, Y - fs - 3); }
  g.restore();
}
function roundRect(g, x, y, w, hh, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r);
  g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
/** A dimension line with end ticks and a label (world coordinates). */
function dim(pl, x0, y0, x1, y1, label, o = {}) {
  const col = o.color || 'gold';
  pl.line(x0, y0, x1, y1, { color: col, width: 1.4 });
  const L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L * 0.22, ny = (x1 - x0) / L * 0.22;
  pl.line(x0 - nx, y0 - ny, x0 + nx, y0 + ny, { color: col, width: 1.4 });
  pl.line(x1 - nx, y1 - ny, x1 + nx, y1 + ny, { color: col, width: 1.4 });
  if (label) pl.text(label, (x0 + x1) / 2 + (o.dx ?? 0.25), (y0 + y1) / 2 + (o.dy ?? 0), { color: col, size: o.size || 12, weight: 600, align: o.align || 'left' });
}
function block(pl, x, y, w, hh, col, alpha = 0.85) { pl.rect(x, y, w, hh, { fill: col, alpha, stroke: col, width: 1.2 }); }
function floor(pl, x0, x1, y) {
  pl.line(x0, y, x1, y, { color: 'ink3', width: 2 });
  for (let x = x0 + 0.3; x < x1; x += 0.6) pl.line(x, y, x - 0.3, y - 0.3, { color: 'ink4', width: 1 });
}
function zigzag(pl, x, y0, y1, w, turns, col) {
  const pts = [[x, y0]];
  const n = turns * 2;
  for (let k = 1; k < n; k++) pts.push([x + (k % 2 ? w : -w), y0 + ((y1 - y0) * k) / n]);
  pts.push([x, y1]);
  pl.path(pts, { color: col, width: 1.6 });
}
function sysTag(pl, x, y, text, o = {}) { pl.text(`⚠ ${text}`, x, y, { color: 'warn', size: o.size || 11.5, weight: 650, align: o.align || 'left' }); }
const fx = (x, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : '—');

const APPARATUS = {
  pendulum(pl, E, P, st, o) {
    const stopwatch = !E.setting;
    const sys = st.sys;
    const L = stopwatch ? P.L : st.setting ?? 0.8;
    const Ltrue = L + (sys === 'knot' ? P.rb : 0);
    const k = 5.0, piv = [8, 9.2];
    pl.line(5.5, 9.25, 11, 9.25, { color: 'ink3', width: 4 });
    block(pl, 7.6, 9.2, 0.8, 0.45, 'ink3', 0.8);
    const amp = Math.max(sys === 'amplitude' ? P.ampBig : P.amp ?? 5, 7) * D2R;
    const len = Ltrue * k, bob = 0.34;
    const bx = piv[0] + len * Math.sin(amp), by = piv[1] - len * Math.cos(amp);
    pl.line(piv[0], piv[1], piv[0], piv[1] - len - 0.6, { color: 'ink4', width: 1, dash: [4, 4] });
    pl.line(piv[0], piv[1], bx, by, { color: 'ink2', width: 1.4 });
    pl.circle(bx, by, bob, { fill: 'accent', color: 'accent', width: 1.2 });
    // the swing’s far side, faint
    pl.circle(piv[0] - len * Math.sin(amp), by, bob, { fill: 'accent', alpha: 0.18, stroke: false });
    if (st.labels) {
      if (sys === 'knot') {
        dim(pl, 5.6, piv[1], 5.6, piv[1] - L * k, `recorded ${fx(L, 2)} m`, { color: 'warn', dx: -0.2, align: 'right' });
        dim(pl, 6.4, piv[1], 6.4, piv[1] - Ltrue * k, `true ${fx(Ltrue, 3)} m`, { dx: 0.25 });
        sysTag(pl, 10.4, piv[1] - Ltrue * k - 0.9, 'measured to the top of the bob');
      } else dim(pl, 6.2, piv[1], 6.2, piv[1] - L * k, `L = ${fx(L, stopwatch ? 3 : 2)} m`, { dx: -0.2, align: 'right' });
      if (sys === 'amplitude') sysTag(pl, bx + 0.6, by - 0.4, `released at ${P.ampBig}°`);
      const r = st.row?.R?.[0];
      if (stopwatch) {
        display(pl, 13.2, 6.4, [Number.isFinite(r) ? `${r.toFixed(2)} s` : '0.00 s'], { compact: o.compact, title: `stopwatch, ${P.n === 10 ? '10 swings' : '1 swing'}` });
        if (Number.isFinite(r) && P.n === 10) pl.text(`T = ${(r / 10).toFixed(3)} s`, 13.2, 4.9, { color: 'ink2', size: 12 });
        if (sys === 'reaction') sysTag(pl, 13.2, 3.7, 'stopped 0.10 s late');
      } else {
        display(pl, 13.2, 6.4, [Number.isFinite(r) ? `t₁₀ = ${r.toFixed(2)} s` : 't₁₀ = —'], { compact: o.compact, title: 'stopwatch, 10 swings' });
        if (Number.isFinite(r)) pl.text(`T = t₁₀/10 = ${(r / 10).toFixed(3)} s`, 13.2, 4.8, { color: 'ink2', size: 12 });
      }
    }
  },

  ramp(pl, E, P, st, o) {
    const sys = st.sys;
    const A = [2.0, 7.0], Bp = [19, 2.2];           // track ends (top-left to bottom-right), angle exaggerated
    const len = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), u = [(Bp[0] - A[0]) / len, (Bp[1] - A[1]) / len];
    const k = len / 2.0;                              // world units per metre along the track (2.0 m track)
    pl.path([[A[0], A[1] - 0.25], [Bp[0], Bp[1] - 0.25], [Bp[0], 1.0], [A[0], 1.0]], { color: 'ink4', width: 1, fill: 'ink4', fillAlpha: 0.12, close: true });
    pl.line(A[0], A[1], Bp[0], Bp[1], { color: 'ink2', width: 3 });
    block(pl, 0.6, A[1] - 0.2, 1.1, 0.8, 'ink3', 0.7);
    pl.text('sensor', 0.6, A[1] + 1.0, { color: 'ink3', size: 11 });
    const s0 = 0.25;                                  // release point, metres from the sensor
    const t = st.setting ?? 1.5;
    const x = st.row?.R?.[0] ?? 0.5 * P.g * Math.sin(P.theta * D2R) * t * t;
    const pos = (m) => [A[0] + u[0] * k * m, A[1] + u[1] * k * m];
    const rel = pos(s0), cart = pos(s0 + Math.max(0, x - (sys === 'zero' ? P.x0 : 0)));
    pl.circle(rel[0], rel[1] + 0.35, 0.12, { fill: 'ink3', stroke: false });
    const cw = 1.4, chh = 0.6, nrm = [-u[1], u[0]];
    const corner = (a, b) => [cart[0] + u[0] * a + nrm[0] * b, cart[1] + u[1] * a + nrm[1] * b];
    pl.path([corner(-cw / 2, 0.08), corner(cw / 2, 0.08), corner(cw / 2, chh), corner(-cw / 2, chh)], { color: 'accent', width: 1.2, fill: 'accent', fillAlpha: 0.85, close: true });
    if (st.labels) {
      const off = 1.1;
      const p0 = [rel[0] + nrm[0] * off, rel[1] + nrm[1] * off], p1 = [cart[0] + nrm[0] * off, cart[1] + nrm[1] * off];
      dim(pl, p0[0], p0[1], p1[0], p1[1], `x = ${fx(x, 3)} m`, { dy: 0.45, dx: -0.6 });
      display(pl, 13.2, 8.4, [`t = ${fx(t, 2)} s`, `x = ${fx(x, 3)} m`], { compact: o.compact, title: 'motion sensor' });
      pl.text('angle exaggerated', 14.6, 1.5, { color: 'ink3', size: 10.5 });
      if (sys === 'zero') sysTag(pl, 2.4, 9.3, 'sensor zero 5.0 cm behind the release point');
    }
  },

  freefall(pl, E, P, st, o) {
    const sys = st.sys;
    const hgt = st.setting ?? 0.6, k = 4.4, padY = 1.4, r = 0.32;
    floor(pl, 1, 19, 1.0);
    pl.line(4.2, 1.0, 4.2, 9.6, { color: 'ink3', width: 3 });
    block(pl, 3.2, 1.0, 2.0, 0.3, 'ink3', 0.7);
    const top = padY + hgt * k + 2 * r;                  // ball bottom at padY + h·k
    pl.line(4.2, top + 0.4, 6.8, top + 0.4, { color: 'ink3', width: 2.4 });
    block(pl, 6.2, top + 0.05, 1.2, 0.7, 'violet', 0.85);
    pl.text('magnet', 7.6, top + 0.45, { color: 'violet', size: 11 });
    // strobe: where the ball is at equal 50 ms steps (faint), then the ball at release
    const T = Math.sqrt((2 * hgt) / P.g);
    for (let t = 0.05; t < T; t += 0.05) { const y = padY + r + hgt * k - 0.5 * P.g * t * t * k; pl.circle(6.8, y, r * 0.8, { fill: 'accent', alpha: 0.16, stroke: false }); }
    pl.circle(6.8, padY + r + hgt * k, r, { fill: 'accent', color: 'accent', width: 1 });
    block(pl, 5.9, padY - 0.25, 1.8, 0.25, 'ink2', 0.8);
    pl.text('trapdoor', 7.9, padY - 0.15, { color: 'ink3', size: 11 });
    if (st.labels) {
      dim(pl, 9.0, padY, 9.0, padY + hgt * k, `h = ${fx(hgt, 2)} m`);
      const tt = st.row?.R?.[0];
      display(pl, 13.0, 6.0, [`t = ${Number.isFinite(tt) ? tt.toFixed(3) : '—'} s`], { compact: o.compact, title: 'timer' });
      pl.line(7.4, top + 0.45, 13.0, 6.3, { color: 'ink4', width: 1, dash: [3, 3] });
      pl.line(7.7, padY - 0.12, 13.0, 5.7, { color: 'ink4', width: 1, dash: [3, 3] });
      if (sys === 'delay') sysTag(pl, 13.0, 3.6, 'magnet lets go 12 ms after the timer starts');
    }
  },

  launcher(pl, E, P, st, o) {
    const sys = st.sys;
    const th = (st.setting ?? 30) * D2R, k = 7.0;
    const piv = [2.0, 2.2], M = [piv[0] + 1.0 * Math.cos(th), piv[1] + 1.0 * Math.sin(th)];
    floor(pl, 0.5, 19.5, 1.2);
    block(pl, 0.9, 1.2, 1.6, 0.7, 'ink3', 0.7);
    pl.line(M[0], M[1], 19.3, M[1], { color: 'ink3', width: 2 });
    pl.text('landing table, level with the muzzle', 10.5, M[1] - 0.45, { color: 'ink3', size: 10.5 });
    pl.line(piv[0], piv[1], M[0], M[1], { color: 'violet', width: 7 });
    const R = st.rep ? (st.rs?.mean ?? (P.v0 ** 2 * Math.sin(2 * th)) / P.g) : st.row?.R?.[0] ?? (P.v0 ** 2 * Math.sin(2 * th)) / P.g;
    const Rt = R + (sys === 'zero' ? P.offset : 0);
    const v0 = P.v0, tf = (2 * v0 * Math.sin(th)) / P.g;
    pl.curve((t) => M[0] + k * v0 * Math.cos(th) * t * (Rt / ((v0 * v0 * Math.sin(2 * th)) / P.g)), (t) => M[1] + k * (v0 * Math.sin(th) * t - 0.5 * P.g * t * t), 0, tf, { color: 'accent', width: 1.6, dash: [5, 4] });
    const land = M[0] + Rt * k;
    pl.rect(land - 0.6, M[1], 1.2, 0.08, { fill: 'ink', alpha: 0.6, stroke: false });
    pl.circle(land, M[1] + 0.16, 0.16, { fill: 'accent', stroke: false });
    pl.text(`θ = ${Math.round(th / D2R)}°`, M[0] + 0.5, M[1] + 0.5, { color: 'violet', size: 12, weight: 600 });
    if (st.labels) {
      const z0 = M[0] + (sys === 'zero' ? P.offset * k : 0);
      dim(pl, z0, M[1] - 1.0, land, M[1] - 1.0, `R = ${fx(R, 3)} m`, { dy: -0.4, dx: -1.2 });
      display(pl, 13.6, 8.4, [`θ = ${Math.round(th / D2R)}°`, `R = ${fx(R, 3)} m`], { compact: o.compact, title: st.rep ? 'mean of the shots' : 'latest shot' });
      if (sys === 'zero') sysTag(pl, 0.7, 9.4, 'tape zero 6.0 cm ahead of the launch point');
    }
  },

  cart(pl, E, P, st, o) {
    const sys = st.sys;
    const m = st.setting ?? 0.03;
    const y = 4.6;
    pl.line(1.0, y, 16.2, y, { color: 'ink2', width: 3 });
    block(pl, 15.6, 1.0, 0.5, y - 1.0, 'ink4', 0.5);
    pl.circle(16.4, y + 0.42, 0.42, { color: 'ink2', width: 1.6 });
    block(pl, 0.2, y + 0.05, 0.8, 0.8, 'ink3', 0.7);
    pl.text('sensor', 0.1, y + 1.3, { color: 'ink3', size: 11 });
    const cx = 6.0;
    block(pl, cx, y + 0.2, 2.6, 0.9, 'accent', 0.85);
    pl.circle(cx + 0.5, y + 0.15, 0.15, { fill: 'ink2', stroke: false }); pl.circle(cx + 2.1, y + 0.15, 0.15, { fill: 'ink2', stroke: false });
    // the slotted masses still riding on the cart: 100 g in all, minus what hangs
    const onCart = Math.max(0, Math.round((0.1 - m) / 0.01));
    for (let i = 0; i < Math.min(onCart, 10); i++) block(pl, cx + 0.25 + 0.22 * i, y + 1.1, 0.16, 0.45, 'ink3', 0.9);
    pl.line(cx + 2.6, y + 0.84, 16.4, y + 0.84, { color: 'ink2', width: 1.2 });
    const hang = 0.6 + 6 * m, hy = y - 1.0 - 1.4;
    pl.line(16.82, y + 0.42, 16.82, hy + hang, { color: 'ink2', width: 1.2 });
    block(pl, 16.4, hy, 0.84, hang, 'violet', 0.85);
    if (st.labels) {
      pl.text(`m = ${fx(m, 3)} kg`, 17.4, hy + hang / 2, { color: 'violet', size: 12, weight: 600 });
      const a = st.row?.R?.[0];
      pl.arrow(cx + 1.3, y + 2.1, cx + 1.3 + 2.4 * Math.min(1.4, Math.max(0.15, (a ?? m * P.g / P.M) / 0.6)), y + 2.1, { color: 'gold', width: 2.2 });
      pl.text('a', cx + 1.0, y + 2.1, { color: 'gold', size: 12, weight: 700, align: 'right' });
      display(pl, 1.0, 8.6, [`a = ${Number.isFinite(a) ? a.toFixed(3) : '—'} m/s²`], { compact: o.compact, title: 'from the motion sensor' });
      pl.text(`total moving mass ${fx(P.M, 3)} kg`, 6.0, 2.6, { color: 'ink3', size: 11 });
      if (sys === 'friction') { pl.arrow(cx + 1.3, y - 0.25, cx - 0.5, y - 0.25, { color: 'warn', width: 2 }); sysTag(pl, cx - 0.5, y - 0.85, 'friction 0.030 N'); }
    }
  },

  friction(pl, E, P, st, o) {
    const sys = st.sys;
    const m = st.setting ?? 0.5;
    const y = 3.0;
    pl.rect(0.8, y - 0.5, 15.0, 0.5, { fill: 'gold', alpha: 0.25, stroke: 'gold', width: 1 });
    block(pl, 4.6, y, 3.4, 1.3, 'accent', 0.85);
    const discs = Math.round(m / 0.25);
    for (let i = 0; i < discs; i++) block(pl, 5.1, y + 1.3 + 0.42 * i, 2.4, 0.36, 'ink3', 0.9);
    pl.text(`${fx(P.mb, 3)} kg + ${fx(m, 2)} kg`, 6.3, y - 1.05, { color: 'ink2', size: 11.5, align: 'center' });
    const al = sys === 'angle' ? P.angle * D2R : 0;
    const hook = [8.0, y + 0.65], end = [8.0 + 4.6 * Math.cos(al), y + 0.65 + 4.6 * Math.sin(al)];
    pl.line(hook[0], hook[1], end[0], end[1], { color: 'ink2', width: 1.3 });
    const g = pl.ctx;
    g.save(); g.translate(pl.X(end[0]), pl.Y(end[1])); g.rotate(-al);
    g.fillStyle = pl.color('violet'); g.globalAlpha = 0.9; roundRect(g, 0, -12, 64, 24, 5); g.fill(); g.restore();
    pl.text('force sensor', end[0] + 0.2, end[1] + 1.0, { color: 'violet', size: 11 });
    if (st.labels) {
      const R = st.row?.R;
      display(pl, 13.2, 8.6, [`peak  ${R ? R[0].toFixed(2) : '—'} N`, `slide ${R ? R[1].toFixed(2) : '—'} N`], { compact: o.compact, title: 'force sensor' });
      pl.arrow(6.3, y + 0.2, 6.3, y - 0.6 - 0.6, { color: 'ink3', width: 1.2 });
      if (sys === 'angle') sysTag(pl, 8.6, y + 3.3, 'string pulled 20° above horizontal');
    }
  },

  tilt(pl, E, P, st, o) {
    const sys = st.sys;
    const r = st.row?.R?.[0];
    const thTrue = Math.atan(P.mus) / D2R;
    const th = (Number.isFinite(r) ? r - (sys === 'zero' ? P.zero : 0) : thTrue) * D2R;
    floor(pl, 1, 19, 1.4);
    const piv = [2.6, 1.6], Lb = 13;
    const end = [piv[0] + Lb * Math.cos(th), piv[1] + Lb * Math.sin(th)];
    pl.path([[piv[0], piv[1]], [end[0], end[1]], [end[0] + 0.3 * Math.sin(th), end[1] - 0.3 * Math.cos(th)], [piv[0] + 0.3 * Math.sin(th), piv[1] - 0.3 * Math.cos(th)]], { color: 'gold', width: 1, fill: 'gold', fillAlpha: 0.3, close: true });
    const bx = piv[0] + 8.5 * Math.cos(th), by = piv[1] + 8.5 * Math.sin(th);
    const u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
    pl.path([[bx, by], [bx + 2 * u[0], by + 2 * u[1]], [bx + 2 * u[0] + 1.1 * n[0], by + 2 * u[1] + 1.1 * n[1]], [bx + 1.1 * n[0], by + 1.1 * n[1]]], { color: 'accent', fill: 'accent', fillAlpha: 0.85, close: true, width: 1 });
    pl.curve((t) => piv[0] + 3.2 * Math.cos(t), (t) => piv[1] + 3.2 * Math.sin(t), 0, th, { color: 'ink2', width: 1.4 });
    if (st.labels) {
      pl.text('θ', piv[0] + 3.6 * Math.cos(th / 2), piv[1] + 3.6 * Math.sin(th / 2), { color: 'ink2', size: 13, weight: 600 });
      display(pl, 14.0, 8.6, [`θc = ${Number.isFinite(r) ? r.toFixed(1) : '—'}°`], { compact: o.compact, title: 'protractor at slipping' });
      if (sys === 'zero') sysTag(pl, 11.0, 2.4, 'protractor reads 2.0° with the board flat');
    }
  },

  energy(pl, E, P, st, o) {
    const sys = st.sys;
    const hgt = st.setting ?? 0.1, th = P.theta * D2R, k = 11.5;
    const gate = [16.8, 2.2];                         // the photogate on the track
    const u = [-Math.cos(th), Math.sin(th)];           // up the slope (to the left)
    const top = [gate[0] + u[0] * 16, gate[1] + u[1] * 16];
    floor(pl, 0.5, 19.5, 1.0);
    pl.path([[top[0], top[1]], [18.8, gate[1] - u[1] * 2 / 1], [18.8, 1.0], [top[0], 1.0]], { color: 'ink4', fill: 'ink4', fillAlpha: 0.1, width: 1, close: true });
    pl.line(top[0], top[1], 18.8, gate[1] - u[1] * 2, { color: 'ink2', width: 3 });
    const d = hgt / Math.sin(th);
    const c = [gate[0] + u[0] * d * k, gate[1] + u[1] * d * k];
    const n = [Math.sin(th), Math.cos(th)];
    const corner = (a, b) => [c[0] + u[0] * a + n[0] * b, c[1] + u[1] * a + n[1] * b];
    pl.path([corner(-0.7, 0.1), corner(0.7, 0.1), corner(0.7, 0.65), corner(-0.7, 0.65)], { color: 'accent', fill: 'accent', fillAlpha: 0.85, close: true, width: 1 });
    const fl = corner(0, 0.65), ft = corner(0, 1.25);
    pl.line(fl[0], fl[1], ft[0], ft[1], { color: sys === 'flag' ? 'warn' : 'ink', width: 3 });
    // the photogate: an inverted U over the track
    pl.path([[gate[0] - 0.35, gate[1] - 0.2], [gate[0] - 0.35, gate[1] + 1.7], [gate[0] + 0.35, gate[1] + 1.7], [gate[0] + 0.35, gate[1] - 0.2]], { color: 'violet', width: 3 });
    if (st.labels) {
      dim(pl, c[0] - 1.4, gate[1] + 0.35, c[0] - 1.4, c[1] + 0.35, `h = ${fx(hgt, 2)} m`, { dx: -0.25, align: 'right' });
      pl.line(c[0] - 1.6, gate[1] + 0.35, gate[0], gate[1] + 0.35, { color: 'ink4', width: 1, dash: [3, 3] });
      pl.text('photogate', gate[0] - 1.4, gate[1] + 2.2, { color: 'violet', size: 11 });
      pl.text(`θ = ${P.theta}°`, top[0] + 1.0, top[1] - 1.3, { color: 'ink3', size: 11 });
      const dt = st.row?.R?.[0];
      display(pl, 13.4, 8.6, [`Δt = ${Number.isFinite(dt) ? (dt * 1000).toFixed(1) : '—'} ms`, `v = w/Δt = ${Number.isFinite(dt) ? (P.w / dt).toFixed(3) : '—'} m/s`], { compact: o.compact, title: 'gate timer (w = 2.50 cm assumed)' });
      if (sys === 'flag') sysTag(pl, ft[0] - 0.5, ft[1] + 0.6, 'flag really 2.60 cm wide');
    }
  },

  collision(pl, E, P, st, o) {
    const sys = st.sys;
    const y = 3.0;
    pl.line(0.5, y, 19.5, y, { color: 'ink2', width: 3 });
    const gateAt = (x, name) => { pl.path([[x - 0.35, y - 0.2], [x - 0.35, y + 2.3], [x + 0.35, y + 2.3], [x + 0.35, y - 0.2]], { color: 'violet', width: 3 }); pl.text(name, x - 0.55, y + 2.8, { color: 'violet', size: 11 }); };
    gateAt(5.5, 'gate A'); gateAt(14.5, 'gate B');
    const cart = (x, col, label) => { block(pl, x, y + 0.2, 2.6, 0.9, col, 0.85); pl.circle(x + 0.5, y + 0.15, 0.15, { fill: 'ink2', stroke: false }); pl.circle(x + 2.1, y + 0.15, 0.15, { fill: 'ink2', stroke: false }); pl.text(label, x + 1.3, y - 0.6, { color: 'ink2', size: 11, align: 'center' }); };
    cart(1.6, 'accent', `cart 1, ${fx(P.m1, 3)} kg`);
    cart(8.6, 'violet', `cart 2, ${fx(P.m2, 3)} kg`);
    pl.rect(4.2, y + 0.3, 0.12, 0.7, { fill: 'ink', alpha: 0.5, stroke: false });
    pl.rect(8.48, y + 0.3, 0.12, 0.7, { fill: 'ink', alpha: 0.5, stroke: false });
    pl.text('Velcro', 6.4, y + 1.45, { color: 'ink3', size: 10.5, align: 'center' });
    pl.arrow(2.9, y + 1.7, 5.0, y + 1.7, { color: 'gold', width: 2.2 });
    pl.text('u₁', 2.6, y + 1.7, { color: 'gold', size: 12, weight: 700, align: 'right' });
    if (sys === 'mass') { block(pl, 9.0, y + 1.1, 1.8, 0.35, 'warn', 0.9); sysTag(pl, 8.2, y + 2.9, '0.100 kg bar, never weighed'); }
    if (st.labels) {
      const R = st.row?.R;
      display(pl, 11.6, 8.5, [`u₁ = ${R ? R[0].toFixed(3) : '—'} m/s`, `v  = ${R ? R[1].toFixed(3) : '—'} m/s`], { compact: o.compact, title: 'gate A before, gate B after' });
    }
  },

  rotary(pl, E, P, st, o) {
    const sys = st.sys;
    const m = st.setting ?? 0.05;
    const c = [6.2, 5.6], Rd = 3.3, rp = 0.75;
    block(pl, 5.6, 1.0, 1.2, c[1] - 1.0, 'ink4', 0.6);
    floor(pl, 1, 19, 1.0);
    pl.circle(c[0], c[1], Rd, { fill: 'accent', alpha: 0.35, color: 'accent', width: 2 });
    if (P.ring) { pl.circle(c[0], c[1], Rd * (P.R2 / P.R), { fill: 'gold', alpha: 0.35, color: 'gold', width: 1.5 }); pl.circle(c[0], c[1], Rd * (P.R1 / P.R), { fill: 'accent', alpha: 0.45, stroke: false }); }
    pl.circle(c[0], c[1], rp, { fill: 'ink3', alpha: 0.9, color: 'ink2', width: 1.2 });
    pl.circle(c[0], c[1], 0.14, { fill: 'ink', stroke: false });
    const pul = [14.2, c[1] + rp - 0.4];
    pl.line(c[0], c[1] + rp, pul[0], c[1] + rp, { color: 'ink2', width: 1.2 });
    pl.circle(pul[0], pul[1], 0.4, { color: 'ink2', width: 1.5 });
    block(pl, 13.9, 1.0, 0.6, pul[1] - 1.3, 'ink4', 0.4);
    const hang = 0.5 + 5 * m, hy = 2.0;
    pl.line(pul[0] + 0.4, pul[1], pul[0] + 0.4, hy + hang, { color: 'ink2', width: 1.2 });
    block(pl, pul[0] - 0.05, hy, 0.9, hang, 'violet', 0.85);
    pl.curve((t) => c[0] + (Rd + 0.5) * Math.cos(t), (t) => c[1] + (Rd + 0.5) * Math.sin(t), 0.35, 1.25, { color: 'gold', width: 2.2 });
    pl.arrow(c[0] + (Rd + 0.5) * Math.cos(0.45), c[1] + (Rd + 0.5) * Math.sin(0.45), c[0] + (Rd + 0.5) * Math.cos(0.3), c[1] + (Rd + 0.5) * Math.sin(0.3), { color: 'gold', width: 2.2 });
    if (st.labels) {
      pl.text('α', c[0] + (Rd + 0.9) * Math.cos(0.8), c[1] + (Rd + 0.9) * Math.sin(0.8), { color: 'gold', size: 13, weight: 700 });
      pl.text(`m = ${fx(m, 3)} kg`, pul[0] + 1.1, hy + hang / 2, { color: 'violet', size: 12, weight: 600 });
      pl.text(P.ring ? 'disc + ring' : `disc ${fx(P.M, 3)} kg, R = ${fx(P.R * 100, 2)} cm`, c[0], c[1] - Rd - 0.55, { color: 'ink2', size: 11, align: 'center' });
      const a = st.row?.R?.[0];
      display(pl, 16.2, 8.7, [`α = ${Number.isFinite(a) ? a.toFixed(3) : '—'} rad/s²`], { compact: o.compact, title: 'rotary motion sensor', align: 'center' });
      if (sys === 'friction') sysTag(pl, c[0] + 0.4, c[1] - 0.6, 'bearing friction');
    }
  },

  spring(pl, E, P, st, o) {
    const sys = st.sys;
    const m = st.setting ?? 0.15, dynamic = E === B.EXPERIMENTS['spring-dynamic'];
    const k = 12, top = 9.3, L0 = 2.0;
    pl.line(4.5, top, 11.5, top, { color: 'ink3', width: 4 });
    const ext = ((m + P.mh) * P.g) / P.k;
    const yb = top - L0 - ext * k;
    zigzag(pl, 8, top, yb, 0.45, 9 + Math.round(ext * 10), 'ink2');
    pl.line(8, yb, 8, yb - 0.4, { color: sys === 'hanger' ? 'warn' : 'ink2', width: 2 });
    const discs = Math.round(m / 0.05);
    block(pl, 7.3, yb - 0.75, 1.4, 0.32, sys === 'hanger' ? 'warn' : 'ink3', 0.95);
    for (let i = 0; i < discs; i++) block(pl, 7.4, yb - 0.75 - 0.27 * (i + 1), 1.2, 0.24, 'violet', 0.85);
    // metre stick
    pl.rect(12.4, 1.0, 0.7, top - 1.3, { fill: 'gold', alpha: 0.2, stroke: 'gold', width: 1 });
    for (let j = 0; j <= 7; j++) pl.line(12.4, top - 0.3 - j * 1.2, 12.75, top - 0.3 - j * 1.2, { color: 'gold', width: 1 });
    pl.line(8.8, yb - 0.6, 12.4, yb - 0.6, { color: 'ink4', width: 1, dash: [3, 3] });
    if (dynamic) { pl.arrow(6.2, yb - 0.4, 6.2, yb + 0.8, { color: 'gold', width: 1.8 }); pl.arrow(6.2, yb - 0.4, 6.2, yb - 1.6, { color: 'gold', width: 1.8 }); }
    if (st.labels) {
      pl.text(`hanger ${fx(P.mh, 3)} kg + ${fx(m, 3)} kg`, 3.4, yb - 1.1, { color: 'ink2', size: 11, align: 'right' });
      const r = st.row?.R?.[0];
      if (dynamic) display(pl, 14.0, 6.4, [`t₁₀ = ${Number.isFinite(r) ? r.toFixed(2) : '—'} s`], { compact: o.compact, title: 'stopwatch, 10 bounces' });
      else display(pl, 14.0, 6.4, [`x = ${Number.isFinite(r) ? r.toFixed(3) : '—'} m`], { compact: o.compact, title: 'extension on the stick' });
      if (sys === 'hanger') sysTag(pl, 13.6, 3.4, 'hanger not in the table');
    }
  },

  heater(pl, E, P, st, o) {
    const sys = st.sys;
    const lag = sys !== 'leak';
    floor(pl, 0.5, 19.5, 1.0);
    if (lag) { pl.rect(1.6, 1.0, 7.8, 6.8, { fill: 'violet', alpha: 0.18, stroke: 'violet', width: 1 }); pl.text('lagging', 1.8, 8.2, { color: 'violet', size: 11 }); }
    block(pl, 2.4, 1.0, 6.2, 5.8, 'ink3', 0.55);
    pl.text(`aluminium, ${fx(P.m, 3)} kg`, 5.5, 3.0, { color: 'ink', size: 11.5, align: 'center' });
    block(pl, 3.6, 4.2, 0.5, 4.6, 'bad', 0.85);
    block(pl, 6.9, 4.6, 0.25, 4.4, 'ink2', 0.9);
    pl.text('heater', 3.0, 9.3, { color: 'bad', size: 11 });
    pl.text('thermometer', 6.3, 9.5, { color: 'ink2', size: 11 });
    pl.line(3.85, 8.8, 15.3, 8.8, { color: 'bad', width: 1.2 }); pl.line(15.3, 8.8, 15.3, 7.8, { color: 'bad', width: 1.2 });
    block(pl, 12.0, 4.2, 6.6, 3.6, 'ink4', 0.35);
    pl.text('power supply', 12.2, 8.3, { color: 'ink3', size: 11 });
    if (st.labels) {
      display(pl, 12.5, 6.9, [`V = ${P.V.toFixed(1)} V`, `I = ${P.I.toFixed(2)} A`], { compact: o.compact });
      const T = st.row?.R?.[0];
      display(pl, 12.5, 2.4, [`t = ${Number.isFinite(st.setting) ? st.setting : '—'} s`, `T = ${Number.isFinite(T) ? T.toFixed(1) : '—'} °C`], { compact: o.compact, title: 'clock and thermometer' });
      if (!lag) sysTag(pl, 1.8, 8.2, 'no lagging: heat leaks to the room');
    }
  },
};

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const p = [];
  const ids = Array.isArray(P.exp) ? P.exp : [P.exp];
  if (!ids.length) p.push('exp names no experiment');
  for (const id of ids) if (!B.EXPERIMENTS[id]) p.push(`unknown experiment “${id}”`);
  if (p.length) return p;
  if (!VIEWS.includes(P.view)) p.push(`view must be one of ${VIEWS.join(', ')}`);
  const E = B.EXPERIMENTS[ids[0]];
  const known = new Set([...ids.flatMap((id) => Object.keys(B.EXPERIMENTS[id].defaults))]);
  for (const k of Object.keys(P.params || {})) if (!known.has(k)) p.push(`params.${k} is not a parameter of ${ids.join('/')}`);
  const rep = !E.setting || P.repeat;
  if (P.repeat && !E.repeat) p.push(`${ids[0]} has no repeated-measurement view`);
  if (rep && E.setting && !Number.isFinite(P.at)) p.push('a repeated measurement of an experiment with a knob needs `at`, the fixed setting');
  if (P.axes && !(E.axes && E.axes[P.axes])) p.push(`${ids[0]} has no axes “${P.axes}” (it has ${Object.keys(E.axes || {}).join(', ') || 'none'})`);
  if (P.sysKind && !E.systematics?.[P.sysKind]) p.push(`${ids[0]} has no systematic “${P.sysKind}”`);
  if (P.data) {
    if (!Array.isArray(P.data) || !P.data.length) p.push('data must be a non-empty list of rows');
    else {
      const want = rep ? E.series.length : 1 + E.series.length;
      P.data.forEach((row, i) => { if (!Array.isArray(row) || row.length !== want || row.some((v) => !Number.isFinite(v))) p.push(`data row ${i} must be ${want} numbers`); });
    }
  }
  if (P.settings && (!Array.isArray(P.settings) || P.settings.some((v) => !Number.isFinite(v)))) p.push('settings must be a list of numbers');
  if (P.view === 'bench' && P.data) p.push('a bench starts from its own readings: give data only to a static view');
  if (P.residuals && rep) p.push('residuals belong to a fitted line, not repeated readings');
  return p;
}
