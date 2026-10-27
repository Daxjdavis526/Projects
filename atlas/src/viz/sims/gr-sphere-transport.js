// Carrying an arrow around a loop on a sphere without ever turning it
// (parallel transport). Along each straight (great-circle) leg the arrow
// keeps its angle to the path; around the whole loop it comes back rotated
// by the enclosed area divided by R². On a flat sheet it would come back
// unchanged: the rotation measures curvature. Physics in model/gr-sphere.js.
//
//   mode 'triangle' — a geodesic triangle with one corner at the north pole
//     and two at a set distance from it, a set angle apart.
//   mode 'cap' — a circle of latitude, travelled eastward (the loop of a
//     Foucault pendulum carried round by the Earth in one sidereal day).
//     measure: true adds the circle’s radius and circumference measured on
//     the surface, against the flat-plane 2π × radius. transport: false draws
//     only the loop (no arrow), for measuring; readout: false hides the numbers.
//
//   { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 90, colat: 90, progress: 1 } }

import { View3D } from '../three-d.js';
import { sph, geodesicPolygon, latitudeCircle, transport, tangentAngle, toward, northEast, triangle, capArea, wrap2pi } from '../model/gr-sphere.js';

export const defaults = { mode: 'triangle', dphi: 90, colat: 90, lat: 60, progress: 1, colatSlider: true, measure: false, transport: true, readout: true, yaw: null, pitch: null };

const DEG = Math.PI / 180;
const ARROW = 0.3;                                // drawn arrow length (sphere radius 1)

