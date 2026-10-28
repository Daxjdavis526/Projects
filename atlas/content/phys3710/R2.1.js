// Boosts as hyperbolic rotations: t' = t cosh φ − x sinh φ, x' = −t sinh φ +
// x cosh φ, set beside an ordinary rotation; in light-cone coordinates
// u = t − x, v = t + x a boost is a squeeze, u' = e^φ u, v' = e^−φ v, with the
// light rays as eigen-directions and the Doppler factors as eigenvalues.
// Builds on gr.S03.d (the boost matrix in cosh and sinh, rapidities adding)
// and phys2710.MP2.3 (the Lorentz transformation) without repeating them.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6, st, label } from './_geom.js';

const t = String.raw;
const ch = (k) => (k + 1 / k) / 2, sh = (k) => (k - 1 / k) / 2;   // cosh and sinh of ln k

/** An event, its hyperbola through the origin, and the axes of the frame boosted by rapidity ln k. */
function boostPicture({ k, ev, numbers = true, name = 'E', caption }) {
  const [T, X] = ev, b = k ? sh(k) / ch(k) : 0, s2 = T * T - X * X;
  const R = Math.max(Math.abs(T), Math.abs(X)) * 1.3 + 0.5;
  const hyper = s2 > 0 ? [{ s: Math.sqrt(s2), kind: 'time' }] : s2 < 0 ? [{ s: Math.sqrt(-s2), kind: 'space', both: true }] : [];
  return st({
    x: [-0.6 * R, R], t: [-0.25 * R, R], numbers, cones: [[0, 0, 'both']], hyper, boosted: k ? { beta: r6(b) } : null,
    events: [[X, T, name, 'accent2', 9, -8]],
    caption: caption ?? t`Your frame (black axes, $c = 1$) and the frame boosted by rapidity $\ln ${nice(k, 3)}$ (gold axes). The grey hyperbola holds every event at the same interval from the origin as ${name}; the boost slides ${name} along it.`,
  });
}

/** A square of events and its image under a boost (as drawn in the new coordinates), with light rays. */
function squeezePicture({ p, caption, sliders = null, readouts = null, extraPoints = [] }) {
  const P = typeof p === 'number' ? r6(p) : p;
  const sq = [[0, 1.3], [0.7, 2], [0, 2.7], [-0.7, 2], [0, 1.3]];        // a diamond whose edges are light rays
  const img = (xe, te) => [`(${xe})*cosh(${P}) - (${te})*sinh(${P})`, `(${te})*cosh(${P}) - (${xe})*sinh(${P})`];
  const curves = [
    { fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 },
    { param: ['sinh(t)', 'cosh(t)'], t: [-2.2, 2.2], color: 'ink3', width: 1, dash: true },
    { param: ['1.73205*sinh(t)', '1.73205*cosh(t)'], t: [-1.7, 1.7], color: 'ink3', width: 1, dash: true },
  ];
  for (let i = 0; i < 4; i++) {
    const [x0, t0] = sq[i], [x1, t1] = sq[i + 1];
    curves.push({ param: [`${x0} + (${x1 - x0})*t`, `${t0} + (${t1 - t0})*t`], t: [0, 1], color: 'ink2', width: 1.4, dash: [3, 3] });
    curves.push({ param: img(`${x0} + (${x1 - x0})*t`, `${t0} + (${t1 - t0})*t`), t: [0, 1], color: 'gold', width: 2.4 });
  }
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-0.3, 4.6], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x', ylabel: 't',
      curves,
      points: [{ x: img(1, 2)[0], y: img(1, 2)[1], color: 'accent2', label: 'E′' }, { x: 1, y: 2, color: 'ink3', r: 3.5, label: 'E', labelDx: 8, labelDy: 12 }, ...extraPoints],
      ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption,
  };
}

