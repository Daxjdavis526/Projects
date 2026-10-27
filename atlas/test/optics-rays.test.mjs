// The DOM-free ray-optics model behind sims/optics-rays.js: dispersion
// against catalogue indices, Snell's law, total internal reflection, the
// Fresnel reflectances (Brewster's angle, energy conservation), exact tracing
// through prisms, slabs and spherical surfaces, and paraxial imaging checked
// against the lens, mirror, surface and lensmaker equations.
//   node atlas/test/optics-rays.test.mjs

import * as O from '../src/viz/model/optics-rays.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const D = O.DEG;

// ─── materials: the Sellmeier formulas reproduce catalogue values ──────────
for (const [mat, lam, n, tol] of [
  ['crown', 587.56, 1.5168, 1e-4], ['crown', 486.13, 1.5224, 1e-4], ['crown', 656.27, 1.5143, 1e-4],
  ['flint', 587.56, 1.6200, 1e-4], ['denseflint', 587.56, 1.78472, 1e-4], ['silica', 587.56, 1.4585, 1e-4],
  ['water', 589.3, 1.3330, 5e-4], ['diamond', 589.3, 2.4175, 5e-4], ['sapphire', 589.3, 1.768, 5e-4], ['mgf2', 589.3, 1.3777, 5e-4],
]) check(`n(${mat}, ${lam} nm) = ${n}`, Math.abs(O.indexOf(mat, lam) - n) < tol, O.indexOf(mat, lam).toFixed(5));
check('Abbe number of BK7 is 64.2', Math.abs(O.abbe('crown') - 64.17) < 0.05, O.abbe('crown').toFixed(2));
check('Abbe number of F2 is 36.4', Math.abs(O.abbe('flint') - 36.37) < 0.05, O.abbe('flint').toFixed(2));
check('normal dispersion: every material bends violet more than red', ['water', 'crown', 'flint', 'denseflint', 'silica', 'diamond'].every((m) => O.indexOf(m, 400) > O.indexOf(m, 550) && O.indexOf(m, 550) > O.indexOf(m, 700)));
check('air is taken as exactly 1', O.indexOf('air', 500) === 1);
check('light in water travels at c/1.333', near(O.speedIn(O.indexOf('water')), 2.249e8, 1e-3));

// ─── Snell, the critical angle, Brewster ───────────────────────────────────
check('Snell: 30° in air into n = 1.5 refracts to 19.47°', near(O.snell(1, 1.5, 30 * D) / D, 19.4712, 1e-5));
check('Snell is reversible', near(O.snell(1.5, 1, O.snell(1, 1.5, 0.7)), 0.7));
check('glass to air beyond 41.8° gives NaN (total internal reflection)', Number.isNaN(O.snell(1.5, 1, 42 * D)) && !Number.isNaN(O.snell(1.5, 1, 41.5 * D)));
check('critical angle glass→air is asin(1/1.5) = 41.81°', near(O.criticalAngle(1.5, 1) / D, 41.8103, 1e-5));
check('no critical angle going into a denser medium', Number.isNaN(O.criticalAngle(1, 1.5)));
check('Brewster angle air→glass: atan 1.5 = 56.31°', near(O.brewster(1, 1.5) / D, 56.3099, 1e-5));
{
  const f = O.fresnel(1, 1.5, O.brewster(1, 1.5));
  check('at Brewster’s angle the p reflectance vanishes', f.Rp < 1e-20, f.Rp);
  check('…and the reflected and refracted rays are perpendicular', near(O.brewster(1, 1.5) + O.snell(1, 1.5, O.brewster(1, 1.5)), Math.PI / 2));
  check('…while s light is still reflected (14.8%)', near(f.Rs, 0.1479, 1e-3), f.Rs);
}
check('normal incidence air→glass reflects ((n−1)/(n+1))² = 4%', near(O.fresnel(1, 1.5, 0).R, 0.04));
check('normal incidence: s and p agree', near(O.fresnel(1, 1.5, 0).Rs, O.fresnel(1, 1.5, 0).Rp));
{
  let worst = 0;
  for (const [n1, n2] of [[1, 1.5], [1.5, 1], [1.33, 2.42], [1, 1.33]])
    for (let a = 0; a < 89.5; a += 2.5) {
      const f = O.fresnel(n1, n2, a * D);
      if (f.tir) continue;
      worst = Math.max(worst, Math.abs(f.Rs + f.Ts - 1), Math.abs(f.Rp + f.Tp - 1));
    }
  check('energy is conserved at every angle: R + T = 1 for s and p', worst < 1e-12, worst.toExponential(2));
}
check('grazing incidence reflects almost everything (99% at 89.9°)', O.fresnel(1, 1.5, 89.9 * D).R > 0.98);
check('beyond the critical angle R = 1', O.fresnel(1.5, 1, 50 * D).R === 1 && O.fresnel(1.5, 1, 50 * D).tir);
check('polarizing sunglasses: water’s glare at 53° is mostly s', O.reflectance(1, 1.333, 53.1 * D, 'p') < 1e-4 && O.reflectance(1, 1.333, 53.1 * D, 's') > 0.07);

