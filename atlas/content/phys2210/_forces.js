// Picture builders for the PHYS 2210 force lessons (modules M5 and M6): thin
// wrappers that return ordinary visual specs for the mech-fbd, mech-drag and
// mech-frames simulations, so the content test validates them like any other
// visual. Not a lesson: the leading underscore keeps it out of the registry.

/** The Atlas's g for these lessons, m/s² (as in M5.3). */
export const G = 9.8;

/** A force for the generic body scene: label, size in N, direction in degrees from +x, kind (sets the colour). */
export const force = (label, mag, dir, kind = 'applied') => ({ label, mag: +(+mag).toPrecision(10), dir, kind });

/**
 * A free-body diagram of one body with forces given directly.
 *   icon   what the body is in the picture (none, block, ball, rocket, car, plane, capsule, skydiver, drone, probe, person, puck)
 *   show   'fbd' (the dot diagram only, default), 'both' (picture + diagram), 'scene' (arrows on the picture), 'picture'
 *   name   the diagram's title
 */
export function bodyFBD(forces, { icon = 'none', show = 'fbd', name, caption, ...rest } = {}) {
  return {
    type: 'mech-fbd',
    params: { scene: 'body', icon, forces, show, accel: false, ...(name ? { names: [name] } : {}), ...rest },
    ...(caption ? { caption } : {}),
  };
}

/**
 * Two interacting bodies, as a plain `graph` picture: each body a dot, the
 * third-law pair as two equal violet arrows (pushing the bodies apart, or
 * pulling them together when `attract`), and each body's acceleration F/m
 * written underneath, with a gold arrow when it is big enough to see.
 */
export function pairPicture({ names, masses, F, attract = false, labels = ['F', 'F'], caption }) {
  const [n1, n2] = names, [m1, m2] = masses;
  const a = [F / m1, F / m2], amax = Math.max(...a);
  const sgn = attract ? 1 : -1;                  // direction of the force on body 1 (body 2 is to its right)
  const L = (q) => +((q / amax) * 1.1).toFixed(4);
  const aText = (q) => (q >= 1e-3 ? `a = ${sf(q, 2)} m/s²` : `a ≈ ${q.toExponential(1).replace('e', '×10^')} m/s²`.replace(/\^([-+]?\d+)/, (m, e) => sup(+e)));
  const arrows = [
    { from: [-1.4 + sgn * 0.15, 0.32], to: [-1.4 + sgn * 1.15, 0.32], color: 'violet', label: labels[0] },
    { from: [1.4 - sgn * 0.15, 0.32], to: [1.4 - sgn * 1.15, 0.32], color: 'violet', label: labels[1] },
  ];
  a.forEach((q, i) => { const x0 = i ? 1.4 : -1.4, d = (i ? -sgn : sgn) * L(q); if (Math.abs(d) > 0.05) arrows.push({ from: [x0, -0.45], to: [+(x0 + d).toFixed(4), -0.45], color: 'gold' }); });
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-3.4, 3.4], y: [-1.3, 1.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      alt: `${n1} and ${n2} pushing or pulling on each other, with the forces and accelerations marked`,
      points: [
        { x: -1.4, y: 0, r: 9, color: 'accent', label: n1 },
        { x: 1.4, y: 0, r: 9, color: 'teal', label: n2 },
        { x: -1.4, y: -0.85, r: 0.01, color: 'gold', label: aText(a[0]) },
        { x: 1.4, y: -0.85, r: 0.01, color: 'gold', label: aText(a[1]) },
      ],
      arrows,
    },
    ...(caption ? { caption } : {}),
  };
}
const sup = (n) => String(n).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);

/** A mech-fbd scene: scene(name, { m: 10, F: 40, ... }, caption). */
export const scene = (name, params, caption) => ({ type: 'mech-fbd', params: { scene: name, ...params }, ...(caption ? { caption } : {}) });

/** n significant figures as plain text: 0.0962, 69.3, 156, 11800. */
export function sf(x, n = 3) {
  if (!Number.isFinite(x) || x === 0) return String(x);
  const a = Math.abs(x), sign = x < 0 ? '-' : '';
  const p = Math.floor(Math.log10(a * (1 + 1e-12)));
  if (p >= n - 1) return sign + String(Math.round(a / 10 ** (p - n + 1)) * 10 ** (p - n + 1));
  const d = n - 1 - p;
  return sign + (Math.round(a * 10 ** d * (1 + 1e-12)) / 10 ** d).toFixed(d);
}
export const s3 = (x) => sf(x, 3);
/** The same for TeX, with a thin space between thousands from 10 000 up: 11\,800. */
export const t3 = (x, n = 3) => { const s = sf(x, n); return Math.abs(x) >= 1e4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : s; };

/** Degrees ↔ radians. */
export const D2R = Math.PI / 180;
export const sin = (deg) => Math.sin(deg * D2R);
export const cos = (deg) => Math.cos(deg * D2R);
export const tan = (deg) => Math.tan(deg * D2R);
