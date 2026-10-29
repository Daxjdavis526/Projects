// Entanglement and Bell's theorem (Griffiths & Schroeter §12.1–12.2;
// Nielsen & Chuang §2.6). Entangled states do not factorize; the reduced
// state of one half (partial trace) is mixed — maximally so for a Bell
// state. The singlet's correlation E(a, b) = −â·b̂ = −cos θ; the CHSH
// combination S = E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′) obeys |S| ≤ 2 for any
// local hidden-variable theory and reaches 2√2 in quantum mechanics
// (Tsirelson's bound) at 0°, 90°, 45°, 135°; with visibility p (a Werner
// state) S = 2√2p, so a violation needs p > 1/√2. No signalling. Experiments:
// Freedman & Clauser 1972, Aspect et al. 1982, the 2015 loophole-free tests
// (Hensen et al., Delft, electron spins 1.3 km apart, S = 2.42 ± 0.20 over 245
// trials; Giustina et al., Vienna, and Shalm et al., NIST, with photons), the
// 2022 Nobel Prize (Aspect, Clauser, Zeilinger). Transfer: the Micius
// satellite's 1203 km Bell test (Yin et al. 2017, S = 2.37 ± 0.09). Coding:
// S computed from the singlet with NumPy.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, r6 } from './_q2b.js';

const t = String.raw;
const DEG = Math.PI / 180;
const Ecorr = (th) => { const v = -Math.cos(th * DEG); return Math.abs(v) < 1e-12 ? 0 : v; };
const chsh = (a, a2, b, b2, p = 1) => p * Math.abs(Ecorr(b - a) - Ecorr(b2 - a) + Ecorr(b - a2) + Ecorr(b2 - a2));
/** The singlet's correlation against analyser angle, with a local-model line and optional marked angles. */
const corrPic = (caption, { marks = [], p = 1, local = true } = {}) => ({
  type: 'graph',
  params: {
    x: [0, 180], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'angle between analysers θ (degrees)', ylabel: 'correlation E', axesAt: 'edge', xticks: 6, yticks: 4,
    curves: [
      { fn: `-${p}*cos(x*pi/180)`, color: 'accent', width: 2.6, label: p === 1 ? 'quantum: −cos θ' : `quantum, visibility ${p}`, labelAt: 120, labelDy: -12 },
      ...(local ? [{ fn: '-1 + 2*x/180', color: 'gold', width: 2, dash: [6, 4], label: 'a local model', labelAt: 22, labelDy: -14 }] : []),
    ],
    hlines: [{ y: 0, color: 'ink4' }],
    points: marks.map((m) => ({ x: m, y: r6(-p * Math.cos(m * DEG)), color: 'violet', r: 4.5 })),
  },
  caption,
});

