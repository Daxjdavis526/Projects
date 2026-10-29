// The Fresnel equations and total internal reflection (Hecht §4.6–4.7). The
// amplitudes of the reflected and transmitted waves from the boundary
// conditions (tangential E and H continuous), in Hecht's sign convention;
// R = |r|², T = (n_t cos θ_t/n_i cos θ_i)|t|², R + T = 1; 4 % at normal
// incidence on glass and what it costs an uncoated star tracker; Brewster's
// angle, where r_p = 0 and the reflection is pure s; the phase flip of r_s on
// external but not internal reflection; total internal reflection beyond
// θ_c, with |r| = 1 and an evanescent field of penetration depth
// δ = λ₀/2π√(n_i²sin²θ − n_t²), which tunnels across a narrow gap (frustrated
// TIR). Uses the op-fresnel simulation. Transfers: the reflectance of an
// aluminized sail from aluminium's complex index (Rakić 1995); how far a
// fibre's light reaches into its cladding.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import * as F from '../../src/viz/model/op-fresnel.js';
import { DEG, sf, nOf, MATS } from './_op.js';

const t = String.raw;

// the worked example: an uncoated star tracker, 8 air–BK7 surfaces at 589 nm
const EX = { n: nOf('bk7', 589.3), N: 8, nc: 1.38 };
EX.r = (1 - EX.n) / (1 + EX.n);
EX.R = EX.r ** 2;
EX.T8 = (1 - EX.R) ** EX.N;
EX.Rc = ((EX.n - EX.nc ** 2) / (EX.n + EX.nc ** 2)) ** 2;     // quarter-wave MgF₂ at its design wavelength
EX.T8c = (1 - EX.Rc) ** EX.N;

/** The op-fresnel coefficient graph as a still picture. */
const coeffs = (n1, n2, angle, caption, extra = {}) => ({ type: 'op-fresnel', params: { view: 'coeffs', n1, n2, angle, controls: false, readout: false, ...extra }, caption });

