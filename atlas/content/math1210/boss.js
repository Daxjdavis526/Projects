// The MATH 1210 boss, "The Rate of Change Challenge": Shearwater, an imagined
// deep-space probe built from real parts, carries a hydrogen-maser clock out
// to Jupiter and home again so that it can be compared with its twin on the
// ground. On the pad, the clock's steering offset and the IVT, and the
// weak-field limit of gravitational time dilation (a conjugate at infinity);
// leaving Earth, the vis-viva speed differentiated by the chain rule and the
// work against inverse-square gravity by the Fundamental Theorem; in cruise,
// the clock's velocity lag by linearization (a number a ten-digit calculator
// cannot subtract), a quasar's horizon area growing as it feeds (related
// rates) and the energy of a jet's photons differentiated by the quotient
// rule; at Jupiter, the disc swelling in the camera (related rates), the
// closest pass to a small moon inside an imaging window (an extreme value
// with an endpoint twist) and one Newton step on the hyperbolic Kepler
// equation; and home, the largest sample canister inside a conical capsule
// (optimization) and the heat of entry by substitution. Every number comes
// from its generator; the case functions are exported so a script can
// recompute every key another way.
import { boss, mcq, num, expr } from '../../src/core/content.js';
import { tex, nice } from '../../src/core/format.js';
import { N, curveFig, thou } from './_c1kit.js';
import { areaFig } from './_c1int.js';

const t = String.raw;
const PI = Math.PI;
const C_KMS = 299792;           // km/s, as the prompts print it
const MU = 398600;              // km³/s², Earth's GM as the prompts print it
const RJ = 71492;               // km, Jupiter's equatorial radius
const RS_SUN = 2.953;           // km of Schwarzschild radius per solar mass
const DAY = 86400;              // s
const r4 = (v) => +(+v).toFixed(4);

/** Keep only the slips whose values are finite and clearly apart from the key (and from each other). */
function apart(errors, key, rel = 0.03) {
  const out = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) {
    if (!Number.isFinite(e.value)) continue;
    if (e.value !== 0 && !far(e.value, key, rel)) continue;
    if (out.some((o) => !far(o.value, e.value, 0.01))) continue;
    out.push(e);
  }
  return out;
}

// ── picture pieces ───────────────────────────────────────────────────────────
const seg = (x1, y1, x2, y2, color = 'ink3', width = 1.6, dash = false) =>
  ({ param: [`${r4(x1)} + t*(${r4(x2 - x1)})`, `${r4(y1)} + t*(${r4(y2 - y1)})`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}) });
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0, align) =>
  ({ x: r4(x), y: r4(y), r: 0, color, label, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });
/** curveFig, with the main curve's label nudged (screen pixels). */
const fig = (opts, dx = 6, dy = -10, tdx, tdy) => {
  const f = curveFig(opts);
  Object.assign(f.params.curves[0], { labelDx: dx, labelDy: dy });
  if (tdx !== undefined) Object.assign(f.params.points[f.params.points.length - 1], { labelDx: tdx, labelDy: tdy, labelAlign: 'right' });
  return f;
};
const times = (n) => `${n} ${n === 1 ? 'time' : 'times'}`;
const circle = (cx, cy, R, color = 'ink2', width = 1.8, dash = false) =>
  ({ param: [`${r4(cx)} + ${r4(R)}*cos(t)`, `${r4(cy)} + ${r4(R)}*sin(t)`], t: [0, 2 * PI], color, width, ...(dash ? { dash: true } : {}) });

// ── round 1: countdown ───────────────────────────────────────────────────────
/** Seven hourly clock offsets (ns) with k changes of sign; neg is the number of negative readings (never k). */
export function syncCase(r) {
  const n = 7, k = r.int(2, 4);
  const gaps = r.shuffle([0, 1, 2, 3, 4, 5]).slice(0, k).sort((a, b) => a - b);
  let s = r.sign();
  const signs = [];
  for (let i = 0; i < n; i++) { if (i > 0 && gaps.includes(i - 1)) s = -s; signs.push(s); }
  let vals = signs.map((sg) => sg * r.float(0.4, 3.6, 0.1));
  let neg = vals.filter((v) => v < 0).length;
  if (neg === k) { vals = vals.map((v) => -v); neg = n - neg; }
  return { vals, k, neg, gaps };
}

const BODIES = [
  { key: 'sun', name: 'the Sun', rs: 2.953, unit: 'km', surf: 'about 236 000 rₛ' },
  { key: 'earth', name: 'Earth', rs: 8.870, unit: 'mm', surf: 'about 720 million rₛ' },
  { key: 'jupiter', name: 'Jupiter', rs: 2.819, unit: 'm', surf: 'about 25 million rₛ' },
  { key: 'siriusb', name: 'Sirius B, a white dwarf of 1.02 solar masses', rs: 3.006, unit: 'km', surf: 'about 1 900 rₛ' },
];
export function weakCase(r) {
  return { body: r.pick(BODIES), kind: r.pick(['rate', 'shift']) };
}

// ── round 2: leaving Earth ───────────────────────────────────────────────────
export function visvivaCase(r) {
  return { a: r.int(16, 30) * 1000 };
}
export function climbCase(r) {
  const m = r.int(18, 32) * 100, h1 = r.pick([200, 250, 300, 400]), r1 = 6378 + h1, r2 = r.pick([42164, 66000, 100000, 150000]);
  const W = (MU * m * (1 / r1 - 1 / r2)) / 1000;     // GJ
  return { m, h1, r1, r2, W };
}

// ── round 3: cruise ──────────────────────────────────────────────────────────
export function clockCase(r) {
  const v = r.int(18, 44), u = (v / C_KMS) ** 2;
  const lag = DAY * (u / (1 + Math.sqrt(1 - u))) * 1e6;   // μs per day, 1 − √(1−u) without cancellation
  return { v, u, lag };
}
export function horizonCase(r) {
  const M = r.pick([5e8, 1e9, 2e9, 3e9, 6.5e9]), Md = r.pick([0.5, 1, 2, 4]);
  const rs = RS_SUN * M, drs = RS_SUN * Md, dA = 8 * PI * rs * drs;
  return { M, Md, rs, drs, dA };
}
export function jetCase(r) {
  return { E0: r.pick([2, 3, 6.4, 8]), dir: r.pick(['toward', 'away']) };
}

// ── round 4: Jupiter ─────────────────────────────────────────────────────────
export function approachCase(r) {
  const k = r.pick([2, 2.5, 3, 3.5]), v = r.int(6, 14), D = k * RJ;
  const rate = ((2 * RJ * v) / (D * Math.sqrt(D * D - RJ * RJ))) * 3600 * (180 / PI);   // deg/h
  return { k, v, D, rate };
}
export function cpaCase(r) {
  const x0 = -r.int(24, 40) * 1000, y0 = r.sign() * r.int(3, 9) * 1000, vx = r.int(6, 12);
  // a sideways speed that keeps the miss distance at least 800 km
  const toward = r.shuffle([1, 2, 3]).map((n) => -Math.sign(y0) * n), away = r.shuffle([1, 2, 3]).map((n) => Math.sign(y0) * n);
  const vys = [...toward, ...away];
  let vy = vys[0];
  for (const c of vys) { if (Math.abs(x0 * c - y0 * vx) / Math.hypot(vx, c) >= 800) { vy = c; break; } }
  const v2 = vx * vx + vy * vy, ts = -(x0 * vx + y0 * vy) / v2, Dmin = Math.abs(x0 * vy - y0 * vx) / Math.sqrt(v2);
  const inside = r.bool(0.5);
  const T = Math.round((ts * (inside ? r.pick([1.3, 1.6]) : r.pick([0.55, 0.7]))) / 100) * 100;
  const dist = (tt) => Math.hypot(x0 + vx * tt, y0 + vy * tt);
  const ans = ts <= T ? Dmin : dist(T);
  return { x0, y0, vx, vy, ts, Dmin, T, inside: ts <= T, ans, dist };
}
export function flybyCase(r) {
  const e = r.pick([1.3, 1.6, 2, 2.4]), M = r.pick([1.2, 2, 3, 4.5]);
  const g = (F) => e * Math.sinh(F) - F - M, dg = (F) => e * Math.cosh(F) - 1;
  let root = Math.asinh(M / e) + 0.5;
  for (let i = 0; i < 60; i++) root -= g(root) / dg(root);
  const F0 = +(Math.round((root + r.pick([-0.3, -0.2, 0.2, 0.3])) * 10) / 10).toFixed(1);
  const F1 = F0 - g(F0) / dg(F0);
  return { e, M, root, F0, F1, g, dg };
}

