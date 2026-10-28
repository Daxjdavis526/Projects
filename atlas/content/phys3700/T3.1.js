// Temperature from entropy: 1/T = (∂S/∂U)_{N,V}, derived from maximizing the
// total entropy of two systems sharing energy; the slope picture (heat flows
// toward the steeper S(U)); T(U) and the heat capacity of an Einstein solid;
// measuring entropy by ∫C dT/T, and the third law.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, NA, H, CL, EV, einPic, r4, texNum, apart } from './_count.js';

const t = String.raw;
// S/k of an Einstein solid (Stirling's large-N form) as expression text of q, N
const sExpr = (N, q = 'x') => `((${q})+${N})*ln((${q})+${N}) - (${q})*ln(${q}) - ${N}*ln(${N})`;
const sOf = (N, q) => (q + N) * Math.log(q + N) - q * Math.log(q) - N * Math.log(N);
const kTe = (N, q) => 1 / Math.log(1 + N / q);                    // kT/ε of an Einstein solid
const cE = (x) => (x * x * Math.exp(x)) / (Math.exp(x) - 1) ** 2;   // C/Nk at x = ε/kT

// an S(q) curve with the tangent drawn at q0 (tangent optional)
function sPic(N, q0, { tangent = true, label = true, caption, qmax = 4 * N } = {}) {
  const s0 = sOf(N, q0), m = Math.log(1 + N / q0), top = sOf(N, qmax);
  return {
    type: 'graph',
    params: {
      x: [0, qmax], y: [0, r4(top * 1.12)], aspect: 'wide', xlabel: 'energy U, in quanta q', ylabel: 'S / k', axesAt: 'edge',
      curves: [{ fn: sExpr(N), domain: [0.001, qmax], color: 'accent', label: `N = ${N}`, labelAt: qmax * 0.85, labelDy: 14 },
        ...(tangent ? [{ fn: `${r4(s0)} + ${r4(m)}*(x - ${q0})`, domain: [Math.max(0, q0 - 0.3 * qmax), Math.min(qmax, q0 + 0.3 * qmax)], color: 'gold', width: 2 }] : [])],
      points: [{ x: q0, y: r4(s0), r: 5, color: 'gold', label: label ? `q = ${q0}` : '', labelDx: 8, labelDy: 16 }],
    },
    caption: caption ?? 'Entropy of an Einstein solid against its energy (Stirling’s large-N form). The gold line is the tangent: its slope is 1/kT per quantum.',
  };
}

const EX = { eps: 0.025, T: 300 };
EX.thE = (EX.eps * EV) / KB; EX.x = EX.thE / EX.T; EX.c = cE(EX.x); EX.C3 = 3 * EX.c * KB * NA;

