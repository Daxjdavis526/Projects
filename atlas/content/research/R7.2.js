// Reproducing a published result from its methods section. Reproduction
// (same data and method) against replication (new data), after the National
// Academies' 2019 report; the workflow claim → inputs and conventions →
// rebuild → compare at the stated precision → hunt the differences. Running
// case: the light deflection at the Sun's limb, 4GM/(c²R), quoted as 1.75″
// (Will 2014): IAU 2015 nominal constants give 1.7512″, and an older solar
// radius (6.96 × 10⁸ m) moves the fourth figure. The GWOSC GW150914 tutorial
// whose scipy.signal.tukey call no longer exists (SciPy 1.18) as the code
// case; a Pantheon+ Ωm reproduction that ignores the covariance (hypothetical
// numbers, labelled); the GPS clock-rate offset −4.4647 × 10⁻¹⁰ (IS-GPS-200)
// reproduced from L_G − (3/2)GM/(c²a) as the transfer.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { pageBlocks, sci, SRC2 } from './_rs2.js';

const t = String.raw;
const GM = 1.3271244e20, C = 299792458, RSUN = 6.957e8, ARC = 180 / Math.PI * 3600;
const alpha = (R, b = 1) => 4 * GM / (C * C * R * b) * ARC;        // arcsec, impact parameter b solar radii
const A0 = alpha(RSUN), A_OLD = alpha(6.96e8);
// GPS: Earth's GM (IERS/WGS 84), L_G (IAU 2000 B1.9), a from half a sidereal day
const GME = 3.986004418e14, LG = 6.969290134e-10, TS = 86164.0905 / 2;
const AGPS = Math.cbrt(GME * TS * TS / (4 * Math.PI ** 2));
const GPS = LG - 1.5 * GME / (C * C * AGPS);

const deflPic = (caption, { readout = false, marks = [] } = {}) => ({
  type: 'graph',
  params: {
    x: [0.8, 6], y: [0, 2.3], aspect: 'wide', axesAt: 'edge', xlabel: 'impact parameter b (solar radii)', ylabel: 'deflection α (″)', xticks: 6, yticks: 4,
    curves: [
      { fn: `${A0.toFixed(5)}/x`, color: 'accent', width: 2.2, label: 'GR: 4GM/(c²b)', labelAt: 2.6, labelDy: -14 },
      { fn: `${(A0 / 2).toFixed(5)}/x`, color: 'ink3', dash: [6, 4], label: 'half: 2GM/(c²b)', labelAt: 1.6, labelDy: 22 },
    ],
    vlines: [{ x: 1, label: 'limb', color: 'gold' }],
    points: marks,
    ...(readout ? { readouts: [{ label: 'α at the limb', expr: `${A0.toFixed(5)}`, unit: '″', digits: 5 }] } : {}),
  },
  caption,
});

// a tukey (α = 1/8) window against a Blackman window on a 0–1 record
const TUKEY = 'step(0.0625 - min(x, 1 - x))*0.5*(1 - cos(2*pi*min(x, 1 - x)/0.125)) + step(min(x, 1 - x) - 0.0625)';
const windowPic = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 1], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'position in the data segment', ylabel: 'window weight', xticks: 5, yticks: 3,
    curves: [{ fn: TUKEY, color: 'accent', width: 2.2, label: 'Tukey, α = 1/8', labelAt: 0.5, labelDy: -12 }, { fn: '0.42 - 0.5*cos(2*pi*x) + 0.08*cos(4*pi*x)', color: 'gold', dash: [6, 4], label: 'Blackman', labelAt: 0.3, labelDy: 16 }],
  },
  caption,
});

// reproduce vs replicate, as a 2 × 2 grid
const grid = (hl, caption) => pageBlocks([
  { x0: 0, x1: 0.5, y0: 0.5, y1: 1, label: 'same data, same method: reproduce', color: 'accent', alpha: hl === 0 ? 0.55 : 0.18 },
  { x0: 0.5, x1: 1, y0: 0.5, y1: 1, label: 'same data, new method: robustness', color: 'violet', alpha: hl === 1 ? 0.55 : 0.18 },
  { x0: 0, x1: 0.5, y0: 0, y1: 0.5, label: 'new data, same method: replicate', color: 'gold', alpha: hl === 2 ? 0.55 : 0.18 },
  { x0: 0.5, x1: 1, y0: 0, y1: 0.5, label: 'new data, new method: generalize', color: 'teal', alpha: hl === 3 ? 0.55 : 0.18 },
], { W: 1, H: 1, caption, extra: { aspect: 'wide' } });

