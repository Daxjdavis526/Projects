// Energy with friction: friction turns mechanical energy into thermal energy;
// K + U falls, E_th rises by the same amount, and the total is conserved.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, s3, thou, energyBars, springPic } from './_energy.js';

const t = String.raw;
const D2R = Math.PI / 180;

// the worked example: a box down a rough ramp, then across a rough floor
const EX = { m: 2.0, L: 3.0, th: 30, mu: 0.2 };
EX.h = EX.L * Math.sin(EX.th * D2R);                           // 1.5 m
EX.U = EX.m * G * EX.h;                                         // 29.4 J
EX.Eth1 = EX.mu * EX.m * G * Math.cos(EX.th * D2R) * EX.L;      // 10.2 J on the ramp
EX.K = EX.U - EX.Eth1;                                          // 19.2 J at the bottom
EX.v = Math.sqrt((2 * EX.K) / EX.m);                            // 4.38 m/s
EX.d = EX.K / (EX.mu * EX.m * G);                               // 4.90 m along the floor

// a level track with a rough stretch, for the static pictures
const roughPic = (from, to, mu, marks, caption, h = '0', x = [-0.5, 10], y = [-0.6, 1.6]) => ({
  type: 'mech-energy',
  params: { h, x, y, particle: false, equilibria: false, rough: [{ from, to, mu }], marks, xlabel: 'x (m)' },
  caption,
});

