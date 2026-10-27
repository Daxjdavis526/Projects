# The Mathematics of Spacetime — Advanced Mathematics B (PDEs), D (Complex Analysis), E (Fourier & Methods), F (Numerical Methods) and G-modules (proof, real analysis, functional analysis, probability/statistics, variational principles, constrained dynamics): design-ready content map

Learner: in Calculus II and Physics I now, has done intro Python, learns best visually, and is aiming at graduate GR. Every answer key below was recomputed this session (sympy/mpmath/scipy/numpy). **Source tags:**
**[C]** = computed and verified this session; the scripts are in `/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/` and the key outputs are copied here.
**[S]** = found by live web search this session. I saw the result summary but did not open the page.
**[P]** = taken from this repo's earlier research notes, whose authors checked the source in an earlier session. The note's path is given.
**[R]** = this repository's own code or docs.
**[B]** = a bibliographic reference from domain knowledge that I could not fetch this session. I believe the identifiers are correct, but they should be spot-checked before publishing.
**Access note:** all direct page fetches were blocked. WebFetch failed DNS resolution, and the agent proxy returned 403 for every host, including arxiv.org, wikipedia.org, springer.com, docs.python.org and google.com. The shared web-search budget ran out after 3 successful searches. That is why most citations here are [C], [P], [R] or [B]. Benchmark numbers never rest on [B] alone: each has a [C] recomputation plus an [S], [P] or [R] source wherever one existed.

## KQ1. B — Partial Differential Equations: order, module tree, archetypes, and Einstein's equations as a PDE system

### Takeaway
Use the order of Strauss and Evans: transport and characteristics first, then the three archetypal linear PDEs (wave, heat, Laplace/Poisson), then boundary-value problems, separation of variables, Fourier methods and Green's functions, then classification, nonlinearity (Burgers/shocks), well-posedness and finite differences. End with a capstone that recasts Einstein's equations as 4 constraint + 6 evolution PDEs. They become a well-posed system of quasilinear wave equations only after a gauge choice such as harmonic coordinates (Choquet-Bruhat 1952), and the constraints are then preserved by the evolution. Every capstone idea has a toy model that I verified numerically: weak hyperbolicity (growth ∝ k·t), constraint damping (‖C‖ ∝ e^(−γt)), and constraint violations converging to zero at the scheme's order.

### Cited Findings

