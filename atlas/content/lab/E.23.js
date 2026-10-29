// Electron diffraction — the lab view: the teaching tube in which electrons
// accelerated through a few kilovolts pass a polycrystalline graphite film
// and make two rings on the screen. de Broglie's λ = h/p puts the ring
// diameter in proportion to 1/√V; the slope gives the graphite spacing,
// compared with X-ray (neutron) crystallography. Type B: the film-to-screen
// distance and the voltmeter; the small-angle approximation as a systematic
// that matters for the outer ring; the relativistic correction as one that
// does not here, and does in an electron microscope (the transfer). Every
// number is computed from the seeded model the labg-classics simulation
// draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, colTable, SIMNOTE, SRC } from './_classic.js';
import { budget } from './_unc.js';

const t = String.raw;
const PE = M.EXPERIMENTS.ediff.defaults;
const [D10, D11] = M.graphiteD(PE.a);
const K = M.K;
const C1 = (2 * PE.L * K.h) / Math.sqrt(2 * K.me * K.e * 1e3);   // m·kV^½: d = C1/b (b in m·kV^½)

// the worked example: seed 2, inner ring
const EX = M.run('ediff', { seed: 2, axes: 'inner' });
const EXd = EX.results[0];
const relS = EXd.sigma / EXd.value, relL = 1 / 135, relV = 0.5 * 0.01;
const relAll = Math.hypot(relS, relL, relV), sAll = relAll * EXd.value, zAll = (EXd.value - D10) / sAll;
const runE = (seed, axes = 'inner') => M.run('ediff', { seed, axes });

