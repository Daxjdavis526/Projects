// Orbits around black holes — Intuition Mode. The Schwarzschild effective
// potential adds −GML²/(c²r³) to Newton's: inside r = 6GM/c² (the ISCO) no
// circular orbit is stable; at 4GM/c² orbits are marginally bound; at
// 3GM/c² light can circle (the photon sphere). Consequences: disk inner
// edges, 5.7% accretion efficiency, GW frequency at the end of inspiral.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, M_SUN, AU, YEAR, mLen, sci, round } from './_fasttrack.js';
import { Ecirc, ISCO, PHOTON_SPHERE } from '../../src/viz/model/gravity.js';

const t = String.raw;

const ETA = 1 - Ecirc(ISCO);                              // binding energy at the ISCO, per unit rest energy
const iscoM = (M) => ISCO * mLen(M);                       // m
const fOrb = (M) => Math.sqrt((G * M) / iscoM(M) ** 3) / (2 * Math.PI);   // Hz (as seen from far away)
const vLocal = (k) => Math.sqrt(1 / (k - 2));              // circular-orbit speed measured by a static observer, in c
const clockCirc = (k) => Math.sqrt(1 - 3 / k);             // dτ/dt on a circular orbit at r = kM
const L_SUN = 3.828e26;                                    // W

// the effective potential for massive particles, with L on a slider
const vEffGraph = {
  type: 'graph',
  params: {
    x: [2, 26], y: [0.82, 1.12], xlabel: 'r / M', ylabel: 'potential',
    sliders: [{ key: 'L', label: 'Angular momentum $L$', min: 3.2, max: 5, step: 0.01, value: 4.2, unit: 'M', explain: 'Per unit mass, with $G = c = 1$. A stable circular orbit sits at the bottom of the dip.' }],
    curves: [{ fn: 'max((1 - 2/x)(1 + L^2/x^2), 0.82)', color: 'gold' }],
    points: [{ x: '(L^2 + L*sqrt(max(L^2 - 12, 0)))/2', y: '(1 - 2/((L^2 + L*sqrt(max(L^2 - 12, 0)))/2))(1 + L^2/((L^2 + L*sqrt(max(L^2 - 12, 0)))/2)^2)', color: 'good', label: 'stable circle', when: 'max(L^2 - 12, 0)' }],
    vlines: [{ x: 6, label: 'ISCO 6M' }, { x: 3, label: '3M' }],
  },
  caption: 'The Schwarzschild effective potential for a massive particle, (1 − 2M/r)(1 + L²/r²), with G = c = 1. A stable circular orbit sits at the bottom of the dip; an unstable one on top of the hump.',
};

