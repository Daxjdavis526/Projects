// A vibrating membrane: normal modes of a rectangular drum (m, n) and of a
// circular drum (Bessel modes J_m(j_{mn} r) cos mθ, with the zeros j_{mn}
// computed numerically), and superpositions of two modes. The surface is
// updated in place every frame.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { besselJ, besselJZeros } from '../../core/numeric/pde';
import type { SurfaceHandle, Handle } from '../../engine/viewport3d';
import { fmt } from './common';

const zerosCache = new Map<number, number[]>();
const zeros = (m: number) => { let z = zerosCache.get(m); if (!z) { z = besselJZeros(m, 8); zerosCache.set(m, z); } return z; };

export const membrane: DemoDef = {
  id: 'pde.membrane', module: 'pde', title: 'Vibrating membranes: drum modes',
  topic: 'Wave equation in 2D · normal modes · Bessel functions · superposition · degenerate modes',
  summary: 'A drumhead fixed at its rim vibrates in normal modes: sines on a rectangle, Bessel functions on a circle, with frequencies that are not whole-number multiples — which is why a drum has no clear pitch.',
  tex: 'u_{tt} = c^2\\nabla^2 u,\\quad u|_{\\partial\\Omega} = 0;\\qquad u_{mn} = J_m\\!\\left(j_{mn}\\tfrac rR\\right)\\cos m\\theta\\,\\cos\\omega_{mn}t,\\ \\ \\omega_{mn} = \\tfrac{c\\,j_{mn}}{R}',
  view: '3d', animated: true,
  params: [
    { key: 'm', label: 'mode m (drum: nodal diameters)', value: 0, min: 0, max: 6, step: 1 },
    { key: 'n', label: 'mode n (drum: n − 1 nodal circles)', value: 1, min: 1, max: 5, step: 1 },
    { key: 'mix', label: 'amount of a second mode', value: 0, min: 0, max: 1, step: 0.01 },
    { key: 'm2', label: 'second mode m₂', value: 1, min: 0, max: 6, step: 1 },
    { key: 'n2', label: 'second mode n₂', value: 1, min: 1, max: 5, step: 1 },
    { key: 'aspect', label: 'rectangle aspect b/a', value: 1, min: 0.5, max: 2, step: 0.01 },
    { key: 'res', label: 'surface resolution', value: 64, min: 24, max: 110, step: 2 },
  ],
  choices: [{ key: 'shape', label: 'Drum', value: 'circle', options: [['circle', 'circular (Bessel modes)'], ['rect', 'rectangular (sine modes)']] }],
  toggles: [{ key: 'nodal', label: 'Nodal lines (never move)', value: true }],
  experiments: [
    'Circular drum, m = 0, n = 1: the fundamental. Now n = 2: one nodal circle appears, at r = j₀₁/j₀₂ ≈ 0.436 R.',
    'Read the frequency ratios: 1, 1.593, 2.136, 2.295, … — not 1, 2, 3. A drum is inharmonic.',
    'Rectangular, square (b/a = 1): set (1, 2) and mix in (2, 1) fully. They have the same frequency, so the sum is a new standing pattern with diagonal nodal lines (Chladni).',
    'Mix two modes of different frequency: the shape no longer repeats simply — watch the nodal lines of the sum wander.',
    'Stretch the rectangle (b/a = 2): (1, 2) and (2, 1) split apart in frequency — the degeneracy was a symmetry of the square.',
  ],
  connections: ['pde.wave', 'pde.separation', 'pde.heat2d', 'pde.laplace'],
  accuracy: 'Mode shapes and frequencies are exact formulas. Bessel J_m is computed by the trapezoid rule on its integral representation (exponentially convergent, ~1e−15); its zeros j_{mn} by Brent\'s method to ~1e−13. Amplitudes are normalized to 1; time is slowed so the fundamental takes about two seconds per cycle, preserving all frequency ratios.',
  tutorial: [
    { text: '**A drumhead.** A membrane under uniform tension obeys $u_{tt} = c^2\\nabla^2 u$, fixed ($u = 0$) on its rim. Separation of variables gives **normal modes**: shapes that keep their form and just oscillate, $u = \\phi(x, y)\\cos\\omega t$ with $\\nabla^2\\phi = -(\\omega/c)^2\\phi$.', task: 'Press play to watch the fundamental of the circular drum.', set: { choices: { shape: 'circle' }, params: { m: 0, n: 1, mix: 0 }, toggles: { nodal: true } }, done: (c) => c.time.t > 2 },
    { text: '**Bessel modes.** In polar coordinates $\\phi = J_m(kr)\\cos m\\theta$, and the rim condition $J_m(kR) = 0$ picks $k = j_{mn}/R$, the $n$-th zero of $J_m$. There is no formula for $j_{mn}$; MathVerse finds them numerically. $m$ counts nodal diameters, $n - 1$ nodal circles.', task: 'Show the mode with two nodal diameters and one nodal circle: m = 2, n = 2.', done: (c) => c.choices.shape === 'circle' && c.params.m === 2 && c.params.n === 2 },
    { text: '**Inharmonic.** The frequencies are proportional to $j_{mn}$: $2.405, 3.832, 5.136, 5.520, \\ldots$ — ratios $1, 1.593, 2.136, 2.295$. A violin string has ratios $1, 2, 3, \\ldots$ and a clear pitch; a drum does not. (Timpani get a pitch back through air loading — physics this model leaves out.)', task: 'Find the m = 1, n = 1 mode and read its ratio to the fundamental (≈ 1.593).', done: (c) => c.choices.shape === 'circle' && c.params.m === 1 && c.params.n === 1 },
    { text: '**Rectangular drum.** On $[0, a] \\times [0, b]$ the modes are $\\sin\\frac{m\\pi x}{a}\\sin\\frac{n\\pi y}{b}$ with $\\omega_{mn} = c\\pi\\,\\left[(m/a)^2 + (n/b)^2\\right]^{1/2}$.', task: 'Switch to the rectangular drum and choose m = 2, n = 3.', set: { choices: { shape: 'rect' }, params: { m: 1, n: 1, aspect: 1, mix: 0 } }, done: (c) => c.choices.shape === 'rect' && c.params.m === 2 && c.params.n === 3 },
    { text: '**Superposition.** The equation is linear, so any sum of modes is a solution. With different frequencies the shape changes over time; each mode keeps its own clock.', task: 'Mix in a second mode (amount > 0.5).', set: { params: { m: 1, n: 1, m2: 3, n2: 1 } }, done: (c) => c.params.mix > 0.5 },
    { text: '**Degenerate modes.** On a square, $(1, 2)$ and $(2, 1)$ have the *same* frequency. Their sum is again a standing wave — with diagonal nodal lines that neither mode has alone. This is how Chladni figures arise.', task: 'Square, (1, 2) plus (2, 1) at full amount.', set: { params: { aspect: 1, m: 1, n: 2, m2: 2, n2: 1, mix: 1 } }, done: (c) => c.choices.shape === 'rect' && Math.abs(c.params.aspect - 1) < 1e-9 && c.params.mix > 0.95 },
    { text: '**Physics.** Real drums add bending stiffness and the air above and below the head; quantum mechanics uses the very same eigenproblem $-\\nabla^2\\phi = k^2\\phi$ for a particle in a 2D box or a circular corral (the analogy is mathematical: there $k^2$ is an energy, not a frequency squared).' },
  ],
  create: (ctx) => membraneDemo(ctx),
};

