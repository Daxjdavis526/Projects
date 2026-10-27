// Coulomb forces between point charges, drawn to one common scale. Two modes:
//
//   pair   two charges on a line: set each charge and their separation; the forces on
//          the two are always equal in size and opposite in direction (Newton's third
//          law), whatever the charges — and fall as 1/r².
//   free   up to four charges you drag about the plane. For the chosen charge, each
//          other charge's push or pull (thin arrows, in that charge's colour) and their
//          vector sum (thick gold arrow), optionally added tip to tail and split into
//          components. Superposition: each force is computed as if the others were absent.
//
// Positive charges are red, negative blue. Physics in model/em-charges.js (tested).
//
//   { type: 'em-coulomb', params: {
//       mode: 'free',                      // free | pair
//       unit: 'cm', qunit: 'uC',           // positions in m | cm | mm; charges in uC | nC
//       x: [-10, 10], y: [-6, 6],          // the view (free mode), in `unit`
//       aspect: '',                        // free: the picture's shape, '' (16:10) | wide (2:1) | square
//       charges: [{ x, y, q, label: 'A', drag: true }],   // free mode
//       target: 0,                         // free: the charge whose forces are shown ('all': the net force on every charge)
//       q1: 3, q2: -2, r: 10,              // pair mode (qunit, unit)
//       sliders: true,                     // pair: q1, q2, r; free: one slider per charge
//       sum: false,                        // free: add the forces tip to tail
//       components: false,                 // free: the net force's x and y components
//       net: true,                         // free: draw the net (gold) arrow
//       controls: true,                    // free, live: choose the charge, tip-to-tail and components
//       scale: null,                       // arrow scale, N per `unit` of picture (default: from the starting arrangement)
//       values: true,                      // write each force's size beside its arrow
//       ask: false,                        // hide every number (arrows, readout) — a question's picture
//       forces: true,                      // false: draw the charges only, no force arrows
//       static: false, readout: true,
//   } }

import { Plot } from '../plot.js';
import * as C from '../model/em-charges.js';

