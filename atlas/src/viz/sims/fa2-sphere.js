// Real spherical harmonics on a sphere you can turn. view 'sphere': the unit
// sphere shaded by the value of Yₗₘ(θ, φ) — blue where it is positive, orange
// where negative, pale near zero — with its nodal lines in bold: l − |m|
// circles of latitude (zeros of Pₗ^|m|(cos θ)) and |m| great circles through
// the poles (zeros of cos mφ or sin |m|φ). view 'lobes': the polar plot
// r = |Y| coloured by sign, the usual “orbital” picture. A combination
// Σ c·Yₗₘ (terms) draws any angular pattern — a multipole field on a sphere.
// Real harmonics: Yₗ₀ = N Pₗ(cos θ); m > 0: √2 N Pₗᵐ cos mφ; m < 0:
// √2 N Pₗ^|m| sin|m|φ, orthonormal, no Condon–Shortley phase (model/fa2-special.js).
//
//   { type: 'fa2-sphere', params: {
//       l: 2, m: 0,               // the harmonic (0 ≤ l ≤ 6, |m| ≤ l)
//       terms: null,              // or [[l, m, c], …]: draw Σ c Yₗₘ instead (no l, m sliders)
//       view: 'sphere',           // sphere | lobes
//       toggle: null,             // offer the sphere/lobes choice (default: in the Explore step)
//       nodal: true,              // bold nodal lines
//       axes: true,               // the z-axis (θ = 0) through the poles
//       controls: null,           // true, false, or a list of: l m
//       readout: true, hide: [],  // hide: any of nodal deg (show “?”)
//       yaw: -0.6, pitch: 0.35,
//   } }

import { View3D } from '../three-d.js';
import * as S from '../model/fa2-special.js';
import { sampleGrid, contourSegments } from '../model/c3-contour.js';

