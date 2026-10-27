// The simulation gallery: every interactive model in the Atlas, free to play
// with outside a lesson. Each entry is an ordinary visual spec, or names a
// lesson (`lesson: 'math1220.C2-1.2'`) whose Explore visual it shows.

const t = String.raw;

export default [
  { id: 'tangent', title: 'Tangent lines and the derivative', track: 'math', blurb: 'Drag the point; shrink h and watch the secant become the tangent.',
    spec: { type: 'graph', params: { x: [-3.2, 3.2], y: [-2, 3], sliders: [{ key: 'h', label: 'Secant step $h$', min: -1.5, max: 1.5, step: 0.01, value: 1, explain: 'The secant slope $\\frac{f(x_0+h)-f(x_0)}{h}$ approaches the derivative as $h \\to 0$.' }], curves: [{ fn: 'x^3/3 - x + 1', color: 'accent' }], tangent: { fn: 'x^3/3 - x + 1', at: 1.2, secant: 'h' }, readouts: [{ label: 'tangent slope $f\'(x_0)$', expr: 'slope' }, { label: 'secant slope', expr: 'secant' }, { label: '$x_0$', expr: 'x0' }] } } },
  { id: 'riemann', title: 'Riemann sums and the integral', track: 'math', blurb: 'Add rectangles and switch rules; the sum closes in on the exact area.',
    spec: { type: 'graph', params: { x: [-0.3, 3.3], y: [-0.5, 3.5], sliders: [{ key: 'n', label: 'Rectangles $n$', min: 1, max: 60, step: 1, value: 6, explain: 'More, thinner rectangles.' }], choices: [{ key: 'rule', label: 'Rule', options: [['left', 'Left'], ['right', 'Right'], ['mid', 'Midpoint'], ['trap', 'Trapezoid']], value: 'left' }], curves: [{ fn: '1 + sin(2x)/2 + x/3', color: 'accent' }], riemann: { fn: '1 + sin(2x)/2 + x/3', from: 0, to: 3, n: 'n', rule: 'rule' }, readouts: [{ label: 'sum', expr: 'riemann' }, { label: 'exact $\\int_0^3 f\\,dx$', expr: 'integral' }] } } },
  { id: 'taylor', title: 'Taylor polynomials of sin x', track: 'math', blurb: 'Raise the degree and watch the polynomial hug sin x over a wider range.',
    spec: { type: 'graph', params: { x: [-9, 9], y: [-2.5, 2.5], sliders: [{ key: 'n', label: 'Terms $N$', min: 0, max: 10, step: 1, value: 2, explain: 'Sum of $\\frac{(-1)^k x^{2k+1}}{(2k+1)!}$ for $k = 0\\ldots N$ (degree $2N+1$).' }], curves: [{ fn: 'sin(x)', color: 'ink3', width: 1.5 }, { sum: '(-1)^k x^(2k+1)/(2k+1)!', k: [0, 'n'], color: 'gold' }], readouts: [{ label: 'degree', expr: '2n+1' }] } } },
  { id: 'surface', title: 'A saddle, its tangent plane and gradient', track: 'math', blurb: 'Move the point; the gold plane is the best linear approximation and the red arrow points uphill.',
    spec: { type: 'surface3d', params: { z: 'x^2/2 - y^2/2', domain: [[-2, 2], [-2, 2]], tangentAt: ['px', 'py'], levels: 9, sliders: [{ key: 'px', label: '$x_0$', min: -1.8, max: 1.8, step: 0.05, value: 0.9 }, { key: 'py', label: '$y_0$', min: -1.8, max: 1.8, step: 0.05, value: 0.6 }] } } },
  { id: 'field', title: 'Vector fields: divergence, curl and Green’s theorem', track: 'math', blurb: 'Drag the probe; compare the circulation around the loop with the flux of the curl inside it.',
    spec: { type: 'field2d', params: { P: '-y + a*x', Q: 'x + a*y', sliders: [{ key: 'a', label: 'Source strength $a$', min: -1, max: 1, step: 0.05, value: 0.2, explain: 'Adds $a(x, y)$: positive spreads outward (divergence $2a$).' }], loop: { r: 1.2 } } } },
  { id: 'phase', title: 'Phase portrait of a damped oscillator', track: 'math', blurb: 'Click to launch trajectories; change the damping and watch the equilibrium change type.',
    spec: { type: 'phase', params: { fx: 'y', fy: '-x - c*y', sliders: [{ key: 'c', label: 'Damping $c$', min: -0.5, max: 3, step: 0.05, value: 0.4, explain: '$\\ddot x + c\\dot x + x = 0$ written as a system.' }], matrix: [0, 1, -1, 'c'], seeds: [[2.5, 0], [-1, 2]] } } },
  { id: 'slope', title: 'Slope fields and Euler’s method', track: 'math', blurb: 'Drag the start point and change the step; see Euler drift from the true solution.',
    spec: { type: 'phase', params: { slope: true, f: 'y - t^2/4', x: [0, 4], y: [-2, 6], start: [0, 1], h: 0.5 } } },
  { id: 'projectile', title: 'Projectile motion', track: 'physics', blurb: 'Launch speed, angle, height, gravity — with or without air drag.', spec: { type: 'projectile', params: {} } },
  { id: 'cart', title: 'Newton’s second law on a cart', track: 'physics', blurb: 'Force, mass and friction set the slope of the velocity graph.', spec: { type: 'force-cart', params: {} } },
  { id: 'spring', title: 'Damped, driven oscillator', track: 'physics', blurb: 'Energy bars, damping regimes and resonance.', spec: { type: 'oscillator', params: { kind: 'spring', b: 0.3 } } },
  { id: 'pendulum', title: 'The pendulum, exactly', track: 'physics', blurb: 'Large angles slow the pendulum down; compare with the small-angle formula.', spec: { type: 'oscillator', params: { kind: 'pendulum', theta0: 60 } } },
  { id: 'waves', title: 'Waves on a string', track: 'physics', blurb: 'Travelling waves, superposition and standing waves.', spec: { type: 'wave', params: {} } },
  { id: 'ibp', title: 'Integration by parts as areas', track: 'math', blurb: 'Two areas that always add up to uv.', spec: { type: 'ibp-area', params: {} } },
  { id: 'revolve', title: 'Solids of revolution', track: 'math', blurb: 'Sweep a flat region around an axis into a solid; see its disks, washers and shells.', lesson: 'math1220.C2-1.2' },
  { id: 'minkowski', title: 'Minkowski diagram and Lorentz boosts', track: 'gr', blurb: 'Boost the frame; drag events; the interval never changes.', spec: { type: 'spacetime', params: {} } },
  { id: 'twins', title: 'Proper time and the twin paradox', track: 'gr', blurb: 'The straight worldline ages the most.', spec: { type: 'worldlines', params: {} } },
  { id: 'orbit', title: 'Orbits around a black hole', track: 'gr', blurb: 'Newton versus Einstein: precession, the ISCO and plunging orbits.', spec: { type: 'orbit', params: {} } },
].map((g) => ({ ...g, blurb: t`${g.blurb}` }));
