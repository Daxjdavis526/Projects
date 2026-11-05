// Vectors: arithmetic tip to tail, linear combinations and span in space,
// and the same vector described in two bases.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import type { V3 } from '../../engine/viewport3d';
import { inverse, rref, det } from '../../core/numeric/linalg';
import { nullBasis } from '../../core/numeric/linmap';
import {
  fmt, pal, alpha, labeledArrow, rightAngle2, snap2, readVec, vecParams, lattice2, texMat, texVec, tnum,
  dragArrow, planePatch, parallelepiped, clipLineToBox, C3, add3, mul3, len3, snapTo, P2,
  setCube,
  segPts,
} from './common';

// ── 1. vector arithmetic ───────────────────────────────────────────────────
function vectorsDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -2.5, x1: 6, y0: -1.5, y1: 4.5 });
  const update = () => {
    const P = pal(ctx.dark);
    const [ux, uy] = readVec(ctx, 'u', 2), [vx, vy] = readVec(ctx, 'v', 2), c = ctx.params.c;
    const op = ctx.choices.op;
    const u: P2 = [ux, uy], v: P2 = [vx, vy];
    const r: P2 = op === 'add' ? [ux + vx, uy + vy] : op === 'sub' ? [ux - vx, uy - vy] : [c * ux, c * uy];
    const step = ctx.toggles.snap ? 0.5 : 0;
    const drag = (name: 'u' | 'v') => ([x, y]: P2) => { ctx.setParam(`${name}x`, x); ctx.setParam(`${name}y`, y); update(); };
    plot.setDraw((g) => {
      if (ctx.toggles.comp) {
        for (const [w, col] of [[u, P.u], [v, P.v]] as [P2, string][]) { g.line([0, 0], [w[0], 0], { color: alpha(col, 0.7), width: 1.5, dash: [4, 4] }); g.line([w[0], 0], w, { color: alpha(col, 0.7), width: 1.5, dash: [4, 4] }); }
      }
      if (op === 'add') {
        if (ctx.toggles.para) {
          g.polygon([[0, 0], u, r, v], { fill: alpha(P.res, 0.10) });
          g.arrow(v, r, { color: alpha(P.u, 0.45), width: 2, dash: [6, 5] });
        }
        g.arrow(u, r, { color: P.v, width: 2.6 });                         // v placed tip to tail
        g.text([(u[0] + r[0]) / 2, (u[1] + r[1]) / 2], 'v', { color: P.v, font: 'italic 600 14px Inter, sans-serif' }, 8, -6);
        labeledArrow(g, [0, 0], v, alpha(P.v, 0.55), '', 2);
        labeledArrow(g, [0, 0], u, P.u, 'u');
        labeledArrow(g, [0, 0], r, P.res, 'u + v', 3);
      } else if (op === 'sub') {
        g.arrow(v, u, { color: P.res, width: 3 });                         // u − v runs from the tip of v to the tip of u
        g.text([(u[0] + v[0]) / 2, (u[1] + v[1]) / 2], 'u − v', { color: P.res, font: '600 14px Inter, sans-serif' }, 8, -8);
        if (ctx.toggles.para) {
          g.arrow([0, 0], r, { color: alpha(P.res, 0.5), width: 2, dash: [6, 5] });
          g.arrow(u, [u[0] - v[0], u[1] - v[1]], { color: alpha(P.v, 0.5), width: 2, dash: [6, 5] });
          g.text([u[0] - v[0] / 2, u[1] - v[1] / 2], '−v', { color: alpha(P.v, 0.8), font: '600 13px Inter, sans-serif' }, 8, 0);
        }
        labeledArrow(g, [0, 0], u, P.u, 'u');
        labeledArrow(g, [0, 0], v, P.v, 'v');
      } else {
        const L = Math.hypot(ux, uy);
        if (L > 1e-9) g.line([(-ux / L) * 20, (-uy / L) * 20], [(ux / L) * 20, (uy / L) * 20], { color: alpha(P.u, 0.35), width: 1.2, dash: [6, 6] });
        labeledArrow(g, [0, 0], r, P.res, `${fmt(c, 3)}·u`, 3.4);
        labeledArrow(g, [0, 0], u, P.u, 'u', 2.4);
        labeledArrow(g, [0, 0], v, alpha(P.v, 0.4), 'v', 1.6);
      }
      g.handle({ id: 'u', at: u, color: P.u, onDrag: drag('u'), constrain: snap2(step) });
      g.handle({ id: 'v', at: v, color: P.v, onDrag: drag('v'), constrain: snap2(step) });
    });
    const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy), lr = Math.hypot(...r), d = ux * vx + uy * vy;
    const ang = lu > 1e-12 && lv > 1e-12 ? (Math.acos(Math.max(-1, Math.min(1, d / (lu * lv)))) * 180) / Math.PI : NaN;
    const name = op === 'add' ? 'u + v' : op === 'sub' ? 'u − v' : 'c·u';
    const rows: Readout[] = [
      { label: 'u', value: `(${fmt(ux)}, ${fmt(uy)})` },
      { label: 'v', value: `(${fmt(vx)}, ${fmt(vy)})` },
      { label: name, value: `(${fmt(r[0])}, ${fmt(r[1])})`, tone: 'good' },
      { label: `|${name}|`, value: fmt(lr) },
      { label: '|u|, |v|', value: `${fmt(lu)}, ${fmt(lv)}` },
      { label: 'angle between u and v', value: Number.isFinite(ang) ? `${fmt(ang, 4)}°` : 'undefined (a zero vector)' },
    ];
    if (op !== 'scale') rows.push({ label: 'triangle inequality', value: `${fmt(lr)} ≤ ${fmt(lu + lv)}`, tone: Math.abs(lr - (op === 'add' ? lu + lv : lu + lv)) < 1e-9 ? 'warn' : undefined });
    else rows.push({ label: '|c·u| = |c|·|u|', value: `${fmt(lr)} = ${fmt(Math.abs(c))}·${fmt(lu)}` });
    ctx.setReadouts(rows);
    ctx.setNote(op === 'add'
      ? `Tip to tail: place **v** where **u** ends; the sum runs from the start of the first to the end of the last. Component by component, $\\mathbf u+\\mathbf v = (${tnum(ux)} + ${tnum(vx)},\\ ${tnum(uy)} + ${tnum(vy)}) = (${tnum(r[0])},\\ ${tnum(r[1])})$. The dashed side of the parallelogram is $\\mathbf v+\\mathbf u$ — the same arrow, so addition commutes. In physics this is how forces and velocities combine.`
      : op === 'sub'
        ? `$\\mathbf u-\\mathbf v$ is the arrow **from the tip of v to the tip of u** — the vector you add to $\\mathbf v$ to get $\\mathbf u$. It is also $\\mathbf u + (-\\mathbf v)$ (dashed). If u and v are the positions of two particles, $\\mathbf u-\\mathbf v$ is where the first is *relative to* the second.`
        : `Scaling stretches by $|c|$ and reverses when $c<0$; every multiple of **u** lies on the dashed line through the origin — the **span** of u.`);
    ctx.warn('');
  };
  return { update, dispose() {} };
}

