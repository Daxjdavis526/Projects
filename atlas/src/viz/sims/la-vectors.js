// Vectors in Rⁿ, drawn two ways. Left: each vector as a stem plot, one
// lollipop per component k = 1 … n with height vₖ — so a vector with five or
// fifty components is still a picture. Right: the plane the first two vectors
// span, with u laid along the horizontal and v at its true angle θ. Lengths
// and the angle there are exact whatever n is, because any two vectors lie in
// a plane of their own; how that plane sits inside Rⁿ is not shown. Drag the
// dots of a draggable vector to change its components; a scale slider
// multiplies it (the angle does not move); “subtract the mean” centres both,
// which turns cos θ into the correlation coefficient. In combination mode,
// sliders c₁ and c₂ weigh two vectors, and the stems of c₁a₁ + c₂a₂ are drawn
// over a target b, with the length of what is left over. The arithmetic is in
// model/la-linear.js (test/la-linear.test.mjs).
//
//   { type: 'la-vectors', params: {
//       vectors: [{ name: 'u', values: [1, 2, 0, 2, 4], color: 'accent' },
//                 { name: 'v', values: [2, 1, 2, 4, 0], color: 'warn', drag: true }],
//                                    // name: plain text on the canvas; tex: its TeX for the readout (default \mathbf{name})
//       labels: null,                // the components' names under the stems (plain text; default 1 … n)
//       xlabel: 'component', y: null,   // the stem panel's caption and value range (default fitted, with room to drag)
//       snap: 0.5,                   // dragged values snap to this step
//       plane: true,                 // the right-hand panel (needs two vectors)
//       scale: false,                // a slider s that multiplies the second vector
//       center: false,               // a toggle: subtract each vector's mean (then cos θ is the correlation coefficient)
//       combo: null,                 // { of: [0, 1], target: 2, c: [1, 1], range: [-3, 3], step: 0.1 }
//       readout: true,               // false hides every number; or a list of 'len', 'dot', 'cos', 'theta', 'resid'
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/la-linear.js';

export const defaults = { vectors: [], labels: null, xlabel: 'component', y: null, snap: 0.5, plane: true, scale: false, center: false, combo: null, readout: true };