export default lesson({
  id: 'phys4650.O3.4',
  title: 'Fresnel equations and total internal reflection',
  minutes: 18, difficulty: 3,
  intro: t`Phase matching ([O3.3](#/lesson/phys4650.O3.3)) fixed the directions of the reflected and transmitted waves. Their **strengths** come from the boundary conditions themselves — the tangential components of $\vec E$ and $\vec H$ are continuous — and depend on the polarization: $s$ (field perpendicular to the plane of incidence) or $p$ (in it). Fresnel’s results, in Hecht’s sign convention, are

$$\begin{gathered}r_s = \frac{n_i\cos\theta_i - n_t\cos\theta_t}{n_i\cos\theta_i + n_t\cos\theta_t}\\[4pt] r_p = \frac{n_t\cos\theta_i - n_i\cos\theta_t}{n_i\cos\theta_t + n_t\cos\theta_i}\end{gathered}$$

The reflected power fraction is $R = |r|^2$: about 4% for glass at normal incidence. At **Brewster’s angle** $r_p = 0$. Going from dense to less dense beyond the **critical angle**, all the light reflects — yet a field still reaches a short way past the surface: the **evanescent wave**.`,
  symbols: [
    { tex: 'r_s,\\ r_p', text: t`amplitude reflection coefficients: reflected field over incident field, for $s$ and $p$ light; negative means a half-cycle phase flip (for $r_p$ the sign is a convention: Griffiths’s is opposite)` },
    { tex: 'n_i,\\ n_t', text: 'the indices of the incident and transmitting media' },
    { tex: '\\theta_i,\\ \\theta_t', text: t`the angles of incidence and transmission, linked by $n_i\sin\theta_i = n_t\sin\theta_t$` },
    { tex: 's,\\ p', text: t`the two polarizations: $\vec E$ perpendicular to the plane of incidence (German *senkrecht*) or parallel to it` },
    { tex: 'R = |r|^2', text: t`the reflectance, the fraction of power reflected; the transmittance is $T = \dfrac{n_t\cos\theta_t}{n_i\cos\theta_i}|t|^2$ and $R + T = 1$` },
  ],
  why: t`Every uncoated lens surface, every sail, every fibre and every polarizing reflection runs on these two formulas.`,
  visual: {
    type: 'op-fresnel',
    title: 'Fresnel coefficients against angle',
    lead: t`The amplitude coefficients $r_s$, $r_p$ (solid) and $t_s$, $t_p$ (dashed) for light going from $n_1$ into $n_2$, with Brewster’s angle $\theta_B$ and the critical angle $\theta_c$ marked. Drag the gold line (or the incident ray in the sketch) to change the angle; switch to powers to see $R$ and $T$.`,
    tasks: [
      t`Air into glass: $r_p$ passes through zero at $\theta_B \approx 56.6^\circ$ and changes sign; $r_s$ stays negative (a half-cycle flip) and both reach $-1$ at grazing incidence.`,
      t`Swap the media ($n_1 = 1.52$, $n_2 = 1$): beyond $\theta_c \approx 41^\circ$ the magnitude of $r$ is 1 — total internal reflection — and $t$ disappears from the graph.`,
      t`Switch to powers and check that $R + T = 1$ for each polarization at every angle.`,
    ],
    params: { view: 'coeffs', n1: 1, n2: 1.5168, angle: 30, show: 'amplitude' },
    caption: t`Exact Fresnel equations for smooth, non-absorbing, non-magnetic media. Hecht’s sign convention: $r_s$ and $r_p$ have opposite signs at normal incidence. Beyond the critical angle $r$ is complex with magnitude 1, drawn as the red line.`,
  },
  example: {
    prompt: t`Derive $r_s$ from the boundary conditions, and use it to find how much starlight survives the 8 uncoated air–glass surfaces of a star tracker with four N-BK7 lenses ($n = ${sf(EX.n, 4)}$ at 589 nm), at normal incidence. How much would a single-layer MgF₂ anti-reflection coating ($n = ${EX.nc}$) help?`,
    visual: coeffs(1, sf(EX.n, 4), 0, t`Reflectance and transmittance of an air–BK7 surface against angle; the tracker’s light arrives near normal incidence.`, { show: 'power' }),
    steps: [
      { label: 'Tangential E', text: t`For $s$ light all three fields are along the surface: $E_i + E_r = E_t$.` },
      { label: 'Tangential H', text: t`In a medium $H = nE/\mu_0c$, and its tangential part is $H\cos\theta$, with the reflected wave’s reversed: $n_i\cos\theta_i(E_i - E_r) = n_t\cos\theta_t\,E_t$.` },
      { label: 'Solve', text: t`Eliminate $E_t$: $r_s = \dfrac{E_r}{E_i} = \dfrac{n_i\cos\theta_i - n_t\cos\theta_t}{n_i\cos\theta_i + n_t\cos\theta_t}$, and $t_s = 1 + r_s$. (The $p$ case is the same with the roles of $E$ and $H$ exchanged.)` },
      { label: 'Normal incidence', text: t`$r = \dfrac{1 - n}{1 + n} = ${sf(EX.r, 3)}$, so $R = ${sf(EX.R * 100, 3)}\%$ per surface, for either polarization.` },
      { label: 'Eight surfaces', text: t`Ignoring light that bounces back and forth: $(1 - R)^8 = ${sf(EX.T8 * 100, 3)}\%$ gets through. The missing ${sf((1 - EX.T8) * 100, 2)}% is not just lost: some of it ends up as ghost images and glare on the detector.` },
      { label: 'With a coating', text: t`A quarter-wave MgF₂ layer (O7) leaves $R = \left(\dfrac{n - n_c^2}{n + n_c^2}\right)^2 = ${sf(EX.Rc * 100, 2)}\%$ at its design wavelength, so $(1 - R)^8 = ${sf(EX.T8c * 100, 3)}\%$.` },
    ],
    answer: t`$r_s = \dfrac{n_i\cos\theta_i - n_t\cos\theta_t}{n_i\cos\theta_i + n_t\cos\theta_t}$; $R = ${sf(EX.R * 100, 3)}\%$ per surface, so $${sf(EX.T8 * 100, 3)}\%$ survives 8 bare surfaces, $${sf(EX.T8c * 100, 3)}\%$ with MgF₂ coatings.`,
  },
  practice: [
    num({
      id: 'normal-R', difficulty: 1,
      gen(r) {
        const [n1, n2, what] = r.pick([[1, 2.417, 'air onto diamond'], [1, 4.003, 'air onto a germanium window for a thermal camera (n = 4.003 at 10 µm)'], [1.333, 1.5168, 'water onto crown glass'], [1, 1.768, 'air onto sapphire'], [1, 1.458, 'air onto fused silica']]);
        const R = ((n1 - n2) / (n1 + n2)) ** 2;
        return {
          prompt: t`What fraction of the light is reflected at normal incidence going from ${what}${what.includes('n =') ? '' : t` ($n_1 = ${n1}$, $n_2 = ${n2}$)`}? Give a percentage.`,
          visual: coeffs(n1, Math.min(3, n2), 0, t`The reflectances $R_s$ and $R_p$ for this boundary against angle; at normal incidence they are equal.`, { show: 'power', trans: false, hide: ['brewster', 'critical'] }),
          answer: R * 100, units: '%', tol: { rel: 0.005 },
          errors: [{ value: Math.abs((n1 - n2) / (n1 + n2)) * 100, feedback: t`That is $|r|$, the amplitude ratio. The power fraction is $R = r^2$.` }],
          hints: [t`At normal incidence $r = (n_1 - n_2)/(n_1 + n_2)$ for both polarizations.`],
          teach: t`At normal incidence $R = \left(\dfrac{n_1 - n_2}{n_1 + n_2}\right)^2$: about 4% for glass, 17% for diamond, 36% for germanium.`,
          explain: t`$R = \left(\dfrac{${n1} - ${n2}}{${n1} + ${n2}}\right)^2 = ${sf(R * 100, 3)}\%$.`,
        };
      },
    }),
    num({
      id: 'brewster', difficulty: 2,
      gen(r) {
        const [n1, n2, what] = r.pick([[1, 1.4570, 'a fused-silica Brewster window in a helium–neon laser (n = 1.457 at 633 nm)'], [1, 1.333, 'sunlight glancing off a calm lake (n = 1.333)'], [1, 1.5168, 'air onto crown glass (n = 1.5168)'], [1.333, 1.5168, 'light in water meeting crown glass (n = 1.333 and 1.5168)']]);
        const b = Math.atan(n2 / n1) / DEG;
        return {
          prompt: t`At what angle of incidence is the reflection completely $s$-polarized for ${what}? Give degrees.`,
          visual: coeffs(n1, n2, 20, t`The amplitude coefficients for this boundary; Brewster’s angle is hidden.`, { hide: ['brewster'] }),
          answer: b, units: 'deg', tol: { rel: 0.002 },
          errors: [{ value: Math.atan(n1 / n2) / DEG, feedback: t`$\tan\theta_B = n_t/n_i$: the transmitting medium’s index on top.` }, { value: Math.asin(Math.min(1, n1 / n2)) / DEG, feedback: t`That uses $\sin$; Brewster’s angle has $\tan\theta_B = n_t/n_i$.` }],
          hints: [t`$r_p = 0$ when the reflected and transmitted rays are perpendicular: $\theta_i + \theta_t = 90^\circ$.`, t`That gives $\tan\theta_B = n_t/n_i$.`],
          teach: t`At Brewster’s angle, $\tan\theta_B = n_t/n_i$, $p$ light is not reflected at all.`,
          explain: t`$\theta_B = \arctan(${n2}/${n1}) = ${sf(b, 4)}^\circ$. At this angle the dipoles driven in the second medium oscillate along the would-be reflected ray, and a dipole does not radiate along its own axis.`,
        };
      },
    }),
    mcq({
      id: 'glare', difficulty: 2,
      prompt: t`Sunlight reflects off a calm lake near Brewster’s angle (about 53°). Polarizing sunglasses cut the glare. Which way must their transmission axis point?`,
      visual: { type: 'optics-rays', params: { mode: 'interface', n1: 1, n2: 1.33, angle: 53, controls: false, readout: false }, caption: t`Unpolarized sunlight striking water at 53° (side view; the lake surface is horizontal). Ray brightness from the Fresnel equations.` },
      choices: ['Vertical: the glare is horizontally polarized (s light, parallel to the water’s surface).', 'Horizontal: the glare is polarized along the surface, so pass that.', 'Along the direction of the reflected ray.', 'Any way: at Brewster’s angle the reflected light is unpolarized.'],
      answer: 0,
      why: { 1: 'That would pass the glare and block the rest.', 2: 'Light is transverse; a polarizer’s axis lies across the ray, not along it.', 3: 'At Brewster’s angle the reflection is completely polarized: only s light reflects.' },
      hints: ['At Brewster’s angle, which polarization is not reflected at all?', 's light has its field perpendicular to the plane of incidence — for a horizontal lake, that is horizontal.'],
      teach: 'Glare from horizontal surfaces is mostly s-polarized, horizontal: vertically oriented polarizers remove it.',
      explain: t`$r_p = 0$ at $\theta_B$, so the reflection is pure $s$: its field is perpendicular to the (vertical) plane of incidence, i.e. horizontal. Sunglasses pass vertical polarization.`,
    }),
    num({
      id: 'R-angle', difficulty: 3,
      gen(r) {
        const th = r.pick([30, 45, 60, 70]), pol = r.pick(['s', 'p']), mat = r.pick(['bk7', 'water']);
        const n = nOf(mat, 589.3), f = F.coefficients(1, n, th * DEG), R = pol === 's' ? f.Rs : f.Rp;
        const t2 = Math.asin(Math.sin(th * DEG) / n);
        return {
          prompt: t`Light in air strikes ${MATS[mat].name} ($n = ${sf(n, 4)}$) at ${th}°, polarized ${pol === 's' ? 'perpendicular to' : 'in'} the plane of incidence ($${pol}$ light). What percentage of its power is reflected?`,
          visual: coeffs(1, sf(n, 4), th, t`Reflectance and transmittance curves for this boundary; read them only roughly, then compute.`, { show: 'power' }),
          answer: R * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (pol === 's' ? f.Rp : f.Rs) * 100, feedback: `That is the other polarization’s reflectance.` }, { value: ((1 - n) / (1 + n)) ** 2 * 100, feedback: 'That is the normal-incidence value; the angle matters.' }].filter((e) => Math.abs(e.value - R * 100) > 0.02 * R * 100),
          hints: [t`First $\theta_t$: $\sin\theta_t = \sin${th}^\circ/${sf(n, 4)}$, so $\theta_t = ${sf(t2 / DEG, 4)}^\circ$.`, pol === 's' ? t`$r_s = \dfrac{\cos\theta_i - n\cos\theta_t}{\cos\theta_i + n\cos\theta_t}$; then $R = r_s^2$.` : t`$r_p = \dfrac{n\cos\theta_i - \cos\theta_t}{\cos\theta_t + n\cos\theta_i}$; then $R = r_p^2$.`],
          teach: t`Away from normal incidence $s$ light reflects more than $p$ light, until both reach 100% at grazing incidence.`,
          explain: t`$r_${pol} = ${sf(pol === 's' ? f.rs[0] : f.rp[0], 4)}$, so $R_${pol} = ${sf(R * 100, 3)}\%$ (the other polarization: $${sf((pol === 's' ? f.Rp : f.Rs) * 100, 3)}\%$).`,
        };
      },
    }),
    mcq({
      id: 'internal-flip', difficulty: 3,
      prompt: t`A student says “reflection always flips the phase by half a cycle”. Light inside crown glass meets the glass–air surface at 20° (below the critical angle). Is the reflected $s$ wave flipped?`,
      visual: coeffs(1.5168, 1, 20, t`The amplitude coefficient $r_s$ for glass into air (internal reflection).`, { pols: ['s'], trans: false, hide: ['critical', 'brewster'] }),
      choices: [t`No: going from higher to lower index, $r_s$ is positive, so there is no flip.`, 'Yes: every reflection flips the phase by π.', 'Yes, but only because 20° is below Brewster’s angle.', 'It is flipped by exactly a quarter cycle.'],
      answer: 0,
      why: { 1: t`$r_s = (n_i\cos\theta_i - n_t\cos\theta_t)/(\dots)$ is negative only when the light reflects off a higher index (external reflection).`, 2: t`Brewster’s angle concerns $r_p$; $r_s$ never changes sign below the critical angle.`, 3: t`Below the critical angle $r_s$ is real: its phase is 0 or π. Other phases appear only beyond $\theta_c$.` },
      hints: [t`Evaluate the sign of $n_i\cos\theta_i - n_t\cos\theta_t$ with $n_i = 1.52$, $n_t = 1$.`, t`$\theta_t > \theta_i$ here, but $n_i\cos\theta_i$ still beats $n_t\cos\theta_t$.`],
      teach: 'The half-cycle flip happens on reflection off a higher index (external reflection), not off a lower one.',
      explain: t`$\theta_t = ${sf(Math.asin(1.5168 * Math.sin(20 * DEG)) / DEG, 3)}^\circ$ and $r_s = ${sf(F.coefficients(1.5168, 1, 20 * DEG).rs[0], 3)} > 0$: no flip. Thin-film colours (O7) depend on getting exactly this bookkeeping right.`,
    }),
    num({
      id: 'penetration', difficulty: 2,
      gen(r) {
        const [n1, n2, what, nm] = r.pick([[1.5168, 1, 'a crown-glass prism in air', 633], [1.458, 1, 'a fused-silica prism in air', 532], [1.768, 1.333, 'a sapphire window under water', 633]]), th = r.pick([50, 60, 70]);
        const thc = Math.asin(n2 / n1) / DEG, th2 = Math.max(th, Math.ceil(thc + 4));
        const d = F.penetration(n1, n2, th2 * DEG, nm * 1e-9) * 1e9;
        return {
          prompt: t`Light of vacuum wavelength ${nm} nm is totally internally reflected inside ${what} ($n_1 = ${n1}$, $n_2 = ${n2}$) at ${th2}°. Over what distance $\delta$ beyond the surface does the evanescent field fall by a factor $e$, in nm?`,
          visual: { type: 'op-fresnel', params: { view: 'evanescent', n1, n2, angle: th2, lambda: nm, controls: false, readout: false, hide: ['delta'], play: false }, caption: t`The field near the surface at one instant (orange positive, blue negative): incident and reflected waves above, the evanescent field below. Ideal plane waves.` },
          answer: d, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: d / 2, feedback: t`That is where the **irradiance** falls by $e$; the field falls by $e$ over $\delta = 1/\kappa$.` }, { value: d * 2 * Math.PI, feedback: t`Divide by $2\pi$: $\kappa = k_0\sqrt{n_1^2\sin^2\theta - n_2^2}$ with $k_0 = 2\pi/\lambda_0$.` }],
          hints: [t`Beyond $\theta_c$ the field goes as $e^{-\kappa z}$ with $\kappa = k_0\sqrt{n_1^2\sin^2\theta - n_2^2}$.`, t`$\delta = 1/\kappa = \lambda_0/\bigl(2\pi\sqrt{n_1^2\sin^2\theta - n_2^2}\bigr)$.`],
          teach: t`The evanescent field reaches about $\lambda_0/2\pi\sqrt{n_1^2\sin^2\theta - n_2^2}$ beyond the surface: a fraction of a wavelength, longer near $\theta_c$.`,
          explain: t`$\sqrt{n_1^2\sin^2\theta - n_2^2} = ${sf(Math.sqrt((n1 * Math.sin(th2 * DEG)) ** 2 - n2 * n2), 4)}$, so $\delta = ${sf(d, 3)}$ nm. It carries no power away on average — the reflection is still total — unless something is put within its reach.`,
        };
      },
    }),
    num({
      id: 'ftir', difficulty: 3,
      gen(r) {
        const g = r.pick([100, 200, 300, 500]), th = r.pick([45, 50, 60]);
        const d = F.penetration(1.5168, 1, th * DEG, 633e-9) * 1e9, fac = Math.exp((-2 * g) / d);
        return {
          prompt: t`Two crown-glass prisms ($n = 1.5168$) are separated by an air gap ${g} nm wide, and 633 nm light meets the gap at ${th}°, beyond the critical angle. Estimate by what factor the evanescent **irradiance** has fallen by the time it reaches the second prism.`,
          visual: { type: 'op-fresnel', params: { view: 'evanescent', n1: 1.5168, n2: 1, angle: th, gap: sf(g / 633, 3), panel: 'tunnel', controls: false, readout: false, play: false }, caption: t`The field with a gap between two blocks of glass, and the exact transmission through the gap against its width (right): light tunnels across. Ideal plane waves.` },
          answer: fac, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-g / d), feedback: t`That is the field’s factor. Irradiance goes as the field squared: $e^{-2d/\delta}$.` }],
          hints: [t`First the penetration depth: $\delta = \lambda_0/\bigl(2\pi\sqrt{n^2\sin^2\theta - 1}\bigr)$.`, t`Irradiance $\propto e^{-2z/\delta}$; put $z$ = the gap.`],
          teach: t`Frustrated TIR: a second surface within a few $\delta$ captures the evanescent field, and light tunnels across a gap it could not cross as a ray.`,
          explain: t`$\delta = ${sf(d, 3)}$ nm, so $e^{-2\times${g}/${sf(d, 3)}} = ${sf(fac, 3)}$. The exact transmission (right panel) differs by a prefactor of order 1, but the exponential is the physics: beam-splitter cubes and prism couplers set their split with a gap of this size.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sail-R', difficulty: 3, transfer: true,
      gen(r) {
        const [nm, n, k] = r.pick([[450, 0.618, 5.47], [550, 0.958, 6.69], [650, 1.47, 7.79]]);
        const R = F.normalR(1, [n, k]);
        return {
          prompt: t`A solar sail is aluminized film. At ${nm} nm aluminium has a complex index of about $\tilde n = ${n} + ${k}i$. The Fresnel formula at normal incidence still holds with a complex index: $R = \left|\dfrac{1 - \tilde n}{1 + \tilde n}\right|^2$. What fraction of the sunlight at this wavelength does it reflect, as a percentage?`,
          visual: { type: 'graph', params: { x: [-1, 2.5], y: [-1, 8.5], aspect: 'wide', equal: true, xlabel: 'Re', ylabel: 'Im', xticks: 4, yticks: 4, points: [{ x: n, y: k, color: 'gold', label: 'ñ (aluminium)' }, { x: 1, y: 0, color: 'accent', label: 'vacuum', labelDy: 14 }, { x: 1.5168, y: 0, color: 'teal', label: 'glass', labelDx: 8, labelDy: -10 }] }, caption: t`The complex index of aluminium against those of vacuum and glass. A large imaginary part is what makes a metal opaque and shiny.` },
          answer: R * 100, units: '%', tol: { rel: 0.005 },
          errors: [{ value: ((1 - n) / (1 + n)) ** 2 * 100, feedback: t`You dropped the imaginary part. $|a + bi|^2 = a^2 + b^2$.` }],
          hints: [t`Write $\tilde n = n + i\kappa$ and use $|a + bi|^2 = a^2 + b^2$.`, t`$|1 - \tilde n|^2 = (1 - n)^2 + \kappa^2$ and $|1 + \tilde n|^2 = (1 + n)^2 + \kappa^2$.`],
          teach: t`A metal’s large $\kappa$ makes $|1 - \tilde n| \approx |1 + \tilde n|$, so it reflects most of the light — and absorbs the rest in a skin a few tens of nanometres deep.`,
          explain: t`$R = \dfrac{(1 - ${n})^2 + ${k}^2}{(1 + ${n})^2 + ${k}^2} = ${sf(R * 100, 3)}\%$. Sail designers use about 0.9 for aluminized film, the $R$ of O2.2; the 8% absorbed heats the sail and, re-radiated, adds a small thermal force.`,
        };
      },
    }),
    num({
      id: 'cp-fibre-depth', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([86.5, 87, 88, 89]), n1 = 1.4682, n2 = 1.4629;
        const d = F.penetration(n1, n2, th * DEG, 1550e-9) * 1e6;
        return {
          prompt: t`In a single-mode telecom fibre the core has $n = ${n1}$ and the cladding $n = ${n2}$. A ray of 1550 nm light meets the core–cladding boundary at ${th}° from the normal. How far into the cladding does the evanescent field reach (fall by $e$), in µm?`,
          visual: { type: 'optics-rays', params: { mode: 'fibre', nCore: 1.4682, nClad: 1.4629, angle: 3, controls: false, readout: false }, caption: t`A ray trapped in a step-index fibre by total internal reflection, the cross-section enormously widened.` },
          answer: d, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: d / 2, feedback: t`That is the irradiance’s $1/e$ depth; the field’s is $\delta = 1/\kappa$.` }],
          hints: [t`The critical angle is $\arcsin(${n2}/${n1}) = ${sf(Math.asin(n2 / n1) / DEG, 4)}^\circ$: the ray is only just beyond it.`, t`$\delta = \lambda_0/\bigl(2\pi\sqrt{n_1^2\sin^2\theta - n_2^2}\bigr)$.`],
          teach: 'Near the critical angle the evanescent field reaches micrometres into the cladding — why fibres need a thick cladding before the jacket.',
          explain: t`$\delta = ${sf(d, 3)}$ µm: comparable with the 8 µm core itself. Much of a single-mode fibre’s light travels in the cladding, which is why the cladding must be thick (62.5 µm in radius) and clean.`,
        };
      },
    }),
    mcq({
      id: 'cp-energy', difficulty: 3, kind: 'error',
      prompt: t`A student checks energy conservation for $s$ light going from air into glass ($n = 1.5$) at 60°: “$r_s = -0.42$ and $t_s = 0.58$, so $r_s^2 + t_s^2 = 0.18 + 0.34 = 0.52$. Half the power has vanished!” What is wrong?`,
      visual: coeffs(1, 1.5, 60, t`The amplitude coefficients for air into glass; $t_s$ is dashed.`, { pols: ['s'] }),
      choices: [t`Transmitted power carries a factor $n_t\cos\theta_t/(n_i\cos\theta_i)$: $T = 0.82$, and $0.18 + 0.82 = 1$.`, 'Nothing: half the power is absorbed at the surface.', t`The coefficients are wrong: $r_s + t_s$ should equal 1.`, t`Power fractions are $|r|$ and $|t|$, not their squares.`],
      answer: 0,
      why: { 1: 'The media are lossless; an ideal boundary absorbs nothing.', 2: t`For $s$ light $t_s = 1 + r_s = 0.58$ — the coefficients are right; it is the energy bookkeeping that is incomplete.`, 3: 'Power goes as the field squared; the missing piece is the factor for speed and beam width.' },
      hints: [t`Power flow per unit area depends on the medium ($I \propto nE^2$) and on the beam’s cross-section.`, t`The transmitted beam is in a slower medium, and its cross-section differs by $\cos\theta_t/\cos\theta_i$.`],
      teach: t`$T = \dfrac{n_t\cos\theta_t}{n_i\cos\theta_i}|t|^2$, not $|t|^2$: irradiance carries a factor $n$, and the beams cross the surface at different angles.`,
      explain: t`$\theta_t = 35.3^\circ$; $T_s = \dfrac{1.5\cos35.3^\circ}{\cos60^\circ}(0.58)^2 = ${sf(F.coefficients(1, 1.5, 60 * DEG).Ts, 2)}$, and $R_s + T_s = 1$.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §4.6–4.7', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'A. D. Rakić, Algorithm for the determination of intrinsic optical constants of metal films: application to aluminum, Appl. Opt. 34, 4755 (1995)', url: 'https://doi.org/10.1364/AO.34.004755' },
    { label: 'SCHOTT optical glass data sheet, N-BK7', url: 'https://refractiveindex.info/?shelf=glass&book=SCHOTT-optical&page=N-BK7' },
  ],
});
