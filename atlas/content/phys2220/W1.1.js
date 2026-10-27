// Travelling waves: a pattern that moves while the medium only oscillates in
// place. y = A sin(kx − ωt + φ), with v = ω/k = fλ, the direction read from the
// signs, and the wave equation that every such wave obeys.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn, s3, r6, C, snapshot, curvePicture, label } from './_waves.js';

const t = String.raw;
const TAU = 2 * Math.PI;

export default lesson({
  id: 'phys2220.W1.1',
  title: 'Travelling waves and the wave equation',
  minutes: 12, difficulty: 2,
  intro: t`A wave is a **pattern that moves through a medium while the medium stays where it is**. Each piece of a guitar string only moves up and down across the string (a *transverse* wave); each parcel of air in a sound wave only moves back and forth along the wave’s path (a *longitudinal* wave). What travels is the shape — and the energy it carries. A sinusoidal wave on a string is

$$y(x,t) = A\sin(kx - \omega t + \phi), \qquad k = \frac{2\pi}{\lambda}, \quad \omega = 2\pi f, \quad v = \frac{\omega}{k} = f\lambda$$

The pattern slides along at speed $v$ without changing shape: toward $+x$ when $kx$ and $\omega t$ have **opposite signs**, toward $-x$ when they have the same sign. Every such wave obeys the **wave equation** $\dfrac{\partial^2 y}{\partial x^2} = \dfrac{1}{v^2}\dfrac{\partial^2 y}{\partial t^2}$ — the equation that also governs light, and the ripples of spacetime that LIGO detects.`,
  symbols: [
    { tex: 'y(x,t)', text: 'the displacement of the piece of string at position $x$ at time $t$, in m — sideways, across the string' },
    { tex: 'A', text: 'the amplitude: the largest displacement, in m' },
    { tex: 'k = 2\\pi/\\lambda', text: 'the wave number, in rad/m: how fast the phase changes along the string. $\\lambda$ is the wavelength, the distance from one crest to the next, in m' },
    { tex: '\\omega = 2\\pi f', text: 'the angular frequency, in rad/s. $f$ is the frequency in Hz: how many times per second each piece of string goes up and down, and how many crests pass a point per second. The period is $T = 1/f$' },
    { tex: '\\phi', text: 'the phase constant, in rad: it slides the whole pattern along and fixes $y$ at $x = 0$, $t = 0$' },
    { tex: 'v = \\omega/k = f\\lambda', text: 'the wave speed, in m/s: how fast the *pattern* moves — not how fast the string moves' },
    { tex: '\\dfrac{\\partial^2 y}{\\partial t^2},\\ \\dfrac{\\partial^2 y}{\\partial x^2}', text: '**partial** derivatives. $\\partial/\\partial t$ differentiates with $x$ held fixed: follow one piece of string, so $\\partial^2 y/\\partial t^2$ is its acceleration. $\\partial/\\partial x$ holds $t$ fixed: freeze a snapshot, so $\\partial^2 y/\\partial x^2$ is the curvature of the string' },
  ],
  why: 'Every wave you will meet — on strings, in air, light, and gravitational waves — is a shape moving through something, described by a function of x − vt and obeying this one equation.',
  visual: {
    type: 'wave-string',
    title: 'The pattern travels; the string does not',
    lead: t`Beads mark pieces of the string. Watch one bead (red) while a crest (gold) moves along. The source sets the frequency; the string sets the speed; the wavelength follows, $\lambda = v/f$.`,
    tasks: [
      'Follow the red bead: it only goes up and down, while the gold crest travels along the string.',
      'Double f with v fixed: the wavelength halves, so that fλ still equals v.',
      'Show the accelerations: the gold arrows are longest at crests and troughs, where the string is most curved, and zero where it is straight. That is the wave equation.',
    ],
    params: { mode: 'travel', A: 1, v: 2, f: 0.5, dir: 1, tag: 2.5 },
  },
  example: {
    prompt: t`A wave on a taut string is $y(x,t) = (0.020\ \text{m})\sin(3.0x - 12t)$, with $x$ in metres and $t$ in seconds. Find its wavelength, frequency, speed and direction, and the greatest speed of a piece of the string. Then check that it satisfies the wave equation.`,
    visual: snapshot({
      A: 2, lambda: TAU / 3, x: [0, 4.6], ylabel: 'y (cm)',
      points: [{ x: r6(Math.PI / 6), y: 2, color: 'gold', label: 'crest' }, { x: r6(Math.PI / 6 + TAU / 3), y: 2, color: 'gold', label: 'next crest' }],
      arrows: [{ from: [r6(Math.PI / 6), -2.45], to: [r6(Math.PI / 6 + TAU / 3), -2.45], color: 'gold', label: 'λ', labelDx: -48, labelDy: -10 }],
      caption: t`The wave at $t = 0$: $y = 2.0\sin(3.0x)$ cm. Crests are one wavelength apart.`,
    }),
    steps: [
      { label: 'Read k and ω', text: t`Compare with $A\sin(kx - \omega t)$: $A = 0.020$ m, $k = 3.0$ rad/m, $\omega = 12$ rad/s.` },
      { label: 'Wavelength and frequency', text: t`$\lambda = 2\pi/k = 2\pi/3.0 = 2.09$ m. $f = \omega/2\pi = 12/2\pi = 1.91$ Hz, so the period is $T = 1/f = 0.524$ s.` },
      { label: 'Speed and direction', text: t`$v = \omega/k = 12/3.0 = 4.0$ m/s. Here $kx$ and $\omega t$ have opposite signs, so the wave moves toward $+x$: a crest keeps $3.0x - 12t$ fixed, so its $x$ must grow by 4.0 m every second. Check: $f\lambda = 1.91 \times 2.09 = 4.0$ m/s. ✓` },
      { label: 'Speed of the string', text: t`Follow one piece of string (fixed $x$): $\partial y/\partial t = -A\omega\cos(3.0x - 12t)$, so its greatest speed is $A\omega = (0.020)(12) = 0.24$ m/s, across the string. That is a different thing from the wave’s 4.0 m/s along it.` },
      { label: 'The wave equation', text: t`$\dfrac{\partial^2 y}{\partial t^2} = -\omega^2 y$ and $\dfrac{\partial^2 y}{\partial x^2} = -k^2 y$, so $\dfrac{\partial^2 y}{\partial x^2} = \dfrac{k^2}{\omega^2}\dfrac{\partial^2 y}{\partial t^2} = \dfrac{1}{v^2}\dfrac{\partial^2 y}{\partial t^2}$ with $v = \omega/k = 4.0$ m/s. ✓ Each piece of string accelerates in proportion to how curved the string is there.` },
    ],
    answer: t`$\lambda = 2.09$ m, $f = 1.91$ Hz, $v = 4.0$ m/s toward $+x$; the string itself moves at up to $0.24$ m/s, across the string.`,
  },
  practice: [
    mcq({
      id: 'direction', difficulty: 1,
      prompt: t`Which way does the wave $y = A\sin(kx + \omega t)$ travel? ($A$, $k$ and $\omega$ are positive.)`,
      choices: [t`Toward $-x$`, t`Toward $+x$`, 'Neither: it is a standing wave', t`It depends on the size of $A$`],
      answer: 0,
      why: {
        1: t`The plus sign does not point the way. A crest keeps $kx + \omega t$ fixed, so as $t$ grows its $x$ must *shrink*.`,
        2: t`A standing wave keeps $x$ and $t$ in separate factors, like $\sin kx\cos\omega t$. Here they share one sine, so the pattern moves.`,
        3: 'The amplitude sets how tall the wave is, not where it goes.',
      },
      hints: [t`Follow one crest: the phase $kx + \omega t$ stays the same for it.`, t`If $t$ increases, how must $x$ change to keep $kx + \omega t$ fixed?`],
      teach: 'A wave moves toward +x when kx and ωt have opposite signs, and toward −x when they have the same sign.',
      explain: t`For a crest $kx + \omega t$ is constant, so $k\,dx + \omega\,dt = 0$ and $dx/dt = -\omega/k = -v$: the pattern moves toward $-x$ at speed $v = \omega/k$.`,
      visual: snapshot({ A: 1, lambda: 4, x: [0, 10], caption: t`The wave at $t = 0$, $y = A\sin kx$. A single snapshot cannot tell you which way a wave is moving — the formula can.` }),
    }),
    num({
      id: 'speed-k-omega', difficulty: 1,
      gen(r) {
        const k = r.pick([2, 2.5, 4, 5, 8]), w = r.pick([10, 15, 20, 30, 40]), A = r.pick([0.01, 0.02, 0.05]);
        return {
          prompt: t`A wave on a string is $y = (${A}\ \text{m})\sin(${k}x - ${w}t)$, with $x$ in m and $t$ in s. How fast does the wave travel?`,
          answer: w / k, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: k / w, feedback: t`Upside down: $v = \omega/k$. Check the units — rad/s divided by rad/m gives m/s.` },
            { value: k * w, feedback: t`Divide, don’t multiply: $v = \omega/k$.` },
            { value: w / TAU, feedback: t`That is the frequency $f = \omega/2\pi$, in Hz. The speed is $\omega/k$.` },
          ],
          hints: [t`The number multiplying $x$ is $k$ and the one multiplying $t$ is $\omega$.`, t`$v = \omega/k$.`],
          teach: 'The wave speed is ω/k: angular frequency divided by wave number.',
          explain: t`$v = \omega/k = ${w}/${k} = ${tn(w / k)}$ m/s (toward $+x$, since the signs are opposite). Equivalently $\lambda = 2\pi/${k} = ${tn(TAU / k)}$ m and $f = ${w}/2\pi = ${tn(w / TAU)}$ Hz, and $f\lambda = ${tn(w / k)}$ m/s.`,
          visual: snapshot({ A: r6(A * 100), lambda: TAU / k, x: [0, r6(3.2 * TAU / k)], ylabel: 'y (cm)', caption: t`The wave at $t = 0$: $y = ${r6(A * 100)}\sin(${k}x)$ cm.` }),
        };
      },
    }),
    num({
      id: 'speed-from-graph', difficulty: 2,
      gen(r) {
        const lam = r.pick([0.4, 0.6, 0.8, 1.2]), f = r.pick([5, 8, 12, 15, 20, 25]);
        const x1 = lam / 4, x2 = lam / 4 + lam;
        return {
          prompt: t`The graph is a snapshot of a wave on a string. Its source shakes the string ${f} times per second. What is the wave speed?`,
          answer: f * lam, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: (f * lam) / 2, feedback: 'You used half a wavelength — crest to trough. A wavelength runs from one crest to the next.' },
            { value: f / lam, feedback: t`$v = f\lambda$: multiply, don’t divide.` },
            { value: lam / f, feedback: t`$v = f\lambda$, not $\lambda/f$.` },
          ],
          hints: ['The wavelength is the distance from one crest to the next.', t`$v = f\lambda$.`],
          teach: 'Read the wavelength from a snapshot (crest to crest), then v = fλ.',
          explain: t`$\lambda = ${s3(x2)} - ${s3(x1)} = ${lam}$ m, so $v = f\lambda = ${f} \times ${lam} = ${tn(f * lam)}$ m/s.`,
          visual: snapshot({
            A: 1, lambda: lam, x: [0, r6(2.6 * lam)], ylabel: 'y (cm)',
            points: [{ x: r6(x1), y: 1, color: 'gold', label: `x = ${s3(x1)} m` }, { x: r6(x2), y: 1, color: 'gold', label: `x = ${s3(x2)} m` }],
            caption: 'A snapshot of the string at one instant; two neighbouring crests are marked.',
          }),
        };
      },
    }),
    num({
      id: 'bead-speed', difficulty: 2,
      gen(r) {
        const Amm = r.pick([2, 4, 5, 8]), f = r.pick([20, 50, 60, 100]), v = r.pick([15, 25, 40]);
        const u = (Amm / 1000) * TAU * f;
        return {
          prompt: t`A wave on a string has amplitude ${Amm} mm and frequency ${f} Hz, and travels at ${v} m/s. What is the greatest speed of any piece of the string?`,
          answer: u, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: v, feedback: 'That is the wave speed — how fast the pattern moves along. The string itself moves across, at a speed set by the amplitude and frequency.' },
            { value: (Amm / 1000) * f, feedback: t`Use the angular frequency: $u_\text{max} = A\omega = A(2\pi f)$.` },
          ],
          hints: [t`Each piece of string moves in simple harmonic motion, $y = A\sin(\ldots - \omega t)$.`, t`Its greatest speed is $A\omega$, with $\omega = 2\pi f$ and $A$ in metres.`],
          teach: 'Each piece of string oscillates with greatest speed Aω — a different quantity from the wave speed v.',
          explain: t`$u_\text{max} = A\omega = (${Amm / 1000}\ \text{m})(2\pi \times ${f}\ \text{Hz}) = ${tn(u)}$ m/s. The wave speed, ${v} m/s, did not enter: it depends on the string, while $A\omega$ depends on how the source shakes it.`,
          visual: { type: 'wave-string', params: { mode: 'travel', controls: false, play: false, time: 0.6, arrows: 'velocity', readout: false, tag: null }, caption: 'Green arrows: the velocities of the beads at one instant. They point across the string, never along it. Height exaggerated.' },
        };
      },
    }),
    expr({
      id: 'write-y', difficulty: 2,
      gen(r) {
        const A = r.pick([0.02, 0.05, 0.1]), [lam, kc] = r.pick([[0.5, 4], [1, 2], [2, 1]]), [f, wc] = r.pick([[2, 4], [5, 10], [10, 20]]);
        const right = r.bool(0.5), s = right ? '-' : '+';
        const pi = (c) => (c === 1 ? '\\pi ' : `${c}\\pi `);
        return {
          prompt: t`Write $y(x, t)$ for a sinusoidal wave on a string with amplitude ${A} m, wavelength ${lam} m and frequency ${f} Hz, travelling toward $${right ? '+' : '-'}x$. Use the form $y = A\sin(kx \mp \omega t)$ with $A > 0$ (use \`pi\` for $\pi$).`,
          answer: `${A}*sin(${kc}*pi*x ${s} ${wc}*pi*t)`,
          answerTeX: t`${A}\sin\left(${pi(kc)}x ${s} ${pi(wc)}t\right)`,
          vars: { x: [0, 1], t: [0, 1] }, lhs: 'y(x,t)',
          errors: [
            { answer: `${A}*sin(${kc}*pi*x ${right ? '+' : '-'} ${wc}*pi*t)`, feedback: t`Check the direction: toward $+x$ needs opposite signs on $kx$ and $\omega t$; toward $-x$ the same sign.` },
            { answer: `${A}*sin(${lam}*x ${s} ${f}*t)`, feedback: t`Use $k = 2\pi/\lambda$ and $\omega = 2\pi f$, not $\lambda$ and $f$ themselves.` },
            { answer: `${A}*sin(2*pi*x/${lam} ${s} ${f}*t)`, feedback: t`$k$ is right; now the time part needs $\omega = 2\pi f$.` },
          ],
          hints: [t`$k = 2\pi/\lambda$ and $\omega = 2\pi f$.`, t`Toward $+x$: $\sin(kx - \omega t)$. Toward $-x$: $\sin(kx + \omega t)$.`],
          teach: 'Build y(x, t) from k = 2π/λ, ω = 2πf, and the sign that sets the direction.',
          explain: t`$k = 2\pi/${lam} = ${pi(kc)}$ rad/m and $\omega = 2\pi(${f}) = ${pi(wc)}$ rad/s, so $y = ${A}\sin(${pi(kc)}x ${s} ${pi(wc)}t)$ m. Check: $v = \omega/k = ${wc / kc}$ m/s $= f\lambda = ${f} \times ${lam}$. ✓`,
          visual: snapshot({ A: r6(A * 100), lambda: lam, x: [0, r6(3 * lam)], ylabel: 'y (cm)', caption: t`The wave at $t = 0$, amplitude ${r6(A * 100)} cm and wavelength ${lam} m. Which way it moves is not visible in one snapshot.` }),
        };
      },
    }),
    mcq({
      id: 'which-travels', difficulty: 2,
      prompt: t`Which of these describes a pulse travelling toward $+x$ at 3 m/s? ($x$ in m, $t$ in s.)`,
      choices: [t`$y = \dfrac{0.1}{1 + (x - 3t)^2}$`, t`$y = \dfrac{0.1}{1 + (x + 3t)^2}$`, t`$y = \dfrac{0.1}{1 + (3x - t)^2}$`, t`$y = \dfrac{0.1\cos 3t}{1 + x^2}$`],
      answer: 0,
      why: {
        1: t`$x + 3t$ stays fixed when $x$ *decreases* as $t$ grows: this pulse moves toward $-x$.`,
        2: t`$3x - t$ stays fixed when $x$ grows by $\tfrac13$ m each second: the right direction, but a speed of $\tfrac13$ m/s.`,
        3: t`This bump stays centred on $x = 0$ and just grows and shrinks. Nothing moves, because $x$ and $t$ do not appear together as $x - vt$.`,
      },
      hints: [t`Any shape written as a function of $x - vt$ moves toward $+x$ at speed $v$.`, t`Rewrite each argument as a multiple of $(x - vt)$ and read off $v$: $3x - t = 3(x - t/3)$.`],
      teach: 'Any shape that depends on x and t only through x − vt slides toward +x at speed v without changing shape.',
      explain: t`The peak of $0.1/[1 + (x - 3t)^2]$ is where $x - 3t = 0$, at $x = 3t$: it moves 3 m every second toward $+x$. Nothing here needs a sine — every function $f(x - vt) + g(x + vt)$ solves the wave equation.`,
      visual: curvePicture({ fn: '0.1/(1 + x^2)', x: [-4, 8], y: [-0.02, 0.13], ylabel: 'y (m)', caption: t`Each choice is this pulse, $0.1/(1 + x^2)$, at $t = 0$. Height exaggerated.` }),
    }),
    {
      type: 'point', id: 'bead-later', difficulty: 3,
      prompt: t`The snapshot shows a wave at $t = 0$, travelling toward $+x$ (wavelength 4 m, amplitude 1 cm). Drag the point to where the piece of string now at $x = 0$ (red) will be **a quarter of a period later**.`,
      instruction: 'Drag the point to where that piece of string will be a quarter period from now, then check.',
      answer: { x: 0, y: -1 }, tol: { x: 0.25, y: 0.15 },
      visual: snapshot({
        A: 1, lambda: 4, x: [-2.5, 8], ylabel: 'y (cm)',
        points: [{ x: 0, y: 0, color: 'bad', r: 6 }],
        arrows: [{ from: [4.6, 1.3], to: [7.4, 1.3], color: 'ink2', label: 'wave travels', labelDx: -96, labelDy: -12 }],
        drag: [{ key: 'p', x: 4, y: 0.5, snap: 0.05 }],
        caption: t`$y = \sin(\pi x/2)$ cm at $t = 0$, moving toward $+x$.`,
      }),
      hints: ['A piece of string never moves along the string, only up and down — so its x stays 0.', 'In a quarter period the pattern moves a quarter wavelength (1 m) to the right. Whatever is now 1 m to the left of x = 0 arrives at x = 0.', 'At x = −1 m the string is at a trough right now.'],
      teach: 'Pieces of the medium only oscillate in place; the pattern is what moves, carrying the shape now on one side of a point onto it.',
      explain: t`The piece stays at $x = 0$. In a quarter period the pattern shifts $\lambda/4 = 1$ m toward $+x$, so the trough now at $x = -1$ m arrives at $x = 0$: the piece is at $(0, -1\ \text{cm})$. Check: $y(0, t) = \sin(-\omega t)$, which is $-1$ at $\omega t = \pi/2$. (The crest at $x = 1$ m moved on to $x = 2$ m — but the string there is made of different beads.)`,
    },
    mcq({
      id: 'curvature', difficulty: 2,
      prompt: t`The snapshot shows a sinusoidal wave on a string at one instant. At which marked point is the string’s sideways **acceleration** largest?`,
      choices: ['P', 'Q', 'R', 'They are all equal: every piece of a sine wave accelerates equally'],
      answer: 0,
      why: {
        1: 'Q is where the string is steepest. The bead there moves fastest, but the string is straight there, so its acceleration is zero.',
        2: t`R is partway: its acceleration is $-\omega^2 y$, half of the largest value.`,
        3: t`The acceleration $-\omega^2 y$ follows the displacement: it is largest where $|y|$ is largest.`,
      },
      hints: [t`The wave equation says $\partial^2 y/\partial t^2 = v^2\,\partial^2 y/\partial x^2$: acceleration follows curvature.`, 'Where is the string most sharply bent?'],
      teach: 'The wave equation ties each piece’s acceleration to the string’s curvature: the most curved places, the crests and troughs, accelerate most.',
      explain: t`For a sine wave $\partial^2 y/\partial t^2 = -\omega^2 y = v^2\,\partial^2 y/\partial x^2$. At the crest P the string is bent most sharply and $|y|$ is largest, so the bead there has the largest acceleration, pointing back toward $y = 0$. At Q the string is straight for an instant (an inflection point): zero acceleration — though that bead is moving fastest.`,
      visual: snapshot({
        A: 1, lambda: 4, x: [0, 8], ylabel: 'y (cm)',
        points: [{ x: 1, y: 1, color: 'gold', label: 'P' }, { x: 4, y: 0, color: 'gold', label: 'Q' }, { x: r6(19 / 3), y: -0.5, color: 'gold', label: 'R', labelDx: 8, labelDy: 10 }],
        caption: 'A sinusoidal wave on a string at one instant, with three marked pieces of string.',
      }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-velocity', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 4, 5, 8]), w = r.pick([12, 20, 30, 50]), s = r.sign();
        const vel = (s * w) / k;
        return {
          prompt: t`A wave on a string is $y = (0.03\ \text{m})\sin(${k}x ${s > 0 ? '-' : '+'} ${w}t)$, with $x$ in m and $t$ in s. What is its velocity along the string? Give a sign: positive toward $+x$.`,
          answer: vel, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: -vel, feedback: t`Right speed, wrong direction: opposite signs on $kx$ and $\omega t$ mean $+x$; the same sign means $-x$.` }, { value: s * (k / w), feedback: t`Upside down: $v = \omega/k$.` }],
          hints: [t`The speed is $\omega/k$.`, 'The direction comes from the signs of the two terms.'],
          teach: 'Speed from ω/k; direction from the relative sign of kx and ωt.',
          explain: t`$|v| = \omega/k = ${w}/${k} = ${tn(w / k)}$ m/s; the signs are ${s > 0 ? 'opposite, so it moves toward $+x$' : 'the same, so it moves toward $-x$'}: $v = ${tn(vel)}$ m/s.`,
          visual: snapshot({ A: 3, lambda: TAU / k, x: [0, r6(3 * TAU / k)], ylabel: 'y (cm)', caption: 'The wave at t = 0.' }),
        };
      },
    }),
    expr({
      id: 'cp-write', difficulty: 2,
      gen(r) {
        const A = r.pick([0.004, 0.006, 0.008]), [lam, kc] = r.pick([[0.25, 8], [0.5, 4], [1, 2]]), [f, wc] = r.pick([[50, 100], [100, 200], [150, 300]]);
        return {
          prompt: t`A violinist’s bow sets up a wave of amplitude ${r6(A * 1000)} mm, wavelength ${lam} m and frequency ${f} Hz on a string, travelling toward $-x$. Write $y(x, t)$ in metres, in the form $A\sin(kx \pm \omega t)$ with $A > 0$ (use \`pi\` for $\pi$).`,
          answer: `${A}*sin(${kc}*pi*x + ${wc}*pi*t)`,
          answerTeX: t`${A}\sin\left(${kc}\pi x + ${wc}\pi t\right)`,
          vars: { x: [0, 0.5], t: [0, 0.01] }, lhs: 'y(x,t)',
          errors: [{ answer: `${A}*sin(${kc}*pi*x - ${wc}*pi*t)`, feedback: t`That one travels toward $+x$. Toward $-x$, $kx$ and $\omega t$ take the same sign.` }],
          hints: [t`$k = 2\pi/\lambda$, $\omega = 2\pi f$; toward $-x$ means $\sin(kx + \omega t)$.`],
          teach: 'Toward −x, the wave is A sin(kx + ωt).',
          explain: t`$k = 2\pi/${lam} = ${kc}\pi$ rad/m, $\omega = 2\pi(${f}) = ${wc}\pi$ rad/s: $y = ${A}\sin(${kc}\pi x + ${wc}\pi t)$ m, moving at $v = f\lambda = ${f * lam}$ m/s toward $-x$.`,
          visual: snapshot({ A: r6(A * 1000), lambda: lam, x: [0, r6(3 * lam)], ylabel: 'y (mm)', caption: t`The wave at $t = 0$. Height exaggerated.` }),
        };
      },
    }),
    num({
      id: 'cp-ligo', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([35, 60, 100, 150, 250]);
        const lamKm = C / f / 1000;
        return {
          prompt: t`Gravitational waves are travelling ripples in spacetime, and they move at the speed of light, $c = 3.00\times10^8$ m/s. The first one detected, GW150914, swept upward in frequency from 35 Hz to 250 Hz in about 0.2 s as two black holes spiralled together. What was its wavelength when its frequency was ${f} Hz? (LIGO’s arms are 4 km long.)`,
          answer: lamKm, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: 343 / f / 1000, feedback: 'That uses the speed of sound. Gravitational waves need no medium and travel at the speed of light.' },
            { value: f / C / 1000, feedback: t`$\lambda = v/f$: the speed divided by the frequency.` },
          ],
          hints: [t`$v = f\lambda$, so $\lambda = c/f$.`, 'Convert metres to kilometres at the end.'],
          teach: 'v = fλ holds for every wave, including gravitational waves travelling at c.',
          explain: t`$\lambda = c/f = (3.00\times10^8\ \text{m/s})/(${f}\ \text{Hz}) = ${tn(C / f)}$ m $= ${tn(lamKm)}$ km — hundreds of times longer than LIGO’s 4 km arms. The whole instrument sits inside a small fraction of one wavelength, so the wave stretches and squeezes it all at once — each arm’s length changes by a few thousandths of a proton’s width — and the detector records how that stretch changes in time.`,
          visual: { type: 'gr-chirp', params: { sliders: false, play: false, readout: false }, caption: 'The GW150914 chirp computed at leading order (not the measured data): the wave’s frequency climbs as the black holes spiral in. Left: the stretch it causes, hugely exaggerated.' },
        };
      },
    }),
    mcq({
      id: 'cp-wave-equation', difficulty: 3,
      prompt: t`Which of these is a solution of the wave equation $\dfrac{\partial^2 y}{\partial x^2} = \dfrac14\,\dfrac{\partial^2 y}{\partial t^2}$? ($x$ in m, $t$ in s.)`,
      choices: [t`$y = e^{-(x - 2t)^2}$`, t`$y = e^{-(x - 4t)^2}$`, t`$y = e^{-(x - t/4)^2}$`, t`$y = e^{-x^2}\cos 2t$`],
      answer: 0,
      why: {
        1: t`The coefficient is $1/v^2$, not $1/v$: $1/v^2 = 1/4$ gives $v = 2$ m/s, and this pulse moves at 4 m/s.`,
        2: t`This pulse moves at $\tfrac14$ m/s; the equation asks for $1/v^2 = \tfrac14$, so $v = 2$ m/s.`,
        3: t`This bump does not travel: it sits at $x = 0$ and flickers. Check: $\partial^2 y/\partial t^2 = -4y$, but $\partial^2 y/\partial x^2 = (4x^2 - 2)y$, and these are not in the ratio 4 everywhere.`,
      },
      hints: [t`Compare with $\dfrac{\partial^2 y}{\partial x^2} = \dfrac{1}{v^2}\dfrac{\partial^2 y}{\partial t^2}$: what is $v$?`, t`Any function of $x - vt$ solves it; which choice has the right $v$?`],
      teach: 'The wave equation’s coefficient is 1/v², and every shape moving as f(x − vt) solves it.',
      explain: t`$1/v^2 = 1/4$, so $v = 2$ m/s, and any $f(x - 2t)$ is a solution: $e^{-(x - 2t)^2}$ is a bump sliding toward $+x$ at 2 m/s. (Check by the chain rule: $\partial^2 y/\partial t^2 = 4f''$ and $\partial^2 y/\partial x^2 = f''$.)`,
      visual: curvePicture({ fn: 'exp(-x^2)', x: [-3, 6], y: [-0.15, 1.3], ylabel: 'y', caption: t`Each of the first three choices is this bump, $e^{-x^2}$, at $t = 0$, moving at a different speed.` }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §16.1 Traveling Waves', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-1-traveling-waves' },
    { label: 'OpenStax University Physics Vol. 1, §16.2 Mathematics of Waves', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves' },
    { label: 'B. P. Abbott et al. (LIGO and Virgo), “Observation of gravitational waves from a binary black hole merger”, Phys. Rev. Lett. 116, 061102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
  ],
});
