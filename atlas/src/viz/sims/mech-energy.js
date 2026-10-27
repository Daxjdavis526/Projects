// Energy diagrams. A particle moves along a line in a potential-energy
// landscape U(x) — or a bead slides on a track of height h(x), whose energy
// U = mgh has the same shape as the track. The total-energy line E can be
// dragged (or set with a slider): where U < E the particle may be, and its
// kinetic energy K = E − U is the gap between the line and the curve; where
// U > E it may not. Turning points (U = E) and equilibria (dU/dx = 0: stable,
// unstable or neutral) are found numerically and marked; the force
// F = −dU/dx rides on the particle; energy bars split the total into K, U
// and, with friction, thermal energy. Play runs the motion. The physics is
// model/mech-energy.js (tested headlessly in test/mech-energy.test.mjs).
//
//   { type: 'mech-energy', params: {
//       U: 'x^4/4 - 2*x^2',          // potential energy (J): an expression of x and the slider keys — or
//       h: '2 - 2*x^2/9',            // a track's height (m): a bead on a wire, U = m g h
//       x: [-3, 3], y: [-4, 6],      // plot ranges (y is energy for U, height for h; default fitted)
//       E: 2,                        // total energy (U mode). Default: what the start gives
//       x0: 1, dir: 1,               // start position, and the direction it first moves (U mode)
//       v0: 0,                       // starting speed along +x (h mode; the bead is released at x0)
//       m: 1, g: 9.8,                // mass (kg) and gravity (m/s²)
//       friction: 0,                 // U mode: kinetic friction of fixed size (N), an expression of x and the sliders
//       rough: [{ from: 4, to: 6, mu: 0.3 }],   // h mode: rough stretches (the track must be level there)
//       sliders: [...], constants: {},          // as in graph; the slider keys E and x0 set the energy and the start
//       particle: true, play: true,  // a particle at all; a Play button
//       dragE: true, dragX: true,    // drag the energy line (U mode) and the particle (the start)
//       allowed: true, turning: true, equilibria: true, force: true, bars: true, labels: true,
//       marks: [{ x: 1.2, label: 'A' }],          // labelled points on the curve
//       levels: [{ E: 3, label: 'E₁' }],          // extra energy lines (labelled at the right)
//       readouts: ['E', 'U', 'K', 'F'],           // any of E U K F x v h th turning
//       xlabel: 'x (m)', ylabel: 'energy (J)', unit: 'J', lunit: 'm', rate: 1,   // rate: simulated seconds per second
//   } }
//
// Problems that ask for a turning point, an equilibrium or an energy should
// switch the matching marker off (turning: false, equilibria: false, …) — a
// picture must not show its answer.

import { Plot, themeColors } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as ME from '../model/mech-energy.js';

export const defaults = {
  U: null, h: null, x: [-3, 3], y: null, E: null, x0: null, dir: 1, v0: 0, m: 1, g: ME.G,
  friction: 0, rough: [], particle: true, play: true, dragE: true, dragX: true,
  allowed: true, turning: true, equilibria: true, force: true, bars: true, labels: true,
  marks: [], levels: [], readouts: null, xlabel: 'x (m)', ylabel: null, unit: 'J', lunit: 'm', rate: 1, aspect: 'wide',
};

const READOUTS = ['E', 'U', 'K', 'F', 'x', 'v', 'h', 'th', 'turning'];
const RESERVED = ['x', 'E', 'x0'];
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})].filter((k) => k !== 'E' && k !== 'x0');

