// Why ∂_μV^ν is not a tensor: the partial derivatives of a field's
// components also measure how the basis vectors turn and stretch. A uniform
// field in polar coordinates has non-zero partials; the chain rule shows the
// extra, second-derivative term in their transformation law.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, plane, polarGrid, fieldArrows, basisAt, DEG } from './_tcalc.js';

const t = String.raw;

// still pictures of a uniform field on a polar grid (gr-coordinates, field mode)
const fieldPic = (alpha, a, b, caption, naive = false) => ({ type: 'gr-coordinates', params: { mode: 'field', alpha, a, b, naive, readout: false, range: 4 }, caption });

// a uniform field (direction alpha) on a polar grid with the basis at two points of one circle
function twoPoints(alpha, R, th1, th2, caption) {
  const P = [R * Math.cos(th1 * DEG), R * Math.sin(th1 * DEG)], Q = [R * Math.cos(th2 * DEG), R * Math.sin(th2 * DEG)];
  const u = [Math.cos(alpha * DEG), Math.sin(alpha * DEG)];
  return plane({
    x: [-5, 5], y: [-3.1, 3.1],
    curves: polarGrid(6),
    arrows: [
      ...fieldArrows(() => u, { x: [-5, 5], y: [-3.1, 3.1], maxLen: 0.55, skip: (x, y) => Math.hypot(x - P[0], y - P[1]) < 0.8 || Math.hypot(x - Q[0], y - Q[1]) < 0.8 }),
      ...basisAt(P, { k: 0.3 }), ...basisAt(Q, { k: 0.3, labels: false }),
      { from: P.map(r6), to: [r6(P[0] + 1.2 * u[0]), r6(P[1] + 1.2 * u[1])], color: 'gold', width: 3, label: 'V' },
      { from: Q.map(r6), to: [r6(Q[0] + 1.2 * u[0]), r6(Q[1] + 1.2 * u[1])], color: 'gold', width: 3, label: 'V' },
    ],
    points: [{ x: r6(P[0]), y: r6(P[1]), r: 3.5, color: 'ink', label: 'P', labelDx: -16, labelDy: 12 }, { x: r6(Q[0]), y: r6(Q[1]), r: 3.5, color: 'ink', label: 'Q', labelDx: -16, labelDy: 12 }, { x: 0, y: 0, r: 3, color: 'ink3' }],
    caption,
  });
}

