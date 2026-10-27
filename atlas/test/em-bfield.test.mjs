// The DOM-free model behind the magnetostatics simulation (sims/em-bfield.js):
// the elliptic integrals, the field of a straight wire and of a circular loop
// against closed forms and a brute-force Biot–Savart sum, the flux function
// whose contours are the field lines, ∇·B = 0, Ampère's law round circles,
// squares and lumpy paths (for wires, loops and a solenoid), the field inside
// a long solenoid and a toroid, and the force between parallel currents.
//   node atlas/test/em-bfield.test.mjs

import * as M from '../src/viz/model/em-bfield.js';
import { validate, defaults } from '../src/viz/sims/em-bfield.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
const { MU0 } = M;
let seed = 11;
const rnd = (a, b) => { seed = (seed * 16807) % 2147483647; return a + ((b - a) * seed) / 2147483647; };

// ─── constants and elliptic integrals ──────────────────────────────────────
check('μ₀ agrees with 4π×10⁻⁷ to 9 figures', near(MU0, 4e-7 * Math.PI, 1e-9));
{
  const [K0, E0] = M.ellipKE(0), [K5, E5] = M.ellipKE(0.5), [K9, E9] = M.ellipKE(0.9);
  check('K(0) = E(0) = π/2', near(K0, Math.PI / 2, 1e-14) && near(E0, Math.PI / 2, 1e-14));
  check('K(0.5) = 1.854075, E(0.5) = 1.350644', near(K5, 1.8540746773013719, 1e-12) && near(E5, 1.3506438810476755, 1e-12));
  check('K(0.9) = 2.578092, E(0.9) = 1.104775', near(K9, 2.5780921133481733, 1e-12) && near(E9, 1.1047747327040733, 1e-12));
  // Legendre's relation at m = 1/2: 2EK − K² = π/2
  check('Legendre’s relation 2EK − K² = π/2 holds at m = 1/2', near(2 * E5 * K5 - K5 * K5, Math.PI / 2, 1e-12));
}

// ─── a straight wire ────────────────────────────────────────────────────────
{
  const I = 10, b = M.wireB(I, 0.01, -0.02, 0.01 + 0.03, -0.02);
  check('wire: |B| = μ₀I/(2πr) = 66.7 μT at 3 cm from 10 A', near(Math.hypot(...b), (MU0 * I) / (2 * Math.PI * 0.03), 1e-12) && near(Math.hypot(...b), 6.6667e-5, 1e-4));
  check('wire: B circles anticlockwise round a current out of the page', b[1] > 0 && Math.abs(b[0]) < 1e-20);
  const S = M.scene({ wires: [{ x: 0, y: 0, I }] }), h = 1e-6;
  let worst = 0;
  for (let k = 0; k < 8; k++) {
    const x = rnd(-0.1, 0.1), y = rnd(-0.1, 0.1), B = M.field(S, x, y);
    const Bx = (M.psi(S, x, y + h) - M.psi(S, x, y - h)) / (2 * h), By = -(M.psi(S, x + h, y) - M.psi(S, x - h, y)) / (2 * h);
    worst = Math.max(worst, Math.hypot(Bx - B[0], By - B[1]) / Math.hypot(...B));
  }
  check('wire: B = ∇×(A_z ẑ) from the flux function (so its contours are field lines)', worst < 1e-6, `${worst}`);
}

