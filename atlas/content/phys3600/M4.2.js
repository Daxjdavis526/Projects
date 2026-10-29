// The method of images (Griffiths §3.2): a point charge above a grounded
// plane (potential, induced σ, total induced charge, force, and the work to
// bring the charge in — half the image pair's energy), why the image
// solution is valid only on the real side, the grounded sphere (Kelvin's
// image, derived) and the isolated neutral sphere, and a charge in a
// grounded corner. Transfer: the image force at a hot metal surface and the
// Schottky lowering of a cathode's work function. Uses the em3-images sim.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { KC, EPS0, sf, images } from './_bvp.js';

const t = String.raw;
const E_CH = 1.602176634e-19;

export default lesson({
  id: 'phys3600.M4.2',
  title: 'The method of images',
  minutes: 17, difficulty: 3,
  equation: t`V(x, y, z) = \frac{q}{4\pi\varepsilon_0}\left[\frac{1}{\sqrt{x^2 + y^2 + (z - d)^2}} - \frac{1}{\sqrt{x^2 + y^2 + (z + d)^2}}\right], \quad z \ge 0`,
  intro: t`A charge $q$ sits a height $d$ above a grounded conducting plane. The plane’s induced charge is unknown, so Coulomb’s law cannot be used directly. But in the region above the plane, $V$ must solve Poisson’s equation with one point source, vanish on the plane, and vanish far away. A **fictitious** charge $-q$ at depth $d$ below the plane does all of that: on the plane the two terms cancel exactly. By [uniqueness](#/lesson/phys3600.M4.1) the pair’s potential is the right answer — **above the plane only**; below it, inside the metal, the true field is zero. Everything follows from the pair: the induced charge, the force on $q$, the energy. A grounded sphere has an image too, found the same way.`,
  symbols: [
    { tex: 'q', text: 'the real point charge, in C' },
    { tex: 'd', text: t`its height above the grounded plane $z = 0$, in m` },
    { tex: 'x, y, z', text: t`the field point; the formula holds only for $z \ge 0$` },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}\ \text{F/m}$` },
    { tex: '-q', text: t`the second term is the image: a fictitious $-q$ at $(0, 0, -d)$, standing in for the plane’s induced charge` },
  ],
  why: t`Images give the force that holds an electron to a metal (and so part of the work function), the field near antennas over a ground plane, and the capacitance of conductors near the ground — and they are the simplest Green’s functions, the tool of [the PDE course](#/lesson/st-b.B9.2).`,
  visual: {
    type: 'em3-images',
    title: 'The charge and its mirror image',
    lead: t`A positive charge above a grounded conducting plane. Drag it. Field lines leave it spaced so that each carries the same flux in 3D; the plane is shaded by its induced charge, plotted below. Turn on the image to see what the induced charge imitates.`,
    tasks: [
      t`Every field line from the charge ends on the plane: the total induced charge is exactly $-q$, whatever the height.`,
      t`Show the image: the dashed lines continue through the metal to a $-q$ at the mirror point. Above the plane, the field is exactly that of the pair.`,
      t`Halve the height: the induced charge piles up under the charge (the peak of $\sigma$ grows four times) and the force on it grows four times.`,
    ],
    params: { geometry: 'plane', q: 5, pos: [0, 3], lines: 9 },
    caption: t`A slice through the charge, perpendicular to the plane. The image and the dashed lines below the plane are bookkeeping: in the real metal there is no field. Exact for an ideal, infinite grounded plane.`,
  },
  example: {
    prompt: t`Find the image that makes a grounded sphere of radius $R$ an equipotential at $V = 0$, for a charge $q$ at distance $a > R$ from its centre. Then put in $q = 5$ nC, $R = 3$ cm, $a = 5$ cm and find the force on $q$.`,
    visual: images({ geometry: 'sphere', q: 5, pos: [5, 0], R: 3, x: [-6, 9], y: [-4.5, 4.5], lines: 9 }, t`The charge, the grounded sphere shaded by its induced charge, and the image inside it (dashed ring). About $R/a = 3/5$ of the field lines end on the sphere.`),
    steps: [
      { label: 'Guess', text: t`By symmetry, put a charge $q'$ on the line from the centre to $q$, at distance $b$ from the centre ($b < R$, inside the sphere, outside the real region).` },
      { label: 'Two conditions', text: t`$V = 0$ at the sphere’s nearest and farthest points: $\dfrac{q}{a - R} + \dfrac{q'}{R - b} = 0$ and $\dfrac{q}{a + R} + \dfrac{q'}{R + b} = 0$.` },
      { label: 'Solve', text: t`Dividing one by the other gives $b = R^2/a$, and then $q' = -qR/a$. Check any point of the sphere: its distances to $q'$ and $q$ are in the fixed ratio $R/a$, so the two terms always cancel ✓ — and uniqueness makes it the solution outside.` },
      { label: 'Numbers', text: t`$q' = -5\times\tfrac35 = -3$ nC at $b = 9/5 = 1.8$ cm. The force on $q$ is the attraction of $q'$, a distance $a - b = 3.2$ cm away: $F = \dfrac{kq|q'|}{(a - b)^2} = \dfrac{(8.988\times10^9)(5\times10^{-9})(3\times10^{-9})}{(0.032)^2} \approx ${tex((KC * 15e-18) / 0.032 ** 2, 3)}$ N.` },
      { label: 'Sense check', text: t`Far away ($a \gg R$), $q' \to 0$: a small sphere hardly notices a distant charge. Close in ($a \to R$), $q' \to -q$ and $b \to R$: up close the sphere looks like a plane.` },
    ],
    answer: t`$q' = -qR/a$ at $R^2/a$ from the centre: $-3$ nC at 1.8 cm; the force is $\approx ${tex((KC * 15e-18) / 0.032 ** 2, 3)}$ N, attractive.`,
  },
  practice: [
    num({
      id: 'plane-force', difficulty: 2,
      gen(r) {
        const q = r.pick([2, 4, 6]), d = r.pick([1, 2, 5]);
        const F = (KC * (q * 1e-9) ** 2) / (2 * d / 100) ** 2;
        return {
          prompt: t`A $${q}$ nC charge is held ${d} cm above a large grounded metal plate. How strong is the force that pulls it toward the plate?`,
          visual: images({ geometry: 'plane', q: 5, pos: [0, 2.6], image: false, lines: 8 }, 'The charge and the grounded plate, shaded by the induced charge (image hidden).'),
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [{ value: ((KC * (q * 1e-9) ** 2) / (d / 100) ** 2) * 1e3, feedback: t`The image sits at depth $d$ **below** the plate, so it is $2d$ from the charge, not $d$.` }],
          hints: ['The force on q is the attraction of its image, −q at the mirror point.', t`Distance $2d$: $F = \dfrac{kq^2}{(2d)^2}$.`],
          teach: 'The force on a charge near a grounded conductor is the Coulomb force from its image.',
          explain: t`$F = \dfrac{kq^2}{(2d)^2} = \dfrac{(8.988\times10^9)(${q}\times10^{-9})^2}{(${(2 * d) / 100})^2} \approx ${nice(sf(F * 1e3, 3))}$ mN, toward the plate.`,
        };
      },
    }),
    num({
      id: 'sigma-below', difficulty: 2,
      gen(r) {
        const q = r.pick([2, 5, 8]), d = r.pick([2, 4, 5]);
        const s = (-q * 1e-9) / (2 * Math.PI * (d / 100) ** 2);
        return {
          prompt: t`A $${q}$ nC charge sits ${d} cm above a grounded plane. What is the induced surface charge density on the plane directly beneath it?`,
          visual: images({ geometry: 'plane', q: 5, pos: [0, 2.5], panel: true, lines: 8 }, 'The induced charge density along the plane, plotted below (in nC/m², for this picture’s own charge and height).'),
          answer: s * 1e9, units: 'nC/m^2', tol: { rel: 0.01 },
          errors: [{ value: ((-q * 1e-9) / (4 * Math.PI * (d / 100) ** 2)) * 1e9, feedback: t`Both the charge and its image push field into the plane: $E_z = -2\cdot\dfrac{kq}{d^2}$ right below, so $\sigma = \varepsilon_0E_z = -\dfrac{q}{2\pi d^2}$.` }],
          hints: [t`$\sigma = \varepsilon_0E_z$ just above the plane (the field in the metal is zero).`, t`Directly below, $q$ and its image each give $kq/d^2$ pointing down: $E_z = -2kq/d^2$.`],
          teach: 'The induced charge is ε₀ times the normal field of the charge-plus-image pair at the surface.',
          explain: t`$\sigma = -\dfrac{qd}{2\pi(x^2 + y^2 + d^2)^{3/2}}$, which directly below is $-\dfrac{q}{2\pi d^2} \approx ${nice(sf(s * 1e9, 3))}\ \text{nC/m}^2$. Integrated over the whole plane it gives exactly $-q$.`,
        };
      },
    }),
    num({
      id: 'work', difficulty: 3,
      gen(r) {
        const q = r.pick([3, 5, 10]), d = r.pick([1, 2, 4]);
        const W = (-KC * (q * 1e-9) ** 2) / (4 * d / 100);
        return {
          prompt: t`How much work does it take to bring a $${q}$ nC charge from far away to ${d} cm above a grounded plane? (A negative answer means the field does the work.)`,
          visual: images({ geometry: 'plane', q: 5, pos: [0, 2], lines: 8 }, 'The charge, its image and the grounded plane.'),
          answer: W * 1e6, units: 'uJ', tol: { rel: 0.01 },
          errors: [{ value: ((-KC * (q * 1e-9) ** 2) / (2 * d / 100)) * 1e6, feedback: t`That is the energy of the real charge and its image, $-kq^2/2d$. But only the half-space above the plane holds field; and as you move $q$, the image moves too. Integrate the force: the result is half of that.` }],
          hints: [t`Integrate the force: $W = \displaystyle\int_\infty^d \dfrac{kq^2}{(2z)^2}\,dz$, with the sign of the work you do against an attraction.`, t`$W = -\dfrac{kq^2}{4d}$.`],
          teach: 'The work to bring a charge up to a conductor is half the energy of the charge-plus-image pair: only the real half of space holds field.',
          explain: t`$W = -\displaystyle\int_\infty^d \dfrac{kq^2}{4z^2}dz = -\dfrac{kq^2}{4d} \approx ${nice(sf(W * 1e6, 3))}\ \mu\text{J}$ — half of $-kq^2/2d$, the energy of a real pair. Field energy: the pair fills all of space with field, the real system only the half above the plane.`,
        };
      },
    }),
    mcq({
      id: 'region', difficulty: 2,
      prompt: t`The charge-plus-image potential solves the plane problem. What is the true field at a point 1 cm **below** the surface of the (thick) grounded plate?`,
      visual: images({ geometry: 'plane', q: 5, pos: [0, 3], lines: 8 }, 'The real charge, the image and the dashed lines through the metal.'),
      choices: ['Zero: it is inside the conductor; the image solution holds only above the plane', 'The field of the image charge alone', 'The field of the charge-plus-image pair, as drawn by the dashed lines', 'Half the field just above the plate'],
      answer: 0,
      why: {
        1: 'The image is fictitious; there is no charge there and no field from it.',
        2: 'The dashed lines are bookkeeping. Uniqueness certifies the pair’s potential only in the region where it was checked: above the plane.',
        3: 'Inside a conductor in equilibrium the field is exactly zero.',
      },
      hints: ['In which region did you check Poisson’s equation and the boundary conditions?'],
      teach: 'An image solution is valid only in the region where it satisfies the equation and the boundary conditions — never where the image sits.',
      explain: t`The image was placed outside the region of interest precisely so that it does not spoil Poisson’s equation there. Below the surface is metal, where $\vec E = 0$. The image solution says nothing about that region.`,
    }),
    num({
      id: 'sphere-b', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 4, 5]), a = R * r.pick([1.5, 2, 3]);
        return {
          prompt: t`A charge sits ${nice(a)} cm from the centre of a grounded metal sphere of radius ${R} cm. How far from the centre is its image?`,
          visual: images({ geometry: 'sphere', q: 5, pos: [5, 0], R: 3, x: [-6, 9], y: [-4.5, 4.5], image: false, lines: 8 }, 'A charge near a grounded sphere (picture not to the numbers in the question; image hidden).'),
          answer: (R * R) / a, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: R - (a - R), feedback: 'A sphere is not a flat mirror: the image is not as far inside as the charge is outside.' }, { value: R / a, feedback: t`$R/a$ is the size of the image charge relative to $q$. Its distance is $R^2/a$.` }],
          hints: [t`Kelvin’s image: $q' = -qR/a$ at $b = R^2/a$ from the centre.`],
          teach: 'A grounded sphere’s image is −qR/a at R²/a: inverse points with respect to the sphere.',
          explain: t`$b = R^2/a = ${R}^2/${nice(a)} \approx ${nice(sf((R * R) / a, 3))}$ cm, carrying $q' = -q\cdot${nice(sf(R / a, 3))}$. The charge and its image are inverse points: $ab = R^2$.`,
        };
      },
    }),
    num({
      id: 'sphere-induced', difficulty: 2,
      gen(r) {
        const q = r.pick([3, 6, 9]), R = r.pick([2, 3]), a = r.pick([6, 9]);
        return {
          prompt: t`A $${q}$ nC charge is ${a} cm from the centre of a grounded sphere of radius ${R} cm. How much charge is induced on the sphere?`,
          visual: images({ geometry: 'sphere', q: 5, pos: [6, 0], R: 2, x: [-5, 9], y: [-4.2, 4.2], image: false, lines: 10 }, 'Field lines spaced by equal flux: count the share that ends on the sphere.'),
          answer: (-q * R) / a, units: 'nC', tol: { rel: 0.01 },
          errors: [{ value: -q, feedback: t`That would be true for a plane, which catches every field line. A sphere catches only the share $R/a$; the rest go to infinity.` }],
          hints: ['Gauss’s law round the sphere: the induced charge equals the image charge inside it.', t`$q' = -qR/a$.`],
          teach: 'The total induced charge on a grounded conductor equals its total image charge.',
          explain: t`$q' = -qR/a = -${q}\times${R}/${a} = ${nice(sf((-q * R) / a, 3))}$ nC. Only the fraction $R/a$ of $q$’s field lines land on the sphere; ground supplies the induced charge.`,
        };
      },
    }),
    mcq({
      id: 'neutral', difficulty: 3,
      prompt: t`The sphere is now **isolated and uncharged** rather than grounded. How do you fix the image solution?`,
      visual: images({ geometry: 'sphere', ground: 'neutral', q: 5, pos: [5, 0], R: 3, x: [-6, 9], y: [-4.5, 4.5], lines: 9 }, 'An isolated neutral sphere: one patch gains negative charge, the far side positive. Its images: −qR/a at R²/a and +qR/a at the centre.'),
      choices: [
        t`Keep $-qR/a$ at $R^2/a$ and add $+qR/a$ at the centre: the sphere stays an equipotential, now at $V = kq/a$`,
        t`Drop the image: a neutral sphere has no induced charge`,
        t`Use $-q$ at $R^2/a$ so the total is zero`,
        t`Add $+qR/a$ at $R^2/a$, cancelling the image`,
      ],
      answer: 0,
      why: {
        1: 'It has no net induced charge, but it does have induced charge: − near q, + on the far side.',
        2: 'Then the sphere would no longer be an equipotential, and the total would still not be zero.',
        3: 'That removes the image altogether and the sphere is no longer an equipotential.',
      },
      hints: ['A point charge at the centre keeps the sphere an equipotential (it adds the same potential everywhere on it).', 'Choose its size to make the total induced charge zero.'],
      teach: 'For an isolated sphere, add a central image to set the total charge; it shifts the sphere’s potential but keeps it an equipotential.',
      explain: t`A charge at the centre adds the same potential all over the sphere, so the sphere stays an equipotential. Choosing it $+qR/a$ makes the net charge zero; the sphere floats at $V = k(qR/a)/R = kq/a$ — the potential $q$ alone makes at the centre. The sphere is still attracted to $q$, more weakly than when grounded.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-schottky', difficulty: 4, transfer: true,
      gen(r) {
        const E = r.pick([1e6, 1e7, 1e8]);
        const dW = Math.sqrt((E_CH * E) / (4 * Math.PI * EPS0));
        return {
          prompt: t`An electron leaving a hot metal surface (a thermionic cathode, like those in electric thrusters and electron guns) is pulled back by its image: at distance $x$ its potential energy is $-\dfrac{e^2}{16\pi\varepsilon_0x}$. An applied field $E = ${tex(E)}$ V/m pulling electrons out adds $-eEx$. The sum has a maximum, lowering the barrier the electron must climb (the work function) by $\Delta W$. Find $\Delta W$ in eV.`,
          visual: { type: 'graph', params: { x: [0, 5], y: [-3, 0.4], aspect: 'wide', xlabel: 'x (in units of the peak position)', ylabel: 'energy (scaled)', yticks: 0, curves: [{ fn: '-1/x', domain: [0.3, 5], color: 'ink3', dash: [5, 4], width: 1.8, label: 'image term alone', labelAt: 3.5, labelDy: -10 }, { fn: '-1/x - x', domain: [0.3, 5], color: 'accent', width: 2.6, label: 'image + applied field', labelAt: 2.2, labelDy: 20 }], hlines: [{ y: 0, color: 'ink2' }] }, caption: 'The electron’s potential energy outside the metal, measured from the vacuum level far away (shapes only, in units set by the field). The applied field tilts the curve, leaving a peak lower than the vacuum level. Close to the surface (well under a nanometre) the image formula breaks down.' },
          answer: dW, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: dW / 2, feedback: 'At the peak both terms contribute equally: the total there is twice the image term.' }],
          hints: [t`$U(x) = -\dfrac{e^2}{16\pi\varepsilon_0x} - eEx$. Set $dU/dx = 0$: $x_0 = \sqrt{\dfrac{e}{16\pi\varepsilon_0E}}$.`, t`At $x_0$ the two terms are equal, and $\Delta W = -U(x_0) = \sqrt{\dfrac{e^3E}{4\pi\varepsilon_0}}$. In eV: $\sqrt{eE/4\pi\varepsilon_0}$ with $e$ in coulombs.`],
          teach: 'The image force plus an applied field makes a barrier whose top sits √(e³E/4πε₀) below the vacuum level: the Schottky effect.',
          explain: t`$x_0 = \sqrt{e/16\pi\varepsilon_0E} \approx ${nice(sf(Math.sqrt(E_CH / (16 * Math.PI * EPS0 * E)) * 1e9, 3))}$ nm and $\Delta W = \sqrt{eE/4\pi\varepsilon_0}\ \text{eV} \approx ${nice(sf(dW, 3))}$ eV. Emission rises as $e^{\Delta W/kT}$, so even tenths of an eV matter for a cathode at 1 500 K, where $kT \approx 0.13$ eV.`,
        };
      },
    }),
    num({
      id: 'cp-sphere-force', difficulty: 3,
      gen(r) {
        const q = r.pick([2, 4]), R = r.pick([2, 3]), a = r.pick([5, 6, 8]);
        const Rm = R / 100, am = a / 100, F = (KC * (q * 1e-9) ** 2 * Rm * am) / (am * am - Rm * Rm) ** 2;
        return {
          prompt: t`A $${q}$ nC charge is ${a} cm from the centre of a grounded metal sphere of radius ${R} cm. Find the force on it.`,
          visual: images({ geometry: 'sphere', q: 5, pos: [6, 0], R: 3, x: [-6, 10], y: [-4.5, 4.5], image: false, lines: 8 }, 'A charge near a grounded sphere (not to the numbers in the question).'),
          answer: F * 1e6, units: 'uN', tol: { rel: 0.01 },
          errors: [{ value: ((KC * (q * 1e-9) ** 2 * (R / a)) / am ** 2) * 1e6, feedback: t`The image sits at $R^2/a$ from the centre, not at the centre: the distance to it is $a - R^2/a$.` }],
          hints: [t`Image: $q' = -qR/a$ at $b = R^2/a$.`, t`$F = \dfrac{kq|q'|}{(a - b)^2} = \dfrac{kq^2Ra}{(a^2 - R^2)^2}$.`],
          teach: 'Find the image, then use Coulomb’s law between the charge and its image.',
          explain: t`$q' = ${nice(sf((-q * R) / a, 3))}$ nC at $${nice(sf((R * R) / a, 3))}$ cm; $F = \dfrac{kq^2Ra}{(a^2 - R^2)^2} \approx ${nice(sf(F * 1e6, 3))}\ \mu\text{N}$, attractive.`,
        };
      },
    }),
    mcq({
      id: 'cp-corner', difficulty: 3,
      prompt: t`A charge $q$ sits at $(a, b)$ in the corner between two grounded conducting half-planes meeting at a right angle along the $z$-axis (the planes $x = 0$ and $y = 0$). Which set of images solves it?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-2, 2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0', lower: '-2', from: -3, to: 3, color: 'ink3', alpha: 0.18 }, { fn: '2', lower: '0', from: -3, to: 0, color: 'ink3', alpha: 0.18 }], curves: [{ fn: '0', domain: [0, 3], color: 'ink2', width: 3 }, { param: ['0', 't'], t: [0, 2], color: 'ink2', width: 3 }], points: [{ x: 1.4, y: 0.9, color: 'warn', label: 'q at (a, b)', r: 6 }] }, caption: 'The grounded corner (the real region is the unshaded quarter).' },
      choices: [
        t`$-q$ at $(-a, b)$, $-q$ at $(a, -b)$ and $+q$ at $(-a, -b)$`,
        t`$-q$ at $(-a, b)$ and $-q$ at $(a, -b)$`,
        t`$-q$ at $(-a, -b)$ only`,
        t`$-q$ at all three mirror points`,
      ],
      answer: 0,
      why: {
        1: t`With only two images, the plane $y = 0$ sees $q$ and its mirror cancel, but the image at $(-a, b)$ is left unbalanced there.`,
        2: 'One image at the opposite corner zeroes the potential at the corner point only, not along either plane.',
        3: 'Then the potential on the planes would not cancel: each plane needs pairs of opposite charges mirrored across it.',
      },
      hints: ['Reflect q in each plane, then reflect those images in the other plane.', 'Check one plane: every charge must have an opposite partner at its mirror point.'],
      teach: 'Images in a corner come from repeated reflection; each reflection flips the sign.',
      explain: t`Reflecting $q$ in $x = 0$ gives $-q$ at $(-a, b)$; in $y = 0$, $-q$ at $(a, -b)$; reflecting either of those in the other plane gives $+q$ at $(-a, -b)$. Now across each plane every charge faces its opposite, so both planes sit at $V = 0$. This works for angles of $180°/n$; for other angles the images never close up.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §3.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Sze & Ng, Physics of Semiconductor Devices (3rd ed.), §3.3: image-force lowering', url: 'https://onlinelibrary.wiley.com/doi/book/10.1002/0470068329' },
  ],
});
