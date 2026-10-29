// Stern–Gerlach experiments — the spins-first on-ramp (McIntyre ch. 1,
// Townsend ch. 1). Silver atoms in 1922; ideal analysers in a chain; the
// fractions cos²(θ/2); z, then x, then z again; and the unobserved "both
// beams" loop that a sorting picture cannot explain. The new qm4-sg sim
// carries the lesson. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { MU_B, GE, M_H, G0, CS_HFS, exact, sgPic, seg, label, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;
const cos2 = (deg) => Math.cos((deg * D) / 2) ** 2;
const sin2 = (deg) => Math.sin((deg * D) / 2) ** 2;
const AX = { z: 'z', x: 'x', y: 'y' };
/** An analyser's name in prose: z, x, y or n̂ at θ. */
const axTeX = (a) => (a.axis === 'n' ? t`$\hat n$ at $\theta = ${a.theta}^\circ$` : t`$${AX[a.axis]}$`);
const portTeX = (s) => (s === '-' ? '−' : '+');

/** Two predictions for the detector plate: a continuous band, and two separate lines. */
const plate = {
  type: 'graph',
  params: {
    x: [-1.9, 1.9], y: [0, 1.25], aspect: 'wide', xlabel: 'deflection along the field gradient (arbitrary units)', ylabel: 'atoms', yticks: 0, xticks: 0, axesAt: 'edge',
    curves: [
      { fn: '0.42*(erf((x + 1)/0.18) - erf((x - 1)/0.18))', color: 'warn', width: 2.4, label: 'prediction P', labelAt: -0.35, labelDy: -12 },
      { fn: 'exp(-(x - 1)^2/0.018) + exp(-(x + 1)^2/0.018)', color: 'accent', width: 2.4, label: 'prediction Q', labelAt: 1.06, labelDx: 8, labelDy: -6 },
    ],
  },
  caption: 'Two predictions for where atoms from a hot oven land on the plate, drawn schematically: P, a continuous band; Q, two separate lines. Neither is 1922 data.',
};

/** The field and the force on the two spin states inside the magnet. */
const gradientPic = {
  type: 'graph',
  params: {
    x: [-1, 1], y: [0, 2.2], aspect: 'wide', xlabel: 'height z inside the magnet (arbitrary units)', ylabel: 'field Bz', xticks: 0, yticks: 0, axesAt: 'edge',
    curves: [{ fn: '1.1 + 0.8*x', color: 'accent', width: 2.4, label: 'Bz grows with z', labelAt: 0.35, labelDx: 6, labelDy: -14 }],
    arrows: [
      { from: [-0.35, 1.0], to: [-0.35, 1.65], color: 'gold', width: 2.4, label: 'F (moment along +z)', labelDx: 8, labelDy: 0 },
      { from: [0.45, 1.6], to: [0.45, 0.95], color: 'violet', width: 2.4, label: 'F (moment along −z)', labelDx: 8, labelDy: 0 },
    ],
  },
  caption: 'In a Stern–Gerlach magnet the field strength changes with height, so a magnetic moment is pushed up or down according to its component along the field. Schematic; real gradients reach about 10³ T/m.',
};

/** Chains whose fractions are clean and nonzero, for the generators. */
const CHAINS = [
  [{ axis: 'z', pass: '+' }, { axis: 'x', pass: '+' }, { axis: 'z' }, '-'],
  [{ axis: 'z', pass: '+' }, { axis: 'y', pass: '-' }, { axis: 'z' }, '+'],
  [{ axis: 'x', pass: '+' }, { axis: 'z', pass: '-' }, { axis: 'x' }, '+'],
  [{ axis: 'z', pass: '+' }, { axis: 'n', theta: 60, pass: '+' }, { axis: 'z' }, '-'],
  [{ axis: 'z', pass: '-' }, { axis: 'n', theta: 120, pass: '+' }, { axis: 'z' }, '-'],
  [{ axis: 'z', pass: '+' }, { axis: 'n', theta: 90, pass: '-' }, { axis: 'y' }, '+'],
  [{ axis: 'y', pass: '+' }, { axis: 'x', pass: '+' }, { axis: 'y' }, '-'],
];

