// Four-velocity and four-momentum, in Hartle's (−, +, +, +) sign with c = 1:
// u = dx/dτ as the unit tangent of a worldline (its tip on the unit
// hyperbola), u·u = −1, p = m u with p·p = −m², and the energy an observer
// measures as the scalar E = −p·u_obs. Builds on gr.S04.d (u·u, π → μν,
// invariant masses, the LHC proton's 1 − β) and phys2710.MP3.3 (E² − p² = m²)
// without repeating their examples: here the tangent-vector picture, the
// observer's energy as a dot product, relative speed from −u·u′ = γ_rel, and
// proper velocity.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';
import { r6, st, label } from './_geom.js';

const t = String.raw;
const MP = 938.27208816;          // MeV, proton rest energy (CODATA 2018)
const gam = (b) => 1 / Math.sqrt(1 - b * b);

/** A worldline through the origin at speed b, with its four-velocity arrow (tip on the unit hyperbola). */
function uPicture({ b, top = 2.6, arrows = true, numbers = false, name = 'u', caption, extra = {} }) {
  const g = gam(b);
  const x = [-0.9, Math.max(1.6, g * Math.abs(b) + 0.8)], tt = [-0.25, top];
  return st({
    x, t: tt, cones: [[0, 0, 'future']], numbers, xlabel: 'x', ylabel: 't',
    hyper: [{ s: 1, kind: 'time', color: 'ink3', dash: true }],
    lines: [{ pts: [[0, 0], [b * top, top]], color: 'accent', width: 2.2 }],
    extra: {
      arrows: [...(arrows ? [{ from: [0, 0], to: [r6(g * b), r6(g)], color: 'gold', width: 2.8, label: name, labelDx: 8, labelDy: 2 }] : []), ...(extra.arrows || [])],
      points: [label(-0.75, 1.55, 'u·u = −1', 'ink3', 0, 0), ...(extra.points || [])],
      curves: extra.curves || [],
    },
    caption: caption ?? t`One direction of space, $c = 1$. Blue: a worldline. Gold: its four-velocity, whose tip lies on the grey hyperbola $-t^2 + x^2 = -1$ — the spacetime “unit circle”. Dashed orange: light.`,
  });
}

// worked example: a proton seen by a detector riding a second beam
const EX = { E: 2000, bo: 0.5 };
EX.p = Math.sqrt(EX.E ** 2 - MP ** 2);
EX.go = gam(EX.bo);
EX.Eobs = EX.go * (EX.E - EX.bo * EX.p);
EX.pobs = EX.go * (EX.p - EX.bo * EX.E);

