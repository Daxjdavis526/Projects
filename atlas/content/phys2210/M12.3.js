// Stress, strain and elastic moduli: F/A = Y ΔL/L₀ in the elastic range,
// shear and bulk moduli, the yield point, stiffness versus strength, and the
// hoop stress in a pressurised rocket tank.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { G } from './_statics.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);

// typical handbook values: Young's modulus (MPa), yield and ultimate strength (MPa),
// and a hardening slope chosen so the simplified curve reaches its ultimate strength at 10% strain
const MAT = {
  steel: { name: 'structural steel', short: 'steel', Y: 200000, sy: 250, su: 400, color: 'accent' },
  al: { name: 'aluminium alloy 6061-T6', short: 'aluminium', Y: 69000, sy: 276, su: 310, color: 'gold' },
  ti: { name: 'titanium alloy Ti-6Al-4V', short: 'titanium', Y: 114000, sy: 880, su: 950, color: 'violet' },
};
for (const m of Object.values(MAT)) m.H = (m.su - m.sy) / (0.1 - m.sy / m.Y);
const KEYS = ['steel', 'al', 'ti'];
/** σ(ε) in MPa with ε = x per cent: linear, then a straight hardening line, capped at the ultimate strength. */
const sigma = (m, x = 'x') => `min(${m.Y}*${x}/100, ${m.sy} + ${+m.H.toFixed(3)}*(${x}/100 - ${+(m.sy / m.Y).toPrecision(8)}), ${m.su})`;
/** A value chosen by the material switch (0, 1, 2), as one expression of `mat`. */
const pick3 = (a, b, c) => `(${a} + ${-1.5 * a + 2 * b - 0.5 * c}*mat + ${0.5 * a - b + 0.5 * c}*mat^2)`;

// a static stress–strain graph of some materials, with optional marked points
function ssGraph({ keys = ['steel'], xmax = 1, ymax = 1000, points = [], caption, extra = {} }) {
  return {
    type: 'graph',
    params: {
      x: [0, xmax], y: [0, ymax], xlabel: 'strain ΔL/L₀ (%)', ylabel: 'stress F/A (MPa)', aspect: 'wide',
      curves: keys.map((k) => ({ fn: sigma(MAT[k]), color: MAT[k].color, label: MAT[k].short, labelAt: xmax * 0.82, labelDy: -12 })),
      points, ...extra,
    },
    caption: caption ?? 'Simplified stress–strain curves from typical handbook values: a straight elastic line, then yielding. Real curves round off at the yield point.',
  };
}

// a steel bar released from 0.5% strain: its stress there, and the stretch it keeps
const S05 = MAT.steel.sy + MAT.steel.H * (0.005 - MAT.steel.sy / MAT.steel.Y), SET05 = 0.5 - (100 * S05) / MAT.steel.Y;

const EX = { L: 12, d: 0.016, m: 1500 };
EX.A = Math.PI * (EX.d / 2) ** 2;
EX.F = EX.m * G;
EX.s = EX.F / EX.A;
EX.e = EX.s / 200e9;
EX.dL = EX.e * EX.L;

