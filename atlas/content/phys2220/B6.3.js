// Electromagnetic waves: Faraday's law and Maxwell's displacement current
// sustain each other as a travelling wave. A plane wave is transverse, E ⊥ B,
// E × B along the travel, E and B in phase with E₀ = cB₀, and it moves at
// c = ω/k = 1/√(μ₀ε₀) whatever its frequency or amplitude — with no medium.
import { lesson, mcq, num } from '../../src/core/content.js';
import { C3, tn, sf, r6, apart, lab, seg, wavePic, specPic, triad, fieldSnapshot, AXES, cross, axisName, flip } from './_maxwell.js';

const t = String.raw;
const hat = (d) => `${d[0] === '-' ? '-' : ''}\\hat ${d[1]}`;

/** a chocolate bar in a microwave oven: the standing wave's field strength above it, melted spots at its peaks, d between two */
function ovenPic(caption) {
  const spots = [0.5, 1.5, 2.5], yb = -0.42;
  return {
    type: 'graph',
    params: {
      x: [0, 3], y: [-1.15, 1.3], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        { fn: 'abs(sin(pi*x))', domain: [0, 3], color: 'violet', width: 2.4 },
        seg([0.04, yb], [2.96, yb], { color: 'ink3', width: 12 }),
      ],
      arrows: [{ from: [1.0, -0.85], to: [0.5, -0.85], color: 'ink2' }, { from: [1.0, -0.85], to: [1.5, -0.85], color: 'ink2' }],
      points: [
        ...spots.map((x) => ({ x, y: yb, r: 7, color: 'warn' })),
        lab(1.0, -0.85, 'd', 'ink2', 0, 13),
        lab(1.5, 1.0, 'field strength of the standing wave', 'violet', 0, -12),
        lab(2.5, yb, 'melted', 'warn', 0, 18),
      ],
    },
    caption: caption ?? 'Looking along the chocolate: the microwaves’ field strength (violet) peaks every half wavelength, and the chocolate melts first under each peak (orange). Not to scale.',
  };
}

/** a GPS satellite above a receiver: wavefronts spreading down, the range between them */
function gpsPic(caption) {
  const sy = 3.3, rings = [1.1, 2.0, 2.9];
  return {
    type: 'graph',
    params: {
      x: [-4.2, 4.2], y: [-1.9, 4.1], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        { param: ['6*cos(t)', '-6.6 + 6*sin(t)'], t: [0.95, 2.19], color: 'teal', width: 2.4 },
        ...rings.map((R) => ({ param: [`${R}*cos(t)`, `${sy} + ${R}*sin(t)`], t: [r6(Math.PI + 0.75), r6(2 * Math.PI - 0.75)], color: 'gold', width: 1.4, dash: true })),
        seg([0, sy], [0, -0.6], { color: 'ink3', width: 1.4, dash: true }),
      ],
      points: [
        { x: 0, y: sy, r: 6, color: 'gold' }, lab(0.3, sy, 'satellite', 'gold', 6, 0, 'left'),
        { x: 0, y: -0.6, r: 5, color: 'accent' }, lab(0.3, -0.6, 'receiver', 'accent', 6, -11, 'left'),
        lab(-0.15, 0.85, 'range', 'ink2', -6, 0, 'right'),
        lab(2.2, -1.6, 'Earth', 'teal', 0, 0),
      ],
    },
    caption: caption ?? 'A satellite’s signal spreading toward a receiver (not to scale: the satellite is 20 200 km up). The receiver turns each signal’s travel time into a distance.',
  };
}

// the worked example: an FM station at 98.1 MHz, E₀ = 5.0 mV/m
const EX = (() => {
  const f = 98.1e6, E0 = 5.0e-3, lam = C3 / f, k = (2 * Math.PI) / lam, w = 2 * Math.PI * f, B0 = E0 / C3;
  return { f, E0, lam, k, w, B0 };
})();

