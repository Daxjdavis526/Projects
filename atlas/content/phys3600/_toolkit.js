// Shared helpers for PHYS 3600 modules M0 and M1 (vector calculus, the delta
// function, Coulomb and Gauss): physical constants, the on-axis fields of a
// ring, a disk and a line segment (used to compute answer keys and to draw
// curves), and small picture builders. Files whose names start with "_" are
// helpers, not lessons.

export { fieldPic, r6, co, boxSurface, sphereSurface } from '../math2210/_fields.js';
export { add, sub, scale, dot, cross, norm, QUADS } from '../math1220/_vectors.js';
export { pickExpr, is } from '../math2210/_space.js';

/** Vacuum permittivity (CODATA 2018), F/m. */
export const EPS0 = 8.8541878188e-12;   // F/m, CODATA 2022
/** Coulomb constant 1/(4πε₀), N·m²/C². */
export const KC = 1 / (4 * Math.PI * EPS0);

/** On-axis field of a ring of charge Q and radius a, at height z (SI). */
export const ringE = (Q, a, z) => (KC * Q * z) / (z * z + a * a) ** 1.5;
/** On-axis field of a uniformly charged disk (σ, radius a), at height z > 0 (SI). */
export const diskE = (sigma, a, z) => (sigma / (2 * EPS0)) * (1 - z / Math.sqrt(z * z + a * a));
/** Field of a segment of length 2L (charge density λ) on its perpendicular bisector, distance s (SI). */
export const segE = (lambda, L, s) => (2 * KC * lambda * L) / (s * Math.sqrt(s * s + L * L));

/** A 3D scene on calc-vectors3d. */
export const scene3 = (params, caption) => ({ type: 'calc-vectors3d', params, caption });

/** A plain number as TeX-safe text with up to n significant figures (no e-notation for ordinary sizes). */
export const sf = (x, n = 3) => +(+x).toPrecision(n);

/** A whole number with a non-breaking space between thousands, for prose (outside math): 26 560. */
export const th = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
