// What to record and why — the lab notebook as the record of every input of
// the measurement model: raw readings as displayed, instrument settings,
// zeros and calibrations, conditions, times, and what went wrong. Worked
// through a Hall-probe zero that drifts during a session, an oscilloscope
// probe setting, a room temperature that explains two "inconsistent" days,
// and a rocket test stand's pressure transducer.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { sf, runChart, SRC } from './_unc.js';

const t = String.raw;

// the worked example: a Hall probe's zero, logged before and after a reading
const EX = { t0: 0, z0: 0.012, t1: 20, z1: 0.020, tr: 8, R: 1.215 };
EX.zr = EX.z0 + ((EX.z1 - EX.z0) * (EX.tr - EX.t0)) / (EX.t1 - EX.t0);
EX.B = EX.R - EX.zr;

const zeroPic = (z0, z1, tr, R, t1, caption) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [-2, t1 + 2], y: [0, +(Math.max(z1, z0) * 1.6).toFixed(4)], xlabel: 'minutes into the session', ylabel: 'probe zero (mT)', xticks: 6, yticks: 4, axesAt: 'edge',
    curves: [{ fn: `${z0} + (${z1} - ${z0})*x/${t1}`, domain: [0, t1], color: 'accent', dash: [6, 4] }],
    points: [{ x: 0, y: z0, color: 'accent', label: 'zero logged', labelDx: 6, labelDy: 14 }, { x: t1, y: z1, color: 'accent', label: 'zero logged', labelDx: -78, labelDy: -12 }],
    vlines: [{ x: tr, label: `reading ${R} mT`, color: 'gold' }],
  },
  caption,
});

const scope = (div, vdiv, probe) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [-5, 5], y: [-4, 4], xlabel: 'time (divisions)', ylabel: 'divisions', xticks: 10, yticks: 8,
    curves: [{ fn: `${div}*sin(1.3x)`, color: 'gold', width: 2.4 }],
    hlines: [{ y: div, color: 'ink3' }],
    points: [{ x: -4.9, y: -3.6, r: 0, label: `${vdiv} mV/div · probe switch at ${probe}×`, labelDx: 2, color: 'ink2' }],
  },
  caption: 'The oscilloscope screen: a grid of divisions. The volts per division is a setting, and so is the probe’s attenuation — neither shows on the trace itself.',
});

