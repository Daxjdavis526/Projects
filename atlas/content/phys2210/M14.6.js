// Viscosity (preview): fluid friction, the parabolic profile of slow pipe
// flow (Poiseuille), its R⁴ law, and the Reynolds number that says when
// smooth flow breaks into turbulence.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, seg, box, label } from './_fluids.js';

const t = String.raw;
const r3 = (v) => +(+v).toFixed(4);

// water's viscosity against temperature, mPa·s (CRC Handbook values)
const WATER_ETA = [[0, 1.792], [10, 1.306], [20, 1.002], [30, 0.797], [40, 0.653], [50, 0.547], [60, 0.466], [70, 0.404], [80, 0.354], [90, 0.315], [100, 0.282]];

// the Reynolds number on a log scale, with the pipe-flow regimes shaded
function regimes(caption) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, 8], y: [0, 1], xlabel: 'log₁₀ Re  (each step is ×10)', ylabel: '', yticks: 0.001,
      shade: [box(0, 3.36, 0, 1, 'good', 0.2), box(3.36, 3.6, 0, 1, 'gold', 0.35), box(3.6, 8, 0, 1, 'bad', 0.18)],
      points: [label(0.6, 0.55, 'laminar', 'good'), label(3.0, 0.88, 'transition', 'gold'), label(5.2, 0.55, 'turbulent', 'bad')],
    },
    caption: caption ?? 'Flow in a round pipe: smooth (laminar) below Re ≈ 2300, turbulent above about 4000, and either in between. The boundaries are typical, not exact — very smooth, quiet pipes stay laminar to higher Re.',
  };
}

// two pipes seen from the side with their speed profiles: radius R (top) and a larger one (bottom)
function twoPipes(small, big, caption) {
  const c = 1.6;   // the same pressure gradient and viscosity: centre speed ∝ radius²
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.3, 2.4], y: [-1.3, 2.9], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
      shade: [{ fn: `${2.2 + small}`, lower: `${2.2 - small}`, from: -0.3, to: 2.4, color: 'accent', alpha: 0.18 }, { fn: `${big}`, lower: `${-big}`, from: -0.3, to: 2.4, color: 'accent', alpha: 0.18 }],
      curves: [
        seg([-0.3, 2.2 + small], [2.4, 2.2 + small]), seg([-0.3, 2.2 - small], [2.4, 2.2 - small]), seg([-0.3, big], [2.4, big]), seg([-0.3, -big], [2.4, -big]),
        { param: [`${c}*(${small * small} - t^2)`, `2.2 + t`], t: [-small, small], color: 'gold', width: 2.4 },
        { param: [`${c}*(${big * big} - t^2)`, 't'], t: [-big, big], color: 'gold', width: 2.4 },
      ],
      points: [label(-0.25, 2.2 + small + 0.18, 'narrow pipe', 'ink2'), label(-0.25, big + 0.18, 'wide pipe', 'ink2')],
    },
    caption,
  };
}

