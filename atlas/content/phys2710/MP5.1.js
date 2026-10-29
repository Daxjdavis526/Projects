// Rutherford scattering — the nuclear atom from alpha particles bouncing off
// gold. Each alpha follows a hyperbola: impact parameter b = (d/2) cot(θ/2),
// closest approach r_min = (d/2)(1 + 1/sin(θ/2)), with d = zZe²/4πε₀K; the
// cross-section dσ/dΩ = (d/4)²/sin⁴(θ/2), tested against Geiger and
// Marsden’s 1913 counts; the fraction of a foil’s alphas turned beyond θ;
// where the formula fails (the nuclear surface); Thomson’s atom for
// contrast; Rutherford backscattering on Mars. Numbers from
// model/mp-rutherford.js or computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as R from '../../src/viz/model/mp-rutherford.js';
import { seg, label, frame, circle, r6 } from './_diagrams.js';
import { KE2, RHO_AU, AU_GPMOL, N_A, M_O16, M_SI28, M_FE56 } from './_quanta.js';
import { M_HE4 } from './_constants.js';

const t = String.raw;
const DEG = Math.PI / 180;
const N_AU = (RHO_AU * 1e3 / (AU_GPMOL * 1e-3)) * N_A;          // gold nuclei per m³
const EX = { K: 7.69 };
EX.d = R.collisionDiameter(EX.K, 79); EX.b90 = R.impactParameter(Math.PI / 2, EX.d); EX.f = R.fractionBeyond(Math.PI / 2, EX.d, N_AU, 1e-6);
EX.R = R.nuclearRadius(197) + R.nuclearRadius(4);

/** The simulation as a still picture for a question. */
const still = (params, caption) => ({ type: 'mp-rutherford', params: { play: false, controls: false, readout: false, panel: 'none', ...params }, ...(caption ? { caption } : {}) });

/** Rutherford’s 1/sin⁴(θ/2) on a log scale, with marked angles. */
function countsCurve(marks, caption) {
  return {
    type: 'graph',
    params: {
      x: [0, 180], y: [0, 5.2], aspect: 'wide', xlabel: 'scattering angle θ (degrees)', ylabel: 'relative count', ylog: true, xticks: 6,
      curves: [{ fn: '-4*log(sin(x*pi/360))', domain: [9, 180], color: 'accent', width: 2.4, label: '1/sin⁴(θ/2)', labelAt: 40, labelDx: 10, labelDy: -10 }],
      vlines: marks.map((a) => ({ x: a, label: `${a}°`, color: 'gold' })),
    },
    caption: caption ?? 'Rutherford’s prediction on a logarithmic scale: each step up is ten times as many alphas. The count at 180° is set to 1.',
  };
}

/** A gold foil seen face-on by the beam: each nucleus is a target disc of area πb², exaggerated enormously. */
const foilFace = {
  type: 'graph',
  params: frame([0, 10], [0, 4.4], {
    aspect: 'wide',
    shade: [{ fn: '4.2', lower: '0.2', from: 0.2, to: 9.8, color: 'gold', alpha: 0.12 }],
    curves: [[1.1, 1.0], [2.7, 3.1], [3.9, 1.6], [5.6, 2.9], [6.4, 0.9], [7.9, 2.2], [9.0, 3.5], [1.9, 3.6], [4.9, 1.0], [8.6, 1.0]].map(([x, y]) => circle(x, y, 0.32, 'accent', 1.6)),
    points: [
      ...[[1.1, 1.0], [2.7, 3.1], [3.9, 1.6], [5.6, 2.9], [6.4, 0.9], [7.9, 2.2], [9.0, 3.5], [1.9, 3.6], [4.9, 1.0], [8.6, 1.0]].map(([x, y]) => ({ x, y, r: 2.5, color: 'bad' })),
      label(5, 4.2, 'the foil, face-on to the beam', 'ink2', 0, -12, 'center'),
    ],
  }),
  caption: 'The foil as the beam sees it. An alpha aimed inside one of the blue discs (radius b) is turned through more than θ; the fraction of the foil they cover is the fraction scattered. Discs and nuclei hugely enlarged; in reality they cover a few parts in 10⁵.',
};

