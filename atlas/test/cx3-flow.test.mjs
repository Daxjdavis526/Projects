// The ideal-flow model behind sims/cx3-flow.js: flow past a cylinder (speed
// 2U at the top, stagnation points where sin(θ − α) = −Γ/4πUR), the
// Joukowski map (the circle through 1 has a cusp at ζ = 2), the Kutta
// condition (finite velocity at the trailing edge only for the Kutta
// circulation), the Kutta–Joukowski lift ρUΓ and d'Alembert's zero drag
// from Blasius's pressure integral, streamlines that really are level sets
// of ψ, and parcels that move along them.
//   node atlas/test/cx3-flow.test.mjs

import * as M from '../src/viz/model/cx3-flow.js';
import * as S from '../src/viz/sims/cx3-flow.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const DEG = Math.PI / 180;

// a cylinder with no circulation
{
  const F = { U: 1.3, alpha: 0, c0: [0, 0], R: 0.8, Gamma: 0, map: 'none' };
  check('cylinder: speed 2U at the top', near(M.surfaceSpeed(Math.PI / 2, F), 2.6, 1e-6), M.surfaceSpeed(Math.PI / 2, F));
  check('cylinder: surface speed 2U|sin θ|', [0.3, 1.1, 2.4, 4].every((t) => near(M.surfaceSpeed(t, F), 2.6 * Math.abs(Math.sin(t)), 1e-6)));
  const st = M.stagnation(F);
  check('cylinder: stagnation points at ±R', st.length === 2 && st.some((z) => near(z[0], 0.8, 1e-9) && near(z[1], 0, 1e-9)) && st.some((z) => near(z[0], -0.8, 1e-9)));
  check('cylinder: the body is the streamline ψ = 0', [0.2, 1, 2, 3, 5].every((t) => near(M.psi([0.8 * Math.cos(t), 0.8 * Math.sin(t)], F), 0, 1e-12)));
  check('cylinder: far away, ψ ≈ Uy', near(M.psi([0.4, 30], F), 1.3 * 30, 1e-3));
  const LD = M.liftAndDrag(F, 1.2);
  check('cylinder without circulation: no lift, no drag', Math.abs(LD.lift) < 1e-9 && Math.abs(LD.drag) < 1e-9, JSON.stringify(LD));
}
// a cylinder with circulation
{
  const U = 2, R = 1.5, G = 9;
  const F = { U, alpha: 10 * DEG, c0: [0.3, -0.2], R, Gamma: G, map: 'none' };
  const st = M.stagnation(F);
  const k = -G / (4 * Math.PI * U * R);
  check('circulation: two stagnation points on the body', st.length === 2 && st.every((z) => near(M.abs(M.sub(z, F.c0)), R, 1e-9)));
  check('circulation: sin(θ − α) = −Γ/4πUR there', st.every((z) => near(Math.sin(Math.atan2(z[1] + 0.2, z[0] - 0.3) - F.alpha), k, 1e-9)));
  check('circulation: dW = 0 at the stagnation points', st.every((z) => M.abs(M.dW(z, F)) < 1e-9));
  const big = { ...F, Gamma: 4 * Math.PI * U * R * 1.4 };
  const s2 = M.stagnation(big);
  check('strong circulation: one stagnation point, off the body', s2.length === 1 && M.abs(M.sub(s2[0], F.c0)) > R && M.abs(M.dW(s2[0], big)) < 1e-9);
  const LD = M.liftAndDrag(F, 1.225);
  check('Kutta–Joukowski: lift ρUΓ', near(LD.lift, 1.225 * U * G, 1e-6), `${LD.lift} vs ${1.225 * U * G}`);
  check('d’Alembert: zero drag', Math.abs(LD.drag) < 1e-8, LD.drag);
  check('ψ is constant on the body', [0, 1, 2, 3, 4, 5, 6].every((t) => near(M.psi(M.add(F.c0, [R * Math.cos(t), R * Math.sin(t)]), F), M.psiBody(F), 1e-12)));
  // dW is the derivative of W
  const z = [2.1, 1.7], h = 1e-6;
  const d = M.scale(M.sub(M.W(M.add(z, [h, 0]), F), M.W(M.sub(z, [h, 0]), F)), 1 / (2 * h));
  check('dW is the derivative of W', near(d[0], M.dW(z, F)[0], 1e-6) && near(d[1], M.dW(z, F)[1], 1e-6));
  check('ψ = Im W', near(M.psi(z, F), M.W(z, F)[1], 1e-12));
}
// the Joukowski airfoil
{
  const { c0, R, beta } = M.circleFor(0.1, 0.08);
  check('the circle passes through z = 1', near(M.abs(M.sub([1, 0], c0)), R, 1e-12));
  check('J(1) = 2: the trailing edge', near(M.J([1, 0])[0], 2, 1e-12) && M.dJ([1, 0])[0] === 0);
  check('the unit circle maps onto [−2, 2]', [0.3, 1.2, 2.5].every((t) => Math.abs(M.J([Math.cos(t), Math.sin(t)])[1]) < 1e-12 && near(M.J([Math.cos(t), Math.sin(t)])[0], 2 * Math.cos(t), 1e-12)));
  const alpha = 6 * DEG, U = 1;
  const Gk = M.kuttaGamma(U, R, alpha, beta);
  const F = { U, alpha, c0, R, Gamma: Gk, map: 'joukowski' };
  check('Kutta: dW/dz = 0 at the trailing edge', M.abs(M.dW([1, 0], F)) < 1e-12);
  const nearTE = (G) => M.abs(M.velocity([1 + 1e-5 * Math.cos(-0.3), 1e-5 * Math.sin(-0.3)], { ...F, Gamma: G }));
  check('Kutta: the trailing-edge speed is finite with Γ_K and huge without', nearTE(Gk) < 5 && nearTE(0.5 * Gk) > 1e3, `${nearTE(Gk)} / ${nearTE(0.5 * Gk)}`);
  const LD = M.liftAndDrag(F, 1);
  check('airfoil: Blasius lift = ρUΓ', near(LD.lift, Gk, 1e-6), `${LD.lift} vs ${Gk}`);
  check('airfoil: zero drag', Math.abs(LD.drag) < 1e-8, LD.drag);
  const flat = M.circleFor(0, 0), Ff = { U, alpha, ...flat, Gamma: M.kuttaGamma(U, 1, alpha, 0), map: 'joukowski' };
  check('flat plate: chord 4, C_L = 2π sin α', near(M.chord(Ff), 4, 1e-6) && near(Ff.Gamma / (0.5 * U * 4), 2 * Math.PI * Math.sin(alpha), 1e-12));
  const ch = M.chord(F);
  check('the cambered airfoil’s chord is a little over 4', ch > 4 && ch < 4.6, ch);
  // inverse map
  const z = [1.7, -0.9], zeta = M.J(z), back = M.inverse(zeta, F);
  check('inverse picks the preimage outside the circle', near(back[0], z[0], 1e-9) && near(back[1], z[1], 1e-9));
  check('a point inside the airfoil is inside', M.inside([0, 0.08], F) && !M.inside([0, 1], F));
  // stagnation: the rear one is the trailing edge
  const st = M.stagnation(F);
  check('Kutta: the rear stagnation point is the trailing edge z = 1', st.some((p) => near(p[0], 1, 1e-6) && Math.abs(p[1]) < 1e-6));
  // streamlines are level sets of ψ
  const lines = M.streamlines(F, { n: 4 });
  const base = M.psiBody(F);
  let worst = 0;
  for (const L of lines) for (const p of L.pts.filter((_, i) => i % 7 === 0)) worst = Math.max(worst, Math.abs(M.psi(p, F) - (base + (L.k === 0 ? 1e-6 * R : L.k * 0.35 * R))));
  check('streamlines lie on their levels of ψ', lines.length >= 9 && worst < 2e-3, `${lines.length} lines, worst ${worst}`);
  // a parcel keeps its ψ
  let p = M.inverse([-4, 0.7], F);
  const psi0 = M.psi(p, F);
  for (let k = 0; k < 400; k++) p = M.advect(p, F, 0.02);
  check('a parcel stays on its streamline', Math.abs(M.psi(p, F) - psi0) < 1e-5 && M.J(p)[0] > 2, `${M.psi(p, F) - psi0}, x = ${M.J(p)[0]}`);
  // upper parcels reach the trailing edge first (no equal transit time)
  const time = (y0) => { let q = M.inverse([-4, y0], F), t = 0; while (M.J(q)[0] < 2 && t < 40) { q = M.advect(q, F, 0.01); t += 0.01; } return t; };
  let lo = -2, hi = 2;   // the dividing streamline, far upstream
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (M.psi(M.inverse([-4, m], F), F) > base) hi = m; else lo = m; }
  check('the parcel just over the top arrives first, by far', time(lo + 0.1) + 1 < time(lo - 0.1), `${time(lo + 0.1)} vs ${time(lo - 0.1)}`);
}
// the simulation's validate
{
  check('validate accepts the defaults', S.validate({ ...S.defaults }).length === 0, S.validate({ ...S.defaults }).join('; '));
  check('validate rejects an unknown mode', S.validate({ ...S.defaults, mode: 'wing' }).length > 0);
  check('validate rejects a circle that misses z = 1', S.validate({ ...S.defaults, thick: -1.2 }).length > 0);
}

console.log(`cx3-flow: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