export default lesson({
  id: 'phys3710.R2.1',
  title: 'Boosts as hyperbolic rotations',
  minutes: 12, difficulty: 3,
  intro: t`Turn a map through an angle $\theta$ and coordinates mix by cosines and sines while $x^2 + y^2$ stays fixed. Change to a frame moving with rapidity $\varphi$ (lesson R0.2) and time and space mix the same way, with the hyperbolic functions, while $-t^2 + x^2$ stays fixed:

$$t' = t\cosh\varphi - x\sinh\varphi, \qquad x' = -t\sinh\varphi + x\cosh\varphi$$

With $\cosh\varphi = \gamma$ and $\sinh\varphi = \gamma\beta$ this is the Lorentz transformation you know from [Lorentz transformations](#/lesson/phys2710.MP2.3), and [The Minkowski metric](#/lesson/gr.S03.d) showed that two such boosts add their rapidities. The new step: **in the light-cone coordinates $u = t - x$ and $v = t + x$ a boost is a squeeze**, $u' = e^{\varphi}u$ and $v' = e^{-\varphi}v$. The two light rays are the only directions a boost does not tilt, it stretches one by the Doppler factor and shrinks the other by the same factor, and their product $uv = t^2 - x^2$ cannot change.`,
  symbols: [
    { tex: "t,\\ x", text: 'an event’s time and position in your frame, in years and light-years (c = 1)' },
    { tex: "t',\\ x'", text: 'the same event’s coordinates in the frame moving at speed β = tanh φ along +x' },
    { tex: '\\varphi', text: t`the rapidity of the moving frame relative to yours: the hyperbolic angle of the boost` },
    { tex: 'u,\\ v', text: t`light-cone coordinates, $u = t - x$ and $v = t + x$: each is constant along one family of light rays` },
    { tex: 'e^{\\pm\\varphi}', text: t`the Doppler factors $\sqrt{(1 \pm \beta)/(1 \mp \beta)}$: how much the boost stretches $u$ and shrinks $v$` },
  ],
  why: 'Thinking of boosts as hyperbolic rotations makes every special-relativity diagram a piece of geometry, and the squeeze picture is how gravitational-wave and black-hole physicists use null coordinates.',
  visual: {
    title: 'A boost squeezes along the light rays',
    lead: t`The dashed diamond is a set of events whose edges run along light rays; the gold shape is the same events in coordinates boosted by rapidity $\varphi$. Grey curves are hyperbolae $t^2 - x^2 = 1$ and $3$; the event E lies on the second. Slide $\varphi$ and watch where the diamond stretches, where it shrinks, and what stays fixed.`,
    tasks: [
      t`The gold shape stretches along one light line and shrinks along the other — by $e^{\varphi}$ and $e^{-\varphi}$. Its area never changes.`,
      'Follow E: it slides along its hyperbola, as a point on a circle slides round when you rotate.',
      'Read uv in the readout for E before and after the boost: always the same, because uv = t² − x².',
    ],
    ...squeezePicture({
      p: 'p',
      sliders: [{ key: 'p', label: t`Rapidity of the boost $\varphi$`, min: -1.2, max: 1.2, step: 0.01, value: 0.55, explain: t`The moving frame’s speed is $\beta = \tanh\varphi$.` }],
      readouts: [
        { label: t`$\beta = \tanh\varphi$`, expr: 'tanh(p)', digits: 3 },
        { label: t`stretch $e^{\varphi}$`, expr: 'e^p', digits: 4 },
        { label: t`E: $u = t - x$`, expr: '1', digits: 3 },
        { label: t`E′: $u' = t' - x'$`, expr: '(2 - 1)*e^p', digits: 4 },
        { label: t`E: $v = t + x$`, expr: '3', digits: 3 },
        { label: t`E′: $v' = t' + x'$`, expr: '3*e^(-p)', digits: 4 },
        { label: t`$u'v'$`, expr: '(2 - 1)*e^p*3*e^(-p)', digits: 4 },
      ],
      caption: t`One direction of space, $c = 1$. Grey dashed: the diamond of events in your coordinates; gold: the same events in the boosted coordinates. Light rays (dashed orange) map to themselves. E is the event $(t, x) = (2, 1)$.`,
    }),
  },
  example: {
    prompt: t`An event E happens at $t = 6.5$ years, $x = 2.5$ light-years. Boost to the frame with rapidity $\varphi = \ln\tfrac32$. Find $(t', x')$ with cosh and sinh, then again with light-cone coordinates, and say what is special about the result.`,
    visual: boostPicture({ k: 1.5, ev: [6.5, 2.5] }),
    steps: [
      { label: 'Cosh and sinh', text: t`$e^{\varphi} = \tfrac32$, so $\cosh\varphi = \tfrac12\left(\tfrac32 + \tfrac23\right) = \tfrac{13}{12}$ and $\sinh\varphi = \tfrac12\left(\tfrac32 - \tfrac23\right) = \tfrac{5}{12}$. The speed is $\beta = \tanh\varphi = \tfrac{5}{13}$.` },
      { label: 'Rotate hyperbolically', text: t`$t' = 6.5\times\tfrac{13}{12} - 2.5\times\tfrac{5}{12} = \tfrac{84.5 - 12.5}{12} = 6$ and $x' = -6.5\times\tfrac{5}{12} + 2.5\times\tfrac{13}{12} = \tfrac{-32.5 + 32.5}{12} = 0$.` },
      { label: 'Squeeze instead', text: t`$u = t - x = 4$ and $v = t + x = 9$. The boost multiplies $u$ by $e^{\varphi} = \tfrac32$ and $v$ by $\tfrac23$: $u' = 6$, $v' = 6$. Then $t' = (u' + v')/2 = 6$ and $x' = (v' - u')/2 = 0$ — one multiplication each, no cosh in sight.` },
      { label: 'What it means', text: t`$x' = 0$: E happens at the boosted observer’s own position. E lies on that observer’s time axis, and their clock reads 6 years there — the proper time from the origin, $\sqrt{uv} = \sqrt{36} = 6$.` },
      { label: 'Sense check', text: t`$-t^2 + x^2 = -42.25 + 6.25 = -36$ and $-t'^2 + x'^2 = -36$ ✓. The boost moved E along its hyperbola until it reached the gold time axis.` },
    ],
    answer: t`$(t', x') = (6, 0)$: the boosted observer passes through E when their clock reads 6 years.`,
  },
  practice: [
    num({
      id: 'boost-event', difficulty: 2,
      gen(r) {
        const [k, ks] = r.pick([[2, '2'], [3, '3'], [4 / 3, t`\tfrac43`]]);
        const [T, X] = r.pick([[5, 1], [4, -2], [6, 3], [3, 2]]);
        const ans = T * ch(k) - X * sh(k);
        return {
          prompt: t`Boost by rapidity $\varphi = \ln ${ks}$. What time $t'$ does the boosted frame give the event $(t, x) = (${T}, ${X})$, in years and light-years?`,
          visual: boostPicture({ k, ev: [T, X], numbers: true }),
          answer: ans, units: 'yr', tol: { rel: 0.003, abs: 0.002 },
          errors: [{ value: T * ch(k) + X * sh(k), feedback: t`A boost toward $+x$ subtracts: $t' = t\cosh\varphi - x\sinh\varphi$.` }],
          hints: [t`$\cosh(\ln k) = \tfrac12(k + 1/k)$ and $\sinh(\ln k) = \tfrac12(k - 1/k)$: here $${fmt(ch(k), 4)}$ and $${fmt(sh(k), 4)}$.`, t`$t' = ${T}\times${fmt(ch(k), 4)} - (${X})\times${fmt(sh(k), 4)}$.`],
          teach: 't′ = t cosh φ − x sinh φ: a boost mixes time and space with hyperbolic functions of the rapidity.',
          explain: t`$t' = ${fmt(ans, 4)}$ years, and $x' = ${fmt(-T * sh(k) + X * ch(k), 4)}$ light-years. Check: $-t'^2 + x'^2 = ${fmt(-(ans ** 2) + (-T * sh(k) + X * ch(k)) ** 2, 4)} = -${T}^2 + ${X}^2$ ✓.`,
        };
      },
    }),
    mcq({
      id: 'preserves', difficulty: 1,
      prompt: t`A rotation of the plane keeps $x^2 + y^2$ fixed, so it moves points around circles. What does a boost keep fixed?`,
      visual: {
        type: 'graph',
        params: { x: [-2.6, 2.6], y: [-0.4, 2.8], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 3.1416], color: 'ink3', dash: true, width: 1.4, label: 'circle', labelAt: 2.4, labelDx: -40, labelDy: -6 }, { param: ['sinh(t)', 'cosh(t)'], t: [-1.5, 1.5], color: 'gold', width: 2.2, label: 'hyperbola', labelAt: 1.2, labelDx: 8 }, { fn: 'x', color: 'warn', dash: true, width: 1 }, { fn: '-x', color: 'warn', dash: true, width: 1 }] },
        caption: 'A circle (what rotations keep) and a hyperbola, with light lines dashed.',
      },
      choices: [t`$-t^2 + x^2$, so it moves events along hyperbolae`, t`$t^2 + x^2$, so it moves events around circles`, t`$t - x$, so it moves events along light rays`, t`$t$, since time is absolute`],
      answer: 0,
      why: {
        1: 'That is what a rotation of the plane keeps. A boost changes t² + x²: it would make a moving clock’s ticks lie on a circle, which they do not.',
        2: t`$t - x$ is multiplied by $e^{\varphi}$: it changes. Only the product $(t - x)(t + x)$ is kept.`,
        3: 'Simultaneity and time intervals change between frames.',
      },
      hints: ['Which combination is the interval?'],
      teach: 'Rotations keep x² + y² (circles); boosts keep −t² + x² (hyperbolae).',
      explain: t`$-t'^2 + x'^2 = -t^2 + x^2$ because $\cosh^2\varphi - \sinh^2\varphi = 1$, exactly as $\cos^2\theta + \sin^2\theta = 1$ keeps circles for rotations.`,
    }),
    num({
      id: 'squeeze', difficulty: 2,
      gen(r) {
        const [u, v] = r.pick([[2, 8], [1, 9], [3, 12], [2, 18]]);
        const [k, ks] = r.pick([[2, '2'], [3, '3']]);
        const up = k * u, vp = v / k, ans = (up + vp) / 2;
        return {
          prompt: t`An event has light-cone coordinates $u = t - x = ${u}$ and $v = t + x = ${v}$ (years). A boost with $e^{\varphi} = ${ks}$ multiplies $u$ by $e^{\varphi}$ and $v$ by $e^{-\varphi}$. What is the event’s time $t'$ in the boosted frame?`,
          visual: squeezePicture({ p: Math.log(k), caption: t`A diamond of events (dashed) and its image under a boost with $e^{\varphi} = ${ks}$ (gold): stretched along one light line by ${ks}, squeezed along the other.` }),
          answer: ans, units: 'yr', tol: { rel: 0.003 },
          errors: [{ value: (u / k + v * k) / 2, feedback: t`Here $u = t - x$ is the one that is stretched: $u' = ${ks}\,u$, $v' = v/${ks}$.` }],
          hints: [t`$u' = ${ks}\times${u} = ${up}$ and $v' = ${v}/${ks} = ${nice(vp, 4)}$.`, t`$t' = (u' + v')/2$.`],
          teach: t`In light-cone coordinates a boost is a squeeze: $u' = e^{\varphi}u$, $v' = e^{-\varphi}v$, and $t' = (u' + v')/2$.`,
          explain: t`$t' = (${up} + ${nice(vp, 4)})/2 = ${nice(ans, 4)}$ years, and $x' = (v' - u')/2 = ${nice((vp - up) / 2, 4)}$. The product $u'v' = ${u * v}$ is unchanged.`,
        };
      },
    }),
    num({
      id: 'rest-rapidity', difficulty: 2,
      gen(r) {
        const [T, X, ks] = r.pick([[5, 3, '\\ln 2'], [13, 5, '\\ln 1.5'], [5, 4, '\\ln 3'], [25, 7, '\\ln(4/3)']]);
        const ans = 0.5 * Math.log((T + X) / (T - X));
        return {
          prompt: t`Event E is at $(t, x) = (${T}, ${X})$ (years, light-years). What rapidity must a frame have for E to happen at its origin’s position, $x' = 0$? Use $\varphi = \tfrac12\ln(v/u)$ with $u = t - x$, $v = t + x$.`,
          visual: boostPicture({ k: null, ev: [T, X], numbers: true, caption: t`E and its hyperbola, $c = 1$. The frame you want has its time axis through E.` }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: X / T, feedback: t`$x/t$ is the speed $\beta$. The rapidity is $\operatorname{artanh}\beta$.` }],
          hints: [t`$x' = 0$ needs $u' = v'$, i.e. $e^{\varphi}u = e^{-\varphi}v$.`, t`$e^{2\varphi} = v/u = ${T + X}/${T - X}$.`],
          teach: t`The frame in which a timelike event sits on the time axis has $e^{2\varphi} = v/u$, i.e. $\beta = x/t$.`,
          explain: t`$\varphi = \tfrac12\ln(${T + X}/${T - X}) = ${ks.startsWith('\\ln') ? ks + ' = ' : ''}${fmt(ans, 4)}$, so $\beta = \tanh\varphi = ${nice(X / T, 4)} = x/t$, as it must be: that frame’s clock coasts from the origin to E.`,
        };
      },
    }),
    expr({
      id: 'squeeze-proof', difficulty: 3,
      prompt: t`Starting from $t' = t\cosh\varphi - x\sinh\varphi$ and $x' = -t\sinh\varphi + x\cosh\varphi$, simplify $t' - x'$. (Use $\cosh\varphi + \sinh\varphi = e^{\varphi}$.)`,
      visual: squeezePicture({ p: 0.7, caption: t`The squeeze at $\varphi = 0.7$: lines of constant $t - x$ move apart by $e^{0.7} \approx 2$.` }),
      answer: 'e^phi*(t - x)', answerTeX: t`e^{\varphi}(t - x)`, lhs: "t' - x'",
      vars: { t: [-3, 3], x: [-3, 3], phi: [-1, 1] },
      errors: [{ answer: 'e^(-phi)*(t - x)', feedback: t`Collect the terms: $t(\cosh\varphi + \sinh\varphi) - x(\sinh\varphi + \cosh\varphi)$ — both are $e^{+\varphi}$.` }, { answer: 't - x', feedback: 'The difference changes; it is the product (t − x)(t + x) that a boost keeps.' }],
      hints: [t`$t' - x' = t\cosh\varphi - x\sinh\varphi + t\sinh\varphi - x\cosh\varphi$.`, t`Group: $t(\cosh\varphi + \sinh\varphi) - x(\cosh\varphi + \sinh\varphi)$.`],
      teach: t`A boost multiplies $u = t - x$ by $e^{\varphi}$ and $v = t + x$ by $e^{-\varphi}$: the light rays are its eigen-directions.`,
      explain: t`$t' - x' = (\cosh\varphi + \sinh\varphi)(t - x) = e^{\varphi}(t - x)$, and similarly $t' + x' = e^{-\varphi}(t + x)$. Their product is unchanged — the invariance of the interval in one line.`,
    }),
    mcq({
      id: 'eigen', difficulty: 2,
      prompt: 'A boost maps every direction in the (x, t) plane to a new direction, except for some special ones that it only stretches or shrinks. Which?',
      visual: squeezePicture({ p: -0.6, caption: 'A boost by φ = −0.6: the diamond’s edges lie along light rays before and after — they are stretched or shrunk, never tilted.' }),
      choices: ['The two light rays, x = t and x = −t', 'The time axis', 'The space axis', 'None: a boost tilts every direction'],
      answer: 0,
      why: {
        1: 'The time axis tilts to the moving observer’s worldline, x = βt.',
        2: 'The space axis tilts to t = βx, the moving observer’s line of “now”.',
        3: 'Light moves at 1 in every frame, so a light ray’s direction cannot change — only how far along it an event sits.',
      },
      hints: ['What has the same speed in every frame?'],
      teach: t`The eigenvectors of a boost are the light rays; the eigenvalues are the Doppler factors $e^{\pm\varphi}$.`,
      explain: t`Along $x = t$ only $v$ changes, along $x = -t$ only $u$, by the factors $e^{\mp\varphi}$. That those factors are the Doppler shifts is no accident: a light wave’s period is measured along its own ray.`,
    }),
    mcq({
      id: 'thomas', difficulty: 3,
      prompt: t`Boosts along one line commute and add their rapidities. What happens if you boost along $x$ and then along $y$, compared with $y$ first and then $x$?`,
      visual: { type: 'graph', params: { x: [-0.3, 2.3], y: [-0.3, 2.3], equal: true, aspect: 'wide', xlabel: 'velocity along x (c)', ylabel: 'velocity along y (c)',
        curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 1.5708], color: 'warn', dash: true, width: 1.2, label: 'speed of light', labelAt: 0.75, labelDx: 8 }],
        arrows: [{ from: [0, 0], to: [0.6, 0], color: 'gold', label: 'x first' }, { from: [0.6, 0], to: [0.6, 0.64], color: 'gold' }, { from: [0, 0], to: [0, 0.6], color: 'violet', label: 'y first', labelDx: -8, labelAlign: 'right' }, { from: [0, 0], to: [0.64, 0.6], color: 'violet' }] },
        caption: 'Velocity space, schematic: the two orders lead to final velocities of the same size in different directions. Lengths are not exact.' },
      choices: ['The results differ by a rotation of space (Thomas–Wigner rotation)', 'The results are identical, as for boosts along one line', 'The results differ by a further boost along the line of sight', 'The second boost fails if the first exceeds 0.5c'],
      answer: 0,
      why: {
        1: 'Boosts in different directions do not commute; only collinear boosts form a simple adding family.',
        2: 'Both orders give the same speed; what differs is the orientation of the final frame’s axes.',
        3: 'There is no such limit; boosts compose at any speeds below c.',
      },
      hints: ['Rotations about different axes do not commute either.', 'The combined result is a boost followed by a rotation.'],
      teach: 'Non-collinear boosts do not commute; their composition includes a rotation — the origin of Thomas precession.',
      explain: 'Two boosts in different directions compose into a single boost followed by a spatial rotation, and the two orders differ by such a rotation. An electron orbiting a nucleus is boosted continually in changing directions, and the accumulated rotation, Thomas precession, shifts its spin–orbit energy by a factor of one half — measured in atomic spectra.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pulse-rate', difficulty: 2, transfer: true,
      gen(r) {
        const [b, bs, k] = r.pick([[0.6, '0.6', 2], [0.8, '0.8', 3], [5 / 13, t`\tfrac{5}{13}`, 1.5]]);
        const P = r.pick([1, 2.5, 4]);
        const ans = P * k;
        return {
          prompt: t`A deep-space beacon on Earth flashes every ${P} s. A probe recedes from Earth at $${bs}c$. By the probe’s own clock, how long between the flashes it receives? (Successive flashes travel along parallel light rays; the boost stretches their spacing by $e^{\varphi}$.)`,
          visual: squeezePicture({ p: Math.log(k), caption: t`Light rays along one direction get spaced $e^{\varphi}$ times farther apart by the boost to the receding frame.` }),
          answer: ans, units: 's', tol: { rel: 0.003 },
          errors: [{ value: P / k, feedback: 'A receding receiver gets the flashes farther apart, not closer.' }, { value: P / Math.sqrt(1 - b * b), feedback: t`That is time dilation alone, $\gamma P$. The light also has farther to go each time: the factor is $e^{\varphi} = \gamma(1 + \beta)$.` }],
          hints: [t`$e^{\varphi} = \sqrt{(1 + \beta)/(1 - \beta)}$.`, t`Here $e^{\varphi} = ${nice(k, 3)}$.`],
          teach: t`The Doppler factor is the boost’s eigenvalue $e^{\varphi}$: signal spacings along a light ray scale by it.`,
          explain: t`$${P}\ \text{s}\times${nice(k, 3)} = ${nice(ans, 4)}$ s on the probe’s clock.`,
        };
      },
    }),
    num({
      id: 'cp-boost', difficulty: 2,
      gen(r) {
        const [k, ks] = r.pick([[2, '2'], [3, '3']]);
        const [T, X] = r.pick([[4, 3], [2, -1], [7, 2]]);
        const ans = -T * sh(k) + X * ch(k);
        return {
          prompt: t`With $\varphi = \ln ${ks}$, find $x'$ for the event $(t, x) = (${T}, ${X})$.`,
          visual: boostPicture({ k, ev: [T, X], numbers: true }),
          answer: ans, units: 'ly', tol: { rel: 0.003, abs: 0.002 },
          hints: [t`$x' = -t\sinh\varphi + x\cosh\varphi$.`],
          teach: 'x′ = −t sinh φ + x cosh φ.',
          explain: t`$x' = -${T}\times${fmt(sh(k), 4)} + (${X})\times${fmt(ch(k), 4)} = ${fmt(ans, 4)}$ light-years.`,
        };
      },
    }),
    mcq({
      id: 'cp-area', difficulty: 2,
      prompt: 'A boost turns a small diamond of events on a spacetime diagram into a longer, thinner one. How does its area compare?',
      visual: squeezePicture({ p: 0.8, caption: 'A diamond of events (dashed) and its boosted image (gold).' }),
      choices: ['It is the same: the boost’s determinant is cosh²φ − sinh²φ = 1', 'It is larger by γ', 'It is smaller by 1/γ', 'It depends on where the diamond is'],
      answer: 0,
      why: { 1: t`One direction stretches by $e^{\varphi}$, the other shrinks by $e^{-\varphi}$: the factors cancel.`, 2: 'One direction shrinks, but the other stretches by the inverse factor.', 3: 'A boost is linear: every region changes the same way.' },
      hints: ['Multiply the stretch along one light ray by the squeeze along the other.'],
      teach: 'Boosts preserve spacetime area: the squeeze stretches one light direction exactly as much as it shrinks the other.',
      explain: t`$e^{\varphi}\times e^{-\varphi} = 1$: the area of any region of events is the same in every inertial frame.`,
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §5.1–5.3 (Lorentz boosts, rapidity)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Bondi, Relativity and Common Sense (1964): the k-calculus', url: 'https://archive.org/details/relativitycommon0000bond' },
    { label: 'Thomas (1926), The motion of the spinning electron, Nature 117, 514', url: 'https://doi.org/10.1038/117514a0' },
  ],
});
