// Your path: a worldline through the coursework, from Calculus II to
// research, and the questions to bring a professor.

import { ramp, win, clamp } from '../kit.js';
import { background, text, path, circle, glow, panel, COL } from '../paint.js';

const STEPS = [
  ['now', 'Calculus II', 'enough to follow the ideas'],
  ['next', 'multivariable calculus · linear algebra · differential equations', 'to compute'],
  ['then', 'Lagrangian mechanics · electromagnetism · quantum mechanics', ''],
  ['junior / senior year', 'undergraduate GR (often Hartle’s “Gravity”)', ''],
  ['graduate school', 'graduate GR · differential geometry · PDEs', 'to do research'],
  ['PhD', 'research', ''],
];

export default function draw(g, t, s) {
  const A = s.at;
  background(g, t, { stars: 120, seed: 141 });
  const rd = win(t, 0.2, A[3], 0.9, 0.8);
  if (rd > 0) {
    // a worldline climbing through the steps
    const pts = [];
    for (let i = 0; i <= 100; i++) { const u = i / 100; pts.push([360 + 90 * Math.sin(u * 5.5), 860 - u * 720]); }
    const show = ramp(t, 0.5, A[2] + 4, (u) => u);
    path(g, pts.slice(0, Math.max(2, Math.floor(101 * show))), { color: COL.gold, width: 4, alpha: rd });
    STEPS.forEach(([when, what, why], i) => {
      const cue = i < 2 ? (i === 0 ? A[0] : A[1]) : i < 5 ? (i === 2 ? A[1] + 3 : A[2]) : A[2] + 3;
      const k = ramp(t, cue, cue + 1) * rd;
      const u = (i + 0.5) / STEPS.length;
      const [x, y] = pts[Math.round(u * 100)];
      glow(g, x, y, 24, COL.gold, k);
      circle(g, x, y, 8, { fill: COL.gold, alpha: k });
      text(g, when.toUpperCase(), x + 60, y - 10, { size: 20, spacing: 4, color: COL.dim, alpha: k, align: 'left' });
      text(g, what, x + 60, y + 24, { size: 30, color: COL.ink, alpha: k, align: 'left' });
      if (why) text(g, why, 1820, y + 24, { size: 24, color: COL.gold, alpha: k, align: 'right' });
    });
  }
  const qs = ramp(t, A[3] - 0.2, A[3] + 1);
  if (qs > 0) {
    const cards = [
      [A[3], 'What open question is your group working on?'],
      [A[3] + 2, 'What does a typical week look like for your graduate students?'],
      [A[4], 'What could an undergraduate realistically contribute?'],
    ];
    text(g, 'QUESTIONS TO BRING A GR PROFESSOR', 960, 200, { size: 24, spacing: 6, color: COL.gold, alpha: qs });
    cards.forEach(([at, q], i) => {
      const k = ramp(t, at, at + 1) * qs;
      panel(g, 360, 270 + i * 170, 1200, 130, { alpha: k, r: 18 });
      text(g, q, 960, 270 + i * 170 + 78, { size: 34, color: COL.ink, alpha: k });
    });
  }
}