/** Rutherford backscattering: an alpha source over a rock, a detector catching alphas bounced straight back. */
const rbs = {
  type: 'graph',
  params: frame([-5, 5], [-1.8, 2.6], {
    aspect: 'wide',
    shade: [{ fn: '0', lower: '-1.7', from: -4.6, to: 4.6, color: 'warn', alpha: 0.18 }],
    curves: [seg(-4.6, 0, 4.6, 0, 'warn', 2)],
    arrows: [{ from: [-0.6, 2.1], to: [-0.12, 0.12], color: 'gold' }, { from: [0.12, 0.12], to: [0.6, 2.1], color: 'accent' }],
    points: [
      { x: -0.75, y: 2.3, r: 6, color: 'gold' }, label(-0.75, 2.3, 'curium-244 alphas, 5.80 MeV', 'gold', -12, 0, 'right'),
      { x: 0.75, y: 2.3, r: 6, color: 'accent' }, label(0.75, 2.3, 'detector: energy K′ = ?', 'accent', 12, 0),
      { x: 0, y: 0, r: 4, color: 'bad' }, label(0, -0.9, 'Martian rock', 'warn', 0, 0, 'center'),
    ],
  }),
  caption: 'Rutherford backscattering, as in the alpha mode of the spectrometer on the Sojourner rover: alphas bounced nearly straight back keep a fraction of their energy that depends on the mass of the nucleus they hit. Not to scale.',
};

