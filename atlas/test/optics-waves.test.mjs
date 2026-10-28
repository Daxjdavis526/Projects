// The DOM-free wave-optics model behind sims/optics-waves.js. Every pattern
// is a sum of phasors; here the sums are checked against the closed forms of
// the textbooks: two-slit maxima at d sin θ = mλ, single-slit minima at
// a sin θ = mλ, the grating's sharpening maxima and missing orders, the Airy
// pattern's first dark ring at 1.22λ/D (the Rayleigh criterion), thin-film
// reflectance (quarter-wave coatings, black soap films), the Michelson's
// fringe count, and Malus's law.
//   node atlas/test/optics-waves.test.mjs

import * as W from '../src/viz/model/optics-waves.js';
import { validate } from '../src/viz/sims/optics-waves.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const I = ([re, im]) => re * re + im * im;
/** Local maxima of f on a grid over [lo, hi]: refined by golden-section search. */
function maxima(f, lo, hi, n = 4000) {
  const out = [];
  let a = f(lo), b = f(lo + (hi - lo) / n);
  for (let i = 2; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n, c = f(x);
    if (b > a && b >= c) {
      let l = x - (2 * (hi - lo)) / n, r = x;
      for (let k = 0; k < 80; k++) { const m1 = l + (r - l) * 0.382, m2 = l + (r - l) * 0.618; if (f(m1) < f(m2)) l = m1; else r = m2; }
      out.push((l + r) / 2);
    }
    a = b; b = c;
  }
  return out;
}
/** Zeros (minima reaching ~0) of a non-negative f, refined. */
function zeros(f, lo, hi, n = 4000, floor = 1e-6) {
  const out = [];
  for (const x of maxima((s) => -f(s), lo, hi, n)) if (f(x) < floor) out.push(x);
  return out;
}

// ─── sums of phasors against the closed forms ──────────────────────────────
{
  const lam = 0.5, cases = [{ N: 1, d: 0, a: 4 }, { N: 2, d: 10, a: 2 }, { N: 5, d: 6, a: 1.5 }, { N: 2, d: 20, a: 0 }];
  for (const p of cases) {
    let worst = 0;
    for (let s = -0.3; s <= 0.3; s += 0.0037) {
      const sum = I(W.slitsFieldSum({ ...p, lambda: lam }, s, 400));
      worst = Math.max(worst, Math.abs(sum - W.slitsClosed({ ...p, lambda: lam }, s)), Math.abs(W.slitsIntensity({ ...p, lambda: lam }, s) - W.slitsClosed({ ...p, lambda: lam }, s)));
    }
    check(`${p.N} slit(s), a = ${p.a}, d = ${p.d}: the sum of 400 Huygens phasors per slit matches the closed form`, worst < 2e-4, worst.toExponential(2));
  }
  const p = { N: 3, d: 5, a: 1, lambda: 0.6 };
  const chain = W.phasorChain(p, 0.07, 30), end = chain[chain.length - 1];
  check('the phasor chain ends at the field (its length² is the intensity)', near(end[0] ** 2 + end[1] ** 2, I(W.slitsFieldSum(p, 0.07, 30)), 1e-12));
  check('every phasor in the chain has length 1/(number of sources)', chain.slice(1).every((q, i) => near(Math.hypot(q[0] - chain[i][0], q[1] - chain[i][1]), 1 / 90, 1e-12)));
  // the single slit's first minimum: the chain closes into a full circle
  const ss = { N: 1, a: 3, lambda: 0.5 }, c1 = W.phasorChain(ss, 0.5 / 3, 60), e1 = c1[c1.length - 1];
  check('at a single slit’s first minimum the phasor chain closes into a circle', Math.hypot(e1[0], e1[1]) < 1e-12);
  const mid = c1[30];
  check('…of circumference 1, so its diameter is 1/π', near(Math.hypot(mid[0], mid[1]), 1 / Math.PI, 2e-3), Math.hypot(mid[0], mid[1]));
}

