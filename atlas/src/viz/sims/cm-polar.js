// Plane-polar kinematics lens. A particle moves with r(t) and θ(t) (written
// as expressions of t and of slider keys); the picture shows its path on a
// polar grid, the rotating unit vectors r̂ and θ̂ riding on it, its velocity,
// and its acceleration split into the four polar terms
//
//   a = (r̈ − rθ̇²) r̂ + (rθ̈ + 2ṙθ̇) θ̂
//
// drawn head to tail from the particle (radial terms, then transverse ones),
// so you can watch them add up to the true acceleration. A bar panel below
// gives the four terms and the two components. Play moves the particle; a
// time slider sets the moment. The kinematics is model/cm-polar.js (tested
// in test/cm-polar.test.mjs).
//
//   { type: 'cm-polar', params: {
//       r: '1 + 0.4*t', theta: '0.8*t',     // r(t) in m and θ(t) in rad: expressions of t and the slider keys
//       T: [0, 6],                          // the time span (s)
//       at: 2,                              // the starting moment (s)
//       presets: [{ label, r, theta, T, at, x, y }],   // a choice between motions (labels are markup)
//       sliders: [],                        // extra parameters the expressions may use (as in graph; keys t and theta are reserved)
//       show: ['path', 'basis', 'v', 'a', 'terms'],    // any of path basis v a terms rvec
//       bars: true,                         // the bar panel of the four terms below the picture
//       values: true,                       // numbers on the bars (false: a question's picture)
//       scale: { v: 0.5, a: 0.25, basis: 0.6 },        // drawn length of v and a per unit (m per m/s, m per m/s²), and of r̂, θ̂ (m)
//       x, y,                               // the window (m; default fitted to the path)
//       fixed: false,                       // a still picture at `at`: no time slider, no Play
//       readouts: ['t', 'r', 'rd', 'thd', 'ar', 'at'],  // any of t r rd rdd th thd thdd vr vt speed ar at a; [] for none
//       labels: true,                       // names on the arrows
//   } }
//
// A picture must not show its answer: when a question asks for a term, leave
// it out of `show`, set values: false and readouts: [].

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/cm-polar.js';

