/* Data reduction for a run on TS-3G (BPE-3, gas-generator cycle). No DOM.

   A hot fire is reduced the way an engine test is:

   · the START: main chamber light (PT-501 off the floor after the main
     valves open), gas generator light (TT-334 rising after its valves
     open), the time to mainstage (Pc to 90 % of its steady value, from
     T-0), the speed and turbine-inlet-temperature peaks on the way, and
     what kind of start it was — smooth, hot (a TIT spike), overspeed
     (start gas and gas generator both driving), hard (a Pc spike) or hung
   · each STEADY point (one, or one per GG throttle step): speed, chamber
     and GG pressures, turbine inlet temperature, main flows (meters) and
     GG flows (inferred from the orifice ΔP), both mixture ratios, thrust,
     c* and its efficiency, specific impulse of the main chamber and of
     the whole engine — the gas generator's flow makes no thrust, and the
     difference between the two is what the cycle costs
   · the ABLATIVE: the chamber pressure's drift through the burn (the
     throat eroding) and the case temperature, at shutdown and its peak
     after (soak-back)
   · the SHUTDOWN: the coast-down after the gas generator goes out.

   A cold flow (water, start gas only) is reduced as a feed-system test:
   speed, flows, pump and injector pressures, the injector CdA under pump
   feed. */

import { meanIn, maxIn, edges, crossing } from './metrics.js';
import { GAS_MAIN } from '../physics/propellants.js';

const G0 = 9.80665, PSI = 6894.757;
const RHO_W = 998;

function firstAbove(T, V, t0, t1, level) {
  for (let k = 0; k < T.length; k++) { const t = T[k]; if (t < t0) continue; if (t > t1) break; if (V[k] >= level) return t; }
  return NaN;
}
/* least-squares slope of V over [t0, t1] (units per second) */
function slopeIn(T, V, t0, t1) {
  let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let k = 0; k < T.length; k++) {
    const t = T[k]; if (t < t0) continue; if (t > t1) break;
    const v = V[k]; if (!Number.isFinite(v)) continue;
    n++; sx += t; sy += v; sxx += t * t; sxy += t * v;
  }
  const d = n * sxx - sx * sx;
  return n > 10 && d > 0 ? (n * sxy - sx * sy) / d : NaN;
}

