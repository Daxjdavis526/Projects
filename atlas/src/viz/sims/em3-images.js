// The method of images. A point charge you drag beside a grounded conducting
// plane, or outside a conducting sphere (grounded, or isolated and neutral).
// Field lines leave the charge spaced by equal flux in 3D, so the share of
// them that lands on the conductor follows the induced charge (all of them
// for the plane; R/a of them for a grounded sphere). Show the image and the
// mirror world appears: the image charge behind the surface and the lines
// carried on through the metal (dashed) to it — the field outside is exactly
// that of the charge and its image. The surface is shaded by its induced
// charge, and a panel plots σ along it. Readouts: the image's size and place,
// the total induced charge, the force on the charge, σ at the nearest point.
// Model in model/em3-images.js (tested headlessly in test/em3-images.test.mjs).
//
//   { type: 'em3-images', params: {
//       geometry: 'plane',      // plane | sphere
//       q: 5,                   // the charge (nC; a slider when 'q' is in controls)
//       pos: [0, 3],            // the charge's position (cm): plane y = 0 below it; sphere centred at the origin
//       R: 3,                   // the sphere's radius (cm)
//       ground: 'grounded',     // sphere: grounded | neutral (isolated, no net charge)
//       x: null, y: null,       // the view (cm); a sensible default from the geometry
//       image: true,            // draw the image charge and the dashed lines through the metal
//       lines: 8,               // field lines per side (0: none)
//       equip: false,           // equipotentials (outside the metal)
//       shade: true,            // shade the surface by its induced charge
//       force: true,            // the force arrow on the charge
//       panel: null,            // the σ-along-the-surface panel (default: in the Explore step)
//       drag: true,             // drag the charge
//       controls: null,         // true, false, or a list of: q ground image equip
//       readout: true,
//       hide: [],               // readouts shown as “?”: image where induced force sigma V
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/em3-images.js';
import { sampleGrid, contourSegments } from '../model/c3-contour.js';

