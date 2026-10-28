// Lorentz transformations of fields (Griffiths §12.3.2). Griffiths's
// capacitor argument: plates moving parallel to themselves are
// length-contracted, so σ → γσ and E⊥ → γE⊥, and the moving charge sheets are
// surface currents that make a magnetic field; plates moving across
// themselves keep σ, so E∥ is unchanged. The general rules for a boost
// (E′∥ = E∥, B′∥ = B∥, E′⊥ = γ(E + v×B)⊥, B′⊥ = γ(B − v×E/c²)⊥) and the
// invariants E·B and E² − c²B². Explore: the new em4c-boost sim, fields panel
// only (the matrix waits for M6.2). Worked example: the field of a 1 nC
// bunch at 0.999c beside a linac's wall, by boosting Coulomb's field — which
// agrees with the Liénard–Wiechert result of M4.4. Transfers: a Hall
// thruster's E × B drift speed (the frame where E vanishes) and the solar
// wind's convection electric field. Avoids st-c.C10.4 (forms view) and
// st-a.A7.3 (the invariant with a frame of pure B).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, C, PI, sf, boostFields, boostPic } from './_em4c.js';

const t = String.raw;

// the worked example: a 1 nC bunch at β = 0.999, a field point 1 cm to the side
const EX = { q: 1e-9, b: 0.999, d: 0.01 };
EX.g = 1 / Math.sqrt(1 - EX.b ** 2);
EX.E0 = EX.q / (4 * PI * EPS0 * EX.d ** 2);
{
  const { E, B } = boostFields([0, EX.E0, 0], [0, 0, 0], -EX.b);   // the lab moves at −v relative to the bunch
  EX.E = E[1]; EX.B = B[2];
}
if (Math.abs(EX.E / (EX.g * EX.E0) - 1) > 1e-12 || Math.abs(EX.B / ((EX.b * EX.E) / C) - 1) > 1e-12) throw new Error('M6.1: boosted Coulomb field');

