# Curvature, Einstein's Field Equations, Symmetries and the Einstein–Hilbert Action

Research notes for the advanced sections of *The Mathematics of General Relativity: From Calculus to Einstein's Field Equations*. The reader is a Calculus II student who has already met index notation, the metric, Christoffel symbols, covariant derivatives and geodesics.

**Conventions used in every formula, unless flagged otherwise.** Signature $(-,+,+,+)$. Christoffel symbols $\Gamma^\rho_{\mu\nu}=\tfrac12 g^{\rho\sigma}(\partial_\mu g_{\nu\sigma}+\partial_\nu g_{\mu\sigma}-\partial_\sigma g_{\mu\nu})$. Riemann tensor in Carroll's convention (which matches MTW's), $R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$. Ricci tensor $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$, a contraction of the 1st and 3rd indices. Units are **SI with $c$ and $G$ written out**, except where a passage says "geometric units ($G=c=1$)" or "Baez–Bunn units ($c=8\pi G=1$)". When the time coordinate is $x^0=ct$, the metric is dimensionless and $u^\mu=(c,0,0,0)$ at rest. When it is $x^0=t$ (used in some sympy checks), $g_{tt}=-c^2$ and $u^\mu=(1,0,0,0)$ at rest. Each passage says which one it uses.

**Verification.** Every curvature computation below was checked symbolically in this session with **sympy 1.14.0**, using a small tensor library written to Carroll's conventions. §4 lists each check and its output, and reproduces the script.

---

## 1. What is the real mathematics of each topic, explained step by step for a Calculus II reader?

### Takeaway
Curvature is measured by the failure of parallel transport around a loop, or equivalently by the failure of covariant derivatives to commute. The Riemann tensor holds all of it: 1 number per point in 2D, 6 in 3D, 20 in 4D. Contracting it once gives the Ricci tensor, which says how a small ball of free-falling particles starts to change volume. The remaining 10 components (the Weyl tensor) say how the ball changes shape: tides and gravitational waves. The Einstein tensor $G_{\mu\nu}=R_{\mu\nu}-\tfrac12 Rg_{\mu\nu}$ is the unique combination of Ricci and metric whose divergence vanishes identically, by the contracted Bianchi identity. Equating it to the conserved stress-energy tensor gives 10 coupled, nonlinear, second-order PDEs for the metric, of which only 6 are independent. The same equations follow from varying the Einstein–Hilbert action $\int R\sqrt{-g}\,d^4x$, and the calculus-of-variations machinery behind that is the Euler–Lagrange equation, which a Calc II student can derive with integration by parts.

### Cited Findings

#### 1.1 Curvature in two dimensions: intrinsic vs extrinsic, Gaussian curvature, Theorema Egregium

**(1) Plain language and analogy.**
- Imagine an ant that can never leave a surface. **Intrinsic** curvature is whatever the ant can detect by measuring lengths and angles *within* the surface: triangle angle sums, circle circumferences, what happens to an arrow it carries around a loop. **Extrinsic** curvature is how the surface bends inside the surrounding 3D space, which the ant cannot see.
- **A cylinder is intrinsically flat.** You can unroll it into a flat sheet without stretching, so every on-surface distance and angle is unchanged. Carroll: "we can put a metric on the cylinder whose components are constant in an appropriate coordinate system — simply unroll it and use the induced metric from the plane. In this metric, the cylinder is flat." The same holds for the torus built as a square with opposite sides identified. — [Carroll, Lecture Notes on GR, ch. 3 (arXiv gr-qc/9712019)](https://arxiv.org/abs/gr-qc/9712019)
- A **cone** is flat everywhere except its tip. Parallel transport around a loop that encloses the tip rotates a vector by the cone's "deficit angle", and a loop that does not enclose the tip produces no rotation. — [Carroll notes ch. 3](https://arxiv.org/abs/gr-qc/9712019)
- Analogy for the reader: you cannot flatten orange peel without tearing it, which is why every flat map of the Earth distorts something. The sphere's curvature is intrinsic. Paper rolled into a tube is not stretched, so the tube's curvature is only extrinsic.

**(2) Why GR needs it.** In GR, observers inside spacetime cannot step outside it, so the only curvature with physical meaning is intrinsic curvature: what free-fall paths and clocks reveal from inside. Gauss's theorem below guarantees that intrinsic curvature can be computed from the metric alone, which is the entire strategy of GR.

**(3) Mechanics and notation.**
- **Principal curvatures** $\kappa_1,\kappa_2$ are the largest and smallest curvatures ($1/\text{radius}$) of curves cut from the surface by planes containing the surface normal. **Gaussian curvature** is their product: $K=\kappa_1\kappa_2$. — [Wikipedia, Gaussian curvature (cross-check)](https://en.wikipedia.org/wiki/Gaussian_curvature)
- Sphere of radius $a$: $\kappa_1=\kappa_2=1/a$, so $K=1/a^2$. Cylinder: $\kappa_1=1/a$ around and $\kappa_2=0$ along the axis, so $K=0$. "A flat plane and a cylinder have Gaussian curvature zero everywhere." Saddle: the principal curvatures have opposite signs, so $K<0$. — [Wikipedia, Gaussian curvature](https://en.wikipedia.org/wiki/Gaussian_curvature)
- **Theorema Egregium** ("remarkable theorem", Gauss, 1827, *Disquisitiones generales circa superficies curvas*): $K$ is defined using the embedding, yet it depends only on the metric, that is on lengths measured within the surface. — [Wikipedia, Gaussian curvature](https://en.wikipedia.org/wiki/Gaussian_curvature)
- **Metric formula for $K$ in 2D**, in Riemann-tensor language: $K=\dfrac{R_{1212}}{\det g}=\dfrac{R_{1212}}{g_{11}g_{22}-g_{12}^2}$. Sympy verified this for a general orthogonal 2D metric $E(u,v)\,du^2+H(u,v)\,dv^2$, finding $R-2K=0$ identically (§4).
- **Angle excess (local Gauss–Bonnet).** For a triangle whose sides are geodesics: $$\theta_1+\theta_2+\theta_3=\pi+\iint_T K\,dA.$$ "The total curvature of a geodesic triangle equals the deviation of the sum of its angles from π." — [Wikipedia, Gaussian curvature](https://en.wikipedia.org/wiki/Gaussian_curvature)
- **Circumference deficit (Bertrand–Diguet–Puiseux).** For a geodesic circle of radius $r$ (radius measured *along the surface*): $$K=\lim_{r\to0^+}\frac{3\,(2\pi r-C(r))}{\pi r^3},\qquad K=\lim_{r\to0^+}\frac{12\,(\pi r^2-A(r))}{\pi r^4}.$$ — [Wikipedia, Gaussian curvature](https://en.wikipedia.org/wiki/Gaussian_curvature)

**(4) Worked examples.**

*Example 1.1a, a circle on a sphere, every step.* Put the centre of the circle at the North Pole of a sphere of radius $a$. A point at surface distance $r$ from the pole has polar angle $\theta=r/a$, because arc length equals radius times angle. That point lies at distance $a\sin\theta$ from the polar axis, so the circle through it has circumference
$$C(r)=2\pi a\sin\!\left(\frac{r}{a}\right).$$
Use the Calc II Taylor series $\sin x=x-\dfrac{x^3}{6}+\dfrac{x^5}{120}-\cdots$ with $x=r/a$:
$$C=2\pi a\left(\frac{r}{a}-\frac{r^3}{6a^3}+\cdots\right)=2\pi r-\frac{\pi r^3}{3a^2}+\cdots$$
So the deficit is $2\pi r-C\approx \dfrac{\pi r^3}{3a^2}$. Substitute into the limit: $K=\lim \dfrac{3}{\pi r^3}\cdot\dfrac{\pi r^3}{3a^2}=\dfrac1{a^2}$, which agrees with $\kappa_1\kappa_2$.

*Earth numbers.* Use the volumetric mean radius $a=6371.000$ km ([NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)). Computed in this session in double precision (§4):

| geodesic radius $r$ | $C=2\pi a\sin(r/a)$ | flat $2\pi r$ | deficit $2\pi r-C$ | approx. $\pi r^3/(3a^2)$ |
|---|---|---|---|---|
| 1 km | 6.283185 km | 6.283185 km | $2.58\times10^{-8}$ km = 0.026 mm | $2.58\times10^{-8}$ km |
| 10 km | 62.831827 km | 62.831853 km | 2.58 cm | same |
| 100 km | 628.2927 km | 628.3185 km | 25.8 m | 25.8 m |
| 1000 km | 6257.42 km | 6283.19 km | 25.77 km | 25.80 km |
| $\pi a/2=10\,007.5$ km (pole to equator) | 40 030.2 km (the equator) | 62 879.2 km | 22 849 km | (series no longer valid) |

On human scales the deficit is far too small to notice, which is why the Earth looks flat. Curvature is a second-order, $r^3$ effect.

*Example 1.1b, angle excess on Earth.* Take the "octant" triangle: from the North Pole down the 0° meridian to the equator, a quarter of the way along the equator, then back up the 90°E meridian. All three angles are $90^\circ$, so the angle sum is $270^\circ$ and the excess is $90^\circ=\pi/2$. Area $=\tfrac18(4\pi a^2)=\tfrac{\pi a^2}{2}=6.376\times10^7\ \text{km}^2$. Then $\iint K\,dA=\tfrac1{a^2}\cdot\tfrac{\pi a^2}2=\tfrac\pi2$, which matches. For smaller triangles the excess $=A/a^2$: a 1 km² triangle has excess $2.46\times10^{-8}$ rad $=0.0051''$, and a $10^4$ km² triangle (about 100 km on a side) has $2.46\times10^{-4}$ rad $=50.8''$ (computed in this session).

*Example 1.1c, the cylinder.* Coordinates $(z,\phi)$ on a cylinder of radius $a$ give $ds^2=dz^2+a^2d\phi^2$. All metric components are constant, so every $\partial g=0$, every Christoffel symbol vanishes, and every Riemann component vanishes (sympy-verified, §4). A triangle drawn on the cylinder has angle sum exactly $\pi$.

**(5) Why one number is not enough in more than two dimensions.** At a point of an $n$-dimensional space there are many 2D planes (pairs of directions), and each can have a different Gaussian ("sectional") curvature. The full information is the Riemann tensor, with $n^2(n^2-1)/12$ independent components: 1, 6, 20 for $n=2,3,4$ (Carroll eq. 3.85; arithmetic re-checked in §4). In 2D a single function $K(x)$ suffices. In 4D you need 20 functions. — [Carroll notes ch. 3](https://arxiv.org/abs/gr-qc/9712019)

**(6) Key takeaways.** (i) Intrinsic curvature is what measurements inside the space detect. (ii) A cylinder is intrinsically flat, a sphere is not. (iii) $K=1/a^2$ for a sphere. (iv) Curvature shows up as angle excess $=\iint K\,dA$ and as a circumference deficit $\approx \tfrac{\pi}{3}Kr^3$. (v) In more than 2 dimensions one number per point is not enough.

**Misconceptions.** "Curved-looking means curved": the cylinder is the counterexample. "Curvature needs a higher dimension to curve into": Gauss's theorem says it does not. "Nonzero Christoffel symbols mean curvature": flat polar coordinates have $\Gamma^r_{\phi\phi}=-r$ and $\Gamma^\phi_{r\phi}=1/r$, yet zero Riemann (§1.2, Example 1.2b).

#### 1.2 The Riemann curvature tensor

**(1) Plain language and analogy.** Carry an arrow around a small closed loop, always keeping it "as parallel as possible" (parallel transport). In flat space it comes back unchanged. On a sphere it comes back rotated, by an angle equal to the curvature enclosed: on the octant triangle the arrow returns rotated by exactly $90^\circ$. The Riemann tensor is the machine that takes two inputs, the loop (spanned by two directions) and the arrow, and returns the change in the arrow. Carroll's eq. (3.63), for a loop with sides $\delta a\,A^\nu$ and $\delta b\,B^\mu$:
$$\delta V^\rho=(\delta a)(\delta b)\,A^\nu B^\mu\,R^\rho{}_{\sigma\mu\nu}V^\sigma .$$
Carroll warns that with (3.63) as the definition "there is a convention that needs to be chosen for the ordering of the indices. There is no agreement at all on what this convention should be, so be careful." — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)

A second analogy uses the student's calculus. Mixed partial derivatives commute (Clairaut/Schwarz): $\partial_x\partial_y f=\partial_y\partial_x f$. Covariant derivatives in curved space do **not** commute, and the amount by which they fail to is the curvature.

**(2) Why GR needs it.** Gravity's physically real, coordinate-independent content is tidal: neighbouring free-fall paths accelerate relative to one another. The geodesic deviation equation (Carroll 3.113) is $\dfrac{D^2S^\mu}{d\tau^2}=R^\mu{}_{\nu\rho\sigma}T^\nu T^\rho S^\sigma$, where $T$ is the tangent to the geodesics and $S$ is the separation vector. Carroll: "the relative acceleration between two neighboring geodesics is proportional to the curvature… the acceleration of neighboring geodesics is interpreted as a manifestation of gravitational tidal forces." — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019); also [MIT 8.962 (S. Hughes) Lecture 11, "Breakdown of parallelism: geodesic deviation"](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/)

**(3) Mechanics, with no skipped steps.**

*Definition by commutator* (Carroll 3.66–3.67, torsion-free connection):
$$[\nabla_\mu,\nabla_\nu]V^\rho\equiv\nabla_\mu\nabla_\nu V^\rho-\nabla_\nu\nabla_\mu V^\rho=R^\rho{}_{\sigma\mu\nu}V^\sigma .$$

*Derivation.* Recall $\nabla_\nu V^\rho=\partial_\nu V^\rho+\Gamma^\rho_{\nu\sigma}V^\sigma$. The object $\nabla_\nu V^\rho$ has one upper and one lower index, so its covariant derivative needs one $+\Gamma$ and one $-\Gamma$:
$$\nabla_\mu(\nabla_\nu V^\rho)=\partial_\mu(\nabla_\nu V^\rho)-\Gamma^\lambda_{\mu\nu}\nabla_\lambda V^\rho+\Gamma^\rho_{\mu\sigma}\nabla_\nu V^\sigma .$$
Expand each piece:
$$=\partial_\mu\partial_\nu V^\rho+(\partial_\mu\Gamma^\rho_{\nu\sigma})V^\sigma+\Gamma^\rho_{\nu\sigma}\partial_\mu V^\sigma-\Gamma^\lambda_{\mu\nu}\nabla_\lambda V^\rho+\Gamma^\rho_{\mu\sigma}\partial_\nu V^\sigma+\Gamma^\rho_{\mu\sigma}\Gamma^\sigma_{\nu\lambda}V^\lambda .$$
Now subtract the same expression with $\mu\leftrightarrow\nu$, one term at a time:
- $\partial_\mu\partial_\nu V^\rho-\partial_\nu\partial_\mu V^\rho=0$ (Clairaut).
- $\Gamma^\rho_{\nu\sigma}\partial_\mu V^\sigma+\Gamma^\rho_{\mu\sigma}\partial_\nu V^\sigma$ is unchanged by swapping $\mu,\nu$, so it cancels.
- $\Gamma^\lambda_{\mu\nu}\nabla_\lambda V^\rho$ is symmetric in $\mu\nu$ (no torsion), so it cancels.
- What survives: $(\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma})V^\sigma+\Gamma^\rho_{\mu\sigma}\Gamma^\sigma_{\nu\lambda}V^\lambda-\Gamma^\rho_{\nu\sigma}\Gamma^\sigma_{\mu\lambda}V^\lambda$.
- In the last two terms rename the dummy indices $\sigma\to\lambda$, $\lambda\to\sigma$ to get $(\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma})V^\sigma$.

Therefore
$$\boxed{R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}}$$
This is Carroll eq. (3.67). The derivation follows Carroll eq. (3.65): "we have relabeled some dummy indices and eliminated some terms that cancel when antisymmetrized." Carroll stresses that the commutator, "which appears to be a differential operator, has an action on vector fields which… is a simple multiplicative transformation." Sympy confirmed $[\nabla_\mu,\nabla_\nu]V^\rho=R^\rho{}_{\sigma\mu\nu}V^\sigma$ on the 2-sphere for an arbitrary vector field $V^\theta(\theta,\phi),V^\phi(\theta,\phi)$ (§4). — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)

*Index meanings.* $\rho$ is the component of the output vector change. $\sigma$ is the slot for the input vector. $\mu\nu$ label the plane of the loop, and the tensor is antisymmetric in them, because reversing the loop reverses the change.

*Symmetries.* Lower the first index with $R_{\rho\sigma\mu\nu}=g_{\rho\lambda}R^\lambda{}_{\sigma\mu\nu}$ (Carroll 3.76). Then (Carroll 3.64, 3.78–3.81):
- $R_{\rho\sigma\mu\nu}=-R_{\sigma\rho\mu\nu}$ (antisymmetric in the first pair),
- $R_{\rho\sigma\mu\nu}=-R_{\rho\sigma\nu\mu}$ (antisymmetric in the second pair),
- $R_{\rho\sigma\mu\nu}=R_{\mu\nu\rho\sigma}$ (pair exchange),
- $R_{\rho\sigma\mu\nu}+R_{\rho\mu\nu\sigma}+R_{\rho\nu\sigma\mu}=0$, i.e. $R_{\rho[\sigma\mu\nu]}=0$ (first, or algebraic, Bianchi identity). — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)

*Counting independent components (Carroll 3.82–3.85).* An antisymmetric index pair can take $m=n(n-1)/2$ values. Antisymmetry in each pair plus pair exchange make $R$ a symmetric $m\times m$ matrix, which has $m(m+1)/2$ entries. The cyclic identity then removes $\binom{n}{4}=n(n-1)(n-2)(n-3)/24$ more. The result is $n^2(n^2-1)/12$.
- $n=2$: $m=1$, giving $1-0=1$.
- $n=3$: $m=3$, giving $6-0=6$.
- $n=4$: $m=6$, giving $21-1=20$. (Carroll: "In four dimensions, therefore, the Riemann tensor has 20 independent components.") — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)

