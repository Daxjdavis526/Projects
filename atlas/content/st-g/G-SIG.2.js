// The MTW sign table and translating between textbooks. Signature is only
// the first of three sign choices; Misner, Thorne and Wheeler label every
// book by (S1, S2, S3): the metric's sign, the Riemann tensor's sign, and the
// sign in the field equation (which fixes the Ricci contraction). The table
// below lists only the books whose conventions were checked against their
// stated definitions. Translation rules are derived, not quoted: under S1
// (g → −g) Γ, Riemann R^ρ_σμν, Ricci R_μν, G_μν and T_μν are unchanged while R,
// mixed T^μ_ν and the sign of the Λ term flip; under S2 with S3 the Ricci
// tensor, R and G_μν flip and the field equation gains a minus sign.
// Builds on G-SIG.1 (signature alone) and st-a.A6.6.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const C = 299792458;
const MPC = 3.0856775814913673e22;     // m
const r6 = (v) => +(+v).toPrecision(6);

// books and their (S1, S2, S3), from MTW's scheme
const BOOKS = [
  ['Misner, Thorne and Wheeler 1973', '+', '+', '+'],
  ['Wald 1984', '+', '+', '+'],
  ['Hartle 2003', '+', '+', '+'],
  ['Carroll 2004', '+', '+', '+'],
  ['Schutz 2009 (2nd ed.)', '+', '+', '+'],
  ['Landau and Lifshitz, Classical Theory of Fields', '-', '+', '+'],
  ['Weinberg 1972', '+', '-', '-'],
];
const TABLE = t`$$\begin{array}{l|c|c|c} \text{book} & S_1 & S_2 & S_3 \\ \hline ${BOOKS.map(([b, a, c, d]) => `\\text{${b}} & ${a} & ${c} & ${d}`).join(' \\\\ ')} \end{array}$$`;

/** A wireframe sphere: the surface whose curvature every book computes, with a different sign in some. */
function sphere(caption) {
  const curves = [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.2 }];
  for (const lat of [-50, -20, 10, 40, 65]) {
    const c = r6(Math.cos(lat * Math.PI / 180)), s = r6(Math.sin(lat * Math.PI / 180));
    curves.push({ param: [`${c}*cos(t)`, `${s} + 0.28*${c}*sin(t)`], t: [3.1416, 6.2832], color: 'ink3', width: 1.1 });
  }
  for (const lon of [20, 50, 80, 110, 140, 170]) {
    const s = r6(Math.cos(lon * Math.PI / 180));
    curves.push({ param: [`${s}*cos(t)`, 'sin(t)'], t: [-1.5708, 1.5708], color: 'ink4', width: 1 });
  }
  return {
    type: 'graph',
    params: { x: [-1.9, 1.9], y: [-1.2, 1.2], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves,
      arrows: [{ from: [0, 0], to: [0.7071, 0.7071], color: 'gold', width: 2, label: 'a', labelDx: -14, labelDy: 6 }] },
    caption: caption ?? t`A sphere of radius $a$. Its curvature is a fact about the shape; the sign of the number a book prints for it depends on that book’s $S_2$ and $S_3$.`,
  };
}