export default lesson({
  id: 'phys3700.T3.1',
  title: 'Temperature from entropy',
  minutes: 14, difficulty: 3,
  intro: t`Two systems A and B share a fixed total energy. Energy settles where the total entropy $S_A + S_B$ is greatest, and at that maximum a joule moved from B to A changes the two entropies by equal and opposite amounts: $\partial S_A/\partial U_A = \partial S_B/\partial U_B$. That slope is the quantity two systems in equilibrium share — so it is what a thermometer reads. Its reciprocal **defines temperature**:

$$\frac{1}{T} = \left(\frac{\partial S}{\partial U}\right)_{N,V}.$$

A steep $S(U)$ means a little energy buys a lot of entropy: the system is **cold**, and it pulls energy in. A shallow slope means hot. Heat flows from the shallow slope to the steep one because that raises the total entropy. Nothing here mentions molecules moving — temperature is a property of the entropy curve. (The introductory version, temperature as what thermometers agree on, is in [PHYS 2210 M16.1](#/lesson/phys2210.M16.1).)`,
  symbols: [
    { tex: 'T', text: 'the temperature, in kelvin' },
    { tex: 'S', text: 'the entropy $k\\ln\\Omega$, in J/K' },
    { tex: 'U', text: 'the internal energy, in J' },
    { tex: '(\\partial S/\\partial U)_{N,V}', text: 'how fast entropy rises with energy while the number of particles $N$ and the volume $V$ are held fixed (no work, no particles exchanged)' },
  ],
  why: 'Every later definition — pressure, chemical potential, free energy, the Boltzmann factor — is built the same way, as a slope of the entropy; and negative temperatures (T3.2) only make sense from this definition.',
  visual: {
    type: 'graph',
    title: 'Temperature as the slope of S(U)',
    lead: t`The curve is the entropy of an Einstein solid of $N$ oscillators against its energy, counted in quanta $\epsilon = \hbar\omega$. Drag the gold point along it: the tangent’s slope is $\epsilon/kT$, so a steep tangent is a cold solid.`,
    tasks: [
      'Drag the point toward q = 0: the slope grows without limit, and kT/ε falls toward zero — near absolute zero one quantum adds a great deal of entropy.',
      'Drag to large q: the slope flattens and kT/ε approaches U/(Nε) — equipartition: each oscillator holds about kT.',
      'Double N at fixed q: the curve steepens, so the same energy spread over more oscillators is colder.',
    ],
    params: {
      x: [0, 800], y: [0, 900], aspect: 'wide', xlabel: 'energy U, in quanta q', ylabel: 'S / k', axesAt: 'edge',
      sliders: [{ key: 'N', label: 'Oscillators $N$', min: 50, max: 400, step: 10, value: 200, explain: 'How many quantum oscillators share the energy (three per atom in a real solid).' }],
      curves: [{ fn: sExpr('N'), domain: [0.001, 800], color: 'accent' }],
      tangent: { fn: sExpr('N'), at: 150 },
      readouts: [
        { label: 'energy $q = U/\\epsilon$', expr: 'x0', digits: 3 },
        { label: 'slope $\\epsilon/kT$', expr: 'slope', digits: 3 },
        { label: '$kT/\\epsilon$', expr: '1/slope', digits: 3 },
        { label: '$U/(N\\epsilon)$', expr: 'x0/N', digits: 3 },
      ],
    },
    caption: 'Entropy from Stirling’s large-N form of ln Ω for an Einstein solid; slopes are per quantum, so they read ε/kT. Identical oscillators; no other degrees of freedom.',
  },
  example: {
    prompt: t`An Einstein solid has $N$ oscillators sharing $q$ quanta of size $\epsilon$, with $S/k = (q+N)\ln(q+N) - q\ln q - N\ln N$. (a) Find $T(U)$ and invert it to $U(T)$. (b) Find the heat capacity. (c) Take $\epsilon = ${EX.eps}$ eV and three oscillators per atom: what is the molar heat capacity at ${EX.T} K?`,
    visual: sPic(200, 150, { caption: 'S/k against q for N = 200: the tangent’s slope at any energy is ε/kT.' }),
    steps: [
      { label: 'Differentiate', text: t`With $U = q\epsilon$, $\dfrac{1}{T} = \dfrac{\partial S}{\partial U} = \dfrac{k}{\epsilon}\dfrac{\partial (S/k)}{\partial q} = \dfrac{k}{\epsilon}\ln\dfrac{q+N}{q}$.` },
      { label: 'Invert', text: t`$e^{\epsilon/kT} = 1 + N/q$, so $U = q\epsilon = \dfrac{N\epsilon}{e^{\epsilon/kT} - 1}$. At high temperature $e^{\epsilon/kT} \approx 1 + \epsilon/kT$ and $U \approx NkT$: equipartition, $\tfrac12 kT$ for each of an oscillator’s two quadratic terms.` },
      { label: 'Heat capacity', text: t`$C = \dfrac{dU}{dT} = Nk\,\dfrac{x^2e^x}{(e^x-1)^2}$ with $x = \epsilon/kT$. It tends to $Nk$ when hot and falls to zero when cold — the freezing-out that classical physics could not explain.` },
      { label: 'Numbers', text: t`$\epsilon/k = ${fmt(EX.thE, 4)}$ K, so $x = ${fmt(EX.x, 3)}$ and $C/Nk = ${fmt(EX.c, 3)}$. Per mole of atoms ($N = 3N_A$): $C = 3R\times${fmt(EX.c, 3)} = ${fmt(EX.C3, 3)}$ J/(mol·K).` },
      { label: 'Sense check', text: t`The classical (Dulong–Petit) value is $3R = 24.9$ J/(mol·K); real solids at room temperature sit a little below it, as this does. The model is crude at low temperature (real solids follow Debye’s $T^3$ law), but the slope definition of $T$ is exact.` },
    ],
    answer: t`$kT/\epsilon = 1/\ln(1 + N/q)$; $U = N\epsilon/(e^{\epsilon/kT}-1)$; $C = Nk\,x^2e^x/(e^x-1)^2$; at ${EX.T} K, $C \approx ${fmt(EX.C3, 3)}$ J/(mol·K).`,
  },
  practice: [
    mcq({
      id: 'flow-direction', difficulty: 1,
      prompt: t`Two systems are in thermal contact. At their present energies, A’s entropy rises by $2.0\times10^{-3}$ J/K for each joule it gains, and B’s by $3.0\times10^{-3}$ J/K per joule. Which way does energy flow?`,
      choices: ['From A to B: B gains more entropy than A loses', 'From B to A: A has the smaller slope, so it needs energy', 'From B to A, because energy flows toward the system with the lower temperature reading', 'Neither: both slopes are positive, so both systems are in equilibrium'],
      answer: 0,
      why: { 1: 'A smaller slope means A gains little entropy per joule — it is the hotter one. Moving energy into A would lower the total entropy.', 2: t`A’s temperature is $1/(2.0\times10^{-3}) = 500$ K and B’s is $333$ K: B is colder, so energy flows into B, not A.`, 3: 'Equilibrium needs equal slopes, not merely positive ones.' },
      hints: ['Move one joule from A to B. How much entropy does A lose, and how much does B gain?'],
      teach: 'Energy flows toward the steeper S(U), because that raises the total entropy.',
      explain: t`One joule from A to B: $\Delta S = -2.0\times10^{-3} + 3.0\times10^{-3} = +1.0\times10^{-3}$ J/K. So the flow goes A → B. In temperatures: $T_A = 500$ K, $T_B = 333$ K — heat flows hot to cold, as it must.`,
      visual: {
        type: 'graph',
        params: { x: [0, 10], y: [0, 10], aspect: 'wide', xlabel: 'energy of each system (schematic)', ylabel: 'entropy (schematic)', axesAt: 'edge', xticks: 0, yticks: 0,
          curves: [{ fn: '4*ln(1 + x)', domain: [0, 10], color: 'warn', label: 'A', labelAt: 9, labelDy: -14 }, { fn: '2*ln(1 + x)', domain: [0, 10], color: 'accent', label: 'B', labelAt: 9, labelDy: 16 },
            { fn: `${r4(4 * Math.log(7))} + ${r4(4 / 7)}*(x - 6)`, domain: [4, 8], color: 'gold', width: 1.8 }, { fn: `${r4(2 * Math.log(2))} + 1*(x - 1)`, domain: [0, 2.6], color: 'gold', width: 1.8 }],
          points: [{ x: 6, y: r4(4 * Math.log(7)), r: 5, color: 'warn', label: 'A now', labelDx: -10, labelDy: -14 }, { x: 1, y: r4(2 * Math.log(2)), r: 5, color: 'accent', label: 'B now', labelDx: 8, labelDy: 14 }] },
        caption: 'Schematic entropy curves of the two systems at their present energies, with tangents (gold). Shapes are illustrative; only the comparison of slopes matters.',
      },
    }),
    num({
      id: 'kT-einstein', difficulty: 2,
      gen(r) {
        const N = r.pick([100, 200, 300]), q = r.pick([20, 50, 100, 300, 600]), v = kTe(N, q);
        return {
          prompt: t`An Einstein solid has $N = ${N}$ oscillators and $q = ${q}$ quanta. Using $1/T = (k/\epsilon)\ln(1 + N/q)$, what is its temperature in units of $\epsilon/k$ (that is, $kT/\epsilon$)?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / v, feedback: t`That is the slope $\epsilon/kT$. Temperature is its reciprocal.` }, { value: q / N, feedback: t`$U/(N\epsilon)$ equals $kT/\epsilon$ only in the high-temperature limit.` }, { value: 1 / Math.log10(1 + N / q), feedback: 'Use the natural logarithm.' }], v),
          hints: [t`Compute $\ln(1 + ${N}/${q})$, then take the reciprocal.`],
          teach: t`For an Einstein solid $kT/\epsilon = 1/\ln(1 + N/q)$.`,
          explain: t`$\ln(1 + ${fmt(N / q, 4)}) = ${fmt(Math.log(1 + N / q), 4)}$, so $kT/\epsilon = ${fmt(v, 4)}$. ${q / N >= 1 ? t`With $${fmt(q / N, 3)}$ quanta per oscillator this is close to the classical value $q/N$ (it exceeds it by about $\tfrac12$).` : t`With fewer than one quantum per oscillator quantization matters: this is far above the classical guess $q/N = ${fmt(q / N, 3)}$.`}`,
          visual: sPic(N, q, { label: false, caption: 'The entropy curve of this solid with the tangent at its energy. The slope is ε/kT; the question asks for its reciprocal.' }),
        };
      },
    }),
    num({
      id: 'T-from-dS', difficulty: 1,
      gen(r) {
        const T = r.pick([77, 150, 273, 300, 450, 600]), Q = r.pick([0.5, 1, 2, 5]);
        const dS = +(Q / T).toPrecision(3), v = Q / dS;
        return {
          prompt: t`A block is held at fixed volume. Adding $${Q}$ J of energy — small enough that its temperature hardly changes — raises its entropy by $${texNum(dS * 1000, 3)}\times10^{-3}$ J/K. What is its temperature?`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: dS / Q, feedback: t`$\Delta S/\Delta U$ is $1/T$. Invert it.` }, { value: dS * Q, feedback: t`Divide, do not multiply: $T = \Delta U/\Delta S$.` }], v),
          hints: [t`$1/T = \partial S/\partial U \approx \Delta S/\Delta U$.`],
          teach: t`For a small energy change at fixed $V$ and $N$, $\Delta S \approx \Delta U/T$.`,
          explain: t`$T = \Delta U/\Delta S = ${Q}/(${texNum(dS, 3)}) = ${fmt(v, 3)}$ K.`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, 6], aspect: 'wide', xlabel: 'energy U (schematic)', ylabel: 'entropy S (schematic)', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: '2.5*ln(1 + x)', domain: [0, 10], color: 'accent' }, { fn: `${r4(2.5 * Math.log(6))} + ${r4(2.5 / 6)}*(x - 5)`, domain: [3.5, 6.5], color: 'gold', width: 1.8 }], arrows: [{ from: [5, r4(2.5 * Math.log(6))], to: [6.3, r4(2.5 * Math.log(6))], color: 'warn', label: 'ΔU', labelDx: -6, labelDy: 16 }, { from: [6.3, r4(2.5 * Math.log(6))], to: [6.3, r4(2.5 * Math.log(7.3))], color: 'violet', label: 'ΔS', labelDx: 6, labelDy: 4 }] }, caption: 'Over a small step the curve is nearly straight: ΔS/ΔU is the slope 1/T. Schematic.' },
        };
      },
    }),
    num({
      id: 'equipartition-from-S', difficulty: 2,
      gen(r) {
        const [gasName, f] = r.pick([['helium (monatomic: 3 quadratic terms per molecule)', 3], ['nitrogen near room temperature (5 quadratic terms)', 5]]), T = r.pick([200, 300, 500]);
        const U = (f / 2) * 8.314462618 * T;
        return {
          prompt: t`For one mole of ${gasName} the entropy depends on energy as $S = \tfrac{${f}}{2}R\ln U + (\text{terms in } V, N)$. Use $1/T = \partial S/\partial U$ to find its energy at $${T}$ K.`,
          answer: U, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: 8.314462618 * T, feedback: t`Keep the factor $f/2 = ${f}/2$ from the logarithm’s coefficient.` }, { value: (f / 2) * KB * T, feedback: 'That is per molecule. For one mole use R, not k.' }], U),
          hints: [t`$\partial S/\partial U = \tfrac{${f}}{2}R/U$.`, t`Set it equal to $1/T$ and solve: $U = \tfrac{${f}}{2}RT$.`],
          teach: t`$S = \tfrac f2 Nk\ln U + \dots$ gives $U = \tfrac f2 NkT$: equipartition follows from the entropy.`,
          explain: t`$1/T = \tfrac{${f}}{2}R/U$, so $U = \tfrac{${f}}{2}RT = \tfrac{${f}}{2}(8.314)(${T}) = ${fmt(U, 4)}$ J.`,
          visual: { type: 'graph', params: { x: [0, 15], y: [0, 40], aspect: 'wide', xlabel: 'U (kJ)', ylabel: 'S − const (J/K)', axesAt: 'edge', curves: [{ fn: `${f / 2}*8.314*ln(x)`, domain: [0.05, 15], color: 'accent' }] }, caption: 'S against U for one mole (constant dropped): a logarithm, whose slope (f/2)R/U falls as U grows — hotter systems gain less entropy per joule.' },
        };
      },
    }),
    num({
      id: 'einstein-C', difficulty: 2,
      gen(r) {
        const ratio = r.pick([0.25, 0.5, 1, 2]), x = 1 / ratio, v = cE(x);
        return {
          prompt: t`An Einstein solid has $\epsilon/k = T_E$. What is its heat capacity per oscillator, $C/Nk = \dfrac{x^2e^x}{(e^x-1)^2}$ with $x = \epsilon/kT$, at $T = ${ratio}\,T_E$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1, feedback: t`That is the classical value, reached only when $T \gg T_E$.` }, { value: cE(ratio), feedback: t`$x = \epsilon/kT = T_E/T = ${fmt(x, 3)}$, not $T/T_E$.` }], v),
          hints: [t`$x = T_E/T = ${fmt(x, 3)}$.`],
          teach: 'Quantized oscillators freeze out: C falls from Nk toward zero as kT drops below ε.',
          explain: t`$x = ${fmt(x, 3)}$: $C/Nk = ${fmt(x * x, 4)}\,e^{${fmt(x, 3)}}/(e^{${fmt(x, 3)}}-1)^2 = ${fmt(v, 3)}$.`,
          visual: { type: 'graph', params: { x: [0, 2.5], y: [0, 1.15], aspect: 'wide', xlabel: 'T ÷ Einstein temperature', ylabel: 'C / Nk', axesAt: 'edge', curves: [{ fn: '(1/x)^2*e^(1/x)/(e^(1/x) - 1)^2', domain: [0.05, 2.5], color: 'accent' }], hlines: [{ y: 1, label: 'classical', color: 'ink3' }], vlines: [{ x: ratio, color: 'gold' }] }, caption: 'The Einstein heat capacity per oscillator against temperature. Gold: the temperature asked about.' },
        };
      },
    }),
    num({
      id: 'debye-S', difficulty: 3,
      gen(r) {
        const T = r.pick([2, 4, 5, 10]), C = r.pick([0.02, 0.05, 0.1, 0.2]), S = C / 3;
        return {
          prompt: t`At low temperature a solid’s heat capacity follows Debye’s law, $C = aT^3$. A sample has $C = ${C}$ J/K at $${T}$ K. What is its entropy at $${T}$ K? (Take $S = 0$ at absolute zero — the third law.)`,
          answer: S, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: C, feedback: t`$S = \int_0^T C\,dT'/T'$, not $C$ itself.` }, { value: C / T, feedback: t`Integrate $aT'^2$ from 0 to $T$: that gives $aT^3/3$, not $C/T$.` }, { value: C / 4, feedback: t`$\int_0^T aT'^2\,dT' = aT^3/3$: divide by 3.` }], S),
          hints: [t`With $dS = C\,dT/T$ at fixed volume, $S(T) = \int_0^T \dfrac{C(T')}{T'}dT'$.`, t`$\int_0^T aT'^2\,dT' = aT^3/3 = C(T)/3$.`],
          teach: t`Entropy is measured by integrating $C/T$ up from absolute zero.`,
          explain: t`$S(T) = \int_0^T aT'^2\,dT' = \tfrac13 aT^3 = C(T)/3 = ${fmt(S, 3)}$ J/K. The integral converges only because $C \to 0$ as $T \to 0$ — the third law in action.`,
          visual: { type: 'graph', params: { x: [0, 1.2], y: [0, 1.5], aspect: 'wide', xlabel: 'temperature ÷ the temperature asked about', ylabel: 'scaled', axesAt: 'edge', curves: [{ fn: 'x^3', domain: [0, 1.14], color: 'accent', label: 'C', labelAt: 1.1, labelDx: 8, labelDy: 0 }, { fn: 'x^2', domain: [0, 1.2], color: 'violet', label: 'C/T', labelAt: 1.18, labelDx: -36, labelDy: -10 }], shade: [{ fn: 'x^2', from: 0, to: 1, color: 'violet', alpha: 0.25 }], vlines: [{ x: 1, color: 'gold' }] }, caption: 'Debye’s T³ law (valid only at low temperature): the heat capacity C and the integrand C/T, both scaled. The shaded area under C/T up to the temperature asked about is the entropy.' },
        };
      },
    }),
    mcq({
      id: 'not-KE', difficulty: 2,
      prompt: 'Which statement about temperature is right in general, not just for an ideal gas?',
      choices: [
        t`Two systems with the same $\partial S/\partial U$ exchange no net energy when put in contact`,
        'Temperature is the average kinetic energy per molecule',
        'Two systems at the same temperature have the same energy per particle',
        'The system with more entropy is always the hotter one',
      ],
      answer: 0,
      why: { 1: 'For an ideal gas the average kinetic energy is (3/2)kT, but spins, quantum solids and photons do not fit that picture — temperature is defined by the entropy slope.', 2: 'A copper block and a helium balloon at 300 K have very different energies per atom (and the solid’s oscillators are partly frozen out).', 3: 'Hotness depends on the slope of S(U), not on how much entropy a system has.' },
      hints: ['What is it that two systems in thermal equilibrium must share?'],
      teach: t`Temperature is $1/(\partial S/\partial U)$: it is equal between systems that exchange no net energy.`,
      explain: t`Equal slopes mean moving energy either way leaves $S_A + S_B$ unchanged at its maximum: no net flow. “Average kinetic energy” is a consequence for some systems, not the definition.`,
      visual: einPic({ mode: 'pair', NA: 300, NB: 200, q: 100, start: 60, panels: 'bars', scale: 'linear' }, t`Two Einstein solids sharing 100 quanta: the peak of $\Omega_A\Omega_B$ is where their entropy slopes match — equal temperatures.`),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bolometer', difficulty: 3, transfer: true,
      gen(r) {
        const lam = r.pick([0.35, 0.55, 0.85, 1.38, 2.1]), T = 0.1, E = (H * CL) / (lam * 1e-3), v = E / (KB * T);
        return {
          prompt: t`The Planck satellite’s bolometers were cooled to $0.1$ K. One absorbs a single photon of wavelength $${lam}$ mm. Treating the bolometer as staying at $0.1$ K, by how much does its entropy rise? Give $\Delta S/k$.`,
          answer: v, tol: { rel: 0.015 },
          errors: apart([{ value: E / KB, feedback: 'Divide by the temperature too: ΔS = ΔU/T.' }, { value: v * KB, feedback: 'That is ΔS in J/K. The question asks for ΔS/k.' }, { value: (H * CL) / (lam * KB * T), feedback: 'Convert millimetres to metres.' }], v),
          hints: [t`$\Delta S = \Delta U/T$ with $\Delta U = hc/\lambda$.`, t`$\Delta S/k = \dfrac{hc}{\lambda kT}$; $hc = 1.986\times10^{-25}$ J·m.`],
          teach: t`At low temperature the slope $1/T$ is steep: a tiny energy buys a lot of entropy.`,
          explain: t`$hc/\lambda = ${texNum(E, 3)}$ J and $kT = ${texNum(KB * T, 3)}$ J, so $\Delta S/k = ${fmt(v, 3)}$: one photon multiplies the bolometer’s microstates by $e^{${fmt(v, 3)}}$. At room temperature the same photon would add about $${fmt(v / 3000, 2)}k$. (A real bolometer warms slightly; that changes the answer by a negligible amount for a heat capacity this large compared with one photon.)`,
          visual: { type: 'graph', params: { x: [0.05, 1], y: [0, 3200], aspect: 'wide', xlabel: 'bolometer temperature (K)', ylabel: 'ΔS/k for one photon', axesAt: 'edge', curves: [{ fn: `${r4((H * CL) / (lam * 1e-3 * KB))}/x`, domain: [0.05, 1], color: 'accent' }], vlines: [{ x: 0.1, label: '0.1 K', color: 'gold' }] }, caption: 'Entropy added by one photon of this wavelength against the absorber’s temperature: ΔS/k = hc/(λkT). Colder absorbers gain more.' },
        };
      },
    }),
    num({
      id: 'cp-solid-T', difficulty: 3,
      gen(r) {
        const epsMeV = r.pick([10, 20, 30]), N = r.pick([100, 300]), q = r.pick([50, 100, 200]);
        const T = (epsMeV * 1e-3 * EV) / KB * kTe(N, q);
        return {
          prompt: t`An Einstein solid of $${N}$ oscillators, each with level spacing $\epsilon = ${epsMeV}$ meV, holds $${q}$ quanta. What is its temperature in kelvin?`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: (epsMeV * 1e-3 * EV) / KB * (q / N), feedback: t`$kT = U/N$ holds only when $q \gg N$. Use $kT/\epsilon = 1/\ln(1 + N/q)$.` }, { value: (epsMeV * 1e-3 * EV) / KB / kTe(N, q), feedback: t`You used $\ln(1 + N/q)$ as $kT/\epsilon$; it is $\epsilon/kT$.` }], T),
          hints: [t`$kT/\epsilon = 1/\ln(1 + N/q)$.`, t`$\epsilon/k = ${fmt((epsMeV * 1e-3 * EV) / KB, 4)}$ K.`],
          teach: t`Find $kT/\epsilon$ from the entropy slope, then multiply by $\epsilon/k$.`,
          explain: t`$kT/\epsilon = 1/\ln(1 + ${N}/${q}) = ${fmt(kTe(N, q), 4)}$; with $\epsilon/k = ${fmt((epsMeV * 1e-3 * EV) / KB, 4)}$ K, $T = ${fmt(T, 3)}$ K.`,
          visual: sPic(N, q, { label: false, caption: 'This solid’s entropy curve with the tangent at its energy (slope ε/kT per quantum).' }),
        };
      },
    }),
    mcq({
      id: 'cp-convex', difficulty: 3,
      prompt: t`Suppose a system’s $S(U)$ curves **upward** (its slope grows as $U$ grows). What happens to its temperature when it gains energy?`,
      choices: [
        'It falls: the slope 1/T rises, so the heat capacity is negative',
        'It rises, as it does for every system',
        'It stays the same, because temperature depends only on the slope at equilibrium',
        'Such a curve is impossible, because entropy cannot increase faster than energy',
      ],
      answer: 0,
      why: { 1: 'For ordinary systems S(U) bends downward, so 1/T falls and T rises with energy. An upward bend reverses that.', 2: 'The slope changes along the curve, so T does too.', 3: 'Nothing forbids it — self-gravitating systems behave this way.' },
      hints: [t`$1/T$ is the slope. If the slope grows with $U$, what does $T$ do?`, t`$C = dU/dT$: what sign has it if $T$ falls while $U$ rises?`],
      teach: 'Concave-up S(U) means a negative heat capacity: the system cools as it gains energy.',
      explain: t`A rising slope means a rising $1/T$, so $T$ falls as $U$ grows: $C = dU/dT < 0$. Stars and star clusters behave this way (lose energy, heat up), and theory predicts it for black holes, whose entropy grows as $M^2$ ($S \propto U^2$ with $U = Mc^2$). An ordinary system with negative $C$ could not be in stable contact with a reservoir. The black-hole case is a theoretical prediction — see T11.2.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 10], aspect: 'wide', xlabel: 'energy U (schematic)', ylabel: 'entropy S (schematic)', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: '0.09*x^2', domain: [0, 10], color: 'violet', label: 'curving up', labelAt: 7, labelDx: 10, labelDy: 12 }, { fn: '4*ln(1 + x)/ln(11)*2.2', domain: [0, 10], color: 'accent', label: 'ordinary', labelAt: 8.5, labelDy: 16 }] }, caption: 'Two schematic entropy curves: an ordinary one bending down, and one bending up.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §3.1–3.2', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Planck Collaboration, Planck 2013 results I (HFI bolometers at 0.1 K)', url: 'https://arxiv.org/abs/1303.5062' },
  ],
});
