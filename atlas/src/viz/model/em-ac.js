// The circuit physics behind the em-ac simulation (DOM-free; tested headlessly
// in test/em-ac.test.mjs): the emf an inductor induces when its current
// changes, RL transients, free LC and damped RLC oscillation, and series AC
// circuits in the sinusoidal steady state — reactance, impedance, phasors,
// resonance and average power. Lumped, ideal elements throughout.
//
// Sign conventions, the textbook's (OpenStax University Physics Vol. 2):
//   · the inductor's self-induced emf is ε_L = −L dI/dt; the potential DROP
//     across it, measured along the current, is v_L = +L dI/dt;
//   · in an LC or RLC loop, q is the charge on the plate the current i flows
//     onto, so i = dq/dt and L di/dt + R i + q/C = 0;
//   · an AC source drives v(t) = V₀ sin ωt; the current is i(t) = I₀ sin(ωt − φ),
//     so φ > 0 means the voltage LEADS the current (inductive), φ < 0 that it
//     lags (capacitive). A phasor at angle θ(t) from the +x axis, rotating
//     counter-clockwise at ω, has the instantaneous value as its y-projection.

export const MU0 = 1.25663706127e-6;    // T·m/A (CODATA 2022; 4π×10⁻⁷ to nine figures)
export const TWO_PI = 2 * Math.PI;

/** Inductance of a long, tightly wound solenoid: L = μ₀N²A/ℓ (henry). */
export const solenoidL = (N, A, len, mu0 = MU0) => (mu0 * N * N * A) / len;

/** The field inside a long solenoid, B = μ₀NI/ℓ (tesla). */
export const solenoidB = (N, I, len, mu0 = MU0) => (mu0 * N * I) / len;

/**
 * A current driven through an inductor, and the emf the coil induces in itself.
 *   kind 'trapezoid': rise from 0 to Imax over tr, hold for th, fall back over
 *        tr, rest at 0 for th (period 2tr + 2th);
 *   kind 'sine': I = Imax sin(2πt/T) with the same period T.
 * Returns { T, I(t), dIdt(t), emf(t) = −L dI/dt, vL(t) = +L dI/dt }.
 */
export function rampWave({ kind = 'trapezoid', L, Imax, tr, th }) {
  const T = 2 * tr + 2 * th;
  const wrap = (t) => ((t % T) + T) % T;
  let I, dIdt;
  if (kind === 'sine') {
    const w = TWO_PI / T;
    I = (t) => Imax * Math.sin(w * t);
    dIdt = (t) => Imax * w * Math.cos(w * t);
  } else {
    I = (t) => {
      const s = wrap(t);
      if (s < tr) return (Imax * s) / tr;
      if (s < tr + th) return Imax;
      if (s < 2 * tr + th) return Imax * (1 - (s - tr - th) / tr);
      return 0;
    };
    dIdt = (t) => {
      const s = wrap(t);
      if (s < tr) return Imax / tr;
      if (s < tr + th) return 0;
      if (s < 2 * tr + th) return -Imax / tr;
      return 0;
    };
  }
  return { T, I, dIdt, emf: (t) => -L * dIdt(t), vL: (t) => L * dIdt(t) };
}

/**
 * An RL series loop after a switch moves at t = 0. With `on`, the battery ℰ
 * drives it (the current climbs toward ℰ/R); without, the battery is shorted
 * out of the loop and the current decays. i0 is the current at t = 0.
 * Returns the current, its slope, the drops across R and L, and the energy
 * bookkeeping since t = 0: battery work, heat in R, and the energy stored in L.
 */
export function rl({ E, R, L, i0 = 0, on = true }) {
  const tau = L / R, Es = on ? E : 0, iInf = Es / R, a = i0 - iInf;
  const ex = (t) => Math.exp(-t / tau);
  const i = (t) => iInf + a * ex(t);
  const didt = (t) => (-a / tau) * ex(t);
  return {
    tau, iInf,
    i, didt,
    vR: (t) => i(t) * R,
    vL: (t) => L * didt(t),                        // = Es − iR: the drop across the coil, along i
    work: (t) => Es * (iInf * t + a * tau * (1 - ex(t))),
    heat: (t) => R * (iInf * iInf * t + 2 * iInf * a * tau * (1 - ex(t)) + ((a * a * tau) / 2) * (1 - Math.exp((-2 * t) / tau))),
    stored: (t) => 0.5 * L * i(t) ** 2,
    /** the time to cover a fraction f of the way from i0 to the final current */
    tFor: (f) => -tau * Math.log(1 - f),
  };
}

