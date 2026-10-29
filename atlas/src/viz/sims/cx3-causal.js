// Causality is where the poles are. A response χ(ω) built from mirror pairs
// of poles (a + ib and −a + ib) is drawn three ways:
//   w    the complex ω-plane: the poles (the first pair draggable), and the
//        contour that inverts the Fourier transform at the probe time t —
//        the real line closed by a big semicircle in the half-plane where
//        e^{−iωt} dies: below for t > 0, above for t < 0. The enclosed
//        half-plane is shaded and its poles ringed;
//   t    the response G(t) to a kick at t = 0, from the residues, with the
//        probe time marked: poles below the axis ring down after the kick,
//        poles above make a response *before* it;
//   chi  Re χ and Im χ along the real ω axis, with the Kramers–Kronig
//        reconstruction of Re χ from Im χ dashed over it — on top of Re χ
//        exactly when every pole is below the axis, and wrong as soon as one
//        crosses.
// The mathematics lives in model/cx3-causal.js (test/cx3-causal.test.mjs).
//
//   { type: 'cx3-causal', params: {
//       poles: [{ re: 1, im: -0.15, amp: 1 }],   // each a mirror pair ±re + i·im (re > 0, im ≠ 0)
//       drag: true, snap: 0.05,          // drag the first pair (by its right-hand pole)
//       t: 4, T: [-12, 24],              // the probe time (a slider when showT) and the time window
//       showT: true,
//       panels: ['w', 't', 'chi'],       // any of these, in this order
//       window: { re: [-2, 2], im: [-1.2, 1.2] },   // the ω-plane's view (equal scales)
//       W: [-3, 3],                      // the χ panel's frequency range
//       arc: true,                       // the closing semicircle for the probe time
//       kk: true,                        // the Kramers–Kronig reconstruction, dashed
//       names: { w: 'ω', G: 'G(t)', t: 't' },   // plain-text axis names (e.g. { w: 'Mω', t: 't/M', G: 'h(t)' })
//       readout: true,                   // or false, or a list: 'G' 'half' 'causal' 'pole'
//       labels: true,                    // canvas labels ("kick", "rings down", …)
//   } }
//
// A point item reads the first pair's right-hand pole as { x: re, y: im }.

import { Plot } from '../plot.js';
import * as M from '../model/cx3-causal.js';

export const defaults = {
  poles: [{ re: 1, im: -0.15, amp: 1 }], drag: true, snap: 0.05, t: 4, T: [-12, 24], showT: true,
  panels: ['w', 't', 'chi'], window: { re: [-2, 2], im: [-1.2, 1.2] }, W: [-3, 3], arc: true, kk: true,
  names: { w: 'ω', G: 'G(t)', t: 't' }, readout: true, labels: true,
};
const PANELS = ['w', 't', 'chi'];
const n3 = (x) => (Math.abs(x) < 5e-4 ? '0' : String(+x.toPrecision(3)));

