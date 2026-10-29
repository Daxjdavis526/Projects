// Linearization and dimensionless groups — choosing what to plot: turning a
// model into a straight line whose slope or intercept is the quantity you
// want, carrying the error bars through the transformation (and with them
// the weights), and using dimensionless groups to check a model's regime
// (the Reynolds number for Stokes drag) and to linearize away a nuisance
// (the wall correction as a function of r/R, extrapolated to r/R → 0). A
// falling-ball viscometer in glycerol throughout; Kepler's third law for
// Jupiter's moons as the transfer. Dimensional analysis itself is
// research.R4.2; this lesson is its use at the bench.
// Every number is computed here from seeded synthetic data (_labf.js).
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { normals, linfit, dataGraph, resGraph, r6, sf, SIMNOTE, table } from './_labf.js';

const t = String.raw;
const g = 9.80, RHOF = 1261, ETA = 1.41, RHOS = 7800, RT = 25.0;   // m/s², kg/m³ (glycerol), Pa s, kg/m³ (steel), mm (tube radius)
const faxen = (k) => 1 - 2.104 * k + 2.09 * k ** 3 - 0.95 * k ** 5;
const vStokes = (r, eta = ETA, rs = RHOS) => (2 * (rs - RHOF) * g * r * r) / (9 * eta);   // r in m

// ── the worked example: six steel spheres, 1 % timing scatter (seed 31) ──
const RR = [0.50, 0.75, 1.00, 1.25, 1.50, 1.75];                  // mm
const VV = (() => { const z = normals(31); return RR.map((r) => +(1000 * vStokes(r / 1000) * faxen(r / RT) * (1 + 0.01 * z())).toFixed(3)); })();   // mm/s
const YY = RR.map((r, i) => (VV[i] / 1000) / ((RHOS - RHOF) * g * (r / 1000) ** 2));   // (m/s)/(N/m³ · m²) = 1/(Pa s)
const SY = YY.map((y) => 0.01 * y);
const KK = RR.map((r) => r / RT);
const FW = linfit(KK, YY, SY);
const ETAw = 2 / (9 * FW.a), sETAw = (2 / 9) * FW.sa / FW.a ** 2;
const NAIVE = linfit(RR.map((r) => (r / 1000) ** 2), VV.map((v) => v / 1000));   // v against r², ignoring the wall
const ETAn = (2 * (RHOS - RHOF) * g) / (9 * NAIVE.b);

// ── the code exercise: glass spheres in the same tube (seed 47) ──
const RHOG = 2500;
const CR = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0];
const CV = (() => { const z = normals(47); return CR.map((r) => +(1000 * vStokes(r / 1000, ETA, RHOG) * faxen(r / RT) * (1 + 0.01 * z())).toFixed(3)); })();
const CY = CR.map((r, i) => (CV[i] / 1000) / ((RHOG - RHOF) * g * (r / 1000) ** 2));
const CF = linfit(CR.map((r) => r / RT), CY, CY.map((y) => 0.01 * y));
const CETA = 2 / (9 * CF.a);

