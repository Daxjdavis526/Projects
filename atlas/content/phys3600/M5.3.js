// Linear dielectrics (Griffiths §4.4): P = ε₀χ_eE, D = εE, ε_r = 1 + χ_e;
// bound charge only at surfaces and beside free charge (ρ_b = −χ_e/(1+χ_e)
// ρ_f); a point charge screened by a liquid; the dielectric sphere in a
// uniform field solved with M4.4's Legendre series (E inside = 3E₀/(ε_r+2),
// against the slab's E₀/ε_r); a capacitor partly filled in series; field
// lines refracting at an interface (tan θ₂/tan θ₁ = ε₂/ε₁); the field in a
// flat void. Transfer: a capacitance level gauge in a cryogenic propellant
// tank. The intro treatment (κ, capacitors) is phys2220.E5.4.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { fieldPic } from './_toolkit.js';
import { EPS0, PI, DEG, sf, circle, polygon, bare } from './_mag.js';

const t = String.raw;
// dielectric constants (room temperature unless noted): the em-capacitor sim's table, and cryogens near their boiling points
const SOLIDS = [['Teflon', 'teflon', 2.1], ['Mylar', 'mylar', 3.2], ['paper', 'paper', 3.7], ['Pyrex glass', 'pyrex', 5.6]];
const CRYO = [['liquid oxygen', 1.49], ['liquid hydrogen', 1.23], ['liquid methane', 1.68]];

/** E (units E₀, along +y) in and around a dielectric sphere (R = 1) of relative permittivity er. */
const sphereE = (er) => (x, y) => {
  const r2 = x * x + y * y, K = (er - 1) / (er + 2);
  if (r2 < 1) return [0, 3 / (er + 2)];
  const r5 = r2 ** 2.5;
  return [(3 * K * x * y) / r5, 1 + (K * (3 * y * y - r2)) / r5];
};
/** A static picture of that field (graph arrows, lengths compressed). */
function spherePicXY(er, caption) {
  const F = sphereE(er);
  return fieldPic((x, y) => F(x, y)[0], (x, y) => F(x, y)[1], { x: [-2.6, 2.6], y: [-1.25, 1.25], n: 19, skip: (x, y) => Math.abs(Math.hypot(x, y) - 1) < 0.09, curves: [circle(1, 'teal')], caption, axes: false, grid: false, xlabel: '', ylabel: '' });
}

const IN = 'step(1 - (x^2 + y^2))', OUT = 'step((x^2 + y^2) - 1)', R2 = '(x^2 + y^2)', K = '((er - 1)/(er + 2))';

/** A capacitor drawn edge-on, plates at y = ±1, with a slab filling y < yTop (series arrangement). */
function seriesPic(frac, kappa, caption) {
  const yTop = -1 + 2 * frac, Ea = 1 / (1 - frac + frac / kappa);
  const col = (x, y0, y1, L) => ({ from: [x, (y0 + y1) / 2 - L / 2], to: [x, (y0 + y1) / 2 + L / 2], color: 'violet', width: 2 });
  const xs = [-1.6, -0.8, 0, 0.8, 1.6];
  return {
    type: 'graph',
    params: bare([-2.6, 2.6], [-1.3, 1.3], {
      shade: [{ fn: `${yTop}`, lower: '-1', from: -2.1, to: 2.1, color: 'teal', alpha: 0.25 }],
      curves: [{ fn: '1', domain: [-2.2, 2.2], color: 'warn', width: 4 }, { fn: '-1', domain: [-2.2, 2.2], color: 'accent', width: 4 }, { fn: `${yTop}`, domain: [-2.1, 2.1], color: 'teal', width: 1.5 }],
      arrows: [...xs.map((x) => col(x, 1, yTop, Math.min(0.9 * (1 - yTop), 0.5 * Ea))), ...xs.map((x) => col(x, yTop, -1, Math.min(0.9 * (yTop + 1), (0.5 * Ea) / kappa)))].map((a) => ({ ...a, from: a.to, to: a.from })),
      points: [{ x: 2.2, y: 1, r: 0, label: '+', labelDx: 6, labelDy: 0, color: 'warn' }, { x: 2.2, y: -1, r: 0, label: '−', labelDx: 6, labelDy: 0, color: 'accent' }, { x: -2.55, y: (yTop - 1) / 2, r: 0, label: 'slab', labelDx: 0, labelDy: 0, color: 'teal' }, { x: -2.55, y: (yTop + 1) / 2, r: 0, label: 'air', labelDx: 0, labelDy: 0, color: 'ink2' }],
    }),
    caption,
  };
}

