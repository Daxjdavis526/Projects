// Hydrostatic pressure: p = p0 + ρgh — depth, not shape; gauge and absolute;
// manometers and barometers; Pascal's principle; a propellant tank in flight.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, P_ATM, RHO, s3, tn, tank, seg, box, label } from './_fluids.js';

const t = String.raw;
const PA = 101.3;   // kPa: the atmosphere these problems quote

export default lesson({
  id: 'phys2210.M14.2',
  title: 'Hydrostatic pressure',
  minutes: 11, difficulty: 2,
  intro: t`In a liquid at rest, every layer holds up the weight of all the liquid above it, so the pressure grows steadily with depth:

$$p = p_0 + \rho g h$$

A column of liquid of height $h$ and area $A$ weighs $\rho (Ah) g$; spread over its area $A$, that is $\rho g h$. **Only the depth matters** — not the width or shape of the container. And whatever pressure acts on the surface, $p_0$, is felt everywhere below it: raise $p_0$ and every pressure in the liquid rises by the same amount (**Pascal’s principle**, the idea behind hydraulics). Most gauges read **gauge pressure**, $p - p_\text{atm}$: how far above the atmosphere’s pressure you are.`,
  symbols: [
    { tex: 'p', text: 'the (absolute) pressure at depth $h$, in Pa' },
    { tex: 'p_0', text: 'the pressure on the liquid’s surface, in Pa: the atmosphere’s, $p_\\text{atm} \\approx 101.3$ kPa, for an open container; the gas’s (the *ullage* pressure) in a closed propellant tank' },
    { tex: '\\rho', text: 'the density of the liquid, in kg/m³ (water 1000, seawater 1025, mercury 13 600, liquid oxygen 1141)' },
    { tex: 'g', text: 'the gravitational acceleration, 9.8 m/s² on Earth — or the *effective* $g + a$ in a vehicle accelerating upward at $a$' },
    { tex: 'h', text: 'the depth below the surface, in m, measured straight down' },
    { tex: 'p - p_\\text{atm}', text: 'gauge pressure: what most gauges read, the pressure above the atmosphere’s' },
  ],
  why: 'Hydrostatic pressure sets the load at the bottom of every tank and dam, the reading of every barometer and manometer, and the pressure a rocket’s propellant brings to its pumps.',
  visual: {
    title: 'Depth, not shape',
    lead: t`Four vessels of different shapes, joined at the base, hold one liquid at one level. The gold probes all sit at the same depth $h$; the graph on the right plots pressure against depth on the same vertical scale.`,
    tasks: ['Move the probes down: every vessel reads the same pressure at every depth.', 'Switch on gauge pressure: the line now starts at zero at the surface, and each metre of water adds 9.8 kPa.', 'Try mercury: the line becomes 13.6 times steeper.'],
    ...tank({ scene: 'vessels', H: 2, depth: 1, sliders: ['depth', 'fluid', 'gauge'] },
    'Four joined vessels, one liquid, one level. At any depth the probes read the same pressure, whatever the shape. Right: pressure against depth, on the same vertical scale. Incompressible liquid at rest; the air’s weight above the surface is neglected. Depths to scale, widths not. $g = 9.8\\ \\text{m/s}^2$.'),
  },
  example: {
    prompt: t`A remotely operated vehicle (ROV) works $250$ m down in the ocean (seawater, $\rho = 1025\ \text{kg/m}^3$; $p_\text{atm} = 101.3$ kPa). (a) What absolute pressure acts on it? (b) Its camera looks out through a flat circular window $0.20$ m across, with air at $1$ atm inside the housing. What net force does the sea put on the window?`,
    visual: tank({ scene: 'vessels', shapes: ['wide'], fluid: 'seawater', H: 300, depth: 250 }, 'Pressure against depth in seawater down to 300 m: a straight line, about one more atmosphere for every 10 m. Depths to scale.'),
    steps: [
      { label: 'Weight of the water above', text: t`$\rho g h = (1025)(9.8)(250) = 2.51\times10^{6}\ \text{Pa} = 2511\ \text{kPa}$. This is the gauge pressure.` },
      { label: 'Add the surface pressure', text: t`$p = p_\text{atm} + \rho g h = 101.3 + 2511 = 2612\ \text{kPa} \approx 2.61\ \text{MPa}$ — about 26 atmospheres.` },
      { label: 'What the window feels', text: t`Inside, 1 atm pushes out; outside, $p$ pushes in. The difference is the gauge pressure, $2.51\times10^{6}\ \text{Pa}$.` },
      { label: 'Force', text: t`$A = \pi(0.10\ \text{m})^2 = 0.0314\ \text{m}^2$, so $F = (2.51\times10^{6})(0.0314) = 7.9\times10^{4}\ \text{N}$.` },
      { label: 'Sense check', text: t`Each 10 m of seawater adds $1025\times9.8\times10 \approx 100$ kPa, about one atmosphere, so 250 m adds about 25: $1 + 25 = 26$ atm. ✓ The window carries the weight of 8 tonnes.` },
    ],
    answer: t`(a) $p \approx 2.61\ \text{MPa}$ absolute ($2.51$ MPa gauge); (b) $F \approx 79\ \text{kN}$, inward.`,
  },
  practice: [
    num({
      id: 'pool', difficulty: 1,
      gen(r) {
        const h = r.pick([2.5, 3.0, 4.0, 5.5, 8.0, 12.0]);
        const p = PA + (1000 * G * h) / 1000;
        return {
          prompt: t`What is the **absolute** pressure at the bottom of a freshwater pool ${h.toFixed(1)} m deep? Take $p_\text{atm} = 101.3$ kPa and $g = 9.8\ \text{m/s}^2$.`,
          answer: p, units: 'kPa', tol: { rel: 0.005 },
          errors: [{ value: 9.8 * h, feedback: t`That is the gauge pressure, $\rho g h$. The absolute pressure adds the atmosphere pressing on the surface.` }],
          hints: [t`$p = p_\text{atm} + \rho g h$ with $\rho = 1000\ \text{kg/m}^3$.`, t`$\rho g h = 1000\times9.8\times${h.toFixed(1)}\ \text{Pa} = ${tn(9.8 * h)}\ \text{kPa}$.`],
          teach: 'Absolute pressure at depth h is the surface pressure plus the weight per area of the liquid above: p = p₀ + ρgh.',
          explain: t`$p = 101.3 + \dfrac{1000\times9.8\times${h.toFixed(1)}}{1000} = 101.3 + ${tn(9.8 * h)} = ${tn(p, 4)}\ \text{kPa}$.`,
          visual: tank({ scene: 'vessels', shapes: ['wide'], H: h, depth: h, graph: false, values: false }, 'The pool in cross-section, with a probe on its floor. Depth to scale.'),
        };
      },
    }),
    mcq({
      id: 'shapes', difficulty: 1,
      prompt: t`Four vessels of different shapes are joined at the base and filled with water to the same level. The gold probes all sit at the same depth. Where is the pressure greatest?`,
      choices: ['It is the same at all four probes', 'In the wide vessel: it holds the most water', 'In the narrow column: the water is squeezed into less space', 'In the flaring vessel: its sloping walls press down on the water'],
      answer: 0,
      why: {
        1: 'More water spread over a bigger area gives the same weight per square metre. Pressure depends on depth, not on how much liquid there is.',
        2: 'The column holds less water, but above each square metre of it stands the same height of water as in the wide vessel — so the same pressure.',
        3: 'The walls do push on the water, but the liquid at rest settles until the pressure at each depth is the same everywhere; if it differed, water would flow through the base pipe.',
      },
      hints: ['What does p = p₀ + ρgh depend on?', 'Same liquid, same surface pressure, same depth…'],
      teach: 'In a connected liquid at rest, pressure depends only on depth — never on the container’s shape (the hydrostatic paradox).',
      explain: t`$p = p_0 + \rho g h$ contains no width or shape. If the pressures at one depth differed, the liquid would flow from high to low through the base pipe until they matched — which is why the four levels agree.`,
      visual: tank({ scene: 'vessels', H: 2, depth: 1.2, graph: false, values: false }, 'Four joined vessels, one level. Depth to scale; widths not.'),
    }),
    num({
      id: 'rov-depth', difficulty: 2,
      gen(r) {
        const pg = r.pick([0.85, 1.2, 1.85, 2.4, 3.1]);   // MPa, gauge
        const h = (pg * 1e6) / (RHO.seawater * G);
        return {
          prompt: t`A diving robot’s depth sensor reads a **gauge** pressure of ${pg} MPa in seawater ($1025\ \text{kg/m}^3$). How deep is it? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: h, units: 'm', tol: { rel: 0.005 },
          errors: [
            { value: (pg * 1e6) / (1000 * G), feedback: 'Use the density of seawater, 1025 kg/m³, not fresh water’s.' },
            { value: (pg * 1e6 - P_ATM) / (RHO.seawater * G), feedback: 'A gauge reading already leaves out the atmosphere: it is exactly ρgh. Do not subtract 1 atm again.' },
          ],
          hints: [t`Gauge pressure is $\rho g h$, so $h = \dfrac{p_\text{gauge}}{\rho g}$.`, t`$h = \dfrac{${pg}\times10^{6}\ \text{Pa}}{1025\times9.8}$.`],
          teach: 'Gauge pressure in a liquid is ρgh, so depth is gauge pressure divided by ρg.',
          explain: t`$h = \dfrac{${tn(pg * 1e6)}}{1025\times9.8} = ${tn(h)}\ \text{m}$ — about 10 m for every 0.1 MPa.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 350], y: [0, 3.6], xlabel: 'depth (m)', ylabel: 'gauge p (MPa)',
              curves: [{ fn: `${RHO.seawater * G}*x/1e6`, color: 'teal', label: 'seawater', labelAt: 250, labelDy: 14 }, { fn: `${1000 * G}*x/1e6`, color: 'ink3', dash: true, width: 1.6, label: 'fresh water', labelAt: 300, labelDx: -40, labelDy: -14 }],
            },
            caption: 'Gauge pressure against depth: a straight line through the origin with slope ρg. Seawater’s line is 2.5% steeper than fresh water’s.',
          },
        };
      },
    }),
    num({
      id: 'manometer', difficulty: 2,
      gen(r) {
        const dh = r.pick([12.0, 18.5, 24.0, 31.0]);   // cm of mercury
        const pg = (RHO.mercury * G * dh) / 100 / 1000;   // kPa
        return {
          prompt: t`A mercury U-tube manometer ($13\,600\ \text{kg/m}^3$) is connected to a gas tank; the other arm is open to the air at $101.3$ kPa. The mercury stands ${dh.toFixed(1)} cm higher in the open arm. What is the **absolute** pressure of the gas?`,
          answer: PA + pg, units: 'kPa', tol: { rel: 0.005 },
          errors: [
            { value: pg, feedback: 'That is the gauge pressure, the excess over the air’s. Add the 101.3 kPa pressing on the open arm.' },
            { value: PA - pg, feedback: 'The mercury is pushed *down* in the gas’s arm, so the gas is at a higher pressure than the air, not lower.' },
            { value: PA + pg * 100, feedback: 'Convert centimetres to metres before multiplying.' },
          ],
          hints: [t`At the level of the lower mercury surface, the pressures in the two arms are equal: $p_\text{gas} = p_\text{atm} + \rho g\,\Delta h$.`, t`$\rho g\,\Delta h = 13\,600\times9.8\times${tn(dh / 100)}\ \text{Pa}$.`],
          teach: 'In a manometer, the liquid level difference measures the pressure difference: Δp = ρgΔh.',
          explain: t`$p = 101.3 + \dfrac{13\,600\times9.8\times${tn(dh / 100)}}{1000} = 101.3 + ${tn(pg)} = ${tn(PA + pg, 4)}\ \text{kPa}$.`,
          visual: tank({ scene: 'utube', fluid: 'mercury', p: (PA + pg) * 1000, patm: PA * 1000, values: false }, 'The manometer: the gas pushes the mercury down in its arm. Heights to scale; widths not.'),
        };
      },
    }),
    num({
      id: 'barometer', difficulty: 2,
      gen(r) {
        const [where, p, g, note] = r.pick([
          ['on Mars, where the mean surface pressure is about 610 Pa and $g = 3.71\\ \\text{m/s}^2$', 610, 3.71, 'Mars'],
          ['at the summit of Mount Everest, where the air pressure is about 33.7 kPa ($g = 9.8\\ \\text{m/s}^2$)', 33700, G, 'Everest'],
          ['in Denver, 1.6 km up, where the air pressure is about 83.4 kPa ($g = 9.8\\ \\text{m/s}^2$)', 83400, G, 'Denver'],
        ]);
        const h = (p / (RHO.mercury * g)) * 1000;   // mm
        const errors = [{ value: (p / (1000 * g)) * 1000, feedback: 'That is a water column. The barometer holds mercury, 13 600 kg/m³.' }];
        if (note === 'Mars') errors.push({ value: (p / (RHO.mercury * G)) * 1000, feedback: 'Use Mars’s gravity, 3.71 m/s², not Earth’s.' });
        return {
          prompt: t`How tall a column would a mercury barometer ($13\,600\ \text{kg/m}^3$) hold up ${where}? Give it in mm.`,
          answer: h, units: 'mm', tol: { rel: 0.005 },
          errors,
          hints: [t`With vacuum above the column, the air’s pressure on the dish holds it up: $p_\text{atm} = \rho g h$.`, t`$h = \dfrac{p}{\rho g}$; convert metres to millimetres at the end.`],
          teach: 'A barometer’s column height is the air pressure divided by ρg.',
          explain: t`$h = \dfrac{${tn(p)}}{13\,600\times${g}} = ${tn(h / 1000)}\ \text{m} = ${tn(h)}\ \text{mm}$, against 760 mm at sea level on Earth.`,
          visual: tank({ scene: 'utube', mode: 'barometer', fluid: 'mercury', patm: p, g, values: false }, 'A mercury barometer: vacuum above the column, the air pressing on the dish. Heights to scale; widths not.'),
        };
      },
    }),
    num({
      id: 'hydraulic', difficulty: 2,
      gen(r) {
        const M = r.pick([900, 1200, 1500]), d1 = r.pick([2.0, 2.5, 3.0]), d2 = r.pick([12, 15, 20]);
        const W = M * G, F1 = W * (d1 / d2) ** 2;
        const x = (v) => +v.toFixed(3);
        return {
          prompt: t`A hydraulic lift has a small piston ${d1.toFixed(1)} cm across and a large one ${d2} cm across, both at the same height. What force on the small piston holds up a ${M} kg car on the large one? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: F1, units: 'N', tol: { rel: 0.01 },
          errors: [
            { value: W * (d1 / d2), feedback: 'Areas go as the square of the diameter: square the ratio of the diameters.' },
            { value: W * (d2 / d1) ** 2, feedback: 'The small piston needs a *smaller* force: the same pressure acts on a smaller area.' },
          ],
          hints: [t`Pascal: the pressure under both pistons is the same, so $\dfrac{F_1}{A_1} = \dfrac{F_2}{A_2}$.`, t`$F_1 = Mg\left(\dfrac{d_1}{d_2}\right)^2$.`],
          teach: 'A pressure applied to an enclosed liquid reaches every part of it, so F₁/A₁ = F₂/A₂ at the same height.',
          explain: t`$F_1 = (${M}\times9.8)\left(\dfrac{${d1.toFixed(1)}}{${d2}}\right)^2 = ${tn(W)}\times${tn((d1 / d2) ** 2)} = ${tn(F1)}\ \text{N}$. The small piston must move ${s3((d2 / d1) ** 2)} times as far as the car rises — the work in equals the work out.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-1, 9], y: [-0.4, 4.2], xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(0, 1, 0, 2.2, 'accent', 0.35), box(1, 5, 0, 0.6, 'accent', 0.35), box(5, 8, 0, 2.2, 'accent', 0.35), box(-0.05, 1.05, 2.2, 2.42, 'ink3', 0.9), box(4.95, 8.05, 2.2, 2.42, 'ink3', 0.9), box(5.4, 7.6, 2.42, 3.2, 'warn', 0.6)],
              curves: [seg([0, 0], [8, 0]), seg([0, 0], [0, 2.6]), seg([1, 0.6], [1, 2.6]), seg([1, 0.6], [5, 0.6]), seg([5, 0.6], [5, 2.6]), seg([8, 0], [8, 2.6])],
              arrows: [{ from: [0.5, 3.6], to: [0.5, 2.5], color: 'accent' }, { from: [6.5, 4.1], to: [6.5, 3.25], color: 'ink2' }],
              points: [label(0.75, 3.75, 'F₁ = ?', 'accent'), label(-0.9, 1.2, `${d1.toFixed(1)} cm`, 'ink2'), label(8.15, 1.2, `${d2} cm`, 'ink2'), label(4.2, 3.75, `car, ${M} kg`, 'warn'), label(6.65, 3.8, 'Mg', 'ink2')],
            },
            caption: 'The lift in cross-section: one enclosed liquid under both pistons. Not to scale.',
          },
        };
      },
    }),
    num({
      id: 'tank-accel', difficulty: 3,
      gen(r) {
        const h = r.pick([12, 15, 18, 22]), pu = r.pick([250, 300, 350]), n = r.pick([1.0, 1.5, 2.0, 2.5]);
        const a = n * G, p = pu + (RHO.lox * (G + a) * h) / 1000;
        return {
          prompt: t`During ascent a rocket accelerates upward at ${n.toFixed(1)}$g$. Inside its tanks the propellant presses down as if gravity were $g + a$ — the tank floor must push each kilogram up harder, just as an elevator floor pushes you harder as it speeds up. The liquid oxygen ($1141\ \text{kg/m}^3$) stands ${h} m above the tank’s outlet, under ullage gas at ${pu} kPa. What is the pressure at the outlet?`,
          answer: p, units: 'kPa', tol: { rel: 0.005 },
          errors: [
            { value: pu + (RHO.lox * G * h) / 1000, feedback: t`That is the pressure on the launch pad. In flight the liquid presses as if gravity were $g + a = ${tn(G + a)}\ \text{m/s}^2$.` },
            { value: pu + (RHO.lox * a * h) / 1000, feedback: t`Gravity has not switched off: the effective value is $g + a$, not $a$ alone.` },
            { value: (RHO.lox * (G + a) * h) / 1000, feedback: 'Add the ullage pressure acting on the liquid’s surface.' },
          ],
          hints: [t`Use $p = p_0 + \rho(g + a)h$ with $p_0$ the ullage pressure.`, t`$g + a = 9.8 + ${tn(a)} = ${tn(G + a)}\ \text{m/s}^2$; $\rho(g + a)h = 1141\times${tn(G + a)}\times${h}\ \text{Pa}$.`],
          teach: 'In a vehicle accelerating upward at a, liquid pressure grows with depth as ρ(g + a)h.',
          explain: t`$p = ${pu} + \dfrac{1141\times${tn(G + a)}\times${h}}{1000} = ${pu} + ${tn((RHO.lox * (G + a) * h) / 1000)} = ${tn(p)}\ \text{kPa}$ — the pumps see more pressure in flight than on the pad, and it changes as the thrust and the propellant level change.`,
          visual: tank({ scene: 'vessels', closed: true, fluid: 'lox', H: h, depth: h, p0: pu * 1000, g: G + a, graph: false, values: false }, 'The tank cut open: ullage gas above liquid oxygen, the probe at the outlet. Not to scale across.'),
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-dam', difficulty: 2,
      prompt: t`Two dams are each 30 m high and hold back water 30 m deep at the dam. Lake A stretches 1 km behind its dam; lake B stretches 10 km. Compare the pressure of the water at the base of the two dams.`,
      choices: ['The same', 'Ten times as great at dam B', 'Greater at dam A: less water spreads the load less', t`$\sqrt{10}$ times as great at dam B`],
      answer: 0,
      why: {
        1: 'Lake B holds ten times as much water, but pressure depends only on the depth of the water against the dam.',
        2: 'Pressure does not depend on how much water there is, more or less — only on the depth.',
        3: 'No power of the length appears in p = p₀ + ρgh at all.',
      },
      hints: ['What does the pressure at the base depend on?'],
      teach: 'Pressure in a liquid depends on depth alone, not on the volume of liquid behind a wall.',
      explain: t`At the base, both see $p_\text{atm} + \rho g h$ with $h = 30$ m: about $101 + 294 = 395$ kPa. A dam’s design load is set by the depth of water against it, not the size of the lake.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.3, 10.8], y: [-0.5, 5.4], xlabel: '', ylabel: '', axes: false, grid: false,
          shade: [box(9.0, 10, 3.2, 4.4, 'accent', 0.35), box(0, 10, 0, 1.2, 'accent', 0.35)],
          curves: [seg([10, 3.1], [10, 4.6], { color: 'ink', width: 5 }), seg([10, -0.1], [10, 1.4], { color: 'ink', width: 5 }), seg([9.0, 3.2], [10, 3.2], { color: 'ink3' }), seg([0, 0], [10, 0], { color: 'ink3' })],
          points: [label(7.4, 4.9, 'A: 1 km of lake', 'ink2'), label(0.1, 1.7, 'B: 10 km of lake', 'ink2'), label(10.2, 3.8, '30 m', 'ink2'), label(10.2, 0.6, '30 m', 'ink2')],
        },
        caption: 'Side views of the two lakes, to the same scale along their length; depths exaggerated. The dams are on the right.',
      },
    }),
    num({
      id: 'cp-double', difficulty: 2,
      gen(r) {
        const [k, word] = r.pick([[2, 'twice'], [3, 'three times']]), [name, rho] = r.pick([['fresh water', 1000], ['seawater', RHO.seawater]]);
        const h = ((k - 1) * PA * 1000) / (rho * G);
        return {
          prompt: t`At what depth in ${name} ($${tn(rho)}\ \text{kg/m}^3$) is the **absolute** pressure ${word} the atmospheric pressure of $101.3$ kPa at the surface? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: h, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (k * PA * 1000) / (rho * G), feedback: t`The surface already has one atmosphere on it: the water need only add ${k - 1 === 1 ? 'one more' : `${k - 1} more`}.` }],
          hints: [t`$p_\text{atm} + \rho g h = ${k}\,p_\text{atm}$.`],
          teach: 'Absolute pressure is the surface pressure plus ρgh.',
          explain: t`$\rho g h = ${k - 1 === 1 ? '' : k - 1}p_\text{atm}$, so $h = \dfrac{${tn((k - 1) * PA * 1000)}}{${tn(rho)}\times9.8} = ${tn(h)}\ \text{m}$.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 32], y: [0, 4], xticks: 0.001, yticks: 0.001, xlabel: 'depth', ylabel: 'absolute p',
              curves: [{ fn: `1 + x/10.33`, color: 'accent' }],
              hlines: [{ y: 1, label: 'p_atm' }, { y: k, label: `${k} p_atm`, color: 'gold' }],
            },
            caption: 'Absolute pressure against depth (no numbers): it starts at the atmosphere’s value at the surface and climbs in a straight line.',
          },
        };
      },
    }),
    num({
      id: 'cp-pump', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([6, 8, 10]), preq = r.pick([350, 400, 450]), n = r.pick([0, 1.0]);
        const geff = G * (1 + n), pu = preq - (RHO.lox * geff * h) / 1000;
        const when = n === 0 ? 'with the rocket sitting on the pad' : 'while the rocket accelerates upward at 1.0$g$';
        const errors = [{ value: preq, feedback: 'The liquid above the inlet adds pressure of its own: the gas need only make up the rest.' }];
        if (n > 0) errors.push({ value: preq - (RHO.lox * G * h) / 1000, feedback: t`In flight the liquid presses as if gravity were $g + a = 19.6\ \text{m/s}^2$.` });
        return {
          prompt: t`A turbopump must see at least ${preq} kPa (absolute) at its inlet, or the liquid oxygen boils inside it (cavitation). The LOX ($1141\ \text{kg/m}^3$) stands ${h} m above the inlet. What is the lowest ullage pressure that keeps the inlet at ${preq} kPa ${when}? ($g = 9.8\ \text{m/s}^2$; ignore losses in the feed line.)`,
          answer: pu, units: 'kPa', tol: { rel: 0.005 },
          errors,
          hints: [t`$p_\text{inlet} = p_\text{ullage} + \rho g_\text{eff} h$; solve for $p_\text{ullage}$.`, 'Accelerating upward, g_eff = g + a.'],
          teach: 'The ullage gas only has to supply the inlet pressure the liquid head does not.',
          explain: t`$\rho g_\text{eff} h = 1141\times${tn(geff)}\times${h} = ${tn((RHO.lox * geff * h) / 1000)}$ kPa, so $p_\text{ullage} = ${preq} - ${tn((RHO.lox * geff * h) / 1000)} = ${tn(pu)}\ \text{kPa}$. Real feed lines lose some pressure to friction, so real tanks carry a margin above this.`,
          visual: tank({ scene: 'vessels', closed: true, fluid: 'lox', H: h, depth: h, p0: pu * 1000, g: geff, graph: false, values: false }, 'The LOX tank cut open; the probe marks the pump inlet at the bottom. Not to scale across.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §14.2 Measuring Pressure', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-2-measuring-pressure' },
    { label: 'OpenStax University Physics Vol. 1, §14.3 Pascal’s Principle and Hydraulics', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-3-pascals-principle-and-hydraulics' },
  ],
});
