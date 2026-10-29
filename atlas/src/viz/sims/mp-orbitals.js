// Hydrogen's orbitals, ψₙₗₘ = Rₙₗ(r) Yₗₘ(θ, φ), in three views. Left: the
// probability cloud as a slice through the nucleus in a vertical plane
// containing the z-axis (brightness ∝ |ψ|^½, so faint outer shells stay
// visible; real orbitals coloured by the sign of ψ). Middle: the angular
// factor alone as a polar plot — the distance from the centre in each
// direction is |Yₗₘ|² (for a real orbital, its square, coloured by sign).
// Below: the radial probability P(r) = r²Rₙₗ², with the most probable radius,
// ⟨r⟩ and (optionally) Bohr's orbit radius n²a₀ marked. States of definite m
// (the physicist's, axially symmetric about z) or the real orbitals chemists
// draw (px, dxy …: mixtures of +m and −m). Physics in model/mp-orbitals.js
// (tested in test/mp-orbitals.test.mjs).
//
//   { type: 'mp-orbitals', params: {
//       n: 2, l: 1, m: 0,      // quantum numbers: n 1–5, l 0…n−1, m −l…l
//       real: false,           // the real orbitals (px, py, dxy …) instead of states of definite m
//       panels: null,          // any of 'cloud', 'angular', 'radial' (default: all three)
//       sign: true,            // real orbitals: colour by the sign of ψ (blue +, orange −)
//       marks: ['peak', 'mean'],   // on P(r): any of peak (most probable r), mean (⟨r⟩), bohr (n²a₀), nodes
//       range: null,           // the cloud's half-width in a₀ (default: a circle holding 99% of the probability)
//       rmax: null,            // the r-axis limit of P(r), in a₀
//       controls: null,        // true, false, or a list of: n l m real
//       readout: true,
//       hide: [],              // any of: name, energy, L, nodes, radii — their readouts show "?"; name also blanks the cloud's title
//   } }

import { Plot, themeColors } from '../plot.js';
import * as O from '../model/mp-orbitals.js';

