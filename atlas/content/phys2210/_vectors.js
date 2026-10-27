// Picture builders for PHYS 2210 module M2 (vectors): static 2D vector
// diagrams as ordinary `graph` specs, so the content test validates them like
// any other visual. 3D pictures use the calc-vectors3d simulation directly.

const r4 = (v) => +(+v).toFixed(4);
export const DEG = Math.PI / 180;

/** A vector of length `len` at `deg` degrees anticlockwise from +x. */
export const polar = (len, deg) => [len * Math.cos(deg * DEG), len * Math.sin(deg * DEG)];

/**
 * A 2D vector picture on equal axes.
 *   arrows  [{ from: [x, y] (default the origin), to: [x, y], label, color, mid }] — `mid` labels the middle, not the tip
 *   comps   { of: [x, y], at: [x, y] (tail, default origin), labels: [xLabel, yLabel] } — the
 *           two component vectors, tip to tail, and a dashed line from the tip to the y-axis
 *   arc     { from: deg, to: deg, r, label, at: [x, y] } — an angle marker
 *   segments [{ from: [x, y], to: [x, y], color, dash }] — plain lines (a drop line, the line of a vector)
 *   numbers false hides the axis numbers, so a question cannot be answered by reading the picture
 */
export function vectorPicture({ arrows = [], comps, arc, segments = [], numbers = true, pad = 0.2, xlabel = 'x', ylabel = 'y', caption, points = [], aspect = 'wide' }) {
  const A = arrows.map((a) => ({ ...a, from: a.from || [0, 0] }));
  const pts = [[0, 0], ...A.flatMap((a) => [a.from, a.to])];
  const c = comps ? { at: comps.at || [0, 0], of: comps.of, labels: comps.labels || ['x-component', 'y-component'] } : null;
  if (c) pts.push([c.at[0] + c.of[0], c.at[1]], [c.at[0] + c.of[0], c.at[1] + c.of[1]]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1e-6);
  const X = [Math.min(...xs) - pad * span, Math.max(...xs) + pad * span], Y = [Math.min(...ys) - pad * span, Math.max(...ys) + pad * span];

  const arrowsOut = [], labels = [...points];
  const curves = segments.map((g) => ({ param: [`${r4(g.from[0])} + t*${r4(g.to[0] - g.from[0])}`, `${r4(g.from[1])} + t*${r4(g.to[1] - g.from[1])}`], t: [0, 1], color: g.color || 'ink3', width: g.width || 1.2, dash: g.dash !== false }));
  if (c) {
    const [x0, y0] = c.at, [vx, vy] = c.of;
    if (Math.abs(vx) > 1e-9) arrowsOut.push({ from: [r4(x0), r4(y0)], to: [r4(x0 + vx), r4(y0)], color: 'warn' });
    if (Math.abs(vy) > 1e-9) arrowsOut.push({ from: [r4(x0 + vx), r4(y0)], to: [r4(x0 + vx), r4(y0 + vy)], color: 'good' });
    curves.push({ param: ['t', String(r4(y0 + vy))], t: [r4(x0), r4(x0 + vx)], color: 'ink3', width: 1.1, dash: true });
    if (c.labels[0] && Math.abs(vx) > 1e-9) labels.push({ x: r4(x0 + vx / 2 - 0.08 * span), y: r4(y0 + (vy >= 0 ? -0.09 : 0.12) * span), r: 0.01, color: 'warn', label: c.labels[0] });
    if (c.labels[1] && Math.abs(vy) > 1e-9) labels.push({ x: r4(vx >= 0 ? x0 + vx + 0.02 * span : x0 + vx - 0.04 * span - 0.14 * (X[1] - X[0])), y: r4(y0 + vy / 2), r: 0.01, color: 'good', label: c.labels[1] });
  }
  if (arc) {
    const [ax, ay] = arc.at || [0, 0], r = arc.r ?? 0.16 * span;
    const t0 = arc.from * DEG, t1 = arc.to * DEG, mid = (t0 + t1) / 2;
    curves.push({ param: [`${r4(ax)} + ${r4(r)}*cos(t)`, `${r4(ay)} + ${r4(r)}*sin(t)`], t: [r4(t0), r4(t1)], color: 'gold', width: 1.8 });
    if (arc.label) labels.push({ x: r4(ax + 1.2 * r * Math.cos(mid)), y: r4(ay + 1.2 * r * Math.sin(mid)), r: 0.01, color: 'gold', label: arc.label });
  }
  for (const a of A) {
    // a label at the tip by default; `mid: true` puts it beside the middle of the arrow instead
    arrowsOut.push({ from: a.from.map(r4), to: a.to.map(r4), color: a.color || 'accent', label: a.mid ? undefined : a.label });
    if (a.mid && a.label) labels.push({ x: r4((a.from[0] + a.to[0]) / 2 + 0.03 * span), y: r4((a.from[1] + a.to[1]) / 2), r: 0.01, color: a.color || 'accent', label: a.label });
  }
  return {
    type: 'graph',
    params: {
      aspect, x: X.map(r4), y: Y.map(r4), equal: true, xlabel, ylabel,
      ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }),
      alt: 'A diagram of vectors drawn as arrows',
      arrows: arrowsOut, curves, points: labels,
    },
    caption: caption ?? (numbers ? 'Arrows drawn to scale.' : 'Arrows drawn to scale. The axes carry no numbers: compute, don’t read off.'),
  };
}
