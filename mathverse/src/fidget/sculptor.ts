// Surface Sculptor: a family of surfaces — ripples, a saddle bowl and four
// Gaussian bumps you drag around — that melts smoothly from one shape to the
// next whenever a coefficient changes.

import type { DemoDef, DemoCtx, DemoInstance } from '../modules/types';
import type { V3 } from '../engine/viewport3d';
import { SERIES } from '../engine/colors';
import { Sculpt, sculptZ, sculptGrad, sculptVolume, approach } from '../core/numeric/fidget';
import { fmt, tx, ping, keyboard } from './common';

const R = 3;

interface BumpPos { x: number; y: number; s: number }
const HOME: BumpPos[] = [{ x: 1.2, y: 1.0, s: 1 }, { x: -1.3, y: -0.8, s: 1 }, { x: 1.1, y: -1.5, s: 1 }, { x: -1.2, y: 1.4, s: 1 }];

const PRESETS: Record<string, { p: Record<string, number>; pos?: BumpPos[] }> = {
  flat: { p: { a: 0, b: 1, c: 1, d: 0, e: 0, h1: 0, h2: 0, h3: 0, h4: 0, s: 1 } },
  ripples: { p: { a: 0.9, b: 2.4, c: 2.4, d: 0, e: 0, h1: 0, h2: 0, h3: 0, h4: 0, s: 1 } },
  eggcrate: { p: { a: 0.8, b: 1.6, c: 1.6, d: 0, e: 0, h1: 0, h2: 0, h3: 0, h4: 0, s: 1 } },
  saddle: { p: { a: 0, b: 1, c: 1, d: 0.22, e: 0.22, h1: 0, h2: 0, h3: 0, h4: 0, s: 1 } },
  peaks: { p: { a: 0.25, b: 1.2, c: 0.9, d: -0.06, e: 0.06, h1: 1.9, h2: 1.4, h3: -1.1, h4: 0.8, s: 0.9 }, pos: HOME },
  volcano: { p: { a: 0, b: 1, c: 1, d: 0, e: 0, h1: 2.4, h2: -1.6, h3: 0, h4: 0, s: 1 }, pos: [{ x: 0, y: 0, s: 0.95 }, { x: 0, y: 0, s: 0.42 }, HOME[2], HOME[3]] },
};

