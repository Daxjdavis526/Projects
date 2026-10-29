// Band theory — atomic levels spread into bands when atoms join a crystal;
// equivalently a wave in a periodic potential exists only in bands of
// energy. The Kronig–Penney model (thin-barrier limit, a teaching model):
// cos ka = cos αa + P sin αa/αa, allowed where |RHS| ≤ 1; every band ends at
// αa = nπ, E = n²h²/8ma², where gaps open (Bragg reflection). Metals,
// semiconductors and insulators by band filling and gap (Si 1.12 eV, GaAs
// 1.42 eV, diamond 5.5 eV). Coding: find the band edges numerically.
// Every number is computed here or in src/viz/model/mp-solids.js.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { N_A } from './_quanta.js';
import { S, r6, seg, label, kpPlot, ekPlot, bandBoxes, gapPicture } from './_solids.js';

const t = String.raw;
const PK = (3 * Math.PI) / 2;                              // Kittel’s barrier strength
const BK = S.kpBands(PK, 4);                               // its band edges, in x = αa
const e = (x) => (x / Math.PI) ** 2;                       // E/E₁ from x = αa
const E1_30 = S.kpE1(0.3);                                 // eV, for a = 0.30 nm
const GAPS = { si: 1.12, gaas: 1.42, ge: 0.66, diamond: 5.47, gan: 3.4 };

/** Schematic: six atoms’ levels spreading into bands as the atoms are brought together. */
const splitting = (() => {
  const curves = [];
  for (const [E0, W, color] of [[0, 5.2, 'accent'], [2.4, 7, 'violet']]) for (const c of [-1, -0.6, -0.2, 0.2, 0.6, 1]) {
    curves.push({ fn: `${E0} + ${c}*${W}*exp(-(x - 0.2)/0.12)`, domain: [0.17, 1], color, width: 1.5 });
  }
  return {
    type: 'graph',
    params: {
      x: [0.15, 1], y: [-2.6, 5.6], aspect: 'wide', axesAt: 'edge', xlabel: 'distance between neighbouring atoms (nm)', ylabel: 'energy (eV)', yticks: 0,
      curves, vlines: [{ x: 0.36, label: 'spacing in the crystal', color: 'gold' }],
      points: [label(0.98, 0, 'one atomic level (s)', 'accent', 0, 12, 'right'), label(0.98, 2.4, 'the next level (p)', 'violet', 0, -12, 'right')],
    },
    caption: 'Schematic: the levels of six identical atoms as they are pushed together. Far apart, each level is shared by all six (sixfold degenerate); close together, the overlapping wave functions split it into six. In a real crystal N ≈ 10²² atoms make N levels per atomic level — a band. Energies not to scale.',
  };
})();

const threeKinds = bandBoxes({
  cols: [
    { name: 'P', bands: [[-0.5, 4.5, 0.5]], EF: 2 },
    { name: 'Q', bands: [[-0.5, 2.5, 1], [8.0, 9.6, 0]], EF: 5.25, gapLabel: 'gap 5.5 eV', gapAt: 5.25 },
    { name: 'R', bands: [[-0.5, 2.5, 1], [3.62, 6.2, 0]], EF: 3.06, gapLabel: '1.1 eV', gapAt: 3.06 },
  ],
  y: [-1, 10.4],
  caption: 'Three solids’ highest bands as boxes: dark is filled with electrons, light is empty; the dashed gold line is the Fermi level. Schematic heights.',
});

