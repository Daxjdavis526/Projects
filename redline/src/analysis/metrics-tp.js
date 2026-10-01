/* Data reduction for a turbopump run on TS-3. No DOM.

   What a component test reduces, from the recorded channels:

   · speed: spin-up (turbine valve open → 90 % of the held speed), the peak
     and any overshoot, and the coast-down (valve shut → half speed, and the
     deceleration just after shut-off, which with the rotor's inertia from the
     drawing gives the drag torque at speed)
   · each steady point (one for a spin, one per throttle step for a map):
     speed, flow and head of each pump, the head and flow REFERRED to design
     speed by the affinity laws (H/n², Q/n — points taken at slightly
     different speeds then fall on one curve), the suction head available,
     hydraulic power, the turbine's inlet pressure, temperature drop and
     efficiency, and the power balance
   · a suction test: the head at the start of the ramp, and the suction head
     at which it has fallen by 3 % — the pump's NPSH required, by definition
   · the health channels: vibration, bearings, casings, the two speed
     pickups' agreement.

   Water density throughout (the meters and the head channels assume it). */

import { meanIn, maxIn, edges } from './metrics.js';

const RHO = 998, G0 = 9.80665, TAU = 2 * Math.PI;
const SID = [
  { key: 'Ox', name: 'Ox pump', pin: 'PT-413', pd: 'PT-414', ft: 'FT-416', head: 'H-OX', npsh: 'NPSH-OX', hyd: 'PWR-OXH', tank: 'PT-410', zt: 'ZT-418' },
  { key: 'Fu', name: 'Fuel pump', pin: 'PT-423', pd: 'PT-424', ft: 'FT-426', head: 'H-FU', npsh: 'NPSH-FU', hyd: 'PWR-FUH', tank: 'PT-420', zt: 'ZT-428' },
];

/* First time after t0 that V crosses `level` going up (dir 1) or down (-1), held for `hold` s. */
function crossHeld(T, V, t0, t1, level, dir, hold = 0) {
  let start = null;
  for (let k = 0; k < T.length; k++) {
    const t = T[k]; if (t < t0) continue; if (t > t1) break;
    const ok = dir > 0 ? V[k] >= level : V[k] <= level;
    if (ok) { if (start === null) start = t; if (t - start >= hold) return start; } else start = null;
  }
  return NaN;
}

