/* Faults for TS-1 — what can be wrong with the stand, and the answer key.

   A fault is never announced. It changes the physics (a filter loads up, a
   throat erodes, a regulator seat leaks) or the measurement (a transducer
   shifts, a thermocouple opens, a load cell loses sensitivity), and the
   operator finds it — or doesn't — from the data and the inspections.

   Each entry:
     component, mode     the right answer (alt: other acceptable components)
     category            'system' (the hardware really misbehaves) or
                         'sensor' (the hardware is fine; a measurement lies)
     hazard              whether the real state was dangerous
     onset               'start' | 'pressurised' (first time the regulator is
                         set ≥ 100 psig) | { fire: T } (T s after a T-0)
     params(rng)         the fault's severity, randomised within a range
     apply(S, p)         set the hooks
     evidence            what a good diagnosis should cite: channels,
                         inspections, and checks ('leak-check', 'shunt-cal',
                         'go-no-go', 'prediction', 'static-agreement', …)
     inspect             how specific inspections read with this fault
                         (inspections not listed read the hardware as it is)
     story(p)            the debrief, revealed only after a diagnosis

   All hardware here is fictional. The failure mechanisms are the ordinary
   ones every cold-gas stand has. */

import { psi } from '../../lib/units.js';

const sign = rng => (rng.chance(0.5) ? 1 : -1);
const fmtP = x => `${(x / psi(1)).toFixed(0)} psi`;

