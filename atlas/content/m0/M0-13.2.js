// Fermi estimates — a chain of rough factors multiplied, kept to the nearest power of ten, then checked against the real value.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig, tex } from '../../src/core/format.js';
import { N, bars, logLadder } from './_m0kit.js';
import { staircase, p10 } from './_m0reason.js';

const t = String.raw;
const L10 = Math.log10;
const H = 6.626e-34, C = 2.998e8, KB = 1.380649e-23;
// the Sun: luminosity from the solar constant, and the true mean photon energy of a 5772 K blackbody, 2.701 kT
const S0 = 1361, AU = 1.496e11, RE = 6.371e6;
const LSUN = S0 * 4 * Math.PI * AU * AU;
const E500 = (H * C) / 500e-9;
const N_EST = LSUN / E500, N_BB = LSUN / (2.701 * KB * 5772);
// the other estimates and their measured values
const ATM = (1.013e5 * 4 * Math.PI * RE * RE) / 9.81, ATM_REAL = 5.15e18;
const SOLAR_IN = S0 * Math.PI * RE * RE;
const BREATH = (0.5 / 24) * 6.022e23;
const OCEAN_KM3 = (0.71 * 4 * Math.PI * RE * RE * 3700) / 1e9, OCEAN_REAL = 1.335e9;
const SATS = 250 * 10 * 5, SATS_REAL = 11000;
const MASS_RATIO = Math.exp(9.4 / 3.0), F9 = 549054 / 22800;

/** A Fermi item: graded on log₁₀ of the estimate, accepting anything within a factor of about 3 of the reference estimate. */
function fermi({ id, difficulty = 2, prompt, value, unitWord, errors = [], ...rest }) {
  return num({
    id, difficulty,
    prompt: t`${prompt} Enter $\log_{10}$ of your estimate${unitWord ? ` in ${unitWord}` : ''} — type $9.5$ for $3\times10^{9}$. Within a factor of about $3$ ($\pm0.5$ in the logarithm) counts.`,
    answer: +L10(value).toFixed(3), tol: { rel: 0, abs: 0.5 },
    errors: errors.map((e) => ({ value: +L10(e.value).toFixed(3), feedback: e.feedback })).filter((e) => Math.abs(e.value - L10(value)) > 0.55),
    ...rest,
  });
}

