/* TS-3's plumbing and its turbopump, as physics data. FICTIONAL.

   A bank of nitrogen bottles feeds a header. Off the header: two tank
   pressure regulators (relieving: they can bring a tank DOWN as well as up)
   and the turbine drive regulator PR-330. Each run tank feeds its own pump
   through a short, fat suction line; each pump discharges through a ball
   valve, a turbine flowmeter and a throttle valve into the catch tank (at
   atmospheric pressure). The drive gas reaches the turbine through the
   turbine start valve TSV-332 and leaves through the turbine's nozzles and
   exhaust duct to the cell.

   The turbopump, TPA-1, is designed for the pump-fed engine to come: an
   oxidiser pump for LOX and a fuel pump for ethanol on one shaft, 36 000 rpm
   at design. On TS-3 both pumps are run on WATER and the turbine on cold
   nitrogen: a component test. */

import { psi, degC, cc, litre, P_STD } from '../../lib/units.js';
import { pvapWater } from '../../physics/turbopump.js';

export const AMB = { P: P_STD, T: degC(20) };
const g = x => AMB.P + psi(x);

export const FLUIDS3 = {
  water: { name: 'Water (simulant)', rho: 998, cp: 4180, pvap: pvapWater },
};

/* The turbopump as designed: duty points for the engine propellants. */
export const TPA = {
  Nd: 36000,                       // rpm
  ox: { fluid: 'LOX', rho: 1141, mdot: 0.54, H0: 390, eta: 0.42, npshr0: 20 },
  fu: { fluid: 'ethanol', rho: 789, mdot: 0.36, H0: 480, eta: 0.40, npshr0: 18 },
  // the throttles sized so the design flow on WATER is at 2/3 travel
  thrDesign: 0.66,
};

const tankWall = { C: 40000, hA: 12, hAflow: 150, hAamb: 15 };
const small = { C: 300, hA: 0.4, hAflow: 80, hAamb: 1 };