// ─── two slits: bright at d sin θ = mλ, dark at (m + ½)λ ───────────────────
{
  const d = 0.25e-3, lam = 633e-9, p = { N: 2, d, a: 0, lambda: lam };
  const mx = maxima((s) => W.slitsIntensity(p, s), -0.0105, 0.0105);
  const want = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((m) => W.brightSin(m, d, lam));
  check('two narrow slits: the maxima found in the phasor sum sit at d sin θ = mλ', mx.length === want.length && mx.every((s, i) => near(s, want[i], 1e-6)), mx.map((s) => (s * d / lam).toFixed(4)).join(' '));
  const mn = zeros((s) => W.slitsIntensity(p, s), -0.005, 0.005);
  check('…and the dark fringes at d sin θ = (m + ½)λ', mn.length === 4 && mn.every((s) => near(((s * d) / lam) % 1, s > 0 ? 0.5 : -0.5, 1e-5)), mn.map((s) => (s * d / lam).toFixed(4)).join(' '));
  check('…with intensity cos²(πd sin θ/λ)', near(W.slitsIntensity(p, 0.37 * lam / d), Math.cos(Math.PI * 0.37) ** 2));
  // on a screen L away, small angles: fringe spacing λL/d
  const L = 2, y1 = L * Math.tan(Math.asin(W.brightSin(1, d, lam)));
  check('fringe spacing on a 2 m screen: λL/d = 5.06 mm', near(y1, (lam * L) / d, 1e-4), (y1 * 1e3).toFixed(4));
  // the dark fringes are dark because the waves cancel: block one slit and light arrives there
  const s0 = W.darkSinTwo(0, d, lam);
  check('a dark fringe of two slits is lit when one slit is covered', W.slitsIntensity(p, s0) < 1e-20 && W.slitsIntensity({ N: 1, a: 0, lambda: lam }, s0) === 1);
  // with real slit width the pattern is the single-slit envelope times the fringes
  const pw = { N: 2, d: 0.25e-3, a: 0.05e-3, lambda: lam };
  const s3 = W.brightSin(3, pw.d, lam);
  check('wide slits: the m = 3 fringe is dimmed by the envelope (sin β/β)²', near(W.slitsIntensity(pw, s3), W.singleSlit(pw.a, lam, s3), 1e-9) && W.slitsIntensity(pw, s3) < 0.6);
  const pm = { N: 2, d: 0.2e-3, a: 0.05e-3, lambda: lam }, s4 = W.brightSin(4, pm.d, lam);
  check('missing order: d = 4a puts the m = 4 fringe on the envelope’s first zero', W.slitsIntensity(pm, s4) < 1e-20);
}

// ─── a single slit: minima at a sin θ = mλ, central peak twice as wide ─────
{
  const a = 40e-6, lam = 550e-9, p = { N: 1, a, lambda: lam };
  const mn = zeros((s) => W.slitsIntensity(p, s), -0.06, 0.06);
  const want = [-4, -3, -2, -1, 1, 2, 3, 4].map((m) => W.darkSinSingle(m, a, lam));
  check('single slit: the zeros of the phasor sum sit at a sin θ = mλ (m ≠ 0)', mn.length === want.length && mn.every((s, i) => near(s, want[i], 1e-6)), mn.map((s) => (s * a / lam).toFixed(4)).join(' '));
  check('…and there is no zero at θ = 0', W.slitsIntensity(p, 0) === 1);
  const mx = maxima((s) => W.slitsIntensity(p, s), 1e-4, 0.05);
  check('side maxima lie near (m + ½)λ/a, slightly inside: 1.430 and 2.459', near((mx[0] * a) / lam, 1.4303, 1e-3) && near((mx[1] * a) / lam, 2.4590, 1e-3), mx.slice(0, 2).map((s) => (s * a / lam).toFixed(4)).join(' '));
  check('…and the first is 4.7% of the centre', near(W.slitsIntensity(p, mx[0]), 0.04719, 1e-3), W.slitsIntensity(p, mx[0]).toFixed(5));
  check('halving the slit doubles the angle to the first minimum', near(W.darkSinSingle(1, a / 2, lam), 2 * W.darkSinSingle(1, a, lam)));
}

