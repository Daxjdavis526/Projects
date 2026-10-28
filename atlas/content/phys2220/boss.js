// The PHYS 2220 boss, "The Maxwell Gauntlet": one imagined deep-space probe,
// Lodestar, 40 AU from the Sun. Each problem mixes two or three of the
// course's skills the way the probe's engineers would meet them — two-way
// Doppler tracking as Doppler shifts plus beats; the dish's beam as the
// diffraction limit plus a wave's intensity; the power system as Kirchhoff's
// rules, an RC discharge into parallel loads, and the momentum of radiated
// heat with radioactive decay (the Pioneer anomaly); the magnetometer as a
// generator coil, a dipole's 1/r³ field and a pickup ion's E×B drift; the
// hull charged by the photoelectric effect; the star tracker's fold prism as
// Snell's law, total internal reflection and dispersion; the spectrometer as
// Bohr's levels through a grating and a Compton camera. Every item names the
// lesson whose skill it measures; every number comes from its generator.
import { boss, mcq, num } from '../../src/core/content.js';
import { tn } from './_maxwell.js';
import { circuit } from './_circuits.js';

const t = String.raw;
// the constants as the prompts quote them, so a key always matches its prompt
const C = 2.998e8;            // m/s
const AU = 1.496e11;          // m
const KC = 8.99e9;            // N m²/C²
const QE = 1.602e-19;         // C (and J per eV)
const U = 1.661e-27;          // kg, atomic mass unit
const MEC2 = 511.0;           // keV, electron rest energy
const HC = 1240;              // eV nm
const T_HALF = 87.7;          // yr, plutonium-238
const YEARS = 12;             // since launch, in the story
const DIST = 40;              // AU from the Sun (and, near enough, from Earth)
const F_UP = 7.15e9;          // Hz, the X-band uplink
const RATIO = 880 / 749;      // the X-band transponder's turnaround ratio
const F_DOWN = 8.40e9;        // Hz, the downlink, as the prompts round it
const V_EQ = 465.1;           // m/s, Earth's rotation speed at the equator
const B_OUT = 0.15e-9;        // T, the interplanetary field near 40 AU (for the pickup picture and explanation)
const DEG = Math.PI / 180;
const r4 = (v) => +(+v).toFixed(4);
const apart = (errors, key, rel = 0.03) => errors.filter((e) => Number.isFinite(e.value) && Math.abs(e.value - key) > rel * Math.abs(key));

