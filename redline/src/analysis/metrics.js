/* Post-test data reduction: the numbers a test engineer pulls out of a
   firing's data, computed the way they would be — from the RECORDED
   channels, with the same assumptions and the same traps.

   · The thrust baseline is the mean load-cell reading over the half second
     before the fire command, so pressure tare and any zero error are
     removed — but only if the pre-fire window is quiet.
   · "Steady state" is a window inside the burn that avoids the start and
     shutdown transients.
   · Timing (valve delay, rise and fall) comes from threshold crossings of
     chamber pressure: 10 % and 90 % of the steady value.
   · Mass flow is MDOT-C, which assumes the nominal throat. If the throat is
     not nominal, Isp computed here is wrong in a way that looks plausible.

   No DOM; used by the session (headless) and the analysis view. */

import { G0 } from '../lib/units.js';
import { GASES } from '../physics/gas.js';

export function meanIn(T, V, t0, t1) {
  let s = 0, n = 0;
  for (let k = lowerBound(T, t0); k < T.length && T[k] <= t1; k++) { const v = V[k]; if (!Number.isNaN(v)) { s += v; n++; } }
  return n ? s / n : NaN;
}
export function stdIn(T, V, t0, t1) {
  const m = meanIn(T, V, t0, t1);
  let s = 0, n = 0;
  for (let k = lowerBound(T, t0); k < T.length && T[k] <= t1; k++) { const v = V[k]; if (!Number.isNaN(v)) { s += (v - m) ** 2; n++; } }
  return n > 1 ? Math.sqrt(s / (n - 1)) : NaN;
}
export function maxIn(T, V, t0, t1, off = 0) {
  let m = -Infinity, tm = NaN;
  for (let k = lowerBound(T, t0); k < T.length && T[k] <= t1; k++) { const v = V[k] - off; if (v > m) { m = v; tm = T[k]; } }
  return { v: m, t: tm };
}
export function lowerBound(T, x) {
  let lo = 0, hi = T.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (T[m] < x) lo = m + 1; else hi = m; }
  return lo;
}
/* First time after t0 that V crosses `level` going up (dir=1) or down
   (dir=-1), linearly interpolated. */
export function crossing(T, V, t0, t1, level, dir) {
  let k = Math.max(1, lowerBound(T, t0));
  for (; k < T.length && T[k] <= t1; k++) {
    const a = V[k - 1], b = V[k];
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    if (dir > 0 ? a < level && b >= level : a > level && b <= level) {
      return T[k - 1] + (level - a) / (b - a) * (T[k] - T[k - 1]);
    }
  }
  return NaN;
}
export function integrate(T, V, t0, t1, off = 0) {
  let s = 0;
  for (let k = Math.max(1, lowerBound(T, t0)); k < T.length && T[k] <= t1; k++) {
    const a = V[k - 1] - off, b = V[k] - off;
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    s += 0.5 * (a + b) * (T[k] - T[k - 1]);
  }
  return s;
}
/* Rising and falling edges of a 0/1 channel. */
export function edges(T, V) {
  const on = [], off = [];
  for (let k = 1; k < T.length; k++) {
    if (V[k - 1] < 0.5 && V[k] >= 0.5) on.push(T[k]);
    if (V[k - 1] >= 0.5 && V[k] < 0.5) off.push(T[k]);
  }
  return { on, off };
}

