# Differential geometry for GR, part 1: manifolds, tangent spaces, covariant derivatives, Christoffel symbols, parallel transport, geodesics, geodesic deviation

Who these notes are for: the report writer of "The Mathematics of General Relativity: From Calculus to Einstein's Field Equations". The reader has done Calculus II and has just read sections on vectors, matrices, Jacobians, index notation and the metric tensor. These notes cover the first half of the differential geometry. Curvature beyond what geodesic deviation needs (Ricci, Einstein tensor, field equations) belongs to the next researcher's notes.

How the notes were checked: every Christoffel symbol, parallel-transport angle, geodesic result, orbit radius and tidal number below was recomputed with sympy 1.14 (and numpy) in this research session. The relevant bullets say so with the tag **[sympy-verified]**. The verification scripts are summarised at the end of Key Question 2.

---

## Key Question 1: How do Carroll, Schutz, Hartle, Wald, MTW, Zee and introductory notes present each concept to beginners, and what are the clearest analogies?

### Takeaway
The free sources that could be read in full (Carroll's 1997 lecture notes, Tong's 2019 Cambridge notes, Blau's Bern notes, Einstein Online, Dray's course book) all follow the same route: (1) a manifold is a space that looks like $\mathbb{R}^n$ up close; (2) a vector is a velocity, or equivalently a directional derivative, at a single point; (3) the partial derivative fails in curved coordinates, so a correction term $\Gamma$ is added; (4) metric compatibility plus symmetry fix $\Gamma$ to be the Christoffel symbols; (5) parallel transport, geodesics and geodesic deviation all follow from $\Gamma$. The analogies that work best for beginners are the sphere ("there are no straight lines on a sphere"), the city map (local flatness), carrying an arrow around a triangle on a globe (holonomy), and two balls in a falling elevator drifting together (tidal forces as geodesic deviation). Schutz, Hartle, Wald, MTW and Zee could not be read directly. Statements about them below come from other sources or are flagged as unverified.

### Cited Findings

