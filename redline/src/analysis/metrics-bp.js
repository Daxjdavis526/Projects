/* Cold-flow data reduction for TS-2. No DOM.

   Per side, from the recorded channels:
   · steady flow from the turbine meter, and the SAME flow weighed — the
     slope of the tank scale over the steady window. They should agree; the
     difference is the meter's error (or the scale's).
   · injector ΔP (manifold − chamber) and the flow coefficient
         CdA = ṁ / √(2ρ·ΔP)
     with ρ the simulant's density. This is the injector's real number,
     the one the drawing only estimated.
   · priming time: main-valve command to manifold pressure at 90 % of steady.
   · tank droop (lock-up minus flowing) and the surge at the valve inlet
     when the valve closes.
   And across both sides: the mixture ratio as flowed, and the mixture
   ratio the same injector will give on the real propellants at the design
   injector ΔP — the reason anyone does a cold flow. */

import { meanIn, stdIn, maxIn, crossing, edges, integrate } from './metrics.js';
import { G0 } from '../lib/units.js';

const SIDES = [
  { key: 'Ox', name: 'Oxidiser', cmd: 'MOV-713-CMD', man: 'PT-715', vi: 'PT-713', tank: 'PT-710', ft: 'FT-714', wt: 'WT-716', fluid: 'oxidiser' },
  { key: 'Fu', name: 'Fuel', cmd: 'MFV-723-CMD', man: 'PT-725', vi: 'PT-723', tank: 'PT-720', ft: 'FT-724', wt: 'WT-726', fluid: 'fuel' },
];

/* Least-squares slope of V against T over a window. */
function slopeIn(T, V, t0, t1) {
  let n = 0, st = 0, sv = 0, stt = 0, stv = 0;
  for (let k = 0; k < T.length; k++) {
    const t = T[k]; if (t < t0) continue; if (t > t1) break;
    const v = V[k]; if (Number.isNaN(v)) continue;
    n++; st += t; sv += v; stt += t * t; stv += t * v;
  }
  if (n < 5) return NaN;
  const d = n * stt - st * st;
  return d > 0 ? (n * stv - st * sv) / d : NaN;
}

