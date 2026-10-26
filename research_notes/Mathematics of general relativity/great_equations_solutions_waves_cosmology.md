# Anatomy of the Great Equations of General Relativity: exact solutions, clocks, tides, the action, gravitational waves and cosmology

Research notes for the "Anatomy of the Great Equations" section of *The Mathematics of General Relativity: From Calculus to Einstein's Field Equations* (Calculus II / Physics I reader). Equations (11)–(16), (18), (19) and six extra candidates.

**Verification.** Every worked number below was recomputed in Python 3 (double precision; `mpmath` at 40 digits where double precision loses digits) by `/tmp/claude-0/-home-user-Projects/6e512a3f-ee96-5ca2-92f4-5fdb7ef00825/scratchpad/calc/gr_numbers.py`. The curvature identities quoted (Schwarzschild Ricci = 0, the Schwarzschild tidal components, the Kretschmann scalar, the FLRW Einstein tensor) were rederived symbolically with `sympy` by `/tmp/claude-0/-home-user-Projects/6e512a3f-ee96-5ca2-92f4-5fdb7ef00825/scratchpad/calc/symbolic.py`. The Riemann convention used there is Carroll's (3.67). Numbers marked "computed here" come from those scripts. Their inputs are cited.

---

## Key question 1: What are the exact forms, symbol-by-symbol anatomy, conventions and connections of each great equation in the major textbooks and primary papers?

### Takeaway
All the equations below follow the "MTW/Carroll/Wald" conventions: signature $(-,+,+,+)$, $R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\dots$, $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ and $G_{\mu\nu}+\Lambda g_{\mu\nu}=(8\pi G/c^4)T_{\mu\nu}$. In that common language, each "great equation" is either an exact solution of the field equations (the Schwarzschild, Kerr and FLRW metrics), an exact consequence of one (horizon radius, static-clock rate, redshift, orbits, light bending, Friedmann equations), a restatement of curvature as tidal acceleration (geodesic deviation), the variational origin of the field equations (the Einstein–Hilbert action), or their first-order expansion (gravitational waves). The textbooks differ mainly in units: Carroll keeps $G$ and sets $c=1$, Will and MTW set $G=c=1$, and this document restores SI throughout.

### Cited Findings