export default lesson({
  id: 'lab.A0.1',
  title: 'What to record and why',
  minutes: 12, difficulty: 1,
  lab: true,
  intro: t`A result in physics is never measured directly. It is computed from readings, settings, corrections and constants through a **measurement model**:

$$y = f(x_1, x_2, \ldots, x_N)$$

The lab notebook exists so that every input $x_i$ — and where it came from — survives the day. Record **raw readings exactly as the instrument showed them**, with units; the instrument, its serial number, range and settings; zeros and calibrations; the time and the conditions; and anything odd, as it happens. Then a mistake in the analysis, or a systematic error found next month, can be fixed by recomputing — instead of by repeating the experiment.`,
  symbols: [
    { tex: 'y', text: 'the **measurand**: the quantity you report, such as a resistance or a field strength' },
    { tex: 'f', text: 'the measurement model: the formula, corrections included, that turns what you recorded into $y$' },
    { tex: 'x_i', text: 'its inputs: raw readings, instrument settings (range, gain, probe factor), zero and calibration values, conditions such as temperature, and constants — $i$ counts them from 1 to $N$' },
  ],
  why: 'Every later lesson — uncertainty budgets, propagation, fits, comparisons — needs inputs you can only have if you wrote them down at the time.',
  visual: {
    type: 'lab-bench',
    title: 'Keep the notebook while you measure',
    lead: t`A copper wire’s voltage against current. Read the table as a notebook page: the **supply setting** and the **ammeter reading** are different numbers, and only one of them belongs in the analysis. The switch below is a habit you might not have noted at the time.`,
    tasks: [
      'Take a few measurements and compare the supply setting with the current the ammeter actually read.',
      'Switch on “current left on”: the high-current points creep up as the wire warms. Only a note of how long the current stayed on would explain the curve later.',
      'Look at the apparatus: which connections would you sketch, so that someone else could rebuild it?',
    ],
    params: { exp: 'ohm', sysKind: 'heating', prefill: 4, seed: 12 },
    caption: 'A simulated bench, not a measurement: readings are computed with realistic noise. The heating switch warms the wire as the current flows — a real effect for a thin wire, here made deliberate.',
  },
  example: {
    prompt: t`A Hall probe’s zero (its reading in zero field) is logged as ${EX.z0.toFixed(3)} mT at the start of a session and ${EX.z1.toFixed(3)} mT ${EX.t1} minutes later. At minute ${EX.tr} the probe read ${EX.R.toFixed(3)} mT near a small magnet. What is the field?`,
    visual: zeroPic(EX.z0, EX.z1, EX.tr, EX.R, EX.t1, 'The two logged zeros, joined by a straight line: the simplest model of a slow drift. Between them the zero is interpolated; outside them it is a guess.'),
    steps: [
      { label: 'The measurement model', text: t`The probe adds its zero to every reading, so $B = R - z(t)$: the field is the reading $R$ minus the zero $z$ at the moment of the reading. Without a logged zero, this correction cannot be made at all.` },
      { label: 'Why two zeros', text: t`The zero drifted by $${(EX.z1 - EX.z0).toFixed(3)}$ mT during the session (the probe warms up). One zero shows an offset; two, at known times, show the drift too.` },
      { label: 'Interpolate', text: t`At minute ${EX.tr}: $z = ${EX.z0.toFixed(3)} + (${EX.z1.toFixed(3)} - ${EX.z0.toFixed(3)}) \times \tfrac{${EX.tr}}{${EX.t1}} = ${EX.zr.toFixed(4)}$ mT.` },
      { label: 'Correct', text: t`$B = ${EX.R.toFixed(3)} - ${EX.zr.toFixed(4)} = ${EX.B.toFixed(4)}$ mT, so $B \approx ${EX.B.toFixed(3)}$ mT.` },
      { label: 'Sense check', text: t`The correction is $${(100 * EX.zr / EX.R).toFixed(1)}\%$ of the reading — larger than the display’s resolution, so it matters. Because the raw ${EX.R.toFixed(3)} mT and both zeros are on the page, anyone can redo this with a better drift model later.` },
    ],
    answer: t`$B \approx ${EX.B.toFixed(3)}$ mT, recoverable only because the raw reading, both zeros and their times were recorded.`,
  },
  practice: [
    multi({
      id: 'what-belongs', difficulty: 1,
      prompt: t`You measure a wire’s resistance with a digital multimeter. Which of these belong in the notebook entry? Choose all that apply.`,
      visual: { type: 'lab-bench', params: { exp: 'ohm', view: 'apparatus', at: 0.55 }, caption: 'The circuit: a supply, an ammeter, a voltmeter across the wire. Not to scale.' },
      choices: [
        'The meter’s model, serial number and the range it was on',
        'Each reading exactly as displayed, with its unit',
        'The time and the room temperature',
        'Only the average, rounded so the table looks tidy',
        'Readings you think are wrong, kept and annotated',
        'Nothing until the analysis shows the data are good',
      ],
      answer: [0, 1, 2, 4],
      why: {
        3: 'An average cannot be un-averaged: the scatter, any trend and any bad reading are gone, and so is the Type A uncertainty you would compute from them.',
        5: 'A record written afterwards is a reconstruction, not a record. Write as you go — the analysis needs the notebook, not the other way round.',
      },
      hints: ['Ask of each item: could I recompute or check the result later without it?', 'Range, serial number and temperature are inputs to the measurement model (accuracy specification, calibration, temperature coefficient).'],
      teach: 'Record everything the measurement model needs, at the time, as it was — including what looks wrong.',
      explain: 'The range sets the meter’s resolution and accuracy specification; the serial number ties the reading to a calibration certificate; copper’s resistance changes by 0.39% per kelvin, so the temperature is an input. Raw readings and odd readings keep the evidence you will need for the uncertainty and for any later correction.',
    }),
    num({
      id: 'probe-factor', difficulty: 2,
      gen(r) {
        const div = r.pick([2.4, 2.6, 2.8, 3.2, 3.4, 3.6]), vdiv = r.pick([20, 50, 100, 200]), probe = r.pick([1, 10]);
        const amp = (div * vdiv * probe) / 1000;
        const errs = [{ value: (div * vdiv) / 1000, feedback: 'You left out the probe’s attenuation: with the probe switched to 10×, the signal at the tip is ten times what the screen shows.' }, { value: (div * vdiv * 10) / 1000, feedback: 'The probe is set to 1× here: the screen shows the tip voltage directly.' }]
          .filter((e) => Math.abs(e.value - amp) > 0.02 * amp);
        return {
          prompt: t`A notebook records an oscilloscope trace: peak height ${div} divisions, vertical scale ${vdiv} mV/div, probe switch at ${probe}×. What was the peak voltage at the probe tip, in volts?`,
          visual: scope(div, vdiv, probe),
          answer: amp, units: 'V', tol: { rel: 0.005 },
          errors: errs,
          hints: ['The screen shows divisions; the notebook’s settings turn divisions into volts.', t`Peak $=$ divisions $\times$ volts per division $\times$ probe factor.`],
          teach: 'A reading means nothing without the settings that convert it to a physical quantity, so the settings go in the notebook with it.',
          explain: t`$${div} \times ${vdiv}\ \text{mV} \times ${probe} = ${(amp * 1000).toFixed(0)}\ \text{mV} = ${sf(amp, 3)}$ V. A probe switch at 10× that nobody wrote down makes every voltage in the notebook ten times too small.`,
        };
      },
    }),
    order({
      id: 'entry-order', difficulty: 2,
      prompt: 'Put a day’s notebook entry in the order you write it.',
      visual: { type: 'lab-bench', params: { exp: 'rc', view: 'apparatus', at: 8 }, caption: 'Today’s apparatus: a capacitor discharging through a resistor, read by a data logger. Not to scale.' },
      items: [
        'Date, your name and the aim of the session',
        'A sketch of the set-up, with every instrument’s model, serial number and settings',
        'Zero and calibration checks, with their times',
        'Raw readings in a table, with units, as they are taken',
        'Anything unexpected, noted with the time it happened',
        'Analysis that starts from the raw table, then conclusions and next steps',
      ],
      hints: ['What must exist before the first reading can be interpreted?', 'Analysis comes last and points back to the raw table; surprises are logged while the readings are being taken.'],
      teach: 'An entry runs in the order of the work: aim and set-up, checks, raw data with notes, then analysis traceable to the raw data.',
      explain: 'The set-up and zero checks come first because every later reading depends on them; readings and surprises are recorded as they happen; analysis is last and always recomputable from the raw table above it.',
    }),
    mcq({
      id: 'drift-diagnose', difficulty: 2,
      prompt: t`Twelve readings of a reference voltage taken over an afternoon drift steadily upward (blue). Which record would let you find the cause?`,
      visual: runChart([1.00012, 1.00015, 1.00016, 1.00019, 1.00021, 1.00022, 1.00026, 1.00027, 1.0003, 1.00031, 1.00034, 1.00035], { ylabel: 'reading (V)', xlabel: 'reading number (every 20 min)', caption: 'Twelve readings of the same reference, one every 20 minutes. The trend is far larger than the reading-to-reading scatter.' }),
      choices: [
        'The time of each reading and the room temperature beside it',
        'More significant figures on each reading',
        'The average of the twelve readings',
        'The name of the person who took each reading',
      ],
      answer: 0,
      why: {
        1: 'More digits show the drift in more detail; they cannot say what causes it.',
        2: 'Averaging a trend hides it: the mean would describe no moment of the afternoon.',
        3: 'Useful for questions later, but drift that grows smoothly with time points to something that changes smoothly — temperature, warm-up — not to a person.',
      },
      hints: ['A smooth trend in time suggests a cause that also changes smoothly in time.', 'Electronics drift with temperature; a log of temperature against time can be compared with the readings.'],
      teach: 'Recording when each reading was taken, and the conditions then, turns an unexplained trend into a correlation you can test.',
      explain: 'Voltage references and amplifiers drift with temperature (a few parts per million per kelvin is typical). With times and temperatures on the page, you can plot one against the other and model the drift; without them, it is a mystery and the scatter of the mean is meaningless.',
    }),
    mcq({
      id: 'cross-out', difficulty: 1, kind: 'error',
      prompt: t`A student copies a reading wrongly, then rubs it out and writes the corrected value in its place. Another reading looks far off the rest (the red point), so they leave it out of the table. What should they have done?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 9], y: [9.6, 10.6], xlabel: 'reading number', ylabel: 'period (s)', xticks: 8, yticks: 5, axesAt: 'edge', points: [[1, 10.02], [2, 9.98], [3, 10.05], [4, 10.01], [5, 10.47], [6, 9.97], [7, 10.03], [8, 10.0]].map(([x, y]) => ({ x, y, r: 4, color: x === 5 ? 'bad' : 'accent' })) }, caption: 'Eight timings of ten swings; reading 5 sits far above the rest.' },
      choices: [
        'Strike each through with one line so it stays legible, write the reason and the correction beside it, and keep the odd reading with a note',
        'Rub out both: a clean notebook is a reliable notebook',
        'Keep the copying error but delete the odd reading, which is obviously a mistake',
        'Recopy the whole page neatly at the end of the day',
      ],
      answer: 0,
      why: {
        1: 'An erased entry can never be checked. The record is meant to show what happened, not to look tidy.',
        2: 'Deciding a reading is “obviously” wrong and removing it without a reason is how results get biased toward what you expected. Keep it, note why it looks wrong, and decide in the analysis — openly.',
        3: 'A fair copy is not the original record: copying introduces new errors and loses the evidence of when things were written.',
      },
      hints: ['What would someone checking your work later need to see?'],
      teach: 'Never erase: strike through once, give the reason, and keep suspicious readings with a note so the decision about them stays visible.',
      explain: 'A single strike-through keeps the original readable and the note says why it changed. Reading 5 might be a disturbance, a slip of the stopwatch, or real: only a note made at the time can tell, and any decision to leave it out belongs in the analysis, stated openly.',
    }),
    num({
      id: 'zero-drift', difficulty: 2,
      gen(r) {
        const t1 = r.pick([20, 30, 40]), tr = r.int(4, t1 - 4), z0 = r.pick([0.008, 0.010, 0.012, 0.015]), dz = r.pick([0.006, 0.008, 0.010, 0.012]), z1 = +(z0 + dz).toFixed(3);
        const R = +(r.int(800, 2400) / 1000).toFixed(3);
        const zr = z0 + ((z1 - z0) * tr) / t1, B = R - zr;
        return {
          prompt: t`A Hall probe’s zero is logged as ${z0.toFixed(3)} mT at minute 0 and ${z1.toFixed(3)} mT at minute ${t1}. At minute ${tr} it reads ${R.toFixed(3)} mT. Assuming the zero drifts linearly, what is the field, in mT, to four significant figures?`,
          visual: zeroPic(z0, z1, tr, R, t1, 'The logged zeros and the moment of the reading.'),
          answer: B, units: 'mT', tol: { rel: 0, abs: 0.0006 },
          errors: [
            { value: R - z0, feedback: 'You subtracted the starting zero; by the time of the reading it had drifted. Interpolate to the reading’s time.' },
            { value: R - z1, feedback: 'You subtracted the final zero; interpolate to the time of the reading instead.' },
            { value: R - (z0 + z1) / 2, feedback: t`The average zero is right only for a reading at minute ${t1 / 2}. Interpolate to minute ${tr}.` },
          ].filter((e) => Math.abs(e.value - B) > 0.0007),
          hints: [t`$z(t) = z_0 + (z_1 - z_0)\,t/${t1}$.`, t`Then $B = R - z(${tr})$.`],
          teach: 'A zero logged at the start and end of a session lets you correct each reading for drift by interpolating to its time.',
          explain: t`$z(${tr}) = ${z0.toFixed(3)} + ${(z1 - z0).toFixed(3)} \times ${tr}/${t1} = ${zr.toFixed(4)}$ mT, so $B = ${R.toFixed(3)} - ${zr.toFixed(4)} = ${B.toFixed(4)}$ mT.`,
        };
      },
    }),
    mcq({
      id: 'why-raw', difficulty: 2,
      prompt: t`A month after a run of capacitor discharges, you learn the data logger’s zero was off by +0.050 V all along. Your notebook holds the raw voltages; your partner’s holds only the time constant τ they fitted. What can each of you do?`,
      visual: { type: 'lab-bench', params: { exp: 'rc', view: 'plot', sys: true, sysKind: 'offset', axes: 'log', fit: true, seed: 3 }, caption: 'ln V against t with the logger’s zero 0.050 V high: the late, small voltages bend away from the line.' },
      choices: [
        'You can subtract 0.050 V from every raw reading and refit; your partner cannot correct τ without repeating the run',
        'Both of you can correct τ by the same small percentage',
        'Neither can: a systematic error found afterwards always means repeating the experiment',
        'Your partner can, by subtracting 0.050 V from τ',
      ],
      answer: 0,
      why: {
        1: 'The offset does not change τ by a fixed percentage: it matters little at 10 V and a lot near 0.1 V, so its effect depends on which readings were fitted and how they were weighted.',
        2: 'Only if the raw readings were lost. With them, the correction is a subtraction and a refit.',
        3: 'τ is a time and the offset is a voltage: they cannot be subtracted, and the offset’s effect on τ depends on every reading.',
      },
      hints: ['Which record still contains the information the correction needs?', 'The offset changes each reading by the same 0.050 V, but changes ln V most where V is smallest.'],
      teach: 'Raw readings let you apply a correction discovered later; a processed number has already thrown away what the correction needs.',
      explain: 'Subtracting 0.050 V from each recorded voltage removes the offset exactly, and the refit gives the corrected τ. A fitted τ carries the offset in a way that depends on all the readings, so it cannot be undone without them.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-transducer', difficulty: 2, transfer: true,
      gen(r) {
        const v = +(r.int(1800, 4300) / 1000).toFixed(3), S = 4.0, off = 0.5;
        const p = (v - off) / (S / 1000);
        return {
          prompt: t`A rocket engine’s chamber-pressure transducer has a calibration certificate (logged in the test record by its ID) giving output $V = 0.500\ \text{V} + (4.000\ \text{mV/psi})\,p$. During the static fire the data system logs ${v.toFixed(3)} V. What was the chamber pressure, in psi?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1100], y: [0, 5], xlabel: 'pressure p (psi)', ylabel: 'transducer output (V)', xticks: 6, yticks: 5, axesAt: 'edge', curves: [{ fn: '0.5 + 0.004x', domain: [0, 1000], color: 'accent', label: 'calibration line', labelAt: 650, labelDy: 20 }], hlines: [{ y: v, label: `logged ${v.toFixed(3)} V`, color: 'gold' }] }, caption: 'The certificate’s calibration line. A transducer’s raw output is a voltage; only the calibration in the record turns it into a pressure.' },
          answer: p, units: 'psi', tol: { rel: 0.003 },
          errors: [{ value: v / (S / 1000), feedback: 'You forgot the 0.500 V offset: at zero pressure the transducer already outputs 0.5 V.' }],
          hints: [t`Solve the calibration for $p$: $p = (V - 0.500\ \text{V})/(4.000\ \text{mV/psi})$.`],
          teach: 'A raw voltage becomes a physical quantity only through a calibration, so the calibration (and which certificate it came from) belongs in the record.',
          explain: t`$p = (${v.toFixed(3)} - 0.500)\ \text{V} / 0.004000\ \text{V/psi} = ${p.toFixed(0)}$ psi. If the transducer is recalibrated next month, the logged voltages can be reprocessed with the new certificate.`,
        };
      },
    }),
    num({
      id: 'cp-temperature', difficulty: 3,
      gen(r) {
        const T1 = r.int(17, 21), T2 = T1 + r.int(5, 9), R1 = +(r.int(1150, 1450) / 1000).toFixed(3), alpha = 0.0039;
        const pct = 100 * alpha * (T2 - T1);
        return {
          prompt: t`The same copper coil gives $R = ${R1.toFixed(3)}\ \Omega$ on Monday and a value about ${pct.toFixed(0)}% higher on Thursday — far outside the readings’ scatter. The notebooks record the room at ${T1} °C and ${T2} °C. Copper’s resistance rises by 0.39% per kelvin. By what percentage does the temperature alone raise $R$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [14, 30], y: [+(R1 * 0.97).toFixed(3), +(R1 * 1.06).toFixed(3)], xlabel: 'room temperature (°C)', ylabel: 'R (Ω)', xticks: 8, yticks: 5, axesAt: 'edge', curves: [{ fn: `${R1}*(1 + ${alpha}*(x - ${T1}))`, color: 'ink3', dash: [5, 4] }], points: [{ x: T1, y: R1, color: 'accent', label: 'Monday' }, { x: T2, y: +(R1 * (1 + alpha * (T2 - T1))).toFixed(4), color: 'warn', label: 'Thursday' }] }, caption: 'The two days’ results placed at their logged temperatures, with copper’s temperature coefficient as the dashed line.' },
          answer: pct, units: '%', tol: { rel: 0.02 },
          errors: [{ value: 0.39, feedback: t`That is the change per kelvin; the rooms differed by ${T2 - T1} K.` }],
          hints: [t`$\Delta R/R = \alpha\,\Delta T$ with $\alpha = 0.0039$ per kelvin.`, t`$\Delta T = ${T2} - ${T1} = ${T2 - T1}$ K.`],
          teach: 'Logged conditions turn an apparent inconsistency into a known correction.',
          explain: t`$\alpha\,\Delta T = 0.0039 \times ${T2 - T1} = ${(pct / 100).toFixed(4)}$, a ${pct.toFixed(1)}% rise. The two days agree once each is corrected to a common temperature — which is only possible because the temperatures were written down.`,
        };
      },
    }),
    mcq({
      id: 'cp-electronic', difficulty: 2,
      prompt: 'Your group keeps an electronic notebook. Which practice keeps it a trustworthy record?',
      visual: runChart([2.31, 2.29, 2.33, 2.3, 2.32], { ylabel: 'reading (V)', caption: 'A day’s readings as they would sit in the electronic log, each with its timestamp.' }),
      choices: [
        'Every entry is timestamped and versioned, edits add a new version instead of overwriting, and raw data files are stored unaltered beside the analysis',
        'Readings are typed in at the end of the week from scraps of paper',
        'The spreadsheet that holds the data also overwrites them with the corrected values',
        'Only the final plots are kept, to save space',
      ],
      answer: 0,
      why: {
        1: 'Transcribing from scraps adds copying errors and loses the timing; the scraps were the real record.',
        2: 'Overwriting raw data with processed values is the electronic version of erasing: the original is gone.',
        3: 'A plot is an analysis product. Without the numbers behind it nothing can be recomputed.',
      },
      hints: ['The same rules apply as on paper: written at the time, never erased, raw data kept.'],
      teach: 'An electronic notebook is trustworthy when it is timestamped, append-only (versioned) and keeps raw data unaltered.',
      explain: 'Version history is the electronic strike-through: the original stays visible beside the change. Raw data files kept unaltered let anyone rerun the analysis — the reproducibility module of this course builds on exactly that.',
    }),
  ],
  sources: [SRC.gum, SRC.aapt, SRC.taylor('ch. 1–2')],
});