export default lesson({
  id: 'm0.M0-13.2',
  title: 'Fermi estimates',
  minutes: 11, difficulty: 2,
  intro: t`A **Fermi estimate** gets a number right to within a factor of a few by reasoning alone: break the unknown into factors you can guess, multiply, and keep the power of ten. Because logs turn products into sums,

$$N = f_1 \times f_2 \times \cdots \times f_k \quad\Longleftrightarrow\quad \log_{10} N = \log_{10} f_1 + \log_{10} f_2 + \cdots + \log_{10} f_k$$

an estimate is a staircase on a log scale, and each guess that is off by a factor of $2$ moves it by only $0.3$. Errors in different factors tend to partly cancel. Two habits make estimates honest: when you only know a range, guess its **geometric mean** $\sqrt{AB}$ (the midpoint on a log scale), and always **compare with the real value** when one exists.`,
  symbols: [
    { tex: 'N', text: 'the quantity being estimated' },
    { tex: 'f_1,\\ \\ldots,\\ f_k', text: 'the factors you can guess or remember, each with its units' },
    { tex: '\\log_{10}', text: 'the base-10 logarithm: the power of ten, so $\\log_{10} N$ tells you the order of magnitude' },
  ],
  why: t`Before any careful calculation, an estimate tells you what answer to expect — a slipped power of ten shows up at once. Physicists use estimates to decide whether an effect is worth computing at all; mission designers use them to see whether a mission is possible before they design it. [PHYS 2210](#/lesson/phys2210.M1.4) practises the same skill on everyday quantities.`,
  visual: {
    type: 'graph',
    title: 'How many working satellites are in orbit?',
    lead: t`A stock equals its inflow times how long each item stays: satellites in orbit $\approx$ (launches per year) $\times$ (satellites per launch) $\times$ (working years each). Each blue bar adds one factor on a log scale; gold is the estimate; the green line is the measured count.`,
    tasks: [
      t`With the defaults the estimate lands near $10^{4}$, right beside the measured value. Notice how little a factor of $2$ in any one slider moves the gold bar: $0.3$ of a decade.`,
      t`Double the lifetime and halve the satellites per launch: the estimate does not move at all. Errors in opposite directions cancel.`,
      t`Push every slider to its high end: now all the errors pile up the same way, the worst case for a Fermi estimate.`,
    ],
    params: {
      x: [0.3, 4.7], y: [0, 5.6], ylog: true, aspect: 'wide', xlabel: '', xticks: 0, ylabel: 'satellites (running product)',
      sliders: [
        { key: 'F', label: 'Launches per year', min: 50, max: 500, step: 10, value: 250, explain: 'Orbital launches worldwide each year: a couple of hundred in the mid-2020s.' },
        { key: 's', label: 'Satellites per launch', min: 1, max: 30, step: 1, value: 10, explain: 'Many launches carry one satellite; some carry dozens.' },
        { key: 'life', label: 'Working life (years)', min: 1, max: 20, step: 1, value: 5, explain: 'Low-orbit satellites last a few years; big geostationary ones fifteen or more.' },
      ],
      shade: [
        { fn: 'log10(F)', lower: '0', from: 0.64, to: 1.36, color: 'accent', alpha: 0.4 },
        { fn: 'log10(F*s)', lower: 'log10(F)', from: 1.64, to: 2.36, color: 'accent', alpha: 0.4 },
        { fn: 'log10(F*s*life)', lower: 'log10(F*s)', from: 2.64, to: 3.36, color: 'accent', alpha: 0.4 },
        { fn: 'log10(F*s*life)', lower: '0', from: 3.64, to: 4.36, color: 'gold', alpha: 0.5 },
      ],
      hlines: [{ y: N(L10(SATS_REAL)), color: 'good', label: 'measured, 2025' }],
      points: [
        { x: 1, y: 0.25, r: 0, label: 'launches', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: 2, y: 0.25, r: 0, label: '× per launch', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: 3, y: 0.25, r: 0, label: '× years', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: 4, y: 0.25, r: 0, label: 'estimate', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
      ],
      readouts: [{ label: 'estimate', expr: 'F*s*life', digits: 2 }, { label: 'estimate ÷ measured', expr: `F*s*life/${SATS_REAL}`, digits: 2 }],
    },
    caption: t`A steady-state model: it assumes launches have run at today’s rate for a full satellite lifetime, which overestimates a fast-growing fleet. Measured: roughly $11\,000$ working satellites in early 2025, most in low Earth orbit (ESA Space Environment Report 2025).`,
  },
  example: {
    prompt: t`Estimate how many photons the Sun emits each second. You may use the solar constant — sunlight delivers $1361\ \text{W/m}^2$ at Earth’s distance, $1.5\times10^{11}$ m — and Planck’s relation $E = hc/\lambda$.`,
    visual: staircase({
      steps: [{ factor: S0, label: '1361 W/m²' }, { factor: 4 * Math.PI * AU * AU, label: '× 4πd²' }, { factor: 1 / E500, label: '÷ hc/λ' }],
      real: N_BB, realLabel: 'blackbody value', ylabel: 'running product', totalLabel: 'photons/s',
      caption: t`The estimate as a staircase on a log scale: the luminosity climbs to $${tex(LSUN, 2)}$ W, and dividing by a photon’s energy climbs another $18$ decades. The green line is the value for a $5772$ K blackbody, close to the real Sun.`,
    }),
    steps: [
      { label: 'Plan', text: t`Photons per second $=$ (power the Sun emits) $\div$ (energy of one photon). Estimate each.` },
      { label: 'The power', text: t`At Earth’s distance $d$, sunlight spreads over a sphere of area $4\pi d^2 = 4\pi(1.5\times10^{11})^2 = ${tex(4 * Math.PI * AU * AU, 2)}\ \text{m}^2$, each square metre getting $1361$ W. So $L \approx ${tex(LSUN, 2)}$ W.` },
      { label: 'One photon', text: t`Sunlight peaks in the visible, so take $\lambda \approx 500$ nm: $$E = \frac{hc}{\lambda} = \frac{(6.6\times10^{-34})(3.0\times10^{8})}{5\times10^{-7}} \approx ${tex(E500, 1)}\ \text{J}.$$` },
      { label: 'Divide', text: t`$N \approx \dfrac{${tex(LSUN, 2)}}{${tex(E500, 1)}} \approx ${tex(N_EST, 1)}$ photons per second: about $10^{45}$.` },
      { label: 'Check against reality', text: t`For a $5772$ K blackbody the average photon carries $2.70\,kT = ${tex(2.701 * KB * 5772, 3)}$ J, less than a green one, because much of sunlight is infrared. That gives $${tex(N_BB, 2)}$ per second: our estimate is low by a factor of $${nice(sig(N_BB / N_EST, 2))}$ — well within a Fermi estimate’s factor of a few.` },
    ],
    answer: t`About $10^{45}$ photons per second (the blackbody value is $${tex(N_BB, 2)}$).`,
  },
  practice: [
    fermi({
      id: 'atmosphere', difficulty: 2,
      prompt: t`Estimate the mass of Earth’s atmosphere, in kilograms. (Air pressure at sea level is the weight of the air above each square metre: about $10^{5}$ Pa. Earth’s radius is $6.4\times10^{6}$ m.)`,
      value: ATM, unitWord: 'kilograms',
      errors: [{ value: ATM * 9.81, feedback: t`That is the atmosphere’s *weight* in newtons. Divide by $g$ to get its mass.` }, { value: ATM / 4 / Math.PI, feedback: t`A sphere’s surface area is $4\pi R^2$, not $R^2$.` }],
      hints: [t`Pressure $=$ weight per area, so the total weight is $p \times 4\pi R^2$.`, t`Mass $=$ weight $\div g$: $\dfrac{10^{5} \times 4\pi(6.4\times10^{6})^2}{10}$.`],
      teach: t`Pressure is weight per area, so surface pressure times area weighs the whole atmosphere.`,
      explain: t`$m \approx \dfrac{(1.0\times10^{5})(${tex(4 * Math.PI * RE * RE, 2)})}{9.8} \approx ${tex(ATM, 2)}$ kg, so $\log_{10} m \approx ${nice(sig(L10(ATM), 3))}$. The measured mass is $5.15\times10^{18}$ kg (Trenberth and Smith, 2005) — a few per cent less, mostly because mountains and high ground push some surface pressure below the sea-level value.`,
      visual: logLadder({ items: [{ v: 4.8e11, label: 'all people' }, { v: 1.4e21, label: 'oceans' }, { v: 7.3e22, label: 'the Moon' }, { v: 6.0e24, label: 'Earth' }], x: [10, 26], xlabel: 'mass (kg)', caption: t`Masses for comparison, on a logarithmic scale: all the people on Earth, the oceans, the Moon and the Earth.` }),
    }),
    fermi({
      id: 'propellant', difficulty: 3,
      prompt: t`Estimate how many kilograms of rocket stand on the launch pad for every kilogram that reaches low Earth orbit. Use the rocket equation $m_0/m_f = e^{\Delta v / v_e}$: reaching orbit takes $\Delta v \approx 9.4$ km/s (orbital speed plus gravity and drag losses), and a kerosene–oxygen engine’s exhaust leaves at $v_e \approx 3$ km/s. Treat everything that reaches orbit as payload.`,
      value: MASS_RATIO, unitWord: 'kilograms per kilogram',
      errors: [{ value: 9.4 / 3, feedback: t`$\Delta v/v_e$ is the *exponent*: the mass ratio is $e^{\Delta v/v_e}$.` }, { value: Math.exp(7.8 / 3), feedback: t`$7.8$ km/s is the orbital speed alone; climbing against gravity and pushing through air cost the rest of the $9.4$ km/s.` }],
      hints: [t`$\Delta v/v_e = 9.4/3 \approx 3.1$.`, t`$e^{3.1} \approx 22$.`],
      teach: t`The rocket equation makes the launch mass grow exponentially with $\Delta v/v_e$, which is why almost all of a rocket is propellant.`,
      explain: t`$e^{9.4/3} \approx ${Math.round(MASS_RATIO)}$, so $\log_{10} \approx ${nice(sig(L10(MASS_RATIO), 3))}$: about $${Math.round(100 - 100 / MASS_RATIO)}\%$ of the rocket on the pad is propellant. A real Falcon 9 lifts off at $549$ t and can put $22.8$ t into low orbit (expendable): $${nice(sig(F9, 3))}$ kg per kg. Close to the estimate — partly by luck, because the empty tanks and engines (which cost mass) and staging (which drops them on the way up) pull in opposite directions.`,
      visual: bars({ values: [7.8, 1.6], labels: ['orbital speed', 'losses'], xlabel: '', ylabel: 'Δv (km/s)', colors: ['accent', 'warn'], caption: t`A rough Δv budget to low orbit: the orbital speed itself, and the losses to gravity and drag on the way up. Losses vary with the rocket and trajectory.` }),
    }),
    num({
      id: 'geo-mean', difficulty: 2,
      gen(r) {
        const A = r.pick([20, 50, 100, 200]), k = r.pick([100, 400, 900, 10000]), B = A * k, ans = Math.sqrt(A * B);
        return {
          prompt: t`You are sure a quantity is more than $${A}$ and less than $${B}$, and have no better idea. What single guess is off by the same *factor* whichever end the truth lies at?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (A + B) / 2, feedback: t`The ordinary average is too close to the top: if the truth were $${A}$, it would be off by a factor of about $${Math.round((A + B) / 2 / A)}$. Average the *logarithms* instead.` }],
          hints: [t`You want $\dfrac{g}{${A}} = \dfrac{${B}}{g}$.`],
          teach: t`The midpoint of a range on a log scale is the geometric mean, $\sqrt{AB}$.`,
          explain: t`$g^2 = ${A}\times${B}$, so $g = \sqrt{${A * B}} = ${nice(ans)}$: a factor of $${nice(ans / A)}$ from either end.`,
          visual: logLadder({ items: [{ v: A, label: String(A), color: 'accent' }, { v: B, label: String(B), color: 'accent' }], x: [L10(A) - 0.6, L10(B) + 0.6], xlabel: '', alternate: false, caption: t`The two ends of the range on a logarithmic scale.` }),
        };
      },
    }),
    fermi({
      id: 'solar-power', difficulty: 2,
      prompt: t`Sunlight delivers about $1.4\ \text{kW/m}^2$ above the atmosphere. Estimate the total solar power striking the Earth (radius $6.4\times10^{6}$ m), in watts.`,
      value: SOLAR_IN, unitWord: 'watts',
      errors: [{ value: SOLAR_IN * 4, feedback: t`Only the side facing the Sun is lit, and the light meets it as if it were a flat disc: use the cross-section $\pi R^2$, not the whole surface $4\pi R^2$.` }, { value: SOLAR_IN / 1000, feedback: t`$1.4$ kW is $1400$ W.` }],
      hints: [t`The Earth casts a shadow the size of a disc of radius $R$.`, t`Power $\approx 1400\ \text{W/m}^2 \times \pi R^2$.`],
      teach: t`A sphere intercepts a parallel beam over its cross-section, $\pi R^2$ — a quarter of its surface area.`,
      explain: t`$1361 \times \pi(6.371\times10^{6})^2 = ${tex(SOLAR_IN, 3)}$ W, so $\log_{10} \approx ${nice(sig(L10(SOLAR_IN), 3))}$ — thousands of times humanity’s total power use. (Total solar irradiance $1360.8\ \text{W/m}^2$, Kopp and Lean 2011.)`,
      visual: {
        type: 'graph',
        params: {
          x: [-4.5, 3], y: [-1.9, 1.9], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
          shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'teal', alpha: 0.35 }],
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2 }, { param: ['0', 't'], t: [-1, 1], color: 'gold', width: 2.4, dash: true }],
          arrows: [-0.75, -0.25, 0.25, 0.75, -1.5, 1.5].map((y) => ({ from: [-4.2, y], to: [Math.abs(y) < 1 ? -Math.sqrt(1 - y * y) - 0.05 : 2.6, y], color: 'gold', width: 1.6 })),
          points: [{ x: 1.15, y: 0, r: 0, label: 'cross-section πR²', labelAlign: 'left', labelDx: 0, labelDy: 0, color: 'gold' }],
        },
        caption: t`Parallel sunlight (from the left) meets the Earth: the beam it intercepts is a disc as wide as the Earth (gold dashes). Not to scale.`,
      },
    }),
    fermi({
      id: 'breath', difficulty: 2,
      prompt: t`Estimate the number of molecules in one breath. (A resting breath is about half a litre; a mole of gas, $6.0\times10^{23}$ molecules, fills about $24$ L at room temperature.)`,
      value: BREATH, unitWord: 'molecules',
      errors: [{ value: 0.5 * 6.022e23, feedback: t`Convert litres to moles first: $0.5$ L is only $0.5/24$ of a mole.` }, { value: (24 / 0.5) * 6.022e23, feedback: t`Upside down: $0.5$ L is a small fraction of $24$ L, not $48$ times it.` }],
      hints: [t`Moles in a breath $= 0.5\ \text{L} \div 24\ \text{L/mol}$.`, t`Then multiply by $6.0\times10^{23}$ per mole.`],
      teach: t`Count molecules by converting to moles, then multiplying by Avogadro’s number.`,
      explain: t`$\dfrac{0.5}{24}\times 6.0\times10^{23} \approx ${tex(BREATH, 2)}$ molecules, $\log_{10} \approx ${nice(sig(L10(BREATH), 3))}$. The whole atmosphere holds about $${tex(ATM_REAL / 1.2 / 5e-4, 1)}$ breaths’ worth of air ($5.15\times10^{18}$ kg at about $1.2\ \text{kg/m}^3$) — about as many breaths as there are molecules in one. So once the air has mixed, each breath you take holds on average about one molecule from any single breath in history.`,
      visual: bars({ values: [0.5, 24], labels: ['one breath', 'one mole'], xlabel: '', ylabel: 'volume (L)', colors: ['accent', 'gold'], caption: t`The volume of a resting breath beside the volume of one mole of air at room temperature.` }),
    }),
    mcq({
      id: 'which-factor', difficulty: 2,
      prompt: t`An estimate multiplies three factors. You know $P$ to within $20\%$, $Q$ only to within a factor of $10$, and $R$ to within a factor of $2$. Where is an hour of research best spent?`,
      choices: ['pinning down Q', 'pinning down P', 'pinning down R', 'on all three equally, since they multiply'],
      answer: 0,
      why: {
        1: t`$P$ is already good: $20\%$ is under $0.1$ of a decade. Improving it barely changes the product’s uncertainty.`,
        2: t`$R$’s factor of $2$ is $0.3$ of a decade; $Q$’s factor of $10$ is a whole decade and dominates.`,
        3: t`Because they multiply, their uncertainties add on a log scale, and the biggest one dominates: equal effort is wasted on the small ones.`,
      },
      hints: [t`Convert each uncertainty to decades: $\log_{10}$ of the factor.`],
      teach: t`In a product the biggest relative uncertainty dominates: improve the worst factor first.`,
      explain: t`On a log scale the uncertainties are about $0.08$, $1$ and $0.3$ decades. Even combined as independent errors, $\sqrt{0.08^2 + 1^2 + 0.3^2} \approx 1.05$: almost all of it is $Q$.`,
      visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [0.3, 3.7], aspect: 'wide', xlabel: 'error (decades)', ylabel: '', yticks: 0, curves: [{ fn: '3', domain: [-0.08, 0.08], color: 'accent', width: 8 }, { fn: '2', domain: [-1, 1], color: 'warn', width: 8 }, { fn: '1', domain: [-0.3, 0.3], color: 'gold', width: 8 }], points: [{ x: -1.3, y: 3, r: 0, label: 'P', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' }, { x: -1.3, y: 2, r: 0, label: 'Q', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' }, { x: -1.3, y: 1, r: 0, label: 'R', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' }] }, caption: t`Each factor’s uncertainty as a range on a log scale, in decades (powers of ten).` },
    }),
  ],
  checkpoint: [
    fermi({
      id: 'cp-satellites', difficulty: 2, transfer: true,
      prompt: t`Orbital launches worldwide run at about $250$ a year, and an average launch puts about $10$ satellites into orbit. A satellite in low Earth orbit works for about $5$ years. Estimate how many working satellites are in orbit.`,
      value: SATS, unitWord: 'satellites',
      errors: [{ value: 250 * 10, feedback: t`That is the number launched in *one* year. Each stays in service about $5$ years, so about five years’ worth are up at once.` }, { value: 250 * 5, feedback: t`Count satellites, not launches: multiply by the satellites per launch.` }],
      hints: [t`The number in orbit is the inflow times how long each one stays.`, t`$250 \times 10 \times 5$.`],
      teach: t`In a steady state, a stock equals its inflow times the average time each item stays.`,
      explain: t`$250 \times 10 \times 5 \approx ${SATS}$, $\log_{10} \approx ${nice(sig(L10(SATS), 3))}$. The measured count was roughly $11\,000$ working satellites in early 2025 (ESA Space Environment Report 2025): the estimate is within $15\%$. Bathtubs, hospitals and constellations obey the same rule.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 1.3], aspect: 'wide', xlabel: 'years of launching', xticks: 0, ylabel: 'satellites in orbit', yticks: 0, curves: [{ fn: 'min(x, 5)/5', color: 'accent' }], vlines: [{ x: 5, color: 'ink4', label: 'one lifetime' }] }, caption: t`In a steady-launch model the number in orbit climbs for one satellite lifetime, then levels off when old satellites die as fast as new ones arrive.` },
    }),
    fermi({
      id: 'cp-ocean', difficulty: 3,
      prompt: t`Estimate the volume of Earth’s oceans, in cubic kilometres. (Earth’s radius is $6400$ km; oceans cover about $70\%$ of the surface; their average depth is about $3.7$ km.)`,
      value: OCEAN_KM3, unitWord: 'cubic kilometres',
      errors: [{ value: OCEAN_KM3 * 1e9, feedback: t`That is in cubic *metres*: $1\ \text{km}^3 = 10^{9}\ \text{m}^3$.` }, { value: OCEAN_KM3 / 4 / Math.PI, feedback: t`The surface area of a sphere is $4\pi R^2$.` }],
      hints: [t`Volume $\approx$ area $\times$ depth, with area $0.7 \times 4\pi R^2$.`, t`$0.7 \times 4\pi(6400)^2 \approx 3.6\times10^{8}\ \text{km}^2$.`],
      teach: t`A thin layer’s volume is its area times its thickness.`,
      explain: t`$0.71 \times 4\pi(6371)^2 \times 3.7 \approx ${tex(OCEAN_KM3, 2)}\ \text{km}^3$, $\log_{10} \approx ${nice(sig(L10(OCEAN_KM3), 3))}$. The measured volume is $1.335\times10^{9}\ \text{km}^3$ (Charette and Smith, 2010), so the estimate is within $1\%$ — a lucky one, since $3.7$ km was itself measured.`,
      visual: logLadder({ items: [{ v: 1.21e4, label: 'Lake Superior' }, { v: 2.2e10, label: 'the Moon' }, { v: 1.08e12, label: 'Earth' }], x: [3, 13], xlabel: 'volume (km³)', caption: t`Volumes for comparison on a logarithmic scale: Lake Superior, the Moon and the whole Earth.` }),
    }),
    num({
      id: 'cp-laser', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([1, 5, 3]), [lam, col] = r.pick([[532, 'green'], [650, 'red'], [405, 'violet']]), E = (H * C) / (lam * 1e-9), ans = (P * 1e-3) / E;
        return {
          prompt: t`A spacecraft’s laser altimeter is tested with a ${col} laser of $${lam}$ nm wavelength and $${P}$ mW output. How many photons does it emit per second? ($h = 6.626\times10^{-34}$ J·s, $c = 2.998\times10^{8}$ m/s.)`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: P / E, feedback: t`$${P}$ mW is $${P}\times10^{-3}$ W.` }, { value: (P * 1e-3) / (H * C * lam), feedback: t`Convert the wavelength to metres: $${lam}$ nm $= ${lam}\times10^{-9}$ m.` }],
          hints: [t`Energy per photon: $E = hc/\lambda$.`, t`Photons per second $=$ power $\div E$.`],
          teach: t`Photon rate $=$ power $\div$ energy per photon, $P\lambda/hc$.`,
          explain: t`$E = \dfrac{(6.626\times10^{-34})(2.998\times10^{8})}{${lam}\times10^{-9}} = ${tex(E, 4)}$ J, so $N = \dfrac{${P}\times10^{-3}}{${tex(E, 4)}} = ${tex(ans, 3)}$ photons per second. Even a feeble beam is an enormous stream of photons.`,
          visual: { type: 'graph', params: { x: [350, 750], y: [1.4, 3.8], aspect: 'wide', xlabel: 'wavelength (nm)', ylabel: 'photon energy (eV)', curves: [{ fn: '1239.84/x', color: 'accent' }], vlines: [{ x: lam, color: 'gold', label: `${lam} nm` }] }, caption: t`The energy of one photon, $hc/\lambda$, across the visible range: shorter wavelengths carry more energy per photon ($1\ \text{eV} = 1.602\times10^{-19}$ J).` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §1.5 Estimates and Fermi Calculations', url: 'https://openstax.org/books/university-physics-volume-1/pages/1-5-estimates-and-fermi-calculations' },
    { label: 'ESA Space Environment Report 2025', url: 'https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2025' },
    { label: 'Trenberth and Smith (2005), The mass of the atmosphere, J. Climate 18, 864', url: 'https://doi.org/10.1175/JCLI-3299.1' },
    { label: 'Kopp and Lean (2011), A new, lower value of total solar irradiance, GRL 38, L01706', url: 'https://doi.org/10.1029/2010GL045777' },
    { label: 'Charette and Smith (2010), The volume of Earth’s ocean, Oceanography 23(2)', url: 'https://doi.org/10.5670/oceanog.2010.51' },
    { label: 'SpaceX, Falcon 9 vehicle page (liftoff mass and payload to LEO)', url: 'https://www.spacex.com/vehicles/falcon-9/' },
  ],
});
