// Semiconductors and the p–n junction — intrinsic carriers (n_i ∝ T^(3/2)
// e^(−E_g/2kT)), holes, doping (phosphorus donors, boron acceptors), the
// mass-action law np = n_i², the junction’s built-in potential and
// depletion region, the ideal diode I = I₀(e^(eV/kT) − 1), LEDs (λ = hc/E_g;
// silicon’s indirect gap) and solar cells (open-circuit voltage, maximum
// power point; spacecraft arrays). Explore: the mp-junction simulation.
// Coding: a cell’s maximum power point. Every number is computed here or in
// src/viz/model/mp-solids.js.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { S_SUN } from './_constants.js';
import { S, r6, seg, label, junctionSketch, bandBoxes } from './_solids.js';

const t = String.raw;
const KT = S.kT(300);                                   // eV, kT at 300 K (so kT/e in volts)
const SI = S.SEMIS.si;
const VBI = S.builtIn(1e16, 1e16, SI.ni);               // V
const W0 = S.depletion(1e22, 1e22, VBI, SI.epsR).W;     // m
const V10 = KT * Math.log(1e-2 / 1e-12 + 1);            // V, for 10 mA with I₀ = 1 pA
const CELL = { I0: 1e-12, IL: 0.0391 };
const MPP = S.mpp(CELL.I0, CELL.IL);

/** The mp-junction simulation as a still picture. */
const jn = (params, caption) => ({ type: 'mp-junction', params: { controls: false, play: false, ...params }, ...(caption ? { caption } : {}) });

