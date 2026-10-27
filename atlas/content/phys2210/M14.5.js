// Bernoulli's equation: energy per volume along a streamline — faster flow,
// lower pressure — with Venturi meters, Torricelli's law and Pitot tubes.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, RHO, s3, tn, flow, seg, box, label } from './_fluids.js';

const t = String.raw;
const RHO0 = 1.225;
const area = (D) => (Math.PI * D * D) / 4;

// streamlines past a wing, for the "equal transit time" picture (a sketch, not a flow solution)
const UPPER = '0.27 + 0.2*exp(-((x - 0.33)/0.42)^2) - 0.05*(1 + tanh(3*(x - 1)))';
const LOWER = '-0.2 - 0.025*exp(-((x - 0.4)/0.4)^2) - 0.05*(1 + tanh(3*(x - 1)))';
const UPPER_F = (x) => 0.27 + 0.2 * Math.exp(-(((x - 0.33) / 0.42) ** 2)) - 0.05 * (1 + Math.tanh(3 * (x - 1)));
const LOWER_F = (x) => -0.2 - 0.025 * Math.exp(-(((x - 0.4) / 0.4) ** 2)) - 0.05 * (1 + Math.tanh(3 * (x - 1)));
const streamline = (f, x) => f(x);

export default lesson({
  id: 'phys2210.M14.5',
  title: 'Bernoulli’s equation and Pitot tubes',
  minutes: 12, difficulty: 3,
  intro: t`Follow a small parcel of fluid along its path (a **streamline**) in a steady flow with no friction. Work done by the pressure around it changes its kinetic and potential energy, and per cubic metre the energy bookkeeping reads

$$p + \tfrac12\rho v^2 + \rho g y = \text{constant along a streamline}$$

Every term is an energy per volume (J/m³, which is the same as Pa). So where a fluid speeds up — in the narrow part of a pipe, over a wing — **its pressure drops**: faster flow, *lower* pressure. Bring moving air to rest at the nose of a **Pitot tube** and its pressure rises by $\tfrac12\rho v^2$; measure that rise and you have the airspeed, $v = \sqrt{2\,\Delta p/\rho}$.`,
  symbols: [
    { tex: 'p', text: 'the static pressure, in Pa: what a gauge moving with the fluid would read' },
    { tex: '\\tfrac12\\rho v^2', text: 'the dynamic pressure $q$, in Pa: the kinetic energy per cubic metre of fluid moving at speed $v$' },
    { tex: '\\rho g y', text: 'the potential energy per cubic metre at height $y$ above a chosen level, in Pa' },
    { tex: '\\rho', text: 'the density, in kg/m³ — taken as constant (fine for liquids, and for air below about 100 m/s)' },
    { tex: 'v', text: 'the flow speed, in m/s' },
    { tex: '\\Delta p', text: 'for a Pitot-static tube: total pressure at the nose minus static pressure at the side ports, $\\tfrac12\\rho v^2$' },
  ],
  why: 'Bernoulli’s equation turns pressure readings into speeds — Venturi meters on propellant lines, Pitot tubes on every aircraft — and predicts the pressure drop wherever a flow speeds up, including the drop that makes a pump cavitate.',
  visual: {
    title: 'Faster flow, lower pressure',
    lead: t`The pipe from the last lesson, now with open tubes on its wall: the liquid in each tube rises to a height set by the static pressure there. Below, the pressure budget along the pipe.`,
    tasks: [
      'Narrow the throat: the throat speed rises and its column drops — faster flow, lower pressure.',
      'Watch the budget: the blue static pressure and the gold ½ρv² always add up to the same dashed total.',
      'Push the inlet speed up with a narrow throat until the throat pressure would fall below the liquid’s vapour pressure: in reality the liquid boils there (cavitation).',
    ],
    ...flow({ scene: 'venturi', v1: 2, ratio: 0.4, p1: 200000, sliders: true },
      'Steady, incompressible flow with no friction, uniform across each section. Static pressure plus ½ρv² is the same all along the pipe; real pipes lose a little to friction, so a real outlet column stands slightly lower than the inlet’s. Columns not drawn to the pipe’s scale; particles slowed for viewing.'),
  },
  example: {
    prompt: t`A light aircraft’s Pitot-static tube measures a difference of $2.45$ kPa between its nose port and its static ports, at $3$ km where the air’s density is $0.909\ \text{kg/m}^3$. (a) What is the true airspeed? (b) What does an airspeed indicator calibrated with sea-level air ($1.225\ \text{kg/m}^3$) show?`,
    visual: flow({ scene: 'pitot', v: 73.4, alt: 3, play: false }, 'The probe in the airflow: the nose port reads the total pressure, the side ports the static pressure; the dial is calibrated with sea-level density.'),
    steps: [
      { label: 'Bernoulli at the nose', text: t`Along the streamline that ends on the nose, the air slows to rest: $p + \tfrac12\rho v^2 = p_\text{nose}$, so $\Delta p = p_\text{nose} - p = \tfrac12\rho v^2$.` },
      { label: 'True airspeed', text: t`$v = \sqrt{\dfrac{2\,\Delta p}{\rho}} = \sqrt{\dfrac{2(2450)}{0.909}} = 73.4\ \text{m/s}$.` },
      { label: 'What the dial shows', text: t`The dial assumes $1.225\ \text{kg/m}^3$: $\sqrt{\dfrac{2(2450)}{1.225}} = 63.2\ \text{m/s}$ — 14% less than the true speed.` },
      { label: 'Sense check', text: t`The same $\Delta p$ means a faster flow in thinner air, so the dial under-reads at altitude: $63.2\times\sqrt{1.225/0.909} = 73.4$. ✓ Pilots fly by the *indicated* speed anyway, because lift and stall depend on $\tfrac12\rho v^2$ — exactly what the dial measures.` },
    ],
    answer: t`(a) $v = 73$ m/s (true); (b) the dial reads $63$ m/s.`,
  },
  practice: [
    mcq({
      id: 'lowest-p', difficulty: 1,
      prompt: t`Water flows steadily from left to right through a horizontal pipe with a wide section A, a narrow section B and a middle-sized section C. Where is the pressure lowest?`,
      choices: ['In B, the narrow section', 'In A, the wide section, where the water is slowest', 'In C', 'Nowhere: the pressure is the same throughout one pipe'],
      answer: 0,
      why: {
        1: 'That reverses Bernoulli: slow water keeps more of its energy as pressure. Faster flow has *lower* pressure.',
        2: 'C is narrower than A, so its pressure is below A’s — but B is narrower still.',
        3: 'In a flowing fluid the pressure changes wherever the speed does: p + ½ρv² stays constant, not p.',
      },
      hints: ['Where is the water fastest?', 'In a horizontal pipe, p + ½ρv² is the same everywhere.'],
      teach: 'Along a horizontal streamline, where the speed is highest the pressure is lowest.',
      explain: t`B has the smallest area, so the highest speed (continuity), so the largest $\tfrac12\rho v^2$ — and since $p + \tfrac12\rho v^2$ is fixed, the lowest $p$.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 10], y: [-2, 2], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          shade: [box(0, 3.2, -1.2, 1.2, 'accent', 0.3), box(3.2, 6.4, -0.45, 0.45, 'accent', 0.3), box(6.4, 10, -0.8, 0.8, 'accent', 0.3)],
          curves: [seg([0, 1.2], [3.2, 1.2]), seg([3.2, 1.2], [3.2, 0.45]), seg([3.2, 0.45], [6.4, 0.45]), seg([6.4, 0.45], [6.4, 0.8]), seg([6.4, 0.8], [10, 0.8]), seg([0, -1.2], [3.2, -1.2]), seg([3.2, -1.2], [3.2, -0.45]), seg([3.2, -0.45], [6.4, -0.45]), seg([6.4, -0.45], [6.4, -0.8]), seg([6.4, -0.8], [10, -0.8])],
          arrows: [{ from: [0.3, 0], to: [1.3, 0], color: 'ink2' }],
          points: [label(1.5, 1.55, 'A', 'gold'), label(4.7, 0.8, 'B', 'gold'), label(8.1, 1.15, 'C', 'gold')],
        },
        caption: 'The pipe from above, flow left to right. Not to scale.',
      },
    }),
    num({
      id: 'speed-up', difficulty: 1,
      gen(r) {
        const p1 = r.pick([180, 200, 250]), v1 = r.pick([1.5, 2.0, 3.0]), v2 = r.pick([4, 5, 6]);
        const drop = 0.5 * (v2 * v2 - v1 * v1), p2 = p1 - drop;   // kPa, water
        return {
          prompt: t`Water ($1000\ \text{kg/m}^3$) flows through a horizontal pipe. Where its speed is ${v1.toFixed(1)} m/s the pressure is ${p1} kPa. What is the pressure further along, where the pipe narrows and the speed is ${v2} m/s?`,
          answer: p2, units: 'kPa', tol: { rel: 0.002 },
          errors: [
            { value: p1 + drop, feedback: 'Faster flow has lower pressure, not higher: the extra kinetic energy comes out of the pressure.' },
            { value: p1 - 2 * drop, feedback: t`Kinetic energy per volume is $\tfrac12\rho v^2$ — keep the ½.` },
            { value: p1 - 0.5 * (v2 - v1) ** 2, feedback: t`Square each speed first: the change is $\tfrac12\rho(v_2^2 - v_1^2)$, not $\tfrac12\rho(v_2 - v_1)^2$.` },
          ],
          hints: [t`Horizontal: $p_1 + \tfrac12\rho v_1^2 = p_2 + \tfrac12\rho v_2^2$.`, t`$p_2 = p_1 - \tfrac12\rho(v_2^2 - v_1^2)$; with $\rho = 1000$, $\tfrac12\rho v^2$ in kPa is just $0.5v^2$.`],
          teach: 'In a horizontal flow, p + ½ρv² is constant: speeding up costs pressure.',
          explain: t`$\tfrac12\rho(v_2^2 - v_1^2) = 500\,(${v2 * v2} - ${tn(v1 * v1)}) = ${tn(drop * 1000)}\ \text{Pa}$, so $p_2 = ${p1} - ${tn(drop)} = ${tn(p2, 4)}\ \text{kPa}$.`,
          visual: flow({ scene: 'venturi', v1, ratio: v1 / v2, p1: p1 * 1000, budget: false, values: false, play: false }, 'The pipe speeding the water up, with pressure tubes on its wall. Not to scale.'),
        };
      },
    }),
    num({
      id: 'torricelli', difficulty: 2,
      gen(r) {
        const h = r.pick([1.2, 2.0, 3.5, 5.0]);
        const v = Math.sqrt(2 * G * h);
        return {
          prompt: t`A large open water tank has a small hole in its side, ${h.toFixed(1)} m below the water’s surface. How fast does the water jet out of the hole? ($g = 9.8\ \text{m/s}^2$; the surface falls so slowly that its speed is negligible.)`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(G * h), feedback: t`Keep the factor 2: $\rho g h = \tfrac12\rho v^2$ gives $v^2 = 2gh$.` }, { value: 2 * G * h, feedback: 'That is v², not v: take the square root.' }],
          hints: [t`Compare the surface (pressure $p_\text{atm}$, speed ≈ 0, height $h$) with the jet (pressure $p_\text{atm}$, speed $v$, height 0).`, t`The pressures cancel, leaving $\rho g h = \tfrac12\rho v^2$.`],
          teach: 'Torricelli’s law: a liquid escaping a depth h below an open surface leaves at √(2gh) — as if it had fallen h.',
          explain: t`Both ends are at atmospheric pressure, so $\rho g h = \tfrac12\rho v^2$ and $v = \sqrt{2(9.8)(${h.toFixed(1)})} = ${tn(v)}\ \text{m/s}$ — the speed of a stone dropped ${h.toFixed(1)} m. (Real jets come out a few per cent slower because of friction at the hole.)`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-0.5, 7], y: [-0.4, 3.4], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(0, 2, 0, 2.8, 'accent', 0.32)],
              curves: [seg([0, 3.2], [0, 0]), seg([0, 0], [2, 0]), seg([2, 0], [2, 0.75]), seg([2, 0.9], [2, 3.2]), { param: ['2 + t', `0.82 - 0.16*t^2`], t: [0, 2.2], color: 'accent', width: 3 }, seg([2.25, 2.8], [2.25, 0.84], { color: 'gold', width: 1.4 })],
              points: [label(2.4, 1.85, `h = ${h.toFixed(1)} m`, 'gold'), label(0.4, 3.1, 'open to the air', 'ink2')],
            },
            caption: 'An open tank with a small hole in its side. Not to scale.',
          },
        };
      },
    }),
    num({
      id: 'pitot', difficulty: 2,
      gen(r) {
        const dp = r.pick([1500, 2200, 3000, 4100]);
        const v = Math.sqrt((2 * dp) / RHO0);
        return {
          prompt: t`At sea level ($\rho = 1.225\ \text{kg/m}^3$) an aircraft’s Pitot-static tube measures a difference of ${tn(dp)} Pa between its nose port and its static ports. What is the airspeed?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(dp / RHO0), feedback: t`The difference is $\tfrac12\rho v^2$: keep the 2 when you solve, $v = \sqrt{2\Delta p/\rho}$.` }, { value: (2 * dp) / RHO0, feedback: 'That is v²: take the square root.' }],
          hints: [t`At the nose the air is brought to rest, so $\Delta p = \tfrac12\rho v^2$.`],
          teach: 'A Pitot-static tube measures ½ρv²; the airspeed is √(2Δp/ρ).',
          explain: t`$v = \sqrt{\dfrac{2(${tn(dp)})}{1.225}} = ${tn(v)}\ \text{m/s}$ (${s3(v * 3.6)} km/h).`,
          visual: flow({ scene: 'pitot', v, alt: 0, values: false, play: false }, 'The Pitot-static probe in the airflow. The dial’s reading is hidden.'),
        };
      },
    }),
    num({
      id: 'feed-line', difficulty: 2,
      gen(r) {
        const p1 = r.pick([250, 300, 350]), v1 = r.pick([2, 3, 4]), v2 = r.pick([6, 8, 10]), h = r.pick([3, 4, 6]);
        const dyn = (0.5 * RHO.lox * (v1 * v1 - v2 * v2)) / 1000, head = (RHO.lox * G * h) / 1000;
        const p2 = p1 + dyn + head;
        return {
          prompt: t`Liquid oxygen ($1141\ \text{kg/m}^3$) leaves a tank at ${v1} m/s and ${p1} kPa, and flows down a feed line to a pump inlet ${h} m lower, speeding up to ${v2} m/s as the line narrows. Ignoring friction, what is the pressure at the pump inlet?`,
          answer: p2, units: 'kPa', tol: { rel: 0.003 },
          errors: [
            { value: p1 + dyn - head, feedback: t`Going *down* adds pressure: the $\rho g y$ term is larger at the tank, so $p_2$ gains $\rho g h$.` },
            { value: p1 + head, feedback: 'The liquid also speeds up, which costs pressure: include the change in ½ρv².' },
            { value: p1 + dyn, feedback: 'The inlet is lower than the tank: include the height term ρgh.' },
          ],
          hints: [t`$p_1 + \tfrac12\rho v_1^2 + \rho g y_1 = p_2 + \tfrac12\rho v_2^2 + \rho g y_2$, with $y_1 - y_2 = ${h}$ m.`, t`$p_2 = p_1 + \tfrac12\rho(v_1^2 - v_2^2) + \rho g h$.`],
          teach: 'Bernoulli trades pressure against both speed and height: p + ½ρv² + ρgy is constant along the flow.',
          explain: t`$\tfrac12\rho(v_1^2 - v_2^2) = ${tn(dyn)}$ kPa and $\rho g h = ${tn(head)}$ kPa, so $p_2 = ${p1} ${dyn < 0 ? '-' : '+'} ${tn(Math.abs(dyn))} + ${tn(head)} = ${tn(p2)}\ \text{kPa}$.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-0.4, 8], y: [-0.6, 4.2], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [box(0, 2.4, 2.2, 3.7, 'accent2', 0.35), box(0.95, 1.45, 0.6, 2.2, 'accent2', 0.35), box(1.45, 5.5, 0.72, 1.0, 'accent2', 0.35)],
              curves: [seg([0, 4.0], [0, 2.2]), seg([0, 2.2], [0.95, 2.2]), seg([1.45, 2.2], [2.4, 2.2]), seg([2.4, 2.2], [2.4, 4.0]), seg([0.95, 2.2], [0.95, 0.6]), seg([0.95, 0.6], [5.5, 0.72]), seg([1.45, 2.2], [1.45, 1.0]), seg([1.45, 1.0], [5.5, 1.0])],
              points: [{ x: 1.2, y: 2.1, color: 'gold', label: '1' }, { x: 5.5, y: 0.86, color: 'gold', label: '2: pump inlet' }, label(2.6, 3.1, 'LOX tank', 'ink2'), label(2.5, 1.6, `${h} m lower`, 'ink2')],
            },
            caption: 'The tank, the feed line and the pump inlet. Not to scale.',
          },
        };
      },
    }),
    num({
      id: 'venturi-meter', difficulty: 3,
      gen(r) {
        const D1 = r.pick([10, 12]), D2 = r.pick([5, 6]), dp = r.pick([12, 18, 25]);
        const A1 = area(D1 / 100), A2 = area(D2 / 100), k = (A1 / A2) ** 2 - 1;
        const v1 = Math.sqrt((2 * dp * 1000) / (1000 * k)), Q = A1 * v1 * 1000;
        return {
          prompt: t`A Venturi meter in a water line narrows from ${D1} cm to ${D2} cm. The pressure at the throat is ${dp} kPa below the pressure at the inlet. What is the flow rate, in L/s?`,
          answer: Q, units: 'L/s', tol: { rel: 0.005 },
          errors: [
            { value: A1 * Math.sqrt((2 * dp * 1000) / (1000 * (A1 / A2) ** 2)) * 1000, feedback: t`The inlet’s own speed counts too: $\tfrac12\rho(v_2^2 - v_1^2)$, which gives $(A_1/A_2)^2 - 1$, not $(A_1/A_2)^2$.` },
            { value: v1, feedback: 'That is the inlet speed in m/s. Multiply by the inlet area for the flow rate.' },
          ],
          hints: [t`Continuity: $v_2 = v_1 (A_1/A_2)$. Bernoulli: $\Delta p = \tfrac12\rho(v_2^2 - v_1^2)$.`, t`So $\Delta p = \tfrac12\rho v_1^2\left[(A_1/A_2)^2 - 1\right]$; solve for $v_1$, then $Q = A_1 v_1$.`],
          teach: 'A Venturi meter combines continuity and Bernoulli: the pressure drop at the throat fixes the speed, and so the flow rate.',
          explain: t`$(A_1/A_2)^2 - 1 = (${D1}/${D2})^4 - 1 = ${tn(k)}$, so $v_1 = \sqrt{\dfrac{2(${dp * 1000})}{1000\times${tn(k)}}} = ${tn(v1)}$ m/s and $Q = A_1 v_1 = ${tn(A1)}\times${tn(v1)} = ${tn(Q / 1000)}\ \text{m}^3/\text{s} = ${tn(Q)}\ \text{L/s}$. Venturi meters measure propellant flow on test stands this way, with no moving parts.`,
          visual: flow({ scene: 'venturi', v1, ratio: (D2 / D1) ** 2, p1: 150000, budget: false, values: false, play: false }, 'A Venturi meter with pressure taps at the inlet, the throat and the outlet. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'transit-myth', difficulty: 3, kind: 'error',
      prompt: t`A popular explanation of lift says: *“Air going over the curved top of a wing has farther to travel, so it must go faster to meet the air from underneath at the trailing edge at the same moment. Faster air has lower pressure, so the wing is pushed up.”* What is wrong with it?`,
      choices: [
        'Nothing makes the two streams meet again: air over the top actually reaches the trailing edge well before the air underneath',
        'Faster air has higher pressure, not lower',
        'Bernoulli’s equation does not apply to air',
        'Lift comes only from air striking the underside, not from pressure differences',
      ],
      answer: 0,
      why: {
        1: 'That reverses Bernoulli’s equation, which this part of the explanation gets right: along a streamline, faster flow has lower pressure.',
        2: 'At speeds well below sound, air flows like an incompressible fluid and Bernoulli’s equation holds along each streamline.',
        3: 'Both surfaces matter: on most wings the lowered pressure over the top contributes more lift than the raised pressure underneath.',
      },
      hints: ['Which step is an assumption with no physics behind it?', 'Is there any reason two parcels of air that part at the leading edge must arrive together?'],
      teach: 'There is no “equal transit time”: the wing turns the flow, and the curved flow sets up the pressure difference that is the lift.',
      explain: t`Smoke pulses in wind tunnels show the air over the top arriving first — it is even faster than “equal transit” claims. A wing at an angle turns the airflow downward; curving streamlines need a pressure difference across them, lower above the wing and higher below, and that difference is the lift. Bernoulli’s equation correctly links the faster flow above to its lower pressure; the equal-transit step is simply invented.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.6, 2.0], y: [-0.55, 0.65], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          shade: [{ fn: '0.42*sqrt(max(x, 0))*(1 - x)', lower: '-0.1*sqrt(max(x, 0))*(1 - x)', from: 0, to: 1, color: 'ink3', alpha: 0.8 }],
          // two streamlines, bowed over the wing and turned down behind it (downwash)
          curves: [{ fn: UPPER, color: 'ink3', width: 1.3 }, { fn: LOWER, color: 'ink3', width: 1.3 }],
          points: [{ x: 1.35, y: +streamline(UPPER_F, 1.35).toFixed(3), color: 'gold', label: 'pulse over the top' }, { x: 0.72, y: +streamline(LOWER_F, 0.72).toFixed(3), color: 'violet', label: 'pulse underneath', labelDy: 14 }],
        },
        caption: 'Two smoke pulses released together upstream, a moment later: the one over the top is already past the trailing edge. A sketch after wind-tunnel photographs; not to scale.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-drop', difficulty: 2,
      gen(r) {
        const D1 = r.pick([6, 8]), D2 = r.pick([3, 4]), v1 = r.pick([1.0, 1.5, 2.0]), p1 = r.pick([160, 200]);
        const v2 = v1 * (D1 / D2) ** 2, p2 = p1 - 0.5 * (v2 * v2 - v1 * v1);
        return {
          prompt: t`Water ($1000\ \text{kg/m}^3$) flows at ${v1.toFixed(1)} m/s and ${p1} kPa in a horizontal pipe ${D1} cm across, which narrows to ${D2} cm. What is the pressure in the narrow part?`,
          answer: p2, units: 'kPa', tol: { rel: 0.003 },
          errors: [{ value: p1 - 0.5 * (v1 * (D1 / D2)) ** 2 + 0.5 * v1 * v1, feedback: 'Areas go as the square of the diameter: v₂ = v₁(D₁/D₂)².' }, { value: p1 + 0.5 * (v2 * v2 - v1 * v1), feedback: 'Faster flow, lower pressure.' }],
          hints: [t`Continuity first: $v_2 = v_1(D_1/D_2)^2$. Then Bernoulli.`],
          teach: 'Continuity gives the new speed; Bernoulli turns the change in speed into a change in pressure.',
          explain: t`$v_2 = ${v1.toFixed(1)}\times(${D1}/${D2})^2 = ${tn(v2)}$ m/s; $p_2 = ${p1} - 0.5\,(${tn(v2 * v2)} - ${tn(v1 * v1)}) = ${tn(p2)}\ \text{kPa}$.`,
          visual: flow({ scene: 'venturi', v1, ratio: (D2 / D1) ** 2, p1: p1 * 1000, budget: false, values: false, play: false }, 'The pipe narrowing, with pressure tubes. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'cp-ports', difficulty: 2,
      prompt: t`On a Pitot-static tube, what do the small **side** ports measure?`,
      choices: ['The static pressure of the air streaming past', 'The total pressure, p + ½ρv²', 'The dynamic pressure, ½ρv², directly', 'Nothing while flying: they only vent the tube'],
      answer: 0,
      why: {
        1: 'The total pressure is what the nose port feels, where the air is brought to rest.',
        2: 'No single port reads ½ρv²: it is the *difference* between the nose port and the side ports.',
        3: 'They are essential: without the static pressure the instrument could not separate ½ρv² from the air’s own pressure.',
      },
      hints: ['At the side ports the air streams past without stopping.'],
      teach: 'The nose port reads the total pressure, the side ports the static pressure; their difference is ½ρv².',
      explain: t`Air flows along the side of the probe without being stopped, so the side ports feel the stream’s static pressure $p$; the nose port feels $p + \tfrac12\rho v^2$. The instrument subtracts one from the other. (The same static ports drive an aircraft’s altimeter.)`,
      visual: flow({ scene: 'pitot', v: 60, values: false, play: false }, 'A Pitot-static probe: nose port (gold line) and side ports (teal lines) run to the dial.'),
    }),
    num({
      id: 'cp-tas', difficulty: 3, transfer: true,
      gen(r) {
        const [km, rho] = r.pick([[2, 1.007], [4, 0.8194], [6, 0.6601]]), ias = r.pick([60, 75, 90]);
        const tas = ias * Math.sqrt(RHO0 / rho);
        return {
          prompt: t`A turboprop flies at ${km} km, where the air’s density is $${rho}\ \text{kg/m}^3$. Its airspeed dial, which converts the Pitot pressure difference to a speed using sea-level density ($1.225\ \text{kg/m}^3$), reads ${ias} m/s. Treating the air as incompressible, what is its true airspeed?`,
          answer: tas, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: ias * Math.sqrt(rho / RHO0), feedback: 'Thinner air gives a smaller Δp at the same speed, so the true speed must be higher than the reading, not lower.' }, { value: (ias * RHO0) / rho, feedback: 'Speed goes as the square root of the density ratio: v ∝ √(1/ρ) for a given Δp.' }],
          hints: [t`The same $\Delta p$: $\tfrac12(1.225)\,v_\text{dial}^2 = \tfrac12\rho\,v_\text{true}^2$.`, t`$v_\text{true} = v_\text{dial}\sqrt{1.225/\rho}$.`],
          teach: 'A dial calibrated at sea level under-reads in thin air: true speed = indicated speed × √(ρ₀/ρ).',
          explain: t`$v_\text{true} = ${ias}\sqrt{\dfrac{1.225}{${rho}}} = ${ias}\times${tn(Math.sqrt(RHO0 / rho))} = ${tn(tas)}\ \text{m/s}$. At these speeds compressing the air raises the reading a few per cent more; real air-data computers correct for that too.`,
          visual: flow({ scene: 'pitot', v: tas, alt: km, values: false, play: false }, 'The probe at altitude, in thinner air. The dial’s reading is hidden.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §14.6 Bernoulli’s Equation', url: 'https://openstax.org/books/university-physics-volume-1/pages/14-6-bernoullis-equation' },
  ],
});
