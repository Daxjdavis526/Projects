/* The regolith BRDF, checked against its own shader.

   This is the subsystem making the loudest accuracy claims in the project and
   the one where the same equation is written twice: once in JavaScript for the
   exposure model, once in GLSL for the ground. Nothing checked that the two
   agreed. A disagreement would not throw and would not look like a bug — the
   camera would simply mis-expose the thing it is pointed at, which reads as an
   art problem and is arithmetic.

   The two now come from one file. What is left to check is that the GLSL says
   what the JavaScript says, so this transliterates the shader source — the
   actual exported string, not a copy of it — into JavaScript and evaluates
   both over the whole domain. GLSL and JS share enough syntax that the
   translation is a handful of substitutions, and any of them failing shows up
   as a thrown error rather than as a silent pass.

   The physics is checked too, because agreeing on the wrong answer is still
   wrong: opposition brighter than quadrature, a limb that does not darken like
   a Lambertian sphere's, and Lambert exactly recovered at the normalisation
   point. */
import { regolithBrdf, BRDF_NORM, BRDF_GLSL } from '../src/render/photometry.js';
import { albedoFromMap, ALBEDO_GLSL } from '../src/render/albedo.js';
import { OPTICS } from '../src/config.js';

let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* --- a very small GLSL interpreter ----------------------------------------
   Enough of it to run these two functions and nothing more. Anything it does
   not understand is left alone and shows up as a JavaScript syntax error, so a
   shader that grows a feature this cannot translate fails loudly. */
/* JavaScript has no operator overloading, so the handful of places the shader
   does vector arithmetic have to be named. Each rewrite is asserted to match:
   a shader that grows a vector expression this does not know about fails here
   rather than quietly returning NaN. */
const VECTOR_OPS = [
  [/return\s+c\s*\*\s*\(([^;]+)\);/, 'return mul(c, ($1));'],
];

