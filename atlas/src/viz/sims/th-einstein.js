// Einstein solids: N quantum oscillators sharing q identical energy quanta.
//
// 'pair' mode: two solids, A and B, in thermal contact. Above, their
// oscillators as cells holding dots (the quanta) — or, when there are too many
// to draw, a trace of A's share q_A/q as the exchange runs. Below, the exact
// multiplicity Ω_A·Ω_B of every macrostate q_A as bars (linear or log scale),
// the current macrostate in gold, and — once Play has run — gold dots for the
// share of time actually spent in each macrostate, scaled to sit on the bars
// when the random exchange has visited every microstate equally. With
// x: 'fraction' the axis is q_A/q and each curve is scaled to its own peak, so
// solids of different sizes can be compared: the peak narrows like 1/√N.
//
// 'list' mode: one small solid, every microstate drawn — the cells, and under
// each the stars-and-bars string (● a quantum, | a wall between oscillators)
// that proves Ω = C(q + N − 1, q).
//
// Physics in model/th-einstein.js (tested in test/th-einstein.test.mjs).
//
//   { type: 'th-einstein', params: {
//       mode: 'pair',          // 'pair' | 'list'
//       NA: 3, NB: 3, q: 6,    // pair: oscillators in A and B, quanta shared
//       N: 3,                  // list: oscillators (1–6); q quanta (0–10)
//       start: 'A',            // pair: where the quanta start: 'A', 'B', 'even', or q_A itself
//       scale: 'linear',       // 'linear' | 'log' (the bars' vertical axis)
//       x: 'q',                // 'q': q_A on the axis; 'fraction': q_A/q, curves scaled to their peak
//       tie: null,             // a list of N values: one choice sets N_A = N_B = N and q = qper·2N
//       qper: 1,               // quanta per oscillator when tied
//       ghosts: true,          // with tie and x: 'fraction', the other sizes' curves drawn faintly
//       controls: null,        // true, false, or a list of: NA NB q N scale play
//       ranges: {},            // slider ranges { NA: [min, max], NB: […], q: […], N: […] }
//       cells: 'auto',         // pair: draw the oscillators ('auto': when N_A + N_B ≤ 120)
//       visits: true,          // the time-spent dots
//       numbers: 'auto',       // Ω_A·Ω_B printed over each bar ('auto': when q ≤ 10 on a linear scale)
//       play: null,            // start running (default: in an Explore step, not in a small picture)
//       readouts: true,
//       hide: [],              // readouts shown as “?”: qA omega peak prob width total
//       stars: true,           // list: the stars-and-bars string under each microstate
//       seed: 1, alt: null,
//   } }

import { Plot, pow10Label } from '../plot.js';
import * as M from '../model/th-einstein.js';

export const defaults = { mode: 'pair', NA: 3, NB: 3, q: 6, N: 3, start: 'A', scale: 'linear', x: 'q', tie: null, qper: 1, ghosts: true, controls: null, ranges: {}, cells: 'auto', visits: true, numbers: 'auto', play: null, readouts: true, hide: [], stars: true, seed: 1, alt: null };
const CONTROLS = ['NA', 'NB', 'q', 'N', 'scale', 'play'];
const HIDE = ['qA', 'omega', 'peak', 'prob', 'width', 'total'];
const LN10 = Math.LN10;

/** A big number given by its natural log, as TeX: exact below a million, else m × 10ⁿ. */
export function bigTeX(lnX) {
  if (!Number.isFinite(lnX)) return '0';
  const l10 = lnX / LN10;
  if (l10 < 6) { const v = Math.round(Math.exp(lnX)); return v >= 1e4 ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : String(v); }
  let e = Math.floor(l10), m = 10 ** (l10 - e);
  if (+m.toFixed(2) >= 10) { m = 1; e += 1; }
  return `${m.toFixed(2)} \\times 10^{${e}}`;
}
/** A probability as TeX: a percentage while readable, else a power of ten. */
const probTeX = (p) => (p >= 1e-3 ? `${+(100 * p).toPrecision(3)}\\%` : p > 0 ? bigTeX(Math.log(p)) : '0');
const f3 = (x) => String(+(+x).toPrecision(3));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  return P.mode === 'list' ? mountList(F, P) : mountPair(F, P);
}

function wantedControls(F, P, all) {
  if (P.controls === true || (P.controls === null && !F.compact)) return all;
  return Array.isArray(P.controls) ? P.controls : [];
}

