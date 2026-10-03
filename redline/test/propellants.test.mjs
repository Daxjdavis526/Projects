/* The real propellants, headless: the NASA CEA tables and how they are
   read, the liquids' properties, the combustion chamber landing on CEA's
   temperature, and liquid oxygen in its tank — boiling off when vented,
   pressurising a sealed tank by itself, subcooled and slowly warming when
   pressurised.
   run: node redline/test/propellants.test.mjs */
import { CEA_MAIN, CEA_GG } from '../src/physics/cea-lox-ethanol.js';
import { GAS_MAIN, GAS_GG, FLUIDS, MR_STOICH } from '../src/physics/propellants.js';
import { Chamber, Gam } from '../src/physics/combustion.js';
import def from '../src/content/stands/ts2-biprop.js';
import { Session } from '../src/sim/session.js';
import { psi } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const BAR = 1e5;

console.log('the CEA tables');
{
  // interpolation returns the table's own points
  let worst = 0;
  for (const [T, G] of [[CEA_MAIN, GAS_MAIN], [CEA_GG, null]]) {
    if (!G) continue;
    T.pc.forEach((p, i) => T.mr.forEach((mr, j) => { worst = Math.max(worst, Math.abs(G.cstar(mr, p * BAR) / T.cstar[i][j] - 1)); }));
  }
  check('the interpolation reproduces every table point', worst < 1e-9, `${worst.toExponential(1)}`);
  // c* peaks a little fuel-rich of stoichiometric
  let best = 0, at = 0;
  for (let mr = 0.8; mr <= 3; mr += 0.01) { const c = GAS_MAIN.cstar(mr, 20 * BAR); if (c > best) { best = c; at = mr; } }
  check('c* at 20 bar peaks near MR 1.5, fuel-rich of stoichiometric (2.08)', at > 1.35 && at < 1.65 && at < MR_STOICH, `peak ${best.toFixed(0)} m/s at MR ${at.toFixed(2)}`);
  check('…at a c* LOX/ethanol is known for (≈ 1700–1750 m/s)', best > 1690 && best < 1760, `${best.toFixed(0)} m/s`);
  check('the flame is hottest near stoichiometric (≈ 3300 K at 20 bar)', Math.abs(GAS_MAIN.Tc(2.0, 20 * BAR) - 3300) < 100, `${GAS_MAIN.Tc(2.0, 20 * BAR).toFixed(0)} K`);
  check('higher pressure, less dissociation: a hotter flame and a higher c*', GAS_MAIN.Tc(1.5, 35 * BAR) > GAS_MAIN.Tc(1.5, 10 * BAR) && GAS_MAIN.cstar(1.5, 35 * BAR) > GAS_MAIN.cstar(1.5, 10 * BAR));
  // the effective gas constant keeps c* and Tc consistent for the one-gas chamber model
  let wc = 0;
  for (const mr of [0.3, 0.8, 1.5, 2.5, 5]) for (const p of [3, 20, 50]) {
    const P = p * BAR, g = GAS_MAIN.gamma(mr, P);
    wc = Math.max(wc, Math.abs(Math.sqrt(GAS_MAIN.R(mr, P) * GAS_MAIN.Tc(mr, P)) / Gam(g) / GAS_MAIN.cstar(mr, P) - 1));
  }
  check('c* = √(R·Tc)/Γ(γ) with the effective R, everywhere (between table points too)', wc < 0.01, `${(100 * wc).toFixed(2)} %`);
  const Rm = 8314.46 / GAS_MAIN.M(1.5, 20 * BAR);
  check('…and the effective R is the real one, R_univ/M, near the design point', Math.abs(GAS_MAIN.R(1.5, 20 * BAR) / Rm - 1) < 0.01, `${GAS_MAIN.R(1.5, 20 * BAR).toFixed(0)} vs ${Rm.toFixed(0)} J/kg/K`);
  check('the gas generator table is far cooler than full equilibrium that fuel-rich', GAS_GG.Tc(0.37, 12 * BAR) < 950 && GAS_GG.Tc(0.37, 12 * BAR) > 850, `${GAS_GG.Tc(0.37, 12 * BAR).toFixed(0)} K`);
  check('…and climbs steeply past the knee near MR 0.55', GAS_GG.Tc(0.8, 12 * BAR) - GAS_GG.Tc(0.5, 12 * BAR) > 600, `${GAS_GG.Tc(0.5, 12 * BAR).toFixed(0)} → ${GAS_GG.Tc(0.8, 12 * BAR).toFixed(0)} K`);
  check('the GG gas hands over to the main table smoothly', Math.abs(GAS_GG.cstar(1.5, 20 * BAR) - GAS_MAIN.cstar(1.5, 20 * BAR)) < 1 && GAS_GG.cstar(1.35, 20 * BAR) > GAS_GG.cstar(1.2, 20 * BAR));
}