// ─── gratings: same maxima, sharper with N; N − 2 small peaks between ──────
{
  const d = 1e-3 / 600, lam = 589e-9;                          // 600 lines per mm
  check('600 lines/mm, 589 nm: first order at 20.70°', near(Math.asin(W.brightSin(1, d, lam)) * 180 / Math.PI, 20.6954, 1e-5));
  check('…and no fourth order (d sin θ = 4λ needs sin θ > 1)', Number.isNaN(W.brightSin(4, d, lam)));
  for (const N of [2, 5, 10]) {
    const p = { N, d, a: 0, lambda: lam };
    const s1 = W.brightSin(1, d, lam);
    const mx = maxima((s) => W.slitsIntensity(p, s), 0.02 * s1, 0.98 * s1, 20000);
    check(`${N} slits: ${N - 2} secondary maxima between principal maxima`, mx.length === N - 2, mx.length);
    // the first zero beside a principal maximum: Δ(sin θ) = λ/(Nd)
    const z = zeros((s) => W.slitsIntensity(p, s), 0.0001 * s1, 1.5 * lam / (N * d), 20000);
    check(`${N} slits: the principal peak’s half-width is λ/(Nd)`, z.length && near(z[0], lam / (N * d), 1e-5), z[0]);
  }
  check('resolving power mN: 1000 lines in first order split 589.0 and 589.6 nm', W.resolvingPower(1, 1000) > 589.3 / 0.6 && W.resolvingPower(1, 900) < 589.3 / 0.6);
}

// ─── circular apertures: the Airy pattern and the Rayleigh criterion ───────
{
  check('J₁(1) = 0.4400505857', near(W.besselJ1(1), 0.4400505857, 1e-9));
  check('J₁(5) = −0.3275791376', near(W.besselJ1(5), -0.3275791376, 1e-9));
  check('J₁(30) = −0.1187510626', near(W.besselJ1(30), -0.1187510626, 1e-8), W.besselJ1(30));
  // against the power series Σ (−1)^k (x/2)^(2k+1)/(k!(k+1)!)
  const series = (x) => { let t = x / 2, s = t; for (let k = 1; k < 60; k++) { t *= -(x * x) / 4 / (k * (k + 1)); s += t; } return s; };
  let worst = 0;
  for (let x = 0; x < 15; x += 0.37) worst = Math.max(worst, Math.abs(W.besselJ1(x) - series(x)));
  check('J₁ by quadrature matches its power series', worst < 1e-10, worst);
  for (const z of [3.831705970207512, 7.015586669815619, 10.17346813506272]) check(`J₁ vanishes at ${z.toFixed(4)}`, Math.abs(W.besselJ1(z)) < 1e-12);
  let wf = 0;
  for (let x = 0; x < 79; x += 0.0137) wf = Math.max(wf, Math.abs(W.besselJ1Fast(x) - W.besselJ1(x)));
  check('the fast J₁ table agrees to 1e-5', wf < 1e-5, wf);
  const D = 2.4, lam = 500e-9;
  let worstAiry = 0;
  for (let k = 0; k <= 30; k++) { const s = (k * 0.1 * lam) / D; worstAiry = Math.max(worstAiry, Math.abs(W.airySum(D, lam, s, 200) - W.airy(D, lam, s))); }
  check('the Airy pattern is the sum of phasors over the disc ([2J₁(x)/x]²)', worstAiry < 3e-3, worstAiry.toExponential(2));
  const z = zeros((s) => W.airy(D, lam, s), 0.2 * lam / D, 1.6 * lam / D, 4000, 1e-12);
  check('first dark ring at sin θ = 1.21967 λ/D', z.length === 1 && near(z[0] / (lam / D), 1.21967, 1e-5), z.map((s) => s / (lam / D)));
  const zs = zeros((s) => W.airySum(D, lam, s, 240), 0.9 * lam / D, 1.5 * lam / D, 300, 1e-3);
  check('…and the brute-force phasor sum puts it there too (within 1%)', zs.length >= 1 && Math.abs(zs[0] / (lam / D) - 1.22) < 0.012, zs.map((s) => s / (lam / D)));
  check('a slit of the same width has its first zero at λ/D: the round aperture spreads light 22% more', W.AIRY_FIRST_ZERO > 1.2 && W.AIRY_FIRST_ZERO < 1.23);
  const th = W.rayleigh(D, lam);
  check('Hubble at 500 nm resolves 0.052″', near((th * 180 / Math.PI) * 3600, 0.0524, 0.01), (th * 206265).toFixed(4));
  check('JWST (6.5 m) at 2 µm resolves 0.077″', near(W.rayleigh(6.5, 2e-6) * 206265, 0.0774, 0.01), (W.rayleigh(6.5, 2e-6) * 206265).toFixed(4));
  const eht = W.rayleigh(1.07e7, 1.3e-3) * 206265e6;
  check('an Earth-sized dish at 1.3 mm resolves about 30 µas', eht > 29 && eht < 32, eht.toFixed(2));
  // two stars at the Rayleigh separation: the dip between them is 73.5% of the peaks
  const mid = W.twoSources(D, lam, th, 0), peak = W.twoSources(D, lam, th, th / 2);
  check('two stars at the Rayleigh separation: the dip between them is 73.5%', near(mid / peak, 0.735, 3e-3), (mid / peak).toFixed(4));
  check('closer than that, the dip fades: at 0.7 of it the pair looks like one blob', W.twoSources(D, lam, 0.7 * th, 0) >= W.twoSources(D, lam, 0.7 * th, 0.35 * th));
  check('magnifying the image does not change the dip: it is a ratio of the pattern itself', (() => { const k = 4, a = W.twoSources(D, lam, th, 0) / W.twoSources(D, lam, th, th / 2); return near(a, mid / peak); })());
}

