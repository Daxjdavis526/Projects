// Power: the rate of doing work, P = dW/dt = F·v. Energy is how much; power is how fast.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, s3, sci, thou } from './_energy.js';

const t = String.raw;

// the worked example: the extra power a climbing turboprop needs
const EX = { m: 9000, vy: 6.0, v: 80, T: 22000 };
EX.P = EX.m * G * EX.vy;                          // 529 kW
EX.sin = EX.vy / EX.v;                            // climb angle, sin γ = v_y / v
EX.gam = Math.asin(EX.sin) * 180 / Math.PI;       // 4.3°
EX.D = EX.T - EX.m * G * EX.sin;                  // drag that balances along the path
EX.L = EX.m * G * Math.cos(Math.asin(EX.sin));    // lift, perpendicular to the path

// a power–time graph with the energy (area) shaded
const ptGraph = ({ P, from, to, x, y, xlabel = 't (s)', ylabel = 'P (kW)', caption, extra = {} }) => ({
  type: 'graph',
  params: { x, y, xlabel, ylabel, aspect: 'wide', curves: [{ fn: P, color: 'violet', width: 2.6, domain: [from, to] }], shade: [{ fn: P, from, to, color: 'violet', alpha: 0.25 }], ...extra },
  caption: caption ?? 'Power against time. The shaded area under the graph is the energy delivered.',
});

// the liquid-oxygen turbopump in the checkpoint
const LOX = 1141;                                 // kg/m³, near its boiling point at 1 atm
const PUMP = {
  type: 'graph',
  params: {
    x: [-0.4, 6.4], y: [-1.25, 1.45], equal: true, aspect: 'wide', grid: false, axes: false, xlabel: '', ylabel: '',
    alt: 'A slug of liquid in a pipe, pushed by a pressure force while it moves',
    curves: [{ fn: '0.5', domain: [0, 6], color: 'ink2', width: 2 }, { fn: '-0.5', domain: [0, 6], color: 'ink2', width: 2 }],
    shade: [{ fn: '0.5', lower: '-0.5', from: 2, to: 3.4, color: 'accent', alpha: 0.4 }],
    arrows: [{ from: [0.5, 0], to: [1.95, 0], color: 'warn', label: 'Δp·A', labelDy: -12, labelDx: -40 }, { from: [2.2, 0.9], to: [3.8, 0.9], color: 'good', label: 'v' }],
    points: [{ x: 2.05, y: -0.85, r: 0.01, color: 'accent', label: 'liquid, cross-section A' }],
  },
  caption: 'A slug of liquid oxygen leaving the pump: the pressure rise acts on its cross-section A as a force Δp·A while it moves at speed v. Schematic.',
};

