// Spherical coordinates (physics convention: θ from the +z axis, φ the
// azimuth): the coordinate basis ∂r, ∂θ, ∂φ with lengths 1, r, r sin θ, its
// dual, the singular axis, and the volume element r² sin θ.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;

// a still 3D picture: the sphere through P, its latitude circle and meridian, and k-scaled ∂r, ∂θ, ∂φ at P
function sph3(r, thDeg, phDeg, { k = 0.5, caption, extra = [], basis = true } = {}) {
  const th = thDeg * DEG, ph = phDeg * DEG;
  const st = Math.sin(th), ct = Math.cos(th), sp = Math.sin(ph), cp = Math.cos(ph);
  const P = [r * st * cp, r * st * sp, r * ct].map(r6);
  const add = (v, s = 1) => P.map((p, i) => r6(p + s * v[i]));
  return {
    type: 'calc-vectors3d',
    params: {
      range: Math.max(2, Math.ceil(r + 0.6)),
      yaw: r6((phDeg + 45) * DEG), pitch: 0.42,    // look at P obliquely, so ∂r and ∂φ point opposite ways on screen
      spheres: [{ centre: [0, 0, 0], radius: r6(r), color: 'ink4' }],
      curves: [
        { param: [`${r6(r * st)}*cos(t)`, `${r6(r * st)}*sin(t)`, `${r6(r * ct)}`], t: [0, 6.2832], color: 'teal' },
        { param: [`${r6(r * cp)}*sin(t)`, `${r6(r * sp)}*sin(t)`, `${r6(r)}*cos(t)`], t: [0, 3.1416], color: 'violet' },
      ],
      points: [{ at: P, color: 'ink', label: 'P' }],
      vectors: [
        ...(basis ? [
          { from: P, to: add([st * cp, st * sp, ct]), color: 'accent', label: t`\partial_r` },
          { from: P, to: add([r * ct * cp, r * ct * sp, -r * st], k), color: 'violet', label: k === 1 ? t`\partial_\theta` : t`${k}\,\partial_\theta` },
          { from: P, to: add([-r * st * sp, r * st * cp, 0], k), color: 'teal', label: k === 1 ? t`\partial_\phi` : t`${k}\,\partial_\phi` },
        ] : []),
        ...extra,
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'st-a.A4.4',
  title: 'Spherical coordinates',
  minutes: 12, difficulty: 3,
  intro: t`Spherical coordinates label a point by its distance $r$ from the origin, its **polar angle $\theta$ measured from the $+z$ axis**, and its **azimuth $\phi$** around that axis — the physics convention, used by Carroll and throughout this course: $x = r\sin\theta\cos\phi$, $y = r\sin\theta\sin\phi$, $z = r\cos\theta$. (Many calculus books swap the names $\theta$ and $\phi$ and call the radius $\rho$; always check.) The coordinate basis vectors are the columns of $\partial(x, y, z)/\partial(r, \theta, \phi)$:

$$\partial_r = \hat r, \qquad \partial_\theta = r\,\hat\theta, \qquad \partial_\phi = r\sin\theta\,\hat\phi$$

$\partial_r$ is one unit long and points outward; $\partial_\theta$ points down the meridian (toward $+\theta$, away from the north pole) and is $r$ long; $\partial_\phi$ points east along the circle of constant $\theta$ and is $r\sin\theta$ long — the distance from the $z$ axis. On that axis ($\theta = 0$ or $\pi$) $\partial_\phi$ has zero length: like longitude at the Earth’s poles, the labels fail while the space is perfectly smooth. The three lengths multiply to the volume element $r^2\sin\theta\,dr\,d\theta\,d\phi$.`,
  symbols: [
    { tex: 'r', text: 'distance from the origin (m)' },
    { tex: t`\theta`, text: t`polar angle from the $+z$ axis, $0$ to $\pi$ (radians). On Earth, $\theta = 90^\circ - $ latitude` },
    { tex: t`\phi`, text: t`azimuth around the $z$ axis from the $+x$ axis, $0$ to $2\pi$. On Earth, the longitude` },
    { tex: t`\hat r,\ \hat\theta,\ \hat\phi`, text: 'the unit vectors along the coordinate directions' },
    { tex: t`\partial_r,\ \partial_\theta,\ \partial_\phi`, text: t`the coordinate basis: the steps for a unit change of one coordinate. Lengths $1$, $r$, $r\sin\theta$` },
  ],
  why: t`The Schwarzschild metric of a black hole, the FLRW metric of the universe and the multipole expansion of a gravitational wave are all written in spherical coordinates; their $r^2(d\theta^2 + \sin^2\theta\,d\phi^2)$ is exactly these lengths squared.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Three basis vectors that change with the point',
    lead: t`A point P on a sphere of radius $r$, with its circle of constant $\theta$ (teal) and its meridian (violet). The arrows are $\partial_r$ and half of $\partial_\theta$ and $\partial_\phi$. Move P and watch their lengths in the readout. Drag the picture to turn it.`,
    tasks: [
      t`Slide $\theta$ toward $0^\circ$: the teal circle shrinks to the north pole and $\partial_\phi$ shrinks with it, to zero length at the pole.`,
      t`Increase $r$: $\partial_\theta$ and $\partial_\phi$ grow in proportion; $\partial_r$ stays one unit long.`,
      t`Change $\phi$ alone: all three arrows turn about the $z$ axis, though none of their lengths changes.`,
    ],
    params: {
      range: 3, yaw: r6(125 * DEG), pitch: 0.42,
      sliders: [
        { key: 'rr', label: '$r$', min: 0.5, max: 2.5, step: 0.1, value: 2, explain: 'Distance from the origin.' },
        { key: 'th', label: t`$\theta$ (from $+z$)`, min: 0, max: 180, step: 5, value: 60, unit: '^\\circ', explain: t`The polar angle: $0^\circ$ is the north pole, $90^\circ$ the equator.` },
        { key: 'ph', label: t`$\phi$ (azimuth)`, min: 0, max: 360, step: 5, value: 80, unit: '^\\circ', explain: t`Around the $z$ axis, from the $+x$ axis.` },
      ],
      spheres: [{ centre: [0, 0, 0], radius: 'rr', color: 'ink4' }],
      curves: [
        { param: ['rr*sin(th*pi/180)*cos(t)', 'rr*sin(th*pi/180)*sin(t)', 'rr*cos(th*pi/180)'], t: [0, 6.2832], color: 'teal' },
        { param: ['rr*cos(ph*pi/180)*sin(t)', 'rr*sin(ph*pi/180)*sin(t)', 'rr*cos(t)'], t: [0, 3.1416], color: 'violet' },
      ],
      points: [{ at: ['rr*sin(th*pi/180)*cos(ph*pi/180)', 'rr*sin(th*pi/180)*sin(ph*pi/180)', 'rr*cos(th*pi/180)'], color: 'ink', label: 'P' }],
      vectors: [
        { from: ['rr*sin(th*pi/180)*cos(ph*pi/180)', 'rr*sin(th*pi/180)*sin(ph*pi/180)', 'rr*cos(th*pi/180)'], to: ['(rr + 1)*sin(th*pi/180)*cos(ph*pi/180)', '(rr + 1)*sin(th*pi/180)*sin(ph*pi/180)', '(rr + 1)*cos(th*pi/180)'], color: 'accent', label: t`\partial_r` },
        { from: ['rr*sin(th*pi/180)*cos(ph*pi/180)', 'rr*sin(th*pi/180)*sin(ph*pi/180)', 'rr*cos(th*pi/180)'], to: ['rr*sin(th*pi/180)*cos(ph*pi/180) + 0.5*rr*cos(th*pi/180)*cos(ph*pi/180)', 'rr*sin(th*pi/180)*sin(ph*pi/180) + 0.5*rr*cos(th*pi/180)*sin(ph*pi/180)', 'rr*cos(th*pi/180) - 0.5*rr*sin(th*pi/180)'], color: 'violet', label: t`\tfrac12\partial_\theta` },
        { from: ['rr*sin(th*pi/180)*cos(ph*pi/180)', 'rr*sin(th*pi/180)*sin(ph*pi/180)', 'rr*cos(th*pi/180)'], to: ['rr*sin(th*pi/180)*cos(ph*pi/180) - 0.5*rr*sin(th*pi/180)*sin(ph*pi/180)', 'rr*sin(th*pi/180)*sin(ph*pi/180) + 0.5*rr*sin(th*pi/180)*cos(ph*pi/180)', 'rr*cos(th*pi/180)'], color: 'teal', label: t`\tfrac12\partial_\phi` },
      ],
      readouts: [
        { label: t`$|\partial_r|$`, expr: '1', digits: 3 },
        { label: t`$|\partial_\theta| = r$`, expr: 'rr', digits: 3 },
        { label: t`$|\partial_\phi| = r\sin\theta$`, expr: 'rr*sin(th*pi/180)', digits: 3 },
        { label: t`volume factor $r^2\sin\theta$`, expr: 'rr^2*sin(th*pi/180)', digits: 3 },
      ],
    },
    caption: t`The sphere is drawn as three great circles; teal is the circle of constant $\theta$ through P, violet its meridian (constant $\phi$). $\partial_\theta$ and $\partial_\phi$ are drawn at half length.`,
  },
  example: {
    prompt: t`At $(r, \theta, \phi) = (2, 60^\circ, 45^\circ)$: find $\partial_r$, $\partial_\theta$ and $\partial_\phi$ in Cartesian components with their lengths, and write the constant vector $\partial_z$ in the spherical basis there.`,
    visual: sph3(2, 60, 45, { k: 0.5, extra: [{ from: [r6(2 * Math.sin(60 * DEG) * Math.cos(45 * DEG)), r6(2 * Math.sin(60 * DEG) * Math.sin(45 * DEG)), 1], to: [r6(2 * Math.sin(60 * DEG) * Math.cos(45 * DEG)), r6(2 * Math.sin(60 * DEG) * Math.sin(45 * DEG)), 2], color: 'gold', label: t`\partial_z` }], caption: t`The point $(2, 60^\circ, 45^\circ)$ with $\partial_r$, $\tfrac12\partial_\theta$, $\tfrac12\partial_\phi$ and the Cartesian $\partial_z$ (gold).` }),
    steps: [
      { label: 'Differentiate the position', text: t`From $(x, y, z) = (r\sin\theta\cos\phi, r\sin\theta\sin\phi, r\cos\theta)$: $\partial_r = (\sin\theta\cos\phi, \sin\theta\sin\phi, \cos\theta) = (0.612, 0.612, 0.5)$; $\partial_\theta = r(\cos\theta\cos\phi, \cos\theta\sin\phi, -\sin\theta) = (0.707, 0.707, -1.732)$; $\partial_\phi = r\sin\theta(-\sin\phi, \cos\phi, 0) = (-1.225, 1.225, 0)$.` },
      { label: 'Lengths', text: t`$|\partial_r| = 1$, $|\partial_\theta| = \sqrt{0.5 + 0.5 + 3} = 2 = r$, $|\partial_\phi| = \sqrt{1.5 + 1.5} = 1.732 = r\sin60^\circ$.` },
      { label: 'Components of ∂z', text: t`The dual covectors give them: $V^r = dr(\partial_z) = \cos\theta = 0.5$, $V^\theta = d\theta(\partial_z) = -\sin\theta/r = -0.433$, $V^\phi = d\phi(\partial_z) = 0$ (moving straight up does not change the azimuth).` },
      { label: 'Check', text: t`$0.5\,\partial_r - 0.433\,\partial_\theta = (0.306 - 0.306,\ 0.306 - 0.306,\ 0.25 + 0.75) = (0, 0, 1)$. ✓` },
    ],
    answer: t`$\partial_r = (0.612, 0.612, 0.5)$, $\partial_\theta = (0.707, 0.707, -1.732)$, $\partial_\phi = (-1.225, 1.225, 0)$, of lengths $1, 2, 1.732$; $\partial_z = 0.5\,\partial_r - 0.433\,\partial_\theta$.`,
  },
  practice: [
    num({
      id: 'dphi-length', difficulty: 1,
      gen(r) {
        const [place, lat] = r.pick([['Quito', -0.18], ['Cairo', 30.04], ['London', 51.51], ['Reykjavik', 64.15], ['McMurdo Station', -77.85]]);
        const th = 90 - lat, R = 6371;
        const ans = R * Math.sin(th * DEG);
        return {
          prompt: t`Treat Earth as a sphere of radius 6371 km, with $\theta = 90^\circ - \text{latitude}$ and $\phi$ the longitude. How long is the basis vector $\partial_\phi$ at ${place} (latitude $${lat}^\circ$), in km — that is, how far east is one radian of longitude there?`,
          visual: sph3(1.6, th, 30, { k: 0.5, caption: t`A point at latitude $${lat}^\circ$ ($\theta = ${nice(th, 4)}^\circ$) with its circle of latitude (teal). $\partial_\phi$ runs along that circle; its length is the circle’s radius.` }),
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: R * Math.cos(th * DEG), feedback: t`That uses $\cos\theta$. $|\partial_\phi| = r\sin\theta$: the distance from the axis, which is largest at the equator.` }, { value: R, feedback: t`$r$ is the length of $\partial_\theta$; $\partial_\phi$ is shorter by $\sin\theta$ away from the equator.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$|\partial_\phi| = r\sin\theta$ with $\theta = 90^\circ - ${lat}^\circ = ${nice(th, 4)}^\circ$.`],
          teach: t`$|\partial_\phi| = r\sin\theta$, the radius of the circle of constant $\theta$.`,
          explain: t`$|\partial_\phi| = 6371\sin${nice(th, 4)}^\circ = ${nice(ans, 4)}$ km per radian, or $${nice(ans * DEG, 4)}$ km per degree of longitude.`,
        };
      },
    }),
    num({
      id: 'cart-comp', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]), th = r.pick([30, 60, 120, 150]), ph = r.pick([0, 30, 60, 90, 135]);
        const st = Math.sin(th * DEG), ct = Math.cos(th * DEG), sp = Math.sin(ph * DEG), cp = Math.cos(ph * DEG);
        const opts = [['theta', 'x', R * ct * cp], ['theta', 'z', -R * st], ['phi', 'x', -R * st * sp], ['phi', 'y', R * st * cp], ['theta', 'y', R * ct * sp]].filter((o) => Math.abs(o[2]) > 1e-6);
        const [vec, c, ans] = r.pick(opts);
        const unitVal = vec === 'theta' ? ans / R : ans / (R * st);
        return {
          prompt: t`At $(r, \theta, \phi) = (${R}, ${th}^\circ, ${ph}^\circ)$, what is the $${c}$-component of $\partial_${vec === 'theta' ? '\\theta' : '\\phi'}$?`,
          visual: sph3(R, th, ph, { k: 0.5, caption: t`The point, its circle of constant $\theta$ (teal) and meridian (violet), and the basis (the angular ones at half length).` }),
          answer: r6(ans), tol: { rel: 0.005, abs: 0.002 },
          errors: Math.abs(unitVal - ans) > 0.01 ? [{ value: r6(unitVal), feedback: t`That is a component of the unit vector $\hat${vec === 'theta' ? '\\theta' : '\\phi'}$. The coordinate basis vector is ${vec === 'theta' ? '$r$' : t`$r\sin\theta$`} times longer.` }] : [],
          hints: [vec === 'theta' ? t`$\partial_\theta = \partial(x, y, z)/\partial\theta = (r\cos\theta\cos\phi,\ r\cos\theta\sin\phi,\ -r\sin\theta)$.` : t`$\partial_\phi = \partial(x, y, z)/\partial\phi = (-r\sin\theta\sin\phi,\ r\sin\theta\cos\phi,\ 0)$.`, 'Substitute the numbers; keep the sign of each trigonometric factor.'],
          teach: 'Each coordinate basis vector is the derivative of the position with respect to one coordinate.',
          explain: t`The $${c}$-component is $${nice(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'which-length', difficulty: 1,
      prompt: t`In the physics convention, which coordinate basis vector has length $r\sin\theta$?`,
      visual: sph3(1.8, 50, 30, { k: 0.5, caption: t`The three basis vectors at a point; teal runs along the circle of constant $\theta$, whose radius is $r\sin\theta$.` }),
      choices: [t`$\partial_\phi$`, t`$\partial_\theta$`, t`$\partial_r$`, 'None: all three have length 1'],
      answer: 0,
      why: {
        1: t`$\partial_\theta$ moves along a meridian, a great circle of radius $r$: its length is $r$.`,
        2: t`$\partial_r$ is one unit long: one unit of $r$ is one unit of distance.`,
        3: t`Only the unit vectors $\hat r, \hat\theta, \hat\phi$ have length 1; the coordinate basis vectors carry the scale factors.`,
      },
      hints: [t`Which coordinate moves you around a circle whose radius is the distance from the $z$ axis?`],
      teach: t`$|\partial_r| = 1$, $|\partial_\theta| = r$, $|\partial_\phi| = r\sin\theta$ — the scale factors of spherical coordinates.`,
      explain: t`Changing $\phi$ moves you around the circle of constant $\theta$, of radius $r\sin\theta$; one radian of $\phi$ is that far.`,
    }),
    num({
      id: 'ez', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 4]), th = r.pick([30, 45, 60, 120, 135]);
        const which = r.pick(['r', 'theta']);
        const ans = which === 'r' ? Math.cos(th * DEG) : -Math.sin(th * DEG) / R;
        return {
          prompt: t`At $(r, \theta, \phi) = (${R}, ${th}^\circ, 20^\circ)$, write the Cartesian basis vector $\partial_z$ as $V^r\partial_r + V^\theta\partial_\theta + V^\phi\partial_\phi$. What is ${which === 'r' ? '$V^r$' : t`$V^\theta$`}?`,
          visual: sph3(R, th, 20, { k: 0.5, extra: [{ from: [r6(R * Math.sin(th * DEG) * Math.cos(20 * DEG)), r6(R * Math.sin(th * DEG) * Math.sin(20 * DEG)), r6(R * Math.cos(th * DEG))], to: [r6(R * Math.sin(th * DEG) * Math.cos(20 * DEG)), r6(R * Math.sin(th * DEG) * Math.sin(20 * DEG)), r6(R * Math.cos(th * DEG) + 1)], color: 'gold', label: t`\partial_z` }], caption: t`The spherical basis at the point and the Cartesian $\partial_z$ (gold).` }),
          answer: r6(ans), tol: { rel: 0.005, abs: 0.002 },
          errors: which === 'theta' ? [{ value: r6(-Math.sin(th * DEG)), feedback: t`That is the component along the unit vector $\hat\theta$; along $\partial_\theta$, which is $r$ long, divide by $r$.` }].filter((e) => Math.abs(e.value - ans) > 0.01) : [{ value: r6(Math.sin(th * DEG)), feedback: t`$z = r\cos\theta$, so $dr(\partial_z) = \partial r/\partial z = z/r = \cos\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$V^r = dr(\partial_z) = \partial r/\partial z$ and $V^\theta = d\theta(\partial_z) = \partial\theta/\partial z$.`, t`$\partial r/\partial z = \cos\theta$ and $\partial\theta/\partial z = -\sin\theta/r$.`],
          teach: t`The components of a Cartesian vector in the spherical basis come from the dual covectors $dr$, $d\theta$, $d\phi$.`,
          explain: t`$V^r = \cos${th}^\circ = ${nice(Math.cos(th * DEG), 4)}$, $V^\theta = -\sin${th}^\circ/${R} = ${nice(-Math.sin(th * DEG) / R, 4)}$, $V^\phi = 0$.`,
        };
      },
    }),
    mcq({
      id: 'pole', difficulty: 2,
      prompt: t`At the north pole of a sphere ($\theta = 0$), $\partial_\phi$ has zero length and $\phi$ has no definite value. What does that mean?`,
      visual: sph3(1.8, 8, 30, { k: 0.5, caption: t`A point close to the north pole: its circle of constant $\theta$ is tiny, and $\partial_\phi$ almost vanishes.` }),
      choices: [
        'A coordinate singularity: the labels fail on the z axis, while the space there is perfectly smooth',
        'Space has a sharp point on the z axis',
        'Vectors cannot exist at the pole',
        'The Jacobian determinant is infinite there',
      ],
      answer: 0,
      why: {
        1: 'Use Cartesian coordinates and the pole is an ordinary point.',
        2: 'Any vector exists there; it just cannot be written with ∂φ, which has collapsed.',
        3: t`The determinant $r^2\sin\theta$ is zero there, not infinite: the transformation cannot be inverted.`,
      },
      hints: ['What happens to longitude at the Earth’s North Pole?'],
      teach: 'Where a coordinate basis vector shrinks to zero length, the coordinates — not the space — are singular.',
      explain: t`At $\theta = 0$ every $\phi$ names the same point and $r^2\sin\theta = 0$: the coordinates cannot be inverted. Nothing is wrong with the space — the Road’s step 7 made the same point about the origin of polar coordinates and the horizon of a black hole.`,
    }),
    num({
      id: 'dphi-of-v', difficulty: 2,
      gen(r) {
        const [x, y] = r.pick([[3, 4], [-3, 4], [4, -3], [1, 2], [-2, 1]]), z = r.pick([1, -2, 3]);
        let V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0]), r.int(-2, 2)];
        if (x * V[1] - y * V[0] === 0) V[1] += 1;
        const ans = (x * V[1] - y * V[0]) / (x * x + y * y);
        return {
          prompt: t`At the point $(x, y, z) = (${x}, ${y}, ${z})$, a vector has Cartesian components $(${V.join(', ')})$. Its azimuthal component is $V^\phi = d\phi(V)$, with $d\phi = \dfrac{x\,dy - y\,dx}{x^2 + y^2}$. Find it.`,
          visual: { type: 'calc-vectors3d', params: { range: Math.ceil(Math.max(Math.hypot(x, y), Math.abs(z)) + 1.5), points: [{ at: [x, y, z], color: 'ink', label: 'P' }], vectors: [{ from: [x, y, z], to: [x + V[0], y + V[1], z + V[2]], color: 'gold', label: 'V' }], curves: [{ param: [`${r6(Math.hypot(x, y))}*cos(t)`, `${r6(Math.hypot(x, y))}*sin(t)`, String(z)], t: [0, 6.2832], color: 'teal' }] }, caption: t`The point, its circle around the $z$ axis (teal) and the vector. Only motion along the circle changes $\phi$.` },
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: x * V[1] - y * V[0], feedback: t`Divide by $x^2 + y^2 = ${x * x + y * y}$, the square of the distance from the axis.` }],
          hints: [t`Only $V^x$ and $V^y$ enter: moving parallel to the $z$ axis does not change $\phi$.`, t`$d\phi(V) = \dfrac{(${x})(${V[1]}) - (${y})(${V[0]})}{${x * x + y * y}}$.`],
          teach: t`$d\phi$, like $d\theta$ on the plane, measures how fast the azimuth turns: $(xV^y - yV^x)/(x^2 + y^2)$.`,
          explain: t`$V^\phi = ${nice(ans, 4)}$ (radians per unit of the vector’s parameter). The $z$-component, $${V[2]}$, plays no part.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-component', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3]), th = r.pick([45, 60, 135]), ph = r.pick([30, 120, 210]);
        const ans = -R * Math.sin(th * DEG) * Math.sin(ph * DEG);
        return {
          prompt: t`At $(r, \theta, \phi) = (${R}, ${th}^\circ, ${ph}^\circ)$, what is the $x$-component of $\partial_\phi$?`,
          visual: sph3(R, th, ph, { k: 0.5, caption: t`The point and its spherical basis (angular vectors at half length).` }),
          answer: r6(ans), tol: { rel: 0.005, abs: 0.002 },
          hints: [t`$\partial_\phi = (-r\sin\theta\sin\phi,\ r\sin\theta\cos\phi,\ 0)$.`],
          teach: t`$\partial_\phi = -y\,\partial_x + x\,\partial_y$: the rotation about the $z$ axis.`,
          explain: t`$-${R}\sin${th}^\circ\sin${ph}^\circ = ${nice(ans, 4)}$ — which is $-y$ at the point.`,
        };
      },
    }),
    num({
      id: 'cp-launch', difficulty: 3, transfer: true,
      gen(r) {
        const [site, lat] = r.pick([['Kennedy Space Center', 28.57], ['Baikonur Cosmodrome', 45.96], ['the Guiana Space Centre at Kourou', 5.24], ['Vandenberg Space Force Base', 34.74]]);
        const Om = 7.2921159e-5, R = 6371;
        const th = 90 - lat;
        const v = Om * R * Math.sin(th * DEG) * 1000;
        return {
          prompt: t`Earth turns about its axis at $\Omega = 7.292\times10^{-5}$ rad/s, so a launch pad has velocity $V = \Omega\,\partial_\phi$ in spherical coordinates centred on Earth ($\theta$ from the North Pole, $R = 6371$ km). How fast does the pad at ${site} (latitude $${lat}^\circ$ N) move eastward — the free speed a rocket inherits by launching east — in m/s?`,
          visual: sph3(1.8, th, 20, { k: 0.5, caption: t`Earth (schematic) and the launch site at $\theta = ${nice(th, 4)}^\circ$; the pad moves along $\partial_\phi$ (teal), around its circle of latitude.` }),
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Om * R * 1000, feedback: t`That is the equator’s speed. Away from it, $|\partial_\phi| = R\sin\theta$ is smaller.` }, { value: Om * R * Math.cos(th * DEG) * 1000, feedback: t`$\theta$ is measured from the pole, so the factor is $\sin\theta = \cos(\text{latitude})$, not $\cos\theta$.` }, { value: Om, feedback: t`That is the coordinate component $V^\phi$, in rad/s. The speed is $|V| = \Omega\,|\partial_\phi|$.` }].filter((e) => Math.abs(e.value - v) > 0.01 * v),
          hints: [t`$|V| = \Omega\,|\partial_\phi| = \Omega R\sin\theta$ with $\theta = 90^\circ - ${lat}^\circ$.`, t`Keep $R$ in metres: $6.371\times10^6$ m.`],
          teach: t`A rotation about the $z$ axis is $\Omega\,\partial_\phi$; its speed is $\Omega$ times the length $r\sin\theta$ of $\partial_\phi$.`,
          explain: t`$|V| = 7.292\times10^{-5}\times6.371\times10^6\times\sin${nice(th, 4)}^\circ = ${nice(v, 4)}$ m/s — about ${nice((v / 7800) * 100, 2)}% of the 7.8 km/s needed for low orbit, which is why launch sites sit as close to the equator as politics allows. (Sphere model; the coordinate component is simply $V^\phi = \Omega$.)`,
        };
      },
    }),
    mcq({
      id: 'cp-physical', difficulty: 2,
      prompt: t`A satellite has spherical coordinate components $V^r = 0$, $V^\theta = 0$, $V^\phi = 1.1\times10^{-3}$ rad/s at $r = 7000$ km and $\theta = 90^\circ$. What is its speed?`,
      visual: sph3(1.8, 90, 30, { k: 0.5, caption: t`At the equator, $\theta = 90^\circ$: $\partial_\phi$ is $r$ long.` }),
      choices: ['7.7 km/s', t`$1.1\times10^{-3}$ km/s`, '0 km/s', '7.7 m/s'],
      answer: 0,
      why: {
        1: t`That is $V^\phi$ itself, an angular rate; multiply by $|\partial_\phi| = r\sin\theta$.`,
        2: t`That used $r\cos\theta$, which is 0 at the equator. $|\partial_\phi| = r\sin\theta$, the distance from the axis — here the full $r$.`,
        3: 'Keep the units: 7000 km × 1.1×10⁻³ rad/s is in km/s.',
      },
      hints: [t`$|V| = |V^\phi|\,|\partial_\phi| = V^\phi\,r\sin\theta$.`],
      teach: 'A physical speed is a coordinate component times the length of its basis vector.',
      explain: t`$|V| = 1.1\times10^{-3}\ \text{rad/s}\times7000\ \text{km}\times\sin90^\circ = 7.7$ km/s — a low-orbit speed.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 and ch. 7 (spherical coordinates, the 2-sphere metric)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §6.2', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'IERS Conventions: Earth’s mean angular velocity 7.292 115 × 10⁻⁵ rad/s', url: 'https://www.iers.org/IERS/EN/Science/EarthRotation/UT1LOD.html' },
  ],
});
