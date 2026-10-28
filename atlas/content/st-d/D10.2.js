// Potential flow and 2D electrostatics from one analytic function. A complex
// potential W = φ + iψ gives the velocity as u − iv = W′(z); streamlines are
// ψ = const, equipotentials φ = const, and they cross at right angles. Flow
// past a cylinder with circulation, W = U(z + a²/z) + (iΓ/2π) log z: Γ moves
// the stagnation points (sin θ = −Γ/4πUa). The Joukowski map carries the
// cylinder to an airfoil; the Kutta condition (smooth flow off the sharp
// trailing edge) fixes Γ = 4πUR sin(α + β), and Kutta–Joukowski gives the lift
// per span ρUΓ — a Cessna's wing as the worked example. No equal transit
// time; d'Alembert's zero drag stated honestly. Electrostatics: the log map
// turns a coaxial cable into a parallel-plate capacitor (C′ = 2πε/ln(b/a)),
// and Maxwell's map z = (1 + w + eʷ)/π draws the fringe field at a
// capacitor's edge. Transfer: a rotor blade in Mars air.
import { lesson, mcq, num } from '../../src/core/content.js';
import { num as nm, apart, cxmap } from './_cx.js';
import { r4 } from './_cx3.js';
import * as F from '../../src/viz/model/cx3-flow.js';

const t = String.raw;
const PI = Math.PI;
const DEG = PI / 180;
const flow = (params, caption) => ({ type: 'cx3-flow', params: { readout: false, dots: false, controls: [], ...params }, caption });
const EPS0 = 8.8541878128e-12;

