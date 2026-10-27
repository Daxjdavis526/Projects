// Rocket propulsion: momentum conservation, applied to a vehicle that throws
// its own mass overboard, gives Tsiolkovsky's rocket equation.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { G, G0, rocketSide } from './_momentum.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const comma = (x) => x.toLocaleString('en-US');
// the same inside math, where a bare comma would be spaced as punctuation
const cm = (x) => comma(x).replace(/,/g, '{,}');
const r4 = (x) => +x.toFixed(4);

// ideal Δv (km/s) against mass ratio for one exhaust speed (km/s)
const dvCurve = (ve, R, caption) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [1, R], y: [0, r4(ve * Math.log(R) * 1.15)], xlabel: 'mass ratio (full ÷ burnt out)', ylabel: 'Δv (km/s)',
    curves: [{ fn: `${r4(ve)}*ln(x)`, domain: [1, R], color: 'accent' }],
  },
  caption,
});

// the mass ratio a given Δv demands, for one specific impulse: an exponential
const ratioCurve = (Isp, dvMax, caption, marks = []) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [0, dvMax], y: [0, r4(Math.exp(dvMax / ((Isp * G0) / 1000)) * 1.1)], xlabel: 'Δv (km/s)', ylabel: 'mass ratio (full ÷ burnt out)',
    curves: [{ fn: `exp(x/${r4((Isp * G0) / 1000)})`, domain: [0, dvMax], color: 'accent' }],
    vlines: marks,
  },
  caption,
});

// a launcher's mass budget as one stacked column, bottom to top: [{ m (t), label, color }].
// Labels sit beside their segments, pushed apart (with leader lines) where segments are thin.
function massStack(parts, caption) {
  const total = parts.reduce((s, p) => s + p.m, 0), gap = 0.085 * total;
  let y = 0, prev = -Infinity;
  const shade = [], points = [], curves = [];
  const rows = parts.map((p) => { const mid = y + p.m / 2; y += p.m; return { ...p, mid, top: y }; });
  rows.forEach((p) => { p.ly = Math.max(p.mid, prev + gap); prev = p.ly; });
  const over = Math.max(0, prev - total * 1.02);
  rows.forEach((p) => { p.ly = Math.max(p.mid - 0.5 * gap, p.ly - over); });
  rows.forEach((p) => {
    shade.push({ fn: String(r4(p.top)), lower: String(r4(p.top - p.m)), from: 0, to: 1, color: p.color, alpha: 0.6 });
    curves.push({ param: [`1 + 0.1*t`, `${r4(p.mid)} + t*${r4(p.ly - p.mid)}`], t: [0, 1], color: p.color, width: 1 });
    points.push({ x: 1.12, y: r4(p.ly), r: 0.01, color: p.color, label: `${p.label}: ${nice(p.m)} t` });
  });
  return {
    type: 'graph',
    params: { aspect: 'wide', x: [-0.2, 3.2], y: [0, r4(Math.max(total, prev) * 1.06)], xlabel: '', ylabel: 'mass (t)', xticks: 0.001, shade, points, curves },
    caption,
  };
}

