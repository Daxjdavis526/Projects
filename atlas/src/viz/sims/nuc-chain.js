// Decay chains: the activity of every member of a radioactive chain against
// time, from Bateman's exact solution, starting from a pure parent. A
// short-lived daughter grows until it decays as fast as it is made —
// secular equilibrium, when the parent lives far longer (radium and its
// radon, the whole uranium-238 series); transient equilibrium, when the
// parent lives only somewhat longer (the molybdenum-99 → technetium-99m
// generator); none, when the daughter outlives the parent. Physics in
// model/nuc-chain.js (tested in test/nuc-chain.test.mjs); half-lives from
// NUBASE2020.
//
//   { type: 'nuc-chain', params: {
//       chain: 'pair',      // pair (a parent and a daughter: set the ratio of half-lives), moly, radon, radium, u238
//       ratio: 0.1,         // pair: the daughter's half-life over the parent's (0.01–100)
//       logy: false,        // activities on a logarithmic scale (the u238 chain always is)
//       time: null,         // a time marker, in the chain's display unit (parent half-lives, h, min, d; log₁₀ years for u238)
//       peak: false,        // pair, moly: mark when the daughter's activity peaks
//       number: false,      // pair: draw the number of daughter nuclei too (dashed), against the parent's
//       controls: null,     // true, false, or a list of: ratio logy time (the chain itself is fixed per picture)
//       readout: true,
//       hide: [],           // 'ratio' hides the activity ratio; 'kind' the equilibrium's name; 'peak' the peak time's value
//   } }

import { Plot, pow10Label } from '../plot.js';
import * as K from '../model/nuc-chain.js';

export const defaults = { chain: 'pair', ratio: 0.1, logy: false, time: null, peak: false, number: false, controls: null, readout: true, hide: [] };
const CONTROLS = ['ratio', 'logy', 'time'];
const COLORS = ['accent', 'warn', 'good', 'violet', 'teal', 'gold', 'bad'];

/** How each chain is drawn: time unit (s per display unit), axis range, which members, labels. */
const VIEWS = {
  pair: { unit: 1, x: [0, 6], xlabel: 'time (parent half-lives)', tunit: 'T₁' },
  moly: { unit: K.HOUR, x: [0, 120], xlabel: 'time since the generator was last emptied (h)', tunit: 'h', show: [0, 1] },
  radon: { unit: K.MIN, x: [0, 240], xlabel: 'time after sealing pure radon (min)', tunit: 'min', show: [0, 1, 2, 3] },
  radium: { unit: K.DAY, x: [0, 30], xlabel: 'time after sealing pure radium (days)', tunit: 'd', show: [0, 1, 4] },
  u238: { unit: K.YEAR, x: [-8, 11], log: true, xlabel: 'time after purifying uranium (years, log scale)', tunit: 'yr', show: [0, 1, 3, 4, 5, 11] },
};