#### 0. Conventions, units and notation used throughout (state these once in the document)
- **Signature.** Carroll writes the Minkowski metric as $\eta_{\mu\nu}=\mathrm{diag}(-1,1,1,1)$ (his eq. 1.8) and warns that "Some references, especially field theory books, define the metric with the opposite sign, so be careful." — [Carroll, Lecture Notes on GR, arXiv gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019)
- **Signature by textbook.** Misner–Thorne–Wheeler (MTW), Carroll (*Spacetime and Geometry*) and Wald use $(-,+,+,+)$. Wald switches only in Ch. 13. Landau–Lifshitz, Chandrasekhar, d'Inverno and Hobson–Efstathiou–Lasenby use $(+,-,-,-)$. — [Wikipedia, Sign convention (cross-check)](https://en.wikipedia.org/wiki/Sign_convention); MTW's $-+++$ is also stated at [Wikipedia, Gravitation (book)](https://en.wikipedia.org/wiki/Gravitation_(book))
- **Schutz** uses a negative time term and positive space terms, i.e. $(-,+,+,+)$, according to a Glasgow GR course that says it adopts Schutz's signature. This is a secondary source. — [Glasgow GR2 notes](https://www.astro.gla.ac.uk/users/martin/teaching/gr2/oldnotes/grnotes2_complete.pdf)
- **Riemann tensor (Carroll eq. 3.67):** $R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$. It is antisymmetric in its last two indices, $R^\rho{}_{\sigma\mu\nu}=-R^\rho{}_{\sigma\nu\mu}$ (3.64). On index ordering Carroll warns: "There is no agreement at all on what this convention should be, so be careful." **Ricci tensor:** $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ (3.90). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Ricci-contraction sign.** The two common Ricci contractions, $R_{ab}=R^c{}_{acb}$ and $R_{ab}=R^c{}_{abc}$, "differ by a minus sign because they correspond to opposite signs of the Riemann tensor". — [Wikipedia, Sign convention](https://en.wikipedia.org/wiki/Sign_convention)
- **Geometric units.** Will's review writes formulas with $G=c=1$. For example the deflection is $\delta\theta\approx\tfrac12(1+\gamma)\,1.''7505$, the delay is $\delta t=2(1+\gamma)M_\odot\ln[\dots]$, and the precession is $6\pi m/p$, with masses in length units. — [Will 2014, Living Rev. Relativ. 17, 4 (arXiv 1403.7377)](https://arxiv.org/abs/1403.7377). Carroll's notes keep $G$ and set $c=1$ (e.g. $ds^2=-(1-2GM/r)dt^2+\dots$, eq. 7.29). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **SI constants used.** $G=6.674\,30(15)\times10^{-11}\ \mathrm{m^3\,kg^{-1}\,s^{-2}}$ (relative uncertainty $2.2\times10^{-5}$). — [NIST CODATA](https://physics.nist.gov/cgi-bin/cuu/Value?bg). $c=299\,792\,458$ m/s (exact by SI definition). IAU 2015 Resolution B3 nominal values (exact by definition): $(\mathcal{GM})^N_\odot=1.327\,124\,4\times10^{20}\ \mathrm{m^3\,s^{-2}}$, $R^N_\odot=6.957\times10^8$ m, $(\mathcal{GM})^N_E=3.986\,004\times10^{14}\ \mathrm{m^3\,s^{-2}}$, $R^N_{eE}=6.3781\times10^6$ m (equatorial), $R^N_{pE}=6.3568\times10^6$ m (polar). The resolution also notes that "the error in the product $GM_\odot$ is five orders of magnitude smaller" than the error in $G$. — [IAU 2015 Resolution B3, arXiv 1510.07674](https://arxiv.org/abs/1510.07674)
- **Converting between geometric and SI units (computed here).** Restore SI by replacing $M\to GM/c^2$ (a length) and $t\to ct$. For the Sun, $GM_\odot/c^2=1476.6$ m and $GM_\odot/c^3=4.9255\ \mu$s. For Earth, $GM_E/c^2=4.4350$ mm. $M_\odot=GM_\odot/G=1.98841\times10^{30}$ kg and $M_E=5.97217\times10^{24}$ kg. — inputs from [IAU B3](https://arxiv.org/abs/1510.07674), [NIST](https://physics.nist.gov/cgi-bin/cuu/Value?bg)

---

#### (11) The Schwarzschild metric

**A. Exact forms.**
- SI: $$ds^2=-\left(1-\frac{r_s}{r}\right)c^2\,dt^2+\left(1-\frac{r_s}{r}\right)^{-1}dr^2+r^2\left(d\theta^2+\sin^2\theta\,d\phi^2\right),\qquad r_s=\frac{2GM}{c^2}.$$
- Carroll eq. (7.29), with $c=1$: $ds^2=-\left(1-\frac{2GM}{r}\right)dt^2+\left(1-\frac{2GM}{r}\right)^{-1}dr^2+r^2d\Omega^2$. Carroll adds: "This is true for any spherically symmetric vacuum solution to Einstein's equations". $M$ "can be interpreted as the conventional Newtonian mass that we would measure by studying orbits at large distances". As $M\to0$ the metric becomes Minkowski space, and it "becomes progressively Minkowskian as we go to $r\to\infty$; this property is known as asymptotic flatness." — [Carroll notes, §7](https://arxiv.org/abs/gr-qc/9712019)
- Geometric ($G=c=1$): $ds^2=-(1-2M/r)\,dt^2+(1-2M/r)^{-1}dr^2+r^2d\Omega^2$.
- Matching to the weak field (Carroll 7.27–7.28): the weak-field limit has $g_{00}=-(1+2\Phi)$, $g_{rr}=(1-2\Phi)$ with $\Phi=-GM/r$, "Therefore the metrics do agree in this limit, if we set $\mu=-2GM$." — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Symbolic check (computed here): with $x^0=t$ and $g_{tt}=-(1-r_s/r)c^2$, all ten components of $R_{\mu\nu}$ vanish identically. The metric is therefore an exact vacuum solution.

**B. Plain English.** The equation is a recipe for the spacetime around any non-rotating, uncharged, spherical mass, valid in the empty region outside it. Give it two nearby events, separated by coordinate amounts $dt, dr, d\theta, d\phi$, and it returns the true separation $ds^2$: physical time if $ds^2<0$, physical distance if $ds^2>0$. Near the mass, clocks tick slowly (the $dt^2$ coefficient shrinks) and radial distances are stretched (the $dr^2$ coefficient grows).

**C. Symbol-by-symbol anatomy (SI units).**
| Symbol | Meaning | SI unit |
|---|---|---|
| $ds^2$ | squared spacetime interval between neighbouring events; $ds^2=-c^2d\tau^2$ for a clock's worldline ($\tau$ = proper time) | m² |
| $d$ | "infinitesimal change in"; $dt^2$ means $(dt)^2$, not $d(t^2)$ | — |
| $t$ | Schwarzschild coordinate time: the time kept by static clocks far away ($r\to\infty$) | s |
| $c$ | speed of light, 299 792 458 m/s (exact) | m s⁻¹ |
| $r$ | **areal (circumferential) radius**: defined so that the sphere labelled $r$ has area $4\pi r^2$ and circumference $2\pi r$. It is **not** the distance from the centre (see the worked example) | m |
| $\theta$ | polar angle, $0\le\theta\le\pi$ | rad |
| $\phi$ | azimuthal angle, $0\le\phi<2\pi$ | rad |
| $d\Omega^2=d\theta^2+\sin^2\theta\,d\phi^2$ | metric of a unit sphere | rad² (dimensionless) |
| $G$ | Newton's constant, $6.67430\times10^{-11}$ | m³ kg⁻¹ s⁻² |
| $M$ | mass of the central body as measured from distant orbits | kg |
| $r_s=2GM/c^2$ | Schwarzschild radius | m |
| $1-r_s/r$ | dimensionless factor. $\sqrt{1-r_s/r}$ is the static clock-rate factor ("lapse") | — |
| $(\cdot)^{-1}$ | reciprocal: the $dr^2$ coefficient is $1/(1-r_s/r)$ | — |
| minus sign on $c^2dt^2$ | signature $(-,+,+,+)$: time enters with the opposite sign to space | — |
| $g_{\mu\nu}$ | the metric components read off the line element: $g_{tt}=-(1-r_s/r)c^2$, $g_{rr}=(1-r_s/r)^{-1}$, $g_{\theta\theta}=r^2$, $g_{\phi\phi}=r^2\sin^2\theta$, all off-diagonal terms zero; compactly $ds^2=g_{\mu\nu}dx^\mu dx^\nu$ with a sum over $\mu,\nu=0..3$ | mixed |

**D. Mathematical operations.** The line element is a quadratic form: a sum of products of differentials weighted by functions of $r$ and $\theta$, i.e. $ds^2=g_{\mu\nu}dx^\mu dx^\nu$ with the summation convention. It uses reciprocals and the square of a sine. Physical lengths and times come from integrating its square root along a path. A radial ruler gives $\int\sqrt{g_{rr}}\,dr$, a static clock gives $\int\sqrt{-g_{tt}}\,dt/c$, and both are ordinary Calculus II integrals.

**E. Physical interpretation.**
- $g_{tt}$ governs gravitational time dilation (eq. 13) and redshift (eq. 14). $g_{rr}$ governs the extra radial distance (space is curved). $g_{\theta\theta}$ and $g_{\phi\phi}$ show that spheres of radius $r$ have area $4\pi r^2$.
- **$r=r_s$ is a coordinate singularity.** $g_{rr}$ blows up there but the curvature stays finite. The Kretschmann invariant is $K=R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma}=48G^2M^2/(c^4r^6)$ (rederived symbolically here). At $r=r_s$ this is $K=12/r_s^4$, which for 10 $M_\odot$ is $1.58\times10^{-17}\ \mathrm{m^{-4}}$, a finite number. Other coordinates (Eddington–Finkelstein, Kruskal) are regular there. **$r=0$ is a curvature singularity**, where $K\to\infty$ in every coordinate system. Inside $r<r_s$, $g_{tt}>0$ and $g_{rr}<0$: $r$ becomes a time coordinate, so decreasing $r$ is as unavoidable as the future.
- **Weak-field expansion** for $r\gg r_s$: $g_{tt}\approx-(1+2\Phi/c^2)c^2$ and $g_{rr}\approx1+r_s/r=1-2\Phi/c^2$, with $\Phi=-GM/r$ (Carroll 7.28 with $c$ restored). The $g_{tt}$ term alone reproduces Newtonian gravity for slow particles. The $g_{rr}$ term matters for light (it doubles the deflection; see E2).

**F. Worked example: proper radial distance vs $\Delta r$ (computed here).**
- Proper distance between $r_1$ and $r_2$ at fixed $t,\theta,\phi$: $L=\int_{r_1}^{r_2}\frac{dr}{\sqrt{1-r_s/r}}$. An antiderivative is $F(r)=\sqrt{r(r-r_s)}+r_s\ln\!\left(\sqrt r+\sqrt{r-r_s}\right)$. Check: $F'(r)=\frac{2r-r_s}{2\sqrt{r(r-r_s)}}+\frac{r_s}{2\sqrt r\sqrt{r-r_s}}=\frac{r}{\sqrt{r(r-r_s)}}=\frac{1}{\sqrt{1-r_s/r}}$.
- **10 $M_\odot$ black hole**, $r_s=29{,}532.5$ m.
  - From $r=r_s$ to $2r_s$: $F(2r_s)-F(r_s)=\sqrt2\,r_s+r_s\ln(\sqrt2+1)=(1.41421+0.88137)\,r_s=2.2956\,r_s=67.79$ km, whereas $\Delta r=29.53$ km.
  - From $2r_s$ to $3r_s$: $L=1.3001\,r_s=38.40$ km vs $\Delta r=29.53$ km. Midpoint-rule integration with $2\times10^6$ steps also gives 38.40 km.
  - From $10r_s$ to $11r_s$: $L=1.0514\,r_s$, so the stretching fades with distance.
- **Sun (weak field)**: from $R_\odot$ to $2R_\odot$ (all in vacuum), $L-\Delta r=1023.5$ m. The weak-field approximation $L-\Delta r\approx\frac{r_s}{2}\ln\frac{r_2}{r_1}=\frac{2953.25}{2}\ln2=1023.5$ m agrees to the digits shown. So 695,700 km of coordinate separation is about 1 km longer as a physical distance.

**G. Connections.**
- EXACT: the metric is the unique spherically symmetric vacuum solution of $R_{\mu\nu}=0$ (Carroll's statement above; this is Birkhoff's theorem).
- EXACT: it is the special case $a=0$ of Kerr (E5). Carroll notes that Boyer–Lindquist coordinates "reduce to Schwarzschild coordinates" as $a\to0$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- EXACT consequences: equations (12), (13) and (14), the effective potential E1, deflection E2, precession E3 and Shapiro delay E4. The last three are weak-field expansions of exact geodesics.
- APPROXIMATE: for $r\gg r_s$ and slow motion it reduces to Newtonian gravity, $g_{tt}\approx-(1+2\Phi/c^2)c^2$.
- Domain caution: inside a star ($r<R_\star$) the exterior solution does not apply; an interior solution is needed.

---

#### (12) The Schwarzschild radius

**A.** SI: $r_s=\dfrac{2GM}{c^2}$. Geometric: $r_s=2M$.

**B.** The radius of the event horizon of a non-rotating black hole of mass $M$. If all the mass lies inside $r_s$, nothing, not even light, can get back out from $r\le r_s$.

**C.** $r_s$ is the Schwarzschild radius (m). $2$ is a pure number fixed by matching the exterior solution to Newtonian orbits (Carroll's $\mu=-2GM$). $G$ is in m³ kg⁻¹ s⁻², $M$ in kg, $c^2$ in m² s⁻². Units check: $\dfrac{(\mathrm{m^3\,kg^{-1}\,s^{-2}})(\mathrm{kg})}{\mathrm{m^2\,s^{-2}}}=\mathrm{m}$.

**D.** Multiplication and division only. $r_s$ is **linear** in $M$, so the mean density inside $r_s$ scales as $M/r_s^3\propto1/M^2$.

**E.** At $r=r_s$, $g_{tt}=0$: a static clock there would tick at zero rate, so no static observers can exist at or inside $r_s$. The horizon area is $4\pi r_s^2$.

**F. Worked values (computed here, $GM$ from IAU nominal values).**
| Body | $GM$ (m³ s⁻²) | $r_s=2GM/c^2$ | context |
|---|---|---|---|
| Sun | $1.3271244\times10^{20}$ | $2\times1.3271244\times10^{20}=2.6542488\times10^{20}$; $\div\,8.98755179\times10^{16}$ = **2953.25 m ≈ 2.95 km** | mean density if compressed to $r_s$: $1.84\times10^{19}$ kg/m³ |
| Earth | $3.986004\times10^{14}$ | $7.972008\times10^{14}/8.98755\times10^{16}$ = **8.870 mm** | — |
| 10 $M_\odot$ black hole | $1.3271\times10^{21}$ | **29.53 km** | mean density $1.84\times10^{17}$ kg/m³ |
| Sgr A*, $4.30\times10^6M_\odot$ (GRAVITY) | $5.7066\times10^{26}$ | **$1.270\times10^{10}$ m = 0.0849 AU = 18.3 $R_\odot$** | with EHT's "~4 × 10⁶": $1.18\times10^{10}$ m |
| M87*, $6.5\times10^9M_\odot$ (EHT 2019) | $8.626\times10^{29}$ | **$1.920\times10^{13}$ m = 128 AU** | mean density 0.44 kg/m³, less than air at sea level |

- Sgr A* mass: GRAVITY finds orbits "in excellent agreement with general relativity orbits around a single central point mass, M = 4.30 × 10⁶ M_sun with a precision of about ±0.25%", and detects the S2 Schwarzschild precession at 7σ. — [GRAVITY Collaboration 2022, A&A 657, L12 (arXiv 2112.07478)](https://arxiv.org/abs/2112.07478)
- EHT Sgr A* (2022, ApJL 930, L12): ring diameter $51.8\pm2.3\ \mu$as. The images are consistent with a Kerr black hole of "about 4 million solar masses", with the mass taken from prior stellar-orbit and maser studies. — [EHT 2022 Paper I (arXiv 2311.08680)](https://arxiv.org/abs/2311.08680)
- EHT M87* (2019, ApJL 875, L1): adopted distance $16.8\pm0.8$ Mpc. Emission-ring diameter $42\pm3\ \mu$as, $\theta_g=GM/(Dc^2)=3.8\pm0.4\ \mu$as, giving "the black hole mass is $M=(6.5\pm0.7)\times10^9M_\odot$". — [EHT 2019 Paper I, ApJL 875 L1](https://doi.org/10.3847/2041-8213/ab0ec7)
- Cross-check (computed here): $\theta_g=GM/(c^2D)$ with $M=6.5\times10^9M_\odot$ and $D=16.8$ Mpc gives $3.82\ \mu$as, consistent with EHT's 3.8 μas.

**G. Connections.**
- EXACT: $r_s$ is the parameter in the Schwarzschild metric and the root of $g_{tt}=0$. For Kerr with $a=0$, the outer horizon $r_+=2GM/c^2$.
- EXACT (within Schwarzschild): the photon sphere is at $\tfrac32r_s=3GM/c^2$ and the innermost stable circular orbit (ISCO) at $3r_s=6GM/c^2$ (E1).
- **ANALOGY, not a derivation:** setting the Newtonian escape speed $\sqrt{2GM/r}$ equal to $c$ gives $r=2GM/c^2$, the same expression. This is a heuristic coincidence. In Newtonian physics light launched below escape speed would still rise and fall back; $r$ in GR is the areal coordinate, not a Newtonian distance; and the horizon is a property of the causal structure of spacetime, not of a launch speed. Label it ANALOGY.

---

#### (13) Gravitational time dilation for a static clock

**A.**
- Exact: $$\frac{d\tau}{dt}=\sqrt{1-\frac{r_s}{r}}=\sqrt{1-\frac{2GM}{rc^2}}\qquad(r>r_s).$$
- Geometric: $d\tau/dt=\sqrt{1-2M/r}$.
- Weak field ($GM/rc^2\ll1$, Taylor expansion $\sqrt{1-x}\approx1-x/2$): $\dfrac{d\tau}{dt}\approx1-\dfrac{GM}{rc^2}=1+\dfrac{\Phi}{c^2}$.
- Derivation: put $dr=d\theta=d\phi=0$ in (11) and use $ds^2=-c^2d\tau^2$. Then $-c^2d\tau^2=-(1-r_s/r)c^2dt^2$, so $d\tau=\sqrt{1-r_s/r}\,dt$.

**B.** A clock held at rest at radius $r$ ticks more slowly than an identical clock far away. The deeper in the potential well, the slower it ticks.

**C.** $\tau$ is the proper time read by the static clock (s). $t$ is the coordinate time, equal to the proper time of a static clock at infinity (s). The ratio $d\tau/dt$ is dimensionless. $\Phi=-GM/r$ is the Newtonian potential (J/kg = m² s⁻²). "Static" means held at fixed $r,\theta,\phi$ by a rocket or by the ground; such a clock is not in free fall. For a moving clock the velocity term adds (see G).

**D.** Square root; Taylor expansion to first order; multiplying a rate by 86 400 s to get a daily offset.

**E.** The clock rate is set by $\sqrt{-g_{tt}}/c$. Static clocks closer to the mass accumulate less proper time. The effect is symmetric in the sense that both observers agree the lower clock is slow: signals exchanged between them show it (eq. 14).

**F. Worked numbers (computed here; "deficit" = $1-d\tau/dt$, i.e. the rate behind a clock at infinity).**
| Location | $r_s/r$ | $d\tau/dt$ (exact) | deficit | per day / comment |
|---|---|---|---|---|
| Earth's surface, $r=6.371\times10^6$ m | $8.870\times10^{-3}/6.371\times10^6=1.3923\times10^{-9}$ | $0.999\,999\,999\,304$ | $6.961\times10^{-10}$ | $6.961\times10^{-10}\times86\,400$ s = **60.1 μs/day** behind infinity; weak-field and exact agree to ~$10^{-19}$ |
| GPS orbit, $a=2.656175\times10^7$ m | $3.339\times10^{-10}$ | $0.999\,999\,999\,833$ | $1.670\times10^{-10}$ | **14.43 μs/day** behind infinity |
| Sun's surface, $R_\odot=6.957\times10^8$ m | $4.245\times10^{-6}$ | $0.999\,997\,877$ | $2.1225\times10^{-6}$ | **0.183 s/day ≈ 67 s/yr** |
| Neutron star, 1.4 $M_\odot$, $R=12$ km (illustrative) | $4.1346/12=0.3445$ | **0.8096** | 0.190 | weak-field formula gives 0.8277, a 2% error, so the weak field fails here; $1+z=1.235$ |
| Near a black hole, $r=1.01\,r_s$ | 0.9901 | **0.0995** | — | 10 s at infinity per 1 s on the clock |
| $r=1.0001\,r_s$ | 0.9999 | **0.0100** | — | 100 : 1; $\to0$ as $r\to r_s$ |

**GPS breakdown (computed here, Ashby-style bookkeeping):**
- Gravitational part, ground minus orbit, spherical Earth with $R=6.371\times10^6$ m: $\frac{GM_E}{c^2}\left(\frac1R-\frac1a\right)=4.4350\times10^{-3}\,\mathrm{m}\times(1.5696\times10^{-7}-3.7648\times10^{-8})\,\mathrm{m^{-1}}=5.29\times10^{-10}$, which is **45.72 μs/day**. Using the exact square-root ratio (mpmath) gives 45.719 μs/day. Using the equatorial geoid including Earth's oblateness ($J_2=1.0826\times10^{-3}$): $GM/(Rc^2)(1+J_2/2)=6.9573\times10^{-10}$ minus $1.6697\times10^{-10}$ gives $5.2876\times10^{-10}$, which is **45.68 μs/day**. So the standard figure "+45.7 μs/day" is the gravitational gain of the orbiting clock relative to the ground.
- Velocity (special-relativistic) part: the satellite speed is $v=\sqrt{GM/a}=3873.8$ m/s and $v^2/2c^2=8.349\times10^{-11}$, i.e. 7.21 μs/day. Subtracting the ground clock's rotational term, $(\omega_ER_{eq})^2/2c^2$ = 0.10 μs/day, leaves a net **−7.11 μs/day**.
- Net: $+45.68-7.11=$ **+38.58 μs/day** $=4.4647\times10^{-10}$. Exactly: $\Phi_0/c^2-3GM/(2ac^2)=6.969290\times10^{-10}-2.50455\times10^{-10}=4.46473\times10^{-10}$.
- Left uncorrected, the clock error times $c$ would accumulate a ranging error of about $c\times38.6\ \mu\mathrm{s}\approx11.6$ km per day.
- The $J_2$ and $\omega_E$ inputs are standard geodetic constants that were not fetched in this session. They reproduce the IAU geoid value $\Phi_0/c^2$ to $5\times10^{-6}$ relative (see Gaps).

Supporting citations:
- Ashby fixes the geoid potential through the IAU TT definition, "$\Phi_0/c^2=6.969290134\times10^{-10}$", and notes "Clocks at rest on the rotating geoid run slow compared to clocks at rest at infinity by about seven parts in $10^{10}$". The orbiting clock "is beating too fast, primarily because its frequency is gravitationally blueshifted", so "the satellite clocks are adjusted lower in frequency". The gravitational and velocity effects "cancel at $a\approx9545$ km". GPS semi-major axis $a_0=2.656175\times10^7$ m. — [Ashby 2003, Living Rev. Relativ. 6, 1 (PMC full text)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)
- "The clock in the satellite runs faster, i.e., it goes ahead about 45.7 µs/d compared with a clock on the Earth's surface, due to gravitational effects". Also $\frac{3GM}{2rc^2}+\frac{\Phi_0}{c^2}=-4.4647\times10^{-10}=-38.58\ \mu$s/d, and the proper frequency is lowered to $(1-4.4647\times10^{-10})\times10.23$ MHz $=10.229\,999\,995\,43$ MHz. — [Pascual-Sánchez, "Introducing Relativity in Global Navigation Satellite Systems", arXiv gr-qc/0507121](https://arxiv.org/abs/gr-qc/0507121)
- Ashby's own workshop slides give the same constant rate term, $-4.4647\times10^{-10}$, plus a periodic eccentricity term $\Delta t_{rel}=-\frac{2}{c^2}\sqrt{GM_Ea}\,e\sin E$. — [Ashby, AAPT GR workshop 2006](https://www.aapt.org/doorway/TGRUTalks/Ashby/ashbyGRworkshop.pdf)

**G. Connections.**
- EXACT special case of (11) for static observers.
- APPROXIMATE: $1+\Phi/c^2$ when $|\Phi|/c^2\ll1$. This is the same weak-field $g_{tt}$ that gives Newtonian gravity.
- EXACT: (14) is the ratio of (13) at two radii.
- EXACT (derived here symbolically): a clock on a circular geodesic orbit, with $\Omega^2=GM/r^3$ in Schwarzschild coordinates, has $d\tau/dt=\sqrt{1-3GM/(rc^2)}$. The extra $GM/rc^2$ is the velocity term $v^2/2c^2$ with $v^2=GM/r$, doubled because $\sqrt{\ }$ halves it. This is the origin of Ashby's "$3GM/2ac^2$".
- ANALOGY: the equivalence-principle rocket, in which a clock at the nose of an accelerating rocket runs fast by $gh/c^2$.

---

#### (14) The gravitational redshift

**A.**
- Exact, static emitter at $r_E$ and static receiver at $r_R$ in Schwarzschild: $$1+z\equiv\frac{\lambda_R}{\lambda_E}=\frac{\nu_E}{\nu_R}=\sqrt{\frac{1-r_s/r_R}{1-r_s/r_E}}.$$
- Receiver at infinity: $1+z=(1-r_s/r_E)^{-1/2}$.
- Weak field: $z\approx\dfrac{\Delta\nu}{\nu}\approx\dfrac{\Phi_R-\Phi_E}{c^2}=\dfrac{GM}{c^2}\left(\dfrac1{r_E}-\dfrac1{r_R}\right)$.
- Uniform field over a height $h$: $z\approx gh/c^2$.
- Geometric: $1+z=\sqrt{(1-2M/r_R)/(1-2M/r_E)}$.
- Will's general parametrisation for tests of local position invariance: $\Delta\nu/\nu=(1+\alpha)\Delta U/c^2$. In GR $\alpha=0$. — [Will 2014](https://arxiv.org/abs/1403.7377)

**B.** Light climbing out of a gravitational well arrives with a lower frequency (redder) than it had when emitted, because the emitter's clock runs slow compared with the receiver's. Light falling in is blueshifted.

**C.** $z$ is the redshift (dimensionless; $z>0$ means redder). $\lambda$ is wavelength (m) and $\nu$ frequency (Hz); subscripts $E$ = emitter, $R$ = receiver. $r_E,r_R$ are areal radii (m). $\Phi$ is the potential (m² s⁻²), $g$ the local gravitational acceleration (m s⁻²), $h$ the height difference (m). $\Delta\nu=\nu_E-\nu_R$.

**D.** A ratio of square roots, then a first-order Taylor expansion. A numerical caution: evaluating $\sqrt{(1-r_s/r_R)/(1-r_s/r_E)}-1$ directly in double precision for a 22.5 m tower gives $2.4425\times10^{-15}$, which is 0.6% wrong because of round-off (subtracting numbers equal to 1 in their first 15 digits). The stable form `expm1(0.5*log1p(x))`, or mpmath, gives $2.458454\times10^{-15}$. Use the weak-field form for small effects (found while computing here).

**E.** The redshift tests the equivalence principle (local position invariance): any clock runs at a rate set by $g_{tt}$. It does not test the full field equations. Will groups it under "tests of Einstein's equivalence principle". — [Will 2014](https://arxiv.org/abs/1403.7377)

**F. Worked examples and experiments.**
- **Pound–Rebka (Harvard tower).** $h=22.5$ m: $gh/c^2=9.81\times22.5/8.98755\times10^{16}=220.725/8.98755\times10^{16}=$ **$2.456\times10^{-15}$** (computed here). The exact Schwarzschild value for $r=6.371\times10^6\to6.371\times10^6+22.5$ m is $2.4585\times10^{-15}$ (computed here, mpmath). For the 14.4 keV ⁵⁷Fe gamma ray this is an energy shift of $3.5\times10^{-11}$ eV. The up-minus-down two-way difference is $4.9\times10^{-15}$. The tower height is quoted as 22.5 m or 22.6 m in different sources. — [Wikipedia, Glen Rebka (cross-check)](https://en.wikipedia.org/wiki/Glen_Rebka)
- Will: "The first successful, high-precision redshift measurement was the series of Pound–Rebka–Snider experiments of 1960–1965 that measured the frequency shift of gamma-ray photons from ⁵⁷Fe as they ascended or descended the Jefferson Physical Laboratory tower at Harvard University. The high accuracy achieved – one percent – was obtained by making use of the Mössbauer effect". — [Will 2014](https://arxiv.org/abs/1403.7377)
- Pound & Snider 1965 (Phys. Rev. 140, B788): result $0.9990\pm0.0076$ times the equivalence-principle prediction, with an estimated systematic-error limit of 0.010. Taken from the APS record as summarised by search. — [APS record](https://link.aps.org/doi/10.1103/PhysRev.140.B788). Original 1960 paper: Pound & Rebka, PRL 4, 337 — [DOI](https://doi.org/10.1103/PhysRevLett.4.337) (not retrievable here; see Gaps)
- **Gravity Probe A (Vessot–Levine, June 1976).** Will: "A hydrogen-maser clock was flown on a rocket to an altitude of about 10,000 km and its frequency compared to a hydrogen-maser clock on the ground … Analysis of the data yielded a limit $|\alpha|<2\times10^{-4}$." — [Will 2014](https://arxiv.org/abs/1403.7377). The figure "$7\times10^{-5}$ (70 ppm)", the agreement with GR stated in Vessot et al. 1980 (PRL 45, 2081, [DOI](https://doi.org/10.1103/PhysRevLett.45.2081)), is repeated by secondary sources. — [Wikipedia, Gravity Probe A](https://en.wikipedia.org/wiki/Gravity_Probe_A); [Turyshev 2008 review, arXiv 0806.1731](https://arxiv.org/abs/0806.1731). The two numbers describe different things (a quoted agreement level vs Will's conservative bound on $\alpha$); state both. Computed here: at a 10,000 km apex, $\Delta\Phi/c^2=\frac{GM_E}{c^2}\left(\frac1{R_E}-\frac1{R_E+10^7\,\mathrm m}\right)=4.25\times10^{-10}$, the gravitational part before the velocity correction.
- **Solar redshift.** Computed here: $cz=GM_\odot/(R_\odot c)=1.3271244\times10^{20}/(6.957\times10^8\times2.99792458\times10^8)=$ **636.31 m/s** for a receiver at infinity ($z=2.1225\times10^{-6}$). For a receiver on Earth, subtract the Sun's potential at 1 AU (2.96 m/s) and Earth's own surface potential (0.21 m/s) to get **633.14 m/s**. González Hernández et al. (A&A 643, A146, 2020), from HARPS laser-frequency-comb spectra of sunlight reflected by the Moon, measured **$638\pm6$ m/s** (weak Fe lines) and $639\pm14$ m/s (strong Fe I lines), versus "the expected theoretical value on Earth of ∼633.1 m/s". — [arXiv 2009.10558](https://arxiv.org/abs/2009.10558)
- **Millimetre-scale optical-clock measurement (Bothwell et al. 2022, Nature 602, 420–424).** Authors: Bothwell, Kennedy, Aeppli, Kedar, Robinson, Oelker, Staron, Ye (JILA). They "measure a linear frequency gradient consistent with the gravitational redshift within a single millimeter scale sample of ultracold strontium", with fractional frequency uncertainty "7.6×10⁻²¹". The arXiv text gives "The gravitational redshift at Earth's surface corresponds to a fractional frequency gradient of −1.09×10⁻¹⁹/mm" and "a final frequency gradient of −9.8(2.3)×10⁻²⁰/mm, consistent with the predicted redshift". — [arXiv 2109.12238](https://arxiv.org/abs/2109.12238). Check (computed here): $g/c^2=9.80\times10^{-3}\,\mathrm{m}/c^2=1.090\times10^{-19}$ per mm.
- Will also cites an earlier optical-clock (Al⁺ ion) measurement of "the frequency shift over a height of 1/3 of a meter". — [Will 2014](https://arxiv.org/abs/1403.7377)

**G. Connections.**
- EXACT: the ratio of (13) at two radii, via the conserved photon energy $-p_t$ (time-translation symmetry).
- APPROXIMATE: $\Delta\Phi/c^2$, and $gh/c^2$ for a uniform field (requires $h\ll R$ and $|\Phi|\ll c^2$).
- ANALOGY: the Doppler shift in an accelerating rocket (equivalence principle).
- Distinct, not the same effect: cosmological redshift $1+z=a_{\rm obs}/a_{\rm emit}$ follows from FLRW (19). It is expansion, not a static potential difference.

---

#### (15) The geodesic deviation equation

**A.**
- Carroll eq. (3.113): $$A^\mu=\frac{D^2S^\mu}{dt^2}=R^\mu{}_{\nu\rho\sigma}T^\nu T^\rho S^\sigma,$$ with $T^\mu$ the tangent to the geodesics, $S^\mu$ the separation vector and $t$ an affine parameter. Carroll: "It expresses something that we might have expected: the relative acceleration between two neighboring geodesics is proportional to the curvature … the acceleration of neighboring geodesics is interpreted as a manifestation of gravitational tidal forces." — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- In the brief's notation: $\dfrac{D^2\xi^\mu}{d\tau^2}=R^\mu{}_{\nu\rho\sigma}u^\nu u^\rho\xi^\sigma$. Wikipedia uses the same index placement: $\frac{D^2X^\mu}{d\tau^2}=R^\mu{}_{\nu\rho\sigma}T^\nu T^\rho X^\sigma$. — [Wikipedia, Geodesic deviation](https://en.wikipedia.org/wiki/Geodesic_deviation)
- The MTW-style form $\frac{D^2\xi^\mu}{d\tau^2}+R^\mu{}_{\nu\sigma\rho}u^\nu\xi^\sigma u^\rho=0$ is the same equation, by antisymmetry in the last index pair (Carroll 3.64). This is an inference; MTW was not fetched.
- Newtonian analogue: $\dfrac{d^2\xi^i}{dt^2}=-\left(\partial_i\partial_j\Phi\right)\xi^j$.

**B.** Two free-falling particles that start side by side and at rest relative to each other do not stay that way. Their separation accelerates by an amount set by the spacetime curvature and proportional to how far apart they are. Gravity in GR is curvature, and curvature shows up physically as tides.

**C. Symbol-by-symbol anatomy (SI, coordinates in metres with $x^0=ct$).**
| Symbol | Meaning | SI unit |
|---|---|---|
| $\xi^\mu$ (Carroll's $S^\mu$) | separation 4-vector from one geodesic to a neighbouring one; index $\mu=0,1,2,3$ (upper = contravariant component) | m |
| $\tau$ | proper time along the reference geodesic | s |
| $\frac{D}{d\tau}=u^\alpha\nabla_\alpha$ | covariant derivative along the curve: the ordinary derivative plus Christoffel terms that correct for curved coordinates | — |
| $\frac{D^2}{d\tau^2}$ | applied twice, giving the relative acceleration $A^\mu$ | m s⁻² |
| $u^\nu=dx^\nu/d\tau$ | four-velocity of the reference observer ($u^\mu u_\mu=-c^2$) | m s⁻¹ |
| $R^\mu{}_{\nu\rho\sigma}$ | Riemann curvature tensor: first (upper) index = output component; $\nu,\rho$ contracted with $u$ twice; $\sigma$ contracted with $\xi$ | m⁻² |
| repeated indices | summed over 0..3 (Einstein convention), so for each $\mu$ the right side sums 4×4×4 = 64 terms | — |
| Units check | $[\mathrm m^{-2}][\mathrm m\,\mathrm s^{-1}]^2[\mathrm m]=\mathrm m\,\mathrm s^{-2}$ | — |
Riemann has $4^4=256$ components but only 20 independent ones in four dimensions (standard count). Newtonian side: $\Phi$ in m² s⁻²; $\partial_i\partial_j\Phi$ is the 3×3 tidal tensor (s⁻²).

**D.** Two covariant derivatives (product rule plus Christoffel corrections), contraction of a rank-4 tensor with three vectors, and a linear map from separation to acceleration.

**E. Physical interpretation and sign convention (rederived here).**
- Take a static/radial observer and the orthonormal frame of the Schwarzschild metric. sympy gives $R^{\hat r}{}_{\hat t\hat r\hat t}=-\dfrac{2GM}{c^2r^3}$ and $R^{\hat\theta}{}_{\hat t\hat\theta\hat t}=R^{\hat\phi}{}_{\hat t\hat\phi\hat t}=+\dfrac{GM}{c^2r^3}$. For $\Phi=-GM/r$: $\partial_r^2\Phi=-2GM/r^3$ and $\frac1r\partial_r\Phi=+GM/r^3$.
- So in Carroll/MTW convention $R^i{}_{0j0}\approx+\partial_i\partial_j\Phi/c^2$. The deviation equation with $u\approx(c,0,0,0)$ then gives $A^i=c^2R^i{}_{00j}\xi^j=-c^2R^i{}_{0j0}\xi^j=-\partial_i\partial_j\Phi\,\xi^j$, which is exactly the Newtonian tidal law.
- Result: **radial stretch $+2GM\xi/r^3$, transverse squeeze $-GM\xi/r^3$**.
- **Pitfall for the writer:** Wikipedia writes "$A^i=R^i{}_{0j0}X^j$" with "$R^i{}_{0j0}=-\partial^2\Phi/\partial x^i\partial x^j$". The physics comes out right because the index order and the sign are each flipped relative to the general formula above it. Do not copy Wikipedia's intermediate line into a document that uses Carroll's ordering. — [Wikipedia, Geodesic deviation (raw text checked)](https://en.wikipedia.org/wiki/Geodesic_deviation)
- In vacuum the Ricci tensor (the trace $R^\lambda{}_{\mu\lambda\nu}$) vanishes, so the tidal tensor is trace-free: $-2+1+1=0$. This is the GR version of $\nabla^2\Phi=0$ outside matter (inference from Carroll 3.90 and the symbolic result).

**F. Worked tidal accelerations across a 2 m body (computed here; radial $=2GM\ell/r^3$, transverse $=GM\ell/r^3$, $\ell=2$ m).**
| Situation | $r$ | radial stretch | in units of g = 9.80665 m/s² |
|---|---|---|---|
| Human standing on Earth | $6.371\times10^6$ m: $r^3=2.5860\times10^{20}$; $2\times3.986004\times10^{14}\times2=1.5944\times10^{15}$ | **$6.17\times10^{-6}$ m/s²** (transverse $3.08\times10^{-6}$) | $6.3\times10^{-7}$ g |
| 10 $M_\odot$ black hole, at $r=r_s=29{,}532$ m | $r^3=2.5758\times10^{13}$; numerator $5.3085\times10^{21}$ | **$2.06\times10^{8}$ m/s²** | **$2.1\times10^7$ g**: spaghettified long before the horizon. The stretch is already 10 g at $r\approx3{,}780$ km $\approx128\,r_s$ |
| Sgr A* ($4.3\times10^6M_\odot$), at $r=r_s=1.270\times10^{10}$ m | — | **$1.11\times10^{-3}$ m/s²** | $1.1\times10^{-4}$ g: crosses the horizon unharmed; 10 g is reached only at $r\approx0.022\,r_s$, inside the horizon |
| M87* at $r_s$ | — | $4.9\times10^{-10}$ m/s² | $5\times10^{-11}$ g |
At the horizon, tidal acceleration scales as $M/r_s^3\propto1/M^2$, so bigger black holes are gentler at the horizon.

**G. Connections.**
- EXACT: follows from the geodesic equation plus the definition of Riemann (Carroll §3).
- APPROXIMATE: reduces to the Newtonian tidal law when fields are weak and speeds slow, with $R^i{}_{0j0}\approx\partial_i\partial_j\Phi/c^2$.
- In Schwarzschild, the frame components $\mp2GM/(c^2r^3)$ and $\pm GM/(c^2r^3)$ are exact, so the "Newtonian-looking" formula $2GM\ell/r^3$ is exact in GR for static or radially moving observers, with $r$ the areal radius. This is a standard result (MTW §31.2, not fetched); the static-frame part was confirmed symbolically here.
- EXACT link to (18): a gravitational wave's effect on a ring of test masses is geodesic deviation in the TT metric (Carroll 6.63–6.66).
- ANALOGY: ocean tides.

---

#### (16) The Einstein–Hilbert action

**A. Exact forms.**
- Wikipedia (signature $-+++$): $S=\frac{1}{2\kappa}\int R\sqrt{-g}\,d^4x$ with $\kappa=8\pi G c^{-4}$. With matter and $\Lambda$: $S=\int\left[\frac{1}{2\kappa}(R-2\Lambda)+\mathcal L_M\right]\sqrt{-g}\,d^4x$, and $T_{\mu\nu}:=\frac{-2}{\sqrt{-g}}\frac{\delta(\sqrt{-g}\,\mathcal L_M)}{\delta g^{\mu\nu}}$. — [Wikipedia, Einstein–Hilbert action](https://en.wikipedia.org/wiki/Einstein%E2%80%93Hilbert_action)
- SI form for the document: $$S=\frac{c^4}{16\pi G}\int(R-2\Lambda)\sqrt{-g}\,d^4x+S_{\rm matter}.$$ The units of $d^4x$ need care; see C.
- Geometric: $S=\frac{1}{16\pi}\int(R-2\Lambda)\sqrt{-g}\,d^4x+S_M$.
- Carroll's 1997 notes use a different but equivalent normalisation: $S_H=\int d^nx\,\mathcal L_H$ with $\mathcal L_H=\sqrt{-g}R$ (4.54), the total action "$S=\frac{1}{8\pi G}S_H+S_M$" (4.68), and $T_{\mu\nu}=-\frac{1}{\sqrt{-g}}\frac{\delta S_M}{\delta g^{\mu\nu}}$ (4.70). He notes "the proper normalization is somewhat convention-dependent". The factor of 2 moved from the action into the definition of $T_{\mu\nu}$, and both give $G_{\mu\nu}=8\pi GT_{\mu\nu}$. On naming, Carroll writes that "Einstein himself derived the equations independently, so they are rightly named after Einstein. The action, however, is rightly called the Hilbert action." He also notes that the Ricci scalar is "the only independent scalar constructed from the metric, which is no higher than second order in its derivatives". — [Carroll notes, §4](https://arxiv.org/abs/gr-qc/9712019)
- Key variation identity (Carroll 4.65): $\delta\sqrt{-g}=-\tfrac12\sqrt{-g}\,g_{\mu\nu}\delta g^{\mu\nu}$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)

**B.** Among all possible spacetime geometries, the real one makes this single number, the action, stationary: unchanged to first order under any small change of the metric. "Stationary action" is the master principle, and Einstein's equations are what it produces.

**C. Symbol-by-symbol anatomy.**
| Symbol | Meaning | SI unit |
|---|---|---|
| $S$ | action: a single number assigned to an entire spacetime history | J·s (see the units note below) |
| $c^4/(16\pi G)$ | coupling prefactor: $c^4/G=1.2103\times10^{44}$ N, so $c^4/16\pi G=2.4077\times10^{42}$ N (computed here). It is huge, so spacetime is very stiff | N = kg m s⁻² |
| $16\pi$ | $=2\times8\pi$. The 2 cancels the ½ that comes from varying the matter action / defining $T_{\mu\nu}$. $8\pi=2\times4\pi$: the $4\pi$ is from Poisson's $\nabla^2\Phi=4\pi G\rho$, and the extra 2 is because $g_{00}\approx-(1+2\Phi/c^2)$ | — |
| $\int\dots d^4x$ | integral over a 4D region of spacetime; $d^4x=dx^0dx^1dx^2dx^3$ | m⁴ if $x^0=ct$ |
| $g=\det(g_{\mu\nu})$ | determinant of the 4×4 metric matrix. It is negative for signature $(-,+,+,+)$, so $-g>0$ | — (with $x^0=ct$) |
| $\sqrt{-g}\,d^4x$ | invariant 4-volume element (equal to $d^4x$ in Minkowski Cartesian coordinates) | m⁴ |
| $R=g^{\mu\nu}R_{\mu\nu}$ | Ricci scalar, the fully contracted curvature | m⁻² |
| $\Lambda$ | cosmological constant; Planck 2018 gives $\Lambda=3\Omega_\Lambda H_0^2/c^2=1.09\times10^{-52}$ m⁻² (computed here) | m⁻² |
| $2\Lambda$ | the factor 2 makes $\Lambda$ appear as $+\Lambda g_{\mu\nu}$ in the field equations | m⁻² |
| $S_{\rm matter}=\int\mathcal L_M\sqrt{-g}\,d^4x$ | action of all non-gravitational fields; its metric variation defines $T_{\mu\nu}$ | J·s |
| $\delta$ | "small variation of", here a variation of the function $g^{\mu\nu}(x)$ | — |
- **Units note (dimensional analysis, done here).** If all four coordinates are lengths ($x^0=ct$), then $\int R\sqrt{-g}\,d^4x$ has units m⁻²·m⁴ = m², and $\frac{c^4}{16\pi G}\times$m² = N·m² = J·m, which is not J·s. Two consistent fixes give J·s: (i) write the prefactor as $c^3/(16\pi G)$ with $d^4x=d(ct)\,d^3x$. This is the Landau–Lifshitz form $S_g=-\frac{c^3}{16\pi k}\int R\sqrt{-g}\,d\Omega$, quoted from memory; their sign differs because of their $(+,-,-,-)$ signature, and the book was not fetched. Or (ii) keep $c^4/(16\pi G)$ but integrate $dt\,d^3x$ with $g_{\mu\nu}$ written in $(ct,x,y,z)$ coordinates, so that $\sqrt{-g}$ is dimensionless. State this explicitly in the document, because the commonly printed "$c^4/16\pi G\int R\sqrt{-g}\,d^4x$" leaves the units of $d^4x$ implicit.

**D. Operations: what "varying the action" means.**
1. Replace $g^{\mu\nu}\to g^{\mu\nu}+\delta g^{\mu\nu}$, with $\delta g^{\mu\nu}$ small and zero on the boundary of the region.
2. Expand $S$ to first order in $\delta g^{\mu\nu}$. This uses $\delta\sqrt{-g}=-\tfrac12\sqrt{-g}g_{\mu\nu}\delta g^{\mu\nu}$ and the fact that $\delta R_{\mu\nu}$ contributes only a boundary term after integration by parts (Carroll: "(δS)₁ does not contribute").
3. Collect terms: $\delta S=\int\sqrt{-g}\left[\frac{c^4}{16\pi G}\left(R_{\mu\nu}-\tfrac12Rg_{\mu\nu}+\Lambda g_{\mu\nu}\right)-\tfrac12T_{\mu\nu}\right]\delta g^{\mu\nu}d^4x$.
4. Demand $\delta S=0$ for every $\delta g^{\mu\nu}$, so the bracket must vanish everywhere: $G_{\mu\nu}+\Lambda g_{\mu\nu}=\frac{8\pi G}{c^4}T_{\mu\nu}$.
The pure-gravity part of this follows Carroll 4.55–4.70; the $\Lambda$ bookkeeping is an inference.

**E. Interpretation.** The action packages all of GR into one scalar. Its symmetry under any change of coordinates forces $\nabla_\mu T^{\mu\nu}=0$ automatically; Carroll says conservation "is in fact automatically true". The action is also the starting point for every attempt at quantum gravity, where it enters as $e^{iS/\hbar}$, which is why its units being those of $\hbar$ (J·s) matters.

**F. Worked example: the principle of stationary action in classical mechanics (computed here).**
- Ball thrown straight up and caught at the same height: $m=1$ kg, $g=9.81$ m/s², flight time $T=2$ s, $y(0)=y(T)=0$.
- $L=\tfrac12m\dot y^2-mgy$. The Euler–Lagrange equation $\frac{d}{dt}\frac{\partial L}{\partial\dot y}-\frac{\partial L}{\partial y}=0$ gives $m\ddot y=-mg$, so the true path is $y_0(t)=\tfrac g2t(T-t)$.
- Action of the true path: $S_0=\int_0^T\left(\tfrac12m\dot y_0^2-mgy_0\right)dt=-\dfrac{mg^2T^3}{24}=-\dfrac{1\times96.2361\times8}{24}=$ **−32.0787 J·s**. Midpoint integration with $2\times10^5$ steps agrees to all printed digits.
- Perturb the path by $y=y_0+\varepsilon\sin(\pi t/T)$, which still satisfies the endpoints. The term linear in $\varepsilon$ is $\varepsilon\int(m\dot y_0\dot\eta-mg\eta)\,dt=0$ after integrating by parts with $m\ddot y_0=-mg$. The quadratic term is $\tfrac12m\varepsilon^2\int_0^T(\pi/T)^2\cos^2(\pi t/T)\,dt=\tfrac12m\varepsilon^2(\pi/T)^2(T/2)=\dfrac{m\pi^2\varepsilon^2}{4T}$.
- Numbers: $\varepsilon=\pm0.1$ m gives $S-S_0=+0.012337$ J·s, for either sign. $\varepsilon=0.5$ m gives $+0.308425$ J·s. Numerical integration agrees with $m\pi^2\varepsilon^2/4T$ to 6 digits.
- Conclusion: the change is second order in $\varepsilon$, so the true path is stationary (here, a minimum). Einstein–Hilbert is the same idea, with the unknown "path" being the metric field $g_{\mu\nu}(x)$ over all of spacetime.

**G. Connections.**
- EXACT: $\delta S/\delta g^{\mu\nu}=0$ gives the Einstein field equations with $\Lambda$ (Carroll 4.68–4.70; Wikipedia).
- EXACT: the $-2\Lambda$ term becomes $+\Lambda c^2/3$ in the Friedmann equation (19).
- APPROXIMATE: expanding $S$ to second order in $h_{\mu\nu}$ about flat spacetime gives the action of linearised gravity, whose field equation is (18).
- ANALOGY: Hamilton's principle in mechanics (F above) and the Maxwell action in electromagnetism.

---

#### (18) Gravitational waves: linearised equations, vacuum wave equation, TT plane waves, quadrupole formula

**A. Exact forms (Carroll §6, with $c$ restored by the rule $x^0=ct$, $G\to G/c^4$ in the source term).**
1. Perturbation: $g_{\mu\nu}=\eta_{\mu\nu}+h_{\mu\nu}$, with $|h_{\mu\nu}|\ll1$.
2. Trace: $h=\eta^{\mu\nu}h_{\mu\nu}$. Trace-reversed perturbation: $\bar h_{\mu\nu}=h_{\mu\nu}-\tfrac12\eta_{\mu\nu}h$ (Carroll 6.20). "The name makes sense, since $\bar h^\mu{}_\mu=-h^\mu{}_\mu$."
3. Lorenz/harmonic gauge: $\partial^\mu\bar h_{\mu\nu}=0$ (Carroll 6.21: $\partial_\mu\bar h^\mu{}_\lambda=0$). Carroll: "This condition is also known as Lorentz gauge (or Einstein gauge or Hilbert gauge or de Donder gauge or Fock gauge)."
4. Linearised field equations: $\Box\bar h_{\mu\nu}=-\dfrac{16\pi G}{c^4}T_{\mu\nu}$ (Carroll 6.22 with $c=1$: $\Box\bar h_{\mu\nu}=-16\pi GT_{\mu\nu}$), where $\Box=\eta^{\mu\nu}\partial_\mu\partial_\nu=-\dfrac{1}{c^2}\dfrac{\partial^2}{\partial t^2}+\nabla^2$.
5. Vacuum: $\Box\bar h_{\mu\nu}=0$ (Carroll 6.23), "simply the conventional relativistic wave equation". Disturbances travel at $c$.
6. Transverse-traceless (TT) plane wave moving along $z$: $$h^{TT}_{\mu\nu}=\begin{pmatrix}0&0&0&0\\0&h_+&h_\times&0\\0&h_\times&-h_+&0\\0&0&0&0\end{pmatrix}\cos\!\big[\omega(t-z/c)\big].$$ In TT gauge $\bar h^{TT}_{\mu\nu}=h^{TT}_{\mu\nu}$ (Carroll 6.54), "so we can drop the bars". The TT part of any plane wave is obtained with the projector $P_{\mu\nu}=\eta_{\mu\nu}-n_\mu n_\nu$: $h^{TT}_{\mu\nu}=P_\mu{}^\rho P_\nu{}^\sigma h_{\rho\sigma}-\tfrac12P_{\mu\nu}P^{\rho\sigma}h_{\rho\sigma}$ (6.55–6.57).
7. Effect on test masses (Carroll 6.65–6.66, + polarisation): $S^1=\left(1+\tfrac12C_+e^{ik_\sigma x^\sigma}\right)S^1(0)$ and $S^2=\left(1-\tfrac12C_+e^{ik_\sigma x^\sigma}\right)S^2(0)$: "particles initially separated in the $x^1$ direction will oscillate back and forth in the $x^1$ direction". — [Carroll notes, §6](https://arxiv.org/abs/gr-qc/9712019)
8. Quadrupole formula (Carroll 6.83–6.85): $\bar h_{ij}(t,\mathbf x)=\dfrac{2G}{3R}\dfrac{d^2q_{ij}}{dt^2}(t_r)$ with $q_{ij}=3\int y^iy^jT^{00}d^3y$ and $t_r=t-R$. "The gravitational wave produced by an isolated nonrelativistic object is therefore proportional to the second derivative of the quadrupole moment of the energy density". SI with the mass moment $I_{ij}=\int\rho\,x^ix^j\,d^3x$: since $T^{00}=\rho c^2$ gives $q_{ij}=3c^2I_{ij}$, $$h_{ij}\approx\bar h_{ij}=\frac{2G}{c^4r}\,\ddot I_{ij}(t-r/c).$$ The conversion is an inference by restoring $c$; units check: $\frac{\mathrm{m^3kg^{-1}s^{-2}}\cdot\mathrm{kg\,m^2s^{-2}}}{\mathrm{m^4s^{-4}}\cdot\mathrm m}=1$. Carroll on why there is no dipole radiation: "oscillation of the center of mass of an isolated system violates conservation of momentum".
9. Quadrupole power: $P=\dfrac{G}{5c^5}\left\langle\dddot Q_{ij}\dddot Q_{ij}\right\rangle$ with the trace-free $Q_{ij}=\int\rho\left(x_ix_j-\tfrac13\delta_{ij}r^2\right)d^3x$. For a circular binary of separation $a$: $P=\dfrac{32}{5}\dfrac{G^4}{c^5}\dfrac{(m_1m_2)^2(m_1+m_2)}{a^5}$ (Einstein 1918; Peters & Mathews 1963, Phys. Rev. 131, 435, [DOI](https://doi.org/10.1103/PhysRev.131.435), not fetched). Wikipedia's matching orbital-decay rate is $\frac{dr}{dt}=-\frac{64}{5}\frac{G^3}{c^5}\frac{(m_1m_2)(m_1+m_2)}{r^3}$, and it states the Earth–Sun system loses "only 200 watts" to gravitational radiation. — [Wikipedia, Gravitational wave (cross-check)](https://en.wikipedia.org/wiki/Gravitational_wave). Computed here: Earth–Sun $P=196.3$ W.
10. Binary-pulsar orbital decay (Will eq. 106, $G=c=1$): $\dot P_b=-\dfrac{192\pi}{5}(2\pi\mathcal M f_b)^{5/3}F(e)$, with $f_b=1/P_b$, chirp mass $\mathcal M=\eta^{3/5}m$ and $F(e)=\left(1+\tfrac{73}{24}e^2+\tfrac{37}{96}e^4\right)(1-e^2)^{-7/2}$ (the explicit form of $F(e)$ is the standard Peters–Mathews enhancement factor; it reproduces Will's number, see F). — [Will 2014](https://arxiv.org/abs/1403.7377)

**B.** Far from sources, small ripples in the metric obey the same wave equation as light and travel at $c$. A passing wave stretches space along one axis while squeezing it along the perpendicular axis, then reverses, twice per wave cycle for each polarisation. Accelerating masses make these ripples. The leading source is a changing quadrupole moment (shape), not a dipole.

**C. Symbol-by-symbol anatomy.**
| Symbol | Meaning | SI unit |
|---|---|---|
| $\eta_{\mu\nu}$ | flat Minkowski metric, diag(−1,1,1,1) | — |
| $h_{\mu\nu}$ | small metric perturbation (strain) | dimensionless |
| $h=\eta^{\mu\nu}h_{\mu\nu}$ | trace (sum over the diagonal with signs) | — |
| $\bar h_{\mu\nu}$ | trace-reversed perturbation | — |
| $\partial^\mu=\eta^{\mu\nu}\partial_\nu$ | partial derivative with the index raised | m⁻¹ |
| $\Box$ | d'Alembertian (wave operator) $-c^{-2}\partial_t^2+\partial_x^2+\partial_y^2+\partial_z^2$ | m⁻² |
| $16\pi G/c^4$ | coupling $=2\kappa=4.15\times10^{-43}$ s² kg⁻¹ m⁻¹ (computed here: $8\pi G/c^4=2.0766\times10^{-43}$); units check: N⁻¹ × (J m⁻³ = N m⁻²) = m⁻², matching $\Box\bar h$ | N⁻¹ (= s² kg⁻¹ m⁻¹) |
| $T_{\mu\nu}$ | stress-energy tensor (energy density, momentum flux, stress) | J m⁻³ = Pa |
| $h_+,h_\times$ | the two polarisation amplitudes ("plus" and "cross", rotated 45°) | — |
| $\omega$, $k$ | angular frequency (rad s⁻¹), wavenumber $k=\omega/c$ (rad m⁻¹) | — |
| $I_{ij}$ / $Q_{ij}$ | second mass moment / trace-free quadrupole moment; $i,j=1,2,3$ spatial | kg m² |
| $\ddot I_{ij}$, $\dddot Q_{ij}$ | second and third time derivatives | kg m² s⁻², kg m² s⁻³ |
| $r$ | distance to the source (far zone) | m |
| $t-r/c$ | retarded time: the source is seen as it was when the wave left | s |
| $\langle\ \rangle$ | average over several wave periods | — |
| $P$ | radiated power | W |

**D.** Linearisation (keep first order in $h$), a gauge choice (a coordinate freedom used to simplify), second partial derivatives, the wave equation, a Green's-function solution (Carroll 6.71–6.72), and time derivatives of moment integrals.

**E.** The two physical degrees of freedom are $h_+$ and $h_\times$; the other components are gauge. Detectors measure $\Delta L/L\sim h/2$ per arm, and the differential arm length is $\Delta L\approx hL$ for an optimally oriented + wave. GR radiation is quadrupolar and very weak because $G/c^4$ is tiny.

**F. Worked numbers.**
- **GW150914 (Abbott et al. 2016, PRL 116, 061102).** "On September 14, 2015 at 09:50:45 UTC", the signal "sweeps upwards in frequency from 35 to 250 Hz with a peak gravitational-wave strain of $1.0\times10^{-21}$". Matched-filter SNR 24, significance "greater than 5.1σ". Initial masses $36^{+5}_{-4}M_\odot$ and $29^{+4}_{-4}M_\odot$, final $62^{+4}_{-4}M_\odot$, "$3.0^{+0.5}_{-0.5}M_\odot c^2$ radiated in gravitational waves", luminosity distance $410^{+160}_{-180}$ Mpc, $z=0.09^{+0.03}_{-0.04}$. — [arXiv 1602.03837](https://arxiv.org/abs/1602.03837) ([PRL DOI](https://doi.org/10.1103/PhysRevLett.116.061102))
- Arm-length change: $\Delta L=hL=1.0\times10^{-21}\times4000\ \mathrm m=$ **$4\times10^{-18}$ m** (differential, x-arm minus y-arm), i.e. $\pm2\times10^{-18}$ m per arm (computed here). LIGO's summary: the arm-length difference was "a mere 4e-18 meters, or about 1/200th the diameter of a proton", with arms "each two and one-half miles (4 kilometers) long". — [LIGO science summary, GW150914 detector](https://ligo.org/science-summaries/gw150914detector/). Computed here with proton diameter $2\times0.8409$ fm $=1.68$ fm, the ratio is about 1/420; LIGO's 1/200 presumably assumes a smaller "diameter" (see Gaps).
- Energy: $3.0M_\odot c^2=3.0\times1.98841\times10^{30}\times8.98755\times10^{16}=$ **$5.36\times10^{47}$ J**. Distance: $410\ \mathrm{Mpc}=1.265\times10^{25}$ m $=1.34\times10^9$ light-years (a distance, not a light-travel time). Computed here.
- Order-of-magnitude quadrupole check (computed here; formula is the standard leading-order circular-binary amplitude $h_0=\frac{4}{r}\left(\frac{G\mathcal M}{c^2}\right)^{5/3}\left(\frac{\pi f}{c}\right)^{2/3}$, not fetched):
  - Chirp mass $\mathcal M=(m_1m_2)^{3/5}/(m_1+m_2)^{1/5}=(36\times29)^{0.6}/65^{0.2}=28.1M_\odot$ (source frame).
  - At $f_{GW}=150$ Hz and $r=410$ Mpc, $h_0\approx2.1\times10^{-21}$, the same order as the measured peak $1.0\times10^{-21}$. Orientation and detector-response factors are ≤ 1, and near merger the separation is only ≈ 340 km with $v/c\approx0.5$, so the slow-motion quadrupole approximation is being pushed beyond its validity there.
- **Hulse–Taylor pulsar B1913+16.** Will's Table 7: $e=0.6171334(5)$, $P_b=0.322997448911(4)$ d, $\langle\dot\omega\rangle=4.226598(5)$°/yr, $\dot P_b=-2.423(1)\times10^{-12}$. Masses 1.4398 and 1.3886 $M_\odot$; GR prediction $\dot P_b=-2.402531\pm0.000014\times10^{-12}$; galactic correction $-(0.027\pm0.005)\times10^{-12}$; corrected observation $-(2.396\pm0.005)\times10^{-12}$; "$\dot P_b^{\rm corr}/\dot P_b^{\rm GR}=0.997\pm0.002$" (eq. 107). — [Will 2014](https://arxiv.org/abs/1403.7377). Weisberg & Huang (2016, ApJ 829, 55) analysed 9257 times of arrival over about 35 years and find an observed/GR ratio of "0.9983 ± 0.0016". — [arXiv 1606.02744](https://arxiv.org/abs/1606.02744)
- Computed here from Will's inputs: $F(e)=11.857$ and $\dot P_b^{GR}=-2.40256\times10^{-12}$ (Will: $-2.402531\times10^{-12}$; the residual comes from rounding of the masses and $GM_\odot$), i.e. the orbit shrinks its period by 75.8 μs per year. The predicted periastron advance from the same masses is 4.2266°/yr, matching the observed 4.226598°/yr; that is a consistency check, since this quantity was used to fix the masses.

**G. Connections.**
- EXACT: linearisation of the Einstein equations to first order in $h$; within linear theory the vacuum equation is an exact wave equation.
- APPROXIMATE: the quadrupole formulas assume slow motion ($v\ll c$), a source much smaller than a wavelength, and the far zone ($r\gg\lambda$).
- EXACT link to (15): detectors respond through geodesic deviation.
- EXACT link to (16): the linearised equations follow from the quadratic part of the action.
- ANALOGY: electromagnetic radiation. GR has no dipole radiation (momentum conservation), so the quadrupole leads (Carroll).
- APPROXIMATE: in the static, slow limit $\bar h_{00}$ reduces to the Newtonian potential (Carroll derives the weak-field metric from 6.22).

---

#### (19) The Friedmann equations, the FLRW metric and the fluid equation

**A. Exact forms.**
- FLRW metric (Carroll 8.7, $c=1$): $ds^2=-dt^2+a^2(t)\left[\frac{dr^2}{1-kr^2}+r^2(d\theta^2+\sin^2\theta\,d\phi^2)\right]$, "This is the Robertson-Walker metric". SI: $$ds^2=-c^2dt^2+a(t)^2\left[\frac{dr^2}{1-kr^2}+r^2d\Omega^2\right].$$
- First Friedmann equation (Carroll 8.36 has $\Lambda=0$, $c=1$: $(\dot a/a)^2=\frac{8\pi G}{3}\rho-\frac{k}{a^2}$). SI with $\Lambda$: $$H^2\equiv\left(\frac{\dot a}{a}\right)^2=\frac{8\pi G}{3}\rho-\frac{kc^2}{a^2}+\frac{\Lambda c^2}{3}.$$
- Second (acceleration) equation (Carroll 8.35, $c=1$: $\frac{\ddot a}{a}=-\frac{4\pi G}{3}(\rho+3p)$). SI with $\Lambda$: $$\frac{\ddot a}{a}=-\frac{4\pi G}{3}\left(\rho+\frac{3p}{c^2}\right)+\frac{\Lambda c^2}{3}.$$
- Fluid (continuity) equation (Carroll 8.20 from $\nabla_\mu T^{\mu0}=0$; 8.22–8.23 for $p=w\rho$): $\dot\rho+3H\left(\rho+\frac{p}{c^2}\right)=0$, so $\rho\propto a^{-3(1+w)}$. That is $a^{-3}$ for dust ($w=0$), $a^{-4}$ for radiation ($w=1/3$), and constant for vacuum energy ($w=-1$).
- Carroll also defines $H=\dot a/a$ (8.37), deceleration $q=-a\ddot a/\dot a^2$ (8.38), $\Omega=\frac{8\pi G}{3H^2}\rho=\rho/\rho_{\rm crit}$ (8.39), $\rho_{\rm crit}=\frac{3H^2}{8\pi G}$ (8.40), and $\Omega-1=\frac{k}{H^2a^2}$ (8.41). He shows that rescaling $k\to k/|k|$, $r\to\sqrt{|k|}r$, $a\to a/\sqrt{|k|}$ leaves the metric invariant, "Therefore the only relevant parameter is $k/|k|$" (8.8). — [Carroll notes, §8](https://arxiv.org/abs/gr-qc/9712019)
- Perfect fluid: $T_{\mu\nu}=(p+\rho)U_\mu U_\nu+pg_{\mu\nu}$ (Carroll 8.15, $c=1$).

**B.** The first equation is an energy budget: the expansion rate squared equals a matter/energy term minus a curvature term plus a dark-energy term. The second says that ordinary matter and pressure decelerate the expansion, while $\Lambda$ accelerates it. The fluid equation says that energy diluted by expansion is accounted for, including the work done by pressure.

**C. Symbol-by-symbol anatomy (SI).**
| Symbol | Meaning | SI unit |
|---|---|---|
| $t$ | cosmic time: proper time of observers at rest relative to the cosmic fluid (comoving) | s |
| $a(t)$ | scale factor, the size of the universe relative to today; $a_0=1$ | dimensionless |
| $\dot a$, $\ddot a$ | first and second time derivatives | s⁻¹, s⁻² |
| $H=\dot a/a$ | Hubble parameter; $H_0$ is today's value; km s⁻¹ Mpc⁻¹ is the conventional unit | s⁻¹ |
| $r,\theta,\phi$ | comoving coordinates; galaxies keep fixed $(r,\theta,\phi)$ | m, rad, rad |
| $k$ | spatial curvature constant: $>0$ closed, $0$ flat, $<0$ open (with $a$ dimensionless, $k$ has units m⁻²; with $k\in\{-1,0,+1\}$, $a$ carries length units instead) | m⁻² |
| $\rho$ | **mass** density (energy density is $\rho c^2$) | kg m⁻³ |
| $p$ | pressure (enters as $p/c^2$ next to $\rho$) | Pa |
| $\Lambda$ | cosmological constant | m⁻² |
| $8\pi G/3$, $4\pi G/3$ | couplings descended from $8\pi G/c^4$ in the EFE | m³ kg⁻¹ s⁻² |
| $w=p/(\rho c^2)$ | equation-of-state parameter | — |
| $\rho_c=3H^2/8\pi G$ | critical density (the density that makes $k=0$ when $\Lambda=0$) | kg m⁻³ |
| $\Omega_i=\rho_i/\rho_c$ | density parameters (with $\Omega_\Lambda=\Lambda c^2/3H^2$) | — |

**D.** Ordinary differential equations in time. The metric ansatz turns the ten coupled PDEs of GR into two ODEs. The age calculation is a definite integral.

**E. Derivation outline (rederived here symbolically, $c=1$).**
- For FLRW: $R_{00}=-3\ddot a/a$ and $R=\frac{6}{a^2}(a\ddot a+\dot a^2+k)$, matching Carroll 8.13–8.14. Hence $G_{00}=R_{00}-\tfrac12g_{00}R=-3\frac{\ddot a}{a}+3\left(\frac{\ddot a}{a}+\frac{\dot a^2}{a^2}+\frac k{a^2}\right)=\frac{3(\dot a^2+k)}{a^2}$.
- With $T_{00}=\rho$ (comoving fluid, $U^\mu=(1,0,0,0)$) and $g_{00}=-1$, the 00-component of $G_{\mu\nu}+\Lambda g_{\mu\nu}=8\pi GT_{\mu\nu}$ is $\frac{3(\dot a^2+k)}{a^2}-\Lambda=8\pi G\rho$. Dividing by 3 gives $H^2=\frac{8\pi G}3\rho-\frac k{a^2}+\frac\Lambda3$. Restoring $c$ gives the SI form above.
- The $rr$-component gives $G_{rr}\frac{1-kr^2}{a^2}=-\frac{2a\ddot a+\dot a^2+k}{a^2}$ (sympy), so $-\left(2\frac{\ddot a}{a}+\frac{\dot a^2}{a^2}+\frac{k}{a^2}\right)+\Lambda=8\pi Gp$. Subtracting the first equation gives $\frac{\ddot a}a=-\frac{4\pi G}{3}(\rho+3p)+\frac\Lambda3$.
- Differentiating the first equation and using the second reproduces the fluid equation. The three are not independent: this is the Bianchi identity at work.
- **Newtonian "expanding ball" (ANALOGY).** Take a uniform ball of radius $R(t)=a(t)\,r_c$ and mass $M=\frac43\pi\rho R^3$. A test mass $m$ on its surface conserves energy: $\tfrac12m\dot R^2-\frac{GMm}{R}=E$. Divide by $\tfrac12mR^2$: $\left(\frac{\dot R}{R}\right)^2=\frac{8\pi G}{3}\rho+\frac{2E}{mR^2}$. Call $2E/(mr_c^2)\equiv-kc^2$ to get exactly the form of the first Friedmann equation with $\Lambda=0$. This is only an analogy: it treats $k$ as an energy rather than spatial curvature, misses the $3p/c^2$ pressure-gravitates term in the second equation, and relies on an ill-defined infinite Newtonian medium.

**F. Worked numbers (computed here).**
- Planck 2018 base-ΛCDM: "Hubble constant $H_0=(67.4\pm0.5)$ km s⁻¹ Mpc⁻¹; matter density parameter $\Omega_m=0.315\pm0.007$". Also $\Omega_\Lambda=0.6847\pm0.0073$ (TT,TE,EE+lowE+lensing). Table 2 ages: $13.797\pm0.023$ Gyr (TT,TE,EE+lowE+lensing) and $13.787\pm0.020$ Gyr (+BAO). — [Planck 2018 VI, arXiv 1807.06209](https://arxiv.org/abs/1807.06209)
- **Unit conversion:** $H_0=67.4\times10^3\ \mathrm{m\,s^{-1}}/3.08568\times10^{22}\ \mathrm m=2.18429\times10^{-18}$ s⁻¹. The Hubble time is $1/H_0=4.578\times10^{17}$ s $=14.51$ Gyr.
- **Critical density:** $\rho_c=\frac{3H_0^2}{8\pi G}=\frac{3\times4.7711\times10^{-36}}{1.6774\times10^{-9}}=\frac{1.4313\times10^{-35}}{1.6774\times10^{-9}}=$ **$8.53\times10^{-27}$ kg/m³**. Divided by the hydrogen-atom mass $1.6736\times10^{-27}$ kg, that is **5.1 hydrogen atoms per cubic metre**. Then $\rho_\Lambda=0.685\rho_c=5.85\times10^{-27}$ kg/m³ and $\Lambda=3\Omega_\Lambda H_0^2/c^2=1.09\times10^{-52}$ m⁻².
- **Age of a flat matter + Λ universe (worked integral):**
  - $t_0=\int_0^{t_0}dt=\int_0^1\frac{da}{\dot a}=\int_0^1\frac{da}{aH(a)}$, with $H(a)=H_0\sqrt{\Omega_ma^{-3}+\Omega_\Lambda}$ (from the first Friedmann equation, $k=0$, radiation neglected).
  - Then $t_0=\frac1{H_0}\int_0^1\frac{a^{1/2}\,da}{\sqrt{\Omega_m+\Omega_\Lambda a^3}}$. Substitute $u=a^{3/2}$, $du=\tfrac32a^{1/2}da$: $t_0=\frac{2}{3H_0}\int_0^1\frac{du}{\sqrt{\Omega_m+\Omega_\Lambda u^2}}=\frac{2}{3H_0\sqrt{\Omega_\Lambda}}\,\mathrm{arsinh}\sqrt{\Omega_\Lambda/\Omega_m}$.
  - Numbers with $\Omega_m=0.315$, $\Omega_\Lambda=0.685$: $\sqrt{0.685/0.315}=1.47465$; $\mathrm{arsinh}(1.47465)=\ln(1.47465+\sqrt{1+2.17460})=\ln(3.25640)=1.18062$; $\frac{2}{3\sqrt{0.685}}=0.80550$. So $H_0t_0=0.95099$ and $t_0=0.95099\times14.507$ Gyr = **13.80 Gyr**.
  - Midpoint numerical integration with $2\times10^5$ steps gives the same 13.796 Gyr. Adding radiation ($\Omega_r\approx9\times10^{-5}$, illustrative) lowers it by only about 5 Myr. Planck's own parameter set (67.36, 0.3153, 0.6847) gives 13.801 Gyr, against Planck's quoted 13.797 ± 0.023.
  - Contrast: a matter-only Einstein–de Sitter universe would be $2/(3H_0)=9.67$ Gyr old.
- Deceleration today: $q_0=\Omega_m/2-\Omega_\Lambda=0.1575-0.685=-0.53$ (accelerating). Acceleration began at $a=(\Omega_m/2\Omega_\Lambda)^{1/3}=0.613$, i.e. $z=0.63$. Matter and Λ densities were equal at $z=0.30$.
- **Hubble tension (one line):** SH0ES finds "$H_0=73.04\pm1.04$ km/s/Mpc … a 5-sigma difference with $H_0$ predicted by Planck+ΛCDM" ([Riess et al. 2022, ApJL 934 L7, arXiv 2112.04510](https://arxiv.org/abs/2112.04510)). Planck 2018 itself reported a "4.4σ tension" with the 2019 SH0ES value ([Planck 2018 VI](https://arxiv.org/abs/1807.06209)).

**G. Connections.**
- EXACT: the first equation is the 00-component of the EFE for the FLRW metric and a perfect fluid. The second follows from the $ii$-component combined with the first. The fluid equation is $\nabla_\mu T^{\mu0}=0$ and is implied by the other two.
- EXACT special cases: de Sitter ($\rho=0$, $\Lambda>0$, $k=0$) gives $a\propto e^{Ht}$ with $H=c\sqrt{\Lambda/3}$. Einstein–de Sitter (dust, $k=0$, $\Lambda=0$) gives $a\propto t^{2/3}$. Radiation-dominated flat gives $a\propto t^{1/2}$.
- EXACT: the $\Lambda c^2/3$ terms come from the $-2\Lambda$ in the Einstein–Hilbert action (16).
- APPROXIMATE: FLRW assumes exact homogeneity and isotropy, true only on large scales.
- ANALOGY: the Newtonian expanding ball.
- Related but distinct: cosmological redshift $1+z=1/a$ (exact in FLRW) is not the static gravitational redshift (14).

---

#### Extra great equations (all geodesics of Schwarzschild unless noted)

**E1. Effective-potential (radial orbit) equation.**
- Carroll (7.47–7.48, $c=1$): $\frac12\left(\frac{dr}{d\lambda}\right)^2+V(r)=\frac12E^2$, with $V(r)=\frac12\epsilon-\epsilon\frac{GM}{r}+\frac{L^2}{2r^2}-\frac{GML^2}{r^3}$. Here $\epsilon=1$ for massive particles ($\lambda=\tau$) and $\epsilon=0$ for light, and $E$, $L$ are the conserved energy and angular momentum per unit mass from the Killing vectors. "In (7.47) we have precisely the equation for a classical particle of unit mass and 'energy' $\frac12E^2$ moving in a one-dimensional potential given by $V(r)$."
- Circular orbits: $r_c=\frac{L^2\pm\sqrt{L^4-12G^2M^2L^2}}{2GM}$ (from 7.52–7.53). These coincide at $L=\sqrt{12}\,GM$, where $r_c=6GM$: "6GM is the smallest possible radius of a stable circular orbit in the Schwarzschild metric". The unstable orbit approaches $3GM$, the photon sphere. — [Carroll notes, §7](https://arxiv.org/abs/gr-qc/9712019)
- SI version (inference by restoring $c$; per unit mass, $\tau$ in s): $\frac12\left(\frac{dr}{d\tau}\right)^2+V_{\rm eff}(r)=\frac12\left(\frac{\tilde E^2}{c^2}-c^2\right)$, with $V_{\rm eff}=-\frac{GM}{r}+\frac{\ell^2}{2r^2}-\frac{GM\ell^2}{c^2r^3}$, $\ell=r^2\,d\phi/d\tau$ (m² s⁻¹), $\tilde E=(1-r_s/r)c^2\,dt/d\tau$ (m² s⁻²). The first two terms are Newton's; the $-GM\ell^2/(c^2r^3)$ term is the entire GR correction.
- Numbers (computed here): ISCO $6GM/c^2$ is 8.86 km for 1 $M_\odot$ and 88.6 km for 10 $M_\odot$. The photon sphere $3GM/c^2$ is 4.43 km and 44.3 km respectively.
- Connections: EXACT from (11). APPROXIMATE: treating the $1/r^3$ term as a perturbation gives E3.

**E2. Light deflection.**
- $\alpha=\dfrac{4GM}{c^2b}=\dfrac{2r_s}{b}$ (geometric $4M/b$), with $b$ the impact parameter (m) and $\alpha$ in radians.
- Will (eq. 60, PPN form): for a grazing ray $\delta\theta\approx\frac12(1+\gamma)\,1.''7505$, "independent of the frequency of light". VLBI results: $(1+\gamma)/2=0.99992\pm0.00023$ (2004), and $\gamma-1=(-1.6\pm1.5)\times10^{-4}$ (2009). At 90° from the Sun the deflection is still 4 milliarcseconds. — [Will 2014](https://arxiv.org/abs/1403.7377)
- Worked (computed here): $4GM_\odot=5.30850\times10^{20}$; $c^2R_\odot=8.98755\times10^{16}\times6.957\times10^8=6.25264\times10^{25}$; $\alpha=8.490\times10^{-6}$ rad $\times206\,264.8''$/rad = **1.751″**. With $R_\odot=6.96\times10^8$ m this gives 1.7504″, Will's figure. A Newtonian "corpuscle" calculation gives half, 0.876″. The factor 2 comes from the spatial curvature term $g_{rr}$, which a pure-$g_{tt}$ (Newtonian) treatment misses.
- Connections: APPROXIMATE (weak-field limit of null geodesics of (11), $b\gg r_s$). ANALOGY: a lens; gravitational lensing.

**E3. Perihelion precession.**
- $\Delta\phi=\dfrac{6\pi GM}{c^2a(1-e^2)}$ per orbit, where $a$ is the semi-major axis (m), $e$ the eccentricity, and $a(1-e^2)=p$ the semi-latus rectum.
- Will's PPN form (eq. 64): $\Delta\tilde\omega=\frac{6\pi m}{p}\left[\frac13(2+2\gamma-\beta)+\dots\right]$, which equals $6\pi m/p$ for GR ($\gamma=\beta=1$). Eq. 65: $\dot{\tilde\omega}=42.''98\left[\frac13(2+2\gamma-\beta)+3\times10^{-4}\frac{J_2}{10^{-7}}\right]$ per century. Will: "The modern value for this discrepancy is 43 arcseconds per century". Helioseismology gives $J_2=(2.2\pm0.1)\times10^{-7}$. — [Will 2014](https://arxiv.org/abs/1403.7377)
- Worked, Mercury (orbital elements: $a=57.909\times10^6$ km, $e=0.2056$, sidereal period 87.969 d, from the [NASA Mercury fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html); computed here):
  - $1-e^2=0.957729$ and $a(1-e^2)=5.54611\times10^{10}$ m.
  - $6\pi GM_\odot=2.50157\times10^{21}$ and $c^2a(1-e^2)=4.98460\times10^{27}$.
  - $\Delta\phi=5.0186\times10^{-7}$ rad = 0.10352″ per orbit.
  - Orbits per century: $36\,525/87.969=415.20$. Total: **42.98″/century**, matching Will.
- Connections: APPROXIMATE (first-order perturbation of the E1 orbit equation). The same physics in the S2 orbit around Sgr A* was detected at 7σ by GRAVITY ([arXiv 2112.07478](https://arxiv.org/abs/2112.07478)) and in binary-pulsar periastron advance (4.226598°/yr for B1913+16; Will Table 7).

**E4. Shapiro time delay.**
- Will (eq. 62, $G=c=1$): the round-trip excess is $\delta t=2(1+\gamma)M_\odot\ln\left[\frac{(r_\oplus+\mathbf x_\oplus\cdot\mathbf n)(r_e-\mathbf x_e\cdot\mathbf n)}{d^2}\right]$, with $d$ the distance of closest approach. Will credits "Irwin Shapiro's 1964 discovery of this effect as a theoretical consequence" of GR. The 1976 Viking experiment reached 0.1%. Cassini "while it was on its way to Saturn [Bertotti, Iess & Tortora 2003], with a result $\gamma-1=(2.1\pm2.3)\times10^{-5}$", made possible by Doppler measurements at X-band (7175 MHz) and Ka-band (34316 MHz) that cancel solar-corona dispersion, in the favourable 2002 superior conjunction. — [Will 2014](https://arxiv.org/abs/1403.7377); original [Bertotti et al. 2003, Nature 425, 374](https://doi.org/10.1038/nature01997)
- SI at superior conjunction ($\gamma=1$): $\Delta t\approx\dfrac{4GM}{c^3}\ln\dfrac{4r_\oplus r_e}{b^2}$.
- Worked, Earth–Mars radar grazing the Sun (computed here): $4GM_\odot/c^3=1.9702\times10^{-5}$ s. $4r_\oplus r_e/b^2=4(1\,\mathrm{AU})(1.52\,\mathrm{AU})/R_\odot^2=1.36067\times10^{23}/4.83998\times10^{17}=2.8113\times10^5$, whose natural log is 12.547. So $\Delta t=$ **247 μs** round trip. Earth–Saturn gives 283 μs.
- Connections: APPROXIMATE (weak-field null geodesics of (11)). It shares the $(1+\gamma)$ factor with E2, because both come from the space-curvature part of the metric.

**E5. Kerr metric (rotating black hole), brief.**
- Carroll (7.114–7.116, $c=1$): $ds^2=-dt^2+\frac{\rho^2}{\Delta}dr^2+\rho^2d\theta^2+(r^2+a^2)\sin^2\theta\,d\phi^2+\frac{2GMr}{\rho^2}\left(a\sin^2\theta\,d\phi-dt\right)^2$, with $\Delta=r^2-2GMr+a^2$ and $\rho^2=r^2+a^2\cos^2\theta$. "Here $a$ measures the rotation of the hole and $M$ is the mass". The coordinates are Boyer–Lindquist, which reduce to Schwarzschild as $a\to0$. — [Carroll notes, §7](https://arxiv.org/abs/gr-qc/9712019)
- SI: $a=J/(Mc)$ (m) and $GM\to GM/c^2$. Horizons where $\Delta=0$: $r_\pm=\frac{GM}{c^2}\pm\sqrt{(GM/c^2)^2-a^2}$ (inference from Δ = 0).
- Worked (computed here): a 10 $M_\odot$ hole with $a=0.9\,GM/c^2$ has $r_+=21.20$ km and $r_-=8.33$ km, versus 29.53 km for Schwarzschild.
- The EHT Sgr A* images are "consistent with" a Kerr black hole ([EHT 2022](https://arxiv.org/abs/2311.08680)).
- Connections: EXACT generalisation of (11). Real astrophysical black holes spin.

**E6. Hawking temperature (semiclassical: beyond classical GR; label it so).**
- $T_H=\dfrac{\hbar c^3}{8\pi GMk_B}$. Carroll gives "$T=\hbar/8\pi kGM$" with $c=1$, and says the derivation "involves the use of quantum field theory in curved spacetime and is way outside our scope". — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019). Original: Hawking 1975, Commun. Math. Phys. 43, 199 ([DOI](https://doi.org/10.1007/BF02345020), not fetched).
- Worked (computed here, $\hbar=1.054571817\times10^{-34}$ J s, $k_B=1.380649\times10^{-23}$ J/K, both exact or CODATA): numerator $\hbar c^3=2.84144\times10^{-9}$; denominator $8\pi GM_\odot k_B=4.60510\times10^{-2}$. So $T_H(1M_\odot)=$ **$6.17\times10^{-8}$ K**.
  - 10 $M_\odot$: $6.2\times10^{-9}$ K. Sgr A*: $1.4\times10^{-14}$ K. M87*: $9.5\times10^{-18}$ K.
  - All are far colder than the 2.7255 K cosmic microwave background, so astrophysical black holes currently absorb more than they emit. $T_H$ would equal 2.7255 K for $M=4.5\times10^{22}$ kg, about 0.6 lunar masses.
- Connections: ANALOGY with thermodynamics, which becomes exact in black-hole thermodynamics. It needs quantum theory ($\hbar$) and is not part of classical GR.

### Inferences
- **One convention for the whole document.** Carroll's notes, Wikipedia's EH-action article and Will's review are mutually consistent on signature $(-,+,+,+)$. Adopting Carroll's Riemann (3.67) and Ricci (3.90) definitions makes geodesic deviation read $D^2\xi^\mu/d\tau^2=+R^\mu{}_{\nu\rho\sigma}u^\nu u^\rho\xi^\sigma$, with $R^i{}_{0j0}\approx+\partial_i\partial_j\Phi/c^2$. That sign was rederived symbolically here and is the one to print.
- **Geometric to SI.** For a Calc II reader the cleanest rule is: every $M$ in a $G=c=1$ formula becomes $GM/c^2$ (metres), every $t$ becomes $ct$, and every $8\pi T_{\mu\nu}$ becomes $(8\pi G/c^4)T_{\mu\nu}$. All SI forms above were obtained this way and checked dimensionally.
- **"Exact vs approximate" pattern.** Schwarzschild, Kerr and FLRW are exact solutions. $r_s$, the static clock rate, the static redshift, ISCO and the photon sphere are exact consequences. Light deflection, perihelion precession, Shapiro delay, the quadrupole formula and every "$\approx1+\Phi/c^2$" are weak-field or slow-motion approximations. The Newtonian escape-speed derivation of $r_s$ and the expanding-ball derivation of Friedmann are analogies that happen to reproduce exact formulae.
- **The neutron-star row is the best teaching example of the weak field failing.** $d\tau/dt=0.810$ exactly versus 0.828 from $1-GM/rc^2$, a 2% error. At Earth the two agree to $10^{-19}$.
- **The Pound–Rebka round-off issue is worth a footnote.** A student computing the exact Schwarzschild formula in a spreadsheet will get a 0.6% wrong answer from double-precision round-off. The weak-field formula is not only simpler but numerically more accurate there.
- **GPS 45.7 vs 46.** A spherical Earth with mean radius gives 45.72 μs/day. Including the equatorial bulge ($J_2$) and using the equatorial radius gives 45.68 μs/day. The textbook "45.7, −7.1, +38.6 (38.58) μs/day" split follows Ashby's bookkeeping, in which the ground clock's rotation (0.10 μs/day) is assigned to the velocity term.
- **Units of the Einstein–Hilbert action.** "$c^4/16\pi G$" with $d^4x$ in m⁴ gives J·m, not J·s. The document should state that $d^4x=dt\,d^3x$ (with $\sqrt{-g}$ dimensionless), or else use $c^3/16\pi G$ with $d^4x=d(ct)\,d^3x$.
- **Tidal scaling** $\propto M/r^3$, evaluated at $r_s\propto M$, gives $\propto1/M^2$ at the horizon. This one-line calculation explains why a 10 $M_\odot$ hole spaghettifies at about 128 $r_s$ while an observer falls through Sgr A*'s horizon feeling about $10^{-4}$ g.
- **GW150914 strain check.** The leading-order quadrupole amplitude reproduces the measured strain to within a factor of about 2 at 150 Hz. That is good evidence the formula captures the physics, but near merger ($v/c\approx0.5$) it should be presented as order-of-magnitude only.

### Gaps
- **Hartle's *Gravity* conventions** could not be verified from a fetched source. From training knowledge, Hartle uses $(-,+,+,+)$ and geometric units $G=c=1$. One anecdotal online review claimed otherwise. Check the book's notation section before printing a convention table that includes Hartle. Schutz's $(-,+,+,+)$ rests on a secondary (Glasgow course) source. MTW's Riemann sign table (inside cover) and Carroll's textbook (2004) were not fetched; only Carroll's 1997 lecture notes were.
- **Pound & Rebka 1960 primary text** (PRL 4, 337) and **Vessot et al. 1980** (PRL 45, 2081) could not be retrieved (APS returned 403). The 1960 ratio "1.05 ± 0.10" and the measured "(2.57 ± 0.26) × 10⁻¹⁵" appear only in search summaries of secondary sources and are unverified. The "7 × 10⁻⁵" GP-A figure is from secondary sources; Will's review gives the bound $|\alpha|<2\times10^{-4}$.
- **Ashby's own per-day figures (45.7 / 7.1 / 38.6 μs/day)** do not appear in the text of Ashby's 2003 Living Review (the equation images in the PMC version could not be read). The 45.7 μs/day and −38.58 μs/day figures are cited to Pascual-Sánchez (arXiv gr-qc/0507121) and the −4.4647 × 10⁻¹⁰ to Ashby's 2006 AAPT slides. The brief attributes "45.7 μs/day" to Ashby 2003. The likely origin is Ashby's 2002 *Physics Today* article, which was not retrieved. The $J_2$ and $\omega_E$ values used to reproduce 45.68 μs/day were not fetched.
- **Bothwell et al. 2022 numbers** (−1.09 × 10⁻¹⁹/mm predicted, −9.8(2.3) × 10⁻²⁰/mm measured) come from the arXiv v1 text. The Nature version (paywalled here) may phrase or round them differently.
- **LIGO's "1/200th of a proton diameter"** for $4\times10^{-18}$ m implies a proton diameter of about 0.8 fm, which is closer to the proton radius. With the charge radius 0.84 fm (diameter 1.68 fm) the ratio is about 1/420. Quote LIGO verbatim or say "a few thousandths of a proton diameter".
- **Peters–Mathews (1963) quadrupole power formula, Einstein's 1918 quadrupole paper, Landau–Lifshitz's $c^3/16\pi k$ action form, MTW §31.2 tidal components and Hawking (1975)** were not fetched. Their formulas are standard and were checked here only by internal consistency: the Earth–Sun 196 W against Wikipedia's ~200 W, Will's $\dot P_b$ reproduced to $10^{-5}$, and the symbolic Riemann components.
- **The $h_0$ binary strain formula** used for the GW150914 order-of-magnitude check is standard (e.g. Maggiore) but was not fetched; treat that check as illustrative.
- **Cassini specifics** (closest approach of about 1.6 $R_\odot$, peak frequency shift) were not retrieved from Bertotti et al. 2003 (Nature paywall). Only the γ result and band frequencies (via Will) are sourced.
- **The neutron-star example** (1.4 $M_\odot$, 12 km) is illustrative, not a specific measured star.

---

## Key question 2: What are the correct numerical values (CODATA, IAU nominal, Planck 2018), verified in Python?

### Takeaway
Every headline number in the brief survives recomputation from CODATA $G$, exact $c$, IAU 2015 nominal $GM_\odot$ and $GM_E$, and Planck 2018 parameters: $r_{s,\odot}=2.953$ km, $r_{s,E}=8.870$ mm, Mercury 42.98″/century, deflection 1.751″, $\rho_c=8.53\times10^{-27}$ kg/m³ (5.1 H atoms per m³), and a ΛCDM age of 13.80 Gyr. The few discrepancies are definitional: GPS 45.7 vs 46 μs/day, LIGO's proton comparison, and Will's 1.7505″ versus 1.7512″ from the radius choice.

### Cited Findings
- Inputs: $G=6.67430\times10^{-11}$ m³ kg⁻¹ s⁻² ([NIST CODATA](https://physics.nist.gov/cgi-bin/cuu/Value?bg)); $GM_\odot=1.3271244\times10^{20}$ m³ s⁻², $R_\odot=6.957\times10^8$ m, $GM_E=3.986004\times10^{14}$ m³ s⁻², $R_{E,eq}=6.3781\times10^6$ m ([IAU 2015 B3](https://arxiv.org/abs/1510.07674)); $H_0=67.4\pm0.5$ km/s/Mpc, $\Omega_m=0.315\pm0.007$, $\Omega_\Lambda=0.6847\pm0.0073$, age $13.797\pm0.023$ Gyr ([Planck 2018 VI](https://arxiv.org/abs/1807.06209)); Mercury $a=57.909\times10^6$ km, $e=0.2056$, $P=87.969$ d ([NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html)); GPS $a=2.656175\times10^7$ m and $\Phi_0/c^2=6.969290134\times10^{-10}$ ([Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)); B1913+16 elements ([Will 2014](https://arxiv.org/abs/1403.7377)).
- Measured comparison values: GW150914 $h=1.0\times10^{-21}$, 36 + 29 → 62 $M_\odot$, 3.0 $M_\odot c^2$, 410 Mpc ([Abbott et al. 2016](https://arxiv.org/abs/1602.03837)); M87* $(6.5\pm0.7)\times10^9M_\odot$ ([EHT 2019](https://doi.org/10.3847/2041-8213/ab0ec7)); Sgr A* $4.30\times10^6M_\odot$ ±0.25% ([GRAVITY 2022](https://arxiv.org/abs/2112.07478)), EHT "about 4 × 10⁶" ([EHT 2022](https://arxiv.org/abs/2311.08680)); solar redshift $638\pm6$ m/s vs 633.1 m/s predicted ([González Hernández 2020](https://arxiv.org/abs/2009.10558)); Cassini $\gamma-1=(2.1\pm2.3)\times10^{-5}$, Mercury 42.98″, deflection $\frac12(1+\gamma)1.7505''$, Hulse–Taylor $0.997\pm0.002$ ([Will 2014](https://arxiv.org/abs/1403.7377)); $0.9983\pm0.0016$ ([Weisberg & Huang 2016](https://arxiv.org/abs/1606.02744)); SH0ES $73.04\pm1.04$ ([Riess 2022](https://arxiv.org/abs/2112.04510)).

### Inferences
Master table of values computed here. Python 3, script `/tmp/claude-0/-home-user-Projects/6e512a3f-ee96-5ca2-92f4-5fdb7ef00825/scratchpad/calc/gr_numbers.py`; symbolic checks in `.../calc/symbolic.py`.

| Quantity | Computed value | Matches brief / literature? |
|---|---|---|
| $r_s$ Sun | 2953.25 m | ✓ "~2.95 km" |
| $r_s$ Earth | 8.870 mm | ✓ "~8.87 mm" |
| $r_s$ 10 $M_\odot$ | 29.53 km | — |
| $r_s$ Sgr A* (4.30 × 10⁶) | $1.270\times10^{10}$ m = 0.085 AU = 18.3 $R_\odot$ | (EHT's 4.0 × 10⁶ gives $1.18\times10^{10}$ m) |
| $r_s$ M87* (6.5 × 10⁹) | $1.92\times10^{13}$ m = 128 AU | ✓; $\theta_g$ = 3.82 μas vs EHT 3.8 ± 0.4 |
| Proper distance $r_s\to2r_s$ | $2.2956\,r_s$ (exact closed form) | — |
| Static clock, Earth surface | $6.96\times10^{-10}$ → 60.1 μs/day vs infinity | consistent with Ashby's "seven parts in 10¹⁰" (geoid incl. rotation) |
| GPS gravitational gain vs ground | 45.68–45.72 μs/day | ✓ 45.7 |
| GPS velocity loss | 7.11 μs/day (7.21 before the ground-rotation term) | ✓ 7.1 |
| GPS net | 38.58 μs/day = $4.4647\times10^{-10}$ | ✓ Ashby / IS-GPS value |
| Sun surface clock | $2.1225\times10^{-6}$ → 0.183 s/day, 67 s/yr | — |
| NS (1.4 $M_\odot$, 12 km) | $d\tau/dt=0.8096$, $z=0.235$ | illustrative |
| Pound–Rebka $gh/c^2$ (22.5 m) | $2.456\times10^{-15}$; exact $2.4585\times10^{-15}$ | ✓ 2.46 × 10⁻¹⁵ |
| GP-A potential term at 10⁴ km | $4.25\times10^{-10}$ | — |
| Solar redshift | 636.31 m/s (∞), 633.14 m/s at Earth | ✓ 636; ✓ 633.1 predicted |
| Bothwell gradient $g/c^2$ | $1.090\times10^{-19}$ per mm | ✓ −1.09 × 10⁻¹⁹/mm |
| Tidal, 2 m, Earth | $6.17\times10^{-6}$ m/s² | — |
| Tidal, 2 m, 10 $M_\odot$ at $r_s$ | $2.06\times10^8$ m/s² ≈ $2.1\times10^7$ g | — |
| Tidal, 2 m, Sgr A* at $r_s$ | $1.11\times10^{-3}$ m/s² | — |
| $c^4/16\pi G$ | $2.408\times10^{42}$ N | — |
| Action of a thrown ball ($m$ = 1 kg, $T$ = 2 s) | −32.0787 J·s; perturbation adds $m\pi^2\varepsilon^2/4T$ | — |
| GW150914 ΔL | $4.0\times10^{-18}$ m (differential) | ✓ LIGO "4e-18 m"; brief's "~10⁻¹⁸ m" is the order of magnitude |
| GW150914 radiated energy | $5.36\times10^{47}$ J | — |
| Earth–Sun GW power | 196 W | ✓ "about 200 W" (Wikipedia) |
| B1913+16 $\dot P_b^{GR}$ | $-2.40256\times10^{-12}$ | ✓ Will −2.402531 × 10⁻¹² |
| $\rho_c$ ($H_0$ = 67.4) | $8.533\times10^{-27}$ kg/m³ = 5.10 H atoms/m³ | ✓ ~8.5 × 10⁻²⁷, ~5 atoms |
| Age, flat ΛCDM (0.315/0.685) | 13.796 Gyr (closed form and numerical) | ✓ Planck 13.797 ± 0.023 |
| $\Lambda$ | $1.09\times10^{-52}$ m⁻² | — |
| $q_0$; acceleration onset | −0.53; $z=0.63$ | — |
| Light deflection at the solar limb | 1.7512″ ($R_\odot$ = 6.957 × 10⁸ m); 1.7504″ ($R_\odot$ = 6.96 × 10⁸ m) | ✓ 1.75″; Will 1.7505″ |
| Mercury precession | 0.10352″/orbit × 415.20 = 42.98″/century | ✓ |
| Shapiro Earth–Mars round trip | 247 μs | — |
| ISCO / photon sphere, 10 $M_\odot$ | 88.6 km / 44.3 km | — |
| Kerr $a_*=0.9$, 10 $M_\odot$ | $r_+=21.20$ km, $r_-=8.33$ km | — |
| $T_H$ (1 $M_\odot$) | $6.17\times10^{-8}$ K | — |
| Hubble tension | (73.04 − 67.4)/√(1.04² + 0.5²) = 4.9σ, naive | ✓ Riess "5σ" |

- Symbolic identities confirmed: Schwarzschild $R_{\mu\nu}=0$; $K=48G^2M^2/(c^4r^6)$; $R^{\hat r}{}_{\hat t\hat r\hat t}=-2GM/(c^2r^3)$, $R^{\hat\theta}{}_{\hat t\hat\theta\hat t}=+GM/(c^2r^3)$; circular-orbit clock rate $\sqrt{1-3GM/rc^2}$; FLRW $R_{00}=-3\ddot a/a$, $R=6(a\ddot a+\dot a^2+k)/a^2$, $G_{00}=3(\dot a^2+k)/a^2$.

### Gaps
- The radiation density used in the age sensitivity test ($\Omega_r\approx9\times10^{-5}$) is illustrative and was not taken from the Planck paper. It changes the age by only about 5 Myr.
- The evaporation time of a solar-mass black hole (about $2\times10^{67}$ yr from $5120\pi G^2M^3/\hbar c^4$, photons only) was computed here but its formula was not sourced. Omit it or present it as order-of-magnitude.
- Venus and Earth precession values (8.6″ and 3.8″ per century) were computed from orbital elements recalled from memory, not fetched. Do not print them without checking the NASA fact sheets.
