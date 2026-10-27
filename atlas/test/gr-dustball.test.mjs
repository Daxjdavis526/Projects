// The DOM-free model behind the gr-dustball simulation (the Baez–Bunn ball
// of freely falling dust: tides change its shape, matter its volume).
//   node atlas/test/gr-dustball.test.mjs

import * as B from '../src/viz/model/gr-dustball.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(1e-300, Math.abs(b));
const { G, C, M_SUN } = B;

// tides in empty space: stretch 2, squeeze 1 and 1 — no volume change at first
const GM_E = B.BODIES.earth.GM, R_E = B.BODIES.earth.unit;
const kE = B.tidalRates(GM_E, R_E);
check('tides: the stretch along the line is twice each squeeze across it', near(-kE[0], 2 * kE[1], 1e-12) && kE[1] === kE[2]);
check('tides in empty space change no volume at first: V̈/V = 0', Math.abs(B.volumeAccel(kE)) < 1e-18);
check('Earth’s surface: GM/R³ = 1.54e-6 s⁻²', near(kE[1], 1.541e-6, 0.002), String(kE[1]));
check('the vertical gravity gradient 2GM/R³ ≈ 3.08e-6 s⁻² (about 3080 eötvös)', near(-kE[0], 3.083e-6, 0.002));

// the linear tidal rates agree with the exact difference of Newtonian pulls
for (const dx of [1, 100, 1e4]) {
  const g = (r) => -GM_E / r ** 2;
  const along = g(R_E + dx) - g(R_E);                 // relative acceleration of a particle dx farther out (outward +)
  check(`stretch over ${dx} m matches the exact difference of pulls`, near(along, -kE[0] * dx, 1e-2 * Math.max(1, dx / 1e3)), `${along} vs ${-kE[0] * dx}`);
  const d2 = R_E ** 2 + dx ** 2;
  const sideways = (-GM_E / d2) * (dx / Math.sqrt(d2));   // the exact pull's component back toward the centre line
  check(`squeeze over ${dx} m matches the converging pulls`, near(sideways, -kE[1] * dx, 1e-5), `${sideways} vs ${-kE[1] * dx}`);
}

// the Baez–Bunn reading of Einstein's equation, numbers used in the lessons
const water = B.matterRate(1000);
check('water: V̈/V = −4πGρ = −8.39e-7 s⁻²', near(B.volumeAccel([water, water, water]), -8.386e-7, 0.002), String(B.volumeAccel([water, water, water])));
check('radiation (p = ρc²/3) focuses twice as strongly as dust', near(B.matterRate(1, C * C / 3), 2 * B.matterRate(1), 1e-12));
check('vacuum energy (p = −ρc²) defocuses: source −2ρ', near(B.matterRate(1, -C * C), -2 * B.matterRate(1), 1e-12));
const rhoL = (B.LAMBDA * C * C) / (8 * Math.PI * G);
check('Λ as a term or as a fluid with ρ_Λ = Λc²/8πG, p = −ρ_Λc²: the same ball', near(B.matterRate(0, 0, B.LAMBDA), B.matterRate(rhoL, -rhoL * C * C), 1e-9));
check('Λ alone makes the ball grow: V̈/V = +Λc²', near(B.volumeAccel(Array(3).fill(B.matterRate(0, 0, B.LAMBDA))), B.LAMBDA * C * C, 1e-12));
check('ρ_Λ ≈ 5.9e-27 kg/m³', near(rhoL, 5.9e-27, 0.01), String(rhoL));
check('matter beats Λ above 2ρ_Λ: the ball is balanced there', Math.abs(B.matterRate(2 * rhoL, 0, B.LAMBDA)) < 1e-12 * B.matterRate(2 * rhoL));

// combined: the volume part comes only from the local matter, the shape part only from the tides
const kc = B.combinedRates({ GM: GM_E, r: 2 * R_E, rho: 1000 });
check('combined: volume part = −4πGρ of the local matter alone', near(B.volumeAccel(kc), -4 * Math.PI * G * 1000, 1e-9));
const sh = B.shapeRates(kc), tt = B.tidalRates(GM_E, 2 * R_E);
check('combined: shape part = the tidal rates alone', sh.every((x, i) => near(x, tt[i], 1e-9)));

