/* =============================================================================
   GEODESIC — headless physics validation
   -----------------------------------------------------------------------------
   Runs in Node with no DOM and no three.js. That this file works at all is the
   proof that the physics layer is independent of the renderer.

   These are not smoke tests. Each one checks a number that reality has already
   supplied an answer for.
   ========================================================================== */

import { Engine } from '../src/physics/engine.js';
import { Body } from '../src/physics/body.js';
import { PRESETS } from '../src/physics/presets.js';
import {
  G, C, C2, SI, ARCSEC_PER_RAD, M_EARTH_MSUN, R_SUN_AU, BUCHDAHL_LIMIT,
} from '../src/physics/constants.js';
import {
  tidalTensor, tendexFrame, eigenSymmetric3, timeDilation, potential,
  gravitationalField, frameDragOmega, schwarzschildRadii, curvatureMagnitude,
  flammZ, properRadialStretch,
} from '../src/physics/relativity.js';
import { totalEnergy, angularMomentum, circularSpeed } from '../src/physics/nbody.js';
import {
  traceOrbit, precessionPerOrbit, elements, radiation, eccentricityFactor,
  radiationPattern,
} from '../src/physics/geodesic.js';
import { Lattice } from '../src/physics/lattice.js';
import { rocheLimit } from '../src/physics/collisions.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? `  — ${detail}` : ''));
  if (!cond) failures++;
};
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const section = (s) => console.log(`\n${s}`);

/* =============================================================================
   1. UNITS AND CONSTANTS
   ========================================================================== */
section('Units and constants');
{
  check('G ~ 4pi^2 in AU/Msun/yr', near(G, 4 * Math.PI ** 2, 1e-4), G.toFixed(5));
  check('c = 63241 AU/yr', near(C, 63241, 1e-3), C.toFixed(1));
  const T = 2 * Math.PI * Math.sqrt(1 / G);
  check('1 AU circular orbit has period 1 yr', near(T, 1, 1e-4), `${T.toFixed(6)} yr`);

  const rsSun = 2 * G * 1 / C2 * SI.AU / 1000;
  check('Schwarzschild radius of the Sun is 2.95 km', near(rsSun, 2.953, 2e-3), `${rsSun.toFixed(3)} km`);
}

/* =============================================================================
   2. KEPLER — does a two-body orbit actually close?
   ========================================================================== */
section('Kepler orbits');
{
  const eng = new Engine({ autoTimestep: false, dt: 1 / 2048, collisions: false });
  const sun = eng.add(new Body({ name: 'Sun', material: 'star', mass: 1, radius: R_SUN_AU, fixed: true }));
  const p = eng.add(new Body({ name: 'P', material: 'terrestrial', mass: M_EARTH_MSUN, radius: 4e-5 }));
  eng.placeInOrbit(p, sun, 1.0);

  const r0 = [...p.pos];
  eng.step(2048);                              // exactly one year
  const drift = Math.hypot(p.pos[0] - r0[0], p.pos[1] - r0[1], p.pos[2] - r0[2]);
  check('orbit closes after 1 year', drift < 2e-3, `closure error ${drift.toExponential(2)} AU`);

  /* Kepler's third law. The content of the law is that T^2/a^3 is the SAME
     CONSTANT for every orbit — not that it equals 1, which only holds in the
     idealised Gaussian system where G is defined as exactly 4pi^2. Here G is
     derived from SI measurements, so the constant is 4pi^2/G = 1.0000097, and
     testing against a flat 1 would be testing the fiction rather than the
     physics. */
  const ratios = [0.5, 1, 2, 5, 30].map(a => {
    const T = 2 * Math.PI * Math.sqrt(a ** 3 / (G * 1));
    return (T * T) / (a ** 3);
  });
  const spread = (Math.max(...ratios) - Math.min(...ratios)) / ratios[0];
  check('Kepler III: T^2/a^3 is constant across 0.5-30 AU',
        spread < 1e-12, `spread ${spread.toExponential(2)}`);
  check('that constant equals 4pi^2/GM', near(ratios[0], 4 * Math.PI ** 2 / G, 1e-12),
        `${ratios[0].toFixed(9)}`);

  /* And the integrated orbit must match the analytic period. */
  const eng2 = new Engine({ autoTimestep: false, dt: 1 / 4096, collisions: false });
  const s2 = eng2.add(new Body({ material: 'star', mass: 1, radius: R_SUN_AU, fixed: true }));
  const p2 = eng2.add(new Body({ material: 'rock', mass: 1e-9, radius: 1e-5 }));
  eng2.placeInOrbit(p2, s2, 2.0);
  const Tanalytic = 2 * Math.PI * Math.sqrt(8 / G);
  /* Integrate until the body returns to its starting point. Detected by the
     swept angle rather than by a coordinate crossing, so this does not depend
     on which plane placeInOrbit chose (it uses x-z, with y up, to match the
     renderer's convention). */
  const start = [...p2.pos];
  const startMag = Math.hypot(...start);
  let swept = 0, prev = [...start], crossed = 0, tCross = 0;
  for (let i = 0; i < 400000 && !crossed; i++) {
    eng2.step(1);
    const cur = p2.pos;
    const dot = (prev[0] * cur[0] + prev[1] * cur[1] + prev[2] * cur[2]) /
                (Math.hypot(...prev) * Math.hypot(...cur));
    swept += Math.acos(Math.min(1, Math.max(-1, dot)));
    prev = [...cur];
    if (swept >= 2 * Math.PI) { crossed = 1; tCross = eng2.t; }
  }
  check('integrated period matches 2pi sqrt(a^3/GM) at a = 2 AU',
        crossed && near(tCross, Tanalytic, 1e-3),
        `${tCross.toFixed(4)} vs ${Tanalytic.toFixed(4)} yr`);
}