// ─── vector reflection and refraction agree with the scalar laws ───────────
for (const [n1, n2, deg] of [[1, 1.5, 0], [1, 1.5, 35], [1.5, 1, 30], [1.33, 1, 45], [1, 2.42, 70]]) {
  const th = deg * D, d = [Math.sin(th), -Math.cos(th)], nrm = [0, 1];
  const t = O.refractDir(d, nrm, n1, n2);
  const exp = O.snell(n1, n2, th);
  if (Number.isNaN(exp)) check(`vector refraction ${n1}→${n2} at ${deg}° is total reflection`, t === null);
  else {
    check(`vector refraction ${n1}→${n2} at ${deg}° obeys Snell`, near(Math.asin(t[0]), exp, 1e-12) && t[1] < 0);
    check(`…its direction is a unit vector`, near(Math.hypot(t[0], t[1]), 1, 1e-12));
  }
  const r = O.reflectDir(d, nrm);
  check(`reflection at ${deg}°: angle in = angle out`, near(r[0], d[0]) && near(r[1], -d[1]));
}
check('refraction works with the normal on either side', near(O.refractDir([0.6, -0.8], [0, -1], 1, 1.5)[0], O.refractDir([0.6, -0.8], [0, 1], 1, 1.5)[0]));

// ─── exact tracing: prisms ─────────────────────────────────────────────────
{
  // a ray aimed at the middle of the left face at incidence θ₁ to its normal,
  // coming from the base side of the normal (the textbook picture)
  const fire = (A, n, th1) => {
    const sc = O.polygonScene(O.prismVerts(A, 1), n);
    const p = [-0.5 * Math.tan(A / 2), 0.5];
    const inward = [Math.cos(A / 2), -Math.sin(A / 2)];          // into the glass, perpendicular to the left face
    const c = Math.cos(th1), s = Math.sin(th1), d = [inward[0] * c - inward[1] * s, inward[0] * s + inward[1] * c];
    const o = [p[0] - 3 * d[0], p[1] - 3 * d[1]];
    return { tr: O.trace(sc, o, d), d };
  };
  const A = 50 * D, n = 1.5168;
  for (const deg of [30, 40, 60, 75]) {
    const { tr, d } = fire(A, n, deg * D);
    const out = tr.end.dir, dev = Math.acos(Math.max(-1, Math.min(1, out[0] * d[0] + out[1] * d[1])));
    const exp = O.prism(A, n, deg * D);
    check(`exact trace through a 50° BK7 prism at ${deg}° deviates by ${(exp.delta / D).toFixed(3)}°`, near(dev, exp.delta, 1e-9), `${(dev / D).toFixed(4)}°`);
    check('…crossing the two slanted faces only', tr.legs.length === 3);
    const T = (1 - O.fresnel(1, n, deg * D).R) * (1 - O.fresnel(n, 1, exp.th3).R);
    check('…keeping the power the two faces’ Fresnel transmissions allow', near(tr.end.power, T, 1e-9), `${tr.end.power} vs ${T}`);
  }
  const A6 = 60 * D;
  let best = Infinity;
  for (let a = 30; a < 89; a += 0.01) { const p = O.prism(A6, n, a * D); if (!p.tir) best = Math.min(best, p.delta); }
  check('the smallest deviation found by scanning equals 2 asin(n sin(A/2)) − A', near(best, O.minDeviation(A6, n), 1e-6), `${(best / D).toFixed(4)}° vs ${(O.minDeviation(A6, n) / D).toFixed(4)}°`);
  const sym = O.prism(A6, n, Math.asin(n * Math.sin(A6 / 2)));
  check('at minimum deviation the ray crosses the prism symmetrically (θ₂ = θ₃ = A/2)', near(sym.th2, A6 / 2) && near(sym.th3, A6 / 2));
  check('violet is deviated more than red', O.prism(A6, O.indexOf('crown', 400), 50 * D).delta > O.prism(A6, O.indexOf('crown', 700), 50 * D).delta);
  const p = O.prism(A6, n, 20 * D);
  check('at 20° incidence on a 60° prism the ray is trapped at the second face (θ₃ > critical)', p.tir && p.th3 > O.criticalAngle(n, 1));
  const { tr } = fire(A6, n, 20 * D);
  const second = tr.legs[2];
  check('…the exact trace reflects it totally there, with no loss, and out through the base', second.power === tr.legs[1].power && tr.end.dir[1] < 0 && Math.abs(tr.legs[3].a[1]) < 1e-9, JSON.stringify(tr.legs.map((l) => l.a.map((v) => +v.toFixed(3)))));
}

