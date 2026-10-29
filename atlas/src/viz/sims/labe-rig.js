// A rig for the classic simulated experiments of the lab course (lab.E.1–E.9):
// e/m in Helmholtz coils, Millikan’s oil drops, the photoelectric effect,
// Franck–Hertz, Michelson and Fabry–Pérot interferometers, the Cavendish
// balance, coupled pendulums and the speed of light. Three panels: the raw
// signal behind the latest reading (the beam circle, a drop’s up-and-down
// trace, a photocurrent knee, a Franck–Hertz current, fringes, rings, the
// pendulums’ beats, the scope’s pulses); the data, linearized, with ±1σ error
// bars and the least-squares fit (a weighted line, a mean, a line through the
// origin, or a nonlinear fit); and the residuals. A table of readings, the fit
// with χ²/ν, the physical result with its uncertainty and its z against the
// accepted (CODATA 2022) value. Switches put each experiment’s real systematic
// in or take it out, over the same random scatter. Physics, noise and
// analysis: model/labe-rig.js (tested in test/labe-rig.test.mjs).
//
//   { type: 'labe-rig', params: {
//       exp: 'em',          // em millikan photo fh michelson fp cavendish coupled light
//       view: 'bench',      // 'bench' (take readings) | 'plot' (static data, fit, residuals) | 'raw' (the raw signal only)
//       seed: 1,            // the noise: a seed always gives the same readings
//       prefill: 'series',  // bench: start with the standard series, a number of readings, or 0
//       settings: null,     // plot/raw: the settings to read at (default: the standard series)
//       params: {},         // the experiment's physical parameters (see the model's defaults)
//       flags: {},          // systematics and corrections, e.g. { earth: false } (see the model's flags)
//       toggles: null,      // which flags get a switch: true / false / a list of keys (default: all on the bench)
//       axes: null, axesChoice: true,   // which linearization (default: the experiment's); offer the others
//       raw: null,          // the raw-signal panel (default: on in bench, off in plot)
//       at: null,           // raw: which reading the raw panel shows (default: the last)
//       residuals: true, fit: true, expected: false,   // residual panel; the fitted line; the line the accepted value predicts (dashed)
//       results: null,      // readout of the fit and result (default: on in bench, off otherwise)
//       hide: [],           // readout rows shown as “?”: fit chi2 result accepted
//       table: null,        // the table of readings (default: on in bench, not when compact)
//   } }

import { Plot } from '../plot.js';
import { h } from '../../ui/dom.js';
import { makeRng } from '../../core/rng.js';
import * as M from '../model/labe-rig.js';

