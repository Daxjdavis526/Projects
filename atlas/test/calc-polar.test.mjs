// The plane-curve model behind sims/calc-polar.js, checked against closed
// forms: polar areas and arc lengths, the cycloid, conics from (e, p), and
// Kepler's equation with its equal-area sectors.
//   node atlas/test/calc-polar.test.mjs

import {
  TAU, polarArea, polarLength, paramLength, paramAreaToAxis, paramAreaFromPole, shoelace, wedges,
  conic, conicType, conicRange, fromApsides, eccentricAnomaly, keplerAt, equalTimeSectors, samplePolar,
} from '../src/viz/model/calc-polar.js';
import { validate } from '../src/viz/sims/calc-polar.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const PI = Math.PI;

// polar areas: ½∫r²dθ
check('cardioid r = 1 + cos θ encloses 3π/2', near(polarArea((t) => 1 + Math.cos(t), 0, TAU), 1.5 * PI, 1e-12));
check('circle r = 2 sin θ (θ from 0 to π) encloses π', near(polarArea((t) => 2 * Math.sin(t), 0, PI), PI, 1e-12));
check('circle r = 2 sin θ over 0..2π is counted twice', near(polarArea((t) => 2 * Math.sin(t), 0, TAU), 2 * PI, 1e-12));
check('one petal of r = sin 3θ is π/12', near(polarArea((t) => Math.sin(3 * t), 0, PI / 3), PI / 12, 1e-12));
check('r = sin 3θ over 0..π is the whole rose, π/4', near(polarArea((t) => Math.sin(3 * t), 0, PI), PI / 4, 1e-12));
check('spiral r = θ, first turn: (2π)³/6', near(polarArea((t) => t, 0, TAU), TAU ** 3 / 6, 1e-12));
check('inside r = 3 sin θ, outside r = 1 + sin θ: π', near(polarArea((t) => 3 * Math.sin(t), PI / 6, 5 * PI / 6, (t) => 1 + Math.sin(t)), PI, 1e-10));

// polar arc length: ∫√(r² + r′²)dθ
check('cardioid length 8', near(polarLength((t) => 1 + Math.cos(t), 0, TAU), 8, 1e-9));
check('circle r = 3 length 6π', near(polarLength(() => 3, 0, TAU), 6 * PI, 1e-10));
{
  const L = polarLength((t) => t, 0, TAU);
  const exact = 0.5 * (TAU * Math.sqrt(1 + TAU ** 2) + Math.asinh(TAU));
  check('spiral r = θ, first turn: ½[θ√(1+θ²) + arsinh θ]', near(L, exact, 1e-9), `${L} vs ${exact}`);
}

// parametric curves
const cx = (t) => t - Math.sin(t), cy = (t) => 1 - Math.cos(t);
check('cycloid arch length 8r', near(paramLength(cx, cy, 0, TAU), 8, 1e-9));
check('area under a cycloid arch 3πr²', near(paramAreaToAxis(cx, cy, 0, TAU), 3 * PI, 1e-6));
check('astroid length 6', near(paramLength((t) => Math.cos(t) ** 3, (t) => Math.sin(t) ** 3, 0, TAU), 6, 1e-8));
check('semicubical parabola x = t², y = t³, 0..1', near(paramLength((t) => t * t, (t) => t ** 3, 0, 1), (13 ** 1.5 - 8) / 27, 1e-9));
check('ellipse (3 cos t, 2 sin t) swept from the pole: 6π', near(paramAreaFromPole((t) => 3 * Math.cos(t), (t) => 2 * Math.sin(t), 0, TAU), 6 * PI, 1e-6));
check('shoelace of the unit square is 1 (counter-clockwise)', shoelace([[0, 0], [1, 0], [1, 1], [0, 1]]) === 1);

