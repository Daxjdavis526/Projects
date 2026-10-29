// The periodic table — building ground-state configurations with the
// Aufbau principle (the n + l, then n, order), Pauli and Hund; reading the
// shell structure from measured ionization energies (NIST): the effective
// charge Z_eff = n√(E_ion/13.6 eV), magnesium’s successive ionization
// energies, the dips at boron and oxygen, transition-metal ions losing 4s
// first, period lengths 2, 8, 8, 18, 18, 32; a Python search of the data for
// the dips; and why ion thrusters fly xenon. Every number is computed here
// or in model/mp-shells.js.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { RYD, U_KG } from './_quanta.js';
import { QE } from './_constants.js';
import * as S from '../../src/viz/model/mp-shells.js';
import { IE_SUCCESSIVE, boxDiagram, tableDots, bars } from './_atoms.js';

const t = String.raw;
const IE = S.ionization;
const zeffOf = (ie, n) => n * Math.sqrt(ie / RYD);
const name = (Z) => S.element(Z).name;
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
const MG = IE_SUCCESSIVE.Mg;
const MG_Z = [zeffOf(MG[0], 3), zeffOf(MG[1], 3), zeffOf(MG[2], 2)];
const shells = (Z) => ({ type: 'mp-shells', params: { Z, maxZ: 86, panels: ['ie'], controls: false, readout: false } });
// standard atomic weights (IUPAC), g/mol
const NOBLE_PROP = { Xe: { Z: 54, M: 131.293 }, Kr: { Z: 36, M: 83.798 }, Ar: { Z: 18, M: 39.948 } };
/** Ionization power per kg/s of propellant, relative to xenon’s. */
const perKg = (g) => IE(NOBLE_PROP[g].Z) / NOBLE_PROP[g].M;
const IE36 = Array.from({ length: 36 }, (_, i) => +IE(i + 1).toFixed(3));
const DIPS36 = S.dips(36);