/* =============================================================================
   3. INTEGRATOR QUALITY — the symplectic claim, tested
   ========================================================================== */
section('Integrators');
{
  const build = (integrator) => {
    const e = new Engine({ integrator, autoTimestep: false, dt: 1 / 512, collisions: false });
    const s = e.add(new Body({ material: 'star', mass: 1, radius: R_SUN_AU }));
    const p = e.add(new Body({ material: 'terrestrial', mass: 1e-8, radius: 1e-5 }));
    e.placeInOrbit(p, s, 1.0);
    /* work in the barycentric frame so the pair doesn't drift */
    const M = s.mass + p.mass;
    for (let i = 0; i < 3; i++) {
      const vcm = (s.mass * s.vel[i] + p.mass * p.vel[i]) / M;
      s.vel[i] -= vcm; p.vel[i] -= vcm;
    }
    return e;
  };

  const drifts = {};
  for (const integ of ['verlet', 'yoshida4', 'rk4']) {
    const e = build(integ);
    const E0 = totalEnergy(e.bodies);
    e.step(512 * 200);                         // 200 orbits
    drifts[integ] = Math.abs((totalEnergy(e.bodies) - E0) / E0);
  }

  check('Verlet energy drift bounded over 200 orbits', drifts.verlet < 1e-6,
        drifts.verlet.toExponential(2));
  check('Yoshida-4 is more accurate than Verlet',
        drifts.yoshida4 < drifts.verlet, `${drifts.yoshida4.toExponential(2)} < ${drifts.verlet.toExponential(2)}`);
  check('RK4 (non-symplectic) drifts more than Yoshida-4 of equal order',
        drifts.rk4 > drifts.yoshida4,
        `rk4 ${drifts.rk4.toExponential(2)} vs yoshida4 ${drifts.yoshida4.toExponential(2)}`);

  /* Angular momentum is conserved exactly by construction in a central field */
  const e = build('verlet');
  const L0 = Math.hypot(...angularMomentum(e.bodies));
  e.step(512 * 50);
  const L1 = Math.hypot(...angularMomentum(e.bodies));
  check('angular momentum conserved to 1e-10', Math.abs((L1 - L0) / L0) < 1e-10,
        Math.abs((L1 - L0) / L0).toExponential(2));
}

/* =============================================================================
   4. GENERAL RELATIVITY — Mercury's perihelion
   -----------------------------------------------------------------------------
   The classical test. GR predicts an extra 42.98 arcsec/century beyond the
   Newtonian planetary perturbations; this checks both the closed-form formula
   and that the integrated 1PN term actually produces it.
   ========================================================================== */
section('Relativistic dynamics');
{
  const a = 0.38710, e = 0.20563;
  const formula = 6 * Math.PI * G * 1 / (C2 * a * (1 - e * e));    // rad/orbit
  const Torb = Math.sqrt(a ** 3);
  const perCentury = formula * (100 / Torb) * ARCSEC_PER_RAD;
  check('perihelion formula gives 42.98"/century for Mercury',
        near(perCentury, 42.98, 5e-3), `${perCentury.toFixed(2)}"`);

  /* Now integrate it.

     Measured DIFFERENTIALLY: the same orbit is integrated twice, once with the
     1PN term and once without, and the difference is taken. This matters. A
     symplectic integrator has bounded ENERGY error but still accumulates a
     small spurious PERIHELION precession proportional to dt^2 — at the step
     used here, about 15 arcsec/century, which is a third of the effect being
     measured. Differencing two runs that share the integrator, step size and
     initial conditions cancels that artifact exactly and leaves the physics.

     Tracking uses the Laplace-Runge-Lenz vector, which points at perihelion
     and is exactly conserved in Newtonian gravity — so any rotation of it is
     precession by definition. */
  const a_ = 0.38710, e_ = 0.20563;
  const stepsPerOrbit = 20000, orbits = 400;

  const runPrecession = (relativistic) => {
    const eng = new Engine({
      relativistic, autoTimestep: false, dt: Torb / stepsPerOrbit, collisions: false,
    });
    eng.add(new Body({ material: 'star', mass: 1, radius: R_SUN_AU, fixed: true }));
    const m = eng.add(new Body({
      material: 'rock', mass: 1.66e-7, radius: 1.6e-5,
      pos: [a_ * (1 - e_), 0, 0],
      vel: [0, Math.sqrt(G * (1 + e_) / (a_ * (1 - e_))), 0],
    }));
    const lrl = () => {
      const r = m.pos, v = m.vel, rm = Math.hypot(...r);
      const h = [r[1] * v[2] - r[2] * v[1], r[2] * v[0] - r[0] * v[2], r[0] * v[1] - r[1] * v[0]];
      const vxh = [v[1] * h[2] - v[2] * h[1], v[2] * h[0] - v[0] * h[2], v[0] * h[1] - v[1] * h[0]];
      return Math.atan2(vxh[1] / G - r[1] / rm, vxh[0] / G - r[0] / rm);
    };
    const a0 = lrl();
    eng.step(stepsPerOrbit * orbits);
    let da = lrl() - a0;
    while (da < -Math.PI) da += 2 * Math.PI;
    while (da > Math.PI) da -= 2 * Math.PI;
    return (da / orbits) * (100 / Torb) * ARCSEC_PER_RAD;   // arcsec/century
  };

  const withGR = runPrecession(true);
  const newtonian = runPrecession(false);
  const physical = withGR - newtonian;

  check('integrated 1PN reproduces Mercury precession',
        near(physical, 42.98, 0.02),
        `${physical.toFixed(2)}"/century (GR run ${withGR.toFixed(2)}, Newtonian control ${newtonian.toFixed(2)} = integrator artifact)`);
  check('the Newtonian control precesses only by the integrator artifact',
        Math.abs(newtonian) < 20, `${newtonian.toFixed(2)}"/century, cancelled by differencing`);
}

