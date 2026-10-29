// Linked motion graphs. An object moves along a line — a cart on a track, or a
// ball moving up and down — and its position, velocity and acceleration are
// graphed against time on stacked panels that share one time axis. A time
// cursor (a slider, or Play) runs through the motion. Optional tangent lines
// show that the slope of each graph is the value of the next one down; optional
// shading shows that the area under v–t is the displacement and the area under
// a–t is the change in velocity. The motion comes entirely from data:
//
//   { type: 'mech-graphlink', params: {
//       a: '-g',                    // exactly one of x, v, a: expressions of t and the sliders
//       // or segments: [{ a: 2, dt: 3 }, { a: 0, dt: 4 }]   (numbers or expressions)
//       x0: 'h', v0: 'v0',          // initial position and velocity (numbers or expressions)
//       T: 4,                       // duration in s (number or expression; default: the segments' total)
//       breaks: ['tb'],             // instants where a jumps, so the integration stays exact
//       sliders: [...], choices: [...], constants: { g: 9.8 },
//       panels: ['x', 'v', 'a'],    // graphs, top to bottom (any subset)
//       track: 'horizontal',        // or 'vertical' (up-and-down motion, drawn as a tower), or false
//       pos: 'x',                   // the position symbol: 'y' or 'h' for vertical motion
//       ground: true,               // vertical track: draw the ground at position 0
//       labels: { x: 'altitude (m)' },          // panel labels (defaults from pos and SI units)
//       ranges: { x: [lo, hi] },    // fixed graph ranges (default: fitted to the motion)
//       marks: [{ t: 'tb', label: 'burnout' }], // labelled instants
//       time: 0, tangent: false, area: false, toggles: true, play: true,
//       readouts: ['t', 'x', 'v', 'a'],         // also 'dx' (displacement), 'dist' (distance), 'speed'
//   } }
//
// The time cursor is the slider `time`, so a question can ask the learner to
// set it ({ type: 'slider', param: 'time' }). Slider keys `t` and `time` are reserved.

import { Plot, themeColors } from '../plot.js';
import { fn } from '../model/exprfn.js';
import { motion1d } from '../model/mech-motion1d.js';

export const defaults = {
  x0: 0, v0: 0, panels: ['x', 'v', 'a'], track: 'horizontal', pos: 'x', time: 0,
  tangent: false, area: false, play: true, readouts: ['t', 'x', 'v', 'a'],
};

const PANELS = ['x', 'v', 'a'];
const READOUTS = ['t', 'x', 'v', 'a', 'dx', 'dist', 'speed'];
const RESERVED = ['t', 'time'];
const COLOR = { x: 'accent', v: 'good', a: 'warn' };

const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];