// wedges: the Riemann sum of ½∫r²dθ converges to it
{
  const r = (t) => 1 + Math.cos(t);
  const e8 = Math.abs(wedges(r, 0, PI, 8, 'left').sum - 0.75 * PI), e64 = Math.abs(wedges(r, 0, PI, 64, 'left').sum - 0.75 * PI);
  check('left wedge sums converge (error shrinks ~8× from n = 8 to 64)', e64 < e8 / 6, `${e8} → ${e64}`);
  check('midpoint wedges, n = 200, within 1e-5', near(wedges(r, 0, TAU, 200).sum, 1.5 * PI, 1e-5));
  check('a wedge list has n entries spanning [α, β]', (() => { const w = wedges(r, 0.2, 1.4, 6).list; return w.length === 6 && near(w[0].t0, 0.2, 1e-12) && near(w[5].t1, 1.4, 1e-12); })());
}

// conics r = p/(1 + e cos θ)
check('types by eccentricity', conicType(0) === 'circle' && conicType(0.5) === 'ellipse' && conicType(1) === 'parabola' && conicType(2) === 'hyperbola');
{
  // Mercury: perihelion 0.3075 AU, aphelion 0.4667 AU
  const M = fromApsides(0.3075, 0.4667);
  check('Mercury e = 0.2056', near(M.e, 0.2056, 3e-4), String(M.e));
  const C = conic(M.e, M.p);
  check('Mercury q, Q and a back from (e, p)', near(C.q, 0.3075, 1e-12) && near(C.Q, 0.4667, 1e-12) && near(C.a, 0.3871, 1e-12));
  check('ellipse: c = ae and b² = a² − c²', near(C.c, C.a * C.e, 1e-12) && near(C.b ** 2, C.a ** 2 - C.c ** 2, 1e-12));
  // r = 4/(1 + 2 cos θ): a hyperbola, e = 2
  const H = conic(2, 4);
  check('hyperbola e = 2, p = 4: q = 4/3, |a| = 4/3, c = 8/3, b² = c² − a²', near(H.q, 4 / 3, 1e-12) && near(-H.a, 4 / 3, 1e-12) && near(H.c, 8 / 3, 1e-12) && near(H.b ** 2, H.c ** 2 - H.a ** 2, 1e-12));
  check('hyperbola asymptote: cos θ∞ = −1/e', near(Math.cos(H.thetaInf), -0.5, 1e-12));
  const [lo, hi] = conicRange(2);
  const pts = samplePolar((t) => 4 / (1 + 2 * Math.cos(t)), lo, hi, 400);
  check('conicRange keeps r finite and positive', pts.every((p) => Number.isFinite(p[3]) && p[3] > 0));
  check('parabola has no aphelion; directrix at p/e', conic(1, 2).Q === Infinity && near(conic(1, 2).directrix, 2, 1e-12));
  // every point satisfies PF = e·PD with the directrix x = p/e
  const E = conic(0.6, 1.5);
  const ok = samplePolar((t) => 1.5 / (1 + 0.6 * Math.cos(t)), -3, 3, 50).every(([x, y]) => near(Math.hypot(x, y), 0.6 * (E.directrix - x), 1e-12));
  check('focus–directrix property PF = e·PD', ok);
}

// Kepler's equation and the second law
for (const e of [0, 0.0167, 0.2056, 0.6, 0.967, 0.99]) {
  let worst = 0;
  for (let k = 0; k <= 720; k++) { const M = (TAU * k) / 720, E = eccentricAnomaly(M, e); worst = Math.max(worst, Math.abs(E - e * Math.sin(E) - M)); }
  check(`Kepler's equation solved to 1e-12 (e = ${e})`, worst < 1e-12, String(worst));
  const p = 1.3, n = 10, C = conic(e, p);
  const areas = equalTimeSectors(e, p, n).map((s) => polarArea((t) => p / (1 + e * Math.cos(t)), s.t0, s.t1, null, 4000));
  const target = (PI * C.a * C.b) / n;
  check(`equal-time sectors have equal area πab/n (e = ${e})`, areas.every((A) => near(A, target, 1e-8)), areas.map((A) => A.toFixed(6)).join(' '));
  const half = keplerAt(e, p, 0.5);
  check(`half a period after perihelion the body is at aphelion (e = ${e})`, near(half.theta, PI, 1e-9) && near(half.r, p / (1 - e), 1e-9));
  const quarter = keplerAt(e, p, 0.25);
  check(`the body is on its orbit (e = ${e})`, near(quarter.r, p / (1 + e * Math.cos(quarter.theta)), 1e-9));
}
check('true anomaly runs monotonically through one period', (() => { let prev = -1; for (let k = 0; k <= 100; k++) { const th = keplerAt(0.9, 1, k / 100).theta; if (!(th >= prev)) return false; prev = th; } return near(prev, TAU, 1e-9); })());

