// The virtual lab bench behind sims/lab-bench.js and the PHYS 2215 lab
// lessons: simulated experiments that hand back noisy readings, and the
// analysis a real lab does with them — mean, standard deviation and standard
// error; a weighted least-squares straight line with the uncertainties of its
// slope and intercept and χ²; and the quantity the slope stands for (g, k, I…)
// with its uncertainty. DOM-free; checked by test/lab-bench.test.mjs.
//
// Every reading is   truth(setting, systematic) + σ·z,   rounded to the
// instrument's resolution, where z is a standard normal deviate drawn from a
// seeded generator — so a seed always gives the same data, in the browser and
// in Node. A row keeps its deviates, which is how the simulation can switch a
// systematic error on and off over the *same* random scatter.
//
// The experiments are teaching models of real bench set-ups. Their noise
// levels are typical of introductory-lab equipment; each says what it leaves
// out (air resistance, the wheels' spin, the bob's size …) in `note`.

import { makeRng } from '../../core/rng.js';

export const G_LOCAL = 9.80;        // m/s²: the accepted local value used at this bench
const D2R = Math.PI / 180;
const TAU = 2 * Math.PI;

// ─── random numbers ───────────────────────────────────────────────────────

/** A standard normal deviate (Box–Muller) from a seeded generator `rng`. */
export function gaussian(rng) {
  let u = rng.next();
  while (u <= 1e-12) u = rng.next();
  const v = rng.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

/** Round to a resolution step (0.001 → nearest millisecond), without float dust. */
export function roundTo(x, step) {
  if (!step) return x;
  const dec = Math.max(0, Math.ceil(-Math.log10(step) - 1e-9));
  return +(Math.round(x / step) * step).toFixed(Math.min(12, dec + 2));
}

// ─── statistics of repeated readings ─────────────────────────────────────

/** n, mean, the sample standard deviation (n − 1) and the standard error of the mean. */
export function stats(xs) {
  const n = xs.length;
  if (!n) return { n: 0, mean: NaN, sd: NaN, sem: NaN };
  const mean = xs.reduce((s, x) => s + x, 0) / n;
  const ss = xs.reduce((s, x) => s + (x - mean) ** 2, 0);
  const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : NaN;
  return { n, mean, sd, sem: sd / Math.sqrt(n), sdPop: Math.sqrt(ss / n), min: Math.min(...xs), max: Math.max(...xs) };
}

/** Standard uncertainty of a reading limited only by resolution `step` (a rectangular distribution of full width `step`). */
export const resolutionU = (step) => step / (2 * Math.sqrt(3));

/** How many combined standard uncertainties apart two results are. */
export const discrepancy = (a, ua, b, ub = 0) => Math.abs(a - b) / Math.hypot(ua, ub);

// ─── least squares ────────────────────────────────────────────────────────

/**
 * Weighted least-squares straight line y = a + b x.
 *   sy: the y error bars (σ of each y), or null for an unweighted fit whose
 *       scatter is estimated from the residuals (as numpy.polyfit(cov=True) does);
 *   sx: optional x error bars, folded in by the effective-variance method
 *       σ² = σy² + b²σx² (iterated).
 * Returns the line, the standard uncertainties sa and sb (taking the error bars
 * as true standard deviations), their covariance, χ², the degrees of freedom
 * n − 2 and χ²/dof, plus `sbScaled`, `saScaled`: the uncertainties rescaled by
 * √(χ²/dof), which is what numpy.polyfit(…, cov=True) reports.
 */
export function fitLine(x, y, sy = null, sx = null) {
  const n = x.length;
  if (n < 2) return null;
  let b = 0, a = 0, out = null;
  const passes = sx ? 6 : 1;
  for (let pass = 0; pass < passes; pass++) {
    const w = x.map((_, i) => {
      if (!sy && !sx) return 1;
      const v = (sy ? sy[i] ** 2 : 0) + (sx && pass > 0 ? (b * sx[i]) ** 2 : 0);
      return v > 0 ? 1 / v : 1;
    });
    let S = 0, Sx = 0, Sy = 0, Sxx = 0, Sxy = 0;
    for (let i = 0; i < n; i++) { S += w[i]; Sx += w[i] * x[i]; Sy += w[i] * y[i]; Sxx += w[i] * x[i] * x[i]; Sxy += w[i] * x[i] * y[i]; }
    const D = S * Sxx - Sx * Sx;
    if (!(Math.abs(D) > 0)) return null;
    b = (S * Sxy - Sx * Sy) / D;
    a = (Sxx * Sy - Sx * Sxy) / D;
    let chi2 = 0;
    for (let i = 0; i < n; i++) chi2 += w[i] * (y[i] - a - b * x[i]) ** 2;
    const dof = n - 2;
    const scale = sy || sx ? 1 : (dof > 0 ? chi2 / dof : NaN);   // unweighted: σ² estimated from the scatter
    out = { a, b, sa: Math.sqrt((Sxx / D) * scale), sb: Math.sqrt((S / D) * scale), cov: (-Sx / D) * scale, chi2, dof, n, weighted: !!(sy || sx) };
  }
  if (sx) Object.assign(out, exactXY(x, y, sy, sx, out, false));
  out.chi2r = out.dof > 0 ? out.chi2 / out.dof : NaN;
  const k = out.weighted && out.dof > 0 ? Math.sqrt(out.chi2r) : 1;
  out.saScaled = out.sa * k; out.sbScaled = out.sb * k;
  out.residuals = x.map((xi, i) => y[i] - (out.a + out.b * xi));
  return out;
}

/**
 * Errors in x as well as y: minimise χ²(a, b) = Σ (y − a − bx)² / (σy² + b²σx²)
 * exactly — the intercept profiled out, the slope found by golden-section
 * search around the re-weighted estimate — and take the covariance from the
 * curvature of χ² (Cov = 2H⁻¹), since the weights themselves depend on b.
 */
function exactXY(x, y, sy, sx, est, origin) {
  const n = x.length;
  const v = (b, i) => (sy ? sy[i] ** 2 : 0) + b * b * sx[i] ** 2;
  const aOf = (b) => {
    if (origin) return 0;
    let Sw = 0, Swr = 0;
    for (let i = 0; i < n; i++) { const w = 1 / v(b, i); Sw += w; Swr += w * (y[i] - b * x[i]); }
    return Swr / Sw;
  };
  const chi = (a, b) => { let c = 0; for (let i = 0; i < n; i++) c += (y[i] - a - b * x[i]) ** 2 / v(b, i); return c; };
  const prof = (b) => chi(aOf(b), b);
  let lo = est.b - 8 * est.sb, hi = est.b + 8 * est.sb;
  const gr = (Math.sqrt(5) - 1) / 2;
  let c1 = hi - gr * (hi - lo), c2 = lo + gr * (hi - lo), f1 = prof(c1), f2 = prof(c2);
  for (let k = 0; k < 200 && hi - lo > 1e-13 * Math.max(1, Math.abs(est.b)); k++) {
    if (f1 < f2) { hi = c2; c2 = c1; f2 = f1; c1 = hi - gr * (hi - lo); f1 = prof(c1); }
    else { lo = c1; c1 = c2; f1 = f2; c2 = lo + gr * (hi - lo); f2 = prof(c2); }
  }
  const b = (lo + hi) / 2, a = aOf(b), chi2 = chi(a, b);
  // the Hessian of χ²(a, b) by central differences
  const hb = Math.max(1e-6 * Math.abs(b), est.sb * 1e-3), ha = Math.max(1e-6 * Math.abs(a), (est.sa || est.sb) * 1e-3);
  const Hbb = (chi(a, b + hb) - 2 * chi2 + chi(a, b - hb)) / hb ** 2;
  if (origin) return { a: 0, b, chi2, sb: Math.sqrt(2 / Hbb) };
  const Haa = (chi(a + ha, b) - 2 * chi2 + chi(a - ha, b)) / ha ** 2;
  const Hab = (chi(a + ha, b + hb) - chi(a + ha, b - hb) - chi(a - ha, b + hb) + chi(a - ha, b - hb)) / (4 * ha * hb);
  const det = Haa * Hbb - Hab * Hab;
  return { a, b, chi2, sa: Math.sqrt((2 * Hbb) / det), sb: Math.sqrt((2 * Haa) / det), cov: (-2 * Hab) / det };
}

/** The same with the line forced through the origin, y = b x (dof = n − 1). */
export function fitOrigin(x, y, sy = null, sx = null) {
  const n = x.length;
  if (n < 1) return null;
  let b = 0, out = null;
  const passes = sx ? 6 : 1;
  for (let pass = 0; pass < passes; pass++) {
    const w = x.map((_, i) => {
      if (!sy && !sx) return 1;
      const v = (sy ? sy[i] ** 2 : 0) + (sx && pass > 0 ? (b * sx[i]) ** 2 : 0);
      return v > 0 ? 1 / v : 1;
    });
    let Sxx = 0, Sxy = 0;
    for (let i = 0; i < n; i++) { Sxx += w[i] * x[i] * x[i]; Sxy += w[i] * x[i] * y[i]; }
    b = Sxy / Sxx;
    let chi2 = 0;
    for (let i = 0; i < n; i++) chi2 += w[i] * (y[i] - b * x[i]) ** 2;
    const dof = n - 1;
    const scale = sy || sx ? 1 : (dof > 0 ? chi2 / dof : NaN);
    out = { a: 0, b, sa: 0, sb: Math.sqrt(scale / Sxx), chi2, dof, n, weighted: !!(sy || sx), origin: true };
  }
  if (sx) Object.assign(out, exactXY(x, y, sy, sx, out, true));
  out.chi2r = out.dof > 0 ? out.chi2 / out.dof : NaN;
  out.residuals = x.map((xi, i) => y[i] - out.b * xi);
  return out;
}

/** Report a value with its uncertainty: σ to 2 significant figures, the value to the same decimal place. */
export function pm(value, sigma, { digits = 2 } = {}) {
  if (!Number.isFinite(value)) return { v: '—', s: '—', dec: 0 };
  if (!(sigma > 0) || !Number.isFinite(sigma)) return { v: String(+value.toPrecision(4)), s: '', dec: 0 };
  const p = Math.floor(Math.log10(sigma)) - (digits - 1);
  const dec = Math.max(0, -p);
  const r = (z) => (Math.round(z / 10 ** p) * 10 ** p).toFixed(dec);
  return { v: r(value), s: r(sigma), dec };
}

// ─── the experiments ──────────────────────────────────────────────────────
//
// Each experiment:
//   title, apparatus (drawing), note (what the model leaves out)
//   defaults: physical parameters (overridable per lesson)
//   setting: the knob you turn (null for a repeated-measurement experiment)
//   nz: normal deviates per row;   read(s, P, sys, z) → the raw readings
//   series: [{ key, sym, label, unit, res, sigma(s, P) }] — the readings,
//           their resolution and stated standard uncertainty
//   options: experiment controls (e.g. swings timed per reading)
//   repeat: { of(s, R, P), sigma(s, R, P), sym, unit, label, accepted(P) } — the
//           per-reading quantity a repeated-measurement view plots
//   axes: { key: { label, x: {sym, unit, of, sigma?}, ys: [{sym, unit, of, sigma, name}],
//           expect(P, sys)?, results: [{ sym, unit, of(fit, P), sigma(fit, P), accepted(P), name, typeB }] } }
//   systematics: { key: { label, explain, short } }   (P.sys names the active one)

const pendulumT = (L, g) => TAU * Math.sqrt(L / g);
/** The exact period factor T/T₀ of a simple pendulum of amplitude θ₀ (radians): π / (2K(sin θ₀/2)) inverted, via the AGM. */
export function amplitudeFactor(theta0) {
  let a = 1, b = Math.cos(theta0 / 2);
  for (let k = 0; k < 30 && Math.abs(a - b) > 1e-15; k++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return 1 / a;
}

export const EXPERIMENTS = {
  // L.1 — one quantity, measured again and again
  stopwatch: {
    title: 'Timing a seconds pendulum by hand',
    apparatus: 'pendulum',
    note: 'Each timing is off by your reaction at the start and at the stop, modelled as Gaussian scatter of 0.05 s per timing. The pendulum itself is ideal: small swings, no air drag.',
    defaults: { L: 0.993, g: G_LOCAL, n: 1, react: 0.05, bias: 0.10, amp: 5 },
    setting: null,
    options: [{ key: 'n', label: 'Swings per timing', choices: [[1, '1 swing'], [10, '10 swings']], explain: 'Time one swing, or ten in a row and divide by ten: your reaction error is spread over all ten.' }],
    nz: 1,
    read: (s, P, sys, z) => [P.n * pendulumT(P.L, P.g) + (sys === 'reaction' ? P.bias : 0) + P.react * z[0]],
    series: [{ key: 't', sym: 't', label: 'stopwatch reading', unit: 's', res: 0.01, sigma: (s, P) => P.react }],
    repeat: { sym: 'T', label: 'period', unit: 's', of: (s, R, P) => R[0] / P.n, sigma: (s, R, P) => P.react / P.n, accepted: (P) => pendulumT(P.L, P.g), acceptedLabel: 'expected' },
    systematics: { reaction: { label: 'Reaction bias: you stop the watch late (+0.10 s per timing)', short: 'late stop', explain: 'You anticipate the start but react to the stop, so every timing is 0.10 s too long.' } },
    defaultSys: 'reaction',
  },

  // L.2 — Galileo’s inclined plane: distance against time, with a motion sensor
  ramp: {
    title: 'A cart released down an inclined air track',
    apparatus: 'ramp',
    note: 'A frictionless air track inclined at 2.0°; the motion sensor’s position noise is 2 mm. Real air tracks have a little air drag.',
    defaults: { theta: 2.0, g: G_LOCAL, x0: 0.050, sx: 0.002 },
    setting: { key: 't', sym: 't', label: 'Time after release $t$', unit: 's', min: 0.3, max: 3.2, step: 0.1, value: 1.5, series: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0], explain: 'The sensor reports the cart’s position at this moment of the run.' },
    nz: 1,
    read: (t, P, sys, z) => [0.5 * P.g * Math.sin(P.theta * D2R) * t * t + (sys === 'zero' ? P.x0 : 0) + P.sx * z[0]],
    series: [{ key: 'x', sym: 'x', label: 'position', unit: 'm', res: 0.001, sigma: (s, P) => P.sx }],
    axes: {
      square: {
        label: 'x against t²', slopeUnit: 'm/s²', x: { sym: 't²', unit: 's²', of: (t) => t * t }, ys: [{ sym: 'x', unit: 'm', of: (t, R) => R[0], sigma: (t, R, P) => P.sx }],
        expect: (P) => ({ a: 0, b: 0.5 * P.g * Math.sin(P.theta * D2R) }),
        results: [{ sym: 'a', name: 'acceleration', unit: 'm/s²', of: (f) => 2 * f.b, sigma: (f) => 2 * f.sb, accepted: (P) => P.g * Math.sin(P.theta * D2R), acceptedLabel: 'g sin θ' }],
        intercept: { sym: 'x₀', name: 'position at t = 0', unit: 'm' },
      },
      raw: { label: 'x against t', slopeUnit: 'm/s', x: { sym: 't', unit: 's', of: (t) => t }, ys: [{ sym: 'x', unit: 'm', of: (t, R) => R[0], sigma: (t, R, P) => P.sx }], curved: true },
      loglog: {
        label: 'ln x against ln t', slopeUnit: '', x: { sym: 'ln t', unit: '', of: (t) => Math.log(t) }, ys: [{ sym: 'ln x', unit: '', of: (t, R) => Math.log(Math.max(R[0], 1e-4)), sigma: (t, R, P) => P.sx / Math.max(R[0], 1e-4) }],
        expect: (P) => ({ a: Math.log(0.5 * P.g * Math.sin(P.theta * D2R)), b: 2 }),
        results: [{ sym: 'n', name: 'power of t', unit: '', of: (f) => f.b, sigma: (f) => f.sb, accepted: () => 2, acceptedLabel: 'x ∝ t²' }],
      },
    },
    defaultAxes: 'square',
    systematics: { zero: { label: 'Sensor zero 5.0 cm behind the release point', short: 'zero offset', explain: 'Positions are measured from the sensor’s zero, which sits 5.0 cm behind where the cart starts.' } },
    defaultSys: 'zero',
  },

  // L.3 — free fall timed electronically
  freefall: {
    title: 'A steel ball dropped from an electromagnet',
    apparatus: 'freefall',
    note: 'Air resistance is left out: for a 2 cm steel ball it lengthens a 1.3 m fall by about 0.06% (0.3 ms). Heights are read to ±1 mm; the timer scatters by 1.5 ms and reads to 1 ms.',
    defaults: { g: G_LOCAL, delay: 0.012, st: 0.0015, sh: 0.001 },
    setting: { key: 'h', sym: 'h', label: 'Drop height $h$', unit: 'm', min: 0.1, max: 1.5, step: 0.05, value: 0.7, series: [0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3], explain: 'From the bottom of the ball to the trapdoor, read off a metre rule to ±1 mm.' },
    nz: 2,
    read: (h, P, sys, z) => [Math.sqrt((2 * (h + P.sh * z[0])) / P.g) + (sys === 'delay' ? P.delay : 0) + P.st * z[1]],
    series: [{ key: 't', sym: 't', label: 'fall time', unit: 's', res: 0.001, sigma: (s, P) => Math.hypot(P.st, resolutionU(0.001)) }],
    axes: {
      sqrt: {
        label: 't against √h', slopeUnit: 's/√m', x: { sym: '√h', unit: '√m', of: (h) => Math.sqrt(h), sigma: (h, R, P) => P.sh / (2 * Math.sqrt(h)) }, ys: [{ sym: 't', unit: 's', of: (h, R) => R[0], sigma: (h, R, P) => Math.hypot(P.st, resolutionU(0.001)) }],
        expect: (P) => ({ a: 0, b: Math.sqrt(2 / P.g) }),
        results: [{ sym: 'g', name: 'free-fall acceleration', unit: 'm/s²', of: (f) => 2 / f.b ** 2, sigma: (f) => (4 / f.b ** 3) * f.sb, accepted: (P) => P.g, acceptedLabel: 'local g' }],
        intercept: { sym: 'δ', name: 'timer delay', unit: 's' },
      },
      square: {
        label: 't² against h', slopeUnit: 's²/m', x: { sym: 'h', unit: 'm', of: (h) => h, sigma: (h, R, P) => P.sh }, ys: [{ sym: 't²', unit: 's²', of: (h, R) => R[0] ** 2, sigma: (h, R, P) => 2 * R[0] * Math.hypot(P.st, resolutionU(0.001)) }],
        expect: (P) => ({ a: 0, b: 2 / P.g }),
        results: [{ sym: 'g', name: 'free-fall acceleration', unit: 'm/s²', of: (f) => 2 / f.b, sigma: (f) => (2 / f.b ** 2) * f.sb, accepted: (P) => P.g, acceptedLabel: 'local g' }],
      },
      raw: { label: 't against h', slopeUnit: 's/m', x: { sym: 'h', unit: 'm', of: (h) => h, sigma: (h, R, P) => P.sh }, ys: [{ sym: 't', unit: 's', of: (h, R) => R[0], sigma: (h, R, P) => Math.hypot(P.st, resolutionU(0.001)) }], curved: true },
    },
    defaultAxes: 'sqrt',
    systematics: { delay: { label: 'Release delay: the magnet holds the ball 12 ms after the timer starts', short: 'release delay', explain: 'The timer starts when the magnet’s current is cut, but the fading field holds the ball for another 12 ms.' } },
    defaultSys: 'delay',
  },

  // L.4 — range against launch angle, landing level with the muzzle
  launcher: {
    title: 'A spring launcher fired at different angles',
    apparatus: 'launcher',
    note: 'No air resistance, and the ball lands at the height it left the muzzle. Shot-to-shot launch speed varies by 0.5%; the tape reads to 2 mm.',
    defaults: { v0: 4.20, g: G_LOCAL, sv: 0.005, sr: 0.002, offset: 0.060 },
    setting: { key: 'theta', sym: 'θ', label: 'Launch angle $\\theta$', unit: '°', min: 10, max: 80, step: 5, value: 30, series: [10, 20, 30, 40, 50, 60, 70, 80], explain: 'Above the horizontal, read from the launcher’s protractor.' },
    nz: 2,
    read: (th, P, sys, z) => {
      const v = P.v0 * (1 + P.sv * z[0]);
      return [(v * v * Math.sin(2 * th * D2R)) / P.g - (sys === 'zero' ? P.offset : 0) + P.sr * z[1]];
    },
    series: [{ key: 'R', sym: 'R', label: 'range', unit: 'm', res: 0.001, sigma: (th, P) => Math.hypot(2 * P.sv * (P.v0 ** 2 * Math.sin(2 * th * D2R)) / P.g, P.sr) }],
    axes: {
      sin2: {
        label: 'R against sin 2θ', slopeUnit: 'm', x: { sym: 'sin 2θ', unit: '', of: (th) => Math.sin(2 * th * D2R) }, ys: [{ sym: 'R', unit: 'm', of: (th, R) => R[0], sigma: (th, R, P) => Math.hypot(2 * P.sv * Math.max(R[0], 0), P.sr) }],
        expect: (P) => ({ a: 0, b: (P.v0 * P.v0) / P.g }),
        results: [{ sym: 'v₀', name: 'launch speed', unit: 'm/s', of: (f, P) => Math.sqrt(P.g * f.b), sigma: (f, P) => (Math.sqrt(P.g * f.b) * f.sb) / (2 * f.b), accepted: (P) => P.v0, acceptedLabel: 'photogate v₀' }],
        intercept: { sym: 'R₀', name: 'range offset', unit: 'm' },
      },
      raw: { label: 'R against θ', slopeUnit: 'm/°', x: { sym: 'θ', unit: '°', of: (th) => th }, ys: [{ sym: 'R', unit: 'm', of: (th, R) => R[0], sigma: (th, R, P) => Math.hypot(2 * P.sv * Math.max(R[0], 0), P.sr) }], curved: true },
    },
    defaultAxes: 'sin2',
    repeat: { sym: 'R', label: 'range', unit: 'm', of: (s, R) => R[0], sigma: (th, R, P) => Math.hypot(2 * P.sv * Math.max(R[0], 0), P.sr), accepted: (P, th) => (P.v0 * P.v0 * Math.sin(2 * th * D2R)) / P.g, acceptedLabel: 'predicted' },
    systematics: { zero: { label: 'Tape laid from the launcher’s front edge, 6.0 cm ahead of the launch point', short: 'zero offset', explain: 'Every range is read 6.0 cm short.' } },
    defaultSys: 'zero',
  },

  // L.5 — Newton’s second law: acceleration against hanging weight, total mass fixed
  cart: {
    title: 'A cart pulled by a falling mass, total mass held fixed',
    apparatus: 'cart',
    note: 'Slotted masses move from the cart to the hanger, so the accelerated mass stays 0.600 kg. String and pulley are light; the motion sensor gives a to ±0.006 m/s².',
    defaults: { M: 0.600, g: G_LOCAL, f: 0.030, sa: 0.006 },
    setting: { key: 'm', sym: 'm', label: 'Hanging mass $m$', unit: 'kg', min: 0.005, max: 0.08, step: 0.005, value: 0.03, series: [0.010, 0.020, 0.030, 0.040, 0.050, 0.060], explain: 'Hanger included; the rest of the 0.600 kg rides on the cart.' },
    nz: 1,
    read: (m, P, sys, z) => [Math.max(0, (m * P.g - (sys === 'friction' ? P.f : 0)) / P.M) + P.sa * z[0]],
    series: [{ key: 'a', sym: 'a', label: 'acceleration', unit: 'm/s²', res: 0.001, sigma: (s, P) => P.sa }],
    axes: {
      aF: {
        label: 'a against F', slopeUnit: '1/kg', expectLabel: 'a = F/M: no friction', x: { sym: 'F = mg', unit: 'N', of: (m, R, P) => m * P.g }, ys: [{ sym: 'a', unit: 'm/s²', of: (m, R) => R[0], sigma: (m, R, P) => P.sa }],
        expect: (P) => ({ a: 0, b: 1 / P.M }),
        results: [{ sym: 'M', name: 'accelerated mass', unit: 'kg', of: (f) => 1 / f.b, sigma: (f) => f.sb / f.b ** 2, accepted: (P) => P.M, acceptedLabel: 'balance' }],
        intercept: { sym: 'a₀', name: 'intercept', unit: 'm/s²' },
      },
    },
    defaultAxes: 'aF',
    systematics: { friction: { label: 'Friction in the wheels and pulley (0.030 N)', short: 'friction', explain: 'A steady 0.030 N of friction opposes the motion.' } },
    defaultSys: 'friction',
  },

  // L.6 — friction against normal force, pulled by a force sensor
  friction: {
    title: 'A loaded block pulled across a board',
    apparatus: 'friction',
    note: 'Friction is modelled as exactly proportional to the normal force; the peak (static) force scatters by 4% from pull to pull, the sliding (kinetic) force by 2%. Real surfaces wear and vary more.',
    defaults: { mb: 0.250, mus: 0.42, muk: 0.30, g: G_LOCAL, angle: 20, zero: 0.20 },
    setting: { key: 'm', sym: 'm', label: 'Load on the block $m$', unit: 'kg', min: 0, max: 1.5, step: 0.05, value: 0.5, series: [0, 0.25, 0.5, 0.75, 1.0, 1.25], explain: 'Added to the 0.250 kg block.' },
    nz: 2,
    read: (m, P, sys, z) => {
      const W = (P.mb + m) * P.g, al = sys === 'angle' ? P.angle * D2R : 0;
      const pull = (mu) => (mu * W) / (Math.cos(al) + mu * Math.sin(al));
      const Fs = pull(P.mus), Fk = pull(P.muk), off = sys === 'zero' ? P.zero : 0;
      return [Fs * (1 + 0.04 * z[0]) + off, Fk + Math.hypot(0.02 * Fk, 0.02) * z[1] + off];
    },
    series: [
      { key: 'Fs', sym: 'F peak', label: 'peak force', unit: 'N', res: 0.01, sigma: (m, P) => 0.04 * P.mus * (P.mb + m) * P.g },
      { key: 'Fk', sym: 'F slide', label: 'sliding force', unit: 'N', res: 0.01, sigma: (m, P) => Math.hypot(0.02 * P.muk * (P.mb + m) * P.g, 0.02) },
    ],
    axes: {
      FN: {
        label: 'F against N', slopeUnit: '', x: { sym: 'N', unit: 'N', of: (m, R, P) => (P.mb + m) * P.g },
        ys: [
          { sym: 'F peak', name: 'static (peak)', unit: 'N', of: (m, R) => R[0], sigma: (m, R) => 0.04 * R[0] },
          { sym: 'F slide', name: 'kinetic (sliding)', unit: 'N', of: (m, R) => R[1], sigma: (m, R) => Math.hypot(0.02 * R[1], 0.02) },
        ],
        expect: (P) => [{ a: 0, b: P.mus }, { a: 0, b: P.muk }],
        results: [
          { sym: 'μs', name: 'static coefficient', unit: '', of: (f) => f.b, sigma: (f) => f.sb, accepted: (P) => P.mus, acceptedLabel: 'true μs', series: 0 },
          { sym: 'μk', name: 'kinetic coefficient', unit: '', of: (f) => f.b, sigma: (f) => f.sb, accepted: (P) => P.muk, acceptedLabel: 'true μk', series: 1 },
        ],
      },
    },
    defaultAxes: 'FN',
    systematics: {
      angle: { label: 'String pulled 20° above the horizontal', short: 'tilted pull', explain: 'The force sensor is held high, so the string rises at 20°: it lifts the block a little and only part of the pull is horizontal.' },
      zero: { label: 'Force sensor never zeroed: it reads 0.20 N with nothing attached', short: 'zero offset', explain: 'Every force reading is 0.20 N too high.' },
    },
    defaultSys: 'angle',
  },

  // L.6 — the tilting-board method for the static coefficient
  tilt: {
    title: 'Tilting a board until the block slips',
    apparatus: 'tilt',
    note: 'The slipping angle scatters by 1.2° from trial to trial (the surface is not uniform); the protractor reads to 0.5°.',
    defaults: { mus: 0.42, sth: 1.2, zero: 2.0 },
    setting: null,
    nz: 1,
    read: (s, P, sys, z) => [Math.atan(P.mus) / D2R + (sys === 'zero' ? P.zero : 0) + P.sth * z[0]],
    series: [{ key: 'th', sym: 'θc', label: 'slipping angle', unit: '°', res: 0.5, sigma: (s, P) => P.sth }],
    repeat: { sym: 'θc', label: 'slipping angle', unit: '°', of: (s, R) => R[0], sigma: (s, R, P) => P.sth, accepted: (P) => Math.atan(P.mus) / D2R, acceptedLabel: 'tan⁻¹ μs' },
    systematics: { zero: { label: 'Protractor reads 2.0° when the board is level', short: 'zero error', explain: 'The protractor was not zeroed: it shows 2.0° with the board flat.' } },
    defaultSys: 'zero',
  },

  // L.7 — energy on an inclined track: v² against drop height
  energy: {
    title: 'A cart rolling down an inclined track through a photogate',
    apparatus: 'energy',
    note: 'Rolling friction (μ = 0.004) is the only loss; the wheels’ spin energy is ignored. The gate times the 2.50 cm flag to ±0.1 ms; the release point varies by ±2 mm along the track.',
    defaults: { theta: 10, mu: 0.004, w: 0.025, wTrue: 0.026, g: G_LOCAL, st: 0.0001, sd: 0.002 },
    options: [{ key: 'theta', label: 'Track angle', choices: [[6, '6°'], [10, '10°'], [15, '15°']], explain: 'Tilt the track more or less steeply. The same heights then mean shorter or longer runs along the track.' }],
    setting: { key: 'h', sym: 'h', label: 'Release height $h$', unit: 'm', min: 0.02, max: 0.20, step: 0.01, value: 0.12, series: [0.03, 0.06, 0.09, 0.12, 0.15, 0.18], explain: 'Height of the release point above the photogate, h = d sin θ.' },
    nz: 2,
    read: (h, P, sys, z) => {
      const th = P.theta * D2R, d = h / Math.sin(th) + P.sd * z[0];
      const v = Math.sqrt(2 * P.g * d * (Math.sin(th) - P.mu * Math.cos(th)));
      return [(sys === 'flag' ? P.wTrue : P.w) / v + P.st * z[1]];
    },
    series: [{ key: 'dt', sym: 'Δt', label: 'blocking time', unit: 's', res: 0.0001, sigma: (h, P) => P.st }],
    axes: {
      v2h: {
        label: 'v² against h', slopeUnit: 'm/s²', expectLabel: 'v² = 2gh: no energy lost', x: { sym: 'h', unit: 'm', of: (h) => h },
        ys: [{ sym: 'v²', unit: 'm²/s²', of: (h, R, P) => (P.w / R[0]) ** 2, sigma: (h, R, P) => { const v2 = (P.w / R[0]) ** 2, th = P.theta * D2R; return Math.hypot((2 * v2 * Math.hypot(P.st, resolutionU(0.0001))) / R[0], (2 * P.g * P.sd * (Math.sin(th) - P.mu * Math.cos(th)))); } }],
        expect: (P) => ({ a: 0, b: 2 * P.g }),
        results: [{ sym: 'K/U', name: 'share of the energy that reaches the gate', unit: '', of: (f, P) => f.b / (2 * P.g), sigma: (f, P) => f.sb / (2 * P.g), accepted: () => 1, acceptedLabel: 'no losses' }],
        intercept: { sym: 'v²₀', name: 'intercept', unit: 'm²/s²' },
      },
    },
    defaultAxes: 'v2h',
    systematics: { flag: { label: 'The flag is really 2.60 cm wide, not the 2.50 cm assumed', short: 'flag width', explain: 'Every speed is worked out with the wrong flag width.' } },
    defaultSys: 'flag',
  },

  // L.8 — a sticky collision: momentum after against momentum before
  collision: {
    title: 'Two carts that stick together',
    apparatus: 'collision',
    note: 'The push varies by 4% from run to run; each photogate speed is good to 0.5%. Friction between the gates is ignored.',
    defaults: { m1: 0.500, m2: 0.500, extra: 0.100, sv: 0.005, push: 0.04 },
    setting: { key: 'u', sym: 'u', label: 'Push speed (roughly) $u$', unit: 'm/s', min: 0.2, max: 1.0, step: 0.05, value: 0.5, series: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8], explain: 'How hard you push cart 1; gate A measures what it really got.' },
    nz: 3,
    read: (u, P, sys, z) => {
      const u1 = u * (1 + P.push * z[0]);
      const m2 = P.m2 + (sys === 'mass' ? P.extra : 0);
      const v = (P.m1 * u1) / (P.m1 + m2);
      return [u1 * (1 + P.sv * z[1]), v * (1 + P.sv * z[2])];
    },
    series: [
      { key: 'u1', sym: 'u₁', label: 'speed before (gate A)', unit: 'm/s', res: 0.001, sigma: (u, P) => P.sv * u },
      { key: 'v', sym: 'v', label: 'speed after (gate B)', unit: 'm/s', res: 0.001, sigma: (u, P) => (P.sv * u * P.m1) / (P.m1 + P.m2) },
    ],
    axes: {
      pp: {
        label: 'p after against p before', slopeUnit: '', expectLabel: 'momentum conserved',
        x: { sym: 'p before = m₁u₁', unit: 'kg·m/s', of: (u, R, P) => P.m1 * R[0], sigma: (u, R, P) => P.m1 * P.sv * R[0] },
        ys: [{ sym: 'p after = (m₁+m₂)v', unit: 'kg·m/s', of: (u, R, P) => (P.m1 + P.m2) * R[1], sigma: (u, R, P) => (P.m1 + P.m2) * P.sv * R[1] }],
        expect: () => ({ a: 0, b: 1 }),
        results: [{ sym: 'p after ÷ p before', name: 'momentum ratio (slope)', unit: '', of: (f) => f.b, sigma: (f) => f.sb, accepted: () => 1, acceptedLabel: 'conserved' }],
      },
    },
    defaultAxes: 'pp',
    repeat: { sym: 'p after ÷ p before', label: 'momentum ratio', unit: '', of: (u, R, P) => ((P.m1 + P.m2) * R[1]) / (P.m1 * R[0]), sigma: (u, R, P) => Math.SQRT2 * P.sv * ((P.m1 + P.m2) * R[1]) / (P.m1 * R[0]), accepted: () => 1, acceptedLabel: 'conserved' },
    systematics: { mass: { label: 'Cart 2 carries a 0.100 kg bar that was never weighed', short: 'mass not recorded', explain: 'Cart 2 really has 0.600 kg, but your table says 0.500 kg.' } },
    defaultSys: 'mass',
  },

  // L.9 — moment of inertia from torque against angular acceleration
  rotary: {
    title: 'A disc spun up by a falling mass',
    apparatus: 'rotary',
    note: 'The string is light and does not slip; the pulley’s own inertia is ignored. The rotary sensor gives α to 1%.',
    defaults: { M: 1.400, R: 0.1140, r: 0.0240, ring: false, Mr: 0.470, R1: 0.0540, R2: 0.0640, g: G_LOCAL, tf: 0.0015, sa: 0.01 },
    options: [{ key: 'ring', label: 'On the axle', choices: [[false, 'Disc'], [true, 'Disc + ring']], explain: 'Add a 0.470 kg ring (radii 5.40 and 6.40 cm) on top of the disc.' }],
    setting: { key: 'm', sym: 'm', label: 'Hanging mass $m$', unit: 'kg', min: 0.01, max: 0.15, step: 0.005, value: 0.06, series: [0.02, 0.04, 0.06, 0.08, 0.10, 0.12], explain: 'On a string wound round the 2.40 cm step of the pulley.' },
    nz: 1,
    read: (m, P, sys, z) => {
      const I = inertiaRotary(P), tf = sys === 'friction' ? P.tf : 0;
      const al = Math.max(0, (m * P.g * P.r - tf) / (I + m * P.r * P.r));
      return [al * (1 + P.sa * z[0])];
    },
    series: [{ key: 'alpha', sym: 'α', label: 'angular acceleration', unit: 'rad/s²', res: 0.001, sigma: (m, P) => P.sa * ((m * P.g * P.r) / (inertiaRotary(P) + m * P.r * P.r)) }],
    axes: {
      tau: {
        label: 'τ against α', slopeUnit: 'kg·m²',
        x: { sym: 'α', unit: 'rad/s²', of: (m, R) => R[0], sigma: (m, R, P) => P.sa * R[0] },
        ys: [{ sym: 'τ = m(g − αr)r', unit: 'N·m', of: (m, R, P) => m * (P.g - R[0] * P.r) * P.r, sigma: (m, R, P) => m * P.r * P.r * P.sa * R[0] }],
        expect: (P) => ({ a: 0, b: inertiaRotary(P) }),
        results: [{ sym: 'I', name: 'moment of inertia', unit: 'kg·m²', of: (f) => f.b, sigma: (f) => f.sb, accepted: (P) => inertiaRotary(P), acceptedLabel: (P0) => (P0.ring ? '½MR² + ring' : '½MR²') }],
        intercept: { sym: 'τ_f', name: 'friction torque', unit: 'N·m' },
      },
    },
    defaultAxes: 'tau',
    systematics: { friction: { label: 'A sticky bearing: 0.0015 N·m of friction torque', short: 'bearing friction', explain: 'The axle’s bearing resists with a steady friction torque.' } },
    defaultSys: 'friction',
  },

  // L.10 — the pendulum period against length
  pendulum: {
    title: 'A simple pendulum of adjustable length',
    apparatus: 'pendulum',
    note: 'Small swings (5°), no air drag, and the bob treated as a point; ten swings are timed by hand to ±0.05 s.',
    defaults: { g: G_LOCAL, rb: 0.025, amp: 5, ampBig: 40, react: 0.05 },
    setting: { key: 'L', sym: 'L', label: 'Length $L$', unit: 'm', min: 0.2, max: 1.6, step: 0.05, value: 0.9, series: [0.3, 0.5, 0.7, 0.9, 1.1, 1.3], explain: 'From the pivot to the centre of the bob, as you measured it.' },
    nz: 1,
    read: (L, P, sys, z) => {
      const Lt = L + (sys === 'knot' ? P.rb : 0);
      const amp = (sys === 'amplitude' ? P.ampBig : P.amp) * D2R;
      return [10 * pendulumT(Lt, P.g) * amplitudeFactor(amp) + P.react * z[0]];
    },
    series: [{ key: 't10', sym: 't₁₀', label: 'time for 10 swings', unit: 's', res: 0.01, sigma: (L, P) => P.react }],
    axes: {
      square: {
        label: 'T² against L', slopeUnit: 's²/m', expectLabel: 'T² = 4π²L/g', x: { sym: 'L', unit: 'm', of: (L) => L }, ys: [{ sym: 'T²', unit: 's²', of: (L, R) => (R[0] / 10) ** 2, sigma: (L, R, P) => (2 * (R[0] / 10) * P.react) / 10 }],
        expect: (P) => ({ a: 0, b: (4 * Math.PI ** 2) / P.g }),
        results: [{ sym: 'g', name: 'free-fall acceleration', unit: 'm/s²', of: (f) => (4 * Math.PI ** 2) / f.b, sigma: (f) => ((4 * Math.PI ** 2) / f.b ** 2) * f.sb, accepted: (P) => P.g, acceptedLabel: 'local g' }],
        intercept: { sym: 'T²₀', name: 'intercept', unit: 's²' },
      },
      raw: { label: 'T against L', slopeUnit: 's/m', x: { sym: 'L', unit: 'm', of: (L) => L }, ys: [{ sym: 'T', unit: 's', of: (L, R) => R[0] / 10, sigma: (L, R, P) => P.react / 10 }], curved: true },
      loglog: {
        label: 'ln T against ln L', slopeUnit: '', x: { sym: 'ln L', unit: '', of: (L) => Math.log(L) }, ys: [{ sym: 'ln T', unit: '', of: (L, R) => Math.log(R[0] / 10), sigma: (L, R, P) => P.react / R[0] }],
        expect: (P) => ({ a: Math.log(TAU / Math.sqrt(P.g)), b: 0.5 }),
        results: [{ sym: 'n', name: 'power of L', unit: '', of: (f) => f.b, sigma: (f) => f.sb, accepted: () => 0.5, acceptedLabel: 'T ∝ √L' }],
      },
    },
    defaultAxes: 'square',
    systematics: {
      knot: { label: 'Lengths measured to the top of the bob, 2.5 cm short of its centre', short: 'length offset', explain: 'Every length you wrote down is 2.5 cm shorter than the real pivot-to-centre length.' },
      amplitude: { label: 'Big swings: released at 40° instead of 5°', short: 'large amplitude', explain: 'At 40° the small-angle formula no longer holds: every period is about 3% long.' },
    },
    defaultSys: 'knot',
  },

  // L.11 — a spring: stretch against load (static) …
  'spring-static': {
    title: 'Hooke’s law: stretching a spring with weights', method: 'Static: stretch',
    apparatus: 'spring',
    note: 'An ideal linear spring; extensions read off a metre stick to ±1.5 mm (parallax).',
    defaults: { k: 15.0, mh: 0.050, ms: 0.040, g: G_LOCAL, sx: 0.0015, react: 0.05 },
    setting: { key: 'm', sym: 'm', label: 'Added mass $m$', unit: 'kg', min: 0, max: 0.35, step: 0.025, value: 0.15, series: [0.05, 0.10, 0.15, 0.20, 0.25, 0.30], explain: 'Slotted masses on the 0.050 kg hanger.' },
    nz: 1,
    read: (m, P, sys, z) => [((m + P.mh) * P.g) / P.k + P.sx * z[0]],
    series: [{ key: 'x', sym: 'x', label: 'extension', unit: 'm', res: 0.001, sigma: (m, P) => P.sx }],
    axes: {
      Fx: {
        label: 'F against x', slopeUnit: 'N/m', x: { sym: 'x', unit: 'm', of: (m, R) => R[0], sigma: (m, R, P) => P.sx },
        ys: [{ sym: 'F', unit: 'N', of: (m, R, P, sys) => (m + (sys === 'hanger' ? 0 : P.mh)) * P.g, sigma: () => 0 }],
        expect: (P) => ({ a: 0, b: P.k }),
        results: [{ sym: 'k', name: 'spring constant', unit: 'N/m', of: (f) => f.b, sigma: (f) => f.sb, accepted: (P) => P.k, acceptedLabel: 'true k' }],
        intercept: { sym: 'F₀', name: 'intercept', unit: 'N' },
      },
    },
    defaultAxes: 'Fx',
    systematics: { hanger: { label: 'The 0.050 kg hanger left out of the load', short: 'hanger forgotten', explain: 'Your table lists only the slotted masses; the hanger is pulling too.' } },
    defaultSys: 'hanger',
  },

  // … and its period against mass (dynamic)
  'spring-dynamic': {
    title: 'Timing a mass bouncing on a spring', method: 'Dynamic: period',
    apparatus: 'spring',
    note: 'Ten oscillations timed by hand to ±0.05 s. The spring’s own 0.040 kg moves too: about a third of it adds to the bouncing mass.',
    defaults: { k: 15.0, mh: 0.050, ms: 0.040, g: G_LOCAL, sx: 0.0015, react: 0.05 },
    setting: { key: 'm', sym: 'm', label: 'Added mass $m$', unit: 'kg', min: 0, max: 0.35, step: 0.025, value: 0.15, series: [0.05, 0.10, 0.15, 0.20, 0.25, 0.30], explain: 'Slotted masses on the 0.050 kg hanger.' },
    nz: 1,
    read: (m, P, sys, z) => [10 * TAU * Math.sqrt((m + P.mh + P.ms / 3) / P.k) + P.react * z[0]],
    series: [{ key: 't10', sym: 't₁₀', label: 'time for 10 oscillations', unit: 's', res: 0.01, sigma: (m, P) => P.react }],
    axes: {
      T2m: {
        label: 'T² against M', slopeUnit: 's²/kg', x: { sym: 'M', unit: 'kg', of: (m, R, P, sys) => m + (sys === 'hanger' ? 0 : P.mh) },
        ys: [{ sym: 'T²', unit: 's²', of: (m, R) => (R[0] / 10) ** 2, sigma: (m, R, P) => (2 * (R[0] / 10) * P.react) / 10 }],
        expect: (P) => ({ a: (4 * Math.PI ** 2 * P.ms) / (3 * P.k), b: (4 * Math.PI ** 2) / P.k }),
        results: [{ sym: 'k', name: 'spring constant', unit: 'N/m', of: (f) => (4 * Math.PI ** 2) / f.b, sigma: (f) => ((4 * Math.PI ** 2) / f.b ** 2) * f.sb, accepted: (P) => P.k, acceptedLabel: 'true k' }],
        intercept: { sym: 'T²₀', name: 'intercept', unit: 's²' },
      },
    },
    defaultAxes: 'T2m',
    systematics: { hanger: { label: 'The 0.050 kg hanger left out of the mass', short: 'hanger forgotten', explain: 'Your table lists only the slotted masses; the hanger is bouncing too.' } },
    defaultSys: 'hanger',
  },

  // L.12 — specific heat by electrical heating
  heater: {
    title: 'Heating an aluminium block electrically',
    apparatus: 'heater',
    note: 'Heat leaks to the room by Newton’s law of cooling — time constant about 8 hours with the lagging on, 40 minutes without. The heater’s and thermometer’s own heat capacities are ignored.',
    defaults: { m: 1.000, c: 897, V: 12.0, I: 4.20, sV: 0.1, sI: 0.02, sm: 0.001, T0: 20.0, tau: 30000, tauBare: 2500, sT: 0.05 },
    setting: { key: 't', sym: 't', label: 'Time since switch-on $t$', unit: 's', min: 0, max: 900, step: 30, value: 360, series: [0, 120, 240, 360, 480, 600], explain: 'Read the thermometer at this moment.' },
    nz: 1,
    read: (t, P, sys, z) => {
      const C = P.m * P.c, pw = P.V * P.I, tau = sys === 'leak' ? P.tauBare : P.tau;
      return [P.T0 + ((pw * tau) / C) * (1 - Math.exp(-t / tau)) + P.sT * z[0]];
    },
    series: [{ key: 'T', sym: 'T', label: 'temperature', unit: '°C', res: 0.1, sigma: (t, P) => Math.hypot(P.sT, resolutionU(0.1)) }],
    axes: {
      Tt: {
        label: 'T against t', slopeUnit: 'K/s', expectLabel: 'no heat leak', x: { sym: 't', unit: 's', of: (t) => t }, ys: [{ sym: 'T', unit: '°C', of: (t, R) => R[0], sigma: (t, R, P) => Math.hypot(P.sT, resolutionU(0.1)) }],
        expect: (P) => ({ a: P.T0, b: (P.V * P.I) / (P.m * P.c) }),
        results: [{
          sym: 'c', name: 'specific heat', unit: 'J/(kg·K)', of: (f, P) => (P.V * P.I) / (P.m * f.b), sigma: (f, P) => ((P.V * P.I) / (P.m * f.b)) * (f.sb / f.b), accepted: (P) => P.c, acceptedLabel: 'aluminium',
          typeB: (P) => [{ label: 'voltage', rel: P.sV / P.V }, { label: 'current', rel: P.sI / P.I }, { label: 'mass', rel: P.sm / P.m }],
        }],
        intercept: { sym: 'T₀', name: 'starting temperature', unit: '°C' },
      },
    },
    defaultAxes: 'Tt',
    systematics: { leak: { label: 'No lagging: the bare block leaks heat to the room', short: 'heat leak', explain: 'Without its insulating jacket the block loses heat about twelve times faster.' } },
    defaultSys: 'leak',
  },
};

