// Proportional reasoning and scaling laws — ratios of power laws, the square–cube law, inverse squares and Kleiber's law.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, logLadder } from './_m0kit.js';
import { seg } from './_m0geo.js';

const t = String.raw;
const L10 = Math.log10;

/** A rocket outline of length h (nose up) standing at x0: body, nose cone and fins, as line segments. */
function rocket(x0, h, color = 'accent') {
  const w = 0.16 * h, b = 0.72 * h, P = (x, y) => [x0 + x, y];
  return [
    seg(P(-w / 2, 0), P(-w / 2, b), { color, width: 2 }), seg(P(w / 2, 0), P(w / 2, b), { color, width: 2 }),
    seg(P(-w / 2, b), P(0, h), { color, width: 2 }), seg(P(w / 2, b), P(0, h), { color, width: 2 }),
    seg(P(-w / 2, 0), P(w / 2, 0), { color, width: 2 }),
    seg(P(-w / 2, 0.18 * h), P(-w, 0), { color, width: 2 }), seg(P(w / 2, 0.18 * h), P(w, 0), { color, width: 2 }),
  ];
}
const rocketsPic = (k, caption) => {
  const h1 = 1, h2 = k, gap = 0.6 + 0.2 * k;
  return {
    type: 'graph',
    params: { x: [-0.6, +N(gap + 0.6 * k + 0.6)], y: [-0.15, +N(k * 1.08)], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      curves: [{ fn: '0', domain: [-0.6, N(gap + 0.6 * k + 0.6)], color: 'ink4', width: 1.2 }, ...rocket(0, h1, 'gold'), ...rocket(gap, h2, 'accent')],
      points: [{ x: 0, y: N(h1 + 0.12 * k), r: 0, label: '×1', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'gold' }, { x: N(gap + 0.12 * k), y: N(0.45 * k), r: 0, label: `×${k}`, labelAlign: 'left', labelDx: 6, labelDy: 0, color: 'accent' }] },
    caption,
  };
};
/** Two discs (mirrors, cross-sections, stars) to scale side by side. */
function discs(r1, r2, labels, caption, colors = ['gold', 'accent']) {
  const c1 = -1.5 * r1 - 0.3, c2 = 1.2 * r2 + 0.3, H = 1.25 * Math.max(r1, r2);
  const disc = (c, r, col) => ({ fn: `sqrt(max(0, ${N(r * r)} - (x - ${N(c)})^2))`, lower: `-sqrt(max(0, ${N(r * r)} - (x - ${N(c)})^2))`, from: N(c - r), to: N(c + r), color: col, alpha: 0.35 });
  return {
    type: 'graph',
    params: { x: [+N(c1 - 2 * H), +N(c2 + 2 * H)], y: [+N(-H), +N(H)], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      shade: [disc(c1, r1, colors[0]), disc(c2, r2, colors[1])],
      curves: [{ param: [`${N(c1)} + ${N(r1)}*cos(t)`, `${N(r1)}*sin(t)`], t: [0, 6.2832], color: colors[0], width: 2 }, { param: [`${N(c2)} + ${N(r2)}*cos(t)`, `${N(r2)}*sin(t)`], t: [0, 6.2832], color: colors[1], width: 2 }],
      points: [{ x: N(c1), y: N(-r1), r: 0, label: labels[0], labelAlign: 'center', labelDx: 0, labelDy: 14, color: 'ink' }, { x: N(c2), y: N(-r2), r: 0, label: labels[1], labelAlign: 'center', labelDx: 0, labelDy: 14, color: 'ink' }] },
    caption,
  };
}

