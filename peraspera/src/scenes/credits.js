// Credits over the stars, and the card before the post-credits scene.

import { W, H, clamp, lerp, smooth, ramp, win } from '../kit.js';
import { vgrad, glow, text, SANS, SERIF, milkyWay, vignette } from '../paint.js';
import { STARS } from './kid.js';
import { CREDITS } from '../script.js';

const HEIGHTS = { big: 170, sub: 90, gap: 90, role: 120, line: 56 };

export function credits(ctx, t) {
  vgrad(ctx, [[0, '#010207'], [1, '#070a1c']], 0, H);
  milkyWay(ctx, { x: 960, y: 560 - t * 3, angle: -0.35, alpha: 0.5 });
  STARS.draw(ctx, t, { dy: -900 - t * 6, alpha: 0.9 });
  const total = CREDITS.reduce((s, c) => s + HEIGHTS[c[0]], 0);
  // scroll so the last line comes to rest in the middle of the frame
  const y0 = lerp(H + 80, H / 2 + 20 - total + HEIGHTS.sub, ramp(t, 2, 50, (k) => k));
  let y = y0;
  for (const [kind, a, b] of CREDITS) {
    const h = HEIGHTS[kind];
    const cy = y + h / 2;
    // fade at the top and bottom edges
    const edge = Math.min(smooth((cy - 60) / 160), smooth((H - 40 - cy) / 160));
    if (edge > 0.002) {
      if (kind === 'big') text(ctx, a, W / 2, cy + 40, { size: 104, spacing: 26, color: '#f4ecdc', alpha: edge });
      else if (kind === 'sub') text(ctx, a, W / 2, cy + 12, { size: 38, italic: true, color: '#cdbfa6', alpha: edge });
      else if (kind === 'role') {
        text(ctx, a.toUpperCase(), W / 2, cy - 12, { face: SANS, size: 18, spacing: 5, color: '#a8987a', alpha: edge });
        text(ctx, b, W / 2, cy + 36, { size: 44, italic: true, weight: 500, color: '#f2eadb', alpha: edge });
      } else if (kind === 'line') text(ctx, a, W / 2, cy + 12, { size: 34, italic: true, color: '#d8ccb8', alpha: edge });
    }
    y += h;
  }
  vignette(ctx, 0.5);
}

export function guess(ctx, t) {
  vgrad(ctx, [[0, '#000000'], [1, '#04060e']], 0, H);
  STARS.draw(ctx, t, { dy: -1400, alpha: 0.35 * ramp(t, 0, 4), big: 0.3 });
}