export default lesson({
  id: 'phys3600.M5.3',
  title: 'Linear dielectrics',
  minutes: 18, difficulty: 3,
  equation: t`\vec P = \varepsilon_0\chi_e\vec E, \qquad \vec D = \varepsilon\vec E, \qquad \varepsilon = \varepsilon_0(1 + \chi_e) = \varepsilon_0\varepsilon_r`,
  intro: t`For most materials in fields that are not too strong, the polarization is simply **proportional** to the total field: $\vec P = \varepsilon_0\chi_e\vec E$. Then $\vec D = \varepsilon\vec E$, and two facts follow. Inside a uniform linear material, $\rho_b = -\dfrac{\chi_e}{1 + \chi_e}\rho_f$: **bound charge appears only on surfaces and right next to free charge**, so Laplace’s equation still holds wherever there is no free charge. And at a boundary between linear materials, with no free charge, $\varepsilon_1E_{1\perp} = \varepsilon_2E_{2\perp}$ while $E_\parallel$ is continuous. So every method of M4 — Legendre series included — carries over with one new boundary condition. The headline “the field is reduced by $\varepsilon_r$” is true only when the dielectric fills the whole region between equipotentials; the shape of the material matters everywhere else.`,
  symbols: [
    { tex: '\\chi_e', text: 'the electric susceptibility: how readily the material polarizes (a pure number; 0 for vacuum)' },
    { tex: '\\varepsilon', text: t`the permittivity of the material, in F/m (C²/N·m²)` },
    { tex: '\\varepsilon_r', text: t`the relative permittivity or dielectric constant, $\varepsilon/\varepsilon_0 = 1 + \chi_e$ (the $\kappa$ of Physics II)` },
    { tex: '\\vec P,\\ \\vec D,\\ \\vec E', text: t`polarization and displacement (C/m²) and the total electric field (V/m)` },
  ],
  why: t`Capacitors, cable insulation, radomes and capacitive propellant gauges are all linear-dielectric problems — and the sphere in a uniform field is the model behind the Clausius–Mossotti relation that ties $\varepsilon_r$ to atomic polarizability.`,
  visual: {
    type: 'field2d',
    title: 'A dielectric sphere in a uniform field',
    lead: t`A sphere of linear dielectric (the gold circle) in a field that is uniform far away, pointing up the page. The tracer dots flow along the field lines; violet curves are equipotentials. Slide $\varepsilon_r$ and switch between $\vec E$ and $\vec D$.`,
    tasks: [
      t`$\vec E$ inside is uniform and **weaker** than outside, but only by $3/(\varepsilon_r + 2)$, not $1/\varepsilon_r$: at $\varepsilon_r = 4$, half the outside field, not a quarter. Some $\vec E$ lines end on the bound charge at the surface.`,
      t`Switch to $\vec D$: its lines never end (no free charge) and **crowd into** the sphere — $D$ inside is $3\varepsilon_r/(\varepsilon_r + 2)$ of the outside value. A dielectric draws in $\vec D$ the way a lens draws in light.`,
      t`Push $\varepsilon_r$ to 100: the inside field nearly vanishes and the outside equipotentials meet the surface almost at right angles — the conducting sphere of [M4.4](#/lesson/phys3600.M4.4). Set $\varepsilon_r = 1$: the sphere disappears.`,
    ],
    params: {
      P: `${OUT}*3*${K}*x*y/${R2}^2.5`,
      Q: `${IN}*(3/(er + 2))*(1 + f*(er - 1)) + ${OUT}*(1 + ${K}*(3*y^2 - ${R2})/${R2}^2.5)`,
      potential: `${IN}*(-3*y/(er + 2)) + ${OUT}*(-y + ${K}*y/${R2}^1.5)`,
      x: [-2.5, 2.5], y: [-2.5, 2.5], density: 17, probe: false, readout: false,
      loop: { r: 1, c: [0, 0] },
      sliders: [{ key: 'er', label: t`Relative permittivity $\varepsilon_r$`, min: 1, max: 100, step: 0.1, value: 4, logScale: true, explain: 'About 2 for plastics, 4 to 6 for glasses, 80 for water.' }],
      choices: [{ key: 'f', label: 'Show', options: [[0, t`$\vec E$`], [1, t`$\vec D$`]], value: 0, explain: 'The total electric field, or the displacement εE.' }],
    },
    caption: t`Exact solution in a slice through the sphere’s centre; field far away $E_0$ upward. Arrow lengths are compressed. The equipotentials belong to $\vec E$. A real sphere in a real lab field also feels the walls; here the field is uniform to infinity.`,
  },
  example: {
    prompt: t`A Pyrex sphere ($\varepsilon_r = 5.6$) of radius $R$ sits in a uniform field $E_0 = 50$ kV/m. Find the field inside it, its polarization and the field just outside at its poles.`,
    visual: spherePicXY(5.6, t`The sphere’s field for $\varepsilon_r = 5.6$, computed from the solution below (lengths compressed; colour shows strength). Inside it is uniform and weak; outside, the applied field plus a dipole.`),
    steps: [
      { label: 'General solution', text: t`No free charge anywhere, so $V$ obeys Laplace’s equation inside and out (M4.4): $V_{\text{in}} = \sum A_lr^lP_l(\cos\theta)$, finite at the centre; $V_{\text{out}} = -E_0r\cos\theta + \sum \dfrac{B_l}{r^{l+1}}P_l(\cos\theta)$, the applied field plus terms that die away.` },
      { label: 'Boundary conditions', text: t`At $r = R$: $V$ is continuous, and $D_\perp$ is continuous (no free charge): $\varepsilon\,\partial_rV_{\text{in}} = \varepsilon_0\,\partial_rV_{\text{out}}$.` },
      { label: 'Only l = 1 survives', text: t`For $l \ne 1$ the two conditions force $A_l = B_l = 0$. For $l = 1$: $A_1R = -E_0R + B_1/R^2$ and $\varepsilon_rA_1 = -E_0 - 2B_1/R^3$. Solving, $A_1 = -\dfrac{3E_0}{\varepsilon_r + 2}$ and $B_1 = \dfrac{\varepsilon_r - 1}{\varepsilon_r + 2}E_0R^3$.` },
      { label: 'Inside', text: t`$V_{\text{in}} = A_1z$, so $\vec E = \dfrac{3}{\varepsilon_r + 2}\vec E_0 = \dfrac{3(50)}{7.6} \approx ${nice(sf(150 / 7.6, 3))}$ kV/m, uniform. Then $P = \varepsilon_0(\varepsilon_r - 1)E \approx ${nice(sf(EPS0 * 4.6 * (150 / 7.6) * 1e3 * 1e6, 3))}\ \mu\text{C/m}^2$, so $\sigma_b = P\cos\theta$.` },
      { label: 'At the poles', text: t`$D_\perp$ is continuous: $E_{\text{out}} = \varepsilon_rE_{\text{in}} \approx ${nice(sf((5.6 * 150) / 7.6, 3))}$ kV/m at the poles. At the equator $E_\parallel$ is continuous: $E_{\text{out}} = E_{\text{in}}$ there.` },
      { label: 'Sense check', text: t`$\varepsilon_r = 1$ gives $E_0$ (no sphere); $\varepsilon_r \to \infty$ gives 0 inside and $3E_0$ at the poles — the conducting sphere of M4.4. A slab across the field would give $E_0/\varepsilon_r \approx ${nice(sf(50 / 5.6, 3))}$ kV/m: shape matters.` },
    ],
    answer: t`Inside $E = 3E_0/(\varepsilon_r + 2) \approx ${nice(sf(150 / 7.6, 3))}$ kV/m, uniform; $P \approx ${nice(sf(EPS0 * 4.6 * (150 / 7.6) * 1e9, 3))}\ \mu\text{C/m}^2$; at the poles just outside $\approx ${nice(sf((5.6 * 150) / 7.6, 3))}$ kV/m.`,
  },
  practice: [
    num({
      id: 'sigma-b-cap', difficulty: 2,
      gen(r) {
        const [name, key, k] = r.pick(SOLIDS), V = r.pick([50, 100, 200]), d = r.pick([0.1, 0.2, 0.5]);
        const E = V / (d * 1e-3), P = EPS0 * (k - 1) * E;
        return {
          prompt: t`A capacitor with a ${d} mm gap is filled with ${name} ($\varepsilon_r = ${k}$) and held at ${V} V by a battery. What is the bound surface charge density on the faces of the ${name}?`,
          visual: { type: 'em-capacitor', params: { A: 0.01, d: d * 1e-3, V, material: key, f: 1, connected: true, controls: [], readouts: [], hide: ['Q'] }, caption: 'The filled capacitor: free charge on the plates, bound charge on the slab’s faces. Fringing ignored; gap not to scale.' },
          answer: P * 1e6, units: 'uC/m^2', tol: { rel: 0.01 },
          errors: [
            { value: EPS0 * k * E * 1e6, feedback: t`$\varepsilon_0\varepsilon_rE$ is $D$, the free charge on the plates. The bound charge is $P = \varepsilon_0\chi_eE$, with $\chi_e = \varepsilon_r - 1$.` },
            { value: EPS0 * E * 1e6, feedback: t`$\varepsilon_0E$ is the charge an empty capacitor would hold at this voltage. Use $\chi_e = \varepsilon_r - 1$.` },
          ],
          hints: [t`With the battery fixing $V$ and the slab filling the gap, $E = V/d$.`, t`$\sigma_b = P = \varepsilon_0\chi_eE = \varepsilon_0(\varepsilon_r - 1)V/d$.`],
          teach: t`In a linear dielectric $P = \varepsilon_0\chi_eE$ with $\chi_e = \varepsilon_r - 1$; on a face perpendicular to the field, $\sigma_b = P$.`,
          explain: t`$E = ${tex(E, 3)}$ V/m, so $\sigma_b = \varepsilon_0(${k} - 1)E \approx ${nice(sf(P * 1e6, 3))}\ \mu\text{C/m}^2$ — a fraction $\chi_e/\varepsilon_r = ${nice(sf((k - 1) / k, 3))}$ of the free charge on the plates, opposite in sign to the plate it faces.`,
        };
      },
    }),
    num({
      id: 'screened', difficulty: 3,
      gen(r) {
        const [name, k] = r.pick([['transformer oil', 2.2], ['silicone oil', 2.7], ['castor oil', 4.7]]), Q = r.pick([5, 10, 20]);
        const qb = (-Q * (k - 1)) / k;
        return {
          prompt: t`A small metal ball carrying $+${Q}$ nC is immersed in a large bath of ${name} ($\varepsilon_r = ${k}$). How much bound charge collects in the oil against the ball’s surface?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '1.25', lower: '-1.25', from: -2.6, to: 2.6, color: 'teal', alpha: 0.12 }, { fn: 'sqrt(max(0.16 - x^2, 0))', lower: '-sqrt(max(0.16 - x^2, 0))', from: -0.4, to: 0.4, color: 'ink3', alpha: 0.7 }], curves: [circle(0.4, 'warn')], points: [...Array.from({ length: 12 }, (_, j) => ({ x: 0.55 * Math.cos((j * PI) / 6), y: 0.55 * Math.sin((j * PI) / 6), r: 0, label: '−', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'accent' })), { x: 0, y: 0, r: 0, label: `+${Q} nC`, labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'warn' }, { x: 1.4, y: 0.9, r: 0, label: name, labelDx: 0, color: 'teal' }] }), caption: t`The charged ball in the oil (teal), with the layer of bound charge gathered against it (blue). Not to scale.` },
          answer: qb, units: 'nC', tol: { rel: 0.01 },
          errors: [{ value: -Q * (k - 1), feedback: t`$\chi_e$ alone overcounts. Gauss for $\vec D$ gives $E = Q/4\pi\varepsilon r^2$, so the net charge seen from outside is $Q/\varepsilon_r$; the bound part is $Q/\varepsilon_r - Q$.` }, { value: Q / k, feedback: t`$Q/\varepsilon_r$ is the **net** charge the field “sees” (free plus bound). The bound charge alone is $Q/\varepsilon_r - Q$.` }],
          hints: [t`Gauss for $\vec D$: $D = \dfrac{Q}{4\pi r^2}$, so $E = \dfrac{Q}{4\pi\varepsilon_0\varepsilon_r r^2}$ — the field of a net charge $Q/\varepsilon_r$.`, t`Net charge = free + bound, so $q_b = Q/\varepsilon_r - Q = -Q\,\dfrac{\varepsilon_r - 1}{\varepsilon_r}$.`],
          teach: 'A free charge in a linear dielectric gathers bound charge −Q χₑ/(1 + χₑ) round itself, so its field is screened by εᵣ.',
          explain: t`$q_b = -${Q}\times\dfrac{${k} - 1}{${k}} \approx ${nice(sf(qb, 3))}$ nC. The ball and its sheath act as a net charge of $${nice(sf(Q / k, 3))}$ nC: that is the whole meaning of “the field is reduced by $\varepsilon_r$” — which, for a liquid wrapped right round the charge, is exact.`,
        };
      },
    }),
    num({
      id: 'sphere-in', difficulty: 2,
      gen(r) {
        const [name, , k] = r.pick(SOLIDS), E0 = r.pick([10, 50, 100]);
        const Ein = (3 * E0) / (k + 2);
        return {
          prompt: t`A sphere of ${name} ($\varepsilon_r = ${k}$) is placed in a uniform field of ${E0} kV/m. How strong is the field inside it?`,
          visual: spherePicXY(k, t`A dielectric sphere of $\varepsilon_r = ${k}$ in a uniform field pointing up (lengths compressed; colour shows strength).`),
          answer: Ein, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: E0 / k, feedback: t`$E_0/\varepsilon_r$ holds for a slab across the field (or a dielectric filling all space). For a sphere the bound charge is spread round the curve: $3E_0/(\varepsilon_r + 2)$.` }, { value: E0, feedback: 'The sphere’s bound charge makes a field of its own inside it, opposing E₀.' }],
          hints: [t`From the worked example: $E_{\text{in}} = \dfrac{3}{\varepsilon_r + 2}E_0$.`, t`$\dfrac{3}{${k} + 2} = ${nice(sf(3 / (k + 2), 4))}$.`],
          teach: 'A dielectric sphere reduces the field inside it by 3/(εᵣ + 2) — less than a slab across the field would.',
          explain: t`$E_{\text{in}} = \dfrac{3(${E0})}{${k} + 2} \approx ${nice(sf(Ein, 3))}$ kV/m, uniform. A slab across the field would give $${nice(sf(E0 / k, 3))}$ kV/m.`,
        };
      },
    }),
    num({
      id: 'series', difficulty: 3,
      gen(r) {
        const [name, , k] = r.pick(SOLIDS), d = r.pick([2, 3]), tt = r.pick([1, 1.5]), V = r.pick([100, 300, 500]);
        const Ea = V / ((d - tt + tt / k) * 1e-3);
        return {
          prompt: t`A parallel-plate capacitor has a ${d} mm gap and is held at ${V} V. A ${tt} mm slab of ${name} ($\varepsilon_r = ${k}$) lies flat on the lower plate; the rest of the gap is air. What is the field in the air?`,
          visual: seriesPic(tt / d, k, t`The capacitor edge-on: plates (orange $+$, blue $-$), the slab (teal) and the field (violet), drawn to show the ratio between the layers, not their sizes. Fringing ignored.`),
          answer: Ea / 1e3, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: V / (d * 1e-3) / 1e3, feedback: 'V/d would hold for a uniform gap. With the slab, the field differs between the layers.' }, { value: V / ((d - tt) * 1e-3) / 1e3, feedback: 'The slab still takes some of the voltage: its field is the air field divided by εᵣ, not zero.' }],
          hints: [t`$D$ is the same in both layers (a pillbox through the slab’s face holds no free charge), so $E_{\text{slab}} = E_{\text{air}}/\varepsilon_r$.`, t`$V = E_{\text{air}}(d - t) + \dfrac{E_{\text{air}}}{\varepsilon_r}t$.`],
          teach: 'In layers stacked across the field, D is the same in each, so the field is largest in the layer with the smallest εᵣ.',
          explain: t`$E_{\text{air}} = \dfrac{V}{(d - t) + t/\varepsilon_r} = \dfrac{${V}}{(${d - tt} + ${tt}/${k})\times10^{-3}} \approx ${nice(sf(Ea / 1e3, 3))}$ kV/m — **more** than the $${nice(sf(V / d, 3))}$ kV/m of the empty gap. Partly filling a gap concentrates the field in what is left.`,
        };
      },
    }),
    num({
      id: 'refraction', difficulty: 3,
      gen(r) {
        const [name, , k] = r.pick(SOLIDS), th1 = r.pick([10, 20, 30, 40]);
        const th2 = Math.atan(k * Math.tan(th1 * DEG)) / DEG;
        const L = 1.1, a1 = th1 * DEG;
        return {
          prompt: t`A field line in air meets the flat surface of a block of ${name} ($\varepsilon_r = ${k}$) at ${th1}° from the normal. There is no free charge on the surface. At what angle from the normal does it continue inside the block?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '0', lower: '-1.25', from: -2.6, to: 2.6, color: 'teal', alpha: 0.2 }], curves: [{ fn: '0', domain: [-2.6, 2.6], color: 'teal', width: 2 }, { param: ['0', 't'], t: [-1.2, 1.2], color: 'ink3', dash: [4, 4], width: 1.2 }], arrows: [{ from: [-L * Math.sin(a1), L * Math.cos(a1)], to: [0, 0], color: 'accent', width: 2.6, label: `${th1}°`, labelDx: -46, labelDy: -40 }], points: [{ x: 1.3, y: 0.9, r: 0, label: 'air', labelDx: 0, color: 'ink2' }, { x: 1.3, y: -0.9, r: 0, label: name, labelDx: 0, color: 'teal' }] }), caption: 'The field line arriving (blue) and the normal (dashed). Its path inside the block is left for you.' },
          answer: th2, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: Math.atan(Math.tan(th1 * DEG) / k) / DEG, feedback: t`Inverted: $E_\parallel$ is continuous while $E_\perp$ **drops** by $\varepsilon_r$ inside, so the line tilts **away** from the normal: $\tan\theta_2 = \varepsilon_r\tan\theta_1$.` }],
          hints: [t`$E_\parallel$ is continuous; $\varepsilon_0E_{1\perp} = \varepsilon E_{2\perp}$.`, t`$\tan\theta = E_\parallel/E_\perp$, so $\tan\theta_2 = \varepsilon_r\tan\theta_1$.`],
          teach: 'At a boundary with no free charge, field lines refract by tan θ₂/tan θ₁ = ε₂/ε₁ — bending away from the normal on entering the denser dielectric, the opposite of light.',
          explain: t`$\tan\theta_2 = ${k}\tan ${th1}° \approx ${nice(sf(k * Math.tan(th1 * DEG), 4))}$, so $\theta_2 \approx ${nice(sf(th2, 3))}°$. Inside, the normal part of $\vec E$ is cut by $\varepsilon_r$ while the tangential part survives, so the field turns toward the surface.`,
        };
      },
    }),
    mcq({
      id: 'rho-zero', difficulty: 2,
      prompt: t`A slab of uniform linear dielectric fills the gap of a charged capacitor. Where is the bound charge?`,
      visual: { type: 'em-capacitor', params: { A: 0.01, d: 2e-3, V: 12, material: 'paper', f: 1, connected: true, controls: [], readouts: [], show: { values: false } }, caption: 'The capacitor filled with paper. The picture marks charge on the plates and on the slab’s faces — is that all?' },
      choices: [
        t`Only on the slab’s two faces: inside a uniform linear dielectric with no free charge, $\rho_b = 0$`,
        t`Spread through the slab, since $\vec P \ne 0$ everywhere inside it`,
        'On the faces and spread through the slab equally',
        'Nowhere: bound charges cancel in a linear material',
      ],
      answer: 0,
      why: {
        1: t`Charge inside comes from $\nabla\cdot\vec P$, not $\vec P$. Here $\nabla\cdot\vec P = \chi_e\varepsilon_0\nabla\cdot\vec E = \tfrac{\chi_e}{1 + \chi_e}\rho_f = 0$.`,
        2: t`Inside, every dipole’s head meets the next one’s tail; nothing is left over except at the faces.`,
        3: 'They cancel in total, not locally: the faces carry equal and opposite layers, and their field is what weakens E.',
      },
      hints: [t`$\rho_b = -\nabla\cdot\vec P$ with $\vec P = \varepsilon_0\chi_e\vec E$, and $\nabla\cdot\vec D = \rho_f$.`],
      teach: t`In a uniform linear dielectric, bound charge lives only on surfaces and next to free charge: $\rho_b = -\chi_e\rho_f/(1 + \chi_e)$.`,
      explain: t`$\rho_b = -\nabla\cdot(\varepsilon_0\chi_e\vec E) = -\dfrac{\chi_e}{1 + \chi_e}\nabla\cdot\vec D = -\dfrac{\chi_e}{1 + \chi_e}\rho_f$, which is zero wherever there is no free charge. That is why Laplace’s equation — and the whole of M4 — still works inside linear dielectrics.`,
    }),
    mcq({
      id: 'error-sphere', difficulty: 3, kind: 'error',
      prompt: t`A student says: “A dielectric reduces the field by $\varepsilon_r$, so inside a water droplet ($\varepsilon_r = 80$) in a thundercloud field $E_0$, the field is $E_0/80$.” What is wrong?`,
      visual: spherePicXY(80, t`A sphere of $\varepsilon_r = 80$ in a uniform field (lengths compressed). The field inside is weak, and the field lines bend toward the surface.`),
      choices: [
        t`$E_0/\varepsilon_r$ is for a slab across the field. A sphere gives $3E_0/(\varepsilon_r + 2) = E_0/27.3$, about three times stronger`,
        t`Nothing: a dielectric always reduces the field by $\varepsilon_r$`,
        t`Inside the droplet the field is zero, as in a conductor`,
        t`The field inside is $\varepsilon_rE_0$, since $D$ is continuous`,
      ],
      answer: 0,
      why: {
        1: t`The factor $\varepsilon_r$ holds only when the dielectric fills the space between equipotentials. A sphere’s bound charge is spread round its surface and cancels less of the field.`,
        2: t`At $\varepsilon_r = 80$ the field is small but not zero: $3E_0/82$. Only $\varepsilon_r \to \infty$ makes a conductor.`,
        3: t`$D_\perp$ is continuous across the surface, but that gives $\varepsilon_rE_{\text{in}} = E_{\text{out}}$ at the poles — a weaker field inside, not a stronger one.`,
      },
      hints: [t`Which geometry does “divide by $\varepsilon_r$” come from?`, t`Solve the sphere as in the worked example: $E_{\text{in}} = 3E_0/(\varepsilon_r + 2)$.`],
      teach: 'Shape matters: “divide by εᵣ” is the result for a filled capacitor, not a rule for every body.',
      explain: t`$3/(80 + 2) \approx ${nice(sf(3 / 82, 3))}$, so $E_{\text{in}} \approx E_0/${nice(sf(82 / 3, 3))}$, nearly three times the student’s value. Just outside the poles the field is $3\varepsilon_rE_0/(\varepsilon_r + 2) \approx ${nice(sf(240 / 82, 3))}E_0$ — which is why water droplets can trigger discharges in clouds.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gauge', difficulty: 3, transfer: true,
      gen(r) {
        const [name, k] = r.pick(CRYO), frac = r.pick([0.25, 0.4, 0.6, 0.85]), L = 2.0, a = 6e-3, b = 10e-3;
        const C0 = (2 * PI * EPS0 * L) / Math.log(b / a), C = +(C0 * (1 + (k - 1) * frac) * 1e12).toFixed(1);
        const C0p = +(C0 * 1e12).toFixed(1), h = ((C / C0p - 1) / (k - 1)) * L * 100;
        return {
          prompt: t`A capacitance gauge measures the propellant level in a rocket tank: a 2.0 m metal rod of radius 6.0 mm inside a coaxial tube of inner radius 10.0 mm, open so the liquid fills the gap to the same level as the tank. Empty, the gauge reads ${C0p} pF. Filled partway with ${name} ($\varepsilon_r \approx ${k}$), it reads ${C} pF. How deep is the liquid? (Treat the vapour above it as vacuum.)`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: `${-1.1 + 2.2 * frac}`, lower: '-1.1', from: -0.6, to: 0.6, color: 'accent', alpha: 0.3 }], curves: [{ param: ['-0.6', 't'], t: [-1.1, 1.1], color: 'ink2', width: 3 }, { param: ['0.6', 't'], t: [-1.1, 1.1], color: 'ink2', width: 3 }, { param: ['0', 't'], t: [-1.1, 1.1], color: 'warn', width: 5 }, { fn: `${-1.1 + 2.2 * frac}`, domain: [-0.6, 0.6], color: 'accent', width: 1.5 }], points: [{ x: 0.75, y: -1.1 + 1.1 * frac, r: 0, label: name, labelDx: 6, color: 'accent' }, { x: 0.75, y: 0.3 + 0.5 * frac, r: 0, label: 'vapour', labelDx: 6, color: 'ink3' }, { x: -0.75, y: 0.9, r: 0, label: 'outer tube', labelDx: -78, color: 'ink2' }, { x: 0.08, y: 1.05, r: 0, label: 'rod', labelDx: 6, color: 'warn' }] }), caption: 'The gauge cut along its axis: a central rod (orange) inside a tube (grey), with liquid (blue) filling the gap to the tank’s level. Radii exaggerated; the level drawn is not the answer.' },
          answer: h, units: 'cm', tol: { rel: 0.02 },
          errors: [{ value: ((C / C0p - 1) / k) * L * 100, feedback: t`The filled part adds capacitance in proportion to $\varepsilon_r - 1$, not $\varepsilon_r$: $C = C_0\left[1 + (\varepsilon_r - 1)h/L\right]$.` }, { value: (C / C0p - 1) * L * 100, feedback: t`Divide by $\varepsilon_r - 1$: each metre of liquid adds $(\varepsilon_r - 1)C_0/L$.` }],
          hints: [t`The wetted part and the dry part are two coaxial capacitors **in parallel**, with $C \propto \varepsilon$ for each length.`, t`$C = C_0\left[\dfrac{L - h}{L} + \varepsilon_r\dfrac hL\right] = C_0\left[1 + (\varepsilon_r - 1)\dfrac hL\right]$.`],
          teach: 'A partly filled coaxial gauge is two capacitors in parallel, so its capacitance rises linearly with the liquid level.',
          explain: t`$\dfrac{h}{L} = \dfrac{C/C_0 - 1}{\varepsilon_r - 1} = \dfrac{${C}/${C0p} - 1}{${nice(k - 1)}} \approx ${nice(sf(h / (L * 100), 3))}$, so $h \approx ${nice(sf(h, 3))}$ cm. The empty value checks: $2\pi\varepsilon_0L/\ln(b/a) \approx ${nice(C0p)}$ pF. Cryogens’ small $\varepsilon_r$ makes the signal small — a full liquid-hydrogen gauge changes by only 23% — so such gauges need careful calibration against temperature and the vapour’s own density.`,
        };
      },
    }),
    num({
      id: 'cp-pole', difficulty: 3,
      gen(r) {
        const [name, , k] = r.pick(SOLIDS), E0 = r.pick([20, 50, 100]);
        const sb = (3 * EPS0 * (k - 1) * E0 * 1e3) / (k + 2);
        return {
          prompt: t`A sphere of ${name} ($\varepsilon_r = ${k}$) sits in a uniform field of ${E0} kV/m. What is the bound surface charge density at its “north pole”, where the applied field leaves it?`,
          visual: spherePicXY(k, t`The sphere in the field (pointing up). Lengths compressed.`),
          answer: sb * 1e9, units: 'nC/m^2', tol: { rel: 0.01 },
          errors: [{ value: EPS0 * (k - 1) * E0 * 1e3 * 1e9, feedback: t`$P = \varepsilon_0\chi_eE$ uses the field **inside**, $3E_0/(\varepsilon_r + 2)$, not $E_0$.` }, { value: EPS0 * (k - 1) * (E0 / k) * 1e3 * 1e9, feedback: t`The field inside a sphere is $3E_0/(\varepsilon_r + 2)$, not the slab’s $E_0/\varepsilon_r$.` }],
          hints: [t`Inside, $E = 3E_0/(\varepsilon_r + 2)$, uniform, so $\vec P$ is uniform too.`, t`$\sigma_b = \vec P\cdot\hat r = P$ at the pole, with $P = \varepsilon_0(\varepsilon_r - 1)E_{\text{in}}$.`],
          teach: t`For a linear sphere, find the uniform inside field first; $P$ and $\sigma_b = P\cos\theta$ follow.`,
          explain: t`$E_{\text{in}} = \dfrac{3(${E0})}{${k} + 2} \approx ${nice(sf((3 * E0) / (k + 2), 3))}$ kV/m, so $\sigma_b = \varepsilon_0(${k} - 1)E_{\text{in}} \approx ${nice(sf(sb * 1e9, 3))}\ \text{nC/m}^2$ at the pole, falling as $\cos\theta$ to zero at the equator.`,
        };
      },
    }),
    mcq({
      id: 'cp-void', difficulty: 3,
      prompt: t`An epoxy insulator ($\varepsilon_r = 3.6$) carries a uniform field $E$. A thin, flat air gap (a delamination) lies across the field inside it. How does the field in the gap compare with $E$?`,
      visual: seriesPic(0.5, 3.6, t`The idea in one dimension: field (violet) crossing from epoxy (teal) into air. In the thin gap the layers are stacked across the field, as here. Not to scale.`),
      choices: [t`$\varepsilon_r = 3.6$ times stronger: $D_\perp$ is continuous across the flat faces`, 'The same: the gap is too thin to matter', t`$3.6$ times weaker: air does not polarize`, t`$3\varepsilon_r/(2\varepsilon_r + 1) \approx 1.3$ times stronger`],
      answer: 0,
      why: {
        1: 'Thinness is exactly what makes the faces flat and wide, so the boundary condition on D⊥ fixes the gap’s field.',
        2: 'Backwards: with less polarization in the air, less bound charge cancels the field there — it is stronger.',
        3: t`That is the factor for a **spherical** air bubble. A flat gap across the field is the extreme case: the full $\varepsilon_r$.`,
      },
      hints: [t`Which component of the field crosses the gap’s flat faces, and what is continuous for it?`, t`Across a flat face with no free charge, $\varepsilon_{\text{epoxy}}E_{\text{epoxy}} = \varepsilon_0E_{\text{gap}}$.`],
      teach: 'A thin flat void across the field carries εᵣ times the field of the insulator around it — why voids in insulation start partial discharges.',
      explain: t`$D_\perp$ is continuous, so $E_{\text{gap}} = \varepsilon_rE = 3.6E$. Air also breaks down at a lower field than epoxy, so the void sparks first: these **partial discharges** slowly erode high-voltage insulation, which is why spacecraft and aircraft power systems test their insulation for them.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §4.4 and Example 4.7', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'NIST Cryogenics: dielectric constants of liquid oxygen, hydrogen and methane', url: 'https://trc.nist.gov/cryogenics/' },
  ],
});