export default lesson({
  id: 'lab.E.23',
  title: 'Electron diffraction',
  minutes: 17, difficulty: 3,
  lab: true,
  intro: t`In 1924 Louis de Broglie proposed that a particle of momentum $p$ is also a wave of wavelength $\lambda = h/p$; three years later Davisson and Germer, and G. P. Thomson, diffracted electrons off crystals. In the teaching tube, electrons accelerated through a voltage $V$ cross a film of graphite made of many tiny crystals at every orientation. Each set of atomic planes, spacing $d$, reflects them at the Bragg angle, $2d\sin\theta = \lambda$, into a cone: a **ring** on the screen. Raise the voltage, shorten the wavelength, and the rings shrink — as $1/\sqrt V$.`,
  equation: t`D \approx \frac{2L\lambda}{d} = \frac{2Lh}{d\sqrt{2m_e e}}\,\frac{1}{\sqrt V}`,
  symbols: [
    { tex: 'D', text: 'the diameter of a ring on the screen, in mm' },
    { tex: 'L', text: 'the distance from the graphite film to the screen, 13.5 cm in this tube' },
    { tex: '\\lambda', text: 'the electrons’ de Broglie wavelength, $h/p$, in pm: about 20 pm at 4 kV' },
    { tex: 'd', text: 'the spacing of the atomic planes that make the ring, in nm' },
    { tex: 'h', text: 'Planck’s constant, $6.626\\,070\\,15\\times10^{-34}$ J s (exact)' },
    { tex: 'm_e,\\ e', text: 'the electron’s mass and charge: $p = \\sqrt{2m_eeV}$ for an electron accelerated from rest through $V$ (non-relativistic)' },
    { tex: 'V', text: 'the accelerating voltage, in kV' },
  ],
  why: t`The same rings are how electron microscopes, and X-ray and neutron diffractometers, read the structure of matter — and they were the first proof that matter itself is a wave.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: rings from graphite',
    lead: t`Set the voltage and take a reading: the screen shows the two rings, and both diameters go in the table. The plot shows the inner ring’s diameter against $1/\sqrt V$ with a line through the origin; the readout turns its slope into the plane spacing $d$ and compares it with graphite’s from crystallography.`,
    tasks: [
      'Switch Plot to the outer ring: it gives the smaller spacing, and its d comes out a few σ low — the small-angle formula is worse for the wider ring.',
      'Switch to the exact analysis (2 sin θ against the relativistic λ): the inner ring’s d moves by about half a percent and agrees comfortably.',
      'Divide an outer diameter by the inner one at the same voltage: about 1.73 = √3, the ratio of the two graphite spacings.',
    ],
    params: { exp: 'ediff', seed: 3, expected: true },
    caption: t`Simulated: graphite with lattice constant $a = 0.2461$ nm, so $d_{10} = a\sqrt3/2 = 0.2131$ nm and $d_{11} = a/2 = 0.1231$ nm; a flat screen 13.5 cm from the film; each diameter read with a calliper to $\sigma = 0.4$ mm; the electrons’ λ relativistic. The tube’s curved glass screen is simplified to a flat one. Dashed green: the small-angle line for graphite’s $d$. ${SIMNOTE}`,
  },
  example: {
    prompt: t`With $L = 135 \pm 1$ mm, the inner ring’s diameter, read to $\sigma = 0.4$ mm, at six voltages (the voltmeter good to 1%):

${colTable([[t`V\ (\text{kV})`, ...EX.R.map((q) => q.V.toFixed(1))], [t`D\ (\text{mm})`, ...EX.R.map((q) => q.D1.toFixed(1))]])}

Find the plane spacing $d$ with its full uncertainty and compare it with graphite’s $d_{10} = 0.2131$ nm.`,
    visual: rigPlot('ediff', { seed: 2, axes: 'inner', expected: true }, t`Inner-ring diameter against $1/\sqrt V$, the fit through the origin (gold) and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Linearize', text: t`For small angles $D \approx 2L\cdot 2\theta$ and $2\theta \approx \lambda/d$, with $\lambda = h/\sqrt{2m_eeV}$: $D = \bigl(2Lh/(d\sqrt{2m_ee})\bigr)\,V^{-1/2}$. A line through the origin in $1/\sqrt V$.` },
      { label: 'Fit', text: t`Through the origin, slope $b = ${pmT(EX.fit.b, EX.fit.sb)}\ \text{mm}\,\text{kV}^{1/2}$, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ ($\nu = 5$).` },
      { label: 'Spacing', text: t`$d = 2Lh/(b\sqrt{2m_ee\times10^3\ \text{V}})$. With $L = 0.135$ m and $b = ${tex(EX.fit.b * 1e-3, 4)}\ \text{m\,kV}^{1/2}$: $d = ${tex(C1, 4)}/${tex(EX.fit.b * 1e-3, 4)}$ $= ${(EXd.value * 1e9).toFixed(4)}$ nm, statistical σ $${(100 * relS).toFixed(2)}\%$.` },
      { label: 'Type B', text: t`$d \propto L$: the 1 mm on 135 mm gives $${(100 * relL).toFixed(2)}\%$. $d \propto \sqrt V$ (through $\lambda$): the voltmeter’s 1% gives 0.5%. Combined: $${(100 * relAll).toFixed(2)}\%$, $\sigma = ${(sAll * 1e9).toFixed(4)}$ nm.` },
      { label: 'Compare', text: t`$z = (${(EXd.value * 1e9).toFixed(4)} - 0.2131)/${(sAll * 1e9).toFixed(4)} = ${zAll.toFixed(2)}$: agreement with the spacing from crystallography. The two small approximations (small angle, non-relativistic λ) pull in opposite directions and are each under 0.5% for this ring.` },
    ],
    answer: t`$d = ${pmT(EXd.value * 1e9, sAll * 1e9)}$ nm (fit, distance and voltage combined), $${Math.abs(zAll).toFixed(1)}\sigma$ from graphite’s $d_{10} = 0.2131$ nm.`,
  },
  practice: [
    num({
      id: 'lambda', difficulty: 1,
      gen(r) {
        const V = r.pick([2.5, 3, 4, 5]);
        const ans = M.lamE(V * 1e3, false) * 1e12;
        return {
          prompt: t`What is the de Broglie wavelength of an electron accelerated from rest through $${V}$ kV (non-relativistically)? Answer in pm.`,
          visual: rigRaw('ediff', { seed: 1, settings: [V] }, `The rings at ${V} kV (simulated; the screen face on).`),
          answer: ans, units: 'pm', tol: { rel: 0.005 },
          errors: [
            { value: (K.h / Math.sqrt(K.me * K.e * V * 1e3)) * 1e12, feedback: t`The kinetic energy is $eV = p^2/2m_e$, so $p = \sqrt{2m_eeV}$ — keep the 2.` },
            { value: ((K.h * K.c) / (K.e * V * 1e3)) * 1e12, feedback: t`$\lambda = hc/E$ is a *photon’s* wavelength. For an electron use $\lambda = h/p$ with $p = \sqrt{2m_eeV}$.` },
          ],
          hints: [t`$p = \sqrt{2m_eeV}$ and $\lambda = h/p$.`],
          teach: t`$\lambda = h/\sqrt{2m_eeV}$: about $1.226/\sqrt{V}$ nm with $V$ in volts.`,
          explain: t`$\lambda = 6.626\times10^{-34}/\sqrt{2(9.109\times10^{-31})(1.602\times10^{-19})(${tex(V * 1e3, 2)})} = ${ans.toFixed(2)}$ pm — about ten times smaller than the spacing between graphite’s atoms.`,
        };
      },
    }),
    num({
      id: 'one-ring', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), V = r.pick([3, 4, 5]);
        const q = M.readRows('ediff', M.makeRows('ediff', { seed, settings: [V] }))[0];
        const lam = M.lamE(V * 1e3, false);
        const ans = ((2 * PE.L * lam) / (q.D1 * 1e-3)) * 1e9;
        return {
          prompt: t`At $${V}$ kV the inner ring measures $D = ${q.D1.toFixed(1)}$ mm on a screen $L = 135$ mm from the film. Using the small-angle formula $d = 2L\lambda/D$ with the non-relativistic $\lambda$, what plane spacing does this one reading give? Answer in nm.`,
          visual: rigRaw('ediff', { seed, settings: [V] }, 'This reading’s rings, the screen face on (simulated).'),
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: [
            { value: ans / 2, feedback: t`The ring’s *radius* is $L\cdot2\theta$; its diameter is twice that: $d = 2L\lambda/D$.` },
            { value: ans * 2, feedback: t`Check the geometry: the beam turns through $2\theta$, so $D/2 = L\cdot 2\theta$ and $2\theta = \lambda/d$.` },
          ],
          hints: [t`$\lambda = h/\sqrt{2m_eeV} = ${(lam * 1e12).toFixed(2)}$ pm.`, t`$d = 2L\lambda/D$, all in metres.`],
          teach: t`The beam is deflected by $2\theta$, so a ring of diameter $D$ at distance $L$ means $2\theta \approx D/2L$ and $d \approx 2L\lambda/D$.`,
          explain: t`$d = 2(0.135)(${tex(lam, 4)})/(${tex(q.D1 * 1e-3, 3)}) = ${tex(ans * 1e-9, 4)}$ m $= ${ans.toFixed(4)}$ nm. One reading carries the calliper’s 0.4 mm on about 25 mm: 1.6%. The fit of six does better.`,
        };
      },
    }),
    num({
      id: 'slope-d', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runE(seed);
        const b = +A.fit.b.toFixed(3);
        const ans = (C1 / (b * 1e-3)) * 1e9;
        return {
          prompt: t`A fit of inner-ring diameter $D$ (mm) against $1/\sqrt V$ ($V$ in kV) through the origin gives slope $b = ${b.toFixed(3)}\ \text{mm\,kV}^{1/2}$, with $L = 0.135$ m. Using $d = 2Lh/(b\sqrt{2m_ee\times10^3\ \text{V}})$, find $d$. Answer in nm.`,
          visual: rigPlot('ediff', { seed }, t`The run: inner-ring diameter against $1/\sqrt V$, the fit through the origin and residuals. ${SIMNOTE}`),
          answer: ans, units: 'nm', tol: { rel: 0.003 },
          errors: [{ value: (2 * PE.L * K.h) / Math.sqrt(2 * K.me * K.e) / (b * 1e-3) * 1e9, feedback: t`$V$ was in kilovolts: $1/\sqrt{V_\text{kV}} = \sqrt{1000}/\sqrt{V_\text{V}}$, so the slope carries a factor $\sqrt{1000}$.` }],
          hints: [t`$2Lh/\sqrt{2m_ee\times10^3} = ${tex(C1, 4)}\ \text{m}^2\,\text{kV}^{1/2}$.`, t`Divide that by $b$ in metres: $${tex(b * 1e-3, 4)}$.`],
          teach: t`The slope of $D$ against $1/\sqrt V$ is $2Lh/(d\sqrt{2m_ee})$; solve for $d$, minding the kilovolts.`,
          explain: t`$d = ${tex(C1, 4)}/${tex(b * 1e-3, 4)} = ${tex(ans * 1e-9, 4)}$ m $= ${ans.toFixed(4)}$ nm.`,
        };
      },
    }),
    mcq({
      id: 'ratio', difficulty: 2,
      prompt: t`At every voltage the outer ring is about 1.73 times the inner ring’s diameter. What does that ratio tell you?`,
      visual: rigRaw('ediff', { seed: 2, settings: [4] }, 'Both rings at 4 kV (simulated).'),
      choices: [
        t`The two rings come from planes whose spacings are in the ratio $\sqrt3$ — graphite’s hexagonal layers, $d_{10} = a\sqrt3/2$ and $d_{11} = a/2$`,
        'The outer ring is the second order of the inner one',
        'The outer ring is made by faster electrons',
        'The ratio depends on the voltage, so it tells nothing by itself',
      ],
      answer: 0,
      why: {
        1: t`A second order ($2d\sin\theta = 2\lambda$) would be about twice the diameter, not 1.73 times.`,
        2: 'Every electron in the beam has the same energy, eV.',
        3: t`$D \propto \lambda/d$ for both rings: the voltage cancels in their ratio.`,
      },
      hints: [t`$D \propto 1/d$ for every ring at the same $\lambda$.`, t`What is $d_{10}/d_{11}$ for $d_{10} = a\sqrt3/2$, $d_{11} = a/2$?`],
      teach: 'Ratios of ring diameters fingerprint a crystal’s geometry, whatever the wavelength.',
      explain: t`$D_\text{outer}/D_\text{inner} = d_{10}/d_{11}$ $= (a\sqrt3/2)/(a/2) = \sqrt3 = 1.732$: the spacings of a hexagonal net of carbon atoms. (A second order of the inner ring would sit at about twice its diameter; graphite’s (10) second order is faint.)`,
    }),
    mcq({
      id: 'small-angle', difficulty: 3,
      prompt: t`Analysed the same way — small angles, a line through the origin — the *outer* ring gives $d_{11}$ about 3σ below $0.1231$ nm, while the inner ring agrees. Why?`,
      visual: rigPlot('ediff', { seed: 4, axes: 'outer', expected: true }, t`Outer-ring diameter against $1/\sqrt V$, the fit and residuals. ${SIMNOTE}`),
      choices: [
        t`$D = 2L\tan 2\theta$ grows faster than $2L\cdot2\theta$; the outer ring’s angle is twice as big, so the error is about four times bigger (over 1%), making $D$ — hence the slope — too large and $d$ too small`,
        'The outer ring is fainter, so its diameter is read less precisely',
        'Relativity affects the outer ring more than the inner one',
        'The outer ring comes from a different crystal of graphite',
      ],
      answer: 0,
      why: {
        1: 'Lower precision would widen σ, not shift the result by 3σ.',
        2: 'Every ring is made by the same electrons with the same λ; relativity shifts both rings by the same fraction.',
        3: 'Every ring comes from the same polycrystalline film.',
      },
      hints: [t`$\tan x \approx x(1 + x^2/3)$.`, t`Which ring has the larger angle $2\theta$, and how does the error scale with it?`],
      teach: 'A small-angle approximation’s error grows as the square of the angle: check it at your largest angle.',
      explain: t`At 2.5 kV the outer ring’s $2\theta$ is about 0.2 rad, where $\tan 2\theta$ exceeds $2\theta$ by $(0.2)^2/3 = 1.3\%$; the inner ring’s 0.11 rad gives 0.4%. With $\sigma$ of 0.35% on $d_{11}$, the outer ring’s bias is several σ. The exact analysis — $2\sin\theta$ from $\arctan(D/2L)$, against the relativistic λ — removes it.`,
    }),
    num({
      id: 'relativity', difficulty: 3,
      gen(r) {
        const V = r.pick([3, 4, 5, 10]);
        const ans = 100 * (M.lamE(V * 1e3, false) / M.lamE(V * 1e3, true) - 1);
        return {
          prompt: t`The relativistic momentum after $V$ volts is $p = \sqrt{2m_eeV\,(1 + eV/2m_ec^2)}$. By what percentage does the non-relativistic formula overestimate $\lambda$ at $${V}$ kV? ($m_ec^2 = 511.0$ keV.)`,
          visual: budget([{ label: 'calliper (one ring, 0.4 mm on 25 mm)', u: 1.6 }, { label: 'distance L (1 mm on 135 mm)', u: 0.74 }, { label: 'voltmeter (1% on V, ½ on d)', u: 0.5 }], { unit: '%', caption: 'This tube’s other uncertainties on d, for scale. Is the relativistic correction worth making?' }),
          answer: ans, units: '%', tol: { rel: 0.02 },
          errors: [{ value: 100 * (V / 511), feedback: t`That is $eV/m_ec^2$. The momentum has $\sqrt{1 + eV/2m_ec^2}$, so $\lambda$ changes by about $eV/4m_ec^2$.` }],
          hints: [t`$\lambda_\text{nr}/\lambda_\text{rel} = \sqrt{1 + eV/2m_ec^2}$.`, t`For small $x$, $\sqrt{1+x} \approx 1 + x/2$: the excess is about $eV/(4m_ec^2)$.`],
          teach: t`At a few kV the relativistic correction to $\lambda$ is $eV/4m_ec^2$ — a few tenths of a percent.`,
          explain: t`$\sqrt{1 + ${V}/(2 \times 511.0)} - 1 = ${(ans / 100).toFixed(5)}$: $${ans.toFixed(3)}\%$. Smaller than the tube’s other uncertainties at these voltages — worth knowing, and worth checking rather than assuming.`,
        };
      },
    }),
    mcq({
      id: 'rings', difficulty: 2,
      prompt: 'Why does the graphite film make rings, rather than a few bright spots?',
      visual: rigRaw('ediff', { seed: 3, settings: [3.5] }, 'The rings at 3.5 kV (simulated).'),
      choices: [
        'The film is made of countless tiny crystals at every orientation; each set of planes reflects electrons at the Bragg angle in every direction around the beam, filling a cone',
        'Electrons spread out in circles because they repel each other',
        'The screen is round, so any pattern looks round',
        'Each ring is one electron’s circular orbit around a carbon atom',
      ],
      answer: 0,
      why: {
        1: 'The beam current is tiny; mutual repulsion spreads the spot slightly but makes no sharp rings.',
        2: 'A single crystal on the same screen gives spots: the rings come from the film, not the glass.',
        3: 'The electrons pass straight through the film to the screen; the rings are directions of travel, not orbits.',
      },
      hints: ['A single crystal gives a spot pattern. What is different about a film of many crystals?'],
      teach: 'Randomly oriented crystals turn Bragg spots into cones: Debye–Scherrer rings.',
      explain: t`For one crystal, each set of planes satisfies the Bragg condition only in particular directions: spots (a Laue pattern). Average over all orientations about the beam and each spot sweeps out a cone of half-angle $2\theta$ — a ring.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = runE(seed, 'exact');
        const v = +(A.results[0].value * 1e9).toFixed(4);
        const s = +(v * Math.hypot(A.results[0].sigma / A.results[0].value, relL, relV)).toFixed(4);
        const ans = (v - 0.2131) / s;
        return {
          prompt: t`An exact analysis of the inner ring gives $d = ${v.toFixed(4)} \pm ${s.toFixed(4)}$ nm (fit, distance and voltage combined). Graphite’s $d_{10}$ from crystallography is $0.2131$ nm. Give $z$, with its sign.`,
          visual: rigPlot('ediff', { seed, axes: 'exact' }, t`The exact analysis: $2\sin\theta$ against the relativistic $\lambda$, through the origin; the slope is $1/d$. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.06 },
          errors: [{ value: (100 * (v - 0.2131)) / 0.2131, feedback: 'That is the percentage difference: divide by σ instead.' }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: ['Subtract 0.2131 nm.', t`$z = \Delta/\sigma$.`],
          teach: t`Agreement is judged by $z = \Delta/\sigma$.`,
          explain: t`$z = (${v.toFixed(4)} - 0.2131)/${s.toFixed(4)} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    num({
      id: 'cp-h', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = runE(seed);
        const b = +A.fit.b.toFixed(3);
        const ans = ((b * 1e-3) * D10 * Math.sqrt(2 * K.me * K.e * 1e3)) / (2 * PE.L);
        return {
          prompt: t`Turn the experiment round: take graphite’s $d_{10} = 0.2131$ nm as known. The inner ring’s slope is $b = ${b.toFixed(3)}\ \text{mm\,kV}^{1/2}$ with $L = 0.135$ m. What value of Planck’s constant does it give? Answer in J s.`,
          visual: rigPlot('ediff', { seed, residuals: false }, t`The fit of the inner ring. ${SIMNOTE}`),
          answer: ans, units: 'J s', tol: { rel: 0.004 },
          errors: [{ value: ((b * 1e-3) * D10 * Math.sqrt(2 * K.me * K.e)) / (2 * PE.L), feedback: t`The slope is per $\text{kV}^{-1/2}$: multiply by $\sqrt{1000}$ to work in volts.` }],
          hints: [t`$b = 2Lh/(d\sqrt{2m_ee})$ with $V$ in volts — here in kV, so include $\sqrt{10^3}$.`, t`$h = b\,d\sqrt{2m_ee\times10^3}/(2L)$.`],
          teach: 'With the crystal known, the same slope measures h: de Broglie run backwards.',
          explain: t`$h = (${tex(b * 1e-3, 4)})(${tex(D10, 4)})\sqrt{2m_ee\times10^3}/(0.270) = ${tex(ans, 4)}$ J s, against the exact $6.626\times10^{-34}$ J s.`,
        };
      },
    }),
    num({
      id: 'cp-tem', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([100, 200, 300]);
        const ans = M.lamE(V * 1e3, true) * 1e12;
        return {
          prompt: t`A transmission electron microscope accelerates electrons through $${V}$ kV. Using the relativistic momentum $p = \sqrt{2m_eeV(1 + eV/2m_ec^2)}$ with $m_ec^2 = 511.0$ keV, what is their wavelength? Answer in pm.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 320], y: [0, 9], xlabel: 'accelerating voltage (kV)', ylabel: 'λ (pm)', axesAt: 'edge', curves: [{ fn: `${(1226.4 / Math.sqrt(1000)).toFixed(4)}/sqrt(x)`, color: 'ink3', dash: true, label: 'non-relativistic', labelAt: 40 }, { fn: `${(1226.4 / Math.sqrt(1000)).toFixed(4)}/sqrt(x*(1 + x/1022))`, color: 'accent' }] }, caption: 'The electron wavelength against voltage: relativistic (solid) and non-relativistic (dashed). They part company above a few tens of kilovolts.' },
          answer: ans, units: 'pm', tol: { rel: 0.003 },
          errors: [{ value: M.lamE(V * 1e3, false) * 1e12, feedback: t`At ${V} kV, $eV/2m_ec^2 = ${(V / 1022).toFixed(3)}$: the relativistic factor matters here.` }],
          hints: [t`$\lambda = h/\sqrt{2m_eeV(1 + eV/2m_ec^2)}$.`, t`Non-relativistically $\lambda = 1.2264\ \text{nm}/\sqrt{V/\text{volt}}$; divide by $\sqrt{1 + V/1022\ \text{kV}}$.`],
          teach: t`Above a few tens of kV, use the relativistic momentum: $\lambda = h/\sqrt{2m_eeV(1 + eV/2m_ec^2)}$.`,
          explain: t`$\lambda = ${(M.lamE(V * 1e3, false) * 1e12).toFixed(3)}\ \text{pm}/\sqrt{1 + ${V}/1022} = ${ans.toFixed(3)}$ pm — tens of times smaller than an atom, which is why electron microscopes resolve atomic columns (their lenses, not λ, set the limit).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'C. Davisson & L. H. Germer, Diffraction of electrons by a crystal of nickel, Phys. Rev. 30, 705 (1927)', url: 'https://doi.org/10.1103/PhysRev.30.705' },
    { label: 'G. P. Thomson & A. Reid, Diffraction of cathode rays by a thin film, Nature 119, 890 (1927)', url: 'https://doi.org/10.1038/119890a0' },
    { label: 'P. Trucano & R. Chen, Structure of graphite by neutron diffraction, Nature 258, 136 (1975)', url: 'https://doi.org/10.1038/258136a0' },
    SRC.codata,
    SRC.os3('6.5', '6-5-de-broglies-matter-waves'),
  ],
});