// ── round 5: homecoming ──────────────────────────────────────────────────────
export function canisterCase(r) {
  const R = r.int(25, 45), H = r.int(18, 36);
  return { R, H, V: (4 * PI * R * R * H) / 27 / 1000 };     // litres
}
export function heatCase(r) {
  const qpk = r.pick([600, 800, 1000, 1200]), tau = r.pick([20, 25, 30, 40]), T = tau * r.pick([1, 1.5, 2, 3]);
  const U = (T * T) / (2 * tau * tau);
  const Q = (qpk * tau * Math.sqrt(Math.E) * (1 - Math.exp(-U))) / 1000;   // kJ/cm²
  return { qpk, tau, T, U, Q };
}

export default boss({
  title: 'The Rate of Change Challenge',
  intro: t`*Shearwater* is an imagined deep-space probe built from real parts. It carries a hydrogen-maser clock — one of the steadiest clocks that can fly — out to Jupiter and, years later, home again, so that it can be laid beside its twin on the ground: a test of relativity's claim that speed and gravity change how fast time passes. Along the way its X-ray telescope watches a feeding black hole. You are on the flight-dynamics team, and every rate, limit and integral on the way is yours to check. Five rounds, twelve problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'Countdown',
      story: t`On the pad, the maser is steered into step with the ground station's master clock, and the science team writes down what the flight clock should see once it is away from Earth.`,
      items: [
        mcq({
          id: 'r1-sync', skill: 'math1210.C1-2.4', difficulty: 3,
          gen(r) {
            const { vals, k, neg, gaps } = syncCase(r);
            const hours = gaps.map((g) => `${g}–${g + 1}`);
            const list = hours.length > 1 ? `${hours.slice(0, -1).join(', ')} and ${hours[hours.length - 1]}` : hours[0];
            return {
              prompt: t`During the countdown, Shearwater's maser clock is steered toward the ground station's master clock. Their offset $\Delta(t)$ — the maser's reading minus the master's, in nanoseconds — is logged once an hour, from $t = 0$ to $t = 6$ h: $$\Delta = ${vals.map((v) => nice(v)).join(',\\ ')}\ \text{ns}.$$ A clock's offset changes continuously: it cannot jump. During these six hours, how many times **must** the offset have been exactly zero?`,
              choices: [`At least ${times(k)}`, `Exactly ${times(k)}`, `At least ${times(neg)}`, 'None is guaranteed: no reading is exactly zero'],
              answer: 0,
              why: {
                1: t`The Intermediate Value Theorem promises a zero between two readings of opposite sign — but not only one. Within an hour the offset could cross zero three times, and an hour with no change of sign could hide two crossings. Counting changes of sign gives a lower bound, not an exact count.`,
                2: t`That counts the negative readings (${neg} of them). A zero is forced between *consecutive* readings of opposite sign, so count the changes of sign instead: a long run of negative readings may hold no crossing at all.`,
                3: t`The theorem needs no reading of exactly zero. A continuous function that is positive at one time and negative at another must pass through zero somewhere in between.`,
              },
              hints: [
                t`The Intermediate Value Theorem: if $\Delta$ is continuous on $[a, b]$ and $\Delta(a)$, $\Delta(b)$ have opposite signs, then $\Delta(c) = 0$ for some $c$ between $a$ and $b$.`,
                'Apply it to each pair of consecutive readings: every change of sign forces at least one zero in that hour.',
                'Count the changes of sign. The theorem guarantees existence only — it never caps how many zeros there are.',
              ],
              teach: 'A continuous quantity that changes sign must pass through zero in between: the Intermediate Value Theorem guarantees a zero, never an exact count.',
              explain: t`The sign changes in the hours ${list}, so the Intermediate Value Theorem forces a zero in each of those ${k} hours: **at least ${k}**. It cannot say more. Inside an hour the offset might wander back and forth across zero, and an hour whose readings share a sign could still hold an even number of crossings. The steering loop of a real clock ensemble nudges the frequency all the time, and the offset does swing back and forth across zero like this.`,
              visual: {
                type: 'graph',
                params: {
                  x: [-0.4, 6.4], y: [-4.2, 4.2], aspect: 'wide', axesAt: 'edge', xlabel: 'time (h)', ylabel: 'offset Δ (ns)', yticks: 5,
                  hlines: [{ y: 0, color: 'ink3' }],
                  points: vals.map((v, i) => ({ x: i, y: v, r: 5, color: 'accent' })),
                  alt: 'Seven hourly clock-offset readings, some above zero and some below, with nothing drawn between them',
                },
                caption: 'Only the hourly readings are drawn. What the offset did between them is unknown — except that it changed continuously.',
              },
            };
          },
        }),
        num({
          id: 'r1-weak', skill: 'math1210.C1-2.5', difficulty: 3,
          gen(r) {
            const { body, kind } = weakCase(r);
            const { rs, unit, name } = body;
            const L = rs / 2;
            const sym = kind === 'rate' ? t`\delta` : 'z';
            const desc = kind === 'rate'
              ? t`General relativity says a clock at rest at distance $r$ from the centre of a spherical body ticks slower than one far away, by the factor $\sqrt{1 - r_s/r}$, where $r_s$ is the body's Schwarzschild radius. The fraction of each second the nearer clock loses is $$\delta(r) = 1 - \sqrt{1 - \frac{r_s}{r}}.$$`
              : t`General relativity says light climbing away from a spherical body arrives redshifted: light sent from distance $r$ to a receiver far away has its wavelength stretched by the fraction $$z(r) = \frac{1}{\sqrt{1 - r_s/r}} - 1,$$ where $r_s$ is the body's Schwarzschild radius.`;
            const fn = kind === 'rate' ? '1 - sqrt(1 - 1/x)' : '1/sqrt(1 - 1/x) - 1';
            return {
              prompt: t`${desc} For ${name}, $r_s = ${rs}$ ${unit}. Far away, $${sym}(r)$ fades to zero. To see how fast, find $$\lim_{r\to\infty} r\,${sym}(r),$$ in ${unit}.`,
              answer: L, units: unit, tol: { rel: 0.005 },
              errors: apart([
                { value: rs, feedback: t`After multiplying by the conjugate, the denominator is $1 + \sqrt{1 - r_s/r}$, which tends to $2$, not $1$: the limit is $r_s/2$.` },
                { value: 0, feedback: t`$r\to\infty$ while $${sym}(r)\to 0$: the form $\infty\cdot 0$ is indeterminate, not zero. Rewrite the product with the conjugate before letting $r\to\infty$.` },
              ], L),
              hints: [
                t`As $r\to\infty$, $r$ grows without bound while $${sym}(r) \to 0$: the form $\infty \cdot 0$ is indeterminate, so rewrite the product first.`,
                kind === 'rate'
                  ? t`Multiply and divide by the conjugate $1 + \sqrt{1 - r_s/r}$, using $\left(1 - \sqrt{1-w}\right)\left(1 + \sqrt{1-w}\right) = w$.`
                  : t`Write $z = \dfrac{1 - \sqrt{1 - r_s/r}}{\sqrt{1 - r_s/r}}$, then multiply top and bottom by the conjugate $1 + \sqrt{1 - r_s/r}$.`,
                kind === 'rate'
                  ? t`$r\,\delta(r) = \dfrac{r_s}{1 + \sqrt{1 - r_s/r}}$. Now let $r\to\infty$.`
                  : t`$r\,z(r) = \dfrac{r_s}{\sqrt{1 - r_s/r}\,\left(1 + \sqrt{1 - r_s/r}\right)}$. Now let $r\to\infty$.`,
              ],
              teach: t`An $\infty\cdot 0$ limit with a square root yields to the conjugate: rationalize, cancel, then let the variable run off.`,
              explain: t`${kind === 'rate'
                ? t`$$r\,\delta(r) = r\,\frac{\left(1 - \sqrt{1 - r_s/r}\right)\left(1 + \sqrt{1 - r_s/r}\right)}{1 + \sqrt{1 - r_s/r}} = \frac{r_s}{1 + \sqrt{1 - r_s/r}} \to \frac{r_s}{2}$$`
                : t`$$r\,z(r) = \frac{r\left(1 - \sqrt{1 - r_s/r}\right)}{\sqrt{1 - r_s/r}} = \frac{r_s}{\sqrt{1 - r_s/r}\left(1 + \sqrt{1 - r_s/r}\right)} \to \frac{r_s}{2}$$`} so the limit is $r_s/2 = ${nice(L)}$ ${unit}. Far away, then, $${sym}(r) \approx \dfrac{r_s}{2r} = \dfrac{GM}{rc^2}$: the Newtonian gravitational potential divided by $c^2$, since $r_s = 2GM/c^2$. That is the **weak-field limit**, and it is all a clock in the solar system ever needs: at Earth's distance from the Sun, $\dfrac{GM_\odot}{rc^2} \approx \dfrac{1.48\ \text{km}}{1.50\times10^{8}\ \text{km}} \approx 10^{-8}$.`,
              visual: {
                type: 'graph',
                params: {
                  x: [0, 12], y: kind === 'rate' ? [0, 1.12] : [0, 2.6], aspect: 'wide', xlabel: 'distance r, in units of rₛ', ylabel: '', yticks: 4,
                  curves: [{ fn, domain: kind === 'rate' ? [1, 12] : [1.12, 12], color: 'accent', width: 2.4, label: kind === 'rate' ? 'δ(r)' : 'z(r)', labelAt: 4, labelDx: 6, labelDy: -10 }],
                  vlines: [{ x: 1, label: 'r = rₛ', color: 'ink3' }],
                  alt: 'A curve that is large near one Schwarzschild radius and falls toward zero far away',
                },
                caption: `Drawn in units of the Schwarzschild radius. The formula holds only outside the body, and ${body.key === 'sun' ? 'the Sun’s' : body.key === 'earth' ? 'Earth’s' : body.key === 'jupiter' ? 'Jupiter’s' : 'Sirius B’s'} surface is at ${body.surf}, far off to the right: the left of the picture is what a black hole of the same mass would show.`,
              },
            };
          },
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'Leaving Earth',
      story: t`Shearwater reaches a low parking orbit, then coasts on a long elliptical phasing orbit while the navigators line up its departure. Two numbers matter now: how its speed changes as it climbs, and how much energy the climb costs.`,
      items: [
        expr({
          id: 'r2-visviva', skill: 'math1210.C1-3.6', difficulty: 3,
          gen(r) {
            const { a } = visvivaCase(r);
            const aT = thou(a);
            const inner = `398600*(2/r - 1/${a})`;
            const v = (x) => Math.sqrt(MU * (2 / x - 1 / a)), dv = (x) => -MU / (x * x * v(x));
            const rp = 6678;
            return {
              prompt: t`On its phasing orbit, Shearwater's ellipse has semi-major axis $a = ${aT}\ \text{km}$. At distance $r$ from Earth's centre its speed is given by the **vis-viva equation**, $$v(r) = \sqrt{\mu\left(\frac{2}{r} - \frac{1}{a}\right)},\qquad \mu = GM_\oplus = 398\,600\ \text{km}^3/\text{s}^2,$$ with $v$ in km/s and $r$ in km. Find $\dfrac{dv}{dr}$ as a function of $r$.`,
              answer: `-398600/(r^2*sqrt(${inner}))`,
              answerTeX: t`-\dfrac{398\,600}{r^2\sqrt{398\,600\left(\frac{2}{r} - \frac{1}{${aT}}\right)}}`,
              lhs: t`\dfrac{dv}{dr}`,
              vars: { r: [6600, 1.9 * a] },
              derivativeOf: `sqrt(${inner})`,
              errors: [
                { answer: `1/(2*sqrt(${inner}))`, feedback: t`That differentiates the square root but stops there. The chain rule also multiplies by the derivative of the inside, $\dfrac{d}{dr}\,\mu\left(\dfrac2r - \dfrac1a\right) = -\dfrac{2\mu}{r^2}$.` },
                { answer: `398600/(r^2*sqrt(${inner}))`, feedback: t`The sign is lost: $\dfrac{d}{dr}\dfrac{2}{r} = -\dfrac{2}{r^2}$. Speed falls as the probe climbs, so $dv/dr < 0$.` },
                { answer: `-2*398600/(r^2*sqrt(${inner}))`, feedback: t`The square root's derivative carries a $\tfrac12$: $\dfrac{d}{dr}\sqrt{u} = \dfrac{u'}{2\sqrt u}$. It cancels the $2$ in $-2\mu/r^2$.` },
              ],
              hints: [
                t`Write $v = \sqrt{u}$ with $u = \mu\left(\dfrac2r - \dfrac1a\right)$. The chain rule gives $\dfrac{dv}{dr} = \dfrac{1}{2\sqrt u}\,\dfrac{du}{dr}$.`,
                t`$\mu$ and $a$ are constants, so $\dfrac{du}{dr} = \mu\left(-\dfrac{2}{r^2}\right)$.`,
                t`Together: $\dfrac{dv}{dr} = -\dfrac{\mu}{r^2\sqrt{\mu(2/r - 1/a)}} = -\dfrac{\mu}{r^2\,v}$.`,
              ],
              teach: t`The chain rule on a square root: differentiate the root, $\dfrac{1}{2\sqrt u}$, then multiply by the derivative of what is inside it.`,
              explain: t`With $u = \mu(2/r - 1/a)$, $\dfrac{du}{dr} = -\dfrac{2\mu}{r^2}$, so $$\frac{dv}{dr} = \frac{1}{2\sqrt u}\cdot\left(-\frac{2\mu}{r^2}\right) = -\frac{\mu}{r^2\,v(r)} = -\frac{398\,600}{r^2\sqrt{398\,600\left(\frac2r - \frac1{${aT}}\right)}}.$$ Sense check: near perigee at $r = ${thou(rp)}\ \text{km}$ (300 km up), $v = ${tex(v(rp), 4)}\ \text{km/s}$ and $dv/dr = ${tex(dv(rp), 3)}$ s⁻¹ — the probe loses about $${tex(-dv(rp) * 1000, 2)}$ m/s of speed for every kilometre it climbs there, and less and less further out, where gravity is weaker. Note that $a$ fixes the orbit's energy: $dv/dr$ depends on $a$ but not on the eccentricity.`,
              visual: fig({
                fn: `sqrt(398.6*(2/x - 1/${a / 1000}))`, x: [5, a / 500 + 2], y: [0, 11.5], domain: [6.378, a / 500 - 0.001], xlabel: 'distance from Earth’s centre r (thousand km)', ylabel: 'speed v (km/s)',
                at: a / 1000, f: (x) => v(1000 * x), df: (x) => 1000 * dv(1000 * x), span: a / 3000, xticks: 5, yticks: 4,
                label: 'v(r)', labelAt: 0.55 * a / 1000,
                alt: 'The vis-viva speed falling with distance from Earth, with a dashed tangent line at one point',
                caption: 'The vis-viva speed for this orbit’s semi-major axis, from Earth’s surface (6378 km) out. The dashed line is the tangent at r = a; its slope is dv/dr there. Only the stretch between the orbit’s perigee and apogee is actually flown.',
              }, 8, -8),
            };
          },
        }),
        num({
          id: 'r2-climb', skill: 'math1210.C1-5.4', difficulty: 3,
          gen(r) {
            const { m, h1, r1, r2, W } = climbCase(r);
            const k = (MU * m) / 1000;                    // μm in GJ·km
            const Fk = (x) => (MU * m) / 1e6 / (x * x);   // kN, x in thousand km
            return {
              prompt: t`Before the departure burn, the team budgets the energy to lift Shearwater, mass $${m}$ kg, from its parking orbit at $r_1 = ${thou(r1)}\ \text{km}$ (${h1} km up) to the apogee of its phasing orbit, $r_2 = ${thou(r2)}\ \text{km}$ from Earth's centre. Earth's gravity pulls with $F(r) = \dfrac{\mu m}{r^2}$, $\mu = 398\,600\ \text{km}^3/\text{s}^2$, so the work done against it is $$W = \int_{r_1}^{r_2} \frac{\mu m}{r^2}\,dr.$$ With $r$ in km, $\mu m/r^2$ is in kN and $W$ comes out in MJ. Find $W$ in GJ.`,
              answer: W, units: 'GJ', tol: { rel: 0.005 },
              integrand: `${N(k)}/x^2`, limits: [r1, r2],
              errors: apart([
                { value: (m * 9.81e-3 * (r2 - r1)) / 1000, feedback: t`That is $mg\,\Delta r$ with surface gravity, $9.81\ \text{m/s}^2$, all the way up. Gravity weakens as $1/r^2$: by $r_2$ it is a small fraction of its value at $r_1$. Integrate the changing force.` },
                { value: k / r1, feedback: t`That is $\mu m/r_1$, the integral all the way to infinity — the energy to escape. The climb stops at $r_2$: subtract $\mu m/r_2$.` },
                { value: k * Math.log(r2 / r1), feedback: t`$\ln r$ is the antiderivative of $1/r$, not of $1/r^2$. By the power rule, $\int r^{-2}\,dr = -r^{-1}$.` },
              ], W),
              hints: [
                t`By the power rule, an antiderivative of $\mu m\,r^{-2}$ is $-\mu m\,r^{-1} = -\dfrac{\mu m}{r}$.`,
                t`The Fundamental Theorem: $W = \left[-\dfrac{\mu m}{r}\right]_{r_1}^{r_2} = \mu m\left(\dfrac{1}{r_1} - \dfrac{1}{r_2}\right)$.`,
                t`$\mu m = 398\,600 \times ${m}$; with $r$ in km the result is in MJ. Divide by $1000$ for GJ.`,
              ],
              teach: 'The Fundamental Theorem turns the area under a force curve into a difference of one antiderivative at two points.',
              explain: t`$$W = \left[-\frac{\mu m}{r}\right]_{${thou(r1)}}^{${thou(r2)}} = 398\,600 \times ${m}\left(\frac{1}{${thou(r1)}} - \frac{1}{${thou(r2)}}\right)\ \text{MJ} = ${tex(W * 1000, 4)}\ \text{MJ} \approx ${tex(W, 3)}\ \text{GJ}.$$ Most of it is spent close to Earth: the climb from $r_1$ to $2r_1$ alone costs half the energy of escaping altogether. Surface gravity all the way would have given about $${tex((m * 9.81e-3 * (r2 - r1)) / 1000, 2)}$ GJ — wildly too much. This is the change in gravitational potential energy only. A coasting probe pays for the climb from its own kinetic energy; what the engine must supply is set by the speeds the orbits need, which is what vis-viva gives.`,
              visual: areaFig({
                fn: `${N((MU * m) / 1e6)}/x^2`, x: [0, (r2 / 1000) * 1.06], y: [0, Fk(r1 / 1000) * 1.18], from: r1 / 1000, to: r2 / 1000, domain: [r1 / 1000 - 0.4, (r2 / 1000) * 1.06], signed: false,
                xlabel: 'distance from Earth’s centre (thousand km)', ylabel: 'gravity’s pull (kN)', label: 'F(r)', labelAt: r1 / 1000 + 2,
                more: { vlines: [{ x: r1 / 1000, label: 'r₁', color: 'ink3' }, { x: r2 / 1000, label: 'r₂', color: 'ink3' }], alt: 'Gravity’s pull falling as one over r squared, with the area under it shaded between two radii' },
                caption: 'Gravity’s pull on the probe against distance from Earth’s centre. The shaded area is the work against it; the Moon’s and the Sun’s pulls are left out.',
              }),
            };
          },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'Cruise',
      story: t`On the long coast to Jupiter the clock team compares the maser with ground time over the radio link every day, and the astronomers point the X-ray telescope at a quasar: a giant black hole swallowing gas and firing jets of plasma at nearly the speed of light.`,
      items: [
        num({
          id: 'r3-clock', skill: 'math1210.C1-4.2', difficulty: 3,
          gen(r) {
            const { v, u, lag } = clockCase(r);
            return {
              prompt: t`On its way out, Shearwater coasts at $v = ${v}\ \text{km/s}$ relative to the Sun. Special relativity says its clock ticks slow: while a time $t$ passes in the solar system's frame, it counts only $\tau = t\sqrt{1 - v^2/c^2}$. On a ten-digit calculator, $1 - \sqrt{1 - v^2/c^2}$ keeps barely one significant figure, so use the linearization of $\sqrt{1 - u}$ at $u = 0$ instead. How many microseconds per day ($t = 86\,400\ \text{s}$) does Shearwater's clock lose from its speed alone? ($c = 299\,792\ \text{km/s}$)`,
              answer: lag, units: 'μs', tol: { rel: 0.01 },
              errors: apart([
                { value: DAY * u * 1e6, feedback: t`The tangent line of $\sqrt{1-u}$ at $u = 0$ is $1 - \tfrac12u$: its slope there is $-\tfrac12$, so the clock loses $\tfrac12 u\,t$, not $u\,t$.` },
                { value: DAY * (v / C_KMS) * 1e6, feedback: t`That linearizes in $v/c$. The variable that is small and appears to the first power is $u = v^2/c^2$: square the speed ratio.` },
                { value: DAY * (v / C_KMS) * 1e6 / 2, feedback: t`Halving was right, but $u = v^2/c^2$: square the speed ratio before halving it.` },
              ], lag),
              hints: [
                t`Linearize $f(u) = \sqrt{1-u}$ at $u = 0$: $f(0) = 1$ and $f'(u) = -\dfrac{1}{2\sqrt{1-u}}$, so $f'(0) = -\tfrac12$ and $\sqrt{1-u} \approx 1 - \tfrac12u$.`,
                t`The clock loses $t - \tau = t\left(1 - \sqrt{1-u}\right) \approx \tfrac12\,u\,t$, with $u = v^2/c^2$.`,
                t`$u = \left(\dfrac{${v}}{299\,792}\right)^2$. Multiply $\tfrac12u$ by $86\,400\ \text{s}$, then convert seconds to microseconds.`,
              ],
              teach: 'Near a point, a function is its tangent line: the linearization turns a difference too small to compute into a product you can.',
              explain: t`$u = (${v}/299\,792)^2 = ${tex(u, 4)}$, and $\sqrt{1-u} \approx 1 - \tfrac12u$, so the clock loses $$t - \tau \approx \tfrac12\,u\,t = \tfrac12\,(${tex(u, 4)})(86\,400\ \text{s}) = ${tex(lag * 1e-6, 3)}\ \text{s} \approx ${tex(lag, 3)}\ \mu\text{s per day}.$$ The tangent line's error is about $u^2/8$ — some $10^{-17}$ here, far below anything a maser can see. The Sun's gravity slows the clock too, by $GM_\odot/(rc^2)$ — the weak-field limit from the countdown — which is also near $10^{-8}$ in the inner solar system: the two effects are the same size, and the experiment must separate them.`,
              visual: fig({
                fn: 'sqrt(1 - x)', x: [-0.08, 0.95], y: [0.15, 1.15], domain: [-0.08, 1], xlabel: 'u', ylabel: '', axesAt: 'edge',
                at: 0, f: (x) => Math.sqrt(1 - x), df: (x) => -0.5 / Math.sqrt(1 - x), span: 0.75, xticks: 5, yticks: 4,
                label: '√(1 − u)', labelAt: 0.7,
                alt: 'The curve square root of one minus u with its dashed tangent line at u equals zero',
                caption: '√(1 − u) and its tangent line at u = 0 (dashed), drawn far out so they can be told apart. For Shearwater u = v²/c² is about 10⁻⁸, where the two coincide to sixteen decimal places.',
              }, -30, 18),
            };
          },
        }),
        num({
          id: 'r3-horizon', skill: 'math1210.C1-4.1', difficulty: 3,
          gen(r) {
            const { M, Md, rs, drs, dA } = horizonCase(r);
            return {
              prompt: t`Shearwater's X-ray telescope watches a quasar: a black hole of $${tex(M, 2)}$ solar masses swallowing gas at about ${Md} solar ${Md === 1 ? 'mass' : 'masses'} per year. Its event horizon is a sphere of radius $r_s = 2GM/c^2$ — $2.953\ \text{km}$ for every solar mass — and area $A = 4\pi r_s^2$. How fast is the horizon's area growing, in $\text{km}^2$ per year?`,
              answer: dA, units: 'km^2/yr', tol: { rel: 0.01 },
              errors: apart([
                { value: 4 * PI * rs * drs, feedback: t`Differentiating $r_s^2$ gives $2r_s\,\dfrac{dr_s}{dt}$: $\dfrac{dA}{dt} = 8\pi r_s\,\dfrac{dr_s}{dt}$, not $4\pi r_s\,\dfrac{dr_s}{dt}$.` },
                { value: 8 * PI * rs * Md, feedback: t`$dM/dt$ is in solar masses per year; the horizon grows by $2.953\ \text{km}$ for each solar mass, so $\dfrac{dr_s}{dt} = 2.953\ \text{km} \times ${Md}$ per year.` },
                { value: 4 * PI * drs * drs, feedback: t`That squares the rate. Differentiate $A = 4\pi r_s^2$ in time with the chain rule: $\dfrac{dA}{dt} = 4\pi \cdot 2r_s\,\dfrac{dr_s}{dt}$.` },
              ], dA),
              hints: [
                t`Relate, then differentiate in time: $A = 4\pi r_s^2$ gives $\dfrac{dA}{dt} = 8\pi r_s\,\dfrac{dr_s}{dt}$.`,
                t`$r_s = 2.953\ \text{km} \times M$ (with $M$ in solar masses), so $\dfrac{dr_s}{dt} = 2.953\ \text{km} \times \dfrac{dM}{dt}$.`,
                t`Now $r_s = 2.953 \times ${tex(M, 2)}\ \text{km}$ and $\dfrac{dr_s}{dt} = 2.953 \times ${Md}\ \text{km/yr}$; multiply by $8\pi$.`,
              ],
              teach: 'Related rates: write the relation between the quantities, differentiate it with respect to time, and only then put in the numbers.',
              explain: t`Now $r_s = 2.953 \times ${tex(M, 2)} = ${tex(rs, 4)}\ \text{km}$ — ${tex(rs / 1.496e8, 2)} times the Earth–Sun distance — and $\dfrac{dr_s}{dt} = 2.953 \times ${Md} = ${tex(drs, 4)}\ \text{km/yr}$. So $$\frac{dA}{dt} = 8\pi r_s\,\frac{dr_s}{dt} = 8\pi\,(${tex(rs, 4)})(${tex(drs, 4)}) = ${tex(dA, 3)}\ \text{km}^2/\text{yr}.$$ The radius creeps out by a few kilometres a year, but it multiplies a radius of billions of kilometres. Hawking's area theorem says that in classical general relativity a horizon's area never decreases; data from LIGO's first detected black-hole merger agree with it. (Quantum effects let a black hole shrink by Hawking radiation, unimaginably slowly for one this size.)`,
              visual: {
                type: 'graph',
                params: {
                  x: [-6.4, 6.4], y: [-2.6, 2.6], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
                  shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'void', alpha: 1 }],
                  curves: [
                    circle(0, 0, 1, 'ink2', 1.8),
                    ...[[4.6, 0.7, 2.2, false], [2.4, 0.38, 1.6, true]].flatMap(([A, b, w, dash]) => {
                      const c = r4(Math.acos(1.12 / A)), e = (t0, t1) => ({ param: [`${A}*cos(t)`, `${b}*sin(t)`], t: [t0, t1], color: 'warn', width: w, ...(dash ? { dash: true } : {}) });
                      return [e(PI, 2 * PI), e(0, c), e(r4(PI - c), PI)];   // the near half in front of the hole, the far half only where it shows
                    }),
                  ],
                  arrows: [
                    { from: [0, 0], to: [0.71, 0.71], color: 'gold', width: 2, label: 'rₛ', labelDx: 6, labelDy: -6 },
                    { from: [5.6, 2.2], to: [1.5, 0.8], color: 'accent', width: 2 },
                  ],
                  points: [tag(5.6, 2.2, 'infalling gas', 'accent', 0, -10, 'center'), tag(0, -1.25, 'horizon', 'ink2', 0, 8, 'center'), tag(-4.6, -0.7, 'glowing disc', 'warn', 0, 16, 'center')],
                  alt: 'A black disc for the horizon, ringed by an accretion disc, with gas spiralling in',
                },
                caption: 'Schematic and far from scale: a quasar’s glowing disc reaches out hundreds to thousands of Schwarzschild radii, and the horizon itself gives off no light.',
              },
            };
          },
        }),
        expr({
          id: 'r3-jet', skill: 'math1210.C1-3.4', difficulty: 3,
          gen(r) {
            const { E0, dir } = jetCase(r);
            const to = dir === 'toward';
            const P = to ? '1 + beta' : '1 - beta', Q = to ? '1 - beta' : '1 + beta';
            const PT = to ? '1+\\beta' : '1-\\beta', QT = to ? '1-\\beta' : '1+\\beta';
            const D = `sqrt((${P})/(${Q}))`;
            return {
              prompt: t`The quasar fires a jet. A blob of plasma in it moves at speed $v = \beta c$ straight ${to ? 'toward' : 'away from'} Shearwater${to ? '' : t` — it is in the fainter counter-jet`}. A photon the blob emits with energy $${E0}$ keV, in its own frame, arrives with energy $$E(\beta) = ${E0}\sqrt{\frac{${PT}}{${QT}}}\ \text{keV}$$ (the relativistic Doppler shift). Find $\dfrac{dE}{d\beta}$, in keV per unit of $\beta$.`,
              answer: to ? `${E0}/((1 - beta)*sqrt(1 - beta^2))` : `-${E0}/((1 + beta)*sqrt(1 - beta^2))`,
              answerTeX: to ? t`\dfrac{${E0}}{(1-\beta)\sqrt{1-\beta^2}}` : t`-\dfrac{${E0}}{(1+\beta)\sqrt{1-\beta^2}}`,
              lhs: t`\dfrac{dE}{d\beta}`,
              vars: { beta: [0.05, 0.9] }, keys: [['β', 'beta']],
              derivativeOf: `${E0}*${D}`,
              errors: [
                { answer: `${E0}/(2*${D})`, feedback: t`That differentiates the square root but not what is inside it. The chain rule multiplies by $\dfrac{d}{d\beta}\dfrac{${PT}}{${QT}}$, which needs the quotient rule.` },
                { answer: to ? `-${E0}*beta/((1 - beta)^2*${D})` : `${E0}*beta/((1 + beta)^2*${D})`,
                  feedback: t`In the quotient rule, the derivative of $1 - \beta$ is $-1$, not $+1$. With the sign right, the numerator is $${to ? '(1)(1-\\beta) - (1+\\beta)(-1) = 2' : '(-1)(1+\\beta) - (1-\\beta)(1) = -2'}$: no $\beta$ survives.` },
                { answer: to ? `-${E0}/((1 - beta)*sqrt(1 - beta^2))` : `${E0}/((1 + beta)*sqrt(1 - beta^2))`, feedback: t`The sign is reversed — the quotient rule's numerator is (bottom)(top)′ − (top)(bottom)′, in that order. ${to ? 'A blob coming faster toward you looks bluer, so $E$ rises with $\\beta$.' : 'A blob receding faster looks redder, so $E$ falls as $\\beta$ grows.'}` },
                { answer: to ? `2*${E0}/((1 - beta)*sqrt(1 - beta^2))` : `-2*${E0}/((1 + beta)*sqrt(1 - beta^2))`, feedback: t`The square root's derivative carries a $\tfrac12$: $\dfrac{d}{d\beta}\sqrt{g} = \dfrac{g'}{2\sqrt g}$.` },
              ],
              hints: [
                t`Chain rule: with $g(\beta) = \dfrac{${PT}}{${QT}}$, $\dfrac{dE}{d\beta} = ${E0}\cdot\dfrac{g'(\beta)}{2\sqrt{g(\beta)}}$.`,
                t`Quotient rule: $g' = \dfrac{${to ? '(1)(1-\\beta) - (1+\\beta)(-1)' : '(-1)(1+\\beta) - (1-\\beta)(1)'}}{(${QT})^2} = ${to ? '\\dfrac{2}{(1-\\beta)^2}' : '-\\dfrac{2}{(1+\\beta)^2}'}$.`,
                t`Simplify with $\sqrt{\dfrac{${QT}}{${PT}}}\cdot\dfrac{1}{(${QT})^2} = \dfrac{1}{(${QT})\sqrt{(1-\beta)(1+\beta)}}$ and $(1-\beta)(1+\beta) = 1 - \beta^2$.`,
              ],
              teach: 'A square root of a quotient takes two rules in turn: the chain rule for the root, the quotient rule for what is inside.',
              explain: t`With $g = \dfrac{${PT}}{${QT}}$, $g' = ${to ? '\\dfrac{2}{(1-\\beta)^2}' : '-\\dfrac{2}{(1+\\beta)^2}'}$, so $$\frac{dE}{d\beta} = ${E0}\cdot\frac{g'}{2\sqrt g} = ${to ? '' : '-'}${E0}\cdot\frac{1}{(${QT})^2}\sqrt{\frac{${QT}}{${PT}}} = ${to ? t`\frac{${E0}}{(1-\beta)\sqrt{1-\beta^2}}` : t`-\frac{${E0}}{(1+\beta)\sqrt{1-\beta^2}}`}\ \text{keV}.$$ Sense check: at $\beta = 0$ it is $${to ? '' : '-'}${E0}\ \text{keV}$, the everyday Doppler shift $\Delta E/E \approx ${to ? '' : '-'}\beta$. ${to ? 'Toward $\\beta = 1$ it blows up: the shift grows without bound, and jets aimed at us (blazars) look far brighter and bluer than the same jet seen side-on.' : 'As $\\beta \\to 1$ the slope plunges without bound too, and the energy drops toward zero: the counter-jet fades from view, which is why so many jets look one-sided.'}`,
              visual: fig({
                fn: `${E0}*sqrt((1 + x)/(1 - x))`, x: [0, 1], y: [0, E0 * 4.8], domain: [0, 0.9], xlabel: 'speed β = v/c', ylabel: 'observed energy (keV)', color: to ? 'accent' : 'ink3',
                label: 'blob moving toward us', labelAt: 0.62,
                curves: [{ fn: `${E0}*sqrt((1 - x)/(1 + x))`, domain: [0, 0.9], color: to ? 'ink3' : 'accent', width: 2, label: 'moving away', labelAt: 0.62, labelDx: 4, labelDy: -12 }],
                xticks: 5, yticks: 4,
                alt: 'Two curves of observed photon energy against speed: one rising steeply for a blob approaching, one falling for a blob receding',
                caption: `Observed energy of a ${E0} keV photon against the blob’s speed, for straight-on motion only (a real jet is tilted to the line of sight, which changes the factor). The curve in blue is the one asked about.`,
              }, -150, -6),
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'Jupiter',
      story: t`Two years out, Jupiter fills the camera. Shearwater threads past a small outer moon, then swings around the planet on a hyperbola that bends its path back toward the inner solar system — and, years later, home.`,
      items: [
        num({
          id: 'r4-approach', skill: 'math1210.C1-4.1', difficulty: 3,
          gen(r) {
            const { k, v, D, rate } = approachCase(r);
            const small = ((2 * RJ * v) / (D * D)) * 3600 * (180 / PI);
            const xt = -1 / k, yt = Math.sqrt(1 - 1 / (k * k));       // tangent point (units of R), probe at (−k, 0)
            const ext = 1.25, slope = yt / (xt + k);
            return {
              prompt: t`Shearwater closes on Jupiter at $${v}$ km/s. Treat its path as a straight line toward the planet's centre. Its navigation camera sees Jupiter's disc span the angle $$\theta = 2\arcsin\frac{R}{D},$$ where $R = 71\,492\ \text{km}$ is Jupiter's equatorial radius and $D$ the distance to its centre. How fast is $\theta$ growing at the moment $D = ${k}R$? Give degrees per hour.`,
              answer: rate, units: 'deg/h', tol: { rel: 0.01 },
              errors: apart([
                { value: small, feedback: t`That uses the small-angle form $\theta \approx 2R/D$. At $D = ${k}R$ the disc is ${tex((2 * Math.asin(1 / k) * 180) / PI, 3)}° across — not small — and the exact derivative carries the factor $1/\sqrt{1 - R^2/D^2}$.` },
                { value: rate / 3600, feedback: t`That is degrees per **second**. Multiply by $3600$ for degrees per hour.` },
                { value: rate / 2, feedback: t`$\theta$ is the whole angle, $2\arcsin(R/D)$ — keep the factor $2$.` },
              ], rate),
              hints: [
                t`Differentiate $\theta = 2\arcsin(R/D)$ with respect to time: $R$ is constant, $D$ is shrinking at $\dfrac{dD}{dt} = -${v}\ \text{km/s}$.`,
                t`$\dfrac{d}{dt}\arcsin w = \dfrac{1}{\sqrt{1 - w^2}}\,\dfrac{dw}{dt}$, and for $w = R/D$, $\dfrac{dw}{dt} = -\dfrac{R}{D^2}\,\dfrac{dD}{dt}$.`,
                t`So $\dfrac{d\theta}{dt} = \dfrac{2Rv}{D\sqrt{D^2 - R^2}}$ in rad/s. Multiply by $3600$ and by $180/\pi$.`,
              ],
              teach: 'Related rates through an inverse trigonometric function: differentiate the relation with the chain rule, then substitute the moment’s numbers.',
              explain: t`$$\frac{d\theta}{dt} = 2\cdot\frac{1}{\sqrt{1 - R^2/D^2}}\cdot\frac{R}{D^2}\,v = \frac{2Rv}{D\sqrt{D^2 - R^2}} = \frac{2v}{R\cdot ${k}\sqrt{${nice(k * k)} - 1}} = ${tex((rate / 3600) * (PI / 180), 3)}\ \text{rad/s},$$ which is $${tex(rate, 3)}$° per hour. The disc is then ${tex((2 * Math.asin(1 / k) * 180) / PI, 3)}° across and swelling visibly from one image to the next. The small-angle shortcut would give $${tex(small, 3)}$°/h — close enough far out, but not this near. (A real flyby aims off-centre so as to miss the planet, which changes the rate; the straight-in path is the simplest case.)`,
              visual: {
                type: 'graph',
                params: {
                  x: [-k - 0.9, 1.7], y: [-1.55, 1.55], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
                  shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'gold', alpha: 0.25 }],
                  curves: [
                    circle(0, 0, 1, 'gold', 2),
                    seg(-k, 0, -k + ext * (xt + k), ext * yt, 'accent', 1.6),
                    seg(-k, 0, -k + ext * (xt + k), -ext * yt, 'accent', 1.6),
                    { param: [`${r4(-k)} + 0.55*cos(t)`, '0.55*sin(t)'], t: [-r4(Math.atan(slope)), r4(Math.atan(slope))], color: 'violet', width: 1.8 },
                    seg(-k, 0, 0, 0, 'ink4', 1, true),
                  ],
                  arrows: [
                    { from: [0, 0], to: [0, 1], color: 'ink2', width: 1.6, label: 'R', labelDx: 6, labelDy: 14 },
                    { from: [-k, -1.25], to: [0, -1.25], color: 'ink3', width: 1.4 },
                    { from: [-k, 0.3], to: [-k + 0.5, 0.3], color: 'warn', width: 2, label: 'v', labelDx: 4, labelDy: -6 },
                  ],
                  points: [{ x: -k, y: 0, r: 5, color: 'warn' }, tag(-k, 0, 'Shearwater', 'warn', -8, -12, 'right'), tag(-k + 0.62, 0, 'θ', 'violet', 4, 4, 'left'), tag(1, -0.55, 'Jupiter', 'gold', 10, 8, 'left'), tag(-k / 2, -1.25, 'D', 'ink3', 0, 16, 'center')],
                  alt: 'The probe on the left looking at Jupiter, with two sight lines touching the planet’s edges and the angle between them marked',
                },
                caption: 'Sight lines from the probe graze Jupiter’s limb; θ is the angle between them. To scale in distance; the planet is drawn as a sphere (it is really flattened by 6.5%).',
              },
            };
          },
        }),
        num({
          id: 'r4-moon', skill: 'math1210.C1-4.3', difficulty: 3,
          gen(r) {
            const C = cpaCase(r);
            const { x0, y0, vx, vy, ts, Dmin, T, inside, ans, dist } = C;
            const tAbeam = -x0 / vx, abeam = Math.abs(y0 + vy * tAbeam);
            const errs = [];
            if (!inside) errs.push({ value: Dmin, feedback: t`That is the least distance along the whole line, reached at $t^* = ${tex(ts, 4)}\ \text{s}$ — after the window closes at $${thou(T)}$ s. On a closed interval, check the endpoints too: here the distance is still falling when the window ends.` });
            errs.push({ value: abeam, feedback: t`That is the distance when Shearwater crosses $x = 0$, directly "abeam" of the moon. The path is tilted, so the closest point comes at a different time: minimize the distance itself.` });
            errs.push({ value: ans * ans, feedback: t`That is the least value of $s = x^2 + y^2$, the distance **squared**, in $\text{km}^2$. Take its square root.` });
            const ysg = (n) => `${n < 0 ? '-' : '+'} ${Math.abs(n) === 1 ? '' : Math.abs(n)}`;
            const km = (x) => thou(Math.round(x));
            const sc = 1000, X = (tt) => (x0 + vx * tt) / sc, Y = (tt) => (y0 + vy * tt) / sc;
            const tEnd = Math.max(T, ts) * 1.25;
            const xs = [X(0), X(tEnd), 0], ys = [Y(0), Y(tEnd), 0];
            const xr = [Math.min(...xs) - 4, Math.max(...xs) + 4], yr = [Math.min(...ys) - 3, Math.max(...ys) + 3];
            return {
              prompt: t`Inbound to Jupiter, Shearwater passes Himalia, a small outer moon about 150 km across. In a frame moving with Himalia (which sits at the origin), Shearwater's position over a short stretch is $$x(t) = ${thou(x0)} + ${vx}t,\qquad y(t) = ${thou(y0)} ${ysg(vy)}t$$ in km, with $t$ in seconds. Its camera can image the moon only during the window $0 \le t \le ${thou(T)}\ \text{s}$. What is the **least** distance between Shearwater and Himalia during the window, in km?`,
              answer: ans, units: 'km', tol: { rel: 0.005 },
              errors: apart(errs, ans),
              hints: [
                t`Minimize the squared distance $s(t) = x(t)^2 + y(t)^2$: it is least where the distance is, and has no square root to differentiate.`,
                t`$s'(t) = 2x\,x' + 2y\,y'$, with $x' = ${vx}$ and $y' = ${vy}\ \text{km/s}$. Setting it to zero gives one critical time $t^*$. Is it inside the window?`,
                t`On a closed interval, the minimum is at a critical point inside it or at an endpoint: compare the distance there with the distances at $t = 0$ and $t = ${thou(T)}\ \text{s}$.`,
              ],
              teach: 'An extreme value on a closed interval lives at a critical point inside it or at an endpoint — check them all.',
              explain: t`$s(t) = (${thou(x0)} + ${vx}t)^2 + (${thou(y0)} ${ysg(vy)}t)^2$ has $s'(t) = 0$ at $$t^* = -\frac{(${thou(x0)})(${vx}) + (${thou(y0)})(${vy})}{${vx}^2 + ${vy * vy}} = ${tex(ts, 4)}\ \text{s}.$$ ${inside
                ? t`That is inside the window, so the least distance is $\sqrt{s(t^*)} = ${km(ans)}\ \text{km}$; the ends of the window give $${km(dist(0))}$ km and $${km(dist(T))}$ km, both larger.`
                : t`That is **after** the window closes at $${thou(T)}$ s. On $[0, ${thou(T)}]$ the distance only falls, so its least value is at the endpoint: $\sqrt{s(${thou(T)})} = ${km(ans)}\ \text{km}$. (The closest approach of all, $${km(Dmin)}$ km, comes too late to image.)`} Himalia's own gravity barely bends the path, and Jupiter pulls on the moon and the probe almost equally over this short stretch, which is why the relative path is so nearly straight.`,
              visual: {
                type: 'graph',
                params: {
                  x: xr.map(r4), y: yr.map(r4), aspect: 'wide', equal: true, xlabel: 'x (thousand km)', ylabel: 'y (thousand km)', xticks: 5, yticks: 4,
                  curves: [
                    seg(X(0), Y(0), X(T), Y(T), 'accent', 2.6),
                    seg(X(T), Y(T), X(tEnd), Y(tEnd), 'ink3', 1.4, true),
                  ],
                  arrows: [{ from: [r4(X(0.3 * T)), r4(Y(0.3 * T))], to: [r4(X(0.45 * T)), r4(Y(0.45 * T))], color: 'accent', width: 2.4 }],
                  points: [
                    { x: 0, y: 0, r: 6, color: 'gold', label: 'Himalia', labelDx: 8, labelDy: y0 > 0 ? 16 : -10 },
                    { x: r4(X(0)), y: r4(Y(0)), r: 4, color: 'accent', label: 't = 0', labelDx: -8, labelDy: 4, labelAlign: 'right' },
                    { x: r4(X(T)), y: r4(Y(T)), r: 4, color: 'accent', label: 'window ends', labelDx: 8, labelDy: vy > 0 ? 18 : -10 },
                  ],
                  alt: 'A straight path passing near a small moon at the origin, solid during the imaging window and dashed after it',
                },
                caption: 'Shearwater’s path relative to Himalia, to scale (the moon’s dot is far larger than the moon). Solid: the imaging window; dashed: the path after it.',
              },
            };
          },
        }),
        num({
          id: 'r4-flyby', skill: 'math1210.C1-4.8', difficulty: 3,
          gen(r) {
            const { e, M, root, F0, F1, g, dg } = flybyCase(r);
            const F2 = F1 - g(F1) / dg(F1);
            const xr = [0, Math.max(F0, root) + 0.9];
            return {
              prompt: t`Relative to Jupiter, Shearwater's flyby path is a hyperbola of eccentricity $e = ${e}$. Its position at a given time comes from the hyperbolic anomaly $F$, which solves Kepler's equation for hyperbolas, $$e\sinh F - F = M,$$ where $M$ grows steadily with time and $\sinh F = \tfrac12\left(e^F - e^{-F}\right)$, whose derivative is $\cosh F = \tfrac12\left(e^F + e^{-F}\right)$ (here $e^F$ is the exponential, not the eccentricity). For the moment when $M = ${M}$, take **one** step of Newton's method from $F_0 = ${F0}$. Give $F_1$ to 4 significant figures.`,
              answer: F1, tol: { rel: 4e-4, abs: 0 },
              errors: apart([
                { value: F0 + g(F0) / dg(F0), feedback: t`Newton's step **subtracts**: $F_1 = F_0 - g(F_0)/g'(F_0)$. Adding moves away from the root.` },
                { value: F0 - g(F0) / (e * Math.cosh(F0)), feedback: t`The derivative of $g(F) = e\sinh F - F - M$ is $e\cosh F - 1$: the $-F$ term contributes $-1$.` },
                { value: F0 - g(F0) / (e * Math.sinh(F0) - 1), feedback: t`$\dfrac{d}{dF}\sinh F = \cosh F$, not $\sinh F$: use $g'(F) = e\cosh F - 1$.` },
              ], F1, 0.002),
              hints: [
                t`Set $g(F) = e\sinh F - F - M$; the root of $g$ is the $F$ you want. Newton's method: $F_1 = F_0 - \dfrac{g(F_0)}{g'(F_0)}$.`,
                t`$g'(F) = e\cosh F - 1$.`,
                t`$g(${F0}) = ${e}\sinh(${F0}) - ${F0} - ${M}$ and $g'(${F0}) = ${e}\cosh(${F0}) - 1$; divide, then subtract from $F_0$.`,
              ],
              teach: 'Newton’s method replaces the curve by its tangent line and steps to where that line crosses zero.',
              explain: t`$g(${F0}) = ${e}\sinh(${F0}) - ${F0} - ${M} = ${tex(g(F0), 4)}$ and $g'(${F0}) = ${e}\cosh(${F0}) - 1 = ${tex(dg(F0), 4)}$, so $$F_1 = ${F0} - \frac{${tex(g(F0), 4)}}{${tex(dg(F0), 4)}} = ${tex(F1, 4)}.$$ A second step gives $${tex(F2, 6)}$, and the root is $F = ${tex(root, 6)}$: the number of correct digits roughly doubles every step. The navigation software iterates until the change is below $10^{-12}$ — usually in four or five steps.`,
              visual: fig({
                fn: `${e}*sinh(x) - x - ${M}`, x: xr, y: [-M - 0.6, Math.max(g(xr[1]), 1) + 0.4], xlabel: 'F', ylabel: 'g(F)', xticks: 5, yticks: 4,
                at: F0, f: g, df: dg, span: 0.8, tangentLabel: 'F₀',
                label: 'g(F) = e sinh F − F − M', labelAt: 0.25,
                alt: 'A rising curve crossing the axis, with a dashed tangent line at the starting guess',
                caption: 'g(F) and its tangent line at the starting guess F₀ (dashed). Newton’s step follows the tangent to where it crosses the axis.',
              }, 6, -26, -10, -10),
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'Homecoming',
      story: t`Years later, Shearwater swings back past Earth and releases its return capsule, with the maser clock and the dust it gathered at Jupiter packed inside. On the ground the clock will be laid beside its twin, and every microsecond between them will be accounted for.`,
      items: [
        num({
          id: 'r5-canister', skill: 'math1210.C1-4.6', difficulty: 3,
          gen(r) {
            const { R, H, V } = canisterCase(r);
            const rc = 0.38 * R, hc = H * (1 - 0.38);
            return {
              prompt: t`Inside the capsule's back shell, the space for the payload is (to a fair approximation) a cone: base radius $R = ${R}\ \text{cm}$ on the heat shield, height $H = ${H}\ \text{cm}$ to its tip. A cylindrical canister for the clock and the dust stands on the base, on the cone's axis, and must fit entirely inside the cone. What is the largest volume the canister can have, in litres?`,
              answer: V, units: 'L', tol: { rel: 0.005 },
              errors: apart([
                { value: (PI * R * R * H) / 3 / 1000, feedback: t`That is the volume of the whole cone, $\tfrac13\pi R^2H$. A cylinder cannot fill it: its top corner must stay under the cone's slanted side.` },
                { value: (PI * R * R * H) / 8 / 1000, feedback: t`That takes $r = R/2$ (and so $h = H/2$) without optimizing. Set $V'(r) = 0$: the best radius is two thirds of $R$.` },
                { value: (4 * PI * H ** 3) / 27 / 1000, feedback: t`That takes $h = H - r$, as if the cone's side fell one centimetre per centimetre out. By similar triangles it falls $H/R$ per centimetre: $h = H(1 - r/R)$.` },
              ], V),
              hints: [
                t`Similar triangles: a canister of radius $r$ fits under the slanted side only up to the height $h = H\left(1 - \dfrac{r}{R}\right)$.`,
                t`Maximize $V(r) = \pi r^2 H\left(1 - \dfrac{r}{R}\right) = \pi H\left(r^2 - \dfrac{r^3}{R}\right)$ on $0 \le r \le R$.`,
                t`$V'(r) = \pi H\left(2r - \dfrac{3r^2}{R}\right) = 0$ at $r = \tfrac23R$. Then $h = H/3$, and $1\ \text{L} = 1000\ \text{cm}^3$.`,
              ],
              teach: 'Optimization: write the quantity in one variable using the constraint, then find where its derivative is zero and check the ends.',
              explain: t`With $h = H(1 - r/R)$, $V(r) = \pi H(r^2 - r^3/R)$ and $V'(r) = \pi H(2r - 3r^2/R) = 0$ at $r = \tfrac23R = ${tex((2 * R) / 3, 3)}\ \text{cm}$, where $h = \tfrac13H = ${tex(H / 3, 3)}\ \text{cm}$. Both ends, $r = 0$ and $r = R$, give zero volume, so this is the maximum: $$V_{\max} = \pi\left(\tfrac23R\right)^2\tfrac13H = \frac{4}{27}\pi R^2H = ${tex(V * 1000, 4)}\ \text{cm}^3 = ${tex(V, 3)}\ \text{L}.$$ That is $\tfrac49$ of the cone's volume. Real capsules pack their payload around a centre-of-mass requirement too — the capsule must fly nose-first through the atmosphere — so a designer trades some of this volume for stability.`,
              visual: {
                type: 'graph',
                params: {
                  x: [r4(-R * 1.45), r4(R * 1.45)], y: [r4(-H * 0.2), r4(H * 1.15)], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
                  shade: [{ fn: `${H}*(1 - abs(x)/${R})`, from: -R, to: R, color: 'ink3', alpha: 0.12 }, { fn: String(r4(hc)), from: r4(-rc), to: r4(rc), color: 'accent', alpha: 0.22 }],
                  curves: [
                    seg(-R, 0, 0, H, 'ink2', 2), seg(0, H, R, 0, 'ink2', 2), seg(-R * 1.1, 0, R * 1.1, 0, 'warn', 3),
                    seg(-rc, 0, -rc, hc, 'accent', 2, true), seg(-rc, hc, rc, hc, 'accent', 2, true), seg(rc, hc, rc, 0, 'accent', 2, true),
                    seg(0, 0, 0, H, 'ink4', 1, true),
                  ],
                  arrows: [
                    { from: [0, r4(hc * 0.5)], to: [r4(rc), r4(hc * 0.5)], color: 'accent', width: 1.6, label: 'r', labelDx: -24, labelDy: -6 },
                    { from: [r4(R * 1.25), 0], to: [r4(R * 1.25), H], color: 'ink3', width: 1.4, label: 'H', labelDx: 6, labelDy: 18 },
                    { from: [0, r4(-H * 0.12)], to: [R, r4(-H * 0.12)], color: 'ink3', width: 1.4, label: 'R', labelDx: -30, labelDy: 14 },
                  ],
                  points: [tag(-rc, hc * 0.45, 'h', 'accent', -14, 0, 'right'), tag(-R * 1.1, 0, 'heat shield', 'warn', 0, 16, 'left')],
                  alt: 'A cross-section of a cone standing on the heat shield, with a dashed rectangle inside it for one possible canister',
                },
                caption: 'Cross-section through the capsule’s axis. The dashed canister is one candidate, not the best one. Real back shells are blunter, truncated cones; the cone is a teaching shape.',
              },
            };
          },
        }),
        num({
          id: 'r5-heat', skill: 'math1210.C1-5.5', difficulty: 3,
          gen(r) {
            const { qpk, tau, T, U, Q } = heatCase(r);
            const t2 = tau * tau;
            const qfn = `${qpk}*(x/${tau})*exp((1 - x^2/${t2})/2)`;
            return {
              prompt: t`The capsule hits the atmosphere at about 12 km/s. The heat flowing into the nose of its heat shield is modelled as $$q(t) = ${qpk}\cdot\frac{t}{${tau}}\,e^{\left(1 - t^2/${t2}\right)/2}\ \text{W/cm}^2,$$ which rises from zero to a peak of $${qpk}$ W/cm² at $t = ${tau}\ \text{s}$ and then dies away. How much heat, in kJ/cm², does each square centimetre of the nose take in during the first $${T}\ \text{s}$? That is $$Q = \int_0^{${T}} q(t)\,dt.$$`,
              answer: Q, units: 'kJ/cm^2', tol: { rel: 0.005 },
              integrand: `${N(qpk / 1000)}*(x/${tau})*exp((1 - x^2/${t2})/2)`, limits: [0, T],
              errors: apart([
                { value: (qpk * T) / 1000, feedback: t`That is the peak flux times the whole time, as if the peak lasted throughout. The flux starts at zero and dies away: integrate it.` },
                { value: (qpk * tau * Math.sqrt(Math.E) * Math.exp(-U)) / 1000, feedback: t`After substituting, the antiderivative is $-e^{-u}$; it must be evaluated at **both** limits: $\left[-e^{-u}\right]_0^{U} = 1 - e^{-U}$.` },
                { value: (qpk * Math.sqrt(Math.E) * (1 - Math.exp(-U))) / tau / 1000, feedback: t`The substitution's $du = t\,dt/${t2}$ means $t\,dt = ${t2}\,du$: the factor $${t2}$ must come out in front.` },
              ], Q),
              hints: [
                t`The factor $t$ is, up to a constant, the derivative of the exponent: substitute $u = \dfrac{t^2}{2\cdot ${t2}}$, so $du = \dfrac{t\,dt}{${t2}}$.`,
                t`Then $q\,dt = \dfrac{${qpk}\sqrt e}{${tau}}\,e^{-u}\,t\,dt = ${qpk}\cdot${tau}\,\sqrt e\;e^{-u}\,du$, and the limits become $u = 0$ and $u = ${nice(U)}$.`,
                t`$\displaystyle\int_0^{U} e^{-u}\,du = 1 - e^{-U}$. The result is in J/cm²; divide by $1000$ for kJ/cm².`,
              ],
              teach: 'When a factor in the integrand is the derivative of an inner function, substitute u for the inner function — and change the limits with it.',
              explain: t`With $u = t^2/(2\cdot ${t2})$ and $t\,dt = ${t2}\,du$, $$Q = ${qpk}\cdot${tau}\sqrt e\int_0^{${nice(U)}} e^{-u}\,du = ${qpk}\cdot${tau}\sqrt e\left(1 - e^{-${nice(U)}}\right) = ${thou(Math.round(Q * 1000))}\ \text{J/cm}^2 \approx ${tex(Q, 3)}\ \text{kJ/cm}^2.$$ The whole pulse would deliver $${qpk}\cdot${tau}\sqrt e \approx ${tex((qpk * tau * Math.sqrt(Math.E)) / 1000, 3)}\ \text{kJ/cm}^2$; the first ${T} s hold ${tex(100 * (1 - Math.exp(-U)), 3)}% of it. A smooth pulse like this is a teaching model: real heating comes from the flight path and from aerothermal codes, and at these speeds part of it is radiated by the hot gas in front of the shield.`,
              visual: areaFig({
                fn: qfn, x: [0, 3.2 * tau], y: [0, qpk * 1.2], from: 0, to: T, signed: false, xlabel: 'time (s)', ylabel: 'heat flux (W/cm²)',
                more: { points: [{ x: tau, y: qpk, r: 4, color: 'warn', label: `peak, ${qpk} W/cm²`, labelDx: 8, labelDy: -8 }], vlines: [{ x: T, label: `t = ${T} s`, color: 'ink3' }], xticks: 5, yticks: 4,
                  alt: 'A heating pulse rising to a peak and dying away, with the area under it shaded up to a chosen time' },
                caption: 'The modelled heat flux into the nose; the shaded area is the heat taken in per square centimetre over the time asked about.',
              }),
            };
          },
        }),
      ],
    },
  ],
});
