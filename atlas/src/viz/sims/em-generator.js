// A rectangular coil turning between the poles of a magnet: a generator (turn
// it, and an emf appears, NBAω sin ωt) or a motor (feed it a current, and the
// field twists it with a torque NIAB sin θ). Slip rings give alternating
// current and alternating torque; a split-ring commutator reverses the coil’s
// connections every half turn, giving pulsing DC from a generator and a torque
// of one sign in a motor. Below the 3D picture: the flux linkage and the emf,
// or the torque, against time, with a cursor at the coil’s present angle.
// The physics is model/em-generator.js (tested in test/em-generator.test.mjs).
//
//   { type: 'em-generator', params: {
//       mode: 'generator',                 // 'generator' | 'motor'
//       N: 100, B: 0.2, a: 0.10, b: 0.08,  // turns; tesla; the coil's sides along and across the axle (m)
//       rpm: 3000, I: 2,                   // turning rate; the motor's current (A)
//       ring: 'slip', ringChoice: false,   // 'slip' (slip rings) | 'split' (split-ring commutator); offer the choice
//       sliders: ['rpm', 'N', 'B', 'I', 'angle'],   // built-in sliders, or objects { key, min, max, step, value, label, explain }
//       play: true, angle: null,           // animate (slowed: one turn ≈ 3.5 s); or a still at this angle (degrees, θ between μ and B)
//       graph: true,                       // the flux and emf (generator) or torque (motor) against time
//       arrows: ['B', 'mu', 'F', 'I'],     // field, the normal/moment (gold), forces on the long sides, current along them
//       readouts: ['peak', 'f', 'emf'] } } // any of peak f emf flux torque tmax mu angle avg
//
// The coil is drawn the same size whatever a and b; the readouts and graphs
// use the true values. A picture must not show its answer: set readouts: []
// and graph: false when a question asks for a number they would show.

import { Plot } from '../plot.js';
import { View3D } from '../three-d.js';
import { tex } from '../../ui/dom.js';
import * as M from '../model/em-generator.js';

export const defaults = {
  mode: 'generator', N: 100, B: 0.2, a: 0.1, b: 0.08, rpm: 3000, I: 2, ring: 'slip', ringChoice: false,
  sliders: [], play: true, angle: null, graph: true, arrows: ['B', 'mu', 'F', 'I'], readouts: ['peak', 'f', 'emf'],
};

const MODES = ['generator', 'motor'];
const RINGS = ['slip', 'split'];
const READOUTS = ['peak', 'f', 'emf', 'flux', 'torque', 'tmax', 'mu', 'angle', 'avg'];
const ARROWS = ['B', 'mu', 'F', 'I'];
const BUILTIN = ['rpm', 'N', 'B', 'I', 'angle'];
const CSSVAR = { accent: '--accent', good: '--good', warn: '--warn', bad: '--bad', violet: '--violet', gold: '--gold', teal: '--teal', ink: '--ink', ink2: '--ink-2', ink3: '--ink-3' };
const DEG = Math.PI / 180;
const SEC_PER_TURN = 3.5;

function texNum(v, n = 3) {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (Math.abs(v) < 1e-12) return '0';
  const a = Math.abs(v);
  if (a >= 1e4 || a < 1e-2) { const [m, e] = v.toExponential(n - 1).split('e'); return `${m} \\times 10^{${+e}}`; }
  return String(+v.toPrecision(n));
}
const qty = (v, u, n = 3) => `${texNum(v, n)}\\ \\mathrm{${u}}`;