// ─── fibres ────────────────────────────────────────────────────────────────
{
  const acc = O.fibreAcceptance(1.48, 1.46);
  check('fibre NA = √(1.48² − 1.46²) = 0.2425', near(acc.NA, 0.24249, 1e-4));
  check('acceptance half-angle in air asin(NA) = 14.0°', near(acc.thetaMax / D, 14.034, 1e-3));
  const sc = O.fibreScene({ nCore: 1.48, nClad: 1.46, a: 0.5, b: 1, L: 60 });
  const launch = (deg) => O.trace(sc, [-2, 0], [Math.cos(deg * D), Math.sin(deg * D)], { maxHits: 400 });
  const inside = (tr) => tr.legs.every((l) => l.a[0] < 0 || l.a[0] >= 60 - 1e-9 || Math.abs(l.a[1]) <= 0.5 + 1e-9);
  check('a ray launched inside the acceptance cone (12°) stays in the core', inside(launch(12)), '');
  check('…and reaches the far end with no loss to the cladding', launch(12).legs.some((l) => l.a[0] >= 60 - 1e-9));
  check('a ray launched outside it (17°) gets into the cladding', !inside(launch(17)));
}

// ─── spherical surfaces: exact rays converge on the paraxial image ─────────
{
  const n1 = 1, n2 = 1.5, R = 10, dO = 40;
  const par = O.surfaceImage(n1, n2, R, dO);
  check('paraxial surface: n₁/d_o + n₂/d_i = (n₂ − n₁)/R', near(n1 / dO + n2 / par.dI, (n2 - n1) / R));
  const sc = O.surfaceScene(R, n1, n2, 6);
  const cross = (h) => {     // where a ray from the axial object point at aperture height h crosses the axis
    const tr = O.trace(sc, [-dO, 0], [dO, h], { maxHits: 1 });
    const { p, dir } = tr.end, leg = tr.legs[1];
    return leg.a[0] - (leg.a[1] / dir[1]) * dir[0] + 0 * p[0];
  };
  check('a near-axis ray crosses the axis at the paraxial image', near(cross(0.01), par.dI, 1e-5), `${cross(0.01)} vs ${par.dI}`);
  check('wider rays cross nearer (spherical aberration)', cross(4) < cross(2) && cross(2) < cross(0.5));
  check('a flat surface is a surface with R = ∞ (apparent depth)', near(O.surfaceImage(1.333, 1, Infinity, 2).dI, -2 / 1.333));
  check('apparent depth looking straight down: d/n', near(O.apparentDepth(2, 1.333), 1.5004, 1e-4));
  const ap = O.apparentPoint(2, 1.333, 1, 1e-4);
  check('the exact apparent point tends to depth d/n near the vertical', near(-ap.y, 2 / 1.333, 1e-6) && Math.abs(ap.x) < 1e-3, `${ap.y}`);
  const ob = O.apparentPoint(2, 1.333, 1, 50 * D);
  check('looking obliquely, the bottom seems shallower still', -ob.y < 2 / 1.333 - 0.3, `${(-ob.y).toFixed(3)}`);
  // exact trace check of the oblique image: the two neighbouring rays really leave from the object
  const a = Math.asin(Math.sin(50 * D) / 1.333);
  check('…the pencil seen at 50° left the object at asin(sin 50°/1.333) = 35.1°', near(ob.alpha / D, a / D, 1e-9) && near(a / D, 35.08, 1e-3));
}