**Orderings in standard sources**
- Strauss, *Partial Differential Equations: An Introduction* (2nd ed., Wiley 2008), chapter order:
  1. Where PDEs come from: first-order linear equations and characteristics, derivations, initial and boundary conditions, well-posedness, types of second-order equations.
  2. Waves and diffusions.
  3. Reflections and sources.
  4. Boundary problems.
  5. Fourier series.
  6. Harmonic functions.
  7. Green's identities and Green's functions.
  8. Computation of solutions (finite differences for diffusion, waves and Laplace; finite elements).
  9. Waves in space.
  10. Boundaries in the plane and in space.
  11. General eigenvalue problems.
  12. Distributions and transforms.
  13. PDE problems from physics.
  14. Nonlinear PDEs (shock waves, solitons, calculus of variations…).

  So Strauss introduces well-posedness and classification in chapter 1 and revisits them later. — [B: Strauss 2nd ed., ISBN 9780470054567](https://openlibrary.org/isbn/9780470054567)
- Haberman, *Applied PDEs with Fourier Series and Boundary Value Problems* (5th ed., Pearson 2013), chapter order:
  1. Heat equation.
  2. Separation of variables.
  3. Fourier series.
  4. Wave equation: strings and membranes.
  5. Sturm–Liouville.
  6. Finite-difference numerical methods.
  7. Higher-dimensional PDEs (Bessel, Legendre).
  8. Nonhomogeneous problems.
  9. Green's functions (time-independent).
  10. Fourier-transform solutions.
  11. Green's functions for wave and heat equations.
  12. Method of characteristics (linear and quasilinear, including shocks).
  13. Laplace-transform solutions.
  14. Dispersive waves.

  This is the "physics/engineering" order: separation of variables first, characteristics late. — [B: Haberman 5th ed., ISBN 9780321797056](https://openlibrary.org/isbn/9780321797056)
- Evans, *Partial Differential Equations* (2nd ed., AMS GSM 19, 2010). Ch. 2 "Four important linear PDE" treats the transport, Laplace, heat and wave equations, in that order. Ch. 3 covers nonlinear first-order PDE (characteristics, Hamilton–Jacobi, conservation laws with shocks, Rankine–Hugoniot, entropy conditions). Ch. 7 covers linear evolution equations, including hyperbolic systems. Ch. 12 covers nonlinear wave equations. — [B: Evans, AMS GSM 19](https://doi.org/10.1090/gsm/019)
- Boas, *Mathematical Methods in the Physical Sciences* (3rd ed., Wiley 2006), chapter order:
  1. Series.
  2. Complex numbers.
  3. Linear algebra.
  4. Partial differentiation.
  5. Multiple integrals.
  6. Vector analysis.
  7. Fourier series and transforms.
  8. ODEs.
  9. Calculus of variations.
  10. Tensors.
  11. Special functions.
  12. Series solutions (Legendre, Bessel, Hermite, Laguerre).
  13. PDEs.
  14. Complex variables.
  15. Probability and statistics.

  Boas puts PDEs after Fourier series, ODEs and special functions, and puts complex variables after PDEs. — [B: Boas 3rd ed., ISBN 9780471198260](https://openlibrary.org/isbn/9780471198260)
- An earlier session's GR-prerequisite ladder runs: Calc II → multivariable calculus and linear algebra → ODEs → Lagrangian mechanics/calculus of variations → PDEs (Poisson, wave, diffusion; "Einstein's equations are nonlinear PDEs, and gravitational waves obey a wave equation"). It lists complex analysis, functional analysis and numerical methods as "optional and advanced". — [P: gr_principles_and_math.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/gr_principles_and_math.md)
- MIT 8.962 (graduate GR) lists differential equations, linear algebra and E&M II as prerequisites. — [P: MIT 8.962 syllabus](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus)
- Cambridge Part III GR lists linear algebra and the Euler–Lagrange equations as prerequisites. — [P: Cambridge Part III GR guide](https://www.maths.cam.ac.uk/postgrad/part-iii/files/misc/2020-21%20Guide/Relativity%20and%20Gravitation/General%20Relativity.pdf)

**Verified answer keys (B)** — symbolic checks in [C: verify_extra.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_extra.py), [C: verify_pde.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_pde.py) and [C: verify_final.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_final.py)
- **B1 (what a PDE is)**
  - u = e^(−(x−2t)²) satisfies u_t + 2u_x = 0 (residual 0).
  - For T = e^(−t) sin x at (π/2, 0): T_t = −1 and T_x = 0. Interpretation: the temperature is falling at a point where the profile is flat.
  - Classification: u_t + u u_x = 0 is first-order quasilinear; u_tt = c²u_xx is second-order, linear and homogeneous; ∇²Φ = 4πGρ is linear and inhomogeneous. [C]
- **B2 (derivations)**
  - Conservation ρ_t + q_x = 0 plus Fick's law q = −Dρ_x gives ρ_t = Dρ_xx.
  - The uniform-sphere interior potential Φ = (2πGρ/3)(r² − 3R²) satisfies (1/r²)(r²Φ′)′ = 4πGρ and matches −GM/R at r = R (residuals 0). [C]
  - Carroll recovers Poisson's equation ∇²Φ = 4πGρ from the 00 component of Einstein's equation, which fixes κ = 8πG. — [P: Carroll notes §4.1, §4.4](https://arxiv.org/abs/gr-qc/9712019) via [gr_principles_and_math.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/gr_principles_and_math.md)
- **B3 (characteristics)** [C]
  - u_t + x u_x = 0 ⇒ u = f(x e^(−t)).
  - u_x + y u_y = 0 ⇒ u = f(y e^(−x)).
  - u_t + c u_x = −λu ⇒ u = e^(−λt) f(x − ct).
  - u_t + 2u_x = 0 with u(x,0) = e^(−x²) ⇒ u = e^(−(x−2t)²); the pulse is centred at x = 4 at t = 2.
- **B4 (wave)** [C]
  - d'Alembert: u = [f(x−ct) + f(x+ct)]/2 solves u_tt = c²u_xx.
  - String modes have f_n = nc/(2L). With c = 286 m/s and L = 0.65 m, f₁ = 220.0 Hz.
  - The standing-wave energy ½∫(u_t² + c²u_x²)dx for sin(nπx/L)cos(nπct/L) is π²c²n²/(4L), independent of t.
- **B5 (heat)** [C]
  - u_t = u_xx on [0, π], Dirichlet, u₀ = sin x + 3 sin 2x ⇒ u = e^(−t) sin x + 3e^(−4t) sin 2x, so u(π/2, 1) = e^(−1) ≈ 0.367879.
  - The heat kernel e^(−x²/4Dt)/√(4πDt) solves u_t = Du_xx and integrates to 1.
  - A Gaussian keeps its shape with σ² = σ₀² + 2Dt (residual 0).
- **B6 (Laplace/Poisson)** [C]
  - Unit square with u = 1 on the top edge and 0 elsewhere: the centre value is exactly 1/4. Symmetry gives this, and the series sums to 0.25.
  - With top boundary sin(πx): u(½, ½) = sinh(π/2)/sinh(π) ≈ 0.199268.
  - Disk with u(1, θ) = cos²θ: u = ½ + (r²/2)cos 2θ, and the centre value ½ equals the boundary mean (mean-value property).
  - −1/(4πr) is harmonic for r > 0 in 3D; ln r is harmonic in 2D.
- **B7 (BVPs)**
  - −u″ = 1, u(0) = u(1) = 0 ⇒ u = x(1−x)/2, maximum 1/8. The Green's function is G = x(1−s) for x < s and s(1−x) for x > s. [C]
  - The Neumann problem −u″ = f with u′(0) = u′(1) = 0 is solvable only if ∫₀¹f = 0, so f = 1 has no solution. (By hand: integrate both sides.)
  - The Robin problem y″ + λy = 0, y(0) = 0, y′(1) + y(1) = 0 ⇒ tan√λ = −√λ, giving √λ₁ = 2.028758 and λ₁ = 4.115858. [C: verify_complex_fourier.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_complex_fourier.py)
- **B8 (separation; membrane)** — the drum-mode frequency ratio f_mn/f_01 equals j_mn/j_01. [C: verify_complex_fourier.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_complex_fourier.py); zero tables in [B: NIST DLMF §10.21](https://dlmf.nist.gov/10.21)
  - The ratios are (1,1) 1.5933, (2,1) 2.1355, (0,2) 2.2954, (3,1) 2.6531, (1,2) 2.9173 and (2,2) 3.5001.
  - The underlying zeros are j₀₁ = 2.40483, j₁₁ = 3.83171, j₂₁ = 5.13562 and j₀₂ = 5.52008.
  - The overtones are inharmonic, which is why a drum sounds unlike a string.
- **B9 (Fourier methods)**
  - With F(k) = ∫f e^(−ikx)dx, the transform of e^(−x²/2) is √(2π)e^(−k²/2); numerically checked at k = 1.3. [C]
  - Dispersion relations: the wave equation gives ω = ±ck; the heat equation gives ω = −iDk², i.e. decay rate Dk². (By hand.)
- **B10 (Green's functions)**
  - Retarded Green's function of ẍ + ω₀²x = δ(t), by residues: G = θ(t) sin(ω₀t)/ω₀, with G(0) = 0 and G′(0⁺) = 1. [C]
  - The free-space 3D Poisson Green's function is −1/(4π|x − x′|); its harmonicity away from the source was checked [C].
  - Expanding the B7 problem in eigenfunctions gives u(½) = Σ_(n odd) 4(−1)^((n−1)/2)/(n³π³) = 0.125000 [C].
- **B11 (classification, B² − 4AC)** [C]
  - u_xx + 4u_xy + 3u_yy: 4, hyperbolic.
  - u_xx + 2u_xy + u_yy: 0, parabolic.
  - u_xx + u_xy + u_yy: −3, elliptic.
  - Tricomi equation y u_xx + u_yy: −4y, so elliptic for y > 0 and hyperbolic for y < 0.
- **B12 (Burgers u_t + uu_x = 0)** — breaking time t* = −1/min u₀′. [C: verify_pde.py §1–2](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_pde.py)
  - u₀ = e^(−x²) ⇒ t* = √(e/2) ≈ 1.165822, at ξ* = 1/√2, and the break occurs at x_b = √2 ≈ 1.414214.
  - u₀ = sin x ⇒ t* = 1, at x = π.
  - u₀ = −tanh x ⇒ t* = 1, at x = 0.
  - Riemann problem (u_L, u_R) = (1, 0): the shock moves at speed (u_L + u_R)/2 = ½ and sits at x = 1 at t = 2.
  - Riemann problem (0, 1): the rarefaction fan u = x/t solves Burgers exactly (residual 0).
- **B13 (well-posedness)** [C]
  - Backward heat equation: mode sin(nx) is amplified by e^(n²t). For n = 10 and t = 0.1 the factor is 2.2×10⁴.
  - Hadamard's example: u_xx + u_yy = 0 with u(x,0) = 0 and u_y(x,0) = sin(nx)/n² ⇒ u = sin(nx)sinh(ny)/n³. The data has size 1/n² = 2.5×10⁻³ at n = 20, yet the amplitude at y = 1 is 3.0×10⁴.
  - For u_t = A u_x with Fourier mode e^(ikx): A = [[1,1],[0,1]] (Jordan block, weakly hyperbolic) gives ‖e^(ikAt)‖ at t = 1 of 1.62, 10.1, 100.0 and 1000.0 for k = 1, 10, 100 and 1000. Diagonalizable A = diag(1, −1) gives exactly 1.
  - The elliptic pair u_t = v_x, v_t = −u_x grows like e^(kt): 4.9×10⁸ at k = 20.
- **B14 (discretization)** [C]
  - 1D upwind and leapfrog schemes need ν = cΔt/Δx ≤ 1. With Δx = 0.01 and c = 1, Δt ≤ 0.01.
  - Leapfrog for the wave equation at ν = 1.05 (N = 200, Gaussian start) reaches max|u| = 1.65×10⁶ after 83 steps. At ν = 0.9 and 1.0 it stays at 1.0 after 2000 steps.
  - FTCS heat needs r = DΔt/Δx² ≤ ½, so Δt ≤ 5×10⁻⁵ at Δx = 0.01. At r = 0.51 the amplification is |G| = 1.04. Roundoff seeds the grid-scale mode, and a sawtooth pattern exceeds 10 after 1042 steps (prediction ≈ 1000); at r = 0.49 the run is stable.
  - FTCS for advection is unstable for every ν > 0: max|G| = √(1+ν²), e.g. 1.118 at ν = 0.5.
  - Upwind and Lax–Wendroff have max|G| = 1 for ν ≤ 1, and 1.02 and 1.04 at ν = 1.01.
  - With equal spacing, the leapfrog limit is ν ≤ 1/√2 ≈ 0.7071 in 2D and 1/√3 ≈ 0.5774 in 3D.
- **Pitfalls demonstrated numerically** [C: verify_pde.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_pde.py)
  - (i) Burgers' equation discretized in non-conservative form, u_j − (Δt/Δx)u_j(u_j − u_(j−1)), leaves the (1, 0) shock stuck at x = 0 at t = 2. The conservative flux form puts it correctly at x = 1. Non-conservative schemes converge to wrong weak solutions. — [B: LeVeque, *Finite Volume Methods for Hyperbolic Problems*, CUP 2002](https://doi.org/10.1017/CBO9780511791253)
  - (ii) Relaxation for Laplace's equation on the B6 square, iterations until the max update falls below 10⁻⁶:

    | Interior grid | Jacobi | Gauss–Seidel | SOR (ω_opt) |
    |---|---|---|---|
    | 9×9 | 198 | 109 | 29 (ω = 1.528) |
    | 19×19 | 688 | 378 | 56 (ω = 1.730) |

    "Small update ≠ small error": Jacobi stopped with the centre at 0.24992 when the true discrete value is exactly 0.25. The error is 8×10⁻⁵ ≈ update/(1 − ρ), with ρ = cos(πh) = 0.98769.

**Einstein's equations as a PDE system**
- Carroll: Einstein's equations "may be thought of as second-order differential equations for the metric… ten independent equations… However, the Bianchi identity ∇^μG_μν = 0 represents four constraints… so there are only six truly independent equations". This matches the four coordinate freedoms. — [P: Carroll notes §4.4, eq. 4.52](https://arxiv.org/abs/gr-qc/9712019) via [gr_principles_and_math.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/gr_principles_and_math.md)
- In linearized gravity, gravitational waves obey □h̄_μν = −16πG T_μν (Carroll eq. 6.22), a wave equation. — [P: Carroll notes §6.1](https://arxiv.org/abs/gr-qc/9712019) via [gr_principles_and_math.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/gr_principles_and_math.md)
- Fourès-Bruhat (later Choquet-Bruhat) proved local existence and uniqueness for the Cauchy problem in 1952 (Acta Mathematica), using wave/harmonic (de Donder) coordinates. In those coordinates "Einstein's vacuum equations appear clearly as a hyperbolic system of nonlinear (quasilinear) partial differential equations". Sources differ on credit: one notes that local *uniqueness* had already been settled in the 1930s by Stellmacher. The result is local only. In 1969 Choquet-Bruhat and Geroch proved that every initial-data set has a unique maximal globally hyperbolic development. — [S: Bieri on Choquet-Bruhat (celebratio.org)](https://celebratio.org/ChoquetBruhat_Y/article/1104/); [S: C. R. Mécanique](https://comptes-rendus.academie-sciences.fr/mecanique/item/10.5802/crmeca.sp.1.pdf); [S: arXiv gr-qc/0111017](https://www.arxiv.org/pdf/gr-qc/0111017); [S: Lindblad–Rodnianski, Global stability of Minkowski space-time in harmonic gauge](https://arxiv.org/pdf/math/0411109) (search-summary attribution among these was not itemized)
- The primary papers: Y. Fourès-Bruhat, Acta Math. 88, 141–225 (1952) — [B: doi 10.1007/BF02392131](https://doi.org/10.1007/BF02392131); Choquet-Bruhat & Geroch, Commun. Math. Phys. 14, 329 (1969) — [B: doi 10.1007/BF01645389](https://doi.org/10.1007/BF01645389). Wald (1984) ch. 10 gives a textbook proof sketch via harmonic gauge. — [B: Wald, *General Relativity*, U. Chicago Press](https://openlibrary.org/isbn/9780226870335)
- Hyperbolicity and the formulations [S: search summary of](https://arxiv.org/pdf/gr-qc/0402123) "Strongly hyperbolic second order Einstein's evolution equations", [arXiv:1704.06811](https://arxiv.org/pdf/1704.06811) "Scalar Fields in Numerical General Relativity", [gr-qc/0403019](https://web3.arxiv.org/pdf/gr-qc/0403019), [gr-qc/0404070](https://arxiv.org/pdf/gr-qc/0404070), [gr-qc/0411094](https://web3.arxiv.org/pdf/gr-qc/0411094), [gr-qc/0403007](https://web3.arxiv.org/pdf/gr-qc/0403007) and [Shinkai slides](https://oit.ac.jp/labs/is/system/shinkai/Viewgraphs/0307sydney_slide.pdf). The summary reported:
  - The ADM formulation "has for many years been the main formulation used in 3-dimensional simulations, even though it is ill-posed (weakly hyperbolic)".
  - For the boundary-free initial-value problem, strong hyperbolicity (a complete set of characteristic variables with real speeds) is a necessary and sufficient condition for well-posedness.
  - Some members of the BSSN family are strongly hyperbolic, while many others are only weakly hyperbolic.
  - Adding multiples of the constraints, which vanish on solutions, can restore hyperbolicity.
  - If the evolution system is strongly hyperbolic, the constraint "subsidiary system" inherits strong hyperbolicity.
  - Well-posedness alone does not guarantee robustness, because lower-order source terms matter for stability.
- The 3+1 (ADM–York) equations, G = c = 1:
  - Metric: ds² = −α²dt² + γ_ij(dx^i + β^i dt)(dx^j + β^j dt), with lapse α and shift β^i.
  - Extrinsic curvature: K_ij = −(1/2α)(∂_t − £_β)γ_ij.
  - Hamiltonian constraint: R + K² − K_ijK^ij = 16πρ.
  - Momentum constraint: D_j(K^ij − γ^ij K) = 8πj^i.
  - Evolution: ∂_tγ_ij = −2αK_ij + D_iβ_j + D_jβ_i, plus an evolution equation for K_ij with source terms.
  - Lapse and shift are freely specifiable gauge functions.

  — [B: Gourgoulhon, *3+1 Formalism and Bases of Numerical Relativity*, arXiv:gr-qc/0703035](https://arxiv.org/abs/gr-qc/0703035); [B: Baumgarte & Shapiro, *Numerical Relativity* (CUP 2010)](https://doi.org/10.1017/CBO9781139193344); [B: Alcubierre, *Introduction to 3+1 Numerical Relativity* (OUP 2008)](https://doi.org/10.1093/acprof:oso/9780199205677.001.0001); [B: Arnowitt–Deser–Misner 1962, reprint arXiv:gr-qc/0405109](https://arxiv.org/abs/gr-qc/0405109)
- Harmonic gauge: □x^μ = 0 ⇔ g^(αβ)Γ^μ_αβ = 0. In this gauge R_μν = −½g^(αβ)∂_α∂_β g_μν + (terms with at most first derivatives), so each metric component obeys a quasilinear wave equation. If C^μ ≡ Γ^μ and ∂_tC^μ vanish on the initial slice (∂_tC^μ = 0 holds exactly when the Hamiltonian and momentum constraints hold), the contracted Bianchi identity makes C^μ obey a homogeneous wave equation. Then C^μ ≡ 0, and the reduced solution solves the full Einstein equations. — [B: Wald ch. 10](https://openlibrary.org/isbn/9780226870335); [B: Sarbach & Tiglio, Living Rev. Relativ. 15, 9 (2012)](https://doi.org/10.12942/lrr-2012-9); [B: Ringström, *The Cauchy Problem in General Relativity* (EMS 2009)](https://doi.org/10.4171/053)
- Constraint propagation for the standard 3+1 equations — [B: Frittelli, PRD 55, 5992 (1997)](https://doi.org/10.1103/PhysRevD.55.5992). Constraint damping in harmonic/Z4 formulations — [B: Gundlach et al., CQG 22, 3767 (2005), arXiv:gr-qc/0504114](https://arxiv.org/abs/gr-qc/0504114). Generalized harmonic gauge with source functions — [B: Friedrich, CMP 100, 525 (1985)](https://scholar.google.com/scholar?q=Friedrich+1985+%22On+the+hyperbolicity+of+Einstein%27s+and+other+gauge+field+equations%22); [B: Lindblom et al., CQG 23, S447 (2006), arXiv:gr-qc/0512093](https://arxiv.org/abs/gr-qc/0512093).
- Practical breakthroughs:
  - Pretorius's generalized-harmonic binary-black-hole evolution — [B: PRL 95, 121101 (2005), arXiv:gr-qc/0507014](https://arxiv.org/abs/gr-qc/0507014).
  - Moving-puncture BSSN — [B: Campanelli et al., arXiv:gr-qc/0511048](https://arxiv.org/abs/gr-qc/0511048); [B: Baker et al., arXiv:gr-qc/0511103](https://arxiv.org/abs/gr-qc/0511103).
  - BSSN itself — [B: Shibata & Nakamura, PRD 52, 5428 (1995)](https://doi.org/10.1103/PhysRevD.52.5428); [B: Baumgarte & Shapiro, PRD 59, 024007 (1998), arXiv:gr-qc/9810065](https://arxiv.org/abs/gr-qc/9810065).
- A pedagogical Maxwell analogue of ADM-versus-BSSN stability exists — [B: Knapp, Walker & Baumgarte, PRD 65, 064031 (2002), arXiv:gr-qc/0201051](https://arxiv.org/abs/gr-qc/0201051). A 2021 introductory text aimed at newcomers — [B: Baumgarte & Shapiro, *Numerical Relativity: Starting from Scratch* (CUP 2021)](https://scholar.google.com/scholar?q=Baumgarte+Shapiro+%22Numerical+Relativity%3A+Starting+from+Scratch%22).
- Professional NR codes solve "coupled non-linear partial differential equations of general relativity" on HPC (GRChombo, QMUL). — [P: QMUL NR projects](https://qmul.ac.uk/maths/postgraduate/postgraduate-research/phd-projects/current-phd-projects/numerical-relativity-for-fundamental-physics) via [studying_gr_and_resources.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/studying_gr_and_resources.md)
- **Verified capstone toys** — first-order wave system u_t = π, π_t = φ_x, φ_t = π_x − γ(φ − u_x), with constraint C = φ − u_x, so C_t = −γC exactly. [C: verify_pde.py §9](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_pde.py)
  - With 10%-inconsistent initial data, ‖C‖(2)/‖C‖(0) = 1.0000 at γ = 0, 0.1353 at γ = 1 and 0.0025 at γ = 3. These match e^(−2γ) exactly.
  - With consistent data and γ = 0, ‖C‖ = 1.86×10⁻³, 4.65×10⁻⁴ and 1.16×10⁻⁴ for N = 50, 100 and 200: second-order convergence of the constraint violation.
  - Maxwell analogue: ∇·(∇×B) ≡ 0 was checked symbolically, so ∂_t(∇·E − 4πρ) = −4π(∂_tρ + ∇·J) = 0.
  - Dirac counting gives 2 degrees of freedom per point for GR: (12 − 2·4)/2. [C: verify_numerics_G.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_numerics_G.py)

### Inferences

**Recommended order and module tree (B).** Each module lists its prerequisites; EXT = a node owned by another track.
- **B0 Partial derivatives just-in-time** (bridge, 1 lesson). Prerequisite EXT.calc2. Skip it if the core multivariable track has already covered partials.
- **B1 What PDEs represent** (1–2 lessons). Prerequisite B0 or EXT.calc3.partials.
- **B2 Where PDEs come from**: conservation law + constitutive law (2). Prerequisites B1; EXT.calc3.divergence (soft).
- **B3 First-order PDEs and characteristics** (2). Prerequisites B1, EXT.ode.first-order.
- **B4 Wave equation** (2). Prerequisites B2, B3.
- **B5 Heat equation** (2). Prerequisite B2.
- **B6 Laplace/Poisson** (2). Prerequisites B2, EXT.calc3.laplacian.
- **B7 Boundary-value problems and boundary conditions** (1–2). Prerequisites B4, B5, B6.
- **B8 Separation of variables** (3 lessons: Cartesian, polar/membrane, spherical). Prerequisites B7, E1; E8 before the polar lesson and E7 before the spherical lesson.
- **B9 Fourier-transform methods** (1–2). Prerequisites B5, E3.
- **B10 Green's functions for PDEs** (2). Prerequisites B6, B7; E10 (soft).
- **B11 Classification** (1–2). Prerequisites B3, B4, B5, B6; EXT.linalg.eigen (for systems).
- **B12 Nonlinear PDEs: Burgers and shocks** (2). Prerequisites B3; B11 (soft).
- **B13 Initial-value formulation and well-posedness** (2). Prerequisites B11, B4–B6; G2 (soft).
- **B14 Discretizing PDEs: FD, CFL, stability** (2). Prerequisites B4, B5, F9. It is the conceptual twin of F12.
- **B15 Capstone: Einstein's equations as a PDE system** (3). Prerequisites B13, B14, G6; F13 (soft); EXT.tensors.bianchi; EXT.GR.field-equations.

Order for the learner: B0–B3 alongside Calc III/ODEs; B4–B10 after E1/E3; B11–B14 next; B15 last, timed to the GR pathway's field-equation unit.

**Module cards (B).** Each card gives archetypes (answer keys in Cited Findings), one hint/micro-teach sample, pitfalls, the visual, why it matters in GR, and a checkpoint question.
- **B1**
  - Archetypes: verify-a-solution; interpret ∂ in words; classify order and linearity.
  - Hint: "Hold x fixed; how does T change with t?" Micro-teach: "A partial derivative is a slope taken along one axis of a landscape, with the other coordinates frozen."
  - Pitfalls: treating ∂u/∂t and du/dt (along a moving path) as the same thing; thinking "linear" means "has a straight-line solution".
  - Visual: a 3D surface u(x,t) with two draggable slicing planes. The fixed-t slice gives u_x and the fixed-x slice gives u_t, each with its tangent line drawn.
  - Why GR: the metric g_μν(x) is a field of 10 functions on spacetime, and every GR equation is a PDE for fields.
  - Checkpoint: is u_tt = u u_xx linear? (No.)
- **B2**
  - Archetypes: derive the diffusion equation from conservation plus Fick's law; verify the Poisson potential of a uniform sphere.
  - Pitfalls: sign errors in the flux law; forgetting that Poisson's equation has a source term while Laplace's does not.
  - Visual: a 1D "flux budget" box. Arrows show inflow and outflow, and the bar height (density) changes at the rate given by net flux.
  - Why GR: Newton's ∇²Φ = 4πGρ is the weak-field limit of the 00 component of Einstein's equations [P].
- **B3**
  - Archetypes: solve a linear transport equation; variable coefficients (x e^(−t)); transport with decay; read off where a pulse sits.
  - Pitfalls: thinking information travels "everywhere at once"; mixing up characteristic curves (in the x–t plane) with solution graphs.
  - Visual: an x–t plane with characteristic lines launched from a draggable initial profile. The solution is drawn as a translucent sheet carried along those lines.
  - Why GR: light cones are the characteristics of the wave operator, and causality in GR is characteristic geometry.
  - Checkpoint: for u_t + 3u_x = 0, where is the feature that started at x = 1 when t = 2? (x = 7.)
- **B4**
  - Archetypes: d'Alembert splitting; string frequencies; energy conservation; domain of dependence.
  - Pitfalls: assuming waves spread out in 1D (they don't); thinking initial velocity can be ignored.
  - Visual: a plucked string split into two counter-moving half-height pulses, with the past light-cone of a probe point shaded. Use the 220 Hz example and an audio toggle.
  - Why GR: gravitational waves obey □h̄ = −16πGT [P], and harmonic gauge turns the full equations into wave equations.
- **B5**
  - Archetypes: separated solution evaluation (e^(−1)); kernel properties; mode decay times τ_n = L²/(n²π²D).
  - Pitfalls: "heat propagates at a finite speed" (in the model, any disturbance is felt everywhere instantly); thinking high modes persist (they decay like e^(−n²t)).
  - Visual: a heat-map rod plus a mode-amplitude bar chart that decays live. Use a sequential colour-blind-safe map (cividis/viridis) and pin numeric probes.
  - Why GR: parabolic smoothing is the opposite of hyperbolic propagation. It appears in "parabolic" gauge conditions and in Ricci flow (enrichment).
- **B6**
  - Archetypes: square centre value 1/4; sinh-series centre value 0.199268; disk mean value ½; harmonicity checks.
  - Pitfalls: believing a harmonic function can have an interior maximum; treating Laplace's equation as time evolution.
  - Visual: a "Laplace relaxation" canvas where the learner paints boundary values and watches Jacobi, Gauss–Seidel and SOR converge (verified iteration counts above). A draggable circle shows "centre value = average on circle".
  - Why GR: the Hamiltonian and momentum constraints are elliptic (Poisson-like) equations solved for initial data.
- **B7**
  - Archetypes: a Green's-function BVP (x(1−x)/2); Neumann solvability; a Robin eigenvalue (4.115858).
  - Pitfalls: "every BVP has a unique solution"; mixing up Dirichlet and Neumann data.
  - Visual: a draggable-load beam (−u″ = f) showing u, u′ and the Green's-function "influence" kernel.
  - Why GR: boundary conditions on initial-data solvers (asymptotic flatness at large r) and on outer boundaries of NR grids.
- **B8**
  - Archetypes: rectangle Laplace; rod heat; membrane mode ratios (1.5933, 2.1355, 2.2954); sphere Legendre modes.
  - Pitfalls: forgetting to impose the boundary conditions before summing modes; assuming drum overtones are integer multiples.
  - Visual: a vibrating-membrane (m, n) mode picker with nodal lines (n − 1 circles, m diameters), a 3D/2D toggle, and audio of the inharmonic chord. Show the frequency ratio as text.
  - Why GR: black-hole and neutron-star oscillations are mode expansions. The Regge–Wheeler/Zerilli equations come from separating perturbations in spherical harmonics.
- **B9**
  - Archetypes: FT of a Gaussian; heat-kernel spreading σ² = σ₀² + 2Dt; dispersion relations.
  - Pitfalls: FT sign and 2π conventions; thinking a dispersive pulse keeps its shape.
  - Visual: linked x-space and k-space panels with σ and t sliders, an uncertainty readout, and a dispersive versus non-dispersive toggle.
  - Why GR: GW data analysis lives in the frequency domain (G4).
- **B10**
  - Archetypes: 1D BVP kernel; 3D Poisson kernel; retarded oscillator kernel; images.
  - Pitfall: thinking G "is" the solution, when it is the response to a unit point source.
  - Visual: superposition — drag point charges and see the potential build as a sum of kernels.
  - Why GR: retarded Green's functions give the quadrupole formula for GW emission and retarded potentials in linearized gravity.
- **B11**
  - Archetypes: discriminant sign; the mixed-type Tricomi equation; eigenvalues of a first-order system.
  - Pitfalls: classifying by the sign of A alone; forgetting that type can change with position.
  - Visual: A, B, C sliders with a live discriminant and characteristic directions. Hyperbolic regions show two characteristic families, parabolic one, elliptic none.
  - Why GR: the ADM equations as usually written are only weakly hyperbolic [S], which is the whole reason later formulations exist.
- **B12**
  - Archetypes: breaking time and location; shock speed via Rankine–Hugoniot; rarefaction fan.
  - Pitfalls: "the PDE has no solution after t*" (it has weak solutions); using the non-conservative form numerically (verified: the shock stays stuck).
  - Visual: characteristics tilting with slope u₀(ξ) from a draggable profile, with the first crossing marked at t* = 1/max(−u₀′). A toggle switches conservative and non-conservative upwind to show the wrong shock speed.
  - Why GR: shock-capturing conservative schemes are standard in relativistic hydrodynamics for neutron-star mergers.
- **B13**
  - Archetypes: amplification factors (backward heat, Hadamard); weak- versus strong-hyperbolic growth; "is it well-posed?" sorting.
  - Pitfalls: "if a solution exists and is unique, the problem is fine" (continuous dependence is the hard part); thinking numerical noise is harmless in an ill-posed problem.
  - Visual: a noise amplifier — add 10⁻⁶ noise to initial data and watch the forward heat equation smooth it while the backward one explodes, with a mode-k slider for the Jordan-block toy.
  - Why GR: GR simulations were held back for decades partly by weakly hyperbolic formulations [S].
  - Checkpoint: which is ill-posed — forward heat, backward heat, or the wave Cauchy problem? (Backward heat.)
- **B14**
  - Archetypes: CFL bound; FTCS heat bound; von Neumann |G|.
  - Pitfalls: "CFL is sufficient" (FTCS advection meets CFL yet is unstable); "blow-up is a bug in my code" (it is the scheme); instability first appears as a grid-scale sawtooth.
  - Visual: a CFL blow-up demo. Moving the Courant slider past 1.00 makes the sawtooth appear; the r slider for heat crosses ½. A stencil-cone overlay shows the numerical domain of dependence covering the physical one.
  - Why GR: the NR time step is set by a CFL condition on the light speed.
- **B15** (3 lessons: "Slicing spacetime", "Constraints vs evolution", "Gauge, hyperbolicity and well-posedness")
  - Archetypes: count equations, constraints, gauge functions and degrees of freedom; constraint-damping toy (e^(−γt)); convergence of the constraint violation; the Maxwell analogue.
  - Pitfalls:
    - "Harmonic coordinates change the physics" (they choose a gauge only).
    - "The constraints must be re-solved every step" (analytically they propagate; numerically you monitor and damp them).
    - "Lapse and shift are physical fields" (they are freely chosen gauge, appearing as Lagrange multipliers; see G6).
    - "Well-posed means the code will work" (lower-order terms and boundaries still matter [S]).
  - Visual: a 3+1 slicing explorer — a stack of spatial slices with lapse (proper-time gap) and shift (coordinate drift) sliders, a normal-observer worldline, and a live ‖C‖(t) monitor for the toy system with a γ slider.
  - Why GR: this is how binary-black-hole waveforms for LIGO are computed (Pretorius 2005; moving punctures 2006 [B]).

### Gaps
- I could not open Strauss's or Haberman's tables of contents this session. The chapter lists above are from domain knowledge [B]; verify them against publisher pages before quoting chapter numbers.
- No source was fetched for the exact wording of Choquet-Bruhat's theorem. In particular, I did not confirm the regularity class: the original 1952 paper used classical-derivative assumptions, and modern Sobolev versions are due to later authors. Present it as "local well-posedness for smooth data".
- I did not verify which BSSN variants with which gauges are strongly hyperbolic. The search summary only said "some members". If the lesson needs specifics, consult Sarbach & Tiglio 2012 [B].
- The weak-hyperbolicity toy is a standard example, but I did not confirm which reference introduces it in exactly this form.

## KQ2. D — Complex Analysis: sequence, archetypes, and physics/GR uses

### Takeaway
Teach complex analysis geometrically first, as Needham does: numbers as rotate-and-scale operations, functions as maps, then the derivative as an "amplitwist". After that come Cauchy–Riemann, contour integration and Cauchy's theorem, Laurent series and residues, and then the payoffs: evaluating real integrals, conformal maps for 2D potential problems, causal Green's functions via iε contours, and analytic continuation. All eight real-integral answer keys agree with high-precision quadrature to at least 10⁻¹⁶. The GR showcase is a black-hole quasinormal mode, a complex eigenfrequency: Leaver's continued fraction reproduces Mω = 0.37367 − 0.08896i for the l = 2 Schwarzschild mode.

### Cited Findings
- Needham, *Visual Complex Analysis* (OUP 1997; 25th-anniversary edition 2023), chapter order:
  1. Geometry and complex arithmetic.
  2. Complex functions as transformations.
  3. Möbius transformations and inversion.
  4. Differentiation: the amplitwist concept.
  5. Further geometry of differentiation (Cauchy–Riemann revisited, analyticity).
  6. Non-Euclidean geometry.
  7. Winding numbers and topology.
  8. Complex integration: Cauchy's theorem.
  9. Cauchy's formula and its applications.
  10. Vector fields: physics and topology.
  11. Vector fields and complex integration.
  12. Flows and harmonic functions.

  — [B: Needham, *Visual Complex Analysis* (WorldCat search)](https://www.worldcat.org/search?q=Needham+Visual+Complex+Analysis)
- Brown & Churchill, *Complex Variables and Applications* (9th ed., McGraw-Hill 2014), chapter order:
  1. Complex numbers.
  2. Analytic functions.
  3. Elementary functions.
  4. Integrals.
  5. Series.
  6. Residues and poles.
  7. Applications of residues.
  8. Mapping by elementary functions.
  9. Conformal mapping.
  10. Applications of conformal mapping.
  11. Schwarz–Christoffel.
  12. Poisson-type integral formulas.

  — [B: Brown & Churchill 9th ed., ISBN 9780073383170](https://openlibrary.org/isbn/9780073383170)
- Phase portraits (domain colouring) as a teaching tool — [B: Wegert & Semmler, "Phase plots of complex functions: a journey in illustration", Notices AMS 58(6), 2011](https://www.ams.org/notices/201106/rtx110600768p.pdf); [B: Wegert, *Visual Complex Functions* (Birkhäuser 2012)](https://doi.org/10.1007/978-3-0348-0180-5). A cyclic colour map is needed for phase — [B: Kovesi, "Good colour maps: how to design them", arXiv:1509.03700](https://arxiv.org/abs/1509.03700).
- **Verified answer keys (D)** — [C: verify_complex_fourier.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_complex_fourier.py), [C: verify_extra.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_extra.py)
  - **D1:** e^(iπ) = −1; (1+i)⁸ = 16; |3+4i| = 5; arg(1+i) = π/4; the cube roots of unity are 1 and −½ ± (√3/2)i, which sum to 0; i^i = e^(−π/2) ≈ 0.207880 (principal value).
  - **D2:**
    - The Joukowski map z + 1/z sends |z| = 1 onto the real segment [−2, 2].
    - The Möbius map (z − i)/(z + i) sends the upper half-plane into the unit disk: 1000 random points gave max |w| = 0.99981.
    - w = z² doubles angles at 0 (π/4 → π/2).
  - **D3:**
    - z² (u = x² − y², v = 2xy) and e^z satisfy Cauchy–Riemann identically.
    - z̄ fails (u_x − v_y = 2).
    - |z|² satisfies CR only at the origin (u_x − v_y = 2x, u_y + v_x = 2y), so it is differentiable at one point and analytic nowhere.
    - Harmonic conjugates: x² − y² → 2xy; e^x cos y → e^x sin y.
  - **D4:**
    - The principal value is Log(−1) = iπ.
    - The principal √ jumps across its branch cut on the negative real axis: √(−1 + i0⁺) = i and √(−1 − i0⁺) = −i (standard).
  - **D5:**
    - Numerical contour integrals on |z| = 1 give ∮dz/z = 2πi; ∮z̄ dz = 2πi; ∮z² dz = 0.
    - The z̄ case is non-zero because z̄ = 1/z on the circle; z̄ is not analytic.
  - **D6:** ∮_(|z|=2) e^z/(z−1) dz = 2πie; ∮_(|z|=1) sin z/z² dz = 2πi.
  - **D7:**
    - 1/(z(z−1)) = −1/z − 1 − z − z² − … for 0 < |z| < 1, and 1/z² + 1/z³ + … for |z| > 1.
    - sin z/z = 1 − z²/6 + z⁴/120 − … (removable singularity).
    - The Taylor series of 1/(1+x²) about 0 has radius 1 because of the poles at ±i (by hand).
  - **D8:**
    - Res[1/(z²+1), i] = −i/2.
    - Res[e^z/z³, 0] = ½.
    - Res[cot πz, 0] = 1/π.
    - Res[1/(z⁴+1), e^(iπ/4)] = −e^(iπ/4)/4.
    - Res[e^(1/z), 0] = 1 (essential singularity; numerical contour gave 1.000000000000).
  - **D9 (residue values vs mpmath quadrature, all differences < 10⁻¹⁶):**
    - ∫_ℝ dx/(1+x²) = π.
    - ∫_ℝ dx/(1+x²)² = π/2.
    - ∫_ℝ dx/(1+x⁴) = π/√2 ≈ 2.221441.
    - ∫_ℝ cos x/(1+x²) dx = π/e ≈ 1.155727 (Jordan's lemma).
    - ∫₀^(2π) dθ/(2 + cos θ) = 2π/√3 ≈ 3.627599.
    - ∫₀^∞ sin x/x dx = π/2 (indented contour).
    - ∫₀^∞ dx/(1+x³) = 2π/(3√3) ≈ 1.209200 (wedge contour).
    - ∫₀^∞ x^(−1/2)/(1+x) dx = π (keyhole contour).
  - **D10:** Uniform flow past a cylinder, W = U(z + a²/z): stagnation points at z = ±a (W′ = 0) and speed 2U at the top z = ia.
  - **D11:**
    - Closing the contour in the lower half-plane for t > 0 gives the retarded Green's function θ(t) sin(ω₀t)/ω₀.
    - ζ(−1) = −1/12 is a value of the analytic continuation, not the sum 1 + 2 + 3 + …. Also ζ(2) = π²/6 and Γ(−½) = −2√π.
- **QNM showcase (D11/F3).** Leaver's continued fraction for Schwarzschild gravitational perturbations (s = 2, units 2M = 1) gives 2Mω = 0.74734337 − 0.17792463i, i.e. Mω = 0.37367168 − 0.08896232i for l = 2, and Mω = 0.59944329 − 0.09270305i for l = 3.
  - Root-finding uses mpmath findroot in the complex plane at 30-digit precision with depth 400.
  - The photon-sphere (eikonal) estimate (l + ½)/(3√3) − i/(2·3√3) gives 0.481 − 0.096i for l = 2. It is crude at low l.

  — [C: verify_complex_fourier.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_complex_fourier.py); method from [B: Leaver, Proc. R. Soc. A 402, 285 (1985)](https://doi.org/10.1098/rspa.1985.0119); review [B: Berti, Cardoso & Starinets, CQG 26, 163001 (2009), arXiv:0905.2975](https://arxiv.org/abs/0905.2975)
- LIGO now resolves ringdown modes: GW250114's ringdown is consistent with the Kerr (l = |m| = 2) mode and its first overtone, with frequencies within ±30% of Kerr. — [P: LVK arXiv:2509.08054](https://arxiv.org/abs/2509.08054) via [black_holes_gravitational_waves.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/black_holes_gravitational_waves.md)
- Causality ⇒ analyticity in a half-plane ⇒ Kramers–Kronig relations — [B: Toll, Phys. Rev. 104, 1760 (1956)](https://doi.org/10.1103/PhysRev.104.1760). Feynman iε prescription — [B: Peskin & Schroeder, *An Introduction to QFT*, §2.4](https://doi.org/10.1201/9780429503559). Euclidean (Wick-rotated) Schwarzschild periodicity gives T_H = 1/(8πM) — [B: Gibbons & Hawking, PRD 15, 2752 (1977)](https://doi.org/10.1103/PhysRevD.15.2752).

### Inferences

**Order and tree (D).**
- **D1 Complex numbers as rotations and scalings** (1 lesson). Prerequisite EXT.calc2 (Euler's formula via power series). Can start now.
- **D2 Functions as maps; domain colouring; branch points** (2). Prerequisite D1.
- **D3 Complex differentiability and Cauchy–Riemann; amplitwist; harmonic functions** (2). Prerequisites D2, EXT.calc3.partials.
- **D4 Elementary functions and branch cuts** (1). Prerequisite D3.
- **D5 Contour integrals** (1). Prerequisites D4, EXT.calc3.line-integrals.
- **D6 Cauchy's theorem and integral formula; Liouville** (2). Prerequisite D5.
- **D7 Taylor and Laurent series** (2). Prerequisites D6, G2.series (soft).
- **D8 Singularities and residues** (1). Prerequisite D7.
- **D9 Real integrals by residues** (2–3). Prerequisite D8.
- **D10 Conformal maps and 2D potential theory** (2). Prerequisites D3, B6.
- **D11 Physics uses: causal Green's functions and iε, Kramers–Kronig, analytic continuation, QNMs** (2). Prerequisites D9, E3, E4; B10 (soft).

Schwarz–Christoffel, Picard's theorem and Riemann surfaces are enrichment only.

**Module cards (D).**
- **D1**
  - Hint: "Write both numbers in polar form; multiply lengths, add angles." Micro-teach: "Multiplying by i is a quarter-turn."
  - Pitfalls: treating i as "imaginary = unreal"; arg ambiguity (mod 2π).
  - Visual: drag z and w and watch zw rotate and scale; the roots of unity form a polygon.
  - Why GR: phases e^(iωt) are everywhere in GW signals and perturbation theory.
- **D2**
  - Pitfalls: domain colouring on a rainbow map hides structure and fails colour-blind users.
  - Visual: a grid-deformation viewer. A square grid is drawn in the z-plane and its image appears under z², e^z, 1/z, Joukowski or Möbius. Right angles survive except at critical points (marked). A phase-portrait toggle uses a cyclic, perceptually uniform map plus contour lines of |f| and arg f, so the information does not rely on hue alone.
- **D3**
  - Archetypes: test CR; find a harmonic conjugate; locate points of differentiability (|z|²).
  - Pitfall: "differentiable at a point = analytic" (counterexample |z|², verified).
  - Visual: the "amplitwist" magnifier — a tiny circle near z₀ maps to a rotated and scaled circle for analytic f, and to an ellipse for non-analytic f.
  - Why GR: harmonic functions are the 2D shadow of the elliptic constraint equations; analyticity is the root of causality arguments.
- **D4**
  - Pitfall: using log(ab) = log a + log b across branch cuts.
  - Visual: drag a point around the origin and watch √z return with a sign flip (monodromy); a cut line can be dragged.
- **D5–D6**
  - Archetypes: ∮dz/z; ∮z̄ dz; Cauchy integral formula evaluations.
  - Pitfall: "the integral of a function around any closed curve is 0" (only for analytic f, and only when there are no singularities inside).
  - Visual: contour deformation. Drag the contour's control points and the integral readout stays fixed until the contour crosses a pole, when it jumps by 2πi·Res.
- **D7–D8**
  - Archetypes: Laurent expansions in different annuli; residue rules; classifying singularities.
  - Pitfalls: one Laurent series for all regions; calling e^(1/z) a pole.
  - Visual: annulus selector showing which series is valid where (the radius of convergence reaches the nearest singularity).
- **D9**
  - Archetypes: the eight verified integrals, parameterizable (e.g., ∫cos(kx)/(x² + a²) dx = (π/a)e^(−ka) for k ≥ 0).
  - Pitfalls: forgetting the arc contribution or Jordan's lemma conditions; closing in the wrong half-plane for e^(ikx).
  - Visual: a semicircle-radius slider showing the arc contribution → 0, with residue contributions summed.
- **D10**
  - Archetypes: flow past a cylinder; mapping a hard geometry to a half-plane; the image of a line under Möbius.
  - Pitfall: "conformal = preserves lengths" (it preserves angles only).
  - Visual: streamlines and equipotentials of the complex potential with a draggable obstacle radius and the Joukowski airfoil.
  - Why GR: Penrose diagrams rely on angle-preserving (conformal) rescalings that keep light cones at 45°. This is a Lorentzian cousin of conformal maps, so present it as an analogy.
- **D11**
  - Archetypes: retarded versus advanced Green's function from pole placement; continuation of ζ/Γ; locating a QNM by complex root-finding.
  - Pitfalls: "1 + 2 + 3 + … = −1/12" stated as a sum; thinking QNMs are normal modes (they decay, are complex, and are not a complete orthogonal set).
  - Visual: an ω-plane with draggable poles, where pole placement controls whether the response is causal. A ringdown waveform is generated from (Re ω, Im ω).
  - Why GR: QNM frequencies are black-hole "spectroscopy" tests [P]; Euclidean methods give Hawking temperature [B].

### Gaps
- I could not fetch Needham's or Brown & Churchill's tables of contents this session [B]; chapter titles should be spot-checked.
- No source was verified for the accessibility performance of domain colouring with colour-blind users. The cyclic-map recommendation rests on Kovesi [B], plus my inference that contour overlays are needed.

## KQ3. E — Fourier Analysis and Mathematical Methods

### Takeaway
Start Fourier series early, right after Calc II series, because they are intensely visual. Revisit convergence once real analysis supplies pointwise, uniform and L² convergence. The Gibbs overshoot never vanishes: it tends to (2/π)Si(π) = 1.178980, i.e. 8.95% of the jump. Then come transforms; Sturm–Liouville as the unifying theory that generates orthogonal polynomials and special functions; Green's functions via eigenfunction expansions; calculus of variations; and spectral methods. The spectral demo is decisive: Chebyshev differentiation of e^x sin 5x reaches 4×10⁻¹⁴ error at N = 30, while 2nd-order finite differences are still at 0.26.

### Cited Findings
- Boas's ordering puts Fourier series and transforms (ch. 7) before ODEs (ch. 8), calculus of variations (ch. 9), special functions (ch. 11), series solutions with Legendre, Bessel, Hermite and Laguerre (ch. 12), and PDEs (ch. 13). — [B: Boas 3rd ed., ISBN 9780471198260](https://openlibrary.org/isbn/9780471198260) Comprehensive references — [B: Arfken, Weber & Harris, 7th ed. (Academic Press 2013)](https://openlibrary.org/isbn/9780123846549); [B: Riley, Hobson & Bence, 3rd ed. (CUP 2006)](https://doi.org/10.1017/CBO9780511810763); [B: Byron & Fuller (Dover)](https://openlibrary.org/isbn/9780486671642).
- Abbott's analysis text ends with Fourier series as an "additional topic", after sequences and series of functions. That supports placing rigorous convergence after real analysis. — [B: Abbott, *Understanding Analysis*, 2nd ed. (Springer UTM 2015)](https://doi.org/10.1007/978-1-4939-2712-8)
- The Gibbs phenomenon is treated in the DLMF via the sine integral — [B: NIST DLMF §6.16](https://dlmf.nist.gov/6.16). History: Wilbraham (1848) and Gibbs (1899) — [B: Hewitt & Hewitt, Arch. Hist. Exact Sci. 21, 129 (1979)](https://scholar.google.com/scholar?q=Hewitt+Hewitt+1979+%22The+Gibbs-Wilbraham+phenomenon%22). There are continuous functions whose Fourier series diverge at a point (du Bois-Reymond, 1873), while L² functions' series converge almost everywhere (Carleson, 1966). — [B: Carleson, Acta Math. 116, 135 (1966)](https://scholar.google.com/scholar?q=Carleson+1966+%22On+convergence+and+growth+of+partial+sums+of+Fourier+series%22)
- **Verified answer keys (E)** — [C: verify_complex_fourier.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_complex_fourier.py), [C: verify_final.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_final.py), [C: verify_numerics_G.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_numerics_G.py)
  - **E1:**
    - f = x on (−π, π) has b_n = 2(−1)^(n+1)/n, i.e. 2, −1, 2/3, −1/2, ….
    - The square wave sign(x) has b_n = 4/(nπ) for odd n. Parseval check: Σ(4/(nπ))²·π = 2π = ‖sign‖².
    - Σ1/n² = π²/6.
  - **E2:**
    - The peak of the partial sums tends to (2/π)Si(π) = 1.178979744, an overshoot of 0.089490 of the jump.
    - Peaks for N = 5, 10, 50 and 200 odd harmonics: 1.182328, 1.179814, 1.179013, 1.178982.
    - The peak location ≈ π/(2N) moves toward the jump but never shrinks in height.
    - Fejér-type weighted sums (1 − n/(2N+1)) never overshoot: their peaks are 0.947, 0.971, 0.994 and 0.998.
  - **E3:** the Gaussian transform pair (B9). For a Gaussian, σ_x σ_k = ½, the minimum (by hand).
  - **E4:** L{sin t} = 1/(s² + 1). y″ + 3y′ + 2y = 0 with y(0) = 1, y′(0) = 0 gives y = 2e^(−t) − e^(−2t); the poles at s = −1 and −2 mean decay.
  - **E5:**
    - Dirichlet: λ_n = (nπ/L)².
    - Robin: λ₁ = 4.115858 (B7).
    - The Rayleigh quotient with trial function x(1−x) for −y″ = λy on [0, 1] is exactly 10 ≥ π² = 9.8696. Variational upper bound, 1.3% high.
  - **E6:**
    - Gram–Schmidt on {1, x, x²} over [−1, 1] gives {1, x, x² − 1/3} ∝ P₀, P₁, P₂.
    - P₂ = (3x² − 1)/2 and P₃ = (5x³ − 3x)/2, with ∫P₃² = 2/7 = 2/(2n+1).
    - x² = (1/3)P₀ + (2/3)P₂.
    - Hermite: H₂ = 4x² − 2, H₃ = 8x³ − 12x, and ∫H₃²e^(−x²) = 48√π = 2³·3!·√π.
    - Laguerre: L₁ = 1 − x, L₂ = x²/2 − 2x + 1.
    - 2-point Gauss–Legendre nodes ±1/√3 integrate cubics exactly.
  - **E7:** the generating function 1/√(1 − 2xh + h²) has coefficients P₀…P₃. Y₀₀ = 1/(2√π), and ∫|Y₁₀|²dΩ = 1.
  - **E8:** Bessel zeros and drum ratios (B8).
  - **E9:** Γ(½) = √π; Γ(5/2) = 3√π/4 ≈ 1.329340; the unit 4-ball volume is π²/Γ(3) = π²/2; Γ(−½) = −2√π.
  - **E10:** the eigenfunction-expansion solution of −u″ = 1 at x = ½ sums to 0.125000 = 1/8, matching the closed form.
  - **E11:**
    - Euler–Lagrange for √(1 + y′²) gives y″ = 0 (straight lines).
    - Euler–Lagrange on the sphere gives the great-circle equations.
    - Brachistochrone to (πa, −2a) with a = 1 m and g = 9.81 m/s²: the cycloid takes 1.0030 s and the straight line 1.1890 s.
  - **E12:** maximum error differentiating u = e^x sin 5x on [−1, 1]:

    | N | Chebyshev collocation | 2nd-order FD |
    |---|---|---|
    | 10 | 2.25×10⁻² | 3.31 |
    | 20 | 6.72×10⁻¹⁰ | 0.683 |
    | 30 | 4.23×10⁻¹⁴ | 0.264 |
    | 40 | 3.0×10⁻¹³ | 0.136 |
    | 50 | 5.8×10⁻¹³ | 0.0815 |

    The Chebyshev error plateaus and then rises from roundoff amplification. The FD error falls as N⁻².
- Trefethen's *Spectral Methods in MATLAB* develops differentiation matrices, spectral accuracy for smooth functions, Chebyshev grids, and time-stepping/stability regions, with short programs. — [B: Trefethen, SIAM 2000; author's page](https://people.maths.ox.ac.uk/trefethen/spectral.html). Spectral methods in NR — [B: Grandclément & Novak, Living Rev. Relativ. 12, 1 (2009), arXiv:0706.2286](https://arxiv.org/abs/0706.2286). The SXS collaboration's SpEC code — [B: black-holes.org](https://www.black-holes.org/code/SpEC.html). A free textbook — [B: Boyd, *Chebyshev and Fourier Spectral Methods* (Dover 2001), author's page](http://www-personal.umich.edu/~jpboyd/BOOK_Spectral2000.html).
- PhET's "Fourier: Making Waves" is an existing free interactive for building series from sliders. — [B: PhET](https://phet.colorado.edu/en/simulations/fourier-making-waves)
- Geodesics extremize proper time; "maximizing proper time is the same as making Newton's action ∫(KE − PE)dt stationary". This is why Lagrangian mechanics and variations are on the GR prerequisite list. — [P: gr_principles_and_math.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/gr_principles_and_math.md)

### Inferences

**Order and tree (E).**
- **E1 Fourier series** (2 lessons). Prerequisite EXT.calc2 (series, integrals of sin/cos).
- **E2 Convergence and the Gibbs phenomenon** (1–2). Prerequisites E1, G2.uniform (for the rigorous lesson).
- **E3 Fourier transform, convolution, Parseval, sampling/DFT** (2). Prerequisite E1.
- **E4 Laplace transform** (1–2). Prerequisites E3, EXT.ode.
- **E5 Sturm–Liouville theory** (2). Prerequisites EXT.ode.linear2, EXT.linalg.eigen, E1.
- **E6 Orthogonal polynomials** (2). Prerequisite E5; F5 for Gauss quadrature (soft).
- **E7 Legendre functions and spherical harmonics** (2). Prerequisites E6, B8.spherical; EXT.calc3.spherical-coords.
- **E8 Bessel functions** (1–2). Prerequisites E5, B8.polar.
- **E9 Gamma function** (1). Prerequisite EXT.calc2 (improper integrals). Can be early.
- **E10 Green's functions via eigenfunction expansions** (1–2). Prerequisite E5. It feeds B10.
- **E11 Calculus of variations** (2). Prerequisites EXT.calc3, EXT.mech.newton. It feeds G5.
- **E12 Spectral methods** (2). Prerequisites E1, E6 (Chebyshev), F4, F5.

**Module cards (E).**
- **E1**
  - Hint: "Use orthogonality: multiply by sin(nx) and integrate over a period." Micro-teach: "Each coefficient is the shadow (projection) of f onto one sine wave."
  - Pitfall: forgetting the a₀/2 convention.
  - Visual: a "build-a-wave" sum with harmonic sliders and an epicycle/phasor view.
  - Why GR: GW signals are analysed as sums of frequencies, and a periodic orbit's waveform is a Fourier series in the orbital frequency.
- **E2**
  - Pitfalls: "more terms removes the overshoot" (no — 8.95% forever, only narrower); "a Fourier series converges uniformly for any continuous f" (false); confusing L² convergence with pointwise convergence.
  - Visual: a Gibbs-overshoot slider N = 1…500 with a live peak readout converging to 1.17898 and peak location ≈ π/(2N), plus Fejér and Lanczos-σ toggles that remove the ringing.
  - Why GR: spectral NR and filtering of GW data must handle discontinuities (e.g., matter surfaces) without ringing.
- **E3**
  - Archetypes: transform pairs; convolution theorem (heat kernel); uncertainty; sampling and aliasing.
  - Pitfalls: 2π conventions; aliasing above the Nyquist frequency.
  - Visual: a chirp with a live spectrogram; a sampling-rate slider shows aliasing.
  - Why GR: matched filtering and PSD-weighted inner products are Fourier-domain operations (G4).
- **E4**
  - Visual: an s-plane pole picker that plays the corresponding time response (decay or oscillation).
  - Why GR: ringdown is a sum of damped sinusoids, i.e. poles in the complex frequency plane (D11).
- **E5**
  - Archetypes: eigenvalues for Dirichlet, Neumann and Robin conditions; orthogonality with weight; Rayleigh-quotient bounds.
  - Pitfalls: forgetting the weight function; assuming every eigenproblem is self-adjoint (the QNM problem is not).
  - Visual: a draggable trial function with a live Rayleigh quotient that can never drop below the true λ₁; eigenfunctions show n − 1 nodes.
  - Why GR: the Regge–Wheeler equation is Schrödinger-like, and its bound-state intuition fails for leaky (QNM) problems (D11).
- **E6–E9**
  - Pitfalls: physicists' versus probabilists' Hermite normalization; Condon–Shortley phase conventions in Y_lm; P_l normalization 2/(2l+1).
  - Visuals: Gram–Schmidt animation (vectors-as-functions); spherical-harmonic sphere viewer with l and m sliders, nodal lines and degeneracy 2l+1; Bessel J_m plots with zeros; Γ plotted across its poles.
  - Why GR: multipole expansions (Newtonian J₂ of the Sun enters perihelion tests [P: cosmology_and_experimental_tests.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/cosmology_and_experimental_tests.md)); GW waveforms are decomposed in spin-weighted spherical harmonics (enrichment, links to the GR pathway).
- **E10**
  - Visual: kernel-building — G(x, s) as a sum of eigenmodes with a mode-count slider.
- **E11**
  - Archetypes: shortest path; brachistochrone (verified times); catenary; geodesics on a sphere.
  - Pitfall: "Euler–Lagrange gives a minimum" (it gives a stationary path; a saddle is possible).
  - Visual: a race between a draggable curve and the cycloid, with the action/time readout minimized at the cycloid.
- **E12**
  - Pitfalls: spectral methods and discontinuities (Gibbs again); expecting machine precision at large N (a roundoff plateau, verified).
  - Visual: a convergence plot (log error vs N) for Chebyshev against FD2 and FD4, with the verified numbers.
  - Why GR: SpEC-class codes produce high-accuracy BBH waveforms [B].

### Gaps
- I could not verify the DLMF section number for the Gibbs discussion [B]. The constant itself is computed.
- I did not verify which free textbooks are currently free online. Boyd's and Blitzstein & Hwang's availability is from memory.

## KQ4. F — Numerical Methods, including a concrete Schwarzschild geodesic-integration plan

### Takeaway
F can start immediately: the learner knows Python and Calc II, and these modules give early, visual wins. The order is floating point → error and stability → root-finding → interpolation/quadrature → linear algebra → ODE solvers → geometric (symplectic) integration → PDE solvers → convergence testing. The track then converges on a three-level geodesic lab.

All benchmark values were verified both against sources and by computation:

| Benchmark | Value |
|---|---|
| ISCO | 6M, with L = 2√3M and E = √(8/9) = 0.942809 |
| Marginally bound orbit | 4M (E = 1, L = 4M) |
| Photon sphere | 3M; capture parameter b_c = 3√3M = 5.196152M (integration: captured at b = 5.196, escapes at 5.197) |
| Mercury perihelion advance | 42.98″/century |
| Solar-limb deflection | 1.75″ |

The integrator story is quantitatively clear. RK4's energy error grows linearly in time. Verlet's stays bounded, with relative amplitude (hω)²/4, but Verlet injects a spurious precession ∝ h². Each method fails differently, and the lab should show both failures.

### Cited Findings
- Standard numerical-analysis orderings:
  - Sauer, *Numerical Analysis* (3rd ed., Pearson): fundamentals including floating point → solving equations → systems → interpolation → least squares → differentiation and integration → ODEs → BVPs → PDEs → … → eigenvalues and singular values. — [B: Sauer 3rd ed., ISBN 9780134696454](https://openlibrary.org/isbn/9780134696454)
  - Burden & Faires (10th ed.): error analysis → equations in one variable → interpolation → differentiation and integration → IVPs for ODEs → direct linear methods → iterative methods → approximation theory → eigenvalues → nonlinear systems → BVPs → PDEs. — [B: Burden & Faires 10th ed., ISBN 9781305253667](https://openlibrary.org/isbn/9781305253667)
  - Trefethen & Bau's 40 lectures run Fundamentals (with the SVD early) → QR and least squares → conditioning, stability and floating point → systems of equations → eigenvalues → iterative methods. — [B: SIAM 1997](https://doi.org/10.1137/1.9780898719574)
  - LeVeque (2007), Part I: FD approximations, BVPs, elliptic equations, iterative methods. Part II: IVP ODEs (zero-stability, absolute stability, stiffness), then diffusion, advection and mixed equations. — [B: SIAM; book page](https://faculty.washington.edu/rjl/fdmbook/)
- Floating point:
  - [B: Goldberg, ACM Comput. Surv. 23(1), 5 (1991)](https://doi.org/10.1145/103162.103163)
  - [B: Python tutorial, "Floating-Point Arithmetic: Issues and Limitations"](https://docs.python.org/3/tutorial/floatingpoint.html)
  - [B: IEEE 754-2019](https://doi.org/10.1109/IEEESTD.2019.8766229)
  - [B: Higham, *Accuracy and Stability of Numerical Algorithms*, SIAM 2002](https://doi.org/10.1137/1.9780898718027)
  - JavaScript Numbers are IEEE-754 doubles — [B: ECMA-262](https://tc39.es/ecma262/#sec-ecmascript-language-types-number-type).
- Stability and convergence:
  - CFL condition — [B: Courant, Friedrichs & Lewy, Math. Ann. 100, 32 (1928)](https://doi.org/10.1007/BF01448839).
  - Lax equivalence (consistency + stability ⇔ convergence) — [B: Lax & Richtmyer, CPAM 9, 267 (1956)](https://doi.org/10.1002/cpa.3160090206).
  - Embedded RK45 — [B: Dormand & Prince, J. Comput. Appl. Math. 6, 19 (1980)](https://doi.org/10.1016/0771-050X(80)90013-3).
- Geometric integration:
  - [B: Hairer, Lubich & Wanner, "Geometric numerical integration illustrated by the Störmer–Verlet method", Acta Numerica 12, 399 (2003)](https://doi.org/10.1017/S0962492902000144)
  - [B: HLW, *Geometric Numerical Integration*, 2nd ed. (Springer 2006)](https://doi.org/10.1007/3-540-30666-8)
  - [B: Yoshida, Phys. Lett. A 150, 262 (1990)](https://doi.org/10.1016/0375-9601(90)90092-3)
  - Explicit symplectic integration of non-separable Hamiltonians, including geodesic Hamiltonians — [B: Tao, PRE 94, 043303 (2016), arXiv:1609.02212](https://arxiv.org/abs/1609.02212); a geodesic code built on it — [B: Christian & Chan, "FANTASY", ApJ 909, 67 (2021), arXiv:2010.02237](https://arxiv.org/abs/2010.02237).
- The repo's own experience:
  - `geodesic/` uses Yoshida-4 by default. Its design record says "symplecticity beats order" for long-run orbits, symplectic integrators "require a fixed step — varying it breaks the property", and RK4 "drifts secularly".
  - It measured relative energy errors over 20,000 steps of 2.2×10⁻⁸ (RK4) vs 8.4×10⁻⁹ (Yoshida-4) for Earth–Moon.

  — [R: geodesic/DESIGN.md §4](/home/user/Projects/geodesic/DESIGN.md); [R: geodesic/README.md](/home/user/Projects/geodesic/README.md); [R: geodesic/src/physics/integrators.js](/home/user/Projects/geodesic/src/physics/integrators.js)
- In the repo's Mercury test, "a symplectic integrator has bounded ENERGY error but still accumulates a small spurious PERIHELION precession proportional to dt²". At its step size that is about 15″/century, a third of the effect being measured. The test therefore differences GR and Newtonian runs and tracks the Laplace–Runge–Lenz vector. — [R: geodesic/test/physics.test.mjs](/home/user/Projects/geodesic/test/physics.test.mjs)
- `worldline/src/physics.js` integrates the orbit equations with RK4 in φ, in units r_s = 1: d²u/dφ² + u = (3/2)u² for light and u″ + u = 1/(2ℓ²) + (3/2)u² for matter. It encodes PHOTON_SPHERE = 1.5, ISCO = 3 and CAPTURE_B = 3√3/2 (all in r_s). Its tests check weak-field deflection → 2r_s/b, precession 3πr_s/p, 1.75″ at the solar limb, and the ISCO efficiency ≈ 5.7%. — [R: worldline/src/physics.js](/home/user/Projects/worldline/src/physics.js); [R: worldline/test/physics.test.mjs](/home/user/Projects/worldline/test/physics.test.mjs)
- The repo's convention is DOM-free physics modules tested headlessly with `node …/test/*.test.mjs`, kept separate from rendering. — [R: /home/user/Projects/CLAUDE.md](/home/user/Projects/CLAUDE.md)
- `sonicline` runs grid-convergence studies: "three meshes refined systematically by one ratio", observed order, Richardson extrapolation and the GCI of Celik et al. (2008). — [R: sonicline/DESIGN.md](/home/user/Projects/sonicline/DESIGN.md); [B: Celik et al., J. Fluids Eng. 130, 078001 (2008)](https://doi.org/10.1115/1.2960953). The three-level self-convergence test in NR — [B: Choptuik, PRD 44, 3124 (1991)](https://doi.org/10.1103/PhysRevD.44.3124).
- An undergraduate research example is a Python simulation of null geodesics around Schwarzschild and Kerr black holes, solved with Runge–Kutta 4(5). — [P: Berkeley ULAB poster](https://ulab.berkeley.edu/static/doc/posters/s234.pdf) via [studying_gr_and_resources.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/studying_gr_and_resources.md)

**Benchmark sources (geodesic lab)**
- ISCO at 6M — [S: arXiv:1608.06218](https://arxiv.org/pdf/1608.06218); [S: arXiv:1512.08707](https://arxiv.org/pdf/1512.08707) ("or 3r_g with r_g = 2M"); [P: Carroll notes eq. 7.55](https://arxiv.org/abs/gr-qc/9712019) and [P: Wikipedia ISCO](https://en.wikipedia.org/wiki/Innermost_stable_circular_orbit) via [black_holes_gravitational_waves.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/black_holes_gravitational_waves.md).
- Photon sphere at 3M ("inside the photon sphere, no circular orbits exist") — [S: arXiv:1512.08707](https://arxiv.org/pdf/1512.08707); [P: Wikipedia ISCO; Carroll ch. 7](https://en.wikipedia.org/wiki/Innermost_stable_circular_orbit).
- Marginally bound orbit at 4M — [S: arXiv:1608.06218](https://arxiv.org/pdf/1608.06218); [S: UMD ASTR498 lecture 10](https://www.astro.umd.edu/~miller/teaching/astr498/lecture10.pdf) ("setting this to 1 and solving gives r = 4M"). Original Kerr-general results — [B: Bardeen, Press & Teukolsky, ApJ 178, 347 (1972)](https://doi.org/10.1086/151796).
- ISCO specific energy √(8/9), so efficiency 1 − √(8/9) = 5.72% — [P: black_holes_gravitational_waves.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/black_holes_gravitational_waves.md) (computed there; sources [arXiv:1810.07032](https://arxiv.org/abs/1810.07032) etc.).
- Perihelion advance Δφ = 6πGM/[c²a(1 − e²)] per orbit; Mercury's anomaly is "43 arcseconds per century" (GR 42.98″) — [P: Will 2014, Living Rev. Relativ., arXiv:1403.7377](https://arxiv.org/abs/1403.7377) via [cosmology_and_experimental_tests.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/cosmology_and_experimental_tests.md). The repo's test also asserts 42.98″ [R].
- Light deflection δθ = 4GM/(c²b), giving 1.75″ at the solar limb (Will: 1.7505″) — [P: Will 2014](https://arxiv.org/abs/1403.7377). The second-order term 15πM²/(4b²) — [B: Keeton & Petters, PRD 72, 104006 (2005), arXiv:gr-qc/0511019](https://arxiv.org/abs/gr-qc/0511019).
- The effective-potential form ½ṙ² + V = ½E², with V = ½ − M/r + L²/(2r²) − ML²/r³ for massive particles — [P: Carroll notes ch. 7](https://arxiv.org/abs/gr-qc/9712019).

**Verified benchmark values** — [C: verify_geodesics.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_geodesics.py), [C: verify_geodesics2.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_geodesics2.py), [C: verify_final.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_final.py). Units G = c = 1.
- Circular orbits have L² = Mr²/(r − 3M) and E² = (r − 2M)²/(r(r − 3M)).
- ISCO (dL²/dr = 0): r = 6M, L = 2√3M ≈ 3.4641M, E = 2√2/3 = 0.9428090; efficiency 1 − E = 0.0571910; MΩ = 6^(−3/2) = 0.0680414; dτ/dt = 1/√2.
- f_GW at the ISCO = Ω/π = 4397 Hz × (M☉/M). In SI, 6GM☉/c² = 8.86 km, 3GM☉/c² = 4.43 km and GM☉/c³ = 4.9255 µs.
- Marginally bound circular orbit (E = 1): r = 4M, L = 4M.
- Photon sphere: r = 3M, b_c = 3√3M = 5.1961524M.
- RK4 photon runs with u″ + u = 3u² (M = 1) are captured at b = 5.15, 5.19 and 5.196 and escape at b = 5.197, 5.20 and 5.25.
- Mercury, using GM☉ = 1.32712440018×10²⁰ m³/s², a = 5.7909050×10¹⁰ m, e = 0.205630 and P = 87.9691 d: Δφ = 5.0187×10⁻⁷ rad/orbit, or **42.981″/century**.
- Solar limb: 4GM/(c²R) = 1.7512″ with R = 6.957×10⁸ m, and 1.7504″ with R = 6.96×10⁸ m. Will's 1.7505″ is consistent with the latter.
- Exact precession per radial period, from 4K(m)/√(2M(u₃ − u₁)) − 2π with u₁ = 1/r_a, u₂ = 1/r_p, u₃ = 1/(2M) − u₁ − u₂ and m = (u₂ − u₁)/(u₃ − u₁):

  | (r_p, r_a) | p | Exact | 6πM/p | Ratio |
  |---|---|---|---|---|
  | (9, 15)M | 11.25M | 2.930177 | 1.675516 | 1.749 |
  | (12, 30)M | 17.14M | 1.518821 | 1.099557 | 1.381 |
  | (20, 60)M | 30M | 0.743918 | 0.628319 | 1.184 |
  | (100, 300)M | 150M | 0.1296218 | 0.1256637 | 1.0315 |
  | (1000, 3000)M | 1500M | 1.260472×10⁻² | 1.256637×10⁻² | 1.0031 |

- The near-circular limit equals 2π[(1 − 6M/r)^(−1/2) − 1]: 3.651403 rad at r = 10M (weak-field formula: 1.884956), and 0.197426 at r = 100M (0.188496).
- Numerically, (3π/2)(18 + e²)(M/p)² accounts for most of the gap at p = 1500M: residual 1.3×10⁻⁷.
- RK4 integration of u″ + u = M/L² + 3Mu² for (12, 30)M gives successive periapsis advances of 1.51882145, against exact 1.518821455.
- Exact light deflection, 2∫₀^(u₀) du/√(1/b² − u² + 2Mu³) − π:

  | r₀ | b | Exact | 4M/b | 4M/b + 15πM²/(4b²) |
  |---|---|---|---|---|
  | 10M | 11.1803M | 0.500236 | 0.357771 | 0.452019 |
  | 100M | 101.0153M | 4.079561×10⁻² | 3.959798×10⁻² | 4.075252×10⁻² |
  | 1000M | 1001.0015M | 4.007798×10⁻³ | 3.995998×10⁻³ | 4.007755×10⁻³ |

**Verified integrator behaviour**
- **Reduced radial equation** r̈ = −M/r² + L²/r³ − 3ML²/r⁴, with φ̇ = L/r² and orbit (r_p, r_a) = (12, 30)M, so E = 0.9773258, L = 4.5883147 and the radial proper period is 666.44M:

  | Method | Step h | Max \|E²_num − E²\| over 20 radial periods |
  |---|---|---|
  | Euler | 1M | 2.2×10⁻² (and r drifts, ending at 66.7M) |
  | RK4 | 1M | 5.6×10⁻¹¹ |
  | Velocity Verlet | 1M | 7.9×10⁻⁷ |

  Over long runs at h = 8M:

  | Method | 10 periods | 100 | 1000 | 3000 |
  |---|---|---|---|---|
  | RK4 | 7.7×10⁻⁷ | 7.7×10⁻⁶ | 7.6×10⁻⁵ | 2.2×10⁻⁴ (linear growth) |
  | Verlet | 5.0×10⁻⁵ | 5.0×10⁻⁵ | 5.0×10⁻⁵ | 5.0×10⁻⁵ (bounded) |

  The crossover is ≈ 650 periods. [C]
- **Spurious precession** (exact 1.518821 rad per orbit) [C]:

  | Method | h = 8M | h = 4M | h = 2M | h = 1M |
  |---|---|---|---|---|
  | Verlet error | −4.68×10⁻³ | −1.16×10⁻³ | −2.91×10⁻⁴ | −7.25×10⁻⁵ |
  | RK4 error | −9.0×10⁻⁶ | +5.7×10⁻⁶ | −1.9×10⁻⁸ | +5.2×10⁻⁸ |

  The Verlet error is exactly ∝ h². The RK4 errors at small h are limited by the linear interpolation used to locate periapses.
- **Full geodesic equation** in (t, r, φ) with Christoffel symbols and RK4, run over 5 radial periods. At h = 2M: |ΔE| = 4.8×10⁻¹⁰, |ΔL| = 9.2×10⁻⁹, |u·u + 1| = 2.1×10⁻¹¹. At h = 0.5M: 4.7×10⁻¹³, 9.0×10⁻¹², 2.6×10⁻¹⁴. [C]
- **Self-convergence at a fixed final time T = 3200M**: Q = 11.36 at (h = 4, 2, 1)M and 13.93 at (2, 1, 0.5)M, i.e. observed orders 3.51 and 3.80 approaching 4 (the pre-asymptotic regime). Richardson extrapolation gives φ(T) = 36.388760008. [C]
- **Pitfall I hit and fixed**: my first convergence test compared runs at final times n·h that differed by 0.25M. That made the order estimate meaningless (a self-convergence ratio of ≈ 0). Convergence tests must compare identical physical times. [C]
- **Harmonic oscillator, ω = 1**:
  - Explicit Euler multiplies the energy by (1 + h²) each step: ×517.4 after 10 periods at h = 0.1, exactly as predicted.
  - Verlet's energy stays in [0.49875, 0.5] over 1000 periods at h = 0.1. The relative amplitude is 2.5×10⁻³ = (hω)²/4, and 2.5×10⁻⁵ at h = 0.01.
  - Verlet is stable iff hω < 2, because the trace of its one-step matrix is 2 − (hω)².

  [C]
- **Other numerics keys** — [C: verify_numerics_G.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_numerics_G.py)
  - **F1 Floating point:**
    - eps = 2⁻⁵² = 2.220446049250313×10⁻¹⁶ (float32: 1.1920929×10⁻⁷).
    - 0.1 + 0.2 = 0.30000000000000004, and 1 + 2⁻⁵³ == 1.
    - The double nearest 0.1 is 0.1000000000000000055511151231257827021181583404541015625.
    - The largest double is 1.7976931348623157×10³⁰⁸; the smallest normal is 2.2250738585072014×10⁻³⁰⁸.
    - Summing 1/n² for n ≤ 10⁶ in float32 gives 1.64472532 forward and 1.64493299 backward (true 1.64493307). Summation order matters.
  - **F2 Error and conditioning:**
    - (1 − cos x)/x² at x = 10⁻⁸ evaluates to 0.0; the stable form 2sin²(x/2)/x² gives 0.5.
    - The small root of x² − 10⁸x + 1 comes out as 7.45×10⁻⁹ naively and 1.0000000000×10⁻⁸ with the stable formula.
    - Differentiating sin at x = 1: the best forward-difference step is h ≈ 9×10⁻⁹ (error 3×10⁻¹⁰; theory √eps ≈ 1.5×10⁻⁸). The best central step is h ≈ 7×10⁻⁷ (error 1×10⁻¹³; theory eps^(1/3) ≈ 6×10⁻⁶). At h = 10⁻¹² the errors rise again to 4×10⁻⁵ (forward) and 1×10⁻⁵ (central).
    - cond(Hilbert n) = 1.55×10⁴ (n = 4), 1.53×10¹⁰ (n = 8), 1.62×10¹⁶ (n = 12, numerically singular).
  - **F3 Root-finding:**
    - Newton for √2 from 1: 1.5, 1.4166666666666667, 1.4142156862745099, 1.4142135623746899, then exact to double. The errors 8.6×10⁻², 2.5×10⁻³, 2.1×10⁻⁶, 1.6×10⁻¹² show the digits doubling.
    - Bisection's bracket after 20 steps is 2⁻²⁰.
    - Kepler's equation with M = 1, e = 0.5: E = 1.4987011335.
    - Newton on arctan x converges from x₀ = 1.3 and 1.39 but diverges from 1.40 (1.7×10⁴ after 8 steps). The critical |x₀| = 1.39174520.
    - Secant's observed order tends to 1.618.
  - **F4 Interpolation** — Runge function 1/(1 + 25x²), max error by degree:

    | Degree | Equispaced nodes | Chebyshev nodes |
    |---|---|---|
    | 10 | 1.92 | 0.132 |
    | 20 | 59.8 | 0.0177 |
    | 40 | 1.05×10⁵ | 3.4×10⁻⁴ |

  - **F5 Quadrature** of ∫₀¹eˣdx = e − 1:
    - Trapezoid errors 8.94×10⁻³, 2.24×10⁻³, 5.59×10⁻⁴, 1.40×10⁻⁴ for n = 4, 8, 16, 32 (order 2.000).
    - Simpson errors 3.70×10⁻⁵, 2.33×10⁻⁶, 1.46×10⁻⁷, 9.1×10⁻⁹ (order 3.99).
    - Richardson (4T(h/2) − T(h))/3 reproduces Simpson exactly.
    - Gauss–Legendre errors with 1, 2, 3 and 4 points: 7.0×10⁻², 3.9×10⁻⁴, 8.2×10⁻⁷, 9.3×10⁻¹⁰.
  - **F6 Linear systems:**
    - LU of [[2,1],[4,3]] without pivoting: L = [[1,0],[2,1]], U = [[2,1],[0,1]]. scipy pivots instead, giving U = [[4,3],[0,−0.5]].
    - Cholesky of [[4,2],[2,3]] is [[2,0],[1,√2]].
    - QR of [[3,1],[4,2]] gives |R₀₀| = 5.
    - The least-squares line through (0,1.1), (1,2.9), (2,5.2), (3,7.1), (4,8.8) has slope 1.96 and intercept 1.10.
  - **F7 SVD:** [[3,0],[4,5]] has singular values 3√5 = 6.7082 and √5 = 2.2361, so cond = 3.
  - **F8 Eigenvalues:**
    - Power iteration on [[2,1],[1,2]] gives Rayleigh estimates 2.8, 2.9756, 2.99726, … → 3.
    - The discrete −d²/dx² on [0, 1] with N = 50 has lowest eigenvalues 9.8665, 39.4285, 88.5739, against (nπ)² = 9.8696, 39.4784, 88.8264.
  - **F9 Stability:**
    - RK4's stability limit is h|λ| ≤ 2.7853 on the real axis and hω ≤ 2√2 = 2.8284 on the imaginary axis.
    - Explicit Euler for y′ = −10y needs h ≤ 0.2; at h = 0.21, |1 + hλ| = 1.1.
  - **F10 Adaptive and stiff solvers:**
    - y′ = −1000(y − cos t) on [0, 1] takes RK45 378 steps and Radau 57.
    - Adaptive RK45 on an e = 0.9 Kepler orbit takes 237 steps; the largest step is 7,874× the smallest, and the orbit closes to 3.7×10⁻⁷ after one period.

### Inferences

**Order and tree (F).** EXT.python is the root prerequisite.
- **F1 Floating point** (1 lesson). Prerequisite EXT.python.
- **F2 Error, conditioning and stability** (1–2). Prerequisite F1.
- **F3 Root-finding** (1–2). Prerequisite F2.
- **F4 Interpolation** (1–2). Prerequisite F2.
- **F5 Numerical differentiation and quadrature, incl. Richardson/Romberg** (2). Prerequisite F4.
- **F6 Linear systems: LU, Cholesky, QR, least squares** (2). Prerequisites F2, EXT.linalg.
- **F7 SVD and conditioning** (1). Prerequisite F6.
- **F8 Eigenvalue methods** (1–2). Prerequisite F6.
- **F9 ODE solvers I: Euler, RK2, RK4, stability regions** (2). Prerequisites F5, EXT.ode (soft; the learner can start with "ODE = rule for the next step").
- **F10 ODE solvers II: adaptive RK45, stiffness** (1). Prerequisite F9.
- **F11 Geometric integration: symplectic Euler, Verlet, Yoshida, modified energy** (2). Prerequisites F9; EXT.mech.hamiltonian or G5 (soft).
- **F12 PDE solvers: method of lines, FD heat/wave/advection, von Neumann, relaxation, conservative schemes** (3). Prerequisites F9, B14.
- **F13 Convergence testing: order, three-level self-convergence, Richardson, asymptotic range, constraint convergence** (1–2). Prerequisites F5, F9.
- **F14 Lab: Schwarzschild geodesic integration** (3). Prerequisites F10, F11, F13, EXT.GR.schwarzschild-metric (GR pathway); D11/F3 (soft) for the QNM bonus.

Phase-0-friendly modules, usable while still in Calc II: F1–F3, F5 (quadrature) and F9.

**Plan for "simple numerical geodesic integration" (F14).** All tests below use [C]-verified values.

**Level 1 — reduced radial problem in proper time (recommended first).**
- State: (r, ṙ, φ). Equations: r̈ = −M/r² + L²/r³ − 3ML²/r⁴, φ̇ = L/r², and optionally ṫ = E/(1 − 2M/r).
- Initial conditions come from (r_p, r_a): L² = 2M(u_p − u_a)/[(u_p² − u_a²) − 2M(u_p³ − u_a³)] and E² = (1 − 2Mu_p)(1 + L²u_p²). Alternatively, the learner drags (E, L) on the effective-potential plot.
- Integrators, in teaching order:
  1. Euler — shows the failure.
  2. RK4 — accurate, with secular drift.
  3. Velocity Verlet — bounded energy error, but spurious precession ∝ h².
- Monitors: 𝓔(τ) = ṙ² + V(r) − E² (should stay ≈ 0). L is exact by construction.
- Outputs: orbit plot, V_eff with an E² line, and precession per orbit against both the exact elliptic value and 6πM/p.
- Integrate the second-order form. The first-order form ṙ = ±√(E² − V) is singular at turning points.

**Level 2 — orbit equation in φ.**
- u″ + u = M/L² + 3Mu² for matter and u″ + u = 3Mu² for light, integrated with RK4 at fixed dφ. The repo's worldline uses exactly this [R].
- Best for precession and deflection measurements and for the capture threshold at b_c.
- Caveats: it cannot do radial infall (L = 0) and gives no clock time unless t(φ) is integrated separately.

**Level 3 — full geodesic equation.**
- Six first-order ODEs (equatorial) with Christoffel symbols, or eight off the equatorial plane.
- Use RK4 or adaptive Dormand–Prince for plunges and close passes.
- Optional symplectic version, H = ½g^(μν)p_μp_ν: this Hamiltonian is non-separable, so plain leapfrog does not apply. Use implicit midpoint, Gauss–Legendre RK, or Tao's explicit extended-phase-space method [B].
- Independent checks: E = −p_t, L = p_φ and normalization u·u = −1 (0 for light). Normalization drift is the lab's miniature "Hamiltonian constraint", which bridges to B15. Extension to Kerr: the Carter constant.

**Benchmark test list (Node, DOM-free).**
1. ISCO: a circular orbit seeded at 6.5M with a small perturbation oscillates (stable); at 5.5M it runs away. The ISCO values r = 6M, L = 2√3M and E = 0.942809 are recovered by root-finding dL²/dr = 0 (F3).
2. Marginally bound: a circular orbit at r = 4M has E = 1.000000. An E = 1, L = 4M particle from far away whirls toward 4M.
3. Photon sphere: capture for b < 5.196152M and escape for b > 5.196152M (verified bracket 5.196–5.197). Near-critical rays wind more than 2π [R].
4. Weak-field precession: (r_p, r_a) = (1000, 3000)M gives 1.260472×10⁻² against 6πM/p = 1.256637×10⁻². Mercury: 42.98″/century.
5. Strong-field precession: (12, 30)M gives 1.518821 rad per radial period.
6. Deflection: r₀ = 1000M gives 4.007798×10⁻³ rad. Solar limb: 1.751″.
7. Convergence: RK4 self-convergence Q → 16 as h → 0 at a fixed final time, and Verlet's precession error ×4 per halving.
8. Conserved quantities within tolerances at a given h (e.g., the RK4 full-geodesic values above).

**Integrator recommendation for the shipped lab.**
- Use float64 JavaScript throughout. Do not use GPU float32 for orbit integration: eps is 1.19×10⁻⁷ [C].
- Use RK4 at fixed dφ for Level-2 demos, Verlet and RK4 side by side for the "which error matters" lesson, and Dormand–Prince for Level 3.
- Label the units. The repo uses r_s = 2M as the unit, so the ISCO is 3 there, not 6. Unit confusion is the most likely bug.

**Module cards (F)** — pitfalls, visual and GR link for each.
- **F1**
  - Pitfalls: == on floats; "doubles have 16 digits everywhere" (the spacing grows with magnitude).
  - Visual: a number-line microscope showing representable doubles near 1, 10⁸ and 10¹⁶, plus a bit viewer.
  - Why GR: phase accuracy over thousands of GW cycles and huge dynamic ranges, e.g. M and r spanning many decades.
- **F2**
  - Pitfalls: subtracting nearly equal numbers; confusing conditioning (a property of the problem) with stability (a property of the algorithm).
  - Visual: the V-shaped FD-error curve against h, with truncation and roundoff asymptotes.
- **F3**
  - Visual: Newton iteration on a graph, and a Newton fractal for z³ = 1 that ties to D.
  - Why GR: finding ISCO and turning points, Kepler problems, QNM roots, apparent-horizon finders [B: Thornburg, Living Rev. Relativ. 10, 3 (2007)](https://doi.org/10.12942/lrr-2007-3).
- **F4**
  - Visual: equispaced against Chebyshev nodes as the degree slider rises; the Runge oscillations explode (verified errors).
- **F5**
  - Visual: a convergence plot with slope readouts of 2 (trapezoid) and 4 (Simpson).
- **F6–F8**
  - Pitfalls: inverting matrices explicitly; ignoring conditioning (Hilbert).
  - Visuals: the SVD as rotate–stretch–rotate of the unit circle into an ellipse; power iteration converging.
  - Why GR: elliptic initial-data solvers, mode spectra and stability eigenproblems.
- **F9–F10**
  - Pitfalls: a smaller step is not always better (roundoff); explicit methods on stiff problems.
  - Visual: a stability-region explorer in the complex hλ-plane. Drag hλ and watch the numerical solution decay or blow up. Euler's disk, RK2 and RK4 are shown, with RK4's imaginary-axis limit 2√2 marked.
- **F11**
  - Pitfalls: "higher order is always better" (RK4 loses over ~650 periods at h = 8M); varying the step in a symplectic method; "bounded energy means the orbit is correct" (spurious precession ∝ h²).
  - Visual: phase-space portraits with Euler spiralling out, RK4 slowly drifting and Verlet bounded, plus an energy-error trace on a log scale.
- **F12**
  - Visual: a CFL/von Neumann lab with an amplification-factor polar plot |G(θ)| that crosses the unit circle as ν passes the limit. Includes the Burgers conservative/non-conservative toggle and the Laplace relaxation race.
- **F13**
  - Pitfalls: mismatched final times; not being in the asymptotic range (observed order 3.5 at coarse h); "the constraint is not zero, so the code is broken" (it should converge to zero at the scheme's order).
  - Visual: a log–log error plot with fitted slope and the Q-ratio readout.
  - Why GR: convergence tests are how NR results are trusted (Choptuik 1991 [B]).

### Gaps
- No source was fetched for the exact strong-field precession formula 2π[(1 − 6M/r)^(−1/2) − 1] or for the elliptic-integral expression. Both were derived and verified numerically here; a textbook citation (e.g., Chandrasekhar 1983 [B]) should be confirmed. The same holds for attributing the second-order term (3π/2)(18 + e²)(M/p)² to the test-mass limit of 2PN periastron advance: computed only.
- ISCO GW frequency ≈ 4.4 kHz × (M☉/M) is computed only; I fetched no source this session.
- I did not verify current EinsteinPy features (which integrator its geodesic module uses).

## KQ5. G modules — proof techniques, real analysis, functional analysis, probability/statistics, variational principles, constrained dynamical systems

### Takeaway
These six modules are the "connective tissue":
- **Proof techniques** can start now.
- **Real analysis** should cover only what physicists use: limits, uniform convergence, completeness and interchange of limits.
- **Functional analysis** treats functions as vectors in L² and operators with spectra, the language of QM and of well-posedness.
- **Probability and statistics** runs from Bayes to matched filtering and parameter estimation for GW data.
- **Variational principles** runs from functional derivatives to the Einstein–Hilbert action.
- **Constrained dynamics** builds Lagrange multipliers and Dirac's primary/secondary constraints, so that the ADM Hamiltonian is literally a sum of constraints with lapse and shift as multipliers.

The verified keys include Bayes 16.7%, 5σ ⇒ p = 2.87×10⁻⁷, a matched-filter toy whose SNR (2.4) is far above the per-sample amplitude ratio (0.15), and Dirac counting giving 2 graviton degrees of freedom.

### Cited Findings
- Orderings:
  - Velleman, *How to Prove It* (3rd ed., CUP 2019): sentential logic → quantificational logic → proofs → relations → functions → induction → number theory → infinite sets. — [B: Velleman 3rd ed. (WorldCat search)](https://www.worldcat.org/search?q=Velleman+How+to+Prove+It+3rd+edition)
  - Abbott (2nd ed., 2015): real numbers → sequences and series → topology of ℝ → functional limits and continuity → derivative → sequences and series of functions → Riemann integral → additional topics, including Fourier series and metric spaces. — [B: Springer UTM](https://doi.org/10.1007/978-1-4939-2712-8)
  - Kreyszig, *Introductory Functional Analysis with Applications* (Wiley 1978): metric spaces → normed/Banach spaces → inner-product/Hilbert spaces → fundamental theorems → … → spectral theory → bounded self-adjoint operators → unbounded operators → "unbounded linear operators in quantum mechanics" (final chapter). — [B: Kreyszig, ISBN 9780471504597](https://openlibrary.org/isbn/9780471504597)
  - Blitzstein & Hwang, *Introduction to Probability* (2nd ed., CRC 2019; free online): probability and counting → conditional probability → random variables → expectation → continuous RVs → moments → joint distributions → transformations → conditional expectation → inequalities and limit theorems → Markov chains → MCMC → Poisson processes. — [B: probabilitybook.net](http://probabilitybook.net)
  - Free alternatives — [B: Hammack, *Book of Proof*](https://www.people.vcu.edu/~rhammack/BookOfProof/); [B: Lebl, *Basic Analysis*](https://www.jirka.org/ra/).
- Proof and analysis in GR research:
  - Penrose's 1965 singularity theorem is a proof by contradiction: trapped surface + energy condition + non-compact Cauchy surface ⇒ null geodesic incompleteness — [B: Penrose, PRL 14, 57 (1965)](https://doi.org/10.1103/PhysRevLett.14.57).
  - Dafermos & Luk (2017) proved the Kerr Cauchy horizon C⁰-stable, so the C⁰ formulation of strong cosmic censorship is false. This is a regularity-class (C⁰ vs C²) statement, i.e. real analysis in a frontier result — [P: arXiv:1710.01722](https://arxiv.org/abs/1710.01722) via [research_frontiers.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/research_frontiers.md).
  - Global stability of Minkowski space in harmonic gauge — [S: Lindblad & Rodnianski, math/0411109](https://arxiv.org/pdf/math/0411109).
- Functional-analysis pitfalls in QM (symmetric vs self-adjoint operators, domains, the momentum operator on a half-line) — [B: Bonneau, Faraut & Valent, Am. J. Phys. 69, 322 (2001), arXiv:quant-ph/0103153](https://arxiv.org/abs/quant-ph/0103153); [B: Gieres, Rep. Prog. Phys. 63, 1893 (2000), arXiv:quant-ph/9907069](https://arxiv.org/abs/quant-ph/9907069).
- GW data analysis:
  - GW150914 had SNR 24, a false-alarm rate below 1 per 203,000 yr (> 5.1σ), and swept 35 → 250 Hz — [P: LVK arXiv:1602.03837](https://arxiv.org/abs/1602.03837) via [black_holes_gravitational_waves.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/black_holes_gravitational_waves.md).
  - GW250114 had SNR ≈ 80 (76.9 in GWTC-5.0) — [P: same file](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/black_holes_gravitational_waves.md).
  - Bilby is a Python GW parameter-estimation library "designed to be usable by beginners" — [P: arXiv:1811.02042](https://export.arxiv.org/pdf/1811.02042).
  - PyCBC tutorials cover matched filtering and inference — [P: gwastro/PyCBC-Tutorials](https://github.com/gwastro/PyCBC-Tutorials).
  - GWOSC has a Python learning path — [P: gwosc.org/tutorials](https://gwosc.org/tutorials/) (all via [studying_gr_and_resources.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/studying_gr_and_resources.md)).
  - Pedagogical reviews — [B: Thrane & Talbot, PASA 36, e010 (2019), arXiv:1809.02293](https://arxiv.org/abs/1809.02293); [B: LIGO/Virgo, "A guide to LIGO–Virgo detector noise…", CQG 37, 055002 (2020), arXiv:1908.11170](https://arxiv.org/abs/1908.11170); FINDCHIRP matched filtering — [B: Allen et al., PRD 85, 122006 (2012), arXiv:gr-qc/0509116](https://arxiv.org/abs/gr-qc/0509116). On p-value misuse — [B: Wasserstein & Lazar, ASA statement, Am. Stat. 70, 129 (2016)](https://doi.org/10.1080/00031305.2016.1154108). Lab fitting — [B: Hogg, Bovy & Lang, arXiv:1008.4686](https://arxiv.org/abs/1008.4686); [B: Hogg & Foreman-Mackey, arXiv:1710.06068](https://arxiv.org/abs/1710.06068).
- Variational:
  - Hilbert's "Grundlagen der Physik" was submitted on 20 Nov 1915, five days before Einstein's 25 Nov paper. Hilbert is credited with the action derivation of the field equations (the Einstein–Hilbert action) — [P: MPIWG preprint P118](https://www.mpiwg-berlin.mpg.de/sites/default/files/Preprints/P118.pdf) via [history_special_relativity_spacetime.md](/home/user/Projects/research_notes/Beginners%20guide%20to%20general%20relativity/history_special_relativity_spacetime.md).
  - Carroll's notes derive Einstein's equations from S = ∫√(−g)R d⁴x — [B: Carroll notes ch. 4](https://arxiv.org/abs/gr-qc/9712019).
  - The boundary term — [B: York, PRL 28, 1082 (1972)](https://doi.org/10.1103/PhysRevLett.28.1082); [B: Gibbons & Hawking, PRD 15, 2752 (1977)](https://doi.org/10.1103/PhysRevD.15.2752).
  - Texts — [B: Gelfand & Fomin, *Calculus of Variations* (Dover)](https://openlibrary.org/isbn/9780486414485); [B: Lanczos, *The Variational Principles of Mechanics* (Dover)](https://openlibrary.org/isbn/9780486650678).
- Constrained dynamics — [B: Dirac, *Lectures on Quantum Mechanics* (Yeshiva 1964; Dover)](https://openlibrary.org/isbn/9780486417134); [B: Dirac, Can. J. Math. 2, 129 (1950)](https://doi.org/10.4153/CJM-1950-012-1); [B: Henneaux & Teitelboim, *Quantization of Gauge Systems* (Princeton 1992)](https://openlibrary.org/isbn/9780691037691); [B: ADM, arXiv:gr-qc/0405109](https://arxiv.org/abs/gr-qc/0405109); [B: Goldstein, Poole & Safko, *Classical Mechanics*, 3rd ed.](https://openlibrary.org/isbn/9780201657029); nonholonomic systems — [B: Bloch, *Nonholonomic Mechanics and Control* (Springer)](https://scholar.google.com/scholar?q=Bloch+%22Nonholonomic+Mechanics+and+Control%22).
- **Verified answer keys (G)** — [C: verify_numerics_G.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_numerics_G.py), [C: verify_final.py](/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/grmath/verify_final.py)
  - **G1:**
    - Σk = n(n+1)/2; Σk³ = n²(n+1)²/4; Σ(2k − 1) = n² (induction targets).
    - ε–δ for lim_(x→2) x² = 4 with δ = min(1, ε/5): at ε = 10⁻³ the worst case is |x² − 4| = 8.0004×10⁻⁴ < ε.
    - Classics, by hand: √2 is irrational (contradiction); n² even ⇒ n even (contrapositive).
  - **G2:**
    - x^n on [0, 1] converges pointwise to a discontinuous limit, but sup|x^n − f| = 1 for every n. At x = 1 − 1/n the values are 0.3487, 0.3660, 0.3677 → 1/e. Not uniform.
    - ∫₀¹ nx e^(−nx²) dx = (1 − e^(−n))/2 → ½, although the integrand → 0 pointwise. Limit and integral do not commute.
    - Newton's rationals 1, 3/2, 17/12, 577/408 have |q² − 2| = 1, 1/4, 1/144, 1/166464: a Cauchy sequence in ℚ with no rational limit, so ℚ is incomplete.
  - **G3:**
    - Gram–Schmidt gives {1, x, x² − 1/3} (Legendre).
    - In L²[−π, π], ‖sin‖ = √π and ⟨sin, cos⟩ = 0.
    - ‖(d/dx)e^(inx)‖/‖e^(inx)‖ = n, so d/dx is unbounded.
    - The trace of any finite-matrix commutator is 0 (numerically −7.8×10⁻¹⁶), so [X, P] = iħI has no finite-dimensional representation.
    - Parseval for sign(x): the sum of squared coefficients times π is 6.28317, against 2π.
    - Rayleigh–Ritz bound: 10 ≥ π² (E5).
  - **G4:**
    - Bayes with prevalence 1%, sensitivity 99% and false-positive rate 5%: P(D|+) = 0.1667.
    - Gaussian coverage P(|Z| < 1, 2, 3) = 0.68269, 0.95450, 0.99730.
    - One-sided p at 5σ = 2.8665×10⁻⁷, at 5.1σ = 1.698×10⁻⁷; two-sided 5σ = 5.73×10⁻⁷.
    - The 95% χ² critical value for 10 dof is 18.307.
    - Lab g values 9.79, 9.83, 9.78, 9.85, 9.81 give mean 9.812, s = 0.0286 and standard error 0.0128.
    - The weighted mean of 9.80 ± 0.02 and 9.84 ± 0.04 is 9.808 ± 0.0179.
    - Matched-filter toy: a chirp in white noise with per-sample amplitude/σ = 0.15 has optimal SNR 2.403. Over 2000 noise draws the filter output had mean 2.438 and standard deviation 1.023 (expected 1). SNR grows like √(number of samples or cycles).
    - The flat-prior amplitude posterior has sd σ/‖h‖ = 0.0624 on the grid, matching the analytic value, with mean 0.1578.
  - **G5:**
    - Euler–Lagrange for L = ½mq̇² − ½kq² gives mq̈ = −kq.
    - For the Schwarzschild geodesic Lagrangian, ∂L/∂ṫ = −(1 − 2M/r)ṫ = −E and ∂L/∂φ̇ = r²φ̇ = L (Noether charges of the cyclic t and φ).
    - Jacobi's identity δ√(−g) = −½√(−g) g_μν δg^(μν), on a random Lorentzian metric: finite difference −2.574570×10⁻⁷ against formula −2.574571×10⁻⁷.
    - Brachistochrone: E11.
  - **G6:**
    - Pendulum tension from the Lagrange multiplier: T = mg cos θ + mℓθ̇². Released from horizontal, T at the bottom = 3mg.
    - Bead on a hoop rotating at ω: the off-axis equilibrium cos θ* = g/(Rω²) exists and is stable iff Rω² > g (U″ = m(R²ω⁴ − g²)/ω² > 0). This is a pitchfork bifurcation.
    - Dirac counting:
      - EM: an 8-dim phase space per point with 2 first-class constraints gives (8 − 4)/2 = 2 DOF.
      - GR (ADM): a 12-dim phase space with 4 first-class constraints gives (12 − 8)/2 = 2.
      - GR including lapse and shift: 20 dims with 8 first-class constraints also gives 2.

### Inferences

**Order and tree (G).**
- **G1 Proof techniques** (3 lessons: logic and quantifiers; direct/contrapositive/contradiction/cases; induction and ε–δ). Prerequisite: algebra only. Start now.
- **G2 Real analysis essentials** (3: sequences, completeness and series; limits and continuity; uniform convergence and interchanging limits). Prerequisites G1, EXT.calc2.
- **G3 Functional analysis essentials** (3: normed/inner-product spaces and L²; Hilbert spaces, bases and projections; operators, adjoints and spectra in QM). Prerequisites G2, EXT.linalg, E1, E5 (soft).
- **G4 Probability and statistics** (4: probability and Bayes; distributions and limit theorems; estimation, fitting and uncertainty for labs; GW data analysis with matched filtering and Bayesian parameter estimation). Prerequisites: EXT.calc2 for lessons 1–3; E3 and F-Python for lesson 4.
- **G5 Variational principles** (2–3: functionals and functional derivatives; actions, Noether and field Lagrangians; the Einstein–Hilbert action as destination). Prerequisites E11, EXT.mech.lagrangian; EXT.tensors for lesson 3.
- **G6 Constrained dynamical systems** (3: holonomic vs nonholonomic constraints and Lagrange multipliers; Dirac's primary and secondary constraints, intuitively, via EM; ADM Hamiltonian and momentum constraints). Prerequisites G5, EXT.mech.hamiltonian. It feeds B15.

**Module cards (G).**
- **G1**
  - Hint for √2: "Assume p/q in lowest terms; show both are even."
  - Pitfalls: proving the converse instead of the contrapositive; induction without a base case; choosing δ that depends on x.
  - Visual: an ε–δ band explorer. The learner drags the ε band and must find a δ window that maps inside it; a "proof skeleton" builder uses drag-to-order statements with a keyboard alternative.
  - Why GR: the singularity theorems are proofs by contradiction [B].
- **G2**
  - Pitfalls: "pointwise limit of continuous is continuous"; swapping limits and integrals freely (verified counterexample).
  - Visual: x^n with a sup-norm band that never shrinks; a Cauchy-sequence zoom on the number line.
  - Why GR: asymptotic flatness and the ADM mass are defined by limits; PN theory is controlled Taylor expansion; strong-cosmic-censorship results hinge on regularity class [P].
- **G3**
  - Pitfalls:
    - "Hermitian = self-adjoint" (domains matter [B]).
    - Treating δ(x) or e^(ipx) as normalizable L² vectors.
    - "L² functions have values at points" (they are equivalence classes).
  - Visual: projecting f onto span{e₁…e_n} with a live L² error bar; operator "matrix" heatmaps for d/dx; the discrete Laplacian spectrum approaching n²π².
  - Why GR: the Sobolev-space energy estimates behind Choquet-Bruhat-type well-posedness; QM and quantum fields on curved spacetime (enrichment). The noise-weighted GW inner product ⟨a|b⟩ is an inner product on a function space (inference linking G3 to G4).
- **G4**
  - Pitfalls:
    - Base-rate neglect.
    - "p-value = probability the null is true" [B ASA].
    - "SNR 24 means the signal is 24× the noise" (per-sample amplitude is far below the noise; SNR accumulates, verified toy).
    - Confusing credible and confidence intervals.
  - Visual: a natural-frequency icon array for Bayes (also as a text table); a "hidden chirp" matched-filter demo where the learner slides the template mass and the SNR curve peaks at the true value; a posterior that narrows as more data streams in.
  - Why GR: every GW detection claim and every mass and spin measurement is a statistical inference [P].
- **G5**
  - Pitfalls: "action is minimized" (stationary); forgetting boundary terms; δ√(−g) sign errors (verified identity).
  - Visual: a draggable path between fixed endpoints with a live action readout, where wiggling the true path changes S only at second order; a Noether panel where a symmetry slider shows the conserved E and L.
  - Why GR: S_EH = (1/16πG)∫R√(−g)d⁴x yields G_μν = 8πGT_μν; geodesics come from stationary proper time [P].
- **G6**
  - Pitfalls: "lapse and shift are dynamical" (they have no conjugate momenta and act as multipliers); "the Hamiltonian is zero so nothing happens" (H is a sum of constraints plus a boundary term, the ADM energy); "nonholonomic constraints can be substituted away".
  - Visual: a pendulum with the constraint-force (tension) vector; a hoop-bifurcation ω slider crossing √(g/R); a "constraint counter" widget that tallies phase-space dimensions and constraints for a particle, EM and GR, ending at 2 graviton polarizations.
  - Why GR: the Hamiltonian and momentum constraints are exactly the B15 constraint equations, and in canonical quantum gravity they become the Wheeler–DeWitt constraints (enrichment) [B].

### Gaps
- I could not verify Velleman's 3rd-edition chapter list or the current URL of Hammack's free book [B].
- Detection-SNR thresholds used by LVK pipelines were not sourced this session, so the lessons should not quote a specific threshold.
- No source was fetched for the EM primary/secondary-constraint example's textbook location (Henneaux & Teitelboim chapter number unknown).

## KQ6. Cross-cutting: prerequisite graph, sequencing for this learner, and visualization/accessibility design rules

### Takeaway
The five areas form one DAG that bottoms out in Calc II, Python and algebra, which the learner has now. Four modules can start immediately: proof techniques, numerical methods F1–F3/F5/F9, probability basics and complex numbers. Fourier series follow right after Calc II series. Everything else waits on multivariable calculus, ODEs and linear algebra from the core tracks. The B15 capstone waits on the tensors track and the GR pathway's field equations. Every manipulable visual should be backed by a DOM-free module with Node tests asserting the verified keys, per the repo's convention, and should follow WCAG 2.2 (keyboard operation, non-colour encodings, pause controls, dragging alternatives).

### Cited Findings
- Repo conventions: simulation and physics code must be "testable without a browser", with state kept separate from rendering; static files, no build step, vendored dependencies, ES modules with importmaps; KaTeX is already vendored in `worldline/`. — [R: /home/user/Projects/CLAUDE.md](/home/user/Projects/CLAUDE.md)
- The repo's `geodesic/` keeps "the energy drift … on screen at all times", because "a gravity toy that silently stops conserving energy is the main way these things mislead". — [R: geodesic/README.md](/home/user/Projects/geodesic/README.md)
- Relevant WCAG 2.2 success criteria for interactive math visuals:
  - 1.1.1 Non-text Content
  - 1.4.1 Use of Color
  - 1.4.3 Contrast (Minimum)
  - 1.4.11 Non-text Contrast
  - 2.1.1 Keyboard
  - 2.2.2 Pause, Stop, Hide
  - 2.3.3 Animation from Interactions
  - 2.5.7 Dragging Movements (single-pointer alternative, new in 2.2)
  - 2.5.8 Target Size (Minimum)

  — [B: W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- Rainbow/jet colour maps distort data and exclude colour-vision-deficient readers; perceptually uniform maps are recommended — [B: Crameri, Shephard & Heron, Nat. Commun. 11, 5444 (2020)](https://doi.org/10.1038/s41467-020-19160-7); [B: Kovesi, arXiv:1509.03700](https://arxiv.org/abs/1509.03700).

### Inferences

**Prerequisite edge list** ("A → B" means A is a prerequisite of B; "(s)" marks a soft edge). EXT nodes belong to other tracks and need mapping to their IDs.
```
EXT.calc2 → B0, D1, E1, E9, G2, G4
EXT.algebra → G1
EXT.python → F1
EXT.calc3.partials → B1, D3        B0 → B1
EXT.calc3.divergence → B2 (s)      EXT.calc3.laplacian → B6
EXT.calc3.line-integrals → D5      EXT.calc3.spherical → E7
EXT.ode.first-order → B3           EXT.ode.linear2 → E5    EXT.ode → E4, F9 (s)
EXT.linalg → F6, G3                EXT.linalg.eigen → B11, E5
EXT.mech.newton → E11              EXT.mech.lagrangian → G5   EXT.mech.hamiltonian → G6, F11 (s)
EXT.tensors.bianchi → B15          EXT.tensors → G5 (lesson 3)
EXT.GR.field-equations → B15       EXT.GR.schwarzschild-metric → F14
B1 → B2, B3      B2 → B4, B5, B6      B3 → B4, B11, B12
B4, B5, B6 → B7, B11      B7 → B8, B10      E1 → B8      E8 → B8.polar      E7 → B8.spherical (s)
B5, E3 → B9      B6 → B10, D10      E10 → B10 (s)
B11 → B13, B12 (s)      B4, B5, B6 → B13      G2 → B13 (s)
B4, B5, F9 → B14      B14 → F12
B13, B14, G6 → B15      F13 → B15 (s)
D1 → D2 → D3 → D4 → D5 → D6 → D7 → D8 → D9      G2 → D7 (s)      D3 → D10      D9, E3, E4 → D11      B10 → D11 (s)
E1 → E2, E3      G2 → E2 (lesson 2)      E3 → E4      E1 → E5 → E6, E8, E10      E6, B8 → E7      E6 → E12      F4, F5 → E12
F1 → F2 → F3, F4      F4 → F5      F2 → F6 → F7, F8      F5 → F9 → F10, F11, F13      F9 → F12      F5 → F13
F10, F11, F13 → F14      D11 → F14 (s, QNM bonus)
G1 → G2 → G3      E1 → G3      E5 → G3 (s)      E3 → G4 (lesson 4)      E11 → G5 → G6
```

**Sequencing for this learner.**
- **Phase 0 — now: Calc II + Physics I + Python.** G1; F1, F2, F3, F5 (quadrature), F9 (projectile and Kepler ODEs as systems); G4 lessons 1–2; D1; E1 (visual "sums of sines", after the Calc II series unit); E9 (Γ as an improper integral).
- **Phase 1 — with Calc III, ODE and linear algebra in the core.** G2; B0–B3; E2; F4, F6–F8, F10, F11; F14 Levels 1–2, timed right after the GR pathway's Schwarzschild orbits unit, as a motivating early win.
- **Phase 2.** B4–B10; E3–E8, E10, E11; D2–D9; F12, F13; G5.
- **Phase 3.** B11–B14; D10–D11; E12; G3; G4 lessons 3–4; G6; F14 Level 3.
- **Phase 4.** The B15 capstone, synchronized with the GR pathway's field equations and the tensors track's Bianchi identity.

**Lesson-template mapping** (intro → manipulable visual → worked example → 4–8 practice problems → checkpoint quiz).
- Each module's verified keys supply the worked example plus 2–4 parameterized practice templates.
- Randomize parameters inside ranges where the closed form holds: D9 with a > 0 and k ≥ 0; B12 with Gaussian widths; F3 with eccentricities below 0.95.
- Grade numerics with relative tolerances (e.g., 10⁻⁶ for closed forms, 1% for simulation readouts) and symbolic answers by equivalence (sympy-like simplification on the server, or numeric spot-evaluation at random points in the browser).
- Every hint should be one actionable step, and every micro-teach one sentence naming the principle (see the B1, E1 and G1 samples).

**Visualization rules.**
1. Each visual has a DOM-free engine with a Node test asserting the verified keys above, e.g. Bessel ratios, the CFL threshold, Gibbs 1.17898, ISCO and b_c.
2. Always show a numeric readout or table next to any colour field, and use cividis/viridis-class sequential and cyclic perceptually uniform maps. Phase portraits overlay modulus and phase contours so that hue is never the only channel.
3. Every draggable has keyboard steppers and a numeric input (WCAG 2.5.7/2.1.1). Animations have pause controls and respect prefers-reduced-motion.
4. Show the conserved quantity or error monitor on screen whenever something is integrated: the energy drift, ‖C‖ or u·u.
5. Offer sonification where it carries meaning: drum overtones, string harmonics, GW chirps.

### Gaps
- I do not know the IDs or contents of the other Advanced Mathematics tracks (A, C, other G modules) or of the GR pathway. The EXT node names above are placeholders the writer must map.
- No user-testing evidence was gathered on which of these visuals best help a visual learner; the designs are reasoned from the cited pedagogy and the computations.
