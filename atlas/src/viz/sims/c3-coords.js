// Cylindrical and spherical coordinates as three surfaces through a point.
// Cylindrical (ρ, φ, z): the cylinder ρ = const, the half-plane φ = const and
// the plane z = const. Spherical (r, θ, φ), physics convention — θ the polar
// angle from +z, φ the azimuth from +x: the sphere r = const, the cone
// θ = const and the half-plane φ = const. The point sits where its three
// surfaces meet; along each pair's intersection runs a coordinate curve, and
// the local unit vectors, tangent to those curves, ride with the point — so
// unlike x̂, ŷ, ẑ they differ from place to place. An optional small coordinate
// box shows the scale factors (dρ, ρ dφ, dz or dr, r dθ, r sin θ dφ).
//
//   { type: 'c3-coords', params: {
//       system: 'spherical',             // 'cylindrical' | 'spherical'; choose: true offers both (the point keeps its place)
//       point: [2.2, 55, 40],            // (ρ, φ°, z) or (r, θ°, φ°) — angles in degrees
//       sliders: true,                   // a slider for each coordinate
//       surfaces: ['r', 'theta', 'phi'], // which coordinate surfaces to draw; cylindrical keys are 'rho', 'phi', 'z'
//       basis: true,                     // the local unit vectors at the point
//       angles: true,                    // arcs marking φ (in the floor) and θ (down from +z)
//       guides: true,                    // dashed lines from the origin, and down to the point's shadow on the floor
//       curves: true,                    // the coordinate curves through the point
//       element: false,                  // the small coordinate box; elementToggle: true offers a switch
//       edgeLabels: true,                // the box edges' lengths as labels (dr, r dθ, r sin θ dφ …); false hides them
//       readouts: ['x', 'y', 'z'],       // any of x y z rho r theta phi (angles in degrees); [] for none
//       labels: true, pointLabel: 'P',   // TeX labels at the point and on the unit vectors
//       radius: 'rho',                   // the cylindrical radius's name: 'rho' (ρ, as in calculus books) or 's' (Griffiths)
//       range: 3, yaw, pitch, dist } }
//
// The geometry lives in model/c3-coords.js, tested in test/c3-coords.test.mjs.
// A picture must not show its answer: set readouts: [] (and maybe angles:
// false) when a question asks for a coordinate, and edgeLabels: false when it
// asks for the volume element.

import { View3D } from '../three-d.js';
import { tex } from '../../ui/dom.js';
import * as M from '../model/c3-coords.js';

export const defaults = {
  system: 'spherical', choose: false, point: null, sliders: true, surfaces: null, basis: true, angles: true, guides: true,
  curves: true, element: false, elementToggle: false, edgeLabels: true, readouts: ['x', 'y', 'z'], labels: true, pointLabel: 'P', range: 3,
};

const SYSTEMS = ['cylindrical', 'spherical'];
const SURF_KEYS = { cylindrical: ['rho', 'phi', 'z'], spherical: ['r', 'theta', 'phi'] };
const READOUTS = ['x', 'y', 'z', 'rho', 'r', 'theta', 'phi'];
const DEG = Math.PI / 180;
const CSSVAR = { accent: '--accent', good: '--good', warn: '--warn', violet: '--violet', gold: '--gold', teal: '--teal', ink: '--ink', ink2: '--ink-2', ink3: '--ink-3' };
const cssColor = (n) => `var(${CSSVAR[n] || '--ink'})`;
const DEFAULT_POINT = { cylindrical: [2, 50, 1.2], spherical: [2.4, 50, 40] };

