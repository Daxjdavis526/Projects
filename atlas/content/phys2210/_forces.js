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

/** Three significant figures, as text (a thin alias kept local so these lessons do not depend on another course helper). */
export const s3 = (x) => {
  if (!Number.isFinite(x) || x === 0) return String(x);
  const p = Math.floor(Math.log10(Math.abs(x)));
  const d = Math.max(0, 2 - p);
  return (Math.round(x * 10 ** d) / 10 ** d).toFixed(d);
};

/** Degrees ↔ radians. */
export const D2R = Math.PI / 180;
export const sin = (deg) => Math.sin(deg * D2R);
export const cos = (deg) => Math.cos(deg * D2R);
export const tan = (deg) => Math.tan(deg * D2R);
