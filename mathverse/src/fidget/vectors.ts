// Vector Playground: drag the tips of two (or three) vectors through space and
// watch the dot product, the cross product, the angle, the projection and the
// spanned area (or volume) respond.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../modules/types';
import type { V3 } from '../engine/viewport3d';
import { SERIES } from '../engine/colors';
import { vecStats, approach, snapTo, cross3, scale3, add3, unit3, norm3, sub3 } from '../core/numeric/fidget';
import { addTriangles, addSegments, dashes, fmt, tx, vecStr, ping } from './common';

const B = 4;               // half-width of the box
const SNAP = 0.5;

const COL = { a: SERIES[0], b: SERIES[2], c: SERIES[3], x: SERIES[4], p: SERIES[1] };

function create(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  v.setBounds({ x: [-B, B], y: [-B, B], z: [-B, B] });
  const keys = ['a', 'b', 'c'] as const;
  const target: Record<string, V3> = {}, shown: Record<string, V3> = {};
  const read = (k: string): V3 => [ctx.params[k + 'x'], ctx.params[k + 'y'], ctx.params[k + 'z']];
  for (const k of keys) { target[k] = read(k); shown[k] = [...target[k]] as V3; }

  const clampB = (x: number) => Math.max(-B, Math.min(B, x));
  const constrain = (p: V3): V3 => {
    const q = p.map(clampB) as V3;
    return ctx.toggles.snap ? q.map((x) => snapTo(x, SNAP)) as V3 : q.map((x) => Math.round(x * 100) / 100) as V3;
  };
  const arrows: Record<string, ReturnType<typeof v.addArrow>> = {};
  const tips: Record<string, ReturnType<typeof v.addPoint>> = {};
  let lastSnap = '';
  for (const k of keys) {
    arrows[k] = v.addArrow([0, 0, 0], shown[k], { color: COL[k], label: `<b>${k}</b>` });
    tips[k] = v.addPoint(shown[k], {
      color: COL[k], size: 0.14,
      drag: {
        constrain,
        onDrag: (p) => {
          target[k] = p;
          ctx.setParam(k + 'x', p[0]); ctx.setParam(k + 'y', p[1]); ctx.setParam(k + 'z', p[2]);
          const key = p.join(',');
          if (ctx.toggles.snap && key !== lastSnap) ping(0.35 + 0.08 * norm3(p));
          lastSnap = key;
          refresh();
        },
      },
    });
  }
  const crossArrow = v.addArrow([0, 0, 0], [0, 0, 1], { color: COL.x, label: 'a × b' });
  const projArrow = v.addArrow([0, 0, 0], [0, 0, 1], { color: COL.p, radius: 0.035 });
  const drop = addSegments(v, 80, { color: COL.p, opacity: 0.9 });
  const arc = addSegments(v, 64, { color: '#e6e9ef' });
  const angleLabel = v.addLabel([0, 0, 0], '', 'v3-label');
  const faces = addTriangles(v, 12, { color: COL.x, opacity: 0.22 });
  const edges = addSegments(v, 12, { color: COL.x, opacity: 0.55 });

  let wasPerp = false, wasPar = false;

  /** readouts from the exact (target) vectors */
  const refresh = () => {
    const a = target.a, b = target.b, c = target.c;
    const third = ctx.toggles.third;
    const s = vecStats(a, b, third ? c : undefined);
    const deg = (s.angle * 180) / Math.PI;
    const perp = Math.abs(s.dot) < 1e-9 && s.magA > 0 && s.magB > 0;
    const par = s.area < 1e-9 && s.magA > 0 && s.magB > 0;
    if (perp && !wasPerp) ping(0.9);
    if (par && !wasPar) ping(0.15);
    wasPerp = perp; wasPar = par;
    const rows: Readout[] = [
      { label: 'a', value: vecStr(a) }, { label: 'b', value: vecStr(b) },
      ...(third ? [{ label: 'c', value: vecStr(c) }] : []),
      { label: '|a|,  |b|', value: `${fmt(s.magA)},  ${fmt(s.magB)}` },
      { label: 'a · b', value: fmt(s.dot, 6), tone: perp ? 'good' as const : undefined },
      { label: 'angle θ', value: Number.isFinite(deg) ? `${fmt(deg, 5)}°` : 'undefined (a zero vector)', tone: perp ? 'good' as const : par ? 'warn' as const : undefined },
      { label: 'a × b', value: vecStr(s.cross), tone: par ? 'warn' as const : undefined },
      { label: '|a × b|  parallelogram area', value: fmt(s.area, 6) },
      { label: 'comp_b a = a·b/|b|', value: fmt(s.comp, 6) },
      { label: 'proj_b a', value: vecStr(s.proj) },
    ];
    if (third) rows.push({ label: 'a · (b × c)  signed volume', value: fmt(s.triple, 6), tone: Math.abs(s.triple) < 1e-9 ? 'warn' : undefined });
    ctx.setReadouts(rows);
    const cosT = s.magA > 0 && s.magB > 0 ? s.dot / (s.magA * s.magB) : NaN;
    ctx.setNote(
      `$a\\cdot b = |a||b|\\cos\\theta = ${tx(s.magA)}\\cdot${tx(s.magB)}\\cdot${tx(cosT)} = ${tx(s.dot, 6)}$, and $|a\\times b| = |a||b|\\sin\\theta = ${tx(s.area, 6)}$. ` +
      (perp ? '**Perpendicular:** the dot product vanishes and the cross product is as long as it can be. ' : par ? '**Parallel:** the cross product vanishes — no area is spanned. ' : '') +
      (third ? `The triple product $a\\cdot(b\\times c) = ${tx(s.triple, 6)}$ is the parallelepiped's signed volume${Math.abs(s.triple) < 1e-9 ? ' — zero: the three vectors lie in one plane' : s.triple > 0 ? ' (a, b, c right-handed)' : ' (left-handed)'}.` : ''),
    );
    ctx.warn('');
  };

  /** geometry from the smoothed (shown) vectors */
  const draw = () => {
    const a = shown.a, b = shown.b, c = shown.c;
    const third = ctx.toggles.third;
    for (const k of keys) {
      const on = k !== 'c' || third;
      arrows[k].visible(on); tips[k].visible(on);
      if (on) { arrows[k].set([0, 0, 0], shown[k]); tips[k].set(shown[k]); }
    }
    const s = vecStats(a, b);
    crossArrow.visible(!!ctx.toggles.cross && s.area > 1e-6);
    if (ctx.toggles.cross) crossArrow.set([0, 0, 0], s.cross);
    const showProj = !!ctx.toggles.proj && s.magB > 1e-6;
    projArrow.visible(showProj && norm3(s.proj) > 1e-3); drop.visible(showProj);
    if (showProj) { projArrow.set([0, 0, 0], s.proj); drop.set(dashes(a, s.proj, 0.09)); }
    // the angle arc, drawn at a radius proportional to the shorter vector
    if (s.magA > 1e-6 && s.magB > 1e-6) {
      const r = 0.35 * Math.min(s.magA, s.magB, 2.5);
      const ua = unit3(a);
      // a unit vector perpendicular to a, in the plane of a and b, towards b
      let w = sub3(unit3(b), scale3(ua, Math.cos(s.angle)));
      w = norm3(w) > 1e-9 ? unit3(w) : unit3(cross3(ua, Math.abs(ua[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
      const pts: V3[] = [];
      const n = 32;
      for (let i = 0; i < n; i++) {
        const t0 = (s.angle * i) / n, t1 = (s.angle * (i + 1)) / n;
        pts.push(add3(scale3(ua, r * Math.cos(t0)), scale3(w, r * Math.sin(t0))), add3(scale3(ua, r * Math.cos(t1)), scale3(w, r * Math.sin(t1))));
      }
      arc.set(pts); arc.visible(true);
      const perp = Math.abs(s.dot) < 1e-3 * s.magA * s.magB;
      arc.setColor(perp ? '#6fcf97' : ctx.dark ? '#e6e9ef' : '#2a3040');
      const mid = add3(scale3(ua, 1.6 * r * Math.cos(s.angle / 2)), scale3(w, 1.6 * r * Math.sin(s.angle / 2)));
      angleLabel.set(mid, `θ = ${fmt((s.angle * 180) / Math.PI, 4)}°`); angleLabel.visible(true);
    } else { arc.visible(false); angleLabel.visible(false); }
    // the parallelogram of a and b, or the parallelepiped of a, b, c
    const para = !!ctx.toggles.para;
    faces.visible(para); edges.visible(para);
    if (para) {
      const O: V3 = [0, 0, 0], ab = add3(a, b);
      if (!third) {
        faces.set([O, a, ab, O, ab, b]);
        edges.set([a, ab, b, ab]);
      } else {
        const ac = add3(a, c), bc = add3(b, c), abc = add3(ab, c);
        const quad = (p: V3, q: V3, r: V3, t: V3): V3[] => [p, q, r, p, r, t];
        faces.set([...quad(O, a, ab, b), ...quad(c, ac, abc, bc), ...quad(O, a, ac, c), ...quad(b, ab, abc, bc), ...quad(O, b, bc, c), ...quad(a, ab, abc, ac)]);
        edges.set([a, ab, b, ab, c, ac, c, bc, ac, abc, bc, abc, a, ac, b, bc, ab, abc]);
      }
    }
  };

  const update = () => {
    for (const k of keys) {
      const p = read(k);
      target[k] = ctx.toggles.snap ? (p.map((x) => snapTo(x, SNAP)) as V3) : p;
      if (ctx.toggles.snap) target[k].forEach((x, i) => { if (x !== p[i]) ctx.setParam(k + 'xyz'[i], x); });
    }
    refresh();
    draw();
  };

  const stop = v.onFrame((dt) => {
    let moving = false;
    for (const k of keys) for (let i = 0; i < 3; i++) {
      const t = target[k][i], s = shown[k][i];
      if (Math.abs(t - s) > 1e-5) { shown[k][i] = approach(s, t, 22, dt); moving = true; } else shown[k][i] = t;
    }
    if (moving) draw();
  });

  return { update, dispose() { stop(); v.clear(); } };
}

const P = (key: string, label: string, value: number) => ({ key, label, value, min: -B, max: B, step: 0.01 });

export const vectorPlayground: DemoDef = {
  id: 'fidget.vectors', module: 'fidget', title: 'Vector Playground', topic: 'Dot and cross products, angles, projections',
  summary: 'Grab the tips of a and b and throw them around space: the dot product, cross product, angle and projection follow your hand.',
  tex: 'a\\cdot b = |a||b|\\cos\\theta,\\qquad |a\\times b| = |a||b|\\sin\\theta',
  view: '3d',
  params: [P('ax', '$a_x$', 2), P('ay', '$a_y$', 0.5), P('az', '$a_z$', 0.5), P('bx', '$b_x$', 0.5), P('by', '$b_y$', 2), P('bz', '$b_z$', 1), P('cx', '$c_x$', 0), P('cy', '$c_y$', 0.5), P('cz', '$c_z$', 2)],
  toggles: [
    { key: 'snap', label: 'Snap to the ½-grid', value: true },
    { key: 'cross', label: 'Cross product a × b', value: true },
    { key: 'proj', label: 'Projection of a on b', value: true },
    { key: 'para', label: 'Spanned parallelogram / box', value: true },
    { key: 'third', label: 'Third vector c', value: false },
  ],
  experiments: [
    'Swing **b** until the angle arc turns green: a · b = 0. Where does the cross product point now, and how long is it?',
    'Lay **b** along **a**. The cross product shrinks to nothing and the parallelogram collapses.',
    'Swap the roles: drag **a** across **b** and watch a × b flip — the cross product is anti-commutative.',
    'Turn on **c** and squash it into the plane of a and b: the box goes flat and the triple product reads 0.',
    'With snap on, find two whole-number vectors at exactly 60°. (Hint: (1, 1, 0) and (0, 1, 1).)',
  ],
  connections: ['fidget.eigen', 'fidget.curvature'],
  accuracy: 'Every number is computed exactly from the components shown (floating point). The angle uses atan2(|a×b|, a·b), accurate even for nearly parallel vectors. The arrows glide to new positions for smoothness; the readouts always show the target values.',
  tutorial: [
    { text: 'Two vectors **a** (blue) and **b** (red) start at the origin. The balls at their tips are handles — drag one. Rotate the view by dragging the background.', task: 'Drag the tip of **b** somewhere new.', set: { toggles: { snap: true, third: false } }, done: (c) => c.params.bx !== 0.5 || c.params.by !== 2 || c.params.bz !== 1 },
    { text: 'The **dot product** $a\\cdot b = |a||b|\\cos\\theta$ measures how much the vectors agree. It is zero exactly when they are perpendicular.', task: 'Make a · b = 0 — the angle arc turns green.', done: (c) => Math.abs(c.params.ax * c.params.bx + c.params.ay * c.params.by + c.params.az * c.params.bz) < 1e-6 },
    { text: 'The **cross product** $a\\times b$ (violet) is perpendicular to both, with length $|a||b|\\sin\\theta$ — the area of the parallelogram they span. Right-hand rule: curl your fingers from a to b.', task: 'Make the vectors parallel: the cross product vanishes.', set: { toggles: { cross: true, para: true } }, done: (c) => { const a: V3 = [c.params.ax, c.params.ay, c.params.az], b: V3 = [c.params.bx, c.params.by, c.params.bz]; return norm3(cross3(a, b)) < 1e-6 && norm3(a) > 0 && norm3(b) > 0; } },
    { text: 'The **projection** of a on b (yellow) is the shadow a casts on the line of b: $\\mathrm{proj}_b a = \\frac{a\\cdot b}{|b|^2}\\,b$. The dashed drop line is perpendicular to b.', task: 'Make the projection point opposite to b (an obtuse angle).', set: { toggles: { proj: true } }, done: (c) => c.params.ax * c.params.bx + c.params.ay * c.params.by + c.params.az * c.params.bz < 0 },
    { text: 'Add a third vector **c**. The box spanned by a, b, c has signed volume $a\\cdot(b\\times c)$ — the determinant of the matrix with columns a, b, c.', task: 'Flatten the box: put c in the plane of a and b.', set: { toggles: { third: true, para: true } }, done: (c) => { const a: V3 = [c.params.ax, c.params.ay, c.params.az], b: V3 = [c.params.bx, c.params.by, c.params.bz], cc: V3 = [c.params.cx, c.params.cy, c.params.cz]; return Math.abs(cc[0] * cross3(a, b)[0] + cc[1] * cross3(a, b)[1] + cc[2] * cross3(a, b)[2]) < 1e-6; } },
  ],
  create,
};