// the simulation's parameter checks
const good = {
  grid: 'polar', x: [-2, 2], y: [-2, 2],
  sliders: [{ key: 'b', label: 'b', min: 0, max: 2, value: 1 }, { key: 'th', label: 'θ', min: 0, max: 6.28, value: 1 }],
  curves: [{ polar: '1 + b*cos(theta)', theta: [0, '2*pi'], label: 'r', labelAt: 1 }, { param: ['cos(t)', 'sin(t)'], t: [0, 'th'] }, { conic: [0.5, 1] }],
  fills: [{ polar: '1 + b*cos(theta)', theta: [0, 'th'] }, { param: ['t - sin(t)', '1 - cos(t)'], t: [0, '2*pi'] }],
  wedges: { polar: '1 + b*cos(theta)', theta: [0, 'th'], n: 6 },
  rays: [{ polar: '1 + b*cos(theta)', at: 'th' }],
  tangents: [{ param: ['t - sin(t)', '1 - cos(t)'], at: 'th', velocity: 0.5 }],
  kepler: { e: 0.2, p: 1, n: 8, at: 'th' },
  points: [{ r: 'rr', theta: 'rtheta' }, { x: 'rx', y: 'ry' }],
  segments: [{ from: [0, 0], to: ['rx', 'ry'] }],
  readouts: [{ label: 'area', expr: 'area' }, { label: 'L', expr: 'len2' }, { label: 'wedges', expr: 'wsum' }, { label: 'type', classify: 'b' }, { label: 'slope', expr: 'slope' }],
};
check('validate accepts a good spec', validate(good).length === 0, validate(good).join('; '));
check('validate rejects a bad expression', validate({ curves: [{ polar: '1 + cos(theta' }] }).length > 0);
check('validate rejects an unknown name', validate({ curves: [{ polar: '1 + q*cos(theta)' }] }).length > 0);
check('validate rejects a curve with two kinds', validate({ curves: [{ polar: '1', fn: 'x' }] }).length > 0);
check('validate rejects a reserved slider key', validate({ sliders: [{ key: 'area', label: 'A', min: 0, max: 1, value: 0.5 }] }).length > 0);
check('validate rejects kepler with e ≥ 1', validate({ kepler: { e: 1.2, p: 1 } }).length > 0);
check('validate rejects a ray on a parametric curve', validate({ rays: [{ param: ['t', 't'], t: [0, 1], at: 0.5 }] }).length > 0);
check('validate checks presets', validate({ presets: [{ label: 'ok', curves: [{ polar: '2' }] }, { label: 'bad', curves: [{ polar: 'zz' }] }] }).length === 1);
check('validate checks preset set values', validate({ sliders: [{ key: 'e', label: 'e', min: 0, max: 1, value: 0.5 }], presets: [{ label: 'Mercury', set: { e: 0.2056 } }, { label: 'bad', set: { f: 1 } }] }).length === 1);