**(4) Worked examples.**

*Example 1.2a, the 2-sphere, every step* (Carroll 3.100–3.106, re-derived and sympy-verified). Metric: $ds^2=a^2(d\theta^2+\sin^2\theta\,d\phi^2)$, so $g_{\theta\theta}=a^2$, $g_{\phi\phi}=a^2\sin^2\theta$, $g_{\theta\phi}=0$, and the inverse is $g^{\theta\theta}=1/a^2$, $g^{\phi\phi}=1/(a^2\sin^2\theta)$.

Step 1, metric derivatives. The only nonzero one is $\partial_\theta g_{\phi\phi}=2a^2\sin\theta\cos\theta$.

Step 2, Christoffel symbols from $\Gamma^\rho_{\mu\nu}=\tfrac12g^{\rho\sigma}(\partial_\mu g_{\nu\sigma}+\partial_\nu g_{\mu\sigma}-\partial_\sigma g_{\mu\nu})$:
- $\Gamma^\theta_{\phi\phi}=\tfrac12g^{\theta\theta}(0+0-\partial_\theta g_{\phi\phi})=\tfrac12\cdot\tfrac1{a^2}\cdot(-2a^2\sin\theta\cos\theta)=-\sin\theta\cos\theta$.
- $\Gamma^\phi_{\theta\phi}=\Gamma^\phi_{\phi\theta}=\tfrac12g^{\phi\phi}(\partial_\theta g_{\phi\phi})=\tfrac12\cdot\tfrac1{a^2\sin^2\theta}\cdot 2a^2\sin\theta\cos\theta=\cot\theta$.
- All others are zero: $\Gamma^\theta_{\theta\theta},\Gamma^\theta_{\theta\phi},\Gamma^\phi_{\theta\theta},\Gamma^\phi_{\phi\phi}$. Sympy agrees (it prints $\Gamma^\theta_{\phi\phi}=-\tfrac12\sin2\theta$).

Step 3, $R^\theta{}_{\phi\theta\phi}$. Set $\rho=\theta,\sigma=\phi,\mu=\theta,\nu=\phi$ in the boxed formula:
$$R^\theta{}_{\phi\theta\phi}=\underbrace{\partial_\theta\Gamma^\theta_{\phi\phi}}_{\text{(i)}}-\underbrace{\partial_\phi\Gamma^\theta_{\theta\phi}}_{\text{(ii)}}+\underbrace{\Gamma^\theta_{\theta\lambda}\Gamma^\lambda_{\phi\phi}}_{\text{(iii)}}-\underbrace{\Gamma^\theta_{\phi\lambda}\Gamma^\lambda_{\theta\phi}}_{\text{(iv)}}$$
- (i) $\partial_\theta(-\sin\theta\cos\theta)=-(\cos^2\theta-\sin^2\theta)=\sin^2\theta-\cos^2\theta$ (product rule).
- (ii) $\Gamma^\theta_{\theta\phi}=0$, so (ii) $=0$.
- (iii) Sum over $\lambda$: $\Gamma^\theta_{\theta\theta}\Gamma^\theta_{\phi\phi}+\Gamma^\theta_{\theta\phi}\Gamma^\phi_{\phi\phi}=0\cdot(\ldots)+0\cdot 0=0$.
- (iv) Sum over $\lambda$: $\Gamma^\theta_{\phi\theta}\Gamma^\theta_{\theta\phi}+\Gamma^\theta_{\phi\phi}\Gamma^\phi_{\theta\phi}=0+(-\sin\theta\cos\theta)(\cot\theta)=-\cos^2\theta$.
- Total: $(\sin^2\theta-\cos^2\theta)-0+0-(-\cos^2\theta)=\sin^2\theta$.
$$R^\theta{}_{\phi\theta\phi}=\sin^2\theta\qquad(\text{Carroll 3.102; sympy } \checkmark)$$

Step 4, lower the index. $R_{\theta\phi\theta\phi}=g_{\theta\theta}R^\theta{}_{\phi\theta\phi}=a^2\sin^2\theta$ (Carroll 3.103). Check $K$: $R_{\theta\phi\theta\phi}/\det g=a^2\sin^2\theta/(a^4\sin^2\theta)=1/a^2$ ✓.

Step 5, the other components follow from the symmetries: $R^\theta{}_{\phi\phi\theta}=-\sin^2\theta$, $R^\phi{}_{\theta\phi\theta}=+1$, $R^\phi{}_{\theta\theta\phi}=-1$ (sympy output). For example, $R^\phi{}_{\theta\phi\theta}=g^{\phi\phi}R_{\phi\theta\phi\theta}=g^{\phi\phi}R_{\theta\phi\theta\phi}=\frac{a^2\sin^2\theta}{a^2\sin^2\theta}=1$.

Step 6, maximal symmetry check. Carroll (3.106): $R_{\rho\sigma\mu\nu}=a^{-2}(g_{\rho\mu}g_{\sigma\nu}-g_{\rho\nu}g_{\sigma\mu})$. For $\theta\phi\theta\phi$ this gives $a^{-2}(a^2\cdot a^2\sin^2\theta-0)=a^2\sin^2\theta$ ✓. — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)

*Example 1.2b, the flat plane in polar coordinates.* $ds^2=dr^2+r^2d\phi^2$. Christoffels: $\Gamma^r_{\phi\phi}=-r$ and $\Gamma^\phi_{r\phi}=1/r$, both nonzero (sympy). Then
$$R^r{}_{\phi r\phi}=\partial_r\Gamma^r_{\phi\phi}-\partial_\phi\Gamma^r_{r\phi}+\Gamma^r_{r\lambda}\Gamma^\lambda_{\phi\phi}-\Gamma^r_{\phi\lambda}\Gamma^\lambda_{r\phi}=(-1)-0+0-(-r)(1/r)=0 .$$
The plane is flat even though its Christoffels are nonzero, because curvature is a combination that is blind to the coordinate choice. Sympy confirms that all Riemann components vanish.

*Example 1.2c, the Schwarzschild Kretschmann scalar.* Metric (SI, $x^0=t$):
$$ds^2=-\Big(1-\frac{r_s}{r}\Big)c^2dt^2+\Big(1-\frac{r_s}{r}\Big)^{-1}dr^2+r^2(d\theta^2+\sin^2\theta\,d\phi^2),\qquad r_s=\frac{2GM}{c^2}.$$
- The cleanest hand route uses an orthonormal frame carried by a static observer: $e_{\hat t}=\frac{1}{c\sqrt{1-r_s/r}}\partial_t$, $e_{\hat r}=\sqrt{1-r_s/r}\,\partial_r$, $e_{\hat\theta}=\frac1r\partial_\theta$, $e_{\hat\phi}=\frac1{r\sin\theta}\partial_\phi$. Sympy found exactly six nonzero independent frame components, with no others (§4):
$$R_{\hat t\hat r\hat t\hat r}=-\frac{r_s}{r^3},\quad R_{\hat t\hat\theta\hat t\hat\theta}=R_{\hat t\hat\phi\hat t\hat\phi}=+\frac{r_s}{2r^3},\quad R_{\hat r\hat\theta\hat r\hat\theta}=R_{\hat r\hat\phi\hat r\hat\phi}=-\frac{r_s}{2r^3},\quad R_{\hat\theta\hat\phi\hat\theta\hat\phi}=+\frac{r_s}{r^3}.$$
- The Kretschmann scalar is $\mathcal K=R_{\alpha\beta\gamma\delta}R^{\alpha\beta\gamma\delta}$. Each independent component $R_{\hat a\hat b\hat a\hat b}$ appears 4 times in the full sum (as $abab$, $baba$, $abba$, $baab$), each time squared. Raising a $\hat t$ index flips a sign, but it is always raised twice, so every sign drops out:
$$\mathcal K=4\Big[\big(\tfrac{r_s}{r^3}\big)^2+2\big(\tfrac{r_s}{2r^3}\big)^2+2\big(\tfrac{r_s}{2r^3}\big)^2+\big(\tfrac{r_s}{r^3}\big)^2\Big]=4\Big[\tfrac{r_s^2}{r^6}+\tfrac{r_s^2}{2r^6}+\tfrac{r_s^2}{2r^6}+\tfrac{r_s^2}{r^6}\Big]=\frac{12\,r_s^2}{r^6}=\frac{48\,G^2M^2}{c^4r^6}.$$
- Sympy computed the full coordinate contraction directly and got `12*r_s**2/r**6`, and `48*G**2*M**2/(c**4*r**6)` after substituting $r_s=2GM/c^2$ (§4).
- **At the horizon** $r=r_s$: $\mathcal K=12/r_s^4$, which is finite. The metric component $g_{rr}$ blows up there, but no invariant does, so the horizon is a *coordinate* singularity.
- **At $r\to0$**: $\mathcal K\to\infty$ (sympy `limit` returns `oo`). This is a genuine *curvature* singularity.
- Numbers (computed here, with $G=6.67430\times10^{-11}$, $c=299\,792\,458$ m/s, $M_\odot=1.98847\times10^{30}$ kg): for $1M_\odot$, $r_s=2953$ m and $\mathcal K(r_s)=1.58\times10^{-13}\ \text{m}^{-4}$. Since $\mathcal K(r_s)\propto M^{-4}$: $1.58\times10^{-17}$ for $10M_\odot$, $1.58\times10^{-37}$ for $10^6M_\odot$, $1.58\times10^{-49}\ \text{m}^{-4}$ for $10^9M_\odot$. Tidal curvature at the horizon of a supermassive black hole is tiny.
- *Tidal reading of the same components* (geodesic deviation, Carroll 3.113, static frame, $T^\mu=c\,e_{\hat t}$ to leading order): radial $\ddot\xi^{\hat r}=-R^{\hat r}{}_{\hat t\hat r\hat t}c^2\xi^{\hat r}=+\frac{r_sc^2}{r^3}\xi^{\hat r}=+\frac{2GM}{r^3}\xi^{\hat r}$ (stretching). Transverse $\ddot\xi^{\hat\theta}=-\frac{r_sc^2}{2r^3}\xi^{\hat\theta}=-\frac{GM}{r^3}\xi^{\hat\theta}$ (squeezing). These are exactly Newton's tidal accelerations. The trace is $+2GM/r^3-GM/r^3-GM/r^3=0$: no volume change in vacuum (§1.3). This is my derivation from the sympy-verified components and Carroll's deviation equation; it is consistent with the Baez–Bunn "coffee grains" picture in §1.3.

**(5) Where it appears in Einstein's equations.** Riemann is not itself in $G_{\mu\nu}=\kappa T_{\mu\nu}$. Only its trace (Ricci) is. The traceless part (Weyl) is not fixed locally by matter, so it carries the "free" gravitational field, i.e. tides and waves.

**(6) Key takeaways.** (i) $R^\rho{}_{\sigma\mu\nu}$ is the failure of $\nabla_\mu,\nabla_\nu$ to commute, equivalently the rotation of a vector carried around a loop. (ii) It is built from $\partial\Gamma$ and $\Gamma\Gamma$, i.e. from second derivatives of the metric. (iii) Its symmetries leave 20 components in 4D. (iv) The 2-sphere has $R^\theta{}_{\phi\theta\phi}=\sin^2\theta$. (v) Use invariants like $\mathcal K$ to tell coordinate singularities from real ones.

**Misconceptions.** "The horizon is where curvature becomes infinite": no, $\mathcal K(r_s)=12/r_s^4$ is finite. "Index order is universal": it is not (Carroll's warning above). "Riemann = 0 requires $\Gamma=0$": no (Example 1.2b).

#### 1.3 The Ricci tensor

**(1) Plain language.** The Ricci tensor is the "average" of Riemann over directions: $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$. Baez and Bunn give the cleanest physical meaning. Take a small ball of test particles, initially at rest relative to one another, in free fall. Let $V(t)$ be its volume. Then, in local inertial coordinates where the ball starts at rest,
$$\lim_{V\to0}\frac{\ddot V}{V}\bigg|_{t=0}=-R_{tt}\qquad(\text{Baez–Bunn eq. 7, units } c=1).$$
"In short, the Ricci tensor says how our ball of freely falling test particles starts changing in volume. The Ricci tensor only captures some of the information in the Riemann curvature tensor. The rest is captured by… the 'Weyl tensor', which says how any such ball starts changing in shape. The Weyl tensor describes tidal forces, gravitational waves and the like." — [Baez & Bunn, "The Meaning of Einstein's Equation", Am. J. Phys. 73 (2005) 644 (arXiv gr-qc/0103044)](https://arxiv.org/abs/gr-qc/0103044)

Analogy (Baez–Bunn): drop "a small ball of instant coffee". Grains nearer the Earth fall faster, so the ball stretches vertically, and all grains head toward the Earth's centre, so it squashes horizontally. In vacuum these two effects cancel in $\ddot V$. — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)

**(2) Why GR needs it.** Ricci is the part of curvature that matter controls *locally*. Einstein's equation in Baez–Bunn form (units $c=8\pi G=1$) is
$$\frac{\ddot V}{V}\bigg|_{t=0}=-\frac12\left(\rho+P_x+P_y+P_z\right),$$
"where these flows are measured at the center of the ball at time zero, using local inertial coordinates." Positive energy density and pressure make the ball shrink: "gravity attracts". — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044); [web version](https://math.ucr.edu/home/baez/einstein/node3.html)
- *Units restored.* Undo $8\pi G=1$ by multiplying the right side by $8\pi G$: $\ddot V/V=-4\pi G(\rho+P_x+P_y+P_z)$ with $c=1$. In SI with $\rho$ a mass density, isotropic $P$: $\ddot V/V=-4\pi G(\rho+3P/c^2)$. For dust ($P=0$) this is $-4\pi G\rho$, i.e. Gauss's law for Newtonian gravity, $\nabla\cdot\vec g=-4\pi G\rho$. (Unit conversion is my own step; Baez–Bunn themselves recover $a=-GM/r^2$ "just as Newton said.")

**(3) Mechanics.**
- Contract Riemann's 1st and 3rd indices: $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ (Carroll 3.90). For the Christoffel connection this is "the only independent contraction (modulo conventions for the sign, which of course change from place to place)". It is symmetric, $R_{\mu\nu}=R_{\nu\mu}$ (Carroll 3.91). — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)
- Hughes (MIT 8.962): "a trace over the first and second indices would be identically zero, thanks to the antisymmetry of these indices; likewise a trace on the third and fourth is zero." — [MIT 8.962 Lecture 11](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/)
- Count: a symmetric 4×4 tensor has 10 components, so in 4D, 20 (Riemann) = 10 (Ricci) + 10 (Weyl). Weyl tensor (Carroll 3.97): $C_{\rho\sigma\mu\nu}=R_{\rho\sigma\mu\nu}-\frac{2}{n-2}(g_{\rho[\mu}R_{\nu]\sigma}-g_{\sigma[\mu}R_{\nu]\rho})+\frac{2}{(n-1)(n-2)}Rg_{\rho[\mu}g_{\nu]\sigma}$, "designed so that all possible contractions… vanish". It "is only defined in three or more dimensions, and in three dimensions it vanishes identically." — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)

**(4) Worked examples.**

*Example 1.3a, 2-sphere.* Use the components from 1.2a:
- $R_{\theta\theta}=R^\lambda{}_{\theta\lambda\theta}=R^\theta{}_{\theta\theta\theta}+R^\phi{}_{\theta\phi\theta}=0+1=1$. The first term is zero by antisymmetry in the last two indices.
- $R_{\phi\phi}=R^\theta{}_{\phi\theta\phi}+R^\phi{}_{\phi\phi\phi}=\sin^2\theta+0=\sin^2\theta$. Carroll (3.104) writes this as $R_{\phi\phi}=g^{\theta\theta}R_{\theta\phi\theta\phi}=\sin^2\theta$.
- $R_{\theta\phi}=R^\theta{}_{\theta\theta\phi}+R^\phi{}_{\theta\phi\phi}=0+0=0$.
- So $R_{\mu\nu}=\mathrm{diag}(1,\sin^2\theta)=\frac1{a^2}g_{\mu\nu}$. Sympy ✓.

*Example 1.3b, 3-sphere* $ds^2=a^2[d\chi^2+\sin^2\chi(d\theta^2+\sin^2\theta\,d\phi^2)]$. Sympy gives $R_{ij}=\frac{2}{a^2}g_{ij}$ for every diagonal component. The general rule for a maximally symmetric space, obtained by contracting Carroll 3.106, is $R_{\sigma\nu}=g^{\rho\mu}a^{-2}(g_{\rho\mu}g_{\sigma\nu}-g_{\rho\nu}g_{\sigma\mu})=a^{-2}(n-1)g_{\sigma\nu}$. That gives $1/a^2$ for $n=2$ and $2/a^2$ for $n=3$ ✓.

*Example 1.3c, Schwarzschild: Ricci = 0 by hand, from the frame components of 1.2c.* $R_{\hat t\hat t}=\sum_{\hat i}R^{\hat i}{}_{\hat t\hat i\hat t}=R_{\hat r\hat t\hat r\hat t}+R_{\hat\theta\hat t\hat\theta\hat t}+R_{\hat\phi\hat t\hat\phi\hat t}=-\frac{r_s}{r^3}+\frac{r_s}{2r^3}+\frac{r_s}{2r^3}=0$. Spatial indices are raised with $+1$, and pair exchange gives $R_{\hat r\hat t\hat r\hat t}=R_{\hat t\hat r\hat t\hat r}$. Likewise $R_{\hat r\hat r}=R^{\hat t}{}_{\hat r\hat t\hat r}+R^{\hat\theta}{}_{\hat r\hat\theta\hat r}+R^{\hat\phi}{}_{\hat r\hat\phi\hat r}=-(-\frac{r_s}{r^3})+(-\frac{r_s}{2r^3})+(-\frac{r_s}{2r^3})=0$, where raising $\hat t$ costs a sign. Sympy computed all 16 coordinate components of $R_{\mu\nu}$ and found them all zero (§4).

*Example 1.3d, FLRW* ($x^0=t$): sympy gives $R_{tt}=-3\ddot a/a$ and $R_{rr}=\dfrac{a\ddot a+2\dot a^2+2kc^2}{c^2(1-kr^2)}$.

**(5) Where it appears.** Directly: the trace-reversed field equation $R_{\mu\nu}=\kappa(T_{\mu\nu}-\tfrac12Tg_{\mu\nu})+\Lambda g_{\mu\nu}$, and in vacuum $R_{\mu\nu}=0$.

**(6) Takeaways.** (i) Ricci is one contraction of Riemann. (ii) It measures the volume change of a free-falling ball. (iii) Weyl measures shape change. (iv) Matter fixes Ricci locally, while Weyl propagates (waves, tides). (v) Ricci $=0$ does *not* mean flat.

**Misconceptions.** "Vacuum means no curvature": Schwarzschild has $R_{\mu\nu}=0$ but $\mathcal K\neq0$. "Ricci is the whole of gravity": it is half the components in 4D.

#### 1.4 The Ricci scalar

**(1) Plain language.** One more contraction, $R=g^{\mu\nu}R_{\mu\nu}$, gives a single number per point. Carroll (3.92): $R=R^\mu{}_\mu=g^{\mu\nu}R_{\mu\nu}$. In 2D this one number is the whole curvature: "the Ricci scalar, which for a two-dimensional manifold completely characterizes the curvature". — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)