export default lesson({
  id: 'st-d.D10.2',
  title: 'Potential flow and electrostatics in 2D',
  minutes: 16, difficulty: 3,
  intro: t`In a steady, frictionless, incompressible, swirl-free 2D flow, the velocity is the gradient of a **velocity potential** $\phi$, and the flow is tangent to the curves of a **stream function** $\psi$. Both are harmonic, and they are the real and imaginary parts of one analytic **complex potential** $W = \phi + i\psi$, whose derivative is the velocity, conjugated: $u - iv = W'(z)$. Streamlines ($\psi$ constant) and equipotentials ($\phi$ constant) cross at right angles, because $W$ is conformal. For a stream $U$ past a cylinder of radius $a$, with circulation $\Gamma$:

$$W(z) = U\left(z + \frac{a^2}{z}\right) + \frac{i\Gamma}{2\pi}\log z,\qquad L' = \rho U\Gamma$$

The circulation makes the air go faster over the top than underneath, and the **Kutta–Joukowski theorem** turns that into a lift $L'$ per unit span. Electrostatics in 2D is the same mathematics, with the electric potential in place of $\phi$.`,
  symbols: [
    { tex: 'W', text: t`the complex potential, $\phi + i\psi$, in $\text{m}^2/\text{s}$` },
    { tex: 'z', text: t`position in the plane, $x + iy$, in metres, with the cylinder’s centre at $0$` },
    { tex: 'U', text: 'the free-stream speed far from the body, m/s (flowing in the +x direction here)' },
    { tex: 'a', text: 'the cylinder’s radius, m' },
    { tex: t`\Gamma`, text: t`the circulation $\oint \vec v\cdot d\vec r$ round the body, $\text{m}^2/\text{s}$, clockwise positive — the strength of the swirl added to the flow` },
    { tex: t`\rho`, text: t`the fluid’s density, $\text{kg/m}^3$` },
    { tex: "L'", text: 'the lift per unit span (length along the wing or cylinder), N/m, at right angles to the stream' },
  ],
  why: t`This is the theory that first explained how a wing lifts, and it still gives the lift slope of thin airfoils within a few percent; the same maps design electrode shapes, compute capacitances and fringe fields, and model groundwater and heat flow.`,
  visual: {
    type: 'cx3-flow',
    title: 'Flow past a wing, built from a cylinder',
    lead: t`Left: flow past a cylinder in the circle plane. Right: the same flow carried by $\zeta = z + 1/z$ onto a Joukowski airfoil. Blue lines are streamlines; red dots are stagnation points; gold and violet dots are parcels released together upstream (above and below the dividing streamline).`,
    tasks: [
      t`Untick the Kutta condition and set $\Gamma = 0$: the rear stagnation point moves up onto the upper surface and the air whips round the sharp trailing edge — at infinite speed, in this model. Tick it again: the stagnation point slides to the trailing edge.`,
      t`Release a row of dots: the gold parcels over the top reach the trailing edge well **before** the violet ones underneath. They do not meet again — there is no “equal transit time”.`,
      t`Raise the angle of attack and watch $C_L$ grow, close to $2\pi\sin(\alpha + \beta)$ (the readout divides by the chord). With camber, the airfoil lifts even at $\alpha = 0$.`,
    ],
    params: { mode: 'airfoil', panels: ['circle', 'flow'], alpha: 5, kutta: true, camber: 0.08, thick: 0.1, dots: true, showSpeed: true, readout: ['gamma', 'kutta', 'cl'], x: [-3.2, 3.2], y: [-1.9, 1.9] },
    caption: t`Ideal flow: inviscid and incompressible. Real air has a thin boundary layer, a wake, some drag, and stalls at high angles of attack (around $15^\circ$); none of that is here. The Kutta condition stands in for the viscosity that, in real air, sets the circulation. The lift coefficient is the 2D value for an infinitely long wing.`,
  },
  example: {
    prompt: t`A Cessna 172 (weight about $10.9$ kN, wingspan $11.0$ m, chord $1.47$ m) cruises at $V = 55$ m/s in sea-level air ($\rho = 1.225\ \text{kg/m}^3$). Treat the wing as a 2D thin flat-plate airfoil with uniform lift along the span. What circulation does it need, and at what angle of attack?`,
    visual: flow({ mode: 'airfoil', alpha: 3.3, camber: 0, thick: 0.03, kutta: true, stag: true, x: [-3.2, 3.2], y: [-1.6, 1.6] }, t`A nearly flat Joukowski airfoil at $\alpha = 3.3^\circ$ with the Kutta circulation: the flow leaves the trailing edge smoothly.`),
    steps: [
      { label: 'Lift per span', text: t`In level flight the lift balances the weight: $L' = \dfrac{10\,900\ \text{N}}{11.0\ \text{m}} = 991\ \text{N/m}$.` },
      { label: 'Circulation', text: t`Kutta–Joukowski: $\Gamma = \dfrac{L'}{\rho V} = \dfrac{991}{1.225\times55} = 14.7\ \text{m}^2/\text{s}$.` },
      { label: 'Kutta condition', text: t`For a flat plate of chord $c$ (the Joukowski image of a circle of radius $c/4$ centred at $0$), smooth flow off the trailing edge needs $\Gamma = 4\pi U\tfrac{c}{4}\sin\alpha = \pi Vc\sin\alpha$.` },
      { label: 'Angle', text: t`$\sin\alpha = \dfrac{\Gamma}{\pi Vc} = \dfrac{14.7}{\pi\times55\times1.47} = 0.0579$, so $\alpha = 3.3^\circ$. Equivalently, $C_L = \dfrac{L'}{\tfrac12\rho V^2c} = 0.364 = 2\pi\sin\alpha$.` },
      { label: 'Honesty', text: t`The real 172 flies at a few degrees too, but for different reasons that roughly cancel: its cambered wing lifts at $\alpha = 0$ (helping), and its finite span loses lift slope to wingtip vortices — for its aspect ratio of about 7.5, roughly $2\pi\cdot\frac{7.5}{9.5} \approx 5.0$ per radian instead of $2\pi$ (hurting). The 2D theory gets the size right, not every detail.` },
    ],
    answer: t`$\Gamma \approx 14.7\ \text{m}^2/\text{s}$, $\alpha \approx 3.3^\circ$`,
  },
  practice: [
    num({
      id: 'cp-surface', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 45, 60, 90, 20, 75]);
        const s = Math.sin(th * DEG), ans = 1 - 4 * s * s;
        return {
          prompt: t`For ideal flow past a cylinder with no circulation, the surface speed at angle $\theta$ from the front stagnation point is $2U|\sin\theta|$. Bernoulli’s equation gives the **pressure coefficient** $C_p = \dfrac{p - p_\infty}{\tfrac12\rho U^2} = 1 - \left(\dfrac{V}{U}\right)^2$. Find $C_p$ on the surface at $\theta = ${th}^\circ$.`,
          visual: flow({ mode: 'cylinder', gamma: 0, alpha: 0, speed: true, stag: true, x: [-3, 3], y: [-1.9, 1.9] }, 'The cylinder, its streamlines and the speed: orange is faster than the free stream (lower pressure), blue slower (higher pressure).'),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: apart(ans, [{ value: 1 - 2 * s, feedback: t`Square the speed ratio: $(V/U)^2 = 4\sin^2\theta$.` }, { value: 1 - s * s, feedback: t`The surface speed is $2U\sin\theta$, not $U\sin\theta$: square the 2 as well.` }].filter((e) => Math.abs(e.value - ans) > 0.01)),
          hints: [t`$V/U = 2\sin ${th}^\circ = ${nm(2 * s, 4)}$.`, t`$C_p = 1 - (V/U)^2$.`],
          teach: t`On the cylinder $C_p = 1 - 4\sin^2\theta$: $+1$ at the stagnation points, $-3$ at the top and bottom.`,
          explain: t`$C_p = 1 - 4\sin^2 ${th}^\circ = ${nm(ans, 3)}$. ${ans < 0 ? 'Negative: suction, lower pressure than far away.' : 'Positive: the air is slower than the stream and the pressure is higher.'} The front and back are symmetric, so the pressures balance and there is no drag — d’Alembert’s paradox; real flow separates behind the cylinder and the back pressure never recovers.`,
        };
      },
    }),
    num({
      id: 'stag-angle', difficulty: 2,
      gen(r) {
        const U = r.pick([5, 10, 20]), a = r.pick([0.5, 1, 0.2]), k = r.pick([0.2, 0.35, 0.5, 0.7]);
        const G = 4 * PI * U * a * k, ans = Math.asin(k) / DEG;
        return {
          prompt: t`A cylinder of radius $a = ${a}$ m spins in a stream of $U = ${U}$ m/s, giving the flow a clockwise circulation $\Gamma = ${nm(G, 3)}\ \text{m}^2/\text{s}$. Its two stagnation points move down the rear and front of the surface. How far below the horizontal are they, in degrees? (Use $\sin\theta_s = -\Gamma/4\pi Ua$.)`,
          visual: flow({ mode: 'cylinder', gamma: r4(G / (U * a)), alpha: 0, stag: false, x: [-3, 3], y: [-2, 2] }, t`The flow with this circulation (stagnation points not marked). Streamlines crowd above the cylinder, where the swirl adds to the stream.`),
          answer: ans, units: '°', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.asin(k / 2) / DEG, feedback: t`The surface speed is $2U\sin\theta + \Gamma/2\pi a$; setting it to zero gives $\sin\theta = -\Gamma/4\pi Ua$, with $4\pi$.` }, { value: (k * 180) / PI, feedback: t`$\Gamma/4\pi Ua$ is the sine of the angle; take the arcsine.` }]),
          hints: [t`$\dfrac{\Gamma}{4\pi Ua} = \dfrac{${nm(G, 3)}}{4\pi\times${U}\times${a}} = ${nm(k, 3)}$.`, t`$\theta_s = -\arcsin ${nm(k, 3)}$: both points sit that far below the horizontal (front and back).`],
          teach: t`Circulation slides both stagnation points down the cylinder by $\arcsin(\Gamma/4\pi Ua)$; they meet at the bottom when $\Gamma = 4\pi Ua$.`,
          explain: t`$\arcsin ${nm(k, 3)} = ${nm(ans, 3)}^\circ$. This spinning-cylinder lift is the **Magnus effect**: it curves a spinning ball, and Flettner rotor ships use it for thrust. Lift per metre: $\rho U\Gamma$.`,
        };
      },
    }),
    mcq({
      id: 'transit', difficulty: 2,
      prompt: t`A popular explanation of lift says the air over the curved top of a wing has further to go and must “meet up again” with the air underneath at the trailing edge, so it moves faster. In the picture, parcels released together upstream are tracked past the airfoil. What does ideal-flow theory (and every wind tunnel) actually show?`,
      visual: { type: 'cx3-flow', params: { mode: 'airfoil', alpha: 6, camber: 0.06, thick: 0.08, kutta: true, dots: true, controls: [], readout: false, x: [-3.2, 3.2], y: [-1.6, 1.6] }, caption: 'Parcels released in a vertical row (gold above the dividing streamline, violet below). Press “Release” to watch them go.' },
      choices: [
        'The upper parcels arrive at the trailing edge first and never meet their partners again; the speed-up comes from the circulation the Kutta condition fixes',
        'The parcels meet again exactly at the trailing edge, as the explanation says',
        'The lower parcels arrive first, because the lower surface is shorter',
        'Both arrive together, but only because the air is compressed over the top',
      ],
      answer: 0,
      why: {
        1: 'Nothing forces them to meet: the release row is cut in two by the airfoil and the halves stay apart downstream.',
        2: 'Path length has nothing to do with it: the upper parcels move so much faster that they win easily despite the longer path.',
        3: 'Compressibility is negligible at low speeds, and the parcels do not arrive together anyway.',
      },
      hints: ['Watch the gold and violet rows as they pass the trailing edge.', 'What sets the speed difference in the theory: the path lengths, or the circulation Γ?'],
      teach: 'Lift comes from circulation, fixed by the Kutta condition; the upper air arrives early — there is no equal transit time.',
      explain: t`With the Kutta circulation, the flow over the top is so much faster that its parcels reach the trailing edge well ahead of their partners underneath (the model’s test checks it). A flat plate has equal path lengths on both sides and still lifts. The pressure difference that lifts the wing goes with the speed difference by Bernoulli, and the total, $\rho U\Gamma$, depends only on the circulation.`,
    }),
    num({
      id: 'kutta-gamma', difficulty: 2,
      gen(r) {
        const U = r.pick([30, 50, 70, 25]), c = r.pick([1, 1.5, 2, 0.8]), al = r.pick([2, 4, 5, 6, 8]);
        const ans = PI * U * c * Math.sin(al * DEG);
        return {
          prompt: t`A thin flat-plate wing section of chord $c = ${c}$ m meets air at $U = ${U}$ m/s at an angle of attack of $${al}^\circ$. What circulation does the Kutta condition demand, in $\text{m}^2/\text{s}$? (For a flat plate, $\Gamma = \pi Uc\sin\alpha$.)`,
          visual: flow({ mode: 'airfoil', alpha: al, camber: 0, thick: 0.02, kutta: true, stag: true, x: [-3.2, 3.2], y: [-1.6, 1.6] }, t`A near-flat Joukowski plate at $${al}^\circ$, with the Kutta circulation: the rear stagnation point sits on the trailing edge.`),
          answer: ans, units: 'm^2/s', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 4 * PI * U * c * Math.sin(al * DEG), feedback: t`The Joukowski circle has radius $R = c/4$: $\Gamma = 4\pi UR\sin\alpha = \pi Uc\sin\alpha$.` }, { value: PI * U * c * al, feedback: t`Use $\sin\alpha$ with $\alpha$ in radians or degrees consistently: $\sin ${al}^\circ = ${nm(Math.sin(al * DEG), 4)}$.` }]),
          hints: [t`$\Gamma = \pi\times${U}\times${c}\times\sin ${al}^\circ$.`, t`$\sin ${al}^\circ = ${nm(Math.sin(al * DEG), 4)}$.`],
          teach: t`The Kutta condition fixes the circulation of a flat plate: $\Gamma = \pi Uc\sin\alpha$, so $C_L = 2\pi\sin\alpha$.`,
          explain: t`$\Gamma = ${nm(ans, 4)}\ \text{m}^2/\text{s}$, giving a lift of $\rho U\Gamma = ${nm(1.225 * U * ans, 3)}$ N per metre of span in sea-level air.`,
        };
      },
    }),
    num({
      id: 'zero-lift', difficulty: 3,
      gen(r) {
        const my = r.pick([0.04, 0.06, 0.08, 0.1, 0.12]), mx = r.pick([0.05, 0.1, 0.15]);
        const { beta } = F.circleFor(mx, my), ans = beta / DEG;
        return {
          prompt: t`A Joukowski airfoil comes from a circle through $z = 1$ with centre $c_0 = -${mx} + ${my}i$, mapped by $\zeta = z + 1/z$. The Kutta condition gives $\Gamma = 4\pi UR\sin(\alpha + \beta)$, where $\beta = \arctan\dfrac{${my}}{1 + ${mx}}$ is the angle of the line from $c_0$ to the trailing edge point $z = 1$ below the horizontal. At what angle of attack does this cambered airfoil give **zero** lift? Answer in degrees (it will be negative).`,
          visual: flow({ mode: 'airfoil', alpha: 0, camber: my, thick: mx, kutta: true, stag: true, panels: ['circle', 'flow'], x: [-3.2, 3.2], y: [-1.6, 1.6] }, t`The circle and its airfoil at $\alpha = 0$: with camber, the Kutta condition already demands circulation, so the airfoil lifts.`),
          answer: -ans, units: '°', tol: { rel: 0.005 },
          errors: apart(-ans, [{ value: 0, feedback: 'At α = 0 a cambered airfoil still lifts: sin(0 + β) ≠ 0.' }, { value: (-my / (1 + mx)) * (180 / PI) * 2, feedback: t`$\alpha + \beta = 0$, so $\alpha = -\beta$ — not $-2\beta$.` }]),
          hints: [t`Zero lift means $\Gamma = 0$: $\sin(\alpha + \beta) = 0$.`, t`$\alpha = -\beta = -\arctan(${my}/${nm(1 + mx, 3)})$.`],
          teach: 'Camber shifts the lift curve: a cambered airfoil’s zero-lift angle is negative, −β.',
          explain: t`$\beta = \arctan(${my}/${nm(1 + mx, 3)}) = ${nm(ans, 3)}^\circ$, so lift vanishes at $\alpha = -${nm(ans, 3)}^\circ$. Real cambered sections behave the same way: a NACA 2412 has its zero-lift angle near $-2^\circ$.`,
        };
      },
    }),
    num({
      id: 'coax', difficulty: 2,
      gen(r) {
        const [name, a, b, er] = r.pick([['RG-58 coaxial cable', 0.45, 1.47, 2.25], ['RG-6 satellite-TV cable', 0.51, 2.33, 1.6], ['RG-213 cable', 1.13, 3.62, 2.25], ['an air-spaced line', 1, 2.3, 1]]);
        const ans = (2 * PI * EPS0 * er) / Math.log(b / a) * 1e12;
        return {
          prompt: t`The map $w = \operatorname{Log} z$ turns the region between two circles, $a < |z| < b$, into a rectangle $\ln a < \operatorname{Re} w < \ln b$ of height $2\pi$: a coaxial cable becomes a parallel-plate capacitor with gap $\ln(b/a)$ and width $2\pi$. Conformal maps keep potentials harmonic and charges in place, so the capacitance per length is $C' = \varepsilon\cdot\dfrac{2\pi}{\ln(b/a)}$. For ${name} — inner conductor radius ${a} mm, shield radius ${b} mm, dielectric $\varepsilon_r = ${er}$ — find $C'$ in pF/m. ($\varepsilon = \varepsilon_r\varepsilon_0$, $\varepsilon_0 = 8.854\times10^{-12}$ F/m.)`,
          visual: cxmap({ f: 'log', x: [-2.5, 2.5], y: [-2.5, 2.5], wx: [-1.6, 1.4], wy: [-3.4, 3.4], grid: 'polar', gr: [a / b * 2.2, 2.2], gth: [-PI, PI], gn: 5, gm: 12, drag: false, cut: false, ticks: false }, t`The annulus between the conductors (left, scaled) and its image under $\operatorname{Log} z$ (right): circles become vertical lines — the plates — and rays become horizontal field lines.`),
          answer: ans, units: 'pF/m', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: ans / er, feedback: t`Multiply by $\varepsilon_r = ${er}$: the dielectric raises the capacitance.` }, { value: (2 * PI * EPS0 * er) / Math.log10(b / a) * 1e12, feedback: t`$\ln$ is the natural logarithm: the map is $\operatorname{Log}$, not $\log_{10}$.` }]),
          hints: [t`$\ln(b/a) = \ln(${b}/${a}) = ${nm(Math.log(b / a), 4)}$.`, t`$C' = \dfrac{2\pi\times${er}\times8.854\times10^{-12}}{${nm(Math.log(b / a), 4)}}$ F/m; convert to pF/m.`],
          teach: t`$\operatorname{Log}$ unrolls an annulus into a strip: a coaxial capacitor is a parallel-plate one of gap $\ln(b/a)$ and width $2\pi$.`,
          explain: t`$C' = ${nm(ans, 4)}$ pF/m. ${name.startsWith('RG-58') ? 'The data sheet value is about 100 pF/m.' : ''} The map does the work Gauss’s law would: a uniform field between the “plates” in $w$ becomes the radial $1/r$ field in $z$.`,
        };
      },
    }),
    mcq({
      id: 'fringe', difficulty: 3,
      prompt: t`Maxwell’s map $z = \dfrac{1}{\pi}\left(1 + w + e^{w}\right)$ sends the strip $-\pi < \operatorname{Im} w < \pi$ onto the space round the end of a parallel-plate capacitor (plates at $y = \pm1$ for $x < 0$). In $w$ the potential is simply $V \propto \operatorname{Im} w$, so horizontal lines in $w$ map to equipotentials and vertical ones to field lines. Where is the field strongest?`,
      visual: cxmap({ f: 'uv', u: '(1 + x + exp(x)*cos(y))/pi', v: '(y + exp(x)*sin(y))/pi', x: [-4.5, 2.5], y: [-3.2, 3.2], gx: [-4, 2], gy: [-3.1416, 3.1416], gn: 13, wx: [-2.6, 1.4], wy: [-2, 2], grid: 'cartesian', drag: false, ticks: false, zname: 'w: potential coordinates', wname: 'z: the capacitor’s edge' }, t`Left, the strip in $w$; right, its image — equipotentials (orange) and field lines (blue) round the edge of the plates, which are the images of the strip’s top and bottom edges.`),
      choices: [
        'At the plates’ edges, where the field lines crowd together round the sharp ends',
        'Uniformly everywhere between the plates',
        'Far outside the plates, in the fringe region',
        'Exactly halfway between the plates at their open end',
      ],
      answer: 0,
      why: {
        1: 'Deep inside, the field is uniform, V/d. Near the open end it is not: it bulges out and concentrates at the edges.',
        2: 'Out there the field lines spread apart: the field is weak.',
        3: t`On the midplane the field lines are spread out; the potential there is just the average of the plates’.`,
      },
      hints: ['The field is strong where equipotentials crowd together (and field lines bunch up).', 'Look at the tips of the plates.'],
      teach: 'Fields concentrate at sharp edges: near the edge of a thin plate they grow like 1/√r, the reason for rounded electrodes and for corona at points.',
      explain: t`The images of the grid crowd at the plates’ ends: the field there grows without limit for an infinitely thin plate, like $1/\sqrt r$. Real high-voltage electrodes are rounded (Rogowski profiles) to avoid breakdown at the edges. Deep inside the plates the field is uniform, $V/d$, and the fringe spreads it outward beyond the ends — which is why a real capacitor’s capacitance is a little larger than $\varepsilon A/d$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-blade', difficulty: 3, transfer: true,
      gen(r) {
        const [where, rho, U, c, al] = r.pick([
          ['a rotor blade of a Mars helicopter, in Martian air', 0.017, 110, 0.12, 6],
          ['a sailplane’s wing at sea level', 1.225, 30, 0.9, 5],
          ['a high-altitude solar drone’s wing at 18 km', 0.12, 25, 2.4, 6],
          ['a Mars helicopter blade section near its tip', 0.017, 150, 0.08, 5],
        ]);
        const G = PI * U * c * Math.sin(al * DEG), ans = rho * U * G;
        return {
          prompt: t`Treat ${where} as a thin flat-plate section: chord $c = ${c}$ m, airspeed $U = ${U}$ m/s, angle of attack $${al}^\circ$, air density $\rho = ${rho}\ \text{kg/m}^3$. Using the Kutta condition and the Kutta–Joukowski theorem, find the lift per metre of span, in N/m.`,
          visual: flow({ mode: 'airfoil', alpha: al, camber: 0, thick: 0.02, kutta: true, stag: true, x: [-3.2, 3.2], y: [-1.6, 1.6] }, 'The section as a near-flat Joukowski plate with the Kutta circulation. Shape and flow are to scale; the air is ideal.'),
          answer: ans, units: 'N/m', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: G, feedback: t`That is $\Gamma$, in $\text{m}^2/\text{s}$; multiply by $\rho U$.` }, { value: 1.225 * U * G, feedback: t`Use the local density, ${rho} kg/m³, not sea-level air.` }, { value: rho * U * 4 * G, feedback: t`For a plate the circle’s radius is $c/4$: $\Gamma = \pi Uc\sin\alpha$.` }]),
          hints: [t`$\Gamma = \pi Uc\sin\alpha = \pi\times${U}\times${c}\times\sin ${al}^\circ$.`, t`$L' = \rho U\Gamma$.`, t`Equivalently $L' = \pi\rho U^2c\sin\alpha$.`],
          teach: t`Kutta condition plus Kutta–Joukowski: $L' = \rho U\Gamma = \pi\rho U^2c\sin\alpha$ for a flat plate.`,
          explain: t`$\Gamma = ${nm(G, 4)}\ \text{m}^2/\text{s}$ and $L' = ${rho}\times${U}\times${nm(G, 4)} = ${nm(ans, 4)}$ N/m. ${rho < 0.05 ? 'Martian air is about 70 times thinner than Earth’s, which is why Ingenuity’s rotors spun at about 2 400 rpm, several times faster than a helicopter’s on Earth.' : rho < 0.5 ? 'Thin air at altitude is why such drones have huge, slow wings.' : 'A sailplane’s long, slender wings come close to the 2D ideal because their tips are far apart.'} Real sections at low Reynolds numbers (as on Mars) lift less than this ideal.`,
        };
      },
    }),
    num({
      id: 'cp-coax', difficulty: 2,
      gen(r) {
        const ratio = r.pick([2, 2.5, 3, 3.5, 4]), er = r.pick([1, 2.1, 2.25, 4]);
        const ans = (2 * PI * EPS0 * er) / Math.log(ratio) * 1e12;
        return {
          prompt: t`A coaxial line has a shield radius ${ratio} times its inner conductor’s radius, and a dielectric with $\varepsilon_r = ${er}$. Using the log map ($C' = 2\pi\varepsilon/\ln(b/a)$), find its capacitance per metre, in pF/m.`,
          visual: cxmap({ f: 'log', x: [-2.5, 2.5], y: [-2.5, 2.5], wx: [-1.6, 1.4], wy: [-3.4, 3.4], grid: 'polar', gr: [2.2 / ratio, 2.2], gth: [-PI, PI], gn: 5, gm: 12, drag: false, cut: false, ticks: false }, t`The annulus and its image under $\operatorname{Log}$: a rectangle with plates $\ln(b/a)$ apart.`),
          answer: ans, units: 'pF/m', tol: { rel: 0.005 },
          errors: apart(ans, [{ value: ans / er, feedback: t`Include $\varepsilon_r$.` }, { value: (2 * PI * EPS0 * er) / Math.log10(ratio) * 1e12, feedback: 'Use the natural logarithm.' }]),
          hints: [t`$\ln ${ratio} = ${nm(Math.log(ratio), 4)}$.`, t`$C' = 2\pi\varepsilon_r\varepsilon_0/\ln(b/a)$.`],
          teach: 'A coax is a parallel-plate capacitor in log coordinates.',
          explain: t`$C' = \dfrac{2\pi\times${er}\times8.854\times10^{-12}}{${nm(Math.log(ratio), 4)}} = ${nm(ans, 4)}$ pF/m.`,
        };
      },
    }),
    mcq({
      id: 'cp-dalembert', difficulty: 3,
      prompt: t`Ideal-flow theory gives the Joukowski airfoil a lift $\rho U\Gamma$ and **exactly zero drag** (d’Alembert’s paradox). Which statement about this is right?`,
      visual: flow({ mode: 'airfoil', alpha: 8, camber: 0.08, thick: 0.12, kutta: true, speed: true, stag: true, x: [-3.2, 3.2], y: [-1.6, 1.6] }, 'The ideal flow, shaded by speed: fast (orange) over the top, slow (blue) at the stagnation points. Behind the airfoil the flow closes up perfectly — real flow leaves a wake.'),
      choices: [
        'The theory leaves out viscosity: real wings have skin-friction and wake drag, but where the flow stays attached the ideal lift is close to the truth',
        'Real wings have no drag either, as long as the air is dry',
        'The theory is wrong about lift as well as drag, so it is useless for wings',
        'The drag is zero only because the airfoil has a sharp trailing edge',
      ],
      answer: 0,
      why: {
        1: 'Every real body moving through a real fluid feels drag; airliners spend much of their fuel against it.',
        2: t`Thin-airfoil theory predicts a lift slope of about $2\pi$ per radian, and wind tunnels measure close to that for attached flow.`,
        3: 'A cylinder, with no sharp edge at all, also has zero drag in ideal flow: the paradox comes from leaving out viscosity, not from the shape.',
      },
      hints: ['What does the model leave out that every real fluid has?', 'Is the lift prediction tested and confirmed for small angles of attack?'],
      teach: 'Potential flow gets lift right (with the Kutta condition standing in for viscosity) and drag wrong: drag needs the boundary layer.',
      explain: t`In a frictionless flow nothing can take momentum out of the stream except the circulation, which is sideways: hence lift, no drag. Real drag comes from the thin viscous boundary layer (friction) and the wake it sheds; viscosity is also what sets up the circulation in the first place, which is why the Kutta condition works. At high angles the boundary layer separates and the wing stalls, which this model cannot see.`,
    }),
  ],
  sources: [
    { label: 'Anderson, Fundamentals of Aerodynamics (6th ed.), ch. 3–4 (potential flow, Kutta–Joukowski, thin airfoils)', url: 'https://openlibrary.org/search?q=Anderson+Fundamentals+of+Aerodynamics' },
    { label: 'Acheson, Elementary Fluid Dynamics, ch. 4 (classical aerofoil theory, and why the Kutta condition works)', url: 'https://openlibrary.org/search?q=Acheson+Elementary+Fluid+Dynamics' },
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 12 (flows and harmonic functions)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'NASA Glenn Research Center, “Incorrect lift theory #1: equal transit times”', url: 'https://www.grc.nasa.gov/www/k-12/airplane/wrong1.html' },
  ],
});