/** Schematic: a phosphorus atom in the silicon lattice, its fifth electron loosely bound. */
const donor = (() => {
  const points = [], curves = [];
  for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) {
    if (i < 2) curves.push(seg(i, j, i + 1, j, 'ink4', 1.6));
    if (j < 1) curves.push(seg(i, j, i, j + 1, 'ink4', 1.6));
    const P = i === 0 && j === 0;
    points.push({ x: i, y: j, r: 14, color: P ? 'accent' : 'ink4' }, label(i, j, P ? 'P⁺' : 'Si', P ? 'ink' : 'ink2', 0, 0, 'center'));
  }
  curves.push({ param: ['0.55*cos(t)', '0.55*sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.2, dash: true });
  points.push({ x: 0.39, y: 0.39, r: 4.5, color: 'gold', label: 'its 5th electron', labelDx: 10, labelDy: -8 });
  return {
    type: 'graph',
    params: { x: [-2.7, 2.7], y: [-1.5, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, points },
    caption: 'Schematic: a phosphorus atom in a silicon crystal (a flattened picture of a three-dimensional lattice). Four of its five outer electrons form bonds; the fifth is held so weakly (about 0.045 eV) that at room temperature it wanders off into the conduction band, leaving the phosphorus as a fixed ion of charge +e.',
  };
})();

/** Electrons and holes per cm³ on log scales: intrinsic silicon against doped silicon (the holes withheld). */
function carriers(ND, caption) {
  const bar = (x, v, color, alpha = 0.7) => ({ fn: String(r6(Math.log10(v))), lower: '0', from: x, to: x + 0.7, color, alpha });
  return {
    type: 'graph',
    params: {
      x: [0, 5], y: [0, 21.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: '', xticks: 0, ylabel: 'carriers per cm³', grid: true,
      shade: [bar(0.5, 1e10, 'accent'), bar(1.3, 1e10, 'warn'), bar(3, ND, 'accent')],
      points: [
        label(1.25, 21.5, 'pure silicon', 'ink', 0, 10, 'center'), label(3.75, 21.5, 'doped n-type', 'ink', 0, 10, 'center'),
        label(0.85, r6(Math.log10(1e10)), 'electrons', 'accent', 0, -10, 'center'), label(1.65, r6(Math.log10(1e10)), 'holes', 'warn', 0, -10, 'center'),
        label(3.35, r6(Math.log10(ND)), 'electrons', 'accent', 0, -10, 'center'), label(4.15, 2, 'holes: ?', 'warn', 0, -10, 'center'),
      ],
    },
    caption: caption ?? 'Carriers per cubic centimetre on a logarithmic scale, at 300 K. In pure silicon electrons and holes come in pairs; doping floods one kind in and, by the law of mass action, starves the other.',
  };
}

/** log n_i against temperature for one gap (numbers on the vertical axis hidden). */
const niCurve = (Eg, T2, name) => ({
  type: 'graph',
  params: {
    x: [250, 500], y: [-2.5, 5.5], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature (K)', ylabel: 'intrinsic carriers (log scale)', yticks: 0,
    curves: [{ fn: `1.5*log10(x/300) + ${r6(Eg / (2 * 8.617333262e-5))}*(1/300 - 1/x)/ln(10)`, color: 'accent', width: 2.6 }],
    vlines: [{ x: 300, label: '300 K', color: 'ink3' }, { x: T2, label: `${T2} K`, color: 'gold' }],
  },
  caption: t`How the intrinsic carrier density of ${name} grows with temperature, $n_i \propto T^{3/2}e^{-E_g/2kT}$, on a logarithmic scale (the gap’s own slight fall with temperature is ignored).`,
});

/** Band edges against momentum: a direct gap (GaAs) and an indirect one (Si). Schematic. */
const directIndirect = {
  type: 'graph',
  params: {
    x: [-2.3, 2.3], y: [-1.5, 2.6], aspect: 'wide', axesAt: 'edge', xlabel: 'electron momentum (crystal wave number)', xticks: 0, ylabel: 'energy', yticks: 0, grid: false,
    curves: [
      { fn: '-1.4*(x + 1.15)^2', domain: [-2.15, -0.15], color: 'warn', width: 2.6 },
      { fn: '1 + 1.4*(x + 1.15)^2', domain: [-2.0, -0.3], color: 'accent', width: 2.6 },
      { fn: '-1.4*(x - 1.15)^2', domain: [0.15, 2.15], color: 'warn', width: 2.6 },
      { fn: '0.75 + 1.6*(x - 1.75)^2', domain: [0.85, 2.3], color: 'accent', width: 2.6 },
    ],
    arrows: [{ from: [-1.15, 0], to: [-1.15, 1], color: 'gold', width: 2 }, { from: [1.15, 0], to: [1.75, 0.75], color: 'bad', width: 2, dash: true }],
    points: [
      label(-1.15, 2.6, 'direct gap (GaAs)', 'ink', 0, 10, 'center'), label(1.15, 2.6, 'indirect gap (Si)', 'ink', 0, 10, 'center'),
      label(-1.08, 0.5, 'light: same momentum', 'gold', 0, 0, 'left'), label(1.5, 0.2, 'needs a phonon', 'bad', 12, 8, 'left'),
      label(-1.15, 1.85, 'conduction band', 'accent', 0, 0, 'center'), label(-1.15, -0.5, 'valence band', 'warn', 0, 0, 'center'),
    ],
  },
  caption: 'Schematic band edges against electron momentum. In a direct-gap crystal the lowest conduction state sits above the highest valence state, so an electron can drop and emit a photon (which carries almost no momentum). In silicon they are offset: the drop must also hand momentum to a lattice vibration, a slow three-body process.',
};

/** A solar cell’s I–V curve (generator convention: current delivered positive), voltage numbers hidden. */
function ivSketch(I0, IL) {
  const voc = S.vOC(I0, IL), mA = IL * 1e3;
  return {
    type: 'graph',
    params: {
      x: [-0.05 * voc, 1.12 * voc], y: [r6(-0.35 * mA), r6(1.3 * mA)], aspect: 'wide', axesAt: 'edge', xlabel: 'voltage across the cell', xticks: 0, ylabel: 'current delivered (mA)',
      curves: [{ fn: `${r6(mA)} - ${I0 * 1e3}*(exp(x/${r6(KT)}) - 1)`, color: 'accent', width: 2.6 }],
      points: [{ x: r6(voc), y: 0, r: 5, color: 'gold', label: 'open circuit: V = ?', labelDx: -8, labelDy: -14, labelAlign: 'right' }, { x: 0, y: r6(mA), r: 5, color: 'good', label: 'short circuit', labelDx: 10, labelDy: -12 }],
    },
    caption: 'An illuminated cell’s current against its voltage (ideal diode model). With nothing connected, no current flows and the voltage settles where the light-made current is exactly undone by the diode’s forward current.',
  };
}

export default lesson({
  id: 'phys2710.MP12.3',
  title: 'Semiconductors and the p–n junction',
  minutes: 16, difficulty: 3,
  badges: ['est-obs', 'model'],
  intro: t`Pure silicon conducts only a little: at room temperature a few electrons are shaken across its 1.12 eV gap, each leaving behind a **hole** — a missing electron that moves like a positive charge. **Doping** changes everything. Replace one silicon atom in a million with phosphorus, which has one more outer electron, and the crystal fills with free electrons (**n-type**); use boron, with one fewer, and it fills with holes (**p-type**). Join the two and electrons and holes diffuse across the boundary and annihilate, leaving a thin **depletion region** of fixed ions whose field builds a barrier. Forward bias lowers the barrier and the current rises exponentially; reverse bias raises it and almost nothing flows:

$$I = I_0\left(e^{eV/kT} - 1\right)$$

Recombining across a direct gap, the junction gives light — an **LED**, coloured by its gap. Run backwards, light makes electron–hole pairs that the junction’s field pulls apart: a **solar cell**.

> This uses band gaps ([MP12.1](#/lesson/phys2710.MP12.1)) and the Fermi–Dirac distribution ([MP10.2](#/lesson/phys2710.MP10.2)).`,
  symbols: [
    { tex: 'I', text: 'the current through the junction, counted positive in the forward direction (from p to n inside)' },
    { tex: 'I_0', text: t`the saturation current: the tiny current that flows backwards under reverse bias. It grows as $n_i^2 \propto e^{-E_g/kT}$, so wide gaps make it minute — about $10^{-12}$ A for a small silicon diode` },
    { tex: 'e', text: t`the elementary charge, $1.602\times10^{-19}$ C` },
    { tex: 'V', text: 'the bias voltage: positive (forward) when the p side is made positive' },
    { tex: 'k', text: t`Boltzmann’s constant; $kT/e = ${fmt(KT * 1000, 4)}$ mV at 300 K` },
    { tex: 'T', text: 'the temperature, in kelvin' },
  ],
  why: 'Every transistor, LED, laser diode, camera pixel and solar cell is built from p–n junctions — including the arrays that power nearly every spacecraft.',
  visual: {
    type: 'mp-junction',
    title: 'Inside a p–n junction',
    lead: t`Electron energy runs up the picture, position across it: p-type on the left, n-type on the right, the depletion region between (real widths, in μm). Electrons (dots) sit in the conduction band, holes (rings) in the valence band. Below, the current against the bias voltage, with the gold dot at the present bias.`,
    tasks: [
      'Raise the bias toward +0.6 V: the barrier drops, carriers stream across and recombine, and the current shoots up — ten times for every 60 mV.',
      'Go to −1 V: the barrier grows, the depletion region widens and the current is a trickle of femtoamperes.',
      'Choose GaAs or InGaN and forward-bias it: recombination now gives light of the gap’s colour. Then, at zero bias, turn up the sunlight: pairs are pulled apart and the current runs backwards — a solar cell.',
    ],
    params: { material: 'si', V: 0.3 },
  },
  example: {
    prompt: t`A silicon junction is doped with $N_A = 10^{16}$ boron atoms per cm³ on its p side and $N_D = 10^{16}$ phosphorus atoms per cm³ on its n side; $n_i = 1.0\times10^{10}$ cm⁻³ at 300 K. Find (a) the hole density on the n side, (b) the built-in potential $V_{bi} = (kT/e)\ln(N_AN_D/n_i^2)$, (c) the depletion width $W = \sqrt{2\varepsilon V_{bi}(N_A + N_D)/(eN_AN_D)}$ with $\varepsilon = 11.7\,\varepsilon_0$, and (d) the forward bias that drives 10 mA if $I_0 = 1.0$ pA.`,
    visual: jn({ material: 'si', V: 0 }, t`The silicon junction of the example at zero bias: the bands step down by $eV_{bi}$ across a depletion region 0.43 μm wide. A teaching model: carriers are a sprinkling, not their real numbers.`),
    steps: [
      { label: 'Minority carriers', text: t`On the n side every phosphorus atom gives an electron, so $n = N_D = 10^{16}$ cm⁻³. In equilibrium $np = n_i^2$ (the **law of mass action**: pairs are made and annihilated at balancing rates), so $p = n_i^2/N_D = 10^{20}/10^{16} = 10^{4}$ cm⁻³ — a trillion times fewer holes than electrons.` },
      { label: 'Built-in potential', text: t`$V_{bi} = (${fmt(KT, 4)}\ \text{V})\ln\dfrac{10^{16}\times10^{16}}{(10^{10})^2} = ${fmt(KT, 4)}\times\ln 10^{12} = ${fmt(VBI, 3)}$ V. Electrons on the n side must climb ${fmt(VBI, 3)} eV to reach the p side.` },
      { label: 'Depletion width', text: t`In SI units $N = 10^{22}$ m⁻³: $W = \sqrt{\dfrac{2(11.7)(8.854\times10^{-12})(${fmt(VBI, 3)})(2\times10^{22})}{(1.602\times10^{-19})(10^{22})^2}} = ${fmt(W0 * 1e6, 3)}$ μm — about 1600 atomic spacings, half on each side since the dopings are equal.` },
      { label: 'Forward bias', text: t`$V = \dfrac{kT}{e}\ln\left(\dfrac{I}{I_0} + 1\right) = ${fmt(KT, 4)}\times\ln(10^{10}) = ${fmt(V10, 3)}$ V. The barrier left is $${fmt(VBI, 3)} - ${fmt(V10, 3)} = ${fmt(VBI - V10, 2)}$ eV — enough electrons can now climb it to carry 10 mA.` },
      { label: 'Sense check', text: t`The familiar “0.6 V drop” of a silicon diode, from first principles. Each extra $(kT/e)\ln 10 = ${fmt(KT * Math.LN10 * 1000, 3)}$ mV multiplies the current by ten.` },
    ],
    answer: t`(a) $10^{4}$ holes per cm³; (b) $V_{bi} = ${fmt(VBI, 3)}$ V; (c) $W = ${fmt(W0 * 1e6, 3)}$ μm; (d) $V = ${fmt(V10, 3)}$ V.`,
  },
  practice: [
    mcq({
      id: 'neutral', difficulty: 1,
      prompt: 'Silicon doped with phosphorus is called n-type, because its mobile carriers are negative electrons. What is the electric charge of a piece of n-type silicon?',
      choices: [
        'Zero: each free electron came from a phosphorus atom, which is left behind as a fixed positive ion',
        'Negative, because it contains extra electrons',
        'Positive, because the phosphorus ions are positive',
        'Negative at first, becoming neutral as the electrons leak away to the surroundings',
      ],
      answer: 0,
      why: {
        1: 'The electrons are not added from outside: each phosphorus atom brings one more proton as well as one more electron.',
        2: 'The positive ions are exactly balanced by the electrons they released.',
        3: 'It is neutral from the start: neutral atoms were put in, and nothing was added.',
      },
      hints: ['A phosphorus atom is neutral: 15 protons, 15 electrons.', 'When its fifth outer electron wanders off, what is left behind?'],
      teach: '“n-type” names the mobile carriers, not the net charge: doped silicon is neutral, its free electrons balanced by fixed donor ions.',
      explain: 'Phosphorus atoms are neutral; in the lattice each lends its fifth electron to the conduction band and stays behind as a fixed P⁺ ion. Free electrons and fixed ions cancel exactly. Only at a junction, where the free electrons have diffused away, do the bare ions show their charge — that is the depletion region.',
      visual: donor,
    }),
    num({
      id: 'minority', difficulty: 2,
      gen(r) {
        const ND = r.pick([1e15, 1e16, 1e17, 1e18]);
        return {
          prompt: t`Silicon ($n_i = 1.0\times10^{10}$ cm⁻³ at 300 K) is doped with $${tex(ND)}$ phosphorus atoms per cm³, all ionized. How many holes per cm³ does it hold?`,
          answer: 1e20 / ND, units: 'cm^-3', tol: { rel: 0.01 },
          errors: [{ value: 1e10, feedback: t`Doping changes the holes too: with many more electrons, holes are annihilated faster, so $np$ stays equal to $n_i^2$.` }, { value: ND, feedback: t`That is the electron density. The holes follow from $np = n_i^2$.` }],
          hints: [t`In equilibrium $np = n_i^2$, whatever the doping.`, t`$p = n_i^2/n = (10^{10})^2/${tex(ND)}$.`],
          teach: t`The law of mass action, $np = n_i^2$: doping raises one carrier density and lowers the other in proportion.`,
          explain: t`$p = n_i^2/N_D = 10^{20}/${tex(ND)} = ${tex(1e20 / ND)}$ cm⁻³. The electrons outnumber the holes by $${tex(ND * ND / 1e20)}$ to one: electrons are the **majority carriers**, holes the **minority carriers**.`,
          visual: carriers(ND),
        };
      },
    }),
    num({
      id: 'ni-heat', difficulty: 2,
      gen(r) {
        const [name, Eg] = r.pick([['silicon', 1.12], ['germanium', 0.66], ['gallium arsenide', 1.42]]), T2 = r.pick([350, 400, 450]);
        const R = S.intrinsicRatio(300, T2, Eg);
        return {
          prompt: t`The intrinsic carrier density grows as $n_i \propto T^{3/2}e^{-E_g/2kT}$. By what factor does it rise in ${name} ($E_g = ${Eg}$ eV) when it warms from 300 K to ${T2} K?`,
          answer: R, tol: { rel: 0.01 },
          errors: [{ value: (T2 / 300) ** 1.5 * Math.exp((Eg / 8.617333262e-5) * (1 / 300 - 1 / T2)), feedback: t`The exponent is $-E_g/2kT$: half the gap, because each thermal jump makes two carriers.` }, { value: Math.exp((Eg / (2 * 8.617333262e-5)) * (1 / 300 - 1 / T2)), feedback: t`Include the factor $(T_2/T_1)^{3/2}$ as well.` }],
          hints: [t`Take the ratio: $\dfrac{n_i(T_2)}{n_i(T_1)} = \left(\dfrac{T_2}{T_1}\right)^{3/2}\exp\!\left[\dfrac{E_g}{2k}\left(\dfrac{1}{T_1} - \dfrac{1}{T_2}\right)\right]$.`, t`$E_g/2k = ${Eg}/(2\times8.617\times10^{-5}) = ${fmt(Eg / (2 * 8.617333262e-5), 4)}$ K; multiply by $1/300 - 1/${T2}$.`],
          teach: t`Intrinsic carriers rise steeply with temperature, as $e^{-E_g/2kT}$: a semiconductor conducts better when hot — the opposite of a metal.`,
          explain: t`$(${T2}/300)^{3/2} = ${fmt((T2 / 300) ** 1.5, 4)}$ and $\exp[${fmt(Eg / (2 * 8.617333262e-5), 4)}\times(1/300 - 1/${T2})] = ${fmt(R / (T2 / 300) ** 1.5, 4)}$, so the factor is $${fmt(R, 3)}$. That steep rise is why electronics have maximum operating temperatures: when $n_i$ approaches the doping, the junctions stop working.`,
          visual: niCurve(Eg, T2, name),
        };
      },
    }),
    num({
      id: 'built-in', difficulty: 2,
      gen(r) {
        const [NA, ND] = r.pick([[1e15, 1e16], [1e16, 1e17], [1e17, 1e17], [1e17, 1e18], [1e15, 1e17]]), V = S.builtIn(NA, ND, 1e10);
        return {
          prompt: t`A silicon junction has $N_A = ${tex(NA)}$ cm⁻³ on its p side and $N_D = ${tex(ND)}$ cm⁻³ on its n side; $n_i = 1.0\times10^{10}$ cm⁻³ and $kT/e = 25.85$ mV. What is its built-in potential, in volts?`,
          answer: V, units: 'V', tol: { rel: 0.005 },
          errors: [{ value: KT * Math.log10((NA * ND) / 1e20), feedback: t`Use the natural logarithm: $V_{bi} = (kT/e)\ln(N_AN_D/n_i^2)$.` }, { value: KT * Math.log((NA * ND) / 1e10), feedback: t`Divide by $n_i^2 = 10^{20}$, not $n_i$.` }],
          hints: [t`$V_{bi} = \dfrac{kT}{e}\ln\dfrac{N_AN_D}{n_i^2}$.`, t`$\dfrac{N_AN_D}{n_i^2} = \dfrac{${tex(NA)}\times${tex(ND)}}{10^{20}} = ${tex((NA * ND) / 1e20)}$; take its natural log and multiply by 0.02585 V.`],
          teach: 'The built-in potential grows only logarithmically with doping — a few tenths of a volt to just under the gap.',
          explain: t`$V_{bi} = 0.02585\times\ln(${tex((NA * ND) / 1e20)}) = ${fmt(V, 3)}$ V. Even a thousandfold increase in doping adds only $0.02585\ln 1000 = 0.18$ V; the barrier can never exceed the gap, 1.12 eV.`,
          visual: junctionSketch({ Vb: 0.72, barrierLabel: 'eV (built-in) = ?', caption: 'A silicon junction’s bands in equilibrium (a sketch; heights not to scale). The step in the bands is the built-in potential energy.' }),
        };
      },
    }),
    {
      type: 'slider', id: 'set-barrier', difficulty: 2,
      prompt: t`This silicon junction has a built-in potential of $${fmt(VBI, 3)}$ V. Set the bias so that electrons on the n side face a barrier of **0.30 eV**.`,
      visual: jn({ material: 'si', V: 0, controls: ['V'], hide: ['barrier'] }, 'The silicon junction of the worked example (a teaching model). The barrier is the step in the conduction band between the n side and the p side.'),
      param: 'V', answer: [r6(VBI - 0.3 - 0.008), r6(VBI - 0.3 + 0.012)],
      instruction: 'Move the bias slider, then check.',
      hints: [t`The barrier is $e(V_{bi} - V)$: forward bias takes $eV$ off it.`, t`$V = V_{bi} - 0.30 = ${fmt(VBI, 3)} - 0.30$ V.`],
      teach: t`A bias $V$ changes the junction’s barrier from $eV_{bi}$ to $e(V_{bi} - V)$: forward bias lowers it, reverse bias raises it.`,
      explain: t`$V = ${fmt(VBI, 3)} - 0.30 = ${fmt(VBI - 0.3, 3)}$ V of forward bias. The current then is $I_0e^{eV/kT} \approx 10^{-12}\times e^{${fmt((VBI - 0.3) / KT, 3)}} \approx ${tex(1e-12 * Math.exp((VBI - 0.3) / KT), 2)}$ A — still small, because only electrons with more than 0.30 eV to spare can climb over.`,
    },
    num({
      id: 'per-decade', difficulty: 2,
      gen(r) {
        const k = r.pick([10, 100, 1000]);
        return {
          prompt: t`An ideal silicon diode at 300 K carries 1 mA. How much more forward voltage, in mV, makes it carry ${k === 10 ? '10' : k === 100 ? '100' : '1000'} mA?`,
          answer: KT * Math.log(k) * 1000, units: 'mV', tol: { rel: 0.01 },
          errors: [{ value: KT * Math.log10(k) * 1000, feedback: t`The exponential is base $e$: $\Delta V = (kT/e)\ln(I_2/I_1)$, and $\ln 10 = 2.303$.` }, { value: KT * 1000 * k, feedback: 'The current is exponential in V, not proportional to it.' }],
          hints: [t`Far above $I_0$, $I \approx I_0e^{eV/kT}$, so $I_2/I_1 = e^{e\Delta V/kT}$.`, t`$\Delta V = (kT/e)\ln(I_2/I_1) = 25.85\ \text{mV}\times\ln ${k}$.`],
          teach: 'Forward current is exponential in voltage: ten times more current for each 59.5 mV at room temperature.',
          explain: t`$\Delta V = 25.85\ \text{mV}\times\ln ${k} = ${fmt(KT * Math.log(k) * 1000, 3)}$ mV. Real diodes deviate a little (an “ideality factor” up to about 2, and series resistance at high current), but the exponential is why a silicon diode sits near 0.6–0.7 V over a huge range of currents.`,
          visual: jn({ material: 'si', V: 0.6, hide: ['I'] }, 'A silicon junction forward-biased at 0.6 V (a teaching model): the current rises exponentially with the bias.'),
        };
      },
    }),
    num({
      id: 'led-colour', difficulty: 2,
      gen(r) {
        const key = r.pick(['gaas', 'gaasp', 'ingan']), m = S.SEMIS[key], lam = S.ledNm(m.Eg);
        return {
          prompt: t`In an LED, electrons crossing the junction drop across the band gap and give off a photon each. Its ${m.short} has a gap of $${m.Eg}$ eV. What wavelength does it emit, in nm?`,
          answer: lam, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: lam / 2, feedback: t`One electron drops across the gap and gives one photon of energy $E_g$: $\lambda = hc/E_g$, no factor 2.` }],
          hints: [t`The photon carries the gap energy: $hc/\lambda = E_g$.`, t`$\lambda = 1239.8\ \text{eV nm}/${m.Eg}$ eV.`],
          teach: t`An LED’s colour is set by its band gap: $\lambda = hc/E_g$.`,
          explain: t`$\lambda = 1239.8/${m.Eg} = ${fmt(lam, 3)}$ nm: ${lam > 750 ? 'infrared — the light of TV remote controls and optical links' : lam > 600 ? 'red' : 'blue'}. Real LEDs emit a band some 20–30 nm wide, centred a little above the gap energy. ${key === 'ingan' ? 'Efficient blue LEDs needed good p-type gallium nitride, achieved around 1990 — the work of the 2014 Nobel Prize. Coated with a yellow phosphor, they make today’s white LEDs.' : ''}`,
          visual: jn({ material: key, V: +(KT * Math.log(0.02 / S.junction(key, 0).I0)).toFixed(2), hide: ['lambda'] }, `A forward-biased ${m.short} junction (a teaching model): electrons and holes recombine, each giving a photon of about the gap energy. Screen colours are approximate.`),
        };
      },
    }),
    code({
      id: 'max-power', difficulty: 3,
      prompt: t`A 1 cm² silicon solar cell in 1000 W/m² of sunlight makes a light current $I_L = 39.1$ mA; its diode has $I_0 = 1.0$ pA. Counting current delivered to a load as positive, $I(V) = I_L - I_0(e^{eV/kT} - 1)$. Finish \`max_power()\` so that it scans $V$ from 0 to the open-circuit voltage and returns the voltage and power $P = VI$ at the **maximum power point**.`,
      starter: t`import numpy as np

kT = 0.025852    # eV at 300 K, so kT/e in volts
I0 = 1.0e-12     # A
IL = 0.0391      # A

def current(V):
    return IL - I0 * (np.exp(V / kT) - 1)

def max_power():
    Voc = kT * np.log(IL / I0 + 1)
    # try many voltages between 0 and Voc; return (V, P) where P = V * current(V) is largest
    return 0.0, 0.0

V, P = max_power()
print(f"maximum power {P*1000:.2f} mW at {V:.3f} V")
print(f"efficiency {P / 0.1 * 100:.1f} %")    # 1000 W/m² on 1 cm² is 0.1 W
`,
      answer: t`import numpy as np

kT = 0.025852
I0 = 1.0e-12
IL = 0.0391

def current(V):
    return IL - I0 * (np.exp(V / kT) - 1)

def max_power():
    Voc = kT * np.log(IL / I0 + 1)
    V = np.linspace(0, Voc, 100001)
    P = V * current(V)
    i = np.argmax(P)
    return V[i], P[i]

V, P = max_power()
print(f"maximum power {P*1000:.2f} mW at {V:.3f} V")
print(f"efficiency {P / 0.1 * 100:.1f} %")`,
      tests: [
        { name: t`the maximum power point is at $${fmt(MPP.V, 3)}$ V`, code: `abs(max_power()[0] - ${r6(MPP.V)}) < 0.002` },
        { name: t`the maximum power is $${fmt(MPP.P * 1000, 3)}$ mW`, code: `abs(max_power()[1] - ${r6(MPP.P)}) < 2e-5` },
        { name: t`the efficiency printed is $${fmt(MPP.P * 1000, 3)}$%`, code: `"${(MPP.P * 1000).toFixed(1)} %" in _stdout` },
      ],
      hints: [t`\`np.linspace(0, Voc, 100001)\` gives the voltages; \`P = V * current(V)\` works on the whole array at once.`, t`\`i = np.argmax(P)\` is the index of the largest power; return \`V[i], P[i]\`.`],
      teach: 'A solar cell’s power VI is zero at both ends of its curve — short circuit and open circuit — and peaks in between, at the maximum power point.',
      explain: t`The power peaks at $V = ${fmt(MPP.V, 3)}$ V, below the open-circuit voltage $${fmt(S.vOC(CELL.I0, CELL.IL), 3)}$ V, where the cell still delivers $${fmt(-MPP.I * 1000, 3)}$ mA: $P = ${fmt(MPP.P * 1000, 3)}$ mW, an efficiency of ${fmt(MPP.P * 1000, 3)}% from 100 mW of sunlight. Spacecraft and rooftop electronics track this point continuously (“MPPT”), because it moves with light and temperature. The best real silicon cells reach about 27%.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-array', difficulty: 2, transfer: true,
      gen(r) {
        const [where, d] = r.pick([['in orbit around Mars, 1.52 au from the Sun', 1.524], ['at the asteroid Ceres, 2.77 au from the Sun', 2.77], ['at Jupiter, 5.20 au from the Sun', 5.2], ['in Earth orbit, 1.00 au from the Sun', 1.0]]);
        const A = r.pick([10, 20, 40, 60]), eff = 0.295, P = (eff * A * S_SUN) / (d * d);
        return {
          prompt: t`Sunlight delivers ${S_SUN} W/m² at 1 au and falls off as $1/d^2$. A spacecraft ${where} carries ${A} m² of triple-junction solar cells with an efficiency of 29.5%. What electrical power do they give, in W, facing the Sun?`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: (eff * A * S_SUN) / d, feedback: 'Sunlight spreads over a sphere: its intensity falls as 1/d², not 1/d.' }, { value: eff * A * S_SUN, feedback: `That is the power at 1 au. At ${d} au the sunlight is ${fmt(d * d, 3)} times weaker.` }].filter((e) => Math.abs(e.value / P - 1) > 0.02),
          hints: [t`The intensity there is $S = ${S_SUN}/d^2$ W/m² with $d$ in au.`, t`Power $= \eta\,A\,S = 0.295\times${A}\times${S_SUN}/${d}^2$.`],
          teach: 'An array’s power is efficiency × area × local sunlight, and sunlight falls as 1/d² from the Sun.',
          explain: t`$S = ${S_SUN}/${fmt(d * d, 4)} = ${fmt(S_SUN / (d * d), 3)}$ W/m², so $P = 0.295\times${A}\times${fmt(S_SUN / (d * d), 3)} = ${fmt(P, 3)}$ W. Triple-junction cells stack three gaps (GaInP, GaAs and Ge) so that each absorbs its own slice of the spectrum. Juno’s 60 m² of cells gave about 14 kW near Earth but only about 500 W at Jupiter — and farther out, missions carry radioisotope generators instead (lesson MP13.1).`,
          visual: jn({ material: 'gaas', V: 0.85, light: 1, hide: ['power'] }, 'A GaAs cell (one of the three junctions in a triple-junction cell) in sunlight, working near its maximum power point (a teaching model; the drawing is for one sun at the ground).'),
        };
      },
    }),
    mcq({
      id: 'cp-silicon-led', difficulty: 3,
      prompt: 'Silicon is the cheapest, best-understood semiconductor, yet LEDs and laser diodes are made of GaAs, InGaN and similar compounds instead. Why does silicon make such poor light emitters?',
      choices: [
        'Its gap is indirect: an electron dropping across it must also give momentum to the lattice, so it nearly always loses its energy as heat instead of light',
        'Its 1.12 eV gap is too small for any photon to be emitted',
        'Silicon cannot be doped p-type, so it cannot form a junction',
        'Silicon absorbs all light, so any photon made inside it is immediately reabsorbed',
      ],
      answer: 0,
      why: {
        1: 'A 1.12 eV photon (1107 nm, near-infrared) is perfectly possible; GaAs LEDs emit at a similar 873 nm.',
        2: 'Boron doping makes p-type silicon routinely: every silicon diode and transistor is built that way.',
        3: 'Silicon is transparent to photons below its gap energy, including its own band-edge light.',
      },
      hints: ['A photon carries energy but almost no momentum.', 'Compare where, in momentum, the bottom of the conduction band and the top of the valence band sit in silicon.'],
      teach: 'Only direct-gap semiconductors emit light efficiently: in an indirect gap like silicon’s, a lattice vibration must carry off momentum, and heat wins.',
      explain: 'In GaAs the lowest conduction state lies directly above the highest valence state, so an electron can drop and emit a photon at once. In silicon they sit at different momenta, and a photon can hardly carry the difference; the drop needs a phonon too, which makes it a million times slower, and other heat-making paths win. Silicon detects light well — absorption can borrow a phonon too — but emits it poorly.',
      visual: directIndirect,
    }),
    num({
      id: 'cp-voc', difficulty: 3,
      gen(r) {
        const IL = r.pick([25, 30, 35, 40]) * 1e-3, I0 = r.pick([1e-13, 1e-12, 1e-11]), voc = S.vOC(I0, IL);
        return {
          prompt: t`An illuminated cell makes a light current of ${fmt(IL * 1000, 3)} mA, and its diode has $I_0 = ${tex(I0)}$ A. With nothing connected, its current is zero: $I_L = I_0(e^{eV/kT} - 1)$. What is its open-circuit voltage, in V, at 300 K ($kT/e = 25.85$ mV)?`,
          answer: voc, units: 'V', tol: { rel: 0.005 },
          errors: [{ value: KT * Math.log10(IL / I0), feedback: t`Use the natural logarithm: $V_{oc} = (kT/e)\ln(I_L/I_0 + 1)$.` }],
          hints: [t`Solve $I_L = I_0(e^{eV/kT} - 1)$ for $V$.`, t`$V_{oc} = \dfrac{kT}{e}\ln\left(\dfrac{I_L}{I_0} + 1\right)$ with $I_L/I_0 = ${tex(IL / I0, 3)}$.`],
          teach: t`With no load the light-made current is undone by the diode’s forward current: $V_{oc} = (kT/e)\ln(I_L/I_0 + 1)$.`,
          explain: t`$V_{oc} = 0.02585\times\ln(${tex(IL / I0, 3)}) = ${fmt(voc, 3)}$ V. A smaller $I_0$ — a wider gap, or a cleaner crystal — raises $V_{oc}$, which is why GaAs cells give about 1 V and silicon about 0.7 V.`,
          visual: ivSketch(I0, IL),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §9.7–9.8 (semiconductors, doping and devices)', url: 'https://openstax.org/books/university-physics-volume-3/pages/9-7-semiconductors-and-doping' },
    { label: 'Sze & Ng, Physics of Semiconductor Devices, 3rd ed., ch. 1–2 (intrinsic densities; the p–n junction)', url: 'https://onlinelibrary.wiley.com/doi/book/10.1002/0470068329' },
    { label: 'Shockley (1949), The theory of p–n junctions in semiconductors, Bell Syst. Tech. J. 28, 435', url: 'https://doi.org/10.1002/j.1538-7305.1949.tb03645.x' },
    { label: 'NASA, Juno mission overview (solar arrays)', url: 'https://www.nasa.gov/mission/juno/' },
  ],
});
