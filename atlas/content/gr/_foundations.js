// Shared helpers for the foundation lessons of the Road to Einstein
// (Intuition Mode, steps 1–13). Not a lesson: files starting with "_" are
// skipped by tools/register.mjs.

const t = String.raw;

/**
 * A static spacetime diagram drawn with the `graph` simulation: years up the
 * page, light-years across (c = 1), the light cone of the origin dashed.
 * Unlike the interactive `spacetime` sim it has no readout, so it can sit
 * above a question without printing the question’s answer.
 *
 *   events:    [[t, x, label, color?], …]
 *   segments:  [[t0, x0, t1, x1, color?, dashed?], …]   worldlines, axes
 *   hyperbola: { through: [t, x] }  the curve of events with the same interval from the origin
 *   xlabel, ylabel: axis names (default light-years and years); axes: false hides the numbered axes
 */
export function spacetimeSketch({ events = [], segments = [], hyperbola = null, range = 5, cone = true, caption, xlabel = 'x (light-years)', ylabel = 't (years)', axes = true } = {}) {
  const curves = [];
  if (cone) curves.push({ fn: 'x', color: 'warn', dash: true, width: 1.4 }, { fn: '-x', color: 'warn', dash: true, width: 1.4 });
  if (hyperbola) {
    const [T, X] = hyperbola.through;
    const s2 = T * T - X * X;
    if (s2 > 1e-9) curves.push({ fn: `${T > 0 ? '' : '-'}sqrt(${s2} + x^2)`, color: 'ink3', width: 1.4 });
    else if (s2 < -1e-9) curves.push({ param: [`${X > 0 ? '' : '-'}sqrt(${-s2} + t^2)`, 't'], t: [-range * 1.5, range * 1.5], color: 'ink3', width: 1.4 });
  }
  for (const [t0, x0, t1, x1, color = 'accent', dashed = false] of segments) {
    curves.push({ param: [`${x0} + (${x1 - x0})*t`, `${t0} + (${t1 - t0})*t`], t: [0, 1], color, width: 2.2, dash: dashed });
  }
  return {
    type: 'graph',
    params: {
      x: [-range, range], y: [-range * 0.25, range * 1.4], equal: true,
      xlabel: axes ? xlabel : '', ylabel: axes ? ylabel : '', axes,
      curves,
      points: events.map(([T, X, label, color = 'accent2']) => ({ x: X, y: T, label, color })),
    },
    caption: caption ?? t`Years up the page, light-years across ($c = 1$); the dashed 45° lines are the light cone of the origin.`,
  };
}
