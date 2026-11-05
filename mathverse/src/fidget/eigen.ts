// Eigenvector Machine: grab the images of the basis vectors and bend the whole
// plane. The eigen-directions — lines the matrix only stretches — glow; the
// unit square becomes a parallelogram whose area is |det A|.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../modules/types';
import type { Graphics } from '../engine/plot2d';
import { SERIES } from '../engine/colors';
import { eig2, approach, smoothstep, snapTo } from '../core/numeric/fidget';
import { fmt, tx, ping, frameLoop } from './common';

type P2 = [number, number];
const SNAP = 0.25;
const PRESETS: Record<string, [number, number, number, number]> = {   // a11, a21, a12, a22 (columns)
  stretch: [2, 0, 0, 0.5],
  symmetric: [2, 1, 1, 2],
  shear: [1, 0, 1, 1],
  rotation: [Math.SQRT1_2, Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT1_2],
  reflection: [1, 0, 0, -1],
  projection: [1, 0, 0, 0],
  spiral: [0.9, 0.5, -0.5, 0.9],
  identity: [1, 0, 0, 1],
};

function create(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.opts.xLabel = ''; plot.opts.yLabel = '';
  const read = (): number[] => [ctx.params.a11, ctx.params.a21, ctx.params.a12, ctx.params.a22];
  let target = read(), shown = target.slice();
  let intro = 0;                                // 0 → 1: the plane transforms from the identity on arrival
  let vT: P2 = [ctx.params.vx, ctx.params.vy], vS: P2 = [...vT];
  let lastPreset = ctx.choices.preset;
  let aligned = false, glow = 0;
  let powerClock = 0, powerIters = 0;

  const M = (): number[] => {
    const s = smoothstep(intro);
    return [1 + s * (shown[0] - 1), s * shown[1], s * shown[2], 1 + s * (shown[3] - 1)];
  };
  const apply = (m: number[], p: P2): P2 => [m[0] * p[0] + m[2] * p[1], m[1] * p[0] + m[3] * p[1]];

  const draw = (g: Graphics) => {
    const m = M();
    const dark = ctx.dark;
    const { x0, x1, y0, y1 } = g.view;
    const ext = 2 * Math.max(Math.abs(x0), Math.abs(x1), Math.abs(y0), Math.abs(y1));
    const K = Math.ceil(ext);
    // the transformed grid
    const gridCol = dark ? 'rgba(106,169,255,0.30)' : 'rgba(40,90,190,0.30)';
    for (let k = -K; k <= K; k++) {
      g.line(apply(m, [k, -K]), apply(m, [k, K]), { color: k === 0 ? SERIES[2] : gridCol, width: k === 0 ? 1.6 : 1, alpha: k === 0 ? 0.8 : 1 });
      g.line(apply(m, [-K, k]), apply(m, [K, k]), { color: k === 0 ? SERIES[3] : gridCol, width: k === 0 ? 1.6 : 1, alpha: k === 0 ? 0.8 : 1 });
    }
    const e = eig2(shown[0], shown[2], shown[1], shown[3]);
    // determinant as area: the image of the unit square
    if (ctx.toggles.square) {
      const sq = [apply(m, [0, 0]), apply(m, [1, 0]), apply(m, [1, 1]), apply(m, [0, 1])];
      const det = m[0] * m[3] - m[1] * m[2];
      const col = det >= 0 ? SERIES[0] : SERIES[2];
      g.polygon(sq, { fill: col, alpha: 0.28 });
      g.path([...sq, sq[0]], { color: col, width: 1.5 });
      const c = apply(m, [0.5, 0.5]);
      g.text(c, `det ${fmt(det, 3)}`, { color: dark ? '#e6e9ef' : '#1b1f2a', font: '600 12px Inter, sans-serif', align: 'center', baseline: 'middle' });
    }
    if (ctx.toggles.circle) {
      g.parametric((t) => apply(m, [Math.cos(t), Math.sin(t)])[0], (t) => apply(m, [Math.cos(t), Math.sin(t)])[1], 0, 2 * Math.PI, { color: SERIES[4], width: 1.8 }, 160);
    }
    // eigen-directions glow (of the matrix you are building)
    if (ctx.toggles.eig && intro >= 1) {
      const cols = [SERIES[1], SERIES[5]];
      e.vectors.forEach((ev, i) => {
        const a: P2 = [-ev[0] * ext, -ev[1] * ext], b: P2 = [ev[0] * ext, ev[1] * ext];
        const pulse = 1 + 0.25 * glow;
        g.line(a, b, { color: cols[i], width: 16 * pulse, alpha: 0.07 });
        g.line(a, b, { color: cols[i], width: 7 * pulse, alpha: 0.16 });
        g.line(a, b, { color: cols[i], width: 2.2, alpha: 0.95 });
        // where the unit eigenvector lands: λ times itself
        const lam = e.values[i];
        g.arrow([0, 0], [ev[0] * lam, ev[1] * lam], { color: cols[i], width: 3 });
        const lp: P2 = [ev[0] * Math.max(1.2, Math.abs(lam) + 0.5) * Math.sign(lam || 1), ev[1] * Math.max(1.2, Math.abs(lam) + 0.5) * Math.sign(lam || 1)];
        g.text(lp, `λ${i ? '₂' : '₁'} = ${fmt(lam, 3)}`, { color: cols[i], font: '600 13px Inter, sans-serif', baseline: 'middle' }, 8, 0);
      });
    }
    // the test vector and its image
    if (ctx.toggles.test) {
      const Av = apply(m, vS);
      const glowCol = aligned ? SERIES[1] : dark ? '#e6e9ef' : '#1b1f2a';
      if (aligned) g.line([0, 0], vS, { color: SERIES[1], width: 12, alpha: 0.18 });
      g.arrow([0, 0], Av, { color: SERIES[6], width: 2.6 });
      g.arrow([0, 0], vS, { color: glowCol, width: 2.4 });
      g.text(Av, 'Av', { color: SERIES[6], font: '600 13px Inter, sans-serif' }, 8, -6);
      g.handle({ id: 'v', at: vS, color: glowCol, r: 7, label: 'v', onDrag: (p) => setV(p, true), constrain: (p) => (ctx.toggles.snap ? [snapTo(p[0], SNAP), snapTo(p[1], SNAP)] : p) });
    }
    // basis images: drag these to change the matrix
    const i1: P2 = [m[0], m[1]], j1: P2 = [m[2], m[3]];
    g.arrow([0, 0], i1, { color: SERIES[3], width: 3.2 });
    g.arrow([0, 0], j1, { color: SERIES[2], width: 3.2 });
    const snapC = (p: P2): P2 => (ctx.toggles.snap ? [snapTo(p[0], SNAP), snapTo(p[1], SNAP)] : [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]);
    g.handle({ id: 'i', at: i1, color: SERIES[3], r: 8, label: 'Aî', constrain: snapC, onDrag: (p) => setCol(0, p) });
    g.handle({ id: 'j', at: j1, color: SERIES[2], r: 8, label: 'Aĵ', constrain: snapC, onDrag: (p) => setCol(1, p) });
  };

  let lastKey = '';
  const setCol = (c: number, p: P2) => {
    intro = 1;
    const k0 = c === 0 ? 0 : 2;
    target[k0] = p[0]; target[k0 + 1] = p[1];
    shown[k0] = p[0]; shown[k0 + 1] = p[1];
    ctx.setParam(c === 0 ? 'a11' : 'a12', p[0]); ctx.setParam(c === 0 ? 'a21' : 'a22', p[1]);
    const key = p.join(',');
    if (ctx.toggles.snap && key !== lastKey) ping(0.3 + 0.1 * Math.hypot(...p), 0.02);
    lastKey = key;
    report();
    plot.render();
  };
  const setV = (p: P2, user: boolean) => {
    vT = p; if (user) vS = [...p];
    ctx.setParam('vx', +p[0].toFixed(4)); ctx.setParam('vy', +p[1].toFixed(4));
    report();
  };

  const report = () => {
    const [a, c, b, d] = target;            // A = [[a, b], [c, d]]
    const e = eig2(a, b, c, d);
    const rows: Readout[] = [
      { label: 'A', value: `\\begin{pmatrix}${tx(a, 3)} & ${tx(b, 3)}\\\\ ${tx(c, 3)} & ${tx(d, 3)}\\end{pmatrix}`, tex: true },
      { label: 'det A  (area scale)', value: fmt(e.det, 5), tone: Math.abs(e.det) < 1e-12 ? 'warn' : e.det < 0 ? 'bad' : undefined },
      { label: 'trace A', value: fmt(e.trace, 5) },
    ];
    if (e.kind === 'complex') rows.push({ label: 'λ  (complex pair)', value: `${fmt(e.values[0], 4)} ± ${fmt(e.im, 4)} i`, tone: 'warn' });
    else rows.push({ label: 'λ₁, λ₂', value: `${fmt(e.values[0], 5)},  ${fmt(e.values[1], 5)}` });
    e.vectors.forEach((v, i) => rows.push({ label: `eigenvector ${i ? '₂' : '₁'}`, value: `(${fmt(v[0], 4)}, ${fmt(v[1], 4)})` }));
    if (ctx.toggles.test) {
      const Av: P2 = [a * vT[0] + b * vT[1], c * vT[0] + d * vT[1]];
      const ang = Math.atan2(vT[0] * Av[1] - vT[1] * Av[0], vT[0] * Av[0] + vT[1] * Av[1]) * 180 / Math.PI;
      rows.push({ label: 'angle from v to Av', value: Number.isFinite(ang) && Math.hypot(...Av) > 1e-12 ? `${fmt(ang, 4)}°` : 'Av = 0', tone: aligned ? 'good' : undefined });
      if (ctx.toggles.power) rows.push({ label: 'power iterations', value: String(powerIters) }, { label: 'Rayleigh quotient vᵀAv / vᵀv', value: fmt((vT[0] * Av[0] + vT[1] * Av[1]) / (vT[0] ** 2 + vT[1] ** 2), 6) });
    }
    ctx.setReadouts(rows);
    const kindNote = {
      distinct: `Two real eigen-directions (glowing): along them the plane is only stretched, by ${tx(e.values[0], 3)} and ${tx(e.values[1], 3)}.${e.values[1] < 0 ? ' A negative eigenvalue flips its line end over end.' : ''}`,
      defective: `One repeated eigenvalue ${tx(e.values[0], 3)} with a **single** eigen-direction — a shear-like matrix that cannot be diagonalized.`,
      scalar: `A multiple of the identity: **every** direction is an eigen-direction (λ = ${tx(e.values[0], 3)}).`,
      complex: `No real eigen-directions: the matrix **rotates** every line (eigenvalues ${tx(e.values[0], 3)} ± ${tx(e.im, 3)}i, modulus ${tx(Math.hypot(e.values[0], e.im), 3)}).`,
    }[e.kind];
    ctx.setNote(`Characteristic polynomial $\\lambda^2 - ${tx(e.trace, 4)}\\lambda + ${tx(e.det, 4)} = 0$. ${kindNote} The unit square becomes a parallelogram of area $|\\det A| = ${tx(Math.abs(e.det), 4)}$${e.det < 0 ? ', turned over (det < 0 reverses orientation)' : ''}.`);
    ctx.warn(Math.abs(e.det) < 1e-12 ? 'det A = 0: the plane is squashed onto a line (or a point) — A has no inverse.' : '');
  };

  const update = () => {
    const pre = ctx.choices.preset;
    if (pre !== lastPreset) {
      lastPreset = pre;
      const P = PRESETS[pre];
      if (P) { ctx.setParam('a11', P[0]); ctx.setParam('a21', P[1]); ctx.setParam('a12', P[2]); ctx.setParam('a22', P[3]); ping(0.6); }
    }
    target = read();
    if (Math.hypot(ctx.params.vx - vT[0], ctx.params.vy - vT[1]) > 1e-9) vT = [ctx.params.vx, ctx.params.vy];
    report();
    plot.setDraw(draw);
  };

  const stop = frameLoop((dt) => {
    let changed = false;
    if (intro < 1) { intro = Math.min(1, intro + dt / 1.3); changed = true; }
    for (let i = 0; i < 4; i++) if (Math.abs(shown[i] - target[i]) > 1e-6) { shown[i] = approach(shown[i], target[i], 9, dt); changed = true; } else shown[i] = target[i];
    for (let i = 0; i < 2; i++) if (Math.abs(vS[i] - vT[i]) > 1e-6) { vS[i] = approach(vS[i], vT[i], 10, dt); changed = true; } else vS[i] = vT[i];
    // power iteration: v ← A v / |A v| (kept at its length), one step every 0.8 s
    if (ctx.toggles.power && ctx.toggles.test) {
      powerClock += dt;
      if (powerClock > 0.8) {
        powerClock = 0;
        const [a, c, b, d] = target, L = Math.hypot(...vT) || 1.5;
        const w: P2 = [a * vT[0] + b * vT[1], c * vT[0] + d * vT[1]], n = Math.hypot(...w);
        if (n > 1e-12) { powerIters++; setV([(w[0] / n) * L, (w[1] / n) * L], false); }
      }
    } else { powerIters = 0; powerClock = 0; }
    // is v an eigenvector? (v and Av parallel)
    const [a, c, b, d] = shown;
    const Av: P2 = [a * vS[0] + b * vS[1], c * vS[0] + d * vS[1]];
    const s = Math.abs(vS[0] * Av[1] - vS[1] * Av[0]) / ((Math.hypot(...vS) * Math.hypot(...Av)) || 1);
    const nowAligned = ctx.toggles.test && s < Math.sin(Math.PI / 180) && Math.hypot(...Av) > 1e-9;
    if (nowAligned && !aligned) { glow = 1; ping(0.95); }
    if (nowAligned !== aligned) { aligned = nowAligned; changed = true; report(); }
    if (glow > 0) { glow = Math.max(0, glow - dt * 1.5); changed = true; }
    if (changed) plot.render();
  });

  return { update, dispose() { stop(); } };
}