export default lesson({
  id: 'st-a.A8.1',
  title: 'Why ∂μVν is not a tensor',
  minutes: 10, difficulty: 3,
  intro: t`A vector field is components times basis vectors, $V = V^\nu\partial_\nu$. In Cartesian coordinates the basis is the same everywhere, so differentiating the field is differentiating its components. In polar coordinates it is not: **the basis vectors turn and stretch from point to point** (lesson A4.3), so $\partial_\mu V^\nu$ mixes the change of the field with the change of the grid. The chain rule shows the damage. Differentiating $V'^\nu = \tfrac{\partial x'^\nu}{\partial x^\beta}V^\beta$ with $\partial'_\mu = \tfrac{\partial x^\alpha}{\partial x'^\mu}\partial_\alpha$ gives two terms:

$$\partial'_\mu V'^\nu = \frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial x'^\nu}{\partial x^\beta}\,\partial_\alpha V^\beta + \underbrace{\frac{\partial x^\alpha}{\partial x'^\mu}\,\frac{\partial^2 x'^\nu}{\partial x^\alpha\,\partial x^\beta}\,V^\beta}_{\text{extra term}}$$

The first is exactly a $(1, 1)$ tensor’s law. The second is not, and it vanishes only when the Jacobian is constant — for linear changes of coordinates such as rotations and Lorentz boosts. For polar coordinates it survives, so $\partial_\mu V^\nu$ is **not a tensor**.`,
  symbols: [
    { tex: t`\partial_\mu V^\nu`, text: t`the partial derivatives of the field’s components: how $V^\nu$ changes as $x^\mu$ alone changes` },
    { tex: t`\partial'_\mu V'^\nu`, text: 'the same thing computed in the new coordinates' },
    { tex: t`\dfrac{\partial x'^\nu}{\partial x^\beta}`, text: t`the Jacobian, which changes from point to point unless the change of coordinates is linear` },
    { tex: t`\dfrac{\partial^2 x'^\nu}{\partial x^\alpha\,\partial x^\beta}`, text: t`its derivative: how fast the Jacobian — and so the new basis — changes from place to place. Zero for linear changes; not zero for polar coordinates` },
  ],
  why: t`Every law of physics with a derivative in it — Maxwell’s equations, energy conservation, the equation of motion — has to be rewritten before it can hold in curvilinear coordinates and in curved spacetime. This lesson shows what goes wrong; the next three fix it.`,
  visual: {
    type: 'gr-coordinates',
    title: 'Same arrow, different components',
    lead: t`Every arrow here is the same arrow: a uniform field. Blue (“out”) and violet (“around”) are the polar grid’s own unit arrows at A and at B. The readout gives the field’s polar components at each point. Then switch on the copy: the red dashed arrow at B is what you get by reusing A’s components there.`,
    tasks: [
      'Drag B around the circle through A: the components change although the field does not — the grid turned under it.',
      'Switch on “copy A’s components”: the red arrow points the wrong way. Equal components at two points do not mean equal arrows.',
      'Drag B straight out along A’s ray: now the copy is right. Along a ray the polar grid does not turn.',
    ],
    params: { mode: 'field', alpha: 20, a: [2.2, 0.8], b: [-0.6, 2.3], range: 4 },
    caption: t`A uniform field on a polar grid. Gold and grey arrows: the field, the same everywhere. Blue and violet: the unit vectors $\hat r$ and $\hat\theta$ at A and B. The readout uses components along those unit vectors; the coordinate component $V^\theta$ is that divided by $r$. Red dashed: A’s components reused at B. Drag A and B.`,
  },
  example: {
    prompt: t`Take the uniform field $V = \partial_y$ (say a uniform electric field, pointing up). Write its polar components, differentiate them naively, and then differentiate the whole field $V^\nu\partial_\nu$ along $\theta$ with the product rule.`,
    visual: twoPoints(90, 2.2, 20, 110, t`The uniform field (gold, grey) and the polar basis at two points of one circle: $\partial_r$ (blue) and $0.3\,\partial_\theta$ (violet). Going round from P to Q, the field’s arrow is unchanged; the basis has turned by $90^\circ$.`),
    steps: [
      { label: 'Components', text: t`$\partial_y = \sin\theta\,\partial_r + \dfrac{\cos\theta}{r}\,\partial_\theta$ (the dual basis of lesson A4.3 applied to $(0, 1)$). So $V^r = \sin\theta$ and $V^\theta = \cos\theta/r$.` },
      { label: 'Naive derivatives', text: t`$\partial_\theta V^r = \cos\theta$, $\partial_\theta V^\theta = -\sin\theta/r$, $\partial_r V^\theta = -\cos\theta/r^2$, $\partial_r V^r = 0$. Three of four are not zero — for a field that does not change at all.` },
      { label: 'The product rule', text: t`$\partial_\theta(V^r\partial_r + V^\theta\partial_\theta) = (\partial_\theta V^r)\,\partial_r + (\partial_\theta V^\theta)\,\partial_\theta + V^r\,(\partial_\theta\partial_r) + V^\theta\,(\partial_\theta\partial_\theta)$. The first two terms are the naive ones; the last two are how the basis changes.` },
      { label: 'How the basis turns', text: t`In Cartesian components $\partial_r = (\cos\theta, \sin\theta)$ and $\partial_\theta = (-r\sin\theta, r\cos\theta)$, so $\partial_\theta\partial_r = (-\sin\theta, \cos\theta) = \tfrac1r\partial_\theta$ and $\partial_\theta\partial_\theta = (-r\cos\theta, -r\sin\theta) = -r\,\partial_r$.` },
      { label: 'Add it all up', text: t`$\cos\theta\,\partial_r - \dfrac{\sin\theta}{r}\partial_\theta + \sin\theta\cdot\dfrac1r\partial_\theta + \dfrac{\cos\theta}{r}(-r\,\partial_r) = 0$. ✓ The naive terms are cancelled exactly by the turning of the basis.` },
      { label: 'Sense check', text: t`In Cartesian coordinates $\partial_\mu V^\nu = 0$ for this field. A tensor that is zero in one coordinate system is zero in all; $\partial_\mu V^\nu$ is zero in one and not in the other, so it cannot be a tensor.` },
    ],
    answer: t`$\partial_\theta V^r = \cos\theta \ne 0$ and $\partial_\theta V^\theta = -\sin\theta/r \ne 0$, but $\partial_\theta(V^\nu\partial_\nu) = 0$: the missing pieces are the derivatives of the basis vectors, $\partial_\theta\partial_r = \tfrac1r\partial_\theta$ and $\partial_\theta\partial_\theta = -r\,\partial_r$.`,
  },
  practice: [
    num({
      id: 'naive-uniform', difficulty: 2,
      gen(r) {
        const E = r.pick([2, 3, 5]), al = r.pick([0, 30, 60, 90]), th = r.pick([45, 120, 150, 210, 300]);
        const ans = -E * Math.sin((th - al) * DEG);
        return {
          prompt: t`A uniform field of strength ${E} (any units) points at $${al}^\circ$ from the $x$ axis, so its radial component is $V^r = ${E}\cos(\theta - ${al}^\circ)$. Find the naive derivative $\partial_\theta V^r$ at $\theta = ${th}^\circ$ (per radian).`,
          visual: fieldPic(al, [2.4 * Math.cos(th * DEG), 2.4 * Math.sin(th * DEG)], [2.4 * Math.cos((th + 75) * DEG), 2.4 * Math.sin((th + 75) * DEG)], t`The uniform field and the polar unit vectors at two points on one circle (A at $${th}^\circ$).`),
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: 0, feedback: t`The field is constant, but its polar component is not: $V^r$ changes as you go round because $\partial_r$ turns.` }, { value: -ans, feedback: t`$\dfrac{d}{d\theta}\cos(\theta - \alpha) = -\sin(\theta - \alpha)$: check the sign.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Differentiate $${E}\cos(\theta - ${al}^\circ)$ with respect to $\theta$ (in radians).`],
          teach: 'A constant field has non-zero partial derivatives of its polar components: the partials see the turning grid.',
          explain: t`$\partial_\theta V^r = -${E}\sin(${th}^\circ - ${al}^\circ) = ${nice(ans, 4)}$ per radian — not zero, though nothing about the field changes.`,
        };
      },
    }),
    mcq({
      id: 'which-term', difficulty: 2,
      prompt: t`$$\partial'_\mu V'^\nu = \frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial x'^\nu}{\partial x^\beta}\,\partial_\alpha V^\beta + \frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial^2 x'^\nu}{\partial x^\alpha\partial x^\beta}\,V^\beta$$ Where does the second term come from?`,
      visual: twoPoints(0, 2.4, 30, 100, t`A uniform field and the polar basis at two points: the new basis vectors are different at P and Q because the Jacobian is.`),
      choices: [
        t`From the product rule: $\partial'_\mu$ also differentiates the Jacobian $\partial x'^\nu/\partial x^\beta$, which changes from point to point`,
        t`From the field itself changing from point to point`,
        'From a mistake in the chain rule: it should cancel',
        t`From the metric, which enters every derivative`,
      ],
      answer: 0,
      why: {
        1: t`The field’s own change is the first term. The second is there even for a constant field ($\partial_\alpha V^\beta = 0$).`,
        2: 'It is correct calculus. It cancels only when the Jacobian is constant.',
        3: 'No metric appears: this is a statement about coordinates alone.',
      },
      hints: [t`$V'^\nu$ is a product: $\dfrac{\partial x'^\nu}{\partial x^\beta}$ times $V^\beta$. What does the product rule do to it?`],
      teach: 'The extra term is the derivative of the Jacobian: the grid changing, not the field.',
      explain: t`$\partial'_\mu\!\left(\tfrac{\partial x'^\nu}{\partial x^\beta}V^\beta\right)$ has a term for each factor. Differentiating $V^\beta$ gives the tensor-like first term; differentiating the Jacobian gives the second derivative $\partial^2x'^\nu/\partial x^\alpha\partial x^\beta$ — how the new basis changes from place to place.`,
    }),
    num({
      id: 'second-derivative', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick([[3, 4, 5], [-3, 4, 5], [4, -3, 5], [6, 8, 10], [5, 12, 13]]), which = r.pick(['xx', 'xy']);
        const ans = which === 'xx' ? (y * y) / R ** 3 : (-x * y) / R ** 3;
        return {
          prompt: t`For the change from Cartesian to polar coordinates, one of the second derivatives in the extra term is $\dfrac{\partial^2 r}{\partial x${which === 'xx' ? '^2' : t`\,\partial y`}}$. Evaluate it at $(x, y) = (${x}, ${y})$, with $r = \sqrt{x^2 + y^2}$.`,
          visual: plane({ x: [-14, 14], y: [-8.7, 8.7], curves: polarGrid(15, { step: 2.5 }), arrows: basisAt([x, y], { k: 0.15 }).map((a) => ({ ...a, to: [r6(a.from[0] + 2 * (a.to[0] - a.from[0])), r6(a.from[1] + 2 * (a.to[1] - a.from[1]))] })), points: [{ x, y, r: 4, color: 'gold', label: 'P' }, { x: 0, y: 0, r: 3, color: 'ink3' }], caption: t`The point and its polar basis (both drawn twice their scale): the Jacobian, and so the basis, changes as P moves.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: which === 'xx' ? x / R : y / R, feedback: t`That is the first derivative, $\partial r/\partial ${which === 'xx' ? 'x' : 'y'}$. Differentiate once more.` }],
          hints: [t`$\partial r/\partial x = x/r$. Differentiate that with respect to ${which === 'xx' ? '$x$ (quotient rule; $\\partial r/\\partial x = x/r$ again)' : '$y$, holding $x$ fixed'}.`, which === 'xx' ? t`$\dfrac{\partial}{\partial x}\dfrac{x}{r} = \dfrac{r - x^2/r}{r^2} = \dfrac{y^2}{r^3}$.` : t`$\dfrac{\partial}{\partial y}\dfrac{x}{r} = -\dfrac{x}{r^2}\dfrac{y}{r} = -\dfrac{xy}{r^3}$.`],
          teach: 'A curvilinear change of coordinates has non-zero second derivatives, which is exactly what spoils the partial derivative.',
          explain: t`$${which === 'xx' ? t`\partial^2r/\partial x^2 = y^2/r^3` : t`\partial^2r/\partial x\partial y = -xy/r^3`} = ${nice(ans, 4)}$ — not zero, so the extra term survives. For a rotation $x' = x\cos\phi + y\sin\phi$ every second derivative would be zero.`,
        };
      },
    }),
    multi({
      id: 'when-ok', difficulty: 2,
      prompt: t`For which changes of coordinates do the partial derivatives $\partial_\mu V^\nu$ transform as a tensor? Select every one.`,
      visual: plane({ x: [-4, 4], y: [-2.5, 2.5], curves: [...[-3, -2, -1, 0, 1, 2, 3].map((k) => ({ param: [`${k}*0.866 - 0.5*t`, `${k}*0.5 + 0.866*t`], t: [-5, 5], color: 'accent', width: 1 })), ...[-3, -2, -1, 0, 1, 2, 3].map((k) => ({ param: [`-${k}*0.5 + 0.866*t`, `${k}*0.866 + 0.5*t`], t: [-5, 5], color: 'violet', width: 1 }))], caption: 'A rotated Cartesian grid: its basis is the same at every point.' }),
      choices: ['A rotation of Cartesian axes', 'A Lorentz boost between inertial frames', 'Cartesian to polar coordinates', 'Any linear change x′ = Ax + b', 'Cartesian to spherical coordinates'],
      answer: [0, 1, 3],
      why: { 2: t`Polar coordinates have non-zero second derivatives, such as $\partial^2r/\partial x^2 = y^2/r^3$.`, 4: t`Spherical coordinates turn their basis too: $\partial^2 r/\partial x^2 \ne 0$.` },
      hints: [t`The extra term contains $\partial^2x'/\partial x\,\partial x$. When is it zero everywhere?`],
      teach: 'Partial derivatives are tensors only under linear changes of coordinates, whose Jacobians are constant.',
      explain: t`Rotations, boosts and every other linear map have a constant Jacobian, so the second derivatives vanish — which is why special relativity, done in inertial coordinates, gets away with $\partial_\mu$. Polar and spherical coordinates, and every coordinate system on a curved space, do not.`,
    }),
    num({
      id: 'basis-turn', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 60, 120, 150, 240]), comp = r.pick(['x', 'y']), R = r.pick([2, 3]);
        const ans = comp === 'x' ? -R * Math.cos(th * DEG) : -R * Math.sin(th * DEG);
        return {
          prompt: t`$\partial_\theta = (-r\sin\theta,\ r\cos\theta)$ in Cartesian components. As you move round the circle $r = ${R}$, how fast does it change? Find the ${comp}-component of $\partial_\theta(\partial_\theta)$ at $\theta = ${th}^\circ$.`,
          visual: plane({ x: [-4.5, 4.5], y: [-2.8, 2.8], curves: polarGrid(5), arrows: [0, 1, 2, 3, 4, 5, 6, 7].flatMap((k) => basisAt([R * Math.cos((th + 45 * k) * DEG), R * Math.sin((th + 45 * k) * DEG)], { k: 0.3, labels: k === 0 })), points: [{ x: r6(R * Math.cos(th * DEG)), y: r6(R * Math.sin(th * DEG)), r: 4, color: 'gold', label: 'P', labelDx: -16, labelDy: 12 }], caption: t`The polar basis around the circle $r = ${R}$ ($\partial_\theta$ drawn at 0.3 of its length): going round, $\partial_\theta$ swings toward the centre.` }),
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: comp === 'x' ? -Math.cos(th * DEG) : -Math.sin(th * DEG), feedback: t`Keep the factor $r$: $\partial_\theta$ is $r$ long.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Differentiate each Cartesian component with respect to $\theta$, holding $r$ fixed.`],
          teach: t`The basis vectors change from point to point; $\partial_\theta\partial_\theta = -r\,\partial_r$ points inward.`,
          explain: t`$\partial_\theta(-r\sin\theta, r\cos\theta) = (-r\cos\theta, -r\sin\theta) = -r\,\partial_r$; its ${comp}-component here is $${nice(ans, 4)}$. Lesson A8.2 names this number: $\Gamma^r{}_{\theta\theta} = -r$.`,
        };
      },
    }),
    mcq({
      id: 'radial-field', difficulty: 2, kind: 'error',
      prompt: t`A student says: “The field with $V^r = 1$ and $V^\theta = 0$ at every point has all its partial derivatives $\partial_\mu V^\nu$ equal to zero, so it is a constant field.” What is wrong?`,
      visual: plane({ x: [-4.2, 4.2], y: [-2.6, 2.6], curves: polarGrid(5), arrows: fieldArrows((x, y) => [x / Math.hypot(x, y), y / Math.hypot(x, y)], { x: [-4.2, 4.2], y: [-2.6, 2.6], maxLen: 0.6, skip: (x, y) => Math.hypot(x, y) < 0.5 }), points: [{ x: 0, y: 0, r: 3, color: 'ink3' }], caption: t`The field $V = \partial_r$: one unit outward at every point.` }),
      choices: [
        t`The field is $\partial_r$, which points outward everywhere — in different directions at different points; zero partials only mean the components are constant, not the field`,
        'Nothing: zero derivatives always mean a constant field',
        t`The partial derivatives are not zero: $\partial_r V^r = 1$`,
        t`The field is constant, but only along each ray`,
      ],
      answer: 0,
      why: {
        1: 'Only in a basis that is itself constant. The polar basis is not.',
        2: t`$V^r = 1$ is constant, so its derivative is 0.`,
        3: 'Along a ray it is indeed constant; but the statement claimed it was constant everywhere, and going round the circle it turns.',
      },
      hints: ['Draw the arrows at a few points: are they all parallel?'],
      teach: 'Constant components in a turning basis describe a turning field: partial derivatives of components are not derivatives of the field.',
      explain: t`$\partial_r$ points away from the origin, so on opposite sides it points in opposite directions. Its true rate of change going round is $\partial_\theta(\partial_r) = \tfrac1r\partial_\theta \ne 0$ — the term the partial derivatives miss.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-radar', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([8, 12, 15]), al = r.pick([20, 45, 70]), t1 = r.pick([0, 90, 180]), dt = r.pick([30, 60]);
        const t2 = t1 + dt;
        const ans = v * Math.cos((t2 - al) * DEG) - v * Math.cos((t1 - al) * DEG);
        return {
          prompt: t`A Doppler weather radar measures only the radial part of the wind, $V^r$. A perfectly uniform wind of ${v} m/s blows toward the direction $${al}^\circ$ (angles measured anticlockwise from east, as for $\theta$). By how much does the radial velocity the radar records change between the azimuths $\theta = ${t1}^\circ$ and $\theta = ${t2}^\circ$, in m/s? (Later minus earlier.)`,
          visual: fieldPic(al, [2.4 * Math.cos(t1 * DEG), 2.4 * Math.sin(t1 * DEG)], [2.4 * Math.cos(t2 * DEG), 2.4 * Math.sin(t2 * DEG)], t`A uniform wind over the radar at the origin, and the radar’s radial and around directions at the two azimuths (A at $${t1}^\circ$, B at $${t2}^\circ$). Not to scale.`),
          answer: ans, units: 'm/s', tol: { rel: 0.005, abs: 0.02 },
          errors: [{ value: 0, feedback: 'The wind is the same everywhere, but the radar’s radial direction is not: the recorded component changes.' }].filter((e) => Math.abs(ans) > 0.05),
          hints: [t`The radial component of a uniform wind of speed $v$ toward $\alpha$ is $V^r(\theta) = v\cos(\theta - \alpha)$: the projection on $\partial_r$.`, t`Evaluate $${v}\cos(\theta - ${al}^\circ)$ at both azimuths and subtract.`],
          teach: 'A uniform field has polar components that change with direction; a radar that read that change as a change of wind would invent wind shear.',
          explain: t`$V^r = ${v}\cos(${t2 - al}^\circ) - ${v}\cos(${t1 - al}^\circ) = ${nice(ans, 4)}$ m/s. Meteorologists use exactly this: around a full circle a uniform wind gives a sinusoid of radial velocity (the “velocity–azimuth display”), whose amplitude and phase give the wind’s speed and direction.`,
        };
      },
    }),
    mcq({
      id: 'cp-not-tensor', difficulty: 2,
      prompt: t`For a uniform field, $\partial_\mu V^\nu = 0$ in Cartesian coordinates but $\partial_\theta V^r \ne 0$ in polar coordinates. What does this prove?`,
      visual: fieldPic(0, [2, 1.2], [-1.4, 1.8], 'A uniform field: zero Cartesian derivatives, non-zero polar ones.', true),
      choices: [
        t`$\partial_\mu V^\nu$ is not a tensor: a tensor that is zero in one coordinate system is zero in every one`,
        'The field is not really uniform',
        'Polar coordinates are wrong for this field',
        t`$\partial_\mu V^\nu$ is a tensor, but only of type $(0, 0)$`,
      ],
      answer: 0,
      why: {
        1: 'Every arrow is identical: it is uniform by construction.',
        2: 'Any coordinates are allowed; the problem is the quantity, not the coordinates.',
        3: t`It has two free indices; and a scalar would be zero in every system too.`,
      },
      hints: [t`Under the tensor law each new component is a sum of old components times Jacobians. What do you get if every old component is 0?`],
      teach: 'Zero is coordinate-independent for tensors; a quantity that is zero in one chart but not another is not a tensor.',
      explain: t`The tensor law makes each new component a combination of old ones, so all-zero stays all-zero. $\partial_\mu V^\nu$ breaks this, because of the extra second-derivative term. Lesson A8.3 adds the missing piece and builds the covariant derivative, which is a tensor.`,
    }),
    num({
      id: 'cp-theta-theta', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 4, 5]), th = r.pick([30, 60, 135]);
        const ans = -Math.cos(th * DEG) / R;
        return {
          prompt: t`The uniform field $V = \partial_x$ has polar components $V^r = \cos\theta$ and $V^\theta = -\sin\theta/r$. Find the naive derivative $\partial_\theta V^\theta$ at $(r, \theta) = (${R}, ${th}^\circ)$.`,
          visual: twoPoints(0, R > 3 ? 3 : R, th, th + 60, 'The uniform field and the polar basis at two points of a circle (not to scale).'),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: Math.cos(th * DEG) / R, feedback: t`$\dfrac{d}{d\theta}(-\sin\theta) = -\cos\theta$: check the sign.` }],
          hints: [t`Hold $r$ fixed and differentiate $-\sin\theta/r$ with respect to $\theta$.`],
          teach: 'Naive derivatives of a constant field’s polar components are not zero.',
          explain: t`$\partial_\theta V^\theta = -\cos\theta/r = ${nice(ans, 4)}$ — a non-zero “change” of a field that does not change.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 3 (why the partial derivative is not a tensor)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.3 (differentiation of vectors in polar coordinates)', url: 'https://www.cambridge.org/9780521887052' },
  ],
});