export default lesson({
  id: 'gr.S21.i',
  title: 'Orbits, the photon sphere and the innermost stable orbit',
  minutes: 9, difficulty: 3, mode: 'intuition', badges: ['est-der'],
  intro: t`Far from a black hole, orbits are Newton's ellipses with a slow precession. Close in they change character. The motion in and out is like a ball rolling in a one-dimensional valley, the **effective potential** above: Newton's gravity, plus a centrifugal barrier, plus one new term from general relativity that wins at small $r$ and tears the barrier down. Three radii follow, with $M = GM/c^2$ as the unit:

- $r = 6M$: the **innermost stable circular orbit (ISCO)** — closer in, no circular orbit is stable;
- $r = 4M$: the closest a particle falling in from rest far away can swing by and still escape;
- $r = 3M$: the **photon sphere**, where light itself can circle the hole, unstably.`,
  equation: t`V(r) = -\frac{GM}{r} + \frac{L^2}{2r^2} - \frac{GML^2}{c^2 r^3}`,
  symbols: [
    { tex: 'V(r)', text: 'the effective potential energy per unit mass for motion in and out, in J/kg' },
    { tex: '-GM/r', text: 'Newton’s gravity: the pull toward the mass' },
    { tex: 'L^2/2r^2', text: 'the centrifugal barrier: angular momentum keeps an orbit from falling straight in' },
    { tex: '-GML^2/c^2r^3', text: 'the general-relativity term: tiny far out, but it grows fastest as $r$ shrinks and overwhelms the barrier' },
    { tex: 'L', text: 'angular momentum per unit mass, in m²/s — conserved along the orbit' },
    { tex: 'r', text: 'the Schwarzschild (areal) radius' },
    { tex: 'G,\\ M,\\ c', text: 'the gravitational constant, the black hole’s mass and the speed of light' },
  ],
  why: 'The ISCO sets the inner edge of accretion disks — and so how much light quasars wring from infalling matter — and the frequency at which merging black holes stop orbiting and plunge, right in LIGO’s band.',
  visual: {
    type: 'orbit',
    title: 'Orbits in the strong field',
    lead: t`The gold orbit is computed exactly in the Schwarzschild spacetime, with $G = c = 1$ so distances are in units of $M = GM/c^2$. On the right, the dashed line is the orbit's energy: the orbit bounces between the places where it meets the potential curve.`,
    tasks: ['Lower L from 4.3 toward 3.75: the inner turning point moves in toward the hump of the potential.', 'Set L = 3.70: the orbit zooms in, whirls around the hole several times near r ≈ 4.5M, and zooms out again.', 'Set L = 3.69: the energy line now clears the hump and the orbit plunges through the horizon. Nothing pulled harder — there was simply no barrier left.'],
    params: { mode: 'schwarzschild', r0: 20, L: 4.3, compare: false },
  },
  example: {
    prompt: t`For a 10-solar-mass black hole, find the radius of the ISCO, how often gas there goes round, how fast it moves, and how much energy matter gives off by spiralling down to it.`,
    steps: [
      { label: 'Radius', text: t`$GM/c^2 = 10\times${sci(mLen(M_SUN), 4)}$ m $= ${sci(mLen(10 * M_SUN) / 1e3)}$ km, so $r_\text{ISCO} = 6GM/c^2 = ${sci(iscoM(10 * M_SUN) / 1e3)}$ km — three times the horizon radius.` },
      { label: 'How often', text: t`For circular orbits in Schwarzschild, $\Omega = \sqrt{GM/r^3}$ exactly (in far-away time — the same formula as Kepler's). At the ISCO that is $f = ${sci(fOrb(10 * M_SUN))}$ orbits per second.` },
      { label: 'How fast', text: t`A hovering observer at the ISCO sees the gas go by at $v = c\sqrt{M/(r - 2M)} = c\sqrt{1/4} = c/2$.` },
      { label: 'Clocks', text: t`A clock riding the orbit ticks at $\sqrt{1 - 3M/r} = ${sci(clockCirc(6), 3)}$ of the far-away rate: gravity and speed together.` },
      { label: 'Energy', text: t`The orbit's energy is $E = \sqrt{8/9}\,mc^2$, so gas that spirals in through a disk to the ISCO has radiated $1 - \sqrt{8/9} = ${sci(100 * ETA, 3)}\%$ of its rest energy — eight times what hydrogen fusion releases (0.7%).` },
    ],
    answer: t`$r_\text{ISCO} = ${sci(iscoM(10 * M_SUN) / 1e3)}$ km, about $${Math.round(fOrb(10 * M_SUN))}$ orbits per second, at $c/2$; spiralling in releases ${sci(100 * ETA, 3)}% of the rest energy.`,
  },
  practice: [
    mcq({
      id: 'no-suck', difficulty: 1,
      prompt: 'A spacecraft coasts in a circular orbit at 20 times the horizon radius of a black hole, engines off. What happens to it?',
      choices: [
        'It keeps orbiting, as it would around any star of the same mass',
        'It slowly spirals in, because black holes suck everything toward them',
        'It must keep firing its engines or it will fall in',
        'It is dragged in by the black hole’s light-trapping gravity',
      ],
      answer: 0,
      why: {
        1: 'Black holes do not suck. A circular orbit well outside 6GM/c² is stable, just as around a star.',
        2: 'Circular orbits are stable down to the ISCO, 3 horizon radii out. At 20 it coasts freely.',
        3: 'Outside the horizon nothing special traps you; only orbits closer than the ISCO become unstable.',
      },
      hints: ['Where does the ISCO sit, in horizon radii?'],
      teach: 'Outside the ISCO, orbits around a black hole are as stable as orbits around any other mass.',
      explain: 'The ISCO is at 6GM/c², three times the horizon radius (2GM/c²). At 20 horizon radii a circular orbit is stable: the spacecraft coasts indefinitely (losing energy to gravitational waves far too slowly to matter).',
    }),
    num({
      id: 'isco-km', difficulty: 2,
      gen(r) {
        const m = r.pick([5, 10, 30, 62]);
        const x = iscoM(m * M_SUN) / 1e3;
        return {
          prompt: t`What is the ISCO radius, $6GM/c^2$, of a black hole of ${m} solar masses? ($GM_\odot/c^2 = ${sci(mLen(M_SUN), 4)}$ m)`,
          answer: x, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: x / 3, feedback: 'That is the horizon radius, 2GM/c². The ISCO is three times farther out: 6GM/c².' }, { value: x / 2, feedback: 'That is the photon sphere, 3GM/c². The ISCO is at 6GM/c².' }],
          hints: [t`$6GM/c^2 = 6\times${m}\times${sci(mLen(M_SUN), 4)}$ m.`],
          teach: 'The ISCO of a non-spinning black hole is at 6GM/c² — three horizon radii, about 8.9 km per solar mass.',
          explain: t`$6\times${m}\times${sci(mLen(M_SUN), 4)}$ m $= ${sci(x)}$ km.`,
        };
      },
    }),
    mcq({
      id: 'why-isco', difficulty: 3,
      prompt: 'Use the slider: as the angular momentum L decreases, the dip in the potential (a stable circular orbit sits at its bottom) moves inward and grows shallower. What happens at L = 2√3 M ≈ 3.46 M?',
      choices: [
        'The dip and the hump merge at r = 6M and vanish: closer in, no stable circular orbit exists',
        'The dip reaches the horizon at r = 2M',
        'The hump grows without limit and blocks every orbit',
        'The potential becomes Newton’s, and orbits become ellipses again',
      ],
      answer: 0,
      why: {
        1: 'The dip never gets that far in: it disappears at r = 6M, three times the horizon radius.',
        2: 'The hump shrinks as L decreases; at small L it is gone and particles fall straight in.',
        3: 'Lower angular momentum makes the relativistic term more important, not less.',
      },
      hints: ['Drag L down slowly and watch the green dot that marks the bottom of the dip.', 'Below about 3.46 the curve no longer has a dip at all.'],
      teach: 'The ISCO exists because the relativistic −GML²/(c²r³) term erases the centrifugal barrier: at L = 2√3 GM/c the stable and unstable circular orbits merge at r = 6GM/c².',
      explain: 'Circular orbits sit at the extrema of the potential: stable ones at the bottom of the dip, unstable ones on top of the hump. As L falls they approach each other and merge at L = 2√3 M, r = 6M. Below that there is no dip, so no stable circular orbit — the innermost one is at 6M.',
      visual: vEffGraph,
    }),
    mcq({
      id: 'photon-sphere', difficulty: 2,
      prompt: t`What is special about $r = 3GM/c^2$ around a non-spinning black hole?`,
      choices: [
        'Light can travel in a circle there — but the orbit is unstable, like a ball balanced on a hilltop',
        'It is the event horizon',
        'It is the innermost stable orbit for matter',
        'Matter can orbit there stably at half the speed of light',
      ],
      answer: 0,
      why: {
        1: 'The horizon is at 2GM/c²; the photon sphere is half as far again.',
        2: 'The innermost stable orbit for matter is at 6GM/c².',
        3: 'Matter would need the speed of light to circle at 3GM/c²; there are no circular orbits for matter that close.',
      },
      hints: ['The graph is the potential for light. Where is its peak?'],
      teach: 'At the photon sphere, 3GM/c², light can circle the hole on an unstable orbit; it sets the edge of a black hole’s shadow.',
      explain: 'The potential for light, (1 − 2M/r)/r², peaks at r = 3M: a ray with exactly the right aim can circle there, but the slightest nudge sends it in or out. Rays that skim the photon sphere and escape outline the black hole’s shadow.',
      visual: {
        type: 'graph',
        params: {
          x: [2, 12], y: [0, 0.045], xlabel: 'r / M', ylabel: 'light',
          curves: [{ fn: '(1 - 2/x)/x^2', color: 'gold' }],
          points: [{ x: PHOTON_SPHERE, y: round(1 / 27, 6), color: 'gold', label: 'peak' }],
          vlines: [{ x: 2, label: 'horizon' }],
        },
        caption: 'The effective potential for light, (1 − 2M/r)/r², with G = c = 1. Unlike matter’s, it has only a hump.',
      },
    }),
    num({
      id: 'local-speed', difficulty: 2,
      gen(r) {
        const k = r.pick([6, 8, 10, 20]);
        const v = vLocal(k);
        return {
          prompt: t`A hovering observer at $r = ${k}GM/c^2$ watches gas go by on a circular orbit. Its speed, as the observer measures it, is $v = c\sqrt{\dfrac{GM/c^2}{r - 2GM/c^2}}$. What fraction of $c$ is that?`,
          answer: v, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(1 / k), feedback: 'That is the Newtonian √(GM/r). Here use √(M/(r − 2M)).' }, { value: 1 / (k - 2), feedback: 'Take the square root.' }],
          hints: [t`With $G = c = 1$: $v = \sqrt{1/(${k} - 2)}$.`],
          teach: 'Orbital speeds near a black hole are relativistic: c/2 at the ISCO, c at the photon sphere.',
          explain: t`$v = \sqrt{1/${k - 2}} = ${sci(v, 3)}\,c$. At the ISCO ($r = 6M$) it is exactly $c/2$; at the photon sphere ($r = 3M$) it would be $c$ itself.`,
        };
      },
    }),
    num({
      id: 'gw-freq', difficulty: 3,
      gen(r) {
        const m = r.pick([10, 30, 62, 100]);
        const f = 2 * fOrb(m * M_SUN);
        return {
          prompt: t`Two black holes spiral together; the inspiral roughly ends when they reach the ISCO of their total mass. If the total is ${m} solar masses, what is the gravitational-wave frequency then — twice the orbital frequency $\dfrac{1}{2\pi}\sqrt{GM/r^3}$ at $r = 6GM/c^2$?`,
          answer: f, units: 'Hz', tol: { rel: 0.02 },
          errors: [{ value: f / 2, feedback: 'That is the orbital frequency. Gravitational waves come out at twice it.' }],
          hints: [t`$r = 6GM/c^2 = ${sci(iscoM(m * M_SUN))}$ m and $GM = ${sci(G * m * M_SUN)}$ m³/s².`, t`$f_\text{orb} = \sqrt{GM/r^3}/(2\pi) = ${sci(f / 2)}$ Hz; double it.`],
          teach: 'At the ISCO the gravitational-wave frequency is about 4400 Hz × (M☉/M): tens to hundreds of hertz for stellar black holes — LIGO’s band.',
          explain: t`$f_\text{GW} \approx ${sci(f)}$ Hz. That is why stellar-mass mergers sing in LIGO's band (about 10 Hz to a few kHz). This is a rough guide: the real end of an inspiral needs numerical relativity.`,
        };
      },
    }),
    mcq({
      id: 'interstellar', difficulty: 3,
      prompt: 'In the film Interstellar, an hour on a planet orbiting a black hole equals seven years far away — clocks slowed by a factor of 61 000. Could a planet on a stable orbit around a non-spinning black hole manage that?',
      choices: [
        'No: even on the innermost stable orbit a clock ticks at 0.71 of the far-away rate. Only an orbit very near the horizon of a rapidly spinning hole comes close',
        'Yes: any orbit near a black hole stops time',
        'Yes, but only at the photon sphere, where clocks stop completely',
        'No: time dilation only happens to moving clocks, not to orbiting planets',
      ],
      answer: 0,
      why: {
        1: 'Stable orbits must stay outside 6GM/c², where the slowdown is a factor of only 1.4.',
        2: 'Nothing can orbit at the photon sphere except light, and clocks there would still tick.',
        3: 'Orbiting clocks are slowed by both their height in the well and their speed.',
      },
      hints: [t`On a circular orbit at $r$, clocks tick at $\sqrt{1 - 3GM/(c^2 r)}$ of the far-away rate. Put in $r = 6GM/c^2$.`, 'Is a factor of 1/0.71 ≈ 1.4 anywhere near 61 000?'],
      teach: 'Around a non-spinning black hole no stable orbit slows clocks by more than a factor of √2.',
      explain: t`At the ISCO, $\sqrt{1 - 3/6} = ${sci(clockCirc(6), 3)}$: an hour on the orbit is only 1.4 hours far away. The film's factor needs a planet orbiting very close to the horizon of a black hole spinning almost as fast as possible — where stable orbits reach much deeper.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-isco', difficulty: 2,
      gen(r) {
        const [name, m] = r.pick([['Sagittarius A* (4.30 million solar masses)', 4.30e6], ['M87* (6.5 billion solar masses)', 6.5e9]]);
        const x = iscoM(m * M_SUN) / AU;
        return {
          prompt: t`How far from ${name} is its innermost stable circular orbit, $6GM/c^2$, in AU? ($GM_\odot/c^2 = ${sci(mLen(M_SUN), 4)}$ m, 1 AU $= 1.496\times10^{11}$ m)`,
          answer: x, units: 'AU', tol: { rel: 0.01 },
          errors: [{ value: x / 3, feedback: 'That is the horizon radius, 2GM/c². The ISCO is three times farther.' }],
          hints: [t`$6GM/c^2 = 6\times${sci(m, 3)}\times${sci(mLen(M_SUN), 4)}$ m; divide by $1.496\times10^{11}$.`],
          teach: 'The ISCO scales with the mass: supermassive black holes have ISCOs the size of planetary orbits.',
          explain: t`$r_\text{ISCO} = ${sci(x * AU)}$ m $= ${sci(x)}$ AU${m > 1e9 ? ' — ten times the size of Pluto’s orbit' : ' — well inside Mercury’s orbit (0.39 AU)'}.`,
        };
      },
    }),
    mcq({
      id: 'cp-disk', difficulty: 2,
      prompt: 'Gas in a thin disk around a black hole spirals inward slowly, through one stable orbit after another, until it reaches about 6GM/c². What happens next?',
      choices: [
        'It plunges into the hole within about an orbit: there are no stable circular orbits closer in',
        'It stops at the horizon and stays there',
        'It is flung back out by the centrifugal barrier',
        'It keeps circling at 6GM/c² forever',
      ],
      answer: 0,
      why: {
        1: 'Nothing stops at the horizon: crossing it is a one-way trip, and it is reached in finite time on the gas’s own clock.',
        2: 'Inside the ISCO the barrier is gone — that is the point.',
        3: 'The gas keeps losing energy to friction in the disk, so it cannot stay; and just inside 6GM/c² nothing is stable.',
      },
      hints: ['What does the ISCO mark?'],
      teach: 'The ISCO is the inner edge of a thin accretion disk: inside it, gas plunges.',
      explain: 'Friction in the disk slowly drains orbital energy, moving gas inward through stable circular orbits. At the ISCO the stable orbits run out, and the gas plunges into the hole. X-ray observations of disks around black holes are interpreted with inner edges at or near the ISCO.',
    }),
    num({
      id: 'cp-quasar', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([1, 3, 10]);
        const mdot = (k * M_SUN) / YEAR, P = ETA * mdot * C * C;
        return {
          prompt: t`A quasar's black hole swallows ${k} solar mass${k > 1 ? 'es' : ''} of gas per year through a thin disk. If the gas radiates the ${sci(100 * ETA, 3)}% of its rest energy released by the time it reaches the ISCO, what is the quasar's power, in watts? (1 solar mass $= 1.989\times10^{30}$ kg, 1 year $= 3.156\times10^{7}$ s)`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: mdot * C * C, feedback: 'Only 5.7% of the rest energy is released, not all of it.' }, { value: ETA * k * M_SUN * C * C, feedback: 'That is energy per year. Divide by the seconds in a year to get power.' }],
          hints: [t`Mass per second: $\dot m = ${k}\times1.989\times10^{30}/3.156\times10^{7}$ kg/s.`, t`$P = 0.0572\,\dot m c^2$ with $\dot m = ${sci(mdot)}$ kg/s.`],
          teach: 'Accretion onto a black hole turns about 6% of mass into light — the engine of quasars.',
          explain: t`$\dot m = ${sci(mdot)}$ kg/s, so $P = 0.0572\times${sci(mdot)}\times(2.998\times10^{8})^2 = ${sci(P)}$ W — about $${sci(P / L_SUN, 2)}$ Suns, outshining a whole galaxy from a region smaller than the Solar System.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 7 (orbits in Schwarzschild)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed., free online)', url: 'https://www.eftaylor.com/exploringblackholes' },
  ],
});