// ─── thin films ────────────────────────────────────────────────────────────
{
  check('a film of zero thickness reflects like the bare surface', near(W.filmReflectance({ n0: 1, n1: 1.38, n2: 1.52, t: 0, lambda: 550 }), W.bareReflectance(1, 1.52)));
  check('bare glass reflects 4.3% at normal incidence', near(W.bareReflectance(1, 1.52), 0.04257, 1e-3));
  const nc = W.idealCoatingIndex(1, 1.52), tq = W.quarterWave(550, nc);
  check('quarter-wave coating of index √(n₀n₂) reflects nothing at its design wavelength', W.filmReflectance({ n0: 1, n1: nc, n2: 1.52, t: tq, lambda: 550 }) < 1e-20);
  const tMg = W.quarterWave(550, 1.38), Rmg = W.filmReflectance({ n0: 1, n1: 1.38, n2: 1.52, t: tMg, lambda: 550 });
  check('a real MgF₂ quarter-wave (99.6 nm) cuts glass’s 4.3% to 1.3%', near(tMg, 99.64, 1e-3) && near(Rmg, 0.0126, 0.02), Rmg.toFixed(5));
  check('…and reflects more at the ends of the spectrum (the purple tint)', W.filmReflectance({ n0: 1, n1: 1.38, n2: 1.52, t: tMg, lambda: 420 }) > Rmg && W.filmReflectance({ n0: 1, n1: 1.38, n2: 1.52, t: tMg, lambda: 700 }) > Rmg);
  check('a half-wave layer is absent at its wavelength', near(W.filmReflectance({ n0: 1, n1: 1.38, n2: 1.52, t: 2 * tMg, lambda: 550 }), W.bareReflectance(1, 1.52), 1e-9));
  // a soap film in air: one phase flip, so a vanishing film is black
  const soap = (t, l) => W.filmReflectance({ n0: 1, n1: 1.33, n2: 1, t, lambda: l });
  check('a soap film thinning to nothing turns black (R → 0)', soap(1, 550) < 1e-4 && soap(0, 550) < 1e-20);
  check('soap film: one phase flip', W.phaseFlips(1, 1.33, 1) === 1);
  check('coating on glass (1 → 1.38 → 1.52): two flips', W.phaseFlips(1, 1.38, 1.52) === 2);
  const mx = maxima((t) => soap(t, 600), 1, 800);
  check('soap film: bright reflection at 2nt = (m + ½)λ', mx.length >= 3 && mx.every((t, m) => near(2 * 1.33 * t, (m + 0.5) * 600, 1e-6)), mx.map((t) => (2 * 1.33 * t / 600).toFixed(4)).join(' '));
  check('…the brightest reflection of a soap film is 7.7%', near(W.filmMaxReflectance(1, 1.33, 1), 0.07690, 1e-3) && near(soap(mx[0], 600), W.filmMaxReflectance(1, 1.33, 1), 1e-9));
  // energy: s and p each between 0 and 1 at an angle
  let ok = true;
  for (let t = 0; t < 900; t += 37) for (const pol of ['s', 'p']) { const R = W.filmReflectance({ n0: 1, n1: 1.33, n2: 1.52, t, lambda: 500, theta0: 0.6, pol }); if (!(R >= 0 && R <= 1)) ok = false; }
  check('reflectance stays between 0 and 1 at an angle', ok);
  check('tilting a film shifts its colours toward shorter wavelengths: 2nt cos θ₁ = (m + ½)λ', (() => { const f = (th) => maxima((l) => W.filmReflectance({ n0: 1, n1: 1.33, n2: 1, t: 400, lambda: l, theta0: th }), 500, 750)[0]; const c1 = Math.sqrt(1 - (Math.sin(0.7) / 1.33) ** 2); return near(f(0), 2 * 1.33 * 400 / 1.5, 1e-3) && near(f(0.7), 2 * 1.33 * 400 * c1 / 1.5, 1e-3); })());
  // colours
  const white = W.reflectedColor(() => 1), black = W.reflectedColor(() => 0);
  check('a perfect reflector shows white, a black body black', white.every((c) => c === 255) && black.every((c) => c === 0), white + ' ' + black);
  const thin = W.filmColor({ n0: 1, n1: 1.33, n2: 1, t: 5 });
  check('a 5 nm soap film looks black', thin.every((c) => c < 40), thin);
  const yellow = W.filmColor({ n0: 1, n1: 1.33, n2: 1, t: 150 }), blue = W.filmColor({ n0: 1, n1: 1.33, n2: 1, t: 240 });
  check('Newton’s scale: a 150 nm soap film looks yellow (first order)', yellow[0] > 200 && yellow[1] > 150 && yellow[2] < 120, yellow);
  check('…a 240 nm one blue (second order)', blue[2] > 200 && blue[0] < 60, blue);
  check('spectral colours: 650 nm is red, 530 nm green, 460 nm blue', (() => { const r = W.wavelengthRGB(650), g = W.wavelengthRGB(530), b = W.wavelengthRGB(460); return r[0] > 200 && r[1] < 60 && g[1] > 200 && g[0] < 200 && b[2] > 200 && b[0] < 60; })());
  check('no display colour outside the visible range', W.wavelengthRGB(1064) === null && W.wavelengthRGB(300) === null);
  const ybar = W.cmf(555)[1];
  check('the eye’s sensitivity ȳ peaks near 555 nm', ybar > 0.99 && W.cmf(500)[1] < 0.4 && W.cmf(650)[1] < 0.15);
}

