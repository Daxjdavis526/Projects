/* starphys.js — small shared stellar-physics helpers */

/** crude spectral class -> luminosity in L☉ */
export function specLum(spec) {
  const base = { O: 5e4, B: 800, A: 22, F: 3.2, G: 1.0, K: 0.3, M: 0.03, D: 0.01 }[spec[0]] ?? 1;
  if (/I[ab]?$|Ia|Ib/.test(spec) && !/III|IV|V/.test(spec)) return base * 3e3;   // supergiant
  if (/III/.test(spec)) return base * 120;                                       // giant
  if (/IV/.test(spec)) return base * 6;
  return base;
}
