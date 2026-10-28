// The Maxwell speed distribution derived from the Boltzmann factor: the
// factor for each velocity, times the 4πv² dv of velocity space at speed v.
// Its moments (v_p, v̄, v_rms) from Gaussian integrals; the exact tail
// fraction erfc(x) + (2/√π)x e^(−x²); and Jeans escape — Earth's hydrogen,
// the Moon's missing air, Mars's deuterium-rich water.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, AMU, MASS, vEsc, vMostProbable, vMean, vRms, tailFrac, lnTail, r4, texNum, apart, maxwellPic } from './_stat.js';

const t = String.raw;
const VP = `(${Math.sqrt((2 * KB) / AMU) / 1000}*sqrt(T/m))`;
/** The tail fraction as expression text of x (exact below 4, asymptotic above, where 1 − erf loses its digits). */
const tailExpr = (x) => `step(4 - (${x}))*(1 - erf(${x}) + 1.1283792*(${x})*e^(-(${x})^2)) + step((${x}) - 4)*0.5641896*e^(-(${x})^2)*(2*(${x}) + 1/(${x}) - 0.5/(${x})^3 + 0.75/(${x})^5)`;
/** A number that may be astronomically small, as TeX. */
const tinyTeX = (lnv) => { const l10 = lnv / Math.LN10, e = Math.floor(l10); return l10 > -3 ? fmt(Math.exp(lnv), 3) : `${(10 ** (l10 - e)).toFixed(1)} \\times 10^{${e}}`; };
// the worked example: Earth's exobase, 500 km up, at 1000 K
const EX = { T: 1000, h: 500e3 };
EX.ve = vEsc('earth', EX.h) / 1000;
EX.vpH = vMostProbable(MASS.H, EX.T) / 1000; EX.xH = EX.ve / EX.vpH; EX.fH = tailFrac(EX.xH);
EX.vpO = vMostProbable(MASS.O, EX.T) / 1000; EX.xO = EX.ve / EX.vpO; EX.lnO = lnTail(EX.xO);

