// Gauss's law in integral and differential form (Griffiths §2.2.1, 2.2.3):
// the two forms traded by the divergence theorem, Gauss for non-uniform
// densities (ρ = kr, ks, k|z|, k/r), when symmetry makes it useful and when it
// is true but useless, superposition for an off-centre cavity (the CUE
// archetype), and the documented slips: the pillbox factor of 2 and
// "zero flux means zero field". Builds on phys2220.E3.2–E3.3.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, sf, th } from './_toolkit.js';

const t = String.raw;
const PI = Math.PI;
const G = 6.674e-11;

/** A cross-section of a ball with an off-centre spherical cavity (graph). */
const cavityPic = (d, caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-1.35, 1.35], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    shade: (() => {
      const big = 'sqrt(max(1.44 - x^2, 0))', hole = `sqrt(max(0.2025 - (x - ${d})^2, 0))`, x0 = +(d - 0.45).toFixed(3), x1 = +(d + 0.45).toFixed(3);
      const sh = (fn, lower, from, to) => ({ fn, lower, from, to, color: 'warn', alpha: 0.28 });
      return [sh(big, `-${big}`, -1.2, x0), sh(big, `-${big}`, x1, 1.2), sh(big, hole, x0, x1), sh(`-${hole}`, `-${big}`, x0, x1)];
    })(),
    curves: [{ param: ['1.2*cos(t)', '1.2*sin(t)'], t: [0, 2 * PI], color: 'warn', width: 2 }, { param: [`${d} + 0.45*cos(t)`, '0.45*sin(t)'], t: [0, 2 * PI], color: 'ink2', width: 2 }],
    arrows: [{ from: [0, 0], to: [d, 0], color: 'gold', width: 2.5, label: 'd', labelDx: -14, labelDy: 16 }],
    points: [{ x: 0, y: 0, color: 'gold', r: 3 }, { x: d, y: 0, color: 'ink2', r: 3 }],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys3600.M1.3',
  title: 'Gauss’s law in integral and differential form',
  minutes: 16, difficulty: 3,
  equation: t`\oint_{\mathcal S}\vec E\cdot d\vec a = \frac{Q_{\text{enc}}}{\varepsilon_0} \quad\Longleftrightarrow\quad \nabla\cdot\vec E = \frac{\rho}{\varepsilon_0}`,
  intro: t`Gauss’s law comes in two forms, and the divergence theorem turns each into the other: integrate $\nabla\cdot\vec E = \rho/\varepsilon_0$ over any volume, and the left side becomes the flux through its surface while the right becomes the enclosed charge over $\varepsilon_0$. The integral form is **always true** but only **useful** when symmetry lets you pull $|\vec E|$ out of the flux integral — spheres, infinite cylinders, infinite planes. Then it handles any density that depends only on the symmetric coordinate, not just uniform ones. The differential form works the other way round: hand it a field and it returns the charge density, point by point. You met the integral form in [Physics II](#/lesson/phys2220.E3.3); here the densities vary, and the symmetry argument comes first.`,
  symbols: [
    { tex: '\\mathcal S', text: 'any closed surface (the Gaussian surface), with outward normal' },
    { tex: 'd\\vec a', text: t`a patch of that surface as a vector, outward, in m²` },
    { tex: 'Q_{\\text{enc}}', text: t`the charge inside the surface, $\int_{\mathcal V}\rho\,d\tau$, in C — charges outside contribute zero net flux` },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}\ \text{C}^2/(\text{N·m}^2)$` },
    { tex: '\\rho', text: 'the charge density at a point, in C/m³' },
  ],
  why: t`Gravity obeys the same law, $\oint\vec g\cdot d\vec a = -4\pi GM_{\text{enc}}$, which is how geophysicists find the field deep inside Earth, and how Newton’s shell theorems follow in two lines.`,
  visual: {
    type: 'graph',
    title: 'Pile the charge in, watch the field',
    lead: t`A ball of radius $a$ with density $\rho \propto r^n$. Blue: the field, in units of its value at the surface; gold: the density, in units of its mean. Slide $n$ to move charge toward the centre or the surface; slide the probe to read the enclosed fraction.`,
    tasks: [
      t`$n = 0$, uniform: the field grows linearly inside and falls as $1/r^2$ outside. Outside, the blue curve never changes with $n$: only $Q$ matters there.`,
      t`$n = -1$: the density blows up at the centre, yet the field inside is **constant**. Gauss: $Q_{\text{enc}} \propto r^2$, exactly matching the area $4\pi r^2$.`,
      t`Push $n$ up to 4: the charge crowds toward the surface and the field inside almost vanishes until near the edge — the ball is turning into a shell, whose inside field is zero.`,
    ],
    params: {
      x: [0, 2.5], y: [0, 2.2], aspect: 'wide', xlabel: 'r / a', ylabel: '',
      sliders: [
        { key: 'n', label: t`Density exponent $n$ (with $\rho \propto r^n$)`, min: -2, max: 4, step: 0.5, value: 0, explain: 'Negative n piles charge toward the centre, positive n toward the surface; n = 0 is uniform. n must exceed −3 for the total to be finite.' },
        { key: 'u', label: t`Probe radius $r/a$`, min: 0.05, max: 2.5, step: 0.05, value: 0.6, explain: 'The radius of a spherical Gaussian surface, in units of the ball’s radius.' },
      ],
      curves: [
        { fn: 'x^(n + 1)', domain: [0.001, 1], color: 'accent', width: 2.6 },
        { fn: '1/x^2', domain: [1, 2.5], color: 'accent', width: 2.6 },
        { fn: '(n + 3)*x^n/3', domain: [0.001, 1], color: 'gold', width: 2 },
      ],
      vlines: [{ x: 1, label: 'surface', color: 'ink3' }, { x: 'u', color: 'violet' }],
      legend: [{ label: 'field E / E(surface)', color: 'accent' }, { label: 'density ρ / mean ρ', color: 'gold' }, { label: 'Gaussian sphere (the line you slide)', color: 'ink3', dash: true }],
      legendAt: 'tr',
      readouts: [
        { label: t`$Q_{\text{enc}}/Q$`, expr: 'min(u, 1)^(n + 3)', digits: 3 },
        { label: t`$E/E_{\text{surface}}$`, expr: 'step(1 - u)*u^(n + 1) + step(u - 1)/u^2', digits: 3 },
      ],
    },
    caption: t`Exact Gauss’s-law results: inside, $E/E_{\text{surface}} = (r/a)^{n+1}$; outside, $(a/r)^2$. The density curve runs off the top near the centre when $n < 0$.`,
  },
  example: {
    prompt: t`A ball of radius $R = 5$ cm has charge density $\rho = kr$ with $k = 2\ \mu\text{C/m}^4$. Find $\vec E$ inside and outside, and check the inside result with the differential form.`,
    visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6], balls: [{ x: 0, y: 0, R: 5, Q: 1 }], gauss: { shape: 'sphere', x: 0, y: 0, r: 3, move: false, resize: false }, fieldLines: true, arrows: false, readouts: [], static: true }, caption: 'The ball and a spherical Gaussian surface inside it (field lines drawn for a uniform ball; the shape of the argument is identical). Symmetry makes E radial and the same all over the sphere.' },
    steps: [
      { label: 'Symmetry first', text: t`$\rho$ depends only on $r$, so $\vec E = E(r)\,\hat r$: any other direction would pick out a preferred axis. On a sphere of radius $r$, $\oint\vec E\cdot d\vec a = E(r)\cdot4\pi r^2$.` },
      { label: 'Enclosed charge', text: t`Inside ($r < R$): $Q_{\text{enc}} = \int_0^r kr'\cdot4\pi r'^2\,dr' = \pi kr^4$. Outside: all of it, $Q = \pi kR^4$.` },
      { label: 'Solve', text: t`Inside: $E\cdot4\pi r^2 = \pi kr^4/\varepsilon_0$, so $E = \dfrac{kr^2}{4\varepsilon_0}$. Outside: $E = \dfrac{kR^4}{4\varepsilon_0r^2}$.` },
      { label: 'Differential check', text: t`$\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot\dfrac{kr^2}{4\varepsilon_0}\right) = \dfrac{1}{r^2}\cdot\dfrac{4kr^3}{4\varepsilon_0} = \dfrac{kr}{\varepsilon_0} = \dfrac{\rho}{\varepsilon_0}$ ✓.` },
      { label: 'Numbers', text: t`At the surface: $E = \dfrac{(2\times10^{-6})(0.05)^2}{4(8.854\times10^{-12})} \approx ${tex((2e-6 * 0.0025) / (4 * EPS0), 3)}$ N/C. The two formulas agree there ✓.` },
    ],
    answer: t`$\vec E = \dfrac{kr^2}{4\varepsilon_0}\hat r$ inside, $\dfrac{kR^4}{4\varepsilon_0r^2}\hat r$ outside; $${tex((2e-6 * 0.0025) / (4 * EPS0), 3)}$ N/C at the surface.`,
  },
  practice: [
    num({
      id: 'rho-kr', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 5]), R = r.pick([4, 5, 8]), rc = r.pick([2, 3, 10, 12]);
        const kk = k * 1e-6, Rm = R / 100, rm = rc / 100, inside = rm < Rm;
        const ans = inside ? (kk * rm * rm) / (4 * EPS0) : (kk * Rm ** 4) / (4 * EPS0 * rm * rm);
        return {
          prompt: t`A ball of radius ${R} cm has charge density $\rho = kr$ with $k = ${k}\ \mu\text{C/m}^4$. Find the field ${rc} cm from its centre.`,
          visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-14, 14], y: [-8, 8], balls: [{ x: 0, y: 0, R, Q: 1 }], gauss: { shape: 'sphere', x: 0, y: 0, r: rc, move: false, resize: false }, fieldLines: false, arrows: false, readouts: [], static: true }, caption: t`The ball (radius ${R} cm) and a Gaussian sphere of radius ${rc} cm. To scale.` },
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: inside
            ? [{ value: (kk * rm * rm) / (3 * EPS0), feedback: t`That treats the density as uniform at its local value. Integrate: $Q_{\text{enc}} = \int_0^r kr'\cdot4\pi r'^2\,dr' = \pi kr^4$.` }, { value: (kk * Rm ** 4) / (4 * EPS0 * rm * rm), feedback: 'That is the outside formula. Inside, only the charge within radius r counts.' }]
            : [{ value: (kk * rm * rm) / (4 * EPS0), feedback: 'That is the inside formula. Outside the ball all its charge is enclosed.' }],
          hints: [t`$E\cdot4\pi r^2 = Q_{\text{enc}}/\varepsilon_0$, with $Q_{\text{enc}} = \pi k\,r^4$ inside and $\pi kR^4$ outside.`, t`Inside: $E = kr^2/4\varepsilon_0$. Outside: $E = kR^4/(4\varepsilon_0r^2)$. Use metres.`],
          teach: t`With spherical symmetry, Gauss’s law handles any $\rho(r)$: integrate for $Q_{\text{enc}}$, divide by $\varepsilon_0$ and by $4\pi r^2$.`,
          explain: t`${inside ? t`Inside: $E = \tfrac{kr^2}{4\varepsilon_0} = \tfrac{(${k}\times10^{-6})(${rm})^2}{4(8.854\times10^{-12})}$` : t`Outside: $E = \tfrac{kR^4}{4\varepsilon_0r^2} = \tfrac{(${k}\times10^{-6})(${Rm})^4}{4(8.854\times10^{-12})(${rm})^2}$`} $\approx ${tex(ans, 3)}$ N/C, radially outward.`,
        };
      },
    }),
    num({
      id: 'cyl-ks', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 3, 5]), s = r.pick([1, 2, 3]);
        const ans = (k * 1e-6 * (s / 100) ** 2) / (3 * EPS0);
        return {
          prompt: t`A long cylinder has charge density $\rho = ks$, growing with the distance $s$ from its axis, with $k = ${k}\ \mu\text{C/m}^4$. Find the field inside it, ${s} cm from the axis.`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [-3.2, 3.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '2.4', lower: '-2.4', from: -4.5, to: 4.5, color: 'warn', alpha: 0.15 }], curves: [{ fn: '2.4', domain: [-4.5, 4.5], color: 'warn' }, { fn: '-2.4', domain: [-4.5, 4.5], color: 'warn' }, { param: ['-2.5', 't'], t: [-1.2, 1.2], color: 'violet', width: 2 }, { param: ['2.5', 't'], t: [-1.2, 1.2], color: 'violet', width: 2 }, { fn: '1.2', domain: [-2.5, 2.5], color: 'violet', width: 2 }, { fn: '-1.2', domain: [-2.5, 2.5], color: 'violet', width: 2 }, { fn: '0', domain: [-4.8, 4.8], color: 'ink3', dash: true }], points: [{ x: 0, y: 1.2, r: 0, label: 'Gaussian cylinder, radius s, length ℓ', labelDx: -110, labelDy: -10 }] }, caption: 'Side view: the charged cylinder (red), its axis (dashed) and a coaxial Gaussian cylinder (violet). The field is radial, so the flat ends carry no flux. Not to scale.' },
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: (k * 1e-6 * (s / 100) ** 2) / (2 * EPS0), feedback: t`That is the uniform-cylinder result $\rho s/2\varepsilon_0$ with $\rho = ks$. Integrate the varying density: $\int_0^s ks'\cdot2\pi s'\ell\,ds' = \tfrac23\pi k\ell s^3$.` },
            { value: (k * 1e-6 * (s / 100) ** 2) / EPS0, feedback: t`Check the flux: through the curved side it is $E\cdot2\pi s\ell$, and the enclosed charge is $\tfrac23\pi k\ell s^3$.` },
          ],
          hints: [t`A coaxial Gaussian cylinder of radius $s$ and length $\ell$: flux $E\cdot2\pi s\ell$ (none through the ends).`, t`$Q_{\text{enc}} = \int_0^s ks'\cdot2\pi s'\ell\,ds' = \tfrac23\pi k\ell s^3$, so $E = ks^2/3\varepsilon_0$.`],
          teach: 'Cylindrical symmetry: Gaussian cylinder, flux only through the curved side, and the enclosed charge integrated with the area element 2πs ds.',
          explain: t`$E\cdot2\pi s\ell = \tfrac{2\pi k\ell s^3}{3\varepsilon_0}$ gives $E = \tfrac{ks^2}{3\varepsilon_0} = \tfrac{(${k}\times10^{-6})(${s / 100})^2}{3(8.854\times10^{-12})} \approx ${nice(sf(ans, 3))}$ N/C. Check: $\tfrac1s\tfrac{d}{ds}\left(s\cdot\tfrac{ks^2}{3\varepsilon_0}\right) = \tfrac{ks}{\varepsilon_0} = \tfrac{\rho}{\varepsilon_0}$ ✓.`,
        };
      },
    }),
    multi({
      id: 'useful', difficulty: 2,
      prompt: t`For which of these charge distributions does Gauss’s law **alone** give the field?`,
      visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6], rods: [{ x1: -5, y1: 0, x2: 5, y2: 0, Q: 5 }], gauss: { shape: 'cylinder', x: 0, y: 0, r: 2.5, depth: 6, move: false, resize: false }, fieldLines: true, arrows: false, readouts: [], static: true }, caption: 'A finite rod with a cylindrical Gaussian surface round its middle: the field lines splay at the ends, so E is not the same all over the surface.' },
      choices: ['A ball whose density depends only on r', 'An infinitely long cylinder whose density depends only on s', 'An infinite slab whose density depends only on z', 'A uniformly charged cube', 'A finite uniformly charged rod', t`A ball with density $\rho = k\cos\theta$`],
      answer: [0, 1, 2],
      why: {
        3: 'Gauss’s law is true for a cube, but no surface has E constant and perpendicular all over it, so the flux integral cannot be undone.',
        4: 'Near the ends the field tilts and weakens; on a Gaussian cylinder E is neither constant nor perpendicular. True, but useless.',
        5: t`The density depends on direction, so $E$ is not the same all over a sphere. (This one needs Legendre polynomials, module M4.)`,
      },
      hints: ['Gauss’s law gives E only if you can pull |E| out of the flux integral.', 'That needs a surface on which E is constant and perpendicular (or parallel) everywhere: spherical, cylindrical or planar symmetry.'],
      teach: 'Gauss’s law is always true but only useful when symmetry fixes the direction of E and makes its size constant over a surface.',
      explain: t`Only full spherical, cylindrical or planar symmetry lets you write $\oint\vec E\cdot d\vec a = E\cdot(\text{area})$. In Pepper et al.’s study a third of students missed that a radially symmetric problem was a Gauss’s-law problem — and the opposite slip, forcing Gauss onto a cube, is just as common.`,
    }),
    num({
      id: 'slab', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 4]), d = r.pick([10, 20]), z = r.pick([3, 5, 8]);
        const ans = (k * 1e-6 * (z / 100) ** 2) / (2 * EPS0);
        return {
          prompt: t`An infinite slab occupies $-${d} \le z \le ${d}$ cm and carries charge density $\rho = k|z|$, with $k = ${k}\ \mu\text{C/m}^4$. Find the field at $z = ${z}$ cm.`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-d * 1.4, d * 1.4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: `${d}`, lower: `${-d}`, from: -6, to: 6, color: 'warn', alpha: 0.18 }], curves: [{ fn: `${d}`, color: 'warn' }, { fn: `${-d}`, color: 'warn' }, { fn: '0', color: 'ink3', dash: true }, { param: ['-1.5', 't'], t: [-z, z], color: 'violet', width: 2 }, { param: ['1.5', 't'], t: [-z, z], color: 'violet', width: 2 }, { fn: `${z}`, domain: [-1.5, 1.5], color: 'violet', width: 2 }, { fn: `${-z}`, domain: [-1.5, 1.5], color: 'violet', width: 2 }], points: [{ x: 1.5, y: z, r: 0, label: `z = ${z} cm`, labelDx: 8 }, { x: -6, y: d, r: 0, label: 'slab', labelDx: 6, labelDy: 14 }] }, caption: t`Edge-on: the slab (red), its mid-plane (dashed) and a Gaussian box (violet) from $-z$ to $+z$. Heights to scale; horizontal extent arbitrary.` },
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: (k * 1e-6 * (z / 100) ** 2) / EPS0, feedback: t`The box has **two** faces with flux, at $+z$ and $-z$: $2EA = Q_{\text{enc}}/\varepsilon_0$.` },
            { value: (k * 1e-6 * (d / 100) ** 2) / (2 * EPS0), feedback: 'That is the field at the slab’s surface. Inside, only the charge between −z and z is enclosed.' },
          ],
          hints: [t`By symmetry $\vec E$ points away from the mid-plane and $E(0) = 0$. Take a box from $-z$ to $+z$ with face area $A$.`, t`$Q_{\text{enc}} = 2A\int_0^z kz'\,dz' = Akz^2$, and the flux is $2EA$.`],
          teach: 'Planar symmetry: a Gaussian box straddling the mid-plane has flux through both faces, 2EA.',
          explain: t`$2EA = Akz^2/\varepsilon_0$, so $E = \tfrac{kz^2}{2\varepsilon_0} = \tfrac{(${k}\times10^{-6})(${z / 100})^2}{2(8.854\times10^{-12})} \approx ${nice(sf(ans, 3))}$ N/C, pointing away from the mid-plane. Check: $dE_z/dz = kz/\varepsilon_0 = \rho/\varepsilon_0$ ✓.`,
        };
      },
    }),
    num({
      id: 'cavity', difficulty: 3,
      gen(r) {
        const rho = r.pick([20, 50, 80]), d = r.pick([2, 3, 4]);
        const ans = (rho * 1e-9 * (d / 100)) / (3 * EPS0);
        return {
          prompt: t`A ball of uniform charge density $${rho}$ nC/m³ has a spherical hole cut out of it, centred ${d} cm from the ball’s centre (the hole lies wholly inside the ball). Find the field at the centre of the hole.`,
          visual: cavityPic(0.6, t`Cross-section: the charged ball (red), the empty hole (grey outline) and the offset $\vec d$ from the ball’s centre to the hole’s. Not to scale.`),
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: 0, feedback: 'The hole holds no charge, but the field there comes from all the charge around it, which is not symmetric about the hole.' },
            { value: (rho * 1e-9 * (d / 100)) / EPS0, feedback: t`Inside a uniform ball $\vec E = \rho\vec r/3\varepsilon_0$: there is a factor of 3.` },
          ],
          hints: [t`Superpose: the full ball (density $\rho$) plus a small ball of density $-\rho$ filling the hole.`, t`Inside a uniform ball, $\vec E = \tfrac{\rho}{3\varepsilon_0}\vec r$ measured from its centre. At the hole’s centre the small ball contributes nothing.`],
          teach: 'A hole is the full object plus negative charge of the same density in the hole: superpose fields you know.',
          explain: t`At the hole’s centre the small negative ball gives $0$ and the big ball gives $\tfrac{\rho}{3\varepsilon_0}d = \tfrac{(${rho}\times10^{-9})(${d / 100})}{3(8.854\times10^{-12})} \approx ${nice(sf(ans, 3))}$ N/C, along $\vec d$. In fact everywhere in the hole $\vec E = \tfrac{\rho}{3\varepsilon_0}(\vec r - \vec r\,') = \tfrac{\rho\,\vec d}{3\varepsilon_0}$: **uniform**.`,
        };
      },
    }),
    mcq({
      id: 'error-pillbox', difficulty: 3, kind: 'error',
      prompt: t`For an infinite sheet of charge $\sigma$, a student draws a pillbox straddling the sheet and writes: “Flux $= EA = \sigma A/\varepsilon_0$, so $E = \sigma/\varepsilon_0$.” What went wrong?`,
      visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6], sheets: [{ x: 0, y: 0, angle: 90, sigma: 30 }], gauss: { shape: 'box', x: 0, y: 0, w: 4, h: 3, depth: 3, move: false, resize: false }, fieldLines: true, arrows: true, readouts: [], static: true }, caption: 'The sheet edge-on (vertical), its field on both sides, and a pillbox straddling it. Field leaves through both flat faces.' },
      choices: [t`The field leaves through **both** faces: $2EA = \sigma A/\varepsilon_0$, so $E = \sigma/2\varepsilon_0$`, 'The side walls also carry flux', t`The enclosed charge is $2\sigma A$`, t`Nothing: $\sigma/\varepsilon_0$ is the field of a sheet`],
      answer: 0,
      why: {
        1: 'The field is perpendicular to the sheet, so it runs along the side walls: no flux through them.',
        2: t`The box encloses the patch of sheet of area $A$: charge $\sigma A$.`,
        3: t`$\sigma/\varepsilon_0$ is the field just outside a **conductor**, where the field is zero on the inside so only one face carries flux. A free sheet sends field both ways.`,
      },
      hints: ['On which faces of the pillbox is E·n̂ nonzero?', t`Above the sheet $\vec E$ points up, below it points down: both are **out** of the box.`],
      teach: 'A pillbox straddling a sheet has flux through both faces; forgetting one gives the factor-of-2 error.',
      explain: t`Flux leaves through the top **and** the bottom: $2EA = \sigma A/\varepsilon_0$, so $E = \sigma/2\varepsilon_0$ on each side. Course data from CU Boulder show this factor-of-2 slip is among the commonest in junior E&M; check which faces actually carry flux before writing the flux down.`,
    }),
    mcq({
      id: 'zero-flux', difficulty: 2,
      prompt: t`A closed surface encloses no net charge, so $\oint\vec E\cdot d\vec a = 0$. What can you conclude about $\vec E$ on the surface?`,
      visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6], charges: [{ x: -2, y: 0, q: 3 }, { x: 2, y: 0, q: -3 }], gauss: { shape: 'sphere', x: 0, y: 0, r: 4, move: false, resize: false }, fieldLines: true, arrows: false, readouts: [], static: true }, caption: 'A Gaussian sphere round a + and a − charge: field lines leave through one side and enter through the other.' },
      choices: ['Nothing about its size: what leaves one part comes in through another', t`$\vec E = 0$ everywhere on the surface`, t`$\vec E$ is tangent to the surface everywhere`, t`$\vec E$ is uniform on the surface`],
      answer: 0,
      why: {
        1: 'The dipole drawn has strong fields on the surface and zero net flux: zero total does not mean zero everywhere.',
        2: 'Zero net flux allows E·n̂ to be positive in some places and negative in others, as here.',
        3: 'Nothing forces uniformity; the field here is strongest near the charges.',
      },
      hints: ['Think of a surface round a + and a − charge together.'],
      teach: 'Zero net flux does not mean zero field: outflow in one place can cancel inflow in another.',
      explain: t`Gauss’s law fixes only the **total** flux. Students often read “zero flux” as “zero field”; the dipole is the counterexample. Only with symmetry — $E$ the same all over the surface — does zero flux force $E = 0$, as inside a charged shell.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-k-over-r', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 5, 10]), R = r.pick([10, 20]), rc = r.pick([2, 4, 6]);
        const ans = (k * 1e-9) / (2 * EPS0);
        return {
          prompt: t`A ball of radius ${R} cm has charge density $\rho = k/r$, with $k = ${k}$ nC/m². Find the field inside it, ${rc} cm from the centre.`,
          visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-24, 24], y: [-14, 14], balls: [{ x: 0, y: 0, R, Q: 1 }], gauss: { shape: 'sphere', x: 0, y: 0, r: rc, move: false, resize: false }, fieldLines: false, arrows: false, readouts: [], static: true }, caption: 'The ball and a Gaussian sphere inside it. To scale. The density is highest at the centre.' },
          answer: ans, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: (k * 1e-9) / EPS0, feedback: t`$Q_{\text{enc}} = \int_0^r\tfrac{k}{r'}4\pi r'^2\,dr' = 2\pi kr^2$, and the flux is $E\cdot4\pi r^2$: the ratio carries a $\tfrac12$.` },
            { value: (k * 1e-9) / (2 * EPS0 * rc / 100), feedback: 'Check the powers of r: the enclosed charge grows as r², exactly like the area.' },
          ],
          hints: [t`$Q_{\text{enc}} = \int_0^r\frac{k}{r'}\,4\pi r'^2\,dr'$.`, t`$Q_{\text{enc}} = 2\pi kr^2$ and $E\cdot4\pi r^2 = Q_{\text{enc}}/\varepsilon_0$.`],
          teach: 'For ρ ∝ 1/r the enclosed charge grows as r², just like the area, so the field inside is constant.',
          explain: t`$E = \tfrac{2\pi kr^2}{4\pi\varepsilon_0r^2} = \tfrac{k}{2\varepsilon_0} = \tfrac{${k}\times10^{-9}}{2(8.854\times10^{-12})} \approx ${nice(sf(ans, 3))}$ N/C — the same at every radius inside, despite the density blowing up at the centre. Check: $\tfrac{1}{r^2}\tfrac{d}{dr}\left(r^2\tfrac{k}{2\varepsilon_0}\right) = \tfrac{k}{\varepsilon_0r} = \tfrac{\rho}{\varepsilon_0}$ ✓.`,
        };
      },
    }),
    num({
      id: 'cp-core', difficulty: 3, transfer: true,
      gen(r) {
        const rc = 3480e3, RE = 6371e3, rhoC = 10900, rhoM = 4450;
        const rk = r.pick([3480, 4500, 5500]), rr = rk * 1e3;
        const M = (4 / 3) * PI * (rhoC * rc ** 3 + rhoM * (rr ** 3 - rc ** 3));
        const ans = (G * M) / rr ** 2;
        const Mtot = (4 / 3) * PI * (rhoC * rc ** 3 + rhoM * (RE ** 3 - rc ** 3));
        return {
          prompt: t`Model Earth as a core of radius 3 480 km and density 10 900 kg/m³ inside a mantle of density 4 450 kg/m³ reaching the surface at 6 371 km. Gauss’s law for gravity reads $\oint\vec g\cdot d\vec a = -4\pi G M_{\text{enc}}$. What is $g$ at a depth where the distance from Earth’s centre is ${th(rk)} km?`,
          visual: { type: 'graph', params: { x: [-1.25, 1.25], y: [-1.1, 1.1], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'teal', alpha: 0.18 }, { fn: 'sqrt(max(0.5462^2 - x^2, 0))', lower: '-sqrt(max(0.5462^2 - x^2, 0))', from: -0.5462, to: 0.5462, color: 'warn', alpha: 0.35 }], curves: [{ param: [`${(rr / RE).toFixed(4)}*cos(t)`, `${(rr / RE).toFixed(4)}*sin(t)`], t: [0, 2 * PI], color: 'violet', width: 2, dash: true }], points: [{ x: 0, y: 0.25, r: 0, label: 'core', labelDx: -14 }, { x: 0, y: 0.8, r: 0, label: 'mantle', labelDx: -20 }] }, caption: t`Earth in cross-section, to scale: core (red), mantle (teal) and the Gaussian sphere at the radius asked about (violet). Real Earth has a solid inner core and a density that rises with depth; two uniform layers are a model.` },
          answer: ans, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: (9.82 * rr) / RE, feedback: 'That assumes uniform density, g ∝ r. Earth’s dense core makes g stay high, even rise, below the surface.' },
            { value: (G * Mtot) / rr ** 2, feedback: 'Only the mass inside the Gaussian sphere counts; the shell of mantle outside it pulls equally in all directions and cancels.' },
          ],
          hints: [t`By symmetry $\vec g$ points to the centre and $g\cdot4\pi r^2 = 4\pi GM_{\text{enc}}$, so $g = GM_{\text{enc}}/r^2$.`, t`$M_{\text{enc}} = \tfrac43\pi\left[\rho_c r_c^3 + \rho_m(r^3 - r_c^3)\right]$ with everything in metres.`],
          teach: 'Gauss’s law for gravity: only the mass inside the Gaussian sphere counts, so a dense core keeps g high deep inside the planet.',
          explain: t`$M_{\text{enc}} \approx ${tex(M, 3)}$ kg, so $g = GM_{\text{enc}}/r^2 \approx ${nice(sf(ans, 3))}\ \text{m/s}^2$. ${rk === 3480 ? 'At the core–mantle boundary g is larger than at the surface — seismology’s PREM model gives about 10.7 m/s² there.' : 'Going down through the mantle, g barely changes: the mass lost overhead is offset by getting closer to the dense core.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-method', difficulty: 2,
      prompt: t`A uniformly charged ball has a spherical hole cut out of it, off-centre. What is the most efficient way to find the field inside the hole?`,
      visual: cavityPic(0.6, 'Cross-section: the charged ball with its off-centre hole. Not to scale.'),
      choices: ['Superposition: the full ball plus a ball of opposite charge density filling the hole', 'Gauss’s law with a sphere centred on the big ball', 'Integrate Coulomb’s law over the ball with the hole removed', 'No calculation needed: the hole holds no charge, so the field there is zero'],
      answer: 0,
      why: {
        1: 'With the hole off-centre, the field is not the same all over any sphere: Gauss’s law is true but useless here.',
        2: 'It works, but it is a hard triple integral over an awkward region; superposition gets the answer in one line.',
        3: 'The field in an empty region comes from the charges around it; only a symmetric shell gives zero inside.',
      },
      hints: ['Can you write this awkward object as a sum of two symmetric ones?'],
      teach: 'Choose the method before computing: symmetry → Gauss; awkward shape built from symmetric pieces → superposition.',
      explain: t`Full ball ($\rho$) plus small ball ($-\rho$): inside the hole $\vec E = \tfrac{\rho}{3\varepsilon_0}(\vec r - \vec r\,') = \tfrac{\rho\,\vec d}{3\varepsilon_0}$, uniform. On the CUE test only 45% of students chose superposition here; 42% reached for Gauss’s law.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §2.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Pepper et al., Our best juniors still struggle with Gauss’s law (PERC 2010)', url: 'https://www.per-central.org/items/perc/1924.pdf' },
    { label: 'Dziewonski & Anderson, Preliminary reference Earth model (PEPI 25, 1981)', url: 'https://doi.org/10.1016/0031-9201(81)90046-7' },
  ],
});
