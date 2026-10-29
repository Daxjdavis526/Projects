// The fundamental theorems (Griffiths §1.3): gradient, divergence and Stokes
// theorems as one pattern, and what electrodynamics uses them for — the
// corollaries (path independence, the curl's flux depends only on the rim,
// zero over a closed surface), integration by parts in three dimensions with
// its surface term, and closing a surface with a lid. Builds on
// math2210.C3-5.8–C3-5.10, which prove the theorems.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { fieldPic, sf, sphereSurface } from './_toolkit.js';

const t = String.raw;
const PI = Math.PI;

const RIM = { x: 'cos(t)', y: 'sin(t)', z: '0', t: [0, '2*pi'] };
/** Surfaces sharing the unit circle in the xy-plane as their rim, all oriented upward. */
const DISK = (R = 1) => ({ label: 'Flat disk', x: 'u*cos(v)', y: 'u*sin(v)', z: '0', u: [0, R], v: [0, '2*pi'], boundary: { ...RIM, x: `${R}*cos(t)`, y: `${R}*sin(t)` } });
const HEMI = (R = 1) => ({ label: 'Hemisphere', x: `${R}*sin(u)*cos(v)`, y: `${R}*sin(u)*sin(v)`, z: `${R}*cos(u)`, u: [0, 'pi/2'], v: [0, '2*pi'], boundary: { ...RIM, x: `${R}*cos(t)`, y: `${R}*sin(t)` } });
const BOWL = { label: 'Tall paraboloid', x: 'u*cos(v)', y: 'u*sin(v)', z: '1.5*(1 - u^2)', u: [0, 1], v: [0, '2*pi'], boundary: RIM };
/** The closed upper half-ball: curved dome (outward) plus the flat floor (normal −z). */
const CLOSED_HEMI = (R = 1, label = 'Closed dome') => ({
  label,
  pieces: [
    { x: `${R}*sin(u)*cos(v)`, y: `${R}*sin(u)*sin(v)`, z: `${R}*cos(u)`, u: [0, 'pi/2'], v: [0, '2*pi'] },
    { x: 'v*cos(u)', y: 'v*sin(u)', z: '0', u: [0, '2*pi'], v: [0, R] },
  ],
});
const fluxPic = (F, surfaces, { caption, ...rest } = {}) => ({
  type: 'c3-flux',
  params: { F, surfaces, readouts: [], flipToggle: false, range: 1.5, ...rest },
  caption,
});

