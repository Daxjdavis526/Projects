# Intermediate mathematics of GR: curved surfaces, gradients, special-relativistic spacetime, index notation and tensor algebra, proper time and four-vectors

Notes for the middle sections of "The Mathematics of General Relativity: From Calculus to Einstein's Field Equations". The intended reader has finished Calculus I, is taking Calculus II and calculus-based Physics I, and has not studied Calculus III, linear algebra or tensors.

How to read these notes:
- Every worked example below was recomputed by the researcher in Python 3.13 with sympy (symbolic matrix and derivative checks) and plain floating-point arithmetic. Scripts are in `/tmp/claude-0/-home-user-Projects/6e512a3f-ee96-5ca2-92f4-5fdb7ef00825/scratchpad/verify_sr/` (`v1.py` to `v4.py`). An example marked **[verified]** had its arithmetic and its stated results reproduced exactly (or to the stated rounding).
- Unit tags: **[SI]** means SI units with $c$ written explicitly. **[c = 1]** means time is measured in meters ($x^0 = ct$), as in Carroll's notes. **[G = c = 1]** means geometric units. The unit system is stated wherever it changes.
- Signature: these notes use $(-,+,+,+)$ throughout. The first section lists every place where formulas change under $(+,-,-,-)$.
- Formulas are in LaTeX inside `$...$` (inline) or `$$...$$` (display).

---

## Key question A: Which sign and unit conventions apply, and exactly where do the formulas differ under $(+,-,-,-)$?

### Takeaway
GR textbooks used in the Anglophone world (Carroll, MTW, Wald, Schutz, MIT 8.962) mostly use the "mostly plus" signature $\eta_{\mu\nu}=\mathrm{diag}(-1,1,1,1)$. Particle physics and Landau–Lifshitz use $(+,-,-,-)$, and Taylor & Wheeler's *Spacetime Physics* writes the interval as (time)² minus (space)². The physics is the same in both conventions. What changes is the sign of every squared four-vector (intervals, $u_\mu u^\mu$, $p_\mu p^\mu$, $a_\mu a^\mu$) and which components flip sign when an index is lowered.

