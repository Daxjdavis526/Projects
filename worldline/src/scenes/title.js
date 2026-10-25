// The title: a light cone in a field of stars, and one worldline rising
// through its apex.

import { TAU, ramp } from '../kit.js';
import { background, path, circle, glow, COL } from '../paint.js';

export function lightConeGlyph(g, cx, cy, R, a, draw = 1) {
  // two cones: the rims drawn as ellipses, the sides as lines through the apex
  const h = R * 0.95, rx = R, ry = R * 0.2;
  const rim = (y, dash) => {
    const pts = [];
    for (let i = 0; i <= 96; i++) { const p = (i / 96) * TAU; pts.push([cx + rx * Math.cos(p), y + ry * Math.sin(p)]); }
    path(g, pts, { color: COL.light, width: 2, alpha: a * 0.7, dash });
  };
  rim(cy - h, null);
  rim(cy + h, [6, 8]);
  path(g, [[cx - rx, cy - h], [cx + rx, cy + h]], { color: COL.light, width: 2, alpha: a * 0.6 });
  path(g, [[cx + rx, cy - h], [cx - rx, cy + h]], { color: COL.light, width: 2, alpha: a * 0.6 });
  // a worldline: a timelike curve, never steeper than the cone
  const pts = [];
  const n = Math.max(2, Math.floor(80 * draw));
  for (let i = 0; i <= n; i++) {
    const k = i / 80;
    const y = cy + h * 1.1 - k * h * 2.2;
    const x = cx + Math.sin((k - 0.5) * 5.2) * R * 0.12;   // through the apex at k = 0.5
    pts.push([x, y]);
  }
  path(g, pts, { color: COL.gold, width: 3.5, alpha: a });
  glow(g, cx, cy, R * 0.25, COL.gold, a * 0.35);
  circle(g, cx, cy, 5, { fill: COL.gold, alpha: a });
}

export default function draw(g, t) {
  background(g, t, { stars: 260, seed: 7 });
  lightConeGlyph(g, 960, 840, 150, 0.55 * ramp(t, 0.5, 4), ramp(t, 0.5, 9));
}
