// Solitons and the KdV equation (enrichment). Linear dispersive waves spread
// (W6.4); a speed that grows with height steepens and breaks (Burgers,
// pde3-burgers). The Korteweg–de Vries equation u_t + 6uu_x + u_xxx = 0 has
// both, and they balance in the sech² soliton, whose speed is proportional to
// its height. Russell's 1834 canal wave in the dimensional water-wave form;
// two solitons pass through each other and come out shifted (superposition
// fails, identity survives); solitons in optical fibres — honestly, of the
// nonlinear Schrödinger equation, not KdV. Explore: the new wv3-kdv sim.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn } from './_wv.js';

const t = String.raw;
const G = 9.81, MPH = 0.44704;

// the worked example: Russell's wave of August 1834 on the Union Canal
const EX = (() => {
  const v = 8.5 * MPH, a = 0.38;           // 8–9 mph; "a foot to a foot and a half" high
  const h = (v * v) / G - a, c0 = Math.sqrt(G * h), kappa = Math.sqrt((3 * a) / (4 * h ** 3));
  const fwhm = (2 * Math.acosh(Math.SQRT2)) / kappa, tenth = (2 * Math.acosh(Math.sqrt(10))) / kappa;
  return { v, a, h, c0, kappa, fwhm, tenth, cKdV: c0 * (1 + a / (2 * h)) };
})();

const kdv = (p, caption) => ({ type: 'wv3-kdv', params: { play: false, controls: false, readout: false, ...p }, caption });