// ─── the Michelson interferometer ──────────────────────────────────────────
{
  const lam = 633e-9;
  check('balanced arms: bright', W.michelson(0, lam) === 1);
  check('a mirror moved λ/4 makes it dark (path changes by λ/2)', W.michelson(lam / 4, lam) < 1e-30);
  check('…and λ/2 makes it bright again: one whole fringe', near(W.michelson(lam / 2, lam), 1));
  // count the bright fringes passing as a mirror moves 10 µm
  let count = 0, prev = W.michelson(0, lam), rising = false;
  for (let i = 1; i <= 200000; i++) {
    const v = W.michelson((10e-6 * i) / 200000, lam);
    if (v > prev) rising = true; else if (rising && v < prev) { count++; rising = false; }
    prev = v;
  }
  check('moving a mirror 10 µm sweeps 2ΔL/λ = 31.6 fringes past the detector', count === Math.floor(W.fringeCount(10e-6, lam)), `${count} vs ${W.fringeCount(10e-6, lam)}`);
  check('the rings: bright at the centre when 2d = mλ, and the first ring at cos θ = (m − 1)λ/(2d)', (() => {
    const d = 1e-3 + lam / 4 * 0;                         // 2d/λ = 3159.56…: choose d with 2d = mλ exactly
    const m = Math.round((2 * 1e-3) / lam), dd = (m * lam) / 2;
    const th1 = Math.acos(((m - 1) * lam) / (2 * dd));
    return near(W.michelsonRing(dd, lam, 0), 1) && near(W.michelsonRing(dd, lam, th1), 1) && W.michelsonRing(dd, lam, th1 / 2) < 1 && d > 0;
  })());
  check('a gas cell: 2·L·Δn/λ fringes', near(W.gasFringes(0.05, 2.9e-4, lam), 45.8, 1e-3));
  // LIGO: arm changes far smaller than a fringe still change the output a little
  const h = 1e-21, L = 4000, dL = h * L;
  check('LIGO: h = 10⁻²¹ over 4 km is ΔL = 4×10⁻¹⁸ m, about 10⁻¹² of a fringe', near(dL, 4e-18) && W.fringeCount(dL, 1064e-9) < 1e-11);
}