export default lesson({
  id: 'phys2710.MP5.1',
  title: 'Rutherford scattering',
  minutes: 15, difficulty: 3,
  intro: t`In 1909 Hans Geiger and Ernest Marsden fired alpha particles at a thin metal foil and found about one in eight thousand **bouncing back** — impossible if an atom’s positive charge were spread thinly through it, as J. J. Thomson proposed. Rutherford’s answer (1911): all the positive charge and nearly all the mass sit in a tiny **nucleus**. Each alpha then follows a hyperbola, and the off-centre distance at which it is aimed, the impact parameter $b$, fixes its angle. Counting how many alphas land at each angle tests the picture:

$$\frac{d\sigma}{d\Omega} = \left(\frac{zZe^2}{4\pi\varepsilon_0\,4K}\right)^2\frac{1}{\sin^4(\theta/2)}$$

In 1913 Geiger and Marsden’s counts followed $1/\sin^4(\theta/2)$ over a range of four thousand — and from the alphas that came back, Rutherford could set an upper limit on the nucleus’s size of a few times $10^{-14}$ m.`,
  symbols: [
    { tex: '\\frac{d\\sigma}{d\\Omega}', text: 'the differential cross-section: the target area per steradian that sends alphas into the direction $\\theta$, in fm² per steradian (1 fm = $10^{-15}$ m)' },
    { tex: 'z,\\ Z', text: 'the charge numbers of the alpha (2) and of the target nucleus (79 for gold)' },
    { tex: '\\frac{e^2}{4\\pi\\varepsilon_0}', text: t`the strength of the Coulomb force between two elementary charges: $${fmt(KE2, 5)}$ MeV fm` },
    { tex: 'K', text: 'the alpha’s kinetic energy far from the nucleus, in MeV' },
    { tex: '\\theta', text: 'the scattering angle between the alpha’s incoming and outgoing directions' },
    { tex: 'd', text: t`$zZe^2/4\pi\varepsilon_0K$: the distance of closest approach in a head-on collision, which sets every length in the problem; the impact parameter is $b = \tfrac{d}{2}\cot(\theta/2)$` },
  ],
  why: 'It found the nucleus — and its method, scattering something off a target and counting angles, later found quarks inside the proton and is how particle physics still measures what things are made of.',
  visual: {
    type: 'mp-rutherford',
    title: 'Alpha particles meet a gold nucleus',
    lead: t`A beam of 7.7 MeV alphas aimed at a gold nucleus, to scale in femtometres. Each follows a hyperbola: the closer it is aimed — the smaller its impact parameter $b$ — the harder it turns. The gold alpha is yours: its $b$, its angle $\theta$ and its closest approach are marked.`,
    tasks: [
      'Slide b from 60 fm down to 0: θ climbs from 28° to 180°, passing 90° at b = d/2 = 14.8 fm.',
      'Switch the atom to Thomson’s plum pudding: the same beam goes almost straight through, turned by less than 0.01°.',
      'Choose aluminium, set b = 0 and raise K to 10 MeV: the alpha now reaches the nucleus, where Rutherford’s formula fails — the first measurements of nuclear size came from this.',
    ],
    params: { K: 7.7, target: 'gold', b: 20, panel: 'angle' },
  },
  example: {
    prompt: t`Alphas of ${EX.K} MeV (the fastest from Geiger and Marsden’s radon source) strike gold ($Z = 79$). Find the head-on distance of closest approach, the impact parameter that gives a 90° deflection, and the fraction of alphas a gold foil $1.0\ \mu\text{m}$ thick turns through more than 90°. (Gold has $${tex(N_AU, 3)}$ nuclei per m³.)`,
    visual: still({ K: EX.K, target: 'gold', b: +EX.b90.toFixed(1), panel: 'angle', readout: true }, 'The alpha aimed at b = d/2, scattered through exactly 90°, with the beam around it. Distances to scale in fm; the nucleus held fixed.'),
    steps: [
      { label: 'Head-on', text: t`At the turning point all the kinetic energy is electric potential energy: $K = zZe^2/(4\pi\varepsilon_0 d)$, so $d = \dfrac{2\times79\times${fmt(KE2, 4)}\ \text{MeV fm}}{${EX.K}\ \text{MeV}} = ${fmt(EX.d, 3)}$ fm.` },
      { label: 'Not touching', text: t`A gold nucleus has radius about $1.2\,A^{1/3} = ${fmt(R.nuclearRadius(197), 2)}$ fm and an alpha about ${fmt(R.nuclearRadius(4), 2)} fm: together ${fmt(EX.R, 2)} fm, well inside $d$. Only the Coulomb force acts, which is why Rutherford’s formula works for gold.` },
      { label: 'Ninety degrees', text: t`$b = \tfrac{d}{2}\cot(\theta/2)$ with $\cot 45° = 1$: $b = d/2 = ${fmt(EX.b90, 3)}$ fm. Any alpha aimed closer than that is turned through more than 90°.` },
      { label: 'Target area', text: t`Each nucleus offers a disc of area $\pi b^2$ to such alphas. A foil of thickness $t$ with $n$ nuclei per unit volume covers a fraction $f = \pi b^2 n t$ of the beam (the discs barely overlap): $f = \pi(${fmt(EX.b90, 3)}\times10^{-15}\ \text{m})^2(${tex(N_AU, 3)}\ \text{m}^{-3})(1.0\times10^{-6}\ \text{m}) = ${tex(EX.f, 3)}$.` },
      { label: 'Sense check', text: t`About one alpha in ${fmt(Math.round(1 / EX.f / 100) * 100, 3)} — rare, but not absurdly so, the same order as the one in eight thousand Geiger and Marsden saw bounce back from platinum in 1909. In Thomson’s atom the largest deflection by one atom would be about $${fmt(R.thomsonMax(EX.d) / DEG, 1)}°$, and turning through 90° by many small random nudges is unimaginably rarer.` },
    ],
    answer: t`$d = ${fmt(EX.d, 3)}$ fm; $b(90°) = ${fmt(EX.b90, 3)}$ fm; the fraction beyond 90° is $${tex(EX.f, 2)}$, about 1 in ${fmt(Math.round(1 / EX.f / 100) * 100, 3)}.`,
  },
  practice: [
    num({
      id: 'closest', difficulty: 1,
      gen(r) {
        const K = r.pick([4.0, 5.0, 5.49, 6.0, 7.69]), key = r.pick(['gold', 'silver', 'copper']);
        const tg = R.TARGETS[key], d = R.collisionDiameter(K, tg.Z);
        return {
          prompt: t`An alpha particle of ${K} MeV heads straight at a ${tg.label} nucleus ($Z = ${tg.Z}$). How close does it get before it turns back, in fm?`,
          answer: d, units: 'fm', tol: { rel: 0.005 },
          errors: [{ value: d / 2, feedback: t`The alpha carries charge $2e$: $z = 2$ in $zZe^2$.` }, { value: (tg.Z * KE2) / (2 * K), feedback: t`At closest approach $K = zZe^2/(4\pi\varepsilon_0 d)$; solve for $d$ — there is no factor of $\tfrac12$.` }].filter((e) => Math.abs(e.value - d) > 0.02 * d),
          hints: [t`Head-on, all of $K$ turns into Coulomb potential energy: $K = \dfrac{zZe^2}{4\pi\varepsilon_0 d}$.`, t`$d = \dfrac{2\times${tg.Z}\times1.440\ \text{MeV fm}}{${K}\ \text{MeV}}$.`],
          teach: 'Head-on, an alpha stops where its kinetic energy equals the Coulomb energy: d = zZe²/(4πε₀K).',
          explain: t`$d = 2\times${tg.Z}\times${fmt(KE2, 4)}/${K} = ${fmt(d, 3)}$ fm — several times the ${tg.label} nucleus’s radius of about ${fmt(R.nuclearRadius(tg.A), 2)} fm, so the alpha never touches it.`,
          visual: still({ K, target: key, b: 0, hide: ['rmin', 'd'] }),
        };
      },
    }),
    num({
      id: 'b-for-angle', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 60, 120, 150]), K = r.pick([5.0, 6.0, 7.69]);
        const d = R.collisionDiameter(K, 79), b = R.impactParameter(th * DEG, d);
        return {
          prompt: t`A ${K} MeV alpha is scattered by a gold nucleus through ${th}°. What was its impact parameter, in fm? (Its head-on distance would be $d = ${fmt(d, 3)}$ fm.)`,
          answer: b, units: 'fm', tol: { rel: 0.005 },
          errors: [{ value: (d / 2) * Math.tan((th * DEG) / 2), feedback: t`It is the cotangent: $b = \tfrac{d}{2}\cot(\theta/2)$. Large angles need small $b$.` }, { value: (d / 2) / Math.tan(th * DEG), feedback: t`Use half the angle: $\cot(\theta/2)$, not $\cot\theta$.` }].filter((e) => e.value > 0 && Math.abs(e.value - b) > 0.02 * b),
          hints: [t`$b = \tfrac{d}{2}\cot\tfrac{\theta}{2}$.`, t`$\cot ${th / 2}° = ${fmt(1 / Math.tan((th * DEG) / 2), 4)}$.`],
          teach: 'The impact parameter and the angle are tied by b = (d/2) cot(θ/2): the closer the aim, the bigger the turn.',
          explain: t`$b = ${fmt(d / 2, 4)}\times\cot ${th / 2}° = ${fmt(b, 3)}$ fm. ${th > 90 ? 'Aimed that close, the alpha is turned back toward where it came from.' : 'Even a modest deflection needs an aim within a few nuclear diameters.'}`,
          visual: still({ K, target: 'gold', b: Math.min(119, +b.toFixed(1)), hide: ['b', 'rmin'] }),
        };
      },
    }),
    num({
      id: 'count-ratio', difficulty: 2,
      gen(r) {
        const [a1, a2] = r.pick([[30, 90], [45, 135], [20, 60], [60, 150]]);
        const ratio = Math.sin((a2 * DEG) / 2) ** 4 / Math.sin((a1 * DEG) / 2) ** 4;
        return {
          prompt: t`A detector of fixed size counts the alphas scattered by a gold foil. If it records $N$ per minute at ${a2}°, how many times as many does it record at ${a1}°?`,
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: Math.sin(a2 * DEG) ** 4 / Math.sin(a1 * DEG) ** 4, feedback: t`Use half-angles: the law is $1/\sin^4(\theta/2)$.` }, { value: Math.sin((a2 * DEG) / 2) ** 2 / Math.sin((a1 * DEG) / 2) ** 2, feedback: t`It is the fourth power of the sine, not the square.` }].filter((e) => Math.abs(e.value - ratio) > 0.02 * ratio),
          hints: [t`$N \propto 1/\sin^4(\theta/2)$, so $\dfrac{N(${a1}°)}{N(${a2}°)} = \dfrac{\sin^4(${a2 / 2}°)}{\sin^4(${a1 / 2}°)}$.`],
          teach: 'Rutherford’s law makes counts rise steeply toward small angles: N ∝ 1/sin⁴(θ/2).',
          explain: t`$\left(\dfrac{\sin ${a2 / 2}°}{\sin ${a1 / 2}°}\right)^4 = \left(\dfrac{${fmt(Math.sin((a2 * DEG) / 2), 4)}}{${fmt(Math.sin((a1 * DEG) / 2), 4)}}\right)^4 = ${fmt(ratio, 3)}$. Geiger and Marsden tested exactly such ratios, from 15° to 150°.`,
          visual: countsCurve([a1, a2]),
        };
      },
    }),
    mcq({
      id: 'thomson', difficulty: 2,
      prompt: 'Why could Thomson’s “plum pudding” atom — positive charge spread evenly through a ball about 0.2 nm across, with electrons dotted inside — never turn an alpha particle back?',
      choices: [
        'Spread so thinly, the positive charge can only nudge an alpha by about a hundredth of a degree per atom, and the electrons are far too light to stop it',
        'The electrons would absorb every alpha that came close',
        'A plum-pudding atom has no electric charge, so it exerts no force at all',
        'Alphas pass between the atoms without meeting any of them',
      ],
      answer: 0,
      why: {
        1: 'An alpha is about 7300 times heavier than an electron: an electron can no more stop it than a fly can stop a bullet.',
        2: 'It is neutral overall, but inside it an alpha feels the spread-out positive charge — just too weakly to turn it much.',
        3: 'A foil a micrometre thick is thousands of atoms deep, and in Thomson’s model the atoms fill all of it.',
      },
      hints: ['Compare the field of 79 e packed into a few femtometres with the same charge spread through a ball 0.2 nm across.', 'The strongest push comes where the alpha gets close to all of the positive charge at once. In Thomson’s atom, how close can it get to all of it?'],
      teach: 'Only charge concentrated in a tiny nucleus can produce the strong fields that turn alphas through large angles.',
      explain: t`Inside a uniformly charged sphere the field grows only in proportion to the distance from the centre, and its strongest value, at the surface, is $10^{8}$ times weaker than at a gold nucleus’s surface (the radius is about $10^{4}$ times larger, and the field goes as $1/r^2$). The deflection per atom is at most $d/2R \approx 10^{-4}$ rad. Many atoms add random nudges, giving a degree or so — never 90°.`,
      visual: still({ K: 7.7, target: 'gold', b: 20, model: 'thomson' }, 'The same beam passing through Thomson’s atom, to scale in fm: the whole view lies deep inside one atom, and the paths are straight to within a hundredth of a degree.'),
    }),
    num({
      id: 'fraction', difficulty: 3,
      gen(r) {
        const tUm = r.pick([0.5, 1, 2]), K = r.pick([5.0, 6.0, 7.69]), th = r.pick([60, 90, 120]);
        const d = R.collisionDiameter(K, 79), b = R.impactParameter(th * DEG, d), f = R.fractionBeyond(th * DEG, d, N_AU, tUm * 1e-6);
        return {
          prompt: t`A beam of ${K} MeV alphas strikes a gold foil ${tUm} μm thick. What fraction of the alphas is scattered through more than ${th}°? (Gold has $${tex(N_AU, 3)}$ nuclei per m³; $e^2/4\pi\varepsilon_0 = 1.440$ MeV fm.)`,
          answer: f, tol: { rel: 0.01 },
          errors: [{ value: Math.PI * N_AU * tUm * 1e-6 * (d * 1e-15) ** 2, feedback: t`The disc that counts has radius $b(${th}°)$, not $d$: first find $b = \tfrac d2\cot(\theta/2)$.` }, { value: N_AU * tUm * 1e-6 * (b * 1e-15) ** 2, feedback: t`The target area of one nucleus is $\pi b^2$ — include the $\pi$.` }].filter((e) => Math.abs(e.value - f) > 0.02 * f),
          hints: [t`First $d = 2\times79\times1.440/${K}$ fm and $b = \tfrac d2\cot ${th / 2}°$.`, t`Then $f = \pi b^2 n t$ with $b$ in metres, $n = ${tex(N_AU, 3)}\ \text{m}^{-3}$ and $t = ${tUm}\times10^{-6}$ m.`],
          teach: 'A thin foil scatters beyond θ the fraction of the beam covered by discs of radius b(θ): f = πb²nt.',
          explain: t`$d = ${fmt(d, 3)}$ fm, $b = ${fmt(b, 3)}$ fm, so $f = \pi(${fmt(b, 3)}\times10^{-15})^2(${tex(N_AU, 3)})(${tUm}\times10^{-6}) = ${tex(f, 3)}$ — about one alpha in $${tex(1 / f, 2)}$.`,
          visual: foilFace,
        };
      },
    }),
    num({
      id: 'touch', difficulty: 3,
      gen(r) {
        const [name, Z, A] = r.pick([['aluminium', 13, 27], ['magnesium', 12, 24], ['carbon', 6, 12], ['silicon', 14, 28]]);
        const Rs = R.nuclearRadius(A) + R.nuclearRadius(4), K = (2 * Z * KE2) / Rs;
        return {
          prompt: t`Nuclei are not points. Take a ${name} nucleus ($Z = ${Z}$, $A = ${A}$) to have radius $1.2\,A^{1/3}$ fm and an alpha $1.2\times4^{1/3}$ fm. Above what kinetic energy does a head-on alpha reach the ${name} nucleus’s surface, so that Rutherford’s formula must fail? Answer in MeV.`,
          answer: K, units: 'MeV', tol: { rel: 0.01 },
          errors: [{ value: (2 * Z * KE2) / R.nuclearRadius(A), feedback: 'The alpha has a size too: contact happens when the centres are R(target) + R(alpha) apart.' }],
          hints: [t`Contact when the centres are $R_\text{${name}} + R_\alpha = 1.2(${A}^{1/3} + 4^{1/3})$ fm apart.`, t`Set the head-on distance $d = 2Ze^2/(4\pi\varepsilon_0K)$ equal to that: $K = \dfrac{2\times${Z}\times1.440\ \text{MeV fm}}{${fmt(Rs, 3)}\ \text{fm}}$.`],
          teach: 'Rutherford’s formula holds only while the alpha stays outside the nucleus; the energy where it starts to fail measures the nuclear radius.',
          explain: t`$R + R_\alpha = ${fmt(Rs, 3)}$ fm, so $K = ${fmt(K, 3)}$ MeV. Above this, scattering from light nuclei departs from $1/\sin^4(\theta/2)$ — which is how the first nuclear sizes, a few femtometres, were measured in the 1920s. For gold the same energy is ${fmt(R.touchingEnergy(79, 197), 3)} MeV, far above natural alphas.`,
          visual: still({ K: 10, target: 'aluminium', b: 0, hide: ['rmin'] }, 'A 10 MeV alpha meeting an aluminium nucleus head-on: at this energy it reaches the surface. Distances to scale in fm.'),
        };
      },
    }),
    mcq({
      id: 'scaling', difficulty: 2,
      prompt: 'You double the alphas’ kinetic energy and keep everything else the same. How does the number counted at a fixed angle change?',
      choices: ['It falls to a quarter', 'It halves', 'It doubles', 'It does not change: the angle is fixed'],
      answer: 0,
      why: {
        1: t`The cross-section goes as $d^2$, and $d \propto 1/K$, so it goes as $1/K^2$, not $1/K$.`,
        2: 'Faster alphas are harder to turn: fewer, not more, reach any given angle.',
        3: t`The angle is fixed, but the impact parameter needed for it, $b = \tfrac d2\cot(\theta/2)$, halves — and the target area $\pi b^2$ with it, to a quarter.`,
      },
      hints: [t`$\dfrac{d\sigma}{d\Omega} = \left(\dfrac{d}{4}\right)^2\dfrac{1}{\sin^4(\theta/2)}$ with $d = zZe^2/4\pi\varepsilon_0K$.`],
      teach: 'The Rutherford cross-section scales as (Z/K)²: double the energy and a quarter as many alphas reach a given angle.',
      explain: t`$d \propto Z/K$, and every area in the problem scales as $d^2$: doubling $K$ halves every $b$ and quarters the cross-section. Geiger and Marsden checked this $1/K^2$ by slowing their alphas with mica sheets; they also checked the $Z^2$ with different foils.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 180], y: [0, 5.2], aspect: 'wide', xlabel: 'scattering angle θ (degrees)', ylabel: 'relative count', ylog: true, xticks: 6,
          curves: [{ fn: '-4*log(sin(x*pi/360)) + log(4)', domain: [9, 180], color: 'accent', width: 2.4, label: 'energy K', labelAt: 60, labelDx: 8, labelDy: -10 }, { fn: '-4*log(sin(x*pi/360))', domain: [9, 180], color: 'gold', width: 2.4, label: 'energy 2K: ?', labelAt: 100, labelDx: 8, labelDy: 14 }],
        },
        caption: 'Rutherford’s law at two alpha energies, on a logarithmic scale. How far apart the curves sit is the question.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sojourner', difficulty: 3, transfer: true,
      gen(r) {
        const [name, M] = r.pick([['oxygen-16', M_O16], ['silicon-28', M_SI28], ['iron-56', M_FE56]]);
        const m = M_HE4, K = 5.80, k = ((M - m) / (M + m)) ** 2;
        return {
          prompt: t`The Sojourner rover (Mars, 1997) carried a spectrometer that fired 5.80 MeV alphas from curium-244 at rocks and measured the energies of those bounced straight back. Treating a bounce from a single nucleus as a head-on elastic collision, what energy does an alpha keep after rebounding from ${name}? (Masses: alpha 4.0026 u; ${name} ${fmt(M, 5)} u.)`,
          answer: K * k, units: 'MeV', tol: { rel: 0.005 },
          errors: [{ value: K * Math.abs((M - m) / (M + m)), feedback: 'The speed keeps the fraction (M − m)/(M + m); the kinetic energy keeps its square.' }, { value: K * (4 * m * M) / (M + m) ** 2, feedback: 'That is the energy the nucleus takes. The alpha keeps the rest.' }],
          hints: [t`In a head-on elastic collision with a nucleus at rest, the alpha rebounds with speed $v' = \dfrac{M - m}{M + m}v$.`, t`So $K' = K\left(\dfrac{M - m}{M + m}\right)^2$.`],
          teach: 'In Rutherford backscattering the energy an alpha keeps reveals the mass of the nucleus it bounced off.',
          explain: t`$K' = 5.80\left(\dfrac{${fmt(M, 5)} - 4.0026}{${fmt(M, 5)} + 4.0026}\right)^2 = ${fmt(K * k, 3)}$ MeV. Heavy nuclei send alphas back with most of their energy, light ones with less — so the energy spectrum of the backscattered alphas reads off which elements are in the rock.`,
          visual: rbs,
        };
      },
    }),
    num({
      id: 'cp-rmin', difficulty: 2,
      gen(r) {
        const th = r.pick([60, 90, 120]), K = r.pick([5.0, 7.69]);
        const d = R.collisionDiameter(K, 79), rm = (d / 2) * (1 + 1 / Math.sin((th * DEG) / 2));
        return {
          prompt: t`A ${K} MeV alpha is scattered by a gold nucleus through ${th}°. How close did it come to the nucleus, in fm? ($d = ${fmt(d, 3)}$ fm; the closest approach is $r_{\min} = \tfrac{d}{2}\left(1 + \dfrac{1}{\sin(\theta/2)}\right)$.)`,
          answer: rm, units: 'fm', tol: { rel: 0.005 },
          errors: [{ value: d, feedback: t`$d$ is the head-on distance. An alpha deflected through less than 180° stays farther away.` }],
          hints: [t`$\sin(${th / 2}°) = ${fmt(Math.sin((th * DEG) / 2), 4)}$.`],
          teach: 'Only a head-on alpha gets as close as d; one scattered through θ turns at (d/2)(1 + 1/sin(θ/2)).',
          explain: t`$r_{\min} = ${fmt(d / 2, 4)}\times\left(1 + \dfrac{1}{${fmt(Math.sin((th * DEG) / 2), 4)}}\right) = ${fmt(rm, 3)}$ fm.`,
          visual: still({ K, target: 'gold', b: +R.impactParameter(th * DEG, d).toFixed(1), hide: ['rmin'] }),
        };
      },
    }),
    mcq({
      id: 'cp-conclusion', difficulty: 2,
      prompt: 'What did the alphas scattered through large angles show about the atom?',
      choices: [
        'Its positive charge and nearly all its mass are concentrated in a nucleus far smaller than the atom',
        'Electrons orbit the nucleus on fixed circular paths',
        'The atom is mostly solid, so alphas often hit something',
        'The positive charge is spread evenly through the atom',
      ],
      answer: 0,
      why: {
        1: 'Scattering of alphas says nothing about how electrons move; Bohr’s orbits came two years later, and quantum mechanics replaced them.',
        2: 'The opposite: almost every alpha went straight through. The atom is mostly empty, with a tiny, dense core.',
        3: 'That is Thomson’s model, which cannot turn alphas through large angles at all.',
      },
      hints: ['Only a strong electric field can turn a heavy, fast alpha around. Where would such a field be?'],
      teach: 'Rare large-angle scattering means a tiny, heavy, charged nucleus; frequent straight passage means mostly empty space.',
      explain: 'Most alphas pass undeflected, so the atom is mostly empty; a few turn sharply, which takes a strong field from concentrated positive charge — and they follow 1/sin⁴(θ/2), the signature of a point-like nucleus, until they come within a few femtometres of it.',
      visual: still({ K: 7.7, target: 'gold', b: 6, panel: 'counts' }, 'The beam meeting a gold nucleus, and Geiger and Marsden’s 1913 counts against Rutherford’s curve.'),
    }),
  ],
  sources: [
    { label: 'Rutherford (1911), The scattering of α and β particles by matter and the structure of the atom, Phil. Mag. 21, 669', url: 'https://doi.org/10.1080/14786440508637080' },
    { label: 'Geiger & Marsden (1913), The laws of deflexion of α particles through large angles, Phil. Mag. 25, 604', url: 'https://doi.org/10.1080/14786440408634197' },
    { label: 'Geiger & Marsden (1909), On a diffuse reflection of the α-particles, Proc. R. Soc. A 82, 495', url: 'https://doi.org/10.1098/rspa.1909.0054' },
    { label: 'Rieder et al. (1997), The chemical composition of Martian soil and rocks returned by the mobile alpha proton X-ray spectrometer, Science 278, 1771', url: 'https://doi.org/10.1126/science.278.5344.1771' },
  ],
});
