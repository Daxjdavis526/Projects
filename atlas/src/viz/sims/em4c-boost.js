// One electromagnetic field, seen from a moving frame (PHYS 4600 M6). The
// physics is model/em4c-fields.js (tested in test/em4c-fields.test.mjs):
// signature (−, +, +, +), x⁰ = ct, F^{0i} = E_i/c, F^{ij} = ε_{ijk}B_k.
// Two panels:
//
//   fields   E′ (gold) and cB′ (teal) as arrows in a small 3D sketch, for an
//            observer moving along +x at speed β (the grey arrow); the lab
//            values are drawn faint and dashed. Components along x never
//            change; the perpendicular ones mix.
//   matrix   the same fields as a 4×4 array, live: F^{μν} (both indices up),
//            F_{μν} (both down), the dual G^{μν}, or the stress–energy tensor
//            T^{μν}. Each cell is shaded by its sign and size.
//
//   { type: 'em4c-boost', params: {
//       preset: 'pureE',          // pureE pureB crossedE crossedB wave generic custom
//       presets: null,            // a list of presets to offer as a choice
//       E: [0, 1, 0], B: [0, 0, 0],   // custom fields, with c = 1 (E in units of E₀, B in units of E₀/c)
//       beta: 0,                  // the observer's speed along +x, as a fraction of c
//       panels: ['fields', 'matrix'],
//       matrix: 'F',              // 'F' | 'Fdown' | 'G' | 'T'
//       matrices: null,           // a list of matrices to offer as a choice
//       controls: null,           // true, false or a list of: beta preset matrix
//       readout: true,
//       readouts: null,           // rows: E B inv1 inv2 u S trace
//       hide: [],                 // rows printed as "?"; 'cells' hides the matrix's numbers; 'arrows' hides E′ and cB′
//       labels: true,
//       yaw: 0,                   // turns the sketch's x-axis (degrees)
//   } }
//
// Units: c = 1, fields in arbitrary units. The fields are uniform (the same
// at every point), so a boost changes their values but not their pattern.

import { Plot } from '../plot.js';
import * as T from '../model/em4c-fields.js';

export const PRESETS = {
  pureE: { label: 'pure electric', E: [0, 1, 0], B: [0, 0, 0] },
  pureB: { label: 'pure magnetic', E: [0, 0, 0], B: [0, 0, 1] },
  crossedE: { label: 'E > cB, crossed', E: [0, 1, 0], B: [0, 0, 0.6] },
  crossedB: { label: 'E < cB, crossed', E: [0, 0.6, 0], B: [0, 0, 1] },
  wave: { label: 'light wave', E: [0, 1, 0], B: [0, 0, 1] },
  generic: { label: 'generic', E: [0.5, 0.8, 0], B: [0.4, 0, 0.9] },
};
export const defaults = {
  preset: 'pureE', presets: null, E: [0, 1, 0], B: [0, 0, 0], beta: 0, panels: ['fields', 'matrix'], matrix: 'F', matrices: null,
  controls: null, readout: true, readouts: null, hide: [], labels: true, yaw: 0,
};
const PANELS = ['fields', 'matrix'];
const MATS = ['F', 'Fdown', 'G', 'T'];
const ROWS = ['E', 'B', 'inv1', 'inv2', 'u', 'S', 'trace'];
const vec3 = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (P.preset !== 'custom' && !PRESETS[P.preset]) out.push(`em4c-boost: preset must be custom or one of ${Object.keys(PRESETS).join(', ')}`);
  for (const k of P.presets || []) if (k !== 'custom' && !PRESETS[k]) out.push(`em4c-boost: unknown preset ${k}`);
  if (!vec3(P.E) || !vec3(P.B)) out.push('em4c-boost: E and B must be arrays of three numbers');
  if (!(typeof P.beta === 'number' && Math.abs(P.beta) < 0.995)) out.push('em4c-boost: beta must be a number with |beta| < 0.995');
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`em4c-boost: unknown panel ${p}`);
  if (!(P.panels || []).length) out.push('em4c-boost: panels must not be empty');
  if (!MATS.includes(P.matrix)) out.push(`em4c-boost: matrix must be one of ${MATS.join(', ')}`);
  for (const m of P.matrices || []) if (!MATS.includes(m)) out.push(`em4c-boost: unknown matrix ${m}`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!['beta', 'preset', 'matrix'].includes(c)) out.push(`em4c-boost: unknown control ${c}`);
  for (const r of P.readouts || []) if (!ROWS.includes(r)) out.push(`em4c-boost: unknown readout ${r}`);
  for (const h of P.hide || []) if (![...ROWS, 'cells', 'arrows'].includes(h)) out.push(`em4c-boost: unknown hide ${h}`);
  return out;
}

