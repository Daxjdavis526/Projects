// The ideal gas multiplicity: counting position and momentum states of N
// atoms in a box (with h³ per state and 1/N! for identical atoms), the
// Sackur–Tetrode entropy checked against tabulated entropies of the noble
// gases, free expansion, mixing and the Gibbs paradox.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, R, AMU, H, sackurTetrode, r4, texNum, apart } from './_count.js';

const t = String.raw;
// noble gases: atomic mass (u) and the CODATA key value of the standard molar entropy at 298.15 K, 1 bar (J/(mol K))
const NOBLE = { He: ['helium', 4.002602, 126.153], Ne: ['neon', 20.1797, 146.328], Ar: ['argon', 39.948, 154.846], Kr: ['krypton', 83.798, 164.085], Xe: ['xenon', 131.293, 169.685] };
const COL = { He: 'accent', Ne: 'teal', Ar: 'good', Kr: 'warn', Xe: 'violet' };
// Sackur–Tetrode molar entropy as expression text in T (Tv) and P in bar (Pv)
const stExpr = (mU, Tv, Pv = '1') => `${r4(R)}*(ln(${KB}*(${Tv})/((${Pv})*1e5)*(2*pi*${mU}*${AMU}*${KB}*(${Tv})/(${H})^2)^1.5) + 2.5)`;

function stGraph({ T = null, marks = true, sliders, readouts, gases = Object.keys(NOBLE), caption }) {
  const curves = gases.map((g) => ({ fn: stExpr(NOBLE[g][1], '10^x', sliders ? 'P' : '1'), color: COL[g], domain: [1, 3.3], label: NOBLE[g][0], labelAt: 3.3, labelDx: 4, labelDy: g === 'Kr' ? 4 : g === 'Xe' ? -6 : 0 }));
  const points = marks ? gases.map((g) => ({ x: r4(Math.log10(298.15)), y: NOBLE[g][2], r: 4, color: COL[g] })) : [];
  return {
    type: 'graph',
    params: {
      x: [1, 3.75], y: [60, 220], aspect: 'wide', xlog: true, xlabel: 'temperature T (K, log scale)', ylabel: 'molar entropy (J/(mol·K))', axesAt: 'edge',
      curves, points, ...(T !== null ? { vlines: [{ x: typeof T === 'number' ? r4(Math.log10(T)) : T, color: 'gold', label: typeof T === 'number' ? `${T} K` : '' }] } : {}), ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption: caption ?? 'Curves: the Sackur–Tetrode entropy of each noble gas as an ideal gas at 1 bar (no fitted parameters). Dots: tabulated standard entropies at 298.15 K (CODATA key values). Below its boiling point each real gas would have condensed; the curves there describe an imagined ideal gas.',
  };
}

// a box with a partition: gas on one or both sides
function boxPic({ left = 'gas', right = 'vacuum', lc = 'accent', rc = null, caption }) {
  const dots = (x0, color) => [[0.8, 1.4], [1.6, 2.6], [2.4, 1.1], [3.2, 2.1], [1.0, 3.1], [2.7, 3.0], [3.4, 1.0], [0.6, 2.2]].map(([x, y]) => ({ x: r4(x0 + x), y, r: 4, color }));
  return {
    type: 'graph',
    params: {
      x: [0, 10], y: [0, 4.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['1 + 8*t', '0.6'], t: [0, 1], color: 'ink2', width: 3 }, { param: ['1 + 8*t', '3.6'], t: [0, 1], color: 'ink2', width: 3 }, { param: ['1', '0.6 + 3*t'], t: [0, 1], color: 'ink2', width: 3 }, { param: ['9', '0.6 + 3*t'], t: [0, 1], color: 'ink2', width: 3 }, { param: ['5', '0.6 + 3*t'], t: [0, 1], color: 'bad', width: 2, dash: true }],
      points: [...dots(1, lc), ...(rc ? dots(5, rc) : []), { x: 3, y: 4.15, r: 0.01, color: lc, label: left, labelDx: -3.2 * left.length }, { x: 7, y: 4.15, r: 0.01, color: rc || 'ink3', label: right, labelDx: -3.2 * right.length }, { x: 5, y: 0.25, r: 0.01, color: 'bad', label: 'partition (removed)', labelDx: -56 }],
    },
    caption: caption ?? 'An insulated box divided by a partition, which is then removed. Schematic.',
  };
}