// one pipe seen from the side with its parabolic speed profile and a few speed arrows
function onePipe(caption) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.3, 2.6], y: [-1.05, 1.05], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
      shade: [{ fn: '0.8', lower: '-0.8', from: -0.3, to: 2.6, color: 'accent', alpha: 0.18 }],
      curves: [seg([-0.3, 0.8], [2.6, 0.8]), seg([-0.3, -0.8], [2.6, -0.8]), { param: ['2.2*(0.64 - t^2)/0.64*0.9', 't'], t: [-0.8, 0.8], color: 'gold', width: 2.4 }],
      arrows: [-0.6, -0.3, 0, 0.3, 0.6].map((y) => ({ from: [0, y], to: [r3(1.98 * (0.64 - y * y) / 0.64), y], color: 'accent' })),
      points: [label(1.0, 0.92, 'wall: speed zero', 'ink2'), label(2.0, 0.12, 'fastest on the axis', 'gold')],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2210.M14.6',
  title: 'Viscosity (preview)',
  minutes: 10, difficulty: 2,
  intro: t`Real fluids resist being sheared: neighbouring layers moving at different speeds drag on each other. That internal friction is **viscosity**, $\eta$. Fluid touching a wall does not slide along it (the *no-slip* condition), so in a pipe the flow is fastest on the axis and zero at the wall, and it takes a steady pressure drop just to keep it moving — the loss Bernoulli’s equation leaves out. For slow, smooth (**laminar**) flow in a round pipe, the profile is a parabola and the flow rate is

$$Q = \frac{\pi R^4\,\Delta p}{8\eta L}, \qquad \text{valid while}\quad \mathrm{Re} = \frac{\rho v D}{\eta} \lesssim 2000$$

The **Reynolds number** compares the fluid’s momentum with its viscous drag; above a few thousand the flow in a pipe turns turbulent and this neat law no longer holds.`,
  symbols: [
    { tex: '\\eta', text: 'the (dynamic) viscosity, in Pa·s (Greek *eta*). Water at 20 °C: $1.0\\times10^{-3}$; air: $1.8\\times10^{-5}$; motor oil: about 0.2; honey: about 10' },
    { tex: 'Q', text: 'the volume flow rate, in m³/s' },
    { tex: 'R', text: 'the pipe’s inner radius, in m — note the fourth power' },
    { tex: '\\Delta p', text: 'the pressure drop along the pipe, in Pa: what it takes to push the fluid through' },
    { tex: 'L', text: 'the pipe’s length, in m' },
    { tex: '\\mathrm{Re}', text: 'the Reynolds number, a pure number: $\\rho$ the density, $v$ the mean speed, $D = 2R$ the diameter' },
  ],
  why: 'Viscosity sets the pressure a pump must supply to overcome friction in its lines, and the Reynolds number tells an engineer whether a flow is smooth or turbulent — which changes drag, mixing and heat transfer completely.',
  visual: {
    type: 'graph',
    title: 'The parabola in the pipe',
    lead: t`A round pipe seen from the side, radius $R$, with liquid pushed through it by a pressure gradient $\Delta p/L$. Gold: the speed at each distance from the axis. The readouts give the flow rate and the Reynolds number.`,
    tasks: [
      'Double the radius: the centre speed grows 4 times and the flow rate 16 times.',
      'Make the liquid 10 times more viscous: every speed falls 10 times.',
      'Push hard through a wide pipe until Re passes about 2300: the warning appears, because a real flow there turns turbulent.',
    ],
    params: {
      // the pipe's axis is drawn at height 5 so that the speed axis runs along the bottom
      aspect: 'wide', x: [0, 0.45], y: [0, 10], yticks: 0.001, xlabel: 'speed (m/s)', ylabel: '',
      sliders: [
        { key: 'R', label: 'Radius $R$', min: 1, max: 4, step: 0.1, value: 2, unit: '\\mathrm{mm}', explain: 'The pipe’s inner radius.' },
        { key: 'G', label: 'Pressure gradient $\\Delta p/L$', min: 20, max: 200, step: 5, value: 100, unit: '\\mathrm{Pa/m}', explain: 'How hard the liquid is pushed: the pressure drop per metre of pipe.' },
        { key: 'eta', label: 'Viscosity $\\eta$', min: 1, max: 10, step: 0.1, value: 1, unit: '\\mathrm{mPa\\,s}', explain: 'Water at 20 °C is 1.0 mPa·s; a light oil is about 10 times thicker.' },
      ],
      curves: [{ param: ['G*(R^2 - t^2)/(4000*eta)', '5 + t'], t: ['-R', 'R'], color: 'gold', width: 2.6 }, { param: ['0', '5 + t'], t: ['-R', 'R'], color: 'ink3', width: 1 }],
      arrows: [-0.8, -0.5, -0.2, 0.2, 0.5, 0.8].map((f) => ({ from: [0, `5 + ${f}*R`], to: [`G*(R^2 - (${f}*R)^2)/(4000*eta)`, `5 + ${f}*R`], color: 'accent' })),
      hlines: [{ y: '5 + R', label: 'wall' }, { y: '5 - R', label: 'wall' }, { y: 5, label: 'axis', color: 'ink4' }],
      points: [{ x: 0.12, y: 9.6, r: 0.01, color: 'bad', label: 'Re > 2300: a real flow here is turbulent — this profile no longer holds', when: 'step(G*R^3/(4*eta^2) - 2300)' }],
      readouts: [
        { label: 'centre speed', expr: 'G*R^2/(4000*eta)', unit: '\\mathrm{m/s}', digits: 3 },
        { label: 'mean speed', expr: 'G*R^2/(8000*eta)', unit: '\\mathrm{m/s}', digits: 3 },
        { label: 'flow rate $Q$', expr: 'pi*R^4*G/(8000*eta)', unit: '\\mathrm{mL/s}', digits: 3 },
        { label: '$\\mathrm{Re}$ (water-like density)', expr: 'G*R^3/(4*eta^2)', digits: 3 },
      ],
    },
    caption: 'Steady laminar (Poiseuille) flow of a liquid of density 1000 kg/m³ in a long straight pipe, far from its ends. The speed is zero at the wall and greatest on the axis; the mean is half the centre speed. Speeds beyond the right edge run off the chart.',
  },
  example: {
    prompt: t`Oil ($\rho = 900\ \text{kg/m}^3$, $\eta = 0.10\ \text{Pa·s}$) is pushed through a pipe $3.0$ m long with an inner radius of $5.0$ mm by a pressure difference of $40$ kPa. Find the flow rate, and check that the flow is laminar.`,
    visual: onePipe('The parabolic speed profile in the pipe, seen from the side. Not to scale.'),
    steps: [
      { label: 'Poiseuille', text: t`$Q = \dfrac{\pi R^4\,\Delta p}{8\eta L} = \dfrac{\pi(5.0\times10^{-3})^4(4.0\times10^{4})}{8(0.10)(3.0)} = 3.27\times10^{-5}\ \text{m}^3/\text{s}$ — about 33 mL every second.` },
      { label: 'Mean speed', text: t`$v = \dfrac{Q}{\pi R^2} = \dfrac{3.27\times10^{-5}}{7.85\times10^{-5}} = 0.42\ \text{m/s}$.` },
      { label: 'Reynolds number', text: t`$\mathrm{Re} = \dfrac{\rho v D}{\eta} = \dfrac{(900)(0.42)(0.010)}{0.10} = 38$ — far below 2000: laminar, so Poiseuille’s law applies. ✓` },
      { label: 'The same pipe with water', text: t`Water is 100 times less viscous ($10^{-3}$ Pa·s), so Poiseuille would predict 100 times the flow, a mean speed of 42 m/s and $\mathrm{Re} \approx 4\times10^{5}$ — hugely turbulent. The law fails there, and the real flow is far smaller. Always check Re.` },
    ],
    answer: t`$Q = 3.3\times10^{-5}\ \text{m}^3/\text{s}$ (33 mL/s); $\mathrm{Re} \approx 38$, laminar.`,
  },
  practice: [
    num({
      id: 'plates', difficulty: 1,
      gen(r) {
        const A = r.pick([0.1, 0.2, 0.5]), v = r.pick([0.2, 0.3, 0.5]), d = r.pick([0.5, 1.0, 2.0]), eta = r.pick([0.1, 0.25, 0.4]);
        const F = (eta * A * v) / (d / 1000);
        return {
          prompt: t`A flat plate of area ${A} m² slides at a steady ${v} m/s over a film of oil ${d.toFixed(1)} mm thick, whose viscosity is ${eta} Pa·s. The plate below is fixed. What force keeps the plate moving? (Viscous force: $F = \eta A v/d$.)`,
          answer: F, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: eta * A * v * d, feedback: 'The film thickness divides: a thinner film is sheared harder.' }, { value: (eta * A * v) / d, feedback: 'Convert millimetres to metres first.' }],
          hints: [t`$F = \eta A v/d$ with $d$ in metres.`],
          teach: 'Viscosity is the shear force per area for each unit of speed difference across each unit of thickness: F = ηAv/d.',
          explain: t`$F = \dfrac{${eta}\times${A}\times${v}}{${tn(d / 1000)}} = ${tn(F)}\ \text{N}$. Halve the film and the force doubles: that is why bearings run on very thin films only when they have to.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-0.4, 3.4], y: [-0.35, 1.35], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(0, 3, 0, 1, 'warn', 0.18), box(0, 3, -0.18, 0, 'ink3', 0.8), box(0.6, 2.6, 1, 1.12, 'accent', 0.8)],
              arrows: [0.25, 0.5, 0.75].map((y) => ({ from: [0.3, y], to: [r3(0.3 + 1.6 * y), y], color: 'gold' })).concat([{ from: [1.6, 1.22], to: [3.0, 1.22], color: 'accent' }]),
              curves: [seg([0.3, 0], [1.9, 1], { color: 'gold', dash: true })],
              points: [label(2.0, -0.28, 'fixed plate', 'ink2'), label(2.2, 0.55, `oil, ${d.toFixed(1)} mm`, 'warn'), label(0.0, 1.3, 'moving plate', 'accent')],
            },
            caption: 'The oil film between the plates, much enlarged: its speed grows steadily from zero at the fixed plate to the moving plate’s speed (no slip at either surface).',
          },
        };
      },
    }),
    mcq({
      id: 'unit', difficulty: 1,
      prompt: t`From $F = \eta A v/d$, what are the SI units of the viscosity $\eta$?`,
      choices: [t`Pa·s`, t`Pa`, t`$\text{m}^2/\text{s}$`, t`$\text{kg/m}^3$`],
      answer: 0,
      why: {
        1: 'A pascal is a force per area; viscosity is force per area per (speed/thickness), which leaves a second over.',
        2: t`$\text{m}^2/\text{s}$ is the unit of the *kinematic* viscosity, $\eta/\rho$ — a different quantity.`,
        3: 'That is density.',
      },
      hints: [t`$\eta = \dfrac{F/A}{v/d}$: a pressure divided by (m/s ÷ m).`],
      teach: 'Viscosity is a shear stress per rate of shearing: Pa divided by 1/s, so Pa·s.',
      explain: t`$\eta = \dfrac{F/A}{v/d}$ has units $\dfrac{\text{Pa}}{(\text{m/s})/\text{m}} = \text{Pa}\cdot\text{s}$ (equivalently kg/(m·s)). Water at 20 °C has $\eta = 1.0\times10^{-3}$ Pa·s, often written 1.0 mPa·s.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.4, 3.4], y: [-0.35, 1.35], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          shade: [box(0, 3, 0, 1, 'warn', 0.18), box(0, 3, -0.18, 0, 'ink3', 0.8), box(0.6, 2.6, 1, 1.12, 'accent', 0.8)],
          arrows: [0.25, 0.5, 0.75].map((y) => ({ from: [0.3, y], to: [r3(0.3 + 1.6 * y), y], color: 'gold' })).concat([{ from: [1.6, 1.22], to: [3.0, 1.22], color: 'accent' }]),
          points: [label(2.3, 0.5, 'd', 'warn'), label(3.05, 1.22, 'v', 'accent'), label(1.2, -0.28, 'area A of contact', 'ink2')],
        },
        caption: 'A plate dragged over a fluid layer of thickness d at speed v. Enlarged; not to scale.',
      },
    }),
    num({
      id: 'r4', difficulty: 2,
      gen(r) {
        const pct = r.pick([10, 20, 25, 30]), f = 1 - pct / 100;
        return {
          prompt: t`Deposits narrow a pipe’s inner radius by ${pct}%, while the pressure drop, the length and the fluid stay the same and the flow stays laminar. By what factor does the flow rate change? (Give the new flow divided by the old.)`,
          answer: f ** 4, tol: { rel: 0.005 },
          errors: [{ value: f, feedback: t`Poiseuille’s law has $R^4$, not $R$: the factor is $(${f})^4$.` }, { value: f ** 2, feedback: t`That would follow the area, $R^2$. Poiseuille’s law has $R^4$: the speed drops as well as the area.` }],
          hints: [t`$Q \propto R^4$ with everything else fixed.`, t`New $Q$ / old $Q$ $= (${f})^4$.`],
          teach: 'In laminar pipe flow Q ∝ R⁴: the area shrinks as R², and the mean speed falls as R² too.',
          explain: t`$(${f})^4 = ${tn(f ** 4)}$: a ${pct}% narrower pipe carries only ${Math.round(100 * f ** 4)}% of the flow. Half of the $R^4$ is the smaller area; the other half is that every layer is now closer to a wall that holds it back.`,
          visual: twoPipes(0.55, 0.75, 'Speed profiles in two pipes under the same pressure gradient: the narrower one has less area and slower flow. Not to scale.'),
        };
      },
    }),
    num({
      id: 'poiseuille', difficulty: 2,
      gen(r) {
        const R = r.pick([0.5, 1.0, 1.5]), L = r.pick([0.5, 1.0, 2.0]), dp = r.pick([1, 2, 5]);   // mm, m, kPa
        const eta = 1.0e-3, Q = (Math.PI * (R / 1000) ** 4 * dp * 1000) / (8 * eta * L);
        return {
          prompt: t`Water ($\eta = 1.0\times10^{-3}$ Pa·s) flows smoothly through a tube ${L.toFixed(1)} m long with an inner radius of ${R.toFixed(1)} mm, under a pressure difference of ${dp} kPa. What is the flow rate, in mL/s?`,
          answer: Q * 1e6, units: 'mL/s', tol: { rel: 0.005 },
          errors: [{ value: (Math.PI * (R / 500) ** 4 * dp * 1000) / (8 * eta * L) * 1e6, feedback: 'R is the radius, not the diameter.' }, { value: (Math.PI * (R / 1000) ** 4 * dp * 1000) / (eta * L) * 1e6, feedback: 'Poiseuille’s law has an 8 in the denominator.' }],
          hints: [t`$Q = \dfrac{\pi R^4 \Delta p}{8\eta L}$, everything in SI.`, t`$R = ${tn(R / 1000)}$ m, $\Delta p = ${dp * 1000}$ Pa; $1\ \text{m}^3 = 10^{6}$ mL.`],
          teach: 'Poiseuille’s law gives the laminar flow rate through a round pipe: Q = πR⁴Δp/(8ηL).',
          explain: t`$Q = \dfrac{\pi(${tn(R / 1000)})^4(${dp * 1000})}{8(1.0\times10^{-3})(${L.toFixed(1)})} = ${tn(Q)}\ \text{m}^3/\text{s} = ${tn(Q * 1e6)}\ \text{mL/s}$. (Check: the mean speed is ${tn(Q / (Math.PI * (R / 1000) ** 2))} m/s, so Re $= ${tn((1000 * (Q / (Math.PI * (R / 1000) ** 2)) * (2 * R / 1000)) / eta)}$${(1000 * (Q / (Math.PI * (R / 1000) ** 2)) * (2 * R / 1000)) / eta < 2000 ? ' — laminar, as assumed.' : ' — too high: in reality this flow would be turbulent and smaller.'})`,
          visual: onePipe('The laminar speed profile in the tube, seen from the side. Not to scale.'),
        };
      },
    }),
    num({
      id: 'reynolds', difficulty: 2,
      gen(r) {
        const v = r.pick([0.05, 0.2, 1.5]), D = r.pick([1, 2.5, 5]);   // m/s, cm
        const Re = (1000 * v * (D / 100)) / 1.0e-3;
        const regime = Re < 2000 ? 'laminar' : Re > 4000 ? 'turbulent' : 'in the transition range, laminar or turbulent';
        return {
          prompt: t`Water ($\rho = 1000\ \text{kg/m}^3$, $\eta = 1.0\times10^{-3}$ Pa·s) flows at a mean speed of ${v} m/s through a pipe ${D} cm in diameter. What is the Reynolds number?`,
          answer: Re, tol: { rel: 0.005 },
          errors: [{ value: (1000 * v * (D / 200)) / 1.0e-3, feedback: 'Use the diameter, not the radius, in Re = ρvD/η.' }],
          hints: [t`$\mathrm{Re} = \dfrac{\rho v D}{\eta}$ with $D$ in metres.`],
          teach: 'The Reynolds number ρvD/η compares inertia with viscous drag: small means smooth, large means turbulent.',
          explain: t`$\mathrm{Re} = \dfrac{1000\times${v}\times${tn(D / 100)}}{1.0\times10^{-3}} = ${tn(Re)}$: ${regime}.`,
          visual: regimes(),
        };
      },
    }),
    mcq({
      id: 'lox-line', difficulty: 2,
      prompt: t`Liquid oxygen ($1141\ \text{kg/m}^3$, viscosity about $2\times10^{-4}$ Pa·s) flows at $10$ m/s through a feed line $15$ cm across. Is the flow laminar or turbulent?`,
      choices: ['Turbulent: Re is about 9 million', 'Laminar: liquids in pipes flow smoothly', 'Laminar: liquid oxygen’s low viscosity lets it slide smoothly', 'It cannot be told without the length of the line'],
      answer: 0,
      why: {
        1: 'Whether a flow is smooth depends on the Reynolds number, not on being a liquid. Slow syrup in a thin tube is laminar; fast water in a wide pipe is not.',
        2: 'Low viscosity means *less* damping of disturbances: a smaller η makes Re larger and the flow more turbulent, not less.',
        3: 'Re uses a speed, a width, a density and a viscosity — not the length.',
      },
      hints: [t`Compute $\mathrm{Re} = \rho v D/\eta$.`, 'Compare it with about 2000.'],
      teach: 'Fast flows of thin liquids through wide pipes have enormous Reynolds numbers: they are turbulent.',
      explain: t`$\mathrm{Re} = \dfrac{1141\times10\times0.15}{2\times10^{-4}} \approx 8.6\times10^{6}$ — thousands of times past the laminar limit. Real propellant lines are fully turbulent, and their friction losses come from empirical friction factors, not Poiseuille’s law.`,
      visual: regimes('The pipe-flow regimes on a log scale of Re: laminar below about 2300, turbulent above about 4000.'),
    }),
    num({
      id: 'warm-water', difficulty: 2,
      gen(r) {
        const [T1, e1] = r.pick([[10, 1.306], [20, 1.002]]), [T2, e2] = r.pick([[60, 0.466], [80, 0.354], [100, 0.282]]);
        return {
          prompt: t`The graph shows the viscosity of water against temperature. Water is pushed through a thin tube by a fixed pressure difference, flowing smoothly. By what factor does the flow rate grow when the water is heated from ${T1} °C to ${T2} °C?`,
          answer: e1 / e2, tol: { rel: 0.01 },
          errors: [{ value: e2 / e1, feedback: 'Thinner, less viscous water flows faster: Q ∝ 1/η, so the factor is the cold viscosity over the hot one.' }],
          hints: [t`Poiseuille: $Q \propto 1/\eta$ with everything else fixed.`, t`Read $\eta$ at ${T1} °C and at ${T2} °C from the graph and divide.`],
          teach: 'A liquid’s viscosity falls steeply as it warms, and laminar flow rate goes as 1/η.',
          explain: t`$\dfrac{Q_\text{hot}}{Q_\text{cold}} = \dfrac{\eta(${T1}\,°\text{C})}{\eta(${T2}\,°\text{C})} = \dfrac{${e1}}{${e2}} = ${tn(e1 / e2)}$. (Gases do the opposite: their viscosity *rises* with temperature.)`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 105], y: [0, 2], xlabel: 'temperature (°C)', ylabel: 'η (mPa·s)',
              curves: WATER_ETA.slice(1).map(([T, e], k) => ({ param: [`${WATER_ETA[k][0]} + t*${T - WATER_ETA[k][0]}`, `${WATER_ETA[k][1]} + t*${r3(e - WATER_ETA[k][1])}`], t: [0, 1], color: 'accent', width: 2 })),
              points: WATER_ETA.map(([T, e]) => ({ x: T, y: e, color: 'accent', r: 3.5, ...([T1, T2].includes(T) ? { label: String(e), labelDy: -12 } : {}) })),
            },
            caption: 'Viscosity of liquid water at 1 atm (handbook values). Points joined by straight lines.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-double-r', difficulty: 2,
      prompt: t`Two smooth pipes have the same length and the same pressure drop along them, and carry the same liquid in laminar flow. Pipe B has twice the radius of pipe A. How do their flow rates compare?`,
      choices: ['B carries 16 times as much', 'B carries 4 times as much', 'B carries twice as much', 'B carries 8 times as much'],
      answer: 0,
      why: {
        1: 'Four times follows the area alone; in B the liquid is also faster, by another factor of four.',
        2: 'Flow rate is not proportional to the radius: both the area and the speed grow with it.',
        3: 'Count the powers again: Q ∝ R⁴, and 2⁴ = 16.',
      },
      hints: ['Poiseuille: Q ∝ R⁴.'],
      teach: 'Laminar flow rate grows as the fourth power of the pipe’s radius.',
      explain: t`$Q \propto R^4$, so doubling $R$ multiplies $Q$ by $2^4 = 16$: four times the area, each part moving (on average) four times as fast.`,
      visual: twoPipes(0.45, 0.9, 'Two pipes under the same pressure gradient, radii R and 2R, with their speed profiles. Not to scale.'),
    }),
    num({
      id: 'cp-duct', difficulty: 2,
      gen(r) {
        const v = r.pick([2, 3, 5]), D = r.pick([10, 20, 30]);   // m/s, cm
        const Re = (1.2 * v * (D / 100)) / 1.8e-5;
        return {
          prompt: t`Air ($\rho = 1.2\ \text{kg/m}^3$, $\eta = 1.8\times10^{-5}$ Pa·s) moves at ${v} m/s through a ventilation duct ${D} cm across. What is its Reynolds number?`,
          answer: Re, tol: { rel: 0.005 },
          errors: [{ value: (1.2 * v * D) / 1.8e-5, feedback: 'Convert centimetres to metres.' }],
          hints: [t`$\mathrm{Re} = \rho v D/\eta$.`],
          teach: 'Re = ρvD/η; for ordinary air flows it is in the tens of thousands, so they are turbulent.',
          explain: t`$\mathrm{Re} = \dfrac{1.2\times${v}\times${tn(D / 100)}}{1.8\times10^{-5}} = ${tn(Re)}$ — turbulent, as nearly all everyday air flows in ducts are.`,
          visual: regimes(),
        };
      },
    }),
    num({
      id: 'cp-viscometer', difficulty: 3, transfer: true,
      gen(r) {
        const eta0 = r.pick([0.04, 0.1, 0.25]), R = r.pick([0.4, 0.5, 0.6]), L = r.pick([8, 10]), dp = r.pick([2, 5]);   // Pa·s, mm, cm, kPa
        const Qp = +((Math.PI * (R / 1000) ** 4 * dp * 1000) / (8 * eta0 * (L / 100)) * 1e6).toPrecision(3);   // mL/s, as printed
        const eta = (Math.PI * (R / 1000) ** 4 * dp * 1000) / (8 * (Qp / 1e6) * (L / 100));
        return {
          prompt: t`A capillary viscometer measures an oil’s viscosity from its flow through a glass tube. The tube is ${L} cm long with an inner radius of ${R.toFixed(1)} mm; under a pressure difference of ${dp} kPa the oil flows through at ${Qp} mL/s. What is the oil’s viscosity?`,
          answer: eta, units: 'Pa s', tol: { rel: 0.01 },
          errors: [{ value: (Math.PI * (2 * R / 1000) ** 4 * dp * 1000) / (8 * (Qp / 1e6) * (L / 100)), feedback: 'Use the radius, not the diameter.' }, { value: (Math.PI * (R / 1000) ** 4 * dp * 1000) / ((Qp / 1e6) * (L / 100)), feedback: 'Keep the 8 from Poiseuille’s law.' }],
          hints: [t`Solve Poiseuille’s law for the viscosity: $\eta = \dfrac{\pi R^4 \Delta p}{8 Q L}$.`, t`SI throughout: $Q = ${Qp}\times10^{-6}\ \text{m}^3/\text{s}$, $R = ${tn(R / 1000)}$ m, $L = ${tn(L / 100)}$ m.`],
          teach: 'Turning Poiseuille’s law around makes a laminar flow through a known tube into a viscosity meter.',
          explain: t`$\eta = \dfrac{\pi(${tn(R / 1000)})^4(${dp * 1000})}{8(${tn(Qp / 1e6)})(${tn(L / 100)})} = ${tn(eta)}\ \text{Pa·s}$ — ${eta < 0.07 ? 'a light oil' : eta < 0.15 ? 'a medium oil' : 'a motor oil'}. The flow is so slow (Re well below 1) that the laminar assumption is safe — the reason viscometers use thin tubes.`,
          visual: onePipe('The capillary seen from the side, with its laminar speed profile. Not to scale.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §14.7 Viscosity and Turbulence', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-7-viscosity-and-turbulence' },
  ],
});