export function mount(F, P) {
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const panels = PANELS.filter((p) => P.panels.includes(p));
  const names = { ...defaults.names, ...(P.names || {}) };
  const hasW = panels.includes('w'), side = panels.filter((p) => p !== 'w');
  const wide = !narrow && hasW && side.length > 0;
  const { canvas, box } = F.canvas({ aspect: wide ? 'wide' : '', label: P.alt || 'Poles in the complex frequency plane beside the response they make in time' });
  if (!wide && panels.length > 1) box.style.aspectRatio = panels.length === 3 ? '3 / 4' : '4 / 3';
  const plots = {};
  for (const p of panels) plots[p] = new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: p === 'w', grid: false, axes: false });

  let poles = M.tidy(P.poles);
  if (P.showT) F.slider({ key: 't', label: `probe time $${names.t}$`, min: P.T[0], max: P.T[1], step: (P.T[1] - P.T[0]) / 200, value: P.t, explain: 'The moment at which the response is read. Its sign decides which half-plane the contour closes in.' });
  else F.params.t = P.t;
  const pw = plots.w;
  const snap = (v) => (P.snap ? Math.round(v / P.snap) * P.snap : v);
  if (P.drag && pw) {
    pw.handle(() => [poles[0].re, poles[0].im], (x, y) => {
      poles = M.tidy([{ ...poles[0], re: snap(Math.max(0.05, Math.min(pw.vx1, x))), im: snap(Math.max(pw.vy0, Math.min(pw.vy1, y))) }, ...poles.slice(1)]);
    }, { hollow: true, label: 'pole' });
    pw.onDrag = () => { draw(); F.notify('point'); };
  }
  F.onChange(() => draw());

  function layout() {
    const any = plots[panels[0]];
    any.resize();
    const w = any.w, h = any.h;
    const pad = { l: 34, r: 10, t: 22, b: 22 };
    if (wide) {
      const cut = w * 0.44;
      plots.w.o.pad = { ...pad, r: w - cut + 6 };
      side.forEach((p, k) => { const top = (h * k) / side.length, bot = (h * (k + 1)) / side.length; plots[p].o.pad = { ...pad, l: cut + 40, t: top + 22, b: h - bot + 20 }; });
    } else {
      const share = { w: hasW ? (panels.length === 1 ? 1 : 0.46) : 0 };
      const rest = (1 - share.w) / Math.max(1, side.length);
      let y = 0;
      for (const p of panels) { const f = p === 'w' ? share.w : rest; plots[p].o.pad = { ...pad, t: y * h + 22, b: h - (y + f) * h + 20 }; y += f; }
    }
    for (const p of panels) { plots[p].resize(); plots[p]._fit(); plots[p].refreshTheme(); }
  }
  const frame = (plot, title) => {
    const g = plot.ctx;
    g.save(); g.strokeStyle = plot.col.line2; g.lineWidth = 1; g.strokeRect(plot.L - 0.5, plot.T - 0.5, plot.R - plot.L + 1, plot.B - plot.T + 1); g.restore();
    if (title) plot.text(title, plot.L + 2, plot.T - 11, { screen: true, color: 'ink2', weight: 650, size: 12 });
  };
  const cross = (plot, x, y, color, ring) => {
    const g = plot.ctx, X = plot.X(x), Y = plot.Y(y), s = 6;
    g.save(); g.strokeStyle = plot.color(color); g.lineWidth = 2.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(X - s, Y - s); g.lineTo(X + s, Y + s); g.moveTo(X - s, Y + s); g.lineTo(X + s, Y - s); g.stroke();
    if (ring) { g.lineWidth = 1.8; g.strokeStyle = plot.color('gold'); g.beginPath(); g.arc(X, Y, 11, 0, 2 * Math.PI); g.stroke(); }
    g.restore();
  };
  const clipIn = (plot) => { const g = plot.ctx; g.save(); g.beginPath(); g.rect(plot.L, plot.T, plot.R - plot.L, plot.B - plot.T); g.clip(); };

  function draw() {
    layout();
    const any = plots[panels[0]], g = any.ctx;
    g.clearRect(0, 0, any.w, any.h);
    const t = +F.params.t, lowerHalf = t > 0, isCausal = M.causal(poles);

    if (pw) {
      pw.setView(P.window.re, P.window.im);
      pw.grid();
      frame(pw, `complex ${names.w}-plane`);
      clipIn(pw);
      // the half-plane the contour closes in, and the contour
      if (P.arc && t !== 0) {
        pw.ctx.save(); pw.ctx.fillStyle = pw.color('gold'); pw.ctx.globalAlpha = 0.09;
        const y0 = pw.Y(0);
        if (lowerHalf) pw.ctx.fillRect(pw.L, y0, pw.R - pw.L, pw.B - y0); else pw.ctx.fillRect(pw.L, pw.T, pw.R - pw.L, y0 - pw.T);
        pw.ctx.restore();
        const rA = 0.92 * Math.min(pw.vx1, pw.vx1 - pw.vx0, lowerHalf ? -pw.vy0 : pw.vy1) || 1;
        pw.line(-rA, 0, rA, 0, { color: 'gold', width: 2.6 });
        pw.curve((s) => rA * Math.cos(s), (s) => rA * Math.sin(s), 0, lowerHalf ? -Math.PI : Math.PI, { color: 'gold', width: 2.2, dash: [6, 4] });
        // direction: along the real axis left to right
        pw.arrow(-0.12 * rA, 0, 0.12 * rA, 0, { color: 'gold', width: 2.6, head: 11 });
      }
      pw.line(pw.vx0, 0, pw.vx1, 0, { color: 'ink3', width: 1.2 });
      pw.line(0, pw.vy0, 0, pw.vy1, { color: 'ink3', width: 1.2 });
      if (P.labels) {
        pw.text(`Re ${names.w}`, pw.R - 4, pw.Y(0) - 10, { screen: true, align: 'right', color: 'ink3', size: 11 });
        pw.text(lowerHalf ? 't > 0: close below' : t < 0 ? 't < 0: close above' : '', pw.L + 6, lowerHalf ? pw.B - 12 : pw.T + 12, { screen: true, color: 'gold', weight: 650, size: 11.5 });
      }
      for (const q of poles) for (const x of [q.re, -q.re]) cross(pw, x, q.im, q.im < 0 ? 'accent' : 'bad', P.arc && t !== 0 && (q.im < 0) === lowerHalf);
      pw.ctx.restore();
      pw.drawHandles();
    }

    const pt = plots.t;
    if (pt) {
      const N = 600, ts = [], gs = [];
      let m = 1e-9;
      for (let k = 0; k <= N; k++) { const s = P.T[0] + ((P.T[1] - P.T[0]) * k) / N; const v = M.G(s, poles); ts.push(s); gs.push(v); m = Math.max(m, Math.abs(v)); }
      pt.setView(P.T, [-1.15 * m, 1.15 * m]);
      pt.o.xticks = 6; pt.o.yticks = 0;
      pt.grid();
      frame(pt, `response ${names.G} to a kick at t = 0`);
      clipIn(pt);
      pt.line(P.T[0], 0, P.T[1], 0, { color: 'ink3', width: 1 });
      pt.line(0, -1.15 * m, 0, 1.15 * m, { color: 'ink3', width: 1, dash: [4, 4] });
      pt.path(ts.map((s, k) => [s, gs[k]]), { color: isCausal ? 'accent' : 'bad', width: 2.2 });
      pt.line(t, -1.15 * m, t, 1.15 * m, { color: 'gold', width: 1.6 });
      pt.point(t, M.G(t, poles), { color: 'gold', r: 4.5 });
      if (P.labels) pt.text('kick', 0, 1.15 * m, { dx: 5, dy: 10, color: 'ink3', size: 11 });
      pt.ctx.restore();
      // time ticks along the bottom
      for (const v of Plot.ticks(P.T[0], P.T[1], 6)) pt.text(String(v).replace('-', '−'), pt.X(v), pt.B + 10, { screen: true, align: 'center', color: 'ink3', size: 10.5 });
    }

    const pc = plots.chi;
    if (pc) {
      const N = 500, ws = [];
      let lo = 0, hi = 0;
      for (let k = 0; k <= N; k++) {
        const w = P.W[0] + ((P.W[1] - P.W[0]) * k) / N, c = M.chi([w, 0], poles), kk = M.kkReal(w, poles);
        ws.push([w, c[0], c[1], kk]);
        for (const v of [c[0], c[1], ...(P.kk ? [kk] : [])]) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      }
      const pad = 0.08 * (hi - lo || 1);
      pc.setView(P.W, [lo - pad, hi + pad]);
      pc.grid();
      frame(pc, `χ along the real ${names.w} axis`);
      clipIn(pc);
      pc.line(P.W[0], 0, P.W[1], 0, { color: 'ink3', width: 1 });
      pc.path(ws.map((r) => [r[0], r[2]]), { color: 'violet', width: 2 });
      pc.path(ws.map((r) => [r[0], r[1]]), { color: 'accent', width: 2.2 });
      if (P.kk) pc.path(ws.map((r) => [r[0], r[3]]), { color: 'gold', width: 2, dash: [6, 5] });
      pc.ctx.restore();
      if (P.labels) {
        const x = pc.R - 6;
        pc.text('Re χ', x, pc.T + 10, { screen: true, align: 'right', color: 'accent', weight: 650, size: 11.5 });
        pc.text('Im χ', x, pc.T + 25, { screen: true, align: 'right', color: 'violet', weight: 650, size: 11.5 });
        if (P.kk) pc.text('Re χ rebuilt by Kramers–Kronig', x, pc.T + 40, { screen: true, align: 'right', color: 'gold', weight: 650, size: 11.5 });
      }
      for (const v of Plot.ticks(P.W[0], P.W[1], 6)) pc.text(String(v).replace('-', '−'), pc.X(v), pc.B + 10, { screen: true, align: 'center', color: 'ink3', size: 10.5 });
    }

    if (P.readout) {
      const want = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
      const q = poles[0];
      F.readout([
        want('pole') && [`pole $${names.w.replace('ω', '\\omega ')}$`, `${n3(q.re)} ${q.im < 0 ? '-' : '+'} ${n3(Math.abs(q.im))}i`],
        want('G') && [`$G(t)$ at $t = ${n3(t)}$`, n3(M.G(t, poles))],
        want('half') && ['contour closes', t > 0 ? '\\text{below}' : t < 0 ? '\\text{above}' : '\\text{—}'],
        want('causal') && ['causal?', isCausal ? '\\text{yes}' : '\\text{no}'],
      ]);
    }
  }
  F.draw(draw);
  return { get: (k) => (k === 'point' ? { x: poles[0].re, y: poles[0].im } : undefined) };
}

