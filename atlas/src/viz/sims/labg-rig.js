// A rig for the advanced simulated experiments of the lab course (lab.E.10–
// E.17), in the same form as labe-rig (E.1–E.9): a cavity blackbody and a
// thermopile, the Zeeman effect through a Fabry–Pérot etalon, Compton
// scattering, a NaI(Tl) gamma spectrometer, pulsed NMR, the muon lifetime, the
// Hall effect and YBCO's superconducting transition. Three panels: the raw
// record (a ring profile, a spectrum, a free-induction decay, a decay-time
// histogram, voltages in time order, R(T) sweeps); the data as analysed, with
// ±1σ error bars and the fit; and the residuals. Readouts: the fit, χ²/ν, the
// physical result with its uncertainty (statistical and Type B combined) and
// its z against the accepted value (CODATA 2022, PDG, NNDC). Switches put each
// experiment's real systematic in or take it out over the same random
// scatter; a choice compares the analyses a lab would argue about. Physics,
// noise and analysis: model/labg-rig.js (tested in test/labg-rig.test.mjs).
//
//   { type: 'labg-rig', params: {
//       exp: 'blackbody',   // blackbody zeeman compton gamma nmr muon hall tc
//       seed: 1,            // the noise: a seed always gives the same run
//       flags: {},          // systematics and techniques, e.g. { drift: false } (see the model's RIGS)
//       toggles: null,      // which flags get a switch: true / false / a list of keys (default: all, unless compact)
//       analysis: null,     // which analysis (default: the experiment's first); analysisChoice: offer the others
//       at: null,           // zeeman, compton, nmr: which setting the raw panel shows (an index)
//       src: 'unknown',     // gamma: which source's spectrum the raw panel shows
//       N: null,            // muon: events recorded (1000–50000)
//       raw: true, data: true, residuals: true, fit: true,
//       results: null,      // the readout (default: on unless compact)
//       hide: [],           // readout rows shown as “?”: fit chi2 result accepted
//       controls: null,     // true / false (default: on unless compact)
//   } }

import { Plot, pow10Label } from '../plot.js';
import * as M from '../model/labg-rig.js';