/** The scale factor of a universe dominated by a cosmological constant: the physics every book agrees on. */
function expansion({ sliders = null, readouts = null, choices = null, caption }) {
  return {
    type: 'graph',
    params: {
      x: [-2, 2], y: [0, 7.5], aspect: 'wide', xlabel: 'time (units of 1/H)', ylabel: 'scale factor a',
      curves: [{ fn: 'e^x', color: 'accent', width: 2.6, label: 'a ∝ exp(Ht)', labelAt: 1.2, labelDx: -90, labelDy: -10 }],
      ...(choices ? { choices } : {}), ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption: caption ?? t`A universe whose only content is a cosmological constant $\Lambda$ (de Sitter space) expands as $a \propto e^{Ht}$ with $H^2 = \Lambda/3$ ($c = 1$). The curve is the same in every book; the signs printed beside it are not.`,
  };
}

// the convention chooser in the Explore step: k = 1 (MTW and the modern texts), 2 (Landau–Lifshitz), 3 (Weinberg)
const S1 = '(1 - 2*step(k - 1.5)*step(2.5 - k))';
const S2 = '(1 - 2*step(k - 2.5))';
const S3 = S2;

export default lesson({
  id: 'st-g.G-SIG.2',
  title: 'The MTW sign table and translating between textbooks',
  minutes: 13, difficulty: 3,
  intro: t`The signature is only one sign a book chooses. *Gravitation* by Misner, Thorne and Wheeler (MTW) lists three on its inside front cover, and labels every book by them:

$$\begin{aligned} \eta_{\mu\nu} &= S_1\,\operatorname{diag}(-1, 1, 1, 1) \\ R^\mu{}_{\nu\alpha\beta} &= S_2\left(\partial_\alpha\Gamma^\mu_{\nu\beta} - \partial_\beta\Gamma^\mu_{\nu\alpha} + \Gamma^\mu_{\sigma\alpha}\Gamma^\sigma_{\nu\beta} - \Gamma^\mu_{\sigma\beta}\Gamma^\sigma_{\nu\alpha}\right) \\ G_{\mu\nu} &= S_3\,8\pi G\,T_{\mu\nu}, \qquad R_{\mu\nu} = S_2S_3\,R^\alpha{}_{\mu\alpha\nu} \end{aligned}$$

$S_1$ is the signature of [the previous lesson](#/lesson/st-g.G-SIG.1); $S_2$ is the sign of the Riemann tensor; $S_3$ is the sign in Einstein’s equation, which, through the last formula, also says which pair of indices is contracted to make the Ricci tensor. Every modern general-relativity text — and this Atlas — is $(+,+,+)$; the classics that need translating are Landau–Lifshitz and Weinberg:

${TABLE}

The **physics is the same in every row**: these are choices of how to print numbers, and a correct translation changes signs in step so that matter still attracts and the universe still expands.`,
  symbols: [
    { tex: 'S_1', text: t`the metric’s overall sign: $+$ for $(-,+,+,+)$, $-$ for $(+,-,-,-)$` },
    { tex: 'S_2', text: 'the overall sign of the Riemann tensor in terms of the Christoffel symbols' },
    { tex: 'S_3', text: t`the sign in the field equation $G_{\mu\nu} = S_3\,8\pi G\,T_{\mu\nu}$; with $S_2$ it fixes the Ricci contraction` },
    { tex: 'R^\\mu{}_{\\nu\\alpha\\beta}', text: t`the Riemann curvature tensor, built from the Christoffel symbols $\Gamma$` },
    { tex: 'R_{\\mu\\nu},\\ R', text: t`the Ricci tensor (a contraction of Riemann) and the Ricci scalar $R = g^{\mu\nu}R_{\mu\nu}$, in $\text{m}^{-2}$` },
    { tex: 'G_{\\mu\\nu}', text: t`the Einstein tensor $R_{\mu\nu} - \tfrac12 g_{\mu\nu}R$` },
    { tex: 'T_{\\mu\\nu}', text: 'the stress–energy tensor: energy density, momentum density, pressure and stress' },
  ],
  why: 'Half the sign errors in a first relativity project come from copying one formula out of a book with different conventions; checking three signs first prevents them.',
  visual: {
    ...expansion({
      choices: [{ key: 'k', label: 'Whose conventions?', options: [[1, 'MTW, Wald, Hartle, Carroll, Schutz'], [2, 'Landau–Lifshitz'], [3, 'Weinberg 1972']], value: 1, explain: 'Each book prints the same physics with its own three signs.' }],
      readouts: [
        { label: t`$S_1$`, expr: S1, digits: 1 },
        { label: t`$S_2$`, expr: S2, digits: 1 },
        { label: t`$S_3$`, expr: S3, digits: 1 },
        { label: t`printed $R$, in units of $H^2$`, expr: `12*${S1}*${S3}`, digits: 2 },
        { label: t`printed $G_{tt}$, in units of $H^2$`, expr: `3*${S3}`, digits: 2 },
        { label: t`sign of the $\Lambda g_{\mu\nu}$ term on the left`, expr: `${S1}*${S3}`, digits: 1 },
        { label: t`$H^2$ from the field equation, in units of $8\pi G\rho/3$`, expr: '1', digits: 1 },
      ],
    }),
    title: 'Same universe, different signs',
    lead: t`The curve is a universe expanding under a cosmological constant, $a \propto e^{Ht}$. Choose whose conventions to write it in. The readouts show what that book prints: its three signs, the Ricci scalar $R$, the $tt$ component of the Einstein tensor, the sign of the $\Lambda$ term — and the expansion rate those equations predict.`,
    tasks: [
      t`Switch to Landau–Lifshitz ($S_1 = -$): $R$ flips to $-12H^2$ and the $\Lambda$ term changes sign, but $G_{tt}$ is unchanged.`,
      t`Switch to Weinberg ($S_2 = S_3 = -$): now $G_{tt}$ flips too — and so does the sign in his field equation, $G_{\mu\nu} = -8\pi G\,T_{\mu\nu}$.`,
      t`In every case the last readout stays 1: each book’s field equation gives the same $H^2 = 8\pi G\rho/3$. The curve never changes.`,
    ],
    caption: t`De Sitter space, $c = 1$, with $H^2 = \Lambda/3$. The readouts follow from MTW’s rules: a book prints $R = S_1S_3\times(12H^2)$, $G_{tt} = S_3\times(3H^2)$ and $G_{\mu\nu} + S_1S_3\,\Lambda g_{\mu\nu} = S_3\,8\pi G\,T_{\mu\nu}$, where the numbers in brackets are MTW’s.`,
  },
  example: {
    prompt: t`Weinberg’s *Gravitation and Cosmology* (1972) writes Einstein’s equation as $R_{\mu\nu} - \tfrac12 g_{\mu\nu}R = -8\pi G\,T_{\mu\nu}$. Translate it into Carroll’s conventions, and say what Weinberg prints for the Ricci scalar of a sphere of radius $a$ (Carroll: $+2/a^2$).`,
    visual: sphere(t`A sphere of radius $a$: Carroll’s Ricci scalar is $+2/a^2$; Weinberg prints the opposite sign for the same sphere.`),
    steps: [
      { label: 'Read the signs', text: t`From the table: Weinberg is $(+,-,-)$, Carroll $(+,+,+)$. They agree on $S_1$ — the same metric, so the same $g_{\mu\nu}$, Christoffel symbols and $T_{\mu\nu}$.` },
      { label: 'Riemann', text: t`$S_2$ differs, so $R^{\text{W}\,\mu}{}_{\nu\alpha\beta} = -R^{\text{C}\,\mu}{}_{\nu\alpha\beta}$: the same Christoffel combination with the opposite overall sign.` },
      { label: 'Ricci', text: t`$S_2S_3 = (+)$ for both, so both contract the same pair of indices, $R_{\mu\nu} = R^\alpha{}_{\mu\alpha\nu}$. The Ricci tensor inherits the flip: $R^{\text{W}}_{\mu\nu} = -R^{\text{C}}_{\mu\nu}$, and so $R^{\text{W}} = -R^{\text{C}}$.` },
      { label: 'Substitute', text: t`$-R^{\text{C}}_{\mu\nu} + \tfrac12 g_{\mu\nu}R^{\text{C}} = -8\pi G\,T_{\mu\nu}$. Multiply by $-1$: $R^{\text{C}}_{\mu\nu} - \tfrac12 g_{\mu\nu}R^{\text{C}} = 8\pi G\,T_{\mu\nu}$ — Carroll’s equation, exactly. Weinberg’s minus sign does not make gravity repel; it compensates for his opposite-sign curvature.` },
      { label: 'The sphere', text: t`Weinberg prints $R = -2/a^2$ for a sphere. Same sphere, same geometry: a sphere’s triangles still have angle sums above $180^\circ$ in every book.` },
    ],
    answer: t`$G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$ in Carroll’s conventions; Weinberg’s sphere has $R = -2/a^2$.`,
  },
  practice: [
    mcq({
      id: 'classify', difficulty: 2,
      prompt: t`A book states: “$\eta_{\mu\nu} = \operatorname{diag}(1, -1, -1, -1)$; $R^\mu{}_{\nu\alpha\beta} = \partial_\alpha\Gamma^\mu_{\nu\beta} - \partial_\beta\Gamma^\mu_{\nu\alpha} + \Gamma^\mu_{\sigma\alpha}\Gamma^\sigma_{\nu\beta} - \Gamma^\mu_{\sigma\beta}\Gamma^\sigma_{\nu\alpha}$; $R_{\mu\nu} = R^\alpha{}_{\mu\alpha\nu}$; $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$.” What are its MTW signs $(S_1, S_2, S_3)$?`,
      visual: sphere(),
      choices: [t`$(-, +, +)$`, t`$(+, +, +)$`, t`$(+, -, -)$`, t`$(-, -, -)$`],
      answer: 0,
      why: {
        1: t`$\operatorname{diag}(1, -1, -1, -1) = -\operatorname{diag}(-1, 1, 1, 1)$, so $S_1 = -$.`,
        2: t`The Riemann formula matches MTW’s with a plus sign, so $S_2 = +$.`,
        3: t`Riemann has MTW’s sign and the field equation a plus sign: $S_2 = S_3 = +$.`,
      },
      hints: [t`Compare the metric with $\operatorname{diag}(-1, 1, 1, 1)$, the Riemann formula with MTW’s, and the sign in front of $8\pi G$.`],
      teach: 'Classify a book by comparing its metric, its Riemann formula and its field equation with MTW’s three definitions.',
      explain: t`$S_1 = -$ (mostly minus), $S_2 = +$ (MTW’s Riemann), $S_3 = +$ (plus sign in the field equation; $S_2S_3 = +$ matches the contraction $R^\alpha{}_{\mu\alpha\nu}$). These are Landau–Lifshitz’s signs.`,
    }),
    num({
      id: 'weinberg-sphere', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 4, 0.5, 5]);
        const ans = -2 / (a * a);
        return {
          prompt: t`A sphere of radius ${a} m has Ricci scalar $R = 2/a^2$ in Carroll’s conventions. What number does Weinberg’s book, with signs $(+,-,-)$, print for it, in $\text{m}^{-2}$?`,
          visual: sphere(t`A sphere of radius $a = ${a}$ m.`),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: -ans, feedback: t`That is Carroll’s value. With $S_2 = -$ the Riemann tensor flips, and Weinberg contracts it the same way, so Ricci and $R$ flip too.` }],
          hints: [t`$R = g^{\mu\nu}R_{\mu\nu}$, and $R_{\mu\nu} = S_2S_3\,R^\alpha{}_{\mu\alpha\nu}$ with Riemann carrying $S_2$.`, t`Same metric ($S_1 = +$), Riemann flipped, same contraction: $R^{\text{W}} = -R^{\text{C}}$.`],
          teach: 'Flipping S₂ (with the same Ricci contraction) flips Riemann, Ricci and the Ricci scalar.',
          explain: t`$R^{\text{W}} = -2/a^2 = ${nice(ans, 4)}\ \text{m}^{-2}$. The sphere is no less curved; Weinberg simply counts curvature with the opposite sign.`,
        };
      },
    }),
    multi({
      id: 'flip-s1', difficulty: 3,
      prompt: t`You translate from $(+,+,+)$ to $(-,+,+)$ — signature only, $g_{\mu\nu} \to -g_{\mu\nu}$. Which quantities keep exactly the same components? Select every one.`,
      visual: sphere(t`The same curved space in both conventions. Count the factors of the metric in each quantity: an odd number flips it.`),
      choices: [
        t`the Christoffel symbols $\Gamma^\lambda_{\mu\nu}$`,
        t`the Riemann tensor $R^\rho{}_{\sigma\mu\nu}$`,
        t`the Ricci tensor $R_{\mu\nu}$`,
        t`the Einstein tensor $G_{\mu\nu}$`,
        t`the Ricci scalar $R$`,
        t`the mixed component $T^0{}_0$`,
      ],
      answer: [0, 1, 2, 3],
      why: {
        4: t`$R = g^{\mu\nu}R_{\mu\nu}$ has one inverse metric: it flips.`,
        5: t`$T^0{}_0 = g^{0\nu}T_{\nu0}$ has one inverse metric: it flips ($-\rho$ becomes $+\rho$).`,
      },
      hints: [t`$\Gamma = \tfrac12 g^{-1}\,\partial g$ has two factors of the metric; Riemann is built from $\Gamma$ alone.`, t`$G_{\mu\nu} = R_{\mu\nu} - \tfrac12 g_{\mu\nu}R$: both $g_{\mu\nu}$ and $R$ flip in the second term.`],
      teach: t`Under $g \to -g$: $\Gamma$, $R^\rho{}_{\sigma\mu\nu}$, $R_{\mu\nu}$ and $G_{\mu\nu}$ are unchanged; $R$ and every mixed component such as $T^\mu{}_\nu$ flip.`,
      explain: t`$\Gamma$ (two metric factors) is unchanged, so are Riemann and its contraction $R_{\mu\nu}$. In $G_{\mu\nu}$ the term $g_{\mu\nu}R$ has two flips. $R$ and $T^0{}_0$ each have one, so they change sign. That is why $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$ looks identical in both signatures.`,
    }),
    num({
      id: 'mixed-T', difficulty: 2,
      gen(r) {
        const [what, rho] = r.pick([['water', 1000], ['a white dwarf’s core, about $10^{9}$ kg/m³', 1e9], ['the centre of a neutron star, about $5\\times10^{17}$ kg/m³', 5e17]]);
        const ans = rho * C * C;
        return {
          prompt: t`For ${what === 'water' ? 'water at rest (1000 kg/m³)' : what}, the energy density is $\rho c^2$. In MTW’s conventions the mixed component of the stress–energy tensor is $T^0{}_0 = -\rho c^2$. What is $T^0{}_0$ in Landau–Lifshitz’s conventions, in $\text{J/m}^3$?`,
          visual: expansion({ caption: t`A stand-in picture: matter with energy density $\rho c^2$ is what drives expansion in every book. Here, only how one of its components is printed changes.` }),
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: -ans, feedback: t`That is MTW’s value. A mixed component carries one inverse metric, so it flips with $S_1$.` }],
          hints: [t`$T^0{}_0 = g^{00}T_{00}$, and $T_{00} = \rho c^2$ in both books.`, t`In Landau–Lifshitz $g^{00} = +1$.`],
          teach: 'Mixed components such as T⁰₀ flip sign with the signature: −ρc² in mostly plus, +ρc² in mostly minus.',
          explain: t`$T^0{}_0 = +\rho c^2 = ${tex(ans, 3)}\ \text{J/m}^3$ in Landau–Lifshitz, $-${tex(ans, 3)}$ in MTW: the same energy density.`,
        };
      },
    }),
    mcq({
      id: 'lambda', difficulty: 3,
      prompt: t`MTW, Carroll and the Atlas write Einstein’s equation with a cosmological constant as $G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi G\,T_{\mu\nu}$, with $\Lambda > 0$ for an accelerating universe. In a book with signs $(-,+,+)$, the same physics reads:`,
      visual: expansion({}),
      choices: [t`$G_{\mu\nu} - \Lambda g_{\mu\nu} = 8\pi G\,T_{\mu\nu}$`, t`$G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi G\,T_{\mu\nu}$`, t`$G_{\mu\nu} + \Lambda g_{\mu\nu} = -8\pi G\,T_{\mu\nu}$`, t`$-G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi G\,T_{\mu\nu}$`],
      answer: 0,
      why: {
        1: t`$G_{\mu\nu}$ and $T_{\mu\nu}$ are unchanged under $g \to -g$, but $g_{\mu\nu}$ itself flips, so the $\Lambda$ term must change sign to describe the same $\Lambda > 0$.`,
        2: t`$S_3$ is $+$ in that book: the sign in front of $8\pi G\,T_{\mu\nu}$ stays.`,
        3: t`$G_{\mu\nu}$ does not change under a signature flip: both $g_{\mu\nu}$ and $R$ flip in $-\tfrac12 g_{\mu\nu}R$.`,
      },
      hints: ['Which of G, g and T flip when only the signature changes?', t`Write MTW’s $g_{\mu\nu}$ as $-g'_{\mu\nu}$ in terms of the other book’s metric.`],
      teach: 'The Λ term carries a bare metric, so its sign follows the signature: +Λg in mostly plus, −Λg in mostly minus.',
      explain: t`Substitute $g_{\mu\nu} = -g'_{\mu\nu}$, with $G$ and $T$ unchanged: $G_{\mu\nu} - \Lambda g'_{\mu\nu} = 8\pi G\,T_{\mu\nu}$. Check with vacuum energy: in mostly minus a vacuum’s $T_{\mu\nu} = +\rho_{\text{vac}}g'_{\mu\nu}$, and moving it to the left gives the same $-\Lambda g'$ term.`,
    }),
    mcq({
      id: 'repel', difficulty: 2,
      prompt: t`A student reads Weinberg’s field equation $R_{\mu\nu} - \tfrac12 g_{\mu\nu}R = -8\pi G\,T_{\mu\nu}$ and concludes that in his book gravity is repulsive. What is wrong?`,
      visual: sphere(t`Curvature itself has no sign convention; the number that describes it does.`),
      choices: [
        t`Weinberg’s Riemann tensor, and with it his Ricci tensor, has the opposite sign to Carroll’s, which the minus sign cancels`,
        t`Weinberg uses $(+,-,-,-)$, which flips the sign of $G$`,
        t`Weinberg’s $T_{\mu\nu}$ is negative for ordinary matter`,
        'Nothing: the two books describe different theories',
      ],
      answer: 0,
      why: {
        1: t`Weinberg’s $S_1$ is $+$: he uses the same signature as Carroll.`,
        2: 'Both books give ordinary matter positive energy density.',
        3: 'Both are Einstein’s theory; the predictions are identical.',
      },
      hints: [t`Weinberg’s signs are $(+,-,-)$: which of the three differ from Carroll’s?`],
      teach: 'A minus sign in a field equation means nothing until you know the book’s S₂ and S₃.',
      explain: t`With $S_2 = S_3 = -$, Weinberg’s Einstein tensor is minus Carroll’s, and the minus sign in his equation restores $G^{\text{C}}_{\mu\nu} = +8\pi G\,T_{\mu\nu}$: attractive gravity in both.`,
    }),
    mcq({
      id: 'mixed-books', difficulty: 3, kind: 'error',
      prompt: t`A student computes the Ricci tensor of the geometry inside a model star using Weinberg’s definition of the Riemann tensor, then puts it into Carroll’s equation $R_{\mu\nu} - \tfrac12 g_{\mu\nu}R = 8\pi G\,T_{\mu\nu}$, and finds that the star needs negative energy density. Where is the error?`,
      visual: sphere(t`One geometry, computed with one book’s curvature sign and fed into another book’s field equation.`),
      choices: [
        'Weinberg’s Ricci tensor is minus Carroll’s; the two formulas belong to different S₂, S₃ and cannot be combined',
        'A star’s interior cannot be described by a metric',
        'Carroll’s equation needs a cosmological constant',
        'Weinberg uses the opposite signature, so the metric must be flipped',
      ],
      answer: 0,
      why: {
        1: 'Inside a star the geometry is curved but perfectly described by a metric; the sign problem is in mixing books.',
        2: 'Λ is irrelevant inside a star.',
        3: t`Weinberg and Carroll share $S_1 = +$; the difference is $S_2$ and $S_3$.`,
      },
      hints: ['Write down both books’ (S₁, S₂, S₃).', 'A curvature computed with one book’s S₂ must go into the field equation of a book with the same S₂ and S₃.'],
      teach: 'Before combining formulas from two books, check all three MTW signs, not just the signature.',
      explain: t`Weinberg’s $R_{\mu\nu}$ is $-R^{\text{C}}_{\mu\nu}$. In Carroll’s equation it gives $-G^{\text{C}}_{\mu\nu} = 8\pi G\,T_{\mu\nu}$ — the energy density comes out negative. Either use Weinberg’s equation with its minus sign or recompute Ricci with Carroll’s Riemann.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-de-sitter', difficulty: 3, transfer: true,
      gen(r) {
        const [H, which, s] = r.pick([[56, 'Landau–Lifshitz’s', -1], [56, 'Weinberg’s', -1], [70, 'Carroll’s', 1], [67, 'Landau–Lifshitz’s', -1]]);
        const Hs = H * 1e3 / MPC, R = 12 * Hs * Hs / (C * C), ans = s * R / 1e-52;
        return {
          prompt: t`A universe dominated by a cosmological constant expands with constant Hubble rate $H$; ours is heading towards this, with $H \approx 56$ km/s/Mpc in the far future. In MTW’s conventions its Ricci scalar is $R = 12H^2/c^2$. For $H = ${H}$ km/s/Mpc, what Ricci scalar does ${which} book print? Give it in units of $10^{-52}\ \text{m}^{-2}$. ($1\ \text{Mpc} = 3.0857\times10^{22}$ m.)`,
          visual: expansion({ caption: t`Exponential expansion at constant $H$. Its curvature is about $10^{-52}\ \text{m}^{-2}$: radii of curvature of billions of light-years.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: s < 0 ? 'Check that book’s signs: its R is the opposite of MTW’s.' : t`Carroll is $(+,+,+)$, like MTW: no sign change.` }],
          hints: [t`$H = ${H}\times10^3/(3.0857\times10^{22})\ \text{s}^{-1} = ${tex(Hs, 4)}\ \text{s}^{-1}$.`, t`Printed $R = S_1S_3\times12H^2/c^2$; look up the book’s $S_1$ and $S_3$.`],
          teach: 'The Ricci scalar a book prints is S₁S₃ times MTW’s: Landau–Lifshitz and Weinberg both print −12H² for de Sitter.',
          explain: t`$12H^2/c^2 = ${tex(R, 4)}\ \text{m}^{-2}$, and ${which} book has $S_1S_3 = ${s > 0 ? '+' : '-'}1$, so it prints $${tex(s * R, 4)}\ \text{m}^{-2}$, or $${nice(ans, 4)}$ in units of $10^{-52}\ \text{m}^{-2}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-fluid', difficulty: 3,
      prompt: t`In MTW’s conventions a perfect fluid has $T^{\mu\nu} = (\rho + p)\,u^\mu u^\nu + p\,g^{\mu\nu}$. Which is the same fluid in Landau–Lifshitz’s conventions?`,
      visual: expansion({ caption: t`A perfect fluid — energy density $\rho$ and pressure $p$ — is what fills a Friedmann universe in every book.` }),
      choices: [t`$(\rho + p)\,u^\mu u^\nu - p\,g^{\mu\nu}$`, t`$(\rho + p)\,u^\mu u^\nu + p\,g^{\mu\nu}$`, t`$(\rho - p)\,u^\mu u^\nu - p\,g^{\mu\nu}$`, t`$-(\rho + p)\,u^\mu u^\nu + p\,g^{\mu\nu}$`],
      answer: 0,
      why: {
        1: t`$g^{\mu\nu}$ flips with the signature while $u^\mu u^\nu$ does not, so the pressure term must change sign to keep $T^{ij} = p\,\delta^{ij}$ in the rest frame.`,
        2: t`Test it at rest: $T^{00}$ must be $\rho$, and $(\rho - p) - p\,g^{00}$ is not.`,
        3: t`$u^\mu u^\nu$ has upper indices and does not change; $T^{00}$ would come out $-\rho$.`,
      },
      hints: [t`Check the rest frame, $u^\mu = (1, 0, 0, 0)$: you need $T^{00} = \rho$ and $T^{xx} = p$.`, t`In mostly minus, $g^{00} = 1$ and $g^{xx} = -1$.`],
      teach: 'The pressure term of a perfect fluid carries the inverse metric, so its sign follows the signature.',
      explain: t`At rest, $T^{00} = (\rho + p) - p = \rho$ and $T^{xx} = 0 - p(-1) = p$. ✓ This is the form in Landau–Lifshitz; MTW’s $+p\,g^{\mu\nu}$ gives the same components with $g^{00} = -1$, $g^{xx} = +1$.`,
    }),
    mcq({
      id: 'cp-paper', difficulty: 2, transfer: true,
      prompt: t`A gravitational-wave paper says: “We use the conventions of Misner, Thorne and Wheeler, with $G = c = 1$.” You want to use one of its curvature formulas in a calculation done in Carroll’s book. What must you change?`,
      visual: sphere(t`Two books, one curved spacetime. MTW and Carroll print the same numbers for its curvature.`),
      choices: [t`Only restore $G$ where the paper has set it to 1; the three signs agree`, t`Flip the sign of every Riemann component`, t`Flip the signature: MTW uses $(+,-,-,-)$`, 'Nothing at all, including the units'],
      answer: 0,
      why: {
        1: t`MTW and Carroll share $S_2 = +$.`,
        2: t`MTW is the reference $(-,+,+,+)$: $S_1 = +$ by definition.`,
        3: t`Carroll keeps $G$ explicit ($G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$), so a formula with $G = 1$ needs it restored (lesson G-UNITS.2).`,
      },
      hints: ['Look both books up in the table, then compare their units.'],
      teach: 'MTW, Wald, Hartle, Carroll and Schutz agree on all three signs; what can still differ is units.',
      explain: t`Both are $(+,+,+)$, so every sign carries over. Carroll keeps $G$ (with $c = 1$), so put $G$ back wherever a mass appears — the subject of [G = c = 1 and converting back to SI](#/lesson/st-g.G-UNITS.2).`,
    }),
  ],
  sources: [
    { label: 'Misner, Thorne & Wheeler, Gravitation (1973), inside front cover: the sign conventions of other authors', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 3–4 (Riemann tensor, Einstein’s equation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Landau & Lifshitz, The Classical Theory of Fields, §§91–95', url: 'https://www.sciencedirect.com/book/9780080250724/the-classical-theory-of-fields' },
    { label: 'Weinberg, Gravitation and Cosmology (1972), ch. 6–7', url: 'https://www.wiley.com/en-us/Gravitation+and+Cosmology-p-9780471925675' },
    { label: 'Wikipedia: Sign convention — relativity (a reproduction of the MTW scheme)', url: 'https://en.wikipedia.org/wiki/Sign_convention#Relativity' },
  ],
});