export function mount(F, P) {
  const R = P.range;
  const { canvas, overlay } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'Coordinate surfaces through a point — drag to turn the picture' });
  // the point, in both systems' slider keys; switching systems keeps it in place
  const start = P.point || DEFAULT_POINT[P.system];
  // look from about 75° round from the point's own azimuth, so its half-plane is seen face on
  const phi0 = (P.system === 'spherical' ? start[2] : start[1]) * DEG;
  const view = new View3D(canvas, { yaw: P.yaw ?? phi0 - 75 * DEG, pitch: P.pitch ?? 0.36, dist: P.dist ?? R * 3.9, target: P.target || [0, 0, 0.1 * R], scale: P.scale ?? 1.25 });
  view.onChange = () => draw();
  const sysNow = () => (P.choose ? F.params.sys : P.system);
  const state = {};
  const setFrom = (sys, q) => {
    if (sys === 'cylindrical') { state.cr = q[0]; state.cp = q[1]; state.cz = q[2]; } else { state.sr = q[0]; state.st = q[1]; state.sp = q[2]; }
  };
  setFrom(P.system, start);
  // fill the other system from the same Cartesian point
  const toOther = (sys) => {
    const xyz = cart(sys);
    if (sys === 'cylindrical') { const [r, th, ph] = M.cartToSph(...xyz); setFrom('spherical', [r, th / DEG, ph / DEG]); }
    else { const [rho, ph, z] = M.cartToCyl(...xyz); setFrom('cylindrical', [rho, ph / DEG, z]); }
  };
  const cart = (sys) => (sys === 'cylindrical' ? M.cylToCart(state.cr, state.cp * DEG, state.cz) : M.sphToCart(state.sr, state.st * DEG, state.sp * DEG));
  toOther(P.system);

  const RHO = P.radius === 's' ? 's' : '\\rho', RHO_TEXT = P.radius === 's' ? 's' : 'ρ';
  const ctrls = {};
  if (P.choose) F.choice({ key: 'sys', label: 'Coordinates', options: [['cylindrical', `Cylindrical (${RHO_TEXT}, φ, z)`], ['spherical', 'Spherical (r, θ, φ)']], value: P.system, explain: 'The same point, described two ways.' });
  if (P.sliders) {
    const add = (sys, spec) => { if (P.choose || sys === P.system) ctrls[spec.key] = { sys, c: F.slider({ ...spec, value: +(+state[spec.key]).toFixed(2) }) }; };
    add('cylindrical', { key: 'cr', label: `$${RHO}$ (distance from the $z$-axis)`, min: 0, max: R, step: 0.05, explain: 'How far from the $z$-axis: the radius of the cylinder.' });
    add('cylindrical', { key: 'cp', label: '$\\phi$ (azimuth)', min: 0, max: 360, step: 1, unit: '^\\circ', explain: 'The angle around the $z$-axis, from $+x$ toward $+y$.' });
    add('cylindrical', { key: 'cz', label: '$z$ (height)', min: -R * 0.85, max: R * 0.85, step: 0.05, explain: 'Height above the $xy$-plane, as in Cartesian coordinates.' });
    add('spherical', { key: 'sr', label: '$r$ (distance from the origin)', min: 0, max: R, step: 0.05, explain: 'How far from the origin: the radius of the sphere.' });
    add('spherical', { key: 'st', label: '$\\theta$ (polar angle, from $+z$)', min: 0, max: 180, step: 1, unit: '^\\circ', explain: 'Down from the north pole: $0^\\circ$ on the $+z$-axis, $90^\\circ$ in the $xy$-plane. The colatitude: $90^\\circ$ minus latitude.' });
    add('spherical', { key: 'sp', label: '$\\phi$ (azimuth)', min: 0, max: 360, step: 1, unit: '^\\circ', explain: 'Around the $z$-axis from $+x$ toward $+y$: the longitude, east positive.' });
  }
  let showEl = !!P.element;
  if (P.elementToggle) F.toggle({ key: 'el', label: 'Show the small coordinate box', value: showEl, explain: 'Edges made by nudging each coordinate a little: their lengths are the scale factors.' });
  const paintSliders = () => { for (const k in ctrls) ctrls[k].c.node.style.display = ctrls[k].sys === sysNow() ? '' : 'none'; };
  paintSliders();
  F.onChange((key) => {
    if (key === 'sys') {
      // carry the point across: the old system's sliders define it
      const old = F.params.sys === 'spherical' ? 'cylindrical' : 'spherical';
      toOther(old);
      for (const k of ['cr', 'cp', 'cz', 'sr', 'st', 'sp']) if (ctrls[k] && ctrls[k].sys === F.params.sys) ctrls[k].c.set(+(+state[k]).toFixed(2));
      paintSliders();
    } else if (key in state) state[key] = F.params[key];
    if (key === 'el') showEl = !!F.params.el;
    draw();
  });

  const pool = [];
  const hint = document.createElement('div');
  hint.textContent = 'drag to rotate';
  Object.assign(hint.style, { position: 'absolute', right: '10px', bottom: '6px', fontSize: '.72rem', color: 'var(--ink-3)' });
  overlay.append(hint);

  function draw() {
    const sys = sysNow(), sph = sys === 'spherical';
    const H = R * 0.9, marks = [];
    view.begin();
    view.axes(R * 1.12, ['x', 'y', 'z']);
    for (const k of [-R, 0].filter((v) => v < 0)) view.line([[0, 0, k], [0, 0, 0]], { color: 'ink4', width: 1, dash: [3, 4], bias: 0 });
    for (const rr of [1, 2, 3].filter((v) => v <= R)) view.line(M.curve((a) => [rr * Math.cos(a), rr * Math.sin(a), 0], 0, 2 * Math.PI, 72), { color: 'ink4', width: 0.7, bias: -0.2 });
    const p = cart(sys);
    const [rho, phiC, zC] = [state.cr, state.cp * DEG, state.cz];
    const [rS, thS, phS] = [state.sr, state.st * DEG, state.sp * DEG];
    const phi = sph ? phS : phiC;
    const want = new Set(P.surfaces || SURF_KEYS[sys]);
    // coordinate surfaces
    if (sph) {
      if (want.has('r') && rS > 0.02) view.surface(M.surfaces.sphere(rS), { color: 'teal', alpha: 0.07, wire: false });
      if (want.has('theta')) view.surface(M.surfaces.cone(thS, R), { color: 'violet', alpha: 0.16, wire: false });
      if (want.has('phi')) view.surface(M.surfaces.halfPlane(phS, R, H), { color: 'gold', alpha: 0.13, wire: false });
    } else {
      if (want.has('rho') && rho > 0.02) view.surface(M.surfaces.cylinder(rho, H), { color: 'teal', alpha: 0.08, wire: false });
      if (want.has('phi')) view.surface(M.surfaces.halfPlane(phiC, R, H), { color: 'gold', alpha: 0.13, wire: false });
      if (want.has('z')) view.surface(M.surfaces.disc(zC, R), { color: 'violet', alpha: 0.13, wire: false });
    }
    // coordinate curves through the point, coloured like the unit vector tangent to each
    if (P.curves !== false) {
      if (sph) {
        view.line(M.curve((s) => M.sphToCart(s, thS, phS), 0, R), { color: 'accent', width: 2, bias: 0.03 });                   // r varies
        view.line(M.curve((a) => M.sphToCart(rS, a, phS), 0, Math.PI), { color: 'good', width: 2, bias: 0.03 });               // θ varies: a meridian
        view.line(M.curve((a) => M.sphToCart(rS, thS, a), 0, 2 * Math.PI, 96), { color: 'warn', width: 2, bias: 0.03 });       // φ varies: a circle of latitude
      } else {
        view.line(M.curve((s) => M.cylToCart(s, phiC, zC), 0, R), { color: 'accent', width: 2, bias: 0.03 });
        view.line(M.curve((a) => M.cylToCart(rho, a, zC), 0, 2 * Math.PI, 96), { color: 'warn', width: 2, bias: 0.03 });
        view.line([M.cylToCart(rho, phiC, -H), M.cylToCart(rho, phiC, H)], { color: 'violet', width: 2, bias: 0.03 });
      }
    }
    // guides: origin to the point, and the point's shadow on the floor
    if (P.guides !== false) {
      const shadow = [p[0], p[1], 0];
      view.line([[0, 0, 0], shadow], { color: 'ink2', width: 1.3, dash: [5, 4], bias: 0.02 });
      view.line([shadow, p], { color: 'ink2', width: 1.3, dash: [5, 4], bias: 0.02 });
      if (sph) view.line([[0, 0, 0], p], { color: 'ink2', width: 1.3, dash: [5, 4], bias: 0.02 });
      else view.line([[0, 0, zC], p], { color: 'ink2', width: 1.3, dash: [5, 4], bias: 0.02 });
    }
    // angle arcs
    if (P.angles !== false) {
      const fr = sph ? rS * Math.sin(thS) : rho, ra = Math.max(0.35, Math.min(0.9, 0.45 * Math.max(fr, 1)));
      const arc = M.curve((a) => [ra * Math.cos(a), ra * Math.sin(a), 0], 0, phi, 40);
      view.line(arc, { color: 'warn', width: 2.2, bias: 0.05 });
      marks.push([[1.25 * ra * Math.cos(phi / 2), 1.25 * ra * Math.sin(phi / 2), 0], '\\phi', 'warn', [0, 0]]);
      if (sph) {
        const rt = Math.max(0.4, Math.min(1.1, 0.45 * Math.max(rS, 1)));
        view.line(M.curve((a) => M.sphToCart(rt, a, phS), 0, thS, 40), { color: 'good', width: 2.2, bias: 0.05 });
        marks.push([M.sphToCart(1.3 * rt, thS / 2, phS), '\\theta', 'good', [0, 0]]);
      }
    }
    // the coordinate box
    if (showEl) {
      const q = sph ? [rS, thS, phS] : [rho, phiC, zC];
      const d = sph ? [0.45 * R / 3, 20 * DEG, 26 * DEG] : [0.45 * R / 3, 24 * DEG, 0.45 * R / 3];
      const edges = M.element(sys, q, d);
      for (const e of edges) view.line(e.pts, { color: 'gold', width: 1.8, bias: 0.06 });
      const names = sph ? ['dr', 'r\\,d\\theta', 'r\\sin\\theta\\,d\\phi'] : [`d${RHO}`, `${RHO}\\,d\\phi`, 'dz'];
      // label the three edges through the base corner, pushed away from the box's middle on screen
      const all = edges.flatMap((e) => e.pts), mid = [0, 1, 2].map((k) => all.reduce((s, q2) => s + q2[k], 0) / all.length);
      const [mx, my] = view.project(mid), placed = [];
      for (let axis = 0; axis < 3 && P.edgeLabels !== false; axis++) {
        const e = edges.find((g) => g.axis === axis), at = e.pts[Math.floor(e.pts.length / 2)];
        const [sx, sy] = view.project(at), len = Math.hypot(sx - mx, sy - my) || 1, ux = (sx - mx) / len, uy = (sy - my) / len;
        // push the label outward until it clears the ones already placed
        let push = 18;
        while (push < 90 && placed.some(([px, py]) => Math.hypot(sx + push * ux - px, sy + push * uy - py) < 34)) push += 14;
        placed.push([sx + push * ux, sy + push * uy]);
        marks.push([at, names[axis], 'gold', [push * ux - 8, push * uy - 8]]);
      }
    }
    // the point and its unit vectors
    view.point(p, { color: 'gold', r: 5 });
    if (P.labels !== false && P.pointLabel) marks.push([p, P.pointLabel, 'gold', [12, -12]]);
    if (P.basis !== false) {
      const B = sph ? M.sphBasis(thS, phS) : M.cylBasis(phiC);
      const names = sph ? ['\\hat r', '\\hat\\theta', '\\hat\\phi'] : [`\\hat ${RHO}`, '\\hat\\phi', '\\hat z'];
      const cols = sph ? ['accent', 'good', 'warn'] : ['accent', 'warn', 'violet'];
      const L = 0.32 * R;
      B.forEach((u, k) => {
        const tip = [p[0] + L * u[0], p[1] + L * u[1], p[2] + L * u[2]];
        view.arrow(p, tip, { color: cols[k], width: 2.6, bias: 0.08 });
        if (P.labels !== false) marks.push([[p[0] + 1.3 * L * u[0], p[1] + 1.3 * L * u[1], p[2] + 1.3 * L * u[2]], names[k], cols[k], [0, 0]]);
      });
    }
    view.end();

    // TeX labels at projected points
    marks.forEach(([pt, label, color, [dx, dy]], k) => {
      let el = pool[k];
      if (!el) { el = document.createElement('div'); el.className = 'lbl'; overlay.append(el); pool.push(el); }
      const [sx, sy, depth] = view.project(pt);
      el.style.display = depth > 0.05 ? '' : 'none';
      el.style.left = `${sx + dx}px`; el.style.top = `${sy + dy}px`;
      el.style.color = cssColor(color);
      if (el.dataset.src !== label) { el.dataset.src = label; el.innerHTML = tex(label); }
    });
    for (let k = marks.length; k < pool.length; k++) pool[k].style.display = 'none';

    const rows = [];
    const [cr] = M.cartToCyl(...p), [sr, st] = M.cartToSph(...p);
    const num = (v) => (Math.abs(v) < 5e-4 ? '0' : String(+v.toFixed(2)));
    const VALS = { x: ['$x$', num(p[0])], y: ['$y$', num(p[1])], z: ['$z$', num(p[2])], rho: [`$${RHO}$`, num(cr)], r: ['$r$', num(sr)],
      theta: ['$\\theta$', `${num(sph ? state.st : st / DEG)}^\\circ`], phi: ['$\\phi$', `${num(sph ? state.sp : state.cp)}^\\circ`] };
    for (const k of P.readouts || []) rows.push(VALS[k]);
    if (rows.length) F.readout(rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'Drag to rotate; scroll or pinch to zoom. Physics convention: θ is measured down from +z, φ around from +x. Surfaces are drawn to a finite size.');
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  if (!SYSTEMS.includes(P.system)) problems.push(`c3-coords: system must be ${SYSTEMS.join(' or ')}`);
  if (!(P.range > 0)) problems.push('c3-coords: range must be positive');
  if (P.radius !== undefined && P.radius !== 'rho' && P.radius !== 's') problems.push("c3-coords: radius is 'rho' or 's'");
  if (P.point) {
    if (!(Array.isArray(P.point) && P.point.length === 3 && P.point.every(Number.isFinite))) problems.push('c3-coords: point must be three numbers');
    else if (P.system === 'spherical' && (P.point[0] < 0 || P.point[0] > P.range || P.point[1] < 0 || P.point[1] > 180 || P.point[2] < 0 || P.point[2] > 360)) problems.push('c3-coords: spherical point must have 0 ≤ r ≤ range, 0 ≤ θ ≤ 180, 0 ≤ φ ≤ 360 (degrees)');
    else if (P.system === 'cylindrical' && (P.point[0] < 0 || P.point[0] > P.range || P.point[1] < 0 || P.point[1] > 360 || Math.abs(P.point[2]) > P.range * 0.85)) problems.push('c3-coords: cylindrical point must have 0 ≤ ρ ≤ range, 0 ≤ φ ≤ 360 (degrees), |z| ≤ 0.85 range');
  }
  if (P.surfaces) for (const s of P.surfaces) if (!SURF_KEYS[P.system]?.includes(s) && !(P.choose && [...SURF_KEYS.cylindrical, ...SURF_KEYS.spherical].includes(s))) problems.push(`c3-coords: unknown surface “${s}” for ${P.system} coordinates`);
  for (const r of P.readouts || []) if (!READOUTS.includes(r)) problems.push(`c3-coords: unknown readout “${r}” (use ${READOUTS.join(', ')})`);
  if (P.edgeLabels != null && typeof P.edgeLabels !== 'boolean') problems.push('c3-coords: edgeLabels must be true or false');
  return problems;
}