**(2) Why GR needs it.** It is the trace term in $G_{\mu\nu}$, and it is the Lagrangian of the Einstein–Hilbert action (§1.12). With the field equations, $R=4\Lambda-\kappa T$ (derived in §1.9), so $R$ tracks the trace of the matter content.

**(3–4) Worked examples (all sympy-verified).**
- *2-sphere*: $R=g^{\theta\theta}R_{\theta\theta}+g^{\phi\phi}R_{\phi\phi}=\frac1{a^2}\cdot1+\frac1{a^2\sin^2\theta}\cdot\sin^2\theta=\frac2{a^2}$ (Carroll 3.105). Since $K=1/a^2$, $R=2K$. Sympy shows **$R=2K$ for an arbitrary 2D metric**. Carroll notes the conventions "conspired so that spaces which everyone agrees to call positively curved actually have a positive Ricci scalar." — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)
- *3-sphere*: $R=g^{ij}R_{ij}=3\times\frac2{a^2}=\frac6{a^2}$. In general an $n$-sphere has $R=n(n-1)/a^2$: $2/a^2$, $6/a^2$, $12/a^2$ for $n=2,3,4$ (contraction of Carroll 3.106).
- *Schwarzschild*: $R=0$, because Ricci is zero.
- *FLRW* (SI, $x^0=t$), $ds^2=-c^2dt^2+a(t)^2\big[\frac{dr^2}{1-kr^2}+r^2d\Omega^2\big]$: $$R=\frac{6}{c^2}\left(\frac{\ddot a}{a}+\frac{\dot a^2}{a^2}\right)+\frac{6k}{a^2}\quad(\text{sympy}\ \checkmark).$$
  - **de Sitter**, $a=e^{Ht}$, $k=0$: $\dot a/a=H$ and $\ddot a/a=H^2$, so $R=\frac{6}{c^2}(H^2+H^2)=\frac{12H^2}{c^2}$. With $H^2=\Lambda c^2/3$, this is $R=4\Lambda$. ✓ sympy.
  - **Radiation era**, $a\propto t^{1/2}$: $\dot a/a=\frac1{2t}$ and $\ddot a/a=\frac12(-\frac12)t^{-2}=-\frac1{4t^2}$, so $R\propto -\frac1{4t^2}+\frac1{4t^2}=0$. This matches tracelessness of radiation, since $R=-\kappa T=0$.
  - **Matter era**, $a\propto t^{2/3}$: $\dot a/a=\frac2{3t}$ and $\ddot a/a=\frac23(-\frac13)t^{-2}=-\frac2{9t^2}$. The sum is $-\frac2{9t^2}+\frac4{9t^2}=\frac2{9t^2}$, so $R=\frac{4}{3c^2t^2}$ ✓ sympy.

**(6) Takeaways.** (i) $R$ is a scalar, the same in every coordinate system. (ii) $R=2/a^2$ for the 2-sphere, $6/a^2$ for the 3-sphere, and in 2D $R=2K$. (iii) In GR $R$ is fixed by the trace of $T$. (iv) $R=0$ does not imply flatness.

**Misconception.** "Ricci scalar zero means spacetime is flat": Schwarzschild and radiation-dominated FLRW both have $R=0$.

#### 1.5 The Einstein tensor

**(1) Plain language.** $G_{\mu\nu}=R_{\mu\nu}-\tfrac12Rg_{\mu\nu}$ is "Ricci with its trace adjusted" so that its divergence is *automatically* zero. This is a bookkeeping guarantee built into geometry, just as $\nabla\cdot(\nabla\times\vec F)=0$ holds for every field in Calc III.

**(2) Why GR needs it, and why the ½.**
- *Contracted Bianchi identity* (Carroll 3.93–3.96): $\nabla^\mu R_{\rho\mu}=\tfrac12\nabla_\rho R$, hence $\nabla^\mu G_{\mu\nu}=0$. Derivation in §1.8. — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)
- *Why exactly ½.* Try $X_{\mu\nu}=R_{\mu\nu}-\alpha Rg_{\mu\nu}$. Since $\nabla g=0$, $\nabla^\mu X_{\mu\nu}=\tfrac12\nabla_\nu R-\alpha\nabla_\nu R=(\tfrac12-\alpha)\nabla_\nu R$. This vanishes for every geometry only if $\alpha=\tfrac12$. (My derivation from Carroll 3.94.)
- *Sympy check.* For a general time-dependent spherically symmetric metric $-e^{2\alpha(t,r)}dt^2+e^{2\beta(t,r)}dr^2+r^2d\Omega^2$, $\nabla_\mu G^{\mu\nu}=0$ in all four components, but $\nabla_\mu R^{\mu\nu}\neq0$ in the $t$ and $r$ components (§4).
- **Why $R_{\mu\nu}=\kappa T_{\mu\nu}$ fails** (Carroll 4.37–4.41). "Einstein did suggest this equation at one point." Conservation $\nabla^\mu T_{\mu\nu}=0$ would force $\nabla^\mu R_{\mu\nu}=0$. The Bianchi identity says $\nabla^\mu R_{\mu\nu}=\tfrac12\nabla_\nu R$, so $\nabla_\nu R=0$. The proposed equation's trace is $R=\kappa T$, so $\partial_\nu T=0$: "T is constant throughout spacetime. This is highly implausible, since T = 0 in vacuum while" it is nonzero in matter. (Carroll's text says "T > 0 in matter". In the $(-,+,+,+)$ signature dust actually has $T=-\rho c^2<0$, so the point is $T\neq0$; the sign is a slip in the notes, not the argument.) — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019)
- *Historical version*: Einstein's 4 Nov 1915 paper used $R_{im}=-\kappa T_{im}$ (his sign conventions) with restricted (unimodular) covariance. On 11 Nov he assumed $T=0$ for all matter, which is the only way such an equation can be consistent. On 25 Nov he added the trace term (§5). — [Janssen & Renn, Physics Today 68(11) 2015](https://physicstoday.aip.org/features/arch-and-scaffold-how-einstein-found-his-field-equations)

**(3) Mechanics, trace reversal.** In $n$ dimensions $g^{\mu\nu}g_{\mu\nu}=n$, so $g^{\mu\nu}G_{\mu\nu}=R-\tfrac n2R$. In 4D this is $G\equiv G^\mu{}_\mu=-R$. Define the trace-reverse of a symmetric tensor as $\bar A_{\mu\nu}=A_{\mu\nu}-\tfrac12Ag_{\mu\nu}$. In 4D, $\bar A=A-2A=-A$, so reversing twice gives $\bar A_{\mu\nu}-\tfrac12\bar Ag_{\mu\nu}=A_{\mu\nu}-\tfrac12Ag_{\mu\nu}+\tfrac12Ag_{\mu\nu}=A_{\mu\nu}$. So $G$ is the trace-reverse of Ricci and Ricci is the trace-reverse of $G$. That is why the field equations can be flipped into $R_{\mu\nu}=\kappa(T_{\mu\nu}-\tfrac12Tg_{\mu\nu})$ (§1.9).

**(4) Worked examples.**
- *2-sphere*: $G_{\theta\theta}=R_{\theta\theta}-\tfrac12Rg_{\theta\theta}=1-\tfrac12\cdot\tfrac2{a^2}\cdot a^2=0$ and $G_{\phi\phi}=\sin^2\theta-\tfrac12\cdot\tfrac2{a^2}\cdot a^2\sin^2\theta=0$. So $G_{\mu\nu}=0$ even though the sphere is curved.
- *Any 2D surface*: in 2D, $R_{\rho\sigma\mu\nu}=K(g_{\rho\mu}g_{\sigma\nu}-g_{\rho\nu}g_{\sigma\mu})$, so $R_{\sigma\nu}=K(2-1)g_{\sigma\nu}=Kg_{\sigma\nu}$ and $R=2K$. Then $G_{\mu\nu}=Kg_{\mu\nu}-\tfrac12(2K)g_{\mu\nu}=0$. Sympy confirmed $G_{\mu\nu}\equiv0$ for an arbitrary 2D metric $E(u,v)du^2+H(u,v)dv^2$ (§4). **Consequence:** a "2D Einstein equation" $G=\kappa T$ would force $T=0$. 2D GR has no dynamics.
- *FLRW* (sympy, $x^0=t$): $G^t{}_t=-\dfrac{3}{c^2}\left(\dfrac{\dot a^2}{a^2}+\dfrac{kc^2}{a^2}\right)$ and $G^r{}_r=-\dfrac{1}{c^2}\left(2\dfrac{\ddot a}{a}+\dfrac{\dot a^2}{a^2}+\dfrac{kc^2}{a^2}\right)$. These lead to the Friedmann equations in §1.9.
- *Schwarzschild*: $G_{\mu\nu}=0$, since $R_{\mu\nu}=0$ and $R=0$.

**(6) Takeaways.** (i) $G_{\mu\nu}=R_{\mu\nu}-\tfrac12Rg_{\mu\nu}$ is divergence-free for every metric. (ii) The ½ is forced, not chosen. (iii) $R_{\mu\nu}\propto T_{\mu\nu}$ is inconsistent with conservation. (iv) In 2D $G_{\mu\nu}\equiv0$. (v) In 4D, $G$ and Ricci are trace-reverses of each other.

**Misconceptions.** "$G_{\mu\nu}=0$ means flat": the 2-sphere and Schwarzschild are counterexamples. "The ½ was fitted to data": it is fixed by the Bianchi identity.

#### 1.6 The stress-energy tensor $T^{\mu\nu}$

**(1) Plain language.** $T^{\mu\nu}$ is a 4×4 symmetric table of "how much $\mu$-momentum flows across a surface of constant $x^\nu$". Here "0-momentum" is energy/$c$. Baez–Bunn: "The components $T_{\alpha\beta}$ of this matrix say how much momentum in the α direction is flowing in the β direction through a given point of spacetime… The flow of t-momentum in the t-direction is just the energy density… The flow of x-momentum in the x-direction is the 'pressure in the x direction'… It takes a while to figure out why pressure is really the flow of momentum, but it is eminently worth doing." — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)

**(2) Why GR needs it.** It is the source. In GR *all* of these quantities gravitate, not only mass: energy, momentum flux and pressure. Because pressure contributes as $\rho+3p/c^2$ (§1.3), a neutron star's pressure strengthens its gravity.

**(3) Layout** (SI, $x^0=ct$, so all components are in J/m³ = Pa):
$$T^{\mu\nu}=\begin{pmatrix}
T^{00} & T^{0x} & T^{0y} & T^{0z}\\
T^{x0} & T^{xx} & T^{xy} & T^{xz}\\
T^{y0} & T^{yx} & T^{yy} & T^{yz}\\
T^{z0} & T^{zx} & T^{zy} & T^{zz}
\end{pmatrix}$$

| row $\mu$ \ column $\nu$ | $\nu=0$ | $\nu=x$ | $\nu=y$ | $\nu=z$ |
|---|---|---|---|---|
| $\mu=0$ (energy) | **energy density** $u$ | energy flux $S_x/c$ | energy flux $S_y/c$ | energy flux $S_z/c$ |
| $\mu=x$ ($x$-momentum) | $c\times$ momentum density $c\,g_x$ ($=S_x/c$) | **pressure** / normal stress | shear stress | shear stress |
| $\mu=y$ | $c\,g_y$ | shear | **pressure** | shear |
| $\mu=z$ | $c\,g_z$ | shear | shear | **pressure** |

In words: $T^{00}=u$ (energy density). $T^{0i}=T^{i0}=S^i/c=c\,g^i$, where $S^i$ is energy flux (W/m²) and $g^i$ is momentum density. $T^{ij}$ is the flux of $i$-momentum in direction $j$: diagonal entries are pressures, off-diagonal entries are shear stresses. Symmetry $T^{\mu\nu}=T^{\nu\mu}$ means energy flux equals $c^2\times$ momentum density.

