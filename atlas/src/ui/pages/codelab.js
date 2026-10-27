// The code lab: real Python in the browser (Pyodide), with SymPy, mpmath and
// the atlas.plot bridge. Programs run in a worker; Stop really stops them.

import { h, icon } from '../dom.js';
import { run, stop, start, onStatus, pythonInfo } from '../../lab/python.js';
import { renderFigures } from '../../lab/figures.js';

const EXAMPLES = {
  orbit: ['Orbit with Euler vs. symplectic Euler', `# A planet orbiting the Sun (units: AU, years; GM = 4π²).
# Euler's method lets the orbit spiral outward; symplectic Euler keeps it closed.
import math
import atlas.plot as plt

GM = 4 * math.pi**2

def simulate(method, dt=0.01, steps=1000):
    x, y, vx, vy = 1.0, 0.0, 0.0, 2 * math.pi
    xs, ys = [], []
    for _ in range(steps):
        r3 = (x*x + y*y) ** 1.5
        ax, ay = -GM * x / r3, -GM * y / r3
        if method == "euler":
            x, y, vx, vy = x + vx*dt, y + vy*dt, vx + ax*dt, vy + ay*dt
        else:  # symplectic Euler: update velocity first, then position with the new velocity
            vx, vy = vx + ax*dt, vy + ay*dt
            x, y = x + vx*dt, y + vy*dt
        xs.append(x); ys.append(y)
    return xs, ys

for m in ["euler", "symplectic"]:
    xs, ys = simulate(m)
    plt.plot(xs, ys, label=m)
    print(m, "final radius:", round(math.hypot(xs[-1], ys[-1]), 4), "AU")
plt.xlabel("x (AU)"); plt.ylabel("y (AU)"); plt.title("Ten years of orbit"); plt.legend(); plt.show()
`],
  sympy: ['SymPy: derivatives, integrals, series', `from sympy import symbols, diff, integrate, series, sin, cos, exp, simplify, sqrt, oo

x = symbols('x')
print("d/dx [x² sin x] =", diff(x**2 * sin(x), x))
print("∫ x cos x dx   =", integrate(x * cos(x), x))
print("∫₀^∞ x e^(−x) dx =", integrate(x * exp(-x), (x, 0, oo)))
print("√(1 − x²) ≈", series(sqrt(1 - x**2), x, 0, 6))

# relativistic kinetic energy, expanded at low speed: KE = (γ − 1) m c²
v, c, m = symbols('v c m', positive=True)
KE = (1 / sqrt(1 - v**2 / c**2) - 1) * m * c**2
print("KE ≈", series(KE, v, 0, 6))
`],
  simpson: ['Simpson’s rule and its error', `import math
import atlas.plot as plt

def simpson(f, a, b, n):
    h = (b - a) / n
    s = f(a) + f(b)
    for i in range(1, n):
        s += (4 if i % 2 else 2) * f(a + i*h)
    return s * h / 3

exact = 2.0   # ∫₀^π sin x dx
ns, errs = [], []
for k in range(1, 9):
    n = 2**k
    err = abs(simpson(math.sin, 0, math.pi, n) - exact)
    ns.append(math.log10(n)); errs.append(math.log10(err))
    print(f"n = {n:4d}   error = {err:.3e}")
plt.plot(ns, errs, label="Simpson")
plt.xlabel("log10 n"); plt.ylabel("log10 error"); plt.title("Error falls like n^-4"); plt.legend(); plt.show()
`],
  pendulum: ['Pendulum: small-angle vs. exact (RK4)', `import math
import atlas.plot as plt

g, L = 9.81, 1.0
def rk4(theta0, T=6.0, dt=0.002):
    th, w, t = theta0, 0.0, 0.0
    ts, ths = [0.0], [th]
    f = lambda th, w: (w, -g / L * math.sin(th))
    while t < T:
        k1 = f(th, w)
        k2 = f(th + dt/2*k1[0], w + dt/2*k1[1])
        k3 = f(th + dt/2*k2[0], w + dt/2*k2[1])
        k4 = f(th + dt*k3[0], w + dt*k3[1])
        th += dt/6*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0])
        w  += dt/6*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1])
        t += dt
        ts.append(t); ths.append(th)
    return ts, ths

theta0 = math.radians(60)
ts, ths = rk4(theta0)
plt.plot(ts, [math.degrees(a) for a in ths], label="exact (RK4)")
plt.plot(ts, [math.degrees(theta0 * math.cos(math.sqrt(g/L) * t)) for t in ts], label="small-angle", style="--")
plt.xlabel("t (s)"); plt.ylabel("angle (degrees)"); plt.legend(); plt.show()
print("Small-angle period:", round(2*math.pi*math.sqrt(L/g), 4), "s — the 60° pendulum is about 7% slower.")
`],
};