function sliderSpec(s, P) {
  const key = typeof s === 'string' ? s : s.key;
  const base = {
    rpm: { label: 'Turning rate', min: 0, max: 2 * P.rpm, step: P.rpm / 50, value: P.rpm, unit: '\\mathrm{rpm}', explain: 'Revolutions per minute. Faster turning changes the flux faster: a bigger emf, at a higher frequency.' },
    N: { label: 'Turns of wire $N$', min: 1, max: 2 * P.N, step: 1, value: P.N, unit: '', explain: 'Each turn adds its own emf (or its own torque).' },
    B: { label: 'Field $B$', min: 0, max: Math.max(0.5, 2 * P.B), step: 0.01, value: P.B, unit: '\\mathrm{T}', explain: 'Between the pole pieces.' },
    I: { label: 'Current $I$', min: 0, max: Math.max(5, 2 * P.I), step: 0.1, value: P.I, unit: '\\mathrm{A}', explain: 'The current fed to the coil.' },
    angle: { label: 'Angle $\\theta$ of the coil', min: 0, max: 360, step: 1, value: P.angle ?? 0, unit: '^\\circ', explain: P.mode === 'motor' ? 'The angle between the coil’s magnetic moment (gold) and the field. θ = 0 when the coil faces the field squarely.' : 'θ = 0 when the coil faces the field (its normal along B), so the flux through it is greatest.' },
  }[key] || {};
  return typeof s === 'string' ? { ...base, key } : { ...base, ...s };
}

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const motor = P.mode === 'motor', compact = !!F.compact;
  const { canvas, overlay } = F.canvas({ aspect: P.aspect || 'wide', label: P.alt || (motor ? 'A current-carrying coil turning between the poles of a magnet, with the forces on its sides' : 'A coil turning between the poles of a magnet, generating an emf') });
  const showGraph = P.graph && !compact;
  const g1 = showGraph ? F.canvas({ height: motor ? '150px' : '118px', label: motor ? 'Torque on the coil against time' : 'Flux linkage through the coil against time' }) : null;
  const g2 = showGraph && !motor ? F.canvas({ height: '118px', label: 'The emf at the brushes against time' }) : null;

  if (P.ringChoice) F.choice({ key: 'ring', label: 'Connections', options: [['slip', 'slip rings'], ['split', 'split-ring commutator']], value: P.ring, explain: motor ? 'A commutator reverses the current every half turn, so the torque never changes sign.' : 'A commutator swaps the connections every half turn: the output never changes sign (pulsing DC).' });
  for (const s of P.sliders || []) F.slider(sliderSpec(s, P));
  const val = (k) => (F.params[k] !== undefined ? (k === 'ring' ? F.params[k] : +F.params[k]) : P[k]);

  const S = { th: (P.angle ?? 0) * DEG, running: P.play !== false && P.angle === null && !reduced };
  let playBtn = null;
  if (P.play !== false && !compact) {
    playBtn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim?.start(); } });
  }
  const anim = P.play === false ? null : F.animate((dt) => {
    if (!S.running || val('rpm') <= 0) return;
    S.th = (S.th + (M.TAU * dt) / SEC_PER_TURN) % M.TAU;
    if ((P.sliders || []).some((s) => (typeof s === 'string' ? s : s.key) === 'angle')) F.set('angle', Math.round((S.th / DEG) * 10) / 10);
    else draw();
  }, { force: true });
  F.onChange((key) => { if (key === 'angle') S.th = val('angle') * DEG; draw(); });

  // the 3D view: axle along x (toward the viewer), B along +y (left pole N, right pole S), z up
  const view = new View3D(canvas, { yaw: P.yaw ?? 0.62, pitch: P.camPitch ?? 0.38, dist: P.dist ?? 10, scale: P.scale ?? (compact ? 1.6 : 1.35), target: [0.35, 0, 0] });
  view.onChange = () => draw();
  const hint = document.createElement('div');
  hint.textContent = 'drag to rotate';
  Object.assign(hint.style, { position: 'absolute', right: '10px', bottom: '6px', fontSize: '.72rem', color: 'var(--ink-3)' });
  overlay.append(hint);
  const pool = [];
  const cssColor = (n) => `var(${CSSVAR[n] || '--ink'})`;
  function place(marks) {
    marks.forEach(([p, label, color, dx = 0, dy = 0], k) => {
      let el = pool[k];
      if (!el) { el = document.createElement('div'); el.className = 'lbl'; overlay.append(el); pool.push(el); }
      const [sx, sy, z] = view.project(p);
      el.style.display = z > 0.05 ? '' : 'none';
      el.style.left = `${sx + dx}px`; el.style.top = `${sy + dy}px`; el.style.color = cssColor(color);
      if (el.dataset.src !== label) { el.dataset.src = label; el.innerHTML = tex(label); }
    });
    for (let k = marks.length; k < pool.length; k++) pool[k].style.display = 'none';
  }
  const box = (x0, x1, y0, y1, z0, z1, o) => {
    const faces = [
      [[x0, y0, z0], [x1, y0, z0], [x0, y0, z1]], [[x0, y1, z0], [x1, y1, z0], [x0, y1, z1]],
      [[x0, y0, z0], [x1, y0, z0], [x0, y1, z0]], [[x0, y0, z1], [x1, y0, z1], [x0, y1, z1]],
      [[x0, y0, z0], [x0, y1, z0], [x0, y0, z1]], [[x1, y0, z0], [x1, y1, z0], [x1, y0, z1]],
    ];
    for (const [o0, ou, ov] of faces) {
      const u = [ou[0] - o0[0], ou[1] - o0[1], ou[2] - o0[2]], v = [ov[0] - o0[0], ov[1] - o0[1], ov[2] - o0[2]];
      view.surface([0, 1].map((i) => [0, 1].map((j) => [o0[0] + u[0] * i + v[0] * j, o0[1] + u[1] * i + v[1] * j, o0[2] + u[2] * i + v[2] * j])), o);
    }
  };

  const A_D = 2.2, B_D = 1.7;                    // the coil as drawn (display units)
  const ringX = A_D / 2 + 0.75;
  const plot1 = g1 ? new Plot(g1.canvas, { x: [0, 1], y: [-1, 1], xlabel: 't (ms)', ylabel: motor ? 'τ (N·m)' : 'NΦ (Wb)', pad: { l: 58, r: 14, t: 10, b: 30 }, yticks: 3 }) : null;
  const plot2 = g2 ? new Plot(g2.canvas, { x: [0, 1], y: [-1, 1], xlabel: 't (ms)', ylabel: 'emf (V)', pad: { l: 58, r: 14, t: 10, b: 30 }, yticks: 3 }) : null;

  function state() {
    const N = val('N'), B = val('B'), I = val('I'), rpm = val('rpm'), ring = P.ringChoice ? F.params.ring : P.ring;
    const A = P.a * P.b, w = M.omegaOf(rpm), th = S.th;
    const t = w > 0 ? th / w : 0;
    return { N, B, I, rpm, ring, A, w, th, t, T: rpm > 0 ? 60 / rpm : Infinity };
  }

  function draw() {
    const s = state(), marks = [];
    view.begin();
    // pole pieces
    box(-1.5, 1.5, -3.0, -2.15, -1.25, 1.25, { color: 'ink3', alpha: 0.55, wire: false });
    box(-1.5, 1.5, 2.15, 3.0, -1.25, 1.25, { color: 'ink3', alpha: 0.55, wire: false });
    view.label([1.5, -2.58, 0], 'N', { color: 'ink', size: 15 });
    view.label([1.5, 2.58, 0], 'S', { color: 'ink', size: 15 });
    // the field between them
    if ((P.arrows || []).includes('B')) {
      for (const x of [-1.0, 1.0]) for (const z of [-0.85, 0.85]) view.arrow([x, -2.1, z], [x, 2.1, z], { color: 'teal', width: 1.1 });
      marks.push([[1.0, 2.25, 0.85], '\\vec B', 'teal', 8, -10]);
    }
    // the axle and the rings
    view.line([[-1.7, 0, 0], [ringX + 0.6, 0, 0]], { color: 'ink3', width: 2.4 });
    const { n, e, corners } = M.coil(s.th, A_D, B_D);
    const circ = (x, r, a0 = 0, a1 = M.TAU) => Array.from({ length: 41 }, (_, k) => { const a = a0 + ((a1 - a0) * k) / 40; return [x, r * Math.cos(a), r * Math.sin(a)]; });
    if (s.ring === 'split') {
      const g = 0.25, base = Math.atan2(e[2], e[1]);
      view.line(circ(ringX, 0.24, base + g, base + Math.PI - g), { color: 'warn', width: 3 });
      view.line(circ(ringX, 0.24, base + Math.PI + g, base + M.TAU - g), { color: 'warn', width: 3 });
      for (const sy of [-1, 1]) view.line([[ringX, sy * 0.27, 0], [ringX, sy * 0.62, 0]], { color: 'ink2', width: 5 });
    } else {
      for (const dx of [-0.2, 0.2]) view.line(circ(ringX + dx, 0.24), { color: 'warn', width: 3 });
      for (const dx of [-0.2, 0.2]) view.line([[ringX + dx, 0, -0.27], [ringX + dx, 0, -0.62]], { color: 'ink2', width: 5 });
    }
    // the coil
    view.line([...corners, corners[0]], { color: 'ink2', width: 3.4 });
    const centre = [0, 0, 0];
    // the current: fed (motor) or induced (generator), drawn along the two long sides
    const fed = motor ? (s.ring === 'split' ? M.commutator(s.th) : 1) : 0;
    const e0 = M.emf(1, 1, 1, 1, s.th);            // sin θ: the induced emf's sign and relative size
    const cur = motor ? fed : e0;                  // +1 circulates round n̂
    if ((P.arrows || []).includes('I') && Math.abs(cur) > 0.03) {
      for (const k of [0, 2]) {
        const p = corners[k], q = corners[(k + 1) % 4], d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
        const len = 0.38 * (motor ? 1 : Math.abs(cur)), sg = Math.sign(cur), mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
        const u = d.map((c) => (c / Math.hypot(...d)) * sg), off = e.map((c) => c * (k === 0 ? 0.16 : -0.16));
        view.arrow([mid[0] - u[0] * len + off[0], mid[1] - u[1] * len + off[1], mid[2] - u[2] * len + off[2]], [mid[0] + u[0] * len + off[0], mid[1] + u[1] * len + off[1], mid[2] + u[2] * len + off[2]], { color: 'accent', width: 2.6 });
        if (k === 0) marks.push([[mid[0] + u[0] * len + off[0], mid[1] + u[1] * len + off[1], mid[2] + u[2] * len + off[2]], 'I', 'accent', 10, -8]);
      }
    }
    // forces on the long sides (motor): vertical, F = NIaB, drawn the same length at every angle
    if (motor && (P.arrows || []).includes('F')) {
      for (const k of [0, 2]) {
        const p = corners[k], q = corners[(k + 1) % 4], mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
        const Lx = q[0] - p[0], fz = Math.sign(Lx * fed) * 1.0;     // (L x̂) × (B ŷ) = L B ẑ
        view.arrow(mid, [mid[0], mid[1], mid[2] + fz], { color: 'violet', width: 2.6 });
        if (k === 0) marks.push([[mid[0], mid[1], mid[2] + fz * 1.12], '\\vec F', 'violet', 0, -4]);
      }
    }
    // the normal, or the magnetic moment μ (motor): along n̂ for a positive current
    if ((P.arrows || []).includes('mu')) {
      const sg = motor ? fed : 1, tip = n.map((c, i) => centre[i] + c * 1.35 * sg);
      view.arrow(centre, tip, { color: 'gold', width: 2.6 });
      marks.push([tip.map((c, i) => c + n[i] * 0.2 * sg), motor ? '\\vec\\mu' : '\\hat n', 'gold']);
    }
    view.end();
    place(marks);
    if (showGraph) drawGraphs(s);
    readouts(s);
  }

  function drawGraphs(s) {
    const T = s.T, tmax = Number.isFinite(T) ? 2 * T : 1, ms = 1e3;
    const curT = Number.isFinite(T) ? s.t % tmax : 0;
    if (motor) {
      const tm = s.N * s.I * s.A * s.B || 1;
      plot1.setView([0, tmax * ms], [-1.25 * tm, 1.25 * tm]);
      plot1.clear();
      const w = M.TAU / (Number.isFinite(T) ? T : 1);
      plot1.fn((x) => M.torque(s.N, s.I, s.A, s.B, w * (x / ms), s.ring), { color: 'violet', width: 2.2 });
      plot1.line(curT * ms, plot1.vy0, curT * ms, plot1.vy1, { color: 'ink3', width: 1.2, dash: [4, 3] });
      plot1.point(curT * ms, M.torque(s.N, s.I, s.A, s.B, s.th, s.ring), { color: 'violet', r: 4 });
    } else {
      const pk = M.peakEmf(s.N, s.B, s.A, s.w) || 1, fl = s.N * s.B * s.A || 1, w = s.w;
      plot1.setView([0, tmax * ms], [-1.3 * fl, 1.3 * fl]);
      plot1.clear();
      plot1.fn((x) => M.linkage(s.N, s.B, s.A, w * (x / ms)), { color: 'teal', width: 2.2 });
      plot1.line(curT * ms, plot1.vy0, curT * ms, plot1.vy1, { color: 'ink3', width: 1.2, dash: [4, 3] });
      plot1.point(curT * ms, M.linkage(s.N, s.B, s.A, s.th), { color: 'teal', r: 4 });
      plot2.setView([0, tmax * ms], [-1.3 * pk, 1.3 * pk]);
      plot2.clear();
      plot2.fn((x) => M.output(s.N, s.B, s.A, w, x / ms, s.ring), { color: 'accent', width: 2.2 });
      plot2.line(curT * ms, plot2.vy0, curT * ms, plot2.vy1, { color: 'ink3', width: 1.2, dash: [4, 3] });
      plot2.point(curT * ms, M.output(s.N, s.B, s.A, w, s.t, s.ring), { color: 'accent', r: 4 });
    }
  }

  function readouts(s) {
    const want = P.readouts || [], rows = [];
    // the angle between the actual moment (reversed by a commutator for half of each turn) and B
    const sgn = motor && s.ring === 'split' ? M.commutator(s.th) : 1;
    const folded = Math.acos(Math.max(-1, Math.min(1, sgn * Math.cos(s.th)))) / DEG;
    if (want.includes('peak')) rows.push(['peak emf $\\mathcal{E}_0 = NBA\\omega$', qty(M.peakEmf(s.N, s.B, s.A, s.w), 'V')]);
    if (want.includes('f')) rows.push(['frequency $f$', qty(s.rpm / 60, 'Hz')]);
    if (want.includes('emf')) rows.push([s.ring === 'split' ? 'output now' : 'emf now', qty(M.output(s.N, s.B, s.A, s.w, s.t, s.ring), 'V')]);
    if (want.includes('flux')) rows.push(['flux linkage $N\\Phi$', qty(M.linkage(s.N, s.B, s.A, s.th), 'Wb')]);
    if (want.includes('torque')) rows.push(['size of the torque now $|\\tau|$', qty(Math.abs(M.torque(s.N, s.I, s.A, s.B, s.th, s.ring)), 'N\\,m')]);
    if (want.includes('tmax')) rows.push(['largest torque $NIAB$', qty(s.N * s.I * s.A * s.B, 'N\\,m')]);
    if (want.includes('mu')) rows.push(['magnetic moment $\\mu = NIA$', qty(s.N * s.I * s.A, 'A\\,m^2')]);
    if (want.includes('angle')) rows.push([motor ? 'angle between $\\vec\\mu$ and $\\vec B$' : 'angle between $\\hat n$ and $\\vec B$', `${Math.round(folded)}^\\circ`]);
    if (want.includes('avg')) rows.push(['average torque over a turn', qty(M.averageTorque(s.N, s.I, s.A, s.B, s.ring), 'N\\,m')]);
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(P.caption || (motor
    ? 'Schematic, not to scale: the coil is drawn one size whatever its true sides. The forces on the long sides are always vertical and the same size; what changes with the angle is their lever arm. The coil is shown turning steadily so you can see the torque at every angle — with slip rings a real coil would only rock about θ = 0. Animation slowed (one turn ≈ 3.5 s); the graph uses the true rate.'
    : 'Schematic, not to scale: the coil is drawn one size whatever its true sides. Animation slowed: one turn ≈ 3.5 s, while the readouts and graphs use the true turning rate. Blue arrows: the direction of the induced current when the brushes are connected to a load.'));
  return { get: (k) => (k === 'angle' ? S.th / DEG : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const p = [];
  if (!MODES.includes(P.mode)) p.push(`em-generator: mode is ${MODES.join(' or ')}`);
  if (!RINGS.includes(P.ring)) p.push(`em-generator: ring is ${RINGS.join(' or ')}`);
  for (const k of ['N', 'B', 'a', 'b']) if (!(P[k] > 0)) p.push(`em-generator: ${k} must be positive`);
  if (!(P.rpm >= 0)) p.push('em-generator: rpm must be zero or positive');
  if (!(P.I >= 0)) p.push('em-generator: I must be zero or positive');
  if (P.angle !== null && P.angle !== undefined && !Number.isFinite(P.angle)) p.push('em-generator: angle is in degrees');
  for (const r of P.readouts || []) if (!READOUTS.includes(r)) p.push(`em-generator: unknown readout “${r}” (use ${READOUTS.join(', ')})`);
  for (const a of P.arrows || []) if (!ARROWS.includes(a)) p.push(`em-generator: unknown arrow “${a}” (use ${ARROWS.join(', ')})`);
  for (const s of P.sliders || []) {
    const key = typeof s === 'string' ? s : s?.key;
    if (!BUILTIN.includes(key)) { p.push(`em-generator: slider “${key}” is not one of ${BUILTIN.join(', ')}`); continue; }
    const o = sliderSpec(s, P);
    if (!(o.min < o.max) || o.value < o.min || o.value > o.max) p.push(`em-generator: slider ${key} needs min < value < max`);
  }
  return p;
}