export function computeMetricsBP(run, def) {
  const d = run.data, T = d.T;
  const ch = id => d.series(id);
  if (T.length < 10) return null;
  if (run.meta?.config?.loaded === 'propellants') return computeMetricsHot(run, def);
  const Pc = ch('PT-801');
  const D = def.design, rho = def.fluids[D.simulant].rho;
  const out = { kind: 'coldflow', items: [], windows: {}, summary: {}, sides: [] };
  const push = (key, label, value, quantity, note = '') => out.items.push({ key, label, value, quantity, note });
  const S = out.summary;
  let tFirst = Infinity, tLast = -Infinity;
  for (const sd of SIDES) {
    const cmd = ch(sd.cmd);
    if (!cmd) continue;
    const e = edges(T, cmd);
    if (!e.on.length) continue;
    const tOn = e.on[0], tOff = e.off.find(t => t > tOn) ?? T[T.length - 1];
    tFirst = Math.min(tFirst, tOn); tLast = Math.max(tLast, tOff);
    const dur = tOff - tOn;
    const ss0 = tOn + Math.min(Math.max(0.6, 0.35 * dur), 0.7 * dur), ss1 = tOff - Math.min(0.05, 0.1 * dur);
    const pre0 = Math.max(T[0], tOn - 0.6), pre1 = tOn - 0.02;
    const man = ch(sd.man), ft = ch(sd.ft), wt = ch(sd.wt), tank = ch(sd.tank), vi = ch(sd.vi);
    const mdot = meanIn(T, ft, ss0, ss1);
    const pc = Pc ? meanIn(T, Pc, ss0, ss1) : 0;
    const pm = meanIn(T, man, ss0, ss1);
    const dP = pm - pc;
    const CdA = dP > 0 && mdot > 0 ? mdot / Math.sqrt(2 * rho * dP) : NaN;
    const pmPre = meanIn(T, man, pre0, pre1);
    const t90 = crossing(T, man, tOn, ss1, pmPre + 0.9 * (pm - pmPre), 1);
    const wSlope = slopeIn(T, wt, ss0, ss1);
    const mW = -wSlope;
    const Ptank = meanIn(T, tank, ss0, ss1), Plock = meanIn(T, tank, pre0, pre1);
    const viSS = meanIn(T, vi, ss0, ss1);
    const surge = maxIn(T, vi, tOff, tOff + 0.6).v - viSS;
    const CdAdraw = sd.key === 'Ox' ? D.CdAox : D.CdAfu;
    out.windows['steady' + sd.key] = [ss0, ss1];
    Object.assign(S, {
      ['mdot' + sd.key]: mdot, ['mdotW' + sd.key]: mW, ['err' + sd.key]: mW > 0 ? mdot / mW - 1 : NaN,
      ['dP' + sd.key]: dP, ['CdA' + sd.key]: CdA, ['CdArel' + sd.key]: CdA / CdAdraw,
      ['prime' + sd.key]: t90 - tOn, ['Pt' + sd.key]: Ptank, ['droop' + sd.key]: Plock - Ptank,
      ['dPline' + sd.key]: Ptank - pm, ['surge' + sd.key]: surge, ['sd' + sd.key]: stdIn(T, man, ss0, ss1),
    });
    out.sides.push(sd.key);
    const n = sd.name;
    push('mdot' + sd.key, `${n} flow, steady (${sd.ft})`, mdot, 'massflow');
    push('mdotW' + sd.key, `${n} flow, weighed (−d${sd.wt}/dt)`, mW, 'massflow', 'independent of the meter');
    push('err' + sd.key, `${n} meter vs scale`, S['err' + sd.key], 'ratio', 'fraction; + means the meter reads high');
    push('dP' + sd.key, `${n} injector ΔP (${sd.man} − PT-801)`, dP, 'pressure');
    push('CdA' + sd.key, `${n} injector CdA, measured (water)`, CdA, 'area');
    push('CdArel' + sd.key, `${n} CdA ÷ drawing value`, S['CdArel' + sd.key], 'ratio');
    push('prime' + sd.key, `${n} priming time (cmd → ${sd.man} 90 %)`, t90 - tOn, 'time');
    push('Pt' + sd.key, `${n} tank pressure, flowing (${sd.tank})`, Ptank, 'pressure');
    push('droop' + sd.key, `${n} tank droop (lock-up − flowing)`, Plock - Ptank, 'pressure');
    push('dPline' + sd.key, `${n} feed-line ΔP (tank − manifold)`, Ptank - pm, 'pressure');
    push('surge' + sd.key, `${n} valve-inlet surge at shutdown (${sd.vi})`, surge, 'pressure', 'water hammer');
    if (sd.key === 'Fu' && ch('PT-727')) {
      // a regeneratively cooled engine: the fuel crosses the jacket first
      S.dPjkt = meanIn(T, ch('PT-727'), ss0, ss1) - pm;
      S.CdAjkt = S.dPjkt > 0 && mdot > 0 ? mdot / Math.sqrt(2 * rho * S.dPjkt) : NaN;
      push('dPjkt', 'Cooling-jacket ΔP (PT-727 − PT-725)', S.dPjkt, 'pressure');
      push('CdAjkt', 'Cooling-jacket CdA, measured (water)', S.CdAjkt, 'area');
    }
  }
  if (!out.sides.length) return { kind: 'none', items: [], note: 'No main-valve command in this recording.' };
  out.tOn = tFirst; out.tOff = tLast;
  S.dur = tLast - tFirst;
  if (out.sides.length === 2) {
    S.MR = S.mdotOx / S.mdotFu;
    S.MRw = S.mdotWOx / S.mdotWFu;
    push('MR', 'Mixture ratio as flowed (water, FT)', S.MR, 'ratio');
    push('MRw', 'Mixture ratio as flowed (water, weighed)', S.MRw, 'ratio');
  }
  /* What these flow coefficients mean on the real propellants, at the
     design injector ΔP: ṁ = CdA·√(2ρ_prop·ΔP). */
  const rOx = def.fluids[D.oxidiser].rho, rFu = def.fluids[D.fuel].rho;
  if (Number.isFinite(S.CdAOx)) { S.mdotHotOx = S.CdAOx * Math.sqrt(2 * rOx * D.dPinj); push('mdotHotOx', `Oxidiser flow on ${D.oxidiser} at design ΔP (predicted)`, S.mdotHotOx, 'massflow', `design ${(D.mdotOx * 1e3).toFixed(0)} g/s`); }
  if (Number.isFinite(S.CdAFu)) { S.mdotHotFu = S.CdAFu * Math.sqrt(2 * rFu * D.dPinj); push('mdotHotFu', `Fuel flow on ${D.fuel} at design ΔP (predicted)`, S.mdotHotFu, 'massflow', `design ${(D.mdotFu * 1e3).toFixed(0)} g/s`); }
  if (Number.isFinite(S.mdotHotOx) && Number.isFinite(S.mdotHotFu)) {
    S.MRhot = S.mdotHotOx / S.mdotHotFu;
    push('MRhot', 'Hot-fire mixture ratio, predicted from this cold flow', S.MRhot, 'ratio', `design ${D.MR.toFixed(2)}`);
  }
  return out;
}