const UNITS = { m: 1, cm: 0.01, mm: 0.001 };
const QUNITS = { uC: 1e-6, nC: 1e-9 };
const QTEXT = { uC: 'µC', nC: 'nC' };
const QTEX = { uC: '\\mu\\mathrm{C}', nC: '\\mathrm{nC}' };
const SOURCE_COLORS = ['violet', 'teal', 'warn', 'good'];
export const defaults = {
  mode: 'free', unit: 'cm', qunit: 'uC', x: [-10, 10], y: [-6, 6], aspect: '', target: 0, q1: 3, q2: -2, r: 10,
  charges: [{ x: -5, y: -2, q: 2, label: 'A' }, { x: 4, y: -2, q: -3, label: 'B' }, { x: -1, y: 3.5, q: 1, label: 'C' }],
  sliders: true, sum: false, components: false, net: true, controls: true, scale: null, values: true, ask: false, static: false, readout: true, forces: true,
};
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
/** A force for a canvas label, with an SI prefix: 3.2 N, 45 mN, 120 µN. */
export function fmtF(F) {
  const a = Math.abs(F);
  if (a >= 1e3) return `${trim(F / 1e3)} kN`;
  if (a >= 1) return `${trim(F)} N`;
  if (a >= 1e-3) return `${trim(F * 1e3)} mN`;
  if (a >= 1e-6) return `${trim(F * 1e6)} µN`;
  return `${trim(F * 1e9)} nN`;
}
const texF = (F) => fmtF(F).replace(' µN', '\\,\\mu\\mathrm{N}').replace(/ (k|m|n)?N$/, (m, p) => `\\,\\mathrm{${p || ''}N}`);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const live = !P.static;
  const L = UNITS[P.unit], QF = QUNITS[P.qunit];
  const pair = P.mode === 'pair';
  const { canvas } = F.canvas({ aspect: pair ? 'wide' : P.aspect, label: P.alt || 'Point charges and the electric forces between them' });
  const st = { charges: (pair ? [] : P.charges).map((c, i) => ({ ...c, label: c.label ?? 'ABCD'[i] })) };
  const sl = (o) => (live && P.sliders ? F.slider(o) : (F.params[o.key] = o.value));
  if (pair) {
    sl({ key: 'q1', label: 'Charge $q_1$', min: -10, max: 10, step: 0.5, value: P.q1, unit: QTEX[P.qunit], explain: 'The left charge. Negative: an excess of electrons.' });
    sl({ key: 'q2', label: 'Charge $q_2$', min: -10, max: 10, step: 0.5, value: P.q2, unit: QTEX[P.qunit], explain: 'The right charge.' });
    sl({ key: 'r', label: 'Separation $r$', min: 2, max: 20, step: 0.5, value: P.r, unit: `\\mathrm{${P.unit}}`, explain: 'Centre to centre. Double it and both forces drop to a quarter.' });
  } else if (live && P.sliders) {
    st.charges.forEach((c, i) => F.slider({ key: `q${i}`, label: `Charge ${c.label}`, min: -10, max: 10, step: 0.5, value: c.q, unit: QTEX[P.qunit], explain: i === 0 ? 'Drag the charges in the picture; set their sizes here.' : '' }));
  }
  if (!pair) st.charges.forEach((c, i) => { if (F.params[`q${i}`] === undefined) F.params[`q${i}`] = c.q; });
  if (!pair) {
    const ctl = live && P.controls && P.forces;
    const opt = (o) => (ctl ? F.choice(o) : (F.params[o.key] = o.value));
    const tog = (o) => (ctl ? F.toggle(o) : (F.params[o.key] = o.value));
    opt({ key: 'target', label: 'Forces on', options: [...st.charges.map((c, i) => [i, c.label]), ['all', 'every charge (net only)']], value: P.target, explain: 'The charge whose forces are drawn — or the net force on each of them.' });
    tog({ key: 'sum', label: 'Add the forces tip to tail', value: P.sum, explain: 'Slide each force so it starts where the previous one ends: the gold net force joins the start to the final tip.' });
    tog({ key: 'components', label: 'Show the net force’s $x$ and $y$ components', value: P.components });
  }
  const plot = new Plot(canvas, { x: pair ? [-12, 12] : P.x, y: pair ? [-3.5, 3.5] : P.y, equal: true, xlabel: pair ? '' : `x (${P.unit})`, ylabel: pair ? '' : `y (${P.unit})`, grid: !pair, axes: !pair });
  if (!pair && live) st.charges.forEach((c) => { if (c.drag !== false) plot.handle(() => [c.x, c.y], (x, y) => { c.x = clamp(x, plot.vx0, plot.vx1); c.y = clamp(y, plot.vy0, plot.vy1); }, { r: 12 }); });
  plot.onDrag = () => draw();

  // in SI units, for the model
  const si = () => (pair
    ? [{ x: (-F.params.r / 2) * L, y: 0, q: F.params.q1 * QF }, { x: (F.params.r / 2) * L, y: 0, q: F.params.q2 * QF }]
    : st.charges.map((c, i) => ({ x: c.x * L, y: c.y * L, q: F.params[`q${i}`] * QF })));
  // one arrow scale for everything, fixed when the picture is made (N per unit of picture length)
  let scale = P.scale;
  if (!scale) {
    const ch = si();
    let big = 0;
    if (pair) big = C.coulomb(ch[0].q, ch[1].q, Math.hypot(ch[0].x - ch[1].x, ch[0].y - ch[1].y));
    else ch.forEach((_, i) => { const { parts, net } = C.forcesOn(i, ch); big = Math.max(big, Math.hypot(...net), ...parts.map((p) => Math.hypot(...p.F))); });
    const span = pair ? 24 : P.x[1] - P.x[0];
    scale = (big || 1) / ((pair ? 0.13 : 0.22) * span);
  }
  F.onChange(() => draw());

  function arrowTo(x, y, Fx, Fy, o) {
    const len = Math.hypot(Fx, Fy) / scale, cap = 0.42 * (plot.vx1 - plot.vx0);
    if (len < 1e-9) return;
    const k = Math.min(len, cap) / len;
    plot.arrow(x, y, x + (Fx / scale) * k, y + (Fy / scale) * k, o);
    if (len > cap) plot.text('off scale', x + (Fx / scale) * k, y + (Fy / scale) * k, { dx: 6, dy: 14, color: o.color, size: 11 });
  }
  function disc(x, y, q, label) {
    const col = q > 0 ? 'bad' : q < 0 ? 'accent' : 'ink3';
    plot.point(x, y, { color: col, r: 11 });
    plot.text(q > 0 ? '+' : q < 0 ? '−' : '0', x, y, { color: 'bg', size: 15, weight: 800, align: 'center', dy: 0.5, halo: false });
    if (label) plot.text(label, x, y, { dx: 14, dy: -14, color: col, size: 12.5, weight: 700 });
  }

  function draw() {
    plot.clear();
    const ch = si();
    if (pair) {
      const [a, b] = ch, r = F.params.r;
      const Fm = C.coulomb(a.q, b.q, Math.hypot(a.x - b.x, a.y - b.y));
      const Fa = C.forceFrom(a, b), Fb = C.forceFrom(b, a);
      plot.line(-r / 2, 0, r / 2, 0, { color: 'ink4', width: 1, dash: [4, 5] });
      // the force on q₁ on the lower row, the force on q₂ on the upper row, so the two never overlap
      if (Fm > 0 && P.forces) {
        arrowTo(-r / 2, 0.8, Fa[0], 0, { color: 'gold', width: 3, head: 11 });
        arrowTo(r / 2, 1.75, Fb[0], 0, { color: 'gold', width: 3, head: 11 });
        plot.line(-r / 2, 0.15, -r / 2, 0.8, { color: 'ink4', width: 1, dash: [2, 3] });
        plot.line(r / 2, 0.15, r / 2, 1.75, { color: 'ink4', width: 1, dash: [2, 3] });
        if (P.values && !P.ask) {
          plot.text(`on q₁: ${fmtF(Fm)}`, -r / 2, 0.8, { dx: Fa[0] < 0 ? 8 : -8, dy: 0, align: Fa[0] < 0 ? 'left' : 'right', color: 'gold', size: 12, weight: 650 });
          plot.text(`on q₂: ${fmtF(Fm)}`, r / 2, 1.75, { dx: Fb[0] < 0 ? 8 : -8, dy: 0, align: Fb[0] < 0 ? 'left' : 'right', color: 'gold', size: 12, weight: 650 });
        }
      }
      disc(-r / 2, 0, F.params.q1, null);
      disc(r / 2, 0, F.params.q2, null);
      plot.text(P.ask ? 'q₁' : `q₁ = ${signed(F.params.q1)} ${QTEXT[P.qunit]}`, -r / 2, 0, { dy: 22, align: 'center', color: F.params.q1 > 0 ? 'bad' : 'accent', size: 12.5, weight: 700 });
      plot.text(P.ask ? 'q₂' : `q₂ = ${signed(F.params.q2)} ${QTEXT[P.qunit]}`, r / 2, 0, { dy: 22, align: 'center', color: F.params.q2 > 0 ? 'bad' : 'accent', size: 12.5, weight: 700 });
      plot.text(a.q * b.q > 0 ? 'like charges: they repel' : a.q * b.q < 0 ? 'unlike charges: they attract' : 'one charge is zero: no force', plot.L + 6, 14, { screen: true, color: 'ink2', size: 12, weight: 600 });
      plot.text(`r = ${trim(r)} ${P.unit}`, 0, -1.6, { align: 'center', color: 'ink3', size: 12 });
      if (P.readout !== false && !P.ask) F.readout([['force on each, $F = k|q_1q_2|/r^2$', texF(Fm)], ['separation $r$', `${trim(r)}\\,\\mathrm{${P.unit}}`]]);
      return;
    }
    const tgt = F.params.target === 'all' ? null : +F.params.target;
    // the forces on the chosen charge, or the net force on every charge
    if (!P.forces) { /* the charges alone */ } else if (tgt === null) {
      let sx = 0, sy = 0, big = 0;
      const nets = ch.map((c, i) => {
        const { net } = C.forcesOn(i, ch);
        arrowTo(c.x / L, c.y / L, net[0], net[1], { color: 'gold', width: 2.8, head: 10 });
        const m = Math.hypot(...net), k2 = m > 0 ? Math.min(m / scale, 0.42 * (plot.vx1 - plot.vx0)) / (m / scale) : 0;
        if (!P.ask && m > 0) plot.text(P.values ? fmtF(m) : 'net', c.x / L + (net[0] / scale) * k2, c.y / L + (net[1] / scale) * k2, { dx: 8, dy: -10, color: 'gold', size: 12, weight: 650 });
        sx += net[0]; sy += net[1]; big = Math.max(big, m);
        return m;
      });
      if (P.readout !== false && !P.ask) {
        // the internal forces cancel in pairs, so the sum is zero up to rounding: show it as 0
        const sum = Math.hypot(sx, sy) < 1e-9 * (big || 1) ? 0 : Math.hypot(sx, sy);
        F.readout([...st.charges.map((c, i) => [`net force on ${c.label}`, texF(nets[i])]), ['their vector sum', sum === 0 ? '0' : texF(sum)]]);
      }
    } else {
      const { parts, net } = C.forcesOn(tgt, ch), c0 = st.charges[tgt];
      let ax = c0.x, ay = c0.y;
      parts.forEach((p, k) => {
        const col = SOURCE_COLORS[p.j % SOURCE_COLORS.length];
        if (F.params.sum && k > 0) { arrowTo(ax, ay, p.F[0], p.F[1], { color: col, width: 1.6, head: 8, dash: [5, 4] }); }
        arrowTo(c0.x, c0.y, p.F[0], p.F[1], { color: col, width: 1.8, head: 8 });
        const m = Math.hypot(...p.F) / scale, k2 = m > 0 ? Math.min(m, 0.42 * (plot.vx1 - plot.vx0)) / m : 0;
        if (P.values && !P.ask) plot.text(`from ${st.charges[p.j].label}: ${fmtF(Math.hypot(...p.F))}`, c0.x + (p.F[0] / scale) * k2, c0.y + (p.F[1] / scale) * k2, { dx: 6, dy: 12, color: col, size: 11.5 });
        else if (!P.ask) plot.text(`from ${st.charges[p.j].label}`, c0.x + (p.F[0] / scale) * k2, c0.y + (p.F[1] / scale) * k2, { dx: 6, dy: 12, color: col, size: 11.5 });
        if (F.params.sum) { ax += p.F[0] / scale; ay += p.F[1] / scale; }
      });
      const Fn = Math.hypot(...net);
      if (parts.length > 1 && P.net) {
        arrowTo(c0.x, c0.y, net[0], net[1], { color: 'gold', width: 3.2, head: 12 });
        const m = Fn / scale, k2 = m > 0 ? Math.min(m, 0.42 * (plot.vx1 - plot.vx0)) / m : 0;
        if (!P.ask && Fn > 0) plot.text(P.values ? `net: ${fmtF(Fn)}` : 'net', c0.x + (net[0] / scale) * k2, c0.y + (net[1] / scale) * k2, { dx: 8, dy: -10, color: 'gold', size: 12.5, weight: 700 });
      }
      if (F.params.components && P.net && Fn > 0) {
        arrowTo(c0.x, c0.y, net[0], 0, { color: 'warn', width: 1.6, head: 7, dash: [3, 3] });
        arrowTo(c0.x + net[0] / scale, c0.y, 0, net[1], { color: 'good', width: 1.6, head: 7, dash: [3, 3] });
      }
      if (P.readout !== false && !P.ask) {
        const ang = (Math.atan2(net[1], net[0]) * 180) / Math.PI;
        F.readout([
          [`net force on ${c0.label}`, texF(Fn)], ['direction', `${trim(ang)}^\\circ\\ \\text{from}\\ +x`],
          ['$F_x$', texF(net[0])], ['$F_y$', texF(net[1])],
          ...parts.map((p) => [`from ${st.charges[p.j].label}`, texF(Math.hypot(...p.F))]),
        ]);
      }
    }
    st.charges.forEach((c, i) => disc(c.x, c.y, F.params[`q${i}`], P.ask ? c.label : `${c.label}: ${signed(F.params[`q${i}`])} ${QTEXT[P.qunit]}`));
    plot.drawHandles();
  }
  F.draw(draw);
  F.caption(pair
    ? 'Two point charges; each gold arrow is the force on that charge, both drawn to one scale (arrows too long for the picture are cut short and marked). The charges are treated as points, far from anything else.'
    : 'Point charges in a plane, in still surroundings. Thin arrows: the force from each other charge on the chosen one; gold: their vector sum. All arrows share one scale; arrows too long for the picture are cut short and marked.');
  return { get: (k) => F.params[k] };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const signed = (q) => `${q > 0 ? '+' : q < 0 ? '−' : ''}${trim(Math.abs(q))}`;

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!['free', 'pair'].includes(P.mode)) problems.push('mode must be free or pair');
  if (!UNITS[P.unit]) problems.push('unit must be m, cm or mm');
  if (!QUNITS[P.qunit]) problems.push('qunit must be uC or nC');
  if (!['', 'wide', 'square'].includes(P.aspect)) problems.push("aspect must be '', wide or square");
  if (P.mode === 'pair') {
    for (const k of ['q1', 'q2']) if (!(P[k] >= -10 && P[k] <= 10)) problems.push(`${k} must lie in [−10, 10]`);
    if (!(P.r >= 2 && P.r <= 20)) problems.push('r must lie in [2, 20]');
  } else {
    if (!Array.isArray(P.charges) || P.charges.length < 1 || P.charges.length > 4) problems.push('charges: one to four');
    else {
      P.charges.forEach((c, i) => {
        if (![c.x, c.y, c.q].every(Number.isFinite)) problems.push(`charge ${i}: x, y and q must be numbers`);
        // live charges get a slider over [−10, 10]; a fixed picture may show any charge up to 1000 units
        const lim = !P.static && P.sliders ? 10 : 1000;
        if (!(c.q >= -lim && c.q <= lim)) problems.push(`charge ${i}: q must lie in [−${lim}, ${lim}]`);
      });
      for (let i = 0; i < P.charges.length; i++) for (let j = 0; j < i; j++) if (Math.hypot(P.charges[i].x - P.charges[j].x, P.charges[i].y - P.charges[j].y) < 1e-9) problems.push(`charges ${j} and ${i} sit on top of each other`);
      if (P.target !== 'all' && !(Number.isInteger(P.target) && P.target >= 0 && P.target < P.charges.length)) problems.push('target must be the index of a charge, or all');
    }
    if (!(P.x[0] < P.x[1] && P.y[0] < P.y[1])) problems.push('x and y must be increasing ranges');
  }
  for (const k of ['sliders', 'sum', 'components', 'net', 'controls', 'values', 'ask', 'static', 'readout', 'forces']) if (typeof P[k] !== 'boolean') problems.push(`${k} must be true or false`);
  if (P.scale !== null && !(P.scale > 0)) problems.push('scale must be positive (or null)');
  return problems;
}