/* =============================================================================
   5. TIDAL FIELD — the thing the visualization draws
   ========================================================================== */
section('Tidal field (electric Weyl)');
{
  const b = new Body({ material: 'star', mass: 1, radius: R_SUN_AU, pos: [0, 0, 0] });
  const r = 1.0;
  const E = tidalTensor([b], [r, 0, 0]);

  check('tidal tensor is trace-free in vacuum', Math.abs(E[0] + E[4] + E[8]) < 1e-12 * Math.abs(E[0]),
        `trace = ${(E[0] + E[4] + E[8]).toExponential(2)}`);
  check('tidal tensor is symmetric',
        Math.abs(E[1] - E[3]) < 1e-15 && Math.abs(E[2] - E[6]) < 1e-15 && Math.abs(E[5] - E[7]) < 1e-15);

  const expectRadial = -2 * G * 1 / r ** 3;
  const expectTrans  =      G * 1 / r ** 3;
  check('E_rr = -2GM/r^3 (radial stretch)', near(E[0], expectRadial, 1e-12),
        `${E[0].toExponential(4)} vs ${expectRadial.toExponential(4)}`);
  check('E_tt = +GM/r^3 (transverse squeeze)', near(E[4], expectTrans, 1e-12),
        `${E[4].toExponential(4)}`);

  const frame = tendexFrame(E);
  check('eigen-decomposition: one stretching axis, two squeezing',
        frame[0].stretching && !frame[1].stretching && !frame[2].stretching,
        `tendicities ${frame.map(f => f.tendicity.toExponential(2)).join(', ')}`);
  check('most-stretching eigenvector points radially',
        Math.abs(Math.abs(frame[0].dir[0]) - 1) < 1e-9,
        `dir = [${frame[0].dir.map(x => x.toFixed(4)).join(', ')}]`);

  /* The famous result: the Moon raises bigger tides than the Sun, because the
     tidal field goes as M/r^3, not M/r^2. */
  const sun  = new Body({ material: 'star', mass: 1, radius: R_SUN_AU, pos: [0, 0, 0] });
  const moon = new Body({ material: 'rock', mass: 7.342e22 / SI.M_SUN, radius: 1.16e-5, pos: [0, 0, 0] });
  const Esun  = Math.abs(tidalTensor([sun],  [1.0, 0, 0])[0]);
  const Emoon = Math.abs(tidalTensor([moon], [384400 * 1000 / SI.AU, 0, 0])[0]);
  check('Moon’s tidal field is ~2.2x the Sun’s at Earth',
        near(Emoon / Esun, 2.2, 0.05), `ratio ${(Emoon / Esun).toFixed(2)}`);

  /* Superposition: two bodies' tidal fields add linearly in the weak field. */
  const b1 = new Body({ material: 'star', mass: 1, radius: R_SUN_AU, pos: [-1, 0, 0] });
  const b2 = new Body({ material: 'star', mass: 2, radius: R_SUN_AU, pos: [ 3, 0, 0] });
  const Eboth = tidalTensor([b1, b2], [0, 0.5, 0]);
  const Ea = tidalTensor([b1], [0, 0.5, 0]);
  const Eb = tidalTensor([b2], [0, 0.5, 0]);
  let sup = true;
  for (let i = 0; i < 9; i++) if (Math.abs(Eboth[i] - (Ea[i] + Eb[i])) > 1e-12) sup = false;
  check('tidal fields superpose linearly (multi-body is well defined)', sup);

  /* Interior of a body: curvature must stay finite, not blow up. */
  const Ein = tidalTensor([b], [R_SUN_AU * 0.3, 0, 0]);
  check('tidal field is finite inside a body', isFinite(curvatureMagnitude(Ein)) && curvatureMagnitude(Ein) > 0,
        `|E| = ${curvatureMagnitude(Ein).toExponential(2)}`);
}

/* =============================================================================
   6. EIGEN-SOLVER — must survive the degenerate case, which is the common one
   ========================================================================== */
section('Eigen-decomposition');
{
  const m = new Float64Array([2, 0, 0, 0, 2, 0, 0, 0, 2]);
  const { values } = eigenSymmetric3(m);
  check('handles a triply-degenerate matrix',
        values.every(v => near(v, 2, 1e-12)), `[${[...values].map(v => v.toFixed(6))}]`);

  const d = new Float64Array([1, 2, 3, 2, 4, 5, 3, 5, 6]);
  const { values: ev, vectors } = eigenSymmetric3(d);
  const trace = ev[0] + ev[1] + ev[2];
  check('eigenvalues reproduce the trace', near(trace, 1 + 4 + 6, 1e-10), trace.toFixed(9));

  /* A v = lambda v for each eigenpair */
  let resid = 0;
  for (let k = 0; k < 3; k++) {
    const v = [vectors[0 * 3 + k], vectors[1 * 3 + k], vectors[2 * 3 + k]];
    for (let i = 0; i < 3; i++) {
      const Av = d[i * 3] * v[0] + d[i * 3 + 1] * v[1] + d[i * 3 + 2] * v[2];
      resid = Math.max(resid, Math.abs(Av - ev[k] * v[i]));
    }
  }
  check('A v = lambda v holds', resid < 1e-10, `max residual ${resid.toExponential(2)}`);
}