export default lesson({
  id: 'research.R7.2',
  title: 'Reproducing a published result',
  minutes: 14, difficulty: 2,
  intro: t`To **reproduce** a result is to get the paper’s number from the same data and the same method; to **replicate** it is to get a consistent answer from new data. Reproduction comes first, because it is the only way to be sure you understand what the authors did — and it is how most research projects begin.

The work is detective work on the methods section: pin down the **claim** (the number, its uncertainty, its conditions), list every **input and convention** (constants, units, cuts, software versions), rebuild, and compare **at the precision the paper states**. The running case here is the bending of starlight grazing the Sun, which general relativity puts at

$$\alpha = \frac{4 G M_\odot}{c^2\, b}$$

and which the standard review quotes as $1.75''$ at the Sun’s limb.`,
  symbols: [
    { tex: '\\alpha', text: 'the deflection angle of a light ray passing the Sun, in radians (quoted in arcseconds, $1\'\' = 1/206\\,265$ rad)' },
    { tex: 'G M_\\odot', text: t`the Sun’s gravitational parameter, $1.327\,1244\times10^{20}\ \text{m}^3\,\text{s}^{-2}$ (IAU 2015 nominal value)` },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s (exact)` },
    { tex: 'b', text: t`the impact parameter: the ray’s closest distance to the Sun’s centre, in metres; at the limb it is the solar radius, $6.957\times10^{8}$ m (IAU 2015 nominal)` },
  ],
  why: t`Every project you start will build on someone’s published number, and you cannot extend a result you cannot reproduce.`,
  visual: {
    type: 'graph',
    title: 'One convention, one digit',
    lead: t`The deflection against the solar radius used for the limb. The review quotes $1.75''$ — three figures. Slide the radius between two conventions in use and watch which digit moves.`,
    tasks: ['Set R☉ = 6.957 (the IAU 2015 nominal radius): α = 1.7512″.', 'Set R☉ = 6.960, a value common in older references: α = 1.7504″.', 'Both round to the quoted 1.75″: at the paper’s precision the result is reproduced either way.'],
    params: {
      x: [6.94, 6.98], y: [1.745, 1.756], aspect: 'wide', axesAt: 'edge', xlabel: 'solar radius used (10⁸ m)', ylabel: 'α at the limb (″)', xticks: 4, yticks: 4,
      sliders: [{ key: 'R', label: t`solar radius $R_\odot$`, min: 6.945, max: 6.975, step: 0.001, value: 6.965, unit: t`10^{8}\ \text{m}`, explain: 'The radius taken for the limb. Its value depends on how the Sun’s edge is defined and on the year of the reference.' }],
      curves: [{ fn: `${(4 * GM / (C * C) / 1e8 * ARC).toFixed(6)}/x`, color: 'accent', width: 2.2 }],
      shade: [{ fn: '1.755', lower: '1.745', from: 6.94, to: 6.98, color: 'gold', alpha: 0.12 }],
      points: [{ x: 'R', y: `${(4 * GM / (C * C) / 1e8 * ARC).toFixed(6)}/R`, color: 'gold', r: 5 }, { x: 6.957, y: 1.7542, r: 0, label: 'IAU 2015', color: 'ink2', labelDx: -62, labelDy: 0 }, { x: 6.96, y: 1.7462, r: 0, label: 'older', color: 'ink2', labelDx: 5, labelDy: 0 }],
      vlines: [{ x: 6.957, color: 'ink3' }, { x: 6.96, color: 'ink4' }],
      readouts: [{ label: t`$\alpha$ at the limb`, expr: `${(4 * GM / (C * C) / 1e8 * ARC).toFixed(6)}/R`, unit: '″', digits: 5 }],
    },
    caption: 'The gold band is every value that rounds to the quoted 1.75″. GM☉ is held at the IAU 2015 nominal value; the curve is the formula above, nothing more.',
  },
  example: {
    prompt: t`The review states that a ray grazing the Sun is deflected by $\tfrac12(1 + \gamma) \times 1.75''$. Reproduce the general-relativistic number from the formula, and decide whether you have.`,
    visual: deflPic('The deflection falls as 1/b: a ray passing at two solar radii bends half as much. The dashed curve is half the GR value, the size of a purely Newtonian estimate.'),
    steps: [
      { label: 'Pin the claim', text: t`$\gamma$ is a parameter of the post-Newtonian framework the review uses; general relativity has $\gamma = 1$, so the claim is $1.75''$, to **three significant figures**.` },
      { label: 'List the inputs', text: t`$GM_\odot = 1.327\,1244\times10^{20}\ \text{m}^3\text{s}^{-2}$, $c = 299\,792\,458$ m/s, $b = R_\odot = 6.957\times10^{8}$ m. Use $GM_\odot$ directly: it is known to ten figures, while $G$ and $M_\odot$ separately are known to only about four.` },
      { label: 'Compute', text: t`$\alpha = \dfrac{4 \times 1.327\,1244\times10^{20}}{(2.997\,924\,58\times10^{8})^2 \times 6.957\times10^{8}} = ${sci(4 * GM / (C * C * RSUN), 4)}$ rad.` },
      { label: 'Convert', text: t`$\times 206\,265''$ per radian: $\alpha = ${A0.toFixed(4)}''$.` },
      { label: 'Compare at the stated precision', text: t`$${A0.toFixed(4)}''$ rounds to $1.75''$: **reproduced**. Your fourth figure depends on which solar radius you take ($6.96\times10^8$ m gives $${A_OLD.toFixed(4)}''$), a convention the three-figure claim does not resolve — so do not quote more figures than you can defend.` },
    ],
    answer: t`$\alpha = ${A0.toFixed(4)}'' \approx 1.75''$: the published number is reproduced at its stated precision.`,
  },
  practice: [
    num({
      id: 'limb', difficulty: 1,
      prompt: t`With $GM_\odot = 1.327\,1244\times10^{20}\ \text{m}^3\text{s}^{-2}$ and $R_\odot = 6.957\times10^{8}$ m, compute the general-relativistic deflection of a ray grazing the Sun, $4GM_\odot/(c^2R_\odot)$, in arcseconds.`,
      visual: deflPic('The deflection against impact parameter; the gold line marks the limb.'),
      answer: A0, units: 'arcsec', tol: { rel: 0.002 },
      errors: [{ value: A0 / 2, feedback: t`That is $2GM/(c^2b)$ — half the general-relativistic value, the size of a Newtonian estimate. The factor is 4.` }, { value: A0 / ARC, feedback: 'That is in radians. Multiply by 206 265 for arcseconds.' }],
      hints: ['Compute the angle in radians first.', t`Then multiply by $206\,265$ arcseconds per radian.`],
      teach: 'Reproduce the headline number first, with the paper’s own formula and stated constants.',
      explain: t`$\alpha = ${sci(4 * GM / (C * C * RSUN), 4)}$ rad $= ${A0.toFixed(4)}''$, which rounds to the published $1.75''$.`,
    }),
    num({
      id: 'impact', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, 5, 8, 10]);
        const ans = alpha(RSUN, k);
        return {
          prompt: t`A radio source is observed with its line of sight passing ${k} solar radii from the Sun’s centre. What deflection does general relativity predict, in arcseconds? (At the limb it is $${A0.toFixed(4)}''$.)`,
          visual: deflPic('The deflection falls as 1/b.', { marks: [{ x: 1, y: +A0.toFixed(4), color: 'gold', r: 4, label: '1.7512″', labelDx: 8, labelDy: -4 }] }),
          answer: ans, units: 'arcsec', tol: { rel: 0.005 },
          errors: [{ value: A0 / (k * k), feedback: t`The deflection falls as $1/b$, not $1/b^2$.` }, { value: A0 * k, feedback: 'Farther from the Sun the deflection is *smaller*.' }],
          hints: [t`$\alpha \propto 1/b$.`, t`Divide the limb value by ${k}.`],
          teach: 'A formula’s scaling is part of the claim: check that your rebuild scales the same way.',
          explain: t`$${A0.toFixed(4)}''/${k} = ${ans.toFixed(4)}''$. Radio interferometers measure deflections of quasars far from the limb, where this $1/b$ law is what is tested.`,
        };
      },
    }),
    num({
      id: 'which-radius', difficulty: 3,
      prompt: t`Suppose a textbook quotes the limb deflection as $1.7505''$, while you get $${A0.toFixed(4)}''$ from the IAU constants. Assuming it used the same $GM_\odot$, what solar radius must it have used? Give it in metres.`,
      visual: deflPic('The same formula: only the radius taken for the limb differs.'),
      answer: 4 * GM / (C * C * (1.7505 / ARC)), units: 'm', tol: { rel: 5e-5 },
      errors: [{ value: RSUN, feedback: 'That is the radius you used. Solve the formula for b with α = 1.7505″.' }],
      hints: [t`Solve $\alpha = 4GM/(c^2 b)$ for $b$.`, t`Convert $1.7505''$ to radians first: divide by $206\,264.8$.`],
      teach: 'When your number differs in a late digit, solve for the input that would explain it — then look for that convention in the source.',
      explain: t`$b = 4GM_\odot/(c^2\alpha) = ${sci(4 * GM / (C * C * (1.7505 / ARC)), 5)}$ m — the round value $6.96\times10^{8}$ m used before the IAU fixed a nominal radius in 2015. The two numbers agree; they just define the limb differently.`,
    }),
    mcq({
      id: 'reproduce-replicate', difficulty: 2,
      prompt: 'You download LIGO’s public strain data for GW150914, run the analysis described in the discovery paper, and find the signal at the paper’s arrival time. What have you done?',
      visual: grid(0, 'Four ways to check a result, by whether the data and the method are the same as the paper’s.'),
      choices: ['Reproduced the result: the same data analysed by the same method', 'Replicated the result: an independent confirmation of the event', 'Generalized it to a new kind of source', 'Nothing useful, since the answer was already known'],
      answer: 0,
      why: { 1: 'Replication needs new data — another detector, or another event — not the same strain re-analysed.', 2: 'Same source, same data: nothing has been generalized.', 3: 'A reproduction tests your understanding of the method, and catches errors in it; it is where new work starts.' },
      hints: ['Same data or new? Same method or new?'],
      teach: 'Reproduction re-analyses the same data by the same method, while replication gathers new data.',
      explain: 'The same data and the same method: a reproduction. It confirms the analysis can be carried out as described — and it is the foundation for anything you change next.',
    }),
    mcq({
      id: 'tukey', difficulty: 3, kind: 'error',
      prompt: t`You rerun the 2016 GW150914 tutorial today. It stops with

\`\`\`
    dwindow = signal.tukey(template.size, alpha=1./8)
AttributeError: module 'scipy.signal' has no attribute 'tukey'
\`\`\`

What fix keeps the published method?`,
      visual: windowPic('A Tukey window (flat, with short cosine tapers) and a Blackman window on the same segment. They weight the data differently, so they are different methods.'),
      choices: [
        t`Call \`scipy.signal.windows.tukey(template.size, alpha=1./8)\` — the same function, moved to the \`windows\` module — and record the SciPy version`,
        'Swap in a Blackman window, which the tutorial’s own fallback used',
        'Delete the window line, since windowing is a detail',
        t`Wrap the line in \`try: … except: pass\` so the notebook runs to the end`,
      ],
      answer: 0,
      why: { 1: 'A Blackman window tapers almost the whole segment: it changes the filter, so the numbers will change. (The tutorial’s bare-except fallback also called a function that has since moved.)', 2: 'An unwindowed segment leaks power at its sharp edges: a different method, different SNRs.', 3: 'Then `dwindow` is never defined and the next line fails — or worse, an old value is used silently.' },
      hints: ['The function still exists in SciPy, in a sub-module.', 'Which fix leaves the analysis mathematically the same?'],
      teach: 'Code rots as libraries move: fix the call without changing the method, then pin and record the versions.',
      explain: t`SciPy moved its window functions to \`scipy.signal.windows\` and later removed the old names. Calling the moved function reproduces the method exactly; recording the version (or pinning it in an environment file) stops it rotting again. The tutorial pinned no versions, so it was always going to break.`,
    }),
    order({
      id: 'workflow', difficulty: 2,
      prompt: 'Put the steps of reproducing a published number in order.',
      visual: grid(0, 'Reproduction lives in the top-left square: the paper’s data and the paper’s method.'),
      items: [
        'Write down the claim: the value, its uncertainty, and the conditions it holds under',
        'List every input and convention the methods section uses (constants, units, cuts, versions)',
        'Get the same data and rebuild the method',
        'Compare your number with the claim at the precision the paper states',
        'If they differ, change one input at a time until the difference is explained',
      ],
      hints: ['You cannot compare before you know exactly what was claimed.', 'Hunting differences comes last — and one change at a time.'],
      teach: 'Claim, inputs, rebuild, compare at the stated precision, then explain any difference one input at a time.',
      explain: 'Writing the claim first stops you moving the goalposts; listing conventions first makes the hunt short. Changing one thing at a time is bisection again — this time over inputs instead of commits.',
    }),
    code({
      id: 'deflection', difficulty: 2,
      prompt: t`Write \`deflection_arcsec(GM, b)\` returning the deflection $4GM/(c^2 b)$ in **arcseconds** ($GM$ in $\text{m}^3\text{s}^{-2}$, $b$ in metres). Then set \`ratio\` to the deflection with $b = 6.957\times10^{8}$ m divided by the deflection with $b = 6.96\times10^{8}$ m (both with the IAU $GM_\odot$), to see how big the convention effect is.`,
      starter: t`import math

c = 299792458.0          # m/s
GM_sun = 1.3271244e20    # m^3 s^-2

def deflection_arcsec(GM, b):
    pass

ratio = None
print(deflection_arcsec(GM_sun, 6.957e8), ratio)
`,
      answer: t`import math

c = 299792458.0          # m/s
GM_sun = 1.3271244e20    # m^3 s^-2

def deflection_arcsec(GM, b):
    alpha = 4 * GM / (c**2 * b)               # radians
    return alpha * 180 / math.pi * 3600       # arcseconds

ratio = deflection_arcsec(GM_sun, 6.957e8) / deflection_arcsec(GM_sun, 6.96e8)
print(deflection_arcsec(GM_sun, 6.957e8), ratio)
`,
      tests: [
        { name: 'the limb deflection is 1.7512″', code: 'abs(deflection_arcsec(GM_sun, 6.957e8) - 1.75119) < 1e-4' },
        { name: 'twice as far, half the deflection', code: 'abs(deflection_arcsec(GM_sun, 2 * 6.957e8) * 2 - deflection_arcsec(GM_sun, 6.957e8)) < 1e-9' },
        { name: 'the convention changes the result by 0.04%', code: 'ratio is not None and abs(ratio - 6.96 / 6.957) < 1e-9' },
      ],
      hints: ['Compute the angle in radians, then convert: 1 rad = 180/π × 3600 arcseconds.', '`ratio = deflection_arcsec(GM_sun, 6.957e8) / deflection_arcsec(GM_sun, 6.96e8)`'],
      teach: 'A rebuild in code makes every input visible — and lets you vary one at a time.',
      explain: t`The limb value is $${A0.toFixed(4)}''$, and the ratio is $6.96/6.957 = ${(6.96 / 6.957).toFixed(5)}$: the solar-radius convention moves the answer by ${((6.96 / 6.957 - 1) * 100).toFixed(2)}%, far below the precision of the published $1.75''$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      prompt: t`GPS satellite clocks are deliberately set to run slow before launch, by a fractional rate $\Delta f/f$ fixed in the GPS interface specification (IS-GPS-200), so that in orbit they keep time with clocks on Earth. A methods section explains the number as

$$\frac{\Delta f}{f} = -\Bigl(L_G - \frac{3}{2}\frac{GM_\oplus}{c^2 a}\Bigr)$$

with $L_G = 6.969\,290\,134\times10^{-10}$ (the geoid’s potential divided by $c^2$, a defined constant), $GM_\oplus = 3.986\,004\,418\times10^{14}\ \text{m}^3\text{s}^{-2}$ and the orbit’s semi-major axis $a = ${(AGPS / 1e3).toFixed(1)}$ km. Reproduce the size of the offset, $L_G - \tfrac32 GM_\oplus/(c^2a)$.`,
      visual: { type: 'graph', params: { x: [0, 30], y: [0, 7.5], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from Earth’s centre (thousand km)', ylabel: 'GM/(c²r) (×10⁻¹⁰)', xticks: 6, yticks: 3, curves: [{ fn: `${(GME / (C * C) * 1e10 / 1e6).toFixed(5)}/x`, domain: [6.371, 30], color: 'accent', width: 2 }], vlines: [{ x: 6.371, label: 'ground', color: 'good' }, { x: +(AGPS / 1e6).toFixed(3), label: 'GPS orbit', color: 'gold' }] }, caption: 'The gravitational potential (over c²) falls from the ground to the orbit: the orbiting clock runs faster for that reason, and slower for its speed.' },
      answer: GPS, tol: { rel: 0.0005 },
      errors: [{ value: LG - GME / (C * C * AGPS), feedback: t`You left out the speed term: the orbit contributes $GM/(c^2a)$ from height **and** $\tfrac12 GM/(c^2a)$ from $v^2/(2c^2)$, hence the $\tfrac32$.` }, { value: LG - 0.5 * GME / (C * C * AGPS), feedback: t`The factor is $\tfrac32$, not $\tfrac12$.` }],
      hints: [t`$GM_\oplus/c^2 = ${(GME / (C * C) * 1e3).toFixed(4)}$ mm; divide by $a$ in metres.`, t`Multiply that by $\tfrac32$ and subtract from $L_G$.`],
      teach: 'A spec’s magic number reproduced from its physics is a number you understand.',
      explain: t`$GM_\oplus/(c^2a) = ${sci(GME / (C * C * AGPS), 6)}$, so $L_G - \tfrac32 \times$ that $= ${sci(GPS, 5)}$ — the specification’s $\Delta f/f = -4.4647\times10^{-10}$, reproduced to all five figures. A simpler model with a non-rotating spherical Earth of radius 6371 km gives $4.457\times10^{-10}$: close, but the fifth figure needs the geoid.`,
    }),
    mcq({
      id: 'cp-pantheon', difficulty: 3,
      prompt: t`Suppose you reproduce the Pantheon+ matter density from the public distance moduli and get $\Omega_m = 0.350$ with $\chi^2/\nu = 0.44$, while the paper reports $0.334 \pm 0.018$. Which difference from the paper’s methods do you check first? (Illustrative numbers.)`,
      visual: grid(0, 'A reproduction: same data, same method — if the method really is the same.'),
      choices: ['Whether you used the full statistical-plus-systematic covariance matrix, as the paper did, instead of only the diagonal errors', 'Whether your Python version matches theirs', 'Whether $0.350$ is within $1\\sigma$, so that nothing needs checking', 'Whether the speed of light you used is right'],
      answer: 0,
      why: { 1: 'Python versions rarely move a fit by a whole standard deviation; a missing piece of the method does.', 2: 'Agreement within 1σ does not make a missing step harmless — and χ²/ν = 0.44 is far too small to be a healthy fit.', 3: 'c is exact; it cannot be the culprit.' },
      hints: [t`A $\chi^2/\nu$ far below 1 means the errors you used are wrong — too large, or correlated in a way you ignored.`, 'Supernovae share calibration errors: how does the paper describe its uncertainties?'],
      teach: t`A $\chi^2/\nu$ far below 1 in a reproduction points to an uncertainty model different from the paper’s.`,
      explain: t`Supernova distances share systematic errors (calibration, dust, selection), recorded in a covariance matrix. Diagonal errors alone treat each supernova as independent: the fit shifts and $\chi^2/\nu$ collapses. [Covariance and correlated errors](#/lesson/lab.A6.3) explains why; project [P.2](#/lesson/research.P.2) fits the Hubble diagram itself.`,
    }),
    mcq({
      id: 'cp-precision', difficulty: 2,
      prompt: t`A paper states a result as $42.98''$ per century. Your rebuild gives $42.9807''$. How do you report the comparison?`,
      visual: deflPic('As with the deflection: a claim can only be checked to the precision at which it is stated.'),
      choices: ['Reproduced to the four figures the paper states; your extra digits test nothing the paper claimed', 'Not reproduced, because 42.9807 ≠ 42.98', 'Reproduced to six figures', 'A new, more precise measurement of the effect'],
      answer: 0,
      why: { 1: '42.9807 rounds to 42.98: equal at the stated precision.', 2: 'The paper’s value has four figures; the agreement cannot be better than the claim.', 3: 'A rebuild of a formula measures nothing — it checks arithmetic and conventions.' },
      hints: ['How many figures did the paper commit to?'],
      teach: 'Compare at the precision the paper states, and say so.',
      explain: 'Rounded to the paper’s four figures, your value is 42.98: reproduced. More digits in your rebuild come from your conventions, not from the paper.',
    }),
  ],
  sources: [SRC2.nasem, SRC2.will, SRC2.iau2015, SRC2.losc, SRC2.scipyWin, { label: 'IS-GPS-200, NAVSTAR GPS Space Segment/Navigation User Interfaces (relativistic clock-rate offset Δf/f = −4.4647 × 10⁻¹⁰)', url: 'https://www.gps.gov/technical/icwg/' }, { label: 'N. Ashby, “Relativity in the Global Positioning System”, Living Rev. Relativ. 6, 1 (2003)', url: 'https://doi.org/10.12942/lrr-2003-1' }, SRC2.brout],
});
