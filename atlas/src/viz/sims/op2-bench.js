// An optical bench for lens and mirror systems (PHYS 4650 O4): any sequence of
// thin lenses, refracting surfaces (spheres or conics, real glasses with their
// dispersion) and mirrors on one axis, traced paraxially with ray-transfer
// (ABCD) matrices or exactly with Snell's law. It draws the elements to scale
// (a glass body between consecutive surfaces), a fan of rays from a star or a
// point, the cardinal points (focal points F, F′ and principal planes H, H′),
// the paraxial image, and reads out the system matrix, the effective focal
// length, the back focal distance and — in exact mode — how far the edge rays
// miss the paraxial focus (spherical aberration) or how far the colours do
// (chromatic aberration). Mirrors fold the light back, so a Cassegrain
// telescope is drawn as it is built. Physics in model/op2-bench.js (tested in
// test/op2-bench.test.mjs).
//
//   { type: 'op2-bench', params: {
//       elements: [                          // in the order light meets them (see the model's header)
//         { kind: 'thin', z: 0, f: 100, ap: 12, label: 'L₁' },
//         { kind: 'surf', z: 0, R: 51.7, mat: 'crown' | n: 1.5, k: 0, ap: 12 },
//         { kind: 'mirror', z: 0, R: -200, k: 0, ap: 30, hole: 0 },
//         { kind: 'stop', z: 0, ap: 5 },                    // an aperture stop
//         { kind: 'screen', z: 0, ap: 5 },                  // a detector or screen (drawn only)
//       ],
//       source: 'inf',                     // 'inf' (a star) | 'point'
//       angle: 0,                          // inf: the star's angle to the axis, °
//       obj: [-150, 0],                    // point: the object point [z, y]
//       arrow: false,                      // point: draw the object as an arrow from the axis (and its paraxial image)
//       rays: 7,                           // rays across the aperture (inf: across the first element's aperture)
//       fill: [-1, 1],                     // which part of the aperture the rays fill (fractions; [0.3, 1] plus symmetric: annulus)
//       annulus: false,                    // rays only where |fraction| ≥ fill[0] (a central obstruction)
//       trace: 'paraxial',                 // 'paraxial' (ABCD) | 'exact' (Snell's law at the real surfaces)
//       lambdas: null,                     // exact: draw each ray at these wavelengths (nm), in their colours
//       lambda: 587.56,                    // the design wavelength (nm): matrices and cardinal points
//       start: null,                       // z where rays from a star start (default: the left of the view)
//       end: null,                         // z where the last segment stops (default: the edge of the view)
//       x: null, y: null,                  // the view (default: fitted to the elements)
//       unit: 'mm',                        // the length unit of every number above
//       marks: ['F2'],                     // cardinal points drawn: F F2 H H2 image (F2, H2 are F′, H′)
//       readouts: null,                    // rows: matrix f bfd ffd H H2 image m lsa colour (default: matrix f bfd)
//       hide: [],                          // rows or marks not to show (the answer to a problem)
//       controls: [],                      // sliders: { key, label, min, max, step, value, unit, explain,
//                                          //   set: [[elementIndex, prop, scale = 1, offset = 0], …] or 'angle';
//                                          //   ['obj', 0 | 1, scale, offset] moves the object point's z or y }
//       toggle: false,                     // a paraxial/exact switch
//       labels: true, axis: false,         // element labels; a scale along the axis
//       clip: true,                        // exact: stop rays outside an element's aperture
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/op2-bench.js';
import { wavelengthRGB } from '../model/optics-waves.js';