export const physics = {
  model: 'biprop',
  gas: 'N2',
  ambient: AMB,
  volumes: [
    { id: 'bank', V: litre(300), P0: g(2400), T0: AMB.T, wall: { C: 200000, hA: 60, hAflow: 600, hAamb: 80 } },
    { id: 'sup', V: cc(60), wall: small },
    { id: 'hp', V: cc(150), wall: small },
    { id: 'oxreg', V: cc(40), wall: small },
    { id: 'fureg', V: cc(40), wall: small },
    { id: 'oxu', V: litre(60), wall: tankWall },
    { id: 'fuu', V: litre(60), wall: tankWall },
    { id: 'treg', V: cc(400), wall: { C: 1500, hA: 2, hAflow: 120, hAamb: 3 } },
    { id: 'tin', V: cc(250), wall: { C: 1200, hA: 1.5, hAflow: 100, hAamb: 2 } },
    { id: 'oxman', V: cc(150), wall: small },     // discharge line, DV-414 → FCV-418 (gas part)
    { id: 'fuman', V: cc(150), wall: small },
  ],
  elements: [
    { id: 'HV-300', type: 'valve', from: 'bank', to: 'sup', CdA: 6.0e-5, normally: 'closed', stroke: 2.5 },
    { id: 'IV-301', type: 'valve', from: 'sup', to: 'hp', CdA: 6.0e-5, normally: 'closed', delay: 0.15, strokeOpen: 0.7, strokeClose: 0.5, char: 'ball' },
    { id: 'VV-301', type: 'valve', from: 'hp', to: 'ambient', CdA: 5.0e-6, normally: 'open', delay: 0.012, stroke: 0.015 },
    { id: 'PR-410', type: 'regulator', from: 'hp', to: 'oxreg', CdA: 6.0e-6, band: psi(30), tau: 0.002, spe: 0.012, PinRef: psi(2400), domeRate: psi(30), domeTau: 0.3 },
    { id: 'CV-411', type: 'check', from: 'oxreg', to: 'oxu', CdA: 2.0e-5, crack: psi(1) },
    { id: 'PR-410V', type: 'relieving', from: 'oxu', reg: 'PR-410', CdA: 1.0e-5, offset: psi(3), band: psi(5), hidden: true },
    { id: 'RV-412', type: 'relief', from: 'oxu', to: 'ambient', CdA: 2.0e-5, set: psi(150), accumulation: 0.1, blowdown: 0.08 },
    { id: 'VV-413', type: 'valve', from: 'oxu', to: 'ambient', CdA: 1.5e-5, normally: 'open', delay: 0.012, stroke: 0.02 },
    { id: 'PR-420', type: 'regulator', from: 'hp', to: 'fureg', CdA: 6.0e-6, band: psi(30), tau: 0.002, spe: 0.012, PinRef: psi(2400), domeRate: psi(30), domeTau: 0.3 },
    { id: 'CV-421', type: 'check', from: 'fureg', to: 'fuu', CdA: 2.0e-5, crack: psi(1) },
    { id: 'PR-420V', type: 'relieving', from: 'fuu', reg: 'PR-420', CdA: 1.0e-5, offset: psi(3), band: psi(5), hidden: true },
    { id: 'RV-422', type: 'relief', from: 'fuu', to: 'ambient', CdA: 2.0e-5, set: psi(150), accumulation: 0.1, blowdown: 0.08 },
    { id: 'VV-423', type: 'valve', from: 'fuu', to: 'ambient', CdA: 1.5e-5, normally: 'open', delay: 0.012, stroke: 0.02 },
    // turbine drive
    { id: 'PR-330', type: 'regulator', from: 'hp', to: 'treg', CdA: 1.6e-5, band: psi(60), tau: 0.003, spe: 0.01, PinRef: psi(2400), domeRate: psi(150), domeTau: 0.08 },
    { id: 'RV-331', type: 'relief', from: 'treg', to: 'ambient', CdA: 3.0e-5, set: psi(500), accumulation: 0.1, blowdown: 0.08 },
    // the drive line between PR-330 and the turbine start valve is a trapped
    // volume after every run: this is its only way out
    { id: 'VV-338', type: 'valve', from: 'treg', to: 'ambient', CdA: 6.0e-6, normally: 'closed', delay: 0.012, stroke: 0.02 },
    { id: 'TSV-332', type: 'valve', from: 'treg', to: 'tin', CdA: 1.2e-4, normally: 'closed', delay: 0.03, strokeOpen: 0.08, strokeClose: 0.06, char: 'ball' },
    { id: 'TNZ-337', type: 'orifice', from: 'tin', to: 'ambient', CdA: 3.1e-5, hidden: true },
    // gas leaving the discharge lines through the throttles before the liquid arrives
    { id: 'THR-OXG', type: 'orifice', from: 'oxman', to: 'ambient', CdA: 9.0e-6, hidden: true },
    { id: 'THR-FUG', type: 'orifice', from: 'fuman', to: 'ambient', CdA: 8.0e-6, hidden: true },
  ],
  lines: [
    { id: 'ox', fluid: FLUIDS3.water, tank: 'oxu', manifold: 'oxman', chamber: 'ambient', gasPath: 'THR-OXG',
      Vtank: litre(60), Vman: cc(150), inertance: 2.0e4, CdAline: 2.3e-5,
      CdAinj: 8.5e-6, CdAinjGas: 9.0e-6, wetFrom: 0.5, jetAxial: 0,
      valve: { id: 'DV-414', CdA: 1.2e-4, normally: 'closed', delay: 0.05, strokeOpen: 0.3, strokeClose: 0.25, char: 'ball' },
      throttle: { id: 'FCV-418', initial: 0, rate: 0.5 } },
    { id: 'fu', fluid: FLUIDS3.water, tank: 'fuu', manifold: 'fuman', chamber: 'ambient', gasPath: 'THR-FUG',
      Vtank: litre(60), Vman: cc(150), inertance: 2.0e4, CdAline: 2.2e-5,
      CdAinj: 7.0e-6, CdAinjGas: 8.0e-6, wetFrom: 0.5, jetAxial: 0,
      valve: { id: 'DV-424', CdA: 1.2e-4, normally: 'closed', delay: 0.05, strokeOpen: 0.3, strokeClose: 0.25, char: 'ball' },
      throttle: { id: 'FCV-428', initial: 0, rate: 0.5 } },
  ],
  turbopump: {
    Nd: TPA.Nd,
    J: 7.5e-4,                      // kg·m², turbine disc, shaft, two impellers
    pumps: {
      ox: { id: 'P-OX', H0: TPA.ox.H0, Q0: TPA.ox.mdot / TPA.ox.rho, rhoD: TPA.ox.rho, eta: TPA.ox.eta, npshr0: TPA.ox.npshr0,
            CdAsuc: 1.2e-4, Isuc: 2000, mc: 0.3, hAc: 1.5 },
      fu: { id: 'P-FU', H0: TPA.fu.H0, Q0: TPA.fu.mdot / TPA.fu.rho, rhoD: TPA.fu.rho, eta: TPA.fu.eta, npshr0: TPA.fu.npshr0,
            CdAsuc: 1.2e-4, Isuc: 2000, mc: 0.3, hAc: 1.5 },
    },
    turbine: { el: 'TNZ-337', vol: 'tin', rm: 0.05, alpha: 20, phi: 0.95, psi: 0.85, etaX: 0.75, kw: 1.9e-9, mdotD: 0.11 },
    bearings: { c0: 0.010, c1: 1.0e-5, C: 60, hA0: 0.6, hAflow: 8, hAgas: 1.0, pumpEnd: 'ox', turbineEnd: 'fu' },
  },
  thrustStand: { fn: 60, zeta: 0.1 },
  scales: { ox: { tarePerPa: 0.040 / psi(100), rhoCal: 998 }, fu: { tarePerPa: 0.040 / psi(100), rhoCal: 998 } },
};
