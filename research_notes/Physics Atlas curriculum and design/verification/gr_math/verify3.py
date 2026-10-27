from itertools import product
import sympy as sp
th, ph, a = sp.symbols('theta phi a', positive=True)
th0 = sp.symbols('theta_0', positive=True)
g = sp.diag(a**2, a**2*sp.sin(th)**2); X = [th, ph]; gi = g.inv()
G = [[[sp.simplify(sum(gi[A, d]*(sp.diff(g[d, b], X[c]) + sp.diff(g[d, c], X[b]) - sp.diff(g[b, c], X[d])) for d in range(2))/2) for c in range(2)] for b in range(2)] for A in range(2)]
bad = []
for l, m, n in product(range(2), repeat=3):
    val = sp.simplify(sp.diff(g[m, n], X[l]) - sum(G[k][l][m]*g[k, n] + G[k][l][n]*g[m, k] for k in range(2)))
    if val != 0:
        bad.append(((l, m, n), val, sp.simplify(sp.expand_trig(val))))
print("nonzero nabla g entries (raw, expand_trig):", bad)
# explicit latitude transport solution
Vt = sp.cos(ph*sp.cos(th0)); Vp = -sp.sin(ph*sp.cos(th0))/sp.sin(th0)
e1 = sp.simplify(sp.diff(Vt, ph) + G[0][1][1].subs(th, th0)*Vp)
e2 = sp.simplify(sp.diff(Vp, ph) + G[1][1][0].subs(th, th0)*Vt)
print("latitude transport V^th=cos(phi cos th0), V^ph=-sin(phi cos th0)/sin th0 residuals:", sp.simplify(sp.expand_trig(e1)), sp.simplify(sp.expand_trig(e2)))
print("norm a^2 (Vt^2 + sin^2 th0 Vp^2) =", sp.simplify(a**2*(Vt**2 + sp.sin(th0)**2*Vp**2)))