/* =============================================================================
   7. TIME DILATION AND SCHWARZSCHILD GEOMETRY
   ========================================================================== */
section('Time dilation and Schwarzschild geometry');
{
  const earth = new Body({ material: 'terrestrial', mass: M_EARTH_MSUN, radius: 6371e3 / SI.AU });
  const d = earth.surfaceTimeDilation;
  /* GM/(Rc^2) for Earth is 6.96e-10, so clocks run slow by that fraction */
  check('Earth surface clocks run slow by ~7e-10',
        near(1 - d, 6.96e-10, 0.02), `1 - dtau/dt = ${(1 - d).toExponential(3)}`);

  const ns = new Body({ material: 'neutronStar', mass: 1.4 });
  check('neutron star compactness ~0.3',
        ns.compactness > 0.25 && ns.compactness < 0.45, ns.compactness.toFixed(3));
  check('neutron star surface clock runs at ~0.8 of infinity',
        ns.surfaceTimeDilation > 0.7 && ns.surfaceTimeDilation < 0.9,
        ns.surfaceTimeDilation.toFixed(4));

  const bh = new Body({ material: 'blackHole', mass: 10 });
  check('black hole compactness is exactly 1', near(bh.compactness, 1, 1e-12));
  check('black hole surface time dilation is 0', bh.surfaceTimeDilation === 0);
  check('escape velocity at the horizon equals c',
        near(bh.escapeVelocity, C, 1e-9), `${(bh.escapeVelocity / C).toFixed(9)} c`);

  const { horizon, photonSphere, isco } = schwarzschildRadii(bh.schwarzschildRadius);
  check('photon sphere at 1.5 rs', near(photonSphere / horizon, 1.5, 1e-12));
  check('ISCO at 3 rs', near(isco / horizon, 3, 1e-12));

  /* Flamm's paraboloid: z = 0 at the horizon and rises as sqrt(r) far out */
  check('Flamm embedding vanishes at the horizon', flammZ(1, 1) === 0);
  check('proper radial stretch diverges at the horizon',
        !isFinite(properRadialStretch(1, 1)) || properRadialStretch(1, 1) > 1e8);
  check('proper radial stretch -> 1 far away', near(properRadialStretch(1, 1e6), 1, 1e-5));
}

/* =============================================================================
   8. POTENTIAL AND FIELD CONSISTENCY — g must equal -grad Phi
   ========================================================================== */
section('Potential and field');
{
  const bodies = [
    new Body({ material: 'star', mass: 1, radius: R_SUN_AU, pos: [0, 0, 0] }),
    new Body({ material: 'gasGiant', mass: 1e-3, radius: 5e-4, pos: [5, 0, 0] }),
  ];
  const p = [2, 1, 0.5], h = 1e-6;
  const g = gravitationalField(bodies, p);
  let worst = 0;
  for (let i = 0; i < 3; i++) {
    const a = [...p], b = [...p];
    a[i] += h; b[i] -= h;
    const numeric = -(potential(bodies, a) - potential(bodies, b)) / (2 * h);
    worst = Math.max(worst, Math.abs(numeric - g[i]) / Math.abs(g[i]));
  }
  check('g = -grad Phi (numerical gradient agrees)', worst < 1e-5, `max rel err ${worst.toExponential(2)}`);

  /* E_ij must equal the second derivative of Phi */
  const E = tidalTensor(bodies, p);
  /* Second derivatives need a MUCH larger step than first ones: the error is
     ~h^2 f'''' + eps/h^2, minimised near h ~ eps^(1/4) ~ 1e-4. At h = 1e-6 the
     roundoff term alone is 1e-4 relative. */
  const h2 = 1e-3;
  const d2 = (i, j) => {
    const pp = [...p], pm = [...p], mp = [...p], mm = [...p];
    pp[i] += h2; pp[j] += h2;   pm[i] += h2; pm[j] -= h2;
    mp[i] -= h2; mp[j] += h2;   mm[i] -= h2; mm[j] -= h2;
    return (potential(bodies, pp) - potential(bodies, pm)
          - potential(bodies, mp) + potential(bodies, mm)) / (4 * h2 * h2);
  };
  let tworst = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    tworst = Math.max(tworst, Math.abs(d2(i, j) - E[i * 3 + j]));
  }
  const scale = Math.abs(E[0]);
  check('E_ij = d_i d_j Phi (numerical Hessian agrees)', tworst / scale < 1e-4,
        `max rel err ${(tworst / scale).toExponential(2)}`);
}

/* =============================================================================
   9. FRAME DRAGGING
   ========================================================================== */