interface Mode { phi: Float64Array; omega: number; j?: number }

function membraneDemo(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  let surf: SurfaceHandle | null = null, nodal: Handle | null = null;
  let res = 0, shape = '', a = 2, b = 2;
  let m1: Mode = { phi: new Float64Array(0), omega: 1 }, m2: Mode = { phi: new Float64Array(0), omega: 1 };
  let c1 = 1, c2 = 0, wRef = 1, phase = 0, key = '';
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthTest: false });

  const sample = (uu: number, vv: number, isU: boolean) => {
    const lo = isU ? (shape === 'rect' ? -a / 2 : 0) : (shape === 'rect' ? -b / 2 : 0);
    const hi = isU ? (shape === 'rect' ? a / 2 : 1) : (shape === 'rect' ? b / 2 : 2 * Math.PI);
    return Math.round(((isU ? uu : vv) - lo) / (hi - lo) * res);
  };
  const fn = (uu: number, vv: number): [number, number, number] => {
    const i = sample(uu, vv, true), j = sample(uu, vv, false), k = j * (res + 1) + i;
    const z = 0.55 * (c1 * m1.phi[k] + c2 * m2.phi[k]);
    return shape === 'rect' ? [uu, vv, z] : [uu * Math.cos(vv), uu * Math.sin(vv), z];
  };

  const buildMode = (m: number, n: number): Mode => {
    const N = res + 1, phi = new Float64Array(N * N);
    if (shape === 'rect') {
      const mm = Math.max(1, m);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) phi[j * N + i] = Math.sin((mm * Math.PI * i) / res) * Math.sin((n * Math.PI * j) / res);
      return { phi, omega: Math.PI * Math.hypot(mm / a, n / b) };
    }
    const jm = zeros(m)[n - 1];
    const radial = new Float64Array(N);
    let mx = 1e-12;
    for (let i = 0; i < N; i++) { radial[i] = besselJ(m, (jm * i) / res); mx = Math.max(mx, Math.abs(radial[i])); }
    for (let j = 0; j < N; j++) { const cs = Math.cos((m * 2 * Math.PI * j) / res); for (let i = 0; i < N; i++) phi[j * N + i] = (radial[i] / mx) * cs; }
    return { phi, omega: jm, j: jm };
  };

  const nodalSegments = (): number[] => {
    const p = ctx.params, out: number[] = [];
    const seg = (x1: number, y1: number, x2: number, y2: number) => out.push(x1, y1, 0, x2, y2, 0);
    const degenerate = p.mix > 0 && Math.abs(m1.omega - m2.omega) < 1e-9;
    if (p.mix > 0 && !degenerate) return out;
    if (shape === 'rect' && p.mix > 0) {
      // nodal set of the (static) degenerate sum by marching squares
      const N = res + 1, F = (i: number, j: number) => m1.phi[j * N + i] + p.mix * m2.phi[j * N + i];
      const X = (i: number) => -a / 2 + (a * i) / res, Y = (j: number) => -b / 2 + (b * j) / res;
      for (let j = 1; j < res - 1; j++) for (let i = 1; i < res - 1; i++) {
        const q = [F(i, j), F(i + 1, j), F(i + 1, j + 1), F(i, j + 1)], pts: number[][] = [];
        const e = (s: number, t: number, x1: number, y1: number, x2: number, y2: number) => { if ((q[s] < 0) !== (q[t] < 0)) { const f = q[s] / (q[s] - q[t]); pts.push([x1 + (x2 - x1) * f, y1 + (y2 - y1) * f]); } };
        e(0, 1, X(i), Y(j), X(i + 1), Y(j)); e(1, 2, X(i + 1), Y(j), X(i + 1), Y(j + 1)); e(2, 3, X(i + 1), Y(j + 1), X(i), Y(j + 1)); e(3, 0, X(i), Y(j + 1), X(i), Y(j));
        if (pts.length >= 2) seg(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
      }
      return out;
    }
    const m = Math.round(p.m), n = Math.round(p.n);
    if (shape === 'rect') {
      const mm = Math.max(1, m);
      for (let k = 1; k < mm; k++) { const x = -a / 2 + (a * k) / mm; seg(x, -b / 2, x, b / 2); }
      for (let k = 1; k < n; k++) { const y = -b / 2 + (b * k) / n; seg(-a / 2, y, a / 2, y); }
    } else {
      const z = zeros(m);
      for (let k = 1; k < n; k++) { const r = z[k - 1] / z[n - 1]; for (let s = 0; s < 96; s++) { const t0 = (2 * Math.PI * s) / 96, t1 = (2 * Math.PI * (s + 1)) / 96; seg(r * Math.cos(t0), r * Math.sin(t0), r * Math.cos(t1), r * Math.sin(t1)); } }
      for (let l = 0; l < m; l++) { const th = ((2 * l + 1) * Math.PI) / (2 * m); seg(-Math.cos(th), -Math.sin(th), Math.cos(th), Math.sin(th)); }
    }
    return out;
  };

  const refresh = () => {
    surf!.update(fn, { colorRange: [-0.65, 0.65] });
  };

  const update = () => {
    const p = ctx.params;
    const newShape = ctx.choices.shape, newRes = Math.round(p.res);
    const asp = p.aspect;
    a = newShape === 'rect' ? (asp >= 1 ? 2 / asp : 2) : 2; b = newShape === 'rect' ? (asp >= 1 ? 2 : 2 * asp) : 2;
    const k = [newShape, newRes, p.m, p.n, p.m2, p.n2, asp].join('|');
    if (k !== key) {
      key = k;
      const rebuildSurface = newShape !== shape || newRes !== res || !surf;
      shape = newShape; res = newRes;
      m1 = buildMode(Math.round(p.m), Math.round(p.n));
      m2 = buildMode(Math.round(p.m2), Math.round(p.n2));
      wRef = shape === 'rect' ? Math.PI * Math.hypot(1 / a, 1 / b) : zeros(0)[0];
      if (rebuildSurface) {
        surf?.dispose();
        const ext = shape === 'rect' ? Math.max(a, b) / 2 : 1;
        v.setBounds({ x: [-ext * 1.15, ext * 1.15], y: [-ext * 1.15, ext * 1.15], z: [-0.8, 0.8] });
        v.resetCamera();
        const opts = shape === 'rect'
          ? { uRange: [-a / 2, a / 2] as [number, number], vRange: [-b / 2, b / 2] as [number, number], res, colormap: 'coolwarm' as const, colorRange: [-0.65, 0.65] as [number, number] }
          : { uRange: [0, 1] as [number, number], vRange: [0, 2 * Math.PI] as [number, number], res, colormap: 'coolwarm' as const, colorRange: [-0.65, 0.65] as [number, number] };
        surf = v.addSurface(fn, opts);
      } else surf!.update(fn, shape === 'rect' ? { uRange: [-a / 2, a / 2], vRange: [-b / 2, b / 2] } : {});
    }
    c2 = p.mix * Math.cos(m2.omega / wRef * phase);
    c1 = Math.cos(m1.omega / wRef * phase);
    refresh();
    // nodal lines: one LineSegments object, rebuilt only when the modes change
    nodal?.dispose(); nodal = null;
    if (ctx.toggles.nodal) {
      const segs = nodalSegments();
      if (segs.length) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
        lineMat.color.set(ctx.dark ? '#ffffff' : '#1b1f2a');
        const ls = new THREE.LineSegments(g, lineMat.clone());
        ls.renderOrder = 10;
        nodal = v.addObject(ls);
      }
    }
    const mm = Math.round(p.m), nn = Math.round(p.n), deg = p.mix > 0 && Math.abs(m1.omega - m2.omega) < 1e-9;
    const rows: Readout[] = [];
    if (shape === 'circle') {
      const z = zeros(mm);
      rows.push(
        { label: `j_${mm},${nn}  (zero of J_${mm})`, value: fmt(z[nn - 1], 10) },
        { label: 'ω / ω₀₁  (pitch ratio)', value: fmt(m1.omega / wRef, 6) },
        { label: `zeros of J_${mm}`, value: z.slice(0, 5).map((q) => q.toFixed(4)).join(', ') },
        { label: 'nodal circles at r/R', value: nn > 1 ? z.slice(0, nn - 1).map((q) => (q / z[nn - 1]).toFixed(4)).join(', ') : 'none' },
      );
    } else {
      rows.push(
        { label: `ω_${Math.max(1, mm)},${nn} / (cπ)`, value: fmt(m1.omega / Math.PI, 8) },
        { label: 'ω / ω₁₁  (pitch ratio)', value: fmt(m1.omega / wRef, 6) },
        { label: 'side lengths a × b', value: `${fmt(a, 4)} × ${fmt(b, 4)}` },
      );
    }
    if (p.mix > 0) rows.push({ label: 'second mode ω₂ / ω₁', value: fmt(m2.omega / m1.omega, 6) + (deg ? '  (degenerate!)' : ''), tone: deg ? 'good' : undefined });
    ctx.setReadouts(rows);
    const modeTex = shape === 'rect'
      ? `\\sin\\tfrac{${Math.max(1, mm)}\\pi x}{a}\\,\\sin\\tfrac{${nn}\\pi y}{b}\\,\\cos\\omega t`
      : `J_{${mm}}\\!\\left(${fmt(zeros(mm)[nn - 1], 5)}\\,\\tfrac rR\\right)${mm ? `\\cos ${mm === 1 ? '' : mm}\\theta` : ''}\\,\\cos\\omega t`;
    ctx.setNote(`Mode: $u = ${modeTex}$.${shape === 'rect' && mm === 0 ? ' (m = 0 would be identically zero on a fixed rectangle; m = 1 is shown.)' : ''}${p.mix > 0 ? (deg ? ' The two modes share one frequency, so their sum is again a standing wave with its own nodal pattern.' : ' The two modes have different frequencies: the sum is not a standing wave, and its zero set moves (nodal lines are shown only for single modes and degenerate pairs).') : ' White lines are the nodal lines, where the drumhead never moves.'}`);
  };

  return {
    update,
    tick(dt) {
      phase += dt * 2 * Math.PI * 0.5;
      c1 = Math.cos((m1.omega / wRef) * phase);
      c2 = ctx.params.mix * Math.cos((m2.omega / wRef) * phase);
      refresh();
    },
    reset() { phase = 0; c1 = 1; c2 = ctx.params.mix; refresh(); },
    csv() {
      const N = res + 1, rows = ['i,j,phi1,phi2'];
      for (let j = 0; j < N; j += 2) for (let i = 0; i < N; i += 2) rows.push(`${i},${j},${m1.phi[j * N + i]},${m2.phi[j * N + i]}`);
      return rows.join('\n');
    },
    dispose() { v.clear(); lineMat.dispose(); },
  };
}
