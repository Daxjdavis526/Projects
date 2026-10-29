// IEEE 754 binary floating point taken apart, for the num-float simulation:
// the bits of a binary64 (float64) or binary32 (float32) number, its fields,
// the exact decimal value of what is stored, and its neighbours. DOM-free;
// tested in test/num-float.test.mjs.

export const FORMATS = {
  f64: { name: 'float64', bits: 64, ebits: 11, fbits: 52, bias: 1023 },
  f32: { name: 'float32', bits: 32, ebits: 8, fbits: 23, bias: 127 },
};

/** Round a JavaScript number (a binary64) into the format. */
export const toFormat = (x, fmt = 'f64') => (fmt === 'f32' ? Math.fround(x) : +x);

/** The bit pattern of x in the format, as a string of '0' and '1', most significant first. */
export function bitsOf(x, fmt = 'f64') {
  const F = FORMATS[fmt];
  const d = new DataView(new ArrayBuffer(8));
  if (fmt === 'f32') { d.setFloat32(0, x); return d.getUint32(0).toString(2).padStart(32, '0'); }
  d.setFloat64(0, x);
  return d.getUint32(0).toString(2).padStart(32, '0') + d.getUint32(4).toString(2).padStart(32, '0').slice(0, F.bits - 32);
}

/** The number whose bit pattern is the string `bits`. */
export function fromBits(bits, fmt = 'f64') {
  const d = new DataView(new ArrayBuffer(8));
  if (fmt === 'f32') { d.setUint32(0, parseInt(bits, 2) >>> 0); return d.getFloat32(0); }
  d.setUint32(0, parseInt(bits.slice(0, 32), 2) >>> 0);
  d.setUint32(4, parseInt(bits.slice(32), 2) >>> 0);
  return d.getFloat64(0);
}

/** The fields of x: sign, stored and unbiased exponent, fraction bits, kind. */
export function decode(x, fmt = 'f64') {
  const F = FORMATS[fmt];
  const b = bitsOf(x, fmt);
  const s = +b[0], ebitsStr = b.slice(1, 1 + F.ebits), fbitsStr = b.slice(1 + F.ebits);
  const E = parseInt(ebitsStr, 2), allOnes = (1 << F.ebits) - 1;
  const fracZero = !fbitsStr.includes('1');
  const kind = E === allOnes ? (fracZero ? 'inf' : 'nan') : E === 0 ? (fracZero ? 'zero' : 'subnormal') : 'normal';
  // value = (−1)^s × significand × 2^e, with significand 1.f (normal) or 0.f (subnormal)
  const e = kind === 'subnormal' || kind === 'zero' ? 1 - F.bias : E - F.bias;
  return { bits: b, sign: s, expBits: ebitsStr, fracBits: fbitsStr, stored: E, e, kind, lead: kind === 'normal' ? 1 : 0 };
}

/** The next float above x (toward +∞) and below it, in the format. */
export function nextUp(x, fmt = 'f64') {
  if (Number.isNaN(x) || x === Infinity) return x;
  if (x === 0) return fromBits('0'.repeat(FORMATS[fmt].bits - 1) + '1', fmt);
  const n = BigInt('0b' + bitsOf(x, fmt));
  const m = x > 0 ? n + 1n : n - 1n;
  return fromBits(m.toString(2).padStart(FORMATS[fmt].bits, '0'), fmt);
}
export const nextDown = (x, fmt = 'f64') => -nextUp(-x, fmt);

/** The gap from |x| to the next float of larger magnitude (math.ulp in Python for float64). */
export function ulp(x, fmt = 'f64') {
  const a = Math.abs(x);
  if (!Number.isFinite(a)) return NaN;
  return nextUp(a, fmt) - a;
}

/** The exact value of x as an integer numerator m and a power of two: x = m · 2^q. */
export function exactParts(x) {
  if (!Number.isFinite(x)) return null;
  if (x === 0) return { m: 0n, q: 0 };
  const d = decode(x, 'f64');
  let m = BigInt('0b' + (d.lead ? '1' : '0') + d.fracBits);
  let q = d.e - 52;
  while (m !== 0n && (m & 1n) === 0n) { m >>= 1n; q++; }
  return { m: d.sign ? -m : m, q };
}

/**
 * The exact decimal expansion of the binary number x (every binary float has
 * one, because 2⁻ᵏ = 5ᵏ/10ᵏ): `text` in full, plus its significant digits
 * `sig` and the power of ten `exp10` of the first of them, so a caller can
 * show d.ddd… × 10ⁿ. `maxSig` caps the digits kept in `sig` (`cut` says so).
 */
export function exactDecimal(x, maxSig = Infinity) {
  if (Number.isNaN(x)) return { text: 'NaN', sig: '', exp10: 0, cut: false, digits: 0, neg: false };
  if (!Number.isFinite(x)) return { text: x > 0 ? '∞' : '−∞', sig: '', exp10: 0, cut: false, digits: 0, neg: x < 0 };
  if (x === 0) return { text: '0', sig: '0', exp10: 0, cut: false, digits: 1, neg: Object.is(x, -0) };
  const { m, q } = exactParts(x);
  const neg = m < 0n, am = neg ? -m : m;
  let intPart, fracPart;
  if (q >= 0) { intPart = (am << BigInt(q)).toString(); fracPart = ''; }
  else {
    const k = -q;
    const scaled = (am * 5n ** BigInt(k)).toString().padStart(k + 1, '0');   // am / 2^k = am·5^k / 10^k
    intPart = scaled.slice(0, scaled.length - k);
    fracPart = scaled.slice(scaled.length - k).replace(/0+$/, '');
  }
  const intDigits = intPart.replace(/^0+/, '');
  let sig, exp10;
  if (intDigits) { sig = (intDigits + fracPart).replace(/0+$/, ''); exp10 = intDigits.length - 1; }
  else { const lead = fracPart.match(/^0*/)[0].length; sig = fracPart.slice(lead); exp10 = -(lead + 1); }
  const digits = sig.length;
  const cut = digits > maxSig;
  return { text: (neg ? '-' : '') + (fracPart ? `${intPart}.${fracPart}` : intPart), sig: cut ? sig.slice(0, maxSig) : sig, exp10, cut, digits, neg };
}

/** Relative rounding error of storing the real number xTrue as the float x (a float64 estimate). */
export const relError = (x, xTrue) => Math.abs(x - xTrue) / Math.abs(xTrue);

export const EPS = { f64: 2 ** -52, f32: 2 ** -23 };
export const UNIT_ROUNDOFF = { f64: 2 ** -53, f32: 2 ** -24 };
