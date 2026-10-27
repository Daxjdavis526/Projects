// Collisions and separations of two bodies: carts on a straight track (1D) or
// pucks on an air table seen from above (2D). Velocity arrows, a centre-of-mass
// marker, and charts of momentum and kinetic energy before and after: the
// momentum total never changes, the kinetic-energy total does unless the
// collision is elastic. A toggle replays it from the centre-of-mass frame. The
// physics is model/mech-collide.js (tested headlessly).
//
//   { type: 'mech-collide', params: {
//       dim: 1,                    // 1: carts on a track; 2: pucks on an air table
//       mode: 'collide',           // 1D: 'collide', or 'explode' (a spring between the carts pushes them apart)
//       m1: 2, m2: 1,              // masses, kg (body 1 starts on the left)
//       u1: 3, u2: 0,              // velocities before, m/s — 1D: signed, + to the right; 2D: speeds
//       dir1: 0, dir2: 90,         // 2D: directions of those velocities, degrees from +x
//       e: 1,                      // coefficient of restitution, 0 (stick) … 1 (elastic)
//       stick: false,              // 2D: the pucks move off together (perfectly inelastic)
//       b: 0.4,                    // 2D: impact parameter, a fraction of the sum of the radii (0: head-on)
//       u: 0, E: 6,                // explode: common velocity before (m/s), energy the spring releases (J)
//       after: [v1, v2],           // 1D: give the velocities after directly (they must conserve momentum)
//       sliders: true,             // adjustable keys (true: the usual set), or [key | { key, min, max, step, label, explain }]
//       modes: false,              // 1D: offer “Collision / Push apart” buttons
//       cmFrame: false,            // offer a switch to watch from the centre-of-mass frame
//       bars: ['p', 'K'],          // charts under the picture: momentum, kinetic energy ([] for none)
//       view: 'play',              // 'play': Play runs it; 'snapshots': static pictures before and after
//       show: 'both',              // 'before': hide everything after the collision (a question's picture)
//       unknown: ['v2'],           // snapshots: these velocities after are drawn as “?”
//       values: true,              // numbers on the arrows and bars
//       names: ['1', '2'],         // labels of the two bodies
//       cm: true,                  // mark the centre of mass
//       readout: true,             // live numbers under the picture (default: on when there are sliders)
//   } }

import { Plot, themeColors } from '../plot.js';
import * as C from '../model/mech-collide.js';

export const defaults = {
  dim: 1, mode: 'collide', m1: 2, m2: 1, u1: 3, u2: 0, dir1: 0, dir2: 90, e: 1, stick: false, b: 0.4, u: 0, E: 6,
  after: null, sliders: null, modes: false, cmFrame: false, bars: ['p', 'K'], view: 'play', show: 'both',
  unknown: [], values: true, names: ['1', '2'], cm: true, readout: null, time: 0, play: true,
};

const D2R = Math.PI / 180;
const R_PUCK = 0.5;                              // 2D puck radius, table units
const COL = ['accent', 'violet'];
const KEYS = ['m1', 'm2', 'u1', 'u2', 'dir1', 'dir2', 'e', 'b', 'u', 'E'];

// slider definitions; `who` names the body in the explanation
function sliderDef(key, P) {
  const two = P.dim === 2, who = (i) => `${two ? 'Puck' : 'Cart'} ${P.names[i]}`;
  const D = {
    m1: { label: 'Mass $m_1$', min: 0.1, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: `${who(0)}${two ? '' : ', on the left'}.` },
    m2: { label: 'Mass $m_2$', min: 0.1, max: 10, step: 0.1, unit: '\\mathrm{kg}', explain: `${who(1)}${two ? '' : ', on the right'}.` },
    u1: two ? { label: 'Speed $u_1$', min: 0, max: 6, step: 0.1, unit: '\\mathrm{m/s}', explain: `${who(0)} before the collision.` }
      : { label: 'Velocity $u_1$', min: -6, max: 6, step: 0.1, unit: '\\mathrm{m/s}', explain: `${who(0)} before the collision; positive to the right.` },
    u2: two ? { label: 'Speed $u_2$', min: 0, max: 6, step: 0.1, unit: '\\mathrm{m/s}', explain: `${who(1)} before the collision.` }
      : { label: 'Velocity $u_2$', min: -6, max: 6, step: 0.1, unit: '\\mathrm{m/s}', explain: `${who(1)} before the collision; positive to the right.` },
    dir1: { label: 'Direction of $u_1$', min: -180, max: 180, step: 5, unit: '^\\circ', explain: 'Measured anticlockwise from the $+x$ axis (to the right).' },
    dir2: { label: 'Direction of $u_2$', min: -180, max: 180, step: 5, unit: '^\\circ', explain: 'Measured anticlockwise from the $+x$ axis (to the right).' },
    e: { label: 'Restitution $e$', min: 0, max: 1, step: 0.01, unit: '', explain: '1: elastic, no kinetic energy lost. 0: they stick together. In between: they separate more slowly than they approached.' },
    b: { label: 'Impact parameter $b$', min: -0.95, max: 0.95, step: 0.01, unit: '', explain: 'How far off-centre the aim is, as a fraction of the two radii added: 0 is head-on.' },
    u: { label: 'Common velocity $u$', min: -4, max: 4, step: 0.1, unit: '\\mathrm{m/s}', explain: 'Both carts move together before the spring is released.' },
    E: { label: 'Energy released $E$', min: 0, max: 50, step: 0.5, unit: '\\mathrm{J}', explain: 'Stored in the compressed spring between the carts; it all becomes kinetic energy.' },
  }[key];
  return D ? { key, value: P[key], ...D } : null;
}
const USUAL = { collide: ['m1', 'm2', 'u1', 'u2', 'e'], explode: ['m1', 'm2', 'E'], d2: ['m1', 'm2', 'u1', 'b', 'e'] };