export const defaults = {
  r: '1 + 0.4*t', theta: '0.8*t', T: [0, 6], at: 2, presets: null, sliders: [],
  show: ['path', 'basis', 'v', 'a', 'terms'], bars: true, values: true, scale: null,
  x: null, y: null, fixed: false, readouts: ['t', 'r', 'rd', 'thd', 'ar', 'at'], labels: true,
};
const SHOW = ['path', 'basis', 'v', 'a', 'terms', 'rvec'];
const READ = { t: ['$t$', 's'], r: ['$r$', 'm'], rd: ['$\\dot r$', 'm/s'], rdd: ['$\\ddot r$', 'm/s^2'], th: ['$\\theta$', 'rad'], thd: ['$\\dot\\theta$', 'rad/s'], thdd: ['$\\ddot\\theta$', 'rad/s^2'], vr: ['$v_r$', 'm/s'], vt: ['$v_\\theta$', 'm/s'], speed: ['$|\\vec v|$', 'm/s'], ar: ['$a_r$', 'm/s^2'], at: ['$a_\\theta$', 'm/s^2'], a: ['$|\\vec a|$', 'm/s^2'] };
const TERMS = [['rdd', 'r̈', 'accent', 'r'], ['cent', '−rθ̇²', 'bad', 'r'], ['tang', 'rθ̈', 'teal', 't'], ['cor', '2ṙθ̇', 'gold', 't']];
// numbers: 3 significant figures, as TeX (×10ⁿ outside 10⁻³ … 10⁵) or as plain canvas text
const trim = (x, n = 3) => {
  const v = +(+x).toPrecision(n), a = Math.abs(v);
  if (a < 1e-12) return '0';
  if (a >= 1e5 || a < 1e-3) { const [m, e] = v.toExponential(n - 1).split('e'); return `${m}\\times10^{${+e}}`; }
  return String(v);
};
const plain = (x, n = 3) => { const v = +(+x).toPrecision(n); return Math.abs(v) < 1e-12 ? '0' : String(v).replace('-', '−'); };
// central differences leave round-off of order 10⁻⁸ of the largest term: call anything that small zero
function clean(k) {
  const big = Math.max(1e-12, ...Object.values(k.terms).map(Math.abs));
  const z = (v) => (Math.abs(v) < 1e-6 * big ? 0 : v);
  for (const key of Object.keys(k.terms)) k.terms[key] = z(k.terms[key]);
  k.ar = z(k.ar); k.at = z(k.at); k.rdd = z(k.rdd); k.thdd = z(k.thdd);
  return k;
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const presets = P.presets?.length ? P.presets : null;
  const { canvas, box } = F.canvas({ aspect: '', label: P.alt || 'A particle moving in the plane, with its polar unit vectors, velocity and acceleration' });
  const bars = P.bars ? F.canvas({ aspect: 'wide', label: 'The four terms of the polar acceleration, as bars' }) : null;
  if (bars) bars.box.style.aspectRatio = '3 / 1';
  const keys = (P.sliders || []).map((s) => s.key);
  if (presets) F.choice({ key: 'preset', label: 'Motion', options: presets.map((q, i) => [i, q.label]), value: 0, explain: presets[0].explain || 'Each motion is a different r(t) and θ(t).' });
  for (const s of P.sliders || []) F.slider(s);
  const cfg = () => ({ ...P, ...(presets ? presets[F.params.preset ?? 0] : {}) });
  let C = cfg();
  if (!P.fixed) F.slider({ key: 't', label: 'Time $t$', min: C.T[0], max: C.T[1], step: (C.T[1] - C.T[0]) / 400, value: C.at ?? C.T[0], unit: '\\mathrm{s}', explain: 'The moment shown. Play runs it forward.' });
  else F.params.t = C.at ?? C.T[0];
  const S = { running: false };
  let play = null;
  const anim = !P.fixed ? F.animate((dt) => {
    if (!S.running) return;
    let t = F.params.t + dt * (C.T[1] - C.T[0]) / 8;
    if (t >= C.T[1]) { t = C.T[1]; S.running = false; play.textContent = 'Replay'; }
    F.set('t', t);
  }, { force: true }) : null;
  if (!P.fixed) play = F.button({ label: 'Play', primary: true, onClick: () => {
    if (S.running) { S.running = false; play.textContent = 'Play'; return; }
    if (F.params.t >= C.T[1] - 1e-9) F.set('t', C.T[0]);
    S.running = true; play.textContent = 'Pause'; anim.start();
  } });
  F.onChange((key) => {
    if (key === 'preset') { C = cfg(); S.running = false; if (play) play.textContent = 'Play'; F.set('t', Math.min(C.T[1], Math.max(C.T[0], C.at ?? C.T[0]))); return; }
    draw();
  });

  const plot = new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: true, grid: false, xlabel: 'x (m)', ylabel: 'y (m)' });
  const bplot = bars && new Plot(bars.canvas, { x: [0, 1], y: [0, 1], grid: false, axes: false, pad: { l: 8, r: 8, t: 8, b: 8 } });

  function draw() {
    const vars = ['t', ...keys];
    const env = {}; for (const k of keys) env[k] = F.params[k];
    const rf = fn(C.r, vars), thf = fn(C.theta, vars);
    const R = (t) => rf({ ...env, t }), TH = (t) => thf({ ...env, t });
    const t = +F.params.t;
    const k = clean(M.kin(R, TH, t, Math.max(1e-4, (C.T[1] - C.T[0]) * 2e-4)));
    const pts = M.path(R, TH, C.T[0], C.T[1]);
    const win = C.x && C.y ? { x: C.x, y: C.y } : M.fit([...pts, [0, 0]], 0.28);
    plot.setView(win.x, win.y);
    plot.clear();
    const show = new Set(C.show);
    const span = Math.max(win.x[1] - win.x[0], win.y[1] - win.y[0]);
    const sc = { v: 0.5, a: 0.25, basis: span * 0.14, ...(C.scale || {}) };
    // the polar grid: rings and spokes about the origin
    {
      plot.ctx.save(); plot._clip();
      const rmax = Math.hypot(Math.max(Math.abs(plot.vx0), Math.abs(plot.vx1)), Math.max(Math.abs(plot.vy0), Math.abs(plot.vy1)));
      const step = Plot.ticks(0, rmax, 5)[1] || rmax / 4;
      for (let rr = step; rr <= rmax; rr += step) plot.circle(0, 0, rr, { color: 'ink4', width: 1, alpha: 0.35 });
      for (let a = 0; a < 360; a += 30) { const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180); plot.line(0, 0, rmax * c, rmax * s, { color: 'ink4', width: 1, alpha: 0.25 }); }
      plot.ctx.restore();
    }
    plot.point(0, 0, { color: 'ink2', r: 3.5, label: C.labels !== false ? 'O' : '', ldx: -14, ldy: 10, lcolor: 'ink3' });
    if (show.has('path')) {
      plot.ctx.save(); plot._clip();          // a fixed window may cut the path: keep it inside the frame
      plot.path(pts, { color: 'ink3', width: 1.4, dash: [4, 4] });
      const done = pts.filter((_, i) => C.T[0] + ((C.T[1] - C.T[0]) * i) / (pts.length - 1) <= t);
      if (done.length > 1) plot.path(done, { color: 'teal', width: 2.2 });
      plot.ctx.restore();
    }
    const [px, py] = k.xy;
    const L = C.labels !== false;
    if (show.has('rvec')) {
      plot.arrow(0, 0, px, py, { color: 'ink2', width: 1.6 });
      if (L) { const n = Math.hypot(px, py) || 1; mark(plot, 'r', px / 2, py / 2, { color: 'ink2', dx: (-py / n) * 12, dy: (-px / n) * 12, align: 'center' }); }
    }
    if (show.has('basis')) {
      const b = sc.basis;
      tipArrow(px, py, b * k.er[0], b * k.er[1], 'accent2', 'r\u0302', { width: 2.2, head: 8 });
      tipArrow(px, py, b * k.et[0], b * k.et[1], 'violet', 'θ\u0302', { width: 2.2, head: 8 });
    }
    if (show.has('terms')) {
      // head to tail: r̈ r̂, then −rθ̇² r̂, then rθ̈ θ̂, then 2ṙθ̇ θ̂
      let x = px, y = py;
      for (const [key, name, color, dir] of TERMS) {
        const u = dir === 'r' ? k.er : k.et, m = k.terms[key] * sc.a;
        if (Math.abs(m) * 1 < span * 0.004) continue;
        plot.arrow(x, y, x + m * u[0], y + m * u[1], { color, width: 2, head: 7, dash: [5, 3] });
        if (L) { const n = Math.hypot(u[0], u[1]); mark(plot, name, x + (m * u[0]) / 2, y + (m * u[1]) / 2, { color, dx: (-u[1] / n) * 14 * Math.sign(m || 1), dy: (-u[0] / n) * 14 * Math.sign(m || 1), align: 'center', size: 12 }); }
        x += m * u[0]; y += m * u[1];
      }
    }
    if (show.has('a')) tipArrow(px, py, sc.a * k.a[0], sc.a * k.a[1], 'warn', 'a', { width: 2.8, head: 10 });
    if (show.has('v')) tipArrow(px, py, sc.v * k.v[0], sc.v * k.v[1], 'good', 'v', { width: 2.6, head: 10 });
    plot.point(px, py, { color: 'ink', r: 5.5 });
    if (bplot) drawBars(k);
    const rows = (C.readouts || []).map((key) => {
      const val = { t, r: k.r, rd: k.rd, rdd: k.rdd, th: k.th, thd: k.thd, thdd: k.thdd, vr: k.vr, vt: k.vt, speed: k.speed, ar: k.ar, at: k.at, a: k.amag }[key];
      return READ[key] ? [READ[key][0], `${trim(val)}\\,\\mathrm{${READ[key][1]}}`] : null;
    });
    F.readout(rows);
  }

  function drawBars(k) {
    const vals = TERMS.map(([key]) => k.terms[key]);
    const tot = [k.ar, k.at];
    const m = Math.max(1e-9, ...vals.map(Math.abs), ...tot.map(Math.abs));
    bplot.setView([-1.05, 1.05], [0, 7]);
    bplot.clear();
    const rows = [
      ...TERMS.slice(0, 2).map(([, name, color], i) => [name, color, vals[i]]), ['a_r', 'warn', tot[0]],
      ...TERMS.slice(2).map(([, name, color], i) => [name, color, vals[i + 2]]), ['a_θ', 'warn', tot[1]],
    ];
    bplot.line(0, 0.2, 0, 6.8, { color: 'ink3', width: 1 });
    rows.forEach(([name, color, v], i) => {
      const y = 6.3 - i - (i >= 3 ? 0.2 : 0), total = i === 2 || i === 5;
      const w = (v / m) * 0.62;
      bplot.rect(Math.min(0, w), y - 0.32, Math.abs(w), 0.64, { color, alpha: total ? 0.55 : 0.35, width: total ? 1.6 : 1 });
      const label = name === 'a_r' ? 'radial total' : name === 'a_θ' ? 'transverse total' : name;
      mark(bplot, label, -1.02, y, { color: total ? 'ink' : 'ink2', size: 12.5, weight: total ? 700 : 500 });
      if (C.values !== false) bplot.text(`${plain(v)} m/s²`, w >= 0 ? w + 0.02 : w - 0.02, y, { color: 'ink2', size: 11.5, align: w >= 0 ? 'left' : 'right' });
    });
  }

  // an arrow from (x, y) by (dx, dy) world units, its label just beyond the tip
  function tipArrow(x, y, dx, dy, color, label, o) {
    plot.arrow(x, y, x + dx, y + dy, { color, ...o });
    if (C.labels === false) return;
    const px = plot.X(x + dx) - plot.X(x), py = plot.Y(y + dy) - plot.Y(y), n = Math.hypot(px, py);
    if (n < 2) return;
    mark(plot, label, x + dx, y + dy, { color, dx: (px / n) * 12, dy: (py / n) * 12 + 1, align: 'center', size: 13.5, weight: 650 });
  }

  F.draw(draw);
  F.caption('Point particle in a plane. Arrows are drawn to scale within each kind (all accelerations share one scale); the four dashed terms run head to tail and end where the true acceleration (orange) ends. Derivatives are computed numerically.');
  return { get: (key) => F.params[key] };
}