/** Two capacitor plates seen side-on (graph): moving along x, plates horizontal (parallel motion) or vertical (motion across them). */
function platesPic(caption, { across = false, contracted = false, B = false, arrow = true } = {}) {
  const n = 7, xs = Array.from({ length: n }, (_, k) => +(((k - (n - 1) / 2) * (contracted ? 0.42 : 0.7))).toFixed(3));
  const curves = [], points = [], arrows = [];
  if (!across) {
    curves.push({ param: ['t', '0.75'], t: [-2.4, 2.4], color: 'ink2', width: 3 }, { param: ['t', '-0.75'], t: [-2.4, 2.4], color: 'ink2', width: 3 });
    xs.forEach((x) => { points.push({ x, y: 0.88, r: 0, label: '+', color: 'warn', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x, y: -0.88, r: 0, label: '−', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }); });
    [-1.6, 0, 1.6].forEach((x) => arrows.push({ from: [x, 0.6], to: [x, -0.6], color: 'gold', width: 2 }));
    points.push({ x: 1.6, y: 0, r: 0, label: 'E', color: 'gold', labelDx: 6, labelDy: 0 });
    if (B) points.push({ x: -0.8, y: 0.15, r: 6, color: 'teal', hollow: true }, { x: -0.8, y: 0.15, r: 1.8, color: 'teal' }, { x: -0.8, y: 0.15, r: 0, label: 'B (out of page)', color: 'teal', labelDx: 10, labelDy: -10 });
  } else {
    curves.push({ param: ['-0.9', 't'], t: [-1, 1], color: 'ink2', width: 3 }, { param: ['0.9', 't'], t: [-1, 1], color: 'ink2', width: 3 });
    [-0.7, -0.35, 0, 0.35, 0.7].forEach((y) => { points.push({ x: -1.05, y, r: 0, label: '+', color: 'warn', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 1.05, y, r: 0, label: '−', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 0 }); });
    [-0.5, 0.5].forEach((y) => arrows.push({ from: [-0.75, y], to: [0.75, y], color: 'gold', width: 2 }));
    points.push({ x: 0.75, y: 0.5, r: 0, label: 'E', color: 'gold', labelDx: 6, labelDy: -6 });
  }
  if (arrow) arrows.push({ from: [-2.3, -1.25], to: [-1.3, -1.25], color: 'ink2', width: 2.2, label: 'v', labelDx: 6, labelDy: 0 });
  return {
    type: 'graph',
    params: { x: [-2.6, 2.6], y: [-1.45, 1.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves, points, arrows },
    caption,
  };
}

export default lesson({
  id: 'phys4600.M6.1',
  title: 'Lorentz transformations of fields',
  minutes: 18, difficulty: 3,
  equation: t`\begin{gathered}\vec E'_\parallel = \vec E_\parallel, \qquad \vec B'_\parallel = \vec B_\parallel, \\ \vec E'_\perp = \gamma\,(\vec E + \vec v\times\vec B)_\perp, \qquad \vec B'_\perp = \gamma\Bigl(\vec B - \frac{\vec v\times\vec E}{c^2}\Bigr)_\perp\end{gathered}`,
  intro: t`Charge is the same in every frame, but **charge density** is not: a moving sheet of charge is length-contracted, so its surface density goes up by $\gamma$. Take a parallel-plate capacitor with field $E_0 = \sigma_0/\varepsilon_0$ and fly past it parallel to the plates: you measure $\sigma = \gamma\sigma_0$, so $E = \gamma E_0$ — and the moving sheets are now surface currents, $K = \sigma v$, which make a magnetic field. Fly across the plates instead and nothing about $\sigma$ changes: the field along the motion stays put. Repeating the argument with a solenoid gives the general rules above, for an observer moving with velocity $\vec v$: the field components **along** $\vec v$ never change, the components **across** it mix. So $\vec E$ and $\vec B$ are not separate things: each is part of one object, viewed from one frame. Two combinations every observer agrees on: $\vec E\cdot\vec B$ and $E^2 - c^2B^2$.`,
  symbols: [
    { tex: '\\vec E,\\ \\vec B', text: 'the fields measured in the original frame (V/m and T)' },
    { tex: "\\vec E',\\ \\vec B'", text: t`the fields measured by an observer moving at velocity $\vec v$ relative to it` },
    { tex: '\\parallel,\\ \\perp', text: t`the components along $\vec v$ and at right angles to it` },
    { tex: '\\vec v', text: 'the observer’s velocity relative to the original frame, in m/s' },
    { tex: '\\gamma', text: t`the Lorentz factor $1/\sqrt{1 - v^2/c^2}$` },
    { tex: 'c', text: 'the speed of light' },
  ],
  why: t`This is magnetism explained: a magnetic field is what an electric field looks like from a moving frame, and vice versa. It decides what a spacecraft’s instruments measure in the solar wind, how electrons drift in a Hall thruster, and it is the first sign that $\vec E$ and $\vec B$ are one tensor — the subject of [M6.2](#/lesson/phys4600.M6.2).`,
  visual: {
    type: 'em4c-boost',
    title: 'One field, many observers',
    lead: t`Pick a uniform field as the lab measures it, then move the observer along $x$. Gold is $\vec E'$, teal is $c\vec B'$ (both in the same units, $c = 1$); the faint dashed arrows are the lab’s values. Watch the readouts below the picture.`,
    tasks: [
      t`Pure electric field along $y$: move the observer and a magnetic field appears along $-z$ (for $\beta > 0$), while $E'$ grows as $\gamma$. Yet $E'^2 - c^2B'^2$ stays at 1.`,
      t`“$E < cB$, crossed”: find the speed at which $\vec E'$ vanishes — $\beta = E/cB = 0.6$. Try “$E > cB$”: now it is $\vec B'$ that can vanish, at $\beta = cB/E$.`,
      t`“Generic” has $\vec E\cdot\vec B \ne 0$: no speed removes either field. And the light wave stays a light wave for everyone: chase it and both fields shrink together.`,
    ],
    params: { preset: 'pureE', presets: ['pureE', 'pureB', 'crossedB', 'crossedE', 'wave', 'generic'], beta: 0, panels: ['fields'], controls: ['beta', 'preset'] },
    caption: t`Exact Lorentz transformation of uniform fields for an observer moving along $x$ ($c = 1$, arbitrary field units). Components along $x$ are unchanged; only $y$ and $z$ mix.`,
  },
  example: {
    prompt: t`An electron bunch carrying $${EX.q * 1e9}$ nC passes along the axis of a linear accelerator at $v = ${EX.b}c$. Treating it as a point charge, find the electric and magnetic fields at the beam-pipe wall, ${EX.d * 100} cm from the axis, at the moment the bunch passes.`,
    visual: boostPic({ preset: 'pureE', beta: -0.8, panels: ['fields'] }, t`The bunch’s rest-frame field (dashed) along $y$ at the field point, and what the lab sees: a larger $\vec E$ and a magnetic field along $z$. Drawn at $0.8c$, not ${EX.b}c — at that speed the arrows would leave the page. $c = 1$.`),
    steps: [
      { label: 'Rest frame', text: t`In the bunch’s own frame it is a static charge: $E_0 = \dfrac{q}{4\pi\varepsilon_0d^2} = ${tex(EX.E0, 3)}$ V/m, pointing straight out from it, and $B_0 = 0$.` },
      { label: 'Which components', text: t`At the moment of passing, the field point is straight to the side, so $\vec E_0$ is entirely **perpendicular** to the motion. That is the part that changes.` },
      { label: 'Transform', text: t`The lab moves at $-\vec v$ relative to the bunch: $E = \gamma E_0$ with $\gamma = ${nice(sf(EX.g, 4))}$, so $E \approx ${tex(EX.E, 3)}$ V/m. And $\vec B = \gamma(0 + \vec v\times\vec E_0/c^2)$, of size $vE/c^2 \approx ${tex(EX.B, 3)}$ T, circling the beam.` },
      { label: 'Check against M4.4', text: t`The Liénard–Wiechert result for a passing charge, side-on, is also $\gamma q/4\pi\varepsilon_0d^2$ ([M4.4](#/lesson/phys4600.M4.4)). Two very different routes, one answer.` },
      { label: 'Invariants', text: t`$\vec E\cdot\vec B = 0$ in both frames, and $E^2 - c^2B^2 = \gamma^2E_0^2(1 - \beta^2) = E_0^2$: positive, so there is a frame (the bunch’s) where the field is purely electric.` },
    ],
    answer: t`$E \approx ${tex(EX.E, 3)}$ V/m outward and $B \approx ${tex(EX.B, 3)}$ T circling the beam — $\gamma \approx ${nice(sf(EX.g, 3))}$ times the static field, plus $B = vE/c^2$.`,
  },
  practice: [
    mcq({
      id: 'which-change', difficulty: 1,
      prompt: t`An observer moves along $x$ through a region of uniform fields. Which components are guaranteed to be the same as in the lab?`,
      visual: boostPic({ preset: 'generic', beta: 0.6, panels: ['fields'] }, t`A generic field seen by an observer moving along $x$ (gold $\vec E'$, teal $c\vec B'$, lab values dashed). $c = 1$.`),
      choices: [t`$E_x$ and $B_x$, the components along the motion`, t`$E_y$, $E_z$, $B_y$ and $B_z$, the components across the motion`, t`All of them: fields do not depend on the observer`, t`Only $|\vec E|$ and $|\vec B|$, the sizes`],
      answer: 0,
      why: {
        1: t`Those are exactly the ones that mix: $E'_y = \gamma(E_y - vB_z)$, and so on.`,
        2: t`$\vec E$ and $\vec B$ are frame-dependent: a pure electric field acquires a magnetic partner in a moving frame.`,
        3: t`The sizes change too (a pure $\vec E$ grows by $\gamma$); what stays fixed is $E^2 - c^2B^2$ and $\vec E\cdot\vec B$.`,
      },
      hints: [t`Think of the capacitor: plates moving across themselves keep their charge density.`, t`Only the components along $\vec v$ are untouched.`],
      teach: 'Field components along the motion are unchanged; those across it mix electric with magnetic.',
      explain: t`$E'_x = E_x$ and $B'_x = B_x$. The four perpendicular components mix in pairs: $(E_y, B_z)$ and $(E_z, B_y)$.`,
    }),
    num({
      id: 'capacitor', difficulty: 2,
      gen(r) {
        const E0 = r.pick([20, 50, 100, 300]), b = r.pick([0.6, 0.8, 0.9, 0.95]);
        const g = 1 / Math.sqrt(1 - b * b);
        return {
          prompt: t`A capacitor’s field is ${E0} kV/m in its rest frame. An observer moves at $${b}c$ parallel to the plates. What electric field does the observer measure between them, in kV/m?`,
          visual: platesPic(t`The capacitor seen by the moving observer: plates parallel to the motion, their charges crowded together by length contraction. Spacing exaggerated; not to scale.`, { contracted: true }),
          answer: g * E0, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: E0 / g, feedback: t`Length contraction squeezes the same charge into **less** length, so $\sigma$ — and $E$ — go **up** by $\gamma$.` }, { value: E0, feedback: t`That would hold for motion **across** the plates. Moving along them, $\sigma \to \gamma\sigma$.` }],
          hints: [t`The plates are contracted along the motion: what happens to their charge per unit area?`, t`$\sigma = \gamma\sigma_0$, and $E = \sigma/\varepsilon_0$.`],
          teach: 'Plates moving along themselves are length-contracted: σ and the perpendicular E both grow by γ.',
          explain: t`$\gamma = ${nice(sf(g, 4))}$, so $E = \gamma E_0 \approx ${nice(sf(g * E0, 3))}$ kV/m. The observer also sees a magnetic field, $B = vE/c^2$, from the moving sheets of charge.`,
        };
      },
    }),
    num({
      id: 'B-from-E', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 3, 10]), b = r.pick([0.5, 0.6, 0.8]);
        const g = 1 / Math.sqrt(1 - b * b), B = (g * b * E * 1e6) / C;
        return {
          prompt: t`In the lab there is a pure electric field of ${E} MV/m along $y$. An observer moves along $x$ at $${b}c$. What magnetic field, in mT, does the observer measure?`,
          visual: boostPic({ preset: 'pureE', beta: b, panels: ['fields'], hide: ['arrows'] }, t`The lab’s field (dashed, along $y$) and the observer’s motion along $x$; the observer’s own fields are not drawn. $c = 1$.`),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ((b * E * 1e6) / C) * 1e3, feedback: t`Keep the $\gamma$: $B'_\perp = \gamma(\vec B - \vec v\times\vec E/c^2)_\perp$.` }, { value: ((g * b * E * 1e6) / (C * C)) * 1e3 * C / 1e3, feedback: t`Check the powers of $c$: $vE/c^2$ has units of tesla.` }].filter((e) => Math.abs(e.value - B * 1e3) > 0.02 * B * 1e3),
          hints: [t`$\vec B' = -\gamma\,\vec v\times\vec E/c^2$ when the lab has no $\vec B$.`, t`Its size is $\gamma vE/c^2 = \gamma\beta E/c$.`],
          teach: 'A pure electric field seen from a moving frame has a magnetic partner, B′ = γvE/c².',
          explain: t`$B' = \gamma\beta E/c = ${nice(sf(g, 3))} \times ${b} \times ${E}\times10^{6}/c \approx ${nice(sf(B * 1e3, 3))}$ mT, along $-z$ for $\vec v$ along $+x$ and $\vec E$ along $+y$.`,
        };
      },
    }),
    mcq({
      id: 'fly-past', difficulty: 2,
      prompt: t`A positive charge sits at rest. You fly past it at velocity $v\,\hat x$, and at one moment you are directly above it (along $+y$). Which way does the magnetic field you measure point?`,
      visual: boostPic({ preset: 'pureE', beta: 0.6, panels: ['fields'], hide: ['arrows'] }, t`At your position the charge’s field (dashed) points along $+y$; you move along $+x$. Your own fields are not drawn. $c = 1$.`),
      choices: [t`Along $-z$: in your frame the charge moves along $-x$, and $\vec B' = -\gamma\vec v\times\vec E/c^2$`, t`Along $+z$`, t`Along $+x$, the direction you move`, 'There is none: the charge is not moving'],
      answer: 0,
      why: {
        1: t`Compute $-\vec v\times\vec E = -v E\,(\hat x\times\hat y) = -vE\,\hat z$.`,
        2: t`A magnetic field from a moving charge circles its line of motion; it never points along it.`,
        3: 'It is not moving in the lab, but in your frame it is — and a moving charge makes a magnetic field.',
      },
      hints: [t`Use $\vec B' = -\gamma\,\vec v\times\vec E/c^2$, with $\vec v = v\hat x$ and $\vec E = E\hat y$.`, t`Check with Biot–Savart: in your frame the charge moves along $-x$; $(-\hat x)\times\hat y = -\hat z$.`],
      teach: 'Which fields exist depends on the frame: a charge at rest has no B, but a passing observer measures one.',
      explain: t`$\vec B' = -\gamma(v/c^2)E\,\hat x\times\hat y = -\gamma vE/c^2\,\hat z$. The same answer comes from Biot–Savart in your frame, where the charge moves along $-x$: $\vec B \propto q\vec u\times\hat r = (-\hat x)\times\hat y = -\hat z$.`,
    }),
    num({
      id: 'pure-E-frame', difficulty: 3,
      gen(r) {
        const E = r.pick([3, 4, 5]) * 1e5, B = r.pick([0.4, 0.6, 0.8]) * 1e-3;   // V/m, T: E > cB always
        const inv = Math.sqrt(E * E - (C * B) ** 2);
        return {
          prompt: t`At a point in the lab, $E = ${tex(E, 2)}$ V/m and $B = ${B * 1e3}$ mT, at right angles. An observer moving along $\vec E\times\vec B$ at the right speed sees no magnetic field at all. What electric field, in kV/m, does that observer measure?`,
          visual: boostPic({ preset: 'crossedE', beta: 0, panels: ['fields'] }, t`Crossed fields with $E > cB$ in the lab ($c = 1$; not to the problem’s scale).`),
          answer: inv / 1e3, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(E * E + (C * B) ** 2) / 1e3, feedback: t`The invariant is $E^2 - c^2B^2$, with a minus sign.` }, { value: (E - C * B) / 1e3, feedback: t`Subtract the squares, not the fields: $E'^2 = E^2 - c^2B^2$.` }],
          hints: [t`$E^2 - c^2B^2$ is the same in every frame; in the frame with $B' = 0$ it is $E'^2$.`, t`$E' = \sqrt{E^2 - c^2B^2}$, with $cB = ${tex(C * B, 3)}$ V/m.`],
          teach: 'If E > cB and E ⟂ B, some frame sees pure E, of strength √(E² − c²B²).',
          explain: t`$cB \approx ${tex(C * B, 3)}$ V/m, so $E' = \sqrt{E^2 - c^2B^2} \approx ${nice(sf(inv / 1e3, 3))}$ kV/m. That observer moves at $\beta = cB/E = ${nice(sf((C * B) / E, 3))}$.`,
        };
      },
    }),
    mcq({
      id: 'no-frame', difficulty: 3,
      prompt: t`In a lab, $\vec E$ and $\vec B$ are parallel and both nonzero. Is there a frame in which the field is purely magnetic?`,
      visual: boostPic({ preset: 'custom', E: [0, 0.7, 0], B: [0, 0.6, 0], beta: 0, panels: ['fields'] }, t`Parallel $\vec E$ (gold) and $c\vec B$ (teal) in the lab. $c = 1$.`),
      choices: [t`No: $\vec E\cdot\vec B \ne 0$ in every frame, so neither field can vanish anywhere`, t`Yes, moving fast enough along $\vec E$`, t`Yes, if $E < cB$`, t`Yes, moving at right angles to both`],
      answer: 0,
      why: {
        1: t`Moving along the fields changes neither (both are parallel components).`,
        2: t`$E < cB$ decides which field could vanish **if** $\vec E\cdot\vec B = 0$. Here it is not zero.`,
        3: t`Any boost leaves $\vec E\cdot\vec B$ unchanged; a frame with $\vec E' = 0$ would need it to be 0.`,
      },
      hints: [t`Which quantity is the same in every frame and would be zero if either field were?`, t`$\vec E\cdot\vec B$ is an invariant.`],
      teach: 'E·B is invariant: if it is nonzero, every observer sees both fields.',
      explain: t`If some frame had $\vec E' = 0$, then $\vec E'\cdot\vec B' = 0$ there, and therefore in every frame. A nonzero $\vec E\cdot\vec B$ rules that out; the best any observer can do is make the two fields parallel.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hall', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([1, 2, 3, 5]) * 1e4, B = r.pick([10, 15, 20, 25]) * 1e-3;
        const v = E / B;
        return {
          prompt: t`In a Hall thruster’s channel an axial electric field of $${tex(E, 2)}$ V/m crosses a radial magnetic field of ${B * 1e3} mT. In a frame moving along $\vec E\times\vec B$ at the right speed the electric field vanishes, and the electrons there simply circle the field lines. How fast is that frame, in km/s?`,
          visual: boostPic({ preset: 'crossedB', beta: 0, panels: ['fields'] }, t`Crossed fields with $E < cB$ ($c = 1$; in the thruster $E$ is about $10^{-4}$ of $cB$). The frame that removes $\vec E$ moves along $\vec E\times\vec B$.`),
          answer: v / 1e3, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: (B / E) / 1e3, feedback: t`The drift speed is $E/B$ (V/m over T gives m/s).` }, { value: (C * C * B) / E / 1e3, feedback: t`$c^2B/E$ is the speed that removes $\vec B$ when $E > cB$ — impossible here, since it exceeds $c$.` }],
          hints: [t`$\vec E' = \gamma(\vec E + \vec v\times\vec B)_\perp = 0$ needs $\vec v\times\vec B = -\vec E$.`, t`With $\vec v \perp \vec B$, that is $vB = E$.`],
          teach: 'Crossed fields with E < cB have a frame moving at E/B where E vanishes: the E × B drift.',
          explain: t`$v = E/B = ${tex(v, 3)}$ m/s $= ${nice(sf(v / 1e3, 3))}$ km/s, far below $c$, so $\gamma \approx 1$. The electrons stream around the channel at this speed — the Hall current that gives the thruster its name — while the heavy ions, barely deflected, are accelerated straight out.`,
        };
      },
    }),
    num({
      id: 'cp-wind', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([350, 400, 500, 700]), B = r.pick([3, 5, 8]);
        const E = v * 1e3 * B * 1e-9;
        return {
          prompt: t`The solar wind streams past a spacecraft at ${v} km/s, carrying a ${B} nT magnetic field at right angles to its velocity. In the wind’s own frame the plasma shorts out any electric field. What electric field, in mV/m, does the spacecraft measure?`,
          visual: boostPic({ preset: 'pureB', beta: 0.5, panels: ['fields'] }, t`A pure magnetic field in one frame (the wind’s) seen from another moving relative to it: an electric field appears. $c = 1$; drawn at $0.5c$, the wind moves at about $0.001c$.`),
          answer: E * 1e3, units: 'mV/m', tol: { rel: 0.01 },
          errors: [{ value: (v * B) * 1e3, feedback: 'Convert to SI first: km/s to m/s and nT to T.' }, { value: E * 1e3 / C * 1e3, feedback: t`$E' = vB$ — no $1/c$ here; the $1/c^2$ belongs to the magnetic field made from $\vec E$.` }],
          hints: [t`From the wind’s frame (pure $\vec B$), the spacecraft moves at $-\vec v$: $\vec E' = \gamma(-\vec v)\times\vec B$, and $\gamma \approx 1$.`, t`Its size is $vB$.`],
          teach: 'A magnetic field carried past you at speed v brings an electric field E = vB (the convection field).',
          explain: t`$E = vB = ${tex(v * 1e3, 2)} \times ${tex(B * 1e-9, 1)} \approx ${nice(sf(E * 1e3, 3))}$ mV/m. Spacecraft double probes measure this convection field, $\vec E = -\vec v\times\vec B$; it drives the circulation of Earth’s magnetosphere.`,
        };
      },
    }),
    mcq({
      id: 'cp-light', difficulty: 3,
      prompt: t`Can any observer, by moving fast enough, see a light wave as a pure electric field?`,
      visual: boostPic({ preset: 'wave', beta: 0.6, panels: ['fields'] }, t`A light wave’s fields at one point (lab values dashed) seen by an observer chasing it at $0.6c$. $c = 1$.`),
      choices: [
        t`No: for light $E^2 - c^2B^2 = 0$ and $\vec E\cdot\vec B = 0$ in every frame, so $E = cB$ for every observer; chasing it only makes both weaker`,
        t`Yes, an observer moving at $c$ alongside it`,
        t`Yes, by moving across the wave’s direction`,
        'Yes, but only for circularly polarized light',
      ],
      answer: 0,
      why: {
        1: 'No observer reaches c; and the invariants would still say E = cB.',
        2: t`Every boost leaves both invariants zero, so $E' = cB'$ still.`,
        3: 'Polarization does not change the invariants: both are zero for any plane wave.',
      },
      hints: [t`Compute both invariants for $E = cB$, $\vec E \perp \vec B$.`, t`If $E^2 - c^2B^2 = 0$ in one frame, it is 0 in all.`],
      teach: 'Light has both invariants zero: every observer sees E = cB and E ⟂ B — there is no rest frame of light.',
      explain: t`Both invariants vanish for a plane wave, so every observer sees a plane wave. Chasing it at $\beta$ scales both fields by $\sqrt{(1 - \beta)/(1 + \beta)}$ — the Doppler shift of [phys3710.R3.3](#/lesson/phys3710.R3.3) — never to a pure electric field. This is Einstein’s teenage puzzle about riding a light beam, answered.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §12.3.1–12.3.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Purcell & Morin, Electricity and Magnetism (3rd ed.), ch. 5–6: fields of moving charges, magnetism from relativity', url: 'https://doi.org/10.1017/CBO9781139012973' },
    { label: 'Goebel & Katz, Fundamentals of Electric Propulsion: Ion and Hall Thrusters (JPL), ch. 7', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
  ],
});