// ─── a circular loop against Biot–Savart, summed by brute force ────────────
function biotSavartLoop(I, a, z0, x, y, n = 20000) {
  // the loop in the plane x = z0, centred on the page's x-axis; dl turns from +y toward +z (out of the page)
  let Bx = 0, By = 0, Bz = 0;
  const dphi = (2 * Math.PI) / n;
  for (let k = 0; k < n; k++) {
    const p = (k + 0.5) * dphi, ly = a * Math.cos(p), lz = a * Math.sin(p);
    const dl = [0, -a * Math.sin(p) * dphi, a * Math.cos(p) * dphi];
    const r = [x - z0, y - ly, -lz], r3 = Math.hypot(...r) ** 3, c = (MU0 * I) / (4 * Math.PI * r3);
    Bx += c * (dl[1] * r[2] - dl[2] * r[1]); By += c * (dl[2] * r[0] - dl[0] * r[2]); Bz += c * (dl[0] * r[1] - dl[1] * r[0]);
  }
  return [Bx, By, Bz];
}
{
  const I = 3, a = 0.05;
  const [bc] = M.loopB(I, a, 0, 0, 0);
  check('loop: B = μ₀I/(2a) at its centre', near(bc, (MU0 * I) / (2 * a), 1e-12));
  for (const z of [0.02, 0.1]) check(`loop: on the axis B = μ₀Ia²/(2(a² + z²)^{3/2}) at z = ${z} m`, near(M.loopB(I, a, 0, z, 0)[0], (MU0 * I * a * a) / (2 * (a * a + z * z) ** 1.5), 1e-12));
  const S = M.scene({ loops: [{ x: 0.01, R: a, I }] });
  let worst = 0;
  for (const [x, y] of [[0.03, 0.02], [-0.04, -0.06], [0.0101, 0.049], [0.12, 0.01], [-0.02, 0.08]]) {
    const bs = biotSavartLoop(I, a, 0.01, x, y), b = M.field(S, x, y);
    worst = Math.max(worst, Math.hypot(b[0] - bs[0], b[1] - bs[1]) / Math.hypot(bs[0], bs[1]), Math.abs(bs[2]) / Math.hypot(bs[0], bs[1]));
  }
  check('loop: the elliptic-integral field matches a 20 000-piece Biot–Savart sum, and lies in the page', worst < 1e-6, `${worst}`);
  const far = M.field(S, 0.01 + 2, 0), m = I * Math.PI * a * a;
  check('loop: far along the axis it is a dipole, μ₀m/(2πz³)', near(far[0], (MU0 * m) / (2 * Math.PI * 8), 1e-3));
  const h = 1e-7;
  let worstPsi = 0, worstDiv = 0;
  for (let k = 0; k < 10; k++) {
    const z = rnd(-0.08, 0.1), rho = rnd(0.005, 0.09);
    if (Math.abs(rho - a) < 0.004 && Math.abs(z - 0.01) < 0.004) continue;
    const [Bz, Br] = M.loopB(I, a, 0.01, z, rho);
    const dpdr = (M.loopPsi(I, a, 0.01, z, rho + h) - M.loopPsi(I, a, 0.01, z, rho - h)) / (2 * h);
    const dpdz = (M.loopPsi(I, a, 0.01, z + h, rho) - M.loopPsi(I, a, 0.01, z - h, rho)) / (2 * h);
    worstPsi = Math.max(worstPsi, Math.hypot(dpdr / rho - Bz, -dpdz / rho - Br) / Math.hypot(Bz, Br));
    const g = 1e-5;
    const div = ((rho + g) * M.loopB(I, a, 0.01, z, rho + g)[1] - (rho - g) * M.loopB(I, a, 0.01, z, rho - g)[1]) / (2 * g * rho)
      + (M.loopB(I, a, 0.01, z + g, rho)[0] - M.loopB(I, a, 0.01, z - g, rho)[0]) / (2 * g);
    worstDiv = Math.max(worstDiv, Math.abs(div) * a / Math.hypot(Bz, Br));
  }
  check('loop: B_z = (1/ρ)∂ψ/∂ρ and B_ρ = −(1/ρ)∂ψ/∂z (the flux function is right)', worstPsi < 1e-5, `${worstPsi}`);
  check('loop: ∇·B = 0 (numerically)', worstDiv < 1e-5, `${worstDiv}`);
  check('loop: the near-axis series for ψ joins the exact form smoothly', near(M.loopPsi(I, a, 0, 0.03, 0.0021), M.loopPsi(I, a, 0, 0.03, 0.002101) * (0.0021 / 0.002101) ** 2, 2e-3));
}

