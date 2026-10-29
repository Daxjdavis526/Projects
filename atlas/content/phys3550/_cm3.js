// Shared constants and helpers for the PHYS 3550 central-force and
// non-inertial-frame lessons (M5–M6): real gravitational parameters,
// vis-viva and transfer burns, and picture builders that return ordinary
// visual specs (graph, cm3-orbit), so the content test validates them.
// Not a lesson: the leading underscore keeps it out of the registry.

import { r6, gpic, seg, lab } from './_cm.js';

export const GM_E = 3.986004418e14;        // m³/s², Earth (IERS/WGS 84)
export const GM_SUN = 1.32712440018e20;    // m³/s², Sun (IAU 2015 nominal / DE ephemerides)
export const GM_MARS = 4.282837e13;        // m³/s², Mars
export const R_EQ = 6.378137e6;            // m, Earth's equatorial radius (WGS 84)
export const R_GEO = 4.2164e7;             // m, geostationary orbit radius (42 164 km)
export const AU = 1.495978707e11;          // m (IAU 2012, exact)
export const A_MARS = 1.523679 * AU;       // m, Mars's semi-major axis
export const R_MARS = 3.3895e6;            // m, Mars's mean radius
export const C = 299792458;                // m/s
export const M_SUN = 1.98847e30;           // kg
export const T_SID = 86164.0905;           // s, Earth's sidereal day
export const OMEGA_E = 7.2921150e-5;       // rad/s, Earth's rotation rate
export const G0 = 9.80665;                 // m/s², standard gravity (for "g" in station problems)

/** Vis-viva: speed at radius r on an orbit of semi-major axis a (a = r for a circle). */
export const visviva = (mu, r, a) => Math.sqrt(mu * (2 / r - 1 / a));

/** A Hohmann transfer between circular orbits r1 → r2: both burns (m/s), transfer time (s) and the speeds. */
export function hohmann(mu, r1, r2) {
  const at = (r1 + r2) / 2;
  const vc1 = Math.sqrt(mu / r1), vc2 = Math.sqrt(mu / r2);
  const vp = visviva(mu, r1, at), va = visviva(mu, r2, at);
  return { at, vc1, vc2, vp, va, dv1: Math.abs(vp - vc1), dv2: Math.abs(vc2 - va), dv: Math.abs(vp - vc1) + Math.abs(vc2 - va), tof: Math.PI * Math.sqrt(at ** 3 / mu) };
}

/** A bi-elliptic transfer r1 → rb → r2 (three burns). */
export function bielliptic(mu, r1, r2, rb) {
  const a1 = (r1 + rb) / 2, a2 = (r2 + rb) / 2;
  const dv1 = visviva(mu, r1, a1) - Math.sqrt(mu / r1);
  const dv2 = visviva(mu, rb, a2) - visviva(mu, rb, a1);
  const dv3 = visviva(mu, r2, a2) - Math.sqrt(mu / r2);
  return { dv1, dv2, dv3, dv: Math.abs(dv1) + Math.abs(dv2) + Math.abs(dv3), tof: Math.PI * (Math.sqrt(a1 ** 3 / mu) + Math.sqrt(a2 ** 3 / mu)) };
}

/** An ellipse with a focus at the origin and periapsis on +x, as a graph curve (part of it: th from–to). */
export function conic(rp, ra, { color = 'accent', width = 2, dash = false, from = 0, to = 6.2832, label, labelAt, labelDx, labelDy } = {}) {
  const p = (2 * rp * ra) / (rp + ra), e = (ra - rp) / (ra + rp);
  return { polar: `${r6(p)}/(1 + ${r6(e)}*cos(theta))`, theta: [r6(from), r6(to)], color, width, ...(dash ? { dash: true } : {}), ...(label ? { label, labelAt, labelDx, labelDy } : {}) };
}

/** A circle about the origin as a graph curve. */
export const ring = (r, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r6(r)}*cos(t)`, `${r6(r)}*sin(t)`], t: [0, 6.2832], color, width, ...(dash ? { dash: true } : {}) });

/** A filled disc (a planet or star) as a graph shade between two half-circles. */
export const disc = (r, color = 'accent', alpha = 0.55) => ({ fn: `sqrt(max(0, ${r6(r * r)} - x^2))`, lower: `-sqrt(max(0, ${r6(r * r)} - x^2))`, from: r6(-r), to: r6(r), color, alpha });

/** A cm3-orbit visual (still unless sliders are given). */
export function orb(params, caption) {
  return { type: 'cm3-orbit', params: { sliders: [], play: false, dragE: false, readouts: [], ...params }, caption };
}

/** A Hohmann picture: inner and outer circles, the transfer half-ellipse, burn arrows; units of r1 when scale = 1/r1. */
export function hohmannPic({ r1, r2, body = 0, bodyColor = 'accent', caption, alt, burns = true, labels = true, extra = {} }) {
  const R = Math.max(r1, r2) * 1.12;
  const lo = Math.min(r1, r2), hi = Math.max(r1, r2), up = r2 > r1;
  return gpic({
    x: [-R * 1.05, R * 1.05], y: [-R, R], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: body ? [disc(body, bodyColor)] : [],
    curves: [ring(r1, 'ink3', 1.6), ring(r2, 'ink3', 1.6), conic(lo, hi, { color: 'gold', width: 2.2, from: up ? 0 : 3.1416, to: up ? 3.1416 : 6.2832 }), conic(lo, hi, { color: 'gold', width: 1, dash: true, from: up ? 3.1416 : 0, to: up ? 6.2832 : 3.1416 })],
    points: [
      { x: r6(r1), y: 0, color: 'warn', r: 5, label: labels ? 'burn 1' : '', labelDx: 8, labelDy: 10 },
      { x: r6(-r2), y: 0, color: 'warn', r: 5, label: labels ? 'burn 2' : '', labelDx: -52, labelDy: 10 },
    ],
    arrows: burns ? [{ from: [r6(r1), 0], to: [r6(r1), r6(0.32 * R)], color: 'warn' }, { from: [r6(-r2), 0], to: [r6(-r2), r6(-0.32 * R)], color: 'warn' }] : [],
    ...extra,
  }, caption, alt || 'Two circular orbits joined by half of a transfer ellipse');
}

export { r6, gpic, seg, lab };
