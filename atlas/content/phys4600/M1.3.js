// Inductance and magnetic energy (Griffiths §7.2.3–7.2.4): the flux through
// one loop is proportional to the current in another, Φ₂ = M I₁, and
// Neumann's formula M = (μ₀/4π)∮∮ dl₁·dl₂/|r₁ − r₂| shows M₁₂ = M₂₁ — so the
// hard direction (a small coil's flux through a long solenoid) is easy. Two
// coaxial loops: the closed form (elliptic integrals, computed by the AGM in
// _em4.js and checked against Neumann's integral) against the dipole limit
// μ₀πa²b²/2z³. Self-inductance, and the energy W = ½LI² = (1/2μ₀)∫B²dτ:
// a coaxial cable's L′ = (μ₀/2π)ln(b/a) from its field energy; where the
// energy sits (half of it inside the geometric-mean radius √ab); a toroid.
// Transfers: a railgun's force ½L′I², a magnetorquer's crosstalk into a
// boom-mounted search-coil magnetometer.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, PI, sf, circle, polygon, bare, outOf, into, tag, mutualLoops, mutualFar } from './_em4.js';

const t = String.raw;

// the worked example: RG-58-like coax, inner radius 0.45 mm, shield radius 1.47 mm
const EX = { a: 0.45e-3, b: 1.47e-3, I: 2 };
EX.Lp = (MU0 / (2 * PI)) * Math.log(EX.b / EX.a);
EX.Wp = 0.5 * EX.Lp * EX.I ** 2;

// the Explore graph: log₁₀(M/μ₀a) against z/a, exact (dots) and dipole (dashed), for b/a = q
const QS = [0.25, 0.5, 0.75];
const ZS = Array.from({ length: 40 }, (_, k) => 0.15 * 1.1 ** k).filter((z) => z <= 5);
const dots = QS.flatMap((q, j) => ZS.map((z) => ({ x: +z.toFixed(4), y: +Math.log10(mutualLoops(1, q, z) / MU0).toFixed(5), r: 2.6, color: 'accent', when: `step(0.5 - abs(q - ${j}))` })));

/** Two coaxial coils side-on: a larger one (radius a) and a smaller one (radius b) a distance z along the axis. */
const coilsPic = (caption, { far = false } = {}) => ({
  type: 'graph',
  params: bare([-3.2, 3.2], [-1.5, 1.5], {
    curves: [{ param: ['-2 + 0.18*cos(t)', '1.1*sin(t)'], t: [0, 2 * PI], color: 'gold', width: 2.4 }, { param: [far ? '2.3 + 0.1*cos(t)' : '1.2 + 0.12*cos(t)', '0.55*sin(t)'], t: [0, 2 * PI], color: 'teal', width: 2.4 },
      { fn: '0', domain: [-3, 3], color: 'ink3', dash: [5, 4], width: 1.2 }],
    arrows: [{ from: [-2, -1.32], to: [far ? 2.3 : 1.2, -1.32], color: 'ink2', width: 1.4, label: 'z', labelDx: -40, labelDy: 12 }],
    points: [tag(-2, 1.1, 'coil 1, radius a', 'gold', { labelDx: 10, labelDy: -8 }), tag(far ? 2.3 : 1.2, 0.55, 'coil 2, radius b', 'teal', { labelDx: far ? -10 : 10, labelDy: -10, labelAlign: far ? 'right' : 'left' }), tag(-2.25, 0, 'I', 'gold', { labelAlign: 'right', labelDx: -4, labelDy: 0 })],
  }),
  caption,
});

