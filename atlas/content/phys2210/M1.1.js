// SI units and prefixes: a quantity is a number times a unit, and prefixes are powers of ten.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { dualScale, areaGrid, pow10 } from './_measure.js';

const t = String.raw;
const LBF = 4.4482216152605;        // N in one pound-force, exact (0.45359237 kg × 9.80665 m/s²)
const PSI = 6894.757293168361;      // Pa in one psi
const FT = 0.3048;                  // m in one foot, exact
const MPH = 0.44704;                // m/s in one mile per hour, exact
const clean = (x) => +x.toPrecision(10);
/** A number in TeX scientific notation, trimmed: 2.5e-4 → 2.5\times10^{-4}. */
const sci = (x) => { const [m, e] = clean(x).toExponential().split('e'); return +e === 0 ? m : t`${m}\times10^{${+e}}`; };
const comma = (x) => x.toLocaleString('en-US');

// the powers-of-ten ladder for the Explore step (sizes in metres, typical and rounded)
const OBJECTS = [
  ['proton · 1.7 fm', 1.7e-15], ['hydrogen atom · 106 pm', 1.06e-10], ['flu virus · 100 nm', 1e-7],
  ['red blood cell · 8 μm', 8e-6], ['you · 1.7 m', 1.7], ['Saturn V · 111 m', 110.6], ['Everest · 8.85 km', 8849],
  ['Earth · 12.7 Mm across', 1.2742e7], ['Sun · 1.39 Gm across', 1.392e9], ['Earth to Sun · 150 Gm', 1.496e11],
  ['one light-year · 9.46 Pm', 9.461e15], ['Andromeda galaxy · 24 Zm away', 2.4e22], ['observable universe · about 880 Ym', 8.8e26],
];
const PREFIXES = [[-15, 'f', 'femto'], [-12, 'p', 'pico'], [-9, 'n', 'nano'], [-6, 'μ', 'micro'], [-3, 'm', 'milli'], [0, '', 'no prefix'],
  [3, 'k', 'kilo'], [6, 'M', 'mega'], [9, 'G', 'giga'], [12, 'T', 'tera'], [15, 'P', 'peta'], [18, 'E', 'exa'], [21, 'Z', 'zetta'],
  [24, 'Y', 'yotta'], [27, 'R', 'ronna']];

const ladder = {
  type: 'graph',
  title: 'From a proton to the observable universe',
  lead: t`Each dashed rung of this ladder is a factor of $1000$ — one prefix. Slide the gold band and read which objects fall inside it. The prefix that suits a size is the one whose band holds it, because then the number in front lies between 1 and 999.`,
  tasks: [
    'Slide to n = 6 (mega): Earth’s 12.7 Mm diameter sits in the band.',
    'Find the band that holds you and the Saturn V: it is the one with no prefix at all (n = 0).',
    'Count the rungs from a proton to the observable universe: about 14 of them, or 42 powers of ten.',
  ],
  params: {
    x: [0.1, 10], y: [-16.5, 28.5], xticks: 0.001, xlabel: ' ', ylabel: 'power of ten, in metres',
    alt: 'A vertical logarithmic ladder of lengths with SI prefixes and familiar objects',
    sliders: [{ key: 'n', label: 'Prefix power $n$', min: -15, max: 24, step: 3, value: 3, explain: t`The gold band runs from $10^n$ m up to $10^{n+3}$ m: the lengths this prefix writes as 1 to 999 (for $n = 3$, from 1 km to 999 km).` }],
    shade: [{ fn: 'n + 3', lower: 'n', from: 0.1, to: 10, color: 'gold', alpha: 0.16 }],
    curves: [
      ...PREFIXES.map(([p]) => ({ fn: String(p), domain: [0.1, 10], color: 'ink4', width: 1, dash: true })),
      { param: ['4.2', 't'], t: [-15.5, 27.5], color: 'ink3', width: 1 },
    ],
    points: [
      ...PREFIXES.map(([p, s, name]) => ({ x: 0.2, y: p, r: 0.01, color: 'ink2', label: p === 0 ? `1 · ${name}` : `${s} · ${name} · ${pow10(p)}` })),
      ...OBJECTS.map(([label, size]) => ({ x: 4.2, y: +Math.log10(size).toFixed(3), color: 'accent2', label })),
    ],
    readouts: [{ label: 'band starts at', expr: '10^n', unit: '\\mathrm{m}', digits: 1 }, { label: 'and ends at', expr: '10^(n + 3)', unit: '\\mathrm{m}', digits: 1 }],
  },
  caption: 'Logarithmic scale: each dashed rung is ×1000, and the solid line is 1 m. Read each object at its dot; its label sits just above. Sizes are typical, rounded values: diameters for the proton, atom, cell, Earth, Sun and observable universe; distances for Earth to Sun and to the Andromeda galaxy.',
  explain: t`**The prefixes you will use most:** pico (p) $10^{-12}$, nano (n) $10^{-9}$, micro (μ) $10^{-6}$, milli (m) $10^{-3}$, centi (c) $10^{-2}$, kilo (k) $10^{3}$, mega (M) $10^{6}$, giga (G) $10^{9}$, tera (T) $10^{12}$. Capitals are big (M, G, T) and lower case is small (m, μ, n, p) — except k. A prefix attaches to a unit, never to another prefix: write ns, not mμs. The kilogram is the odd one out: it is the base unit of mass, yet its name already holds a prefix, so 1 mg is $10^{-3}$ g $= 10^{-6}$ kg.`,
};