console.log('the liquids');
{
  const L = FLUIDS.LOX, E = FLUIDS.ethanol;
  check('LOX boils at 90.2 K at one atmosphere (NIST\'s Antoine fit: within 0.15 K, 2 %)', Math.abs(L.tsat(101325) - 90.19) < 0.15 && Math.abs(L.pvap(90.19) / 101325 - 1) < 0.02, `${L.tsat(101325).toFixed(2)} K, ${(L.pvap(90.19) / BAR).toFixed(3)} bar`);
  check('…and its vapour pressure and boiling point are inverses', [70, 90, 110, 130, 150].every(T => Math.abs(L.tsat(L.pvap(T)) - T) < 0.01));
  check('LOX density at its boiling point is 1141 kg/m³, and falls as it warms', Math.abs(L.rhoAt(90.19) - 1141.5) < 2 && L.rhoAt(110) < L.rhoAt(90), `${L.rhoAt(90.19).toFixed(1)} kg/m³`);
  check('at 50 psig, LOX boils at ≈ 108 K', Math.abs(L.tsat(101325 + psi(50)) - 108) < 2, `${L.tsat(101325 + psi(50)).toFixed(1)} K`);
  check('ethanol boils at 78 °C and is 789 kg/m³ at 20 °C', Math.abs(E.pvap(351.4) / 101325 - 1) < 0.03 && Math.abs(E.rhoAt(293.15) - 789.3) < 0.1, `${(E.pvap(351.4) / BAR).toFixed(3)} bar`);
}

console.log('a chamber on the CEA gas lands on CEA\'s temperature');
{
  const spec = { V: 4e-4, throatDia: 14.75e-3, exitDia: 30e-3, Cd: 0.98, gas: GAS_MAIN, etaCstar: 1, Pnom: 2.1e6, MRnom: 1.5,
    wall: { Cch: 800, Cth: 250, hAch: 30, hAth: 18, Gcond: 4, Gamb: 3 } };
  const C = new Chamber(spec, { ambient: { P: 101325, T: 293.15 } });
  C.igniter.cmd = 1;
  const inj = { ox: 0.13, fu: 0.0867 };
  for (let t = 0; t < 0.6; t += 2e-5) C.step(2e-5, inj, 0, 1);
  const Tc = GAS_MAIN.Tc(inj.ox / inj.fu, C.P);
  check('lit, and steady', C.burning && C.P > 15 * BAR, `${(C.P / BAR).toFixed(1)} bar`);
  check('gas temperature = CEA\'s chamber temperature at η = 1 (±1 %)', Math.abs(C.Tgas / Tc - 1) < 0.01, `${C.Tgas.toFixed(0)} vs ${Tc.toFixed(0)} K`);
  check('Pc = ṁ·c*/(Cd·At) with CEA\'s c* (±1 %)', Math.abs(C.P * 0.98 * C.At / (inj.ox + inj.fu) / GAS_MAIN.cstar(1.5, C.P) - 1) < 0.01);
  check('the products carry CEA\'s γ', Math.abs(C.gP - GAS_MAIN.gamma(1.5, C.P)) < 0.002, `γ ${C.gP.toFixed(4)}`);
}

console.log('liquid oxygen in a tank');
{
  const s = new Session({ def, mode: 'independent', seed: 2, faultChanceNone: 1 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); s.run(5);
  ex('tech', { task: 'loadPropellants' }); s.run(121);
  const l = s.model.line('ox'), u = s.model.net.vol('oxu');
  check('loaded at its boiling point', l.fluid.cryo && Math.abs(l.Tliq - 90.2) < 0.3, `${l.Tliq.toFixed(2)} K`);
  s.run(15);
  check('the line thermocouple reads it', Math.abs(s.daq.latest('TC-717') - l.Tliq) < 1.5, `${s.daq.latest('TC-717').toFixed(1)} K`);
  s.run(60);                                     // let it settle at the vent's back-pressure
  const m0 = l.mL; s.run(60);
  const boil = (m0 - l.mL) / 60, Q = (l.spec.heatLeak ?? 0.6) * (293.15 - l.Tliq);
  check('vented, it boils off at heat leak ÷ latent heat', Math.abs(boil / (Q / FLUIDS.LOX.hfg) - 1) < 0.1, `${(boil * 1e3).toFixed(2)} g/s`);
  check('…and stays at its boiling point', Math.abs(l.Tliq - FLUIDS.LOX.tsat(u.P)) < 0.05);
  // shut the vent with nothing pressurising it: the boil-off pressurises the
  // tank by itself — slowly, because (well mixed) the whole liquid has to warm
  // with its boiling point as the pressure rises
  const P0 = u.P, T0 = l.Tliq;
  ex('valve', { id: 'VV-711', open: false }); s.run(300);
  check('sealed, the boil-off pressurises the tank by itself', u.P - P0 > psi(2), `+${((u.P - P0) / psi(1)).toFixed(1)} psi in five minutes`);
  check('…and the liquid warms with its boiling point', l.Tliq > T0 + 0.5 && Math.abs(l.Tliq - FLUIDS.LOX.tsat(u.P)) < 0.1, `${T0.toFixed(2)} → ${l.Tliq.toFixed(2)} K`);
  // pressurised with nitrogen far above its vapour pressure, it is subcooled
  ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-601', open: false }); ex('valve', { id: 'IV-601', open: true }); s.run(2);
  ex('regSet', { id: 'PR-610', value: psi(400) }); s.run(30);
  const T1 = l.Tliq, mA = l.mL; s.run(120);
  check('pressurised: no boiling (subcooled), the liquid warms slowly', l.mL === mA && l.Tliq > T1 && l.Tliq - T1 < 1 && l.Tliq < FLUIDS.LOX.tsat(u.P) - 30,
    `${T1.toFixed(2)} → ${l.Tliq.toFixed(2)} K, boiling point ${FLUIDS.LOX.tsat(u.P).toFixed(0)} K`);
  check('its density follows its temperature', Math.abs(l.rho - FLUIDS.LOX.rhoAt(l.Tliq)) < 1e-9, `${l.rho.toFixed(1)} kg/m³`);
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