/** The functions for given parameter values: U(x) in J, the plotted curve, friction. Node-safe. */
export function build(P, env) {
  const keys = keysOf(P);
  const vars = ['x', ...keys];
  const track = P.h !== null && P.h !== undefined;
  const f = fn(track ? P.h : P.U, vars);
  const curve = (x) => f({ ...env, x });
  const val = (src) => fn(src, keys)(env);
  const m = val(P.m), g = val(P.g);
  const span = P.x[1] - P.x[0];
  let friction = null;
  if (track && (P.rough || []).length) {
    const patches = P.rough.map((r) => ({ from: val(r.from), to: val(r.to), mu: val(r.mu) }));
    friction = (x) => { for (const r of patches) if (x >= r.from && x <= r.to) return r.mu * m * g; return 0; };
    friction.patches = patches;
  } else if (!track && P.friction) {
    const fr = fn(P.friction, vars);
    friction = (x) => Math.max(0, fr({ ...env, x }));
  }
  const sys = track ? ME.system({ h: curve, m, g, friction, span }) : ME.system({ U: curve, m, friction, span });
  return { track, curve, sys, m, g, span, friction };
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = !!F.compact;
  const { canvas } = F.canvas({ aspect: P.aspect, label: P.alt || (P.h ? 'A ball on a track with energy bars' : 'An energy diagram: potential energy against position, with the total-energy line') });
  const ctx = canvas.getContext('2d');
  const keys = keysOf(P);
  const sliders = P.sliders || [];
  for (const s of sliders) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = F.params[k]; return e; };
  const hasE = sliders.some((s) => s.key === 'E'), hasX = sliders.some((s) => s.key === 'x0');

  let B = build(P, env());
  const [xa, xb] = P.x;
  const clampX = (x) => Math.max(xa, Math.min(xb, x));
  const Y = (e) => (B.track ? e / (B.m * B.g) : e);          // energy → plot units
  const yCurve = (x) => B.curve(x);                           // the plotted curve: U, or the track height

  // the start (x0 and the energy E0) and the motion (state s)
  const S = { running: false, x0: null, E0: 0, v0: P.v0 || 0, none: false, s: null };
  const startX = () => (hasX ? F.params.x0 : P.x0 ?? (B.track ? xa + 0.08 * B.span : ME.downhill(B.sys.U, (xa + xb) / 2, P.x)));
  // a fresh start from the parameters
  function init() {
    S.x0 = clampX(startX());
    S.v0 = P.v0 || 0;
    if (!B.track) S.E0 = hasE ? F.params.E : P.E ?? B.sys.U(S.x0);
    restart();
  }
  // back to the current start
  function restart() {
    S.running = false;
    if (playBtn) playBtn.textContent = 'Play';
    if (B.track) {
      const w = 1 + B.sys.dh(S.x0) ** 2;
      S.s = ME.state(S.x0, S.v0 / Math.sqrt(w));
      S.E0 = B.sys.U(S.x0) + ME.kinetic(B.sys, S.s);
      S.none = false;
      return;
    }
    place(S.x0, P.dir);
  }
  // put the particle at x (or the nearest place it may be) with the energy E0, moving in direction dir
  function place(x, dir) {
    const U = B.sys.U;
    let p = clampX(x);
    if (U(p) > S.E0) {
      const iv = ME.allowed(U, S.E0, P.x);
      let best = null, d = Infinity;
      for (const [a, b] of iv) { const q = Math.max(a, Math.min(b, p)); if (Math.abs(q - p) < d) { d = Math.abs(q - p); best = q; } }
      if (best === null) { S.none = true; S.s = ME.state(p, 0); return; }
      p = best;
    }
    S.none = false;
    S.x0 = p;
    const K = Math.max(0, S.E0 - U(p));
    S.s = ME.state(p, (dir < 0 ? -1 : 1) * Math.sqrt((2 * K) / B.m));
  }

  let playBtn = null;
  const anim = P.play && P.particle ? F.animate((dt) => {
    if (!S.running || S.none) return;
    ME.advance(B.sys, S.s, dt * (P.rate || 1), 24);
    if (!B.friction) ME.project(B.sys, S.s, S.E0);
    if (S.s.rest) { S.running = false; playBtn.textContent = 'Replay'; }
    if (S.s.x < xa || S.s.x > xb) { S.running = false; playBtn.textContent = 'Replay'; S.s.x = clampX(S.s.x); }
    draw();
  }, { force: true }) : null;
  if (anim) {
    playBtn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; playBtn.textContent = 'Play'; return; }
      if (S.s.rest || playBtn.textContent === 'Replay') restart();
      if (S.none) return;
      S.running = true; playBtn.textContent = 'Pause'; anim.start();
    } });
    F.button({ label: 'Reset', onClick: () => { restart(); draw(); } });
  }

  const plot = new Plot(canvas, { x: P.x, y: [0, 1], xlabel: P.xlabel, ylabel: P.ylabel ?? (P.h ? 'height (m)' : `energy (${P.unit})`), yticks: compact ? 5 : 6 });
  const fitY = () => {
    if (P.y) return P.y;
    const n = 200, vals = [];
    for (let i = 0; i <= n; i++) { const v = yCurve(xa + ((xb - xa) * i) / n); if (Number.isFinite(v)) vals.push(v); }
    const lo0 = Math.min(0, ...vals), top = Math.max(Y(S.E0), ...(P.levels || []).map((l) => Y(l.E)), lo0 + 1e-9);
    const hi0 = B.track ? Math.max(top, ...vals) : top;
    const pad = (hi0 - lo0) * (B.track ? 0.15 : 0.35);
    return [lo0 - (lo0 < 0 ? 0.12 * (hi0 - lo0) : 0.04 * (hi0 - lo0)), hi0 + pad];
  };

  // drag the energy line (U mode) and the particle
  const showBars = P.bars && P.particle;
  if (P.particle && !B.track && P.dragE && P.play !== false) {
    plot.handle(() => [plot.vx1 - 0.035 * (plot.vx1 - plot.vx0), Y(S.E0)], (x, y) => {
      const E = Math.max(plot.vy0, Math.min(plot.vy1, y));
      setE(E, true);
    }, { label: 'total energy' });
  }
  if (P.particle && P.dragX && P.play !== false) {
    plot.handle(() => [S.s.x, yCurve(S.s.x)], (x) => {
      S.running = false; if (playBtn) playBtn.textContent = 'Play';
      moveStart(x);
      if (hasX) F.set('x0', S.x0);
    }, { label: 'particle' });
  }
  plot.onDrag = () => draw();
  // a new start position: a bead is released from rest there; a particle keeps the energy E
  function moveStart(x) {
    if (B.track) { S.x0 = clampX(x); S.v0 = 0; restart(); }
    else place(x, S.s && S.s.v < 0 ? -1 : P.dir);
  }
  function setE(E, fromDrag) {
    S.E0 = E;
    const x = S.s ? S.s.x : startX();
    const running = S.running;
    place(S.s && B.sys.U(x) <= E ? x : ME.downhill(B.sys.U, x, P.x), S.s && S.s.v < 0 ? -1 : P.dir);
    S.running = running && !S.none;
    if (fromDrag && hasE) F.set('E', E);
  }

  F.onChange((key) => {
    if (key === 'E') { if (!B.track) setE(F.params.E, false); }
    else if (key === 'x0') moveStart(F.params.x0);
    else if (keys.includes(key)) { B = build(P, env()); fsCache = null; init(); }
    draw();
  });

  init();

  function draw() {
    const c = themeColors();
    plot.resize();
    const W = plot.w, H = plot.h;
    const barW = showBars ? (compact ? 92 : Math.min(150, Math.max(104, W * 0.17))) : 0;
    plot.o.pad = { l: 50, r: 16 + barW, t: 14, b: 34 };
    plot.setView(P.x, fitY());
    plot.refreshTheme();
    ctx.clearRect(0, 0, W, H);
    plot.grid(); plot.axes();
    const U = B.sys.U, s = S.s;
    const th = s ? s.th : 0;
    const Em = S.E0 - th;                                   // mechanical energy now
    const yE = Y(Em);
    const iv = P.particle && !S.none ? ME.allowed(U, Em, P.x) : [];
    const tps = P.particle && !S.none ? ME.turningPoints(U, Em, P.x) : [];
    const eqs = P.equilibria ? ME.equilibria(U, P.x) : [];

    ctx.save();
    ctx.beginPath(); ctx.rect(plot.L, plot.T, plot.R - plot.L, plot.B - plot.T); ctx.clip();
    // the allowed region: between the curve and the energy line
    if (P.allowed && P.particle && !S.none) for (const [a, b] of iv) plot.area(() => yE, a, b, { lower: yCurve, color: 'good', alpha: 0.16 });
    // the curve: a solid track, or the potential-energy graph
    if (B.track) {
      plot.area(yCurve, xa, xb, { lower: () => plot.vy0, color: 'ink4', alpha: 0.22 });
      plot.fn(yCurve, { color: 'ink2', width: 3.2 });
      for (const r of B.friction?.patches || []) {
        const y0 = yCurve((r.from + r.to) / 2);
        plot.line(Math.max(xa, r.from), y0, Math.min(xb, r.to), y0, { color: 'warn', width: 5 });
        if (P.labels) plot.text(`rough: μ = ${trim(r.mu, 2)}`, (Math.max(xa, r.from) + Math.min(xb, r.to)) / 2, y0, { color: 'warn', dy: 16, align: 'center', size: 11 });
      }
    } else plot.fn(yCurve, { color: 'accent', width: 2.6 });
    // extra energy levels
    for (const l of P.levels || []) {
      const y = Y(l.E);
      plot.line(plot.vx0, y, plot.vx1, y, { color: l.color || 'ink2', width: 1.4, dash: [6, 5] });
      if (l.label) plot.text(l.label, plot.vx1, y, { color: l.color || 'ink2', dx: -6, dy: -9, align: 'right', size: 11.5, weight: 650 });
    }
    // the energy line: solid where the particle may be, dashed where it may not
    if (P.particle && !S.none) {
      plot.line(plot.vx0, yE, plot.vx1, yE, { color: 'gold', width: 1.3, dash: [5, 6], alpha: 0.75 });
      for (const [a, b] of iv) plot.line(a, yE, b, yE, { color: 'gold', width: 2.4 });
    }
    // equilibria
    for (const q of eqs) {
      const y = yCurve(q.x);
      if (q.kind === 'neutral') {
        plot.line(q.from, y, q.to, y, { color: 'violet', width: 4, alpha: 0.7 });
        if (P.labels) plot.text('neutral', q.x, y, { color: 'violet', dy: -12, align: 'center', size: 11 });
      } else {
        const stable = q.kind === 'stable';
        plot.point(q.x, y, stable ? { color: 'good', r: 5 } : { color: 'panel', r: 5, ring: 'bad' });
        if (P.labels) plot.text(stable ? 'stable' : 'unstable', q.x, y, { color: stable ? 'good' : 'bad', dy: stable ? 15 : -14, align: 'center', size: 11 });
      }
    }
    // turning points
    if (P.turning && P.particle && !S.none) {
      const spaced = tps.every((x, i) => i === 0 || plot.X(x) - plot.X(tps[i - 1]) > 84);
      const axisY = Math.max(plot.vy0, Math.min(plot.vy1, 0));
      for (const x of tps) {
        plot.line(x, yE, x, axisY, { color: 'gold', width: 1, dash: [2, 4] });
        plot.point(x, yE, { color: 'panel', r: 4.5, ring: 'gold' });
        if (P.labels && spaced && tps.length <= 4) plot.text('turning point', x, yE, { color: 'gold', dy: -12, align: 'center', size: 10.5 });
      }
    }
    // labelled marks
    for (const mk of P.marks || []) {
      const y = mk.y ?? yCurve(mk.x);
      plot.point(mk.x, y, { color: mk.color || 'ink', r: 4.5 });
      if (mk.label) plot.text(mk.label, mk.x, y, { color: mk.color || 'ink', dx: mk.dx ?? 0, dy: mk.dy ?? -14, align: 'center', weight: 650 });
    }
    // the particle
    if (P.particle && s) {
      const y = yCurve(s.x), K = Math.max(0, Em - U(s.x));
      if (!S.none && !B.track && K > 0) {
        plot.line(s.x, y, s.x, yE, { color: 'gold', width: 2, dash: [4, 3] });
        if (P.labels) plot.text('K', s.x, (y + yE) / 2, { color: 'gold', dx: 8, weight: 650 });
      }
      if (P.force && !B.track && !S.none) {
        const Fx = ME.force(B.sys, s.x), Fs = forceScale();
        const px = Math.max(-80, Math.min(80, (Fx / Fs) * 46));
        if (Math.abs(px) > 3) plot.arrowPx(s.x, y, px, 0, { color: 'violet', width: 2.6, label: P.labels ? 'F' : '', ldx: px > 0 ? 6 : -16, ldy: -10 });
      }
      const ball = B.track ? [s.x, y] : [s.x, y];
      const g = ctx, X = plot.X(ball[0]), Yp = plot.Y(ball[1]) - (B.track ? 8 : 0);
      g.beginPath(); g.arc(X, Yp, 8, 0, Math.PI * 2);
      g.fillStyle = S.none ? c.ink3 : c.accent2; g.fill();
      g.lineWidth = 2; g.strokeStyle = c.panel; g.stroke();
    }
    ctx.restore();

    // the energy-line handle and its label (outside the clip, so it is never cut)
    if (P.particle && !S.none && !B.track) {
      const hx = plot.X(plot.vx1 - 0.035 * (plot.vx1 - plot.vx0)), hy = plot.Y(yE);
      if (hy >= plot.T - 2 && hy <= plot.B + 2) {
        if (P.dragE && P.play !== false) {
          ctx.beginPath(); ctx.arc(hx, hy, 7, 0, Math.PI * 2);
          ctx.fillStyle = c.panel; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c.gold; ctx.stroke();
        }
        if (P.labels) plot.text('E', hx, hy, { screen: true, color: 'gold', dx: -12, dy: -11, align: 'right', weight: 700 });
      }
    }
    if (P.particle && B.track && P.labels && !S.none) plot.text('release level', plot.R - 4, plot.Y(yE), { screen: true, color: 'gold', dy: -10, align: 'right', size: 11 });
    if (S.none && P.labels) plot.text('E is below U everywhere here: no motion is possible', (plot.L + plot.R) / 2, plot.T + 14, { screen: true, color: 'bad', align: 'center', size: 12 });

    if (showBars) bars(c, Em, th);

    // readouts
    const rows = [];
    const want = P.readouts ?? (B.track ? ['h', 'v', 'K', 'U'] : ['E', 'U', 'K', 'F']);
    if (P.particle && s) {
      const unit = `\\,\\mathrm{${P.unit}}`, lu = `\\,\\mathrm{${P.lunit}}`;
      const fu = P.unit === 'J' && P.lunit === 'm' ? '\\,\\mathrm{N}' : `\\,\\mathrm{${P.unit}/${P.lunit}}`;
      const K = S.none ? 0 : Math.max(0, Em - U(s.x));
      const R = {
        E: [B.friction ? 'mechanical energy $K + U$' : 'total energy $E$', num(Em) + unit],
        U: [B.track ? '$U = mgh$' : '$U(x)$', num(U(s.x)) + unit],
        K: ['$K = E - U$', num(K) + unit],
        F: ['force $F = -dU/dx$', num(ME.force(B.sys, s.x)) + fu],
        x: ['$x$', num(s.x) + lu],
        v: ['speed $v$', num(S.none ? 0 : B.track ? Math.sqrt((2 * K) / B.m) : Math.sqrt((2 * K) / B.m)) + '\\,\\mathrm{m/s}'],
        h: ['height $h$', num(yCurve(s.x)) + lu],
        th: ['thermal energy', num(th) + unit],
        turning: ['turning points', tps.length ? `x = ${tps.map((x) => num(x)).join(',\\ ')}${lu}` : '\\text{none in view}'],
      };
      for (const k of want) if (R[k]) rows.push(R[k]);
    }
    F.readout(rows);
  }

  // a typical force size: the 75th percentile of |dU/dx| where the curve is in view
  let fsCache = null;
  function forceScale() {
    if (fsCache && fsCache.B === B) return fsCache.v;
    const vals = [];
    for (let i = 0; i <= 200; i++) { const x = xa + ((xb - xa) * i) / 200, y = yCurve(x); if (y >= plot.vy0 && y <= plot.vy1) vals.push(Math.abs(ME.force(B.sys, x))); }
    vals.sort((p, q) => p - q);
    const v = vals.length ? vals[Math.floor(vals.length * 0.75)] || vals[vals.length - 1] || 1 : 1;
    fsCache = { B, v: v || 1 };
    return fsCache.v;
  }

  // energy bars on the plot's own scale: their tops line up with the diagram
  function bars(c, Em, th) {
    const g = ctx, s = S.s, U = B.sys.U;
    const K = S.none ? 0 : Math.max(0, Em - U(s.x)), Ux = U(s.x);
    const list = [['K', K, c.accent], [B.track ? 'U_g' : 'U', Ux, c.good]];
    if (B.friction) list.push(['E_th', th, c.warn]);
    list.push(['total', K + Ux + th, c.gold]);
    const x0 = plot.R + 22, x1 = plot.w - 8, slot = (x1 - x0) / list.length, bw = Math.min(26, slot * 0.62);
    const base = Math.max(plot.T, Math.min(plot.B, plot.Y(Y(0))));
    g.save();
    g.strokeStyle = c.line3; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x0 - 6, base + 0.5); g.lineTo(x1, base + 0.5); g.stroke();
    list.forEach(([lab, v, col], i) => {
      const cx = x0 + slot * (i + 0.5), top = Math.max(plot.T, Math.min(plot.B, plot.Y(Y(v))));
      const y0 = Math.min(base, top), hgt = Math.abs(base - top);
      if (lab === 'total') { g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(cx - bw / 2, y0, bw, Math.max(1, hgt)); }
      else { g.fillStyle = col; g.globalAlpha = 0.85; g.fillRect(cx - bw / 2, y0, bw, Math.max(hgt, 0.5)); g.globalAlpha = 1; }
      sym(g, lab, cx, plot.B + 14, lab === 'total' ? c.ink2 : col);
      if (!compact && Math.abs(v) > 1e-9) {
        g.fillStyle = c.ink3; g.font = '10px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = v >= 0 ? 'bottom' : 'top';
        g.fillText(short(v), cx, v >= 0 ? y0 - 3 : y0 + hgt + 3);
      }
    });
    g.restore();
  }

  F.draw(draw);
  if (!P.caption) F.caption(B.track
    ? 'A bead sliding on a frictionless wire shaped like the track: no rolling, no air resistance. Its energy diagram $U = mgh$ has the shape of the track, so the release level is the highest it can ever reach. Rough stretches are level, with friction $\\mu_k mg$.'
    : `A particle moving along a line under the force $F = -dU/dx$, integrated numerically (RK4).${B.friction ? ' Friction has a fixed size, as for a block sliding on a level floor; static friction is taken equal to kinetic.' : ' No friction: the total energy stays exactly constant.'} Energy bars share the diagram’s vertical scale.`);
  return { get: (k) => (k === 'E' ? S.E0 : k === 'x0' ? S.x0 : F.params[k]) };
}