export function validate(P) {
  const out = [];
  if (!Array.isArray(P.poles) || !P.poles.length) out.push('cx3-causal poles must be a non-empty list');
  else for (const q of P.poles) if (!Number.isFinite(+q.re) || !Number.isFinite(+q.im) || !(+q.re > 0) || +q.im === 0) out.push('cx3-causal poles need re > 0 and im ≠ 0');
  if (!Array.isArray(P.panels) || !P.panels.length || P.panels.some((p) => !PANELS.includes(p))) out.push('cx3-causal panels: any of w, t, chi');
  if (!Array.isArray(P.T) || !(P.T[0] < 0 && P.T[1] > 0)) out.push('cx3-causal T must be [min < 0, max > 0]');
  if (!(P.t >= P.T?.[0] && P.t <= P.T?.[1])) out.push('cx3-causal t must lie in T');
  if (!Array.isArray(P.W) || !(P.W[0] < P.W[1])) out.push('cx3-causal W must be [min, max]');
  const w = P.window || {};
  if (!Array.isArray(w.re) || !Array.isArray(w.im) || !(w.re[0] < w.re[1]) || !(w.im[0] < 0 && w.im[1] > 0)) out.push('cx3-causal window needs re and im ranges, im straddling 0');
  if (Array.isArray(P.readout)) for (const r of P.readout) if (!['G', 'half', 'causal', 'pole'].includes(r)) out.push(`cx3-causal readout: unknown entry “${r}”`);
  for (const [k, v] of Object.entries(P.names || {})) if (/[$\\_^]/.test(String(v))) out.push(`cx3-causal names.${k} is plain text (no TeX)`);
  return out;
}