export const defaults = {
  geometry: 'plane', q: 5, pos: [0, 3], R: 3, ground: 'grounded', x: null, y: null,
  image: true, lines: 8, equip: false, shade: true, force: true, panel: null, drag: true,
  controls: null, readout: true, hide: [],
};
const CONTROLS = ['q', 'ground', 'image', 'equip'];
const HIDE = ['image', 'where', 'induced', 'force', 'sigma', 'V'];
const CM = 0.01, NC = 1e-9;
const f3 = (x) => (Math.abs(x) < 5e-4 ? '0' : String(+x.toPrecision(3)));
const tx = (v) => { if (v === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(v))); return Math.abs(e) < 3 ? String(+v.toPrecision(3)) : `${+(v / 10 ** e).toFixed(2)}\\times10^{${e}}`; };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const plane = P.geometry === 'plane';
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? (plane ? ['q', 'image', 'equip'] : ['q', 'ground', 'image', 'equip']) : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make, value) => (wanted.includes(key) ? make() : (F.params[key] = value));
  ctl('q', () => F.slider({ key: 'q', label: 'Charge $q$', min: -10, max: 10, step: 0.5, value: P.q, unit: '\\text{nC}', explain: 'The real charge. Its image always has the opposite sign.' }), P.q);
  if (!plane) ctl('ground', () => F.choice({ key: 'ground', label: 'The sphere', options: [['grounded', 'grounded'], ['neutral', 'isolated, neutral']], value: P.ground, explain: 'Grounded: held at V = 0, charge flows in from the ground. Isolated and neutral: no net charge, so a second image, +qR/a, sits at the centre.' }), P.ground);
  ctl('image', () => F.toggle({ key: 'image', label: 'Show the image', value: P.image, explain: 'The fictitious charge behind the surface that makes the surface an equipotential.' }), P.image);
  ctl('equip', () => F.toggle({ key: 'equip', label: 'Equipotentials', value: P.equip, explain: 'Surfaces of constant V, outside the metal.' }), P.equip);

  const R = P.R;
  const vx = P.x || (plane ? [-8, 8] : [-9, 9]), vy = P.y || (plane ? [-4.5, 7] : [-5.5, 5.5]);
  const a = F.canvas({ aspect: 'wide', label: P.alt || (plane ? 'A point charge above a grounded conducting plane' : 'A point charge outside a conducting sphere') });
  const plot = new Plot(a.canvas, { x: vx, y: vy, equal: true, axes: false, grid: false });
  const showPanel = P.panel ?? !F.compact;
  let pp = null;
  if (showPanel) {
    const b = F.canvas({ aspect: 'wide', label: 'The induced surface charge density along the conductor' });
    pp = new Plot(b.canvas, { x: [0, 1], y: [-1, 0.2], xlabel: plane ? 'x along the plane (cm)' : 'angle from the point nearest the charge (°)', ylabel: 'σ (nC/m²)', axesAt: 'edge' });
  }

  const pos = { x: P.pos[0], y: P.pos[1] };
  const clampPos = (x, y) => {
    if (plane) return [x, Math.max(0.6, y)];
    const m = Math.hypot(x, y), lo = R * 1.12;
    return m < lo ? [(x / (m || 1)) * lo, (y / (m || 1)) * lo] : [x, y];
  };
  if (P.drag !== false) {
    plot.handle(() => [pos.x, pos.y], (x, y) => { [pos.x, pos.y] = clampPos(Math.max(vx[0], Math.min(vx[1], x)), Math.max(vy[0], Math.min(vy[1], y))); }, { hollow: true, label: 'charge' });
    plot.onDrag = () => draw();
  }
  const sceneNow = () => M.scene({ geometry: P.geometry, q: F.params.q * NC, x: pos.x * CM, y: pos.y * CM, R: R * CM, ground: F.params.ground ?? P.ground });

  function draw() {
    plot.clear();
    const S = sceneNow(), g = plot.ctx, col = plot.col;
    const narrow = (a.canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    const box = [plot.vx0 * CM, plot.vx1 * CM, plot.vy0 * CM, plot.vy1 * CM];
    const showImg = !!F.params.image;
    // the metal
    if (plane) {
      plot.rect(plot.vx0, plot.vy0, plot.vx1 - plot.vx0, -plot.vy0, { fill: 'ink3', alpha: showImg ? 0.12 : 0.3, stroke: false });
    } else {
      plot.circle(0, 0, R, { fill: 'ink3', alpha: showImg ? 0.12 : 0.3, stroke: false });
    }
    // equipotentials, outside the metal
    if (F.params.equip) {
      const nx = 120, ny = Math.round((nx * (plot.vy1 - plot.vy0)) / (plot.vx1 - plot.vx0));
      const grid = sampleGrid((x, y) => (M.outside(S, x * CM, y * CM) ? M.potential(S, x * CM, y * CM) : NaN), [plot.vx0, plot.vx1], [plot.vy0, plot.vy1], nx, ny);
      const V0 = (M.K * Math.abs(S.q)) / (plane ? S.y : S.a - S.R), sgn = Math.sign(S.q) || 1;
      const lv = [0.1, 0.2, 0.35, 0.5, 0.75, 1, 1.5, 2.5, 4].map((f) => sgn * f * V0);
      if (!plane && S.ground === 'neutral') lv.push(M.conductorV(S) * 0.999, -0.1 * sgn * V0, -0.2 * sgn * V0);
      for (const c of lv) for (const [p, q] of contourSegments(grid, c)) plot.line(p[0], p[1], q[0], q[1], { color: 'violet', width: 1.2, alpha: 0.75 });
    }
    // field lines: real ones (solid) and their continuation through the metal (dashed)
    const nL = P.lines | 0, ds = ((plot.vx1 - plot.vx0) * CM) / 400, sg = Math.sign(S.q) || 1;
    if (nL > 0 && S.q !== 0) {
      for (const [ux, uy] of M.starts(S, nL)) {
        const x0 = S.x + ux * ds * 2, y0 = S.y + uy * ds * 2;
        const L = M.line(S, x0, y0, sg, box, { ds });
        plot.path(L.pts.map(([x, y]) => [x / CM, y / CM]), { color: 'accent', width: 1.6, alpha: 0.9 });
        // an arrowhead partway along
        const m = L.pts[Math.min(L.pts.length - 1, Math.floor(L.pts.length * 0.35))], m2 = L.pts[Math.min(L.pts.length - 1, Math.floor(L.pts.length * 0.35) + 2)];
        if (m && m2 && L.pts.length > 8) {
          const [ax0, ay0, ax1, ay1] = sg > 0 ? [m[0], m[1], m2[0], m2[1]] : [m2[0], m2[1], m[0], m[1]];
          plot.arrow(ax0 / CM, ay0 / CM, ax1 / CM, ay1 / CM, { color: 'accent', width: 1.6, head: 7 });
        }
        if (showImg && L.end === 'conductor') {
          const e = L.pts[L.pts.length - 1];
          const T = M.line(S, e[0], e[1], sg, box, { ds, through: true, max: 3000 });
          plot.path(T.pts.map(([x, y]) => [x / CM, y / CM]), { color: 'accent', width: 1.2, alpha: 0.55, dash: [4, 4] });
        }
      }
    }
    // an isolated sphere: lines from (or to) the patch whose charge has the sign of q, spaced by equal flux
    if (nL > 0 && S.q !== 0 && !plane && S.ground !== 'grounded') {
      const th0 = Math.atan2(S.y, S.x), N = 720, cum = [0];
      for (let k = 1; k <= N; k++) { const gm = (Math.PI * (k - 0.5)) / N, sv = M.sigma(S, Math.cos(th0 + gm), Math.sin(th0 + gm)); cum.push(cum[k - 1] + Math.max(0, sg * sv) * 2 * Math.PI * S.R * S.R * Math.sin(gm) * (Math.PI / N)); }
      const np = Math.round((nL * cum[N]) / Math.abs(S.q));
      for (let k = 0; k < np; k++) {
        const target = ((k + 0.5) / np) * cum[N];
        let j = 1; while (j < N && cum[j] < target) j++;
        const gm = (Math.PI * j) / N;
        for (const side of [1, -1]) {
          const t = th0 + side * gm, rr = S.R * 1.004;
          const L = M.line(S, rr * Math.cos(t), rr * Math.sin(t), sg, box, { ds });
          plot.path(L.pts.map(([x, y]) => [x / CM, y / CM]), { color: 'accent', width: 1.6, alpha: 0.9 });
        }
      }
    }
    // the surface, shaded by σ
    const sigAt = (t) => (plane ? M.sigma(S, t * CM) : M.sigma(S, Math.cos(t), Math.sin(t)));
    if (P.shade !== false) {
      const N = 160, sv = [], ts = [];
      for (let k = 0; k <= N; k++) { const t = plane ? plot.vx0 + ((plot.vx1 - plot.vx0) * k) / N : (2 * Math.PI * k) / N; ts.push(t); sv.push(sigAt(t)); }
      const smax = Math.max(...sv.map(Math.abs)) || 1;
      for (let k = 0; k < N; k++) {
        const s = (sv[k] + sv[k + 1]) / 2, al = Math.min(1, Math.abs(s) / smax) ** 0.6;
        const c = s < 0 ? 'accent' : 'warn';
        if (plane) plot.line(ts[k], 0, ts[k + 1], 0, { color: c, width: 7, alpha: 0.15 + 0.85 * al });
        else plot.line(R * Math.cos(ts[k]), R * Math.sin(ts[k]), R * Math.cos(ts[k + 1]), R * Math.sin(ts[k + 1]), { color: c, width: 7, alpha: 0.15 + 0.85 * al });
      }
    }
    if (plane) plot.line(plot.vx0, 0, plot.vx1, 0, { color: 'ink2', width: 1.5 });
    else plot.circle(0, 0, R, { color: 'ink2', width: 1.5 });
    plot.text(plane ? 'grounded conducting plane, V = 0' : (S.ground === 'grounded' ? 'grounded sphere, V = 0' : 'isolated neutral sphere'), plane ? plot.vx0 : 0, plane ? 0 : -R, { dx: plane ? 8 : 0, dy: 16, align: plane ? 'left' : 'center', size: fs - 0.5, color: 'ink2' });
    // the images
    if (showImg) for (const im of S.images) {
      const X = im.x / CM, Y = im.y / CM, r = 7 + 5 * Math.sqrt(Math.min(1, Math.abs(im.q / S.q)));
      g.save(); g.setLineDash([3, 3]); g.strokeStyle = col[im.q < 0 ? 'accent' : 'warn']; g.lineWidth = 2;
      g.beginPath(); g.arc(plot.X(X), plot.Y(Y), r, 0, 2 * Math.PI); g.stroke(); g.restore();
      plot.text(im.q < 0 ? '−' : '+', X, Y, { align: 'center', size: 14, weight: 700, color: im.q < 0 ? 'accent' : 'warn' });
      const name = im.centre ? 'image +qR/a' : plane ? 'image −q' : 'image −qR/a';
      plot.text(name, X, Y, { align: 'center', dy: r + 10, size: fs - 0.5, color: 'ink2' });
    }
    // the real charge and the force on it
    const qc = S.q >= 0 ? 'warn' : 'accent', r0 = 9 + 4 * Math.sqrt(Math.min(1, Math.abs(F.params.q) / 10));
    g.save(); g.fillStyle = col[qc]; g.beginPath(); g.arc(plot.X(pos.x), plot.Y(pos.y), r0, 0, 2 * Math.PI); g.fill(); g.restore();
    plot.text(S.q < 0 ? '−' : '+', pos.x, pos.y, { align: 'center', size: 15, weight: 700, color: 'bg', halo: false });
    if (P.force !== false && S.q !== 0) {
      const Fv = M.force(S), m = Math.hypot(Fv[0], Fv[1]);
      if (m > 0) { const Lp = 46; plot.arrowPx(pos.x, pos.y, (Fv[0] / m) * Lp, (Fv[1] / m) * Lp, { color: 'gold', width: 2.6, label: 'F', ldx: 6, ldy: -6 }); }
    }
    plot.drawHandles();
    drawPanel(S, sigAt);
    readouts(S, sigAt);
  }

  function drawPanel(S, sigAt) {
    if (!pp) return;
    const pts = [];
    if (plane) { for (let k = 0; k <= 300; k++) { const x = plot.vx0 + ((plot.vx1 - plot.vx0) * k) / 300; pts.push([x, sigAt(x) / NC]); } }
    else {
      const th0 = Math.atan2(S.y, S.x);
      for (let k = 0; k <= 180; k++) pts.push([k, sigAt(th0 + (k * Math.PI) / 180) / NC]);
    }
    let lo = Math.min(0, ...pts.map((p) => p[1])), hi = Math.max(0, ...pts.map((p) => p[1]));
    const pad = 0.12 * (hi - lo || 1);
    pp.setView([pts[0][0], pts[pts.length - 1][0]], [lo - pad, hi + pad]);
    pp.clear();
    pp.path(pts, { color: S.q > 0 ? 'accent' : 'warn', width: 2.2, fill: S.q > 0 ? 'accent' : 'warn', fillAlpha: 0.12 });
    pp.line(pts[0][0], 0, pts[pts.length - 1][0], 0, { color: 'ink3', width: 1 });
  }

  function readouts(S, sigAt) {
    if (P.readout === false) { F.readout([]); return; }
    const q = (k, v) => (hide.has(k) ? '?' : v);
    const rows = [];
    const ims = S.images.filter((i) => !i.centre), im = ims[0];
    if (plane) rows.push(['height $d$', `${f3(pos.y)}\\,\\text{cm}`]);
    else rows.push(['distance $a$', `${f3(Math.hypot(pos.x, pos.y))}\\,\\text{cm}`]);
    rows.push(['image charge', q('image', `${f3(im.q / NC)}\\,\\text{nC}`)]);
    rows.push([plane ? 'image depth below the plane' : 'image distance from the centre', q('where', `${f3((plane ? Math.abs(im.y) : Math.hypot(im.x, im.y)) / CM)}\\,\\text{cm}`)]);
    rows.push(['total induced charge', q('induced', `${f3(M.induced(S) / NC)}\\,\\text{nC}`)]);
    const Fv = M.force(S);
    rows.push(['force on $q$', q('force', `${tx(Math.hypot(Fv[0], Fv[1]))}\\,\\text{N}`)]);
    const near = plane ? sigAt(pos.x) : sigAt(Math.atan2(S.y, S.x));
    rows.push(['$\\sigma$ at the nearest point', q('sigma', `${tx(near / NC)}\\,\\text{nC/m}^2`)]);
    if (!plane && S.ground !== 'grounded') rows.push(['sphere’s potential', q('V', `${tx(M.conductorV(S))}\\,\\text{V}`)]);
    F.readout(rows);
  }

  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || 'A slice through the charge and the axis of symmetry. Field lines leave the charge spaced by equal flux in three dimensions, so the share reaching the conductor follows the induced charge. The image and the dashed lines inside the metal are bookkeeping: the true field in the metal is zero.');
  return { get: (k) => (k === 'point' ? { x: pos.x, y: pos.y } : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!['plane', 'sphere'].includes(P.geometry)) p.push('em3-images: geometry is plane or sphere');
  if (!(Number.isFinite(P.q) && Math.abs(P.q) <= 10)) p.push('em3-images: q is a number of nC in −10…10');
  if (!(Array.isArray(P.pos) && P.pos.length === 2 && P.pos.every(Number.isFinite))) p.push('em3-images: pos is [x, y] in cm');
  else if (P.geometry === 'plane' && !(P.pos[1] > 0)) p.push('em3-images: the charge must be above the plane (pos[1] > 0)');
  else if (P.geometry === 'sphere' && !(Math.hypot(P.pos[0], P.pos[1]) > P.R)) p.push('em3-images: the charge must be outside the sphere');
  if (!(P.R > 0)) p.push('em3-images: R must be positive');
  if (!['grounded', 'neutral'].includes(P.ground)) p.push('em3-images: ground is grounded or neutral');
  for (const k of ['x', 'y']) if (P[k] !== null && !(Array.isArray(P[k]) && P[k].length === 2 && P[k][0] < P[k][1])) p.push(`em3-images: ${k} is a range [lo, hi] in cm`);
  if (!(Number.isInteger(P.lines) && P.lines >= 0 && P.lines <= 20)) p.push('em3-images: lines is 0–20 per side');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`em3-images: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`em3-images: unknown hide “${h}”`);
  return p;
}
