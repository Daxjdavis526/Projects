// Stern–Gerlach analysers in a chain, in the spirit of the classic SPINS
// program (PHYS 4700, M1). An oven (or a prepared state) sends spin-½ atoms
// into up to three analysers; each points along z, x, y or a direction n̂ at
// polar angle θ in the xz-plane. Every analyser but the last passes one of
// its two beams on and stops the other at a block, or passes both beams on,
// recombined without anyone looking. The last one's beams end in counters.
// Beam widths follow the exact fractions; the buttons fire atoms one at a
// time (a seeded random draw for each), and the histogram below compares the
// measured fractions with the predictions |⟨±n|ψ⟩|². Physics in
// model/qm4-sg.js (tested in test/qm4-sg.test.mjs).
//
//   { type: 'qm4-sg', params: {
//       source: 'oven',         // oven | z+ | z- | x+ | x- | y+ | y- | state
//       st: 60, sp: 0,          // state: the prepared state |+n⟩ at polar angle st and azimuth sp (degrees)
//       analysers: [{ axis: 'z', pass: '+' }, { axis: 'x' }],
//                               // 1–3 analysers: axis z | x | y | n (n: theta 0–180°, phi in degrees);
//                               // pass '+' | '-' | 'both' for every one but the last (default '+')
//       controls: null,         // true, false, or a list of: src st sp a1 a2 a3 t1 t2 t3 p1 p2 count
//                               // (default: the analysers' axes and passes, and a θ slider for each n̂ one; none in a question)
//       N: 0,                   // atoms fired when the picture opens and after every change (seeded: a still picture is reproducible)
//       seed: 7,
//       send: null,             // the send buttons, e.g. [1, 100, 10000] (default: those, except in a question's small picture)
//       bars: null,             // the histogram of measured against predicted fractions (default: not in a compact picture)
//       exact: true,            // the predicted fractions (beam labels, histogram ticks, readouts); false when they are the answer
//       counts: true,           // the counts at the blocks and counters
//       readout: true,
//   } }
//
// The analysers are ideal (every atom leaves by one port or the other) and
// the beams are drawn schematically, not to scale; a real magnet deflects
// atoms by about a millimetre.

import { Plot } from '../plot.js';
import * as M from '../model/qm4-sg.js';

