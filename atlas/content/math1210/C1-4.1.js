// Related rates — relate the quantities, differentiate the relation with
// respect to time, and only then put in the numbers.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N } from './_c1kit.js';

const t = String.raw;
const D = Math.PI / 180;

// the radar geometry of the Explore step: aircraft at ground distance X, altitude H
const X = '(12 - v*tm/1000)';

export default lesson({
  id: 'math1210.C1-4.1',
  title: 'Related rates',
  minutes: 11, difficulty: 3,
  intro: t`When two quantities are tied together by an equation and both change in time, their rates are tied together too. Find the equation that relates the quantities, then differentiate **both sides with respect to time** — implicitly, with the chain rule. For an aircraft at constant altitude $H$ and ground distance $x$ from a radar, the range $r$ obeys

$$r^2 = x^2 + H^2 \quad\Longrightarrow\quad 2r\,\frac{dr}{dt} = 2x\,\frac{dx}{dt}$$

The method is always the same: **relate, then differentiate, then substitute**. Putting the numbers in before differentiating freezes the variables and destroys the rates.`,
  symbols: [
    { tex: 'r', text: 'the straight-line range from the radar to the aircraft, in km' },
    { tex: 'x', text: 'the horizontal (ground) distance from the radar to the point beneath the aircraft, in km' },
    { tex: 'H', text: 'the aircraft’s altitude, in km — constant here, so it has no rate' },
    { tex: 't', text: 'time, in s' },
    { tex: '\\frac{dr}{dt},\\ \\frac{dx}{dt}', text: 'how fast the range and the ground distance change, in km/s (or m/s): the **related rates**' },
  ],
  why: t`Radar range rate, the closing speed of two spacecraft, how fast a balloon swells or a tank drains — even Hubble’s law — all come from differentiating a geometric relation in time.`,
  visual: {
    type: 'graph',
    title: 'Radar range to a passing aircraft',
    lead: t`A radar at the origin tracks an aircraft flying level at altitude $H$ and speed $v$. Run the clock with the time slider. The readouts show the ground distance $x$, the range $r$, and the rate at which the range is changing.`,
    tasks: [
      t`Far away, the range shrinks at nearly the full flight speed: $dr/dt \approx -v$.`,
      t`At the moment the aircraft passes overhead ($x = 0$), $dr/dt = 0$ — although the aircraft has not slowed at all.`,
      t`Raise the altitude: near overhead, the range rate changes more gently.`,
    ],
    params: {
      x: [-18, 14], y: [-2, 12], aspect: 'wide', equal: true, xlabel: 'ground distance (km)', ylabel: 'height (km)', yticks: 5,
      sliders: [
        { key: 'tm', label: 'Time', min: 0, max: 100, step: 0.5, value: 20, unit: t`\text{s}`, explain: t`Seconds since the aircraft was $12$ km from the radar, flying toward it.` },
        { key: 'v', label: t`Speed $v$`, min: 100, max: 300, step: 10, value: 250, unit: t`\text{m/s}`, explain: t`The aircraft’s constant ground speed; $250$ m/s is $900$ km/h, a typical airliner cruise.` },
        { key: 'H', label: t`Altitude $H$`, min: 1, max: 10, step: 0.5, value: 6, unit: t`\text{km}`, explain: t`The aircraft’s constant altitude above the radar.` },
      ],
      curves: [
        { param: [`${X}*t`, 'H*t'], t: [0, 1], color: 'accent', width: 2 },
        { param: [X, 'H*t'], t: [0, 1], color: 'ink3', dash: true, width: 1.2 },
        { param: [`${X}*t`, '0'], t: [0, 1], color: 'violet', width: 2 },
      ],
      arrows: [{ from: [X, 'H'], to: [`${X} - v/80`, 'H'], color: 'gold', label: 'v' }],
      points: [
        { x: 0, y: 0, color: 'warn', r: 6, label: 'radar', labelDy: 16, labelDx: -18 },
        { x: X, y: 'H', color: 'gold', r: 6, label: 'aircraft', labelDx: 8 },
        { x: `${X}/2`, y: 'H/2', r: 0, label: 'r', labelDx: -14, labelDy: -6 },
        { x: `${X}/2`, y: 0, r: 0, label: 'x', labelDy: 16 },
      ],
      readouts: [
        { label: t`$x$`, expr: X, unit: t`\text{km}`, digits: 3 },
        { label: t`$r$`, expr: `sqrt(${X}^2 + H^2)`, unit: t`\text{km}`, digits: 3 },
        { label: t`$dx/dt$`, expr: '-v', unit: t`\text{m/s}`, digits: 3 },
        { label: t`range rate $dr/dt$`, expr: `-v*${X}/sqrt(${X}^2 + H^2)`, unit: t`\text{m/s}`, digits: 3 },
      ],
    },
    caption: t`Flat Earth, straight level flight, and a radar at ground level. Both axes share one scale. Real radars measure range rate directly from the Doppler shift of the echo.`,
  },
  example: {
    prompt: t`A spherical weather balloon is filled with helium at a steady $0.060\ \text{m}^3/\text{s}$. How fast is its radius growing when the radius is $0.90$ m?`,
    visual: {
      type: 'graph',
      params: {
        x: [-4, 125], y: [-0.08, 1.45], aspect: 'wide', xlabel: 't (s)', ylabel: 'r (m)',
        curves: [{ fn: 'cbrt(3*0.06*x/(4*pi))', color: 'accent', domain: [0, 125] }, { fn: '0.9 + 0.0058946*(x - 50.894)', color: 'gold', dash: true, width: 1.8, domain: [20, 82] }],
        points: [{ x: 50.894, y: 0.9, color: 'gold', label: 'r = 0.90 m', labelDx: -8, labelDy: -10, labelAlign: 'right' }],
      },
      caption: t`The radius against time for a steady fill from empty. It grows quickly at first, then ever more slowly: each new litre is spread over a larger surface. The balloon is treated as a perfect sphere.`,
    },
    steps: [
      { label: 'Name the quantities', text: t`Volume $V$ and radius $r$ both change with time. Given: $\dfrac{dV}{dt} = 0.060\ \text{m}^3/\text{s}$. Wanted: $\dfrac{dr}{dt}$ at the moment $r = 0.90$ m.` },
      { label: 'Relate', text: t`For a sphere, $V = \tfrac43\pi r^3$. This holds at **every** moment, so it can be differentiated in time.` },
      { label: 'Differentiate in time', text: t`$\dfrac{dV}{dt} = \tfrac43\pi\cdot 3r^2\,\dfrac{dr}{dt} = 4\pi r^2\,\dfrac{dr}{dt}$ — the chain rule, because $r$ is a function of $t$.` },
      { label: 'Substitute', text: t`Now put in the numbers for this moment: $0.060 = 4\pi(0.90)^2\,\dfrac{dr}{dt}$, so $\dfrac{dr}{dt} = \dfrac{0.060}{4\pi(0.81)} = 0.0059$ m/s, about $5.9$ mm/s.` },
      { label: 'Sense check', text: t`$4\pi r^2$ is the balloon’s surface area: the volume rate equals the area times the speed at which the surface moves outward. The bigger the balloon, the slower the radius grows.` },
    ],
    answer: t`$\dfrac{dr}{dt} = \dfrac{dV/dt}{4\pi r^2} \approx 5.9$ mm/s at $r = 0.90$ m.`,
  },
  practice: [
    num({
      id: 'lander-shadow', difficulty: 2,
      gen(r) {
        const a = r.pick([8, 10, 12, 15]), v = r.pick([1, 1.5, 2, 3]);
        const ans = v / Math.tan(a * D), h = 30, s = h / Math.tan(a * D);
        return {
          prompt: t`A lunar lander descends vertically at $${v}$ m/s over flat ground, with the Sun $${a}^\circ$ above the horizon. Its shadow lies a distance $s = \dfrac{h}{\tan ${a}^\circ}$ from the point directly beneath it, where $h$ is its height. How fast does the shadow move toward that point?`,
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: v * Math.tan(a * D), feedback: t`You multiplied by $\tan ${a}^\circ$. The relation is $s = h/\tan ${a}^\circ$, so divide.` }, { value: v, feedback: t`The shadow is not where the lander is: a low Sun stretches every vertical motion into a much larger horizontal one.` }],
          hints: [t`The Sun’s angle is fixed, so $\tan ${a}^\circ$ is a constant: $\dfrac{ds}{dt} = \dfrac{1}{\tan ${a}^\circ}\dfrac{dh}{dt}$.`, t`$\dfrac{dh}{dt} = -${v}$ m/s (descending).`],
          teach: t`Only quantities that change get a rate; a fixed angle is a constant factor.`,
          explain: t`$\dfrac{ds}{dt} = \dfrac{-${v}}{\tan ${a}^\circ} = ${nice(-ans, 3)}$ m/s: the shadow races in at $${nice(ans, 3)}$ m/s, $${nice(1 / Math.tan(a * D), 3)}$ times the descent rate, and meets the lander at touchdown.`,
          visual: {
            type: 'graph',
            params: {
              x: [-12, s + 25], y: [-4, 45], aspect: 'wide', equal: true, xlabel: 'm', ylabel: '',
              curves: [{ fn: lineAt0(s, h), color: 'gold', dash: true, width: 1.6, domain: [0, s] }, { param: ['0', `${h}*t`], t: [0, 1], color: 'ink3', dash: true, width: 1.2 }],
              points: [{ x: 0, y: h, color: 'accent', r: 6, label: 'lander' }, { x: N(s), y: 0, color: 'violet', r: 5, label: 'shadow', labelDx: 8, labelDy: -14 }],
              arrows: [{ from: [0, h], to: [0, h - 10], color: 'accent', label: 'descending' }],
            },
            caption: t`A sunbeam (dashed gold) grazes the lander and lands at the shadow. Shown at $h = ${h}$ m; flat ground and parallel sunlight assumed. Apollo landings were timed for a low Sun, roughly $5$–$15^\circ$ up, so that craters cast long shadows.`,
          },
        };
      },
    }),
    num({
      id: 'balloon-volume', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3, 4, 5]), dr = r.pick([1, 2, 3]);
        const ans = 4 * Math.PI * R * R * dr / 1000;
        return {
          prompt: t`As a high-altitude balloon rises into thinner air it swells. When its radius is $${R}$ m, the radius grows at $${dr}$ mm/s. How fast is its volume growing, in $\text{m}^3/\text{s}$?`,
          answer: ans, units: 'm^3/s', tol: { rel: 0.005 },
          errors: [{ value: 4 * Math.PI * R * R * dr, feedback: t`Convert the rate first: $${dr}$ mm/s is $${nice(dr / 1000)}$ m/s.` }, { value: 4 * Math.PI * R * dr / 1000, feedback: t`$\frac{d}{dt}\left(\tfrac43\pi r^3\right) = 4\pi r^2\frac{dr}{dt}$ — the radius is squared.` }],
          hints: [t`$V = \tfrac43\pi r^3$, so $\dfrac{dV}{dt} = 4\pi r^2\dfrac{dr}{dt}$.`, t`Use $\dfrac{dr}{dt} = ${nice(dr / 1000)}$ m/s.`],
          teach: t`Differentiate the volume formula in time; the rate of the radius comes out as a factor.`,
          explain: t`$\dfrac{dV}{dt} = 4\pi(${R})^2(${nice(dr / 1000)}) = ${nice(ans, 3)}\ \text{m}^3/\text{s}$.`,
          visual: { type: 'graph', params: { x: [-7, 7], y: [-5.2, 5.2], aspect: 'wide', equal: true, xlabel: 'm', ylabel: '', curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent' }, { param: [`${R + 0.5}*cos(t)`, `${R + 0.5}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent', dash: true, width: 1.2 }], arrows: [{ from: [0, 0], to: [R, 0], color: 'gold', label: `r = ${R} m`, labelDy: -10, labelAlign: 'right' }] }, caption: t`A cross-section of the balloon now (solid) and a little later (dashed; the growth is exaggerated). The new volume is a thin shell: surface area times thickness.` },
        };
      },
    }),
    num({
      id: 'radar', difficulty: 2,
      gen(r) {
        const [x, H] = r.pick([[8, 6], [12, 5], [4, 3], [6, 8], [12, 9], [15, 8]]), v = r.pick([600, 720, 900]);
        const R = Math.hypot(x, H), ans = -x * v / R;
        return {
          prompt: t`An aircraft flies level at altitude $${H}$ km and $${v}$ km/h straight toward a radar. At the moment its ground distance from the radar is $${x}$ km, how fast is the range $r$ changing?`,
          answer: ans, units: 'km/h', tol: { rel: 0.005 },
          errors: [{ value: -v, feedback: t`That is the ground speed. The range shrinks more slowly, by the factor $x/r = ${x}/${nice(R)}$, because part of the motion is sideways to the line of sight.` }, { value: -v * R / x, feedback: t`Upside down: $\dfrac{dr}{dt} = \dfrac{x}{r}\dfrac{dx}{dt}$, and $x/r < 1$.` }],
          hints: [t`$r^2 = x^2 + ${H * H}$; differentiate: $2r\,\dfrac{dr}{dt} = 2x\,\dfrac{dx}{dt}$.`, t`At this moment $r = \sqrt{${x * x} + ${H * H}} = ${nice(R)}$ km and $\dfrac{dx}{dt} = -${v}$ km/h.`],
          teach: t`Relate, differentiate, then substitute: $\frac{dr}{dt} = \frac{x}{r}\frac{dx}{dt}$.`,
          explain: t`$\dfrac{dr}{dt} = \dfrac{${x}}{${nice(R)}}\times(-${v}) = ${nice(ans, 4)}$ km/h. The range is shrinking — negative — and more slowly than the aircraft flies.`,
          visual: { type: 'graph', params: { x: [-2, 17], y: [-1.5, 10], aspect: 'wide', equal: true, xlabel: 'km', ylabel: '', curves: [{ param: [`${x}*t`, `${H}*t`], t: [0, 1], color: 'accent', width: 2 }, { param: [`${x}*t`, '0'], t: [0, 1], color: 'violet', width: 2 }, { param: [`${x}`, `${H}*t`], t: [0, 1], color: 'ink3', dash: true, width: 1.2 }], points: [{ x: 0, y: 0, color: 'warn', r: 6, label: 'radar', labelDy: 16 }, { x, y: H, color: 'gold', r: 6 }, { x: x / 2, y: H / 2, r: 0, label: 'r', labelDx: -14 }, { x: x / 2, y: 0, r: 0, label: `x = ${x} km`, labelDy: 16 }], arrows: [{ from: [x, H], to: [x - 2.5, H], color: 'gold', label: 'v' }] }, caption: t`The right triangle at this moment: altitude $${H}$ km, ground distance $${x}$ km. Flat Earth assumed.` },
        };
      },
    }),
    mcq({
      id: 'when-substitute', difficulty: 2,
      prompt: t`For the radar, $r^2 = x^2 + H^2$, with the altitude $H = 6$ km constant. At the moment of interest $x = 8$ km and $r = 10$ km. Which numbers may you substitute **before** differentiating with respect to time?`,
      visual: { type: 'graph', params: { x: [-2, 12], y: [-1.5, 8], aspect: 'wide', equal: true, xlabel: 'km', ylabel: '', curves: [{ param: ['8*t', '6*t'], t: [0, 1], color: 'accent', width: 2 }, { param: ['8*t', '0'], t: [0, 1], color: 'violet', width: 2 }, { param: ['8', '6*t'], t: [0, 1], color: 'ink3', dash: true, width: 1.2 }], points: [{ x: 0, y: 0, color: 'warn', r: 6 }, { x: 8, y: 6, color: 'gold', r: 6 }, { x: 4, y: 3, r: 0, label: 'r = 10 km', labelDx: -76, labelDy: -4 }, { x: 4, y: 0, r: 0, label: 'x = 8 km', labelDy: 16 }, { x: 8, y: 3, r: 0, label: 'H = 6 km', labelDx: 8 }] }, caption: 'One frame of a moving picture: x and r change from moment to moment; H does not.' },
      choices: [t`Only $H = 6$ km, the constant`, t`$x = 8$, $r = 10$ and $H = 6$ — they are all known now`, 'None of them — even constants must wait until the end', t`Only $x$ and $r$`],
      answer: 0,
      why: {
        1: t`Then the equation reads $100 = 64 + 36$, a true statement about numbers, and differentiating it gives $0 = 0$ — every rate is lost.`,
        2: t`A constant has no rate, so putting $H = 6$ in early is harmless: $r^2 = x^2 + 36$ still differentiates to $2r\,r' = 2x\,x'$.`,
        3: t`$x$ and $r$ change in time; frozen at their current values, their derivatives would vanish.`,
      },
      hints: ['Which of the three quantities changes as the aircraft flies?'],
      teach: 'Substitute numbers for quantities that vary only after differentiating; constants may go in at any time.',
      explain: t`$H$ is constant, so $r^2 = x^2 + 36$ is fine to differentiate. $x$ and $r$ vary, and only after differentiating, $2r\,r' = 2x\,x'$, may you put in $x = 8$ and $r = 10$.`,
    }),
    num({
      id: 'cone-tank', difficulty: 3,
      gen(r) {
        const Q = r.pick([20, 30, 50]), h = r.pick([1, 1.5, 2]);
        const k = 0.5;                          // radius-to-depth ratio: 1.5 m wide at 3 m deep
        const ans = Q / 1000 / (Math.PI * k * k * h * h) * 100;
        return {
          prompt: t`A conical tank stands vertex down; it is $3$ m deep and $1.5$ m in radius at the top. Liquid drains from the vertex at $${Q}$ L/s. How fast is the liquid level falling when the liquid is $${h}$ m deep? Give the answer in cm/s.`,
          answer: ans, units: 'cm/s', tol: { rel: 0.005 },
          errors: [{ value: Q / 1000 / (Math.PI * 1.5 * 1.5) * 100, feedback: t`That treats the tank as a cylinder of radius $1.5$ m. The surface’s radius shrinks with depth: at depth $h$ it is $h/2$.` }],
          hints: [t`Similar triangles: the surface radius is $r = \dfrac{1.5}{3}h = \dfrac{h}{2}$.`, t`So $V = \tfrac13\pi r^2h = \dfrac{\pi}{12}h^3$, and $\dfrac{dV}{dt} = \dfrac{\pi}{4}h^2\dfrac{dh}{dt}$.`, t`$\dfrac{dV}{dt} = -${nice(Q / 1000)}\ \text{m}^3/\text{s}$; solve for $\dfrac{dh}{dt}$ at $h = ${h}$ m, then convert to cm/s.`],
          teach: t`Eliminate the variable you have no rate for (the surface radius) with a geometric relation, then differentiate.`,
          explain: t`$\dfrac{dh}{dt} = \dfrac{dV/dt}{\pi h^2/4} = \dfrac{-${nice(Q / 1000)}}{\pi(${h})^2/4} = ${nice(-ans / 100, 3)}$ m/s: the level falls at $${nice(ans, 3)}$ cm/s, faster and faster as the tank narrows.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3.4, 3.4], y: [-0.3, 3.3], aspect: 'wide', equal: true, xlabel: 'm', ylabel: 'm',
              curves: [{ fn: '2*abs(x)', color: 'ink2', width: 2, domain: [-1.5, 1.5] }, { fn: '3', color: 'ink2', width: 1.2, dash: true, domain: [-1.5, 1.5] }],
              shade: [{ fn: `${h}`, lower: '2*abs(x)', from: -h / 2, to: h / 2, color: 'accent', alpha: 0.35 }],
              points: [{ x: h / 2, y: h, r: 0, label: `depth ${h} m`, labelDx: 10 }],
              arrows: [{ from: [0, 0], to: [0, -0.3], color: 'accent', label: `${Q} L/s`, labelDx: 8 }],
            },
            caption: t`A cross-section of the tank with the liquid shaded. The surface narrows as the level falls, so the same outflow drops it faster.`,
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-floodlight', difficulty: 3,
      gen(r) {
        const T = r.pick([8, 10, 12]), p = r.pick([1.6, 1.8]), v = r.pick([1, 1.2, 1.5]);
        const ans = v * T / (T - p);
        const x0 = 6, s0 = x0 * T / (T - p);
        return {
          prompt: t`A floodlight sits $${T}$ m up a launch tower. A technician $${p}$ m tall walks straight away from the tower at $${v}$ m/s. How fast is the **tip** of the technician’s shadow moving?`,
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: v, feedback: t`The tip moves faster than the walker: the shadow also lengthens as the walker leaves the light.` }, { value: v * p / (T - p), feedback: t`That is how fast the shadow’s *length* grows. The tip moves at that rate plus the walking speed.` }],
          hints: [t`Let $x$ be the walker’s distance from the tower and $s$ the tip’s. Similar triangles: $\dfrac{s}{${T}} = \dfrac{s - x}{${p}}$.`, t`Solve for $s$: $s = \dfrac{${T}}{${nice(T - p)}}\,x$. Now differentiate in time.`],
          teach: t`Similar triangles give a relation that holds at every moment; differentiate it in time.`,
          explain: t`$${p}s = ${T}(s - x)$ gives $s = \dfrac{${T}}{${nice(T - p)}}x$, so $\dfrac{ds}{dt} = \dfrac{${T}}{${nice(T - p)}}\times ${v} = ${nice(ans, 3)}$ m/s — the same wherever the technician is.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, 12], y: [-0.8, T + 1], aspect: 'wide', equal: true, xlabel: 'm', ylabel: 'm',
              curves: [{ param: ['0', `${T}*t`], t: [0, 1], color: 'ink2', width: 3 }, { param: [`${x0}`, `${p}*t`], t: [0, 1], color: 'accent', width: 4 }, { fn: `${T} - ${N(T / s0)}*x`, color: 'gold', dash: true, width: 1.4, domain: [0, s0] }, { param: [`${x0} + ${N(s0 - x0)}*t`, '0'], t: [0, 1], color: 'violet', width: 3 }],
              points: [{ x: 0, y: T, color: 'gold', r: 6, label: 'floodlight' }, { x: N(s0), y: 0, color: 'violet', r: 4, label: 'tip', labelDy: 16 }],
            },
            caption: t`The tower, the technician and the shadow (violet), with the ray from the light that grazes the head (dashed). A point-like light and level ground assumed.`,
          },
        };
      },
    }),
    num({
      id: 'cp-hubble', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([50, 100, 200, 400]);
        const ans = 70 * d;
        return {
          prompt: t`In an expanding universe the distance to a distant galaxy is $d(t) = a(t)\,\chi$, where $\chi$ is a fixed (comoving) coordinate distance and $a(t)$ the scale factor. Today $\dfrac{\dot a}{a} = H_0 = 70$ km/s per Mpc. How fast is the distance to a galaxy now $${d}$ Mpc away growing, in km/s? ($\dot a$ means $da/dt$.)`,
          answer: ans, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: 70, feedback: t`That is $H_0$ alone. The rate grows with distance: multiply by $d$.` }],
          hints: [t`$\chi$ is constant, so $\dot d = \dot a\,\chi$.`, t`Write $\dot a\,\chi = \dfrac{\dot a}{a}\cdot a\chi = H_0\,d$.`],
          teach: t`Differentiating $d = a\chi$ in time, with $\chi$ fixed, gives Hubble’s law: $\dot d = H_0 d$.`,
          explain: t`$\dot d = \dfrac{\dot a}{a}\,d = 70\times ${d} = ${ans}$ km/s. Every distance grows in proportion to itself — that is Hubble’s law, derived as a related rate.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 1.08], y: [0, 4.4], aspect: 'wide', xlabel: 'time (today = 1)', ylabel: 'distance',
              curves: [{ fn: 'x^(2/3)', color: 'accent', domain: [0, 1.05], label: 'χ = 1', labelAt: 1.0, labelDx: -40, labelDy: -10 }, { fn: '2*x^(2/3)', color: 'violet', domain: [0, 1.05], label: 'χ = 2', labelAt: 1.0, labelDx: -40, labelDy: -10 }, { fn: '4*x^(2/3)', color: 'gold', domain: [0, 1.05], label: 'χ = 4', labelAt: 0.8, labelDx: -40, labelDy: -10 }],
              vlines: [{ x: 1, label: 'today' }],
            },
            caption: t`Distances to three galaxies, $d = a(t)\chi$, all scaled by the same $a(t)$ (here $t^{2/3}$, a matter-only universe, for illustration). At any moment the farther galaxy’s distance grows faster, in proportion. $H_0$ is measured at $67$ to $73$ km/s/Mpc; $70$ splits the difference.`,
          },
        };
      },
    }),
    num({
      id: 'cp-balloon', difficulty: 2,
      gen(r) {
        const Q = r.pick([0.04, 0.05, 0.08]), R = r.pick([0.6, 0.8, 1.0, 1.2]);
        const ans = Q / (4 * Math.PI * R * R) * 1000;
        return {
          prompt: t`A spherical balloon is filled at $${Q}\ \text{m}^3/\text{s}$. How fast is its radius growing when the radius is $${R}$ m? Give the answer in mm/s.`,
          answer: ans, units: 'mm/s', tol: { rel: 0.005 },
          errors: [{ value: Q / (4 / 3 * Math.PI * R ** 3) * 1000, feedback: t`You divided by the volume. Differentiate first: $\frac{dV}{dt} = 4\pi r^2\frac{dr}{dt}$.` }],
          hints: [t`$\dfrac{dV}{dt} = 4\pi r^2\dfrac{dr}{dt}$.`],
          teach: 'Relate, differentiate, substitute.',
          explain: t`$\dfrac{dr}{dt} = \dfrac{${Q}}{4\pi(${R})^2} = ${nice(ans / 1000, 3)}$ m/s $= ${nice(ans, 3)}$ mm/s.`,
          visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-1.6, 1.6], aspect: 'wide', equal: true, xlabel: 'm', ylabel: '', curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent' }], arrows: [{ from: [0, 0], to: [R, 0], color: 'gold', label: `r = ${R} m`, labelDy: -10, labelAlign: 'right' }] }, caption: 'A cross-section of the balloon, treated as a perfect sphere.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §4.1 Related rates', url: 'https://openstax.org/books/calculus-volume-1/pages/4-1-related-rates' },
    { label: 'Planck Collaboration 2018 results VI (H₀ = 67.4 km/s/Mpc)', url: 'https://arxiv.org/abs/1807.06209' },
  ],
});

// the sunbeam that grazes the lander at height h and lands at distance s
function lineAt0(s, h) { return `${h} - ${N(h / s)}*x`; }