/** The motion for given parameter values. Node-safe: used by mount and by validate. */
export function build(P, env) {
  const keys = keysOf(P);
  const num = (src) => fn(src, keys)(env);
  const ft = (src) => { const f = fn(src, ['t', ...keys]); return (t) => f({ ...env, t }); };
  const spec = { x0: num(P.x0 ?? 0), v0: num(P.v0 ?? 0), breaks: (P.breaks || []).map(num), n: P.n || 600 };
  if (P.segments) spec.segments = P.segments.map((s) => ({ a: num(s.a), dt: num(s.dt) }));
  if (P.x !== undefined) spec.x = ft(P.x);
  if (P.v !== undefined) spec.v = ft(P.v);
  if (P.a !== undefined) spec.a = ft(P.a);
  spec.T = P.T !== undefined ? num(P.T) : spec.segments ? spec.segments.reduce((s, q) => s + q.dt, 0) : 10;
  return motion1d(spec);
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const panels = P.panels, compact = F.compact;
  const horizontal = P.track === 'horizontal', vertical = P.track === 'vertical';
  const panelH = compact ? 112 : 132, trackH = horizontal ? (compact ? 66 : 78) : 0, foot = 26;
  const height = Math.max(vertical ? 300 : 120, trackH + panels.length * panelH + foot);
  const { canvas } = F.canvas({ label: P.alt || 'An object moving along a line, with graphs of its position, velocity and acceleration against time', height: `${height}px` });
  const ctx = canvas.getContext('2d');
  const keys = keysOf(P);
  const sliderKeys = new Set([...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key)]);

  // the first motion uses the initial values; the time slider comes first
  const env0 = { ...(P.constants || {}), ...Object.fromEntries([...(P.sliders || []), ...(P.choices || [])].map((s) => [s.key, s.value])) };
  let M = build(P, env0);
  const timeCtl = F.slider({ key: 'time', label: 'Time $t$', min: 0, max: M.T, step: P.step || niceStep(M.T / 400), value: Math.min(P.time, M.T), unit: '\\mathrm{s}', explain: 'Moves the cursor through the motion: the dashed line marks this instant on every graph.' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  if (P.toggles ?? !compact) {
    F.toggle({ key: 'tangent', label: 'Tangent lines', value: !!P.tangent, explain: 'The slope of each graph at the cursor equals the value of the graph below it.' });
    F.toggle({ key: 'area', label: 'Areas up to the cursor', value: !!P.area, explain: 'The area under $v$–$t$ is the displacement; the area under $a$–$t$ is the change in velocity.' });
  } else { F.params.tangent = !!P.tangent; F.params.area = !!P.area; }

  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = F.params[k]; return e; };
  const S = { running: false };
  let playBtn = null;
  const anim = F.animate((dt) => {
    if (!S.running) return;
    let tn = F.params.time + dt * (P.rate || Math.max(1, M.T / 8));
    if (tn >= M.T) { tn = M.T; S.running = false; if (playBtn) playBtn.textContent = 'Replay'; }
    F.set('time', tn);
  }, { force: true });
  if (P.play !== false) {
    playBtn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; playBtn.textContent = 'Play'; return; }
      if (F.params.time >= M.T - 1e-9) F.set('time', 0);
      S.running = true; playBtn.textContent = 'Pause'; anim.start();
    } });
  }

  F.onChange((key) => {
    if (sliderKeys.has(key)) {
      M = build(P, env());
      const input = timeCtl.node.querySelector('input');
      if (input) input.max = String(M.T);
      timeCtl.set(Math.min(F.params.time, M.T));
    }
    draw();
  });

  const plots = Object.fromEntries(panels.map((k) => [k, new Plot(canvas, { x: [0, 1], y: [0, 1], xlabel: '', ylabel: '', xticks: 8, yticks: 4 })]));
  const fitted = (k) => {
    if (P.ranges?.[k]) return P.ranges[k];
    const vals = k === 'a' ? [...M.a, ...M.aLeft] : M[k];
    let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12;
    return [lo - (lo < 0 ? pad : 0.02 * (hi - lo)), hi + (hi > 0 ? pad : 0.02 * (hi - lo))];
  };
  const label = (k) => P.labels?.[k] || { x: `${P.pos} (m)`, v: 'v (m/s)', a: 'a (m/s²)' }[k];
  const HEAD = 18;

  function draw() {
    const c = themeColors();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || height;
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const tc = Math.max(0, Math.min(F.params.time, M.T));
    const now = M.at(tc);
    const left = vertical ? Math.round(Math.min(140, Math.max(96, W * 0.2))) : 0;
    const marks = (P.marks || []).map((m) => ({ t: fn(m.t, keys)(env()), label: m.label }));

    const ph = Math.max(panelH, (H - trackH - foot) / Math.max(1, panels.length));   // panels share the height
    panels.forEach((k, i) => {
      const p = plots[k];
      const y0 = trackH + i * ph, last = i === panels.length - 1;
      p.w = W; p.h = H;
      p.o.pad = { l: left + 46, r: 40, t: y0 + HEAD, b: H - (y0 + ph) + (last ? foot : 4) };
      p.setView([0, M.T], fitted(k));
      p.refreshTheme();
      axes(p, c, last);
      ctx.save();
      ctx.beginPath(); ctx.rect(p.L, p.T, p.R - p.L, p.B - p.T); ctx.clip();
      if (F.params.area && (k === 'v' || k === 'a')) shade(p, k, tc, now[k]);
      for (const m of marks) p.line(m.t, p.vy0, m.t, p.vy1, { color: 'ink4', width: 1.2, dash: [3, 4] });
      const pts = [];
      for (let j = 0; j < M.t.length; j++) { if (k === 'a' && M.aLeft[j] !== M.a[j]) pts.push([M.t[j], M.aLeft[j]]); pts.push([M.t[j], M[k][j]]); }
      p.path(pts, { color: COLOR[k], width: 2.3 });
      if (F.params.tangent && k !== 'a') {
        const slope = k === 'x' ? now.v : now.a, w = M.T * 0.16;
        p.line(tc - w, now[k] - slope * w, tc + w, now[k] + slope * w, { color: 'gold', width: 2 });
      }
      ctx.restore();
      p.line(tc, p.vy0, tc, p.vy1, { color: 'ink3', width: 1.1, dash: [4, 4] });
      p.point(tc, now[k], { color: COLOR[k], r: 4.5 });
      p.text(label(k), p.L, y0 + HEAD / 2 + 1, { screen: true, color: COLOR[k], weight: 650, size: 12 });
      if (i === 0) for (const m of marks) if (m.label) p.text(m.label, p.X(m.t) + 4, y0 + HEAD / 2 + 1, { screen: true, color: 'ink3', size: 11 });
    });
    if (horizontal) drawTrack(c, W, tc, now);
    if (vertical) drawTower(c, left, H, tc, now);

    const f = fmtNum, u = (s) => `\\,\\mathrm{${s}}`;
    const rows = {
      t: ['$t$', f(tc) + u('s')], x: [`$${P.pos}$`, f(now.x) + u('m')], v: ['$v$', f(now.v) + u('m/s')], a: ['$a$', f(now.a) + u('m/s^2')],
      dx: [`displacement $\\Delta ${P.pos}$`, f(now.x - M.x[0]) + u('m')], dist: ['distance travelled', f(M.dist(tc)) + u('m')], speed: ['speed $|v|$', f(Math.abs(now.v)) + u('m/s')],
    };
    const out = (P.readouts || []).map((k) => rows[k]);
    if (F.params.tangent && panels.includes('x')) out.push([`slope of ${P.pos}–t`, f(now.v) + u('m/s')]);
    if (F.params.tangent && panels.includes('v')) out.push(['slope of v–t', f(now.a) + u('m/s^2')]);
    if (F.params.area && panels.includes('v')) out.push(['area under v–t', f(now.x - M.x[0]) + u('m')]);
    if (F.params.area && panels.includes('a')) out.push(['area under a–t', f(now.v - M.v[0]) + u('m/s')]);
    F.readout(out);
  }

  // grid, the zero line, value labels on the left, and the shared time axis under the last panel
  function axes(p, c, last) {
    p.grid();
    const g = ctx;
    g.save();
    g.strokeStyle = c.line3; g.lineWidth = 1.2;
    if (p.vy0 <= 0 && p.vy1 >= 0) { const y = Math.round(p.Y(0)) + 0.5; g.beginPath(); g.moveTo(p.L, y); g.lineTo(p.R, y); g.stroke(); }
    const x = Math.round(p.L) + 0.5;
    g.beginPath(); g.moveTo(x, p.T); g.lineTo(x, p.B); g.stroke();
    g.fillStyle = c.ink3; g.font = '10.5px Inter, system-ui, sans-serif'; g.textAlign = 'right'; g.textBaseline = 'middle';
    for (const tk of Plot.ticks(p.vy0, p.vy1, 4)) g.fillText(tickText(tk), p.L - 5, p.Y(tk));
    if (last) {
      g.textAlign = 'center'; g.textBaseline = 'top';
      for (const tk of Plot.ticks(p.vx0, p.vx1, 8)) g.fillText(tickText(tk), p.X(tk), p.B + 5);
      g.textAlign = 'left'; g.fillStyle = c.ink2; g.font = '12px Inter, system-ui, sans-serif';
      g.fillText('t (s)', p.R + 8, p.B + 4);
    }
    g.restore();
  }

  // area between a graph and the time axis, from 0 to the cursor: above the axis in the
  // graph's colour, below it in red (it counts as negative)
  function shade(p, k, tc, yc) {
    const up = [[0, 0]], dn = [[0, 0]];
    for (let j = 0; j < M.t.length && M.t[j] <= tc; j++) {
      if (k === 'a' && M.aLeft[j] !== M.a[j]) { up.push([M.t[j], Math.max(0, M.aLeft[j])]); dn.push([M.t[j], Math.min(0, M.aLeft[j])]); }
      up.push([M.t[j], Math.max(0, M[k][j])]); dn.push([M.t[j], Math.min(0, M[k][j])]);
    }
    up.push([tc, Math.max(0, yc)], [tc, 0]); dn.push([tc, Math.min(0, yc)], [tc, 0]);
    p.path(up, { close: true, fill: COLOR[k], fillAlpha: 0.24, stroke: false });
    p.path(dn, { close: true, fill: 'bad', fillAlpha: 0.24, stroke: false });
  }

  const vmax = () => Math.max(1e-9, ...M.v.map(Math.abs)), amax = () => Math.max(1e-9, ...M.a.map(Math.abs), ...M.aLeft.map(Math.abs));
  const span = (vals) => { let lo = Math.min(...vals), hi = Math.max(...vals); if (hi - lo < 1e-9) { lo -= 1; hi += 1; } const d = (hi - lo) * 0.04; return [lo - d, hi + d]; };

  // a cart on a horizontal track, with a strobe trail and its v and a arrows
  function drawTrack(c, W, tc, now) {
    const xr = P.ranges?.x || span(M.x);
    const L = 62, R = W - 62, y = trackH - 24;
    const X = (x) => L + ((x - xr[0]) / (xr[1] - xr[0])) * (R - L);
    ctx.save();
    ctx.strokeStyle = c.line3; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(W - 10, y); ctx.stroke();
    ctx.fillStyle = c.ink3; ctx.font = '10.5px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (const tk of Plot.ticks(xr[0], xr[1], Math.max(4, Math.round((R - L) / 70)))) {
      ctx.fillStyle = tk === 0 ? c.ink : c.ink3;
      ctx.fillRect(Math.round(X(tk)), y, 1, tk === 0 ? 9 : 5);
      ctx.fillText(tickText(tk), X(tk), y + 9);
    }
    ctx.textAlign = 'right'; ctx.fillStyle = c.ink2; ctx.font = '12px Inter, system-ui, sans-serif'; ctx.fillText(`${P.pos} (m)`, W - 10, y + 9);
    // strobe trail: where the object was at equal time steps
    const dts = M.T / 20;
    ctx.fillStyle = c.ink4;
    for (let k = 0; k * dts < tc - 1e-9; k++) { ctx.beginPath(); ctx.arc(X(M.at(k * dts).x), y - 7, 2.6, 0, Math.PI * 2); ctx.fill(); }
    // the cart
    const cx = X(now.x), cw = 26, ch = 14;
    ctx.fillStyle = c.accent; ctx.globalAlpha = 0.95;
    roundRect(ctx, cx - cw / 2, y - ch - 6, cw, ch, 4); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.panel; ctx.strokeStyle = c.ink2; ctx.lineWidth = 1.2;
    for (const wx of [-7, 7]) { ctx.beginPath(); ctx.arc(cx + wx, y - 4, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    // arrows: lengths proportional to v and a (scaled to the largest values in the motion)
    const kv = 50 / vmax(), ka = 40 / amax();
    arrow(ctx, cx, y - ch - 13, cx + now.v * kv, y - ch - 13, c.good, 'v');
    arrow(ctx, cx, y - ch - 26, cx + now.a * ka, y - ch - 26, c.warn, 'a');
    ctx.restore();
  }

  // a ball moving up and down beside a height scale, with a strobe trail and its v and a arrows
  function drawTower(c, left, H, tc, now) {
    const yr = P.ranges?.x || fitted('x');
    const top = 22, bot = H - 48;
    const Y = (v) => bot - ((v - yr[0]) / (yr[1] - yr[0])) * (bot - top);
    const cx = Math.round(left * 0.58);
    ctx.save();
    ctx.fillStyle = c.ink3; ctx.font = '10.5px Inter, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = c.line3; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(30, top); ctx.lineTo(30, bot); ctx.stroke();
    for (const tk of Plot.ticks(yr[0], yr[1], 6)) { ctx.fillRect(30, Math.round(Y(tk)), 5, 1); ctx.fillText(String(+tk.toPrecision(6)), 26, Y(tk)); }
    if (P.ground !== false && yr[0] <= 0 && yr[1] >= 0) {
      const gy = Y(0);
      ctx.strokeStyle = c.ink3; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(30, gy); ctx.lineTo(left - 6, gy); ctx.stroke();
      ctx.lineWidth = 1;
      for (let gx = 34; gx < left - 6; gx += 8) { ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 6, gy + 6); ctx.stroke(); }
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillStyle = c.ink2;
    ctx.fillText(`${P.pos} (m)`, 4, top - 2);
    // strobe trail: rising images on the left of the ball's line, falling ones on the right
    const dts = M.T / 20;
    ctx.fillStyle = c.ink4;
    for (let k = 0; k * dts < tc - 1e-9; k++) {
      const s = M.at(k * dts);
      ctx.beginPath(); ctx.arc(cx + (s.v >= 0 ? -9 : 9), Y(s.x), 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = c.accent;
    ctx.beginPath(); ctx.arc(cx, Y(now.x), 7.5, 0, Math.PI * 2); ctx.fill();
    const kv = 44 / vmax(), ka = 36 / amax(), by = Y(now.x);
    arrow(ctx, cx + 20, by, cx + 20, by - now.v * kv, c.good, 'v');
    arrow(ctx, cx - 20, by, cx - 20, by - now.a * ka, c.warn, 'a');
    ctx.restore();
  }

  F.draw(draw);
  F.caption('A point object moving along one straight line. The graphs are exact for the motion described; the arrows on the object show the directions of v and a, with lengths relative to the largest values in this motion.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const problems = [];
  const keys = keysOf(P);
  const given = ['x', 'v', 'a', 'segments'].filter((k) => P[k] !== undefined);
  if (given.length !== 1) problems.push(`give exactly one of x, v, a or segments (got ${given.join(', ') || 'none'})`);
  for (const s of P.sliders || []) {
    if (RESERVED.includes(s.key)) problems.push(`slider key “${s.key}” is reserved`);
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`slider ${s.key} needs a label`);
  }
  for (const c of P.choices || []) if (RESERVED.includes(c.key)) problems.push(`choice key “${c.key}” is reserved`);
  const tryParse = (src, vars, where) => {
    if (src === undefined || typeof src === 'number') return;
    try { fn(src, vars); } catch (e) { problems.push(`${where}: “${src}” — ${e.message}`); }
  };
  for (const k of ['x', 'v', 'a']) tryParse(P[k], ['t', ...keys], k);
  for (const k of ['x0', 'v0', 'T']) tryParse(P[k], keys, k);
  for (const b of P.breaks || []) tryParse(b, keys, 'break');
  for (const s of P.segments || []) { tryParse(s.a, keys, 'segment a'); tryParse(s.dt, keys, 'segment dt'); }
  for (const m of P.marks || []) tryParse(m.t, keys, 'mark');
  for (const p of P.panels) if (!PANELS.includes(p)) problems.push(`unknown panel “${p}” (use x, v, a)`);
  if (!['horizontal', 'vertical', false].includes(P.track)) problems.push('track must be horizontal, vertical or false');
  if (!P.panels.length && !P.track) problems.push('nothing to draw: no panels and no track');
  for (const r of P.readouts || []) if (!READOUTS.includes(r)) problems.push(`unknown readout “${r}”`);
  for (const [k, r] of Object.entries(P.ranges || {})) if (!(Array.isArray(r) && r[0] < r[1])) problems.push(`range ${k} must be [lo, hi]`);
  if (problems.length) return problems;
  // the motion must be finite everywhere, at the initial values and at each slider's extremes
  const base = { ...(P.constants || {}), ...Object.fromEntries([...(P.sliders || []), ...(P.choices || [])].map((s) => [s.key, s.value])) };
  const trials = [base];
  for (const s of P.sliders || []) trials.push({ ...base, [s.key]: s.min }, { ...base, [s.key]: s.max });
  for (const c of P.choices || []) for (const [v] of c.options || []) trials.push({ ...base, [c.key]: v });
  for (const env of trials) {
    try {
      const m = build(P, env);
      if (![...m.x, ...m.v, ...m.a].every(Number.isFinite)) { problems.push(`the motion is not finite everywhere on [0, T] (at ${JSON.stringify(env)})`); break; }
      if (env === base && (P.time < 0 || P.time > m.T)) problems.push('time must lie in [0, T]');
    } catch (e) { problems.push(`motion: ${e.message}`); break; }
  }
  return problems;
}

const tickText = (t) => String(+t.toPrecision(6));

function niceStep(raw) {
  for (const s of [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]) if (s >= raw) return s;
  return 10;
}

function fmtNum(v) {
  if (!Number.isFinite(v)) return '\\text{—}';
  const a = Math.abs(v);
  if (a < 5e-10) return '0';
  if (a >= 1e5 || a < 1e-3) return v.toExponential(2).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`);
  return String(+v.toPrecision(3));
}

function arrow(ctx, x0, y0, x1, y1, color, label) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 3) return;
  const ux = (x1 - x0) / len, uy = (y1 - y0) / len, hd = Math.min(8, len / 2);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.6, y1 - uy * hd * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hd - uy * hd * 0.55, y1 - uy * hd + ux * hd * 0.55); ctx.lineTo(x1 - ux * hd + uy * hd * 0.55, y1 - uy * hd - ux * hd * 0.55); ctx.closePath(); ctx.fill();
  ctx.font = '600 11px Inter, system-ui, sans-serif'; ctx.textBaseline = 'middle';
  if (Math.abs(ux) > 0.5) { ctx.textAlign = ux > 0 ? 'left' : 'right'; ctx.fillText(label, x1 + ux * 5, y1); }
  else { ctx.textAlign = 'center'; ctx.fillText(label, x1, y1 + (uy > 0 ? 9 : -9)); }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