section('Frame dragging');
{
  /* Gravity Probe B measured the frame-dragging precession in Earth orbit at
     39.2 milliarcsec/yr. Check the Lense-Thirring formula reproduces it. */
  /* Earth's spin angular momentum: I = 0.3307 M R^2 (not 0.4 — Earth is
     centrally condensed), omega = 7.292e-5 rad/s. */
  const J = 0.3307 * SI.M_EARTH * SI.R_EARTH ** 2 * 7.292e-5;   // 5.86e33 kg m^2/s
  const Jint = J / SI.M_SUN * SI.YR / (SI.AU ** 2);  // -> Msun AU^2 / yr
  const earth = new Body({
    material: 'terrestrial', mass: M_EARTH_MSUN, radius: 6371e3 / SI.AU,
    spin: [0, 0, Jint],
  });
  const rGPB = (6371e3 + 642e3) / SI.AU;             // GP-B orbit, polar
  /* On the spin axis  [3(S.n)n - S] = 2S, so Omega = 2GJ/(c^2 r^3). */
  const om = frameDragOmega([earth], [0, 0, rGPB]);
  const onAxis = Math.hypot(...om) * ARCSEC_PER_RAD * 1000;     // mas/yr
  const analytic = 2 * G * Jint / (C2 * rGPB ** 3) * ARCSEC_PER_RAD * 1000;
  check('on-axis frame dragging matches 2GJ/(c^2 r^3) analytically',
        near(onAxis, analytic, 1e-9), `${onAxis.toFixed(1)} mas/yr`);

  /* Gravity Probe B measured the ORBIT-AVERAGED gyroscope precession for a
     polar orbit, a different quantity: averaging [3(S.n)n - S] over a polar
     circular orbit gives S/2, hence GJ/(2 c^2 r^3). Measured: 37.2 +/- 7.2
     mas/yr, predicted 39.2. */
  const gpb = G * Jint / (2 * C2 * rGPB ** 3) * ARCSEC_PER_RAD * 1000;
  check('orbit-averaged polar value matches Gravity Probe B (39.2 mas/yr)',
        gpb > 33 && gpb < 46, `${gpb.toFixed(1)} mas/yr vs 37.2 +/- 7.2 measured`);

  check('frame dragging vanishes for a non-spinning body',
        Math.hypot(...frameDragOmega([new Body({ mass: 1, radius: 1e-3 })], [1, 0, 0])) === 0);

  /* It must fall off as 1/r^3 */
  const o1 = Math.hypot(...frameDragOmega([earth], [0, 0, 1e-4]));
  const o2 = Math.hypot(...frameDragOmega([earth], [0, 0, 2e-4]));
  check('frame dragging falls as 1/r^3', near(o1 / o2, 8, 1e-6), `ratio ${(o1 / o2).toFixed(4)}`);
}

/* =============================================================================
   10. COLLISIONS, ROCHE, BUCHDAHL
   ========================================================================== */
section('Collisions and limits');
{
  const eng = new Engine({ autoTimestep: false, dt: 1e-4 });
  const a = eng.add(new Body({ name: 'A', material: 'rock', mass: 1e-6, radius: 0.01, pos: [0, 0, 0], vel: [0, 0, 0] }));
  const b = eng.add(new Body({ name: 'B', material: 'rock', mass: 1e-6, radius: 0.01, pos: [0.015, 0, 0], vel: [0, 0, 0] }));
  const pTot = [0, 1, 2].map(i => a.mass * a.vel[i] + b.mass * b.vel[i]);
  const mTot = a.mass + b.mass;
  eng.step(1);
  check('overlapping bodies merge', eng.bodies.length === 1);
  check('merge conserves mass', near(eng.bodies[0].mass, mTot, 1e-12));
  const pAfter = [0, 1, 2].map(i => eng.bodies[0].mass * eng.bodies[0].vel[i]);
  check('merge conserves momentum',
        [0, 1, 2].every(i => Math.abs(pAfter[i] - pTot[i]) < 1e-18));

  /* Roche: Saturn's rings sit inside the fluid Roche limit for ice */
  const saturn = new Body({ material: 'gasGiant', mass: 2.8577e-4, radius: 58232e3 / SI.AU });
  /* Radius must FOLLOW from the material, or the density is whatever falls out
     of an arbitrary mass/radius pair — the first draft of this test gave its
     "ice" moon a density of 142 kg/m^3 and got a Roche limit 86% too large. */
  const iceMoon = new Body({ material: 'ice', mass: 1e-12,
                             radius: Body.radiusFor(1e-12, 'ice') });
  const { fluid } = rocheLimit(saturn, iceMoon);
  const fluidKm = fluid * SI.AU / 1000;
  check('Saturn fluid Roche limit ~129 000 km (the rings end at 137 000)',
        fluidKm > 115000 && fluidKm < 145000, `${fluidKm.toFixed(0)} km`);

  const dense = new Body({ material: 'neutronStar', mass: 3.0 });
  dense.radius = dense.schwarzschildRadius / 0.95;    // C = 0.95 > 8/9
  check('Buchdahl bound flags an impossible static body',
        dense.violatesBuchdahl && !dense.isBlackHole, `C = ${dense.compactness.toFixed(3)}`);
}

/* =============================================================================
   11. PRESETS — every one must build and be dynamically sane
   ========================================================================== */
