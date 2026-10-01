/* Predict a test: run a planned cold-gas test on a stand, start to finish,
   the way an operator would, and hand back the recorded run. No DOM.

   This is not the steady-state prediction (physics/predict.js): it is the
   whole test, through the same session, instruments, DAQ and reductions a
   real one goes through — pressurisation, lock-up, the firing sequence,
   blowdown, the regulator's droop and recovery, the valve's opening delay,
   the stand ringing. What comes back is a recorded run that opens in
   ANALYSIS exactly like a measured one, so a real test can be overlaid on
   it point for point.

   plan: { regSet (psig), mode: 'single' | 'pulse', duration (s),
           on, off (ms), count, rate (Hz), seed } */

import { Session } from './session.js';
import { psi } from '../lib/units.js';

const COUNTDOWN = 5;

export async function predictTest(def, plan, { onProgress = null, runPrefix = 'PRED', firstRun = 1, yieldEvery = 2 } = {}) {
  const S = new Session({ def, mode: 'independent', seed: plan.seed ?? 1, runPrefix, firstRun });
  const ex = (a, x = {}) => S.execute(a, x, { confirmed: true });
  const steps = [];
  let done = 0;
  const run = async (sec, label) => {
    // advance in slices, giving the page a chance to draw between them
    const slice = 0.5;
    for (let t = 0; t < sec - 1e-9; t += slice) {
      S.run(Math.min(slice, sec - t));
      done += Math.min(slice, sec - t);
      if (onProgress && (done % yieldEvery) < slice) { onProgress({ t: S.t, label }); await new Promise(r => setTimeout(r, 0)); }
    }
  };
  const step = text => steps.push({ t: S.t, text });

  step('DAQ power on, zero the transducers, tare the load cell');
  ex('daqPower', { on: true }); await run(5, 'DAQ boot');
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: [def.loadCell || 'LC-501'] });
  ex('daqRate', { rate: plan.rate || 2000 });
  step('Open the bottle; close the vents; open the isolation valve');
  ex('tech', { task: 'openHV' }); await run(9, 'opening bottle');
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
  ex('valve', { id: 'IV-101', open: true }); await run(2, 'isolation valve');
  ex('clearCell'); await run(7, 'clearing cell'); ex('pa', { text: 'test' });
  const set = psi(plan.regSet);
  step(`Regulator to ${plan.regSet} psig; wait for lock-up`);
  ex('regSet', { value: set });
  const slew = def.physics.elements.find(e => e.id === def.regulator)?.domeRate || psi(25);
  await run(Math.min(120, set / slew + 8), 'pressurising');
  ex('tare', { ids: [def.loadCell || 'LC-501'] });
  const p = plan.mode === 'pulse'
    ? { mode: 'pulse', on: plan.on / 1e3, off: plan.off / 1e3, count: plan.count }
    : { mode: 'single', duration: plan.duration };
  ex('plan', { plan: p });
  ex('record', { on: true }); await run(0.5, 'recording');
  ex('arm');
  step(`Fire: ${p.mode === 'pulse' ? `${p.count} × ${plan.on} ms on / ${plan.off} ms off` : `${p.duration} s`}`);
  const r = ex('fire');
  const span = p.mode === 'pulse' ? p.count * (p.on + p.off) : p.duration;
  await run(COUNTDOWN + span + 3, 'firing');
  ex('record', { on: false });
  const out = S.runs[S.runs.length - 1] || null;
  if (out) out.meta.objective = `PREDICTION — ${def.short || def.name}`;
  return { run: out, session: S, steps, fired: r?.ok !== false, aborted: !!out?.aborted, abort: out?.abort || null };
}

/* A plain-language summary of what the predicted test should look like. */
export function describePrediction(res, def) {
  const r = res.run, m = r?.metrics?.summary;
  if (!r || !m) return ['No firing was recorded — the sequence did not run (see the log).'];
  const P = x => `${(x / 6894.757).toFixed(1)} psig`;
  const lines = [];
  if (r.aborted) lines.push(`ABORTED: ${r.abort}.`);
  if (r.plan?.mode === 'pulse') {
    lines.push(`Impulse bit ${(m.Ibit * 1e3).toFixed(2)} mN·s mean, ${(100 * m.IbitCv).toFixed(1)} % scatter, over ${m.n} pulses.`);
    if (Number.isFinite(m.pdelay)) lines.push(`Opening delay ≈ ${(m.pdelay * 1e3).toFixed(1)} ms, closing ≈ ${(m.pclose * 1e3).toFixed(1)} ms (command to Pc 10 %); mean peak Pc ${P(m.PcPk)}.`);
  } else {
    lines.push(`Steady chamber pressure ${P(m.Pc)}, thrust ${m.F.toFixed(3)} N.`);
    if (Number.isFinite(m.mdotFM)) lines.push(`Mass flow ${(m.mdotFM * 1e3).toFixed(2)} g/s (flowmeter), Isp ${m.IspFM?.toFixed(1)} s.`);
    else if (Number.isFinite(m.mdot)) lines.push(`Mass flow ${(m.mdot * 1e3).toFixed(2)} g/s (calculated from Pc and the nominal throat), Isp ${m.Isp?.toFixed(1)} s.`);
    if (Number.isFinite(m.droop)) lines.push(`Regulator droop ${(m.droop / 6894.757).toFixed(1)} psi from lock-up to flowing.`);
    if (Number.isFinite(m.Preg) && Number.isFinite(m.Pin)) lines.push(`Regulator outlet ${P(m.Preg)} while flowing; feed line and filter lose ${((m.Preg - m.Pin) / 6894.757).toFixed(1)} psi, the fire valve ${((m.Pin - m.Pc) / 6894.757).toFixed(1)} psi.`);
    if (Number.isFinite(m.delay)) lines.push(`Opening delay ≈ ${(m.delay * 1e3).toFixed(1)} ms (command → Pc 10 %); Pc rise 10–90 % ≈ ${(m.rise * 1e3).toFixed(1)} ms; tail-off ≈ ${(m.sdelay * 1e3).toFixed(1)} ms.`);
    lines.push(`Total impulse ${m.I.toFixed(2)} N·s; thrust coefficient ${m.Cf.toFixed(3)}.`);
  }
  if (r.alarms?.length) lines.push(`Alarms: ${[...new Set(r.alarms)].join('; ')}.`);
  return lines;
}
