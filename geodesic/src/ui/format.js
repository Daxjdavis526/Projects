/* =============================================================================
   FORMAT — magnitude-aware readouts
   ========================================================================== */
import { SI, C, G } from '../physics/constants.js';

const SUP = { '-': '⁻', 0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹' };
export function sci(v, d = 3) {
  if (!isFinite(v)) return '—';
  if (v === 0) return '0';
  const neg = v < 0; v = Math.abs(v);
  const e = Math.floor(Math.log10(v));
  const m = v / 10 ** e;
  return `${neg ? '−' : ''}${m.toFixed(d)}×10${String(e).split('').map(c => SUP[c]).join('')}`;
}
export function num(v, d = 3) {
  if (!isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return sci(v, d);
  return v.toFixed(a >= 100 ? 1 : a >= 1 ? 3 : d);
}

/* distance in AU */
export function dist(au) {
  if (!isFinite(au)) return '—';
  const km = au * SI.AU / 1000;
  if (km < 1) return `${(km * 1000).toFixed(1)} m`;
  if (km < 1e6) return `${num(km, 1)} km`;
  if (au < 0.01) return `${sci(km, 2)} km`;
  if (au < 1e4) return `${num(au, 3)} AU`;
  return `${num(au * SI.AU / 9.4607e15, 3)} ly`;
}

/* mass in solar masses */
export function mass(msun) {
  if (!isFinite(msun)) return '—';
  const kg = msun * SI.M_SUN;
  if (msun >= 0.05) return `${num(msun, 3)} M☉`;
  const mEarth = kg / SI.M_EARTH;
  if (mEarth >= 0.01) return `${num(mEarth, 3)} M⊕`;
  return `${sci(kg, 2)} kg`;
}

/* speed in AU/yr */
export function speed(auyr) {
  if (!isFinite(auyr)) return '—';
  const frac = auyr / C;
  if (Math.abs(frac) > 0.01) return `${num(frac, 4)} c`;
  const kms = auyr * SI.AU / SI.YR / 1000;
  if (Math.abs(kms) < 0.01) return `${num(kms * 1000, 2)} m/s`;
  return `${num(kms, 3)} km/s`;
}

/* acceleration in AU/yr^2 -> m/s^2 */
export function accel(auyr2) {
  if (!isFinite(auyr2)) return '—';
  const ms2 = auyr2 * SI.AU / (SI.YR * SI.YR);
  return `${num(ms2, 3)} m/s²`;
}

/* time in years */
export function time(yr) {
  if (!isFinite(yr)) return '—';
  const a = Math.abs(yr);
  if (a < 1 / 31557600) return `${num(yr * SI.YR * 1000, 2)} ms`;
  if (a < 1 / 525960) return `${num(yr * SI.YR, 2)} s`;
  if (a < 1 / 8766) return `${num(yr * SI.YR / 60, 2)} min`;
  if (a < 1 / 365.25) return `${num(yr * 365.25 * 24, 2)} h`;
  if (a < 1) return `${num(yr * 365.25, 2)} d`;
  if (a < 1e4) return `${num(yr, 3)} yr`;
  return `${sci(yr, 3)} yr`;
}

/* density kg/m^3 */
export function density(kgm3) {
  if (!isFinite(kgm3)) return '—';
  if (kgm3 >= 1e6) return `${sci(kgm3, 2)} kg/m³`;
  return `${num(kgm3, 0)} kg/m³`;
}

/* tidal field, 1/yr^2 -> 1/s^2 */
export function tidal(peryr2) {
  if (!isFinite(peryr2)) return '—';
  return `${sci(peryr2 / (SI.YR * SI.YR), 2)} s⁻²`;
}
