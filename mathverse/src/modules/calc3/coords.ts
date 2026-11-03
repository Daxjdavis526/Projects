// Calculus III — coordinates in space (Cartesian, cylindrical, spherical) with
// their coordinate surfaces and volume elements, and triple integrals of a
// density over solids computed in all three systems.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, Readout } from '../types';
import { Node, compile, toTeX } from '../../core/expr';
import { integrate3e, NestedResult } from '../../core/numeric/vcalc';
import { colormap } from '../../engine/colors';
import type { V3 } from '../../engine/viewport3d';
import { fmt, fmtQ, deg, clamp, paramSpecs, paramVals, readFormula, addSegments, addTris, addBoxes, memo, cross, fitBounds } from './common';

type View3 = NonNullable<DemoCtx['view3d']>;
type Surf = ReturnType<View3['addSurface']>;
type Label = ReturnType<View3['addLabel']>;
type Point = ReturnType<View3['addPoint']>;

const { PI, sin, cos, sqrt, atan2, acos, hypot } = Math;
const sph = (rho: number, th: number, ph: number): V3 => [rho * sin(ph) * cos(th), rho * sin(ph) * sin(th), rho * cos(ph)];
const cyl = (r: number, th: number, z: number): V3 => [r * cos(th), r * sin(th), z];