const MAT_NAME = { F: 'F with both indices up', Fdown: 'F with both indices down', G: 'the dual G, both indices up', T: 'the stress–energy tensor T, both up' };
const num = (x) => { const v = Math.abs(x) < 5e-4 ? 0 : x; return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2); };
const texn = (x) => { const v = Math.abs(x) < 5e-4 ? 0 : x; return v.toFixed(2); };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const panels = (P.panels || PANELS).filter((p) => PANELS.includes(p));
  const want = P.controls === true ? ['beta', 'preset', 'matrix'] : Array.isArray(P.controls) ? P.controls : P.controls === false || F.compact ? [] : ['beta', 'preset', 'matrix'];
  const put = (k, v) => { F.params[k] = v; };
  const presets = P.presets && P.presets.length > 1 ? P.presets : null;
  const mats = P.matrices && P.matrices.length > 1 ? P.matrices : null;

  if (presets && want.includes('preset')) F.choice({ key: 'preset', label: 'Fields in the lab', options: presets.map((k) => [k, k === 'custom' ? 'custom' : PRESETS[k].label]), value: P.preset, explain: 'Uniform fields as the lab measures them (c = 1: E and cB in the same units).' });
  else put('preset', P.preset);
  if (want.includes('beta')) F.slider({ key: 'beta', label: 'Observer’s speed along $+x$, $\\beta = v/c$', min: -0.95, max: 0.95, step: 0.01, value: P.beta, explain: 'The frame you measure in moves along x at this speed relative to the lab.' });
  else put('beta', P.beta);
  if (mats && want.includes('matrix') && panels.includes('matrix')) F.choice({ key: 'matrix', label: 'Array shown', options: mats.map((m) => [m, { F: '$F^{\\mu\\nu}$', Fdown: '$F_{\\mu\\nu}$', G: '$G^{\\mu\\nu}$', T: '$T^{\\mu\\nu}$' }[m]]), value: P.matrix, explain: 'The field tensor with its indices up or down, its dual, or the stress–energy tensor built from it.' });
  else put('matrix', P.matrix);

  const fCv = panels.includes('fields') ? F.canvas({ aspect: 'wide', label: P.alt || 'Electric and magnetic field arrows seen by a moving observer' }) : null;
  const mCv = panels.includes('matrix') ? F.canvas({ aspect: 'wide', label: 'The field as a 4 by 4 array of components' }) : null;
  const pf = fCv && new Plot(fCv.canvas, { x: [-2, 2], y: [-1.1, 1.1], equal: true, grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });
  const pm = mCv && new Plot(mCv.canvas, { x: [0, 10], y: [0, 5], equal: false, grid: false, axes: false, pad: { l: 4, r: 4, t: 4, b: 4 } });
  F.onChange(() => draw());

  const lab = () => (F.params.preset === 'custom' || !PRESETS[F.params.preset] ? { E: P.E, B: P.B } : PRESETS[F.params.preset]);

  // an oblique sketch: x toward the lower left, y to the right, z up
  const yaw = ((P.yaw || 0) * Math.PI) / 180;
  const proj = ([x, y, z]) => [y - 0.5 * x * Math.cos(0.6 + yaw), z - 0.5 * x * Math.sin(0.6 + yaw)];

  function drawFields(E0, B0, E1, B1) {
    pf.clear();
    const all = [...E0, ...B0, ...E1, ...B1].map(Math.abs);
    const s = 0.95 / Math.max(1, ...all);
    // axes
    for (const [v, name] of [[[1.3, 0, 0], 'x'], [[0, 1.6, 0], 'y'], [[0, 0, 1.05], 'z']]) {
      const [a, b] = proj(v), [c, d] = proj(v.map((u) => -u * 0.6));
      pf.line(c, d, a, b, { color: 'ink4', width: 1, dash: [3, 4] });
      if (P.labels !== false) pf.text(name, a, b, { color: 'ink3', size: 12, dx: 6, dy: -6 });
    }
    // the observer's motion
    const b = F.params.beta;
    if (Math.abs(b) > 0.005) {
      // drawn in the lower right corner, along the sketch's x direction
      const [ux, uy] = proj([1, 0, 0]), L = 2 * b;
      const cx = pf.vx1 - 0.18 * (pf.vx1 - pf.vx0), cy = pf.vy0 + 0.3 * (pf.vy1 - pf.vy0);
      pf.arrow(cx - (ux * L) / 2, cy - (uy * L) / 2, cx + (ux * L) / 2, cy + (uy * L) / 2, { color: 'ink2', width: 2.4 });
      if (P.labels !== false) pf.text(`observer, β = ${b.toFixed(2).replace("-", "−")}`, cx, cy, { color: 'ink2', size: 11.5, dy: 24, align: 'center' });
    }
    const arrow = (v, col, label, ghost) => {
      if (Math.hypot(...v) * s < 0.02) return;
      const [x, y] = proj(v.map((u) => u * s));
      pf.arrow(0, 0, x, y, ghost ? { color: col, width: 1.6, dash: [4, 4], alpha: 0.45 } : { color: col, width: 3, label: P.labels !== false ? label : '', ldx: 6, ldy: -8 });
    };
    if (Math.abs(b) > 0.005) { arrow(E0, 'gold', '', true); arrow(B0, 'teal', '', true); }
    if (!hide.has('arrows')) { arrow(E1, 'gold', 'E′', false); arrow(B1, 'teal', 'cB′', false); }
    pf.point(0, 0, { color: 'ink2', r: 3 });
  }

  function drawMatrix(M, kind) {
    pm.clear();
    const g = pm.ctx, W = pm.R - pm.L, H = pm.B - pm.T;
    const lab = Math.min(28, W * 0.07), cw = Math.min((W - lab) / 4, 120), ch = (H - lab) / 4;
    const x0 = pm.L + (W - lab - 4 * cw) / 2 + lab, y0 = pm.T + lab;
    const big = Math.max(1e-9, ...M.flat().map(Math.abs));
    const names = ['t', 'x', 'y', 'z'];
    const col = (r, c, v) => {
      if (kind === 'T') return r === 0 && c === 0 ? 'gold' : r === 0 || c === 0 ? 'accent' : 'violet';
      const elec = r === 0 || c === 0;
      return (kind === 'G' ? !elec : elec) ? 'gold' : 'teal';
    };
    g.save();
    g.font = `600 ${Math.max(11, Math.min(16, cw / 5))}px Inter, system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const v = M[r][c], x = x0 + c * cw, y = y0 + r * ch;
      const a = Math.abs(v) / big;
      g.fillStyle = pm.color(Math.abs(v) < 5e-4 ? 'ink4' : col(r, c, v));
      g.globalAlpha = Math.abs(v) < 5e-4 ? 0.08 : 0.12 + 0.5 * a;
      g.fillRect(x + 2, y + 2, cw - 4, ch - 4);
      g.globalAlpha = 1;
      if (v < -5e-4) { g.strokeStyle = pm.color(col(r, c, v)); g.lineWidth = 1.5; g.setLineDash([4, 3]); g.strokeRect(x + 3, y + 3, cw - 6, ch - 6); g.setLineDash([]); }
      g.fillStyle = pm.color(Math.abs(v) < 5e-4 ? 'ink3' : 'ink');
      g.fillText(hide.has('cells') ? '?' : num(v), x + cw / 2, y + ch / 2);
    }
    g.font = `500 12px Inter, system-ui, sans-serif`;
    g.fillStyle = pm.color('ink3');
    for (let k = 0; k < 4; k++) {
      g.fillText(names[k], x0 - lab / 2, y0 + k * ch + ch / 2);
      g.fillText(names[k], x0 + k * cw + cw / 2, y0 - lab / 2);
    }
    g.restore();
  }

  function draw() {
    const { E: E0, B: B0 } = lab(), b = F.params.beta;
    const { E: E1, B: B1 } = T.boostFields(E0, B0, b, 1);
    if (pf) drawFields(E0, B0, E1, B1);
    const kind = F.params.matrix;
    if (pm) {
      const Fm = T.Fup(E1, B1, 1);
      const M = kind === 'Fdown' ? T.lower(Fm) : kind === 'G' ? T.Gup(E1, B1, 1) : kind === 'T' ? T.stressEnergy(E1, B1, 1, 1) : Fm;
      drawMatrix(M, kind);
    }
    if (P.readout === false) { F.readout([]); return; }
    const I = T.invariants(E1, B1, 1), fl = T.energyFlux(E1, B1, 1, 1), Tm = T.stressEnergy(E1, B1, 1, 1);
    const v3 = (v) => `(${v.map(texn).join(',\\ ')})`;
    const rows = {
      E: ["$\\vec E'$", v3(E1)],
      B: ["$c\\vec B'$", v3(B1)],
      inv1: ["$E'^2 - c^2B'^2$", texn(I.EEcBB)],
      inv2: ["$\\vec E'\\cdot c\\vec B'$", texn(I.EB)],
      u: ["energy density $u'$", texn(fl.u)],
      S: ["$\\vec S'/c$", v3(fl.S)],
      trace: ['trace $T^\\mu{}_\\mu$', texn(-Tm[0][0] + Tm[1][1] + Tm[2][2] + Tm[3][3])],
    };
    const keys = (P.readouts || (kind === 'T' ? ['u', 'S', 'trace'] : ['E', 'B', 'inv1', 'inv2'])).filter((k) => rows[k]);
    F.readout(keys.map((k) => (hide.has(k) ? [rows[k][0], '?'] : rows[k])));
  }
  F.draw(draw);
  if (!P.caption) F.caption(`Exact Lorentz transformation of uniform fields for a boost along x (c = 1, arbitrary field units). The array is ${MAT_NAME[P.matrix]}, signature (−, +, +, +); dashed cells are negative.`);
  return { get: (k) => F.params[k] };
}
