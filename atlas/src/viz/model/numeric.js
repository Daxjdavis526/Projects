// Small numerical routines shared by simulations (DOM-free, tested in Node).

/** Composite Simpson's rule with n (even) intervals. */
export function simpson(f, a, b, n = 200) {
  if (n % 2) n++;
  const hh = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * hh) * (i % 2 ? 4 : 2);
  return (s * hh) / 3;
}

/** One classical RK4 step for y' = f(t, y), y an array. */
export function rk4(f, t, y, h) {
  const k1 = f(t, y);
  const k2 = f(t + h / 2, y.map((v, i) => v + (h / 2) * k1[i]));
  const k3 = f(t + h / 2, y.map((v, i) => v + (h / 2) * k2[i]));
  const k4 = f(t + h, y.map((v, i) => v + h * k3[i]));
  return y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

/** Integrate y' = f(t, y) from t0 to t1 with fixed RK4 steps; returns [[t, ...y], ...]. */
export function integrate(f, y0, t0, t1, steps = 1000) {
  const h = (t1 - t0) / steps;
  const out = [[t0, ...y0]];
  let y = y0.slice(), t = t0;
  for (let i = 0; i < steps; i++) { y = rk4(f, t, y, h); t += h; out.push([t, ...y]); }
  return out;
}

/** Bisection root of f on [a, b] (f(a), f(b) of opposite sign). */
export function bisect(f, a, b, tol = 1e-12, maxIter = 200) {
  let fa = f(a);
  for (let i = 0; i < maxIter; i++) {
    const m = (a + b) / 2, fm = f(m);
    if (Math.abs(b - a) < tol || fm === 0) return m;
    if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else b = m;
  }
  return (a + b) / 2;
}

/** Complete elliptic integral of the first kind K(m), m = k² (AGM). */
export function ellipK(m) {
  let a = 1, b = Math.sqrt(1 - m);
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-15; i++) { const an = (a + b) / 2; b = Math.sqrt(a * b); a = an; }
  return Math.PI / (2 * a);
}

/** Numerical derivative (central difference). */
export const deriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
