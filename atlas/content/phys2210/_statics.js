// Picture builders for PHYS 2210 module M12 (static equilibrium and
// elasticity): beams, supports, hatched ground and walls, force arrows drawn
// at their points of application and dimension lines, assembled into ordinary
// `graph` specs that the content test validates like any other visual.
// Not a lesson: the leading underscore keeps it out of the registry.

export const G = 9.8;                                  // m/s², the course's g
const r4 = (v) => +(+v).toFixed(4);
const DEG = Math.PI / 180;

/** A straight segment from a to b as a graph curve. */
export const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, dash });

/**
 * A scene collector: add pieces, then `spec(caption)` returns the graph visual,
 * framed to everything drawn plus a margin. Units are the drawing's own
 * (usually metres); force arrows are scaled separately (`perN` metres of arrow
 * per newton) and the caption should say so.
 */
export function scene({ perN = 1 / 400, aspect = 'wide', margin = 0.12, axes = false, xlabel = '', ylabel = '' } = {}) {
  const curves = [], arrows = [], points = [], shade = [], ext = [];
  const S = {
    perN,
    /** Note that a point should be inside the frame. */
    include(...pts) { ext.push(...pts); return S; },
    /** A thick bar from a to b (a beam, a ladder, a boom). */
    bar(a, b, { color = 'accent', width = 6 } = {}) { curves.push(seg(a, b, color, width)); ext.push(a, b); return S; },
    line(a, b, { color = 'ink3', width = 1.6, dash = false } = {}) { curves.push(seg(a, b, color, width, dash)); ext.push(a, b); return S; },
    /** Ground or wall: a line with short hatch marks on the side away from the scene (side: 'below' | 'left' | 'right' | 'above'). */
    surface(a, b, side = 'below', { color = 'ink3' } = {}) {
      curves.push(seg(a, b, color, 2));
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(3, Math.round(len / 0.25));
      const off = { below: [-0.12, -0.14], above: [-0.12, 0.14], left: [-0.14, -0.12], right: [0.14, -0.12] }[side];
      for (let k = 0; k <= n; k++) {
        const p = [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n];
        curves.push(seg(p, [p[0] + off[0], p[1] + off[1]], color, 1));
      }
      ext.push(a, b);
      return S;
    },
    /** A pin support: a triangle under the point p (or a hinge on a wall, `wall: 'left' | 'right'`). */
    pin(p, { size = 0.22, wall } = {}) {
      if (wall) {
        const s = wall === 'left' ? -1 : 1;
        curves.push(seg(p, [p[0] + s * size, p[1] + size * 0.8], 'ink2', 1.8), seg(p, [p[0] + s * size, p[1] - size * 0.8], 'ink2', 1.8));
      } else {
        curves.push(seg(p, [p[0] - size * 0.8, p[1] - size], 'ink2', 1.8), seg(p, [p[0] + size * 0.8, p[1] - size], 'ink2', 1.8), seg([p[0] - size * 0.8, p[1] - size], [p[0] + size * 0.8, p[1] - size], 'ink2', 1.8));
      }
      points.push({ x: r4(p[0]), y: r4(p[1]), r: 4, color: 'ink2' });
      ext.push([p[0] - size, p[1] - size], [p[0] + size, p[1] + size]);
      return S;
    },
    /** A force: an arrow of length |F|·perN from `at` (or ending at `at` when `push`), along `deg` degrees or the vector `dir`. */
    force(at, F, { deg, dir, label, color = 'accent', push = false, labelDx, labelDy } = {}) {
      const u = dir ? (() => { const L = Math.hypot(dir[0], dir[1]); return [dir[0] / L, dir[1] / L]; })() : [Math.cos(deg * DEG), Math.sin(deg * DEG)];
      const len = Math.abs(F) * S.perN, sgn = Math.sign(F) || 1;
      const d = [u[0] * len * sgn, u[1] * len * sgn];
      const from = push ? [at[0] - d[0], at[1] - d[1]] : at, to = push ? at : [at[0] + d[0], at[1] + d[1]];
      arrows.push({ from: from.map(r4), to: to.map(r4), color, ...(label ? { label } : {}), ...(labelDx !== undefined ? { labelDx } : {}), ...(labelDy !== undefined ? { labelDy } : {}) });
      ext.push(from, to);
      return S;
    },
    /** A dimension line between a and b, shifted `off` (a vector) away from the object, with its label in the middle. */
    dim(a, b, label, { off = [0, -0.35], color = 'ink2', dx, dy } = {}) {
      const A = [a[0] + off[0], a[1] + off[1]], B = [b[0] + off[0], b[1] + off[1]];
      const L = Math.hypot(off[0], off[1]) || 1, n = [(off[0] / L) * 0.09, (off[1] / L) * 0.09];
      curves.push(seg(A, B, color, 1.1), seg([A[0] - n[0], A[1] - n[1]], [A[0] + n[0], A[1] + n[1]], color, 1.1), seg([B[0] - n[0], B[1] - n[1]], [B[0] + n[0], B[1] + n[1]], color, 1.1));
      points.push({ x: r4((A[0] + B[0]) / 2), y: r4((A[1] + B[1]) / 2), r: 0.01, color, label, labelDx: dx ?? -3.5 * label.length, labelDy: dy ?? (off[1] < 0 ? 12 : -12) });
      ext.push(A, B);
      return S;
    },
    /** A labelled point (a centre of gravity, a pivot, a person). */
    dot(p, label, { color = 'gold', r = 4.5, dx, dy } = {}) {
      points.push({ x: r4(p[0]), y: r4(p[1]), r, color, ...(label ? { label } : {}), ...(dx !== undefined ? { labelDx: dx } : {}), ...(dy !== undefined ? { labelDy: dy } : {}) });
      ext.push(p);
      return S;
    },
    /** Plain text at a point. */
    text(p, label, { color = 'ink2', dx = 0, dy = 0 } = {}) { points.push({ x: r4(p[0]), y: r4(p[1]), r: 0.01, color, label, labelDx: dx, labelDy: dy }); return S; },
    /** A filled rectangle (a box, a block) with corners a and b. */
    box(a, b, { color = 'ink2', alpha = 0.35 } = {}) {
      shade.push({ fn: String(r4(Math.max(a[1], b[1]))), lower: String(r4(Math.min(a[1], b[1]))), from: r4(Math.min(a[0], b[0])), to: r4(Math.max(a[0], b[0])), color, alpha });
      curves.push(seg(a, [b[0], a[1]], color, 1.4), seg([b[0], a[1]], b, color, 1.4), seg(b, [a[0], b[1]], color, 1.4), seg([a[0], b[1]], a, color, 1.4));
      ext.push(a, b);
      return S;
    },
    /** A curved arrow round p (a sense of rotation), from angle a0 to a1 in degrees. */
    turn(p, r, a0, a1, { color = 'warn', label } = {}) {
      const t0 = a0 * DEG, t1 = a1 * DEG;
      curves.push({ param: [`${r4(p[0])} + ${r4(r)}*cos(t)`, `${r4(p[1])} + ${r4(r)}*sin(t)`], t: [r4(Math.min(t0, t1)), r4(Math.max(t0, t1))], color, width: 1.8 });
      const e = t1, s = Math.sign(t1 - t0), tip = [p[0] + r * Math.cos(e), p[1] + r * Math.sin(e)];
      const back = [tip[0] + s * 0.15 * r * Math.sin(e), tip[1] - s * 0.15 * r * Math.cos(e)];
      arrows.push({ from: back.map(r4), to: tip.map(r4), color, ...(label ? { label } : {}) });
      ext.push([p[0] - r, p[1] - r], [p[0] + r, p[1] + r]);
      return S;
    },
    spec(caption, extra = {}) {
      const xs = ext.map((p) => p[0]), ys = ext.map((p) => p[1]);
      const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys), m = margin * Math.max(w, h, 1e-6);
      return {
        type: 'graph',
        params: {
          x: [r4(Math.min(...xs) - m), r4(Math.max(...xs) + m)], y: [r4(Math.min(...ys) - m), r4(Math.max(...ys) + m)],
          equal: true, axes, grid: false, xlabel, ylabel, aspect, alt: extra.alt || 'A diagram of the forces on a body in equilibrium',
          curves, arrows, points, shade, ...extra,
        },
        caption,
      };
    },
  };
  return S;
}