export default lesson({
  id: 'phys3710.R3.1',
  title: 'Four-velocity and four-momentum',
  minutes: 12, difficulty: 3,
  intro: t`A particle’s worldline is a curve in spacetime, and its **four-velocity** is the curve’s tangent, measured per tick of the particle’s own clock. Multiply by the mass and you have the **four-momentum**, whose components are the energy and momentum (with $c = 1$):

$$u^\mu = \frac{dx^\mu}{d\tau} = \gamma\,(1,\ \vec v), \qquad p^\mu = m\,u^\mu = (E,\ \vec p)$$

Because $d\tau^2 = -ds^2$, every four-velocity has the same length: $\mathbf u\cdot\mathbf u = -1$, and so $\mathbf p\cdot\mathbf p = -m^2$. And the energy that any observer measures is one dot product, $E_{\text{obs}} = -\mathbf p\cdot\mathbf u_{\text{obs}}$ — a number every frame agrees on. [Four-velocity, four-momentum and invariants](#/lesson/gr.S04.d) used these invariants for decays and invariant masses; here is the geometry underneath them.`,
  symbols: [
    { tex: 'x^\\mu', text: t`an event’s coordinates $(t, x, y, z)$ in one inertial frame; the index $\mu$ runs over 0, 1, 2, 3` },
    { tex: '\\tau', text: 'the proper time read by the particle’s own clock, in years, seconds or metres (c = 1)' },
    { tex: 'u^\\mu', text: t`the four-velocity: how far the particle moves through each coordinate per unit of its proper time. Dimensionless when $c = 1$` },
    { tex: '\\gamma', text: t`the Lorentz factor $1/\sqrt{1 - v^2}$ of the particle in that frame` },
    { tex: '\\vec v', text: 'the ordinary velocity dx/dt, as a fraction of c' },
    { tex: 'm', text: t`the mass: the same in every frame, in MeV (that is, MeV/$c^2$) or kg` },
    { tex: 'E,\\ \\vec p', text: t`the energy and momentum in that frame, $E = \gamma m$ and $\vec p = \gamma m\vec v$, in MeV (MeV/$c$ for momentum)` },
    { tex: '\\mathbf a\\cdot\\mathbf b', text: t`the spacetime dot product $-a^0b^0 + a^1b^1 + a^2b^2 + a^3b^3$, signature $(-,+,+,+)$ as in Hartle and lesson R1.2` },
  ],
  why: 'In general relativity there are no global frames, only observers with four-velocities: every measured energy, frequency and rate becomes −p·u, which is why this one formula carries the redshift of light climbing out of a black hole.',
  visual: {
    type: 'graph',
    title: 'The tangent to a worldline, one proper-time tick long',
    lead: t`The blue line is a particle coasting at speed $\beta$. The gold arrow is its four-velocity $\mathbf u$; the thin violet arrow is the tangent per unit of *your* time, $(1, \beta)$. The readouts give the components and the dot product $\mathbf u\cdot\mathbf u$, and what a proton moving this way carries.`,
    tasks: [
      t`Slide $\beta$ toward 0.95: the gold tip races out along the grey hyperbola and both components grow without limit, yet $\mathbf u\cdot\mathbf u$ stays $-1$.`,
      t`Set $\beta = 0$: $\mathbf u = (1, 0)$ points straight up the time axis. An observer’s four-velocity *is* their direction of time.`,
      t`Compare the arrows at high speed: the violet one stops at $t = 1$ while the gold one goes much further. Per tick of the moving clock, more of your time passes: that stretch is $\gamma$.`,
    ],
    params: {
      x: [-1.2, 3.6], y: [-0.3, 3.7], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x', ylabel: 't',
      sliders: [{ key: 'b', label: t`Particle speed $\beta = v$`, min: -0.95, max: 0.95, step: 0.01, value: 0.6, explain: t`With $c = 1$ the speed is a fraction of light’s.` }],
      curves: [
        { fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 },
        { param: ['sinh(t)', 'cosh(t)'], t: [-1.6, 2], color: 'ink3', width: 1.4, dash: true },
        { param: ['b*t', 't'], t: [-0.3, 3.7], color: 'accent', width: 2.2 },
      ],
      arrows: [
        { from: [0, 0], to: ['b/sqrt(1 - b^2)', '1/sqrt(1 - b^2)'], color: 'gold', width: 4.5, label: 'u', labelDx: 8 },
        { from: [0, 0], to: ['b', 1], color: 'violet', width: 1.8, label: 'per unit t', labelDx: 10, labelDy: 14 },
      ],
      points: [label(-1.0, 1.75, 'u·u = −1', 'ink3', 0, 0)],
      readouts: [
        { label: t`$u^t = \gamma$`, expr: '1/sqrt(1 - b^2)', digits: 4 },
        { label: t`$u^x = \gamma\beta$`, expr: 'b/sqrt(1 - b^2)', digits: 4 },
        { label: t`$\mathbf u\cdot\mathbf u = -(u^t)^2 + (u^x)^2$`, expr: '-(1/(1 - b^2)) + b^2/(1 - b^2)', digits: 4 },
        { label: t`proton: $E = m u^t$`, expr: `${MP}/sqrt(1 - b^2)`, digits: 4, unit: t`\text{MeV}` },
        { label: t`proton: $p^x = m u^x$`, expr: `${MP}*b/sqrt(1 - b^2)`, digits: 4, unit: t`\text{MeV}/c` },
      ],
    },
    caption: t`One direction of space, $c = 1$. The grey hyperbola $-t^2 + x^2 = -1$ holds the tip of every four-velocity, as the unit circle holds every unit vector in a plane. On paper the gold arrow looks longer at high speed; in spacetime’s geometry its length never changes.`,
  },
  example: {
    prompt: t`A proton in a beam has energy $E = ${EX.E}$ MeV and moves along $+x$ in the laboratory. A detector rides along $+x$ at $\beta_{\text{obs}} = ${EX.bo}$. What energy does the detector measure for the proton? ($m = ${nice(MP, 9)}$ MeV.)`,
    visual: uPicture({ b: EX.p / EX.E, name: 'u (proton)', caption: t`Laboratory frame, $c = 1$. Blue: the proton’s worldline, with its four-velocity in gold. The detector’s four-velocity (violet) is tilted less: it moves at only $${EX.bo}$.`,
      extra: { arrows: [{ from: [0, 0], to: [r6(EX.bo * gam(EX.bo)), r6(gam(EX.bo))], color: 'violet', width: 2.4, label: 'u (detector)', labelDx: -8, labelDy: -4, labelAlign: 'right' }] } }),
    steps: [
      { label: 'The proton’s four-momentum', text: t`$p^x = \sqrt{E^2 - m^2} = \sqrt{${EX.E}^2 - ${nice(MP, 6)}^2} = ${nice(EX.p, 5)}$ MeV, so in the lab $p^\mu = (${EX.E},\ ${nice(EX.p, 5)},\ 0,\ 0)$ MeV.` },
      { label: 'The detector’s four-velocity', text: t`$\gamma_{\text{obs}} = 1/\sqrt{1 - ${EX.bo}^2} = ${nice(EX.go, 5)}$, so $u_{\text{obs}}^\mu = \gamma_{\text{obs}}(1, \beta_{\text{obs}}, 0, 0) = (${nice(EX.go, 5)},\ ${nice(EX.go * EX.bo, 5)},\ 0,\ 0)$.` },
      { label: 'One dot product', text: t`$E_{\text{obs}} = -\mathbf p\cdot\mathbf u_{\text{obs}} = -\left(-p^t u^t_{\text{obs}} + p^x u^x_{\text{obs}}\right) = ${EX.E}\times${nice(EX.go, 5)} - ${nice(EX.p, 5)}\times${nice(EX.go * EX.bo, 5)} = ${nice(EX.Eobs, 5)}$ MeV.` },
      { label: 'Why it works', text: t`In the detector’s own frame $\mathbf u_{\text{obs}} = (1, 0, 0, 0)$, and $-\mathbf p\cdot\mathbf u_{\text{obs}} = p^t$: exactly the energy it measures. A dot product is the same in every frame, so you may compute it in the lab instead — no Lorentz transformation needed.` },
      { label: 'Sense check', text: t`The detector would find momentum $\gamma_{\text{obs}}(p^x - \beta_{\text{obs}}E) = ${nice(EX.pobs, 5)}$ MeV, and $E_{\text{obs}}^2 - p_{\text{obs}}^2 = ${tex(EX.Eobs ** 2 - EX.pobs ** 2, 6)}\ \text{MeV}^2 = m^2$ ✓. Chasing the proton lowers its energy, but never below $m$.` },
    ],
    answer: t`$E_{\text{obs}} = -\mathbf p\cdot\mathbf u_{\text{obs}} = ${nice(EX.Eobs, 4)}$ MeV.`,
  },
  practice: [
    num({
      id: 'u-components', difficulty: 1,
      gen(r) {
        const [b, bs] = r.pick([[5 / 13, t`\tfrac{5}{13}`], [8 / 17, t`\tfrac{8}{17}`], [20 / 29, t`\tfrac{20}{29}`], [12 / 37, t`\tfrac{12}{37}`], [0.96, '0.96']]);
        const g = gam(b), ans = g * b;
        return {
          prompt: t`A probe coasts along $+x$ at $\beta = ${bs}$. What is the space component $u^x$ of its four-velocity (with $c = 1$)?`,
          visual: uPicture({ b, arrows: false, caption: t`The probe’s worldline (blue) through the unit hyperbola (grey), $c = 1$. Its four-velocity points along the worldline and ends on the hyperbola.` }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: b, feedback: t`That is $dx/dt$. The four-velocity is per unit *proper* time: $u^x = dx/d\tau = \gamma\,dx/dt$.` }, { value: g, feedback: t`That is $u^t = \gamma$, the time component. The space component carries one more factor, $\beta$.` }],
          hints: [t`$u^\mu = \gamma(1, \beta)$, so $u^x = \gamma\beta$.`, t`$\gamma = 1/\sqrt{1 - \beta^2} = ${nice(g, 5)}$.`],
          teach: t`The four-velocity is $\gamma(1, \vec v)$: the ordinary velocity stretched by $\gamma$, plus a time component $\gamma$.`,
          explain: t`$u^x = \gamma\beta = ${nice(g, 5)}\times${nice(b, 4)} = ${nice(ans, 4)}$. Check: $-(u^t)^2 + (u^x)^2 = -${nice(g * g, 5)} + ${nice(ans * ans, 5)} = -1$.`,
        };
      },
    }),
    mcq({
      id: 'which-arrow', difficulty: 2,
      prompt: t`Three arrows leave the origin of a spacetime diagram ($c = 1$): P ends at $(x, t) = (\tfrac{5}{12}, \tfrac{13}{12})$, Q at $(1.2, 0.9)$ and R at $(0.5, 0.8)$. Which could be a four-velocity?`,
      visual: st({ x: [-0.6, 1.6], t: [-0.2, 1.8], cones: [[0, 0, 'future']], xlabel: 'x', ylabel: 't', hyper: [{ s: 1, kind: 'time', color: 'ink3' }],
        extra: { arrows: [
          { from: [0, 0], to: [r6(5 / 12), r6(13 / 12)], color: 'gold', width: 2.4, label: 'P', labelDx: 6 },
          { from: [0, 0], to: [1.2, 0.9], color: 'violet', width: 2.4, label: 'Q', labelDx: 6 },
          { from: [0, 0], to: [0.5, 0.8], color: 'teal', width: 2.4, label: 'R', labelDx: 6, labelDy: 10 },
        ] },
        caption: t`$c = 1$. Grey: the hyperbola $-t^2 + x^2 = -1$. Dashed orange: the light cone of the origin.` }),
      choices: ['P only', 'Q only', 'R only', 'P and R'],
      answer: 0,
      why: {
        1: t`Q is outside the light cone: $-0.81 + 1.44 > 0$, a spacelike arrow. No particle’s worldline can point that way.`,
        2: t`R points the right way (inside the cone) but $-0.64 + 0.25 = -0.39$, not $-1$: it is the right direction with the wrong length.`,
        3: t`R is timelike, but a four-velocity must also have $\mathbf u\cdot\mathbf u = -1$, and R’s is $-0.39$.`,
      },
      hints: [t`A four-velocity is timelike and has $\mathbf u\cdot\mathbf u = -t^2 + x^2 = -1$.`, 'Its tip must lie exactly on the grey hyperbola.'],
      teach: t`Every four-velocity is a future-pointing timelike arrow with $\mathbf u\cdot\mathbf u = -1$: its tip lies on the unit hyperbola.`,
      explain: t`For P, $-\left(\tfrac{13}{12}\right)^2 + \left(\tfrac{5}{12}\right)^2 = -\tfrac{144}{144} = -1$ ✓ — a particle at $\beta = \tfrac{5}{13}$. Q is spacelike; R is too short.`,
    }),
    num({
      id: 'v-from-p', difficulty: 2,
      gen(r) {
        const [name, m, pz] = r.pick([['A kaon', 493.677, 1200], ['A proton', MP, 1500], ['A muon', 105.6583755, 250], ['A deuteron', 1875.613, 3000]]);
        const E = Math.hypot(m, pz), ans = pz / E;
        return {
          prompt: t`${name} in a detector has four-momentum $p^\mu = (${nice(E, 5)},\ ${pz},\ 0,\ 0)$ MeV in the laboratory. How fast is it moving, as a fraction of $c$?`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.25 * pz], y: [0, 1.25 * E], aspect: 'wide', xlabel: 'momentum p (MeV/c)', ylabel: 'energy E (MeV)', axesAt: 'edge',
              curves: [{ fn: `sqrt(${r6(m * m)} + x^2)`, color: 'ink3', dash: true, label: 'E² − p² = m²', labelAt: r6(0.25 * pz), labelDy: -14 }, { fn: 'x', color: 'warn', dash: true, width: 1.2 }],
              arrows: [{ from: [0, 0], to: [pz, r6(E)], color: 'gold', width: 2.6, label: 'p', labelDx: 8 }] },
            caption: t`The four-momentum drawn on the energy–momentum plane ($c = 1$): its tip lies on the particle’s mass hyperbola. The dashed orange line is $E = p$, where massless particles live.`,
          },
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: pz / m, feedback: t`$p/m = \gamma\beta$, the space part of the four-velocity. The speed is $p/E$.` }],
          hints: [t`$p^\mu = m u^\mu = m\gamma(1, \vec v)$: divide the space part by the time part.`, t`$v = p/E$ (with $c = 1$).`],
          teach: t`The speed is the ratio of the four-momentum’s space and time components: v = p/E, with c = 1.`,
          explain: t`$v = ${pz}/${nice(E, 5)} = ${nice(ans, 4)}$. The mass is $\sqrt{E^2 - p^2} = ${nice(m, 6)}$ MeV, and $\gamma = E/m = ${nice(E / m, 4)}$.`,
        };
      },
    }),
    expr({
      id: 'eobs-general', difficulty: 2,
      prompt: t`A particle has energy $E$ and momentum $p$ along $+x$ in the laboratory. An observer moves along $+x$ at speed $\beta$, so $u_{\text{obs}}^\mu = \gamma(1, \beta, 0, 0)$ with $\gamma = 1/\sqrt{1 - \beta^2}$. Find the energy the observer measures, $E_{\text{obs}} = -\mathbf p\cdot\mathbf u_{\text{obs}}$, in terms of $E$, $p$ and $\beta$.`,
      visual: uPicture({ b: 0.45, name: 'u (observer)', caption: t`Laboratory frame, $c = 1$. The gold arrow is the observer’s four-velocity, on the unit hyperbola; the particle (not drawn) has four-momentum $(E, p)$.` }),
      answer: '(E - beta p)/sqrt(1 - beta^2)', answerTeX: t`\frac{E - \beta p}{\sqrt{1 - \beta^2}}`, lhs: 'E_{\\text{obs}}',
      vars: { E: [3, 5], p: [0.2, 2.5], beta: [-0.8, 0.8] },
      errors: [{ answer: '(E + beta p)/sqrt(1 - beta^2)', feedback: t`Check the signs: $\mathbf p\cdot\mathbf u = -E\gamma + p\gamma\beta$, and $E_{\text{obs}}$ is minus that.` }, { answer: 'E/sqrt(1 - beta^2)', feedback: t`You kept only the time parts. The space parts $p^x u^x$ contribute too.` }],
      hints: [t`$\mathbf p\cdot\mathbf u = -p^t u^t + p^x u^x$ with $p^\mu = (E, p, 0, 0)$.`, t`$\mathbf p\cdot\mathbf u_{\text{obs}} = -E\gamma + p\gamma\beta$.`],
      teach: t`The energy an observer measures is $-\mathbf p\cdot\mathbf u_{\text{obs}}$: for motion along one line it is the Lorentz transformation of $E$.`,
      explain: t`$E_{\text{obs}} = \gamma(E - \beta p)$ — the time row of the Lorentz transformation, obtained without writing the transformation down.`,
    }),
    num({
      id: 'relative-speed', difficulty: 3,
      gen(r) {
        const [[bA, sA], [bB, sB]] = r.pick([[[0.6, '0.6'], [0.8, '0.8']], [[0.8, '0.8'], [0.8, '0.8']], [[5 / 13, t`\tfrac{5}{13}`], [0.6, '0.6']], [[12 / 13, t`\tfrac{12}{13}`], [0.6, '0.6']]]);
        const gR = gam(bA) * gam(bB), ans = Math.sqrt(1 - 1 / (gR * gR));
        return {
          prompt: t`In the Sun’s frame, probe A moves along $x$ at $${sA}c$ and probe B along $y$ at $${sB}c$. Their four-velocities are $\mathbf u_A = \gamma_A(1, ${sA}, 0, 0)$ and $\mathbf u_B = \gamma_B(1, 0, ${sB}, 0)$. Since $-\mathbf u_A\cdot\mathbf u_B$ is the Lorentz factor of each as seen by the other, how fast does A see B move? Give $v/c$.`,
          visual: {
            type: 'graph',
            params: { x: [-0.3, 1.2], y: [-0.3, 1.1], equal: true, aspect: 'wide', xlabel: 'velocity along x (c)', ylabel: 'velocity along y (c)', axesAt: 'edge',
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 1.5708], color: 'warn', dash: true, width: 1.2, label: 'speed of light', labelAt: 0.5, labelDx: 6 }],
              arrows: [{ from: [0, 0], to: [r6(bA), 0], color: 'gold', width: 2.6, label: 'A', labelDy: 14 }, { from: [0, 0], to: [0, r6(bB)], color: 'violet', width: 2.6, label: 'B', labelDx: 8 }] },
            caption: t`The two velocities in the Sun’s frame, drawn in space. Adding them as ordinary arrows would give a relative speed of $\sqrt{${nice(bA * bA + bB * bB, 4)}}\,c$ — the Galilean answer, which is wrong.`,
          },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: Math.sqrt(bA * bA + bB * bB), feedback: t`That is the Galilean relative velocity. Use the dot product: $-\mathbf u_A\cdot\mathbf u_B$ is the relative $\gamma$.` }],
          hints: [t`The space parts are perpendicular, so $\mathbf u_A\cdot\mathbf u_B = -\gamma_A\gamma_B$ and $\gamma_{\text{rel}} = \gamma_A\gamma_B$.`, t`$\gamma_A\gamma_B = ${nice(gam(bA), 5)}\times${nice(gam(bB), 5)} = ${nice(gR, 5)}$; then $v = \sqrt{1 - 1/\gamma_{\text{rel}}^2}$.`],
          teach: t`The relative Lorentz factor of two observers is $-\mathbf u_A\cdot\mathbf u_B$, a scalar: compute it in any frame.`,
          explain: t`$\gamma_{\text{rel}} = ${nice(gR, 5)}$, so $v/c = \sqrt{1 - 1/${nice(gR, 5)}^2} = ${nice(ans, 4)}$ — below 1, as it must be. In A’s frame, A is at rest, $\mathbf u_A = (1, 0, 0, 0)$, and $-\mathbf u_A\cdot\mathbf u_B = u_B^t$: B’s $\gamma$ there.`,
        };
      },
    }),
    multi({
      id: 'invariants', difficulty: 2,
      prompt: 'A proton flies through a laboratory. Which of these numbers do all inertial observers agree on? Select every one.',
      visual: uPicture({ b: 0.7, name: 'u (proton)', caption: t`The proton’s worldline and four-velocity in the laboratory frame, $c = 1$. A different observer would draw different components for the same arrow.` }),
      choices: [
        t`$\sqrt{-\mathbf p\cdot\mathbf p}$, the proton’s mass`,
        t`$\mathbf u\cdot\mathbf u$`,
        t`$-\mathbf p\cdot\mathbf u_D$, where $\mathbf u_D$ is the four-velocity of one particular detector D`,
        t`the energy $p^t$ in the laboratory frame’s coordinates, as computed by each observer in their own frame`,
        t`the component $p^x$`,
        t`$u^t$`,
      ],
      answer: [0, 1, 2],
      why: {
        3: 'Each observer’s own time component of p is the energy in their frame, and it differs from frame to frame.',
        4: 'A component changes under a boost.',
        5: t`$u^t = \gamma$ depends on who is measuring the speed.`,
      },
      hints: ['A dot product of two four-vectors is a scalar: every frame computes the same number.', t`“The energy D measures” names one observer, so it is a dot product: $-\mathbf p\cdot\mathbf u_D$.`],
      teach: t`Dot products of four-vectors are invariant; single components are not — but the energy measured by a named observer is a dot product, so everyone agrees on it.`,
      explain: t`Mass, $\mathbf u\cdot\mathbf u = -1$, and “the energy detector D measures” are all dot products, so every frame gets the same numbers. A component such as $p^t$, $p^x$ or $u^t$ belongs to one frame.`,
    }),
    num({
      id: 'proper-velocity', difficulty: 2,
      gen(r) {
        const [D, T] = r.pick([[12, 5], [9, 4], [8, 2], [15, 4]]);
        const U = D / T, ans = U / Math.sqrt(1 + U * U);
        return {
          prompt: t`A starship coasts to a star ${D} light-years away (measured in the galaxy’s frame). Its own clock records ${T} years for the trip. So $u^x = dx/d\tau = ${nice(U, 4)}$ — more than 1, which is allowed. What is its ordinary speed $v = dx/dt$, as a fraction of $c$?`,
          visual: st({ x: [-1, D + 2], t: [-0.6, Math.hypot(D, T) + 1.5], cones: [[0, 0, 'future']], numbers: false, xlabel: 'x (light-years)', ylabel: 't (years)',
            lines: [{ pts: [[0, 0], [D, Math.hypot(D, T)]], color: 'accent', width: 2.4, label: 'starship', at: 0, dx: -10, align: 'right' }],
            events: [[0, 0, 'launch', 'accent2', 9, 12], [D, Math.hypot(D, T), 'arrival', 'gold', -10, -6, 'right']],
            caption: 'The galaxy’s frame, c = 1. The worldline hugs the light line: the trip takes only slightly longer than light would.' }),
          answer: ans, tol: { rel: 0.001 },
          errors: [{ value: U, feedback: t`That is the proper velocity $dx/d\tau$, which can exceed 1. The ordinary speed is $u^x/u^t$.` }],
          hints: [t`$u^t = \sqrt{1 + (u^x)^2}$, from $-(u^t)^2 + (u^x)^2 = -1$.`, t`$v = u^x/u^t = ${nice(U, 4)}/\sqrt{1 + ${nice(U * U, 5)}}$.`],
          teach: t`Proper velocity $dx/d\tau = \gamma v$ has no upper limit; the speed $v = u^x/u^t$ always stays below 1.`,
          explain: t`$u^t = \sqrt{1 + ${nice(U * U, 5)}} = ${nice(Math.sqrt(1 + U * U), 5)}$, so $v = ${nice(U, 4)}/${nice(Math.sqrt(1 + U * U), 5)} = ${nice(ans, 4)}c$. The galaxy’s clocks record $u^t\times${T} = ${nice(Math.hypot(D, T), 4)}$ years for the trip.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sail', difficulty: 3, transfer: true,
      gen(r) {
        const b = r.pick([0.2, 0.25, 0.3]);
        const K = (gam(b) - 1) * MP;
        return {
          prompt: t`A proposed laser-driven light sail would cross interstellar space at $${b}c$. Interstellar hydrogen is essentially at rest in the galaxy’s frame. What kinetic energy does a hydrogen nucleus (a proton, $m = 938.27$ MeV) have in the sail’s frame, in MeV? Use $E_{\text{sail}} = -\mathbf p\cdot\mathbf u_{\text{sail}}$.`,
          visual: uPicture({ b, name: 'u (sail)', caption: t`The galaxy’s frame, $c = 1$: the sail’s worldline and four-velocity. The proton sits still on the time axis, $\mathbf p = (m, 0, 0, 0)$.` }),
          answer: K, units: 'MeV', tol: { rel: 0.005 },
          errors: [{ value: 0.5 * MP * b * b, feedback: t`That is Newton’s $\tfrac12 mv^2$. Use $E = -\mathbf p\cdot\mathbf u = \gamma m$, then subtract $m$.` }, { value: gam(b) * MP, feedback: 'That is the total energy. Kinetic energy is E − m.' }],
          hints: [t`With $\mathbf p = (m, 0, 0, 0)$ and $\mathbf u_{\text{sail}} = \gamma(1, \beta, 0, 0)$, $-\mathbf p\cdot\mathbf u = \gamma m$.`, t`$K = (\gamma - 1)m$.`],
          teach: 'The energy a moving observer measures for a particle at rest is γm: kinetic energy (γ − 1)m.',
          explain: t`$\gamma = ${nice(gam(b), 5)}$, so $K = ${nice(gam(b) - 1, 4)}\times938.27 = ${nice(K, 4)}$ MeV per proton — a steady beam of fast protons striking the sail, a radiation and erosion problem that any such mission would have to solve. The mission is a proposal; nothing has flown.`,
        };
      },
    }),
    num({
      id: 'cp-lhc', difficulty: 3, transfer: true,
      prompt: t`In the Large Hadron Collider two proton beams meet head-on, each proton with $\gamma = ${nice(6.8e6 / MP, 5)}$ (6.8 TeV) in the laboratory. Their four-velocities are $\gamma(1, \pm\beta, 0, 0)$. What Lorentz factor does one proton have as seen by the other? (Use $\gamma_{\text{rel}} = -\mathbf u_1\cdot\mathbf u_2$.)`,
      visual: st({ x: [-2.2, 2.2], t: [-0.2, 3], cones: [[0, 0, 'future']], xlabel: 'x', ylabel: 't',
        lines: [{ pts: [[0, 0], [2.0 * 0.92, 2.0]], color: 'accent', width: 2.2 }, { pts: [[0, 0], [-2.0 * 0.92, 2.0]], color: 'violet', width: 2.2 }],
        caption: 'Laboratory frame, c = 1, after the protons pass through each other. Their worldlines are drawn at 0.92c so they can be told from the light lines; the real ones differ from light by 1 part in 100 million.' }),
      answer: 2 * (6.8e6 / MP) ** 2 - 1, tol: { rel: 0.003 },
      errors: [{ value: 2 * (6.8e6 / MP), feedback: 'Lorentz factors do not add. Compute the dot product: −u₁·u₂ = γ²(1 + β²).' }, { value: (6.8e6 / MP) ** 2, feedback: t`$-\mathbf u_1\cdot\mathbf u_2 = \gamma^2(1 + \beta^2)$, which is $2\gamma^2 - 1$, not $\gamma^2$.` }],
      hints: [t`$\mathbf u_1\cdot\mathbf u_2 = -\gamma^2 + \gamma\beta\cdot(-\gamma\beta) = -\gamma^2(1 + \beta^2)$.`, t`Use $\gamma^2\beta^2 = \gamma^2 - 1$: $\gamma_{\text{rel}} = 2\gamma^2 - 1$.`],
      teach: t`The relative Lorentz factor is the scalar $-\mathbf u_1\cdot\mathbf u_2$; for equal and opposite velocities it is $2\gamma^2 - 1$.`,
      explain: t`$\gamma_{\text{rel}} = 2\gamma^2 - 1 = ${tex(2 * (6.8e6 / MP) ** 2 - 1, 3)}$: each proton sees the other arriving with about $10^{8}$ times its rest energy, close to $10^{5}$ TeV. A proton fired at a proton at rest would need that much energy to make the same collision.`,
    }),
    mcq({
      id: 'cp-at-rest', difficulty: 2,
      prompt: t`A particle of mass $m$ is at rest relative to observer O. In this course’s signature $(-,+,+,+)$, what is $\mathbf p\cdot\mathbf u_O$?`,
      visual: uPicture({ b: 0, name: 'u (O)', caption: t`O’s frame, $c = 1$: O and the particle share the worldline up the time axis, and $\mathbf u_O = (1, 0, 0, 0)$.` }),
      choices: [t`$-m$`, t`$+m$`, '0', t`$-m^2$`],
      answer: 0,
      why: {
        1: t`The time components enter with a minus sign: $\mathbf p\cdot\mathbf u_O = -p^t u^t = -m$. The measured energy is minus this, $+m$.`,
        2: t`Zero would mean $\mathbf p$ is perpendicular to $\mathbf u_O$; here they point the same way.`,
        3: t`$-m^2$ is $\mathbf p\cdot\mathbf p$. Here one vector is $\mathbf u$, which has no factor of $m$.`,
      },
      hints: [t`In O’s frame $\mathbf p = (m, 0, 0, 0)$ and $\mathbf u_O = (1, 0, 0, 0)$.`, t`The dot product is $-a^0b^0 + \vec a\cdot\vec b$.`],
      teach: t`$\mathbf p\cdot\mathbf u_{\text{obs}} = -E_{\text{obs}}$ in the $(-,+,+,+)$ signature: the minus sign in $E = -\mathbf p\cdot\mathbf u$ makes energies positive.`,
      explain: t`$\mathbf p\cdot\mathbf u_O = -(m)(1) = -m$, so the energy O measures is $-\mathbf p\cdot\mathbf u_O = m$: the rest energy. In the $(+,-,-,-)$ signature the same dot product is $+m$ (lesson st-g.G-SIG.1).`,
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §5.2–5.3 (four-velocity, four-momentum, E = −p·u)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Taylor & Wheeler, Spacetime Physics, ch. 7 (momenergy)', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'CERN: LHC Run 3 beam energy, 6.8 TeV', url: 'https://home.cern/news/news/accelerators/lhc-run-3-physics-record-energy-tomorrow' },
  ],
});
