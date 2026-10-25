// The evidence. Gravitational lensing by a point mass — the source's outline
// mapped through the lens equation, so the arcs and the Einstein ring are
// where the equation puts them — then the record of tests.

import { TAU, ramp, win, clamp, lerp } from '../kit.js';
import { background, text, note, path, circle, glow, seg, panel, COL } from '../paint.js';

// Image of a source point at angular position (bx, by), in Einstein radii,
// for one of the two images (sign ±1). Lens equation β = θ − 1/θ.
function image(bx, by, sign) {
  const b = Math.hypot(bx, by);
  if (b < 1e-9) return null;
  const th = (b + sign * Math.sqrt(b * b + 4)) / 2;
  return [(bx / b) * th, (by / b) * th];
}

function lensing(g, t, a) {
  const cx = 960, cy = 450, E = 190;                        // Einstein radius, px
  circle(g, cx, cy, E, { stroke: COL.dim, width: 1, alpha: a * 0.35, dash: [4, 8] });
  // the source drifts behind the lens and out again
  const sx = lerp(-1.3, 1.3, ramp(t, 1, 11, (u) => u)), sy = 0.06;
  const R = 0.22;
  // where it really is (faint)
  circle(g, cx + sx * E, cy - sy * E, R * E, { stroke: COL.blue, width: 1.5, alpha: a * 0.5, dash: [4, 5] });
  for (const sign of [1, -1]) {
    // map the source disc through the lens: fill the image region by sampling
    for (let rr = 0; rr <= 1; rr += 0.12) {
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const p = (i / 120) * TAU;
        const q = image(sx + R * rr * Math.cos(p), sy + R * rr * Math.sin(p), sign);
        if (q) pts.push([cx + q[0] * E, cy - q[1] * E]);
      }
      path(g, pts, { color: '#9fc4ff', width: 3, alpha: a * (0.35 + 0.65 * (1 - rr)), close: false });
    }
  }
  glow(g, cx, cy, 70, '#ffd56e', a * 0.9);
  circle(g, cx, cy, 16, { fill: '#ffe2a0', alpha: a });
  text(g, 'lensing mass', cx, cy + 46, { size: 22, color: COL.dim, alpha: a });
  text(g, 'dashed: where the background galaxy really is', 960, 120, { size: 24, color: COL.blue, alpha: a });
  note(g, 'computed from the point-mass lens equation; when aligned, the image is an Einstein ring', 960, 820, a);
}

const TESTS = [
  ['Mercury’s orbit', '+42.98″ per century, as observed', 1],
  ['Starlight bent by the Sun', '1.75″ at its edge (radio: to ~0.02%)', 1],
  ['Radio echoes delayed by the Sun', 'Cassini 2003: γ − 1 = (2.1 ± 2.3) × 10⁻⁵', 1],
  ['Clocks in towers, aircraft, satellites', 'Pound–Rebka 1960 · Hafele–Keating 1971 · optical clocks', 2],
  ['Gyroscopes twisted by Earth’s spin', 'Gravity Probe B 2011', 2],
  ['Binary pulsar losing energy', 'orbit shrinks at 0.9983 ± 0.0016 of GR’s rate', 2],
  ['Gravitational waves', 'GW150914 onward; speed = c to ~10⁻¹⁵', 3],
  ['Black-hole shadows', 'Event Horizon Telescope 2019, 2022', 3],
];

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 90, seed: 121 });
  const ln = win(t, 0.2, A[1], 0.9, 0.8);
  if (ln > 0) lensing(g, t, ln);
  const tb = win(t, A[1] - 0.2, A[4], 0.8, 0.8);
  if (tb > 0) {
    panel(g, 260, 140, 1400, 700, { alpha: tb * 0.9 });
    TESTS.forEach(([what, how, cue], i) => {
      const k = ramp(t, A[cue] + 0.3 + (i % 3) * 1.4, A[cue] + 1 + (i % 3) * 1.4) * tb;
      const y = 210 + i * 82;
      text(g, '✓', 320, y, { size: 36, color: COL.green, alpha: k });
      text(g, what, 370, y, { size: 30, color: COL.ink, alpha: k, align: 'left' });
      text(g, how, 1620, y, { size: 26, color: COL.dim, alpha: k, align: 'right' });
    });
  }
  const sm = ramp(t, A[4] - 0.2, A[4] + 1);
  if (sm > 0) {
    text(g, 'weak gravity', 640, 380, { size: 30, color: COL.dim, alpha: sm });
    text(g, 'confirmed to 1 part in 100,000', 640, 440, { size: 40, color: COL.green, alpha: sm });
    text(g, 'or better', 640, 490, { size: 30, color: COL.green, alpha: sm });
    text(g, 'strong gravity', 1280, 380, { size: 30, color: COL.dim, alpha: sm });
    text(g, 'no confirmed deviation', 1280, 440, { size: 40, color: COL.gold, alpha: sm });
    text(g, 'so far', 1280, 490, { size: 30, color: COL.gold, alpha: sm });
  }
}
