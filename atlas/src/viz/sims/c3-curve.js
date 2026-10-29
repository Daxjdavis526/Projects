// A space curve r(t) and what calculus measures along it: a point riding the
// curve (Play moves it), its velocity and acceleration, the secant that turns
// into the tangent, the moving frame T, N, B with the osculating circle, and
// the split of the acceleration into a tangential and a normal part,
// a = a_T T + a_N N. Planar curves can be drawn flat, in 2D.
//
//   { type: 'c3-curve', params: {
//       curve: { param: ['3*cos(t)', '3*sin(t)', '0.5*t'], t: [0, 12] }   // expressions of t and the slider keys
//            | { model: 'gravity-turn', every: 0.5 },   // a rocket's ascent (model/c3-curve.js): km and s, x downrange, z up
//       at: 2,                        // where the point starts (a value of t)
//       pointLabel: 't',              // the parameter's symbol, TeX
//       sliders, choices, constants,  // extra parameters the curve may use
//       show: ['T', 'N', 'circle'],   // any of T N B circle v a split secant shadows trail
//       toggles: ['circle'],          // which of those are offered as switches (they start as in show)
//       secant: 'h',                  // a slider key: the step h of the secant (r(t + h) − r(t))/h
//       scale: { v: 1, a: 1, frame: 1 },  // drawn length of v and a per unit, and the length of T, N, B
//       plane: 'xz',                  // draw a planar curve flat: 'xy' or 'xz' (x across); omit for 3D
//       readouts: ['t', 'speed', 'kappa'],   // any of t s speed kappa R tau aT aN a x y z
//       units: { t: '\\text{s}', len: '\\text{km}', speed: '\\text{km/s}', acc: '\\text{m/s}^2', accScale: 1000 },
//       play: true, speed: 1,         // Play advances t at `speed` units per second
//       fixed: false,                 // true: a still picture of the point at `at` — no slider, no Play
//       x, y,                         // 2D window (default: fitted); range, yaw, pitch, dist, target for 3D
//       vectors: 'arrow',             // vector notation in labels: 'arrow' (\vec T) or 'bold' (\mathbf T)
//       labels: true } }
//
// The geometry lives in model/c3-curve.js, tested in test/c3-curve.test.mjs.
// A picture must not show its answer: leave the readouts out when a question
// asks for one of them.

import { Plot } from '../plot.js';
import { View3D } from '../three-d.js';
import { tex } from '../../ui/dom.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/c3-curve.js';

export const defaults = {
  curve: null, at: null, pointLabel: 't', show: ['T', 'N'], toggles: [], secant: null, scale: {}, plane: null,
  readouts: ['t', 'speed', 'kappa'], units: {}, play: true, speed: 1, labels: true, range: 3, fixed: false,
};

const SHOW = ['T', 'N', 'B', 'circle', 'v', 'a', 'split', 'secant', 'shadows', 'trail'];
const READOUTS = ['t', 's', 'speed', 'kappa', 'R', 'tau', 'aT', 'aN', 'a', 'x', 'y', 'z'];
const MODELS = ['gravity-turn'];
const TOGGLE_LABEL = {
  T: 'Unit tangent $\\vec T$', N: 'Unit normal $\\vec N$', B: 'Binormal $\\vec B = \\vec T\\times\\vec N$', circle: 'Osculating circle',
  v: 'Velocity $\\vec v = \\vec r\\,\'$', a: 'Acceleration $\\vec a = \\vec r\\,\'\'$', split: 'Split $\\vec a = a_T\\vec T + a_N\\vec N$',
  secant: 'Secant $\\frac{\\vec r(t + h) - \\vec r(t)}{h}$', shadows: 'Shadows on the coordinate planes', trail: 'Trail',
};
const CSSVAR = { accent: '--accent', good: '--good', warn: '--warn', violet: '--violet', gold: '--gold', teal: '--teal', bad: '--bad', ink: '--ink', ink2: '--ink-2', ink3: '--ink-3' };
const cssColor = (n) => `var(${CSSVAR[n] || '--ink'})`;
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];

