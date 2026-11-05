// Optimization you can touch: the open box folded from a sheet (in 3D, with the
// volume curve beside it), and Fermat's principle — light (or a lifeguard)
// choosing the fastest path across two media, which is Snell's law.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { fmt, fmtTeX, ink, muted, SERIES, FONT, SMALL, clamp, txt } from './common';
import { brent } from '../../core/numeric/roots';
import type { V3 } from '../../engine/viewport3d';

// ── the box from a sheet ───────────────────────────────────────────────────
function boxDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, v3 = ctx.view3d!;
  plot.opts.xLabel = 'x (cut size)'; plot.opts.yLabel = 'V(x)';
  // five quads (base + four flaps) with their outlines
  const mat = new THREE.MeshStandardMaterial({ color: '#d9b77a', roughness: 0.75, metalness: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const lineMat = new THREE.LineBasicMaterial({ color: '#5a4520' });
  const group = new THREE.Group();
  const quads = Array.from({ length: 5 }, () => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const mesh = new THREE.Mesh(geo, mat);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(15), 3));
    const line = new THREE.Line(lg, lineMat);
    group.add(mesh, line);
    return { geo, lg };
  });
  // the four cut-away corners, as red outlines on the floor
  const cutMat = new THREE.LineBasicMaterial({ color: '#ef6b73' });
  const cuts = Array.from({ length: 4 }, () => { const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(15), 3)); const l = new THREE.Line(lg, cutMat); group.add(l); return lg; });
  v3.addObject(group);
  const label = v3.addLabel([0, 0, 0], '');
  let lastSheet = '';

  const setQuad = (k: number, p: V3[]) => {
    const pos = quads[k].geo.attributes.position as THREE.BufferAttribute, lp = quads[k].lg.attributes.position as THREE.BufferAttribute;
    p.forEach((q, i) => pos.setXYZ(i, ...q));
    [...p, p[0]].forEach((q, i) => lp.setXYZ(i, ...q));
    pos.needsUpdate = true; lp.needsUpdate = true;
    quads[k].geo.computeVertexNormals(); quads[k].geo.computeBoundingSphere(); quads[k].lg.computeBoundingSphere();
  };

  const update = () => {
    const W = ctx.params.W, H = ctx.params.H, xmax = Math.min(W, H) / 2;
    const x = clamp(ctx.params.x, 0, xmax), phi = (clamp(ctx.params.fold, 0, 1) * Math.PI) / 2;
    const V = (t: number) => t * (W - 2 * t) * (H - 2 * t);
    const Vp = (t: number) => 12 * t * t - 4 * (W + H) * t + W * H;
    const Vpp = (t: number) => 24 * t - 4 * (W + H);
    const xs = (W + H - Math.sqrt(W * W - W * H + H * H)) / 6, Vs = V(xs);
    const sheet = `${W}|${H}`;
    if (sheet !== lastSheet) {
      lastSheet = sheet;
      v3.setBounds({ x: [-W / 2 - 0.3, W / 2 + 0.3], y: [-H / 2 - 0.3, H / 2 + 0.3], z: [0, Math.max(xmax, 1.5)] });
      v3.resetCamera();
      plot.setView({ x0: -0.08 * xmax, x1: xmax * 1.08, y0: -0.12 * Vs, y1: Vs * 1.25 });
    }
    // geometry: base [X0, X1] × [Y0, Y1]; flaps of depth x hinged on its edges, folded up by φ
    const X0 = x - W / 2, X1 = W / 2 - x, Y0 = x - H / 2, Y1 = H / 2 - x, c = x * Math.cos(phi), s = x * Math.sin(phi);
    setQuad(0, [[X0, Y0, 0], [X1, Y0, 0], [X1, Y1, 0], [X0, Y1, 0]]);
    setQuad(1, [[X0, Y0, 0], [X1, Y0, 0], [X1, Y0 - c, s], [X0, Y0 - c, s]]);
    setQuad(2, [[X0, Y1, 0], [X1, Y1, 0], [X1, Y1 + c, s], [X0, Y1 + c, s]]);
    setQuad(3, [[X0, Y0, 0], [X0, Y1, 0], [X0 - c, Y1, s], [X0 - c, Y0, s]]);
    setQuad(4, [[X1, Y0, 0], [X1, Y1, 0], [X1 + c, Y1, s], [X1 + c, Y0, s]]);
    const corners: [number, number][] = [[-W / 2, -H / 2], [W / 2 - x, -H / 2], [W / 2 - x, H / 2 - x], [-W / 2, H / 2 - x]];
    cuts.forEach((lg, k) => {
      const [cx, cy] = corners[k], p = lg.attributes.position as THREE.BufferAttribute;
      [[cx, cy], [cx + x, cy], [cx + x, cy + x], [cx, cy + x], [cx, cy]].forEach(([px, py], i) => p.setXYZ(i, px, py, 0.002));
      p.needsUpdate = true; lg.computeBoundingSphere();
    });
    label.set([0, 0, s + 0.25], `<b>V = ${fmt(V(x), 4)}</b>`);
    v3.requestRender();

    plot.setDraw((g) => {
      g.fn(V, { color: SERIES[0], width: 2.6 }, [0, xmax]);
      if (ctx.toggles.deriv) {
        // V′ scaled into the picture, with its own zero line = the x-axis
        const k = (0.45 * Vs) / Math.max(Math.abs(Vp(0)), Math.abs(Vp(xmax)), 1e-9);
        g.fn((t) => Vp(t) * k, { color: SERIES[3], width: 1.8, dash: [6, 4] }, [0, xmax]);
        g.text([xmax * 0.02, Vp(0) * k], 'V′(x) (scaled)', { color: txt(ctx, SERIES[3]), font: SMALL, baseline: 'bottom' }, 4, -4);
      }
      const y = V(x), m = Vp(x), span = xmax * 0.18;
      g.line([x - span, y - m * span], [x + span, y + m * span], { color: SERIES[1], width: 2 });
      if (ctx.toggles.answer) {
        g.line([xs, g.view.y0], [xs, Vs], { color: SERIES[6], width: 1, dash: [4, 4] });
        g.point([xs, Vs], 5, { fill: SERIES[6] });
        g.text([xs, Vs], `max at x* = ${fmt(xs, 5)}`, { color: txt(ctx, SERIES[6]), font: FONT, align: 'center', baseline: 'bottom' }, 0, -12);
      }
      g.handle({ id: 'x', at: [x, y], color: SERIES[1], onDrag: ([px]) => { ctx.setParam('x', clamp(px, 0, xmax)); update(); }, constrain: ([px]) => [clamp(px, 0, xmax), V(clamp(px, 0, xmax))] });
      g.text([g.view.x1, g.view.y0], `sheet ${fmt(W, 3)} × ${fmt(H, 3)}`, { color: muted(ctx), font: SMALL, align: 'right', baseline: 'bottom' }, -12, -10);
    });
    const gap = Math.abs(V(x) - Vs);
    ctx.setReadouts([
      { label: 'cut size x', value: fmt(x, 6) },
      { label: 'box: length × width × height', value: `${fmt(W - 2 * x, 4)} × ${fmt(H - 2 * x, 4)} × ${fmt(x, 4)}` },
      { label: 'V(x) = x(W − 2x)(H − 2x)', value: fmt(V(x), 8) },
      { label: "V′(x) = 12x² − 4(W+H)x + WH", value: fmt(Vp(x), 6), tone: Math.abs(Vp(x)) < 0.02 * W * H ? 'good' : Vp(x) > 0 ? undefined : 'warn' },
      ...(ctx.toggles.answer ? [
        { label: 'optimum x* (exact root of V′)', value: fmt(xs, 10), tone: 'good' as const },
        { label: "V(x*) and V″(x*)", value: `${fmt(Vs, 10)},  ${fmt(Vpp(xs), 4)} < 0` },
      ] : []),
      { label: 'your volume vs the best', value: `${fmt((100 * V(x)) / Vs, 5)} %`, tone: gap < 1e-3 * Vs ? 'good' : undefined },
    ]);
    ctx.setSteps([
      { title: 'Model', tex: `V(x) = x\\,(W-2x)(H-2x),\\quad 0 \\le x \\le \\tfrac12\\min(W,H)`, detail: 'Cut a square of side x from each corner and fold up the sides.' },
      { title: 'Differentiate', tex: `V'(x) = 12x^2 - 4(W+H)x + WH`, rule: 'exact' },
      { title: 'Solve V′(x) = 0', tex: `x = \\frac{(W+H) \\pm \\sqrt{W^2 - WH + H^2}}{6}`, rule: 'quadratic formula', detail: 'The + root is larger than min(W, H)/2 — outside the sheet — so only the − root is feasible.' },
      { title: 'Check it is a maximum', tex: `V''(x^*) = 24x^* - 4(W+H) = ${fmtTeX(Vpp(xs), 5)} < 0`, rule: 'second-derivative test', detail: 'Also V = 0 at both ends of the interval, so the interior critical point is the global max.' },
      { title: `For W = ${fmt(W)}, H = ${fmt(H)}`, tex: `x^* = ${fmtTeX(xs, 8)},\\qquad V(x^*) = ${fmtTeX(Vs, 8)}` },
    ]);
    ctx.setNote(`Cutting more makes the box taller but its base smaller. Drag the gold point (or the slider) to find the balance: at the best cut the tangent to $V$ is **horizontal**, $V'(x) = 0$. Left of it $V' > 0$ (cut more!), right of it $V' < 0$ (cut less). Press play to fold the sheet.`);
    ctx.warn('');
  };
  let dir = 1;
  return {
    update,
    tick(dt) { let f = ctx.params.fold + dir * dt * 0.5; if (f >= 1) { f = 1; dir = -1; } else if (f <= 0) { f = 0; dir = 1; } ctx.setParam('fold', f); update(); },
    csv() { const W = ctx.params.W, H = ctx.params.H, xm = Math.min(W, H) / 2; const rows = ['x,V']; for (let i = 0; i <= 200; i++) { const t = (xm * i) / 200; rows.push(`${t},${t * (W - 2 * t) * (H - 2 * t)}`); } return rows.join('\n'); },
    dispose() { v3.clear(); mat.dispose(); lineMat.dispose(); cutMat.dispose(); },
  };
}