### Cited Findings
- Carroll defines the interval as $s^2 = -(c\Delta t)^2 + (\Delta x)^2 + (\Delta y)^2 + (\Delta z)^2$ (eq. 1.3) and the metric $\eta_{\mu\nu}=\mathrm{diag}(-1,1,1,1)$ (eq. 1.8), and warns: "Some references, especially field theory books, define the metric with the opposite sign, so be careful." — [Carroll, *Lecture Notes on General Relativity*, arXiv:gr-qc/9712019, §1](https://arxiv.org/abs/gr-qc/9712019)
- Carroll sets $c=1$ from eq. (1.6) onward ("we are working in units where 1 second equals $3\times10^8$ meters"). Any equation quoted from his notes therefore needs $c$ restored for SI use. — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- The MIT 8.962 notes state "Our metric has signature +2; the flat spacetime Minkowski metric components are $\eta_{\mu\nu}=\mathrm{diag}(-1,+1,+1,+1)$" and adopt $c=1$. — [Bertschinger, *Introduction to Tensor Calculus for General Relativity*, MIT 8.962 (2000), §1](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)
- Wald notes that his convention (the same as Carroll's) "corresponds to that used by most general relativists; however, most particle physicists use the opposite sign convention". — [Wald, "Teaching General Relativity", arXiv:gr-qc/0511073, footnote 1](https://arxiv.org/abs/gr-qc/0511073)
- Cross-check only: Wikipedia names $(+,-,-,-)$ the "West coast"/"mostly minuses" convention (Landau–Lifshitz, particle physics) and $(-,+,+,+)$ the "East coast"/"mostly pluses" convention. It lists MTW *Gravitation*, Carroll and Wald under the latter, and gives $m^2 = p^\mu p_\mu$ (timelike-positive) versus $m^2=-p^\mu p_\mu$ (mostly-plus). — [Wikipedia, "Sign convention"](https://en.wikipedia.org/wiki/Sign_convention)
- Taylor & Wheeler write "(interval)² = (time separation)² − (space separation)²" (eqs. 1-4 to 1-6), so a timelike interval is positive in their book and equals the "wristwatch time". This is the opposite overall sign to these notes. — [Taylor & Wheeler, *Spacetime Physics*, 2nd ed., ch. 1](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf)
- Carroll's index conventions: Greek indices run over 0–3 with 0 the time coordinate, Latin indices run over the spatial 1–3, and $x^0=ct,\ x^1=x,\ x^2=y,\ x^3=z$ (eqs. 1.5, 1.7). — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)

**Convention-dependence table** (derived from the cited definitions; each entry was checked numerically by the researcher with the examples later in these notes):

| Quantity | This document $(-,+,+,+)$ | Particle-physics $(+,-,-,-)$ |
|---|---|---|
| Minkowski metric | $\eta_{\mu\nu}=\mathrm{diag}(-1,1,1,1)$ | $\eta_{\mu\nu}=\mathrm{diag}(1,-1,-1,-1)$ |
| Interval [SI] | $\Delta s^2=-c^2\Delta t^2+\Delta x^2+\Delta y^2+\Delta z^2$ | $\Delta s^2=c^2\Delta t^2-\Delta x^2-\Delta y^2-\Delta z^2$ |
| Timelike / spacelike | $\Delta s^2<0$ / $\Delta s^2>0$ | $\Delta s^2>0$ / $\Delta s^2<0$ |
| Proper time | $d\tau^2=-ds^2/c^2$ | $d\tau^2=+ds^2/c^2$ |
| Four-velocity norm | $u_\mu u^\mu=-c^2$ | $u_\mu u^\mu=+c^2$ |
| Four-momentum norm | $p_\mu p^\mu=-m^2c^2$ | $p_\mu p^\mu=+m^2c^2$ |
| Four-acceleration norm | $a_\mu a^\mu=+\alpha^2$ | $a_\mu a^\mu=-\alpha^2$ |
| Lowering an index | flips the sign of the **time** component: $V_\mu=(-V^0,V^1,V^2,V^3)$ | flips the sign of the **space** components: $V_\mu=(V^0,-V^1,-V^2,-V^3)$ |
| Boost matrix $\Lambda^\mu{}_\nu$ | same in both | same in both |
| Defining property of a Lorentz transformation | $\Lambda^T\eta\Lambda=\eta$ | $\Lambda^T\eta\Lambda=\eta$ (holds for both signs of $\eta$; verified symbolically) |
| Newtonian limit of $g_{00}$ | $g_{00}\approx-(1+2\Phi/c^2)$ | $g_{00}\approx+(1+2\Phi/c^2)$ |

- The weak-field result $g_{00}=-(1+2\Phi)$ (with $c=1$) is Carroll's eq. (4.21); in SI it reads $g_{00}=-(1+2\Phi/c^2)$ when $x^0=ct$. — [Carroll, §4](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
- A student switching books should check one thing first: the sign of $\eta_{00}$. Every sign difference in the table follows from that single choice.
- The boost matrix does not depend on the signature. Students sometimes "flip signs" inside $\Lambda$ when changing books, and that is an error.
- Geometric units ($G=c=1$) are used in Carroll's later chapters (e.g. Schwarzschild, eq. 7.29). In these notes, worked examples stay in SI or $c=1$ and say which.

### Gaps
- I could not access the MTW sign-convention table (the inside-cover table with three sign choices: metric, Riemann tensor, Einstein equation). The Wikipedia cross-check does not reproduce it. The report should not attribute a specific table layout to MTW without checking the book.
- I did not verify directly from the texts the signature used in Hartle's *Gravity*, Moore's *A General Relativity Workbook* or Tong's lecture notes. (From general knowledge, Hartle and Moore use $(-,+,+,+)$, but this was not confirmed from a primary source in this research.)

---

## Topic 1: Multivariable geometry and curved surfaces. How do two coordinates describe a surface, and where does $ds^2=a^2(d\theta^2+\sin^2\theta\,d\phi^2)$ come from?

### Takeaway
On a curved surface, two numbers (such as latitude and longitude) label each point. A **line element** $ds^2$ turns small coordinate changes into real distances. For a sphere of radius $a$ it is derived in a few lines from $x,y,z$, and it shows that a degree of longitude shrinks toward the poles while a degree of latitude does not. This is the 2D model for everything the metric $g_{\mu\nu}$ does in GR.

### Cited Findings

#### Plain-language explanation, intuition and analogy
- Moore, who taught undergraduate GR about 13 times, says students should practise every new tensor idea "in the context of easily visualized two-dimensional flat and curved spaces before applying them to four dimensional spacetimes", explicitly "polar coordinates in flat space and longitude/latitude coordinates on a sphere". — [Moore, "Tips on Teaching General Relativity (with Tensors) to Undergraduates", AAPT 2006, §2](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Bertschinger relates a coordinate basis direction to everyday geography: "the direction of increasing latitude corresponds to a unique direction (north) at a given point on the earth". — [Bertschinger, MIT 8.962, §3](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)
- Carroll describes the two-sphere as "the locus of points in $\mathbb{R}^3$ at distance 1 from the origin", derives its metric by setting $r=1$, $dr=0$ in the 3D spherical-coordinate line element, and says the result "is completely consistent with the interpretation of $ds$ as an infinitesimal length". He also notes that "the metric tensor contains all the information we need to describe the curvature of the manifold". — [Carroll, §2, eqs. 2.31–2.33](https://arxiv.org/abs/gr-qc/9712019)

#### Why GR needs it
- In GR, spacetime is described only by coordinates plus a metric, $ds^2=g_{\mu\nu}dx^\mu dx^\nu$ (Carroll eq. 2.29). There is no surrounding higher-dimensional space to measure from. The sphere, described by its own two coordinates, is the training case for this. — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)

#### Mechanics and notation
- 3D spherical coordinates: $x=r\sin\theta\cos\phi,\ y=r\sin\theta\sin\phi,\ z=r\cos\theta$ give $ds^2=dr^2+r^2d\theta^2+r^2\sin^2\theta\,d\phi^2$ (eqs. 2.31–2.32). On the unit sphere this becomes $ds^2=d\theta^2+\sin^2\theta\,d\phi^2$ (eq. 2.33), and Carroll writes $a^2(d\theta^2+\sin^2\theta\,d\phi^2)$ for radius $a$ (eq. 3.100). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Notation warning from Carroll: "ds²" is "conventional shorthand for the metric tensor"; it does not mean the square of a finite quantity $s$. — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)

Symbols used below:
- $\theta$ = **colatitude**, the angle down from the north pole, $0\le\theta\le\pi$. Geographic latitude is $\lambda=90^\circ-\theta$, so $\sin\theta=\cos\lambda$.
- $\phi$ = longitude, $0\le\phi<2\pi$.
- $a$ = sphere radius (fixed).
- $d\theta,d\phi$ = tiny coordinate changes.
- $ds$ = the true distance on the surface for that tiny change.
- A **partial derivative** $\partial x/\partial\theta$ is the ordinary Calculus I derivative of $x$ with respect to $\theta$ while $\phi$ is held constant. This is the only new calculus idea needed here.
- The **total differential** rule: if $x$ depends on $\theta$ and $\phi$, a small change is $dx=\frac{\partial x}{\partial\theta}d\theta+\frac{\partial x}{\partial\phi}d\phi$. (This is the multivariable chain rule, a Calculus III idea, stated here so the derivation can proceed.)

**Derivation of the sphere's line element, step by step** [SI or any length unit; verified with sympy: $J^TJ=\mathrm{diag}(a^2,a^2\sin^2\theta)$]
1. Embedding: $x=a\sin\theta\cos\phi$, $y=a\sin\theta\sin\phi$, $z=a\cos\theta$.
2. Partial derivatives:
   - $\partial x/\partial\theta=a\cos\theta\cos\phi$ and $\partial x/\partial\phi=-a\sin\theta\sin\phi$
   - $\partial y/\partial\theta=a\cos\theta\sin\phi$ and $\partial y/\partial\phi=a\sin\theta\cos\phi$
   - $\partial z/\partial\theta=-a\sin\theta$ and $\partial z/\partial\phi=0$
3. Differentials:
   $$dx=a\cos\theta\cos\phi\,d\theta-a\sin\theta\sin\phi\,d\phi$$
   $$dy=a\cos\theta\sin\phi\,d\theta+a\sin\theta\cos\phi\,d\phi$$
   $$dz=-a\sin\theta\,d\theta$$
4. Square each one:
   $$dx^2=a^2\cos^2\theta\cos^2\phi\,d\theta^2-2a^2\sin\theta\cos\theta\sin\phi\cos\phi\,d\theta\,d\phi+a^2\sin^2\theta\sin^2\phi\,d\phi^2$$
   $$dy^2=a^2\cos^2\theta\sin^2\phi\,d\theta^2+2a^2\sin\theta\cos\theta\sin\phi\cos\phi\,d\theta\,d\phi+a^2\sin^2\theta\cos^2\phi\,d\phi^2$$
   $$dz^2=a^2\sin^2\theta\,d\theta^2$$
5. Add the three lines and collect terms:
   - $d\theta^2$ terms: $a^2\cos^2\theta(\cos^2\phi+\sin^2\phi)+a^2\sin^2\theta=a^2\cos^2\theta+a^2\sin^2\theta=a^2$.
   - $d\theta\,d\phi$ terms: $-2a^2(\dots)+2a^2(\dots)=0$. The cross terms cancel exactly.
   - $d\phi^2$ terms: $a^2\sin^2\theta(\sin^2\phi+\cos^2\phi)=a^2\sin^2\theta$.
6. Result: $$ds^2=dx^2+dy^2+dz^2=a^2\,d\theta^2+a^2\sin^2\theta\,d\phi^2=a^2\left(d\theta^2+\sin^2\theta\,d\phi^2\right).$$
7. Read off the metric components: $g_{\theta\theta}=a^2$, $g_{\phi\phi}=a^2\sin^2\theta$, $g_{\theta\phi}=g_{\phi\theta}=0$.

Interpretation:
- Along a meridian ($d\phi=0$), $ds=a\,d\theta$. The spacing is the same everywhere.
- Along a parallel ($d\theta=0$), $ds=a\sin\theta\,d\phi$. The circle of latitude has radius $a\sin\theta$, which shrinks to zero at the poles.
- Arc length = radius × angle requires the angle in **radians**: $1^\circ=\pi/180=0.0174533$ rad.

#### Worked examples (inputs cited; arithmetic verified by the researcher)

**Example 1.1 (flat 2D warm-up: polar coordinates)** [any length unit; verified]
- Formula: Carroll gives the flat-plane polar metric $ds^2=dr^2+r^2d\theta^2$ (eq. 3.22). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Derivation, same recipe as above:
  1. $x=r\cos\theta$ and $y=r\sin\theta$.
  2. $dx=\cos\theta\,dr-r\sin\theta\,d\theta$ and $dy=\sin\theta\,dr+r\cos\theta\,d\theta$.
  3. $dx^2+dy^2=(\cos^2\theta+\sin^2\theta)dr^2+(-2r\sin\theta\cos\theta+2r\sin\theta\cos\theta)dr\,d\theta+r^2(\sin^2\theta+\cos^2\theta)d\theta^2=dr^2+r^2d\theta^2$.
- Numbers, quarter circle at $r=2$ m: $dr=0$, so $L=\int_0^{\pi/2}r\,d\theta=2\times\pi/2=\pi=3.1416$ m.
- Numbers, a small step from $(r,\theta)=(2,0)$ with $dr=0.001$ and $d\theta=0.0005$:
  1. $ds^2=(0.001)^2+2^2(0.0005)^2=1.0\times10^{-6}+4\times2.5\times10^{-7}=2.0\times10^{-6}$.
  2. $ds=0.00141421$.
  3. Straight-line (chord) distance computed from Cartesian coordinates: $0.00141439$. The relative difference is $1.25\times10^{-4}$.
- Making both steps 10× larger gives a relative difference of $1.25\times10^{-3}$. Making them 10× smaller gives $1.25\times10^{-5}$. The line element is exact in the limit of infinitesimal steps, and the error shrinks in proportion to the step size.

**Example 1.2 (Earth distances along latitude and longitude lines)** [SI/km; verified]
- Input: Earth's volumetric mean radius $a=6371.000$ km. — [NASA NSSDCA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)
- One degree of **latitude** (along a meridian, $d\phi=0$): $ds=a\,d\theta=6371.0\times0.0174533=111.19$ km. This is the same at every latitude.
- One degree of **longitude** (along a parallel, $d\theta=0$): $ds=a\sin\theta\,d\phi$.
  - Equator, $\lambda=0^\circ$, $\theta=90^\circ$, $\sin\theta=1$: $111.19$ km.
  - $\lambda=45^\circ$N, $\theta=45^\circ$, $\sin\theta=0.70711$: $6371.0\times0.70711\times0.0174533=78.63$ km.
  - $\lambda=60^\circ$N, $\theta=30^\circ$, $\sin\theta=0.5$: $6371.0\times0.5\times0.0174533=55.60$ km.
- Circumference of the 60°N parallel: $2\pi a\sin\theta=2\pi\times6371.0\times0.5=20{,}015$ km. The equator's is $40{,}030$ km.

**Example 1.3 (a parallel is not the shortest path: preview of geodesics)** [km; verified]
- Path A, along the 60°N parallel from longitude 0° to 90°E: $\Delta\phi=\pi/2=1.570796$, so $L=a\sin\theta\,\Delta\phi=6371.0\times0.5\times1.570796=5003.8$ km.
- Path B, the great circle between the same two points. With unit vectors $\hat n=(\cos\lambda\cos\phi,\cos\lambda\sin\phi,\sin\lambda)$, the dot product gives $\cos\Delta\sigma=\sin\lambda_1\sin\lambda_2+\cos\lambda_1\cos\lambda_2\cos\Delta\phi$.
  1. $\cos\Delta\sigma=\sin^2 60^\circ+\cos^2 60^\circ\cos 90^\circ=0.75+0.25\times0=0.75$.
  2. $\Delta\sigma=\arccos 0.75=41.41^\circ=0.72273$ rad.
  3. $L=6371.0\times0.72273=4604.5$ km.
- The parallel is 399 km longer. On a curved surface, "following a coordinate line" and "going straight" are different things. GR's geodesics make this precise.

#### Where it appears in GR
- The angular part of the Schwarzschild metric is the sphere metric scaled by $r^2$: $ds^2=-(1-2GM/r)dt^2+(1-2GM/r)^{-1}dr^2+r^2d\Omega^2$, with $d\Omega^2=d\theta^2+\sin^2\theta\,d\phi^2$ [G = c = 1]. — [Carroll, eqs. 7.3, 7.29](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- Physicists' $\theta$ is colatitude (measured from the pole), not latitude. Writing $\sin\theta$ where $\cos\lambda$ is meant gives wrong distances.
- $ds^2$ is notation for the metric, not "$d$ of $s^2$". — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)
- $\sin^2\theta\,d\phi^2$ means $(\sin\theta)^2(d\phi)^2$.
- Degrees must be converted to radians before multiplying by a radius.

### Inferences
- Bridge from Calculus II: the arc-length formula $L=\int\sqrt{(dx/dt)^2+(dy/dt)^2}\,dt$ is already a line element. $ds^2$ just writes the integrand's square before integrating.
- Analogy: the metric is like a map's scale bar that changes from place to place. On a Mercator map, the "km per centimetre" at 60°N differs from the equator's. $g_{\phi\phi}=a^2\sin^2\theta$ is that changing scale written as a formula.
- Key takeaways:
  1. Two coordinates suffice on a surface.
  2. $ds^2$ converts coordinate steps into true distances.
  3. On a sphere, $g_{\phi\phi}=a^2\sin^2\theta$ depends on position.
  4. The metric uses only the surface's own coordinates, so a 2D being could measure it.
  5. Coordinate lines need not be the shortest paths.

### Gaps
- I found no education-research data specific to students learning the sphere metric. Moore's recommendation is experience-based, not a controlled study.

---

## Topic 2: Gradients and how fields vary through space. What are $\nabla\Phi$, directional derivatives, and why is the gradient naturally a lower-index object $\partial_\mu\Phi$?

### Takeaway
A gradient collects the partial derivatives of a scalar field: $\partial_\mu\Phi\equiv\partial\Phi/\partial x^\mu$. Feed it a direction and it returns the rate of change in that direction. Its components transform by the chain rule with the **inverse** of the rule for displacements, which is why they carry a **lower** index (a covector, or one-form). In Newtonian gravity $\vec g=-\nabla\Phi$. In GR the potential reappears inside the metric as $g_{00}\approx-(1+2\Phi/c^2)$.

### Cited Findings

#### Explanation and analogy
- Carroll: "In spacetime the simplest example of a dual vector is the gradient of a scalar function, the set of partial derivatives with respect to the spacetime coordinates". The notation is $\partial\phi/\partial x^\mu=\partial_\mu\phi=\phi_{,\mu}$ (eqs. 1.40–1.42), with the rule of thumb: "$x^\mu$ has an upper index, but when it is in the denominator of a derivative it implies a lower index on the resulting object." — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Carroll: acting on a curve's tangent vector, the gradient gives the ordinary derivative along the curve, $\partial_\mu\phi\,\frac{dx^\mu}{d\lambda}=\frac{d\phi}{d\lambda}$ (eq. 1.43). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Bertschinger's argument: $df=\frac{\partial f}{\partial x^\mu}dx^\mu$, and "because $df$ is a scalar and $dx^\mu$ is a vector component, $\partial f/\partial x^\mu$ must be the component of a one-form, not a vector. The notation $\partial_\mu$, with its covariant (subscript) index, reinforces our view". — [Bertschinger, MIT 8.962, eqs. 37–38](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)
- Carroll explains why the distinction is invisible in school physics: "in Euclidean space (where the metric is diagonal with all entries +1) a dual vector is turned into a vector with precisely the same components when we raise its index". He adds that "The gradient, and its action on vectors, is perfectly well defined regardless of any metric, whereas the 'gradient with upper indices' is not." — [Carroll, §1, around eqs. 1.62–1.63](https://arxiv.org/abs/gr-qc/9712019)
- Schutz's textbook gives a separate section to the picture of a one-form as a set of surfaces ("4.3 One-forms and surfaces") after introducing one-forms in §3.3. — [Schutz, *A First Course in General Relativity*, 2nd ed., table of contents](https://assets.cambridge.org/97805218/87052/toc/9780521887052_toc.pdf)
- Carroll also mentions "a way to represent them [dual vectors] as pictures". — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)

#### Why GR needs it
- Partial derivatives of the metric build the Christoffel symbols: $\Gamma^\sigma{}_{\mu\nu}=\tfrac12 g^{\sigma\rho}(\partial_\mu g_{\nu\rho}+\partial_\nu g_{\rho\mu}-\partial_\rho g_{\mu\nu})$, which Carroll calls "one of the most important formulas in this subject" (eq. 3.21). — [Carroll, §3](https://arxiv.org/abs/gr-qc/9712019)
- In the weak-field limit the geodesic equation reduces to $d^2x^i/dt^2=\tfrac12\partial_i h_{00}$ with $h_{00}=-2\Phi$. That is Newton's $\vec g=-\nabla\Phi$ recovered from the metric (eqs. 4.19–4.21, [c = 1]). — [Carroll, §4](https://arxiv.org/abs/gr-qc/9712019)
- The partial derivative of anything other than a scalar is *not* a tensor in general coordinates. The extra term in eq. 2.26 "arises because the derivative of the transformation matrix does not vanish". This motivates the covariant derivative. — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)

#### Mechanics and notation
- Scalar field $f(x,y,z)$: one number at each point.
- Partial derivative $\partial f/\partial x$: differentiate in $x$ with $y,z$ fixed.
- Gradient (Cartesian, 3D): $\nabla f=\left(\frac{\partial f}{\partial x},\frac{\partial f}{\partial y},\frac{\partial f}{\partial z}\right)$.
- Index form: $\partial_\mu f$, where $\mu$ labels the coordinate.
- Total differential: $df=\partial_\mu f\,dx^\mu$ (summed over $\mu$; see Topic 6).
- Directional derivative along a unit vector $\hat u$: $D_{\hat u}f=\nabla f\cdot\hat u=|\nabla f|\cos\alpha$. It is largest when $\hat u$ points along $\nabla f$, and that largest rate is $|\nabla f|$.
- Along a curve $x^\mu(\lambda)$: $df/d\lambda=\partial_\mu f\,dx^\mu/d\lambda$. No metric is needed.
- Transformation of the components (chain rule): $\frac{\partial f}{\partial x'^\mu}=\frac{\partial x^\nu}{\partial x'^\mu}\frac{\partial f}{\partial x^\nu}$. This is exactly the dual-vector law $\omega_{\mu'}=\frac{\partial x^\mu}{\partial x^{\mu'}}\omega_\mu$ (Carroll eqs. 1.41, 2.17). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Newtonian gravity [SI]: $\Phi=-GM/r$ and $\vec g=-\nabla\Phi$, so $|\vec g|=GM/r^2$, pointing toward the mass.

#### Worked examples

**Example 2.1 (2D gradient and directional derivative)** [dimensionless; verified]
- Field $f(x,y)=x^2+3xy$ at the point $(1,2)$:
  1. $\partial f/\partial x=2x+3y=2(1)+3(2)=8$.
  2. $\partial f/\partial y=3x=3(1)=3$.
  3. So $\nabla f=(8,3)$.
- Direction $\hat u=(3/5,4/5)$, which is a unit vector because $9/25+16/25=1$:
  - $D_{\hat u}f=8(0.6)+3(0.8)=4.8+2.4=7.2$.
- Steepest rate: $|\nabla f|=\sqrt{64+9}=\sqrt{73}=8.544$, in the direction $(8,3)/\sqrt{73}$.
- Check by finite difference: $[f(1+0.6h,\,2+0.8h)-f(1,2)]/h$ with $h=10^{-6}$ gives $7.2000018$.

**Example 2.2 (Earth's gravitational field as $-\nabla\Phi$)** [SI; verified]
- Input: $GM_E=3.986004418\times10^{14}\ \mathrm{m^3\,s^{-2}}$. — [Ashby 2003, *Living Reviews in Relativity* 6:1](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)
- Gradient components in Cartesian coordinates:
  1. $\partial r/\partial x=x/r$.
  2. $d(-GM/r)/dr=GM/r^2$.
  3. So $\partial_x\Phi=GM\,x/r^3$, and likewise for $y$ and $z$.
  4. Hence $\vec g=-GM\,\vec r/r^3$, with magnitude $GM/r^2$.
- At $r=6.371\times10^6$ m:
  1. $r^2=4.05896\times10^{13}\ \mathrm{m^2}$.
  2. $g=3.986004418\times10^{14}/4.05896\times10^{13}=9.820\ \mathrm{m/s^2}$.
- This matches the NASA fact sheet's "Surface gravity (mean) 9.820 m/s²". — [NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)

**Example 2.3 (why the gradient is "lower-index": the same gradient in polar coordinates)** [any length unit; verified with sympy]
- Take $f=x=r\cos\theta$.
- Cartesian components: $\partial_x f=1$, $\partial_y f=0$.
- Polar components, by direct differentiation:
  - $\partial_r f=\cos\theta$.
  - $\partial_\theta f=-r\sin\theta$. This has units of length per radian, so it is *not* "the rate per metre in the $\hat\theta$ direction".
- The same result from the covector rule $\omega'_\mu=\frac{\partial x^\nu}{\partial x'^\mu}\omega_\nu$:
  - $\omega_r=\frac{\partial x}{\partial r}(1)+\frac{\partial y}{\partial r}(0)=\cos\theta$.
  - $\omega_\theta=\frac{\partial x}{\partial\theta}(1)+\frac{\partial y}{\partial\theta}(0)=-r\sin\theta$.
- Raising with the inverse polar metric $g^{\mu\nu}=\mathrm{diag}(1,1/r^2)$ (see Topics 8 and 9):
  - $(\nabla f)^r=\cos\theta$.
  - $(\nabla f)^\theta=-\sin\theta/r$.
- The physical component along the unit vector $\hat\theta$ is $r\times(-\sin\theta/r)=-\sin\theta$. That agrees with the Cartesian fact $\nabla x=\hat x=\cos\theta\,\hat r-\sin\theta\,\hat\theta$.
- At $(x,y)=(1,1)$, i.e. $r=\sqrt2$, $\theta=\pi/4$: the covector components are $(\omega_r,\omega_\theta)=(0.7071,-1)$, while the vector components are $(0.7071,-0.5)$.
- One geometric object, three different-looking sets of numbers. The lower-index set is the one produced by plain differentiation.

**Example 2.4 (spacetime: the phase of a light wave)** [SI, $x^0=ct$; arithmetic verified; formulas follow Carroll eqs. 1.42 and 1.63]
- Phase $\varphi(t,x)=kx-\omega t$. Since $x^0=ct$, $\partial_0=\partial/\partial(ct)$.
  - $\partial_0\varphi=-\omega/c$.
  - $\partial_1\varphi=k$.
  - So $k_\mu\equiv\partial_\mu\varphi=(-\omega/c,\,k,\,0,\,0)$.
- Raising with $\eta^{\mu\nu}$ flips only the time component: $k^\mu=(\omega/c,\,k,\,0,\,0)$.
- For light $\omega=ck$, so $k_\mu k^\mu=-(\omega/c)^2+k^2=0$: the wave four-vector is null.
- Numbers for $\lambda=500$ nm:
  - $k=2\pi/\lambda=1.2566\times10^{7}\ \mathrm{m^{-1}}$.
  - $\omega=ck=3.7673\times10^{15}$ rad/s.
- The phase itself, $\varphi=k_\mu x^\mu=-(\omega/c)(ct)+kx=kx-\omega t$, is a scalar that all observers agree on.

#### Where it appears in GR
- $\partial_\mu$ appears in:
  - the Christoffel symbols (eq. 3.21);
  - energy-momentum conservation in flat spacetime, $\partial_\mu T^{\mu\nu}=0$ (eq. 1.113);
  - the Newtonian limit (eqs. 4.19–4.21).

  — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- In Cartesian Euclidean space, vector and covector components coincide, so students have never needed the distinction. — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- $\partial_\mu$ has a lower index even though $x^\mu$ has an upper one. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- $\partial_\theta f$ is not a physical rate per metre.
- $\vec g=-\nabla\Phi$ points *down* the potential hill.
- The symbol $\nabla$ is later reused for the covariant derivative $\nabla_\mu$.

### Inferences
- Contour-map analogy (consistent with Schutz's "one-forms and surfaces" picture): a gradient is like the stack of contour lines on a hiking map. A step (a vector) crosses some number of contour lines, and that count is the change in altitude. Counting crossings needs no ruler (no metric). Converting the stack into an arrow that "points uphill" does need one.
- Key takeaways:
  1. $\partial_\mu f$ is the natural, metric-free form of the gradient.
  2. Contracting it with a direction gives a rate of change.
  3. It transforms with $\partial x/\partial x'$.
  4. Turning it into an arrow requires $g^{\mu\nu}$.
  5. Newton's field $-\nabla\Phi$ survives in GR inside $g_{00}$.

### Gaps
- No source consulted gives student-error data specific to gradients as covectors. The claim that this is a common stumbling block rests on textbook authors' remarks (Carroll, Moore), not on measured data.

---

## Topic 3: Four-dimensional spacetime, events, worldlines and four-vectors $x^\mu=(ct,x,y,z)$

### Takeaway
An **event** is a point in spacetime: a place *and* a time. Labelling events with four numbers $x^\mu$ with $\mu=0,1,2,3$, and measuring time in metres via $x^0=ct$, puts space and time on the same footing. A particle's whole history is a curve, its **worldline**. A **four-vector** is any set of four components that transforms like the displacement $\Delta x^\mu$ between two events.

### Cited Findings
- Carroll: "An event is defined as a single moment in space and time, characterized uniquely by $(t,x,y,z)$". Coordinates are $x^0=ct$, $x^1=x$, $x^2=y$, $x^3=z$ (eq. 1.5), with the warning "(Don't start thinking of the superscripts as exponents.)" — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Carroll: "the division of Minkowski space into space and time is a choice we make for our own purposes, not something intrinsic to the situation". Also: "Almost all of the 'paradoxes' associated with SR result from a stubborn persistence of the Newtonian notions of a unique time coordinate". — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Taylor & Wheeler's analogy: "An event marks a location in spacetime; it is like a steel stake driven into spacetime." On units: "Time in meters is just the time it takes a light flash to go that number of meters. The conversion factor between seconds and meters is the speed of light, c = 299,792,458 meters/second". They also call the speed of light "a mere conversion factor, like the factor of conversion between miles and meters". — [Taylor & Wheeler, ch. 1, §§1.2–1.3](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf)
- Schutz's opening chapter has sections titled "New units", "Spacetime diagrams" and "Construction of the coordinates used by another observer", and his chapter 2 is "Vector analysis in special relativity" ("Definition of a vector", "The four-velocity", "The four-momentum"). — [Schutz 2nd ed., table of contents](https://assets.cambridge.org/97805218/87052/toc/9780521887052_toc.pdf)
- Carroll: the tangent vector to a path $x^\mu(\lambda)$ is $dx^\mu/d\lambda$. A path is timelike, null or spacelike according to its tangent vector. "Massive particles move on timelike paths, massless particles move on null paths." — [Carroll, §1, around eqs. 1.96–1.97](https://arxiv.org/abs/gr-qc/9712019)

#### Worked examples [verified]

**Example 3.1 (spacetime-diagram worldlines, 2D $(ct,x)$)** [c = 1, metres]
- A particle at rest at $x=2$ m: $x^\mu(t)=(ct,\,2\ \mathrm m)$. This is a vertical line.
- A particle leaving the origin at $v=0.6c$: $x=0.6\,ct$. Each 5 m of $ct$ comes with 3 m of $x$, so the worldline has slope $\Delta(ct)/\Delta x=5/3$.
- A light ray: $x=ct$, a 45° line.

**Example 3.2 (an event in SI)** [SI]
- An event at $t=1.0\ \mu$s, $x=100$ m, $y=z=0$:
  - $x^0=ct=299{,}792{,}458\times1.0\times10^{-6}=299.79$ m.
  - So $x^\mu=(299.79\ \mathrm m,\,100\ \mathrm m,\,0,\,0)$.
- Conversion: 1 m of time is $1/c=3.33564$ ns.

**Example 3.3 (displacement four-vector)** [c = 1, metres]
- Between $E_1=(0,0,0,0)$ and $E_2=(5,3,0,0)$ m: $\Delta x^\mu=(5,3,0,0)$ m.
- This four-vector is reused in Topics 4, 5 and 9.

#### Where it appears in GR
- Worldlines $x^\mu(\lambda)$ are what the geodesic equation determines: $\frac{d^2x^\mu}{d\lambda^2}+\Gamma^\mu{}_{\rho\sigma}\frac{dx^\rho}{d\lambda}\frac{dx^\sigma}{d\lambda}=0$ (eq. 3.47). — [Carroll, §3](https://arxiv.org/abs/gr-qc/9712019)
- Bertschinger summarises GR's core idea: particles "follow the straightest possible paths (geodesics) through a spacetime curved by mass". — [Bertschinger, §1](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)

#### Common beginner confusions
- Superscripts are labels, not powers. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- $x^0$ is $ct$, not $t$.
- Indices start at 0.
- A worldline is a whole history in spacetime, not a path drawn in space.

### Inferences
- The "time in metres" idea is the single biggest simplification for a Physics I student. Once $ct$ is a length, Lorentz transformations look like rotations (Topic 5).
- Key takeaways:
  1. An event is a point in 4D spacetime.
  2. $x^\mu=(ct,x,y,z)$, with $\mu=0$ for time.
  3. A worldline is a particle's history.
  4. Displacements between events are the prototype four-vectors.

### Gaps
- No PER data were collected on the "superscript-as-exponent" confusion specifically, beyond Moore's experience-based report (Topic 6 and Key question C).

---

## Topic 4: Minkowski spacetime and the interval $\Delta s^2=-c^2\Delta t^2+\Delta x^2+\Delta y^2+\Delta z^2$

### Takeaway
Observers moving relative to one another disagree about time separations and space separations, but they all agree on one combination: the **interval**. Its sign classifies how two events are related:
- negative: **timelike**, one event can cause the other;
- positive: **spacelike**, no signal can connect them;
- zero: **null**, light connects them.

The Minkowski metric $\eta_{\mu\nu}=\mathrm{diag}(-1,1,1,1)$ packages this as $\Delta s^2=\eta_{\mu\nu}\Delta x^\mu\Delta x^\nu$.

### Cited Findings

#### Explanation and analogy
- **Parable of the surveyors.** A Daytime surveyor takes north from a magnetic compass. A Nighttime surveyor takes north from the North Star. Their north directions differ by 1.15°. They disagree on the northward and eastward separations of every stake but agree on the distance. Measuring northward distances in "sacred" miles and eastward ones in metres hid this until a student converted both to the same unit. Taylor & Wheeler map this onto spacetime: observers in relative motion disagree on time and space separations but agree on the interval once time is in metres. — [Taylor & Wheeler, ch. 1, §1.1–1.2](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf)
- Taylor & Wheeler on the minus sign: "Pythagoras tells us to ADD the squares of northward and eastward separations to get the square of the distance. Who tells us to SUBTRACT...?" They call the resulting geometry "Lorentz geometry" and say they derive the invariance with its minus sign from experiment in their chapter 3. — [Taylor & Wheeler, ch. 1](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf)
- Taylor & Wheeler on wristwatch time: if you carry a wristwatch from one event to the other at constant velocity, the space separation is zero for you, so "our wristwatch reads directly the spacetime interval between the pair of events". — [Taylor & Wheeler, ch. 1, §1.3](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf)
- Carroll: there exists a $c$ "such that the spacetime interval is invariant under changes of coordinates", and this "is why it makes sense to think of SR as a theory of 4-dimensional spacetime, known as Minkowski space". — [Carroll, §1, eqs. 1.3–1.4](https://arxiv.org/abs/gr-qc/9712019)

#### Mechanics
- $s^2=\eta_{\mu\nu}\Delta x^\mu\Delta x^\nu$ (eq. 1.9), with $\eta_{\mu\nu}=\mathrm{diag}(-1,1,1,1)$ (eq. 1.8). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Classification: "the interval between timelike separated points is negative, between spacelike separated points is positive, and between null separated points is zero. (The interval is defined to be $s^2$, not the square root of this quantity.)" For a spacelike-separated point, "it is impossible to say (in a coordinate-independent way)" whether it is in the future or the past. — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- The same classification applies to vectors: $\eta_{\mu\nu}V^\mu V^\nu<0$ timelike, $=0$ null or lightlike, $>0$ spacelike. — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- For timelike separations, the proper time is $c\,\Delta\tau=\sqrt{-\Delta s^2}$ (see Topic 12).
- For spacelike separations, the proper distance is $\sqrt{\Delta s^2}$.

#### Worked examples [verified]

**Example 4.1 (three 2D cases)** [c = 1, metres]
- (a) Timelike: $\Delta(ct)=5$, $\Delta x=3$.
  - $\Delta s^2=-(5)^2+(3)^2=-25+9=-16\ \mathrm{m^2}$.
  - $c\Delta\tau=\sqrt{16}=4$ m, so $\Delta\tau=4/c=13.34$ ns.
- (b) Spacelike: $\Delta(ct)=3$, $\Delta x=5$.
  - $\Delta s^2=-9+25=+16\ \mathrm{m^2}$.
  - Proper distance $=4$ m.
- (c) Null: $\Delta(ct)=5$, $\Delta x=5$.
  - $\Delta s^2=-25+25=0$. A light ray could connect these events.

**Example 4.2 (4D)** [c = 1, metres]
- $\Delta x^\mu=(10,2,3,4)$ m:
  - $\Delta s^2=-100+4+9+16=-71\ \mathrm{m^2}$, so the separation is timelike.

**Example 4.3 (two lightning strikes, SI)** [SI]
- Two strikes 1.000 km apart and 2.000 μs apart in the ground frame:
  1. $c\Delta t=299{,}792{,}458\times2.000\times10^{-6}=599.585$ m.
  2. $(c\Delta t)^2=359{,}502\ \mathrm{m^2}$.
  3. $\Delta x^2=1{,}000{,}000\ \mathrm{m^2}$.
  4. $\Delta s^2=-359{,}502+1{,}000{,}000=+640{,}498\ \mathrm{m^2}$, which is spacelike.
- Consequences:
  - Neither strike could have caused the other.
  - A frame moving at $v=c^2\Delta t/\Delta x=0.59958c$ sees them as simultaneous, separated by the proper distance $\sqrt{640{,}498}=800.31$ m.
- Check with the boost of Topic 5, $\beta=0.599585$:
  - $c\Delta t'=\gamma(c\Delta t-\beta\Delta x)=0$.
  - $\Delta x'=\gamma(\Delta x-\beta c\Delta t)=800.31$ m.

#### Where it appears in GR
- GR replaces $\eta_{\mu\nu}$ with a position-dependent $g_{\mu\nu}(x)$: $ds^2=g_{\mu\nu}dx^\mu dx^\nu$ (eq. 2.29).
- Carroll lists that "the metric determines causality, by defining the speed of light faster than which no signal can travel".

— [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- "$\Delta s^2$" can be negative. It is a name for a quantity, not the square of a real number. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Books differ in overall sign. — [Taylor & Wheeler](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf); [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- The interval is invariant, but $\Delta t$ and $\Delta x$ separately are not.
- PER on simultaneity: after standard instruction, students at all levels tend to treat "the time of a distant event" as the time a signal from it is *received*, and many hold absolute and relative simultaneity side by side. — [Scherr, Shaffer & Vokos, *Am. J. Phys.* 69, S24 (2001), arXiv:physics/0207109](https://arxiv.org/abs/physics/0207109)

### Inferences
- In Euclidean geometry the straight line is the *shortest* path. With the minus sign, a straight timelike worldline has the *longest* proper time. This sets up the twin paradox (Topic 12).
- Key takeaways:
  1. The interval is invariant.
  2. Its sign classifies causal relations.
  3. $\eta_{\mu\nu}$ is a matrix version of the interval's coefficients.
  4. The sign convention differs between books, but the physics does not.

### Gaps
- Taylor & Wheeler's chapter 3 derivation of interval invariance from experiment was not read in this research.

---

## Topic 5: Lorentz transformations. What is the boost matrix $\Lambda^\mu{}_\nu$, and does it preserve the interval?

### Takeaway
Lorentz transformations are the linear changes of inertial coordinates that keep the interval unchanged. That requirement, written as the matrix identity $\Lambda^T\eta\Lambda=\eta$, forces "hyperbolic rotations" (boosts) between $ct$ and $x$. They are parametrised by the rapidity $\phi$, with $\tanh\phi=v/c$, $\cosh\phi=\gamma$ and $\sinh\phi=\gamma\beta$. At $v=0.6c$ every number comes out exact ($\gamma=5/4$, $\gamma\beta=3/4$, $\phi=\ln 2$).

### Cited Findings
- Carroll asks: "What kind of transformations leave the interval invariant?"
  - Linear maps $x^{\mu'}=\Lambda^{\mu'}{}_\nu x^\nu$ (eq. 1.11) must satisfy $s^2=(\Delta x)^T\Lambda^T\eta\Lambda(\Delta x)$ for every $\Delta x$, which gives $\eta=\Lambda^T\eta\Lambda$ (eq. 1.14), i.e. $\eta_{\rho\sigma}=\Lambda^{\mu'}{}_\rho\Lambda^{\nu'}{}_\sigma\eta_{\mu'\nu'}$ (eq. 1.15).
  - He compares rotations, which satisfy $1=R^T1R$ (eq. 1.16): "the only difference is the minus sign in the first term of the metric $\eta$, signifying the timelike direction."
  - Boosts "may be thought of as 'rotations between space and time directions'": $\Lambda=\begin{pmatrix}\cosh\phi&-\sinh\phi\\-\sinh\phi&\cosh\phi\end{pmatrix}$ in the $t$–$x$ block (eq. 1.18).
  - The primed origin moves at $v=\tanh\phi$ (eq. 1.20), which gives $t'=\gamma(t-vx)$, $x'=\gamma(x-vt)$, $\gamma=1/\sqrt{1-v^2}$ (eq. 1.21, [c = 1]).
  - "The boost parameter $\phi$, unlike the rotation angle, is defined from $-\infty$ to $\infty$."
  - The Lorentz group is $O(3,1)$; excluding reflections gives the proper group $SO(3,1)$; with translations it is the ten-parameter Poincaré group.

  — [Carroll, §1, eqs. 1.10–1.21](https://arxiv.org/abs/gr-qc/9712019)
- Carroll on spacetime diagrams: under a boost the $t'$ and $x'$ axes "scissor together instead of remaining orthogonal in the traditional Euclidean sense". — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Index placement: Carroll puts primes on indices ($\Lambda^{\mu'}{}_\nu$), uses $\Lambda_{\nu'}{}^{\mu}$ for the inverse, and notes "Schutz uses a different convention, always arranging the two indices northwest/southeast; the important thing is where the primes go." — [Carroll, §1, eqs. 1.28–1.29](https://arxiv.org/abs/gr-qc/9712019)
- Schutz's chapter 1 builds up to "1.6 Invariance of the interval", "1.7 Invariant hyperbolae", "1.9 The Lorentz transformation" and "1.10 The velocity-composition law". — [Schutz 2nd ed., table of contents](https://assets.cambridge.org/97805218/87052/toc/9780521887052_toc.pdf)

#### Mechanics: derivation sketch for a Calculus II student [c = 1 or $x^0=ct$; algebra verified with sympy]
1. **Ansatz.** Look for linear formulas $ct'=A\,ct+B\,x$ and $x'=C\,ct+D\,x$. Linearity is what makes straight worldlines map to straight worldlines.
2. **Require the interval to be invariant:** $-(ct')^2+x'^2=-(ct)^2+x^2$ for all $ct,x$.
3. **Expand the left side:** $(-A^2+C^2)(ct)^2+2(-AB+CD)(ct)x+(-B^2+D^2)x^2$.
4. **Match coefficients:**
   - $-A^2+C^2=-1$
   - $-AB+CD=0$
   - $-B^2+D^2=1$
5. **Solve with hyperbolic functions.** Ordinary rotations use $\cos^2+\sin^2=1$. Here the needed identity is $\cosh^2\phi-\sinh^2\phi=1$. Take $A=D=\cosh\phi$ and $B=C=-\sinh\phi$:
   - $-\cosh^2\phi+\sinh^2\phi=-1$ ✓
   - $-\cosh\phi(-\sinh\phi)+(-\sinh\phi)\cosh\phi=0$ ✓
   - $-\sinh^2\phi+\cosh^2\phi=1$ ✓
6. **Identify $\phi$.** The primed observer's origin $x'=0$ satisfies $-\sinh\phi\,ct+\cosh\phi\,x=0$, so $x/(ct)=\tanh\phi=\beta\equiv v/c$.
7. **Express in terms of $\beta$.** Since $\cosh^2\phi-\sinh^2\phi=1$, dividing by $\cosh^2\phi$ gives $1-\tanh^2\phi=1/\cosh^2\phi$. Hence $\cosh\phi=1/\sqrt{1-\beta^2}=\gamma$ and $\sinh\phi=\gamma\beta$.

Result [SI, $x^0=ct$, signature-independent]:
$$\Lambda^\mu{}_\nu=\begin{pmatrix}\gamma&-\gamma\beta&0&0\\-\gamma\beta&\gamma&0&0\\0&0&1&0\\0&0&0&1\end{pmatrix},\qquad \gamma=\frac{1}{\sqrt{1-v^2/c^2}},\quad\beta=\frac vc,$$
so that
$$ct'=\gamma(ct-\beta x),\qquad x'=\gamma(x-\beta ct),\qquad y'=y,\qquad z'=z.$$
Index convention: the row label is the upper (first) index $\mu$ and the column label is the lower (second) index $\nu$, so $x'^\mu=\Lambda^\mu{}_\nu x^\nu$ is matrix times column vector.

#### Worked examples [verified with sympy]

**Example 5.1 (the numbers at $v=0.6c$)**
1. $\beta=0.6$ and $\beta^2=0.36$.
2. $1-\beta^2=0.64$ and $\sqrt{0.64}=0.8$.
3. $\gamma=1/0.8=1.25$ and $\gamma\beta=0.75$.
4. Rapidity: $\phi=\operatorname{artanh}0.6=\tfrac12\ln\frac{1+0.6}{1-0.6}=\tfrac12\ln4=\ln2=0.693147$.
5. Check: $\cosh(\ln2)=(2+\tfrac12)/2=1.25$ ✓ and $\sinh(\ln2)=(2-\tfrac12)/2=0.75$ ✓.

**Example 5.2 (transform an event that lies on the moving observer's worldline)** [c = 1, metres]
- $x^\mu=(5,3,0,0)$:
  - $ct'=1.25(5)-0.75(3)=6.25-2.25=4$
  - $x'=-0.75(5)+1.25(3)=-3.75+3.75=0$
  - $y'=0$ and $z'=0$
- Interval before: $-25+9=-16$. After: $-16+0=-16$ ✓.
- Meaning: the event sits at $x'=0$, so it lies on the moving clock's worldline. That clock reads 4 m of time ($=13.34$ ns) while the ground frame says 5 m. The ratio $5/4=\gamma$ is time dilation, read straight off the matrix.

**Example 5.3 (a general 4D event)** [c = 1, metres]
- $x^\mu=(10,2,3,4)$:
  - $ct'=1.25(10)-0.75(2)=12.5-1.5=11$
  - $x'=-0.75(10)+1.25(2)=-7.5+2.5=-5$
  - $y'=3$ and $z'=4$
- Interval before: $-100+4+9+16=-71$. After: $-121+25+9+16=-71$ ✓.

**Example 5.4 (checking $\Lambda^T\eta\Lambda=\eta$ by hand on the $t$–$x$ block)**
1. $\eta\Lambda=\begin{pmatrix}-1&0\\0&1\end{pmatrix}\begin{pmatrix}1.25&-0.75\\-0.75&1.25\end{pmatrix}=\begin{pmatrix}-1.25&0.75\\-0.75&1.25\end{pmatrix}$.
2. Multiply on the left by $\Lambda^T=\begin{pmatrix}1.25&-0.75\\-0.75&1.25\end{pmatrix}$:
   - Row 1: $(1.25)(-1.25)+(-0.75)(-0.75)=-1.5625+0.5625=-1$ and $(1.25)(0.75)+(-0.75)(1.25)=0$.
   - Row 2: $(-0.75)(-1.25)+(1.25)(-0.75)=0$ and $(-0.75)(0.75)+(1.25)(1.25)=-0.5625+1.5625=1$.
3. Result: $\begin{pmatrix}-1&0\\0&1\end{pmatrix}=\eta$ ✓.
- sympy confirms $\Lambda^T\eta\Lambda-\eta=0$ symbolically for every $\beta$, and also with $\eta=\mathrm{diag}(1,-1,-1,-1)$.
- Determinant: $\det\Lambda=\gamma\cdot\gamma-(-\gamma\beta)(-\gamma\beta)=\gamma^2(1-\beta^2)=1$. sympy gives exactly 1.

**Example 5.5 (inverse and composition)**
- Inverse: $\Lambda(-0.6c)\,\Lambda(0.6c)=I$ (verified). The inverse boost is the boost with $-v$.
- Composition: two successive $0.6c$ boosts multiply to the $t$–$x$ block $\begin{pmatrix}17/8&-15/8\\-15/8&17/8\end{pmatrix}$, i.e. a single boost with $v/c=(15/8)/(17/8)=15/17=0.88235$.
- Rapidities add: $\ln2+\ln2=\ln4$, and $\tanh(\ln4)=(4-\tfrac14)/(4+\tfrac14)=15/17$ ✓.
- This matches relativistic velocity addition: $(0.6+0.6)/(1+0.36)=1.2/1.36=0.88235$ ✓.

#### Where it appears in GR
- In GR the constant matrix $\Lambda^{\mu'}{}_\nu$ is replaced by the position-dependent Jacobian $\partial x^{\mu'}/\partial x^\mu$. Carroll: the general tensor law "follows this same pattern of replacing the Lorentz transformation matrix used in flat space with a matrix representing more general coordinate transformations" (before eq. 2.19). — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)
- In every small region of spacetime there are locally inertial frames in which GR physics looks like SR (the strong equivalence principle). — [Bertschinger, §1](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)

#### Common beginner confusions
- The sign of $v$: a boost to a frame moving in $+x$ has $-\gamma\beta$ off the diagonal.
- $\Lambda$ is a transformation matrix, not a tensor sitting at a point.
- Index-placement conventions differ between books (Carroll versus Schutz). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Relativity of simultaneity is the deepest conceptual hurdle (see Topic 4 PER). — [Scherr et al. 2001](https://arxiv.org/abs/physics/0207109)

### Inferences
- The rotation analogy works best told this way: "rotations keep $x^2+y^2$; boosts keep $-(ct)^2+x^2$; replacing cos/sin by cosh/sinh is exactly what the minus sign forces".
- The determinant (= 1) generalises "rotations preserve area" to "boosts preserve spacetime area". Students can check it with a 2×2 determinant only.
- Key takeaways:
  1. Lorentz transformations are defined by preserving the interval.
  2. $\Lambda^T\eta\Lambda=\eta$ is that statement in matrix form.
  3. Boosts are hyperbolic rotations, and rapidities add.
  4. $\gamma=\cosh\phi$ and $\gamma\beta=\sinh\phi$.
  5. In GR, $\Lambda$ generalises to the coordinate Jacobian.

### Gaps
- I did not consult a source giving a "derivation from postulates" (light-speed invariance plus linearity) in the style of Schutz §1.6. The sketch above derives the boost from interval invariance (Carroll's route), with the algebra checked in sympy.

---

## Topic 6: The Einstein summation convention. What are free and dummy indices, and how do $a^\mu b_\mu$ and $g_{\mu\nu}dx^\mu dx^\nu$ expand?

### Takeaway
Rules:
- An index that appears **once up and once down** in a single term is summed over all its values. That is a **dummy** index.
- An index that appears once in a term is **free**. It must appear, at the same height, in every term on both sides of the equation.
- No index may appear more than twice in one term.
- An equation with $f$ free indices in $n$ dimensions stands for $n^f$ separate equations.

### Cited Findings
- Carroll: "we use the summation convention, in which indices which appear both as superscripts and subscripts are summed over" (after eq. 1.9). Also: "'free' indices (which are not summed over) must be the same on both sides of an equation, while 'dummy' indices (which are summed over) only appear on one side" (after eq. 1.61). — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Bertschinger: "repeated upper and lower indices are to be summed over their ranges, e.g., $A^\alpha B_\alpha\equiv A^0B_0+A^1B_1+A^2B_2+A^3B_3$." — [Bertschinger, MIT 8.962, §1](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)
- Carroll: "it is only permissible to contract an upper index with a lower index (as opposed to two indices of the same type)". — [Carroll, after eq. 1.59](https://arxiv.org/abs/gr-qc/9712019)
- Moore's drills (Key question C) ask students to:
  - identify free and summed indices;
  - write out the implied sums;
  - check that free indices on both sides are consistent;
  - rename indices to pull out a common factor;
  - identify nonsensical equations.

  His mantra is "When in doubt, write it out!" — [Moore 2006, §4](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Einstein's equations: "There are ten independent equations (since both sides are symmetric two-index tensors)". — [Carroll, §4, after eq. 4.52](https://arxiv.org/abs/gr-qc/9712019)

#### Worked examples [verified]

**Example 6.1 (2D contraction)**
- $a^\mu=(2,3)$ and $b_\mu=(4,-1)$ with $\mu=0,1$:
  - $a^\mu b_\mu=a^0b_0+a^1b_1=2(4)+3(-1)=8-3=5$.

**Example 6.2 (4D contraction)**
- $a^\mu=(3,1,2,-1)$ and $b_\mu=(-2,4,0,5)$:
  - Terms: $3(-2)=-6$, $1(4)=4$, $2(0)=0$, $(-1)(5)=-5$.
  - Sum: $a^\mu b_\mu=-7$.
- Renaming the dummy index changes nothing: $a^\nu b_\nu=-7$.

**Example 6.3 (the double sum $g_{\mu\nu}dx^\mu dx^\nu$ in 2D)**
- Writing out both sums:
  $$g_{\mu\nu}dx^\mu dx^\nu=g_{00}dx^0dx^0+g_{01}dx^0dx^1+g_{10}dx^1dx^0+g_{11}dx^1dx^1=g_{00}(dx^0)^2+2g_{01}dx^0dx^1+g_{11}(dx^1)^2,$$
  where the last step uses the symmetry $g_{01}=g_{10}$.
- Numbers with the oblique metric $g=\begin{pmatrix}1&1/2\\1/2&1\end{pmatrix}$ (from Topic 7) and $dx^\mu=(2,1)$:
  - The four terms are $1(2)(2)=4$, $\tfrac12(2)(1)=1$, $\tfrac12(1)(2)=1$, $1(1)(1)=1$.
  - Total $=7$, so $ds=\sqrt7=2.6458$.
- Independent check: with basis vectors $e_1=(1,0)$ and $e_2=(\tfrac12,\tfrac{\sqrt3}{2})$, the displacement $2e_1+1e_2=(2.5,0.8660)$ has squared length $6.25+0.75=7$ ✓.
- Polar example: $g=\mathrm{diag}(1,r^2)$ gives $dr^2+r^2d\theta^2$, because the off-diagonal terms vanish.

**Example 6.4 (the same in 4D)**
- $g_{\mu\nu}dx^\mu dx^\nu$ has $4\times4=16$ terms. With symmetry they group into 4 diagonal terms plus 6 distinct off-diagonal pairs, each appearing twice: 10 distinct coefficients.
- Minkowski ($\eta$ diagonal): only 4 terms survive, $ds^2=-(dx^0)^2+(dx^1)^2+(dx^2)^2+(dx^3)^2$.
  - With $dx^\mu=(10,2,3,4)$: $-100+4+9+16=-71$.

**Example 6.5 (counting free indices)**
- $W^\mu=T^\mu{}_\nu V^\nu$: free index $\mu$ (up on both sides), dummy index $\nu$. That is 4 equations, each a sum of 4 products.
- $G_{\mu\nu}=\frac{8\pi G}{c^4}T_{\mu\nu}$: two free indices give $4^2=16$ equations, of which 10 are independent because both sides are symmetric. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- $R=g^{\mu\nu}R_{\mu\nu}$: no free index, so one equation and the result is a scalar.

**Example 6.6 (malformed expressions and why)**
- $a^\mu b^\mu$: both indices are up, so this is not a contraction.
- $a^\mu=b_\nu$: the free indices do not match.
- $a^\mu b_\mu c_\mu$: $\mu$ appears three times.
- $T^\mu{}_\mu=V^\mu$: the left side has no free index, the right side has one.

**Example 6.7 (renaming to factor)**
- $a^\mu b_\mu+a^\nu c_\nu=a^\mu b_\mu+a^\mu c_\mu=a^\mu(b_\mu+c_\mu)$.

#### Where it appears in GR
- Every GR equation is written this way. For example, the geodesic equation's $\Gamma^\mu{}_{\rho\sigma}\frac{dx^\rho}{d\lambda}\frac{dx^\sigma}{d\lambda}$ is a 16-term double sum for each $\mu$ (eq. 3.47). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- These are documented in Key question C (Moore's list), e.g. $\delta^\mu_\mu=4$, not 1.

### Inferences
- Analogy: the summation convention is the dot product written as a loop, $\sum_\mu a^\mu b_\mu$, with the $\sum$ sign left implicit. A spreadsheet "SUMPRODUCT" is a good mental model for a student who has never seen a matrix.
- Key takeaways:
  1. One up and one down means sum.
  2. Free indices must match on both sides, at the same height.
  3. Never use an index three times in one term.
  4. Dummy names are arbitrary.
  5. Counting free indices tells you how many equations a line contains.

### Gaps
- None for the mechanics. Student-difficulty evidence is covered in Key question C.

---

## Topic 7: Upper and lower indices. What are contravariant and covariant components, and why does an index differ from an exponent?

### Takeaway
A vector has two natural sets of components relative to a basis:
- **contravariant** $V^i$: "how many of each basis vector to add", the parallelogram or parallel-projection rule;
- **covariant** $V_i=\vec V\cdot\vec e_i$: dot products with the basis vectors, perpendicular projections.

In an orthonormal (Cartesian) basis the two sets are identical, which is why school physics never separates them. In a skewed basis they differ visibly, and the metric $g_{ij}=\vec e_i\cdot\vec e_j$ converts one into the other.

### Cited Findings
- Carroll: dual-vector components are labelled with lower indices. Vectors are traditionally called "contravariant vectors" and dual vectors "covariant vectors": "Another name for dual vectors is one-forms". A dual vector acting on a vector gives a number, $\omega(V)=\omega_\mu V^\mu$. — [Carroll, §1, eqs. 1.33–1.35](https://arxiv.org/abs/gr-qc/9712019)
- Bertschinger: "The coefficients $A^\mu$ are called the components of the vector (often, the contravariant components)". The dual basis of one-forms $\tilde e^\mu$ is defined by pairing with the basis vectors to give the Kronecker delta. — [Bertschinger, §3.2, eq. 13](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)
- Carroll: "(Don't start thinking of the superscripts as exponents.)" — [Carroll, after eq. 1.5](https://arxiv.org/abs/gr-qc/9712019)
- Moore's practical fix: "Instead of using numbers as vector or tensor indices (e.g. $p^0,p^1,p^2,p^3$), I try whenever possible to use coordinate symbols (e.g. $p^t,p^r,p^\theta,p^\phi$)... students are less likely to see the superscripts as powers and are less likely to make mistakes." He notes this is "increasingly the common practice (see Hartle, for example)". — [Moore 2006, §3](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Moore also deliberately avoids teaching one-forms and dual spaces to undergraduates, treating tensors "as a collection of components that transform a certain way". Wald argues this component view obscures the basis-independent nature of tensors. The two experienced teachers disagree. — [Moore 2006, §3](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf); [Wald 2005](https://arxiv.org/abs/gr-qc/0511073)
- Moore lists "the distinction between covector and vector components" among the ideas students should first practise in 2D. — [Moore 2006, §2](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)

#### Mechanics
- Basis vectors $\vec e_1,\vec e_2$ need not be perpendicular or of unit length.
- Contravariant components: $\vec V=V^1\vec e_1+V^2\vec e_2=V^i\vec e_i$.
- Covariant components: $V_i\equiv\vec V\cdot\vec e_i$.
- Metric: $g_{ij}\equiv\vec e_i\cdot\vec e_j$.
- Substituting: $V_i=(V^j\vec e_j)\cdot\vec e_i=g_{ij}V^j$. This is lowering an index.
- Dual basis $\vec e^{\,i}$, defined by $\vec e^{\,i}\cdot\vec e_j=\delta^i_j$. Then $V^i=\vec V\cdot\vec e^{\,i}$.
- Length: $|\vec V|^2=V^iV_i=g_{ij}V^iV^j$.

#### Worked examples [all verified with sympy]

**Example 7.1 (oblique 60° basis)** [dimensionless]
- Basis: $\vec e_1=(1,0)$ and $\vec e_2=(\cos60^\circ,\sin60^\circ)=(0.5,\,0.8660)$.
- Take $\vec V=2\vec e_1+1\vec e_2$, so the **contravariant components are $(V^1,V^2)=(2,1)$**. In Cartesian coordinates $\vec V=(2+0.5,\;0+0.8660)=(2.5,\;0.8660)$.
- **Covariant components** by dot products:
  - $V_1=\vec V\cdot\vec e_1=2.5(1)+0.8660(0)=2.5$.
  - $V_2=\vec V\cdot\vec e_2=2.5(0.5)+0.8660(0.8660)=1.25+0.75=2.0$.
- So **$(V_1,V_2)=(2.5,\,2)$ while $(V^1,V^2)=(2,\,1)$**: visibly different.
- Metric: $g_{11}=1$, $g_{12}=g_{21}=\vec e_1\cdot\vec e_2=0.5$, $g_{22}=1$.
- Lowering with the metric:
  - $V_1=g_{11}V^1+g_{12}V^2=2+0.5=2.5$ ✓.
  - $V_2=g_{21}V^1+g_{22}V^2=1+1=2$ ✓.
- Length: $V^iV_i=2(2.5)+1(2)=7$, and in Cartesian $2.5^2+0.8660^2=6.25+0.75=7$ ✓.
- Dual basis:
  - $\vec e^{\,1}=(1,-1/\sqrt3)=(1,-0.5774)$ and $\vec e^{\,2}=(0,2/\sqrt3)=(0,1.1547)$.
  - Checks: $\vec e^{\,1}\cdot\vec e_2=0.5-0.5=0$ and $\vec e^{\,2}\cdot\vec e_2=1.1547\times0.8660=1$.
  - Then $V^1=\vec V\cdot\vec e^{\,1}=2.5-0.5=2$ ✓ and $V^2=\vec V\cdot\vec e^{\,2}=1$ ✓.
- Geometric picture: $V^i$ are the side lengths of the parallelogram built along the basis directions. $V_i$ are the perpendicular projections onto each basis direction, times $|\vec e_i|$.

**Example 7.2 (orthonormal basis: the two coincide)**
- With $\vec e_1=(1,0)$ and $\vec e_2=(0,1)$, the same $\vec V=(2.5,0.8660)$ has $V^i=V_i=(2.5,\,0.8660)$, because $g_{ij}=\delta_{ij}$.

**Example 7.3 (why "contra" and "co")**
- Double the oblique basis vectors, $\vec f_i=2\vec e_i$, keeping the same $\vec V$:
  - The contravariant components halve, $(1,\,0.5)$: they vary *contrary* to the basis.
  - The covariant components double, $(5,\,4)$: they vary *with* the basis.
- The length is unchanged: $1(5)+0.5(4)=7$ ✓.

**Example 7.4 (index versus exponent)**
- In $x^\mu=(ct,x,y,z)$, the symbol $x^2$ means the coordinate $y$.
- "The square of the $y$-coordinate" must be written $(x^2)^2$.
- $g_{\mu\nu}dx^\mu dx^\nu$ contains $(dx^2)^2=dy^2$ as one of its pieces.

#### Where it appears in GR
- $u^\mu$ versus $u_\mu$ (Topic 12).
- $\partial_\mu$ (lower).
- $g_{\mu\nu}$ versus $g^{\mu\nu}$.
- $T^{\mu\nu}$ versus $T_{\mu\nu}$ in the Einstein equation.
- In curved coordinates the metric is not $\delta_{ij}$, so the two kinds of components always differ. Carroll: "In a curved spacetime, where the form of the metric is generally more complicated, the difference is rather more dramatic." — [Carroll, after eq. 1.63](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- Treating upper/lower placement as cosmetic.
- Superscripts read as powers. — [Moore](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Two meanings of "covariant": lower-index components, and a "generally covariant" equation, i.e. one valid in all coordinates (Topic 11).

### Inferences
- Analogy for a non-specialist: contravariant components are walking directions ("2 blocks along Main St, then 1 block along Oak Ave", where the streets meet at 60°). Covariant components are the shadows the trip casts on each street under light shining perpendicular to that street.
- This oblique-basis picture is a standard pedagogical device, and the report can attribute the projection picture to the definitions $V^i=\vec V\cdot\vec e^{\,i}$ and $V_i=\vec V\cdot\vec e_i$ rather than to a particular book.
- Key takeaways:
  1. Two kinds of components exist because bases need not be orthonormal.
  2. The metric converts between them.
  3. They coincide only for orthonormal Euclidean bases.
  4. In Minkowski spacetime they differ by a sign in the time slot.
  5. A superscript is a label, not a power.

### Gaps
- I could not confirm from an accessible source the exact presentation in Fleisch's *A Student's Guide to Vectors and Tensors* (Cambridge, 2012). Search results confirm only that the book moves from vectors "through contra and covariant components to tensors". The parallel/perpendicular projection figure attributed to Fleisch in some teaching circles was **not** verified. The report should not cite Fleisch for that figure without checking.

---

## Topic 8: The metric tensor $g_{\mu\nu}$. How does it turn coordinate differences into distances and times, and what are its inverse and symmetries?

### Takeaway
$g_{\mu\nu}$ is a symmetric table of coefficients: $ds^2=g_{\mu\nu}dx^\mu dx^\nu$ converts tiny coordinate steps into physical length or time. Its form depends on the coordinates as well as on the geometry. Flat space can look complicated (polar coordinates), and only curvature, which is built from its derivatives, is coordinate-independent. In 4D it has 10 independent components. Its inverse $g^{\mu\nu}$ satisfies $g^{\mu\lambda}g_{\lambda\nu}=\delta^\mu_\nu$.

### Cited Findings
- Carroll: "There are few restrictions on the components of $g_{\mu\nu}$, other than that it be a symmetric (0, 2) tensor. It is usually taken to be non-degenerate, meaning that the determinant $g=|g_{\mu\nu}|$ doesn't vanish." The inverse is defined by $g^{\mu\nu}g_{\nu\sigma}=\delta^\mu_\sigma$ (eq. 2.28) and "the symmetry of $g_{\mu\nu}$ implies that $g^{\mu\nu}$ is also symmetric". — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)
- Carroll's list of what the metric does:
  1. "the metric supplies a notion of 'past' and 'future'";
  2. "allows the computation of path length and proper time";
  3. "determines the 'shortest distance' between two points (and therefore the motion of test particles)";
  4. "replaces the Newtonian gravitational field $\phi$";
  5. "provides a notion of locally inertial frames";
  6. "determines causality";
  7. "replaces the traditional Euclidean three-dimensional dot product".

  — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)
- Carroll on 3D spherical coordinates: "the components of the metric look different than those in Cartesian coordinates, but all of the properties of the space remain unaltered" (after eq. 2.32). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- The Kronecker delta $\delta^\mu_\nu$ (1 if $\mu=\nu$, else 0) "has exactly the same components in any coordinate system" and acts as "the identity map". — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Schwarzschild metric [G = c = 1]: $ds^2=-\left(1-\frac{2GM}{r}\right)dt^2+\left(1-\frac{2GM}{r}\right)^{-1}dr^2+r^2d\Omega^2$ (eq. 7.29). — [Carroll, §7](https://arxiv.org/abs/gr-qc/9712019)
- Moore and Hartle: Hartle's "physics first" textbook introduces "only the concept of the metric and summation notation before digging into applications", with metrics "asserted, not derived". — [Moore 2006](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)

#### Catalogue of metrics (components in matrix form, rows and columns ordered as the coordinates)
- Euclidean plane, Cartesian $(x,y)$: $g=\mathrm{diag}(1,1)$, so $ds^2=dx^2+dy^2$.
- Euclidean plane, polar $(r,\theta)$: $g=\mathrm{diag}(1,r^2)$, so $ds^2=dr^2+r^2d\theta^2$ (Carroll eq. 3.22).
- Sphere of radius $a$, coordinates $(\theta,\phi)$: $g=\mathrm{diag}(a^2,a^2\sin^2\theta)$ (Topic 1).
- Oblique 60° grid (Topic 7): $g=\begin{pmatrix}1&1/2\\1/2&1\end{pmatrix}$.
- Minkowski, coordinates $(ct,x,y,z)$: $\eta_{\mu\nu}=\mathrm{diag}(-1,1,1,1)$.
- Schwarzschild [SI, coordinates $(ct,r,\theta,\phi)$]: $g=\mathrm{diag}\!\left(-(1-r_s/r),\;(1-r_s/r)^{-1},\;r^2,\;r^2\sin^2\theta\right)$ with $r_s=2GM/c^2$.

#### Worked examples [verified]

**Example 8.1 (coordinate difference is not distance, polar)** [metres]
- $\Delta\theta=0.5$ rad along a circle:
  - at $r=2$ m: $r\Delta\theta=1$ m;
  - at $r=10$ m: $5$ m.
- The metric factor $g_{\theta\theta}=r^2$ supplies the conversion.

**Example 8.2 (component count)**
- A symmetric $n\times n$ array has $n(n+1)/2$ independent entries.
  - $n=2$: 3. $n=3$: 6. $n=4$: $4\cdot5/2=10$.
- This matches Carroll's "ten unknown functions of the metric components". — [Carroll, §4](https://arxiv.org/abs/gr-qc/9712019)

**Example 8.3 (inverse metrics)**
- Polar: $g^{\mu\nu}=\mathrm{diag}(1,1/r^2)$.
  - Check: $g^{\mu\lambda}g_{\lambda\nu}=\mathrm{diag}(1\cdot1,\;(1/r^2)(r^2))=\mathrm{diag}(1,1)=\delta^\mu_\nu$ ✓.
- Minkowski: $\eta^{\mu\nu}=\mathrm{diag}(-1,1,1,1)$. It has the same numbers as $\eta_{\mu\nu}$ because $(-1)^{-1}=-1$.
- Oblique (not diagonal), using the 2×2 inverse formula:
  1. $\det g=1\cdot1-\tfrac12\cdot\tfrac12=0.75$.
  2. $g^{ij}=\frac{1}{0.75}\begin{pmatrix}1&-1/2\\-1/2&1\end{pmatrix}=\begin{pmatrix}4/3&-2/3\\-2/3&4/3\end{pmatrix}$.
  3. Check row 1 × column 1: $\tfrac43(1)+(-\tfrac23)(\tfrac12)=\tfrac43-\tfrac13=1$.
  4. Check row 1 × column 2: $\tfrac43(\tfrac12)+(-\tfrac23)(1)=0$ ✓.
  - The inverse of a non-diagonal metric is **not** the entry-by-entry reciprocal.
- Trace of the Kronecker delta in 4D: $\delta^\mu_\mu=1+1+1+1=4$.

**Example 8.4 (Schwarzschild preview at Earth's surface)** [SI]
- Input: $GM_E=3.986004418\times10^{14}\ \mathrm{m^3s^{-2}}$. — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)
1. $r_s=2GM/c^2=2(3.986004418\times10^{14})/(8.987552\times10^{16})=8.870\times10^{-3}$ m $=8.870$ mm.
2. At $r=6.371\times10^6$ m: $r_s/r=1.3923\times10^{-9}$, so $g_{00}=-(1-1.3923\times10^{-9})$.
3. A static clock has $d\tau=\sqrt{1-r_s/r}\,dt=(1-6.961\times10^{-10})\,dt$. It loses $6.961\times10^{-10}\times86{,}400\ \mathrm{s}=60.1\ \mu$s per day relative to a clock far away.
- Consistency check: Ashby adopts $\Phi_0/c^2=6.969290134\times10^{-10}$ for the geoid. That value includes Earth's rotation and shape, so it is close to but not equal to the non-rotating spherical $GM/(Rc^2)=6.961\times10^{-10}$. — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)
- Newtonian-limit check: $-(1+2\Phi/c^2)$ with $\Phi=-GM/r$ gives $-(1-2GM/(rc^2))=-(1-r_s/r)$, the same as Schwarzschild's $g_{00}$ (Carroll eq. 4.21). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- Believing that a non-constant metric means curvature. Polar coordinates on a flat plane are the counter-example.
- Computing $g^{\mu\nu}$ by taking reciprocals of a non-diagonal $g_{\mu\nu}$.
- Mixing coordinate time $t$ with proper time $\tau$.
- Carroll sometimes uses $g$ for the determinant $|g_{\mu\nu}|$. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
- Key takeaways:
  1. $g_{\mu\nu}$ converts coordinate steps into physical intervals.
  2. It is symmetric, with 10 components in 4D.
  3. Its inverse raises indices and satisfies $g^{\mu\lambda}g_{\lambda\nu}=\delta^\mu_\nu$.
  4. Its appearance depends on the coordinates.
  5. In GR, $g_{\mu\nu}$ *is* the gravitational field, and $g_{00}$ carries the Newtonian potential.

### Gaps
- Determining which metrics are "really" curved requires the Riemann tensor (20 independent components in 4D, Carroll eq. 3.85). That is outside this section's scope and is left to the curvature notes.

---

## Topic 9: Raising and lowering indices with $g_{\mu\nu}$ and $g^{\mu\nu}$

### Takeaway
To lower an index, contract with the metric: $V_\mu=g_{\mu\nu}V^\nu$. To raise one, contract with the inverse metric: $\omega^\mu=g^{\mu\nu}\omega_\nu$. In Minkowski spacetime with $(-,+,+,+)$ this just flips the sign of the time component. In curvilinear coordinates it rescales components (e.g. by $r^2$).

### Cited Findings
- Carroll: "The metric and inverse metric can be used to raise and lower indices on tensors", e.g. $T^{\alpha\beta\mu}{}_\delta=\eta^{\mu\gamma}T^{\alpha\beta}{}_{\gamma\delta}$ (eq. 1.61). "Notice that raising and lowering does not change the position of an index relative to other indices." For vectors, $V_\mu=\eta_{\mu\nu}V^\nu$ and $\omega^\mu=\eta^{\mu\nu}\omega_\nu$ (eq. 1.62), and in Minkowski spacetime $\omega^\mu=(-\omega_0,\omega_1,\omega_2,\omega_3)$ (eq. 1.63). — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Schutz's chapter 3 has the sections "3.5 Metric as a mapping of vectors into one-forms" and "3.7 Index 'raising' and 'lowering'". — [Schutz, table of contents](https://assets.cambridge.org/97805218/87052/toc/9780521887052_toc.pdf)
- Bertschinger: "the metric is a mapping from the space of vectors to the space of one-forms". — [Bertschinger, §2](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)

#### Worked examples [verified]

**Example 9.1 (Minkowski)** [c = 1, metres]
- $V^\mu=(5,3,0,0)$:
  - $V_0=\eta_{00}V^0=(-1)(5)=-5$
  - $V_1=\eta_{11}V^1=3$
  - $V_2=V_3=0$
  - So $V_\mu=(-5,3,0,0)$.
- $V^\mu V_\mu=5(-5)+3(3)=-25+9=-16$. This is the interval of Example 4.1(a), as it should be.
- Under $(+,-,-,-)$: $V_\mu=(5,-3,0,0)$ and $V^\mu V_\mu=+16$.

**Example 9.2 (polar coordinates at $r=2$)** [metres; verified]
- $V^\mu=(V^r,V^\theta)=(3,\,0.5)$:
  - $V_r=g_{rr}V^r=3$
  - $V_\theta=g_{\theta\theta}V^\theta=r^2(0.5)=4(0.5)=2$
- Norm: $V^\mu V_\mu=3(3)+0.5(2)=9+1=10$, so $|V|=3.162$.
- Cross-check with physical (orthonormal) components: $V^{\hat r}=3$ and $V^{\hat\theta}=rV^\theta=1$, giving $9+1=10$ ✓.
- Raise back: $V^\theta=g^{\theta\theta}V_\theta=(1/4)(2)=0.5$ ✓.

**Example 9.3 (oblique basis, non-diagonal)**
- From Topic 7: lowering $(2,1)$ gives $(2.5,2)$, and raising with $g^{ij}=\begin{pmatrix}4/3&-2/3\\-2/3&4/3\end{pmatrix}$ returns:
  - $\tfrac43(2.5)-\tfrac23(2)=\tfrac{10}{3}-\tfrac43=2$
  - $-\tfrac23(2.5)+\tfrac43(2)=-\tfrac53+\tfrac83=1$ ✓

**Example 9.4 (a rank-2 tensor: dust at rest)** [SI]
- $T^{\mu\nu}=\mathrm{diag}(\rho c^2,0,0,0)$:
  - Mixed: $T^0{}_0=T^{00}\eta_{00}=-\rho c^2$.
  - Fully lowered: $T_{00}=\eta_{00}\eta_{00}T^{00}=+\rho c^2$.
- One index flip changes the sign; two flips restore it. (Dust tensor $T^{\mu\nu}=\rho U^\mu U^\nu$: Carroll eq. 1.106, [c = 1].) — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

#### Where it appears in GR
- The Christoffel formula raises with $g^{\sigma\rho}$ (eq. 3.21).
- The Ricci scalar $R=g^{\mu\nu}R_{\mu\nu}$.
- The Einstein tensor $G_{\mu\nu}=R_{\mu\nu}-\tfrac12Rg_{\mu\nu}$ (eq. 4.42).

— [Carroll](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- Using $g_{\mu\nu}$ instead of $g^{\mu\nu}$ to raise.
- Forgetting that in $(-,+,+,+)$ only the time component flips sign.
- Changing the left-right order of indices when raising. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
- Key takeaways:
  1. Lower with $g_{\mu\nu}$ and raise with $g^{\mu\nu}$.
  2. Raising then lowering is the identity because $g^{\mu\lambda}g_{\lambda\nu}=\delta^\mu_\nu$.
  3. In Minkowski spacetime, lowering flips the time component.
  4. In polar coordinates it multiplies the $\theta$ component by $r^2$.
  5. Norms are always $V^\mu V_\mu$.

### Gaps
- None material.

---

## Topic 10: Tensor products, rank and type $(k,l)$, contractions, traces, and symmetric and antisymmetric parts

### Takeaway
- A type-$(k,l)$ tensor has $k$ upper and $l$ lower indices and $n^{k+l}$ components in $n$ dimensions.
- The **tensor (outer) product** multiplies components with no sum, which raises the rank.
- **Contraction** sums one upper index against one lower index, which lowers the type by $(1,1)$. The trace $T^\mu{}_\mu$ is the simplest case.
- Any two-index tensor splits uniquely into symmetric and antisymmetric parts. Contractions of the Riemann tensor give the Ricci tensor and Ricci scalar in Einstein's equation.

### Cited Findings
- Carroll: "a tensor $T$ of type (or rank) $(k,l)$ is a multilinear map from a collection of dual vectors and vectors to $\mathbb R$". A scalar is $(0,0)$, a vector $(1,0)$, a dual vector $(0,1)$. — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Carroll on contraction: $S^{\mu\rho}{}_\sigma=T^{\mu\nu\rho}{}_{\sigma\nu}$ (eq. 1.59). "It is only permissible to contract an upper index with a lower index... Note also that the order of the indices matters" (eq. 1.60). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Carroll on symmetry: $S_{\mu\nu\rho}=S_{\nu\mu\rho}$ is symmetric in its first two indices (eq. 1.64). Antisymmetric means the sign changes under exchange (eq. 1.66). "The metric $\eta_{\mu\nu}$ and the inverse metric $\eta^{\mu\nu}$ are symmetric, while the Levi-Civita tensor and the electromagnetic field strength tensor $F_{\mu\nu}$ are antisymmetric." Also: "don't succumb to the temptation to think of the Kronecker delta $\delta^\alpha_\beta$ as symmetric". — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Carroll gives the Kronecker delta as type (1,1), identical components in any coordinate system, and "the identity map from vectors to vectors". — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Wald: one "can define a tensor of type $(k,l)$ on an n-dimensional manifold to be a collection of $n^{k+l}$ numbers associated with a coordinate system that transform via the tensor transformation law". — [Wald 2005](https://arxiv.org/abs/gr-qc/0511073)
- Perfect fluid stress-energy [c = 1]: $T^{\mu\nu}=(\rho+p)U^\mu U^\nu+p\eta^{\mu\nu}$ (eq. 1.110). Dust: $T^{\mu\nu}=\rho U^\mu U^\nu$ (eq. 1.106). — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Curvature contractions:
  - Ricci tensor $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ (eq. 3.90), symmetric (eq. 3.91).
  - Einstein tensor $G_{\mu\nu}=R_{\mu\nu}-\tfrac12Rg_{\mu\nu}$ (eq. 4.42).
  - Tracing Einstein's equation gives $R=-\kappa T$ (eq. 4.44, $\kappa=8\pi G$, [c = 1]), so $R_{\mu\nu}=\kappa(T_{\mu\nu}-\tfrac12Tg_{\mu\nu})$ (eq. 4.45).
  - The Riemann tensor has $n^2(n^2-1)/12$ independent components, i.e. 20 in 4D (eq. 3.85).

  — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

#### Worked examples [verified with sympy]

**Example 10.1 (outer product of two 2D vectors)**
- $A^i=(1,2)$ and $B^j=(3,-1)$, so $T^{ij}=A^iB^j$:
  - $T^{11}=1(3)=3$ and $T^{12}=1(-1)=-1$
  - $T^{21}=2(3)=6$ and $T^{22}=2(-1)=-2$
  - $T=\begin{pmatrix}3&-1\\6&-2\end{pmatrix}$
- Not symmetric: $T^{12}=-1\neq T^{21}=6$.
- Order matters: $B^iA^j$ is the transpose, $\begin{pmatrix}3&6\\-1&-2\end{pmatrix}$.
- Symmetric part: $S^{ij}=\tfrac12(T^{ij}+T^{ji})=\begin{pmatrix}3&2.5\\2.5&-2\end{pmatrix}$.
- Antisymmetric part: $A^{ij}=\tfrac12(T^{ij}-T^{ji})=\begin{pmatrix}0&-3.5\\3.5&0\end{pmatrix}$.
- Check: $S+A=T$ ✓.
- Index notation: $T^{(ij)}$ and $T^{[ij]}$.

**Example 10.2 (mixed tensor and contraction / trace)**
- $A^i=(1,2)$ and $\omega_j=(4,1)$, so $M^i{}_j=A^i\omega_j=\begin{pmatrix}4&1\\8&2\end{pmatrix}$.
- Contraction: $M^i{}_i=M^1{}_1+M^2{}_2=4+2=6$.
- This equals $A^i\omega_i=1(4)+2(1)=6$ ✓: contracting an outer product gives the scalar pairing.

**Example 10.3 (symmetric × antisymmetric = 0)**
- Using the $S$ and $A$ of Example 10.1 (indices lowered with the identity metric):
  - $S_{ij}A^{ij}=3(0)+2.5(-3.5)+2.5(3.5)+(-2)(0)=0$ ✓.

**Example 10.4 (counting in 4D)**
- A general $(0,2)$ tensor has 16 components: 10 symmetric plus 6 antisymmetric.
- The antisymmetric $F_{\mu\nu}$ has 6 = 3 electric + 3 magnetic components.
- Riemann, type (1,3): $4^4=256$ components, of which 20 are independent. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

**Example 10.5 (GR-relevant trace: perfect fluid)** [SI; $\rho$ is mass density; verified with sympy]
- $T^{\mu\nu}=(\rho+p/c^2)u^\mu u^\nu+p\,\eta^{\mu\nu}$.
- Trace:
  1. $T^\mu{}_\mu=\eta_{\mu\nu}T^{\mu\nu}=(\rho+p/c^2)\,u_\mu u^\mu+p\,\delta^\mu_\mu$.
  2. Substitute $u_\mu u^\mu=-c^2$ and $\delta^\mu_\mu=4$: $(\rho+p/c^2)(-c^2)+4p$.
  3. Simplify: $-\rho c^2-p+4p=-\rho c^2+3p$.
- Dust ($p=0$): $-\rho c^2$.
- Radiation ($p=\rho c^2/3$): $0$.

#### Where it appears in GR
- Einstein's equations are built entirely from contractions and symmetric combinations of tensors (eqs. 3.90, 4.42, 4.44, 4.45). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- $\delta^\mu_\mu=4$, not 1. — [Moore 2006](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Contracting two upper indices.
- Ignoring index order.
- Assuming the matrix picture works beyond rank 2.
- Thinking a tensor is "any array". Wald stresses the transformation law; see Topic 11.

### Inferences
- Key takeaways:
  1. The type $(k,l)$ counts upper and lower indices.
  2. The outer product raises rank; contraction lowers it by one upper and one lower index.
  3. The trace is the full contraction of a (1,1) tensor.
  4. Symmetric and antisymmetric parts are independent.
  5. The Ricci tensor, Ricci scalar and $T=T^\mu{}_\mu$ are all contractions.

### Gaps
- None material.

---

## Topic 11: Coordinate transformations of tensors and general covariance

### Takeaway
Rules:
- Upper-index components transform with $\partial x'/\partial x$.
- Lower-index components transform with the inverse Jacobian $\partial x/\partial x'$.
- Each index of a tensor gets one such factor.

Because the transformation is linear and homogeneous, a tensor that vanishes in one coordinate system vanishes in all. So "tensor equation true in one system implies true in all". This is the mathematical core of general covariance.

### Cited Findings
- Carroll's general-coordinate laws:
  - basis one-forms $dx^{\mu'}=\frac{\partial x^{\mu'}}{\partial x^\mu}dx^\mu$ (eq. 2.16);
  - one-form components $\omega_{\mu'}=\frac{\partial x^\mu}{\partial x^{\mu'}}\omega_\mu$ (eq. 2.17);
  - a general $(k,l)$ tensor gets one $\partial x^{\mu'}/\partial x^\mu$ per upper index and one $\partial x^\nu/\partial x^{\nu'}$ per lower index (eq. 2.19).
  - He adds that "it is often easier to transform a tensor by taking the identity of basis vectors and one-forms as partial derivatives and gradients at face value, and simply substituting in the coordinate transformation". His example (eqs. 2.20–2.25): $S=x\,(dx)^2+(dy)^2$ under $x'=x^{1/3}$, $y'=e^{x+y}$ becomes $S_{\mu'\nu'}=\begin{pmatrix}9(x')^4[1+(x')^3]&-3(x')^2/y'\\-3(x')^2/y'&1/(y')^2\end{pmatrix}$.

  — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)
- Carroll: the partial derivative of a one-form, $\partial_\mu W_\nu$, is not a tensor because of an extra term containing second derivatives of the coordinate change (eq. 2.26). — [Carroll, §2](https://arxiv.org/abs/gr-qc/9712019)
- Bertschinger: "the laws of physics must be expressed in a form that is valid independently of any coordinate system used to label points in spacetime". — [Bertschinger, §1](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)
- Wald: many GR treatments define tensors via the transformation law. This "has the advantage that one can then quickly move on". Its drawback is that it effectively "forces one to think of a tensor as a collection of components rather than an object with legitimate status in its own right". — [Wald 2005, §3](https://arxiv.org/abs/gr-qc/0511073)
- Moore's syllabus places "Arbitrary Coordinates" and "Tensor Equations" in week 2 and stresses "the benefit of writing equations in covariant form". — [Moore 2006, §1](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)

#### Mechanics (2D, primed = new coordinates)
- Vector: $V'^\mu=\frac{\partial x'^\mu}{\partial x^\nu}V^\nu$.
- Covector: $\omega'_\mu=\frac{\partial x^\nu}{\partial x'^\mu}\omega_\nu$.
- Metric: $g'_{\mu\nu}=\frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial x^\beta}{\partial x'^\nu}g_{\alpha\beta}$. In matrix form, $g'=J^TgJ$ with $J^\alpha{}_\mu=\partial x^\alpha/\partial x'^\mu$.
- Mnemonic: the primed coordinate sits wherever the index on the left-hand side sits. An upper index puts $x'$ upstairs in the derivative; a lower index puts $x'$ downstairs.

#### Worked examples [verified with sympy]

**Example 11.1 (Euclidean metric, Cartesian to polar)**
- Coordinates: $x=r\cos\theta$ and $y=r\sin\theta$. Old metric $g=\mathrm{diag}(1,1)$.
- Jacobian entries:
  - $\partial x/\partial r=\cos\theta$
  - $\partial x/\partial\theta=-r\sin\theta$
  - $\partial y/\partial r=\sin\theta$
  - $\partial y/\partial\theta=r\cos\theta$
- New metric components:
  - $g'_{rr}=(\partial x/\partial r)^2+(\partial y/\partial r)^2=\cos^2\theta+\sin^2\theta=1$
  - $g'_{r\theta}=\frac{\partial x}{\partial r}\frac{\partial x}{\partial\theta}+\frac{\partial y}{\partial r}\frac{\partial y}{\partial\theta}=\cos\theta(-r\sin\theta)+\sin\theta(r\cos\theta)=0$
  - $g'_{\theta\theta}=(\partial x/\partial\theta)^2+(\partial y/\partial\theta)^2=r^2\sin^2\theta+r^2\cos^2\theta=r^2$
- Result: $g'=\mathrm{diag}(1,r^2)$, i.e. $ds^2=dr^2+r^2d\theta^2$. This matches Example 1.1, obtained there by substituting differentials.

**Example 11.2 (a vector at the point $(x,y)=(1,1)$)**
- At this point $r=\sqrt2$ and $\theta=\pi/4$.
- Take $V=\hat x$, so $(V^x,V^y)=(1,0)$.
- Inverse Jacobian entries:
  - $\partial r/\partial x=x/r=1/\sqrt2$ and $\partial r/\partial y=1/\sqrt2$
  - $\partial\theta/\partial x=-y/r^2=-1/2$ and $\partial\theta/\partial y=x/r^2=1/2$
- New components:
  - $V^r=\tfrac{1}{\sqrt2}(1)+\tfrac{1}{\sqrt2}(0)=0.7071$
  - $V^\theta=-\tfrac12(1)+\tfrac12(0)=-0.5$
- Length check: $g_{rr}(V^r)^2+g_{\theta\theta}(V^\theta)^2=0.5+(\sqrt2)^2(0.25)=0.5+0.5=1$ ✓. The length is unchanged.

**Example 11.3 (a covector at the same point; invariance of the contraction)**
- $\omega=\nabla x$, so $(\omega_x,\omega_y)=(1,0)$.
- New components:
  - $\omega_r=\frac{\partial x}{\partial r}(1)=\cos45^\circ=0.7071$
  - $\omega_\theta=\frac{\partial x}{\partial\theta}(1)=-r\sin\theta=-\sqrt2(0.7071)=-1$
- Contraction:
  - Cartesian: $\omega_\mu V^\mu=1(1)+0(0)=1$.
  - Polar: $0.7071(0.7071)+(-1)(-0.5)=0.5+0.5=1$ ✓.
- The two Jacobians are inverse matrices (sympy: $\frac{\partial(r,\theta)}{\partial(x,y)}\cdot\frac{\partial(x,y)}{\partial(r,\theta)}=I$), so an upper index contracted with a lower index is coordinate-independent.

**Example 11.4 (Carroll's example re-checked)**
- Applying $J^TSJ$ with $x=(x')^3$ and $y=\ln y'-(x')^3$ reproduces Carroll's eq. 2.25 exactly in sympy.

#### Why "true in one system, true in all"
1. Suppose $A_{\mu\nu}=B_{\mu\nu}$ holds in coordinates $x$.
2. Define $C_{\mu\nu}=A_{\mu\nu}-B_{\mu\nu}$. Every component of $C$ is 0.
3. In any other system, $C'_{\mu\nu}=\frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial x^\beta}{\partial x'^\nu}C_{\alpha\beta}=0$, because each term is multiplied by zero.
4. So $A'_{\mu\nu}=B'_{\mu\nu}$.
- This only works if both sides are tensors. It fails for objects like $\partial_\mu W_\nu$ (Carroll eq. 2.26), which is why GR introduces the covariant derivative. Einstein's equation $G_{\mu\nu}=\frac{8\pi G}{c^4}T_{\mu\nu}$ is a tensor equation of exactly this kind.

#### Common beginner confusions
- Using the wrong Jacobian, $\partial x/\partial x'$ versus $\partial x'/\partial x$.
- Evaluating the Jacobian at a different point from the tensor.
- Believing the object changes when only its components change.
- Treating the Lorentz transformation as separate rather than as the special case with constant $\partial x'^\mu/\partial x^\nu=\Lambda^\mu{}_\nu$.

### Inferences
- Key takeaways:
  1. One Jacobian factor per index.
  2. Upper indices use $\partial x'/\partial x$; lower indices use $\partial x/\partial x'$.
  3. Upper–lower contractions are invariant.
  4. Zero tensors stay zero, which gives general covariance.
  5. Partial derivatives of tensors break the rule, which motivates Christoffel symbols.

### Gaps
- The deeper debate about what "general covariance" physically means (versus coordinate invariance; Kretschmann's objection) was not researched here. The report should present only the mathematical statement above.

---

## Topic 12: Proper time, four-velocity, four-momentum and four-acceleration (with twin-paradox, muon, GPS and 1 g rocket numbers)

### Takeaway
**Proper time** $\tau$ is the time a clock actually ticks along its own worldline. It is $d\tau^2=-ds^2/c^2$, so $\tau=\int\sqrt{1-v^2/c^2}\,dt$. Differentiating position with respect to $\tau$ gives:
- the **four-velocity** $u^\mu=\gamma(c,\vec v)$, whose squared length is always $-c^2$;
- the **four-momentum** $p^\mu=mu^\mu=(E/c,\vec p)$ with $p_\mu p^\mu=-m^2c^2$;
- the **four-acceleration** $a^\mu=du^\mu/d\tau$, which is always perpendicular to $u^\mu$ ($u_\mu a^\mu=0$) and has magnitude equal to the acceleration an onboard accelerometer reads.

### Cited Findings
- Carroll [c = 1]:
  - proper time $\Delta\tau=\int\sqrt{-\eta_{\mu\nu}\frac{dx^\mu}{d\lambda}\frac{dx^\nu}{d\lambda}}\,d\lambda$ (eq. 1.97), which "will be positive";
  - "τ actually measures the time elapsed on a physical clock carried along the path. This point of view makes the 'twin paradox' and similar puzzles very clear";
  - four-velocity $U^\mu=dx^\mu/d\tau$ (eq. 1.98) with $\eta_{\mu\nu}U^\mu U^\nu=-1$ (eq. 1.99); "In the rest frame of a particle, its four-velocity has components $U^\mu=(1,0,0,0)$";
  - $p^\mu=mU^\mu$ (eq. 1.100), where $m$ is "a fixed quantity independent of inertial frame"; "It turns out to be much more convenient to take this as the mass once and for all, rather than thinking of mass as depending on velocity";
  - for motion along $x$, $p^\mu=(\gamma m,v\gamma m,0,0)$ (eq. 1.101); for small $v$, $p^0=m+\tfrac12mv^2$;
  - force four-vector $f^\mu=m\,d^2x^\mu/d\tau^2$ (eq. 1.102); "In relativity, however, gravity is not described by a force, but rather by the curvature of spacetime itself."

  — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Taylor & Wheeler: "The time read on a wristwatch carried between two events — the interval between those events — is independent of all laboratory and rocket reference frames." — [Taylor & Wheeler, ch. 1](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf)
- Schutz includes "1.13 Appendix: The twin 'paradox' dissected", "2.3 The four-velocity" and "2.4 The four-momentum". — [Schutz, table of contents](https://assets.cambridge.org/97805218/87052/toc/9780521887052_toc.pdf)
- Moore lists "They don't understand why $d(p_\mu p^\mu)/d\tau=2p_\mu(dp^\mu/d\tau)$" as a standard student error. — [Moore 2006, §4](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Constants:
  - $c=299{,}792{,}458$ m/s exactly. — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/); [Taylor & Wheeler](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf)
  - $g_n=9.80665\ \mathrm{m\,s^{-2}}$, exact. — [NIST CODATA, standard acceleration of gravity](https://physics.nist.gov/cgi-bin/cuu/Value?gn)
  - Muon mean life $\tau_\mu=(2.1969811\pm0.0000022)\times10^{-6}$ s. — [PDG Live, μ mean life](https://pdglive.lbl.gov/view/S004T)
- GPS inputs and checks, Ashby (2003):
  - $GM_E=3.986004418\times10^{14}\ \mathrm{m^3s^{-2}}$;
  - $\Phi_0/c^2=6.969290134\times10^{-10}$ on the geoid;
  - WGS-84 semimajor axis of the GPS orbit $a=2.656175\times10^7$ m;
  - the satellite-clock relativistic effects "cancel at $a\approx9545$ km".

  — [Ashby, *Living Rev. Relativ.* 6:1 (2003), doi:10.12942/lrr-2003-1](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)
- Ashby (2002):
  - satellites orbit "about 20 000 km above Earth's surface" with speeds "about 4 km/s" and periods of 11 h 58 min;
  - the gravitational shift makes satellite clocks run fast by "about $5\times10^{-10}$";
  - time dilation slows them by $v^2/2c^2$;
  - the net correction is 4.4645 parts in $10^{10}$, and an early on-orbit measurement gave 4.425 parts in $10^{10}$, "agreeing with the calculation to better than 1%".

  — [Ashby, "Relativity and the Global Positioning System", *Physics Today* 55(5), 41 (2002)](https://physicstoday.aip.org/features/relativity-and-the-global-positioning-system)

#### Mechanics [SI, $(-,+,+,+)$]
1. Proper time from the interval: $d\tau^2=-ds^2/c^2=dt^2-\frac{dx^2+dy^2+dz^2}{c^2}=dt^2\left(1-\frac{v^2}{c^2}\right)$, so $d\tau=\frac{dt}{\gamma}$ and $\tau=\int\sqrt{1-v(t)^2/c^2}\,dt$.
2. Four-velocity: $u^\mu=\frac{dx^\mu}{d\tau}=\frac{dt}{d\tau}\frac{dx^\mu}{dt}=\gamma\,(c,\;v_x,\;v_y,\;v_z)$.
   - Norm: $u_\mu u^\mu=-\gamma^2c^2+\gamma^2v^2=-\gamma^2c^2(1-v^2/c^2)=-c^2$.
3. Four-momentum: $p^\mu=mu^\mu=(\gamma mc,\;\gamma m\vec v)\equiv(E/c,\;\vec p)$, with $E=\gamma mc^2$.
   - Norm: $p_\mu p^\mu=m^2u_\mu u^\mu=-m^2c^2$, i.e. $E^2=(pc)^2+(mc^2)^2$.
4. Four-acceleration: $a^\mu=du^\mu/d\tau$.
   - Differentiate the constant $u_\mu u^\mu=-c^2$: $\frac{d}{d\tau}(\eta_{\mu\nu}u^\mu u^\nu)=\eta_{\mu\nu}a^\mu u^\nu+\eta_{\mu\nu}u^\mu a^\nu=2\eta_{\mu\nu}u^\mu a^\nu=2u_\mu a^\mu=0$. The middle step uses $\eta_{\mu\nu}=\eta_{\nu\mu}$ and a renaming of dummy indices. This is the step Moore says students do not understand.
   - In the momentary rest frame $u^\mu=(c,0,0,0)$, so $u_\mu a^\mu=-c\,a^0=0$, giving $a^0=0$ and $a^\mu=(0,\vec\alpha)$, where $\vec\alpha$ is what an accelerometer reads.
   - Hence $a_\mu a^\mu=|\vec\alpha|^2$, the proper acceleration squared, in every frame.
5. Hyperbolic motion (constant proper acceleration $\alpha$ along $x$, starting from rest at the origin):
   $$ct(\tau)=\frac{c^2}{\alpha}\sinh\frac{\alpha\tau}{c},\qquad x(\tau)=\frac{c^2}{\alpha}\left[\cosh\frac{\alpha\tau}{c}-1\right]$$
   $$u^\mu=\left(c\cosh\frac{\alpha\tau}{c},\;c\sinh\frac{\alpha\tau}{c}\right),\qquad a^\mu=\left(\alpha\sinh\frac{\alpha\tau}{c},\;\alpha\cosh\frac{\alpha\tau}{c}\right)$$
   - sympy confirms $u_\mu u^\mu=-c^2$, $u_\mu a^\mu=0$ and $a_\mu a^\mu=\alpha^2$ exactly.
   - The worldline is the hyperbola $(x+c^2/\alpha)^2-(ct)^2=(c^2/\alpha)^2$.
   - The rapidity $\alpha\tau/c$ grows linearly in proper time, so $v=c\tanh(\alpha\tau/c)$ and $\gamma=\cosh(\alpha\tau/c)$.
   - These formulas are derived here from Carroll's definitions (eqs. 1.97–1.99) and his rapidity form of the boost (eq. 1.18). I did not take them from a fetched source; they were verified symbolically.

#### Worked examples [all verified in Python]

**Example 12.1 (twin paradox, 2D, 3-4-5 numbers)** [units: years and light-years, so $c=1$ ly/yr]
- Setup: a star 4.0 ly from Earth in Earth's frame; the traveller goes at $v=0.8c$ and turns around instantly (idealisation: the turnaround acceleration is neglected).
- $\gamma$:
  1. $1-0.8^2=1-0.64=0.36$.
  2. $\sqrt{0.36}=0.6$.
  3. $\gamma=1/0.6=1.6667$.
- Earth time: each leg takes $4.0/0.8=5.0$ yr, so 10.0 yr in total.
- Traveller's time: $10.0\times0.6=6.0$ yr.
- Interval check, outbound leg: $\Delta(ct)=5$ ly and $\Delta x=4$ ly, so $c\Delta\tau=\sqrt{25-16}=\sqrt9=3$ ly, i.e. 3 yr per leg and 6 yr in total ✓.
- The stay-at-home twin's straight worldline has the **longest** proper time: 10 yr versus 6 yr.

**Example 12.2 (atmospheric muon)** [SI; the 10.0 km altitude and $v=0.995c$ are illustrative choices, not measured values]
- Lifetime $\tau_0=2.1969811\ \mu$s. — [PDG](https://pdglive.lbl.gov/view/S004T)
1. $\gamma=1/\sqrt{1-0.995^2}=1/\sqrt{0.009975}=1/0.099875=10.0125$.
2. Earth-frame travel time: $t=10{,}000\ \mathrm m/(0.995\times299{,}792{,}458\ \mathrm{m/s})=33.524\ \mu$s.
3. Proper time: $\tau=t/\gamma=33.524/10.0125=3.3482\ \mu$s.
4. Survival fraction: $e^{-\tau/\tau_0}=e^{-3.3482/2.19698}=e^{-1.5240}=0.2178$, about 21.8%.
5. Without time dilation: $e^{-33.524/2.19698}=e^{-15.259}=2.36\times10^{-7}$.
- Same answer in the muon's frame: the 10.0 km of atmosphere contracts to $10{,}000/10.0125=998.7$ m, crossed in $998.7/(0.995c)=3.348\ \mu$s ✓.
- Mean decay lengths: without dilation $\beta c\tau_0=655.3$ m; with dilation $\gamma\beta c\tau_0=6561.7$ m.

**Example 12.3 (GPS clock budget)** [SI; weak-field formula $d\tau/dt\approx1+\Phi/c^2-v^2/2c^2$, a GR preview; inputs from Ashby 2003]
1. Orbital speed (circular): $v=\sqrt{GM/a}=\sqrt{3.986004418\times10^{14}/2.656175\times10^7}=\sqrt{1.500656\times10^7}=3873.8$ m/s. This matches Ashby's "about 4 km/s".
2. Velocity (SR) term: $v^2/(2c^2)=1.500656\times10^7/(2\times8.987552\times10^{16})=8.3485\times10^{-11}$. Times 86,400 s/day gives **7.21 μs/day slow**.
3. Satellite potential term: $GM/(ac^2)=3.986004418\times10^{14}/(2.656175\times10^7\times8.987552\times10^{16})=1.66970\times10^{-10}$.
4. Gravitational (GR) term relative to the ground: $\Phi_0/c^2-GM/(ac^2)=6.969290\times10^{-10}-1.669705\times10^{-10}=5.29959\times10^{-10}$. That is **45.79 μs/day fast**.
5. Net: $5.29959\times10^{-10}-0.83485\times10^{-10}=4.46473\times10^{-10}$, i.e. **38.58 μs/day fast**.
   - Equivalently, $\Phi_0/c^2-\tfrac32GM/(ac^2)$, since $v^2=GM/a$.
   - Ashby (2002) quotes 4.4645 parts in $10^{10}$, which agrees to 4 significant figures (the difference comes from constants and rounding).
6. Factory offset: $10.23\ \mathrm{MHz}\times(1-4.46473\times10^{-10})=10.22999999543$ MHz.
7. Range error if uncorrected: $38.58\ \mu\mathrm s\times c=11.56$ km per day.
8. Crossover radius where the two effects cancel: $\Phi_0/c^2=\tfrac32GM/(ac^2)$ gives $a=1.5\,GM/(c^2\Phi_0/c^2)=9.5455\times10^6$ m, matching Ashby's "$a\approx9545$ km".

**Example 12.4 (four-velocity and four-momentum at $0.6c$)** [SI]
- Four-velocity:
  - $\gamma=1.25$, so $u^\mu=(1.25c,\,0.75c,\,0,\,0)$.
  - $u_\mu=(-1.25c,\,0.75c,\,0,\,0)$.
  - $u_\mu u^\mu=(-1.5625+0.5625)c^2=-1.0000\,c^2$ ✓.
- Four-momentum for a spacecraft with $m=1000$ kg:
  - $E=\gamma mc^2=1.25\times1000\times8.987552\times10^{16}=1.12344\times10^{20}$ J.
  - Rest energy $mc^2=8.98755\times10^{19}$ J.
  - Kinetic energy $E-mc^2=2.24689\times10^{19}$ J. Newton's $\tfrac12mv^2$ would give $1.61776\times10^{19}$ J, 28% low.
  - $|\vec p|=\gamma mv=1.25\times1000\times0.6\times299{,}792{,}458=2.24844\times10^{11}$ kg m/s.
- Norm check:
  1. $E/c=3.747406\times10^{11}$.
  2. $-(E/c)^2+p^2=-1.404305\times10^{23}+5.05550\times10^{22}=-8.98755\times10^{22}$.
  3. Compare $-m^2c^2=-(1000\times299{,}792{,}458)^2=-8.98755\times10^{22}$ ✓.

**Example 12.5 (rocket at 1 g for 1 year of ship time)** [SI; 1 yr = 365.25 d = 31,557,600 s; 1 ly = $c\times$1 yr $=9.46073\times10^{15}$ m]
- $\alpha=g_n=9.80665\ \mathrm{m\,s^{-2}}$. — [NIST](https://physics.nist.gov/cgi-bin/cuu/Value?gn)
1. $c/\alpha=299{,}792{,}458/9.80665=3.05703\times10^7$ s $=0.96872$ yr.
2. $c^2/\alpha=9.16475\times10^{15}$ m $=0.96872$ ly.
3. Rapidity after $\tau=1$ yr: $\alpha\tau/c=31{,}557{,}600/3.05703\times10^7=1.03230$.
4. Speed: $v/c=\tanh(1.03230)=0.77483$.
5. $\gamma=\cosh(1.03230)=1.58185$, and $\sinh(1.03230)=1.22566$.
6. Earth-frame time: $t=(c/\alpha)\sinh=0.96872\times1.22566=1.18731$ yr.
7. Distance: $x=(c^2/\alpha)(\cosh-1)=0.96872\times0.58185=0.56364$ ly.
8. Newtonian comparison: $v=g\tau$ would give $1.0323c$, which is impossible. Relativity gives $0.7748c$.
9. Coordinate acceleration seen from Earth at that moment: $dv/dt=\alpha/\gamma^3=9.80665/3.958=2.478\ \mathrm{m/s^2}$. The crew still feels 1 g.
- Checks: $u_\mu u^\mu=-c^2$, $u_\mu a^\mu=0$, $a_\mu a^\mu=\alpha^2$ (sympy). The hyperbola identity holds numerically to a relative error of $2\times10^{-16}$.
- Extensions (same formulas):

  | Ship time | Earth time | Distance | Speed |
  |---|---|---|---|
  | 2 yr | 3.756 yr | 2.910 ly | 0.9683c |
  | 10 yr | 14,736 yr | 14,735 ly | 1 − 2.2×10⁻⁹ in units of c |

#### Where it appears in GR
- Free fall is "zero four-acceleration" generalised: the geodesic equation $\frac{d^2x^\mu}{d\tau^2}+\Gamma^\mu{}_{\rho\sigma}\frac{dx^\rho}{d\tau}\frac{dx^\sigma}{d\tau}=0$ (eq. 3.47).
- The normalisation becomes $g_{\mu\nu}u^\mu u^\nu=-c^2$.
- The dust stress tensor is $\rho u^\mu u^\nu$ (eq. 1.106).
- Gravitational time dilation (Example 8.4, GPS) is proper time computed with $g_{\mu\nu}$ instead of $\eta_{\mu\nu}$.

— [Carroll](https://arxiv.org/abs/gr-qc/9712019)

#### Common beginner confusions
- Proper time versus coordinate time.
- "Each twin sees the other's clock slow, so who is younger?" The answer: the worldlines are not symmetric, because only one is straight. — [Carroll, §1](https://arxiv.org/abs/gr-qc/9712019)
- Thinking an object at rest has zero four-velocity. Its $u^\mu=(c,0,0,0)$ still has length $c$.
- "Relativistic mass": Carroll recommends a single invariant $m$. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- The product-rule step in $d(p_\mu p^\mu)/d\tau$. — [Moore 2006](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Assuming constant proper acceleration means constant $dv/dt$.

### Inferences
- The twin paradox is best taught as the spacetime version of the triangle inequality with the inequality reversed. The two-legged path is "shorter" in proper time (6 yr versus 10 yr) because of the minus sign in the interval.
- The GPS example is the best bridge from SR to GR in the whole section. One clock budget contains an SR term (−7.2 μs/day) and a GR term (+45.8 μs/day) of opposite sign, with a net effect large enough (11.6 km/day of ranging error) to matter to anyone with a phone.
- Key takeaways:
  1. $\tau$ is what clocks measure, and the straight worldline maximises it.
  2. $u^\mu=\gamma(c,\vec v)$ always has $u_\mu u^\mu=-c^2$.
  3. $p^\mu=(E/c,\vec p)$ with $p_\mu p^\mu=-m^2c^2$, which gives $E=\gamma mc^2$.
  4. $a^\mu\perp u^\mu$, and $|a|$ is the proper acceleration.
  5. Constant proper acceleration gives hyperbolic motion with rapidity linear in $\tau$.

### Gaps
- No primary source for the hyperbolic-motion formulas was fetched; they are derived and symbolically verified here.
- The muon example uses illustrative values ($v=0.995c$, 10 km). I did not fetch historical measurements (e.g. Rossi–Hall, Frisch–Smith) and they should not be quoted without checking.
- Ashby's per-day split (≈45.7 / 7.1 / 38.6 μs per day, as commonly quoted) was found only on secondary blogs in the search results. The figures above (45.79 / 7.21 / 38.58 μs per day) are the researcher's computation from Ashby's constants. The per-day values in Ashby's own Living Reviews article sit in equation images that were not readable.

---

## Key question B: How do reputable textbooks introduce these concepts to beginners, and which analogies work?

### Takeaway
Two families exist:
- **math-first**: Carroll, Schutz (and Wald, more abstractly), which build vectors, dual vectors and tensors in flat spacetime before curvature;
- **physics-first**: Hartle, which introduces only the metric and summation notation, then goes straight to applications with asserted metrics.

Moore proposes a third way: interleave the math with the physics, drill the notation, and practise every concept on 2D surfaces first. The analogies with documented use by authors are the surveyors (interval invariance), rotations versus boosts, the wristwatch (proper time), the latitude/longitude sphere (metric), and stacks of surfaces (one-forms).

### Cited Findings
- **Carroll** (graduate-level notes): starts from the interval and $\eta_{\mu\nu}$, derives Lorentz transformations as the interval-preserving matrices, then builds vectors, dual vectors (gradient as the first example), tensors as multilinear maps, raising/lowering, and proper time and four-velocity. All of this happens in flat spacetime (chapter 1) before manifolds (chapter 2). — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- **Schutz** (undergraduate):
  - ch. 1 SR with "New units", spacetime diagrams, "Invariance of the interval", "Invariant hyperbolae", Lorentz transformation, twin-paradox appendix;
  - ch. 2 "Vector analysis in special relativity" (four-velocity, four-momentum, scalar product);
  - ch. 3 "Tensor analysis in special relativity" (metric tensor, one-forms, (0,2) tensors, "Metric as a mapping of vectors into one-forms", index raising/lowering);
  - ch. 4 includes "One-forms and surfaces".

  — [Schutz 2nd ed., TOC](https://assets.cambridge.org/97805218/87052/toc/9780521887052_toc.pdf)
- **Hartle**: per Moore, Hartle's text and Cheng's "seek to 'put the physics first', introducing only the concept of the metric and summation notation before digging into applications. The metrics needed for those applications are asserted, not derived". Hartle also uses coordinate-name indices ($p^t,p^r$). — [Moore 2006](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- **Moore**:
  - critiques both approaches: math-first's "long mathematical preamble can be deadly", while physics-first leaves students "rudderless in the sea of applications";
  - proposes seven principles, including "Use two-dimensional visualizations", "Keep the math (appropriately) simple" and "Drill students on tensor notation";
  - gives a 13-week syllabus with index notation, arbitrary coordinates and tensor equations in week 2.

  — [Moore 2006](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- **Taylor & Wheeler**: the Parable of the Surveyors; "c" as a conversion factor; events as steel stakes; wristwatch time equals the interval. Their sign convention is (time)² − (space)². — [Taylor & Wheeler ch. 1](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf); the book is freely available under a Creative Commons licence per the author's site, [eftaylor.com/spacetimephysics](https://www.eftaylor.com/spacetimephysics/)
- **MIT 8.962 (Bertschinger)**:
  - vectors are written with arrows and one-forms with tildes;
  - the gradient is shown to be a one-form from $df=\partial_\mu f\,dx^\mu$;
  - signature +2.

  — [Bertschinger](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf)
- **Wald** advocates abstract index notation as "an excellent compromise" between component notation and index-free notation. He calls tensors "the 'low point' of the course" in 30 years of teaching. — [Wald 2005](https://arxiv.org/abs/gr-qc/0511073)
- Analogies with documented author use:
  - surveyors ([Taylor & Wheeler](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf));
  - boosts as "rotations between space and time directions" ([Carroll](https://arxiv.org/abs/gr-qc/9712019));
  - wristwatch ([Taylor & Wheeler](https://www.eftaylor.com/spacetimephysics/01_chapter1.pdf));
  - latitude and north ([Bertschinger](https://faculty.washington.edu/seattle/physics544/2011-lectures/bertschinger.pdf));
  - 2D polar and spherical practice ([Moore](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf));
  - one-forms as surfaces ([Schutz TOC](https://assets.cambridge.org/97805218/87052/toc/9780521887052_toc.pdf)).

### Inferences
- For this document's reader (Calculus II, no linear algebra), Moore's approach fits best: components that transform, 2D examples first, explicit write-outs. Wald's abstract approach assumes linear algebra the reader lacks.
- The report can still mention the covector concept briefly (Topics 2 and 7), because the oblique-basis example makes it concrete without dual-space language.

### Gaps
- I did not consult Tong's or Blau's GR lecture notes, MIT 8.033/8.20, or Fleisch's *Student's Guide to Vectors and Tensors* directly. Statements about their presentation are therefore absent.
- I did not obtain Hartle's chapter 20 or Moore's *Workbook* text; Hartle's approach is described here through Moore's article.

---

## Key question C: What specific confusions do students have with index notation and the related relativity ideas?

### Takeaway
The most concrete published catalogue is Moore's list from 13 iterations of undergraduate GR. It reports the errors, but it is practitioner experience, not a controlled study. The errors:
- $\delta^\mu_\mu=1$ instead of 4;
- illegal index repetition;
- malformed free indices;
- not seeing the product-rule step in $d(p_\mu p^\mu)/d\tau$.

Moore traces them to failing to see implied sums, failing to tell free from summed indices, and not understanding index renaming. His remedy is drills plus "When in doubt, write it out!". Formal PER on SR concentrates on simultaneity and reference frames, not on tensor notation.

### Cited Findings
- Moore's list of common errors, quoted:
  - "They think that $\delta^\mu_\mu=1$, not 4."
  - "They think that $\eta_{\mu\nu}A^\mu B^\nu=\eta_{\mu\mu}A^\mu B^\mu$."
  - "They think that the equation $g_{\alpha\beta}=g_{\mu\nu}\delta^\mu_\sigma\delta^\nu_\gamma$ looks reasonable."
  - "They don't understand why $d(p_\mu p^\mu)/d\tau=2p_\mu(dp^\mu/d\tau)$."

  Underlying problems: "Failing to recognize implied sums; Failing to distinguish between free and summed indices; Failing to understand how index renaming works and what it means." — [Moore 2006, §4](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Moore: numerical indices invite reading superscripts as powers, and coordinate-symbol indices reduce mistakes. He reports students do not confuse these with abstract indices. — [Moore 2006, §3](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Moore: when he tried teaching one-forms, dual spaces and dual bases, "they perplex students greatly". — [Moore 2006, §3](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Wald: component notation "effectively forces one to think of a tensor as a collection of components rather than an object with legitimate status in its own right". — [Wald 2005](https://arxiv.org/abs/gr-qc/0511073)
- Carroll's inline warnings:
  - superscripts are not exponents;
  - contract only upper with lower;
  - index order matters;
  - $\delta^\alpha_\beta$ is not "symmetric".

  — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- Kim et al. (*Am. J. Phys.*, 2021; arXiv:1911.00892) report, as motivation for a graphical notation, that beginners have difficulty with index notation "due to its bulkiness". The difficulties they cite include trouble manipulating indices and getting lost in long calculations. (This comes from the search-result summary of the abstract and introduction; the full paper was not read.) — [Kim et al., "Boosting vector calculus with the graphical notation"](https://arxiv.org/abs/1911.00892)
- SR misconceptions: Scherr, Shaffer & Vokos found that after instruction, students at all levels struggle with relativity of simultaneity. Many treat the time of a distant event as the time a signal is received, and many hold absolute and relative simultaneity simultaneously. A follow-up describes curriculum to address this. — [Scherr, Shaffer & Vokos 2001, arXiv:physics/0207109](https://arxiv.org/abs/physics/0207109); [follow-up, arXiv:physics/0207081](https://arxiv.org/abs/physics/0207081)
- A study of 45 undergraduates found many obstacles in interpreting relativistic phenomena and confusion between SR and GR principles. (Abstract-level information from the search summary; full paper not read.) — [arXiv:2311.09914](https://arxiv.org/abs/2311.09914)

#### Each of Moore's errors explained (researcher's worked explanations, consistent with the cited rules)
- **$\delta^\mu_\mu=4$.** Write it out: $\delta^0_0+\delta^1_1+\delta^2_2+\delta^3_3=1+1+1+1=4$. In $n$ dimensions it equals $n$.
- **$\eta_{\mu\nu}A^\mu B^\nu\neq\eta_{\mu\mu}A^\mu B^\mu$.** The right side uses $\mu$ four times, which is illegal. Even read charitably as $\sum_\mu\eta_{\mu\mu}A^\mu B^\mu$, it silently drops every off-diagonal term. Those terms happen to be zero for $\eta$ but not for a general metric. In the oblique example, the $2g_{01}dx^0dx^1$ term contributed 2 of the total 7.
- **$g_{\alpha\beta}=g_{\mu\nu}\delta^\mu_\sigma\delta^\nu_\gamma$ is malformed.** The left side has free indices $\alpha,\beta$; the right side has free indices $\sigma,\gamma$. The correct statement is $g_{\sigma\gamma}=g_{\mu\nu}\delta^\mu_\sigma\delta^\nu_\gamma$.
- **The product rule for $d(p_\mu p^\mu)/d\tau$.** Write $p_\mu p^\mu=\eta_{\mu\nu}p^\mu p^\nu$. The product rule gives $\eta_{\mu\nu}\dot p^\mu p^\nu+\eta_{\mu\nu}p^\mu\dot p^\nu$. Renaming dummies in the first term and using $\eta_{\mu\nu}=\eta_{\nu\mu}$ shows the two terms are equal, so the result is $2p_\mu\dot p^\mu$.

### Inferences
- A beginner-facing document should include short drills mirroring Moore's list:
  - mark free versus dummy indices;
  - expand a sum by hand;
  - find the error in a malformed equation;
  - rename to factor.
- Use coordinate-name indices ($u^t,u^x$) in the first examples, before switching to $0,1,2,3$.
- Add a sidebar on relativity of simultaneity, since PER shows it survives standard instruction.

### Gaps
- **I found no peer-reviewed PER study (e.g. in *Phys. Rev. Phys. Educ. Res.*) that measures student difficulties with tensor index notation in GR specifically.** The evidence is practitioner reports (Moore, Wald, Carroll) plus adjacent vector-calculus work (Kim et al.). The report should describe the evidence base that way.
- The Kim et al. and arXiv:2311.09914 characterisations rest on abstract and search-summary text, not full reading.

---

## Key question D: Were the worked numbers verified? (verification log)

### Takeaway
Yes. Every numerical and symbolic result in Topics 1–12 was recomputed in Python 3.13 with sympy and floating-point arithmetic, and all agree to the stated precision. Two small external discrepancies are explained:
- GPS net offset: 4.4647 (computed) versus 4.4645 parts in $10^{10}$ (Ashby 2002), a rounding/constants difference;
- Earth's $GM/(Rc^2)$: $6.961\times10^{-10}$ (spherical, non-rotating) versus Ashby's geoid value $6.969\times10^{-10}$, which includes rotation and shape.

### Cited Findings
- External comparison values:
  - NASA mean surface gravity 9.820 m/s². — [NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)
  - Ashby's net 4.4645 parts in $10^{10}$, "about 4 km/s", "about $5\times10^{-10}$". — [Ashby 2002](https://physicstoday.aip.org/features/relativity-and-the-global-positioning-system)
  - Ashby's $a\approx9545$ km crossover and $\Phi_0/c^2$. — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)
  - Carroll's eq. 2.25. — [Carroll](https://arxiv.org/abs/gr-qc/9712019)

| Example | Quantity | Result (verified) |
|---|---|---|
| 1 (derivation) | sphere metric $J^TJ$ | $\mathrm{diag}(a^2,a^2\sin^2\theta)$ (sympy) |
| 1.1 | quarter circle $r=2$; small step | $\pi$ = 3.1416; 0.00141421 vs chord 0.00141439 |
| 1.2 | 1° lat; 1° lon at 0°/45°/60° | 111.19 km; 111.19 / 78.63 / 55.60 km |
| 1.3 | 60°N parallel vs great circle, 0°→90°E | 5003.8 km vs 4604.5 km (Δσ = 41.41°) |
| 2.1 | $\nabla f$, $D_{\hat u}f$, max | (8,3), 7.2, √73 = 8.544 |
| 2.2 | surface $g$ | 9.820 m/s² |
| 2.3 | polar covector of $\nabla x$ | $(\cos\theta,-r\sin\theta)$; raised $(\cos\theta,-\sin\theta/r)$ |
| 2.4 | $k$, $\omega$ at 500 nm; $k_\mu k^\mu$ | 1.2566e7 m⁻¹, 3.7673e15 rad/s; 0 |
| 4.1 | intervals | −16 (τ = 4 m/c = 13.34 ns), +16, 0 |
| 4.3 | lightning | +640,498 m²; 0.59958c; 800.31 m |
| 5.1 | γ, γβ, φ at 0.6c | 1.25, 0.75, ln 2 = 0.693147 |
| 5.2 | (5,3,0,0) → | (4,0,0,0); interval −16 both |
| 5.3 | (10,2,3,4) → | (11,−5,3,4); interval −71 both |
| 5.4 | $\Lambda^T\eta\Lambda-\eta$; det Λ | 0 (symbolic, both signatures); 1 |
| 5.5 | two 0.6c boosts | 15/17 c = 0.88235c |
| 6.1/6.2/6.3 | sums | 5; −7; 7 |
| 7.1 | oblique components | $V^i=(2,1)$, $V_i=(2.5,2)$, $g^{ij}=\tfrac13\begin{pmatrix}4&-2\\-2&4\end{pmatrix}$, length² 7 |
| 7.3 | doubled basis | $V^i=(1,0.5)$, $V_i=(5,4)$ |
| 8.4 | Earth $r_s$; clock loss | 8.870 mm; 6.961e−10 → 60.1 μs/day |
| 9.2 | polar lowering at r = 2 | $V_\mu=(3,2)$, norm² 10 |
| 10.1–10.5 | outer product, trace, sym·antisym, fluid trace | see text; 6; 0; $-\rho c^2+3p$ |
| 11.1–11.4 | polar metric; $V^r,V^\theta$; $\omega_r,\omega_\theta$; contraction | diag(1,r²); (0.7071, −0.5); (0.7071, −1); 1 |
| 12.1 | twin | 10 yr vs 6 yr |
| 12.2 | muon | γ = 10.0125; τ = 3.348 μs; survival 21.8% vs 2.4e−7 |
| 12.3 | GPS | −7.21, +45.79, net +38.58 μs/day; 4.4647e−10; 11.56 km/day; 9545 km |
| 12.4 | $u_\mu u^\mu$; $p_\mu p^\mu$ | −c²; −8.98755e22 kg²m²/s² = −m²c² |
| 12.5 | 1 g, 1 yr ship | v = 0.7748c, γ = 1.5819, t = 1.1873 yr, x = 0.5636 ly |

### Inferences
- The 0.6c and 0.8c examples were chosen because they give exact rational $\gamma$ (5/4 and 5/3). A reader can do them by hand without a calculator, which suits a Calculus II audience.

### Gaps
- None in the arithmetic. The remaining uncertainties are in sourcing (see the Gaps in Key question A, Topic 7, Topic 12 and Key question C), not in the computed numbers.