export default lesson({
  id: 'lab.A10.2',
  title: 'Linearization and dimensionless groups',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`A straight line is the one curve your eye judges well and a fit handles exactly, so you **choose the axes** to make the model straight, with the quantity you want as its slope or intercept. A sphere of radius $r$ settling through a viscous liquid reaches Stokes’s terminal speed

$$v = \frac{2\,\Delta\rho\,g\,r^2}{9\,\eta}$$

— a straight line in $v$ against $\Delta\rho\,g\,r^2$, with slope $2/(9\eta)$. Two dimensionless groups tell you when to trust it: the **Reynolds number** $\text{Re} = \rho_f v\,2r/\eta$ must be small (Stokes’s law is the $\text{Re} \to 0$ limit), and the ratio $r/R$ of sphere to tube must be small too, or the walls slow the sphere. Plotting against a dimensionless group can even remove such a nuisance: extrapolate to $r/R = 0$. Every transformation of $y$ transforms its **error bars**, and with them the weights.`,
  symbols: [
    { tex: 'v', text: 'the sphere’s terminal speed, in m/s, from its time to fall between two marks' },
    { tex: '\\Delta\\rho', text: 'the sphere’s density minus the liquid’s, in kg/m³ (buoyancy is included)' },
    { tex: 'g', text: 'the gravitational acceleration, 9.80 m/s²' },
    { tex: 'r', text: 'the sphere’s radius, in m' },
    { tex: '\\eta', text: 'the liquid’s viscosity, in Pa s — the quantity sought' },
    { tex: '\\text{Re},\\ \\rho_f', text: 'the Reynolds number, a ratio of inertial to viscous forces, and the liquid’s density' },
    { tex: 'R', text: 'the inner radius of the tube the sphere falls through' },
  ],
  why: t`Every slope in an E-experiment lesson is a linearization — $1/r$ against $I$, $1/E'$ against $1 - \cos\theta$, $\ln(M_\infty - M)$ against $\tau$ — and dimensionless groups say which model applies before you trust its slope.`,
  visual: {
    type: 'graph',
    title: 'The same data on two sets of axes',
    lead: t`Six steel spheres in glycerol in a tube of radius 25 mm. The blue points are the measured speeds divided by $\Delta\rho\,g\,r^2$, against $r/R$. Stokes’s law alone predicts the dashed flat line; the walls slow larger spheres. The slider sets the viscosity you assume; the gold line is the wall-corrected prediction.`,
    tasks: [
      'Find the viscosity that puts the gold line through the points: about 1.41 Pa s.',
      'Notice how far the points fall below the dashed line at r/R = 0.07: a 15 % wall effect on a sphere only 3.5 mm across.',
      'The intercept at r/R = 0 is 2/(9η) whatever the wall correction’s exact form — the reason to plot against the dimensionless ratio.',
    ],
    params: {
      aspect: 'wide', x: [0, 0.09], y: [0.10, 0.17], xlabel: 'r / R', ylabel: 'v / (Δρ g r²)  (1/(Pa s))', axesAt: 'edge',
      sliders: [{ key: 'eta', label: 'Assumed viscosity $\\eta$', min: 1.2, max: 1.6, step: 0.01, value: 1.30, unit: '\\mathrm{Pa\\,s}', explain: 'The viscosity the prediction uses: Stokes gives v/(Δρ g r²) = 2/(9η) for a sphere in an unbounded liquid.' }],
      curves: [{ fn: '2/(9*eta)', color: 'ink3', dash: [6, 4] }, { fn: '2/(9*eta)*(1 - 2.104*x + 2.09*x^3 - 0.95*x^5)', color: 'gold', width: 2 }],
      points: KK.map((k, i) => ({ x: r6(k), y: r6(YY[i]), r: 4, color: 'accent' })),
    },
    caption: t`Synthetic data: Stokes speeds for $\eta = 1.41$ Pa s (glycerol near 20 °C) times Faxén’s wall correction $1 - 2.104(r/R) + 2.09(r/R)^3 - 0.95(r/R)^5$, with 1 % timing scatter. Faxén’s series holds for a sphere on the tube’s axis at small $r/R$. ${SIMNOTE}`,
  },
  example: {
    prompt: t`Steel spheres ($\rho_s = 7800\ \text{kg/m}^3$) fall through glycerol ($\rho_f = 1261\ \text{kg/m}^3$) in a tube of radius $R = 25.0$ mm. Terminal speeds, each to 1 %:

${table([[t`r\ (\text{mm})`, ...RR.map((r) => r.toFixed(2))], [t`v\ (\text{mm/s})`, ...VV.map((v) => v.toFixed(2))]])}

Find $\eta$, and check the Reynolds number.`,
    visual: { type: 'graph', params: dataGraph({ xs: KK.map(r6), ys: YY.map(r6), sy: SY.map(r6), fit: FW, xlabel: 'r / R', ylabel: 'v / (Δρ g r²)  (1/(Pa s))', x: [0, 0.09], y: [0.10, 0.17], extra: { hlines: [{ y: r6(FW.a), color: 'ink3' }] } }), caption: t`The data against the dimensionless $r/R$, with the weighted line; its intercept is $2/(9\eta)$. ${SIMNOTE}` },
    steps: [
      { label: 'The naive line', text: t`Plotting $v$ against $r^2$ and fitting a line gives a slope that implies $\eta = ${ETAn.toFixed(2)}$ Pa s — too high, because larger spheres are slowed by the walls and the line is not really straight.` },
      { label: 'Choose the group', text: t`Divide out the Stokes dependence: $y = v/(\Delta\rho\,g\,r^2)$ should be the constant $2/(9\eta)$, times a wall factor that depends only on $r/R$. At $r = 1.00$ mm: $y = ${(VV[2] / 1000).toFixed(5)}/(6539 \times 9.80 \times 10^{-6})$ $= ${YY[2].toFixed(4)}\ (\text{Pa s})^{-1}$.` },
      { label: 'Error bars', text: t`A 1 % error in $v$ is a 1 % error in $y$ (the radii are taken as exact): $\sigma_y = 0.01\,y$.` },
      { label: 'Fit', text: t`For small $r/R$ the wall factor is close to linear, $1 - 2.104\,r/R$. The weighted line gives intercept $a = ${FW.a.toFixed(4)} \pm ${FW.sa.toFixed(4)}$ and slope $${FW.b.toFixed(3)}$; the ratio $b/a = ${(FW.b / FW.a).toFixed(2)}$ is close to Faxén’s $-2.104$.` },
      { label: 'Viscosity', text: t`$\eta = 2/(9a) = ${ETAw.toFixed(3)} \pm ${sETAw.toFixed(3)}$ Pa s — glycerol near 20 °C is about 1.41 Pa s (and changes by about 8 % per kelvin, so the bath temperature matters more than the fit).` },
      { label: 'Regime check', text: t`For the largest sphere, $\text{Re} = \rho_f v\,2r/\eta$ $= 1261 \times ${(VV[5] / 1000).toFixed(4)} \times 0.0035/${ETAw.toFixed(2)} = ${((RHOF * VV[5] / 1000 * 0.0035) / ETAw).toFixed(3)}$. Oseen’s first inertial correction to the drag, $3\text{Re}/16$, is then $${(100 * 3 * ((RHOF * VV[5] / 1000 * 0.0035) / ETAw) / 16).toFixed(1)}\,\%$ — comparable to the timing scatter for the largest sphere, negligible for the small ones that pin the intercept.` },
    ],
    answer: t`$\eta = ${ETAw.toFixed(3)} \pm ${sETAw.toFixed(3)}$ Pa s from the intercept at $r/R = 0$; the naive $v$-against-$r^2$ line gives $${ETAn.toFixed(2)}$ Pa s because it ignores the walls.`,
  },
  practice: [
    match({
      id: 'which-axes', difficulty: 2,
      prompt: t`Match each model to the axes that make it a straight line.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 4], y: [0, 4], xlabel: 'X', ylabel: 'Y', axesAt: 'edge', curves: [{ fn: '0.4 + 0.85*x', color: 'gold' }] }, caption: 'The goal in every case: a straight line Y = A + B X whose slope or intercept carries the physics.' },
      left: [t`Arrhenius: $k = A\,e^{-E/k_BT}$`, t`Kepler: $T^2 \propto a^3$`, t`Orifice flow: $Q = C\sqrt{\Delta p}$`, t`Rocket equation: $\Delta v = v_e\ln(m_0/m_f)$`],
      right: ['ln k against 1/T', 'log T against log a', 'Q against √Δp', 'Δv against ln(m₀/m_f)', 'k against T'],
      answer: [0, 1, 2, 3],
      hints: ['Exponentials straighten with a logarithm of y; power laws with logarithms of both.', 'A square root on one side straightens when you plot against the square root itself.'],
      teach: 'Logs straighten exponentials (semi-log) and power laws (log–log); a known function of x can be the x-axis itself.',
      explain: t`$\ln k = \ln A - (E/k_B)(1/T)$: slope $-E/k_B$. $\log T = \tfrac32\log a + \text{const}$: slope 1.5. $Q$ against $\sqrt{\Delta p}$: slope $C$. $\Delta v$ against $\ln(m_0/m_f)$: slope $v_e$, the exhaust speed.`,
    }),
    num({
      id: 'eta-slope', difficulty: 2,
      gen(r) {
        const eta = r.float(0.8, 2.5, 0.01), rs = r.pick([7800, 2500, 1140]);
        const b = (2 / (9 * eta));
        const bb = +b.toPrecision(4);
        const ans = 2 / (9 * bb);
        return {
          prompt: t`A fit of terminal speed $v$ against $\Delta\rho\,g\,r^2$ (all SI) gives slope $${bb}\ (\text{Pa s})^{-1}$. What is the liquid’s viscosity?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 0.3], y: [0, r6(0.32 * bb)], xlabel: 'Δρ g r² (N/m)', ylabel: 'v (m/s)', axesAt: 'edge', curves: [{ fn: `${bb}*x`, color: 'gold' }] }, caption: 'The fitted line through the origin.' },
          answer: ans, units: 'Pa s', tol: { rel: 0.003 },
          errors: [{ value: 1 / bb, feedback: 'Stokes: the slope is 2/(9η), not 1/η.' }, { value: (9 * bb) / 2, feedback: 'Inverted: η = 2/(9 × slope).' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$v = \dfrac{2}{9\eta}\,(\Delta\rho\,g\,r^2)$.`],
          teach: 'Linearize so the wanted quantity is a simple function of the slope.',
          explain: t`$\eta = 2/(9 \times ${bb}) = ${ans.toFixed(3)}$ Pa s.`,
        };
      },
    }),
    num({
      id: 'reynolds', difficulty: 2,
      gen(r) {
        const [liq, rho, eta] = r.pick([['glycerol', 1261, 1.41], ['castor oil', 961, 0.99], ['corn syrup', 1380, 4.0], ['light oil', 870, 0.08]]);
        const rr = r.pick([1, 2, 3, 5]), v = r.pick([5, 10, 20, 40, 80]);
        const ans = (rho * v / 1000 * 2 * rr / 1000) / eta;
        return {
          prompt: t`A sphere of radius ${rr} mm falls at ${v} mm/s through ${liq} ($\rho_f = ${rho}\ \text{kg/m}^3$, $\eta = ${eta}$ Pa s). What is its Reynolds number $\rho_f v\,(2r)/\eta$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-4, 1], y: [0, 1.2], xlabel: 'log₁₀ Re', ylabel: '', yticks: 0, axesAt: 'edge', shade: [{ fn: '1', from: -4, to: -1, color: 'good', alpha: 0.25 }], vlines: [{ x: -1, color: 'warn', label: 'Stokes good to ~1 % below' }] }, caption: 'Where Stokes drag can be trusted: Re well below about 0.1.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: 'The length in Re is the diameter, 2r.' }, { value: ans * 1e3, feedback: 'Convert mm and mm/s to m and m/s.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Use SI: $v$ in m/s, $2r$ in m.`],
          teach: 'A dimensionless group checks a model’s regime: Stokes drag needs Re ≪ 1.',
          explain: t`$\text{Re} = ${rho} \times ${v / 1000} \times ${(2 * rr) / 1000}/${eta} = ${tex(ans, 3)}$. ${ans < 0.1 ? 'Well inside the Stokes regime.' : ans < 1 ? 'Borderline: inertial corrections of a few per cent (Oseen’s 3Re/16) are needed.' : 'Far outside Stokes’s law: the drag is no longer linear in v, and the line will curve.'}`,
        };
      },
    }),
    num({
      id: 'log-bar', difficulty: 2,
      gen(r) {
        const kind = r.pick(['ln', 'sq', 'inv']);
        const y = r.float(2, 50, 0.1), s = +(y * r.float(0.01, 0.06, 0.001)).toFixed(3);
        const ans = kind === 'ln' ? s / y : kind === 'sq' ? 2 * y * s : s / (y * y);
        const what = kind === 'ln' ? t`\ln y` : kind === 'sq' ? t`y^2` : t`1/y`;
        return {
          prompt: t`A reading is $y = ${y} \pm ${s}$. You plot $${what}$ instead. What error bar does that point get?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1.2 * y], y: kind === 'ln' ? [0, r6(Math.log(1.3 * y))] : kind === 'sq' ? [0, r6(1.5 * y * y)] : [0, r6(3 / y)], xlabel: 'y', ylabel: kind === 'ln' ? 'ln y' : kind === 'sq' ? 'y²' : '1/y', axesAt: 'edge', curves: [{ fn: kind === 'ln' ? 'ln(x)' : kind === 'sq' ? 'x^2' : '1/x', color: 'accent', domain: [0.05 * y, 1.2 * y] }], vlines: [{ x: y, color: 'gold' }] }, caption: 'The transformation: its slope at your reading stretches or shrinks the error bar.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: s, feedback: 'A transformation changes the error bar: multiply σ by the derivative of the transformation.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_{f(y)} = |f'(y)|\,\sigma_y$.`],
          teach: t`Error bars transform with the derivative: $\sigma_f = |f'(y)|\,\sigma_y$ — so a linearized fit needs new weights.`,
          explain: t`$\sigma = ${kind === 'ln' ? t`\sigma_y/y = ${s}/${y}` : kind === 'sq' ? t`2y\sigma_y = 2 \times ${y} \times ${s}` : t`\sigma_y/y^2 = ${s}/${y}^2`} = ${tex(ans, 3)}$. Equal error bars in $y$ become unequal after the transformation: weight the linearized fit accordingly.`,
        };
      },
    }),
    num({
      id: 'wall', difficulty: 2,
      gen(r) {
        const rr = r.pick([1, 1.5, 2, 3, 4]), R = r.pick([15, 20, 25, 30]);
        const k = rr / R, ans = faxen(k);
        return {
          prompt: t`By Faxén’s correction, $v/v_{\text{Stokes}} = 1 - 2.104\,k + 2.09\,k^3 - 0.95\,k^5$ with $k = r/R$. A ${2 * rr} mm sphere falls down the axis of a tube ${2 * R} mm across. What fraction of its Stokes speed does it reach?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 0.3], y: [0.3, 1.05], xlabel: 'r / R', ylabel: 'v / v(Stokes)', axesAt: 'edge', curves: [{ fn: '1 - 2.104*x + 2.09*x^3 - 0.95*x^5', color: 'accent' }], vlines: [{ x: r6(k), color: 'gold' }] }, caption: 'Faxén’s wall correction for a sphere on the axis of a long tube.' },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: 1 - 2.104 * (2 * rr) / (2 * R) * 2, feedback: 'k is the ratio of radii (or of diameters) — not diameter over radius.' }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`$k = ${rr}/${R} = ${k.toFixed(4)}$.`],
          teach: 'A correction that depends only on a dimensionless ratio can be measured, plotted and extrapolated away.',
          explain: t`$k = ${k.toFixed(4)}$, so the factor is $${ans.toFixed(4)}$: the sphere is ${(100 * (1 - ans)).toFixed(1)} % slower than in an unbounded liquid — an error far bigger than any timing uncertainty, if ignored.`,
        };
      },
    }),
    mcq({
      id: 'dimensionless', difficulty: 2,
      prompt: t`Which combination is dimensionless?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1], y: [0, 1], axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', points: [{ x: 0.08, y: 0.75, r: 0, label: 'ρ: kg m⁻³    v: m s⁻¹    r: m' }, { x: 0.08, y: 0.45, r: 0, label: 'η: Pa s = kg m⁻¹ s⁻¹    g: m s⁻²' }] }, caption: 'The dimensions of the quantities involved.' },
      choices: [t`$\rho\,v\,r/\eta$`, t`$\eta\,v/(\rho\,g\,r)$`, t`$\rho\,g\,r^2/\eta$`, t`$\eta/(\rho\,r)$`],
      answer: 0,
      why: {
        1: t`$\eta v/(\rho g r)$ has dimensions of $(\text{kg m}^{-1}\text{s}^{-1})(\text{m s}^{-1})/(\text{kg m}^{-3}\cdot\text{m s}^{-2}\cdot\text{m})$ = m — a length (multiply by $1/r$ to fix it).`,
        2: t`$\rho g r^2/\eta$ has dimensions of a speed: it is, up to $2/9$, Stokes’s terminal velocity.`,
        3: t`$\eta/(\rho r)$ has dimensions m/s: a viscous velocity scale.`,
      },
      hints: ['Write each in kg, m, s and cancel.'],
      teach: 'A dimensionless group has all its units cancel; Re = ρvL/η is the most famous.',
      explain: t`$\rho v r/\eta$: $(\text{kg m}^{-3})(\text{m s}^{-1})(\text{m})/(\text{kg m}^{-1}\text{s}^{-1}) = 1$ — the Reynolds number (with the radius as the length; with the diameter, twice it).`,
    }),
    code({
      id: 'glass', difficulty: 3,
      prompt: t`Glass spheres ($\rho_s = 2500\ \text{kg/m}^3$) in the same glycerol and tube ($R = 25.0$ mm). Make \`k\` $= r/R$ and \`y\` $= v/(\Delta\rho\,g\,r^2)$ in SI, fit a weighted line (each \`y\` known to 1 %) with \`np.polyfit(k, y, 1, w=1/sy)\`, and set \`eta\` $= 2/(9\times\text{intercept})$.`,
      starter: t`import numpy as np

r = np.array([${CR.join(', ')}]) * 1e-3          # m
v = np.array([${CV.join(', ')}]) * 1e-3   # m/s
rho_s, rho_f, g, R = 2500, 1261, 9.80, 25.0e-3

# your code: k, y, sy, the fit, eta
eta = 0.0
print(f"eta = {eta:.3f} Pa s")`,
      answer: t`import numpy as np

r = np.array([${CR.join(', ')}]) * 1e-3          # m
v = np.array([${CV.join(', ')}]) * 1e-3   # m/s
rho_s, rho_f, g, R = 2500, 1261, 9.80, 25.0e-3

k = r / R
y = v / ((rho_s - rho_f) * g * r**2)
sy = 0.01 * y
slope, intercept = np.polyfit(k, y, 1, w=1/sy)
eta = 2 / (9 * intercept)
print(f"eta = {eta:.3f} Pa s")`,
      tests: [
        { name: t`$y$ divides out the Stokes dependence (checked for the first sphere)`, code: `abs(y[0] - ${CY[0]}) < 1e-9` },
        { name: t`$\eta$ from the intercept matches the reference fit, $${CETA.toFixed(4)}$ Pa s`, code: `abs(eta - ${CETA}) < 1e-6` },
      ],
      hints: [t`\`k = r / R\`; \`y = v / ((rho_s - rho_f) * g * r**2)\`; \`sy = 0.01 * y\`.`, t`\`slope, intercept = np.polyfit(k, y, 1, w=1/sy)\` (NumPy’s \`w\` is $1/\sigma$); \`eta = 2/(9*intercept)\`.`],
      teach: 'Divide out the known dependence, plot against the dimensionless nuisance, and extrapolate it to zero.',
      explain: t`$\eta = ${CETA.toFixed(3)}$ Pa s, consistent with the steel spheres — a check that the result does not depend on the sphere material, as Stokes’s law says it should not. The slope over the intercept, $${(CF.b / CF.a).toFixed(2)}$, is near Faxén’s $-2.104$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-jupiter', difficulty: 3, transfer: true,
      gen(r) {
        const [name, M] = r.pick([['Jupiter', 1.898e27], ['Saturn', 5.683e26], ['Uranus', 8.681e25]]);
        const G = 6.6743e-11;
        const b0 = +Math.log10(2 * Math.PI / Math.sqrt(G * M)).toFixed(4);
        const ans = (2 * Math.PI / 10 ** b0) ** 2 / G;
        return {
          prompt: t`For ${name}’s moons, a straight-line fit of $\log_{10}T$ against $\log_{10}a$ (period in s, orbit radius in m) has slope $1.500$ and intercept $${b0}$. Since $T = 2\pi\sqrt{a^3/(GM)}$, what mass does that give the planet, in kg? ($G = 6.674\times10^{-11}$ SI.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [8, 10], y: [r6(1.5 * 8 + b0), r6(1.5 * 10 + b0)], xlabel: 'log₁₀ a (m)', ylabel: 'log₁₀ T (s)', axesAt: 'edge', curves: [{ fn: `1.5*x + ${b0}`, color: 'gold' }] }, caption: 'Kepler’s third law as a straight line on log–log axes.' },
          answer: ans, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.PI / b0) ** 2 / G, feedback: 'The intercept is a logarithm: undo it with 10 to that power.' }, { value: 2 * Math.PI / 10 ** b0 / G, feedback: t`$10^{b_0} = 2\pi/\sqrt{GM}$: square before dividing by $G$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\log_{10}T = 1.5\log_{10}a + \log_{10}\bigl(2\pi/\sqrt{GM}\bigr)$.`, t`$GM = (2\pi/10^{b_0})^2$.`],
          teach: 'On log–log axes a power law’s exponent is the slope and its constant hides in the intercept — here a planet’s mass.',
          explain: t`$10^{${b0}} = ${tex(10 ** b0, 4)}$, so $GM = ${tex((2 * Math.PI / 10 ** b0) ** 2, 4)}$ and $M = ${tex(ans, 4)}$ kg — ${name}’s mass. A slope fixed at 1.5 by theory and an intercept fitted: that is how planetary masses were weighed before spacecraft flew by.`,
        };
      },
    }),
    mcq({
      id: 'cp-weights', difficulty: 3,
      prompt: t`Readings of a decaying voltage all have the same uncertainty, $\pm 0.02$ V, and fall from 5 V to 0.2 V. You fit $\ln V$ against $t$. How should the points be weighted?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 35], y: [-2, 2], xlabel: 't (s)', ylabel: 'ln(V / 1 V)', axesAt: 'edge', curves: [{ fn: 'ln(5) - x/10', color: 'gold' }, ...[0, 5, 10, 15, 20, 25, 30].flatMap((x) => { const V = 5 * Math.exp(-x / 10), s = 0.02 / V; return [{ param: [`${x}`, `${r6(Math.log(V) - s)} + ${r6(2 * s)}*t`], t: [0, 1], color: 'accent', width: 1.4 }]; })], points: [0, 5, 10, 15, 20, 25, 30].map((x) => ({ x, y: r6(Math.log(5) - x / 10), r: 3.5, color: 'accent' })) }, caption: 'The same ±0.02 V on every reading, drawn on the log scale.' },
      choices: ['Weight each by V²/σ², since σ of ln V is σ/V: the late, small readings get much less weight', 'Equally, since every V has the same uncertainty', 'By V/σ', 'Drop the weights and drop the late points instead'],
      answer: 0,
      why: {
        1: 'Equal σ in V becomes unequal σ in ln V: at 0.2 V the bar is 25 times that at 5 V.',
        2: 'Weights are 1/σ², and σ of ln V is σ/V, so the weight is V²/σ².',
        3: 'Dropping data throws information away; correct weights use all of it as it deserves.',
      },
      hints: [t`$\sigma_{\ln V} = \sigma_V/V$, and a weight is $1/\sigma^2$.`, 'Look at the error bars in the picture.'],
      teach: 'After a transformation, re-derive each point’s σ and weight by 1/σ² — or fit the untransformed model directly.',
      explain: t`$w = 1/\sigma_{\ln V}^2 = V^2/\sigma_V^2$. An unweighted fit of $\ln V$ trusts the noisy tail as much as the clean start and gets a biased, noisier $\tau$; better still is a nonlinear fit of $V$ itself (see [nonlinear fits](#/lesson/lab.A5.3) and [the curve_fit traps](#/lesson/lab.A12.1)).`,
    }),
    mcq({
      id: 'cp-collapse', difficulty: 2,
      prompt: t`You drop steel, glass and nylon spheres of several sizes into one liquid (small spheres, far from the walls). Which plot puts **all** of them on one straight line through the origin?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 5], y: [0, 5], xlabel: 'r (mm)', ylabel: 'v (scaled)', axesAt: 'edge', points: [...[1, 2, 3].map((x) => ({ x, y: 0.5 * x * x * 0.8, r: 4, color: 'accent' })), ...[1, 2, 3, 4].map((x) => ({ x, y: 0.5 * x * x * 0.2, r: 4, color: 'violet' })), ...[1, 2, 3, 4].map((x) => ({ x, y: 0.5 * x * x * 0.03, r: 4, color: 'warn' }))] }, caption: 'Speed against radius for three materials: three different curves. Schematic.' },
      choices: [t`$v$ against $\Delta\rho\,r^2$`, t`$v$ against $r^2$`, t`$v$ against $\rho_s r^2$`, t`$\log v$ against $\log r$`],
      answer: 0,
      why: {
        1: 'v against r² is straight for each material but with a different slope for each Δρ.',
        2: 'The driving force is the density difference, not the sphere’s density: nylon (≈1140 kg/m³) is barely denser than an oil such as castor oil (961 kg/m³) — and in glycerol (1261 kg/m³) it would float.',
        3: 'On log–log axes the three are parallel lines (slope 2), not one line.',
      },
      hints: [t`Which variables does $v = 2\Delta\rho g r^2/(9\eta)$ contain besides the liquid’s properties?`],
      teach: 'Plot against the full combination the model predicts and different runs collapse onto one line.',
      explain: t`$v = \bigl(2g/9\eta\bigr)\,\Delta\rho\,r^2$: with $\Delta\rho\,r^2$ on the x-axis every sphere obeys the same line. A collapse like this tests the model across materials as well as sizes.`,
    }),
  ],
  sources: [
    { label: 'H. Faxén (1922); see J. Happel & H. Brenner, Low Reynolds Number Hydrodynamics (Martinus Nijhoff, 1983), §7-4: a sphere on the axis of a cylinder', url: 'https://doi.org/10.1007/978-94-009-8352-6' },
    { label: 'J. R. Taylor, An Introduction to Error Analysis, 2nd ed., ch. 8: linearization and weights', url: 'https://uscibooks.aip.org/books/introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-2nd-edition/' },
    { label: 'N.-S. Cheng, Formula for the viscosity of a glycerol–water mixture, Ind. Eng. Chem. Res. 47, 3285 (2008)', url: 'https://doi.org/10.1021/ie071349z' },
  ],
});