const sig = (x, n = 3) => (x === 0 ? '0' : Math.abs(x) >= 1e4 || Math.abs(x) < 1e-3 ? x.toExponential(n - 1).replace(/e\+?(-?\d+)/, '\\times10^{$1}') : String(+x.toPrecision(n)));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = (P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [])
    .filter((c) => !(c === 'ratio' && P.chain !== 'pair') && !(c === 'logy' && P.chain === 'u238'));
  const ctl = (key, make, value) => (wanted.includes(key) ? make() : (F.params[key] = value));
  F.params.chain = P.chain;
  ctl('ratio', () => F.slider({ key: 'ratio', label: 'Daughter’s half-life ÷ parent’s, $T_2/T_1$', min: 0.01, max: 100, value: P.ratio, logScale: true, fmt: (v) => sig(v, 2), explain: 'Below about 0.01 the parent barely decays while the daughter settles (secular); between, both fall together (transient); above 1 the daughter outlives the parent (no equilibrium).' }), P.ratio);
  ctl('logy', () => F.toggle({ key: 'logy', label: 'Logarithmic activity scale', value: P.logy, explain: 'On a log scale an exponential decay is a straight line, and parallel lines mean a fixed ratio.' }), P.logy);
  const V0 = VIEWS[P.chain];
  const t0 = P.time ?? (V0.log ? 3 : V0.x[1] * 0.4);
  ctl('time', () => F.slider({ key: 'time', label: V0.log ? 'Time, $\\log_{10}(t/\\text{yr})$' : `Time (${V0.tunit})`, min: V0.x[0], max: V0.x[1], step: (V0.x[1] - V0.x[0]) / 400, value: t0, explain: 'Read every activity at this moment.', fmt: (v) => sig(v, 3) }), P.time);

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'Activities of the members of a radioactive decay chain against time' });
  const plot = new Plot(canvas, { x: V0.x, y: [0, 1.15], axesAt: 'edge' });

  const chain = () => (F.params.chain === 'pair' ? K.pairChain(+F.params.ratio) : K.CHAINS[F.params.chain]);
  const view = () => VIEWS[F.params.chain];

  function draw() {
    const narrow = (canvas.clientWidth || 600) < 520, want = narrow ? '4 / 3' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    const V = view(), ch = chain(), u = V.unit, N0 = K.pureParent(ch);
    const logy = V.log || !!F.params.logy;
    const members = V.show || [0, 1];
    // activities relative to the parent's at t = 0
    const act = (x) => K.activities(ch, N0, (V.log ? 10 ** x : x) * u);
    let ymax = 1.15;
    if (!logy && F.params.chain === 'pair') { const tp = K.peakTime(Math.LN2, Math.LN2 / +F.params.ratio); ymax = Math.max(1.15, act(Math.min(V.x[1], tp))[1] * 1.12); }
    const y = logy ? [V.log ? -6 : -3, 0.4] : [0, ymax];
    plot.setView(V.x, y);
    plot.o.xlabel = narrow && V.log ? 'time after purifying (yr, log)' : V.xlabel;
    plot.o.ylabel = narrow ? 'activity' : 'activity ÷ parent’s at the start';
    plot.o.xfmt = V.log ? pow10Label : null;
    plot.o.yfmt = logy ? pow10Label : null;
    plot.clear();
    const val = (a) => (logy ? (a > 0 ? Math.log10(a) : NaN) : a);
    const n = 400, xs = Array.from({ length: n + 1 }, (_, i) => V.x[0] + ((V.x[1] - V.x[0]) * i) / n), rows = xs.map(act);
    // the number of daughter nuclei (pair only), scaled to the parent's
    if (F.params.chain === 'pair' && P.number) {
      const l1 = Math.LN2, l2 = Math.LN2 / +F.params.ratio;
      plot.path(xs.map((x, i) => [x, val(rows[i][1] / l2 * l1)]), { color: COLORS[1], width: 1.6, dash: [6, 4] });
    }
    members.forEach((m, k) => {
      const col = COLORS[k % COLORS.length];
      plot.path(xs.map((x, i) => [x, val(rows[i][m])]), { color: col, width: k === 0 ? 2.8 : 2.4 });
    });
    // labels: in a legend box, top right
    const names = members.map((m) => ch.members[m].label);
    const lx = plot.R - 8, ly0 = plot.T + 12, step = narrow ? 15 : 17;
    const wBox = Math.max(...names.map((s) => s.length)) * 7.4 + 34;
    const g = plot.ctx; g.save(); g.fillStyle = plot.col.bg; g.globalAlpha = 0.8; g.fillRect(lx - wBox, ly0 - 10, wBox + 4, names.length * step + 4); g.restore();
    names.forEach((s, k) => {
      const col = COLORS[k % COLORS.length], yy = ly0 + k * step;
      plot.ctx.save(); plot.ctx.strokeStyle = plot.color(col); plot.ctx.lineWidth = 3; plot.ctx.beginPath(); plot.ctx.moveTo(lx - 22, yy); plot.ctx.lineTo(lx - 6, yy); plot.ctx.stroke(); plot.ctx.restore();
      plot.text(s, lx - 28, yy, { screen: true, align: 'right', color: col, size: narrow ? 11 : 12 });
    });
    // the peak of the daughter's activity
    const pk = F.params.chain === 'moly' || F.params.chain === 'pair' ? K.peakTime(K.lambdaOf(ch.members[0].T), K.lambdaOf(ch.members[1].T)) / u : null;
    if (P.peak && pk !== null && pk >= V.x[0] && pk <= V.x[1]) {
      plot.line(pk, y[0], pk, y[1], { color: 'ink3', width: 1.2, dash: [4, 4] });
      plot.text(hide.has('peak') ? 'daughter’s peak' : `peak: ${sig(pk, 3)} ${V.tunit}`, pk, y[1], { dx: 6, dy: 12, color: 'ink2', size: 11.5 });
    }
    // the time marker
    const tm = F.params.time;
    if (tm !== null && tm !== undefined) {
      plot.line(tm, y[0], tm, y[1], { color: 'gold', width: 1.6 });
      const a = act(tm);
      members.forEach((m, k) => { const v = val(a[m]); if (Number.isFinite(v)) plot.point(tm, v, { color: COLORS[k % COLORS.length], r: 4 }); });
    }
    readout();
  }

  function readout() {
    if (P.readout === false) return;
    const V = view(), ch = chain(), u = V.unit, rows = [];
    const T1 = ch.members[0].T, T2 = ch.members[1].T, eq = K.equilibrium(T1, T2, ch.members[1].b ?? 1);
    if (F.params.chain === 'pair' || F.params.chain === 'moly') {
      rows.push(['equilibrium', hide.has('kind') ? '?' : `\\text{${eq.kind}}`]);
      if (eq.kind !== 'none') rows.push(['in equilibrium $A_2/A_1$', hide.has('ratio') ? '?' : sig(eq.ratio, 3)]);
    }
    const tm = F.params.time;
    if (tm !== null && tm !== undefined) {
      const a = K.activities(ch, K.pureParent(ch), (V.log ? 10 ** tm : tm) * u);
      rows.push(['time', V.log ? `${sig(10 ** tm, 2)}\\ \\text{yr}` : `${sig(tm, 3)}\\ \\text{${V.tunit === 'T₁' ? 'T_1' : V.tunit}}`]);
      (V.show || [0, 1]).slice(1).forEach((m) => rows.push([`${ch.members[m].label} ÷ parent now`, hide.has('ratio') ? '?' : sig(a[m] / a[0], 3)]));
    }
    F.readout(rows);
  }

  F.onChange(draw);
  F.draw(draw);
  F.caption(P.caption || 'Activities (decays per second) of a chain’s members, starting from a pure parent, from Bateman’s exact solution; each is divided by the parent’s activity at the start. Half-lives from NUBASE2020. In the real series a member such as polonium-214 (164 μs) follows its parent so closely that its curve would hide under its parent’s.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!VIEWS[P.chain]) p.push(`nuc-chain: unknown chain “${P.chain}”`);
  if (!(P.ratio >= 0.01 && P.ratio <= 100)) p.push('nuc-chain: ratio must lie in 0.01–100');
  if (P.time !== null && VIEWS[P.chain] && !(P.time >= VIEWS[P.chain].x[0] && P.time <= VIEWS[P.chain].x[1])) p.push(`nuc-chain: time must lie in ${VIEWS[P.chain].x.join('–')}`);
  for (const h of P.hide || []) if (!['ratio', 'kind', 'peak'].includes(h)) p.push(`nuc-chain: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`nuc-chain: unknown control “${c}”`);
  return p;
}