function create(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  v.setBounds({ x: [-R, R], y: [-R, R], z: [-2.5, 2.5] });
  v.camera.position.lerp(v.controls.target, 0.18); v.controls.update();
  const target: Sculpt = { a: 0, b: 0, c: 0, d: 0, e: 0, bumps: HOME.map((b) => ({ ...b, h: 0 })) };
  const pos: BumpPos[] = HOME.map((b) => ({ ...b }));          // target bump positions and widths (internal state)
  const readTarget = () => {
    const p = ctx.params;
    target.a = p.a; target.b = p.b; target.c = p.c; target.d = p.d; target.e = p.e;
    target.bumps.forEach((B, i) => { B.x = pos[i].x; B.y = pos[i].y; B.s = pos[i].s * p.s; B.h = p[`h${i + 1}`]; });
  };
  readTarget();
  const cur: Sculpt = { ...target, bumps: target.bumps.map((b) => ({ ...b })) };
  const Z = (x: number, y: number) => sculptZ(cur, x, y);
  const G = (x: number, y: number): V3 => [x, y, Z(x, y)];
  const surf = v.addGraph(Z, [-R, R], [-R, R], { res: 110, colormap: 'turbo' });
  const keys = keyboard(['Shift']);

  // a handle on top of each bump: drag to move it; hold Shift and drag up/down to raise or sink it
  const handles = cur.bumps.map((B, i) => v.addPoint([B.x, B.y, Z(B.x, B.y)], {
    color: SERIES[[1, 4, 5, 6][i]], size: 0.11, label: `<span style="font-size:11px">h${'₁₂₃₄'[i]}</span>`,
    drag: {
      constrain: (p) => {
        if (keys.held.has('Shift')) {
          // vertical: the bump's height is whatever lifts the surface to the pointer
          const B = cur.bumps[i];
          const rest = sculptZ(cur, B.x, B.y) - B.h;
          const h = Math.max(-2.5, Math.min(2.5, Math.round((p[2] - rest) * 50) / 50));
          return [B.x, B.y, rest + h];
        }
        const x = Math.max(-R, Math.min(R, p[0])), y = Math.max(-R, Math.min(R, p[1]));
        return [x, y, Z(x, y)];
      },
      onDrag: (p) => {
        if (keys.held.has('Shift')) {
          const B = cur.bumps[i];
          const h = Math.round((p[2] - (sculptZ(cur, B.x, B.y) - B.h)) * 50) / 50;
          if (h !== ctx.params[`h${i + 1}`]) { ctx.setParam(`h${i + 1}`, h); ping(0.5 + h / 5, 0.02); }
          target.bumps[i].h = h; B.h = h;      // height follows the hand at once
        } else {
          pos[i].x = p[0]; pos[i].y = p[1];
          target.bumps[i].x = p[0]; target.bumps[i].y = p[1];
        }
        report();
      },
    },
  }));

  let lastPreset = ctx.choices.preset;

  const report = () => {
    const T = target;
    // the highest and lowest points by a grid search over the square (numerical)
    let hi = -Infinity, lo = Infinity, hx = 0, hy = 0, lx = 0, ly = 0;
    const n = 120;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const x = -R + (2 * R * i) / n, y = -R + (2 * R * j) / n, z = sculptZ(T, x, y);
      if (z > hi) { hi = z; hx = x; hy = y; }
      if (z < lo) { lo = z; lx = x; ly = y; }
    }
    const vol = sculptVolume(T, R);
    const [gx, gy] = sculptGrad(T, hx, hy);
    ctx.setReadouts([
      { label: 'highest point (grid search)', value: `${fmt(hi)} at (${fmt(hx, 3)}, ${fmt(hy, 3)})` },
      { label: 'lowest point (grid search)', value: `${fmt(lo)} at (${fmt(lx, 3)}, ${fmt(ly, 3)})` },
      { label: '|∇z| at the highest grid point', value: fmt(Math.hypot(gx, gy), 3), tone: 'muted' },
      { label: '∬ z dA over the square (exact)', value: fmt(vol, 6) },
      { label: 'mean height', value: fmt(vol / (4 * R * R), 5) },
    ]);
    const terms: string[] = [];
    if (T.a) terms.push(`${tx(T.a, 3)}\\sin(${tx(T.b, 3)}x)\\cos(${tx(T.c, 3)}y)`);
    if (T.d) terms.push(`${tx(T.d, 3)}x^2`);
    if (T.e) terms.push(`${tx(-T.e, 3)}y^2`);
    const nb = T.bumps.filter((B) => B.h !== 0).length;
    if (nb) terms.push(`\\sum_{i} h_i\\, e^{-|p-p_i|^2/2s_i^2}\\ \\text{(${nb} bump${nb > 1 ? 's' : ''})}`);
    ctx.setNote(`$$z = ${terms.length ? terms.join(' + ').replace(/\+ -/g, '- ') : '0'}$$Each $G_i = e^{-|p-p_i|^2/2s_i^2}$ is a Gaussian bump centred at $p_i$. Drag a coloured ball to slide its bump across the surface; **hold Shift while dragging** to raise or sink it. Every change melts in smoothly — the readouts show where the surface is going.`);
    ctx.warn('');
  };

  const update = () => {
    const pre = ctx.choices.preset;
    if (pre !== lastPreset) {
      lastPreset = pre;
      const P = PRESETS[pre];
      if (P) {
        for (const [k, val] of Object.entries(P.p)) ctx.setParam(k, val);
        if (P.pos) P.pos.forEach((b, i) => { pos[i] = { ...b }; });
        ping(0.6);
      }
    }
    readTarget();
    handles.forEach((h) => h.visible(!!ctx.toggles.handles));
    surf.update(G, { wireframe: !!ctx.toggles.wire });
    report();
  };

  let settled = false;
  const stop = v.onFrame((dt) => {
    let moving = false;
    const go = (a: number, b: number, rate: number) => { if (Math.abs(a - b) > 1e-5) { moving = true; return approach(a, b, rate, dt); } return b; };
    cur.a = go(cur.a, target.a, 5); cur.b = go(cur.b, target.b, 5); cur.c = go(cur.c, target.c, 5);
    cur.d = go(cur.d, target.d, 5); cur.e = go(cur.e, target.e, 5);
    cur.bumps.forEach((B, i) => {
      const T = target.bumps[i];
      B.x = go(B.x, T.x, 18); B.y = go(B.y, T.y, 18); B.s = go(B.s, T.s, 6); B.h = go(B.h, T.h, 7);
    });
    if (moving || !settled) {
      surf.update(G);
      handles.forEach((h, i) => { const B = cur.bumps[i]; h.set([B.x, B.y, Z(B.x, B.y) + 0.02]); });
    }
    settled = !moving;
  });

  return { update, dispose() { stop(); keys.stop(); v.clear(); } };
}

