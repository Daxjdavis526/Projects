// The damped, driven linear oscillator in its standard form
//
//     x″ + 2ζω₀ x′ + ω₀² x = ω₀² X cos(ωt)
//
// (X is the static deflection F₀/k), DOM-free: the roots of the
// characteristic equation r² + 2ζω₀ r + ω₀² = 0, the free motion from any
// initial conditions in every regime — negative damping included — and the
// steady-state gain and phase lag, and the full forced motion from rest
// (transient plus steady state). Used by sims/c3-roots.js; tested in
// test/c3-roots.test.mjs against direct numerical integration.

/** |ζ| − 1 smaller than this counts as critical damping (a repeated root). */
export const EPS = 1e-6;

/** Roots of r² + 2ζω₀r + ω₀² = 0, as [{ re, im }, { re, im }]; a complex pair has im > 0 first. */
export function roots(zeta, w0) {
  const a = -zeta * w0, d = zeta * zeta - 1;
  if (Math.abs(d) < EPS) return [{ re: a, im: 0 }, { re: a, im: 0 }];
  if (d > 0) { const s = w0 * Math.sqrt(d); return [{ re: a + s, im: 0 }, { re: a - s, im: 0 }]; }
  const wd = w0 * Math.sqrt(-d);
  return [{ re: a, im: wd }, { re: a, im: -wd }];
}

/** The kind of free motion for damping ratio ζ. */
export function regime(zeta) {
  if (zeta < -EPS) return 'growing';
  if (Math.abs(zeta) <= EPS) return 'undamped';
  if (zeta < 1 - EPS) return 'underdamped';
  if (zeta <= 1 + EPS) return 'critically damped';
  return 'overdamped';
}

/**
 * The free motion x(t) with x(0) = x0, x′(0) = v0, as a function of t; for
 * oscillating motion also its envelope amplitude R, so that |x| ≤ R e^{−ζω₀t}.
 */
export function free(zeta, w0, x0 = 1, v0 = 0) {
  const a = -zeta * w0, d = zeta * zeta - 1;
  if (Math.abs(d) < EPS) {
    // repeated root a: x = (x0 + (v0 − a x0) t) e^{at}
    const c = v0 - a * x0;
    return { x: (t) => (x0 + c * t) * Math.exp(a * t), R: null };
  }
  if (d > 0) {
    // two real roots: x = c1 e^{r1 t} + c2 e^{r2 t}
    const s = w0 * Math.sqrt(d), r1 = a + s, r2 = a - s;
    const c1 = (v0 - r2 * x0) / (r1 - r2), c2 = x0 - c1;
    return { x: (t) => c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t), R: null };
  }
  // complex pair a ± i ω_d: x = e^{at}(x0 cos ω_d t + B sin ω_d t)
  const wd = w0 * Math.sqrt(-d), B = (v0 - a * x0) / wd;
  return { x: (t) => Math.exp(a * t) * (x0 * Math.cos(wd * t) + B * Math.sin(wd * t)), R: Math.hypot(x0, B), wd };
}

/** Steady-state amplitude over the static deflection, at frequency ratio W = ω/ω₀. */
export const gain = (W, zeta) => 1 / Math.sqrt((1 - W * W) ** 2 + (2 * zeta * W) ** 2);

/** How far the steady motion lags the drive, in radians: 0 well below resonance, π/2 at it, → π above. */
export const lag = (W, zeta) => Math.atan2(2 * zeta * W, 1 - W * W);

/** The resonance peak: frequency ratio and gain. Below ζ = 1/√2 it sits at W = √(1 − 2ζ²); above, the gain only falls. */
export function peak(zeta) {
  if (zeta <= 0) return { W: 1, M: Infinity };
  if (zeta < Math.SQRT1_2) return { W: Math.sqrt(1 - 2 * zeta * zeta), M: 1 / (2 * zeta * Math.sqrt(1 - zeta * zeta)) };
  return { W: 0, M: 1 };
}

/**
 * Motion from rest under the drive X cos(ωt), ω = W ω₀: the steady part
 * (a function of t), the whole motion, and the steady amplitude. Undamped and
 * exactly at resonance the steady part does not exist; the motion is then the
 * growing X (ω₀t/2) sin(ω₀t).
 */
export function forced(zeta, w0, W, X = 1) {
  const w = W * w0;
  if (Math.abs(zeta) <= EPS && Math.abs(W - 1) < 1e-9) {
    return { steady: null, x: (t) => X * (w0 * t / 2) * Math.sin(w0 * t), A: Infinity };
  }
  const A = X * gain(W, zeta), ph = lag(W, zeta);
  const steady = (t) => A * Math.cos(w * t - ph);
  // the transient cancels the steady motion's starting position and velocity
  const h = free(zeta, w0, -A * Math.cos(ph), -A * w * Math.sin(ph)).x;
  return { steady, x: (t) => steady(t) + h(t), A };
}

/** The same equation as a first-order system, for checks: y = [x, x′]. */
export const rhs = (zeta, w0, W = 0, X = 0) => (t, y) => [y[1], -2 * zeta * w0 * y[1] - w0 * w0 * y[0] + w0 * w0 * X * Math.cos(W * w0 * t)];