export function inertiaRotary(P) {
  return 0.5 * P.M * P.R * P.R + (P.ring ? 0.5 * P.Mr * (P.R1 * P.R1 + P.R2 * P.R2) : 0);
}

/** The experiment and its parameters (defaults overridden by `params`). */
export function experiment(id, params = {}) {
  const E = EXPERIMENTS[id];
  if (!E) throw new Error(`unknown experiment “${id}”`);
  return { E, P: { ...E.defaults, ...params } };
}

/** The readings of one row, rounded to each instrument’s resolution. */
export function readRow(E, P, s, z, sys) {
  return E.read(s, P, sys || null, z).map((r, i) => roundTo(r, E.series[i].res));
}

/**
 * Seeded rows of data. `settings` lists the knob positions (one row each;
 * `repeats` rows per setting); a repeated-measurement experiment takes `n`
 * rows at its single setting (`at`).
 *   → { rows: [{ s, z, R }], P }
 */
export function makeData(id, { seed = 1, settings, repeats = 1, n, at = null, sys = null, params = {}, noiseless = false } = {}) {
  const { E, P } = experiment(id, params);
  const rng = makeRng(seed);
  const list = E.setting && at === null ? (settings || E.setting.series).flatMap((s) => Array(repeats).fill(s)) : Array(n ?? 10).fill(at);
  const rows = list.map((s) => {
    if (noiseless) { const z = Array(E.nz).fill(0); return { s, z, R: E.read(s, P, sys || null, z) }; }   // the truth: no scatter, no rounding
    const z = Array.from({ length: E.nz }, () => gaussian(rng));
    return { s, z, R: readRow(E, P, s, z, sys) };
  });
  return { rows, P };
}