// ─── Ampère's law ───────────────────────────────────────────────────────────
{
  const S = M.scene({ wires: [{ x: 0.01, y: 0.005, I: 4 }, { x: -0.03, y: 0.02, I: -2.5 }, { x: 0.05, y: -0.04, I: 7 }], uniform: [3e-5, -1e-5] });
  for (const [shape, cx, cy, r, inc] of [['circle', 0, 0, 0.025, 4], ['square', -0.005, 0.01, 0.04, 1.5], ['lumpy', 0.02, -0.01, 0.05, 1.5], ['circle', 0.1, 0.1, 0.02, 0]]) {
    const path = M.pathOf(shape, cx, cy, r, 2000), C = M.circulation(S, path), Ienc = M.enclosed(S, path);
    check(`Ampère, ${shape} round ${inc} A: ∮B·dl = μ₀I_enc`, near(Ienc, inc, 1e-12) && near(C, MU0 * Ienc, 1e-5, 1e-12 * MU0), `C/μ₀ = ${C / MU0}, I_enc = ${Ienc}`);
  }
  const L = M.scene({ loops: [{ x: 0, R: 0.04, I: 5 }] });
  const both = M.pathOf('lumpy', 0, 0, 0.06, 2000), top = M.pathOf('circle', 0, 0.04, 0.015, 2000);
  check('Ampère, loop: a path round both crossings encloses no net current', Math.abs(M.circulation(L, both)) < 1e-6 * MU0 * 5 && M.enclosed(L, both) === 0);
  check('Ampère, loop: a path round the upper crossing gives μ₀I', near(M.circulation(L, top), MU0 * 5, 1e-5));
  const sol = M.scene({ loops: M.solenoidLoops({ x0: -0.1, x1: 0.1, R: 0.02, N: 40, I: 2 }) });
  const box = [[-0.03, 0], [0.03, 0], [0.03, 0.05], [-0.03, 0.05]].flatMap(([x, y], k, a) => { const [x1, y1] = a[(k + 1) % 4]; return Array.from({ length: 400 }, (_, j) => [x + ((x1 - x) * j) / 400, y + ((y1 - y) * j) / 400]); });
  const Ib = M.enclosed(sol, box);
  check('Ampère, solenoid: a rectangle straddling the windings encloses their current', near(M.circulation(sol, box), MU0 * Ib, 1e-4) && Ib !== 0, `${M.circulation(sol, box) / MU0} vs ${Ib}`);
}

// ─── solenoids and toroids ──────────────────────────────────────────────────
{
  const N = 200, L = 0.4, R = 0.01, I = 1.5, n = N / L;
  const S = M.scene({ loops: M.solenoidLoops({ x0: -L / 2, x1: L / 2, R, N, I }) });
  const [Bc] = M.field(S, 0, 0), ideal = MU0 * n * I;
  check('long solenoid: B ≈ μ₀nI at the centre (within the finite-length factor L/√(L² + 4R²))', near(Bc, ideal * (L / Math.sqrt(L * L + 4 * R * R)), 2e-3), `${Bc} vs ${ideal}`);
  check('long solenoid: the field is nearly the same across the inside', near(M.field(S, 0, 0.6 * R)[0], Bc, 2e-2));
  check('long solenoid: outside it is weak (under 1% of inside)', Math.hypot(...M.field(S, 0, 2.5 * R)) < 0.01 * Bc);
  check('long solenoid: at an open end the field is about half the centre value', near(M.field(S, L / 2, 0)[0], Bc / 2, 0.03));
  const T = M.scene({ wires: M.toroidWires({ a: 0.05, b: 0.08, N: 60, I: 2 }) });
  const r = 0.065, Bt = Math.hypot(...M.field(T, r, 0.0004));
  check('toroid: inside the core B ≈ μ₀NI/(2πr)', near(Bt, (MU0 * 60 * 2) / (2 * Math.PI * r), 0.02), `${Bt}`);
  check('toroid: zero in the hole and outside', Math.hypot(...M.field(T, 0.01, 0.003)) < 0.01 * Bt && Math.hypot(...M.field(T, 0.12, 0.02)) < 0.01 * Bt);
}

// ─── forces between currents ────────────────────────────────────────────────
{
  const d = 0.04, S = M.scene({ wires: [{ x: 0, y: 0, I: 10 }, { x: d, y: 0, I: 15 }] });
  const F1 = M.forcePerLength(S, 0), F2 = M.forcePerLength(S, 1);
  check('parallel currents: F/L = μ₀I₁I₂/(2πd) = 7.5×10⁻⁴ N/m', near(F1[0], M.parallelForce(10, 15, d), 1e-12) && near(F1[0], 7.5e-4, 1e-6));
  check('parallel currents attract; Newton’s third law holds', F1[0] > 0 && F2[0] < 0 && near(F1[0], -F2[0], 1e-12));
  const A = M.scene({ wires: [{ x: 0, y: 0, I: 10 }, { x: d, y: 0, I: -15 }] });
  check('antiparallel currents repel', M.forcePerLength(A, 0)[0] < 0);
}

// ─── the simulation's parameter check ──────────────────────────────────────
check('defaults are valid', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('wires and loops together are refused', validate({ ...defaults, wires: [{ x: 0, y: 1, I: 1 }], loops: [{ x: 0, R: 1, I: 1 }] }).length > 0);
check('an unknown readout is caught', validate({ ...defaults, readouts: ['flux'] }).length > 0);
check('a current written with an unknown slider key is caught', validate({ ...defaults, wires: [{ x: 0, y: 0, I: 'I9' }] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