// ─── thin lenses and mirrors ───────────────────────────────────────────────
{
  for (const [f, dO] of [[10, 30], [10, 15], [10, 5], [-10, 20], [-15, 6], [20, 20.5]]) {
    const { dI, m } = O.thinLens(f, dO);
    check(`thin lens f = ${f}, d_o = ${dO}: 1/d_o + 1/d_i = 1/f`, near(1 / dO + 1 / dI, 1 / f));
    // three principal rays from the tip of a 3-unit object meet at (d_i, m·3)
    const h = 3, el = [{ x: 0, f }];
    const rays = [O.paraxialTrace(el, -dO, h, 0), O.paraxialTrace(el, -dO, h, -h / dO), O.paraxialTrace(el, -dO, h, -h / (dO - f))];
    const yAt = (r, x) => r.y + r.slope * (x - r.x);
    check(`…the principal rays meet at the image tip (height ${(m * h).toFixed(3)})`, rays.every((r) => near(yAt(r, dI), m * h, 1e-9)));
    check(`…the focal ray leaves parallel to the axis`, Math.abs(rays[2].slope) < 1e-12);
  }
  check('object at 2f: image at 2f, inverted, same size', near(O.thinLens(10, 20).dI, 20) && near(O.thinLens(10, 20).m, -1));
  check('object inside f: virtual, upright, enlarged', O.thinLens(10, 5).dI < 0 && O.thinLens(10, 5).m > 1);
  check('a diverging lens always gives a virtual, upright, smaller image', [3, 10, 40, 200].every((d) => { const r = O.thinLens(-10, d); return r.dI < 0 && r.m > 0 && r.m < 1; }));
  check('object at f: image at infinity', O.thinLens(10, 10).dI === Infinity);
  check('a star (object at infinity) is imaged at the focal point', O.thinLens(35, Infinity).dI === 35);
  check('mirror: f = R/2', O.mirrorFocal(11.04) === 5.52);
  check('concave mirror, object beyond C: real, inverted, smaller', (() => { const r = O.mirrorImage(10, 35); return r.dI > 0 && r.m < 0 && r.m > -1; })());
  check('convex mirror (f < 0): virtual, upright, smaller', (() => { const r = O.mirrorImage(-10, 35); return r.dI < 0 && r.m > 0 && r.m < 1; })());
  check('lensmaker: symmetric biconvex R = 20 cm, n = 1.5 gives f = 20 cm', near(O.lensmaker(1.5, 20, -20), 20));
  check('lensmaker: plano-convex R = 10 cm, n = 1.5 gives f = 20 cm', near(O.lensmaker(1.5, 10, Infinity), 20));
  check('lensmaker: a glass lens in water is much weaker', O.lensmaker(1.5, 20, -20, 1.333) > 70);
  check('a lens has opposite-sign f for the reversed curvature (diverging)', near(O.lensmaker(1.5, -20, 20), -20));
  check('power: f = 0.5 m is 2 dioptres', O.power(0.5) === 2);
}

// ─── two-lens systems ──────────────────────────────────────────────────────
{
  check('afocal telescope: angular magnification −f₁/f₂', near(O.angularMagnification(100, 2.5, 102.5, 0.01), -40));
  const t = O.twoLens(100, 2.5, 102.5, Infinity);
  check('…the objective images the star at its focal point, which is the eyepiece’s focal point', near(t.i1.dI, 100) && near(t.o2, 2.5) && t.i2.dI === Infinity);
  // a microscope: f_o = 4 mm, f_e = 25 mm, objective images to 160 mm beyond its focal point
  const fo = 4, fe = 25, L = 160, dI1 = fo + L, dO = 1 / (1 / fo - 1 / dI1);
  const sys = O.twoLens(fo, fe, dI1 + fe, dO);
  check('microscope: the intermediate image falls at the eyepiece’s focal point', near(sys.o2, fe) && sys.i2.dI === Infinity);
  check('…lateral magnification of the objective is −L/f_o', near(sys.i1.m, -L / fo));
  // angular magnification against the near point: final angle / (object height / 250 mm)
  const h = 0.01, r = O.paraxialTrace([{ x: 0, f: fo }, { x: dI1 + fe, f: fe }], -dO, h, -h / dO);
  check('…overall angular magnification (L/f_o)(250 mm/f_e) = 400', near(Math.abs(r.slope) / (h / 250), 400, 1e-9), (Math.abs(r.slope) / (h / 250)).toFixed(3));
  check('a two-lens chain multiplies magnifications', (() => { const s = O.twoLens(10, 10, 50, 15); return near(s.m, s.i1.m * s.i2.m) && near(s.i2.dI, O.thinLens(10, 50 - O.thinLens(10, 15).dI).dI); })());
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