export default lesson({
  id: 'phys2710.MP12.1',
  title: 'Band theory',
  minutes: 14, difficulty: 3,
  badges: ['model', 'est-obs'],
  intro: t`Bring $N$ atoms together into a crystal and each sharp atomic level spreads into $N$ levels packed within a few electronvolts — a **band**. The same answer comes from the other side: an electron wave moving through a perfectly regular row of ions travels freely, but only at some energies. The **Kronig–Penney model** — a one-dimensional row of thin barriers, a teaching model — gives the rule. A wave with crystal wave number $k$ exists only where

$$\cos ka = \cos \alpha a + P\,\frac{\sin \alpha a}{\alpha a}$$

The left side can never leave $[-1, 1]$, so energies where the right side does are forbidden: **band gaps**. Whether a solid conducts depends on how full its highest bands are. A partly filled band makes a **metal**; a full band with a wide gap above it, an **insulator**; a full band with a narrow gap — silicon’s 1.12 eV, gallium arsenide’s 1.42 eV — a **semiconductor**.

> This uses the finite well and tunnelling ([MP7.3](#/lesson/phys2710.MP7.3)) and the exclusion principle ([MP9.1](#/lesson/phys2710.MP9.1)).`,
  symbols: [
    { tex: 'k', text: 'the electron’s **crystal wave number** (its Bloch wave number): from one ion to the next its wave repeats except for a phase $ka$; in m⁻¹' },
    { tex: 'a', text: 'the lattice period — the spacing of the ions, a few tenths of a nanometre' },
    { tex: '\\alpha', text: t`$\alpha = \sqrt{2mE}/\hbar$, the wave number a free electron of the same energy would have; $m$ is the electron’s mass and $\hbar$ the reduced Planck constant` },
    { tex: 'E', text: 'the electron’s energy, measured from the floor between the barriers, in eV' },
    { tex: 'P', text: t`the barrier strength, $P = mV_0ba/\hbar^2$ for barriers of height $V_0$ and thickness $b$ — no units. $P = 0$ is empty space` },
  ],
  why: 'Band gaps decide which solids conduct, which are transparent, and what colour of light a semiconductor absorbs or emits — the physics under every transistor, solar cell, LED and infrared camera.',
  visual: {
    ...kpPlot({
      P: 'P',
      extra: { sliders: [{ key: 'P', label: 'Barrier strength $P$', min: 0, max: 10, step: 0.1, value: 4.7, explain: 'How strongly the row of ions scatters the electron. $P = 0$ is empty space.' }] },
      caption: 'The Kronig–Penney model in its thin-barrier limit — a one-dimensional teaching model. E₁ = h²/8ma² is the ground-state energy of a box one lattice spacing wide, about 4 eV for a = 0.3 nm. Real crystals are three-dimensional; their bands are computed numerically and measured by photoemission, and their gaps open in the same way.',
    }),
    title: 'Where waves can travel',
    lead: t`The curve is the right-hand side of the Kronig–Penney condition against the electron’s energy. Wherever it lies inside the green strip, between −1 and +1, a travelling wave exists: those energies are **allowed**, drawn in blue and gathered along the bottom as bands. Where the curve leaves the strip, no wave exists: a gap.`,
    tasks: [
      'Set P = 0: the curve is cos(π√(E/E₁)), never outside the strip — a free electron may have any energy.',
      'Raise P a little: gaps open just above E₁, 4E₁, 9E₁ and 16E₁ (the dashed lines), where half the free electron’s wavelength fits n times into the lattice spacing.',
      'Push P to 10: the bands shrink to slivers just below n²E₁ — the levels of a box one lattice spacing wide. Each electron is nearly trapped at its own ion, as in separate atoms.',
    ],
  },
  example: {
    prompt: t`Take barriers of strength $P = 3\pi/2$ and a lattice spacing $a = 0.30$ nm. (a) Show that the first band ends at $E_1 = h^2/8ma^2$ whatever $P$ is, and find $E_1$ in eV. (b) The second band begins where $\tan(\alpha a/2) = -\alpha a/P$. Check that $\alpha a = 3\pi/2$ solves this, and find the width of the first gap.`,
    visual: ekPlot({ P: PK, n: 3, extra: { points: [label(-2.9, (1 + e(BK[1][0])) / 2, 'first gap', 'bad', 0, 0, 'left')] }, caption: 'The bands for P = 3π/2 (solid) against the free electron’s parabola (dashed), in the extended zone. Gaps (shaded) open at k = nπ/a. A one-dimensional teaching model.' }),
    steps: [
      { label: 'The band top', text: t`At $\alpha a = \pi$, $\cos\pi = -1$ and $\sin\pi = 0$, so the right-hand side is exactly $-1$ for every $P$: a standing wave with $ka = \pi$. Just above, $\sin\alpha a < 0$ pushes it below $-1$ — forbidden. So the first band ends at $\alpha a = \pi$: $E = \hbar^2\pi^2/2ma^2 = h^2/8ma^2$ — the ground-state energy of a box one lattice spacing wide.` },
      { label: 'Its size', text: t`$E_1 = \dfrac{(hc)^2}{8\,mc^2\,a^2} = \dfrac{(1239.8\ \text{eV nm})^2}{8\,(511{,}000\ \text{eV})(0.30\ \text{nm})^2} = ${fmt(E1_30, 3)}$ eV.` },
      { label: 'Where the gap ends', text: t`The second band begins where the curve comes back to $-1$: $\cos x + 1 = -P\sin x/x$, with $x = \alpha a$. Using $1 + \cos x = 2\cos^2(x/2)$ and $\sin x = 2\sin(x/2)\cos(x/2)$, this is $\cos(x/2)\,[\cos(x/2) + P\sin(x/2)/x] = 0$, so $\tan(x/2) = -x/P$. At $x = 3\pi/2$: $\tan(3\pi/4) = -1$ and $-x/P = -1$. It works.` },
      { label: 'The gap', text: t`Energy grows as $x^2$: $E = (x/\pi)^2E_1 = (3/2)^2E_1 = 2.25\,E_1$. The gap runs from $E_1$ to $2.25\,E_1$, a width of $1.25 \times ${fmt(E1_30, 3)} = ${fmt(1.25 * E1_30, 3)}$ eV.` },
      { label: 'Sense check', text: t`A gap of a few eV is what real insulators have (diamond’s is 5.5 eV). Weaker barriers give narrower gaps, and at $P = 0$ the gap closes: the bands join into the free electron’s parabola.` },
    ],
    answer: t`$E_1 = ${fmt(E1_30, 3)}$ eV; the first gap runs from $${fmt(E1_30, 3)}$ to $${fmt(2.25 * E1_30, 3)}$ eV, $${fmt(1.25 * E1_30, 3)}$ eV wide.`,
  },
  practice: [
    num({
      id: 'band-states', difficulty: 1,
      gen(r) {
        const [el, M] = r.pick([['sodium', 22.99], ['potassium', 39.10], ['copper', 63.55], ['silver', 107.87]]), mg = r.pick([1, 2, 5, 10, 20]);
        const N = ((mg * 1e-3) / M) * N_A;
        return {
          prompt: t`A crystal of ${el} has a mass of ${mg} mg (molar mass ${M} g/mol). Its atoms’ outermost s level spreads into a band. How many electrons can that band hold?`,
          answer: 2 * N, tol: { rel: 0.01 },
          errors: [{ value: N, feedback: t`Each of the $N$ levels in the band holds **two** electrons, one of each spin (the exclusion principle), so the band holds $2N$.` }],
          hints: [t`$N$ atoms make $N$ levels from each atomic level. How many electrons fit in one level?`, t`$N = (m/M)\,N_A$ with $m = ${mg}\times10^{-3}$ g; the band holds $2N$.`],
          teach: 'A band made from one atomic level of N atoms has N levels and holds 2N electrons — two per atom.',
          explain: t`$N = \dfrac{${mg}\times10^{-3}}{${M}}\times6.022\times10^{23} = $ $${tex(N, 3)}$ atoms, so the band holds $2N = $ $${tex(2 * N, 3)}$ electrons. Each ${el} atom gives one s electron, so the band is **half full** — and that is why ${el} is a metal.`,
          visual: splitting,
        };
      },
    }),
    {
      type: 'point', id: 'find-band', difficulty: 2,
      prompt: t`This is the Kronig–Penney condition for barriers of strength $P = 3$. Drag the point to the **bottom of the second band** — the lowest energy above $E_1$ at which a wave can travel again.`,
      visual: kpPlot({ P: 3, highlight: false, extra: { drag: [{ key: 'p', x: 8, y: 3, snap: 0.01 }] }, caption: 'The Kronig–Penney condition for P = 3 (a one-dimensional teaching model). Waves exist where the curve lies in the green strip.' }),
      answer: { x: r6(e(S.kpBands(3, 2)[1][0])), y: -1 }, tol: { x: 0.12, y: 0.3 },
      instruction: 'Drag the point to the bottom of the second band, then check.',
      hints: ['A band begins where the curve enters the green strip, between −1 and +1.', 'Just above E = E₁ the curve dips below −1 (a gap). Follow it right until it climbs back up through −1.'],
      teach: 'A band edge is where the right-hand side crosses ±1: inside the strip waves travel, outside they cannot.',
      explain: t`The curve leaves the strip at $E = E_1$ (where it touches $-1$), stays below $-1$ through the gap, and climbs back through $-1$ at $E = ${fmt(e(S.kpBands(3, 2)[1][0]), 3)}\,E_1$. The second band runs from there up to $4E_1$.`,
    },
    mcq({
      id: 'full-band', difficulty: 2,
      prompt: 'In the solid labelled Q, the lower band is completely full and a gap of 5.5 eV separates it from the empty band above. Its electrons move at about a million metres per second. Why does a voltage across it drive almost no current?',
      choices: [
        'A full band has a partner moving the other way for every electron, and a field cannot change that, because there are no empty states nearby for electrons to move into',
        'The electrons in a full band are stuck in place and do not move at all',
        'A full band carries a current, but the gap acts as a resistor in series with it',
        'The electrons are bound to their own atoms, so they cannot reach the electrodes',
      ],
      answer: 0,
      why: {
        1: 'They move fast — but in pairs with equal and opposite velocities, so their currents cancel.',
        2: 'A band does not act like a circuit element. The point is that the net current of a full band is exactly zero.',
        3: 'Band electrons are spread through the whole crystal, not tied to atoms. They cannot carry current because their band has no room to rearrange.',
      },
      hints: ['To carry a current, the electrons’ velocities must become lopsided: more moving one way than the other.', 'A field could only make them lopsided by moving electrons into empty states of slightly different momentum. Are there any in a full band?'],
      teach: 'A completely full band carries no current: every state is taken, so a field cannot shift the electrons’ momenta.',
      explain: 'In a full band every state k has its partner −k filled too, so the velocities cancel. A field can only unbalance them by moving electrons into empty states — and the nearest are 5.5 eV away, beyond what a field or heat can give. Q is an insulator; P, with a half-full band, is a metal; R, with its narrow gap, is a semiconductor.',
      visual: threeKinds,
    }),
    num({
      id: 'absorption-edge', difficulty: 2,
      gen(r) {
        const [name, key] = r.pick([['silicon', 'si'], ['gallium arsenide', 'gaas'], ['germanium', 'ge'], ['diamond', 'diamond'], ['gallium nitride', 'gan']]);
        const Eg = GAPS[key], lam = S.HC_EVNM / Eg;
        const where = lam > 750 ? 'in the infrared, so visible light is all absorbed and the crystal looks opaque and grey' : lam < 380 ? 'in the ultraviolet, so no visible photon has enough energy: the crystal is transparent' : 'in the visible';
        return {
          prompt: t`A photon is absorbed by lifting an electron from the full valence band across the gap into the empty conduction band. ${name[0].toUpperCase() + name.slice(1)} has a gap of $${Eg}$ eV. What is the **longest** wavelength it can absorb this way, in nm?`,
          answer: lam, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: lam / 2, feedback: t`The photon’s whole energy goes into lifting one electron across the gap: $\lambda = hc/E_g$, with no factor of 2.` }],
          hints: [t`The photon needs $hf \ge E_g$; longer wavelengths carry less energy.`, t`$\lambda_{\max} = hc/E_g$ with $hc = 1239.8$ eV nm.`],
          teach: t`A semiconductor absorbs photons with $hf$ above its gap: its absorption edge is $\lambda = hc/E_g$.`,
          explain: t`$\lambda_{\max} = 1239.8/${Eg} = ${fmt(lam, 4)}$ nm — ${where}. ${key === 'si' ? 'Silicon is transparent beyond about 1.1 μm, which is why it is used for infrared lenses and why silicon cameras stop seeing there.' : ''}`,
          visual: gapPicture(Eg, {
            name, arrow: 'a photon lifts an electron', gapText: `gap ${Eg} eV`,
            caption: `The valence band (full, dark) and conduction band (empty, light) of ${name}, ${Eg} eV apart. A photon is absorbed only if it can lift an electron across the gap. Schematic band widths.`,
          }),
        };
      },
    }),
    mcq({
      id: 'magnesium', difficulty: 3,
      prompt: 'A magnesium atom has two outer (3s) electrons, exactly enough to fill the 3s band of the crystal. Simple counting therefore says magnesium is an insulator — yet it is a good metal. Why?',
      choices: [
        'In three dimensions its 3s and 3p bands overlap in energy, so electrons spill into the bottom of the 3p band and leave both bands partly filled',
        'At room temperature the thermal energy lifts its electrons across the gap above the 3s band',
        'Magnesium has a very small gap, which makes it a semiconductor rather than an insulator',
        'Its second 3s electron is a core electron, so each atom gives only one electron to the band',
      ],
      answer: 0,
      why: {
        1: 'At room temperature kT is 0.026 eV — far too little to cross a real gap in numbers that would make a good metal.',
        2: 'A semiconductor conducts poorly and better when hot. Magnesium conducts very well, and worse when hot: the signature of a metal.',
        3: 'Both 3s electrons are valence electrons; the core is the neon-like inner shells.',
      },
      hints: ['Counting electrons works band by band only if the bands are separated by gaps. Must they be?', 'In a three-dimensional crystal the bands from different atomic levels can be so wide that they overlap.'],
      teach: 'Bands from different atomic levels can overlap; then a “full” band plus an empty one overlapping it act as two partly filled bands — a metal.',
      explain: 'The 3s and 3p bands of magnesium are each several eV wide, and they overlap. The electrons settle into the lowest states of both, so neither band is full and there is no gap at the Fermi level: magnesium is a metal. The same happens in calcium, zinc and the other divalent metals.',
      visual: bandBoxes({
        cols: [{ name: 'magnesium', bands: [[-0.5, 5.5, 0.62], [3.2, 9.5, 0.08]], EF: 3.22 }],
        y: [-1, 10.4],
        extra: { points: [label(0.5, 1.2, '3s band (two electrons per atom fit)', 'ink', 0, 0, 'center'), label(0.5, 7.6, '3p band (six per atom fit)', 'ink', 0, 0, 'center'), label(0.5, 4.4, 'overlap', 'ink2', 0, 0, 'center')] },
        caption: 'Schematic: magnesium’s 3s and 3p bands overlap, so the electrons fill the bottom of both up to one Fermi level (dashed). Band heights not to scale.',
      }),
    }),
    code({
      id: 'kp-edges', difficulty: 3,
      prompt: t`Find the Kronig–Penney bands numerically. Finish \`bands(P)\`: on a fine grid of $x = \alpha a$ from 0 to $4\pi$, mark where $|f(x)| \le 1$; then find where that switches on (a band starts) and off (a band ends), and return the bands as a list of \`(E_bottom, E_top)\` in units of $E_1$, using $E/E_1 = (x/\pi)^2$.`,
      starter: t`import numpy as np

def f(x, P):
    return np.cos(x) + P * np.sin(x) / x

def bands(P, xmax=4*np.pi, n=400001):
    x = np.linspace(1e-9, xmax, n)
    allowed = np.abs(f(x, P)) <= 1
    # a band starts where allowed goes False -> True,
    # and ends where it goes True -> False
    return []

for lo, hi in bands(3*np.pi/2):
    print(f"band from {lo:.3f} E1 to {hi:.3f} E1")
`,
      answer: t`import numpy as np

def f(x, P):
    return np.cos(x) + P * np.sin(x) / x

def bands(P, xmax=4*np.pi, n=400001):
    x = np.linspace(1e-9, xmax, n)
    allowed = np.abs(f(x, P)) <= 1
    starts = x[1:][allowed[1:] & ~allowed[:-1]]
    ends = x[:-1][allowed[:-1] & ~allowed[1:]]
    if allowed[0]:
        starts = np.insert(starts, 0, x[0])
    if allowed[-1]:
        ends = np.append(ends, x[-1])
    return [((a / np.pi)**2, (b / np.pi)**2) for a, b in zip(starts, ends)]

for lo, hi in bands(3*np.pi/2):
    print(f"band from {lo:.3f} E1 to {hi:.3f} E1")`,
      tests: [
        { name: t`four bands below $16E_1$ for $P = 3\pi/2$`, code: 'len(bands(3*np.pi/2)) == 4' },
        { name: t`the first band runs from $${fmt(e(BK[0][0]), 3)}\,E_1$ to $E_1$`, code: `abs(bands(3*np.pi/2)[0][0] - ${r6(e(BK[0][0]))}) < 0.005 and abs(bands(3*np.pi/2)[0][1] - 1) < 0.005` },
        { name: t`the second band starts at $2.25\,E_1$`, code: 'abs(bands(3*np.pi/2)[1][0] - 2.25) < 0.005' },
        { name: t`for $P = 10$ the lowest band is a sliver from $${fmt(e(S.kpBands(10, 1)[0][0]), 3)}\,E_1$ to $E_1$`, code: `abs(bands(10)[0][0] - ${r6(e(S.kpBands(10, 1)[0][0]))}) < 0.005` },
        { name: 'the program prints the bands', code: '"band from" in _stdout' },
      ],
      hints: [t`For two neighbouring grid points, a band starts where \`allowed[i]\` is False and \`allowed[i+1]\` is True. With arrays: \`allowed[1:] & ~allowed[:-1]\`.`, t`\`starts = x[1:][allowed[1:] & ~allowed[:-1]]\` and \`ends = x[:-1][allowed[:-1] & ~allowed[1:]]\`. The top band ends exactly at $4\pi$, the last grid point, so append \`x[-1]\` if \`allowed[-1]\`. Then convert each pair with $(x/\pi)^2$.`],
      teach: 'A band edge is a sign change of 1 − |f|: on a fine grid, compare each point with its neighbour.',
      explain: t`For $P = 3\pi/2$ the bands are $${BK.map(([lo, hi]) => t`${fmt(e(lo), 3)}\text{–}${fmt(e(hi), 3)}`).join(',\\ ')}$ (in units of $E_1$). Every band ends at $n^2E_1$; the gaps between narrow as the energy rises, because a fast electron hardly notices the barriers.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-infrared', difficulty: 2, transfer: true,
      gen(r) {
        const lam = r.pick([1.7, 2.5, 5.0, 10.0]), Eg = S.HC_EVNM / (lam * 1000);
        return {
          prompt: t`An infrared camera for a space telescope must absorb light out to a wavelength of ${lam} μm. Its detectors are made of mercury cadmium telluride, whose band gap is set by the ratio of mercury to cadmium. What band gap is needed, in eV?`,
          answer: Eg, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: Eg * 1000, feedback: 'The wavelength is in micrometres: λ = ' + lam + ' μm = ' + lam * 1000 + ' nm.' }],
          hints: [t`The longest wavelength absorbed is $\lambda = hc/E_g$; turn it round.`, t`$E_g = hc/\lambda$ with $hc = 1.2398$ eV μm.`],
          teach: t`The absorption edge sets the gap: $E_g = hc/\lambda$ — narrow gaps for long infrared wavelengths.`,
          explain: t`$E_g = 1.2398\ \text{eV μm}/${lam}\ \text{μm} = ${fmt(Eg, 3)}$ eV. At room temperature $kT = 0.026$ eV is ${fmt(0.025852 / Eg * 100, 2)}% of that gap — enough to shake loose a flood of electrons that would drown the starlight. So such detectors are cooled: the James Webb Space Telescope’s near-infrared cameras, which reach about 5 μm, run at about 40 K.`,
          visual: gapPicture(Eg * 4, {
            name: 'HgCdTe', arrow: `infrared photon, ${lam} μm`, arrowColor: 'bad',
            caption: 'An infrared detector: a photon must lift an electron across the gap. Schematic heights (the gap is drawn enlarged).',
          }),
        };
      },
    }),
    num({
      id: 'cp-band-top', difficulty: 2,
      gen(r) {
        const a = r.pick([0.20, 0.25, 0.35, 0.40, 0.45]), E1 = S.kpE1(a);
        return {
          prompt: t`In the Kronig–Penney model with ions $${a}$ nm apart, at what energy does the first band end and the first gap begin, whatever the barrier strength? Answer in eV.`,
          answer: E1, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: 4 * E1, feedback: t`That is $h^2/2ma^2$. The band ends at $\alpha a = \pi$, where $\hbar^2\pi^2/2ma^2 = h^2/8ma^2$.` }, { value: E1 / (Math.PI * Math.PI), feedback: t`At $\alpha a = \pi$ the energy is $\hbar^2\alpha^2/2m = \hbar^2\pi^2/2ma^2$ — keep the $\pi^2$.` }],
          hints: [t`At $\alpha a = \pi$ the right-hand side is $-1$ for any $P$.`, t`$E_1 = \dfrac{(hc)^2}{8mc^2a^2}$ with $hc = 1239.8$ eV nm and $mc^2 = 511{,}000$ eV.`],
          teach: 'Every first band ends at E₁ = h²/8ma², where the electron’s half-wavelength equals the lattice spacing.',
          explain: t`$E_1 = \dfrac{(1239.8)^2}{8(511{,}000)(${a})^2} = ${fmt(E1, 3)}$ eV. There the free electron’s wavelength is $2a$ — exactly the condition for Bragg reflection off the row of ions, which turns a travelling wave into a standing one.`,
          visual: ekPlot({ P: 2, n: 2, caption: 'Bands (solid) against the free electron (dashed), in units of E₁. The first band ends at E = E₁, k = π/a, for any barrier strength. A one-dimensional teaching model.' }),
        };
      },
    }),
    mcq({
      id: 'cp-apart', difficulty: 2,
      prompt: 'The barrier strength $P$ grows when the ions’ barriers are higher or thicker — as for atoms pulled far apart. What happens to the allowed bands as $P$ becomes very large?',
      choices: [
        'They shrink to narrow slivers just below n²E₁ — sharp levels, like those of separate atoms',
        'They widen until the gaps close and every energy is allowed',
        'They stay the same width but move up in energy',
        'They merge into a single band that holds every electron',
      ],
      answer: 0,
      why: {
        1: 'That happens as P → 0, empty space. Strong barriers do the opposite.',
        2: 'The tops of the bands are pinned at n²E₁ for every P; it is the bottoms that rise.',
        3: 'The gaps grow, not shrink: the bands separate further into distinct levels.',
      },
      hints: ['Look again at the Explore picture with P = 10.', 'An electron behind very strong barriers is trapped in its own well. What energies does one well allow?'],
      teach: 'Strong barriers isolate each well: the bands narrow toward the sharp levels of a single well, like separate atoms.',
      explain: 'Each band’s top stays at n²E₁ while its bottom rises toward it, so the band narrows to a sliver: the electron tunnels only rarely from ion to ion, and the levels approach those of a single box. Pushing atoms together does the reverse — it widens sharp atomic levels into bands, as in the picture of six atoms.',
      visual: kpPlot({ P: 10, caption: 'The Kronig–Penney condition for strong barriers, P = 10: thin bands below 1, 4, 9 and 16 E₁. A one-dimensional teaching model.' }),
    }),
  ],
  sources: [
    { label: 'Kronig & Penney (1931), Quantum mechanics of electrons in crystal lattices, Proc. R. Soc. A 130, 499', url: 'https://doi.org/10.1098/rspa.1931.0019' },
    { label: 'OpenStax University Physics Vol. 3, §9.6 (band theory of solids)', url: 'https://openstax.org/books/university-physics-volume-3/pages/9-6-band-theory-of-solids' },
    { label: 'Kittel, Introduction to Solid State Physics, ch. 7 (energy bands; the Kronig–Penney model)', url: 'https://www.wiley.com/en-us/Introduction+to+Solid+State+Physics%2C+8th+Edition-p-9780471415268' },
  ],
});