/** A coax cable end-on with its magnetic field circling between the conductors. */
const coaxPic = (caption, sMark = null) => ({
  type: 'graph',
  params: bare([-3, 3], [-1.6, 1.6], {
    shade: [{ fn: 'sqrt(max(2.1 - x^2, 0))', lower: '-sqrt(max(2.1 - x^2, 0))', from: -1.449, to: 1.449, color: 'teal', alpha: 0.12 }, { fn: 'sqrt(max(0.1225 - x^2, 0))', lower: '-sqrt(max(0.1225 - x^2, 0))', from: -0.35, to: 0.35, color: 'gold', alpha: 0.7 }],
    curves: [circle(0.35, 'gold'), circle(1.449, 'ink2', { width: 3 }), circle(0.7, 'accent', { width: 1.2 }), circle(1.1, 'accent', { width: 1.2 }), ...(sMark ? [circle(sMark, 'violet', { dash: [5, 4], width: 1.6 })] : [])],
    arrows: [{ from: [0.7, -0.05], to: [0.7, 0.08], color: 'accent', width: 2 }, { from: [1.1, -0.05], to: [1.1, 0.08], color: 'accent', width: 2 }],
    points: [...outOf(0, 0, 'ink', 5), tag(1.5, 1.2, 'shield, current back (into page)', 'ink2'), tag(0.75, 0.62, 'B', 'accent'), ...(sMark ? [tag(-sMark * 0.71, -sMark * 0.71, 'radius s', 'violet', { labelAlign: 'right', labelDx: -8, labelDy: 8 })] : [])],
  }),
  caption,
});

/** A railgun from above: two rails, an armature, the current's field between the rails. */
const railgunPic = (caption) => ({
  type: 'graph',
  params: bare([-3.2, 3.2], [-1.4, 1.4], {
    shade: [{ fn: '0.9', lower: '0.7', from: -3, to: 3, color: 'ink3', alpha: 0.7 }, { fn: '-0.7', lower: '-0.9', from: -3, to: 3, color: 'ink3', alpha: 0.7 }, { fn: '0.7', lower: '-0.7', from: 0.6, to: 0.9, color: 'gold', alpha: 0.8 }],
    arrows: [{ from: [-2.6, 0.8], to: [-1.2, 0.8], color: 'warn', width: 2, label: 'I', labelDx: -4, labelDy: -24 }, { from: [-1.2, -0.8], to: [-2.6, -0.8], color: 'warn', width: 2 }, { from: [0.75, 0.55], to: [0.75, -0.55], color: 'warn', width: 2 }, { from: [1.0, 0], to: [2.3, 0], color: 'good', width: 2.6, label: 'F', labelDx: 6, labelDy: 0 }],
    points: [...into(-2, 0.25), ...into(-1, -0.25), ...into(0, 0.25), tag(-2.7, 1.2, 'rails', 'ink2'), tag(0.75, -0.95, 'armature', 'gold', { labelAlign: 'center', labelDx: 0, labelDy: 10 }), tag(-1.5, -0.35, 'B', 'accent', { labelAlign: 'center', labelDx: 0, labelDy: 0 })],
  }),
  caption,
});

