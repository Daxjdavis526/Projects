// Poles of a transfer function and the responses they make. A linear system
// with H(s) = K/((s − p₁)⋯(s − pₙ)) — K chosen so that H(0) = 1 — drawn
// three ways, one panel each:
//   s   the complex s-plane: every pole a cross, draggable; the right half-
//       plane, where modes grow, shaded; with the frequency panel, the probe
//       point iω on the imaginary axis joined to each pole — |H(iω)| is |K|
//       divided by the product of those distances, so a pole close to the
//       axis makes a tall, narrow resonance peak;
//   t   the impulse response h(t) = L⁻¹{H} or the unit-step response
//       L⁻¹{H/s}, computed exactly from the partial-fraction expansion, and,
//       if asked, each pole's own term dashed in that pole's colour (the
//       terms add up to the curve);
//   f   the gain |H(iω)| against ω — the frequency response — with the
//       probe marked and the half-power level |H(0)|/√2 dashed.
// Numerics in model/de-poles.js (test/de-poles.test.mjs).
//
//   { type: 'de-poles', params: {
//       poles: [{ re: -0.5, im: 2 }],    // { re }: a real pole; { re, im } with im ≥ 0: the pair re ± i·im (im = 0: a double pole); order ≤ 4
//       presets: null,                   // [{ label, poles }]: a choice between systems (labels are markup)
//       drag: true,                      // drag the poles (a pair by its upper pole; real poles slide along the axis)
//       snap: 0.05,                      // dragged poles snap to this grid (1/s)
//       response: 'impulse',             // 'impulse' or 'step'
//       responses: null,                 // ['impulse', 'step']: offer both as a choice
//       terms: false,                    // each pole group's term of the response, dashed (true, or 'toggle' for a switch)
//       panels: ['s', 't', 'f'],         // which panels, top to bottom (a compact picture drops 'f' unless panels is given)
//       w: 1, wmax: 5,                   // the probe frequency ω (a slider from 0 to wmax, rad/s) and the f panel's range
//       probe: true,                     // the probe on the s-plane and its distance lines (needs the f panel)
//       T: 10,                           // the time window, s
//       window: { re: [-4, 1], im: [-3, 3] },   // the s-plane's view (equal scales: the shorter range is widened); poles must lie inside
//       labels: true,                    // 'grows' and 'decays' on the half-planes
//       readout: true,                   // false hides the numbers (a question's picture)
//       tname: null,                     // the response's name on its axis (default h for an impulse, y for a step)
//   } }
//
// A problem's picture must not show its answer: hide the readout, and the
// panel the question asks about. A point item reads the first pole in the
// list as { x: Re p, y: Im p }.

import { Plot } from '../plot.js';
import * as M from '../model/de-poles.js';

export const defaults = {
  poles: [{ re: -0.5, im: 2 }], presets: null, drag: true, snap: 0.05, response: 'impulse', responses: null, terms: false,
  panels: ['s', 't', 'f'], w: 1, wmax: 5, probe: true, T: 10, window: { re: [-4, 1], im: [-3, 3] }, labels: true, readout: true, tname: null,
};