// ── coordinate systems ─────────────────────────────────────────────────────
export const coords: DemoDef = {
  id: 'calc3.coords', module: 'calc3', title: 'Coordinates in space: Cartesian, cylindrical, spherical',
  topic: '3D coordinate systems · cylindrical and spherical coordinates · volume elements',
  summary: 'One point, three addresses. Each coordinate system fills space with three families of coordinate surfaces; the point sits where one surface of each family meets. A small coordinate box is a curved wedge whose volume is approximately the volume element dV = h₁h₂h₃ dq₁dq₂dq₃.',
  tex: '(x,y,z) = (r\\cos\\theta,\\ r\\sin\\theta,\\ z) = (\\rho\\sin\\varphi\\cos\\theta,\\ \\rho\\sin\\varphi\\sin\\theta,\\ \\rho\\cos\\varphi),\\quad dV = dx\\,dy\\,dz = r\\,dr\\,d\\theta\\,dz = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi',
  view: '3d',
  params: [
    { key: 'px', label: 'x (drag the point)', value: 1.4, min: -3, max: 3, step: 0.01 },
    { key: 'py', label: 'y', value: 1.1, min: -3, max: 3, step: 0.01 },
    { key: 'pz', label: 'z', value: 1.2, min: -3, max: 3, step: 0.01 },
    { key: 'd', label: 'size Δ of the coordinate box (Δ in each coordinate; radians for angles)', value: 0.35, min: 0.01, max: 0.8, step: 0.005 },
  ],
  choices: [{ key: 'sys', label: 'Coordinate system', value: 'cyl', options: [['cart', 'Cartesian (x, y, z)'], ['cyl', 'Cylindrical (r, θ, z)'], ['sph', 'Spherical (ρ, θ, φ)']] }],
  toggles: [{ key: 'surfs', label: 'Coordinate surfaces through the point', value: true }, { key: 'cell', label: 'Coordinate box (volume element)', value: true }],
  experiments: [
    'Switch between the three systems: the point stays put, only its address and the coordinate surfaces change.',
    'Cylindrical: drag the point away from the z-axis — the box gets wider in the θ direction because an angle step Δθ sweeps an arc rΔθ.',
    'Spherical: move the point toward the z-axis (φ → 0): the box collapses, because its θ-edge is ρ sin φ Δθ.',
    'Shrink Δ: the ratio (exact box volume) / (h₁h₂h₃ Δ³) tends to 1 — that is what the volume element means.',
  ],
  connections: ['calc3.triple', 'calc3.jacobian'],
  accuracy: 'Coordinates and box volumes are exact formulas: cylindrical ½((r+Δ)² − r²)ΔΔ, spherical ⅓((ρ+Δ)³ − ρ³)·Δ·(cos φ − cos(φ+Δ)).',
  create(ctx) {
    const v = ctx.view3d!;
    v.setBounds({ x: [-3, 3], y: [-3, 3], z: [-3, 3] });
    v.resetCamera();
    const S: Surf[] = [];
    const surfCols = ['#ef6b73', '#6fcf97', '#6aa9ff'];
    const cell = addTris(v, '#f2c14e', 0.75), cellEdges = addSegments(v, '#fff1c2'), guides = addSegments(v, '#8b93a7');
    const labs: Label[] = [];
    let pt: Point | null = null;
    const update = () => {
      const x = ctx.params.px, y = ctx.params.py, z = ctx.params.pz, D = ctx.params.d, sys = ctx.choices.sys;
      const r = hypot(x, y), rho = hypot(x, y, z);
      let th = atan2(y, x); if (th < 0) th += 2 * PI;
      const ph = rho > 0 ? acos(clamp(z / rho, -1, 1)) : 0;
      if (!pt) pt = v.addPoint([x, y, z], { color: '#ffffff', size: 0.09, drag: { onDrag: ([X, Y, Z]) => { ctx.setParam('px', clamp(X, -3, 3)); ctx.setParam('py', clamp(Y, -3, 3)); ctx.setParam('pz', clamp(Z, -3, 3)); update(); } } });
      pt.set([x, y, z]);
      // three coordinate surfaces through the point
      type F = (u: number, w: number) => V3 | null;
      let fams: { f: F; u: [number, number]; w: [number, number] }[];
      if (sys === 'cart') fams = [
        { f: (u, w) => [x, u, w], u: [-3, 3], w: [-3, 3] }, { f: (u, w) => [u, y, w], u: [-3, 3], w: [-3, 3] }, { f: (u, w) => [u, w, z], u: [-3, 3], w: [-3, 3] }];
      else if (sys === 'cyl') fams = [
        { f: (u, w) => cyl(r, u, w), u: [0, 2 * PI], w: [-3, 3] }, { f: (u, w) => cyl(u, th, w), u: [0, 3], w: [-3, 3] }, { f: (u, w) => cyl(u, w, z), u: [0, 3], w: [0, 2 * PI] }];
      else fams = [
        { f: (u, w) => sph(rho, u, w), u: [0, 2 * PI], w: [0, PI] }, { f: (u, w) => sph(u, th, w), u: [0, 3], w: [0, PI] }, { f: (u, w) => sph(u, w, ph), u: [0, 3.2], w: [0, 2 * PI] }];
      fams.forEach((fm, i) => {
        const o = { uRange: fm.u, vRange: fm.w, res: 48, colorBy: 'uniform' as const, color: surfCols[i], opacity: 0.2 };
        if (!S[i]) S[i] = v.addSurface(fm.f, o); else S[i].update(fm.f, o);
        S[i].visible(!!ctx.toggles.surfs);
      });
      // the coordinate box [q, q + Δ]³ (angles in radians), as six faces
      const map = (a: number, b: number, c: number): V3 => (sys === 'cart' ? [a, b, c] : sys === 'cyl' ? cyl(a, b, c) : sph(a, b, c));
      const q0 = sys === 'cart' ? [x, y, z] : sys === 'cyl' ? [r, th, z] : [rho, th, ph];
      const tris: number[] = [], edges: number[] = [];
      const m = 6;
      for (let ax = 0; ax < 3; ax++) for (const side of [0, 1]) {
        const i1 = (ax + 1) % 3, i2 = (ax + 2) % 3;
        const P = (s: number, t: number) => { const q = [q0[0], q0[1], q0[2]]; q[ax] += side * D; q[i1] += s * D; q[i2] += t * D; return map(q[0], q[1], q[2]); };
        for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
          const a = P(i / m, j / m), b = P((i + 1) / m, j / m), c = P((i + 1) / m, (j + 1) / m), d = P(i / m, (j + 1) / m);
          tris.push(...a, ...b, ...c, ...a, ...c, ...d);
          if (j === 0) edges.push(...a, ...b);
          if (j === m - 1) edges.push(...d, ...c);
        }
      }
      cell.set(tris); cellEdges.set(edges);
      cell.handle.visible(!!ctx.toggles.cell); cellEdges.handle.visible(!!ctx.toggles.cell);
      // construction lines: ρ, r, z and the angle arcs
      const g: number[] = [];
      const seg = (a: V3, b: V3) => g.push(...a, ...b);
      const arc = (f: (t: number) => V3, t0: number, t1: number) => { for (let i = 0; i < 24; i++) seg(f(t0 + ((t1 - t0) * i) / 24), f(t0 + ((t1 - t0) * (i + 1)) / 24)); };
      if (sys !== 'cart') {
        seg([0, 0, 0], [x, y, 0]); seg([x, y, 0], [x, y, z]);
        arc((t) => [0.45 * cos(t), 0.45 * sin(t), 0], 0, th);
        if (sys === 'sph') { seg([0, 0, 0], [x, y, z]); arc((t) => sph(0.7, th, t), 0, ph); }
      } else { seg([x, 0, 0], [x, y, 0]); seg([0, y, 0], [x, y, 0]); seg([x, y, 0], [x, y, z]); }
      guides.set(g);
      const lab = (i: number, p: V3, text: string) => { if (!labs[i]) labs[i] = v.addLabel(p, text); else labs[i].set(p, text); labs[i].visible(true); };
      labs.forEach((l) => l.visible(false));
      if (sys === 'cyl') { lab(0, [x / 2, y / 2, -0.15], 'r'); lab(1, [0.6 * cos(th / 2), 0.6 * sin(th / 2), 0], 'θ'); lab(2, [x, y, z / 2], 'z'); }
      if (sys === 'sph') { lab(0, [x / 2, y / 2, z / 2 + 0.15], 'ρ'); lab(1, [0.6 * cos(th / 2), 0.6 * sin(th / 2), 0], 'θ'); lab(2, sph(0.85, th, ph / 2), 'φ'); }
      // volumes
      let exact: number, el: number, hs: string;
      if (sys === 'cart') { exact = D ** 3; el = D ** 3; hs = 'h = (1, 1, 1)'; }
      else if (sys === 'cyl') { exact = (((r + D) ** 2 - r * r) / 2) * D * D; el = r * D ** 3; hs = `h = (1, r, 1) = (1, ${fmt(r, 3)}, 1)`; }
      else { exact = (((rho + D) ** 3 - rho ** 3) / 3) * D * (cos(ph) - cos(ph + D)); el = rho * rho * sin(ph) * D ** 3; hs = `h = (1, ρ sin φ, ρ) = (1, ${fmt(rho * sin(ph), 3)}, ${fmt(rho, 3)})`; }
      ctx.setReadouts([
        { label: 'Cartesian (x, y, z)', value: `(${fmt(x, 4)}, ${fmt(y, 4)}, ${fmt(z, 4)})`, tone: sys === 'cart' ? 'good' : undefined },
        { label: 'cylindrical (r, θ, z)', value: `(${fmt(r, 4)}, ${fmt(deg(th), 4)}°, ${fmt(z, 4)})`, tone: sys === 'cyl' ? 'good' : undefined },
        { label: 'spherical (ρ, θ, φ)', value: `(${fmt(rho, 4)}, ${fmt(deg(th), 4)}°, ${fmt(deg(ph), 4)}°)`, tone: sys === 'sph' ? 'good' : undefined },
        { label: 'scale factors', value: hs },
        { label: 'exact volume of the box', value: fmt(exact, 6) },
        { label: 'volume element h₁h₂h₃ Δ³', value: fmt(el, 6) },
        { label: 'ratio  (→ 1 as Δ → 0)', value: el > 0 ? fmt(exact / el, 6) : '— (on the axis)' },
      ]);
      const notes: Record<string, string> = {
        cart: 'Cartesian coordinate surfaces are three perpendicular planes $x = x_0$ (red), $y = y_0$ (green), $z = z_0$ (blue). The box is a true cube: $dV = dx\\,dy\\,dz$.',
        cyl: 'Cylindrical: the cylinder $r = r_0$ (red), the half-plane $\\theta = \\theta_0$ (green) and the plane $z = z_0$ (blue). Stepping $\\Delta\\theta$ moves you an arc $r\\,\\Delta\\theta$, so $dV = r\\,dr\\,d\\theta\\,dz$.',
        sph: 'Spherical: the sphere $\\rho = \\rho_0$ (red), the half-plane $\\theta = \\theta_0$ (green) and the cone $\\varphi = \\varphi_0$ (blue). The box has edges $\\Delta\\rho$, $\\rho\\,\\Delta\\varphi$ and $\\rho\\sin\\varphi\\,\\Delta\\theta$, so $dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi$. (Physicists often swap the names θ and φ.)',
      };
      ctx.setNote(notes[sys]);
      ctx.warn(sys !== 'cart' && r < 1e-6 ? 'The point is on the z-axis, where θ is undefined: cylindrical and spherical coordinates are singular there.' : '');
    };
    return { update, dispose() { v.clear(); } };
  },
};

