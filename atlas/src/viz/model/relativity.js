// Special relativity in units with c = 1. DOM-free.

export const gamma = (beta) => 1 / Math.sqrt(1 - beta * beta);

/** Boost an event (t, x) into a frame moving at +β. */
export function boost(t, x, beta) {
  const g = gamma(beta);
  return [g * (t - beta * x), g * (x - beta * t)];
}

/** The invariant interval s² = −t² + x² (signature −,+). */
export const interval = (t, x) => -t * t + x * x;

/** Relativistic velocity addition. */
export const addVelocities = (u, v) => (u + v) / (1 + u * v);

/** Rapidity φ with β = tanh φ. */
export const rapidity = (beta) => Math.atanh(beta);

/** Relativistic Doppler factor for a receding source: f_obs/f_src = √((1 − β)/(1 + β)). */
export const doppler = (beta) => Math.sqrt((1 - beta) / (1 + beta));
