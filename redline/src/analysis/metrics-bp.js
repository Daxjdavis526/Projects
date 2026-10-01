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

import { meanIn, stdIn, maxIn, crossing, edges } from './metrics.js';

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
