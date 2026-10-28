// The unit circle, three ways. A point P rides a circle — drag it, or use the
// θ slider — and its cosine and sine are drawn as the two legs of the right
// triangle under it: the shadows (projections) of P on the two axes.
//
//   circle   the circle alone: the arc from (r, 0) to P, whose length is rθ
//            (θ in radians); the cos and sin legs; optionally radian ticks
//            round the rim (1 rad, 2 rad, … — six and a bit fit), the signs of
//            (cos, sin) in each quadrant, the reference angle, and a radius
//            slider showing that θ = s/r does not depend on the size of the circle;
//   unroll   the circle beside the graph of sin θ (and/or cos θ) against θ, on
//            the same vertical scale: P's height is carried straight across,
//            and the curve is traced up to the current θ — the sine curve is
//            the circle unrolled;
//   inverse  a value v and every angle in view whose sine (cosine, tangent) is v:
//            the principal one, which arcsin (arccos, arctan) returns, lies on
//            the restricted branch drawn bold; the others are hollow.
//
//   { type: 'm0-unitcircle', params: {
//       mode: 'circle',            // 'circle' | 'unroll' | 'inverse'
//       theta: 0.9,                // starting angle, radians
//       range: [0, 2π],            // the θ slider's range, radians (also the unrolled graph's θ axis)
//       units: 'both',             // how angles print: 'deg' | 'rad' | 'both'
//       snap: 1,                   // the drag and the slider move in steps of this many degrees
//       r: 1, rslider: false,      // circle mode: radius, and a slider for it (0.5 to 2)
//       legs: true, arc: true,     // the cos and sin legs; the arc from (r, 0) to P
//       radianTicks: false, signs: false, ref: false,
//       fn: 'sin',                 // unroll: 'sin' | 'cos' | 'both'
//       inv: 'asin', v: 0.5,       // inverse: which function, and the value (−1…1; −3…3 for atan)
//       invChoice: true,           // inverse: offer arcsin / arccos / arctan
//       controls: true,            // the θ (or v) slider
//       readout: true,
//       hide: [],                  // readouts printed “?”: theta sin cos tan arc ref principal other
//       labels: true,              // numbers on the canvas (P's coordinates, the inverse's angles)
//   } }
//
// get('theta') is the angle in radians (a slider item reads it); get('v') the value.

import { Plot } from '../plot.js';

const PI = Math.PI, TAU = 2 * PI;
export const defaults = {
  mode: 'circle', theta: 0.9, range: [0, TAU], units: 'both', snap: 1, r: 1, rslider: false,
  legs: true, arc: true, radianTicks: false, signs: false, ref: false, tan: false,
  fn: 'sin', inv: 'asin', v: 0.5, invChoice: true, controls: true, readout: true, hide: [], labels: true,
};
const MODES = ['circle', 'unroll', 'inverse'];
const INV = { asin: 'arcsin', acos: 'arccos', atan: 'arctan' };
const HIDE = ['theta', 'sin', 'cos', 'tan', 'arc', 'ref', 'principal', 'other'];

export function validate(P) {
  const p = [];
  if (!MODES.includes(P.mode)) p.push(`m0-unitcircle: mode is one of ${MODES.join(', ')}`);
  if (!['deg', 'rad', 'both'].includes(P.units)) p.push('m0-unitcircle: units is deg, rad or both');
  if (!['sin', 'cos', 'both'].includes(P.fn)) p.push('m0-unitcircle: fn is sin, cos or both');
  if (!INV[P.inv]) p.push('m0-unitcircle: inv is asin, acos or atan');
  if (!(Array.isArray(P.range) && P.range.length === 2 && P.range[0] < P.range[1] && P.range[1] - P.range[0] <= 4 * TAU + 1e-9)) p.push('m0-unitcircle: range is [lo, hi] in radians, at most four turns wide');
  else if (!(P.theta >= P.range[0] - 1e-9 && P.theta <= P.range[1] + 1e-9)) p.push('m0-unitcircle: theta must lie in range');
  if (!(P.r >= 0.5 && P.r <= 2)) p.push('m0-unitcircle: r must lie in [0.5, 2]');
  if (!(P.snap > 0 && P.snap <= 45)) p.push('m0-unitcircle: snap is a step in degrees, in (0, 45]');
  const vmax = P.inv === 'atan' ? 3 : 1;
  if (!(Math.abs(P.v) <= vmax)) p.push(`m0-unitcircle: v must lie in [−${vmax}, ${vmax}]`);
  for (const k of P.hide || []) if (!HIDE.includes(k)) p.push(`m0-unitcircle: unknown hide key “${k}” (use ${HIDE.join(' ')})`);
  return p;
}

