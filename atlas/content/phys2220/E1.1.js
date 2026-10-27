// Charge and its conservation: two kinds of charge, carried by protons and
// electrons; charge comes in whole multiples of e; and the total charge of an
// isolated system never changes — charging moves charge, it never makes it.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, s3, r6, QE, ME, spheres, rubbed } from './_charges.js';

const t = String.raw;
const sgn = (x) => (x > 0 ? '+' : x < 0 ? '-' : '');

export default lesson({
  id: 'phys2220.E1.1',
  title: 'Charge and its conservation',
  minutes: 10, difficulty: 1,
  intro: t`**Electric charge** is a property of matter that comes in two kinds, called **positive** and **negative**: like charges repel, unlike charges attract. Ordinary matter is built of positive protons, negative electrons and neutral neutrons, with as many electrons as protons — so it is **neutral**: not empty of charge, but exactly balanced. Charge comes only in whole-number multiples of the **elementary charge** $e$:

$$q = ne, \qquad n = 0, \pm1, \pm2, \ldots, \qquad e = 1.602\times10^{-19}\ \text{C}$$

And charge is **conserved**: the total charge of an isolated system never changes. Rubbing a balloon on your hair does not make charge; it moves electrons from your hair to the balloon, leaving the hair as positive as the balloon is negative.`,
  symbols: [
    { tex: 'q', text: 'the net charge of an object, in coulombs (C). A coulomb is a lot: everyday static charges are nanocoulombs (nC, $10^{-9}$ C) to microcoulombs (µC, $10^{-6}$ C)' },
    { tex: 'n', text: 'a whole number: the excess of protons over electrons. Negative $n$ means extra electrons' },
    { tex: 'e', text: 'the elementary charge, $1.602\\,176\\,634\\times10^{-19}$ C exactly (it defines the coulomb). A proton carries $+e$, an electron $-e$' },
  ],
  why: 'Charge conservation is among the most exactly tested laws in physics: it becomes Kirchhoff’s junction rule in circuits, and every particle reaction ever seen obeys it.',
  visual: {
    type: 'em-induction',
    title: 'Charge moves; the total stays',
    lead: t`Three identical metal spheres on insulating stands. Touch any two together: charge flows between them until they share it equally. Watch the total — and the number of electrons each has gained or lost.`,
    tasks: [
      'Touch A and B: A’s +8 nC is shared, +4 nC each, and the total stays +6 nC.',
      'Now touch B and C: +4 nC and −2 nC make +2 nC, shared as +1 nC each. Charges of opposite sign cancel, but the total never changes.',
      'Read the electrons: +1 nC means about 6.2 billion electrons have gone. Charge comes in whole electrons — so many that it seems smooth.',
    ],
    params: { scene: 'share', q: [8, 0, -2] },
  },
  example: {
    prompt: t`Rubbed on dry hair, a balloon picks up a charge of $-25$ nC. (a) How many electrons has it gained? (b) What is the charge on the hair? (c) How much mass did the balloon gain? ($e = 1.602\times10^{-19}$ C, $m_e = 9.109\times10^{-31}$ kg)`,
    visual: rubbed({ caption: 'Electrons move from the hair to the balloon. Only the net charge is marked: each object still contains enormous, nearly equal numbers of + and − charges. Not to scale.' }),
    steps: [
      { label: 'Count the electrons', text: t`$n = |q|/e = (25\times10^{-9}\ \text{C})/(1.602\times10^{-19}\ \text{C}) = 1.56\times10^{11}$ electrons.` },
      { label: 'Conservation', text: t`Hair and balloon together were neutral, and charge is conserved, so the hair is now $+25$ nC: it has lost exactly the electrons the balloon gained.` },
      { label: 'Mass', text: t`$\Delta m = n\,m_e = (1.56\times10^{11})(9.109\times10^{-31}\ \text{kg}) = 1.4\times10^{-19}$ kg — utterly unmeasurable.` },
      { label: 'Sense check', text: t`A 5 g rubber balloon contains about $1.7\times10^{24}$ electrons, so it has gained about one extra electron for every ten trillion it already had. Static electricity is a tiny imbalance between enormous amounts of charge.` },
    ],
    answer: t`(a) $1.56\times10^{11}$ electrons; (b) $+25$ nC; (c) $1.4\times10^{-19}$ kg.`,
  },
  practice: [
    num({
      id: 'count', difficulty: 1,
      gen(r) {
        const m = r.pick([2, 3.5, 8, 15, 40]), u = r.pick(['nC', 'µC']);
        const q = m * (u === 'nC' ? 1e-9 : 1e-6), n = q / QE;
        return {
          prompt: t`A plastic comb carries a charge of $-${m}$ ${u}. How many extra electrons does it carry?`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: q * QE, feedback: t`Divide the charge by $e$, don’t multiply: $n = |q|/e$.` }, { value: n * (u === 'nC' ? 1e3 : 1e-3), feedback: `Check the prefix: 1 ${u} = 10${u === 'nC' ? '⁻⁹' : '⁻⁶'} C.` }],
          hints: [t`$n = |q|/e$ with $e = 1.602\times10^{-19}$ C.`, `Convert to coulombs first: 1 ${u} = 10${u === 'nC' ? '⁻⁹' : '⁻⁶'} C.`],
          teach: 'A charge q is |q|/e elementary charges: billions of electrons even for a tiny static charge.',
          explain: t`$n = ${m}\times10^{${u === 'nC' ? -9 : -6}}\ \text{C}/1.602\times10^{-19}\ \text{C} = ${tn(n)}$ electrons.`,
          visual: spheres([-Math.min(16, m), 0], 'The comb’s charge sits on it as extra electrons (drawn here as a charged sphere beside a neutral one: one mark per nanocoulomb, at most 16).', { labels: ['comb', 'neutral'] }),
        };
      },
    }),
    num({
      id: 'charge-from-n', difficulty: 1,
      gen(r) {
        const m = r.pick([2.5, 4, 6.5]), ex = r.pick([9, 10, 11]), lost = r.bool(0.5);
        const n = m * 10 ** ex, q = (lost ? 1 : -1) * n * QE;
        return {
          prompt: t`Rubbed with ${lost ? 'silk, a glass rod **loses**' : 'fur, an amber rod **gains**'} $${m}\times10^{${ex}}$ electrons. What is its charge, in nC? (Give the sign.)`,
          answer: q * 1e9, units: 'nC', tol: { rel: 0.01 },
          errors: [{ value: -q * 1e9, feedback: lost ? 'Losing electrons (which are negative) leaves the rod positive.' : 'Gaining electrons makes the rod negative.' }],
          hints: [t`$q = ne$; each electron carries $-e$.`, lost ? 'Losing negative charge leaves a positive charge behind.' : 'Gaining electrons adds negative charge.'],
          teach: 'Losing electrons leaves an object positive; gaining them makes it negative.',
          explain: t`$|q| = ${m}\times10^{${ex}} \times 1.602\times10^{-19}\ \text{C} = ${tn(Math.abs(q))}$ C $= ${tn(Math.abs(q) * 1e9)}$ nC, ${lost ? 'positive, since electrons left' : 'negative, since electrons arrived'}: $q = ${sgn(q)}${tn(Math.abs(q) * 1e9)}$ nC.`,
          visual: rubbed(lost ? { left: { name: 'silk', sign: -1, n: 5 }, right: { name: 'glass rod', sign: 1, n: 5 } } : { left: { name: 'fur', sign: 1, n: 5 }, right: { name: 'amber rod', sign: -1, n: 5 } }),
        };
      },
    }),
    mcq({
      id: 'used-up', difficulty: 1,
      prompt: 'A rubbed balloon sticks to a wall for an hour, then falls off. What has happened to its charge?',
      choices: ['Its extra electrons have slowly leaked away to the air and the wall: the charge has spread out, not disappeared', 'It was used up in holding the balloon against the wall', 'It turned into heat, like friction', 'It decayed away by itself, the way radioactivity does'],
      answer: 0,
      why: {
        1: 'Holding something still takes no energy and uses up nothing. A charge can sit on a balloon indefinitely in perfectly dry air.',
        2: 'Charge is not energy, and it cannot turn into heat. The electrons themselves must go somewhere.',
        3: 'Charge never decays: an electron’s charge is the same forever. It only moves.',
      },
      hints: ['Charge is conserved. If the balloon has less, where must the rest be?'],
      teach: 'Charge is never used up: it can only move from one place to another.',
      explain: t`The balloon’s extra electrons drift off, helped by water molecules in the air and by the slightly conducting wall, until the balloon is nearly neutral. The total charge of balloon, air and wall is unchanged. (This is why static tricks work best on dry winter days.)`,
      visual: rubbed({ left: { name: 'wall', sign: 1, n: 0 }, right: { name: 'balloon', sign: -1, n: 4 }, arrow: false, caption: 'The charged balloon against the wall. Not to scale.' }),
    }),
    num({
      id: 'share-two', difficulty: 2,
      gen(r) {
        const qa = r.pick([9, 12, -6, 15]), qb = r.pick([-3, 5, -11, 2]);
        const q = (qa + qb) / 2;
        return {
          prompt: t`Identical metal spheres A and B carry ${qa > 0 ? '+' : '−'}${Math.abs(qa)} nC and ${qb > 0 ? '+' : '−'}${Math.abs(qb)} nC. They are touched together and separated. What is the charge on A now, in nC?`,
          answer: q, units: 'nC', tol: { rel: 0.005, abs: 0.01 },
          errors: [{ value: (Math.abs(qa) + Math.abs(qb)) / 2, feedback: 'Charges of opposite sign cancel: add them with their signs before sharing.' }, { value: qa + qb, feedback: 'The total is shared between two identical spheres: each gets half.' }].filter((e) => Math.abs(e.value - q) > 0.05),
          hints: ['Find the total charge, with signs.', 'Identical spheres share the total equally.'],
          teach: 'Touching identical conductors share their total charge equally; the total is conserved.',
          explain: t`Total: $(${qa}) + (${qb}) = ${qa + qb}$ nC. Shared equally: $${q}$ nC each — the same total, $${qa + qb}$ nC, as before.`,
          visual: spheres([Math.max(-16, Math.min(16, qa)), Math.max(-16, Math.min(16, qb))], 'The two spheres before they touch (one mark per nanocoulomb).', { ask: true }),
        };
      },
    }),
    num({
      id: 'share-sequence', difficulty: 3,
      gen(r) {
        const Q = r.pick([8, 12, 16, -16]);
        return {
          prompt: t`Metal sphere A carries ${Q > 0 ? '+' : '−'}${Math.abs(Q)} nC; identical spheres B and C are neutral. A touches B, then (after they separate) A touches C. What is A’s charge at the end, in nC?`,
          answer: Q / 4, units: 'nC', tol: { rel: 0.005 },
          errors: [{ value: Q / 3, feedback: 'The three never touch all at once: A shares with B first, then shares what it has left with C.' }, { value: Q / 2, feedback: 'After touching B, A has half; touching C halves it again.' }],
          hints: ['Do it one touch at a time.', t`After A–B, A has $Q/2$. Then A–C shares that.`],
          teach: 'Each touch between identical conductors halves the difference: shared charge is conserved step by step.',
          explain: t`After A–B: A and B have $${Q / 2}$ nC each. After A–C: A and C share $${Q / 2}$ nC, so A has $${Q / 4}$ nC. Check the total: $${Q / 4} + ${Q / 2} + ${Q / 4} = ${Q}$ nC. ✓`,
          visual: spheres([Q, 0, 0], 'Sphere A charged, B and C neutral, before any touching (one mark per nanocoulomb).', { ask: true }),
        };
      },
    }),
    mcq({
      id: 'possible', difficulty: 2,
      prompt: t`Which of these could be the net charge of an oil droplet? ($e = 1.602\times10^{-19}$ C)`,
      choices: [t`$-4.8\times10^{-19}$ C`, t`$-2.4\times10^{-19}$ C`, t`$+1.0\times10^{-19}$ C`, t`$+8.0\times10^{-20}$ C`],
      answer: 0,
      why: {
        1: t`That is $1.5e$: a droplet cannot hold half an electron’s charge.`,
        2: t`That is less than one elementary charge ($0.62e$).`,
        3: t`That is $e/2$. Free particles never carry less than $e$.`,
      },
      hints: ['Divide each by e = 1.602 × 10⁻¹⁹ C. Which gives a whole number?'],
      teach: 'Any free object’s charge is a whole-number multiple of e.',
      explain: t`$4.8\times10^{-19}/1.602\times10^{-19} = 3.0$: three extra electrons. Millikan’s oil-drop experiment (1909–1913) found exactly this — every droplet’s charge a whole multiple of $e$. Quarks carry $\pm e/3$ and $\pm 2e/3$, but they are always bound in groups whose total is a whole multiple of $e$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-3.5, 3.5], y: [-0.6, 0.9], yticks: 0.001, xlabel: 'charge (units of e)', ylabel: '', curves: [], points: [-3, -2, -1, 0, 1, 2, 3].map((n) => ({ x: n, y: 0, color: n === 0 ? 'ink3' : n > 0 ? 'bad' : 'accent', r: 6 })) }, caption: 'The only charges a free object can carry: whole multiples of e (a few marked).' },
    }),
    mcq({
      id: 'reactions', difficulty: 2,
      prompt: 'Which of these particle reactions can never happen, because it would change the total charge?',
      choices: [t`$p \to n + e^- + \bar\nu$`, t`$n \to p + e^- + \bar\nu$`, t`$\gamma \to e^- + e^+$ (near a nucleus)`, t`$p + e^- \to n + \nu$`],
      answer: 0,
      why: {
        1: t`Neutron decay: $0 \to (+1) + (-1) + 0 = 0$. Charge balances; free neutrons decay this way in about 15 minutes.`,
        2: t`Pair creation: $0 \to (-1) + (+1) = 0$. A gamma ray near a nucleus can make an electron and a positron.`,
        3: t`Electron capture: $(+1) + (-1) \to 0 + 0$. Charge balances; some nuclei decay this way.`,
      },
      hints: ['Add up the charges on each side: p is +1, n is 0, e⁻ is −1, e⁺ is +1, γ and ν are 0.'],
      teach: 'In every reaction, the total charge before equals the total charge after.',
      explain: t`$p \to n + e^- + \bar\nu$ would turn $+1$ into $0 - 1 + 0 = -1$. It never happens. (A proton inside some nuclei *can* change into a neutron — but by emitting a positive positron, $p \to n + e^+ + \nu$, which keeps the total at $+1$.)`,
    }),
    num({
      id: 'mass-gain', difficulty: 2,
      gen(r) {
        const m = r.pick([1.5, 3, 7.5]);
        const dm = ((m * 1e-6) / QE) * ME;
        return {
          prompt: t`A metal sphere is charged to $-${m}$ µC by adding electrons. By how much does its mass increase? ($e = 1.602\times10^{-19}$ C, $m_e = 9.109\times10^{-31}$ kg)`,
          answer: dm, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: ((m * 1e-6) / QE) * 1.673e-27, feedback: 'The charge was added as electrons, not protons: use the electron’s mass.' }],
          hints: ['Count the electrons first: n = |q|/e.', t`Then $\Delta m = n\,m_e$.`],
          teach: 'Charging transfers electrons, so it changes an object’s mass — by an immeasurably small amount.',
          explain: t`$n = ${m}\times10^{-6}/1.602\times10^{-19} = ${tn((m * 1e-6) / QE)}$ electrons, with mass $${tn(dm)}$ kg — far too little to weigh.`,
          visual: spheres([-Math.min(16, m * 2), 0], 'A sphere charged negative by adding electrons, beside a neutral one (marks show the sign, not the number).', { ask: true }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const m = r.pick([5, 12, 30]);
        const n = (m * 1e-9) / QE;
        return {
          prompt: t`A dust grain has a charge of $+${m}$ nC. How many electrons is it missing?`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: m / QE, feedback: 'Convert nanocoulombs to coulombs first.' }],
          hints: [t`$n = |q|/e$.`],
          teach: 'A positive charge means missing electrons: n = q/e of them.',
          explain: t`$n = ${m}\times10^{-9}/1.602\times10^{-19} = ${tn(n)}$ electrons missing.`,
          visual: spheres([m > 16 ? 16 : m, 0], 'The charged grain (drawn as a sphere, at most 16 marks) beside a neutral one.', { labels: ['grain', 'neutral'], ask: true }),
        };
      },
    }),
    num({
      id: 'cp-spacecraft', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([1.5, 2.5, 4]);
        const n = (m * 1e-6) / QE;
        return {
          prompt: t`During a geomagnetic storm, a satellite in geostationary orbit, passing through Earth’s shadow, collects a net $-${m}$ µC from the hot surrounding plasma. How many electrons is that? And what happened to the charge of the plasma around it?`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: n * 1e3, feedback: 'Check the prefix: 1 µC = 10⁻⁶ C.' }],
          hints: [t`$n = |q|/e$, with $q$ in coulombs.`],
          teach: 'Charge collected by a spacecraft is charge removed from its surroundings: the total is conserved.',
          explain: t`$n = ${m}\times10^{-6}/1.602\times10^{-19} = ${tn(n)}$ electrons; the plasma nearby is left $${m}$ µC more positive. A few microcoulombs can raise a satellite to thousands of volts, and sudden discharges between unevenly charged surfaces have damaged spacecraft electronics — so engineers make outer surfaces conductive and bond them all together.`,
          visual: rubbed({ left: { name: 'plasma', sign: 1, n: 5 }, right: { name: 'satellite', sign: -1, n: 6 }, caption: 'Electrons gathered from the plasma onto the satellite. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-what-moves', difficulty: 2,
      prompt: 'A positively charged metal sphere touches an identical neutral metal sphere, and they share the charge. What actually moves?',
      choices: ['Electrons, from the neutral sphere into the charged one', 'Protons, from the charged sphere into the neutral one', 'Positive particles, carrying the charge from the charged sphere to the neutral one', 'Nothing moves: the charge jumps across by induction'],
      answer: 0,
      why: {
        1: 'Protons are locked in the nuclei of the metal’s atoms: they do not move through a solid.',
        2: 'We often say “positive charge flows”, but in a metal the only mobile charges are electrons.',
        3: 'Induction can separate charge without contact, but sharing on contact happens because charge actually flows.',
      },
      hints: ['In a metal, which charged particles are free to move?'],
      teach: 'In metals only electrons move: a positive object gains charge balance by drawing electrons in.',
      explain: t`The positive sphere is short of electrons; when they touch, electrons flow from the neutral sphere into it until both are equally short. The neutral sphere ends up positive because it *lost* electrons — the effect is the same as positive charge flowing the other way.`,
      visual: spheres([8, 0], 'The charged sphere and the neutral one, about to touch (one mark per nanocoulomb).', { ask: true }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.1 Electric Charge', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-1-electric-charge' },
    { label: 'BIPM, The International System of Units (SI brochure, 9th ed.): the elementary charge is fixed exactly', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
});