- **Dust** (pressureless, rest-frame mass density $\rho$): $T^{\mu\nu}=\rho u^\mu u^\nu$ (Carroll 1.106 writes $T^{\mu\nu}_{\rm dust}=\rho U^\mu U^\nu$ with $c=1$). — [Carroll notes §1](https://arxiv.org/abs/gr-qc/9712019). At rest, $u^\mu=(c,0,0,0)$, so $T^{00}=\rho c^2$ and everything else is 0. Moving with $u^\mu=\gamma(c,\vec v)$: $T^{00}=\gamma^2\rho c^2$. One factor of $\gamma$ comes from each particle's energy and one from length contraction raising the number density (my explanation).
- **Perfect fluid**: $T^{\mu\nu}=(\rho+p/c^2)u^\mu u^\nu+pg^{\mu\nu}$, with $\rho$ the rest-frame mass density and $p$ the pressure. *Rest-frame evaluation, every step* (Minkowski, $x^0=ct$, $g^{00}=-1$, $g^{ii}=+1$, $u^\mu=(c,0,0,0)$):
  - $T^{00}=(\rho+p/c^2)c^2+p(-1)=\rho c^2+p-p=\rho c^2$.
  - $T^{0i}=(\rho+p/c^2)\cdot c\cdot0+p\cdot0=0$.
  - $T^{ii}=0+p(+1)=p$, and $T^{ij}=0$ for $i\neq j$.
  - So $T^{\mu\nu}=\mathrm{diag}(\rho c^2,p,p,p)$, and $T^\mu{}_\nu=\mathrm{diag}(-\rho c^2,p,p,p)$. The trace is $T=g_{\mu\nu}T^{\mu\nu}=-\rho c^2+3p$. Sympy reproduced the mixed form and trace in FLRW (§4).
  - Special cases: dust $p=0$; radiation $p=\rho c^2/3$, so $T=0$; vacuum energy $p=-\rho c^2$, which gives $T_{\mu\nu}=-\rho c^2g_{\mu\nu}$, identical to a cosmological constant with $\rho_\Lambda=\Lambda c^2/(8\pi G)$ (my algebra: move $\Lambda g_{\mu\nu}$ to the right side and compare).
- **Electromagnetic field** (SI, $x^0=ct$, $F_{0i}=-E_i/c$, $F_{ij}=\epsilon_{ijk}B_k$): $$T^{\mu\nu}=\frac1{\mu_0}\left(F^{\mu\alpha}F^\nu{}_\alpha-\tfrac14g^{\mu\nu}F_{\alpha\beta}F^{\alpha\beta}\right).$$ Sympy verified (§4): $F_{\alpha\beta}F^{\alpha\beta}=2(B^2-E^2/c^2)$; $T^{00}=\tfrac12(\epsilon_0E^2+B^2/\mu_0)$ (field energy density); $T^{0i}=S_i/c$ with Poynting vector $\vec S=\vec E\times\vec B/\mu_0$; trace $=0$. For a pure field $\vec E=E\hat x$: $T^{xx}=-\epsilon_0E^2/2$ (tension *along* field lines) and $T^{yy}=T^{zz}=+\epsilon_0E^2/2$ (pressure sideways).

**(4) Numerical sizes: pressure vs $\rho c^2$** (computed here, $c=2.998\times10^8$ m/s):

| matter | $\rho$ (kg/m³) | $\rho c^2$ (J/m³) | $p$ (Pa) | $p/(\rho c^2)$ |
|---|---|---|---|---|
| water, 1 atm | 998 † | $8.97\times10^{19}$ | $1.013\times10^5$ † | $1.1\times10^{-15}$ |
| air, sea level | 1.204 † | $1.08\times10^{17}$ | $1.013\times10^5$ † | $9.4\times10^{-13}$ |
| Sun's core | $1.622\times10^5$ ([NASA Sun Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html)) | $1.46\times10^{22}$ | $2.477\times10^{16}$ ($2.477\times10^{11}$ bar, NASA) | $1.7\times10^{-6}$ |
| neutron-star centre | $6$–$8\times10^{17}$ ([Wikipedia, Neutron star, cross-check](https://en.wikipedia.org/wiki/Neutron_star)) | $5.4$–$7.2\times10^{34}$ | $\approx1.6\times10^{34}$ (same) | $\approx0.2$–$0.3$ |

† Standard textbook values (1 atm $=101\,325$ Pa by definition), not separately sourced this session. Wikipedia: pressure "increases accordingly, from about 3.2×10³¹ Pa… at the inner crust to 1.6×10³⁴ Pa in the center", with density "to an estimated 6×10¹⁷ or 8×10¹⁷ kg/m³ deeper inside". Its underlying references were not checked, so treat the neutron-star row as order-of-magnitude. Message for readers: in everyday matter, and even in the Sun, pressure is a negligible source of gravity next to $\rho c^2$. In neutron stars it is a sizable fraction, which is one reason GR is essential there.

**(5) Where it appears.** The right-hand side, $(8\pi G/c^4)T_{\mu\nu}$.

**(6) Takeaways.** (i) $T^{\mu\nu}$ is the flux of $\mu$-momentum through constant-$x^\nu$ surfaces. (ii) $T^{00}$ is energy density, $T^{0i}$ is energy flux/$c$, $T^{ij}$ is stress. (iii) A perfect fluid at rest is $\mathrm{diag}(\rho c^2,p,p,p)$. (iv) Pressure gravitates, but it matters only in extreme objects.

**Misconceptions.** "Only mass gravitates." "$T^{\mu\nu}$ includes gravitational energy": it does not. There is no local gravitational energy density in GR (Carroll blog, §1.7).

#### 1.7 Covariant conservation $\nabla_\mu T^{\mu\nu}=0$

**(1) Plain language.** In special relativity $\partial_\mu T^{\mu\nu}=0$ says energy and momentum are neither created nor destroyed locally: whatever leaves a small box flows through its walls. In curved spacetime the rule becomes $\nabla_\mu T^{\mu\nu}=0$ (Carroll 4.23, the "comma-goes-to-semicolon rule"). "This equation expresses the conservation of energy in the presence of a gravitational field." — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019)

**(2) Why GR needs it.** Matter's equations of motion live inside $\nabla_\mu T^{\mu\nu}=0$. For dust it implies that the particles move on geodesics. The Bianchi identity makes the field equations *require* it.

**(3) Newtonian limit, step by step** (flat or weak field, $x^0=ct$, $v\ll c$, $p\ll\rho c^2$). Approximations: $T^{00}\approx\rho c^2$, $T^{0i}\approx\rho c\,v^i$, $T^{ij}\approx\rho v^iv^j+p\,\delta^{ij}$.
- $\nu=0$: $\partial_0T^{00}+\partial_iT^{i0}=\frac1c\partial_t(\rho c^2)+\partial_i(\rho c\,v^i)=0$. Divide by $c$: $\partial_t\rho+\nabla\cdot(\rho\vec v)=0$, the **continuity equation**.
- $\nu=i$: $\frac1c\partial_t(\rho c\,v^i)+\partial_j(\rho v^iv^j+p\delta^{ij})+\Gamma^i_{00}T^{00}=0$. In the weak field $g_{00}=-(1+2\Phi/c^2)$ one finds $\Gamma^i_{00}=-\tfrac12g^{ii}\partial_ig_{00}=\partial_i\Phi/c^2$, so $\Gamma^i_{00}T^{00}=\rho\,\partial_i\Phi$. This gives $\partial_t(\rho v^i)+\partial_j(\rho v^iv^j)+\partial_ip+\rho\partial_i\Phi=0$. Subtract $v^i\times$ (continuity) to get $\rho(\partial_t\vec v+(\vec v\cdot\nabla)\vec v)=-\nabla p-\rho\nabla\Phi$, the **Euler equation with gravity**.
- (My derivation. The Christoffel symbol uses the same weak-field metric that sympy used to recover Poisson's equation, §1.9.)

**(4) FLRW worked example, every step** ($x^0=t$, $g=\mathrm{diag}(-c^2,a^2\tilde g_{ij})$, comoving fluid $u^\mu=(1,0,0,0)$):
- Components: $T^{tt}=(\rho+p/c^2)\cdot1+p\,g^{tt}=\rho+\frac p{c^2}-\frac p{c^2}=\rho$, and $T^{ij}=p\,g^{ij}=\frac p{a^2}\tilde g^{ij}$.
- Christoffels needed: $\Gamma^i_{tj}=\frac{\dot a}a\delta^i_j$, so $\Gamma^\mu_{\mu t}=3\dot a/a$. Also $\Gamma^t_{ij}=\tfrac12g^{tt}(-\partial_tg_{ij})=\tfrac12(-\tfrac1{c^2})(-2a\dot a\tilde g_{ij})=\frac{a\dot a}{c^2}\tilde g_{ij}$.
- $\nabla_\mu T^{\mu t}=\partial_tT^{tt}+\Gamma^\mu_{\mu\lambda}T^{\lambda t}+\Gamma^t_{\mu\lambda}T^{\mu\lambda}=\dot\rho+3\frac{\dot a}a\rho+\frac{a\dot a}{c^2}\tilde g_{ij}\frac{p}{a^2}\tilde g^{ij}=\dot\rho+3\frac{\dot a}{a}\rho+3\frac{\dot a}a\frac p{c^2}$, using $\tilde g_{ij}\tilde g^{ij}=3$.
- So $$\dot\rho+3\frac{\dot a}{a}\Big(\rho+\frac{p}{c^2}\Big)=0\qquad(\text{sympy}\ \checkmark;\ \text{spatial components vanish identically}).$$
- Equation of state $p=w\rho c^2$: $\frac{d\rho}{dt}=-3(1+w)\rho\frac{\dot a}{a}$, so $\frac{d\rho}{\rho}=-3(1+w)\frac{da}{a}$, so $\ln\rho=-3(1+w)\ln a+\text{const}$, so $\boxed{\rho\propto a^{-3(1+w)}}$ (sympy `dsolve` ✓).
  - Matter ($w=0$): $\rho\propto a^{-3}$, number density diluting with volume. Carroll: "simply interpreted as the decrease in the number density of particles as the universe expands." — [Carroll notes §8](https://arxiv.org/abs/gr-qc/9712019)
  - Radiation ($w=1/3$): $\rho\propto a^{-4}$, volume dilution $a^{-3}$ times redshift of each photon $a^{-1}$.
  - Cosmological constant ($w=-1$): $\rho=$ const.

**(5) Why global energy conservation is subtle.**
- Only when spacetime has a Killing vector $\xi$ does local conservation integrate to a conserved total. Then $\nabla_\mu(T^{\mu\nu}\xi_\nu)=(\nabla_\mu T^{\mu\nu})\xi_\nu+T^{\mu\nu}\nabla_\mu\xi_\nu=0+T^{\mu\nu}\nabla_{(\mu}\xi_{\nu)}=0$, using the symmetry of $T$ and Killing's equation (my derivation).
- FLRW has "a number of spacelike Killing vectors, but no timelike Killing vector to give us a notion of conserved energy." — [Carroll notes §8](https://arxiv.org/abs/gr-qc/9712019)
- Carroll's blog: "back when you thought energy was conserved, there was a reason why you thought that, namely time-translation invariance". Photons "redshift, losing energy as space expands". Vacuum-energy density is constant while volume grows, so total vacuum energy increases. Some prefer to say "energy is conserved in general relativity, it's just that you have to include the energy of the gravitational field", and that "there's energy in the gravitational field, but it's negative". Carroll accepts this framing only with careful definitions, because gravitational energy has no well-defined local density. — [Carroll, "Energy Is Not Conserved" (blog, 22 Feb 2010)](https://www.preposterousuniverse.com/blog/2010/02/22/energy-is-not-conserved/)

**(6) Takeaways.** (i) $\nabla_\mu T^{\mu\nu}=0$ is local energy-momentum conservation. (ii) It reduces to continuity plus Euler-with-gravity. (iii) In FLRW it gives $\rho\propto a^{-3(1+w)}$. (iv) A globally conserved energy needs a timelike Killing vector, which an expanding universe lacks.

**Misconception.** "$\nabla_\mu T^{\mu\nu}=0$ means total energy is conserved": not without a symmetry.

#### 1.8 The Bianchi identities

**(1) Plain language.** These are two "always-true" identities of curvature, like $\nabla\times(\nabla f)=0$ or $\nabla\cdot(\nabla\times\vec F)=0$ from vector calculus. MTW's slogan: **"the boundary of a boundary is zero."** MTW ch. 15 is titled "Bianchi Identities and the Boundary of a Boundary" (a Track-2 chapter using differential forms). The geometric picture: parallel-transport a vector around every face of a tiny cube. The faces together form the cube's boundary, which has no boundary itself, so the contributions of the three pairs of opposing faces cancel. A Preskill–Thorne foreword credits Élie Cartan (1928) with the idea and Misner and Wheeler with bringing it to physicists in 1971. — [U. Washington Physics 544 lecture 20 (reproducing MTW ch. 15)](https://faculty.washington.edu/seattle/physics544/2011-lectures/lecture-20.pdf); [PhysicsOverflow quoting Preskill & Thorne's foreword to *Feynman Lectures on Gravitation*](https://www.physicsoverflow.org/36083). One secondary source cites the chapter as ch. 16, but the lecture heading supports ch. 15.

**(2) Why GR needs it.** The contracted identity $\nabla^\mu G_{\mu\nu}=0$ holds for *every* metric. Taking the divergence of $G_{\mu\nu}=\kappa T_{\mu\nu}$ then *forces* $\nabla^\mu T_{\mu\nu}=0$. The geometry will not accept a source that is not conserved. Electromagnetism offers an analogue: antisymmetry of $F^{\mu\nu}$ makes $\partial_\mu\partial_\nu F^{\mu\nu}=0$, so $\partial_\mu F^{\nu\mu}=\mu_0J^\nu$ forces charge conservation (my analogy). Gauss's law plus the Ampère–Maxwell law similarly require $\partial_t\rho_q+\nabla\cdot\vec J=0$.

**(3) Mechanics.**
- *First (algebraic)*: $R^\rho{}_{[\sigma\mu\nu]}=0$, i.e. $R^\rho{}_{\sigma\mu\nu}+R^\rho{}_{\mu\nu\sigma}+R^\rho{}_{\nu\sigma\mu}=0$. 2-sphere check with $\rho=\theta$, $(\sigma\mu\nu)=(\phi\theta\phi)$: $R^\theta{}_{\phi\theta\phi}+R^\theta{}_{\theta\phi\phi}+R^\theta{}_{\phi\phi\theta}=\sin^2\theta+0-\sin^2\theta=0$ ✓.
- *Second (differential)* (Carroll 3.87): $\nabla_{[\lambda}R_{\rho\sigma]\mu\nu}=0$, i.e. $\nabla_\lambda R_{\rho\sigma\mu\nu}+\nabla_\rho R_{\sigma\lambda\mu\nu}+\nabla_\sigma R_{\lambda\rho\mu\nu}=0$. Carroll: "closely related to the Jacobi identity", $[[\nabla_\lambda,\nabla_\rho],\nabla_\sigma]+$ cyclic $=0$ (3.89). — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)
- *Contracting twice (Carroll 3.93), every step.* $\nabla g=0$, so $g$ moves freely through $\nabla$.
  - Multiply by $g^{\nu\sigma}$:
    - Term 1: $g^{\nu\sigma}\nabla_\lambda R_{\rho\sigma\mu\nu}=\nabla_\lambda(g^{\nu\sigma}R_{\rho\sigma\mu\nu})$. Use first-pair antisymmetry: $g^{\nu\sigma}R_{\rho\sigma\mu\nu}=-g^{\nu\sigma}R_{\sigma\rho\mu\nu}=-R^\nu{}_{\rho\mu\nu}=+R^\nu{}_{\rho\nu\mu}=R_{\rho\mu}$. So term 1 $=\nabla_\lambda R_{\rho\mu}$.
    - Term 2: $g^{\nu\sigma}\nabla_\rho R_{\sigma\lambda\mu\nu}=\nabla_\rho R^\nu{}_{\lambda\mu\nu}=-\nabla_\rho R^\nu{}_{\lambda\nu\mu}=-\nabla_\rho R_{\lambda\mu}$.
    - Term 3: $g^{\nu\sigma}\nabla_\sigma R_{\lambda\rho\mu\nu}=\nabla^\nu R_{\lambda\rho\mu\nu}$.
    - Result: $\nabla_\lambda R_{\rho\mu}-\nabla_\rho R_{\lambda\mu}+\nabla^\nu R_{\lambda\rho\mu\nu}=0$.
  - Multiply by $g^{\mu\lambda}$:
    - Term 1: $\nabla^\mu R_{\rho\mu}$.
    - Term 2: $-\nabla_\rho(g^{\mu\lambda}R_{\lambda\mu})=-\nabla_\rho R$.
    - Term 3: $\nabla^\nu(g^{\mu\lambda}R_{\lambda\rho\mu\nu})=\nabla^\nu R^\mu{}_{\rho\mu\nu}=\nabla^\nu R_{\rho\nu}$.
  - Sum: $2\nabla^\mu R_{\rho\mu}-\nabla_\rho R=0$, so $\boxed{\nabla^\mu R_{\rho\mu}=\tfrac12\nabla_\rho R}$ (Carroll 3.94).
  - Then $\nabla^\mu G_{\mu\nu}=\nabla^\mu R_{\mu\nu}-\tfrac12g_{\mu\nu}\nabla^\mu R=\tfrac12\nabla_\nu R-\tfrac12\nabla_\nu R=0$ (Carroll 3.96). ✓ sympy on a generic metric (§4).

**(5) Where it appears.** It reduces the 10 field equations to 6 independent ones (§1.9), splits them into 4 constraints plus 6 evolution equations (Carroll 4.81–4.83), and guarantees $\nabla_\mu T^{\mu\nu}=0$.

**(6) Takeaways.** (i) First Bianchi is algebraic (cyclic) and second Bianchi is differential. (ii) Contracting twice gives $\nabla^\mu G_{\mu\nu}=0$. (iii) Hence the source *must* be conserved. (iv) "The boundary of a boundary is zero" is the geometric slogan.

**Misconception.** "Conservation of $T$ is an extra assumption in GR": it is a consequence of the field equations plus the Bianchi identity.

#### 1.9 Einstein's field equations

**(1) Statement** (SI): $$G_{\mu\nu}+\Lambda g_{\mu\nu}=\frac{8\pi G}{c^4}T_{\mu\nu}.$$ In geometric units ($G=c=1$): $G_{\mu\nu}+\Lambda g_{\mu\nu}=8\pi T_{\mu\nu}$. In Baez–Bunn units ($c=8\pi G=1$): $G_{\alpha\beta}=T_{\alpha\beta}$. Carroll's notes use $c=1$: $R_{\mu\nu}-\tfrac12Rg_{\mu\nu}=8\pi GT_{\mu\nu}$ (4.52).
- Units check (SI, $x^0=ct$): $G_{\mu\nu}$ has units m⁻² and $T_{\mu\nu}$ has units J/m³. The coupling is $8\pi G/c^4=2.077\times10^{-43}$ m/J (computed here), so J/m³ × m/J = m⁻² ✓. The inverse, $c^4/8\pi G=4.8\times10^{42}$ N, is a measure of how "stiff" spacetime is.
- Fixing $8\pi G$: Carroll matches the 00 component to Poisson's equation, "if we set κ = 8πG". — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019). Sympy reproduced this (§4). With $g_{tt}=-(1+2\Phi/c^2)c^2$ and $g_{ij}=(1-2\Phi/c^2)\delta_{ij}$, to first order $R_{tt}=\nabla^2\Phi$. For dust, $\kappa(T_{tt}-\tfrac12Tg_{tt})=\frac{8\pi G}{c^4}(\rho c^4-\tfrac12\rho c^4)=4\pi G\rho$, which gives $\nabla^2\Phi=4\pi G\rho$. With pressure the same steps give $\nabla^2\Phi=4\pi G(\rho+3p/c^2)$.

**(2) Counting** (Carroll notes ch. 4, just after eq. 4.52): "There are ten independent equations (since both sides are symmetric two-index tensors), which seems to be exactly right for the ten unknown functions of the metric components. However, the Bianchi identity $\nabla^\mu G_{\mu\nu}=0$ represents four constraints… so there are only six truly independent equations." This matches the four coordinate freedoms: "four unphysical degrees of freedom in $g_{\mu\nu}$ (represented by the four functions $x^{\mu'}(x^\mu)$)". — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019)

**(3) PDE character.** $G_{\mu\nu}$ contains $\partial^2g$ (through $\partial\Gamma$) and $g^{-1}(\partial g)^2$ (through $\Gamma\Gamma$). The equations are therefore **second order**, **nonlinear** (products of $\Gamma$s and the inverse metric), and **coupled** (each equation mixes several metric functions). Carroll: nonlinearity "is shared by most gauge theories… [electromagnetism] is actually the exception". — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019)

**(4) Trace-reversed form, every step.** Trace $G_{\mu\nu}+\Lambda g_{\mu\nu}=\kappa T_{\mu\nu}$ with $g^{\mu\nu}$, writing $\kappa=8\pi G/c^4$. Using $g^{\mu\nu}R_{\mu\nu}=R$ and $g^{\mu\nu}g_{\mu\nu}=4$: $R-2R+4\Lambda=\kappa T$, so $R=4\Lambda-\kappa T$. Substitute back into $R_{\mu\nu}=\kappa T_{\mu\nu}-\Lambda g_{\mu\nu}+\tfrac12Rg_{\mu\nu}$:
$$R_{\mu\nu}=\kappa T_{\mu\nu}-\Lambda g_{\mu\nu}+\tfrac12(4\Lambda-\kappa T)g_{\mu\nu}=\kappa\Big(T_{\mu\nu}-\tfrac12Tg_{\mu\nu}\Big)+\Lambda g_{\mu\nu}.$$
**Vacuum** ($T_{\mu\nu}=0$, $\Lambda=0$): $R_{\mu\nu}=0$.

**(5) Worked example A: solving $R_{\mu\nu}=0$ for Schwarzschild as ODEs** (structure as in Carroll ch. 7; components re-derived by sympy). Ansatz: $ds^2=-e^{2\alpha(r)}c^2dt^2+e^{2\beta(r)}dr^2+r^2d\Omega^2$. Sympy:
- $R_{tt}=\frac{c^2e^{2(\alpha-\beta)}}{r}\big[r(\alpha''+\alpha'^2-\alpha'\beta')+2\alpha'\big]$,
- $R_{rr}=-\alpha''-\alpha'^2+\alpha'\beta'+\frac{2\beta'}r$,
- $R_{\theta\theta}=e^{-2\beta}\big[r(\beta'-\alpha')-1\big]+1$.

Step 1: $\frac{e^{2(\beta-\alpha)}}{c^2}R_{tt}+R_{rr}=\frac2r(\alpha'+\beta')=0$, so $\beta=-\alpha$ (an additive constant can be absorbed by rescaling $t$).
Step 2: put $\beta=-\alpha$ into $R_{\theta\theta}=0$: $1-e^{2\alpha}(2r\alpha'+1)=0$. With $h\equiv e^{2\alpha}$, $2r\alpha'e^{2\alpha}+e^{2\alpha}=rh'+h=(rh)'$, so the equation becomes $(rh)'=1$.
Step 3: integrate: $rh=r-r_s$, so $h=1-r_s/r$ (sympy `dsolve` gives $(C_1+r)/r$).
Step 4: compare with the Newtonian $g_{tt}\approx-(1+2\Phi/c^2)c^2$, $\Phi=-GM/r$, to get $r_s=2GM/c^2$.
- **Direct check**: sympy computed all 16 components of $R_{\mu\nu}$ for the Schwarzschild metric and found them identically zero (§4).

**(6) Worked example B: FLRW leads to the Friedmann equations** (sympy, $x^0=t$, perfect fluid). From the $tt$ equation: $$\Big(\frac{\dot a}{a}\Big)^2=\frac{8\pi G}{3}\rho-\frac{kc^2}{a^2}+\frac{\Lambda c^2}{3}.$$ From the $rr$ equation: $$\frac{\ddot a}{a}=-\frac{4\pi G}{3}\Big(\rho+\frac{3p}{c^2}\Big)+\frac{\Lambda c^2}{3}.$$ The second agrees with Baez–Bunn's $\rho+3P$ (their eq. 3 has "$= -\tfrac12(\rho+3P)$" for the ball, and with Λ, $-\tfrac12(\rho+3P-2\Lambda)$ in their units). — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)

**(7) Birkhoff's theorem.** "The fact that the Schwarzschild metric is not just a good solution, but is the unique spherically symmetric vacuum solution, is known as Birkhoff's theorem… we did not demand that the source itself be static; it could be a collapsing star, as long as the collapse were symmetric." Consequently a spherical supernova emits essentially no gravitational radiation. — [Carroll notes §7](https://arxiv.org/abs/gr-qc/9712019)

**(8) Takeaways.** (i) 10 equations, of which 6 are independent and 4 are gauge. (ii) Second-order, nonlinear, coupled PDEs. (iii) Trace-reversal gives $R_{\mu\nu}=\kappa(T_{\mu\nu}-\tfrac12Tg_{\mu\nu})+\Lambda g_{\mu\nu}$. (iv) Vacuum means $R_{\mu\nu}=0$. (v) Spherical symmetry plus vacuum gives Schwarzschild (Birkhoff).

**Misconceptions.** "Ten equations determine all ten metric functions": four are coordinate choices. "Vacuum Einstein equations mean flat spacetime": no, Weyl curvature survives.

#### 1.10 Differential equations that describe curved spacetime

- **Geodesic equation as ODEs.** $\dfrac{d^2x^\mu}{d\tau^2}+\Gamma^\mu_{\alpha\beta}\dfrac{dx^\alpha}{d\tau}\dfrac{dx^\beta}{d\tau}=0$: four coupled second-order ODEs, plus the constraint $g_{\mu\nu}\dot x^\mu\dot x^\nu=-c^2$ for massive particles. For Schwarzschild they reduce, through the conserved $E$ and $L$, to a single first-order radial ODE (§1.11). Sympy confirmed that the $t$- and $\phi$-geodesic equations are exactly $\frac{d}{d\tau}[(1-r_s/r)\dot t]=0$ and $\frac{d}{d\tau}[r^2\dot\phi]=0$ (§4).
- **Covariant wave equation.** $\Box\phi=g^{\mu\nu}\nabla_\mu\nabla_\nu\phi=\frac{1}{\sqrt{-g}}\partial_\mu(\sqrt{-g}\,g^{\mu\nu}\partial_\nu\phi)=0$. The second form uses $\Gamma^\mu_{\mu\lambda}=\partial_\lambda\ln\sqrt{-g}$.
  - *Flat spacetime, spherical coordinates* (sympy): $\sqrt{-g}=c\,r^2\sin\theta$ and $\Box\phi=-\frac1{c^2}\partial_t^2\phi+\partial_r^2\phi+\frac2r\partial_r\phi+\frac1{r^2}\partial_\theta^2\phi+\frac{\cot\theta}{r^2}\partial_\theta\phi+\frac1{r^2\sin^2\theta}\partial_\phi^2\phi$. This is the familiar spherical Laplacian from Calc III.
  - *Flat FLRW* (sympy): $\Box\psi=-\frac1{c^2}\big(\ddot\psi+3\frac{\dot a}a\dot\psi\big)+\frac1{a^2}\nabla^2\psi$. The $3H\dot\psi$ term is "Hubble friction".
  - *Schwarzschild*: $\sqrt{-g}=c\,r^2\sin\theta$, the same as flat space, because $g_{tt}g_{rr}=-c^2$.
- **Minimal coupling.** Replace $\eta_{\mu\nu}\to g_{\mu\nu}$ and $\partial_\mu\to\nabla_\mu$ ("comma-goes-to-semicolon rule"). Example: $\partial_\mu T^{\mu\nu}=0\to\nabla_\mu T^{\mu\nu}=0$. Carroll calls this the "Principle of Covariance", "really a consequence of the EEP plus the requirement that the laws of physics be independent of coordinates", and warns "life is not always so easy". — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019). Caveat (my note): since $\nabla$'s do not commute, the rule is ambiguous whenever flat-space equations contain second derivatives whose order mattered nowhere before. Curvature-coupling terms (e.g. $\xi R\phi^2$) are invisible in flat space.
- **Initial-value (3+1/ADM) formulation.** Carroll shows that the four equations $G^{0\nu}=8\pi GT^{0\nu}$ contain no second time derivatives (because $\nabla_\mu G^{\mu\nu}=0$ forbids third time derivatives). They "cannot be used to evolve the initial data… Rather, they serve as constraints". The six $G^{ij}=8\pi GT^{ij}$ "are the dynamical evolution equations", which leaves a "fourfold ambiguity", the coordinate freedom. Harmonic gauge $\Box x^\mu=0$ fixes it. — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019). The modern numerical formalism slices spacetime into spacelike hypersurfaces with a **lapse function** (how much proper time between slices) and a **shift vector** (how spatial coordinates slide between slices). It splits Einstein's equations into the **Hamiltonian constraint**, the **momentum constraint** and evolution equations. Practical difficulties named in Gourgoulhon's table of contents include "constraint-violating modes", the need for "symmetric hyperbolic formulations", and gauge choices for lapse and shift. — [Gourgoulhon, *3+1 Formalism and Bases of Numerical Relativity*, arXiv gr-qc/0703035](https://arxiv.org/abs/gr-qc/0703035)
- Why numerical relativity is hard (my synthesis of the above): nonlinear coupled PDEs, constraints that must stay satisfied while numerical error drives them away, coordinates that are part of the unknowns and can themselves become singular, and physical singularities inside black holes.

**Takeaways.** (i) Particles obey ODEs (geodesics). (ii) Fields obey PDEs with $\partial\to\nabla$. (iii) The spherical-coordinate Laplacian is already a "curved-coordinate" $\Box$. (iv) Einstein's equations split into 4 constraints and 6 evolution equations.

#### 1.11 Symmetries, Killing vectors and conserved quantities

**(1) Plain language.** A Killing vector field points in a direction along which you can slide the whole geometry without changing any distance. Examples are rotating a sphere or shifting flat space. Each such symmetry gives a conserved quantity for free-falling particles.

**(2) Mechanics.**
- *Killing's equation* (Carroll 5.42): $\nabla_\mu\xi_\nu+\nabla_\nu\xi_\mu=0$, i.e. $\nabla_{(\mu}\xi_{\nu)}=0$. It is equivalent to the Lie derivative condition $\mathcal L_\xi g_{\mu\nu}=0$ (5.41). — [Carroll notes §5](https://arxiv.org/abs/gr-qc/9712019)
- *Coordinate shortcut.* If $\partial_{\star}g_{\mu\nu}=0$ for some coordinate $x^\star$, then $\xi=\partial_\star$ (components $\xi^\mu=\delta^\mu_\star$) is Killing. Elementary proof (my derivation): $\xi_\nu=g_{\nu\star}$, so $\nabla_\mu\xi_\nu=\partial_\mu g_{\nu\star}-\Gamma^\lambda_{\mu\nu}g_{\lambda\star}=\partial_\mu g_{\nu\star}-\tfrac12(\partial_\mu g_{\nu\star}+\partial_\nu g_{\mu\star}-\partial_\star g_{\mu\nu})=\tfrac12(\partial_\mu g_{\nu\star}-\partial_\nu g_{\mu\star})+\tfrac12\partial_\star g_{\mu\nu}$. The first bracket is antisymmetric in $\mu\nu$, so it drops out when you symmetrize, leaving $\nabla_\mu\xi_\nu+\nabla_\nu\xi_\mu=\partial_\star g_{\mu\nu}=0$ ✓. Carroll states this result: "if the metric is independent of one of the coordinates… the partial derivative vector field associated with that coordinate generates a symmetry".
- *Conserved quantity along geodesics* (Carroll 5.43), with $U^\mu=dx^\mu/d\lambda$: $U^\nu\nabla_\nu(\xi_\mu U^\mu)=U^\nu U^\mu\nabla_\nu\xi_\mu+\xi_\mu U^\nu\nabla_\nu U^\mu=0$. "The first term vanishes from Killing's equation and the second from the fact that $x^\mu(\lambda)$ is a geodesic." The first term vanishes because $U^\nu U^\mu$ is symmetric, so only $\nabla_{(\nu}\xi_{\mu)}=0$ contributes. Physically: "a free particle will not feel any 'forces' in this direction". — [Carroll notes §5](https://arxiv.org/abs/gr-qc/9712019)
- *Maximum count.* An $n$-dimensional space has at most $n(n+1)/2$ Killing vectors, from $n$ translations and $n(n-1)/2$ rotations (Carroll 5.44). In 2D the maximum is 3 (sphere, plane). In 4D it is 10: Minkowski has 4 translations, 3 rotations and 3 boosts. — [Carroll notes §5](https://arxiv.org/abs/gr-qc/9712019)

**(3) Worked examples.**
- *Plane* (Carroll 5.45–5.46): $X=\partial_x$ and $Y=\partial_y$ (translations), and $R^\mu=(-y,x)$, i.e. $\partial_\theta$ in polar coordinates.
- *2-sphere: 3 Killing vectors* (sympy-verified, §4): $R=\partial_\phi$; $S=-\sin\phi\,\partial_\theta-\cot\theta\cos\phi\,\partial_\phi$; $T=\cos\phi\,\partial_\theta-\cot\theta\sin\phi\,\partial_\phi$. These are rotations about the $z$, $x$ and $y$ axes. Counter-check: $\partial_\theta$ is **not** Killing. Sympy gives the $\phi\phi$ component of $\nabla_\mu\xi_\nu+\nabla_\nu\xi_\mu$ as $a^2\sin2\theta\neq0$, so sliding every point toward the equator changes distances (circles of latitude change length).
- *Schwarzschild.* $g_{\mu\nu}$ does not depend on $t$ or $\phi$, so $\partial_t$ and $\partial_\phi$ are Killing. (Spherical symmetry adds the other two rotations, for 4 in total.) Define, per unit mass, with $\theta=\pi/2$ and overdots meaning $d/d\tau$:
  $$E\equiv-\xi_\mu u^\mu=-g_{tt}\dot t=\Big(1-\frac{r_s}r\Big)c^2\,\dot t,\qquad L\equiv\psi_\mu u^\mu=g_{\phi\phi}\dot\phi=r^2\dot\phi .$$
  $E$ is in J/kg; a particle at rest at infinity has $E=c^2$. Sympy confirmed that the $t$- and $\phi$-components of the geodesic equation are exactly $\dot E=0$ and $\dot L=0$.
  *Effective potential, every step.* The normalization $g_{\mu\nu}u^\mu u^\nu=-c^2$ reads
  $$-\Big(1-\frac{r_s}r\Big)c^2\dot t^2+\Big(1-\frac{r_s}r\Big)^{-1}\dot r^2+r^2\dot\phi^2=-c^2 .$$
  Substitute $\dot t=\dfrac{E}{c^2(1-r_s/r)}$ and $\dot\phi=\dfrac{L}{r^2}$:
  $$-\frac{E^2}{c^2(1-r_s/r)}+\frac{\dot r^2}{1-r_s/r}+\frac{L^2}{r^2}=-c^2 .$$
  Multiply by $(1-r_s/r)$: $-\frac{E^2}{c^2}+\dot r^2+\big(1-\frac{r_s}r\big)\frac{L^2}{r^2}=-c^2\big(1-\frac{r_s}r\big)$.
  Rearrange: $\dot r^2=\frac{E^2}{c^2}-\big(1-\frac{r_s}r\big)\big(c^2+\frac{L^2}{r^2}\big)$.
  Halve and expand, using $r_sc^2/2=GM$ and $r_s/2=GM/c^2$:
  $$\boxed{\tfrac12\dot r^2+V_{\rm eff}(r)=\frac{E^2-c^4}{2c^2},\qquad V_{\rm eff}=-\frac{GM}{r}+\frac{L^2}{2r^2}-\frac{GML^2}{c^2r^3}}\quad(\text{sympy}\ \checkmark).$$
  The first two terms are Newton's effective potential. The $1/r^3$ term is the GR correction, which causes perihelion precession. Circular orbits, $V'_{\rm eff}=0$: $r=\dfrac{L^2}{2GM}\pm\dfrac{L\sqrt{L^2c^2-12G^2M^2}}{2GMc}$ (sympy). The two roots merge when $L^2=12G^2M^2/c^2$, at $r=6GM/c^2=3r_s$, the innermost stable circular orbit.
- **Noether link.** Each continuous symmetry corresponds to a conserved quantity: time translation to energy, rotation to angular momentum. Carroll ties the textbook belief in energy conservation to "time-translation invariance". — [Carroll blog](https://www.preposterousuniverse.com/blog/2010/02/22/energy-is-not-conserved/). In Lagrangian language (my note): if $L(x,\dot x)$ does not contain $x^\star$, the Euler–Lagrange equation $\frac{d}{d\lambda}\frac{\partial L}{\partial\dot x^\star}=\frac{\partial L}{\partial x^\star}=0$ conserves $p_\star$. This is the same statement as the Killing shortcut.

**Takeaways.** (i) Killing vectors are the symmetries of the metric, defined by $\nabla_{(\mu}\xi_{\nu)}=0$. (ii) A coordinate missing from the metric gives a Killing vector. (iii) $p_\mu\xi^\mu$ is conserved along geodesics. (iv) The sphere has 3 Killing vectors and Minkowski has 10. (v) Schwarzschild's $E$ and $L$ give the orbit equation.

**Misconceptions.** "More Killing vectors than dimensions is impossible": the sphere has 3 in 2D. Carroll: "a set of Killing vector fields can be linearly independent, even though at any one point" they are not. "Every spacetime has a conserved energy": only those with a timelike Killing vector do.

#### 1.12 Variational calculus and the Einstein–Hilbert action

**(1) Plain language.** A *function* eats a number and returns a number. A **functional** eats a whole function or path and returns a number, such as the length of a curve or the travel time along it. Physics laws can be stated as "the actual path makes the functional stationary".

**(2) Mechanics: the Euler–Lagrange equation from $\delta S=0$, every step.** Let $S[y]=\int_a^bL(x,y,y')\,dx$ with endpoints fixed. Perturb $y\to y+\epsilon\eta(x)$ with $\eta(a)=\eta(b)=0$.
1. $\dfrac{dS}{d\epsilon}\Big|_{\epsilon=0}=\displaystyle\int_a^b\Big(\frac{\partial L}{\partial y}\eta+\frac{\partial L}{\partial y'}\eta'\Big)dx$ (chain rule).
2. Integrate the second term by parts (Calc II): $\displaystyle\int_a^b\frac{\partial L}{\partial y'}\eta'\,dx=\Big[\frac{\partial L}{\partial y'}\eta\Big]_a^b-\int_a^b\frac{d}{dx}\Big(\frac{\partial L}{\partial y'}\Big)\eta\,dx$. The boundary term is 0 because $\eta(a)=\eta(b)=0$.
3. So $\delta S=\displaystyle\int_a^b\Big[\frac{\partial L}{\partial y}-\frac{d}{dx}\frac{\partial L}{\partial y'}\Big]\eta\,dx=0$ for *every* $\eta$.
4. If the bracket were nonzero somewhere, choose $\eta$ to be a bump there with the same sign, which makes the integral nonzero (fundamental lemma). Therefore $$\boxed{\frac{\partial L}{\partial y}-\frac{d}{dx}\frac{\partial L}{\partial y'}=0.}$$

**(3) Worked example: the shortest path in a plane is a straight line** (sympy ✓). Arc length is the Calc II formula $S=\int_a^b\sqrt{1+y'^2}\,dx$, so $L=\sqrt{1+y'^2}$.
- $\partial L/\partial y=0$.
- $\partial L/\partial y'=y'/\sqrt{1+y'^2}$.
- Euler–Lagrange: $\frac{d}{dx}\big[y'/\sqrt{1+y'^2}\big]=0$, so $y'/\sqrt{1+y'^2}=C$.
- Square: $y'^2=C^2(1+y'^2)$, so $y'^2(1-C^2)=C^2$, so $y'=C/\sqrt{1-C^2}\equiv m$, a constant.
- Hence $y=mx+b$, a straight line.
- Sympy's `euler_equations` gives $y''/(1+y'^2)^{3/2}=0$, and `dsolve` gives $y=C_1+C_2x$.

**Brachistochrone (brief).** Find the curve of fastest frictionless descent. With $y$ measured downward, $v=\sqrt{2gy}$, so $T=\int\frac{ds}{v}$ and $L=\sqrt{(1+y'^2)/(2gy)}$. $L$ has no explicit $x$, so the Beltrami identity $L-y'\partial L/\partial y'=$ const applies and reduces to $y(1+y'^2)=$ const $\equiv2R$. Sympy confirmed that the cycloid $x=R(s-\sin s)$, $y=R(1-\cos s)$ satisfies $(1+y'^2)y=2R$.

**(4) The geodesic action.** Proper time $\tau=\frac1c\int\sqrt{-g_{\mu\nu}\dot x^\mu\dot x^\nu}\,d\lambda$. Timelike geodesics extremize it (locally maximize it, which is the twin "paradox"). An equivalent and easier Lagrangian with affine parameter is $L=\tfrac12g_{\mu\nu}\dot x^\mu\dot x^\nu$. Euler–Lagrange, step by step:
- $\frac{\partial L}{\partial\dot x^\mu}=g_{\mu\nu}\dot x^\nu$.
- $\frac{d}{d\lambda}(g_{\mu\nu}\dot x^\nu)=g_{\mu\nu}\ddot x^\nu+\partial_\alpha g_{\mu\nu}\dot x^\alpha\dot x^\nu$.
- $\frac{\partial L}{\partial x^\mu}=\tfrac12\partial_\mu g_{\alpha\beta}\dot x^\alpha\dot x^\beta$.
- Set the difference to zero and symmetrize $\partial_\alpha g_{\mu\nu}\dot x^\alpha\dot x^\nu=\tfrac12(\partial_\alpha g_{\mu\beta}+\partial_\beta g_{\mu\alpha})\dot x^\alpha\dot x^\beta$: $g_{\mu\nu}\ddot x^\nu+\tfrac12(\partial_\alpha g_{\mu\beta}+\partial_\beta g_{\mu\alpha}-\partial_\mu g_{\alpha\beta})\dot x^\alpha\dot x^\beta=0$.
- Multiply by $g^{\sigma\mu}$: $\ddot x^\sigma+\Gamma^\sigma_{\alpha\beta}\dot x^\alpha\dot x^\beta=0$, the geodesic equation.
- Sympy check on the sphere: $\ddot\theta-\sin\theta\cos\theta\,\dot\phi^2=0$ and $\ddot\phi+2\cot\theta\,\dot\theta\dot\phi=0$, matching $\Gamma^\theta_{\phi\phi}$ and $\Gamma^\phi_{\theta\phi}$.

**(5) The Einstein–Hilbert action.** In the commonly quoted form: $$S=\frac{c^4}{16\pi G}\int(R-2\Lambda)\sqrt{-g}\,d^4x+S_M.$$ (Unit caveat in §3: with $d^4x=d(ct)\,d^3x$ the SI prefactor for an action in J·s is $c^3/16\pi G$. Overall constants do not change the field equations as long as $S_M$ uses the same measure.)
- *Why $\sqrt{-g}$*: it makes $\sqrt{-g}\,d^4x$ the invariant volume element. In flat polar coordinates the familiar Jacobian is $dA=r\,dr\,d\theta=\sqrt{\det g}\,dr\,d\theta$. The minus sign appears because $\det g<0$ in Lorentzian signature.
- *Why $R$*: Carroll argues that a nontrivial scalar must involve second derivatives of the metric, because first derivatives can be set to zero at a point, and $R$ is the simplest such scalar. — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019)
- **Variation, step by step** (Carroll 4.56–4.70). Write $R\sqrt{-g}=g^{\mu\nu}R_{\mu\nu}\sqrt{-g}$ and vary the inverse metric $g^{\mu\nu}$:
  1. $\delta(g^{\mu\nu}R_{\mu\nu}\sqrt{-g})=\underbrace{R_{\mu\nu}\sqrt{-g}\,\delta g^{\mu\nu}}_{(\delta S)_2}+\underbrace{g^{\mu\nu}\delta R_{\mu\nu}\sqrt{-g}}_{(\delta S)_1}+\underbrace{R\,\delta\sqrt{-g}}_{(\delta S)_3}$.
  2. **Palatini identity**: $\delta R_{\mu\nu}=\nabla_\lambda(\delta\Gamma^\lambda_{\nu\mu})-\nabla_\nu(\delta\Gamma^\lambda_{\lambda\mu})$, so $g^{\mu\nu}\delta R_{\mu\nu}=\nabla_\sigma\big[g^{\mu\nu}\delta\Gamma^\sigma_{\mu\nu}-g^{\mu\sigma}\delta\Gamma^\lambda_{\lambda\mu}\big]$ (Carroll 4.61). This is a total covariant divergence, which "by Stokes's theorem… is equal to a boundary contribution at infinity which we can set to zero by making the variation vanish at infinity". So $(\delta S)_1=0$.
  3. **Determinant**: $\mathrm{Tr}\ln M=\ln\det M$ gives $\mathrm{Tr}(M^{-1}\delta M)=\delta(\det M)/\det M$ (4.62–4.63). Applied to $M=g^{\mu\nu}$, this gives (4.65) $$\delta\sqrt{-g}=-\tfrac12\sqrt{-g}\,g_{\mu\nu}\,\delta g^{\mu\nu}.$$ Sympy checked this numerically on a random symmetric 4×4 Lorentzian metric: $-0.345877346846942$ vs $-0.345877346846942$ (§4).
  4. Combine: $\delta S_H=\int d^4x\sqrt{-g}\,\big(R_{\mu\nu}-\tfrac12Rg_{\mu\nu}\big)\delta g^{\mu\nu}$ (4.66). The $-2\Lambda$ term adds $-2\Lambda\delta\sqrt{-g}=+\Lambda\sqrt{-g}\,g_{\mu\nu}\delta g^{\mu\nu}$.
  5. Matter: *define* $T_{\mu\nu}=-\dfrac{2}{\sqrt{-g}}\dfrac{\delta S_M}{\delta g^{\mu\nu}}$. In Carroll's normalization (4.68–4.70, $S=\frac1{8\pi G}S_H+S_M$ with $S_H=\int\sqrt{-g}R$) this reads $T_{\mu\nu}=-\frac{1}{\sqrt{-g}}\frac{\delta S_M}{\delta g^{\mu\nu}}$. The factor 2 vs 1 depends on whether the gravitational action carries $\frac1{16\pi G}$ or $\frac1{8\pi G}$; see §3. Carroll: (4.70) "turns out to be the best way to define a symmetric energy-momentum tensor."
  6. Set $\delta S=0$ for arbitrary $\delta g^{\mu\nu}$: $\frac{c^4}{16\pi G}(G_{\mu\nu}+\Lambda g_{\mu\nu})-\tfrac12T_{\mu\nu}=0$, so $G_{\mu\nu}+\Lambda g_{\mu\nu}=\frac{8\pi G}{c^4}T_{\mu\nu}$ ✓. — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019)
- *Hilbert's role.* Carroll: "the equations were first derived by Hilbert, not Einstein, and Hilbert did it using the action principle. But he had been inspired by Einstein's previous papers… and Einstein himself derived the equations independently, so they are rightly named after Einstein. The action, however, is rightly called the Hilbert action." The historical scholarship (§5) complicates "first derived by Hilbert": the surviving proofs of Hilbert's paper do not contain the explicit field equations. — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019); [Corry, Renn & Stachel, *Science* 278 (1997) 1270](https://www.tau.ac.il/~corry/publications/articles/science.html)

**Takeaways.** (i) A functional maps functions to numbers. (ii) $\delta S=0$ plus integration by parts gives the Euler–Lagrange equation. (iii) Straight lines minimize length, and geodesics extremize proper time. (iv) $\int R\sqrt{-g}$ varied with respect to $g^{\mu\nu}$ gives $G_{\mu\nu}$. (v) $T_{\mu\nu}$ is *defined* as the matter action's response to the metric.

**Misconceptions.** "Stationary means minimum": geodesics in spacetime locally *maximize* proper time, and in general the condition is only "stationary". "The Palatini term changes the equations": it is a boundary term and does not.

### Inferences
- **Suggested teaching order for the advanced sections.** 2D curvature (§1.1) → Riemann via the non-commuting derivatives (Clairaut contrast) → 2-sphere computation → Ricci/Weyl via the Baez–Bunn ball → Ricci scalar → Einstein tensor and Bianchi together (the ½ motivated by conservation) → $T^{\mu\nu}$ → conservation → field equations → Schwarzschild as ODEs → Killing vectors and orbits → action principle last. This mirrors Carroll's notes ch. 3–5 and Schutz ch. 6–8 (§2). Putting the action last lets the Euler–Lagrange derivation reuse integration by parts that the reader already knows.
- **Strongest Calc II/III hooks.** Taylor series (circumference deficit), Clairaut's theorem (why Riemann measures non-commutation), integration by parts (Euler–Lagrange, Palatini boundary term), arc length (straight-line functional), Jacobians $r\,dr\,d\theta$ (why $\sqrt{-g}$), and div-curl identities (Bianchi as "always-true identity").
- **The orthonormal-frame route to Schwarzschild's Kretschmann scalar** (6 components, factor 4, sum to $12r_s^2/r^6$) is the only full Riemann-level 4D computation in this set short enough to show by hand. The same six numbers show Ricci $=0$ and Newton's tidal $2GM/r^3$ stretch and $-GM/r^3$ squeeze.
- **3D gravity remark.** Weyl vanishes identically in 3D (Carroll), so Riemann is fixed by Ricci there. A 3D vacuum ($R_{\mu\nu}=0$) is then flat: there are no gravitational waves in 2+1 dimensions. This is a useful contrast for why 4D is the first "interesting" dimension.

### Gaps
- The brachistochrone's history (Johann Bernoulli's 1696 challenge) and Noether's 1918 paper (English translation by Tavel, arXiv physics/0503066) were not fetched this session. The physics statements above are verified, but those bibliographic details are not.
- Pressures/densities of water and air are standard values not separately sourced. Neutron-star numbers come only from Wikipedia (its underlying references were truncated in the fetch). Özel & Freire's review ([arXiv 1603.02698](https://arxiv.org/abs/1603.02698)) gives radii of 9.9–11.2 km and masses up to ~2 $M_\odot$, but no central pressure in its abstract.
- Gibbons–Hawking–York boundary term: the Einstein–Hilbert action needs it for a well-posed variational principle when the boundary variation of $\partial g$ is not zero. This is mentioned from background knowledge only and not sourced here.
- The first successful binary-black-hole simulations (2005) and specific numerical-relativity milestones were not researched.

---

## 2. How do Carroll, Schutz, Hartle, Wald, MTW, Zee and Baez & Bunn (plus Tong and MIT 8.962) present these topics to beginners?

### Takeaway
Two pedagogical routes dominate. **Geometry-first** books (Carroll, Schutz, MTW, Wald) build Riemann → Ricci → Bianchi → Einstein tensor, then "guess" the field equation, rule out $R_{\mu\nu}=\kappa T_{\mu\nu}$, and fix $8\pi G$ with the Newtonian limit; the action principle comes afterwards as a confirmation. **Physics-first** books (Hartle; Tong's notes open this way too) do geodesics, Schwarzschild orbits, black holes and waves *before* the field equations. Baez & Bunn offer the most beginner-friendly *statement* of the field equation: the volume of a falling ball of coffee grains.

### Cited Findings
- **Carroll (lecture notes, 1997; basis of *Spacetime and Geometry*, 2004).**
  - Ch. 3 introduces Riemann *first* heuristically, through parallel transport around an infinitesimal loop (3.63), *then* defines it by the commutator (3.66–3.67). It notes that equivalence of the two is "true (see Wald for a believable if tortuous demonstration)".
  - It then covers symmetries and counting (3.76–3.85), Bianchi identities (3.87–3.96) and the Weyl tensor (3.97). Examples run from the flat plane, cylinder and torus ("unroll it"), to the cone (curvature concentrated at the tip), the 2-sphere (3.100–3.106) and geodesic deviation (3.107–3.113).
  - Ch. 4 motivates minimal coupling ("comma-goes-to-semicolon"), tries $R_{\mu\nu}=\kappa T_{\mu\nu}$, rejects it via the Bianchi identity, introduces $G_{\mu\nu}$, fixes $\kappa=8\pi G$ by the Newtonian limit, *then* derives the equations from the Hilbert action (4.54–4.70), then discusses the initial-value problem (4.81–4.83).
  - Killing vectors come in ch. 5 (5.41–5.46), Birkhoff in ch. 7, cosmology in ch. 8.
  - — [Carroll, arXiv gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019); chapter PDFs [ch. 3](https://www.preposterousuniverse.com/wp-content/uploads/grnotes-three.pdf), [ch. 4](https://www.preposterousuniverse.com/wp-content/uploads/grnotes-four.pdf)
- **Schutz, *A First Course in General Relativity* (2nd ed., CUP).**
  - Ch. 6 "Curved manifolds": 6.4 "Parallel-transport, geodesics, and curvature"; 6.5 "The curvature tensor"; 6.6 "Bianchi identities: Ricci and Einstein tensors"; 6.7 "Curvature in perspective".
  - Ch. 7 "Physics in a curved spacetime": 7.1 "The transition from differential geometry to gravity"; 7.2 "Physics in slightly curved spacetimes"; 7.3 "Curved intuition"; 7.4 "Conserved quantities".
  - Ch. 8 "The Einstein field equations": 8.1 "Purpose and justification of the field equations"; 8.2 "Einstein's equations"; 8.3 "…for weak gravitational fields"; 8.4 "Newtonian gravitational fields".
  - — [Cambridge University Press table of contents](https://assets.cambridge.org/97805218/87052/toc/9780521887052_toc.pdf). Carroll notes that "Schutz defines a perfect fluid to be one with no heat conduction and no viscosity, while Weinberg defines it as a fluid which looks isotropic in its rest frame; these two viewpoints turn out to be equivalent." — [Carroll notes §1](https://arxiv.org/abs/gr-qc/9712019)
- **Hartle, *Gravity: An Introduction to Einstein's General Relativity*.** Described as "physics first": it begins with the essential physical applications using a minimum of new mathematics. Part I covers Newtonian physics and special relativity. Part II, "The Curved Spacetimes of General Relativity", runs from "Gravitational Physics" and "Geometry as Physics" through "Geodesics", "Black Holes" and "Gravitational Waves" (ending at ch. 17), all before the chapters on the Einstein equation. — [British Library catalogue record](https://eld.bl.uk/catalog/020812036); [ComPADRE description](https://www.compadre.org/portal/items/detail.cfm?ID=8528); [Physics Today review](https://physicstoday.aip.org/reviews/gravity-an-introduction-to-einsteins-general-relativity)
- **Baez & Bunn, "The Meaning of Einstein's Equation"** (Am. J. Phys. 73 (2005) 644–652).
  - The aim is to state "the whole content of Einstein's equation in plain English", in units $c=8\pi G=1$, as $\ddot V/V|_{t=0}=-\tfrac12(\rho+P_x+P_y+P_z)$ for a small ball of free-falling test particles initially at rest.
  - From this they derive tidal forces and gravitational waves (no volume change in vacuum), Newton's law ($a=-GM/r^2$), and the Big Bang equation with $\rho+3P$ and $\Lambda$.
  - Only at the end do they connect to the tensor form: $\ddot V/V\to-R_{tt}$, Ricci = volume change, Weyl = shape change.
  - — [arXiv gr-qc/0103044](https://arxiv.org/abs/gr-qc/0103044); [web version](https://math.ucr.edu/home/baez/einstein/node3.html)
- **MTW, *Gravitation*.** Ch. 15, "Bianchi Identities and the Boundary of a Boundary", is Track-2 material using differential forms/Cartan calculus. The "boundary of a boundary" idea goes back to Cartan (1928) and was "excavated" for physicists by Misner and Wheeler (1971). — [UW Physics 544 lecture 20](https://faculty.washington.edu/seattle/physics544/2011-lectures/lecture-20.pdf); [Preskill–Thorne foreword via PhysicsOverflow](https://www.physicsoverflow.org/36083)
- **Wald, *General Relativity*.** Uses the $(-,+,+,+)$ signature but "changes signature to the timelike convention for Chapter 13 only". — [Wikipedia, Sign convention (cross-check)](https://en.wikipedia.org/wiki/Sign_convention). Carroll points to Wald for the rigorous equivalence of the loop and commutator definitions of Riemann. — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)
- **Tong (Cambridge lecture notes).** Ch. 1 "Geodesics" already treats the Schwarzschild metric, perihelion precession and light bending. Ch. 2–3 develop differential and Riemannian geometry (curvature, Levi-Civita connection, parallel transport, Ricci and Einstein tensors). Ch. 4 "The Einstein Equations" *opens with* the Einstein–Hilbert action, then the cosmological constant, "diffeomorphisms and the Bianchi identity", Killing vectors, the energy-momentum tensor, energy conditions and cosmology. This is an action-first route to the field equations. — [David Tong, General Relativity lecture notes](https://davidtong.org/teaching/general-relativity/)
- **MIT 8.962 (Scott Hughes).** Lecture 11 "More on spacetime curvature" covers variants of the curvature tensor (Ricci as the trace on the 1st and 3rd indices), "Breakdown of parallelism: geodesic deviation" ("the hallmark of a tidal effect") and "A differential curvature rule: The Bianchi identity", described as "the last major ingredient that we need to turn our theory of spacetime curvature into a fully fledged theory of gravity". Hughes writes the commutator on a one-form as $[\nabla_\lambda,\nabla_\sigma]p_\alpha=-R^\mu{}_{\alpha\lambda\sigma}p_\mu$, the same convention as Carroll. — [MIT OCW 8.962](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/). The lecture PDF consulted is labelled "Spring 2024". The OCW link is the course's published (2020) page.
- **Gourgoulhon, *3+1 Formalism and Bases of Numerical Relativity*.** The standard pedagogical source for the ADM/3+1 split: lapse, shift, constraint equations, ADM Hamiltonian formulation, constraint-violating modes, hyperbolic formulations. — [arXiv gr-qc/0703035](https://arxiv.org/abs/gr-qc/0703035)

### Inferences
- For a Calc II audience, a blend works best: Baez–Bunn's ball as the *headline meaning*, Carroll's commutator derivation and 2-sphere computation as the *mechanics*, Carroll's "why not $R_{\mu\nu}=\kappa T_{\mu\nu}$?" argument as the *motivation for the ½*, and Tong/Carroll's action derivation as the *capstone*.
- Every geometry-first source fixes the coupling constant the same way, by the Newtonian limit, so the document can present $8\pi G/c^4$ as derived rather than postulated.

### Gaps
- **Zee** (*Einstein Gravity in a Nutshell*) and **Blau**'s lecture notes were not consulted this session. Their presentation choices and conventions are unverified.
- Hartle's chapter titles for the Einstein-equation chapters (believed to be ch. 21–22) could not be confirmed from the fetched catalogue entries.
- MTW's own text, including its "sign conventions" table on the endpapers, was not accessible. Statements about MTW come from secondary sources.

## 3. What are the exact formulas under $(-,+,+,+)$ and Carroll's Riemann convention, and how do other books' conventions differ?

### Takeaway
Using Carroll/MTW conventions with $(-,+,+,+)$, every formula in §1 is internally consistent and sympy-checked: positively curved spheres get $R>0$, and the field equation carries a $+8\pi G/c^4$. Other books flip the metric signature (Landau–Lifshitz and others use $(+,-,-,-)$), the Riemann index order or sign, or the Ricci contraction. Einstein's own 1915 equations carry a minus sign, $G_{im}=-\kappa(T_{im}-\tfrac12g_{im}T)$, because his "$G_{im}$" is the Ricci tensor with the opposite sign convention.

### Cited Findings
**Master formula sheet** (SI unless stated; sources: Carroll notes ch. 3–5, verified in §4):
- Christoffel: $\Gamma^\rho_{\mu\nu}=\tfrac12g^{\rho\sigma}(\partial_\mu g_{\nu\sigma}+\partial_\nu g_{\mu\sigma}-\partial_\sigma g_{\mu\nu})$.
- Riemann (Carroll 3.67): $R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$. Commutator: $[\nabla_\mu,\nabla_\nu]V^\rho=R^\rho{}_{\sigma\mu\nu}V^\sigma$. For one-forms: $[\nabla_\mu,\nabla_\nu]\omega_\sigma=-R^\lambda{}_{\sigma\mu\nu}\omega_\lambda$ (Carroll 3.68; Hughes 11.19).
- Loop: $\delta V^\rho=(\delta a)(\delta b)A^\nu B^\mu R^\rho{}_{\sigma\mu\nu}V^\sigma$ (Carroll 3.63).
- Symmetries: $R_{\rho\sigma\mu\nu}=-R_{\sigma\rho\mu\nu}=-R_{\rho\sigma\nu\mu}=R_{\mu\nu\rho\sigma}$, and $R_{\rho[\sigma\mu\nu]}=0$. Independent components: $n^2(n^2-1)/12$.
- Maximally symmetric space of radius $a$: $R_{\rho\sigma\mu\nu}=a^{-2}(g_{\rho\mu}g_{\sigma\nu}-g_{\rho\nu}g_{\sigma\mu})$ (Carroll 3.106).
- Ricci: $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$. Scalar: $R=g^{\mu\nu}R_{\mu\nu}$. Einstein: $G_{\mu\nu}=R_{\mu\nu}-\tfrac12Rg_{\mu\nu}$.
- Weyl (Carroll 3.97): $C_{\rho\sigma\mu\nu}=R_{\rho\sigma\mu\nu}-\tfrac{2}{n-2}\big(g_{\rho[\mu}R_{\nu]\sigma}-g_{\sigma[\mu}R_{\nu]\rho}\big)+\tfrac{2}{(n-1)(n-2)}R\,g_{\rho[\mu}g_{\nu]\sigma}$.
- Bianchi: $R^\rho{}_{[\sigma\mu\nu]}=0$; $\nabla_{[\lambda}R_{\rho\sigma]\mu\nu}=0$; $\nabla^\mu R_{\rho\mu}=\tfrac12\nabla_\rho R$; $\nabla^\mu G_{\mu\nu}=0$.
- Geodesic deviation (Carroll 3.113): $\dfrac{D^2S^\mu}{d\tau^2}=R^\mu{}_{\nu\rho\sigma}T^\nu T^\rho S^\sigma$.
- Stress-energy: dust $T^{\mu\nu}=\rho u^\mu u^\nu$; perfect fluid $T^{\mu\nu}=(\rho+p/c^2)u^\mu u^\nu+pg^{\mu\nu}$, with $u_\mu u^\mu=-c^2$; EM $T^{\mu\nu}=\mu_0^{-1}(F^{\mu\alpha}F^\nu{}_\alpha-\tfrac14g^{\mu\nu}F_{\alpha\beta}F^{\alpha\beta})$; conservation $\nabla_\mu T^{\mu\nu}=0$.
- Field equations: $G_{\mu\nu}+\Lambda g_{\mu\nu}=\frac{8\pi G}{c^4}T_{\mu\nu}$, equivalently $R_{\mu\nu}=\frac{8\pi G}{c^4}\big(T_{\mu\nu}-\tfrac12Tg_{\mu\nu}\big)+\Lambda g_{\mu\nu}$. Vacuum: $R_{\mu\nu}=0$.
- Geodesic: $\ddot x^\mu+\Gamma^\mu_{\alpha\beta}\dot x^\alpha\dot x^\beta=0$. Wave operator: $\Box\phi=\frac1{\sqrt{-g}}\partial_\mu(\sqrt{-g}\,g^{\mu\nu}\partial_\nu\phi)$.
- Killing: $\nabla_\mu\xi_\nu+\nabla_\nu\xi_\mu=0$, and $\xi_\mu u^\mu$ is constant on geodesics.
- Euler–Lagrange: $\partial L/\partial y-\frac{d}{dx}(\partial L/\partial y')=0$.
- Action: $S=\frac{c^4}{16\pi G}\int(R-2\Lambda)\sqrt{-g}\,dt\,d^3x+S_M$, with $\delta\sqrt{-g}=-\tfrac12\sqrt{-g}\,g_{\mu\nu}\delta g^{\mu\nu}$ and $\delta(g^{\mu\nu}R_{\mu\nu})=R_{\mu\nu}\delta g^{\mu\nu}+\nabla_\sigma(\ldots)^\sigma$. Matter: $T_{\mu\nu}=-\frac{2}{\sqrt{-g}}\frac{\delta S_M}{\delta g^{\mu\nu}}$.
- Key results: sphere $R^\theta{}_{\phi\theta\phi}=\sin^2\theta$, $R_{\mu\nu}=g_{\mu\nu}/a^2$, $R=2/a^2$, $G_{\mu\nu}=0$; 3-sphere $R=6/a^2$; Schwarzschild $R_{\mu\nu}=0$ and $R_{\alpha\beta\gamma\delta}R^{\alpha\beta\gamma\delta}=12r_s^2/r^6=48G^2M^2/(c^4r^6)$; FLRW $R=\frac6{c^2}(\frac{\ddot a}a+\frac{\dot a^2}{a^2})+\frac{6k}{a^2}$; de Sitter $R=12H^2/c^2=4\Lambda$; Friedmann $(\dot a/a)^2=\frac{8\pi G}3\rho-\frac{kc^2}{a^2}+\frac{\Lambda c^2}3$ and $\ddot a/a=-\frac{4\pi G}3(\rho+3p/c^2)+\frac{\Lambda c^2}3$; $\rho\propto a^{-3(1+w)}$; Schwarzschild $V_{\rm eff}=-\frac{GM}r+\frac{L^2}{2r^2}-\frac{GML^2}{c^2r^3}$.

**How conventions differ:**
- **Metric signature.** $(-,+,+,+)$ ("East coast", "mostly plus", "Pauli convention"): MTW, Carroll, Wald (except Wald ch. 13). $(+,-,-,-)$ ("West coast", "mostly minus", "Landau–Lifshitz sign convention"): Landau & Lifshitz, Chandrasekhar's *Mathematical Theory of Black Holes*, D'Inverno, Hobson–Efstathiou–Lasenby. — [Wikipedia, Sign convention (cross-check)](https://en.wikipedia.org/wiki/Sign_convention)
- **Ricci contraction.** The Ricci tensor can be defined by contracting different index pairs. "These two definitions differ by a minus sign", which is usually compensated by the Riemann sign convention so that the Ricci tensor's sign does not actually change. — [Wikipedia, Sign convention](https://en.wikipedia.org/wiki/Sign_convention). Carroll's Ricci is "the only independent contraction (modulo conventions for the sign, which of course change from place to place)". — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)
- **Riemann index order.** "There is no agreement at all on what this convention should be, so be careful." — [Carroll notes §3](https://arxiv.org/abs/gr-qc/9712019)
- **Einstein 1915.** The 25 Nov 1915 equations read $G_{im}=-\varkappa\big(T_{im}-\tfrac12g_{im}T\big)$ (Wikisource translation, eq. 2a), with "$G_{im}$ the Ricci tensor" in Einstein's notation. — [Wikisource translation of "Die Feldgleichungen der Gravitation"](https://en.wikisource.org/wiki/Translation:The_Field_Equations_of_Gravitation); [Janssen & Renn, Physics Today 2015](https://physicstoday.aip.org/features/arch-and-scaffold-how-einstein-found-his-field-equations)
- **Unit systems.** Carroll's notes set $c=1$ (keeping $G$): $G_{\mu\nu}=8\pi GT_{\mu\nu}$. Baez–Bunn set $c=8\pi G=1$: $G_{\alpha\beta}=T_{\alpha\beta}$. Geometric units set $G=c=1$: $G_{\mu\nu}=8\pi T_{\mu\nu}$. — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019); [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)
- **Action normalization.** Carroll's notes use $S=\frac{1}{8\pi G}S_H+S_M$ with $S_H=\int\sqrt{-g}R\,d^nx$ and $T_{\mu\nu}=-\frac1{\sqrt{-g}}\frac{\delta S_M}{\delta g^{\mu\nu}}$, noting "the proper normalization is somewhat convention-dependent". — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
- **In $(+,-,-,-)$ signature** the same physics reads $u_\mu u^\mu=+c^2$, $T^{\mu\nu}=(\rho+p/c^2)u^\mu u^\nu-pg^{\mu\nu}$, and trace $T=\rho c^2-3p$. The overall signs of $R_{\mu\nu}$ and $R$ for a given geometry then depend on the Riemann convention chosen alongside. The writer should warn readers to check three signs (metric, Riemann, Einstein) before copying formulas between books.
- **SI units of the action.** $\frac{c^4}{16\pi G}R$ has units of energy density, J/m³: $c^4/G$ is a force (N = J/m) and $R$ is in m⁻². Integrating over $dt\,d^3x$ gives J·s, an action. If instead $d^4x=d(ct)\,d^3x$ (the usual $x^0=ct$ measure), the prefactor must be $\frac{c^3}{16\pi G}$. The field equations are unaffected as long as $S_M$ uses the same measure. (Unit analysis done in this session.)
- **$T_{\mu\nu}$ factor.** With gravity normalized as $\frac{1}{16\pi G}$ (or $\frac{c^4}{16\pi G}$), consistency requires $T_{\mu\nu}=-\frac{2}{\sqrt{-g}}\frac{\delta S_M}{\delta g^{\mu\nu}}$. With Carroll-notes normalization $\frac1{8\pi G}$, it is $-\frac1{\sqrt{-g}}\frac{\delta S_M}{\delta g^{\mu\nu}}$. Both give $G_{\mu\nu}=8\pi GT_{\mu\nu}$, provided the matter action is normalized consistently. The common modern choice, used in these notes, is the first.

### Gaps
- Weinberg's (1972) and Zee's sign conventions, and MTW's three-sign classification table, were not verified from primary text. A comparison table naming each textbook's (metric, Riemann, Einstein) signs should be built only from the books themselves.
- Whether Schutz and Hartle follow MTW's sign conventions exactly was not verified this session.

## 4. Which computations were verified with sympy, and what did the verification show?

### Takeaway
Every curvature result requested was reproduced symbolically with sympy 1.14.0, using an independent implementation of Carroll's conventions: the sphere's Riemann/Ricci/scalar/Einstein, Schwarzschild's Ricci $=0$ and Kretschmann $12r_s^2/r^6$, the FLRW Ricci scalar, and the Euler–Lagrange straight line. So were the supporting results: the commutator definition, the contracted Bianchi identity, the Friedmann equations, the fluid conservation law, the Killing vectors, the orbit equation, the EM stress tensor, the Newtonian limit, and the $\delta\sqrt{-g}$ formula.

### Cited Findings
All entries below are results produced in this session by running sympy (scripts kept at `/tmp/claude-0/-home-user-Projects/6e512a3f-ee96-5ca2-92f4-5fdb7ef00825/scratchpad/gr/`; the self-contained core script is reproduced below). Conventions as in §3.
- **2-sphere** $a^2(d\theta^2+\sin^2\theta d\phi^2)$:
  - $\Gamma^\theta_{\phi\phi}=-\tfrac12\sin2\theta$ and $\Gamma^\phi_{\theta\phi}=\cot\theta$.
  - $R^\theta{}_{\phi\theta\phi}-\sin^2\theta=0$, $R^\phi{}_{\theta\phi\theta}=1$, $R^\phi{}_{\theta\theta\phi}=-1$.
  - Ricci $=\mathrm{diag}(1,\sin^2\theta)$, $R=2/a^2$, $G_{\mu\nu}=0$, $R_{\theta\phi\theta\phi}/\det g=1/a^2$.
  - Kretschmann $=4/a^4$.
  - $[\nabla_\mu,\nabla_\nu]V^\rho=R^\rho{}_{\sigma\mu\nu}V^\sigma$ holds for arbitrary $V(\theta,\phi)$: **True**.
- **Cylinder** $dz^2+a^2d\phi^2$: all Riemann components zero. **Flat polar** $dr^2+r^2d\phi^2$: $\Gamma^r_{\phi\phi}=-r$, $\Gamma^\phi_{r\phi}=1/r$, all Riemann components zero.
- **Generic 2D metric** $E(u,v)du^2+H(u,v)dv^2$: $G_{\mu\nu}=0$ identically and $R-2K=0$ identically.
- **3-sphere**: $R_{ij}/g_{ij}=2/a^2$ for each $i$, and $R=6/a^2$.
- **Counting**: $n^2(n^2-1)/12=1,6,20,50$ for $n=2,3,4,5$. Ricci has $n(n+1)/2=3,6,10$ components, and 4D Weyl has $20-10=10$.
- **Schwarzschild** (with $c$, $r_s$):
  - Christoffels: $\Gamma^t_{tr}=\frac{r_s}{2r(r-r_s)}$, $\Gamma^r_{tt}=\frac{c^2r_s(r-r_s)}{2r^3}$, $\Gamma^r_{rr}=-\frac{r_s}{2r(r-r_s)}$, $\Gamma^r_{\theta\theta}=-(r-r_s)$, $\Gamma^r_{\phi\phi}=-(r-r_s)\sin^2\theta$, $\Gamma^\theta_{r\theta}=\Gamma^\phi_{r\phi}=1/r$, $\Gamma^\theta_{\phi\phi}=-\tfrac12\sin2\theta$, $\Gamma^\phi_{\theta\phi}=\cot\theta$.
  - **Ricci tensor = zero matrix.**
  - **Kretschmann $=12r_s^2/r^6=48G^2M^2/(c^4r^6)$**; $12/r_s^4$ at $r=r_s$; $\lim_{r\to0}=\infty$.
  - Coordinate Riemann components: $R^t{}_{rtr}=\frac{r_s}{r^2(r-r_s)}$, $R^t{}_{\theta t\theta}=R^r{}_{\theta r\theta}=-\frac{r_s}{2r}$, $R^t{}_{\phi t\phi}=R^r{}_{\phi r\phi}=-\frac{r_s\sin^2\theta}{2r}$, $R^\theta{}_{\phi\theta\phi}=\frac{r_s\sin^2\theta}{r}$.
  - Orthonormal-frame components: $R_{\hat t\hat r\hat t\hat r}=-r_s/r^3$, $R_{\hat t\hat\theta\hat t\hat\theta}=R_{\hat t\hat\phi\hat t\hat\phi}=r_s/(2r^3)$, $R_{\hat r\hat\theta\hat r\hat\theta}=R_{\hat r\hat\phi\hat r\hat\phi}=-r_s/(2r^3)$, $R_{\hat\theta\hat\phi\hat\theta\hat\phi}=r_s/r^3$, with no other independent nonzero components.
- **Schwarzschild from $R_{\mu\nu}=0$**: the static ansatz gives the $R_{tt}$, $R_{rr}$, $R_{\theta\theta}$ shown in §1.9. Then $e^{2(\beta-\alpha)}R_{tt}/c^2+R_{rr}=\frac2r(\alpha'+\beta')$; with $\beta=-\alpha$, $R_{\theta\theta}=1-e^{2\alpha}(2r\alpha'+1)$; and `dsolve((r h)'=1)` gives $h=(C_1+r)/r$.
- **Geodesics/orbits**: $\frac{d}{d\tau}[(1-r_s/r)\dot t]$ equals $(1-r_s/r)\times$ the $t$-geodesic equation exactly, and $\frac{d}{d\tau}[r^2\dot\phi]$ equals $r^2\times$ the $\phi$-geodesic equation. $\tfrac12\dot r^2+V_{\rm eff}-\frac{E^2-c^4}{2c^2}=0$ is an identity. The circular-orbit roots merge at $L^2=12G^2M^2/c^2$.
- **FLRW** (with $k$, $c$):
  - $R_{tt}=-3\ddot a/a$ and $R=\frac{6}{c^2}(\frac{\ddot a}a+\frac{\dot a^2}{a^2})+\frac{6k}{a^2}$ (difference from target $=0$).
  - de Sitter $R=12H^2/c^2$; radiation ($a=t^{1/2}$) $R=0$; matter ($a=t^{2/3}$) $R=4/(3c^2t^2)$.
  - $G^t{}_t=-\frac{3(\dot a^2+kc^2)}{c^2a^2}$.
  - Friedmann equations exactly as in §1.9.
  - Perfect fluid: $T^\mu{}_\nu=\mathrm{diag}(-c^2\rho,p,p,p)$ and trace $-c^2\rho+3p$. $\nabla_\mu T^{\mu t}=\dot\rho+3\frac{\dot a}a(\rho+p/c^2)$ (difference $=0$), with spatial components zero. `dsolve` gives $\rho=C_1a^{-3w-3}$.
- **Contracted Bianchi**: for $-e^{2\alpha(t,r)}dt^2+e^{2\beta(t,r)}dr^2+r^2d\Omega^2$, $\nabla_\mu G^{\mu\nu}=[0,0,0,0]$, while $\nabla_\mu R^{\mu\nu}\neq0$ in the $t$ and $r$ components.
- **Newtonian limit**: $g=\mathrm{diag}(-(1+2\epsilon\Phi/c^2)c^2,(1-2\epsilon\Phi/c^2)\delta_{ij})$ gives $R_{tt}=\epsilon\nabla^2\Phi+O(\epsilon^2)$. For dust the right side is $4\pi G\rho$, hence $\nabla^2\Phi=4\pi G\rho$.
- **EM tensor**: $F_{ab}F^{ab}=2(B^2-E^2/c^2)$; $T^{00}=\tfrac12(\epsilon_0E^2+B^2/\mu_0)$; $T^{0i}=S_i/c$; trace $0$; $T^{xx}=-\epsilon_0E_x^2/2$ and $T^{yy}=+\epsilon_0E_x^2/2$ for $\vec E=E_x\hat x$.
- **Killing vectors on $S^2$**: $\partial_\phi$, $-\sin\phi\,\partial_\theta-\cot\theta\cos\phi\,\partial_\phi$ and $\cos\phi\,\partial_\theta-\cot\theta\sin\phi\,\partial_\phi$ all satisfy Killing's equation (all components 0). $\partial_\theta$ fails, with $\phi\phi$ component $a^2\sin2\theta$.
- **Wave operator**: flat spherical $\Box\phi$ equals the spherical-Laplacian wave operator. In flat FLRW, $\Box\psi=-\frac1{c^2}(\ddot\psi+3\frac{\dot a}a\dot\psi)+\frac{\nabla^2\psi}{a^2}$. $\sqrt{-g}=c\,r^2\sin\theta$ for both Minkowski (spherical) and Schwarzschild.
- **Variational checks**:
  - Straight line: E–L gives $y''/(1+y'^2)^{3/2}=0$, so $y=C_1+C_2x$.
  - Cycloid: $(1+y'^2)y=2R$.
  - Sphere geodesic Lagrangian: $\ddot\theta-\sin\theta\cos\theta\,\dot\phi^2=0$ and $\ddot\phi+2\cot\theta\,\dot\theta\dot\phi=0$.
  - Jacobi formula: $\frac{d}{d\epsilon}\sqrt{-g}=-0.3458773468469416$ vs $-\tfrac12\sqrt{-g}g_{\mu\nu}h^{\mu\nu}=-0.3458773468469415$ on a random Lorentzian 4×4 metric.
- **Numbers**: $8\pi G/c^4=2.0766\times10^{-43}$ m/J. Earth circle and triangle numbers as in §1.1. Black-hole $\mathcal K(r_s)$ as in §1.2. $p/\rho c^2$ table as in §1.6.

**Core script** (runs in about 6 s; output reproduced in comments):
```python
# Self-contained sympy checks. Conventions: signature (-,+,+,+), Carroll/MTW Riemann
# R^r_{s m n} = d_m G^r_{n s} - d_n G^r_{m s} + G^r_{m l} G^l_{n s} - G^r_{n l} G^l_{m s};  R_{mn} = R^l_{m l n}
import sympy as sp
from itertools import product

def curvature(g, x):
    n = len(x); gi = g.inv()
    Gam = [[[sp.simplify(sum(gi[r, s]*(sp.diff(g[nu, s], x[m]) + sp.diff(g[m, s], x[nu])
              - sp.diff(g[m, nu], x[s])) for s in range(n))/2) for nu in range(n)] for m in range(n)] for r in range(n)]
    Riem = [[[[sp.simplify(sp.diff(Gam[r][nu][s], x[m]) - sp.diff(Gam[r][m][s], x[nu])
              + sum(Gam[r][m][l]*Gam[l][nu][s] - Gam[r][nu][l]*Gam[l][m][s] for l in range(n)))
              for nu in range(n)] for m in range(n)] for s in range(n)] for r in range(n)]
    Ric = sp.Matrix(n, n, lambda m, nu: sp.simplify(sum(Riem[l][m][l][nu] for l in range(n))))
    Rs = sp.simplify(sum(gi[i, j]*Ric[i, j] for i in range(n) for j in range(n)))
    return Gam, Riem, Ric, Rs

def kretschmann(g, Riem):                      # diagonal metrics only
    n = g.shape[0]; gi = g.inv()
    Rl = lambda a, b, c, d: sum(g[a, e]*Riem[e][b][c][d] for e in range(n))
    return sp.simplify(sum(Rl(a, b, c, d)**2*gi[a, a]*gi[b, b]*gi[c, c]*gi[d, d]
                           for a, b, c, d in product(range(n), repeat=4)))

th, ph, t, r, chi = sp.symbols('theta phi t r chi')
a, c, rs = sp.symbols('a c r_s', positive=True)

g = sp.diag(a**2, a**2*sp.sin(th)**2)                        # 2-sphere
Gam, Riem, Ric, Rs = curvature(g, [th, ph])
print(sp.simplify(Riem[0][1][0][1] - sp.sin(th)**2))          # 0   -> R^th_{ph th ph} = sin^2(th)
print(Ric[0, 0], sp.simplify(Ric[1, 1] - sp.sin(th)**2), Rs)  # 1 0 2/a**2
print(sp.simplify(Ric - Rs*g/2))                              # zero matrix (G = 0 in 2D)

g3 = sp.diag(a**2, a**2*sp.sin(chi)**2, a**2*sp.sin(chi)**2*sp.sin(th)**2)
print(curvature(g3, [chi, th, ph])[3])                        # 6/a**2

f = 1 - rs/r                                                  # Schwarzschild, r_s = 2GM/c^2
gS = sp.diag(-f*c**2, 1/f, r**2, r**2*sp.sin(th)**2)
_, RiemS, RicS, _ = curvature(gS, [t, r, th, ph])
print(RicS == sp.zeros(4, 4))                                 # True
print(kretschmann(gS, RiemS))                                 # 12*r_s**2/r**6

k = sp.symbols('k'); A = sp.Function('a')(t)                  # FLRW
gF = sp.diag(-c**2, A**2/(1 - k*r**2), A**2*r**2, A**2*r**2*sp.sin(th)**2)
RF = curvature(gF, [t, r, th, ph])[3]
print(sp.simplify(RF - (6/c**2*(sp.diff(A, t, 2)/A + sp.diff(A, t)**2/A**2) + 6*k/A**2)))  # 0
H = sp.symbols('H', positive=True)
print(sp.simplify(RF.subs(k, 0).subs(A, sp.exp(H*t)).doit()))  # 12*H**2/c**2  (de Sitter)

x = sp.symbols('x'); y = sp.Function('y')(x)                  # Euler-Lagrange, shortest path
from sympy.calculus.euler import euler_equations
print(sp.simplify(euler_equations(sp.sqrt(1 + sp.diff(y, x)**2), y, x)[0]))  # y''/(1+y'^2)^(3/2) = 0
print(sp.dsolve(sp.diff(y, x, 2), y))                         # y = C1 + C2*x
```

### Inferences
- The sympy runs confirm that Carroll's index conventions, as transcribed in this document, are self-consistent: the commutator check and the positive sphere curvature both pass. The writer can quote every formula in §3 without sign worries.
- Sympy prints $R^\theta{}_{\phi\theta\phi}$ as `sin(2θ)/(2tanθ) - cos(2θ)`, which equals $\sin^2\theta$ ($\cos^2\theta-\cos2\theta=\sin^2\theta$). Students running the code should be told to `simplify(expr - sin(theta)**2)` rather than expect the printed form.

### Gaps
- The Palatini identity itself was not symbolically verified (only cited from Carroll 4.57–4.61). The $\delta\sqrt{-g}$ formula was checked numerically, not symbolically.
- The Newtonian limit of $\nabla_\mu T^{\mu\nu}=0$ (continuity and Euler) was derived by hand, not by sympy.

## 5. What are the historically accurate facts about Einstein's November 1915 papers and Hilbert's action?

### Takeaway
Einstein presented four short communications to the Prussian Academy on the Thursdays 4, 11, 18 and 25 November 1915. The last, "Die Feldgleichungen der Gravitation" (Sitzungsberichte pp. 844–847), contains the final field equations with the trace term. Hilbert presented his action-based paper in Göttingen on 20 November 1915, but it was published only on 31 March 1916. Its surviving proofs show that the version first submitted was not generally covariant and lacked the explicit field equations. Most historians therefore credit Einstein with the field equations and Hilbert with the action, though a minority dispute the reading of the proofs.

### Cited Findings
- **Background (1912–13).** Einstein and Marcel Grossmann first considered field equations based on the Riemann/Ricci tensor in 1912–13 and abandoned them "with a heavy heart" over problems with their physical interpretation (documented in Einstein's Zurich notebook). Instead they published the *Entwurf* ("outline") field equations of limited covariance in June 1913. In September 1915 Einstein discovered that the rotation metric is "not a matter-free solution of the Entwurf field equations." — [Janssen & Renn, "Arch and scaffold: How Einstein found his field equations", Physics Today 68(11), 30 (2015), doi:10.1063/PT.3.2979](https://physicstoday.aip.org/features/arch-and-scaffold-how-einstein-found-his-field-equations)
- **The four November papers** (submitted "on four consecutive Thursdays"):
  1. **4 Nov**: replaced the Entwurf equations with $R_{im}=-\kappa T_{im}$, covariant under unimodular transformations (broad but not general covariance).
  2. **11 Nov**: a "highly speculative" hypothesis that all matter is electromagnetic, so $T=0$, allowed generally covariant equations.
  3. **18 Nov**: used those equations to explain the anomalous 43″ per century of Mercury's perihelion advance.
  4. **25 Nov**: added a trace term to the right-hand side, giving the final field equations and removing the need for $T=0$.
  - The trace term also ensured that matter's energy-momentum enters the equations the same way as the gravitational field's, a "powerful independent argument" for it.
  - — [Janssen & Renn, Physics Today 2015](https://physicstoday.aip.org/features/arch-and-scaffold-how-einstein-found-his-field-equations); see also [Janssen & Renn, *How Einstein Found His Field Equations: Sources and Interpretation* (Springer, 2022)](https://www.springer.com/book/9783030979546). An arXiv excerpt of that book states that the Mercury paper was presented and submitted on 18 Nov and published a week later ([arXiv 2111.11238](https://www.arxiv.org/pdf/2111.11238)).
- **The 25 November paper.** Einstein, "Die Feldgleichungen der Gravitation", *Sitzungsberichte der Königlich Preußischen Akademie der Wissenschaften* 1915 (part 2), pp. 844–847, presented 25 Nov, published 2 Dec 1915.
  - It opens by recalling that he had "shown in two recently published reports" how to obtain field equations consistent with general relativity.
  - It notes that the vacuum equations "upon which I based the explanation of the perihelion motion of mercury, remain untouched".
  - It gives $G_{im}=-\varkappa(T_{im}-\tfrac12g_{im}T)$.
  - It uses coordinates with $\sqrt{-g}=1$.
  - It concludes that "the general theory of relativity as a logical building is eventually finished."
  - The earlier reports are cited as Sitzungsber. XLIV p. 778 (4 Nov) and XLVI p. 799 (11 Nov).
  - — [Wikisource English translation](https://en.wikisource.org/wiki/Translation:The_Field_Equations_of_Gravitation); [original scan, ADS 1915SPAW…844E](https://articles.adsabs.harvard.edu/pdf/1915SPAW.......844E); the Einstein Papers Project's translation is Vol. 6, Doc. 25 ([einsteinpapers.press.princeton.edu/vol6-trans/129](https://einsteinpapers.press.princeton.edu/vol6-trans/129); the page fetched this session showed only the portal landing page).
- **Hilbert.** Hilbert presented his field equations to the Göttingen Academy on 20 November 1915, five days before Einstein's final paper. "At first glance, Hilbert, following a purely mathematical approach, beat Einstein to the punch." Page proofs that surfaced in the late 1990s show that Hilbert used the Riemann curvature scalar but imposed a coordinate restriction (his "energy theorem"), which was dropped from the version published in March 1916. Janssen & Renn conclude: "Einstein need not have worried about Hilbert in November 1915." — [Janssen & Renn, Physics Today 2015](https://physicstoday.aip.org/features/arch-and-scaffold-how-einstein-found-his-field-equations)
- **Corry, Renn & Stachel (1997).** "Belated Decision in the Hilbert-Einstein Priority Dispute", *Science* 278, 1270–1273. From archival material they conclude that Hilbert did not anticipate Einstein. The first proofs (dated 6 December 1915) show a theory that is not generally covariant and does not contain the explicit field equations. The published paper still bears the 20 Nov 1915 submission date but appeared on 31 March 1916. — [Corry publication page](https://www.tau.ac.il/~corry/publications/articles/science.html); [Open University of Israel record](https://cris.openu.ac.il/en/publications/belated-decision-in-the-hilbert-einstein-priority-dispute/). Note: Corry's page lists the date as "November 14, 1998", but Science vol. 278 is the 1997 volume. The year 1997 is used elsewhere and appears correct, which suggests a typo on that page.
- **Dissent.** Winterberg (2004) argued that the conclusion rests on proofs from which part of a sheet had been cut off. Logunov et al. and Sauer also challenged aspects of the paper, and the authors defended their reading. — summarized from [Leo Corry (Wikipedia, cross-check)](https://en.wikipedia.org/wiki/Leo_Corry) and related search results; [Wuensch/Winterberg discussion via arXiv physics/0610154](https://arxiv.org/pdf/physics/0610154). These secondary summaries were not read in full.
- **Textbook framing.** Carroll's notes say the equations "were first derived by Hilbert, not Einstein, and Hilbert did it using the action principle… Einstein himself derived the equations independently, so they are rightly named after Einstein. The action, however, is rightly called the Hilbert action." — [Carroll notes §4](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
- The document should say: Einstein completed the field equations in his paper of 25 November 1915. Hilbert independently introduced the variational (action) formulation, presented on 20 November 1915 and published in 1916. The surviving proofs indicate that the explicit field equations were added to Hilbert's paper after Einstein's work. Carroll's 1997-era wording ("first derived by Hilbert") predates or does not reflect that scholarship.
- Einstein's November 4 equation ($R_{im}\propto T_{im}$) is exactly the "first guess" that Carroll's pedagogy rules out with the Bianchi identity. This gives the document a historically grounded hook: Einstein's own 11 Nov fix ($T=0$) is the only way that guess can be consistent, and the 25 Nov trace term is the ½ in $G_{\mu\nu}$.

### Gaps
- The Einstein Papers Project pages for Vol. 6 Docs. 21, 22, 24, 25 could not be read (landing page only). Quotes come from the Wikisource translation.
- The text of Hilbert's "Die Grundlagen der Physik" and the exact page numbers in *Nachrichten… Göttingen* (1915) were not retrieved.
- The detailed arguments of the Winterberg, Logunov and Sauer critiques were not read. Only search-level summaries are reported.