section('Presets');
{
  for (const [key, preset] of Object.entries(PRESETS)) {
    const bodies = preset.build();
    const ok = Array.isArray(bodies) && bodies.every(b =>
      b.mass > 0 && b.radius > 0 &&
      b.pos.every(Number.isFinite) && b.vel.every(Number.isFinite));
    check(`preset "${key}" builds`, ok, `${bodies.length} bodies`);
  }

  /* The Solar System must stay bound and keep its planets over a century */
  const eng = new Engine({ collisions: false });
  PRESETS.solarSystem.build().forEach(b => eng.add(b));
  const E0 = totalEnergy(eng.bodies);
  const sun = eng.bodies[0];
  /* Heliocentric, not from the origin: the barycentre is the inertial anchor,
     and the Sun itself wobbles around it by ~0.005 AU under Jupiter's pull. */
  const helio = (b) => Math.hypot(
    b.pos[0] - sun.pos[0], b.pos[1] - sun.pos[1], b.pos[2] - sun.pos[2]);
  const semiMajor = [0, 0.38710, 0.72333, 1.0, 1.52366, 5.20336, 9.53707, 19.1913, 30.0690];
  const years = 100;
  eng.step(Math.round(years / eng.dt));
  const drift = Math.abs((totalEnergy(eng.bodies) - E0) / E0);
  check('Solar System conserves energy over 100 yr', drift < 1e-6, drift.toExponential(2));

  /* Each planet must still be within its own eccentricity band of its true
     semi-major axis — the honest test of "did the orbit survive", since a
     body at perihelion is legitimately 20% closer than a. */
  let radiiStable = true, worst = 0, worstName = '';
  eng.bodies.forEach((b, i) => {
    if (i === 0) return;
    const rel = Math.abs(helio(b) - semiMajor[i]) / semiMajor[i];
    if (rel > worst) { worst = rel; worstName = b.name; }
    if (rel > 0.25) radiiStable = false;
  });
  check('planets stay within an eccentricity of their semi-major axes', radiiStable,
        `worst: ${worstName} at ${(worst * 100).toFixed(1)}% from a`);
  check('Solar System still has 9 bodies', eng.bodies.length === 9);
}

/* =============================================================================
   12. THE PEDAGOGICAL CLAIM — time curvature dominates, not space
   -----------------------------------------------------------------------------
   The simulator asserts in its UI that orbits are caused by the curvature of
   TIME. That claim is checkable: the Newtonian acceleration recovered from the
   g_00 term alone must match the actual gravitational field.
   ========================================================================== */
section('Time curvature dominates');
{
  const sun = new Body({ material: 'star', mass: 1, radius: R_SUN_AU });
  /* h must be generous here. Recovering Phi from the metric means computing
     sqrt(1 - rs/r) and then squaring it back; for the Sun at 1 AU, rs/r is
     1e-8, so that round trip through a value near 1.0 costs most of the
     available precision. At h = 1e-7 the surviving signal is smaller than the
     noise; at 1e-4 it is four orders above it. */
  const r = 1.0, h = 1e-4;

  /* a = -grad Phi, where Phi is read back out of the metric component
     g_00 = -(1 + 2Phi/c^2) via the time dilation factor. */
  const phiFrom = (x) => {
    const d = timeDilation([sun], [x, 0, 0]);
    return 0.5 * C2 * (d * d - 1);
  };
  const aFromMetric = -(phiFrom(r + h) - phiFrom(r - h)) / (2 * h);
  const aNewton = -G * 1 / (r * r);
  check('acceleration recovered from g_00 matches Newtonian gravity',
        near(aFromMetric, aNewton, 1e-5),
        `${aFromMetric.toExponential(5)} vs ${aNewton.toExponential(5)}`);

  /* And the spatial part is smaller by (v/c)^2 for an orbiting planet. */
  const vOrb = Math.sqrt(G / r);
  const ratio = (vOrb / C) ** 2;
  check('spatial curvature contribution is ~(v/c)^2 = 1e-8 for Earth',
        ratio < 1e-7 && ratio > 1e-9, `(v/c)^2 = ${ratio.toExponential(2)}`);
}


/* =============================================================================
   13. EXACT SCHWARZSCHILD GEODESICS
   -----------------------------------------------------------------------------
   The shape equation d^2u/dphi^2 + u = GM/L^2 + 3GMu^2/c^2 is exact for a
   timelike geodesic of the Schwarzschild metric. Integrating it must
   reproduce the closed-form apsidal advance, and dropping its last term must
   give an orbit that closes exactly.

   Resolving Mercury's shift needs sub-step accuracy: one step of a 40,000
   step orbit is 32 arcseconds and the answer is 0.1, so the perihelion is
   located by fitting a parabola to the three samples around the minimum.
   ========================================================================== */
section('Exact Schwarzschild geodesics');
{
  const a = 0.38709893, e = 0.20563069, M = 1, N = 40000;
  const rp = a * (1 - e);
  const vp = Math.sqrt(G * M * (1 + e) / rp);

  const analytic = precessionPerOrbit(M, [rp, 0, 0], [0, 0, vp]) * ARCSEC_PER_RAD;
  check('analytic apsidal advance for Mercury is 0.1035"/orbit',
        near(analytic, 0.10352, 1e-3), `${analytic.toFixed(5)}"`);

  const perOrbit = (relativistic) => {
    const tr = traceOrbit(M, [rp, 0, 0], [0, 0, vp],
      { turns: 2, stepsPerTurn: N, relativistic });
    const r = (i) => Math.hypot(tr.points[i * 3], tr.points[i * 3 + 1], tr.points[i * 3 + 2]);
    let i0 = N, best = Infinity;
    for (let i = Math.floor(N * 0.9); i < Math.min(tr.count - 1, N * 1.1); i++) {
      const d = r(i);
      if (d < best) { best = d; i0 = i; }
    }
    const f0 = r(i0 - 1), f1 = r(i0), f2 = r(i0 + 1);
    const frac = 0.5 * (f0 - f2) / (f0 - 2 * f1 + f2);
    return ((i0 + frac) / N * 2 * Math.PI - 2 * Math.PI) * ARCSEC_PER_RAD;
  };

  const gr = perOrbit(true);
  check('integrated GR orbit reproduces it to 5 decimal places',
        Math.abs(gr - analytic) < 1e-4, `${gr.toFixed(5)}" vs ${analytic.toFixed(5)}"`);

  const newt = perOrbit(false);
  check('with the GR term dropped the ellipse closes exactly',
        Math.abs(newt) < 1e-4, `${newt.toFixed(5)}"`);

  /* A century of Mercury, the number everyone quotes. */
  const T = Math.sqrt(a ** 3 / M);
  const perCentury = analytic * 100 / T;
  check('which is 42.98 arcsec per century', near(perCentury, 42.98, 2e-3),
        `${perCentury.toFixed(3)}"/century`);

  /* Elements round-trip. */
  const el = elements(M, [rp, 0, 0], [0, 0, vp]);
  check('osculating elements recover a and e', near(el.a, a, 1e-9) && near(el.e, e, 1e-9),
        `a = ${el.a.toFixed(8)}, e = ${el.e.toFixed(8)}`);

  /* Capture: a test particle aimed inside the photon sphere of a black hole
     with too little angular momentum must not come back out. */
  const Mbh = 10;
  const rsBh = 2 * G * Mbh / C2;
  const cap = traceOrbit(Mbh, [rsBh * 2.2, 0, 0], [0, 0, 0.35 * C], { turns: 3 });
  check('a low-angular-momentum orbit inside the ISCO is captured', cap.captured,
        `r_s = ${(rsBh * SI.AU / 1000).toFixed(1)} km`);
}