/** D(v)·v_p against v/v_p: the universal shape, with an optional shaded tail beyond x. */
function uPic({ from = null, to = null, caption, marks = false, xmax = 3.5 }) {
  const fn = '(4/sqrt(pi))*x^2*e^(-x^2)';
  const shade = from === null ? [] : [{ fn, lower: '0', from: r4(from), to: r4(to ?? xmax), color: 'gold', alpha: 0.4 }];
  const vlines = marks ? [{ x: 1, color: 'ink3', label: 'vₚ' }, { x: r4(2 / Math.sqrt(Math.PI)), color: 'ink3', label: 'v̄' }, { x: r4(Math.sqrt(1.5)), color: 'ink3', label: 'vᵣₘₛ' }] : [];
  return { type: 'graph', params: { x: [0, xmax], y: [0, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'v / vₚ', ylabel: 'D(v) × vₚ', curves: [{ fn, domain: [0, xmax], color: 'accent' }], shade, vlines }, caption };
}

export default lesson({
  id: 'phys3700.T6.4',
  title: 'The Maxwell speed distribution',
  minutes: 16, difficulty: 3,
  intro: t`A molecule’s kinetic energy is $\tfrac12mv^2$, so each **velocity** $\vec v$ has Boltzmann factor $e^{-mv^2/2kT}$. But many velocities share one **speed**: all those whose tips lie on a sphere of radius $v$ in velocity space, whose shell of thickness $dv$ has volume $4\pi v^2\,dv$. The probability density of the speed is the product, normalized:

$$D(v) = \left(\frac{m}{2\pi kT}\right)^{3/2} 4\pi v^2\, e^{-mv^2/2kT}.$$

The $v^2$ wins at low speeds and the exponential at high ones, so $D$ peaks at $v_p = \sqrt{2kT/m}$. [PHYS 2210 M17.3](#/lesson/phys2210.M17.3) met this curve; here it is derived, its averages computed by integration, and its far tail — where a few molecules outrun a planet’s escape speed — calculated exactly.`,
  symbols: [
    { tex: 'D(v)', text: 'the speed distribution: $D(v)\\,dv$ is the fraction of molecules with speeds between $v$ and $v + dv$; units s/m' },
    { tex: 'm', text: 'the mass of one molecule, in kg ($1\\ \\text{u} = 1.6605\\times10^{-27}$ kg)' },
    { tex: 'v', text: 'the speed, $|\\vec v|$, in m/s' },
    { tex: 'kT', text: 'the thermal energy of the gas, in J' },
    { tex: '4\\pi v^2', text: 'the area of the sphere of radius $v$ in velocity space: how many velocities share the speed $v$' },
    { tex: '(m/2\\pi kT)^{3/2}', text: 'the normalization, which makes $\\int_0^\\infty D\\,dv = 1$' },
  ],
  why: 'The Maxwell distribution sets reaction rates in flames and nozzles, the speed of effusion and diffusion, Doppler widths of spectral lines, and — through its tail — which planets keep which gases.',
  visual: {
    type: 'graph',
    title: 'Who escapes',
    lead: t`The Maxwell distribution of the chosen gas at temperature $T$ (heights rescaled so every curve peaks at the same height), with the escape speed of the chosen world. The shaded tail, too thin to see when it matters most, is in the readout.`,
    tasks: [
      'Earth’s exobase (10.8 km/s) at 1000 K: atomic hydrogen leaks at a rate you can read; oxygen’s tail is smaller than 10⁻⁴⁰.',
      'Switch to the Moon (2.38 km/s) at 390 K, its daytime high: water and nitrogen have tails millions of times fatter than on Earth.',
      'Watch the Jeans parameter λ = (v(esc)/vₚ)²: the tail falls roughly like e^(−λ), so a factor of 2 in λ is an enormous factor in escape.',
    ],
    params: {
      x: [0, 12], y: [0, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'speed v (km/s)', ylabel: 'D(v) × vₚ',
      choices: [
        { key: 'm', label: 'Gas', options: [[MASS.H, 'H'], [MASS.He, 'He'], [18.015, 'H₂O'], [MASS.N2, 'N₂'], [MASS.CO2, 'CO₂']], value: MASS.H, explain: 'Molecular mass in atomic mass units.' },
        { key: 've', label: 'World', options: [[r4(EX.ve), 'Earth (exobase)'], [r4(vEsc('mars', 200e3) / 1000), 'Mars (exobase)'], [r4(vEsc('titan') / 1000), 'Titan'], [r4(vEsc('moon') / 1000), 'Moon']], value: r4(EX.ve), explain: 'Escape speed where the gas can leave: the exobase (500 km up on Earth, 200 km on Mars), or the surface of an airless world.' },
      ],
      sliders: [{ key: 'T', label: 'Temperature $T$', min: 50, max: 2000, step: 10, value: 1000, unit: '\\text{K}', explain: 'The gas temperature where escape happens: about 1000 K in Earth’s thermosphere, 200–300 K at Mars’s exobase, 390 K at the Moon’s dayside surface.' }],
      curves: [{ fn: `(4/sqrt(pi))*(x/${VP})^2*e^(-(x/${VP})^2)`, domain: [0, 12], color: 'accent' }],
      shade: [{ fn: `(4/sqrt(pi))*(x/${VP})^2*e^(-(x/${VP})^2)`, lower: '0', from: 've', to: 12, color: 'gold', alpha: 0.5 }],
      vlines: [{ x: 've', color: 'warn', label: 'escape speed' }],
      readouts: [
        { label: '$v_p$ (km/s)', expr: VP, digits: 3 },
        { label: '$v_\\text{rms}$ (km/s)', expr: `sqrt(1.5)*${VP}`, digits: 3 },
        { label: 'Jeans $\\lambda = (v_\\text{esc}/v_p)^2$', expr: `(ve/${VP})^2`, digits: 3 },
        { label: 'fraction faster than $v_\\text{esc}$', expr: tailExpr(`ve/${VP}`), digits: 3, zero: 0 },
      ],
    },
    caption: 'Ideal-gas Maxwell distributions; escape speeds from NASA fact-sheet masses and radii. Real upper atmospheres are not isothermal, and non-thermal processes (charge exchange, the solar wind) remove gases too — often more than the thermal tail does.',
  },
  example: {
    prompt: t`At Earth’s exobase, about 500 km up, collisions are so rare that a fast atom heading upward leaves for good. The escape speed there is $${fmt(EX.ve, 3)}$ km/s and the gas is near $${EX.T}$ K. What fraction of hydrogen atoms move faster than escape speed? And of oxygen atoms?`,
    visual: maxwellPic({ gases: [{ m: MASS.H, T: EX.T, label: 'H', color: 'accent' }, { m: MASS.O, T: EX.T, label: 'O', color: 'violet', shade: false, at: 1.6 }], vmax: 12, vcut: EX.ve, ymax: 0.85, caption: 'Speed distributions of atomic hydrogen and oxygen at 1000 K, with the escape speed at 500 km. The shaded hydrogen tail is drawn to scale — too thin to see.' }),
    steps: [
      { label: 'Most probable speed', text: t`$v_p = \sqrt{2kT/m}$: for H ($m = ${MASS.H}$ u), $v_p = ${fmt(EX.vpH, 3)}$ km/s; for O, four times slower, $${fmt(EX.vpO, 3)}$ km/s.` },
      { label: 'Tail formula', text: t`With $x = v_\text{esc}/v_p$, integrating $D(v)$ from $v_\text{esc}$ to infinity gives the fraction $\operatorname{erfc}(x) + \tfrac{2}{\sqrt\pi}\,x\,e^{-x^2}$, where $\operatorname{erfc}$ is the complementary error function.` },
      { label: 'Hydrogen', text: t`$x = ${fmt(EX.ve, 3)}/${fmt(EX.vpH, 3)} = ${fmt(EX.xH, 3)}$: fraction $= ${fmt(EX.fH, 3)}$, about one atom in $${Math.round(1 / EX.fH)}$.` },
      { label: 'Oxygen', text: t`$x = ${fmt(EX.xO, 3)}$: fraction $\approx ${tinyTeX(EX.lnO)}$. Oxygen does not leave thermally at all.` },
      { label: 'Sense check', text: t`The tail is not the loss rate: escapees are replaced by collisions below, and the rate depends on how many atoms reach the exobase. Earth loses roughly 3 kg of hydrogen a second, by this Jeans escape and by non-thermal processes together — slow enough to have kept its oceans.` },
    ],
    answer: t`Hydrogen: $${fmt(EX.fH, 3)}$ (one in about $${Math.round(1 / EX.fH)}$); oxygen: about $${tinyTeX(EX.lnO)}$.`,
  },
  practice: [
    num({
      id: 'mean-speed', difficulty: 1,
      gen(r) {
        const g = r.pick([['xenon (131.3 u), an ion-thruster propellant', MASS.Xe], ['helium (4.003 u)', MASS.He], ['nitrogen (28.01 u)', MASS.N2]]), T = r.pick([200, 300, 500]), v = vMean(g[1], T);
        return {
          prompt: t`What is the mean speed $\bar v = \sqrt{8kT/\pi m}$ of ${g[0]} atoms or molecules at $${T}$ K?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([{ value: vRms(g[1], T), feedback: 'That is the rms speed, √(3kT/m).' }, { value: vMostProbable(g[1], T), feedback: 'That is the most probable speed, √(2kT/m).' }, { value: v * Math.sqrt(1000), feedback: 'Convert the mass from u to kg (or from g/mol to kg/mol), not to grams.' }], v),
          hints: [t`$m = ${g[1]}\times1.6605\times10^{-27}$ kg.`, t`$\bar v = \sqrt{8(1.381\times10^{-23})(${T})/(\pi m)}$.`],
          teach: t`Three speeds: $v_p = \sqrt{2kT/m}$, $\bar v = \sqrt{8kT/\pi m}$, $v_\text{rms} = \sqrt{3kT/m}$.`,
          explain: t`$\bar v = ${fmt(v, 3)}$ m/s.`,
          visual: maxwellPic({ gases: [{ m: g[1], T }], vmax: r4(3.2 * vMostProbable(g[1], T) / 1000), caption: 'This gas’s speed distribution (speed in km/s).' }),
        };
      },
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: 'Put the steps that build the Maxwell speed distribution in order.',
      items: [
        t`Each velocity $\vec v$ has Boltzmann factor $e^{-mv^2/2kT}$.`,
        t`Velocities with speeds in $[v, v + dv]$ fill a shell of volume $4\pi v^2\,dv$.`,
        t`So $D(v) \propto 4\pi v^2 e^{-mv^2/2kT}$.`,
        t`Fix the constant from $\int_0^\infty D\,dv = 1$: it is $(m/2\pi kT)^{3/2}$.`,
        t`$dD/dv = 0$ gives the peak, $v_p = \sqrt{2kT/m}$.`,
      ],
      hints: ['Boltzmann factors weight states — here, velocities. Then count how many velocities share a speed.', 'The normalization and the peak both come last: they need the shape first.'],
      teach: 'Maxwell = Boltzmann factor per velocity × number of velocities per speed.',
      explain: t`The state of a molecule’s motion is its velocity vector; the speed is a “level” whose degeneracy is the shell area $4\pi v^2$. That degeneracy, rising like $v^2$, is why the distribution vanishes at $v = 0$ even though the Boltzmann factor is largest there.`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'v / vₚ', ylabel: 'relative size', curves: [{ fn: 'e^(-x^2)', domain: [0, 3], color: 'ink3', dash: true, label: 'Boltzmann factor', labelAt: 0.3, labelDx: 8 }, { fn: 'x^2/4', domain: [0, 2.1], color: 'violet', dash: true, label: 'shell area (scaled)', labelAt: 1.9, labelDx: -120 }, { fn: '(4/sqrt(pi))*x^2*e^(-x^2)', domain: [0, 3], color: 'accent', width: 2.6, label: 'D(v) × vₚ', labelAt: 1.5, labelDx: 8, labelDy: -6 }] }, caption: 'The falling Boltzmann factor and the rising shell area multiply to give the Maxwell distribution.' },
    }),
    num({
      id: 'between', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[0, 1], [1, 2], [0.5, 1.5], [1, 1.5]]), v = tailFrac(a) - tailFrac(b);
        return {
          prompt: t`What fraction of the molecules in any ideal gas have speeds between $${a}\,v_p$ and $${b}\,v_p$? (In terms of $u = v/v_p$, $D\,dv = \tfrac{4}{\sqrt\pi}u^2e^{-u^2}du$.)`,
          answer: v, tol: { rel: 0.01 },
          integrand: '(4/sqrt(pi))*x^2*e^(-x^2)', limits: [a, b],
          errors: apart([{ value: (4 / Math.sqrt(Math.PI)) * ((a + b) / 2) ** 2 * Math.exp(-(((a + b) / 2) ** 2)), feedback: 'That is the height of the curve at the middle, not the area. Integrate over the range.' }], v),
          hints: [t`Integrate numerically, or use $\int_u^\infty \tfrac{4}{\sqrt\pi}s^2e^{-s^2}ds = \operatorname{erfc}(u) + \tfrac{2}{\sqrt\pi}ue^{-u^2}$.`, t`Fraction = $F(${a}) - F(${b})$ with $F(u)$ that tail: $F(${a}) = ${fmt(tailFrac(a), 4)}$.`],
          teach: 'Fractions of molecules are areas under D(v); in units of vₚ the answer is the same for every gas at every temperature.',
          explain: t`$F(${a}) - F(${b}) = ${fmt(tailFrac(a), 4)} - ${fmt(tailFrac(b), 4)} = ${fmt(v, 3)}$.`,
          visual: uPic({ from: a, to: b, caption: 'The universal Maxwell curve in units of the most probable speed; the shaded area is the fraction asked for.' }),
        };
      },
    }),
    num({
      id: 'tail', difficulty: 2,
      gen(r) {
        const x = r.pick([1.5, 2, 2.5, 3]), v = tailFrac(x);
        return {
          prompt: t`What fraction of a gas’s molecules move faster than $${x}$ times the most probable speed?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: Math.exp(-x * x), feedback: 'e^(−x²) is the Boltzmann factor alone. The tail fraction is erfc(x) + (2/√π) x e^(−x²).' }, { value: 1 - (tailFrac(x)), feedback: 'That is the fraction slower than this speed.' }], v),
          hints: [t`Fraction above $x\,v_p$: $\operatorname{erfc}(x) + \tfrac{2}{\sqrt\pi}xe^{-x^2}$.`, t`$\operatorname{erfc}(${x}) = ${texNum(tailFrac(x) - (2 / Math.sqrt(Math.PI)) * x * Math.exp(-x * x), 3)}$.`],
          teach: 'The Maxwell tail falls off roughly like x e^(−x²): doubling x shrinks it enormously.',
          explain: t`$\operatorname{erfc}(${x}) + \tfrac{2}{\sqrt\pi}(${x})e^{-${x * x}} = ${texNum(v, 3)}$.`,
          visual: uPic({ from: x, caption: 'The universal Maxwell curve; the shaded tail beyond the given speed is the fraction asked for.' }),
        };
      },
    }),
    mcq({
      id: 'order-speeds', difficulty: 2,
      prompt: t`For a Maxwell distribution, how do $v_p$, $\bar v$ and $v_\text{rms}$ compare?`,
      choices: [t`$v_p < \bar v < v_\text{rms}$, in the ratio $1 : 1.128 : 1.225$`, t`They are equal: the distribution is symmetric about its peak`, t`$v_\text{rms} < \bar v < v_p$, because squaring favours slow molecules`, t`$\bar v < v_p < v_\text{rms}$`],
      answer: 0,
      why: { 1: 'It is not symmetric: the long tail to high speeds pulls the averages above the peak.', 2: 'Squaring weights fast molecules more, so the rms is the largest.', 3: t`The mean is above the peak: $\bar v/v_p = 2/\sqrt\pi \approx 1.128$.` },
      hints: [t`$v_p = \sqrt{2}\sqrt{kT/m}$, $\bar v = \sqrt{8/\pi}\sqrt{kT/m}$, $v_\text{rms} = \sqrt3\sqrt{kT/m}$.`],
      teach: 'The skewed tail puts the mean above the peak, and the rms above the mean.',
      explain: t`$\sqrt2 : \sqrt{8/\pi} : \sqrt3 = 1.414 : 1.596 : 1.732$, or $1 : 1.128 : 1.225$. The rms speed is the one that gives the average kinetic energy, $\tfrac12mv_\text{rms}^2 = \tfrac32kT$.`,
      visual: uPic({ marks: true, caption: 'The universal Maxwell curve with its three characteristic speeds marked.' }),
    }),
    num({
      id: 'moon-lambda', difficulty: 3, transfer: true,
      gen(r) {
        const g = r.pick([['water vapour', 18.015], ['nitrogen', MASS.N2], ['argon', MASS.Ar], ['carbon dioxide', MASS.CO2]]), T = 390, lam = (vEsc('moon') / vMostProbable(g[1], T)) ** 2;
        return {
          prompt: t`The Moon’s escape speed is $${fmt(vEsc('moon') / 1000, 3)}$ km/s and its dayside surface reaches about $390$ K. With no atmosphere above, molecules leave straight from the surface. For ${g[0]} ($${g[1]}$ u), what is the Jeans parameter $\lambda = (v_\text{esc}/v_p)^2$?`,
          answer: lam, tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt(lam), feedback: 'That is v(esc)/vₚ. Square it.' }, { value: (vEsc('moon') / vRms(g[1], T)) ** 2, feedback: 'Use the most probable speed, √(2kT/m).' }], lam),
          hints: [t`$v_p = \sqrt{2kT/m}$ with $m = ${g[1]}\times1.6605\times10^{-27}$ kg.`, t`Equivalently $\lambda = \dfrac{GMm}{kTR}$: gravitational binding over $kT$.`],
          teach: t`The Jeans parameter $\lambda = GMm/kTR$ compares gravitational binding with $kT$; the escape rate falls roughly as $e^{-\lambda}$.`,
          explain: t`$v_p = ${fmt(vMostProbable(g[1], T), 3)}$ m/s, so $\lambda = ${fmt(lam, 3)}$. Put into Jeans’s escape rate, an atmosphere of it would last about ${lam < 20 ? 'a few years' : lam < 30 ? 'tens of thousands of years' : lam < 36 ? 'hundreds of millions of years' : 'longer than the age of the Moon'} against thermal escape alone. ${lam > 30 ? 'Heavy gases are lost another way: sunlight ionizes them and the solar wind sweeps the ions off — the Moon has no magnetic field to stop it.' : 'Light gases simply evaporate.'}`,
          visual: maxwellPic({ gases: [{ m: g[1], T, color: 'accent' }], vmax: 3, vcut: vEsc('moon') / 1000, caption: 'This gas at 390 K against the Moon’s escape speed (orange). The tail beyond it is far too thin to see.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars-h', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([200, 250, 300]), ve = vEsc('mars', 200e3), x = ve / vMostProbable(MASS.H, T), v = tailFrac(x);
        return {
          prompt: t`Mars lost most of its early water, partly as hydrogen escaping from its exobase, about 200 km up, where the escape speed is $${fmt(ve / 1000, 3)}$ km/s. If the exobase is at $${T}$ K, what fraction of hydrogen atoms there move faster than escape speed?`,
          answer: v, tol: { rel: 0.02 },
          errors: apart([{ value: Math.exp(-x * x), feedback: 'Use the full tail fraction, erfc(x) + (2/√π) x e^(−x²); e^(−x²) alone undercounts.' }, { value: tailFrac(ve / vRms(MASS.H, T)), feedback: 'Measure the escape speed in units of the most probable speed √(2kT/m).' }], v),
          hints: [t`$v_p = \sqrt{2kT/m_\text{H}}$, $x = v_\text{esc}/v_p$.`, t`Fraction $= \operatorname{erfc}(x) + \tfrac{2}{\sqrt\pi}xe^{-x^2}$ with $x = ${fmt(x, 3)}$.`],
          teach: 'Escape is set by the tail beyond x = v(esc)/vₚ, which is exquisitely sensitive to temperature.',
          explain: t`$v_p = ${fmt(vMostProbable(MASS.H, T) / 1000, 3)}$ km/s, $x = ${fmt(x, 3)}$, fraction $= ${texNum(v, 3)}$. Compared with Earth’s exobase, Mars is colder but its gravity much weaker — and hydrogen leaves Mars easily. MAVEN measures that loss today.`,
          visual: maxwellPic({ gases: [{ m: MASS.H, T, color: 'accent' }], vmax: 7, vcut: ve / 1000, caption: 'Atomic hydrogen at Mars’s exobase against the escape speed there; the gold tail is the fraction asked for.' }),
        };
      },
    }),
    num({
      id: 'cp-deuterium', difficulty: 3,
      gen(r) {
        const T = r.pick([200, 250, 300]), ve = vEsc('mars', 200e3), xH = ve / vMostProbable(MASS.H, T), xD = ve / vMostProbable(2.014, T), v = Math.exp(lnTail(xD) - lnTail(xH));
        return {
          prompt: t`Deuterium atoms (2.014 u) are twice as heavy as hydrogen atoms. At Mars’s exobase at $${T}$ K (escape speed $${fmt(ve / 1000, 3)}$ km/s), what is the ratio of the fraction of D atoms above escape speed to that of H atoms?`,
          answer: v, tol: { rel: 0.02 },
          errors: apart([{ value: 1 / Math.sqrt(2), feedback: 'Speeds scale as 1/√m, but the tail fraction depends exponentially on (v(esc)/vₚ)².' }, { value: 0.5, feedback: 'The tail is not proportional to 1/m: compute both tails.' }], v),
          hints: [t`$x_D = \sqrt2\,x_H$, with $x_H = ${fmt(xH, 3)}$.`, t`Ratio $= F(x_D)/F(x_H)$ with $F(x) = \operatorname{erfc}(x) + \tfrac{2}{\sqrt\pi}xe^{-x^2}$.`],
          teach: 'Thermal escape is strongly mass-selective, so the heavier isotope is left behind.',
          explain: t`$F(${fmt(xH, 3)}) = ${texNum(tailFrac(xH), 3)}$ and $F(${fmt(xD, 3)}) = ${texNum(tailFrac(xD), 3)}$: ratio $${texNum(v, 3)}$. Hydrogen leaves far faster than deuterium, so the water left behind grows rich in deuterium — Mars’s water today has several times Earth’s D/H ratio. (Real fractionation is gentler than this tail ratio, since the atoms must first diffuse up to the exobase.)`,
          visual: maxwellPic({ gases: [{ m: MASS.H, T, label: 'H', color: 'accent' }, { m: 2.014, T, label: 'D', color: 'violet', at: 1.5 }], vmax: 7, vcut: ve / 1000, caption: 'Hydrogen and deuterium at Mars’s exobase; both tails beyond escape speed are shaded.' }),
        };
      },
    }),
    mcq({
      id: 'cp-equivalent', difficulty: 2,
      prompt: 'Which change multiplies the fraction of a gas faster than a fixed escape speed by the same factor as doubling its temperature?',
      choices: ['Halving the molecular mass', 'Doubling the molecular mass', 'Halving the escape speed', 'Nothing else: temperature acts on the tail in its own way'],
      answer: 0,
      why: { 1: 'Heavier molecules are slower: that shrinks the tail.', 2: t`Halving $v_\text{esc}$ quarters $\lambda = (v_\text{esc}/v_p)^2$; doubling $T$ only halves it.`, 3: t`The tail depends only on $x = v_\text{esc}/v_p = v_\text{esc}\sqrt{m/2kT}$, so $T$ enters only through $m/T$.` },
      hints: [t`The tail fraction depends on $x = v_\text{esc}\sqrt{m/2kT}$ only.`],
      teach: 'Everything about escape depends on m/T (and v(esc)): a light cold gas behaves like a heavy hot one.',
      explain: t`$x^2 = m v_\text{esc}^2/2kT$: doubling $T$ and halving $m$ both halve $x^2$. Helium in Earth’s 1000 K thermosphere has the tail that oxygen would have at 4000 K.`,
      visual: uPic({ from: 2.5, caption: 'In units of the most probable speed every Maxwell gas has the same curve; only where the escape speed falls on it matters.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §6.4', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NASA Planetary Fact Sheets (masses, radii, escape speeds)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    { label: 'Catling & Zahnle, The Planetary Air Leak, Scientific American 300, 36 (2009)', url: 'https://doi.org/10.1038/scientificamerican0509-36' },
    { label: 'NASA MAVEN mission (atmospheric escape from Mars)', url: 'https://science.nasa.gov/mission/maven/' },
  ],
});