/* Hot-fire data reduction for TS-2. No DOM.

   · ignition: the flame detector (OD-804) crossing 3 V, timed from the
     later of the two main-valve commands — the moment both propellants
     were on their way. A late light is a pool of unburned propellant.
   · start: chamber pressure from 10 % to 90 % of steady (rise time) and
     its peak in the first 0.3 s above steady (overshoot). A big overshoot
     is a HARD START.
   · steady state, over the window: Pc, thrust, both flows (meter and
     scale), mixture ratio, injector ΔP and stiffness (ΔP/Pc),
         c*  = Pc·Cd·At / ṁ          (the engine's own figure of merit)
         η_c* = c* / c*_ideal(MR)     (how well it mixes and burns)
         Cf  = F / (Pc·Cd·At)         (the nozzle's)
         Isp = F / (ṁ·g0)
     with Pc absolute and At from the drawing. Every one of these inherits
     the flowmeters' calibration: a meter still set for water reads OX-1
     and FU-1 wrong, and so does everything computed from it.
   · roughness (σ/mean of PT-801) and vibration level.
   · walls: throat and chamber temperature at shutdown and their peak
     afterwards (soak-back), and the impulse after the valves closed. */
const IGN_V = 3;

export function computeMetricsHot(run, def) {
  const d = run.data, T = d.T, ch = id => d.series(id);
  const D = def.design, C = def.physics.chamber, Pa = def.physics.ambient.P;
  const CdAt = C.Cd * Math.PI / 4 * C.throatDia ** 2;
  const out = { kind: 'hotfire', items: [], windows: {}, summary: {}, sides: [], flags: [] };
  const S = out.summary;
  const push = (key, label, value, quantity, note = '') => out.items.push({ key, label, value, quantity, note });
  const eo = edges(T, ch('MOV-713-CMD')), ef = edges(T, ch('MFV-723-CMD'));
  if (!eo.on.length && !ef.on.length) return { kind: 'none', items: [], note: 'No main-valve command in this recording.' };
  const tEnd = T[T.length - 1];
  const onO = eo.on[0] ?? NaN, onF = ef.on[0] ?? NaN;
  const offO = eo.off.find(t => t > onO) ?? tEnd, offF = ef.off.find(t => t > onF) ?? tEnd;
  const tBoth = Math.max(onO, onF);
  const tOn = Math.min(onO, onF), tOff = Math.max(offO || 0, offF || 0), tShut = Math.min(offO, offF);
  out.tOn = tOn; out.tOff = tOff;
  S.dur = tShut - tBoth;
  S.lead = onF - onO;                          // + : oxidiser first
  const fire = run.tFire ?? tOn;
  const Pc = ch('PT-801'), F = ch('LC-901'), od = ch('OD-804');
  const meter = run.meta?.config?.meterFluid || {};
  S.meterOk = meter.ox === D.oxidiser && meter.fu === D.fuel;
  push('lead', 'Oxidiser lead (MOV-713 cmd before MFV-723 cmd)', S.lead, 'time', S.lead > 0 ? 'ox first' : S.lead < 0 ? 'fuel first' : 'together');
  // ignition
  const tIgn = od ? crossing(T, od, tOn, tOff + 0.2, IGN_V, 1) : NaN;
  S.ignited = Number.isFinite(tIgn);
  S.ignDelay = tIgn - tBoth;
  if (!S.ignited) {
    out.flags.push('no-ignition');
    const mOx = integrate(T, ch('FT-714'), tOn, tOff + 0.3), mFu = integrate(T, ch('FT-724'), tOn, tOff + 0.3);
    S.unburned = mOx + mFu;
    push('ignDelay', 'Ignition (OD-804 > 3 V)', NaN, 'time', 'NO IGNITION');
    push('unburned', 'Propellant injected without ignition (FT, integrated)', S.unburned, 'mass', 'went through the nozzle unburned — purge and wait before anything else');
    out.windows.steady = [tOn, tOff];
    return out;
  }
  push('ignDelay', 'Valve-to-flame time (later main valve cmd → OD-804 > 3 V)', S.ignDelay, 'time', 'priming time plus ignition delay');
  push('tIgn', 'Ignition after T-0', tIgn - fire, 'time');
  // steady window
  const dur = tShut - tIgn;
  const ss0 = tIgn + Math.min(Math.max(0.4, 0.3 * dur), 0.7 * dur), ss1 = tShut - Math.min(0.05, 0.1 * dur);
  out.windows.steady = [ss0, ss1];
  const pc = meanIn(T, Pc, ss0, ss1), f = meanIn(T, F, ss0, ss1);
  S.Pc = pc; S.F = f;
  // start transient
  const t10 = crossing(T, Pc, tOn, ss1, 0.1 * pc, 1), t90 = crossing(T, Pc, tOn, ss1, 0.9 * pc, 1);
  S.rise = t90 - t10;
  const pk = maxIn(T, Pc, tIgn - 0.01, tIgn + 0.3);
  // overshoot against the run's own steady level — or, if it never got
  // there (aborted in the start), against the prediction
  const pred = run.meta?.config?.prediction;
  const ref = dur > 0.6 && pc > 0 ? pc : pred?.kind === 'hotfire' && pred.Pc > 0 ? pred.Pc : pc;
  S.Pmax = pk.v; S.overshoot = ref > 0 ? pk.v / ref - 1 : NaN;
  // a priming surge arriving into a lit chamber makes some overshoot normal
  // on this engine; an overpressure abort in the start is a hard start
  const hardAbort = /overpressure/.test(run.abort || '');
  S.start = hardAbort || S.overshoot > 0.8 ? 'hard' : S.overshoot > 0.45 ? 'rough' : 'smooth';
  if (S.start === 'hard') out.flags.push('hard-start');
  push('rise', 'Pc rise time (10 → 90 % of steady)', S.rise, 'time');
  push('Pmax', 'Peak chamber pressure in the start (PT-801)', S.Pmax, 'pressure');
  push('overshoot', 'Start overshoot (peak ÷ steady − 1)', S.overshoot, 'ratio', S.start === 'hard' ? 'HARD START' : S.start === 'rough' ? 'rough start' : 'smooth start');
  push('Pc', 'Chamber pressure, steady (PT-801)', pc, 'pressure', `design ${(D.Pc / 6894.757).toFixed(0)} psig`);
  push('F', 'Thrust, steady (LC-901)', f, 'force', `design ${D.F} N`);
  // flows
  const sides = [['Ox', 'Oxidiser', 'FT-714', 'WT-716', 'PT-715'], ['Fu', 'Fuel', 'FT-724', 'WT-726', 'PT-725']];
  for (const [k, n, ft, wt, man] of sides) {
    const m = meanIn(T, ch(ft), ss0, ss1), mw = -slopeIn(T, ch(wt), ss0, ss1);
    const dP = meanIn(T, ch(man), ss0, ss1) - pc;
    Object.assign(S, { ['mdot' + k]: m, ['mdotW' + k]: mw, ['dP' + k]: dP, ['stiff' + k]: dP / (pc + Pa) });
    push('mdot' + k, `${n} flow, steady (${ft})`, m, 'massflow', `meter set for ${meter[k === 'Ox' ? 'ox' : 'fu'] ?? '?'}`);
    push('mdotW' + k, `${n} flow, weighed (−d${wt}/dt)`, mw, 'massflow', 'independent of the meter');
    push('dP' + k, `${n} injector ΔP (${man} − PT-801)`, dP, 'pressure');
    push('stiff' + k, `${n} injector stiffness (ΔP ÷ Pc abs)`, S['stiff' + k], 'ratio', S['stiff' + k] < 0.15 ? 'SOFT — chug territory' : '');
  }
  const md = S.mdotOx + S.mdotFu, mdw = S.mdotWOx + S.mdotWFu;
  S.MR = S.mdotOx / S.mdotFu; S.MRw = S.mdotWOx / S.mdotWFu;
  const Pabs = pc + Pa;
  S.cstar = Pabs * CdAt / md; S.cstarW = Pabs * CdAt / mdw;
  S.etaCstar = S.cstar / C.cstar(S.MR); S.etaCstarW = S.cstarW / C.cstar(S.MRw);
  S.Cf = f / (Pabs * CdAt);
  S.Isp = f / (md * G0); S.IspW = f / (mdw * G0);
  push('MR', 'Mixture ratio (FT-714 / FT-724)', S.MR, 'ratio', `design ${D.MR.toFixed(2)}`);
  push('MRw', 'Mixture ratio (weighed)', S.MRw, 'ratio');
  push('cstar', 'c* = Pc·Cd·At / ṁ (meters)', S.cstar, 'velocity');
  push('etaCstar', 'c* efficiency vs ideal c*(MR) (meters)', S.etaCstar, 'ratio', `design assumed ${D.etaCstar}`);
  push('cstarW', 'c* (weighed flows)', S.cstarW, 'velocity');
  push('etaCstarW', 'c* efficiency (weighed flows)', S.etaCstarW, 'ratio');
  push('Cf', 'Thrust coefficient F / (Pc·Cd·At)', S.Cf, 'ratio');
  push('Isp', 'Specific impulse, sea level (meters)', S.Isp, 'time');
  push('IspW', 'Specific impulse (weighed flows)', S.IspW, 'time');
  // roughness
  S.rough = stdIn(T, Pc, ss0, ss1) / pc;
  const vib = ch('VIB-805');
  S.vib = vib ? meanIn(T, vib, ss0, ss1) : NaN;
  S.vibMax = vib ? maxIn(T, vib, tIgn, tShut).v : NaN;
  if (S.rough > 0.03 || S.vibMax > 4) out.flags.push('rough');
  push('rough', 'Combustion roughness (σ / mean of PT-801)', S.rough, 'ratio', S.rough > 0.03 ? 'ROUGH' : '');
  push('vib', 'Vibration, steady (VIB-805)', S.vib, 'accel');
  push('vibMax', 'Vibration, peak while burning', S.vibMax, 'accel');
  // walls
  const th = ch('TC-803'), cw = ch('TC-802');
  if (th) {
    S.TthShut = meanIn(T, th, tShut - 0.05, tShut);
    S.TthPeak = maxIn(T, th, tShut, tEnd).v;
    S.TchPeak = cw ? maxIn(T, cw, tOn, tEnd).v : NaN;
    push('TthShut', 'Throat temperature at shutdown (TC-803)', S.TthShut, 'temperature');
    push('TthPeak', 'Throat temperature peak after shutdown (soak-back)', S.TthPeak, 'temperature', tEnd - tShut < 3 ? 'recording ended early — peak may be later' : '');
    push('TchPeak', 'Chamber wall peak (TC-802)', S.TchPeak, 'temperature');
  }
  // the cooling jacket (a regeneratively cooled engine)
  const rg = def.physics.regen;
  if (rg && ch('TC-728')) {
    const jin = ch('PT-727'), tout = ch('TC-728'), tin = ch('TC-727'), marg = ch('TSAT-M'), th2 = ch('TC-803');
    S.dPjkt = meanIn(T, jin, ss0, ss1) - meanIn(T, ch('PT-725'), ss0, ss1);
    S.Tcout = meanIn(T, tout, ss0, ss1);
    S.dTc = S.Tcout - meanIn(T, tin, ss0, ss1);
    S.Qjkt = S.mdotFu * rg.cp * S.dTc;
    S.qPerPc = S.Qjkt / Pabs;
    S.boilMargin = marg ? maxIn(T, marg, ss0, ss1, 0, -1).v : NaN;
    S.TthMax = th2 ? maxIn(T, th2, tOn, tShut + 0.1).v : NaN;
    S.TthSteady = th2 ? meanIn(T, th2, ss0, ss1) : NaN;
    push('dPjkt', 'Cooling-jacket ΔP (PT-727 − PT-725)', S.dPjkt, 'pressure', `design ${(def.design.dPjacket / 6894.757).toFixed(0)} psi at the design flow`);
    push('Tcout', 'Coolant outlet temperature (TC-728)', S.Tcout, 'temperature');
    push('dTc', 'Coolant temperature rise (TC-728 − TC-727)', S.dTc, 'ratio', 'kelvin');
    push('Qjkt', 'Heat into the coolant, ṁ·cp·ΔT', S.Qjkt, 'power', 'FT-724 · cp · ΔT');
    push('boilMargin', 'Smallest boiling margin at the jacket outlet (TSAT-M)', S.boilMargin, 'ratio', S.boilMargin < 30 ? 'kelvin — SMALL' : 'kelvin');
    push('TthSteady', 'Throat liner, steady (TC-803)', S.TthSteady, 'temperature');
    push('TthMax', 'Throat liner, peak while burning', S.TthMax, 'temperature');
    if (S.boilMargin < 30) out.flags.push('cooling-margin');
  }
  // shutdown
  S.Itot = integrate(T, F, tOn, Math.min(tEnd, tOff + 1.0));
  S.Ishut = integrate(T, F, tShut, Math.min(tEnd, tOff + 1.0));
  push('Itot', 'Total impulse (LC-901)', S.Itot, 'impulse');
  push('Ishut', 'Shutdown impulse (first valve closed → +1 s)', S.Ishut, 'impulse');
  if (!S.meterOk) out.flags.push('meter-cal');
  return out;
}