**Carroll, *Lecture Notes on General Relativity* (1997; arXiv gr-qc/9712019; the basis of his textbook *Spacetime and Geometry*). Equation numbers are those of the arXiv PDF.**
- Manifolds: Carroll explains why charts and atlases are needed with the circle $S^1$. The usual angle $\theta$ runs from $0$ to $2\pi$, but a chart's image must be an open set. Including $0$ or $2\pi$ gives a closed interval, and excluding both leaves a point uncovered, "So we need at least two charts". For $S^2$ he gives two stereographic-projection charts (eqs. 2.4–2.5) with a smooth transition map $z^i = 4y^i/[(y^1)^2+(y^2)^2]$ (eq. 2.6) on the overlap, and states that "many manifolds cannot be covered with a single coordinate system" — [Carroll notes, ch. 2](https://arxiv.org/abs/gr-qc/9712019)
- Tangent vectors: Carroll derives, by the chain rule, that the derivative of any function $f$ along a curve $x^\mu(\lambda)$ is $\frac{df}{d\lambda} = \frac{dx^\mu}{d\lambda}\partial_\mu f$ (eq. 2.9). Since $f$ is arbitrary, the operator itself is $\frac{d}{d\lambda} = \frac{dx^\mu}{d\lambda}\partial_\mu$ (eq. 2.10). So tangent vectors are directional derivatives and the partial derivatives $\partial_\mu$ form a basis (the "coordinate basis") — [Carroll notes, eqs. 2.9–2.10](https://arxiv.org/abs/gr-qc/9712019)
- Local flatness: at any point $p$ there are coordinates in which $g_{\mu\nu}$ takes its canonical form and all first derivatives $\partial_\sigma g_{\mu\nu}$ vanish, "while the second derivatives $\partial_\rho\partial_\sigma g_{\mu\nu}$ cannot be made to all vanish". These are Riemann normal coordinates, and Carroll calls this "the rigorous notion of the idea that 'small enough regions of spacetime look like flat (Minkowski) space.'" He credits the proof to Schutz pp. 158–160, where it is called the "local flatness theorem", and notes that Schutz calls local Lorentz frames "momentarily comoving reference frames" (MCRFs) — [Carroll notes, ch. 2, p. 50](https://arxiv.org/abs/gr-qc/9712019)
- The counting argument in 4D (Carroll): the metric at $p$ has 10 components, and the Jacobian $\partial x^\mu/\partial x^{\mu'}$ supplies 16 free numbers. That is enough to reach canonical form, and the 6 numbers left over are the 6 Lorentz transformations (3 rotations, 3 boosts). First derivatives of the metric: $4\times10 = 40$ numbers, matched exactly by the 40 free second derivatives $\partial^2x^\mu/\partial x^{\mu'_1}\partial x^{\mu'_2}$, so they can all be set to zero. Second derivatives: $10\times10 = 100$ numbers, but only $4\times20 = 80$ free third derivatives, so "20 fewer than we require". The 20 leftover numbers measure curvature, and they turn out to be the 20 independent components of the Riemann tensor — [Carroll notes, pp. 50–51](https://arxiv.org/abs/gr-qc/9712019)
- Covariant derivative: Carroll defines $\nabla$ by demanding (1) linearity, (2) the Leibniz rule, (3) commuting with contractions, (4) reducing to $\partial$ on scalars. He says of (3) and (4): "There is no way to 'derive' these properties; we are simply demanding that they be true." He then writes $\nabla_\mu V^\nu = \partial_\mu V^\nu + \Gamma^\nu_{\mu\lambda}V^\lambda$ (eq. 3.1), "the partial derivative, and then ... a correction to make the result covariant". He derives $\nabla_\mu\omega_\nu = \partial_\mu\omega_\nu - \Gamma^\lambda_{\mu\nu}\omega_\lambda$ (eq. 3.12), the general-tensor rule (eq. 3.13) and the semicolon notation (eq. 3.14) — [Carroll notes, ch. 3](https://arxiv.org/abs/gr-qc/9712019)
- Christoffel formula: Carroll derives $\Gamma^\sigma_{\mu\nu} = \tfrac12 g^{\sigma\rho}(\partial_\mu g_{\nu\rho} + \partial_\nu g_{\rho\mu} - \partial_\rho g_{\mu\nu})$ (eq. 3.21) from torsion-free plus metric compatibility $\nabla_\rho g_{\mu\nu}=0$ (eq. 3.17), and says: "This is one of the most important formulas in this subject; commit it to memory." — [Carroll notes, eqs. 3.17–3.21](https://arxiv.org/abs/gr-qc/9712019)
- Carroll on why $\Gamma$ matters even in flat space: "The existence of nonvanishing connection coefficients in curvilinear coordinate systems is the ultimate cause of the formulas for the divergence and so on that you find in books on electricity and magnetism." He uses plane polar coordinates (eqs. 3.22–3.25) as the first example — [Carroll notes, p. 61](https://arxiv.org/abs/gr-qc/9712019)
- Carroll on non-tensoriality: "the connection coefficients are not the components of a tensor". Conversely, "even in a curved space it is still possible to make the Christoffel symbols vanish at any one point", but "only ... at a point, not in some neighborhood" — [Carroll notes, ch. 3](https://arxiv.org/abs/gr-qc/9712019)
- Parallel transport: "the curved-space generalization of the concept of 'keeping the vector constant' as we move it along a path" (eqs. 3.30–3.32). He shows that metric compatibility makes parallel transport preserve norms and angles (eqs. 3.33–3.34). He gives an explicit formal solution, the "parallel propagator" $P^\mu{}_\rho(\lambda,\lambda_0)$ (eqs. 3.35–3.41), remarking "One thing they don't usually tell you in GR books is that you can write down an explicit and general solution to the parallel transport equation" — [Carroll notes, pp. 65–67](https://arxiv.org/abs/gr-qc/9712019)
- Geodesics, two definitions: (a) a curve that parallel-transports its own tangent vector ("straightest"), and (b) an extremum of proper time. The geodesic equation (eq. 3.47) is "another one which you should memorize". Carroll checks that in Cartesian coordinates it reduces to $d^2x^\mu/d\lambda^2=0$, a straight line. Timelike geodesics locally *maximise* proper time, which he ties to the twin paradox. An affine parameter is any $\lambda = a\tau + b$ (eq. 3.58) — [Carroll notes, pp. 68–71](https://arxiv.org/abs/gr-qc/9712019)
- Riemann tensor convention: $R^\rho{}_{\sigma\mu\nu} = \partial_\mu\Gamma^\rho_{\nu\sigma} - \partial_\nu\Gamma^\rho_{\mu\sigma} + \Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma} - \Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$ (eq. 3.67), from $[\nabla_\mu,\nabla_\nu]V^\rho = R^\rho{}_{\sigma\mu\nu}V^\sigma - T_{\mu\nu}{}^\lambda\nabla_\lambda V^\rho$ (eq. 3.66). On index ordering Carroll warns: "There is no agreement at all on what this convention should be." — [Carroll notes, p. 76](https://arxiv.org/abs/gr-qc/9712019)
- 2-sphere worked example (Carroll, "Our favorite example"): $ds^2 = a^2(d\theta^2+\sin^2\theta\,d\phi^2)$ (eq. 3.100), $\Gamma^\theta_{\phi\phi} = -\sin\theta\cos\theta$, $\Gamma^\phi_{\theta\phi}=\Gamma^\phi_{\phi\theta}=\cot\theta$ (eq. 3.101), $R^\theta{}_{\phi\theta\phi} = \sin^2\theta$ (eq. 3.102), $R_{\theta\phi\theta\phi} = a^2\sin^2\theta$ (eq. 3.103), $R_{\theta\theta}=1$, $R_{\phi\phi}=\sin^2\theta$ (eq. 3.104) — [Carroll notes, pp. 84–85](https://arxiv.org/abs/gr-qc/9712019)
- Geodesic deviation: Carroll starts from Euclid's parallel postulate ("initially parallel lines remain parallel forever") and notes that "on a sphere, certainly, initially parallel geodesics will eventually cross". He builds a one-parameter family of geodesics $\gamma_s(t)$ with tangent $T^\mu = \partial x^\mu/\partial t$ and deviation vector $S^\mu = \partial x^\mu/\partial s$ (eqs. 3.107–3.108), and derives $A^\mu = \frac{D^2}{dt^2}S^\mu = R^\mu{}_{\nu\rho\sigma}T^\nu T^\rho S^\sigma$ (eq. 3.113). He then says: "the relative acceleration between two neighboring geodesics is proportional to the curvature ... Physically, of course, the acceleration of neighboring geodesics is interpreted as a manifestation of gravitational tidal forces." — [Carroll notes, pp. 85–88](https://arxiv.org/abs/gr-qc/9712019)
- Newtonian limit: Carroll takes slow motion, a static field and a weak field ($g_{\mu\nu}=\eta_{\mu\nu}+h_{\mu\nu}$). He gets $\Gamma^\mu_{00} = -\tfrac12\eta^{\mu\lambda}\partial_\lambda h_{00}$ (eq. 4.15), then $d^2t/d\tau^2 = 0$ (eq. 4.17), and with $h_{00}=-2\Phi$ (eq. 4.20, units $c=1$) recovers Newton's law — [Carroll notes, pp. 105–106](https://arxiv.org/abs/gr-qc/9712019)
- Schwarzschild orbits (Carroll uses $c=1$ but keeps $G$): the circular photon orbit is at $r_c = 3GM$ (eq. 7.51), and "6GM is the smallest possible radius of a stable circular orbit" (eq. 7.55). There are stable circular orbits for $r>6GM$, and unstable ones for $3GM<r<6GM$ — [Carroll notes, ch. 7](https://arxiv.org/abs/gr-qc/9712019)

**David Tong, *General Relativity* (Cambridge Part III lecture notes, 2019)**
- Tong uses signature $(-,+,+,+)$. He explains the choice like this: "When thinking about geometry, the choice $(-+++)$ is preferable as it ensures that spatial distances are positive ... Ultimately you just need to get used to both conventions." — [Tong GR notes, Conventions](https://www.damtp.cam.ac.uk/user/tong/gr.html)
- Tong's Riemann tensor (his eq. 3.39) is $R^\sigma{}_{\rho\mu\nu} = \partial_\mu\Gamma^\sigma_{\nu\rho} - \partial_\nu\Gamma^\sigma_{\mu\rho} + \Gamma^\lambda_{\nu\rho}\Gamma^\sigma_{\mu\lambda} - \Gamma^\lambda_{\mu\rho}\Gamma^\sigma_{\nu\lambda}$, the same convention as Carroll. His geodesic deviation equation (3.36) is $\frac{D^2S^\mu}{D\tau^2} = R^\mu{}_{\nu\rho\sigma}X^\nu X^\rho S^\sigma$, the same as Carroll's (3.113) — [Tong GR notes, §3.3.4 and §3.4](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- Tong's sphere example: geodesics are $\ddot\theta = \sin\theta\cos\theta\,\dot\phi^2$ and $\ddot\phi = -2\frac{\cos\theta}{\sin\theta}\dot\phi\dot\theta$. Meridians and the equator are the simple solutions, and "this solution doesn't work for other values of $\theta$" (latitude circles are not geodesics). Meridians from the pole separate as $s(\tau) = r\phi\sin(v\tau)$ (eq. 3.37), which satisfies $\ddot s = -v^2 s$ via $R^\phi{}_{\theta\theta\phi} = -1$ (eq. 3.38) — [Tong GR notes, pp. 128–129](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- Tong on holonomy: "the Riemann tensor ... tells us the path dependence of parallel transport ... A particularly simple example ... comes from parallel transport of a vector on a sphere: the direction that you end up pointing in depends on the path you take." — [Tong GR notes, §3.3](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- Tong on normal coordinates as a working method: "calculations are considerably easier in normal coordinates. But if the resulting expression relate tensors then the final result must be true in any coordinate system." — [Tong GR notes, §3.3](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- Tong opens with an elevator picture: a falling observer feels weightless but measures a tidal force "on the way down" (his Figure 2) — [Tong GR notes, §1.2](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- Tong's ISCO: $r_{\rm ISCO} = 6GM/c^2$ (eq. 1.46), found as the saddle point of the effective potential when $l^2 = 12G^2M^2/c^2$. He links it to the inner edge of accretion discs and to the photon sphere seen by the Event Horizon Telescope — [Tong GR notes, §1.3](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- Tong on gravitational waves: they are measured through geodesic deviation. In TT gauge, $\frac{d^2S^\mu}{dt^2} = \frac12\frac{d^2h^\mu{}_\nu}{dt^2}S^\nu$ (eq. 5.23), and for $+$ polarisation $S^1(t) = S^1(0)\left(1+\tfrac12 H_+e^{i\omega t}\right)$, $S^2(t) = S^2(0)\left(1-\tfrac12 H_+e^{i\omega t}\right)$ (eq. 5.24): one direction stretches while the perpendicular one squeezes. He also notes that a single falling observer "feel[s] nothing at all ... it's all about your standing relative to your neighbours" — [Tong GR notes, §5.2](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)

**Matthias Blau, *Lecture Notes on General Relativity* (Bern; PDF last updated 22 Oct 2026)**
- Blau gives the Euler–Lagrange shortcut for Christoffel symbols: the Euler–Lagrange form of the geodesic equation "frequently provides the most direct way of calculating Christoffel symbols". Rewrite $\frac{d}{d\lambda}\left(g_{\gamma\beta}\frac{dx^\beta}{d\lambda}\right) = \tfrac12 g_{\alpha\beta,\gamma}\frac{dx^\alpha}{d\lambda}\frac{dx^\beta}{d\lambda}$ (eq. 3.12) as $\ddot x^\gamma + (\text{terms} \propto \dot x\dot x) = 0$ and read off $\Gamma^\gamma_{\alpha\beta}$ — [Blau notes, §3.1](http://www.blau.itp.unibe.ch/newlecturesGR.pdf)
- Blau warns about factors of 2: $\Gamma^\mu_{\nu\lambda}\dot x^\nu\dot x^\lambda = \Gamma^\mu_{11}(\dot x^1)^2 + 2\Gamma^\mu_{12}\dot x^1\dot x^2+\dots$ (eq. 3.15). For the sphere, comparing $\ddot\theta - \sin\theta\cos\theta\,\dot\phi^2 = 0$ (eq. 3.17) with the geodesic equation gives $\Gamma^\theta_{\phi\phi} = -\sin\theta\cos\theta$ (eq. 3.19) — [Blau notes, §3.1](http://www.blau.itp.unibe.ch/newlecturesGR.pdf)
- Blau on conventions: "there are a large number of sign conventions involved in the definition of the Riemann tensor ... make sure what conventions are being used". He gives a check: in his conventions $R_{\phi\theta\phi\theta}$ and the curvature scalar "are positive for the standard metric on the two-sphere". This matches Carroll, whose sphere has $R = 2/a^2 > 0$ — [Blau notes, end of §8.3](http://www.blau.itp.unibe.ch/newlecturesGR.pdf)
- Blau introduces tidal forces as "initially parallel trajectories of freely falling non-interacting particles (dust, pebbles, ...) do not remain parallel, i.e. ... gravity is an attractive force that has the tendency to focus matter" — [Blau notes, §8.4](http://www.blau.itp.unibe.ch/newlecturesGR.pdf)

**Markus Pössel, Einstein Online (Max Planck Institute for Gravitational Physics outreach)**
- City-map analogy for local flatness: a small city map looks flat because "a tiny region of such a surface looks almost exactly the same as part of a plane". Curvature only shows over larger regions — [Einstein Online, "Gravity: from weightlessness to curvature"](https://www.einstein-online.info/en/spotlight/geometry_force/)
- "There are no straight lines on a sphere." Geodesics (equator, meridians) are the straightest available lines, and a triangle made of them has angles summing to more than 180° — [Einstein Online, "Gravity: from weightlessness to curvature"](https://www.einstein-online.info/en/spotlight/geometry_force/)
- Elevator analogy for tidal forces: two floating spheres in a large falling elevator drift closer together because each is pulled toward Earth's centre. The larger the elevator and the longer the wait, the more this residual gravity shows — [Einstein Online, "Gravity: from weightlessness to curvature"](https://www.einstein-online.info/en/spotlight/geometry_force/)
- Parallel transport and geodetic precession: carrying an arrow around a triangle of great-circle arcs (equator plus meridians) returns it rotated by 90°, and the rotation grows with enclosed area and with curvature ("The smaller the radius of a sphere, the greater its curvature"). A freely falling gyroscope is the spacetime version of parallel transport ("Just let go!"). Its axis changes direction slightly in curved spacetime; this is geodetic (de Sitter) precession, first derived by de Sitter in 1917 (Everitt et al. cite de Sitter, MNRAS 77, 155 (1916)) — [Einstein Online, "A subtle change in direction: Geodetic precession"](https://www.einstein-online.info/en/spotlight/geodetic_precession/)
- Einstein Online's dictionary defines a geodesic as a straightest-possible line in a surface or more general space. Freely falling particles move on the straightest possible lines through spacetime (from a search-result summary of the glossary page) — [Einstein Online glossary, "geodesic"](https://www.einstein-online.info/en/explandict/geodesic/)

**Tevian Dray, *Geometry of General Relativity* (Oregon State course book)**
- Dray uses the "rain" (radially freely falling) frame in Schwarzschild ($G=c=1$). Side-by-side objects approach each other with $(\Delta s)^{\cdot\cdot} = -(m/r^3)\Delta s$. Radially stacked objects separate with $(\Delta s)^{\cdot\cdot} = (2m/r^3)\Delta s$, "formally the same as in Newtonian theory". These coefficients are identified with Riemann components, and Dray concludes that gravity has a quadrupole (stretch–squeeze) character — [Dray, GGR ch. 6 §2 "Tidal Forces"](https://sites.science.oregonstate.edu/physics/coursewikis/GGR/book/ggr/tidal.html)

**Conventions across textbooks (MTW, Wald, Weinberg, Schutz, Hartle, Zee)**
- Wikipedia lists MTW, Carroll and Wald among $(-,+,+,+)$ ("mostly plus", "East coast") books, noting that Wald switches signature for Chapter 13 only. Landau & Lifshitz is among the $(+,-,-,-)$ books — [Wikipedia, "Sign convention"](https://en.wikipedia.org/wiki/Sign_convention) (cross-check only)
- MTW characterise any author's conventions by a triple of signs (metric, Riemann, Einstein equation), and MTW's front endpapers tabulate the conventions of many other books — [arXiv:2105.14800 (search-result summary)](https://arxiv.org/pdf/2105.14800)
- A mailing-list thread reports that MTW and Weinberg use opposite signs for the Ricci tensor (Weinberg's sphere has negative scalar curvature), and that Weinberg and Schutz differ in the sign of the Riemann tensor. This is a secondary source — [Maxima mailing list, 2007](https://maxima.sourceforge.io/ext/list_archives/2007/msg04992.html)
- Carroll cites Weinberg pp. 106–108 for the identity $\Gamma^\mu_{\mu\lambda} = \partial_\lambda\ln\sqrt{|g|}$ — [Carroll notes, eq. 3.27](https://arxiv.org/abs/gr-qc/9712019)

**Analogy bank by topic (each analogy sourced above, or flagged as my own)**
- Manifold or chart: an atlas of maps of the Earth. No single flat map covers the globe without a tear or a singular point, which is why the sphere needs at least two charts (Carroll's $S^1$/$S^2$ argument above). The atlas metaphor is built into the word "atlas" itself.
- Local flatness: the city map (Pössel, above).
- Tangent space: a flat sheet of paper touching a globe at one point. A different point needs a different sheet. (My own illustration; it is the embedded picture of $T_pS^2$ verified below.)
- Covariant derivative: polar coordinates, where the basis arrows $\hat r,\hat\theta$ turn as you move, so a constant arrow can have changing components (Carroll's polar example).
- Parallel transport and holonomy: the arrow carried around a globe triangle (Pössel), and the Foucault pendulum (geometric phase; see Key Question 3).
- Geodesic: the straightest possible line; airline great-circle routes; "no straight lines on a sphere" (Pössel).
- Geodesic deviation: meridians that are parallel at the equator meet at the pole (Carroll, Tong). Two balls in a falling elevator (Pössel). Ocean tides stretched along the Earth–Moon line (Dray).

### Inferences
- The most beginner-friendly teaching sequence suggested by these sources: polar coordinates first, so the reader sees nonzero $\Gamma$ in flat space and learns that $\Gamma \neq 0$ does not mean curvature. Then the 2-sphere, a genuinely curved space small enough to do by hand. Then Schwarzschild. Carroll, Tong and Blau all use exactly the polar → sphere → Schwarzschild ladder.
- Present geodesics with both of Carroll's definitions ("straightest" via parallel transport of the tangent, and "extremal proper time"). The first connects to parallel transport. The second connects to the Calculus II idea of optimisation and to integration by parts in the Euler–Lagrange derivation.
- For a Calculus II audience, Blau's Euler–Lagrange shortcut is the most practical way to compute Christoffel symbols. Teach the formula to *understand* $\Gamma$ and the Lagrangian to *compute* it.
- The geodesic deviation equation should be introduced through the Newtonian tidal tensor (a Taylor expansion, which Calculus II students know), then matched to the Riemann tensor. Dray and Carroll both make this link.

### Gaps
- I could not read Schutz (*A First Course in General Relativity*, chs. 5–6), Hartle (*Gravity*, chs. 8–9, 21), Wald, MTW or Zee (*Einstein Gravity in a Nutshell*) directly. They are not freely available online, and I found no reliable excerpts. The only statements about them above come via Carroll's citations (Schutz pp. 158–160, Weinberg pp. 106–108), Wikipedia's signature list, an arXiv paper's description of MTW's endpaper table, and a mailing list.
- From memory and **unverified**: (i) MTW write geodesic deviation as $\frac{D^2\xi^\alpha}{d\tau^2} + R^\alpha{}_{\beta\gamma\delta}u^\beta\xi^\gamma u^\delta = 0$ (MTW eq. 11.10), which is algebraically identical to Carroll's form by antisymmetry in the last two indices. (ii) Hartle uses the same form as MTW. (iii) Schutz introduces Christoffel symbols through derivatives of basis vectors, $\partial\vec e_\alpha/\partial x^\beta = \Gamma^\mu{}_{\alpha\beta}\vec e_\mu$, in polar coordinates. (iv) Wald writes $a^c = -R_{abd}{}^c\xi^bT^aT^d$ with his own index placement. (v) Weinberg's Riemann tensor has the opposite overall sign. The writer should check these against the books before quoting equation numbers.
- MIT OCW 8.962 (Scott Hughes) notes were not consulted, for lack of tool budget.

---

## Key Question 2: What exactly are the formulas (in LaTeX) and the worked results, verified with sympy?

### Takeaway
Everything follows from one object, the connection $\Gamma^\lambda_{\mu\nu}$. On a manifold with a metric, demanding symmetry and $\nabla g = 0$ fixes it uniquely to $\Gamma^\lambda_{\mu\nu} = \tfrac12 g^{\lambda\sigma}(\partial_\mu g_{\nu\sigma}+\partial_\nu g_{\mu\sigma}-\partial_\sigma g_{\mu\nu})$. From it come the covariant derivative, parallel transport, the geodesic equation and, through the Riemann tensor, geodesic deviation. I reproduced every standard result with sympy:
- polar: $\Gamma^r_{\theta\theta}=-r$, $\Gamma^\theta_{r\theta}=1/r$;
- sphere: $\Gamma^\theta_{\phi\phi}=-\sin\theta\cos\theta$, $\Gamma^\phi_{\theta\phi}=\cot\theta$;
- Schwarzschild: the 9 independent nonzero symbols;
- the latitude-circle holonomy $2\pi(1-\cos\theta_0)$ and the 90° triangle holonomy;
- great circles, straight lines in polar coordinates, radial free fall $\ddot r=-GM/r^2$, the photon sphere at $3GM/c^2$ and the ISCO at $6GM/c^2$;
- the meridian deviation $\xi''=-\xi/a^2$ and the Schwarzschild tidal tensor (radial $+2GM/r^3$, transverse $-GM/r^3$), which equals the Newtonian $\partial_i\partial_j\Phi$.

### Cited Findings

#### 0. Conventions and units used throughout (state these in the report)
- Signature $(-,+,+,+)$: Minkowski $ds^2 = -c^2dt^2+dx^2+dy^2+dz^2$. This is the convention of Carroll and Tong (and MTW, Wald) — [Tong GR notes](https://www.damtp.cam.ac.uk/user/tong/gr.html); [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Riemann tensor, Carroll/MTW convention: $R^\rho{}_{\sigma\mu\nu} = \partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$. With it the 2-sphere has $R^\theta{}_{\phi\theta\phi} = +\sin^2\theta$ and Ricci scalar $+2/a^2$ — [Carroll notes, eqs. 3.67, 3.102](https://arxiv.org/abs/gr-qc/9712019) **[sympy-verified]**
- Greek indices $\mu,\nu,\ldots$ run over all coordinates ($0,1,2,3$ in spacetime; $1,2$ on a surface). Latin $i,j$ run over space ($1,2,3$). Repeated upper and lower indices are summed (Einstein convention) — [Tong GR notes, Conventions](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- Units: Sections 1–5 below are pure geometry (lengths only). For Schwarzschild I use **SI with $x^0 = ct$** unless flagged, so every coordinate has units of length and $r_s = 2GM/c^2$. The orbit section (6d) switches to **geometric units $G=c=1$** (so $r_s = 2M$), and the switch is announced there. Carroll's chapter 7 uses $c=1$ with $G$ kept, writing results as $3GM$ and $6GM$; Tong keeps $G$ and $c$ ($6GM/c^2$) — [Carroll notes, ch. 7](https://arxiv.org/abs/gr-qc/9712019); [Tong GR notes, eq. 1.46](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)

#### 1. Manifolds: charts, atlases, smoothness, local flatness, dimension

**(1) Plain language and analogy.** A manifold is any space that looks like ordinary flat $\mathbb{R}^n$ when you zoom in far enough: a sphere, a doughnut, curved spacetime. You describe it the way an atlas describes the Earth, with many flat maps ("charts"), each covering part of it, plus rules for translating between maps where they overlap. The coordinates are just labels on the map. They are not rulers, and distances come only from the metric. "Locally flat" is the city-map fact: a small enough piece of a curved surface looks flat — [Einstein Online](https://www.einstein-online.info/en/spotlight/geometry_force/); [Carroll notes, ch. 2](https://arxiv.org/abs/gr-qc/9712019)

**(2) Why GR needs it.** Spacetime in GR is a 4-dimensional curved manifold, and no single coordinate system needs to cover it. Black-hole spacetimes are the standard example: Schwarzschild coordinates misbehave at $r = r_s$, so other charts are needed there (beyond this section). The local-flatness theorem is the mathematical form of Einstein's equivalence principle: in a small enough freely falling lab, physics looks like special relativity — [Carroll notes, p. 50](https://arxiv.org/abs/gr-qc/9712019)

**(3) Mechanics, step by step.**
- A **chart** is a pair $(U,\varphi)$: $U$ is an open patch of the manifold $M$, and $\varphi: U\to\mathbb{R}^n$ is one-to-one onto an open set. It assigns each point $p\in U$ its coordinates $x^\mu(p)$, $\mu = 1,\ldots,n$. The **dimension** $n$ is the number of coordinates needed (2 for a sphere's surface, 4 for spacetime) — [Carroll notes, ch. 2](https://arxiv.org/abs/gr-qc/9712019)
- An **atlas** is a collection of charts that together cover $M$. Where two charts overlap, the **transition map** $\varphi_2\circ\varphi_1^{-1}$ (the change of coordinates, whose derivative is the Jacobian $\partial x'^\mu/\partial x^\nu$ from the reader's earlier section) must be smooth ($C^\infty$: differentiable any number of times). That requirement is what makes the manifold "smooth" — [Carroll notes, eqs. 2.4–2.6](https://arxiv.org/abs/gr-qc/9712019)
- **Riemann normal coordinates (RNC)** at a point $p$: coordinates in which $g_{\mu\nu}(p) = \eta_{\mu\nu} = \mathrm{diag}(-1,1,1,1)$ and $\partial_\sigma g_{\mu\nu}(p)=0$, but in general $\partial_\rho\partial_\sigma g_{\mu\nu}(p)\neq 0$ — [Carroll notes, p. 50](https://arxiv.org/abs/gr-qc/9712019)

**(4) Worked examples.**
- *Example 1.1: why the circle and the sphere need at least two charts.* For $S^1$, the angle $\theta\in[0,2\pi)$ is not an open interval. Removing the point $\theta=0$ makes it open but leaves a point uncovered, so a second chart (say, an angle measured from the bottom) is needed — [Carroll notes, ch. 2](https://arxiv.org/abs/gr-qc/9712019). For $S^2$, the usual $(\theta,\phi)$ fail at the poles, where $\phi$ is undefined and $\det g = a^4\sin^2\theta = 0$, and along the seam $\phi=0\equiv2\pi$. Carroll's atlas uses two stereographic projections, one from each pole, whose overlap is everything except the two poles, with transition map $z^i = 4y^i/[(y^1)^2+(y^2)^2]$ (smooth wherever $y\neq0$) — [Carroll notes, eqs. 2.4–2.6](https://arxiv.org/abs/gr-qc/9712019)
- *Example 1.2: local flatness on a sphere, shown explicitly.* Let $\rho$ be the distance from the north pole along the surface, so $\rho = a\theta$ and $d\rho = a\,d\theta$. Substituting into $ds^2 = a^2d\theta^2 + a^2\sin^2\theta\,d\phi^2$ gives
  $$ds^2 = d\rho^2 + a^2\sin^2\!\left(\frac{\rho}{a}\right)d\phi^2 .$$
  Taylor-expand $\sin x = x - x^3/6 + \ldots$ to get $a^2\sin^2(\rho/a) = \rho^2 - \dfrac{\rho^4}{3a^2} + O(\rho^6)$. Hence
  $$ds^2 = d\rho^2 + \rho^2\left(1 - \frac{\rho^2}{3a^2}+\ldots\right)d\phi^2 .$$
  The leading term is exactly the flat polar metric $d\rho^2+\rho^2d\phi^2$. The first correction is *second order* in $\rho$, controlled by the curvature $1/a^2$, as the local-flatness theorem says. **[sympy-verified series]** Number: the circumference of a circle of radius $\rho$ drawn on the sphere is $C = 2\pi a\sin(\rho/a) = 2\pi\rho - \dfrac{\pi\rho^3}{3a^2}+\ldots$ **[sympy-verified]**. On a spherical Earth ($a = 6371$ km, [NASA Earth fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)), a circle of radius 10 km is short of $2\pi\rho$ by a fraction $\rho^2/(6a^2) = 4.1\times10^{-7}$, about 2.6 cm out of 62.8 km (my calculation). That is why city maps look flat.
- *Example 1.3: counting in 4D why curvature can't be removed* (Carroll's argument, above). 10 metric components vs 16 Jacobian entries leaves 6 (the Lorentz group). 40 first derivatives vs 40 free second derivatives of the coordinate change leaves 0. 100 second derivatives vs 80 free third derivatives leaves **20**, which is the number of independent Riemann components in 4D — [Carroll notes, pp. 50–51](https://arxiv.org/abs/gr-qc/9712019). (The same formula $n^2(n^2-1)/12$ gives 1 in 2D, Carroll eq. 3.120 in the ar5iv numbering: the sphere has a single curvature number, $1/a^2$.)

**(5) Where it appears in GR.** Spacetime is a 4D Lorentzian manifold $(M, g_{\mu\nu})$. Every equation in GR is written in some chart and must be a tensor equation so that it holds in all charts. Local flatness (RNC) is how the equivalence principle is built into the mathematics, and it is the computational trick Tong uses ("calculations are considerably easier in normal coordinates") — [Tong GR notes](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)

#### 2. Tangent spaces: vectors as velocities and as directional derivatives

**(1) Plain language and analogy.** At each point $p$ of a curved surface, imagine a flat sheet of paper touching the surface only at $p$. That sheet is the **tangent space** $T_p M$, and all the "arrows" (velocities, momenta, forces) that live at $p$ lie in it. A different point has a different sheet. On a curved surface the sheets are tilted relative to each other, so an arrow at one point cannot simply be compared with an arrow at another. A rule for comparing them (a connection) has to be invented.

**(2) Why GR needs it.** A particle's 4-velocity $u^\mu = dx^\mu/d\tau$, the 4-momentum $p^\mu$ and a gyroscope's spin all live in the tangent space at one event. GR has no global "space" in which a vector at the Sun and a vector at the Earth can be subtracted. Carroll notes, for example, that the relative velocity of distant galaxies is not well defined — [Carroll notes, ch. 3, p. 64](https://arxiv.org/abs/gr-qc/9712019)

**(3) Mechanics, step by step.**
- Velocity of a curve: take a curve $x^\mu(\lambda)$ through $p$. Its tangent vector has components $V^\mu = dx^\mu/d\lambda$ (one number per coordinate).
- Directional derivative: for any smooth function $f$ on the manifold, the chain rule (Calculus II/III) gives
  $$\frac{d f}{d\lambda} = \frac{\partial f}{\partial x^\mu}\frac{dx^\mu}{d\lambda} = \frac{dx^\mu}{d\lambda}\,\partial_\mu f .$$
  Because $f$ is arbitrary, identify the vector with the operator $\frac{d}{d\lambda} = \frac{dx^\mu}{d\lambda}\partial_\mu$ — [Carroll notes, eqs. 2.9–2.10](https://arxiv.org/abs/gr-qc/9712019)
- So the partial derivatives $\partial_\mu \equiv \partial/\partial x^\mu$ act as **basis vectors**, the *coordinate basis*: $V = V^\mu\partial_\mu$. $\partial_\mu$ points along the line where only $x^\mu$ changes.
- Change of coordinates uses the Jacobian: $\partial_{\mu'} = \frac{\partial x^\mu}{\partial x^{\mu'}}\partial_\mu$, $V^{\mu'} = \frac{\partial x^{\mu'}}{\partial x^\mu}V^\mu$. (In plane polar coordinates this gives $\partial_r = \frac{x}{r}\partial_x+\frac{y}{r}\partial_y$ and $\partial_\theta = -y\,\partial_x + x\,\partial_y$.)
- The metric gives inner products of basis vectors: $g_{\mu\nu} = \partial_\mu\cdot\partial_\nu$ (for a surface sitting in 3D space, an ordinary dot product).

**(4) Worked example: the tangent plane to a sphere** **[sympy-verified]**.
1. Embed the sphere of radius $a$ in 3D: $\vec R(\theta,\phi) = a(\sin\theta\cos\phi,\ \sin\theta\sin\phi,\ \cos\theta)$.
2. Coordinate basis vectors are partial derivatives of the position:
   $\vec e_\theta = \partial\vec R/\partial\theta = a(\cos\theta\cos\phi,\ \cos\theta\sin\phi,\ -\sin\theta)$ and
   $\vec e_\phi = \partial\vec R/\partial\phi = a(-\sin\theta\sin\phi,\ \sin\theta\cos\phi,\ 0)$.
3. Both are perpendicular to $\vec R$ ($\vec e_\theta\cdot\vec R = 0$, $\vec e_\phi\cdot\vec R=0$), so they span the plane touching the sphere at that point: $T_pS^2$.
4. Their dot products give the metric: $\vec e_\theta\cdot\vec e_\theta = a^2$, $\vec e_\phi\cdot\vec e_\phi = a^2\sin^2\theta$, $\vec e_\theta\cdot\vec e_\phi=0$, so $g_{\mu\nu} = \mathrm{diag}(a^2, a^2\sin^2\theta)$. This links the "metric tensor" section to tangent vectors.
5. Why vectors at different points can't be compared: at the north pole the tangent plane is horizontal (normal $\hat z$). At the point $(\theta,\phi)=(\pi/2,0)$ on the equator it is vertical (normal $\hat x$). The vector $(0,0,1)$, "due north" at that equator point, does not even lie in the north pole's tangent plane. Subtracting vectors from different tangent planes gives something that is not tangent to the sphere anywhere. Intrinsically, without the 3D embedding, there is no subtraction at all. This motivates the connection.

**(5) Where it appears in GR.** The 4-velocity $u^\mu = dx^\mu/d\tau$ with $g_{\mu\nu}u^\mu u^\nu = -c^2$ (timelike); null tangent vectors $k^\mu$ with $g_{\mu\nu}k^\mu k^\nu = 0$ for light; geodesic tangent vectors; and the vectors fed into the Riemann tensor in geodesic deviation.

#### 3. Covariant differentiation

**(1) Plain language and analogy.** To ask "is this arrow field changing?", you must compare arrows at neighbouring points. In curved coordinates, or on a curved surface, the basis arrows themselves turn from point to point. A naive derivative of the components then mixes "the arrow really changed" with "my reference arrows turned". The covariant derivative subtracts the second effect. Analogy: on a merry-go-round, the numbers describing a fixed object change because *you* are rotating; correcting for your own rotation gives the true change.

**(2) Why GR needs it.** Physical laws must be tensor equations, valid in every coordinate system. The ordinary derivative of a vector's components is not a tensor in curvilinear coordinates; $\nabla$ is. Every law of special relativity carries over to GR by replacing $\partial\to\nabla$ ("comma goes to semicolon"). An example is energy–momentum conservation $\nabla_\mu T^{\mu\nu}=0$ — [Carroll notes, ch. 3 and eq. 4.23](https://arxiv.org/abs/gr-qc/9712019)

**(3) Mechanics, step by step: the failure of $\partial$, shown in plane polar coordinates** **[sympy-verified]**.
1. Plane polar coordinates: $x = r\cos\theta$, $y=r\sin\theta$, metric $ds^2 = dr^2 + r^2d\theta^2$, so $g_{rr}=1$, $g_{\theta\theta}=r^2$, $g_{r\theta}=0$ — [Carroll notes, eq. 3.22](https://arxiv.org/abs/gr-qc/9712019)
2. Coordinate basis vectors written in Cartesian form: $\vec e_r = (\cos\theta,\ \sin\theta)$ and $\vec e_\theta = (-r\sin\theta,\ r\cos\theta)$. ($\vec e_\theta$ has length $r$, which is why $g_{\theta\theta}=r^2$.)
3. Differentiate the basis vectors:
   - $\partial_r\vec e_r = (0,0) = 0$;
   - $\partial_\theta\vec e_r = (-\sin\theta,\ \cos\theta) = \frac1r\vec e_\theta$;
   - $\partial_r\vec e_\theta = (-\sin\theta,\ \cos\theta) = \frac1r\vec e_\theta$;
   - $\partial_\theta\vec e_\theta = (-r\cos\theta,\ -r\sin\theta) = -r\,\vec e_r$.
4. Define the connection coefficients by "derivative of a basis vector = combination of basis vectors": $\partial_\mu\vec e_\nu = \Gamma^\lambda_{\mu\nu}\vec e_\lambda$. Reading off step 3: $\Gamma^\theta_{\theta r} = \Gamma^\theta_{r\theta} = 1/r$, $\Gamma^r_{\theta\theta} = -r$, all others $0$. (This basis-vector definition is the standard Euclidean-space motivation. The formula agrees with Carroll's eqs. 3.24–3.25.)
5. Differentiate a whole vector $\vec V = V^\nu\vec e_\nu$ with the product rule:
   $$\partial_\mu\vec V = (\partial_\mu V^\nu)\vec e_\nu + V^\nu(\partial_\mu\vec e_\nu) = (\partial_\mu V^\nu)\vec e_\nu + V^\nu\Gamma^\lambda_{\mu\nu}\vec e_\lambda .$$
6. Rename the dummy indices in the second term ($\lambda\leftrightarrow\nu$) and collect: $\partial_\mu\vec V = \left(\partial_\mu V^\nu + \Gamma^\nu_{\mu\lambda}V^\lambda\right)\vec e_\nu$. The bracket is the **covariant derivative**:
   $$\boxed{\nabla_\mu V^\nu = \partial_\mu V^\nu + \Gamma^\nu_{\mu\lambda}V^\lambda}$$
   — [Carroll notes, eq. 3.1](https://arxiv.org/abs/gr-qc/9712019)
7. *Worked example: a constant field with non-constant components.* The uniform field $\vec V = \hat x$ (unit arrow pointing right everywhere) has polar components $V^r = \cos\theta$, $V^\theta = -\sin\theta/r$. Its partial derivatives are **not** zero: $\partial_\theta V^r = -\sin\theta$, $\partial_r V^\theta = \sin\theta/r^2$, $\partial_\theta V^\theta = -\cos\theta/r$. Now add the $\Gamma$ terms:
   - $\nabla_r V^r = \partial_r(\cos\theta) + \Gamma^r_{r\lambda}V^\lambda = 0 + 0 = 0$.
   - $\nabla_\theta V^r = \partial_\theta(\cos\theta) + \Gamma^r_{\theta\theta}V^\theta = -\sin\theta + (-r)(-\sin\theta/r) = 0$.
   - $\nabla_r V^\theta = \partial_r(-\sin\theta/r) + \Gamma^\theta_{r\theta}V^\theta = \sin\theta/r^2 + (1/r)(-\sin\theta/r) = 0$.
   - $\nabla_\theta V^\theta = \partial_\theta(-\sin\theta/r) + \Gamma^\theta_{\theta r}V^r = -\cos\theta/r + (1/r)\cos\theta = 0$.

   All four vanish, as they must for a field that does not change. **[sympy-verified]**
8. **One-forms (covectors, lower index).** Demand that $\nabla$ of the scalar $\omega_\lambda V^\lambda$ equal its partial derivative, and use the Leibniz rule. The $\Gamma$ term must then appear with a minus sign: $$\boxed{\nabla_\mu\omega_\nu = \partial_\mu\omega_\nu - \Gamma^\lambda_{\mu\nu}\omega_\lambda}$$ — [Carroll notes, eqs. 3.9–3.12](https://arxiv.org/abs/gr-qc/9712019). Check with $\omega = dx$ in polar coordinates ($\omega_r = \cos\theta$, $\omega_\theta = -r\sin\theta$): $\nabla_\theta\omega_\theta = \partial_\theta(-r\sin\theta) - \Gamma^r_{\theta\theta}\omega_r = -r\cos\theta - (-r)\cos\theta = 0$; $\nabla_\theta\omega_r = -\sin\theta - \Gamma^\theta_{\theta r}\omega_\theta = -\sin\theta - \frac1r(-r\sin\theta) = 0$; $\nabla_r\omega_\theta = -\sin\theta - \Gamma^\theta_{r\theta}\omega_\theta = -\sin\theta+\sin\theta = 0$; $\nabla_r\omega_r = 0$. (My hand calculation; consistent with the formulas above.)
9. **Higher-rank tensors**: one $+\Gamma$ term per upper index and one $-\Gamma$ term per lower index — [Carroll notes, eq. 3.13](https://arxiv.org/abs/gr-qc/9712019). Example for a $(1,1)$ tensor:
   $$\nabla_\sigma T^\mu{}_\nu = \partial_\sigma T^\mu{}_\nu + \Gamma^\mu_{\sigma\lambda}T^\lambda{}_\nu - \Gamma^\lambda_{\sigma\nu}T^\mu{}_\lambda ,$$
   and for the metric
   $$\nabla_\lambda g_{\mu\nu} = \partial_\lambda g_{\mu\nu} - \Gamma^\sigma_{\lambda\mu}g_{\sigma\nu} - \Gamma^\sigma_{\lambda\nu}g_{\mu\sigma}.$$
10. **Notation**: comma = partial derivative, semicolon = covariant derivative: $V^\nu{}_{,\mu}\equiv\partial_\mu V^\nu$ and $V^\nu{}_{;\mu}\equiv\nabla_\mu V^\nu$ — [Carroll notes, eq. 3.14](https://arxiv.org/abs/gr-qc/9712019)
11. **Metric compatibility**, $\nabla_\lambda g_{\mu\nu} = 0$ (eq. 3.17): the metric looks constant to the covariant derivative, so lengths and angles do not change under parallel transport, and raising or lowering an index commutes with $\nabla$ (eq. 3.18). Check in polar coordinates:
    - $\nabla_r g_{\theta\theta} = \partial_r(r^2) - 2\Gamma^\theta_{r\theta}g_{\theta\theta} = 2r - 2\cdot\frac1r\cdot r^2 = 0$.
    - $\nabla_\theta g_{r\theta} = 0 - \Gamma^\theta_{\theta r}g_{\theta\theta} - \Gamma^r_{\theta\theta}g_{rr} = -\frac1r r^2 - (-r)(1) = 0$.

    All components of $\nabla g$ for the sphere and Schwarzschild metrics were also checked to vanish. **[sympy-verified]** — [Carroll notes, eqs. 3.17–3.18](https://arxiv.org/abs/gr-qc/9712019)
12. **Torsion-free**: $\Gamma^\lambda_{\mu\nu}=\Gamma^\lambda_{\nu\mu}$; equivalently, the torsion $T^\lambda{}_{\mu\nu} = \Gamma^\lambda_{\mu\nu}-\Gamma^\lambda_{\nu\mu}$ vanishes (Carroll eq. 3.16). GR uses this torsion-free, metric-compatible connection (the Levi-Civita or Christoffel connection). Tong says torsion "plays no role in the theory of general relativity" — [Carroll notes, eq. 3.16](https://arxiv.org/abs/gr-qc/9712019); [Tong GR notes, §3.3](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)

**Covariant divergence and the $\ln\sqrt{|g|}$ identity** (Carroll eqs. 3.26–3.28) — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Definition: $\nabla_\mu V^\mu = \partial_\mu V^\mu + \Gamma^\mu_{\mu\lambda}V^\lambda$.
- Step 1, contract the Christoffel formula: $\Gamma^\mu_{\mu\lambda} = \tfrac12 g^{\mu\sigma}(\partial_\mu g_{\lambda\sigma} + \partial_\lambda g_{\mu\sigma} - \partial_\sigma g_{\mu\lambda})$.
- Step 2: the first and third terms cancel. Swap the dummy labels $\mu\leftrightarrow\sigma$ in the third term and use $g^{\mu\sigma} = g^{\sigma\mu}$, $g_{\mu\lambda}=g_{\lambda\mu}$: $g^{\mu\sigma}\partial_\sigma g_{\mu\lambda} = g^{\sigma\mu}\partial_\mu g_{\sigma\lambda} = g^{\mu\sigma}\partial_\mu g_{\lambda\sigma}$. So $\Gamma^\mu_{\mu\lambda} = \tfrac12 g^{\mu\sigma}\partial_\lambda g_{\mu\sigma}$.
- Step 3, for a diagonal metric (all examples here): $\det g = \prod_\mu g_{\mu\mu}$, so $\ln|\det g| = \sum_\mu\ln|g_{\mu\mu}|$, and differentiating gives $\partial_\lambda\ln|g| = \sum_\mu \frac{\partial_\lambda g_{\mu\mu}}{g_{\mu\mu}} = g^{\mu\sigma}\partial_\lambda g_{\mu\sigma}$. (For a general metric the same result is Jacobi's formula for the derivative of a determinant.)
- Result: $$\Gamma^\mu_{\mu\lambda} = \tfrac12\partial_\lambda\ln|g| = \partial_\lambda\ln\sqrt{|g|} = \frac{1}{\sqrt{|g|}}\partial_\lambda\sqrt{|g|},\qquad \nabla_\mu V^\mu = \frac{1}{\sqrt{|g|}}\partial_\mu\!\left(\sqrt{|g|}\,V^\mu\right).$$
- Checks **[sympy-verified]**:
  - polar: $\sqrt{g}=r$, so $\Gamma^\mu_{\mu r} = 1/r$;
  - sphere: $\sqrt{g}=a^2\sin\theta$, so $\Gamma^\mu_{\mu\theta}=\cot\theta$;
  - Schwarzschild with $x^0=ct$: $-g = r^4\sin^2\theta$, because the factors $(1-r_s/r)$ and $(1-r_s/r)^{-1}$ cancel; so $\Gamma^\mu_{\mu r} = 2/r$ and $\Gamma^\mu_{\mu\theta}=\cot\theta$.
- Worked example: $\vec V = x\hat x + y\hat y$ (Cartesian divergence $=2$) is $V = r\,\partial_r$ in polar coordinates ($V^r = r$, $V^\theta=0$). The naive $\partial_\mu V^\mu = 1$ is wrong. The covariant $\nabla_\mu V^\mu = \frac1r\partial_r(r\cdot r) = 2$ is right. The polar-coordinate divergence formula from electromagnetism books, $\frac1r\partial_r(rV^r)+\partial_\theta V^\theta$, is exactly this, as Carroll remarks.

**(5) Where it appears in GR.** Covariant derivatives appear in:
- conservation of energy–momentum, $\nabla_\mu T^{\mu\nu}=0$;
- Maxwell's equations in curved spacetime;
- the definition of curvature through $[\nabla_\mu,\nabla_\nu]V^\rho = R^\rho{}_{\sigma\mu\nu}V^\sigma$ (torsion-free; Carroll eq. 3.66) — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019);
- the Bianchi identity that makes the Einstein tensor divergence-free (covered in the companion notes).

#### 4. Christoffel symbols: derivation, counting, worked calculations, non-tensor character, Lagrangian shortcut

**(1) Plain language.** The Christoffel symbols $\Gamma^\lambda_{\mu\nu}$ are the "turning rates" of the coordinate basis vectors: how much basis vector $\vec e_\nu$ swings toward $\vec e_\lambda$ as you step in direction $\mu$. They are computed entirely from the metric and its first derivatives.

**(2) Why GR needs them.** They appear in every equation of motion. In the geodesic equation the term $-\Gamma^\mu_{\nu\sigma}\dot x^\nu\dot x^\sigma$ plays the role that "gravitational force per unit mass" plays in Newton (Section 6e: in the Newtonian limit $\Gamma^i_{00}\to\partial_i\Phi/c^2$). Since they can be made zero at any one point (Carroll), this "force" can always be transformed away locally: the equivalence principle — [Carroll notes, ch. 3 and eq. 4.15](https://arxiv.org/abs/gr-qc/9712019)

**(3) Derivation of the formula from metric compatibility and symmetry (all steps).** Following Carroll eqs. 3.19–3.21 — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
1. Write $\nabla g = 0$ three times with the indices cyclically permuted:
   - (A) $\nabla_\rho g_{\mu\nu} = \partial_\rho g_{\mu\nu} - \Gamma^\lambda_{\rho\mu}g_{\lambda\nu} - \Gamma^\lambda_{\rho\nu}g_{\mu\lambda} = 0$
   - (B) $\nabla_\mu g_{\nu\rho} = \partial_\mu g_{\nu\rho} - \Gamma^\lambda_{\mu\nu}g_{\lambda\rho} - \Gamma^\lambda_{\mu\rho}g_{\nu\lambda} = 0$
   - (C) $\nabla_\nu g_{\rho\mu} = \partial_\nu g_{\rho\mu} - \Gamma^\lambda_{\nu\rho}g_{\lambda\mu} - \Gamma^\lambda_{\nu\mu}g_{\rho\lambda} = 0$
2. Form (B) + (C) − (A):
   $$\partial_\mu g_{\nu\rho} + \partial_\nu g_{\rho\mu} - \partial_\rho g_{\mu\nu} - \Gamma^\lambda_{\mu\nu}g_{\lambda\rho} - \Gamma^\lambda_{\mu\rho}g_{\nu\lambda} - \Gamma^\lambda_{\nu\rho}g_{\lambda\mu} - \Gamma^\lambda_{\nu\mu}g_{\rho\lambda} + \Gamma^\lambda_{\rho\mu}g_{\lambda\nu} + \Gamma^\lambda_{\rho\nu}g_{\mu\lambda} = 0.$$
3. Use symmetry $\Gamma^\lambda_{\mu\rho}=\Gamma^\lambda_{\rho\mu}$ (and $g$ symmetric):
   - $-\Gamma^\lambda_{\mu\rho}g_{\nu\lambda}$ cancels $+\Gamma^\lambda_{\rho\mu}g_{\lambda\nu}$;
   - $-\Gamma^\lambda_{\nu\rho}g_{\lambda\mu}$ cancels $+\Gamma^\lambda_{\rho\nu}g_{\mu\lambda}$;
   - the two remaining $\Gamma$ terms are equal: $\Gamma^\lambda_{\mu\nu}g_{\lambda\rho}+\Gamma^\lambda_{\nu\mu}g_{\rho\lambda} = 2\Gamma^\lambda_{\mu\nu}g_{\lambda\rho}$.
4. So $\partial_\mu g_{\nu\rho} + \partial_\nu g_{\rho\mu} - \partial_\rho g_{\mu\nu} = 2\Gamma^\lambda_{\mu\nu}g_{\lambda\rho}$.
5. Multiply both sides by $\tfrac12 g^{\sigma\rho}$ and sum over $\rho$. Using $g^{\sigma\rho}g_{\lambda\rho} = \delta^\sigma_\lambda$ (the inverse metric, the matrix inverse from the reader's matrix section):
   $$\boxed{\Gamma^\sigma_{\mu\nu} = \tfrac12 g^{\sigma\rho}\left(\partial_\mu g_{\nu\rho} + \partial_\nu g_{\rho\mu} - \partial_\rho g_{\mu\nu}\right)}$$
   This is the same as the requested form $\Gamma^\lambda_{\mu\nu} = \tfrac12 g^{\lambda\sigma}(\partial_\mu g_{\nu\sigma}+\partial_\nu g_{\mu\sigma}-\partial_\sigma g_{\mu\nu})$ after relabelling. The derivation also shows the connection is *unique*: metric compatibility plus symmetry leave no freedom.

**Counting components.**
- A general connection has $n^3$ components (64 in 4D) — [Carroll notes, ch. 3](https://arxiv.org/abs/gr-qc/9712019).
- Symmetry in the lower pair leaves $n\cdot\frac{n(n+1)}{2} = \frac{n^2(n+1)}{2}$ independent components: **6 in 2D, 40 in 4D** **[sympy-verified arithmetic]**. The upper index takes $n$ values, and the symmetric lower pair takes $n(n+1)/2$.
- The 40 also matches Carroll's 40 first derivatives $\partial_\sigma g_{\mu\nu}$, which is why RNC can make all $\Gamma$ vanish at a point.

**Worked calculation (a): plane polar coordinates** **[sympy-verified]**. $g_{rr}=1$, $g_{\theta\theta}=r^2$; inverse $g^{rr}=1$, $g^{\theta\theta}=1/r^2$. The only nonzero metric derivative is $\partial_r g_{\theta\theta}=2r$. The six independent slots are:
- $\Gamma^r_{rr} = \tfrac12 g^{rr}(\partial_r g_{rr}+\partial_r g_{rr}-\partial_r g_{rr}) = \tfrac12(0) = 0$
- $\Gamma^r_{r\theta} = \tfrac12 g^{rr}(\partial_r g_{\theta r} + \partial_\theta g_{rr} - \partial_r g_{r\theta}) = 0$
- $\Gamma^r_{\theta\theta} = \tfrac12 g^{rr}(\partial_\theta g_{\theta r}+\partial_\theta g_{\theta r}-\partial_r g_{\theta\theta}) = \tfrac12(1)(0+0-2r) = \mathbf{-r}$
- $\Gamma^\theta_{rr} = \tfrac12 g^{\theta\theta}(2\partial_r g_{r\theta}-\partial_\theta g_{rr}) = 0$
- $\Gamma^\theta_{r\theta} = \Gamma^\theta_{\theta r} = \tfrac12 g^{\theta\theta}(\partial_r g_{\theta\theta}+\partial_\theta g_{r\theta}-\partial_\theta g_{r\theta}) = \tfrac12\cdot\frac{1}{r^2}\cdot 2r = \mathbf{\frac1r}$
- $\Gamma^\theta_{\theta\theta} = \tfrac12 g^{\theta\theta}\partial_\theta g_{\theta\theta} = 0$

Matches Carroll eqs. 3.24–3.25 — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019). The Riemann tensor computed from these is identically zero (flat plane) **[sympy-verified]**.

**Worked calculation (b): 2-sphere of radius $a$** **[sympy-verified]**. $g_{\theta\theta}=a^2$, $g_{\phi\phi}=a^2\sin^2\theta$; $g^{\theta\theta}=1/a^2$, $g^{\phi\phi}=1/(a^2\sin^2\theta)$. The only nonzero derivative is $\partial_\theta g_{\phi\phi} = 2a^2\sin\theta\cos\theta$.
- $\Gamma^\theta_{\phi\phi} = \tfrac12 g^{\theta\theta}(0+0-\partial_\theta g_{\phi\phi}) = \tfrac12\cdot\frac{1}{a^2}\cdot(-2a^2\sin\theta\cos\theta) = \mathbf{-\sin\theta\cos\theta}$
- $\Gamma^\phi_{\theta\phi}=\Gamma^\phi_{\phi\theta} = \tfrac12 g^{\phi\phi}(\partial_\theta g_{\phi\phi}) = \tfrac12\cdot\frac{1}{a^2\sin^2\theta}\cdot 2a^2\sin\theta\cos\theta = \mathbf{\cot\theta}$
- The other four ($\Gamma^\theta_{\theta\theta},\Gamma^\theta_{\theta\phi},\Gamma^\phi_{\theta\theta},\Gamma^\phi_{\phi\phi}$) vanish because every metric derivative they contain is zero.

Note that $a$ cancels: the Christoffel symbols of a sphere do not depend on its radius, but the curvature does. Riemann: $R^\theta{}_{\phi\theta\phi}=\sin^2\theta$, $R^\phi{}_{\theta\phi\theta}=1$, Ricci scalar $2/a^2$, Gaussian curvature $K=1/a^2$ **[sympy-verified]** — [Carroll notes, eqs. 3.100–3.104](https://arxiv.org/abs/gr-qc/9712019)

**Worked calculation (c): Schwarzschild in $(-,+,+,+)$, SI units with $x^0 = ct$** **[sympy-verified]**.
- Metric: $ds^2 = -f(r)\,c^2dt^2 + f(r)^{-1}dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$, with $f(r) = 1 - r_s/r$ and $r_s = 2GM/c^2$.
- Components ($x^0=ct$): $g_{00}=-f$, $g_{rr}=1/f$, $g_{\theta\theta}=r^2$, $g_{\phi\phi}=r^2\sin^2\theta$. Inverses: $g^{00}=-1/f$, $g^{rr}=f$, $g^{\theta\theta}=1/r^2$, $g^{\phi\phi}=1/(r^2\sin^2\theta)$. Useful derivative: $f'(r) = r_s/r^2$.
- Nonzero derivatives of the metric: $\partial_r g_{00} = -f'$, $\partial_r g_{rr} = -f'/f^2$, $\partial_r g_{\theta\theta}=2r$, $\partial_r g_{\phi\phi} = 2r\sin^2\theta$, $\partial_\theta g_{\phi\phi} = 2r^2\sin\theta\cos\theta$.
- The 9 independent nonzero symbols, each from $\Gamma^\lambda_{\mu\nu}=\tfrac12 g^{\lambda\lambda}(\ldots)$ (diagonal metric):
  1. $\Gamma^0_{0r} = \Gamma^0_{r0} = \tfrac12 g^{00}\partial_r g_{00} = \tfrac12\left(-\tfrac1f\right)(-f') = \dfrac{f'}{2f} = \dfrac{r_s}{2r(r-r_s)}$
  2. $\Gamma^r_{00} = \tfrac12 g^{rr}(-\partial_r g_{00}) = \tfrac12 f f' = \dfrac{r_s(r-r_s)}{2r^3}$
  3. $\Gamma^r_{rr} = \tfrac12 g^{rr}\partial_r g_{rr} = \tfrac12 f\left(-\dfrac{f'}{f^2}\right) = -\dfrac{f'}{2f} = -\dfrac{r_s}{2r(r-r_s)}$
  4. $\Gamma^r_{\theta\theta} = \tfrac12 g^{rr}(-\partial_r g_{\theta\theta}) = \tfrac12 f(-2r) = -rf = -(r-r_s)$
  5. $\Gamma^r_{\phi\phi} = \tfrac12 f(-2r\sin^2\theta) = -(r-r_s)\sin^2\theta$
  6. $\Gamma^\theta_{r\theta} = \Gamma^\theta_{\theta r} = \tfrac12\cdot\frac{1}{r^2}\cdot 2r = \dfrac1r$
  7. $\Gamma^\theta_{\phi\phi} = \tfrac12\cdot\frac1{r^2}\cdot(-2r^2\sin\theta\cos\theta) = -\sin\theta\cos\theta$
  8. $\Gamma^\phi_{r\phi}=\Gamma^\phi_{\phi r} = \tfrac12\cdot\frac{1}{r^2\sin^2\theta}\cdot 2r\sin^2\theta = \dfrac1r$
  9. $\Gamma^\phi_{\theta\phi}=\Gamma^\phi_{\phi\theta} = \tfrac12\cdot\frac{1}{r^2\sin^2\theta}\cdot 2r^2\sin\theta\cos\theta = \cot\theta$
- Counting the symmetric partners separately, that is 13 nonzero entries out of $4^3=64$, and 9 of the 40 independent slots.
- With $x^0 = t$ instead of $ct$ (seconds), only one symbol changes: $\Gamma^r_{tt} = \dfrac{c^2 r_s(r-r_s)}{2r^3} = \dfrac{GM}{r^2}\left(1-\dfrac{r_s}{r}\right)$, which is Newton's $GM/r^2$ times a relativistic factor. $\Gamma^t_{tr}$ is unchanged **[sympy-verified]**.
- In geometric units ($G=c=1$, $r_s = 2M$): $\Gamma^t_{tr} = \dfrac{M}{r(r-2M)}$, $\Gamma^r_{tt} = \dfrac{M(r-2M)}{r^3}$, $\Gamma^r_{rr} = -\dfrac{M}{r(r-2M)}$, $\Gamma^r_{\theta\theta} = -(r-2M)$, $\Gamma^r_{\phi\phi} = -(r-2M)\sin^2\theta$; the angular ones are unchanged.
- sympy also confirms that this metric has zero Ricci tensor (a vacuum solution).

**Christoffel symbols are not tensors.** The same flat plane has $\Gamma = 0$ in Cartesian coordinates and $\Gamma^r_{\theta\theta}=-r\neq0$ in polar coordinates. A tensor that vanishes in one coordinate system vanishes in all (the transformation law is linear and homogeneous), so $\Gamma$ cannot be a tensor. Its transformation law contains an extra inhomogeneous term with second derivatives $\partial^2x/\partial x'\partial x'$, which is exactly what cancels the non-tensorial part of $\partial_\mu V^\nu$ — [Carroll notes, ch. 3 ("the connection coefficients are not the components of a tensor")](https://arxiv.org/abs/gr-qc/9712019). Consequently, $\Gamma\neq0$ does **not** mean curvature (polar coordinates), and $\Gamma = 0$ at a point does **not** mean flatness (RNC). Curvature is measured by the Riemann tensor, built from $\partial\Gamma$ and $\Gamma\Gamma$.

**Physical meaning: "gravitational force-like" terms.** In the geodesic equation, $\ddot x^\mu = -\Gamma^\mu_{\nu\sigma}\dot x^\nu\dot x^\sigma$. The right side looks like a force per unit mass, quadratic in velocity. In flat polar coordinates the terms are the familiar fictitious centrifugal and Coriolis-like terms: $\ddot r = r\dot\theta^2$ (since $-\Gamma^r_{\theta\theta}\dot\theta^2 = r\dot\theta^2$) and $\ddot\theta = -\frac2r\dot r\dot\theta$. In a weak static field, $\Gamma^i_{00}c^2 = \partial_i\Phi$ is exactly Newtonian gravity (Section 6e). Gravity in GR is therefore a "fictitious force" in the same sense as centrifugal force, removable at a point by choosing freely falling (RNC) coordinates, while curvature (tides) cannot be removed — [Carroll notes, eqs. 4.10–4.20](https://arxiv.org/abs/gr-qc/9712019); [Einstein Online](https://www.einstein-online.info/en/spotlight/geometry_force/)

**The Euler–Lagrange shortcut** (Blau §3.1) — [Blau notes](http://www.blau.itp.unibe.ch/newlecturesGR.pdf) **[sympy-verified for Schwarzschild: the Euler–Lagrange equations of $L=g_{\mu\nu}\dot x^\mu\dot x^\nu$ reproduce exactly the geodesic equations with the 9 symbols above]**
1. Write $L = g_{\mu\nu}\dot x^\mu\dot x^\nu$, with dot $= d/d\lambda$.
2. For each coordinate compute $\frac{d}{d\lambda}\frac{\partial L}{\partial\dot x^\mu} - \frac{\partial L}{\partial x^\mu} = 0$.
3. Divide so that the coefficient of $\ddot x^\mu$ is 1.
4. Read off: the coefficient of $(\dot x^\nu)^2$ is $\Gamma^\mu_{\nu\nu}$, and the coefficient of $\dot x^\nu\dot x^\sigma$ with $\nu\neq\sigma$ is $2\Gamma^\mu_{\nu\sigma}$ (Blau's factor-of-2 warning).

*Polar example.* $L=\dot r^2 + r^2\dot\theta^2$.
- $r$-equation: $\frac{d}{d\lambda}(2\dot r) - 2r\dot\theta^2 = 0$, so $\ddot r - r\dot\theta^2=0$. This gives $\Gamma^r_{\theta\theta}=-r$.
- $\theta$-equation: $\frac{d}{d\lambda}(2r^2\dot\theta)=0$, so $2r^2\ddot\theta + 4r\dot r\dot\theta = 0$, so $\ddot\theta + \frac2r\dot r\dot\theta = 0$. Then $2\Gamma^\theta_{r\theta} = 2/r$, so $\Gamma^\theta_{r\theta} = 1/r$.

*Sphere example.* $L = a^2\dot\theta^2 + a^2\sin^2\theta\,\dot\phi^2$.
- $\theta$-equation: $\ddot\theta - \sin\theta\cos\theta\,\dot\phi^2 = 0$, so $\Gamma^\theta_{\phi\phi} = -\sin\theta\cos\theta$.
- $\phi$-equation: $\frac{d}{d\lambda}(\sin^2\theta\,\dot\phi) = 0$, so $\ddot\phi + 2\cot\theta\,\dot\theta\dot\phi=0$. Then $2\Gamma^\phi_{\theta\phi} = 2\cot\theta$.

*Schwarzschild, $t$ and $r$ equations ($x^0 = ct$, prime $= d/dr$).*
- $t$-equation: $\frac{d}{d\lambda}(-2f\dot x^0) = 0$ gives $f\ddot x^0 + f'\dot r\dot x^0 = 0$, so $\ddot x^0 + \frac{f'}{f}\dot r\dot x^0 = 0$ and $\Gamma^0_{0r} = \frac{f'}{2f}$.
- $r$-equation: $\frac{d}{d\lambda}\left(\frac{2\dot r}{f}\right) - \left[-f'(\dot x^0)^2 - \frac{f'}{f^2}\dot r^2 + 2r\dot\theta^2 + 2r\sin^2\theta\,\dot\phi^2\right] = 0$. Expand $\frac{d}{d\lambda}(2\dot r/f) = \frac{2\ddot r}{f} - \frac{2f'\dot r^2}{f^2}$, then multiply by $f/2$:
  $$\ddot r + \tfrac12 ff'(\dot x^0)^2 - \frac{f'}{2f}\dot r^2 - rf\dot\theta^2 - rf\sin^2\theta\,\dot\phi^2 = 0.$$
  This yields $\Gamma^r_{00}=\tfrac12ff'$, $\Gamma^r_{rr} = -f'/(2f)$, $\Gamma^r_{\theta\theta} = -rf$, $\Gamma^r_{\phi\phi} = -rf\sin^2\theta$, matching the list above.

**(5) Where Christoffels appear in GR.**
- The geodesic equation and the parallel-transport equation.
- Every covariant derivative, including $\nabla_\mu T^{\mu\nu}=0$.
- The Riemann tensor $R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\ldots$ (Carroll eq. 3.67), and from it the Ricci tensor and the Einstein field equations — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)

#### 5. Parallel transport

**(1) Plain language and analogy.** Parallel transport is "carry an arrow along a path without turning it", where "without turning" means relative to the surface itself, not to some outside space. On a flat sheet, carrying an arrow around any loop brings it back unchanged. On a sphere it comes back rotated. Pössel's picture: carry an arrow around a triangle made of the equator and two meridians and it returns turned by 90°. That leftover rotation (the **holonomy**) is a fingerprint of curvature — [Einstein Online, geodetic precession](https://www.einstein-online.info/en/spotlight/geodetic_precession/); [Tong GR notes, §3.3](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)

**(2) Why GR needs it.** (a) A freely falling gyroscope's spin axis is parallel-transported along its worldline. In curved spacetime it therefore ends up pointing in a slightly different direction: geodetic precession, measured by Gravity Probe B (Key Question 3). (b) It defines geodesics (curves that parallel-transport their own velocity). (c) Its path dependence around small loops *defines* the Riemann tensor — [Einstein Online](https://www.einstein-online.info/en/spotlight/geodetic_precession/); [Carroll notes, ch. 3](https://arxiv.org/abs/gr-qc/9712019)

**(3) Mechanics, step by step.**
1. Path $x^\mu(\lambda)$ with tangent $dx^\sigma/d\lambda$. The directional covariant derivative along it is $\frac{D}{d\lambda} = \frac{dx^\sigma}{d\lambda}\nabla_\sigma$ (Carroll eq. 3.30).
2. Parallel transport means $\frac{DV^\mu}{d\lambda} = 0$ along the path (eq. 3.31). Expanding $\nabla_\sigma V^\mu$ and using the chain rule $\frac{dx^\sigma}{d\lambda}\partial_\sigma V^\mu = \frac{dV^\mu}{d\lambda}$ gives
   $$\boxed{\frac{dV^\mu}{d\lambda} + \Gamma^\mu_{\nu\sigma}\frac{dx^\nu}{d\lambda}V^\sigma = 0}$$
   (eq. 3.32). This is a first-order ODE: given $V$ at the start, the result along the whole path is unique.
3. Metric compatibility preserves $g_{\mu\nu}V^\mu W^\nu$, so lengths and angles are unchanged (eqs. 3.33–3.34) — [Carroll notes, pp. 65–66](https://arxiv.org/abs/gr-qc/9712019)
4. Around an infinitesimal loop spanned by vectors $A$, $B$ (sides $\delta a$, $\delta b$), the change is $\delta V^\rho = (\delta a)(\delta b)A^\nu B^\mu R^\rho{}_{\sigma\mu\nu}V^\sigma$ (eq. 3.90 in the ar5iv rendering). Holonomy is curvature times enclosed area — [Carroll notes, ch. 3, ar5iv rendering](https://ar5iv.labs.arxiv.org/html/gr-qc/9712019)

**(4) Worked examples.**
- *Example 5.1: flat plane, polar coordinates (no holonomy).* Carry $\hat x$ around the circle $r=R$, $\theta=\lambda$, so $\dot r = 0$ and $\dot\theta = 1$. Components: $V^r = \cos\theta$, $V^\theta = -\sin\theta/R$.
  - $r$-equation: $\frac{dV^r}{d\lambda} + \Gamma^r_{\theta\theta}\dot\theta V^\theta = -\sin\theta + (-R)(1)(-\sin\theta/R) = 0$.
  - $\theta$-equation: $\frac{dV^\theta}{d\lambda} + \Gamma^\theta_{\theta r}\dot\theta V^r = -\cos\theta/R + (1/R)\cos\theta = 0$.

  Both are satisfied, so the transported vector is $\hat x$ all the way round. The *components* change continuously, yet after $\theta = 2\pi$ they return to the start: zero holonomy in flat space **[sympy-verified as $\nabla V=0$]**.
- *Example 5.2: around a latitude circle on a sphere* **[sympy-verified: exact ODE solution; independently checked by numerical transport in 3D embedding]**.
  1. Path: $\theta = \theta_0$ (fixed colatitude), $\phi = \lambda$ from $0$ to $2\pi$, so $\dot\theta = 0$ and $\dot\phi = 1$.
  2. Equations, using the only relevant Christoffels $\Gamma^\theta_{\phi\phi}=-\sin\theta_0\cos\theta_0$ and $\Gamma^\phi_{\phi\theta}=\cot\theta_0$:
     $$\frac{dV^\theta}{d\lambda} - \sin\theta_0\cos\theta_0\,V^\phi = 0,\qquad \frac{dV^\phi}{d\lambda} + \cot\theta_0\,V^\theta = 0.$$
  3. Differentiate the first and substitute the second: $\frac{d^2V^\theta}{d\lambda^2} = \sin\theta_0\cos\theta_0\frac{dV^\phi}{d\lambda} = -\sin\theta_0\cos\theta_0\cot\theta_0\,V^\theta = -\cos^2\theta_0\,V^\theta$. This is simple harmonic motion with angular frequency $\omega = \cos\theta_0$.
  4. Start pointing due south: $V^\theta(0) = 1$, $V^\phi(0)=0$. Solution: $V^\theta = \cos(\lambda\cos\theta_0)$ and $V^\phi = -\dfrac{\sin(\lambda\cos\theta_0)}{\sin\theta_0}$ (sympy `dsolve` gives exactly this).
  5. Length check: $g_{\theta\theta}(V^\theta)^2 + g_{\phi\phi}(V^\phi)^2 = a^2\cos^2(\ldots) + a^2\sin^2\theta_0\cdot\frac{\sin^2(\ldots)}{\sin^2\theta_0} = a^2$, constant as promised.
  6. Convert to unit (orthonormal) south and east components: $V^{\hat\theta} = aV^\theta$ and $V^{\hat\phi} = a\sin\theta_0V^\phi$, so $(V^{\hat\theta},V^{\hat\phi}) = a\left(\cos(\lambda\cos\theta_0),\ -\sin(\lambda\cos\theta_0)\right)$. Relative to the local south/east directions, the arrow turns steadily at rate $\cos\theta_0$ per radian of longitude, in the clockwise sense seen from outside.
  7. After one full loop ($\lambda = 2\pi$) the local frame is back where it started, so the arrow has rotated by $-2\pi\cos\theta_0$, which is the same as rotating by
     $$\boxed{\Delta\alpha = 2\pi(1-\cos\theta_0)}$$
     in the counterclockwise sense (the sense of travel).
  8. Gauss–Bonnet check: the enclosed polar cap has area $2\pi a^2(1-\cos\theta_0)$, so $\Delta\alpha = \text{area}/a^2 = \int K\,dA$ with $K=1/a^2$.
  9. Numbers **[sympy/numpy-verified]**:
     - $\theta_0 = 30°$ (latitude 60°N): 48.23°.
     - $\theta_0 = 45°$: 105.44° (equivalently −254.56°).
     - $\theta_0 = 60°$ (latitude 30°N): exactly 180°.
     - $\theta_0 = 90°$ (equator): $2\pi \equiv 0$. The equator is a geodesic, and an arrow carried along it returns unchanged.
     - Small circles near the pole ($\theta_0\to0$): $\Delta\alpha\approx\pi\theta_0^2 = $ area$/a^2\to0$.
- *Example 5.3: the "three right angles" triangle* **[numpy-verified by transport in 3D embedding: final rotation 90.0°]**.
  1. Start at the north pole with an arrow pointing down the $\phi=0$ meridian.
  2. Leg 1, along that meridian to the equator: the arrow is the tangent of a geodesic, so it stays tangent and arrives pointing due south.
  3. Leg 2, east along the equator to $\phi = 90°$: the equator is a geodesic, and parallel transport preserves angles, so the arrow stays perpendicular to the path (still due south).
  4. Leg 3, north along the $\phi=90°$ meridian back to the pole: the arrow stays anti-parallel to the direction of travel. It arrives pointing down the $\phi=90°$ meridian, rotated **90°** from the start.
  5. Check: each corner is 90°, so the angle sum is 270° and the angle excess is $270°-180° = 90° = \pi/2$. The triangle encloses one-eighth of the sphere, area $4\pi a^2/8 = \pi a^2/2$, so area$/a^2 = \pi/2$. Excess = holonomy = area$/a^2$. This matches Pössel's 90° example — [Einstein Online](https://www.einstein-online.info/en/spotlight/geodetic_precession/)

**(5) Where it appears in GR.**
- Gyroscope spin (geodetic precession). Strictly, an accelerated gyroscope uses Fermi–Walker transport, but for free fall this reduces to parallel transport.
- The geodesic equation, which is parallel transport of the tangent.
- The Riemann tensor via loops and commutators (Carroll eq. 3.66).
- Comparing vectors along light rays, for example redshift and polarisation transport.

#### 6. Geodesics and the geodesic equation

**(1) Plain language and analogy.** A geodesic is the straightest possible path in a curved space: on a sphere, a great circle (airline routes). In spacetime, a freely falling body (planet, photon, astronaut) follows a geodesic. Gravity is not a force bending the path; the "straight" paths themselves are curved by geometry. Einstein Online: gravity "re-defines what it means to move on a straightest possible line" — [Einstein Online](https://www.einstein-online.info/en/spotlight/geometry_force/)

**(2) Why GR needs it.** It is GR's law of motion for free particles and light: planetary orbits, light bending, photon spheres, accretion-disc edges (ISCO), the Newtonian limit.

**(3a) Mechanics: "straightest" definition.** Require the tangent $u^\mu = dx^\mu/d\lambda$ to be parallel-transported along itself. Substitute $V^\mu = dx^\mu/d\lambda$ into the parallel-transport equation:
$$\boxed{\frac{d^2x^\mu}{d\lambda^2} + \Gamma^\mu_{\nu\sigma}\frac{dx^\nu}{d\lambda}\frac{dx^\sigma}{d\lambda} = 0}$$
(Carroll eq. 3.47). In Cartesian coordinates of flat space $\Gamma = 0$ and $d^2x^\mu/d\lambda^2 = 0$: straight lines — [Carroll notes, p. 68](https://arxiv.org/abs/gr-qc/9712019)

**(3b) Mechanics: extremal proper time, via the Euler–Lagrange equation.**
1. Proper time along a timelike path is $\tau = \int\sqrt{-g_{\mu\nu}\frac{dx^\mu}{d\lambda}\frac{dx^\nu}{d\lambda}}\,d\lambda$ (Carroll eq. 3.48, $c=1$). Geodesics make it stationary; timelike geodesics locally *maximise* it (twin paradox) — [Carroll notes, pp. 69–71](https://arxiv.org/abs/gr-qc/9712019)
2. **The Euler–Lagrange equation explained** (calculus of variations). For a functional $S[x] = \int_{\lambda_1}^{\lambda_2}L(x,\dot x)\,d\lambda$:
   - Vary the path, $x\to x+\delta x$, with $\delta x=0$ at both ends. To first order, $\delta S = \int\left(\frac{\partial L}{\partial x}\delta x + \frac{\partial L}{\partial\dot x}\delta\dot x\right)d\lambda$.
   - Integrate the second term by parts (Calculus II): $\int\frac{\partial L}{\partial\dot x}\frac{d(\delta x)}{d\lambda}d\lambda = \left[\frac{\partial L}{\partial\dot x}\delta x\right]_{\lambda_1}^{\lambda_2} - \int\frac{d}{d\lambda}\left(\frac{\partial L}{\partial\dot x}\right)\delta x\,d\lambda$. The boundary term is zero.
   - So $\delta S = \int\left[\frac{\partial L}{\partial x} - \frac{d}{d\lambda}\frac{\partial L}{\partial\dot x}\right]\delta x\,d\lambda$. For this to vanish for *every* $\delta x$, the bracket must vanish:
     $$\frac{d}{d\lambda}\left(\frac{\partial L}{\partial\dot x^\mu}\right) - \frac{\partial L}{\partial x^\mu} = 0 .$$

   (Carroll does this variation directly on $\tau$, eqs. 3.48–3.56.)
3. **Why $L = g_{\mu\nu}\dot x^\mu\dot x^\nu$ works without the square root.** If $\lambda$ is affine, $L$ is constant along solutions, and the Euler–Lagrange equations for $f(L)$ and $L$ then give the same paths. Blau discusses both points (the constancy of $L$, and comparing E–L equations for $f(L)$ with those for $L$) — [Blau notes, §2](http://www.blau.itp.unibe.ch/newlecturesGR.pdf)
4. Apply it, index by index:
   - $\frac{\partial L}{\partial\dot x^\sigma} = 2g_{\sigma\nu}\dot x^\nu$ (two terms, because $\dot x^\sigma$ appears in both slots).
   - $\frac{d}{d\lambda}(2g_{\sigma\nu}\dot x^\nu) = 2g_{\sigma\nu}\ddot x^\nu + 2\partial_\rho g_{\sigma\nu}\dot x^\rho\dot x^\nu$ (chain rule: $\frac{dg}{d\lambda} = \partial_\rho g\,\dot x^\rho$).
   - $\frac{\partial L}{\partial x^\sigma} = \partial_\sigma g_{\rho\nu}\dot x^\rho\dot x^\nu$.
   - Euler–Lagrange: $2g_{\sigma\nu}\ddot x^\nu + 2\partial_\rho g_{\sigma\nu}\dot x^\rho\dot x^\nu - \partial_\sigma g_{\rho\nu}\dot x^\rho\dot x^\nu = 0$.
   - Symmetrise the middle term (since $\dot x^\rho\dot x^\nu$ is symmetric): $2\partial_\rho g_{\sigma\nu}\dot x^\rho\dot x^\nu = (\partial_\rho g_{\sigma\nu} + \partial_\nu g_{\sigma\rho})\dot x^\rho\dot x^\nu$.
   - Multiply by $\tfrac12g^{\lambda\sigma}$:
     $$\ddot x^\lambda + \tfrac12g^{\lambda\sigma}(\partial_\rho g_{\sigma\nu}+\partial_\nu g_{\sigma\rho}-\partial_\sigma g_{\rho\nu})\dot x^\rho\dot x^\nu = \ddot x^\lambda + \Gamma^\lambda_{\rho\nu}\dot x^\rho\dot x^\nu = 0 .$$

   Both definitions agree, which is why the metric connection is the natural one. **[sympy-verified for Schwarzschild]**

**(3c) Affine parameters; timelike vs null.**
- The geodesic equation in the form above holds only for affine parameters $\lambda = a\tau + b$ (Carroll eq. 3.58). Any other parameter adds a term $\propto dx^\mu/d\alpha$ (eq. 3.59) — [Carroll notes, pp. 70–71](https://arxiv.org/abs/gr-qc/9712019)
- Timelike geodesics (massive particles): use $\lambda = \tau$, with $g_{\mu\nu}\dot x^\mu\dot x^\nu = -c^2$ (SI, $x^0 = ct$, $\tau$ in seconds) or $-1$ ($G=c=1$).
- Null geodesics (light): $d\tau = 0$, so proper time cannot be the parameter. Use an affine $\lambda$ with $g_{\mu\nu}\dot x^\mu\dot x^\nu = 0$. Carroll notes the geodesic equation derived for timelike paths "will turn out to be good for any path" — [Carroll notes, p. 69](https://arxiv.org/abs/gr-qc/9712019)

**(4) Worked examples.**
- *6a. Straight lines in polar coordinates* **[sympy-verified]**.
  1. Geodesic equations (from $\Gamma^r_{\theta\theta}=-r$, $\Gamma^\theta_{r\theta}=1/r$): $\ddot r - r\dot\theta^2 = 0$ and $\ddot\theta + \frac2r\dot r\dot\theta = 0$.
  2. Test the line $x = b$, $y = s$ (arc-length parameter $s$): $r = \sqrt{b^2+s^2}$, $\theta = \arctan(s/b)$.
  3. Derivatives: $\dot r = s/r$; $\ddot r = \frac{r - s\cdot(s/r)}{r^2} = \frac{r^2-s^2}{r^3} = \frac{b^2}{r^3}$; $\dot\theta = \frac{1/b}{1+s^2/b^2} = \frac{b}{r^2}$; $\ddot\theta = -\frac{2b\dot r}{r^3} = -\frac{2bs}{r^4}$.
  4. First equation: $\ddot r - r\dot\theta^2 = \frac{b^2}{r^3} - r\frac{b^2}{r^4} = 0$.
  5. Second equation: $\ddot\theta + \frac2r\dot r\dot\theta = -\frac{2bs}{r^4} + \frac2r\cdot\frac sr\cdot\frac b{r^2} = 0$.
  6. Bonus: the $\theta$ equation is $\frac{d}{ds}(r^2\dot\theta) = 0$, and indeed $r^2\dot\theta = b$ is constant (angular momentum per unit mass, impact parameter $b$). A straight line looks curved in polar language, and the $\Gamma$ terms are what make it come out straight.
- *6b. Great circles on the sphere* **[sympy-verified, including a tilted great circle checked numerically at random points]**.
  1. Geodesic equations: $\ddot\theta - \sin\theta\cos\theta\,\dot\phi^2 = 0$ and $\ddot\phi + 2\cot\theta\,\dot\theta\dot\phi = 0$ — [Tong GR notes, p. 129](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
  2. Meridian $\phi = $ const, $\theta = s/a$: $\ddot\theta = 0$, and both $\dot\phi$ terms vanish. It is a geodesic.
  3. Equator $\theta=\pi/2$, $\phi = s/a$: $\sin\theta\cos\theta = 0$ and $\dot\theta = 0$, so both equations hold. It is a geodesic.
  4. Latitude circle $\theta=\theta_0\neq\pi/2$, $\phi = s/(a\sin\theta_0)$: $\ddot\theta = 0$ but $\sin\theta_0\cos\theta_0\dot\phi^2\neq0$. It is **not** a geodesic (Tong: "this solution doesn't work for other values of $\theta$"). A plane flying due west along a latitude circle is not on the shortest route.
  5. Every rotation of the equator (a tilted great circle) also satisfies the equations.
  6. The second equation says $\frac{d}{ds}(\sin^2\theta\,\dot\phi)=0$, a conserved "angular momentum" (Clairaut's relation).
- *6c. Radial free fall in Schwarzschild (SI, $x^0=ct$, $\tau$ in seconds, so $\dot x^0 = c\,dt/d\tau$)* **[sympy-verified]**.
  1. $t$-equation as a conservation law: $\frac{d}{d\tau}\left(f\frac{dt}{d\tau}\right)=0$, so $e \equiv f\frac{dt}{d\tau}$ is constant. Dropping from rest at infinity gives $e = 1$.
  2. Normalisation for radial motion: $-fc^2\left(\frac{dt}{d\tau}\right)^2 + \frac1f\left(\frac{dr}{d\tau}\right)^2 = -c^2$.
  3. Substitute $dt/d\tau = e/f$: $-\frac{c^2e^2}{f} + \frac1f\dot r^2 = -c^2$. Multiply by $f$: $\dot r^2 = c^2(e^2 - f)$.
  4. With $e=1$: $\dot r^2 = c^2\cdot\frac{r_s}{r} = \frac{2GM}{r}$. This is *identical in form* to the Newtonian energy equation for a body dropped from rest at infinity, $v^2 = 2GM/r$.
  5. Differentiate in $\tau$: $2\dot r\ddot r = -\frac{2GM}{r^2}\dot r$, so $$\frac{d^2r}{d\tau^2} = -\frac{GM}{r^2}$$ exactly. (The same follows directly from the geodesic equation: $\ddot r = -\Gamma^r_{00}(\dot x^0)^2 - \Gamma^r_{rr}\dot r^2$ simplifies to $-c^2r_s/(2r^2) = -GM/r^2$.)
  6. Caution for the reader: $r$ is the Schwarzschild "areal" coordinate (circumference$/2\pi$), not a ruler distance from the centre, and $\tau$ is the faller's own clock. The Newtonian look is a coincidence of these particular variables.
- *6d. Circular orbits, photon sphere and ISCO.* **Units switch here: first SI, then geometric units $G=c=1$.**
  1. (SI, from the geodesic equation directly.) For a circular equatorial orbit $\ddot r=\dot r = 0$ and $\theta=\pi/2$, so the $r$-equation reduces to $\Gamma^r_{tt}\dot t^2 + \Gamma^r_{\phi\phi}\dot\phi^2 = 0$. Then $\left(\frac{d\phi}{dt}\right)^2 = -\frac{\Gamma^r_{tt}}{\Gamma^r_{\phi\phi}} = \frac{c^2r_s(r-r_s)/(2r^3)}{(r-r_s)} = \frac{GM}{r^3}$. This is Kepler's third law, exact in Schwarzschild coordinate time **[sympy-verified]**.
  2. Photon sphere. Light has $ds^2=0$: $-fc^2dt^2 + r^2d\phi^2 = 0$, so $(d\phi/dt)^2 = fc^2/r^2$. Setting this equal to $GM/r^3$ gives $c^2(1-\frac{2GM}{c^2r}) = \frac{GM}{r}$, so $c^2 = \frac{3GM}{r}$, so $$r_{\rm ph} = \frac{3GM}{c^2} = 1.5\,r_s.$$
  3. Massive particles need $\left(\frac{dt}{d\tau}\right)^2 = \frac{c^2}{c^2 - 3GM/r}$ (from normalisation), so circular timelike orbits exist only for $r > 3GM/c^2$.
  4. (Now geometric units, $G=c=1$.) Conserved $E = (1-2M/r)\dot t$ and $L = r^2\dot\phi$. Normalisation gives $\dot r^2 = E^2 - V_{\rm eff}(r)$ with $V_{\rm eff} = \left(1-\frac{2M}{r}\right)\left(1+\frac{L^2}{r^2}\right)$.
  5. Circular orbit: $V_{\rm eff}'(r)=0$, so $L^2 = \frac{Mr^2}{r-3M}$.
  6. Stability: $V_{\rm eff}'' \propto \frac{2M(r-6M)}{r^3(r-3M)}$. Orbits are stable for $r>6M$, unstable for $3M<r<6M$, and the marginal case is $$r_{\rm ISCO} = 6M\ (=6GM/c^2 = 3r_s).$$
  7. Energy per unit rest mass at the ISCO: $E = 2\sqrt2/3 \approx 0.9428$, so $1-E\approx5.7\%$ of the rest-mass energy is released by matter spiralling down to the ISCO.
  8. For light, $V_{\rm null} = (1-2M/r)/r^2$ has its maximum at $r = 3M$ (the unstable photon orbit).

  All **[sympy-verified]**. Consistent with Carroll eqs. 7.51 and 7.55 and Tong eq. 1.46 — [Carroll notes, ch. 7](https://arxiv.org/abs/gr-qc/9712019); [Tong GR notes](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- *6e. Newtonian limit (outline, Carroll eqs. 4.10–4.20)* — [Carroll notes, pp. 105–106](https://arxiv.org/abs/gr-qc/9712019)
  1. Slow motion, $dx^i/d\tau \ll c\,dt/d\tau$: keep only the $\Gamma^\mu_{00}(dx^0/d\tau)^2$ term, giving $\frac{d^2x^\mu}{d\tau^2} + \Gamma^\mu_{00}\left(\frac{dx^0}{d\tau}\right)^2 = 0$.
  2. Static field ($\partial_0 g = 0$): $\Gamma^\mu_{00} = -\tfrac12 g^{\mu\lambda}\partial_\lambda g_{00}$.
  3. Weak field: $g_{\mu\nu} = \eta_{\mu\nu}+h_{\mu\nu}$ with $|h|\ll1$, so to first order $\Gamma^\mu_{00} = -\tfrac12\eta^{\mu\lambda}\partial_\lambda h_{00}$.
  4. The $\mu=0$ component gives $d^2t/d\tau^2=0$, so $dt/d\tau$ is constant and $\tau$ can be traded for $t$.
  5. The $\mu=i$ components give $\frac{d^2x^i}{dt^2} = \tfrac12c^2\partial_ih_{00}$.
  6. Match to Newton $\frac{d^2x^i}{dt^2} = -\partial_i\Phi$: this requires $h_{00} = -2\Phi/c^2$, i.e. $g_{00} = -(1+2\Phi/c^2)$ ($x^0=ct$).
  7. sympy confirms that for $g_{tt} = -(1+2\Phi/c^2)c^2$ (with $x^0=t$), $\Gamma^X_{tt} = \frac{c^2\,\partial_X\Phi}{c^2-2\Phi}\to\partial_X\Phi$ to first order **[sympy-verified]**.
  8. Size at Earth's surface: $|\Phi|/c^2 = GM/(Rc^2)\approx7.0\times10^{-10}$ (my calculation with [NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) values). Everyday gravity is a part-per-billion distortion of $g_{00}$, i.e. of the rate of time.

**(5) Where geodesics appear in GR.** Equations of motion of test bodies and light: perihelion precession, light deflection, Shapiro delay, orbits around black holes. $r_{\rm ISCO}$ marks the inner edge of accretion discs, and the photon sphere shapes black-hole images (Tong) — [Tong GR notes, §1.3](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)

#### 7. Geodesic deviation

**(1) Plain language and analogy.** Two travellers start at the equator a short distance apart, both heading due north, perfectly parallel. Neither ever turns, yet they get closer and meet at the North Pole. No force pushed them together; the curvature of the surface did. In spacetime the same thing happens to two freely falling balls. In a falling elevator they drift together sideways, and if one is above the other they drift apart. That relative acceleration is the **tidal force**, and the equation that predicts it is the geodesic deviation equation — [Carroll notes, p. 85](https://arxiv.org/abs/gr-qc/9712019); [Einstein Online](https://www.einstein-online.info/en/spotlight/geometry_force/)

**(2) Why GR needs it.** The equivalence principle lets you remove gravity at a point, but not its *variation* across a region. Geodesic deviation is the part of gravity that cannot be transformed away, and it is how curvature is physically measured: tides, spaghettification near black holes, and gravitational-wave detectors — [Carroll notes, eq. 3.113](https://arxiv.org/abs/gr-qc/9712019); [Tong GR notes, §5.2](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)

**(3) Mechanics, step by step.**
1. Take a one-parameter family of geodesics $x^\mu(s,\tau)$, where $s$ labels the geodesic and $\tau$ is the affine parameter along it.
2. Tangent $u^\mu = T^\mu = \partial x^\mu/\partial\tau$; separation (deviation) vector $\xi^\mu = S^\mu = \partial x^\mu/\partial s$ (Carroll eqs. 3.107–3.108).
3. Relative velocity $\frac{D\xi^\mu}{d\tau}=u^\rho\nabla_\rho\xi^\mu$; relative acceleration $\frac{D^2\xi^\mu}{d\tau^2}$ (eqs. 3.109–3.110).
4. Using (i) $[S,T]=0$ (they are coordinate vectors), (ii) zero torsion, (iii) the geodesic equation $u^\rho\nabla_\rho u^\mu=0$, and (iv) the commutator $[\nabla_\rho,\nabla_\sigma]u^\mu = R^\mu{}_{\nu\rho\sigma}u^\nu$, Carroll obtains in five lines (eq. 3.112):
   $$\boxed{\frac{D^2\xi^\mu}{d\tau^2} = R^\mu{}_{\nu\rho\sigma}\,u^\nu u^\rho\xi^\sigma}\qquad\text{(Carroll eq. 3.113; Tong eq. 3.36)}$$
   with the Riemann convention $R^\rho{}_{\sigma\mu\nu} = \partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$ — [Carroll notes, pp. 86–88](https://arxiv.org/abs/gr-qc/9712019); [Tong GR notes, eqs. 3.36, 3.39](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
5. **Sign and convention notes.**
   - Because $R^\mu{}_{\nu\rho\sigma} = -R^\mu{}_{\nu\sigma\rho}$, the same equation can be written $\frac{D^2\xi^\mu}{d\tau^2} = -R^\mu{}_{\nu\sigma\rho}u^\nu\xi^\sigma u^\rho$. This is the "$+R\,u\,\xi\,u = 0$" form attributed to MTW and Hartle (my recollection, unverified; see Gaps).
   - Books with the *opposite overall Riemann sign* (Weinberg, per secondary sources) have a minus sign in front.
   - Practical check for any book: with its conventions, does the sphere come out with positive curvature (Blau's check), and do meridians *converge*? If the formula predicts diverging meridians, a sign is off — [Blau notes, §8.3](http://www.blau.itp.unibe.ch/newlecturesGR.pdf); [Maxima list (secondary)](https://maxima.sourceforge.io/ext/list_archives/2007/msg04992.html)
6. **In a local orthonormal frame of the faller** ($u = e_{\hat0}$, so $u^\mu = (1,0,0,0)$ when $x^0 = ct$ and $\tau$ is measured in length units): $\frac{D^2\xi^{\hat i}}{d\tau^2} = R^{\hat i}{}_{\hat0\hat0\hat j}\xi^{\hat j} = -R^{\hat i}{}_{\hat0\hat j\hat0}\,\xi^{\hat j}$. Multiply by $c^2$ to convert to $\tau$ in seconds.

**(4) Worked examples.**
- *7a. Meridians on a sphere: $\xi'' = -\xi/a^2$* **[sympy-verified]**.
  1. Geometry first. Meridians at longitudes $0$ and $\Delta\phi$ are separated, at colatitude $\theta$, by the arc $\xi = a\,\Delta\phi\,\sin\theta$.
  2. Measure arc length $s$ northward from the equator: $\theta = \pi/2 - s/a$, so $\sin\theta = \cos(s/a)$ and $$\xi(s) = \xi_0\cos(s/a),\quad \xi_0 = a\Delta\phi .$$
  3. Differentiate twice: $\xi'' = -\frac{1}{a^2}\xi_0\cos(s/a) = -\frac{\xi}{a^2}$.
  4. Now from the deviation equation. Along a meridian the unit tangent is $e_{\hat\theta}$ (with $d\theta/ds = 1/a$), and the unit east vector $e_{\hat\phi}$ is perpendicular to it. In 2D, a vector kept perpendicular to a geodesic is parallel-transported, so $D^2\xi^{\hat\phi}/ds^2 = d^2\xi/ds^2$.
  5. The orthonormal curvature component is $R^{\hat\phi}{}_{\hat\theta\hat\phi\hat\theta} = (a\sin\theta)\,R^\phi{}_{\theta\phi\theta}\,\frac1a\cdot\frac1{a\sin\theta}\cdot\frac1a = \frac1{a^2}$, using $R^\phi{}_{\theta\phi\theta} = 1$ from sympy. This is the Gaussian curvature $K$.
  6. Equation: $\frac{d^2\xi}{ds^2} = R^{\hat\phi}{}_{\hat\theta\hat\theta\hat\phi}\xi = -R^{\hat\phi}{}_{\hat\theta\hat\phi\hat\theta}\xi = -\frac{\xi}{a^2}$. This agrees with the geometry, and the minus sign means convergence.
  7. Initially parallel ($\xi'(0)=0$) meridians meet after $s = \pi a/2$: about 10,008 km on a spherical Earth of radius 6371 km (my calculation). Tong does the same example measuring from the pole: $s(\tau) = r\phi\sin(v\tau)$, $\ddot s = -v^2s$ — [Tong GR notes, eqs. 3.37–3.38](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- *7b. The Newtonian tidal tensor.*
  1. Two particles at $\vec x$ and $\vec x+\vec\xi$ obey $\ddot x^i = -\partial_i\Phi(\vec x)$ and $\ddot x^i + \ddot\xi^i = -\partial_i\Phi(\vec x+\vec\xi)$.
  2. Taylor-expand to first order: $\partial_i\Phi(\vec x+\vec\xi)\approx\partial_i\Phi(\vec x) + \xi^j\partial_j\partial_i\Phi$.
  3. Subtract: $$\frac{d^2\xi^i}{dt^2} = -\left(\partial_i\partial_j\Phi\right)\xi^j .$$ The matrix $\partial_i\partial_j\Phi$ is the **Newtonian tidal tensor**.
  4. For a point mass, $\Phi = -GM/r$, so $\partial_i\Phi = GMx_i/r^3$ and $\partial_i\partial_j\Phi = \frac{GM}{r^3}\left(\delta_{ij} - \frac{3x_ix_j}{r^2}\right)$.
  5. Along the radial direction (take $\vec x = (r,0,0)$): $\partial_x\partial_x\Phi = \frac{GM}{r^3}(1-3) = -\frac{2GM}{r^3}$, so $\ddot\xi_{\rm radial} = +\frac{2GM}{r^3}\xi$ (stretching).
  6. Transverse: $\partial_y\partial_y\Phi = \frac{GM}{r^3}$, so $\ddot\xi_\perp = -\frac{GM}{r^3}\xi$ (squeezing).
  7. The trace is $\nabla^2\Phi = 0$ in vacuum: volume-preserving stretch and squeeze (my derivation; standard).
- *7c. Schwarzschild: GR reproduces the tidal tensor exactly* **[sympy-verified]**.
  1. In the static observer's orthonormal frame ($x^0=ct$), sympy gives $R^{\hat r}{}_{\hat0\hat r\hat0} = -\frac{r_s}{r^3}$ and $R^{\hat\theta}{}_{\hat0\hat\theta\hat0} = R^{\hat\phi}{}_{\hat0\hat\phi\hat0} = +\frac{r_s}{2r^3}$.
  2. The deviation equation (×$c^2$, $\tau$ in seconds) then gives
     $$\frac{D^2\xi^{\hat r}}{d\tau^2} = +\frac{c^2r_s}{r^3}\xi^{\hat r} = +\frac{2GM}{r^3}\xi^{\hat r},\qquad \frac{D^2\xi^{\hat\theta}}{d\tau^2} = -\frac{GM}{r^3}\xi^{\hat\theta}.$$
  3. These are identical to the Newtonian results in 7b. In this frame $R^{\hat i}{}_{\hat0\hat j\hat0} = \partial_i\partial_j\Phi/c^2$ component by component.
  4. Vacuum $R_{\hat0\hat0} = 0$ (Ricci-flat, sympy-verified) corresponds to $\nabla^2\Phi = 0$.
  5. Dray finds the same $+2m/r^3$ (radial) and $-m/r^3$ (transverse) in the radially freely falling ("rain") frame, $G=c=1$. These components do not change under radial boosts — [Dray, GGR "Tidal Forces"](https://sites.science.oregonstate.edu/physics/coursewikis/GGR/book/ggr/tidal.html)
- *7d. Tidal numbers* (my calculations from [NASA Earth](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) and [NASA Sun](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) fact-sheet values $GM_\oplus = 3.986\times10^{14}$ m³/s², $R_\oplus = 6371$ km, $GM_\odot = 1.32712\times10^{20}$ m³/s²; formulas from 7b/7c) **[verified numerically]**:
  - **Earth's surface**: $2GM/R^3 = 3.08\times10^{-6}$ s⁻². Over a 2 m tall person, head and feet are pulled apart at $6.2\times10^{-6}$ m/s² ($\approx6.3\times10^{-7}\,g$). The sideways squeeze is half that. This is undetectable to the body.
  - **10 $M_\odot$ black hole** ($r_s = 29.5$ km; photon sphere 44.3 km; ISCO 88.6 km):
    - at $r = 1000$ km: $2GM/r^3 = 2.65\times10^3$ s⁻², i.e. $5.3\times10^3$ m/s² ($\approx540\,g$) across 2 m;
    - at the ISCO: $7.6\times10^6$ m/s² ($\approx7.8\times10^5\,g$);
    - at the horizon: $2.1\times10^8$ m/s² ($\approx2.1\times10^7\,g$). This is "spaghettification".
  - **Contrast, a 4.3 million $M_\odot$ black hole** (roughly the mass usually quoted for the Milky Way's central black hole; that mass is not verified in this research): at its horizon ($r_s = 1.27\times10^7$ km) the stretch across 2 m is only $1.1\times10^{-3}$ m/s² ($\approx10^{-4}\,g$). Because tidal acceleration $\propto M/r^3$ and $r_s\propto M$, the tide at the horizon scales as $1/M^2$: big black holes are gentle at the horizon.
- *7e. Gravitational-wave detectors measure geodesic deviation.*
  1. In TT gauge, free test masses obey $\frac{d^2S^i}{dt^2} = \tfrac12\frac{d^2h^i{}_j}{dt^2}S^j$ (Tong eq. 5.23).
  2. For $+$ polarisation, $S^1 = S^1(0)(1+\tfrac12h_+)$ and $S^2 = S^2(0)(1-\tfrac12h_+)$ (eq. 5.24): one arm stretches by $\tfrac12hL$ while the other shrinks by $\tfrac12hL$ — [Tong GR notes, §5.2](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
  3. LIGO measures the differential arm length $\Delta L = \delta L_x - \delta L_y = h(t)L$, with $L = 4$ km — [LIGO/Virgo, PRL 116, 061102 (2016)](https://arxiv.org/abs/1602.03837)
  4. GW150914's peak strain $h = 1.0\times10^{-21}$ — [LIGO/Virgo 2016](https://arxiv.org/abs/1602.03837) — therefore gives $\Delta L\approx4\times10^{-18}$ m (my arithmetic), a few thousandths of a proton diameter.

**(5) Where it appears in GR.** Tidal forces; the derivation of the Einstein equations (Carroll introduces Einstein's equation as the replacement for Poisson's equation $\nabla^2\Phi = 4\pi G\rho$ (his eq. 4.35), and $\nabla^2\Phi$ is the trace of the Newtonian tidal tensor $\partial_i\partial_j\Phi$ (my observation linking the two); gravitational-wave detection; the Raychaudhuri equation and singularity theorems (focusing of geodesics) — [Carroll notes, ch. 4](https://arxiv.org/abs/gr-qc/9712019); [Blau notes, §8.4](http://www.blau.itp.unibe.ch/newlecturesGR.pdf)

#### 8. sympy verification log (what was checked, for the report's "verified" claims)
Scripts were run in this session with sympy 1.14.0 and numpy:
- Christoffel symbols from $\Gamma^\lambda_{\mu\nu}=\tfrac12g^{\lambda\sigma}(\ldots)$ for polar, the 2-sphere, Schwarzschild ($x^0=ct$ and $x^0=t$), and the weak-field metric. All match the values above.
- Riemann tensor (Carroll convention): zero for polar; $R^\theta{}_{\phi\theta\phi}=\sin^2\theta$ and $R = 2/a^2$ for the sphere; Ricci $=0$ for Schwarzschild; static-frame tidal components $-r_s/r^3$ and $r_s/(2r^3)$.
- $\nabla_\lambda g_{\mu\nu}=0$ for the sphere and Schwarzschild (numerical spot checks of the simplified expressions).
- $\Gamma^\mu_{\mu\lambda}=\partial_\lambda\ln\sqrt{|g|}$ for polar, sphere and Schwarzschild.
- $\nabla_\mu V^\nu = 0$ for $V=\hat x$ in polar coordinates.
- Polar straight line, meridian, equator and tilted great circle satisfy their geodesic equations.
- Parallel transport around a latitude circle: exact `dsolve` solution, plus independent 3D-embedding numerics giving 48.231°, 105.442° and 180.000° for $\theta_0 = 30°, 45°, 60°$. The triangle holonomy came out at 90.0°.
- Euler–Lagrange equations of $g_{\mu\nu}\dot x^\mu\dot x^\nu$ reproduce the Schwarzschild geodesic equations exactly.
- Circular orbits: $(d\phi/dt)^2 = GM/r^3$; $L^2 = Mr^2/(r-3M)$; ISCO $6M$; photon sphere $3M$; $E_{\rm ISCO}=2\sqrt2/3$.
- Radial infall: normalisation $=-c^2$, and $\ddot r = -GM/r^2$.
- Sphere series in normal coordinates: $g_{\phi\phi} = \rho^2 - \rho^4/(3a^2)+\ldots$
- Counts: $n^2(n+1)/2 = 6, 40$.

### Inferences

**Manifolds — key takeaways**
1. A manifold is "locally $\mathbb{R}^n$"; coordinates are labels, and only the metric gives distances.
2. Some manifolds (the sphere, and the circle) need more than one chart. Smooth transition maps glue the charts together.
3. At any point you can choose coordinates where the metric is Minkowski and its first derivatives vanish, but not its second derivatives. Those 20 leftover numbers are curvature.
4. Local flatness is the equivalence principle in mathematical form.

*Misconceptions:*
- "Coordinates measure distance". Schwarzschild $r$ is not distance from the centre, and $\theta,\phi$ are angles, not lengths.
- "A curved manifold must sit inside a higher-dimensional flat space". Spacetime's curvature is intrinsic, and the sphere-in-3D picture is only an aid.
- "Coordinate singularities are physical". The sphere's poles in $(\theta,\phi)$ are perfectly ordinary points, and the same idea later explains $r=r_s$ in Schwarzschild coordinates.

My inference on why one chart can't cover $S^2$: $S^2$ is compact (closed and bounded), while the image of a chart is an open subset of $\mathbb{R}^2$. A compact space cannot be continuously and invertibly mapped onto a nonempty open subset of the plane. This standard topology fact is not sourced here. Carroll gives the two-chart stereographic atlas for $S^2$ and says only that "many manifolds cannot be covered with a single coordinate system".

**Tangent spaces — key takeaways**
1. A vector lives at a point, in that point's tangent space.
2. A vector *is* a directional derivative: $V = V^\mu\partial_\mu$.
3. The coordinate basis $\partial_\mu$ changes with the Jacobian, and $g_{\mu\nu} = \partial_\mu\cdot\partial_\nu$.
4. Vectors at different points cannot be added or subtracted without extra structure (a connection).

*Misconceptions:*
- "Vectors are arrows stretching from one point to another". In curved space, displacement "arrows" make sense only infinitesimally.
- "$\partial_\theta$ is a unit vector". Its length is $\sqrt{g_{\theta\theta}}$: $r$ in the plane, $a$ on the sphere.

**Covariant derivative — key takeaways**
1. $\nabla = \partial + \Gamma$-correction. The correction accounts for the turning of basis vectors.
2. There is $+\Gamma$ for each upper index and $-\Gamma$ for each lower index.
3. $\nabla g = 0$ and $\Gamma$ symmetric define GR's unique connection.
4. Divergence: $\nabla_\mu V^\mu = \frac{1}{\sqrt{|g|}}\partial_\mu(\sqrt{|g|}V^\mu)$, which explains the textbook polar/spherical divergence formulas.
5. "Comma goes to semicolon" upgrades special-relativistic laws to GR. (Carroll calls this the "comma-goes-to-semicolon rule", applies it to $\partial_\mu T^{\mu\nu}=0\to\nabla_\mu T^{\mu\nu}=0$ (eq. 4.23), and then cautions that "life is not always so easy". For Maxwell's equations the different routes agree, but in general partial derivatives commute while covariant ones do not, so the order chosen before replacing $\partial\to\nabla$ can add a curvature term, e.g. $Y^\mu\nabla_\mu\nabla_\nu X^\nu - Y^\mu\nabla_\nu\nabla_\mu X^\nu = -R_{\mu\nu}Y^\mu X^\nu$ (eqs. 4.30–4.31); the rule "is ambiguous" about such terms — [Carroll notes, ch. 4, pp. 107–108](https://arxiv.org/abs/gr-qc/9712019).)

*Misconceptions:*
- "Changing components mean a changing vector". The constant $\hat x$ field has non-constant polar components.
- "$\nabla_\mu V^\nu$ means the $\nu$ component of $\nabla_\mu$ applied to the single number $V^\nu$". It is the $\nu$ component of the derivative of the whole vector, so it involves all components.

**Christoffel symbols — key takeaways**
1. They come entirely from first derivatives of the metric: $\Gamma^\lambda_{\mu\nu}=\tfrac12g^{\lambda\sigma}(\partial_\mu g_{\nu\sigma}+\partial_\nu g_{\mu\sigma}-\partial_\sigma g_{\mu\nu})$.
2. 6 independent in 2D, 40 in 4D. For diagonal metrics most vanish (2 nonzero for polar and the sphere, 9 for Schwarzschild).
3. They are not tensors: nonzero in flat polar coordinates, zero at a point in any curved space with RNC.
4. Physically they are the "gravitational force" terms of the equation of motion, which is why gravity can be transformed away locally.
5. The quickest way to compute them is to write $L=g_{\mu\nu}\dot x^\mu\dot x^\nu$, derive the Euler–Lagrange equations and read off coefficients, halving the cross terms.

*Misconceptions:*
- "Nonzero $\Gamma$ means curved space" (polar coordinates refute this).
- "$\Gamma^\lambda_{\mu\nu}$ is a tensor because it has indices".
- Forgetting the factor 2 on off-diagonal terms when reading from the Lagrangian.
- Index-placement chaos: books write $\Gamma^\lambda{}_{\mu\nu}$, $\Gamma^\lambda_{\mu\nu}$ or $\{{}^{\lambda}_{\mu\nu}\}$ for the same thing (Carroll mentions the "funny notation"), so the report should pick one.

**Parallel transport — key takeaways**
1. It moves a vector along a path while keeping it "as constant as possible": $\dot V^\mu + \Gamma^\mu_{\nu\sigma}\dot x^\nu V^\sigma = 0$.
2. Lengths and angles are preserved.
3. In curved space the result depends on the path. Around a closed loop the vector comes back rotated by (enclosed curvature) = area$/a^2$ on a sphere: $2\pi(1-\cos\theta_0)$ for a latitude circle, and 90° for the octant triangle.
4. Holonomy around small loops *is* the Riemann tensor.
5. Physical versions: Foucault pendulum (an analogy) and gyroscope geodetic precession (real GR, measured by GP-B).

*Misconceptions:*
- "Parallel transport means keeping the components constant" (the polar example refutes this).
- "On a sphere the transported vector keeps pointing north". Along a latitude circle it does not, and along the equator it keeps a fixed angle to the equator.
- "The vector rotates because the path is curved". The holonomy depends on the enclosed curvature, not on how bendy the path looks. The geodesic triangle has three straight sides and still gives 90°.

**Geodesics — key takeaways**
1. Geodesic = straightest curve = curve that parallel-transports its own velocity = curve of stationary (for timelike paths, locally maximal) proper time.
2. $\ddot x^\mu + \Gamma^\mu_{\nu\sigma}\dot x^\nu\dot x^\sigma = 0$ holds only for affine parameters.
3. Free particles follow timelike geodesics and light follows null geodesics. There is no gravitational force term, because gravity is in $\Gamma$.
4. In Schwarzschild: $\ddot r = -GM/r^2$ for radial infall from rest at infinity, Kepler's $\Omega^2 = GM/r^3$ for circular orbits, a photon sphere at $3GM/c^2$, an ISCO at $6GM/c^2$.
5. In weak, slow, static conditions, $g_{00} = -(1+2\Phi/c^2)$ turns the geodesic equation into $\ddot{\vec x} = -\nabla\Phi$.

*Misconceptions:*
- "Geodesics are always the shortest path". On a sphere a great circle going the long way round is a geodesic but not the shortest. In spacetime, timelike geodesics *maximise* proper time locally.
- "Light has no geodesic because $d\tau=0$". Null geodesics exist; use an affine $\lambda$.
- "Latitude lines are straight on a globe". Only the equator is a geodesic.
- The rubber-sheet picture: it suggests gravity pulls objects "down" into a well, whereas in GR slow particles follow geodesics mostly because of the curvature of *time* ($g_{00}$).

**Geodesic deviation — key takeaways**
1. Initially parallel geodesics do not stay parallel in curved space. The relative acceleration is $\frac{D^2\xi^\mu}{d\tau^2} = R^\mu{}_{\nu\rho\sigma}u^\nu u^\rho\xi^\sigma$ (Carroll convention).
2. On a sphere $\xi'' = -\xi/a^2$: meridians converge.
3. Near a mass, free-fall neighbours are stretched radially ($+2GM\xi/r^3$) and squeezed sideways ($-GM\xi/r^3$). This is exactly Newton's tidal tensor $\partial_i\partial_j\Phi$, now understood as spacetime curvature $R^i{}_{0j0}$.
4. Tides are tiny on Earth ($\sim10^{-6}$ m/s² across a person) and lethal near stellar-mass black holes ($\sim10^{8}$ m/s² at the horizon of $10M_\odot$).
5. LIGO is a geodesic-deviation meter: $\Delta L = hL\sim4\times10^{-18}$ m.

*Misconceptions:*
- "Tidal forces are a different force from gravity". They are what is left of gravity after free fall removes the uniform part.
- "Black holes always spaghettify at the horizon". Only small ones do, since the tide scales as $1/M^2$ at the horizon.
- Sign confusion between books: always check that the sphere's meridians converge.

### Gaps
- The extracted equation numbers (3.1, 3.12, 3.21, 3.32, 3.47, 3.67, 3.113, etc.) come from the arXiv PDF of Carroll's 1997 notes. Carroll's printed textbook *Spacetime and Geometry* (2004) uses different numbering, and I did not access it. The ar5iv HTML rendering also numbers differently (e.g., it labels the parallel-transport equation 3.53 and the Riemann definition 3.98). The holonomy formula $\delta V^\rho = (\delta a)(\delta b)A^\nu B^\mu R^\rho{}_{\sigma\mu\nu}V^\sigma$ was taken from the ar5iv rendering (its eq. 3.90) and not re-checked against the PDF text.
- The basis-vector derivation of $\Gamma$ via $\partial_\mu\vec e_\nu = \Gamma^\lambda_{\mu\nu}\vec e_\lambda$ (Section 3, steps 2–6) is my own worked presentation, verified by hand and consistent with Carroll's values. I believe it mirrors Schutz ch. 5 but could not confirm this.
- The Schiff/de Sitter geodetic-precession formula used in Key Question 3 was not found printed in a fetched source (Everitt et al. cite Schiff 1960 and de Sitter 1916 without printing it in the text I read).
- The general (non-diagonal) proof of $\partial_\lambda\ln|g| = g^{\mu\sigma}\partial_\lambda g_{\mu\sigma}$ (Jacobi's formula) is cited to Weinberg via Carroll. I did not read Weinberg.

---

## Key Question 3: What numbers (Gravity Probe B, ISCO, photon sphere, tidal accelerations) are confirmed by primary sources?

### Takeaway
Gravity Probe B measured a geodetic precession of $-6601.8\pm18.3$ mas/yr against GR's $-6606.1$ mas/yr: the two differ by 0.07%, well inside the 0.28% measurement uncertainty. It measured frame-dragging of $-37.2\pm7.2$ mas/yr against $-39.2$ mas/yr (Everitt et al., PRL 2011). The ISCO at $6GM/c^2$ and the photon sphere at $3GM/c^2$ are textbook results confirmed in Carroll and Tong and re-derived here with sympy. Tidal accelerations are computed from $2GM/r^3$ using NASA constants. LIGO's GW150914 peak strain was $1.0\times10^{-21}$ on 4 km arms.

### Cited Findings
**Gravity Probe B**
- Final results: the "geodetic drift rate of $-6{,}601.8\pm18.3$ mas/yr and a frame-dragging drift rate of $-37.2\pm7.2$ mas/yr, to be compared with the GR predictions of $-6{,}606.1$ mas/yr and $-39.2$ mas/yr" (1 mas $= 4.848\times10^{-9}$ rad). Launch 20 April 2004; science data from 28 August 2004 to 14 August 2005; four cryogenic gyroscopes — [Everitt et al., "Gravity Probe B: Final Results of a Space Experiment to Test General Relativity", Phys. Rev. Lett. 106, 221101 (2011), arXiv:1105.3456](https://arxiv.org/abs/1105.3456); DOI [10.1103/PhysRevLett.106.221101](https://doi.org/10.1103/PhysRevLett.106.221101)
- The orbit was a 642 km polar orbit. Schiff (1960) showed that an orbiting gyroscope undergoes (1) "a geodetic drift in the orbit plane due to motion through the space-time curved by the Earth's mass" and (2) frame dragging. The geodetic term "matches the curvature precession of the Earth-Moon system around the Sun given by W. de Sitter in 1916". The published values are corrected for the guide star's proper motion and for the solar geodetic contribution (7.3 ± 0.3 mas/yr NS, −16.2 ± 0.6 mas/yr WE) — [Everitt et al. 2011, arXiv PDF](https://arxiv.org/pdf/1105.3456)
- Physics Today rounds these to $6602\pm18$ mas/yr measured vs 6606 predicted (search-result summary) — [Physics Today](https://physicstoday.aip.org/news/gravity-probe-b-concludes-its-50-year-quest)
- Einstein Online's popular figures: GP-B at about 640 km altitude, geodetic effect "about 340 billionths of an angular degree per orbit, roughly 6.7 arcseconds per year" — [Einstein Online, geodetic precession](https://www.einstein-online.info/en/spotlight/geodetic_precession/)
- My consistency check (the formula is standard; see Gaps). The Schiff geodetic rate for a circular orbit is $\Omega_{\rm geo} = \frac{3}{2}\frac{GM}{c^2r^3}|\vec r\times\vec v|$. With $v=\sqrt{GM/r}$ this becomes $\Omega_{\rm geo} = \frac32\frac{(GM)^{3/2}}{c^2r^{5/2}}$, which equals $\frac{3\pi GM}{c^2 r}$ per orbit.
  - With $GM_\oplus = 3.986\times10^{14}$ m³/s² ([NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)) and $r = 6371+642 = 7013$ km, this gives 6638 mas/yr. With $r = 6378+642 = 7020$ km it gives 6621 mas/yr. Both are within 0.5% of the team's 6606.1. The residual reflects the actual orbit and Earth model the team used, which I did not model.
  - Per orbit: $3\pi GM/(c^2r)\approx5.95\times10^{-9}$ rad $\approx1.23$ mas $\approx3.4\times10^{-7}$ degrees, matching Einstein Online's "340 billionths of a degree per orbit". The orbital period is about 97.5 min.

**Photon sphere and ISCO**
- Carroll ($c=1$): circular photon orbit at $r_c = 3GM$ (eq. 7.51); "6GM is the smallest possible radius of a stable circular orbit" (eq. 7.55); unstable circular orbits for $3GM<r<6GM$; orbits may dip below $3GM$ and re-emerge as long as they stay outside $2GM$ — [Carroll notes, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- Tong: $r_{\rm ISCO} = 6GM/c^2$ (eq. 1.46), the borderline case $l^2 = 12G^2M^2/c^2$. The ISCO marks the inner edge of accretion discs, and the light in black-hole images comes from near the photon sphere — [Tong GR notes, §1.3](https://www.damtp.cam.ac.uk/user/tong/gr/gr.pdf)
- Re-derived with sympy here (Key Question 2, §6d): photon sphere $3M$, ISCO $6M$, $L^2_{\rm circ} = Mr^2/(r-3M)$, $E_{\rm ISCO} = 2\sqrt2/3$ (binding energy 5.72% of $mc^2$). For a 10 $M_\odot$ black hole ($GM_\odot$ from [NASA Sun fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html)): $r_s = 29.5$ km, $r_{\rm ph}=44.3$ km, $r_{\rm ISCO} = 88.6$ km (my arithmetic).

**Tidal accelerations**
- Formulas: radial stretch $+2GM\xi/r^3$, transverse squeeze $-GM\xi/r^3$, in both Newtonian theory and GR (Schwarzschild, radially falling or static frame) — [Dray, GGR "Tidal Forces"](https://sites.science.oregonstate.edu/physics/coursewikis/GGR/book/ggr/tidal.html); sympy-verified (Key Question 2, §7c)
- Numbers (my arithmetic with [NASA Earth](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)/[Sun](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) fact-sheet constants):
  - Earth's surface: tidal gradient $2GM/R^3 = 3.08\times10^{-6}$ s⁻², i.e. $6.2\times10^{-6}$ m/s² across 2 m. (The fact sheet's mean surface gravity is 9.820 m/s².)
  - 10 $M_\odot$ black hole, across 2 m: $5.3\times10^3$ m/s² at 1000 km, $7.6\times10^6$ m/s² at the ISCO, $2.1\times10^8$ m/s² at the horizon.
  - $4.3\times10^6M_\odot$ black hole, at the horizon: $1.1\times10^{-3}$ m/s² across 2 m.

**Gravitational waves (geodesic deviation in practice)**
- GW150914: observed by both LIGO detectors on 14 September 2015, peak strain $1.0\times10^{-21}$, frequency sweeping 35 to 250 Hz. Arms $L_x=L_y=L=4$ km, measured $\Delta L(t) = \delta L_x-\delta L_y = h(t)L$ — [Abbott et al., PRL 116, 061102 (2016), arXiv:1602.03837](https://arxiv.org/abs/1602.03837). This implies $\Delta L\approx4\times10^{-18}$ m at peak (my arithmetic).

**Foucault pendulum (analogy for holonomy)**
- The swing plane of a Foucault pendulum is parallel-transported around the latitude circle. After one day it differs from its start by $\alpha = -2\pi\sin\varphi$ ($\varphi$ = latitude), a geometric phase or holonomy that matches the Gauss–Bonnet enclosed solid angle (Wikipedia; cross-check level only) — [Wikipedia, "Geometric phase"](https://en.wikipedia.org/wiki/Geometric_phase)
- Connection to the sphere calculation (my inference, consistent with §5 Example 5.2): latitude $\varphi$ corresponds to colatitude $\theta_0 = 90°-\varphi$, so $\cos\theta_0 = \sin\varphi$. The swing plane turns by $-2\pi\sin\varphi$ relative to the local compass directions per (sidereal) day, i.e. clockwise in the northern hemisphere, which is the same as a holonomy of $2\pi(1-\sin\varphi)$.
  - At 45°N: $360°\times\sin45° = 254.6°$ of clockwise turning per sidereal day.
  - At 48.85°N (approximately Paris, where Foucault's 1851 demonstration was made; latitude not sourced here): 271.1° per sidereal day, a full turn every $23.93\text{ h}/\sin\varphi\approx31.8$ h (my arithmetic).

### Inferences
- GP-B is the cleanest "parallel transport is real" experiment for the report. A gyroscope in free fall carries its spin by parallel transport, and after one year around a curved Earth its axis is off by 6.6 arcseconds, in the plane of the orbit, as GR predicts, within the 0.28% measurement uncertainty. The sphere's latitude-circle holonomy is a direct 2D analogue.
- The Foucault pendulum should be presented as an *analogy* for holonomy on a curved surface, not as a GR effect. Its turning comes from the Earth's rotation, and its geometry is that of the ordinary sphere. GP-B's geodetic precession is the genuine spacetime-curvature version. These are my framing recommendations.
- The ISCO and photon-sphere radii are best presented as consequences of the geodesic equation with the Schwarzschild Christoffels. Section 6d gives a two-line derivation of $r_{\rm ph}=3GM/c^2$ directly from $\Gamma^r_{tt}$ and $\Gamma^r_{\phi\phi}$ that a Calculus II reader can follow.

### Gaps
- I did not locate a NASA (nasa.gov) Gravity Probe B results page. The numbers above come from the peer-reviewed paper (primary), with Physics Today and Einstein Online as secondary confirmations.
- The Schiff/de Sitter formula $\Omega = \frac{3GM}{2c^2r^3}(\vec r\times\vec v)$ is standard but was not read in a fetched primary source. My reproduction of 6606 mas/yr to within 0.5% supports it, but the writer may want to cite Schiff, *Phys. Rev. Lett.* 4, 215 (1960), or a textbook. That reference is from memory, unverified.
- Einstein Online gives "6.7 arcseconds per year", slightly above the PRL's 6.606, and says (per its glossary) the effect was "confirmed to 1% in April 2007". That refers to preliminary 2007 results; the final 2011 accuracy is 0.28%.
- The Foucault-pendulum geometric-phase statement is sourced only to Wikipedia. A primary pedagogical source (e.g., Hart, Miller & Mills, *Am. J. Phys.* 55, 67 (1987); details from memory, unverified) was not fetched. Paris's latitude (≈48.85°N) and the 1851 date are from general knowledge, not a fetched source.
- The mass of Sgr A* ($\approx4.3\times10^6M_\odot$) used in the contrast example was not verified in this research; treat that example as a generic supermassive black hole.
