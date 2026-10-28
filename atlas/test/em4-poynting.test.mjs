// The Poynting-flow model behind the em4-poynting simulation.
//   node atlas/test/em4-poynting.test.mjs

import * as M from '../src/viz/model/em4-poynting.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

// a resistor takes in VI through its side
for (const [V, I, a, L] of [[12, 2, 1e-3, 0.1], [0.5, 30, 5e-4, 1], [230, 0.1, 2e-4, 0.02]]) {
  const w = M.wire({ V, I, a, L });
  check(`wire V=${V} I=${I}: inflow through the side = VI`, near(w.inflow, V * I, 1e-12), `${w.inflow} vs ${V * I}`);
  check(`wire V=${V} I=${I}: = I²R`, near(w.inflow, I * I * w.R, 1e-12));
  check(`wire V=${V} I=${I}: S = VI/(2πaL)`, near(w.S, (V * I) / (2 * Math.PI * a * L), 1e-12));
}

// a charging capacitor takes in d/dt(½CV²) through its rim
for (const [V, I, R, d] of [[100, 0.5, 0.04, 2e-3], [5, 2, 0.1, 1e-3], [1000, -0.2, 0.05, 5e-3]]) {
  const c = M.capacitor({ V, I, R, d });
  check(`capacitor V=${V} I=${I}: inflow = VI`, near(c.inflow, V * I, 1e-12), `${c.inflow}`);
  // d/dt(½CV²) with dV/dt = I/C, by finite difference
  const h = 1e-9, U = (v) => 0.5 * c.C * v * v;
  const dUdt = (U(V + c.dVdt * h) - U(V - c.dVdt * h)) / (2 * h);
  check(`capacitor V=${V} I=${I}: inflow = d/dt(½CV²)`, near(c.inflow, dUdt, 1e-6), `${c.inflow} vs ${dUdt}`);
  check(`capacitor V=${V} I=${I}: B at the rim is μ₀I/2πR`, near(c.Brim, (M.MU0 * I) / (2 * Math.PI * R), 1e-12));
  check(`capacitor V=${V} I=${I}: B grows linearly inside and falls as 1/s outside`, near(c.B(R / 2), c.Brim / 2, 1e-12) && near(c.B(2 * R), c.Brim / 2, 1e-12));
}

// a coax carries VI between its conductors
for (const [V, I, a, b] of [[50, 1, 0.45e-3, 1.47e-3], [1e4, 3, 1e-3, 1e-2], [5, 0.01, 1e-4, 2e-4]]) {
  const x = M.coax({ V, I, a, b });
  check(`coax V=${V} I=${I}: ∫S·da over the gap = VI`, near(x.flow, V * I, 1e-8), `${x.flow} vs ${V * I}`);
  // the line integral of E across the gap is V
  const n = 400, h = (b - a) / n;
  let v = 0;
  for (let k = 0; k <= n; k++) v += (k === 0 || k === n ? 1 : k % 2 ? 4 : 2) * x.E(a + k * h);
  check(`coax V=${V}: ∫E ds from a to b = V`, near((v * h) / 3, V, 1e-6), String((v * h) / 3));
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