export function computeMetricsGG(run, def) {
  const d = run.data, T = d.T;
  if (T.length < 10) return null;
  const ch = id => d.series(id);
  const tsv = ch('TSV-332-CMD');
  if (!tsv) return null;
  const eT = edges(T, tsv);
  if (!eT.on.length) return null;
  const tOn = eT.on[0];
  const p = run.plan || {}, mode = p.mode || 'hot';
  const Nd = def.physics.turbopump.Nd;
  const out = { kind: mode === 'cold' ? 'ggcold' : 'gg', mode, items: [], windows: {}, summary: {}, points: [], flags: [], tOn };
  const S = out.summary;
  const push = (key, label, value, quantity, note = '') => out.items.push({ key, label, value, quantity, note });
  const pred = run.meta?.config?.prediction || null;
  const spd = ch('SPD'), pc = ch('PT-501'), pgg = ch('PT-333'), tit = ch('TT-334');
  const eM = edges(T, ch('MOV-414-CMD'));
  const tMain = eM.on.find(t => t >= tOn - 0.01) ?? NaN;
  const tEnd = T[T.length - 1];
  const fmtP = v => `${(v / PSI).toFixed(0)} psig`;
  const pr = (v, dp = 0) => (Number.isFinite(v) ? v.toFixed(dp) : '—');

  if (mode === 'cold') {
    const tOff = eT.off.find(t => t > tOn) ?? tEnd;
    out.tOff = tOff;
    const a = Math.max(tOn + 2, tMain + 1.5), b = tOff - 0.2;
    if (b > a + 0.3) {
      const pt = { t0: a, t1: b, N: meanIn(T, spd, a, b) };
      pt.n = pt.N / Nd;
      pt.mdotOx = meanIn(T, ch('FT-416'), a, b); pt.mdotFu = meanIn(T, ch('FT-426'), a, b);
      pt.PdOx = meanIn(T, ch('PT-414'), a, b); pt.PdFu = meanIn(T, ch('PT-424'), a, b);
      pt.PmOx = meanIn(T, ch('PT-415'), a, b); pt.PmFu = meanIn(T, ch('PT-425'), a, b);
      pt.dPiOx = meanIn(T, ch('DP-OXI'), a, b); pt.dPiFu = meanIn(T, ch('DP-FUI'), a, b);
      pt.cdaOx = pt.dPiOx > 5 * PSI ? pt.mdotOx / Math.sqrt(2 * RHO_W * pt.dPiOx) : NaN;
      pt.cdaFu = pt.dPiFu > 5 * PSI ? pt.mdotFu / Math.sqrt(2 * RHO_W * pt.dPiFu) : NaN;
      pt.Pdrive = meanIn(T, pgg, a, b);
      out.points.push(pt);
      out.windows.steady = [a, b];
      push('N', 'Speed on start gas', pt.N, 'speed', `${(100 * pt.n).toFixed(1)} % of design${pred?.kind === 'ggcold' ? `; pred. ${pred.rpm.toFixed(0)}` : ''}`);
      push('mdotOx', 'Ox-side water flow (FT-416)', pt.mdotOx, 'massflow', pred?.kind === 'ggcold' ? `pred. ${(pred.mdotOx * 1e3).toFixed(0)} g/s` : '');
      push('mdotFu', 'Fuel-side water flow (FT-426)', pt.mdotFu, 'massflow', pred?.kind === 'ggcold' ? `pred. ${(pred.mdotFu * 1e3).toFixed(0)} g/s` : '');
      push('PdOx', 'Ox pump discharge (PT-414)', pt.PdOx, 'pressure');
      push('PdFu', 'Fuel pump discharge (PT-424)', pt.PdFu, 'pressure');
      push('cdaOx', 'Main ox injector CdA (water, under pump feed)', pt.cdaOx * 1e6, 'ratio', `mm²; drawing ${(def.design.CdAox * 1e6).toFixed(2)} mm²`);
      push('cdaFu', 'Main fuel injector CdA (water, under pump feed)', pt.cdaFu * 1e6, 'ratio', `mm²; drawing ${(def.design.CdAfu * 1e6).toFixed(2)} mm²`);
      push('Pdrive', 'Turbine manifold (start gas) PT-333', pt.Pdrive, 'pressure');
    }
    S.coast50 = crossing(T, spd, tOff, tEnd, 0.5 * meanIn(T, spd, tOff - 0.05, tOff), -1) - tOff;
    push('coast50', 'Coast-down: start gas off → half speed', S.coast50, 'time', 'main valves open: the pumps unload as they slow');
    S.vibMax = maxIn(T, ch('VIB-345'), tOn, tOff).v;
    push('vibMax', 'Peak TPA vibration', S.vibMax, 'accel');
    return out;
  }

  /* ---- hot fire ------------------------------------------------------- */
  const eGO = edges(T, ch('GOV-416-CMD'));
  const tGG = eGO.on.find(t => t >= tOn - 0.01) ?? NaN;
  const tShut = eGO.off.find(t => t > (Number.isFinite(tGG) ? tGG : tOn)) ?? (eM.off.find(t => t > tMain) ?? tEnd);
  const tSpinEnd = eT.off.find(t => t > tOn) ?? NaN;
  out.tOff = tShut;
  S.dur = tShut - tOn;
  S.aborted = !!run.aborted;

  /* steady windows */
  const windows = [];
  const settle = p.settle ?? 4, dwell = p.dwell ?? 4;
  if (p.thrSteps?.length > 1) {
    p.thrSteps.forEach((x, k) => {
      const a = tOn + (k === 0 ? Math.max(3, settle - 1.5) : settle + (k - 1) * dwell + 1.5);
      const b = tOn + (k === 0 ? settle : settle + k * dwell) - 0.15;
      if (b <= tShut + 1e-6 && b > a + 0.3) windows.push([a, b, x]);
    });
  } else {
    const a = tOn + Math.max(3.5, (Number.isFinite(tSpinEnd) ? tSpinEnd - tOn : 1.1) + 2.5), b = tShut - 0.3;
    if (b > a + 0.4) windows.push([a, b, p.thr ?? 1]);
  }
  for (const [a, b, thr] of windows) {
    const m = id => meanIn(T, ch(id), a, b);
    const pt = { t0: a, t1: b, thr, N: meanIn(T, spd, a, b) };
    pt.n = pt.N / Nd;
    pt.Pc = m('PT-501'); pt.Pgg = m('PT-333'); pt.TIT = m('TT-334'); pt.Texh = m('TT-335');
    pt.F = m('LC-501');
    pt.mdotOx = m('FT-416'); pt.mdotFu = m('FT-426'); pt.ggOx = m('GGF-OX'); pt.ggFu = m('GGF-FU');
    pt.MR = pt.mdotOx / pt.mdotFu; pt.MRgg = pt.ggOx / pt.ggFu;
    pt.mdotMain = pt.mdotOx + pt.mdotFu; pt.mdotGG = pt.ggOx + pt.ggFu;
    pt.ggFrac = pt.mdotGG / (pt.mdotMain + pt.mdotGG);
    pt.cstar = m('CSTAR-C');
    pt.etaCstar = pt.cstar / GAS_MAIN.cstar(pt.MR, pt.Pc + 101325);
    pt.IspC = pt.F / (G0 * pt.mdotMain); pt.IspE = pt.F / (G0 * (pt.mdotMain + pt.mdotGG));
    pt.PdOx = m('PT-414'); pt.PdFu = m('PT-424'); pt.PinOx = m('PT-413'); pt.PinFu = m('PT-423');
    pt.npshOx = m('NPSH-OX'); pt.npshFu = m('NPSH-FU');
    pt.stiffOx = m('DP-OXI') / (pt.Pc + 101325); pt.stiffFu = m('DP-FUI') / (pt.Pc + 101325);
    pt.vibTP = m('VIB-345'); pt.vibE = m('VIB-505');
    pt.rough = 0;
    out.points.push(pt);
  }
  out.windows.steady = windows.length ? [windows[0][0], windows[windows.length - 1][1]] : null;
  const P0 = out.points[0];

  /* the start */
  const PcRef = P0?.Pc ?? (pred?.kind === 'gg' ? pred.Pc - 101325 : NaN);
  S.tIgnMain = Number.isFinite(tMain) ? firstAbove(T, pc, tMain, tMain + 2, Math.max(15 * PSI, 0.1 * (PcRef || 0))) - tMain : NaN;
  S.tIgnGG = Number.isFinite(tGG) ? firstAbove(T, tit, tGG, tGG + 2, 500) - tGG : NaN;
  S.tMainstage = Number.isFinite(PcRef) ? firstAbove(T, pc, tOn, tShut, 0.9 * PcRef) - tOn : NaN;
  const ws = [tOn, Number.isFinite(tSpinEnd) ? tSpinEnd + 2.5 : tOn + 4];
  S.Npeak = maxIn(T, spd, ws[0], Math.min(ws[1], tShut)).v;
  S.TITpeak = maxIn(T, tit, tOn, Math.min(ws[1], tShut)).v;
  S.PcPeak = maxIn(T, pc, tOn, Math.min(tOn + 1.5 + (Number.isFinite(tMain) ? tMain - tOn : 0), tShut)).v;
  S.PggPeak = Number.isFinite(tGG) ? maxIn(T, pgg, tGG, Math.min(tGG + 1.5, tShut)).v : NaN;
  S.overshoot = P0 ? S.Npeak / P0.N - 1 : NaN;
  const hung = /START HANG/.test(run.abort || '');
  S.start = hung ? 'hang'
    : S.PcPeak > 1.35 * (PcRef || Infinity) ? 'hard'
    : P0 && S.PggPeak > 1.6 * Math.max(P0.Pgg, 50 * PSI) ? 'gg-hard'
    : S.Npeak > 1.07 * Nd ? 'overspeed'
    : S.TITpeak > 1000 ? 'hot'
    : Number.isFinite(S.tMainstage) ? 'smooth' : 'incomplete';
  /* the ablative chamber */
  const tc = ch('TC-503');
  S.caseShut = meanIn(T, tc, tShut - 0.2, tShut);
  S.casePeak = maxIn(T, tc, tShut, tEnd).v;
  S.caseStart = meanIn(T, tc, tOn - 0.5, tOn);
  if (out.windows.steady && !(p.thrSteps?.length > 1)) {
    const [a, b] = out.windows.steady;
    // per 10 s, as a fraction of Pc: the throat eroding
    S.PcDrift = slopeIn(T, pc, a, b) * 10 / (P0.Pc || 1);
  }
  /* the shutdown */
  const Noff = meanIn(T, spd, tShut - 0.05, tShut);
  S.coast50 = crossing(T, spd, tShut, tEnd, 0.5 * Noff, -1) - tShut;
  S.vibTPmax = maxIn(T, ch('VIB-345'), tOn, tShut + 1).v;
  S.vibEmax = maxIn(T, ch('VIB-505'), tOn, tShut).v;
  S.Itot = (() => { const F = ch('LC-501'); let I = 0; for (let k = 1; k < T.length; k++) if (T[k] > tOn && T[k] <= tShut + 2) I += 0.5 * (F[k] + F[k - 1]) * (T[k] - T[k - 1]); return I; })();

  /* rows */
  push('start', 'Start', S.start === 'smooth' ? 0 : 1, 'ratio', `${S.start}${Number.isFinite(S.tMainstage) ? ` — mainstage (Pc 90 %) at T+${S.tMainstage.toFixed(2)} s` : ''}`);
  push('tIgnMain', 'Main chamber light: main valves → Pc off the floor', S.tIgnMain, 'time');
  push('tIgnGG', 'Gas generator light: GG valves → TT-334 above 500 K', S.tIgnGG, 'time');
  push('Npeak', 'Peak speed in the start', S.Npeak, 'speed', P0 ? `${(100 * S.Npeak / Nd).toFixed(1)} % of design; overshoot over mainstage ${(100 * S.overshoot).toFixed(1)} %` : '');
  push('TITpeak', 'Peak turbine inlet temperature in the start', S.TITpeak, 'temperature');
  push('PggPeak', 'Peak gas generator pressure in the start (PT-333)', S.PggPeak, 'pressure', P0 ? `mainstage ${fmtP(P0.Pgg)}` : '');
  const pn = p.thrSteps?.length > 1 ? ' (first point)' : '';
  if (P0) {
    const g = pred?.kind === 'gg' ? pred : null;
    push('N', `Speed, mainstage${pn}`, P0.N, 'speed', `${(100 * P0.n).toFixed(1)} %${g ? `; pred. ${g.rpm.toFixed(0)}` : ''}`);
    push('Pc', `Chamber pressure${pn} (PT-501)`, P0.Pc, 'pressure', g ? `pred. ${fmtP(g.Pc - 101325)}` : '');
    push('F', `Thrust${pn} (LC-501)`, P0.F, 'force', g ? `pred. ${g.F.toFixed(0)} N` : '');
    push('MR', `Main mixture ratio${pn} (meters)`, P0.MR, 'ratio', g ? `pred. ${g.MR.toFixed(2)}` : '');
    push('mdotMain', `Main flow${pn} (FT-416 + FT-426)`, P0.mdotMain, 'massflow');
    push('Pgg', `Gas generator pressure${pn} (PT-333)`, P0.Pgg, 'pressure', g ? `pred. ${fmtP(g.Pgg - 101325)}` : '');
    push('TIT', `Turbine inlet temperature${pn} (TT-334)`, P0.TIT, 'temperature', g ? `pred. ${pr(g.TIT)} K` : '');
    push('MRgg', `GG mixture ratio${pn} (inferred)`, P0.MRgg, 'ratio', g ? `pred. ${g.MRgg.toFixed(3)}` : '');
    push('ggFrac', `GG flow, fraction of the engine's${pn}`, P0.ggFrac, 'ratio', 'propellant that makes no thrust in the main chamber');
    push('etaCstar', `c* efficiency${pn}`, P0.etaCstar, 'ratio', `c* ${pr(P0.cstar)} m/s`);
    push('IspC', `Isp, main chamber${pn}`, P0.IspC, 'ratio', 's');
    push('IspE', `Isp, engine (GG flow included)${pn}`, P0.IspE, 'ratio', `s — the cycle costs ${pr(P0.IspC - P0.IspE, 1)} s`);
    push('stiff', `Injector stiffness ΔP/Pc${pn}`, Math.min(P0.stiffOx, P0.stiffFu), 'ratio', `ox ${P0.stiffOx.toFixed(2)}, fuel ${P0.stiffFu.toFixed(2)}`);
    push('npsh', `NPSH available${pn}`, Math.min(P0.npshOx, P0.npshFu), 'head', `ox ${pr(P0.npshOx, 1)} m, fuel ${pr(P0.npshFu, 1)} m`);
  }
  if (p.thrSteps?.length > 1) out.points.forEach((pt, k) => push('thr' + k, `Throttle point ${k + 1} (GG ${Math.round(100 * pt.thr)} %)`, pt.Pc, 'pressure', `${pt.N.toFixed(0)} rpm, ${pt.F.toFixed(0)} N, TIT ${pt.TIT.toFixed(0)} K, MR ${pt.MR.toFixed(2)}`));
  if (Number.isFinite(S.PcDrift)) push('PcDrift', 'Chamber pressure drift through the burn', S.PcDrift * 100, 'ratio', '% per 10 s — the ablative throat eroding');
  push('case', 'Chamber case TC-503: at shutdown → peak after', S.casePeak, 'temperature', `${pr(S.caseShut - 273.15)} °C at shutdown (started at ${pr(S.caseStart - 273.15)} °C)`);
  push('coast50', 'Coast-down: GG off → half speed', S.coast50, 'time');
  push('Itot', 'Total impulse (LC-501)', S.Itot, 'ratio', 'N·s');
  push('vib', 'Peak vibration: TPA / chamber', S.vibTPmax, 'accel', `VIB-505 ${pr(S.vibEmax, 1)} g`);
  if (S.start !== 'smooth') out.flags.push(`start-${S.start}`);
  if (P0 && P0.TIT > 960) out.flags.push('tit-high');
  if (S.vibEmax > 4) out.flags.push('roughness');
  if (P0 && pred?.kind === 'gg' && Math.abs(P0.Pc / (pred.Pc - 101325) - 1) > 0.06) out.flags.push('pc-off-prediction');
  if (S.casePeak > 273.15 + 150) out.flags.push('case-hot');
  return out;
}