// ─── one solid: every microstate ───────────────────────────────────────────
function mountList(F, P) {
  const want = wantedControls(F, P, ['N', 'q']);
  const rg = (k, d) => P.ranges?.[k] || d;
  if (want.includes('N')) F.slider({ key: 'N', label: 'Oscillators $N$', min: rg('N', [1, 6])[0], max: rg('N', [1, 6])[1], step: 1, value: P.N, explain: 'How many quantum oscillators (atoms vibrating along one axis) the solid has.' });
  else F.params.N = P.N;
  if (want.includes('q')) F.slider({ key: 'q', label: 'Quanta $q$', min: rg('q', [0, 10])[0], max: rg('q', [0, 10])[1], step: 1, value: P.q, explain: 'How many energy quanta $\\hbar\\omega$ the solid shares. Its energy above the ground state is $U = q\\hbar\\omega$.' });
  else F.params.q = P.q;
  const { canvas } = F.canvas({ aspect: '', label: P.alt || 'Every microstate of a small Einstein solid' });
  const plot = new Plot(canvas, { x: [0, 1], y: [0, 1], axes: false, grid: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  const CAP = 120;

  function draw() {
    plot.clear();
    const N = Math.round(F.params.N), q = Math.round(F.params.q);
    const om = M.omega(N, q), list = M.microstates(N, q, CAP);
    const W = plot.R - plot.L, H = plot.B - plot.T, g = plot.ctx;
    const more = om > BigInt(list.length);
    const Havail = H - (more ? 22 : 0);
    // pick the largest cell size that fits every microstate
    let s = 30, cols = 1, rows = 1, itemW = 0, itemH = 0;
    for (; s >= 7; s -= 0.5) {
      itemW = N * s + 1.3 * s; itemH = s * (P.stars ? 2.15 : 1.45);
      cols = Math.max(1, Math.floor(W / itemW)); rows = Math.ceil(list.length / cols);
      if (rows * itemH <= Havail) break;
    }
    const x0 = plot.L + (W - Math.min(cols, list.length) * itemW + 1.3 * s) / 2;
    list.forEach((st, k) => {
      const c = k % cols, r = Math.floor(k / cols);
      const X = x0 + c * itemW, Y = plot.T + r * itemH + 2;
      st.forEach((nq, i) => cell(g, plot, X + i * s, Y, s * 0.92, nq, 'accent'));
      if (P.stars) {
        const str = st.map((nq) => '●'.repeat(nq)).join('|');
        plot.text(str || '|', X + (N * s) / 2, Y + s * 1.45, { screen: true, align: 'center', size: Math.max(8, Math.min(13, (1.1 * N * s) / Math.max(4, str.length))), color: 'ink2', halo: false });
      }
    });
    if (more) plot.text(`… and ${(om - BigInt(list.length)).toString()} more microstates`, plot.L + W / 2, plot.B - 8, { screen: true, align: 'center', color: 'ink3', size: 12 });
    if (P.readouts !== false) {
      F.readout([
        ['oscillators $N$', String(N)], ['quanta $q$', String(q)],
        ['$\\Omega = \\binom{q+N-1}{q}$', P.hide.includes('omega') ? '?' : om.toString()],
      ]);
    }
  }
  F.onChange(draw);
  F.draw(draw);
  F.caption('Each row of boxes is one microstate: which oscillator holds how many quanta. Under it, the same microstate as a string of ● (quanta) and | (walls between oscillators) — every arrangement of q dots and N − 1 walls is one microstate.');
  return { get: (k) => (k === 'omega' ? Number(M.omega(Math.round(F.params.N), Math.round(F.params.q))) : F.params[k]) };
}

/** One oscillator: a rounded box holding its quanta as dots (a number when there are many). */
function cell(g, plot, x, y, s, nq, color, outline = null) {
  g.save();
  g.strokeStyle = outline ? plot.color(outline) : plot.color('line3');
  g.lineWidth = outline ? 2.2 : 1;
  g.fillStyle = plot.color(color); g.globalAlpha = 0.1;
  g.beginPath(); g.roundRect ? g.roundRect(x, y, s, s, s * 0.18) : g.rect(x, y, s, s); g.fill();
  g.globalAlpha = 1; g.stroke();
  g.fillStyle = plot.color(color);
  if (nq > 0 && nq <= 9 && s >= 9) {
    const k = nq <= 1 ? 1 : nq <= 4 ? 2 : 3, step = s / (k + 1), r = Math.max(1.2, Math.min(s * 0.13, step * 0.36));
    for (let i = 0; i < nq; i++) { const cx = x + step * (1 + (i % k)), cy = y + step * (1 + Math.floor(i / k)); g.beginPath(); g.arc(cx, cy, r, 0, 2 * Math.PI); g.fill(); }
  } else if (nq > 0) {
    g.font = `600 ${Math.max(8, s * 0.5)}px Inter, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(nq), x + s / 2, y + s / 2 + 0.5);
  }
  g.restore();
}

// ─── two solids exchanging energy ──────────────────────────────────────────
function mountPair(F, P) {
  const hide = new Set(P.hide || []);
  const want = wantedControls(F, P, P.tie ? ['scale', 'play'] : ['NA', 'NB', 'q', 'scale', 'play']);
  const rg = (k, d) => P.ranges?.[k] || d;
  if (P.tie) {
    F.choice({ key: 'Nt', label: 'Oscillators in each solid $N$', options: P.tie.map((v) => [v, v >= 1e4 ? `10^${Math.round(Math.log10(v))}`.replace(/\^(\d)/, (m, d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]) : String(v)]), value: P.tie.includes(P.NA) ? P.NA : P.tie[0], explain: `Both solids get $N$ oscillators and share $q = ${2 * P.qper}N$ quanta.` });
  } else {
    if (want.includes('NA')) F.slider({ key: 'NA', label: 'Oscillators in A, $N_A$', min: rg('NA', [1, 100])[0], max: rg('NA', [1, 100])[1], step: 1, value: P.NA, explain: 'Solid A’s size: how many quantum oscillators it has.' });
    else F.params.NA = P.NA;
    if (want.includes('NB')) F.slider({ key: 'NB', label: 'Oscillators in B, $N_B$', min: rg('NB', [1, 100])[0], max: rg('NB', [1, 100])[1], step: 1, value: P.NB, explain: 'Solid B’s size.' });
    else F.params.NB = P.NB;
    if (want.includes('q')) F.slider({ key: 'q', label: 'Quanta shared, $q$', min: rg('q', [0, 200])[0], max: rg('q', [0, 200])[1], step: 1, value: P.q, explain: 'The total energy, $q\\hbar\\omega$, fixed: the solids only trade it.' });
    else F.params.q = P.q;
  }
  if (want.includes('scale')) F.choice({ key: 'scale', label: 'Vertical scale', options: [['linear', 'linear'], ['log', 'logarithmic']], value: P.scale, explain: 'A log scale shows the macrostates far from the peak, which a linear scale squashes to nothing.' });
  else F.params.scale = P.scale;

  const sizes = () => {
    if (P.tie) { const N = +F.params.Nt; return { NA: N, NB: N, q: Math.round(P.qper * 2 * N) }; }
    return { NA: Math.round(F.params.NA), NB: Math.round(F.params.NB), q: Math.round(F.params.q) };
  };
  const showCells = () => { const { NA, NB } = sizes(); return P.cells === true || (P.cells === 'auto' && NA + NB <= 120); };

  const top = F.canvas({ aspect: 'wide', label: 'The oscillators of solids A and B and the quanta they hold' });
  const pt = new Plot(top.canvas, { x: [0, 1], y: [0, 1], axes: false, grid: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  const bot = F.canvas({ aspect: 'wide', label: 'The multiplicity of each macrostate q_A' });
  const pb = new Plot(bot.canvas, { x: [0, 1], y: [0, 1], xlabel: P.x === 'fraction' ? 'q_A / q' : 'q_A (quanta in A)', ylabel: '', axesAt: 'edge' });

  let S, D, ghostD = [], trace = [], last = null;
  const rebuild = () => {
    const { NA, NB, q } = sizes();
    S = M.makePair(NA, NB, q, P.start, P.seed);
    D = M.pairDist(NA, NB, q);
    trace = [S.qA / Math.max(1, q)];
    last = null;
    ghostD = P.tie && P.x === 'fraction' && P.ghosts ? P.tie.filter((v) => v !== NA).map((v) => ({ N: v, d: M.pairDist(v, v, Math.round(P.qper * 2 * v)) })) : [];
  };
  rebuild();

  function drawTop() {
    pt.clear();
    const g = pt.ctx, W = pt.R - pt.L, H = pt.B - pt.T, narrow = W < 480, fs = narrow ? 11 : 12.5;
    const { NA, NB, q } = S;
    const qa = hide.has('qA') ? '?' : String(S.qA), qb = hide.has('qA') ? '?' : String(q - S.qA);
    if (showCells()) {
      const gap = W * 0.06, wA = ((W - gap) * NA) / (NA + NB), wB = W - gap - wA;
      const layout = (n, w) => { let best = null; for (let s = 40; s >= 6; s -= 0.5) { const cols = Math.max(1, Math.floor(w / (s * 1.12))), rows = Math.ceil(n / cols); if (rows * s * 1.12 <= H - 26) { best = { s, cols }; break; } } return best || { s: 6, cols: Math.max(1, Math.floor(w / 6.7)) }; };
      const la = layout(NA, wA), lb = layout(NB, wB), s = Math.min(la.s, lb.s);
      const colsA = Math.max(1, Math.min(NA, Math.floor(wA / (s * 1.12)))), colsB = Math.max(1, Math.min(NB, Math.floor(wB / (s * 1.12))));
      const draw1 = (x0, w, cols, n, off, color) => {
        const used = cols * s * 1.12, xs = x0 + (w - used) / 2;
        for (let i = 0; i < n; i++) {
          const c = i % cols, r = Math.floor(i / cols), k = off + i;
          const ol = last && (k === last[0] ? 'bad' : k === last[1] ? 'good' : null);
          cell(g, pt, xs + c * s * 1.12, pt.T + 24 + r * s * 1.12, s, S.n[k], color, ol);
        }
      };
      draw1(pt.L, wA, colsA, NA, 0, 'accent');
      draw1(pt.L + wA + gap, wB, colsB, NB, NA, 'warn');
      pt.text(`A: ${NA} oscillator${NA === 1 ? '' : 's'}, q_A = ${qa}`, pt.L + wA / 2, pt.T + 9, { screen: true, align: 'center', color: 'accent', size: fs, weight: 650 });
      pt.text(`B: ${NB} oscillator${NB === 1 ? '' : 's'}, q_B = ${qb}`, pt.L + wA + gap + wB / 2, pt.T + 9, { screen: true, align: 'center', color: 'warn', size: fs, weight: 650 });
      g.save(); g.strokeStyle = pt.color('ink3'); g.setLineDash([4, 4]); g.beginPath(); g.moveTo(pt.L + wA + gap / 2, pt.T + 20); g.lineTo(pt.L + wA + gap / 2, pt.B); g.stroke(); g.restore();
    } else {
      // too many to draw: A's share of the energy over time, with the expected band
      const x0 = pt.L + 46, x1 = pt.R - 8, y0 = pt.B - 18, y1 = pt.T + 22;
      const Y = (f) => y0 + (y1 - y0) * f;
      const fm = D.mean / Math.max(1, q), fs1 = D.sd / Math.max(1, q);
      g.save();
      g.fillStyle = pt.color('gold'); g.globalAlpha = 0.18;
      g.fillRect(x0, Y(Math.min(1, fm + fs1)), x1 - x0, Math.max(1, Y(Math.max(0, fm - fs1)) - Y(Math.min(1, fm + fs1))));
      g.globalAlpha = 1; g.strokeStyle = pt.color('line3'); g.lineWidth = 1; g.strokeRect(x0, y1, x1 - x0, y0 - y1);
      g.strokeStyle = pt.color('accent'); g.lineWidth = 1.8; g.beginPath();
      const n = trace.length;
      trace.forEach((f, i) => { const x = x0 + ((x1 - x0) * i) / Math.max(1, 299); i ? g.lineTo(x, Y(f)) : g.moveTo(x, Y(f)); });
      if (n) g.stroke();
      g.restore();
      for (const f of [0, 0.5, 1]) pt.text(String(f), x0 - 6, Y(f), { screen: true, align: 'right', color: 'ink3', size: 11, halo: false });
      pt.text(`share of the energy in A, q_A/q   (N_A = ${NA}, N_B = ${NB}, q = ${q})`, x0, pt.T + 9, { screen: true, color: 'ink2', size: fs });
      pt.text('gold band: mean ± one standard deviation', x1, y0 + 11, { screen: true, align: 'right', color: 'gold', size: fs - 1.5, halo: false });
    }
  }

  function drawBottom() {
    const { q } = S, frac = P.x === 'fraction', log = F.params.scale === 'log';
    const xs = (a) => (frac ? a / Math.max(1, q) : a);
    // vertical units: Ω itself (scaled by 10^k if huge), its log10, or Ω/Ω_peak
    const lp10 = D.lnPeak / LN10;
    const k = !frac && !log && lp10 > 9 ? Math.floor(lp10) : 0;
    const yOf = (lnv) => (frac ? Math.exp(lnv - D.lnPeak) : log ? lnv / LN10 : Math.exp(lnv - k * LN10));
    const ymax = frac ? 1.08 : log ? Math.max(1, lp10 * 1.08) : yOf(D.lnPeak) * 1.12;
    const ymin = log ? Math.min(0, (D.lnW[0] / LN10) * 0) : 0;
    const pad = frac ? 0.02 : 0.6;
    pb.o.yfmt = log ? pow10Label : undefined;
    pb.o.ylabel = frac ? 'Ω / Ω(peak)' : log ? 'Ω_A·Ω_B (log scale)' : k ? `Ω_A·Ω_B  (×10^${k})`.replace(/\^(\d+)/, (m, d) => [...d].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join('')) : 'Ω_A·Ω_B';
    pb.setView([frac ? 0 : -pad, frac ? 1 : q + pad], [ymin, ymax]);
    pb.clear();
    const g = pb.ctx;
    for (const { d } of ghostD) {
      const qq = d.lnW.length - 1, pts = [];
      for (let a = 0; a <= qq; a += Math.max(1, Math.floor(qq / 600))) pts.push([a / qq, Math.exp(d.lnW[a] - d.lnPeak)]);
      pb.path(pts, { color: 'ink3', width: 1.2, alpha: 0.7 });
    }
    const bars = !frac && q + 1 <= 160;
    if (bars) {
      for (let a = 0; a <= q; a++) {
        const y = yOf(D.lnW[a]);
        pb.rect(a - 0.4, ymin, 0.8, Math.max(0, y - ymin), { color: a === S.qA ? 'gold' : 'accent', alpha: a === S.qA ? 0.75 : 0.4, width: 1 });
      }
    } else {
      const pts = [[xs(0), ymin]];
      for (let a = 0; a <= q; a += Math.max(1, Math.floor(q / 800))) pts.push([xs(a), yOf(D.lnW[a])]);
      pts.push([xs(q), yOf(D.lnW[q])], [xs(q), ymin]);
      pb.path(pts, { color: 'accent', width: 2, fill: 'accent', fillAlpha: 0.22 });
      pb.line(xs(S.qA), ymin, xs(S.qA), yOf(D.lnW[S.qA]), { color: 'gold', width: 2.5 });
    }
    // numbers over the bars
    const nums = P.numbers === true || (P.numbers === 'auto' && bars && !log && q <= 10 && !k);
    if (nums && !hide.has('omega')) for (let a = 0; a <= q; a++) pb.text(bigTeXPlain(D.lnW[a]), a, yOf(D.lnW[a]), { align: 'center', dy: -9, size: q > 8 ? 10 : 11.5, color: 'ink2' });
    // time spent in each macrostate, on the same scale
    if (P.visits && S.moves > 0) {
      for (let a = 0; a <= q; a++) {
        if (!S.visits[a]) continue;
        const lnv = Math.log(S.visits[a] / S.moves) + D.lnTotal;
        const y = yOf(lnv);
        if (y > ymax || y < ymin) continue;
        if (bars || a % Math.max(1, Math.floor(q / 160)) === 0) pb.point(xs(a), y, { color: 'gold', r: bars ? 3.2 : 2 });
      }
    }
    if (!hide.has('peak')) {
      const xp = xs(D.peak);
      pb.text('most probable', xp, yOf(D.lnPeak), { align: 'center', dy: nums ? -24 : -10, color: 'ink2', size: 11 });
    }
    if (!hide.has('width') && (frac || !bars)) {
      const y = 0.6 * (frac ? 1 : yOf(D.lnPeak));
      const a0 = xs(D.mean - D.sd), a1 = xs(D.mean + D.sd);
      if (!log) { pb.arrow(xs(D.mean), y, a1, y, { color: 'gold', width: 1.4, head: 6 }); pb.arrow(xs(D.mean), y, a0, y, { color: 'gold', width: 1.4, head: 6 }); pb.text('±σ', a1, y, { dx: 6, color: 'gold', size: 11.5 }); }
    }
    void g;
  }

  function readouts() {
    if (P.readouts === false) return;
    const { NA, NB, q } = S, qm = (key, v) => (hide.has(key) ? '?' : v);
    const lnNow = D.lnW[S.qA];
    F.readout([
      ['$q_A$, $q_B$', qm('qA', `${S.qA},\\ ${q - S.qA}`)],
      ['$\\Omega_A\\Omega_B$ now', qm('omega', bigTeX(lnNow))],
      ['most probable $q_A$', qm('peak', String(D.peak))],
      ['chance of this $q_A$', qm('prob', probTeX(D.p[S.qA]))],
      ['spread $\\sigma_{q_A}$', qm('width', `${f3(D.sd)}\\ (${f3((100 * D.sd) / Math.max(1, q))}\\%\\text{ of } q)`)],
      ['$\\Omega_\\text{total}$', qm('total', bigTeX(D.lnTotal))],
      S.moves ? ['exchanges', String(S.moves)] : null,
    ].filter((r) => r && !(NA + NB > 0 && false)));
  }

  function draw() { drawTop(); drawBottom(); readouts(); }

  // the exchange: slow enough to follow single hops for small solids
  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  let acc = 0;
  const rate = () => { const N = S.NA + S.NB; return N <= 24 ? 6 : Math.min(4e5, 60 * N); };
  const step = (dt) => {
    acc += dt * rate();
    let k = Math.floor(acc);
    if (!k) return;
    acc -= k;
    if (k === 1 && S.NA + S.NB <= 24) {
      // remember the hop so the donor (red) and receiver (green) can be outlined
      const before = Int32Array.from(S.n);
      M.exchange(S, 1);
      const i = S.n.findIndex((v, j) => v < before[j]), j = S.n.findIndex((v, jj) => v > before[jj]);
      last = i >= 0 && j >= 0 ? [i, j] : null;
    } else { M.exchange(S, k); last = null; }
    trace.push(S.qA / Math.max(1, S.q));
    if (trace.length > 300) trace.shift();
    draw();
  };
  let loop = F.animate((dt) => { if (running) step(dt); });
  if (!F.compact && (want.includes('play') || P.play) && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running });
    } });
    F.button({ label: 'One exchange', onClick: () => { acc = 0; const r0 = running; running = false; step(1 / rate()); running = r0; } });
    F.button({ label: 'All in A', onClick: () => { rebuild(); draw(); } });
  }
  F.onChange((key) => { if (key !== 'scale') rebuild(); draw(); });
  F.draw(draw);
  F.caption(P.x === 'fraction'
    ? 'Each curve is the exact multiplicity Ω_A·Ω_B against the share of the energy in A, scaled to its own peak. The solids are idealised: identical quantum oscillators that trade whole quanta and nothing else.'
    : 'Bars: the exact multiplicity Ω_A·Ω_B of each macrostate. Gold dots: the share of time the random exchange has spent there, on the same scale. The solids are idealised: identical quantum oscillators that trade whole quanta and nothing else; the exchange rule is a teaching model of how real atoms jostle energy around.');
  return { get: (k) => (k === 'qA' ? S.qA : k === 'moves' ? S.moves : F.params[k]) };
}

/** The same big number as plain canvas text. */
function bigTeXPlain(lnX) {
  const l10 = lnX / LN10;
  if (l10 < 6) return String(Math.round(Math.exp(lnX)));
  const e = Math.floor(l10);
  return `${(10 ** (l10 - e)).toFixed(1)}e${e}`;
}

export function validate(P0) {
  const P = { ...defaults, ...P0 }, p = [];
  const whole = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  if (!['pair', 'list'].includes(P.mode)) p.push('th-einstein: mode is pair or list');
  if (P.mode === 'list') {
    if (!whole(P.N, 1, 6)) p.push('th-einstein: list mode takes N from 1 to 6');
    if (!whole(P.q, 0, 10)) p.push('th-einstein: list mode takes q from 0 to 10');
  } else {
    if (!whole(P.NA, 1, 1e6) || !whole(P.NB, 1, 1e6)) p.push('th-einstein: NA and NB are whole numbers from 1 to 10⁶');
    if (!whole(P.q, 0, 2e6)) p.push('th-einstein: q is a whole number from 0 to 2 × 10⁶');
    if (P.tie && !(Array.isArray(P.tie) && P.tie.every((v) => whole(v, 1, 1e6)))) p.push('th-einstein: tie is a list of whole N values');
    if (!(['A', 'B', 'even'].includes(P.start) || whole(P.start, 0, P.q))) p.push('th-einstein: start is A, B, even, or a q_A from 0 to q');
    if (!['q', 'fraction'].includes(P.x)) p.push('th-einstein: x is q or fraction');
    if (!(P.qper > 0)) p.push('th-einstein: qper must be positive');
  }
  if (!['linear', 'log'].includes(P.scale)) p.push('th-einstein: scale is linear or log');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`th-einstein: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`th-einstein: unknown hide “${h}”`);
  return p;
}
