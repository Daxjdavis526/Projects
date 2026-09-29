// Numbers the film draws from something real. Pure data; the tests check it.

// Estes C6 thrust curve, seconds and newtons — the certification data sheet
// published for the motor (NAR / thrustcurve.org). The backyard test stand
// scene plots this live as the motor burns.
export const C6 = [
  [0, 0], [0.031, 0.946], [0.092, 4.826], [0.139, 9.936], [0.192, 14.09], [0.209, 11.446],
  [0.231, 7.381], [0.248, 6.151], [0.292, 5.489], [0.37, 4.921], [0.475, 4.448], [0.671, 4.258],
  [0.702, 4.542], [0.723, 4.164], [0.85, 4.448], [1.063, 4.353], [1.211, 4.353], [1.242, 4.069],
  [1.303, 4.258], [1.468, 4.353], [1.656, 4.448], [1.821, 4.448], [1.834, 2.933], [1.847, 1.325],
  [1.86, 0],
];
export const C6_BURN = 1.86;

export function thrustC6(t) {
  if (t <= 0 || t >= C6_BURN) return 0;
  for (let i = 1; i < C6.length; i++) {
    if (t <= C6[i][0]) {
      const [t0, f0] = C6[i - 1], [t1, f1] = C6[i];
      return f0 + ((f1 - f0) * (t - t0)) / (t1 - t0);
    }
  }
  return 0;
}

// Trapezoidal total impulse, N·s.
export function impulse(curve = C6) {
  let I = 0;
  for (let i = 1; i < curve.length; i++) I += (curve[i][0] - curve[i - 1][0]) * (curve[i][1] + curve[i - 1][1]) / 2;
  return I;
}

// The small engine on his screen, and on the stand after the credits. These
// are illustrative round numbers for a pressure-fed methalox engine of about
// a thousand pounds of thrust — plausible, not a design.
export const ENGINE = {
  propellants: 'LOX / methane',
  pc_bar: 20,           // chamber pressure
  of: 3.0,              // oxidiser-to-fuel mass ratio
  eps: 4.0,             // nozzle area ratio Ae/At
  isp_sl: 262,          // specific impulse at sea level, s
  thrust_kN: 4.4,       // ≈ 1000 lbf
};
export const G0 = 9.80665;

// Mass flow needed for the thrust and Isp above, kg/s: F = mdot · Isp · g0.
export function massFlow(e = ENGINE) {
  return (e.thrust_kN * 1000) / (e.isp_sl * G0);
}

// The post-credits hot fire: predicted chamber pressure trace (bar) and the
// "measured" trace the film invents to sit within a couple of percent of it.
export function pcPredicted(t) {
  if (t < 0) return 0;
  const rise = 1 - Math.exp(-t / 0.18);
  const tail = t > 6 ? Math.exp(-(t - 6) / 0.12) : 1;
  return ENGINE.pc_bar * rise * tail;
}
export function pcMeasured(t) {
  const p = pcPredicted(t - 0.04);
  const ripple = p > 1 ? 0.25 * Math.sin(t * 37) + 0.18 * Math.sin(t * 91 + 1) : 0;
  return p * 0.985 + ripple;
}