export const surfaceSculptor: DemoDef = {
  id: 'fidget.sculptor', module: 'fidget', title: 'Surface Sculptor', topic: 'Surfaces z = f(x, y) as clay: families, coefficients, Gaussian bumps',
  summary: 'A surface made of ripples, a saddle bowl and four Gaussian bumps. Slide the bumps, raise them, change any coefficient — and watch it melt into its new shape.',
  tex: 'z = a\\sin bx\\,\\cos cy + dx^2 - ey^2 + \\textstyle\\sum_i h_i G_i',
  view: '3d',
  params: [
    { key: 'a', label: 'ripple amplitude a', value: 0.45, min: -2, max: 2, step: 0.01 },
    { key: 'b', label: 'x-frequency b', value: 1.4, min: 0, max: 4, step: 0.01 },
    { key: 'c', label: 'y-frequency c', value: 1.1, min: 0, max: 4, step: 0.01 },
    { key: 'd', label: 'bowl in x, d', value: 0.04, min: -0.4, max: 0.4, step: 0.005 },
    { key: 'e', label: 'saddle in y, e', value: 0.04, min: -0.4, max: 0.4, step: 0.005 },
    { key: 'h1', label: 'bump height $h_1$', value: 1.3, min: -2.5, max: 2.5, step: 0.01 },
    { key: 'h2', label: 'bump height $h_2$', value: -0.9, min: -2.5, max: 2.5, step: 0.01 },
    { key: 'h3', label: 'bump height $h_3$', value: 0, min: -2.5, max: 2.5, step: 0.01 },
    { key: 'h4', label: 'bump height $h_4$', value: 0.7, min: -2.5, max: 2.5, step: 0.01 },
    { key: 's', label: 'bump width scale', value: 1, min: 0.3, max: 2, step: 0.01 },
  ],
  choices: [{ key: 'preset', label: 'Morph to', value: 'custom', options: [['custom', 'Custom (your sliders)'], ['flat', 'Flat sheet'], ['ripples', 'Ripples'], ['eggcrate', 'Egg crate'], ['saddle', 'Saddle'], ['peaks', 'Mountain range'], ['volcano', 'Volcano']] }],
  toggles: [{ key: 'handles', label: 'Bump handles', value: true }, { key: 'wire', label: 'Wireframe', value: false }],
  experiments: [
    'Pick **Volcano**, then **Flat sheet**, then **Mountain range** — watch the surface melt between them.',
    'Slide one bump onto another. Heights add: two bumps of +1.5 and −1.5 on the same spot cancel… unless their widths differ (that is the volcano).',
    'Hold **Shift** and drag a handle down to dig a pit. Does the exact volume readout go negative?',
    'Set a = 0 and make d = e: the saddle z = d(x² − y²). Now make e negative — a bowl.',
    'Animate the x-frequency b (the ▷ beside its slider) and watch the ripples breathe.',
  ],
  connections: ['fidget.curvature', 'fidget.waves'],
  accuracy: 'The surface is evaluated exactly at 111 × 111 points. The morph is an exponential ease of the coefficients (the in-between shapes are members of the same family). The volume is exact (closed form with erf); highest and lowest points come from a 121 × 121 grid search, so they are accurate to the grid spacing 0.05.',
  create,
};