export default lesson({
  id: 'phys2210.M9.6',
  title: 'Rocket propulsion: the rocket equation',
  minutes: 14, difficulty: 3,
  intro: t`A rocket accelerates by throwing its own mass backward. **Nothing outside is needed** — no air to push on, no ground: the engine pushes the exhaust back, the exhaust pushes the engine forward, and the total momentum of rocket plus exhaust never changes. Applying momentum conservation to each sliver of exhaust and adding up gives Tsiolkovsky’s rocket equation (1903):

$$\Delta v = v_e \ln\frac{m_0}{m_f}$$

The engine’s **thrust** is $F = \dot m\,v_e$, and engineers quote the exhaust speed as a **specific impulse**, $I_\text{sp} = v_e/g_0$, in seconds. The logarithm is merciless: each extra kilometre per second of $\Delta v$ *multiplies* the mass you must start with.`,
  symbols: [
    { tex: '\\Delta v', text: 'the change in the rocket’s speed from the burn, in m/s — in empty space, with no gravity or drag (the **ideal** $\\Delta v$)' },
    { tex: 'v_e', text: 'the effective exhaust speed, relative to the rocket, in m/s: about 2.5–3.5 km/s for kerosene or solid fuel, 4.4–4.6 km/s for hydrogen' },
    { tex: 'm_0', text: 'the initial mass: everything on board when the burn starts — propellant, tanks, engines, upper stages and payload — in kg' },
    { tex: 'm_f', text: 'the final mass, when the propellant is used up; $m_0/m_f$ is the **mass ratio**' },
    { tex: '\\ln', text: 'the natural logarithm' },
    { tex: 'I_\\text{sp} = v_e/g_0', text: 'specific impulse, in seconds, with $g_0 = 9.80665$ m/s²: the Merlin 1D of a Falcon 9 manages about 282 s at sea level and 311 s in vacuum; a hydrogen-burning RL10 about 465 s' },
    { tex: 'F = \\dot m\\,v_e', text: 'thrust, in N: propellant mass flow $\\dot m$ (kg/s) times exhaust speed' },
  ],
  why: 'The rocket equation decides what every launcher, upper stage and interplanetary probe can do — and why rockets have stages, why upper stages burn hydrogen, and why ion engines can do what chemistry cannot.',
  visual: {
    type: 'graph',
    title: 'The tyranny of the rocket equation',
    lead: t`The curves give the **mass ratio** $m_0/m_f = e^{\Delta v/v_e}$ an ideal single-stage rocket needs for each $\Delta v$. The blue curve is your engine; set its specific impulse, and slide the $\Delta v$ you need. Dashed: a Falcon 9 Merlin at sea level and a hydrogen-burning RL10.`,
    tasks: [
      t`Set $I_\text{sp} = 311$ s (a Merlin in vacuum) and $\Delta v = 9.4$ km/s, about what reaching low Earth orbit costs: the mass ratio is about 22. The rocket must be 95% propellant, leaving under 5% for tanks, engines and payload together — which is why rockets have stages.`,
      t`Add 1 km/s to $\Delta v$, at any $I_\text{sp}$: the mass ratio does not grow by a fixed amount — it is multiplied, by $e^{(1\ \text{km/s})/v_e}$, about 1.39 at 311 s.`,
      t`Raise $I_\text{sp}$ to 465 s: the same 9.4 km/s now needs a mass ratio under 8. Exhaust speed is worth more than almost anything.`,
    ],
    params: {
      aspect: 'wide', x: [0, 12], y: [0, 30], xlabel: 'Δv (km/s)', ylabel: 'mass ratio (full ÷ burnt out)',
      sliders: [
        { key: 'Isp', label: 'Specific impulse $I_\\text{sp}$', min: 200, max: 470, step: 1, value: 311, unit: '\\mathrm{s}', explain: 'Solid motors about 250–290 s; kerosene–oxygen about 280–350 s; hydrogen–oxygen about 450–465 s.' },
        { key: 'dv', label: 'The $\\Delta v$ you need', min: 0.5, max: 12, step: 0.1, value: 9.4, unit: '\\mathrm{km/s}', explain: 'Low Earth orbit costs about 9.3–9.5 km/s from the ground, losses included.' },
      ],
      curves: [
        { fn: 'exp(x/(282*0.00980665))', color: 'warn', width: 1.8, dash: true, label: 'Merlin, sea level (282 s)', labelAt: 7.6, labelDx: -164, labelDy: -6 },
        { fn: 'exp(x/(465*0.00980665))', color: 'good', width: 1.8, dash: true, label: 'RL10 (465 s)', labelAt: 12, labelDx: -80, labelDy: 55 },
        { fn: 'exp(x/(Isp*0.00980665))', color: 'accent' },
      ],
      vlines: [{ x: 'dv', color: 'gold' }],
      points: [{ x: 'dv', y: 'exp(dv/(Isp*0.00980665))', color: 'gold', r: 5 }],
      readouts: [
        { label: '$v_e = I_\\text{sp}\\,g_0$', expr: 'Isp*9.80665', unit: '\\mathrm{m/s}', digits: 4 },
        { label: 'mass ratio $m_0/m_f$', expr: 'exp(dv/(Isp*0.00980665))', digits: 3 },
        { label: 'propellant share of $m_0$', expr: '100*(1 - exp(-dv/(Isp*0.00980665)))', unit: '\\%', digits: 3 },
        { label: 'left for structure + payload', expr: '100*exp(-dv/(Isp*0.00980665))', unit: '\\%', digits: 3 },
      ],
    },
    caption: t`The ideal rocket equation: one stage, constant exhaust speed, no gravity and no air. Orbital speed in low orbit is 7.8 km/s, yet a launch needs about 9.4 km/s, because gravity losses (about 1–1.5 km/s), air drag and steering take their share; launching eastward gains up to 0.46 km/s from Earth’s spin.`,
  },
  example: {
    prompt: t`Derive the rocket equation from momentum conservation. Then estimate the ideal $\Delta v$ that the Saturn V’s first stage, the S-IC, gave the whole vehicle: about 2,950 t at lift-off, of which the S-IC burned about 2,160 t of kerosene and oxygen. Its five F-1 engines had $I_\text{sp} \approx 263$ s at sea level and 304 s in vacuum; take an average of 285 s.`,
    visual: massStack([
      { m: 2160, label: 'S-IC propellant', color: 'warn' },
      { m: 130, label: 'S-IC empty', color: 'ink3' },
      { m: 660, label: 'upper stages and spacecraft', color: 'accent' },
    ], t`The Saturn V’s mass at lift-off, roughly. Only the S-IC’s propellant is burned in the first-stage burn: everything else is $m_f$.`),
    steps: [
      { label: 'Set up', text: t`In an inertial frame, with no gravity or drag: at time $t$ the rocket has mass $m$ and velocity $v$. In the next instant $dt$ it ejects a sliver of exhaust of mass $dm_e$ backward, at speed $v_e$ **relative to the rocket** — at velocity $v - v_e$.` },
      { label: 'Conserve momentum', text: t`Before: $mv$. After: $(m - dm_e)(v + dv) + dm_e(v - v_e)$. Setting them equal and dropping the tiny product $dm_e\,dv$: $\;m\,dv = v_e\,dm_e$.` },
      { label: 'Track the mass', text: t`The rocket loses what it ejects, $dm = -dm_e$, so $dv = -v_e\,\dfrac{dm}{m}$.` },
      { label: 'Integrate', text: t`$\Delta v = -v_e\displaystyle\int_{m_0}^{m_f}\frac{dm}{m} = v_e\ln\frac{m_0}{m_f}$. The force never appears: only the exhaust speed and the mass ratio matter.` },
      { label: 'Saturn V numbers', text: t`$v_e = 285\times9.81 \approx 2{,}790$ m/s; $m_f = 2{,}950 - 2{,}160 = 790$ t, so $m_0/m_f = 3.73$ and $\Delta v = 2{,}790\ln 3.73 \approx 3.7$ km/s.` },
      { label: 'What it leaves out', text: t`The real stage gave less. It burned for about 2½ minutes while climbing steeply, and gravity alone takes away up to $g\,t \approx 9.8\times168 \approx 1.6$ km/s from a vertical climb; air drag took more. Note also that $m_0$ and $m_f$ include the 660 t of upper stages riding on top — dead weight for this burn.` },
    ],
    answer: t`$\Delta v_\text{ideal} \approx 3.7$ km/s; the real first-stage burn delivered noticeably less, mainly because of gravity loss.`,
  },
  practice: [
    num({
      id: 'centaur', difficulty: 1,
      gen(r) {
        const P = r.pick([1.5, 2, 3, 4, 6]), Isp = 450, ve = Isp * G0;
        const m0 = 20.8 + 2.3 + P, mf = 2.3 + P, dv = (ve * Math.log(m0 / mf)) / 1000;
        return {
          prompt: t`A Centaur-class upper stage carries about 20.8 t of liquid hydrogen and oxygen; empty, it weighs about 2.3 t. Its RL10 engine has $I_\text{sp} = 450$ s. What ideal $\Delta v$ can it give a ${P} t spacecraft?`,
          answer: dv, units: 'km/s', tol: { rel: 0.01 },
          errors: [
            { value: (ve * (m0 / mf)) / 1000, feedback: t`The rocket equation has a logarithm: $\Delta v = v_e\ln(m_0/m_f)$, not $v_e \times (m_0/m_f)$.` },
            { value: (Isp * Math.log(m0 / mf)) / 1000, feedback: t`Convert the specific impulse to an exhaust speed first: $v_e = I_\text{sp}\,g_0 = 450 \times 9.81$ m/s.` },
            { value: (ve * Math.log(m0 / 2.3)) / 1000, feedback: t`The spacecraft rides along for the whole burn: it belongs in both $m_0$ and $m_f$.` },
          ],
          hints: [t`$v_e = I_\text{sp}\,g_0$. $m_0$ is everything at the start: propellant + empty stage + spacecraft.`, t`$m_f$ = empty stage + spacecraft. Then $\Delta v = v_e\ln(m_0/m_f)$.`],
          teach: t`The ideal $\Delta v$ of a stage is $v_e\ln(m_0/m_f)$, with the payload counted in both masses.`,
          explain: t`$v_e = 450\times9.80665 = 4{,}413$ m/s; $m_0/m_f = ${nice(m0)}/${nice(mf)} = ${s3(m0 / mf)}$; $\Delta v = 4{,}413\ln${s3(m0 / mf)} = ${s3(dv)}$ km/s. A heavier payload lowers the mass ratio — and the Δv.`,
          visual: dvCurve((Isp * G0) / 1000, 12, t`Ideal $\Delta v$ against mass ratio at $I_\text{sp} = 450$ s: the curve flattens — each extra unit of mass ratio buys less.`),
        };
      },
    }),
    mcq({
      id: 'push-air', difficulty: 1,
      prompt: 'How does a rocket accelerate in the vacuum of space?',
      choices: [
        'The engine pushes exhaust backward, and the exhaust pushes the rocket forward',
        'It pushes against the air behind it, so it accelerates best low in the atmosphere',
        'It cannot: once out of the atmosphere it only coasts',
        'The hot gas pushes against the launch pad and, later, against Earth’s gravity',
      ],
      answer: 0,
      why: {
        1: 'Rockets work better in vacuum, not worse: the surrounding air pushes back on the exhaust and lowers the thrust. Thrust comes from the exhaust itself.',
        2: 'Rocket engines fire in space all the time — for orbit insertion, course corrections, landings on the Moon.',
        3: 'The pad only holds the rocket before launch, and gravity pulls the rocket down. The forward push comes from the exhaust, by Newton’s third law.',
      },
      hints: ['Choose the system “rocket + exhaust”. Is there any outside force needed?', 'Newton’s third law: the engine pushes the gas back, so the gas pushes the engine…'],
      teach: 'A rocket pushes on its own exhaust, not on the air: momentum conservation for rocket plus exhaust is all it needs.',
      explain: 'Rocket plus exhaust is an isolated system: as the exhaust gains backward momentum, the rocket gains equal forward momentum. Air only gets in the way — a Merlin gives about 10% more thrust in vacuum than at sea level.',
      visual: rocketSide(),
    }),
    num({
      id: 'mass-ratio', difficulty: 2,
      gen(r) {
        const Isp = r.pick([280, 311, 340, 450]), dv = r.pick([1.5, 2, 3, 4.5]);
        const ve = (Isp * G0) / 1000, R = Math.exp(dv / ve);
        return {
          prompt: t`A spacecraft must change its speed by ${dv} km/s using an engine with $I_\text{sp} = ${Isp}$ s. What mass ratio $m_0/m_f$ does it need (ideal rocket equation)?`,
          answer: R, tol: { rel: 0.01 },
          errors: [
            { value: dv / ve, feedback: t`That is $\ln(m_0/m_f)$. Undo the logarithm: $m_0/m_f = e^{\Delta v/v_e}$.` },
            { value: Math.exp(ve / dv), feedback: 'The fraction is upside down: the exponent is Δv/vₑ.' },
          ],
          hints: [t`Invert the rocket equation: $\dfrac{m_0}{m_f} = e^{\Delta v/v_e}$.`, t`$v_e = ${Isp}\times9.81 = ${Math.round(ve * 1000)}$ m/s — keep $\Delta v$ in the same units.`],
          teach: t`The mass ratio a burn needs grows exponentially with its $\Delta v$: $m_0/m_f = e^{\Delta v/v_e}$.`,
          explain: t`$v_e = ${s3(ve)}$ km/s, so $m_0/m_f = e^{${dv}/${s3(ve)}} = ${s3(R)}$: ${s3(100 * (1 - 1 / R))}% of the starting mass must be propellant.`,
          visual: ratioCurve(Isp, 6, t`The mass ratio needed against $\Delta v$, for $I_\text{sp} = ${Isp}$ s.`),
        };
      },
    }),
    num({
      id: 'flow', difficulty: 2,
      gen(r) {
        const [name, F, Isp, where] = r.pick([['an F-1 (Saturn V first stage)', 6770, 263, 'at sea level'], ['a Merlin 1D (Falcon 9 first stage)', 845, 282, 'at sea level'], ['an RL10B-2 (upper stage)', 110, 465, 'in vacuum']]);
        const mdot = (F * 1000) / (Isp * G0);
        return {
          prompt: t`${name.charAt(0).toUpperCase() + name.slice(1)} produces about ${comma(F)} kN of thrust ${where}, with $I_\text{sp} \approx ${Isp}$ s. How much propellant does it burn each second?`,
          answer: mdot, units: 'kg/s', tol: { rel: 0.01 },
          errors: [
            { value: (F * 1000) / Isp, feedback: t`Specific impulse in seconds must be turned into an exhaust speed: $v_e = I_\text{sp}\,g_0$.` },
            { value: (F * 1000 * Isp * G0) / 1e6, feedback: 'Thrust = ṁ vₑ, so ṁ = F / vₑ: divide, don’t multiply.' },
          ],
          hints: [t`Thrust $F = \dot m\,v_e$, with $v_e = I_\text{sp}\,g_0$.`, t`$\dot m = \dfrac{F}{I_\text{sp}\,g_0}$ — thrust in newtons.`],
          teach: t`Thrust is mass flow times exhaust speed, so the propellant flow is $F/(I_\text{sp}\,g_0)$.`,
          explain: t`$\dot m = \dfrac{${cm(F * 1000)}\ \text{N}}{${Isp}\times9.80665\ \text{m/s}} = ${s3(mdot)}$ kg/s.${Isp === 263 ? ' Five of them burned about 13 tonnes of kerosene and oxygen every second.' : Isp === 282 ? ' Nine of them drain a Falcon 9 first stage in about two and a half minutes.' : ' A gentle flow — upper-stage engines trade thrust for efficiency.'}`,
          visual: rocketSide({ caption: 'A sketch: each second the engine throws ṁ kilograms of gas backward at vₑ — that momentum flow is the thrust.' }),
        };
      },
    }),
    mcq({
      id: 'double', difficulty: 2,
      prompt: t`A stage needs a mass ratio of 4 to reach a certain $\Delta v$. With the same engine, what mass ratio would twice that $\Delta v$ need?`,
      choices: ['16', '8', '6', '4e ≈ 10.9'],
      answer: 0,
      why: {
        1: t`The mass ratio is $e^{\Delta v/v_e}$: doubling $\Delta v$ squares it, it does not double it.`,
        2: 'There is no fixed amount added per km/s: the growth is multiplicative.',
        3: t`$e^{2x} = (e^x)^2$, not $e\cdot e^x$.`,
      },
      hints: [t`$m_0/m_f = e^{\Delta v/v_e}$. What happens to an exponential when its exponent doubles?`, t`$e^{2x} = (e^{x})^2$.`],
      teach: 'Because the mass ratio is exponential in Δv, doubling Δv squares the mass ratio.',
      explain: t`$e^{2\Delta v/v_e} = \left(e^{\Delta v/v_e}\right)^2 = 4^2 = 16$. A single stage that is 75% propellant would have to be about 94% propellant to double its $\Delta v$ — beyond what tanks and engines can be built to allow.`,
      visual: ratioCurve(311, 6, t`The mass ratio needed against $\Delta v$ ($I_\text{sp} = 311$ s). The dashed lines mark a $\Delta v$ and twice it.`, [{ x: r4(((311 * G0) / 1000) * Math.log(4)), label: 'Δv', color: 'gold' }, { x: r4(((311 * G0) / 1000) * Math.log(16)), label: '2Δv', color: 'gold' }]),
    }),
    num({
      id: 'staging', difficulty: 3,
      gen(r) {
        const pay = r.pick([0.5, 1]), p2 = r.pick([6, 8, 10]), d2 = 1, p1 = r.pick([50, 60, 70]), d1 = r.pick([4, 5, 6]);
        const v1 = 300 * G0, v2 = 340 * G0, m0 = pay + p2 + d2 + p1 + d1;
        const dv1 = v1 * Math.log(m0 / (m0 - p1)), dv2 = v2 * Math.log((pay + p2 + d2) / (pay + d2)), dv = (dv1 + dv2) / 1000;
        const keep = v2 * Math.log((m0 - p1) / (m0 - p1 - p2));
        return {
          prompt: t`A small launcher has a first stage of ${p1} t of propellant and ${d1} t empty ($I_\text{sp}$ 300 s), a second stage of ${p2} t of propellant and ${d2} t empty ($I_\text{sp}$ 340 s), and a ${pay} t payload. The first stage is dropped when empty. What is the total ideal $\Delta v$?`,
          answer: dv, units: 'km/s', tol: { rel: 0.01 },
          errors: [
            { value: dv1 / 1000, feedback: 'That is only the first stage’s Δv. Add the second stage’s burn.' },
            { value: (dv1 + keep) / 1000, feedback: t`Drop the empty first stage before the second burn: its mass is not part of the second stage’s $m_0$ or $m_f$.` },
            { value: (v1 * Math.log(m0 / (m0 - p1 - p2))) / 1000, feedback: 'That treats the launcher as a single stage. Staging adds a burn for each stage, each with its own mass ratio.' },
          ],
          hints: ['Apply the rocket equation to each burn separately, then add the two Δv’s.', t`Burn 1: $m_0$ is everything; $m_f$ is everything minus the first stage’s propellant.`, t`Burn 2 starts after the empty first stage is dropped: $m_0 = ${nice(pay + p2 + d2)}$ t and $m_f = ${nice(pay + d2)}$ t.`],
          teach: 'With staging, each burn has its own mass ratio, and dropping empty tanks makes the later ratios large.',
          explain: t`Burn 1: $\Delta v_1 = 2{,}942\ln\dfrac{${nice(m0)}}{${nice(m0 - p1)}} = ${s3(dv1 / 1000)}$ km/s. Burn 2: $\Delta v_2 = 3{,}334\ln\dfrac{${nice(pay + p2 + d2)}}{${nice(pay + d2)}} = ${s3(dv2 / 1000)}$ km/s. Total ${s3(dv)}$ km/s — against ${s3((v1 * Math.log(m0 / (m0 - p1 - p2))) / 1000)} km/s for the same masses as a single stage at 300 s.`,
          visual: massStack([
            { m: p1, label: 'stage 1 propellant', color: 'warn' }, { m: d1, label: 'stage 1 empty', color: 'ink3' },
            { m: p2, label: 'stage 2 propellant', color: 'accent' }, { m: d2, label: 'stage 2 empty', color: 'ink2' }, { m: pay, label: 'payload', color: 'good' },
          ], 'The launcher’s mass budget at lift-off, bottom to top. The payload is the sliver on top.'),
        };
      },
    }),
    num({
      id: 'gravity-loss', difficulty: 3,
      gen(r) {
        const Isp = r.pick([230, 250]), m0 = r.pick([500, 800]), frac = r.pick([0.5, 0.6]), tb = r.pick([20, 30, 40]);
        const ve = Isp * G0, mf = m0 * (1 - frac), ideal = ve * Math.log(m0 / mf), real = ideal - G * tb;
        const mdot = (m0 - mf) / tb;
        return {
          prompt: t`A ${m0} kg sounding rocket, ${frac * 100}% propellant, fires straight up. Its solid motor ($I_\text{sp} = ${Isp}$ s) burns for ${tb} s. Ignoring air drag but not gravity, how fast is it climbing at burnout? (Take $g = 9.8\ \text{m/s}^2$ throughout.)`,
          answer: real, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: ideal, feedback: t`That is the ideal $\Delta v$. Gravity pulls down for the whole burn and takes $g\,t_b$ of it away.` },
            { value: ideal - 0.5 * G * tb, feedback: t`Gravity’s toll is the full $g\,t_b$: it acts at full strength for the whole burn.` },
          ],
          hints: [t`Newton for the rocket: $m\dfrac{dv}{dt} = \dot m v_e - mg$. Integrate over the burn.`, t`The thrust term gives the ideal $v_e\ln(m_0/m_f)$; the gravity term gives $-g\,t_b$.`, t`$v_b = v_e\ln\dfrac{m_0}{m_f} - g\,t_b$.`],
          teach: t`Fired straight up, a rocket loses $g\,t_b$ of its ideal $\Delta v$ to gravity: a longer burn loses more.`,
          explain: t`Ideal: $${s3(ve)}\ln\dfrac{${m0}}{${nice(mf)}} = ${s3(ideal)}$ m/s. Gravity loss: $9.8\times${tb} = ${nice(G * tb)}$ m/s. So $v_b = ${s3(real)}$ m/s — ${s3((100 * G * tb) / ideal)}% lost to gravity. This is why launchers want high thrust early, and pitch over as soon as they can.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, tb * 1.08], y: [0, r4(ideal * 1.12)], xlabel: 't (s)', ylabel: 'speed', yticks: 0.001,
              curves: [
                { fn: `${r4(ve)}*ln(${m0}/(${m0} - ${r4(mdot)}*x))`, domain: [0, tb], color: 'ink3', width: 2, dash: true, label: 'no gravity', labelAt: tb * 0.6, labelDx: -70, labelDy: -12 },
                { fn: `${r4(ve)}*ln(${m0}/(${m0} - ${r4(mdot)}*x)) - 9.8*x`, domain: [0, tb], color: 'accent', label: 'climbing against gravity', labelAt: tb * 0.75, labelDx: 6, labelDy: 14 },
              ],
            },
            caption: 'Speed during the burn (steady propellant flow, no drag). The gap between the curves is the gravity loss g·t; the vertical scale is left unnumbered.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ion', difficulty: 3, transfer: true,
      gen(r) {
        const m0 = r.pick([1000, 1200, 1500]), xe = r.pick([300, 400, 450]), Isp = r.pick([2500, 3000, 3100]);
        const dv = (Isp * G0 * Math.log(m0 / (m0 - xe))) / 1000;
        return {
          prompt: t`A deep-space probe of ${comma(m0)} kg carries ${xe} kg of xenon for an ion engine with $I_\text{sp} \approx ${cm(Isp)}$ s. What ideal $\Delta v$ can it reach by using all its xenon?`,
          answer: dv, units: 'km/s', tol: { rel: 0.01 },
          errors: [
            { value: (Isp * G0 * Math.log(m0 / xe)) / 1000, feedback: t`The final mass is the probe without its xenon: $m_f = m_0 - m_\text{xenon}$.` },
            { value: (Isp * Math.log(m0 / (m0 - xe))) / 1000, feedback: t`Convert specific impulse to exhaust speed: $v_e = I_\text{sp}\,g_0$.` },
          ],
          hints: [t`$v_e = I_\text{sp}\,g_0$ — about ten times a chemical rocket’s.`, t`$m_f = ${cm(m0)} - ${xe}$ kg.`],
          teach: t`$\Delta v$ grows in proportion to exhaust speed, so high-$I_\text{sp}$ electric engines reach a $\Delta v$ no chemical stage of the same mass can.`,
          explain: t`$v_e = ${cm(Isp)}\times9.81 = ${s3((Isp * G0) / 1000)}$ km/s; $\Delta v = ${s3((Isp * G0) / 1000)}\ln\dfrac{${cm(m0)}}{${cm(m0 - xe)}} = ${s3(dv)}$ km/s. A chemical engine at 320 s would manage only ${s3((320 * G0 * Math.log(m0 / (m0 - xe))) / 1000)} km/s with the same mass ratio. The catch: an ion engine’s thrust is a fraction of a newton, so the burn lasts years.`,
          visual: dvCurve((Isp * G0) / 1000, 2.2, t`Ideal $\Delta v$ against mass ratio at $I_\text{sp} = {}$${comma(Isp)} s. (A chemical engine’s curve would be about ten times lower.)`),
        };
      },
    }),
    multi({
      id: 'cp-leaves-out', difficulty: 2,
      prompt: t`Which of these does the ideal rocket equation, $\Delta v = v_e\ln(m_0/m_f)$, leave out? Select all that apply.`,
      choices: ['Gravity pulling on the rocket during the burn', 'Air drag', 'The mass of tanks and engines carried to burnout', 'The change of exhaust speed with altitude (lower at sea level)', 'The exhaust’s speed relative to the rocket'],
      answer: [0, 1, 3],
      why: {
        2: t`The empty tanks and engines are in $m_f$: they are exactly why $m_f$ cannot be made small — and why stages are dropped.`,
        4: t`That is $v_e$ itself, the heart of the equation.`,
      },
      hints: ['The equation came from momentum conservation for rocket + exhaust alone. Which forces from outside did that ignore?', t`It also took $v_e$ as a constant.`],
      teach: 'The ideal equation assumes no external forces and a constant exhaust speed: real launches lose Δv to gravity and drag, and engines lose efficiency in thick air.',
      explain: t`The derivation assumed no external force (so no gravity and no drag) and a constant exhaust speed. A launch from Earth loses roughly 1.5–2 km/s to gravity and drag, and a first-stage engine’s $I_\text{sp}$ rises by 10% or more as the air thins. The dry mass, on the other hand, is built in, as $m_f$.`,
      visual: rocketSide({ thrust: 'thrust', exhaust: null, caption: 'A sketch. In the ideal equation only the exhaust acts on the rocket.' }),
    }),
    mcq({
      id: 'cp-slow-fast', difficulty: 3,
      prompt: 'Far from any planet, two identical spacecraft burn identical loads of propellant through identical engines — one in 10 seconds, the other throttled down to burn for 10 minutes. Which ends up with the larger change in speed?',
      choices: ['Neither: their Δv is the same', 'The fast burner, because its thrust is larger', 'The slow burner, because its thrust acts for longer', 'The fast burner, because the slow one wastes propellant'],
      answer: 0,
      why: {
        1: t`The larger thrust acts for a shorter time: $\Delta v = v_e\ln(m_0/m_f)$ depends only on the exhaust speed and the mass ratio, not on the thrust.`,
        2: 'A longer time but a smaller thrust: the same total impulse, the same Δv.',
        3: 'With no gravity to fight, burning slowly wastes nothing. (Near a planet it does — a slow climb loses more to gravity.)',
      },
      hints: ['Look at the rocket equation: does the burn time or the thrust appear in it?', 'Same propellant, same exhaust speed, same masses before and after.'],
      teach: 'In free space Δv depends only on exhaust speed and mass ratio; thrust only sets how quickly you get it.',
      explain: t`$\Delta v = v_e\ln(m_0/m_f)$: same $v_e$, same masses, same $\Delta v$. Thrust matters when something else is pulling — near Earth a slow burn bleeds away $g\,t$ to gravity, which is why launchers need high thrust and deep-space probes can use gentle ion engines.`,
      visual: dvCurve(3, 5, 'Ideal Δv depends on the mass ratio alone (here vₑ = 3 km/s): burn time appears nowhere.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §9.7 Rocket propulsion', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-7-rocket-propulsion' },
    { label: 'NASA Glenn Research Center, Ideal rocket equation', url: 'https://www.grc.nasa.gov/www/k-12/rocket/rktpow.html' },
    { label: 'S-IC (Saturn V first stage) — masses and F-1 performance', url: 'https://en.wikipedia.org/wiki/S-IC' },
    { label: 'Merlin (rocket engine family) — Merlin 1D thrust and specific impulse', url: 'https://en.wikipedia.org/wiki/SpaceX_Merlin' },
    { label: 'RL10 — specific impulse of its versions', url: 'https://en.wikipedia.org/wiki/RL10' },
  ],
});