export const defaults = {
  elements: [{ kind: 'thin', z: 0, f: 100, ap: 15 }], source: 'inf', angle: 0, obj: [-150, 0], arrow: false, rays: 7, fill: [-1, 1], annulus: false,
  trace: 'paraxial', lambdas: null, lambda: 587.56, start: null, end: null, x: null, y: null, unit: 'mm', marks: ['F2'], readouts: null, hide: [],
  controls: [], toggle: false, labels: true, axis: false, clip: true,
};
const KINDS = ['thin', 'surf', 'mirror', 'stop', 'screen'];
const MARKS = ['F', 'F2', 'H', 'H2', 'image'];
const ROWS = ['matrix', 'f', 'bfd', 'ffd', 'H', 'H2', 'image', 'm', 'lsa', 'colour'];
const MATS = ['crown', 'flint', 'denseflint', 'silica', 'water', 'diamond', 'sapphire', 'mgf2'];
const trim = (x, n = 4) => (Number.isFinite(x) ? String(+(+x).toPrecision(n)) : '\\text{—}');
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Is the theme light? */
function lightTheme(pl) {
  const m = /^#([0-9a-f]{6})$/i.exec(pl.col.bg.trim());
  if (!m) { const r = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(pl.col.bg); return r ? (+r[1] + +r[2] + +r[3]) / 3 > 140 : false; }
  const v = parseInt(m[1], 16);
  return ((v >> 16) + ((v >> 8) & 255) + (v & 255)) / 3 > 140;
}
const specColor = (pl, l, a = 1) => { const c = wavelengthRGB(l) || [200, 200, 200]; return rgb(lightTheme(pl) ? c.map((v) => Math.round(v * 0.72)) : c, a); };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const els = P.elements.map((e) => ({ ...e }));
  F.params.trace = P.trace;
  F.params.angle = P.angle;
  for (const c of P.controls || []) {
    F.slider({ key: c.key, label: c.label, min: c.min, max: c.max, step: c.step ?? (c.max - c.min) / 100, value: c.value, unit: c.unit ?? '', explain: c.explain || '' });
  }
  if (P.toggle) F.choice({ key: 'trace', label: 'Rays', options: [['paraxial', 'Paraxial (matrices)'], ['exact', 'Exact (Snell)']], value: P.trace, explain: 'Paraxial rays obey the small-angle matrices exactly; exact rays obey Snell’s law at the real surfaces.' });

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'An optical system on its axis with rays traced through it' });
  const pl = new Plot(canvas, { x: [0, 1], y: [-1, 1], grid: false, axes: false, pad: { l: 10, r: 10, t: 12, b: P.axis ? 30 : 12 } });

  /** Apply the sliders to the elements. */
  function sync() {
    for (const c of P.controls || []) {
      const v = +F.params[c.key];
      if (c.set === 'angle') { F.params.angle = v; continue; }
      if (c.set === 'objz') { P.obj = [v, P.obj[1]]; continue; }
      if (c.set === 'objy') { P.obj = [P.obj[0], v]; continue; }
      for (const [i, prop, sc = 1, off = 0] of c.set || []) {
        let x = sc * v + off;
        if ((prop === 'f' || prop === 'R') && x === 0) x = Infinity;        // a slider passing 0: no lens, a flat surface
        if (i === 'obj') { P.obj = P.obj.slice(); P.obj[prop] = x; } else els[i][prop] = x;
      }
    }
  }

  /** The view: from the props, or fitted to the elements. */
  function view() {
    const zs = els.map((e) => e.z), ap = Math.max(...els.map((e) => e.ap || 0), 1);
    let x = P.x, y = P.y;
    if (!x) {
      let lo = Math.min(...zs), hi = Math.max(...zs);
      try { const c = M.cardinal(els, { lambda: P.lambda }); if (!c.afocal) { lo = Math.min(lo, c.zF2, c.zF); hi = Math.max(hi, c.zF2, c.zF); } } catch { /* behind */ }
      if (P.source === 'point') lo = Math.min(lo, P.obj[0]);
      const pad = 0.12 * (hi - lo || 1);
      x = [lo - pad, hi + pad];
    }
    if (!y) y = [-1.35 * ap, 1.35 * ap];
    return { x, y };
  }

  function draw() {
    sync();
    const V = view();
    pl.o.xlabel = P.axis ? `z (${P.unit})` : '';
    pl.o.axes = !!P.axis; pl.o.xticks = 6; pl.o.yticks = 0;
    pl.setView(V.x, V.y);
    pl.clear();
    const fs = pl.w < 520 ? 10.5 : 11.5;
    let walk = null, card = null;
    try { walk = M.walk(els, { lambda: P.lambda }); card = M.cardinal(els, { lambda: P.lambda }); } catch (e) {
      pl.text('Elements out of order: ' + e.message, pl.L + 8, pl.T + 12, { screen: true, color: 'bad', size: fs });
      F.readout([]);
      return;
    }
    // the axis
    pl.line(V.x[0], 0, V.x[1], 0, { color: 'ink3', width: 1, dash: [6, 5] });
    drawGlass(walk);
    drawElements(walk, fs);
    drawRays(walk, card);
    drawMarks(card, fs);
    readout(card);
  }

  /** Shade the glass between consecutive surfaces whose medium is not air. */
  function drawGlass(walk) {
    const g = pl.ctx;
    for (let i = 0; i + 1 < els.length; i++) {
      const a = els[i], b = els[i + 1];
      if (a.kind !== 'surf' || b.kind !== 'surf' || walk.steps[i].nOut <= 1.0001) continue;
      const ap = Math.min(a.ap || 1e9, b.ap || 1e9, ...[a, b].map((e) => maxAp(e)));
      const top = [], bot = [];
      for (let j = 0; j <= 40; j++) { const y = -ap + (2 * ap * j) / 40; top.push([a.z + M.sag(curv(a), a.k ?? 0, y), y]); bot.push([b.z + M.sag(curv(b), b.k ?? 0, y), y]); }
      g.save();
      g.beginPath();
      top.forEach(([z, y], j) => (j ? g.lineTo(pl.X(z), pl.Y(y)) : g.moveTo(pl.X(z), pl.Y(y))));
      for (let j = bot.length - 1; j >= 0; j--) g.lineTo(pl.X(bot[j][0]), pl.Y(bot[j][1]));
      g.closePath();
      g.fillStyle = pl.color('accent'); g.globalAlpha = 0.16; g.fill();
      g.restore();
    }
    // a last surface into glass: the glass fills the rest of the view
    const li = els.length - 1, e = els[li];
    if (e.kind === 'surf' && walk.steps[li].nOut > 1.0001) {
      const s = walk.steps[li].sOut, zEdge = s > 0 ? pl.vx1 : pl.vx0, a = Math.min(maxAp(e), pl.vy1);
      const pts = [];
      for (let j = 0; j <= 40; j++) { const y = -a + (2 * a * j) / 40; pts.push([e.z + M.sag(curv(e), e.k ?? 0, y), y]); }
      g.save(); g.beginPath();
      pts.forEach(([z, y], j) => (j ? g.lineTo(pl.X(z), pl.Y(y)) : g.moveTo(pl.X(z), pl.Y(y))));
      g.lineTo(pl.X(zEdge), pl.Y(a)); g.lineTo(pl.X(zEdge), pl.Y(-a)); g.closePath();
      g.fillStyle = pl.color('accent'); g.globalAlpha = 0.16; g.fill(); g.restore();
    }
  }
  const curv = (e) => (Number.isFinite(e.R) && e.R ? 1 / e.R : 0);
  /** The largest height a surface reaches before its sag formula fails (a hemisphere). */
  function maxAp(e) {
    const c = curv(e), k = e.k ?? 0;
    if (!c || 1 + k <= 0) return Infinity;
    return 0.999 / (Math.abs(c) * Math.sqrt(1 + k));
  }

  function drawElements(walk, fs) {
    const g = pl.ctx;
    els.forEach((e, i) => {
      const ap = e.ap || (pl.vy1 * 0.8);
      if (e.kind === 'thin') {
        const conv = e.f > 0, x = pl.X(e.z), y0 = pl.Y(ap), y1 = pl.Y(-ap);
        g.save(); g.strokeStyle = pl.color('accent'); g.fillStyle = pl.color('accent'); g.lineWidth = 2.6; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();
        for (const [y, dir] of [[y0, -1], [y1, 1]]) {
          g.beginPath();
          if (conv) { g.moveTo(x, y); g.lineTo(x - 6, y - dir * 9); g.lineTo(x + 6, y - dir * 9); }
          else { g.moveTo(x, y - dir * 9); g.lineTo(x - 6, y); g.lineTo(x + 6, y); }
          g.closePath(); g.fill();
        }
        g.restore();
      } else if (e.kind === 'surf') {
        const c = curv(e), k = e.k ?? 0, a = Math.min(ap, maxAp(e));
        pl.curve((y) => e.z + M.sag(c, k, y), (y) => y, -a, a, { color: 'accent', width: 2, samples: 120 });
      } else if (e.kind === 'mirror') {
        const c = curv(e), k = e.k ?? 0, a = Math.min(ap, maxAp(e)), hole = e.hole || 0;
        const s = walk.steps[i].s;          // the reflecting side faces the light: hatch the back
        for (const [lo, hi] of hole ? [[hole, a], [-a, -hole]] : [[-a, a]]) {
          pl.curve((y) => e.z + M.sag(c, k, y), (y) => y, lo, hi, { color: 'ink', width: 3, samples: 120 });
          const n = Math.max(3, Math.round(Math.abs(pl.Y(lo) - pl.Y(hi)) / 9));
          for (let j = 0; j <= n; j++) {
            const y = lo + ((hi - lo) * j) / n, z = e.z + M.sag(c, k, y);
            g.save(); g.strokeStyle = pl.color('ink3'); g.lineWidth = 1.2;
            g.beginPath(); g.moveTo(pl.X(z), pl.Y(y)); g.lineTo(pl.X(z) + s * 7, pl.Y(y) - 6); g.stroke(); g.restore();
          }
        }
      } else if (e.kind === 'stop') {
        const x = pl.X(e.z), top = pl.Y(pl.vy1 * 0.95), bot = pl.Y(pl.vy0 * 0.95);
        g.save(); g.strokeStyle = pl.color('ink2'); g.lineWidth = 3.5;
        g.beginPath(); g.moveTo(x, top); g.lineTo(x, pl.Y(e.ap)); g.moveTo(x, pl.Y(-e.ap)); g.lineTo(x, bot); g.stroke(); g.restore();
      }
      else if (e.kind === 'screen') {
        const x = pl.X(e.z);
        g.save(); g.strokeStyle = pl.color('ink'); g.lineWidth = 5; g.lineCap = 'butt';
        g.beginPath(); g.moveTo(x, pl.Y(ap)); g.lineTo(x, pl.Y(-ap)); g.stroke(); g.restore();
      }
      if (P.labels && e.label) pl.text(e.label, e.z, Math.min(pl.vy1, ap + (e.kind === 'mirror' ? 0 : 0)), { color: e.kind === 'mirror' ? 'ink' : 'accent', size: fs, align: 'center', dy: -12, weight: 600 });
    });
  }

  /** The starting rays: [point, unit direction] pairs. */
  function startRays() {
    const n = Math.max(1, P.rays | 0), first = els[0], ap = first.ap || 10;
    const [lo, hi] = P.fill;
    const fr = [];
    if (P.annulus) {
      const m = Math.max(1, Math.round(n / 2));
      for (let i = 0; i < m; i++) { const f = m === 1 ? hi : lo + ((hi - lo) * i) / (m - 1); fr.push(f, -f); }
    } else for (let i = 0; i < n; i++) fr.push(n === 1 ? (lo + hi) / 2 : lo + ((hi - lo) * i) / (n - 1));
    const out = [];
    if (P.source === 'inf') {
      const th = (F.params.angle || 0) * M.DEG, z0 = P.start ?? pl.vx0;
      for (const f of fr) {
        const yAt = f * ap;                                  // height where it meets the first element's plane
        out.push({ p: [z0, yAt - Math.tan(th) * (first.z - z0)], th, f });
      }
    } else {
      const [zo, yo] = P.obj;
      for (const f of fr) {
        const yAt = f * ap, th = Math.atan2(yAt - yo, first.z - zo);
        out.push({ p: [zo, yo], th, f });
      }
    }
    return out;
  }

  function drawRays(walk, card) {
    const exact = F.params.trace === 'exact';
    const zEnd = (s) => P.end ?? (s > 0 ? pl.vx1 : pl.vx0);
    const lams = exact && P.lambdas?.length ? P.lambdas : [null];
    for (const r of startRays()) {
      for (const lam of lams) {
        const color = lam ? specColor(pl, lam, 0.95) : 'gold';
        let pts, last, dir, ok = true;
        if (exact) {
          const res = M.exactRay(els, r.p, [Math.cos(r.th), Math.sin(r.th)], { lambda: lam ?? P.lambda, clip: P.clip });
          pts = res.pts; ok = res.ok; last = pts[pts.length - 1]; dir = res.d;
        } else {
          // paraxial: the ray's height and angle at the first element, then the matrices
          const y0 = r.p[1] + Math.tan(r.th) * (els[0].z - r.p[0]);
          const pr = M.paraxialRay(els, y0, r.th, { lambda: P.lambda });
          pts = [r.p, ...pr.pts.map((q) => [q.z, q.y])];
          if (P.clip) { const k = pr.pts.findIndex((q, i) => els[i].ap && Math.abs(q.y) > els[i].ap * 1.0001); if (k >= 0) { pts = pts.slice(0, k + 2); ok = false; } }
          last = pts[pts.length - 1];
          // per unit of travel the height changes by θ, whichever way the light goes
          dir = [walk.sEnd, pr.th];
        }
        if (ok) {
          const s = Math.sign(dir[0]) || walk.sEnd, ze = zEnd(s);
          const t = (ze - last[0]) / dir[0];
          if (t > 0) pts = [...pts, [ze, last[1] + t * dir[1]]];
        }
        pl.ctx.save(); pl._clip();
        pl.path(pts, { color, width: lam ? 1.5 : 1.7, alpha: lam ? 1 : 0.95 });
        pl.ctx.restore();
      }
    }
  }

  function drawMarks(card, fs) {
    if (!card || card.afocal) return;
    const marks = new Set((P.marks || []).filter((m) => !hide.has(m)));
    const ap = Math.max(...els.map((e) => e.ap || 0), 1);
    const inView = (z) => z >= pl.vx0 && z <= pl.vx1;
    const pt = (z, label, color) => { if (!inView(z)) return; pl.point(z, 0, { color, r: 4.5 }); if (P.labels) pl.text(label, z, 0, { color, size: fs, weight: 700, align: 'center', dy: 15 }); };
    const plane = (z, label) => { if (!inView(z)) return; pl.line(z, -ap * 1.1, z, ap * 1.1, { color: 'violet', width: 1.4, dash: [5, 4] }); if (P.labels) pl.text(label, z, -ap * 1.1, { color: 'violet', size: fs, weight: 700, align: 'center', dy: 11 }); };
    if (marks.has('H')) plane(card.zH, 'H');
    if (marks.has('H2')) plane(card.zH2, 'H′');
    if (marks.has('F')) pt(card.zF, 'F', 'warn');
    if (marks.has('F2')) pt(card.zF2, 'F′', 'warn');
    if (P.source === 'point') {
      const [zo, yo] = P.obj;
      if (P.arrow) arrowObj(zo, yo, 'accent');
      else if (inView(zo)) pl.point(zo, yo, { color: 'accent', r: 4.5 });
      if (marks.has('image')) {
        const im = M.image(els, els[0].z - zo, { lambda: P.lambda });
        if (Number.isFinite(im.z) && inView(im.z)) { if (P.arrow) arrowObj(im.z, im.m * yo, 'good', im.si < 0); else pl.point(im.z, im.m * yo, { color: 'good', r: 5 }); }
      }
    }
  }
  function arrowObj(z, h, color, dashed = false) {
    if (Math.abs(h) < 1e-12) { pl.point(z, 0, { color, r: 4 }); return; }
    pl.arrow(z, 0, z, h, { color, width: 3, dash: dashed ? [5, 4] : [] });
  }

  function readout(card) {
    if (P.readout === false) { F.readout([]); return; }
    const u = `\\,\\mathrm{${P.unit}}`;
    const rows = [];
    const want = (P.readouts || ['matrix', 'f', 'bfd']).filter((k) => !hide.has(k));
    const mm = card.M;
    for (const k of want) {
      if (k === 'matrix') rows.push(['$M$', `\\begin{pmatrix}${trim(mm[0][0])} & ${trim(mm[0][1])}\\\\ ${trim(mm[1][0])} & ${trim(mm[1][1])}\\end{pmatrix}`]);
      else if (k === 'f') rows.push(['focal length $f$', card.afocal ? '\\infty\\ (\\text{afocal})' : `${trim(card.f)}${u}`]);
      else if (k === 'bfd') rows.push(['back focal distance', card.afocal ? '\\text{—}' : `${trim(card.bfd)}${u}`]);
      else if (k === 'ffd') rows.push(['front focal distance', card.afocal ? '\\text{—}' : `${trim(-card.ffd)}${u}`]);
      else if (k === 'H') rows.push(['$H$ from first vertex', card.afocal ? '\\text{—}' : `${trim(card.h1)}${u}`]);
      else if (k === 'H2') rows.push(['$H′$ from last vertex', card.afocal ? '\\text{—}' : `${trim(card.h2)}${u}`]);
      else if ((k === 'image' || k === 'm') && P.source === 'point') {
        const im = M.image(els, els[0].z - P.obj[0], { lambda: P.lambda });
        const scr = els[els.length - 1].kind === 'screen';
        if (k === 'image') rows.push([scr ? 'image beyond the screen' : 'image after last element', `${trim(im.si)}${u}`]);
        else rows.push(['magnification $m$', trim(im.m, 3)]);
      } else if (k === 'lsa') {
        const h = Math.max(Math.abs(P.fill[0]), Math.abs(P.fill[1])) * (els[0].ap || 10);
        rows.push(['edge-ray focus − paraxial', `${trim(M.longitudinal(els, h, { lambda: P.lambda }), 3)}${u}`]);
      } else if (k === 'colour') {
        const fl = (l) => M.cardinal(els, { lambda: l }).zF2;
        rows.push(['$F′$(red 656) − $F′$(blue 486)', `${trim(fl(656.27) - fl(486.13), 3)}${u}`]);
      }
    }
    F.readout(rows);
  }

  F.onChange(() => draw());
  F.draw(draw);
  F.caption((F.params.trace === 'exact'
    ? 'Rays traced exactly (Snell’s law at the real surfaces) in the plane of the drawing. Heights are drawn on a larger scale than lengths along the axis when the view is not to scale.'
    : 'Paraxial rays: the small-angle matrices, exact for rays close to the axis. Real rays far from the axis miss the paraxial focus (spherical aberration). Heights may be exaggerated.'));
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const out = [];
  if (!Array.isArray(P.elements) || !P.elements.length) return ['op2-bench: elements must be a non-empty list'];
  P.elements.forEach((e, i) => {
    if (!KINDS.includes(e.kind)) out.push(`op2-bench: element ${i} kind must be one of ${KINDS.join(', ')}`);
    if (typeof e.z !== 'number') out.push(`op2-bench: element ${i} needs a numeric z`);
    if (e.kind === 'thin' && !(typeof e.f === 'number' && e.f !== 0)) out.push(`op2-bench: thin lens ${i} needs a nonzero f`);
    if ((e.kind === 'surf' || e.kind === 'mirror') && !(typeof e.R === 'number' && e.R !== 0)) out.push(`op2-bench: element ${i} needs a nonzero R (Infinity for flat)`);
    if (e.kind === 'surf' && e.mat !== undefined && !MATS.includes(e.mat)) out.push(`op2-bench: element ${i} material must be one of ${MATS.join(', ')}`);
    if (e.kind === 'surf' && e.mat === undefined && !(typeof e.n === 'number' && e.n >= 1 && e.n <= 4)) out.push(`op2-bench: surface ${i} needs n in [1, 4] or a mat`);
    if (e.kind === 'stop' && !(e.ap > 0)) out.push(`op2-bench: stop ${i} needs ap > 0`);
  });
  try { M.walk(P.elements); } catch (e) { out.push('op2-bench: ' + e.message); }
  if (!['inf', 'point'].includes(P.source)) out.push('op2-bench: source must be inf or point');
  if (P.source === 'point' && !(Array.isArray(P.obj) && P.obj.length === 2 && P.obj.every(Number.isFinite))) out.push('op2-bench: obj must be [z, y]');
  if (!['paraxial', 'exact'].includes(P.trace)) out.push('op2-bench: trace must be paraxial or exact');
  if (!(Array.isArray(P.fill) && P.fill.length === 2)) out.push('op2-bench: fill must be [lo, hi]');
  for (const m of P.marks || []) if (!MARKS.includes(m)) out.push(`op2-bench: unknown mark ${m}`);
  for (const r of [...(P.readouts || []), ...(P.hide || [])]) if (!ROWS.includes(r) && !MARKS.includes(r)) out.push(`op2-bench: unknown readout or mark ${r}`);
  for (const v of ['x', 'y']) if (P[v] !== null && !(Array.isArray(P[v]) && P[v].length === 2 && P[v][0] < P[v][1])) out.push(`op2-bench: ${v} must be null or [lo, hi]`);
  for (const c of P.controls || []) {
    if (!c.key || typeof c.label !== 'string' || !(c.min < c.max) || typeof c.value !== 'number' || !c.explain) out.push(`op2-bench: control ${c.key} needs key, label, min < max, value and explain`);
    if (!(c.set === 'angle' || c.set === 'objz' || c.set === 'objy' || (Array.isArray(c.set) && c.set.every((s) => Array.isArray(s) && ((s[0] === 'obj' && (s[1] === 0 || s[1] === 1)) || (P.elements[s[0]] && typeof s[1] === 'string')))))) out.push(`op2-bench: control ${c.key} set must be 'angle', 'objz', 'objy' or [[element, prop, scale, offset], …]`);
  }
  if (P.lambdas !== null && !(Array.isArray(P.lambdas) && P.lambdas.every((l) => l >= 380 && l <= 780))) out.push('op2-bench: lambdas must be wavelengths in nm (380–780)');
  return out;
}
