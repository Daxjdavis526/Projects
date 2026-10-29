// Momentum and the centre of mass: P = MṘ, Ṗ = F_ext (internal forces cancel
// by the third law), the CM moves as if all mass and all external force were
// there; the rocket derived from the momentum of rocket-plus-exhaust, with
// gravity; the CM of rocket and exhaust stays put in deep space (or falls
// freely in uniform gravity); continuous centres of mass by integration;
// the CM frame and the kinetic energy a collision can lose; hovering on a
// rocket as an exponential.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sci, r6, pl, gpic, seg, lab, G } from './_cm.js';
import { rocketSide } from '../phys2210/_momentum.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the worked example: a sounding rocket fired straight up in uniform gravity
const EX = (() => {
  const m0 = 1200, mp = 800, u = 2200, tb = 40;
  const mf = m0 - mp, mdot = mp / tb, R = m0 / mf;
  const ideal = u * Math.log(R), vb = ideal - G * tb, thrust = mdot * u, a0 = (thrust - m0 * G) / m0;
  // height at burnout: ∫ v dt with m = m0 − ṁt
  const k = mdot, hb = u * (tb - (mf / k) * Math.log(m0 / mf)) - 0.5 * G * tb * tb;
  return { m0, mp, mf, u, tb, mdot, R, ideal, vb, thrust, a0, hb, cmDrop: 0.5 * G * tb * tb };
})();

// the collision pictured in the CM-frame question: 2 kg at 3 m/s meets 1 kg at −1 m/s and sticks
const CM = (() => { const m1 = 2, m2 = 1, u1 = 3, u2 = -1, V = (m1 * u1 + m2 * u2) / (m1 + m2); return { K0: 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2, K1: 0.5 * (m1 + m2) * V * V }; })();

