/* TS-3 rebuilt as an engine stand: BPE-3, a gas-generator cycle engine on
   TPA-1. Physics data. FICTIONAL.

   The nitrogen bank and header are TS-3's. The two run tanks now hold LOX
   and ethanol at low pressure (the pumps need only enough suction head to
   keep their inducers out of cavitation). Each pump discharges through a
   main valve (MOV-414, MFV-424) to the main injector; a tap off each
   discharge feeds the GAS GENERATOR through its own valve (GOV-416,
   GFV-426), a throttle (GCV-417, GCV-427) and a calibrated orifice. The
   gas generator burns very fuel-rich — cool enough for an uncooled
   turbine — and its gas drives TPA-1's turbine and leaves through the
   exhaust duct beside the engine. To start, the turbine is spun on
   nitrogen from the bank through PR-330 and the start valve TSV-332 into
   the same turbine manifold; once the gas generator burns, the start gas
   is shut off and the engine runs on its own (bootstrap).

   BPE-3: ~2 kN, ablatively cooled (a silica-phenolic liner in a steel
   case), MR ≈ 1.6, Pc ≈ 2.4 MPa. The ablative sets the burn time: its char
   front eats into the liner while it burns, the throat erodes, and the
   case warms as the liner thins. */

import { psi, degC, cc, litre, mm, P_STD } from '../../lib/units.js';
import { TPA } from './ts3-physics.js';
import { FLUIDS, GAS_MAIN, GAS_GG } from '../../physics/propellants.js';

export const AMB = { P: P_STD, T: degC(20) };
const g = x => AMB.P + psi(x);

/* Fluids: water, and the real propellants (physics/propellants.js). The
   main chamber burns on CEA's equilibrium tables; the gas generator on its
   fuel-rich table, with soot and methane suppressed. */
export const FLUIDS_G = FLUIDS;

/* The engine as drawn (what the prediction uses; the as-built engine
   differs a little — it always does). */
