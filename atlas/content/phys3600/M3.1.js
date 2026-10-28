// Conductors in equilibrium (Griffiths §2.5.1–2.5.3): the five properties
// that follow from E = 0 inside, the induced charge on the walls of a cavity
// (and why the outer surface does not care where the cavity's charge sits),
// E = σ/ε₀ just outside, the electrostatic pressure σ²/2ε₀ (with the average
// field), and charge crowding where the surface curves sharply. Transfer:
// corona at an aircraft's static-discharge wick. Builds on phys2220.E3.4.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, KC, sf, field } from './_bvp.js';

const t = String.raw;

/** The field's normal component through a conductor's surface: 0 inside, σ/ε₀ outside, the average dashed (graph). */
const surfaceFieldPic = (caption, { avg = true } = {}) => ({
  type: 'graph',
  params: {
    x: [-2, 2], y: [-0.15, 1.3], aspect: 'wide', xlabel: 'distance across the surface', ylabel: 'E⊥ / (σ/ε₀)', xticks: 0,
    shade: [{ fn: '1.3', lower: '-0.15', from: -2, to: 0, color: 'ink3', alpha: 0.18 }],
    curves: [{ fn: '0', domain: [-2, 0], color: 'accent', width: 3 }, { fn: '1', domain: [0, 2], color: 'accent', width: 3 }],
    hlines: avg ? [{ y: 0.5, color: 'gold', label: 'average, σ/2ε₀' }] : [],
    vlines: [{ x: 0, color: 'warn', label: 'surface' }],
    points: [{ x: -1.75, y: 1.15, r: 0, label: 'metal' }, { x: 1, y: 1.15, r: 0, label: 'outside' }],
  },
  caption,
});

