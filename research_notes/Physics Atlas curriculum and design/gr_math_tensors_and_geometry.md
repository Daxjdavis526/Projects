# The Mathematics of Spacetime (Physics Atlas): Advanced Math A (Vector & Tensor Analysis), Advanced Math C (Differential Geometry), and selected Advanced Math G modules (topology, abstract linear algebra, groups & Lie theory, symmetry groups, differential forms, coordinate invariance, signature conventions, natural/geometrized units)

> **Conventions used for every worked answer in this file. I recommend them as the single convention set for the whole app.** These are Carroll's conventions. They agree with MTW, Wald, Schutz and Hartle on all three MTW signs (see §3).
> - Signature (−,+,+,+). Coordinates are ordered (t,x,y,z) or (t,r,θ,φ). Greek indices run 0–3 and Latin indices 1–3. A repeated index, once up and once down, is summed.
> - Γ^λ_{μν} = ½ g^{λσ}(∂_μ g_{νσ} + ∂_ν g_{σμ} − ∂_σ g_{μν}), symmetric in the lower indices. ∇_μV^ν = ∂_μV^ν + Γ^ν_{μλ}V^λ and ∇_μω_ν = ∂_μω_ν − Γ^λ_{μν}ω_λ.
> - R^ρ_{σμν} = ∂_μΓ^ρ_{νσ} − ∂_νΓ^ρ_{μσ} + Γ^ρ_{μλ}Γ^λ_{νσ} − Γ^ρ_{νλ}Γ^λ_{μσ}, which is equivalent to [∇_μ,∇_ν]V^ρ = R^ρ_{σμν}V^σ. Contractions: R_{μν} = R^λ_{μλν}, R = g^{μν}R_{μν} and G_{μν} = R_{μν} − ½Rg_{μν}. Geodesic deviation: D²S^μ/dτ² = R^μ_{νρσ}T^νT^ρS^σ.
> - T_{(μν)} = ½(T_{μν}+T_{νμ}) and T_{[μν]} = ½(T_{μν}−T_{νμ}). The wedge product is dx∧dy = dx⊗dy − dy⊗dx. The Levi-Civita tensor has ε_{0123} = +√|g|, and the Hodge star is (⋆A)_{μ1…μ(n−p)} = (1/p!) ε^{ν1…νp}_{μ1…μ(n−p)} A_{ν1…νp}.
> - Spherical coordinates (r,θ,φ) use θ = polar angle from +z and φ = azimuth. This is the physics/ISO order, the reverse of most US calculus books. Frenet torsion is defined by B′ = −τN. The second fundamental form uses the normal n = X_u×X_v/|X_u×X_v|, and each example states it.
> - Units: c = 1 from the first Minkowski lesson onward. G stays explicit until the G-UNITS module; after that, G-facing examples use G = c = 1 (geometrized units).
>
> **How the evidence was gathered, and the tags used.**
> - In this session the sandbox egress policy blocked page fetching. Every host I tried (arxiv.org, wikipedia.org, ocw.mit.edu, damtp.cam.ac.uk and others) failed with CONNECT 403 or a DNS error. The shared web-search budget ran out after a single query (Needham).
> - **[live]** means the source was retrieved in this session.
> - **†** means a canonical text or page cited from domain knowledge. I could *not* re-open it in this session, so chapter titles, section locations and figure references should be spot-checked.
> - **[V]** means I **recomputed the formula or value in this session** and confirmed it, using exact computer algebra (sympy 1.14) or RK4 numerics. Every answer key below carries [V] unless it is marked "hand-derived". The core routine is reproduced in §3 so the app team can regenerate the keys as unit-test fixtures.

## 1. Advanced Math A — Vector and Tensor Analysis: best pedagogical order, module → submodule tree, and the concrete calculations to master

### Takeaway
Schutz and Carroll teach tensors in the same order, and the app should follow it:
1. Flat space first.
2. Geometric objects before their components.
3. Covectors (gradients drawn as stacks of level lines) before the metric.
4. The metric introduced as the converter between vectors and covectors.
5. Curvilinear coordinates in the flat plane (polar, then spherical) as the main laboratory.
6. The covariant derivative in flat space last. Every answer can then be checked against Cartesian "ground truth" before curvature arrives in Math C.

This gives 10 modules (A1–A10, about 52 short lessons) with 20 must-master calculations, each verified [V].