export const defaults = { l: 2, m: 0, terms: null, view: 'sphere', toggle: null, nodal: true, axes: true, controls: null, readout: true, hide: [], yaw: -0.6, pitch: 0.35 };
const CONTROLS = ['l', 'm'];
const HIDE = ['nodal', 'deg'];
const PI = Math.PI;
const POS = [60, 140, 230], NEG = [235, 135, 55], ZERO = [205, 210, 220];

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const combo = Array.isArray(P.terms) && P.terms.length > 0;
  const wanted = combo ? [] : P.controls === true || (P.controls === null && !F.compact) ? ['l', 'm'] : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('l', () => F.slider({ key: 'l', label: 'Degree $l$', min: 0, max: 6, step: 1, value: P.l, unit: '', explain: 'The total number of nodal lines; $l(l + 1)$ is the eigenvalue of $-\\nabla^2$ on the unit sphere.' }));
  ctl('m', () => F.slider({ key: 'm', label: 'Order $m$', min: -6, max: 6, step: 1, value: P.m, unit: '', explain: 'How the pattern turns with longitude $\\varphi$: $|m|$ nodal great circles through the poles. It is held to $|m| \\le l$.' }));
  const toggle = P.toggle ?? !F.compact;
  if (toggle) F.choice({ key: '__view', label: 'View', options: [['sphere', 'on the sphere'], ['lobes', 'as lobes, r = |Y|']], value: P.view, explain: 'Shading on the sphere shows the nodal lines; the lobes show the size of $Y$ in each direction.' });
  else F.params.__view = P.view;

  const { canvas } = F.canvas({ aspect: F.compact ? 'wide' : '', label: P.alt || 'A spherical harmonic on a sphere — drag to turn it' });
  const view = new View3D(canvas, { yaw: P.yaw, pitch: P.pitch, dist: 6.2 });
  view.onChange = () => draw();

  const lm = () => {
    const l = Math.round(F.params.l);
    const m = Math.max(-l, Math.min(l, Math.round(F.params.m)));
    return { l, m };
  };
  const value = () => {
    if (combo) return (th, ph) => P.terms.reduce((s, [l, m, c]) => s + c * S.ylmReal(l, m, th, ph), 0);
    const { l, m } = lm();
    return (th, ph) => S.ylmReal(l, m, th, ph);
  };
  const mix = (v) => { const c = v >= 0 ? POS : NEG, s = Math.min(1, Math.abs(v)); return `rgb(${c.map((x, i) => Math.round(ZERO[i] + (x - ZERO[i]) * (0.25 + 0.75 * s))).join(',')})`; };

  function draw() {
    view.begin();
    const f = value(), lobes = F.params.__view === 'lobes';
    const NT = 40, NP = 80;
    const V = Array.from({ length: NT + 1 }, (_, i) => Array.from({ length: NP + 1 }, (_, j) => f((PI * i) / NT, (2 * PI * j) / NP)));
    const mx = Math.max(1e-12, ...V.flat().map(Math.abs));
    const R = 2.0;
    const pos = (i, j, r) => { const th = (PI * i) / NT, ph = (2 * PI * j) / NP; return [r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)]; };
    const rad = (i, j) => (lobes ? (R * 1.25 * Math.abs(V[i][j])) / mx : R);
    for (let i = 0; i < NT; i++) for (let j = 0; j < NP; j++) {
      const vc = (V[i][j] + V[i + 1][j] + V[i][j + 1] + V[i + 1][j + 1]) / 4;
      const grid = [[pos(i, j, rad(i, j)), pos(i, j + 1, rad(i, j + 1))], [pos(i + 1, j, rad(i + 1, j)), pos(i + 1, j + 1, rad(i + 1, j + 1))]];
      view.surface(grid, { color: mix(vc / mx), alpha: 0.97, wireAlpha: 0.05 });
    }
    if (P.nodal !== false && !lobes) {
      const grid = sampleGrid((i, j) => V[Math.round(i)][Math.round(j)], [0, NT], [0, NP], NT, NP);
      for (const [a, b] of contourSegments(grid, 0)) view.line([pos(a[0], a[1], R * 1.004), pos(b[0], b[1], R * 1.004)], { color: 'ink', width: 2.4, bias: 0.01 });
    }
    if (P.axes !== false) {
      view.line([[0, 0, -2.75], [0, 0, 2.75]], { color: 'ink3', width: 1.2, dash: [4, 4], bias: -0.5 });
      view.label([0, 0, 2.95], 'θ = 0', { color: 'ink3', size: 11 });
    }
    view.end();
    if (P.readout !== false) {
      if (combo) F.readout([['terms', String(P.terms.length)]]);
      else {
        const { l, m } = lm(), q = (k, v) => (hide.has(k) ? '?' : v);
        F.readout([
          ['$(l, m)$', `(${l},\\ ${m})`],
          ['nodal circles of latitude', q('nodal', String(l - Math.abs(m)))],
          ['nodal great circles', q('nodal', String(Math.abs(m)))],
          ['harmonics with this $l$', q('deg', String(2 * l + 1))],
        ]);
      }
    }
  }

  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || 'A real spherical harmonic, computed from the associated Legendre function. Blue: positive, orange: negative, pale: near zero. Drag to turn the sphere.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  const combo = Array.isArray(P.terms) && P.terms.length > 0;
  if (!(Number.isInteger(P.l) && P.l >= 0 && P.l <= 6)) p.push('fa2-sphere: l is a whole number 0–6');
  if (!(Number.isInteger(P.m) && Math.abs(P.m) <= P.l)) p.push('fa2-sphere: m is a whole number with |m| ≤ l');
  if (P.terms != null && !Array.isArray(P.terms)) p.push('fa2-sphere: terms is a list of [l, m, c]');
  if (combo) for (const t of P.terms) if (!(Array.isArray(t) && t.length === 3 && Number.isInteger(t[0]) && t[0] >= 0 && t[0] <= 8 && Number.isInteger(t[1]) && Math.abs(t[1]) <= t[0] && Number.isFinite(t[2]))) p.push('fa2-sphere: each term is [l, m, c] with 0 ≤ l ≤ 8, |m| ≤ l');
  if (!['sphere', 'lobes'].includes(P.view)) p.push('fa2-sphere: view is sphere or lobes');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`fa2-sphere: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`fa2-sphere: unknown hide “${h}”`);
  return p;
}