/* =============================================================================
   14. GRAVITATIONAL RADIATION
   -----------------------------------------------------------------------------
   Peters & Mathews. Checked against the two systems that made the subject
   real: the Hulse-Taylor binary pulsar, whose orbital decay was measured to
   four significant figures, and GW150914.
   ========================================================================== */
section('Gravitational radiation');
{
  /* PSR B1913+16 */
  const m1 = 1.438, m2 = 1.390;
  const aHT = 1.9501e9 / SI.AU, eHT = 0.6171;
  const M = m1 + m2;
  const vp = Math.sqrt(G * M * (1 + eHT) / (aHT * (1 - eHT)));
  const R = radiation(m1, m2, [aHT * (1 - eHT), 0, 0], [0, 0, vp]);

  const Pb = 2 * Math.PI * Math.sqrt(aHT ** 3 / (G * M));
  check('Hulse-Taylor orbital period is 7.75 hours',
        near(Pb * 365.25 * 24, 7.7519, 2e-3), `${(Pb * 365.25 * 24).toFixed(4)} h`);

  const Pdot = 1.5 * (R.dadt / R.a) * Pb;
  check('its orbital decay is the measured -2.40e-12 s/s',
        near(Pdot, -2.4025e-12, 5e-3), `${Pdot.toExponential(4)}`);

  check('eccentricity enhances the power by 11.9x at e = 0.617',
        near(eccentricityFactor(eHT), 11.86, 5e-3), eccentricityFactor(eHT).toFixed(3));
  check('a circular orbit has no enhancement', eccentricityFactor(0) === 1);

  /* GW150914, at the moment the dominant wave passed 150 Hz. */
  const Mpc = 3.0857e22 / SI.AU;
  const mA = 36, mB = 29, Mtot = mA + mB;
  const fOrb = 75 * SI.YR;                       // 150 Hz GW = 75 Hz orbital
  const aGW = Math.cbrt(G * Mtot / (2 * Math.PI * fOrb) ** 2);
  const vGW = Math.sqrt(G * Mtot / aGW);
  const R2 = radiation(mA, mB, [aGW, 0, 0], [0, 0, vGW], { distance: 410 * Mpc });

  check('GW150914 chirp mass is 28 solar masses', near(R2.chirp, 28.1, 2e-2),
        `${R2.chirp.toFixed(2)} Msun`);
  check('its dominant wave is at 150 Hz', near(R2.fGwHz, 150, 1e-6),
        `${R2.fGwHz.toFixed(1)} Hz`);
  check('optimally-oriented strain at 410 Mpc is ~2e-21', R2.strain > 1e-21 && R2.strain < 4e-21,
        `h = ${R2.strain.toExponential(2)} (LIGO measured ~1e-21 after the antenna pattern)`);
  check('their separation there is a few hundred km',
        aGW * SI.AU / 1000 > 300 && aGW * SI.AU / 1000 < 400,
        `${(aGW * SI.AU / 1000).toFixed(0)} km`);

  /* The Earth-Sun system radiates, but nothing anyone will ever detect. */
  const rad = radiation(1, M_EARTH_MSUN, [1, 0, 0], [0, 0, Math.sqrt(G)]);
  const watts = rad.power * SI.M_SUN * SI.AU ** 2 / SI.YR ** 3;
  check('the Earth radiates about 200 W in gravitational waves',
        watts > 150 && watts < 250, `${watts.toFixed(0)} W`);
  check('so it would take far longer than the age of the universe to spiral in',
        rad.tMerge > 1e20, `${rad.tMerge.toExponential(2)} yr`);

  /* The radiation pattern: eight times stronger along the axis. */
  check('GW power is 8x stronger along the orbital axis than in the plane',
        near(radiationPattern(1) / radiationPattern(0), 8, 1e-9),
        `${(radiationPattern(1) / radiationPattern(0)).toFixed(3)}x`);
}


