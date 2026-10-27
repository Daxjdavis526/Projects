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

/** A mech-fbd scene: scene(name, { m: 10, F: 40, ... }, caption). */
export const scene = (name, params, caption) => ({ type: 'mech-fbd', params: { scene: name, ...params }, ...(caption ? { caption } : {}) });

/** n significant figures as plain text: 0.0962, 69.3, 156, 11800. */
export function sf(x, n = 3) {
  if (!Number.isFinite(x) || x === 0) return String(x);
  const p = Math.floor(Math.log10(Math.abs(x)));
  if (p >= n - 1) return String(Math.round(x / 10 ** (p - n + 1)) * 10 ** (p - n + 1));
  const d = n - 1 - p;
  return (Math.round(x * 10 ** d) / 10 ** d).toFixed(d);
}
export const s3 = (x) => sf(x, 3);
/** The same for TeX, with a thin space between thousands from 10 000 up: 11\,800. */
export const t3 = (x, n = 3) => { const s = sf(x, n); return Math.abs(x) >= 1e4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : s; };

/** Degrees ↔ radians. */
export const D2R = Math.PI / 180;
export const sin = (deg) => Math.sin(deg * D2R);
export const cos = (deg) => Math.cos(deg * D2R);
export const tan = (deg) => Math.tan(deg * D2R);