// Canvas text with combining marks drawn by hand (fonts often place U+0302, U+0307 and
// U+0308 beside the letter instead of over it): a hat, one dot or two dots above.
const MARKS = { '\u0302': 'hat', '\u0307': 'dot', '\u0308': 'ddot' };
function mark(plot, s, x, y, o = {}) {
  const g = plot.ctx, size = o.size || 12.5;
  const clusters = [];
  for (const ch of s) { if (MARKS[ch] && clusters.length) clusters[clusters.length - 1].marks.push(MARKS[ch]); else clusters.push({ ch, marks: [] }); }
  g.save();
  g.font = `${o.weight || 500} ${size}px Inter, system-ui, sans-serif`;
  const widths = clusters.map((c) => g.measureText(c.ch).width), total = widths.reduce((a, b) => a + b, 0);
  let px = plot.X(x) + (o.dx || 0), py = plot.Y(y) + (o.dy || 0);
  if (o.align === 'center') px -= total / 2; else if (o.align === 'right') px -= total;
  g.textAlign = 'left'; g.textBaseline = 'middle';
  const col = plot.color(o.color || 'ink');
  clusters.forEach((c, i) => {
    g.lineWidth = 3.5; g.strokeStyle = plot.col.bg; g.globalAlpha = 0.85; g.strokeText(c.ch, px, py); g.globalAlpha = 1;
    g.fillStyle = col; g.fillText(c.ch, px, py);
    const cx = px + widths[i] / 2, top = py - size * 0.62;
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 1.3;
    for (const m of c.marks) {
      if (m === 'hat') { g.beginPath(); g.moveTo(cx - size * 0.22, top + size * 0.02); g.lineTo(cx, top - size * 0.18); g.lineTo(cx + size * 0.22, top + size * 0.02); g.stroke(); }
      else if (m === 'dot') { g.beginPath(); g.arc(cx, top - size * 0.06, size * 0.09, 0, 6.3); g.fill(); }
      else { for (const s2 of [-1, 1]) { g.beginPath(); g.arc(cx + s2 * size * 0.16, top - size * 0.06, size * 0.085, 0, 6.3); g.fill(); } }
    }
    px += widths[i];
  });
  g.restore();
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  const keys = (P.sliders || []).map((s) => s.key);
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`);
    if (['t', 'theta', 'preset'].includes(s.key)) out.push(`slider key ${s.key} is reserved`);
    if (!s.label || !s.explain) out.push(`slider ${s.key} needs a label and an explain`);
  }
  const configs = P.presets?.length ? P.presets.map((q) => ({ ...P, ...q })) : [P];
  if (P.presets?.length && !P.presets.every((q) => q.label)) out.push('every preset needs a label');
  for (const C of configs) {
    const where = C.label ? `preset “${C.label}”` : 'params';
    let rf, thf;
    try { rf = fn(C.r, ['t', ...keys]); } catch (e) { out.push(`${where}: r “${C.r}” — ${e.message}`); }
    try { thf = fn(C.theta, ['t', ...keys]); } catch (e) { out.push(`${where}: theta “${C.theta}” — ${e.message}`); }
    if (!(Array.isArray(C.T) && C.T.length === 2 && C.T[0] < C.T[1])) { out.push(`${where}: T must be [t0, t1]`); continue; }
    if (C.at !== undefined && !(C.at >= C.T[0] && C.at <= C.T[1])) out.push(`${where}: at must lie in T`);
    for (const k of ['x', 'y']) if (C[k] && !(Array.isArray(C[k]) && C[k].length === 2 && C[k][0] < C[k][1])) out.push(`${where}: ${k} must be [lo, hi]`);
    for (const s of C.show || []) if (!SHOW.includes(s)) out.push(`${where}: unknown show “${s}” (use ${SHOW.join(' ')})`);
    for (const r of C.readouts || []) if (!READ[r]) out.push(`${where}: unknown readout “${r}”`);
    if (rf && thf) {
      const env = {}; for (const s of P.sliders || []) env[s.key] = s.value;
      for (let i = 0; i <= 20; i++) {
        const t = C.T[0] + ((C.T[1] - C.T[0]) * i) / 20;
        if (!Number.isFinite(rf({ ...env, t })) || !Number.isFinite(thf({ ...env, t }))) { out.push(`${where}: r or θ is not finite at t = ${t}`); break; }
      }
    }
  }
  return out;
}