// ── triple integrals in three systems ─────────────────────────────────────
type Sys = 'cart' | 'cyl' | 'sph';
interface Solid {
  inside: (x: number, y: number, z: number) => boolean;
  /** bounds per system: [q1 range, q2(q1) range, q3(q1, q2) range] (with Jacobian applied in the integrand) */
  bounds: Record<Sys, { a: [number, number]; b: (p: number) => [number, number]; c: (p: number, q: number) => [number, number]; tex: string }[]>;
  box: Record<Sys, [[number, number], [number, number], [number, number]]>;
  surfaces: { f: (u: number, w: number) => V3 | null; u: [number, number]; w: [number, number] }[];
  volume: number; name: string;
}

function solidOf(kind: string, P: Record<string, number>): Solid {
  const R = P.R, Ri = Math.min(P.Rin, R * 0.95), H = P.H, al = (clamp(P.alpha, 5, 90) * PI) / 180;
  const T: [number, number] = [0, 2 * PI];
  const f3 = (v: number) => fmt(v, 3);
  const ballC = (Rr: number) => ({ a: [-Rr, Rr] as [number, number], b: (x: number): [number, number] => [-sqrt(Math.max(0, Rr * Rr - x * x)), sqrt(Math.max(0, Rr * Rr - x * x))], c: (x: number, y: number): [number, number] => [-sqrt(Math.max(0, Rr * Rr - x * x - y * y)), sqrt(Math.max(0, Rr * Rr - x * x - y * y))], tex: `\\int_{-${f3(Rr)}}^{${f3(Rr)}}\\int_{-\\sqrt{${f3(Rr * Rr)}-x^2}}^{\\sqrt{${f3(Rr * Rr)}-x^2}}\\int_{-\\sqrt{${f3(Rr * Rr)}-x^2-y^2}}^{\\sqrt{${f3(Rr * Rr)}-x^2-y^2}} \\delta\\,dz\\,dy\\,dx` });
  const ballY = (Rr: number) => ({ a: T, b: (): [number, number] => [0, Rr], c: (_t: number, r: number): [number, number] => [-sqrt(Math.max(0, Rr * Rr - r * r)), sqrt(Math.max(0, Rr * Rr - r * r))], tex: `\\int_0^{2\\pi}\\int_0^{${f3(Rr)}}\\int_{-\\sqrt{${f3(Rr * Rr)}-r^2}}^{\\sqrt{${f3(Rr * Rr)}-r^2}} \\delta\\,r\\,dz\\,dr\\,d\\theta` });
  const sphere = (Rr: number, ph1 = PI) => ({ f: (u: number, w: number) => sph(Rr, u, w), u: T, w: [0, ph1] as [number, number] });
  switch (kind) {
    case 'cone': {
      const s = sin(al), k = cos(al) / Math.max(s, 1e-9);
      return {
        name: `ice-cream cone ρ ≤ ${f3(R)}, φ ≤ ${f3(P.alpha)}°`, volume: (2 / 3) * PI * R ** 3 * (1 - cos(al)),
        inside: (x, y, z) => hypot(x, y, z) <= R && z >= hypot(x, y) * k,
        bounds: {
          cart: [{ a: [-R * s, R * s], b: (x) => [-sqrt(Math.max(0, R * R * s * s - x * x)), sqrt(Math.max(0, R * R * s * s - x * x))], c: (x, y) => [hypot(x, y) * k, sqrt(Math.max(0, R * R - x * x - y * y))], tex: `\\int\\!\\!\\int_{x^2+y^2\\le ${f3((R * s) ** 2)}}\\int_{${f3(k)}\\sqrt{x^2+y^2}}^{\\sqrt{${f3(R * R)}-x^2-y^2}} \\delta\\,dz\\,dA` }],
          cyl: [{ a: T, b: () => [0, R * s], c: (_t, r) => [r * k, sqrt(Math.max(0, R * R - r * r))], tex: `\\int_0^{2\\pi}\\int_0^{${f3(R * s)}}\\int_{${f3(k)}r}^{\\sqrt{${f3(R * R)}-r^2}} \\delta\\,r\\,dz\\,dr\\,d\\theta` }],
          sph: [{ a: T, b: () => [0, al], c: () => [0, R], tex: `\\int_0^{2\\pi}\\int_0^{${f3(al)}}\\int_0^{${f3(R)}} \\delta\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta` }],
        },
        box: { cart: [[-R * s, R * s], [-R * s, R * s], [0, R]], cyl: [[0, R * s], T, [0, R]], sph: [[0, R], T, [0, al]] },
        surfaces: [sphere(R, al), { f: (u, w) => sph(w, u, al), u: T, w: [0, R] }],
      };
    }
    case 'cyl':
      return {
        name: `cylinder r ≤ ${f3(R)}, 0 ≤ z ≤ ${f3(H)}`, volume: PI * R * R * H,
        inside: (x, y, z) => hypot(x, y) <= R && z >= 0 && z <= H,
        bounds: {
          cart: [{ a: [-R, R], b: (x) => [-sqrt(Math.max(0, R * R - x * x)), sqrt(Math.max(0, R * R - x * x))], c: () => [0, H], tex: `\\int_{-${f3(R)}}^{${f3(R)}}\\int_{-\\sqrt{${f3(R * R)}-x^2}}^{\\sqrt{${f3(R * R)}-x^2}}\\int_0^{${f3(H)}} \\delta\\,dz\\,dy\\,dx` }],
          cyl: [{ a: T, b: () => [0, R], c: () => [0, H], tex: `\\int_0^{2\\pi}\\int_0^{${f3(R)}}\\int_0^{${f3(H)}} \\delta\\,r\\,dz\\,dr\\,d\\theta` }],
          sph: [{ a: T, b: () => [0, PI / 2], c: (_t, p) => [0, Math.min(H / Math.max(cos(p), 1e-12), R / Math.max(sin(p), 1e-12))], tex: `\\int_0^{2\\pi}\\int_0^{\\pi/2}\\int_0^{\\min(${f3(H)}\\sec\\varphi,\\ ${f3(R)}\\csc\\varphi)} \\delta\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta` }],
        },
        box: { cart: [[-R, R], [-R, R], [0, H]], cyl: [[0, R], T, [0, H]], sph: [[0, hypot(R, H)], T, [0, PI / 2]] },
        surfaces: [{ f: (u, w) => cyl(R, u, w), u: T, w: [0, H] }, { f: (u, w) => cyl(w, u, H), u: T, w: [0, R] }, { f: (u, w) => cyl(w, u, 0), u: T, w: [0, R] }],
      };
    case 'shell':
      return {
        name: `spherical shell ${f3(Ri)} ≤ ρ ≤ ${f3(R)}`, volume: (4 / 3) * PI * (R ** 3 - Ri ** 3),
        inside: (x, y, z) => { const p = hypot(x, y, z); return p <= R && p >= Ri; },
        bounds: {
          cart: [ballC(R), { ...ballC(Ri), tex: `- ${ballC(Ri).tex}` }],
          cyl: [ballY(R), { ...ballY(Ri), tex: `- ${ballY(Ri).tex}` }],
          sph: [{ a: T, b: () => [0, PI], c: () => [Ri, R], tex: `\\int_0^{2\\pi}\\int_0^{\\pi}\\int_{${f3(Ri)}}^{${f3(R)}} \\delta\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta` }],
        },
        box: { cart: [[-R, R], [-R, R], [-R, R]], cyl: [[0, R], T, [-R, R]], sph: [[0, R], T, [0, PI]] },
        surfaces: [sphere(R), sphere(Ri)],
      };
    default:
      return {
        name: `ball ρ ≤ ${f3(R)}`, volume: (4 / 3) * PI * R ** 3,
        inside: (x, y, z) => hypot(x, y, z) <= R,
        bounds: { cart: [ballC(R)], cyl: [ballY(R)], sph: [{ a: T, b: () => [0, PI], c: () => [0, R], tex: `\\int_0^{2\\pi}\\int_0^{\\pi}\\int_0^{${f3(R)}} \\delta\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta` }] },
        box: { cart: [[-R, R], [-R, R], [-R, R]], cyl: [[0, R], T, [-R, R]], sph: [[0, R], T, [0, PI]] },
        surfaces: [sphere(R)],
      };
  }
}

