/* =============================================================================
   FORMAT — number and time formatting that reformats itself by magnitude
   -----------------------------------------------------------------------------
   Nothing in this simulation stays within one order of magnitude for long. A
   readout fixed to one unit is unreadable at both ends, so every formatter here
   picks its unit from the value.
   ========================================================================== */

import { C, AU, LY, PC, R_SUN, DAY, YEAR } from '../config.js';

/* 1.234e51 -> "1.234 × 10⁵¹" */
const SUP = { '-': '⁻', 0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹' };
export function sci(v, digits = 3) {
  if (!isFinite(v)) return '—';
  if (v === 0) return '0';
  const neg = v < 0; v = Math.abs(v);
  const e = Math.floor(Math.log10(v));
  const m = v / Math.pow(10, e);
  const exp = String(e).split('').map(c => SUP[c]).join('');
  return `${neg ? '−' : ''}${m.toFixed(digits)} × 10${exp}`;
}

/* Plain fixed notation inside a sane range, scientific outside it. */
export function num(v, digits = 3) {
  if (!isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return sci(v, digits);
  return v.toFixed(a >= 100 ? 0 : a >= 1 ? 2 : digits);
}

/* --- time ----------------------------------------------------------------- */
/* Phase-aware: microseconds at bounce, years in the remnant. Sign preserved,
   because t < 0 means "before core bounce" and that is the whole convention. */
export function time(s) {
  if (!isFinite(s)) return '—';
  const neg = s < 0 ? '−' : '';
  const a = Math.abs(s);
  if (a < 1e-6)  return `${neg}${(a * 1e9).toFixed(1)} ns`;
  if (a < 1e-3)  return `${neg}${(a * 1e6).toFixed(2)} µs`;
  if (a < 1)     return `${neg}${(a * 1e3).toFixed(3)} ms`;
  if (a < 60)    return `${neg}${a.toFixed(3)} s`;
  if (a < 3600)  return `${neg}${Math.floor(a / 60)}m ${(a % 60).toFixed(0)}s`;
  if (a < DAY)   { const h = Math.floor(a / 3600), m = Math.floor((a % 3600) / 60);
                   return `${neg}${h}h ${String(m).padStart(2, '0')}m`; }
  if (a < YEAR)  return `${neg}${(a / DAY).toFixed(2)} days`;
  if (a < 1e4 * YEAR) return `${neg}${(a / YEAR).toFixed(a < 100 * YEAR ? 2 : 0)} yr`;
  return `${neg}${sci(a / YEAR, 2)} yr`;
}

/* --- length (km in, because scene units are km) --------------------------- */
export function dist(km) {
  if (!isFinite(km)) return '—';
  const cm = km * 1e5;
  if (km < 1e-3)        return `${(km * 1e5).toFixed(1)} cm`;
  if (km < 1e5)         return `${num(km, 2)} km`;
  if (cm < 0.5 * R_SUN) return `${num(km, 2)} km`;
  if (cm < 0.02 * AU)   return `${(cm / R_SUN).toFixed(2)} R☉`;
  if (cm < 0.2 * LY)    return `${(cm / AU).toFixed(2)} AU`;
  if (cm < 500 * LY)    return `${(cm / LY).toFixed(3)} ly`;
  return `${(cm / PC).toFixed(2)} pc`;
}

/* --- speed (km/s in) ------------------------------------------------------ */
/* Shown as a fraction of c once it stops being a sane number of km/s — which
   during collapse and in the shock it very much does. */
export function speed(kms) {
  if (!isFinite(kms)) return '—';
  const frac = (kms * 1e5) / C;
  if (frac > 0.05) return `${frac.toFixed(3)} c`;
  if (kms < 0.01)  return `${(kms * 1e3).toFixed(1)} m/s`;
  if (kms < 1e4)   return `${kms.toFixed(kms < 10 ? 2 : 0)} km/s`;
  return `${sci(kms, 2)} km/s`;
}

/* Speed factor for the timeline: how much faster than real time we are running */
export function warpFactor(f) {
  if (!isFinite(f) || f <= 0) return 'paused';
  if (f < 1e-3) return `${sci(f, 2)}×`;
  if (f < 1)    return `${f.toFixed(4)}×`;
  if (f < 1e4)  return `${f < 10 ? f.toFixed(2) : Math.round(f)}×`;
  return `${sci(f, 2)}×`;
}

/* Energy in erg, with the joule equivalent — the spec is emphatic about not
   conflating the four different supernova energies, so both units help. */
export function energy(erg) {
  if (!isFinite(erg) || erg === 0) return '—';
  return `${sci(erg, 2)} erg`;
}