const PANELS = ['s', 't', 'f'];
const TERM_COLORS = ['violet', 'teal', 'good', 'warn', 'gold'];
const isReal = (q) => q.im === undefined || q.im === null;
const copy = (list) => list.map((q) => (isReal(q) ? { re: +q.re } : { re: +q.re, im: +q.im }));
const fmt = (v, d = 3) => (Number.isFinite(v) ? String(+(+v).toPrecision(d)) : '\\infty');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// a pole: a cross, drawn in screen pixels so it keeps its size
function cross(plot, x, y, color, size = 6.5) {
  const g = plot.ctx, X = plot.X(x), Y = plot.Y(y);
  g.save();
  g.strokeStyle = plot.color(color); g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(X - size, Y - size); g.lineTo(X + size, Y + size); g.moveTo(X - size, Y + size); g.lineTo(X + size, Y - size); g.stroke();
  g.restore();
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0, window: { ...defaults.window, ...(P0.window || {}) } };
  let spec = copy(P.presets ? P.presets[0].poles : P.poles);
  let panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  if (F.compact && !P0.panels) panels = panels.filter((p) => p !== 'f');
  const hasF = panels.includes('f'), probe = hasF && P.probe !== false;
  const canvases = {};
  for (const p of panels) {
    canvases[p] = F.canvas({
      aspect: p === 's' ? '' : 'wide',
      label: p === 's' ? 'The complex s-plane with the poles of the transfer function' : p === 't' ? 'The system’s response against time' : 'The gain against the input frequency',
    });
  }
  if (P.presets) F.choice({ key: 'preset', label: P.presetLabel || 'System', options: P.presets.map((q, i) => [i, q.label]), value: 0, explain: P.presetExplain || '' });
  if (P.responses?.length > 1) F.choice({ key: 'resp', label: 'Response', options: P.responses.map((r) => [r, r === 'step' ? 'Unit step $u(t)$' : 'Impulse $\\delta(t)$']), value: P.response, explain: 'The input: a unit impulse at $t = 0$ (output $h(t)$), or a unit step switched on at $t = 0$.' });
  else F.params.resp = P.response;
  if (P.terms === 'toggle') F.toggle({ key: 'terms', label: 'Show each pole’s term', value: false, explain: 'One dashed curve per real pole or conjugate pair, in its colour: the partial fractions, transformed back. They add up to the solid curve.' });
  if (probe) F.slider({ key: 'w', label: 'Input frequency $\\omega$', min: 0, max: P.wmax, step: P.wmax / 200, value: P.w, unit: '\\text{rad/s}', explain: 'A steady input $\\sin\\omega t$ comes out as $|H(i\\omega)|\\sin(\\omega t + \\varphi)$: the gold point $i\\omega$ slides up the imaginary axis.' });
  else F.params.w = P.w;

  const sp = canvases.s && new Plot(canvases.s.canvas, { x: P.window.re, y: P.window.im, equal: true, xlabel: 'Re s (1/s)', ylabel: 'Im s (rad/s)' });
  const tp = canvases.t && new Plot(canvases.t.canvas, { x: [0, P.T], y: [-1, 1], xlabel: 't (s)', ylabel: '' });
  const fp = canvases.f && new Plot(canvases.f.canvas, { x: [0, P.wmax], y: [0, 1.2], xlabel: 'ω (rad/s)', ylabel: '|H(iω)|' });

  // dragging: each entry by one handle (a pair by its upper pole)
  function wireHandles() {
    if (!sp || P.drag === false) return;
    sp.handles.length = 0;
    spec.forEach((q, i) => {
      sp.handle(() => [spec[i].re, isReal(spec[i]) ? 0 : spec[i].im], (x, y) => {
        const g = P.snap || 0.05;
        const re = clamp(Math.round(x / g) * g, sp.vx0, sp.vx1);
        if (isReal(spec[i])) spec[i] = { re: +re.toFixed(10) };
        else spec[i] = { re: +re.toFixed(10), im: +clamp(Math.round(y / g) * g, 0, sp.vy1).toFixed(10) };
      }, { hollow: true });
    });
    sp.onDrag = () => { draw(); F.notify('point'); };
  }
  wireHandles();
  F.onChange((key) => {
    if (key === 'preset') { spec = copy(P.presets[F.params.preset].poles); wireHandles(); }
    draw();
  });

  function draw() {
    const poles = M.polesOf(spec), K = M.gain(poles);
    const step = F.params.resp === 'step';
    const showTerms = P.terms === true || (P.terms === 'toggle' && F.params.terms);
    const w = +F.params.w;
    // one colour per pole group, shared by its cross and its term
    const groups = M.modeTerms(poles, K, { step });
    const colorOf = (q) => {
      const i = groups.findIndex((g) => Math.abs(g.q.re - q.re) < 1e-9 && Math.abs(g.q.im - Math.abs(q.im)) < 1e-9);
      return showTerms && i >= 0 ? TERM_COLORS[i % TERM_COLORS.length] : 'accent';
    };

    if (sp) {
      sp.clear();
      if (sp.vx1 > 0) sp.rect(0, sp.vy0, sp.vx1, sp.vy1 - sp.vy0, { fill: 'bad', alpha: 0.07, stroke: false });
      if (P.labels !== false) {
        if (sp.vx1 > 0) sp.text('grows', sp.vx1, sp.vy1, { dx: -6, dy: 12, align: 'right', color: 'bad', size: 11.5 });
        sp.text('decays', sp.vx0, sp.vy1, { dx: 6, dy: 12, color: 'good', size: 11.5 });
      }
      if (probe) {
        for (const p of poles) sp.line(0, w, p.re, p.im, { color: 'gold', width: 1.2, dash: [4, 4] });
        sp.point(0, w, { color: 'gold', r: 5, label: 'iω', ldx: 9, ldy: -9 });
      }
      for (const c of M.clusters(poles)) {
        cross(sp, c.q.re, c.q.im, colorOf(c.q));
        if (c.m > 1) sp.text(c.m === 2 ? 'double' : c.m === 3 ? 'triple' : `×${c.m}`, c.q.re, c.q.im, { dx: 0, dy: 17, align: 'center', color: 'ink2', size: 11 });
      }
      sp.drawHandles();
    }

    if (tp) {
      const f = step ? M.stepResponse(poles, K) : M.impulse(poles, K);
      const grow = M.slowest(poles).re > 1e-9;
      let lo = 0, hi = step ? 1 : 0;
      const T = P.T, span = grow ? 0.6 * T : T;
      for (let k = 0; k <= 400; k++) { const v = f((span * k) / 400); if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
      if (hi - lo < 1e-9) hi = lo + 1;
      const pad = 0.12 * (hi - lo);
      tp.o.ylabel = P.tname || (step ? 'y' : 'h');
      tp.setView([0, T], [lo - (lo < 0 ? pad : 0.04 * (hi - lo)), hi + pad]);
      tp.clear();
      if (step && !grow) tp.line(0, 1, T, 1, { color: 'ink3', width: 1.2, dash: [5, 5] });
      if (showTerms) groups.forEach((g, i) => tp.fn(g.f, { color: TERM_COLORS[i % TERM_COLORS.length], width: 1.6, dash: [6, 5] }));
      tp.fn(f, { color: 'accent', width: 2.6 });
      if (step && !grow) tp.text('H(0) = 1', T, 1, { dx: -6, dy: -10, align: 'right', color: 'ink3', size: 11.5 });
    }

    let pk = null;
    if (fp) {
      pk = M.peak(poles, K, P.wmax);
      const ymax = Math.min(12, Math.max(1.2, 1.15 * pk.mag));
      fp.setView([0, P.wmax], [0, ymax]);
      fp.clear();
      const half = Math.abs(K) > 0 ? M.freq(poles, K, 0).mag / Math.SQRT2 : NaN;
      if (Number.isFinite(half) && half < ymax) {
        fp.line(0, half, P.wmax, half, { color: 'ink3', width: 1.2, dash: [5, 5] });
        fp.text('half power', P.wmax, half, { dx: -6, dy: -10, align: 'right', color: 'ink3', size: 11.5 });
      }
      fp.fn((x) => M.freq(poles, K, x).mag, { color: 'accent', width: 2.6 });
      if (probe) fp.point(w, Math.min(M.freq(poles, K, w).mag, ymax), { color: 'gold', r: 5 });
    }

    if (P.readout === false) return;
    const list = spec.map((q) => (isReal(q) ? fmt(q.re) : q.im === 0 ? `${fmt(q.re)}\\ (\\text{double})` : `${fmt(q.re)} \\pm ${fmt(q.im)}\\,i`)).join(',\\ ');
    const sl = M.slowest(poles);
    const rows = [['poles', list]];
    if (Math.abs(sl.re) > 1e-9) rows.push([sl.re < 0 ? 'slowest decay time $1/|\\mathrm{Re}\\,p|$' : 'growth time $1/\\mathrm{Re}\\,p$', `${fmt(1 / Math.abs(sl.re))}\\,\\mathrm{s}`]);
    else rows.push(['slowest mode', '\\text{never decays}']);
    if (sl.im > 1e-9) rows.push(['its ringing period $2\\pi/\\omega_d$', `${fmt((2 * Math.PI) / sl.im)}\\,\\mathrm{s}`]);
    if (probe) {
      const H = M.freq(poles, K, w);
      rows.push(['gain $|H(i\\omega)|$', fmt(H.mag)]);
      rows.push(['phase $\\varphi$', `${fmt((M.phaseUnwrapped(poles, K, w) * 180) / Math.PI)}^\\circ`]);
    }
    if (pk && pk.w > 1e-6 && pk.mag > 1.001 * M.freq(poles, K, 0).mag) rows.push(['resonance peak', `${fmt(pk.mag)}\\ \\text{at}\\ \\omega = ${fmt(pk.w)}\\,\\text{rad/s}`]);
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(`Crosses: the poles of $H(s) = K/\\big((s - p_1)\\cdots(s - p_n)\\big)$, with $K$ set so that $H(0) = 1$; in the shaded right half-plane a pole's term grows. ${panels.includes('t') ? 'The response is computed exactly from the partial fractions. ' : ''}${hasF ? 'The gain $|H(i\\omega)|$ is the steady amplitude for a unit sine input. ' : ''}An ideal linear, time-invariant system.`);
  return { get: (k) => (k === 'point' ? { x: spec[0].re, y: isReal(spec[0]) ? 0 : spec[0].im } : F.params[k]) };
}

function poleProblems(list, where, win) {
  const out = [];
  if (!Array.isArray(list) || !list.length) return [`de-poles: ${where} must be a non-empty list of poles`];
  for (const q of list) {
    if (!Number.isFinite(+q.re)) out.push(`de-poles: ${where}: every pole needs a numeric re`);
    if (!isReal(q) && !(Number.isFinite(+q.im) && q.im >= 0)) out.push(`de-poles: ${where}: a pair's im must be a number ≥ 0 (its conjugate is added)`);
    if (win && Number.isFinite(+q.re) && (q.re < win.re[0] || q.re > win.re[1] || (!isReal(q) && q.im > win.im[1]))) out.push(`de-poles: ${where}: the pole ${q.re}${isReal(q) ? '' : ` ± ${q.im}i`} lies outside the window`);
  }
  const n = M.orderOf(list);
  if (n > M.MAX_ORDER) out.push(`de-poles: ${where}: order ${n} is above ${M.MAX_ORDER}`);
  return out;
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  const win = { ...defaults.window, ...(P.window || {}) };
  if (!(Array.isArray(win.re) && win.re[0] < win.re[1] && Array.isArray(win.im) && win.im[0] < win.im[1])) out.push('de-poles: window needs re: [lo, hi] and im: [lo, hi]');
  if (P.presets) {
    if (!Array.isArray(P.presets) || !P.presets.length) out.push('de-poles: presets must be a list of { label, poles }');
    else for (const q of P.presets) { if (typeof q.label !== 'string') out.push('de-poles: every preset needs a label'); out.push(...poleProblems(q.poles, `preset ${q.label}`, win)); }
  } else out.push(...poleProblems(P.poles, 'poles', win));
  if (!['impulse', 'step'].includes(P.response)) out.push("de-poles: response must be 'impulse' or 'step'");
  if (P.responses && !(Array.isArray(P.responses) && P.responses.every((r) => ['impulse', 'step'].includes(r)))) out.push("de-poles: responses must list 'impulse' and/or 'step'");
  if (!(Array.isArray(P.panels) && P.panels.length && P.panels.every((p) => PANELS.includes(p)))) out.push("de-poles: panels must be a non-empty list of 's', 't', 'f'");
  if (![true, false, 'toggle'].includes(P.terms)) out.push("de-poles: terms must be true, false or 'toggle'");
  if (!(P.T > 0)) out.push('de-poles: T must be positive');
  if (!(P.wmax > 0)) out.push('de-poles: wmax must be positive');
  if (!(P.w >= 0 && P.w <= P.wmax)) out.push('de-poles: w must lie in [0, wmax]');
  if (!(P.snap > 0)) out.push('de-poles: snap must be positive');
  return out;
}
