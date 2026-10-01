/* LEVEL 4 — Pulse testing.

   Attitude-control thrusters live on short pulses, and short pulses are
   governed by the valve, not the nozzle. This test measures the valve's
   response at two inlet pressures, then sweeps pulse width down until the
   thruster stops producing anything — the minimum impulse bit — and checks
   how repeatable the pulses are.

   Everything here happens in a few milliseconds, so the DAQ runs at 5 kHz. */

import { psi, fmt, unitLabel } from '../../lib/units.js';
import { near, lastEvent, finalize, pretest, instrumentation, zeroCal, daqConfig, supplyLeak, clearCell,
         pressurise, safeStand, returnSafe, inspectStep, reportStep, runsWhere } from './common.js';
const PSIG = () => unitLabel('pressure', true);

const HI = psi(150), LO = psi(60);
const VR = 0.5;                                  // s, valve-response burn
const WIDTHS = [0.020, 0.010, 0.006, 0.005];     // s, pulse sweep
const OFF = 0.2, COUNT = 10;

const matchBurn = p => r => near(r.meta.config.regSet, p, psi(1)) && r.plan?.mode === 'single' && near(r.plan.duration, VR, 0.01) && r.meta.config.rate >= 5000;
const matchTrain = w => r => near(r.meta.config.regSet, HI, psi(1)) && r.plan?.mode === 'pulse' && near(r.plan.on, w, 0.0003) && r.plan.count >= COUNT && r.meta.config.rate >= 5000;
const burn = (v, p) => runsWhere(v, matchBurn(p)).pop();
const train = (v, w) => runsWhere(v, matchTrain(w)).pop();
const done = v => WIDTHS.every(w => train(v, w));
const ms = x => (x * 1e3).toFixed(x < 0.01 ? 1 : 0);

export const request = def => ({
  regSet: HI,
  matrix: [HI, LO],
  duration: VR,
  supplyAssumed: psi(2200),
  title: 'CGT-1 valve response and pulse performance',
  text: `Characterise SV-301 and CGT-1 in pulse mode at ≥ 5000 Hz. (1) Valve response: a ${VR} s burn at ${fmt(HI, 'pressure', 0)} ${PSIG()} and at ${fmt(LO, 'pressure', 0)} ${PSIG()} — opening and shutdown delays. (2) Pulse sweep at ${fmt(HI, 'pressure', 0)} ${PSIG()}: ${COUNT} pulses each at ${WIDTHS.map(ms).join(', ')} ms on, ${OFF * 1e3} ms off — impulse bit, repeatability, and the minimum pulse that fires.`,
  success: 'Valve delays at both pressures; impulse bit and its scatter at every width; the minimum firing pulse width identified.',
});