// ─── angle formatting ──────────────────────────────────────────────────────
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** θ as a multiple of π (plain text) when it is a multiple of π/12, else null. */
function piText(th) {
  const n = Math.round(th / (PI / 12));
  if (Math.abs(th - n * PI / 12) > 1e-6) return null;
  if (n === 0) return '0';
  const g = gcd(Math.abs(n), 12), p = n / g, q = 12 / g;
  const num = `${p < 0 ? '−' : ''}${Math.abs(p) === 1 ? '' : Math.abs(p)}π`;
  return q === 1 ? num : `${num}/${q}`;
}
/** The same in TeX. */
function piTeX(th) {
  const n = Math.round(th / (PI / 12));
  if (Math.abs(th - n * PI / 12) > 1e-6) return null;
  if (n === 0) return '0';
  const g = gcd(Math.abs(n), 12), p = n / g, q = 12 / g;
  const num = `${Math.abs(p) === 1 ? '' : Math.abs(p)}\\pi`;
  return `${p < 0 ? '-' : ''}${q === 1 ? num : `\\tfrac{${num}}{${q}}`}`;
}
const r1 = (x) => String(+x.toFixed(1)).replace('-', '−');
const r3 = (x) => (Math.abs(x) < 5e-4 ? '0' : String(+x.toFixed(3)));
const degText = (th) => `${r1(th * 180 / PI)}°`;
const radText = (th) => `${r3(th)} rad`.replace('-', '−');
function angleText(th, units) {
  if (units === 'deg') return degText(th);
  const p = piText(th);
  if (units === 'rad') return p ? `${p} rad` : radText(th);
  return `${degText(th)} = ${p ? p : r3(th).replace('-', '−')} rad`;
}
function angleTeX(th, units) {
  const d = `${+(th * 180 / PI).toFixed(1)}^\\circ`, p = piTeX(th), r = `${+th.toFixed(3)}`;
  if (units === 'deg') return d;
  if (units === 'rad') return `${p ?? r}\\,\\text{rad}`;
  if (p === '0') return `0^\\circ = 0\\,\\text{rad}`;
  return `${d} = ${p ? `${p} \\approx ` : ''}${r}\\,\\text{rad}`;
}
const num3 = (x) => (Math.abs(x) < 5e-4 ? '0' : String(+x.toFixed(3)));