// ── 2. linear combinations, span and independence in space ─────────────────
function spanDemo(ctx: DemoCtx): DemoInstance {
  const view = ctx.view3d!;
  const R = 3;
  setCube(view, R);
  const names = ['u', 'v', 'w'] as const, cols = [C3.u, C3.v, C3.w];
  const step = () => (ctx.toggles.snap ? 0.5 : 0);
  const arrows = names.map((n, i) => dragArrow(view, cols[i], n, (p) => { ctx.setParam(`${n}x`, p[0]); ctx.setParam(`${n}y`, p[1]); ctx.setParam(`${n}z`, p[2]); update(); }, { snap: step }));
  const parts = names.map((_, i) => view.addArrow([0, 0, 0], [1, 0, 0], { color: cols[i], radius: 0.035 }));
  const result = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.res });
  const resultLabel = view.addLabel([1, 0, 0], '');
  const loop = names.map(() => view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.err, radius: 0.03 }));
  const plane = planePatch(view, C3.res, 0.22);
  const box = parallelepiped(view);
  let line: ReturnType<typeof view.addCurve> | null = null;
  const TRAIL = 900;
  const trailPos = new Float32Array(TRAIL * 3);
  let trailN = 0, trailI = 0;
  const trail = view.addParticles(TRAIL, { color: '#c9a7ff', size: 0.07 });
  let spanKey = '';
  const update = () => {
    const k = Number(ctx.choices.count);
    const vecs = names.slice(0, k).map((n) => readVec(ctx, n, 3) as V3);
    const coef = ['a', 'b', 'c'].slice(0, k).map((c) => ctx.params[c]);
    vecs.forEach((v, i) => arrows[i].set([0, 0, 0], v));
    arrows.forEach((a, i) => a.visible(i < k));
    // tip to tail: a u, then b v, then c w
    let at: V3 = [0, 0, 0];
    parts.forEach((p, i) => { if (i < k) { const piece = mul3(vecs[i], coef[i]); p.set(at, piece); p.visible(true); at = add3(at, piece); } else p.visible(false); });
    result.set([0, 0, 0], at);
    resultLabel.set(mul3(at, 1.1), `<span style="color:${C3.res}">${['a u', 'a u + b v', 'a u + b v + c w'][k - 1]}</span>`);
    // span: rank of [u v w]
    const A = [0, 1, 2].map((r) => vecs.map((v) => v[r]));
    const N = nullBasis(A, 1e-9);
    const rank = k - N.length;
    const key = `${k}|${vecs.flat().join(',')}|${ctx.toggles.span}`;
    if (key !== spanKey) {
      spanKey = key;
      line?.dispose(); line = null;
      plane.visible(false); box.visible(false);
      if (ctx.toggles.span) {
        const piv = rref(A, 1e-9 * Math.max(1e-300, ...A.flat().map(Math.abs))).pivots.map((j) => vecs[j]);
        if (rank === 1) { const seg = clipLineToBox([0, 0, 0], piv[0], R); if (seg) line = view.addCurve(segPts(seg), { color: C3.res, radius: 0.03 }); }
        else if (rank === 2) { plane.setSpan(piv[0], piv[1], R); plane.visible(true); }
        else if (rank === 3) { box.set(vecs[0], vecs[1], vecs[2], det(A) > 0 ? C3.pos : C3.neg, 0.22); box.visible(true); }
      }
    }
    // a dependency relation drawn as a closed loop
    const rel = N[0];
    if (ctx.toggles.dep && rel) {
      const m = Math.max(...rel.map(Math.abs));
      const c = rel.map((x) => x / m);
      let p: V3 = [0, 0, 0];
      loop.forEach((h, i) => { if (i < k && Math.abs(c[i]) > 1e-12) { const piece = mul3(vecs[i], c[i]); h.set(p, piece); h.visible(true); p = add3(p, piece); } else h.visible(false); });
    } else loop.forEach((h) => h.visible(false));
    trail.visible(!!ctx.toggles.trail);
    const relStr = rel ? rel.map((x) => x / Math.max(...rel.map(Math.abs))).map((x, i) => (Math.abs(x) < 1e-12 ? '' : `${x < 0 ? '−' : '+'} ${fmt(Math.abs(x), 3)}·${names[i]}`)).filter(Boolean).join(' ').replace(/^\+ /, '') + ' = 0' : '';
    const dimName = ['the origin only', 'a line through 0', 'a plane through 0', 'all of ℝ³'][rank];
    const rows: Readout[] = [
      { label: 'combination', value: `(${at.map((x) => fmt(x, 3)).join(', ')})` },
      { label: 'rank = dim span', value: `${rank} — ${dimName}`, tone: rank === k ? 'good' : 'warn' },
      { label: 'vectors', value: rank === k ? 'linearly independent' : 'linearly dependent', tone: rank === k ? 'good' : 'warn' },
    ];
    if (k === 3) rows.push({ label: 'det [u v w] (signed volume)', value: fmt(det(A)) });
    if (rel) rows.push({ label: 'dependency', value: relStr, tone: 'warn' });
    ctx.setReadouts(rows);
    ctx.setNote(rank < k
      ? `The vectors are **dependent**: ${relStr}. The orange arrows draw this relation tip to tail — they close up into a loop back to the origin. One of the vectors adds nothing new, so the span is only ${dimName}.`
      : k === 1 ? 'Every multiple $a\\mathbf u$ lies on one line through the origin: the span of a single nonzero vector is a line.'
        : k === 2 ? 'All combinations $a\\mathbf u + b\\mathbf v$ fill a **plane through the origin** (play the timeline to sweep a and b). Two independent vectors in $\\mathbb R^3$ can never reach a point off that plane.'
          : 'Three independent vectors span all of $\\mathbb R^3$: every point is $a\\mathbf u+b\\mathbf v+c\\mathbf w$ for exactly one $(a,b,c)$. The box they span has volume $|\\det[\\mathbf u\\ \\mathbf v\\ \\mathbf w]| \\neq 0$.');
    ctx.warn(vecs.some((v) => len3(v) < 1e-12) ? 'A zero vector is in the list — any list containing 0 is dependent (1·0 = 0).' : '');
  };
  const pushTrail = () => {
    const k = Number(ctx.choices.count);
    const vecs = names.slice(0, k).map((n) => readVec(ctx, n, 3) as V3);
    const coef = ['a', 'b', 'c'].slice(0, k).map((c) => ctx.params[c]);
    const p = vecs.reduce((s, v, i) => add3(s, mul3(v, coef[i])), [0, 0, 0] as V3);
    trailPos.set(p, trailI * 3); trailI = (trailI + 1) % TRAIL; trailN = Math.min(TRAIL, trailN + 1);
    trail.set(trailPos, trailN);
  };
  return {
    update,
    tick() {
      const t = ctx.time.t;
      ctx.setParam('a', snapTo(2 * Math.sin(1.3 * t), 0.001));
      ctx.setParam('b', snapTo(2 * Math.sin(2.1 * t + 0.6), 0.001));
      ctx.setParam('c', snapTo(2 * Math.sin(0.83 * t + 1.9), 0.001));
      update();
      pushTrail();
    },
    reset() { trailN = 0; trailI = 0; trail.set(trailPos, 0); },
    dispose() { view.clear(); },
  };
}