export default lesson({
  id: 'phys4600.M1.3',
  title: 'Inductance and magnetic energy',
  minutes: 17, difficulty: 3,
  equation: t`\begin{gathered}\Phi_2 = M I_1, \qquad M = \frac{\mu_0}{4\pi}\oint\!\!\oint\frac{d\vec l_1\cdot d\vec l_2}{|\vec r_1 - \vec r_2|}, \\ W = \tfrac12 LI^2 = \frac{1}{2\mu_0}\int B^2\,d\tau\end{gathered}`,
  intro: t`A current $I_1$ in one loop makes a field whose flux through a second loop is proportional to $I_1$: $\Phi_2 = MI_1$. The constant $M$ is the **mutual inductance**, and writing the flux as $\oint\vec A\cdot d\vec l$ turns it into **Neumann’s formula** — a double line integral round both loops that depends only on their shapes and places. It is symmetric in the two loops, so $M_{12} = M_{21}$: the flux through loop 2 when 1 carries a current equals the flux through loop 1 when 2 carries the same current, however different the loops. A loop’s field threads itself too, $\Phi = LI$, with $L$ its **self-inductance**, and changing currents meet emfs $-M\,dI_1/dt$ and $-L\,dI/dt$. Pushing current up against that back emf costs work $\tfrac12LI^2$, and that energy is stored in the field, at $B^2/2\mu_0$ per cubic metre — the magnetic twin of $\tfrac12\varepsilon_0E^2$.`,
  symbols: [
    { tex: 'M', text: 'mutual inductance, in henries (H = Wb/A): flux through one loop per ampere in the other' },
    { tex: 'L', text: 'self-inductance, in henries: a loop’s own flux per ampere of its current' },
    { tex: 'd\\vec l_1,\\ d\\vec l_2', text: t`steps round loop 1 and loop 2, at positions $\vec r_1$ and $\vec r_2$, in m` },
    { tex: '\\Phi_2', text: 'the magnetic flux through loop 2, in webers' },
    { tex: 'W', text: 'the energy stored in the magnetic field, in joules' },
    { tex: 'd\\tau', text: 'a volume element, in m³; the integral runs over all space' },
  ],
  why: t`Transformers, wireless chargers, railguns and every inductor in a thruster’s power unit are designed with $M$, $L$ and the energy $B^2/2\mu_0$ — and in M2 the field’s energy becomes something that flows.`,
  visual: {
    type: 'graph',
    title: 'Mutual inductance of two coaxial loops',
    lead: t`A loop of radius $a$ and a smaller one of radius $b$ on the same axis, a distance $z$ apart. The dots are the exact $M$ from Neumann’s formula; the dashed line is the far-field approximation $M \approx \mu_0\pi a^2b^2/2z^3$, which treats each loop as a point dipole. The vertical axis is logarithmic.`,
    tasks: [
      t`Far apart, the dots sit on the dashed line, falling as $1/z^3$: doubling the distance cuts the coupling eightfold. That is why a wireless charger needs the phone on the pad.`,
      t`Close up, the dipole formula overestimates — at $z = a$ by a factor of about three.`,
      t`Change $b/a$: the far-field coupling grows as $b^2$, the receiving loop’s area.`,
    ],
    params: {
      x: [0, 5], y: [-3.5, 0.5], aspect: 'wide', axesAt: 'edge', ylog: true, xlabel: 'separation z / a', ylabel: 'M / μ₀a',
      choices: [{ key: 'q', label: t`Small loop’s radius $b/a$`, options: QS.map((q, j) => [j, String(q)]), value: 1, explain: t`The second loop’s radius as a fraction of the first’s.` }],
      curves: QS.map((q, j) => ({ fn: `log10(pi*${q * q}/(2*x^3))`, color: 'gold', dash: [6, 4], width: 2, domain: [0.6, 5], when: `step(0.5 - abs(q - ${j}))` })),
      points: dots,
      legend: [{ label: 'exact (Neumann)', color: 'accent', point: true }, { label: 'dipole approximation', color: 'gold', dash: [6, 4] }], legendAt: 'tr',
    },
    caption: t`Thin circular loops of one turn; for $N_1$ and $N_2$ turns multiply by $N_1N_2$. Exact values from Maxwell’s closed form with elliptic integrals, checked against Neumann’s integral done numerically.`,
  },
  example: {
    prompt: t`A coaxial cable has an inner conductor of radius ${EX.a * 1e3} mm and a thin outer shield of radius ${EX.b * 1e3} mm. Find its inductance per metre from the energy stored in its magnetic field, and check it against the flux.`,
    visual: coaxPic(t`The cable end-on: current out of the page in the inner conductor (gold), back in the shield; $\vec B$ circles between them (blue). Not to scale.`),
    steps: [
      { label: 'The field', text: t`Ampère’s law round a circle of radius $s$: $B = \dfrac{\mu_0I}{2\pi s}$ between the conductors, and $B = 0$ outside the shield (no net current). Take the current to flow on the inner conductor’s surface, as it does at radio frequencies.` },
      { label: 'The energy', text: t`Per metre of cable, $\dfrac{W}{\ell} = \displaystyle\int_a^b\frac{1}{2\mu_0}\left(\frac{\mu_0I}{2\pi s}\right)^2 2\pi s\,ds = \frac{\mu_0I^2}{4\pi}\ln\frac{b}{a}$.` },
      { label: 'Inductance', text: t`Set that equal to $\tfrac12L'I^2$: $L' = \dfrac{\mu_0}{2\pi}\ln\dfrac{b}{a} = (2\times10^{-7})\ln${nice(sf(EX.b / EX.a, 4))} \approx ${nice(sf(EX.Lp * 1e9, 3))}$ nH/m.` },
      { label: 'Check by flux', text: t`The flux through a strip one metre long between the conductors is $\displaystyle\int_a^b\frac{\mu_0I}{2\pi s}\,ds = \frac{\mu_0I}{2\pi}\ln\frac{b}{a}$, which is $L'I$ ✓. At ${EX.I} A the cable stores $${nice(sf(EX.Wp * 1e9, 3))}$ nJ per metre.` },
      { label: 'Sense check', text: t`RG-58 data sheets give about 250 nH/m. At DC the current fills the inner conductor and its inside field adds $\mu_0/8\pi = 50$ nH/m; the field energy sits **between** the conductors, in the dielectric, not in the copper.` },
    ],
    answer: t`$L' = \dfrac{\mu_0}{2\pi}\ln(b/a) \approx ${nice(sf(EX.Lp * 1e9, 3))}$ nH/m.`,
  },
  practice: [
    num({
      id: 'm-solenoid-coil', difficulty: 2,
      gen(r) {
        const n = r.pick([1000, 2000, 5000]), N = r.pick([20, 50, 100]), rr = r.pick([0.5, 1, 1.5]);
        const M = MU0 * n * N * PI * (rr / 100) ** 2;
        return {
          prompt: t`A small coil of ${N} turns, each of radius ${rr} cm, sits inside a long solenoid wound with ${n} turns per metre, coaxial with it. What is their mutual inductance?`,
          visual: { type: 'graph', params: bare([-3.2, 3.2], [-1.4, 1.4], {
            curves: [...[-2.6, -2.2, -1.8, -1.4, -1, -0.6, -0.2, 0.2, 0.6, 1, 1.4, 1.8, 2.2, 2.6].map((x) => ({ param: [`${x} + 0.12*cos(t)`, '1.05*sin(t)'], t: [0, 2 * PI], color: 'gold', width: 1.4 })), { param: ['0.25*cos(t)', '0.45*sin(t)'], t: [0, 2 * PI], color: 'teal', width: 2.6 }],
            points: [tag(0.3, -0.6, 'small coil', 'teal', { labelDy: 12 }), tag(-3, 1.25, 'long solenoid', 'gold')],
          }), caption: t`The long solenoid (gold turns, side-on) with the small coil inside it (teal). Not to scale.` },
          answer: M * 1e6, units: 'μH', tol: { rel: 0.01 },
          errors: [{ value: MU0 * n * PI * (rr / 100) ** 2 * 1e6, feedback: t`Each of the ${N} turns of the small coil links the flux: multiply by $N$.` }],
          hints: [t`Put the current $I$ in the solenoid: inside, $B = \mu_0nI$, uniform.`, t`The flux through the small coil is $N\cdot\pi r^2\cdot\mu_0nI$, so $M = \mu_0nN\pi r^2$.`],
          teach: 'Find M in whichever direction is easy: the solenoid’s uniform field through the small coil.',
          explain: t`$M = \mu_0nN\pi r^2 \approx ${nice(sf(M * 1e6, 3))}$ μH. By $M_{12} = M_{21}$ this is also the flux through the solenoid’s windings per ampere in the small coil — a far harder thing to compute directly.`,
        };
      },
    }),
    mcq({
      id: 'hard-direction', difficulty: 3,
      prompt: t`In the coil and solenoid of the previous problem, now put a current $I$ in the **small coil** and none in the solenoid. What is the total flux through all the solenoid’s turns?`,
      visual: { type: 'em-bfield', params: { unit: 'cm', x: [-8, 8], y: [-4, 4], loops: [{ x: 0, R: 1, I: 5 }], static: true, readouts: [], density: 1.2 }, caption: t`The field lines of the small coil alone (cut through its axis): they spread out and loop back, threading the solenoid’s turns unevenly. Not to scale.` },
      choices: [
        t`$MI = \mu_0nN\pi r^2 I$, the same mutual inductance`,
        t`Zero: the small coil’s field lines loop back inside the solenoid`,
        t`$\mu_0NI\pi r^2$, the small coil’s own flux`,
        t`It cannot be found without a numerical integral over the spreading field`,
      ],
      answer: 0,
      why: {
        1: t`The lines do loop back, but most return outside the small coil and still thread many solenoid turns; the total is not zero.`,
        2: t`That ignores the solenoid’s $n$ turns per metre: each turn the field threads counts.`,
        3: t`It could — but Neumann’s formula is symmetric, so $M_{21} = M_{12}$, and the easy direction already gave $M$.`,
      },
      hints: [t`Neumann’s formula is unchanged if you swap the labels 1 and 2.`, t`So the flux through the solenoid per ampere in the coil equals the flux through the coil per ampere in the solenoid.`],
      teach: 'M₁₂ = M₂₁ always: the flux through loop 1 per ampere in loop 2 equals the reverse, however different the loops.',
      explain: t`Neumann’s formula $M = \dfrac{\mu_0}{4\pi}\oint\oint\dfrac{d\vec l_1\cdot d\vec l_2}{|\vec r_1 - \vec r_2|}$ is symmetric in the loops, so $\Phi_{\text{solenoid}} = MI = \mu_0nN\pi r^2I$. Computing it directly would mean adding the spreading dipole-like field of the small coil through hundreds of turns — the symmetry does that integral for you.`,
    }),
    num({
      id: 'loops-far', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 5]), b = r.pick([1, 2]), k = r.pick([10, 15, 20]);
        const z = k * a, Mf = mutualFar(a / 100, b / 100, z / 100), Me = mutualLoops(a / 100, b / 100, z / 100);
        const dev = Math.abs(Me / Mf - 1);
        return {
          prompt: t`Two single circular loops, of radii ${a} cm and ${b} cm, share an axis and are ${z} cm apart. Using the far-field (dipole) approximation, what is their mutual inductance?`,
          visual: coilsPic(t`The two loops side-on on their common axis. Not to scale: they are far apart compared with their size.`, { far: true }),
          answer: Mf * 1e12, units: 'pH', tol: { rel: Math.max(0.01, 1.2 * dev) },
          errors: [
            { value: (MU0 * PI * (a / 100) ** 2 * (b / 100) ** 2) / (4 * PI * (z / 100) ** 3) * 1e12, feedback: t`On the axis a dipole’s field is $\mu_0m/2\pi z^3$, not $\mu_0m/4\pi z^3$ — the factor for the side-on direction.` },
          ],
          hints: [t`Loop 1 with current $I$ is a dipole $m = I\pi a^2$; far along its axis its field is $B = \dfrac{\mu_0m}{2\pi z^3}$, nearly uniform over loop 2.`, t`The flux through loop 2 is $B\pi b^2$, so $M = \dfrac{\mu_0\pi a^2b^2}{2z^3}$.`],
          teach: 'Far apart, two coaxial loops couple like two dipoles: M ≈ μ₀πa²b²/2z³, falling as the cube of the distance.',
          explain: t`$M \approx \dfrac{\mu_0\pi a^2b^2}{2z^3} \approx ${nice(sf(Mf * 1e12, 3))}$ pH. Maxwell’s exact formula gives $${nice(sf(Me * 1e12, 3))}$ pH, ${nice(sf(dev * 100, 2))}% less: at ${k} radii apart the dipole picture is already good.`,
        };
      },
    }),
    num({
      id: 'toroid', difficulty: 2,
      gen(r) {
        const N = r.pick([200, 500, 1000]), a = r.pick([2, 3]), b = r.pick([5, 6, 8]), h = r.pick([1, 2, 3]);
        const L = ((MU0 * N * N * h / 100) / (2 * PI)) * Math.log(b / a);
        return {
          prompt: t`A toroid of ${N} turns has a rectangular cross-section: inner radius ${a} cm, outer radius ${b} cm, height ${h} cm. Inside, $B = \mu_0NI/2\pi s$. From the energy $\int B^2/2\mu_0\,d\tau$, what is its self-inductance?`,
          visual: { type: 'em-bfield', params: { unit: 'cm', x: [-9, 9], y: [-6, 6], toroid: { x: 0, y: 0, a: 2.2, b: 5.5, N: 16, I: 2 }, static: true, readouts: [], labels: false }, caption: t`A toroid cut through its middle: the field circles inside the windings and is zero outside. Not to scale.` },
          answer: L * 1e3, units: 'mH', tol: { rel: 0.01 },
          errors: [{ value: L * 2e3, feedback: t`$W = \tfrac12LI^2$: the energy integral equals **half** of $LI^2$.` }],
          hints: [t`$W = \displaystyle\int_a^b\frac{1}{2\mu_0}\left(\frac{\mu_0NI}{2\pi s}\right)^2 h\,2\pi s\,ds = \frac{\mu_0N^2I^2h}{4\pi}\ln\frac{b}{a}$.`, t`Set $W = \tfrac12LI^2$: $L = \dfrac{\mu_0N^2h}{2\pi}\ln\dfrac{b}{a}$.`],
          teach: 'An inductance can be read off the field energy: W = ½LI² = ∫B²/2μ₀ dτ.',
          explain: t`$L = \dfrac{\mu_0N^2h}{2\pi}\ln\dfrac{b}{a} \approx ${nice(sf(L * 1e3, 3))}$ mH. The flux method gives the same: each turn links $\int_a^bB\,h\,ds$, and $N$ turns link $N$ times that.`,
        };
      },
    }),
    mcq({
      id: 'where-energy', difficulty: 2,
      prompt: t`Where is the energy $\tfrac12L'I^2$ of a coaxial cable carrying a high-frequency current (on the conductors’ surfaces) stored?`,
      visual: coaxPic(t`The cable end-on, with $\vec B$ circling between the conductors. Not to scale.`),
      choices: [
        'In the magnetic field between the conductors, most densely next to the inner conductor',
        'In the copper of the conductors, where the current flows',
        'Spread evenly through the space between the conductors',
        'Outside the cable, where its field spreads into space',
      ],
      answer: 0,
      why: {
        1: t`With the current on the surfaces, $\vec B = 0$ inside the copper. Energy lives where the field is, at $B^2/2\mu_0$.`,
        2: t`$B \propto 1/s$, so the energy density $\propto 1/s^2$: it crowds toward the inner conductor.`,
        3: t`Outside the shield the net enclosed current is zero, so $\vec B = 0$ there.`,
      },
      hints: [t`The energy density is $B^2/2\mu_0$. Where is $\vec B$ non-zero?`, t`Between the conductors $B = \mu_0I/2\pi s$.`],
      teach: 'Magnetic energy lives in the field, at density B²/2μ₀ — in a coax, in the insulation between the conductors.',
      explain: t`$u = B^2/2\mu_0 \propto 1/s^2$ between the conductors and zero elsewhere. Per thin shell of radius $s$ the energy goes as $u\cdot2\pi s\,ds \propto ds/s$: equal energy in each factor of radius, so half of it lies inside $\sqrt{ab}$.`,
    }),
    num({
      id: 'energy-fraction', difficulty: 3,
      gen(r) {
        const a = r.pick([0.5, 1]), b = r.pick([3.5, 5, 7]), s = r.pick([1.5, 2, 2.5]);
        const fr = Math.log(s / a) / Math.log(b / a);
        return {
          prompt: t`A coaxial line has $a = ${a}$ mm and $b = ${b}$ mm, with its current on the conductors’ surfaces. What percentage of its magnetic energy lies within ${s} mm of the axis?`,
          visual: coaxPic(t`The cable end-on, with a dashed circle of radius $s$. Not to scale.`, 0.35 + ((s - a) / (b - a)) * 1.1),
          answer: fr * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: ((s * s - a * a) / (b * b - a * a)) * 100, feedback: t`That is the fraction of the **area**. The energy density falls as $1/s^2$: weight each shell by it.` }],
          hints: [t`The energy in a shell of radius $s$ and thickness $ds$ is $\dfrac{\mu_0I^2}{4\pi}\dfrac{ds}{s}$ per metre.`, t`The fraction inside $s$ is $\dfrac{\ln(s/a)}{\ln(b/a)}$.`],
          teach: 'In a coax the magnetic energy is spread evenly per factor of radius: the fraction inside s is ln(s/a)/ln(b/a).',
          explain: t`$\dfrac{\ln(${s}/${a})}{\ln(${b}/${a})} \approx ${nice(sf(fr * 100, 3))}\%$. The energy crowds toward the inner conductor — which is also where the electric field is strongest, and where a cable breaks down first.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-railgun', difficulty: 3, transfer: true,
      gen(r) {
        const Lp = r.pick([0.42, 0.5, 0.6]), I = r.pick([1, 2, 3, 4]);
        const F = 0.5 * Lp * 1e-6 * (I * 1e6) ** 2;
        return {
          prompt: t`A railgun drives a current $I$ along one rail, across a sliding armature and back along the other. As the armature advances by $dx$ the circuit’s inductance grows by $L'\,dx$, with $L' = ${Lp}\ \mu\text{H/m}$. At $I = ${I}$ MA, what force pushes the armature?`,
          visual: railgunPic(t`A railgun from above: current along the rails and across the armature (orange), the field between the rails into the page (blue), the force on the armature (green). Not to scale.`),
          answer: F / 1e6, units: 'MN', tol: { rel: 0.01 },
          errors: [
            { value: (Lp * 1e-6 * (I * 1e6) ** 2) / 1e6, feedback: t`At constant current the supply delivers $I^2\,dL$, but only half becomes work: the other half, $\tfrac12I^2\,dL$, is the field’s new energy. $F = \tfrac12L'I^2$.` },
          ],
          hints: [t`Hold $I$ fixed. Moving $dx$ adds $\tfrac12I^2\,dL = \tfrac12L'I^2\,dx$ to the field’s energy, and the supply provides twice that against the back emf.`, t`The rest is mechanical work $F\,dx$: $F = \tfrac12L'I^2$.`],
          teach: 'A circuit pushes on its moving parts with F = ½I² dL/dx: magnetic forces move things toward higher inductance.',
          explain: t`$F = \tfrac12L'I^2 = \tfrac12(${Lp}\times10^{-6})(${I}\times10^{6})^2 \approx ${nice(sf(F / 1e6, 3))}$ MN. The current supply does $I^2\,dL$ of work against the back emf; half goes into the growing field, half pushes the armature. Railgun rails see these same forces pushing them **apart**, the engineering problem that has kept such guns experimental.`,
        };
      },
    }),
    num({
      id: 'cp-crosstalk', difficulty: 3, transfer: true,
      gen(r) {
        const N1 = r.pick([200, 400]), a = r.pick([5, 8]), N2 = r.pick([1000, 2000]), b = r.pick([1, 1.5]), z = r.pick([1, 1.5, 2]), dIdt = r.pick([5, 10, 20]);
        const Mf = N1 * N2 * mutualFar(a / 100, b / 100, z), Me = N1 * N2 * mutualLoops(a / 100, b / 100, z);
        const emf = Mf * dIdt, dev = Math.abs(Me / Mf - 1);
        return {
          prompt: t`A satellite’s air-core magnetorquer (${N1} turns, radius ${a} cm) sits on the same axis as a search-coil magnetometer (${N2} turns, radius ${b} cm) mounted on a boom ${z} m away. The torquer’s current is switched at ${dIdt} A/s. What spurious emf does that induce in the magnetometer’s coil?`,
          visual: coilsPic(t`The magnetorquer (gold) and the search coil (teal) on one axis, far apart along the boom. Not to scale.`, { far: true }),
          answer: emf * 1e6, units: 'μV', tol: { rel: Math.max(0.01, 1.2 * dev) },
          errors: [{ value: (emf / (N1 * N2)) * 1e6, feedback: t`Every turn of one coil links every turn of the other: $M$ carries a factor $N_1N_2$.` }],
          hints: [t`Far apart, $M \approx N_1N_2\dfrac{\mu_0\pi a^2b^2}{2z^3}$.`, t`The emf is $M\,dI/dt$.`],
          teach: 'Coupling between coils falls as 1/z³: that steep fall is why magnetometers ride on booms.',
          explain: t`$M \approx ${tex(Mf, 3)}$ H, so $\mathcal E = M\,dI/dt \approx ${nice(sf(emf * 1e6, 3))}$ μV — against a geomagnetic signal the coil is trying to read. Halving the boom would raise it eightfold; that $1/z^3$ is why spacecraft put magnetometers at the end of long booms and pause the torquers while they measure.`,
        };
      },
    }),
    mcq({
      id: 'cp-half', difficulty: 2,
      prompt: t`A supply raises the current through an ideal inductor (no resistance) from 0 to $I$. How much work does it do, and why?`,
      visual: { type: 'em-ac', params: { mode: 'rl', E: 12, R: 4, L: 0.2, panel: 'energy', controls: false, readout: false, t: 0.12 }, caption: t`A battery building up the current in a coil through a resistor; the lower panel shows where the energy goes. Ideal elements.` },
      choices: [
        t`$\tfrac12LI^2$: the back emf $L\,dI/dt$ grows only as the current does, so the work $\int L\,i\,di$ gives the half`,
        t`$LI^2$: the supply works against an emf $L\,dI/dt$ while the current is $I$`,
        t`Zero: an ideal inductor has no resistance, so nothing opposes the current`,
        t`$\tfrac12LI^2$, but it is lost as heat in the wire`,
      ],
      answer: 0,
      why: {
        1: t`The current is not $I$ all along: it climbs from 0. The power is $L\,i\,di/dt$, and integrating $i\,di$ gives $\tfrac12I^2$.`,
        2: 'Resistance is not what an inductor has: its back emf opposes any change of current, and that takes work.',
        3: t`An ideal inductor heats nothing; the energy is stored in its field, and comes back when the current falls.`,
      },
      hints: [t`The power delivered against the back emf is $P = iL\,di/dt$.`, t`$W = \int_0^I Li\,di$.`],
      teach: 'The work to build up a current is ½LI², stored in the magnetic field and returned when the current dies.',
      explain: t`$W = \displaystyle\int P\,dt = \int_0^I Li\,di = \tfrac12LI^2$, stored in the field as $\displaystyle\frac{1}{2\mu_0}\int B^2\,d\tau$. When the current falls, the back emf reverses and the field hands the energy back — the spark when you break an inductive circuit.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §7.2.3–7.2.4', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Jackson, Classical Electrodynamics (3rd ed.), §5.17: self- and mutual inductance', url: 'https://www.wiley.com/en-us/Classical+Electrodynamics%2C+3rd+Edition-p-9780471309321' },
  ],
});