export const triple: DemoDef = {
  id: 'calc3.triple', module: 'calc3', title: 'Triple integrals in three coordinate systems',
  topic: 'Triple integrals · cylindrical and spherical coordinates · mass of a solid',
  summary: 'The mass of a solid with density δ(x, y, z) is a triple integral. The same solid can be described in Cartesian, cylindrical or spherical coordinates — the limits and the volume element change, the answer does not. The boxes show the cells of a Riemann sum in the chosen system.',
  tex: 'M = \\iiint_E \\delta\\,dV = \\iiint \\delta\\,dx\\,dy\\,dz = \\iiint \\delta\\,r\\,dz\\,dr\\,d\\theta = \\iiint \\delta\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta',
  view: '3d',
  params: [
    { key: 'R', label: 'radius R', value: 1.6, min: 0.3, max: 2.5, step: 0.01 },
    { key: 'H', label: 'height H (cylinder)', value: 1.8, min: 0.2, max: 3, step: 0.01 },
    { key: 'Rin', label: 'inner radius (shell)', value: 0.9, min: 0.05, max: 2.3, step: 0.01 },
    { key: 'alpha', label: 'cone half-angle α in degrees (ice-cream cone)', value: 40, min: 5, max: 90, step: 0.5 },
    { key: 'n', label: 'cells per coordinate n', value: 8, min: 2, max: 14, step: 1 },
    ...paramSpecs(1, 1),
  ],
  choices: [
    { key: 'solid', label: 'Solid', value: 'cone', options: [['ball', 'Ball'], ['cone', 'Ice-cream cone (sphere cap over a cone)'], ['cyl', 'Cylinder'], ['shell', 'Spherical shell']] },
    { key: 'sys', label: 'Integrate (and draw cells) in', value: 'sph', options: [['cart', 'Cartesian'], ['cyl', 'Cylindrical'], ['sph', 'Spherical']] },
  ],
  toggles: [{ key: 'cells', label: 'Riemann cells', value: true }, { key: 'cut', label: 'Cut away a quarter (see inside)', value: true }, { key: 'surf', label: 'Boundary surfaces', value: true }],
  input: { label: 'density δ(x, y, z)', value: '1 + a*z', placeholder: 'e.g. x^2 + y^2 + z^2' },
  experiments: [
    'Switch the system with the ball selected: Cartesian cells are cubes, spherical cells are wedges that shrink toward the centre and the poles.',
    'The three values in the readouts agree to many digits: different limits, different Jacobians, one mass.',
    'Try the cylinder in spherical coordinates: the limit for ρ is a min(…) of two expressions — some systems fit some solids badly.',
    'Set δ = x^2 + y^2 with the cylinder: that is the moment of inertia about the z-axis, I = πR⁴H/2 for δ = 1 … check it.',
    'Increase n: the Riemann sum approaches the integral, but slowly — cells cut by a curved boundary are kept or dropped whole.',
  ],
  connections: ['calc3.coords', 'calc3.double', 'calc3.jacobian', 'calc3.divthm'],
  accuracy: 'All three values are nested adaptive Gauss–Kronrod quadrature (three levels) with propagated error estimates. The exact volume formula of each solid is shown for comparison. The Riemann sum uses the cell midpoints and keeps a cell when its midpoint is inside the solid.',
  create(ctx) {
    const v = ctx.view3d!;
    let src = '', node: Node | null = null, err = '';
    const st = { fitted: false };
    const S: Surf[] = [];
    const boxes = addBoxes(v, 3000);
    const vals = memo<Record<Sys, NestedResult>>();
    const update = () => {
      if (ctx.input !== src) { src = ctx.input; const r = readFormula(src, ['x', 'y', 'z'], 1, 'a density δ(x, y, z)'); if (r.items) { node = r.items[0]; err = ''; } else err = r.error; }
      ctx.warn(err);
      if (!node) return;
      const pv = paramVals(ctx.params), dc = compile(node, ['x', 'y', 'z'], pv);
      const den = (x: number, y: number, z: number) => dc([x, y, z]);
      const sol = solidOf(ctx.choices.solid, ctx.params);
      const sys = ctx.choices.sys as Sys;
      const m = Math.max(ctx.params.R, ctx.choices.solid === 'cyl' ? ctx.params.H : 0) * 1.15;
      fitBounds(v, { x: [-m, m], y: [-m, m], z: [ctx.choices.solid === 'ball' || ctx.choices.solid === 'shell' ? -m : -0.3, m] }, st);
      sol.surfaces.forEach((s, i) => {
        const o = { uRange: s.u, vRange: s.w, res: 50, colorBy: 'uniform' as const, color: i === 0 ? '#6aa9ff' : '#b48cff', opacity: 0.16 };
        if (!S[i]) S[i] = v.addSurface(s.f, o); else S[i].update(s.f, o);
        S[i].visible(!!ctx.toggles.surf);
      });
      for (let i = sol.surfaces.length; i < S.length; i++) S[i].visible(false);
      // the integrand in each system (density × Jacobian)
      const integrands: Record<Sys, (a: number, b: number, c: number) => number> = {
        cart: (x, y, z) => den(x, y, z),
        cyl: (t, r, z) => { const [x, y] = [r * cos(t), r * sin(t)]; return den(x, y, z) * r; },
        sph: (t, p, rho) => { const [x, y, z] = sph(rho, t, p); return den(x, y, z) * rho * rho * sin(p); },
      };
      const key = `${src}|${pv.a}|${pv.b}|${ctx.choices.solid}|${ctx.params.R}|${ctx.params.H}|${ctx.params.Rin}|${ctx.params.alpha}`;
      const res = vals(key, () => {
        const out = {} as Record<Sys, NestedResult>;
        for (const s of ['cart', 'cyl', 'sph'] as Sys[]) {
          let value = 0, error = 0, ok = true, warning: string | undefined;
          sol.bounds[s].forEach((b, k) => {
            const r = integrate3e(integrands[s], b.a[0], b.a[1], (p) => b.b(p)[0], (p) => b.b(p)[1], (p, q) => b.c(p, q)[0], (p, q) => b.c(p, q)[1], 1e-7);
            value += k === 0 ? r.value : -r.value; error += r.error; ok = ok && r.ok; warning = warning ?? r.warning;
          });
          out[s] = { value, error, ok, warning, evals: 0 };
        }
        return out;
      });
      // Riemann cells in the chosen system
      const n = Math.round(ctx.params.n), [A, B, C] = sol.box[sys];
      const ha = (A[1] - A[0]) / n, hb = (B[1] - B[0]) / n, hc = (C[1] - C[0]) / n;
      let sum = 0, cnt = 0, dmin = Infinity, dmax = -Infinity;
      const cells: { c: V3; size: V3; basis?: [V3, V3, V3]; d: number }[] = [];
      for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const a = A[0] + (i + 0.5) * ha, b = B[0] + (j + 0.5) * hb, c = C[0] + (k + 0.5) * hc;
        let P: V3, size: V3, basis: [V3, V3, V3] | undefined, J: number;
        if (sys === 'cart') { P = [a, b, c]; size = [ha, hb, hc]; J = 1; }
        else if (sys === 'cyl') { P = cyl(a, b, c); const er: V3 = [cos(b), sin(b), 0], et: V3 = [-sin(b), cos(b), 0]; basis = [er, et, [0, 0, 1]]; size = [ha, a * hb, hc]; J = a; }
        else { P = sph(a, b, c); const er = sph(1, b, c), ep: V3 = [cos(c) * cos(b), cos(c) * sin(b), -sin(c)], et = cross(er, ep); basis = [er, ep, et]; size = [ha, a * hc, a * sin(c) * hb]; J = a * a * sin(c); }
        if (!sol.inside(P[0], P[1], P[2])) continue;
        const d = den(P[0], P[1], P[2]);
        if (!Number.isFinite(d)) continue;
        sum += d * J * ha * hb * hc; cnt++;
        if (ctx.toggles.cut && P[0] > 0 && P[1] < 0) continue;
        dmin = Math.min(dmin, d); dmax = Math.max(dmax, d);
        cells.push({ c: P, size: [size[0] * 0.9, size[1] * 0.9, size[2] * 0.9], basis, d });
      }
      boxes.begin();
      const col = new THREE.Color();
      for (const c of cells) { col.copy(colormap('viridis', dmax > dmin ? 0.15 + 0.85 * (c.d - dmin) / (dmax - dmin) : 0.6)); boxes.push(c.c, c.size, col, c.basis); }
      boxes.end(); boxes.handle.visible(!!ctx.toggles.cells);
      const names: Record<Sys, string> = { cart: 'Cartesian', cyl: 'cylindrical', sph: 'spherical' };
      const rows: Readout[] = [{ label: 'solid', value: sol.name }];
      for (const s of ['cart', 'cyl', 'sph'] as Sys[]) rows.push({ label: `∭ δ dV in ${names[s]}`, value: fmtQ(res[s], 10), tone: s === sys ? 'good' : undefined });
      rows.push({ label: `Riemann sum, ${cnt} ${names[sys]} cells`, value: fmt(sum, 8) });
      rows.push({ label: 'volume (exact formula)', value: fmt(sol.volume, 10) });
      rows.push({ label: 'mean density M / V', value: fmt(res[sys].value / sol.volume, 6) });
      rows.push({ label: 'δ', value: toTeX(node), tex: true });
      ctx.setReadouts(rows);
      ctx.setSteps((['cart', 'cyl', 'sph'] as Sys[]).map((s) => ({ title: names[s], tex: sol.bounds[s].map((b) => b.tex).join(' ') + ` \\approx ${fmt(res[s].value, 10)}`, rule: s === 'cart' ? 'dV = dx dy dz' : s === 'cyl' ? 'dV = r dz dr dθ' : 'dV = ρ² sin φ dρ dφ dθ' })));
      const bad = (['cart', 'cyl', 'sph'] as Sys[]).find((s) => res[s].warning);
      ctx.warn(err || (bad ? `Quadrature (${names[bad]}): ${res[bad].warning}` : ''));
      ctx.setNote(`The ${names[sys]} cells are coloured by density. ${sys === 'cart' ? 'They are cubes of volume $\\Delta x\\,\\Delta y\\,\\Delta z$.' : sys === 'cyl' ? 'Each is a wedge of volume $\\approx r\\,\\Delta r\\,\\Delta\\theta\\,\\Delta z$ — wider far from the axis.' : 'Each is a wedge of volume $\\approx \\rho^2\\sin\\varphi\\,\\Delta\\rho\\,\\Delta\\theta\\,\\Delta\\varphi$ — tiny near the centre and near the poles.'} The Steps tab shows the iterated integral in all three systems.`);
    };
    return { update, dispose() { v.clear(); } };
  },
};
