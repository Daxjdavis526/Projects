// Mechanical and diffusive equilibrium: pressure P = T(∂S/∂V)_{U,N} and the
// chemical potential μ = −T(∂S/∂N)_{U,V}, each found by maximizing the total
// entropy when volume or particles can move; the ideal gas law and μ = kT ln(n/n_Q)
// from the Sackur–Tetrode entropy; particles flowing toward lower μ; the
// barometric formula and planetary scale heights.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, AMU, H, EV, r4, texNum, apart } from './_count.js';

const t = String.raw;
const SIGMA = 5.670374419e-8, CL = 299792458, ARAD = (4 * SIGMA) / CL;       // radiation constant a = 4σ/c
const vQ = (mU, T) => (H / Math.sqrt(2 * Math.PI * mU * AMU * KB * T)) ** 3;  // quantum volume, m³
const muOf = (mU, T, P) => KB * T * Math.log((P / (KB * T)) * vQ(mU, T));     // μ of an ideal gas, J
const GAS = { He: 4.0026, Ne: 20.180, Ar: 39.948, N2: 28.0134 };

// S_total/Nk (up to a constant) against the fraction f of particles in box A, which has a fraction a of the volume
const sMix = (a) => `x*ln(${a}/x) + (1-x)*ln((1-${a})/(1-x))`;
const boxPic = (fA, aV, caption) => ({
  type: 'graph',
  params: { x: [0, 1], y: [-0.6, 0], aspect: 'wide', xlabel: 'fraction of the particles in A', ylabel: 'S/Nk (relative)', axesAt: 'edge',
    curves: [{ fn: sMix(aV), domain: [0.001, 0.999], color: 'accent' }],
    points: [{ x: r4(fA), y: r4(fA * Math.log(aV / fA) + (1 - fA) * Math.log((1 - aV) / (1 - fA))), r: 5, color: 'gold', label: 'now', labelDx: 8, labelDy: 14 }] },
  caption,
});

const EX = { m: GAS.He, T: 300, P: 101325 };
EX.n = EX.P / (KB * EX.T); EX.vq = vQ(EX.m, EX.T); EX.nvq = EX.n * EX.vq; EX.mu = KB * EX.T * Math.log(EX.nvq); EX.muEV = EX.mu / EV;

