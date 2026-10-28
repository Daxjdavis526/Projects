// Mixing, cooling and RC circuits as one equation: a quantity relaxing
// towards a target with a time constant. Step, ramp and sinusoidal targets;
// a tank whose volume changes; cryogenic hardware warming up; an igniter
// capacitor bleeding down.
import { lesson, mcq, num, expr, match } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';

const t = String.raw;

// the Explore graph: input (dashed) and response (solid) for a step, a ramp and a sine
const STEP = 'step(0.5 - u)', RAMP = 'step(u - 0.5)*step(1.5 - u)', SINE = 'step(u - 1.5)';

export default lesson({
  id: 'math2280.DE-2.6',
  title: 'Mixing, cooling and RC circuits',
  minutes: 12, difficulty: 2,
  intro: t`A tank of brine, a cooling body and a charging capacitor look different but obey one equation. In each, the quantity $y$ changes at a rate set by “in minus out”, and the “out” is proportional to $y$ itself, so $y$ **relaxes** towards a target with a single time constant:

$$\frac{dy}{dt} = \frac{y_\infty(t) - y}{\tau}$$

A constant target gives the familiar exponential approach; a target that rises steadily is followed at a lag of exactly $\tau$; a target that oscillates is followed by a smaller, delayed oscillation. When the time constant itself changes — a tank filling while it drains — the equation is still linear, and the integrating factor still solves it.`,
  symbols: [
    { tex: t`y(t)`, text: 'the amount that relaxes: salt in a tank (g), a temperature (K), a capacitor’s voltage (V)' },
    { tex: t`y_\infty(t)`, text: 'the target it chases: the amount a tank full of inflow would hold, the surroundings’ temperature, the source voltage' },
    { tex: t`\tau`, text: t`the time constant, in s: volume over flow rate $V/r$ for a tank, $mc/(hA)$ for a cooling body, $RC$ for a circuit` },
  ],
  why: t`Every first-order instrument, filter and thermal model in engineering is this equation, so its three responses — exponential approach, steady lag, filtered oscillation — tell you how any of them will behave.`,
  visual: {
    type: 'graph',
    title: 'One equation, three kinds of input',
    lead: t`The dashed curve is the target $y_\infty(t)$; the solid curve is the response of $y' = (y_\infty - y)/\tau$, starting from $y = 0$. Choose the kind of input and change the time constant $\tau$.`,
    tasks: [
      'Step: the response covers 63% of the gap after one τ and 95% after three.',
      'Ramp: once the transient fades, the response runs parallel to the input, exactly τ behind it — the lag of a slow sensor.',
      'Sine: raise ω or τ: the response shrinks to 1/√(1 + (ωτ)²) of the input and falls behind — a low-pass filter.',
    ],
    params: {
      x: [0, 10], y: [-1.3, 2.2], xlabel: 't (s)', ylabel: 'y',
      choices: [{ key: 'u', label: 'Input', options: [[0, 'Step'], [1, 'Ramp'], [2, 'Sine']], value: 0 }],
      sliders: [
        { key: 'tau', label: 'Time constant $\\tau$', min: 0.2, max: 3, step: 0.1, value: 1, unit: t`\text{s}`, explain: 'How sluggish the system is: V/r, mc/(hA) or RC.' },
        { key: 'w', label: 'Angular frequency $\\omega$ (sine)', min: 0.5, max: 6, step: 0.1, value: 2, unit: t`\text{rad/s}`, explain: 'How fast the sinusoidal target oscillates.' },
      ],
      curves: [
        { fn: '1', color: 'ink3', dash: true, width: 1.6, when: STEP },
        { fn: '1 - exp(-x/tau)', color: 'accent', when: STEP, label: 'response', labelAt: 6, labelDy: 14 },
        { fn: '0.2x', color: 'ink3', dash: true, width: 1.6, when: RAMP, label: 'input', labelAt: 8.6, labelDx: -40, labelDy: -10 },
        { fn: '0.2*(x - tau*(1 - exp(-x/tau)))', color: 'accent', when: RAMP, label: 'response', labelAt: 7, labelDy: 14 },
        { fn: 'sin(w*x)', color: 'ink3', dash: true, width: 1.6, when: SINE },
        { fn: '(sin(w*x) - w*tau*cos(w*x) + w*tau*exp(-x/tau))/(1 + (w*tau)^2)', color: 'accent', when: SINE },
      ],
      vlines: [{ x: 'tau', label: 't = τ', color: 'gold', when: STEP }],
      readouts: [
        { label: 'time constant $\\tau$', expr: 'tau', unit: t`\text{s}`, digits: 3 },
        { label: 'sine: amplitude ratio $1/\\sqrt{1 + (\\omega\\tau)^2}$', expr: '1/sqrt(1 + (w*tau)^2)', digits: 3 },
        { label: 'sine: lag $\\arctan(\\omega\\tau)/\\omega$', expr: 'atan(w*tau)/w', unit: t`\text{s}`, digits: 3 },
      ],
    },
    caption: t`One linear first-order system with a constant time constant, starting from rest. Real tanks are never perfectly mixed, real bodies are not one uniform temperature, and real capacitors leak; this is the ideal each is designed to approach.`,
  },
  example: {
    prompt: t`A 200 L tank holds 100 L of pure water. Brine with 2 g of salt per litre flows in at 3 L/min, and the well-mixed solution drains at 2 L/min, so the volume grows. How much salt does the tank hold when it is full?`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 105], y: [0, 420], xlabel: 't (min)', ylabel: 'salt S (g)',
        curves: [{ fn: '2*(100 + x) - 2000000/(100 + x)^2', domain: [0, 100], color: 'accent', label: 'S(t)', labelAt: 60, labelDy: 14 }, { fn: '2*(100 + x)', domain: [0, 100], color: 'ink3', dash: true, width: 1.6, label: 'full-strength brine, 2 g/L × V', labelAt: 30, labelDx: -10, labelDy: -14 }],
        points: [{ x: 100, y: 350, color: 'gold', label: 'full: 350 g', labelDx: -86, labelDy: 14 }],
      },
      caption: t`The salt in the tank (blue) and the salt it would hold if it were full-strength brine (dashed). The tank is assumed perfectly mixed at every instant.`,
    },
    steps: [
      { label: 'Volume', text: t`It gains $3 - 2 = 1$ L/min, so $V(t) = 100 + t$ litres, and it is full at $t = 100$ min.` },
      { label: 'In minus out', text: t`Salt arrives at $3 \times 2 = 6$ g/min and leaves at (outflow) × (concentration) $= 2 \times \dfrac{S}{100 + t}$ g/min: $\;S' + \dfrac{2}{100 + t}\,S = 6$.` },
      { label: 'Integrating factor', text: t`$\mu = e^{\int 2/(100 + t)\,dt} = (100 + t)^2$, so $\left[(100 + t)^2 S\right]' = 6(100 + t)^2$.` },
      { label: 'Integrate', text: t`$(100 + t)^2 S = 2(100 + t)^3 + C$, and $S(0) = 0$ gives $C = -2\times10^6$: $\;S = 2(100 + t) - \dfrac{2\times10^6}{(100 + t)^2}$.` },
      { label: 'When full', text: t`At $t = 100$: $S = 400 - \dfrac{2\times10^6}{40\,000} = 400 - 50 = 350$ g, a concentration of $350/200 = 1.75$ g/L.` },
      { label: 'Sense check', text: t`The concentration $S/V = 2 - 2\times10^6/(100 + t)^3$ climbs towards the inflow’s 2 g/L but never passes it, and the time constant $V/r_\text{out}$ grows as the tank fills.` },
    ],
    answer: t`$S(t) = 2(100 + t) - \dfrac{2\times10^6}{(100 + t)^2}$ g; when the tank is full it holds 350 g of salt (1.75 g/L).`,
  },
  practice: [
    num({
      id: 'cryo-tank', difficulty: 2,
      gen(r) {
        const Ta = r.pick([290, 295]), T0 = r.pick([90, 77]), T1 = r.pick([140, 150, 160]), t1 = r.pick([1, 2]), Tgoal = Ta - r.pick([10, 20]);
        const k = Math.log((Ta - T0) / (Ta - T1)) / t1, T = Math.log((Ta - T0) / (Ta - Tgoal)) / k;
        const liquid = T0 === 90 ? 'liquid oxygen' : 'liquid nitrogen';
        return {
          prompt: t`After a scrubbed test, a drained ${liquid} tank at ${T0} K is left to warm in a ${Ta} K test cell, following Newton’s law $T' = -k\,(T - ${Ta})$. After ${t1} h its wall reads ${T1} K. How many hours after draining will it reach ${Tgoal} K, safe to handle?`,
          answer: T, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: (t1 * (Tgoal - T0)) / (T1 - T0), feedback: 'Warming is not linear: the closer the tank gets to the cell temperature, the more slowly it warms.' }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`The gap to the cell decays exponentially: $${Ta} - T = (${Ta} - ${T0})e^{-kt}$.`, t`From the reading: $e^{-${t1}k} = \dfrac{${Ta - T1}}{${Ta - T0}}$, so $k = \dfrac{1}{${t1}}\ln\dfrac{${Ta - T0}}{${Ta - T1}}$. Then solve $${Ta - Tgoal} = ${Ta - T0}\,e^{-kt}$.`],
          teach: 'Newton’s law makes the temperature gap decay exponentially; one later reading fixes k, and k fixes every later time.',
          explain: t`$k = \tfrac{1}{${t1}}\ln\tfrac{${Ta - T0}}{${Ta - T1}} = ${fmt(k, 3)}\ \text{h}^{-1}$, and $t = \dfrac{1}{k}\ln\dfrac{${Ta - T0}}{${Ta - Tgoal}} = ${fmt(T, 3)}$ h. The last ${Ta - Tgoal} K take longer than the first hundred: the gap shrinks by the same factor in each equal time.`,
          visual: {
            type: 'graph',
            params: { x: [0, Math.ceil(1.3 * T)], y: [0, Ta + 20], xlabel: 't (hours)', ylabel: 'T (K)', curves: [{ fn: `${Ta} - ${Ta - T0}*exp(-${k}x)`, domain: [0, t1], color: 'accent', width: 2.8 }], points: [{ x: 0, y: T0, color: 'accent', label: `drained, ${T0} K`, labelDx: 8, labelDy: 12 }, { x: t1, y: T1, color: 'gold', label: `${T1} K after ${t1} h`, labelDx: 8, labelDy: 12 }, { x: 0, y: Tgoal, r: 0.01, color: 'good', label: `safe: ${Tgoal} K`, labelDx: 8, labelDy: 14 }], hlines: [{ y: Ta, label: `cell at ${Ta} K`, color: 'ink3' }, { y: Tgoal, color: 'good' }] },
            caption: 'The warming so far (blue), and the temperature the tank must reach (green). The tank wall is treated as one lumped temperature with a constant k; real heat transfer changes with temperature, and frost on the wall slows it.',
          },
        };
      },
    }),
    num({
      id: 'sensor-lag', difficulty: 2,
      gen(r) {
        const tau = r.pick([0.4, 0.8, 1.5, 2]), beta = r.pick([5, 12, 20, 30]);
        const lag = beta * tau;
        return {
          prompt: t`A thermocouple with time constant $\tau = ${tau}$ s sits in a gas stream whose temperature rises steadily at $${beta}$ K/s. Its reading obeys $T' = \dfrac{T_\text{gas}(t) - T}{\tau}$. Once the start-up transient has died away, by how much does it under-read?`,
          answer: lag, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: beta / tau, feedback: t`The lag in time is $\tau$; the temperature error is how far the gas warms in that time, $\beta\tau$.` }, { value: tau, feedback: t`$\tau$ is the lag in **seconds**; multiply by the warming rate for the error in kelvin.` }].filter((e) => Math.abs(e.value - lag) > 0.02 * lag),
          hints: [t`Try a particular solution that runs parallel to the ramp: $T = T_\text{gas}(t) - D$, with $D$ constant.`, t`Then $T' = ${beta}$ and the equation reads $${beta} = D/${tau}$.`],
          teach: 'A first-order system follows a ramp with a constant time lag τ, so its reading is wrong by the ramp rate times τ.',
          explain: t`$D = \beta\tau = ${beta} \times ${tau} = ${nice(lag)}$ K. The sensor shows the gas temperature as it was $${tau}$ s earlier. Engine test stands correct for this — or use thinner thermocouples with smaller $\tau$.`,
          visual: { type: 'graph', params: { x: [0, 6 * tau], y: [0, beta * 6 * tau * 1.05], xlabel: 't (s)', ylabel: 'T − T(0) (K)', curves: [{ fn: `${beta}*x`, color: 'ink3', dash: true, width: 1.8, label: 'gas', labelAt: 4.4 * tau, labelDx: -30, labelDy: -10 }, { fn: `${beta}*(x - ${tau}*(1 - exp(-x/${tau})))`, color: 'accent', label: 'reading', labelAt: 4 * tau, labelDy: 14 }] }, caption: 'The gas temperature (dashed) and the thermocouple’s reading (blue), both starting together.' },
        };
      },
    }),
    num({
      id: 'rc-filter', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2.2, 4.7]), C = r.pick([0.1, 0.47, 1]), f = r.pick([100, 200, 500]);
        const tau = R * 1e3 * C * 1e-6, w = 2 * Math.PI * f, ratio = 1 / Math.sqrt(1 + (w * tau) ** 2);
        return {
          prompt: t`A low-pass filter on a sensor line is a ${R} kΩ resistor feeding a ${C} µF capacitor, so the output obeys $V' = \dfrac{V_\text{in}(t) - V}{RC}$. Noise at ${f} Hz arrives with amplitude 1 V. What is its amplitude at the output, once the transient has died?`,
          answer: ratio, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: 1 / Math.sqrt(1 + (f * tau) ** 2), feedback: t`Use the angular frequency, $\omega = 2\pi f$, not $f$.` }, { value: 1 / (1 + w * tau), feedback: t`The steady amplitude is $1/\sqrt{1 + (\omega RC)^2}$ — the two parts, in phase and out of phase, add like a right triangle.` }].filter((e) => Math.abs(e.value - ratio) > 0.02 * ratio),
          hints: [t`$RC = ${R}\times10^{3} \times ${C}\times10^{-6} = ${tex(tau)}$ s and $\omega = 2\pi \times ${f}$.`, t`The steady response to $\sin\omega t$ has amplitude $\dfrac{1}{\sqrt{1 + (\omega RC)^2}}$.`],
          teach: 'An RC low-pass passes slow signals and divides a fast one’s amplitude by √(1 + (ωRC)²).',
          explain: t`$\omega RC = 2\pi \times ${f} \times ${tex(tau)} = ${fmt(w * tau, 3)}$, so the amplitude is $1/\sqrt{1 + ${fmt((w * tau) ** 2, 3)}} = ${fmt(ratio, 3)}$ V, lagging by $\arctan(\omega RC) = ${fmt((Math.atan(w * tau) * 180) / Math.PI, 3)}°$.`,
          visual: { type: 'graph', params: { x: [0, 12.6], y: [-1.2, 1.4], xlabel: 'ωt (rad)', ylabel: 'V', curves: [{ fn: 'sin(x)', color: 'ink3', dash: true, width: 1.6, label: 'input', labelAt: 1.6, labelDy: -12 }, { fn: '(sin(x) - cos(x))/2', color: 'accent', label: 'output when ωRC = 1', labelAt: 8.8, labelDx: 6, labelDy: -14 }] }, caption: t`An example, not your numbers: when $\omega RC = 1$ the steady output has amplitude $1/\sqrt2$ and lags by an eighth of a cycle. Ideal components.` },
        };
      },
    }),
    expr({
      id: 'filling-tank', difficulty: 3,
      gen(r) {
        const V0 = r.pick([50, 100, 200]), c = r.pick([1, 3, 0.5]);
        const ans = `${c}*((${V0} + t) - ${V0 * V0}/(${V0} + t))`;
        return {
          prompt: t`A tank holds $${V0}$ L of pure water. Brine with ${c} g/L flows in at 2 L/min and the mixture drains at 1 L/min, so $V = ${V0} + t$ and the salt obeys $S' = ${2 * c} - \dfrac{S}{${V0} + t}$. Find $S(t)$.`,
          answer: ans, answerTeX: t`S = ${c === 1 ? '' : c}\left(${V0} + t - \dfrac{${V0 * V0}}{${V0} + t}\right)`, lhs: 'S',
          vars: { t: [0, 100] },
          integrand: `${2 * c} - (${ans})/(${V0} + t)`,
          errors: [{ answer: `${c}*(${V0} + t)`, feedback: t`That is the particular solution alone. Add the term $C/(${V0} + t)$ and fix $C$ from $S(0) = 0$.` }, { answer: `${2 * c}*t`, feedback: 'That counts the salt coming in but none going out.' }],
          hints: [t`Standard form: $S' + \dfrac{1}{${V0} + t}S = ${2 * c}$, so $\mu = ${V0} + t$.`, t`$\left[(${V0} + t)S\right]' = ${2 * c}(${V0} + t)$ integrates to $${c}(${V0} + t)^2 + C$; then $S(0) = 0$.`],
          teach: 'When the volume changes, the integrating factor is a power of the volume rather than an exponential.',
          explain: t`$(${V0} + t)S = ${c}(${V0} + t)^2 + C$ with $C = -${nice(c * V0 * V0)}$, so $S = ${c === 1 ? '' : c}\left(${V0} + t - \dfrac{${V0 * V0}}{${V0} + t}\right)$. The concentration $S/V$ climbs towards ${c} g/L.`,
          visual: { type: 'graph', params: { x: [0, 2 * V0], y: [0, c * 3 * V0 * 1.05], xlabel: 't (min)', ylabel: 'g', curves: [{ fn: `${c}*(${V0} + x)`, color: 'ink3', dash: true, width: 1.6, label: 'salt in a tank of pure inflow', labelAt: V0 * 0.2, labelDy: -12 }] }, caption: 'The salt a tank of the same volume would hold if it were all fresh inflow. The real amount starts at zero and climbs towards this line.' },
        };
      },
    }),
    mcq({
      id: 'never-there', difficulty: 2,
      prompt: t`Tea at 90 °C in a 20 °C room obeys Newton’s law and has cooled to 55 °C after 10 minutes. When does it reach exactly 20 °C?`,
      choices: ['Never: the gap to 20 °C halves every 10 minutes but never reaches zero', 'After 20 minutes, continuing the same fall of 35 °C per 10 minutes', 'After about 40 minutes, four time constants', 'After about 61 minutes, when the gap has halved six times'],
      answer: 0,
      why: {
        1: 'The cooling slows as the gap shrinks: the second 10 minutes take only half as much off as the first.',
        2: 'After four time constants the gap is about 2% of its start — small, not zero.',
        3: t`After six halvings the gap is $70/64 \approx 1.1$ °C — small, but not zero. No number of halvings gives exactly zero.`,
      },
      hints: ['How does the gap to room temperature change in each 10-minute interval?', t`$T - 20 = 70e^{-kt}$. Can an exponential reach zero?`],
      teach: 'A solution approaches a stable equilibrium only asymptotically: Newton cooling never reaches room temperature in a finite time.',
      explain: t`$T - 20 = 70\cdot 2^{-t/10}$: 35 °C, 17.5 °C, 8.75 °C, … The gap halves every 10 minutes and is never zero — though after an hour it is about 1 °C, which no thermometer at a tea table would notice. (Real tea also cools by evaporation, faster at first.)`,
      visual: { type: 'graph', params: { x: [0, 60], y: [0, 100], xlabel: 't (min)', ylabel: 'T (°C)', curves: [{ fn: '20 + 70*2^(-x/10)', color: 'accent' }], hlines: [{ y: 20, label: 'room, 20 °C', color: 'ink3' }], points: [{ x: 10, y: 55, color: 'gold', label: '55 °C at 10 min' }] }, caption: 'Newton cooling from 90 °C in a 20 °C room, with the reading at 10 minutes.' },
    }),
    match({
      id: 'time-constants', difficulty: 2,
      prompt: t`Each system relaxes as $y' = (y_\infty - y)/\tau$. Match each with its time constant $\tau$.`,
      left: [
        t`A well-mixed tank of volume $V$ flushed at flow rate $r$`,
        t`A resistor $R$ charging a capacitor $C$`,
        t`An object of mass $m$, specific heat $c$, surface area $A$ and heat-transfer coefficient $h$`,
        t`An inductor $L$ in series with a resistor $R$`,
      ],
      right: ['V / r', 'RC', 'mc / (hA)', 'L / R', 'R / L', 'r / V'],
      answer: [0, 1, 2, 3],
      hints: ['A time constant has units of time. Check each combination’s units.', 'Bigger storage (volume, capacitance, heat capacity) means slower; faster flushing (flow, conductance, heat transfer) means quicker.'],
      teach: 'A time constant is storage divided by the rate of exchange: how much the system holds over how fast it trades.',
      explain: t`$V/r$ (litres over litres per minute), $RC$ (ohms × farads = seconds), $mc/(hA)$ (joules per kelvin over watts per kelvin) and $L/R$ (henries over ohms = seconds). Each is “what it holds” over “how fast it exchanges”.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 1.1], xlabel: 't / τ', ylabel: 'fraction of the way', curves: [{ fn: '1 - exp(-x)', color: 'accent' }], points: [{ x: 1, y: 1 - Math.exp(-1), color: 'gold', label: '63% at one τ' }, { x: 3, y: 1 - Math.exp(-3), color: 'gold', label: '95% at three' }] }, caption: 'Every one of these systems follows this one curve once time is measured in units of its own τ.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-igniter', difficulty: 2, transfer: true,
      gen(r) {
        const C = r.pick([470, 1000, 2200]), R = r.pick([47, 100, 220]), V0 = r.pick([28, 36]), Vs = r.pick([5, 2]);
        const tau = R * 1e3 * C * 1e-6, T = tau * Math.log(V0 / Vs);
        return {
          prompt: t`A pyrotechnic firing circuit stores energy in a ${C} µF capacitor charged to ${V0} V. When the launch is scrubbed, a ${R} kΩ bleed resistor discharges it: $V' = -\dfrac{V}{RC}$. Range safety requires the voltage to fall below ${Vs} V before anyone approaches. How long is that?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: tau, feedback: t`One time constant only takes the voltage to 37% of ${V0} V. Solve $${V0}e^{-t/RC} = ${Vs}$.` }, { value: tau * Math.log(V0 - Vs), feedback: t`The ratio of voltages goes in the logarithm: $t = RC\ln(${V0}/${Vs})$.` }],
          hints: [t`$V = ${V0}\,e^{-t/RC}$ with $RC = ${R}\times10^{3}\ \Omega \times ${C}\times10^{-6}$ F.`, t`$t = RC\ln\dfrac{${V0}}{${Vs}}$.`],
          teach: 'An RC discharge falls by a factor e every RC seconds, so the time to fall by any factor is RC times its logarithm.',
          explain: t`$RC = ${nice(tau)}$ s and $t = ${nice(tau)}\ln(${V0}/${Vs}) = ${fmt(T, 3)}$ s. Bleed resistors are sized so this is short, but not so small that they waste the charge during a real countdown.`,
          visual: { type: 'em-circuit', params: { circuit: 'rc', switches: { mode: 'discharge' }, values: { E: V0, R: R * 1e3, C: C * 1e-6 }, graph: false, controls: false, flow: false, show: { values: true } }, caption: 'The capacitor discharging through its bleed resistor; the battery is switched out. Ideal components, no leakage.' },
        };
      },
    }),
    num({
      id: 'cp-full', difficulty: 3,
      gen(r) {
        const V0 = r.pick([100, 200]), cap = 2 * V0, rin = r.pick([4, 6]), rout = rin - 2, c = r.pick([1, 2]);
        // V = V0 + 2t; S' = rin c − rout S/V; μ = V^(rout/2)
        const p = rout / 2, tf = (cap - V0) / 2;
        const S = (V) => ((rin * c) / (2 * (p + 1))) * (V - V0 ** (p + 1) / V ** p);
        const Sf = S(cap);
        return {
          prompt: t`A ${cap} L tank starts with ${V0} L of pure water. Brine with ${c} g/L flows in at ${rin} L/min; the well-mixed solution drains at ${rout} L/min. How much salt is in the tank when it becomes full?`,
          answer: Sf, units: 'g', tol: { rel: 0.01 },
          errors: [{ value: rin * c * tf, feedback: 'That is all the salt that flowed in; some has drained out.' }, { value: c * cap, feedback: 'That would be a tank of full-strength brine; the concentration has not caught up yet.' }],
          hints: [t`$V = ${V0} + 2t$, full at $t = ${tf}$ min. $\;S' + \dfrac{${rout}}{${V0} + 2t}S = ${rin * c}$.`, t`$\mu = e^{\int ${rout}/(${V0} + 2t)\,dt} = (${V0} + 2t)^{${p}}$.`, t`$\left[V^{${p}}S\right]' = ${rin * c}V^{${p}}$ with $dV = 2\,dt$; integrate, use $S(0) = 0$, and evaluate at $V = ${cap}$.`],
          teach: t`For a tank whose volume changes, write $V(t)$, balance in against out, and use the integrating factor $V^{\,r_\text{out}/(r_\text{in} - r_\text{out})}$.`,
          explain: t`With $V = ${V0} + 2t$: $S = \dfrac{${rin * c}}{${2 * (p + 1)}}\left(V - \dfrac{${V0}^{${p + 1}}}{V^{${p}}}\right)$, so at $V = ${cap}$, $S = ${fmt(Sf, 3)}$ g — a concentration of ${fmt(Sf / cap, 3)} g/L against the inflow’s ${c} g/L.`,
          visual: { type: 'graph', params: { x: [0, tf * 1.1], y: [0, cap * 1.1], xlabel: 't (min)', ylabel: 'litres', curves: [{ fn: `${V0} + 2x`, domain: [0, tf], color: 'teal', label: 'volume', labelAt: tf * 0.5, labelDy: -12 }], hlines: [{ y: cap, label: 'full', color: 'ink3' }] }, caption: 'The volume in the tank: it grows by 2 L every minute until the tank is full.' },
        };
      },
    }),
    mcq({
      id: 'cp-passband', difficulty: 2,
      prompt: t`An RC filter has $RC = 1$ ms. Which of these signals comes through with its amplitude almost unchanged?`,
      choices: ['10 Hz', '1 kHz', '10 kHz', '100 kHz'],
      answer: 0,
      why: {
        1: t`At 1 kHz, $\omega RC = 2\pi \approx 6.3$: the amplitude drops to about 16%.`,
        2: t`At 10 kHz, $\omega RC \approx 63$: the amplitude drops to under 2%.`,
        3: t`At 100 kHz, $\omega RC \approx 630$: almost nothing gets through.`,
      },
      hints: [t`The amplitude ratio is $1/\sqrt{1 + (\omega RC)^2}$ with $\omega = 2\pi f$. Which signal has $\omega RC \ll 1$?`],
      teach: 'A low-pass RC filter passes signals with ωRC ≪ 1 and attenuates those with ωRC ≫ 1.',
      explain: t`At 10 Hz, $\omega RC = 2\pi \times 10 \times 10^{-3} \approx 0.063$, so the amplitude ratio is $1/\sqrt{1.004} \approx 0.998$. The faster signals are cut down roughly in proportion to $1/(\omega RC)$.`,
      visual: { type: 'graph', params: { x: [0, 12.6], y: [-1.2, 1.4], xlabel: 'ωt (rad)', ylabel: 'V', curves: [{ fn: 'sin(x)', color: 'ink3', dash: true, width: 1.6, label: 'input', labelAt: 1.6, labelDy: -12 }, { fn: '(sin(x) - 4*cos(x))/17', color: 'accent', label: 'output when ωRC = 4', labelAt: 9.5, labelDx: 6, labelDy: -14 }] }, caption: t`An example: when $\omega RC = 4$ the output is reduced to $1/\sqrt{17} \approx 0.24$ of the input and lags by 76°.` },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.4 (mixing problems) and §2.4', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax University Physics Vol. 2, §10.5 RC circuits', url: 'https://openstax.org/books/university-physics-volume-2/pages/10-5-rc-circuits' },
    { label: 'NASA, Safety Standard for Explosives, Propellants, and Pyrotechnics (NASA-STD-8719.12)', url: 'https://standards.nasa.gov/standard/NASA/NASA-STD-871912' },
  ],
});
