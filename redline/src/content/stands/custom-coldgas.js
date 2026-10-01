/* A cold-gas stand built from a hardware configuration — your hardware,
   from its datasheets. No DOM.

   buildColdGasStand(cfg) returns a stand definition of exactly TS-1's
   shape (same tags, same channels, same limits and stations), with every
   physical parameter taken from the configuration (content/hardware/
   schema.js). Everything downstream — the console, the poll, the redlines,
   the reductions, the analysis — works on it unchanged.

   The conversions are where the honesty is:
   · Cv → effective flow area: CdA = Cv × 1.6967e-5 m² (the definition of
     Cv for an incompressible flow, applied to the gas model's orifice
     equation; good to a few per cent for valves with a pressure-recovery
     factor near 0.7, which most small valves have).
   · tubing → resistance: K = f·L/D + 0.9 per fitting + 1.5 (entry and
     exit), f = 0.02; and the tube's volume plus the stated extra volume.
   · regulator droop: the datasheet flow-curve point (droop ΔP at a flow Q
     and an inlet pressure) sets the regulator's proportional band, so the
     model droops by the stated amount at the stated flow.
   · solenoid: coil resistance from voltage and power; the inductance from
     the opening response time (taken as 65 % electrical delay, 35 %
     armature stroke); the pull-in current's growth with pressure from the
     MOPD (at the MOPD it needs 90 % of the steady coil current).
   Each of these is an estimate where the datasheet is silent, and every
   such field says so in the editor. */

import { psi, degC, mm, cc, litre } from '../../lib/units.js';
import ts1 from './ts1-coldgas.js';
import { GASES, prepareGas } from '../../physics/gas.js';
import { val, complete } from '../hardware/schema.js';
import { predictColdGas } from '../../physics/predict.js';

export const CV_TO_CDA = 1.6967e-5;     // m² per Cv
const SCFM = 4.7195e-4;                  // m³/s per SCFM
const P_STD = 101325, T_STD = 288.71;    // 14.696 psia, 60 °F

const series = (...a) => { const s = a.filter(x => x > 0).reduce((t, x) => t + 1 / (x * x), 0); return s > 0 ? 1 / Math.sqrt(s) : 0; };
const tube = (idMm, Lm, fittings = 2) => {
  const D = mm(idMm), A = Math.PI / 4 * D * D;
  const K = 0.02 * Lm / D + 0.9 * fittings + 1.5;
  return { A, CdA: A / Math.sqrt(K), V: A * Lm };
};

/* A short stable hash, so predictions of different configurations do not
   share a cache entry. */
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