export default lesson({
  id: 'phys3700.T3.3',
  title: 'Mechanical and diffusive equilibrium',
  minutes: 15, difficulty: 3,
  intro: t`Temperature came from letting two systems trade energy and maximizing the total entropy. Let them trade **volume** too — a piston that slides — and at the maximum their values of $\partial S/\partial V$ match; let them trade **particles** — a porous wall — and $\partial S/\partial N$ matches. Multiplying by $T$ to get familiar units defines the pressure and the **chemical potential**:

$$P = T\left(\frac{\partial S}{\partial V}\right)_{U,N}, \qquad \mu = -T\left(\frac{\partial S}{\partial N}\right)_{U,V}.$$

The minus sign is chosen so that particles flow from **high** $\mu$ to **low** $\mu$, just as energy flows from high $T$ to low. For an ideal gas the Sackur–Tetrode entropy of [T2.5](#/lesson/phys3700.T2.5) gives back $PV = NkT$ — the ideal gas law, derived by counting — and $\mu = kT\ln(n/n_Q)$: the more crowded the gas, the higher its chemical potential and the harder it pushes particles away. Chemical potential is the diffusive driver behind everything from a gas spreading through a room to the thinning of a planet’s atmosphere with height.`,
  symbols: [
    { tex: 'P', text: 'the pressure, in Pa: the push that decides which way a free piston moves' },
    { tex: '\\mu', text: 'the chemical potential, in J (often quoted in eV): the push that decides which way particles move' },
    { tex: 'V,\\ N', text: 'the volume (m³) and the number of particles' },
    { tex: 'T', text: 'the temperature, in K' },
    { tex: '(\\partial S/\\partial V)_{U,N}', text: 'how much entropy rises per cubic metre of extra volume, with energy and particle number held fixed' },
    { tex: '(\\partial S/\\partial N)_{U,V}', text: 'how much entropy changes per extra particle, with energy and volume held fixed' },
  ],
  why: 'Chemical potential runs the rest of the course: phase coexistence (T5.3), chemical equilibrium (T5.4), and the Fermi and Bose gases of T7 are all statements that μ is equal or that particles flow down its gradient.',
  visual: {
    type: 'graph',
    title: 'Particles flowing down the chemical potential',
    lead: t`Two boxes at the same temperature share $N$ ideal-gas particles through a porous wall. Box A has a fraction $a$ of the total volume. The curve is the total entropy against the fraction of particles in A. Drag the gold point: the tangent’s slope is $(\mu_B - \mu_A)/kT$.`,
    tasks: [
      t`Put the point left of the peak: the slope is positive, $\mu_A$ is below $\mu_B$, and particles drift into A — uphill on the curve.`,
      t`Find the peak: there $\mu_A = \mu_B$, and the densities are equal (the fraction in A equals its share of the volume).`,
      'Change the volume share a: the peak moves with it. Equal μ, not equal particle numbers, is the condition.',
    ],
    params: {
      x: [0, 1], y: [-0.7, 0.05], aspect: 'wide', xlabel: 'fraction of the particles in A', ylabel: 'S/Nk (relative)', axesAt: 'edge',
      sliders: [{ key: 'a', label: 'Volume share of A, $a$', min: 0.2, max: 0.8, step: 0.05, value: 0.3, explain: 'Box A’s fraction of the total volume.' }],
      curves: [{ fn: 'x*ln(a/x) + (1-x)*ln((1-a)/(1-x))', domain: [0.001, 0.999], color: 'accent' }],
      tangent: { fn: 'x*ln(a/x) + (1-x)*ln((1-a)/(1-x))', at: 0.7 },
      readouts: [
        { label: 'fraction in A', expr: 'x0', digits: 3 },
        { label: '$n_A/n_B$', expr: '(x0/a)/((1-x0)/(1-a))', digits: 3 },
        { label: '$(\\mu_A - \\mu_B)/kT$', expr: 'ln((x0/a)/((1-x0)/(1-a)))', digits: 3 },
        { label: 'slope', expr: 'slope', digits: 3 },
      ],
    },
    caption: 'Ideal gases at one temperature: S/Nk = Σ fraction × ln(volume share/fraction), plus a constant. Real gases follow this when dilute.',
  },
  example: {
    prompt: t`(a) Show that the Sackur–Tetrode entropy $S = Nk\left[\ln\dfrac{V}{N v_Q} + \dfrac52\right]$ gives $PV = NkT$. (b) Find the chemical potential of helium at $${EX.T}$ K and 1 atm. Here $v_Q = \left(\dfrac{h^2}{2\pi m kT}\right)^{3/2}$ is the quantum volume, and $n_Q = 1/v_Q$.`,
    visual: boxPic(0.5, 0.5, 'Two equal boxes holding equal amounts of gas: the peak of total entropy, where μ is the same in both.'),
    steps: [
      { label: 'Pressure', text: t`At fixed $U$ and $N$, $v_Q$ (which depends on $U/N$) is fixed, so $S = Nk\ln V + \text{const}$ and $\left(\dfrac{\partial S}{\partial V}\right)_{U,N} = \dfrac{Nk}{V}$. Then $P = T\cdot Nk/V$: **the ideal gas law, from counting**.` },
      { label: 'Chemical potential', text: t`Differentiating with respect to $N$ (with $U = \tfrac32 NkT$ held fixed, so $T$ and $v_Q$ change too) gives $\mu = -kT\ln\dfrac{V}{Nv_Q} = kT\ln\dfrac{n}{n_Q}$, with $n = N/V$.` },
      { label: 'Numbers', text: t`$n = P/kT = ${texNum(EX.n, 4)}\ \text{m}^{-3}$. For helium ($m = 4.003$ u) at ${EX.T} K, $v_Q = ${texNum(EX.vq, 3)}\ \text{m}^3$, so $n/n_Q = nv_Q = ${texNum(EX.nvq, 3)}$.` },
      { label: 'Result', text: t`$\mu = kT\ln(${texNum(EX.nvq, 3)}) = ${fmt(Math.log(EX.nvq), 3)}\,kT = ${fmt(EX.muEV, 3)}$ eV (with $kT = ${fmt((KB * EX.T) / EV, 3)}$ eV).` },
      { label: 'Sense check', text: t`$\mu$ is negative and about $${fmt(-Math.log(EX.nvq), 2)}\,kT$ in size because the gas is about $${texNum(1 / EX.nvq, 1)}$ times more dilute than its quantum concentration — the condition for it to behave classically. Squeeze it and $\mu$ rises.` },
    ],
    answer: t`$PV = NkT$; for helium at ${EX.T} K and 1 atm, $\mu = kT\ln(n/n_Q) = ${fmt(EX.muEV, 3)}$ eV.`,
  },
  practice: [
    mcq({
      id: 'what-equalizes', difficulty: 1,
      prompt: 'Two gases are separated by a piston that slides freely and conducts heat, but lets no molecules through. At equilibrium, which quantities must be equal on the two sides?',
      choices: ['Temperature and pressure', 'Temperature, pressure and chemical potential', 'Pressure only', 'Temperature, pressure and density'],
      answer: 0,
      why: { 1: 'μ equalizes only if particles can cross. Here they cannot, so the two μ need not match.', 2: 'The piston also conducts heat, so energy flows until the temperatures match too.', 3: 'Equal T and P give equal density only if the gases are the same and ideal; it is not a condition of equilibrium.' },
      hints: ['Which exchanges can happen: energy, volume, particles?'],
      teach: 'Whatever is exchanged sets the condition: energy → equal T, volume → equal P, particles → equal μ.',
      explain: 'Heat flows until T is equal; the piston moves until P is equal (at equal T, the entropy slope ∂S/∂V is then equal). With no particle exchange, μ can differ.',
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '3.4', lower: '0.6', from: 0.5, to: 4.6, color: 'accent', alpha: 0.3 }, { fn: '3.4', lower: '0.6', from: 4.9, to: 9.5, color: 'warn', alpha: 0.3 }], curves: [{ param: ['4.75', 't'], t: [0.6, 3.4], color: 'ink', width: 5 }], points: [{ x: 2.5, y: 2, r: 0.01, color: 'accent', label: 'gas 1', labelDx: -20 }, { x: 7.2, y: 2, r: 0.01, color: 'warn', label: 'gas 2', labelDx: -20 }, { x: 4.75, y: 3.7, r: 0.01, color: 'ink', label: 'sliding piston (conducts heat)', labelDx: -90 }] }, caption: 'A cylinder divided by a free, heat-conducting piston. Schematic.' },
    }),
    num({
      id: 'P-excluded', difficulty: 2,
      gen(r) {
        const V = r.pick([0.25, 0.5, 1]), T = r.pick([250, 300, 400]), b = 3.9e-5, R = 8.314462618;
        const P = (R * T) / (V * 1e-3 - b), Pid = (R * T) / (V * 1e-3);
        return {
          prompt: t`One mole of nitrogen is squeezed into $${V}$ L at $${T}$ K. Each mole of molecules excludes about $b = 3.9\times10^{-5}$ m³ of the volume from the others, so the entropy is $S = nR\ln(V - nb) + (\text{terms in } U, N)$. Use $P = T(\partial S/\partial V)$ to find the pressure.`,
          answer: P / 1e6, units: 'MPa', tol: { rel: 0.01 },
          errors: apart([{ value: Pid / 1e6, feedback: 'That is the ideal-gas value: differentiate ln(V − nb), not ln V.' }, { value: (R * T) / (V * 1e-3 + b) / 1e6, feedback: 'The excluded volume is subtracted: the molecules have less room, not more.' }], P / 1e6),
          hints: [t`$\partial S/\partial V = nR/(V - nb)$.`, t`$P = nRT/(V - nb)$ with $V = ${V}\times10^{-3}$ m³.`],
          teach: 'Pressure is T times the entropy gained per unit of extra volume.',
          explain: t`$P = \dfrac{nRT}{V - nb} = \dfrac{(8.314)(${T})}{${texNum(V * 1e-3, 3)} - ${texNum(b, 2)}} = ${fmt(P / 1e6, 3)}$ MPa, against $${fmt(Pid / 1e6, 3)}$ MPa for an ideal gas. (Attraction between molecules, the other van der Waals correction, would lower it again; this keeps only the excluded volume.)`,
          visual: { type: 'graph', params: { x: [0.1, 2], y: [0, 20], aspect: 'wide', xlabel: 'volume of 1 mol (L)', ylabel: 'P (MPa)', axesAt: 'edge', curves: [{ fn: `${r4((R * T) / 1e3)}/x`, domain: [0.15, 2], color: 'ink3', dash: true, label: 'ideal', labelAt: 1.6, labelDy: 14 }, { fn: `${r4((R * T) / 1e3)}/(x - 0.039)`, domain: [0.15, 2], color: 'accent', label: 'excluded volume', labelAt: 0.35, labelDx: 8 }], vlines: [{ x: V, color: 'gold' }] }, caption: 'Pressure against volume at this temperature: ideal gas (dashed) and with excluded volume only. Gold: the volume asked about.' },
        };
      },
    }),
    num({
      id: 'mu-gas', difficulty: 2,
      gen(r) {
        const g = r.pick(['He', 'Ne', 'Ar']), T = r.pick([200, 300, 500]), Pbar = r.pick([1, 10, 100]);
        const mu = muOf(GAS[g], T, Pbar * 1e5) / EV, vq = vQ(GAS[g], T), n = (Pbar * 1e5) / (KB * T);
        return {
          prompt: t`What is the chemical potential of ${g === 'He' ? 'helium' : g === 'Ne' ? 'neon' : 'argon'} ($m = ${GAS[g]}$ u) as an ideal gas at $${T}$ K and $${Pbar}$ bar? Use $\mu = kT\ln(n v_Q)$ with $v_Q = (h^2/2\pi mkT)^{3/2}$. Give it in eV.`,
          answer: mu, units: 'eV', tol: { rel: 0.01 },
          errors: apart([{ value: -mu, feedback: t`Sign: $nv_Q \ll 1$, so its logarithm — and $\mu$ — is negative.` }, { value: (KB * T * Math.log10(n * vq)) / EV, feedback: 'Use the natural log.' }], mu),
          hints: [t`$n = P/kT = ${texNum(n, 3)}\ \text{m}^{-3}$.`, t`$v_Q = ${texNum(vq, 3)}$ m³, so $nv_Q = ${texNum(n * vq, 3)}$.`],
          teach: t`$\mu = kT\ln(n/n_Q)$: negative and many $kT$ deep for any classical gas.`,
          explain: t`$nv_Q = ${texNum(n * vq, 3)}$, $\ln(nv_Q) = ${fmt(Math.log(n * vq), 4)}$, and $kT = ${fmt((KB * T) / EV, 4)}$ eV: $\mu = ${fmt(mu, 3)}$ eV.`,
          visual: { type: 'graph', params: { x: [-1, 3], y: [-0.7, 0], aspect: 'wide', xlog: true, xlabel: 'pressure (bar)', ylabel: 'μ (eV)', axesAt: 'edge', curves: [{ fn: `${r4((KB * T) / EV)}*ln(10^x*1e5/${KB * T}*${vq})`, domain: [-1, 3], color: 'accent' }], vlines: [{ x: r4(Math.log10(Pbar)), color: 'gold' }] }, caption: 'The chemical potential of this gas at this temperature against pressure (log scale): it rises by kT ln 10 for every factor of ten. Gold: the pressure asked about.' },
        };
      },
    }),
    mcq({
      id: 'flow-mu', difficulty: 2,
      prompt: t`Two connected tanks of the same gas at the same temperature have $\mu_1 = -0.40$ eV and $\mu_2 = -0.35$ eV. Which way do molecules flow?`,
      choices: ['From tank 2 to tank 1', 'From tank 1 to tank 2, toward the higher chemical potential', 'From tank 1 to tank 2, because −0.40 eV has the larger magnitude', 'They do not flow: both chemical potentials are negative'],
      answer: 0,
      why: { 1: 'Particles flow down the chemical potential, from high to low — like heat from high to low T.', 2: 'Compare signed values: −0.35 eV is higher than −0.40 eV.', 3: 'The sign of μ does not matter, only the difference.' },
      hints: [t`Moving a particle from 2 to 1 changes the total entropy by $(\mu_2 - \mu_1)/T$. Is that positive?`],
      teach: 'Particles move from high μ to low μ, raising the total entropy.',
      explain: t`$\Delta S = (\mu_2 - \mu_1)/T > 0$ for each molecule moved from 2 to 1. Tank 2 has the higher $\mu$ — at equal $T$, the higher density — so molecules leave it until the two $\mu$ match.`,
      visual: boxPic(0.25, 0.5, 'Total entropy against the share of molecules in tank 1 (equal volumes). The present state, left of the peak: entropy rises if molecules move into tank 1.'),
    }),
    num({
      id: 'mu-ratio', difficulty: 2,
      gen(r) {
        const f = r.pick([2, 3, 5, 10]), T = r.pick([77, 300, 600]), v = KB * T * Math.log(f) / EV * 1000;
        return {
          prompt: t`An ideal gas at $${T}$ K is compressed at constant temperature until its density is $${f}$ times larger. By how much does its chemical potential rise? Give it in meV.`,
          answer: v, units: 'meV', tol: { rel: 0.01 },
          errors: apart([{ value: (KB * T * (f - 1)) / EV * 1000, feedback: t`$\mu$ depends on $\ln n$, so a factor of ${f} adds $kT\ln ${f}$.` }, { value: (KB * T * Math.log10(f)) / EV * 1000, feedback: 'Use the natural log.' }], v),
          hints: [t`$\mu = kT\ln(n/n_Q)$; at fixed $T$, $n_Q$ is unchanged.`],
          teach: t`At fixed $T$, multiplying the density by $f$ raises $\mu$ by $kT\ln f$.`,
          explain: t`$\Delta\mu = kT\ln ${f} = (${fmt((KB * T) / EV * 1000, 4)}\ \text{meV})(${fmt(Math.log(f), 4)}) = ${fmt(v, 3)}$ meV.`,
          visual: { type: 'graph', params: { x: [0, 12], y: [0, 4], aspect: 'wide', xlabel: 'density, relative to the start', ylabel: 'Δμ / kT', axesAt: 'edge', curves: [{ fn: 'ln(x)', domain: [0.5, 12], color: 'accent' }], vlines: [{ x: f, color: 'gold' }] }, caption: 'The rise in chemical potential, in units of kT, against the density ratio: logarithmic.' },
        };
      },
    }),
    num({
      id: 'barometric', difficulty: 3,
      gen(r) {
        const T = r.pick([220, 250, 288]), m = GAS.N2 * AMU, z = (KB * T * Math.LN2) / (m * 9.81) / 1000;
        return {
          prompt: t`In an isothermal atmosphere of nitrogen at $${T}$ K, equal chemical potential at every height — $kT\ln(n/n_Q) + mgz$ the same everywhere — sets the density profile. How high must you climb for the density to halve? ($g = 9.81$ m/s².)`,
          answer: z, units: 'km', tol: { rel: 0.01 },
          errors: apart([{ value: z / Math.LN2, feedback: 'That is the scale height kT/mg, where the density falls by a factor e. Halving needs ln 2 of it.' }, { value: (KB * T * Math.LN2) / (GAS.He * AMU * 9.81) / 1000, feedback: 'Use the mass of an N₂ molecule, 28.01 u.' }], z),
          hints: [t`Equal $\mu$ gives $n(z) = n(0)e^{-mgz/kT}$.`, t`Set $e^{-mgz/kT} = \tfrac12$: $z = \dfrac{kT\ln 2}{mg}$, with $m = 28.01$ u.`],
          teach: 'Gravity adds mgz to each molecule’s chemical potential; equal μ makes the density fall exponentially.',
          explain: t`$z = \dfrac{(1.381\times10^{-23})(${T})(0.693)}{(${texNum(m, 4)})(9.81)} = ${fmt(z, 3)}$ km. (The real atmosphere is not isothermal, so this is an estimate.)`,
          visual: { type: 'graph', params: { x: [0, 1.05], y: [0, 30], aspect: 'wide', xlabel: 'density, relative to the ground', ylabel: 'height (km)', axesAt: 'edge', curves: [{ param: [`e^(-t*${r4((m * 9.81 * 1000) / (KB * T))})`, 't'], t: [0, 30], color: 'accent' }], vlines: [{ x: 0.5, color: 'gold' }] }, caption: 'The density of an isothermal nitrogen atmosphere against height. Gold: half the ground density. Real temperature profiles vary with height.' },
        };
      },
    }),
    num({
      id: 'adiabatic-piston', difficulty: 3,
      gen(r) {
        const nA = r.pick([1, 2]), nB = r.pick([1, 3]), TA = r.pick([300, 400]), TB = r.pick([200, 250]);
        const v = (nA * TA) / (nA * TA + nB * TB);
        return {
          prompt: t`A sealed cylinder is split by a sliding piston that is a **perfect insulator** and lets no gas through. Side A holds $${nA}$ mol at $${TA}$ K and side B holds $${nB}$ mol at $${TB}$ K, both ideal gases. When the piston stops moving, what fraction of the cylinder’s volume does side A fill (with those temperatures)?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: nA / (nA + nB), feedback: t`That assumes equal temperatures. The piston insulates, so only the pressures equalize: $n_AT_A/V_A = n_BT_B/V_B$.` }, { value: (nA * TB) / (nA * TB + nB * TA), feedback: 'A hotter gas pushes harder: it needs more volume per mole, not less.' }], v),
          hints: [t`Only volume is exchanged, so only $P$ equalizes: $n_ART_A/V_A = n_BRT_B/V_B$.`, t`$V_A/V = n_AT_A/(n_AT_A + n_BT_B)$.`],
          teach: 'Exchanging volume alone equalizes pressure, not temperature.',
          explain: t`$P_A = P_B$ gives $V_A/V_B = n_AT_A/(n_BT_B) = ${nA * TA}/${nB * TB}$, so $V_A/V = ${fmt(v, 3)}$. (In a real cylinder the piston would overshoot and the temperatures shift as the gases are compressed; this is the balance at the stated temperatures.)`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, 4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '3.4', lower: '0.6', from: 0.5, to: 4.6, color: 'warn', alpha: 0.3 }, { fn: '3.4', lower: '0.6', from: 4.9, to: 9.5, color: 'accent', alpha: 0.3 }], curves: [{ param: ['4.75', 't'], t: [0.6, 3.4], color: 'ink', width: 5 }], points: [{ x: 2.5, y: 2, r: 0.01, color: 'warn', label: `A: ${nA} mol, ${TA} K`, labelDx: -45 }, { x: 7.2, y: 2, r: 0.01, color: 'accent', label: `B: ${nB} mol, ${TB} K`, labelDx: -45 }, { x: 4.75, y: 3.7, r: 0.01, color: 'ink', label: 'insulating piston: where does it stop?', labelDx: -110 }] }, caption: 'Schematic: the piston’s position is the unknown.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-scale-height', difficulty: 3, transfer: true,
      gen(r) {
        const [body, gasTxt, mU, T, g] = r.pick([['Mars', 'carbon dioxide (44.01 u)', 44.01, 210, 3.71], ['Titan', 'nitrogen (28.01 u)', 28.0134, 94, 1.352], ['Venus', 'carbon dioxide (44.01 u)', 44.01, 737, 8.87]]);
        const Hs = (KB * T) / (mU * AMU * g) / 1000;
        return {
          prompt: t`Near the surface of ${body} the atmosphere is mostly ${gasTxt} at about $${T}$ K, with $g = ${g}$ m/s². Treating it as isothermal, find the scale height $kT/mg$ — the climb over which the density falls by a factor $e$.`,
          answer: Hs, units: 'km', tol: { rel: 0.01 },
          errors: apart([{ value: Hs * Math.LN2, feedback: 'That is the half-density height. The scale height is kT/mg itself.' }, { value: (KB * T) / (mU * AMU * 9.81) / 1000, feedback: `Use ${body}’s gravity, not Earth’s.` }], Hs),
          hints: [t`Equal chemical potential at every height gives $n \propto e^{-mgz/kT}$.`, t`$m = ${mU}\times1.661\times10^{-27}$ kg.`],
          teach: 'An isothermal atmosphere thins exponentially with scale height kT/mg.',
          explain: t`$H = \dfrac{kT}{mg} = \dfrac{(1.381\times10^{-23})(${T})}{(${texNum(mU * AMU, 4)})(${g})} = ${fmt(Hs, 3)}$ km. A landing probe’s parachute designers start from exactly this exponential; real profiles add the temperature’s change with height.`,
          visual: { type: 'graph', params: { x: [0, 1.05], y: [0, r4(4 * Hs)], aspect: 'wide', xlabel: 'density, relative to the surface', ylabel: 'height (km)', axesAt: 'edge', curves: [{ param: [`e^(-t/${r4(Hs)})`, 't'], t: [0, r4(4 * Hs)], color: 'accent' }], vlines: [{ x: r4(1 / Math.E), color: 'gold', label: '1/e' }] }, caption: 'Density against height in an isothermal atmosphere (the vertical scale is chosen to fit, so the scale height is hidden in it). Gold: 1/e of the surface density.' },
        };
      },
    }),
    num({
      id: 'cp-radiation', difficulty: 4,
      gen(r) {
        const [where, T] = r.pick([['at the centre of the Sun (standard solar model)', 1.57e7], ['in the core of a massive star', 4e7], ['inside a hohlraum at a laser fusion facility', 3.5e6]]);
        const P = (ARAD * T ** 4) / 3;
        return {
          prompt: t`A photon gas has entropy $S = \tfrac43 a^{1/4}V^{1/4}U^{3/4}$, where $a = 4\sigma/c = 7.566\times10^{-16}$ J/(m³·K⁴). Use $1/T = \partial S/\partial U$ and $P = T\,\partial S/\partial V$ to show $P = U/3V$ with $U/V = aT^4$, then find the radiation pressure ${where}, $T = ${texNum(T, 3)}$ K.`,
          answer: P, units: 'Pa', tol: { rel: 0.01 },
          errors: apart([{ value: ARAD * T ** 4, feedback: t`That is the energy density $u$. The pressure is $u/3$.` }, { value: (SIGMA * T ** 4) / 3, feedback: t`Use $a = 4\sigma/c$, not $\sigma$.` }], P),
          hints: [t`$\partial S/\partial U = \tfrac34 S/U$ and $\partial S/\partial V = \tfrac14 S/V$.`, t`So $T = \tfrac43 U/S$ and $P = T\cdot\tfrac14 S/V = U/3V = aT^4/3$.`],
          teach: 'Pressure as T times ∂S/∂V works for light too: a photon gas pushes with a third of its energy density.',
          explain: t`$P = \dfrac{aT^4}{3} = \dfrac{(7.566\times10^{-16})(${texNum(T, 3)})^4}{3} = ${texNum(P, 3)}$ Pa. ${T > 1e7 ? 'At the Sun’s centre this is a small fraction of the gas pressure (about 2 × 10¹⁶ Pa); in the most massive stars radiation pressure dominates.' : 'Even this is small beside the ablation that does the work: the radiation boils off the capsule’s outer layer, and that rocket-like blow-off drives the implosion.'}`,
          visual: { type: 'graph', params: { x: [6, 8], y: [8, 16], aspect: 'wide', xlog: true, ylog: true, xlabel: 'temperature (K)', ylabel: 'radiation pressure (Pa)', axesAt: 'edge', curves: [{ fn: `log10(${ARAD}/3) + 4*x`, domain: [6, 8], color: 'violet' }], vlines: [{ x: r4(Math.log10(T)), color: 'gold' }] }, caption: 'Radiation pressure aT⁴/3 against temperature on log–log axes: a line of slope 4. Gold: the temperature asked about.' },
        };
      },
    }),
    mcq({
      id: 'cp-lox', difficulty: 2, transfer: true,
      prompt: 'Liquid oxygen sits in a closed propellant tank under its own vapour, and nothing is changing. Which quantity is the same in the liquid and in the vapour?',
      choices: ['The chemical potential of an oxygen molecule', 'The density', 'The energy per molecule', 'The entropy per molecule'],
      answer: 0,
      why: { 1: 'The liquid is about 250 times denser than its vapour at the boiling point; equal density is not required.', 2: 'A vapour molecule carries more energy — the latent heat is the difference.', 3: 'The vapour has more entropy per molecule (L/T more); that is why boiling needs heat.' },
      hints: ['Molecules can cross the liquid surface both ways. What must match for no net flow?'],
      teach: 'Phases that exchange particles coexist only at equal chemical potential (and equal T and P).',
      explain: t`Molecules evaporate and condense across the surface, so at equilibrium $\mu_\text{liquid} = \mu_\text{vapour}$ (as well as equal $T$ and $P$). Everything else differs between the phases. Lesson T5.3 turns this condition into the vapour-pressure curve.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '2.4', lower: '0.4', from: 2, to: 8, color: 'accent', alpha: 0.55 }, { fn: '5.4', lower: '2.4', from: 2, to: 8, color: 'accent', alpha: 0.12 }], curves: [{ param: ['2', 't'], t: [0.4, 5.4], color: 'ink3' }, { param: ['8', 't'], t: [0.4, 5.4], color: 'ink3' }], points: [{ x: 5, y: 1.4, r: 0.01, color: 'ink', label: 'liquid O₂', labelDx: -28 }, { x: 5, y: 4, r: 0.01, color: 'ink2', label: 'vapour', labelDx: -20 }] }, caption: 'A closed tank of liquid oxygen under its own vapour. Schematic.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §3.4–3.5', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NASA Planetary Fact Sheets (surface gravity and temperature)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