// ── Fermat's principle: the fastest path ───────────────────────────────────
function refractionDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.equal = true; plot.opts.xLabel = ''; plot.opts.yLabel = '';
  plot2.opts.xLabel = 'x (crossing point)'; plot2.opts.yLabel = 'travel time T(x)';
  plot.setView({ x0: -1.5, x1: 7.5, y0: -4.5, y1: 4.5 });
  let lastKey = '';

  const update = () => {
    const life = ctx.choices.story === 'lifeguard';
    const v1 = ctx.params.v1, v2 = ctx.params.v2, a = ctx.params.ay, bx = ctx.params.bx, b = -ctx.params.by;
    const d = bx;
    const T = (x: number) => Math.hypot(a, x) / v1 + Math.hypot(b, d - x) / v2;
    const Tp = (x: number) => x / (v1 * Math.hypot(a, x)) - (d - x) / (v2 * Math.hypot(b, d - x));
    const lo = Math.min(0, d) - 1, hi = Math.max(0, d) + 1;
    const xs = brent(Tp, lo, hi) ?? NaN, Ts = T(xs);
    const x = ctx.params.x;
    const key = `${v1}|${v2}|${a}|${b}|${d}`;
    if (key !== lastKey) {
      lastKey = key;
      const top = Math.max(T(lo - 0.5), T(hi + 0.5)), span = Math.max(top - Ts, 1e-6);
      plot2.setView({ x0: lo - 0.5, x1: hi + 0.5, y0: Ts - 0.12 * span, y1: top + 0.05 * span });
    }
    const th1 = Math.atan2(Math.abs(x), a), th2 = Math.atan2(Math.abs(d - x), -b);
    plot.setDraw((g) => {
      const { x0, x1, y0, y1 } = g.view;
      g.polygon([[x0, 0], [x1, 0], [x1, y1], [x0, y1]], { fill: life ? 'rgba(242,193,78,0.10)' : 'rgba(160,170,190,0.05)' });
      g.polygon([[x0, 0], [x1, 0], [x1, y0], [x0, y0]], { fill: 'rgba(79,140,217,0.16)' });
      g.line([x0, 0], [x1, 0], { color: muted(ctx), width: 1.5 });
      g.text([x0, 0], life ? `sand: speed v₁ = ${fmt(v1, 3)}` : `medium 1: speed v₁ = ${fmt(v1, 3)}`, { color: ink(ctx), font: SMALL, baseline: 'bottom' }, 10, -8);
      g.text([x0, 0], life ? `water: speed v₂ = ${fmt(v2, 3)}` : `medium 2: speed v₂ = ${fmt(v2, 3)}`, { color: ink(ctx), font: SMALL, baseline: 'top' }, 10, 8);
      if (ctx.toggles.answer && Number.isFinite(xs)) g.path([[0, a], [xs, 0], [d, b]], { color: SERIES[3], width: 1.6, dash: [6, 5] });
      g.path([[0, a], [x, 0], [d, b]], { color: SERIES[1], width: 3 });
      // normals and angles
      g.line([x, 1.6], [x, -1.6], { color: muted(ctx), width: 1, dash: [3, 4] });
      g.text([x, 0.9], `θ₁ = ${fmt((th1 * 180) / Math.PI, 3)}°`, { color: txt(ctx, SERIES[1]), font: SMALL, baseline: 'middle' }, x >= 0 ? 8 : -78, 0);
      g.text([x, -0.9], `θ₂ = ${fmt((th2 * 180) / Math.PI, 3)}°`, { color: txt(ctx, SERIES[1]), font: SMALL, baseline: 'middle' }, d >= x ? -78 : 8, 0);
      g.handle({ id: 'A', at: [0, a], color: SERIES[0], label: life ? 'lifeguard' : 'A', onDrag: ([, py]) => { ctx.setParam('ay', clamp(py, 0.2, 6)); update(); }, constrain: ([, py]) => [0, clamp(py, 0.2, 6)] });
      g.handle({ id: 'B', at: [d, b], color: SERIES[2], label: life ? 'swimmer' : 'B', onDrag: ([px, py]) => { ctx.setParam('bx', clamp(px, 0.2, 12)); ctx.setParam('by', clamp(-py, 0.2, 6)); update(); } });
      g.handle({ id: 'P', at: [x, 0], color: SERIES[1], label: 'P', onDrag: ([px]) => { ctx.setParam('x', clamp(px, -2, 14)); update(); }, constrain: ([px]) => [px, 0] });
    });
    plot2.setDraw((g) => {
      g.fn(T, { color: SERIES[0], width: 2.6 });
      const y = T(x), m = Tp(x), span = (g.view.x1 - g.view.x0) * 0.15;
      g.line([x - span, y - m * span], [x + span, y + m * span], { color: SERIES[1], width: 2 });
      if (ctx.toggles.answer && Number.isFinite(xs)) { g.point([xs, Ts], 5, { fill: txt(ctx, SERIES[3]) }); g.text([xs, Ts], `fastest: x* = ${fmt(xs, 5)}`, { color: txt(ctx, SERIES[3]), font: FONT, align: 'center', baseline: 'top' }, 0, 10); }
      g.handle({ id: 'x', at: [x, y], color: SERIES[1], onDrag: ([px]) => { ctx.setParam('x', clamp(px, -2, 14)); update(); }, constrain: ([px]) => [px, T(px)] });
    });
    const s1 = Math.sin(th1) * Math.sign(x), s2 = Math.sin(th2) * Math.sign(d - x);
    ctx.setReadouts([
      { label: 'travel time T(x)', value: fmt(T(x), 8) },
      { label: "T′(x) = sin θ₁ / v₁ − sin θ₂ / v₂", value: fmt(Tp(x), 6), tone: Math.abs(Tp(x)) < 2e-3 ? 'good' : undefined },
      { label: 'sin θ₁ / v₁', value: fmt(s1 / v1, 6) },
      { label: 'sin θ₂ / v₂', value: fmt(s2 / v2, 6) },
      ...(ctx.toggles.answer ? [
        { label: 'fastest crossing x* (root of T′, numerical)', value: fmt(xs, 10), tone: 'good' as const },
        { label: 'T(x*) and your time − T(x*)', value: `${fmt(Ts, 8)},  +${fmt(T(x) - Ts, 3)}` },
      ] : []),
    ]);
    ctx.setSteps([
      { title: 'Total time', tex: 'T(x) = \\frac{\\sqrt{a^2 + x^2}}{v_1} + \\frac{\\sqrt{b^2 + (d-x)^2}}{v_2}' },
      { title: 'Differentiate', tex: "T'(x) = \\frac{x}{v_1\\sqrt{a^2+x^2}} - \\frac{d-x}{v_2\\sqrt{b^2+(d-x)^2}} = \\frac{\\sin\\theta_1}{v_1} - \\frac{\\sin\\theta_2}{v_2}", rule: 'chain rule', detail: 'Read the sines off the triangles: x / √(a² + x²) = sin θ₁.' },
      { title: 'Set T′ = 0', tex: '\\frac{\\sin\\theta_1}{v_1} = \\frac{\\sin\\theta_2}{v_2}\\quad\\Longleftrightarrow\\quad n_1\\sin\\theta_1 = n_2\\sin\\theta_2', rule: 'Snell’s law (n = c/v)' },
      { title: 'It is a minimum', tex: "T''(x) = \\frac{a^2}{v_1 (a^2+x^2)^{3/2}} + \\frac{b^2}{v_2 (b^2+(d-x)^2)^{3/2}} > 0", detail: 'T is convex, so the single critical point is the global minimum.' },
    ]);
    ctx.setNote(life
      ? 'A lifeguard runs faster on sand than she swims. The straight line is not the fastest route: it pays to run a bit further along the beach and swim less. At the best crossing point the tangent to $T(x)$ is horizontal, and the angles obey $\\sin\\theta_1 / v_1 = \\sin\\theta_2 / v_2$.'
      : '**Fermat’s principle:** light travels between two points along the path of least time. Setting $T\'(x) = 0$ gives exactly **Snell’s law of refraction**, $n_1\\sin\\theta_1 = n_2\\sin\\theta_2$ with $n = c/v$ — the bending of light at a water surface is a calculus optimization. (Strictly, light takes a *stationary* time; here it is a minimum.)');
    ctx.warn('');
  };
  return { update, dispose() {} };
}