export const DESIGN_G = {
  throatDia: mm(26.2), exitDia: mm(57), etaCstar: 0.95, etaGG: 0.97,
  Pc: 2.4e6, MR: 1.6, MRgg: 0.33,
  CdAox: 6.41e-6, CdAfu: 5.58e-6,               // main injector
  CdAggOx: 1.01e-7, CdAggFu: 3.63e-7,           // GG orifices (with its injector)
  turbNozzleDia: mm(6.35),                      // TPA-1's turbine nozzles as one equivalent throat
};
export const AS_BUILT_G = { ox: 0.97, fu: 1.02, ggOx: 1.0, ggFu: 1.0, etaCstar: 0.94, etaGG: 0.96 };

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
    { id: 'purge', V: cc(40), wall: small },
    { id: 'oxpl', V: cc(10), wall: small },
    { id: 'fupl', V: cc(10), wall: small },
    { id: 'oxman', V: cc(60), wall: small },       // main injector manifolds (gas part)
    { id: 'fuman', V: cc(50), wall: small },
    // owned by the combustion models: the main chamber, and the gas
    // generator with the turbine inlet manifold
    { id: 'chamber', V: litre(0.7), external: true },
    { id: 'ggc', V: cc(250), external: true },
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
    // turbine start gas: spins the turbine until the gas generator takes over
    { id: 'PR-330', type: 'regulator', from: 'hp', to: 'treg', CdA: 1.6e-5, band: psi(60), tau: 0.003, spe: 0.01, PinRef: psi(2400), domeRate: psi(400), domeTau: 0.05 },
    { id: 'RV-331', type: 'relief', from: 'treg', to: 'ambient', CdA: 3.0e-5, set: psi(500), accumulation: 0.1, blowdown: 0.08 },
    { id: 'VV-338', type: 'valve', from: 'treg', to: 'ambient', CdA: 6.0e-6, normally: 'closed', delay: 0.012, stroke: 0.02 },
    { id: 'TSV-332', type: 'valve', from: 'treg', to: 'ggc', CdA: 1.2e-4, normally: 'closed', delay: 0.03, strokeOpen: 0.08, strokeClose: 0.06, char: 'ball' },
    // purges: the main injector (both sides) and the gas generator
    { id: 'PR-630', type: 'regulator', from: 'hp', to: 'purge', CdA: 4.0e-6, band: psi(30), tau: 0.002, spe: 0.012, PinRef: psi(2400), domeRate: psi(40), domeTau: 0.3 },
    { id: 'PV-631', type: 'valve', from: 'purge', to: 'oxpl', CdA: 4.0e-6, normally: 'closed', delay: 0.015, stroke: 0.02 },
    { id: 'CV-633', type: 'check', from: 'oxpl', to: 'oxman', CdA: 1.2e-5, crack: psi(2) },
    { id: 'PV-632', type: 'valve', from: 'purge', to: 'fupl', CdA: 4.0e-6, normally: 'closed', delay: 0.015, stroke: 0.02 },
    { id: 'CV-634', type: 'check', from: 'fupl', to: 'fuman', CdA: 1.2e-5, crack: psi(2) },
    { id: 'PV-635', type: 'valve', from: 'purge', to: 'ggc', CdA: 2.5e-6, normally: 'closed', delay: 0.015, stroke: 0.02 },
    { id: 'INJ-OXG', type: 'orifice', from: 'oxman', to: 'chamber', CdA: 8.0e-6, hidden: true },
    { id: 'INJ-FUG', type: 'orifice', from: 'fuman', to: 'chamber', CdA: 8.5e-6, hidden: true },
  ],
  lines: [
    { id: 'ox', fluid: FLUIDS_G.water, tank: 'oxu', manifold: 'oxman', chamber: 'chamber', gasPath: 'INJ-OXG',
      Vtank: litre(60), Vman: cc(60), inertance: 2.0e4, CdAline: 4.0e-5, heatLeak: 1.5,   // W/K, insulated tank (LOX)
      CdAinj: DESIGN_G.CdAox * AS_BUILT_G.ox, CdAinjGas: 8.0e-6, wetFrom: 0.5,
      valve: { id: 'MOV-414', CdA: 1.2e-4, normally: 'closed', delay: 0.05, strokeOpen: 0.3, strokeClose: 0.2, char: 'ball' },
      tap: { CdA: DESIGN_G.CdAggOx * AS_BUILT_G.ggOx,
        valve: { id: 'GOV-416', CdA: 2.0e-5, normally: 'closed', delay: 0.02, strokeOpen: 0.06, strokeClose: 0.05 },
        throttle: { id: 'GCV-417', initial: 1, rate: 0.6 } } },
    { id: 'fu', fluid: FLUIDS_G.water, tank: 'fuu', manifold: 'fuman', chamber: 'chamber', gasPath: 'INJ-FUG',
      Vtank: litre(60), Vman: cc(50), inertance: 2.0e4, CdAline: 4.0e-5,
      CdAinj: DESIGN_G.CdAfu * AS_BUILT_G.fu, CdAinjGas: 8.5e-6, wetFrom: 0.5,
      valve: { id: 'MFV-424', CdA: 1.2e-4, normally: 'closed', delay: 0.05, strokeOpen: 0.3, strokeClose: 0.2, char: 'ball' },
      tap: { CdA: DESIGN_G.CdAggFu * AS_BUILT_G.ggFu,
        valve: { id: 'GFV-426', CdA: 2.0e-5, normally: 'closed', delay: 0.02, strokeOpen: 0.06, strokeClose: 0.05 },
        throttle: { id: 'GCV-427', initial: 1, rate: 0.6 } } },
  ],
  chamber: {
    V: litre(0.7), throatDia: DESIGN_G.throatDia, exitDia: DESIGN_G.exitDia, Cd: 0.98,
    gas: GAS_MAIN, cstar: GAS_MAIN.cstar, MRnom: DESIGN_G.MR, etaCstar: AS_BUILT_G.etaCstar, Pnom: DESIGN_G.Pc, igniter: 'IGN-501',
    fChug: 160, fHF: 2400, burnScale: 4,
    // silica-phenolic liner, 14 mm: char rate and throat erosion at Pnom
    ablative: { t: mm(14), rate: mm(0.15), erode: mm(0.008), Tsurf: 1900, lam: mm(3), G: 40, C: 3000, Gamb: 3 },
  },
  gg: {
    volume: 'ggc', V: cc(250), throatDia: DESIGN_G.turbNozzleDia, exitDia: DESIGN_G.turbNozzleDia, Cd: 0.98,
    gas: GAS_GG, cstar: GAS_GG.cstar, MRnom: DESIGN_G.MRgg, etaCstar: AS_BUILT_G.etaGG, Pnom: 1.2e6, igniter: 'IGN-502',
    mrMin: 0.12, mrMax: 3, ignMin: 2e-5,
    fChug: 260, fHF: 6000,
    // a small steel can: heat-sink walls (they hardly matter at 900 K)
    wall: { Cch: 600, Cth: 200, hAch: 6, hAth: 4, Gcond: 3, Gamb: 2 },
  },
  turbopump: {
    Nd: TPA.Nd,
    J: 7.5e-4,
    pumps: {
      ox: { id: 'P-OX', H0: TPA.ox.H0, Q0: TPA.ox.mdot / TPA.ox.rho, rhoD: TPA.ox.rho, eta: TPA.ox.eta, npshr0: TPA.ox.npshr0,
            CdAsuc: 1.2e-4, Isuc: 2000, mc: 0.3, hAc: 1.5 },
      fu: { id: 'P-FU', H0: TPA.fu.H0, Q0: TPA.fu.mdot / TPA.fu.rho, rhoD: TPA.fu.rho, eta: TPA.fu.eta, npshr0: TPA.fu.npshr0,
            CdAsuc: 1.2e-4, Isuc: 2000, mc: 0.3, hAc: 1.5 },
    },
    // the turbine's nozzles are the gas generator's throat (ggc → exhaust)
    turbine: { el: null, vol: null, rm: 0.05, alpha: 20, phi: 0.95, psi: 0.85, etaX: 0.75, kw: 1.9e-9, mdotD: 0.045 },
    // on the engine the turbine-end bearing has a heat shield between it and
    // the 850 K gas, and fuel flowing through it for cooling
    bearings: { c0: 0.010, c1: 1.0e-5, C: 60, hA0: 0.6, hAflow: 12, hAgas: 0.25, pumpEnd: 'ox', turbineEnd: 'fu' },
  },
  auxCommands: ['IGN-501', 'IGN-502'],
  thrustStand: { fn: 45, zeta: 0.08 },
  scales: { ox: { tarePerPa: 0.040 / psi(100), rhoCal: 998 }, fu: { tarePerPa: 0.040 / psi(100), rhoCal: 998 } },
};
