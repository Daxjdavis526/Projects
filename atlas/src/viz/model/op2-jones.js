// Jones calculus, DOM-free: the physics behind sims/op2-jones.js (PHYS 4650
// O6), tested headlessly in test/op2-jones.test.mjs.
//
// Convention (Hecht's and PHYS 3750's): a wave travelling along +z is the real
// part of (E_x, E_y) e^{i(kz − ωt)}. At z = 0 the field is
// (Re E_x e^{−iωt}, Re E_y e^{−iωt}), so the Jones vector (1, i)/√2 turns
// counterclockwise as seen by an observer facing the oncoming wave — Hecht's
// "left-circular" — and (1, −i)/√2 clockwise ("right-circular"). Stokes S₃ =
// 2 Im(E_x* E_y) is +1 for the counterclockwise state. A retarder delays its
// slow axis by Γ: its matrix, with the fast axis along x, is diag(1, e^{iΓ})
// (global phases are dropped throughout). Angles are measured from x toward y.

export const DEG = Math.PI / 180;

// complex numbers as [re, im]
export const cx = (re, im = 0) => [re, im];
export const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const conj = (a) => [a[0], -a[1]];
export const cabs2 = (a) => a[0] * a[0] + a[1] * a[1];
export const cexp = (ph) => [Math.cos(ph), Math.sin(ph)];

/** A 2×2 complex matrix times a Jones vector. */
export const apply = (M, v) => [cadd(cmul(M[0][0], v[0]), cmul(M[0][1], v[1])), cadd(cmul(M[1][0], v[0]), cmul(M[1][1], v[1]))];
/** Product of two 2×2 complex matrices, A·B (B acts first). */
export const mmul = (A, B) => [0, 1].map((i) => [0, 1].map((j) => cadd(cmul(A[i][0], B[0][j]), cmul(A[i][1], B[1][j]))));

/** Linear polarization at angle θ (rad) from x. */
export const linear = (th) => [cx(Math.cos(th)), cx(Math.sin(th))];
/** Counterclockwise (Hecht's left-) and clockwise (right-) circular states, normalized. */
export const CCW = [cx(Math.SQRT1_2), cx(0, Math.SQRT1_2)];
export const CW = [cx(Math.SQRT1_2), cx(0, -Math.SQRT1_2)];
/** An elliptical state from amplitudes a, b and the phase δ by which E_y leads (rad). */
export const elliptical = (a, b, d) => [cx(a), [b * Math.cos(d), b * Math.sin(d)]];

/** Ideal linear polarizer with its transmission axis at θ. */
export function polarizer(th) {
  const c = Math.cos(th), s = Math.sin(th);
  return [[cx(c * c), cx(c * s)], [cx(c * s), cx(s * s)]];
}
/** Linear retarder with its fast axis at θ and retardance Γ (rad): R(−θ) diag(1, e^{iΓ}) R(θ). */
export function retarder(th, G) {
  const c = Math.cos(th), s = Math.sin(th), e = cexp(G);
  // [[c² + s²e, cs(1 − e)], [cs(1 − e), s² + c²e]]
  const one_e = [1 - e[0], -e[1]];
  return [
    [cadd(cx(c * c), cmul(cx(s * s), e)), cmul(cx(c * s), one_e)],
    [cmul(cx(c * s), one_e), cadd(cx(s * s), cmul(cx(c * c), e))],
  ];
}
export const qwp = (th) => retarder(th, Math.PI / 2);
export const hwp = (th) => retarder(th, Math.PI);
/** Rotation of the field by α (an optically active medium, or a rotated frame). */
export const rotator = (a) => [[cx(Math.cos(a)), cx(-Math.sin(a))], [cx(Math.sin(a)), cx(Math.cos(a))]];

/** The matrix of an element spec { kind: 'pol' | 'qwp' | 'hwp' | 'ret' | 'rot', angle (deg), delta (deg) }. */
export function elementMatrix(el) {
  const th = (el.angle ?? 0) * DEG;
  if (el.kind === 'pol') return polarizer(th);
  if (el.kind === 'qwp') return qwp(th);
  if (el.kind === 'hwp') return hwp(th);
  if (el.kind === 'ret') return retarder(th, (el.delta ?? 90) * DEG);
  if (el.kind === 'rot') return rotator(th);
  throw new Error(`unknown element ${el.kind}`);
}

/** Irradiance of a Jones vector (|E_x|² + |E_y|²). */
export const intensity = (v) => cabs2(v[0]) + cabs2(v[1]);

/** Stokes parameters [S0, S1, S2, S3]. */
export function stokes(v) {
  const xx = cabs2(v[0]), yy = cabs2(v[1]), xy = cmul(conj(v[0]), v[1]);
  return [xx + yy, xx - yy, 2 * xy[0], 2 * xy[1]];
}

/** The polarization ellipse: azimuth ψ of the major axis (rad, −π/2…π/2), ellipticity angle χ (rad, tan χ = ±b/a), and the turn. */
export function ellipse(v) {
  const [S0, S1, S2, S3] = stokes(v);
  if (S0 < 1e-15) return { psi: 0, chi: 0, hand: 0, a: 0, b: 0 };
  const psi = 0.5 * Math.atan2(S2, S1), chi = 0.5 * Math.asin(Math.max(-1, Math.min(1, S3 / S0)));
  const A = Math.sqrt(S0);
  return { psi, chi, hand: Math.abs(S3) < 1e-9 * S0 ? 0 : Math.sign(S3), a: A * Math.cos(chi), b: A * Math.abs(Math.sin(chi)) };
}

/** The field at z = 0 at phase ωt = φ: (Re E_x e^{−iφ}, Re E_y e^{−iφ}). */
export function fieldAt(v, ph) {
  const e = cexp(-ph);
  return [cmul(v[0], e)[0], cmul(v[1], e)[0]];
}

/**
 * Run a chain. `input` is a Jones vector or 'unpolarized' (unit irradiance,
 * no fixed state). Returns the states after each element (null while the
 * light is still unpolarized) and their irradiances.
 */
export function chain(input, elements) {
  let v = input === 'unpolarized' ? null : input;
  let I = v ? intensity(v) : 1;
  const out = [{ v, I }];
  for (const el of elements) {
    if (v === null) {
      if (el.kind === 'pol') { v = linear((el.angle ?? 0) * DEG).map((c) => [c[0] * Math.SQRT1_2, c[1] * Math.SQRT1_2]); I = 0.5; }
      // a retarder or rotator leaves unpolarized light unpolarized
    } else {
      v = apply(elementMatrix(el), v);
      I = intensity(v);
    }
    out.push({ v, I });
  }
  return out;
}

/** The path of a state on the Poincaré sphere (unit Stokes vectors) as a retarder's Γ grows from 0 to its value. */
export function retarderPath(v, el, n = 48) {
  const G = el.kind === 'qwp' ? 90 : el.kind === 'hwp' ? 180 : el.delta ?? 90;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const s = stokes(apply(retarder((el.angle ?? 0) * DEG, (G * DEG * i) / n), v));
    pts.push([s[1] / s[0], s[2] / s[0], s[3] / s[0]]);
  }
  return pts;
}