export default lesson({
  id: 'phys2210.M12.3',
  title: 'Stress, strain and elastic moduli',
  minutes: 10, difficulty: 2,
  intro: t`Pull on a steel rod and it stretches — very slightly. To compare materials rather than objects, engineers use the load per unit area, **stress**, and the fractional change in length, **strain**. For small strains they are proportional, and the constant is a property of the material alone, its Young's modulus:

$$\frac{F}{A} = Y\,\frac{\Delta L}{L_0}$$

Steel's $Y$ is about 200 GPa, so a stress of 200 MPa stretches it by just 0.1%. Shear and bulk moduli play the same role for twisting and squeezing. Beyond the **yield strength** the material stops springing back: the deformation becomes permanent.`,
  symbols: [
    { tex: 'F', text: 'the stretching (tension) or squeezing (compression) force, in N, at right angles to the cross-section' },
    { tex: 'A', text: 'the cross-sectional area that carries the force, in m²' },
    { tex: '\\sigma = F/A', text: 'the stress, in pascals (1 Pa = 1 N/m²; 1 MPa = $10^6$ Pa)' },
    { tex: '\\Delta L', text: 'the change in length, in m' },
    { tex: 'L_0', text: 'the original length, in m' },
    { tex: '\\varepsilon = \\Delta L/L_0', text: 'the strain: a pure number, often quoted as a percentage' },
    { tex: 'Y', text: 'Young’s modulus (engineers often write $E$), in Pa: about 200 GPa for steel, 69 GPa for aluminium alloys, 114 GPa for titanium alloys' },
  ],
  why: 'Every structure — a bridge cable, an aircraft’s wing spar, a rocket’s propellant tank — is designed to keep its stresses in the elastic range, with a margin; the moduli say how much it will flex on the way.',
  visual: {
    type: 'graph',
    title: 'Stretch it, then let go',
    lead: t`Stretch a bar of each material with the strain slider: the gold point is its stress. The dashed line shows what happens when you let go — it comes back down along a line as steep as the elastic one.`,
    tasks: [
      'Steel at 0.10% strain: the stress is Y × strain = 200 MPa, and letting go brings it straight back to zero — elastic.',
      'Push steel past its yield point and let go: the dashed line ends at a permanent stretch. It has been plastically deformed.',
      'Switch to aluminium: its line is only a third as steep (69 GPa), yet this alloy yields at a slightly higher stress than structural steel. Titanium is strongest of all.',
    ],
    params: {
      x: [0, 2], y: [0, 1050], xlabel: 'strain ΔL/L₀ (%)', ylabel: 'stress F/A (MPa)', aspect: 'wide',
      alt: 'Stress against strain for three metals, with a point that can be moved along one curve and its unloading line',
      sliders: [{ key: 'e', label: 'Strain $\\Delta L/L_0$', min: 0, max: 2, step: 0.01, value: 0.1, unit: '\\%', explain: 'How much the bar has been stretched, as a percentage of its length.' }],
      choices: [{ key: 'mat', label: 'Material', options: [[0, 'Steel'], [1, 'Aluminium 6061-T6'], [2, 'Titanium Ti-6Al-4V']], value: 0, explain: 'Typical handbook values; real batches vary.' }],
      curves: [
        ...KEYS.map((k, i) => ({ fn: sigma(MAT[k]), color: MAT[k].color, width: 1.2, dash: true, when: `1 - ${i === 0 ? '(1 - mat)*(2 - mat)/2' : i === 1 ? 'mat*(2 - mat)' : 'mat*(mat - 1)/2'}` })),
        ...KEYS.map((k, i) => ({ fn: sigma(MAT[k]), color: MAT[k].color, width: 2.6, when: i === 0 ? '(1 - mat)*(2 - mat)/2' : i === 1 ? 'mat*(2 - mat)' : 'mat*(mat - 1)/2' })),
        ...KEYS.map((k, i) => ({ param: [`e - ${sigma(MAT[k], 'e')}*100*t/${MAT[k].Y}`, `${sigma(MAT[k], 'e')}*(1 - t)`], t: [0, 1], color: 'ink2', width: 1.6, dash: true, when: i === 0 ? '(1 - mat)*(2 - mat)/2' : i === 1 ? 'mat*(2 - mat)' : 'mat*(mat - 1)/2' })),
      ],
      points: KEYS.map((k, i) => ({ x: 'e', y: sigma(MAT[k], 'e'), color: 'gold', r: 6, when: i === 0 ? '(1 - mat)*(2 - mat)/2' : i === 1 ? 'mat*(2 - mat)' : 'mat*(mat - 1)/2' })),
      readouts: [
        { label: 'stress', expr: `min(${pick3(200000, 69000, 114000)}*e/100, ${pick3(MAT.steel.sy, MAT.al.sy, MAT.ti.sy)} + ${pick3(+MAT.steel.H.toFixed(3), +MAT.al.H.toFixed(3), +MAT.ti.H.toFixed(3))}*(e/100 - ${pick3(MAT.steel.sy, MAT.al.sy, MAT.ti.sy)}/${pick3(200000, 69000, 114000)}), ${pick3(MAT.steel.su, MAT.al.su, MAT.ti.su)})`, unit: '\\mathrm{MPa}', digits: 3 },
        { label: 'Young’s modulus $Y$', expr: `${pick3(200, 69, 114)}`, unit: '\\mathrm{GPa}', digits: 3 },
        { label: 'yield strength', expr: `${pick3(MAT.steel.sy, MAT.al.sy, MAT.ti.sy)}`, unit: '\\mathrm{MPa}', digits: 3 },
        { label: 'stretch left after letting go', expr: `(max(0, e - 100*min(${pick3(200000, 69000, 114000)}*e/100, ${pick3(MAT.steel.sy, MAT.al.sy, MAT.ti.sy)} + ${pick3(+MAT.steel.H.toFixed(3), +MAT.al.H.toFixed(3), +MAT.ti.H.toFixed(3))}*(e/100 - ${pick3(MAT.steel.sy, MAT.al.sy, MAT.ti.sy)}/${pick3(200000, 69000, 114000)}), ${pick3(MAT.steel.su, MAT.al.su, MAT.ti.su)})/${pick3(200000, 69000, 114000)}) + 1000000) - 1000000`, unit: '\\%', digits: 3 },
      ],
    },
    caption: 'Simplified curves from typical handbook values: a straight elastic line, then yielding with steady hardening. Real curves round off at yield (mild steel even shows a flat yield plateau), and all three go on to 10–20% strain before breaking — far off this graph.',
  },
  example: {
    prompt: t`A solid steel rod ${EX.L} m long and ${EX.d * 1000} mm in diameter hangs a ${EX.m} kg load. Find the stress in the rod, its strain and how much it stretches. Is it safely elastic? ($Y = 200$ GPa; yield strength 250 MPa.)`,
    visual: ssGraph({ keys: ['steel'], xmax: 0.25, ymax: 300, points: [{ x: +(EX.e * 100).toFixed(5), y: +(EX.s / 1e6).toFixed(3), color: 'gold', label: 'the rod' }], caption: 'Steel’s stress–strain line near the start, with the rod’s working point. Yielding begins at 250 MPa.' }),
    steps: [
      { label: 'Area', text: t`$A = \pi r^2 = \pi(0.008\ \text{m})^2 = ${tex(EX.A)}\ \text{m}^2$. (Use the radius, half the diameter.)` },
      { label: 'Stress', text: t`$\sigma = F/A = \dfrac{(${EX.m})(9.8)}{${tex(EX.A)}} = ${tex(EX.s)}$ Pa $= ${s3(EX.s / 1e6)}$ MPa.` },
      { label: 'Strain', text: t`$\varepsilon = \sigma/Y = \dfrac{${tex(EX.s)}}{2.00\times10^{11}} = ${tex(EX.e)}$, or ${s3(EX.e * 100)}%.` },
      { label: 'Stretch', text: t`$\Delta L = \varepsilon L_0 = (${tex(EX.e)})(${EX.L}\ \text{m}) = ${s3(EX.dL * 1000)}$ mm.` },
      { label: 'Sense check', text: t`${s3(EX.s / 1e6)} MPa is well below the 250 MPa yield strength — a safety factor of about ${s3(250e6 / EX.s)} — so the rod springs back fully when unloaded. A 12 m rod stretching by a few millimetres is typical of steel's stiffness.` },
    ],
    answer: t`$\sigma \approx ${s3(EX.s / 1e6)}$ MPa, $\varepsilon \approx ${tex(EX.e)}$, $\Delta L \approx ${s3(EX.dL * 1000)}$ mm: elastic.`,
  },
  practice: [
    num({
      id: 'stress', difficulty: 1,
      gen(r) {
        const d = r.pick([6, 8, 10, 12]), F = r.pick([2, 3, 5, 8]) * 1000;
        const A = Math.PI * (d / 2000) ** 2, s = F / A;
        return {
          prompt: t`A steel bolt ${d} mm in diameter carries a tension of ${F.toLocaleString('en-US')} N. What is the stress in it, in MPa?`,
          answer: s / 1e6, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: F / (Math.PI * (d / 1000) ** 2) / 1e6, feedback: 'Use the radius, half the diameter: A = π(d/2)².' }, { value: F / (Math.PI * (d / 2000)) / 1e6, feedback: 'Square the radius: A = πr².' }],
          hints: [t`$A = \pi r^2$ with $r = ${d / 2}$ mm $= ${d / 2000}$ m.`, t`$\sigma = F/A$; divide by $10^6$ for MPa.`],
          teach: 'Stress is force per unit cross-sectional area, σ = F/A.',
          explain: t`$A = \pi(${d / 2000})^2 = ${tex(A)}\ \text{m}^2$, so $\sigma = ${F}/${tex(A)} = ${s3(s / 1e6)}$ MPa.`,
          visual: ssGraph({ keys: ['steel'], xmax: 0.3, ymax: 350, caption: 'Structural steel’s stress–strain line near the start; yielding begins at 250 MPa.' }),
        };
      },
    }),
    num({
      id: 'stretch', difficulty: 2,
      gen(r) {
        const k = r.pick(KEYS), M = MAT[k], L = r.pick([1.5, 2, 3]), d = r.pick([5, 6, 8]), F = r.pick([1500, 2000, 3000]);
        const A = Math.PI * (d / 2000) ** 2, dL = (F * L) / (A * M.Y * 1e6);
        return {
          prompt: t`A ${L} m rod of ${M.name} ($Y = ${M.Y / 1000}$ GPa), ${d} mm in diameter, is pulled with a force of ${F.toLocaleString('en-US')} N. By how many millimetres does it stretch?`,
          answer: dL * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ((F * L) / (Math.PI * (d / 1000) ** 2 * M.Y * 1e6)) * 1000, feedback: 'Use the radius, half the diameter, in A = πr².' }],
          hints: [t`Rearrange: $\Delta L = \dfrac{F L_0}{AY}$.`, t`$A = \pi(${d / 2000}\ \text{m})^2$ and $Y = ${M.Y / 1000}\times10^{9}$ Pa.`],
          teach: 'In the elastic range, ΔL = F L₀/(A Y): longer, thinner and less stiff means more stretch.',
          explain: t`$\Delta L = \dfrac{(${F})(${L})}{(${tex(A)})(${M.Y / 1000}\times10^{9})} = ${s3(dL * 1000)}$ mm. The stress, $${s3(F / A / 1e6)}$ MPa, is below the yield strength, so the formula applies.`,
          visual: ssGraph({ keys: [k], xmax: 0.5, ymax: 600, caption: `The stress–strain line of ${M.name} near the start (typical values).` }),
        };
      },
    }),
    mcq({
      id: 'stiff-strong', difficulty: 2,
      prompt: 'Structural steel has Y = 200 GPa and a yield strength of 250 MPa; aluminium alloy 6061-T6 has Y = 69 GPa and a yield strength of 276 MPa. Which statement is right?',
      choices: [
        'Steel is stiffer (it stretches less under the same stress), but this aluminium alloy can carry a slightly higher stress before yielding',
        'Steel is both stiffer and stronger, because it is heavier',
        'Aluminium is stiffer, because its yield strength is higher',
        'Stiffness and strength are the same property, so they cannot differ',
      ],
      answer: 0,
      why: {
        1: 'Steel is stiffer, but stiffness (Y) and strength (the yield stress) are separate properties; here the alloy yields at a higher stress.',
        2: 'Stiffness is Young’s modulus, the slope of the elastic line: 69 GPa is much less stiff than 200 GPa.',
        3: 'Stiffness is the slope of the stress–strain line; strength is how high the line goes before yielding. The graph shows they differ.',
      },
      hints: ['Stiffness is the slope of the elastic line; strength is the stress at which yielding starts.'],
      teach: 'Stiffness (Young’s modulus) and strength (yield stress) are different properties: a material can be strong but flexible, or stiff but weak.',
      explain: 'Steel’s line is about three times steeper, so it is stiffer; the alloy’s line rises higher before bending over, so it is (slightly) stronger. Aircraft use aluminium alloys because they combine good strength with a third of steel’s density.',
      visual: ssGraph({ keys: ['steel', 'al'], xmax: 0.6, ymax: 350, caption: 'Simplified stress–strain curves (typical handbook values). The steep line is steel; the shallow one aluminium 6061-T6.' }),
    }),
    num({
      id: 'modulus', difficulty: 2,
      gen(r) {
        const k = r.pick(KEYS), M = MAT[k], s = r.pick([60, 90, 120, 150]);
        const e = (100 * s) / M.Y;
        return {
          prompt: t`In a tensile test, a specimen of an unknown alloy reaches a stress of ${s} MPa at a strain of ${+e.toPrecision(3)}%, on the straight part of its curve. What is its Young's modulus, in GPa?`,
          answer: s / (e / 100) / 1000, units: 'GPa', tol: { rel: 0.01 },
          errors: [{ value: s / e / 1000, feedback: 'The strain must be a fraction, not a percentage: divide the percentage by 100.' }],
          hints: [t`$Y = \sigma/\varepsilon$ on the straight (elastic) part.`, t`Convert the strain: ${+e.toPrecision(3)}% $= ${+(e / 100).toPrecision(3)}$.`],
          teach: 'Young’s modulus is the slope of the elastic part of the stress–strain curve: Y = σ/ε.',
          explain: t`$Y = \dfrac{${s}\ \text{MPa}}{${+(e / 100).toPrecision(3)}} = ${tex(s / (e / 100), 3)}$ MPa $= ${s3(s / (e / 100) / 1000)}$ GPa — the value for ${M.name}.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, +(e * 2).toPrecision(3)], y: [0, s * 2.1], xlabel: 'strain (%)', ylabel: 'stress (MPa)', aspect: 'wide',
              curves: [{ fn: `${s / e}*x`, domain: [0, +(e * 1.6).toPrecision(3)], color: 'accent' }],
              points: [{ x: +e.toPrecision(4), y: s, color: 'gold', label: `(${+e.toPrecision(3)}%, ${s} MPa)` }],
            },
            caption: 'The straight start of the specimen’s stress–strain curve, with the measured point.',
          },
        };
      },
    }),
    num({
      id: 'bulk', difficulty: 2,
      gen(r) {
        const [where, depth] = r.pick([['the bottom of the Mariana Trench', 10935], ['the floor of the North Atlantic', 4000], ['the depth of the Titanic wreck', 3800], ['6000 m down, the abyssal plain', 6000]]);
        const dp = 1025 * G * depth, frac = dp / 2.2e9;
        return {
          prompt: t`Water's bulk modulus is about $B = 2.2$ GPa. At ${where}, ${depth.toLocaleString('en-US')} m down, the pressure is $\rho g h$ higher than at the surface (sea water: $\rho = 1025\ \text{kg/m}^3$). By what percentage is a sample of water squeezed in volume there?`,
          answer: frac * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: frac, feedback: 'That is the fraction; the question asks for a percentage (× 100).' }],
          hints: [t`Bulk modulus: $\Delta p = -B\,\dfrac{\Delta V}{V_0}$, so $\dfrac{|\Delta V|}{V_0} = \dfrac{\Delta p}{B}$.`, t`$\Delta p = (1025)(9.8)(${depth})$ Pa.`],
          teach: 'The bulk modulus relates a pressure change to a fractional change in volume: |ΔV|/V₀ = Δp/B.',
          explain: t`$\Delta p = ${tex(dp)}$ Pa, so $|\Delta V|/V_0 = ${tex(dp)}/2.2\times10^{9} = ${s3(frac * 100)}$%. Even under a kilometre-scale column of ocean, water is barely compressible.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 10], y: [-12, 0.9], xlabel: '', ylabel: 'height (km)', aspect: 'wide', xticks: 0.001,
              shade: [{ fn: '0', lower: '-11.5', from: 0, to: 10, color: 'teal', alpha: 0.14 }],
              curves: [{ fn: '0', color: 'teal', width: 2 }],
              arrows: [{ from: [5, 0], to: [5, -depth / 1000], color: 'ink2', label: `${depth.toLocaleString('en-US')} m`, labelDx: 10, labelDy: 30 }],
              points: [{ x: 5, y: -depth / 1000, color: 'gold', r: 6, label: 'sample', labelDx: 10 }, { x: 0.3, y: 0.45, r: 0.01, color: 'teal', label: 'sea surface' }],
            },
            caption: 'The water column above the sample (heights in kilometres; not to scale sideways).',
          },
        };
      },
    }),
    mcq({
      id: 'past-yield', difficulty: 2,
      prompt: 'A structural-steel bar is stretched to 0.5% strain — well past its yield strain of 0.125% — and then released. What happens?',
      choices: ['It springs back only partly: it is left permanently longer', 'It springs back to its original length, like any elastic material', 'It keeps stretching after the load is removed', 'It snaps as soon as it passes the yield point'],
      answer: 0,
      why: {
        1: 'Only below the yield point does a metal return fully. Past it, the atomic planes have slipped, and that part of the stretch stays.',
        2: 'Without the load nothing pulls on it; it does not creep onward (at room temperature).',
        3: 'Yielding is not breaking: steel goes on to stretch to about 20% before it fractures.',
      },
      hints: ['When the load comes off, the bar unloads along a line as steep as the elastic one — not back down the curve.'],
      teach: 'Below the yield point deformation is elastic and fully recovered; beyond it part of the deformation is plastic and permanent.',
      explain: t`On unloading, the stress falls along a line with slope $Y$. From $(0.5\%,\ ${s3(S05)}\ \text{MPa})$ that line reaches zero stress at $0.5\% - ${s3(S05)}/200\,000 \times 100\% = ${s3(SET05)}\%$: the bar stays about ${s3(SET05)}% longer than it was.`,
      visual: ssGraph({ keys: ['steel'], xmax: 1, ymax: 400, points: [{ x: 0.5, y: +S05.toFixed(2), color: 'gold', label: 'released here' }], caption: 'Steel’s simplified stress–strain curve; the bar is let go at the gold point.' }),
    }),
    num({
      id: 'shear', difficulty: 2,
      gen(r) {
        const d = r.pick([8, 10, 12]), F = r.pick([4, 6, 8]) * 1000;
        const A = Math.PI * (d / 2000) ** 2, tau = F / A;
        return {
          prompt: t`A bolt ${d} mm in diameter joins two overlapping plates that are pulled apart sideways with ${F.toLocaleString('en-US')} N (single shear: the bolt is loaded across one cross-section). What is the shear stress in the bolt?`,
          answer: tau / 1e6, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: F / (Math.PI * (d / 1000) ** 2) / 1e6, feedback: 'Use the radius: A = π(d/2)².' }, { value: F / (2 * A) / 1e6, feedback: 'In single shear only one cross-section carries the load (double shear would halve it).' }],
          hints: [t`Shear stress is force per area too, but the area is the cross-section **parallel** to the force — here the bolt's circular section.`],
          teach: 'Shear stress is the sideways force per unit area of the section it slides across: F/A, with A parallel to F.',
          explain: t`$\tau = F/A = ${F}/${tex(A)} = ${s3(tau / 1e6)}$ MPa. Structural steel begins to yield in shear at roughly 0.58 × 250 ≈ 145 MPa${tau / 1e6 > 145 ? ', so this bolt would yield: a bigger one is needed' : ', so this bolt holds'}.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3, 3], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              shade: [{ fn: '0.6', lower: '0.05', from: -2.6, to: 1.0, color: 'accent', alpha: 0.3 }, { fn: '-0.05', lower: '-0.6', from: -1.0, to: 2.6, color: 'gold', alpha: 0.3 }, { fn: '1', lower: '-1', from: -0.18, to: 0.18, color: 'ink2', alpha: 0.6 }],
              arrows: [{ from: [-2.2, 0.32], to: [-2.9, 0.32], color: 'bad', label: 'F' }, { from: [2.2, -0.32], to: [2.9, -0.32], color: 'bad', label: 'F' }],
              points: [{ x: 0.25, y: 0, r: 0.01, color: 'ink2', label: 'bolt’s shear plane' }],
            },
            caption: 'Two plates (side view) pulled in opposite directions, joined by one bolt; the bolt is sheared across the plane between them.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-stretch', difficulty: 2,
      gen(r) {
        const k = r.pick(['al', 'ti']), M = MAT[k], L = r.pick([0.8, 1.2]), d = r.pick([4, 6]), F = r.pick([1000, 1500]);
        const A = Math.PI * (d / 2000) ** 2, dL = (F * L) / (A * M.Y * 1e6);
        return {
          prompt: t`A ${L} m wire of ${M.name} ($Y = ${M.Y / 1000}$ GPa), ${d} mm in diameter, carries ${F.toLocaleString('en-US')} N. How much does it stretch, in mm?`,
          answer: dL * 1000, units: 'mm', tol: { rel: 0.01 },
          hints: [t`$\Delta L = FL_0/(AY)$.`],
          teach: 'ΔL = F L₀/(A Y) in the elastic range.',
          explain: t`$\Delta L = \dfrac{(${F})(${L})}{(${tex(A)})(${M.Y / 1000}\times10^9)} = ${s3(dL * 1000)}$ mm.`,
          visual: ssGraph({ keys: [k], xmax: 1, ymax: 1000, caption: `${M.name[0].toUpperCase() + M.name.slice(1)}: simplified stress–strain curve (typical values).` }),
        };
      },
    }),
    mcq({
      id: 'cp-thicker', difficulty: 2,
      prompt: 'Two wires of the same material and length carry the same load. One has twice the diameter of the other. The thicker wire stretches:',
      choices: ['A quarter as much', 'Half as much', 'The same amount: same material, same load', 'Twice as much'],
      answer: 0,
      why: {
        1: 'Doubling the diameter doubles the radius, and the area goes as the radius squared: four times the area.',
        2: 'Same material means the same Y, but the stress — load over area — is four times smaller in the thick wire.',
        3: 'A thicker wire is stiffer, not more stretchy.',
      },
      hints: [t`$\Delta L = FL_0/(AY)$. What happens to $A$ when the diameter doubles?`],
      teach: 'Stretch is inversely proportional to cross-sectional area, which grows as the square of the diameter.',
      explain: t`$A = \pi d^2/4$ quadruples, so the stress and the strain — and $\Delta L$ — drop to a quarter.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2, 2], y: [-1.2, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          curves: [{ param: ['-1 + 0.25cos(t)', '0.25sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['1 + 0.5cos(t)', '0.5sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 }],
          shade: [{ fn: 'sqrt(max(0, 0.0625 - (x + 1)^2))', lower: '-sqrt(max(0, 0.0625 - (x + 1)^2))', from: -1.25, to: -0.75, color: 'accent', alpha: 0.35 }, { fn: 'sqrt(max(0, 0.25 - (x - 1)^2))', lower: '-sqrt(max(0, 0.25 - (x - 1)^2))', from: 0.5, to: 1.5, color: 'gold', alpha: 0.35 }],
          points: [{ x: -1, y: -0.45, r: 0.01, color: 'accent', label: 'd', labelDx: -4 }, { x: 1, y: -0.75, r: 0.01, color: 'gold', label: '2d', labelDx: -8 }],
        },
        caption: 'The two wires’ cross-sections, to scale.',
      },
    }),
    num({
      id: 'cp-tank', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([2.5, 3.0, 3.5]), R = r.pick([1.5, 1.8, 2.1]), tw = r.pick([4, 5, 6]);
        const s = (p * 1e5 * R) / (tw / 1000);
        return {
          prompt: t`A rocket's propellant tank is an aluminium cylinder of radius ${R} m with walls ${tw} mm thick, pressurised to ${p} bar above the outside ($1\ \text{bar} = 10^5$ Pa). Cut the tank lengthwise in half: the pressure pushing the halves apart, $p\,(2R\,\ell)$ for a length $\ell$, is held by the two cut walls, $2\sigma t\ell$. What is the hoop stress $\sigma$ in the wall?`,
          answer: s / 1e6, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: (p * 1e5 * R) / (2 * (tw / 1000)) / 1e6, feedback: t`Balance $p(2R\ell) = 2\sigma t\ell$: the 2s cancel, leaving $\sigma = pR/t$.` }, { value: (p * 1e5 * 2 * R) / (tw / 1000) / 1e6, feedback: t`Use the radius, not the diameter: $\sigma = pR/t$.` }],
          hints: [
            t`Set the two forces equal: $p(2R\ell) = 2\sigma t\ell$, so $\sigma = pR/t$.`,
            t`Units: $p = ${p}\times10^5$ Pa, $R = ${R}$ m, $t = ${tw / 1000}$ m.`,
          ],
          teach: 'Equilibrium of half a pressurised cylinder gives its wall the hoop stress σ = pR/t — the reason big tanks need thick walls or high-strength alloys.',
          explain: t`$\sigma = \dfrac{pR}{t} = \dfrac{(${p}\times10^5)(${R})}{${tw / 1000}} = ${s3(s / 1e6)}$ MPa. Aerospace aluminium–lithium alloys yield at roughly 500 MPa, so the tank has a comfortable margin — and the pressure also stiffens the tank against the loads of flight.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3, 3], y: [-1.8, 1.8], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              curves: [{ param: ['1.3cos(t)', '1.3sin(t)'], t: [0, 3.1416], color: 'ink2', width: 5 }, { param: ['t', '0'], t: [-1.6, 1.6], color: 'ink3', width: 1, dash: true }],
              arrows: [
                ...[0.4, 0.8, 1.2, 1.57, 1.94, 2.34, 2.74].map((a) => ({ from: [+(0.6 * Math.cos(a)).toFixed(3), +(0.6 * Math.sin(a)).toFixed(3)], to: [+(1.1 * Math.cos(a)).toFixed(3), +(1.1 * Math.sin(a)).toFixed(3)], color: 'warn' })),
                { from: [1.3, 0], to: [1.3, -0.7], color: 'bad', label: 'σt' }, { from: [-1.3, 0], to: [-1.3, -0.7], color: 'bad', label: 'σt' },
              ],
              points: [{ x: 0, y: 0.25, r: 0.01, color: 'warn', label: 'pressure p', labelDx: -30 }],
            },
            caption: 'The top half of the tank’s cross-section: the gas pressure (orange) pushes it up; the wall’s tension at the two cuts (red) holds it down. Not to scale.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §12.3 Stress, Strain, and Elastic Modulus', url: 'https://openstax.org/books/university-physics-volume-1/pages/12-3-stress-strain-and-elastic-modulus' },
    { label: 'ASM Aerospace Specification Metals: 6061-T6 and Ti-6Al-4V data sheets', url: 'https://asm.matweb.com/' },
  ],
});