export const defaults = {
  exp: 'em', view: 'bench', seed: 1, prefill: 'series', settings: null, params: {}, flags: {}, toggles: null,
  axes: null, axesChoice: true, raw: null, at: null, residuals: true, fit: true, expected: false, results: null,
  hide: [], table: null, alt: null, aspect: null,
};
const VIEWS = ['bench', 'plot', 'raw'];
const HIDE = ['fit', 'chi2', 'result', 'accepted'];
const num = (x, n = 3) => (Number.isFinite(x) ? String(+x.toPrecision(n)) : '—');
const pmT = (v, s) => { const r = M.pm(v, s); return r.s ? `${r.v} \\pm ${r.s}` : r.v; };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const E = M.EXPERIMENTS[P.exp];
  const bench = P.view === 'bench';
  const hide = new Set(P.hide || []);
  const q = (k, v) => (hide.has(k) ? '?' : v);
  const st = E.setting;
  const showRaw = P.view === 'raw' || (P.raw ?? bench);
  const showData = P.view !== 'raw';
  const showRes = showData && P.residuals !== false;
  const showResults = P.results ?? bench;
  const showTable = (P.table ?? bench) && !F.compact && showData;

  // ─── state: parameters (options), flags, rows ───────────────────────────
  const params = () => { const o = { ...P.params }; for (const op of E.options || []) o[op.key] = F.params[op.key] ?? P.params[op.key] ?? E.defaults[op.key]; return o; };
  const flagsNow = () => { const o = {}; for (const f of E.flags) o[f.key] = F.params[`flag_${f.key}`] ?? P.flags[f.key] ?? f.value; return o; };
  let rng = makeRng(P.seed);
  let rows = [];
  let latest = -1;
  const fillSeries = (count) => {
    const { P: PP } = M.experiment(P.exp, params());
    let list = bench ? M.seriesOf(E, PP) : (P.settings || M.seriesOf(E, PP));
    if (typeof count === 'number') list = list.slice(0, count);
    rows = rows.concat(M.makeRows(P.exp, { rng, settings: list, params: params() }));
    latest = rows.length - 1;
  };
  if (!bench || P.prefill === 'series') fillSeries();
  else if (typeof P.prefill === 'number' && P.prefill > 0) fillSeries(P.prefill);

  // ─── layout ─────────────────────────────────────────────────────────────
  const rawC = showRaw ? F.canvas({ aspect: 'wide', label: P.alt || `The raw signal: ${E.title}` }) : null;
  const dataC = showData ? F.canvas({ aspect: P.aspect || (bench ? '' : 'wide'), label: P.alt || 'The data with error bars and the fit' }) : null;
  const resC = showRes ? F.canvas({ height: F.compact ? '92px' : '116px', label: 'Residuals: each point minus the fit' }) : null;
  let tableBox = null;
  if (showTable) {
    tableBox = h('div.table-wrap', { style: { maxHeight: '220px', overflowY: 'auto', margin: '.6rem 0 .2rem' } });
    F.el.insertBefore(tableBox, F.el.querySelector('.viz-controls'));
  }

  // ─── controls ───────────────────────────────────────────────────────────
  if (bench) {
    if (st.kind === 'slider') F.slider({ key: 'set', label: st.label, min: st.min, max: st.max, step: st.step, value: st.value, unit: st.unit, explain: st.explain });
    if (st.kind === 'choice') F.choice({ key: 'set', label: st.label, options: st.choices, value: st.value, explain: st.explain });
    for (const op of E.options || []) F.choice({ key: op.key, label: op.label, options: op.choices, value: P.params[op.key] ?? E.defaults[op.key], explain: op.explain });
  }
  const offered = P.toggles === true || (P.toggles === null && bench) ? E.flags.map((f) => f.key) : Array.isArray(P.toggles) ? P.toggles : [];
  for (const f of E.flags) if (offered.includes(f.key)) F.toggle({ key: `flag_${f.key}`, label: f.label, value: P.flags[f.key] ?? f.value, explain: `${f.explain} Switching re-runs the same readings — same random scatter — so only this changes.` });
  const axKeys = Object.keys(E.axes);
  if (showData && P.axesChoice && axKeys.length > 1 && (bench || P.axesChoice === 'always')) {
    F.choice({ key: 'axes', label: 'Plot', options: axKeys.map((k) => [k, E.axes[k].label]), value: P.axes || E.defaultAxes, explain: 'What goes on each axis: each choice turns a different relationship into a straight line.' });
  }
  if (bench) {
    const take = () => {
      const { P: PP } = M.experiment(P.exp, params());
      let s = null;
      if (st.kind === 'slider' || st.kind === 'choice') s = F.params.set;
      if (st.kind === 'sequence') { const all = M.seriesOf(E, PP); const done = rows.length; if (done >= all.length) return; s = all[done]; }
      rows = rows.concat(M.makeRows(P.exp, { rng, settings: [s], params: params() }));
      latest = rows.length - 1; draw();
    };
    F.button({ label: st.kind === 'random' ? 'Time a new drop' : 'Take a reading', primary: true, onClick: take });
    F.button({ label: st.kind === 'random' ? `Time ${st.series} more drops` : st.kind === 'sequence' ? 'Record to the end' : 'Run the series', onClick: () => {
      if (st.kind === 'sequence') { const { P: PP } = M.experiment(P.exp, params()); const all = M.seriesOf(E, PP); rows = rows.concat(M.makeRows(P.exp, { rng, settings: all.slice(rows.length), params: params() })); latest = rows.length - 1; draw(); }
      else { fillSeries(); draw(); }
    } });
    F.button({ label: 'Clear the table', onClick: () => { rows = []; latest = -1; draw(); } });
  }
  F.onChange((key) => {
    if ((E.options || []).some((op) => op.key === key)) { rows = []; rng = makeRng(P.seed); fillSeries(); }
    draw();
  });

  // ─── drawing ────────────────────────────────────────────────────────────
  const narrow = (c) => (c.clientWidth || 600) < 520;
  function paintRaw(spec) {
    const pl = new Plot(rawC.canvas, { x: spec.x, y: spec.y, equal: !!spec.equal, axes: spec.axes !== false, grid: spec.axes !== false, xlabel: spec.xlabel, ylabel: spec.ylabel, axesAt: 'edge', yticks: spec.yticks, ...(spec.axes === false ? { pad: { l: 4, r: 4, t: 4, b: 4 } } : { pad: { l: 50, r: 12, t: 10, b: 34 } }) });
    pl.clear();
    const small = narrow(rawC.canvas) ? 0.88 : 1;
    for (const l of spec.hlines || []) pl.line(pl.vx0, l.y, pl.vx1, l.y, { color: l.color || 'ink3', width: 1.2, dash: l.dash });
    for (const l of spec.vlines || []) pl.line(l.x, pl.vy0, l.x, pl.vy1, { color: l.color || 'ink3', width: 1.4, dash: l.dash });
    for (const c of spec.circles || []) pl.circle(c.x, c.y, c.r, { color: c.color, width: c.width || 1.5, fill: c.fill, alpha: c.alpha, strokeAlpha: c.alpha });
    for (const p of spec.paths || []) pl.path(p.pts, { color: p.color, width: p.width, dash: p.dash, alpha: p.alpha });
    for (const p of spec.points || []) pl.point(p.x, p.y, { color: p.color, r: p.r });
    for (const t of spec.texts || []) pl.text(t.s, t.x, t.y, { color: t.color, size: (t.size || 11) * small, align: t.align, dx: t.dx, dy: t.dy });
  }
  function draw() {
    const pp = params(), fl = flagsNow();
    const axes = F.params.axes || P.axes || E.defaultAxes;
    const an = rows.length ? M.analyse(P.exp, rows, { axes, params: pp, flags: fl }) : { ...M.experiment(P.exp, pp, fl), A: E.axes[axes], R: [], d: { x: [], y: [], sy: [] }, fit: null, results: [] };
    const { A, d, fit } = an;
    // raw
    if (rawC) {
      const i = P.view === 'raw' && P.at !== null ? Math.min(P.at, an.R.length - 1) : latest;
      const spec = E.raw(an.R, an.P, an.F, i);
      if (spec) paintRaw(spec);
      else { const pl = new Plot(rawC.canvas, { x: [0, 1], y: [0, 1], axes: false, grid: false }); pl.clear(); pl.text(st.kind === 'random' ? 'Time a drop to see its trace' : 'Take a reading to see its signal', 0.5, 0.5, { color: 'ink3', align: 'center' }); }
    }
    // data
    if (dataC) {
      const xs = d.x, ys = d.y, sy = d.sy;
      let x0 = Math.min(...xs), x1 = Math.max(...xs);
      if (!xs.length) { x0 = st.min ?? 0; x1 = st.max ?? 1; }
      if (A.zeroX) x0 = Math.min(0, x0);
      const dx = x1 - x0 || 1;
      x0 -= 0.06 * dx; x1 += 0.06 * dx;
      if (A.zeroX && Math.min(...xs, Infinity) >= 0) x0 = Math.max(x0, A.integerX ? -0.4 : -0.03 * dx);
      let y0 = Math.min(...ys.map((v, i) => v - sy[i])), y1 = Math.max(...ys.map((v, i) => v + sy[i]));
      if (!ys.length) { y0 = 0; y1 = 1; }
      if (fit && P.fit !== false) { for (const xx of [x0, x1]) { const v = fit.f(xx); if (Number.isFinite(v) && !fit.curve) { y0 = Math.min(y0, v); y1 = Math.max(y1, v); } } }
      if (A.zeroY && fit && !fit.curve && P.fit !== false && x0 <= 0) { y0 = Math.min(y0, 0); y1 = Math.max(y1, 0); }
      const dy = y1 - y0 || 1;
      y0 -= 0.1 * dy; y1 += 0.1 * dy;
      const pl = new Plot(dataC.canvas, { x: [x0, x1], y: [y0, y1], xlabel: A.xlabel, ylabel: A.ylabel, axesAt: 'edge', pad: { l: 56, r: 14, t: 12, b: 36 } });
      pl.clear();
      const cap = 0.008 * (x1 - x0);
      if (P.expected) { const g = A.expect?.(an.P, an.F); if (g) pl.fn(g, { color: 'good', width: 1.6, dash: [7, 5] }); }
      if (fit && P.fit !== false) pl.fn(fit.f, { color: 'gold', width: 2.2, samples: fit.curve ? 900 : 200 });
      const many = xs.length > 40;
      xs.forEach((x, i) => {
        if (!many) { pl.line(x, ys[i] - sy[i], x, ys[i] + sy[i], { color: 'accent', width: 1.4 }); pl.line(x - cap, ys[i] + sy[i], x + cap, ys[i] + sy[i], { color: 'accent', width: 1.4 }); pl.line(x - cap, ys[i] - sy[i], x + cap, ys[i] - sy[i], { color: 'accent', width: 1.4 }); }
        pl.point(x, ys[i], { color: 'accent', r: many ? 2.6 : 3.6 });
      });
      if (bench && P.latest !== false && latest >= 0 && latest < xs.length && an.d.x.length === an.R.length) pl.point(xs[latest], ys[latest], { color: 'gold', r: 6.5 }).point(xs[latest], ys[latest], { color: 'accent', r: 3.6 });
      if (P.expected && A.expect) pl.text('dashed: the accepted value', x1, y0, { color: 'good', size: narrow(dataC.canvas) ? 10 : 11, align: 'right', dx: -6, dy: -12 });
      if (resC) {
        const res = fit ? fit.residuals : [];
        const m = Math.max(1e-12, ...res.map((r, i) => Math.abs(r) + sy[i])) * 1.25;
        const pr = new Plot(resC.canvas, { x: [x0, x1], y: [-m, m], ylabel: 'residual', axesAt: 'edge', yticks: 3, pad: { l: 56, r: 14, t: 8, b: 22 } });
        pr.clear();
        pr.line(x0, 0, x1, 0, { color: 'gold', width: 1.4 });
        res.forEach((r, i) => { if (!many) pr.line(xs[i], r - sy[i], xs[i], r + sy[i], { color: 'accent', width: 1.2 }); pr.point(xs[i], r, { color: 'accent', r: many ? 2.2 : 3.2 }); });
      }
    }
    if (tableBox) drawTable(an);
    // readout
    if (!showResults) { F.readout([]); return; }
    const out = [['readings', String(an.R.length)]];
    if (fit) {
      if (A.fit === 'line') out.push(['slope', q('fit', pmT(fit.b, fit.sb))], ['intercept', q('fit', pmT(fit.a, fit.sa))]);
      if (A.fit === 'origin') out.push(['slope (through 0)', q('fit', pmT(fit.b, fit.sb))]);
      if (A.fit === 'mean') out.push(['weighted mean', q('fit', pmT(fit.a, fit.sa))]);
      out.push(['$\\chi^2/\\nu$', q('chi2', `${num(fit.chi2r, 3)}\\ (\\nu = ${fit.dof})`)]);
      for (const r of an.results) {
        out.push([r.label, q('result', `${pmT(r.value / r.scale, r.sigma / r.scale)}${r.unit ? `\\ ${r.unit}` : ''}`)]);
        if (r.accepted !== null && r.accepted !== undefined) out.push(['accepted', q('accepted', `${num(r.accepted / r.scale, 6)}${r.unit ? `\\ ${r.unit}` : ''}${r.z !== null && !hide.has('result') ? `\\ \\ (z = ${r.z.toFixed(1)})` : ''}`)]);
      }
    } else out.push(['fit', '\\text{needs more readings}']);
    F.readout(out);
  }
  function drawTable(an) {
    const cols = E.columns;
    const tr = (cells, th = false) => h('tr', cells.map((c) => h(th ? 'th' : 'td', { style: { padding: '.3rem .6rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', ...(th ? { textTransform: 'none', letterSpacing: 'normal', fontSize: '.78rem' } : {}) } }, c)));
    const extra = P.exp === 'millikan' && an.d.x.length === an.R.length && (F.params.axes || P.axes || E.defaultAxes) === 'qn';
    const head = ['#', ...cols.map((c) => c.head), ...(extra ? ['n (assigned)'] : [])];
    const body = an.R.map((r, i) => tr([String(i + 1), ...cols.map((c) => c.get(r, an.F)), ...(extra ? [String(an.d.x[i])] : [])]));
    tableBox.replaceChildren(h('table.t', { 'aria-label': 'Data table' }, h('thead', tr(head, true)), h('tbody', body.length ? body : [tr([h('span', { style: { color: 'var(--ink-3)' } }, 'No readings yet.')])])));
    tableBox.scrollTop = tableBox.scrollHeight;
  }
  F.draw(draw);
  F.caption(`${E.title}. ${E.note} Error bars are ±1σ; the gold line is the least-squares fit. Simulated data: a browser cannot replace bench work.`);
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const p = [];
  const E = M.EXPERIMENTS[P.exp];
  if (!E) return [`labe-rig: exp is one of ${Object.keys(M.EXPERIMENTS).join(', ')}`];
  if (!VIEWS.includes(P.view)) p.push(`labe-rig: view is one of ${VIEWS.join(', ')}`);
  if (P.axes !== null && !E.axes[P.axes]) p.push(`labe-rig: axes for ${P.exp} is one of ${Object.keys(E.axes).join(', ')}`);
  const fk = E.flags.map((f) => f.key);
  for (const [k, v] of Object.entries(P.flags || {})) { if (!fk.includes(k)) p.push(`labe-rig: unknown flag “${k}” for ${P.exp} (${fk.join(', ')})`); if (typeof v !== 'boolean') p.push(`labe-rig: flag ${k} is true or false`); }
  if (Array.isArray(P.toggles)) { for (const k of P.toggles) if (!fk.includes(k)) p.push(`labe-rig: unknown toggle “${k}”`); }
  else if (![true, false, null].includes(P.toggles)) p.push('labe-rig: toggles is true, false, null or a list of flag keys');
  for (const k of Object.keys(P.params || {})) if (!(k in E.defaults)) p.push(`labe-rig: unknown parameter “${k}” for ${P.exp}`);
  if (!Number.isInteger(P.seed)) p.push('labe-rig: seed is an integer');
  if (!(P.prefill === 'series' || (Number.isInteger(P.prefill) && P.prefill >= 0))) p.push('labe-rig: prefill is “series” or a whole number');
  if (P.settings !== null) {
    if (!Array.isArray(P.settings) || !P.settings.length) p.push('labe-rig: settings is a non-empty list');
    else if (E.setting.kind === 'slider') { for (const s of P.settings) if (!(s >= E.setting.min && s <= E.setting.max)) p.push(`labe-rig: setting ${s} lies outside ${E.setting.min}–${E.setting.max}`); }
    else if (E.setting.kind === 'choice') { for (const s of P.settings) if (!E.setting.choices.some((c) => c[0] === s)) p.push(`labe-rig: setting ${s} is not one of the choices`); }
  }
  for (const k of P.hide || []) if (!HIDE.includes(k)) p.push(`labe-rig: unknown hide “${k}” (${HIDE.join(', ')})`);
  if (P.at !== null && !(Number.isInteger(P.at) && P.at >= 0)) p.push('labe-rig: at is a reading index (0, 1, …)');
  for (const op of E.options || []) { const v = P.params?.[op.key]; if (v !== undefined && !op.choices.some((c) => c[0] === v)) p.push(`labe-rig: ${op.key} is one of ${op.choices.map((c) => c[0]).join(', ')}`); }
  return p;
}