export const FAULTS = [
  /* ---- regulator ------------------------------------------------------ */
  { id: 'reg-set', component: 'PR-101', alt: ['EPC-101'], mode: 'set-wrong', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ bias: sign(rng) * psi(18 + rng.uniform(0, 10)) }),
    apply: (S, p) => { S.model.element('PR-101').setBias = p.bias; },
    evidence: ['PT-201', 'PT-301', 'EPC-101', 'check-regulator', 'go-no-go'],
    inspect: { 'check-regulator': (S, p) => ({ lines: [
      ['Lock-up with dome at 150 psig', `${(150 + p.bias / psi(1)).toFixed(1)} psig`, '150 ± 3 psig'],
      ['Droop at 12 g/s', '5.1 psi', '≤ 8 psi'], ['Seat leak at lock-up', 'none', 'none']],
      text: 'The regulator tracks its dome faithfully — but with a constant offset. The loading spring/dome balance has shifted (a reference-spring adjustment moved, or the sensing element was replaced and not re-shimmed).' }) },
    story: p => ({
      what: `PR-101 regulates ${fmtP(Math.abs(p.bias))} ${p.bias > 0 ? 'above' : 'below'} its dome pressure. The EPC delivered exactly the dome pressure it was asked for; the regulator turned it into the wrong outlet pressure.`,
      indicators: 'PT-201 and PT-301 agree with EACH OTHER (so neither transducer is wrong) but not with the setpoint and EPC-101 feedback. With no flow there is no pressure drop, so two good transducers reading the same wrong number means the pressure really is wrong.',
      misleading: 'EPC-101 feedback reads exactly the setpoint. It is the dome loading, not the outlet — it tells you the controller did its job, nothing about the regulator.',
      notice: 'At lock-up, before firing: the go/no-go PROP station reports the outlet against setpoint. That is the moment to hold.',
      abort: 'No abort needed — the hardware is safe. The test would be at the wrong condition, which makes the data wrong rather than the stand dangerous. The right call was NO-GO before firing.',
      expert: 'Check agreement first (two sensors agree → the pressure is real), then compare with the command chain (EPC fb = setpoint → the problem is between dome and outlet). One sentence of logic isolates it to the regulator before any spanner comes out.',
    }) },
  { id: 'reg-droop', component: 'PR-101', mode: 'droop', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ scale: 3.5 + rng.uniform(0, 1.5) }),
    apply: (S, p) => { S.model.element('PR-101').droopScale = p.scale; },
    evidence: ['PT-201', 'PT-401', 'LC-501', 'droop', 'check-regulator', 'prediction'],
    inspect: { 'check-regulator': (S, p) => ({ lines: [
      ['Lock-up with dome at 150 psig', '150.4 psig', '150 ± 3 psig'],
      ['Droop at 12 g/s', `${(5.1 * p.scale).toFixed(1)} psi`, '≤ 8 psi'], ['Seat leak at lock-up', 'none', 'none']],
      text: 'Locks up correctly; sags badly under flow. The sensing diaphragm is stiffened (hardened elastomer) or the poppet is sticking partway — it needs a large pressure error before it opens enough.' }) },
    story: p => ({
      what: `PR-101 droops about ${(5.1 * p.scale).toFixed(0)} psi at the thruster's flow instead of about 5. It locks up at the right pressure and only misbehaves while gas flows.`,
      indicators: 'PT-201 steps down hard at T-0 and stays down; chamber pressure and thrust are low against the prediction by about the same ratio; the reduced droop (lock-up minus steady) is several times the Level-2 value.',
      misleading: 'Every static check passes. PT-201 at lock-up is perfect, so a pre-fire poll finds nothing.',
      notice: 'Compare the reduction\'s droop with a known-good run. A thrust shortfall that tracks a regulator-outlet shortfall points upstream of the thruster.',
      abort: 'Not an abort case. The stand is safe; the thrust-out-of-family caution is the operator\'s decision, and continuing to the end of a short burn to get the data is reasonable.',
      expert: 'Walk the pressure down the line during flow: bottle → regulator inlet → outlet → valve inlet → chamber. The step that is too large is where the fault is. Here the outlet drops too far while the inlet is fine.',
    }) },
  { id: 'reg-creep', component: 'PR-101', mode: 'creep', category: 'system', hazard: true, onset: 'pressurised',
    params: rng => ({ cda: 6e-9 + rng.uniform(0, 6e-9) }),
    apply: (S, p) => { S.model.element('PR-101').creepCdA = p.cda; },
    evidence: ['PT-201', 'PT-301', 'RV-201', 'check-regulator', 'static-agreement'],
    inspect: { 'check-regulator': () => ({ lines: [
      ['Lock-up with dome at 150 psig', 'does not lock up', '150 ± 3 psig'],
      ['Outlet rise at zero flow', 'rises steadily toward inlet pressure', '< 0.5 psi/min'], ['Seat condition', 'nick across the poppet seat', 'clean']],
      text: 'The poppet seat is damaged — a particle has cut it. With no flow the regulator cannot close off, and the outlet creeps toward the inlet pressure until something relieves it.' }) },
    story: () => ({
      what: 'PR-101 does not seal at lock-up. Gas leaks past a damaged seat, so with no flow the outlet pressure creeps upward toward bottle pressure. RV-201 exists for exactly this failure.',
      indicators: 'PT-201 and PT-301 rise together, slowly, with the fire valve shut and no command change: a pressure rising in a closed volume must be fed from somewhere, and the only source is the regulator. The "outlet above setpoint" caution, then the overpressure redline if it runs on.',
      misleading: 'The early drift is tiny and looks like a thermal settle after pressurising. It is not: gas warmed by compression COOLS back, so thermal drift is downward.',
      notice: 'The G3 step: "PT-201 steady (not creeping)". A slope, not a value. A creeping outlet is a NO-GO.',
      abort: 'This is a real hazard: unchecked, the low-pressure side goes to the relief setting and beyond its MEOP. An automatic redline abort — or an operator abort on the creep — was correct.',
      expert: 'Isolate the source: close IV-101. If the creep stops (and PT-102 falls a little as the trapped HP gas feeds it), it is the regulator seat. Then vent, and pull the regulator for the bench.',
    }) },
  { id: 'reg-stuck', component: 'PR-101', mode: 'stuck', category: 'system', hazard: false, onset: { fire: 0.6 },
    params: rng => ({ x: 0.04 + rng.uniform(0, 0.03) }),
    apply: (S, p) => { S.model.element('PR-101').stuckAt = p.x; },
    evidence: ['PT-201', 'PT-102', 'PT-401', 'check-regulator'],
    inspect: { 'check-regulator': () => ({ lines: [
      ['Lock-up with dome at 150 psig', '150.2 psig (slowly)', '150 ± 3 psig'],
      ['Flow at 150 psig outlet', 'cannot pass more than ≈ 3 g/s', '≥ 25 g/s'], ['Poppet', 'binding in its guide — galled', 'free']],
      text: 'The poppet galls in its guide and jams nearly shut. It can top up a dead-ended line, slowly, but cannot pass the thruster\'s flow.' }) },
    story: () => ({
      what: 'PR-101\'s poppet jammed almost shut during the burn. The regulator could no longer pass the thruster\'s flow, so the outlet pressure collapsed while its inlet stayed at bottle pressure.',
      indicators: 'PT-102 (regulator inlet) stays at supply; PT-201 (outlet) falls away mid-burn; everything downstream follows PT-201 down. The fault is between PT-102 and PT-201 — that is one component.',
      misleading: 'Chamber pressure and thrust falling looks like a thruster problem, and the chamber-pressure-low redline names the chamber. The redline names the symptom, not the cause.',
      notice: 'The first channel to move. PT-201 leads; PT-401 follows.',
      abort: 'The automatic abort on low chamber pressure was correct and harmless: nothing was hazardous, but the data after the collapse were worthless.',
      expert: 'Look for the pair of adjacent transducers whose difference changed. Supply fine, outlet collapsing → regulator. Then bench it.',
    }) },

  /* ---- supply --------------------------------------------------------- */
  { id: 'supply-low', component: 'N2-K', mode: 'supply-low', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ Pg: psi(300 + rng.uniform(0, 80)) }),
    apply: (S, p) => {
      const t = S.model.net.vol('tank'), g = S.model.gas;
      t.P = S.def.physics.ambient.P + p.Pg; t.m = t.P * t.V / (g.R * t.T); t.U = t.m * g.cv * t.T;
    },
    evidence: ['PT-101', 'PT-102', 'PT-201', 'go-no-go', 'bottle-gauge'],
    inspect: { 'bottle-gauge': (S, p) => ({ lines: [['Bottle dial gauge', `≈ ${Math.round(p.Pg / psi(50)) * 50} psig`, '≥ 800 psig for this test'], ['Bottle tag', '"FULL 2200" — tag not updated', '']],
      text: 'A partly used bottle was reconnected with a FULL tag.' }) },
    story: p => ({
      what: `The bottle started at about ${fmtP(p.Pg)}, well below the ${800} psig minimum. During flow the regulator ran out of pressure to regulate with: it dropped out and the outlet followed the supply down.`,
      indicators: 'PT-101 itself, from the moment HV-100 opened, and the technician\'s bottle-gauge reading in the log. In flow: PT-201 sags toward PT-102 — the regulator is wide open and still cannot hold.',
      misleading: 'Nothing, really — the evidence is a single number on the screen from the first minutes. The trap is that nothing about it looks alarming until someone compares it with the minimum.',
      notice: 'Step "Record supply pressure" and the PROP go/no-go "Supply PT-101". Both name the limit.',
      abort: 'No hazard. The right answer was NO-GO before arming: change the bottle.',
      expert: 'Read every pre-test number against its limit, not against its feel. A number that is merely unfamiliar is the one that gets past a tired crew.',
    }) },
  { id: 'iv-partial', component: 'IV-101', mode: 'not-open', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ max: 0.09 + rng.uniform(0, 0.02) }),
    apply: (S, p) => { const v = S.model.element('IV-101'); v.maxOpen = p.max; v.zsoAt = p.max - 0.02; },
    evidence: ['PT-101', 'PT-102', 'IV-101-ZSO', 'check-iv', 'cctv'],
    inspect: { 'check-iv': (S, p) => ({ lines: [
      ['Ball position at full actuator stroke', `${(p.max * 90).toFixed(0)}° of 90°`, '90°'],
      ['Open limit switch (ZSO) trips at', `${((p.max - 0.02) * 90).toFixed(0)}°`, '88°'],
      ['Actuator supply air', '32 psig', '80 psig']],
      text: 'Actuator air is low, so the spring-return actuator barely overcomes its spring; and the open limit switch cam has slipped, so it reports OPEN at a few degrees. Two faults that together look like none.' }) },
    story: p => ({
      what: `IV-101 opened only about ${(p.max * 90).toFixed(0)}° of its 90°, and its open limit switch — misadjusted — reported OPEN anyway. The throttled ball restricted flow to the regulator.`,
      indicators: 'During flow, PT-102 (regulator inlet) fell far below PT-101 (supply) — normally they differ by a few psi. The regulator then dropped out and PT-201, PT-401 and thrust followed. The CCTV shows the actuator\'s position flag barely turned.',
      misleading: 'The P&ID showed IV-101 OPEN, because the P&ID shows the limit switch. The command, the indication and the drawing all agreed; the valve did not.',
      notice: 'Any large pressure drop across a valve that is supposed to be fully open. And the camera: the flag on the actuator is a mechanical indication independent of the switch.',
      abort: 'Not hazardous; low chamber pressure may abort the burn, and that is fine.',
      expert: 'Believe pressures before indications. When a switch says open and the pressure drop says restricted, the pressure drop is physics and the switch is a cam on a shaft.',
    }) },

  /* ---- flow path ------------------------------------------------------- */
  { id: 'filter-blocked', component: 'F-201', mode: 'restricted', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ b: 0.82 + rng.uniform(0, 0.05) }),
    apply: (S, p) => { S.model.element('F-201').blockage = p.b; },
    evidence: ['DP-F201', 'PT-201', 'PT-301', 'inspect-filter', 'prediction'],
    inspect: { 'inspect-filter': () => ({ lines: [['Element', 'heavily loaded — dark particulate, most of the pleats bridged', 'clean'], ['Upstream face', 'fibres and a metal flake', '']],
      text: 'Upstream contamination — likely from the last bottle change (a dirty pigtail) — has loaded the element.' }) },
    story: () => ({
      what: 'F-201\'s element was mostly blocked. With flow, the pressure drop across it was many times normal, so the fire valve and chamber saw much less pressure than the regulator delivered.',
      indicators: 'DP-F201 (PT-201 − PT-301) during the burn: tens of psi instead of about two. PT-201 itself was nearly normal. Chamber pressure and thrust were low in proportion to PT-301, not PT-201.',
      misleading: 'Statically, PT-201 and PT-301 agree perfectly — a blocked filter has no pressure drop without flow. Every pre-fire check passes.',
      notice: 'A pressure drop that only exists during flow belongs to a restriction, not a sensor.',
      abort: 'Not hazardous. Completing the burn to capture the data was reasonable; the thrust-out-of-family caution was the cue to stop and investigate afterwards.',
      expert: 'Locate the drop between two taps, then inspect what lies between them. Here: F-201 — and the tubing, because the same symptom comes from a kinked line.',
    }) },
  { id: 'line-kink', component: 'FEED-LINE', alt: ['F-201'], mode: 'restricted', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ b: 0.76 + rng.uniform(0, 0.06) }),
    apply: (S, p) => { S.model.element('F-201').blockage = p.b; },
    evidence: ['DP-F201', 'PT-201', 'PT-301', 'inspect-plumbing', 'inspect-filter'],
    inspect: {
      'inspect-filter': () => ({ lines: [['Element', 'clean', 'clean']], text: 'The filter element is clean.' }),
      'inspect-plumbing': () => ({ lines: [['Feed line, stand-crossing loop', 'kinked flat where it was re-routed around the new camera mount', 'smooth bend, supported']],
        text: 'The 3/8" line was bent too tightly when the loop was re-routed and has partly collapsed.' }) },
    story: () => ({
      what: 'The feed line between F-201 and SV-301 was kinked. It behaved exactly like a blocked filter: a large pressure drop between PT-201 and PT-301 during flow.',
      indicators: 'DP-F201 large during the burn, zero statically. The filter inspection came back CLEAN — the step that turns "the filter" into "something between the two transducers".',
      misleading: 'The channel is named DP-F201, and it names the filter. It measures everything between two taps, and the line is between them too.',
      notice: 'A clean filter and the same symptom. The inspection that finds nothing is evidence.',
      abort: 'Not hazardous. Stop and investigate after the burn.',
      expert: 'Name the fault by location first ("between PT-201 and PT-301"), component second. Then inspect every component in that span, starting with the likeliest and cheapest.',
    }) },
  { id: 'fitting-leak', component: 'SV-301', alt: ['FEED-LINE'], mode: 'ext-leak', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ cda: 1.5e-9 + rng.uniform(0, 1.5e-9) }),
    apply: (S, p) => { S.model.element('LK-301').CdA0 = p.cda; },
    evidence: ['leak-check', 'PT-301', 'PT-201', 'leak-test', 'sound'],
    inspect: { 'leak-test': () => ({ lines: [['SV-301 inlet B-nut', 'steady stream of small bubbles', 'no bubbles'], ['All other fittings', 'no bubbles', 'no bubbles']],
      text: 'The inlet fitting of the fire valve leaks: under-torqued after the valve was last removed (no torque stripe).' }) },
    story: () => ({
      what: 'The fitting at the fire-valve inlet leaked to atmosphere.',
      indicators: 'The leak check: an isolated low-pressure section that should hold decayed at several psi/min. With the regulator shut, nothing replaces the lost gas, so the slope is the leak.',
      misleading: 'During flow nothing looks wrong: the regulator makes up a small leak without a visible sag, and the flowmeter can barely resolve it. Only an isolated hold shows it.',
      notice: 'The leak-check hold and its slope. Accepting a failed leak check to "see if it matters" is how small leaks become test-cell incidents.',
      abort: 'A leak of inert gas at this size is not an immediate hazard, but a leaking pressurised fitting is a NO-GO: it is a fitting under load that is already not doing its job.',
      expert: 'Leak-check at low pressure with people in the cell and snoop liquid in hand; find it, depressurise, re-make and torque-stripe the joint, and repeat the check.',
    }) },

  /* ---- fire valve --------------------------------------------------------- */
  { id: 'sv-slow', component: 'SV-301', mode: 'slow', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ k: 10 + rng.uniform(0, 4) }),
    apply: (S, p) => { S.model.element('SV-301').strokeScale = p.k; },
    evidence: ['SV-301-I', 'PT-401', 'rise-time', 'check-valve'],
    inspect: { 'check-valve': (S, p) => ({ lines: [['Coil resistance', '24.1 Ω', '24 ± 1 Ω'], ['Pull-in current (0 psi)', '0.55 A', '0.55 ± 0.05 A'],
      ['Stroke time', `${(2.2 * p.k).toFixed(1)} ms`, '≈ 2.2 ms'], ['Armature', 'drags; galling on the guide tube', 'free']],
      text: 'The armature drags in its guide. It still opens fully, but slowly.' }) },
    story: p => ({
      what: `SV-301's armature drags: it takes about ${(2.2 * p.k).toFixed(0)} ms to stroke instead of 2.`,
      indicators: 'Chamber-pressure rise time several times the Level-2 value; the dip in the coil current (the armature moving) is long and shallow instead of short and sharp. Steady-state numbers are all normal.',
      misleading: 'Steady chamber pressure, thrust and flow are all nominal — a steady-state test would call this valve healthy.',
      notice: 'Transients. Rise time and the current trace are the valve\'s signature; compare them with a known-good run by overlaying.',
      abort: 'Nothing to abort. In pulse mode this fault would matter a great deal: every impulse bit would be smaller and less repeatable.',
      expert: 'Overlay the start transient on a baseline run and look at the coil current first: the electrical part of the delay (current build-up) is unchanged; the mechanical part (stroke) is not. That separates coil from armature.',
    }) },
  { id: 'sv-partial', component: 'SV-301', mode: 'not-open', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ max: 0.35 + rng.uniform(0, 0.1) }),
    apply: (S, p) => { S.model.element('SV-301').maxOpen = p.max; },
    evidence: ['PT-301', 'PT-401', 'dPv', 'check-valve'],
    inspect: { 'check-valve': (S, p) => ({ lines: [['Coil resistance', '24.0 Ω', '24 ± 1 Ω'], ['Stroke length', `${(0.7 * p.max).toFixed(2)} mm`, '0.70 mm'], ['Armature stop', 'debris wedged under the stop', 'clean']],
      text: 'A particle under the armature stop limits the lift: the valve opens only part way.' }) },
    story: () => ({
      what: 'SV-301 opened only part way — its lift was limited — so it became the main restriction in the line.',
      indicators: 'The pressure drop across the fire valve (PT-301 − PT-401) was many times normal during flow, while PT-201 and PT-301 behaved normally. Chamber pressure, thrust and flow were all low together.',
      misleading: 'The coil current looked perfect: the electrical side was healthy and the armature did move — just not far.',
      notice: 'The valve ΔP in the reduction. Each component has a normal ΔP at design flow; a big one names the component.',
      abort: 'Not hazardous.',
      expert: 'Compare every ΔP in the line with its baseline. The one that changed is the one that is wrong.',
    }) },
  { id: 'sv-stuck', component: 'SV-301', mode: 'fail-closed-mech', category: 'system', hazard: false, onset: 'start',
    params: () => ({}),
    apply: S => { S.model.element('SV-301').failClosed = true; },
    evidence: ['SV-301-I', 'PT-401', 'check-valve', 'continuity'],
    inspect: { 'check-valve': () => ({ lines: [['Coil resistance', '24.0 Ω', '24 ± 1 Ω'], ['Energised at 28 V', 'current normal, NO click', 'audible click'], ['Armature', 'will not move — seat bonded by corrosion product', 'free']],
      text: 'The coil is fine and the magnetic pull is there; the armature is stuck to its seat.' }) },
    story: () => ({
      what: 'SV-301 never opened: its armature was stuck to the seat. The coil was energised normally.',
      indicators: 'The coil current rose to its normal value — but with NO dip. The dip is the armature moving; no dip, no movement. Chamber pressure never left zero.',
      misleading: 'The current trace looks "normal" at a glance (it reaches the usual current). The absence of a feature is the evidence.',
      notice: 'Compare the current trace with one from a good firing. The electrical-vs-mechanical question is answered by that one wiggle.',
      abort: 'The chamber-pressure-low abort was correct and harmless.',
      expert: 'Current present → wiring and coil good. No dip → armature did not move. That points to the valve\'s mechanics before anyone touches the electronics.',
    }) },
  { id: 'sv-coil', component: 'SV-301', mode: 'fail-closed-elec', category: 'system', hazard: false, onset: 'start',
    params: () => ({}),
    apply: S => { S.model.element('SV-301').coilOpen = true; },
    evidence: ['SV-301-I', 'PT-401', 'continuity', 'electrical'],
    inspect: {
      'continuity': () => ({ lines: [['SV-301 coil circuit', 'OPEN (> 20 MΩ)', '24 ± 1 Ω']], text: '' }),
      'electrical': () => ({ lines: [['SV-301 connector', 'pin 2 pushed back out of its contact', 'seated and locked']], text: 'The driver has nothing to drive: the circuit is open at the valve connector.' }) },
    story: () => ({
      what: 'SV-301 never received current: a connector pin at the valve had backed out, opening the coil circuit.',
      indicators: 'SV-301-I stayed at zero while SV-301-CMD went to 1. No current, no magnetic pull, no valve, no chamber pressure.',
      misleading: 'The command channel says the sequencer did its job, and it did.',
      notice: 'The coil current on the plot, right at T-0: flat.',
      abort: 'The low-chamber-pressure abort was correct.',
      expert: 'Command present, current absent → the fault is between the driver and the coil: connector, cable, coil. A continuity check from the rack answers it without opening the cell.',
    }) },
  { id: 'sv-seat-leak', component: 'SV-301', mode: 'int-leak', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ cda: 4e-7 + rng.uniform(0, 2e-7) }),
    apply: (S, p) => { S.model.element('SV-301').leakCdA = p.cda; },
    evidence: ['PT-401', 'FT-201', 'leak-check', 'go-no-go', 'check-valve', 'leak-test'],
    inspect: {
      'check-valve': () => ({ lines: [['Seat leak (bench, 150 psig)', '≈ 400 sccm', '< 1 sccm'], ['Seat', 'nicked, with a particle embedded', 'clean']], text: '' }),
      'leak-test': () => ({ lines: [['All fittings', 'no bubbles', 'no bubbles'], ['Nozzle exit (film over the exit)', 'film bulges — gas through the fire valve', 'no flow']], text: '' }) },
    story: () => ({
      what: 'SV-301 leaked through its seat: with the valve shut, gas trickled into the chamber and out of the nozzle.',
      indicators: 'Chamber pressure above zero behind a closed fire valve, rising as soon as the feed was pressurised. FT-201 showing a small flow with nothing commanded open.',
      misleading: 'It is a few psi — it looks like a zero offset on PT-401. But PT-401 read zero while the system was vented, and only rose when the feed was pressurised: an offset does not depend on the feed pressure.',
      notice: 'The PROP go/no-go item "Chamber PT-401 (fire valve shut)". It exists for exactly this.',
      abort: 'A fire valve that leaks is an uncommanded-thrust hazard, and it will only get worse. NO-GO before firing was the right call.',
      expert: 'Test the hypothesis: vent the feed — if PT-401 follows it down, the valve leaks; if it stays, the transducer is offset.',
    }) },

  /* ---- nozzle -------------------------------------------------------------- */
  { id: 'wrong-nozzle', component: 'CGT-1', mode: 'wrong-part', category: 'system', hazard: false, onset: 'start',
    params: () => ({}),
    apply: S => { const n = S.model.nozzleEl.nozzle; n.configure({ ...n.spec, throatDia: 2.20e-3, exitDia: 3.10e-3, part: 'N-01' }); },
    evidence: ['PT-401', 'FT-201', 'MDOT-C', 'dThroat', 'visual-nozzle', 'measure-throat'],
    story: () => ({
      what: 'Nozzle N-01 (2.20 mm throat) was fitted instead of N-02 (2.50 mm).',
      indicators: 'Chamber pressure HIGH and thrust LOW against the prediction; the measured flow (FT-201) lower than the calculated flow (MDOT-C); the effective throat from FT-201 about 2.2 mm.',
      misleading: 'MDOT-C and the Isp computed from it. MDOT-C uses the drawing\'s throat, so with a high chamber pressure it over-states the flow and the "Isp" comes out low — a wrong number built from a right measurement and a wrong assumption.',
      notice: 'Measured and calculated mass flow disagreeing. Only an assumption can make them differ.',
      abort: 'Not hazardous.',
      expert: 'Check the configuration before the physics: read the part number on the nozzle. Most "anomalies" in a test campaign are configuration errors.',
    }) },
  { id: 'throat-eroded', component: 'CGT-1', mode: 'eroded', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ d: 2.72e-3 + rng.uniform(0, 0.12e-3) }),
    apply: (S, p) => { const n = S.model.nozzleEl.nozzle; n.configure({ ...n.spec, throatDia: p.d, eroded: true }); },
    evidence: ['PT-401', 'FT-201', 'MDOT-C', 'dThroat', 'measure-throat', 'visual-nozzle'],
    story: p => ({
      what: `The throat had worn to about ${(p.d * 1e3).toFixed(2)} mm.`,
      indicators: 'Chamber pressure LOW, flow (FT-201) HIGH, thrust slightly low; the effective throat from measured flow well above 2.50 mm; the pin-gauge measurement confirming it.',
      misleading: 'Low chamber pressure with good feed pressure looks like a restriction or a low-reading PT-401 — until the flowmeter says MORE gas is going through, not less.',
      notice: 'The sign of the flow error. A restriction lowers flow; a bigger hole raises it.',
      abort: 'Not hazardous.',
      expert: 'Use the measured flow and chamber pressure to compute the throat (the campaign view does it for every run) — and trend it across runs. Erosion is a trend.',
    }) },
  { id: 'nozzle-blocked', component: 'CGT-1', mode: 'obstructed', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ b: 0.28 + rng.uniform(0, 0.12) }),
    apply: (S, p) => { S.model.nozzleEl.nozzle.blockage = p.b; },
    evidence: ['PT-401', 'FT-201', 'dThroat', 'visual-nozzle', 'measure-throat'],
    story: () => ({
      what: 'Something was lodged in the throat — a sliver of PTFE tape from the last fitting re-make — obstructing part of it.',
      indicators: 'Chamber pressure HIGH, measured flow LOW, thrust low; effective throat smaller than 2.50 mm.',
      misleading: 'It mimics a smaller nozzle. The part number says N-02, so the wrong-part explanation fails — the pin gauge does not.',
      notice: 'High chamber pressure with low flow: the thruster is passing less gas at more pressure, so its exit is smaller than it should be.',
      abort: 'Not hazardous; an obstruction that clears in mid-burn could make thrust jump, which is a reason to stop and look.',
      expert: 'Look in the nozzle before you measure it. A light and a mirror find tape; a pin gauge finds that something is there.',
    }) },

  /* ---- instruments ---------------------------------------------------------- */
  { id: 'pt301-bias', component: 'PT-301', mode: 'bias', category: 'sensor', hazard: false, onset: 'pressurised',
    params: rng => ({ b: sign(rng) * psi(7 + rng.uniform(0, 5)) }),
    apply: (S, p) => { S.daq.sensor('PT-301').bias = p.b; },
    evidence: ['PT-301', 'PT-201', 'static-agreement', 'reference-gauge', 'DP-F201'],
    story: p => ({
      what: `PT-301's zero shifted by about ${fmtP(Math.abs(p.b))} after it was zeroed (a zero shift from a pressure spike or a connector temperature change).`,
      indicators: 'With no flow, PT-201 and PT-301 are on the same volume and must agree. They differed by a constant several psi. DP-F201 read the difference with no flow at all — impossible for a real pressure drop.',
      misleading: `The reduced "ΔP across the fire valve" and "ΔP filter + line" were both wrong by the same amount in opposite senses. They made a healthy filter or valve look bad (or suspiciously good).`,
      notice: 'Static agreement at lock-up (G3). Two transducers, one volume, one number.',
      abort: 'No hazard, no abort. The right call was NO-GO until the transducer was checked against a reference.',
      expert: 'With a third, independent reading — a calibrated gauge on the same port — you can tell which of two disagreeing transducers is wrong.',
    }) },
  { id: 'pt401-bias', component: 'PT-401', mode: 'bias', category: 'sensor', hazard: false, onset: { fire: 0.0 },
    params: rng => ({ b: -psi(12 + rng.uniform(0, 6)) }),
    apply: (S, p) => { S.daq.sensor('PT-401').bias = p.b; },
    evidence: ['PT-401', 'FT-201', 'LC-501', 'dThroat', 'measure-throat', 'reference-gauge'],
    story: p => ({
      what: `PT-401 read about ${fmtP(Math.abs(p.b))} low. The thruster was healthy.`,
      indicators: 'Thrust and measured flow (FT-201) matched the prediction; only the chamber pressure was low. Thrust and flow are two independent measurements that agree with each other and with the model — the odd one out is the sensor.',
      misleading: 'The effective throat computed from FT-201 and PT-401 came out LARGE — as if the throat had eroded. A sensor fault dressed up as a hardware fault, because the throat calculation uses the wrong chamber pressure.',
      notice: 'Three measurements of one phenomenon: when two agree, suspect the third.',
      abort: 'Nothing to abort.',
      expert: 'Before blaming hardware, check the measurement against physics: F = Cf·Pc·At with the known Cf, and ṁ = Pc·At/c*. If both independent measurements imply a different Pc than PT-401 says, check PT-401. Then measure the throat: 2.50 mm closes it.',
    }) },
  { id: 'pt201-fail', component: 'PT-201', mode: 'failed', category: 'sensor', hazard: false, onset: { fire: 1.2 },
    params: () => ({}),
    apply: S => { S.daq.sensor('PT-201').open = true; },
    evidence: ['PT-201', 'PT-301', 'PT-401', 'continuity', 'electrical'],
    inspect: {
      'continuity': () => ({ lines: [['PT-201 bridge', 'OPEN (signal+)', '350 ± 5 Ω']], text: '' }),
      'electrical': () => ({ lines: [['PT-201 cable', 'conductor broken inside the strain relief', 'intact']], text: 'The cable has been flexed at the strain relief every time the panel door closes.' }) },
    story: () => ({
      what: 'PT-201 failed open-circuit mid-burn and jumped to its amplifier rail. The pressure did not change. The redline read the dead transducer as overpressure and aborted a healthy firing.',
      indicators: 'PT-201 jumped from about 145 to off-scale in a single sample — faster than any volume can fill. PT-301, on the SAME connected volume, stayed at 142. RV-201 did not lift (it would have, well below the reading). Chamber pressure and thrust never changed.',
      misleading: 'A red REDLINE: OVERPRESSURE alarm and an automatic abort — the most urgent thing on the screen was the least true.',
      notice: 'Rate of change and neighbours. Physical pressures move at the speed volumes fill; a step in one sample is electrical. Its neighbour disagreeing confirms it.',
      abort: 'The automatic abort was the system working as designed: it cannot tell a failed transducer from an overpressure. Aborting was correct; retesting without finding out WHY would not have been. This is why critical redlines vote between redundant transducers.',
      expert: 'After a redline abort, first ask "real or instrument?" — compare with the neighbour, look at the rate, look for secondary effects (relief lifting, thrust). Here all three say instrument.',
    }) },
  { id: 'tc301-fail', component: 'TC-301', mode: 'failed', category: 'sensor', hazard: false, onset: 'pressurised',
    params: () => ({}),
    apply: S => { S.daq.sensor('TC-301').open = true; },
    evidence: ['TC-301', 'MDOT-C', 'FT-201', 'continuity'],
    inspect: { 'continuity': () => ({ lines: [['TC-301 loop', 'OPEN', '≈ 12 Ω']], text: 'The thermocouple junction has separated.' }) },
    story: () => ({
      what: 'TC-301 went open-circuit and read off-scale high. The gas was at its usual temperature.',
      indicators: 'An impossible temperature (over 1000 °C in a nitrogen line) that appeared in one step.',
      misleading: 'MDOT-C — the calculated mass flow — uses TC-301. With an absurd temperature it reported a flow a fraction of the real one, and the Isp computed from it was absurdly high. A derived channel inherits every fault of its inputs. FT-201 was right.',
      notice: 'Plausibility. No cold-gas measurement can read 1300 °C.',
      abort: 'Not hazardous, not an abort case. Note it, fire if the test does not need that channel, and fix it afterwards.',
      expert: 'List the derived channels that use a failed sensor and discount them. Then decide whether the test\'s objective can still be met without it.',
    }) },
  { id: 'lc-cal', component: 'LC-501', mode: 'cal', category: 'sensor', hazard: false, onset: 'start',
    params: rng => ({ k: 1.08 + rng.uniform(0, 0.06) }),
    apply: (S, p) => { S.daq.sensor('LC-501').chainGain = p.k; },
    evidence: ['shunt-cal', 'LC-501', 'prediction', 'deadweight-lc'],
    inspect: { 'deadweight-lc': (S, p) => ({ lines: [
      ['Applied 2.000 N', `${(2 * p.k).toFixed(3)} N`, '2.000 N'], ['Applied 5.000 N', `${(5 * p.k).toFixed(3)} N`, '5.000 N'], ['Applied 10.000 N', `${(10 * p.k).toFixed(3)} N`, '10.000 N']],
      text: 'The DAQ\'s scale factor for LC-501 is wrong — the channel was re-configured after an amplifier swap and the old factor typed in.' }) },
    story: p => ({
      what: `LC-501's scaling in the DAQ was ${(100 * (p.k - 1)).toFixed(0)} % high. Every thrust number was high by that ratio.`,
      indicators: `The shunt calibration: it read about ${(25 * p.k).toFixed(2)} N instead of 25.00. The thrust was high against the prediction, and Isp came out above anything nitrogen can deliver from this nozzle.`,
      misleading: 'The thrust traces look perfect — clean, stable, repeatable. Precision is not accuracy.',
      notice: 'The shunt-cal step. It is there precisely to catch a wrong scale factor, and it did.',
      abort: 'No hazard. The right call was to stop at the failed shunt cal.',
      expert: 'An Isp above the theoretical maximum is a measurement error until proven otherwise. Check the chain: shunt cal (electronics), then dead weights (the whole load path).',
    }) },
  { id: 'lc-sens', component: 'LC-501', mode: 'sensitivity', category: 'sensor', hazard: false, onset: 'start',
    params: rng => ({ k: 0.86 + rng.uniform(0, 0.05) }),
    apply: (S, p) => { S.daq.sensor('LC-501').mechGain = p.k; },
    evidence: ['LC-501', 'PT-401', 'FT-201', 'deadweight-lc', 'prediction'],
    inspect: {
      'deadweight-lc': (S, p) => ({ lines: [['Applied 2.000 N', `${(2 * p.k).toFixed(3)} N`, '2.000 N'], ['Applied 5.000 N', `${(5 * p.k).toFixed(3)} N`, '5.000 N'], ['Applied 10.000 N', `${(10 * p.k).toFixed(3)} N`, '10.000 N']],
        text: 'Part of the load bypasses the load cell.' }),
      'inspect-loadcell': () => ({ lines: [['Feed-line loop across the stand', 'clamped to the frame during re-routing — carries thrust load', 'free loop'], ['Flexures', 'undamaged', '']], text: '' }) },
    story: p => ({
      what: `A clamp on the feed-line loop carried part of the thrust around the load cell, so LC-501 saw only about ${(100 * p.k).toFixed(0)} % of it.`,
      indicators: 'Chamber pressure and measured flow both matched the prediction; thrust alone was low. The shunt calibration PASSED — the electronics are fine; it is the mechanics.',
      misleading: 'The passing shunt cal. It checks the load cell\'s electronics and scaling, and says nothing about whether all the force reaches it.',
      notice: 'Two independent measurements (Pc and flow) agreeing and a third (thrust) not. The thrust stand is an instrument too, and it includes everything in the load path.',
      abort: 'Not hazardous.',
      expert: 'Dead-weight or reference-load-cell calibration IN PLACE, with the stand as rigged for the test, is the only check of the whole load path. Do it after any change to the plumbing across the stand.',
    }) },
  { id: 'lc-drift', component: 'LC-501', mode: 'drift', category: 'sensor', hazard: false, onset: { fire: 0.0 },
    params: rng => ({ r: -(0.10 + rng.uniform(0, 0.08)) }),
    apply: (S, p) => { S.daq.sensor('LC-501').drift = p.r; },
    evidence: ['LC-501', 'PT-401', 'inspect-loadcell'],
    inspect: { 'inspect-loadcell': () => ({ lines: [['Load-cell body', 'cold to the touch, frost on the side facing the nozzle', 'ambient'], ['Thermal shield', 'missing — not refitted after the last change', 'fitted']],
      text: 'The cold exhaust and the expanding gas chilled the load cell; its zero drifts with temperature.' }) },
    story: () => ({
      what: 'LC-501\'s zero drifted downward during the burn as the load cell was chilled by the cold thruster body — its thermal shield had been left off.',
      indicators: 'Thrust sagged steadily while chamber pressure stayed flat; after shutdown the thrust channel did not return to its pre-fire zero.',
      misleading: 'A thrust decay during a burn usually means the supply is decaying. Here every pressure was flat — thrust cannot fall while chamber pressure holds.',
      notice: 'The post-fire baseline. A zero that does not come back is a zero that moved.',
      abort: 'Not hazardous.',
      expert: 'Always compare the post-test zero with the pre-test zero. The difference bounds the drift error on the whole run.',
    }) },
  { id: 'pt401-noise', component: 'PT-401', mode: 'noise', category: 'sensor', hazard: false, onset: 'start',
    params: rng => ({ k: 25 + rng.uniform(0, 15) }),
    apply: (S, p) => { const s = S.daq.sensor('PT-401'); s.noiseScale = p.k; s.hum *= p.k * 2; },
    evidence: ['PT-401', 'electrical'],
    inspect: { 'electrical': () => ({ lines: [['PT-401 cable shield', 'drain wire not terminated at the DAQ end', 'terminated'], ['Routing', 'bundled with the SV-301 driver cable', 'separated']], text: '' }) },
    story: () => ({
      what: 'PT-401 picked up electrical noise: its cable shield was not terminated and it was run alongside the fire-valve driver cable.',
      indicators: 'A noise band on PT-401 many times wider than on the other 500 psi transducers, with 60 Hz visible in it, present even with the system vented.',
      misleading: 'A noisy chamber pressure during a burn can look like combustion instability — but this is cold gas, and the noise is there with no flow at all.',
      notice: 'Noise present when nothing is happening is electrical. Compare with its neighbours.',
      abort: 'Not hazardous, but it can trip a redline on a spike: fix it before firing.',
      expert: 'Look at the channel vented and at rest. Then check shields and routing before suspecting the transducer.',
    }) },
  { id: 'lc-intermittent', component: 'LC-501', mode: 'disconnected', category: 'sensor', hazard: false, onset: 'pressurised',
    params: rng => ({ p: 0.002 + rng.uniform(0, 0.004) }),
    apply: (S, p) => { S.daq.sensor('LC-501').intermittent = p.p; },
    evidence: ['LC-501', 'electrical'],
    inspect: { 'electrical': () => ({ lines: [['LC-501 connector', 'not locked — coupling ring loose, contacts intermittent', 'locked']], text: '' }) },
    story: () => ({
      what: 'LC-501\'s connector was not locked; the contacts made and broke intermittently.',
      indicators: 'Dropouts (no data) on LC-501 only, appearing when the stand was disturbed; the dropout alarm.',
      misleading: 'The reduced thrust average can still look fine — the reduction skips missing samples — while total impulse is wrong wherever the gaps fall in a transient.',
      notice: 'Dropouts are never "just the DAQ". Something is loose.',
      abort: 'Not hazardous; thrust data with gaps may not meet the test objective.',
      expert: 'Wiggle test with the channel on screen: the fault shows up the moment the loose connector is touched.',
    }) },
];

