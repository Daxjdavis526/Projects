// Moments the pictures and the sound must share: when the light clocks tick,
// when the hovering clocks near the black hole tick, when the chirp plays.
// Pure — the scenes draw against these and the score plays against them.

import { gamma, hoverRate } from './physics.js';

// The light-clock scene: the rest clock starts with caption 2; the moving
// clock sets off on the first rest tick after caption 3, so the two start in
// step; the moving lane is on screen until caption 5, the rest clock until 7.
export function clockTimes(s) {
  const { P } = s.params;
  const rest0 = s.at[2];
  const move0 = rest0 + Math.ceil((s.at[3] - rest0) / P) * P;
  return { rest0, move0, restUntil: s.at[7], moveUntil: s.at[5] };
}

export function lightClockTicks(s) {
  const { P, beta } = s.params;
  const { rest0, move0, restUntil, moveUntil } = clockTimes(s);
  const rest = [], moving = [];
  for (let t = rest0 + P; t < restUntil; t += P) rest.push(t);
  const Pm = P * gamma(beta);
  for (let t = move0 + Pm; t < moveUntil; t += Pm) moving.push(t);
  return { rest, moving };
}

// The black-hole scene: three clocks — far away, at 3 r_s, at 1.1 r_s — whose
// hands turn a quarter turn per second times their rate; each quarter turn
// ticks. Shown from caption 3 to caption 4.
export const HOVER = [[Infinity, 1], [3, hoverRate(3)], [1.1, hoverRate(1.1)]];
export function hoverTicks(s) {
  const t0 = s.at[3], t1 = s.at[4];
  return HOVER.map(([, rate]) => {
    const out = [];
    for (let k = 1; t0 + k / rate < t1 - 0.3; k++) out.push(t0 + k / rate);
    return out;
  });
}

// The gravitational-wave scene: the chirp plays three times after caption 5.
export function chirpPlays(s) { const a = s.at[5] + 3; return [a, a + 1.6, a + 3.2]; }