export const optimizationDemos: DemoDef[] = [
  {
    id: 'calc1.optimize', module: 'calc1', title: 'Optimization: the biggest box',
    topic: 'Optimization · applied maxima · V′(x) = 0 · second-derivative test',
    summary: 'Cut squares from the corners of a sheet and fold up the sides. Drag the cut size and watch the box in 3D and its volume curve: the best box sits where the tangent is flat.',
    tex: "V(x) = x(W-2x)(H-2x),\\qquad V'(x^*) = 0",
    view: 'split3d', animated: true,
    params: [
      { key: 'x', label: 'cut size x (drag on the curve)', value: 0.4, min: 0, max: 5, step: 0.001 },
      { key: 'fold', label: 'fold (press play)', value: 1, min: 0, max: 1, step: 0.01 },
      { key: 'W', label: 'sheet width W', value: 8, min: 2, max: 12, step: 0.1 },
      { key: 'H', label: 'sheet height H', value: 5, min: 2, max: 12, step: 0.1 },
    ],
    toggles: [{ key: 'deriv', label: "Show V′(x)", value: true }, { key: 'answer', label: 'Reveal the optimum', value: false }],
    experiments: [
      'Drag the cut size until the gold tangent is flat. Then reveal the optimum: how close did you get?',
      'Turn on V′: it crosses zero exactly under the peak — positive before (cut more), negative after (cut less).',
      'Make the sheet square (W = H). The best cut is exactly one sixth of the side.',
      'Make the sheet very long and thin (W = 12, H = 2): the best cut tends to H/4, independent of W. Why?',
      'Press play to fold and unfold — the cut squares (red) are the material thrown away.',
    ],
    connections: ['calc1.extrema', 'calc1.refraction', 'calc1.shape'],
    accuracy: 'V, V′ and the optimum x* = [(W+H) − √(W² − WH + H²)]/6 are exact formulas evaluated in double precision. The 3D box is drawn to scale.',
    tutorial: [
      { text: '**The trade-off.** Cutting bigger corner squares makes the box *taller* but its base *smaller*. Too little cut: a flat tray. Too much: a narrow chimney. Somewhere between is the biggest volume.', set: { params: { x: 0.4, fold: 1, W: 8, H: 5 }, toggles: { deriv: false, answer: false } }, task: 'Drag the gold point on the volume curve and watch the box change in 3D.', done: (c) => Math.abs(c.params.x - 0.4) > 0.3 },
      { text: '**Model it.** The box measures $(W - 2x)\\times(H - 2x)\\times x$, so $$V(x) = x\\,(W-2x)(H-2x),\\qquad 0 \\le x \\le \\tfrac12\\min(W,H).$$ $V = 0$ at both ends, and positive between: a maximum must exist inside.', task: 'Find a cut that gives a volume above 17.', done: (c) => { const { x, W, H } = c.params; return x * (W - 2 * x) * (H - 2 * x) > 17; } },
      { text: '**Flat tangent at the top.** At an interior maximum the tangent is horizontal: $V\'(x) = 0$. Turn on $V\'$ (dashed): to the left of the peak it is positive (volume still rising — cut more), to the right negative.', set: { toggles: { deriv: true } }, task: 'Make |V′(x)| small: get the volume within 0.1 % of the best (watch the percentage readout).', done: (c) => { const { x, W, H } = c.params; const xs = (W + H - Math.sqrt(W * W - W * H + H * H)) / 6; const V = (t: number) => t * (W - 2 * t) * (H - 2 * t); return V(x) > 0.999 * V(xs); } },
      { text: '**Solve exactly.** $V\'(x) = 12x^2 - 4(W+H)x + WH = 0$ is a quadratic. Of its two roots only the smaller fits on the sheet. $V\'\'(x^*) < 0$ confirms a maximum (the Steps tab works it out).', set: { toggles: { answer: true } }, task: 'Compare your best x with the exact x*.' },
      { text: '**Change the sheet.** The answer depends on $W$ and $H$, but the method does not. For a square sheet $x^* = W/6$; for a very long strip $x^* \\to H/4$.', task: 'Make the sheet square and check that x* is one sixth of the side.', done: (c) => Math.abs(c.params.W - c.params.H) < 0.05 },
    ],
    create: boxDemo,
  },
  {
    id: 'calc1.refraction', module: 'calc1', title: 'Fastest path: Fermat and Snell',
    topic: 'Optimization · Fermat’s principle · Snell’s law · the lifeguard problem',
    summary: 'Light crossing into water — or a lifeguard running then swimming — takes the path of least time. Drag the crossing point to minimize T(x); the condition T′(x) = 0 is Snell’s law.',
    tex: "T'(x) = 0 \\;\\Longleftrightarrow\\; \\frac{\\sin\\theta_1}{v_1} = \\frac{\\sin\\theta_2}{v_2}",
    view: 'split2d',
    params: [
      { key: 'x', label: 'crossing point x (drag P)', value: 4, min: -2, max: 14, step: 0.001 },
      { key: 'v1', label: 'speed v₁ (upper medium)', value: 1, min: 0.2, max: 3, step: 0.01 },
      { key: 'v2', label: 'speed v₂ (lower medium)', value: 0.6, min: 0.2, max: 3, step: 0.01 },
      { key: 'ay', label: 'A: height above the boundary', value: 3, min: 0.2, max: 6, step: 0.01 },
      { key: 'bx', label: 'B: horizontal distance', value: 6, min: 0.2, max: 12, step: 0.01 },
      { key: 'by', label: 'B: depth below the boundary', value: 3, min: 0.2, max: 6, step: 0.01 },
    ],
    choices: [{ key: 'story', label: 'Story', options: [['light', 'Light ray (refraction)'], ['lifeguard', 'Lifeguard']], value: 'light' }],
    toggles: [{ key: 'answer', label: 'Reveal the fastest path', value: false }],
    experiments: [
      'Drag P until the gold tangent on the time curve is flat. Then compare sin θ₁/v₁ with sin θ₂/v₂.',
      'Set v₁ = v₂: the fastest path is the straight line — refraction needs a change of speed.',
      'Make v₂ much smaller: the path dives steeply into the slow medium (θ₂ small), as light does entering glass.',
      'Drag B far away horizontally: the crossing point moves toward B, keeping the time in the slow medium short.',
    ],
    connections: ['calc1.optimize', 'calc1.extrema', 'calc1.chain'],
    accuracy: 'T(x) and T′(x) are exact formulas. The fastest crossing x* is the root of T′ found numerically by Brent’s method (~1e−13); T is convex so it is the global minimum. Snell’s law from Fermat’s principle is exact geometric optics (no wave effects).',
    create: refractionDemo,
  },
];
