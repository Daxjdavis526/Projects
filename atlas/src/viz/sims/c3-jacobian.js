// A change of variables (u, v) ↦ (x, y), drawn as what it does to a grid.
// Top: the (u, v) plane, a rectangle ruled into equal cells. Bottom: the same
// grid after the map — u = const lines in blue, v = const lines in violet,
// each image cell tinted by how much the map stretched it. One cell (gold)
// can be moved and shrunk: its image is nearly the parallelogram spanned by
// the two arrows r_u du and r_v dv, so its area is nearly |J| du dv, where
// J = ∂(x, y)/∂(u, v) is the Jacobian determinant. The readout compares the
// image's true area with du dv; the ratio approaches |J| as the cell shrinks.
//
//   { type: 'c3-jacobian', params: {
//       maps: [{ label: 'Polar', x: 'u*cos(v)', y: 'u*sin(v)', u: [0, 2], v: [0, 'pi'],
//                uName: 'r', vName: 'θ', uTeX: 'r', vTeX: '\\theta', Jtex: 'r',     // names on the canvas / in TeX; |J| as TeX
//                view: { x: [-2.4, 2.4], y: [-0.3, 2.4] }, cell: [1.2, 0.9] }, …],   // the x–y window; the cell's start
//       map: 0,                                                    // the one shown first; several → a choice
//       size: 0.18, sizeSlider: true,                              // the cell's size, as a fraction of each range
//       grid: [8, 8],                                              // grid cells along u and along v
//       tint: true, vectors: true,                                 // stretch tint; the arrows r_u du, r_v dv
//       readout: true } }                                          // false hides every number
//
// Expressions use u, v (and the map's own constants). The geometry — mapped
// areas and numerical Jacobians — lives in model/c3-integrals.js.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/c3-integrals.js';

export const defaults = { map: 0, size: 0.18, sizeSlider: true, grid: [8, 8], tint: true, vectors: true, readout: true };