// a static ladder for the prefix-matching item: rungs carry only powers of ten
const ladderByPower = {
  type: 'graph',
  params: {
    x: [0.1, 10], y: [-16.5, 13.5], xticks: 0.001, xlabel: '', ylabel: 'power of ten, in metres',
    alt: 'A logarithmic ladder of lengths from a proton to the Sun',
    curves: [
      ...PREFIXES.filter(([p]) => p <= 12).map(([p]) => ({ fn: String(p), domain: [0.1, 10], color: 'ink4', width: 1, dash: true })),
      { param: ['4.2', 't'], t: [-15.5, 12.5], color: 'ink3', width: 1 },
    ],
    points: [
      ...PREFIXES.filter(([p]) => p <= 12).map(([p]) => ({ x: 0.2, y: p, r: 0.01, color: 'ink2', label: pow10(p) + ' m' })),
      ...OBJECTS.slice(0, 10).map(([label, size]) => ({ x: 4.2, y: +Math.log10(size).toFixed(3), color: 'accent2', label })),
    ],
  },
  caption: 'Logarithmic scale; each rung is a power of ten that is a multiple of 3. Every size is written with the prefix whose rung lies just below it. Labels sit just above their dots.',
};

export default lesson({
  id: 'phys2210.M1.1',
  title: 'SI units and prefixes',
  minutes: 9, difficulty: 1,
  intro: t`Every measured quantity is **a number times a unit**, and the unit is as much a part of the answer as the number. The International System of Units (SI) builds every unit from seven base units — the metre (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol) and candela (cd) — and stretches them across scales with **prefixes**, each a power of ten:

$$F = 4.5\ \mathrm{kN} = 4.5\times10^{3}\ \mathrm{N} = 4.5\times10^{3}\ \mathrm{kg\,m/s^2}$$

Getting this wrong has cost a spacecraft. In 1999 the Mars Climate Orbiter was lost because one program reported thruster impulses in pound-force seconds and another read the same numbers as newton-seconds.`,
  symbols: [
    { tex: 'F', text: 'the quantity itself — here a force, the thrust of a small rocket motor' },
    { tex: '4.5', text: 'the numerical value: it means nothing until a unit stands beside it' },
    { tex: '\\mathrm{k}', text: 'the prefix *kilo*, a factor of $10^3$: “4.5 kN” is shorthand for “4.5 × 1000 N”' },
    { tex: '\\mathrm{N}', text: 'the newton, the SI unit of force: the force that gives 1 kg an acceleration of 1 m/s²' },
    { tex: '\\mathrm{kg\\,m/s^2}', text: 'the newton written in base units — every derived unit (N, J, W, Pa) reduces to base units like this' },
  ],
  why: 'Every formula you meet from now on works only when its quantities carry consistent units — and checking units is the fastest way to catch an error.',
  visual: ladder,
  example: {
    prompt: t`An airliner cruises at 560 mph (miles per hour). What is that in metres per second? A mile is exactly 1609.344 m.`,
    visual: dualScale({ value: 560, perA: MPH, unitA: 'mph', unitB: 'm/s', stepA: 100, maxA: 700 }),
    steps: [
      { label: 'Factors of one', text: t`Since $1\ \text{mi} = 1609.344\ \text{m}$ and $1\ \text{h} = 3600\ \text{s}$, the ratios $\dfrac{1609.344\ \text{m}}{1\ \text{mi}}$ and $\dfrac{1\ \text{h}}{3600\ \text{s}}$ both equal **one**. Multiplying by one changes the number and the unit, never the speed.` },
      { label: 'Multiply and cancel', text: t`$$560\ \frac{\text{mi}}{\text{h}}\times\frac{1609.344\ \text{m}}{1\ \text{mi}}\times\frac{1\ \text{h}}{3600\ \text{s}} = ${sig(560 * MPH, 4)}\ \frac{\text{m}}{\text{s}}$$

Miles cancel miles and hours cancel hours, leaving m/s. Write the units in every line: if they do not cancel to the unit you want, a factor is upside down.` },
      { label: 'Sense check', text: t`A metre is much shorter than a mile, which raises the number; a second is much shorter than an hour, which lowers it. Net factor: $1609.344/3600 = 0.447$, so the m/s value should be a bit under half the mph value — and 250 is. As a check from another direction, ${Math.round(560 * MPH * 3.6)} km/h is a normal airliner cruise.` },
    ],
    answer: t`$560\ \text{mph} \approx 250\ \text{m/s}$ (about ${Math.round(560 * MPH * 3.6)} km/h).`,
  },
  practice: [
    match({
      id: 'prefix-powers', difficulty: 1,
      prompt: 'Match each prefix to the power of ten it stands for.',
      left: [t`$\mathrm{k}$ — kilo`, t`$\mathrm{M}$ — mega`, t`$\mathrm{G}$ — giga`, t`$\mathrm{m}$ — milli`, t`$\mu$ — micro`, t`$\mathrm{n}$ — nano`],
      right: ['10³', '10⁶', '10⁹', '10⁻³', '10⁻⁶', '10⁻⁹', '10⁻²', '10¹²'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: ['The prefixes climb in steps of three powers of ten: kilo, mega, giga going up; milli, micro, nano going down.', 'Capital M is a million (10⁶); lower-case m is a thousandth (10⁻³).'],
      teach: 'Each SI prefix is a fixed power of ten, mostly in steps of 10³ — and case matters: M is mega, m is milli.',
      explain: 'Up: k = 10³, M = 10⁶, G = 10⁹. Down: m = 10⁻³, μ = 10⁻⁶, n = 10⁻⁹. The two left over are centi (10⁻²) and tera (10¹²).',
      visual: ladderByPower,
    }),
    num({
      id: 'strip-prefix', difficulty: 1,
      gen(r) {
        const c = r.pick([
          { ctx: t`A load cell on the test stand reads $4.7\ \mathrm{kN}$.`, v: 4.7, p: 3, pt: 'k', u: 'N', word: 'newtons', pu: 'kN', step: 1 },
          { ctx: t`The combustion chamber runs at $6.9\ \mathrm{MPa}$.`, v: 6.9, p: 6, pt: 'M', u: 'Pa', word: 'pascals', pu: 'MPa', step: 1 },
          { ctx: t`A pressure sensor is sampled every $250\ \mu\mathrm{s}$.`, v: 250, p: -6, pt: '\\mu ', u: 's', word: 'seconds', pu: 'μs', step: 50 },
          { ctx: t`The throat of a small nozzle is $38\ \mathrm{mm}$ across.`, v: 38, p: -3, pt: 'm', u: 'm', word: 'metres', pu: 'mm', step: 10 },
          { ctx: t`A GPS signal takes about $67\ \mathrm{ms}$ to reach you from a satellite overhead.`, v: 67, p: -3, pt: 'm', u: 's', word: 'seconds', pu: 'ms', step: 10 },
          { ctx: t`Each F-1 engine of the Saturn V produced about $6.8\ \mathrm{MN}$ of thrust at liftoff.`, v: 6.8, p: 6, pt: 'M', u: 'N', word: 'newtons', pu: 'MN', step: 1 },
          { ctx: t`A spacecraft radio link runs at $2.2\ \mathrm{GHz}$.`, v: 2.2, p: 9, pt: 'G', u: 'Hz', word: 'hertz', pu: 'GHz', step: 0.5 },
        ]);
        const ans = clean(c.v * 10 ** c.p), wrong = clean(c.v * 10 ** -c.p);
        return {
          prompt: t`${c.ctx} Write this in ${c.word}, the unit with no prefix. (Scientific notation is fine: \`4.7e3\` means $4.7\times10^3$.)`,
          answer: ans, units: c.u, tol: { rel: 0.002 },
          errors: [{ value: wrong, feedback: c.p > 0 ? `You moved the decimal point the wrong way. A big prefix packs many ${c.word} into one unit, so removing it makes the number bigger.` : `You moved the decimal point the wrong way. A small prefix means a tiny fraction of a unit, so removing it makes the number smaller.` }],
          hints: [t`$\mathrm{${c.pt}}$ stands for $10^{${c.p}}$: replace the prefix by that factor.`],
          teach: t`To remove a prefix, replace it by its power of ten: $6.9\ \mathrm{MPa} = 6.9\times10^{6}\ \mathrm{Pa}$.`,
          explain: t`$${c.v}\ \mathrm{${c.pt}${c.u}} = ${c.v}\times10^{${c.p}}\ \mathrm{${c.u}}${c.v >= 1 && c.v < 10 ? '' : t` = ${sci(ans)}\ \mathrm{${c.u}}`}$.`,
          visual: dualScale({ value: c.v, perA: 10 ** c.p, unitA: c.pu, unitB: c.u, stepA: c.step }),
        };
      },
    }),
    num({
      id: 'kmh-to-ms', difficulty: 1,
      gen(r) {
        const fast = r.bool();
        const kmh = fast ? r.int(250, 300) : r.int(70, 160);
        const ctx = fast ? `An airliner lifts its nose off the runway at about ${kmh} km/h.` : `A small rocket leaves its launch rail at ${kmh} km/h.`;
        const v = kmh / 3.6;
        return {
          prompt: t`${ctx} What is that speed in metres per second, to 3 significant figures?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: kmh * 3.6, feedback: 'You multiplied by 3.6. One metre per second is 3.6 km/h, so a speed has a smaller number in m/s than in km/h: divide.' }],
          hints: [t`$1\ \text{km} = 1000\ \text{m}$ and $1\ \text{h} = 3600\ \text{s}$.`, t`Multiply by $\dfrac{1000\ \text{m}}{1\ \text{km}}$ and by $\dfrac{1\ \text{h}}{3600\ \text{s}}$; together that is dividing by 3.6.`],
          teach: 'Convert with factors of one, written so the unwanted units cancel: 1 m/s = 3.6 km/h.',
          explain: t`$${kmh}\ \dfrac{\text{km}}{\text{h}}\times\dfrac{1000\ \text{m}}{1\ \text{km}}\times\dfrac{1\ \text{h}}{3600\ \text{s}} = \dfrac{${kmh}}{3.6}\ \text{m/s} = ${sig(v, 3)}\ \text{m/s}$.`,
          visual: dualScale({ value: kmh, perA: 1 / 3.6, unitA: 'km/h', unitB: 'm/s', stepA: kmh > 200 ? 50 : 20 }),
        };
      },
    }),
    num({
      id: 'lbf-to-kn', difficulty: 2,
      gen(r) {
        const F = r.pick([1200, 2500, 3800, 5000, 7500, 15000, 22000]);
        const kN = (F * LBF) / 1000;
        const step = F >= 10000 ? 5000 : F >= 4000 ? 1000 : 500;
        return {
          prompt: t`A liquid-propellant engine on a test stand is rated at ${comma(F)} lbf (pounds-force) of thrust. What is its thrust in kilonewtons, to 3 significant figures? Use $1\ \text{lbf} = 4.448\ \text{N}$.`,
          answer: kN, units: 'kN', tol: { rel: 0.005 },
          errors: [
            { value: F / LBF / 1000, feedback: 'You divided by 4.448. A pound-force is bigger than a newton, so the thrust has a bigger number in newtons than in pounds-force.' },
            { value: F * LBF, feedback: 'That is the thrust in newtons. The answer box is in kilonewtons: divide by 1000.' },
          ],
          hints: ['First convert pounds-force to newtons, then newtons to kilonewtons.', t`$${comma(F)}\ \text{lbf}\times\dfrac{4.448\ \text{N}}{1\ \text{lbf}}\times\dfrac{1\ \text{kN}}{1000\ \text{N}}$.`],
          teach: 'A pound-force is about 4.45 newtons, so a thrust in newtons is about 4.45 times the number in pounds-force.',
          explain: t`$${comma(F)}\ \text{lbf}\times4.448\ \text{N/lbf} = ${comma(Math.round(F * LBF))}\ \text{N} = ${sig(kN, 3)}\ \text{kN}$.`,
          visual: dualScale({ value: F, perA: LBF / 1000, unitA: 'lbf', unitB: 'kN', stepA: step }),
        };
      },
    }),
    num({
      id: 'area-cm2', difficulty: 2,
      gen(r) {
        const A = r.pick([12, 18, 25, 48, 80, 150]);
        return {
          prompt: t`The throat of a small rocket nozzle has a cross-sectional area of $${A}\ \text{cm}^2$. What is that area in square metres?`,
          answer: A * 1e-4, units: 'm^2', tol: { rel: 0.002 },
          errors: [
            { value: A * 1e-2, feedback: t`You used $1\ \text{cm} = 10^{-2}\ \text{m}$ once, but an area holds two lengths: $1\ \text{cm}^2 = (10^{-2}\ \text{m})^2 = 10^{-4}\ \text{m}^2$.` },
            { value: A * 1e4, feedback: 'A square metre is much bigger than a square centimetre, so the area has a much smaller number in m².' },
          ],
          hints: [t`$1\ \text{cm} = 10^{-2}\ \text{m}$, and $\text{cm}^2$ means $\text{cm}\times\text{cm}$.`, t`So $1\ \text{cm}^2 = 10^{-2}\ \text{m}\times10^{-2}\ \text{m} = 10^{-4}\ \text{m}^2$.`],
          teach: 'Squared and cubed units convert with the square or cube of the length factor: 1 cm² = 10⁻⁴ m², 1 cm³ = 10⁻⁶ m³.',
          explain: t`$${A}\ \text{cm}^2 = ${A}\times(10^{-2}\ \text{m})^2 = ${A}\times10^{-4}\ \text{m}^2 = ${sci(A * 1e-4)}\ \text{m}^2$.`,
          visual: areaGrid(),
        };
      },
    }),
    mcq({
      id: 'mco-impulse', difficulty: 2,
      prompt: 'Mars Climate Orbiter’s ground software reported each small thruster impulse in pound-force seconds (lbf·s). The navigation software read those same numbers as newton-seconds (N·s). Since 1 lbf·s ≈ 4.45 N·s, how wrong were the impulses the navigators used?',
      choices: ['Too small, by a factor of about 4.45', 'Too large, by a factor of about 4.45', 'Too small, by a factor of about 2.2', 'Not wrong at all: an impulse is the same whatever unit it is written in'],
      answer: 0,
      why: {
        1: 'A pound-force is bigger than a newton, so any impulse has a smaller number in lbf·s than in N·s. Reading that smaller number as N·s understates the impulse.',
        2: '2.2 is the number of pounds (of mass) in a kilogram. A pound-force and a newton differ by a factor of 4.45.',
        3: 'The physical impulse is the same, but a number only describes it with the right unit attached. Drop the unit and “1 lbf·s” silently becomes 1 N·s — less than a quarter of the truth.',
      },
      hints: ['Which is bigger: 1 lbf or 1 N?', 'A firing of 1 lbf·s is really 4.45 N·s. If the software reads the “1” as 1 N·s, is the reading bigger or smaller than the truth?'],
      teach: 'A number means nothing without its unit: the same impulse is 1 lbf·s or 4.45 N·s.',
      visual: dualScale({ value: 1, perA: LBF, unitA: 'lbf·s', unitB: 'N·s', stepA: 0.25, maxA: 1.5, caption: 'One impulse, two scales: 1 lbf·s reaches about 4.45 on the newton-second scale. Read as N·s, the same number “1” is a far smaller impulse.' }),
      explain: 'An impulse of 1 lbf·s is 4.45 N·s. Reading the number 1 as 1 N·s underestimated every small thruster firing by a factor of 4.45, so the navigators’ model of the trajectory drifted. In September 1999 the spacecraft reached Mars about 57 km above the surface, far too deep in the atmosphere, and was lost.',
    }),
    num({
      id: 'slug-to-kg', difficulty: 3,
      gen(r) {
        const m = r.pick([2, 3.5, 5, 6.8, 12, 25]);
        const kg = (m * 4.448) / FT;
        return {
          prompt: t`Older US aerospace documents give mass in **slugs**. One slug is the mass that a force of 1 lbf accelerates at 1 ft/s², so $1\ \text{slug} = 1\ \text{lbf}\cdot\text{s}^2/\text{ft}$. A spacecraft component has a mass of ${m} slugs. What is its mass in kilograms? Use $1\ \text{lbf} = 4.448\ \text{N}$ and $1\ \text{ft} = 0.3048\ \text{m}$.`,
          answer: kg, units: 'kg', tol: { rel: 0.005 },
          errors: [
            { value: m * 4.448 * FT, feedback: 'You multiplied by 0.3048. The foot sits in the denominator of lbf·s²/ft, so divide by 0.3048.' },
            { value: m * 0.45359237, feedback: 'A slug is not a pound of mass. A pound is 0.454 kg; a slug is about 14.6 kg.' },
            { value: m * 4.448, feedback: 'You converted the pound-force but not the foot: divide by 0.3048 as well.' },
          ],
          hints: [
            'Convert each piece of lbf·s²/ft into SI: replace lbf by 4.448 N and ft by 0.3048 m.',
            t`$1\ \text{slug} = \dfrac{4.448\ \text{N}\cdot\text{s}^2}{0.3048\ \text{m}}$, and $1\ \text{N} = 1\ \text{kg}\cdot\text{m}/\text{s}^2$.`,
            t`The units reduce to kg: $1\ \text{slug} = \dfrac{4.448}{0.3048}\ \text{kg} = 14.59\ \text{kg}$. Now multiply by ${m}.`,
          ],
          teach: 'A derived unit converts by converting each base piece inside it: 1 slug = (4.448 N)(1 s²)/(0.3048 m) ≈ 14.59 kg.',
          visual: dualScale({ value: m, perA: 4.448 / FT, unitA: 'slug', unitB: 'kg', stepA: m > 7 ? 5 : 1 }),
          explain: t`$1\ \text{slug} = \dfrac{4.448\ \text{kg}\cdot\text{m/s}^2\cdot\text{s}^2}{0.3048\ \text{m}} = 14.59\ \text{kg}$, so ${m} slugs $= ${m}\times14.59\ \text{kg} = ${sig(kg, 3)}\ \text{kg}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-psi-mpa', difficulty: 2,
      gen(r) {
        const p = r.pick([300, 500, 750, 1000, 1500, 3000]);
        const MPa = (p * PSI) / 1e6;
        return {
          prompt: t`An engine’s combustion chamber runs at ${comma(p)} psi (pounds-force per square inch). What is the chamber pressure in megapascals, to 3 significant figures? Use $1\ \text{psi} = 6.895\ \text{kPa}$.`,
          answer: MPa, units: 'MPa', tol: { rel: 0.005 },
          errors: [{ value: (p / 6.894757) / 1000, feedback: 'You divided by 6.895. A psi is bigger than a kilopascal, so the pressure has a bigger number in kPa than in psi.' }, { value: p * 6.894757, feedback: 'That is the pressure in kilopascals. The answer box is in megapascals: divide by 1000.' }],
          hints: ['Convert psi to kPa, then kPa to MPa.', t`$${comma(p)}\ \text{psi}\times\dfrac{6.895\ \text{kPa}}{1\ \text{psi}}\times\dfrac{1\ \text{MPa}}{1000\ \text{kPa}}$.`],
          teach: 'Chain the conversions — psi to kPa to MPa — so each unwanted unit cancels.',
          visual: dualScale({ value: p, perA: PSI / 1e6, unitA: 'psi', unitB: 'MPa', stepA: p >= 1000 ? 500 : 100 }),
          explain: t`$${comma(p)}\times6.895\ \text{kPa} = ${comma(Math.round(p * 6.894757))}\ \text{kPa} = ${sig(MPa, 3)}\ \text{MPa}$.`,
        };
      },
    }),
    num({
      id: 'cp-gps-distance', difficulty: 3, transfer: true,
      gen(r) {
        const [us, when] = r.pick([[38, 'a day'], [19, 'half a day'], [9.5, 'six hours'], [76, 'two days']]);
        const km = (us * 1e-6 * 3.00e8) / 1000;
        return {
          prompt: t`Left uncorrected, the clocks on GPS satellites would run fast by about 38 microseconds per day relative to clocks on the ground — an effect of relativity. A receiver turns time into distance using the speed of light, $c = 3.00\times10^{8}\ \text{m/s}$. After ${when} the clock error would be ${us} μs. How far does light travel in ${us} μs? Answer in kilometres.`,
          answer: km, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: us * 1e-6 * 3.00e8, feedback: 'That is the distance in metres; the box asks for kilometres.' }, { value: (us * 1e-3 * 3.00e8) / 1000, feedback: 'μ (micro) is 10⁻⁶, not 10⁻³ — that would be milli.' }],
          hints: [t`Convert the time to seconds first: $1\ \mu\text{s} = 10^{-6}\ \text{s}$.`, t`Distance $= c\,t = (3.00\times10^{8}\ \text{m/s})(${us}\times10^{-6}\ \text{s})$, then divide by 1000 for kilometres.`],
          teach: 'Convert every quantity to base SI units before multiplying, then convert the result to the unit asked for.',
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-30000, 30000], y: [-8000, 29000], equal: true, xticks: 0.001, yticks: 0.001, xlabel: '', ylabel: '',
              alt: 'Earth and the orbit of a GPS satellite, drawn to scale',
              curves: [
                { param: ['6371*cos(t)', '6371*sin(t)'], t: [0, '2*pi'], color: 'teal', width: 2 },
                { param: ['26571*cos(t)', '26571*sin(t)'], t: [0.35, 2.8], color: 'ink3', width: 1.2, dash: true },
                { param: ['0', 't'], t: [6371, 26571], color: 'gold', width: 1.4, dash: true },
              ],
              points: [{ x: 0, y: 26571, r: 5, color: 'gold', label: 'GPS satellite, 20 200 km up' }, { x: 0, y: 6371, r: 4, color: 'accent', label: 'receiver' }, { x: -4200, y: -1500, r: 0.01, color: 'teal', label: 'Earth' }],
            },
            caption: 'Earth and part of a GPS orbit, to scale. The receiver turns the signal’s travel time into a distance — so a clock error becomes a position error.',
          },
          explain: t`$d = c\,t = (3.00\times10^{8}\ \text{m/s})(${sci(us * 1e-6)}\ \text{s}) = ${sci(us * 1e-6 * 3.00e8)}\ \text{m} \approx ${sig(km, 3)}\ \text{km}$. A positioning error of kilometres per day is why GPS corrects for relativity.`,
        };
      },
    }),
    mcq({
      id: 'cp-write-mn', difficulty: 1,
      prompt: 'Which is the correct way to write a thrust of 2.3 million newtons?',
      choices: ['2.3 MN', '2.3 mN', '2.3 kkN', '2300 KN'],
      answer: 0,
      why: {
        1: 'Lower-case m is milli: 2.3 mN is 0.0023 N, a billion times too small.',
        2: 'SI never stacks prefixes. A thousand kilonewtons is a meganewton.',
        3: 'Kilo is a lower-case k; capital K is the kelvin. 2300 kN would be correct.',
      },
      hints: ['Which prefix means a million, and is it upper or lower case?'],
      teach: 'Prefix case matters (M is mega, m is milli), prefixes never stack, and kilo is always a lower-case k.',
      explain: 'Mega (M) is 10⁶, so 2.3 million newtons is 2.3 MN — equivalently 2300 kN.',
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §1.2–1.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/1-2-units-and-standards' },
    { label: 'BIPM, The International System of Units (SI Brochure)', url: 'https://www.bipm.org/en/publications/si-brochure' },
    { label: 'NASA, Mars Climate Orbiter Mishap Investigation Board Phase I Report (1999)', url: 'https://llis.nasa.gov/llis_lib/pdf/1009464main1_0641-mr.pdf' },
  ],
});
