# Anatomy of the Great Equations of General Relativity: field equations, Einstein tensor, interval, line element, proper time, geodesics, Christoffel symbols, Riemann, Ricci, stress-energy, Newtonian limit

Notes for the "Anatomy of the Great Equations of General Relativity" section of *The Mathematics of General Relativity: From Calculus to Einstein's Field Equations* (Calculus II / Physics I reader). Equation numbers (1)–(10) and (17) follow the coordinator's numbering.

**How the numbers were checked.** Every numerical value below was recomputed in Python 3 (plain `math`) and every symbolic result (Christoffel symbols, sphere curvature, Schwarzschild Christoffels and tidal Riemann components, vacuum Ricci = 0, the weak-field $R_{00}$ and $G_{00}$, term counts) was recomputed in SymPy in this session. Where a value is "computed", the inputs are the cited constants (CODATA 2022 $G$, exact SI $c$, IAU 2015 B3 nominal values, Planck 2018). Scripts: `numbers.py`, `symbolic.py`, `termcount.py` in the session scratchpad (`/tmp/claude-0/-home-user-Projects/6e512a3f-ee96-5ca2-92f4-5fdb7ef00825/scratchpad/verify/`).

---

## Key Question 1: What are the canonical forms and conventions in the major textbooks, and how should a beginner recognise the same equation in different conventions? (with the full equation-by-equation anatomy)

### Takeaway
All the equations below are written in the MTW/Carroll convention: signature $(-,+,+,+)$, $R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\dots$, $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ and $G_{\mu\nu}+\Lambda g_{\mu\nu}=+\tfrac{8\pi G}{c^4}T_{\mu\nu}$. Other textbooks differ from this by up to three independent signs: the metric signature, the sign of the Riemann tensor, and the sign of the Einstein equation. A beginner can tell which convention a text uses from four things: the sign of the time part of its flat metric, whether a sphere comes out with positive scalar curvature, the sign in front of $8\pi G$, and whether $c$ and $G$ are written out or set to 1. The physics is the same in every convention. In SymPy, the 10 field equations come out as coupled, second-order, nonlinear PDEs in the 10 metric functions: one component $G_{00}$ expands to about 2,700 terms.

### Cited Findings

#### 0. Conventions used in these notes (state these to the reader)