const P = (key: string, label: string, value: number) => ({ key, label, value, min: -3, max: 3, step: 0.01 });

export const eigenMachine: DemoDef = {
  id: 'fidget.eigen', module: 'fidget', title: 'Eigenvector Machine', topic: 'Linear maps of the plane, eigenvectors, determinant as area',
  summary: 'Drag where î and ĵ land and the whole grid bends with them. The eigen-directions — lines that are only stretched — glow; the shaded square’s area is the determinant.',
  tex: 'A v = \\lambda v,\\quad \\lambda^2 - (\\operatorname{tr} A)\\lambda + \\det A = 0',
  view: '2d',
  params: [P('a11', '$a_{11}$  (Aî, x)', 1.6), P('a21', '$a_{21}$  (Aî, y)', 0.4), P('a12', '$a_{12}$  (Aĵ, x)', 0.6), P('a22', '$a_{22}$  (Aĵ, y)', 1.4), P('vx', 'test vector $v_x$', -0.5), P('vy', 'test vector $v_y$', 1.5)],
  choices: [{ key: 'preset', label: 'Morph to', value: 'custom', options: [['custom', 'Custom (drag the arrows)'], ['identity', 'Identity'], ['stretch', 'Stretch'], ['symmetric', 'Symmetric'], ['shear', 'Shear'], ['rotation', 'Rotation by 45°'], ['spiral', 'Spiral (rotate + scale)'], ['reflection', 'Reflection'], ['projection', 'Projection']] }],
  toggles: [
    { key: 'snap', label: 'Snap to the ¼-grid', value: true },
    { key: 'eig', label: 'Glowing eigen-directions', value: true },
    { key: 'square', label: 'Unit square → det', value: true },
    { key: 'circle', label: 'Unit circle → ellipse', value: false },
    { key: 'test', label: 'Test vector v and Av', value: true },
    { key: 'power', label: 'Power iteration (v ← Av/|Av|)', value: false },
  ],
  experiments: [
    'Drag the white test vector **v** around: when it lies on a glowing line, Av lands on the same line — v is an eigenvector.',
    'Pick **Shear**: only one glowing line survives. Pick **Rotation**: none at all — the eigenvalues have gone complex.',
    'Drag Aĵ onto the line of Aî. The square collapses (det = 0) and one eigenvalue becomes 0.',
    'Drag Aĵ across Aî: the square turns red — det < 0, the plane has been flipped over.',
    'Turn on power iteration: v swings onto the eigen-direction with the largest |λ|. How fast depends on |λ₂/λ₁|.',
  ],
  connections: ['fidget.vectors', 'fidget.flow'],
  accuracy: 'Eigenvalues and eigenvectors come from the exact 2×2 formulas (λ = tr/2 ± √((a−d)²/4 + bc), computed without cancellation); a repeated or complex case is detected with a relative tolerance of 10⁻¹². The plane eases into a new matrix for smoothness; readouts always describe the matrix in the sliders.',
  tutorial: [
    { text: 'A 2×2 matrix is decided by where it sends the basis vectors: its columns are $A\\hat\\imath$ (green) and $A\\hat\\jmath$ (red). The grid lines follow, staying straight, parallel and evenly spaced.', task: 'Drag Aî and Aĵ around and watch the grid.', set: { choices: { preset: 'custom' }, toggles: { snap: true, eig: true, test: true, power: false } }, done: (c) => c.params.a11 !== 1.6 || c.params.a22 !== 1.4 },
    { text: 'An **eigenvector** is a vector whose direction survives: $Av = \\lambda v$. The glowing lines are those directions; the short arrows on them are $A$ applied to the unit eigenvectors, stretched by λ.', task: 'Drag the white test vector v onto a glowing line — it lights up.', done: (c) => { const [a, cc, b, d] = [c.params.a11, c.params.a21, c.params.a12, c.params.a22]; const v = [c.params.vx, c.params.vy], Av = [a * v[0] + b * v[1], cc * v[0] + d * v[1]]; return Math.abs(v[0] * Av[1] - v[1] * Av[0]) < 0.02 * Math.hypot(v[0], v[1]) * Math.hypot(Av[0], Av[1]); } },
    { text: 'The shaded parallelogram is the image of the unit square; its area is $|\\det A|$. The eigenvalues multiply to the determinant: $\\lambda_1\\lambda_2 = \\det A$.', task: 'Make det A = 0 — put Aĵ on the line through Aî.', done: (c) => Math.abs(c.params.a11 * c.params.a22 - c.params.a12 * c.params.a21) < 1e-9 },
    { text: 'Not every matrix has real eigenvectors. A rotation turns every line, so $\\lambda^2 - (\\operatorname{tr}A)\\lambda + \\det A$ has complex roots.', task: 'Choose Rotation by 45° from the menu.', set: { choices: { preset: 'custom' } }, done: (c) => c.choices.preset === 'rotation' },
    { text: 'Power iteration: apply A again and again. Any starting vector swings toward the eigen-direction of the largest |λ| (if there is one). This is how search engines and quantum chemists find dominant eigenvectors.', task: 'Choose Symmetric and turn on power iteration.', set: { toggles: { power: true, test: true } }, done: (c) => c.choices.preset === 'symmetric' && !!c.toggles.power },
  ],
  create,
};