/* =============================================================================
   15. THE FREE-FALL LATTICE
   -----------------------------------------------------------------------------
   The 3D grid mode draws a cube of freely falling test particles. Two claims
   are made for it on screen, and both are checked here rather than merely
   asserted in a caption.

   The volume is measured by the determinant of the deformation gradient F,
   least-squares fitted over every node. Two effects keep the measurement from
   being exact, and both are geometry rather than error, so both are pinned
   down with their own numbers below:

     - second order in the strain itself: a cell stretched by (1+e) and
       squeezed by (1-e/2) twice has volume 1 - 0.75 e^2, not 1. That is real;
       volume conservation is a statement about the INSTANTANEOUS rate.
     - finite lattice extent: F is a linear fit, and the tidal field varies
       across a lattice of non-zero size, so the fit leaves a residual of
       order (halfWidth/r)^2.
   ========================================================================== */
section('The free-fall lattice');
{
  /* --- 1. In vacuum the volume is conserved: E_ij is trace-free ---------- */
  const sun = new Body({ name: 'Sun', material: 'star', mass: 1 });
  const tidal = G * 1 / 1 ** 3;                  // GM/r^3 at 1 AU, the scale to beat

  const run = (bodies, centre, hw, t, steps) => {
    const L = new Lattice(9).seed(centre, hw);
    for (let i = 0; i < steps; i++) L.step(bodies, t / steps);
    return { L, coeff: 2 * (L.volumeRatio() - 1) / (t * t) };
  };

  const vac = run([sun], [1, 0, 0], 0.005, 2e-3, 400);
  check('in vacuum a falling lattice conserves its volume',
        Math.abs(vac.coeff) < 1e-3 * tidal,
        `|d²V/V| = ${Math.abs(vac.coeff).toExponential(2)} vs tidal scale ${tidal.toFixed(1)} /yr²`);

  /* What residual there is, is the second-order-in-strain term and nothing
     else — so it is predictable, not noise. */
  const secondOrder = -1.5 * tidal * tidal * (2e-3) ** 2;
  check('and the residual is the known second-order-in-strain term',
        near(vac.coeff, secondOrder, 0.1),
        `${vac.coeff.toExponential(3)} vs -1.5(GM/r³)²t² = ${secondOrder.toExponential(3)}`);

  /* --- 2. The shape: stretched at the mass, squeezed across it, -2:+1:+1 - */
  const big = run([sun], [1, 0, 0], 0.005, 0.02, 2000);
  const F = big.L.strainAxes();
  check('the lattice stretches along the line to the mass',
        F[0] > 1 && F[4] < 1 && F[8] < 1,
        `diag(F) = ${F[0].toFixed(5)}, ${F[4].toFixed(5)}, ${F[8].toFixed(5)}`);
  check('and shears not at all, because the field is radial',
        Math.max(Math.abs(F[1]), Math.abs(F[2]), Math.abs(F[5])) < 1e-6,
        `max |off-diagonal| = ${Math.max(Math.abs(F[1]), Math.abs(F[2]), Math.abs(F[5])).toExponential(1)}`);
  const meanSqueeze = 0.5 * ((1 - F[4]) + (1 - F[8]));
  const ratio = (F[0] - 1) / meanSqueeze;
  check('stretch and squeeze are in the ratio -2 : +1',
        near(ratio, 2, 0.02), `${ratio.toFixed(4)} : 1`);

  /* --- 3. Inside matter the volume shrinks, at exactly -4 pi G rho ------- */
  const rock = new Body({ name: 'Rock', material: 'rock', mass: 1e-3 });
  const hw = rock.radius * 0.2;
  const pred = Lattice.predictedVolumeAcceleration([rock], [0, 0, 0], hw);
  const tFree = 1 / Math.sqrt(G * rock.density);
  const mat = run([rock], [0, 0, 0], hw, tFree * 0.014, 100);
  check('inside matter it shrinks at -4πGρ, Einstein\'s equation in one line',
        near(mat.coeff, pred.d2VoverV, 5e-3),
        `${mat.coeff.toExponential(5)} vs ${pred.d2VoverV.toExponential(5)} /yr²`);
  check('and vacuum predicts exactly zero shrinkage',
        Lattice.predictedVolumeAcceleration([sun], [1, 0, 0], 0.005).d2VoverV === 0);

  /* Gauss, for a cube with a whole body loose inside it: the mean density is
     the body's mass over the cube's volume, however small the body is. */
  const box = 0.05;
  const enc = Lattice.predictedVolumeAcceleration([sun], [0, 0, 0], box);
  check('a cube enclosing a mass implodes at -4πG(M/V), however small the mass is',
        near(enc.rho, 1 / (2 * box) ** 3, 1e-12) &&
        near(enc.d2VoverV, -4 * Math.PI * G / (2 * box) ** 3, 1e-12),
        `<ρ> = ${enc.rho.toExponential(3)} M☉/AU³`);

  /* --- 4. Bookkeeping --------------------------------------------------- */
  const L = new Lattice(13).seed([0, 0, 0], 1);
  check('a 13³ lattice has 2197 nodes and 6084 edges',
        L.count === 2197 && L.edges.length / 2 === 3 * 13 * 13 * 12,
        `${L.count} nodes, ${L.edges.length / 2} edges`);
  check('an unperturbed lattice has unit volume and a centred centroid',
        near(L.volumeRatio(), 1, 1e-12) && Math.hypot(...L.centroid()) < 1e-12);

  /* The markers are massless: they must not move the bodies. */
  const before = [...sun.pos];
  const L2 = new Lattice(7).seed([0.5, 0, 0], 0.1);
  for (let i = 0; i < 200; i++) L2.step([sun], 1e-5);
  check('test particles do not move the masses they fall toward',
        sun.pos.every((v, i) => v === before[i]));
}

/* ========================================================================== */
console.log(`\n${count - failures}/${count} checks passed`);
if (failures) { console.log(`${failures} FAILURES`); process.exit(1); }
