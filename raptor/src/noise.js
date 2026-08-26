// Small deterministic noise kit shared by terrain, clouds and weather.

function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

export function value2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
  const a = hash(xi, yi), b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

export function fbm(x, y, octaves = 5, lac = 2.03, gain = 0.5) {
  let sum = 0, amp = 1, norm = 0, fx = x, fy = y;
  for (let i = 0; i < octaves; i++) {
    sum += amp * (value2(fx, fy) * 2 - 1);
    norm += amp;
    amp *= gain; fx *= lac; fy *= lac;
  }
  return sum / norm;
}

/** Ridged multifractal — the one that actually looks like mountains. */
export function ridged(x, y, octaves = 6, lac = 2.07, gain = 0.5) {
  let sum = 0, amp = 1, norm = 0, fx = x, fy = y, weight = 1;
  for (let i = 0; i < octaves; i++) {
    let n = 1 - Math.abs(value2(fx, fy) * 2 - 1);
    n *= n * weight;
    weight = Math.min(1, n * 2.4);
    sum += amp * n;
    norm += amp;
    amp *= gain; fx *= lac; fy *= lac;
  }
  return sum / norm;
}

export function rand2(x, y) { return hash(Math.floor(x), Math.floor(y)); }