// a symbol with an optional subscript: 'U_g', 'E_th'
function sym(g, lab, x, y, color) {
  const [base, sub] = lab.split('_');
  g.fillStyle = color; g.textBaseline = 'middle';
  if (!sub) { g.font = `${base.length > 2 ? 500 : 650} ${base.length > 2 ? 10.5 : 12.5}px Inter, system-ui, sans-serif`; g.textAlign = 'center'; g.fillText(base, x, y); return; }
  g.font = '650 12.5px Inter, system-ui, sans-serif';
  const wb = g.measureText(base).width;
  g.font = '600 9.5px Inter, system-ui, sans-serif';
  const ws = g.measureText(sub).width;
  const left = x - (wb + ws) / 2;
  g.textAlign = 'left';
  g.font = '650 12.5px Inter, system-ui, sans-serif'; g.fillText(base, left, y);
  g.font = '600 9.5px Inter, system-ui, sans-serif'; g.fillText(sub, left + wb, y + 4);
}

const trim = (v, n = 3) => String(+(+v).toPrecision(n));
function num(v) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return v.toExponential(2).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`);
  return String(+v.toPrecision(3));
}
function short(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return `${trim(v / 1e6, 2)}M`;
  if (a >= 1e3) return `${trim(v / 1e3, 2)}k`;
  return trim(v, 2);
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const problems = [];
  const track = P.h !== null && P.h !== undefined;
  if (!track && (P.U === null || P.U === undefined)) return ['mech-energy needs U (a potential energy) or h (a track height)'];
  if (track && P.U !== null && P.U !== undefined) problems.push('give U or h, not both');
  if (!(Array.isArray(P.x) && P.x[0] < P.x[1])) return ['x must be a range [min, max]'];
  if (P.y && !(P.y[0] < P.y[1])) problems.push('y must be a range [min, max]');
  const keys = keysOf(P);
  for (const k of keys) if (RESERVED.includes(k)) problems.push(`slider key “${k}” is reserved`);
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`slider ${s.key} needs a label`);
  }
  for (const r of P.readouts || []) if (!READOUTS.includes(r)) problems.push(`unknown readout “${r}” (use ${READOUTS.join(', ')})`);
  const env = { ...(P.constants || {}), ...Object.fromEntries([...(P.sliders || []), ...(P.choices || [])].filter((s) => s.key !== 'E' && s.key !== 'x0').map((s) => [s.key, s.value])) };
  let B;
  try { B = build(P, env); } catch (e) { return [...problems, `expression: ${e.message}`]; }
  if (!(B.m > 0) || !(B.g > 0)) problems.push('m and g must be positive');
  const [a, b] = P.x;
  let finite = 0;
  for (let i = 0; i <= 100; i++) if (Number.isFinite(B.curve(a + ((b - a) * i) / 100))) finite++;
  if (finite < 50) problems.push('the curve is not finite over most of the x range');
  if (P.x0 !== null && P.x0 !== undefined && (P.x0 < a || P.x0 > b)) problems.push('x0 must lie in the x range');
  if (track) {
    for (const r of B.friction?.patches || []) {
      if (!(r.mu >= 0) || !(r.from < r.to)) { problems.push('a rough stretch needs from < to and mu ≥ 0'); continue; }
      for (let i = 0; i <= 20; i++) {
        const x = r.from + ((r.to - r.from) * i) / 20;
        if (Math.abs(B.sys.dh(x)) > 1e-6) { problems.push(`the track must be level on the rough stretch ${r.from}–${r.to} (friction there is μ m g)`); break; }
      }
    }
  } else if (P.friction && typeof P.friction === 'number' && P.friction < 0) problems.push('friction must not be negative');
  if (!track && P.particle && P.E === null && !(P.sliders || []).some((s) => s.key === 'E') && P.x0 === null) problems.push('give the particle an energy E (or a start x0)');
  for (const m of P.marks || []) if (!(m.x >= a && m.x <= b)) problems.push('marks must lie in the x range');
  for (const l of P.levels || []) if (!Number.isFinite(l.E)) problems.push('levels need a numeric E');
  return problems;
}