export default lesson({
  id: 'phys4710.M8.2',
  title: 'Entanglement and Bell’s theorem',
  minutes: 20, difficulty: 4,
  intro: t`Two spins in the singlet state $\tfrac{1}{\sqrt2}(|{\uparrow\downarrow}\rangle - |{\downarrow\uparrow}\rangle)$ have no individual direction at all, yet measurements on them are perfectly anticorrelated along any common axis — however far apart they are. John Bell (1964) proved that **no theory of pre-existing local properties** can reproduce the quantum correlations. In the CHSH form:

$$\begin{gathered} S = E(a, b) - E(a, b') + E(a', b) + E(a', b') \\ |S|_{\text{local}} \le 2,\qquad |S|_{\text{quantum}} \le 2\sqrt2 \end{gathered}$$

Experiments find $S > 2$. Since 2015 they have done so with every major loophole closed at once.`,
  symbols: [
    { tex: 'E(a, b)', text: t`the correlation: the average of the product of the two $\pm1$ outcomes when Alice measures along $a$ and Bob along $b$; for the singlet $E = -\hat a\cdot\hat b = -\cos\theta_{ab}$` },
    { tex: 'a,\\ a\'', text: 'Alice’s two analyser settings, chosen at random on each run' },
    { tex: 'b,\\ b\'', text: 'Bob’s two analyser settings' },
    { tex: 'S', text: 'the CHSH combination of four correlations (Clauser, Horne, Shimony and Holt, 1969)' },
    { tex: '2\\sqrt2', text: 'Tsirelson’s bound, the largest value quantum mechanics allows, about 2.83' },
  ],
  why: 'Bell’s theorem is the sharpest experimental statement about what the world is like, and entanglement is the resource behind quantum cryptography, teleportation and quantum computing.',
  visual: {
    type: 'graph',
    title: 'The CHSH game',
    lead: t`Alice and Bob each pick between two analyser angles. The blue curve is the singlet’s correlation $-\cos\theta$; the dashed line is what a simple local model gives. The violet dots are the four angle differences in play.`,
    tasks: [
      'With a = 0°, a′ = 90°, b = 45°, b′ = 135° the readout gives S = 2.83 = 2√2: the largest quantum value, well above the local limit 2.',
      'Lower the visibility p (noise mixed into the pair): S falls in proportion, and below p = 0.71 no angles can beat 2.',
      'Move b′ to 45° as well (Bob always measures the same way): two terms cancel and S falls to 1.41 — a Bell test needs both parties to switch settings.',
    ],
    params: {
      x: [0, 180], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'angle between analysers θ (degrees)', ylabel: 'correlation E', axesAt: 'edge', xticks: 6, yticks: 4,
      sliders: [
        { key: 'a', label: 'Alice’s $a$', min: 0, max: 180, step: 5, value: 0, unit: '^\\circ', explain: 'Alice’s first analyser angle.' },
        { key: 'a2', label: 'Alice’s $a\'$', min: 0, max: 180, step: 5, value: 90, unit: '^\\circ', explain: 'Alice’s second analyser angle.' },
        { key: 'b', label: 'Bob’s $b$', min: 0, max: 180, step: 5, value: 45, unit: '^\\circ', explain: 'Bob’s first analyser angle.' },
        { key: 'b2', label: 'Bob’s $b\'$', min: 0, max: 180, step: 5, value: 135, unit: '^\\circ', explain: 'Bob’s second analyser angle.' },
        { key: 'p', label: 'Visibility $p$', min: 0, max: 1, step: 0.01, value: 1, explain: 'The fraction of pairs that are true singlets; the rest are random noise (a Werner state).' },
      ],
      curves: [
        { fn: '-p*cos(x*pi/180)', color: 'accent', width: 2.6, label: 'quantum', labelAt: 150, labelDy: -12 },
        { fn: '-1 + 2*x/180', color: 'gold', width: 2, dash: [6, 4], label: 'a local model', labelAt: 22, labelDy: -14 },
      ],
      hlines: [{ y: 0, color: 'ink4' }],
      points: [
        { x: 'abs(b - a)', y: '-p*cos((b - a)*pi/180)', color: 'violet', r: 4.5 },
        { x: 'abs(b2 - a)', y: '-p*cos((b2 - a)*pi/180)', color: 'violet', r: 4.5 },
        { x: 'abs(b - a2)', y: '-p*cos((b - a2)*pi/180)', color: 'violet', r: 4.5 },
        { x: 'abs(b2 - a2)', y: '-p*cos((b2 - a2)*pi/180)', color: 'violet', r: 4.5 },
      ],
      readouts: [
        { label: '$|S|$', expr: 'p*abs(-cos((b - a)*pi/180) + cos((b2 - a)*pi/180) - cos((b - a2)*pi/180) - cos((b2 - a2)*pi/180))', digits: 3 },
        { label: 'local limit', expr: '2', digits: 2 },
      ],
    },
    caption: 'Ideal detectors. The dashed line is one local hidden-variable model (each pair carries a hidden direction); every local model obeys |S| ≤ 2, whatever its correlation curve.',
  },
  example: {
    prompt: t`For the singlet, show that $E(a, b) = -\hat a\cdot\hat b$, then evaluate $S$ for $a = 0^\circ$, $a' = 90^\circ$, $b = 45^\circ$, $b' = 135^\circ$ (all in one plane). Why can no local theory do this?`,
    visual: corrPic('The singlet correlation (blue) with the four angle differences used (violet): 45°, 135°, 45° and 45°.', { marks: [45, 135, 45, 45] }),
    steps: [
      { label: 'Rotational symmetry', text: t`The singlet has total spin 0, so it looks the same along every axis: choose $\hat a = \hat z$. Then Alice gets $+1$ or $-1$ with probability ½ each.` },
      { label: 'Conditional state', text: t`If Alice finds $+1$ along $z$, Bob’s spin is $|{\downarrow}\rangle$. Measuring along $\hat b$ at angle $\theta$, he gets $+1$ with probability $\sin^2(\theta/2)$ and $-1$ with $\cos^2(\theta/2)$.` },
      { label: 'Correlation', text: t`$E = \sin^2\frac\theta2 - \cos^2\frac\theta2 = -\cos\theta = -\hat a\cdot\hat b$. The same holds when Alice gets $-1$.` },
      { label: 'CHSH', text: t`$E(a,b) = -\cos45^\circ$, $E(a,b') = -\cos135^\circ = +\cos45^\circ$, $E(a',b) = -\cos45^\circ$, $E(a',b') = -\cos45^\circ$. So $S = -4\cos45^\circ = -2\sqrt2$, $|S| = ${fmt(2 * Math.SQRT2, 4)}$.` },
      { label: 'The local bound', text: t`If each pair carried pre-set answers $A, A' = \pm1$ and $B, B' = \pm1$, then $AB - AB' + A'B + A'B' = A(B - B') + A'(B + B')$. One bracket is 0 and the other $\pm2$, so every pair gives $\pm2$ and the average satisfies $|S| \le 2$.` },
      { label: 'Conclusion', text: t`Quantum mechanics predicts $2\sqrt2$, and experiment agrees. So outcomes cannot be pre-set values carried by the particles and fixed independently of the distant setting. What fails — locality, realism, or the freedom to choose settings — is a matter of interpretation; that *something* in the local-realist picture fails is an experimental fact.` },
    ],
    answer: t`$E(a,b) = -\cos\theta_{ab}$; these angles give $|S| = 2\sqrt2 = ${fmt(2 * Math.SQRT2, 4)}$, beyond the local bound of 2.`,
  },
  practice: [
    num({
      id: 'corr', difficulty: 1,
      gen(r) {
        const th = r.pick([30, 60, 75, 120, 150]);
        const ans = Ecorr(th);
        return {
          prompt: t`Alice and Bob measure the spins of a singlet pair along axes $${th}^\circ$ apart. What is the correlation $E$ of their $\pm1$ outcomes?`,
          visual: corrPic('The singlet correlation against the angle between the analysers (the angle asked for is not marked).', { local: false }),
          answer: ans, tol: { rel: 0.005, abs: 1e-4 },
          errors: [{ value: -ans, feedback: 'The singlet is anticorrelated: E = −cos θ, which is −1 for parallel analysers.' }, { value: -Math.cos(th * DEG / 2), feedback: 'Use the full angle between the axes, θ, not θ/2.' }],
          hints: [t`$E(\theta) = -\cos\theta$.`],
          teach: 'For the singlet the correlation is minus the cosine of the angle between the analysers.',
          explain: t`$E = -\cos ${th}^\circ = ${fmt(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'S', difficulty: 2,
      gen(r) {
        const [a, a2, b, b2] = r.pick([[0, 90, 45, 135], [0, 60, 30, 150], [0, 90, 30, 120], [0, 45, 22.5, 67.5], [0, 90, 60, 150]]);
        const ans = chsh(a, a2, b, b2);
        return {
          prompt: t`For the singlet, compute $|S| = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|$ with $a = ${a}^\circ$, $a' = ${a2}^\circ$, $b = ${b}^\circ$, $b' = ${b2}^\circ$. Does it violate the local bound?`,
          visual: corrPic('The singlet correlation and the four angle differences in this setting (violet).', { marks: [Math.abs(b - a), Math.abs(b2 - a), Math.abs(b - a2), Math.abs(b2 - a2)] }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(Ecorr(b - a) + Ecorr(b2 - a) + Ecorr(b - a2) + Ecorr(b2 - a2)), feedback: t`Mind the minus sign on $E(a, b')$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Each $E = -\cos(\text{difference of the angles})$.`, t`$E(a,b) = -\cos${Math.abs(b - a)}^\circ$, $E(a,b') = -\cos${Math.abs(b2 - a)}^\circ$, $E(a',b) = -\cos${Math.abs(b - a2)}^\circ$, $E(a',b') = -\cos${Math.abs(b2 - a2)}^\circ$.`],
          teach: 'CHSH violation needs well-chosen angles; the optimum has all three “near” pairs 45° apart (or 22.5° in photon-polarization angles).',
          explain: t`The four correlations are $${fmt(Ecorr(b - a), 3)}$, $${fmt(Ecorr(b2 - a), 3)}$, $${fmt(Ecorr(b - a2), 3)}$, $${fmt(Ecorr(b2 - a2), 3)}$, giving $|S| = ${fmt(ans, 4)}$ — ${ans > 2 + 1e-9 ? 'a violation of the local bound 2.' : 'no violation: these angles are not good enough.'}`,
        };
      },
    }),
    mcq({
      id: 'signal', difficulty: 2,
      prompt: t`Alice measures her half of a singlet a light-year away from Bob. Can she use her choice of analyser to send Bob a message instantly?`,
      visual: corrPic('Correlations only appear when Alice’s and Bob’s records are brought together and compared.', { local: false }),
      choices: [
        t`No: whatever Alice does, Bob’s own results are 50 : 50 in every direction (his reduced state is $\tfrac12\mathbb 1$); the correlations show up only when their records are compared`,
        'Yes: her measurement collapses his spin instantly, which he can detect',
        'Yes, but only if they share many pairs',
        'No, because entanglement does not survive over a light-year',
      ],
      answer: 0,
      why: {
        1: 'Bob cannot tell whether his spin has been “collapsed”: his statistics are the same either way.',
        2: 'Many pairs do not help: every one of Bob’s marginal distributions is 50 : 50.',
        3: 'Distance does not destroy entanglement in principle; experiments use kilometres and satellites.',
      },
      hints: [t`Bob’s statistics depend only on his reduced density matrix $\operatorname{Tr}_A\rho$.`],
      teach: 'Entanglement gives correlations, not communication: no-signalling holds in quantum mechanics.',
      explain: t`$\rho_B = \operatorname{Tr}_A|\psi\rangle\langle\psi| = \tfrac12\mathbb 1$, unchanged by anything done at A. The correlation is in the joint record, which must travel no faster than light to be compared.`,
    }),
    num({
      id: 'werner', difficulty: 2,
      gen(r) {
        const p = r.pick([0.6, 0.7, 0.75, 0.85, 0.95]);
        const ans = 2 * Math.SQRT2 * p;
        return {
          prompt: t`An entangled-photon source produces the ideal state only a fraction $p = ${p}$ of the time; otherwise its pairs are random noise. Correlations then shrink to $E = -p\cos\theta$. What is the best possible $|S|$?`,
          visual: corrPic(`The correlation with visibility p = ${p} (blue) and a local model (gold).`, { p }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * p, feedback: 'The ideal value is 2√2, not 2: scale 2√2 by p.' }],
          hints: [t`Every correlation is multiplied by $p$, so $S_{\max} = 2\sqrt2\,p$.`],
          teach: 'Noise scales the CHSH value: violation requires a visibility above 1/√2 ≈ 71%.',
          explain: t`$|S| = 2\sqrt2\times${p} = ${fmt(ans, 4)}$: ${ans > 2 ? 'still a violation.' : 'no violation — the noise hides the entanglement from this test.'}`,
        };
      },
    }),
    num({
      id: 'reduced', difficulty: 3,
      gen(r) {
        const al = r.pick([15, 25, 30, 45, 60]);
        const c2 = Math.cos(al * DEG) ** 2, s2 = Math.sin(al * DEG) ** 2, ans = c2 * c2 + s2 * s2;
        return {
          prompt: t`Two qubits share $|\psi\rangle = \cos\alpha\,|00\rangle + \sin\alpha\,|11\rangle$ with $\alpha = ${al}^\circ$. Trace out qubit B. What is the purity $\operatorname{Tr}\rho_A^2$ of qubit A’s reduced density matrix?`,
          visual: { type: 'graph', params: { x: [0, 90], y: [0.45, 1.05], aspect: 'wide', xlabel: 'α (degrees)', ylabel: 'purity of A', axesAt: 'edge', xticks: 6, curves: [{ fn: 'cos(x*pi/180)^4 + sin(x*pi/180)^4', color: 'accent', width: 2.4 }] }, caption: 'The purity of one qubit’s reduced state as the pair goes from a product state (α = 0) to a maximally entangled one (α = 45°) and back.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: 'The pair is in a pure state, but its parts are not, unless α is 0 or 90°.' }, { value: c2 * c2, feedback: t`$\rho_A = \operatorname{diag}(\cos^2\alpha, \sin^2\alpha)$; square and add both eigenvalues.` }].filter((e) => Math.abs(e.value - ans) > 0.006),
          hints: [t`$\rho_A = \operatorname{Tr}_B|\psi\rangle\langle\psi| = \cos^2\alpha\,|0\rangle\langle0| + \sin^2\alpha\,|1\rangle\langle1|$.`, t`$\operatorname{Tr}\rho_A^2 = \cos^4\alpha + \sin^4\alpha$.`],
          teach: 'The more entangled a pure pair, the more mixed each half: a maximally entangled qubit is completely random on its own.',
          explain: t`$\operatorname{Tr}\rho_A^2 = ${fmt(c2, 4)}^2 + ${fmt(s2, 4)}^2 = ${fmt(ans, 4)}$. At $\alpha = 45^\circ$ (a Bell state) it reaches ½, the purity of $\tfrac12\mathbb 1$: all the information is in the correlations, none in the parts.`,
        };
      },
    }),
    mcq({
      id: 'loopholes', difficulty: 3,
      prompt: t`Before 2015, every Bell test left at least one loophole open. Which pair of loopholes did the 2015 experiments close *simultaneously* for the first time?`,
      visual: corrPic('The quantum correlation these experiments tested, against a local model.', { marks: [45, 135] }),
      choices: [
        'The locality loophole (settings and outcomes at the two sites were space-like separated) and the detection loophole (enough pairs were detected that undetected ones could not fake the violation)',
        'The quantum and the classical loopholes',
        'The gravity loophole and the temperature loophole',
        'Only the freedom-of-choice loophole, by letting distant quasars choose the settings',
      ],
      answer: 0,
      why: {
        1: 'These are not loopholes in Bell tests; the loopholes are specific gaps between the experiment and the theorem’s assumptions.',
        2: 'Neither is a recognized loophole in Bell tests.',
        3: 'Cosmic (quasar-driven) setting choices came later (2017–2018) and address freedom of choice; the 2015 milestone was locality and detection together.',
      },
      hints: ['One loophole is about signals travelling between the stations; the other is about lost particles.', 'Photon experiments had long closed locality; ion and atom experiments had closed detection. 2015 did both at once.'],
      teach: 'A loophole-free Bell test needs space-like separation and high detection efficiency at once; Delft, Vienna and NIST achieved it in 2015.',
      explain: t`Hensen et al. (Delft) used electron spins in diamond 1.3 km apart, with heralded entanglement so every trial counted, and found $S = 2.42 \pm 0.20$ over 245 trials. Giustina et al. (Vienna) and Shalm et al. (NIST) did it with photons and high-efficiency detectors. The 2022 Nobel Prize went to Aspect, Clauser and Zeilinger for the experimental programme that led there.`,
    }),
    code({
      id: 'chsh-code', difficulty: 3,
      prompt: t`Compute the CHSH value of the singlet from scratch with NumPy. Build the state $\tfrac{1}{\sqrt2}(|01\rangle - |10\rangle)$ as a 4-vector, write \`A(theta)\` $= \cos\theta\,\sigma_z + \sin\theta\,\sigma_x$ (a spin measurement in the $xz$-plane), \`E(a, b)\` $= \langle\psi|A(a)\otimes A(b)|\psi\rangle$ (use \`np.kron\`), and \`S(a, a2, b, b2)\`. The program prints $S$ for the standard angles (in radians).`,
      starter: t`import numpy as np

sx = np.array([[0, 1], [1, 0]])
sz = np.array([[1, 0], [0, -1]])
psi = np.array([0, 1, -1, 0]) / np.sqrt(2)     # the singlet in the basis |00>, |01>, |10>, |11>

def A(theta):
    pass

def E(a, b):
    pass

def S(a, a2, b, b2):
    pass

d = np.pi / 180
print("E(0, 0) =", E(0, 0))
print("S =", S(0, 90 * d, 45 * d, 135 * d))
`,
      answer: t`import numpy as np

sx = np.array([[0, 1], [1, 0]])
sz = np.array([[1, 0], [0, -1]])
psi = np.array([0, 1, -1, 0]) / np.sqrt(2)     # the singlet in the basis |00>, |01>, |10>, |11>

def A(theta):
    return np.cos(theta) * sz + np.sin(theta) * sx

def E(a, b):
    return psi @ np.kron(A(a), A(b)) @ psi

def S(a, a2, b, b2):
    return E(a, b) - E(a, b2) + E(a2, b) + E(a2, b2)

d = np.pi / 180
print("E(0, 0) =", E(0, 0))
print("S =", S(0, 90 * d, 45 * d, 135 * d))
`,
      tests: [
        { name: 'parallel analysers are perfectly anticorrelated: E(0, 0) = −1', code: 'abs(E(0, 0) + 1) < 1e-12' },
        { name: t`$E(a, b) = -\cos(a - b)$ for any angles`, code: 'all(abs(E(a, b) + np.cos(a - b)) < 1e-12 for a in [0.1, 0.7, 2.0] for b in [0.3, 1.1, 2.9])' },
        { name: t`$|S| = 2\sqrt2$ at 0°, 90°, 45°, 135°`, code: 'abs(abs(S(0, np.pi/2, np.pi/4, 3*np.pi/4)) - 2*np.sqrt(2)) < 1e-12' },
        { name: 'no angles beat Tsirelson’s bound (random search)', code: 'all(abs(S(*q)) <= 2*np.sqrt(2) + 1e-9 for q in np.random.default_rng(2).uniform(0, np.pi, (500, 4)))' },
      ],
      hints: [t`\`A(theta)\` is \`np.cos(theta) * sz + np.sin(theta) * sx\`; \`E\` is \`psi @ np.kron(A(a), A(b)) @ psi\` (the state is real).`, t`\`S\` combines four calls to \`E\` with one minus sign: \`E(a, b) - E(a, b2) + E(a2, b) + E(a2, b2)\`.`],
      teach: 'The singlet’s correlations follow from the tensor product A ⊗ B; no choice of angles exceeds 2√2.',
      explain: t`$E(a, b) = -\cos(a - b)$ comes straight out of the matrices, and $|S| = 2.828$ at the standard angles. A random search over angles never exceeds $2\sqrt2$: Tsirelson’s bound.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-micius', difficulty: 3, transfer: true,
      gen(r) {
        const which = r.pick(['time', 'sigma']);
        const L = 1203e3, ans = which === 'time' ? (L / C) * 1e3 : (2.37 - 2) / 0.09;
        return {
          prompt: which === 'time'
            ? t`In 2017 the Chinese satellite Micius sent entangled photon pairs to two ground stations 1203 km apart (Yin et al.). For the measurement at one station to be unable to influence the other by any signal, each must be completed — setting chosen and result recorded — in less time than light takes to cross the gap. What is that time, in ms?`
            : t`In 2017 the Chinese satellite Micius sent entangled photon pairs to two ground stations 1203 km apart and measured $S = 2.37 \pm 0.09$ (Yin et al.). By how many standard errors does that exceed the local bound of 2?`,
          visual: corrPic('The correlation curve the stations sampled, against a local model.', { marks: [45, 135] }),
          answer: ans, units: which === 'time' ? 'ms' : '', tol: { rel: 0.01 },
          errors: which === 'time' ? [{ value: ans * 1000, feedback: 'Convert seconds to milliseconds correctly: 1 ms = 10⁻³ s.' }] : [{ value: (2 * Math.SQRT2 - 2.37) / 0.09, feedback: 'Compare with the local bound, 2, not the quantum maximum.' }],
          hints: which === 'time' ? [t`Any signal is limited by the speed of light.`, t`$t = L/c$ with $L = 1.203\times10^6$ m.`] : [t`A violation is measured against the local bound, $S = 2$.`, t`(measured $S$ − 2) ÷ (its uncertainty).`],
          teach: 'Satellite Bell tests stretch the space-like separation to a thousand kilometres; the correlations survive.',
          explain: which === 'time' ? t`$t = 1.203\times10^6/${tex(C, 6)} = ${fmt(ans, 4)}$ ms — milliseconds instead of the microseconds available in a laboratory.` : t`$(2.37 - 2)/0.09 = ${fmt(ans, 3)}$ standard errors: a clear violation over a distance no laboratory can reach. (Low collection efficiency left the detection loophole open, as in most photon experiments.)`,
        };
      },
    }),
    num({
      id: 'cp-S', difficulty: 2,
      gen(r) {
        const p = r.pick([0.8, 0.9, 0.97]), [a, a2, b, b2] = r.pick([[0, 90, 45, 135], [0, 90, 30, 120]]);
        const ans = chsh(a, a2, b, b2, p);
        return {
          prompt: t`A source has visibility $p = ${p}$ ($E = -p\cos\theta$). With $a = ${a}^\circ$, $a' = ${a2}^\circ$, $b = ${b}^\circ$, $b' = ${b2}^\circ$, what is $|S|$?`,
          visual: corrPic('The reduced correlation curve and the four angle differences (violet).', { p, marks: [Math.abs(b - a), Math.abs(b2 - a), Math.abs(b - a2), Math.abs(b2 - a2)] }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: chsh(a, a2, b, b2), feedback: 'Multiply every correlation by the visibility p.' }],
          hints: [t`$|S| = p\,|{-\cos\theta_{ab}} + \cos\theta_{ab'} - \cos\theta_{a'b} - \cos\theta_{a'b'}|$.`],
          teach: 'Noise multiplies S by the visibility.',
          explain: t`The ideal $|S|$ for these angles is $${fmt(chsh(a, a2, b, b2), 4)}$; times $${p}$ gives $${fmt(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-assume', difficulty: 2,
      prompt: t`The bound $|S| \le 2$ rests on assumptions. Which is **not** one of them?`,
      visual: corrPic('Quantum correlation (blue) and a local model (gold).', {}),
      choices: [
        'That quantum mechanics is correct',
        'That each particle carries definite answers for every setting (realism)',
        'That one station’s setting cannot affect the other station’s outcome (locality)',
        'That the settings are chosen independently of the particles’ hidden properties (freedom of choice)',
      ],
      answer: 0,
      why: {
        1: 'This is an assumption: it is what lets us write A, A′, B, B′ = ±1 for each pair.',
        2: 'This is an assumption: B and B′ must not depend on Alice’s choice.',
        3: 'This is an assumption: otherwise the hidden variables could anticipate the settings.',
      },
      hints: ['The bound is derived for any local hidden-variable theory. Does the derivation use the Schrödinger equation?'],
      teach: 'Bell’s inequality is a theorem about local hidden-variable theories, not about quantum mechanics; quantum mechanics is what violates it.',
      explain: t`The derivation never uses quantum mechanics — that is its power. Experiments then test nature against it. Which assumption to drop is a matter of interpretation (many-worlds, Bohmian mechanics and Copenhagen-style views each give a different answer), but local realism as a whole is ruled out.`,
    }),
  ],
  sources: [
    { label: 'Bell, “On the Einstein Podolsky Rosen paradox”, Physics 1, 195 (1964)', url: 'https://doi.org/10.1103/PhysicsPhysiqueFizika.1.195' },
    { label: 'Clauser, Horne, Shimony & Holt, Phys. Rev. Lett. 23, 880 (1969)', url: 'https://doi.org/10.1103/PhysRevLett.23.880' },
    { label: 'Hensen et al., “Loophole-free Bell inequality violation using electron spins separated by 1.3 kilometres”, Nature 526, 682 (2015)', url: 'https://doi.org/10.1038/nature15759' },
    { label: 'Giustina et al., Phys. Rev. Lett. 115, 250401 (2015); Shalm et al., Phys. Rev. Lett. 115, 250402 (2015)', url: 'https://doi.org/10.1103/PhysRevLett.115.250401' },
    { label: 'Yin et al., “Satellite-based entanglement distribution over 1200 kilometers”, Science 356, 1140 (2017)', url: 'https://doi.org/10.1126/science.aan3211' },
    { label: 'The Nobel Prize in Physics 2022 (Aspect, Clauser, Zeilinger)', url: 'https://www.nobelprize.org/prizes/physics/2022/summary/' },
  ],
});
