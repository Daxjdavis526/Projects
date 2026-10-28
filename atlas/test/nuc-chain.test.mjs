// The decay-chain model behind the nuc-chain simulation.
//   node atlas/test/nuc-chain.test.mjs

import * as C from '../src/viz/model/nuc-chain.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-6) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-300);

/** An independent answer: integrate dN/dt with small RK4 steps. */
function rk4(chain, N0, t, steps = 20000) {
  const m = chain.members, lam = m.map((x) => C.lambdaOf(x.T)), b = m.map((x, i) => (i ? x.b ?? 1 : 1));
  const f = (N) => N.map((v, i) => -lam[i] * v + (i ? b[i] * lam[i - 1] * N[i - 1] : 0));
  let N = m.map((_, i) => N0[i] || 0);
  const h = t / steps;
  for (let s = 0; s < steps; s++) {
    const k1 = f(N), k2 = f(N.map((v, i) => v + (h / 2) * k1[i])), k3 = f(N.map((v, i) => v + (h / 2) * k2[i])), k4 = f(N.map((v, i) => v + h * k3[i]));
    N = N.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  }
  return N;
}

// two members, against the textbook formula
{
  const ch = C.pairChain(0.2, 1), l1 = Math.LN2, l2 = Math.LN2 / 0.2;
  for (const t of [0.1, 1, 3, 7]) {
    const N = C.bateman(ch, [1000], t), N2 = (1000 * l1 / (l2 - l1)) * (Math.exp(-l1 * t) - Math.exp(-l2 * t));
    check(`pair: daughter at t = ${t} matches λ₁N₀(e^(−λ₁t) − e^(−λ₂t))/(λ₂ − λ₁)`, near(N[1], N2, 1e-10), `${N[1]} vs ${N2}`);
    check(`pair: nothing is lost at t = ${t}`, near(N[0] + N[1] + N[2], 1000, 1e-12));
  }
  const tp = C.peakTime(l1, l2), A = (t) => C.activities(ch, [1], t)[1];
  check('pair: the daughter’s activity peaks at ln(λ₂/λ₁)/(λ₂ − λ₁)', A(tp) > A(tp * 0.99) && A(tp) > A(tp * 1.01));
  check('pair: the daughter’s activity crosses the parent’s at its peak', near(A(tp), C.activities(ch, [1], tp)[0], 1e-9));
}
// equal half-lives are handled (t·e^(−λt) in the limit)
{
  const ch = C.pairChain(1, 1), l = Math.LN2, t = 2;
  check('equal half-lives: the daughter is λtN₀e^(−λt)', near(C.bateman(ch, [1], t)[1], l * t * Math.exp(-l * t), 1e-6));
}
// real chains against RK4
for (const [key, t, unit] of [['radon', 3 * C.HOUR, 'h'], ['moly', 48 * C.HOUR, 'h'], ['radium', 20 * C.DAY, 'd']]) {
  const ch = C.CHAINS[key], N0 = C.pureParent(ch), a = C.bateman(ch, N0, t), b = rk4(ch, N0, t);
  const worst = Math.max(...a.map((v, i) => Math.abs(v - b[i]) / Math.max(b[0], 1e-300)));
  check(`${key}: Bateman agrees with a numerical integration (worst ${worst.toExponential(1)} of the parent)`, worst < 1e-7);
}
// secular equilibrium in the uranium-238 chain
{
  const ch = C.CHAINS.u238, N0 = C.pureParent(ch), A = C.activities(ch, N0, 1e7 * C.YEAR);
  const radio = A.slice(0, -1);
  check('u238: after 10 Myr every radioactive member has the parent’s activity (to 0.1%)', radio.every((a) => Math.abs(a / A[0] - 1) < 1e-3), radio.map((a) => (a / A[0]).toFixed(4)).join(' '));
  check('u238: 14 radioactive members, ending at stable lead-206', radio.length === 14 && ch.members.at(-1).name === 'Pb-206' && ch.members.filter((m) => m.mode === 'α').length === 8 && ch.members.filter((m) => m.mode === 'β⁻').length === 6);
  const N = C.bateman(ch, N0, 1e7 * C.YEAR), iRa = ch.members.findIndex((m) => m.name === 'Ra-226');
  check('u238: in equilibrium N(Ra-226)/N(U-238) = T(Ra)/T(U) = 3.58e-7', near(N[iRa] / N[0], 1600 / 4.468e9, 1e-3), String(N[iRa] / N[0]));
  const total = C.bateman(ch, N0, 1e9 * C.YEAR).reduce((s, v) => s + v, 0);
  check('u238: the total number of nuclei is conserved over a billion years', near(total, N0[0], 1e-12));
  const early = C.activities(ch, N0, 1e-3);
  check('u238: just after purification the daughters have (almost) no activity', early.slice(1).every((a) => a / early[0] < 1e-8));
}
// the moly generator: transient equilibrium with the 87.5% branch
{
  const ch = C.CHAINS.moly, [m, tc] = ch.members, eq = C.equilibrium(m.T, tc.T, tc.b);
  check('moly: transient equilibrium', eq.kind === 'transient');
  const A = C.activities(ch, C.pureParent(ch), 10 * 24 * C.HOUR);
  check('moly: A(Tc-99m)/A(Mo-99) → b·λ₂/(λ₂ − λ₁) = 0.963', near(A[1] / A[0], eq.ratio, 1e-6) && Math.abs(eq.ratio - 0.9626) < 0.001, `${A[1] / A[0]} ${eq.ratio}`);
  const tp = C.peakTime(C.lambdaOf(m.T), C.lambdaOf(tc.T)) / C.HOUR;
  check('moly: Tc-99m activity peaks 22.85 h after elution', Math.abs(tp - 22.85) < 0.02, String(tp));
}
// radon
{
  check('radon ingrowth: half the equilibrium activity after one radon half-life', near(C.ingrowth(3.8215, 3.8215), 0.5, 1e-12));
  const perLitre = C.atomsFor(0.148, 3.8215 * C.DAY);
  check('4 pCi/L of radon is about 70 500 atoms per litre', Math.abs(perLitre - 70500) < 300, String(perLitre));
  const ch = C.CHAINS.radon, A = C.activities(ch, C.pureParent(ch), 3 * C.HOUR);
  check('radon: three hours after filling, Bi-214 is at 97% of radon’s activity', Math.abs(A[3] / A[0] - 0.972) < 0.002, String(A[3] / A[0]));
  check('equilibrium kinds: secular, transient, none', C.equilibrium(1600, 0.01).kind === 'secular' && C.equilibrium(66, 6).kind === 'transient' && C.equilibrium(1, 5).kind === 'none');
}
// K–Ar
{
  const t = C.kArAge(0.1, 1.248e9, 0.1072);
  check('K–Ar: Ar/K = 0.1 means about 1.19 Gyr', Math.abs(t / 1e9 - 1.1865) < 0.001, String(t));
  check('K–Ar: no argon, no age', C.kArAge(0) === 0);
}

console.log(`nuc-chain: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