export default lesson({
  id: 'phys2710.MP9.2',
  title: 'The periodic table',
  minutes: 16, difficulty: 3,
  intro: t`Build an atom by adding electrons one at a time to the lowest free state, two to an orbital (Pauli), spread over a subshell before pairing (Hund). In hydrogen the energy depends on $n$ alone; with other electrons around, an electron with small $l$ dips inside the inner shells and feels more of the nucleus, so 4s fills before 3d and the subshells come in the order of $n + l$, then $n$: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s … Every row of the table starts a new $s$ subshell and ends when a $p$ subshell is full. The measured ionization energies show the shells directly. Treating the outermost electron as hydrogen-like gives

$$E_\text{ion} \approx \frac{Z_\text{eff}^2}{n^2}\,(13.6\ \text{eV}), \qquad Z_\text{eff} = Z - \sigma$$

where the inner electrons screen all but $Z_\text{eff}$ of the nuclear charge.

> The rules came in [The exclusion principle](#/lesson/phys2710.MP9.1). Here: the whole table, and the data that confirm it.`,
  symbols: [
    { tex: 'E_\\text{ion}', text: 'the first ionization energy: the least energy that removes the outermost electron from the neutral atom, in eV (measured; NIST Atomic Spectra Database)' },
    { tex: 'Z_\\text{eff}', text: 'the effective nuclear charge the outermost electron feels, in units of $e$' },
    { tex: 'n', text: 'the outermost electron’s principal quantum number' },
    { tex: '13.6\\ \\text{eV}', text: t`the Rydberg energy $R_\infty hc = ${fmt(RYD, 6)}$ eV, hydrogen’s ionization energy (with an infinitely heavy nucleus)` },
    { tex: 'Z', text: 'the atomic number: the number of protons, and of electrons in the neutral atom' },
    { tex: '\\sigma', text: 'the screening: how much of the nuclear charge the other electrons cancel. A teaching model — penetrating orbitals make it smaller than a simple count of inner electrons' },
  ],
  why: 'Chemistry, the colours of stars and nebulae, the choice of xenon for ion engines and of caesium for atomic clocks all follow from which electron is outermost and how tightly it is held.',
  visual: {
    type: 'mp-shells',
    title: 'The table, built electron by electron',
    lead: t`Left: the subshells of the present period above the noble-gas core, filling as you add electrons. Right: the table built so far, coloured by the subshell being filled (the block). Below: the measured first ionization energies, hydrogen to radon.`,
    tasks: [
      'Run across period 3, from sodium (11) to argon (18): the ionization energy climbs as the nuclear charge grows — with two dips, at aluminium (a new 3p subshell) and at sulfur (the first paired 3p electron).',
      'Step from argon (18) to potassium (19): the new electron goes into 4s, not 3d, and the ionization energy falls from 15.8 eV to 4.3 eV.',
      'Try chromium (24) and copper (29): real exceptions, where one 4s electron moves into 3d to make it half full or full.',
    ],
    params: { Z: 11, maxZ: 86 },
  },
  example: {
    prompt: t`Magnesium’s first three ionization energies are ${fmt(MG[0], 4)} eV, ${fmt(MG[1], 4)} eV and ${fmt(MG[2], 4)} eV (NIST). Explain the pattern, and find the effective charge each removed electron feels.`,
    visual: bars([['first', MG[0], 'accent'], ['second', MG[1], 'accent'], ['third', MG[2], 'bad']], { ylabel: 'ionization energy (eV)', unit: ' eV', caption: 'Magnesium’s first three ionization energies (NIST Atomic Spectra Database): each removes one more electron.' }),
    steps: [
      { label: 'The configuration', text: t`Magnesium, $Z = 12$: $\mathrm{1s}^2\,\mathrm{2s}^2\,\mathrm{2p}^6\,\mathrm{3s}^2$ — a neon core and two 3s electrons outside it.` },
      { label: 'The first electron', text: t`A 3s electron, $n = 3$: $Z_\text{eff} = n\sqrt{E_\text{ion}/13.6\ \text{eV}} = 3\sqrt{${fmt(MG[0], 4)}/13.61} = ${fmt(MG_Z[0], 3)}$. The ten core electrons screen most of the twelve protons; the other 3s electron screens a little, and the 3s cloud penetrates the core, so $Z_\text{eff}$ is more than $12 - 10 = 2$.` },
      { label: 'The second electron', text: t`The other 3s electron, from $\text{Mg}^+$: $Z_\text{eff} = 3\sqrt{${fmt(MG[1], 4)}/13.61} = ${fmt(MG_Z[1], 3)}$. It no longer shares the shell, so it is less screened — about twice as hard to remove.` },
      { label: 'The third electron', text: t`Now a 2p electron of the neon-like core must go, with $n = 2$ and little screening: $Z_\text{eff} = 2\sqrt{${fmt(MG[2], 4)}/13.61} = ${fmt(MG_Z[2], 3)}$. The energy jumps by a factor of ${fmt(MG[2] / MG[1], 2)}.` },
      { label: 'Sense check', text: t`The jump comes after exactly two electrons — magnesium’s two valence electrons — which is why magnesium forms $\text{Mg}^{2+}$ and never $\text{Mg}^{3+}$ in chemistry. All three $Z_\text{eff}$ lie between 1 and 12, and they grow as the screening electrons are stripped away.` },
    ],
    answer: t`$Z_\text{eff} \approx ${fmt(MG_Z[0], 3)}$, $${fmt(MG_Z[1], 3)}$ and $${fmt(MG_Z[2], 3)}$: two 3s electrons come off easily, then the closed $n = 2$ shell costs ${fmt(MG[2] / MG[1], 2)} times more.`,
  },
  practice: [
    mcq({
      id: 'write-config', difficulty: 1,
      gen(r) {
        const Z = r.pick([22, 23, 25, 26]), k = Z - 20;
        return {
          prompt: t`What is the ground-state configuration of ${name(Z)} ($Z = ${Z}$)?`,
          choices: [t`$${S.configTeX(Z)}$`, t`$[\mathrm{Ar}]\,\mathrm{3d}^{${Z - 18}}$`, t`$[\mathrm{Ar}]\,\mathrm{3d}^{${k}}$`, t`$[\mathrm{Ar}]\,\mathrm{4s}^{2}\,\mathrm{4p}^{${k}}$`],
          answer: 0,
          why: {
            1: t`That fills by $n$ alone, as in hydrogen. In a many-electron atom 4s ($n + l = 4$) fills before 3d ($n + l = 5$).`,
            2: t`That is the ion $\text{${S.symbol(Z)}}^{2+}$: when a transition metal is ionized, its 4s electrons leave first. The neutral atom keeps them.`,
            3: t`4p ($n + l = 5$, $n = 4$) comes after 3d ($n + l = 5$, $n = 3$): for equal $n + l$ the smaller $n$ fills first.`,
          },
          hints: [t`After argon (18 electrons) the order is 4s, then 3d, then 4p.`],
          teach: 'Fill in the order of n + l, then n: after the argon core come 4s, then 3d, then 4p.',
          explain: t`${Cap(name(Z))} has ${k + 2} electrons beyond the argon core: two in 4s, then ${k} in 3d — $${S.configTeX(Z)}$. Its place in the d-block (the gold cell) says the same.`,
          visual: { type: 'mp-shells', params: { Z, maxZ: 36, panels: ['table'], hide: ['config'], controls: false, readout: false }, caption: 'The table built up to this element (gold: the d-block, where 3d fills). The configuration is hidden.' },
        };
      },
    }),
    num({
      id: 'zeff-alkali', difficulty: 2,
      gen(r) {
        const Z = r.pick([3, 11, 19, 37, 55]), n = S.outerN(Z), ie = IE(Z), ans = zeffOf(ie, n);
        return {
          prompt: t`${Cap(name(Z))}’s single outer electron is in an $n = ${n}$ s orbital, and its first ionization energy is ${fmt(ie, 4)} eV. What effective nuclear charge $Z_\text{eff}$ does that electron feel?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(ie / RYD), feedback: t`You left out $n$: for a hydrogen-like level, $E = Z_\text{eff}^2(13.6\ \text{eV})/n^2$.` }, { value: (n * ie) / RYD, feedback: t`Take the square root: $Z_\text{eff} = n\sqrt{E_\text{ion}/13.6\ \text{eV}}$.` }],
          hints: [t`Solve $E_\text{ion} = Z_\text{eff}^2 (13.6\ \text{eV})/n^2$ for $Z_\text{eff}$.`, t`$Z_\text{eff} = ${n}\sqrt{${fmt(ie, 4)}/13.61}$.`],
          teach: t`An ionization energy and the principal quantum number give the effective charge the outer electron feels: $Z_\text{eff} = n\sqrt{E_\text{ion}/13.6\ \text{eV}}$.`,
          explain: t`$Z_\text{eff} = ${n}\sqrt{${fmt(ie, 4)}/13.61} = ${fmt(ans, 3)}$. If the ${Z - 1} inner electrons screened perfectly it would be 1; it is more because the s orbital penetrates the core. Down the alkali column it rises — 1.26, 1.84, 2.26, 2.77, 3.21 — yet the ionization energy falls, because $n^2$ grows faster.`,
          visual: shells(Z),
        };
      },
    }),
    mcq({
      id: 'oxygen-dip', difficulty: 2,
      prompt: t`Oxygen has one more proton than nitrogen, yet its first ionization energy is lower: ${fmt(IE(8), 4)} eV against ${fmt(IE(7), 4)} eV. Why?`,
      choices: [
        'Oxygen’s fourth 2p electron has to share an orbital with another electron; their repulsion makes it easier to remove',
        'Oxygen’s 2p electrons are in a higher shell than nitrogen’s, farther from the nucleus',
        'Oxygen has a half-filled 2p subshell, which is especially stable',
        'Oxygen’s extra neutron screens the nuclear charge',
      ],
      answer: 0,
      why: {
        1: 'Both atoms’ outer electrons are 2p, in the same shell.',
        2: 'It is nitrogen (2p³) whose 2p subshell is half filled, one electron in each orbital. Oxygen (2p⁴) has to pair one up.',
        3: 'Neutrons carry no charge and sit in the nucleus: they screen nothing.',
      },
      hints: ['Draw the 2p boxes for nitrogen and for oxygen, using Hund’s rule.'],
      teach: 'The first paired electron in a p subshell is easier to remove — the dips at oxygen, sulfur and selenium.',
      explain: 'Nitrogen’s three 2p electrons sit one to an orbital with parallel spins. Oxygen’s fourth must pair, and two electrons in one orbital overlap strongly and repel: removing one of them costs less. Boron’s dip, from beryllium, has the other cause: its electron starts the 2p subshell, which penetrates the core less than 2s.',
      visual: boxDiagram([{ core: '[He] core' }, { name: '2s', count: 2 }, { name: '2p', count: 4 }], { newest: true, caption: 'Oxygen, [He] 2s² 2p⁴: the gold arrow is the electron that had to pair.' }),
    }),
    num({
      id: 'valence-jump', difficulty: 2,
      gen(r) {
        const key = r.pick(['Li', 'Be', 'Na']), E = IE_SUCCESSIVE[key];
        const jumps = E.slice(1).map((v, i) => v / E[i]), k = jumps.indexOf(Math.max(...jumps)) + 1;
        const Z = { Li: 3, Be: 4, Na: 11 }[key];
        return {
          prompt: t`The successive ionization energies of ${name(Z)} are ${E.map((v) => `${fmt(v, 4)} eV`).join(', ')}. How many valence electrons — electrons outside a closed shell — does it have?`,
          answer: k, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: E.length, feedback: 'That counts the energies listed. Look for the one big jump: it marks the first electron taken from a closed shell.' }, { value: Z, feedback: 'That is every electron. Valence electrons are the ones outside the closed core.' }].filter((e) => e.value !== k),
          hints: ['Find where one ionization energy is several times the one before it.', 'The electrons removed before that jump are the valence electrons.'],
          teach: 'Successive ionization energies rise gently while valence electrons are removed, then jump when the next one must come from a closed shell.',
          explain: t`The big jump is from the ${['first', 'second', 'third'][k - 1]} to the ${['second', 'third', 'fourth'][k - 1]} energy (a factor of ${fmt(Math.max(...jumps), 2)}): ${name(Z)} has ${k} valence electron${k > 1 ? 's' : ''} and forms the ion $\text{${S.symbol(Z)}}^{${k > 1 ? k : ''}+}$.`,
          visual: bars(E.map((v, i) => [['first', 'second', 'third', 'fourth'][i], v, 'accent']), { ylabel: 'ionization energy (eV)', caption: `The successive ionization energies of ${name(Z)} (NIST Atomic Spectra Database).` }),
        };
      },
    }),
    mcq({
      id: 'iron-ion', difficulty: 3,
      prompt: t`Iron is $${S.configTeX(26)}$, with 4s filled before 3d. What is the configuration of the $\text{Fe}^{2+}$ ion?`,
      choices: [t`$[\mathrm{Ar}]\,\mathrm{3d}^{6}$`, t`$[\mathrm{Ar}]\,\mathrm{3d}^{4}\,\mathrm{4s}^{2}$`, t`$[\mathrm{Ar}]\,\mathrm{3d}^{5}\,\mathrm{4s}^{1}$`, t`$[\mathrm{Ar}]\,\mathrm{3d}^{8}$`],
      answer: 0,
      why: {
        1: 'That removes the last electrons added, as though the filling order were an energy ladder. Once 3d is occupied it lies below 4s, so the 4s electrons are the outermost and leave first.',
        2: 'That takes one electron from each subshell. Both 4s electrons go first.',
        3: 'That has 24 electrons, but moved two 4s electrons into 3d instead of removing them.',
      },
      hints: ['Which electrons are outermost in iron: 4s or 3d?', 'The 4s orbital extends much farther from the nucleus than 3d, even though it filled first.'],
      teach: 'Transition metals lose their 4s electrons before any 3d: the filling order is not the order of the final energies.',
      explain: t`$\text{Fe}^{2+}$ is $[\mathrm{Ar}]\,\mathrm{3d}^6$. The order of filling ($n + l$, then $n$) says which configuration of the *neutral* atom is lowest; but once 3d holds electrons, they are pulled in below 4s, and the 4s electrons — farther out — are the first to go. That is why iron’s ions are $\mathrm{3d}^6$ ($\text{Fe}^{2+}$) and $\mathrm{3d}^5$ ($\text{Fe}^{3+}$).`,
      visual: { type: 'mp-shells', params: { Z: 26, maxZ: 36, panels: ['boxes'], controls: false, readout: false }, caption: 'Neutral iron: the argon core, 4s², and six 3d electrons (Hund’s rule leaves four unpaired). Boxes stacked in filling order, not by energy.' },
    }),
    num({
      id: 'period-length', difficulty: 2,
      gen(r) {
        const p = r.pick([3, 4, 5, 6]);
        const ans = { 3: 8, 4: 18, 5: 18, 6: 32 }[p];
        const subs = { 3: '3s, 3p', 4: '4s, 3d, 4p', 5: '5s, 4d, 5p', 6: '6s, 4f, 5d, 6p' }[p];
        return {
          prompt: t`How many elements are there in period ${p} of the periodic table?`,
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 2 * p * p, feedback: t`$2n^2$ is the capacity of the shell $n = ${p}$, but a period is not a shell: it fills the subshells from one new $s$ to the next full $p$.` }],
          hints: [t`A period begins when a new $s$ subshell starts and ends when the following $p$ subshell is full.`, t`Period ${p} fills ${subs}.`],
          teach: 'A period fills ns, (n − 2)f, (n − 1)d and np — not the shell n — so its length is 2, 8, 8, 18, 18, 32.',
          explain: t`Period ${p} fills ${subs}: $${subs.split(', ').map((x) => ({ s: 2, p: 6, d: 10, f: 14 })[x.at(-1)]).join(' + ')} = ${ans}$ elements. The lengths 2, 8, 8, 18, 18, 32 are exactly what the $n + l$ order gives.`,
          visual: tableDots({ rows: [p], caption: `The periodic table as dots; the gold line underlines period ${p}. Count them, or count the subshells it fills.` }),
        };
      },
    }),
    code({
      id: 'find-dips', difficulty: 2,
      prompt: t`The list \`ie\` holds the first ionization energies, in eV, of hydrogen ($Z = 1$) to krypton ($Z = 36$), from the NIST Atomic Spectra Database. Write \`dips(ie)\` that **returns** the list of atomic numbers $Z$ whose ionization energy is *lower* than that of the element before them, and print it.`,
      starter: t`ie = [${IE36.join(', ')}]

def dips(ie):
    # ie[0] is hydrogen (Z = 1), ie[Z - 1] is element Z
    pass

print(dips(ie))
`,
      answer: t`ie = [${IE36.join(', ')}]

def dips(ie):
    return [z for z in range(2, len(ie) + 1) if ie[z - 1] < ie[z - 2]]

print(dips(ie))`,
      tests: [
        { name: 'the alkali metals are there: 3, 11 and 19', code: 'all(z in dips(ie) for z in (3, 11, 19))' },
        { name: 'so are boron, oxygen, aluminium and sulfur (5, 8, 13, 16)', code: 'all(z in dips(ie) for z in (5, 8, 13, 16))' },
        { name: 'nitrogen (7) and phosphorus (15) are not', code: '7 not in dips(ie) and 15 not in dips(ie)' },
        { name: `there are ${DIPS36.length} dips in all`, code: `len(dips(ie)) == ${DIPS36.length}` },
        { name: 'the list is printed', code: '"[3, 5, 8" in _stdout' },
      ],
      hints: [t`Loop over $Z$ from 2 to 36 and compare \`ie[Z - 1]\` with \`ie[Z - 2]\`.`, t`A list comprehension does it in one line: \`[z for z in range(2, 37) if ie[z - 1] < ie[z - 2]]\`.`],
      teach: 'Shell structure is visible in raw data: the ionization energy drops wherever a new shell or subshell starts, or an electron first pairs.',
      explain: t`The dips are ${DIPS36.join(', ')}. Three causes: a new shell (lithium, sodium, potassium — the alkali metals), a new p subshell (boron, aluminium, gallium), and the first paired p electron (oxygen, sulfur, selenium). The small dips at vanadium, cobalt and nickel come from the subtler energetics of the 3d subshell.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-xenon', difficulty: 2, transfer: true,
      gen(r) {
        const gas = r.pick(['Xe', 'Kr', 'Ar']), { Z, M } = NOBLE_PROP[gas], mdot = r.pick([2, 3, 5, 8]);
        const P = ((mdot * 1e-6) / (M * U_KG)) * IE(Z) * QE;
        return {
          prompt: t`Ion engines and Hall thrusters make thrust from ions. A thruster takes in ${name(Z)} at ${mdot} mg/s and ionizes every atom once. What is the least power that ionization alone can take, in watts? (${Cap(name(Z))}: first ionization energy ${fmt(IE(Z), 4)} eV, molar mass ${M} g/mol.)`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: P / QE, feedback: 'Convert eV to joules: 1 eV = 1.602 × 10⁻¹⁹ J.' }, { value: P * 1000, feedback: t`A milligram is $10^{-6}$ kg, not $10^{-3}$ kg.` }],
          hints: [t`Atoms per second: the mass flow divided by the mass of one atom, $M/N_A$.`, t`Power $= (\dot m/m_\text{atom})\times E_\text{ion}$, with $E_\text{ion}$ in joules.`],
          teach: 'The minimum ionization power is the atom flow times the first ionization energy — which is why heavy, easily ionized xenon is the propellant of choice.',
          explain: t`One atom has mass $${fmt(M, 5)}\ \text{u} = ${fmt(M * U_KG * 1e25, 4)}\times10^{-25}$ kg, so ${mdot} mg/s is $${fmt((mdot * 1e-6) / (M * U_KG) / 1e19, 4)}\times10^{19}$ atoms per second; times ${fmt(IE(Z), 4)} eV each, $P = ${fmt(P, 3)}$ W. Xenon is the heaviest stable noble gas and the easiest to ionize, so per kilogram it costs least: krypton needs ${fmt(perKg('Kr') / perKg('Xe'), 2)} times the power, argon ${fmt(perKg('Ar') / perKg('Xe'), 2)} times. Real thrusters spend several times this minimum per ion.`,
          visual: shells(Z),
        };
      },
    }),
    num({
      id: 'cp-screening', difficulty: 3,
      gen(r) {
        const Z = r.pick([10, 18, 36]), n = S.outerN(Z), zeff = zeffOf(IE(Z), n), ans = Z - zeff;
        return {
          prompt: t`${Cap(name(Z))} ($Z = ${Z}$) has its outermost electrons in $n = ${n}$, and a first ionization energy of ${fmt(IE(Z), 4)} eV. Treating the outermost electron as hydrogen-like, how much of the nuclear charge is screened, $\sigma = Z - Z_\text{eff}$?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: zeff, feedback: t`That is $Z_\text{eff}$. The screening is the rest of the nuclear charge: $\sigma = Z - Z_\text{eff}$.` }, { value: Z - Math.sqrt(IE(Z) / RYD), feedback: t`Include $n$: $Z_\text{eff} = n\sqrt{E_\text{ion}/13.6\ \text{eV}}$.` }],
          hints: [t`First $Z_\text{eff} = n\sqrt{E_\text{ion}/13.6\ \text{eV}}$.`, t`$Z_\text{eff} = ${n}\sqrt{${fmt(IE(Z), 4)}/13.61} = ${fmt(zeff, 3)}$; subtract from $Z$.`],
          teach: t`The screening $\sigma = Z - Z_\text{eff}$ measures how much of the nucleus the other electrons hide from the outermost one.`,
          explain: t`$Z_\text{eff} = ${fmt(zeff, 3)}$, so $\sigma = ${Z} - ${fmt(zeff, 3)} = ${fmt(ans, 3)}$ of the ${Z - 1} other electrons’ charge. A noble gas’s outer p electron shares its shell with seven others that screen it only partly, so $Z_\text{eff}$ is large and the atom holds on hard — the peaks of the ionization chart.`,
          visual: shells(Z),
        };
      },
    }),
    multi({
      id: 'cp-dips', difficulty: 2,
      prompt: 'Which of these elements have a lower first ionization energy than the element just before them in the table?',
      choices: ['aluminium (Al)', 'sulfur (S)', 'phosphorus (P)', 'magnesium (Mg)', 'gallium (Ga)', 'carbon (C)'],
      answer: [0, 1, 4],
      why: {
        2: 'Phosphorus (3p³) has one electron in each 3p orbital; it is higher than silicon. The dip comes one later, at sulfur.',
        3: 'Magnesium (3s²) is higher than sodium: its second 3s electron sees more nuclear charge. The dip comes one later, at aluminium.',
        5: 'Carbon (2p²) is higher than boron: its two 2p electrons sit in separate orbitals.',
      },
      hints: ['Dips come where a new p subshell starts, or where a p electron first has to pair.'],
      teach: 'Within a period the ionization energy dips twice: at the first p electron (group 13) and at the first paired p electron (group 16).',
      explain: t`Aluminium (${fmt(IE(13), 3)} eV, after magnesium’s ${fmt(IE(12), 3)}) and gallium start a p subshell, which penetrates the core less; sulfur (${fmt(IE(16), 3)} eV, after phosphorus’s ${fmt(IE(15), 3)}) pairs its first 3p electron.`,
      visual: tableDots({ marks: { 6: 'accent', 12: 'accent', 13: 'accent', 15: 'accent', 16: 'accent', 31: 'accent' }, caption: 'The six elements in the question, marked on the periodic table.' }),
    }),
  ],
  sources: [
    { label: 'NIST Atomic Spectra Database: ground states and ionization energies (Kramida, Ralchenko, Reader & NIST ASD Team)', url: 'https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html' },
    { label: 'OpenStax University Physics Vol. 3, §8.5 The exclusion principle and the periodic table', url: 'https://openstax.org/books/university-physics-volume-3/pages/8-5-the-exclusion-principle-and-the-periodic-table' },
    { label: 'IUPAC (2021), the composition of group 3 of the periodic table', url: 'https://iupac.org/project/2015-039-2-200' },
    { label: 'NASA Glenn Research Center: ion and Hall-effect propulsion', url: 'https://www1.grc.nasa.gov/space/sep/' },
  ],
});
