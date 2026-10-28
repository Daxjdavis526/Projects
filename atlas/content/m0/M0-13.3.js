// Mathematical modelling — turning a situation described in words into variables, relations and an equation, then checking the answer.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, bars, areaModel } from './_m0kit.js';

const t = String.raw;

/** A quantity split into parts: a bar of r parts of one kind and 1 of another (a mixture ratio), with plain-text labels. */
function splitBar(r, left, right, caption) {
  const tot = r + 1, w = 10 / tot;
  return areaModel({
    rects: [{ x: 0, y: 0, w: w, h: 1.4, color: 'gold', alpha: 0.4, label: left }, { x: w, y: 0, w: 10 - w, h: 1.4, color: 'accent', alpha: 0.35, label: right }],
    sides: [{ x: w / 2, y: -0.45, label: '1 part' }, { x: w + (10 - w) / 2, y: -0.45, label: `${nice(r)} parts` }],
    x: [-0.5, 10.5], y: [-1, 2], caption,
  });
}

/** Two straight-line motions on a position–time graph (a chase). */
const chasePic = (d0, vt, vc, T, caption, ticks = true) => ({
  type: 'graph',
  params: {
    x: [0, T], y: [0, +N(Math.max(d0 + vt * T, vc * T) * 1.05)], aspect: 'wide', xlabel: 't (h)', ylabel: 'distance (km)', ...(ticks ? {} : { xticks: 0 }),
    curves: [{ fn: `${N(d0)} + ${N(vt)}*x`, color: 'gold' }, { fn: `${N(vc)}*x`, color: 'accent' }],
    legend: [{ label: 'ahead', color: 'gold' }, { label: 'chaser', color: 'accent' }], legendAt: 'tl',
  },
  caption,
});