const COLORS = ['accent', 'warn', 'good', 'violet', 'teal'];
const fmt = (x, d = 3) => (Number.isFinite(x) ? String(+x.toPrecision(d)) : '\\text{—}');

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'Vectors as stem plots, one stem per component, and the plane two of them span' });
  const vecs = P.vectors.map((v, k) => ({ name: v.name || `v${k + 1}`, tex: v.tex || `\\mathbf{${v.name || 'v'}}`, color: v.color || COLORS[k % COLORS.length], drag: !!v.drag, raw: v.values.slice() }));
  const n = vecs[0].raw.length;
  const combo = P.combo ? { of: [0, 1], target: 2, c: [1, 1], range: [-3, 3], step: 0.1, ...P.combo } : null;
  const showPlane = P.plane && !combo && vecs.length >= 2;
  if (P.scale && vecs.length >= 2) F.slider({ key: 's', label: `Scale $${vecs[1].tex}$ by $s$`, min: -2, max: 3, step: 0.1, value: 1, explain: `Multiplies every component of $${vecs[1].tex}$ by $s$: its length changes, its direction does not (unless $s < 0$, which reverses it).` });
  if (P.center) F.toggle({ key: 'ctr', label: 'Subtract each vector’s mean', value: false, explain: 'Centred data: then $\\cos\\theta$ is the correlation coefficient of the two data sets.' });
  if (combo) {
    const [i, j] = combo.of;
    F.slider({ key: 'c1', label: `Weight $c_1$ on $${vecs[i].tex}$`, min: combo.range[0], max: combo.range[1], step: combo.step, value: combo.c[0], explain: `How much of $${vecs[i].tex}$ goes into the combination.` });
    F.slider({ key: 'c2', label: `Weight $c_2$ on $${vecs[j].tex}$`, min: combo.range[0], max: combo.range[1], step: combo.step, value: combo.c[1], explain: `How much of $${vecs[j].tex}$ goes into the combination.` });
  }

  // the stem panel's range, fixed for the sim's life so dragging does not rescale it
  const all = vecs.flatMap((v) => v.raw);
  const big = Math.max(1, ...all.map(Math.abs)) * (vecs.some((v) => v.drag) || P.scale ? 1.5 : 1.15);
  const yr = P.y || [Math.min(0, ...all) < 0 || vecs.some((v) => v.drag) ? -big : -0.12 * big, big];
  const split = showPlane ? 0.6 : 1;
  const left = new Plot(canvas, { x: [0.4, n + 0.6], y: yr, xlabel: '', ylabel: '', xticks: 0, grid: true });
  const right = showPlane ? new Plot(canvas, { x: [-1, 1], y: [-1, 1], equal: true, xlabel: '', ylabel: '', grid: true }) : null;
  let planeR = 0;   // the plane panel's scale: grows to fit, never shrinks

  const values = (v, k) => {
    let x = v.raw.slice();
    if (k === 1 && P.scale) x = x.map((t) => t * +F.params.s);
    if (P.center && F.params.ctr) x = M.centred(x);
    return x;
  };
  const off = (j, m) => (j - (m - 1) / 2) * Math.min(0.22, 0.6 / m);
  const shownVecs = () => (combo ? [combo.of[0], combo.of[1], combo.target] : vecs.map((_, k) => k));

  // draggable components
  vecs.forEach((v, j) => {
    if (!v.drag) return;
    for (let k = 0; k < n; k++) {
      left.handle(() => [k + 1 + off(shownVecs().indexOf(j), shownVecs().length), values(v, j)[k]], (x, y) => {
        if (P.center && F.params.ctr) return;           // dragging centred data would move every stem at once
        const s = j === 1 && P.scale ? +F.params.s || 1 : 1;
        let t = Math.max(yr[0], Math.min(yr[1], y / s));
        if (P.snap) t = Math.round(t / P.snap) * P.snap;
        v.raw[k] = t;
      }, { hollow: true, r: 8 });
    }
  });
  left.onDrag = () => { draw(); F.notify('values'); };
  F.onChange(() => draw());

  function region() {
    const w = canvas.clientWidth || 600;
    left.o.pad = { l: 42, r: showPlane ? Math.round(w * (1 - split)) + 8 : 14, t: 22, b: 30 };
    if (right) right.o.pad = { l: Math.round(w * split) + 26, r: 14, t: 22, b: 30 };
  }

  function draw() {
    region();
    left.clear();
    const g = left.ctx;
    const idx = shownVecs(), m = idx.length;
    // component names under the stems
    for (let k = 0; k < n; k++) left.text(P.labels ? P.labels[k] : String(k + 1), k + 1, left.vy0, { color: 'ink3', align: 'center', dy: 12, size: 11 });
    if (P.xlabel) left.text(P.xlabel, left.R, left.T - 10, { screen: true, color: 'ink3', align: 'right', size: 11 });
    const stems = (x, color, { width = 3, alpha = 1, ring = false } = {}) => x.forEach((val, k) => {
      const at = k + 1 + offs, top = val;
      left.line(at, 0, at, top, { color, width, alpha });
      left.point(at, top, { color, r: ring ? 5.5 : 4.5 });
      if (ring) left.point(at, top, { color: 'panel', r: 3 });
    });
    let offs = 0;
    if (combo) {
      const [i, j] = combo.of, a = values(vecs[i], i), b = values(vecs[j], j), tgt = values(vecs[combo.target], combo.target);
      const c1 = +F.params.c1, c2 = +F.params.c2, mix = a.map((x, k) => c1 * x + c2 * b[k]);
      offs = off(0, 3); stems(a, vecs[i].color, { width: 2, alpha: 0.55 });
      offs = off(1, 3); stems(b, vecs[j].color, { width: 2, alpha: 0.55 });
      offs = off(2, 3);
      stems(mix, 'gold', { width: 3.2 });
      tgt.forEach((val, k) => { left.point(k + 1 + offs, val, { color: vecs[combo.target].color, r: 7 }); left.point(k + 1 + offs, val, { color: 'panel', r: 4.2 }); });
      const resid = M.normN(tgt.map((x, k) => x - mix[k]));
      legend([[vecs[i].name, vecs[i].color], [vecs[j].name, vecs[j].color], [`c₁${vecs[i].name} + c₂${vecs[j].name}`, 'gold'], [`${vecs[combo.target].name} (rings)`, vecs[combo.target].color]]);
      left.drawHandles();
      const want = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
      F.readout(P.readout === false ? [] : [want('resid') && [`$\\|${vecs[combo.target].tex} - (c_1${vecs[i].tex} + c_2${vecs[j].tex})\\|$`, fmt(resid)]].filter(Boolean));
      return;
    }
    idx.forEach((k, j) => { offs = off(j, m); stems(values(vecs[k], k), vecs[k].color); });
    legend(idx.map((k) => [vecs[k].name, vecs[k].color]));
    left.drawHandles();
    if (P.center && F.params.ctr) left.text('centred: each mean subtracted', left.R, left.T + 4, { screen: true, color: 'ink3', align: 'right', size: 11 });

    // the plane of the first two
    const u = values(vecs[0], 0), v = vecs.length > 1 ? values(vecs[1], 1) : null;
    const nu = M.normN(u), nv = v ? M.normN(v) : NaN, dot = v ? M.dotN(u, v) : NaN, th = v ? M.angleN(u, v) : NaN;
    if (right && v) {
      const pl = M.planeOf(u, v);
      planeR = Math.max(planeR, nu, nv, 1e-9);
      const R = planeR;
      right.setView([-0.75 * R, 1.25 * R], [-0.45 * R, 1.15 * R]);
      right.resize(); right.refreshTheme(); right.grid(); right.axes();
      right.text(`the plane of ${vecs[0].name} and ${vecs[1].name}`, right.L + 4, right.T - 12, { screen: true, color: 'ink3', size: 11 });
      if (pl) {
        const [vx, vy] = pl.v;
        right.line(vx, vy, vx, 0, { color: 'ink4', width: 1.2, dash: [4, 4] });
        right.arrow(0, 0, pl.u[0], 0, { color: vecs[0].color, width: 2.8, label: vecs[0].name, ldx: 6, ldy: 12 });
        if (nv > 0) {
          right.arrow(0, 0, vx, vy, { color: vecs[1].color, width: 2.8, label: vecs[1].name, ldx: 6, ldy: -10 });
          const r = 0.28 * Math.min(nu, nv);
          right.curve((t) => r * Math.cos(t), (t) => r * Math.sin(t), 0, th, { color: 'gold', width: 2 });
          const showTheta = P.readout === true || (Array.isArray(P.readout) && P.readout.includes('theta'));
          right.text(showTheta ? `θ = ${(th * 180 / Math.PI).toFixed(1)}°` : 'θ', (r * 1.25) * Math.cos(th / 2), (r * 1.25) * Math.sin(th / 2), { color: 'gold', weight: 700, dx: 4, dy: -4 });
        }
      }
    }
    const want = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
    const rows = [];
    if (want('len')) vecs.slice(0, Math.min(2, vecs.length)).forEach((vv, k) => rows.push([`$\\|${vv.tex}\\|$`, fmt(M.normN(values(vv, k)))]));
    if (v && want('dot')) rows.push([`$${vecs[0].tex}\\cdot${vecs[1].tex}$`, fmt(dot, 4)]);
    if (v && want('cos')) rows.push(['$\\cos\\theta$', fmt(Math.cos(th))]);
    if (v && want('theta')) rows.push(['$\\theta$', Number.isFinite(th) ? `${(th * 180 / Math.PI).toFixed(1)}^\\circ` : '\\text{—}']);
    F.readout(P.readout === false ? [] : rows);
  }
  function legend(items) {
    let x = left.L + 6;
    const g = left.ctx;
    g.save(); g.font = '650 12px Inter, system-ui, sans-serif';
    for (const [name, color] of items) {
      left.point(left.ix(x + 4), left.iy(left.T - 10), { color, r: 4 });
      left.text(name, x + 12, left.T - 10, { screen: true, color, weight: 650, size: 12 });
      x += 26 + g.measureText(name).width;
    }
    g.restore();
  }
  F.draw(draw);
  F.caption(P.caption || (showPlane
    ? 'Left: one stem per component. Right: the plane the two vectors span, with the first laid along the horizontal — lengths and the angle are exact, but how this plane sits inside Rⁿ is not shown.'
    : 'One stem per component: the stem’s height is that component’s value.'));
  return { get: (k) => (k === 'values' ? vecs.map((v) => v.raw.slice()) : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const V = P.vectors || [];
  if (!V.length) return ['la-vectors needs vectors: [{ name, values }]'];
  const n = V[0].values?.length;
  V.forEach((v, k) => {
    if (!Array.isArray(v.values) || !v.values.length || !v.values.every(Number.isFinite)) problems.push(`vectors[${k}].values must be a list of numbers`);
    else if (v.values.length !== n) problems.push(`vectors[${k}] has ${v.values.length} components, vectors[0] has ${n}`);
    if (v.color && !COLORS.concat(['gold', 'bad', 'ink2']).includes(v.color)) problems.push(`vectors[${k}].color “${v.color}” is not a theme colour`);
    if (v.name && /[$\\_^]/.test(v.name)) problems.push(`vectors[${k}].name is plain text (use Unicode), not TeX`);
  });
  if (P.labels && P.labels.length !== n) problems.push(`labels needs ${n} entries`);
  for (const s of P.labels || []) if (/[$\\_^]/.test(String(s))) problems.push(`label “${s}” is plain text: use Unicode, not TeX`);
  if (P.combo) {
    const c = { of: [0, 1], target: 2, ...P.combo };
    if (![...c.of, c.target].every((i) => Number.isInteger(i) && i >= 0 && i < V.length)) problems.push('combo.of and combo.target must name vectors by index');
  }
  if (P.y && !(Array.isArray(P.y) && P.y[0] < P.y[1])) problems.push('y must be [min, max]');
  if (Array.isArray(P.readout)) for (const r of P.readout) if (!['len', 'dot', 'cos', 'theta', 'resid'].includes(r)) problems.push(`unknown readout “${r}”`);
  return problems;
}