export function mount(F, P) {
  // \vec T → \mathbf{T} when the lesson writes vectors in bold
  const vn = (str) => (P.vectors === 'bold' ? str.replace(/\\vec\s*(\\[A-Za-z]+|[A-Za-z])/g, '\\mathbf{$1}') : str);
  const flat = P.plane === 'xy' || P.plane === 'xz';
  const { canvas, overlay } = F.canvas({ aspect: P.aspect || (flat ? 'wide' : ''), label: P.alt || 'A curve with a point moving along it' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const num = (s, E) => (typeof s === 'number' ? s : fn(s, keys)(E));

  // the curve: expressions, or samples from a model
  const model = P.curve.model === 'gravity-turn' ? M.gravityTurn(P.curve) : null;
  const span = (E) => (model ? [model[0].t, model[model.length - 1].t] : P.curve.t.map((s) => num(s, E)));
  const rOf = (E) => {
    if (model) return (t) => M.sampleAt(model, t).r;
    const f = P.curve.param.map((s) => fn(s, ['t', ...keys]));
    return (t) => f.map((g) => g({ ...E, t }));
  };
  const [T0, T1] = span(env());
  if (P.fixed) F.params.tp = P.at ?? T0 + 0.3 * (T1 - T0);   // a still picture: no slider, no Play
  else F.slider({ key: 'tp', label: `$${P.pointLabel}$`, min: T0, max: T1, step: +((T1 - T0) / 400).toPrecision(2), value: P.at ?? T0 + 0.3 * (T1 - T0), unit: P.units.t || '', explain: 'Moves the point along the curve.' });
  const on = {};
  for (const k of SHOW) on[k] = (P.show || []).includes(k);
  for (const k of P.toggles || []) F.toggle({ key: `show_${k}`, label: vn(TOGGLE_LABEL[k]), value: on[k] });
  if (P.play && !P.fixed) {
    let anim = null;
    const btn = F.button({ label: 'Play ▶', onClick: () => {
      if (anim) { anim.stop(); anim = null; btn.textContent = 'Play ▶'; return; }
      btn.textContent = 'Pause ❚❚';
      anim = F.animate((dt) => {
        const [a, b] = span(env());
        let t = F.params.tp + dt * (P.speed || 1);
        if (t > b) t = a;
        F.set('tp', +t.toFixed(6));
      }, { force: true });
    } });
  }
  F.onChange((key) => { if (key.startsWith('show_')) on[key.slice(5)] = !!F.params[key]; draw(); });

  const plot = flat ? new Plot(canvas, { x: P.x || [-1, 1], y: P.y || [-1, 1], equal: true, xlabel: P.xlabel ?? 'x', ylabel: P.ylabel ?? (P.plane === 'xz' ? 'z' : 'y') }) : null;
  const view = flat ? null : new View3D(canvas, { yaw: P.yaw ?? 0.55, pitch: P.pitch ?? 0.4, dist: P.dist ?? P.range * 3.8, target: P.target || [0, 0, 0], scale: P.scale3d ?? 1.3 });
  if (view) view.onChange = () => draw();
  // a planar curve's own two coordinates
  const ix = 0, iy = P.plane === 'xz' ? 2 : 1;
  let fitted = null;

  const pool = [];
  if (view) {
    const hint = document.createElement('div');
    hint.textContent = 'drag to rotate';
    Object.assign(hint.style, { position: 'absolute', right: '10px', bottom: '6px', fontSize: '.72rem', color: 'var(--ink-3)' });
    overlay.append(hint);
  }

  function draw() {
    const E = env(), r = rOf(E), [t0, t1] = span(E);
    const t = Math.max(t0, Math.min(t1, F.params.tp));
    const n = 240, pts = Array.from({ length: n + 1 }, (_, k) => r(t0 + ((t1 - t0) * k) / n));
    // the state at the point
    let p, d1, d2, d3 = null;
    if (model) { const s = M.sampleAt(model, t); p = s.r; d1 = s.v; d2 = s.a; }
    let noise = 0;
    if (!model) { const d = M.derivatives(r, t, 1e-4 * (t1 - t0 || 1)); p = d.p; d1 = d.d1; d2 = d.d2; d3 = d.d3; noise = d.noise; }
    const Fr = M.frame(d1, d2, d3, noise);
    const sc = { v: P.scale.v ?? 1, a: P.scale.a ?? 1, frame: P.scale.frame ?? (flat ? 1 : 0.9) };
    const vecs = [];   // [from, to, colour, label, dashed]
    if (on.v) vecs.push([p, M.add(p, M.mul(d1, sc.v)), 'good', '\\vec v', false]);
    if (on.a) vecs.push([p, M.add(p, M.mul(d2, sc.a)), 'violet', '\\vec a', false]);
    if (on.split && Fr.N) {
      vecs.push([p, M.add(p, M.mul(Fr.T, Fr.aT * sc.a)), 'accent', 'a_T\\vec T', true]);
      vecs.push([p, M.add(p, M.mul(Fr.N, Fr.aN * sc.a)), 'warn', 'a_N\\vec N', true]);
    }
    if (on.T) vecs.push([p, M.add(p, M.mul(Fr.T, sc.frame)), 'accent', '\\vec T', false]);
    if (on.N && Fr.N) vecs.push([p, M.add(p, M.mul(Fr.N, sc.frame)), 'warn', '\\vec N', false]);
    if (on.B && Fr.B) vecs.push([p, M.add(p, M.mul(Fr.B, sc.frame)), 'teal', '\\vec B', false]);
    let sec = null;
    if (on.secant && P.secant) {
      const h = F.params[P.secant] ?? E[P.secant];
      if (Math.abs(h) > 1e-9) {
        const q = r(t + h), quot = M.mul(M.sub(q, p), 1 / h);
        sec = { q, quot };
        vecs.push([p, M.add(p, M.mul(quot, sc.v)), 'warn', '\\frac{\\Delta\\vec r}{h}', false]);
      }
    }
    const circ = on.circle ? M.osculatingCircle(p, Fr) : null;
    const marks = [];
    if (flat) draw2d(pts, p, t, t0, t1, r, vecs, circ, sec, marks);
    else draw3d(pts, p, t, t0, t1, r, vecs, circ, sec, marks);
    readouts(t, r, Fr, p, d2);
  }

  function draw2d(pts, p, t, t0, t1, r, vecs, circ, sec) {
    if (!fitted && !P.x) {
      const xs = pts.map((q) => q[ix]), ys = pts.map((q) => q[iy]);
      const pad = 0.12 * Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1e-9);
      fitted = [[Math.min(...xs) - pad, Math.max(...xs) + pad], [Math.min(...ys) - pad, Math.max(...ys) + pad]];
      plot.setView(...fitted);
    } else if (P.x && !fitted) { fitted = [P.x, P.y]; plot.setView(P.x, P.y); }
    plot.clear();
    const P2 = (q) => [q[ix], q[iy]];
    plot.path(pts.map(P2), { color: on.trail ? 'ink3' : 'accent', width: on.trail ? 1.6 : 2.4 });
    if (on.trail) plot.path(pts.filter((_, k) => t0 + ((t1 - t0) * k) / 240 <= t).map(P2), { color: 'accent', width: 2.6 });
    if (circ) { plot.path(circ.pts.map(P2), { color: 'gold', width: 1.6, dash: [6, 5] }); plot.point(...P2(circ.centre), { color: 'gold', r: 3 }); }
    if (sec) { plot.line(...P2(p), ...P2(sec.q), { color: 'warn', width: 1.2, dash: [4, 4] }); plot.point(...P2(sec.q), { color: 'warn', r: 3.5 }); }
    const plain = { '\\vec v': 'v', '\\vec a': 'a', 'a_T\\vec T': 'tangential', 'a_N\\vec N': 'normal', '\\vec T': 'T', '\\vec N': 'N', '\\vec B': 'B', '\\frac{\\Delta\\vec r}{h}': 'Δr/h' };
    for (const [a, b, color, label, dashed] of vecs) {
      plot.arrow(...P2(a), ...P2(b), { color, width: 2.4, dash: dashed ? [6, 4] : [], label: P.labels === false ? undefined : plain[label] });
    }
    plot.point(...P2(p), { color: 'gold', r: 5 });
  }

  function draw3d(pts, p, t, t0, t1, r, vecs, circ, sec, marks) {
    view.begin();
    const R = P.range;
    view.axes(R * 1.1, P.axisLabels || ['x', 'y', 'z']);
    for (let k = -Math.floor(R); k <= Math.floor(R); k++) {
      view.line([[k, -R, 0], [k, R, 0]], { color: 'line2', width: 0.7, bias: -0.4 });
      view.line([[-R, k, 0], [R, k, 0]], { color: 'line2', width: 0.7, bias: -0.4 });
    }
    if (on.shadows) {
      view.line(pts.map((q) => [q[0], q[1], 0]), { color: 'ink3', width: 1.2, dash: [4, 4], bias: -0.1 });
      view.line(pts.map((q) => [q[0], -R, q[2]]), { color: 'ink3', width: 1.2, dash: [4, 4], bias: -0.1 });
      view.line(pts.map((q) => [-R, q[1], q[2]]), { color: 'ink3', width: 1.2, dash: [4, 4], bias: -0.1 });
      view.line([p, [p[0], p[1], 0]], { color: 'ink3', width: 1, dash: [3, 3], bias: 0 });
      view.point([p[0], p[1], 0], { color: 'ink3', r: 3 });
    }
    view.line(pts, { color: on.trail ? 'ink3' : 'accent', width: on.trail ? 1.5 : 2.4, bias: 0.02 });
    if (on.trail) view.line(pts.filter((_, k) => t0 + ((t1 - t0) * k) / 240 <= t), { color: 'accent', width: 2.8, bias: 0.03 });
    if (circ) { view.line(circ.pts, { color: 'gold', width: 1.6, dash: [6, 5], bias: 0.04 }); view.point(circ.centre, { color: 'gold', r: 3 }); }
    if (sec) { view.line([p, sec.q], { color: 'warn', width: 1.2, dash: [4, 4], bias: 0.04 }); view.point(sec.q, { color: 'warn', r: 3.5 }); }
    for (const [a, b, color, label, dashed] of vecs) {
      view.arrow(a, b, { color, width: 2.6, dash: dashed ? [6, 4] : [], bias: 0.08 });
      const d = M.sub(b, a), L = M.len(d);
      if (L > 1e-9 && P.labels !== false) marks.push([M.add(b, M.mul(d, (0.12 * R) / L)), vn(label), color]);
    }
    view.point(p, { color: 'gold', r: 5 });
    view.end();
    marks.forEach(([pt, label, color], k) => {
      let el = pool[k];
      if (!el) { el = document.createElement('div'); el.className = 'lbl'; overlay.append(el); pool.push(el); }
      const [sx, sy, depth] = view.project(pt);
      el.style.display = depth > 0.05 ? '' : 'none';
      el.style.left = `${sx - 6}px`; el.style.top = `${sy - 10}px`;
      el.style.color = cssColor(color);
      if (el.dataset.src !== label) { el.dataset.src = label; el.innerHTML = tex(label); }
    });
    for (let k = marks.length; k < pool.length; k++) pool[k].style.display = 'none';
  }

  let arc = null, arcKey = '';
  function readouts(t, r, Fr, p, d2) {
    if (!P.readouts?.length) return;
    const U = P.units || {}, accScale = U.accScale ?? 1;
    const u = (s) => (s ? `\\,${s}` : '');
    const rows = [];
    for (const k of P.readouts) {
      if (k === 't') rows.push([`$${P.pointLabel}$`, `${fmtNum(t)}${u(U.t)}`]);
      if (k === 'speed') rows.push(['speed $|\\vec v|$', `${fmtNum(Fr.speed)}${u(U.speed)}`]);
      if (k === 'kappa') rows.push(['curvature $\\kappa$', `${fmtNum(Fr.kappa)}${U.len ? `\\,${U.len}^{-1}` : ''}`]);
      if (k === 'R') rows.push(['radius $1/\\kappa$', Fr.kappa > 0 ? `${fmtNum(1 / Fr.kappa)}${u(U.len)}` : '\\infty']);
      if (k === 'tau') rows.push(['torsion $\\tau$', `${fmtNum(Fr.tau)}${U.len ? `\\,${U.len}^{-1}` : ''}`]);
      if (k === 'aT') rows.push(['$a_T$', `${fmtNum(Fr.aT * accScale)}${u(U.acc)}`]);
      if (k === 'aN') rows.push(['$a_N$', `${fmtNum(Fr.aN * accScale)}${u(U.acc)}`]);
      if (k === 'a') rows.push(['$|\\vec a|$', `${fmtNum(M.len(d2) * accScale)}${u(U.acc)}`]);
      if (k === 'x' || k === 'y' || k === 'z') rows.push([`$${k}$`, `${fmtNum(p['xyz'.indexOf(k)])}${u(U.len)}`]);
      if (k === 's') {
        const E = env(), [a, b] = span(E), key = JSON.stringify([E, a, b]);
        if (key !== arcKey) { arc = M.arcLengthTable(r, a, b, 600); arcKey = key; }
        rows.push(['arc length $s$', `${fmtNum(M.arcLengthAt(arc, t))}${u(U.len)}`]);
      }
    }
    F.readout(rows.map((r) => [vn(r[0]), ...r.slice(1)]));
  }

  F.draw(draw);
  F.caption(P.caption || (flat ? 'The curve drawn flat in its own plane.' : 'Drag to rotate; scroll or pinch to zoom. Play moves the point along the curve.'));
}

function fmtNum(v) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return v.toExponential(2).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`);
  return String(+v.toPrecision(3));
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  if (P.vectors !== undefined && P.vectors !== 'arrow' && P.vectors !== 'bold') problems.push("c3-curve: vectors is 'arrow' or 'bold'");
  const tryParse = (src, vars, where) => {
    if (typeof src === 'number') return;
    if (typeof src !== 'string') { problems.push(`c3-curve ${where}: expected a number or an expression`); return; }
    try { fn(src, [...vars, ...keys]); } catch (e) { problems.push(`c3-curve ${where}: “${src}” — ${e.message}`); }
  };
  const C = P.curve;
  if (!C) problems.push('c3-curve needs a curve');
  else if (C.model) { if (!MODELS.includes(C.model)) problems.push(`c3-curve: unknown model “${C.model}” (use ${MODELS.join(', ')})`); }
  else {
    if (!(Array.isArray(C.param) && C.param.length === 3)) problems.push('c3-curve: curve.param must be [x(t), y(t), z(t)]');
    else C.param.forEach((s) => tryParse(s, ['t'], 'curve'));
    if (!(Array.isArray(C.t) && C.t.length === 2)) problems.push('c3-curve: curve.t must be [a, b]');
    else C.t.forEach((s) => tryParse(s, [], 'curve t'));
    if (Array.isArray(C.t) && P.at != null) {
      const E = { ...(P.constants || {}) };
      for (const s of P.sliders || []) E[s.key] = s.value;
      for (const c of P.choices || []) E[c.key] = c.value;
      try { const [a, b] = C.t.map((v) => (typeof v === 'number' ? v : fn(v, keys)(E))); if (P.at < a || P.at > b) problems.push('c3-curve: at must lie in curve.t'); } catch { /* reported above */ }
    }
  }
  for (const k of [...(P.show || []), ...(P.toggles || [])]) if (!SHOW.includes(k)) problems.push(`c3-curve: unknown element “${k}” (use ${SHOW.join(', ')})`);
  for (const k of P.readouts || []) if (!READOUTS.includes(k)) problems.push(`c3-curve: unknown readout “${k}” (use ${READOUTS.join(', ')})`);
  if (P.plane != null && !['xy', 'xz'].includes(P.plane)) problems.push("c3-curve: plane must be 'xy' or 'xz'");
  if (P.secant != null && !keys.includes(P.secant)) problems.push('c3-curve: secant must name a slider key');
  for (const s of P.sliders || []) if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
  return problems;
}