// ── 3. change of basis ─────────────────────────────────────────────────────
function basisDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -5, x1: 5, y0: -4, y1: 4 });
  const update = () => {
    const P = pal(ctx.dark);
    const quantum = ctx.choices.mode === 'quantum';
    if (quantum) {
      // an orthonormal basis at angle θ and a unit state at angle φ
      const th = (ctx.params.theta * Math.PI) / 180, ph = (ctx.params.phi * Math.PI) / 180;
      const want = { b1x: Math.cos(th), b1y: Math.sin(th), b2x: -Math.sin(th), b2y: Math.cos(th), xx: 2 * Math.cos(ph), xy: 2 * Math.sin(ph) };
      for (const [key, val] of Object.entries(want)) if (Math.abs(ctx.params[key] - val) > 1e-12) ctx.setParam(key, val);
    }
    const scaleB = quantum ? 2 : 1;                     // draw unit vectors at twice the size so they are visible
    const b1 = readVec(ctx, 'b1', 2) as P2, b2 = readVec(ctx, 'b2', 2) as P2, x = readVec(ctx, 'x', 2) as P2;
    const B = [[b1[0], b2[0]], [b1[1], b2[1]]];
    const Binv = inverse(B), dB = det(B);
    const c = Binv ? [Binv[0][0] * x[0] + Binv[0][1] * x[1], Binv[1][0] * x[0] + Binv[1][1] * x[1]] : [NaN, NaN];
    const step = ctx.toggles.snap ? 0.25 : 0;
    const drag = (name: string) => ([px, py]: P2) => { ctx.setParam(`${name}x`, px); ctx.setParam(`${name}y`, py); update(); };
    plot.setDraw((g) => {
      if (ctx.toggles.grid && Binv && Math.abs(dB) > 0.05) {
        const Bs = quantum ? [[B[0][0] * scaleB, B[0][1] * scaleB], [B[1][0] * scaleB, B[1][1] * scaleB]] : B;
        lattice2(g, Bs, 12, alpha(P.res, 0.28), 1);
      }
      const k1: P2 = [c[0] * b1[0], c[0] * b1[1]];
      if (Binv) {
        // x = c₁ b₁ + c₂ b₂, drawn tip to tail along the basis
        g.arrow([0, 0], k1, { color: alpha(P.c1, 0.75), width: 2, dash: [6, 4] });
        g.arrow(k1, x, { color: alpha(P.c2, 0.75), width: 2, dash: [6, 4] });
        if (quantum) rightAngle2(g, k1, [-k1[0], -k1[1]], [x[0] - k1[0], x[1] - k1[1]], 0.18, P.muted);
      }
      if (ctx.toggles.std) { g.line([x[0], 0], x, { color: alpha(P.muted, 0.8), width: 1.2, dash: [3, 4] }); g.line([0, x[1]], x, { color: alpha(P.muted, 0.8), width: 1.2, dash: [3, 4] }); }
      if (quantum) {
        g.parametric((t) => 2 * Math.cos(t), (t) => 2 * Math.sin(t), 0, 2 * Math.PI, { color: alpha(P.muted, 0.5), width: 1, dash: [4, 4] });
        labeledArrow(g, [0, 0], [b1[0] * 2, b1[1] * 2], P.c1, '|b₁⟩ (unit)');
        labeledArrow(g, [0, 0], [b2[0] * 2, b2[1] * 2], P.c2, '|b₂⟩ (unit)');
        labeledArrow(g, [0, 0], x, P.res, '|ψ⟩', 3);
      } else {
        labeledArrow(g, [0, 0], b1, P.c1, 'b₁');
        labeledArrow(g, [0, 0], b2, P.c2, 'b₂');
        labeledArrow(g, [0, 0], x, P.res, 'x', 3);
        g.handle({ id: 'b1', at: b1, color: P.c1, onDrag: drag('b1'), constrain: snap2(step) });
        g.handle({ id: 'b2', at: b2, color: P.c2, onDrag: drag('b2'), constrain: snap2(step) });
        g.handle({ id: 'x', at: x, color: P.res, onDrag: drag('x'), constrain: snap2(step) });
      }
      if (quantum) {
        g.handle({ id: 'psi', at: x, color: P.res, onDrag: ([px, py]) => { let a = (Math.atan2(py, px) * 180) / Math.PI; if (a < 0) a += 360; ctx.setParam('phi', Math.round(a)); update(); }, constrain: ([px, py]) => { const l = Math.hypot(px, py) || 1; return [(2 * px) / l, (2 * py) / l]; } });
        g.handle({ id: 'basis', at: [b1[0] * 2, b1[1] * 2], color: P.c1, onDrag: ([px, py]) => { let a = (Math.atan2(py, px) * 180) / Math.PI; if (a < 0) a += 360; ctx.setParam('theta', Math.round(a) % 180); update(); }, constrain: ([px, py]) => { const l = Math.hypot(px, py) || 1; return [(2 * px) / l, (2 * py) / l]; } });
      }
    });
    if (quantum) {
      const a1 = c[0] / 2, a2 = c[1] / 2;                   // the state is drawn with length 2
      ctx.setReadouts([
        { label: 'amplitude ⟨b₁|ψ⟩ = cos(φ − θ)', value: fmt(a1) },
        { label: 'amplitude ⟨b₂|ψ⟩', value: fmt(a2) },
        { label: 'P(b₁) = |⟨b₁|ψ⟩|²', value: fmt(a1 * a1), tone: 'good' },
        { label: 'P(b₂) = |⟨b₂|ψ⟩|²', value: fmt(a2 * a2), tone: 'good' },
        { label: 'P(b₁) + P(b₂)', value: fmt(a1 * a1 + a2 * a2) },
      ]);
      ctx.setNote(`A quantum state is a unit vector; a measurement picks an **orthonormal basis**. The state's coordinates in that basis are the amplitudes, and their squares are the probabilities — they add to 1 because the basis is orthonormal (Pythagoras). Here: a photon polarized at $\\varphi = ${ctx.params.phi}°$ meets a polarizer at $\\theta = ${ctx.params.theta}°$ and passes with probability $\\cos^2(\\varphi-\\theta) = ${tnum(a1 * a1)}$ (Malus's law). This picture is a *real* 2D slice; general states have complex amplitudes.`);
      ctx.setSteps([]);
      ctx.warn('');
      return;
    }
    ctx.setReadouts([
      { label: 'x in the standard basis', value: `(${fmt(x[0])}, ${fmt(x[1])})` },
      { label: '[x]_B = B⁻¹x', value: Binv ? `(${fmt(c[0])}, ${fmt(c[1])})` : '— (not a basis)', tone: Binv ? 'good' : 'bad' },
      { label: 'B = [b₁ b₂]', value: texMat(B), tex: true },
      { label: 'det B', value: fmt(dB), tone: Math.abs(dB) < 1e-9 ? 'bad' : undefined },
    ]);
    ctx.setSteps(Binv ? [
      { title: 'The coordinates c solve B c = x', tex: `${texMat(B)}\\begin{bmatrix}c_1\\\\c_2\\end{bmatrix} = ${texVec(x)}` },
      { title: 'Invert the basis matrix', tex: `B^{-1} = \\frac{1}{${tnum(dB)}}\\begin{bmatrix}${tnum(B[1][1])} & ${tnum(-B[0][1])}\\\\ ${tnum(-B[1][0])} & ${tnum(B[0][0])}\\end{bmatrix}`, rule: '2×2 inverse' },
      { title: 'Coordinates in the basis B', tex: `[\\mathbf x]_B = B^{-1}\\mathbf x = ${texVec(c)}` },
      { title: 'Check', tex: `${tnum(c[0])}\\,${texVec(b1)} + ${tnum(c[1])}\\,${texVec(b2)} = ${texVec(x)}` },
    ] : []);
    ctx.setNote(Binv
      ? `The arrow **x** never moves; only its description changes. In the standard basis it is $(${tnum(x[0])},\\ ${tnum(x[1])})$; walking along the violet $B$-grid it is $${tnum(c[0])}\\,\\mathbf b_1 + ${tnum(c[1])}\\,\\mathbf b_2$. Converting: $\\mathbf x = B[\\mathbf x]_B$ and $[\\mathbf x]_B = B^{-1}\\mathbf x$.`
      : 'The vectors b₁ and b₂ are parallel (or zero): they do not span the plane, so they are **not a basis** and coordinates in them are not defined.');
    ctx.warn(!Binv ? 'b₁ and b₂ are dependent — not a basis.' : Math.abs(dB) < 0.15 ? 'b₁ and b₂ are nearly parallel: coordinates in this basis are very sensitive (ill-conditioned).' : '');
  };
  return { update, dispose() {} };
}

