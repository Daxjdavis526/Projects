// Rutherford scattering: a beam of alpha particles passing a nucleus, each on
// its own hyperbola. One alpha (gold) has the impact parameter set by the
// slider; its scattering angle θ, its closest approach and its impact
// parameter b are marked. Switch the atom to Thomson’s “plum pudding” and the
// same beam goes straight through. Beside it, either the angle against the
// impact parameter, θ = 2 atan(d/2b), or Geiger and Marsden’s 1913 counts
// against angle with Rutherford’s 1/sin⁴(θ/2). Distances in femtometres, to
// scale; the nucleus is held fixed. Physics in model/mp-rutherford.js (tested
// in test/mp-rutherford.test.mjs).
//
//   { type: 'mp-rutherford', params: {
//       K: 7.7,               // alpha kinetic energy, MeV (the slider runs 2–10)
//       target: 'gold',       // gold | silver | copper | aluminium
//       b: 20,                // impact parameter of the highlighted alpha, fm
//       model: 'nucleus',     // 'nucleus' (Rutherford) or 'thomson' (plum pudding)
//       beam: true,           // a beam of alphas at evenly spaced impact parameters
//       panel: 'angle',       // the graph: 'angle' (θ against b), 'counts' (Geiger–Marsden), or 'none'
//       play: null,           // animate the alphas (default: yes in the Explore step, no in a question)
//       controls: null,       // true, false, or a list of: K target b model panel
//       readout: true,
//       hide: [],             // any of: theta, rmin, b, d — their readouts and labels show “?”
//       range: 120,           // half-width of the view, fm
//   } }

import { Plot, pow10Label } from '../plot.js';
import * as R from '../model/mp-rutherford.js';

export const defaults = { K: 7.7, target: 'gold', b: 20, model: 'nucleus', beam: true, panel: 'angle', play: null, controls: null, readout: true, hide: [], range: 120 };
const CONTROLS = ['K', 'target', 'b', 'model', 'panel'];
const HIDE = ['theta', 'rmin', 'b', 'd'];
const DEG = Math.PI / 180;
const f3 = (x) => (Math.abs(x) >= 100 ? x.toFixed(0) : Math.abs(x) >= 10 ? x.toFixed(1) : x.toPrecision(3));

/**
 * The part of a path within distance Rc of the nucleus. An orbit comes in
 * once and goes out once, so it is enough to cut the first and the last
 * segment that cross the circle.
 */