export function computeMetricsTP(run, def) {
  const d = run.data, T = d.T;
  if (T.length < 10) return null;
  const ch = id => d.series(id);
  const cmd = ch('TSV-332-CMD');
  if (!cmd) return null;
  const e = edges(T, cmd);
  if (!e.on.length) return null;
  const tOn = e.on[0], tOff = e.off.find(t => t > tOn) ?? T[T.length - 1];
  const p = run.plan || {}, mode = p.mode || 'spin', ctl = p.ctl || 'speed', ramp = p.ramp ?? 3;
  const TP = def.physics.turbopump, Nd = TP.Nd, J = TP.J, rm = TP.turbine.rm;
  const out = { kind: 'pump', mode, items: [], windows: {}, summary: {}, points: [], flags: [], tOn, tOff };
  const push = (key, label, value, quantity, note = '') => out.items.push({ key, label, value, quantity, note });
  const S = out.summary;
  const spd = ch('SPD'), pred = run.meta?.config?.prediction || null;
  S.dur = tOff - tOn;
  S.mode = mode;

  /* ---- steady points ------------------------------------------------- */
  const windows = [];
  if (mode === 'map' && p.thrSteps?.length) {
    const dw = p.dwell ?? 4;
    p.thrSteps.forEach((x, k) => {
      const a = tOn + ramp + k * dw + 0.5 * dw, b = tOn + ramp + (k + 1) * dw - 0.1;
      if (b <= tOff + 1e-6 && b > a) windows.push([a, b, x]);
    });
  } else if (mode === 'spin') {
    const a = ctl === 'speed' ? tOn + ramp + 1.5 : tOn + Math.max(2, 0.5 * S.dur), b = tOff - 0.2;
    if (b > a + 0.3) windows.push([a, b, p.thrOx ?? p.thr]);
  } else if (mode === 'suction') {
    const a = tOn + ramp + 1.5, b = tOn + ramp + (p.settle ?? 3) - 0.1;
    if (b > a + 0.3) windows.push([a, b, p.thr]);
  }
  const tin = ch('PT-333'), tt4 = ch('TT-334'), tt5 = ch('TT-335'), gas = ch('FT-337'), eta = ch('ETA-T'), pwt = ch('PWR-T');
  const Pamb = def.physics.ambient.P;
  for (const [a, b, thr] of windows) {
    const N = meanIn(T, spd, a, b), n = N / Nd;
    const pt = { t0: a, t1: b, thr, N, n };
    for (const sd of SID) {
      const md = meanIn(T, ch(sd.ft), a, b), H = meanIn(T, ch(sd.head), a, b);
      pt['mdot' + sd.key] = md;
      pt['Q' + sd.key] = md / RHO;
      pt['H' + sd.key] = H;
      pt['Pin' + sd.key] = meanIn(T, ch(sd.pin), a, b);
      pt['Pd' + sd.key] = meanIn(T, ch(sd.pd), a, b);
      pt['npsh' + sd.key] = meanIn(T, ch(sd.npsh), a, b);
      pt['Phyd' + sd.key] = meanIn(T, ch(sd.hyd), a, b);
      pt['Hn' + sd.key] = n > 0.05 ? H / (n * n) : NaN;          // head referred to design speed
      pt['Qn' + sd.key] = n > 0.05 ? md / RHO / n : NaN;          // flow referred to design speed
    }
    pt.Ptin = meanIn(T, tin, a, b);
    pt.Ttin = meanIn(T, tt4, a, b);
    pt.Texh = meanIn(T, tt5, a, b);
    pt.mdotGas = meanIn(T, gas, a, b);
    pt.etaT = meanIn(T, eta, a, b);
    pt.Pturb = meanIn(T, pwt, a, b);
    const x = 1 - Math.pow(Pamb * 1.05 / (pt.Ptin + Pamb), 0.4 / 1.4);
    pt.c0 = Math.sqrt(2 * 1039 * pt.Ttin * Math.max(0, x));
    pt.uc0 = pt.c0 > 0 ? N * TAU / 60 * rm / pt.c0 : NaN;
    pt.etaPumps = pt.Pturb > 100 ? (pt.PhydOx + pt.PhydFu) / pt.Pturb : NaN;
    out.points.push(pt);
  }
  out.windows.steady = windows.length ? [windows[0][0], windows[windows.length - 1][1]] : null;

  /* ---- speed: spin-up, peak, coast-down ------------------------------ */
  const Nhold = out.points[0]?.N ?? maxIn(T, spd, tOn, tOff).v;
  S.spinup = crossHeld(T, spd, tOn, tOff, 0.9 * Nhold, 1) - tOn;
  S.Npeak = maxIn(T, spd, tOn, tOff + 1).v;
  S.overshoot = ctl === 'speed' && p.speed ? S.Npeak / p.speed - 1 : NaN;
  const Noff = meanIn(T, spd, tOff - 0.05, tOff);
  S.Noff = Noff;
  S.coast50 = crossHeld(T, spd, tOff, T[T.length - 1], 0.5 * Noff, -1) - tOff;
  // the tail of the coast-down, where the pumps have unloaded (load ∝ n²) and
  // the bearings' and seals' drag is most of what is left
  S.coast10 = crossHeld(T, spd, tOff, T[T.length - 1], 0.1 * Noff, -1) - tOff;
  // deceleration over the first 150 ms after the valve has shut (stroke ≈ 60 ms)
  const a0 = tOff + 0.1, a1 = tOff + 0.25;
  const n0 = meanIn(T, spd, a0 - 0.02, a0 + 0.02), n1 = meanIn(T, spd, a1 - 0.02, a1 + 0.02);
  S.decel = (n0 - n1) / (a1 - a0);                                      // rpm/s
  // the load goes roughly as speed squared: refer it back to the speed at shut-off
  const nMid = 0.5 * (n0 + n1);
  S.dragTorque = nMid > 0 ? J * S.decel * TAU / 60 * (Noff / nMid) ** 2 : NaN;   // N·m at Noff
  out.tOn = tOn; out.tOff = tOff;

  /* ---- suction test ------------------------------------------------- */
  if (mode === 'suction') {
    const sd = SID[p.side === 'fu' ? 1 : 0];
    const ref = out.points[0]?.['H' + sd.key];
    const t0 = tOn + ramp + (p.settle ?? 3);
    const Hs = ch(sd.head), Ns = ch(sd.npsh);
    S.suctionSide = sd.key;
    S.Href = ref;
    // the head has broken down when it is 3 % under the reference and stays there
    const tb = Number.isFinite(ref) ? crossHeld(T, Hs, t0, tOff, 0.97 * ref, -1, 0.25) : NaN;
    S.tBreak = tb;
    S.npshr3 = Number.isFinite(tb) ? meanIn(T, Ns, tb - 0.05, tb + 0.05) : NaN;
    S.tankAtBreak = Number.isFinite(tb) ? meanIn(T, ch(sd.tank), tb - 0.05, tb + 0.05) : NaN;
    S.NAtBreak = Number.isFinite(tb) ? meanIn(T, spd, tb - 0.05, tb + 0.05) : NaN;
    S.npshEnd = meanIn(T, Ns, tOff - 0.3, tOff);
    S.HEnd = meanIn(T, Hs, tOff - 0.3, tOff);
    out.windows.suction = [t0, tOff];
  }

  /* ---- health ------------------------------------------------------- */
  S.vibMax = maxIn(T, ch('VIB-345'), tOn, tOff + 1).v;
  S.TbMax = Math.max(maxIn(T, ch('TC-343'), tOn, T[T.length - 1]).v, maxIn(T, ch('TC-344'), tOn, T[T.length - 1]).v);
  S.TcasMax = Math.max(maxIn(T, ch('TT-415'), tOn, T[T.length - 1]).v, maxIn(T, ch('TT-425'), tOn, T[T.length - 1]).v);
  const sa = ch('SE-341'), sb = ch('SE-342');
  let dis = 0;
  for (let k = 0; k < T.length; k++) if (T[k] >= tOn && T[k] <= tOff && Math.max(sa[k], sb[k]) > 3000) dis = Math.max(dis, Math.abs(sa[k] - sb[k]));
  S.pickupSplit = dis;

  /* ---- the reduction, as rows ---------------------------------------- */
  const pr = (v, q, dp = 0) => (Number.isFinite(v) ? v.toFixed(dp) : '—');
  push('spinup', 'Spin-up: turbine valve open → 90 % of held speed', S.spinup, 'time');
  push('Npeak', 'Peak speed', S.Npeak, 'speed', ctl === 'speed' && p.speed ? `target ${p.speed.toFixed(0)}; overshoot ${(100 * S.overshoot).toFixed(1)} %` : '');
  const P0 = out.points[0];
  if (P0) {
    const pn = mode === 'map' ? ' (first point)' : '';
    push('N', `Speed, held${pn}`, P0.N, 'speed', `${(100 * P0.n).toFixed(1)} % of design`);
    for (const sd of SID) {
      push('mdot' + sd.key, `${sd.name} flow${pn} (${sd.ft})`, P0['mdot' + sd.key], 'massflow', pred && mode !== 'map' ? `pred. ${(pred['mdot' + sd.key] * 1e3).toFixed(0)} g/s` : '');
      push('H' + sd.key, `${sd.name} head${pn}`, P0['H' + sd.key], 'head', pred && mode !== 'map' ? `pred. ${pr(pred['head' + sd.key])} m` : '');
      push('Pd' + sd.key, `${sd.name} discharge${pn} (${sd.pd})`, P0['Pd' + sd.key], 'pressure');
      push('npsh' + sd.key, `${sd.name} NPSH available${pn}`, P0['npsh' + sd.key], 'head', pred ? `required ≈ ${pr(pred['npshr' + sd.key])} m (design curve)` : '');
    }
    push('Ptin', `Turbine inlet pressure${pn} (PT-333)`, P0.Ptin, 'pressure', pred ? `pred. ${pr(pred.Ptin / 6894.757)} psig` : '');
    push('dTturb', `Turbine gas temperature drop${pn}`, P0.Ttin - P0.Texh, 'ratio', 'kelvin');
    push('etaT', `Turbine efficiency${pn} (ΔT / ΔT isentropic)`, P0.etaT, 'ratio', `u/c0 ${pr(P0.uc0, 0, 3)}${pred ? `; pred. ${pr(pred.etaT, 0, 3)}` : ''}`);
    push('Pturb', `Turbine power${pn} (FT-337 · cp · ΔT)`, P0.Pturb, 'power');
    push('etaPumps', `Pumps' hydraulic ÷ turbine power${pn}`, P0.etaPumps, 'ratio', 'both pumps together; bearings and windage are inside the difference');
  }
  if (mode === 'map') {
    out.points.forEach((pt, k) => {
      push('mapOx' + k, `Map ${k + 1} (throttle ${Math.round(100 * pt.thr)} %): ox Q/n, H/n²`, pt.HnOx, 'head', `${(pt.QnOx * 1e3).toFixed(3)} L/s at design speed; ${pt.N.toFixed(0)} rpm`);
      push('mapFu' + k, `Map ${k + 1} (throttle ${Math.round(100 * pt.thr)} %): fuel Q/n, H/n²`, pt.HnFu, 'head', `${(pt.QnFu * 1e3).toFixed(3)} L/s at design speed`);
    });
  }
  if (mode === 'suction') {
    push('Href', `Head at the start of the ramp (${S.suctionSide === 'Fu' ? 'fuel' : 'ox'} pump)`, S.Href, 'head');
    push('npshr3', 'NPSH at 3 % head drop (NPSH required)', S.npshr3, 'head', Number.isFinite(S.tBreak) ? `at T+${(S.tBreak - tOn).toFixed(1)} s, ${S.NAtBreak.toFixed(0)} rpm` : 'no 3 % drop reached');
    push('tankAtBreak', 'Tank pressure at 3 % head drop', S.tankAtBreak, 'pressure');
    push('HEnd', 'Head at the end of the ramp', S.HEnd, 'head', `NPSH available ${pr(S.npshEnd, 0, 1)} m`);
  }
  push('coast50', 'Coast-down: turbine valve shut → half speed', S.coast50, 'time', `from ${Noff.toFixed(0)} rpm`);
  S.loadPower = S.dragTorque * Noff * TAU / 60;
  push('coast10', 'Coast-down: turbine valve shut → 10 % speed', S.coast10, 'time', 'the slow tail is bearing and seal drag');
  push('drag', 'Shaft load just after shut-off (J · deceleration)', S.dragTorque, 'ratio',
    `N·m, i.e. ${(S.loadPower / 1e3).toFixed(2)} kW at ${Noff.toFixed(0)} rpm — an independent check of the turbine power (J = ${J.toExponential(2)} kg·m², drawing)`);
  push('vibMax', 'Peak vibration (VIB-345)', S.vibMax, 'accel');
  push('TbMax', 'Hottest bearing (TC-343 / TC-344)', S.TbMax, 'temperature');
  push('TcasMax', 'Hottest pump casing (TT-415 / TT-425)', S.TcasMax, 'temperature');
  push('split', 'Largest speed-pickup disagreement', S.pickupSplit, 'speed', 'SE-341 vs SE-342');
  if (S.overshoot > 0.03) out.flags.push('speed-overshoot');
  if (S.pickupSplit > 600) out.flags.push('pickup-disagreement');
  if (S.vibMax > 4) out.flags.push('vibration');
  if (P0 && pred && Math.abs(P0.HOx / pred.headOx - 1) > 0.05 && mode === 'spin') out.flags.push('ox-head-off-prediction');
  if (P0 && pred && Math.abs(P0.HFu / pred.headFu - 1) > 0.05 && mode === 'spin') out.flags.push('fuel-head-off-prediction');
  return out;
}