export function computeMetrics(run, def) {
  const d = run.data, T = d.T;
  const ch = id => d.series(id);
  const Pc = ch('PT-401'), F = ch('LC-501'), Pin = ch('PT-301'), Preg = ch('PT-201'),
        Psup = ch('PT-101'), md = ch('MDOT-C'), cmd = ch('SV-301-CMD'), Tin = ch('TC-301'), I = ch('SV-301-I'),
        FM = ch('FT-201');
  const gas = GASES[def.physics.gas];
  if (!Pc || !F || !cmd || T.length < 10) return null;
  const e = edges(T, cmd);
  if (!e.on.length) return { kind: 'none', items: [], note: 'No fire-valve command in this recording.' };
  const tOn = e.on[0];
  const tOff = e.off.find(t => t > tOn) ?? T[T.length - 1];
  const Pa = def.physics.ambient.P;
  const At = Math.PI / 4 * def.nominal.throatDia ** 2;
  const kind = run.plan?.mode === 'pulse' || e.on.length > 1 ? 'pulse' : 'single';
  const out = { kind, tOn, tOff, items: [], windows: {} };
  const preT0 = Math.max(T[0], tOn - 0.5), preT1 = tOn - 0.02;
  const Fbase = preT1 > preT0 + 0.05 ? meanIn(T, F, preT0, preT1) : NaN;
  const Pcbase = preT1 > preT0 + 0.05 ? meanIn(T, Pc, preT0, preT1) : 0;
  out.windows.baseline = [preT0, preT1];
  const base = Number.isFinite(Fbase) ? Fbase : 0;
  const push = (key, label, value, quantity, note = '') => out.items.push({ key, label, value, quantity, note });

  push('base', 'Thrust baseline (pre-fire mean)', Fbase, 'force',
       Number.isFinite(Fbase) ? 'subtracted from thrust below' : 'no pre-fire data: thrust NOT baseline-corrected');

  if (out.kind === 'single') {
    const dur = tOff - tOn;
    const ss0 = tOn + Math.min(Math.max(0.3, 0.3 * dur), 0.6 * dur), ss1 = tOff - Math.min(0.05, 0.1 * dur);
    out.windows.steady = [ss0, ss1];
    const PcSS = meanIn(T, Pc, ss0, ss1);
    const FSS = meanIn(T, F, ss0, ss1) - base;
    const mdSS = md ? meanIn(T, md, ss0, ss1) : NaN;
    const ref = PcSS - Pcbase;
    const t10 = crossing(T, Pc, tOn - 0.01, ss1, Pcbase + 0.1 * ref, 1);
    const t90 = crossing(T, Pc, tOn - 0.01, ss1, Pcbase + 0.9 * ref, 1);
    const f90 = crossing(T, Pc, tOff - 0.001, tOff + 1, Pcbase + 0.9 * ref, -1);
    const f10 = crossing(T, Pc, tOff - 0.001, tOff + 2, Pcbase + 0.1 * ref, -1);
    const Ft10 = crossing(T, F, tOn - 0.01, ss1, base + 0.1 * FSS, 1);
    const Ft90 = crossing(T, F, tOn - 0.01, ss1, base + 0.9 * FSS, 1);
    const tEnd = Number.isFinite(f10) ? f10 + 0.03 : tOff + 0.1;
    const Itot = integrate(T, F, tOn - 0.005, tEnd, base);
    const mass = md ? integrate(T, md, tOn - 0.005, tEnd) : NaN;
    const pk = maxIn(T, F, tOn, tEnd, base);
    out.windows.integrate = [tOn - 0.005, tEnd];
    push('dur_cmd', 'Commanded burn (valve command on→off)', dur, 'time');
    push('dur', 'Burn duration (Pc above 10 % of steady)', f10 - t10, 'time');
    push('Pc', 'Chamber pressure, steady (PT-401)', PcSS, 'pressure');
    push('Pin', 'Valve inlet pressure, steady (PT-301)', meanIn(T, Pin, ss0, ss1), 'pressure');
    push('Preg', 'Regulator outlet, steady (PT-201)', meanIn(T, Preg, ss0, ss1), 'pressure');
    push('Plock', 'Regulator outlet, pre-fire lock-up', meanIn(T, Preg, preT0, preT1), 'pressure', 'droop = lock-up − steady');
    push('dPf', 'ΔP filter + line (PT-201 − PT-301)', meanIn(T, Preg, ss0, ss1) - meanIn(T, Pin, ss0, ss1), 'pressure');
    push('dPv', 'ΔP fire valve (PT-301 − PT-401)', meanIn(T, Pin, ss0, ss1) - PcSS, 'pressure');
    push('F', 'Thrust, steady (baseline-corrected)', FSS, 'force');
    push('Fstd', 'Thrust noise, steady (1σ)', stdIn(T, F, ss0, ss1), 'force');
    push('Fpk', 'Peak thrust (incl. stand ringing)', pk.v, 'force');
    push('delay', 'Opening delay (command → Pc 10 %)', t10 - tOn, 'time');
    push('rise', 'Pc rise time (10 → 90 %)', t90 - t10, 'time');
    push('Frise', 'Thrust rise time (10 → 90 %, first crossing)', Ft90 - Ft10, 'time');
    push('sdelay', 'Shutdown delay (command → Pc 90 %)', f90 - tOff, 'time');
    push('fall', 'Pc fall time (90 → 10 %)', f10 - f90, 'time');
    push('I', 'Total impulse (∫ F dt)', Itot, 'impulse');
    push('mdot', 'Mass flow, steady (MDOT-C)', mdSS, 'massflow', 'assumes nominal throat');
    push('m', 'Propellant used (∫ MDOT-C dt)', mass, 'mass');
    push('Isp', 'Specific impulse (I / m·g₀)', Itot / (mass * G0), 'isp', 'sea level');
    push('IspSS', 'Specific impulse, steady (F / ṁ·g₀)', FSS / (mdSS * G0), 'isp');
    push('Cf', 'Thrust coefficient F / (Pc·At), nominal At', FSS / ((PcSS + Pa) * At), 'ratio');
    const TinSS = meanIn(T, Tin, ss0, ss1);
    push('Tin', 'Feed gas temperature, steady (TC-301)', TinSS, 'temperature');
    // The independent flow measurement, and what it says about the throat.
    const fmSS = FM ? meanIn(T, FM, ss0, ss1) : NaN;
    const CdAt = fmSS * Math.sqrt(gas.R * TinSS) / ((PcSS + Pa) * gas.fChoke);
    const dEq = Math.sqrt(4 * CdAt / (Math.PI * def.nominal.Cd));
    if (FM) {
      push('mdotFM', 'Mass flow, steady (FT-201, measured)', fmSS, 'massflow', 'independent of the throat assumption');
      push('IspFM', 'Specific impulse from measured flow (F / ṁ·g₀)', FSS / (fmSS * G0), 'isp');
      push('cstar', 'c* from FT-201 (Pc·At / ṁ, nominal At)', (PcSS + Pa) * At / fmSS, 'velocity');
      push('dThroat', `Effective throat Ø from FT-201 (at Cd ${def.nominal.Cd})`, dEq, 'length', `drawing: ${(def.nominal.throatDia * 1e3).toFixed(2)} mm`);
    }
    push('droop', 'Regulator droop (lock-up − steady)', meanIn(T, Preg, preT0, preT1) - meanIn(T, Preg, ss0, ss1), 'pressure');
    push('sup', 'Supply pressure change over record (PT-101)', meanIn(T, Psup, T[T.length - 1] - 0.3, T[T.length - 1]) - meanIn(T, Psup, T[0], T[0] + 0.3), 'pressure');
    if (I) {
      // The armature pulls in where the coil current stops rising and dips.
      let dipT = NaN, prev = -Infinity;
      for (let k = lowerBound(T, tOn); k < T.length && T[k] < tOn + 0.03; k++) {
        if (I[k] < prev - 0.01 && I[k] > 0.3) { dipT = T[k]; break; }
        prev = Math.max(prev, I[k]);
      }
      push('pullin', 'Armature pull-in (current dip)', dipT - tOn, 'time', Number.isNaN(dipT) ? 'dip not resolved — sample rate?' : '');
    }
    out.summary = { Pc: PcSS, PcAbs: PcSS + Pa, F: FSS, I: Itot, mdot: mdSS, mdotFM: fmSS, Isp: Itot / (mass * G0), IspFM: FSS / (fmSS * G0),
                    dur: f10 - t10, rise: t90 - t10, delay: t10 - tOn, sdelay: f90 - tOff, dThroat: dEq, Cf: FSS / ((PcSS + Pa) * At),
                    droop: meanIn(T, Preg, preT0, preT1) - meanIn(T, Preg, ss0, ss1), Preg: meanIn(T, Preg, ss0, ss1), Pin: meanIn(T, Pin, ss0, ss1) };
  } else {
    /* Pulse train. Each pulse is judged against the steady chamber pressure
       the stand WOULD reach (the pre-test prediction, or failing that the
       highest peak in the train): did the valve open at all, and did the
       chamber get to steady state before the valve closed again? */
    const pred = run.meta?.config?.prediction?.Pc;
    const pulses = [];
    for (let i = 0; i < e.on.length; i++) {
      const a = e.on[i], b = e.off.find(t => t > a) ?? a;
      const next = e.on[i + 1] ?? (b + 0.3);
      const w1 = Math.min(next - 0.002, b + 0.2);
      const Ib = integrate(T, F, a - 0.002, w1, base);
      const pk = maxIn(T, Pc, a, Math.min(next, b + 0.1));
      const mass = md ? integrate(T, md, a - 0.002, w1) : NaN;
      pulses.push({ n: i + 1, tOn: a, tOff: b, width: b - a, Ibit: Ib, PcPeak: pk.v - Pcbase, mass, next });
    }
    const ref = pred > 0 ? pred : Math.max(...pulses.map(p => p.PcPeak));
    for (const p of pulses) {
      p.fired = p.PcPeak > 0.1 * ref;
      p.steady = p.PcPeak > 0.9 * ref;
      p.delay = p.fired ? crossing(T, Pc, p.tOn - 0.001, p.next, Pcbase + 0.1 * ref, 1) - p.tOn : NaN;
      p.close = p.fired ? crossing(T, Pc, p.tOff - 0.001, p.next, Pcbase + 0.1 * ref, -1) - p.tOff : NaN;
      p.Isp = p.Ibit / (p.mass * G0);
    }
    out.pulses = pulses;
    out.refPc = ref;
    const avg = xs => { const f = xs.filter(Number.isFinite); return f.length ? f.reduce((s, x) => s + x, 0) / f.length : NaN; };
    const Ibits = pulses.map(p => p.Ibit);
    const mean = avg(Ibits);
    const sd = Math.sqrt(Ibits.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, Ibits.length - 1));
    const fired = pulses.filter(p => p.fired).length, steady = pulses.filter(p => p.steady).length;
    push('n', 'Pulses commanded', pulses.length, 'discrete');
    push('nfired', 'Pulses that produced chamber pressure (> 10 % of steady)', fired, 'discrete');
    push('nsteady', 'Pulses that reached steady Pc (> 90 %)', steady, 'discrete');
    push('width', 'Commanded pulse width', pulses[0].width, 'time');
    push('Ibit', 'Mean impulse bit', mean, 'impulse');
    push('IbitSd', 'Impulse-bit repeatability (1σ)', sd, 'impulse', mean > 0 ? `${(100 * sd / mean).toFixed(2)} % of mean` : '');
    push('I', 'Total impulse, all pulses', Ibits.reduce((s, x) => s + x, 0), 'impulse');
    push('PcPk', 'Mean peak chamber pressure', avg(pulses.map(p => p.PcPeak)), 'pressure', `steady reference ${(ref / 6894.757).toFixed(1)} psig`);
    push('pdelay', 'Mean opening delay (command → Pc 10 %)', avg(pulses.map(p => p.delay)), 'time');
    push('pclose', 'Mean closing delay (command off → Pc < 10 %)', avg(pulses.map(p => p.close)), 'time');
    push('pIsp', 'Pulse-mode Isp (I-bit / m·g₀, MDOT-C)', avg(pulses.map(p => p.Isp)), 'isp', 'MDOT-C is only valid while the throat is choked');
    out.summary = { I: Ibits.reduce((s, x) => s + x, 0), Ibit: mean, IbitSd: sd, IbitCv: mean > 0 ? sd / mean : NaN, width: pulses[0].width,
                    fired, steady, n: pulses.length, pdelay: avg(pulses.map(p => p.delay)), pclose: avg(pulses.map(p => p.close)),
                    PcPk: avg(pulses.map(p => p.PcPeak)) };
  }
  return out;
}