export default lesson({
  id: 'phys4700.M1.1',
  title: 'Stern–Gerlach experiments',
  minutes: 14, difficulty: 2,
  intro: t`In 1922 Otto Stern and Walther Gerlach sent silver atoms from a hot oven through a magnet whose field grows steeply with height. A magnetic moment there feels a force $F_z = \mu_z\,\partial B_z/\partial z$, so atoms with randomly oriented moments should have smeared into a continuous band. **The beam split into exactly two.** The moment belongs to the outer electron’s **spin**, and measured along any axis its component takes only two values. That device — a magnet that sorts atoms into a “+” beam and a “−” beam — is a **Stern–Gerlach analyser**, and chaining analysers is the cleanest laboratory there is for the rules of quantum measurement:

$$S_n = \pm\frac{\hbar}{2}, \qquad P_+ = \cos^2\frac{\theta}{2}$$

An atom that has just left the + port of a $z$ analyser enters a second analyser tilted by $\theta$, and comes out + with probability $\cos^2(\theta/2)$. This module builds quantum mechanics on that two-state system before any wave function appears.`,
  symbols: [
    { tex: 'S_n', text: t`the component of the atom’s spin angular momentum along the analyser’s axis $\hat n$, in J s` },
    { tex: '\\hbar', text: t`the reduced Planck constant, $h/2\pi = ${tex(1.054571817e-34, 4)}$ J s; spin-½ components are $\pm\hbar/2$` },
    { tex: '\\hat n', text: 'the unit vector along which an analyser’s field gradient points: z, x, y or any direction' },
    { tex: '\\theta', text: t`the angle between the axis that prepared the atom and the axis that measures it` },
    { tex: 'P_+', text: 'the probability that the atom leaves the second analyser by its + port: over many atoms, the fraction that do' },
    { tex: '\\mu_z,\\ \\partial B_z/\\partial z', text: t`the moment’s component along $z$ (J/T) and the field’s gradient (T/m); their product is the force, in N` },
  ],
  why: 'Every rule of quantum measurement — discrete outcomes, probabilities, and a measurement that resets the state — shows up here in its simplest form, with only two outcomes to track.',
  visual: {
    type: 'qm4-sg',
    title: 'A chain of analysers',
    lead: t`Atoms leave the oven, pass the **+** beam of a $z$ analyser, then an $x$ analyser, then a $z$ analyser again. Fire atoms one at a time, then thousands. Beam widths are the predicted fractions; the bars below are what you have measured.`,
    tasks: [
      'Send 10 000 atoms. Every atom reaching the last analyser left the first as +z, yet half of them now come out −.',
      'Set analyser 2 to pass both beams, recombined. The − counter stays at zero: nothing was measured along x.',
      'Set Analysers to 2 and turn analyser 2 to n̂ at θ = 60°: three quarters of the atoms reaching it go +.',
    ],
    params: {
      source: 'oven', analysers: [{ axis: 'z', pass: '+' }, { axis: 'x', pass: '+' }, { axis: 'z' }], N: 0,
      controls: ['count', 'a1', 'p1', 'a2', 'p2', 'a3'],
    },
  },
  example: {
    prompt: t`8000 silver atoms leave the oven, one at a time. They meet a $z$ analyser that passes only its + beam, then an $x$ analyser that passes only its + beam, then a final $z$ analyser with a counter on each port. How many atoms, on average, are stopped at each block and counted at each counter? Then let the $x$ analyser pass **both** beams, recombined, with nothing recording which beam an atom took.`,
    visual: sgPic([{ axis: 'z', pass: '+' }, { axis: 'x', pass: '+' }, { axis: 'z' }], { exact: true, counts: true, N: 8000, caption: 'The chain after 8000 atoms (a seeded random run). The small numbers are the predicted fractions of all atoms from the oven. Schematic beams.' }),
    steps: [
      { label: 'The first analyser', text: t`An oven’s atoms are unpolarized: half are found + along any axis. So **4000** pass on as $+z$ and **4000** are stopped.` },
      { label: 'The second analyser', text: t`An atom fresh from the $+z$ beam meets an analyser turned by $\theta = 90^\circ$: $P_+ = \cos^2 45^\circ = \tfrac12$. So **2000** pass as $+x$ and **2000** are stopped.` },
      { label: 'The third analyser', text: t`Now each atom is $+x$, and $z$ is $90^\circ$ from $x$ again: $\tfrac12$ each way. About **1000** at the + counter and **1000** at the − counter — although every one of them had been found $+z$ two magnets earlier.` },
      { label: 'Sense check', text: t`$4000 + 2000 + 1000 + 1000 = 8000$: every atom is accounted for. Each count is a random draw, so a real run gives numbers near these, within about $\sqrt{N}$.` },
      { label: 'Both beams on', text: t`With the $x$ analyser passing both beams and nothing recording which, all **4000** atoms that left the first analyser reach the last one — and **all 4000 come out +**. An unobserved split is not a measurement: the two beams recombine into $+z$ again.` },
    ],
    answer: t`Blocks: 4000 and 2000; counters: about 1000 and 1000. With both $x$ beams passed unobserved: 4000 at + and none at −.`,
  },
  practice: [
    mcq({
      id: 'two-lines', difficulty: 1,
      prompt: t`The plot shows two predictions for where silver atoms from a hot oven land after a Stern–Gerlach magnet. Which did Stern and Gerlach find in 1922, and what does it tell you?`,
      visual: plate,
      choices: [
        t`Q, two separate lines: the moment’s component along the field takes only two values`,
        t`P, a continuous band: the moments point every which way, so $\mu_z$ takes every value between $-\mu$ and $+\mu$`,
        t`A single line at zero deflection: silver atoms have no magnetic moment`,
        t`Three lines, at $-1$, $0$ and $+1$: the orbital angular momentum $l = 1$ has three orientations`,
      ],
      answer: 0,
      why: {
        1: t`That is the classical prediction, and it is what made the result famous: a uniform spread of directions gives a flat band of deflections — and no band appeared.`,
        2: t`Silver’s outer electron carries a moment of about one Bohr magneton; the beam was deflected, and split.`,
        3: t`Silver’s outer electron has $l = 0$. An odd number of lines, $2l + 1$, is what orbital angular momentum would give; two lines need a half-integer, spin ½.`,
      },
      hints: ['Classical moments can point in any direction. Which picture would that give?', 'The result surprised everyone because it was not a band.'],
      teach: 'Stern and Gerlach saw two lines, not a band: a component of spin is quantized, with two possible values.',
      explain: t`Two lines. A classical moment at random angles would give a flat band of $\mu_z$ values. Two lines mean $\mu_z$, and so $S_z$, has just two values, $\pm\hbar/2$. (In 1922 they read it as quantized *orbital* motion; spin was proposed in 1925, and Phipps and Taylor’s 1927 run with hydrogen atoms, whose ground state has no orbital angular momentum at all, settled it.)`,
    }),
    num({
      id: 'tilted-count', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 45, 60, 120, 135, 150]), N = r.pick([1000, 2000, 4000, 5000]);
        const ans = N * cos2(th);
        return {
          prompt: t`${N} atoms prepared in the $+z$ state (they have just left the + port of a $z$ analyser) enter an analyser whose axis $\hat n$ lies in the xz-plane at $\theta = ${th}^\circ$ from $+z$. On average, how many leave its **+** port?`,
          visual: sgPic([{ axis: 'n', theta: th }], { source: 'z+', caption: t`Atoms prepared $+z$ entering one analyser tilted ${th}° from z. Schematic.` }),
          answer: ans, tol: { rel: 0.01, abs: 1 },
          errors: [
            { value: N * Math.cos(th * D), feedback: t`That is $N\cos\theta$, a classical projection. The probability is $\cos^2(\theta/2)$, the square of a half-angle.` },
            { value: N * sin2(th), feedback: t`That is the − port: $\sin^2(\theta/2)$.` },
            { value: N * Math.cos(th * D) ** 2, feedback: t`$\cos^2\theta$ uses the full angle. Spin-½ probabilities go with the half-angle, $\cos^2(\theta/2)$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans + 1),
          hints: [t`$P_+ = \cos^2(\theta/2)$ with $\theta = ${th}^\circ$.`, t`Multiply ${N} by $\cos^2 ${th / 2}^\circ$.`],
          teach: t`An atom prepared along one axis passes an analyser at angle $\theta$ with probability $\cos^2(\theta/2)$.`,
          explain: t`$N\cos^2(\theta/2) = ${N}\times\cos^2 ${th / 2}^\circ = ${fmt(ans, 4)}$. The rest, $${fmt(N - ans, 4)}$, leave the − port. At $\theta = 0$ all pass; at $90^\circ$ half; at $180^\circ$ none.`,
        };
      },
    }),
    mcq({
      id: 'z-x-z', difficulty: 2,
      prompt: t`Atoms leave the + port of a $z$ analyser, pass through the + port of an $x$ analyser, and enter a second $z$ analyser. What fraction of the atoms **entering that last analyser** leave its − port?`,
      visual: sgPic([{ axis: 'z', pass: '+' }, { axis: 'x', pass: '+' }, { axis: 'z' }], { caption: 'z, then x, then z. Schematic.' }),
      choices: [t`$\tfrac12$`, '0', t`$\tfrac14$`, '1'],
      answer: 0,
      why: {
        1: t`Zero would mean the atoms remembered being $+z$. The $x$ measurement left them $+x$, and a $+x$ atom has no definite $z$ value.`,
        2: t`$\tfrac14$ is the fraction of the atoms that left the *first* analyser: $\tfrac12$ pass $x$, then $\tfrac12$ of those go −. The question asks about atoms entering the last one.`,
        3: t`The last analyser splits a $+x$ beam evenly; nothing sends every atom one way.`,
      },
      hints: ['What state are the atoms in when they leave the x analyser?', t`A $+x$ atom meets a $z$ analyser at $90^\circ$ to $x$: $\cos^2 45^\circ$.`],
      teach: 'A measurement along x replaces whatever the atom carried about z: the atom leaves in the state the analyser picked out.',
      explain: t`Leaving the $x$ analyser’s + port, each atom is $+x$. A $z$ analyser is $90^\circ$ from $x$, so half go + and half go −. **The $x$ measurement erased the earlier $z$ result.**`,
    }),
    num({
      id: 'chain-fraction', difficulty: 3,
      gen(r) {
        const c = r.pick(CHAINS), A = c.slice(0, 3), want = c[3];
        const e = exact('oven', A), ans = want === '+' ? e.plus : e.minus;
        const inLast = e.into[2];
        return {
          prompt: t`Atoms from an oven pass a ${axTeX(A[0])} analyser’s **${portTeX(A[0].pass)}** beam, then a ${axTeX(A[1])} analyser’s **${portTeX(A[1].pass)}** beam, and enter a ${axTeX(A[2])} analyser. What fraction of **all the atoms leaving the oven** reach its **${portTeX(want)}** counter? (Analysers at $\hat n$ lie in the xz-plane, at $\theta$ from $+z$.)`,
          visual: sgPic(A, { caption: 'The chain in the question. Schematic.' }),
          answer: ans, tol: { rel: 0.01, abs: 1e-4 },
          errors: [
            { value: ans / inLast, feedback: 'That is the fraction of the atoms that reach the last analyser. The question counts every atom that left the oven, including those stopped earlier.' },
            { value: 2 * ans, feedback: 'You started with every oven atom in the first analyser’s chosen beam. An oven beam is unpolarized: only half pass the first analyser.' },
          ].filter((er) => Math.abs(er.value - ans) > 0.02 * ans),
          hints: ['Work beam by beam: the oven gives ½ into the first chosen beam.', t`Each later step multiplies by $\cos^2(\theta/2)$ or $\sin^2(\theta/2)$, where $\theta$ is the angle between the axis that prepared the atom and the one measuring it. For a − beam the prepared direction is reversed.`, 'Angles: z to x, z to y and x to y are all 90°; a −z atom is prepared along the direction 180° from +z.'],
          teach: 'Through a chain of analysers, multiply the probabilities step by step: each analyser resets the state to the beam it passes.',
          explain: t`The fractions multiply: $\tfrac12$ from the oven, then $${fmt(e.into[2] * 2, 3)}$ through the second analyser, then $${fmt(ans / inLast, 3)}$ at the last one, for $${fmt(ans, 3)}$ of all the atoms.`,
        };
      },
    }),
    mcq({
      id: 'both-beams', difficulty: 3,
      prompt: t`Atoms in the $+z$ state enter an $x$ analyser that passes **both** its beams on, recombined, with nothing recording which beam each atom took. A $z$ analyser follows. What fraction leave its − port?`,
      visual: sgPic([{ axis: 'x', pass: 'both' }, { axis: 'z' }], { source: 'z+', caption: 'Atoms prepared +z, an x analyser passing both beams, then z. Schematic.' }),
      choices: ['0', t`$\tfrac12$`, t`$\tfrac14$`, '1'],
      answer: 0,
      why: {
        1: t`That is what happens when one $x$ beam is chosen, which measures $S_x$. Passing both unobserved measures nothing.`,
        2: t`$\tfrac14$ would follow from splitting twice and stopping half each time; here nothing is stopped.`,
        3: t`All the atoms come out on one side, but it is the + side: they are still $+z$.`,
      },
      hints: [t`Ask whether anything in the apparatus records the value of $S_x$.`, 'If nothing does, the atom leaves the x analyser in the state it entered.'],
      teach: 'Splitting a beam and recombining it unobserved is not a measurement: the state comes out as it went in.',
      explain: t`None. With no record of the path, the $x$ analyser measures nothing and the atoms leave as $+z$, so every one comes out of the $z$ analyser +. A picture in which each atom secretly *took* one $x$ beam would predict $\tfrac12$. In the next lesson the explanation appears: the two paths’ **amplitudes** add before anything is squared.`,
    }),
    {
      type: 'slider', id: 'set-angle', difficulty: 2,
      prompt: t`Atoms leave the + port of a $z$ analyser and enter analyser 2, whose axis $\hat n$ lies in the xz-plane. Set its angle $\theta$ from $+z$ so that, on average, **one atom in four** reaching it leaves its + port.`,
      visual: { type: 'qm4-sg', params: { source: 'oven', analysers: [{ axis: 'z', pass: '+' }, { axis: 'n', theta: 90 }], controls: ['t2'], exact: false, counts: false, N: 0, send: [], bars: false, readout: false }, caption: 'Drag the slider to turn analyser 2. Schematic; no counts are shown.' },
      param: 't2', answer: [118, 122],
      instruction: 'Set analyser 2’s angle, then check.',
      hints: [t`You need $\cos^2(\theta/2) = \tfrac14$.`, t`So $\cos(\theta/2) = \tfrac12$, which means $\theta/2 = 60^\circ$.`],
      teach: t`Invert the rule: $\cos^2(\theta/2) = P_+$ gives $\theta = 2\arccos\sqrt{P_+}$.`,
      explain: t`$\cos^2(\theta/2) = \tfrac14$ gives $\cos(\theta/2) = \tfrac12$, so $\theta/2 = 60^\circ$ and $\theta = 120^\circ$. Turned past $90^\circ$, the analyser points closer to $-z$ than to $+z$, so most atoms leave by its − port.`,
    },
    num({
      id: 'hydrogen-force', difficulty: 2,
      gen(r) {
        const G = r.pick([300, 500, 800, 1000, 1500]);
        const mu = (GE / 2) * MU_B, a = (mu * G) / M_H, ans = a / G0;
        return {
          prompt: t`In 1927 Phipps and Taylor repeated the experiment with hydrogen atoms, whose moment is the electron spin’s, $\mu_z = \pm\tfrac{g}{2}\mu_B$ with $g = ${fmt(GE, 6)}$ and $\mu_B = ${tex(MU_B, 5)}$ J/T. In a gradient $\partial B_z/\partial z = ${G}$ T/m, how large is a hydrogen atom’s acceleration ($m = ${tex(M_H, 5)}$ kg), as a multiple of $g_0 = 9.807\ \text{m/s}^2$?`,
          visual: gradientPic,
          answer: ans, tol: { rel: 0.01 },
          hints: [t`$F = \mu_z\,\partial B_z/\partial z$, then $a = F/m$.`, t`Divide $a$ by $9.807\ \text{m/s}^2$.`],
          teach: t`The Stern–Gerlach force is the moment’s component times the field gradient; for an atom it is tiny, but so is the mass.`,
          explain: t`$F = ${fmt(GE / 2, 5)}\times${tex(MU_B, 4)}\times${G} = ${tex(mu * G, 3)}$ N, so $a = F/m = ${tex(a, 3)}\ \text{m/s}^2$, about $${tex(ans, 3)}\,g_0$. Even so, at a few kilometres per second the atoms cross the magnet in microseconds, and the two beams part by only a fraction of a millimetre.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-two-tilted', difficulty: 2,
      gen(r) {
        const t1 = r.pick([0, 30, 60, 90]), dt = r.pick([30, 60, 90, 120]), t2 = t1 + dt;
        const A = [{ axis: 'n', theta: t1, pass: '+' }, { axis: 'n', theta: t2 }];
        const ans = exact('oven', A).plus;
        return {
          prompt: t`Atoms from an oven pass the + beam of an analyser at $\theta_1 = ${t1}^\circ$ from $+z$, then enter a second analyser at $\theta_2 = ${t2}^\circ$ (both axes in the xz-plane). What fraction of **all the atoms leaving the oven** reach the second analyser’s + counter?`,
          visual: sgPic(A, { caption: 'Two tilted analysers. Schematic.' }),
          answer: ans, tol: { rel: 0.01, abs: 1e-4 },
          errors: [
            { value: 2 * ans, feedback: 'That is the fraction of the atoms reaching the second analyser. Only half the oven’s atoms pass the first one.' },
            { value: 0.5 * Math.cos(dt * D) ** 2, feedback: t`Use the half-angle: $\cos^2(\Delta\theta/2)$, not $\cos^2\Delta\theta$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: ['Only the angle between the two axes matters.', t`$\tfrac12\cos^2\!\big((\theta_2 - \theta_1)/2\big)$.`],
          teach: 'Only the angle between the preparing and measuring axes enters the probability.',
          explain: t`$\tfrac12\cos^2(${dt}^\circ/2) = ${fmt(ans, 3)}$. Rotating both analysers together changes nothing: only their relative angle, $${dt}^\circ$, counts.`,
        };
      },
    }),
    mcq({
      id: 'cp-sorting', difficulty: 3,
      prompt: t`Which account fits **all** the chained-analyser results: $z$+ then $z$ gives all +; $z$+ then $x$+ then $z$ gives half −; and $z$+ then $x$ (both beams, unobserved) then $z$ gives all +?`,
      visual: sgPic([{ axis: 'z', pass: '+' }, { axis: 'x', pass: 'both' }, { axis: 'z' }], { caption: 'The third experiment: x splits and recombines the beam, with nothing recording the path. Schematic.' }),
      choices: [
        t`An atom leaving the $z$+ port has no definite $S_x$; measuring $S_x$ gives ± at random and leaves it with no definite $S_z$`,
        t`Each atom carries definite values of $S_x$ and $S_z$ all along; an analyser only sorts atoms by them`,
        t`The $x$ magnet’s field jostles the spins, flipping half of them at random`,
        t`The atoms’ spins slowly drift between analysers, losing their $z$ alignment`,
      ],
      answer: 0,
      why: {
        1: t`Then the second experiment’s atoms would all still carry $S_z = +\hbar/2$ and none would come out −.`,
        2: t`The same magnet passing both beams leaves every atom $+z$, so the magnet itself does not scramble spins. The difference is whether $S_x$ is recorded.`,
        3: t`In the first experiment two $z$ analysers in a row agree perfectly; the spins do not drift.`,
      },
      hints: ['Test each account against all three experiments, not just one.', 'In the third experiment the x magnet is still there; only the record of which beam is gone.'],
      teach: 'A component of spin has a definite value only in a state prepared for it, and measuring a different component resets the state.',
      explain: t`Only the first account survives all three. Sorting atoms by pre-existing values fails the second experiment; a disturbing magnet fails the third, where the same magnet, unobserved, disturbs nothing.`,
    }),
    num({
      id: 'cp-caesium', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([45, 60, 90, 120, 135, 150]);
        const ans = sin2(th);
        return {
          prompt: t`A caesium-beam clock — the kind that keeps time in national laboratories and has flown on GPS satellites — is a chain of state analysers. A magnet passes only atoms in the lower clock level into a microwave cavity, tuned near $${fmt(CS_HFS / 1e9, 10)}$ GHz. The two clock levels behave like spin up and down, and the microwaves turn each atom’s state through an angle $\Theta$, just as tilting a second analyser by $\Theta$ would. A second magnet steers atoms found in the **upper** level to the detector. For a pulse with $\Theta = ${th}^\circ$, what fraction of the atoms entering the cavity are detected?`,
          visual: sgPic([{ axis: 'n', theta: th }], { source: 'z+', caption: t`The equivalent analyser chain: atoms prepared in the lower level (+z here) meet an “analyser” turned by Θ = ${th}°; the detector counts the − port. The angle is a rotation in the two-level state space, not of the atoms in space.` }),
          answer: ans, tol: { rel: 0.01, abs: 1e-3 },
          errors: [{ value: cos2(th), feedback: t`That is the fraction left in the lower level. The detector counts atoms that changed level: $\sin^2(\Theta/2)$.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: ['Detected atoms are those that changed level: the − port of the equivalent analyser.', t`$P = \sin^2(\Theta/2)$.`],
          teach: t`A two-level atom prepared in one state and turned by $\Theta$ is found in the other with probability $\sin^2(\Theta/2)$.`,
          explain: t`$\sin^2(${th}^\circ/2) = ${fmt(ans, 3)}$. A clock uses $\Theta = 180^\circ$ at exact resonance, sending every atom to the detector; the electronics hold the microwave frequency where the detected current peaks, and that frequency, $9\,192\,631\,770$ Hz, defines the second. (The two levels, F = 3 and F = 4, come from the outer electron’s spin ½ combining with the nucleus’s spin 7/2.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'McIntyre, Quantum Mechanics: A Paradigms Approach, ch. 1', url: 'https://www.cambridge.org/9781009310611' },
    { label: 'Gerlach & Stern, Z. Phys. 9, 349 (1922)', url: 'https://doi.org/10.1007/BF01326983' },
    { label: 'Friedrich & Herschbach, “Stern and Gerlach: how a bad cigar helped reorient atomic physics”, Physics Today 56(12), 53 (2003)', url: 'https://doi.org/10.1063/1.1650229' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