// a rocket (box with a nose) and two force arrows, as a graph
const rocketForces = (caption, { thrust = 'thrust  ṁu', weight = 'weight  mg', tr = 1.3 } = {}) => gpic({
  x: [-2.2, 2.2], y: [-2.2, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
  shade: [{ fn: '1', lower: '-1', from: -0.3, to: 0.3, color: 'ink3', alpha: 0.45 }, { fn: '1 + 0.6*(1 - abs(x)/0.3)', lower: '1', from: -0.3, to: 0.3, color: 'ink3', alpha: 0.45 }, { fn: '-1', lower: '-1.45 + 0.6*abs(x)', from: -0.25, to: 0.25, color: 'warn', alpha: 0.5 }],
  arrows: [{ from: [0.6, -0.2], to: [0.6, -0.2 + 1.0 * tr], color: 'good', label: thrust, labelDx: 6, labelDy: 0 }, { from: [-0.6, 0.2], to: [-0.6, -0.8], color: 'accent', label: weight, labelDx: -84, labelDy: 0 }],
}, caption, 'A rocket standing upright with a thrust arrow up and a weight arrow down');

export default lesson({
  id: 'phys3550.M1.2',
  title: 'Momentum and the centre of mass',
  minutes: 16, difficulty: 3,
  intro: t`For a system of particles, add up every $m_\alpha\ddot{\vec r}_\alpha = \vec F_\alpha$. The internal forces cancel in pairs by Newton's third law, leaving only the external ones: the **total momentum** $\vec P$ changes only under external force, and it equals the total mass times the velocity of the **centre of mass** $\vec R = \frac{1}{M}\sum m_\alpha\vec r_\alpha$. A rocket is the sharpest test: nothing outside pushes it, so in deep space the centre of mass of rocket-plus-exhaust never moves — the rocket goes one way only because its exhaust goes the other. You met the [centre of mass](#/lesson/phys2210.M9.5) and the [rocket equation](#/lesson/phys2210.M9.6) in PHYS 2210; here they come from one law.`,
  equation: t`\dot{\vec P} = \vec F_\text{ext}, \qquad \vec P = \sum_\alpha m_\alpha\dot{\vec r}_\alpha = M\dot{\vec R}`,
  symbols: [
    { tex: '\\vec P', text: 'the system’s total momentum, in kg·m/s' },
    { tex: '\\vec F_\\text{ext}', text: 'the sum of the forces from outside the system, in N; internal forces cancel in third-law pairs' },
    { tex: 'm_\\alpha,\\ \\vec r_\\alpha', text: 'the mass (kg) and position (m) of particle $\\alpha$ — the Greek label counts particles' },
    { tex: 'M', text: 'the total mass $\\sum m_\\alpha$, in kg' },
    { tex: '\\vec R', text: 'the centre of mass $\\frac1M\\sum m_\\alpha\\vec r_\\alpha$ (for a continuous body, $\\frac1M\\int\\vec r\\,dm$), in m' },
  ],
  why: t`Momentum bookkeeping is how every rocket, staging event and docking is analysed — and the centre-of-mass frame is where collisions and two-body orbits (M5) become simple.`,
  visual: {
    type: 'graph',
    title: 'A rocket and its exhaust, in deep space',
    lead: t`A rocket starts at rest far from any planet and burns steadily for 100 s. Blue: the rocket's position. Orange: the centre of mass of all the exhaust it has thrown out. Gold: the centre of mass of the whole system.`,
    tasks: [
      t`Change the exhaust speed and the mass ratio: the rocket and its exhaust move apart, but the gold line never leaves zero.`,
      t`At mass ratio 2 the exhaust weighs as much as what is left, so its centre of mass sits exactly as far behind the start as the rocket is ahead.`,
      t`The final speed $\Delta v = u\ln(m_0/m_f)$ is in the readout: doubling $u$ doubles everything.`,
    ],
    params: {
      aspect: 'wide', x: [0, 100], y: [-160, 340], xlabel: 't (s)', ylabel: 'x (km)',
      sliders: [
        { key: 'u', label: 'Exhaust speed $u$', min: 2, max: 4.5, step: 0.1, value: 3, unit: '\\mathrm{km/s}', explain: 'Speed of the exhaust relative to the rocket: about 2.5 km/s for a solid motor, 4.4 km/s for hydrogen–oxygen.' },
        { key: 'R', label: 'Mass ratio $m_0/m_f$', min: 2, max: 8, step: 0.1, value: 4, unit: '', explain: 'Starting mass over burnout mass. The propellant is burned at a steady rate.' },
      ],
      curves: [
        { fn: 'u*(x - ((1 - (1 - 1/R)*x/100)/((1 - 1/R)/100))*ln(1/(1 - (1 - 1/R)*x/100)))', color: 'accent', width: 2.6, domain: [0, 100], label: 'rocket', labelAt: 85, labelDy: -12 },
        { fn: '-(1 - (1 - 1/R)*x/100)*u*(x - ((1 - (1 - 1/R)*x/100)/((1 - 1/R)/100))*ln(1/(1 - (1 - 1/R)*x/100)))/((1 - 1/R)*x/100)', color: 'warn', width: 2.4, domain: [0.5, 100], label: 'exhaust (its centre of mass)', labelAt: 60, labelDy: 16 },
      ],
      hlines: [{ y: 0, color: 'gold', label: 'centre of mass of everything' }],
      readouts: [{ label: 'Δv', expr: 'u*ln(R)', unit: 'km/s', digits: 3 }, { label: 'rocket at burnout', expr: '100*u*(1 - ln(R)/(R - 1))', unit: 'km', digits: 3 }],
    },
    caption: t`One dimension, no external force, steady burn rate, exhaust speed fixed relative to the rocket; every parcel of exhaust then coasts at the speed it left with. Positions are measured from the starting point.`,
  },
  example: {
    prompt: t`A ${EX.m0} kg sounding rocket carries ${EX.mp} kg of propellant, which it burns at a steady rate in ${EX.tb} s, ejecting it at $u = ${sci(EX.u, 4)}$ m/s relative to the rocket. It fires straight up; take $g = 9.8$ m/s² as constant and ignore air. Derive its equation of motion from momentum, then find its lift-off acceleration and its burnout speed.`,
    visual: rocketSide({ caption: t`In a time $dt$ the rocket (mass $m$) throws a parcel $-dm$ backward at speed $u$ relative to itself. Sketch, not to scale.`, thrust: 'thrust on the rocket', exhaust: 'push on the exhaust' }),
    steps: [
      { label: 'Momentum before and after', text: t`At $t$: mass $m$ moving at $v$, momentum $mv$. At $t + dt$: the rocket, $m + dm$ at $v + dv$ ($dm < 0$), plus the ejected parcel $-dm$ at $v - u$. Change: $(m + dm)(v + dv) - dm\,(v - u) - mv = m\,dv + u\,dm$ (dropping $dm\,dv$).` },
      { label: 'Set it equal to the impulse', text: t`$m\,dv + u\,dm = F_\text{ext}\,dt$, so $m\dot v = -u\dot m + F_\text{ext}$. The **thrust** is $-u\dot m = u|\dot m|$, here $${sci(EX.mdot, 3)}\ \text{kg/s}\times${sci(EX.u, 4)}\ \text{m/s} = ${sci(EX.thrust, 3)}$ N.` },
      { label: 'Lift-off', text: t`$a_0 = (u|\dot m| - m_0g)/m_0 = (${sci(EX.thrust, 3)} - ${sci(EX.m0 * G, 4)})/${EX.m0} = ${sci(EX.a0)}$ m/s².` },
      { label: 'Integrate', text: t`With $F_\text{ext} = -mg$: $dv = -u\,dm/m - g\,dt$, so $v = u\ln\dfrac{m_0}{m} - gt$.` },
      { label: 'Burnout', text: t`$v_b = ${sci(EX.u, 4)}\ln ${sci(EX.R)} - 9.8\times${EX.tb} = ${sci(EX.ideal, 4)} - ${sci(G * EX.tb, 3)} = ${sci(EX.vb, 4)}$ m/s. The $gt_b$ term is the **gravity loss**: a slower burn would lose more.` },
      { label: 'Sense check', text: t`For the whole system — rocket plus every parcel of exhaust, treated as free particles — $\dot{\vec P} = -Mg$: its centre of mass falls freely, $${sci(EX.cmDrop, 3)}$ m in ${EX.tb} s, while the rocket climbs $${sci(EX.hb, 3)}$ m. The engine moves momentum around; only gravity changes the total. (Real exhaust soon hits the air and the ground, which is why this is a thought experiment.)` },
    ],
    answer: t`$m\dot v = -u\dot m - mg$; lift-off acceleration $${sci(EX.a0)}$ m/s²; burnout speed $${sci(EX.vb, 4)}$ m/s.`,
  },
  practice: [
    mcq({
      id: 'internal', difficulty: 2,
      prompt: t`Why do the internal forces drop out of $\dot{\vec P} = \vec F_\text{ext}$ for any system of particles?`,
      visual: gpic({
        x: [-3, 3], y: [-1.6, 2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        points: [{ x: -2, y: 0, color: 'accent', r: 8, label: '1', labelDx: -14, labelDy: 8 }, { x: 1.8, y: -0.6, color: 'accent', r: 10, label: '2', labelDx: 10, labelDy: 10 }, { x: 0.2, y: 1.5, color: 'accent', r: 6, label: '3', labelDx: -14, labelDy: -8 }],
        arrows: [{ from: [-2, 0], to: [-1.1, -0.14], color: 'warn' }, { from: [1.8, -0.6], to: [0.9, -0.46], color: 'warn' }, { from: [-2, 0], to: [-1.45, 0.6], color: 'violet' }, { from: [0.2, 1.5], to: [-0.35, 0.9], color: 'violet' }, { from: [1.8, -0.6], to: [1.3, 0.06], color: 'teal' }, { from: [0.2, 1.5], to: [0.7, 0.84], color: 'teal' }],
      }, t`Three particles and the forces they exert on each other: each colour is one third-law pair, equal and opposite.`, 'Three particles with pairs of equal and opposite force arrows'),
      choices: [
        t`Newton's third law: each internal force $\vec F_{\alpha\beta}$ comes with $\vec F_{\beta\alpha} = -\vec F_{\alpha\beta}$, so they sum to zero`,
        t`Internal forces are always central (along the line between the particles)`,
        t`Internal forces are small compared with external ones`,
        t`They cancel only if the system is a rigid body`,
      ],
      answer: 0,
      why: {
        1: t`Central forces (the **strong** form of the third law) are needed for internal *torques* to cancel — angular momentum, M1.4. For momentum the weak form, equal and opposite, is enough.`,
        2: t`Size has nothing to do with it: the explosive forces inside a bursting shell are enormous, yet its centre of mass carries on along the parabola.`,
        3: t`Rigidity is not needed: a gas, an exploding shell or a rocket and its exhaust all obey $\dot{\vec P} = \vec F_\text{ext}$.`,
      },
      hints: ['Sum the forces on all the particles. Which pairs can you group together?'],
      teach: t`$\sum_\alpha\sum_{\beta\ne\alpha}\vec F_{\alpha\beta} = 0$ because the third law pairs every internal force with its opposite.`,
      explain: t`Summing $\dot{\vec p}_\alpha = \sum_\beta\vec F_{\alpha\beta} + \vec F^\text{ext}_\alpha$ over all $\alpha$, every pair appears as $\vec F_{\alpha\beta} + \vec F_{\beta\alpha} = 0$. Only the external forces survive.`,
    }),
    num({
      id: 'burst', difficulty: 2,
      gen(r) {
        const v0 = r.pick([40, 50, 60]), ang = r.pick([40, 45, 55]), m1 = r.pick([2, 3, 4]), m2 = r.pick([1, 2, 5].filter((x) => x !== m1));
        const Rng = (v0 * v0 * Math.sin(2 * ang * DEG)) / G, xa = Rng / 2;
        const x2 = ((m1 + m2) * Rng - m1 * xa) / m2;
        const H = (v0 * Math.sin(ang * DEG)) ** 2 / (2 * G);
        return {
          prompt: t`A shell fired at ${v0} m/s, ${ang}° above flat ground, bursts at the top of its arc into two pieces. The ${m1} kg piece stops dead and falls straight down; the ${m2} kg piece flies on. Ignoring air, how far from the gun does the ${m2} kg piece land?`,
          answer: x2, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: 1.5 * Rng, feedback: t`$\tfrac32R$ is right only for equal masses. Weight the positions by mass: $m_1x_1 + m_2x_2 = (m_1 + m_2)R$.` }, { value: Rng, feedback: t`That is where the centre of mass lands, not the second piece.` }],
          hints: [t`The explosion's forces are internal, so the centre of mass carries on along the original parabola and lands at the range $R = v_0^2\sin 2\theta/g$.`, t`Both pieces land at the same time (both start the fall with zero vertical velocity), so $m_1x_1 + m_2x_2 = (m_1 + m_2)R$ with $x_1 = R/2$.`],
          teach: t`Internal forces cannot move the centre of mass: it follows the trajectory the unexploded shell would have.`,
          explain: t`$R = ${v0}^2\sin ${2 * ang}^\circ/9.8 = ${sci(Rng)}$ m, and the first piece lands at $R/2 = ${sci(xa)}$ m. So $x_2 = \dfrac{(${m1} + ${m2})(${sci(Rng)}) - ${m1}(${sci(xa)})}{${m2}} = ${sci(x2)}$ m.`,
          visual: gpic({
            x: [0, r6(Math.max(x2, Rng) * 1.08)], y: [0, r6(H * 1.6)], xlabel: 'x (m)', ylabel: 'y (m)',
            curves: [{ fn: `${r6(Math.tan(ang * DEG))}*x - ${r6(G / (2 * (v0 * Math.cos(ang * DEG)) ** 2))}*x^2`, color: 'ink3', width: 2, domain: [0, r6(xa)] }, { fn: `${r6(Math.tan(ang * DEG))}*x - ${r6(G / (2 * (v0 * Math.cos(ang * DEG)) ** 2))}*x^2`, color: 'gold', width: 1.6, dash: true, domain: [r6(xa), r6(Rng)], label: 'centre of mass', labelAt: r6(xa + 0.3 * (Rng - xa)), labelDy: -10 }, seg([xa, H], [xa, 0], 'accent', 2, true)],
            points: [{ x: r6(xa), y: r6(H), color: 'warn', r: 6, label: 'burst', labelDx: 8, labelDy: -10 }, { x: r6(Rng), y: 0, color: 'gold', r: 4 }],
          }, t`The shell's arc up to the burst, the first piece falling straight down (blue), and the centre of mass carrying on (gold, dashed). The second piece's landing point is not drawn.`, 'A projectile arc that bursts at its top'),
        };
      },
    }),
    num({
      id: 'exhaust-cm', difficulty: 3,
      gen(r) {
        const m0 = r.pick([1000, 1500, 2000]), R = r.pick([2, 3, 4]), u = r.pick([2.5, 3.0, 4.0]), tb = r.pick([60, 100, 150]);
        const mf = m0 / R, k = (m0 - mf) / tb;
        const xr = (u * (tb - (mf / k) * Math.log(m0 / mf))) ;         // km
        const xe = (-mf * xr) / (m0 - mf);
        return {
          prompt: t`Far from any planet, a ${m0} kg rocket starts at rest and burns $${sci(m0 - mf, 4)}$ kg of propellant at a steady rate over ${tb} s, with exhaust speed $u = ${u}$ km/s. At burnout it is $${sci(xr, 4)}$ km from where it started. Where is the centre of mass of all the exhaust it has ejected? (Give its position along the line of flight; negative means behind the start.)`,
          answer: xe, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: -xr, feedback: t`Only if the exhaust's mass equals the rocket's. The masses weight the positions: $m_fX_r + (m_0 - m_f)X_e = 0$.` }, { value: (-(m0 - mf) * xr) / mf, feedback: t`The weights are swapped: the burnout mass $m_f$ multiplies the rocket's position.` }].filter((e) => Math.abs(e.value - xe) > 0.02 * Math.abs(xe)),
          hints: [t`No external force acts, and everything started at rest at the origin: the centre of mass of rocket plus exhaust stays at 0.`, t`$m_f\,x_\text{rocket} + (m_0 - m_f)\,X_\text{exhaust} = 0$.`],
          teach: t`With no external force, the centre of mass of rocket and exhaust never moves: the rocket's progress is paid for by the exhaust's retreat.`,
          explain: t`$X_\text{exhaust} = -\dfrac{m_f}{m_0 - m_f}\,x_\text{rocket} = -\dfrac{${sci(mf, 4)}}{${sci(m0 - mf, 4)}}\times${sci(xr, 4)} = ${sci(xe, 4)}$ km.`,
          visual: gpic({ x: [0, tb], y: [0, r6(xr * 1.2)], xlabel: 't (s)', ylabel: 'x (km)', curves: [{ fn: `${u}*(x - ((${m0} - ${r6(k)}*x)/${r6(k)})*ln(${m0}/(${m0} - ${r6(k)}*x)))`, color: 'accent', width: 2.4, domain: [0, tb], label: 'rocket', labelAt: r6(tb * 0.8), labelDy: -12 }] }, t`The rocket's position during the burn (exhaust not drawn). It starts slowly and accelerates as it gets lighter.`, 'A rocket position curve curving upward'),
        };
      },
    }),
    num({
      id: 'liftoff', difficulty: 2,
      gen(r) {
        const m0 = r.pick([500, 800, 1200, 2000]), mdot = r.pick([4, 5, 8, 10]);
        const umin = (m0 * G) / mdot;
        return {
          prompt: t`A ${m0} kg rocket on the pad burns ${mdot} kg of propellant per second. What is the smallest exhaust speed that lets it leave the pad?`,
          answer: umin, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: mdot * G, feedback: t`Thrust is $u\dot m$; it must exceed the weight $m_0g$, so $u > m_0g/\dot m$.` }, { value: m0 / mdot, feedback: t`Don't forget $g$: the thrust must beat the weight $m_0g$, not the mass.` }],
          hints: [t`The thrust is $u|\dot m|$. It must at least equal the weight.`, t`$u_\text{min}|\dot m| = m_0g$.`],
          teach: t`Lift-off needs thrust $u|\dot m|$ greater than weight; mass flow and exhaust speed trade off against each other.`,
          explain: t`$u_\text{min} = m_0g/|\dot m| = ${m0}\times9.8/${mdot} = ${sci(umin)}$ m/s. Any faster and the net force $u|\dot m| - m_0g$ lifts it.`,
          visual: rocketForces(t`On the pad at the instant of lift-off: thrust (green) just equal to weight (blue). Arrows not to scale.`, { tr: 1 }),
        };
      },
    }),
    num({
      id: 'semicircle', difficulty: 3,
      gen(r) {
        const R = r.pick([0.6, 0.9, 1.2, 1.5]);
        const yc = (4 * R) / (3 * Math.PI);
        return {
          prompt: t`A uniform flat plate has the shape of a half-disc of radius ${R} m (its straight edge along the $x$-axis). How far above the straight edge is its centre of mass? Do the integral $\frac{1}{A}\iint y\,dA$ in polar coordinates.`,
          answer: yc, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (2 * R) / Math.PI, feedback: t`$2R/\pi$ is for a semicircular *wire* (mass on the rim only). For a plate the area element is $r\,dr\,d\theta$, which weights small radii less.` }, { value: R / 2, feedback: t`Half the radius would be right for a rectangle; the plate is narrower near the top, so its centre of mass sits lower.` }],
          hints: [t`$dA = r\,dr\,d\theta$, $y = r\sin\theta$, with $0 \le r \le R$ and $0 \le \theta \le \pi$; $A = \pi R^2/2$.`, t`$\iint y\,dA = \int_0^\pi\sin\theta\,d\theta\int_0^R r^2\,dr = 2\cdot\dfrac{R^3}{3}$.`],
          teach: t`For a continuous body, $\vec R = \frac1M\int\vec r\,dm$; choose coordinates that fit the shape.`,
          explain: t`$\iint y\,dA = \tfrac23R^3$ and $A = \tfrac12\pi R^2$, so $Y = \dfrac{4R}{3\pi} = ${sci(yc)}$ m — about 42% of the radius.`,
          visual: gpic({
            x: [-R * 1.25, R * 1.25], y: [-0.15 * R, R * 1.15], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
            curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 3.1416], color: 'accent', width: 2 }, seg([-R, 0], [R, 0], 'accent', 2)],
            shade: [{ fn: `sqrt(max(0, ${R * R} - x^2))`, from: -R, to: R, color: 'accent', alpha: 0.25 }],
          }, t`The half-disc plate, uniform density. Its centre of mass lies on the axis of symmetry, $x = 0$.`, 'A half-disc shaded'),
        };
      },
    }),
    num({
      id: 'gravity-loss', difficulty: 2,
      gen(r) {
        const u = r.pick([2000, 2500, 3000]), R = r.pick([2.5, 3, 4]), tb = r.pick([30, 60, 90]);
        const vb = u * Math.log(R) - G * tb;
        return {
          prompt: t`A rocket with exhaust speed $${sci(u, 4)}$ m/s and mass ratio $m_0/m_f = ${R}$ fires straight up for ${tb} s. Ignoring air and taking $g$ constant, what is its speed at burnout?`,
          answer: vb, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: u * Math.log(R), feedback: t`That is the deep-space value. Gravity takes away $gt_b$ during the burn.` }, { value: u * Math.log(R) - 0.5 * G * tb, feedback: t`Gravity's loss is the impulse $gt_b$ per unit mass, not $\tfrac12gt_b$.` }],
          hints: [t`$m\dot v = -u\dot m - mg$ integrates to $v = u\ln(m_0/m) - gt$.`, t`At burnout $m = m_f$ and $t = t_b$.`],
          teach: t`Gravity steals $g$ every second of the burn: $v_b = u\ln(m_0/m_f) - gt_b$.`,
          explain: t`$v_b = ${sci(u, 4)}\ln ${R} - 9.8\times${tb} = ${sci(u * Math.log(R), 4)} - ${sci(G * tb, 3)} = ${sci(vb, 4)}$ m/s.`,
          visual: rocketForces(t`During the vertical burn: thrust up, weight down, both changing as propellant burns. Arrows not to scale.`),
        };
      },
    }),
    mcq({
      id: 'cm-frame', difficulty: 3,
      prompt: t`Two carts collide on a frictionless track and stick together. Which statement about kinetic energy is right?`,
      visual: { type: 'mech-collide', params: { dim: 1, m1: 2, m2: 1, u1: 3, u2: -1, e: 0, view: 'snapshots', show: 'both', cm: true, bars: ['K'], sliders: false, readout: false }, caption: t`Before and after a perfectly inelastic collision, with the centre of mass (gold) and the kinetic energies.` },
      choices: [
        t`$K = \tfrac12MV^2 + K_\text{cm}$; the $\tfrac12MV^2$ part cannot change, so the most that can be lost is $K_\text{cm}$, the energy seen from the centre-of-mass frame — and sticking loses all of it`,
        t`All the kinetic energy is lost, because the carts stick`,
        t`None is lost, because momentum is conserved`,
        t`The amount lost depends on which frame you watch from`,
      ],
      answer: 0,
      why: {
        1: t`After sticking, the pair still moves at $V$: it keeps $\tfrac12MV^2$, which momentum conservation protects.`,
        2: t`Momentum and kinetic energy are separate quantities; a perfectly inelastic collision conserves the first and loses the most possible of the second.`,
        3: t`The energy *lost* is the same in every inertial frame (it is the heat and sound produced); only the kinetic energies before and after change from frame to frame.`,
      },
      hints: [t`Write each velocity as $\dot{\vec R}$ plus a velocity relative to the centre of mass, and expand $\sum\tfrac12m\dot r^2$.`, t`The cross term vanishes because $\sum m_\alpha\dot{\vec r}'_\alpha = 0$ in the CM frame.`],
      teach: t`Kinetic energy splits into the centre-of-mass part $\tfrac12MV^2$, fixed by momentum, and the internal part $K_\text{cm}$, which collisions can spend.`,
      explain: t`$K = \tfrac12MV^2 + \sum\tfrac12m_\alpha\dot{\vec r}'^2_\alpha$. Momentum fixes $V$, so only the internal part can turn into heat. Sticking together leaves no relative motion: $K_\text{cm}$ is entirely lost. In the picture, $K$ falls from $${sci(CM.K0, 2)}$ J to $\tfrac12MV^2 = ${sci(CM.K1, 2)}$ J.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hover', difficulty: 3, transfer: true,
      gen(r) {
        const m0 = r.pick([6500, 7000, 7500]), mp = r.pick([300, 400, 500]), u = r.pick([3000, 3050]), g = 1.62;
        const T = (u / g) * Math.log(m0 / (m0 - mp));
        return {
          prompt: t`A lunar lander of mass $${sci(m0, 4)}$ kg hovers just above the Moon's surface ($g = 1.62$ m/s²), throttling its engine (exhaust speed $${sci(u, 4)}$ m/s) so that the thrust always equals its weight. It has ${mp} kg of propellant left. How long can it hover?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (mp * u) / (m0 * g), feedback: t`That assumes the burn rate stays at its starting value. As the lander gets lighter it needs less thrust, so the rate falls: $\dot m \propto m$.` }, { value: (u / G) * Math.log(m0 / (m0 - mp)), feedback: t`That uses Earth's $g$. On the Moon $g = 1.62$ m/s².` }],
          hints: [t`Hovering: $u|\dot m| = mg$, so $\dot m = -(g/u)\,m$ — exponential decay of the mass.`, t`$m = m_0e^{-gt/u}$; solve $m = m_0 - m_p$ for $t$.`],
          teach: t`Hovering on a rocket is $u|\dot m| = mg$: the mass decays exponentially, so the hover time is $(u/g)\ln(m_0/m_f)$.`,
          explain: t`$t = \dfrac{u}{g}\ln\dfrac{m_0}{m_0 - m_p} = \dfrac{${sci(u, 4)}}{1.62}\ln\dfrac{${sci(m0, 4)}}{${sci(m0 - mp, 4)}} = ${sci(T)}$ s. Hovering is the most wasteful thing a rocket can do: all its $\Delta v$ goes into fighting gravity loss — which is why Apollo landing crews watched their remaining hover time so closely.`,
          visual: rocketForces(t`Hovering: thrust equals weight at every instant, both shrinking as propellant burns. Arrows not to scale.`, { tr: 1, weight: 'weight  mg (Moon)' }),
        };
      },
    }),
    mcq({
      id: 'cp-deep', difficulty: 2,
      prompt: t`Far from any planet, a rocket starts from rest and burns all its propellant. Where is the centre of mass of the rocket plus all its exhaust afterwards?`,
      visual: rocketSide({ caption: t`The engine pushes exhaust back; the exhaust pushes the rocket forward. Both are inside the system. Sketch, not to scale.` }),
      choices: ['Exactly where the rocket started', 'Moving forward at the rocket’s final speed', 'Moving backward at the exhaust speed', 'Moving forward, at the final speed times the burnout mass over the starting mass'],
      answer: 0,
      why: { 1: 'That is the rocket alone. Its exhaust moves the other way, and the two balance.', 2: 'That is roughly the exhaust; the rocket balances it.', 3: 'With no external force the total momentum stays zero, so the centre of mass cannot move at all.' },
      hints: ['What external force acts on the rocket-plus-exhaust system?'],
      teach: 'With no external force, the centre of mass of everything stays at rest if it started at rest.',
      explain: t`$\dot{\vec P} = \vec F_\text{ext} = 0$ and $\vec P = 0$ initially, so $M\dot{\vec R} = 0$ forever: the centre of mass of rocket plus exhaust stays where the rocket started.`,
    }),
    num({
      id: 'cp-shell', difficulty: 3,
      gen(r) {
        const R = r.pick([0.8, 1.2, 2.0, 2.6]);
        return {
          prompt: t`A thin hemispherical shell of uniform areal density — say a payload fairing's nose cap — has radius ${R} m. How far from its flat (open) face is its centre of mass? Use spherical coordinates: $dA = R^2\sin\theta\,d\theta\,d\phi$ and $z = R\cos\theta$.`,
          answer: R / 2, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (3 * R) / 8, feedback: t`$3R/8$ is for a *solid* hemisphere. A shell has all its mass at radius $R$.` }, { value: (4 * R) / (3 * Math.PI), feedback: t`That is the half-disc's value, a flat shape; this is a curved shell.` }],
          hints: [t`The area is $2\pi R^2$. Integrate $z\,dA$ over $0 \le \theta \le \pi/2$, $0 \le \phi < 2\pi$.`, t`$\int z\,dA = 2\pi R^3\int_0^{\pi/2}\cos\theta\sin\theta\,d\theta = \pi R^3$.`],
          teach: t`Centres of mass of curved bodies come from surface or volume integrals in the coordinates that fit them.`,
          explain: t`$Z = \dfrac{\pi R^3}{2\pi R^2} = \dfrac R2 = ${sci(R / 2)}$ m. (Archimedes knew a neat reason: a sphere's surface area between two parallel planes depends only on their separation, so the mass is spread evenly in $z$.)`,
          visual: gpic({
            x: [-R * 1.4, R * 1.4], y: [-0.2 * R, R * 1.2], equal: true, xlabel: 'x (m)', ylabel: 'z (m)',
            curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 3.1416], color: 'accent', width: 3 }, seg([-R, 0], [R, 0], 'ink3', 1, true)],
          }, t`The shell in cross-section (blue): all its mass sits on the curved surface. The flat face (dashed) is open.`, 'A hemispherical shell in cross-section'),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 3: momentum and angular momentum (rockets, centre of mass)', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'NASA Glenn Research Center: Ideal Rocket Equation', url: 'https://www.grc.nasa.gov/www/k-12/rocket/rktpow.html' },
  ],
});