export default lesson({
  id: 'phys3600.M3.1',
  title: 'Conductors in equilibrium',
  minutes: 15, difficulty: 3,
  equation: t`\vec E_{\text{inside}} = 0, \qquad \vec E_{\text{just outside}} = \frac{\sigma}{\varepsilon_0}\,\hat n, \qquad f = \frac{\sigma^2}{2\varepsilon_0}`,
  intro: t`A conductor has charges free to move, so in equilibrium they have moved until the field inside the metal **vanishes** — any leftover field would push them further. Everything else follows. Gauss’s law with $\vec E = 0$ gives $\rho = 0$ inside: any net charge sits on the surface. $\vec E = -\nabla V = 0$ makes the whole conductor **one equipotential**. The jump condition of [M2.2](#/lesson/phys3600.M2.2), with zero field below, makes the field just outside perpendicular to the surface with size $\sigma/\varepsilon_0$. And the surface charge feels an outward pull, a pressure $f = \sigma^2/2\varepsilon_0$ — using the **average** of the fields on the two sides, since a charge does not push on itself. You met conductors in [Physics II](#/lesson/phys2220.E3.4); here are the cavities, the pressure and the proofs.`,
  symbols: [
    { tex: '\\vec E_{\\text{inside}}', text: 'the field within the conducting material, in V/m' },
    { tex: '\\sigma', text: 'the surface charge density at a point of the surface, in C/m²' },
    { tex: '\\hat n', text: 'the outward unit normal to the surface there' },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}\ \text{F/m}$` },
    { tex: 'f', text: 'the outward force per unit area on the surface charge, in N/m² (Pa)' },
  ],
  why: t`Shielding of instruments and spacecraft electronics, the charge on a satellite in the solar wind, corona at sharp points, and the boundary condition “V = constant” that every boundary-value problem of module M4 starts from.`,
  visual: {
    type: 'em-field',
    title: 'A charge inside a hollow conductor',
    lead: t`A thick spherical metal shell (grey) with a hollow cavity. Drag the charge inside the cavity, and the one outside. The $+$ and $-$ marks show the surface charge each surface carries.`,
    tasks: [
      t`Move the cavity charge off-centre: the inner wall’s charge crowds toward it, but the **outer** surface’s charge, and the field outside, do not change at all.`,
      t`Drag the outside charge close: the outer surface rearranges, but nothing inside the cavity changes — the shell shields each side from the other.`,
      t`Put the probe in the metal: $E = 0$ and $V$ equals the conductor’s potential, wherever you put it.`,
    ],
    params: {
      unit: 'cm', qunit: 'nC', x: [-12, 12], y: [-7, 7],
      conductor: { x: 0, y: 0, R: 4.5, a: 2.6, Q: 'Qc' },
      charges: [{ x: 0.9, y: 0.4, q: 'q', drag: true }, { x: 8.5, y: 3, q: 'qo', drag: true }],
      fieldLines: true, density: 12, equip: false, arrows: false, probe: { x: -3.5, y: -1.5, label: 'P' }, readouts: ['E', 'V', 'Vc'],
      toggles: ['fieldLines', 'equip'],
      sliders: [
        { key: 'q', label: t`Charge in the cavity`, min: -4, max: 4, step: 0.5, value: 2, unit: t`\text{nC}`, explain: 'Its field lines must end on the cavity wall: the wall carries exactly −q.' },
        { key: 'Qc', label: t`Net charge on the conductor`, min: -4, max: 4, step: 0.5, value: 0, unit: t`\text{nC}`, explain: 'Whatever the inner wall does not take sits on the outer surface: Q + q.' },
        { key: 'qo', label: t`Charge outside`, min: -4, max: 4, step: 0.5, value: -2, unit: t`\text{nC}`, explain: 'It rearranges the outer surface only.' },
      ],
    },
    caption: t`A slice through the centre of a spherical shell; the solution is exact (image charges). The number of $\pm$ marks follows the local surface charge density. Field lines are drawn in the slice, so their spacing is only a rough guide to strength.`,
  },
  example: {
    prompt: t`A point charge $q = 2$ nC sits at the centre of a conducting spherical shell with inner radius $a = 3$ cm, outer radius $b = 5$ cm and net charge $Q = 5$ nC. Find the charge on each surface and the potential of the shell, with $V(\infty) = 0$.`,
    visual: field({ x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 5, a: 3, Q: 5 }, charges: [{ x: 0, y: 0, q: 2 }], fieldLines: true, density: 14, equip: true, dV: 300 }, t`The charge, the shell (grey) and its surface charges, field lines and equipotentials (violet, every 300 V). No field lines and no equipotentials cross the metal.`),
    steps: [
      { label: 'Inner surface', text: t`A Gaussian sphere inside the metal ($a < r < b$) has $\vec E = 0$ on it, so it encloses zero charge: the inner surface carries $-q = -2$ nC.` },
      { label: 'Outer surface', text: t`The shell’s net charge is $Q = 5$ nC, so the outer surface holds $Q + q = 7$ nC. It spreads uniformly: nothing outside breaks the symmetry.` },
      { label: 'Field', text: t`Outside, $E = k(Q + q)/r^2$; in the metal, $0$; in the cavity, $kq/r^2$ — only the point charge, since the uniform inner and outer shells add nothing inside themselves.` },
      { label: 'Potential', text: t`Come in from infinity: $V(b) = \dfrac{k(Q + q)}{b} = \dfrac{(8.988\times10^9)(7\times10^{-9})}{0.05} \approx ${nice(sf((KC * 7e-9) / 0.05, 4))}$ V. The whole shell sits at this potential.` },
      { label: 'Sense check', text: t`Move $q$ off-centre: the inner charge rearranges, but it is still $-q$ in total, the outer surface still holds $Q + q$ uniformly, and $V$ of the shell does not change.` },
    ],
    answer: t`Inner surface $-2$ nC, outer $+7$ nC; the shell is at $\approx ${nice(sf((KC * 7e-9) / 0.05, 3))}$ V.`,
  },
  practice: [
    num({
      id: 'surfaces', difficulty: 2,
      gen(r) {
        const q = r.pick([-3, 2, 4]), Q = r.pick([-5, 1, 6]);
        return {
          prompt: t`A charge of $${q}$ nC sits inside a cavity in a conductor whose net charge is $${Q}$ nC. How much charge is on the conductor’s **outer** surface?`,
          visual: field({ x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 4.5, a: 2.5, Q }, charges: [{ x: 0.8, y: 0.5, q }], fieldLines: false, equip: false }, t`The conductor (grey) with the charge in its cavity. The $\pm$ marks show how the surface charge is spread; count the total from Gauss’s law.`),
          answer: Q + q, units: 'nC', tol: { rel: 0, abs: 0.05 },
          errors: [{ value: Q, feedback: t`The inner wall takes $${-q}$ nC to cancel the cavity charge, and the conductor’s total is fixed, so the outer surface must make up the difference.` }, ...(Q - q !== Q + q ? [{ value: Q - q, feedback: t`The inner wall carries $-q$; the outer surface carries the rest of $Q$: $Q - (-q) = Q + q$.` }] : [])],
          hints: [t`A Gaussian surface inside the metal, round the cavity, has $\vec E = 0$ on it: the charge it encloses is zero.`, t`Inner wall: $-q$. Outer surface: $Q - (-q)$.`],
          teach: 'The cavity wall cancels the charge inside it exactly; the outer surface holds the conductor’s net charge plus the cavity charge.',
          explain: t`Inner wall $${-q}$ nC, so the outer surface holds $${Q} - (${-q}) = ${Q + q}$ nC — and outside, the field is that of $${Q + q}$ nC at the centre, wherever the cavity charge sits.`,
        };
      },
    }),
    mcq({
      id: 'cavity', difficulty: 2,
      prompt: t`A point charge sits inside an empty cavity in a block of metal. Is the field in the cavity zero?`,
      visual: field({ x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 4.5, a: 2.8, Q: 0 }, charges: [{ x: -1, y: 0.6, q: 3 }], fieldLines: true, density: 14 }, 'The charge in the cavity and the field lines it sends to the cavity wall.'),
      choices: ['No: the charge’s field lines run to the cavity wall, where the induced charge ends them', 'Yes: the field inside a conductor is always zero', 'Yes: the induced charge on the wall cancels the charge’s field everywhere in the cavity', 'Only if the charge is at the centre'],
      answer: 0,
      why: {
        1: t`$\vec E = 0$ holds in the **metal**. A cavity is not metal; with a charge in it, there is field.`,
        2: 'The wall’s charge cancels the field in the metal and beyond, not in the cavity.',
        3: 'At the centre or not, the cavity has field lines from the charge to the wall.',
      },
      hints: ['Where must the charge’s field lines end?'],
      teach: 'E = 0 in the conducting material, not in a cavity that holds charge.',
      explain: t`Field lines from the charge end on the induced $-q$ of the wall. The cavity is empty of field only when it holds no charge — a result that needs the uniqueness theorem ([M4.1](#/lesson/phys3600.M4.1)).`,
    }),
    num({
      id: 'pressure', difficulty: 3,
      gen(r) {
        const R = r.pick([5, 10, 20]), V0 = r.pick([50, 100, 200]);
        const sig = (EPS0 * V0 * 1e3) / (R / 100), f = (sig * sig) / (2 * EPS0);
        return {
          prompt: t`An isolated metal sphere of radius ${R} cm is charged to ${V0} kV. What outward pressure does the electrostatic force exert on its surface?`,
          visual: surfaceFieldPic(t`The normal field across the sphere’s surface: zero in the metal, $\sigma/\varepsilon_0$ just outside. A surface charge feels the average of the two.`),
          answer: f, units: 'Pa', tol: { rel: 0.01 },
          errors: [{ value: (sig * sig) / EPS0, feedback: t`A surface charge feels the **average** of the field just inside and just outside, $\sigma/2\varepsilon_0$ — not the full $\sigma/\varepsilon_0$, part of which is its own field.` }],
          hints: [t`For a sphere, $V = kQ/R$ and $\sigma = Q/4\pi R^2$, so $\sigma = \varepsilon_0V/R$.`, t`$f = \sigma\cdot\tfrac12\left(0 + \sigma/\varepsilon_0\right) = \sigma^2/2\varepsilon_0$.`],
          teach: 'The force per area on a conductor’s surface charge is σ times the average of the fields on the two sides: σ²/2ε₀, outward.',
          explain: t`$\sigma = \varepsilon_0V/R \approx ${tex(sig, 3)}\ \text{C/m}^2$, so $f = \dfrac{\sigma^2}{2\varepsilon_0} = \dfrac{\varepsilon_0V^2}{2R^2} \approx ${nice(sf(f, 3))}$ Pa, pulling outward whatever the sign of the charge. Small next to atmospheric pressure ($10^5$ Pa) — electrostatic forces only win when the gaps are tiny, as in MEMS devices.`,
        };
      },
    }),
    num({
      id: 'two-spheres', difficulty: 3,
      gen(r) {
        const R1 = r.pick([1, 2]), R2 = r.pick([5, 10, 20]);
        return {
          prompt: t`Two metal spheres, radii ${R1} cm and ${R2} cm, are far apart but joined by a thin wire, and the pair is given some charge. What is the ratio $\sigma_{\text{small}}/\sigma_{\text{large}}$ of their surface charge densities?`,
          visual: { type: 'graph', params: { x: [-1, 12], y: [-2.6, 2.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['0.4*cos(t)', '0.4*sin(t)'], t: [0, 2 * Math.PI], color: 'warn', width: 3 }, { param: ['9 + 2*cos(t)', '2*sin(t)'], t: [0, 2 * Math.PI], color: 'warn', width: 2 }, { fn: '0', domain: [0.4, 7], color: 'ink2', width: 1.5 }], shade: [{ fn: 'sqrt(max(4 - (x - 9)^2, 0))', lower: '-sqrt(max(4 - (x - 9)^2, 0))', from: 7, to: 11, color: 'ink3', alpha: 0.3 }, { fn: 'sqrt(max(0.16 - x^2, 0))', lower: '-sqrt(max(0.16 - x^2, 0))', from: -0.4, to: 0.4, color: 'ink3', alpha: 0.3 }], points: [{ x: 0, y: 0.4, r: 0, label: `${R1} cm`, labelDx: -10, labelDy: -6 }, { x: 9, y: 2, r: 0, label: `${R2} cm`, labelDx: -12, labelDy: -6 }, { x: 3.7, y: 0, r: 0, label: 'wire', labelDx: -10, labelDy: -10 }] }, caption: 'Two spheres joined by a wire, so they share one potential. Not to scale; far enough apart that each one’s charge stays uniform.' },
          answer: R2 / R1, tol: { rel: 0.01 },
          errors: [{ value: R1 / R2, feedback: t`That is the ratio of their **charges**, $Q_1/Q_2 = R_1/R_2$. Divide each by its area, $4\pi R^2$.` }, { value: (R2 / R1) ** 2, feedback: t`Equal potentials give $Q \propto R$ (not equal charges); then $\sigma = Q/4\pi R^2 \propto 1/R$.` }],
          hints: [t`Joined by a wire, they share one potential: $kQ_1/R_1 = kQ_2/R_2$.`, t`So $Q \propto R$, and $\sigma = Q/(4\pi R^2) \propto 1/R$.`],
          teach: 'At one potential, a smaller radius of curvature carries a larger surface charge density — and a stronger field just outside.',
          explain: t`$\sigma_{\text{small}}/\sigma_{\text{large}} = R_{\text{large}}/R_{\text{small}} = ${nice(R2 / R1)}$. The field just outside, $\sigma/\varepsilon_0$, is that much stronger at the small sphere: why charge leaks from sharp points, and why lightning rods are pointed.`,
        };
      },
    }),
    mcq({
      id: 'err-sheet', difficulty: 2, kind: 'error',
      prompt: t`A student says: “The field just outside a conductor is $\sigma/2\varepsilon_0$, like any sheet of charge.” What is wrong?`,
      visual: surfaceFieldPic('The normal field across a conductor’s surface.', { avg: false }),
      choices: [
        t`The field inside the metal is zero, so the whole jump $\sigma/\varepsilon_0$ appears on the outside`,
        t`Nothing: a conductor’s surface is a sheet of charge`,
        t`It should be $2\sigma/\varepsilon_0$, since the conductor has two faces`,
        t`The field outside a conductor is zero`,
      ],
      answer: 0,
      why: {
        1: t`A lone sheet’s field splits the jump $\sigma/\varepsilon_0$ equally, $\pm\sigma/2\varepsilon_0$. At a conductor the rest of the charges arrange the field inside to be zero, so all of the jump is outside.`,
        2: 'A pillbox at the surface has one face in the metal, with no flux: only the outer face counts, giving σ/ε₀.',
        3: 'Zero is the field inside the metal.',
      },
      hints: ['Draw a pillbox with one face inside the metal. How many faces carry flux?'],
      teach: 'At a conductor, E is σ/ε₀ just outside — the full jump — because the field inside is zero.',
      explain: t`The jump is always $\sigma/\varepsilon_0$; for a lone sheet it is shared as $\pm\sigma/2\varepsilon_0$, but at a conductor the field inside is zero, so it is all outside: $E = \sigma/\varepsilon_0$. The patch of surface charge itself still contributes only $\sigma/2\varepsilon_0$ on each side; the rest of the conductor’s charges supply the other half outside and cancel it inside.`,
    }),
    multi({
      id: 'shield', difficulty: 3,
      prompt: t`A neutral hollow metal box with an **empty** cavity sits in a strong external field. Which statements are true?`,
      visual: field({ x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 4, a: 2.5, Q: 0 }, uniform: [2000, 0], fieldLines: true, density: 14, equip: true }, 'A hollow metal sphere in a uniform field: field lines end on its outer surface; the cavity is empty of field.'),
      choices: ['The field in the cavity is zero', 'The cavity wall carries no surface charge', 'The outer surface carries no charge anywhere', 'The potential in the cavity equals the conductor’s potential', 'The field just outside the box is perpendicular to its surface'],
      answer: [0, 1, 3, 4],
      why: { 2: 'The external field induces + charge on one side and − on the other; only the total is zero.' },
      hints: [t`$V = $ the conductor’s constant value solves Laplace’s equation in the cavity and matches its boundary.`, 'By uniqueness that is the only solution — so E = 0 in the cavity, and Gauss then says no charge on the wall.'],
      teach: 'An empty cavity in a conductor is field-free whatever happens outside — guaranteed by the uniqueness theorem.',
      explain: t`In the cavity, $V = V_{\text{conductor}}$ satisfies Laplace’s equation and the boundary condition, so by uniqueness ([M4.1](#/lesson/phys3600.M4.1)) it is **the** solution: $\vec E = 0$, and the wall is uncharged. The outer surface carries $\pm$ induced charge, net zero, and the field leaves it perpendicularly. This is a Faraday cage — why a car or an aircraft shields its occupants, and why sensitive instruments live in metal boxes.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-wick', difficulty: 3, transfer: true,
      gen(r) {
        const rt = r.pick([0.05, 0.1, 0.2]);
        const V = 3e6 * rt * 1e-3;
        return {
          prompt: t`Aircraft charge up in flight (from ice crystals and engine exhaust) and shed it through **static wicks**: thin rods on the trailing edges ending in sharp points. Model a wick’s tip as a small conducting sphere of radius ${rt} mm, isolated from the rest of the aircraft’s charge, and take air to break down at 3 MV/m. At what potential does the field at the tip reach breakdown, so corona starts?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 3.3], aspect: 'wide', xlabel: 'distance from the tip (in tip radii)', ylabel: 'E / E(surface)', curves: [{ fn: '1/x^2', domain: [1, 3], color: 'accent', width: 2.6 }], shade: [{ fn: '3.3', from: 0, to: 1, color: 'ink3', alpha: 0.25 }], points: [{ x: 0.5, y: 2.8, r: 0, label: 'metal tip', labelDx: -24 }] }, caption: t`Outside a small sphere the field falls as $1/r^2$ from its surface value: strong right at a sharp tip, gone a few radii away. A real wick tip is not a sphere and shares the aircraft’s charge; the isolated sphere is a model.` },
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: 3e6 * rt * 1e-3 * 2, feedback: t`For a sphere, $E_{\text{surface}} = kQ/R^2 = V/R$. No factor of 2.` }],
          hints: [t`For a sphere $V = kQ/R$ and $E_{\text{surface}} = kQ/R^2$, so $E = V/R$.`, t`Set $V/R = 3\times10^6$ V/m with $R = ${rt}\times10^{-3}$ m.`],
          teach: 'At one potential, the field at a curved conducting surface scales as 1/R: sharp points break down first.',
          explain: t`$V = E_bR = (3\times10^6)(${rt}\times10^{-3}) = ${nice(V)}$ V. A smooth 2-m-radius fuselage would need about 6 MV to do the same, so the charge bleeds off at the wicks, quietly and away from the radio antennas — the point of the design.`,
        };
      },
    }),
    num({
      id: 'cp-shellV', difficulty: 2,
      gen(r) {
        const q = r.pick([1, 3, 5]), Q = r.pick([-2, 2, 4]), b = r.pick([4, 8, 10]);
        const ans = (KC * (Q + q) * 1e-9) / (b / 100);
        return {
          prompt: t`A charge of $${q}$ nC sits off-centre in the cavity of a spherical conducting shell of outer radius ${b} cm. The shell’s own net charge is $${Q}$ nC. What is the shell’s potential (with $V(\infty) = 0$)?`,
          visual: field({ x: [-14, 14], y: [-8, 8], conductor: { x: 0, y: 0, R: b, a: b * 0.55, Q }, charges: [{ x: b * 0.25, y: b * 0.1, q }], fieldLines: true, density: 12 }, t`The shell, its off-centre cavity charge and the surface charges. Count only what the outer surface carries.`),
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (KC * Q * 1e-9) / (b / 100), feedback: t`The outer surface holds $Q + q$, not $Q$: the inner wall took $-q$ from the shell.` }],
          hints: ['The outer surface holds Q + q, spread uniformly (nothing outside breaks the symmetry).', t`Outside, the field is that of $Q + q$ at the centre, so $V(b) = k(Q + q)/b$.`],
          teach: 'Outside a closed conductor, only the total enclosed charge matters, wherever it sits inside.',
          explain: t`$V = \dfrac{k(Q + q)}{b} = \dfrac{(8.988\times10^9)(${Q + q}\times10^{-9})}{${b / 100}} \approx ${nice(sf(ans, 3))}$ V — independent of where in the cavity the charge sits.`,
        };
      },
    }),
    mcq({
      id: 'cp-force', difficulty: 3,
      prompt: t`Why is the force per area on a conductor’s surface charge $\sigma\cdot\tfrac{\sigma}{2\varepsilon_0}$ rather than $\sigma\cdot\tfrac{\sigma}{\varepsilon_0}$?`,
      visual: surfaceFieldPic('The normal field across the surface: 0 in the metal, σ/ε₀ outside, and their average.'),
      choices: [
        t`Of the $\sigma/\varepsilon_0$ outside, half is the patch’s own field, which exerts no force on itself; the rest of the charges supply $\sigma/2\varepsilon_0$`,
        t`Only half of the surface charge feels the field`,
        t`The field outside is really $\sigma/2\varepsilon_0$`,
        t`The force is shared between the two sides of the surface`,
      ],
      answer: 0,
      why: {
        1: 'All the patch’s charge feels the same push; what is halved is the field acting on it.',
        2: t`The field just outside a conductor is $\sigma/\varepsilon_0$; the force uses a different field — the one from everything except the patch.`,
        3: 'The force on the charge is one number; the sides do not split it.',
      },
      hints: [t`Split the field into the patch’s own field ($\pm\sigma/2\varepsilon_0$) and everything else.`, t`Everything else must give $\sigma/2\varepsilon_0$ on both sides, to make $0$ inside and $\sigma/\varepsilon_0$ outside.`],
      teach: 'A charge does not push on itself: the field acting on a surface patch is the average of the fields on its two sides.',
      explain: t`The patch makes $\pm\sigma/2\varepsilon_0$; the rest of the charge makes $\sigma/2\varepsilon_0$ on both sides (to give $0$ in and $\sigma/\varepsilon_0$ out). Only the rest pushes the patch: $f = \sigma\cdot\sigma/2\varepsilon_0$ — the average of the two sides, $\tfrac12(0 + \sigma/\varepsilon_0)$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §2.5', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Feynman Lectures on Physics, Vol. II, §6.11: the field near a conducting point', url: 'https://www.feynmanlectures.caltech.edu/II_06.html' },
  ],
});