### Cited Findings
- Schutz builds tensor analysis in flat spacetime first. Ch. 2 covers vectors. Ch. 3 covers tensors: one-forms are defined as linear functions of vectors, pictured as families of surfaces, with the gradient as the archetypal one-form, and the metric is introduced as the map between vectors and one-forms. Ch. 5, "Preface to curvature", then redoes everything in **polar coordinates in the flat plane**: position-dependent basis vectors, Christoffel symbols, the covariant derivative, divergence and the Laplacian. Only then does ch. 6 ("Curved manifolds") begin. — † Book: B. Schutz, *A First Course in General Relativity*, 2nd ed., CUP 2009, chs. 2, 3, 5, 6.
- Carroll's ch. 1 covers special relativity and tensors in flat spacetime: vectors, dual vectors, tensors, index manipulation, Einstein summation and Lorentz transformations. Ch. 2 covers manifolds (vectors as directional derivatives, dual vectors, tensors, the metric, differential forms). Ch. 3 covers curvature. — † [Carroll, *Lecture Notes on General Relativity*, gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019); same sequence in the book *Spacetime and Geometry* (Addison-Wesley 2004; CUP reissue 2019).
- MTW pictures a one-form as a family of surfaces. The contraction ⟨ω, v⟩ is the number of surfaces the arrow v pierces, an operation that needs no metric. — † Book: Misner, Thorne & Wheeler, *Gravitation* (1973), ch. 2.
- In an oblique basis there are two kinds of components. Contravariant components come from the parallelogram (parallel-projection) rule; covariant components are dot products with the basis vectors. The first kind transforms with the inverse of the basis change, the second like the basis itself. — † [Wikipedia: Covariance and contravariance of vectors](https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors)
- Einstein summation: a repeated index, once up and once down, means a sum, and free indices must match on both sides of an equation. — † [Wikipedia: Einstein notation](https://en.wikipedia.org/wiki/Einstein_notation); † [Carroll notes ch. 1](https://arxiv.org/abs/gr-qc/9712019)
- Hartle is "physics first". Metrics, geodesics and their physical consequences are used for many chapters before the full tensor machinery appears late in the book. This supports offering early "preview" calculations with a given metric before the formalism is complete. — † Book: J. Hartle, *Gravity: An Introduction to Einstein's General Relativity*, Addison-Wesley 2003.
- I recomputed all Math A answer keys in this session (K-A0…K-A20 in §3) [V]. They cover the polar, cylindrical and spherical metrics and their inverses, Christoffel symbols, component transformations, contractions, scalar checks, covariant derivatives, the divergence, the Laplacian, polar acceleration and Lorentz invariants.

### Inferences
#### Recommended order and the reason for each step
1. **Objects before components (A1).** An arrow is the same arrow in every basis; only its components change. This is the seed of coordinate invariance.
2. **Index grammar, early but light (A2).** Practise Einstein summation on things the learner already knows: matrix products, traces and dot products.
3. **Covectors before the metric (A3).** Introduce df as a stack of level lines, and the pairing ω(V) = ω_μV^μ, with no metric anywhere. If lower indices first appear as "metric-lowered vectors", learners never see why covectors are separate objects or why ⟨ω,V⟩ needs no metric. This is the Schutz/MTW order.
4. **Transformations with the Jacobian (A4).** Work Cartesian ↔ polar, where every answer can be checked by drawing.
5. **Tensors as multilinear machines (A5).** Cover the tensor product, contraction and (anti)symmetry. Run G-LIN (abstract multilinear algebra) in parallel as support, not as a gate.
6. **The metric (A6).** Line elements; the polar, cylindrical and spherical metrics; the inverse metric; the volume element √|g|. Then present η as "a metric with one minus sign", so signature appears early and gently.
7. **Raising and lowering (A7),** only after vectors and covectors are both solid.
8. **Tensor fields and coordinate bases (A8).** ∂_r and ∂_θ change from point to point. Distinguish coordinate components from orthonormal ("physical") components.
9. **The covariant derivative in flat space (A9).** Partial derivatives of components fail: the constant field ∂_x has ∂_μV^ν ≠ 0 in polar coordinates. Christoffel symbols repair this, giving ∇. Everything here can be checked against Cartesian truth (Schutz ch. 5's strategy).
10. **Capstone lab (A10).** A full spherical-coordinates workup, Lorentz-boost invariants, an "is it a scalar?" clinic, and the bridge question "what if no Cartesian chart exists anywhere?", which leads into Math C.

**Just-in-time dependency.** The learner is in Calc II. A4, A6 and A9 need multivariable partial derivatives, the multivariable chain rule, Jacobian matrices and determinants, and double integrals in polar coordinates. Put a "Calc III mini-primer" before A4, or a hard prerequisite edge to the core-math track (another researcher's scope).

#### Module → submodule tree (Advanced Math A; lesson counts in brackets)
- **A1 Scalars, vectors and bases [4]**
  - A1.1 What a scalar is, and why "the x-component" is not one.
  - A1.2 Arrows, bases and components: rotate the basis and the arrow stays put.
  - A1.3 Skewed bases: parallelogram components versus projection components (first sight of upper vs lower).
  - A1.4 Matrices as linear maps; change-of-basis matrices.
- **A2 Index notation [4]**
  - A2.1 Indices are labels: x² means "coordinate number 2".
  - A2.2 Einstein summation; free vs dummy indices; renaming dummies.
  - A2.3 Kronecker delta; the matrix product (AB)^μ_ν = A^μ_λB^λ_ν; the trace A^μ_μ.
  - A2.4 Levi-Civita symbol, cross product, ε–δ identity (Euclidean only).
- **A3 Dual vectors (covectors / one-forms) [4]**
  - A3.1 The gradient df as a rate-of-change machine: df(V) = V^μ∂_μf.
  - A3.2 Dual space and dual basis: e^μ(e_ν) = δ^μ_ν.
  - A3.3 Stacks of level surfaces: ω(V) is the number of surfaces pierced.
  - A3.4 Dual basis of a skewed basis: each dual vector is perpendicular to the *other* basis vectors.
- **A4 Coordinate transformations [6]**
  - A4.1 Coordinates as labels; the Jacobian ∂x′^μ/∂x^ν.
  - A4.2 Contravariant law V′^μ = (∂x′^μ/∂x^ν)V^ν, with the velocity dx^μ/dλ as the model.
  - A4.3 Covariant law ω′_μ = (∂x^ν/∂x′^μ)ω_ν, with the gradient as the model.
  - A4.4 Basis vectors ∂_μ and basis covectors dx^μ transform oppositely to components, so V = V^μ∂_μ is invariant.
  - A4.5 Worked lab: Cartesian ↔ polar.
  - A4.6 The linear special case: rotations and Lorentz boosts.
- **A5 Tensors [8]**
  - A5.1 (k,l) tensors as multilinear machines; type versus rank.
  - A5.2 Tensor products and component arrays.
  - A5.3 The general transformation law: one Jacobian factor per index.
  - A5.4 "A matrix is not a tensor": the same array read as (1,1) versus (0,2).
  - A5.5 Contraction, and why it produces a tensor.
  - A5.6 Symmetric and antisymmetric parts; S^{μν}A_{μν} = 0; counting n(n±1)/2 components.
  - A5.7 "Is it a scalar?" clinic.
  - A5.8 Quotient theorem (optional).
- **A6 The metric tensor [7]**
  - A6.1 g(U,V) = g_{μν}U^μV^ν generalizes the dot product.
  - A6.2 Line elements; reading g off ds²; arc length (Calc II link).
  - A6.3 Metrics by pull-back, g′ = JᵀJ: polar, cylindrical, spherical.
  - A6.4 The inverse metric g^{μν}.
  - A6.5 The volume element √|g|: disk area, ball volume.
  - A6.6 Minkowski η = diag(−1,1,1,1): the interval; timelike, null and spacelike; proper time.
  - A6.7 Coordinate bases versus orthonormal bases ("physical components").
- **A7 Raising and lowering indices [5]**
  - A7.1 V_μ = g_{μν}V^ν and ω^μ = g^{μν}ω_ν.
  - A7.2 Lowering ∂_x with the polar metric gives exactly dx; lowering in Minkowski space flips the sign of the time component.
  - A7.3 Gradient vector versus gradient covector: why the θ̂ term carries 1/r.
  - A7.4 Index order in mixed tensors.
  - A7.5 g^{μν}g_{μν} = n.
- **A8 Tensor fields [4]**
  - A8.1 Scalar, vector, covector and metric fields.
  - A8.2 Coordinate basis fields vary from point to point (|∂_θ| = r).
  - A8.3 Fields transform point by point.
  - A8.4 GR preview: g_{μν}(x) *is* the gravitational field.
- **A9 The covariant derivative in flat curvilinear coordinates [7]**
  - A9.1 The failure: ∂_μV^ν is not a tensor.
  - A9.2 Differentiating the basis: ∂_μe_ν = Γ^λ_{μν}e_λ.
  - A9.3 ∇ acting on vectors, covectors and general tensors.
  - A9.4 Christoffel symbols from the metric.
  - A9.5 Divergence, Laplacian and acceleration in polar coordinates. Physics I link: the centripetal and Coriolis-like terms *are* the Christoffel terms.
  - A9.6 Γ is not a tensor.
  - A9.7 ∇g = 0.
- **A10 Capstone: tensor toolkit lab [3]**
  - A10.1 Spherical coordinates end to end.
  - A10.2 Lorentz boosts and the field invariants F_{μν}F^{μν} and F_{μν}⋆F^{μν}.
  - A10.3 Bridge to Math C: a space with no Cartesian chart anywhere.

#### The 20 must-master calculations (answer keys in §3, all [V])
1. The polar Jacobian and its inverse.
2. The components of ∂_x and dx in polar coordinates.
3. Showing that dx(∂_x) = 1 in both coordinate systems.
4. g_{μν}, g^{μν} and √g for polar, cylindrical and spherical coordinates.
5. Lowering ∂_x with the polar metric and recognizing the result as dx.
6. Transforming the (0,2) tensor dx⊗dx to polar coordinates.
7. Index gymnastics: S^{μν}A_{μν} = 0, δ^μ_μ = n, g^{μν}g_{μν} = n.
8. The polar and spherical Christoffels, obtained both from the metric and from the transformation law.
9. Showing ∇_μV^ν = 0 for V = ∂_x in polar coordinates even though ∂_μV^ν ≠ 0.
10. Showing ∇_μ(dx)_ν = 0.
11. The divergence formula ∇_μV^μ = (1/√g)∂_μ(√gV^μ); for example, div(r∂_r) = 2.
12. The Laplacian in polar and spherical coordinates.
13. Polar acceleration components from Γ.
14. u^μu_μ = −1 for any 4-velocity.
15. A boost satisfies ΛᵀηΛ = η, and collinear rapidities add.
16. F_{μν}F^{μν} = 2(B²−E²) and F_{μν}⋆F^{μν} = 4E·B are unchanged by a boost.
17. Γ^μ_{μλ} = ∂_λ ln√g.
18. Orthonormal versus coordinate components: V^θ̂ = rV^θ.
19. Arc length from ds².
20. Areas and volumes via √g.

### Gaps
- I could not re-open Schutz, Carroll or MTW in this session to confirm chapter titles or exactly where the polar-coordinate worked examples sit, so those attributions are † (domain knowledge). The formulas themselves were verified independently [V].
- I found no empirical study comparing learning outcomes for "covectors before the metric" against "metric first". None could be searched for because the budget was exhausted. The recommendation rests on textbook practice and on the misconception it prevents.

## 2. Advanced Math C — Differential Geometry: best order (classical surfaces first vs abstract manifolds first), module tree, and why each object matters in GR

### Takeaway
Use a **classical-surfaces-first spiral**, in four phases:
1. **Classical surfaces (C1–C6).** Following Needham and do Carmo: curves → surfaces → extrinsic curvature → intrinsic curvature and the Theorema Egregium → geodesics → parallel transport, holonomy and Gauss–Bonnet. This phase supplies a picture for every intrinsic concept, and the Theorema Egregium gives the conceptual licence to drop the embedding, which GR requires.
2. **Abstract manifolds (C7–C10).** Following Lee, Tu and Carroll ch. 2, including Lorentzian metrics.
3. **Connections and curvature in n dimensions and Lorentzian signature (C11–C16).** The Carroll ch. 3 / Schutz ch. 6 computational style.
4. **Symmetry and synthesis (C17–C18).** Lie derivatives, Killing vectors and a capstone.

That is 18 modules and about 87 lessons, which makes it one of the most thorough courses in the app.

### Cited Findings
- **Needham, *Visual Differential Geometry and Forms: A Mathematical Drama in Five Acts* (Princeton UP 2021) [live]:**
  - Act I, "The Nature of Space", covers Euclidean and non-Euclidean geometry and Gaussian curvature.
  - Act II, "The Metric", covers mapping surfaces, the pseudosphere and hyperbolic plane, and isometries and complex numbers.
  - Act III is "Curvature".
  - Listings describe the book as including four geometrical proofs of the global Gauss–Bonnet theorem, a geometrical proof of the Theorema Egregium, and geometrical treatments of the Riemann tensor and of Einstein's field equation. The search summary attributed this content to Act IV.
  - Act V (Forms) has seven chapters: 1-forms, tensors, 2-forms, 3-forms, differentiation, integration, and differential geometry via forms. Six of the seven can be read independently of the rest of the book.
  - Sources: [IMSC library record](https://library.imsc.res.in/bib/59282); [i-programmer review](https://www.i-programmer.info/bookreviews/65-mathematics/15387-visual-differential-geometry-and-forms.html); [Hatchards listing](https://www.hatchards.co.uk/book/visual-differential-geometry-and-forms/tristan-needham/9780691203690); [Mathematical Gazette review](https://www.cambridge.org/core/journals/mathematical-gazette/article/abs/visual-differential-geometry-and-forms-a-mathematical-drama-in-five-acts-by-tristan-needham-pp-501-40-paper-isbn-9780691203706-princeton-university-press-2021/E16CF3EF399180490399594B2F7B121A). The searches did not return Act IV's title; from domain knowledge it is "Parallel Transport" (†).
- do Carmo's *Curves and Surfaces* runs: ch. 1 curves (Frenet) → ch. 2 regular surfaces → ch. 3 the geometry of the Gauss map (second fundamental form, Gaussian and mean curvature) → ch. 4 intrinsic geometry (isometries, the Theorema Egregium, parallel transport, geodesics, Gauss–Bonnet) → ch. 5 global geometry. His *Riemannian Geometry* then assumes surfaces and runs: differentiable manifolds → Riemannian metrics → affine and Riemannian connections → geodesics → curvature → Jacobi fields. — † Books: M. do Carmo, *Differential Geometry of Curves and Surfaces* (1976; 2nd ed. Dover 2016); *Riemannian Geometry* (Birkhäuser 1992).
- Lee's *Introduction to Smooth Manifolds* is manifolds-first and rigorous: topological manifolds → smooth structures → smooth maps → tangent vectors → … → vector fields, integral curves and flows (Lie derivatives) → cotangent bundle → tensors → Riemannian metrics → differential forms → orientation → integration → de Rham cohomology. It assumes point-set topology. His *Introduction to Riemannian Manifolds* runs: metrics → model spaces → connections → Levi-Civita → geodesics and distance → curvature → submanifolds → Gauss–Bonnet → Jacobi fields → comparison theory. — † Books: J. M. Lee, *Introduction to Smooth Manifolds*, 2nd ed., GTM 218 (2013); *Introduction to Riemannian Manifolds*, 2nd ed., GTM 176 (2018).
- Tu is a gentler manifolds-first introduction with fewer topology prerequisites. — † Book: L. Tu, *An Introduction to Manifolds*, 2nd ed., Springer 2011.
- Carroll's book, ch. 3 "Curvature", runs: covariant derivatives → parallel transport and geodesics → properties of geodesics → Riemann tensor → its properties → symmetries and Killing vectors → maximally symmetric spaces → geodesic deviation. Maps between manifolds and Lie derivatives sit in appendices (A, B), as do Stokes's theorem and noncoordinate bases. — † Book: S. Carroll, *Spacetime and Geometry* (section titles from memory); notes: † [gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019)
- Schutz's *Geometrical Methods of Mathematical Physics* puts Lie derivatives, Lie groups and differential forms *before* connections. It runs: basic mathematics → manifolds and tensors → Lie derivatives and Lie groups → differential forms → applications → connections. — † Book: B. Schutz, CUP 1980.
- Wald is rigorous and uses abstract index notation: manifolds and tensor fields (ch. 2), then curvature (ch. 3). Appendices cover topological spaces, differential forms and integration, and Lie derivatives and Killing fields. — † Book: R. Wald, *General Relativity*, U. Chicago Press 1984.
- MTW is "affine before metric". Ch. 10 covers geodesics, parallel transport and the covariant derivative; ch. 11 geodesic deviation and curvature; ch. 13 "Riemannian geometry: metric as foundation of all"; ch. 14 calculation of curvature; ch. 15 "Bianchi identities and the boundary of a boundary". The book is split into Track 1 and Track 2. — † Book: MTW (1973).
- Tong opens with geodesics in given spacetimes (physics first), then introduces differential geometry (manifolds, tangent spaces, Lie derivatives, forms), then Riemannian geometry (metric, connections, curvature). — † [Tong, *Lectures on General Relativity*](https://www.damtp.cam.ac.uk/user/tong/gr.html)
- Theorema Egregium: Gaussian curvature depends only on the first fundamental form, so it is invariant under local isometries. A cylinder (K = 0) can be unrolled onto a plane; a sphere (K > 0) cannot be mapped isometrically onto a plane. — † [Wikipedia: Theorema Egregium](https://en.wikipedia.org/wiki/Theorema_Egregium). Verified [V]: the cylinder has K = 0 although H ≠ 0, and the sphere has K = 1/a².
- The catenoid and helicoid are locally isometric minimal surfaces: there is an isometric deformation through a one-parameter "associate family". — † [Wikipedia: Catenoid](https://en.wikipedia.org/wiki/Catenoid). Verified [V]: both have I = c²cosh²(v/c)du² + cosh²(v/c)dv², K = −1/(c²cosh⁴(v/c)) and H = 0. The associate family X_α = cos α·(helicoid) + sin α·(catenoid) (c = 1) has an α-independent first fundamental form, with K = −1/cosh⁴v and H = 0.
- Gauss–Bonnet: ∬_R K dA + ∮ k_g ds + Σ(exterior angles) = 2πχ(R). For a closed surface, ∬K dA = 2πχ. — † [Wikipedia: Gauss–Bonnet theorem](https://en.wikipedia.org/wiki/Gauss%E2%80%93Bonnet_theorem). Verified [V]: sphere 4π (χ = 2); torus 0 (χ = 0); a polar cap gives 2π(1−cosθ₀) + 2πcosθ₀ = 2π (disk, χ = 1).
- Riemann has n²(n²−1)/12 independent components (1, 6 and 20 in dimensions 2, 3, 4). The local-flatness count gives 100 second derivatives of g_{μν} minus 80 coordinate freedoms = 20. — † [Carroll notes chs. 2–3](https://arxiv.org/abs/gr-qc/9712019). Verified [V] by computing the null space of the Riemann-symmetry constraints: 1, 6, 20.

### Inferences
#### Surfaces-first vs manifolds-first: verdict for this learner
| Approach (exemplars) | Strengths | Weaknesses for a Calc II, visual learner heading to GR |
|---|---|---|
| Classical surfaces first (Needham; do Carmo C&S → RG) | Every concept gets a picture: tangent planes, geodesics, holonomy, the Gauss map. Calc III-level prerequisites. The Theorema Egregium motivates intrinsic geometry. | Risk that "curvature = bending" sticks. Riemannian only. 2D special cases (one Riemann component, R = 2K, G ≡ 0) can be over-generalized. |
| Abstract manifolds first (Lee, Tu, Wald; Carroll ch. 2) | Directly general, coordinate-free, GR-ready. | Few pictures and a steep abstraction jump. Needs point-set topology first. Motivation for definitions is hidden. |
| Physics-first (Hartle; Tong ch. 1) | Strong motivation: compute geodesics in a given metric right away. | Math is rationed and arrives late; not a math course in itself. |
| Affine-before-metric (MTW) | Shows that parallel transport and curvature do not need a metric. | Conceptually elegant but cognitively heavy for a beginner. |
| Forms-forward (Schutz GM; Baez & Muniain; Needham Act V) | Unifies vector calculus and Stokes; elegant computations. | Can delay the metric and curvature that GR needs first. |

**Recommendation: a four-phase spiral.**
- **Phase I, classical surfaces (C1–C6).** Learners meet the metric (first fundamental form), Christoffels on surfaces, geodesics, parallel transport, holonomy and K with pictures.
- **Phase II, manifolds (C7–C10).** Throw away the ambient space, introduce charts, tangent spaces as derivations, forms on manifolds, and Lorentzian metrics.
- **Phase III, machinery (C11–C16).** Connection, curvature, Bianchi identities and geodesic deviation in n dimensions, with 4D Lorentzian examples.
- **Phase IV (C17–C18).** Lie derivatives, Killing vectors and a capstone.

Three guards:
1. Flag every 2D-only fact (pitfall P30).
2. Introduce 1+1 Lorentzian examples (Rindler, 1+1 FLRW) as soon as C10, so Riemannian intuition is broken early.
3. Place "why in GR" hooks in Phase I. For example, C4 makes the point that spacetime curvature is intrinsic, and C6 uses the cosmic-string deficit angle.

Placement of the material on flows: put flows and the vector-field bracket in C8, because [X,Y] appears in the torsion and curvature definitions. Put Lie derivatives of tensors and Killing vectors in C17, after the connection, so Killing's equation can be written with ∇. Carroll's book uses Killing vectors in ch. 3 and keeps Lie derivatives in an appendix (†).

#### Module tree (Advanced Math C; lesson counts in brackets)
**Phase I: classical curves and surfaces**
- **C1 Curves [5]**
  - C1.1 Parameterized curves, velocity, regularity.
  - C1.2 Arc length and unit-speed reparametrization.
  - C1.3 Curvature κ and the osculating circle.
  - C1.4 Torsion τ, the Frenet frame (T,N,B) and the Frenet–Serret equations T′ = κN, N′ = −κT + τB, B′ = −τN.
  - C1.5 Computational formulas κ = |r′×r″|/|r′|³ and τ = (r′×r″)·r‴/|r′×r″|².
- **C2 Surfaces and parameterizations [4]**
  - C2.1 Parametric surfaces X(u,v): sphere, cylinder, cone, torus, graphs, surfaces of revolution.
  - C2.2 Tangent plane span{X_u, X_v}; unit normal; tangent vectors as velocities of curves on the surface.
  - C2.3 First fundamental form I = E du² + 2F du dv + G dv²: lengths, angles, area √(EG−F²).
  - C2.4 Isometries; why no flat map of the Earth is distortion-free.
- **C3 Extrinsic curvature [4]**
  - C3.1 Normal curvature; second fundamental form II = L du² + 2M du dv + N dv²; the shape operator.
  - C3.2 Principal curvatures and directions (eigenvalues and eigenvectors of the shape operator).
  - C3.3 K = κ₁κ₂ = (LN−M²)/(EG−F²) and H = (κ₁+κ₂)/2; elliptic, hyperbolic and parabolic points.
  - C3.4 The Gauss map: K as the area-distortion ratio of the normals.
- **C4 Intrinsic curvature and the Theorema Egregium [4]**
  - C4.1 The ant's-eye view: circumference deficit C(ρ) = 2πρ − πKρ³/3 + … and triangle angle excess.
  - C4.2 The Theorema Egregium; K from E, F, G alone (orthogonal-coordinate formula).
  - C4.3 Examples: cylinder, sphere, torus; catenoid and helicoid.
  - C4.4 Consequences: the orange peel, the "pizza-slice" stiffening; spacetime curvature is intrinsic.
- **C5 Geodesics on surfaces [5]**
  - C5.1 Straightest curves: geodesic curvature k_g = 0.
  - C5.2 The geodesic equation from the metric (Christoffels of a surface).
  - C5.3 Shortest paths and the energy functional (Euler–Lagrange, a Physics I link).
  - C5.4 Examples: sphere, cylinder (unroll), cone (unroll), hyperbolic plane, torus.
  - C5.5 Clairaut's relation as a symmetry-generated conserved quantity (a preview of Killing vectors).
- **C6 Parallel transport, holonomy and Gauss–Bonnet [6]**
  - C6.1 Levi-Civita transport on a surface: the tangential change is zero.
  - C6.2 Path dependence: the latitude-circle example.
  - C6.3 Holonomy around geodesic triangles = angle excess = ∬K dA.
  - C6.4 Local Gauss–Bonnet with geodesic curvature and corners.
  - C6.5 Global Gauss–Bonnet: ∬K dA = 2πχ (χ = 2 − 2g).
  - C6.6 Cones and deficit angles: curvature concentrated at a point.

**Phase II: manifolds and metrics**
- **C7 Manifolds [5]**
  - C7.1 Why drop the ambient space?
  - C7.2 Charts, atlases and transition maps: S¹ needs two charts; S² via stereographic projection.
  - C7.3 Smooth manifolds; examples and non-examples (figure-eight; line with two origins).
  - C7.4 Smooth maps and diffeomorphisms.
  - C7.5 Coordinate singularities versus real ones: the poles of (θ,φ); preview of r = 2M with a finite Kretschmann scalar.
- **C8 Tangent and cotangent spaces [6]**
  - C8.1 Tangent vectors as velocities of curves and as directional derivatives.
  - C8.2 T_pM: one vector space per point, with no free comparison between points.
  - C8.3 T*_pM, df and dx^μ(∂_ν) = δ^μ_ν.
  - C8.4 Tensor fields on manifolds; the tangent bundle (light).
  - C8.5 Pushforward and pullback; induced metrics.
  - C8.6 Vector fields, flows and the bracket [X,Y]; coordinate versus non-coordinate frames.
- **C9 Differential forms on manifolds [4]** (the Rⁿ calculus is in G-FORMS)
  - C9.1 p-forms as antisymmetric tensor fields; wedge.
  - C9.2 Exterior derivative on manifolds; pullback commutes with d.
  - C9.3 Orientation, integration and Stokes on manifolds.
  - C9.4 The metric volume form √|g| dⁿx and the Hodge star.
- **C10 Riemannian and pseudo-Riemannian metrics [5]**
  - C10.1 The metric as a smoothly varying inner product; signature.
  - C10.2 Lengths, angles, volumes and proper time.
  - C10.3 Light cones and causal character.
  - C10.4 Example zoo: polar plane, sphere, hyperbolic plane (half-plane and hyperboloid), Rindler, 1+1 FLRW, Schwarzschild preview.
  - C10.5 Local flatness: Riemann normal coordinates and the 100 − 80 = 20 count.

**Phase III: connection and curvature**
- **C11 Connections and covariant differentiation [6]**
  - C11.1 Why a connection is needed.
  - C11.2 Axioms; Γ and its inhomogeneous transformation law.
  - C11.3 Torsion and metric compatibility.
  - C11.4 Fundamental theorem: the unique Levi-Civita connection; derivation of the Christoffel formula.
  - C11.5 ∇ on all tensor types; the divergence identity.
  - C11.6 Computation lab.
- **C12 Parallel transport and geodesics in general [5]**
  - C12.1 The transport equation; transport preserves inner products.
  - C12.2 The geodesic equation and affine parameters.
  - C12.3 The Lagrangian shortcut for computing Γ.
  - C12.4 Timelike geodesics maximize proper time.
  - C12.5 The exponential map and normal coordinates (light).
- **C13 The Riemann curvature tensor [6]**
  - C13.1 Small-loop holonomy as the meaning of curvature.
  - C13.2 Commutator definition.
  - C13.3 Component formula.
  - C13.4 Symmetries and component counting.
  - C13.5 Example computations; flatness tests.
  - C13.6 2D and maximally symmetric forms.
- **C14 Ricci tensor, Ricci scalar, Einstein tensor, sectional curvature [5]**
  - C14.1 Ricci and its "volume" meaning.
  - C14.2 Ricci scalar examples.
  - C14.3 Sectional curvature.
  - C14.4 The Einstein tensor; why gravity is trivial in 2D and has no local degrees of freedom in 3D.
  - C14.5 Weyl tensor (brief).
- **C15 Bianchi identities [3]**
  - C15.1 Algebraic (first) identity.
  - C15.2 Differential (second) identity; "the boundary of a boundary is zero".
  - C15.3 Contracted identity ∇^μG_{μν} = 0 and conservation.
- **C16 Geodesic deviation [4]**
  - C16.1 Families of geodesics and the separation vector.
  - C16.2 The deviation equation.
  - C16.3 Sphere, hyperbolic plane and flat examples.
  - C16.4 Tidal acceleration and the Newtonian limit (link to the GR track).

**Phase IV: symmetry and synthesis**
- **C17 Lie derivatives and Killing vectors [7]**
  - C17.1 Flows and dragging.
  - C17.2 Lie derivative of functions, vectors (L_XY = [X,Y]) and covectors.
  - C17.3 Lie derivative of the metric.
  - C17.4 Lie derivative versus covariant derivative.
  - C17.5 Killing's equation; examples (plane, S², Minkowski).
  - C17.6 Conserved quantities along geodesics.
  - C17.7 Killing algebras and maximal symmetry, n(n+1)/2 Killing vectors.
- **C18 Capstone: curvature lab [3]**
  - C18.1 Full metric → Γ → Riemann → Ricci → R → geodesics pipelines for the sphere, torus, hyperbolic plane and 3-sphere.
  - C18.2 Holonomy and Gauss–Bonnet synthesis.
  - C18.3 Convention translation exercise (Carroll ↔ Wald/MTW ↔ (+,−,−,−)).

#### "Why this matters in GR" for each object (synthesis; GR physics details belong to the GR-pathway researcher)
| Object | Module | Role in GR |
|---|---|---|
| Parameterized curves | C1 | A particle's history is a worldline x^μ(λ); proper time is its "arc length". |
| Curvature and torsion of curves (Frenet–Serret) | C1 | The 4-acceleration is the curvature of a worldline: zero in free fall (a geodesic), non-zero for a rocket. Frenet-type frames model accelerated and rotating observers. |
| Parameterizations | C1–C2 | Physics cannot depend on labelling; affine parameters (proper time) are the special ones for geodesics. |
| First fundamental form | C2 | The 2D prototype of g_{μν}. Induced metrics on hypersurfaces: space at an instant, horizons. |
| Second fundamental form | C3 | The extrinsic curvature K_ij of a spatial slice, part of the initial data in the 3+1 (initial-value) formulation; how a hypersurface bends inside spacetime. |
| Gaussian curvature; Theorema Egregium | C3–C4 | Proof that curvature can be measured from inside, which is the logical licence for curved spacetime with nothing "outside". |
| Gauss–Bonnet | C6 | Curvature integrates to topology. In 4D the Gauss–Bonnet invariant is topological (its integral gives the Euler characteristic). |
| Holonomy | C6, C13 | Curvature is the rotation picked up around tiny loops: the geometric meaning of Riemann. Cosmic-string deficit angles. |
| Coordinate charts | C7 | GR coordinates are labels. One spacetime may need several charts (Schwarzschild versus Kruskal). |
| (Smooth) manifolds | C7 | Spacetime is a 4D smooth manifold with a Lorentzian metric; smoothness allows differentiating fields. |
| Differentiable maps | C7–C8 | Diffeomorphisms are GR's gauge freedom; pullbacks give induced metrics; pushforwards move vectors. |
| Tangent vectors | C8 | 4-velocity, 4-momentum and polarization vectors live in T_pM; each tangent space is a copy of Minkowski space (local Lorentz frames). |
| Cotangent vectors | C8 | Gradients, wave covectors k_μ and momenta p_μ; measured energy E = −p_μu^μ. |
| Forms, wedge, exterior derivative | C9, G-FORMS | The volume element √−g d⁴x; Maxwell's dF = 0; Stokes' theorem for Gauss-law and conservation integrals; Cartan's structure equations. |
| Metric geometry | C10 | g_{μν} is the gravitational field: it sets clocks, rulers and light cones. |
| Riemannian vs pseudo-Riemannian | C10 | Spatial slices are Riemannian; spacetime is Lorentzian. Null directions, causal structure, proper-time maximization. |
| Connections | C11 | The rule for differentiating on a curved manifold. The equivalence principle says Γ can be made zero at any single point. |
| Christoffel symbols | C11 | The "gravitational force" terms of the geodesic equation, yet coordinate artifacts (not tensors). |
| Covariant derivative | C11 | Field equations and conservation ∇_μT^{μν} = 0 are written with ∇. |
| Parallel transport | C12 | How gyroscope spin is carried along free-fall worldlines (geodetic precession). |
| Geodesics | C12 | Free-fall worldlines and light rays. |
| Riemann tensor | C13 | The coordinate-independent gravitational field: tidal effects. |
| Ricci tensor | C14 | The part of curvature tied to matter; focusing of geodesic bundles. Vacuum ⇔ R_{μν} = 0. |
| Ricci scalar | C14 | The Einstein–Hilbert Lagrangian R√−g; the simplest curvature invariant. |
| Sectional curvature | C14 | The curvature of a 2-plane (tidal); generalizes K. |
| Einstein tensor | C14 | The left-hand side of G_{μν} = 8πG T_{μν}. |
| Bianchi identities | C15 | ∇^μG_{μν} ≡ 0 makes Einstein's equation consistent with ∇^μT_{μν} = 0. |
| Geodesic deviation | C16 | Tidal acceleration; how gravitational-wave detectors respond; focusing in singularity theorems. |
| Lie derivative | C17 | Symmetries and gauge transformations (δh_{μν} = L_ξη_{μν}); conservation laws. |
| Killing vectors | C17 | Conserved orbital energy and angular momentum; stationarity; Killing horizons; maximally symmetric cosmologies. |

### Gaps
- Act IV of Needham was not named in the one live search; "Parallel Transport" comes from domain knowledge (†). The live search did confirm the book's broad arc and the independence of Act V.
- The chapter-level orderings for do Carmo, Lee, Tu, Carroll, Schutz, Wald, MTW and Tong are from domain knowledge (†) and could not be re-checked. Treat chapter numbers as approximate and the overall sequences as reliable.
- I found no comparative study of learning outcomes for surfaces-first versus manifolds-first teaching, and none was searchable. The verdict is pedagogical judgement grounded in the textbook landscape and this learner's profile.

## 3. Per-module specifications: prerequisite edges, plain definitions, 2–4 problem archetypes, pitfalls (incl. sign conventions across textbooks), and verified answer keys

### Takeaway
All five standard modern GR texts (MTW, Wald, Carroll, Schutz, Hartle) use MTW's (+,+,+) sign triple, so the app can adopt Carroll's conventions without contradicting any of them. The real cross-book differences are notation, index order (Wald puts Riemann's raised index last), Christoffel slot order (MTW puts the derivative index last), and units (Carroll keeps G explicit). The (+,−,−,−) particle-physics books (Landau–Lifshitz) and Weinberg's opposite-sign Riemann are the ones that need translation. I recomputed every answer key below in this session [V]. They double as unit-test fixtures for the app's DOM-free math engine.

### Cited Findings
**MTW sign-convention scheme.** MTW's inside front cover defines three signs:
- S1 fixes the metric sign: η_{μν} = S1·diag(−1,+1,+1,+1).
- S2 fixes the Riemann sign: R^μ_{αβγ} = S2·(∂_βΓ^μ_{αγ} − ∂_γΓ^μ_{αβ} + Γ^μ_{σβ}Γ^σ_{γα} − Γ^μ_{σγ}Γ^σ_{βα}).
- S3 fixes the Einstein-equation sign: G_{μν} = S3·8πG T_{μν}, with R_{μν} = S2·S3·R^α_{μαν}.

MTW itself is (+,+,+). — † Book: MTW (1973), inside front cover; † [Wikipedia: Sign convention](https://en.wikipedia.org/wiki/Sign_convention) (reproduces the scheme and an author table).

**Author classification** (derived from each book's stated definitions, †; the modern texts post-date MTW's 1973 table):

| | S1 metric | S2 Riemann | S3 Einstein/Ricci | Notes |
|---|---|---|---|---|
| MTW 1973 | + | + | + | Derivative index last: V^α_{;β} = V^α_{,β} + Γ^α_{μβ}V^μ (†). G = c = 1. |
| Carroll 2004 | + | + | + | ∇_μV^ν = ∂_μV^ν + Γ^ν_{μλ}V^λ (derivative index first). c = 1, G explicit (G_{μν} = 8πG T_{μν}). |
| Schutz 2009 | + | + | + | Tilde one-forms (p̃), arrow vectors, comma/semicolon notation. c = 1, later G = 1. |
| Wald 1984 | + | + | + | Abstract indices. (∇_a∇_b − ∇_b∇_a)ω_c = R_{abc}{}^dω_d and R_{ac} = R_{abc}{}^b. G = c = 1. |
| Hartle 2003 | + | + | + | States that it follows MTW conventions; physics-first ordering. |
| Landau–Lifshitz | − | + | + | Signature (+,−,−,−); the curvature sign conventions match MTW. |
| Weinberg 1972 | + | − | − | Riemann defined with the opposite sign; field equation written R_{μν} − ½g_{μν}R = −8πG T_{μν}. |

- **Wald and Carroll give identical numbers.** I checked algebraically that Wald's fully lowered R_{abcd} equals Carroll's R_{abcd} (same index string, same numbers). It follows from R^{Wald}_{μνσ}{}^{λ} = −R^{Carroll,λ}{}_{σμν} together with the pair and antisymmetry identities (hand-derived). So the 2-sphere's R_{θφθφ} = a²sin²θ in both books, and both give the same Ricci tensor.
- **The two classic deviation equations agree.** MTW's D²ξ^α/dτ² + R^α_{βγδ}u^βξ^γu^δ = 0 (†) is Carroll's D²S^μ/dτ² = R^μ_{νρσ}T^νT^ρS^σ, because the last two Riemann indices are antisymmetric. Verified on the sphere [V].
- **Signature-flip bookkeeping**, g → −g [V on a 1+1 FLRW test; the rest is algebra]:
  - **Unchanged:** Γ^λ_{μν}, R^ρ_{σμν}, R_{μν}, G_{μν} and the perfect-fluid T_{μν} = (ρ+p)u_μu_ν ± p g_{μν} (the sign of the p-term flips with the convention). So G_{μν} = 8πG T_{μν} keeps its form.
  - **Flipped:** R, R_{ρσμν}, mixed components such as T^μ{}_ν (T^0{}_0 = −ρ in (−+++)), and u^μu_μ (−1 versus +1) [V].
- Sylvester's law of inertia: the number of positive and negative eigenvalues of a symmetric bilinear form does not depend on the basis, so "signature" is well defined. — † [Wikipedia: Sylvester's law of inertia](https://en.wikipedia.org/wiki/Sylvester%27s_law_of_inertia); † [Wikipedia: Metric signature](https://en.wikipedia.org/wiki/Metric_signature)
- The general Christoffel formula and the fact that Γ is not a tensor (it transforms inhomogeneously). — † [Wikipedia: Christoffel symbols](https://en.wikipedia.org/wiki/Christoffel_symbols). Verified [V]: Γ = 0 in Cartesian coordinates, yet the transformation law alone produces Γ′^r_{θθ} = −r and Γ′^θ_{rθ} = 1/r.
- 2-sphere Christoffels, Riemann and Ricci. — † [Carroll notes ch. 3 (2-sphere example)](https://arxiv.org/abs/gr-qc/9712019) [V]
  - Γ^θ_{φφ} = −sinθcosθ and Γ^φ_{θφ} = cotθ.
  - R^θ_{φθφ} = sin²θ and R_{θφθφ} = a²sin²θ.
  - R_{θθ} = 1, R_{φφ} = sin²θ and R = 2/a².
- Torus K = cos v/(r(R + r cos v)) for X = ((R + r cos v)cos u, (R + r cos v)sin u, r sin v). — † Book: do Carmo C&S §3-3 (torus example); † [Wikipedia: Torus](https://en.wikipedia.org/wiki/Torus) [V: intrinsic, extrinsic and orthogonal-formula routes agree]
- Helix (a cos t, a sin t, bt): κ = a/(a²+b²) and τ = b/(a²+b²). — † [Wikipedia: Frenet–Serret formulas](https://en.wikipedia.org/wiki/Frenet%E2%80%93Serret_formulas); † [Wikipedia: Helix](https://en.wikipedia.org/wiki/Helix) [V]
- The circumference of a small geodesic circle is C(ρ) = 2πρ − (π/3)Kρ³ + …. — † [Wikipedia: Bertrand–Diguet–Puiseux theorem](https://en.wikipedia.org/wiki/Bertrand%E2%80%93Diguet%E2%80%93Puiseux_theorem). Verified on the sphere [V]: 2πa sin(ρ/a) = 2πρ − πρ³/(3a²) + O(ρ⁵).
- Clairaut's relation on surfaces of revolution: ρ cos ψ is constant along a geodesic, where ρ is the distance to the axis and ψ the angle to the parallels. — † [Wikipedia: Clairaut's relation (differential geometry)](https://en.wikipedia.org/wiki/Clairaut%27s_relation_(differential_geometry)). Verified on the unit sphere [V]: sin²θ·dφ/ds = cos i along a great circle inclined at i. This equals g(∂_φ, ẋ), the Killing-vector conserved quantity.
- Holonomy: transporting a vector around a loop on a surface rotates it by ∬K dA, which is area/a² on a sphere. — † [Wikipedia: Holonomy](https://en.wikipedia.org/wiki/Holonomy) [V numerically, below]
- Killing vectors: ∇_(μξ_ν) = 0; p_μξ^μ is constant along geodesics; at most n(n+1)/2 Killing vectors (attained by maximally symmetric spaces, where R_{ρσμν} = (R/(n(n−1)))(g_{ρμ}g_{σν} − g_{ρν}g_{σμ})). — † [Carroll notes chs. 3/5](https://arxiv.org/abs/gr-qc/9712019); † [Wikipedia: Killing vector field](https://en.wikipedia.org/wiki/Killing_vector_field). Verified on S³ [V]: R_{abcd} = (g_{ac}g_{bd} − g_{ad}g_{bc})/a², Ric = (2/a²)g and R = 6/a².
- Contracted Bianchi identity ∇^μG_{μν} = 0. — † [Wikipedia: Riemann curvature tensor](https://en.wikipedia.org/wiki/Riemann_curvature_tensor). Verified [V] identically for the general static spherically symmetric metric −e^{2α(r)}dt² + e^{2β(r)}dr² + r²dΩ².
- The Schwarzschild Kretschmann scalar is R_{abcd}R^{abcd} = 48M²/r⁶ (G = c = 1). It is finite at r = 2M, where it equals 3/(4M⁴), so the horizon is a coordinate singularity. — † [Carroll notes ch. 7](https://arxiv.org/abs/gr-qc/9712019) [V; Ricci = 0 also verified]

### Inferences
#### Prerequisite graph (edge list; "X -> Y" means X is required before Y)
```
# External nodes (owned by other tracks): EXT.CALC2, EXT.CALC3 (partials, multivariable chain rule, Jacobians,
# multiple/line/surface integrals, Green/Stokes/divergence), EXT.LINALG (matrices, det, inverse, eigen),
# EXT.ODE (linear ODEs, systems), EXT.PHYS1, EXT.SR (Lorentz transformations, interval)
EXT.PHYS1 -> A1 [hard]        EXT.CALC2 -> A1 [hard]        EXT.LINALG -> A1 [soft]
A1 -> A2 [hard]               A2 -> A3 [hard]               EXT.CALC3 -> A3 [hard: gradient]
A3 -> A4 [hard]               EXT.CALC3 -> A4 [hard: Jacobian, chain rule]
A4 -> A5 [hard]               G-LIN -> A5 [soft: run in parallel]
A5 -> A6 [hard]               EXT.CALC2 -> A6 [hard: arc length]   EXT.CALC3 -> A6 [hard: polar double integrals]
EXT.SR -> A6 [soft: A6.6]     A6 -> A7 [hard]   A7 -> A8 [hard]   A8 -> A9 [hard]   A9 -> A10 [hard]
A6 -> G-SIG [hard]            A4 -> G-COV [hard]            A9 -> G-COV [soft]
A5 -> G-FORMS [hard]          EXT.CALC3 -> G-FORMS [hard: line/surface integrals]
G-TOP1 -> G-TOP2 [hard]       G-GRP -> G-LIEG [hard]        EXT.LINALG -> G-LIEG [hard: matrix exp]
G-LIEG -> G-LIEA [hard]       G-LIEA -> G-SYM [hard]        A6 -> G-SYM [hard: eta]
EXT.PHYS1 -> G-UNITS [hard]   A6 -> G-UNITS [soft]
EXT.CALC3 -> C1 [hard]        C1 -> C2 [hard]               A6 -> C2 [hard: I is a metric]
C2 -> C3 [hard]               EXT.LINALG -> C3 [hard: eigenvalues of shape operator]
C3 -> C4 [hard]               C4 -> C5 [hard]               A9 -> C5 [hard: Christoffels]   EXT.ODE -> C5 [hard]
C5 -> C6 [hard]
G-TOP1 -> C7 [hard]           G-TOP2 -> C7 [soft]           C4 -> C7 [soft: motivation]
C7 -> C8 [hard]               A5 -> C8 [hard]
C8 -> C9 [hard]               G-FORMS -> C9 [hard]
C8 -> C10 [hard]              A7 -> C10 [hard]              G-SIG -> C10 [hard]
C10 -> C11 [hard]             A9 -> C11 [hard]              C11 -> G-COV [soft: Gamma is not a tensor]
C11 -> C12 [hard]             C5 -> C12 [soft]
C12 -> C13 [hard]             C6 -> C13 [hard: holonomy meaning]
C13 -> C14 [hard]             C14 -> C15 [hard]
C12 -> C16 [hard]             C13 -> C16 [hard]
C8 -> C17 [hard: flows, brackets]   C11 -> C17 [hard]   EXT.ODE -> C17 [hard]   G-LIEA -> C17 [soft]
C15 -> C18 [hard]             C16 -> C18 [hard]             C17 -> C18 [hard]
# Hand-offs into the GR physics pathway (labels indicative; that track is another researcher's scope)
C10 -> GR.causal-structure    C12 -> GR.free-fall           C14 -> GR.einstein-eq   C15 -> GR.einstein-eq
C16 -> GR.tides/GW            C17 -> GR.orbits/conserved-quantities                 G-SYM -> GR.local-Lorentz
G-UNITS -> GR.* (all)
```

#### Module specifications: Advanced Math A
Format per module: prerequisites | plain definitions | why it matters in GR | archetypes | pitfalls (catalogue below) | keys (bank below).

- **A1 Scalars, vectors, bases** | Prereqs: PHYS1, CALC2.
  - *Definitions:* A *scalar* is one number that every observer computes identically at a point (a temperature, an arrow's length). A *vector* is an arrow at a point, independent of axes. A *basis* is a set of reference arrows e_μ. *Components* V^μ are the numbers with V = V^μ e_μ; the raised μ says *which* basis arrow and is not a power. A *matrix* is a grid of numbers that represents a linear map once a basis is fixed.
  - *GR:* Laws must be statements about objects; components are one observer's description.
  - *Archetypes:* (a) components of a fixed arrow in a rotated basis; (b) parallelogram versus projection components in a skewed basis; (c) sort quantities into scalar or not.
  - *Pitfalls:* P1, P5. *Keys:* K-A0.
- **A2 Index notation** | Prereqs: A1.
  - *Definitions:* A *free index* appears once per term and the equation holds for each of its values. A *dummy index* is summed and appears once up and once down. The Kronecker delta δ^μ_ν is 1 if μ = ν and 0 otherwise. The Levi-Civita symbol ε_{ijk} is ±1 for even/odd permutations of 123 and 0 otherwise.
  - *Archetypes:* (a) expand A^μ_νB^ν in 2D; (b) simplify δ^μ_νV^ν = V^μ and δ^μ_μ = n; (c) spot index-balance errors in candidate equations; (d) derive BAC–CAB from ε_{ijk}ε_{imn} = δ_{jm}δ_{kn} − δ_{jn}δ_{km}.
  - *Pitfalls:* P1–P4. *Keys:* δ^μ_μ = 4 in spacetime; ε_{ijk}ε_{ijk} = 6 (= 3!).
- **A3 Dual vectors** | Prereqs: A2, CALC3 (gradient).
  - *Definitions:* A *covector* is a linear machine that eats a vector and returns a number. The *dual basis* satisfies dx^μ(∂_ν) = δ^μ_ν. Components are ω_μ = ω(∂_μ).
  - *GR:* Momentum p_μ, the wave covector k_μ = ∂_μ(phase), and the energy measured by an observer, −p_μu^μ.
  - *Archetypes:* (a) evaluate ω(V) from components; (b) dual basis of a skewed basis; (c) df and df(V) for f = x²y at (1,2) with V = (3,−1): df = 4dx + 1dy and df(V) = 11 (hand-derived); (d) count surfaces pierced in a stack picture.
  - *Pitfalls:* P4, P8. *Keys:* K-A0, K-A3.
- **A4 Coordinate transformations** | Prereqs: A3, CALC3.
  - *Definitions:* The *Jacobian* ∂x′^μ/∂x^ν is the matrix of partial derivatives of new coordinates with respect to old. *Contravariant* (upper) components transform with ∂x′/∂x; *covariant* (lower) components with ∂x/∂x′.
  - *GR:* Coordinates are arbitrary labels and laws must not care.
  - *Archetypes:* (a) transform vector components Cartesian → polar; (b) transform covector components; (c) verify that a contraction is unchanged; (d) basis vectors in the new system (∂_r and ∂_θ in Cartesian form).
  - *Pitfalls:* P5, P8, P13, P17. *Keys:* K-A1–K-A4.
- **A5 Tensors** | Prereqs: A4 (G-LIN soft).
  - *Definitions:* A *(k,l) tensor* is a machine that is linear in each of l vector slots and k covector slots and returns a number. Its *rank* is k + l, but the type (k,l) is what matters. The *tensor product* is (ω⊗η)(U,V) = ω(U)η(V). *Contraction* sums one upper index against one lower index and lowers the rank by 2. *Symmetric/antisymmetric parts* are T_{(μν)} and T_{[μν]}.
  - *GR:* Energy-momentum T^{μν}, the field strength F_{μν} and the curvature tensors.
  - *Archetypes:* (a) transform a (0,2) tensor; (b) split T into S + A, e.g. T = [[1,2],[0,3]] → S = [[1,1],[1,3]], A = [[0,1],[−1,0]] (hand-derived); (c) show S^{μν}A_{μν} = 0; (d) "is it a scalar?" checks.
  - *Pitfalls:* P9–P12. *Keys:* K-A7, K-A18.
- **A6 The metric** | Prereqs: A5, CALC2 (arc length), CALC3 (polar integrals); SR soft.
  - *Definitions:* The *metric* g_{μν} is a symmetric, non-degenerate (0,2) tensor that turns two vectors into their "dot product". The *line element* is ds² = g_{μν}dx^μdx^ν. The *inverse metric* g^{μν} satisfies g^{μλ}g_{λν} = δ^μ_ν. The *volume element* is √|g| dⁿx. The *signature* is the count of minus and plus signs on a diagonalized metric.
  - *GR:* The metric is the gravitational potential.
  - *Archetypes:* (a) derive a metric via g′ = JᵀJ; (b) invert a metric; (c) arc length or area from the metric; (d) classify a Minkowski interval and compute proper time. For example, (Δt,Δx) = (5,3) gives Δs² = −16 and Δτ = 4 (hand-derived).
  - *Pitfalls:* P6, P7, P13, P17, P18. *Keys:* K-A5, K-A15, K-A19, K-A20.
- **A7 Raising/lowering** | Prereqs: A6.
  - *Definitions:* V_μ = g_{μν}V^ν, called "flat" (♭). ω^μ = g^{μν}ω_ν, called "sharp" (♯).
  - *GR:* p_μ = (−E, p) in (−+++); 4-velocity normalization.
  - *Archetypes:* (a) lower ∂_x in polar coordinates; (b) gradient vector from the covector in polar coordinates, ∇f = f_r∂_r + (f_θ/r²)∂_θ; (c) raise and lower in Minkowski space.
  - *Pitfalls:* P4, P12, P18. *Keys:* K-A6.
- **A8 Tensor fields** | Prereqs: A7.
  - *Definitions:* A *tensor field* assigns a tensor to each point, smoothly. *Coordinate basis fields* ∂_μ = ∂/∂x^μ point along the coordinate lines and are not necessarily unit length (|∂_θ| = r).
  - *GR:* g_{μν}(x) and T^{μν}(x) are fields.
  - *Archetypes:* (a) express a field in polar coordinates; (b) norms of coordinate basis fields; (c) convert coordinate components to orthonormal ones.
  - *Pitfalls:* P13. *Keys:* K-A2, K-A19.
- **A9 The covariant derivative (flat curvilinear coordinates)** | Prereqs: A8.
  - *Definitions:* *Christoffel symbols* Γ^λ_{μν} record how basis vectors change: ∂_μe_ν = Γ^λ_{μν}e_λ. The *covariant derivative* is ∇_μV^ν = ∂_μV^ν + Γ^ν_{μλ}V^λ, with one +Γ per upper index and one −Γ per lower index.
  - *GR:* Equations of motion and conservation laws are written with ∇; the geodesic equation.
  - *Archetypes:* (a) Γ from the metric (polar, spherical); (b) ∇ of the constant field ∂_x is 0; (c) divergence or Laplacian in curvilinear coordinates; (d) polar acceleration from Γ.
  - *Pitfalls:* P14–P16. *Keys:* K-A8–K-A14.
- **A10 Capstone** | Prereqs: A9.
  - *Archetypes:* (a) full spherical workup; (b) verify the EM invariants under a boost; (c) Γ^μ_{μλ} = ∂_λ ln√g.
  - *Keys:* K-A9, K-A12, K-A16, K-A17.

#### Module specifications: Advanced Math C
- **C1 Curves** | Prereqs: CALC3 (vector-valued functions).
  - *Definitions:* A *regular curve* is r(t) with r′ ≠ 0. *Arc length* is s = ∫|r′|dt. *Curvature* is κ = |dT/ds|, how fast the direction turns. *Torsion* τ measures how fast the curve leaves its osculating plane. The *Frenet frame* is (T,N,B).
  - *GR:* Worldlines and 4-acceleration (above).
  - *Archetypes:* (a) arc length and unit-speed reparametrization (helix: s = √(a²+b²)·t, hand-derived); (b) κ and τ via the cross-product formulas; (c) identify a curve from (κ,τ): constant κ with τ = 0 is a circle, constant κ with constant τ is a helix.
  - *Pitfalls:* P20, P21. *Keys:* K-C1.
- **C2 Surfaces and parameterizations** | Prereqs: C1, A6.
  - *Definitions:* A *regular surface patch* X(u,v) has X_u×X_v ≠ 0. The *tangent plane* is span{X_u, X_v}. The *first fundamental form* (E, F, G) is the metric induced from R³.
  - *Archetypes:* (a) compute I for a given surface; (b) lengths and areas from I (sphere area 4πa²; torus area 4π²Rr [V]); (c) show a map is a local isometry (cylinder → plane).
  - *Keys:* K-C2.
- **C3 Extrinsic curvature** | Prereqs: C2, LINALG (eigenvalues).
  - *Definitions:* The *second fundamental form* (L, M, N) holds the normal components of the second derivatives. The *principal curvatures* κ₁ and κ₂ are the maximum and minimum normal curvatures (eigenvalues of the shape operator). K = κ₁κ₂ and H = (κ₁+κ₂)/2.
  - *GR:* Extrinsic curvature of slices and horizons.
  - *Archetypes:* (a) compute II, K and H for a graph z = f(x,y) at a point; (b) classify points as elliptic, hyperbolic or parabolic (torus regions); (c) effect of flipping the normal.
  - *Pitfalls:* P22, P23, P24. *Keys:* K-C3.
- **C4 Intrinsic curvature and the Theorema Egregium** | Prereqs: C3.
  - *Definitions:* A property is *intrinsic* if it is computable from I alone. In orthogonal coordinates, K = −(1/(2√(EG)))[∂_u(G_u/√(EG)) + ∂_v(E_v/√(EG))].
  - *GR:* Spacetime curvature is intrinsic.
  - *Archetypes:* (a) compute K from a metric only (torus, sphere, hyperbolic plane); (b) decide whether two surfaces can be locally isometric (compare K); (c) circumference-deficit estimate of K.
  - *Pitfalls:* P24, P31. *Keys:* K-C4–K-C6.
- **C5 Geodesics on surfaces** | Prereqs: C4, A9, ODE.
  - *Definitions:* A *geodesic* is a curve with zero tangential acceleration, i.e. zero *geodesic curvature* k_g. With an affine parameter, ẍ^μ + Γ^μ_{νλ}ẋ^νẋ^λ = 0.
  - *Archetypes:* (a) write the geodesic equations of a surface from Γ; (b) verify that a given curve is or isn't a geodesic (equator yes; latitude no); (c) solve by unrolling (cylinder helices, cone); (d) use Clairaut to find a turning latitude.
  - *Pitfalls:* P25–P27. *Keys:* K-C7–K-C11.
- **C6 Parallel transport, holonomy and Gauss–Bonnet** | Prereqs: C5.
  - *Definitions:* *Parallel transport* moves a vector along a curve with zero covariant derivative. The *holonomy angle* is the net rotation after going round a closed loop. The *Euler characteristic* is χ = V − E + F.
  - *Archetypes:* (a) holonomy of a latitude loop or a geodesic triangle; (b) recover a region's area from its angle excess; (c) Gauss–Bonnet bookkeeping with k_g and corners; (d) deficit angle of a cone.
  - *Pitfalls:* P28. *Keys:* K-C12.
- **C7 Manifolds** | Prereqs: G-TOP1 (G-TOP2 soft), C4 (soft).
  - *Definitions:* A *chart* is an invertible, continuous assignment of coordinates to an open patch. An *atlas* is a set of charts covering the manifold. *Transition maps* convert one chart's coordinates to another's on overlaps. A *smooth manifold* is one whose transition maps are infinitely differentiable. A *diffeomorphism* is a smooth bijection with a smooth inverse.
  - *GR:* Spacetime is a 4D smooth manifold; one spacetime can carry several charts.
  - *Archetypes:* (a) build stereographic charts for S² and the transition map (K-C13); (b) decide whether a space is a manifold (figure-eight: no; line with two origins: locally Euclidean but not Hausdorff); (c) coordinate versus real singularity via an invariant.
  - *Pitfalls:* P29. *Keys:* K-C13, K-C17.
- **C8 Tangent and cotangent spaces** | Prereqs: C7, A5.
  - *Definitions:* A *tangent vector* at p is a directional-derivative operator V = V^μ∂_μ, equivalently the velocity of a curve through p. The *tangent space* T_pM is the set of all of these, and the *cotangent space* T*_pM is its dual. The *pushforward* φ_* carries vectors forward along a map; the *pullback* φ^* carries covectors and metrics back. The *Lie bracket* is [X,Y]f = X(Yf) − Y(Xf).
  - *Archetypes:* (a) apply V = ∂_x to f = x² + y² in both charts (2x = 2r cosθ, hand-derived); (b) induced metric as a pullback (sphere; hyperboloid → hyperbolic plane [V]); (c) a non-coordinate frame has non-zero brackets: [∂_r, (1/r)∂_θ] = −(1/r²)∂_θ (hand-derived).
  - *Pitfalls:* P33. *Keys:* K-C14.
- **C9 Forms on manifolds** | Prereqs: C8, G-FORMS.
  - *Definitions:* p-forms, the wedge product, d, orientation, and the integral of an n-form. Stokes: ∫_M dω = ∫_∂M ω. The metric volume form is √|g| dx¹∧…∧dxⁿ.
  - *Archetypes:* (a) the volume form of S², a²sinθ dθ∧dφ; (b) pull back a form along an embedding; (c) Stokes on a disk or cap.
  - *Pitfalls:* P35, P36. *Keys:* K-G2.
- **C10 Riemannian and pseudo-Riemannian metrics** | Prereqs: C8, A7, G-SIG.
  - *Definitions:* A *Riemannian* metric is positive-definite. A *Lorentzian* metric has signature (−,+,+,+). A vector is *timelike* if g(V,V) < 0, *null* if = 0 and *spacelike* if > 0. *Proper time* is τ = ∫√(−g_{μν}ẋ^μẋ^ν)dλ. *Local flatness*: at any point there are coordinates with g = η and ∂g = 0.
  - *Archetypes:* (a) classify vectors and curves; (b) light cones of Rindler, dρ = ±ρ dη (hand-derived from the null condition); (c) proper time along a worldline; (d) the counting argument 100 − 80 = 20.
  - *Pitfalls:* P18, P26. *Keys:* K-C15, K-C16.
- **C11 Connections** | Prereqs: C10, A9.
  - *Definitions:* A *connection* is a rule ∇ for differentiating vector fields that is linear and obeys the Leibniz rule. *Torsion* is T^λ_{μν} = Γ^λ_{μν} − Γ^λ_{νμ}. *Metric compatibility* means ∇g = 0. The *Levi-Civita connection* is the unique connection that is torsion-free and metric-compatible.
  - *Archetypes:* (a) derive the Christoffel formula by the "permute and add" trick; (b) compute Γ for a given metric (sphere, torus, H², Rindler, FLRW); (c) check ∇g = 0; (d) the transformation law yields Γ from Γ = 0.
  - *Pitfalls:* P15, P16, P20. *Keys:* K-A8, K-C7, K-C8, K-C11, K-C15.
- **C12 Parallel transport and geodesics** | Prereqs: C11 (C5 soft).
  - *Definitions:* *Transport equation*: dV^μ/dλ + Γ^μ_{νρ}ẋ^νV^ρ = 0. *Geodesic*: ẍ^μ + Γ^μ_{νρ}ẋ^νẋ^ρ = 0. *Lagrangian shortcut*: the Euler–Lagrange equations of L = g_{μν}ẋ^μẋ^ν give the geodesic equations, and the Γ's can be read off.
  - *Archetypes:* (a) read Γ off Euler–Lagrange: on S², L = ½(θ̇² + sin²θφ̇²) gives θ̈ − sinθcosθφ̇² = 0 and φ̈ + 2cotθθ̇φ̇ = 0, consistent with [V]; (b) conserved quantities from cyclic coordinates; (c) explicit parallel transport around a latitude.
  - *Pitfalls:* P26, P27. *Keys:* K-C9, K-C12, K-C17.
- **C13 Riemann tensor** | Prereqs: C12, C6.
  - *Definitions:* Riemann is defined by [∇_μ,∇_ν]V^ρ = R^ρ_{σμν}V^σ. Its symmetries are R_{ρσμν} = −R_{σρμν} = −R_{ρσνμ} = R_{μνρσ} and R_{ρ[σμν]} = 0. In 2D, R_{abcd} = K(g_{ac}g_{bd} − g_{ad}g_{bc}).
  - *Archetypes:* (a) compute Riemann for the sphere, torus and H²; (b) show polar coordinates and Rindler are flat (Riemann = 0 despite Γ ≠ 0); (c) count components; (d) recover K from R_{1212}/det g.
  - *Pitfalls:* P19, P30, P43. *Keys:* K-C8, K-C11, K-C16.
- **C14 Ricci, scalar, sectional, Einstein** | Prereqs: C13.
  - *Definitions:* R_{μν} = R^λ_{μλν}; R = g^{μν}R_{μν}. *Sectional curvature*: K(X,Y) = R_{μνρσ}X^μY^νX^ρY^σ/(g(X,X)g(Y,Y) − g(X,Y)²). G_{μν} = R_{μν} − ½Rg_{μν}. The *Weyl tensor* is the trace-free part of Riemann; it has 10 components in 4D (20 − 10).
  - *Archetypes:* (a) Ricci and R for a given metric; (b) sectional curvature of S² or S³ in a coordinate plane (1/a²); (c) show G ≡ 0 in 2D; (d) R for 1+1 FLRW, R = 2Ä/A.
  - *Pitfalls:* P30–P32. *Keys:* K-C8, K-C15, K-C16.
- **C15 Bianchi identities** | Prereqs: C14.
  - *Definitions:* First identity R_{ρ[σμν]} = 0; second identity ∇_{[λ}R_{ρσ]μν} = 0; contracted identity ∇^μG_{μν} = 0.
  - *Archetypes:* (a) verify the first identity on a component set; (b) derive the contracted identity from the second; (c) verify ∇_μG^{μν} = 0 for a given metric (symbolic lab).
  - *Keys:* K-C18.
- **C16 Geodesic deviation** | Prereqs: C12, C13.
  - *Definitions:* The *separation vector* S^μ connects neighbouring geodesics. Its relative acceleration is A^μ = R^μ_{νρσ}T^νT^ρS^σ. In 2D this reduces to the *Jacobi equation* ξ″ + Kξ = 0.
  - *Archetypes:* (a) separation of meridians or airplanes on Earth; (b) hyperbolic divergence; (c) Newtonian tidal tensor; (d) identify which Riemann component drives a given deviation.
  - *Keys:* K-C19.
- **C17 Lie derivatives and Killing vectors** | Prereqs: C8, C11, ODE (G-LIEA soft).
  - *Definitions:* The *flow* of X is the family of maps that slide points along the integral curves of X. The *Lie derivative* L_X T is the rate of change of T as seen by the flow. A *Killing vector* ξ has L_ξg = 0, equivalently ∇_μξ_ν + ∇_νξ_μ = 0. *Cartan's formula* is L_X = i_X d + d i_X on forms.
  - *Archetypes:* (a) compute [X,Y]; (b) test the Killing equation (rotation yes, dilation no); (c) find conserved quantities along geodesics; (d) compute Killing-vector brackets and match them to a Lie algebra.
  - *Pitfalls:* P33, P34, P37. *Keys:* K-C20.
- **C18 Capstone** | Prereqs: C15–C17.
  - *Archetypes:* (a) full pipeline from a new metric; (b) convention translation; (c) holonomy or Gauss–Bonnet synthesis problem.
  - *Keys:* all of K-C.

(G-module specifications are in §5.)

#### Pitfall catalogue, with one-sentence micro-teaching lines
- **P1** *Superscripts are labels, not powers.* "x² means coordinate number 2; a square is written (x²)²."
- **P2** *Free-index mismatch.* "Every term must carry the same free indices at the same heights."
- **P3** *Triple index.* "One index letter appears at most twice in a term, once up and once down; rename dummies to avoid clashes."
- **P4** *Summing two upper indices.* "Only an upper index pairs with a lower one; to pair two uppers, lower one with g first."
- **P5** *Components vs object.* "Components change with the basis; the arrow or stack does not."
- **P6** *Inverse metric.* "g^{μν} is the matrix inverse; only for diagonal metrics is g^{θθ} = 1/g_{θθ}."
- **P7** *Trace of δ.* "δ^μ_μ = g^{μν}g_{μν} = n: 2 on a surface, 4 in spacetime."
- **P8** *'Covariant' means three things.* "Covariant components (lower) transform like the basis; contravariant components (upper) transform oppositely; 'general covariance' means form-invariance of equations."
- **P9** *A matrix is not a tensor.* "An array becomes a tensor only together with a transformation law; T^μ{}_ν and T_{μν} transform differently."
- **P10** *Symmetric × antisymmetric = 0.* "S^{μν}A_{μν} = 0 always: a fast way to kill terms."
- **P11** *(Anti)symmetrization weights.* "This app uses T_{(μν)} = ½(T_{μν}+T_{νμ}); some books omit the ½."
- **P12** *Index order in mixed tensors.* "T^μ{}_ν and T_ν{}^μ differ unless T is symmetric; keep the horizontal spacing."
- **P13** *Coordinate vs orthonormal components.* "V^θ is 'per radian'; the physical component is V^θ̂ = rV^θ."
- **P14** *Partial derivatives of components.* "A perfectly constant field can have ∂_μV^ν ≠ 0 in curvilinear coordinates; use ∇."
- **P15** *Γ is not a tensor.* "Γ vanishes in Cartesian coordinates but not in polar; a true tensor that vanishes in one chart vanishes in all."
- **P16** *Signs of Γ terms.* "+Γ for each upper index, −Γ for each lower index."
- **P17** *Spherical-coordinate names.* "In physics θ is measured from +z and φ goes around; many calculus books swap them and call the radius ρ."
- **P18** *Signature.* "In (−,+,+,+) a 4-velocity has u·u = −1; in (+,−,−,−) it is +1. Same physics."
- **P19** *Riemann index conventions.* "Books differ in where the raised index sits and which slots contract to Ricci; always check the commutator definition. MTW's S2 and S3 classify the remaining sign choices."
- **P20** *Name clash: torsion.* "The torsion τ of a curve and the torsion tensor of a connection are unrelated."
- **P21** *Frenet torsion sign.* "This app uses B′ = −τN, so a right-handed helix has τ > 0. Check each textbook; do Carmo is commonly cited as using the opposite sign (verify before quoting)."
- **P22** *Normal orientation.* "Flipping the normal flips II and H but never K." With the outward normal, the sphere has L = −a, N = −a sin²θ and H = −1/a [V].
- **P23** *Mean-curvature normalization.* "H = (κ₁+κ₂)/2 here; some texts use κ₁+κ₂."
- **P24** *Bent is not curved.* "A cylinder is bent but intrinsically flat, K = 0; GR curvature is intrinsic."
- **P25** *Latitudes are not geodesics.* "Only the equator is a great circle; other latitudes need a sideways push, k_g = cotθ₀/a."
- **P26** *Geodesics minimize only locally.* "Past the antipode a great circle is no longer shortest, and timelike geodesics locally *maximize* proper time."
- **P27** *Affine parameter.* "The form ẍ + Γẋẋ = 0 holds only for an affine parameter, such as proper time."
- **P28** *Holonomy bookkeeping.* "Angles are mod 2π and follow the loop's orientation; either complementary region on a sphere gives the same answer mod 2π."
- **P29** *Coordinate singularities.* "The sphere is smooth at its poles though φ is undefined there; curvature invariants decide what is real."
- **P30** *2D is special.* "In 2D, Riemann has one component, Ricci = Kg, R = 2K and G_{μν} ≡ 0; none of this generalizes to 4D."
- **P31** *R vs K.* "R = 2K on surfaces: the sphere has R = 2/a² and K = 1/a²."
- **P32** *Sphere Ricci is radius-independent.* "R_{θθ} = 1 for every radius; the size lives in g, so R_{μν} = g_{μν}/a²."
- **P33** *Lie vs covariant derivative.* "L_XY needs X near the point but no connection; ∇_XY needs a connection but only X at the point."
- **P34** *Killing equation.* "Write it with ∇ (or as L_ξg = 0); the partial-derivative form is valid only in Cartesian coordinates on flat space."
- **P35** *Wedge normalization.* "Here dx∧dy = dx⊗dy − dy⊗dx; some books include a ½."
- **P36** *Hodge and ε signs.* "Here ε_{0123} = +√|g|, so ε^{0123} = −1/√|g| in (−+++); books differ."
- **P37** *Lie-algebra i's.* "Physicists write [J_i,J_j] = iε_{ijk}J_k with Hermitian generators; mathematicians write [J_i,J_j] = ε_{ijk}J_k with real ones. It is the same algebra."
- **P38** *Rapidities add, velocities don't.* "Collinear boosts compose by adding rapidities: tanh(w₁+w₂) = (v₁+v₂)/(1+v₁v₂)."
- **P39** *SU(2) vs SO(3).* "A 2π rotation is the identity in SO(3) but −1 in SU(2)."
- **P40** *Geometrized units.* "'M' in a formula means GM/c², a length: the Sun is about 1.48 km."
- **P41** *Index slots in Γ.* "Carroll writes ∇_μV^ν = ∂_μV^ν + Γ^ν_{μλ}V^λ (derivative index first); MTW writes the derivative index last. This only matters for connections with torsion."
- **P42** *Killing-field brackets.* "Killing fields reproduce the Lie algebra up to an overall sign: on S², [ξ_x,ξ_y] = −ξ_z [V], while [J_x,J_y] = +J_z for the matrices."
- **P43** *Riemann symmetries.* "Antisymmetric in each pair and symmetric under swapping pairs, so in 2D only R_{1212} matters."
- **P44** *∇g = 0.* "Because the metric is covariantly constant, you may raise and lower indices inside ∇."
- **P45** *Embedding diagrams.* "They show the geometry of one spatial slice; the extra dimension is fictitious."

#### Answer-key bank (all [V] unless marked "hand-derived")
**Math A (flat space)**
- **K-A0 Skewed basis.** e₁ = (1,0), e₂ = (½, √3/2), V = (1,1).
  - Upper components (V¹,V²) = (1 − 1/√3, 2/√3) ≈ (0.42265, 1.15470).
  - Lower components V_i = V·e_i = (1, (1+√3)/2) ≈ (1, 1.36603).
  - g_{ij} = e_i·e_j = [[1, ½],[½, 1]]; g_{ij}V^j reproduces V_i, and V^iV_i = 2 = |V|².
- **K-A1 Polar Jacobians.** ∂(x,y)/∂(r,θ) = [[cosθ, −r sinθ],[sinθ, r cosθ]]. ∂(r,θ)/∂(x,y) = [[cosθ, sinθ],[−sinθ/r, cosθ/r]].
- **K-A2 Basis vectors.**
  - ∂_x = cosθ∂_r − (sinθ/r)∂_θ, so V^r = cosθ and V^θ = −sinθ/r.
  - ∂_y = sinθ∂_r + (cosθ/r)∂_θ.
  - ∂_r = cosθ∂_x + sinθ∂_y.
  - ∂_θ = −y∂_x + x∂_y, with |∂_θ| = r.
- **K-A3 Basis covectors.** dx = cosθ dr − r sinθ dθ. dy = sinθ dr + r cosθ dθ. dθ = (x dy − y dx)/r². dr = (x dx + y dy)/r.
- **K-A4 Contractions.**
  - dx(∂_x) = cos²θ + sin²θ = 1 in polar; dθ(∂_x) = −sinθ/r; |∂_x|² = 1.
  - Worked point (r,θ) = (2, π/6): V^r = 0.8660 and V^θ = −0.25, so |V|² = 0.75 + 4(0.0625) = 1.
- **K-A5 Metrics.**
  - Polar: diag(1, r²); inverse diag(1, r⁻²); √g = r.
  - Cylindrical: diag(1, r², 1); √g = r.
  - Spherical: diag(1, r², r²sin²θ); inverse diag(1, r⁻², (r sinθ)⁻²); √g = r²sinθ = det J.
- **K-A6 Lowering.** Lowering ∂_x with the polar metric gives V_μ = (cosθ, −r sinθ), exactly the components of dx.
- **K-A7 Tensor transform.** dx⊗dx in polar: T_rr = cos²θ, T_rθ = T_θr = −r sinθcosθ, T_θθ = r²sin²θ.
- **K-A8 Polar Christoffels.** Γ^r_{θθ} = −r and Γ^θ_{rθ} = Γ^θ_{θr} = 1/r; all others 0; Riemann = 0. The same values come from the transformation law starting from Cartesian Γ = 0.
- **K-A9 Spherical Christoffels.** Γ^r_{θθ} = −r, Γ^r_{φφ} = −r sin²θ, Γ^θ_{rθ} = 1/r, Γ^θ_{φφ} = −sinθcosθ, Γ^φ_{rφ} = 1/r, Γ^φ_{θφ} = cotθ; Riemann = 0.
- **K-A10 Covariant vs naive derivative.** For V = ∂_x in polar coordinates, ∇_μV^ν = 0 in every component. The naive partials are non-zero: ∂_θV^r = −sinθ, ∂_rV^θ = sinθ/r² and ∂_θV^θ = −cosθ/r (∂_rV^r = 0).
- **K-A11 Covector derivative.** ∇_μ(dx)_ν = 0 in polar coordinates.
- **K-A12 Divergence.** ∇_μV^μ = (1/√g)∂_μ(√gV^μ) and Γ^μ_{μλ} = ∂_λ ln√g (spherical check). Example: div(r∂_r) = 2.
- **K-A13 Laplacians.** Polar: f_rr + f_r/r + f_θθ/r² [V]. Spherical: (1/r²)∂_r(r²f_r) + (1/(r²sinθ))∂_θ(sinθ f_θ) + f_φφ/(r²sin²θ). The spherical form follows from the verified metric via the same formula (1/√g)∂_μ(√g g^{μν}∂_νf); the expansion is hand-derived.
- **K-A14 Polar acceleration.** a^r = r̈ − rθ̇² and a^θ = θ̈ + 2ṙθ̇/r. The orthonormal component is a^θ̂ = rθ̈ + 2ṙθ̇.
- **K-A15 Minkowski.** u^μu_μ = −1 in (−+++) and +1 in (+−−−). Lowering gives p_μ = (−E, p). (Δt,Δx) = (5,3) gives Δs² = −16 and Δτ = 4 (hand-derived).
- **K-A16 Boosts.** ΛᵀηΛ = η; Λ(w₁)Λ(w₂) = Λ(w₁+w₂); tanh(atanh v₁ + atanh v₂) = (v₁+v₂)/(1+v₁v₂).
- **K-A17 EM invariants.** With F_{0i} = −E_i, F_{12} = B_z, F_{13} = −B_y, F_{23} = B_x and the Hodge convention above: F_{μν}F^{μν} = 2(B² − E²) and F_{μν}(⋆F)^{μν} = 4E·B. Both are unchanged by an x-boost of rapidity w. The sign of the second depends on the ε and F conventions.
- **K-A18 Symmetric/antisymmetric split.** S^{μν}A_{μν} = 0. Component counts: Sym² has n(n+1)/2 components (10 in 4D, those of g_{μν}); Λ² has n(n−1)/2 (6 in 4D, those of F_{μν}).
- **K-A19 Orthonormal components.** V^θ̂ = rV^θ; |∂_θ| = r; |∂_φ| = r sinθ.
- **K-A20 Areas and volumes.** Disk ∫∫ r dr dθ = πR²; ball ∫∫∫ r²sinθ = (4/3)πR³ (standard).

**Math C (curves, surfaces, manifolds, curvature)**
- **K-C1 Curves.**
  - Helix (a cos t, a sin t, bt): κ = a/(a²+b²), τ = b/(a²+b²).
  - Twisted cubic (t,t²,t³) at t = 0: κ = 2, τ = 3.
  - Circle of radius 3: κ = 1/3, τ = 0.
- **K-C2 First fundamental forms.**
  - Sphere: E = a², F = 0, G = a²sin²θ.
  - Cylinder: a², 0, 1.
  - Torus: (R+r cos v)², 0, r².
  - Saddle z = xy: 1+y², xy, 1+x².
  - Paraboloid z = (x²+y²)/2: 1+x², xy, 1+y².
  - Catenoid and helicoid: c²cosh²(v/c), 0, cosh²(v/c).
- **K-C3 Second fundamental forms, K and H** (normal n = X_u×X_v/|…|).
  - Sphere: L = −a, M = 0, N = −a sin²θ; K = 1/a², H = −1/a.
  - Cylinder: L = −a, M = N = 0; K = 0, H = −1/(2a).
  - Saddle z = xy: K = −1/(1+x²+y²)², H = −xy/(1+x²+y²)^{3/2}. At the origin K = −1.
  - Paraboloid: K = 1/(1+x²+y²)², H = (x²+y²+2)/(2(1+x²+y²)^{3/2}). At the origin K = 1 and H = 1.
  - Catenoid: L = −c, N = 1/c. Helicoid: M = 1. Both have H = 0.
- **K-C4 Curvature from the metric alone.** The orthogonal-coordinate formula gives the torus cos v/(r(R + r cos v)), the sphere 1/a² and the hyperbolic plane −1, matching the extrinsic values. In 2D, R = 2K and Ric = Kg.
- **K-C5 Catenoid/helicoid.** Identical I and K = −1/(c²cosh⁴(v/c)), but different II. The associate family has an α-independent I and H = 0.
- **K-C6 Circumference deficit.** On the sphere C(ρ) = 2πa sin(ρ/a) = 2πρ − πρ³/(3a²) + … (K = 1/a²).
- **K-C7 Torus.**
  - Γ^u_{uv} = −r sin v/(R + r cos v) and Γ^v_{uu} = (R + r cos v)sin v/r.
  - R_{uvuv} = r(R + r cos v)cos v; K = cos v/(r(R + r cos v)); R = 2K; Ric = Kg.
  - Regions: K > 0 on the outer half, K < 0 on the inner half, K = 0 on the top and bottom circles. Extremes are K(0) = 1/(r(R+r)) and K(π) = −1/(r(R−r)); for R = 2, r = 1 these are 1/3 and −1.
  - ∬K dA = 0 (χ = 0). Area 4π²Rr (78.957 for R = 2, r = 1).
- **K-C8 Sphere of radius a.**
  - g = diag(a², a²sin²θ); g⁻¹ = diag(a⁻², (a sinθ)⁻²); √g = a²sinθ.
  - Γ^θ_{φφ} = −sinθcosθ; Γ^φ_{θφ} = cotθ.
  - R^θ_{φθφ} = sin²θ; R^φ_{θφθ} = 1 (equivalently R^φ_{θθφ} = −1); R_{θφθφ} = a²sin²θ.
  - Ric = diag(1, sin²θ) = g/a²; R = 2/a²; K = 1/a².
  - ∇g = 0 checked; ∬K dA = 4π.
- **K-C9 Sphere geodesics.**
  - Equations: θ″ − sinθcosθ φ′² = 0 and φ″ + 2cotθ θ′φ′ = 0.
  - The equator (θ = π/2, φ = s/a) and meridians (θ = s/a) are geodesics.
  - A latitude θ₀ ≠ π/2 is not: its residual is (DT/ds)^θ = −cotθ₀/a², so k_g = cotθ₀/a.
  - Clairaut: sin²θ·φ′ = cos i along a great circle inclined at i (unit sphere; numerically constant to 12 digits).
- **K-C10 Cylinder and cone.**
  - Cylinder metric a²dφ² + dz²: Γ = 0. Geodesics are φ = αs + β, z = γs + δ (helices); e.g. φ = s/(a√2), z = s/√2.
  - Cone of half-angle α: it unrolls to a sector of angle 2π sin α, so the deficit and the holonomy about the apex are 2π(1 − sin α). This gives 180° for α = 30°, 48.2° for α = 60° and 0° for α = 90°.
- **K-C11 Hyperbolic plane.**
  - Upper half-plane ds² = (dx²+dy²)/y²: Γ^x_{xy} = −1/y, Γ^y_{xx} = 1/y, Γ^y_{yy} = −1/y.
  - R_{xyxy} = −1/y⁴; Ric = −g; R = −2; K = −1.
  - Geodesics include x = 0, y = e^s and the semicircle x = tanh s, y = sech s.
  - Hyperboloid model: −t² + x² + y² = −1, parameterized (cosh u, sinh u cos p, sinh u sin p), has induced metric du² + sinh²u dp².
- **K-C12 Parallel transport and holonomy on the sphere.**
  - Explicit solution along latitude θ₀ (start V = ∂_θ direction): V^θ = cos(φ cosθ₀) and V^φ = −sin(φ cosθ₀)/sinθ₀. The norm is preserved. In the orthonormal frame the vector rotates by −φcosθ₀, so a full loop gives 2π(1 − cosθ₀) mod 2π, in the same sense as the loop.
  - Numeric RK4 transport embedded in R³ (dV/dt = −(V·ṗ)p) gives holonomy equal to the cap area/a² in every case:

    | Colatitude θ₀ | Holonomy |
    |---|---|
    | 30° (60°N) | 48.231° |
    | 45° | 105.442° |
    | 60° | 180.000° |
    | 90° (equator) | 0° (≡ 360°) |

  - Geodesic triangles:
    - The octant triangle N → (1,0,0) → (0,1,0) gives 90.000°, equal to its area/a².
    - The triangle with vertices (0,0,1), (cos 0.3, 0, sin 0.3) and (0, cos 0.5, sin 0.5) gives 47.252°, equal to its spherical excess.
  - Gauss–Bonnet check for the polar cap: 2π(1 − cosθ₀) + 2πcosθ₀ = 2π.
- **K-C13 Stereographic charts** (hand-derived, standard). From N: (X,Y) = (x,y)/(1−z). From S: (X′,Y′) = (x,y)/(1+z). Transition: (X′,Y′) = (X,Y)/(X²+Y²), smooth on the overlap. S² needs at least 2 charts.
- **K-C14 Derivations and frames** (hand-derived). V = ∂_x applied to f = x²+y² gives 2x. In polar coordinates f = r² and V(f) = cosθ·2r = 2x, the same. For the orthonormal polar frame, [∂_r, r⁻¹∂_θ] = −r⁻²∂_θ ≠ 0, while coordinate frames always have [∂_μ,∂_ν] = 0.
- **K-C15 Lorentzian 2D examples.**
  - Rindler, −ρ²dη² + dρ²: Γ^ρ_{ηη} = +ρ and Γ^η_{ηρ} = 1/ρ; flat. Compare polar Γ^r_{θθ} = −r: the sign flips because of the signature.
  - 1+1 FLRW, −dt² + A(t)²dx²: Γ^t_{xx} = AȦ and Γ^x_{tx} = Ȧ/A; R^t_{xtx} = AÄ; Ric = diag(−Ä/A, AÄ); R = 2Ä/A.
  - 2D de Sitter, A = e^{Ht}: R = 2H².
- **K-C16 Higher-dimensional checks.**
  - S³ of radius a, a²(dχ² + sin²χ dΩ²): Ric = (2/a²)g, R = 6/a², maximally symmetric.
  - Riemann has 1, 6 and 20 independent components in n = 2, 3, 4 (linear-algebra null-space count).
  - Weyl in 4D: 20 − 10 = 10. The local-flatness count is 100 − 80 = 20.
- **K-C17 Schwarzschild** (G = c = 1, f = 1 − 2M/r).
  - Γ^t_{tr} = M/(r(r−2M)); Γ^r_{tt} = M(r−2M)/r³; Γ^r_{rr} = −M/(r(r−2M)); Γ^r_{θθ} = −(r−2M); Γ^r_{φφ} = −(r−2M)sin²θ; Γ^θ_{rθ} = Γ^φ_{rφ} = 1/r; Γ^θ_{φφ} = −sinθcosθ; Γ^φ_{θφ} = cotθ.
  - Ric = 0. Kretschmann = 48M²/r⁶, which is 3/(4M⁴) at r = 2M.
- **K-C18 Bianchi check.** For −e^{2α}dt² + e^{2β}dr² + r²dΩ²:
  - G_tt = e^{2(α−β)}(2rβ′ + e^{2β} − 1)/r².
  - G_rr = (2rα′ − e^{2β} + 1)/r².
  - ∇_μG^{μν} = 0 identically.
- **K-C19 Geodesic deviation.**
  - Sphere, meridians from the pole: T = (1/a)∂_θ and S = Δφ∂_φ give D²S^φ/ds² = −Δφ/a², equal to R^φ_{νρσ}T^νT^ρS^σ. The proper separation a sin(s/a)Δφ obeys ξ″ = −ξ/a².
  - Two meridians starting parallel at the equator: ξ = ξ₀cos(s/a). Earth example: 100 km apart, after flying 1000 km north they are 98.771 km apart.
  - Hyperbolic plane: ξ = ξ₀cosh s (cosh 2 = 3.7622).
  - Newtonian tidal matrix −∂_i∂_jΦ at (r₀,0,0) = diag(2GM/r₀³, −GM/r₀³, −GM/r₀³), trace 0. At Earth's surface GM/R³ = 1.541×10⁻⁶ s⁻², so the radial stretch is 3.08×10⁻⁶ m s⁻² per metre of separation.
- **K-C20 Lie derivatives and Killing vectors.**
  - Plane: the rotation X = −y∂_x + x∂_y is Killing; [X, ∂_x] = L_X∂_x = −∂_y. The dilation x∂_x + y∂_y has L g = 2g, so it is not Killing (it is conformal Killing).
  - S² Killing fields: ξ_z = ∂_φ, ξ_x = −sinφ∂_θ − cotθcosφ∂_φ and ξ_y = cosφ∂_θ − cotθ sinφ∂_φ all satisfy L_ξg = 0. Their brackets are [ξ_x,ξ_y] = −ξ_z, [ξ_y,ξ_z] = −ξ_x and [ξ_z,ξ_x] = −ξ_y.
  - Minkowski 1+1: the boost x∂_t + t∂_x is Killing; t∂_t + x∂_x is not (L η = 2η).
  - Cartan check: for X = −y∂_x + x∂_y and ω = x dy, L_Xω = i_Xdω + d(i_Xω) = x dx − y dy.
- **K-C21 Signature flip** (1+1 FLRW test). Γ, R^ρ_{σμν} and R_{μν} are identical under g → −g; R changes sign (2Ä/A → −2Ä/A).

**Advanced Math G**
- **K-G1 Lie groups and algebras.**
  - Real generators (J_i)^j{}_k = −ε_{ijk} and (K_i)^0{}_i = (K_i)^i{}_0 = 1 give [J₁,J₂] = J₃, [J₁,K₂] = K₃ and [K₁,K₂] = −J₃. These representative pairs were computed; the rest follow by cyclic symmetry. All generators satisfy Xᵀη + ηX = 0.
  - exp(ϑJ₃) is the rotation [[cos ϑ, −sin ϑ],[sin ϑ, cos ϑ]] in the x–y block; exp(wK₁) is the boost [[cosh w, sinh w],[sinh w, cosh w]] in the t–x block.
  - SU(2): exp(−i·2π·σ_z/2) = −1.
  - su(2): τ_i = −iσ_i/2 satisfies [τ_i,τ_j] = ε_{ijk}τ_k (hand-derived).
  - Dimensions: so(1,3) is 6-dimensional, Poincaré 10; the maximum number of Killing vectors n(n+1)/2 is 3, 6, 10 for n = 2, 3, 4.
- **K-G2 Forms.**
  - d(−y dx + x dy) = 2 dx∧dy.
  - ω = (x dy − y dx)/(x²+y²) has dω = 0 but ∮_{unit circle}ω = 2π, so it is closed but not exact on R²∖{0}.
  - Stokes: ∫_disk 2 dA = 2π = ∮(−y dx + x dy).
  - dx∧dy = r dr∧dθ.
  - In R³ the wedge components (dy∧dz, dz∧dx, dx∧dy) of α∧β equal the cross product a×b. curl grad = 0 and div curl = 0 (d² = 0).
  - Minkowski Hodge star: ⋆(dt∧dx) = −dy∧dz and ⋆(dy∧dz) = dt∧dx; ⋆⋆ = −1 on 2-forms.
- **K-G3 Units.**
  - Sun: GM_sun/c² = 1476.625 m and GM_sun/c³ = 4.9255 μs (with GM_sun = 1.32712440018×10²⁰ m³s⁻²); Schwarzschild radius 2GM/c² = 2953.3 m.
  - Earth: GM/c² = 4.435 mm.
  - Planck units: length 1.6163×10⁻³⁵ m, time 5.3912×10⁻⁴⁴ s, mass 2.1764×10⁻⁸ kg.
  - Conversions: 1 m ↔ 3.3356 ns, and G/c² = 7.4262×10⁻²⁸ m kg⁻¹.

#### Reference implementation of the convention (used to generate the keys; port to the app's JS math core as test fixtures)
```python
import sympy as sp
from itertools import product
def christoffel(g, x):   # returns G[a][b][c] = Gamma^a_{bc}
    n, gi = len(x), g.inv()
    return [[[sp.simplify(sum(gi[a, d]*(sp.diff(g[d, b], x[c]) + sp.diff(g[d, c], x[b]) - sp.diff(g[b, c], x[d]))
              for d in range(n))/2) for c in range(n)] for b in range(n)] for a in range(n)]
def riemann(G, x):       # R[a][b][c][d] = R^a_{bcd} = d_c G^a_{db} - d_d G^a_{cb} + G^a_{ce}G^e_{db} - G^a_{de}G^e_{cb}
    n = len(x)
    return [[[[sp.simplify(sp.diff(G[a][d][b], x[c]) - sp.diff(G[a][c][b], x[d])
               + sum(G[a][c][e]*G[e][d][b] - G[a][d][e]*G[e][c][b] for e in range(n)))
               for d in range(n)] for c in range(n)] for b in range(n)] for a in range(n)]
def ricci(R, n):         # R_{bd} = R^a_{bad}
    return sp.Matrix(n, n, lambda b, d: sp.simplify(sum(R[a][b][a][d] for a in range(n))))
# e.g. th, a = sp.symbols('theta a', positive=True); ph = sp.Symbol('phi')
#      g = sp.diag(a**2, a**2*sp.sin(th)**2) -> Gamma^th_phph = -sin th cos th, R = 2/a**2
```
The repo convention (CLAUDE.md) keeps simulation logic DOM-free and testable headlessly. The app's geodesic, transport and curvature engines should follow it, with every K-key above as a fixture. An expression like sin(2θ)/(2tanθ) − cos2θ must be simplified to sin²θ before display; raw CAS output often hides the simple form.

#### Exemplar lesson blueprints (lesson format: intro → manipulable visual → worked example → practice with hints and micro-teaching → checkpoint)
**L-A4.5 "Same arrow, new labels: polar components"**
- *Intro:* A drone flies due east at 1 m/s. In polar coordinates centred on a tower, how fast are r and θ changing?
- *Visual:* V3 (below). The arrow ∂_x is fixed; ∂_r and ∂_θ are drawn at a draggable point; the components update live.
- *Worked example:* At (r,θ) = (2, π/6), V^r = 0.866 and V^θ = −0.25 rad/s. Check: |V|² = 0.866² + 2²(0.25)² = 1 (K-A4).
- *Practice (6):*
  1. Components of ∂_y → (sinθ, cosθ/r). Hint: V^μ = ∂x′^μ/∂y. Micro: "upper components use ∂(new)/∂(old)".
  2. Components of dx → (cosθ, −r sinθ). Micro: "lower components use ∂(old)/∂(new)".
  3. Show dx(∂_x) = 1 in polar coordinates. Micro: "contractions don't care about coordinates".
  4. Cartesian components of ∂_θ → (−y, x). Micro: "coordinate basis vectors need not be unit length: |∂_θ| = r".
  5. At (1, π/2), V^r = 0 and V^θ = 2: what is |V|? → 2. Micro: "measure θ-components with g_θθ = r²".
  6. Is V^θ a scalar? → No. Micro: "a single component is never a scalar; contractions are".
- *Checkpoint (4 items):* Which law uses ∂x′/∂x? Compute dθ(∂_x) = −sinθ/r. Pick the scalar from {V^r, g_{μν}V^μV^ν, Γ^r_{θθ}, ∂_μV^μ}; the answer is g_{μν}V^μV^ν, and ∂_μV^μ is *not* the divergence in polar coordinates. True or false: the arrow moves when the coordinates change? (False.)

**L-C6.3 "The arrow that comes back rotated"**
- *Intro:* Walk from the North Pole to the equator, 90° east along it, and back, carrying a spear you "never turn". It returns rotated by 90°.
- *Visual:* V6 with the triangle tool and a latitude slider; live readout of the angle against area/a².
- *Worked example:* At colatitude 60° the cap area is πa², so the holonomy is 180°. Show the explicit solution V^θ = cos(φcosθ₀) (K-C12).
- *Practice (6):*
  1. Octant triangle → 90°.
  2. Colatitude 30° → 48.23°. Hint: cap area 2πa²(1 − cosθ₀). Micro: "rotation = enclosed area/a² in radians".
  3. A triangle with angles 90°, 90°, 50° on the unit sphere → holonomy 50°, area 0.873. Micro: "angle excess = area × K".
  4. Any loop in the plane → 0. Micro: "no curvature, no holonomy".
  5. Cone with α = 30° around the apex → 180°; a loop not enclosing the apex → 0. Micro: "the curvature is concentrated at the apex".
  6. The equator → 0 mod 360°. Micro: "angles live mod 2π: the hemisphere's 2π looks like no rotation".
- *Checkpoint:* Does the arrow rotate *relative to the surface* along the way? (No: its tangential change is zero.) Which direction does it rotate? (The same sense as the loop.)

**L-C16.2 "Why parallel lines meet: geodesic deviation"**
- *Intro:* Two planes leave the equator 100 km apart, both heading due north, and meet at the pole with no force pulling them together.
- *Visual:* V10.
- *Worked example:* ξ(s) = ξ₀cos(s/a) solves ξ″ = −Kξ. In coordinates, D²S^φ/ds² = −Δφ/a² = R^φ_{θθφ}(T^θ)²S^φ (K-C19).
- *Practice:*
  1. Earth, after 1000 km → 98.77 km.
  2. H² after s = 2 → 3.762ξ₀.
  3. Flat plane → ξ constant.
  4. Sign for K > 0 → the geodesics converge.
  5. Tidal ring around Earth: radial stretch is twice the transverse squeeze (2GM/r³ vs GM/r³).
  6. Which component drives meridian deviation? → R^φ_{θθφ}.

#### Symbol glossary starter (each new symbol gets a hover card: name, how to say it, type, meaning, first lesson)
| Symbol | Say | Type / meaning | First |
|---|---|---|---|
| V^μ | "V-upper-mu" | vector components | A1 |
| ω_μ | "omega-lower-mu" | covector components | A3 |
| δ^μ_ν | "Kronecker delta" | identity (1,1) tensor | A2 |
| ε_{ijk}, ε_{μνρσ} | "epsilon" | Levi-Civita symbol / tensor | A2, G-FORMS |
| ∂_μ | "partial-mu" | coordinate derivative; coordinate basis vector | A3, A4 |
| dx^μ | "d-x-mu" | basis covector (one-form) | A3 |
| ⊗ | "tensor product" | builds higher-rank tensors | A5 |
| T_{(μν)}, T_{[μν]} | "symmetrized / antisymmetrized" | parts of T | A5 |
| g_{μν}, g^{μν} | "g-mu-nu" | metric, inverse metric | A6 |
| η_{μν} | "eta" | Minkowski metric | A6 |
| √\|g\| | "root g" | volume factor | A6 |
| ♭, ♯ | "flat, sharp" | lower / raise | G-LIN, A7 |
| Γ^λ_{μν} | "Christoffel symbol" | connection coefficients (not a tensor) | A9 |
| ∇_μ, V^ν_{;μ} | "nabla", "semicolon" | covariant derivative | A9 |
| κ, τ | "kappa, tau" | curve curvature and torsion | C1 |
| T, N, B | "tangent, normal, binormal" | Frenet frame | C1 |
| E, F, G and L, M, N | | first and second fundamental forms | C2, C3 |
| K, H | "Gaussian, mean curvature" | surface curvatures | C3 |
| k_g | "geodesic curvature" | sideways bending within the surface | C5 |
| χ | "chi" | Euler characteristic | C6 |
| T_pM, T*_pM | "tangent / cotangent space at p" | vector spaces at p | C8 |
| φ_*, φ^* | "pushforward, pullback" | moving vectors / forms along maps | C8 |
| [X,Y] | "Lie bracket" | commutator of vector fields | C8 |
| ∧, d, ⋆, i_X | "wedge, d, star, interior product" | exterior calculus | G-FORMS |
| R^ρ_{σμν}, R_{μν}, R, G_{μν} | "Riemann, Ricci, Ricci scalar, Einstein" | curvature | C13, C14 |
| L_X | "Lie derivative along X" | flow derivative | C17 |
| ξ^μ | "xi" | Killing vector | C17 |
| Λ^μ{}_ν | "Lambda" | Lorentz transformation | A4, G-SYM |
| J_i, K_i | "rotation / boost generators" | so(1,3) basis | G-LIEA |

### Gaps
- **MTW table rows not re-checked.** The Landau–Lifshitz (−,+,+) and Weinberg (+,−,−) rows come from domain knowledge (†), as do the "derivative index last" Christoffel ordering in MTW and Wald's units. MTW's original 1973 table could not be re-checked, and it pre-dates Carroll, Schutz, Wald and Hartle; their (+,+,+) classification is derived from their definitions.
- **do Carmo torsion sign is unconfirmed.** I believe he uses b′ = τn, the opposite of the B′ = −τN used here, but I could not check it. It is flagged as "verify before quoting" (P21).
- **Some keys are hand-derived, not machine-checked.** These are labelled in the bank: the stereographic transition map, the derivation and frame-bracket examples, the expanded spherical Laplacian, and the hand-arithmetic practice values.
- **USU materials not located.** I could not find or verify USU sources (Charles Torre's or Ian Anderson's materials, e.g. the Maple *DifferentialGeometry* package with GR and Lie-symmetry tools) in this session. They are a possible tooling and reference lead only.

## 4. Mathematically honest visualization designs (and where common visuals mislead)

### Takeaway
Every visual should be **computed from the metric**, not drawn as a picture:
- geodesics integrated from the geodesic equation;
- arrows parallel-transported with the transport ODE;
- areas, holonomy angles and separations read out live and checked against the K-keys.

Each visual should also carry an explicit "what this picture can't show" note. The most misleading standard visuals are:
- covectors drawn as arrows, or as global level surfaces for forms that aren't closed;
- "curvature = bending" pictures that blur intrinsic and extrinsic curvature;
- parallel transport shown as "the arrow never changes direction in 3D";
- the rubber-sheet / embedding-diagram picture of gravity;
- Lie derivatives drawn as if arrows at different points could be compared directly.

### Cited Findings
- MTW draws one-forms as families of surfaces, with ⟨ω,v⟩ = surfaces pierced. Its "Track 1/Track 2" split separates the visual and the formal treatment. — † Book: MTW ch. 2 and preface.
- Needham's whole approach is visual and geometric. Its Act V develops forms visually and is designed to be largely independent of the rest. — [live] [i-programmer review](https://www.i-programmer.info/bookreviews/65-mathematics/15387-visual-differential-geometry-and-forms.html); [IMSC record](https://library.imsc.res.in/bib/59282)
- Theorema Egregium consequences: the cylinder unrolls isometrically; the sphere does not (every flat map of the Earth distorts). — † [Wikipedia: Theorema Egregium](https://en.wikipedia.org/wiki/Theorema_Egregium)
- Holonomy and Gauss–Bonnet underpin the loop-rotation visuals. — † [Wikipedia: Holonomy](https://en.wikipedia.org/wiki/Holonomy); † [Wikipedia: Gauss–Bonnet theorem](https://en.wikipedia.org/wiki/Gauss%E2%80%93Bonnet_theorem). The numbers each visual must reproduce are in K-C12 [V].
- The Lie derivative is defined through the flow, by pulling the tensor back along it. For vector fields it equals the bracket. — † [Wikipedia: Lie derivative](https://en.wikipedia.org/wiki/Lie_derivative). Verified [V]: L_X∂_x = −∂_y for rotation.
- Geodesic deviation in Riemann terms, and its link to tidal forces. — † [Wikipedia: Geodesic deviation](https://en.wikipedia.org/wiki/Geodesic_deviation). Verified [V]: sphere convergence, hyperbolic divergence, and the Newtonian tidal matrix diag(2,−1,−1)·GM/r³.
- The contravariant/covariant oblique-axes picture. — † [Wikipedia: Covariance and contravariance of vectors](https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors)

### Inferences
Each design lists what the learner manipulates, what is computed (with the matching K-key), the honesty notes, and the common visual it replaces.

- **V1 Basis and components explorer (A1, A4, A7)**
  - *Manipulate:* drag an arrow V; drag or rotate/skew the basis vectors.
  - *Computed:* live parallelogram (upper) components and projection (lower) components, plus g_{ij} = e_i·e_j (K-A0).
  - *Honesty:* the arrow never moves when the basis changes (a passive change); show both component types side by side to kill the idea that "lower = upper with a sign".
  - *Common misleading visual:* oblique axes with one type of component only.
- **V2 Covector stacks (A3, G-FORMS)**
  - *Manipulate:* level lines of f; an arrow V.
  - *Computed:* the signed, fractional count of lines crossed equals df(V). A slider scales the covector; denser stacks mean a larger covector.
  - *"Not closed" mode:* for ω = −y dx + x dy, draw only short local stack segments that *cannot* join into global level curves, and show ∮ω = 2π·r².
  - *Common misleading visuals:* a covector drawn as an arrow (that needs a metric); global level surfaces for non-exact forms; "the gradient is perpendicular to level lines" presented as metric-free (perpendicularity needs g).
- **V3 Coordinate grids under transformation (A4, A6, A8)**
  - *Manipulate:* morph Cartesian ↔ polar (and spherical in 3D); move a probe point.
  - *Computed:* ∂_r and ∂_θ at the probe (∂_θ has length r), the dr and dθ stacks, and the metric's unit "indicatrix" ellipse {V : g(V,V) = 1} drawn in the (r,θ) coordinate plane (axes 1 and 1/r).
  - *Lorentzian mode:* unit hyperbolas and the light cone.
  - *Honesty:* label it *passive*: the grid is a labelling, not a deformation of space. Mark the coordinate singularity at r = 0, where θ is undefined but the plane is smooth.
- **V4 Tangent planes on curved surfaces (C2, C3, C8)**
  - *Manipulate:* sphere, torus, saddle, paraboloid; drag a point.
  - *Computed:* tangent plane, normal, principal directions and K, H (K-C3); a side panel with the Gauss map image, where K is the area ratio.
  - *Honesty:* each tangent plane is a *separate* vector space. Colour them distinctly, and refuse to add arrows from different points. After C7, switch to an "intrinsic view" (a coordinate patch with metric ellipses) to signal that there is no ambient space.
- **V5 Geodesic shooter (C5, C12)**
  - *Manipulate:* initial point and direction on the sphere, cylinder, cone, torus or hyperbolic plane (half-plane or disk).
  - *Computed:* RK4 integration of ẍ + Γẋẋ = 0 from the metric (never pre-baked great circles); an "unroll" button for the cylinder and cone; the Clairaut quantity shown live and constant (K-C9).
  - *Honesty:* show "straightest" and "locally shortest" separately. Past the antipode, show a shorter competing path. On the torus, show bounded and unbounded families.
- **V6 Parallel transport and holonomy (C6, C13)**
  - *Manipulate:* loop tools (latitude slider, geodesic triangle, freehand).
  - *Computed:* the transported arrow integrated with the transport ODE, and a live readout of rotation angle against ∬K dA (= area/a²). It must reproduce 48.23°, 105.44°, 180°, 90° and 47.25° (K-C12). Torus mode shows positive and negative regions; cone mode shows the deficit angle with K = 0 everywhere except the apex.
  - *Honesty:* in R³ the arrow *does* change direction. Show that its rate of change is purely normal (zero tangential change). State that angles are mod 2π and take the loop's orientation. Include a small-loop mode (angle ≈ K × area) as the bridge to Riemann.
- **V7 Intrinsic vs extrinsic curvature (C3, C4)**
  - *Manipulate:* unroll a cylinder onto a plane (lengths and angles preserved; K = 0, H ≠ 0); try to flatten a sphere ("orange peel" tears or stretches); a map-projection gallery with Tissot ellipses; a catenoid ↔ helicoid associate-family slider showing K pointwise constant through the morph and H = 0 (K-C5); the pizza-slice stiffening demo.
  - *Honesty:* label intrinsic (I, K) and extrinsic (II, H) quantities everywhere.
  - *Common misleading visual:* "curvature is how bent it looks".
- **V8 Wedge products as oriented areas (G-FORMS, C9)**
  - *Manipulate:* two vectors u, v spanning a parallelogram, with a circulation arrow.
  - *Computed:* α∧β(u,v) = α(u)β(v) − α(v)β(u), shown as the signed area of the parallelogram's shadow on the α–β plane; swapping u and v flips the sign. In 3D, dx∧dy, dy∧dz and dz∧dx appear as the projected areas on the coordinate planes.
  - *Honesty:* the cross product equals ⋆(α∧β) only in 3D and only with a metric and orientation. Never draw a 2-form as an arrow.
- **V9 Lie derivative as dragging along a flow (C8, C17)**
  - *Manipulate:* an animated flow of X and a second field Y.
  - *Computed:* Y(p) is dragged by the flow for time t and compared with Y at the image point; the difference/t tends to [X,Y] (K-C20). In "flow-box" mode, flowing along X, Y, −X, −Y by ε leaves a gap ≈ ε²[X,Y]: it closes for ∂_r, ∂_θ and fails for the orthonormal polar frame (K-C14). In Killing mode, a Killing flow preserves the shape of a small circle of points; a dilation flow does not.
  - *Honesty:* the comparison uses the flow's pushforward and no connection. Contrast this explicitly with V6.
- **V10 Geodesic deviation and tidal convergence (C16)**
  - *Manipulate:* a fan of meridians leaving the equator parallel.
  - *Computed:* a plot of ξ(s) against ξ₀cos(s/a); hyperbolic divergence ξ₀cosh s; flat (constant). Spacetime mode shows a ring of free-falling particles near Earth, stretched radially (2GM/r³) and squeezed transversely (GM/r³) (K-C19).
  - *Honesty:* no force acts between the geodesics. In spacetime the 4-velocity enters through R^μ_{νρσ}T^νT^ρS^σ, and time curvature dominates for slow particles.
- **V11 "Metric → everything" curvature lab (C11–C14, C18)**
  - *Manipulate:* choose a library metric (sphere, torus, H², S³, Rindler, FLRW, Schwarzschild).
  - *Computed:* Γ, Riemann, Ricci and R from precomputed CAS output (the K-keys). Γ is tagged "coordinate-dependent", the tensors are tagged, and a "flatness detector" shows polar and Rindler giving Riemann = 0.
  - *Honesty:* simplify CAS output (see §3) and display the conventions badge (−+++, MTW +++).
- **V12 Boost and group explorer (G-SYM, G-LIEA)**
  - *Manipulate:* a spacetime diagram with a rapidity slider (axes scissor toward the light cone); two non-collinear boosts composed.
  - *Computed:* the residual Wigner rotation from composed boosts; a "belt trick" animation for SU(2) vs SO(3) (2π vs 4π).
  - *Honesty:* Euclidean drawing distances are not Minkowski lengths, so always show calibration hyperbolas.
- **V13 Embedding-diagram caution panel (cross-link to the GR track)**
  - If a rubber-sheet or Flamm's-paraboloid picture is shown, label it as the geometry of one t = const spatial slice, with a fictitious extra dimension.
  - It does not show time curvature, which dominates ordinary falling. The "marble rolling into a dip" picture uses gravity to explain gravity.

**Implementation note.** The repo already vendors three.js, loaded as ES modules through an importmap (CLAUDE.md). 3D surfaces can use it, while the geodesic, transport and curvature integrators live in DOM-free modules tested headlessly against the K-keys, as `supernova/` and `redline/` already do.

### Gaps
- None of the cited visual-pedagogy sources could be opened, and I found (and could search for) no studies measuring which of these visuals improves learning.
- The rubber-sheet critique is a widely made argument in GR pedagogy. I could not attach a source in this session.
- The specific MTW figure and box numbers for stacks, honeycombs and egg-crates were not confirmed.

## 5. Minimal essentials of topology, groups and Lie theory for GR (plus the remaining Advanced Math G modules: linear algebra, forms, coordinate invariance, signature conventions, natural/geometrized units), and what can be safely skipped

### Takeaway
GR needs only a thin, well-chosen slice of these subjects:
- **Topology:** open sets, continuity, Hausdorff, second countability or paracompactness (stated, not proved), compactness, connectedness, orientability, simply connectedness, and the Euler characteristic.
- **Groups and Lie theory:** group axioms, actions, orbits and stabilizers, matrix Lie groups, the exponential map, commutators and structure constants, so(3)/su(2)/so(1,3), the four components of the Lorentz group, and Poincaré as a semidirect product. Killing fields form the Lie algebra of the isometry group.

Everything beyond this (separation-axiom zoos, homology computations, root systems, representation theory beyond the basics, Sylow and Galois theory) can be skipped or left as optional enrichment. Teach Lie theory through matrix groups (Hall, Stillwell), not abstract manifold theory.

### Cited Findings
- A topological n-manifold is a second-countable Hausdorff space that is locally homeomorphic to Rⁿ. A smooth manifold adds a maximal smooth atlas. Smooth partitions of unity exist on every smooth manifold, and they imply that every smooth manifold admits a Riemannian metric. — † Books: Lee, *Introduction to Smooth Manifolds* (2013), chs. 1–2, 13; *Introduction to Topological Manifolds* (2011).
- The "line with two origins" is locally Euclidean and second countable but not Hausdorff. It is the standard reason for the Hausdorff axiom. — † [Wikipedia: Non-Hausdorff manifold](https://en.wikipedia.org/wiki/Non-Hausdorff_manifold)
- A manifold admits a Lorentzian metric iff it admits a nowhere-vanishing line (direction) field. For compact manifolds this happens iff χ = 0, which rules out S². Relatedly, S² has no nowhere-vanishing tangent vector field. — † Book: Hawking & Ellis, *The Large Scale Structure of Space-Time* (CUP 1973), §2.6; † [Wikipedia: Hairy ball theorem](https://en.wikipedia.org/wiki/Hairy_ball_theorem)
- Gauss–Bonnet ties ∬K dA to χ = 2 − 2g. — † [Wikipedia: Gauss–Bonnet theorem](https://en.wikipedia.org/wiki/Gauss%E2%80%93Bonnet_theorem); † [Wikipedia: Euler characteristic](https://en.wikipedia.org/wiki/Euler_characteristic). Verified [V]: sphere 4π, torus 0.
- O(1,3) has four connected components, distinguished by det Λ = ±1 and the sign of Λ⁰₀. The identity component is the proper orthochronous SO⁺(1,3). The Lorentz group is 6-dimensional, and SL(2,C) is a double cover of SO⁺(1,3). — † [Wikipedia: Lorentz group](https://en.wikipedia.org/wiki/Lorentz_group). Verified [V]: the generator algebra and the boost/rotation exponentials.
- The Poincaré group is the 10-dimensional semidirect product of translations and the Lorentz group, and it is the isometry group of Minkowski space. — † [Wikipedia: Poincaré group](https://en.wikipedia.org/wiki/Poincar%C3%A9_group). Verified [V]: n(n+1)/2 = 10 for n = 4, and the 1+1 Minkowski Killing fields.
- Hall develops Lie theory through *matrix* Lie groups to avoid manifold prerequisites. Stillwell's *Naive Lie Theory* is an undergraduate matrix-group approach that uses quaternions for SU(2) and SO(3). — † Books: B. Hall, *Lie Groups, Lie Algebras, and Representations*, 2nd ed., GTM 222 (2015); J. Stillwell, *Naive Lie Theory*, UTM (2008).
- Baez & Muniain introduce differential forms through electromagnetism (Maxwell's equations) before gauge theory and gravity. — † Book: *Gauge Fields, Knots and Gravity*, World Scientific 1994.
- Nakahara and Frankel treat homotopy, homology, fibre bundles and characteristic classes in depth. That is useful enrichment, but beyond what a first GR course uses. — † Books: Nakahara, *Geometry, Topology and Physics* (2nd ed. 2003); Frankel, *The Geometry of Physics* (3rd ed. 2011).
- Geometrized units set G = c = 1, so mass, length and time share a unit, and conversion uses G/c² (mass → length) or G/c³ (mass → time). — † [Wikipedia: Geometrized unit system](https://en.wikipedia.org/wiki/Geometrized_unit_system); GM_sun = 1.32712440018×10²⁰ m³s⁻² — † [Wikipedia: Standard gravitational parameter](https://en.wikipedia.org/wiki/Standard_gravitational_parameter). Computed [V]: 1476.625 m and 4.9255 μs.
- Planck units: ħ = c = G = 1. — † [Wikipedia: Planck units](https://en.wikipedia.org/wiki/Planck_units). Computed [V] from CODATA values: ℓ_P = 1.6163×10⁻³⁵ m, t_P = 5.3912×10⁻⁴⁴ s, m_P = 2.1764×10⁻⁸ kg.
- MTW and Wald use G = c = 1 throughout; Carroll sets c = 1 but keeps G explicit; Schutz sets c = 1 early and adopts geometrized units later. — † Books (as in §3).

### Inferences
#### Advanced Math G module specifications (only the modules in this scope)
- **G-TOP1 Point-set topology essentials [5]**
  - *Lessons:* T1.1 open sets in Rⁿ (ε-balls) and "nearness without distance"; T1.2 topological spaces, continuity (preimages of open sets are open), homeomorphisms; T1.3 Hausdorff, with the line with two origins; T1.4 compactness (Heine–Borel) and (path-)connectedness; T1.5 second countability, paracompactness and partitions of unity (statement level: "why every manifold can carry a Riemannian metric and why we can integrate").
  - *Archetypes:* (a) decide continuity via preimages; (b) homeomorphic or not, e.g. (−1,1) ≅ R via tan(πx/2), while circle ≇ line because removing a point disconnects the line only; (c) name the axiom a counterexample violates; (d) compact or not for subsets of Rⁿ.
  - *GR:* the manifold definition; uniqueness of limits; compact Cauchy surfaces and closed universes (conceptual).
  - *Skip:* the T0–T4 separation-axiom catalogue, nets and filters, metrization theorems, box vs product topology, Tychonoff, the long line (mention only).
- **G-TOP2 Manifold topology [5]**
  - *Lessons:* T2.1 gluing patches; manifolds with and without boundary; T2.2 orientability (Möbius strip, RP²) and time-orientability; T2.3 loops, simply connected, the fundamental group as an idea (π₁(S¹) = Z, π₁(S²) = 0, π₁(T²) = Z², π₁(SO(3)) = Z₂); T2.4 Euler characteristic and genus (cube 8 − 12 + 6 = 2; torus as a square with glued edges, 1 − 2 + 1 = 0; χ = 2 − 2g), linked to Gauss–Bonnet; T2.5 topology constrains geometry: the hairy ball theorem, Lorentzian metrics on compact manifolds need χ = 0, and dθ is closed but not exact on the punctured plane (K-G2).
  - *Archetypes:* compute χ from a polyhedral decomposition; decide orientability; decide simply connected or not; use Gauss–Bonnet to predict ∬K dA.
  - *Skip:* homology and cohomology computations (dθ and Gauss–Bonnet are the only teasers), higher homotopy groups, CW complexes, covering-space theory beyond SU(2) → SO(3), fibre bundles beyond "the tangent bundle = all tangent spaces glued together", characteristic classes, exotic smooth structures.
- **G-LIN Abstract linear algebra: dual spaces and multilinear maps [6]**
  - *Lessons:* L1 vector spaces beyond arrows (functions, polynomials, tangent spaces); L2 bases, dimension, linear maps, passive vs active change of basis; L3 the dual space V*, dual basis, double dual (V ≅ V** canonically in finite dimensions; V ≅ V* only with extra structure such as a metric); L4 multilinear maps and tensor products (dim V⊗W = mn; not every tensor is u⊗v); L5 symmetric and antisymmetric tensors and Λ^kV (dim C(n,k)); the determinant as the top form; L6 bilinear forms, inner products, Sylvester's law and signature, and ♭/♯.
  - *Archetypes:*
    - Dual basis of e₁ = (1,1), e₂ = (1,−1): e¹ = ½(1,1), e² = ½(1,−1) as row vectors (hand-derived).
    - A 2×2 array is a simple tensor u⊗v iff its determinant is 0.
    - Signature of −du dv (null coordinates): the matrix [[0,−½],[−½,0]] has eigenvalues ±½, so the signature is (−,+).
    - dim Λ²R⁴ = 6 and dim Sym²R⁴ = 10.
  - *Skip:* Jordan form, modules over rings, infinite-dimensional duals, the universal property (mention only).
- **G-GRP Group theory essentials [5]**
  - *Lessons:* G1 symmetry = transformations preserving something (the 8 symmetries of a square); G2 axioms, abelian vs non-abelian (3D rotations don't commute: the book demo); G3 subgroups, homomorphisms, kernels (det: GL(n) → R×); G4 actions, orbits, stabilizers (orbit of the north pole under SO(3) is S², its stabilizer SO(2); rotations of a cube: 24 = 6 × 4); G5 cosets and quotients (S² ≅ SO(3)/SO(2)); direct and semidirect products (Poincaré).
  - *Skip:* Sylow theory, classification of finite groups, solvable and nilpotent groups, Galois theory, presentations.
- **G-LIEG Lie groups [5]**
  - *Lessons:* LG1 matrix groups GL, SL, O, SO, U, SU, O(1,3) by their defining equations (RᵀR = 1, ΛᵀηΛ = η); LG2 groups as manifolds (SO(2) ≅ S¹, SU(2) ≅ S³, SO(3) ≅ RP³; dim SO(n) = n(n−1)/2); LG3 components (O(3) has 2; O(1,3) has 4); LG4 one-parameter subgroups and the matrix exponential; LG5 double covers SU(2) → SO(3) and SL(2,C) → SO⁺(1,3) (light; for spinors).
  - *Archetypes:* membership tests; dimension counts; exp of a generator; which component a given Λ belongs to.
  - *Keys:* K-G1.
  - *Skip:* Haar measure, Peter–Weyl, structure theory, abstract Lie groups.
- **G-LIEA Lie algebras [5]**
  - *Lessons:* LA1 the tangent space at the identity (Xᵀη + ηX = 0 for Lorentz); LA2 commutators and structure constants, so(3); LA3 su(2) ≅ so(3); LA4 so(1,3) and why boosts don't close (the Wigner rotation); LA5 vector fields form a Lie algebra, and Killing fields form the isometry algebra (S² brackets).
  - *Archetypes:* compute generator commutators; test Lie-algebra membership; read off structure constants; second-order BCH (e^Xe^Y ≈ e^{X+Y+½[X,Y]}) to show that small rotations fail to commute at second order.
  - *Pitfalls:* P37, P42. *Keys:* K-G1, K-C20.
  - *Skip:* root systems, Dynkin diagrams, classification, universal enveloping algebras, Lie algebra cohomology, higher-order BCH.
- **G-SYM Symmetry groups: rotations, Lorentz, Poincaré [6]**
  - *Lessons:* S1 SO(3), axis–angle, non-commutativity; S2 Lorentz transformations (ΛᵀηΛ = η; boosts, rapidity; light-cone preservation); S3 composing boosts and the Wigner rotation (visual V12); S4 Lorentz group structure (6 generators; P, T and the 4 components); S5 Poincaré (10 parameters = Minkowski Killing vectors); S6 isometry groups of curved spaces: S² ↔ SO(3), H² ↔ SO⁺(1,2) via the hyperboloid (K-C11). A generic curved spacetime has *no* Killing vectors; only local Lorentz symmetry survives in each tangent space.
  - *Archetypes:* boost matrices and invariance of the interval; rapidity addition; component classification; Killing fields of 1+1 Minkowski (two translations and the boost x∂_t + t∂_x, K-C20).
  - *Pitfalls:* P37–P39.
- **G-FORMS Differential forms and exterior calculus [7]**
  - *Lessons:* F1 one-forms as line-integral machines; F2 wedge, 2-forms as oriented-area meters, 3-forms as volume meters; F3 d unifies grad, curl and div, and d² = 0; F4 closed vs exact (dθ); F5 generalized Stokes (Green, Stokes and divergence as one theorem); F6 pullback and change of variables (dx∧dy = r dr∧dθ), interior product, Cartan's formula; F7 the Hodge star (Euclidean 3D, Minkowski) and a Maxwell teaser (dF = 0).
  - *Archetypes:* wedge two 1-forms; compute d; decide closed or exact; verify Stokes on a disk; pull back under polar coordinates; ⋆ of basis forms.
  - *Pitfalls:* P35, P36, plus "dθ is not exact although written d(·): θ is not a single-valued function on R²∖{0}".
  - *Keys:* K-G2, K-C20.
  - *Placement:* after A5 (needs antisymmetric tensors) and CALC3 (line and surface integrals). C9 lifts it to manifolds.
- **G-COV Coordinate invariance (general covariance) [4]**
  - *Lessons:* CI1 passive vs active transformations; CI2 invariant (scalar), covariant (tensor equation) or neither (Γ, ∂_μV^ν); CI3 "a tensor equation true in one chart is true in all", and the comma → semicolon rule, including its ambiguity (curvature-coupling terms; a GR-track topic); CI4 coordinate artifacts vs geometry: polar Γ, Rindler, the sphere's poles, r = 2M with finite Kretschmann, and diffeomorphisms as gauge freedom (light).
  - *Archetypes:* classify expressions; prove a contraction invariant; detect flatness via Riemann (K-A8, K-C15); decide whether a singularity is real via invariants (K-C17).
- **G-SIG Signature conventions [3]**
  - *Lessons:* SG1 signature and Sylvester's law; "East-coast" (−+++) vs "West-coast" (+−−−) usage; SG2 MTW's three signs and the author table (§3); SG3 translating between conventions with the g → −g table (§3).
  - *Archetypes:* convert u·u, p_μ and T^0{}_0 between signatures; classify a book's convention from its stated Riemann and Einstein formulas; find the sign errors in a mixed-convention derivation.
- **G-UNITS Natural and geometrized units [3]**
  - *Lessons:* U1 c = 1 (time ↔ length: 1 m ↔ 3.3356 ns); U2 G = c = 1 (M ↔ GM/c² ↔ GM/c³; the Sun is 1476.6 m or 4.9255 μs; Earth is 4.435 mm); restoring units by dimensional analysis (r_s = 2M → 2GM/c² = 2953 m for the Sun); U3 Planck units and particle-physics ħ = c = 1, plus which books use which convention.
  - *Archetypes:* convert in both directions; restore G and c in a formula; sanity-check orders of magnitude.
  - *Pitfall:* P40.

#### What GR genuinely uses vs what to skip (summary)
| Area | Must have (GR uses it) | Light touch | Skip / enrichment only |
|---|---|---|---|
| Point-set topology | open sets, continuity, homeomorphism, Hausdorff, compactness, connectedness | second countability, paracompactness, partitions of unity (statements) | separation-axiom zoo, nets and filters, metrization, Tychonoff |
| Manifold topology | charts and atlases, orientability, Euler characteristic, simply connected | π₁ as an idea; time-orientability; Lorentz-metric existence (χ = 0) | homology/cohomology machinery, higher homotopy, CW complexes, characteristic classes |
| Linear algebra | dual spaces, multilinear maps, tensor products, (anti)symmetric tensors, signature | Λ^k and determinants as top forms | Jordan form, modules, infinite-dimensional duals |
| Groups | axioms, homomorphisms, actions, orbits and stabilizers | cosets and quotients; semidirect products | Sylow, classification, Galois |
| Lie theory | matrix groups, exp map, commutators, so(3), su(2), so(1,3); Lorentz components; Poincaré; Killing algebras | double covers SU(2) → SO(3), SL(2,C) → SO⁺(1,3) | roots and Dynkin diagrams, classification, representation theory beyond spin basics, Haar measure |
| Forms | wedge, d, Stokes, volume form, Hodge star | Cartan's formula, interior product | de Rham theory in depth; Cartan structure equations as an *optional* fast-curvature lesson |

### Gaps
- **Lorentzian-metric existence not re-checked.** The Hawking & Ellis criterion (a Lorentz metric exists iff there is a nowhere-vanishing line field; for compact manifolds, iff χ = 0) and the exact section number come from domain knowledge (†).
- **Unit conventions per book not re-checked.** Statements about which book uses which units are † and could not be verified. Hartle's exact switch-over point to geometrized units is not stated, because I am unsure of it.
- **Hall and Stillwell scope not confirmed.** I could not check their tables of contents. Their "matrix groups first" character is well known but was not re-checked (†).
- **No live sources for this section.** Search was exhausted, so no syllabus survey of what graduate GR courses actually require from topology or Lie theory could be done. The "must have / skip" table is a judgement based on the cited textbooks and on what the GR keys in §3 actually use.
