/* =============================================================================
   COMMON GLSL — shared shader chunks
   -----------------------------------------------------------------------------
   Imported as strings and concatenated into materials. Every chunk here is used
   by more than one shader; anything used once lives with its own material.
   ========================================================================== */

/* --- hashing and value noise --------------------------------------------- */
export const HASH = /* glsl */`
float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
vec3  hash33(vec3 p){
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
}
`;

/* --- 3D simplex noise -----------------------------------------------------
   Gustavson/Ashima formulation. Gradient noise rather than value noise: it has
   no axis-aligned artefacts, which matters on a sphere where a grid pattern
   would be instantly legible as fake.                                       */
export const SIMPLEX = /* glsl */`
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

/* --- fbm and domain warping ----------------------------------------------
   FBM_N is a macro so each shader can pick its octave count without a uniform
   branch in the inner loop.                                                  */
export const FBM = /* glsl */`
float fbm(vec3 p, int oct, float lac, float gain){
  float a = 0.5, s = 0.0, n = 0.0;
  for (int i = 0; i < 8; i++){
    if (i >= oct) break;
    s += a * snoise(p);
    n += a; a *= gain; p *= lac;
  }
  return s / max(n, 1e-5);
}

/* Three chained fbm evaluations. The mottled, never-quite-repeating look of a
   convective surface comes from this, not from stacking more octaves. */
vec2 warpFbm(vec3 p, float t, int oct, float warp){
  float q = fbm(p + vec3(0.0, 0.0, t), oct, 2.1, 0.52);
  float r = fbm(p + warp * q + vec3(t * 0.6, 0.0, 0.0), oct, 2.1, 0.52);
  float n = fbm(p + warp * r, oct, 2.1, 0.52);
  return vec2(n, r);   // n = final field, r = intermediate (useful as a mask)
}
`;

/* --- blackbody colour -----------------------------------------------------
   Kim et al. cubic fit to the Planckian locus in CIE xy, then xy -> XYZ ->
   linear sRGB. Physically motivated rather than an art-directed ramp, which
   matters because these colours are being used to *communicate temperature*.
   Returns linear RGB normalised so the largest component is 1.0 — intensity is
   applied separately by the caller.                                          */
export const BLACKBODY = /* glsl */`
vec3 blackbody(float T){
  T = clamp(T, 1000.0, 40000.0);
  float t1 = 1000.0 / T, t2 = t1 * t1, t3 = t2 * t1;
  float x = (T <= 4000.0)
    ? (-0.2661239 * t3 - 0.2343589 * t2 + 0.8776956 * t1 + 0.179910)
    : (-3.0258469 * t3 + 2.1070379 * t2 + 0.2226347 * t1 + 0.240390);
  float x2 = x * x, x3 = x2 * x;
  float y;
  if      (T <= 2222.0) y = -1.1063814 * x3 - 1.34811020 * x2 + 2.18555832 * x - 0.20219683;
  else if (T <= 4000.0) y = -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867;
  else                  y =  3.0817580 * x3 - 5.87338670 * x2 + 3.75112997 * x - 0.37001483;

  y = max(y, 1e-4);
  vec3 XYZ = vec3(x / y, 1.0, (1.0 - x - y) / y);
  mat3 M = mat3( 3.2404542, -0.9692660,  0.0556434,
                -1.5371385,  1.8760108, -0.2040259,
                -0.4985314,  0.0415560,  1.0572252);
  vec3 rgb = max(M * XYZ, 0.0);
  return rgb / max(max(rgb.r, max(rgb.g, rgb.b)), 1e-4);
}
`;

/* --- limb darkening -------------------------------------------------------
   Quadratic law I(mu)/I(0) = 1 - u1(1-mu) - u2(1-mu)^2. The coefficients are
   strongly wavelength dependent; these are red-optical values for a cool
   giant, where limb darkening is severe. This single term does more to make a
   sphere read as a star than any amount of surface detail.                   */
export const LIMB = /* glsl */`
float limbDarken(float mu, float u1, float u2){
  float m = clamp(mu, 0.0, 1.0);
  return clamp(1.0 - u1 * (1.0 - m) - u2 * (1.0 - m) * (1.0 - m), 0.0, 1.0);
}
`;

export const NOISE_KIT = HASH + SIMPLEX + FBM;