export const defaults = {
  source: 'oven', st: 60, sp: 0, analysers: [{ axis: 'z', pass: '+' }, { axis: 'x' }], controls: null, N: 0, seed: 7,
  send: null, bars: null, exact: true, counts: true, readout: true,
};
const CONTROLS = ['src', 'st', 'sp', 'a1', 'a2', 'a3', 't1', 't2', 't3', 'p1', 'p2', 'count'];
const PASSES = ['+', '-', 'both'];
const AXES = ['z', 'x', 'y', 'n'];
const MINUS = '−';
const signTxt = (s) => (s === '-' ? MINUS : s);
const pct = (p) => (p < 0.0005 ? '0' : p > 0.9995 ? '1' : String(+p.toFixed(3)));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const A0 = (P.analysers || []).slice(0, 3).map((a) => ({ axis: 'z', theta: 90, phi: 0, pass: '+', ...a }));
  const n0 = A0.length;
  const compact = !!F.compact;
  let wanted;
  if (P.controls === true || (P.controls === null && !compact)) {
    wanted = [];
    A0.forEach((a, i) => { wanted.push(`a${i + 1}`); if (a.axis === 'n') wanted.push(`t${i + 1}`); if (i < n0 - 1) wanted.push(`p${i + 1}`); });
  } else wanted = Array.isArray(P.controls) ? P.controls : [];
  const has = (k) => wanted.includes(k);

  // ─── controls ───────────────────────────────────────────────────────────
  const put = (k, v) => { F.params[k] = v; };
  const nodes = {};
  if (has('src')) F.choice({ key: 'src', label: 'Source', options: [['oven', 'oven'], ['z+', '$\\lvert{+z}\\rangle$'], ['x+', '$\\lvert{+x}\\rangle$'], ['y+', '$\\lvert{+y}\\rangle$'], ['state', '$\\lvert\\psi\\rangle$']], value: P.source, explain: 'An oven’s beam is unpolarized: half its atoms would be found up and half down along any axis. A prepared state is one an earlier analyser has already picked out.' });
  else put('src', P.source);
  if (has('st')) F.slider({ key: 'st', label: 'State’s polar angle $\\theta_\\psi$', min: 0, max: 180, step: 5, value: P.st, unit: '^\\circ', explain: 'The prepared state is $\\lvert{+n}\\rangle$ for a direction at this angle from $+z$: 0° is spin up, 180° spin down.' });
  else put('st', P.st);
  if (has('sp')) F.slider({ key: 'sp', label: 'State’s azimuth $\\phi_\\psi$', min: 0, max: 360, step: 15, value: P.sp, unit: '^\\circ', explain: 'The relative phase between the up and down amplitudes: invisible to a z analyser, decisive for x and y.' });
  else put('sp', P.sp);
  if (has('count')) F.slider({ key: 'count', label: 'Analysers', min: 1, max: 3, step: 1, value: n0, explain: 'How many analysers the atoms pass through.' });
  else put('count', n0);
  const axisOpts = [['z', 'z'], ['x', 'x'], ['y', 'y'], ['n', '$\\hat n(\\theta)$']];
  for (let i = 0; i < 3; i++) {
    const a = A0[i] || { axis: 'z', theta: 90, phi: 0, pass: '+' };
    const k = i + 1;
    if (has(`a${k}`)) nodes[`a${k}`] = F.choice({ key: `a${k}`, label: `Analyser ${k}: axis`, options: axisOpts, value: a.axis, explain: k === 1 ? 'The direction its magnetic field gradient points. $\\hat n(\\theta)$ lies in the xz-plane at angle θ from z.' : '' });
    else put(`a${k}`, a.axis);
    if (has(`t${k}`) || has(`a${k}`)) nodes[`t${k}`] = F.slider({ key: `t${k}`, label: `Analyser ${k}: angle $\\theta_${k}$ of $\\hat n$`, min: 0, max: 180, step: 5, value: a.theta, unit: '^\\circ', explain: 'Used when the axis is $\\hat n(\\theta)$: 0° is z, 90° is x, 180° is −z.' });
    else put(`t${k}`, a.theta);
    put(`f${k}`, a.phi || 0);
    if (has(`p${k}`)) nodes[`p${k}`] = F.choice({ key: `p${k}`, label: `Analyser ${k}: passes on`, options: [['+', '+ beam'], ['-', '− beam'], ['both', 'both, recombined']], value: a.pass, explain: k === 1 ? 'The beam it passes to the next analyser; the other is stopped and counted. “Both” sends the two beams on together, with nothing recording which one an atom took.' : '' });
    else put(`p${k}`, a.pass);
  }
  // a θ slider moved while the axis is z, x or y switches that analyser to n̂
  F.onChange((key) => {
    const m = /^t([123])$/.exec(key || '');
    if (m && F.params[`a${m[1]}`] !== 'n') F.set(`a${m[1]}`, 'n');
  });
  // an analyser's controls show only while it is in the chain, and its θ slider only while its axis is n̂
  const tidy = () => {
    const n = Math.max(1, Math.min(3, Math.round(F.params.count || n0)));
    for (let k = 1; k <= 3; k++) {
      const on = k <= n;
      if (nodes[`a${k}`]) nodes[`a${k}`].node.hidden = !on;
      if (nodes[`p${k}`]) nodes[`p${k}`].node.hidden = !(k < n);
      if (nodes[`t${k}`]) nodes[`t${k}`].node.hidden = !(on && (F.params[`a${k}`] === 'n' || !nodes[`a${k}`]));
    }
  };
  tidy();
  F.onChange(tidy);

  const chain = () => {
    const n = Math.max(1, Math.min(3, Math.round(F.params.count || n0)));
    return Array.from({ length: n }, (_, i) => ({ axis: F.params[`a${i + 1}`], theta: F.params[`t${i + 1}`], phi: F.params[`f${i + 1}`], pass: F.params[`p${i + 1}`] }));
  };

  // ─── canvases ───────────────────────────────────────────────────────────
  const main = F.canvas({ aspect: 'wide', label: P.alt || 'A chain of Stern–Gerlach analysers with beams, blocks and counters' });
  const showBars = P.bars ?? !compact;
  const barsCv = showBars ? F.canvas({ height: compact ? '120px' : '150px', label: 'Measured fractions against the predicted probabilities' }) : null;
  const plot = new Plot(main.canvas, { x: [0, 10], y: [-1, 1], grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });
  const bplot = barsCv && new Plot(barsCv.canvas, { x: [0, 1], y: [0, 1], grid: false, axes: false, pad: { l: 40, r: 10, t: 10, b: 26 } });

  // ─── atoms ──────────────────────────────────────────────────────────────
  let rand = M.rng(P.seed);
  let counts = null, A = chain();
  const fresh = () => { A = chain(); rand = M.rng(P.seed); counts = M.fire(F.params.src, A, 0, rand, null, F.params.st, F.params.sp); if (P.N > 0) M.fire(F.params.src, A, P.N, rand, counts, F.params.st, F.params.sp); };
  fresh();
  const flying = [];
  const anim = F.animate((dt) => {
    if (!flying.length) return;
    for (const f of flying) f.s += dt * 1.6;
    while (flying.length && flying[0].s >= 1) { const f = flying.shift(); tally(f.r); }
    draw();
  }, { force: true });
  function tally(r) {
    counts.sent++;
    if (!r.counted) counts.blocked[r.end]++;
    else if (r.sign === '+') counts.plus++;
    else counts.minus++;
  }
  const sendList = P.send ?? (compact ? [] : [1, 100, 10000]);
  for (const n of sendList) {
    F.button({
      label: n === 1 ? 'Send 1 atom' : `Send ${n.toLocaleString('en-US')}`, primary: n === sendList[0],
      onClick: () => {
        if (n <= 3) { for (let k = 0; k < n; k++) flying.push({ r: M.fireOne(F.params.src, A, rand, F.params.st, F.params.sp), s: -0.25 * k }); anim.start(); }
        else { M.fire(F.params.src, A, n, rand, counts, F.params.st, F.params.sp); draw(); }
      },
    });
  }
  if (sendList.length) F.button({ label: 'Reset counts', onClick: () => { flying.length = 0; rand = M.rng(P.seed); counts = M.fire(F.params.src, A, 0, rand, null, F.params.st, F.params.sp); draw(); } });

  F.onChange((key) => { if (/^t\d$/.test(key || '') && F.params[`a${key[1]}`] !== 'n') return; flying.length = 0; fresh(); draw(); });

  // ─── layout (world units; the canvas is 2:1) ────────────────────────────
  const geo = () => {
    const n = A.length, gap = n === 1 ? 2.6 : n === 2 ? 2.7 : 2.25;
    const cx = A.map((_, i) => 2.25 + gap * i);
    const end = cx[n - 1] + 1.55;
    return { n, cx, end, W: end + 1.1, bw: 0.95, bh: 0.84, port: 0.2 };
  };

  // the path an atom takes, as world points, and how far along it it gets
  function atomPath(r, G) {
    const pts = [[0.95, 0]];
    for (let i = 0; i <= r.end; i++) {
      const x = G.cx[i], s = r.path[i];
      pts.push([x - G.bw / 2, 0]);
      if (s === 'both') { pts.push([x + G.bw / 2, 0]); continue; }
      const y = s === '-' ? -G.port : G.port;
      pts.push([x + G.bw / 2, y]);
      if (i === r.end) {
        if (r.counted) pts.push([G.end, s === '-' ? -0.62 : 0.62]);
        else pts.push([x + G.bw / 2 + 0.42, s === '-' ? -0.46 : 0.46]);
      }
    }
    return pts;
  }
  const along = (pts, s) => {
    const seg = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
    let d = Math.max(0, Math.min(1, s)) * seg.reduce((a, b) => a + b, 0);
    for (let k = 0; k < seg.length; k++) {
      if (d <= seg[k]) { const u = seg[k] ? d / seg[k] : 0; return [pts[k][0] + u * (pts[k + 1][0] - pts[k][0]), pts[k][1] + u * (pts[k + 1][1] - pts[k][1])]; }
      d -= seg[k];
    }
    return pts[pts.length - 1];
  };

  // ─── drawing ────────────────────────────────────────────────────────────
  function draw() {
    const G = geo();
    plot.setView([0, G.W], [-1, 1]);
    plot.clear();
    const narrow = (main.canvas.clientWidth || 600) < 520;
    const fs = narrow ? 10 : 12.5, fsBig = narrow ? 12 : 15;
    const E = M.exact(F.params.src, A, F.params.st, F.params.sp);
    const showP = P.exact !== false;
    // beam widths follow the predicted fractions, unless those are a question's answer
    const bw = (p) => (showP ? 1.2 + 9 * Math.max(0, p) : 2.6);
    // source
    plot.rect(0.1, -0.24, 0.85, 0.48, { color: 'warn', alpha: 0.2, width: 1.5 });
    const src = F.params.src;
    const srcName = src === 'oven' ? 'oven' : src === 'state' ? 'ψ' : `|${src[1] === '-' ? MINUS : '+'}${src[0]}⟩`;
    plot.text(srcName, 0.525, narrow ? 0.4 : 0, { align: 'center', size: fs, color: 'warn', weight: 600 });   // above the box on a phone
    plot.line(0.95, 0, G.cx[0] - G.bw / 2, 0, { color: 'gold', width: bw(1), alpha: 0.75 });
    // analysers
    A.forEach((a, i) => {
      const x = G.cx[i], last = i === G.n - 1;
      const bp = E.beams.find((b) => b.i === i && b.sign === '+'), bm = E.beams.find((b) => b.i === i && b.sign === '-');
      for (const b of [bp, bm]) {
        const y = b.sign === '-' ? -G.port : G.port, x0 = x + G.bw / 2;
        if (b.fate === 'next') plot.line(x0, y, G.cx[i + 1] - G.bw / 2, 0, { color: 'gold', width: bw(b.p), alpha: 0.75 });
        else if (b.fate === 'blocked') {
          const xb = x0 + 0.42, yb = b.sign === '-' ? -0.46 : 0.46;
          plot.line(x0, y, xb, yb, { color: 'gold', width: bw(b.p), alpha: 0.75 });
          plot.rect(xb - 0.03, yb - 0.11, 0.1, 0.22, { color: 'ink3', alpha: 0.9, width: 1 });
          const lab = P.counts !== false ? `${counts.blocked[i]}` : '';
          if (lab) plot.text(lab, xb + 0.02, yb, { align: 'center', dy: b.sign === '-' ? 23 : -23, size: fs, color: 'ink2' });
        } else {
          const yc = b.sign === '-' ? -0.62 : 0.62;
          plot.line(x0, y, G.end, yc, { color: 'gold', width: bw(b.p), alpha: 0.75 });
          plot.rect(G.end, yc - 0.17, 0.85, 0.34, { color: 'good', alpha: 0.18, width: 1.5 });
          const c = b.sign === '-' ? counts.minus : counts.plus;
          plot.text(P.counts !== false ? `${signTxt(b.sign)} ${c}` : signTxt(b.sign), G.end + 0.425, yc, { align: 'center', size: narrow ? fs : fsBig, weight: 600, color: 'good' });
        }
        if (showP && b.p > 1e-9 && !narrow) {     // on a phone the histogram carries the numbers
          // at the middle of the beam, on its outer side
          const [ex, ey] = b.fate === 'next' ? [G.cx[i + 1] - G.bw / 2, 0] : b.fate === 'blocked' ? [x0 + 0.42, b.sign === '-' ? -0.46 : 0.46] : [G.end, b.sign === '-' ? -0.62 : 0.62];
          if (b.fate === 'blocked') plot.text(pct(b.p), ex + 0.1, ey, { dx: 4, size: fs - 1.5, color: 'ink3' });
          else plot.text(pct(b.p), (x0 + ex) / 2, (y + ey) / 2, { align: 'center', dy: b.sign === '-' ? 12 : -12, size: fs - 1.5, color: 'ink3' });
        }
      }
      // the analyser box
      plot.rect(x - G.bw / 2, -G.bh / 2, G.bw, G.bh, { color: 'accent', alpha: 0.16, width: 1.6 });
      plot.text(M.axisName(a), x, G.bh / 2 + 0.13, { align: 'center', size: fsBig, weight: 700, color: 'accent' });
      plot.text('+', x + G.bw / 2 - 0.14, G.port, { align: 'center', size: fs, color: 'ink2', weight: 700 });
      plot.text(MINUS, x + G.bw / 2 - 0.14, -G.port, { align: 'center', size: fs, color: 'ink2', weight: 700 });
      if (!last && a.pass === 'both') plot.text('both on', x, -G.bh / 2 - 0.12, { align: 'center', size: fs - 1, color: 'ink3' });
      // the axis as a little arrow in the xz-plane (y drawn as a dot: it points into the page)
      const [th, ph] = M.angles(a), r = 0.2, cyA = -0.02, cxA = x - 0.12;
      if (a.axis === 'y' || (Math.abs(Math.sin(th * Math.PI / 180) * Math.sin(ph * Math.PI / 180)) > 0.99)) {
        plot.circle(cxA, cyA, 0.05, { color: 'accent', fill: 'accent', alpha: 0.9 });
        plot.circle(cxA, cyA, 0.1, { color: 'accent', width: 1.4 });
      } else {
        const sx = Math.sin(th * Math.PI / 180) * Math.cos(ph * Math.PI / 180), sz = Math.cos(th * Math.PI / 180);
        plot.arrow(cxA - sx * r * 0.6, cyA - sz * r, cxA + sx * r * 0.6, cyA + sz * r, { color: 'accent', width: 1.8, head: 7 });
      }
    });
    // flying atoms
    for (const f of flying) {
      if (f.s < 0) continue;
      const pts = atomPath(f.r, G), [ax, ay] = along(pts, f.s);
      plot.point(ax, ay, { r: 5, color: 'gold', ring: 'ink' });
    }
    if (P.counts !== false) plot.text(`atoms sent: ${counts.sent.toLocaleString('en-US')}`, 0.1, -0.86, { size: fs, color: 'ink3' });
    if (bplot) drawBars(E, fs);
    if (P.readout !== false) {
      const rows = [['atoms sent', String(counts.sent)]];
      if (showP) {
        rows.push(['$P(+)$ at the end', pct(E.plus)], ['$P(-)$ at the end', pct(E.minus)]);
        const inLast = E.into[E.into.length - 1];
        if (G.n > 1 && inLast > 1e-9) rows.push(['$+$ share of atoms reaching the last analyser', pct(E.plus / inLast)]);
      }
      F.readout(rows);
    }
  }

  function drawBars(E, fs) {
    const cats = [];
    E.blocked.forEach((p, i) => { if (p !== null) cats.push({ name: `stopped at ${i + 1}`, p, c: counts.blocked[i] }); });
    cats.push({ name: 'counter +', p: E.plus, c: counts.plus }, { name: `counter ${MINUS}`, p: E.minus, c: counts.minus });
    const n = cats.length;
    bplot.setView([0, n], [0, 1.05]);
    bplot.clear();
    // a frame and 0, ½, 1 gridlines
    for (const y of [0, 0.5, 1]) {
      bplot.line(0, y, n, y, { color: 'line2', width: 1 });
      bplot.text(y === 0.5 ? '½' : String(y), 0, y, { dx: -8, align: 'right', size: fs - 1, color: 'ink3', halo: false });
    }
    const sent = counts.sent;
    cats.forEach((k, i) => {
      const frac = sent ? k.c / sent : 0;
      bplot.rect(i + 0.2, 0, 0.6, frac, { color: k.name.startsWith('counter') ? 'good' : 'ink3', alpha: 0.55, width: 1 });
      if (P.exact !== false) {
        bplot.line(i + 0.12, k.p, i + 0.88, k.p, { color: 'gold', width: 2.5 });
      }
      bplot.text(k.name, i + 0.5, 0, { align: 'center', dy: 14, size: fs - 1, color: 'ink2', halo: false });
      if (sent) bplot.text(String(+frac.toFixed(3)), i + 0.5, Math.min(frac, 0.9), { align: 'center', dy: -9, size: fs - 1.5, color: 'ink' });
    });
  }

  F.draw(draw);
  F.caption(P.exact !== false
    ? 'Beam widths and the gold marks are the predicted fractions of all atoms leaving the source; bars are the fractions measured so far. Ideal analysers; the beams are schematic, not to scale.'
    : 'Ideal analysers; the beams are schematic, not to scale.');
  return { get: (k) => (k === 'counts' ? counts : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!M.SOURCES.includes(P.source)) p.push(`qm4-sg: unknown source “${P.source}”`);
  if (!(P.st >= 0 && P.st <= 180)) p.push('qm4-sg: st must lie in 0–180°');
  if (!(typeof P.sp === 'number' && P.sp >= 0 && P.sp <= 360)) p.push('qm4-sg: sp must lie in 0–360°');
  const A = P.analysers;
  if (!Array.isArray(A) || A.length < 1 || A.length > 3) p.push('qm4-sg: analysers is a list of 1 to 3 analysers');
  else A.forEach((a, i) => {
    if (!AXES.includes(a.axis ?? 'z')) p.push(`qm4-sg: analyser ${i + 1} has unknown axis “${a.axis}”`);
    if (a.theta !== undefined && !(a.theta >= 0 && a.theta <= 180)) p.push(`qm4-sg: analyser ${i + 1}: theta must lie in 0–180°`);
    if (a.phi !== undefined && !(typeof a.phi === 'number' && Number.isFinite(a.phi))) p.push(`qm4-sg: analyser ${i + 1}: phi must be a number of degrees`);
    if (a.pass !== undefined && !PASSES.includes(a.pass)) p.push(`qm4-sg: analyser ${i + 1}: pass is +, - or both`);
    if (i === A.length - 1 && a.pass === 'both') p.push('qm4-sg: the last analyser’s beams always end in counters; it takes no pass');
  });
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`qm4-sg: unknown control “${c}”`);
  if (!(Number.isInteger(P.N) && P.N >= 0 && P.N <= 200000)) p.push('qm4-sg: N must be an integer 0–200000');
  if (P.send !== null && !(Array.isArray(P.send) && P.send.every((n) => Number.isInteger(n) && n >= 1 && n <= 100000))) p.push('qm4-sg: send is a list of whole numbers of atoms (1–100000)');
  return p;
}