// ─── the simulation ────────────────────────────────────────────────────────
export function mount(F, P) {
  const mode = P.mode;
  const wide = mode !== 'circle';
  const { canvas } = F.canvas({ aspect: wide ? 'wide' : '', label: mode === 'unroll' ? 'A point going round the unit circle beside the graph of its height against the angle' : mode === 'inverse' ? 'The angles on the unit circle that share one sine, cosine or tangent, and the principal branch' : 'The unit circle with a point at angle θ and its cosine and sine as projections on the axes' });
  const hidden = new Set(P.hide || []);
  const snapRad = (P.snap * PI) / 180;
  const [lo, hi] = P.range;
  const thetaLabel = P.units === 'deg' ? 'Angle $\\theta$' : 'Angle $\\theta$ (drag $P$ too)';
  if (mode !== 'inverse') {
    if (P.controls) F.slider({ key: 'theta', label: thetaLabel, min: lo, max: hi, step: snapRad, value: P.theta, fmt: (v) => angleTeX(v, P.units), explain: P.units === 'deg' ? 'Measured anticlockwise from the positive $x$-axis.' : 'Anticlockwise from the positive $x$-axis. In radians, $\\theta$ is the arc length on a circle of radius 1.' });
    else F.params.theta = P.theta;
    if (mode === 'circle' && P.rslider) F.slider({ key: 'r', label: 'Radius $r$', min: 0.5, max: 2, step: 0.05, value: P.r, explain: 'A bigger circle: the arc $s$ grows with $r$, but $\\theta = s/r$ does not change.' });
    else F.params.r = mode === 'circle' ? P.r : 1;
    if (mode === 'unroll' && P.fnChoice) F.choice({ key: 'fn', label: 'Graph', options: [['sin', 'sine'], ['cos', 'cosine'], ['both', 'both']], value: P.fn, explain: 'The sine is the height of $P$; the cosine is its horizontal position.' });
    else F.params.fn = P.fn;
  } else {
    if (P.invChoice) F.choice({ key: 'inv', label: 'Inverse function', options: [['asin', 'arcsin'], ['acos', 'arccos'], ['atan', 'arctan']], value: P.inv, explain: 'Each returns one angle, from its own restricted range (bold).' });
    else F.params.inv = P.inv;
    const vs = P.controls ? F.slider({ key: 'v', label: 'Value $v$', min: -1, max: 1, step: 0.01, value: P.inv === 'atan' ? 0.5 : P.v, explain: 'The sine or cosine you start from: always between $-1$ and $1$.' }) : null;
    const vt = P.controls ? F.slider({ key: 'vt', label: 'Value $v$ (a slope)', min: -3, max: 3, step: 0.05, value: P.inv === 'atan' ? P.v : 1, explain: 'A tangent can be any number: it is the slope of the ray.' }) : null;
    if (!P.controls) { F.params.v = P.inv === 'atan' ? 0.5 : P.v; F.params.vt = P.inv === 'atan' ? P.v : 1; }
    const show = () => { if (vs) vs.node.hidden = F.params.inv === 'atan'; if (vt) vt.node.hidden = F.params.inv !== 'atan'; };
    show();
    F.onChange((k) => { if (k === 'inv') show(); });
  }
  F.onChange(() => draw());

  const left = new Plot(canvas, { x: [-1.3, 1.3], y: [-1.3, 1.3], equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false });
  const right = wide ? new Plot(canvas, { x: [0, 1], y: [-1.3, 1.3], xlabel: '', ylabel: '', xticks: 0, yticks: 4 }) : null;

  // the point P is dragged round the circle: the angle follows, unwrapped so it never jumps a turn
  if (mode !== 'inverse') {
    left.handle(() => { const r = F.params.r; return [r * Math.cos(F.params.theta), r * Math.sin(F.params.theta)]; }, (x, y) => {
      let th = Math.atan2(y, x);
      const cur = F.params.theta;
      th += TAU * Math.round((cur - th) / TAU);
      th = Math.round(th / snapRad) * snapRad;
      th = Math.max(lo, Math.min(hi, th));
      F.set('theta', th);
    }, { hollow: true });
  }

  function layout() {
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300;
    if (!wide) { left.o.pad = { l: 10, r: 10, t: 10, b: 10 }; return; }
    const pad = { t: 12, b: 24 };
    const side = H - pad.t - pad.b;
    left.o.pad = { l: 8, r: W - side - 16, t: pad.t, b: pad.b };
    right.o.pad = { l: side + 46, r: 14, t: pad.t, b: pad.b };
  }

  function wedge(pl, r, a, b, o) {
    const n = Math.max(8, Math.ceil(Math.abs(b - a) * 30)), pts = [[0, 0]];
    for (let i = 0; i <= n; i++) { const t = a + ((b - a) * i) / n; pts.push([r * Math.cos(t), r * Math.sin(t)]); }
    pl.path(pts, { close: true, fill: o.color, fillAlpha: o.alpha ?? 0.18, stroke: false });
  }
  function arcPath(pl, r, a, b, o) {
    const n = Math.max(8, Math.ceil(Math.abs(b - a) * 40)), pts = [];
    for (let i = 0; i <= n; i++) { const t = a + ((b - a) * i) / n; pts.push([r * Math.cos(t), r * Math.sin(t)]); }
    pl.path(pts, o);
  }
  function frameAxes(pl, R) {
    pl.line(-1.22 * R, 0, 1.22 * R, 0, { color: 'ink4', width: 1.2 });
    pl.line(0, -1.22 * R, 0, 1.22 * R, { color: 'ink4', width: 1.2 });
  }

  function drawCircle(th) {
    const r = F.params.r, R = mode === 'circle' && P.rslider ? 2 : 1;
    const span = mode === 'circle' && (P.signs || P.radianTicks) ? 1.42 : 1.3;
    left.setView([-span * R, span * R], [-span * R, span * R]);
    left.clear();
    frameAxes(left, R);
    left.circle(0, 0, r, { color: 'ink3', width: 1.6 });
    const c = Math.cos(th), s = Math.sin(th), x = r * c, y = r * s;
    // the angle: a small wedge at the centre, and the arc on the rim
    wedge(left, 0.28 * r, 0, th, { color: 'gold', alpha: 0.22 });
    if (P.arc) arcPath(left, r, 0, th, { color: 'gold', width: 4 });
    if (P.ref && mode === 'circle') {
      const k = Math.round(th / PI), base = k * PI;
      if (Math.abs(th - base) > 1e-6) wedge(left, 0.5 * r, base, th, { color: 'violet', alpha: 0.28 });
    }
    if (P.radianTicks) {
      for (let k = 1; k <= 6; k++) {
        const a = k, cx = Math.cos(a), cy = Math.sin(a);
        left.line(0.93 * r * cx, 0.93 * r * cy, 1.07 * r * cx, 1.07 * r * cy, { color: 'teal', width: 2 });
        left.text(`${k}`, 1.2 * r * cx, 1.2 * r * cy, { align: 'center', color: 'teal', size: 12, weight: 650 });
      }
      left.line(0.93 * r, 0, 1.07 * r, 0, { color: 'teal', width: 2 });
    }
    if (P.signs && mode === 'circle') {
      const q = 1.13 * R;
      left.text('(+, +)', q, q, { align: 'center', color: 'ink2', size: 12 });
      left.text('(−, +)', -q, q, { align: 'center', color: 'ink2', size: 12 });
      left.text('(−, −)', -q, -q, { align: 'center', color: 'ink2', size: 12 });
      left.text('(+, −)', q, -q, { align: 'center', color: 'ink2', size: 12 });
    }
    left.line(0, 0, x, y, { color: 'ink2', width: 2 });
    if (P.legs) {
      left.line(0, 0, x, 0, { color: 'accent', width: 4 });
      left.line(x, 0, x, y, { color: 'warn', width: 4 });
      const small = Math.abs(c) < 0.18 || Math.abs(s) < 0.12;
      if (!small || Math.abs(c) >= 0.18) left.text('cos θ', x / 2, 0, { align: 'center', dy: s >= 0 ? 13 : -13, color: 'accent', size: 12, weight: 650 });
      if (!small || Math.abs(s) >= 0.12) left.text('sin θ', x, y / 2, { align: c >= 0 ? 'left' : 'right', dx: c >= 0 ? 7 : -7, color: 'warn', size: 12, weight: 650 });
    }
    left.text('θ', 0.4 * r * Math.cos(th / 2), 0.4 * r * Math.sin(th / 2), { align: 'center', color: 'gold', size: 13, weight: 700 });
    left.point(x, y, { color: 'ink', r: 5 });
    const coords = P.labels && !hidden.has('sin') && !hidden.has('cos') ? `P (${num3(c * r).replace('-', '−')}, ${num3(s * r).replace('-', '−')})` : 'P';
    left.text(coords, x, y, { align: c >= 0 ? 'left' : 'right', dx: c >= 0 ? 10 : -10, dy: s >= 0 ? -12 : 12, color: 'ink', size: 12.5, weight: 650 });
    left.text(r === 1 ? '1' : `r = ${+r.toFixed(2)}`, x / 2, y / 2, { align: 'center', dx: -9 * s, dy: -9 * c, color: 'ink3', size: 11 });
    left.drawHandles();
  }

  function piTicks(pl, a, b, units) {
    const step = b - a > 3 * TAU ? PI : PI / 2;
    for (let t = Math.ceil(a / step - 1e-9) * step; t <= b + 1e-9; t += step) {
      if (Math.abs(t) < 1e-9) continue;
      pl.line(t, -0.06, t, 0.06, { color: 'ink3', width: 1.2 });
      const lab = units === 'deg' ? `${Math.round(t * 180 / PI)}°` : piText(t);
      pl.text(lab, t, pl.vy0, { align: 'center', dy: 11, color: 'ink3', size: 11, halo: false });
    }
  }

  function drawUnroll(th) {
    const fnSel = F.params.fn;
    right.setView([lo - 0.05 * (hi - lo), hi + 0.04 * (hi - lo)], [-1.3, 1.3]);
    right.clear();
    piTicks(right, lo, hi, P.units);
    const both = fnSel === 'both';
    const curves = [];
    if (fnSel === 'sin' || both) curves.push(['warn', Math.sin, 'sin θ']);
    if (fnSel === 'cos' || both) curves.push(['accent', Math.cos, 'cos θ']);
    for (const [col, f, name] of curves) {
      right.fn(f, { domain: [lo, hi], color: col, width: 1.3, alpha: 0.35, dash: [4, 4] });
      if (th > lo) right.fn(f, { domain: [lo, th], color: col, width: 3 });
      right.point(th, f(th), { color: col, r: 5 });
      const at = lo + 0.12 * (hi - lo);
      right.text(name, at, f(at), { dx: 4, dy: f(at) > 0.6 ? 16 : -14, color: col, size: 12, weight: 650 });
    }
    // P's height, carried straight across (both panels share one vertical scale)
    if (fnSel !== 'cos') {
      const y = Math.sin(th), g = right.ctx;
      g.save(); g.strokeStyle = right.color('warn'); g.globalAlpha = 0.6; g.setLineDash([5, 5]); g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(left.X(Math.cos(th)), left.Y(y)); g.lineTo(right.X(th), right.Y(y)); g.stroke(); g.restore();
    }
    right.text('θ', right.R - 4, right.Y(0) - 10, { screen: true, align: 'right', color: 'ink3', size: 12 });
  }

  function drawInverse() {
    const inv = F.params.inv, v = inv === 'atan' ? F.params.vt : F.params.v;
    left.setView([-1.3, 1.3], [-1.3, 1.3]);
    left.clear();
    frameAxes(left, 1);
    left.circle(0, 0, 1, { color: 'ink3', width: 1.6 });
    // the principal range, bold on the rim
    const [pa, pb] = inv === 'acos' ? [0, PI] : [-PI / 2, PI / 2];
    arcPath(left, 1, pa, pb, { color: 'good', width: 5 });
    let p1, p2;
    if (inv === 'asin') { p1 = Math.asin(v); p2 = PI - p1; left.line(-1.25, v, 1.25, v, { color: 'warn', width: 1.6, dash: [6, 5] }); }
    else if (inv === 'acos') { p1 = Math.acos(v); p2 = -p1; left.line(v, -1.25, v, 1.25, { color: 'accent', width: 1.6, dash: [6, 5] }); }
    else { p1 = Math.atan(v); p2 = p1 + PI; left.line(-1.25 * Math.cos(p1), -1.25 * Math.sin(p1), 1.25 * Math.cos(p1), 1.25 * Math.sin(p1), { color: 'violet', width: 1.6, dash: [6, 5] }); }
    wedge(left, 0.3, 0, p1, { color: 'gold', alpha: 0.25 });
    left.line(0, 0, Math.cos(p1), Math.sin(p1), { color: 'gold', width: 2.4 });
    left.line(0, 0, Math.cos(p2), Math.sin(p2), { color: 'ink3', width: 1.4, dash: [4, 4] });
    const same = Math.abs(Math.cos(p1) - Math.cos(p2)) < 1e-9 && Math.abs(Math.sin(p1) - Math.sin(p2)) < 1e-9;
    if (!same) left.point(Math.cos(p2), Math.sin(p2), { color: 'bg', ring: 'ink2', r: 5 });
    left.point(Math.cos(p1), Math.sin(p1), { color: 'gold', r: 6 });
    if (P.labels && !hidden.has('principal')) left.text(angleText(p1, P.units === 'both' ? 'deg' : P.units), Math.cos(p1), Math.sin(p1), { align: Math.cos(p1) >= -0.01 ? 'left' : 'right', dx: Math.cos(p1) >= -0.01 ? 10 : -10, dy: Math.sin(p1) >= 0 ? -12 : 12, color: 'gold', size: 12, weight: 700 });
    const tag = { asin: 'principal: −90° to 90°', acos: 'principal: 0° to 180°', atan: 'principal: −90° to 90°, ends excluded' }[inv];
    left.text(tag, left.L + 4, left.B + 12, { screen: true, color: 'good', size: 11, halo: false });

    // the graph: the whole periodic curve faint, the restricted branch bold, every crossing of y = v
    const f = inv === 'asin' ? Math.sin : inv === 'acos' ? Math.cos : Math.tan;
    const yr = inv === 'atan' ? 3.4 : 1.3, a = -TAU, b = TAU;
    right.setView([a - 0.15, b + 0.15], [-yr, yr]);
    right.clear();
    piTicks(right, a, b, P.units === 'both' ? 'rad' : P.units);
    right.fn(f, { domain: [a, b], color: 'ink3', width: 1.4, alpha: 0.55 });
    const [ba, bb] = inv === 'acos' ? [0, PI] : inv === 'asin' ? [-PI / 2, PI / 2] : [-PI / 2 + 0.02, PI / 2 - 0.02];
    right.fn(f, { domain: [ba, bb], color: 'good', width: 4 });
    right.line(a - 0.15, v, b + 0.15, v, { color: inv === 'acos' ? 'accent' : inv === 'asin' ? 'warn' : 'violet', width: 1.4, dash: [6, 5] });
    const period = inv === 'atan' ? PI : TAU;
    const roots = [];
    for (const base of inv === 'atan' ? [p1] : [p1, p2]) for (let k = -4; k <= 4; k++) { const t = base + k * period; if (t >= a - 1e-9 && t <= b + 1e-9 && !roots.some((u) => Math.abs(u - t) < 1e-6)) roots.push(t); }
    for (const t of roots) if (Math.abs(t - p1) > 1e-6) right.point(t, v, { color: 'bg', ring: 'ink2', r: 4.5 });
    right.point(p1, v, { color: 'gold', r: 6 });
    right.text('θ', right.R - 4, right.Y(0) - 10, { screen: true, align: 'right', color: 'ink3', size: 12 });
    return { v, p1, p2, inv };
  }

  function draw() {
    layout();
    if (mode === 'inverse') {
      const { v, p1, p2, inv } = drawInverse();
      if (!P.readout) return;
      const other = inv === 'atan' ? p2 : p2;
      const q = (k, val) => (hidden.has(k) ? '?' : val);
      const fname = { asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan' }[inv];
      F.readout([
        ['value $v$', num3(v)],
        [`$${fname} v$ (principal)`, q('principal', angleTeX(p1, P.units))],
        ['another angle with the same value', q('other', angleTeX(other, P.units))],
      ]);
      return;
    }
    const th = F.params.theta;
    drawCircle(th);
    if (mode === 'unroll') drawUnroll(th);
    if (!P.readout) return;
    const r = F.params.r, q = (k, val) => (hidden.has(k) ? '?' : val);
    const rows = [['$\\theta$', q('theta', angleTeX(th, P.units))], ['$\\cos\\theta$', q('cos', num3(Math.cos(th)))], ['$\\sin\\theta$', q('sin', num3(Math.sin(th)))]];
    if (P.tan) rows.push(['$\\tan\\theta$', q('tan', Math.abs(Math.cos(th)) < 1e-9 ? '\\text{not defined}' : num3(Math.tan(th)))]);
    if (mode === 'circle' && (P.rslider || P.arc)) rows.push([P.rslider ? 'arc $s = r\\theta$' : 'arc length', q('arc', num3(r * th))]);
    if (mode === 'circle' && P.ref) { const k = Math.round(th / PI); rows.push(['reference angle', q('ref', angleTeX(Math.abs(th - k * PI), P.units))]); }
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(mode === 'unroll'
    ? 'Both panels share one vertical scale, so the height of P is carried straight across. The θ axis is to scale in radians: one unit of θ is one unit of arc on the unit circle.'
    : mode === 'inverse'
      ? 'Bold green: the restricted range each inverse function answers from. Hollow points are other angles with the same sine, cosine or tangent, which the inverse function does not return.'
      : 'Angles are measured anticlockwise from the positive x-axis. The legs of the triangle are the shadows of P on the two axes: cos θ across, sin θ up.');
  return { get: (k) => F.params[k] };
}