const val = (s) => (typeof s === 'number' ? s : fn(s, [])({}));
function compile(m) {
  const X = fn(m.x, ['u', 'v']), Y = fn(m.y, ['u', 'v']);
  const u = m.u.map(val), v = m.v.map(val);
  return { ...m, X: (a, b) => X({ u: a, v: b }), Y: (a, b) => Y({ u: a, v: b }), ur: u, vr: v };
}
// a window that holds the whole image, padded
function autoView(c) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i <= 40; i++) for (let j = 0; j <= 40; j++) {
    const u = c.ur[0] + ((c.ur[1] - c.ur[0]) * i) / 40, v = c.vr[0] + ((c.vr[1] - c.vr[0]) * j) / 40;
    const x = c.X(u, v), y = c.Y(u, v);
    if (Number.isFinite(x) && Number.isFinite(y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
  const px = 0.08 * (x1 - x0 || 1), py = 0.08 * (y1 - y0 || 1);
  return { x: [x0 - px, x1 + px], y: [y0 - py, y1 + py] };
}

export function mount(F, P) {
  const maps = (P.maps?.length ? P.maps : [P]).map(compile);
  const { canvas: cUV } = F.canvas({ aspect: 'wide', label: P.alt || 'The (u, v) plane: a rectangle ruled into equal cells' });
  const { canvas: cXY } = F.canvas({ aspect: P.aspect || 'wide', label: 'The x–y plane: the image of the grid under the change of variables' });
  if (maps.length > 1) F.choice({ key: '__map', label: 'Change of variables', options: maps.map((m, k) => [k, m.label || `Map ${k + 1}`]), value: P.map ?? 0, explain: P.mapExplain || 'Each one turns the rectangle of (u, v) values into a region of the plane.' });
  const ctl = maps.map((m, k) => {
    const [u0, u1] = m.ur, [v0, v1] = m.vr, start = m.cell || [u0 + 0.5 * (u1 - u0), v0 + 0.4 * (v1 - v0)];
    return [
      F.slider({ key: `__u${k}`, label: `Cell at $${m.uTeX || 'u'}$`, min: u0, max: u1, step: (u1 - u0) / 100, value: start[0], explain: `Where the gold cell starts in $${m.uTeX || 'u'}$.` }),
      F.slider({ key: `__v${k}`, label: `Cell at $${m.vTeX || 'v'}$`, min: v0, max: v1, step: (v1 - v0) / 100, value: start[1], explain: `Where it starts in $${m.vTeX || 'v'}$.` }),
    ];
  });
  if (P.sizeSlider !== false) F.slider({ key: '__size', label: 'Cell size', min: 0.02, max: 0.3, step: 0.01, value: P.size ?? 0.18, explain: 'As a fraction of each range: shrink it and the area ratio settles on $|J|$.' });
  const current = () => (maps.length > 1 ? +F.params.__map : 0);
  const show = () => ctl.forEach((pair, k) => pair.forEach((c) => { c.node.style.display = k === current() ? '' : 'none'; }));
  show();
  const pUV = new Plot(cUV, { x: [0, 1], y: [0, 1], equal: false, xlabel: 'u', ylabel: 'v' });
  const pXY = new Plot(cXY, { x: [0, 1], y: [0, 1], equal: true, xlabel: 'x', ylabel: 'y' });
  F.onChange((key) => { if (key === '__map') show(); draw(); });

  function draw() {
    const k = current(), m = maps[k];
    const [u0, u1] = m.ur, [v0, v1] = m.vr, du0 = u1 - u0, dv0 = v1 - v0;
    const size = P.sizeSlider !== false ? F.params.__size : P.size ?? 0.18;
    const du = size * du0, dv = size * dv0;
    const cu = Math.min(F.params[`__u${k}`], u1 - du), cv = Math.min(F.params[`__v${k}`], v1 - dv);
    const [gu, gv] = P.grid || [8, 8];

    // (u, v) plane
    pUV.o.xlabel = m.uName || 'u'; pUV.o.ylabel = m.vName || 'v';
    pUV.setView([u0 - 0.06 * du0, u1 + 0.06 * du0], [v0 - 0.1 * dv0, v1 + 0.1 * dv0]);
    pUV.clear();
    pUV.rect(u0, v0, du0, dv0, { color: 'accent', alpha: 0.07, width: 1.5 });
    for (let i = 0; i <= gu; i++) { const u = u0 + (du0 * i) / gu; pUV.line(u, v0, u, v1, { color: 'accent', width: i % gu ? 1 : 1.8, alpha: 0.75 }); }
    for (let j = 0; j <= gv; j++) { const v = v0 + (dv0 * j) / gv; pUV.line(u0, v, u1, v, { color: 'violet', width: j % gv ? 1 : 1.8, alpha: 0.75 }); }
    pUV.rect(cu, cv, du, dv, { color: 'gold', alpha: 0.75, width: 1.6 });

    // x–y plane
    const view = m.view || autoView(m);
    pXY.setView(view.x, view.y);
    pXY.clear();
    const img = (pts) => pts.map(([u, v]) => [m.X(u, v), m.Y(u, v)]);
    if (P.tint !== false) {
      let Jmax = 0;
      const cells = [];
      for (let i = 0; i < gu; i++) for (let j = 0; j < gv; j++) {
        const a = u0 + (du0 * i) / gu, c = v0 + (dv0 * j) / gv;
        const J = Math.abs(M.jacobianAt(m.X, m.Y, a + du0 / gu / 2, c + dv0 / gv / 2).det);
        cells.push([a, c, J]); if (Number.isFinite(J)) Jmax = Math.max(Jmax, J);
      }
      for (const [a, c, J] of cells) {
        if (!(Jmax > 0) || !Number.isFinite(J)) continue;
        pXY.path(img(M.cellBoundary(a, a + du0 / gu, c, c + dv0 / gv, 8)), { close: true, fill: 'teal', fillAlpha: 0.04 + 0.3 * (J / Jmax), stroke: false });
      }
    }
    for (let i = 0; i <= gu; i++) { const u = u0 + (du0 * i) / gu; pXY.curve((t) => m.X(u, t), (t) => m.Y(u, t), v0, v1, { color: 'accent', width: i % gu ? 1 : 1.8, alpha: 0.8, samples: 160 }); }
    for (let j = 0; j <= gv; j++) { const v = v0 + (dv0 * j) / gv; pXY.curve((t) => m.X(t, v), (t) => m.Y(t, v), u0, u1, { color: 'violet', width: j % gv ? 1 : 1.8, alpha: 0.8, samples: 160 }); }
    const cell = img(M.cellBoundary(cu, cu + du, cv, cv + dv, 24));
    pXY.path(cell, { close: true, fill: 'gold', fillAlpha: 0.7, color: 'gold', width: 1.6 });
    const Jc = M.jacobianAt(m.X, m.Y, cu, cv);
    if (P.vectors !== false) {
      const ox = m.X(cu, cv), oy = m.Y(cu, cv);
      const a = [Jc.xu * du, Jc.yu * du], b = [Jc.xv * dv, Jc.yv * dv];
      pXY.path([[ox, oy], [ox + a[0], oy + a[1]], [ox + a[0] + b[0], oy + a[1] + b[1]], [ox + b[0], oy + b[1]], [ox, oy]], { color: 'ink2', width: 1.2, dash: [4, 4] });
      pXY.arrow(ox, oy, ox + a[0], oy + a[1], { color: 'accent', width: 2.2, head: 8 });
      pXY.arrow(ox, oy, ox + b[0], oy + b[1], { color: 'violet', width: 2.2, head: 8 });
    }

    if (P.readout === false) { F.readout([]); return; }
    const area = Math.abs(M.mappedArea(m.X, m.Y, cu, cu + du, cv, cv + dv)), mid = M.jacobianAt(m.X, m.Y, cu + du / 2, cv + dv / 2).det;
    const uT = m.uTeX || 'u', vT = m.vTeX || 'v';
    F.readout([
      [`cell: $\\Delta ${uT}\\,\\Delta ${vT}$`, tx(du * dv)],
      ['area of its image', tx(area)],
      ['ratio', tx(area / (du * dv))],
      [m.Jtex ? `$|J| = ${m.Jtex}$ at the cell’s centre` : '$|J|$ at the cell’s centre', tx(Math.abs(mid))],
    ]);
  }
  F.draw(draw);
  F.caption(P.caption || 'Top: the (u, v) rectangle and its grid. Bottom: the same grid after the change of variables, each cell tinted by how much it was stretched. The dashed parallelogram, spanned by the two arrows, is the straight-sided approximation to the gold cell.');
}

const tx = (v) => (Number.isFinite(v) ? String(+v.toPrecision(4)) : '\\text{—}');

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  const maps = P.maps?.length ? P.maps : [P];
  maps.forEach((m, k) => {
    const where = `c3-jacobian map ${k + 1}`;
    for (const f of ['x', 'y']) { if (typeof m[f] !== 'string' && typeof m[f] !== 'number') { out.push(`${where} needs ${f}(u, v)`); continue; } try { fn(m[f], ['u', 'v']); } catch (e) { out.push(`${where} ${f}: “${m[f]}” — ${e.message}`); } }
    for (const r of ['u', 'v']) {
      if (!(Array.isArray(m[r]) && m[r].length === 2)) { out.push(`${where} needs ${r}: [lo, hi]`); continue; }
      let a, b;
      try { [a, b] = m[r].map(val); } catch (e) { out.push(`${where} ${r} range: ${e.message}`); continue; }
      if (!(a < b)) out.push(`${where} ${r} range must run forwards`);
    }
    for (const f of ['uName', 'vName', 'label']) if (m[f] !== undefined && /\$|\\/.test(m[f])) out.push(`${where} ${f} “${m[f]}” is plain text (it is drawn on the canvas or a button): no TeX`);
    if (m.view && !(['x', 'y'].every((a) => Array.isArray(m.view[a]) && m.view[a].length === 2 && m.view[a][0] < m.view[a][1]))) out.push(`${where} view must be { x: [lo, hi], y: [lo, hi] }`);
  });
  if (!(P.size > 0 && P.size <= 0.3)) out.push('c3-jacobian size must be in (0, 0.3]');
  return out;
}