export default lesson({
  id: 'm0.M0-13.4',
  title: 'Proportional reasoning and scaling laws',
  minutes: 11, difficulty: 2,
  intro: t`If $y \propto x^{p}$ — that is, $y = C\,x^{p}$ for some constant $C$ — then you can compare two cases **without knowing $C$**:

$$\frac{y_2}{y_1} = \left(\frac{x_2}{x_1}\right)^{p}$$

Double the distance from a planet and its gravity ($p = -2$) drops to a quarter. The most useful case is **geometric scaling**: make every length of an object $k$ times bigger and every area grows by $k^2$, every volume — and so every mass, at the same density — by $k^3$. Since volume outgrows area, the ratio of surface to volume falls as $1/k$: the **square–cube law**, which shapes rockets, animals and stars alike.`,
  symbols: [
    { tex: 'x,\\ y', text: 'two quantities linked by a power law; subscripts $1$ and $2$ mark two cases' },
    { tex: 'p', text: 'the exponent (a pure number): $2$ for an area, $3$ for a volume, $-2$ for an inverse-square law' },
    { tex: 'C', text: 'the constant of proportionality, which cancels in any ratio' },
    { tex: 'k', text: 'the scale factor: how many times longer every length becomes' },
  ],
  why: t`Scaling arguments answer “what happens if we make it bigger?” in one line: why big rockets are more efficient, why a satellite twice as far gets a quarter of the sunlight, why elephants have thick legs. They pair with [log–log plots](#/lesson/m0.M0-6.5), where every power law is a straight line whose slope is $p$.`,
  visual: {
    type: 'graph',
    title: 'Scale everything by k',
    lead: t`On log–log axes each power of the scale factor $k$ is a straight line: length (slope $1$), area (slope $2$), volume (slope $3$), and surface-to-volume (slope $-1$). The dots mark the current $k$.`,
    tasks: [
      t`At $k = 2$: area $\times4$, volume $\times8$, surface-to-volume $\times\tfrac12$. A rocket twice as long holds eight times the propellant inside four times the skin.`,
      t`At $k = 10$ the volume has grown a thousandfold but the area only a hundredfold. The gap between the lines widens forever.`,
      t`Below $k = 1$ everything reverses: small things are mostly surface, which is why a dust grain stays aloft and a mouse loses heat fast.`,
    ],
    params: {
      x: [-0.35, 1.05], y: [-1.1, 3.2], xlog: true, ylog: true, aspect: 'wide', xlabel: 'scale factor k', ylabel: 'factor of change',
      sliders: [{ key: 'k', label: t`Scale factor $k$`, min: 0.5, max: 10, value: 2, logScale: true, explain: t`Every length of the object is multiplied by $k$.` }],
      curves: [
        { fn: 'x', color: 'ink3', label: 'length', labelAt: 0.95, labelDx: -40, labelDy: 12 },
        { fn: '2*x', color: 'accent', label: 'area', labelAt: 0.95, labelDx: -40, labelDy: 14 },
        { fn: '3*x', color: 'gold', label: 'volume', labelAt: 0.7, labelDx: -62, labelDy: -2 },
        { fn: '-x', color: 'teal', label: 'surface ÷ volume', labelAt: 0.7, labelDx: -60, labelDy: 14 },
      ],
      points: [
        { x: 'log10(k)', y: 'log10(k)', color: 'ink3', r: 5 }, { x: 'log10(k)', y: '2*log10(k)', color: 'accent', r: 5 },
        { x: 'log10(k)', y: '3*log10(k)', color: 'gold', r: 5 }, { x: 'log10(k)', y: '-log10(k)', color: 'teal', r: 5 },
      ],
      readouts: [
        { label: t`area $\times k^2$`, expr: 'k^2', digits: 3 },
        { label: t`volume $\times k^3$`, expr: 'k^3', digits: 3 },
        { label: t`surface/volume $\times 1/k$`, expr: '1/k', digits: 3 },
      ],
    },
    caption: t`Exact for geometrically similar objects (the same shape, every length scaled). Real rockets and animals change shape as they grow, partly to cheat these laws.`,
  },
  example: {
    prompt: t`A one-tenth-scale model rocket and the full-size rocket have the same shape and fly through the same air at the same speed. Compare the drag force, the mass (same average density) and the deceleration drag causes.`,
    visual: rocketsPic(4, t`Two geometrically similar rockets, one four times longer (drawn here at $k = 4$; the example uses $k = 10$). Outlines only.`),
    steps: [
      { label: 'Drag goes with area', text: t`Drag is $F = \tfrac12 C_D\rho v^2 A$ with $A$ the frontal area. Same shape, air and speed, so $F \propto A \propto L^2$: the full rocket, $10$ times longer, feels $10^2 = 100$ times the drag.` },
      { label: 'Mass goes with volume', text: t`At the same average density, $m \propto L^3$: the full rocket is $10^3 = 1000$ times heavier.` },
      { label: 'Divide', text: t`Deceleration from drag is $F/m \propto L^2/L^3 = 1/L$. The full rocket’s is $\dfrac{100}{1000} = \dfrac{1}{10}$ of the model’s.` },
      { label: 'Sense check', text: t`The square–cube law in action: **bigger rockets are slowed less by air**, so they lose a smaller share of their $\Delta v$ to drag. (Not every saving scales so kindly: a pressurized tank’s walls must thicken in proportion to its radius, so tank mass grows like $L^3$ too.)` },
    ],
    answer: t`Drag $\times100$, mass $\times1000$, drag deceleration $\times\tfrac{1}{10}$ for the full-size rocket.`,
  },
  practice: [
    num({
      id: 'inverse-square', difficulty: 1,
      gen(r) {
        const [r1, r2, what] = r.pick([[7000, 42164, 'geostationary orbit'], [6800, 26560, 'a GPS orbit'], [6371, 384400, 'the Moon’s distance'], [6600, 13200, 'twice its starting radius']]), ans = (r1 / r2) ** 2;
        return {
          prompt: t`A satellite moves from an orbit of radius $${r1}$ km to ${what}, $${r2}$ km from Earth’s centre. Gravity follows $F \propto 1/r^2$. By what factor does the pull on it change?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: r1 / r2, feedback: t`Gravity falls with the *square* of the distance: square the ratio.` }, { value: (r2 / r1) ** 2, feedback: t`Upside down: farther away means a *weaker* pull, a factor below $1$.` }],
          hints: [t`$\dfrac{F_2}{F_1} = \left(\dfrac{r_1}{r_2}\right)^2$.`],
          teach: t`An inverse-square law: multiply the distance by $k$ and the effect is divided by $k^2$.`,
          explain: t`$\dfrac{F_2}{F_1} = \left(\dfrac{${r1}}{${r2}}\right)^2 = ${nice(sig(ans, 3))}$. Weaker, but never zero: there is no altitude where gravity “switches off”.`,
          visual: { type: 'graph', params: { x: [0, +N(r2 * 1.1)], y: [0, 1.15], aspect: 'wide', xlabel: 'r (km)', ylabel: 'pull ÷ pull at the start', curves: [{ fn: `(${r1}/max(x, ${N(r1 * 0.9)}))^2`, domain: [N(r1 * 0.9), N(r2 * 1.1)], color: 'accent' }], points: [{ x: r1, y: 1, color: 'gold', r: 5 }], vlines: [{ x: r2, color: 'gold' }] }, caption: t`The pull against distance from Earth’s centre, relative to its value at the starting orbit; the gold line marks the new orbit.` },
        };
      },
    }),
    num({
      id: 'mirror', difficulty: 2,
      gen(r) {
        const [n1, d1, n2, d2] = r.pick([['Hubble', 2.4, 'James Webb', 6.5], ['the Very Large Telescope', 8.2, 'the Extremely Large Telescope', 39], ['Hubble', 2.4, 'Keck', 10], ['Spitzer', 0.85, 'James Webb', 6.5]]), ans = (d2 / d1) ** 2;
        return {
          prompt: t`${n1[0].toUpperCase() + n1.slice(1)}’s primary mirror is $${d1}$ m across; ${n2}’s is $${d2}$ m. Light collected goes with mirror area. About how many times more light does ${n2} collect?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: d2 / d1, feedback: t`Light goes with *area*, and area goes as diameter squared.` }, { value: (d2 / d1) ** 3, feedback: t`A mirror is a surface, not a volume: the power is $2$.` }],
          hints: [t`$A \propto D^2$, so the ratio is $(D_2/D_1)^2$.`],
          teach: t`Areas scale as the square of lengths.`,
          explain: t`$\left(\dfrac{${d2}}{${d1}}\right)^2 = ${nice(sig(ans, 3))}$. Real collecting areas differ a little, because mirrors are segmented, not round, and partly shadowed by their secondary mirrors.`,
          visual: discs(d1 / 2, d2 / 2, [n1, n2], t`The two mirrors as circles to scale (simplified to round, unobstructed discs).`),
        };
      },
    }),
    num({
      id: 'kleiber', difficulty: 2,
      gen(r) {
        const [a, ma, b, mb] = r.pick([['a 70 kg person', 70, 'a 4000 kg elephant', 4000], ['a 4 kg cat', 4, 'a 600 kg horse', 600], ['a 30 g mouse', 0.03, 'a 70 kg person', 70], ['a 20 kg dog', 20, 'a 3000 kg rhinoceros', 3000]]), ans = (mb / ma) ** 0.75;
        return {
          prompt: t`**Kleiber’s law**: across mammals, the resting metabolic rate (power used) scales roughly as $P \propto M^{3/4}$. How many times the metabolic rate of ${a} is that of ${b}?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: mb / ma, feedback: t`That assumes $P \propto M$. The exponent is $\tfrac34$: big animals burn less per kilogram.` }, { value: (mb / ma) ** (2 / 3), feedback: t`That uses $\tfrac23$, the “surface law” once proposed because heat escapes through the skin. Kleiber’s fitted exponent is $\tfrac34$.` }],
          hints: [t`$\dfrac{P_2}{P_1} = \left(\dfrac{M_2}{M_1}\right)^{3/4}$.`, t`The mass ratio is $${nice(sig(mb / ma, 4))}$.`],
          teach: t`A power law turns a mass ratio into a rate ratio: raise it to the exponent.`,
          explain: t`$\left(${nice(sig(mb / ma, 4))}\right)^{3/4} = ${nice(sig(ans, 3))}$: the bigger animal is $${nice(sig(mb / ma, 3))}$ times heavier but uses only about $${nice(sig(ans, 3))}$ times the power, so per kilogram it burns $${nice(sig((mb / ma) ** 0.25, 3))}$ times less. The exponent is an empirical fit; biologists still debate how close to $\tfrac34$ it really is.`,
          visual: { type: 'graph', params: { x: [-2.2, 4], y: [-1.5, 3.5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'body mass (kg)', ylabel: 'metabolic rate (W)', curves: [{ fn: '0.53 + 0.75*x', color: 'accent' }], points: [{ x: N(L10(0.02)), y: N(0.53 + 0.75 * L10(0.02)), color: 'gold', r: 5, label: 'mouse', labelDx: 8, labelDy: 10 }, { x: N(L10(500)), y: N(0.53 + 0.75 * L10(500)), color: 'gold', r: 5, label: 'horse', labelDx: 8, labelDy: 10 }] }, caption: t`Kleiber’s law on log–log axes: a straight line of slope $\tfrac34$. The constant ($3.4$ W at $1$ kg) is a typical fitted value; individual species scatter around the line.` },
        };
      },
    }),
    mcq({
      id: 'which-k3', difficulty: 1,
      prompt: t`Every length of a solid metal bracket is scaled up by a factor $k$. Which of these grows by $k^3$?`,
      choices: ['its mass', 'the area of its cross-section', 'its height', 'its surface area divided by its volume'],
      answer: 0,
      why: {
        1: t`A cross-section is an area: $k^2$.`,
        2: t`A height is a length: $k$.`,
        3: t`Surface ($k^2$) over volume ($k^3$) *shrinks*, as $1/k$.`,
      },
      hints: [t`Count the lengths multiplied together: area is two, volume three.`],
      teach: t`Lengths scale as $k$, areas as $k^2$, volumes and masses as $k^3$.`,
      explain: t`Mass is density times volume, and volume is three lengths multiplied, so it grows as $k^3$: twice as big in every direction is eight times as heavy.`,
      visual: { type: 'graph', params: { x: [0.8, 3.2], y: [0, 30], aspect: 'wide', xlabel: 'k', ylabel: 'factor', curves: [{ fn: 'x', color: 'ink3', label: 'k', labelAt: 3, labelDx: -12, labelDy: -10 }, { fn: 'x^2', color: 'accent', label: 'k²', labelAt: 3, labelDx: -14, labelDy: -10 }, { fn: 'x^3', color: 'gold', label: 'k³', labelAt: 3, labelDx: -24, labelDy: 2 }] }, caption: t`$k$, $k^2$ and $k^3$ for scale factors from $1$ to $3$.` },
    }),
    num({
      id: 'galileo', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 5, 10]);
        return {
          prompt: t`Scale a land animal up by $${k}$ in every length, keeping its shape and density. Its weight rests on its leg bones. By what factor does the stress in the bones (weight per unit of cross-sectional area) change?`,
          answer: k, tol: { rel: 0.005 },
          errors: [{ value: k ** 3, feedback: t`The weight grows as $k^3$, but it is spread over a cross-section that grows as $k^2$.` }, { value: k * k, feedback: t`Stress is weight ÷ area: $k^3/k^2$.` }, { value: 1, feedback: t`Weight and area grow at different rates, so the stress cannot stay the same.` }],
          hints: [t`Weight $\propto$ volume $\propto k^3$; bone cross-section $\propto k^2$.`, t`Stress $=$ weight ÷ area, so its factor is $k^3 \div k^2$.`],
          teach: t`Stress = force ÷ area grows as $k^3/k^2 = k$: scaled-up bones are more heavily loaded.`,
          explain: t`$\dfrac{k^3}{k^2} = k = ${k}$: the bones carry $${k}$ times the stress. Galileo spotted this in 1638 — it is why big animals have disproportionately thick legs, and why a giant of human shape would break its own bones.`,
          visual: discs(0.5, 0.5 * k, ['leg bone', `×${k} animal`], t`Leg-bone cross-sections to scale: the larger animal’s bone is ${k} times as wide and ${k * k} times the area, but must carry ${k ** 3} times the weight.`),
        };
      },
    }),
    num({
      id: 'star', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 0.5]), b = r.pick([1.5, 2, 0.8]), ans = a * a * b ** 4;
        return {
          prompt: t`A star’s luminosity follows $L \propto R^2T^4$ (radius $R$, surface temperature $T$). A star has $${a}$ times the Sun’s radius and $${b}$ times its surface temperature. How many times the Sun’s luminosity is it?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: a * b ** 4, feedback: t`The radius is squared too: $L \propto R^2$.` }, { value: a * a * b * b, feedback: t`Temperature enters to the *fourth* power.` }, { value: 2 * a + 4 * b, feedback: t`Powers multiply the ratios: $(${a})^2(${b})^4$, not $2\times${a} + 4\times${b}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\dfrac{L}{L_\odot} = \left(\dfrac{R}{R_\odot}\right)^2\left(\dfrac{T}{T_\odot}\right)^4$.`, t`So the factor is $(${a})^2 \times (${b})^4$.`],
          teach: t`With several power-law factors, raise each ratio to its own power and multiply.`,
          explain: t`$(${a})^2 \times (${b})^4 = ${nice(a * a)} \times ${nice(b ** 4)} = ${nice(sig(ans, 4))}$. Because of the fourth power, temperature matters far more than size.`,
          visual: discs(0.6, 0.6 * a, ['the Sun', 'the star'], t`The two stars’ sizes to scale (colours are not their real colours).`, ['gold', b > 1 ? 'accent' : 'warn']),
        };
      },
    }),
    mcq({
      id: 'find-exponent', difficulty: 2,
      gen(r) {
        const [kx, ky, p] = r.pick([[5, 25, 2], [2, 8, 3], [9, 3, 0.5], [3, 9, 2], [2, 0.25, -2]]);
        return {
          prompt: t`For a quantity $y \propto x^{p}$, multiplying $x$ by $${kx}$ multiplies $y$ by $${nice(ky)}$. What is $p$?`,
          choices: [t`$${nice(p)}$`, t`$${nice(ky / kx)}$`, t`$${nice(1 / p)}$`, t`$${nice(-p)}$`],
          answer: 0,
          why: {
            1: t`Dividing the factors treats the law as linear. You need $${kx}^{p} = ${nice(ky)}$.`,
            2: t`That is upside down: it would give $x \propto y^{p}$.`,
            3: t`Check the direction: $y$ ${ky > 1 ? 'grows' : 'shrinks'} when $x$ grows, so $p$ is ${ky > 1 ? 'positive' : 'negative'}.`,
          },
          hints: [t`Solve $${kx}^{p} = ${nice(ky)}$; take logs if it is not obvious.`],
          teach: t`From one ratio pair, $p = \log(y_2/y_1)/\log(x_2/x_1)$.`,
          explain: t`$${kx}^{${nice(p)}} = ${nice(ky)}$, so $p = ${nice(p)}$.`,
          visual: { type: 'graph', params: { x: [0, kx + 0.6], y: [0, ky > 1 ? ky * 1.2 : 1.3], aspect: 'wide', xlabel: 'x', ylabel: 'y', points: [{ x: 1, y: 1, color: 'gold', r: 5 }, { x: kx, y: ky, color: 'gold', r: 5 }] }, caption: t`Two cases: $x = 1$ and $x = ${kx}$ (with $y$ in units of its value at $x = 1$).` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([2, 3, 4, 5]);
        return {
          prompt: t`Two rockets have the same shape and the same average density, but one is $${k}$ times longer. At the same speed in the same air, what is the ratio of the big rocket’s deceleration from drag to the small one’s?`,
          answer: 1 / k, tol: { rel: 0.005 },
          errors: [{ value: k, feedback: t`The big rocket feels more drag force, but carries much more mass: divide $k^2$ by $k^3$.` }, { value: 1 / (k * k), feedback: t`Drag grows as the frontal area, $k^2$; it is not constant.` }, { value: k * k, feedback: t`That is the ratio of drag *forces*. Deceleration is force ÷ mass, and the mass grows as $k^3$.` }],
          hints: [t`Drag $\propto$ area $\propto k^2$; mass $\propto k^3$.`, t`Deceleration $=$ drag ÷ mass.`],
          teach: t`Drag deceleration scales as area over volume: $1/k$ for a $k$-times-bigger rocket.`,
          explain: t`$\dfrac{k^2}{k^3} = \dfrac1k = \dfrac1{${k}}$: the larger rocket is slowed $${k}$ times less, so it loses less of its $\Delta v$ to the air.`,
          visual: rocketsPic(k, t`Two geometrically similar rockets, one ${k} times longer. Outlines only.`),
        };
      },
    }),
    num({
      id: 'cp-solar', difficulty: 2, transfer: true,
      gen(r) {
        const [name, d] = r.pick([['Mars', 1.524], ['Jupiter', 5.203], ['Ceres', 2.77], ['Saturn', 9.537]]), P = r.pick([8, 14, 20]), ans = P / (d * d);
        return {
          prompt: t`A spacecraft’s solar arrays give $${P}$ kW in sunlight near Earth ($1$ AU from the Sun). Sunlight follows an inverse-square law. About how much will they give at ${name}, $${d}$ AU from the Sun (ignoring ageing and temperature)?`,
          answer: ans, units: 'kW', tol: { rel: 0.01 },
          errors: [{ value: P / d, feedback: t`Sunlight spreads over a sphere’s area, which grows as $d^2$: divide by $d^2$.` }, { value: P * d * d, feedback: t`Farther from the Sun means *less* power.` }],
          hints: [t`$\dfrac{P_2}{P_1} = \left(\dfrac{1\ \text{AU}}{d}\right)^2$.`],
          teach: t`Light from a point source falls as $1/d^2$, because it spreads over a sphere of area $4\pi d^2$.`,
          explain: t`$${P}/${d}^2 = ${nice(sig(ans, 3))}$ kW.${name === 'Jupiter' ? ' The Juno spacecraft, the first solar-powered mission to Jupiter, needed huge arrays for this reason.' : ''}${name === 'Saturn' ? ' That is why every mission to Saturn so far has carried radioisotope power instead.' : ''}`,
          visual: logLadder({ items: [{ v: 0.387, label: 'Mercury' }, { v: 1, label: 'Earth', color: 'accent' }, { v: 1.524, label: 'Mars' }, { v: 2.77, label: 'Ceres' }, { v: 5.203, label: 'Jupiter' }, { v: 9.537, label: 'Saturn' }], x: [-0.6, 1.2], xlabel: 'distance from the Sun (AU)', caption: t`Distances from the Sun on a logarithmic scale.` }),
        };
      },
    }),
    mcq({
      id: 'cp-combined', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3]), b = r.pick([2, 3]), ans = (a * a) * b;
        return {
          prompt: t`A quantity follows $Q \propto x^2/z$. If $x$ is multiplied by $${a}$ and $z$ is divided by $${b}$, what happens to $Q$?`,
          choices: [t`multiplied by $${ans}$`, t`multiplied by $${nice((a * a) / b)}$`, t`multiplied by $${a * b}$`, t`multiplied by $${a * a + b}$`],
          answer: 0,
          why: {
            1: t`Dividing $z$ by $${b}$ divides the *denominator*, which multiplies $Q$ by $${b}$.`,
            2: t`$x$ is squared: its factor $${a}$ becomes $${a * a}$.`,
            3: t`The factors multiply, they do not add.`,
          },
          hints: [t`New $Q$: $\dfrac{(${a}x)^2}{z/${b}}$.`],
          teach: t`Apply each factor to its own power, and remember that dividing a denominator multiplies the result.`,
          explain: t`$\dfrac{(${a}x)^2}{z/${b}} = ${a * a}\times${b}\times\dfrac{x^2}{z}$: $Q$ grows by $${ans}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Galileo Galilei, Two New Sciences (1638), the second day (the strength of scaled beams and bones)', url: 'https://oll.libertyfund.org/titles/galilei-dialogues-concerning-two-new-sciences' },
    { label: 'M. Kleiber (1932), Body size and metabolism, Hilgardia 6, 315', url: 'https://doi.org/10.3733/hilg.v06n11p315' },
    { label: 'NASA Planetary Fact Sheet (distances from the Sun)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