export default lesson({
  id: 'phys2220.B6.3',
  title: 'Electromagnetic waves',
  minutes: 12, difficulty: 2,
  intro: t`Faraday’s law says a changing magnetic field makes an electric field; Maxwell’s term says a changing electric field makes a magnetic field. Far from any charge the two can keep each other going and travel: an **electromagnetic wave**. For a wave moving along $+x$ with its electric field along $y$,

$$E_y = E_0\sin(kx - \omega t),\qquad B_z = B_0\sin(kx - \omega t)$$

Maxwell’s equations allow this only if the wave moves at $c = \omega/k = 1/\sqrt{\mu_0\varepsilon_0} = 3.00\times10^8$ m/s and the amplitudes are locked together, $E_0 = cB_0$. The same equations fix the geometry: both fields are **transverse** (at right angles to the travel), $\vec E\perp\vec B$, and $\vec E\times\vec B$ points the way the wave goes. The fields are **in phase** — they peak and vanish together. Nothing material waves: the wave needs no medium, and in a vacuum every frequency travels at the same $c$.`,
  symbols: [
    { tex: 'E_0', text: 'the amplitude of the electric field, in V/m' },
    { tex: 'B_0', text: 'the amplitude of the magnetic field, in tesla; in a vacuum $B_0 = E_0/c$' },
    { tex: t`k = 2\pi/\lambda`, text: t`the wave number, in rad/m: how fast the phase turns along the wave; $\lambda$ is the wavelength` },
    { tex: t`\omega = 2\pi f`, text: 'the angular frequency, in rad/s; $f$ is the frequency in hertz' },
    { tex: 'c', text: t`the speed of light in a vacuum, $2.998\times10^8$ m/s, equal to $\omega/k = f\lambda$` },
    { tex: t`\mu_0,\ \varepsilon_0`, text: t`the magnetic and electric constants, $4\pi\times10^{-7}$ T·m/A and $8.854\times10^{-12}$ F/m` },
    { tex: t`\vec E\times\vec B`, text: 'the cross product of the two fields, which points along the direction of travel' },
  ],
  why: 'Radio, light and X-rays are all this one wave. Its speed comes out of two constants measured with capacitors and coils, with no mention of who is moving — the puzzle that led Einstein to special relativity.',
  visual: {
    type: 'em-wave',
    title: 'Two fields, one wave',
    lead: 'One plane wave, drawn along a single line through it. Violet arrows are the electric field, teal arrows the magnetic field, and the gold arrow the direction of travel; the dot carries all three at one point. Drag to turn the picture.',
    tasks: [
      'Watch the dot: its violet and teal arrows grow, shrink and reverse at the same moments. The fields are in phase; they do not take turns.',
      'Turn the polarization angle: the electric field swings in a new direction, and the magnetic field turns with it, staying at right angles to it and to the travel.',
      t`Raise $E_0$ from 1 V/m to 100 kV/m: $B_0 = E_0/c$ follows, and stays tiny in teslas.`,
    ],
    params: { controls: ['theta', 'E0', 'showB'], readouts: ['lambda', 'B0'] },
  },
  example: {
    prompt: t`An FM station broadcasts at 98.1 MHz. Near your radio its wave travels along $+x$ with an electric amplitude of 5.0 mV/m along $y$. Find (a) the wavelength, (b) the wave number $k$ and angular frequency $\omega$, (c) the magnetic amplitude, and (d) the direction of $\vec B$ at an instant when $\vec E$ points along $+y$. Use $c = 3.00\times10^8$ m/s.`,
    visual: { type: 'em-wave', params: { E0: EX.E0, f: EX.f, phase: 40, controls: [], readout: true, readouts: ['lambda', 'B0'] }, caption: 'The station’s wave with its wavelength and magnetic amplitude read out. Not to scale: the magnetic field is drawn c times larger than its value in tesla.' },
    steps: [
      { label: 'Wavelength', text: t`$\lambda = \dfrac{c}{f} = \dfrac{3.00\times10^8}{98.1\times10^6} = ${tn(EX.lam)}$ m.` },
      { label: 'Wave number and angular frequency', text: t`$k = \dfrac{2\pi}{\lambda} = ${tn(EX.k)}$ rad/m and $\omega = 2\pi f = ${tn(EX.w)}$ rad/s. Check: $\omega/k = ${tn(EX.w / EX.k)}$ m/s $= c$.` },
      { label: 'Magnetic amplitude', text: t`$B_0 = \dfrac{E_0}{c} = \dfrac{5.0\times10^{-3}}{3.00\times10^8} = ${tn(EX.B0)}$ T $= ${tn(EX.B0 * 1e12)}$ pT. So $E_y = (5.0\ \text{mV/m})\sin(kx - \omega t)$ and $B_z = (${tn(EX.B0 * 1e12)}\ \text{pT})\sin(kx - \omega t)$, with the same phase.` },
      { label: 'Direction of B', text: t`$\vec E\times\vec B$ must point along $+x$. With $\vec E$ along $+y$, $\hat y\times\hat z = \hat x$, so $\vec B$ points along $+z$. Half a period later both fields have reversed, and $(-\hat y)\times(-\hat z)$ is still $\hat x$.` },
      { label: 'Sense check', text: t`${tn(EX.B0 * 1e12)} pT is about three million times weaker than Earth’s steady field, yet a receiver tuned to 98.1 MHz picks it out because it oscillates. A quarter of the ${tn(EX.lam)} m wavelength is ${tn(EX.lam / 4, 2)} m, the length of a car’s FM aerial.` },
    ],
    answer: t`(a) $\lambda = ${tn(EX.lam)}$ m; (b) $k = ${tn(EX.k)}$ rad/m, $\omega = ${tn(EX.w)}$ rad/s; (c) $B_0 = ${tn(EX.B0 * 1e12)}$ pT; (d) along $+z$.`,
  },
  practice: [
    mcq({
      id: 'no-medium', difficulty: 1,
      prompt: 'Sunlight crosses 150 million km of space, emptier than any laboratory vacuum, to reach Earth; sound could not make that trip at all. What lets light do it?',
      visual: wavePic({}, 'An electromagnetic wave far from any matter: electric field violet, magnetic field teal, travelling along the gold arrow. Not to scale.'),
      choices: [
        'Light is a wave of electric and magnetic fields, each regenerating the other as it changes; nothing material has to wave',
        'Space is filled with an invisible “ether” that carries light the way air carries sound',
        'The solar wind’s particles carry the light along with them',
        'Light crosses space as a stream of particles and only becomes a wave when it reaches air',
      ],
      answer: 0,
      why: {
        1: 'Michelson and Morley looked for the ether in 1887 and found no trace of it; Maxwell’s equations need none.',
        2: 'The solar wind is extremely thin and moves at about 400 km/s; light outruns it by a factor of about 750.',
        3: 'Light interferes and diffracts in a vacuum exactly as in air: its wave nature does not depend on a medium.',
      },
      hints: ['What does a changing magnetic field make, by Faraday’s law? And a changing electric field, by Maxwell’s term?'],
      teach: 'An electromagnetic wave is the fields themselves changing, so it needs no medium and crosses a vacuum at c.',
      explain: t`Sound is a pressure wave, molecules pushing on molecules: no molecules, no sound. In light, the changing $\vec B$ makes $\vec E$ (Faraday) and the changing $\vec E$ makes $\vec B$ (Ampère–Maxwell), so the disturbance carries itself through empty space at $c$.`,
    }),
    mcq({
      id: 'in-phase', difficulty: 2,
      prompt: 'At the dot, the electric field of a plane wave in a vacuum has just reached its peak. What is the magnetic field at the dot at that instant?',
      visual: wavePic({ phase: 234, hide: ['B'] }, 'Only the electric field (violet) is drawn; at the dot it is at its peak. Not to scale.'),
      choices: [
        'Also at its peak: in a travelling wave the two fields rise and fall together',
        'Zero: it lags a quarter period behind, as current lags charge in an LC circuit',
        'Half its peak value, since the wave’s energy is shared equally between the fields',
        'It depends on the frequency of the wave',
      ],
      answer: 0,
      why: {
        1: t`An LC circuit passes energy back and forth between its fields; a travelling wave carries both at once, with $E = cB$ at every point and instant.`,
        2: t`Equal shares of energy do not mean half the field: $\tfrac12\varepsilon_0E^2 = B^2/2\mu_0$ exactly when $B = E/c$ — both at their peaks together.`,
        3: t`$E = cB$ holds at every point and instant, whatever the frequency.`,
      },
      hints: [t`Faraday’s law applied to the wave gives $E = cB$ — not just for the amplitudes, but at every instant.`],
      teach: 'In a travelling electromagnetic wave E and B are in phase: they peak, pass through zero and reverse together.',
      explain: t`Both fields go as $\sin(kx - \omega t)$ with the same phase, and $E = cB$ at every instant, so when $E$ peaks at a point, $B$ does too. A quarter period later both pass through zero together. (The “90° out of phase” picture belongs to standing waves and LC circuits, not to a wave travelling through a vacuum.)`,
    }),
    num({
      id: 'B0-from-E0', difficulty: 1,
      gen(r) {
        const c = r.pick([
          { what: 'the signal from a mobile-phone mast, 100 m away,', E0: 2.0, E0T: '2.0', unit: 'nT', f: 1e9 },
          { what: 'a radar pulse 1 km from the dish', E0: 450, E0T: '450', unit: 'µT', f: 1e6 },
          { what: 'the beam of a laser pointer', E0: 1900, E0T: '1900', unit: 'µT', f: 1e6 },
        ]);
        const B0 = (c.E0 / C3) * c.f;
        return {
          prompt: t`In ${c.what} the electric field oscillates with an amplitude of ${c.E0T} V/m. What is the amplitude of its magnetic field? Use $c = 3.00\times10^8$ m/s.`,
          visual: wavePic({ phase: 65 }, 'Not to scale: the magnetic field (teal) is drawn hugely enlarged so that it shows beside the electric field (violet).'),
          answer: B0, units: c.unit, tol: { rel: 0.01 },
          errors: apart([
            { value: c.E0 * C3 * c.f, feedback: t`Divide by $c$, do not multiply: $B_0 = E_0/c$.` },
            { value: c.E0 / C3, feedback: `That is the field in tesla; the answer is asked in ${c.unit}.` },
          ], B0),
          hints: [t`In a vacuum $E_0 = cB_0$.`],
          teach: t`In a vacuum $B_0 = E_0/c$: a few volts per metre goes with a few nanotesla.`,
          explain: t`$B_0 = \dfrac{E_0}{c} = \dfrac{${c.E0T}}{3.00\times10^8} = ${tn(c.E0 / C3)}$ T $= ${tn(B0)}$ ${c.unit}.`,
        };
      },
    }),
    num({
      id: 'f-from-k', difficulty: 2,
      gen(r) {
        const c = r.pick([{ k: 1.2e7, kT: t`1.20\times10^{7}`, E0: '85' }, { k: 2.1, kT: '2.10', E0: '0.040' }, { k: 52.4, kT: '52.4', E0: '12' }]);
        const f = (C3 * c.k) / (2 * Math.PI);
        return {
          prompt: t`The electric field of a wave in a vacuum is $E_y = (${c.E0}\ \text{V/m})\sin[(${c.kT}\ \text{rad/m})\,x - \omega t]$. What is its frequency? Use $c = 3.00\times10^8$ m/s.`,
          visual: fieldSnapshot({ caption: 'The wave at one instant (axis numbers hidden). Along one wavelength the phase kx grows by 2π.' }),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: apart([
            { value: C3 * c.k, feedback: t`That is $\omega = ck$, in rad/s. The frequency is $f = \omega/2\pi$.` },
            { value: c.k / (2 * Math.PI), feedback: t`That is $1/\lambda$, the number of wavelengths per metre. Multiply by $c$ for the number passing per second.` },
          ], f),
          hints: [t`For any wave in a vacuum $\omega/k = c$.`, t`So $f = \dfrac{\omega}{2\pi} = \dfrac{ck}{2\pi}$.`],
          teach: t`The wave number fixes the frequency through $\omega = ck$, so $f = ck/2\pi$.`,
          explain: t`$f = \dfrac{ck}{2\pi} = \dfrac{(3.00\times10^8)(${c.kT})}{2\pi} = ${tn(f)}$ Hz, and $\lambda = 2\pi/k = ${tn((2 * Math.PI) / c.k)}$ m.`,
        };
      },
    }),
    mcq({
      id: 'direction-B', difficulty: 2,
      gen(r) {
        const [E, k] = r.pick([['+z', '+x'], ['+y', '+z'], ['+x', '+y'], ['-z', '+y'], ['+z', '-x']]);
        const B = axisName(cross(AXES[k], AXES[E]));
        return {
          prompt: t`At one instant, a wave travelling along $${k}$ has its electric field along $${E}$, as drawn. Which way does its magnetic field point at that instant?`,
          visual: triad({ E, k }),
          choices: [t`Along $${B}$`, t`Along $${flip(B)}$`, t`Along $${k}$, the direction of travel`, t`Along $${E}$, parallel to the electric field`],
          answer: 0,
          why: {
            1: t`Check with the cross product: with $\vec B$ along $${flip(B)}$, $\vec E\times\vec B$ would point along $${flip(k)}$ — backwards.`,
            2: 'Both fields are transverse: neither has any component along the direction of travel.',
            3: t`$\vec B$ is at right angles to $\vec E$, never parallel to it.`,
          },
          hints: [t`$\vec E\times\vec B$ points along the direction of travel.`, t`Equivalently, $\vec B$ points along $\hat k\times\vec E$, where $\hat k$ is the direction of travel.`],
          teach: 'In a plane wave E, B and the direction of travel are mutually perpendicular, with E × B pointing along the travel.',
          explain: t`$\vec B$ points along $\hat k\times\hat E = (${hat(k)})\times(${hat(E)}) = ${hat(B)}$, that is along $${B}$. Check: $(${hat(E)})\times(${hat(B)}) = ${hat(k)}$, the direction of travel.`,
        };
      },
    }),
    mcq({
      id: 'same-speed', difficulty: 1,
      prompt: 'In a vacuum, how does the speed of an electromagnetic wave depend on its frequency and on its amplitude?',
      visual: specPic({ f: null, marks: ['am', 'oven', 'green', 'cuka', 'co60'] }, 'Radio waves, microwaves, light, X-rays and gamma rays: one kind of wave across more than fourteen decades of frequency.'),
      choices: [
        t`On neither: every electromagnetic wave travels at $c = 1/\sqrt{\mu_0\varepsilon_0}$`,
        'Higher frequencies travel faster, which is why X-rays are so energetic',
        'Bigger amplitudes travel faster, the way a harder throw goes faster',
        'Lower frequencies travel faster, since long waves slip round obstacles',
      ],
      answer: 0,
      why: {
        1: t`An X-ray carries more energy per photon because of its higher frequency ($E = hf$), not because it moves faster.`,
        2: t`The speed is set by $\mu_0$ and $\varepsilon_0$ alone; a stronger wave carries more energy at the same speed.`,
        3: 'Bending round obstacles (diffraction) depends on wavelength, but in a vacuum every wavelength moves at the same speed.',
      },
      hints: ['Which quantities appear in the speed Maxwell’s equations predict?'],
      teach: 'In a vacuum every electromagnetic wave, of any frequency or amplitude, travels at c.',
      explain: t`The wave equation from Maxwell’s equations gives the speed $1/\sqrt{\mu_0\varepsilon_0}$, which contains neither the frequency nor the amplitude. Gamma-ray bursts billions of light-years away deliver photons of very different energies within about a second of one another, which confirms it to better than one part in $10^{15}$.`,
    }),
    mcq({
      id: 'antenna', difficulty: 2,
      prompt: 'A transmitter sends out the wave shown, travelling along the gold arrow. A straight rod antenna picks up the signal when the wave pushes electrons back and forth along the rod. How should you hold the rod for the strongest signal?',
      visual: wavePic({ theta: 90, phase: 30 }, 'The arriving wave: electric field violet, magnetic field teal, travelling along the gold arrow. Drag to turn the picture.'),
      choices: [
        'Parallel to the violet arrows: level, and across the direction of travel',
        'Pointing along the gold arrow, straight at the transmitter',
        'Parallel to the teal arrows, along the magnetic field',
        'It makes no difference: the wave fills all the space round the rod',
      ],
      answer: 0,
      why: {
        1: 'The fields have no component along the direction of travel, so a rod pointing at the transmitter feels no push along its length.',
        2: t`The magnetic force on the slowly drifting electrons is $qvB$, tiny because $B = E/c$. It is the electric field that drives them along the rod.`,
        3: t`Only the component of $\vec E$ along the rod drives current: turn the rod at right angles to $\vec E$ and the signal fades away.`,
      },
      hints: ['Which field pushes on a charge at rest, and which way does it point here?'],
      teach: 'A rod antenna responds to the electric field along it, so it works best parallel to the wave’s electric field.',
      explain: t`The force on an electron is $q\vec E + q\vec v\times\vec B$; with drift speeds far below $c$ and $B = E/c$, the electric part dominates. Line the rod up with $\vec E$ — here level and across the beam — and the whole field drives the electrons. The direction of $\vec E$ is the wave’s **polarization**; broadcasters choose it, and receiving antennas are mounted to match.`,
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “This radar wave has $E_0 = 300$ V/m, so $B_0 = cE_0 = (3.00\times10^8)(300) = 9.0\times10^{10}$ T. The magnetic field of a radio wave is enormous; we just don’t notice it because it changes so fast.” What is wrong?`,
      visual: wavePic({ phase: 110 }, 'Not to scale: the magnetic field (teal) is drawn hugely enlarged so that it shows beside the electric field (violet).'),
      choices: [
        t`$B_0 = E_0/c$, not $cE_0$: the field is $1.0\ \mu$T, weaker than Earth’s`,
        t`Nothing: the magnetic field really is $9.0\times10^{10}$ T`,
        t`$B_0 = E_0$, since the fields share the energy equally, so it is 300 T`,
        t`$B_0 = E_0/c^2 = 3.3\times10^{-15}$ T`,
      ],
      answer: 0,
      why: {
        1: 'The strongest steady magnets ever built reach about 45 T; a field of 10¹⁰ T in an unnoticed radar beam is impossible.',
        2: t`$E$ and $B$ have different units (V/m and T), so they cannot simply be equal. Equal energy densities need $B = E/c$.`,
        3: t`One factor of $c$, not two: Faraday’s law applied to the wave gives $E_0 = cB_0$.`,
      },
      hints: ['Check the units: what does V/m divided by m/s give, and what does V/m times m/s give?'],
      teach: t`In a vacuum $B_0 = E_0/c$, so a wave’s magnetic field in tesla is tiny next to its electric field in V/m.`,
      explain: t`$B_0 = E_0/c = 300/(3.00\times10^8) = 1.0\times10^{-6}$ T $= 1.0\ \mu$T. The units confirm it: $(\text{V/m})/(\text{m/s}) = \text{V·s/m}^2 = \text{T}$, while $(\text{V/m})(\text{m/s}) = \text{V/s}$, which is not a magnetic field at all.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-E0', difficulty: 2,
      gen(r) {
        const B0T = r.pick(['0.25', '0.40', '2.0']), B0 = +B0T, E0 = B0 * 1e-9 * C3;
        return {
          prompt: t`A small loop antenna measures the magnetic field of a passing radio wave: it oscillates with an amplitude of ${B0T} nT. What is the wave’s electric amplitude? Use $c = 3.00\times10^8$ m/s.`,
          visual: wavePic({ hide: ['E'], phase: 70 }, 'Only the magnetic field (teal) is drawn here. Not to scale.'),
          answer: E0, units: 'V/m', tol: { rel: 0.01 },
          errors: apart([
            { value: (B0 * 1e-9) / C3, feedback: t`Multiply by $c$ here: $E_0 = cB_0$.` },
            { value: B0 * C3, feedback: t`Convert to tesla first: 1 nT $= 10^{-9}$ T.` },
          ], E0),
          hints: [t`In a vacuum $E_0 = cB_0$.`],
          teach: t`$E_0 = cB_0$: a magnetic amplitude of a nanotesla goes with an electric amplitude of 0.3 V/m.`,
          explain: t`$E_0 = cB_0 = (3.00\times10^8)(${B0T}\times10^{-9}) = ${tn(E0)}$ V/m.`,
        };
      },
    }),
    mcq({
      id: 'cp-travel', difficulty: 2,
      gen(r) {
        const [E, B] = r.pick([['+y', '+z'], ['+z', '+x'], ['-x', '+z'], ['+x', '-y']]);
        const k = axisName(cross(AXES[E], AXES[B]));
        return {
          prompt: t`At one instant, the fields of a plane wave at a point are as drawn: $\vec E$ along $${E}$ and $\vec B$ along $${B}$. Which way is the wave travelling?`,
          visual: triad({ E, B }),
          choices: [t`Along $${k}$`, t`Along $${flip(k)}$`, t`Along $${E}$`, t`Along $${B}$`],
          answer: 0,
          why: {
            1: t`That is $\vec B\times\vec E$; the order matters. The travel is along $\vec E\times\vec B$.`,
            2: 'The wave is transverse: it never travels along its own electric field.',
            3: 'The wave is transverse: it never travels along its own magnetic field.',
          },
          hints: [t`The wave travels along $\vec E\times\vec B$.`],
          teach: 'A plane wave travels along E × B.',
          explain: t`$(${hat(E)})\times(${hat(B)}) = ${hat(k)}$, so the wave travels along $${k}$, at right angles to both fields.`,
        };
      },
    }),
    num({
      id: 'cp-oven', difficulty: 3, transfer: true,
      gen(r) {
        const dT = r.pick(['5.9', '6.0', '6.2']), d = +dT, f = 2.45e9, c = 2 * (d / 100) * f;
        return {
          prompt: t`To measure the speed of light in a kitchen, take the turntable out of a microwave oven, put in a bar of chocolate, and heat it for about 20 s. The microwaves form a standing wave, so the chocolate melts first in spots half a wavelength apart. The melted spots are ${dT} cm apart, and the oven’s label says 2.45 GHz. What speed of light does this give?`,
          visual: ovenPic(),
          answer: c, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([
            { value: (d / 100) * f, feedback: t`The spots are half a wavelength apart, so $\lambda = 2d$.` },
            { value: 2 * d * f, feedback: 'Convert the spacing to metres before multiplying.' },
          ], c),
          hints: ['Neighbouring hot spots of a standing wave are half a wavelength apart.', t`$\lambda = 2d$, and $c = f\lambda$.`],
          teach: 'Hot spots of a standing wave are half a wavelength apart, so c = 2df.',
          explain: t`$\lambda = 2d = ${sf(2 * d, 3)}$ cm, so $c = f\lambda = (2.45\times10^9)(${sf(2 * d / 100, 3)}) = ${tn(c)}$ m/s — within ${Math.round(Math.abs(c / 2.998e8 - 1) * 100)}% of the accepted $2.998\times10^8$ m/s, which is good for a ruler and a bar of chocolate.`,
        };
      },
    }),
    num({
      id: 'cp-gps', difficulty: 2, transfer: true,
      gen(r) {
        const dt = r.pick([3, 10, 50]), dx = C3 * dt * 1e-9;
        return {
          prompt: t`A GPS receiver finds its distance from each satellite by timing the satellite’s radio signal, which travels at the speed of light. If the receiver’s clock is off by just ${dt} ns, how far off is the distance it computes? Use $c = 3.00\times10^8$ m/s.`,
          visual: gpsPic(),
          answer: dx, units: 'm', tol: { rel: 0.01 },
          errors: apart([{ value: C3 * dt, feedback: t`Convert to seconds first: 1 ns $= 10^{-9}$ s.` }], dx),
          hints: ['Distance = speed × time, and a timing error turns straight into a distance error.'],
          teach: 'Light travels about 30 cm in a nanosecond, so a timing error Δt is a distance error cΔt.',
          explain: t`$\Delta x = c\,\Delta t = (3.00\times10^8)(${dt}\times10^{-9}) = ${tn(dx)}$ m. That is why the satellites carry atomic clocks, and why a receiver uses a fourth satellite to solve for its own clock error along with its three coordinates.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §16.2 Plane electromagnetic waves', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-2-plane-electromagnetic-waves' },
    { label: 'GPS.gov: GPS accuracy', url: 'https://www.gps.gov/systems/gps/performance/accuracy/' },
  ],
});