export default lesson({
  id: 'phys3600.M0.2',
  title: 'The fundamental theorems',
  minutes: 14, difficulty: 3,
  intro: t`Vector calculus has three fundamental theorems, and they share one shape: **the integral of a derivative over a region equals the function itself on the region’s boundary.**

$$\begin{aligned} \int_{\vec a}^{\vec b}(\nabla T)\cdot d\vec l &= T(\vec b) - T(\vec a) \\ \int_{\mathcal V}(\nabla\cdot\vec v)\,d\tau &= \oint_{\mathcal S}\vec v\cdot d\vec a \\ \int_{\mathcal S}(\nabla\times\vec v)\cdot d\vec a &= \oint_{\mathcal P}\vec v\cdot d\vec l \end{aligned}$$

You proved them in [Calculus III](#/lesson/math2210.C3-5.10). This lesson is about using them the way electrodynamics does: to swap a hard integral for an easy one, to move a derivative from one function onto another, and to read off what the theorems forbid.`,
  symbols: [
    { tex: 'T', text: t`a scalar field; $\vec a$ and $\vec b$ are the ends of the path` },
    { tex: 'd\\vec l', text: 'a small step along a path, in m' },
    { tex: '\\mathcal V,\\ d\\tau', text: t`a volume, and its volume element (Griffiths’ $d\tau$ is the $dV$ of calculus), in $\text{m}^3$` },
    { tex: '\\mathcal S,\\ d\\vec a', text: t`a surface, and a small patch of it as a vector: its area in $\text{m}^2$, pointing along the normal — **outward** for a closed surface` },
    { tex: '\\mathcal P', text: t`the closed path bounding an open surface, walked by the right-hand rule: thumb along $d\vec a$, fingers along the path` },
    { tex: '\\oint', text: 'an integral round a closed path, or over a closed surface' },
  ],
  why: t`Gauss’s law, the existence of the potential and the energy stored in a field all come from these three theorems, used one line at a time.`,
  visual: {
    type: 'c3-flux',
    title: 'Butterfly nets on one rim',
    lead: t`Three surfaces share one rim, the unit circle, all oriented upward. Each is tinted by $(\nabla\times\vec v)\cdot\hat n$ for the field $\vec v = \langle z^2 - y,\ x(1 + z),\ xyz\rangle$, and the readouts give the flux of the curl and the circulation round the rim.`,
    tasks: [
      t`Switch between the disk, the hemisphere and the paraboloid: the tints differ but the flux of the curl stays $2\pi \approx 6.283$. It depends only on the rim.`,
      t`Choose the closed dome. A closed surface has no rim, so the flux of the curl through it must be $0$ — and it is.`,
      'Rotate the picture: on the paraboloid some patches are red (curl crossing downward), and they cancel exactly the extra blue.',
    ],
    params: {
      F: ['z^2 - y', 'x*(1 + z)', 'x*y*z'],
      surfaces: [DISK(), HEMI(), BOWL, CLOSED_HEMI()],
      surface: 1, integrand: 'curl', ghosts: true, readouts: ['flux', 'circ'], flipToggle: false, range: 1.6,
    },
    caption: t`Patches tinted blue where the curl crosses along the upward normal, red where against. The integrals are computed numerically. The field is arbitrary: any field with this rim circulation gives the same flux.`,
  },
  example: {
    prompt: t`Check the divergence theorem for $\vec v = (z + 1)\,\hat z$ (in arbitrary units) on the closed half-ball of radius $R = 2$ sitting on the $xy$-plane: the dome $z \ge 0$ plus its flat floor.`,
    visual: fluxPic(['0', '0', 'z + 1'], [CLOSED_HEMI(2)], { range: 2.6, normals: true, readouts: ['flux'], caption: t`The field (gold) through the closed half-ball, tinted blue where it leaves and red where it enters: it enters through the whole floor, where $\vec v = \hat z$ but the outward normal is $-\hat z$. Drag to rotate.` }),
    steps: [
      { label: 'Volume side', text: t`$\nabla\cdot\vec v = \partial_z(z + 1) = 1$, so $\int(\nabla\cdot\vec v)\,d\tau$ is the volume, $\tfrac23\pi R^3 = \tfrac{16\pi}{3} \approx 16.76$.` },
      { label: 'Dome', text: t`On the sphere $d\vec a = R^2\sin\theta\,d\theta\,d\phi\,\hat r$ and $\hat z\cdot\hat r = \cos\theta$, with $z = R\cos\theta$: $\displaystyle\int_0^{2\pi}\!\!\int_0^{\pi/2}(R\cos\theta + 1)\cos\theta\,R^2\sin\theta\,d\theta\,d\phi = 2\pi R^2\left(\tfrac R3 + \tfrac12\right) = \tfrac{28\pi}{3}$.` },
      { label: 'Floor', text: t`On $z = 0$ the outward normal is $-\hat z$ and $\vec v = \hat z$, so $\vec v\cdot d\vec a = -da$: the floor contributes $-\pi R^2 = -4\pi$. It is **not** zero just because $z = 0$ there.` },
      { label: 'Compare', text: t`$\tfrac{28\pi}{3} - 4\pi = \tfrac{16\pi}{3}$ ✓. Forget the floor and you are off by $4\pi$: the theorem needs a **closed** surface.` },
    ],
    answer: t`Both sides equal $16\pi/3 \approx 16.76$: dome $28\pi/3$ plus floor $-4\pi$.`,
  },
  practice: [
    num({
      id: 'grad-thm', difficulty: 2,
      gen(r) {
        const A = r.pick([1, 2, 3]), B = r.pick([1, 2, 4]);
        const a = [r.int(-2, -1), r.int(-1, 1)], b = [r.int(1, 2), r.int(-1, 1)];
        const T = (x, y) => A * x * x * y + B * y * y;
        const ans = T(b[0], b[1]) - T(a[0], a[1]);
        const fix = ans === 0 ? 1 : 0;
        const b2 = [b[0], b[1] + fix], val = T(b2[0], b2[1]) - T(a[0], a[1]);
        const X = `${a[0]} + (${b2[0] - a[0]})*t`, Y = `${a[1]} + (${b2[1] - a[1]})*t + 0.8*sin(2*pi*t)`;
        return {
          prompt: t`$T(x, y) = ${A === 1 ? '' : A}x^2y + ${B === 1 ? '' : B}y^2$. Evaluate $\int (\nabla T)\cdot d\vec l$ along the wiggly path drawn, from $P = (${a.join(', ')})$ to $Q = (${b2.join(', ')})$.`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-2.2, 3], equal: true, aspect: 'wide', curves: [{ param: [X, Y], t: [0, 1], color: 'gold', width: 3 }], points: [{ x: a[0], y: a[1], label: 'P', color: 'accent' }, { x: b2[0], y: b2[1], label: 'Q', color: 'accent' }] }, caption: 'The path from P to Q. Its exact shape is not given — and not needed.' },
          answer: val, tol: { rel: 0, abs: 1e-6 },
          errors: [
            ...(T(a[0], a[1]) !== 0 && T(b2[0], b2[1]) !== val ? [{ value: T(b2[0], b2[1]), feedback: t`That is $T(Q)$ alone. The theorem gives $T(Q) - T(P)$.` }] : []),
          ],
          hints: ['You cannot parametrize this path — so do not try. Which theorem makes the path irrelevant?', t`$\int_P^Q (\nabla T)\cdot d\vec l = T(Q) - T(P)$.`],
          teach: 'The line integral of a gradient depends only on the endpoints: the fundamental theorem for gradients.',
          explain: t`$T(Q) = ${T(b2[0], b2[1])}$ and $T(P) = ${T(a[0], a[1])}$, so the integral is $${val}$, whatever the path. Corollary: round any closed loop, $\oint\nabla T\cdot d\vec l = 0$.`,
        };
      },
    }),
    mcq({
      id: 'closed-curl', difficulty: 2,
      prompt: t`For any smooth vector field $\vec v$ and any closed surface $\mathcal S$ (a balloon), what is $\oint_{\mathcal S}(\nabla\times\vec v)\cdot d\vec a$?`,
      visual: fluxPic(['z^2 - y', 'x*(1 + z)', 'x*y*z'], [{ label: 'Balloon', x: '(1 + 0.25*cos(2*v)*sin(u))*sin(u)*cos(v)', y: '(1 + 0.25*cos(2*v)*sin(u))*sin(u)*sin(v)', z: '1.2*cos(u)', u: [0, 'pi'], v: [0, '2*pi'] }], { integrand: 'curl', normals: false, caption: t`A lumpy closed surface tinted by $(\nabla\times\vec v)\cdot\hat n$: blue patches and red patches. Drag to rotate.` }),
      choices: [t`$0$, always`, t`$\int_{\mathcal V}\nabla\cdot\vec v\,d\tau$`, t`It depends on $\vec v$ and on the shape`, t`$\oint\vec v\cdot d\vec l$ round the balloon’s widest circle`],
      answer: 0,
      why: {
        1: t`That is the divergence theorem applied to $\vec v$. Applied to $\nabla\times\vec v$ it gives $\int\nabla\cdot(\nabla\times\vec v)\,d\tau$, and the divergence of a curl is zero.`,
        2: 'Cut the balloon along any loop: the two halves have the same rim walked in opposite directions, so their Stokes integrals cancel, whatever the field and shape.',
        3: t`A closed surface has no rim. Cut it in two and each half’s rim circulation appears twice, with opposite signs.`,
      },
      hints: ['Apply the divergence theorem to the field ∇×v.', t`$\nabla\cdot(\nabla\times\vec v) = 0$ for every smooth $\vec v$.`],
      teach: 'The flux of a curl through any closed surface is zero: a closed surface has no rim, and div curl = 0.',
      explain: t`By the divergence theorem, $\oint(\nabla\times\vec v)\cdot d\vec a = \int\nabla\cdot(\nabla\times\vec v)\,d\tau = 0$. This is why $\nabla\cdot\vec B = 0$ is consistent with $\vec B = \nabla\times\vec A$: no magnetic flux ever leaves a closed surface.`,
    }),
    num({
      id: 'sphere-rn', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3]), k = r.pick([2, 3, 5]), R = r.pick([0.5, 1.5, 2]);
        const ans = 4 * PI * k * R ** (n + 2);
        const nT = n === 1 ? 'r' : `r^{${n}}`;
        return {
          prompt: t`$\vec v = ${k}\,${nT}\,\hat r$ (arbitrary units). Find the outward flux of $\vec v$ through the sphere of radius $R = ${R}$ centred on the origin — by the surface integral, the volume integral, or both as a check.`,
          visual: fluxPic([`${k}*x*(x^2 + y^2 + z^2)^(${(n - 1) / 2})`, `${k}*y*(x^2 + y^2 + z^2)^(${(n - 1) / 2})`, `${k}*z*(x^2 + y^2 + z^2)^(${(n - 1) / 2})`], [sphereSurface(1)], { normals: false, arrowLen: 0.25, caption: t`The radial field on the sphere (drawn at radius 1, arrows not to scale), tinted where it leaves. Drag to rotate.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: 4 * PI * k * R ** n, feedback: t`You multiplied the field on the sphere, $${k}R${n === 1 ? '' : `^${n}`}$, by $4\pi$ instead of the sphere’s area $4\pi R^2$.` },
            { value: (4 * PI * k * n * R ** (n + 2)) / (n + 2), feedback: t`The divergence of $r^n\hat r$ is $(n + 2)r^{n-1}$, not $nr^{n-1}$ — the spreading over the sphere adds the 2.` },
          ],
          hints: [t`On the sphere $\vec v\cdot d\vec a = ${k}R${n === 1 ? '' : `^${n}`}\,da$, the same everywhere.`, t`So the flux is $${k}R${n === 1 ? '' : `^${n}`}\cdot 4\pi R^2$. Check: $\int_0^R ${k}(${n + 2})r^{${n - 1}}\,4\pi r^2\,dr$ gives the same.`],
          teach: t`For a radial field on a centred sphere, $\vec v\cdot d\vec a = v_r\,da$ is constant, and the flux is $v_r(R)\cdot4\pi R^2$.`,
          explain: t`Surface: $${k}R${n === 1 ? '' : `^${n}`}\cdot4\pi R^2 = 4\pi(${k})(${R})^{${n + 2}} \approx ${nice(sf(ans, 4))}$. Volume: $\int_0^R ${k}(${n + 2})r^{${n - 1}}\cdot4\pi r^2\,dr = 4\pi(${k})R^{${n + 2}}$ ✓.`,
        };
      },
    }),
    num({
      id: 'stokes-net', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 4, 5]), R = r.pick([1, 1.5, 2]);
        const ans = 2 * PI * a * R * R;
        return {
          prompt: t`$\vec v = \langle z^3 - ${a}y,\ ${a}x + xz^2,\ y\,e^{x}\rangle$. Find the flux of $\nabla\times\vec v$ upward through the hemisphere $x^2 + y^2 + z^2 = ${R * R}$, $z \ge 0$.`,
          visual: fluxPic(['z^3 - ' + a + '*y', a + '*x + x*z^2', 'y*e^x'], [HEMI(1), DISK(1)], { integrand: 'curl', ghosts: true, normals: false, caption: t`The hemisphere tinted by $(\nabla\times\vec v)\cdot\hat n$, with its rim and (faint) the flat disk on the same rim. Drawn at radius 1. Drag to rotate.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: PI * a * R * R, feedback: t`On the rim $\vec v\cdot d\vec l = ${a}(x\,dy - y\,dx)$, and $\oint(x\,dy - y\,dx)$ is **twice** the enclosed area.` },
          ],
          hints: [t`By Stokes the flux of the curl equals $\oint\vec v\cdot d\vec l$ round the rim, the circle of radius ${R} in the plane $z = 0$.`, t`On that circle $z = 0$ and $dz = 0$, so only $-${a}y\,dx + ${a}x\,dy$ survives. With $x = ${R}\cos t$, $y = ${R}\sin t$ it is $${a}(${R})^2\,dt$.`],
          teach: t`The flux of a curl depends only on the rim, so pick the easiest surface or do the line integral.`,
          explain: t`$\oint\vec v\cdot d\vec l = \int_0^{2\pi}${a}(${R})^2\,dt = 2\pi(${a})(${R})^2 \approx ${nice(sf(ans, 4))}$. Equivalently, the flat disk: on $z = 0$, $(\nabla\times\vec v)_z = \partial_x v_y - \partial_y v_x = ${2 * a}$ there, times the area $\pi(${R})^2$. The messy terms never mattered.`,
        };
      },
    }),
    num({
      id: 'lid', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]), c = r.pick([2, 3, 4, 5]);
        const total = (4 / 3) * PI * R ** 3, ans = total + c * PI * R * R;
        return {
          prompt: t`$\vec v = \langle x,\ y,\ ${c}\rangle$. Find the outward flux of $\vec v$ through the **curved dome** alone of the half-ball of radius $${R}$ resting on the $xy$-plane — without doing a surface integral over the dome.`,
          visual: fluxPic(['x', 'y', `${c}`], [CLOSED_HEMI(1)], { normals: true, arrowLen: 0.2, caption: t`The closed half-ball (drawn at radius 1): dome and floor, tinted where $\vec v$ leaves (blue) or enters (red). Drag to rotate.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: total, feedback: t`That is the flux out of the **whole closed** surface. The floor takes part: its flux must be subtracted.` },
            { value: total - c * PI * R * R, feedback: t`Check the floor’s sign: the outward normal there is $-\hat z$, so the floor’s flux is $-${c}\pi R^2$, and the dome’s is total **minus** that.` },
          ],
          hints: [t`Close the surface with the floor. The divergence theorem gives the total: $\nabla\cdot\vec v = 2$ times the volume $\tfrac23\pi R^3$.`, t`On the floor $d\vec a = -\hat z\,da$, so $\vec v\cdot d\vec a = -${c}\,da$: the floor’s flux is $-${c}\pi R^2$. Dome = total − floor.`],
          teach: 'To get the flux through an open surface, close it with an easy lid: the divergence theorem gives the total, and the lid is subtracted.',
          explain: t`Total $= 2\cdot\tfrac23\pi(${R})^3 = ${nice(sf(total, 4))}$; floor $= -${c}\pi(${R})^2 = ${nice(sf(-c * PI * R * R, 4))}$; dome $=$ total $-$ floor $\approx ${nice(sf(ans, 4))}$.`,
        };
      },
    }),
    order({
      id: 'ibp-3d', difficulty: 3,
      prompt: t`Put the steps of **integration by parts in three dimensions** in order.`,
      items: [
        t`Product rule: $\nabla\cdot(f\vec A) = f\,(\nabla\cdot\vec A) + \vec A\cdot(\nabla f)$`,
        t`Integrate over $\mathcal V$: $\int\nabla\cdot(f\vec A)\,d\tau = \int f(\nabla\cdot\vec A)\,d\tau + \int\vec A\cdot\nabla f\,d\tau$`,
        t`Divergence theorem on the left: it becomes $\oint_{\mathcal S} f\vec A\cdot d\vec a$`,
        t`Rearrange: $\int f(\nabla\cdot\vec A)\,d\tau = -\int\vec A\cdot\nabla f\,d\tau + \oint f\vec A\cdot d\vec a$`,
        t`Over all space, if $f\vec A$ falls faster than $1/r^2$, the surface term vanishes`,
      ],
      visual: {
        type: 'graph',
        params: { x: [0, 3], y: [-2.5, 1.5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'radius R of the bounding sphere', ylabel: 'size', curves: [{ fn: '-x', color: 'accent', label: 'f ~ 1/R', labelAt: 1.6, labelDx: 16, labelDy: -6 }, { fn: '-2*x', color: 'teal', label: 'A ~ 1/R²', labelAt: 0.5, labelDx: 16, labelDy: -6 }, { fn: '1.1 - x', color: 'gold', dash: true, label: 'surface term ~ 4πR²·f·A ~ 1/R', labelAt: 1.3, labelDy: -16 }] },
        caption: t`Log–log sketch for a point charge’s $f = V \sim 1/R$ and $\vec A = \vec E \sim 1/R^2$: the surface term $\oint f\vec A\cdot d\vec a \sim 4\pi R^2\cdot R^{-3}$ dies away as $1/R$. Slopes exact, heights illustrative.`,
      },
      hints: ['Start from a product rule — which derivative of a product contains ∇·A?', 'The divergence theorem turns the integral of a divergence into a surface integral; the last step is the limit.'],
      teach: 'Integration by parts in 3D is the product rule plus the divergence theorem; the boundary term often vanishes at infinity.',
      explain: t`$\int f(\nabla\cdot\vec A)\,d\tau = -\int\vec A\cdot(\nabla f)\,d\tau + \oint f\vec A\cdot d\vec a$. It moves the derivative from $\vec A$ onto $f$ at the price of a sign and a boundary term — exactly as $\int u\,dv = uv - \int v\,du$ does in one dimension.`,
    }),
    mcq({
      id: 'error-orientation', difficulty: 2, kind: 'error',
      prompt: t`For $\vec v = \langle -y,\ x,\ 0\rangle$ a student walks the unit circle in the $xy$-plane **anticlockwise as seen from above** and finds $\oint\vec v\cdot d\vec l = 2\pi$. For the surface side they take the unit disk with normal $-\hat z$ (as drawn) and get $\int(\nabla\times\vec v)\cdot d\vec a = -2\pi$. “Stokes’ theorem fails,” they conclude. What went wrong?`,
      visual: fluxPic(['-y', 'x', '0'], [{ ...DISK(1), boundary: undefined }], { integrand: 'curl', flip: true, normals: true, caption: t`The disk with the normal the student chose, $-\hat z$, tinted red where the curl crosses against that normal. The student walked the rim anticlockwise as seen from above. Drag to rotate.` }),
      choices: ['The normal and the direction round the rim must obey the right-hand rule; anticlockwise from above goes with +ẑ', 'Nothing: Stokes’ theorem only holds up to a sign', 'The curl was computed wrongly; it is −2ẑ', 'Stokes’ theorem needs a closed surface'],
      answer: 0,
      why: {
        1: 'The theorem holds exactly once the orientations are matched; the sign is not a matter of taste.',
        2: t`$\nabla\times\langle -y, x, 0\rangle = \langle 0, 0, 2\rangle$; the student’s curl was right, their normal was not.`,
        3: t`Stokes’ theorem is for an **open** surface with a rim. A closed surface gives zero, as the corollary says.`,
      },
      hints: ['Curl the fingers of your right hand in the direction you walk the rim. Where does your thumb point?'],
      teach: t`In Stokes’ theorem the rim’s direction and the normal $d\vec a$ are tied by the right-hand rule.`,
      explain: t`Anticlockwise from above means the thumb points up, $+\hat z$. With that normal, $\int(\nabla\times\vec v)\cdot d\vec a = 2\cdot\pi = 2\pi$ ✓. The same rule fixes the sign of every emf and Ampère’s-law calculation later.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rtg', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([3, 3.5, 4]), L = r.pick([10, 12.5, 15]), p = r.pick([3.5, 4, 4.5]);
        const ans = p * PI * a * a * L;
        return {
          prompt: t`A radioisotope thermoelectric generator heats its converters with a plutonium-238 oxide stack, modelled as a cylinder of radius ${a} cm and length ${L} cm that releases heat at a uniform ${p} W/cm³. In steady state the heat flux $\vec q$ (W/m²) obeys $\nabla\cdot\vec q = p$ inside the fuel. How much heat flows out through the stack’s surface?`,
          visual: fluxPic(['x', 'y', 'z'], [{ label: 'Fuel stack', pieces: [{ x: 'cos(u)', y: 'sin(u)', z: 'v', u: [0, '2*pi'], v: [-1.2, 1.2] }, { x: 'u*cos(v)', y: 'u*sin(v)', z: '1.2', u: [0, 1], v: [0, '2*pi'] }, { x: 'v*cos(u)', y: 'v*sin(u)', z: '-1.2', u: [0, '2*pi'], v: [0, 1] }] }], { normals: false, arrowLen: 0.2, range: 1.6, caption: t`The fuel stack as a closed cylinder, with heat streaming out through every face. Arrows illustrative; the real flux pattern depends on the surroundings, which the answer does not need. Drag to rotate.` }),
          answer: ans, units: 'W', tol: { rel: 0.005 },
          errors: [
            { value: p * 2 * PI * a * L, feedback: 'You used the curved surface area. The divergence theorem needs the volume: the heat leaving is what is made inside.' },
            { value: p * PI * a * a, feedback: 'That is per centimetre of length. Multiply by the length too.' },
          ],
          hints: [t`$\oint\vec q\cdot d\vec a = \int(\nabla\cdot\vec q)\,d\tau$.`, t`$\nabla\cdot\vec q = p$ is uniform, so the right side is $p$ times the volume $\pi a^2L$.`],
          teach: 'In steady state the flux out of a closed surface equals the total source inside: the divergence theorem as an energy budget.',
          explain: t`$\oint\vec q\cdot d\vec a = p\,\pi a^2L = ${p}\times\pi(${a})^2(${L}) \approx ${nice(sf(ans, 3))}$ W. A real MMRTG burns about 2 kW of heat this way to make about 110 W of electricity.`,
        };
      },
    }),
    mcq({
      id: 'cp-loop', difficulty: 2,
      prompt: t`A voltmeter lead is looped once round a region and both ends brought back to the meter: it reads $\oint\vec E\cdot d\vec l = 0.3$ V, steadily, while the magnetic field through the loop changes. Can this $\vec E$ be written as $-\nabla V$ for some potential $V$?`,
      visual: fieldPic('-y', 'x', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, curves: [{ param: ['1.2*cos(t)', '1.2*sin(t)'], t: [0, 6.3], color: 'gold', width: 3 }], caption: 'A field with circulation and the closed loop of wire (gold). Arrow lengths compressed.' }),
      choices: [t`No: a gradient has $\oint\nabla V\cdot d\vec l = 0$ round every loop`, 'Yes, with V changing by 0.3 V once round', 'Yes, if the loop is small enough', 'Only if the field is uniform'],
      answer: 0,
      why: {
        1: t`A single-valued $V$ returns to its starting value after a full loop, so its gradient’s circulation must be $0$.`,
        2: 'The gradient theorem holds for every closed loop, large or small.',
        3: 'Uniformity is not the issue: any gradient has zero circulation, uniform or not.',
      },
      hints: [t`The gradient theorem with $\vec b = \vec a$ gives $\oint\nabla V\cdot d\vec l = V(\vec a) - V(\vec a)$.`],
      teach: 'A field with nonzero circulation round any loop is not the gradient of a single-valued scalar.',
      explain: t`$\oint(-\nabla V)\cdot d\vec l = -[V(\vec a) - V(\vec a)] = 0$ for any $V$, so a field with $0.3$ V of circulation is not a gradient. This is Faraday’s induced field; in **statics** the circulation is always $0$, which is why electrostatics has a potential.`,
    }),
    mcq({
      id: 'cp-ibp', difficulty: 3,
      prompt: t`For a localized charge distribution, the energy calculation uses $\int_{\text{all space}} V\,\nabla^2 V\,d\tau = -\int_{\text{all space}}|\nabla V|^2\,d\tau$. Why may the surface term be dropped?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3], y: [-3.5, 3.5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'radius R of the bounding sphere (m)', ylabel: 'size', curves: [{ fn: '-x', color: 'accent', label: 'V ~ 1/R', labelAt: 2.2, labelDy: -16 }, { fn: '-2*x', color: 'teal', label: '|∇V| ~ 1/R²', labelAt: 0.8, labelDx: 16, labelDy: -6 }, { fn: '1.1 + 2*x', domain: [0, 1.15], color: 'violet', label: 'area 4πR²', labelAt: 0.6, labelDx: 16, labelDy: 10 }] },
        caption: 'Far from any localized charge: how V, its gradient and the area of a large sphere scale with its radius R. Slopes exact; heights illustrative.',
      },
      choices: [
        t`On a sphere of radius $R$, $V\nabla V\cdot d\vec a$ adds up to about $\tfrac1R\cdot\tfrac1{R^2}\cdot R^2 = \tfrac1R \to 0$`,
        t`Because $\nabla^2V = 0$ everywhere`,
        t`Because $\vec E = -\nabla V$ is curl-free`,
        t`Because $V$ is continuous`,
      ],
      answer: 0,
      why: {
        1: t`Inside the charge $\nabla^2V = -\rho/\varepsilon_0 \ne 0$. And the question is about the boundary term, not the integrand.`,
        2: 'Being curl-free makes V exist; it says nothing about how the boundary term behaves at infinity.',
        3: t`Continuity does not make a surface integral small; the decay of $V\nabla V$ against the growing area does.`,
      },
      hints: [t`The identity comes from integrating $\nabla\cdot(V\nabla V) = V\nabla^2V + |\nabla V|^2$; the surface term is $\oint V\nabla V\cdot d\vec a$.`, t`Far away $V \sim 1/R$ and $|\nabla V| \sim 1/R^2$, while the area grows as $R^2$.`],
      teach: 'A surface term at infinity vanishes when the integrand falls faster than the area grows.',
      explain: t`$\oint V\nabla V\cdot d\vec a \sim \tfrac1R\cdot\tfrac1{R^2}\cdot4\pi R^2 \to 0$ as $R \to \infty$. This step turns $W = \tfrac12\int\rho V\,d\tau$ into $W = \tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ in module M2.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §1.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'NASA: Multi-Mission Radioisotope Thermoelectric Generator', url: 'https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/' },
  ],
});