// inside a uniform sphere the tidal rates are isotropic (no shape change), outside they are 2:1:1
const M_ROCK = 5514, R = 6.371e6, GMu = (4 / 3) * Math.PI * G * M_ROCK * R ** 3;
function rates(x) {                                    // −∂a_i/∂x_i by central differences, along the three axes
  const h = 10;
  return [0, 1, 2].map((i) => {
    const xp = x.slice(), xm = x.slice(); xp[i] += h; xm[i] -= h;
    return -(B.uniformSphereAccel(GMu, R, xp)[i] - B.uniformSphereAccel(GMu, R, xm)[i]) / (2 * h);
  });
}
const inside = rates([0.4 * R, 0, 0]);
check('inside a uniform planet: equal rates 4πGρ/3 on all three axes (pure volume change)', inside.every((k) => near(k, B.matterRate(M_ROCK), 1e-6)), inside.join(', '));
const outside = rates([2.5 * R, 0, 0]);
const expect = B.tidalRates(GMu, 2.5 * R);
check('outside it: stretch 2, squeeze 1, 1 (pure shape change)', outside.every((k, i) => near(k, expect[i], 1e-5)), outside.join(', '));
check('inside a uniform Earth a ball collapses in a quarter period: 21.1 min', near((Math.PI / 2) / Math.sqrt(B.matterRate(M_ROCK)) / 60, 21.1, 0.005));

// the exact axis solution agrees with a direct integration of ξ̈ = −kξ, and V̈/V(0) = −Σk
function rk4(k, T, n = 4000) {
  let x = 1, v = 0; const h = T / n;
  for (let i = 0; i < n; i++) {
    const a1 = v, b1 = -k * x, a2 = v + 0.5 * h * b1, b2 = -k * (x + 0.5 * h * a1);
    const a3 = v + 0.5 * h * b2, b3 = -k * (x + 0.5 * h * a2), a4 = v + h * b3, b4 = -k * (x + h * a3);
    x += (h / 6) * (a1 + 2 * a2 + 2 * a3 + a4); v += (h / 6) * (b1 + 2 * b2 + 2 * b3 + b4);
  }
  return x;
}
for (const k of [2.5, -1.3, 1e-6]) {
  const T = 0.9 / Math.sqrt(Math.abs(k));
  check(`axis factor matches RK4 for k = ${k}`, near(B.axisFactor(k, T), rk4(k, T), 1e-9));
}
for (const k of [kE, [water, water, water], kc, [-1, 0.2, 0.3]]) {
  const h = 1e-3 * B.timeScale(k);
  const v2 = (B.volumeAt(k, h) - 2 * B.volumeAt(k, 0) + B.volumeAt(k, -h)) / (h * h);
  check(`V̈/V at release equals −Σk (${k.map((x) => x.toExponential(2)).join(', ')})`, Math.abs(v2 - B.volumeAccel(k)) < 1e-4 * Math.max(...k.map(Math.abs)), `${v2} vs ${B.volumeAccel(k)}`);
}

// black-hole numbers used in the tides lesson
const tideHorizon = (body, L = 2) => -B.tidalRates(body.GM, body.unit)[0] * L;
check('10 M☉ horizon: 2 m stretch ≈ 2.1e8 m/s²', near(tideHorizon(B.BODIES.bh), 2.06e8, 0.01), String(tideHorizon(B.BODIES.bh)));
check('Sgr A* horizon: 2 m stretch ≈ 1.1e-3 m/s²', near(tideHorizon(B.BODIES.sgra), 1.11e-3, 0.01), String(tideHorizon(B.BODIES.sgra)));
check('10 M☉: the stretch on 2 m reaches 10 g at about 128 r_s', near(Math.cbrt((2 * B.BODIES.bh.GM * 2) / (10 * 9.81)) / B.BODIES.bh.unit, 128, 0.01));

// a gravitational wave changes shape, not area (to first order in h)
for (const pol of ['plus', 'cross']) {
  const h = 1e-3;
  const dA = Math.max(...[0, 0.7, 1.9, 3.1].map((ph) => Math.abs(B.waveArea(h, ph, pol) - 1)));
  check(`a ${pol} wave changes the area only at second order in h`, dA <= 0.25 * h * h * 1.0001, String(dA));
}
const [[a, b], [c, d]] = B.waveDeform(0.2, 0, 'plus');
check('plus wave at peak: x stretched by h/2, y squeezed by h/2', near(a, 1.1, 1e-12) && near(d, 0.9, 1e-12) && b === 0 && c === 0);

// the dust scatter fills the unit ball and is the same every time
const P1 = B.dustPoints(150), P2 = B.dustPoints(150);
check('dust points lie inside the unit ball', P1.every((p) => Math.hypot(...p) <= 1));
check('dust points are deterministic', JSON.stringify(P1) === JSON.stringify(P2));
check('dust is spread through the ball (centroid near the centre)', Math.hypot(...[0, 1, 2].map((i) => P1.reduce((s, p) => s + p[i], 0) / P1.length)) < 0.15);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