function sliderList(P) {
  if (!P.sliders) return [];
  const keys = P.sliders === true ? (P.dim === 2 ? USUAL.d2 : USUAL[P.mode] || USUAL.collide) : P.sliders;
  return keys.map((k) => (typeof k === 'string' ? sliderDef(k, P) : { ...sliderDef(k.key, P), ...k, value: k.value ?? P[k.key] })).filter(Boolean);
}

/** The model's input for the current values: `v(key)` reads a slider or a fixed parameter. */
function specOf(P, v, mode) {
  if (P.dim === 2) {
    const a1 = v('dir1') * D2R, a2 = v('dir2') * D2R;
    return { m1: v('m1'), m2: v('m2'), r1: R_PUCK, r2: R_PUCK, u1: [v('u1') * Math.cos(a1), v('u1') * Math.sin(a1)], u2: [v('u2') * Math.cos(a2), v('u2') * Math.sin(a2)], b: v('b'), e: v('e'), stick: !!P.stick };
  }
  return { mode, m1: v('m1'), m2: v('m2'), u1: v('u1'), u2: v('u2'), e: v('e'), u: v('u'), E: v('E'), after: P.after || undefined };
}

// ─── number formats ────────────────────────────────────────────────────────
const trim = (x, n = 3) => { const r = +(+x).toPrecision(n); return Math.abs(r) < 1e-9 ? '0' : String(r); };
const fmt2 = (x) => (Math.abs(x) >= 100 ? String(Math.round(x)) : trim(x, Math.abs(x) >= 10 ? 3 : 2));
const vtxt = (x) => `${fmt2(x)} m/s`;
const texv = (x, unit) => `${trim(x, 3)}\\,\\mathrm{${unit}}`;

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const two = P.dim === 2, snaps = P.view === 'snapshots', before = P.show === 'before';
  const bars = before ? [] : P.bars || [];
  const trackH = two ? (compact ? 230 : 290) : snaps ? (before ? 1 : 2) * (compact ? 104 : 112) + 6 : compact ? 124 : 138;
  const barsH = bars.length ? (compact ? 150 : 166) : 0;
  const { canvas } = F.canvas({ label: P.alt || (two ? 'Two pucks colliding on an air table, seen from above' : 'Two carts on a track, before and after they interact'), height: `${trackH + barsH}px` });
  const ctx = canvas.getContext('2d');

  const sliders = sliderList(P);
  if (!snaps && P.play !== false) F.slider({ key: 'time', label: 'Playhead', min: 0, max: 1, step: 0.005, value: P.time, unit: '', explain: 'Scrub through the run: 0 is the start, 1 the end. Or press Play.' });
  for (const s of sliders) F.slider(s);
  if (!two && P.modes) F.choice({ key: 'mode', label: 'What happens', options: [['collide', 'Collision'], ['explode', 'Push apart']], value: P.mode });
  if (P.cmFrame) F.toggle({ key: 'cmf', label: 'Watch from the centre-of-mass frame', value: false, explain: 'Move along with the centre of mass: its velocity is subtracted from every velocity, so the total momentum reads zero.' });
  const v = (k) => (F.params[k] !== undefined ? F.params[k] : P[k]);
  const mode = () => (two ? 'collide' : F.params.mode || P.mode);
  let TL;
  const rebuild = () => { TL = two ? C.timeline2d(specOf(P, v)) : C.timeline1d(specOf(P, v, mode()), widths()); };
  const widths = () => { const mx = Math.max(v('m1'), v('m2')); return { w1: 0.55 + 0.45 * Math.cbrt(v('m1') / mx), w2: 0.55 + 0.45 * Math.cbrt(v('m2') / mx) }; };
  rebuild();

  // Play
  const S = { running: false };
  let playBtn = null;
  const DURATION = 4.5;
  const anim = F.animate((dt) => {
    if (!S.running) return;
    let tn = (F.params.time ?? 0) + dt / DURATION;
    if (tn >= 1) { tn = 1; S.running = false; if (playBtn) playBtn.textContent = 'Replay'; }
    F.set('time', tn);
  }, { force: true });
  if (!snaps && P.play !== false) {
    playBtn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; playBtn.textContent = 'Play'; return; }
      if ((F.params.time ?? 0) >= 1 - 1e-9) F.set('time', 0);
      S.running = true; playBtn.textContent = 'Pause'; anim.start();
    } });
  }
  F.onChange((key) => { if (key !== 'time' && key !== 'cmf') rebuild(); draw(); });

  const showReadout = P.readout ?? sliders.length > 0;
  const table = two ? new Plot(canvas, { x: [-4.6, 4.6], y: [-2.8, 2.8], equal: true, grid: false, axes: false }) : null;

  function draw() {
    const c = themeColors();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || trackH + barsH;
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const cmf = !!F.params.cmf;
    const t = snaps ? null : (F.params.time ?? P.time) * TL.T;
    const vals = values(cmf);
    if (two) drawTable(c, W, t, cmf);
    else if (snaps) drawSnapshots(c, W, vals);
    else drawTrack(c, W, t, cmf);
    if (bars.length) drawBars(c, W, trackH, barsH, vals);
    if (showReadout) readout(vals, cmf);
  }

  // momentum and energy, before and after, in the chosen frame
  function values(cmf) {
    const m = [v('m1'), v('m2')];
    if (two) {
      const sub = cmf ? TL.vcm : [0, 0];
      const rel = (w) => [w[0] - sub[0], w[1] - sub[1]];
      const ub = TL.u.map(rel), va = [TL.v1, TL.v2].map(rel);
      return { m, ub, va, pb: ub.map((w, i) => [m[i] * w[0], m[i] * w[1]]), pa: va.map((w, i) => [m[i] * w[0], m[i] * w[1]]), Kb: ub.map((w, i) => C.kinetic(m[i], w)), Ka: va.map((w, i) => C.kinetic(m[i], w)) };
    }
    const sub = cmf ? TL.vcm : 0;
    const ub = TL.u.map((w) => w - sub), va = [TL.v1 - sub, TL.v2 - sub];
    return { m, ub, va, pb: ub.map((w, i) => m[i] * w), pa: va.map((w, i) => m[i] * w), Kb: ub.map((w, i) => C.kinetic(m[i], w)), Ka: va.map((w, i) => C.kinetic(m[i], w)) };
  }

  // ─── 1D: the track ───────────────────────────────────────────────────────
  function trackMap(W) {
    const L = 14, R = W - 14, span = 9.6;
    return { X: (x) => (L + R) / 2 + (x / span) * (R - L), k: (R - L) / span };
  }
  function vScale(vals) {
    const vmax = Math.max(1e-9, ...vals.ub.map(Math.abs), ...vals.va.map(Math.abs));
    return (compact ? 54 : 70) / vmax;
  }
  function drawTrack(c, W, t, cmf) {
    const { X, k } = trackMap(W), y = trackH - 24;
    rail(c, W, y);
    const now = TL.at(t), wd = widths(), w = [wd.w1, wd.w2];
    const cm0 = (v('m1') * now.x[0] + v('m2') * now.x[1]) / (v('m1') + v('m2'));
    const shift = cmf ? cm0 - cmAt(TL.tc ?? TL.T / 2) : 0;
    const vals = values(cmf), kv = vScale(vals);
    const ex = mode() === 'explode';
    if (ex && !now.after) spring(c, X(now.x[0] - shift) + (w[0] * k) / 2, X(now.x[1] - shift) - (w[1] * k) / 2, y - 22, true);
    const cxs = [0, 1].map((i) => X(now.x[i] - shift)), vels = [0, 1].map((i) => now.v[i] - (cmf ? TL.vcm : 0));
    const lab = (i) => (P.values ? vtxt(vels[i]) : `v${i + 1}`);
    const ya = y - 7 - 34 - 26, step = clash(cxs, vels.map((q) => q * kv), [lab(0), lab(1)]) ? 15 : 0;
    for (let i = 0; i < 2; i++) {
      const cw = w[i] * k, ch = Math.max(20, Math.min(34, cw * 0.42));
      cart(c, cxs[i], y, cw, ch, COL[i], `${trim(v(i ? 'm2' : 'm1'))} kg`, P.names[i], i && namesClash(cxs) ? 13 : 0);
      velArrow(c, cxs[i], ya - i * step, vels[i] * kv, c[COL[i]], lab(i), vels[i]);
    }
    if (P.cm) cmMark(c, X(cm0 - shift), y + 2);
    if (!TL.hit) note(c, W / 2, 11, 'They never meet: cart 2 is not slower than cart 1.');
    else if (cmf) note(c, W / 2, 11, 'Centre-of-mass frame: the centre of mass stays put.');
  }
  const cmAt = (t) => { const s = TL.at(t); return (v('m1') * s.x[0] + v('m2') * s.x[1]) / (v('m1') + v('m2')); };

  function drawSnapshots(c, W, vals) {
    const rowH = compact ? 104 : 112, kv = vScale(vals), { X, k } = trackMap(W), wd = widths(), w = [wd.w1, wd.w2];
    const ex = mode() === 'explode';
    const rows = before ? ['before'] : ['before', 'after'];
    rows.forEach((row, r) => {
      const y = 6 + r * rowH + rowH - 22;
      rail(c, W, y);
      text(c, row === 'before' ? 'Before' : 'After', 14, y + 11, { color: c.ink2, weight: 650, size: 11.5 });
      const rv = row === 'before' ? vals.ub : vals.va, lab = (i) => (P.values ? vtxt(rv[i]) : `v${i + 1}`);
      // stuck together after a perfectly inelastic collision: one coupled pair, one arrow
      const stuck = !ex && row === 'after' && Math.abs(rv[0] - rv[1]) <= 1e-9 * Math.max(1, Math.abs(rv[0]));
      const pos = (ex && row === 'before') || stuck ? [-w[0] / 2, w[1] / 2] : [-1.9, 1.9];
      if (ex && row === 'before') spring(c, X(pos[0]) + (w[0] * k) / 2, X(pos[1]) - (w[1] * k) / 2, y - 18, true);
      const step = clash(pos.map(X), rv.map((q) => q * kv), [lab(0), lab(1)]) ? 15 : 0;
      for (let i = 0; i < 2; i++) {
        const cx = X(pos[i]), cw = w[i] * k, ch = Math.max(18, Math.min(30, cw * 0.4));
        cart(c, cx, y, cw, ch, COL[i], `${trim(v(i ? 'm2' : 'm1'))} kg`, P.names[i], i && namesClash(pos.map(X)) ? 13 : 0);
        const vel = rv[i];
        if (stuck) {
          if (i === 1) {
            const unk = (P.unknown || []).length > 0;
            if (unk) text(c, '?', X(0), y - 61, { color: c.gold, weight: 700, size: 16, align: 'center' });
            else velArrow(c, X(0), y - 61, vel * kv, c.gold, P.values ? `${vtxt(vel)}, together` : 'v', vel);
          }
          continue;
        }
        const unknown = row === 'after' && (P.unknown || []).includes(`v${i + 1}`);
        const ya = y - 30 - 31 - i * step;
        if (unknown) text(c, '?', cx, ya, { color: c[COL[i]], weight: 700, size: 16, align: 'center' });
        else if (ex && row === 'before' && Math.abs(vel) < 1e-9 && i === 1) text(c, 'both at rest', (cx + X(pos[0])) / 2, y - 76, { color: c.ink2, size: 11.5, align: 'center' });
        else if (!(ex && row === 'before' && Math.abs(vel) < 1e-9)) velArrow(c, cx, ya, vel * kv, c[COL[i]], P.values ? vtxt(vel) : `v${i + 1}`, vel);
      }
    });
  }

  // ─── 2D: the air table ───────────────────────────────────────────────────
  function drawTable(c, W, t, cmf) {
    const pl = table;
    pl.w = W; pl.h = trackH; pl.o.pad = { l: 8, r: 8, t: 8, b: 8 };
    const vals = values(cmf), vmax = Math.max(1e-9, ...vals.ub.map(C.norm), ...vals.va.map(C.norm));
    const kv = (snaps ? 2.1 : 1.5) / vmax;                 // table units per m/s
    const shiftAt = (tt) => (cmf ? cmPos(TL.at(tt).p).map((q, i) => q - cmPos(TL.at(TL.tc ?? TL.T / 2).p)[i]) : [0, 0]);
    const contact = TL.at(TL.tc ?? 0).p;
    // the view: every position the run passes through (straight lines, so the ends and the
    // contact suffice) — or, for snapshots, the pucks at contact and their arrows
    let pts;
    if (snaps) {
      pts = contact.flatMap((q, i) => [[q[0] - R_PUCK, q[1] - R_PUCK], [q[0] + R_PUCK, q[1] + R_PUCK], [q[0] - vals.ub[i][0] * kv, q[1] - vals.ub[i][1] * kv],
        ...(before ? [] : [[q[0] + vals.va[i][0] * kv, q[1] + vals.va[i][1] * kv]])]);
    } else {
      const ts = TL.tc === null ? [0, TL.T] : [0, TL.tc, TL.T];
      const sub = cmf ? TL.vcm : [0, 0];
      pts = ts.flatMap((tt) => { const s = TL.at(tt), sh = shiftAt(tt); return s.p.flatMap((q, i) => [[q[0] - sh[0], q[1] - sh[1]], [q[0] - sh[0] + (s.v[i][0] - sub[0]) * kv, q[1] - sh[1] + (s.v[i][1] - sub[1]) * kv]]); });
    }
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    if (snaps) pl.setView([Math.min(...xs) - 1.5, Math.max(...xs) + 1.5], [Math.min(...ys) - 0.6, Math.max(...ys) + 0.6]);
    else pl.setView([Math.min(...xs, -2) - 0.9, Math.max(...xs, 2) + 0.9 + (P.values ? 1.4 : 0.4)], [Math.min(...ys, -1.2) - 0.9, Math.max(...ys, 1.2) + 0.9]);
    pl.refreshTheme();
    const g = ctx;
    g.save(); g.fillStyle = c.panel; g.globalAlpha = 0.5; g.fillRect(4, 4, W - 8, trackH - 8); g.restore();
    if (snaps) {
      // the moment of contact: incoming arrows (dashed) end at the pucks, outgoing ones start there
      const p = contact;
      if (TL.n) pl.line(p[0][0] - TL.n[0] * 0.9, p[0][1] - TL.n[1] * 0.9, p[1][0] + TL.n[0] * 0.9, p[1][1] + TL.n[1] * 0.9, { color: 'ink3', width: 1.1, dash: [4, 4] });
      for (let i = 0; i < 2; i++) {
        pl.circle(p[i][0], p[i][1], R_PUCK, { fill: COL[i], alpha: 0.8, color: COL[i], width: 1.5 });
        const ui = vals.ub[i], L = C.norm(ui);
        if (L > 1e-9) {
          const tail = [p[i][0] - ui[0] * kv, p[i][1] - ui[1] * kv], right = ui[0] / L > 0.3;
          pl.arrow(tail[0], tail[1], p[i][0] - (ui[0] * R_PUCK) / L, p[i][1] - (ui[1] * R_PUCK) / L, { color: COL[i], width: 2.4, dash: [6, 4] });
          pl.text(P.values ? vtxt(L) : `u${i + 1}`, tail[0], tail[1], { color: pl.color(COL[i]), dx: right ? -6 : 6, dy: -11, align: right ? 'right' : 'left', weight: 600, size: 11.5 });
        }
        pl.text(P.names[i], p[i][0], p[i][1], { color: '#fff', weight: 700, size: 12, align: 'center', halo: false });
      }
      if (!before) {
        if (P.stick) { const q = cmPos(p), w = vals.va[0]; if (C.norm(w) > 1e-9) pl.arrow(q[0], q[1], q[0] + w[0] * kv, q[1] + w[1] * kv, { color: 'gold', width: 2.6, label: P.values ? vtxt(C.norm(w)) : 'v' }); }
        else for (let i = 0; i < 2; i++) {
          const unknown = (P.unknown || []).includes(`v${i + 1}`), vi = vals.va[i];
          if (unknown) pl.text('?', p[i][0] + 0.75, p[i][1] + 0.55 * (i ? -1 : 1), { color: pl.color(COL[i]), weight: 700, size: 16 });
          else if (C.norm(vi) > 1e-9) pl.arrow(p[i][0], p[i][1], p[i][0] + vi[0] * kv, p[i][1] + vi[1] * kv, { color: COL[i], width: 2.6, label: P.values ? vtxt(C.norm(vi)) : `v${i + 1}` });
        }
      }
      return;
    }
    const now = TL.at(t), sh = shiftAt(t);
    // strobe trails: where each puck was at equal time steps
    const N = 26;
    for (let j = 0; j <= N; j++) {
      const tj = (j / N) * TL.T;
      if (tj > t) break;
      const s = TL.at(tj), shj = shiftAt(tj);
      for (let i = 0; i < 2; i++) pl.point(s.p[i][0] - shj[0], s.p[i][1] - shj[1], { color: COL[i], r: 2.2 });
    }
    const together = P.stick && now.after;
    for (let i = 0; i < 2; i++) {
      const q = [now.p[i][0] - sh[0], now.p[i][1] - sh[1]];
      pl.circle(q[0], q[1], R_PUCK, { fill: COL[i], alpha: 0.85, color: COL[i], width: 1.5 });
      pl.text(P.names[i], q[0], q[1], { color: '#fff', weight: 700, size: 12, align: 'center', halo: false });
      const vi = [now.v[i][0] - (cmf ? TL.vcm[0] : 0), now.v[i][1] - (cmf ? TL.vcm[1] : 0)];
      if (!together && C.norm(vi) > 1e-9) pl.arrow(q[0], q[1], q[0] + vi[0] * kv, q[1] + vi[1] * kv, { color: COL[i], width: 2.4, label: P.values ? vtxt(C.norm(vi)) : `v${i + 1}` });
    }
    const q = cmPos(now.p), qs = [q[0] - sh[0], q[1] - sh[1]];
    if (together) { const w = [TL.vcm[0] - (cmf ? TL.vcm[0] : 0), TL.vcm[1] - (cmf ? TL.vcm[1] : 0)]; if (C.norm(w) > 1e-9) pl.arrow(qs[0], qs[1], qs[0] + w[0] * kv, qs[1] + w[1] * kv, { color: 'gold', width: 2.6, label: P.values ? vtxt(C.norm(w)) : 'v' }); }
    if (P.cm) cross(c, pl.X(qs[0]), pl.Y(qs[1]));
    if (!TL.hit) note(c, W / 2, 16, 'A miss: the pucks do not touch.');
    else if (TL.n && (now.after || t >= TL.tc)) {
      const ang = C.angleBetween(vals.va[0], vals.va[1]);
      if (Number.isFinite(ang) && !cmf && !P.stick) note(c, W / 2, 16, `Angle between the paths after: ${Math.round(ang)}°`);
    }
  }
  const cmPos = (p) => { const m1 = v('m1'), m2 = v('m2'); return [(m1 * p[0][0] + m2 * p[1][0]) / (m1 + m2), (m1 * p[0][1] + m2 * p[1][1]) / (m1 + m2)]; };

  // ─── the charts ──────────────────────────────────────────────────────────
  function drawBars(c, W, y0, h, vals) {
    const half = W / 2, gap = 10;
    const charts = bars.map((b) => b);
    const boxes = charts.length === 2 ? [[8, half - gap / 2 - 8], [half + gap / 2, W - half - gap / 2 - 8]] : [[8, W - 16]];
    charts.forEach((kind, i) => {
      const [x, w] = boxes[i];
      if (kind === 'p' && two) vectorChart(c, x, y0 + 4, w, h - 10, vals);
      else if (kind === 'p') barChart(c, x, y0 + 4, w, h - 10, 'momentum p', [vals.pb, vals.pa], true);
      else barChart(c, x, y0 + 4, w, h - 10, 'kinetic energy K', [vals.Kb, vals.Ka], false);
    });
  }

  function barChart(c, x, y, w, h, title, [b0, a0], signed) {
    const g = ctx;
    // big numbers: show them in thousands (or millions), and say so in the title
    const big = Math.max(...b0.map(Math.abs), ...a0.map(Math.abs), Math.abs(b0[0] + b0[1]), Math.abs(a0[0] + a0[1]));
    const f = big >= 1e7 ? 1e6 : big >= 1e4 ? 1e3 : 1;
    const b = b0.map((q) => q / f), a = a0.map((q) => q / f);
    const unit = signed ? (f === 1 ? 'kg·m/s' : f === 1e3 ? '10³ kg·m/s' : '10⁶ kg·m/s') : f === 1 ? 'J' : f === 1e3 ? 'kJ' : 'MJ';
    text(c, `${title} (${unit})`, x, y + 7, { color: c.ink2, size: 11.5, weight: 600 });
    const rows = [['before'], [P.names[0], b[0], COL[0]], [P.names[1], b[1], COL[1]], ['total', b[0] + b[1], 'gold'],
      ['after'], [P.names[0], a[0], COL[0]], [P.names[1], a[1], COL[1]], ['total', a[0] + a[1], 'gold']];
    const data = rows.filter((r) => r.length > 1);
    g.save(); g.font = '650 10.5px Inter, system-ui, sans-serif';
    const need = Math.max(...data.map((r) => g.measureText(r[0]).width));
    g.font = '500 10px Inter, system-ui, sans-serif';
    const valW = P.values ? Math.max(...data.map((r) => g.measureText(fmt2(r[1])).width)) + 8 : 3;
    const K0 = b[0] + b[1], K1 = a[0] + a[1], lost = !signed && K0 - K1 > 0.01 * Math.max(K0, 1e-9);
    const lostW = lost ? g.measureText(`lost ${fmt2(K0 - K1)}`).width + 8 : 0;
    g.restore();
    const lw = Math.max(34, Math.min(w * 0.42, need + 12)), bx = x + lw, bw = w - lw - 6;
    const top = y + 17, rh = (h - 19) / 8;
    const max = Math.max(1e-9, ...data.map((r) => Math.abs(r[1])));
    const z = signed ? bx + bw / 2 : bx;
    const scale = Math.max(4, signed ? bw / 2 - valW : bw - Math.max(valW, lostW)) / max;
    g.save();
    g.strokeStyle = c.line3; g.lineWidth = 1;
    for (const k0 of [1, 5]) { g.beginPath(); g.moveTo(Math.round(z) + 0.5, top + k0 * rh); g.lineTo(Math.round(z) + 0.5, top + (k0 + 3) * rh); g.stroke(); }
    rows.forEach(([name, val, col], k) => {
      const ry = top + k * rh;
      if (val === undefined) { text(c, name, x, ry + rh / 2 + 1, { color: c.ink3, size: 10.5 }); return; }
      text(c, name, bx - 6, ry + rh / 2, { color: col === 'gold' ? c.gold : c[col], size: 10.5, weight: 650, align: 'right' });
      const len = val * scale;
      g.fillStyle = c[col]; g.globalAlpha = name === 'total' ? 0.9 : 0.75;
      const bh = Math.max(5, rh - 4);
      if (Math.abs(len) > 0.4) g.fillRect(len >= 0 ? z : z + len, ry + (rh - bh) / 2, Math.abs(len), bh);
      g.globalAlpha = 1;
      // the after-total of a lossy collision is labelled by its "lost" note instead
      if (P.values && !(lost && k === 7)) {
        const tx = signed ? (len >= 0 ? z + len + 4 : z + len - 4) : z + Math.max(0, len) + 4;
        text(c, fmt2(val), tx, ry + rh / 2, { color: c.ink2, size: 10, align: signed && len < 0 ? 'right' : 'left' });
      }
    });
    // kinetic energy lost in the interaction: a dashed box from what is left to what there was
    if (lost) {
      const ry = top + 7 * rh, bh = Math.max(5, rh - 4);
      g.strokeStyle = c.bad; g.setLineDash([3, 3]); g.lineWidth = 1.3;
      g.strokeRect(z + K1 * scale, ry + (rh - bh) / 2, (K0 - K1) * scale, bh);
      g.setLineDash([]);
      text(c, `lost ${fmt2(K0 - K1)}`, z + K0 * scale + 4, ry + rh / 2, { color: c.bad, size: 10, weight: 600 });
    }
    g.restore();
  }

  // 2D momentum: the two momenta tip to tail, and their sum, before and after, on one scale
  function vectorChart(c, x, y, w, h, vals) {
    text(c, 'momentum vectors (tip to tail)', x, y + 7, { color: c.ink2, size: 11.5, weight: 600 });
    const sets = [vals.pb, vals.pa];
    const pts = sets.flatMap(([p1, p2]) => [[0, 0], p1, [p1[0] + p2[0], p1[1] + p2[1]]]);
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const ex = [Math.min(...xs), Math.max(...xs)], ey = [Math.min(...ys), Math.max(...ys)];
    const subW = (w - 8) / 2, subH = h - 34;
    const s = Math.min((subW - 26) / Math.max(1e-9, ex[1] - ex[0]), (subH - 8) / Math.max(1e-9, ey[1] - ey[0]));
    sets.forEach(([p1, p2], k) => {
      const ox = x + k * (subW + 8) + (subW - (ex[1] - ex[0]) * s) / 2 - ex[0] * s, oy = y + 26 + (subH - (ey[1] - ey[0]) * s) / 2 + ey[1] * s;
      const Pt = (q) => [ox + q[0] * s, oy - q[1] * s];
      text(c, k ? 'after' : 'before', x + k * (subW + 8), y + 22, { color: c.ink3, size: 10.5 });
      const o = Pt([0, 0]), a = Pt(p1), b = Pt([p1[0] + p2[0], p1[1] + p2[1]]);
      arrowPx(c, o, a, c[COL[0]], 2.2);
      arrowPx(c, a, b, c[COL[1]], 2.2);
      arrowPx(c, o, b, c.gold, 2.6, true);
    });
  }

  function readout(vals, cmf) {
    const rows = [];
    const sum = (q) => (two ? [q[0][0] + q[1][0], q[0][1] + q[1][1]] : q[0] + q[1]);
    const Pb = sum(vals.pb), Pa = sum(vals.pa);
    const pr = (q) => (two ? texv(C.norm(q), 'kg\\,m/s') : texv(q, 'kg\\,m/s'));
    rows.push([`total momentum before${two ? ' (size)' : ''}`, pr(Pb)]);
    if (!before) rows.push(['after', pr(Pa)]);
    const Kb = vals.Kb[0] + vals.Kb[1], Ka = vals.Ka[0] + vals.Ka[1];
    rows.push(['kinetic energy before', texv(Kb, 'J')]);
    if (!before) {
      rows.push(['after', texv(Ka, 'J')]);
      if (Kb - Ka > 1e-6) rows.push(['lost', `${texv(Kb - Ka, 'J')}\\ (${trim((100 * (Kb - Ka)) / Math.max(Kb, 1e-12), 3)}\\%)`]);
      else if (Ka - Kb > 1e-6) rows.push(['released', texv(Ka - Kb, 'J')]);
    }
    if (!two && TL.hit && !before && mode() === 'collide') rows.push(['$e$ = separation ÷ approach', trim(C.restitution(TL.u[0], TL.u[1], TL.v1, TL.v2), 3)]);
    if (cmf) rows.push(['frame', '\\text{centre of mass}']);
    F.readout(rows);
  }

  // ─── drawing helpers (pixels) ────────────────────────────────────────────
  function rail(c, W, y) {
    ctx.save(); ctx.strokeStyle = c.line3; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(W - 8, y); ctx.stroke(); ctx.restore();
  }
  function cart(c, cx, y, cw, ch, col, mass, name, lift = 0) {
    const g = ctx;
    g.save();
    g.fillStyle = c[col]; g.globalAlpha = 0.9;
    roundRect(g, cx - cw / 2, y - ch - 7, cw, ch, 5); g.fill();
    g.globalAlpha = 1;
    g.fillStyle = c.panel; g.strokeStyle = c.ink2; g.lineWidth = 1.2;
    for (const wx of [-cw * 0.3, cw * 0.3]) { g.beginPath(); g.arc(cx + wx, y - 4, 3.6, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
    text(c, mass, cx, y - 7 - ch / 2, { color: '#fff', size: cw > 64 ? 11.5 : 10, weight: 650, align: 'center', halo: false });
    text(c, name, cx, y - ch - 16 - lift, { color: c[col], size: 11, weight: 700, align: 'center' });
  }
  // do the two carts' names, centred above them, run into each other?
  function namesClash(xs) {
    ctx.save(); ctx.font = '700 11px Inter, system-ui, sans-serif';
    const w = P.names.map((n) => ctx.measureText(n).width);
    ctx.restore();
    return Math.abs(xs[1] - xs[0]) < (w[0] + w[1]) / 2 + 6;
  }
  function spring(c, x0, x1, y, compressed) {
    const g = ctx, n = 8, amp = compressed ? 6 : 3;
    if (x1 - x0 < 2) { g.save(); g.fillStyle = c.good; g.fillRect(x0 - 2, y - 8, 4, 16); g.restore(); return; }
    g.save(); g.strokeStyle = c.good; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x0, y);
    for (let k = 1; k < n; k++) g.lineTo(x0 + ((x1 - x0) * k) / n, y + (k % 2 ? -amp : amp));
    g.lineTo(x1, y); g.stroke(); g.restore();
  }
  function velArrow(c, x, y, len, color, label, vel) {
    if (Math.abs(vel) < 1e-9) { text(c, P.values ? 'at rest' : label, x, y, { color, size: 11, align: 'center' }); return; }
    if (Math.abs(len) < 10) len = 10 * Math.sign(len || vel);
    arrowPx(c, [x, y], [x + len, y], color, 2.4);
    text(c, label, len > 0 ? x + len + 5 : x + len - 5, y, { color, size: 11, weight: 600, align: len > 0 ? 'left' : 'right' });
  }
  // would two velocity labels on one row overlap? (arrows start at the cart centres; labels follow the tips)
  function clash(xs, lens, labels) {
    ctx.save(); ctx.font = '600 11px Inter, system-ui, sans-serif';
    const box = xs.map((x, i) => { const L = Math.abs(lens[i]) < 10 ? 10 * Math.sign(lens[i] || 1) : lens[i], tw = ctx.measureText(labels[i]).width + 8; return L >= 0 ? [Math.min(x, x + L), x + L + tw] : [x + L - tw, Math.max(x, x + L)]; });
    ctx.restore();
    return box[0][1] > box[1][0] - 4 && box[1][1] > box[0][0] - 4;
  }
  function cmMark(c, x, y) {
    const g = ctx;
    g.save(); g.fillStyle = c.gold;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 10); g.lineTo(x + 6, y + 10); g.closePath(); g.fill(); g.restore();
    text(c, 'CM', x + 9, y + 7, { color: c.gold, size: 10.5, weight: 650 });
  }
  function cross(c, x, y) {
    const g = ctx;
    g.save(); g.strokeStyle = c.gold; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 6); g.moveTo(x - 6, y + 6); g.lineTo(x + 6, y - 6); g.stroke(); g.restore();
    text(c, 'CM', x + 9, y - 9, { color: c.gold, size: 10.5, weight: 650 });
  }
  function note(c, x, y, s) { text(c, s, x, y, { color: c.ink2, size: 11.5, align: 'center' }); }
  function arrowPx(c, a, b, color, width = 2.2, dashed = false) {
    const g = ctx, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1) return;
    const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len, hd = Math.min(9, len * 0.45);
    g.save(); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = width; g.lineCap = 'round';
    if (dashed) g.setLineDash([5, 3]);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0] - ux * hd * 0.6, b[1] - uy * hd * 0.6); g.stroke();
    g.setLineDash([]);
    g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[0] - ux * hd - uy * hd * 0.5, b[1] - uy * hd + ux * hd * 0.5); g.lineTo(b[0] - ux * hd + uy * hd * 0.5, b[1] - uy * hd - ux * hd * 0.5); g.closePath(); g.fill();
    g.restore();
  }
  function text(c, s, x, y, o = {}) {
    const g = ctx;
    g.save();
    g.font = `${o.weight || 500} ${o.size || 12}px Inter, system-ui, sans-serif`;
    g.textAlign = o.align || 'left'; g.textBaseline = 'middle';
    if (o.halo !== false) { g.lineWidth = 3; g.strokeStyle = c.bg; g.globalAlpha = 0.85; g.strokeText(s, x, y); g.globalAlpha = 1; }
    g.fillStyle = o.color || c.ink;
    g.fillText(s, x, y);
    g.restore();
  }

  F.draw(draw);
  F.caption(two
    ? 'Seen from above. Frictionless pucks of equal size; the collision is instantaneous and pushes only along the line joining their centres. The picture is zoomed to fit; the arrows share one scale.'
    : mode() === 'explode'
      ? 'A frictionless track; the spring’s push is treated as instantaneous. The picture is zoomed to fit, not to scale; the arrows share one scale.'
      : 'A frictionless track; the collision is treated as instantaneous, so no outside force acts on the pair while it lasts. The picture is zoomed to fit, not to scale; the arrows share one scale.');
  return { get: (k) => (F.params[k] !== undefined ? F.params[k] : P[k]) };
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const p = [];
  if (![1, 2].includes(P.dim)) p.push('dim must be 1 or 2');
  if (!['collide', 'explode'].includes(P.mode)) p.push(`unknown mode “${P.mode}”`);
  if (P.dim === 2 && P.mode === 'explode') p.push('explode is a 1D mode');
  if (!['play', 'snapshots'].includes(P.view)) p.push(`unknown view “${P.view}”`);
  if (!['both', 'before'].includes(P.show)) p.push(`show must be 'both' or 'before'`);
  for (const k of ['m1', 'm2']) if (!(P[k] > 0)) p.push(`${k} must be positive`);
  if (!(P.e >= 0 && P.e <= 1)) p.push('e must lie in [0, 1]');
  if (P.dim === 2 && !(Math.abs(P.b) < 1)) p.push('b must lie strictly between −1 and 1 (|b| ≥ 1 is a miss)');
  if (!Array.isArray(P.bars) || P.bars.some((b) => !['p', 'K'].includes(b))) p.push("bars must be a list of 'p' and 'K'");
  if (!Array.isArray(P.names) || P.names.length !== 2) p.push('names must name both bodies');
  for (const u of P.unknown || []) if (!['v1', 'v2'].includes(u)) p.push(`unknown entries are 'v1' or 'v2', not “${u}”`);
  if (P.after) {
    if (P.dim !== 1 || !Array.isArray(P.after) || P.after.length !== 2) p.push('after is [v1, v2] for a 1D run');
    else {
      const ex = P.mode === 'explode';
      const before = ex ? (P.m1 + P.m2) * P.u : P.m1 * P.u1 + P.m2 * P.u2;
      const after = P.m1 * P.after[0] + P.m2 * P.after[1];
      if (Math.abs(before - after) > 1e-6 * Math.max(1, Math.abs(before))) p.push(`after does not conserve momentum (${before} before, ${after} after)`);
      const K0 = ex ? 0.5 * (P.m1 + P.m2) * P.u * P.u : C.kinetic(P.m1, P.u1) + C.kinetic(P.m2, P.u2);
      if (!ex && C.kinetic(P.m1, P.after[0]) + C.kinetic(P.m2, P.after[1]) > K0 * (1 + 1e-9) + 1e-9) p.push('after has more kinetic energy than before: no collision does that');
      if (P.sliders) p.push('after fixes the outcome, so it cannot be combined with sliders');
    }
  }
  const keys = P.sliders === true ? (P.dim === 2 ? USUAL.d2 : USUAL[P.mode] || USUAL.collide) : P.sliders || [];
  {
    for (const k of keys) {
      const key = typeof k === 'string' ? k : k.key;
      if (!KEYS.includes(key)) { p.push(`unknown slider “${key}”`); continue; }
      const d = { ...sliderDef(key, P), ...(typeof k === 'object' ? k : {}) };
      const val = typeof k === 'object' && k.value !== undefined ? k.value : P[key];
      if (!(val >= d.min && val <= d.max)) p.push(`slider ${key}: value ${val} outside [${d.min}, ${d.max}]`);
    }
  }
  return p;
}