const EX = { m: NOBLE.Ar[1], T: 298.15, P: 1e5 };
EX.mass = EX.m * AMU; EX.VN = (KB * EX.T) / EX.P; EX.vQ = (H / Math.sqrt(2 * Math.PI * EX.mass * KB * EX.T)) ** 3; EX.S = sackurTetrode(EX.m, EX.T, EX.P);

export default lesson({
  id: 'phys3700.T2.5',
  title: 'The ideal gas multiplicity',
  minutes: 15, difficulty: 4,
  intro: t`For a gas, count position and momentum together. One atom in a box of volume $V$ with momentum on a sphere of radius $\sqrt{2mU}$ has a number of states proportional to $V$ times that sphere’s area, divided by $h^3$ — quantum mechanics gives each state a cell of size $h$ in each position–momentum pair. For $N$ atoms the momentum sphere has $3N$ dimensions, and swapping identical atoms gives nothing new, so we divide by $N!$. Taking the log with Stirling gives the **Sackur–Tetrode** entropy of a monatomic ideal gas:

$$S = Nk\left[\ln\!\left(\frac{V}{N}\left(\frac{4\pi mU}{3Nh^2}\right)^{3/2}\right) + \frac52\right].$$

It has no adjustable parameters — and it reproduces the measured entropies of the noble gases.`,
  symbols: [
    { tex: 'N,\\ V,\\ U', text: 'the number of atoms, the volume (m³) and the total kinetic energy (J); for an ideal monatomic gas $U = \\tfrac32NkT$' },
    { tex: 'm', text: 'the mass of one atom, in kg' },
    { tex: 'h', text: 'Planck’s constant, $6.626\\times10^{-34}$ J s: the size of one quantum state in each position–momentum pair' },
    { tex: '\\tfrac{1}{N!}', text: 'the correction for identical atoms: exchanging two of them is not a new microstate. It is what makes $S$ grow in proportion to $N$' },
    { tex: '\\tfrac52', text: 'the constant left over from Stirling’s approximations of $N!$ and $(3N/2)!$' },
  ],
  why: 'Sackur–Tetrode is the first entropy of a real substance computed purely from counting — and its V and U dependence gives the ideal gas law and U = (3/2)NkT back in T3.',
  visual: {
    ...stGraph({
    T: 'log10(T)',
    sliders: [
      { key: 'T', label: 'Temperature $T$', min: 10, max: 5000, value: 298.15, logScale: true, unit: '\\text{K}', explain: 'The gas temperature (the slider is logarithmic).' },
      { key: 'P', label: 'Pressure $P$', min: 0.01, max: 100, value: 1, logScale: true, unit: '\\text{bar}', explain: 'Lower pressure means more volume per atom, so more position states.' },
    ],
    readouts: [
      { label: 'argon: $S$ (J/(mol·K))', expr: stExpr(NOBLE.Ar[1], 'T', 'P'), digits: 4 },
      { label: 'helium: $S$', expr: stExpr(NOBLE.He[1], 'T', 'P'), digits: 4 },
      { label: 'per atom, argon: $S/Nk$', expr: `(${stExpr(NOBLE.Ar[1], 'T', 'P')})/${r4(R)}`, digits: 4 },
    ],
    }),
    title: 'Entropy from counting, against the tables',
    lead: t`Each curve is the Sackur–Tetrode entropy of a noble gas, computed from its atomic mass alone. The dots are the tabulated standard entropies at 298.15 K and 1 bar. Change the temperature and pressure and read the entropy.`,
    tasks: [
      'Look at 298.15 K and 1 bar: every curve passes through its dot.',
      'Lower the pressure by a factor of 10: every entropy rises by R ln 10 ≈ 19.1 J/(mol·K) — more volume per atom, more position states.',
      'Compare helium and xenon: the heavier atom has more entropy, because more momentum states fit below the same energy.',
    ],
  },
  example: {
    prompt: t`Compute the Sackur–Tetrode entropy of one mole of argon ($m = 39.948$ u) at 298.15 K and 1 bar, and compare with the tabulated $154.846$ J/(mol·K).`,
    visual: stGraph({ T: 298.15, gases: ['He', 'Ar', 'Xe'], caption: 'Sackur–Tetrode curves for helium, argon and xenon at 1 bar, with the tabulated entropies at 298.15 K as dots.' }),
    steps: [
      { label: 'Rewrite', text: t`With $U = \tfrac32NkT$, $\dfrac{4\pi mU}{3Nh^2} = \dfrac{2\pi mkT}{h^2}$, so $S = Nk\left[\ln\dfrac{V/N}{v_Q} + \tfrac52\right]$ with the **quantum volume** $v_Q = \left(\dfrac{h^2}{2\pi mkT}\right)^{3/2}$.` },
      { label: 'Volume per atom', text: t`$V/N = kT/P = \dfrac{(1.381\times10^{-23})(298.15)}{10^{5}} = ${texNum(EX.VN, 4)}$ m³.` },
      { label: 'Quantum volume', text: t`$m = ${texNum(EX.mass, 4)}$ kg, so $v_Q = ${texNum(EX.vQ, 4)}$ m³ — about $(${texNum(Math.cbrt(EX.vQ) * 1e12, 3)}\ \text{pm})^3$.` },
      { label: 'Entropy', text: t`$\ln(${texNum(EX.VN / EX.vQ, 4)}) + 2.5 = ${fmt(Math.log(EX.VN / EX.vQ), 5)} + 2.5 = ${fmt(Math.log(EX.VN / EX.vQ) + 2.5, 5)}$; times $R$: $S = ${fmt(EX.S, 5)}$ J/(mol·K).` },
      { label: 'Compare', text: t`The tabulated value is 154.846. Historically, calorimetry of the noble gases (integrating $C_P/T$ up from near absolute zero) confirmed the formula; today’s tables are computed from it. Counting quantum states gives a real, measurable entropy.` },
    ],
    answer: t`$S \approx ${fmt(EX.S, 5)}$ J/(mol·K), matching the tabulated 154.846.`,
  },
  practice: [
    num({
      id: 'free-expansion', difficulty: 2,
      gen(r) {
        const n = r.pick([0.5, 1, 2]), f = r.pick([2, 3, 4]), dS = n * R * Math.log(f);
        return {
          prompt: t`$${n}$ mol of an ideal gas expands freely into a vacuum, from volume $V$ to $${f}V$, in an insulated rigid box. What is its entropy change?`,
          answer: dS, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: 0, feedback: 'No heat flows, but entropy is not heat: the multiplicity grows because each atom has more room.' }, { value: n * R * (f - 1), feedback: 'Entropy depends on ln V.' }, { value: n * R * Math.log10(f), feedback: 'Use the natural log.' }], dS),
          hints: [t`$U$ and $N$ are unchanged; only $V$ changes in Sackur–Tetrode.`, t`$\Delta S = Nk\ln(V_f/V_i) = nR\ln ${f}$.`],
          teach: t`At fixed $U$ and $N$, $\Delta S = Nk\ln(V_f/V_i)$: each atom gains $\ln(V_f/V_i)$ in position states.`,
          explain: t`$\Delta S = nR\ln ${f} = (${n})(8.314)(${fmt(Math.log(f), 4)}) = ${fmt(dS, 4)}$ J/K — positive, with no heat at all: free expansion is irreversible.`,
          visual: boxPic({ caption: `An insulated rigid box: gas on the left; the partition is removed and the gas fills ${f === 2 ? 'twice' : `${f} times`} the volume. Schematic.` }),
        };
      },
    }),
    mcq({
      id: 'why-Nfact', difficulty: 2,
      prompt: t`Why does the multiplicity of an ideal gas include the factor $1/N!$?`,
      choices: [
        'Identical atoms cannot be told apart: exchanging two gives the same microstate, so N! orderings count once',
        'It normalises the probabilities',
        'It accounts for collisions between atoms',
        'It removes the zero-point energy',
      ],
      answer: 0,
      why: { 1: 'Ω is a count, not a probability.', 2: 'Ideal-gas atoms do not interact, and N! has nothing to do with collisions.', 3: 'A free atom in a box has no zero-point term in this count.' },
      hints: ['Two helium atoms swap places. Has anything measurable changed?'],
      teach: 'Identical particles: divide by the N! permutations that relabel the same state.',
      explain: t`Counting positions and momenta for labelled atoms counts each physical state $N!$ times. Without the $1/N!$, entropy would not be extensive: doubling a gas would not double its $S$ (the Gibbs paradox).`,
      visual: boxPic({ left: 'atoms', right: 'more atoms', rc: 'accent', caption: 'A box of identical atoms: relabelling them gives the same physical state. Schematic.' }),
    }),
    num({
      id: 'sackur', difficulty: 3,
      gen(r) {
        const g = r.pick(['He', 'Ne', 'Kr', 'Xe']), [name, mU] = NOBLE[g], T = r.pick([100, 300, 1000]), S = sackurTetrode(mU, T, 1e5);
        return {
          prompt: t`Use Sackur–Tetrode, $S = R\left[\ln\dfrac{kT/P}{v_Q} + \tfrac52\right]$ with $v_Q = \left(\dfrac{h^2}{2\pi mkT}\right)^{3/2}$, to find the molar entropy of ${name} ($m = ${mU}$ u) at ${T} K and 1 bar.`,
          answer: S, units: 'J/(mol K)', tol: { rel: 0.005 },
          errors: apart([{ value: S - 2.5 * R, feedback: t`Add the $\tfrac52$ inside the bracket.` }, { value: sackurTetrode(mU, T, 1e5) - R * Math.log(1e5 / 101325), feedback: '1 bar is 10⁵ Pa (close to, but not, 1 atm).' }], S),
          hints: [t`$kT/P = ${texNum((KB * T) / 1e5, 4)}$ m³ and $m = ${texNum(mU * AMU, 4)}$ kg.`, t`$v_Q = ${texNum((H / Math.sqrt(2 * Math.PI * mU * AMU * KB * T)) ** 3, 4)}$ m³; then $S = R[\ln(V/N\,/\,v_Q) + 2.5]$.`],
          teach: 'Sackur–Tetrode: molar entropy from mass, temperature and pressure alone.',
          explain: t`$\ln\dfrac{${texNum((KB * T) / 1e5, 4)}}{${texNum((H / Math.sqrt(2 * Math.PI * mU * AMU * KB * T)) ** 3, 4)}} = ${fmt(S / R - 2.5, 5)}$, so $S = 8.314\times${fmt(S / R, 5)} = ${fmt(S, 5)}$ J/(mol·K).`,
          visual: stGraph({ T, gases: [g], marks: T !== 300, caption: `The Sackur–Tetrode curve for ${name} at 1 bar, with ${T} K marked (the dot is the tabulated value at 298.15 K).` }),
        };
      },
    }),
    num({
      id: 'mixing', difficulty: 2,
      gen(r) {
        const n = r.pick([0.5, 1, 2]), dS = 2 * n * R * Math.LN2;
        return {
          prompt: t`An insulated box holds $${n}$ mol of helium on one side of a partition and $${n}$ mol of argon on the other, at the same temperature and pressure. The partition is removed and they mix. What is the entropy of mixing?`,
          answer: dS, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: n * R * Math.LN2, feedback: 'Both gases double their volume: count each.' }, { value: 0, feedback: 'The gases are different, so mixing is irreversible and raises the entropy.' }], dS),
          hints: [t`Each gas expands into twice its volume, independently of the other (ideal gases).`, t`$\Delta S = 2\times nR\ln2$.`],
          teach: t`Mixing two different ideal gases at equal $T$ and $P$: each expands into the whole volume.`,
          explain: t`Each gas gains $nR\ln2$: $\Delta S = 2(${n})(8.314)(0.6931) = ${fmt(dS, 4)}$ J/K.`,
          visual: boxPic({ left: 'helium', right: 'argon', rc: 'warn', caption: 'Helium and argon at the same temperature and pressure, separated by a partition that is then removed. Schematic.' }),
        };
      },
    }),
    mcq({
      id: 'gibbs', difficulty: 3,
      prompt: 'The same box now has argon on both sides, at the same temperature and pressure. The partition is removed. What is the entropy change?',
      choices: [
        'Zero: with identical atoms, the state after is indistinguishable from the state before (the 1/N! guarantees this)',
        t`$2nR\ln 2$, the same as for two different gases`,
        t`$nR\ln 2$, half the mixing entropy`,
        'Negative, because the gas becomes more uniform',
      ],
      answer: 0,
      why: { 1: 'That treats argon atoms as labelled “left” and “right” — the Gibbs paradox. Identical atoms carry no such labels.', 2: 'There is nothing to mix: reinserting the partition restores the original state exactly.', 3: 'Entropy of an isolated system cannot fall, and here it does not change at all.' },
      hints: ['Could you reverse the process by sliding the partition back in?', 'Does Sackur–Tetrode change when N and V both double at fixed V/N and U/N?'],
      teach: 'The Gibbs paradox: mixing identical gases changes nothing, and the 1/N! makes the entropy agree.',
      explain: t`Sackur–Tetrode depends on $V/N$ and $U/N$, which are unchanged, and $S$ simply doubles with the amount: $\Delta S = 0$. Without the $1/N!$, the formula would predict $2nR\ln2$ — a paradox that needed quantum indistinguishability to resolve.`,
      visual: boxPic({ left: 'argon', right: 'argon', rc: 'accent', caption: 'Argon on both sides at the same temperature and pressure. Schematic.' }),
    }),
    num({
      id: 'shell', difficulty: 3,
      gen(r) {
        const d = r.pick([30, 300, 3000]), eps = r.pick([0.01, 0.001]), f = 1 - (1 - eps) ** d;
        return {
          prompt: t`The momentum states of $N$ atoms fill a ball in $3N$ dimensions, whose volume grows as $r^{3N}$. For $3N = ${d}$, what fraction of the ball’s volume lies within the outer ${eps * 100}% of its radius?`,
          answer: f, tol: { rel: 0.01, abs: 1e-4 },
          errors: apart([{ value: eps, feedback: 'In three dimensions the outer shell is a small part of the volume; in many dimensions it is not. Use (1 − ε)ᵈ.' }, { value: (1 - eps) ** d, feedback: 'That is the fraction *inside* the shell. Subtract from 1.' }], f),
          hints: [t`The inner ball of radius $(1-\varepsilon)r$ holds a fraction $(1-\varepsilon)^{d}$ of the volume.`, t`Shell fraction $= 1 - (1 - ${eps})^{${d}}$.`],
          teach: 'In many dimensions almost all of a ball’s volume sits near its surface — why the gas multiplicity counts the sphere’s area.',
          explain: t`$1 - (${fmt(1 - eps, 4)})^{${d}} = ${fmt(f, 4)}$. For $3N \sim 10^{24}$, essentially the whole volume is in an arbitrarily thin shell: fixing $U$ exactly or only roughly gives the same entropy.`,
          visual: { type: 'graph', params: { x: [0, 3200], y: [0, 1.05], aspect: 'wide', xlabel: 'number of dimensions d', ylabel: 'fraction in the outer shell', axesAt: 'edge', curves: [{ fn: `1 - (1 - ${eps})^x`, color: 'accent', domain: [1, 3200] }], vlines: [{ x: d, color: 'gold', label: `d = ${d}` }] }, caption: `The fraction of a d-dimensional ball’s volume within ${eps * 100}% of its surface, against d.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ism', difficulty: 3, transfer: true,
      gen(r) {
        const [phase, ncm, T] = r.pick([['warm neutral medium', 0.5, 8000], ['cold neutral medium', 40, 100]]);
        const m = 1.00784 * AMU, vQ = (H / Math.sqrt(2 * Math.PI * m * KB * T)) ** 3, VN = 1 / (ncm * 1e6), s = Math.log(VN / vQ) + 2.5;
        return {
          prompt: t`The ${phase} of the galaxy is mostly atomic hydrogen at about $${texNum(ncm, 2)}$ atoms per cm³ and $${texNum(T, 2)}$ K. Treating it as a monatomic ideal gas of H atoms ($m = 1.008$ u), find its entropy per atom, $S/(Nk)$, from Sackur–Tetrode. (Ignore the atoms’ internal spin states and the helium.)`,
          answer: s, tol: { rel: 0.005 },
          errors: apart([{ value: s - 2.5, feedback: t`Include the $+\tfrac52$.` }, { value: Math.log(1 / ncm / vQ) + 2.5, feedback: 'Convert the density to per m³ (× 10⁶) before forming V/N.' }], s),
          hints: [t`$V/N = 1/n$ with $n = ${texNum(ncm * 1e6, 2)}\ \text{m}^{-3}$.`, t`$v_Q = (h^2/2\pi mkT)^{3/2} = ${texNum(vQ, 3)}$ m³; $S/Nk = \ln(V/N\,/\,v_Q) + 2.5$.`],
          teach: 'Dilute, warm gas has a huge volume per atom compared with its quantum volume — and so a large entropy per atom.',
          explain: t`$V/N = ${texNum(VN, 3)}$ m³ and $v_Q = ${texNum(vQ, 3)}$ m³, so $S/Nk = \ln(${texNum(VN / vQ, 3)}) + 2.5 = ${fmt(s, 4)}$ — against about 18.6 for argon in a room. (The ignored spin states would add $\ln 4 \approx 1.4$ per atom.)`,
          visual: stGraph({ T: null, gases: ['He', 'Ar'], caption: 'For comparison: helium and argon at 1 bar. Interstellar gas is 10¹⁸ to 10²⁰ times more dilute, which by itself adds roughly 40 to 45 to S/Nk.' }),
        };
      },
    }),
    mcq({
      id: 'cp-two-routes', difficulty: 3,
      prompt: 'A gas doubles its volume once by free expansion into a vacuum and, in a separate run, by slow isothermal expansion against a piston, between the same two states. Compare the entropy changes of the gas.',
      choices: [
        'Equal: S is a state function, so both are Nk ln 2; only the isothermal route takes in heat (Q = TΔS)',
        'Only the isothermal expansion changes the entropy, because only it involves heat',
        'Only the free expansion changes the entropy, because it is irreversible',
        'The free expansion has the larger change, because it is faster',
      ],
      answer: 0,
      why: { 1: 'Entropy belongs to the state; the free expansion reaches the same final state with no heat at all.', 2: 'Irreversibility shows up in the *total* entropy (gas plus surroundings), not in a different ΔS for the gas.', 3: 'Speed does not enter a state function.' },
      hints: ['Is entropy a property of the state or of the path?', 'What happens to the surroundings in each case?'],
      teach: 'ΔS of the system depends only on the end states; reversibility is decided by the total, system plus surroundings.',
      explain: t`Both give $\Delta S_\text{gas} = Nk\ln2$. In the slow isothermal route the reservoir loses exactly that much entropy ($Q/T$), so the total is unchanged: reversible. In free expansion nothing else changes, so the total rises: irreversible.`,
      visual: boxPic({ caption: 'One of the two routes: removing the partition lets the gas fill the box with no work and no heat. Schematic.' }),
    }),
    num({
      id: 'cp-heat-at-V', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2]), ratio = r.pick([2, 3, 4]), dS = 1.5 * n * R * Math.log(ratio);
        return {
          prompt: t`$${n}$ mol of a monatomic ideal gas is heated in a rigid container until its absolute temperature is ${ratio} times larger. By how much does its entropy rise?`,
          answer: dS, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: n * R * Math.log(ratio), feedback: t`At fixed $V$, $S$ depends on $U^{3/2}$, so the factor is $\tfrac32$.` }, { value: 2.5 * n * R * Math.log(ratio), feedback: t`$\tfrac52$ belongs to constant pressure ($C_P$); the volume is fixed here.` }], dS),
          hints: [t`In Sackur–Tetrode, $S$ contains $Nk\ln U^{3/2} = \tfrac32Nk\ln U$, and $U \propto T$.`, t`$\Delta S = \tfrac32nR\ln(T_f/T_i)$.`],
          teach: t`At fixed volume, $\Delta S = \tfrac32 Nk\ln(T_f/T_i)$ for a monatomic ideal gas.`,
          explain: t`$\Delta S = \tfrac32(${n})(8.314)\ln${ratio} = ${fmt(dS, 4)}$ J/K — the same as $\int C_V\,dT/T$, as T3 will show.`,
          visual: stGraph({ gases: ['He'], marks: false, caption: 'Helium’s Sackur–Tetrode entropy against temperature (at 1 bar, so here the volume grows too). On a log-T axis it is a straight line.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §2.5–2.6', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Cox, Wagman & Medvedev, CODATA Key Values for Thermodynamics (1989): standard entropies of the noble gases', url: 'https://www.codata.info/resources/databases/key1.html' },
  ],
});