export const vectorDemos: DemoDef[] = [
  {
    id: 'linalg.vectors', module: 'linalg', title: 'Vector arithmetic, tip to tail', topic: 'Vectors and vector spaces; addition, subtraction, scaling',
    summary: 'Drag the tips of u and v. Addition puts one arrow at the end of the other; subtraction is the arrow between the tips; scaling stretches along a line.',
    tex: '\\mathbf u+\\mathbf v = (u_1+v_1,\\ u_2+v_2),\\quad c\\,\\mathbf u = (c u_1,\\ c u_2)',
    view: '2d',
    params: [...vecParams('u', [3, 1], 5), ...vecParams('v', [1, 2.5], 5), { key: 'c', label: 'scalar c', value: 1.5, min: -3, max: 3, step: 0.01 }],
    choices: [{ key: 'op', label: 'Operation', value: 'add', options: [['add', 'u + v (tip to tail)'], ['sub', 'u − v'], ['scale', 'c · u']] }],
    toggles: [{ key: 'para', label: 'Parallelogram / helpers', value: true }, { key: 'comp', label: 'Components', value: false }, { key: 'snap', label: 'Snap to ½-grid', value: true }],
    experiments: [
      'Drag v until it points exactly opposite to u. What is |u + v| now? When is the triangle inequality an equality?',
      'Switch to u − v and drag v onto u: the difference shrinks to the zero vector.',
      'In c · u mode, make c negative, then 0. Every multiple stays on one line — the span of u.',
      'Turn on Components and check u + v coordinate by coordinate.',
    ],
    connections: ['linalg.span', 'linalg.basis', 'linalg.projection'],
    accuracy: 'Exact: all values are computed directly from the coordinates (shown to 4 significant figures).',
    create: vectorsDemo,
  },
  {
    id: 'linalg.span', module: 'linalg', title: 'Linear combinations, span and independence', topic: 'Linear combinations; span; linear independence',
    summary: 'Combine one, two or three vectors in space with coefficients a, b, c. Play the timeline to sweep the coefficients and watch the combinations fill a line, a plane or all of space; make the vectors dependent and the relation between them appears as a closed loop.',
    tex: 'a\\mathbf u+b\\mathbf v+c\\mathbf w,\\qquad \\text{independent} \\iff (a\\mathbf u+b\\mathbf v+c\\mathbf w=\\mathbf 0 \\Rightarrow a=b=c=0)',
    view: '3d', animated: true,
    params: [...vecParams('u', [2, 0, 0.5], 3), ...vecParams('v', [0.5, 2, 0], 3), ...vecParams('w', [0, 0.5, 2], 3),
      { key: 'a', label: 'a', value: 1, min: -2.5, max: 2.5, step: 0.01 }, { key: 'b', label: 'b', value: 0.8, min: -2.5, max: 2.5, step: 0.01 }, { key: 'c', label: 'c', value: 0.5, min: -2.5, max: 2.5, step: 0.01 }],
    choices: [{ key: 'count', label: 'Vectors', value: '2', options: [['1', 'u'], ['2', 'u, v'], ['3', 'u, v, w']] }],
    toggles: [{ key: 'span', label: 'Show the span', value: true }, { key: 'trail', label: 'Trail of combinations', value: true }, { key: 'dep', label: 'Dependency loop', value: true }, { key: 'snap', label: 'Snap tips to ½-grid', value: true }],
    experiments: [
      'With u and v, press play: the trail of a·u + b·v fills a plane through the origin.',
      'Drag v onto the line of u (try v = (1, 0, 0.25) with u = (2, 0, 0.5)): the plane collapses to a line and the orange loop shows v = ½u.',
      'Choose three vectors and drag w into the plane of u and v: the box flattens, det → 0, and a dependency loop appears.',
      'Why can no list containing the zero vector be independent?',
    ],
    connections: ['linalg.vectors', 'linalg.rank', 'linalg.basis', 'linalg.transform3d'],
    accuracy: 'Rank and the dependency relation come from exact-arithmetic-style row reduction in floating point with a relative tolerance of 1e−9; with snapping on, dependent configurations are hit exactly.',
    create: spanDemo,
  },
  {
    id: 'linalg.basis', module: 'linalg', title: 'Change of basis', topic: 'Bases and coordinates; change of basis; quantum states as vectors',
    summary: 'One arrow x, two descriptions: its standard coordinates and its coordinates along a basis b₁, b₂ you drag. The quantum view uses an orthonormal basis, where squared coordinates are probabilities.',
    tex: '\\mathbf x = c_1\\mathbf b_1 + c_2\\mathbf b_2 = B[\\mathbf x]_B,\\qquad [\\mathbf x]_B = B^{-1}\\mathbf x',
    view: '2d',
    params: [...vecParams('b1', [2, 0.5], 4, 'b_1'), ...vecParams('b2', [0.5, 1.5], 4, 'b_2'), ...vecParams('x', [2.5, 2.5], 4),
      { key: 'theta', label: 'basis angle θ (°)', value: 30, min: 0, max: 179, step: 1 }, { key: 'phi', label: 'state angle φ (°)', value: 70, min: 0, max: 359, step: 1 }],
    choices: [{ key: 'mode', label: 'View', value: 'general', options: [['general', 'Any basis'], ['quantum', 'Orthonormal basis (quantum state)']] }],
    toggles: [{ key: 'grid', label: 'Basis grid', value: true }, { key: 'std', label: 'Standard components', value: false }, { key: 'snap', label: 'Snap to ¼-grid', value: true }],
    experiments: [
      'Drag x onto a crossing of the violet grid: its B-coordinates become whole numbers.',
      'Rotate b₂ towards b₁. The coordinates blow up as the basis degenerates — and are undefined when they are parallel.',
      'Make b₁ = (1, 0) and b₂ = (0, 1): the two descriptions agree.',
      'Quantum view: drag the state |ψ⟩ until P(b₁) = ½. At what angle to the basis is it?',
    ],
    connections: ['linalg.diagonalize', 'linalg.span', 'linalg.gramschmidt', 'linalg.projection'],
    accuracy: 'Exact up to floating point: coordinates come from the 2×2 inverse.',
    create: basisDemo,
  },
];