export default lesson({
  id: 'phys2210.M8.4',
  title: 'Energy with friction',
  minutes: 11, difficulty: 3,
  intro: t`Friction does not destroy energy. It turns mechanical energy into **thermal energy** — the random jiggling of the atoms in the two sliding surfaces, which you feel as warmth. The bookkeeping gains one term:

$$K_i + U_i = K_f + U_f + \Delta E_\text{th}, \qquad \Delta E_\text{th} = f_k\,d$$

Mechanical energy falls; thermal energy rises by exactly the same amount; the total stays constant. More generally, the work of every non-conservative force — friction, drag, a push, an engine — changes the mechanical energy: $W_\text{nc} = \Delta K + \Delta U$.`,
  symbols: [
    { tex: '\\Delta E_\\text{th}', text: 'the increase in thermal energy of the sliding object and the surface together, in J' },
    { tex: 'f_k = \\mu_k N', text: 'the kinetic-friction force, in N: the coefficient of kinetic friction times the normal force' },
    { tex: 'd', text: 'the **distance** slid, in m — the length of the path, not the displacement: friction works against every metre' },
    { tex: 'K,\\ U', text: 'kinetic and potential energy, in J, at the start ($i$) and the end ($f$)' },
    { tex: 'W_\\text{nc} = \\Delta K + \\Delta U', text: 'the work done by non-conservative forces, in J: negative for friction and drag, positive for a push or an engine' },
  ],
  why: 'Every real machine loses mechanical energy this way. Accounting for it is how engineers size brake discs, heat shields and the batteries that regenerative braking refills.',
  visual: {
    type: 'mech-energy',
    title: 'Friction moves energy into the thermal bar',
    lead: t`A 1.0 kg block on a spring ($k = 20$ N/m) slides on a level floor with friction. It is pulled out to 1.5 m and released. Press **Play** and watch the gold energy line and the bars: $K$, $U$, thermal energy $E_\text{th}$ and the total.`,
    tasks: [
      'Set friction to zero and press Play: the block swings for ever and the thermal bar stays empty.',
      t`Add friction: the energy line sinks with every swing, the turning points close in, and $E_\text{th}$ grows by exactly what $K + U$ loses. The total bar never moves.`,
      'Watch where it stops: not necessarily at the centre, but wherever the spring’s pull at a turning point is too weak to overcome static friction.',
    ],
    params: {
      U: '10*x^2', x: [-2, 2], y: [-2.5, 26], E: 22.5, x0: 1.5, m: 1, friction: 'mu*9.8',
      sliders: [{ key: 'mu', label: 'Friction coefficient $\\mu_k$', min: 0, max: 0.4, step: 0.01, value: 0.1, explain: t`Friction force $f_k = \mu_k mg$, opposing the motion.` }],
      readouts: ['E', 'K', 'U', 'th'], ylabel: 'energy (J)',
    },
    caption: t`A block on a horizontal spring with $U = \tfrac12 kx^2$ and kinetic friction of fixed size $\mu_k mg$; static friction is taken equal to kinetic. The gold line is the mechanical energy $K + U$, which sinks as friction works; the bars share the diagram’s scale.`,
  },
  example: {
    prompt: t`A ${EX.m.toFixed(1)} kg box starts from rest at the top of a ${EX.L.toFixed(1)} m ramp inclined at ${EX.th}°, slides down and carries on across a level floor. The coefficient of kinetic friction is ${EX.mu} on both. (a) How fast is the box moving at the bottom of the ramp? (b) How far along the floor does it slide? (c) How much thermal energy is produced altogether?`,
    visual: energyBars([
      { title: 'A: top of the ramp', K: 0, Ug: EX.U, Eth: 0 },
      { title: 'B: bottom of the ramp', K: EX.K, Ug: 0, Eth: EX.Eth1 },
      { title: 'C: stopped on the floor', K: 0, Ug: 0, Eth: EX.U },
    ], { keys: ['K', 'Ug', 'Eth'], values: true, caption: t`Energy bar charts with $U_g = 0$ at floor level; $E_\text{th}$ counts the thermal energy produced since A. Every chart has the same total, 29.4 J.` }),
    steps: [
      { label: 'Start: potential energy', text: t`The ramp is $h = ${EX.L.toFixed(1)}\sin ${EX.th}° = ${EX.h.toFixed(2)}$ m high, so $U_g = mgh = (${EX.m.toFixed(1)})(9.8)(${EX.h.toFixed(2)}) = ${fmt(EX.U, 3)}$ J at A, with $K = 0$.` },
      { label: 'Friction on the ramp', text: t`On the slope $N = mg\cos\theta$, so $f_k = \mu_k mg\cos\theta = ${fmt(EX.Eth1 / EX.L, 3)}$ N, and over ${EX.L.toFixed(1)} m: $\Delta E_\text{th} = f_k d = ${fmt(EX.Eth1, 3)}$ J.` },
      { label: '(a) Speed at B', text: t`$K_B = ${fmt(EX.U, 3)} - ${fmt(EX.Eth1, 3)} = ${fmt(EX.K, 3)}$ J, so $v = \sqrt{2K_B/m} = ${fmt(EX.v, 3)}$ m/s. (Without friction it would be $\sqrt{2gh} = ${fmt(Math.sqrt(2 * G * EX.h), 3)}$ m/s.)` },
      { label: '(b) Across the floor', text: t`Now $N = mg$ and $f_k = \mu_k mg = ${fmt(EX.mu * EX.m * G, 3)}$ N. All of $K_B$ goes to thermal energy: $f_k d = ${fmt(EX.K, 3)}$ J gives $d = ${fmt(EX.d, 3)}$ m.` },
      { label: '(c) Altogether', text: t`$\Delta E_\text{th} = ${fmt(EX.Eth1, 3)} + ${fmt(EX.K, 3)} = ${fmt(EX.U, 3)}$ J: every joule of the starting potential energy ends up as thermal energy in the box, ramp and floor. Nothing is lost — it is just no longer mechanical.` },
    ],
    answer: t`(a) ${fmt(EX.v, 3)} m/s; (b) ${fmt(EX.d, 3)} m; (c) ${fmt(EX.U, 3)} J of thermal energy.`,
  },
  practice: [
    num({
      id: 'skid-heat', difficulty: 1,
      gen(r) {
        const m = r.pick([5, 12, 20, 35]), v = r.pick([2, 3, 4, 5, 6]);
        const E = 0.5 * m * v * v;
        return {
          prompt: t`A ${m} kg crate sliding at ${v} m/s across a level warehouse floor skids to a stop. How much thermal energy does friction produce?`,
          answer: E, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: m * v * v, feedback: t`The kinetic energy is $\tfrac12 mv^2$.` }, { value: 0, feedback: 'The energy is not destroyed: all the kinetic energy becomes thermal energy.' }],
          hints: ['On a level floor U does not change, so all the lost kinetic energy becomes thermal energy.'],
          teach: 'When friction stops a sliding object on the level, all its kinetic energy becomes thermal energy.',
          explain: t`$\Delta E_\text{th} = K_i - K_f = \tfrac12(${m})(${v})^2 - 0 = ${fmt(E, 3)}$ J, shared between the crate and the floor.`,
          visual: energyBars([{ title: 'sliding', K: E, Eth: 0 }, { title: 'stopped', K: 0, Eth: E }], { keys: ['K', 'Eth'], numbers: false, caption: 'Before and after: the kinetic-energy bar empties into the thermal-energy bar. Energy scale hidden.' }),
        };
      },
    }),
    num({
      id: 'rough-patch', difficulty: 2,
      gen(r) {
        let v, mu, L, vf;
        do { v = r.pick([4, 5, 6, 7]); mu = r.pick([0.2, 0.25, 0.3, 0.4]); L = r.pick([1.5, 2, 3]); vf = v * v - 2 * mu * G * L; } while (vf < 2);
        vf = Math.sqrt(vf);
        return {
          prompt: t`A puck slides at ${v} m/s across smooth ice and then over a ${L} m rough patch where $\mu_k = ${mu}$. How fast is it moving when it leaves the patch?`,
          answer: vf, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: v - mu * G * L, feedback: t`Energies subtract, not speeds: $\tfrac12 mv_f^2 = \tfrac12 mv^2 - \mu_k mgL$.` }, { value: Math.sqrt(v * v - mu * G * L), feedback: t`$\tfrac12 mv_f^2 = \tfrac12 mv^2 - \mu_k mgL$ gives $v_f^2 = v^2 - 2\mu_k gL$: the 2 is missing.` }],
          hints: [t`Friction removes $\mu_k mg L$ of kinetic energy on the patch.`, t`$v_f = \sqrt{v^2 - 2\mu_k gL}$ — the mass cancels.`],
          teach: 'Crossing a rough patch costs μmg times its length in kinetic energy.',
          explain: t`$v_f = \sqrt{${v}^2 - 2(${mu})(9.8)(${L})} = ${s3(vf)}$ m/s.`,
          visual: roughPic(2, 2 + L, mu, [{ x: 0.3, label: `${v} m/s →`, dy: -14 }], 'The ice in side view: smooth except for the rough patch (orange).', '0', [-0.5, 2 + L + 2.5]),
        };
      },
    }),
    mcq({
      id: 'used-up', difficulty: 1,
      prompt: 'A loaded sledge slides to a stop on level snow. What happened to its kinetic energy?',
      choices: ['It became thermal energy in the sledge’s runners and the snow', 'Friction destroyed it', 'It became gravitational potential energy', 'It was used up, because energy always runs out'],
      answer: 0,
      why: {
        1: 'Energy is never destroyed. Friction converts it into thermal energy — warm runners, a little melted snow.',
        2: 'The snow is level, so the height — and the gravitational potential energy — did not change.',
        3: '“Used up” is everyday language for energy that has become thermal energy and can no longer easily do work. The amount is still all there.',
      },
      hints: ['Energy is conserved. Which form gets bigger as the sledge slows?'],
      teach: 'Friction does not destroy energy: it converts mechanical energy into thermal energy, and the total is conserved.',
      explain: 'All the kinetic energy became thermal energy in the runners and the snow. Mechanical energy is not conserved here, but energy is.',
      visual: energyBars([{ title: 'sliding', K: 1, Ug: 0, Eth: 0 }, { title: 'stopped', K: 0, Ug: 0, Eth: 1 }], { keys: ['K', 'Ug', 'Eth'], numbers: false, caption: 'Energy bar charts for the sledge, before and after. Energy scale hidden.' }),
    }),
    num({
      id: 'rough-ramp', difficulty: 3,
      gen(r) {
        const L = r.pick([2, 3, 4, 5]), th = r.pick([30, 35, 40]), mu = r.pick([0.1, 0.15, 0.2, 0.25]);
        const v = Math.sqrt(2 * G * L * (Math.sin(th * D2R) - mu * Math.cos(th * D2R)));
        return {
          prompt: t`A box starts from rest and slides ${L} m down a ramp inclined at ${th}°, with $\mu_k = ${mu}$. How fast is it moving at the bottom?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(2 * G * L * Math.sin(th * D2R)), feedback: 'That ignores friction. Subtract the thermal energy μₖN·L.' },
            { value: Math.sqrt(2 * G * L * (Math.sin(th * D2R) - mu)), feedback: t`On a slope $N = mg\cos\theta$, not $mg$: friction is $\mu_k mg\cos\theta$.` },
          ],
          hints: [t`$mgL\sin\theta = \tfrac12 mv^2 + \mu_k mg\cos\theta\,L$.`, t`$v = \sqrt{2gL(\sin\theta - \mu_k\cos\theta)}$; the mass cancels.`],
          teach: 'On a rough slope, the drop in potential energy pays for both the kinetic energy and the thermal energy: mgh = ½mv² + μmg cos θ L.',
          explain: t`$v = \sqrt{2(9.8)(${L})(\sin ${th}° - ${mu}\cos ${th}°)} = ${s3(v)}$ m/s, compared with $${s3(Math.sqrt(2 * G * L * Math.sin(th * D2R)))}$ m/s without friction.`,
          visual: { type: 'diagram', params: { kind: 'incline', angle: th, forces: [{ dir: 'down', label: 'mg', size: 0.85 }, { dir: 'normal', label: 'N', size: 0.7 }, { dir: 'up-slope', label: 'f', size: 0.5 }] }, caption: 'The box sliding down the ramp and its forces; friction acts up the slope. Arrows show directions only.' },
        };
      },
    }),
    num({
      id: 'find-mu', difficulty: 2,
      gen(r) {
        const h = r.pick([2.0, 2.2, 2.5]), drop = r.pick([0.4, 0.5, 0.6]), L = r.pick([2, 2.5]);
        const h2 = h - drop, mu = drop / L;
        const k = h / 6.25;                         // the ramps: k(2.5 − x)² on the left, k(x − 7)² on the right
        const xs = 2.5 - Math.sqrt(h / k), xe = 7 + Math.sqrt(h2 / k);
        const track = `${+k.toFixed(5)}*max(0, 2.5 - x)^2 + ${+k.toFixed(5)}*max(0, x - 7)^2`;
        return {
          prompt: t`In a lab, a cart is released from rest ${h.toFixed(1)} m up a smooth curved track. It crosses a level ${L} m stretch covered with felt and climbs the smooth track on the other side, reaching only ${h2.toFixed(1)} m. What is the coefficient of kinetic friction of the felt?`,
          answer: mu, tol: { rel: 0.01 },
          errors: [{ value: drop, feedback: 'That is the height lost, in metres. Thermal energy μmgL equals mg × (height lost): divide by L.' }, { value: h2 / L, feedback: 'Use the height lost, h − h′, not the height reached.' }],
          hints: ['The only thermal energy is made on the felt: μₖmgL.', t`$mgh = mgh' + \mu_k mgL$, so $\mu_k = (h - h')/L$.`],
          teach: 'The height a cart fails to regain measures the thermal energy friction made: μmgL = mg(h − h′).',
          explain: t`$\mu_k = \dfrac{h - h'}{L} = \dfrac{${h.toFixed(1)} - ${h2.toFixed(1)}}{${L}} = ${fmt(mu, 3)}$. A neat way to measure friction with nothing but a ruler.`,
          visual: { type: 'mech-energy', params: { h: track, x: [0, 9.5], y: [-0.4, h * 1.35], particle: false, equilibria: false, rough: [{ from: 3.5, to: 3.5 + L, mu: 0 }], marks: [{ x: +xs.toFixed(4), label: 'release' }, { x: +xe.toFixed(4), label: 'highest point reached' }], labels: false, xlabel: 'x (m)' }, caption: 'The track in profile: smooth curved ends and a level stretch with felt (orange).' },
        };
      },
    }),
    num({
      id: 'spring-rough', difficulty: 3,
      gen(r) {
        const k = r.pick([400, 600, 800]), x = r.pick([0.1, 0.15]), m = r.pick([0.5, 1]), mu = r.pick([0.2, 0.3, 0.4]);
        const d = (0.5 * k * x * x) / (mu * m * G);
        return {
          prompt: t`A spring ($k = ${k}$ N/m) compressed ${Math.round(x * 100)} cm launches a ${m} kg block across a rough level floor ($\mu_k = ${mu}$). The block is not attached to the spring. How far from its starting point does the block come to rest?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (k * x * x) / (mu * m * G), feedback: t`The spring stores $\tfrac12 kx^2$ — include the ½.` }, { value: d - x, feedback: 'Friction acts from the moment of release, while the spring is still pushing too: measure from the starting point.' }],
          hints: ['All the spring energy ends up as thermal energy: friction works over the whole distance from release to rest.', t`$\tfrac12 kx^2 = \mu_k mg\,d$.`],
          teach: 'Spring energy in, thermal energy out: ½kx² = μmg d, with d the whole sliding distance.',
          explain: t`$d = \dfrac{\tfrac12 kx^2}{\mu_k mg} = \dfrac{${fmt(0.5 * k * x * x, 3)}}{(${mu})(${m})(9.8)} = ${s3(d)}$ m. (The spring’s push, about ${Math.round(k * x)} N at the start, easily beats static friction here.)`,
          visual: springPic({ c: -0.3, label: `${Math.round(x * 100)} cm`, caption: 'The block against the compressed spring, before release, on a rough floor. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'skier-wnc', difficulty: 2,
      gen(r) {
        const m = r.pick([60, 70, 80]), h = r.pick([40, 60, 80]), v = r.pick([15, 18, 20, 22]);
        const W = 0.5 * m * v * v - m * G * h;
        return {
          prompt: t`A ${m} kg skier starts from rest and descends a slope that drops ${h} m, reaching ${v} m/s at the bottom. How much work do the non-conservative forces (snow friction and air drag) do on her? Give the answer in kJ.`,
          answer: W / 1000, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: -W / 1000, feedback: 'Friction and drag take energy away, so their work is negative.' }, { value: (0.5 * m * v * v) / 1000, feedback: t`That is only $\Delta K$. $W_\text{nc} = \Delta K + \Delta U$, and $\Delta U = -mgh$ here.` }],
          hints: [t`$W_\text{nc} = \Delta K + \Delta U$.`, t`$\Delta K = \tfrac12 mv^2$ and $\Delta U = -mgh$.`],
          teach: t`The work of non-conservative forces is the change in mechanical energy: $W_\text{nc} = \Delta K + \Delta U$.`,
          explain: t`$\Delta K = \tfrac12(${m})(${v})^2 = ${thou(0.5 * m * v * v)}$ J; $\Delta U = -(${m})(9.8)(${h}) = -${thou(Math.round(m * G * h))}$ J. $W_\text{nc} = ${fmt(W / 1000, 3)}$ kJ: ${fmt(100 * -W / (m * G * h), 2)}% of the potential energy went to thermal energy in the snow, her skis and the air.`,
          visual: { type: 'mech-energy', params: { h: `${h}*(1 - min(max(x/40, 0), 1))^2*(1 + 2*min(max(x/40, 0), 1))`, x: [-5, 50], y: [-3, h * 1.25], particle: false, equilibria: false, marks: [{ x: 0, label: 'start' }, { x: 44, label: 'bottom' }], xlabel: 'horizontal distance (m)' }, caption: 'The slope in profile. Not a frictionless track: snow friction and air drag act all the way down.' },
        };
      },
    }),
    mcq({
      id: 'destroyed', difficulty: 2, kind: 'error',
      prompt: 'A student writes: “Kinetic friction destroys energy. The box had 50 J of kinetic energy and now it has none, so energy is not conserved when there is friction.” What is wrong?',
      choices: [
        'The 50 J became thermal energy in the box and the floor: total energy is conserved, only mechanical energy is not',
        'Nothing: friction is the exception to conservation of energy',
        'The 50 J became potential energy stored in the floor',
        'The box never really stops: it keeps 50 J by creeping forward slowly',
      ],
      answer: 0,
      why: {
        1: 'No exception has ever been found. Measure the temperatures and you find the missing 50 J as thermal energy.',
        2: 'A level floor stores no potential energy for the box; the energy shows up as warmth, not as stored work.',
        3: 'Kinetic friction does stop it; its kinetic energy really is zero.',
      },
      hints: ['Is the energy gone, or has it changed form? Touch a rubbing surface.'],
      teach: 'Friction converts mechanical energy into thermal energy: mechanical energy falls while total energy stays constant.',
      explain: t`Mechanical energy ($K + U$) is not conserved when friction acts — but total energy is: $\Delta E_\text{th} = 50$ J appears as random motion of the atoms in the box and the floor.`,
      visual: energyBars([{ title: 'sliding', K: 50, Eth: 0 }, { title: 'stopped', K: 0, Eth: 50 }], { keys: ['K', 'Eth'], values: true, caption: 'The box’s energy before and after, with the thermal energy produced on the way.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-regen', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([1600, 1800, 2000]), v = r.pick([20, 25, 30]), eta = r.pick([0.5, 0.6, 0.7]);
        const E = eta * 0.5 * m * v * v;
        return {
          prompt: t`An electric car of mass $${thou(m)}$ kg brakes from ${v} m/s to rest using regenerative braking, which returns ${Math.round(eta * 100)}% of its kinetic energy to the battery. How much energy is recovered, in kJ?`,
          answer: E / 1000, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: (0.5 * m * v * v) / 1000, feedback: `That is all the kinetic energy; only ${Math.round(eta * 100)}% is recovered.` }, { value: ((1 - eta) * 0.5 * m * v * v) / 1000, feedback: 'That is the share that becomes thermal energy.' }].filter((x) => Math.abs(x.value - E / 1000) > 0.02 * E / 1000),
          hints: [t`Find $K = \tfrac12 mv^2$, then take ${Math.round(eta * 100)}% of it.`],
          teach: 'Regenerative braking turns part of the kinetic energy into electrical energy instead of heat in the brakes.',
          explain: t`$K = \tfrac12(${thou(m)})(${v})^2 = ${thou(0.5 * m * v * v)}$ J, and ${Math.round(eta * 100)}% of it is $${fmt(E / 1000, 3)}$ kJ, about ${fmt(E / 3.6e6, 2)} kWh. The other ${Math.round((1 - eta) * 100)}% becomes thermal energy in the brakes, tyres, motor and electronics.`,
          visual: energyBars([{ title: 'moving', K: 0.5 * m * v * v / 1000, E: 0, Eth: 0 }, { title: 'stopped', K: 0, E: E / 1000, Eth: ((1 - eta) * 0.5 * m * v * v) / 1000 }], { keys: ['K', 'E', 'Eth'], numbers: false, names: { E: 'battery' }, caption: 'Energy before and after the stop: kinetic energy shared between the battery and thermal energy. Energy scale hidden.' }),
        };
      },
    }),
    num({
      id: 'cp-reentry', difficulty: 2, transfer: true,
      gen(r) {
        const [what, v] = r.pick([['from low Earth orbit', 7.8], ['from low Earth orbit', 7.6], ['from the Moon', 11.0]]);
        const e = (0.5 * (v * 1000) ** 2 - 0.5 * 10 ** 2) / 1e6;
        return {
          prompt: t`A crew capsule returning ${what} enters the atmosphere at ${v.toFixed(1)} km/s and is slowed to 10 m/s by the time it lands. Ignoring the change in height, how much kinetic energy per kilogram of capsule has to be turned into thermal energy? Give the answer in MJ/kg.`,
          answer: e, units: 'MJ/kg', tol: { rel: 0.01 },
          errors: [{ value: e * 2, feedback: t`Kinetic energy per kilogram is $\tfrac12 v^2$.` }, { value: e * 1e6, feedback: 'That is in J/kg. The answer is asked in MJ/kg.' }],
          hints: [t`Per kilogram, $\Delta K = \tfrac12(v_i^2 - v_f^2)$, with speeds in m/s.`],
          teach: 'Re-entry turns orbital kinetic energy — tens of megajoules per kilogram — into thermal energy, mostly in the air around the capsule.',
          explain: t`$\tfrac12\left[(${thou(v * 1000)})^2 - 10^2\right] = ${fmt(e, 3)}\times10^{6}$ J/kg. Most of it heats the air in the shock layer around the capsule; the heat shield must absorb or radiate the share that reaches it. The drop in height adds roughly another 1 MJ/kg. A handy check: $(1\ \text{km/s})^2 = 10^6\ \text{J/kg}$, so $\tfrac12 v^2$ with $v$ in km/s comes out directly in MJ/kg.`,
          visual: energyBars([{ title: 'entry', K: e, Eth: 0 }, { title: 'landing', K: 0, Eth: e }], { keys: ['K', 'Eth'], unit: 'MJ/kg', caption: 'Kinetic energy per kilogram at entry, and the thermal energy it becomes.' }),
        };
      },
    }),
    mcq({
      id: 'cp-constant-speed', difficulty: 2,
      prompt: 'A box slides down a rough ramp at constant speed, dropping a height h. Which statement is true?',
      choices: [
        t`The thermal energy produced is $mgh$: all the potential energy lost becomes thermal energy`,
        'Mechanical energy is conserved, because the speed is constant',
        'No energy changes form, because the net force is zero',
        t`Friction does positive work equal to $mgh$`,
      ],
      answer: 0,
      why: {
        1: t`The speed — and $K$ — are constant, but $U$ falls by $mgh$, so $K + U$ falls.`,
        2: 'Zero net force means zero net work, so K is constant; but gravity and friction each do work, moving energy from U to thermal energy.',
        3: 'Friction opposes the sliding, so its work is negative: −mgh.',
      },
      hints: [t`Write $K_i + U_i = K_f + U_f + \Delta E_\text{th}$ with $K_i = K_f$.`],
      teach: 'At constant speed down a rough slope, the lost potential energy goes entirely into thermal energy.',
      explain: t`With $K_i = K_f$: $\Delta E_\text{th} = U_i - U_f = mgh$. Friction does work $-mgh$, gravity $+mgh$, and the net work is zero, as the constant speed requires.`,
      visual: { type: 'diagram', params: { kind: 'incline', angle: 25, forces: [{ dir: 'down', label: 'mg', size: 0.85 }, { dir: 'normal', label: 'N', size: 0.77 }, { dir: 'up-slope', label: 'f', size: 0.36 }] }, caption: 'The box sliding down at constant speed: friction (up the slope) balances the component of gravity down the slope. Arrows show directions.' },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §8.3 Conservation of energy (non-conservative forces)', url: 'https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy' },
  ],
});