/** Recompute the readings of stored rows for another systematic state (same scatter). */
export function rereadRows(id, rows, { sys = null, params = {} } = {}) {
  const { E, P } = experiment(id, params);
  return rows.map((r) => ({ ...r, R: r.z ? readRow(E, P, r.s, r.z, sys) : r.R }));
}

/**
 * Linearize and fit: the plotted points of every y series, a straight-line
 * fit of each (or a fit through the origin with `origin`), and the results
 * the slopes stand for, with Type B terms folded in.
 */
export function analyse(id, rows, { axes, sys = null, params = {}, origin = false, inflate = 1 } = {}) {
  const { E, P } = experiment(id, params);
  const A = E.axes?.[axes || E.defaultAxes];
  if (!A) return null;
  const S = (r) => E.series.map((q) => q.sigma(r.s, P));
  const series = A.ys.map((Y, k) => {
    const pts = rows.map((r) => {
      const R = r.R;
      return {
        x: A.x.of(r.s, R, P, sys), y: Y.of(r.s, R, P, sys),
        sx: A.x.sigma ? inflate * A.x.sigma(r.s, R, P, S(r)) : 0, sy: inflate * Y.sigma(r.s, R, P, S(r)),
        s: r.s,
      };
    }).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const sy = pts.map((p) => p.sy), sx = A.x.sigma ? pts.map((p) => p.sx) : null;
    const fit = pts.length >= (origin ? 1 : 2) && new Set(xs).size >= (origin ? 1 : 2) ? (origin ? fitOrigin(xs, ys, sy, sx) : fitLine(xs, ys, sy, sx)) : null;
    return { Y, pts, fit, k };
  });
  const results = (A.results || []).map((res) => {
    const sr = series[res.series ?? 0];
    const f = sr?.fit;
    if (!f || A.curved) return { res, value: NaN, sigma: NaN };
    const value = res.of(f, P), sFit = res.sigma(f, P);
    const terms = [{ label: 'fit (slope)', rel: Math.abs(sFit / value) }, ...(res.typeB ? res.typeB(P) : [])];
    const sigma = Math.abs(value) * Math.sqrt(terms.reduce((s, q) => s + q.rel ** 2, 0));
    const acc = res.accepted ? res.accepted(P) : NaN;
    return { res, value, sigma, sFit, terms, accepted: acc, z: Number.isFinite(acc) ? Math.abs(value - acc) / sigma : NaN };
  });
  return { A, P, series, results };
}

/** Statistics of a repeated-measurement series (the per-reading quantity of `E.repeat`). */
export function repeatStats(id, rows, { params = {} } = {}) {
  const { E, P } = experiment(id, params);
  const vals = rows.map((r) => E.repeat.of(r.s, r.R, P));
  const st = stats(vals);
  const acc = E.repeat.accepted(P, rows[0]?.s);
  return { ...st, vals, accepted: acc, z: Number.isFinite(acc) && st.sem > 0 ? Math.abs(st.mean - acc) / st.sem : NaN, P };
}