export function procedure(def) {
  const train0 = { id: 'J', title: `Pulse sweep — ${fmt(HI, 'pressure', 0)} ${PSIG()}`, steps: [
    { kind: 'action', station: 'PROP', title: `PR-101 back to ${fmt(HI, 'pressure', 0)} ${PSIG()}, locked up, LC re-tared`,
      text: 'Pulses are fired at the higher pressure. Re-tare the load cell once the regulator has locked up.',
      why: 'The same static checks as before every firing.',
      check: v => { const t = lastEvent(v, e => e.tare), sp = lastEvent(v, e => e.cat === 'CMD' && /setpoint/.test(e.text));
        return near(v.regSet, HI, psi(1)) && near(v.ch('PT-201'), HI, psi(5)) && !!burn(v, LO) && !!t && t.t > (sp?.t ?? Infinity); } },
    ...WIDTHS.map(w => ({ kind: 'action', station: 'TC', title: `Pulse train: ${COUNT} × ${ms(w)} ms on / ${OFF * 1e3} ms off`,
      text: `FIRE CONTROL ▸ Pulse train ▸ ${ms(w)} ms on, ${OFF * 1e3} ms off × ${COUNT} ▸ LOAD. Record, arm, fire.`,
      why: w >= 0.01 ? 'Long enough for the chamber to reach steady pressure: the impulse bit should scale with width.'
        : 'Getting close to the valve\'s own opening delay. Watch whether the chamber pressure still reaches steady state — and whether it rises at all.',
      check: v => !!train(v, w) })),
  ] };
  return finalize({
    id: 'cg-pulse',
    title: 'TP-CG-004 · Valve response and pulse performance',
    sections: [
      pretest(def, 'A'),
      instrumentation(def, 'B'),
      zeroCal(def, 'C'),
      daqConfig(def, 'D', { minRate: 5000, title: 'Set the sample rate to 5000 Hz',
        text: 'Console ▸ DAQ ▸ Rate ▸ 5000 Hz. The valve strokes in about 2 ms; at 1000 Hz that is two samples.',
        why: 'Pulse testing is transient testing and nothing else: every number in this test is a delay or an integral over a few milliseconds.',
        teach: 'At 5000 Hz the noise band on every channel is visibly wider than at 1000 Hz. That is the price of seeing the valve.' }),
      supplyLeak(def, 'E'),
      clearCell(def, 'F'),
      pressurise(def, 'G'),
      { id: 'H', title: 'Series set-up and poll', steps: [
        { kind: 'action', station: 'TC', title: `Load the valve-response plan: single burn, ${VR} s`,
          text: 'Long enough to open the valve and reach steady state; short enough to save gas.',
          why: 'For valve response you need the start and the stop, not the middle.',
          check: v => v.plan.mode === 'single' && near(v.plan.duration, VR, 0.001) },
        { kind: 'action', station: 'DAQ', title: 'Start recording', text: 'Recording auto-stops after each firing; start it again before each later one.',
          why: 'One run per firing.', check: v => v.daq.recording || v.runs.length > 0 },
        { kind: 'poll', station: 'TC', title: 'Go/no-go poll for the series',
          text: 'One poll covers the approved matrix (two setpoints, the planned pulse trains). A change outside it — a valve, the cell — needs a new poll.',
          why: 'Series testing: poll once for the approved matrix.' },
      ] },
      { id: 'I', title: 'Valve response', steps: [
        { kind: 'action', station: 'TC', title: `Fire ${VR} s at ${fmt(HI, 'pressure', 0)} ${PSIG()}`,
          text: 'Arm and fire.', why: 'Baseline valve response at the working pressure.', check: v => !!burn(v, HI) },
        { kind: 'record', station: 'TC', title: `Opening delay at ${fmt(HI, 'pressure', 0)} ${PSIG()} (ms)`,
          text: 'ANALYSIS ▸ the run ▸ "Start" preset. Command to 10 % of steady chamber pressure. Check the automatic value with the cursors: A on the command edge, B where PT-401 starts to rise.',
          why: 'The delay is electrical (the coil current has to build) and mechanical (the armature has to move). Look at SV-301-I: the dip in the current marks the armature moving.',
          record: { unit: 'ms', validate: (x, v) => {
            const r = burn(v, HI); if (!r) return { ok: false, msg: 'Fire the burn first.' };
            const d = r.metrics.summary.delay * 1e3;
            return near(x, d, 0.3) ? { ok: true, msg: `${d.toFixed(2)} ms` } : { ok: false, msg: `The reduction gives ${d.toFixed(2)} ms.` };
          } } },
        { kind: 'action', station: 'PROP', title: `Lower the feed to ${fmt(LO, 'pressure', 0)} ${PSIG()}: set PR-101, then bleed through VV-201`,
          text: `Set PR-101 to ${fmt(LO, 'pressure', 0)} ${PSIG()} and watch PT-201: it does not move — and after a second the "regulator outlet above setpoint" caution trips. Expected, and you know why: acknowledge it. PR-101 is a NON-RELIEVING regulator — it can only add gas downstream, never remove it. Open VV-201 until PT-201 falls to about ${fmt(LO, 'pressure', 0)} ${PSIG()} (the regulator will catch it there and flow to the vent), then close VV-201 and let it lock up. Re-tare LC-501. Operating a vent is outside the approved matrix, so the series poll no longer covers the stand: poll again before you arm.`,
          why: 'Going down in pressure takes a vent. Fire without bleeding down and the "low-pressure" run is really at the old pressure — a whole data point quietly at the wrong condition.',
          teach: 'Many regulators are self-relieving (they vent excess outlet pressure through the bonnet); PR-101 is not. Know which kind you have before you plan a sweep that goes downward.',
          check: v => near(v.regSet, LO, psi(1)) && near(v.ch('PT-201'), LO, psi(4)) && v.cmd('VV-201') === 0, focus: ['PR-101', 'VV-201'] },
        { kind: 'action', station: 'TC', title: `Fire ${VR} s at ${fmt(LO, 'pressure', 0)} ${PSIG()}`,
          text: 'Arm and fire.', why: '', check: v => !!burn(v, LO) },
        { kind: 'record', station: 'TC', title: `Opening delay at ${fmt(LO, 'pressure', 0)} ${PSIG()} (ms)`,
          text: 'Same measurement, lower pressure.', why: '',
          record: { unit: 'ms', validate: (x, v) => {
            const r = burn(v, LO); if (!r) return { ok: false, msg: 'Fire the burn first.' };
            const d = r.metrics.summary.delay * 1e3;
            return near(x, d, 0.3) ? { ok: true, msg: `${d.toFixed(2)} ms` } : { ok: false, msg: `The reduction gives ${d.toFixed(2)} ms.` };
          } } },
        { kind: 'verify', station: 'TC', title: 'The valve opens later at the higher inlet pressure',
          text: 'Compare the two delays. Is the difference larger than the shot-to-shot scatter? Why would pressure delay a valve?',
          why: 'SV-301 is normally closed: inlet pressure pushes its poppet onto the seat. The coil must build more current to overcome a bigger pressure load, and an inductive coil takes time to build current. Valve timing is a function of operating pressure — a pulse schedule tuned at one pressure is wrong at another.',
          check: v => { const a = burn(v, HI), b = burn(v, LO); return !!a && !!b && a.metrics.summary.delay > b.metrics.summary.delay + 0.0003; },
          failMsg: 'Fire both burns first.' },
      ] },
      train0,
      { id: 'K', title: 'Pulse reduction', steps: [
        { kind: 'action', station: 'TC', title: 'ANALYSIS ▸ CAMPAIGN: impulse bit against pulse width',
          text: 'x "Pulse width (commanded)", y "Impulse bit (mean)", the four trains included.',
          why: 'The shape of this curve is the thruster\'s pulse performance: straight while the chamber reaches steady state, falling away as the pulse approaches the valve\'s dead time, and zero below it.',
          check: v => v.flags.has('campaign') },
        { kind: 'record', station: 'TC', title: `Mean impulse bit at ${ms(WIDTHS[0])} ms (mN·s)`,
          text: 'From the reduction of that train.', why: 'The headline pulse-mode number.',
          record: { unit: 'mN·s', validate: (x, v) => {
            const r = train(v, WIDTHS[0]); if (!r) return { ok: false, msg: 'Fire the train first.' };
            const ib = r.metrics.summary.Ibit * 1e3;
            return near(x, ib, 0.03 * ib) ? { ok: true, msg: `${ib.toFixed(1)} mN·s` } : { ok: false, msg: `The reduction gives ${ib.toFixed(1)} mN·s.` };
          } } },
        { kind: 'record', station: 'TC', title: `Impulse-bit repeatability at ${ms(WIDTHS[0])} ms (1σ as % of mean)`,
          text: 'The scatter of ten nominally identical pulses.',
          why: 'For a control system the repeatability of the impulse bit matters as much as its size: it is the noise in every correction the spacecraft makes.',
          record: { unit: '%', validate: (x, v) => {
            const r = train(v, WIDTHS[0]); if (!r) return { ok: false, msg: 'Fire the train first.' };
            const cv = r.metrics.summary.IbitCv * 100;
            return near(x, cv, Math.max(0.15, 0.25 * cv)) ? { ok: true, msg: `${cv.toFixed(2)} %` } : { ok: false, msg: `The reduction gives ${cv.toFixed(2)} %.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Shortest commanded pulse that produced chamber pressure (ms)',
          text: 'Look at "Pulses that produced chamber pressure" for each train, and at the traces: which widths gave nothing at all?',
          why: 'Below a certain width the coil current never reaches pull-in before the command ends: the valve does not move and the thruster does not fire. That width, at this pressure, bounds the minimum impulse bit.',
          record: { unit: 'ms', validate: (x, v) => {
            const firedW = WIDTHS.filter(w => { const r = train(v, w); return r && r.metrics.summary.fired >= r.metrics.summary.n / 2; });
            if (!firedW.length) return { ok: false, msg: 'Fire the trains first.' };
            const m = Math.min(...firedW) * 1e3;
            return near(x, m, 0.05) ? { ok: true, msg: `${m.toFixed(0)} ms — shorter pulses did not open the valve` } : { ok: false, msg: `The data say ${m.toFixed(0)} ms.` };
          } } },
        { kind: 'info', station: 'TC', title: 'What the minimum impulse bit depends on',
          text: 'It moves with inlet pressure (you measured the delay change), with coil voltage and temperature (a hot coil has more resistance and pulls in later), and with the driver: many flight valves use a "spike-and-hold" driver that over-drives the coil to open it fast. The minimum impulse bit is a property of the valve AND its electronics AND the operating point.',
          why: 'A number without its conditions is not a result.' },
      ] },
      safeStand(def, 'L', done),
      returnSafe(def, 'M', done),
      { id: 'N', title: 'Close-out', steps: [inspectStep(), reportStep()] },
    ],
  });
}

export default {
  id: 'cg-pulse',
  title: 'Pulse testing',
  objective: 'Valve response, impulse bit and minimum pulse',
  seriesPoll: true,
  request,
  procedure,
  setup(session) { session.daq.setRate(250); },
};