export function buildColdGasStand(cfgIn) {
  const cfg = complete(cfgIn);
  const v = k => val(cfg, k);
  const gas = prepareGas(GASES[v('gas')] || GASES.N2);
  const AMB = { P: v('Pamb') * 6894.757, T: degC(v('Tamb')) };
  const g = x => AMB.P + psi(x);
  const P = ts1.physics;
  const vol = id => P.volumes.find(x => x.id === id);
  const el = id => P.elements.find(x => x.id === id);

  // supply line: bottle → isolation → regulator
  const sup = tube(v('supID'), v('supL'), 4);
  const supV = sup.V + cc(v('supExtra'));
  // feed line: regulator → filter → fire valve
  const feed = tube(v('feedID'), v('feedL'), v('feedFittings'));
  const feedV = feed.V + cc(v('feedExtra'));

  // regulator: droop calibrated from the datasheet flow-curve point
  const regCdA = v('regCv') * CV_TO_CDA;
  const rhoStd = P_STD / (gas.R * T_STD);
  const mDroop = v('droopQ') * SCFM * rhoStd;
  const PinD = AMB.P + psi(v('droopPin'));
  const mMax = regCdA * PinD * gas.fChoke / Math.sqrt(gas.R * AMB.T);
  const xD = mMax > 0 ? Math.min(1, mDroop / mMax) : 1;
  const band = xD > 0.02 ? psi(v('droopP')) / xD : psi(0.1 * v('regOutMax'));

  // solenoid
  const svCdA = v('svCv') > 0 ? v('svCv') * CV_TO_CDA : 0.8 * Math.PI / 4 * mm(v('svOrifice')) ** 2;
  const volts = v('svVolts'), ohms = volts * volts / Math.max(v('svWatts'), 0.1), Iss = volts / ohms;
  const tOpen = v('svTopen') / 1e3, tClose = v('svTclose') / 1e3;
  const henry = Math.max(0.002, 0.65 * tOpen * ohms / 0.635);
  const pullIn = 0.47 * Iss, dropOut = 0.28 * Iss;
  const pullInPerPa = (0.9 - 0.47) * Iss / Math.max(psi(v('svMOPD')), psi(5));

  const rv = v('rvFitted'), iv = v('ivFitted');
  const lowLimit = Math.min(rv ? v('rvSet') : Infinity, v('mawp'));

  const physics = {
    ...P,
    gas: gas.id,
    ambient: AMB,
    volumes: P.volumes.map(x => {
      if (x.id === 'tank') return { ...x, V: litre(v('bottleV')), P0: g(v('fillP')), T0: AMB.T };
      if (x.id === 'sup') return { ...x, V: 0.6 * supV };
      if (x.id === 'hp') return { ...x, V: 0.4 * supV };
      if (x.id === 'lp') return { ...x, V: 0.35 * feedV };
      if (x.id === 'feed') return { ...x, V: 0.65 * feedV };
      if (x.id === 'chamber') return { ...x, V: cc(v('plenum')) };
      return x;
    }),
    elements: P.elements.map(x => {
      switch (x.id) {
        case 'HV-100': return { ...x, CdA: series(v('hvCv') * CV_TO_CDA, sup.CdA) };
        case 'IV-101': return iv ? { ...x, CdA: v('ivCv') * CV_TO_CDA, strokeOpen: v('ivStroke'), strokeClose: 0.7 * v('ivStroke') }
          : { ...x, CdA: 1e-3, delay: 0, strokeOpen: 0.01, strokeClose: 0.01 };
        case 'PR-101': return { ...x, CdA: regCdA, band, tau: v('regTau') / 1e3, spe: v('spe') / 100, PinRef: psi(v('fillP')),
          domeRate: psi(v('setRate')), domeTau: v('regLoading') === 'spring' ? 0.1 : 0.3 };
        case 'RV-201': return { ...x, CdA: rv ? v('rvCv') * CV_TO_CDA : 0, set: rv ? psi(v('rvSet')) : psi(1e6) };
        case 'F-201': return { ...x, CdA: series(v('filtFitted') ? v('filtCv') * CV_TO_CDA : 0, feed.CdA) };
        case 'SV-301': return { ...x, CdA: svCdA, strokeOpen: Math.max(2e-4, 0.35 * tOpen), strokeClose: Math.max(2e-4, 0.4 * tClose),
          pilotMinDP: v('svType') === 'pilot' ? psi(v('svMinDP')) : 0,
          coil: { volts, ohms, henry, backEmf: x.coil.backEmf, pullIn, pullInPerPa, dropOut } };
        case 'NZ-401': return { ...x, nozzle: { throatDia: mm(v('throat')), exitDia: mm(v('exit')), Cd: v('Cd'), halfAngleDeg: v('halfAngle') } };
        default: return x;
      }
    }),
    thrustStand: { ...P.thrustStand, fn: v('standFn'), zeta: v('standZeta'), tarePerPa: v('tare') / psi(100) },
  };

  const supFS = v('ptSupFS'), lpFS = v('ptLpFS'), acc = v('ptAcc') / 100;
  const sensors = ts1.sensors
    .filter(s => s.id !== 'FT-201' || v('flowmeter'))
    .map(s => {
      if (s.kind === 'PT') {
        const fs = ['PT-101', 'PT-102'].includes(s.id) ? supFS : lpFS;
        return { ...s, range: [0, psi(fs)], noise: psi(fs) * 0.00012, hum: psi(fs) * 0.00008, zeroSigma: psi(fs) * acc * 0.5,
          tau: s.id === 'PT-401' ? Math.min(v('ptTau'), 0.5) / 1e3 : v('ptTau') / 1e3 };
      }
      if (s.id === 'LC-501') { const r = v('lcRange'); return { ...s, range: [-r, r], noise: r * 1.2e-4, hum: r * 8e-5, zeroSigma: r * v('lcAcc') / 100 * 2, shuntCal: r / 2 }; }
      if (s.id === 'FT-201') { const r = v('fmRange') / 1e3; return { ...s, range: [0, r], noise: r * 7e-4, zeroSigma: r * 7e-4 }; }
      if (s.id === 'SV-301-I') return { ...s, range: [0, Math.max(0.2, 1.7 * Iss)], noise: 0.0026 * Iss, zeroSigma: 0.0017 * Iss };
      if (s.id === 'EPC-101' && v('regLoading') === 'spring') return { ...s, desc: 'Regulator setting (hand knob, as set — not a measurement)', noise: 0 };
      return s;
    });

  const ratings = {
    ...ts1.ratings,
    MEOP_LP: psi(v('meop')), RELIEF_LP: rv ? psi(v('rvSet')) : psi(v('mawp')), MAWP_LP: psi(v('mawp')),
    PERSONNEL_MAX: psi(v('personnel')),
    REG_MAX_CMD: psi(Math.min(v('regOutMax'), 0.96 * lowLimit)),
    SUPPLY_MIN: psi(Math.min(v('fillP') * 0.9, v('meop') + 300)),
  };
  const redline = psi(0.94 * lowLimit);
  const limits = ts1.limits.map(L => {
    if (L.id === 'PT101-LO') return { ...L, lo: ratings.SUPPLY_MIN };
    if (L.id === 'PT101-HI') return { ...L, hi: psi(1.1 * v('serviceP')) };
    if (L.id === 'PT201-RL' || L.id === 'PT301-RL') return { ...L, hi: redline };
    // coil-current limits scale with the coil: TS-1's are for a 1.17 A coil
    if (L.id === 'SV301-I-LO') return { ...L, lo: 0.77 * Iss };
    if (L.id === 'SV301-I-UNCMD') return { ...L, hi: 0.13 * Iss };
    return L;
  });

  const cdaTxt = (cv, cda) => `Cv ${cv} (CdA ${(cda * 1e6).toFixed(2)} mm²)`;
  const src = k => { const s = cfg.f[k]?.src; return s === 'datasheet' ? '' : s === 'measured' ? ' (measured)' : s === 'estimate' ? ' (estimate)' : ' (default)'; };
  const comp = { ...ts1.components };
  comp['N2-K'] = { ...comp['N2-K'], tag: `${gas.id} SUPPLY`, name: `${gas.name} supply bottle`,
    specs: { 'Water volume': `${v('bottleV')} L${src('bottleV')}`, 'Service pressure': `${v('serviceP')} psig`, 'Fill at start of test': `${v('fillP')} psig`, 'Gas': gas.name } };
  comp['IV-101'] = iv ? { ...comp['IV-101'], specs: { ...comp['IV-101'].specs, 'Flow': cdaTxt(v('ivCv'), v('ivCv') * CV_TO_CDA), 'Stroke': `≈${v('ivStroke')} s open` } }
    : { ...comp['IV-101'], name: 'Isolation valve — NOT FITTED', kind: 'Not fitted', specs: { 'Note': 'This stand has no remote isolation: the bottle valve is the only one.' } };
  comp['PR-101'] = { ...comp['PR-101'], name: `Regulator — ${v('regModel')}`, kind: v('regLoading') === 'spring' ? 'Spring-loaded pressure-reducing regulator' : 'Dome-loaded pressure-reducing regulator',
    specs: { 'Flow': cdaTxt(v('regCv'), regCdA) + src('regCv'), 'Outlet range': `0–${v('regOutMax')} psig`, 'Max inlet': `${v('regInMax')} psig`,
      'Droop (datasheet point)': `${v('droopP')} psi at ${v('droopQ')} SCFM, ${v('droopPin')} psig in${src('droopP')}`, 'Supply-pressure effect': `${v('spe')} psi per 100 psi${src('spe')}`,
      'Model band': `${(band / psi(1)).toFixed(1)} psi for full stroke` } };
  comp['RV-201'] = rv ? { ...comp['RV-201'], specs: { 'Set pressure': `${v('rvSet')} psig`, 'Flow': cdaTxt(v('rvCv'), v('rvCv') * CV_TO_CDA), 'Protects': `low side, MAWP ${v('mawp')} psig` } }
    : { ...comp['RV-201'], name: 'Relief valve — NOT FITTED', kind: 'Not fitted', specs: { 'Note': 'Nothing protects the low side if the regulator fails open. The redlines are the only protection.' } };
  comp['F-201'] = { ...comp['F-201'], name: v('filtFitted') ? 'Inline filter and feed line' : 'Feed line (no filter)',
    specs: { 'Filter': v('filtFitted') ? `Cv ${v('filtCv')}` : 'none', 'Feed line': `${v('feedID')} mm ID × ${v('feedL')} m, ${v('feedFittings')} fittings`, 'Combined CdA': `${(series(v('filtFitted') ? v('filtCv') * CV_TO_CDA : 0, feed.CdA) * 1e6).toFixed(2)} mm²` } };
  comp['SV-301'] = { ...comp['SV-301'], name: `Fire valve — ${v('svModel')}`, kind: `${v('svType') === 'pilot' ? 'Pilot-operated' : 'Direct-acting'} solenoid, normally closed`,
    specs: { 'Coil': `${volts} V DC, ${v('svWatts')} W (${ohms.toFixed(1)} Ω)`, 'Flow': v('svCv') > 0 ? cdaTxt(v('svCv'), svCdA) : `orifice ${v('svOrifice')} mm (CdA ${(svCdA * 1e6).toFixed(2)} mm², Cd 0.8 assumed)`,
      'MOPD': `${v('svMOPD')} psi`, 'Response': `${v('svTopen')} ms open / ${v('svTclose')} ms close${src('svTopen')}`, ...(v('svType') === 'pilot' ? { 'Min ΔP': `${v('svMinDP')} psi` } : {}) } };
  const At = Math.PI / 4 * v('throat') ** 2, Ae = Math.PI / 4 * v('exit') ** 2;
  comp['CGT-1'] = { ...comp['CGT-1'], name: v('thrModel'), kind: 'Test article (custom)',
    specs: { 'Throat Ø': `${v('throat')} mm${src('throat')}`, 'Exit Ø': `${v('exit')} mm`, 'Expansion ratio': (Ae / At).toFixed(2), 'Half-angle': `${v('halfAngle')}°`, 'Cd': `${v('Cd')}${src('Cd')}`, 'Plenum': `${v('plenum')} cc` },
    text: 'Your thruster, as entered in HARDWARE. The prediction is only as good as the throat diameter and Cd — the first numbers a real test pins down.' };
  comp['LC-501'] = { ...comp['LC-501'], specs: { 'Range': `±${v('lcRange')} N`, 'Accuracy': `${v('lcAcc')} % FS`, 'Stand natural frequency': `${v('standFn')} Hz${src('standFn')}`, 'Pressure tare': `${v('tare')} N per 100 psi${src('tare')}` } };

  const key = hash(JSON.stringify(cfg.f));
  const pid = {
    ...ts1.pid,
    symbols: ts1.pid.symbols.map(s => {
      if (s.type === 'bottle') return { ...s, gas: gas.id === 'N2' ? 'N₂' : gas.id === 'AR' ? 'Ar' : gas.id, size: `${v('bottleV')} L` };
      if (s.id === 'RV-201') return { ...s, set: rv ? String(v('rvSet')) : '—', notFitted: !rv };
      if (s.id === 'F-201') return { ...s, sub: v('filtFitted') ? `Cv ${v('filtCv')}` : 'line only' };
      if (s.id === 'IV-101') return { ...s, notFitted: !iv };
      return s;
    }),
    labels: ts1.pid.labels.map(L => (L.text?.startsWith('LOW-PRESSURE SECTION') ? { ...L, text: `LOW-PRESSURE SECTION · MAWP ${v('mawp')} psig` }
      : L.text?.startsWith('HIGH-PRESSURE SECTION') ? { ...L, text: `HIGH-PRESSURE SECTION · ${v('serviceP')} psig BOTTLE` } : L)),
    instruments: ts1.pid.instruments.filter(i => i.id !== 'FT-201' || v('flowmeter')),
  };
  return {
    ...ts1,
    id: 'TS-C',
    family: 'TS-1',
    custom: cfg,
    predictKey: `TS-C-${key}`,
    name: `Custom stand · ${cfg.name}`,
    short: `Custom · ${cfg.name}`,
    article: `${v('thrModel')} · ${cfg.name}`,
    fictional: false,
    physics, sensors, ratings, limits, pid,
    components: comp,
    componentSensors: { ...ts1.componentSensors, ...(v('flowmeter') ? {} : { 'F-201': ['PT-201', 'PT-301', 'DP-F201'], 'CGT-1': ['PT-401', 'TC-401', 'MDOT-C'] }) },
    faults: [],
    inspections: [],
    consoleValves: ts1.consoleValves.filter(cv => cv.id !== 'IV-101' || iv),
    nominal: { throatDia: mm(v('throat')), exitDia: mm(v('exit')), Cd: v('Cd') },
    predict(S) {
      let sup = S.daq.online ? S.daq.latest('PT-101') : NaN;
      if (!(sup > psi(50))) sup = psi(v('fillP'));
      const c = S.controller;
      const regSet = c.regSet > psi(5) ? c.regSet : (S.request?.regSet ?? psi(Math.min(v('meop'), 150)));
      return predictColdGas(S.def, { supplyGauge: sup, regSet });
    },
  };
}