export default lesson({
  id: 'phys3750.W13.1',
  title: 'Solitons and the KdV equation',
  minutes: 18, difficulty: 4,
  intro: t`Two effects pull a wave apart in opposite ways. **Dispersion** makes short waves travel at different speeds from long ones, so a hump spreads into ripples ([W6.4](#/lesson/phys3750.W6.4)). **Nonlinearity** — a speed that grows with height — makes the crest outrun the base until the front steepens and breaks, as in [Burgers’ equation](#/explore/pde3-burgers). The Korteweg–de Vries (KdV) equation has both, and for one shape they cancel exactly:

$$u = \frac c2\,\text{sech}^2\Big[\frac{\sqrt c}{2}(x - ct)\Big]$$

a **soliton**: a hump that travels at speed $c$ without changing shape, and whose speed is proportional to its height $c/2$ — taller is faster, and narrower. Superposition no longer holds, yet two solitons pass through each other and come out intact. Korteweg and de Vries derived the equation for shallow water in 1895, to explain a wave John Scott Russell had chased along a canal in 1834.`,
  equation: t`u_t + 6\,u\,u_x + u_{xxx} = 0`,
  symbols: [
    { tex: 'u(x, t)', text: 'the wave’s height in scaled units (for water, proportional to the surface’s rise above its level)' },
    { tex: 'u_t', text: 'the rate of change at a fixed place' },
    { tex: '6\\,u\\,u_x', text: 'nonlinear steepening: a part of height $u$ moves at an extra speed $6u$, so crests overtake troughs' },
    { tex: 'u_{xxx}', text: 'dispersion: alone, it gives $\\omega = -k^3$, so short ripples run backwards fastest' },
    { tex: 'c', text: 'a soliton’s speed, equal to twice its height $A$: $c = 2A$' },
    { tex: '\\text{sech}\\,s', text: '$1/\\cosh s$: 1 at $s = 0$, falling off as $2e^{-|s|}$' },
  ],
  why: t`Solitons carry signals unchanged over long distances — in optical fibres, as internal waves in the ocean, in plasmas — and they are the first place most physicists meet a wave equation where superposition fails.`,
  visual: {
    type: 'wv3-kdv',
    title: 'Spread, steepen, or balance',
    lead: t`The same hump under each half of the equation and under the whole. Then switch views: one soliton, and two that collide.`,
    tasks: [
      t`Take it apart: run time. Dispersion alone (violet) sheds ripples that run backwards; nonlinearity alone (gold) leans forward and folds over before $t = 0.4$. Together (blue), nothing changes but the position.`,
      t`One soliton: raise the height $A$. It moves faster ($c = 2A$) and gets narrower.`,
      t`Two solitons: the tall one catches the short one, they merge into a single lower hump, and both re-emerge with their shapes intact — the tall one a little ahead of its dashed ghost, the short one a little behind.`,
    ],
    params: { mode: 'compare', modes: ['compare', 'soliton', 'collide'], A: 1, A1: 2, A2: 0.5, tmax: 6 },
    caption: t`Dimensionless KdV. Every curve is exact: Fourier modes for dispersion alone, characteristics for nonlinearity alone (the folded part is multivalued — a real wave would break there), and the soliton formulas.`,
  },
  example: {
    prompt: t`In August 1834 John Scott Russell watched a boat on the Union Canal near Edinburgh stop suddenly and launch a “rounded, smooth and well-defined heap of water”. He followed it on horseback, “rolling on at a rate of some eight or nine miles an hour, preserving its original figure some thirty feet long and a foot to a foot and a half in height.” For water of depth $h$, KdV gives a solitary wave of height $a$: $\eta = a\,\text{sech}^2[\kappa(x - ct)]$ with $c \approx \sqrt{g(h + a)}$ and $\kappa = \sqrt{3a/4h^3}$. Take $a = ${EX.a}$ m and 8.5 mph: how deep was the canal, and how long should the wave have been?`,
    steps: [
      { label: 'Units', text: t`$8.5\ \text{mph} = ${tn(EX.v)}$ m/s; $a = ${EX.a}$ m is about 1¼ ft.` },
      { label: 'Speed law', text: t`$c^2 = g(h + a)$, so $h = c^2/g - a = ${tn((EX.v * EX.v) / G)} - ${EX.a} = ${tn(EX.h)}$ m. A wave of the same height in deeper water would be faster: height and depth both add speed.` },
      { label: 'Taller is faster', text: t`Expanding, $c \approx \sqrt{gh}\big(1 + \tfrac{a}{2h}\big)$: the excess over the linear speed $\sqrt{gh} = ${tn(EX.c0)}$ m/s is proportional to the height — in scaled units, exactly $c = 2A$.` },
      { label: 'Width', text: t`$\kappa = \sqrt{3a/4h^3} = ${tn(EX.kappa)}\ \text{m}^{-1}$. The sech² is half its height at $\kappa|x| = \text{arccosh}\sqrt2 = 0.881$, so its full width at half height is $${tn(EX.fwhm)}$ m. It falls to a tenth of its height at $\kappa|x| = \text{arccosh}\sqrt{10} = 1.82$: a visible length of about $${tn(EX.tenth)}$ m.` },
      { label: 'Compare', text: t`Russell’s “thirty feet” is ${tn(30 * 0.3048)} m: the same size as the visible hump. A depth of about a metre is reasonable for a barge canal.` },
      { label: 'Honest check', text: t`KdV assumes $a \ll h$; here $a/h \approx ${tn(EX.a / EX.h, 2)}$, so expect errors of ten or twenty per cent, and Russell’s numbers were estimates from horseback. The agreement in size and speed is the point, not the third figure.` },
    ],
    answer: t`Depth about $${tn(EX.h, 2)}$ m; width at half height about $${tn(EX.fwhm, 2)}$ m and a visible length near $${tn(EX.tenth, 2)}$ m, consistent with Russell’s thirty-foot wave.`,
    visual: kdv({ mode: 'soliton', A: 1, t: 2, tmax: 6, ghost: true, x: [-6, 10] }, t`A solitary wave and, dashed, where it started: same shape, moved on (dimensionless units).`),
  },
  practice: [
    num({
      id: 'distance', difficulty: 2,
      gen(r) {
        const A = r.pick([0.5, 0.8, 1.2, 1.5]), T = r.pick([2, 3, 5]);
        const d = 2 * A * T;
        return {
          prompt: t`A KdV soliton (in the units of $u_t + 6uu_x + u_{xxx} = 0$) has height $A = ${A}$. How far does it travel in a time $${T}$?`,
          visual: kdv({ mode: 'soliton', A, t: 0, ghost: false, x: [-6, 20], labels: false }, t`The soliton at $t = 0$ (dimensionless).`),
          answer: d, tol: { rel: 0.01 },
          errors: [{ value: A * T, feedback: t`The speed is twice the height: $u = \tfrac c2\,\text{sech}^2(\ldots)$ has peak $c/2$.` }, { value: (A / 2) * T, feedback: t`The peak is $c/2$, so $c = 2A$, not $A/2$.` }],
          hints: [t`Compare $u = \tfrac c2\,\text{sech}^2[\ldots]$ with height $A$.`, t`$c = 2A$; distance $= cT$.`],
          teach: t`A KdV soliton’s speed is twice its height: $c = 2A$.`,
          explain: t`$c = 2(${A}) = ${tn(2 * A)}$, so it travels $${tn(d)}$ in time ${T}.`,
        };
      },
    }),
    expr({
      id: 'linear-omega', difficulty: 2,
      prompt: t`Drop the nonlinear term: $u_t + u_{xxx} = 0$. Substitute $u = e^{i(kx - \omega t)}$ and find the dispersion relation $\omega(k)$.`,
      visual: kdv({ mode: 'compare', A: 1, t: 1.2, show: ['linear'], x: [-14, 6], labels: false }, t`A hump under dispersion alone (dotted: where it started). Dimensionless units.`),
      answer: '-k^3', answerTeX: t`-k^3`, lhs: '\\omega', vars: { k: [0.3, 3] },
      errors: [{ answer: 'k^3', feedback: t`$\partial_x^3e^{ikx} = (ik)^3e^{ikx} = -ik^3e^{ikx}$: then $-i\omega - ik^3 = 0$.` }, { answer: '-k^2', feedback: 'Three x-derivatives bring down three factors of ik.' }],
      hints: [t`$u_t = -i\omega u$ and $u_{xxx} = (ik)^3u$.`, t`$(ik)^3 = -ik^3$.`],
      teach: t`$\omega = -k^3$: the group velocity $-3k^2$ is negative, so ripples run backwards, the short ones fastest.`,
      explain: t`$-i\omega - ik^3 = 0$ gives $\omega = -k^3$, $v_p = -k^2$, $v_g = -3k^2$. That is why the violet ripples in the Explore view stream out behind the hump.`,
    }),
    num({
      id: 'width-ratio', difficulty: 2,
      gen(r) {
        const [A1, A2] = r.pick([[2, 0.5], [1.8, 0.2], [1.5, 0.6], [2, 0.8]]);
        const ratio = Math.sqrt(A1 / A2);
        return {
          prompt: t`Two KdV solitons have heights ${A1} and ${A2}. How many times wider is the short one than the tall one?`,
          visual: kdv({ mode: 'collide', A1, A2, t: 0, tc: 3, ghost: false, labels: false }, t`The two solitons, tall one behind, at the start (dimensionless).`),
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: A1 / A2, feedback: t`Width goes as $1/\sqrt c$: the argument is $\tfrac{\sqrt c}{2}(x - ct)$.` }],
          hints: [t`$u = \tfrac c2\,\text{sech}^2\big[\tfrac{\sqrt c}{2}(x - ct)\big]$: the width is set by $\sqrt c$.`, t`Width $\propto 1/\sqrt c \propto 1/\sqrt A$.`],
          teach: t`Taller solitons are narrower: width $\propto 1/\sqrt{A}$.`,
          explain: t`$\sqrt{${A1}/${A2}} = ${tn(ratio)}$. The product (height) × (width)² is the same for every soliton: the balance between steepening and spreading fixes it.`,
        };
      },
    }),
    mcq({
      id: 'why-not-spread', difficulty: 3,
      prompt: t`A linear dispersive packet always spreads, yet a KdV soliton never does, though the soliton too is made of many wavenumbers. Why?`,
      visual: kdv({ mode: 'compare', A: 1, t: 0.6, labels: true }, t`The same hump at $t = 0.6$ under dispersion only (violet), nonlinearity only (gold, folding) and both (blue). Dimensionless units.`),
      choices: [
        'Dispersion spreads the hump while the nonlinear term steepens it, and for the sech² shape the two exactly cancel',
        'The soliton contains only one wavenumber, so dispersion cannot act on it',
        'The nonlinear term damps the short wavelengths, as heat diffusion does',
        'Solitons do spread, but too slowly to see in the picture',
      ],
      answer: 0,
      why: {
        1: 'A localized hump needs a spread of wavenumbers — the sech² has a broad spectrum. Each would disperse on its own.',
        2: 'Nothing is damped: KdV conserves ∫u dx and ∫u² dx. The nonlinear term moves energy between wavenumbers, it does not remove it.',
        3: 'The exact solution keeps its shape forever — it is u(x − ct), a pure translation.',
      },
      hints: ['Watch the gold and violet curves: which way does each deform the hump?', 'One makes the front steeper, the other makes it flatter.'],
      teach: 'A soliton is a balance: nonlinear steepening and dispersive spreading cancel for one shape at each height.',
      explain: t`Alone, $u_{xxx}$ spreads the hump into backward ripples and $6uu_x$ steepens it until it folds. For $u = \tfrac c2\,\text{sech}^2$ they cancel at every point — check by substituting: the terms sum to zero.`,
    }),
    num({
      id: 'russell-depth', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([0.2, 0.3, 0.5]), v = r.pick([3, 3.5, 4.2]);
        const h = (v * v) / G - a;
        return {
          prompt: t`A solitary wave ${a} m high runs along a flooded channel at ${v} m/s. Using Russell’s speed law $c = \sqrt{g(h + a)}$, how deep is the undisturbed water, in m? ($g = 9.81\ \text{m/s}^2$.)`,
          visual: kdv({ mode: 'soliton', A: 0.8, t: 0, ghost: false, x: [-10, 10], labels: false }, t`A solitary wave’s profile (dimensionless; the real one is far longer than it is high).`),
          answer: h, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (v * v) / G, feedback: t`That is $h + a$. The speed depends on the depth plus the wave’s height; subtract $a$.` }, { value: (v * v) / G + a, feedback: t`Solve $c^2 = g(h + a)$: $h = c^2/g - a$.` }],
          hints: [t`Square it: $c^2 = g(h + a)$.`, t`$h = c^2/g - a$.`],
          teach: t`A solitary wave in shallow water moves at $\sqrt{g(h + a)}$: faster than a small wave, by an amount set by its height.`,
          explain: t`$h = ${v}^2/9.81 - ${a} = ${tn(h)}$ m. A small wave would move at $\sqrt{gh} = ${tn(Math.sqrt(G * h))}$ m/s; the solitary wave’s extra speed comes from its height.`,
        };
      },
    }),
    num({
      id: 'shift', difficulty: 4,
      gen(r) {
        const [A1, A2] = r.pick([[2, 0.5], [1.5, 0.5], [2, 1], [1.8, 0.2]]);
        const k1 = Math.sqrt(2 * A1), k2 = Math.sqrt(2 * A2), d1 = (2 / k1) * Math.log((k1 + k2) / (k1 - k2));
        return {
          prompt: t`Two KdV solitons of heights ${A1} and ${A2} collide. Writing each as $\tfrac{k^2}{2}\text{sech}^2[\ldots]$ (so $k = \sqrt{2A}$), the exact solution shows the taller one emerging ahead of where it would have been by $\dfrac{2}{k_1}\ln\dfrac{k_1 + k_2}{k_1 - k_2}$. How large is that forward shift?`,
          visual: kdv({ mode: 'collide', A1, A2, t: 6, tmax: 6, tc: 3, ghost: true, labels: false }, t`After the collision: the solitons (blue) and, dashed, where each would be had they never met (dimensionless).`),
          answer: d1, tol: { rel: 0.01 },
          errors: [{ value: (2 / k1) * Math.log((A1 + A2) / (A1 - A2)), feedback: t`Use $k = \sqrt{2A}$, not the heights themselves, inside the logarithm.` }, { value: (2 / k2) * Math.log((k1 + k2) / (k1 - k2)), feedback: t`That is the size of the short soliton’s backward shift, $\tfrac{2}{k_2}\ln(\ldots)$. The tall one’s has $k_1$ outside.` }],
          hints: [t`$k_1 = \sqrt{${2 * A1}}$, $k_2 = \sqrt{${2 * A2}}$.`, t`Shift $= \dfrac{2}{k_1}\ln\dfrac{k_1 + k_2}{k_1 - k_2}$.`],
          teach: 'A collision leaves solitons intact but shifted: the only memory of the encounter is a jump in position.',
          explain: t`$k_1 = ${tn(k1)}$, $k_2 = ${tn(k2)}$, shift $= ${tn(d1)}$ — forward, while the short one falls back by $${tn((2 / k2) * Math.log((k1 + k2) / (k1 - k2)))}$. In linear waves the two would simply pass with no shift at all; the shift is the fingerprint of the nonlinearity.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fibre', difficulty: 3, transfer: true,
      gen(r) {
        const T0 = r.pick([5, 10, 20]), b2 = r.pick([21.7, 4.0]), gamma = 1.3;
        const P0 = b2 / (gamma * T0 * T0) * 1000;
        return {
          prompt: t`Light pulses in an optical fibre obey the nonlinear Schrödinger equation — a cousin of KdV in which the glass’s anomalous dispersion spreads a pulse and the Kerr effect (refractive index rising with intensity) squeezes it. The two balance in a soliton pulse $\text{sech}(t/T_0)$ of peak power $P_0 = |\beta_2|/(\gamma T_0^2)$. For a fibre with $\beta_2 = -${b2}$ ps²/km and $\gamma = ${gamma}$ W⁻¹ km⁻¹, and $T_0 = ${T0}$ ps, what peak power is needed, in mW?`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [-0.1, 1.2], aspect: 'wide', xlabel: 't / T₀', ylabel: 'power', yticks: 0, curves: [{ fn: '1/cosh(x)^2', color: 'accent', width: 2.4 }, { fn: '0.45*e^(-x^2/8)', color: 'violet', dash: [5, 4], width: 1.4 }] }, caption: 'A fibre soliton’s power profile (blue, sech²) and, dashed, an ordinary pulse that has spread by dispersion. Shapes illustrative.' },
          answer: P0, units: 'mW', tol: { rel: 0.01 },
          errors: [{ value: (b2 / (gamma * T0)) * 1000, feedback: t`Square the pulse width: $P_0 = |\beta_2|/\gamma T_0^2$, with ps² over ps².` }],
          hints: [t`Units: ps²/km divided by (W⁻¹ km⁻¹ × ps²) leaves W.`, t`$P_0 = ${b2}/(${gamma}\times${T0}^2)$ W.`],
          teach: 'An optical soliton needs a peak power that balances dispersion against the Kerr effect: shorter pulses need more power.',
          explain: t`$P_0 = ${b2}/(${gamma}\times${T0 * T0}) = ${tn(P0)}$ mW. Hasegawa and Tappert predicted fibre solitons in 1973 and Mollenauer, Stolen and Gordon saw them in 1980. Commercial links ended up using other dispersion-management schemes, but soliton physics now drives frequency combs in microresonators. ${b2 === 4 ? 'This value is typical of dispersion-shifted fibre.' : 'This value is typical of standard fibre at 1550 nm.'}`,
        };
      },
    }),
    num({
      id: 'cp-overtake', difficulty: 3,
      gen(r) {
        const A1 = r.pick([1.5, 2]), A2 = r.pick([0.3, 0.5, 0.8]), d = r.pick([8, 12, 20]);
        const tt = d / (2 * (A1 - A2));
        return {
          prompt: t`A KdV soliton of height ${A1} starts a distance ${d} behind one of height ${A2}. Ignoring the interaction, after what time does the tall one reach the short one?`,
          visual: kdv({ mode: 'collide', A1, A2, t: 0, tc: 3, ghost: false, labels: false }, t`Tall behind, short ahead, at the start (dimensionless; spacing not to the problem’s scale).`),
          answer: tt, tol: { rel: 0.01 },
          errors: [{ value: d / (A1 - A2), feedback: t`Speeds are twice the heights: they close at $2(A_1 - A_2)$.` }, { value: d / (2 * A1), feedback: 'The short one is moving too: use the difference of the speeds.' }],
          hints: [t`$c_i = 2A_i$.`, t`Closing speed $= 2(A_1 - A_2)$; time $= d/(\text{closing speed})$.`],
          teach: 'Solitons of different heights travel at different speeds, so the taller always catches up.',
          explain: t`They close at $2(${A1} - ${A2}) = ${tn(2 * (A1 - A2))}$, so $t = ${d}/${tn(2 * (A1 - A2))} = ${tn(tt)}$. Zabusky and Kruskal, watching exactly such catch-ups in a 1965 computer run, named the humps “solitons” because they behaved like particles.`,
        };
      },
    }),
    mcq({
      id: 'cp-superposition', difficulty: 3,
      prompt: t`While two KdV solitons overlap, is the true solution the sum of the two separate soliton profiles?`,
      visual: kdv({ mode: 'collide', A1: 2, A2: 0.5, t: 2.45, tc: 3, ghost: true, labels: false }, t`Mid-collision: the true solution (blue) and the two solitons as if alone (dashed). Dimensionless units.`),
      choices: [
        t`No: the term $6uu_x$ is not linear, so a sum of solutions is not a solution; here the overlapping pair is a single hump, lower than the tall soliton`,
        'Yes: solitons are solutions, and any sum of solutions is a solution',
        'Yes during the overlap, but not afterwards, which is why they come out shifted',
        'No: the two solitons annihilate during the overlap and are re-created afterwards from the energy',
      ],
      answer: 0,
      why: {
        1: t`That holds only for linear equations. $6(u_1 + u_2)(u_1 + u_2)_x$ has cross terms $6(u_1u_{2x} + u_2u_{1x})$ that neither soliton’s equation contains.`,
        2: 'The sum fails exactly when they overlap; far apart the cross terms vanish, which is why the separated solitons look like a sum.',
        3: 'Their heights and speeds are carried through the collision — ∫u dx and the other conserved quantities never jump — and they emerge with the same shapes, only shifted.',
      },
      hints: [t`Substitute $u_1 + u_2$ into $6uu_x$ and look for terms that mix them.`, 'Compare the blue curve with the dashed ones in the picture.'],
      teach: 'Nonlinear waves do not superpose: during a collision the solution is not the sum, though the solitons survive it.',
      explain: t`Cross terms spoil the sum while the solitons overlap. For these heights the exact solution is a single hump, whose peak dips to $1.5$ — the difference of the two heights — where a sum of the two would rise toward $2.5$. (For heights closer together it shows two humps exchanging places instead.) Afterwards both re-emerge intact — the particle-like behaviour that made solitons famous.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 21: non-linear wave equations and solitons (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1021&context=foundation_wave' },
    { label: 'J. S. Russell, Report on Waves, Report of the 14th Meeting of the British Association (1844), 311–390', url: 'https://www.biodiversitylibrary.org/item/47268' },
    { label: 'Korteweg & de Vries, On the change of form of long waves advancing in a rectangular canal…, Phil. Mag. 39, 422 (1895)', url: 'https://doi.org/10.1080/14786449508620739' },
    { label: 'Zabusky & Kruskal, Interaction of “solitons” in a collisionless plasma…, Phys. Rev. Lett. 15, 240 (1965)', url: 'https://doi.org/10.1103/PhysRevLett.15.240' },
    { label: 'Mollenauer, Stolen & Gordon, Experimental observation of picosecond pulse narrowing and solitons in optical fibers, Phys. Rev. Lett. 45, 1095 (1980)', url: 'https://doi.org/10.1103/PhysRevLett.45.1095' },
    { label: 'Agrawal, Nonlinear Fiber Optics, 6th ed. (Academic Press, 2019), ch. 5: optical solitons', url: 'https://doi.org/10.1016/C2018-0-01168-8' },
  ],
});