export const defaults = {
  exp: 'blackbody', seed: 1, flags: {}, toggles: null, analysis: null, analysisChoice: true, at: null, src: 'unknown', N: null,
  raw: true, data: true, residuals: true, fit: true, results: null, hide: [], controls: null, alt: null,
};
const HIDE = ['fit', 'chi2', 'result', 'accepted'];
const pmT = (v, s) => { const r = M.pm(v, s); return r.s ? `${r.v} \\pm ${r.s}` : r.v; };
const num = (x, n = 3) => (Number.isFinite(x) ? String(+x.toPrecision(n)) : '—');

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const R = M.RIGS[P.exp];
  const hide = new Set(P.hide || []);
  const q = (k, v) => (hide.has(k) ? '?' : v);
  const ctl = P.controls ?? !F.compact;
  const showResults = P.results ?? !F.compact;
  let seed = P.seed;

  // ─── controls ───────────────────────────────────────────────────────────
  const offered = P.toggles === true || (P.toggles === null && ctl) ? R.flags.map((f) => f.key) : Array.isArray(P.toggles) ? P.toggles : [];
  for (const f of R.flags) if (offered.includes(f.key)) F.toggle({ key: `flag_${f.key}`, label: f.label, value: P.flags[f.key] ?? f.value, explain: `${f.explain} Switching re-runs the same data — same random scatter — so only this changes.` });
  if (ctl && P.analysisChoice && R.analyses.length > 1) F.choice({ key: 'analysis', label: 'Analysis', options: R.analyses, value: P.analysis || R.analyses[0][0], explain: 'The same data, analysed the ways a lab would argue about.' });
  if (ctl && R.at) {
    const vals = R.at.values;
    F.slider({ key: 'at', label: R.at.label, min: 0, max: vals.length - 1, step: 1, value: P.at ?? R.at.value ?? 0, unit: R.at.unit, fmt: (i) => String(vals[Math.round(i)]), explain: R.at.explain });
  }
  if (ctl && R.src) F.choice({ key: 'src', label: R.src.label, options: R.src.options, value: P.src, explain: R.src.explain });
  if (ctl && R.N) F.slider({ key: 'N', label: R.N.label, min: R.N.min, max: R.N.max, value: P.N ?? R.N.value, logScale: true, fmt: (v) => String(Math.round(v)), explain: R.N.explain });
  if (ctl) F.button({ label: 'New run', primary: true, onClick: () => { seed += 1; draw(); } });

  const flagsNow = () => { const o = {}; for (const f of R.flags) o[f.key] = F.params[`flag_${f.key}`] ?? P.flags[f.key] ?? f.value; return o; };
  const runNow = () => M.run(P.exp, {
    seed, flags: flagsNow(), analysis: F.params.analysis || P.analysis,
    at: F.params.at !== undefined ? Math.round(F.params.at) : P.at ?? undefined,
    src: F.params.src || P.src, N: F.params.N || P.N || undefined,
  });

  // ─── layout ─────────────────────────────────────────────────────────────
  const rawC = P.raw ? F.canvas({ aspect: 'wide', label: P.alt || `The raw record: ${R.title}` }) : null;
  const dataC = P.data ? F.canvas({ aspect: F.compact ? 'wide' : '', label: 'The data as analysed, with error bars and the fit' }) : null;
  const resC = P.data && P.residuals && !R.noRes ? F.canvas({ height: F.compact ? '92px' : '116px', label: 'Residuals: each point minus the fit' }) : null;
  const narrow = (c) => (c.clientWidth || 600) < 520;

  function paintRaw(spec) {
    const pl = new Plot(rawC.canvas, { x: spec.x, y: spec.y, xlabel: spec.xlabel, ylabel: spec.ylabel, axesAt: 'edge', pad: { l: 52, r: 12, t: 10, b: 34 }, ...(spec.ylog ? { yfmt: pow10Label } : {}) });
    pl.clear();
    const small = narrow(rawC.canvas) ? 0.88 : 1;
    if (spec.bars) {
      const { edges, counts, color } = spec.bars;
      counts.forEach((c, i) => { if (c > 0) pl.rect(edges[i], 0, edges[i + 1] - edges[i], c, { color: color || 'accent', alpha: 0.35, width: 0.6 }); });
    }
    for (const l of spec.hlines || []) pl.line(pl.vx0, l.y, pl.vx1, l.y, { color: l.color || 'ink3', width: 1.2, dash: l.dash });
    for (const l of spec.vlines || []) pl.line(l.x, pl.vy0, l.x, pl.vy1, { color: l.color || 'ink3', width: 1.4, dash: l.dash });
    for (const p of spec.paths || []) pl.path(p.pts, { color: p.color, width: p.width, dash: p.dash, alpha: p.alpha });
    if (spec.curve && P.fit !== false) pl.fn(spec.curve, { color: 'gold', width: 2 });
    for (const p of spec.points || []) {
      if (p.sy) pl.line(p.x, p.y - p.sy, p.x, p.y + p.sy, { color: p.color || 'accent', width: 1.3 });
      pl.point(p.x, p.y, { color: p.color || 'accent', r: 3.4 });
    }
    for (const t of spec.texts || []) pl.text(t.s, t.x, t.y, { color: t.color, size: (t.size || 11.5) * small, align: t.align, dx: t.dx, dy: t.dy ?? 8 });
  }

  function draw() {
    const out = runNow();
    if (rawC) paintRaw(out.raw);
    const d = out.data, fit = out.fit;
    const lg = !!d.ylog;
    const ok = d.y.map((v) => !lg || v > 0);
    const xs = d.x.filter((_, i) => ok[i]);
    const ys = d.y.filter((_, i) => ok[i]).map((v) => (lg ? Math.log10(v) : v));
    const sy = d.sy.filter((_, i) => ok[i]).map((s, i) => (lg ? s / (d.y.filter((_, j) => ok[j])[i] * Math.LN10) : s));
    const curve = d.curve || (d.model ? d.model : fit && fit.f && out.line ? fit.f : null);
    const cf = curve ? (lg ? (t) => Math.log10(curve(t)) : curve) : null;
    let x0 = d.x0 ?? Math.min(...xs), x1 = d.x1 ?? Math.max(...xs);
    if (d.x0 === undefined) { const dx = x1 - x0 || 1; if (d.zeroX && x0 > 0 && x0 < 0.6 * x1) x0 = 0; x0 -= 0.05 * dx; x1 += 0.05 * dx; }
    let y0 = d.y0 ?? Math.min(...ys.map((v, i) => v - sy[i])), y1 = d.y1 ?? Math.max(...ys.map((v, i) => v + sy[i]));
    if (d.y0 === undefined) {
      if (cf && out.line && P.fit !== false) for (const xx of [x0, x1]) { const v = cf(xx); if (Number.isFinite(v)) { y0 = Math.min(y0, v); y1 = Math.max(y1, v); } }
      if (d.zeroY) { y0 = Math.min(y0, 0); y1 = Math.max(y1, 0); }
      const dy = y1 - y0 || 1; y0 -= 0.1 * dy; y1 += 0.12 * dy;
    }
    if (dataC) {
      const pl = new Plot(dataC.canvas, { x: [x0, x1], y: [y0, y1], xlabel: d.xlabel, ylabel: d.ylabel, axesAt: 'edge', pad: { l: 56, r: 14, t: 12, b: 36 }, ...(lg ? { yfmt: pow10Label } : {}) });
      pl.clear();
      if (d.hline !== undefined) pl.line(x0, d.hline, x1, d.hline, { color: 'ink3', width: 1.2, dash: [5, 4] });
      for (const p of d.paths || []) pl.path(p.pts, { color: p.color, width: p.width });
      for (const m of d.marks || []) { pl.line(m.x, y0, m.x, m.y, { color: m.color, width: 1.2, dash: [3, 3] }); pl.point(m.x, m.y, { color: m.color, r: 5 }); }
      if (cf && P.fit !== false) pl.fn(cf, { color: 'gold', width: 2.2, samples: 600 });
      const many = xs.length > 40, cap = 0.008 * (x1 - x0);
      xs.forEach((x, i) => {
        if (!many) { pl.line(x, ys[i] - sy[i], x, ys[i] + sy[i], { color: 'accent', width: 1.4 }); pl.line(x - cap, ys[i] + sy[i], x + cap, ys[i] + sy[i], { color: 'accent', width: 1.4 }); pl.line(x - cap, ys[i] - sy[i], x + cap, ys[i] - sy[i], { color: 'accent', width: 1.4 }); }
        else pl.line(x, ys[i] - sy[i], x, ys[i] + sy[i], { color: 'accent', width: 1, alpha: 0.6 });
        pl.point(x, ys[i], { color: 'accent', r: many ? 2.4 : 3.6 });
      });
      if (d.mark && P.fit !== false) pl.point(d.mark.x, d.mark.y, { color: 'gold', r: 6 });
      if (resC) {
        const norm = !!d.normRes;
        const res = curve ? d.x.map((x, i) => (norm ? (d.y[i] - curve(x)) / d.sy[i] : d.y[i] - curve(x))) : [];
        const rs = norm ? d.x.map(() => 1) : d.sy;
        const m = Math.max(1e-12, ...res.map((r, i) => Math.abs(r) + (norm ? 0 : rs[i]))) * 1.25;
        const pr = new Plot(resC.canvas, { x: [x0, x1], y: [-m, m], ylabel: norm ? 'residual / σ' : 'residual', axesAt: 'edge', yticks: 3, pad: { l: 56, r: 14, t: 8, b: 22 } });
        pr.clear();
        pr.line(x0, 0, x1, 0, { color: 'gold', width: 1.4 });
        res.forEach((r, i) => { if (!norm && !many) pr.line(d.x[i], r - rs[i], d.x[i], r + rs[i], { color: 'accent', width: 1.2 }); pr.point(d.x[i], r, { color: 'accent', r: many ? 2.2 : 3.2 }); });
      }
    }
    if (!showResults) { F.readout([]); return; }
    const rows = [];
    if (fit && out.line) rows.push(['slope', q('fit', pmT(fit.b, fit.sb))], ['intercept', q('fit', pmT(fit.a, fit.sa))]);
    if (fit && Number.isFinite(fit.chi2) && fit.dof > 0) rows.push([P.exp === 'muon' ? 'Poisson $\\chi^2/\\nu$' : '$\\chi^2/\\nu$', q('chi2', `${num(fit.chi2 / fit.dof, 3)}\\ (\\nu = ${fit.dof})`)]);
    for (const r of out.results) {
      rows.push([r.label, q('result', `${pmT(r.value / r.scale, r.sigma / r.scale)}${r.unit ? `\\ ${r.unit}` : ''}`)]);
      if (r.accepted !== null) rows.push([r.note ? 'true value (simulated)' : 'accepted', q('accepted', `${num(r.accepted / r.scale, 6)}${r.unit ? `\\ ${r.unit}` : ''}${r.z !== null && !hide.has('result') ? `\\ \\ (z = ${Math.abs(r.z) < 0.05 ? '0.0' : r.z.toFixed(1)})` : ''}`)]);
    }
    if (P.exp === 'muon') rows.push(['expected for the $\\mu^+/\\mu^-$ mix', q('accepted', `${num(out.mixTau, 4)}\\ \\mu\\mathrm{s}`)]);
    if (P.exp === 'tc') rows.push(['typical for YBa₂Cu₃O₇', '\\approx 92\\ \\mathrm{K}']);
    F.readout(rows);
  }
  F.onChange(draw);
  F.draw(draw);
  F.caption(`${R.title}. ${R.note} Error bars are ±1σ; the gold line is the fit. Simulated data: a browser cannot replace bench work.`);
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const p = [];
  const R = M.RIGS[P.exp];
  if (!R) return [`labg-rig: exp is one of ${Object.keys(M.RIGS).join(', ')}`];
  const fk = R.flags.map((f) => f.key);
  for (const [k, v] of Object.entries(P.flags || {})) { if (!fk.includes(k)) p.push(`labg-rig: unknown flag “${k}” for ${P.exp} (${fk.join(', ')})`); if (typeof v !== 'boolean') p.push(`labg-rig: flag ${k} is true or false`); }
  if (Array.isArray(P.toggles)) { for (const k of P.toggles) if (!fk.includes(k)) p.push(`labg-rig: unknown toggle “${k}”`); }
  else if (![true, false, null].includes(P.toggles)) p.push('labg-rig: toggles is true, false, null or a list of flag keys');
  if (P.analysis !== null && !R.analyses.some((a) => a[0] === P.analysis)) p.push(`labg-rig: analysis for ${P.exp} is one of ${R.analyses.map((a) => a[0]).join(', ')}`);
  if (!Number.isInteger(P.seed)) p.push('labg-rig: seed is an integer');
  if (P.at !== null && !(R.at && Number.isInteger(P.at) && P.at >= 0 && P.at < R.at.values.length)) p.push(`labg-rig: at is an index into ${P.exp}’s settings`);
  if (P.exp === 'gamma' && !M.GS.sources[P.src]) p.push(`labg-rig: src is one of ${Object.keys(M.GS.sources).join(', ')}`);
  if (P.N !== null && !(R.N && P.N >= R.N.min && P.N <= R.N.max)) p.push('labg-rig: N (muon only) lies in 1000–50000');
  for (const k of P.hide || []) if (!HIDE.includes(k)) p.push(`labg-rig: unknown hide “${k}” (${HIDE.join(', ')})`);
  for (const k of ['raw', 'data', 'residuals', 'fit']) if (typeof P[k] !== 'boolean') p.push(`labg-rig: ${k} is true or false`);
  if (!P.raw && !P.data) p.push('labg-rig: show at least one panel');
  return p;
}