// ─── polarizers ────────────────────────────────────────────────────────────
{
  const d = Math.PI / 180;
  check('unpolarized light through one polarizer: half', near(W.polarizerChain([30 * d])[0], 0.5, 1e-12));
  check('crossed polarizers pass nothing', W.polarizerChain([0, 90 * d])[1] < 1e-30);
  check('a third polarizer at 45° between them lets I₀/8 through', near(W.polarizerChain([0, 45 * d, 90 * d])[2], 0.125, 1e-12));
  let worst = 0;
  for (let k = 0; k < 40; k++) {
    const a = (k * 37) % 180, b = (k * 71) % 180, c = (k * 13) % 180;
    const ch = W.polarizerChain([a * d, b * d, c * d]);
    const ex = [0.5, W.malus(0.5, (b - a) * d), W.malus(W.malus(0.5, (b - a) * d), (c - b) * d)];
    worst = Math.max(worst, ...ch.map((v, i) => Math.abs(v - ex[i])));
  }
  check('Jones vectors through any three polarizers agree with Malus’s law, step by step', worst < 1e-12, worst);
  check('polarized light at 60° to the axis: cos² 60° = 1/4', near(W.polarizerChain([0], 60 * d)[0], 0.25, 1e-12));
  check('many polarizers in small steps rotate the light with little loss', W.polarizerChain(Array.from({ length: 30 }, (_, i) => ((i + 1) * 3 * d)), 0)[29] > 0.9);
}

// ─── the simulation’s parameter check ──────────────────────────────────────
for (const mode of ['slits', 'film', 'michelson', 'airy', 'polar']) check(`optics-waves validate accepts ${mode} defaults`, validate({ mode }).length === 0, validate({ mode }).join('; '));
check('optics-waves validate accepts a grating, a single slit and the EHT', validate({ mode: 'slits', N: 12, a: 0, d: 1.667 }).length === 0 && validate({ mode: 'slits', N: 1, a: 40 }).length === 0 && validate({ mode: 'airy', preset: 'eht' }).length === 0);
check('optics-waves validate rejects a single slit of no width, slits wider than their spacing, 25 slits', validate({ mode: 'slits', N: 1, a: 0 }).length > 0 && validate({ mode: 'slits', a: 200, d: 100 }).length > 0 && validate({ mode: 'slits', N: 25 }).length > 0);
check('optics-waves validate rejects a zoom of 3 and a fourth polarizer', validate({ mode: 'airy', zoom: 3 }).length > 0 && validate({ mode: 'polar', n: 4 }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