function clip(pts, Rc) {
  const r = ([x, y]) => Math.hypot(x, y);
  const cross = (a, b) => {           // the point on segment a→b at distance Rc
    const dx = b[0] - a[0], dy = b[1] - a[1], A = dx * dx + dy * dy, B = 2 * (a[0] * dx + a[1] * dy), Cc = a[0] * a[0] + a[1] * a[1] - Rc * Rc;
    const disc = Math.sqrt(Math.max(0, B * B - 4 * A * Cc)), ts = [(-B - disc) / (2 * A), (-B + disc) / (2 * A)].filter((t) => t >= 0 && t <= 1);
    const t = ts.length ? (r(a) > Rc ? ts[0] : ts[ts.length - 1]) : 0;
    return [a[0] + t * dx, a[1] + t * dy];
  };
  const inside = pts.map((p) => r(p) <= Rc);
  const i0 = inside.indexOf(true), i1 = inside.lastIndexOf(true);
  if (i0 < 0) return pts;
  const out = pts.slice(i0, i1 + 1);
  if (i0 > 0) out.unshift(cross(pts[i0 - 1], pts[i0]));
  if (i1 < pts.length - 1) out.push(cross(pts[i1], pts[i1 + 1]));
  return out;
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('K', () => F.slider({ key: 'K', label: 'Alpha energy $K$', min: 2, max: 10, step: 0.01, value: P.K, unit: '\\mathrm{MeV}', explain: 'Faster alphas get closer to the nucleus before they turn: every distance scales as $1/K$.' }));
  ctl('target', () => F.choice({ key: 'target', label: 'Target nucleus', options: Object.entries(R.TARGETS).map(([k, v]) => [k, `${v.label}, Z = ${v.Z}`]), value: P.target, explain: 'More charge pushes harder: every distance scales with $Z$.' }));
  ctl('b', () => F.slider({ key: 'b', label: 'Impact parameter $b$ (gold alpha)', min: 0, max: P.range, step: 0.5, value: P.b, unit: '\\mathrm{fm}', explain: 'How far off-centre the alpha is aimed: the distance between its starting line and the nucleus.' }));
  ctl('model', () => F.choice({ key: 'model', label: 'The atom', options: [['nucleus', 'Rutherford: a tiny nucleus'], ['thomson', 'Thomson: plum pudding']], value: P.model, explain: 'Thomson spread the positive charge through the whole atom, about 0.2 nm across; Rutherford packed it into a nucleus.' }));
  if (P.panel !== 'none') ctl('panel', () => F.choice({ key: 'panel', label: 'Graph', options: [['angle', 'angle against b'], ['counts', 'Geiger and Marsden’s counts']], value: P.panel, explain: 'How θ depends on b — or the 1913 measurement that tested it.' }));

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'Alpha particles scattering off a nucleus' });
  const plot = new Plot(canvas, { x: [-P.range, P.range], y: [-0.5 * P.range, 0.5 * P.range], equal: true, grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });
  const gcan = P.panel !== 'none' ? F.canvas({ aspect: 'wide', label: 'A graph of the scattering angle' }) : null;
  const gplot = gcan ? new Plot(gcan.canvas, { x: [0, 1], y: [0, 1] }) : null;

  // ---- state: the beam's paths, recomputed when K, the target, b or the model change
  let S = null;
  function state() {
    const tg = R.TARGETS[F.params.target] || R.TARGETS.gold, K = F.params.K, d = R.collisionDiameter(K, tg.Z), b = F.params.b;
    const key = [K, tg.Z, b, F.params.model, P.range].join();
    if (S && S.key === key) return S;
    const thomson = F.params.model === 'thomson', rmax = 1.25 * P.range;
    const pathOf = (bb) => {
      const pts = clip(thomson ? [[-6 * rmax, bb], [6 * rmax, bb + 12 * rmax * Math.tan(R.thomsonDeflection(bb, d)) * Math.sign(bb || 1)]] : R.orbit(bb, d, rmax), 1.3 * rmax);
      // the time to each point at speed v₀√(1 − d/r), for the moving dots
      const ts = [0];
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], ds = Math.hypot(x1 - x0, y1 - y0);
        const r = Math.hypot((x0 + x1) / 2, (y0 + y1) / 2), v = thomson ? 1 : Math.max(0.03, R.speedFraction(Math.max(r, d), d));
        ts.push(ts[i - 1] + ds / v);
      }
      return { pts, ts, b: bb };
    };
    const beam = [];
    if (P.beam) for (let k = -8; k <= 8; k++) { const bb = (k * P.range) / 8.5; if (Math.abs(bb - b) > P.range / 30) beam.push(pathOf(bb)); }
    const theta = thomson ? R.thomsonDeflection(b, d) : R.angleFromB(b, d);
    S = { key, tg, K, d, b, thomson, theta, rmin: R.closestApproach(b, d), Rsum: R.nuclearRadius(tg.A) + R.nuclearRadius(4), beam, sel: pathOf(b) };
    S.touch = !thomson && S.rmin < S.Rsum;
    return S;
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  let T = 0;

  /** the point a time τ along a path (looping), or null before it enters the view */
  function at(path, tau) {
    const { pts, ts } = path, total = ts[ts.length - 1];
    const s = ((tau % total) + total) % total;
    let lo = 0, hi = ts.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ts[m] < s) lo = m; else hi = m; }
    const f = (s - ts[lo]) / Math.max(1e-9, ts[hi] - ts[lo]);
    return [pts[lo][0] + f * (pts[hi][0] - pts[lo][0]), pts[lo][1] + f * (pts[hi][1] - pts[lo][1])];
  }

  function drawMain() {
    const st = state(), C = plot.col;
    plot.clear();
    const narrow = (canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    const W = P.range;
    if (st.thomson) {
      plot.rect(plot.vx0, plot.vy0, plot.vx1 - plot.vx0, plot.vy1 - plot.vy0, { color: 'violet', alpha: 0.07, stroke: false });
      plot.text(narrow ? 'inside a Thomson atom, ~800× wider than this view' : 'inside a Thomson atom: its charge fills a ball 0.2 nm across, about 800 times this view', 8, 14, { screen: true, color: 'violet', size: fs - 1 });
    }
    // the beam axis
    plot.line(plot.vx0, 0, plot.vx1, 0, { color: 'ink4', width: 1, dash: [3, 6] });
    for (const p of st.beam) plot.path(p.pts, { color: 'ink4', width: 1.2 });
    // the nucleus, to scale, and the contact distance
    if (!st.thomson) {
      plot.circle(0, 0, R.nuclearRadius(st.tg.A), { fill: 'bad', alpha: 0.85, stroke: false });
      if (!hide.has('rmin')) plot.circle(0, 0, st.rmin, { stroke: 'ink3', color: 'ink3', width: 1, dash: [3, 4] });
      plot.text(`${st.tg.label} nucleus (Z = ${st.tg.Z}), radius ${f3(R.nuclearRadius(st.tg.A))} fm`, 0, -R.nuclearRadius(st.tg.A), { color: 'bad', dy: 16, align: 'center', size: fs - 0.5 });
    }
    // the highlighted alpha
    const sel = st.sel;
    plot.path(sel.pts, { color: 'gold', width: 2.6 });
    // impact parameter: a dimension line on the left
    const xb = -0.86 * W;
    if (Math.abs(st.b) > 0.5) {
      plot.line(xb, 0, xb, st.b, { color: 'gold', width: 1.4 });
      plot.line(xb - 4, st.b, xb + 4, st.b, { color: 'gold', width: 1.4 });
      plot.line(xb - 4, 0, xb + 4, 0, { color: 'gold', width: 1.4 });
      plot.text(hide.has('b') ? 'b = ?' : `b = ${f3(st.b)} fm`, xb, st.b / 2, { color: 'gold', dx: 8, size: fs });
    } else plot.text(hide.has('b') ? 'b = ?' : 'head-on: b = 0', xb, 0, { color: 'gold', dy: -12, size: fs });
    plot.text(`alphas, K = ${f3(st.K)} MeV`, plot.vx0, -0.42 * W, { color: 'ink3', dx: 6, size: fs - 0.5 });
    // the scattering angle, at the meeting point of the two asymptotes, (−d/2, b)
    if (!st.thomson && st.b > 0.5) {
      const cx = -st.d / 2, cy = st.b, Lr = 0.22 * W;
      plot.line(cx, cy, cx + Lr, cy, { color: 'ink3', width: 1, dash: [4, 4] });
      plot.line(cx, cy, cx + Lr * Math.cos(st.theta), cy + Lr * Math.sin(st.theta), { color: 'ink3', width: 1, dash: [4, 4] });
      const g = plot.ctx, rp = Math.max(18, Math.min(40, plot.X(cx + 0.12 * W) - plot.X(cx)));
      g.save(); g.strokeStyle = C.ink2; g.lineWidth = 1.3; g.beginPath(); g.arc(plot.X(cx), plot.Y(cy), rp, -st.theta, 0); g.stroke(); g.restore();
      const lab = hide.has('theta') ? 'θ = ?' : `θ = ${f3(st.theta / DEG)}°`;
      plot.text(lab, plot.X(cx) + (rp + 8) * Math.cos(st.theta / 2), plot.Y(cy) - (rp + 8) * Math.sin(st.theta / 2), { screen: true, color: 'ink', size: fs, align: st.theta > 2.6 ? 'right' : 'left' });
    } else if (st.b <= 0.5 && !st.thomson) plot.text(hide.has('theta') ? 'θ = ?' : 'straight back: θ = 180°', -st.d, 0, { color: 'ink', dy: 16, align: 'right', size: fs });
    if (!st.thomson && !hide.has('rmin')) {
      const a = 0.25 * Math.PI;
      plot.text(`closest approach ${f3(st.rmin)} fm`, st.rmin * Math.cos(-a - Math.PI / 2), st.rmin * Math.sin(-a - Math.PI / 2), { color: 'ink3', dx: -6, dy: 10, align: 'right', size: fs - 1 });
    }
    if (st.touch) plot.text('the alpha reaches the nucleus: the nuclear force joins in, and Rutherford’s formula fails', 8, (plot.h || 300) - 14, { screen: true, color: 'bad', size: fs });
    // a scale bar
    const sb = W >= 100 ? 50 : 20, x1 = plot.vx1 - 0.06 * W, y1 = plot.vy0 + 0.08 * W;
    plot.line(x1 - sb, y1, x1, y1, { color: 'ink2', width: 2 });
    plot.text(`${sb} fm`, x1 - sb / 2, y1, { color: 'ink2', dy: -10, align: 'center', size: fs - 1 });
    // moving alphas
    if (running) {
      for (const [i, p] of [...st.beam, sel].entries()) {
        const q = at(p, T * 0.9 * W - i * 0.37 * W);
        if (q) plot.point(q[0], q[1], { color: p === sel ? 'gold' : 'ink2', r: p === sel ? 4.5 : 3 });
      }
    }
  }

  function drawGraph() {
    if (!gplot) return;
    const st = state();
    const panel = F.params.panel || P.panel;
    if (panel === 'counts') {
      gplot.o.xlabel = 'scattering angle θ (degrees)'; gplot.o.ylabel = 'alphas counted'; gplot.o.yfmt = pow10Label; gplot.o.xticks = 6;
      gplot.setView([0, 180], [0.8, 6]);
      gplot.clear();
      gplot.fn((a) => Math.log10(R.GM_N0 / Math.sin((a * DEG) / 2) ** 4), { color: 'accent', width: 2.2, domain: [9, 180] });
      for (const [a, n] of R.GM_GOLD) gplot.point(a, Math.log10(n), { color: 'gold', r: 4.5 });
      gplot.text('Rutherford: 1/sin⁴(θ/2)', 60, Math.log10(R.GM_N0 / Math.sin(30 * DEG) ** 4), { color: 'accent', dx: 10, dy: -12, size: 11.5 });
      gplot.text('Geiger and Marsden, 1913: gold', 178, 5.6, { color: 'gold', align: 'right', size: 11.5 });
      if (!st.thomson && !hide.has('theta')) {
        const a = st.theta / DEG;
        gplot.line(a, 0.8, a, 6, { color: 'ink3', width: 1, dash: [4, 4] });
      }
    } else {
      gplot.o.xlabel = 'impact parameter b (fm)'; gplot.o.ylabel = 'θ (degrees)'; gplot.o.yfmt = undefined; gplot.o.xticks = undefined;
      gplot.setView([0, P.range], [0, 185]);
      gplot.clear();
      if (st.thomson) {
        gplot.fn(() => 0.3, { color: 'violet', width: 2.4 });
        gplot.text('Thomson: below 0.01° for every b — flat on this scale', P.range * 0.98, 12, { color: 'violet', align: 'right', size: 11.5 });
      } else {
        gplot.fn((bb) => (R.angleFromB(bb, st.d) / DEG), { color: 'accent', width: 2.4, domain: [0.01, P.range] });
        gplot.line(st.d / 2, 0, st.d / 2, 90, { color: 'ink4', width: 1, dash: [4, 4] });
        gplot.text('θ = 90° at b = d/2', st.d / 2, 90, { color: 'ink3', dx: 6, dy: -10, size: 11 });
        for (const p of st.beam) if (p.b > 0) gplot.point(p.b, R.angleFromB(p.b, st.d) / DEG, { color: 'ink3', r: 2.5 });
        if (!hide.has('theta')) gplot.point(st.b, st.theta / DEG, { color: 'gold', r: 5.5 });
      }
    }
  }

  let lastRead = '';
  function readout() {
    if (P.readout === false) return;
    const st = state(), key = st.key;
    if (key === lastRead) return;
    lastRead = key;
    const q = (k, v) => (hide.has(k) ? '?' : v);
    F.readout([
      ['head-on distance $d = zZe^2/4\\pi\\varepsilon_0 K$', q('d', `${f3(st.d)}\\,\\mathrm{fm}`)],
      ['$b$', q('b', `${f3(st.b)}\\,\\mathrm{fm}`)],
      ['$\\theta$', q('theta', st.thomson ? `${(st.theta / DEG).toFixed(4)}^\\circ` : `${f3(st.theta / DEG)}^\\circ`)],
      st.thomson ? ['largest deflection, any $b$', `${(R.thomsonMax(st.d) / DEG).toFixed(4)}^\\circ`] : ['closest approach $r_{\\min}$', q('rmin', `${f3(st.rmin)}\\,\\mathrm{fm}`)],
      st.thomson ? null : ['nuclear radii $R + R_\\alpha$', `${f3(st.Rsum)}\\,\\mathrm{fm}`],
    ]);
  }

  function drawAll() { readout(); drawMain(); drawGraph(); }
  let loop = F.animate((dt) => { if (running) { T += dt; drawMain(); } });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) { T += dt; drawMain(); } }, { force: running });
      if (!running) drawMain();
    } });
  }
  F.onChange(drawAll);
  F.draw(drawAll);
  F.caption(P.caption || 'Distances to scale, in femtometres (1 fm = 10⁻¹⁵ m); the nucleus is drawn with radius 1.2 ∛A fm, A being its mass number. Each alpha follows a hyperbola set by Coulomb repulsion alone; the nucleus is held fixed (its recoil is a 2% effect for gold, larger for light nuclei) and the motion is non-relativistic. The dots slow down near the nucleus as their kinetic energy turns into electric potential energy.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!R.TARGETS[P.target]) p.push(`mp-rutherford: unknown target “${P.target}”`);
  if (!(P.K >= 2 && P.K <= 10)) p.push('mp-rutherford: K is the alpha energy in MeV, 2–10');
  if (!(P.b >= 0 && P.b <= P.range)) p.push('mp-rutherford: b must lie between 0 and range (fm)');
  if (!['nucleus', 'thomson'].includes(P.model)) p.push('mp-rutherford: model is nucleus or thomson');
  if (!['angle', 'counts', 'none'].includes(P.panel)) p.push('mp-rutherford: panel is angle, counts or none');
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-rutherford: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-rutherford: unknown control “${c}”`);
  return p;
}