export function mount(F, P) {
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A sphere with a loop drawn on it and an arrow carried around the loop' });
  const tri = P.mode !== 'cap';
  if (tri) {
    F.slider({ key: 'dphi', label: 'Angle at the north pole', min: 10, max: 170, step: 5, value: P.dphi, unit: '^\\circ', explain: 'How far apart the two lower corners are, in longitude.' });
    if (P.colatSlider !== false) F.slider({ key: 'colat', label: 'Lower corners: distance from the pole', min: 20, max: 90, step: 5, value: P.colat, unit: '^\\circ', explain: 'At 90° they sit on the equator. Smaller triangles enclose less area.' });
    else F.params.colat = P.colat;
  } else {
    F.slider({ key: 'lat', label: 'Latitude of the circle $\\lambda$', min: 5, max: 85, step: 1, value: P.lat, unit: '^\\circ', explain: P.transport === false ? 'Its radius $\\rho$ is measured from the pole along the surface: $\\rho = (90^\\circ - \\lambda)$ in radians, times $R$.' : 'The arrow is carried once around this circle, eastward.' });
  }
  const moving = P.transport !== false;
  if (moving) F.slider({ key: 'progress', label: 'How far around the loop', min: 0, max: 1, step: 0.005, value: P.progress, explain: 'Drag to carry the arrow along; at 100% it is back where it started.', fmt: (v) => `${Math.round(v * 100)}\\%` });
  if (!moving) F.params.progress = 1;
  let anim = null;
  if (moving) F.button({
    label: 'Play', primary: true,
    onClick: () => {
      if (F.params.progress >= 0.999) F.set('progress', 0);
      anim?.stop();
      anim = F.animate((dt) => { const s = Math.min(1, F.params.progress + dt / 7); F.set('progress', s); if (s >= 1) anim.stop(); }, { force: true });
    },
  });
  F.onDestroy(() => anim?.stop());

  const yaw0 = P.yaw ?? (tri ? (F.params.dphi * DEG) / 2 : -0.35);
  const view = new View3D(canvas, { yaw: yaw0, pitch: P.pitch ?? (tri ? 0.85 : 1.0), dist: 3.0 });
  let userMoved = false;
  view.onChange = () => { userMoved = true; draw(); };
  F.onChange((key) => { if (key === 'dphi' && !userMoved) view.yaw = (F.params.dphi * DEG) / 2; draw(); });

  // the sphere, slightly inside radius 1 so lines drawn on it stay on top
  const SPH = Array.from({ length: 25 }, (_, i) => Array.from({ length: 49 }, (_, j) => sph((Math.PI * i) / 24, (2 * Math.PI * j) / 48).map((v) => v * 0.992)));
  const EQUATOR = latitudeCircle(Math.PI / 2, { perRadian: 20 });

  let cache = { key: '' };
  function loop() {
    const key = tri ? `t${F.params.dphi}|${F.params.colat}` : `c${F.params.lat}`;
    if (cache.key === key) return cache;
    let path, v0, corners = [], ref;
    if (tri) {
      const N = [0, 0, 1], A = sph(F.params.colat * DEG, 0), B = sph(F.params.colat * DEG, F.params.dphi * DEG);
      ({ path, corners } = geodesicPolygon([N, A, B], { perRadian: 180 }));
      v0 = toward(N, A);
      const t = triangle(N, A, B);
      cache = { key, path, corners, verts: [N, A, B], angles: t.angles, area: t.excess };
      ref = 'path';
    } else {
      const th0 = (90 - F.params.lat) * DEG;
      path = latitudeCircle(th0, { perRadian: 360 });
      v0 = northEast(path[0]).north;
      cache = { key, path, corners: [0], verts: [path[0]], area: capArea(th0), th0 };
      ref = 'north';
    }
    cache.arrows = transport(path, v0);
    cache.ref = ref;
    cache.turn = wrap2pi(tangentAngle(path[0], v0, cache.arrows[cache.arrows.length - 1]));
    return cache;
  }

  function draw() {
    const L = loop();
    view.begin();
    view.surface(SPH, { color: 'accent', alpha: 0.8, wireAlpha: 0.07 });
    view.line(EQUATOR, { color: 'ink3', width: 1, bias: 0.03 });
    view.point([0, 0, 1], { color: 'ink2', r: 3.5 });
    view.label([0, 0, 1.13], tri && moving ? 'N (start)' : 'N', { color: 'ink' });
    view.line(L.path, { color: 'gold', width: 2.6, bias: 0.05 });
    if (tri) L.verts.slice(1).forEach((v) => view.point(v, { color: 'gold', r: 4 }));
    const n = L.path.length - 1;
    const idx = Math.round(F.params.progress * n);
    const tip = (k, v) => [L.path[k][0] + ARROW * v[0], L.path[k][1] + ARROW * v[1], L.path[k][2] + ARROW * v[2]];
    if (moving) {
      // faint copies of the arrow along the way
      for (let j = 1; j < 16; j++) { const k = Math.round((j / 16) * n); if (k < idx) view.arrow(L.path[k], tip(k, L.arrows[k]), { color: 'gold', width: 1.4, bias: 0.06 }); }
      // the starting arrow, and the carried arrow
      view.arrow(L.path[0], tip(0, L.arrows[0]), { color: 'ink', width: 2, bias: 0.07 });
      view.arrow(L.path[idx], tip(idx, L.arrows[idx]), { color: 'bad', width: 3.2, bias: 0.08 });
      if (!tri) view.label(L.path[0].map((v) => v * 1.18), 'start', { color: 'ink2', size: 11 });
    }
    view.end();
    if (P.readout === false) return;
    const p = L.path[idx], v = L.arrows[idx];
    const next = L.path[Math.min(n, idx + 1)], prev = L.path[Math.max(0, idx - 1)];
    const dir = idx < n ? toward(p, next) : toward(prev, p);
    const deg = (a) => `${(a / DEG).toFixed(1)}^\\circ`;
    const rows = [];
    if (tri) {
      const [a, b, c] = L.angles.map((x) => x / DEG);
      rows.push(['corner angles', `${a.toFixed(1)}^\\circ + ${b.toFixed(1)}^\\circ + ${c.toFixed(1)}^\\circ = ${(a + b + c).toFixed(1)}^\\circ`]);
      rows.push(['enclosed area $\\div R^2$', `${L.area.toFixed(3)}\\ \\text{rad} = ${deg(L.area)}`]);
      if (moving) rows.push(['arrow vs direction of travel', deg(tangentAngle(p, dir, v))]);
    } else {
      if (moving) {
        rows.push(['enclosed area $\\div R^2 = 2\\pi(1 - \\sin\\lambda)$', `${L.area.toFixed(3)}\\ \\text{rad} = ${deg(L.area)}`]);
        const { north } = northEast(p);
        rows.push(['arrow turned clockwise from local north', deg(wrap2pi(-tangentAngle(p, north, v)))]);
      }
      if (P.measure) {
        rows.push(['radius measured on the surface $\\rho$', `${L.th0.toFixed(3)}\\,R`]);
        rows.push(['circumference', `2\\pi R\\sin(\\rho/R) = ${(2 * Math.PI * Math.sin(L.th0)).toFixed(3)}\\,R`]);
        rows.push(['a flat plane would give $2\\pi\\rho$', `${(2 * Math.PI * L.th0).toFixed(3)}\\,R`]);
      }
    }
    if (moving) rows.push(['back at the start, compared with the black arrow', F.params.progress >= 0.999 ? `${deg(L.turn)}\\ \\text{anticlockwise}` : '\\text{(finish the loop)}']);
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(P.caption || (!moving ? 'A loop drawn on a sphere; every distance is measured along the surface. Drag the sphere to turn it ($R = 1$).' : tri
    ? 'Black: the arrow at the start. Red: the same arrow carried along the gold path, never turned — on each straight (great-circle) leg it keeps its angle to the path. Drag the sphere to turn it. Angles are measured on a unit sphere ($R = 1$).'
    : 'Black: the arrow at the start, pointing north. Red: the same arrow carried eastward around the circle of latitude, never turned. The circle is not a straight (great-circle) path, so the arrow drifts relative to north. Drag the sphere to turn it ($R = 1$).'));
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!['triangle', 'cap'].includes(P.mode)) p.push(`gr-sphere-transport: unknown mode ${P.mode}`);
  if (!(P.dphi >= 10 && P.dphi <= 170)) p.push('gr-sphere-transport: dphi must lie in [10, 170]');
  if (!(P.colat >= 20 && P.colat <= 90)) p.push('gr-sphere-transport: colat must lie in [20, 90]');
  if (!(P.lat >= 5 && P.lat <= 85)) p.push('gr-sphere-transport: lat must lie in [5, 85]');
  if (!(P.progress >= 0 && P.progress <= 1)) p.push('gr-sphere-transport: progress must lie in [0, 1]');
  return p;
}