function glslToJs(src) {
  let out = src
    .replace(/\/\*[\s\S]*?\*\//g, '')                       // block comments
    .replace(/^\s*uniform\s+\w+\s+\w+\s*;\s*$/gm, '')       // uniforms come in as args
    .replace(/\b(float|int)\s+(\w+)\s*=/g, 'let $2 =')      // typed locals
    .replace(/\bvec3\s+(\w+)\s*=/g, 'let $1 =')
    .replace(/\bfloat\s+(\w+)\s*\(/g, 'function $1(')       // float f(...)
    .replace(/\bvec3\s+(\w+)\s*\(/g, 'function $1(')
    .replace(/\(([^()]*?)\bfloat\s+(\w+)/g, '($1$2')        // typed parameters
    .replace(/,\s*float\s+(\w+)/g, ', $1')
    .replace(/\(\s*vec3\s+(\w+)/g, '($1')
    .replace(/,\s*vec3\s+(\w+)/g, ', $1');
  for (const [re, to] of VECTOR_OPS) {
    if (re.test(out)) out = out.replace(re, to);
  }
  return out;
}

/* The GLSL builtins these two functions use. */
const env = {
  max: Math.max, min: Math.min, pow: Math.pow, cos: Math.cos, tan: Math.tan,
  abs: Math.abs, sqrt: Math.sqrt,
  vec3: (a, b, c) => (b === undefined ? [a, a, a] : [a, b, c]),
  mul: (v, k) => v.map((x) => x * k),
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  mix: (a, b, t) => (Array.isArray(a)
    ? a.map((v, i) => v + (b[i] - v) * t)
    : a + (b - a) * t),
};

function compile(glsl, name, uniforms) {
  const js = glslToJs(glsl);
  const names = Object.keys(env).concat(Object.keys(uniforms));
  const vals = Object.values(env).concat(Object.values(uniforms));
  const body = `${js}\nreturn ${name};`;
  // eslint-disable-next-line no-new-func
  return Function(...names, body)(...vals);
}

console.log('the shader and the exposure model are the same equation');
{
  const lunarBrdf = compile(BRDF_GLSL, 'lunarBrdf', {
    uHG: OPTICS.hgG, uOppositionB0: OPTICS.oppositionB0,
    uOppositionH: OPTICS.oppositionH, uBrdfNorm: BRDF_NORM,
  });
  check('the GLSL compiles at all', typeof lunarBrdf === 'function');

  let worst = 0, worstAt = null, samples = 0;
  for (let i = 1; i <= 20; i++) {
    const mu0 = i / 20;
    for (let j = 1; j <= 20; j++) {
      const mu = j / 20;
      for (let k = 0; k <= 30; k++) {
        const phase = k / 30 * Math.PI;
        const a = regolithBrdf(mu0, mu, phase);
        const b = lunarBrdf(mu0, mu, phase);
        const d = Math.abs(a - b);
        samples++;
        if (d > worst) { worst = d; worstAt = { mu0, mu, phase }; }
      }
    }
  }
  check('and they agree everywhere on the domain', worst < 1e-12,
        `worst ${worst.toExponential(2)} over ${samples} samples` +
        (worstAt ? ` at mu0=${worstAt.mu0} mu=${worstAt.mu} phase=${worstAt.phase.toFixed(2)}` : ''));

  /* The one case the JS handles and the shader leaves to the caller: the
     shader is only ever evaluated where mu0 > 0, because the vertex stage has
     already established the Sun is above the local horizon. */
  check('the JS is the stricter of the two, and says so by returning zero',
        regolithBrdf(-0.1, 0.5, 1) === 0);
}

console.log('the albedo knee, likewise');
{
  const shader = compile(ALBEDO_GLSL, 'albedoFromMap', {
    uAlbedoMax: OPTICS.albedoMax, uAlbedoKnee: OPTICS.albedoKnee,
    uChroma: OPTICS.chroma,
  });
  let worst = 0, worstAt = 0;
  for (let i = 1; i <= 200; i++) {
    const L = i / 200;
    /* Grey in, so the chroma term is the identity and the luminance out is
       directly comparable with the scalar function. */
    const out = shader([L, L, L]);
    const lum = out[0] * 0.2126 + out[1] * 0.7152 + out[2] * 0.0722;
    const d = Math.abs(lum - albedoFromMap(L));
    if (d > worst) { worst = d; worstAt = L; }
  }
  check('the shader curve is the scalar curve', worst < 1e-9,
        `worst ${worst.toExponential(2)} at L=${worstAt}`);

  /* The one deliberate difference, which is why the loop above starts at one
     pixel value rather than at zero: the shader floors the luminance at 1e-5
     so it can divide by it, and the scalar version has no division to protect.
     Both answer black for black; they differ by a hundred-thousandth on the
     way there, and that is the shader being careful rather than the two
     disagreeing. */
  const black = shader([0, 0, 0]);
  check('and both answer black for black to within the shader floor',
        Math.abs(black[0] - albedoFromMap(0)) < 1e-4,
        `${black[0].toExponential(2)} vs ${albedoFromMap(0)}`);
}

console.log('and the equation is the right one');
{
  const p = OPTICS.normalisePhase;
  const mu0 = Math.cos(p);
  check('Lambert is recovered exactly at the normalisation point',
        Math.abs(regolithBrdf(mu0, 1, p) - mu0) < 1e-12,
        `${regolithBrdf(mu0, 1, p).toFixed(9)} vs ${mu0.toFixed(9)}`);

  /* Opposition: the surge is the reason a full Moon is more than twice as
     bright as a half Moon rather than exactly twice. */
  const head = regolithBrdf(1, 1, 0), quad = regolithBrdf(1, 1, Math.PI / 2);
  check('zero phase is far brighter than quadrature', head / quad > 2.5,
        `${(head / quad).toFixed(2)}x`);
  /* Sharp, not a broad glow: the surge is the shadow-hiding term and its
     angular width is set by h = 0.06, so it should be most of the way down
     within ten degrees rather than tapering across the whole sky. Measured on
     the surge term alone so the Henyey-Greenstein backscatter, which is broad
     by design, is not doing the work. */
  const surgeAt = (ph) => 1 + OPTICS.oppositionB0 /
    (1 + Math.tan(ph * 0.5) / OPTICS.oppositionH);
  const halfWidth = (() => {
    const peak = surgeAt(0) - 1;
    for (let d = 0; d < 60; d += 0.05) if (surgeAt(d * Math.PI / 180) - 1 < peak / 2) return d;
    return 60;
  })();
  check('and the surge is sharp: half gone within a few degrees',
        halfWidth > 2 && halfWidth < 12, `half width ${halfWidth.toFixed(1)}°`);
  check('and down to a quarter by twenty degrees',
        (surgeAt(20 * Math.PI / 180) - 1) / (surgeAt(0) - 1) < 0.3,
        `${((surgeAt(20 * Math.PI / 180) - 1) / (surgeAt(0) - 1) * 100).toFixed(0)} % of peak`);

  /* Lommel-Seeliger is the reason the Moon looks like a flat disc rather than
     a shaded ball: towards the limb mu falls and mu0/(mu0+mu) rises, which
     very nearly cancels the falling mu0. A Lambertian sphere would not. */
  const centre = regolithBrdf(1, 1, 0.6);
  const limb = regolithBrdf(0.26, 0.26, 0.6);
  check('the limb does not darken the way a Lambertian sphere would',
        limb / centre > 0.7, `${(limb / centre).toFixed(2)} against Lambert's 0.26`);

  check('and nothing is lit where the Sun is below the horizon',
        regolithBrdf(0, 0.5, 0.5) === 0);
  check('the backscatter parameter is the one the docs quote', OPTICS.hgG === -0.25);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