export function render(main) {
  const code = h('textarea', { spellcheck: 'false', 'aria-label': 'Python code', autocapitalize: 'off', autocomplete: 'off' });
  code.value = sessionStorage.getItem('atlas:lab') || EXAMPLES.orbit[1];
  const out = h('div.code-out', { 'aria-live': 'polite' });
  const plots = h('div.code-plot');
  const statusLine = h('span.small.faint', 'Python starts when you press Run.');
  const runBtn = h('button.btn.primary', { type: 'button', onclick: go, html: `${icon('play')}Run` });
  const stopBtn = h('button.btn', { type: 'button', onclick: () => stop(), disabled: true }, 'Stop');
  const pick = h('select', { 'aria-label': 'Load an example', onchange: (e) => { if (EXAMPLES[e.target.value]) { code.value = EXAMPLES[e.target.value][1]; save(); } e.target.value = ''; } },
    h('option', { value: '' }, 'Examples…'), Object.entries(EXAMPLES).map(([k, [label]]) => h('option', { value: k }, label)));
  const save = () => { try { sessionStorage.setItem('atlas:lab', code.value); } catch { /* ignore */ } };
  code.addEventListener('input', save);
  code.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { e.preventDefault(); const a = code.selectionStart, b = code.selectionEnd; code.value = code.value.slice(0, a) + '    ' + code.value.slice(b); code.selectionStart = code.selectionEnd = a + 4; }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); }
  });
  const unsub = onStatus((s) => { statusLine.textContent = s.text; statusLine.style.color = s.state === 'error' ? 'var(--bad)' : ''; });
  if (pythonInfo()) statusLine.textContent = `Python ${pythonInfo().python} · Pyodide ${pythonInfo().version}`;

  async function go() {
    out.replaceChildren(); plots.replaceChildren();
    runBtn.disabled = true; stopBtn.disabled = false;
    const r = await run(code.value, { onOutput: (m) => out.append(m.type === 'stderr' ? h('span.err', m.text) : m.type === 'status' ? h('span.faint', m.text + '\n') : m.text) });
    runBtn.disabled = false; stopBtn.disabled = true;
    if (!r.ok) out.append(h('span.err', '\n' + r.error));
    else if (r.result !== undefined) out.append(h('span.faint', `\n→ ${r.result}`));
    if (r.ms) out.append(h('div.tiny.faint', { style: { marginTop: '.4rem' } }, `finished in ${(r.ms / 1000).toFixed(2)} s`));
    if (r.figures?.length) renderFigures(plots, r.figures);
  }

  main.append(h('div.page',
    h('header.page-head', h('h1', 'Code lab'),
      h('p', 'Real Python 3.14, running in your browser through Pyodide — nothing is sent to a server. SymPy and mpmath load when you import them; atlas.plot draws figures with a pyplot-like API (plot, scatter, xlabel, legend, show).'),
      h('p.small.faint', 'NumPy, SciPy and Matplotlib are compiled packages the Atlas could not bundle yet (their official builds are only distributed from hosts this environment could not reach), so programs here use plain Python, math, statistics, fractions, random, SymPy and mpmath. Runaway programs stop after 20 seconds or when you press Stop.')),
    h('div.row.between', { style: { marginBottom: '.6rem' } }, h('div.row', runBtn, stopBtn, pick), statusLine),
    h('div.code-cell', code, out, plots),
    h('p.tiny.faint', { style: { marginTop: '.6rem' } }, 'Ctrl/⌘ + Enter runs. Tab inserts four spaces.')));
  start().catch(() => {});
  return () => unsub();
}