/* The failure-mode vocabulary offered in the diagnosis form. Categories give
   partial credit for "right kind of problem". */
export const FAILURE_MODES = [
  ['none', 'No fault — hardware and instruments nominal', 'none'],
  ['set-wrong', 'Set incorrectly / wrong setting', 'control'],
  ['droop', 'Excessive droop / cannot hold outlet under flow', 'control'],
  ['creep', 'Seat leak — will not lock up (creep)', 'control'],
  ['stuck', 'Stuck / jammed', 'control'],
  ['supply-low', 'Supply pressure too low', 'control'],
  ['not-open', 'Not fully open', 'flow'],
  ['restricted', 'Blocked / restricted', 'flow'],
  ['obstructed', 'Obstructed (foreign object)', 'flow'],
  ['eroded', 'Eroded / oversized', 'flow'],
  ['wrong-part', 'Wrong part installed', 'flow'],
  ['ext-leak', 'External leak', 'flow'],
  ['int-leak', 'Internal leak (through the seat)', 'flow'],
  ['slow', 'Slow to open', 'actuation'],
  ['fail-closed-mech', 'Fails to open — mechanical', 'actuation'],
  ['fail-closed-elec', 'Fails to open — electrical', 'actuation'],
  ['bias', 'Sensor bias / zero offset', 'sensor'],
  ['cal', 'Sensor calibration / scaling error', 'sensor'],
  ['sensitivity', 'Load path / sensitivity error', 'sensor'],
  ['drift', 'Sensor drift', 'sensor'],
  ['failed', 'Sensor failed (open circuit / off-scale)', 'sensor'],
  ['noise', 'Electrical noise / grounding', 'sensor'],
  ['disconnected', 'Disconnected / intermittent', 'sensor'],
];

