// Symbols, simplification and solving — SymPy as a check on hand algebra:
// symbols with assumptions, exact rationals, simplify(a − b) == 0, solve and
// nsolve; the Schwarzschild effective potential and its innermost stable
// circular orbit (a nod to gr.S21), the Atwood machine, the geostationary radius.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';

const t = String.raw;

const GM_SUN = 1.32712440018e20, C = 299792458;
const M_SUN_LEN = GM_SUN / C ** 2;                      // m: GM☉/c², half the Sun's Schwarzschild radius
const GM_E = 3.986004418e14, T_SID = 86164.0905;        // m³/s²; s, one sidereal day
const A_GEO = Math.cbrt((GM_E * T_SID ** 2) / (4 * Math.PI ** 2));

// the effective potential (G = c = 1, M = 1) for graphs
const Vexpr = (L) => `-1/x + ${L * L / 2}/x^2 - ${L * L}/x^3`;

export default lesson({
  id: 'prog.P5.1',
  title: 'Symbols, simplification and solving',
  minutes: 11, difficulty: 2,
  intro: t`SymPy does algebra with **symbols** instead of numbers. It keeps $\sqrt 2$ as $\sqrt 2$ and $\tfrac13$ as $\tfrac13$, so its answers are exact — which makes it the ideal **check on hand algebra**: if \`sp.simplify(mine - theirs)\` is \`0\`, the two forms agree for every value of the symbols.

The workflow is short: declare symbols, saying what you know about them (\`positive=True\`); build an expression; then \`simplify\`, \`expand\`, \`factor\` or \`solve\` it. A nod to the Road to Einstein: around a black hole of mass $M$, an orbiting body with angular momentum $L$ per unit mass moves in the effective potential (with $G = c = 1$)

$$V(r) = -\frac{M}{r} + \frac{L^2}{2r^2} - \frac{ML^2}{r^3}$$

Circular orbits sit where $V'(r) = 0$, and \`sp.solve\` finds them — and the radius below which there are none.`,
  symbols: [
    { tex: 'V(r)', text: 'the effective potential per unit mass of the orbiting body; with $G = c = 1$ it is a pure number' },
    { tex: 'r', text: 'the Schwarzschild radial coordinate (circumference of a circle around the hole divided by $2\\pi$), in units of length' },
    { tex: 'M', text: 'the black hole’s mass, measured as a length $GM/c^2$ (1.48 km for the Sun’s mass)' },
    { tex: 'L', text: 'the orbiting body’s angular momentum per unit mass, also a length when $c = 1$' },
    { tex: t`-\frac{ML^2}{r^3}`, text: 'the term general relativity adds to Newton’s $-M/r + L^2/2r^2$; it wins at small $r$ and removes the inner circular orbits' },
    { tex: t`\texttt{sp.symbols("r M L", positive=True)}`, text: 'three symbols that SymPy may assume are real and positive — which decides how far it can simplify' },
  ],
  why: 'From checking a derivation to producing the exact formula a simulation will use, computer algebra catches the slips hand algebra hides.',
  visual: {
    type: 'code-runner',
    title: 'Circular orbits around a black hole, solved exactly',
    lead: t`Press **Run** (SymPy loads the first time). The program differentiates $V$, solves $V' = 0$ for the circular orbits, solves $V' = V'' = 0$ for the innermost stable one, and plots $V$ for four angular momenta with \`lambdify\`, which turns a formula into a NumPy function.`,
    tasks: [
      'Read the two roots: they are real only when L² ≥ 12M², so for smaller L there is no circular orbit at all (the blue curve has no dip).',
      'Remove `positive=True` and run again: `solve` must now allow negative and complex values, and the answers change.',
      'Add `print(sp.latex(sp.factor(dV)))` to get the result as TeX for a report.',
    ],
    params: {
      rows: 26,
      code: t`import numpy as np
import sympy as sp
import matplotlib.pyplot as plt

# Schwarzschild effective potential per unit mass, G = c = 1
r, M, L = sp.symbols("r M L", positive=True)
V = -M/r + L**2/(2*r**2) - M*L**2/r**3

dV = sp.diff(V, r)
print("V'(r) =", sp.factor(dV))
print("circular orbits at r =", sp.solve(dV, r))
print("innermost stable orbit:", sp.solve([dV, sp.diff(V, r, 2)], [r, L], dict=True))

# the formula as a NumPy function, for plotting (M = 1)
V_num = sp.lambdify((r, L), V.subs(M, 1), "numpy")
rr = np.linspace(2.2, 30, 600)
fig, ax = plt.subplots()
for L_val in [3.2, 2 * np.sqrt(3), 4.0, 4.4]:
    ax.plot(rr, V_num(rr, L_val), label=f"L = {L_val:.2f} M")
ax.axvline(6, ls=":", color="0.6")
ax.set_ylim(-0.12, 0.03)
ax.set_xlabel("r (units of M)")
ax.set_ylabel("V(r)")
ax.legend()
plt.show()`,
    },
    caption: 'The effective potential of a non-spinning (Schwarzschild) black hole, with G = c = 1. A minimum of V is a stable circular orbit, a maximum an unstable one; at L = 2√3 M they merge at r = 6M (dotted). Spinning black holes move this radius.',
  },
  example: {
    prompt: t`Use SymPy to find where circular orbits can exist around a black hole of mass $M$, given $V(r)$ above. Check your hand-computed $V'(r)$ first, then find the smallest $L$ for which a circular orbit exists and its radius.`,
    visual: {
      type: 'graph',
      params: { x: [2, 24], y: [-0.11, 0.02], aspect: 'wide', axesAt: 'edge', xlabel: 'r (units of M)', ylabel: 'V(r)',
        curves: [{ fn: Vexpr(4), color: 'good', domain: [2.4, 24], label: 'L = 4M', labelAt: 18, labelDy: -12 },
          { fn: Vexpr(2 * Math.sqrt(3)), color: 'gold', domain: [2.4, 24], label: 'L = 2√3 M', labelAt: 18, labelDy: 16 }],
        points: [{ x: 6, y: -1 / 18, color: 'gold', r: 4.5, label: 'r = 6M', labelDx: 8, labelDy: 16 }, { x: 12, y: -1 / 27, color: 'good', r: 4, label: 'stable', labelDx: -10, labelDy: -14 }, { x: 4, y: 0, color: 'bad', r: 4, label: 'unstable', labelDx: 8, labelDy: -4 }] },
      caption: 'With L = 4M the potential has a maximum (unstable orbit, r = 4M) and a minimum (stable, r = 12M). At L = 2√3 M the two merge into an inflection at r = 6M: the innermost stable circular orbit. Non-spinning black hole, G = c = 1.',
    },
    steps: [
      { label: 'Declare the symbols', text: t`All three are positive lengths. Saying so lets SymPy simplify $\sqrt{r^2}$ to $r$ and discard negative roots.

\`\`\`python
import sympy as sp
r, M, L = sp.symbols("r M L", positive=True)
V = -M/r + L**2/(2*r**2) - M*L**2/r**3
\`\`\`` },
      { label: 'Check the hand work', text: t`By hand, $V'(r) = \dfrac{M}{r^2} - \dfrac{L^2}{r^3} + \dfrac{3ML^2}{r^4}$. Comparing forms with \`==\` would test whether they are *written* the same way; subtracting and simplifying tests whether they are *equal*:

\`\`\`python
mine = M/r**2 - L**2/r**3 + 3*M*L**2/r**4
print(sp.simplify(sp.diff(V, r) - mine))    # 0: the hand result is right
\`\`\`` },
      { label: 'Solve for the orbits', text: t`Setting $V' = 0$ and clearing $r^4$ gives the quadratic $Mr^2 - L^2 r + 3ML^2 = 0$, and \`solve\` returns both roots as a list:

\`\`\`python
roots = sp.solve(mine, r)
# [L**2/(2*M) - L*sqrt(L**2 - 12*M**2)/(2*M),
#  L**2/(2*M) + L*sqrt(L**2 - 12*M**2)/(2*M)]
\`\`\`

The outer root is the stable orbit (a minimum of $V$), the inner one unstable.` },
      { label: 'Where they merge', text: t`The roots are real only while $L^2 - 12M^2 \ge 0$. At the boundary they coincide:

\`\`\`python
L_min = sp.solve(L**2 - 12*M**2, L)[0]      # 2*sqrt(3)*M
print(roots[0].subs(L, L_min))              # 6*M
\`\`\`

So no circular orbit exists for $L < 2\sqrt3\,M$, and the innermost stable one is at $r = 6M$.` },
      { label: 'Sense check', text: t`For $L \gg M$ the outer root becomes $L^2/M - 3M + \ldots$ (\`sp.series(roots[1], L, sp.oo, 2)\`), and $r = L^2/M$ is Newton's circular orbit: GR only corrects it. In SI units the ISCO is $6GM/c^2$: $${(6 * M_SUN_LEN / 1e3).toFixed(1)}$ km for one solar mass — deep inside the Sun, which is why only black holes and neutron stars have one outside their surface.` },
    ],
    answer: t`Circular orbits exist only for $L \ge 2\sqrt3\,M$; the innermost stable one is at $r = 6M$, three Schwarzschild radii.`,
  },
  practice: [
    mcq({
      id: 'sqrt-assume', difficulty: 2,
      prompt: t`Why does SymPy refuse to simplify this to \`x\`?

\`\`\`python
x = sp.symbols("x")
print(sp.sqrt(x**2))       # sqrt(x**2)
\`\`\``,
      choices: [
        '$x$ might be negative (or complex), and then $\\sqrt{x^2} = \\lvert x\\rvert \\ne x$; declare `positive=True` and it prints `x`',
        'SymPy simplifies only when you call `sp.simplify`',
        'Square roots are always left alone, because they are irrational',
        'It needs `x = sp.symbols("x", integer=True)` first',
      ],
      answer: 0,
      why: {
        1: '`sp.simplify(sp.sqrt(x**2))` also leaves it alone: no rule can turn it into x when x = −3 is allowed.',
        2: 'SymPy happily simplifies `sp.sqrt(4)` to 2 and `sp.sqrt(y**2)` to y for a positive y.',
        3: 'Negative integers are integers: √((−3)²) = 3, not −3.',
      },
      hints: ['Try x = −3 in your head: what is √(x²)?', 'SymPy may only make a simplification that is true for every allowed value of x.'],
      teach: 'SymPy only simplifies when the result holds for every value the symbol may take, so state what you know: `positive=True`, `real=True`.',
      explain: t`For $x = -3$, $\sqrt{x^2} = 3 = \lvert x\rvert$. With no assumptions $x$ may even be complex, so SymPy leaves the expression alone. \`x = sp.symbols("x", positive=True)\` makes \`sp.sqrt(x**2)\` print \`x\`. Physical quantities like masses, radii and times are positive: say so.`,
    }),
    mcq({
      id: 'float-third', difficulty: 2,
      prompt: t`What does this print, and why?

\`\`\`python
x = sp.symbols("x")
print(x + 1/3)
\`\`\``,
      choices: [
        '`x + 0.333333333333333`: Python computes `1/3` as a float before SymPy sees it; write `sp.Rational(1, 3)`',
        '`x + 1/3`: SymPy keeps fractions exact',
        '`x + 0.3333333333333333`, and SymPy converts it back to 1/3 when you simplify',
        'A `TypeError`: a float cannot be added to a symbol',
      ],
      answer: 0,
      why: {
        1: 'SymPy never sees the fraction: `1/3` is evaluated by Python first. `x/3` or `sp.Rational(1, 3) + x` stay exact.',
        2: 'A float that has entered an expression stays a float; simplify does not guess which fraction it came from (`sp.nsimplify` can, on request).',
        3: 'SymPy accepts floats in expressions — which is why this slip is silent.',
      },
      hints: ['Python evaluates `1/3` first, then adds the result to x.', 'What type is `1/3` in plain Python?'],
      teach: 'A plain `1/3` is a float before SymPy sees it; use `sp.Rational(1, 3)`, `sp.S(1)/3`, or put a symbol first (`x/3`) to keep it exact.',
      explain: t`\`1/3\` is Python's float 0.333…, so the expression holds a 15-digit decimal and every later result inherits its rounding. \`x + sp.Rational(1, 3)\` prints \`x + 1/3\`. The same trap hides in \`x**(1/2)\` (use \`sp.sqrt(x)\`) and in \`0.5*m*v**2\` (use \`m*v**2/2\`).`,
    }),
    num({
      id: 'count-roots', difficulty: 2,
      gen(r) {
        const [n, c] = r.pick([[3, 8], [4, 16], [5, 32], [6, 64], [4, 81], [3, 27]]);
        const [assume, decl] = r.pick([['', 'sp.symbols("x")'], ['real', 'sp.symbols("x", real=True)'], ['positive', 'sp.symbols("x", positive=True)']]);
        const count = assume === '' ? n : assume === 'real' ? (n % 2 ? 1 : 2) : 1;
        const root = Math.round(c ** (1 / n));
        return {
          prompt: t`How many solutions does SymPy return?

\`\`\`python
x = ${decl}
print(len(sp.solve(x**${n} - ${c}, x)))
\`\`\``,
          visual: {
            type: 'graph',
            params: { x: [-root - 1.5, root + 1.5], y: [-c * 1.4, c * 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: `x^${n} − ${c}`.replace('^' + n, String(n).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')),
              curves: [{ fn: `x^${n} - ${c}`, color: 'accent' }] },
            caption: 'The polynomial on the real line: its real roots are where it crosses zero. A symbol with no assumptions may also be complex.',
          },
          answer: count, tol: { rel: 0, abs: 0.4 },
          errors: [
            ...(count !== n ? [{ value: n, feedback: `That counts every complex root. The symbol was declared ${assume}, which rules some out.` }] : []),
            ...(count !== (n % 2 ? 1 : 2) ? [{ value: n % 2 ? 1 : 2, feedback: 'That counts the real roots only — but this symbol has no assumptions, so SymPy also returns complex ones.' }] : []),
          ],
          hints: [`A polynomial of degree ${n} has ${n} roots in the complex numbers.`, assume === '' ? 'With no assumptions SymPy returns every complex root.' : `The assumption ${assume}=True removes every root that is not ${assume}.`],
          teach: '`sp.solve` returns every solution the assumptions allow: all complex roots for a plain symbol, only real (or positive) ones when you declare them.',
          explain: t`$x^{${n}} = ${c}$ has ${n} complex roots: $${root}e^{2\pi i k/${n}}$ for $k = 0, \ldots, ${n - 1}$. ${assume === '' ? `With no assumptions SymPy returns all ${n}.` : assume === 'real' ? `Real ones: ${n % 2 ? `only $${root}$` : `$\\pm ${root}$`}, so ${count}.` : `Only $${root}$ is positive, so 1.`} Declaring \`positive=True\` for a radius or a mass saves you from picking the physical root out of a list.`,
        };
      },
    }),
    code({
      id: 'atwood', difficulty: 2,
      prompt: t`An Atwood machine hangs masses $m_1 > m_2$ over a light, frictionless pulley. Newton's second law for each mass gives

$$m_1 g - T = m_1 a, \qquad T - m_2 g = m_2 a$$

Solve the pair with SymPy for the acceleration $a$ and the tension $T$. Set \`a_sol\` and \`T_sol\` to the two expressions, and set \`same\` to \`True\` or \`False\` by checking with \`sp.simplify\` whether your result for \`T_sol\` equals the textbook's $\dfrac{2m_1m_2 g}{m_1 + m_2}$.`,
      starter: t`import sympy as sp

m1, m2, g, a, T = sp.symbols("m1 m2 g a T", positive=True)
eq1 = sp.Eq(m1*g - T, m1*a)
eq2 = sp.Eq(T - m2*g, m2*a)

a_sol = None
T_sol = None
same = None
`,
      answer: t`import sympy as sp

m1, m2, g, a, T = sp.symbols("m1 m2 g a T", positive=True)
eq1 = sp.Eq(m1*g - T, m1*a)
eq2 = sp.Eq(T - m2*g, m2*a)

sol = sp.solve([eq1, eq2], [a, T], dict=True)[0]
a_sol, T_sol = sol[a], sol[T]
same = sp.simplify(T_sol - 2*m1*m2*g/(m1 + m2)) == 0
print(a_sol, T_sol, same)`,
      tests: [
        { name: t`$a = g\,(m_1 - m_2)/(m_1 + m_2)$`, code: 'sp.simplify(a_sol - g*(m1 - m2)/(m1 + m2)) == 0' },
        { name: t`$T$ solves both equations`, code: 'sp.simplify((m1*g - T_sol) - m1*a_sol) == 0 and sp.simplify((T_sol - m2*g) - m2*a_sol) == 0' },
        { name: 'the check against the textbook comes out True', code: 'same is True or same == sp.true' },
      ],
      hints: ['`sp.solve([eq1, eq2], [a, T], dict=True)` returns a list of dicts; take the first and read `sol[a]` and `sol[T]`.', 'Then `same = sp.simplify(T_sol - 2*m1*m2*g/(m1 + m2)) == 0`.'],
      teach: '`sp.solve([eq1, eq2], [x, y], dict=True)` solves a system; `sp.simplify(mine - theirs) == 0` tests that two forms agree.',
      explain: t`SymPy returns $a = \dfrac{g(m_1 - m_2)}{m_1 + m_2}$ and $T = \dfrac{2gm_1m_2}{m_1 + m_2}$. Sense checks: equal masses give $a = 0$ and $T = mg$; a vanishing $m_2$ gives free fall and no tension. With \`dict=True\` each solution is a dictionary, so you never depend on the order SymPy happens to list the unknowns in.`,
    }),
    mcq({
      id: 'transcendental', difficulty: 2,
      prompt: t`The bright fringes beside the central peak of single-slit diffraction lie where $\tan x = x$. What happens?

\`\`\`python
x = sp.symbols("x")
sp.solve(sp.tan(x) - x, x)
\`\`\``,
      choices: [
        '`NotImplementedError`: there is no formula for the roots; `sp.nsolve(sp.tan(x) - x, x, 4.5)` finds one numerically (4.4934…)',
        'It returns every root as an exact expression',
        'It returns `[0]` and misses the rest silently',
        'It hangs forever',
      ],
      answer: 0,
      why: {
        1: 'An equation mixing x with tan x has no closed-form roots; SymPy says so instead of pretending.',
        2: 'SymPy raises an error here rather than returning a partial answer. Still, check any list `solve` returns: for some equations it can miss solutions.',
        3: 'It gives up quickly with an explanation.',
      },
      hints: ['Can you solve tan x = x with algebra?', 'For equations with no formula, SymPy offers a numerical root-finder that needs a starting guess.'],
      teach: '`solve` finds closed forms; when there is none, `nsolve(expr, x, guess)` finds a root numerically near a starting guess.',
      explain: t`SymPy raises \`NotImplementedError: … No algorithms are implemented to solve equation -x + tan(x)\`. \`sp.nsolve(sp.tan(x) - x, x, 4.5)\` returns 4.49340945790906, the first fringe ($x = \pi a\sin\theta/\lambda$). Numerical root-finding gets its own lesson later in the course.`,
    }),
    mcq({
      id: 'subs-immutable', difficulty: 1,
      prompt: t`What does the last line print?

\`\`\`python
x = sp.symbols("x")
E = x**2 + 1
E.subs(x, 3)
print(E)
\`\`\``,
      choices: ['`x**2 + 1`: `subs` returns a new expression and leaves `E` unchanged', '`10`', '`x**2 + 1 = 10`', '`3**2 + 1`'],
      answer: 0,
      why: {
        1: 'That is what `E.subs(x, 3)` *returns* — but the result was not stored.',
        2: 'SymPy never prints an equation like that from `subs`.',
        3: 'SymPy evaluates numbers at once: substituting 3 gives the integer 10.',
      },
      hints: ['Like Python strings, SymPy expressions are immutable.', 'Was the result of `E.subs(x, 3)` stored anywhere?'],
      teach: 'SymPy expressions never change in place: write `E3 = E.subs(x, 3)` to keep the result.',
      explain: t`\`E.subs(x, 3)\` builds and returns 10, which is thrown away; \`E\` itself is still $x^2 + 1$. Write \`value = E.subs(x, 3)\` — or for many numbers at once, \`f = sp.lambdify(x, E)\` and call \`f(np.linspace(0, 1, 100))\`.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-geo', difficulty: 2, transfer: true,
      prompt: t`A geostationary satellite orbits once per **sidereal** day, $T = ${T_SID}$ s. With SymPy, solve Kepler's third law $T^2 = 4\pi^2 a^3/(GM)$ for the orbit radius $a$ (declare the symbols positive, so there is one root). Set \`a_expr\` to the solution, then substitute $GM = 3.986004418\times10^{14}\ \text{m}^3/\text{s}^2$ and $T$ and set \`a_geo_km\` to the radius in kilometres, as a float.`,
      starter: t`import sympy as sp

a, T, GM = sp.symbols("a T GM", positive=True)

a_expr = None
a_geo_km = None
`,
      answer: t`import sympy as sp

a, T, GM = sp.symbols("a T GM", positive=True)

a_expr = sp.solve(sp.Eq(T**2, 4*sp.pi**2*a**3/GM), a)[0]
a_geo_km = float(a_expr.subs({GM: 3.986004418e14, T: ${T_SID}})) / 1e3
print(a_expr, a_geo_km)`,
      tests: [
        { name: t`\`a_expr\` is $\left(GM\,T^2/4\pi^2\right)^{1/3}$`, code: 'sp.simplify(a_expr - (GM*T**2/(4*sp.pi**2))**sp.Rational(1, 3)) == 0' },
        { name: t`the geostationary radius is ${A_GEO / 1e3 > 0 ? (A_GEO / 1e3).toFixed(0) : ''} km`, code: `isinstance(a_geo_km, float) and abs(a_geo_km - ${A_GEO / 1e3}) < 0.01` },
      ],
      hints: ['`sp.solve(sp.Eq(T**2, 4*sp.pi**2*a**3/GM), a)` returns a list with one element when the symbols are positive.', 'Substitute with a dictionary, `a_expr.subs({GM: …, T: …})`, convert with `float(...)`, and divide by 1000.'],
      teach: 'Solve symbolically once, then substitute numbers: the formula stays checkable and the number traceable.',
      explain: t`$a = \left(GMT^2/4\pi^2\right)^{1/3} = ${(A_GEO / 1e3).toFixed(1)}$ km from Earth's centre, or ${((A_GEO - 6378.137e3) / 1e3).toFixed(0)} km above the equator (equatorial radius 6378 km). Using the 86 400 s solar day instead would put the satellite ${((Math.cbrt((GM_E * 86400 ** 2) / (4 * Math.PI ** 2)) - A_GEO) / 1e3).toFixed(0)} km too high, and it would drift west by about a degree a day.`,
    }),
    mcq({
      id: 'cp-equality', difficulty: 2,
      prompt: t`Which line reliably checks that a hand result \`mine\` equals SymPy's \`theirs\`?

\`\`\`python
x = sp.symbols("x")
mine = x**2 + 2*x + 1
theirs = (x + 1)**2
\`\`\``,
      choices: ['`sp.simplify(mine - theirs) == 0`', '`mine == theirs`', '`str(mine) == str(theirs)`', '`mine.subs(x, 1) == theirs.subs(x, 1)`'],
      answer: 0,
      why: {
        1: 'In SymPy `==` tests whether two expressions are *written* identically. Here it prints `False` although they are equal.',
        2: 'The printed forms differ, so this says False too.',
        3: 'Agreement at one point proves little: x² + 1 and 2x also agree at x = 1.',
      },
      hints: ['What does `==` compare for SymPy objects: values or structure?', 'Two expressions are equal when their difference simplifies to zero.'],
      teach: 'SymPy’s `==` compares structure, not mathematical value; test equality with `sp.simplify(a - b) == 0` (or `a.equals(b)`).',
      explain: t`\`mine == theirs\` is \`False\`: one is a sum, the other a power. \`sp.simplify(mine - theirs)\` reduces the difference to \`0\`, which proves equality for every $x$. For very complicated expressions \`simplify\` can fail to find the 0; then also compare the two numerically at a few random points.`,
    }),
    num({
      id: 'cp-isco-km', difficulty: 2, transfer: true,
      gen(r) {
        const [name, m, note] = r.pick([['Cygnus X-1, the first black hole identified (about 21.2 solar masses)', 21.2, 'Cygnus X-1 spins fast, which moves its real innermost orbit well inside this.'],
          ['the black hole left by the first gravitational-wave merger, GW150914 (about 62 solar masses)', 62, 'That remnant spins (spin parameter about 0.7), which moves its real innermost orbit inward.'],
          ['Sagittarius A*, at the centre of the Milky Way (about 4.3 million solar masses)', 4.3e6, 'That is about a quarter of Earth’s distance from the Sun.']]);
        const km = (6 * m * M_SUN_LEN) / 1e3;
        return {
          prompt: t`The innermost stable circular orbit sits at $r = 6M$ in units with $G = c = 1$, that is $r = 6GM/c^2$. Taking the black hole as non-spinning, how far out is it for ${name}? Use $GM_\odot/c^2 = ${(M_SUN_LEN / 1e3).toFixed(4)}$ km.`,
          visual: {
            type: 'graph',
            params: { x: [2, 20], y: [-0.1, 0.0], aspect: 'wide', axesAt: 'edge', xlabel: 'r (units of GM/c²)', ylabel: 'V(r)',
              curves: [{ fn: Vexpr(2 * Math.sqrt(3)), color: 'gold', domain: [2.6, 20] }],
              vlines: [{ x: 6, label: '6M', color: 'gold' }, { x: 2, label: '', color: 'ink3' }] },
            caption: 'The effective potential at L = 2√3 M: the flat inflection at r = 6M is the innermost stable circular orbit. Distances are in units of GM/c².',
          },
          answer: km, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: km / 3, feedback: 'That is 2GM/c², the Schwarzschild radius (the horizon). The ISCO is three times farther out.' }, { value: km / 6, feedback: 'That is GM/c², one unit of M. Multiply by 6.' }],
          hints: ['Convert the mass to a length: M = (mass in solar masses) × 1.4766 km.', 'Then multiply by 6.'],
          teach: 'With G = c = 1 a mass is a length, GM/c² (1.48 km per solar mass), so “6M” converts to kilometres in one multiplication.',
          explain: t`$6 \times ${m >= 1e5 ? tex(m) : m} \times ${(M_SUN_LEN / 1e3).toFixed(4)}\ \text{km} = ${km >= 1e5 ? tex(km) : km.toFixed(0)}$ km, three times the horizon radius $2GM/c^2$. ${note}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'SymPy tutorial: Simplification, Solvers, Gotchas', url: 'https://docs.sympy.org/latest/tutorials/intro-tutorial/index.html' },
    { label: 'Carroll, Spacetime and Geometry, §5.4: geodesics of Schwarzschild', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
