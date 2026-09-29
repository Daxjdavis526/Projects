/* Pre-test predictions.

   Before a firing, a test engineer writes down what the data should look
   like: chamber pressure, thrust, mass flow. Without a prediction there is
   nothing to compare the data to, and "the thrust was 5.3 N" means nothing.

   The prediction here is made the way a real one is: with a model of the
   hardware AS DESIGNED, run to steady state at the planned conditions. It
   never sees faults. If the stand is off-nominal, the data will disagree
   with the prediction, and that disagreement is the first clue. */

import { ColdGasModel } from './coldgas.js';

const cache = new Map();

export function predictColdGas(def, { supplyGauge, regSet }) {
  const key = `${def.id}|${Math.round(supplyGauge / 3.4e5)}|${Math.round(regSet / 3.4e3)}`;
  if (cache.has(key)) return cache.get(key);
  const m = new ColdGasModel(def);
  const net = m.net, Pa = def.physics.ambient.P;
  const tank = net.vol('tank');
  const T = tank.T;
  tank.P = Pa + Math.max(supplyGauge, 0);
  tank.m = tank.P * tank.V / (net.gas.R * T);
  tank.U = tank.m * net.gas.cv * T;
  // Start with every upstream volume at supply pressure, valves open, the
  // regulator dome already at setpoint: skip straight to lock-up.
  for (const id of ['sup', 'hp']) {
    const v = net.vol(id); v.P = tank.P; v.m = v.P * v.V / (net.gas.R * v.T); v.U = v.m * net.gas.cv * v.T;
  }
  for (const id of ['lp', 'feed']) {
    const v = net.vol(id); v.P = Pa + regSet; v.m = v.P * v.V / (net.gas.R * v.T); v.U = v.m * net.gas.cv * v.T;
  }
  for (const [id, open] of [['HV-100', 1], ['IV-101', 1], ['VV-101', 0], ['VV-201', 0]]) {
    const e = net.el(id); e.command(open, net); e.pending = null; e.target = open; e.u = open; e.pos = open;
  }
  const reg = net.el(def.regulator);
  reg.command(regSet); reg.domeRamp = regSet; reg.dome = regSet;
  m.advance(0.3);
  m.command(def.fireValve, 1);
  m.advance(0.6);
  let n = 0, Pc = 0, Pf = 0, Pl = 0, F = 0, md = 0, Tf = 0;
  m.advance(0.3, () => {
    n++;
    Pc += net.vol('chamber').P; Pf += net.vol('feed').P; Pl += net.vol('lp').P;
    F += m.nozzleEl.F; md += m.nozzleEl.mdot; Tf += net.vol('feed').T;
  });
  const out = {
    Pc: Pc / n - Pa, Pfeed: Pf / n - Pa, Plp: Pl / n - Pa,
    F: F / n, mdot: md / n, Tfeed: Tf / n,
    Isp: (F / n) / ((md / n) * 9.80665),
    Cf: (F / n) / ((Pc / n) * m.nozzleEl.nozzle.At),
    supplyGauge, regSet,
  };
  cache.set(key, out);
  return out;
}