export default lesson({
  id: 'm0.M0-13.3',
  title: 'Mathematical modelling: from words to equations',
  minutes: 11, difficulty: 2,
  intro: t`Most real problems arrive as sentences. **Modelling** turns them into mathematics in four moves: **name** each unknown with a symbol and a unit; **translate** each fact into a relation; **solve**; and **check** the answer against the units, the extreme cases and common sense — then refine the model if it fails. A small dictionary does most of the translating:

- “is”, “gives”, “equals” → $=$
- “$p\%$ more than $W$” → $(1 + p/100)\,W$
- “$k$ times as many $A$ as $B$” → $A = kB$
- “per”, “for each” → a rate, multiplied by how many

The workhorse of this lesson is the chase: a vehicle starting a distance $d_0$ behind and closing at the **difference** of the two speeds catches up when the positions are equal,

$$v_c\,t = d_0 + v_a\,t \quad\Rightarrow\quad t = \frac{d_0}{v_c - v_a}.$$`,
  symbols: [
    { tex: 't', text: 'the time since the chase began, the unknown (in hours here)' },
    { tex: 'v_c', text: 'the chaser’s speed' },
    { tex: 'v_a', text: 'the speed of the vehicle ahead, in the same units' },
    { tex: 'd_0', text: 'the head start: how far ahead it was at $t = 0$' },
  ],
  why: t`Every physics problem is a modelling problem first: the hard part is usually deciding what the symbols are and which facts become equations. Getting the translation wrong — reversing a ratio, adding a percentage instead of multiplying — produces confident nonsense that no algebra can rescue.`,
  visual: {
    type: 'graph',
    title: 'A chase as two lines',
    lead: t`An air-refuelling tanker (gold) leaves with a head start $d_0$; a fighter (blue) follows from the same base. Each line is distance against time, so its slope is the speed. They meet where the lines cross.`,
    tasks: [
      t`Make the fighter faster: the lines cross earlier. The meeting time depends only on the head start and the *difference* in speeds.`,
      t`Set the two speeds equal: the lines are parallel and never meet. The formula divides by zero — the model is telling you something true.`,
      t`Double the head start: the crossing time doubles too, at any speeds.`,
    ],
    params: {
      x: [0, 3], y: [0, 2500], aspect: 'wide', xlabel: 't (h)', ylabel: 'distance (km)',
      sliders: [
        { key: 'd', label: t`Head start $d_0$`, min: 50, max: 400, step: 10, value: 200, unit: '\\text{km}', explain: t`How far ahead the tanker is when the fighter leaves.` },
        { key: 'va', label: t`Tanker speed $v_a$`, min: 400, max: 800, step: 10, value: 600, unit: '\\text{km/h}', explain: t`The speed of the aircraft ahead.` },
        { key: 'vc', label: t`Fighter speed $v_c$`, min: 500, max: 1000, step: 10, value: 800, unit: '\\text{km/h}', explain: t`The chaser’s speed.` },
      ],
      curves: [{ fn: 'd + va*x', color: 'gold' }, { fn: 'vc*x', color: 'accent' }],
      points: [{ x: 'd/(vc - va + 0.000001)', y: 'vc*d/(vc - va + 0.000001)', color: 'good', r: 6, when: 'step(vc - va - 0.5)' }],
      legend: [{ label: 'tanker (ahead)', color: 'gold' }, { label: 'fighter (chaser)', color: 'accent' }], legendAt: 'tl',
      readouts: [{ label: t`closing speed $v_c - v_a$ (km/h)`, expr: 'vc - va', digits: 3 }, { label: t`meeting time $t$ (h)`, expr: 'd/(vc - va)', digits: 3, when: 'step(vc - va - 0.5)' }],
    },
    caption: t`Constant speeds along one straight track: no acceleration, no turns. Real intercepts are planned the same way, with more terms.`,
  },
  example: {
    prompt: t`A rocket stage burns kerosene with liquid oxygen at an oxidizer-to-fuel **mixture ratio** of $2.6$ by mass. Its tanks hold $120$ t of propellant in all. How much liquid oxygen does it carry, and how much kerosene?`,
    visual: splitBar(2.6, 'kerosene', 'liquid oxygen', t`The propellant as $3.6$ equal-mass parts: one of kerosene, $2.6$ of oxygen. Widths are to scale by mass.`),
    steps: [
      { label: 'Name the unknowns', text: t`Let $O$ be the oxygen mass and $F$ the fuel mass, both in tonnes.` },
      { label: 'Translate', text: t`“$120$ t in all”: $O + F = 120$. “Mixture ratio $2.6$ by mass”: $O/F = 2.6$, so $O = 2.6F$.` },
      { label: 'Solve', text: t`Substitute: $2.6F + F = 3.6F = 120$, so $F = ${nice(sig(120 / 3.6, 4))}$ t and $O = 2.6F = ${nice(sig((2.6 * 120) / 3.6, 4))}$ t.` },
      { label: 'Check', text: t`$${nice(sig((2.6 * 120) / 3.6, 4))} + ${nice(sig(120 / 3.6, 4))} = 120$ and $${nice(sig((2.6 * 120) / 3.6, 4))}/${nice(sig(120 / 3.6, 4))} = 2.6$. Both facts hold.` },
      { label: 'Use the model', text: t`The tanks are not in the ratio $2.6$: liquid oxygen ($1141\ \text{kg/m}^3$) is denser than kerosene (about $810\ \text{kg/m}^3$), so the oxygen tank holds $2.6 \times 810/1141 \approx ${nice(sig((2.6 * 810) / 1141, 3))}$ times the fuel tank’s volume. A second fact turned into a second equation.` },
    ],
    answer: t`About $${nice(sig((2.6 * 120) / 3.6, 3))}$ t of liquid oxygen and $${nice(sig(120 / 3.6, 3))}$ t of kerosene.`,
  },
  practice: [
    mcq({
      id: 'percent-more', difficulty: 1,
      gen(r) {
        const p = r.pick([20, 30, 40, 50, 25]);
        return {
          prompt: t`At liftoff a rocket’s thrust $T$ is $${p}\%$ more than its weight $W$. Which equation says that?`,
          choices: [t`$T = ${nice(1 + p / 100)}\,W$`, t`$T = W + ${nice(p / 100)}$`, t`$T = ${nice(p / 100)}\,W$`, t`$${nice(1 + p / 100)}\,T = W$`],
          answer: 0,
          why: {
            1: t`Adding the bare number $${nice(p / 100)}$ adds $${nice(p / 100)}$ newtons, not $${p}\%$ of the weight. A percentage is a fraction *of* something.`,
            2: t`$${nice(p / 100)}W$ is the extra thrust alone, $${p}\%$ of the weight. The thrust is the weight plus that.`,
            3: t`That makes the thrust *smaller* than the weight: the factor sits on the wrong side.`,
          },
          hints: [t`“$${p}\%$ more than $W$” means $W$ plus $${p}\%$ of $W$.`],
          teach: t`“$p\%$ more than $W$” translates to $(1 + p/100)W$.`,
          explain: t`$T = W + ${nice(p / 100)}W = ${nice(1 + p / 100)}W$. The ratio $T/W = ${nice(1 + p / 100)}$ is the thrust-to-weight ratio; it must exceed $1$ for the rocket to leave the pad.`,
          visual: bars({ values: [1, 1 + p / 100], labels: ['W', 'T'], xlabel: '', ylabel: 'force (in units of W)', colors: ['ink3', 'accent'], caption: t`Weight and thrust at liftoff, as multiples of the weight.` }),
        };
      },
    }),
    expr({
      id: 'reversal', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, 6, 8]);
        return {
          prompt: t`A spacecraft carries ${k} times as many thrusters as propellant tanks. Write an equation linking the number of thrusters $T$ and the number of tanks $K$.`,
          answer: `T = ${k}K`,
          answerTeX: t`T = ${k}K`,
          vars: { T: [1, 20], K: [1, 20] }, mode: 'equation',
          errors: [{ answer: `${k}T = K`, feedback: t`Test it: with $1$ tank there should be ${k} thrusters, but $${k}T = K$ gives $T = 1/${k}$. Writing the number next to the word it follows is the classic reversal error.` }],
          hints: [t`Try numbers first: with $1$ tank, how many thrusters? With $2$ tanks?`, t`The bigger number of things is $T$: $T$ equals $${k}$ times the smaller.`],
          teach: t`Check a translated equation with one easy case: it catches reversed ratios.`,
          explain: t`$T = ${k}K$: with $K = 2$ tanks, $T = ${2 * k}$ thrusters, as the sentence says.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.5, 8.5], y: [-0.8, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
              shade: [0, 4.5].map((x0) => ({ fn: '0.35', lower: '-0.35', from: x0, to: x0 + 0.7, color: 'gold', alpha: 0.6 })),
              points: [0, 4.5].flatMap((x0) => Array.from({ length: k }, (_, i) => ({ x: N(x0 + 1.1 + (i % 4) * 0.7), y: N(i < 4 ? 0.9 : 0.25), color: 'accent', r: 5 }))),
            },
            caption: t`Two tanks (gold squares), each with its ${k} thrusters (blue dots).`,
          },
        };
      },
    }),
    num({
      id: 'mixture', difficulty: 2,
      gen(r) {
        const [prop, R] = r.pick([['methane and liquid oxygen', 3.6], ['liquid hydrogen and liquid oxygen', 6], ['kerosene and liquid oxygen', 2.3], ['hydrazine and nitrogen tetroxide', 1.4]]);
        const M = r.pick([50, 80, 150, 240, 400]), ans = (R * M) / (R + 1);
        return {
          prompt: t`An engine burns ${prop} at an oxidizer-to-fuel mixture ratio of $${R}$ by mass. The stage holds $${M}$ t of propellant. How many tonnes of oxidizer?`,
          answer: ans, units: 't', tol: { rel: 0.005 },
          errors: [{ value: M / (R + 1), feedback: t`That is the fuel: one part in $${nice(R + 1)}$. The oxidizer is the other $${R}$ parts.` }, { value: M / R, feedback: t`$O/F = ${R}$ does not mean $O = M/${R}$. Write $O + F = ${M}$ and $O = ${R}F$, then solve.` }, { value: R * M, feedback: t`The ratio compares oxidizer with fuel, not with the total.` }],
          hints: [t`$O + F = ${M}$ and $O = ${R}F$.`, t`So $${nice(R + 1)}F = ${M}$.`],
          teach: t`A ratio $O:F = R:1$ splits a total into $R + 1$ parts.`,
          explain: t`$F = \dfrac{${M}}{${nice(R + 1)}} = ${nice(sig(M / (R + 1), 4))}$ t and $O = ${R}F = ${nice(sig(ans, 4))}$ t.`,
          visual: splitBar(R, 'fuel', 'oxidizer', t`The propellant as $${nice(R + 1)}$ equal-mass parts.`),
        };
      },
    }),
    num({
      id: 'catch-up', difficulty: 2,
      gen(r) {
        const d0 = r.pick([120, 150, 200, 240, 300]), va = r.pick([540, 600, 660]), vc = va + r.pick([150, 200, 240, 300]), ans = d0 / (vc - va);
        return {
          prompt: t`A tanker aircraft takes off and flies at $${va}$ km/h. When it is $${d0}$ km away, a fighter takes off from the same base along the same track at $${vc}$ km/h. How long, in hours, until the fighter catches the tanker?`,
          answer: ans, units: 'h', tol: { rel: 0.005 },
          errors: [{ value: d0 / (vc + va), feedback: t`Adding the speeds is right for two craft flying *towards* each other. Here they fly the same way, so the gap closes at the difference.` }, { value: d0 / vc, feedback: t`The tanker keeps moving: the gap closes at $${vc} - ${va}$ km/h, not $${vc}$.` }],
          hints: [t`Positions: fighter $${vc}t$, tanker $${d0} + ${va}t$.`, t`Set them equal: $(${vc} - ${va})t = ${d0}$.`],
          teach: t`A chase closes at the difference of the speeds: $t = d_0/(v_c - v_a)$.`,
          explain: t`$${vc}t = ${d0} + ${va}t \Rightarrow t = \dfrac{${d0}}{${vc - va}} = ${nice(sig(ans, 3))}$ h, about $${Math.round(ans * 60)}$ minutes.`,
          visual: chasePic(d0, va, vc, 2.5, t`Distance from the base against time; the lines cross at the meeting. The time axis is left unnumbered.`, false),
        };
      },
    }),
    num({
      id: 'two-readings', difficulty: 3,
      gen(r) {
        const rate = r.pick([1, 1.5, 2, 2.5]), t1 = r.pick([5, 10, 15]), dt = r.pick([10, 12, 20]), p1 = r.int(70, 90), p2 = p1 - rate * dt, t2 = t1 + dt, ans = t1 + p1 / rate;
        return {
          prompt: t`During a static fire, a propellant gauge reads $${p1}\%$ at $t = ${t1}$ s and $${nice(p2)}\%$ at $t = ${t2}$ s. Assuming the level falls at a steady rate, at what time will the tank be empty?`,
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: p1 / rate, feedback: t`That is how long *after* $t = ${t1}$ s it takes; add the ${t1} s already gone.` }, { value: t2 + p1 / rate, feedback: t`Start from the reading at $t = ${t2}$ s, where $${nice(p2)}\%$ remains.` }],
          hints: [t`The rate is $\dfrac{${p1} - ${nice(p2)}}{${t2} - ${t1}}$ per cent per second.`, t`Write $p(t) = ${p1} - \text{rate}\times(t - ${t1})$ and set $p = 0$.`],
          teach: t`Two readings fix a straight-line model; set it to zero to find when it runs out.`,
          explain: t`The rate is $${nice(rate)}\%$ per second, so $0 = ${p1} - ${nice(rate)}(t - ${t1})$ gives $t = ${t1} + ${p1}/${nice(rate)} = ${nice(sig(ans, 4))}$ s. Real tanks never quite empty: engines shut down with a reserve, and the flow is not perfectly steady.`,
          visual: { type: 'graph', params: { x: [0, +N(ans * 1.15)], y: [0, 100], aspect: 'wide', xlabel: 't (s)', ylabel: 'propellant left (%)', points: [{ x: t1, y: p1, color: 'gold', r: 5 }, { x: t2, y: N(p2), color: 'gold', r: 5 }] }, caption: t`The two gauge readings.` },
        };
      },
    }),
    num({
      id: 'two-pumps', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[3, 6], [4, 12], [2, 3], [6, 12], [5, 20]]), ans = 1 / (1 / a + 1 / b);
        return {
          prompt: t`One pump fills a launch vehicle’s oxidizer tank in $${a}$ hours; a second pump alone takes $${b}$ hours. How long do they take working together?`,
          answer: ans, units: 'h', tol: { rel: 0.005 },
          errors: [{ value: (a + b) / 2, feedback: t`Averaging the times would make two pumps slower than the faster one alone. Add the *rates* instead.` }, { value: a + b, feedback: t`Together they are faster than either alone, so the time must be less than $${a}$ h.` }],
          hints: [t`The first pump fills $\tfrac1{${a}}$ of the tank per hour; the second $\tfrac1{${b}}$.`, t`Together: $\tfrac1{${a}} + \tfrac1{${b}}$ per hour, so the time is the reciprocal.`],
          teach: t`Rates add, times do not: $1/t = 1/t_1 + 1/t_2$.`,
          explain: t`$\dfrac1t = \dfrac1{${a}} + \dfrac1{${b}} = \dfrac{${a + b}}{${a * b}}$, so $t = \dfrac{${a * b}}{${a + b}} = ${nice(sig(ans, 3))}$ h — less than the faster pump alone, as it must be.`,
          visual: bars({ values: [1 / a, 1 / b], labels: [`1/${a} per hour`, `1/${b} per hour`], xlabel: '', ylabel: 'tank filled per hour', colors: ['accent', 'gold'], caption: t`Each pump’s rate: the fraction of the tank it fills in an hour.` }),
        };
      },
    }),
    mcq({
      id: 'interpret', difficulty: 2,
      gen(r) {
        const m0 = r.pick([400, 550, 600]), k = r.pick([2, 2.5, 3]);
        return {
          prompt: t`An engineer models a rocket’s mass during the first stage burn as $m(t) = ${m0} - ${k}t$, with $m$ in tonnes and $t$ in seconds. What does the ${k} mean?`,
          choices: [t`The engines burn $${k}$ t of propellant each second`, t`The rocket loses ${k}% of its mass each second`, t`The burn lasts ${k} minutes`, t`The rocket’s mass after one second is $${k}$ t`],
          answer: 0,
          why: {
            1: t`A percentage loss would make $m$ decay exponentially. Here the mass drops by the same amount every second: a straight line.`,
            2: t`The model says nothing directly about the burn’s length; a slope is a rate, with units of tonnes per second.`,
            3: t`After one second the mass is $${m0} - ${k} = ${m0 - k}$ t. The ${k} is how much is *lost* per second.`,
          },
          hints: [t`What are the units of the ${k}? It multiplies seconds and gives tonnes.`],
          teach: t`In a linear model, the coefficient of $t$ is a rate, with units of (output)/(time).`,
          explain: t`The slope is $-${k}$ t/s: the mass falls by $${k}$ t each second as propellant is burned. The constant $${m0}$ t is the mass at liftoff. The model only holds while the engines run at full thrust.`,
          visual: { type: 'graph', params: { x: [0, 150], y: [0, m0 * 1.08], aspect: 'wide', xlabel: 't (s)', ylabel: 'mass m (t)', curves: [{ fn: `${m0} - ${k}*x`, color: 'accent' }] }, caption: t`The model’s mass against time during the burn.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-round-trip', difficulty: 3, transfer: true,
      gen(r) {
        const [v1, v2] = r.pick([[600, 400], [900, 600], [300, 200], [800, 400], [720, 480]]), ans = (2 * v1 * v2) / (v1 + v2);
        return {
          prompt: t`A survey aircraft flies out to a test range at $${v1}$ km/h and returns along the same route, into a headwind, at $${v2}$ km/h. What is its average speed for the round trip?`,
          answer: ans, units: 'km/h', tol: { rel: 0.003 },
          errors: [{ value: (v1 + v2) / 2, feedback: t`Averaging the two speeds weights them equally, but the aircraft spends *longer* on the slow leg. Average speed is total distance over total time.` }],
          hints: [t`Call the one-way distance $D$. Find the time for each leg.`, t`Average speed $= \dfrac{2D}{D/${v1} + D/${v2}}$; the $D$ cancels.`],
          teach: t`Average speed is total distance divided by total time — not the average of the speeds.`,
          explain: t`$\bar v = \dfrac{2D}{D/${v1} + D/${v2}} = \dfrac{2(${v1})(${v2})}{${v1} + ${v2}} = ${nice(sig(ans, 4))}$ km/h, below the simple average $${(v1 + v2) / 2}$ km/h because the slow leg lasts longer.`,
          visual: { type: 'graph', params: { x: [0, +N(2 / v1 + 2 / v2) * 1.03], y: [0, 2.3], aspect: 'wide', xlabel: 'time', xticks: 0, ylabel: 'distance from base', yticks: 0, curves: [{ fn: `${v1}*x`, domain: [0, N(2 / v1)], color: 'accent' }, { fn: `2 - ${v2}*(x - ${N(2 / v1)})`, domain: [N(2 / v1), N(2 / v1 + 2 / v2)], color: 'gold' }] }, caption: t`Distance from the base against time: the outbound leg (blue) is steeper and shorter in time than the return (gold).` },
        };
      },
    }),
    num({
      id: 'cp-stages', difficulty: 3,
      gen(r) {
        const k = r.pick([3, 4, 5]), c = r.pick([10, 20, 30]), M = r.pick([300, 420, 500, 560]), s2 = (M - c) / (k + 1), ans = k * s2 + c;
        return {
          prompt: t`A two-stage rocket has a total mass of $${M}$ t. Its first stage is $${c}$ t heavier than ${k} times its second stage. What is the mass of the first stage?`,
          answer: ans, units: 't', tol: { rel: 0.005 },
          errors: [{ value: s2, feedback: t`That is the second stage. The first is $${k}$ times it plus $${c}$ t.` }, { value: (k * (M + c)) / (k + 1), feedback: t`Translate carefully: “$${c}$ t heavier than ${k} times the second” is $S_1 = ${k}S_2 + ${c}$.` }, { value: (k * M) / (k + 1), feedback: t`You left out the extra $${c}$ t.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$S_1 + S_2 = ${M}$ and $S_1 = ${k}S_2 + ${c}$.`, t`Substitute: $${k + 1}S_2 + ${c} = ${M}$.`],
          teach: t`Two facts, two unknowns: translate each sentence into an equation and substitute.`,
          explain: t`$${k + 1}S_2 = ${M - c}$ gives $S_2 = ${nice(sig(s2, 4))}$ t, so $S_1 = ${k}(${nice(sig(s2, 4))}) + ${c} = ${nice(sig(ans, 4))}$ t. Check: the two add to $${M}$ t.`,
          visual: splitBar(k, 'stage 2', 'stage 1', t`Roughly how the mass divides: stage 1 is about ${k} times stage 2 (the extra $${c}$ t is not drawn).`),
        };
      },
    }),
    mcq({
      id: 'cp-per', difficulty: 2,
      gen(r) {
        const q = r.pick([1.4, 1.5, 1.6, 1.8]), ve = 1000 / q;
        return {
          prompt: t`A small cold-gas thruster uses $${q}$ grams of nitrogen per newton-second of impulse it delivers. Which equation gives the nitrogen mass $m$ (in grams) used to deliver an impulse $J$ (in N·s)?`,
          choices: [t`$m = ${q}J$`, t`$J = ${q}m$`, t`$m = J/${q}$`, t`$m = ${q} + J$`],
          answer: 0,
          why: {
            1: t`That says one gram buys ${q} N·s. The rate is ${q} grams for each N·s, so more impulse means proportionally more grams: $m = ${q}J$.`,
            2: t`Test $J = 1$ N·s: it should use ${q} g, but this gives $1/${q}$ g.`,
            3: t`“Per” means a rate to multiply by, not a fixed amount to add.`,
          },
          hints: [t`Test one easy case: for $J = 1$ N·s, how much nitrogen? For $J = 2$?`],
          teach: t`“$q$ per unit of $J$” means the total is $q$ times $J$.`,
          explain: t`$m = ${q}J$: $1$ N·s uses ${q} g, $10$ N·s uses ${nice(10 * q)} g. Turned around, each kilogram buys $1000/${q} = ${Math.round(ve)}$ N·s: that is the exhaust speed in m/s, and divided by $g_0 = 9.81\ \text{m/s}^2$ it is the **specific impulse**, $${Math.round(ve / 9.81)}$ s — typical of nitrogen cold-gas thrusters.`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, +N(q * 10 * 1.1)], aspect: 'wide', xlabel: 'impulse J (N·s)', ylabel: 'nitrogen used (g)', points: [{ x: 1, y: q, color: 'gold', r: 5 }, { x: 2, y: 2 * q, color: 'gold', r: 5 }] }, caption: t`Two test cases: $1$ N·s and $2$ N·s of impulse.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax College Algebra 2e, §2.3 Models and Applications', url: 'https://openstax.org/books/college-algebra-2e/pages/2-3-models-and-applications' },
  ],
});