export const ACTIONS = [
  ['repair', 'Repair or replace the component, then retest'],
  ['recal', 'Recalibrate / re-zero the instrument and re-reduce the data'],
  ['wiring', 'Repair wiring, connector or shielding'],
  ['config', 'Correct the configuration or setting, then retest'],
  ['supply', 'Replace the supply bottle'],
  ['continue', 'No action — hardware nominal; continue testing'],
  ['retest', 'Repeat the test to confirm before acting'],
];

/* Which action fits which fault mode. */
export const RIGHT_ACTION = {
  none: ['continue'], 'set-wrong': ['config', 'repair'], droop: ['repair'], creep: ['repair'], stuck: ['repair'], 'supply-low': ['supply'],
  'not-open': ['repair'], restricted: ['repair'], obstructed: ['repair'], eroded: ['repair'], 'wrong-part': ['config'], 'ext-leak': ['repair'],
  'int-leak': ['repair'], slow: ['repair'], 'fail-closed-mech': ['repair'], 'fail-closed-elec': ['wiring', 'repair'],
  bias: ['recal'], cal: ['recal'], sensitivity: ['config', 'recal', 'repair'], drift: ['repair', 'recal'], failed: ['wiring', 'repair'], noise: ['wiring'], disconnected: ['wiring'],
};

/* Comparisons and checks an operator can cite, beyond channels and
   inspections. Ids match the fault answer keys. */
export const CHECKS = [
  ['go-no-go', 'Go/no-go poll data'],
  ['prediction', 'Comparison with the pre-test prediction'],
  ['static-agreement', 'Static agreement between transducers'],
  ['leak-check', 'Pressure-decay leak check'],
  ['shunt-cal', 'Shunt calibration of LC-501'],
  ['droop', 'Regulator droop (lock-up vs flowing)'],
  ['rise-time', 'Chamber-pressure rise / decay time'],
  ['dPv', 'Pressure drop across the fire valve'],
  ['dThroat', 'Effective throat from the reduction'],
  ['sound', 'What the cell sounded like'],
  ['cctv', 'Cell camera'],
];
export const CATEGORIES = { none: 'No fault', control: 'Pressure control and supply', flow: 'Flow path', actuation: 'Actuation', sensor: 'Instrument' };
export const DIAGNOSIS = { modes: FAILURE_MODES, actions: ACTIONS, rightAction: RIGHT_ACTION, checks: CHECKS, categories: CATEGORIES };