export const defaults = { n: 2, l: 1, m: 0, real: false, panels: null, sign: true, marks: ['peak', 'mean'], range: null, rmax: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['n', 'l', 'm', 'real'];
const PANELS = ['cloud', 'angular', 'radial'];
const MARKS = ['peak', 'mean', 'bohr', 'nodes'];
const HIDE = ['name', 'energy', 'L', 'nodes', 'radii'];
const NTOP = 5;

function rgbOf(css) {
  const s = String(css).trim();
  let m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) return m[1].split('').map((c) => parseInt(c + c, 16));
  m = /^#([0-9a-f]{6})/i.exec(s);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = /rgba?\(([^)]+)\)/i.exec(s);
  if (m) return m[1].split(',').slice(0, 3).map((v) => +v.trim());
  return [92, 157, 255];
}
const sqrtTeX = (q) => { const r = Math.round(Math.sqrt(q)); return r * r === q ? String(r) : `\\sqrt{${q}}`; };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('n', () => F.slider({ key: 'n', label: 'Principal $n$', min: 1, max: NTOP, step: 1, value: P.n, explain: 'Sets the energy, $E_n = -13.6\\ \\text{eV}/n^2$, and the size: $\\langle r\\rangle$ grows as $n^2$.' }));
  ctl('l', () => F.slider({ key: 'l', label: 'Orbital $l$', min: 0, max: NTOP - 1, step: 1, value: P.l, explain: 'Sets the angular momentum $|\\vec L| = \\sqrt{l(l+1)}\\,\\hbar$ and the shape; allowed $0 \\le l \\le n-1$.' }));
  ctl('m', () => F.slider({ key: 'm', label: 'Magnetic $m_l$', min: -(NTOP - 1), max: NTOP - 1, step: 1, value: P.m, explain: 'Sets $L_z = m_l\\hbar$, the tilt of the angular momentum; allowed $-l \\le m_l \\le l$.' }));
  ctl('real', () => F.toggle({ key: 'real', label: 'Real orbitals (as chemists draw them)', value: P.real, explain: '$p_x$, $d_{xy}$ … mix $+m_l$ with $-m_l$: definite shapes, but no definite $L_z$.' }));

  const panels = Array.isArray(P.panels) ? P.panels : PANELS;
  const top = panels.includes('cloud') || panels.includes('angular') ? F.canvas({ aspect: 'wide', label: P.alt || 'A hydrogen orbital: its probability cloud and its angular shape' }) : null;
  const bot = panels.includes('radial') ? F.canvas({ aspect: 'wide', label: 'The radial probability density P(r)' }) : null;
  const pr = bot ? new Plot(bot.canvas, { x: [0, 10], y: [0, 1], xlabel: 'distance from the nucleus r (a₀)', ylabel: 'P(r) (per a₀)' }) : null;
  const ctx = top ? top.canvas.getContext('2d') : null;
  const off = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  let cloudKey = '';

  const qn = () => O.clampQN(F.params.n, F.params.l, F.params.m);
  F.onChange((k) => {
    // keep l and m inside their ranges
    const { n, l, m } = qn();
    if (wanted.includes('l') && Math.round(F.params.l) !== l) { F.set('l', l); return; }
    if (wanted.includes('m') && Math.round(F.params.m) !== m) { F.set('m', m); return; }
    if (k) draw();
    void n;
  });

  function drawTop(C, S, real) {
    if (!top) return;
    const W = top.canvas.clientWidth || 600, H = top.canvas.clientHeight || 300, dpr = Math.min(2, devicePixelRatio || 1);
    if (top.canvas.width !== Math.round(W * dpr) || top.canvas.height !== Math.round(H * dpr)) { top.canvas.width = Math.round(W * dpr); top.canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const narrow = W < 520, fs = narrow ? 10 : 11.5;
    const both = panels.includes('cloud') && panels.includes('angular');
    const side = Math.min(both ? W / 2 - 12 : W - 24, H - 34);
    const boxes = both ? [[W / 4 - side / 2, 'cloud'], [(3 * W) / 4 - side / 2, 'angular']] : [[W / 2 - side / 2, panels.includes('cloud') ? 'cloud' : 'angular']];
    const y0 = 22;
    const txt = (s, x, y, o = {}) => {
      ctx.save(); ctx.font = `${o.w || 600} ${o.size || fs}px Inter, system-ui, sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1;
      ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y); ctx.restore();
    };
    const { n, l, m } = S;
    const name = real ? O.realName(n, l, m) : `${n}${O.letter(l)}, m = ${m}`;
    const plane = O.slicePhi(m, real), hor = plane === 0 ? 'x' : Math.abs(plane - Math.PI / 2) < 1e-9 ? 'y' : `${Math.round((plane * 180) / Math.PI)}° from x`;
    const pos = rgbOf(C.accent), neg = rgbOf(C.warn);
    for (const [bx, kind] of boxes) {
      const cxp = bx + side / 2, cyp = y0 + side / 2;
      // frame and axes
      ctx.save();
      ctx.strokeStyle = C.line2; ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, y0 + 0.5, side - 1, side - 1);
      ctx.setLineDash([3, 4]); ctx.strokeStyle = C.line3;
      ctx.beginPath(); ctx.moveTo(bx, cyp); ctx.lineTo(bx + side, cyp); ctx.moveTo(cxp, y0); ctx.lineTo(cxp, y0 + side); ctx.stroke();
      ctx.restore();
      if (kind === 'cloud') {
        const R = P.range ?? Math.max(4, O.enclosingR(n, l, 0.99) * 1.02);
        const res = Math.max(80, Math.min(280, Math.round(side * dpr * 0.75)));
        const key = [n, l, m, real, P.sign, res, R, C.accent, C.warn].join();
        if (off && cloudKey !== key) {
          off.width = res; off.height = res;
          const g = off.getContext('2d'), img = g.createImageData(res, res), vals = new Float64Array(res * res);
          let vmax = 0;
          for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
            const u = -R + (2 * R * (i + 0.5)) / res, z = R - (2 * R * (j + 0.5)) / res;
            const v = O.sliceValue(n, l, m, u, z, real);
            vals[j * res + i] = v; vmax = Math.max(vmax, Math.abs(v));
          }
          for (let k = 0; k < vals.length; k++) {
            const v = vals[k], I = Math.min(1, Math.sqrt(Math.abs(v) / vmax));     // brightness ∝ |ψ|^½ = (|ψ|²)^¼
            const c = real && P.sign && v < 0 ? neg : pos;
            img.data[4 * k] = c[0]; img.data[4 * k + 1] = c[1]; img.data[4 * k + 2] = c[2]; img.data[4 * k + 3] = Math.round(255 * Math.min(1, I * 1.08));
          }
          g.putImageData(img, 0, 0);
          cloudKey = key;
        }
        if (off) { ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, bx, y0, side, side); ctx.restore(); }
        // nucleus, a scale bar, axis names
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cxp, cyp, 2.2, 0, 2 * Math.PI); ctx.fill();
        const bar = [1, 2, 5, 10, 20, 50].reverse().find((b) => b <= R * 0.6) || 1, bpx = (bar / (2 * R)) * side;
        ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 10, y0 + side - 12); ctx.lineTo(bx + 10 + bpx, y0 + side - 12); ctx.stroke(); ctx.restore();
        txt(`${bar} a₀`, bx + 10 + bpx / 2, y0 + side - 23, { color: C.ink2, size: fs - 1 });
        txt('z', cxp + 9, y0 + 9, { color: C.ink3, size: fs - 1 });
        txt(hor, bx + side - 6, cyp - 10, { color: C.ink3, size: fs - 1, align: 'right' });
        txt(hide.has('name') ? 'probability cloud' : `${name}: probability cloud`, cxp, y0 - 11, { color: C.ink2, size: fs });
      } else {
        // the angular factor as a polar plot in the same plane
        const N = 360, pts = [];
        let rmax = 0;
        for (let s = 0; s < 2; s++) for (let i = 0; i <= N; i++) {
          const th = (Math.PI * i) / N, ph = plane + (s ? Math.PI : 0);
          const f = real ? O.realY(l, m, th, ph) : Math.sqrt(O.ylm2(l, m, th));
          const r = f * f;
          rmax = Math.max(rmax, r);
          pts.push({ s, th, r, sg: Math.sign(f) || 1 });
        }
        const sc = (0.46 * side) / (rmax || 1);
        // fill each lobe, coloured by sign
        for (const s of [0, 1]) {
          const half = pts.filter((p) => p.s === s);
          let seg = [];
          const flush = () => {
            if (seg.length < 2) { seg = []; return; }
            const neg2 = real && P.sign && seg[Math.floor(seg.length / 2)].sg < 0;
            const pt = (p) => [cxp + (s ? -1 : 1) * p.r * Math.sin(p.th) * sc, cyp - p.r * Math.cos(p.th) * sc];
            ctx.save(); ctx.beginPath(); ctx.moveTo(cxp, cyp);
            for (const p of seg) ctx.lineTo(...pt(p));
            ctx.closePath();
            ctx.fillStyle = neg2 ? C.warn : C.accent; ctx.globalAlpha = 0.28; ctx.fill();
            // outline only the curve itself, not the closing spokes
            ctx.beginPath(); seg.forEach((p, i) => (i ? ctx.lineTo(...pt(p)) : ctx.moveTo(...pt(p))));
            ctx.globalAlpha = 1; ctx.strokeStyle = neg2 ? C.warn : C.accent; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
            seg = [];
          };
          for (let i = 0; i < half.length; i++) { if (seg.length && half[i].sg !== seg[seg.length - 1].sg) { seg.push(half[i]); flush(); } seg.push(half[i]); }
          flush();
        }
        txt('z', cxp + 9, y0 + 9, { color: C.ink3, size: fs - 1 });
        txt(hor, bx + side - 6, cyp - 10, { color: C.ink3, size: fs - 1, align: 'right' });
        txt(real ? 'angular shape: (real Y)²' : 'angular shape: |Yₗₘ(θ)|²', cxp, y0 - 11, { color: C.ink2, size: fs });
      }
    }
  }

  function drawRadial(S) {
    if (!pr) return;
    const { n, l } = S;
    const narrow = (bot.canvas.clientWidth || 600) < 520, want = narrow ? '2 / 1' : '3 / 1';
    if (bot.box.style.aspectRatio !== want) bot.box.style.aspectRatio = want;
    const rmax = P.rmax ?? Math.max(5, Math.ceil(O.enclosingR(n, l, 0.995) * 1.05));
    let pk = 0;
    for (let i = 0; i <= 800; i++) pk = Math.max(pk, O.radialP(n, l, (rmax * i) / 800));
    pr.setView([0, rmax], [0, pk * 1.25]);
    pr.clear();
    const fs = narrow ? 10 : 11.5;
    pr.area((r) => O.radialP(n, l, r), 0, rmax, { color: 'accent', alpha: 0.2, samples: 600 });
    pr.fn((r) => O.radialP(n, l, r), { color: 'accent', width: 2.2, domain: [0, rmax], samples: 900 });
    const marks = new Set(P.marks || []);
    const yT = pk * 1.25;
    const mark = (r, color, label, row) => {
      if (r > rmax) return;
      pr.line(r, 0, r, yT, { color, width: 1.6, dash: [5, 4] });
      // the most probable radius is labelled to the left of its line, ⟨r⟩ (always further out) to the right
      pr.text(label, r, yT * (row ? 0.8 : 0.92), { color, size: fs - 0.5, dx: row ? 5 : -5, align: row ? 'left' : 'right' });
    };
    if (marks.has('peak')) mark(O.peakR(n, l), 'gold', `most probable: ${O.peakR(n, l).toFixed(2)} a₀`, 0);
    if (marks.has('mean')) mark(O.meanR(n, l), 'violet', `⟨r⟩ = ${O.meanR(n, l).toFixed(2)} a₀`, 1);
    if (marks.has('bohr')) { pr.line(n * n, 0, n * n, yT, { color: 'ink3', width: 1.4, dash: [2, 3] }); pr.text(`Bohr orbit: n²a₀ = ${n * n} a₀`, n * n, yT * 0.5, { color: 'ink3', size: fs - 1, dx: 5 }); }
    if (marks.has('nodes')) {
      let prev = O.radial(n, l, 1e-6);
      for (let i = 1; i <= 4000; i++) { const r = (rmax * i) / 4000, v = O.radial(n, l, r); if (v * prev < 0) { pr.point(r, 0, { color: 'bad', r: 4.5 }); pr.text('node', r, 0, { color: 'bad', size: fs - 1, dy: -12, align: 'center' }); } if (v !== 0) prev = v; }
    }
  }

  function readout(S, real) {
    if (P.readout === false) return;
    const { n, l, m } = S, q = (k, v) => (hide.has(k) ? '?' : v), ll = l * (l + 1);
    F.readout([
      ['state', q('name', real ? `\\text{${O.realName(n, l, m)}}` : `${n}\\text{${O.letter(l)}},\\ m_l = ${m}`)],
      ['$E_n$', q('energy', `${O.energy(n).toFixed(3)}\\ \\text{eV}`)],
      ['$|\\vec L|$', q('L', ll === 0 ? '0' : `${sqrtTeX(ll)}\\,\\hbar`)],
      ['$L_z$', q('L', real && m !== 0 ? '\\text{not definite}' : m === 0 ? '0' : `${m}\\hbar`)],
      ['nodes', q('nodes', `${n - l - 1}\\text{ radial}, ${l}\\text{ angular}`)],
      ['$\\langle r\\rangle$', q('radii', `${O.meanR(n, l).toFixed(2)}\\,a_0`)],
    ]);
  }

  function draw() {
    const C = themeColors(), S = qn(), real = !!F.params.real;
    drawTop(C, S, real);
    drawRadial(S);
    readout(S, real);
  }
  F.draw(draw);
  F.caption(P.caption || 'Hydrogen’s exact wave functions (no spin, fine structure or reduced-mass correction). The cloud is a slice through the nucleus; its brightness grows as the fourth root of the probability density, so faint outer shells stay visible. The angular plot is the direction-dependence alone; P(r) is the chance per unit radius of finding the electron at distance r. Distances in Bohr radii, a₀ = 0.0529 nm.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!(Number.isInteger(P.n) && P.n >= 1 && P.n <= NTOP)) p.push(`mp-orbitals: n must be an integer 1–${NTOP}`);
  if (!(Number.isInteger(P.l) && P.l >= 0 && P.l < P.n)) p.push('mp-orbitals: l must be an integer 0…n−1');
  if (!(Number.isInteger(P.m) && Math.abs(P.m) <= P.l)) p.push('mp-orbitals: m must be an integer −l…l');
  if (P.panels !== null && !(Array.isArray(P.panels) && P.panels.length && P.panels.every((k) => PANELS.includes(k)))) p.push('mp-orbitals: panels is a list of cloud, angular, radial');
  for (const k of P.marks || []) if (!MARKS.includes(k)) p.push(`mp-orbitals: unknown mark “${k}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-orbitals: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-orbitals: unknown control “${c}”`);
  if (P.range !== null && !(P.range > 0)) p.push('mp-orbitals: range must be positive');
  if (P.rmax !== null && !(P.rmax > 0)) p.push('mp-orbitals: rmax must be positive');
  return p;
}