- **Signature $(-,+,+,+)$, with $x^0 = ct$.** Carroll writes coordinates "with Greek superscript indices running from 0 to 3, with 0 generally denoting the time coordinate", with $x^0 = ct$ — [Carroll, *Lecture Notes on GR*, eq. 1.5](https://arxiv.org/abs/gr-qc/9712019). With $x^0=ct$ every Cartesian coordinate is in metres, so the metric components $g_{\mu\nu}$ have no units. Carroll's weak-field metric has $g_{00}=-1+h_{00}$ — [Carroll eq. 4.46](https://arxiv.org/abs/gr-qc/9712019). The $(-,+,+,+)$ signature is the "mostly plus" or "East coast" convention of MTW, Carroll and Wald — [Wikipedia, Sign convention](https://en.wikipedia.org/wiki/Sign_convention).
- **Units switch rule.** SI is the default throughout. The geometric form ($G=c=1$) is given separately and always labelled. Conversions: mass $M \to GM/c^2$ in metres, where $G/c^2 = 7.4262\times10^{-28}\ \text{m kg}^{-1}$; time $t \to ct$; energy density $u \to (G/c^4)u$ in $\text{m}^{-2}$. Computed with [CODATA 2022 G](https://physics.nist.gov/cgi-bin/cuu/Value?bg). Carroll's notes set $c=1$ but keep $G$, so his $G_{\mu\nu}=8\pi G T_{\mu\nu}$ is a "$c=1$" form — [Carroll eq. 4.52](https://arxiv.org/abs/gr-qc/9712019).
- **Riemann tensor** (Carroll eq. 3.67, the MTW form):
  $$R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$$
  — [Carroll eq. 3.67](https://arxiv.org/abs/gr-qc/9712019). **Ricci tensor:** $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ (Carroll uses $R_{00}=R^\lambda{}_{0\lambda0}$) — [Carroll §4, before eq. 4.49](https://arxiv.org/abs/gr-qc/9712019).

#### 0.1 Index notation primer (for a Calc II reader)

- **Greek indices versus Latin indices.** Greek indices ($\mu,\nu,\rho,\sigma,\lambda,\dots$) run over 0–3, the spacetime components — [Carroll eq. 1.5](https://arxiv.org/abs/gr-qc/9712019). Latin indices ($i,j,k$) run over 1, 2, 3: "we use Latin indices for spacelike components 1,2,3" — [Carroll §1](https://arxiv.org/abs/gr-qc/9712019). For example, $\nabla^2=\delta^{ij}\partial_i\partial_j$ is the spatial Laplacian — [Carroll, after eq. 4.35](https://arxiv.org/abs/gr-qc/9712019).
- **Repeated indices are summed (Einstein summation convention).** Carroll: "indices which appear both as superscripts and subscripts are summed over". So $s^2=\eta_{\mu\nu}\Delta x^\mu\Delta x^\nu$ (eq. 1.9) stands for the full 16-term double sum — [Carroll eq. 1.9](https://arxiv.org/abs/gr-qc/9712019). An index that appears once on each side (a *free* index) is not summed. Each choice of its value gives a separate equation.
- **An index is a label, not an exponent.** $x^2$ means "the coordinate with label 2", which is $y$. It does not mean $x$ squared. The square of that coordinate is written $(x^2)^2$. Likewise $(dx^0)^2 = c^2dt^2$. Carroll warns that in $\Gamma^\lambda$ "the Greek letter λ is a dummy index which is summed over, while the Greek letters θ and φ represent specific coordinates" — [Carroll §3.6](https://arxiv.org/abs/gr-qc/9712019).
- **Up versus down.** An upper index marks the components of a vector (contravariant), for example $dx^\mu$ or $u^\mu$. A lower index marks the components of a covector or gradient (covariant), for example $\partial_\mu=\partial/\partial x^\mu$. The metric lowers an index and its inverse raises one: $u_\mu=g_{\mu\nu}u^\nu$ and $u^\mu=g^{\mu\nu}u_\nu$, with $g^{\mu\nu}g_{\nu\sigma}=\delta^\mu_\sigma$ — [Carroll eq. 4.14 and surrounding text](https://arxiv.org/abs/gr-qc/9712019). In a sum, one index should be up and one down.
- **How many equations a tensor equation stands for.** A two-index equation in 4D has $4\times4=16$ slots. Because $G_{\mu\nu}$, $g_{\mu\nu}$ and $T_{\mu\nu}$ are symmetric, only 10 are distinct. "The four Bianchi identities reduce the number of independent equations from 10 to 6", which leaves 4 functions' worth of freedom to choose coordinates — [Wikipedia, Einstein field equations](https://en.wikipedia.org/wiki/Einstein_field_equations).

#### 0.2 Sign conventions across textbooks: one table

MTW classify conventions by three signs. [S1] is the metric signature: $g_{\mu\nu}=[S1]\,\mathrm{diag}(-1,+1,+1,+1)$ in flat space. [S2] is the overall sign of the Riemann tensor. [S3] is the sign of the Einstein equation, $G_{\mu\nu}=[S3]\,\kappa T_{\mu\nu}$. The Ricci contraction sign is then fixed by $R_{\mu\nu}=[S2][S3]R^\alpha{}_{\mu\alpha\nu}$. MTW call themselves (+ + +). Under this scheme "Weinberg (1972) is (+ − −), Peebles (1980) and Efstathiou et al. (1990) are (− + +), Rindler (1977), Atwater (1974), Collins Martin & Squires (1989) and Peacock (1999) are (− + −)" — [Wikipedia, Einstein field equations §Sign convention (reporting MTW's classification)](https://en.wikipedia.org/wiki/Einstein_field_equations). The MTW book has this sign table in its front endpapers — [search summary citing MTW endpapers](https://en.wikipedia.org/wiki/Gravitation_(book)).

| Text | Signature | [S1] | [S2] Riemann | [S3] Einstein eq. | Field equation as written | Verification status |
|---|---|---|---|---|---|---|
| Misner, Thorne & Wheeler, *Gravitation* (1973) | $(-,+,+,+)$ | + | + | + | $G_{\mu\nu}=8\pi T_{\mu\nu}$ ($G=c=1$) | Verified: [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations), [Sign convention](https://en.wikipedia.org/wiki/Sign_convention) |
| Carroll, notes (1997) / *Spacetime and Geometry* (2004) | $(-,+,+,+)$ | + | + | + | $R_{\mu\nu}-\tfrac12Rg_{\mu\nu}=8\pi G T_{\mu\nu}$ ($c=1$) | Verified from Carroll's own eqs. 3.67, 4.46, 4.52: [arXiv gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019) |
| Wald, *General Relativity* (1984) | $(-,+,+,+)$; "changes signature to the timelike convention for Chapter 13 only" | + | + (not verified) | + (not verified) | $G_{ab}=8\pi T_{ab}$ (abstract indices) | Signature verified: [Sign convention](https://en.wikipedia.org/wiki/Sign_convention). S2, S3 from background knowledge only |
| Schutz, *A First Course in GR* | $(-,+,+,+)$ | + | + (not verified) | + (not verified) | $G^{\alpha\beta}=8\pi T^{\alpha\beta}$ | Not verified this session (see Gaps) |
| Hartle, *Gravity* (2003) | $(-,+,+,+)$ | + | + (not verified) | + (not verified) | $G_{\alpha\beta}=8\pi G T_{\alpha\beta}/c^4$ | Not verified this session (see Gaps) |
| Weinberg, *Gravitation and Cosmology* (1972) | $(-,+,+,+)$ (S1 = +) | + | − | − | $R_{\mu\nu}-\tfrac12g_{\mu\nu}R=-8\pi G T_{\mu\nu}$ | Triple verified: [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations). A mailing-list thread also notes that with Weinberg's sign "the sphere's scalar curvature comes out negative": [Maxima list 2007](https://maxima.sourceforge.io/ext/list_archives/2007/msg05006.html) |
| Landau & Lifshitz, *Classical Theory of Fields* | $(+,-,-,-)$ ("West coast") | − | + (not verified) | + (not verified) | $R_{ik}-\tfrac12g_{ik}R=\tfrac{8\pi k}{c^4}T_{ik}$ (LL write $k$ for $G$) | Signature verified: [Sign convention](https://en.wikipedia.org/wiki/Sign_convention). S2, S3 and "$k$" from background knowledge only |
| Peebles (1980); Efstathiou et al. (1990) | $(+,-,-,-)$ | − | + | + | | Verified: [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations) |
| Rindler (1977); Peacock (1999) | $(+,-,-,-)$ | − | + | − | | Verified: [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations) |
| D'Inverno; Hobson–Efstathiou–Lasenby; Chandrasekhar | $(+,-,-,-)$ | − | — | — | | Signature only: [Sign convention](https://en.wikipedia.org/wiki/Sign_convention) |

- The two Ricci contractions $R_{ab}=R^c{}_{acb}$ and $R_{ab}=R^c{}_{abc}$ "differ by a minus sign". A text that flips the Riemann sign and also contracts on the other index ends up with the same Ricci tensor — [Wikipedia, Sign convention (citing O'Neill)](https://en.wikipedia.org/wiki/Sign_convention).

#### Equation (1): Einstein's field equations (EFE)

**A. Exact forms.**

SI, with the cosmological constant (MTW/Carroll signs):
$$G_{\mu\nu}+\Lambda g_{\mu\nu}=\frac{8\pi G}{c^{4}}\,T_{\mu\nu},\qquad G_{\mu\nu}\equiv R_{\mu\nu}-\tfrac12 R\,g_{\mu\nu}$$
SI, without $\Lambda$:
$$R_{\mu\nu}-\tfrac12 R\,g_{\mu\nu}=\frac{8\pi G}{c^{4}}\,T_{\mu\nu}$$
Geometric units ($G=c=1$):
$$G_{\mu\nu}+\Lambda g_{\mu\nu}=8\pi T_{\mu\nu}$$
Carroll's $c=1$ forms are $R_{\mu\nu}-\tfrac12Rg_{\mu\nu}=8\pi GT_{\mu\nu}$ (eq. 4.52) and, with $\Lambda$, $G_{\mu\nu}=8\pi GT_{\mu\nu}-\Lambda g_{\mu\nu}$ (eq. 8.29) — [Carroll](https://arxiv.org/abs/gr-qc/9712019). The Einstein gravitational constant is "$\kappa=8\pi G/c^4\approx2.07665\times10^{-43}\ \text{N}^{-1}$" — [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations). Recomputed: $\kappa=2.07665\times10^{-43}\ \text{N}^{-1}$ (computed from [CODATA 2022 G](https://physics.nist.gov/cgi-bin/cuu/Value?bg) and exact $c$).

**Trace-reversed form (EXACT, same content):**
$$R_{\mu\nu}=\kappa\left(T_{\mu\nu}-\tfrac12T\,g_{\mu\nu}\right)+\Lambda g_{\mu\nu},\qquad T\equiv g^{\mu\nu}T_{\mu\nu}$$
Wikipedia writes it as $R_{\mu\nu}-\Lambda g_{\mu\nu}=\kappa(T_{\mu\nu}-\tfrac12Tg_{\mu\nu})$ — [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations). For $\Lambda=0$ it is Carroll eq. 4.45 — [Carroll](https://arxiv.org/abs/gr-qc/9712019). Derivation, every step:
1. Contract $G_{\mu\nu}+\Lambda g_{\mu\nu}=\kappa T_{\mu\nu}$ with $g^{\mu\nu}$.
2. Use $g^{\mu\nu}g_{\mu\nu}=4$. This gives $R-\tfrac12R\cdot4+4\Lambda=\kappa T$.
3. Simplify to $-R+4\Lambda=\kappa T$, so $R=4\Lambda-\kappa T$.
4. Substitute back: $R_{\mu\nu}=\kappa T_{\mu\nu}-\Lambda g_{\mu\nu}+\tfrac12g_{\mu\nu}(4\Lambda-\kappa T)=\kappa(T_{\mu\nu}-\tfrac12Tg_{\mu\nu})+\Lambda g_{\mu\nu}$.

**B. Plain English.** The curvature of spacetime at a point, in the particular averaged combination $G_{\mu\nu}$, equals a universal constant times the density and flow of energy and momentum at that point. Carroll: "These tell us how the curvature of spacetime reacts to the presence of energy-momentum" — [Carroll §4.1](https://arxiv.org/abs/gr-qc/9712019). Baez & Bunn give an equivalent statement: for "a small ball of freely falling test particles initially at rest with respect to each other," "the rate at which it begins to shrink is proportional to its volume times" the energy density plus the pressures in the $x$, $y$ and $z$ directions. Their equation (2) is $\ddot V/V|_{t=0}=-\tfrac12(\rho+P_x+P_y+P_z)$ in their units, where "we are working in units where c = 1" — [Baez & Bunn, *The Meaning of Einstein's Equation*](https://math.ucr.edu/home/baez/einstein/node3.html) ([arXiv gr-qc/0103044](https://arxiv.org/abs/gr-qc/0103044)).

**C. Symbol-by-symbol anatomy (SI, $x^0=ct$).**
| Symbol | Name | Meaning | SI units |
|---|---|---|---|
| $\mu,\nu$ | free spacetime indices | each runs over 0, 1, 2, 3; 0 is time ($x^0=ct$) and 1–3 are space | none |
| $G_{\mu\nu}$ | Einstein tensor | trace-reversed Ricci curvature, $R_{\mu\nu}-\tfrac12Rg_{\mu\nu}$ | $\text{m}^{-2}$ (second derivatives of the unitless $g$ with respect to lengths) |
| $R_{\mu\nu}$ | Ricci tensor | contraction of Riemann; volume-changing part of curvature | $\text{m}^{-2}$ |
| $R$ | Ricci scalar | $g^{\mu\nu}R_{\mu\nu}$, the trace of Ricci | $\text{m}^{-2}$ |
| $\tfrac12$ | trace-reversal coefficient | makes $G_{\mu\nu}$ divergence-free (see G below) | pure number |
| $g_{\mu\nu}$ | metric tensor | rulers and clocks; the unknown field being solved for | none (when $x^0=ct$) |
| $\Lambda$ | cosmological constant | uniform curvature of empty space | $\text{m}^{-2}$ |
| $8\pi$ | coupling number | $=2\times4\pi$: $4\pi$ is the solid angle of a sphere (Gauss's law); the 2 comes from trace reversal (see Eq. 17) | pure number |
| $G$ | Newton's constant | $6.67430(15)\times10^{-11}$ | $\text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$ |
| $c^4$ | speed of light to the fourth power | converts energy density to curvature | $\text{m}^4\,\text{s}^{-4}$ |
| $8\pi G/c^4=\kappa$ | Einstein's constant | $2.0766\times10^{-43}$ | $\text{s}^2\,\text{m}^{-1}\,\text{kg}^{-1}=\text{N}^{-1}$ |
| $T_{\mu\nu}$ | stress-energy tensor | energy density, momentum density, momentum flux (stress) | $\text{J m}^{-3}=\text{Pa}=\text{kg m}^{-1}\text{s}^{-2}$ |

$G$ is from [NIST CODATA 2022](https://physics.nist.gov/cgi-bin/cuu/Value?bg), with relative standard uncertainty $2.2\times10^{-5}$. Units check, computed: $[\kappa][T]=(\text{s}^2\text{m}^{-1}\text{kg}^{-1})(\text{kg m}^{-1}\text{s}^{-2})=\text{m}^{-2}=[G_{\mu\nu}]=[\Lambda]$. The two sides balance.

**D. Operations.** $G_{\mu\nu}$ involves first and second partial derivatives of $g_{\mu\nu}$, an inverse matrix $g^{\mu\nu}$, products of first derivatives, and contractions (sums over repeated indices). See Eq. (2) for the full expansion. $T_{\mu\nu}$ is algebraic: no derivatives of $g$ appear in it.

**E. Physical interpretation.**
- **"Spacetime is stiff" (ANALOGY with Hooke's law, strain = stress / modulus).** $1/\kappa=c^4/(8\pi G)=4.815\times10^{42}\ \text{N}$ (computed). Water has energy density $\rho c^2=8.99\times10^{19}\ \text{J m}^{-3}$. Multiplying by $\kappa$ gives only $\kappa\rho c^2=1.87\times10^{-23}\ \text{m}^{-2}$ of curvature, which corresponds to a curvature radius of about $2.3\times10^{11}$ m, roughly 1.5 AU (computed). Enormous energy densities are needed to produce noticeable curvature.
- **Pressure gravitates.** In Baez–Bunn's form the source is $\rho+P_x+P_y+P_z$, not $\rho$ alone — [Baez & Bunn](https://math.ucr.edu/home/baez/einstein/node3.html). Carroll's 00 cosmology equation shows the same: $-3\ddot a/a=4\pi G(\rho+3p)$, eq. 8.33 — [Carroll](https://arxiv.org/abs/gr-qc/9712019).
- **The cosmological constant.** Carroll: Einstein's equations with $\Lambda$ "[are] clearly the same form as the equations with no cosmological constant but an energy-momentum tensor for the vacuum, $T^{(vac)}_{\mu\nu}=-\frac{\Lambda}{8\pi G}g_{\mu\nu}$", which "has the form of a perfect fluid with $\rho=-p=\Lambda/8\pi G$" (eqs. 8.29–8.31, $c=1$). "We therefore have $w=-1$, and the energy density is independent of $a$" — [Carroll §8](https://arxiv.org/abs/gr-qc/9712019). Wikipedia gives the same move: $\Lambda$ on the left as $G_{\mu\nu}+\Lambda g_{\mu\nu}=\kappa T_{\mu\nu}$, or on the right as $T^{(vac)}_{\mu\nu}=-(\Lambda/\kappa)g_{\mu\nu}$ with $\rho_{vac}=-p_{vac}=\Lambda/\kappa$ (here $\rho_{vac}$ is an *energy* density) — [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations).
  - In SI: vacuum energy density $u_\Lambda=\Lambda c^4/(8\pi G)=\Lambda/\kappa$ in $\text{J m}^{-3}$. Vacuum mass density $\rho_\Lambda=\Lambda c^2/(8\pi G)$ in $\text{kg m}^{-3}$. Pressure $p_\Lambda=-u_\Lambda$.
  - **Sign check, rest frame, signature $(-,+,+,+)$.** $T^{(vac)}_{00}=-(\Lambda/\kappa)g_{00}=+\Lambda/\kappa>0$, a positive energy density. $T^{(vac)}_{ij}=-(\Lambda/\kappa)\delta_{ij}$, a negative pressure (computed from the formula above).

**F. Worked examples.**
1. **Units balance with numbers (computed).** Take water: $\kappa T_{00}=\kappa\rho c^2=(2.0766\times10^{-43}\ \text{N}^{-1})(8.9876\times10^{19}\ \text{J m}^{-3})=1.866\times10^{-23}\ \text{m}^{-2}$.
2. **Earth's interior curvature is consistent with Earth's exterior field (computed).**
   - Earth's mean density from IAU $(GM)_E$, $R_E$ and CODATA $G$: $\bar\rho=5.495\times10^{3}\ \text{kg m}^{-3}$ (a slight underestimate, because the equatorial radius was used).
   - Then $\tfrac16\kappa\bar\rho c^2=1.709\times10^{-23}\ \text{m}^{-2}$, identical to $GM_E/(c^2R_E^3)=1.709\times10^{-23}\ \text{m}^{-2}$, because $GM/(c^2R^3)=\tfrac{4\pi}{3}G\bar\rho/c^2=\tfrac16\kappa\bar\rho c^2$.
3. **Vacuum (computed with Planck 2018 values; see Key Question 2).** $\Lambda=3\Omega_\Lambda H_0^2/c^2$. With $H_0=67.4$ km/s/Mpc and $\Omega_\Lambda=0.6847$: $\Lambda=1.090\times10^{-52}\ \text{m}^{-2}$, $u_\Lambda=\Lambda/\kappa=5.25\times10^{-10}\ \text{J m}^{-3}$, $p_\Lambda=-5.25\times10^{-10}$ Pa.
   - Check: $\kappa u_\Lambda=1.0904\times10^{-52}\ \text{m}^{-2}=\Lambda$.

**G. Connections.**
- EXACT: the trace of the EFE gives $R=4\Lambda-\kappa T$. For dust with $\Lambda=0$: $T=-\rho c^2$, so $R=\kappa\rho c^2$. Derived above.
- EXACT: the contracted Bianchi identity $\nabla^\mu G_{\mu\nu}=0$, together with $\nabla g=0$, forces $\nabla^\mu T_{\mu\nu}=0$ (local energy–momentum conservation). This is why $G_{\mu\nu}$ is the trace-reversed combination. 10 equations minus 4 identities leaves 6 independent ones — [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations).
- EXACT: vacuum ($T_{\mu\nu}=0$, $\Lambda=0$) gives $R_{\mu\nu}=0$. Schwarzschild satisfies this (SymPy check, Eq. 9).
- APPROXIMATE: weak field, slow motion and a static source give $\nabla^2\Phi=4\pi G\rho$ (Eq. 17).
- ANALOGY: elasticity ("stiffness" $1/\kappa$). Also Poisson's equation (a second-order operator on a potential equals a source).

#### Equation (2): The Einstein tensor fully expanded (EFE as PDEs in $g_{\mu\nu}$)

**A. Three nested layers (all EXACT definitions, MTW/Carroll signs).**
$$G_{\mu\nu}=R_{\mu\nu}-\tfrac12g_{\mu\nu}\,g^{\alpha\beta}R_{\alpha\beta}$$
$$R_{\mu\nu}=\partial_\lambda\Gamma^\lambda_{\mu\nu}-\partial_\nu\Gamma^\lambda_{\mu\lambda}+\Gamma^\lambda_{\lambda\sigma}\Gamma^\sigma_{\mu\nu}-\Gamma^\lambda_{\nu\sigma}\Gamma^\sigma_{\mu\lambda}$$
$$\Gamma^\lambda_{\mu\nu}=\tfrac12g^{\lambda\rho}\left(\partial_\mu g_{\nu\rho}+\partial_\nu g_{\rho\mu}-\partial_\rho g_{\mu\nu}\right)$$
- The Ricci line is Carroll eq. 3.67 contracted on its first and third indices.
- The Christoffel line is Carroll eq. 3.21: "This is one of the most important formulas in this subject; commit it to memory" — [Carroll](https://arxiv.org/abs/gr-qc/9712019).
- Carroll: "Einstein's equations may be thought of as second-order differential equations for the metric tensor field" — [Carroll §4.1](https://arxiv.org/abs/gr-qc/9712019).

**Schematic form.** Substituting layer 3 into layer 2 gives
$$R_{\mu\nu}\sim g^{-1}\,\partial^2 g+g^{-1}g^{-1}(\partial g)(\partial g).$$
This is *linear* in the second derivatives (quasilinear) and *nonlinear* in the first derivatives and in $g$ itself, through the inverse $g^{\mu\nu}$ and through the products $\Gamma\Gamma$.

**Term counts (computed in SymPy this session).** Method: a general symmetric metric (10 functions $g_{\mu\nu}$, 40 first derivatives, 100 second derivatives). The inverse metric $g^{\mu\nu}$ and its derivatives are kept as separate symbols. The expression is fully expanded and like terms are collected.
| Quantity | Number of terms |
|---|---|
| A single Christoffel symbol, e.g. $\Gamma^0_{00}$ / $\Gamma^1_{23}$ | 7 / 8 (at most $4\times3=12$ before combining) |
| $R_{00}$ | 417 |
| $R_{00}$ after writing $\partial g^{-1}=-g^{-1}(\partial g)g^{-1}$ | 399 |
| $R_{12}$ | 520 |
| Ricci scalar $R=g^{\mu\nu}R_{\mu\nu}$ | 2,262 |
| $G_{00}=R_{00}-\tfrac12g_{00}R$ | 2,679 |

These counts do not write $g^{\mu\nu}$ out in terms of $g_{\mu\nu}$. Doing so (cofactors divided by the determinant) would make every term a rational function of the $g_{\mu\nu}$.

**B. Plain English.** Each of the 10 field equations, written out, is a long sum of products of the metric, its inverse, and its first and second derivatives, set equal to an energy–momentum density.

**C. Symbols.**
- $\partial_\lambda=\partial/\partial x^\lambda$ (units $\text{m}^{-1}$).
- $\Gamma$: units $\text{m}^{-1}$.
- $\partial\Gamma$ and $\Gamma\Gamma$: units $\text{m}^{-2}$.
- $\lambda,\sigma,\rho,\alpha,\beta$: dummy (summed) indices.
- $\mu,\nu$: free indices.

**D. Operations.** Matrix inversion ($g\to g^{-1}$), partial differentiation (first and second order), the product rule (on $\partial(g^{-1}\partial g)$), index contraction (summation), and taking a trace ($R$).

**E. Interpretation.**
- There are 10 unknown functions of 4 variables. Because the equations are linear in second derivatives, they can be posed as an evolution problem.
- The 4 Bianchi identities mean that 4 of the 10 equations are constraints, not evolution equations. Carroll distinguishes $G^{0\nu}=8\pi GT^{0\nu}$ (constraints) from $G^{ij}=8\pi GT^{ij}$ (evolution), eqs. 4.82–4.83 — [Carroll](https://arxiv.org/abs/gr-qc/9712019).
- Nonlinearity means gravitational fields gravitate: two solutions cannot simply be added.

**F. Worked example (computed in SymPy).** Take the weak, static, isotropic metric $g=\mathrm{diag}(-(1+2\Phi/c^2),(1-2\Phi/c^2),(1-2\Phi/c^2),(1-2\Phi/c^2))$ and keep only first order in $\Phi$. The 2,679-term $G_{00}$ collapses to a single term:
$$G_{00}=\frac{2}{c^2}\nabla^2\Phi.$$
$R_{00}$ collapses to $\nabla^2\Phi/c^2$. This is the same with or without the spatial perturbation.

**G. Connections.**
- EXACT: Eqs. (7) → (8) → (9) → (2) are definitions chained together.
- APPROXIMATE: in the linear limit $G_{\mu\nu}$ becomes a linear wave-type operator on $h_{\mu\nu}$ ("The linearized field equation is of course $G_{\mu\nu}=8\pi GT_{\mu\nu}$, where $G_{\mu\nu}$ is given by (6.8)") — [Carroll §6](https://arxiv.org/abs/gr-qc/9712019).
- ANALOGY: the left side of Poisson's equation, $\nabla^2\Phi$.

#### Equation (3): The special-relativistic spacetime interval

**A. Forms.**
SI:
$$(\Delta s)^2=-(c\,\Delta t)^2+(\Delta x)^2+(\Delta y)^2+(\Delta z)^2=\eta_{\mu\nu}\Delta x^\mu\Delta x^\nu,\qquad \eta_{\mu\nu}=\mathrm{diag}(-1,1,1,1)$$
Geometric units ($c=1$): $\Delta s^2=-\Delta t^2+\Delta x^2+\Delta y^2+\Delta z^2$. Carroll writes $s^2=\eta_{\mu\nu}\Delta x^\mu\Delta x^\nu$, eq. 1.9 — [Carroll](https://arxiv.org/abs/gr-qc/9712019).

**B. Plain English.** Different inertial observers disagree about time differences and distances between two events. They all agree on this one combination of them.

**C. Symbols.**
- $\Delta s^2$: interval ($\text{m}^2$).
- $c$: $299\,792\,458$ m/s, exact by the SI definition.
- $\Delta t$: s. $\Delta x,\Delta y,\Delta z$: m.
- $\eta_{\mu\nu}$: Minkowski metric (unitless).
- Superscript 2 here *is* a square, because it applies to the bracketed quantity, not to an index.
- The minus sign on the time term is the signature choice.

**D. Operations.** Squaring and summing. In index form it is a double sum with 16 terms, of which only the 4 diagonal terms are non-zero.

**E. Interpretation and classification (signature $-+++$).**
- $\Delta s^2<0$: **timelike**. A massive clock can travel between the events, and $\Delta\tau=\sqrt{-\Delta s^2}/c$.
- $\Delta s^2=0$: **null** (lightlike). Only light connects them.
- $\Delta s^2>0$: **spacelike**. No signal can connect them, and $\sqrt{\Delta s^2}$ is the proper distance.
- In $(+,-,-,-)$ texts the signs of $\Delta s^2$ flip (timelike becomes positive).

**F. Worked example (computed).** Event B is $\Delta t=1.000$ s and $\Delta x=2.000\times10^8$ m from event A.
1. $(c\Delta t)^2=(2.99792458\times10^8)^2=8.98755\times10^{16}\ \text{m}^2$.
2. $(\Delta x)^2=4.00000\times10^{16}\ \text{m}^2$.
3. $\Delta s^2=-8.98755\times10^{16}+4.00000\times10^{16}=-4.98755\times10^{16}\ \text{m}^2$. This is timelike.
4. $\Delta\tau=\sqrt{4.98755\times10^{16}}/c=2.23328\times10^8/2.99792\times10^8=0.744943$ s.
5. **Invariance check.** Boost at $v=0.6c$ ($\gamma=1.25$):
   - $\Delta t'=\gamma(\Delta t-v\Delta x/c^2)=0.749654$ s.
   - $\Delta x'=\gamma(\Delta x-v\Delta t)=2.515566\times10^7$ m.
   - $\Delta s'^2=-(c\cdot0.749654)^2+(2.515566\times10^7)^2=-4.98755\times10^{16}\ \text{m}^2$. Unchanged.
6. **Boost at $v=\Delta x/\Delta t=2\times10^8$ m/s** ($\gamma=1.342385$): $\Delta x'=0$ and $\Delta t'=0.744943$ s. So the proper time is the time read by a clock that is present at both events.
7. **Spacelike case.** With $\Delta x=4.000\times10^8$ m instead: $\Delta s^2=+7.01245\times10^{16}\ \text{m}^2$ and proper distance $2.648\times10^8$ m.
8. **Null case.** $\Delta x=2.99792458\times10^8$ m gives $\Delta s^2=0$.

**G. Connections.**
- EXACT: Eq. (4) with $g_{\mu\nu}=\eta_{\mu\nu}$.
- EXACT: Eq. (5) in flat space gives $d\tau=dt/\gamma$.
- APPROXIMATE: Eq. (4) in any freely falling (locally inertial / Riemann normal) frame at a point, where "the metric at p looks like that of flat space" — [Carroll §2](https://arxiv.org/abs/gr-qc/9712019).
- ANALOGY: Pythagoras' theorem with one sign flipped.

#### Equation (4): The general metric line element

**A. Form.**
$$ds^2=g_{\mu\nu}(x)\,dx^\mu dx^\nu=\sum_{\mu=0}^{3}\sum_{\nu=0}^{3}g_{\mu\nu}dx^\mu dx^\nu$$
Written out using symmetry, this is $g_{00}(dx^0)^2+2g_{01}dx^0dx^1+\dots+g_{33}(dx^3)^2$: 16 terms, 10 distinct coefficients.

**B. Plain English.** The metric is a position-dependent recipe that turns small coordinate steps into real, physical distance or time.

**C. Symbols.**
- $ds^2$: squared infinitesimal interval ($\text{m}^2$).
- $g_{\mu\nu}(x)$: metric components, a symmetric $4\times4$ matrix of functions. Units depend on the coordinates: unitless for $(ct,x,y,z)$; $\text{m}^2$ for an angle coordinate (for example $g_{\theta\theta}=r^2$); $\text{m}^2\text{s}^{-2}$ for $g_{tt}$ if $x^0=t$.
- $dx^\mu$: coordinate differentials.

**D. Operations.** Quadratic form (matrix sandwich $dx^Tg\,dx$). Lengths of curves are found by integrating $\int\sqrt{|g_{\mu\nu}\dot x^\mu\dot x^\nu|}\,d\lambda$.

**E/F. Examples, with worked numbers (computed).**
| Space | Line element | Notes |
|---|---|---|
| Euclidean 3D | $dl^2=dx^2+dy^2+dz^2$ | $g_{ij}=\delta_{ij}$ |
| Flat plane, polar | $dl^2=dr^2+r^2d\theta^2$ | $g=\mathrm{diag}(1,r^2)$; Christoffels nonzero but Riemann = 0 (SymPy) |
| 2-sphere, radius $a$ | $dl^2=a^2(d\theta^2+\sin^2\theta\,d\phi^2)$ | Ricci scalar $2/a^2$ (Eq. 9) |
| Minkowski | $ds^2=-c^2dt^2+dx^2+dy^2+dz^2$ | Eq. (3) |
| Schwarzschild | $ds^2=-\left(1-\frac{r_s}{r}\right)c^2dt^2+\left(1-\frac{r_s}{r}\right)^{-1}dr^2+r^2(d\theta^2+\sin^2\theta\,d\phi^2)$, $r_s=2GM/c^2$ | vacuum solution: $R_{\mu\nu}=0$ verified in SymPy |
| FLRW | $ds^2=-c^2dt^2+a(t)^2\left[\frac{dr^2}{1-kr^2}+r^2d\Omega^2\right]$ | Carroll's form: $ds^2=-dt^2+a^2(t)\gamma_{ij}(u)du^idu^j$, eq. 8.1 — [Carroll](https://arxiv.org/abs/gr-qc/9712019) |

- **Sphere** (computed, with $a=R_E=6.3781\times10^6$ m from [IAU B3](https://arxiv.org/abs/1510.07674)):
  - $1^\circ$ along a meridian: $dl=a\,d\theta=6.3781\times10^6\times0.0174533=111{,}319$ m.
  - $1^\circ$ along the parallel at colatitude $30^\circ$: $dl=a\sin\theta\,d\phi=55{,}659$ m. The factor $g_{\phi\phi}=a^2\sin^2\theta$ shrinks east–west steps near the pole.
- **Schwarzschild radii** (computed): Sun $r_s=2953.25$ m; Earth $r_s=8.870$ mm; neutron star of $1.4\,M_\odot$, $r_s=4134.6$ m.
- **Schwarzschild radial stretching** (computed):
  - At Earth's surface, $r_s/r=1.3907\times10^{-9}$, so $\sqrt{g_{rr}}-1=6.95\times10^{-10}$. A 1 km coordinate step is 0.695 μm longer in proper distance.
  - At the surface of a $1.4\,M_\odot$, 12 km neutron star, $r_s/R=0.3445$, $\sqrt{g_{rr}}=1.235$ and $\sqrt{-g_{tt}}/c=0.8096$.

**G. Connections.**
- EXACT: Eq. (3) is the special case $g=\eta$.
- EXACT: Eq. (5) is the line element along a timelike path divided by $-c^2$.
- EXACT: Eq. (7) builds $\Gamma$ from derivatives of $g$.
- APPROXIMATE: Schwarzschild at $r\gg r_s$ gives the weak-field metric of Eq. (17).

#### Equation (5): Proper time

**A. Forms.**
$$d\tau=\frac{1}{c}\sqrt{-g_{\mu\nu}\,dx^\mu dx^\nu}\qquad\Longrightarrow\qquad \tau_{AB}=\frac1c\int_A^B\sqrt{-g_{\mu\nu}\frac{dx^\mu}{d\lambda}\frac{dx^\nu}{d\lambda}}\;d\lambda$$
Geometric units ($c=1$): $d\tau^2=-g_{\mu\nu}dx^\mu dx^\nu$.

Special cases (derived step by step in F):
- Flat space: $d\tau=dt\sqrt{1-v^2/c^2}=dt/\gamma$.
- Weak field: $d\tau\approx dt\left(1+\Phi/c^2-v^2/2c^2\right)$.

**B. Plain English.** The time actually ticked by a clock carried along a path. It depends on how fast the clock moves and on how deep in a gravitational potential it sits.

**C. Symbols.**
- $\tau$: proper time (s).
- The minus sign makes the radicand positive for timelike paths in $(-,+,+,+)$.
- $1/c$ converts metres to seconds.
- $\lambda$: any parameter along the path.
- $\Phi$: Newtonian potential ($\text{J kg}^{-1}=\text{m}^2\text{s}^{-2}$, negative near masses).
- $v$: speed (m/s).
- $\gamma=(1-v^2/c^2)^{-1/2}$: Lorentz factor (unitless).

**D. Operations.** Square root, a path integral, and a first-order Taylor expansion $\sqrt{1+\epsilon}\approx1+\epsilon/2$.

**E. Interpretation.** Proper time is the physically measured time. Coordinate time $t$ is a label. GR's "twin paradox" result is that, between two fixed events, the free-fall (geodesic) path has the *longest* proper time.

**F. Worked examples (all computed).**

*Weak-field derivation (SI).*
1. Start from $ds^2=-(1+2\Phi/c^2)c^2dt^2+(1-2\Phi/c^2)|d\vec x|^2$.
2. Then $-ds^2/(c^2dt^2)=(1+2\Phi/c^2)-(1-2\Phi/c^2)v^2/c^2$.
3. Drop the product $\Phi v^2/c^4$, which is of second order: $\approx1+2\Phi/c^2-v^2/c^2$.
4. Take the square root using $\sqrt{1+\epsilon}\approx1+\epsilon/2$: $d\tau/dt\approx1+\Phi/c^2-v^2/(2c^2)$.

*(a) Muon at $0.998c$.* Mean lifetime $\tau_\mu=2.1969811(22)\ \mu\text{s}$ — [PDG](https://pdglive.lbl.gov/view/S004T).
1. $\gamma=1/\sqrt{1-0.998^2}=1/\sqrt{0.003996}=15.819$.
2. Dilated lab lifetime $\gamma\tau_\mu=34.75\ \mu$s. Mean decay length $\gamma\beta c\tau_\mu=10.40$ km, against $\beta c\tau_\mu=657$ m without time dilation.
3. Over a 10 km descent, the lab time is $10^4/(0.998c)=33.42\ \mu$s and the muon's proper time is $33.42/15.819=2.113\ \mu$s.
4. Surviving fraction: $e^{-2.113/2.197}=0.382$. The naive (no-dilation) estimate would be $e^{-33.42/2.197}=2.5\times10^{-7}$.

*(b) GPS satellite clock versus a clock on the ground (Ashby 2003 parameters).*
- Inputs: orbit semi-major axis "$a_0=2.656175\times10^7$ m"; "$GM_E=3.986004418\times10^{14}\ \text{m}^3\text{s}^{-2}$"; geoid potential "$\Phi_0/c^2=6.969290134\times10^{-10}$" in magnitude, with "$\Phi_0$ is negative" — [Ashby, *Relativity in the Global Positioning System*, Living Rev. Relativ. 6:1 (2003)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/). $\Phi_0$ includes the centrifugal potential of Earth's rotation.
- Steps (circular orbit, so $v^2=GM_E/a$, giving $v=3873.8$ m/s and altitude 20,184 km):
  1. Gravitational term: $(-GM_E/a-\Phi_0)/c^2=-1.66970\times10^{-10}+6.96929\times10^{-10}=+5.29959\times10^{-10}$. Times 86,400 s, that is **+45.79 μs/day**.
  2. Velocity term: $-v^2/(2c^2)=-GM_E/(2ac^2)=-8.3485\times10^{-11}$, which is **−7.21 μs/day**.
  3. Net: $+4.46473\times10^{-10}$, which is **+38.58 μs/day** (rounded, +38.6 μs/day). The satellite clock runs fast.
- This fractional offset reproduces the factory setting: $10.23\ \text{MHz}\times(1-4.4647\times10^{-10})=10.22999999543$ MHz.
- Cross-check: Wikipedia gives +45.85 μs/day (gravitational), −7.214 μs/day (velocity) and a net 38.6 μs/day ("38,640 ns"), and quotes "10.22999999543 MHz instead of 10.23 MHz" — [Wikipedia, Error analysis for GPS](https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System). Its gravitational value differs by 0.06 μs/day because it uses a different ground potential (not Ashby's geoid $\Phi_0$).
- The light-travel distance of 38.6 μs is 11.6 km. That raw figure is often quoted as a "daily position error". Wikipedia cautions that such claims are not literally true, because of how GPS solutions work — [Wikipedia GPS error analysis](https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System).

*(c) Clock on a mountain versus sea level.* Use $\Delta(d\tau/dt)\approx g\,h/c^2$ with $g=9.80665\ \text{m s}^{-2}$.
- For $h=3000$ m: $9.80665\times3000/8.98755\times10^{16}=3.273\times10^{-13}$. That is **+28.3 ns/day**, or **10.3 μs/year**, faster at altitude.
- Mount Everest ($h=8849$ m): +83.4 ns/day.
- Laboratory confirmation: Chou, Hume, Rosenband & Wineland, "Optical clocks and relativity", *Science* 329, 1630 (2010), DOI 10.1126/science.1192720. They raised one Al⁺ optical clock 33 cm and saw a fractional shift of "about $4\times10^{-17}$", in agreement with GR — [Physics Today news](https://physicstoday.aip.org/news/relativistic-effects-seen-at-everyday-distances-and-speeds). Prediction (computed): $gh/c^2=3.60\times10^{-17}$ for $h=0.33$ m.

*(d) Earth's surface versus far from Earth.* $GM_E/(R_Ec^2)=6.954\times10^{-10}$, so a surface clock runs slow by 60.08 μs/day relative to a clock at infinity (computed).

**G. Connections.**
- EXACT: special case of Eq. (4) for a timelike path.
- EXACT: maximising $\tau$ (making it stationary) gives the geodesic Eq. (6).
- APPROXIMATE: $d\tau/dt\approx1+\Phi/c^2-v^2/2c^2$ when $|\Phi|/c^2\ll1$ and $v\ll c$.
- ANALOGY: an odometer, which measures the length of the path actually travelled.

#### Equation (6): The geodesic equation

**A. Form.**
$$\frac{d^2x^\mu}{d\tau^2}+\Gamma^\mu_{\alpha\beta}\frac{dx^\alpha}{d\tau}\frac{dx^\beta}{d\tau}=0$$
Carroll writes it with an affine parameter $\lambda$ (eq. 3.47): "This is the geodesic equation, another one which you should memorize" — [Carroll](https://arxiv.org/abs/gr-qc/9712019). It has the same form in geometric units. For light, use an affine $\lambda$, since $d\tau=0$.

**B. Plain English.** A freely falling body moves as straight as spacetime allows. The $\Gamma$ term corrects for curved coordinates and curved spacetime, and in the Newtonian limit it becomes "gravity".

**C. Symbols.**
- $x^\mu(\tau)$: worldline (m).
- $d^2x^\mu/d\tau^2$: 4-acceleration ($\text{m s}^{-2}$).
- $dx^\alpha/d\tau=u^\alpha$: 4-velocity ($\text{m s}^{-1}$), with $u^\mu u_\mu=-c^2$.
- $\Gamma^\mu_{\alpha\beta}$: Christoffel symbols ($\text{m}^{-1}$ when $x^0=ct$).
- $\mu$: free index (4 equations).
- $\alpha,\beta$: summed (16 terms each, symmetric).

**D. Operations.** Second derivative in time, a double sum, a product of velocities. It is a set of four coupled second-order nonlinear ODEs.

**E. Interpretation.** In GR there is no gravitational force: free fall *is* inertial motion along geodesics. Freely falling observers feel weightless.

**F. Worked checks.**
1. **Flat space, Cartesian coordinates.** $\Gamma=0$, so $d^2x^\mu/d\lambda^2=0$, which gives $x^\mu=x^\mu_0+v^\mu\lambda$, a straight line — [Carroll eq. 3.47 and following text](https://arxiv.org/abs/gr-qc/9712019).
2. **Flat plane, polar coordinates (computed, SymPy).**
   - The non-zero symbols are $\Gamma^r_{\theta\theta}=-r$ and $\Gamma^\theta_{r\theta}=\Gamma^\theta_{\theta r}=1/r$.
   - The geodesic equations are $\ddot r-r\dot\theta^2=0$ and $\ddot\theta+(2/r)\dot r\dot\theta=0$.
   - Test with the straight line $x=1$, $y=\lambda$: $r=\sqrt{1+\lambda^2}$, $\theta=\arctan\lambda$.
   - Derivatives: $\dot r=\lambda/r$, $\ddot r=1/r^3$, $\dot\theta=1/r^2$, $\ddot\theta=-2\lambda/r^4$.
   - First equation: $1/r^3-r\cdot1/r^4=0$. Satisfied.
   - Second equation: $-2\lambda/r^4+(2/r)(\lambda/r)(1/r^2)=0$. Satisfied.
   - So the $\Gamma$ terms are pure "coordinate curvature" here, and the Riemann tensor is 0 (SymPy).
3. **Newtonian gravity from the geodesic equation (SI, $x^0=ct$).** Follows Carroll eqs. 4.10–4.21, which are written in $c=1$ — [Carroll §4.1](https://arxiv.org/abs/gr-qc/9712019).
   - *Slow motion:* $|dx^i/d\tau|\ll|dx^0/d\tau|=c\,dt/d\tau$. Every term with a spatial velocity is smaller than the $\Gamma^\mu_{00}$ term by $v/c$ or $(v/c)^2$. For Earth's orbital speed, $(v/c)^2\approx10^{-8}$. Keep only $\frac{d^2x^\mu}{d\tau^2}+\Gamma^\mu_{00}\left(c\frac{dt}{d\tau}\right)^2=0$ (Carroll 4.11).
   - *Static:* $\partial_0g_{\mu\nu}=0$, so $\Gamma^\mu_{00}=\tfrac12g^{\mu\lambda}(2\partial_0g_{\lambda0}-\partial_\lambda g_{00})=-\tfrac12g^{\mu\lambda}\partial_\lambda g_{00}$ (Carroll 4.12).
   - *Weak field:* $g_{\mu\nu}=\eta_{\mu\nu}+h_{\mu\nu}$ with $|h|\ll1$, so $g^{\mu\nu}\approx\eta^{\mu\nu}-h^{\mu\nu}$ (4.13–4.14), and $\Gamma^\mu_{00}\approx-\tfrac12\eta^{\mu\lambda}\partial_\lambda h_{00}$ (4.15).
   - *$\mu=0$:* $\Gamma^0_{00}=-\tfrac12\eta^{00}\partial_0h_{00}=0$, so $d^2t/d\tau^2=0$ and $dt/d\tau$ is constant (4.17).
   - *$\mu=i$:* $\eta^{ij}=\delta^{ij}$, so $\Gamma^i_{00}=-\tfrac12\partial_ih_{00}$ and $\frac{d^2x^i}{d\tau^2}=\tfrac12c^2\left(\frac{dt}{d\tau}\right)^2\partial_ih_{00}$.
   - Divide by $(dt/d\tau)^2$, which is allowed because it is constant: $\frac{d^2x^i}{dt^2}=\tfrac12c^2\partial_ih_{00}$ (4.19).
   - Compare with Newton's $\frac{d^2x^i}{dt^2}=-\partial_i\Phi$. They match if $h_{00}=-2\Phi/c^2$, that is $g_{00}=-(1+2\Phi/c^2)$ (4.20–4.21, here in SI).
   - SymPy check (computed): for $g_{00}=-(1+2\Phi/c^2)$, $\Gamma^x_{00}=+\partial_x\Phi/c^2$.
   - **Sign note for the writer.** With this $h_{00}$, $\Gamma^i_{00}=-\tfrac12\partial_ih_{00}=+\partial_i\Phi/c^2$. The brief's "$\Gamma^i_{00}\approx\tfrac12\partial_ih_{00}$" carries the opposite sign unless $h_{00}$ is defined by $g_{00}=-(1+h_{00})$.
4. **Numbers at Earth's surface (computed, Schwarzschild).** A particle released at rest has $d^2r/d\tau^2=-\Gamma^r_{tt}(dt/d\tau)^2$. With $\Gamma^r_{tt}=9.7984\ \text{m s}^{-2}$ (see Eq. 7), this is $-9.80\ \text{m s}^{-2}$: ordinary $g$.

**G. Connections.**
- EXACT: stationary-proper-time paths of Eq. (5) satisfy Eq. (6).
- EXACT: Eq. (7) supplies $\Gamma$.
- APPROXIMATE: Newton's second law with gravity, under weak, static, slow conditions (above).
- EXACT: comparing neighbouring geodesics gives the Riemann tensor through the geodesic-deviation equation (Eq. 8).
- ANALOGY: Newton's first law (a straight line at constant speed).

#### Equation (7): Christoffel symbols (Levi-Civita connection)

**A. Form.**
$$\Gamma^\sigma_{\mu\nu}=\tfrac12g^{\sigma\rho}\left(\partial_\mu g_{\nu\rho}+\partial_\nu g_{\rho\mu}-\partial_\rho g_{\mu\nu}\right)$$
— [Carroll eq. 3.21](https://arxiv.org/abs/gr-qc/9712019). It is derived from metric compatibility ($\nabla_\mu g_{\nu\rho}=0$, eq. 3.19) and torsion-freeness ($\Gamma^\lambda_{\mu\nu}=\Gamma^\lambda_{(\mu\nu)}$) — [Carroll §3.2](https://arxiv.org/abs/gr-qc/9712019). The formula is unchanged in geometric units.

**B. Plain English.** These are the correction terms that say how the coordinate basis directions twist and stretch from point to point. They are built from the slopes of the metric.

**C. Symbol-by-symbol.**
- $\Gamma$ (capital gamma): a connection coefficient. It is **not a tensor**, and in locally inertial coordinates it can be made zero at a point.
- Upper index $\sigma$: the component of the output (the "direction of the correction").
- Lower $\mu,\nu$: the two input directions. The symbol is symmetric in them.
- $\tfrac12$: undoes the doubling that comes from adding the permuted derivative equations.
- $g^{\sigma\rho}$: inverse metric. Contracting with it raises the index. $\rho$ is summed (4 terms).
- $\partial_\mu g_{\nu\rho}$, $\partial_\nu g_{\rho\mu}$, $-\partial_\rho g_{\mu\nu}$: three permutations of the metric's first derivatives. The minus sign on the third is part of the definition.
- Units: $\text{m}^{-1}$ when all coordinates are lengths. In general, (units of $x^\sigma$)/(units of $x^\mu$ × units of $x^\nu$). So $\Gamma^r_{tt}$ has $\text{m s}^{-2}$ and $\Gamma^r_{\theta\theta}$ has m.
- Count: $4\times10=40$ independent components in 4D (symmetric lower pair).

**D. Operations.** Partial derivatives of the metric, matrix inverse, and a sum over $\rho$.

**E. Interpretation.** In the geodesic equation, $-\Gamma^i_{00}c^2$ is the Newtonian gravitational acceleration (Eq. 6). Gravity's "force field" is therefore a coordinate-dependent object. That is the equivalence principle: you can make it vanish at a point by free fall.

**F. Worked examples (computed in SymPy, every result checked).**
- Flat polar: $\Gamma^r_{\theta\theta}=-r$, $\Gamma^\theta_{r\theta}=1/r$.
- 2-sphere of radius $a$: $\Gamma^\theta_{\phi\phi}=-\sin\theta\cos\theta$, $\Gamma^\phi_{\theta\phi}=\cot\theta$.
- **Schwarzschild with $x^0=t$ (time in seconds):**
  $$\Gamma^r_{tt}=\tfrac12g^{rr}(-\partial_rg_{tt})=\tfrac12\left(1-\tfrac{r_s}{r}\right)\partial_r\!\left[\left(1-\tfrac{r_s}{r}\right)c^2\right]=\frac{r_sc^2}{2r^2}\left(1-\frac{r_s}{r}\right)\quad[\text{m s}^{-2}]$$
  - Step 1: only $\rho=r$ contributes, and $\partial_tg=0$.
  - Step 2: $g^{rr}=1-r_s/r$.
  - Step 3: $\partial_r[-(1-r_s/r)c^2]=-r_sc^2/r^2$.
  - SymPy output: $c^2r_s(r-r_s)/(2r^3)$, the same expression.
- **Same metric with $x^0=ct$:** $\Gamma^r_{00}=\frac{r_s}{2r^2}\left(1-\frac{r_s}{r}\right)$ in $\text{m}^{-1}$.
- Other Schwarzschild symbols (SymPy): $\Gamma^t_{tr}=\frac{r_s}{2r(r-r_s)}$, $\Gamma^r_{rr}=-\frac{r_s}{2r(r-r_s)}$, $\Gamma^r_{\theta\theta}=-(r-r_s)$.
- **Numbers at Earth's surface** (IAU $(GM)_E$, $R_E$; $r_s=8.870$ mm):
  - $\Gamma^r_{tt}=9.798398\ \text{m s}^{-2}$, against $GM_E/R_E^2=9.798398\ \text{m s}^{-2}$. They differ by $1.4\times10^{-9}$ relative, from the factor $(1-r_s/r)$.
  - $\Gamma^r_{00}=1.090\times10^{-16}\ \text{m}^{-1}$.

**G. Connections.**
- EXACT: feeds Eq. (6) and Eq. (8).
- EXACT: $\Gamma=0$ in Cartesian flat coordinates.
- APPROXIMATE: $\Gamma^i_{00}\approx\partial_i\Phi/c^2$ in the weak field.
- ANALOGY: the "fictitious forces" (centrifugal, Coriolis) of rotating or curvilinear coordinates in mechanics.

#### Equation (8): Riemann curvature tensor

**A. Form (MTW/Carroll).**
$$R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$$
— [Carroll eq. 3.67](https://arxiv.org/abs/gr-qc/9712019). It is defined by the commutator of covariant derivatives, $[\nabla_\mu,\nabla_\nu]V^\rho=R^\rho{}_{\sigma\mu\nu}V^\sigma$ (torsion-free). The formula is the same in geometric units.

**B. Plain English.** Carry a vector around a tiny closed loop, keeping it "as parallel as possible". The Riemann tensor says how much it comes back rotated. Equivalently, it measures how neighbouring free-fall paths accelerate towards or away from each other.

**C. Symbols.**
- $\rho$: the output component.
- $\sigma$: the vector being transported.
- $\mu,\nu$: the two sides of the loop. The tensor is antisymmetric in them: $R^\rho{}_{\sigma\mu\nu}=-R^\rho{}_{\sigma\nu\mu}$ (Carroll 3.64).
- Two derivative terms ($\partial\Gamma$) and two quadratic terms ($\Gamma\Gamma$).
- Units: $\text{m}^{-2}$ (with $x^0=ct$).

**Symmetries.**
- $R_{\rho\sigma\mu\nu}=-R_{\sigma\rho\mu\nu}=-R_{\rho\sigma\nu\mu}=R_{\mu\nu\rho\sigma}$.
- $R_{\rho[\sigma\mu\nu]}=0$ (first Bianchi identity).

**Counting.**
- $4^4=256$ raw components.
- Independent components: $n^2(n^2-1)/12$, which is 20 in 4D. "In four dimensions, therefore, the Riemann tensor has 20 independent components… These twenty functions are precisely the 20 degrees of freedom in the second derivatives of the metric which we could not set to zero by a clever choice of coordinates" — [Carroll eq. 3.85 and text](https://arxiv.org/abs/gr-qc/9712019).
- Computed: $n=1,2,3,4,5$ gives $0,1,6,20,50$.

**D. Operations.** Derivatives of $\Gamma$ (so second derivatives of $g$), products, and antisymmetrisation.

**E. Interpretation.** Curvature is tidal acceleration. Geodesic deviation: "$a^\mu=\frac{D^2}{d\tau^2}S^\mu=R^\mu{}_{\nu\rho\sigma}T^\nu T^\rho S^\sigma$ … the relative acceleration between two neighboring geodesics is proportional to the curvature" — [Carroll eq. 3.113](https://arxiv.org/abs/gr-qc/9712019). In flat space $R=0$ everywhere, "thus $R^\rho{}_{\sigma\mu\nu}=0$ by (3.67)" — [Carroll](https://arxiv.org/abs/gr-qc/9712019). The polar-coordinate Riemann tensor is identically 0 (SymPy), even though its $\Gamma\neq0$.

**F. Worked examples (computed in SymPy).**
- **2-sphere, radius $a$.**
  - $R^\theta{}_{\phi\theta\phi}=\sin^2\theta$ (SymPy returns $\sin2\theta/(2\tan\theta)-\cos2\theta$, which simplifies to $\sin^2\theta$).
  - Lowered: $R_{\theta\phi\theta\phi}=a^2\sin^2\theta$.
  - In 2D this is the single independent component.
  - It satisfies the maximally symmetric form $R_{\rho\sigma\mu\nu}=a^{-2}(g_{\rho\mu}g_{\sigma\nu}-g_{\rho\nu}g_{\sigma\mu})$ — [Carroll eq. 3.106](https://arxiv.org/abs/gr-qc/9712019).
- **Schwarzschild tidal components, orthonormal static frame (SymPy).**
  - $R^{\hat r}{}_{\hat t\hat r\hat t}=-r_s/r^3=-2GM/(c^2r^3)$ (radial).
  - $R^{\hat\theta}{}_{\hat t\hat\theta\hat t}=+r_s/(2r^3)=+GM/(c^2r^3)$ (transverse).
  - Through Carroll 3.113 this gives radial relative acceleration $+(2GM/r^3)\xi$ (stretching) and transverse $-(GM/r^3)\xi$ (squeezing): the Newtonian tidal tensor.
- **Curvature scales, $GM/(c^2r^3)$ (computed with IAU B3 and CODATA):**
| Location | $GM/(c^2r^3)$ [$\text{m}^{-2}$] | radial $2GM/(c^2r^3)$ | "radius of curvature" $(GM/c^2r^3)^{-1/2}$ | Newtonian tidal $2GM/r^3$ [$\text{s}^{-2}$] |
|---|---|---|---|---|
| Earth's surface | $1.71\times10^{-23}$ | $3.42\times10^{-23}$ | $2.4\times10^{11}$ m (≈1.6 AU) | $3.07\times10^{-6}$ |
| GPS orbit | $2.37\times10^{-25}$ | $4.73\times10^{-25}$ | $2.1\times10^{12}$ m | $4.25\times10^{-8}$ |
| Sun's surface | $4.39\times10^{-24}$ | $8.77\times10^{-24}$ | $4.8\times10^{11}$ m | $7.88\times10^{-7}$ |
| Earth's orbit (Sun's field) | $4.41\times10^{-31}$ | $8.82\times10^{-31}$ | $1.5\times10^{15}$ m | $7.93\times10^{-14}$ |
| Neutron star surface ($1.4M_\odot$, 12 km) | $1.20\times10^{-9}$ | $2.39\times10^{-9}$ | $2.9\times10^{4}$ m | $2.15\times10^{8}$ |

**G. Connections.**
- EXACT: contractions give Eq. (9).
- EXACT: geodesic deviation (Carroll 3.113).
- EXACT: Ricci + Weyl decomposition. In 4D, 20 = 10 (Ricci) + 10 (Weyl), by component counting.
- APPROXIMATE: the Newtonian tidal tensor $\partial_i\partial_j\Phi\approx c^2R^i{}_{0j0}$ (Carroll 4.49 with $R^i{}_{0j0}\approx\partial_j\Gamma^i_{00}$).
- ANALOGY: Gaussian curvature of a surface, and the holonomy of a Foucault pendulum.

#### Equation (9): Ricci tensor and Ricci scalar

**A. Forms.**
$$R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}=\partial_\lambda\Gamma^\lambda_{\mu\nu}-\partial_\nu\Gamma^\lambda_{\mu\lambda}+\Gamma^\lambda_{\lambda\sigma}\Gamma^\sigma_{\mu\nu}-\Gamma^\lambda_{\nu\sigma}\Gamma^\sigma_{\mu\lambda},\qquad R=g^{\mu\nu}R_{\mu\nu}$$
Carroll: "the Ricci tensor via $R_{\mu\nu}=g^{\alpha\beta}R_{\alpha\mu\beta\nu}$" — [Carroll §3.6](https://arxiv.org/abs/gr-qc/9712019).

**B. Plain English.** Ricci is the "average" of Riemann over directions. It tells how a small ball of free particles changes *volume*. The Ricci scalar is a single number giving the overall curvature at a point.

**C. Symbols.**
- $\lambda$ is contracted: the 1st and 3rd slots of Riemann are summed.
- $R_{\mu\nu}$ is symmetric, so it has 10 components.
- $R$ (scalar) has 1 component.
- Units: $\text{m}^{-2}$.

**D. Operations.** Contraction (trace over a pair of indices), then a second trace with $g^{\mu\nu}$.

**E. Interpretation.** In a vacuum $R_{\mu\nu}=0$ (no matter, so no volume change of a ball of dust to first order). The Riemann tensor can still be non-zero there: the Weyl/tidal part. Baez & Bunn describe the shape change: the ball "will, to second order in time, become an ellipsoid" — [Baez & Bunn](https://math.ucr.edu/home/baez/einstein/node3.html).

**F. Worked examples.**
- **2-sphere.**
  - $R_{\theta\theta}=1$, $R_{\theta\phi}=0$, $R_{\phi\phi}=\sin^2\theta$ (Carroll eq. 3.104).
  - $R=g^{\theta\theta}R_{\theta\theta}+g^{\phi\phi}R_{\phi\phi}=\frac1{a^2}\cdot1+\frac{1}{a^2\sin^2\theta}\sin^2\theta=\frac{2}{a^2}$ (Carroll eq. 3.105) — [Carroll](https://arxiv.org/abs/gr-qc/9712019). Confirmed in SymPy.
  - Carroll notes that the conventions "conspired so that spaces which everyone agrees to call positively curved actually have a positive Ricci scalar."
  - Numbers (computed): a sphere of Earth's radius ($a=6.3781\times10^6$ m) has $R=2/a^2=4.92\times10^{-14}\ \text{m}^{-2}$.
- **Schwarzschild.** $R_{\mu\nu}=0$ identically (SymPy verified), while Riemann $\neq0$ (Eq. 8).
- **Dust with $\Lambda=0$.** The trace of the EFE gives $R=\kappa\rho c^2$. For water this is $1.87\times10^{-23}\ \text{m}^{-2}$ (computed).

**G. Connections.**
- EXACT: $G_{\mu\nu}=R_{\mu\nu}-\tfrac12Rg_{\mu\nu}$.
- EXACT: contracted Bianchi identity $\nabla^\mu G_{\mu\nu}=0$.
- EXACT: in 2D, $R_{\mu\nu}=\tfrac12Rg_{\mu\nu}$, so $G_{\mu\nu}\equiv0$. 2D GR therefore has no dynamics (inference from the sphere result plus maximal symmetry).
- APPROXIMATE: $R_{00}\approx\nabla^2\Phi/c^2$ in the weak static field (Eq. 17).
- ANALOGY: the Laplacian as the "average minus centre value".

#### Equation (10): Stress-energy tensor and the perfect fluid

**A. Forms.**
- General: a symmetric (2,0) tensor $T^{\mu\nu}$, "sometimes called the stress-energy tensor" — [Carroll §1](https://arxiv.org/abs/gr-qc/9712019).
- Carroll's perfect fluid ($c=1$, $\rho$ = rest-frame **energy** density): "$T^{\mu\nu}=(\rho+p)U^\mu U^\nu+p\eta^{\mu\nu}$" (eq. 1.110), with $\eta^{\mu\nu}$ replaced by $g^{\mu\nu}$ in curved spacetime — [Carroll](https://arxiv.org/abs/gr-qc/9712019).
- **SI, with $\rho$ = rest-frame mass(-energy) density in kg m⁻³** (used consistently in these notes):
$$T^{\mu\nu}=\left(\rho+\frac{p}{c^2}\right)u^\mu u^\nu+p\,g^{\mu\nu},\qquad u^\mu=\frac{dx^\mu}{d\tau},\quad u^\mu u_\mu=-c^2$$
- Rest frame, Minkowski: $u^\mu=(c,0,0,0)$, so
$$T^{\mu\nu}=\begin{pmatrix}\rho c^2&0&0&0\\0&p&0&0\\0&0&p&0\\0&0&0&p\end{pmatrix}$$
- Step for $T^{00}$: $(\rho+p/c^2)c^2+p\,\eta^{00}=\rho c^2+p-p=\rho c^2$.
- Equivalent form with energy density $\varepsilon=\rho c^2$ (J m⁻³): $T^{\mu\nu}=(\varepsilon+p)u^\mu u^\nu/c^2+pg^{\mu\nu}$.
- Trace: $T=-\rho c^2+3p$.

**B. Plain English.** A single $4\times4$ table holds everything that sources gravity: energy density, the flow of energy, momentum density, pressure and shear stress.

**C. Component-by-component (SI, $x^0=ct$; every entry in J m⁻³ = Pa).**
- $T^{00}$: energy density, including rest mass via $\rho c^2$.
- $T^{0i}=T^{i0}$: (energy flux)/$c$, which equals $c\,\times$ momentum density.
- $T^{ij}$: flux of $i$-momentum across a surface of constant $x^j$, i.e. stress. The diagonal entries are pressures; the off-diagonal entries are shears.
- Baez–Bunn: "The energy density is the flow of t-momentum in the t-direction. Pressure in each direction is the flow of momentum in that direction", and these flows are diagonal entries of "the 'stress-energy tensor', a 4×4 matrix T" — [Baez & Bunn](https://math.ucr.edu/home/baez/einstein/node3.html).
- $u^\mu$: 4-velocity (m s⁻¹). $p$: pressure (Pa). $\rho$: kg m⁻³.

**D. Operations.** Outer product $u^\mu u^\nu$, and adding a multiple of the inverse metric.

**E. Interpretation.**
- Dust: $p=0$.
- Radiation: $p=\rho c^2/3$, which makes the trace $T=0$.
- Vacuum: $p=-\rho c^2$. "This has the form of a perfect fluid with $\rho=-p=\Lambda/8\pi G$", $w=-1$ — [Carroll eqs. 8.30–8.31](https://arxiv.org/abs/gr-qc/9712019).
- For everyday matter, $p\ll\rho c^2$, which is why only $T^{00}$ matters in the Newtonian limit ("the rest energy $\rho=T_{00}$ will be much larger than the other terms" — [Carroll §4.1](https://arxiv.org/abs/gr-qc/9712019)).

**F. Numbers (computed).**
| Material | $\rho$ [kg m⁻³] | $T^{00}=\rho c^2$ [J m⁻³] | $p$ [Pa] | $p/\rho c^2$ | $\kappa\rho c^2$ [m⁻²] |
|---|---|---|---|---|---|
| Water (1 atm) | $1.000\times10^3$ | $8.99\times10^{19}$ | $1.013\times10^5$ | $1.1\times10^{-15}$ | $1.87\times10^{-23}$ |
| Air, sea level (ISA) | 1.225 | $1.10\times10^{17}$ | $1.013\times10^5$ | $9.2\times10^{-13}$ | $2.29\times10^{-26}$ |
| Sun's centre | $1.622\times10^5$ | $1.46\times10^{22}$ | $2.477\times10^{16}$ ($2.477\times10^{11}$ bar) | $1.7\times10^{-6}$ | $3.03\times10^{-21}$ |
| Neutron-star matter at nuclear saturation | $\approx2.8\times10^{17}$ | $2.5\times10^{34}$ | (not sourced) | (not sourced) | $5.2\times10^{-9}$ |
| Neutron-star centre ("a few times $10^{15}$ g cm⁻³") | $\sim(1\text{–}3)\times10^{18}$ | $\sim(0.9\text{–}2.7)\times10^{35}$ | (not sourced) | (not sourced) | $\sim(2\text{–}6)\times10^{-8}$ |
| Cosmic vacuum (Λ) | $5.84\times10^{-27}$ (≈3.5 proton masses per m³) | $5.25\times10^{-10}$ | $-5.25\times10^{-10}$ | $-1$ | $1.09\times10^{-52}$ ($=\Lambda$) |

Sources for the table:
- Sun's centre: "Central pressure: 2.477 × 10¹¹ bar … Central density: 1.622 × 10⁵ kg/m³" — [NASA Sun Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html).
- Nuclear saturation: "$\rho_0=2.8\times10^{14}$ g cm⁻³ … $n_0=0.16$ baryons fm⁻³" and "the central density may exceed a few times $10^{15}$ g cm⁻³". These are from search-result excerpts of arXiv neutron-star reviews ([Ekşi 2016, arXiv:1511.04305](https://arxiv.org/abs/1511.04305) and/or [Lattimer & Prakash, arXiv:astro-ph/0411280](https://arxiv.org/abs/astro-ph/0411280)). The exact attribution was not confirmed (see Gaps). Lattimer & Prakash give saturation as "$\rho_s\simeq2.6\times10^{14}$ g cm⁻³" — [arXiv:astro-ph/0411280](https://arxiv.org/abs/astro-ph/0411280).
- Water and air: standard reference values, not re-fetched.

**G. Connections.**
- EXACT: the right-hand side of Eq. (1).
- EXACT: $\nabla_\mu T^{\mu\nu}=0$ (from Bianchi).
- EXACT: $\Lambda$ ⇔ vacuum fluid.
- APPROXIMATE: $T^{00}\approx\rho c^2$ is the only important component when $v\ll c$ and $p\ll\rho c^2$ (Newtonian limit).
- ANALOGY: the Cauchy stress tensor of continuum mechanics, extended by a time row and column.

#### Equation (17): The Newtonian limit of GR (in full)

**A. Target equations.**
- Poisson: $\nabla^2\Phi=4\pi G\rho$ — [Carroll eq. 4.35](https://arxiv.org/abs/gr-qc/9712019).
- Equation of motion: $\ddot{\vec x}=-\nabla\Phi$.
- Weak-field metric (SI): $g_{00}\approx-(1+2\Phi/c^2)$, and for the full isotropic form $g_{ij}\approx(1-2\Phi/c^2)\delta_{ij}$.
- Carroll's $c=1$ version: $h_{00}=-2\Phi$, $g_{00}=-(1+2\Phi)$, $\Phi=-GM/r$ (eqs. 4.20–4.22) — [Carroll](https://arxiv.org/abs/gr-qc/9712019).

**B. Assumptions.** "We define the 'Newtonian limit' by three requirements: the particles are moving slowly (with respect to the speed of light), the gravitational field is weak (can be considered a perturbation of flat space), and the field is also static (unchanging with time)" — [Carroll §4.1](https://arxiv.org/abs/gr-qc/9712019). In numbers: $v/c\ll1$, $|\Phi|/c^2\ll1$, $\partial_0g_{\mu\nu}=0$, and in addition $p\ll\rho c^2$.

**C. Symbols.**
- $\Phi$: Newtonian potential (m² s⁻²).
- $\rho$: mass density (kg m⁻³).
- $h_{\mu\nu}$: metric perturbation (unitless, $|h|\ll1$).
- $\nabla^2=\delta^{ij}\partial_i\partial_j$ (m⁻²).
- $4\pi$: solid angle of a sphere (sr).
- $G$: Newton's constant.

**D. Operations.** Linearisation (dropping $h^2$, $\Gamma^2$), dropping time derivatives, and a Taylor expansion of $g^{\mu\nu}$.

**E/F. The derivation of $\kappa=8\pi G/c^4$, every step (SI, $x^0=ct$).**
1. **Where Newton's $4\pi$ comes from (Gauss's law).**
   - A point mass $M$ produces a field of strength $GM/r^2$ over a sphere of area $4\pi r^2$.
   - The flux is $\oint\vec g\cdot d\vec A=-(GM/r^2)(4\pi r^2)=-4\pi GM$, independent of $r$.
   - By the divergence theorem, $\nabla\cdot\vec g=-4\pi G\rho$. With $\vec g=-\nabla\Phi$, this becomes $\nabla^2\Phi=4\pi G\rho$.
   - So the 4π is the area of the unit sphere. (This is a standard derivation. Carroll states Poisson's equation, eq. 4.35, and notes that $\Phi=-GM/r$ "is one solution … for the case of a pointlike mass distribution" — [Carroll](https://arxiv.org/abs/gr-qc/9712019).)
2. **Write the field equation with an unknown constant**, in trace-reversed form: $R_{\mu\nu}=\kappa(T_{\mu\nu}-\tfrac12Tg_{\mu\nu})$ (Carroll 4.45).
3. **Source side.**
   - Dust at rest: $T_{00}=\rho c^2$ and all other components are negligible.
   - Trace: $T=g^{00}T_{00}=-\rho c^2$ (Carroll 4.47, $c=1$).
   - So $T_{00}-\tfrac12Tg_{00}=\rho c^2-\tfrac12(-\rho c^2)(-1)=\rho c^2-\tfrac12\rho c^2=\tfrac12\rho c^2$.
   - This $\tfrac12$ is the trace-reversal factor. It gives $R_{00}=\tfrac12\kappa\rho c^2$ (Carroll 4.48: "$R_{00}=\tfrac12\kappa T_{00}$").
4. **Geometry side.**
   - $R_{00}=R^i{}_{0i0}$. In general, $R^i{}_{0j0}=\partial_j\Gamma^i_{00}-\partial_0\Gamma^i_{j0}+\Gamma^i_{j\lambda}\Gamma^\lambda_{00}-\Gamma^i_{0\lambda}\Gamma^\lambda_{j0}$ (Carroll 4.49).
   - The time derivative vanishes because the field is static. The $\Gamma^2$ terms are second order and are dropped.
   - So $R_{00}\approx\partial_i\Gamma^i_{00}=\partial_i(\partial_i\Phi/c^2)=\nabla^2\Phi/c^2$ (Carroll 4.50: $R_{00}=-\tfrac12\nabla^2h_{00}$).
   - SymPy (computed): $R_{00}=\nabla^2\Phi/c^2$ to first order.
5. **Equate the two sides.** $\nabla^2\Phi/c^2=\tfrac12\kappa\rho c^2$, so $\nabla^2\Phi=\tfrac12\kappa c^4\rho$.
6. **Match to Poisson.** Requiring $\tfrac12\kappa c^4=4\pi G$ gives $\kappa=8\pi G/c^4$. Carroll (c = 1): "this is exactly (4.36), if we set $\kappa=8\pi G$" — [Carroll](https://arxiv.org/abs/gr-qc/9712019).
   - So $8\pi=2\times4\pi$: the $4\pi$ from Gauss and the 2 from undoing the trace reversal's $\tfrac12$.
7. **Same result without trace reversal (computed, SymPy).**
   - With the full isotropic weak-field metric, $G_{00}=2\nabla^2\Phi/c^2$.
   - Setting $G_{00}=\kappa T_{00}=\kappa\rho c^2$ gives $\nabla^2\Phi=\tfrac12\kappa c^4\rho=4\pi G\rho$, the same $\kappa$.
   - In the $G_{\mu\nu}$ form the factor 2 appears on the curvature side, because $G_{00}$ also feels the spatial curvature $(1-2\Phi/c^2)\delta_{ij}$.
8. **Cross-check with Baez–Bunn.**
   - Their coefficient $\tfrac12$ (in units with $c=1$) equals $4\pi G$ when $8\pi G=1$. In SI their statement reads $\ddot V/V=-4\pi G(\rho+3p/c^2)$ (inference; see Inferences).
   - For a ball of dust this reduces to $\nabla\cdot\vec g=-4\pi G\rho$.
   - Carroll's FLRW equation $-3\ddot a/a=4\pi G(\rho+3p)$ (eq. 8.33) agrees: with $V\propto a^3$ and the ball initially at rest ($\dot a=0$), $\ddot V/V=3\ddot a/a=-4\pi G(\rho+3p)$.

**Magnitudes of $|\Phi|/c^2=GM/(rc^2)$ (computed with IAU B3 and CODATA):**
| Place | $GM/(rc^2)$ |
|---|---|
| GPS orbit ($a=26{,}561.75$ km) | $1.67\times10^{-10}$ |
| Earth's surface ($R_E=6.3781\times10^6$ m) | $6.954\times10^{-10}$ (Ashby's geoid value including rotation: $6.969\times10^{-10}$) |
| Sun's surface ($R_\odot=6.957\times10^8$ m) | $2.12\times10^{-6}$ |
| Neutron star, $1.4M_\odot$, $R=12$ km / 10 km | 0.172 / 0.207 |
| Neutron star, $2.0M_\odot$, 12 km | 0.246 |

- Lecture slides found in search give "typical" neutron-star compactness $GM/(Rc^2)\approx0.17$ for $1.4M_\odot$ and 12 km, against about $10^{-4}$ for white dwarfs. A GR (Buchdahl) bound $R>\tfrac94GM/c^2$ means $GM/(Rc^2)<4/9$, and causality tightens it to about $R\gtrsim2.94GM/c^2$ — search excerpts; [Lattimer & Prakash, astro-ph/0411280](https://arxiv.org/abs/astro-ph/0411280) for the 2.94 bound.

**G. Connections.**
- APPROXIMATE (conditions: $|\Phi|/c^2\ll1$, $v\ll c$, $\partial_t\approx0$, $p\ll\rho c^2$): the EFE 00-component reduces to Poisson, and the geodesic equation to Newton's second law.
- EXACT within linearised theory: $g_{00}=-(1+2\Phi/c^2)$ also gives gravitational time dilation, $d\tau/dt\approx1+\Phi/c^2$ (Eq. 5).
- Where it fails:
  - near neutron stars ($\Phi/c^2\sim0.2$);
  - for light. Light probes $g_{ij}$ too; that is the factor-of-2 light bending; see Inferences.
  - for time-dependent fields (gravitational waves, Carroll §6).
- ANALOGY: electrostatics ($\nabla^2V=-\rho_q/\varepsilon_0$, with $4\pi$ from Gauss's law likewise).

### Inferences
- **Sign of the Λ term across conventions (derived here, not taken from a fetched source).**
  - Lowering both indices of $T$ and flipping $g\to-g$ leaves $G_{\mu\nu}$ and $T_{\mu\nu}$ unchanged, but flips $\Lambda g_{\mu\nu}$.
  - The convention-independent statement is therefore $G_{\mu\nu}+[S1][S3]\Lambda g_{\mu\nu}=[S3]\kappa T_{\mu\nu}$. With it, $\Lambda>0$ always means positive vacuum energy density, negative pressure, and accelerated expansion.
  - In $(+,-,-,-)$ texts with [S3]=+ (for example Peebles), the equation appears as $G_{\mu\nu}=\kappa T_{\mu\nu}+\Lambda g_{\mu\nu}$.
  - The writer should present this as a derived consistency rule.
- **Practical recognition checklist for beginners (synthesised from the table and Carroll):**
  1. Look at flat space: $-c^2dt^2+\dots$ means $(-,+,+,+)$; $+c^2dt^2-\dots$ means $(+,-,-,-)$.
  2. Check whether $R=+2/a^2$ for a sphere. It is in MTW, Carroll and Wald, but negative under Weinberg's sign.
  3. Check the sign in front of $8\pi G$.
  4. Check whether $c$ and $G$ are visible ($8\pi$ alone means $G=c=1$; $8\pi G$ means $c=1$).
  5. Check for $(\rho+p)$ versus $(\rho+p/c^2)$, which tells whether $\rho$ is energy density or mass density.
  6. Check which slot of Riemann is contracted to get Ricci.
- **Spacetime near Earth is much less curved than Earth's surface is as a sphere.** The 2-sphere curvature of a sphere of Earth's radius is $4.9\times10^{-14}\ \text{m}^{-2}$, against $\sim10^{-23}\ \text{m}^{-2}$ for spacetime curvature at the surface: a factor of about $3\times10^9$ (computed). This is a vivid "spacetime is stiff" illustration.
- **Baez–Bunn in SI.** Their $-\tfrac12(\rho+P_x+P_y+P_z)$ with $c=1$ implies the convention $8\pi G=1$, since $4\pi G=\tfrac12$. In SI, with $\rho$ as mass density, it reads $\ddot V/V|_{t=0}=-4\pi G\left(\rho+(P_x+P_y+P_z)/c^2\right)$. This matches Carroll eq. 8.33 (shown in Eq. 17 step 8).
- **Light bending.** Light bending tests $g_{ij}=(1-2\Phi/c^2)\delta_{ij}$, which the "$h_{00}$-only" Newtonian limit omits. The resulting deflection at the solar limb is $4GM_\odot/(c^2R_\odot)=8.49\times10^{-6}$ rad $=1.75''$ (computed). That is twice the "Newtonian" value. Useful as a "where the Newtonian limit stops" example, but no source was fetched for the measured value.
- **Weyl count.** 20 − 10 = 10 Weyl components in 4D, from component counting. The interpretations "Ricci = volume change, Weyl = shape/tidal change" are standard, but Baez & Bunn's page itself does not use the words Ricci or Weyl.
- **Ashby's figures.** Ashby's 2003 numbers ($a_0$, $GM_E$, $\Phi_0/c^2$) reproduce the quoted "+38.6 μs/day" and the famous 10.22999999543 MHz factory offset to all quoted digits. So "+45.8 / −7.2 / +38.6 μs/day" are the right numbers to print. "45.7" (sometimes quoted) is slightly low with these inputs.

### Gaps
- **Wald, Schutz, Hartle, Landau–Lifshitz signs.** The Riemann sign [S2] and Einstein sign [S3] for these four were **not verified** against a fetched source this session. The table rows marked "not verified" reflect background knowledge (all (+++) apart from the LL signature (−++)). The MTW front-endpaper table (MTW 1973), or each book's own conventions page, should be checked before publication. Weinberg (+−−), Peebles (−++) and Rindler/Peacock (−+−) are verified (via Wikipedia's report of MTW's classification).
- **Ashby's equations as images.** Ashby (2003) equations are embedded as images in the PMC version. The literal strings "38.6 μs", "45.7 μs", "−4.4647×10⁻¹⁰" and "10.22999999543 MHz" could not be read from Ashby's text. They were reproduced by computation from his stated parameters, and the MHz value is confirmed via Wikipedia (citing Nelson 1999).
- **Neutron-star numbers.** The saturation density $2.8\times10^{14}$ g cm⁻³ and "central density may exceed a few times $10^{15}$ g cm⁻³" come from search excerpts whose attribution between Ekşi (2016) and Lattimer & Prakash could not be confirmed. No sourced central pressure was found. The often-quoted $p_c/\rho_cc^2\sim0.1$–$0.3$ is **unsourced** and should not be printed without a citation.
- **Water and air values.** Water $\rho=1000$ kg m⁻³, ISA sea-level air $\rho=1.225$ kg m⁻³ and 1 atm = 101,325 Pa are standard reference values, not fetched this session.
- **Experiments not fetched.** The Bailey et al. (1977) CERN muon storage-ring time-dilation experiment was not fetched. The muon example here is a computed illustration using the PDG lifetime.
- **Sources not consulted.** MIT OCW 8.962, David Tong's GR notes, and the printed MTW/Schutz/Hartle/Wald texts were not consulted directly. Carroll's lecture notes (arXiv gr-qc/9712019) were read in full text.
- **Term counts with the inverse metric written out.** Not computed. The counts given treat $g^{\mu\nu}$ and $\partial g^{\mu\nu}$ as independent symbols.

---

## Key Question 2: What are the correct numerical values (CODATA 2018/2022, IAU nominal, Planck 2018), verified in Python?

### Takeaway
With CODATA 2022 $G=6.67430(15)\times10^{-11}\ \text{m}^3\text{kg}^{-1}\text{s}^{-2}$ and exact $c$, Einstein's constant is $\kappa=8\pi G/c^4=2.0766\times10^{-43}\ \text{N}^{-1}$. Planck 2018 ($H_0=67.4$ km/s/Mpc, $\Omega_\Lambda=0.6847$) gives $\Lambda=1.09\times10^{-52}\ \text{m}^{-2}$, a vacuum energy density of $5.25\times10^{-10}\ \text{J m}^{-3}$ (equivalently $5.8\times10^{-27}\ \text{kg m}^{-3}$). The GPS relativistic offset is $+4.4647\times10^{-10}$, or $+38.6$ μs/day. All of these were recomputed in Python this session.

### Cited Findings
**Primary constants**
- $G=6.67430\times10^{-11}\ \text{m}^3\text{kg}^{-1}\text{s}^{-2}$, standard uncertainty $0.00015\times10^{-11}$, relative $2.2\times10^{-5}$, from the **2022** CODATA adjustment (the same value as CODATA 2018) — [NIST CODATA](https://physics.nist.gov/cgi-bin/cuu/Value?bg).
- $c=299\,792\,458$ m/s, exact by definition of the metre — [NIST](https://physics.nist.gov/cgi-bin/cuu/Value?c).
- IAU 2015 Resolution B3 nominal values (verbatim from the resolution text) — [Mamajek et al., arXiv:1510.07674](https://arxiv.org/abs/1510.07674):
  - $1\,(GM)^N_\odot=1.327\,124\,4\times10^{20}\ \text{m}^3\text{s}^{-2}$
  - $1\,R^N_\odot=6.957\times10^8$ m
  - $1\,R^N_{eE}=6.3781\times10^6$ m
  - $1\,(GM)^N_E=3.986\,004\times10^{14}\ \text{m}^3\text{s}^{-2}$
  - $1\,R^N_{eJ}=7.1492\times10^7$ m
  - $1\,(GM)^N_J=1.266\,865\,3\times10^{17}\ \text{m}^3\text{s}^{-2}$
  - These are "conversion factors only".
- Ashby (GPS): $GM_E=3.986004418\times10^{14}\ \text{m}^3\text{s}^{-2}$, $a_0=2.656175\times10^7$ m, $\Phi_0/c^2=-6.969290134\times10^{-10}$ — [Ashby 2003, Living Rev. Relativ. 6:1](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/).
- Planck 2018 abstract: "Hubble constant $H_0=(67.4\pm0.5)$ km/s/Mpc; matter density parameter $\Omega_m=0.315\pm0.007$" — [Planck 2018 VI, arXiv:1807.06209](https://arxiv.org/abs/1807.06209). The Planck 2018 table reproduced on Wikipedia gives $\Omega_\Lambda=0.6847\pm0.0073$, $H_0=67.4\pm0.5$, age $13.787\pm0.020$ Gyr, $\rho_{crit}=1.87847(23)\times10^{-26}h^2\ \text{kg m}^{-3}$ — [Wikipedia Λ-CDM (cross-check)](https://en.wikipedia.org/wiki/Lambda-CDM_model).
- Sun's centre: $\rho_c=1.622\times10^5\ \text{kg m}^{-3}$, $P_c=2.477\times10^{11}$ bar $=2.477\times10^{16}$ Pa, $T_c=1.571\times10^7$ K. Also mass $1{,}988{,}400\times10^{24}$ kg, $GM=132{,}712\times10^6\ \text{km}^3\text{s}^{-2}$ — [NASA Sun Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html).
- Muon mean life $2.1969811\pm0.0000022\ \mu$s (PDG average) — [PDG Live](https://pdglive.lbl.gov/view/S004T).
- Chou et al. 2010: a 33 cm height change gave a shift of "about $4\times10^{-17}$" — [Physics Today](https://physicstoday.aip.org/news/relativistic-effects-seen-at-everyday-distances-and-speeds).
- Wikipedia's κ value "≈ 2.07665 × 10⁻⁴³ N⁻¹" — [Wikipedia EFE](https://en.wikipedia.org/wiki/Einstein_field_equations).

**Derived values (all computed in Python this session from the constants above)**
| Quantity | Value |
|---|---|
| $\kappa=8\pi G/c^4$ | $2.07665\times10^{-43}\ \text{N}^{-1}$ (= s² m⁻¹ kg⁻¹); $1/\kappa=4.815\times10^{42}$ N |
| $8\pi G/c^2$ (for mass densities) | $1.8664\times10^{-26}\ \text{m kg}^{-1}$ |
| $G/c^2$ | $7.4262\times10^{-28}\ \text{m kg}^{-1}$ |
| $GM_\odot/c^2$; $r_{s,\odot}$ | 1476.6 m; 2953.25 m |
| $GM_E/c^2$; $r_{s,E}$ | 4.435 mm; 8.870 mm |
| $M_\odot=(GM)_\odot/G$ | $1.98841\times10^{30}$ kg (NASA: $1.9884\times10^{30}$) |
| $H_0=67.4$ km/s/Mpc in SI | $2.1843\times10^{-18}\ \text{s}^{-1}$ (1 Mpc $=3.0857\times10^{22}$ m) |
| $\rho_{crit}=3H_0^2/8\pi G$ | $8.53\times10^{-27}\ \text{kg m}^{-3}$ |
| $\Lambda=3\Omega_\Lambda H_0^2/c^2$ ($H_0=67.4$, $\Omega_\Lambda=0.6847$) | $1.090\times10^{-52}\ \text{m}^{-2}$ ($1/\sqrt\Lambda=9.6\times10^{25}$ m ≈ 10.1 Gly) |
| Same with $H_0=67.36$ (TT,TE,EE+lowE+lensing, as commonly quoted) | $1.089\times10^{-52}\ \text{m}^{-2}$ |
| Same with $H_0=67.66$, $\Omega_\Lambda=0.6889$ (+BAO, as commonly quoted) | $1.106\times10^{-52}\ \text{m}^{-2}$ |
| Vacuum mass density $\rho_\Lambda=\Lambda c^2/8\pi G$ | $5.84\times10^{-27}\ \text{kg m}^{-3}$ (≈3.5 proton masses per m³) |
| Vacuum energy density $u_\Lambda=\Lambda c^4/8\pi G$ | $5.25\times10^{-10}\ \text{J m}^{-3}$ (≈3.3 GeV m⁻³); $p_\Lambda=-5.25\times10^{-10}$ Pa |
| GPS: gravitational / velocity / net | $+5.2996\times10^{-10}$ / $-8.3485\times10^{-11}$ / $+4.46473\times10^{-10}$, i.e. +45.79 / −7.21 / +38.58 μs/day |
| GPS factory frequency | $10.23\ \text{MHz}\times(1-4.4647\times10^{-10})=10.22999999543$ MHz |
| Earth surface clock versus infinity | −60.08 μs/day |
| Mountain, 3000 m (versus sea level) | $3.27\times10^{-13}$, i.e. +28.3 ns/day, +10.3 μs/yr |
| Muon at $0.998c$ | $\gamma=15.819$; lab lifetime 34.75 μs; mean decay length 10.40 km (versus 657 m) |
| $\Phi/c^2$: Earth / Sun / NS (1.4 $M_\odot$, 12 km) | $6.954\times10^{-10}$ / $2.12\times10^{-6}$ / 0.172 |
| $GM/(c^2r^3)$ at Earth's surface | $1.71\times10^{-23}\ \text{m}^{-2}$ (radial tidal component $3.42\times10^{-23}$) |
| $\Gamma^r_{tt}$ at Earth's surface (Schwarzschild, $x^0=t$) | $9.7984\ \text{m s}^{-2}$ ($=GM/R^2$ to $10^{-9}$) |
| Earth-sized 2-sphere, $R=2/a^2$ | $4.92\times10^{-14}\ \text{m}^{-2}$ |

### Inferences
- **Use these values in the document.** $G=6.67430\times10^{-11}$ (CODATA 2018 and 2022 agree) and $\kappa\approx2.08\times10^{-43}\ \text{N}^{-1}$. For Λ, quote "$\approx1.1\times10^{-52}\ \text{m}^{-2}$" with a footnote that the second digit depends on the Planck data combination ($1.089$–$1.106\times10^{-52}$). The brief's "~1.1 × 10⁻⁵² m⁻²" is correct to two figures.
- **Vacuum energy density.** "About 5 × 10⁻¹⁰ J m⁻³, i.e. the rest energy of a few hydrogen atoms per cubic metre" is accurate (3.5 proton masses per m³).
- **Two definitions of the Sun's mass parameter.** The IAU nominal $(GM)^N_\odot$ is a conversion constant, not a measured value. For worked examples the difference from the TDB-compatible measured value is far below the precision shown.
- **Uncertainty is set by $G$.** $G$'s relative uncertainty ($2.2\times10^{-5}$) limits κ and anything expressed in kilograms. Quantities expressed through $GM$ (orbits, $r_s$, $\Phi/c^2$) are known far more precisely. That is why the IAU fixes $GM$, not $M$.

### Gaps
- **Planck table numbers.** $H_0=67.36\pm0.54$, $\Omega_\Lambda=0.6847\pm0.0073$ (TT,TE,EE+lowE+lensing) and $67.66\pm0.42$, $0.6889\pm0.0056$ (+BAO) are the commonly quoted Planck 2018 Table 2 values. Only $67.4\pm0.5$ (abstract) and $\Omega_\Lambda=0.6847\pm0.0073$ (via Wikipedia's reproduction) were seen in fetched text. The Planck PDF table itself was not read.
- **Λ from Planck.** No fetched source states Λ in m⁻² directly. The values above are computed from $\Lambda=3\Omega_\Lambda H_0^2/c^2$, which assumes flat ΛCDM.
- **Neutron-star central pressure.** No sourced value was obtained (see Key Question 1 Gaps).
- **Air and water.** Standard values (ISA sea-level density and pressure, water density) were not re-fetched.