/**
 * Free oscillation of a series LC loop with an optional resistance R, from a
 * charge q0 and current i0 at t = 0 (i = dq/dt). Handles the underdamped,
 * critically damped and overdamped cases exactly.
 */
export function rlc({ L, C, R = 0, q0, i0 = 0 }) {
  const w0 = 1 / Math.sqrt(L * C), a = R / (2 * L);
  let q, i, regime, wd = 0;
  if (a < w0 * (1 - 1e-9)) {
    regime = a === 0 ? 'undamped' : 'underdamped';
    wd = Math.sqrt(w0 * w0 - a * a);
    const A = q0, B = (i0 + a * q0) / wd;
    q = (t) => Math.exp(-a * t) * (A * Math.cos(wd * t) + B * Math.sin(wd * t));
    i = (t) => Math.exp(-a * t) * ((-a * A + B * wd) * Math.cos(wd * t) + (-a * B - A * wd) * Math.sin(wd * t));
  } else if (a <= w0 * (1 + 1e-9)) {
    regime = 'critical';
    const B = i0 + a * q0;
    q = (t) => Math.exp(-a * t) * (q0 + B * t);
    i = (t) => Math.exp(-a * t) * (i0 - a * B * t);
  } else {
    regime = 'overdamped';
    const b = Math.sqrt(a * a - w0 * w0), s1 = -a + b, s2 = -a - b;
    const c1 = (i0 - s2 * q0) / (s1 - s2), c2 = q0 - c1;
    q = (t) => c1 * Math.exp(s1 * t) + c2 * Math.exp(s2 * t);
    i = (t) => c1 * s1 * Math.exp(s1 * t) + c2 * s2 * Math.exp(s2 * t);
  }
  const U0 = (q0 * q0) / (2 * C) + 0.5 * L * i0 * i0;
  const UE = (t) => q(t) ** 2 / (2 * C), UB = (t) => 0.5 * L * i(t) ** 2;
  return {
    w0, f0: w0 / TWO_PI, T0: TWO_PI / w0, alpha: a, wd, regime, U0,
    q, i, UE, UB,
    vC: (t) => q(t) / C,
    heat: (t) => U0 - UE(t) - UB(t),
  };
}

/**
 * A series AC circuit in the sinusoidal steady state, driven by
 * v(t) = V₀ sin ωt. Any of R, L, C may be absent: R = 0 and L = 0 drop
 * those elements; C = null (or 0, or Infinity) means no capacitor in the loop.
 */
export function series({ V0, f, R = 0, L = 0, C = null }) {
  const w = TWO_PI * f;
  const hasC = Number.isFinite(C) && C > 0;
  const XL = w * L, XC = hasC ? 1 / (w * C) : 0, X = XL - XC;
  const Z = Math.hypot(R, X);
  const phi = Math.atan2(X, R);                    // voltage leads current by φ
  const I0 = V0 / Z;
  const th = (t) => w * t - phi;                   // the current's phase angle
  return {
    w, XL, XC, X, Z, phi, I0,
    VR: I0 * R, VL: I0 * XL, VC: I0 * XC,          // amplitudes across each element
    v: (t) => V0 * Math.sin(w * t),
    i: (t) => I0 * Math.sin(th(t)),
    vR: (t) => I0 * R * Math.sin(th(t)),
    vL: (t) => I0 * XL * Math.cos(th(t)),          // leads i by 90°
    vC: (t) => -I0 * XC * Math.cos(th(t)),         // lags i by 90°
    /** phasor angles (radians, counter-clockwise from +x) at time t */
    angle: (t) => ({ v: w * t, i: th(t), R: th(t), L: th(t) + Math.PI / 2, C: th(t) - Math.PI / 2 }),
    Pavg: 0.5 * V0 * I0 * Math.cos(phi),           // = ½I₀²R = I_rms²R
    pf: Math.cos(phi),
  };
}

/** Resonance of a series RLC: ω₀, f₀, Q, the bandwidth between the half-power points, and those points. */
export function resonance({ R, L, C }) {
  const w0 = 1 / Math.sqrt(L * C), g = R / (2 * L), root = Math.sqrt(g * g + w0 * w0);
  const w1 = root - g, w2 = root + g;
  return {
    w0, f0: w0 / TWO_PI, Q: (w0 * L) / R, dw: R / L, df: R / (TWO_PI * L),
    w1, w2, f1: w1 / TWO_PI, f2: w2 / TWO_PI,
  };
}

/** Average power delivered to a series RLC by a source of amplitude V0 at frequency f: ½V₀²R/Z². */
export function powerAt({ V0, f, R, L, C }) {
  const s = series({ V0, f, R, L, C });
  return s.Pavg;
}