export default lesson({
  id: 'phys2210.M7.4',
  title: 'Power',
  minutes: 9, difficulty: 2,
  intro: t`**Power** is the rate at which work is done — how fast energy is transferred:

$$P = \frac{dW}{dt}, \qquad P_\text{avg} = \frac{W}{\Delta t}, \qquad P = \vec F\cdot\vec v$$

The same job done in half the time takes twice the power, but exactly the same energy. Power is measured in watts, 1 W = 1 J/s. A force $\vec F$ acting on an object moving at velocity $\vec v$ delivers power $\vec F\cdot\vec v$ — which is why an engine at full power can pull hard only at low speed.`,
  symbols: [
    { tex: 'P', text: 'power, in watts (W): joules per second. $P = dW/dt$ is the instantaneous power' },
    { tex: 'P_\\text{avg} = W/\\Delta t', text: 'average power: the work $W$ (J) done over a time interval $\\Delta t$ (s)' },
    { tex: '\\vec F\\cdot\\vec v', text: 'the power a force delivers to an object moving at velocity $\\vec v$ (m/s): $Fv\\cos\\theta$, in W. It follows from $dW = \\vec F\\cdot d\\vec r$ divided by $dt$' },
    { tex: '1\\ \\mathrm{W}', text: 'one watt, 1 J/s. A kilowatt-hour (kWh) is an *energy*: 1 kW for 1 h, which is 3.6 MJ' },
  ],
  why: 'Engines, motors, turbopumps and power stations are rated by power, because what usually matters is not how much energy they could deliver eventually, but how fast.',
  visual: {
    type: 'graph',
    title: 'Same job, different power',
    lead: t`A winch must lift a 500 kg load 12 m: a job of $mgh = 58.8$ kJ. The blue line is the energy your winch has delivered against time, at power $P$; the dashed line is a 2 kW winch for comparison. Power is the slope; the job is done where the line reaches the gold level.`,
    tasks: [
      'Double the power: the line becomes twice as steep and reaches the job’s energy in half the time. The energy needed does not change.',
      'Set P = 2 kW: your line lies on the dashed one — 29.4 s for the lift.',
      'Read the slope of either line: kilojoules per second are kilowatts.',
    ],
    params: {
      x: [0, 40], y: [0, 80], xlabel: 'time t (s)', ylabel: 'energy delivered (kJ)', aspect: 'wide',
      sliders: [{ key: 'P', label: 'Winch power $P$', min: 1, max: 20, step: 0.5, value: 4, unit: '\\mathrm{kW}', explain: 'The rate at which the winch delivers energy to the load.' }],
      curves: [{ fn: 'P*x', color: 'accent', width: 2.6 }, { fn: '2*x', color: 'ink3', width: 1.6, dash: true }],
      hlines: [{ y: 58.8, label: 'the job: 58.8 kJ', color: 'gold' }],
      points: [{ x: '58.8/P', y: 58.8, color: 'gold', label: 'done' }],
      readouts: [{ label: 'time to finish $t = W/P$', expr: '58.8/P', unit: '\\mathrm{s}', digits: 3 }, { label: 'energy needed', expr: '58.8', unit: '\\mathrm{kJ}', digits: 3 }],
    },
    caption: 'Ideal winch: all its power goes into lifting the load at constant speed (no friction, no motor losses). Real motors waste a share as heat.',
  },
  example: {
    prompt: t`A $${thou(EX.m)}$ kg turboprop aircraft climbs steadily: its airspeed is ${EX.v} m/s and it gains height at ${EX.vy.toFixed(1)} m/s. How much more power must its engines deliver than in level flight at the same airspeed? (Assume the drag is the same in the shallow climb as in level flight.)`,
    visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'plane', v: [1, +Math.tan(EX.gam * Math.PI / 180).toFixed(4)], forces: [{ label: 'mg', mag: Math.round(EX.m * G), dir: 270, kind: 'weight' }, { label: 'lift', mag: Math.round(EX.L), dir: +(90 + EX.gam).toFixed(2), kind: 'lift' }, { label: 'thrust', mag: EX.T, dir: +EX.gam.toFixed(2), kind: 'thrust' }, { label: 'drag', mag: Math.round(EX.D), dir: +(180 + EX.gam).toFixed(2), kind: 'drag' }] }, caption: 'The climbing aircraft and its forces, to scale, for an illustrative thrust of 22 kN: they balance, with the thrust exceeding the drag by the component of the weight along the flight path. The velocity arrow shows the true 4° climb.' },
    steps: [
      { label: 'Which force needs the extra power?', text: t`In level flight the thrust only balances drag. Climbing, the engines must also raise the aircraft against gravity: gravity does negative work at a rate $mg\,v_y$, where $v_y$ is the vertical speed.` },
      { label: 'Power as force times velocity', text: t`Gravity’s power is $\vec F\cdot\vec v = (mg)(v)\cos(90° + \gamma) = -mg\,v\sin\gamma = -mg\,v_y$, with $\gamma$ the climb angle: only the vertical part of the velocity counts.` },
      { label: 'Compute', text: t`$P_\text{extra} = mg\,v_y = (${thou(EX.m)})(9.8)(${EX.vy.toFixed(1)}) = ${sci(EX.P, 3)}\ \text{W} \approx ${fmt(EX.P / 1000, 3)}$ kW.` },
      { label: 'Sense check', text: t`The climb angle is tiny — $\sin\gamma = ${EX.vy.toFixed(1)}/${EX.v} = ${fmt(EX.sin, 2)}$, about ${fmt(Math.asin(EX.sin) * 180 / Math.PI, 2)}° — yet the extra power is about half a megawatt: aircraft of this class carry roughly 2 MW of engine power, and the climb takes a large share of it. Read backwards, this is how pilots estimate climb rate: $v_y = P_\text{spare}/(mg)$.` },
    ],
    answer: t`About ${fmt(EX.P / 1000, 3)} kW more than level flight.`,
  },
  practice: [
    num({
      id: 'lift-power', difficulty: 1,
      gen(r) {
        const m = r.pick([200, 300, 400, 500, 800]), h = r.pick([6, 8, 10, 12, 15]), tt = r.pick([10, 12, 15, 20, 30]);
        const P = (m * G * h) / tt;
        return {
          prompt: t`A hoist lifts a ${m} kg pallet ${h} m at constant speed in ${tt} s. What average power does it deliver to the pallet? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: m * G * h, feedback: 'That is the work (energy), in joules. Power is work per second: divide by the time.' }, { value: (m * h) / tt, feedback: 'The force needed is the weight, mg: include g.' }],
          hints: ['At constant speed the hoist does work mgh on the pallet.', t`$P = \dfrac{W}{\Delta t} = \dfrac{mgh}{\Delta t}$.`],
          teach: 'Average power is the work done divided by the time it took.',
          explain: t`$W = mgh = (${m})(9.8)(${h}) = ${thou(Math.round(m * G * h))}$ J, so $P = ${thou(Math.round(m * G * h))}/${tt} = ${s3(P)}$ W.`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'block', v: [0, 1], forces: [{ label: 'T', mag: Math.round(m * G), dir: 90, kind: 'tension' }, { label: 'mg', mag: Math.round(m * G), dir: 270, kind: 'weight' }] }, caption: 'The pallet rising at constant speed: the hoist’s pull balances its weight.' },
        };
      },
    }),
    num({
      id: 'cruise-power', difficulty: 2,
      gen(r) {
        const F = r.pick([450, 500, 600, 750, 900]), v = r.pick([20, 25, 30, 35]);
        const P = (F * v) / 1000;
        return {
          prompt: t`A car cruises on a level road at a steady ${v} m/s. Air drag and rolling resistance together oppose it with ${F} N. What power must the wheels deliver? Give the answer in kW.`,
          answer: P, units: 'kW', tol: { rel: 0.01 },
          errors: [{ value: F / v / 1000, feedback: t`Power is force **times** velocity: $P = Fv$.` }, { value: (F * v * v) / 1000, feedback: 'The speed enters once, not squared, for a given force.' }],
          hints: ['At constant speed the driving force equals the resistive force.', t`$P = Fv$.`],
          teach: 'A force pushing an object at speed v delivers power P = Fv.',
          explain: t`The driving force balances the ${F} N of resistance, so $P = Fv = (${F})(${v}) = ${thou(F * v)}$ W $= ${fmt(P, 3)}$ kW. (Real drag grows with speed, so cruising faster costs more power than this linear estimate.)`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'car', ground: true, v: [1, 0], forces: [{ label: 'driving force', mag: F, dir: 0, kind: 'applied' }, { label: 'drag + rolling', mag: F, dir: 180, kind: 'drag' }] }, caption: 'The cruising car’s horizontal forces (vertical ones not drawn): they balance at constant speed.' },
        };
      },
    }),
    num({
      id: 'kettle', difficulty: 2,
      gen(r) {
        const P = r.pick([1.5, 2, 2.4, 3]), mins = r.pick([2, 3, 4, 5]);
        const E = P * 1000 * mins * 60;
        return {
          prompt: t`An electric kettle rated at ${P} kW runs for ${mins} minutes. How much energy does it use, in kJ?`,
          answer: E / 1000, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: P * mins, feedback: 'You multiplied kilowatts by minutes. Convert the time to seconds first: kW × s = kJ.' }],
          hints: [t`Energy = power × time: $E = P\,\Delta t$.`, '1 kW for 1 s is 1 kJ; convert minutes to seconds.'],
          teach: 'Energy is power multiplied by time — the area under the power–time graph.',
          explain: t`$E = P\,\Delta t = (${P}\ \text{kW})(${mins * 60}\ \text{s}) = ${fmt(E / 1000, 3)}$ kJ — or $${fmt(P * mins / 60, 3)}$ kWh.`,
          visual: ptGraph({ P: String(P), from: 0, to: mins * 60, x: [0, mins * 60 * 1.3], y: [0, P * 1.4], caption: 'The kettle’s power against time (in seconds); the shaded area is the energy it uses.' }),
        };
      },
    }),
    mcq({
      id: 'kwh', difficulty: 1,
      prompt: 'Your electricity bill charges for kilowatt-hours. A kilowatt-hour is:',
      choices: ['An amount of energy: 3.6 MJ', 'A unit of power, like the kilowatt', 'A kilowatt per hour: how fast the power changes', '1000 joules'],
      answer: 0,
      why: {
        1: 'A kilowatt is a rate (1000 J every second). Multiplying it by a time gives an amount: kW × h is energy.',
        2: 'It is a kilowatt *times* an hour, not per hour.',
        3: 'That is a kilojoule, 1 kW for one *second*. An hour has 3600 s, so 1 kWh = 3.6 × 10⁶ J.',
      },
      hints: ['Power × time = energy. What is 1000 W × 3600 s?'],
      teach: 'Power is a rate; power multiplied by time is energy — a kWh is 3.6 MJ.',
      explain: t`$1\ \text{kWh} = (1000\ \text{J/s})(3600\ \text{s}) = 3.6\times10^{6}$ J: the energy a 1 kW heater uses in an hour — the shaded area.`,
      visual: ptGraph({ P: '1', from: 0, to: 1, x: [0, 1.5], y: [0, 1.4], xlabel: 't (h)', caption: 'A 1 kW heater running for one hour. The shaded area — power times time — is one kilowatt-hour.' }),
    }),
    num({
      id: 'time-to-speed', difficulty: 2,
      gen(r) {
        const m = r.pick([1500, 1800, 2000, 2200]), v = r.pick([20, 25, 27]), Pk = r.pick([60, 80, 100, 120]);
        const tt = (0.5 * m * v * v) / (Pk * 1000);
        return {
          prompt: t`An electric car of mass $${thou(m)}$ kg delivers a steady ${Pk} kW to its wheels. Ignoring air drag and other losses, how long does it take to reach ${v} m/s from rest?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (m * v * v) / (Pk * 1000), feedback: t`The energy needed is $\tfrac12 mv^2$ — include the ½.` }, { value: (m * v) / (Pk * 1000), feedback: 'Power × time is energy, so you need the kinetic energy ½mv², not mv.' }],
          hints: [t`The car needs kinetic energy $\tfrac12 mv^2$, delivered at ${Pk} kJ every second.`, t`$t = \dfrac{\tfrac12 mv^2}{P}$.`],
          teach: 'At constant power the time to gain kinetic energy K is K/P.',
          explain: t`$K = \tfrac12(${thou(m)})(${v})^2 = ${sci(0.5 * m * v * v, 3)}$ J; $t = K/P = ${sci(0.5 * m * v * v, 3)}/${thou(Pk * 1000)} = ${s3(tt)}$ s. (At constant power the force $P/v$ is huge at low speed; real cars are limited by tyre grip there.)`,
          visual: {
            type: 'graph',
            params: { x: [0, tt * 1.6], y: [0, 0.5 * m * v * v * 1.4 / 1000], xlabel: 'time t', ylabel: 'K (kJ)', aspect: 'wide', xticks: 0.001, curves: [{ fn: `${Pk}*x`, color: 'accent', width: 2.6 }], hlines: [{ y: 0.5 * m * v * v / 1000, label: `½mv² at ${v} m/s`, color: 'gold' }] },
            caption: 'Kinetic energy against time at constant power: a straight line of slope P. The time scale is hidden — compute, don’t read off.',
          },
        };
      },
    }),
    num({
      id: 'spin-up', difficulty: 3,
      gen(r) {
        const P0 = r.pick([2, 3, 4, 5]), t1 = r.pick([1, 1.5, 2]), t2 = t1 + r.pick([2, 3, 4]);
        const E = P0 * (t1 / 2 + (t2 - t1));
        const pe = `min(${P0}*x/${t1}, ${P0})`;
        return {
          prompt: t`During an engine test, a turbopump’s power rises steadily from zero to ${P0} MW in ${t1} s, then holds at ${P0} MW until $t = ${t2}$ s. How much energy does it deliver in that time, in MJ?`,
          answer: E, units: 'MJ', tol: { rel: 0.01 },
          errors: [{ value: P0 * t2, feedback: 'The power was not at full value from the start: the ramp is a triangle.' }, { value: P0 * (t2 - t1), feedback: 'You left out the energy delivered during the ramp-up.' }],
          hints: ['Energy is the area under the power–time graph.', t`Triangle $\tfrac12(${t1})(${P0})$ plus rectangle $(${t2 - t1})(${P0})$ — MW × s = MJ.`],
          teach: 'The energy delivered is the area under the power–time graph.',
          explain: t`$E = \tfrac12(${t1})(${P0}) + (${t2 - t1})(${P0}) = ${fmt(P0 * t1 / 2, 3)} + ${fmt(P0 * (t2 - t1), 3)} = ${fmt(E, 3)}$ MJ.`,
          visual: ptGraph({ P: pe, from: 0, to: t2, x: [0, t2 + 1], y: [0, P0 * 1.3], ylabel: 'P (MW)', caption: 'The turbopump’s power against time; the shaded area is the energy delivered (MW × s = MJ).' }),
        };
      },
    }),
    mcq({
      id: 'microwave', difficulty: 2, kind: 'error',
      prompt: 'A student argues: “An 800 W microwave run for 30 s uses more energy than a 60 W lamp left on for an hour, because 800 W is much more than 60 W.” What is wrong?',
      choices: [
        'Energy is power × time: the microwave uses 24 kJ, the lamp 216 kJ — the lamp uses nine times as much',
        'Nothing: the higher power always uses more energy',
        'They use the same energy, because both are rated in watts',
        'The comparison is impossible without knowing the voltage',
      ],
      answer: 0,
      why: {
        1: 'Power says how fast energy is used, not how much. A low power for a long time can add up to more.',
        2: 'Watts are a rate. Two devices with different powers and times use different amounts of energy.',
        3: 'The power rating already contains everything needed: energy = power × time.',
      },
      hints: ['Compute each energy as power × time, with the time in seconds.'],
      teach: 'Power is a rate: to compare energies, multiply each power by its time.',
      explain: t`Microwave: $(800\ \text{W})(30\ \text{s}) = 24$ kJ. Lamp: $(60\ \text{W})(3600\ \text{s}) = 216$ kJ. The areas under the two power–time graphs tell the story.`,
      visual: {
        type: 'graph',
        params: { x: [0, 4000], y: [0, 900], xlabel: 't (s)', ylabel: 'P (W)', aspect: 'wide', curves: [{ fn: '800', domain: [0, 30], color: 'warn', width: 2.4 }, { fn: '60', domain: [0, 3600], color: 'accent', width: 2.4 }], shade: [{ fn: '800', from: 0, to: 30, color: 'warn', alpha: 0.4 }, { fn: '60', from: 0, to: 3600, color: 'accent', alpha: 0.3 }], points: [{ x: 60, y: 800, r: 0.01, color: 'warn', label: 'microwave' }, { x: 2400, y: 60, r: 0.01, color: 'accent', label: 'lamp', labelDy: -14 }] },
        caption: 'Power against time for the two devices; the shaded areas are their energies.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-turbopump', difficulty: 3, transfer: true,
      gen(r) {
        const mdot = r.pick([150, 200, 250, 300, 400]), dp = r.pick([10, 15, 20, 25]);
        const Q = mdot / LOX, P = Q * dp * 1e6;
        return {
          prompt: t`A rocket engine’s oxidiser turbopump moves ${mdot} kg/s of liquid oxygen (density $${thou(LOX)}\ \text{kg/m}^3$) and raises its pressure by ${dp} MPa. What power must the pump deliver to the liquid? Give the answer in MW. (Pressure is force per area: pushing a column of liquid of cross-section $A$ at speed $v$ against a pressure rise $\Delta p$ takes power $(\Delta p\,A)\,v$.)`,
          answer: P / 1e6, units: 'MW', tol: { rel: 0.01 },
          errors: [{ value: (mdot * dp * 1e6) / 1e6, feedback: t`$Av$ is the **volume** flow rate, $\dot m/\rho$ — divide the mass flow by the density.` }, { value: (dp * 1e6) / Q / 1e6, feedback: t`$P = \Delta p\,Q$: multiply by the flow rate, do not divide.` }],
          hints: [t`$P = Fv = (\Delta p\,A)v = \Delta p\,(Av)$, and $Av$ is the volume flow rate $Q$.`, t`$Q = \dot m/\rho = ${mdot}/${thou(LOX)}\ \text{m}^3/\text{s}$; then $P = \Delta p\,Q$ with $\Delta p$ in pascals.`],
          teach: 'A pump’s power is the pressure rise times the volume flow rate — force times speed for a fluid.',
          explain: t`$Q = \dot m/\rho = ${mdot}/${thou(LOX)} = ${fmt(Q, 3)}\ \text{m}^3/\text{s}$; $P = \Delta p\,Q = (${dp}\times10^{6}\ \text{Pa})(${fmt(Q, 3)}\ \text{m}^3/\text{s}) = ${fmt(P / 1e6, 3)}$ MW. A real pump also loses a share of its shaft power to friction and turbulence, so its turbine must supply more than this.`,
          visual: PUMP,
        };
      },
    }),
    num({
      id: 'cp-climb', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([1100, 1200, 4500, 5000]), Pk = m > 2000 ? r.pick([300, 400, 450]) : r.pick([40, 50, 60]);
        const vy = (Pk * 1000) / (m * G);
        return {
          prompt: t`A $${thou(m)}$ kg aircraft has ${Pk} kW of spare engine power beyond what level flight needs at its airspeed. Assuming all of it goes into climbing, what is its rate of climb?`,
          answer: vy, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (Pk * 1000) / m, feedback: 'The climbing aircraft works against its weight, mg: include g.' }, { value: (Pk * m * G) / 1000, feedback: t`$P = mg\,v_y$, so $v_y = P/(mg)$: divide.` }],
          hints: [t`Climbing at vertical speed $v_y$ takes extra power $mg\,v_y$.`],
          teach: 'Rate of climb = spare power ÷ weight.',
          explain: t`$v_y = \dfrac{P}{mg} = \dfrac{${thou(Pk * 1000)}}{(${thou(m)})(9.8)} = ${s3(vy)}$ m/s.`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'plane', v: [1, 0.15], forces: [{ label: 'mg', mag: Math.round(m * G), dir: 270, kind: 'weight' }, { label: 'lift', mag: Math.round(m * G), dir: 90, kind: 'lift' }] }, caption: 'The climbing aircraft (climb angle exaggerated). Thrust and drag not drawn.' },
        };
      },
    }),
    mcq({
      id: 'cp-two-motors', difficulty: 1,
      prompt: 'Two motors lift identical loads through the same height. Motor A takes 10 s; motor B takes 20 s. Which is true?',
      choices: ['They do the same work, and A delivers twice the power', 'A does twice the work of B', 'B does twice the work, because it works for longer', 'They deliver the same power, because the loads are identical'],
      answer: 0,
      why: { 1: 'The work is mgh for both: same load, same height.', 2: 'Working longer does not mean doing more work: the job (mgh) is the same.', 3: 'The same work in half the time takes twice the power.' },
      hints: ['Work depends on the force and the distance; power on how fast the work is done.'],
      teach: 'Same job, same work; doing it faster takes more power.',
      explain: t`$W = mgh$ for both. $P = W/t$, so A, taking half the time, delivers twice the power.`,
      visual: ptGraph({ P: '2', from: 0, to: 10, x: [0, 24], y: [0, 2.6], ylabel: 'P (kW)', caption: 'Power against time: motor A (violet, 2 kW for 10 s). Motor B would be a rectangle half as tall and twice as wide — the same area.', extra: { curves: [{ fn: '2', domain: [0, 10], color: 'violet', width: 2.6 }, { fn: '1', domain: [0, 20], color: 'ink3', width: 1.6, dash: true }] } }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §7.4 Power', url: 'https://openstax.org/books/university-physics-volume-1/pages/7-4-power' },
  ],
});