/* Pre-test checks on a configuration: things that are wrong, or will make
   the test not do what was meant, before anything is pressurised. Each is
   { level: 'error' | 'warn' | 'info', text }. */
export function checkConfig(cfgIn, { regSet = null } = {}) {
  const cfg = complete(cfgIn);
  const v = k => val(cfg, k), out = [];
  const add = (level, text) => out.push({ level, text });
  const set = regSet ?? v('meop');
  if (v('fillP') > v('serviceP')) add('error', `Fill pressure ${v('fillP')} psig is above the bottle's service pressure ${v('serviceP')} psig.`);
  if (v('fillP') > v('regInMax')) add('error', `Fill pressure ${v('fillP')} psig is above the regulator's maximum inlet ${v('regInMax')} psig.`);
  if (v('rvFitted') && v('rvSet') > v('mawp')) add('error', `Relief set ${v('rvSet')} psig is above the low-side MAWP ${v('mawp')} psig: it would not protect it.`);
  if (v('rvFitted') && v('rvSet') < 1.1 * v('meop')) add('warn', `Relief set ${v('rvSet')} psig is within 10 % of the MEOP ${v('meop')} psig: it may lift (or simmer) during tests.`);
  if (!v('rvFitted')) add('warn', 'No relief valve on the regulator outlet: a regulator that fails open takes the low side to bottle pressure.');
  if (v('meop') > v('regOutMax')) add('error', `MEOP ${v('meop')} psig is above the regulator's outlet range (${v('regOutMax')} psig).`);
  if (set > v('svMOPD')) add('error', `Test pressure ${set} psig is above the solenoid's MOPD ${v('svMOPD')} psi: it will not open.`);
  if (v('svType') === 'pilot' && set < v('svMinDP')) add('error', `Test pressure ${set} psig is below the pilot valve's minimum differential ${v('svMinDP')} psi: it will not open fully.`);
  for (const [k, fs] of [['ptLpFS', set * 1.3], ['ptSupFS', v('fillP')]]) if (v(k) < fs) add('warn', `${k === 'ptLpFS' ? 'Low-side' : 'Supply'} transducers (${v(k)} psig full scale) are below the pressures they will see (≈${fs.toFixed(0)} psig).`);
  // a quick steady estimate: choked throat at the set pressure
  const gas = prepareGas(GASES[v('gas')] || GASES.N2);
  const Pa = v('Pamb') * 6894.757, Pc = Pa + psi(set);
  const At = Math.PI / 4 * mm(v('throat')) ** 2, Ae = Math.PI / 4 * mm(v('exit')) ** 2;
  if (Pc < Pa / 0.528) add('warn', 'At this pressure the throat is not choked: thrust and flow will be very sensitive to chamber pressure.');
  const mdot = v('Cd') * At * Pc * gas.fChoke / Math.sqrt(gas.R * degC(v('Tamb')));
  const F = Math.max(0, v('Cd') * At * Pc * 1.3 - Pa * Ae);   // a rough Cf, for range checks only
  if (F > 0.8 * v('lcRange')) add('warn', `Expected thrust ≈ ${F.toFixed(1)} N is close to or above the load cell's ±${v('lcRange')} N.`);
  if (F < 0.02 * v('lcRange')) add('info', `Expected thrust ≈ ${F.toFixed(2)} N is under 2 % of the load cell's range: noise and zero drift will matter.`);
  if (v('flowmeter') && mdot > v('fmRange') / 1e3) add('warn', `Expected flow ≈ ${(mdot * 1e3).toFixed(1)} g/s is above the flowmeter's ${v('fmRange')} g/s range.`);
  const regMax = v('regCv') * CV_TO_CDA * (Pa + psi(v('fillP'))) * gas.fChoke / Math.sqrt(gas.R * degC(v('Tamb')));
  if (mdot > 0.5 * regMax) add('warn', `Expected flow is ${(100 * mdot / regMax).toFixed(0)} % of what the regulator can pass at full supply: expect heavy droop, worse as the bottle blows down.`);
  const svFlow = (v('svCv') > 0 ? v('svCv') * CV_TO_CDA : 0.8 * Math.PI / 4 * mm(v('svOrifice')) ** 2);
  if (svFlow < 2 * v('Cd') * At) add('warn', `The fire valve's flow area is only ${(svFlow / (v('Cd') * At)).toFixed(1)}× the throat's: a large share of the feed pressure will be lost across the valve.`);
  const eps = Ae / At;
  if (eps > 4 && Pc / Pa < 10) add('info', `Expansion ratio ${eps.toFixed(1)} at a ${(Pc / Pa).toFixed(0)}:1 pressure ratio: the nozzle will be over-expanded at this site; expect separation and lower thrust than a vacuum design suggests.`);
  const bottleMass = (Pa + psi(v('fillP'))) * litre(v('bottleV')) / (gas.R * degC(v('Tamb')));
  add('info', `Gas on board ≈ ${bottleMass.toFixed(2)} kg; at ≈ ${(mdot * 1e3).toFixed(1)} g/s that is ≈ ${(bottleMass / Math.max(mdot, 1e-6)).toFixed(0)} s of flow before the bottle is empty (far less before the regulator drops out).`);
  const est = cfg ? Object.entries(cfg.f).filter(([, x]) => x.src === 'default' || x.src === 'estimate').length : 0;
  if (est) add('info', `${est} fields are still at a default or an estimate: the prediction is only as good as those.`);
  return out;
}