// ── picture pieces (graph curves, fills and labels) ──────────────────────────
const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}) });
const poly = (pts, color, width, dash) => pts.slice(1).map((p, k) => seg(pts[k], p, color, width, dash));
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0.01, color, label, labelDx: dx, labelDy: dy });
const dot = (x, y, color = 'gold', r = 5) => ({ x: r4(x), y: r4(y), r, color });
const disk = (cx, cy, R, color = 'ink2', alpha = 0.3) => ({ fn: `${r4(cy)} + sqrt(max(0, ${r4(R * R)} - (x - ${r4(cx)})^2))`, lower: `${r4(cy)} - sqrt(max(0, ${r4(R * R)} - (x - ${r4(cx)})^2))`, from: r4(cx - R), to: r4(cx + R), color, alpha });
const fill = (x0, y0, x1, y1, color = 'accent', alpha = 0.3) => ({ fn: String(r4(y1)), lower: String(r4(y0)), from: r4(x0), to: r4(x1), color, alpha });
const rect = (x0, y0, x1, y1, color = 'ink2', width = 1.6) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], color, width);
const picture = (params, caption) => ({ type: 'graph', params: { equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', ...params }, caption });

/** A resistor's zigzag between two points. */
function zigzag(a, b, { n = 5, w = 0.2, color = 'warn', width = 2 } = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), px = -dy / L, py = dx / L, pts = [a];
  for (let i = 1; i < 2 * n; i++) { const s = i / (2 * n), o = i % 2 ? w : -w; pts.push([a[0] + dx * s + px * o, a[1] + dy * s + py * o]); }
  pts.push(b);
  return poly(pts, color, width);
}

// ── round 1 pictures ─────────────────────────────────────────────────────────
function beatPic(Br, Bs) {
  const mid = (Br + Bs) / 2, half = (Bs - Br) / 2, pad = 0.9 * (Bs - Br);
  return {
    type: 'graph',
    params: {
      x: [-0.6, 13.4], y: [r4(Br - pad), r4(Bs + pad)], aspect: 'wide', xlabel: 'hours after the probe rises', ylabel: 'beat frequency', yticks: 0, xticks: 6,
      curves: [{ fn: `${r4(mid)} - ${r4(half)}*cos(pi*x/12)`, domain: [0, 12], color: 'accent', width: 2.2 }],
      points: [{ x: 0, y: Br, r: 5, color: 'gold', label: `rises: ${Br.toFixed(1)} kHz`, labelDx: 8, labelDy: 18 },
        { x: 12, y: Bs, r: 5, color: 'gold', label: `sets: ${Bs.toFixed(1)} kHz`, labelDx: -118, labelDy: -8 }],
      alt: 'The beat frequency rising smoothly from the moment the probe rises to the moment it sets',
    },
    caption: 'The beat frequency through one pass, from the probe’s rising to its setting, as Earth’s turning carries the station first toward the probe and then away from it. The two end values are the measurements; the vertical scale is stretched to show the change.',
  };
}

function beamPic() {
  // side view: the dish at the left, the beam's central disc opening toward Earth; the angle is hugely exaggerated
  const X = 11, H = 2.3, h0 = 0.9, s = (H - h0) / X;
  return picture({
    x: [-2.6, 13.8], y: [-3.3, 3.3],
    shade: [{ fn: `${h0} + ${r4(s)}*x`, lower: `-${h0} - ${r4(s)}*x`, from: 0, to: X, color: 'gold', alpha: 0.14 }],
    curves: [
      { param: ['-0.25 + 0.3086*t^2', 't'], t: [-0.9, 0.9], color: 'ink2', width: 3 },
      ...rect(-1.4, -0.35, -0.3, 0.35, 'ink2', 1.8),
      seg([0, h0], [X, H], 'gold', 1.4, true), seg([0, -h0], [X, -H], 'gold', 1.4, true),
      { param: [`${X} + 0.35*cos(t)`, `${H}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 1.8 },
    ],
    arrows: [{ from: [0, -2.85], to: [X, -2.85], color: 'ink3', label: 'about 40 AU', labelDx: -150, labelDy: 14 }],
    points: [tag(-0.85, -0.35, 'Lodestar', 'ink2', -26, 18), tag(0, 0.9, 'dish', 'ink2', -14, -10), tag(X, H, 'first dark ring', 'gold', -60, -12),
      dot(X, 0.75, 'accent', 4), tag(X, 0.75, 'Earth', 'accent', 10, 4), tag(3.2, 0, 'θ = 1.22λ/D', 'gold', 0, 4)],
    alt: 'A dish antenna sending a cone-shaped beam toward a distant disc that contains Earth',
  }, 'Side view, far from scale: the real beam’s half-angle is under a degree, and Earth is a speck inside the disc. The disc is the beam’s central bright spot, out to its first dark ring.');
}

// ── round 2 pictures ─────────────────────────────────────────────────────────
function pyroPic(n, C1, Rh) {
  const top = 4, x1 = 6.6, x2 = 8.8;
  const curves = [
    seg([0, 0], [0, 1.82], 'ink2', 2), seg([0, 2.18], [0, top], 'ink2', 2),
    seg([-0.6, 2.18], [0.6, 2.18], 'bad', 4), seg([-0.6, 1.82], [0.6, 1.82], 'accent', 4),
    seg([0, top], [1.3, top], 'ink2', 2), seg([1.3, top], [2.3, top + 0.06], 'ink', 2.2), seg([2.3, top], [3.1, top], 'ink2', 2),
    ...zigzag([3.1, top], [5.1, top]), seg([5.1, top], [x2, top], 'ink2', 2),
    seg([x1, top], [x1, 2.9], 'ink2', 2), ...zigzag([x1, 2.9], [x1, 1.1]), seg([x1, 1.1], [x1, 0], 'ink2', 2),
    seg([x2, top], [x2, 2.9], 'ink2', 2), ...zigzag([x2, 2.9], [x2, 1.1]), seg([x2, 1.1], [x2, 0], 'ink2', 2),
    seg([0, 0], [x2, 0], 'ink2', 2),
  ];
  return picture({
    x: [-5.2, 12.2], y: [-0.8, 5.1],
    curves,
    points: [dot(1.3, top, 'ink', 4), dot(2.3, top, 'ink', 4), dot(x1, top, 'ink2', 4), dot(x1, 0, 'ink2', 4),
      tag(-0.6, 2.5, 'capacitor bank', 'ink2', -96, 0), tag(-0.6, 1.5, `${n} × ${C1} µF, 28 V`, 'ink2', -104, 16),
      tag(1.8, top, 'fire', 'ink', -12, 20), tag(4.1, top, `harness ${Rh} Ω`, 'warn', -42, -16),
      tag(x1, 2.0, 'igniter 1', 'warn', -66, 4), tag(x2, 2.0, 'igniter 2', 'warn', 12, 4), tag((x1 + x2) / 2, 0, '1.0 Ω each', 'ink3', -30, 18)],
    alt: 'A capacitor bank discharging through a harness resistor into two igniters wired in parallel',
  }, 'The firing circuit as the fire switch closes, schematic: the bank (drawn as one capacitor), the harness, and the two igniters in parallel.');
}

function recoilPic() {
  const rtg = [3.3, -1.3];
  const heat = [[1.25, 0], [0.9, -0.9], [0, -1.25], [0, 1.25], [0.85, 0.85]].map(([dx, dy]) => ({ from: [r4(rtg[0] + 0.55 * dx), r4(rtg[1] + 0.55 * dy)], to: [r4(rtg[0] + 1.25 * dx), r4(rtg[1] + 1.25 * dy)], color: 'warn' }));
  return picture({
    x: [-5.8, 8.6], y: [-3.1, 3.1],
    shade: [fill(2.9, -1.7, 3.7, -0.9, 'warn', 0.35)],
    curves: [
      { param: ['0.25 - 0.4*t^2', 't'], t: [-1.5, 1.5], color: 'ink2', width: 3 },
      ...rect(0.25, -0.45, 1.45, 0.45, 'ink2', 1.8), seg([1.45, -0.25], [2.9, -1.2], 'ink2', 1.6), ...rect(2.9, -1.7, 3.7, -0.9, 'warn', 1.6),
    ],
    arrows: [...heat,
      { from: [5.2, 1.3], to: [7.6, 1.3], color: 'warn', width: 3, label: 'net heat outward', labelDx: -100, labelDy: -12 },
      { from: [-1.0, 0], to: [-3.2, 0], color: 'good', width: 3, label: 'push', labelDx: -14, labelDy: -10 },
      { from: [-1.2, 2.3], to: [-5.2, 2.3], color: 'ink3', label: 'to the Sun and Earth', labelDx: 4, labelDy: -10 }],
    points: [tag(2.9, -1.7, 'RTG', 'warn', -34, 14), tag(0.85, 0.45, 'body', 'ink2', -12, -8), tag(-0.65, -1.5, 'dish', 'ink2', -34, 14)],
    alt: 'The probe with its dish facing the Sun, its RTG radiating heat, slightly more of it away from the Sun',
  }, 'Not to scale; arrows show directions only. The RTG radiates its waste heat every way; some strikes the back of the dish and is reflected outward, so slightly more heat leaves away from the Sun than toward it.');
}

// ── round 3 pictures ─────────────────────────────────────────────────────────
function emfPic(eps, T) {
  return {
    type: 'graph',
    params: {
      x: [0, r4(2.25 * T)], y: [r4(-1.5 * eps), r4(1.8 * eps)], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'emf (μV)',
      curves: [{ fn: `${r4(eps)}*sin(2*pi*x/${r4(T)})`, domain: [0, r4(2 * T)], color: 'accent', width: 2.2 }],
      hlines: [{ y: r4(eps), label: `peak ${eps} μV`, color: 'gold' }],
      alt: 'A sine wave of emf at the probe’s spin frequency',
    },
    caption: 'The search coil’s emf near closest approach: a sine wave at the spin frequency. The probe’s motion through the field during one turn is neglected.',
  };
}

function boomPic(r1, r2, B1, B2) {
  return picture({
    x: [-3.4, r2 + 2.6], y: [-4.6, 3.1],
    shade: [fill(-1, -0.75, 1, 0.75, 'ink2', 0.2)],
    curves: [...rect(-1, -0.75, 1, 0.75, 'ink2', 2), seg([1, 0], [r2 + 0.5, 0], 'ink2', 2.6),
      { polar: '1.5*sin(theta)^2', theta: [0, 6.2832], color: 'violet', width: 1.2, dash: true },
      { polar: '2.1*sin(theta)^2', theta: [0, 6.2832], color: 'violet', width: 1.2, dash: true }],
    arrows: [{ from: [0, -2.9], to: [r1, -2.9], color: 'ink3', label: `${r1} m`, labelDx: -30, labelDy: -8 },
      { from: [0, -4.1], to: [r2, -4.1], color: 'ink3', label: `${r2} m`, labelDx: -30, labelDy: -8 },
      { from: [r1 + 1, 1.9], to: [r2 - 1, 1.9], color: 'teal', label: 'interplanetary field', labelDx: -150, labelDy: -12 }],
    points: [dot(r1, 0, 'gold', 6), dot(r2, 0, 'gold', 6), tag(r1, 0, `inner: ${B1} nT`, 'gold', -38, 22), tag(r2, 0, `outer: ${B2} nT`, 'gold', -44, -16),
      tag(-1, 0.75, 'body', 'ink2', -40, -6)],
    alt: 'The probe body with its own small dipole field, and a long boom carrying two magnetometers',
  }, 'The magnetometer boom, to scale along its length (the body drawn 2 m across). Dashed violet: field lines of the probe’s own small magnetic dipole, schematic. Both magnetometers measure the field’s component along the boom.');
}

function pickupPic(sp, v) {
  const E = v * 1e3 * B_OUT, r = (sp.m * U * v * 1e3) / (QE * B_OUT) / 1e3;   // V/m; km
  const species = { q: 1, m: sp.m, name: sp.sym };
  return {
    type: 'em-lorentz',
    params: {
      view: 'top', species, B: B_OUT, E, bdir: 'out', unit: 'km', x: [r4(-0.7 * r), r4(3.3 * r)], y: [r4(-0.6 * r), r4(2.4 * r)],
      play: false, t: 0.3, path: 'trail',
      particles: [{ species, v: 0, at: [0, 0], label: `new ${sp.sym} ion`, labelAt: 0, labelDy: 18 }],
      arrows: ['v', 'F'], readouts: [], axes: false, grid: false,
    },
    caption: 'Seen from Lodestar: the wind blows to the right, carrying its magnetic field (out of the page). In this frame the moving field brings an electric field with it, up the page. The ion, born at rest, has just begun to move; its path so far is drawn to scale for a 0.15 nT field. Arrows show directions only.',
  };
}

// ── round 4 pictures ─────────────────────────────────────────────────────────
function chargePic() {
  const R = 1.3, plus = [];
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4 + 0.39; plus.push(tag(0.78 * R * Math.cos(a), 0.78 * R * Math.sin(a), '+', 'bad', -4, 5)); }
  // a slow photoelectron's path: out from the surface and back, as a quadratic Bézier curve
  const P0 = [R * Math.cos(-0.45), R * Math.sin(-0.45)], P1 = [3.9, -2.1], P2 = [R * Math.cos(-0.95), R * Math.sin(-0.95)];
  const bez = (s) => [0, 1].map((i) => (1 - s) ** 2 * P0[i] + 2 * (1 - s) * s * P1[i] + s * s * P2[i]);
  const back = { param: [0, 1].map((i) => `(${r4(P0[i])})*(1 - t)^2 + (${r4(2 * P1[i])})*(1 - t)*t + (${r4(P2[i])})*t^2`), t: [0, 0.86], color: 'accent', width: 1.6, dash: true };
  return picture({
    x: [-6, 5.6], y: [-2.7, 2.7],
    shade: [disk(0, 0, R, 'ink2', 0.25)],
    curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color: 'ink2', width: 2 }, back],
    arrows: [-0.75, 0, 0.75].map((y) => ({ from: [-5.4, y], to: [-1.6, y], color: 'violet' })).concat([
      { from: [1.05, 0.75], to: [3.9, 2.2], color: 'accent', label: 'escapes', labelDx: 6, labelDy: 4 },
      { from: bez(0.86).map(r4), to: bez(1).map(r4), color: 'accent' }]),
    points: [...plus, tag(-5.4, 1.6, 'Lyman-α photons', 'violet', 0, -2), tag(2.6, -1.55, 'pulled back', 'accent', 12, 12), tag(0, -R, 'Lodestar', 'ink2', -26, 20)],
    alt: 'Ultraviolet photons striking a positively charged sphere; one photoelectron escapes, another is pulled back',
  }, 'Schematic, not to scale. Ultraviolet photons free electrons from the probe’s skin; once the probe is positive, the slower photoelectrons are pulled back and only faster ones escape.');
}

function prismPic() {
  const tilt = 12 * DEG, inside = 8 * DEG, y0 = 2.5, xin = -4.8;
  const hit = y0 / (1 + Math.tan(inside));          // where the tilted ray meets y = x
  const nx = 0.5657;                                  // 0.8 × cos 45°
  return picture({
    x: [-5.2, 5.6], y: [-0.6, 4.9],
    shade: [{ fn: '3', lower: 'x', from: 0, to: 3, color: 'accent', alpha: 0.16 }],
    curves: [...poly([[0, 0], [0, 3], [3, 3], [0, 0]], 'accent', 2),
      ...poly([[xin, 2], [2, 2], [2, 4.4]], 'gold', 2.2), seg([1.2, 4.4], [2.8, 4.4], 'ink2', 4),
      seg([xin, r4(y0 - xin * Math.tan(tilt))], [0, y0], 'warn', 2), seg([0, y0], [r4(hit), r4(hit)], 'warn', 2),
      seg([-2.3, y0], [0, y0], 'ink3', 1, true),
      seg([r4(hit - nx), r4(hit + nx)], [r4(hit + nx), r4(hit - nx)], 'ink3', 1.2, true)],
    points: [tag(xin, 2, 'star on axis', 'gold', 0, 16), tag(xin, y0 - xin * Math.tan(tilt), 'tilted star', 'warn', 0, -10),
      tag(1.0, 1.0, 'long face', 'accent', 12, 14), tag(2.8, 4.4, 'detector', 'ink2', 8, 4), tag(-1.75, 2.66, 'θ', 'warn', -3, -2)],
    alt: 'A right-angle prism folding a ray by reflection off its long face, with a second ray entering tilted',
  }, 'The fold prism in side view, with the tilt hugely exaggerated (about 12° drawn). Light along the axis meets the long face at 45°; light from a star tilted this way meets it closer to the normal (dashed).');
}

// ── round 5 pictures ─────────────────────────────────────────────────────────
function gratingPic(L) {
  const X = 7, Y = 1.9;
  return picture({
    x: [-4.4, 10.4], y: [-3.4, 3.4],
    curves: [seg([0, -1.6], [0, 1.6], 'violet', 3, true), seg([X, -2.8], [X, 2.8], 'ink2', 3),
      seg([0, 0], [X, 0], 'gold', 1.6), seg([0, 0], [X, Y], 'gold', 1.6), seg([0, 0], [X, -Y], 'gold', 1.4, true)],
    arrows: [0.9, 0, -0.9].map((y) => ({ from: [-3.9, y], to: [-0.4, y], color: 'gold' })).concat([
      { from: [0, -2.75], to: [X, -2.75], color: 'ink3', label: `L = ${L} m`, labelDx: -96, labelDy: 14 },
      { from: [X + 0.7, 0], to: [X + 0.7, Y], color: 'ink3', label: 'x = ?', labelDx: 6, labelDy: 4 }]),
    points: [dot(X, 0, 'gold', 5), dot(X, Y, 'gold', 5), dot(X, -Y, 'gold', 4), tag(-3.9, -0.9, 'X-rays', 'gold', 0, 20), tag(0, 1.6, 'grating', 'violet', -24, -8),
      tag(X, 2.8, 'detector', 'ink2', -26, -8), tag(X, 0, 'm = 0', 'gold', 10, 18), tag(X, Y, 'm = 1', 'gold', -50, -8)],
    alt: 'X-rays passing through a transmission grating onto a detector, with the zeroth-order spot and first-order lines',
  }, 'Not to scale: m = 0 is the undeviated spot and m = 1 the first order, whose real angle is a fraction of a degree. The line also lands on the other side (dashed), equally far out.');
}

function comptonPic() {
  const S = [-1, 1.7], H2 = [1.6, -1.8], inc = [0.823, -0.568];
  const A = [S[0] - 5 * inc[0], S[1] - 5 * inc[1]];
  const ax = [S[0] - H2[0], S[1] - H2[1]], La = Math.hypot(...ax), u = [ax[0] / La, ax[1] / La];
  const half = Math.acos(-(u[0] * inc[0] + u[1] * inc[1]));          // the drawn (schematic) scattering angle
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const Lc = 3.3, cone = [half, -half].map((a) => { const d = rot(u, a); return seg(S, [S[0] + Lc * d[0], S[1] + Lc * d[1]], 'ink3', 1.2, true); });
  // the cone's rim, seen obliquely: an ellipse round the axis
  const Cc = [S[0] + Lc * Math.cos(half) * u[0], S[1] + Lc * Math.cos(half) * u[1]], p = [u[1], -u[0]], ra = Lc * Math.sin(half), rb = 0.3 * ra;
  const rim = { param: [0, 1].map((i) => `${r4(Cc[i])} + (${r4(ra * p[i])})*cos(t) + (${r4(rb * u[i])})*sin(t)`), t: [0, 6.2832], color: 'ink3', width: 1.2, dash: true };
  return picture({
    x: [-7.4, 7.4], y: [-3.4, 5.2],
    shade: [fill(-4.6, 1.1, 4.6, 2.3, 'accent', 0.2), fill(-4.6, -2.4, 4.6, -1.2, 'violet', 0.2)],
    curves: [...rect(-4.6, 1.1, 4.6, 2.3, 'accent', 1.4), ...rect(-4.6, -2.4, 4.6, -1.2, 'violet', 1.4), ...cone, rim],
    arrows: [{ from: A, to: S, color: 'gold', width: 2.2 },
      { from: S, to: H2, color: 'gold', width: 2.2 }, { from: S, to: [-0.15, 1.35], color: 'bad', width: 2 }],
    points: [dot(S[0], S[1], 'bad', 5), dot(H2[0], H2[1], 'violet', 6), { x: -4.8, y: 1.7, r: 0.01, color: 'accent', label: 'E₁', labelDx: 0, labelDy: 5, labelAlign: 'right' }, { x: -4.8, y: -1.8, r: 0.01, color: 'violet', label: 'E₂', labelDx: 0, labelDy: 5, labelAlign: 'right' },
      tag(A[0], A[1], 'gamma ray', 'gold', -72, 4), tag(0.9, -0.6, 'scattered photon', 'gold', 10, 4), tag(Cc[0] + ra * p[0], Cc[1] + ra * p[1], 'event cone', 'ink3', 8, 4)],
    alt: 'A gamma ray scattering in a first detector layer and being absorbed in a second, with the cone of possible arrival directions',
  }, 'Schematic, with the angle not to scale. The electron stops in the upper layer, depositing E₁; the scattered photon is absorbed in the lower layer, depositing E₂. From the two energies the camera knows the scattering angle but not the direction around the cone: the gamma ray came from somewhere on the dashed cone.');
}

// ── generator tables ─────────────────────────────────────────────────────────
// two thermocouple strings in parallel on one load: keep the combinations whose weak string carries a clear current
const STRINGS = [];
for (const eA of [34, 35, 36]) for (const rA of [1.5, 2]) for (const eB of [28, 29, 30]) for (const rB of [2.5, 3]) for (const R of [6, 8, 12, 16]) {
  const V = (eA / rA + eB / rB) / (1 / rA + 1 / rB + 1 / R), IB = (eB - V) / rB;
  if (Math.abs(IB) >= 0.2) STRINGS.push({ eA, rA, eB, rB, R, V, IB, IA: (eA - V) / rA });
}
const GLASS = [{ name: 'crown glass', nb: 1.525, nr: 1.510 }, { name: 'fused silica', nb: 1.466, nr: 1.453 }, { name: 'dense flint glass', nb: 1.669, nr: 1.633 }];
// one-electron ions of the solar wind, with their measured Lyman-α energies (eV)
const IONS = [{ el: 'carbon', Z: 6, meas: 367.5 }, { el: 'nitrogen', Z: 7, meas: 500.3 }, { el: 'oxygen', Z: 8, meas: 653.6 }, { el: 'neon', Z: 10, meas: 1021.8 }];
const LINES = [
  ['the 1.809 MeV line of aluminium-26, made in massive stars and spread through the Galaxy', 1809],
  ['the 1.332 MeV line from the decay of iron-60, made in supernovae', 1332],
  ['the 1.157 MeV line from the decay of titanium-44, which glows in the young supernova remnant Cassiopeia A', 1157],
];

export default boss({
  title: 'The Maxwell Gauntlet',
  intro: t`*Lodestar* is an imagined deep-space probe built from real parts. Twelve years after launch it is 40 AU from the Sun, beyond Neptune's orbit, heading for the edge of the heliosphere. Plutonium heat powers it, a dish carries its voice home, magnetometers ride out on a long boom, a star tracker keeps it pointed, and an X-ray spectrometer watches the sky. You are its systems engineer, and every number the team sends up is yours to check: waves, circuits, fields, induction, light and photons all come into it. Five rounds, twelve problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'The voice from 40 AU',
      story: t`Everything Lodestar does depends on its radio. The Deep Space Network sends an X-band signal up, the probe's transponder sends it straight back, and the returning wave tells the navigators how fast the probe is moving — while the dish's own transmissions carry the science home, if anyone can catch them.`,
      items: [
        num({
          id: 'r1-doppler', skill: 'phys2220.W2.3', difficulty: 3,
          gen(r) {
            const [site, lat] = r.pick([['Goldstone, California', 35.4], ['Madrid, Spain', 40.4], ['Canberra, Australia', 35.4]]);
            const v = r.pick([16, 19, 23, 27]) * 1e3, u = V_EQ * Math.cos(lat * DEG), fd = F_UP * RATIO;
            const beat = (w) => (2 * fd * w) / C / 1e3;   // kHz
            const Br = +beat(v - u).toFixed(1), Bs = +beat(v + u).toFixed(1), Bm = (Br + Bs) / 2;
            const vK = (C * Bm * 1e3) / (2 * fd) / 1e3, uK = (C * ((Bs - Br) / 2) * 1e3) / (2 * fd);
            return {
              prompt: t`The station at ${site}, sends Lodestar a steady 7.15 GHz signal. The probe's transponder multiplies the frequency it receives by exactly $880/749$ and sends that back; the station multiplies its own 7.15 GHz by the same ratio and mixes the result with the signal arriving from the probe, so the two **beat** at their difference frequency. The probe lies close to the plane of Earth's equator, so Earth's turning carries the station toward it as it rises and away from it as it sets. Just after the probe rises the beat frequency is ${Br.toFixed(1)} kHz; just before it sets, ${Bs.toFixed(1)} kHz. For speeds much less than $c$, each time a wave is received or sent by something moving at $w$ along the line of sight, its frequency shifts by the fraction $w/c$. How fast is Lodestar moving away from the centre of the Earth? ($c = 2.998\times10^8$ m/s)`,
              answer: vK, units: 'km/s', tol: { rel: 0.01 },
              errors: apart([
                { value: 2 * vK, feedback: t`The wave is shifted twice — once when the moving probe receives it, once when the probe sends it back — so the beat is $2wf/c$, not $wf/c$.` },
                { value: vK * RATIO, feedback: t`The signal that comes back, and the reference it is compared with, are at $\tfrac{880}{749}\times7.15$ GHz $\approx 8.40$ GHz: use that frequency in $b = 2wf/c$.` },
                { value: uK / 1e3, feedback: t`Half the *difference* of the two beats is the station's own speed, carried round by Earth's rotation. The probe's speed comes from their *average*.` },
              ], vK),
              hints: [
                t`Up and back, the wave is shifted twice, and the transponder's fixed ratio keeps the fractional shift: the beat is $b = 2wf/c$, with $f = \tfrac{880}{749}\times7.15$ GHz and $w$ the probe's speed away from the station.`,
                t`At rise the station moves toward the probe at some speed $u$, so $w = v - u$; at set it moves away, $w = v + u$. Averaging the two beats removes $u$.`,
                t`$v = \dfrac{c\,\bar b}{2f}$, with $\bar b$ the average of the two beat frequencies.`,
              ],
              teach: 'Two-way Doppler tracking shifts the carrier twice, so the beat is 2wf/c; readings at the probe’s rise and set average away the station’s own rotation.',
              explain: t`The carrier coming back is $f = \tfrac{880}{749}\times7.15\ \text{GHz} = ${tn(fd / 1e9, 4)}$ GHz, shifted twice on the round trip, so the beat is $b = 2wf/c$ with $w$ the probe's speed away from the station: $v - u$ at rise, $v + u$ at set. Their average, $\bar b = ${tn(Bm, 5)}$ kHz, belongs to $v$ alone: $$v = \frac{c\,\bar b}{2f} = \frac{(2.998\times10^8)(${tn(Bm * 1e3, 5)})}{2(${tn(fd, 5)})} = ${tn(vK, 4)}\ \text{km/s}.$$ Half the difference gives the station's own speed, $u = ${tn(uK, 3)}$ m/s — Earth's 465 m/s at the equator times $\cos ${lat}^\circ$, the cosine of the station's latitude. Real navigators follow the beat's phase, not just its rate, and pin a probe's speed down to a fraction of a millimetre per second this way.`,
              visual: beatPic(Br, Bs),
            };
          },
        }),
        num({
          id: 'r1-beam', skill: 'phys2220.O4.3', difficulty: 3,
          gen(r) {
            const D = r.pick([2.5, 3.0, 3.7]), P = r.pick([12, 16, 20, 23]), Dr = r.pick([34, 70]);
            const lam = C / F_DOWN, th = (1.22 * lam) / D, d = DIST * AU, Rs = th * d;
            const I = (0.84 * P) / (Math.PI * Rs * Rs), Ar = Math.PI * (Dr / 2) ** 2, Pr = I * Ar, aW = Pr / 1e-18;
            return {
              prompt: t`Lodestar's ${D.toFixed(1)} m dish sends ${P} W home at 8.40 GHz. Far away, the beam of a circular dish is the Airy pattern of its aperture: about 84% of the power goes into the central bright disc, out to the first dark ring at $\sin\theta = 1.22\lambda/D$. Treating that 84% as spread evenly over the disc where it reaches Earth, 40 AU away, how much power does a ${Dr} m Deep Space Network dish collect? Give it in attowatts ($1\ \text{aW} = 10^{-18}$ W). ($c = 2.998\times10^8$ m/s, 1 AU $= 1.496\times10^{11}$ m)`,
              answer: aW, units: 'aW', tol: { rel: 0.02 },
              errors: apart([
                { value: (P * (Dr / 2) ** 2) / (4 * d * d) / 1e-18, feedback: t`That spreads the power over a whole sphere, $4\pi d^2$, as a bare transmitter would. The dish squeezes it into a beam only $1.22\lambda/D$ wide.` },
                { value: aW * 1.22 ** 2, feedback: t`For a circular aperture the first dark ring is at $1.22\lambda/D$; $\lambda/D$ belongs to a slit.` },
                { value: aW * 4, feedback: t`Use radii for areas: the beam's disc has radius $\theta d$ (the angle $\theta$ is measured from the axis), and the receiving dish has area $\pi(D/2)^2$.` },
                { value: aW / 0.84, feedback: 'Only about 84% of the power lies inside the first dark ring; the rest goes into the fainter rings outside it.' },
              ], aW),
              hints: [
                t`$\lambda = c/f$, and the first dark ring is at $\theta \approx 1.22\lambda/D$ — a small angle, in radians.`,
                t`At distance $d$ the disc has radius $\theta d$, so the intensity there is $I = 0.84P/\pi(\theta d)^2$.`,
                t`The receiving dish collects $I$ times its own area, $\pi(${Dr}\ \text{m}/2)^2$.`,
              ],
              teach: 'A dish’s beam spreads at about 1.22λ/D, so diffraction sets the size of the disc its power is spread over at the far end.',
              explain: t`$\lambda = c/f = ${tn(lam * 100, 3)}$ cm, so the first dark ring is at $\theta = 1.22\lambda/D = ${tn(th, 3)}$ rad ($${tn(th / DEG, 2)}^\circ$). At $d = 40$ AU $= ${tn(d, 4)}$ m the disc's radius is $\theta d = ${tn(Rs, 3)}$ m, about $${tn(Rs / AU, 2)}$ AU. There $I = \dfrac{0.84P}{\pi(\theta d)^2} = ${tn(I, 3)}\ \text{W/m}^2$, and the ${Dr} m dish, of area $${tn(Ar, 3)}\ \text{m}^2$, collects $${tn(Pr, 3)}$ W $= ${tn(aW, 3)}$ aW. A full link budget comes out within a factor of about two: a real beam is brighter on its axis than this average (about four times, for an evenly lit dish), while real dishes waste part of their area. Receivers cooled to a few kelvin, and codes that spread each bit over many cycles of the wave, make sense of signals this faint.`,
              visual: beamPic(),
            };
          },
        }),
      ],
    },
    {
      title: 'Power',
      story: t`Lodestar runs on heat: plutonium-238 warms thermocouples that turn a few per cent of it into electricity. Twelve years on, one string of thermocouples has been damaged, a thruster line must be opened for good, and the navigators have found a push that nobody can explain.`,
      items: [
        num({
          id: 'r2-strings', skill: 'phys2220.E6.4', difficulty: 3,
          gen(r) {
            const { eA, rA, eB, rB, R, V, IB, IA } = r.pick(STRINGS);
            const back = IB < 0;
            return {
              prompt: t`Lodestar's thermocouples are wired as two strings in parallel, so that no single failure can cut the power. Each string behaves like a battery with an internal resistance. String A has an emf of ${eA} V and an internal resistance of ${rA} Ω. String B has degraded: cracked couples have lowered its emf to ${eB} V and raised its internal resistance to ${rB} Ω. Together they feed the probe's electronics, which act as a ${R} Ω load. What current flows through string B? Count it positive if string B drives current out into the bus, negative if the bus drives current backward through it.`,
              answer: IB, units: 'A', tol: { rel: 0.01, abs: 0.005 },
              errors: apart([
                { value: eB / (rB + R), feedback: t`That is string B driving the load on its own. String A shares the same two terminals and sets the bus voltage too: write the junction rule with both strings.` },
                { value: (eA + eB) / (rA + rB + R), feedback: t`The strings are in parallel — both connect across the same bus — not in series, so their emfs do not add.` },
                { value: V / (2 * R), feedback: t`The strings do not share the load equally: each delivers $(\mathcal{E} - V)/r$, which depends on its own emf and resistance.` },
              ], IB),
              hints: [
                t`Call the bus voltage $V$, with the bottom wire at 0 V. A string with emf $\mathcal{E}$ and internal resistance $r$ delivers $(\mathcal{E} - V)/r$ into the bus — a negative number if $V > \mathcal{E}$.`,
                t`Junction rule: what the two strings deliver is what the load draws, $\dfrac{${eA} - V}{${rA}} + \dfrac{${eB} - V}{${rB}} = \dfrac{V}{${R}}$.`,
                t`Solve for $V$; then $I_B = (${eB} - V)/${rB}$.`,
              ],
              teach: 'Sources in parallel share one terminal voltage, and each one’s current is (ℰ − V)/r — so a weak source can be driven backward.',
              explain: t`With the bus at $V$, the junction rule reads $\dfrac{${eA} - V}{${rA}} + \dfrac{${eB} - V}{${rB}} = \dfrac{V}{${R}}$, so $V = ${tn(V, 4)}$ V. Then $I_A = \dfrac{${eA} - ${tn(V, 4)}}{${rA}} = ${tn(IA, 3)}$ A and $I_B = \dfrac{${eB} - ${tn(V, 4)}}{${rB}} = ${tn(IB, 3)}$ A; check: $I_A + I_B = ${tn(IA + IB, 3)}$ A $= V/R$. ${back
                ? t`The bus sits above string B's emf, so the healthy string drives current backward through the damaged one, which soaks up $V|I_B| = ${tn(V * -IB, 3)}$ W of string A's output instead of adding to it.`
                : t`String B still helps, adding $VI_B = ${tn(V * IB, 3)}$ W of the $V^2/R = ${tn((V * V) / R, 3)}$ W reaching the electronics.`} Power systems put a diode in series with each string to block backward current; a lighter load (a larger $R$) raises $V$ and makes it more likely.`,
              visual: circuit('twoloop', {
                values: { E1: eA, E2: eB, R1: rA, R2: rB, R3: R }, names: { E1: 'A', E2: 'B', R1: 'rA', R2: 'rB', R3: 'load' },
                flow: false, potential: false, readout: false,
                caption: 'Strings A and B, each drawn as a battery (its emf) in series with a resistor (its internal resistance, rA or rB); the probe’s electronics are the load in the middle. No current directions are shown: finding them is the problem.',
              }),
            };
          },
        }),
        num({
          id: 'r2-pyro', skill: 'phys2220.E6.5', difficulty: 4,
          gen(r) {
            const n = r.pick([4, 6, 8]), C1 = r.pick([680, 1000]), Rh = r.pick([0.2, 0.3, 0.4]), Iaf = r.pick([3.5, 5.0]), Rb = 1.0, V0 = 28;
            const Cb = n * C1 * 1e-6, Rt = Rh + Rb / 2, tau = Rt * Cb, I0 = V0 / Rt, tt = tau * Math.log(I0 / 2 / Iaf);
            const ms = tt * 1e3;
            const single = (Rh + Rb) * Cb * Math.log(V0 / (Rh + Rb) / Iaf) * 1e3, noHarness = (Rb / 2) * Cb * Math.log(V0 / (Rb / 2) / 2 / Iaf) * 1e3;
            return {
              prompt: t`To open Lodestar's backup thruster line for good, the team fires a pyrotechnic valve. Its firing unit is a bank of ${n} capacitors of ${C1} µF each, wired in parallel and charged to 28 V. For reliability the valve has two igniters, wired in parallel; each has a ${Rb.toFixed(1)} Ω bridgewire and fires once its current has stayed above its all-fire current, $I_\text{af} = ${Iaf.toFixed(1)}$ A, long enough to heat the wire. When the fire switch closes, the bank discharges through a harness of ${Rh} Ω in series with the pair. For how long does each igniter carry more than ${Iaf.toFixed(1)} A? (Treat the harness and the bridgewires as fixed resistances.)`,
              answer: ms, units: 'ms', tol: { rel: 0.01 },
              errors: apart([
                { value: tau * Math.log(I0 / Iaf) * 1e3, feedback: t`That compares the bank's *total* current with $I_\text{af}$. The current splits equally between the two igniters, so each carries only half of it.` },
                { value: noHarness, feedback: t`The harness's ${Rh} Ω is in series with the igniters: it adds to the resistance the bank discharges through, lengthening $\tau$ and lowering the starting current.` },
                { value: single, feedback: t`The two igniters are in parallel, so together they present $R_b/2$, and each takes half the current.` },
                { value: ms / n, feedback: t`Capacitors in parallel add: the bank is $${n}\times${C1}\ \mu\text{F}$.` },
              ], ms),
              hints: [
                t`Capacitors in parallel add, so $C = ${n}\times${C1}\ \mu\text{F}$. The two igniters in parallel make $R_b/2$, in series with the harness.`,
                t`The current falls as $I(t) = I_0e^{-t/RC}$ with $I_0 = V_0/R$; each igniter carries half of it.`,
                t`Solve $\tfrac12I_0e^{-t/RC} = I_\text{af}$: $t = RC\ln\dfrac{I_0}{2I_\text{af}}$.`,
              ],
              teach: t`A capacitor discharge falls as $e^{-t/RC}$; when loads share it in parallel, each one’s share of the current is what must stay above its threshold.`,
              explain: t`In parallel the capacitors add to $C = ${tn(Cb * 1e3, 3)}$ mF, and the two igniters make $${tn(Rb / 2, 2)}\ \Omega$, in series with the harness: $R = ${tn(Rt, 2)}\ \Omega$ and $\tau = RC = ${tn(tau * 1e3, 3)}$ ms. At the start $I_0 = 28/${tn(Rt, 2)} = ${tn(I0, 3)}$ A, half through each igniter, so each carries $${tn(I0 / 2, 3)}\,e^{-t/\tau}$ A, which stays above ${Iaf.toFixed(1)} A until $$t = \tau\ln\frac{${tn(I0 / 2, 3)}}{${Iaf.toFixed(1)}} = ${tn(ms, 3)}\ \text{ms}.$$ The bank stores $\tfrac12CV_0^2 = ${tn(0.5 * Cb * V0 * V0, 3)}$ J; the igniters get $${Math.round((100 * Rb) / 2 / Rt)}\%$ of it and the harness the rest. Firing units are sized with a wide margin, because a pyrotechnic valve has only one chance to work.`,
              visual: pyroPic(n, C1, Rh),
            };
          },
        }),
        num({
          id: 'r2-recoil', skill: 'phys2220.B6.4', difficulty: 4,
          gen(r) {
            const m = r.pick([420, 480, 540]), P0 = r.pick([2200, 2400, 2600]), a0 = r.pick([7.5, 8.0, 8.5]) * 1e-10;
            const drift = +((2 * F_DOWN * a0) / C * 86400 * 1e3).toPrecision(3);   // mHz per day, as printed
            const rate = drift / 1e3 / 86400, a = (C * rate) / (2 * F_DOWN);
            const F = m * a, dP = F * C, Pnow = P0 * 0.5 ** (YEARS / T_HALF), pct = (100 * dP) / Pnow;
            return {
              prompt: t`After every known force on Lodestar has been modelled — the gravity of the Sun and planets, sunlight's push, the thrusters — the two-way beat note from the last round still falls ${drift} mHz per day faster than predicted. The beat is $b = 2vf/c$ with $f = 8.40$ GHz, so the probe has a tiny extra acceleration toward the Sun. Suspect: heat. The probe's RTG gave ${P0} W of heat at launch, ${YEARS} years ago, and plutonium-238's half-life is 87.7 years. Some of that heat strikes the back of the dish and is reflected outward, away from the Sun. Lodestar's mass is ${m} kg. What fraction of the RTG's present heat output must leave, in net, in the outward direction to explain the push? ($c = 2.998\times10^8$ m/s)`,
              answer: pct, units: '%', tol: { rel: 0.01 },
              errors: apart([
                { value: (100 * dP) / P0, feedback: t`The RTG no longer gives ${P0} W: after ${YEARS} years of decay it gives $${P0}\times2^{-${YEARS}/87.7}$.` },
                { value: pct * 86400, feedback: 'Convert the drift to hertz per second (a day is 86 400 s) before finding the acceleration in m/s².' },
              ], pct),
              hints: [
                t`The beat is $2vf/c$, so it changes at the rate $2af/c$: convert the drift to Hz/s and solve for $a$.`,
                t`The push is $F = ma$. Radiation carries momentum at the rate $P/c$, so a net stream $\Delta P$ of heat radiated outward pushes the probe sunward with $F = \Delta P/c$.`,
                t`The heat now is $P_0\,2^{-t/T_{1/2}}$ with $t = ${YEARS}$ yr and $T_{1/2} = 87.7$ yr. Divide $\Delta P$ by it.`,
              ],
              teach: 'Radiation carries momentum P/c, so heat radiated unevenly pushes a spacecraft — a few per cent of an RTG’s heat is enough to show in its Doppler tracking.',
              explain: t`A drift of ${drift} mHz per day is $${tn(rate, 3)}$ Hz/s, so $a = \dfrac{c}{2f}\,\dfrac{db}{dt} = ${tn(a, 3)}\ \text{m/s}^2$ toward the Sun, which takes $F = ma = ${tn(F, 3)}$ N. Radiation carries momentum at the rate $P/c$, so the net outward stream of heat must be $\Delta P = Fc = ${tn(dP, 3)}$ W. After ${YEARS} years the RTG gives $${P0}\times2^{-${YEARS}/87.7} = ${tn(Pnow, 4)}$ W, so the imbalance needed is $${tn(pct, 3)}\%$ of it. This is the story of the **Pioneer anomaly**: tracking of Pioneer 10 and 11, far beyond Saturn, showed an unexplained sunward acceleration of about $8.7\times10^{-10}\ \text{m/s}^2$. In 2012 a detailed thermal model (Turyshev and colleagues) showed that heat radiated unevenly by the RTGs and electronics, much of it reflected off the back of the dish, accounts for it.`,
              visual: recoilPic(),
            };
          },
        }),
      ],
    },
    {
      title: 'The boom and the wind',
      story: t`Lodestar spins slowly about the axis of its dish. Nine years ago it swung past Jupiter, deep in that planet's magnetic field. Out here its magnetometers measure the Sun's own field, thousands of times weaker, carried outward by the solar wind — and the probe's own wiring is a nuisance.`,
      items: [
        num({
          id: 'r3-coil', skill: 'phys2220.B3.5', difficulty: 3,
          gen(r) {
            const rpm = r.pick([3, 4, 5]), N = r.pick([2000, 3000]), dcm = r.pick([20, 25]), Bp0 = r.pick([380, 460, 540]), Ba = r.pick([140, 210, 280]);
            const w = (2 * Math.PI * rpm) / 60, A = Math.PI * (dcm / 200) ** 2, T = 60 / rpm;
            const eps = +(N * A * w * Bp0 * 1e-9 * 1e6).toPrecision(3);   // μV, as printed
            const Bp = ((eps * 1e-6) / (N * A * w)) * 1e9, B = Math.hypot(Bp, Ba), rJ = Math.cbrt(420000 / B);
            return {
              prompt: t`Nine years ago, swinging past Jupiter, Lodestar was spinning at ${rpm} rpm. An air-core search coil of ${N} turns, ${dcm} cm across, rides on its boom with the coil's axis at right angles to the spin axis, so the coil turns with the probe. Near closest approach the coil gave a sinusoidal emf at the spin frequency, with a peak of ${eps} μV. At the same time a fluxgate magnetometer measured the field's component along the spin axis: ${Ba} nT. What was the strength of Jupiter's field there?`,
              answer: B, units: 'nT', tol: { rel: 0.01 },
              errors: apart([
                { value: Math.hypot(Bp * 2 * Math.PI, Ba), feedback: t`In $\mathcal{E}_0 = NAB\omega$, $\omega$ is the angular frequency in rad/s: $2\pi$ times the turns per second, not the turns per second.` },
                { value: Bp, feedback: t`The coil only sees the part of the field across the spin axis. Add the fluxgate's component along the axis: $B = \sqrt{B_\perp^2 + B_\parallel^2}$.` },
                { value: Bp + Ba, feedback: 'The two components are at right angles: they add like the sides of a right triangle, not by simple addition.' },
                { value: Math.hypot(Bp / 4, Ba), feedback: t`The coil is ${dcm} cm *across*: its area is $\pi(d/2)^2$.` },
              ], B),
              hints: [
                t`The coil's axis stays at right angles to the spin axis, so the field's component along the spin axis never threads it. Only $B_\perp$, the component across the spin axis, sweeps through it — as the magnet's field does in a generator.`,
                t`A generator's peak emf is $\mathcal{E}_0 = NAB_\perp\omega$, with $A = \pi(d/2)^2$ and $\omega = 2\pi\times(\text{turns per second})$.`,
                t`Then $B = \sqrt{B_\perp^2 + B_\parallel^2}$, with $B_\parallel = ${Ba}$ nT.`,
              ],
              teach: 'A coil turning in a steady field is a generator: its peak emf NABω measures the component of the field that sweeps through it, and nothing else.',
              explain: t`The field's component along the spin axis never threads the coil, so only $B_\perp$ makes emf, as in a generator: $\mathcal{E}_0 = NAB_\perp\omega$. With $\omega = 2\pi\times${rpm}/60 = ${tn(w, 3)}$ rad/s and $A = \pi(${tn(dcm / 200, 3)}\ \text{m})^2 = ${tn(A, 3)}\ \text{m}^2$, $$B_\perp = \frac{\mathcal{E}_0}{NA\omega} = \frac{${tn(eps * 1e-6, 3)}}{(${N})(${tn(A, 3)})(${tn(w, 3)})} = ${tn(Bp, 3)}\ \text{nT}.$$ Then $B = \sqrt{${tn(Bp, 3)}^2 + ${Ba}^2} = ${tn(B, 3)}$ nT. At its equator Jupiter's field is about 420 000 nT at the cloud tops and falls off roughly as $1/r^3$, so the flyby passed about $${tn(rJ, 2)}$ Jupiter radii out.`,
              visual: emfPic(eps, T),
            };
          },
        }),
        num({
          id: 'r3-boom', skill: 'phys2220.B2.1', difficulty: 3,
          gen(r) {
            const r1 = r.pick([4, 5]), r2 = r.pick([10, 12]), Bs = r.pick([0.9, 1.3, 1.7]), Bi = r.pick([0.11, 0.15, 0.19]);
            const B1 = +(Bi + Bs).toPrecision(3), B2 = +(Bi + Bs * (r1 / r2) ** 3).toPrecision(3);
            const c1 = r1 ** 3, c2 = r2 ** 3, B = (B2 * c2 - B1 * c1) / (c2 - c1), k = (B1 - B2) / (1 / c1 - 1 / c2);
            return {
              prompt: t`Lodestar's boom carries two magnetometers, ${r1} m and ${r2} m from the centre of the probe's body, whose wiring and electronics make a small magnetic field of their own. Far from its sources that field is a dipole's: along the boom it falls off as $1/r^3$, like the far field on the axis of a current loop. The inner magnetometer reads ${B1} nT along the boom and the outer one ${B2} nT. What is the interplanetary field's component along the boom?`,
              answer: B, units: 'nT', tol: { rel: 0.015 },
              errors: apart([
                { value: B2, feedback: t`Even ${r2} m out, the probe's own field has not vanished — it is only weaker. The two readings together let you remove it.` },
                { value: (B2 * r2 * r2 - B1 * r1 * r1) / (r2 * r2 - r1 * r1), feedback: t`A dipole's field falls as $1/r^3$, not $1/r^2$ — faster than a point charge's, because the loop's opposite sides partly cancel.` },
                { value: (B2 * r2 - B1 * r1) / (r2 - r1), feedback: t`$1/r$ is a long straight wire's falloff. A small loop — a dipole — falls off as $1/r^3$.` },
              ], B),
              hints: [
                t`Each reading is the interplanetary field plus the probe's own: $B_1 = B + k/r_1^3$ and $B_2 = B + k/r_2^3$, with the same unknown $k$.`,
                t`Subtract to find $k$: $B_1 - B_2 = k\left(\dfrac{1}{r_1^3} - \dfrac{1}{r_2^3}\right)$.`,
                t`Then $B = B_2 - k/r_2^3$ — or, in one step, $B = \dfrac{B_2r_2^3 - B_1r_1^3}{r_2^3 - r_1^3}$.`,
              ],
              teach: 'A dipole’s field falls as 1/r³, so two sensors at different distances can separate a spacecraft’s own field from the field it is there to measure.',
              explain: t`Both readings are the interplanetary field plus the probe's own, which falls as $1/r^3$: $B_1 = B + k/r_1^3$ and $B_2 = B + k/r_2^3$. Subtracting, $k = \dfrac{B_1 - B_2}{1/r_1^3 - 1/r_2^3} = ${tn(k, 3)}\ \text{nT}\,\text{m}^3$, so the probe still adds $${tn(k / c2, 2)}$ nT at the outer sensor, and $B = B_2 - k/r_2^3 = ${tn(B, 3)}$ nT. Trusting the outer sensor alone would have been ${Math.round((100 * (B2 - B)) / B)}% too high. Norman Ness and colleagues proposed this two-magnetometer method in 1971, and Voyager's boom carries a pair of magnetometers for exactly this reason.`,
              visual: boomPic(r1, r2, B1, B2),
            };
          },
        }),
        mcq({
          id: 'r3-pickup', skill: 'phys2220.B1.2', difficulty: 4,
          gen(r) {
            const sp = r.pick([{ gas: 'helium', ion: t`$\text{He}^+$`, sym: 'He⁺', m: 4.0026 }, { gas: 'hydrogen', ion: t`$\text{H}^+$`, sym: 'H⁺', m: 1.0073 }]), v = r.pick([380, 420, 450]);
            const M = sp.m * U, V = v * 1e3, keV = (x) => x / QE / 1e3;
            const Kmax = keV(2 * M * V * V), Khalf = keV(0.5 * M * V * V), Kmean = keV(M * V * V);
            const rad = (M * V) / (QE * B_OUT) / 1e3, T = (2 * Math.PI * M) / (QE * B_OUT);
            return {
              prompt: t`Neutral atoms of interstellar ${sp.gas} drift into the solar system, untouched by the Sun's magnetic field. Near Lodestar, sunlight ionizes one. The new ${sp.ion} ion (mass ${sp.m} u) starts essentially at rest, while the solar wind — and the magnetic field frozen into it — streams past at ${v} km/s. Out here the field is almost at right angles to the wind. What happens to the ion's kinetic energy, as seen from the probe? ($1\ \text{u} = 1.661\times10^{-27}$ kg, $1\ \text{keV} = 1.602\times10^{-16}$ J; the atoms' own drift, about 26 km/s, is small enough to ignore.)`,
              choices: [
                t`It swings over and over between zero and $2mv^2 \approx ${tn(Kmax, 3)}$ keV`,
                t`It settles at $\tfrac12mv^2 \approx ${tn(Khalf, 3)}$ keV, once the ion is carried along at the wind's speed`,
                'It stays at zero: a magnetic force does no work, so the ion can never gain energy',
                t`It holds steady at $mv^2 \approx ${tn(Kmean, 3)}$ keV: the drift and the circling each carry $\tfrac12mv^2$`,
              ],
              answer: 0,
              why: {
                1: t`It never just rides along. In the wind's frame it moves at $v$ straight across the field, so it circles; seen from the probe the circling adds to the drift, and its speed swings between 0 and $2v$.`,
                2: t`True in the wind's frame, where the ion only circles. But the probe sees the field sweeping past, and a moving magnetic field brings an electric field $E = vB$ with it: that field does the work, and the ion drifts with the wind at $E/B$.`,
                3: t`That is only its average. The drift and the circling add as vectors: where they point the same way the speed is $2v$, where they point opposite ways it is zero.`,
              },
              hints: [
                t`Go to the frame moving with the wind. There the field is steady, so the ion's speed cannot change — but in that frame the ion is moving at $v$, straight across the field.`,
                t`In the wind's frame it therefore circles at speed $v$. Back in the probe's frame, add the wind's velocity to the circling velocity, at the top and at the bottom of the circle.`,
              ],
              teach: 'A newly ionized atom circles at the wind’s speed in the wind’s frame, so in the Sun’s frame its speed swings between 0 and twice the wind’s.',
              explain: t`Ride with the wind: there the field is steady, so the ion's speed cannot change — and there the ion is moving at ${v} km/s straight across the field, so it circles at that speed. Back in the probe's frame, add the wind's velocity: the circling and the drift line up at the top of each loop (speed $2v$) and cancel at the bottom (speed 0). So $K$ swings between 0 and $\tfrac12m(2v)^2 = 2mv^2 = ${tn(Kmax, 3)}$ keV, averaging $mv^2$. Seen from the probe, the work is done by the electric field $E = vB$ that the moving field brings with it, and the ion's average motion is the $\vec E\times\vec B$ drift at $E/B = v$. In the 0.15 nT field out here the loops are huge — radius $mv/(qB) \approx ${tn(rad, 2)}$ km, about ${Math.round(T / 60)} minutes a turn. Pickup-ion instruments, from the AMPTE satellites in the 1980s and Ulysses in the 1990s onward, see exactly this: a sharp cutoff at twice the wind's speed.`,
              visual: pickupPic(sp, v),
            };
          },
        }),
      ],
    },
    {
      title: 'Sunlight and starlight',
      story: t`At 40 AU the Sun is only a very bright star, but its ultraviolet light still charges the probe's skin. And the star tracker that keeps Lodestar's dish pointed at Earth works only over the angles its optics allow.`,
      items: [
        num({
          id: 'r4-charge', skill: 'phys2220.E4.2', difficulty: 3,
          gen(r) {
            const R = r.pick([1.5, 2.0, 2.5]), [coat, phi] = r.pick([['bare aluminium', 4.2], ['a conductive indium-tin-oxide film', 4.5], ['a carbon-loaded black paint', 4.7]]);
            const Eph = HC / 121.6, K = Eph - phi, Vs = K, Q = (R * Vs) / KC, N = Q / QE;
            return {
              prompt: t`Sunlight's strongest ultraviolet line, hydrogen's Lyman-α at 121.6 nm, knocks photoelectrons out of Lodestar's skin: ${coat}, with a work function of about ${phi.toFixed(1)} eV. The whole skin is joined electrically, so treat the probe as a conducting sphere ${R.toFixed(1)} m in radius, far from anything else. As electrons leave, the probe charges up positive and starts pulling them back; it stops charging when even the fastest photoelectrons can no longer get away. Counting Lyman-α alone, how many electrons has the probe lost by then? ($hc = 1240$ eV nm, $k = 8.99\times10^9\ \text{N m}^2/\text{C}^2$, $e = 1.602\times10^{-19}$ C)`,
              answer: N, tol: { rel: 0.02 },
              errors: apart([
                { value: (N * Eph) / K, feedback: t`The work function is spent getting the electron out of the metal: the fastest photoelectrons leave with $K_{\max} = hc/\lambda - \varphi$, not the photon's whole energy.` },
                { value: (N * phi) / K, feedback: t`The potential that stops the electrons is set by their kinetic energy, $K_{\max}/e$, not by the work function.` },
                { value: N * R, feedback: t`$kQ/R^2$ is the field at the surface. An escaping electron must climb the *potential*, $V = kQ/R$.` },
              ], N),
              hints: [
                t`The fastest photoelectrons leave with $K_{\max} = hc/\lambda - \varphi$.`,
                t`A sphere of charge $Q$ and radius $R$ is at potential $V = kQ/R$, taking $V = 0$ far away. An electron leaving its surface needs kinetic energy $eV$ to escape for good, so charging stops when $eV = K_{\max}$.`,
                t`Then $Q = RV/k$, and the number of electrons lost is $Q/e$.`,
              ],
              teach: 'A body that emits photoelectrons charges up until its potential, in volts, equals the fastest electrons’ kinetic energy in electronvolts.',
              explain: t`A Lyman-α photon carries $hc/\lambda = 1240/121.6 = ${tn(Eph, 3)}$ eV, so the fastest photoelectrons leave with $K_{\max} = ${tn(Eph, 3)} - ${phi.toFixed(1)} = ${tn(K, 3)}$ eV. The sphere's potential is $V = kQ/R$, and an electron must spend $eV$ to escape it, so charging stops at $V = K_{\max}/e = ${tn(Vs, 3)}$ V. Then $Q = RV/k = ${tn(Q, 3)}$ C, and the probe has lost $Q/e = ${tn(N, 3)}$ electrons — a few billion, out of roughly $10^{29}$ in its metal. This is a teaching model: photoelectrons come out with a spread of energies, other ultraviolet light adds some, and the probe also gathers the solar wind's own electrons and ions. Even so, spacecraft in sunlight do float a few volts positive, and plasma instruments must allow for it: a positive probe repels slow ions and draws in slow electrons.`,
              visual: chargePic(),
            };
          },
        }),
        num({
          id: 'r4-prism', skill: 'phys2220.O1.2', difficulty: 4,
          gen(r) {
            const G = r.pick(GLASS);
            const crit = (n) => Math.asin(1 / n) / DEG, lim = (n) => Math.asin(n * Math.sin((45 - crit(n)) * DEG)) / DEG;
            const thc = crit(G.nr), ans = lim(G.nr);
            return {
              prompt: t`Lodestar's star tracker folds its light path with a right-angle prism of ${G.name}. Starlight enters one short face square-on along the tracker's axis, reflects inside from the long face (the hypotenuse) by total internal reflection, and leaves through the other short face toward the detector. The tracker works from 450 nm to 850 nm, where the glass's index is ${G.nb.toFixed(3)} and ${G.nr.toFixed(3)}. Light from a star off the axis enters the first face tilted, and tilted one way it meets the long face closer to the normal. On that side, how far off the axis can a star be before some of its light in the tracker's band starts to leak out through the long face?`,
              answer: ans, units: 'deg', tol: { rel: 0.015 },
              errors: apart([
                { value: lim(G.nb), feedback: t`At 450 nm the index is higher and the critical angle smaller, so blue light reflects over a wider range. The limit is set by the colour that leaks first: the reddest, where $n$ is smallest.` },
                { value: 45 - thc, feedback: t`That is the tilt allowed *inside* the glass. Outside, the star's light is tilted more: refraction at the entry face shrinks the tilt, so $\sin\theta = n\sin\theta'$.` },
                { value: Math.asin(Math.sin((45 - thc) * DEG) / G.nr) / DEG, feedback: t`Refraction goes the other way: light entering glass bends toward the normal, so the tilt outside is larger than inside, $\sin\theta = n\sin\theta'$.` },
              ], ans),
              hints: [
                t`Total internal reflection needs the light to meet the long face beyond $\theta_c = \arcsin(1/n)$. Which end of the band, with which index, gives the largest $\theta_c$?`,
                t`On the axis the light meets the long face at $45^\circ$. A ray tilted by $\theta'$ inside the glass meets it at $45^\circ - \theta'$, so it needs $\theta' \le 45^\circ - \theta_c$.`,
                t`At the entry face, $\sin\theta = n\sin\theta'$ gives the tilt $\theta$ in air.`,
              ],
              teach: 'A totally reflecting face works only beyond the critical angle, so a fold prism limits the field of view on one side — set by the colour with the lowest index.',
              explain: t`Total internal reflection needs the light to meet the long face beyond $\theta_c = \arcsin(1/n)$, which is largest where $n$ is smallest: at 850 nm, $\theta_c = ${tn(thc, 4)}^\circ$, so the red end of the band leaks first. A ray tilted by $\theta'$ inside the glass meets the long face at $45^\circ - \theta'$, so it needs $\theta' \le ${tn(45 - thc, 3)}^\circ$; at the entry face, $\sin\theta = ${G.nr.toFixed(3)}\sin${tn(45 - thc, 3)}^\circ$ gives $\theta = ${tn(ans, 3)}^\circ$. Stars tilted the other way meet the long face more steeply and reflect with room to spare. For a wider field, designers coat the long face with aluminium or silver, which reflects at any angle, or choose a glass of higher index.`,
              visual: prismPic(),
            };
          },
        }),
      ],
    },
    {
      title: 'The sky in X-rays',
      story: t`Bare nuclei in the solar wind steal electrons from the interstellar gas drifting through the solar system, and glow in X-rays as the captured electrons fall inward. Lodestar's spectrometer spreads that glow with a grating; behind its X-ray detectors, two thick layers catch gamma rays from across the Galaxy.`,
      items: [
        num({
          id: 'r5-line', skill: 'phys2220.A1.1', difficulty: 3,
          gen(r) {
            const ion = r.pick(IONS), lpm = r.pick([2500, 5000]), L = r.pick([0.8, 1.0, 1.2]);
            const d = 1e6 / lpm, xmm = (lam) => L * Math.tan(Math.asin(lam / d)) * 1e3;
            const E = 13.6 * ion.Z ** 2 * 0.75, lam = HC / E, th = Math.asin(lam / d), x = xmm(lam);
            return {
              prompt: t`A bare ${ion.el} nucleus (${ion.Z} protons) in the solar wind captures an electron from an interstellar hydrogen atom into a high level. The electron cascades down, finishing with the jump from $n = 2$ to $n = 1$. With a single electron, the ion's levels are hydrogen's scaled up: $E_n = -13.6\ \text{eV}\times Z^2/n^2$. The spectrometer's transmission grating has ${lpm} lines per millimetre and stands ${L.toFixed(1)} m in front of its detector, square-on to the incoming X-rays. How far from the central, undeviated spot does this line land in first order? ($hc = 1240$ eV nm)`,
              answer: x, units: 'mm', tol: { rel: 0.01 },
              errors: apart([
                { value: xmm(HC / 10.2), feedback: t`That is hydrogen's own Lyman-α. The nucleus here has charge $${ion.Z}e$: its levels are $Z^2$ times deeper.` },
                { value: xmm(HC / (13.6 * ion.Z * 0.75)), feedback: t`The levels scale as $Z^2$, not $Z$: the electron is pulled $Z$ times harder and sits $Z$ times closer in.` },
                { value: xmm(HC / (13.6 * ion.Z ** 2)), feedback: t`$13.6Z^2$ eV takes the electron all the way from far away to $n = 1$. This photon comes from the jump from $n = 2$, which releases $13.6Z^2\left(1 - \tfrac14\right)$ eV.` },
              ], x),
              hints: [
                t`The jump from $n = 2$ to $n = 1$ releases $E = 13.6\ \text{eV}\times Z^2\left(1 - \tfrac14\right)$, and $\lambda = hc/E$.`,
                t`The grating's lines are $d = (1\ \text{mm})/${lpm}$ apart; in first order $d\sin\theta = \lambda$.`,
                t`On a detector a distance $L$ away the line lands at $x = L\tan\theta$.`,
              ],
              teach: 'A one-electron ion’s lines are hydrogen’s with every energy scaled by Z², and a grating turns each line’s wavelength into a position, x ≈ Lλ/d.',
              explain: t`The jump releases $E = 13.6\times${ion.Z}^2\times\left(1 - \tfrac14\right) = ${tn(E, 4)}$ eV, so $\lambda = 1240/${tn(E, 4)} = ${tn(lam, 4)}$ nm — an X-ray. The grating's spacing is $d = 10^6/${lpm} = ${d}$ nm, so in first order $\sin\theta = \lambda/d = ${tn(lam / d, 3)}$ ($\theta = ${tn(th / DEG, 3)}^\circ$) and the line lands $x = L\tan\theta = ${tn(x, 3)}$ mm from the central spot. The line is measured at ${ion.meas} eV, so Bohr's simple formula is good to about 0.2% for a one-electron ion; the rest is small relativistic corrections. Lines like this, from solar-wind ions stealing electrons, make part of the soft X-ray glow of the whole sky — and comets glow the same way, as the ROSAT satellite found in 1996.`,
              visual: gratingPic(L.toFixed(1)),
            };
          },
        }),
        num({
          id: 'r5-compton', skill: 'phys2220.Q1.2', difficulty: 4,
          gen(r) {
            const [src, E0] = r.pick(LINES), th = r.pick([35, 50, 65, 80, 100]);
            const E2 = Math.round(E0 / (1 + (E0 / MEC2) * (1 - Math.cos(th * DEG)))), E1 = E0 - E2, E = E1 + E2;
            const cosK = 1 - MEC2 * (1 / E2 - 1 / E), thK = Math.acos(cosK) / DEG;
            const swap = 1 - MEC2 * (1 / E1 - 1 / E);
            return {
              prompt: t`Lodestar's gamma-ray camera is two thick detector layers, one behind the other. A gamma ray from ${src} enters it. In the first layer it Compton-scatters off an electron, which stops there and deposits ${E1} keV. The scattered photon flies on and is completely absorbed in the second layer, which records ${E2} keV. Through what angle did the gamma ray scatter? ($m_ec^2 = 511.0$ keV)`,
              answer: thK, units: 'deg', tol: { rel: 0.01 },
              errors: apart([
                { value: 180 - thK, feedback: t`Check the sign: $\dfrac{1}{E'} - \dfrac{1}{E} = \dfrac{1 - \cos\theta}{m_ec^2}$. A small loss of energy means a small angle.` },
                ...(Math.abs(swap) <= 1 ? [{ value: Math.acos(swap) / DEG, feedback: 'The electron stops in the first layer; the photon that scattered is the one absorbed in the second. Its energy is the scattered photon’s, E′.' }] : []),
              ], thK),
              hints: [
                t`Energy is conserved: the gamma ray brought $E = E_1 + E_2$, and the scattered photon carried $E' = E_2$.`,
                t`With $\lambda = hc/E$, Compton's shift $\lambda' - \lambda = \dfrac{h}{m_ec}(1 - \cos\theta)$ becomes $\dfrac{1}{E'} - \dfrac{1}{E} = \dfrac{1 - \cos\theta}{m_ec^2}$.`,
                t`So $\cos\theta = 1 - m_ec^2\left(\dfrac{1}{E_2} - \dfrac{1}{E_1 + E_2}\right)$.`,
              ],
              teach: 'Measuring both the recoil electron’s energy and the scattered photon’s fixes the Compton scattering angle — the principle of a Compton telescope.',
              explain: t`Energy is conserved, so the gamma ray brought $E = ${E1} + ${E2} = ${E}$ keV — the line itself — and the scattered photon carried $E' = ${E2}$ keV. With $\lambda = hc/E$, Compton's shift reads $\dfrac{1}{E'} - \dfrac{1}{E} = \dfrac{1 - \cos\theta}{m_ec^2}$, so $$\cos\theta = 1 - 511.0\left(\frac{1}{${E2}} - \frac{1}{${E}}\right) = ${tn(cosK, 3)}, \qquad \theta = ${tn(thK, 3)}^\circ.$$ The camera now knows that the photon arrived at $${tn(thK, 3)}^\circ$ to the line through its two hits, but not from which side: it came from somewhere on a cone. Each photon draws a ring on the sky, and the rings from many photons cross at the source. COMPTEL, on NASA's Compton Gamma Ray Observatory (1991–2000), mapped the Galaxy's aluminium-26 this way.`,
              visual: comptonPic(),
            };
          },
        }),
      ],
    },
  ],
});