// mount and draw headlessly, with a stub canvas: every kind of element, every
// preset, a drag point, the Kepler orbit and the readouts must draw without
// throwing (a typo in a variable list only shows up when the sim draws)
{
  globalThis.window ??= { devicePixelRatio: 1 };
  globalThis.document ??= { documentElement: {} };
  globalThis.getComputedStyle ??= () => ({ getPropertyValue: () => '' });
  const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const mountSpec = async (P) => {
    const { mount, defaults } = await import('../src/viz/sims/calc-polar.js');
    const params = {}, listeners = [];
    let redraw = null, rows = null;
    const node = () => ({ style: {}, querySelector: () => null });
    const F = {
      params,
      canvas: () => ({ canvas: { getContext: () => ctx, clientWidth: 640, clientHeight: 320, addEventListener() {}, setPointerCapture() {}, style: {} } }),
      slider: (s) => { params[s.key] = s.value; return { node: node(), set: (v) => { params[s.key] = v; } }; },
      choice: (c) => { params[c.key] = c.value; return { node: node(), set: (v) => { params[c.key] = v; } }; },
      toggle: (c) => { params[c.key] = c.value; return { node: node(), set() {} }; },
      button: () => ({ textContent: '' }),
      onChange: (fn) => listeners.push(fn),
      draw: (fn) => { redraw = fn; },
      readout: (r) => { rows = r; },
      caption() {}, animate: () => ({ stop() {}, start() {} }), onDestroy() {},
      set: (k, v) => { params[k] = v; listeners.forEach((fn) => fn(k)); },
    };
    const ctl = mount(F, { ...defaults, ...P });
    redraw();
    return { F, ctl, rows: () => rows, redraw };
  };
  try {
    const m = await mountSpec(good);
    check('mount and draw: a spec with every element', Array.isArray(m.rows()) && m.rows().length === good.readouts.length);
    const A = m.rows()[0][1];
    check('the area readout is a number', /^[0-9.]+$/.test(A), A);
  } catch (e) { check('mount and draw: a spec with every element', false, e.stack); }
  try {
    const m = await mountSpec({
      grid: 'cartesian', x: [-2, 2], y: [-1, 3],
      curves: [{ fn: 'x^2', domain: [-1.5, 1.5] }, { param: ['t', '2 - t^2/2'], t: [-2, 2] }],
      fills: [{ fn: '2 - x^2/2', lower: 'x^2', from: -1.1547, to: 1.1547 }],
      drag: [{ key: 'p', x: 0.5, y: 0.5, snap: 0.1 }],
      points: [{ x: 'px', y: 'py' }],
      readouts: [{ label: 'area', expr: 'area' }],
    });
    const A = +m.rows()[0][1];
    check('Cartesian fn curves and fills draw (the area between two graphs)', Math.abs(A - (2 * 1.1547 * 2 - (1.5 * 2 * 1.1547 ** 3) / 3)) < 1e-3, String(A));
    check('the drag point is the answer', m.ctl.get('point').x === 0.5);
  } catch (e) { check('Cartesian fn curves and fills draw', false, e.stack); }
  try {
    const m = await mountSpec({
      sliders: [{ key: 'e', label: 'e', min: 0, max: 0.9, value: 0.2 }, { key: 'tau', label: 'τ', min: 0, max: 1, value: 0.5 }],
      presets: [{ label: 'Mercury', set: { e: 0.2056 } }, { label: 'Halley', set: { e: 0.967 }, x: [-40, 4], y: [-10, 10] }],
      curves: [{ conic: ['e', 1] }], kepler: { e: 'e', p: 1, n: 8, at: 'tau', play: true },
      readouts: [{ label: 'r', expr: 'kr', digits: 9 }, { label: 'shape', classify: 'e' }],
    });
    m.F.set('preset', 1);
    check('a preset sets its slider values', m.F.params.e === 0.967);
    const r = +m.rows()[0][1];
    check('half a period on, the body is at aphelion p/(1 − e)', Math.abs(r - 1 / (1 - 0.967)) < 1e-6 * 31, String(r));
    check('the classify readout names the conic', m.rows()[1][1] === '\\text{ellipse}');
  } catch (e) { check('Kepler presets draw', false, e.stack); }
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
