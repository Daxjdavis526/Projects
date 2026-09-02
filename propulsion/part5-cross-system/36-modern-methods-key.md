# Module 36 — Modern Engineering Methods · Answer key

Solutions to the problems and quiz in
[`36-modern-methods.md`](36-modern-methods.md). Numerical answers are
recomputed with `tools/rocket.py`; the registry is
`tools/examples/36.py`.

---

## K1. Problem solutions

### Conceptual

**C1 — verification, validation, qualification.**

| | question | evidence | commonly mistaken for it |
|---|---|---|---|
| Verification | did I solve the equations right? | a grid-convergence study showing the observed order of accuracy on the quantity of interest, plus a code-verification result against a manufactured or analytic solution | residual plots — residuals falling six orders says the iteration converged, not that the discretisation is adequate |
| Validation | did I solve the right equations? | a comparison against experiment with *both* uncertainties stated, ideally a blind prediction | a calibration — agreement achieved by tuning free parameters to that same data |
| Qualification | may this article fly? | a completed verification matrix in which every requirement has been closed by test, analysis, inspection or demonstration on the flight configuration | a validated model — a model is at most one input to a qualification argument |

The key structural point: verification contains no experiment, validation
contains exactly one class of experiment (a validation experiment, designed
to be informative about the model), and qualification is about the article,
not the model.

**C2 — GCI from two grids on a reacting LES.** Two reasons the ±9 % is not a
discretisation error bar:

1. **In LES the grid is part of the model.** The filter width is tied to the
   cell size, so refining changes the subgrid stress and the effective
   chemistry closure — the two runs are two *different models*, not two
   discretisations of one model. Richardson extrapolation assumes a single
   continuous solution being approached; there is none.
2. **Two grids cannot establish the observed order of convergence**, so $p$
   must be assumed (usually the formal order), and there is no evidence the
   solutions are in the asymptotic range. An 18 % change on a 8× cell-count
   increase is itself weak evidence that they are not.

A third, if asked: for a time-averaged LES quantity, part of the 18 % may be
**statistical**, not discretisation — different runs, different sample
lengths.

What should be reported instead: (i) the fraction of turbulent kinetic
energy resolved (a common target is >80 % in the region of interest);
(ii) a statistical-convergence demonstration — the running mean of the
quantity of interest flat over the last several flow-through times, with an
error bar from block averaging; (iii) a **model-sensitivity study** — change
the subgrid model and the mechanism and report the spread, since that is
almost certainly larger than the numerical error; and (iv) an explicit
statement that no discretisation error bar is claimed.

**C3 — chamber pressure and $I_{sp}$.** In the ideal formulation
$I_{sp}=c^*C_F/g_0$ with $c^*=\sqrt{RT_0}/\Gamma(\gamma)$: $c^*$ contains no
$p_c$ at all. And in vacuum ($p_a=0$),

$$C_F=\sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}\left[1-\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]}+\varepsilon\frac{p_e}{p_c}$$

depends on $p_c$ only through $p_e/p_c$, which for isentropic attached flow
is a function of $\varepsilon$ and $\gamma$ alone. So raising $p_c$ at fixed
$\varepsilon$ changes nothing. At sea level the pressure term becomes
$\varepsilon(p_e-p_a)/p_c$ and $p_a/p_c$ falls as $p_c$ rises, so higher
$p_c$ *does* raise sea-level $I_{sp}$ — but through the ambient term, not
through the exhaust velocity.

What $p_c$ actually buys: (i) **thrust density** — $F=C_F p_c A_t$, so a
higher $p_c$ gives the same thrust from a smaller, lighter chamber;
(ii) **expansion ratio within a fixed length or diameter** — a smaller throat
at the same exit diameter is a larger $\varepsilon$, and *that* raises
vacuum $I_{sp}$; (iii) a small real gain from reduced dissociation and
better recombination (equilibrium $T_0$ rises weakly with $p_c$; Module 04
gives ~250 K for LOX/LH2 from 20 to 200 bar). What it costs: heat flux
($\propto p_c^{0.8}$), pump power, turbine work, wall stress, and life.

**C4 — flamelet CFD, flux right, stability wrong.** The model is validated
**for the quantity of interest "mean wall heat flux", in the validation
domain of the test conditions, to about 6 % plus the experiment's own
uncertainty.** It is not validated for stability, and no amount of agreement
on a *mean* quantity licenses a claim about an *unsteady* one. The stability
prediction was in fact outside the model's applicability in two separate
ways: a steady flamelet library cannot represent the unsteady flame response
that supplies the Rayleigh-criterion phase, and a RANS/URANS closure has
averaged away the fluctuations whose correlation with pressure decides
stability. Validation is always a statement about (quantity of interest,
domain, tolerance) — never about a model as such.

**C5 — why liner LCF predictions are optimistic**, ranked for an AM
GRCop-42 chamber [J]:

1. **Thermal load understated by using a circumferential mean rather than
   the streak.** Largest and most reliably present. Worked Example 2 shows a
   1.55 peak/mean flux ratio turning into roughly a factor-2 life reduction.
2. **Coupon material ≠ part material.** AM ductility, anisotropy and defect
   population differ from the wrought coupon the Coffin–Manson coefficients
   came from, and there is generally no A-basis allowable to fall back on.
   Direction of the error is unfavourable and the magnitude is
   programme-specific.
3. **Isothermal LCF data applied to a thermomechanical cycle.** TMF life at
   a given strain range is materially worse than isothermal LCF, and the
   coefficients almost always come from isothermal tests.
4. **Environment.** Hydrogen blanching (or oxidation, or methane-side
   deposition) attacks the hot wall progressively; not in the coefficients.
5. **As-built geometry.** Channel and land dimensions carry tolerance; the
   thinnest land in the part governs, not the nominal.

**C6 — Lagrangian spray above the critical pressure.** LOX's critical
pressure is 5.04 MPa; a 100 bar chamber is ~20× critical. Above the critical
point there is no liquid–vapour interface: surface tension vanishes, latent
heat vanishes, and the distinction between drop and gas ceases to exist. A
Lagrangian droplet model is built entirely out of those three things (drag on
a sphere with a surface, $B_M$-driven evaporation with a latent heat, a
prescribed initial drop size from a Weber-number breakup correlation), so
every term is meaningless. What replaces it: a **single-phase, real-fluid
Eulerian** treatment with a cubic or higher equation of state, high-pressure
transport properties, and no phase change. What changes about the answer:
mixing is governed by turbulent entrainment of a dense fluid rather than by
droplet ballistics and vaporisation, the characteristic "spray angle" is
replaced by shear-layer growth with strong density stratification, and the
mixing length is typically shorter than a droplet model predicts. Getting
this wrong is a common and consequential error [OY93].

**C7 — twin versus design model.** A twin adds, over a design model:
as-built dimensions and part serial numbers for *this* article (measured
throat area, measured channel geometry, AM build IDs and orientations); a
ROM whose component maps have been recalibrated to *this* engine's
acceptance data; an accumulated damage/life state (LCF cycles, bearing
DN-hours, creep time at temperature); maintenance and anomaly history; and
an update mechanism plus updated parameter uncertainties.

Two life-determining quantities that must be inferred: **hot-wall liner
temperature** (no flight instrumentation survives there; inferred from
coolant $\Delta T$, chamber pressure and a thermal model — so it inherits
the model's $h_g$ error) and **turbine blade metal temperature** (inferred
from gas-path temperature, flow and a blade heat-transfer model). A third
acceptable answer: **channel-to-channel coolant flow split**, inferred from
manifold pressures and a flow-network model.

**C8 — optimum on a variable bound.** Two interpretations: (a) the bound is a
**real physical or programmatic constraint** and the design genuinely wants
to sit against it — in which case the interesting output is the shadow price
(what would relaxing the bound buy?); or (b) the bound is an **artefact** —
a range typed in to keep the optimiser out of trouble — and the optimum is
an artefact with it, meaning the model is missing the physics that would
have limited the variable naturally (here, almost certainly a
combustion-stability or manufacturability constraint on element count and
spacing).

How to tell them apart: relax the bound and re-run. If the optimum moves to
the new bound and the objective keeps improving monotonically, the model has
no internal limit on that variable and interpretation (b) holds — go and
find the missing constraint. If the optimum moves off the bound and settles,
(a) held and you have now found the real optimum. Also check whether any
*other* constraint became active; an artefactual bound often masks a real
one.

### Calculation

**N1 — improved characterisation.** Logarithmic sensitivities from §5.1 are
per-$\sigma$ contributions, so rescale each to the new $\sigma$:

- $\eta_{c^*}$: was 1.000 % at $\sigma=1.0\,\%$ → sensitivity 1.000 per % →
  new contribution $0.4\times1.000=0.400\,\%$.
- $T_0$: was 0.747 % at $\sigma=1.5\,\%$ → sensitivity 0.498 per % → new
  contribution $1.0\times0.498=0.498\,\%$.
- $\gamma$ 0.536 %, $\mathcal{M}$ 0.348 %, $\varepsilon$ 0.025 %, $p_c$ 0 —
  unchanged.

$$\sigma_{I_{sp}}/I_{sp}=\sqrt{0.400^2+0.498^2+0.536^2+0.348^2+0.025^2}=0.904\ \%$$

Down from 1.4025 %. In seconds: $\sigma$ falls from 4.91 s to 3.17 s. The 3σ
low bound moves from $350.14(1-0.042075)=335.41$ s to
$350.14(1-0.027117)=340.65$ s — **a gain of 5.24 s of guaranteed
performance for no hardware change at all.** That is the argument for the
subscale campaign, made in the currency the programme cares about.

Note the diminishing return: $\eta_{c^*}$ was 51 % of the variance before
and is 20 % after; $\gamma$ is now the largest single contributor (35 %), and
the next useful action is to settle which $\gamma$ the performance model
should use, not to test more.

**N2 — DNS cell count.** $N\sim Re^{9/4}=(8\times10^5)^{2.25}=1.91\times
10^{13}$ cells (the scale separation $L/\eta_K=Re^{3/4}\approx2.7\times10^4$
cubed). At $10^{5}$ cell-updates per core-second on $10^{5}$ cores, one
update of the whole field is $1.91\times10^{13}/10^{10}=1.9\times10^{3}$ s
$\approx$ **0.5 hours per time step**. A meaningful simulation needs
$\gtrsim10^{5}$ time steps, i.e. ~5×10⁴ hours ≈ 6 years of dedicated
machine time — and that is for a *cold*, single-species flow. Comment: DNS
of an engine chamber is not a matter of waiting for faster computers; it is
several orders of magnitude away, the cost scales as $Re^3$, and reacting
chemistry makes it worse. DNS's role is model development on canonical
problems.

**N3 — Bartz at 200 bar.**

| | $p_c=100$ bar | $p_c=200$ bar |
|---|---|---|
| $C_{F,\text{vac}}$ | 1.9294 | 1.9294 (unchanged — vacuum, same $\varepsilon,\gamma$) |
| $A_t$ | 5.183×10⁻³ m² | 2.591×10⁻³ m² |
| $D_t$ | 81.23 mm | 57.44 mm |
| $h_g$ | 3.427×10⁴ W/(m²K) | 6.394×10⁴ W/(m²K) |
| $q$ | 77.07 MW/m² | **143.81 MW/m²** |

Ratio $=1.866$. Naive $p_c^{0.8}$ gives $2^{0.8}=1.741$. The difference is
the $D_t^{-0.2}$ term: at fixed thrust and $C_F$, doubling $p_c$ halves
$A_t$ and so scales $D_t$ by $2^{-1/2}$, giving an extra factor
$2^{0.1}=1.072$. Total $2^{0.8}\times2^{0.1}=2^{0.9}=1.866$ — exactly the
computed ratio. **Lesson: the familiar "$q\propto p_c^{0.8}$" holds at fixed
geometry; at fixed thrust the throat shrinks and the flux rises faster, as
$p_c^{0.9}$.** This is a large part of why high-$p_c$ engines are so much
harder to cool, and it is why BE-4's 140 bar looks increasingly sensible.

**N4 — grid convergence.** With $f_3=58.2$ (coarse), $f_2=61.7$,
$f_1=62.9$ (fine) and $r=2$:

$$p=\frac{\ln\!\left(\dfrac{f_2-f_3}{f_1-f_2}\right)}{\ln r}=\frac{\ln(3.500/1.200)}{\ln 2}=\frac{\ln 2.9167}{0.6931}=1.544$$
$$\epsilon_{21}=\frac{f_1-f_2}{f_1}=\frac{1.2}{62.9}=0.01908,\qquad \mathrm{GCI}_{\text{fine}}=\frac{1.25\times0.01908}{2^{1.544}-1}=1.24\ \%$$

i.e. $62.9\pm0.78$ MW/m². Richardson extrapolation gives
$f_{h\to0}=f_1+(f_1-f_2)/(r^p-1)=63.5$ MW/m².

Is it asymptotic? **Reasonably, yes.** The sequence is monotone, the ratio
$(f_2-f_3)/(f_1-f_2)=2.92$ is comfortably above 1 (so the solution is
converging, not diverging), and $p=1.54$ is a plausible observed order for a
nominally second-order scheme with limiters active. Caveats worth stating:
$p$ below the formal order suggests limiter activity or under-resolved
features; a single triplet gives no confidence interval on $p$ itself; and a
GCI on heat flux says nothing about the turbulence-model error, which for
this quantity is probably several times larger than 1.24 %.

**N5 — frequency-driven bracket.**

$$k=(2\pi f_1)^2 m=(2\pi\times400)^2\times2.0=1.263\times10^{7}\ \mathrm{N/m}=12.63\ \mathrm{MN/m}$$
$$I=\frac{kL^3}{3E}=\frac{1.263\times10^{7}\times0.25^{3}}{3\times113.8\times10^{9}}=5.782\times10^{-7}\ \mathrm{m^4}$$
$$A_f=\frac{2I}{h^2}=\frac{2\times5.782\times10^{-7}}{0.01}=1.156\times10^{-4}\ \mathrm{m^2}\ (115.6\ \mathrm{mm^2})$$
$$m_{\text{flanges}}=4430\times2\times1.156\times10^{-4}\times0.25=0.256\ \mathrm{kg};\quad \text{tapered }0.192\ \mathrm{kg}$$
$$m_{\text{ideal}}=0.192+0.078\ (\text{web})=\mathbf{0.27\ kg}$$

**The deflection requirement drives**: it demanded $k\ge20$ MN/m, the
frequency requirement only 12.6 MN/m. So the §5.3 answer (0.38 kg) stands and
the frequency requirement is satisfied with margin
($f_1=\frac{1}{2\pi}\sqrt{20\times10^6/2.0}=503$ Hz).

A full mark answer notes that this simple treatment ignores the bracket's own
distributed mass (which lowers $f_1$ — a Rayleigh correction adds roughly
33 % of the beam mass to the tip mass, here about 0.13 kg, dropping $f_1$ to
about 487 Hz, still above 400 Hz) and that a real modal analysis would use
the FEA, not $\sqrt{k/m}$.

**N6 — Coffin–Manson, mean versus peak.** With
$\Delta\varepsilon_p/2=\varepsilon_f'(2N_f)^c$, invert:
$N_f=\tfrac12\left(\dfrac{\Delta\varepsilon_p/2}{\varepsilon_f'}\right)^{1/c}$.

- Mean: $\Delta\varepsilon_p=0.014$ → $\Delta\varepsilon_p/2=0.0070$;
  $(0.0070/0.30)^{1/(-0.60)}=(0.023\overline{3})^{-1.667}=524.9$;
  $N_f=\mathbf{262}$ cycles.
- Peak (×1.55): $\Delta\varepsilon_p=0.0217$ → $N_f=\mathbf{126}$ cycles.
- Ratio $=2.08$, which is exactly $1.55^{1/0.6}=1.55^{1.667}$.

**Interpretation.** A 55 % local overshoot in heat flux — a quantity the 1-D
model cannot see and the CHT exists to find — halves the life. If the
requirement is 25 cycles, both numbers pass and the design is fine; if the
requirement is 150 cycles, using the mean would have certified a chamber
that fails at 126. Note also that this is the *analysis* ratio only; the real
knockdowns of C5 apply on top.

**N7 — engine-balance uncertainty.** Contributions $|s_i|\sigma_i$:

| input | $s_i$ | $\sigma_i$ (%) | contribution (%) | $S_i$ |
|---|---|---|---|---|
| 1 | +0.90 | 1.0 | 0.900 | 0.377 |
| 2 | −0.50 | 1.5 | 0.750 | 0.262 |
| 3 | +0.30 | 2.0 | 0.600 | 0.168 |
| 4 | +0.25 | 0.8 | 0.200 | 0.019 |
| 5 | −0.20 | 3.0 | 0.600 | 0.168 |
| 6 | +0.10 | 1.2 | 0.120 | 0.007 |

$$\sigma_{p_c}/p_c=\sqrt{\textstyle\sum(\cdot)^2}=\mathbf{1.465\ \%}$$

Characterise **inputs 1 and 2** (64 % of the variance between them). If both
were halved in uncertainty, the total falls to
$\sqrt{0.45^2+0.375^2+0.6^2+0.2^2+0.6^2+0.12^2}=1.036\,\%$ — a 29 %
reduction. Note the trap: input 5 has the *largest* raw uncertainty (3 %) but
a small sensitivity, and input 4 has a respectable sensitivity but a small
uncertainty; neither is worth money. **Sensitivity alone and uncertainty
alone both mislead; only the product matters.**

**N8 — Monte Carlo standard error and tails.**

$$\mathrm{SE}(\hat\mu)=\frac{\sigma}{\sqrt N}=\frac{4.9}{\sqrt{5000}}=\mathbf{0.069\ s}$$

For the 0.13th percentile ($p=0.00135$), the standard error of the sample
quantile is $\sqrt{p(1-p)/N}\big/ f(x_p)$, where $f$ is the density there.
For a normal, $f(x_{-3\sigma})=\phi(3)/\sigma=0.004432/4.9=9.045\times10^{-4}$
per second. At $N=5000$:

$$\mathrm{SE}(\hat q)=\frac{\sqrt{0.00135\times0.99865/5000}}{9.045\times10^{-4}}=0.574\ \mathrm{s}$$

To match the 0.069 s precision of the mean requires
$N=p(1-p)/[f\cdot\mathrm{SE}]^2=3.4\times10^{5}$ samples — about **69×** more.

Comment: tail estimation is expensive because (i) only $pN$ samples land in
the tail, so the effective sample size is 6.75 at $N=5000$, and (ii) the
density is small there, so a small error in rank becomes a large error in
value. This is why reliability problems use importance sampling, subset
simulation or first/second-order reliability methods rather than crude Monte
Carlo, and why a "$10^{-6}$ reliability" claim from a plain Monte Carlo of
$10^{4}$ samples is arithmetically impossible.

### Engineering reasoning

**R1 — CHT 45 % above Bartz, no film cooling.** Order of checking, cheapest
and most likely first:

1. **Near-wall mesh and wall treatment.** Ask for a contour plot of $y^+$ on
   the hot wall — this is the single plot to demand first. If $y^+$ is in the
   buffer layer (roughly 3–30) the wall treatment is in its worst regime and
   the flux is unreliable in either direction.
2. **Is the reported quantity what you think it is?** Circumferential mean,
   or maximum? At the geometric throat, or at the peak-flux station (which is
   usually slightly upstream)? Total flux including radiation, or convective
   only? A surprising fraction of "disagreements" are definitional.
3. **Turbulence model and its behaviour in acceleration.** $k$–$\epsilon$
   with a poor treatment of strong favourable pressure gradient can go either
   way; models that do not account for laminarisation in the throat
   over-predict.
4. **Boundary conditions.** Is $T_{wg}$ in the CFD the same as the one you
   used in Bartz? Bartz flux is proportional to $(T_{aw}-T_{wg})$; a 200 K
   difference in assumed wall temperature is a 9 % flux difference here. Is
   the CFD's inlet enthalpy consistent with your $T_0$?
5. **Physical mechanisms Bartz lacks.** A recirculation zone impinging on the
   wall, a hot streak from element placement, strong throat curvature
   ($r_c/D_t$ smaller than assumed), or a mixture-ratio distribution that
   makes the near-wall gas hotter than the mean. Any of these is a legitimate
   reason to exceed Bartz — but each is *identifiable in the solution*, so
   ask to be shown it.
6. **Radiation.** For a sooting hydrocarbon flame, radiation can be 5–20 % of
   the total flux and Bartz contains none of it. Check whether it is switched
   on and, if so, subtract it before comparing.

If after all that the excess remains unexplained: **design the cooling to
the higher number and go get a calorimetric subscale measurement**, because
an unexplained 45 % on the quantity that sets liner life is not something to
resolve by argument.

**R2 — one of three investments.** The defensible answer depends on the
programme, but the reasoning must be in terms of what each option *retires*
and whether an alternative exists.

- **(a) Full-face reacting LES.** Retires: in principle, the mixture-ratio
  maldistribution and streak pattern across the face. Cost: highest. Risk: it
  is the option with the weakest validation basis — you have no methalox
  element data to validate it against, so the LES would be an unvalidated
  prediction. It also retires none of the top-three risks *directly*: liner
  life needs a flux measurement, $\eta_{c^*}$ needs a performance
  measurement, AM scatter needs coupons.
- **(b) Subscale calorimetric hot fire at three mixture ratios.** Retires:
  $\eta_{c^*}$ at real thermodynamic state (risk #2), gas-side heat flux by
  direct measurement (the dominant input to risk #1), ignition behaviour, and
  — as a by-product — the calibration of both the 1-D model and any future
  CFD. It is the only option that produces validation data.
- **(c) AM coupon programme in three orientations.** Retires: risk #3
  directly, and it is the option with **no alternative** — there is no
  analysis, no simulation and no supplier datasheet that substitutes for
  coupons from your build, your powder lot, your parameters. Everything else
  on the list has a fallback; this does not.

**Recommended answer [J]:** take **(b)**, and fund a *minimum* coupon
programme (c) out of the remaining half-budget, because (c) is
non-substitutable and comparatively cheap — a coupon build plus tensile,
LCF and metallography is a fraction of a hot-fire campaign. Decline (a):
without validation data an LES is an expensive opinion, and (b) generates
exactly the data that would make a future LES worth running. A strong answer
also notes that (b) partially retires (a)'s question, since calorimetric
segments give a coarse axial flux distribution, and that Bartz plus a
peaking factor covers the streak question conservatively in the interim.

An answer choosing (c) as primary is also defensible if the liner design is
already heritage-scaled and the AM process is new — the marking criterion is
the reasoning, not the choice.

**R3 — twin residual drift inside the band.**

*Interpretation.* The ±1.5 % band is a **fleet** acceptance criterion; it
answers "is this engine like the others?" The twin's residual answers a
different and sharper question: "is this engine like *itself*?" A monotonic
0.9 % drift across five tests is a **trend**, and a trend is information that
a band cannot contain. Plausible physical causes, in rough order: gradual
throat erosion or deposit build-up (changes effective $A_t$); injector
element fouling or coking (changes $C_d$ and $\eta_{c^*}$); pump performance
degradation from seal or clearance wear; instrumentation drift in the
pressure transducer itself.

*What to do.* First, **check the instrument** — recalibrate or cross-compare
against a redundant transducer, because a drifting sensor is the most common
cause and the cheapest to exclude. Second, look at whether the twin's
*other* residuals move consistently: if $\eta_{c^*}$ drifts but flow rates
and pump head do not, the injector or throat is implicated; if pump head
drifts, the turbomachinery is. Third, inspect — borescope the injector face
and measure the throat. Fourth, extrapolate the trend against the acceptance
limit and decide whether the next test would exit the band.

*What you must not conclude.* Not that the engine is failing — five points
is a short series, and you have not excluded instrumentation. Not that the
fleet has a problem — this is one article. And not that the band is
adequate: the episode shows that a within-band engine can be systematically
changing, which is precisely the argument for twin-based, residual-monitoring
acceptance rather than band-based acceptance.

**R4 — argue against §3.18.** A full-credit answer picks one area, states the
strongest opposing case honestly, and then adjudicates. Model answer for
**combustion instability**:

*The case that simulation is becoming the design basis.* High-fidelity LES
with finite-rate chemistry has reproduced the onset, frequency and
limit-cycle amplitude of instability in model combustors, including
configurations where the stability boundary was crossed by a geometric
parameter. The cost per case has fallen by orders of magnitude over two
decades and continues to fall. Unlike the empirical route, simulation gives
the *mechanism* — where the heat release is in phase with the pressure — and
therefore tells you what to change, which bomb testing never does. And the
empirical alternative is not free: the F-1's 2,000 tests were affordable only
in an Apollo-scale budget, and no modern programme can repeat it.

*Why I do not (yet) accept it.* Three reasons. First, the demonstrated cases
are *postdictions* of well-characterised rigs with known answers; the
programme-relevant question is a blind prediction for a new full-scale
chamber, and the public record of that is thin. Second, the reported
sensitivity to mechanism, subgrid model and inflow specification is
comparable to the effect size, so the error bar overlaps both "stable" and
"unstable" — a result that cannot discriminate cannot certify. Third, and
decisively, certification is a *regulatory* as well as a technical act: a
bomb test is an unambiguous, observable, reproducible demonstration on the
flight article, and no analysis can occupy that role until a credibility
argument at NASA-STD-7009 levels exists for it. *What would change my mind:*
a documented blind prediction of the stability boundary of a new full-scale
chamber, with a stated uncertainty, followed by a bomb test that confirms it
— repeated on three unrelated engines.

**R5 — surrogate optimum with high variance.** In order:

1. **Check the query point against the training hull.** High GP variance
   usually means "no data here". If it is outside the convex hull of the
   training set in any dimension, treat the result as an extrapolation and
   do not report it as a design.
2. **Evaluate the point with the high-fidelity model** (the CFD it was
   trained on). This is non-negotiable: the optimiser's job was to *propose*
   a candidate, not to evaluate it.
3. **Compare.** If the CFD confirms the improvement — you have found a real
   design and a training-set gap; add the point, refit, continue.
   If the CFD does not — you have found a **surrogate artefact**, which is
   the expected outcome given the variance, and it is exactly the failure
   mode in §3.15: the optimiser is an adversary that seeks the region where
   the surrogate most over-predicts.
4. **Either way, add the new point to the training set and refit**, then
   re-optimise. This is the standard efficient-global-optimisation loop; the
   variance that flagged the problem is also the mechanism that fixes it.
5. **If the improvement is confirmed, ask whether it is physical.** A 1.8 %
   $\eta_{c^*}$ gain should have a mechanism you can name — better
   atomisation, longer effective mixing length, reduced wall-film mass. If
   nobody can name it, suspect the CFD, not just the surrogate.

*What you are looking for throughout:* whether the surrogate's optimism is
a discovery or an artefact — and the only instrument that distinguishes them
is the high-fidelity model, or a test.

---

## K2. Quiz answers

**Q1 (8).** *Verification*: did I solve the equations correctly — a purely
numerical/mathematical question about discretisation, iteration and code
correctness. *Validation*: are those the right equations for this physical
problem, and within what tolerance — answered by comparison with experiment.
**Validation requires an experiment; verification does not.** (4 marks each;
lose 4 for swapping them, which is the common error.)

**Q2 (10).** Reasons the flux is unreliable: (i) $y^+=60$ places the first
cell in the log layer, so the entire near-wall thermal gradient — where the
flux is actually determined — is supplied by a wall function rather than
resolved, and standard wall functions are derived for near-isothermal,
low-Mach, incompressible boundary layers, not for a 2,200 K drop across a
compressible layer with strong property variation; (ii) the result will
therefore be insensitive to further refinement *away* from the wall, giving a
false appearance of grid convergence. Cheap check: **refine only the
wall-normal spacing** (drop $y^+$ toward 1) with the rest of the mesh
unchanged and see how far the flux moves — if it moves 30 %, the original
number was a wall-function artefact. Equally acceptable: a Bartz comparison,
which would show the CFD low by roughly the classic wall-function deficit.
(4 + 3 + 3)

**Q3 (12).**

$$\sigma_{\text{tot}}=\sqrt{1.00^2+0.75^2+0.54^2+0.35^2}=\mathbf{1.406\ \%}$$
$$S_{\eta}=\left(\frac{1.00}{1.406}\right)^2=\mathbf{0.506}$$
$$\text{halved: }\sqrt{0.50^2+0.75^2+0.54^2+0.35^2}=\mathbf{1.108\ \%}$$

(4 + 4 + 4.) Note for full marks: halving the dominant contributor cuts the
total by only 21 %, not 50 % — quadrature is unforgiving, and this is the
standard reason "just improve the biggest one" produces disappointing gains.

**Q4 (10, 2 each).**

| | can steady RANS predict it? | why |
|---|---|---|
| (i) mean wall heat flux | **Yes**, in principle, with adequate near-wall resolution and a suitable model — this is a mean quantity and it is what RANS is for | |
| (ii) 1T limit-cycle amplitude | **No.** Steady RANS has no time dependence at all; even URANS cannot supply the unsteady flame response, which the closure has averaged away | |
| (iii) mean separation location | **Yes**, with a separation-capable model (SST) and $y^+\lesssim1$; it is a mean quantity and RANS does it to a few percent of exit radius in cold flow | |
| (iv) start-up side-load amplitude | **No.** It is an unsteady, asymmetric, often bistable (FSS↔RSS) phenomenon; needs at least DDES/LES and a long sample | |
| (v) mixture-ratio maldistribution across the face | **Yes**, as a mean field, provided the mesh resolves the elements and the injection boundary conditions are right — accuracy is another matter | |

**Q5 (12).**

$$I_{\text{req}}=\frac{kL^3}{3E}=\frac{30\times10^{6}\times0.20^{3}}{3\times113.8\times10^{9}}=7.030\times10^{-7}\ \mathrm{m^4}$$
$$A_f=\frac{2I}{h^2}=\frac{2\times7.030\times10^{-7}}{0.080^2}=2.197\times10^{-4}\ \mathrm{m^2}=219.7\ \mathrm{mm^2}$$
$$m_{\text{flanges}}=\rho(2A_f)L=4430\times4.394\times10^{-4}\times0.20=\mathbf{0.389\ kg}$$

(4 + 4 + 4.) A tapered ideal section would give $0.75\times0.389=0.292$ kg;
credit either if stated.

**Q6 (8).** **(b)** — the flamelet library is built from steady laminar
counterflow solutions on the burning and extinguished branches, and ignition
is a transient traverse through the *unstable* middle branch, which is not in
the table. Consequences: the simulation cannot represent kernel growth or
the ignition-energy threshold, so predicted ignition becomes essentially
independent of the igniter. (a) is false — flamelet models are the *cheap*
option. (c) is a real limitation of single-mixture-fraction formulations but
is not the ignition-specific issue and is fixable with a second mixture
fraction. (d) is true of many combustion CFD setups but is second-order
during ignition. (5 for the letter, 3 for the justification.)

**Q7 (10).** Before taking qualification credit by analysis, require:

1. **Solution verification** — a grid-convergence study on the quantity being
   used for the margin, with a stated numerical uncertainty.
2. **Validation against relevant experiment**, with the validation domain
   written down and the operating point shown to be *inside* it, and with the
   experimental uncertainty included in the validation statement.
3. **Quantified results uncertainty** — the propagated input uncertainty plus
   the model-form error, expressed as a band, not a point.
4. **A credibility assessment** in the NASA-STD-7009 sense — the eight
   factors scored, including input pedigree, use history and the
   qualifications of the people who ran it — reported to the decision-maker
   *with* the result.

Also creditable: independent review; configuration control on the model and
its inputs; a documented statement of what the analysis does *not* cover.

**The one most often missing: validation inside the actual operating
domain.** Programmes routinely have verification, uncertainty and a
credibility form, and are extrapolating a model validated at other
conditions. (2 each + 2 for identifying the gap.)

**Q8 (10).** DNS work $\propto Re^3$, WMLES $\propto Re$, so the ratio is
$Re^2=(10^6)^2=\mathbf{10^{12}}$. Comment: twelve orders of magnitude is not
a hardware problem. Even sustained exponential growth in computing at a
doubling every two years needs about 80 years to close it, and the growth in
sustained scientific throughput has been slower than that for a decade.
Practical implication: DNS will remain a model-development tool on canonical
problems; the engineering path forward is better *models* (subgrid, wall,
chemistry) validated on DNS and experiment, which is exactly the argument of
[Slotnick14]. (4 for the arithmetic, 6 for the comment.)

**Q9 (10).** Any three of, with the dependency named:

- **Hot-wall liner temperature** — inferred from coolant inlet/outlet
  temperature and flow plus a thermal model; depends on the assumed $h_g$
  distribution and on the as-built channel geometry.
- **Turbine blade metal temperature** — inferred from gas-path temperature,
  pressure and flow plus a blade heat-transfer and (if cooled) film model;
  depends on the turbine inlet temperature profile, which is itself inferred.
- **Channel-to-channel coolant flow split** — inferred from manifold
  pressures and a flow-network model; depends on assumed channel dimensions
  and roughness, which for an AM part vary.
- **Accumulated LCF damage** — inferred from the thermal cycle history plus
  a Coffin–Manson model; depends on all of the above plus material
  coefficients.
- **Bearing and seal wear state** — inferred from vibration signature and
  DN-hours; depends on a wear model with no direct observable.

(3 + 3 + 4, marks for naming the dependency, not just the quantity.)

**Q10 (10).** Three questions:

1. **How will it be inspected, on every unit, for the life of the
   programme?** Lattice cores and 0.8 mm internal passages are not
   ultrasonically inspectable, dye penetrant cannot reach internal surfaces,
   and CT has a part-size versus resolution ceiling — and a human-rated
   pressure-carrying part needs a repeatable, quantitative NDE method with a
   demonstrated probability of detection.
2. **What are the material allowables, in this build orientation, from this
   powder lot and this machine — and where are the witness coupons?**
   Without orientation-specific allowables and same-build witness specimens,
   the structural analysis has no basis.
3. **Can the powder be fully removed from the lattice and the 0.8 mm
   passages, and can that be *verified*?** Trapped powder is mass, a
   contamination source, and a flow blockage; "we blew it out and it looked
   clean" is not verification.

Also creditable: fatigue knockdown for as-built internal surfaces; what the
42 % is measured against (a solid billet baseline is not a fair comparison);
whether the 0.8 mm passages meet the flow requirement with as-built
roughness; whether a leak path was removed or added.

**The answer most likely to stop the design: inspectability.** A part that
cannot be inspected cannot be accepted on a human-rated vehicle, no matter
how good the analysis, because there is no way to detect the build-to-build
variation that AM demonstrably has. Mass is negotiable; an un-inspectable
pressure boundary is not. (3 + 3 + 3 + 1 for the adjudication.)

---

## K3. Trade-study reference solution (T1)

### Recommended strategy

**Primary: Option C (heritage-scaled ROM plus fast AM iteration), with the
half-funded second investment going to a targeted subscale calorimetric and
stability rig — i.e. the cheap half of Option B.** Decline A and D as
primary.

### Reasoning

**Start from the constraints, which are decisive.** Thirty months to first
hot fire, **no in-house CFD team**, and **no existing methalox element
database**. Those three facts eliminate Option A on their own: building a
validated reacting-CFD capability — real-fluid EOS, a reduced methane
mechanism developed and validated, a team that can run it and defend it — is
itself a multi-year programme, and it would be validated against *nothing*,
because there is no methalox element data to validate it against. An
unvalidated LES delivered at month 26 changes no decision. Option D inherits
the same defect and adds a second one: a surrogate built on a CFD database
you cannot validate is a fast emulator of an unvalidated model, and the
"stability proxy" in the objective would be a fabrication — there is no
validated stability proxy for a new chamber.

**The dominant risk is stability, and it is not retired by any of these
options analytically.** The requirement is a bomb test with 40 ms damping.
No option on the list predicts that. What *reduces* the risk is (i) choosing
an element type and injector $\Delta p/p_c$ from a heritage design that was
stable at similar scale, (ii) designing in the classical mitigations —
$\Delta p/p_c\ge0.15$–0.20, baffle provisions or acoustic cavity provisions
machined in from the start even if unused, and (iii) **iteration count**:
being able to build and fire a modified injector quickly. That is exactly
Option C's proposition, and it is the F-1's method executed with modern
manufacturing (§6.1).

**The second risk is liner life (25 full-duration cycles) and it needs a
measured heat flux.** A calorimetric subscale section is the cheapest
instrument in propulsion for the money, and it calibrates the Bartz
coefficient and the 1-D model that the whole design rests on. It also
delivers $\eta_{c^*}$ at the real thermodynamic state, which is the
$I_{sp}$-margin risk. This is why the half-budget goes here rather than to
CFD.

**The 1.5 % $I_{sp}$ margin at PDR is comfortable** given a heritage-scaled
element — Worked Example 1 shows a typical 1σ of about 1.4 % dominated by
$\eta_{c^*}$, and the subscale campaign is precisely what collapses that term
(N1: to about 0.9 % total, moving the 3σ low bound up by ~5 s). So the
subscale rig buys the margin argument as well as the thermal one.

### V&V ladder, with what each rung retires

| rung | what | retires | cost class |
|---|---|---|---|
| 1 | CEA / Cantera sweep at $r$, $p_c$; frozen-vs-equilibrium check | thermochemistry, theoretical baseline, thermal BCs | days |
| 2 | ROM: cycle balance, 1-D regen with Bartz, transient start model | engine architecture, all component sizing, coolant $\Delta p$/$\Delta T$, start sequence | weeks |
| 3 | Element cold flow: $C_d$, spray angle, patternation on 3 candidate elements | measured (not assumed) $C_d$ into the ROM; gross geometry errors; element down-select | weeks, cheap rig |
| 4 | Subscale calorimetric hot fire, 3 mixture ratios + a stability-provocation configuration | measured throat/chamber heat flux → Bartz calibration; $\eta_{c^*}$ at real state; ignition behaviour; **first stability evidence** | months |
| 5 | Full-scale hot fire of printed injector variant 1, then 2, then 3 | performance, thermal environment, manifold distribution, and — by bomb test — dynamic stability | the programme |
| 6 | Recalibrate ROM; write the validation domain down; freeze | credibility for the next engine | continuous |

### The risk being accepted, explicitly

**That the heritage-scaled element does not scale.** Stability and
$\eta_{c^*}$ scale differently from geometry (Module 15; [Hulka08],
[SP-194]), and a methalox element derived from a kerolox or hydrogen heritage
design may behave differently — methane's vaporisation and mixing behaviour
at these pressures is genuinely different from RP-1's. If the first
full-scale injector is unstable, the recovery path is iteration (weeks per
printed variant), and the schedule contains room for perhaps three variants.
A fourth would break the 30-month date.

Secondary risks accepted: no predictive capability for the *next* engine
(the programme buys hardware, not a method); no mechanism-level
understanding if something goes wrong, only empirical response; and complete
dependence on AM lead time, so a printer or powder problem is a schedule
problem with no fallback.

### What would change the recommendation

- **If a methalox element database existed in-house** (or could be bought),
  Option D becomes attractive: a surrogate over a validated CFD family is a
  genuine accelerator.
- **If the schedule were 60 months rather than 30**, Option A becomes
  defensible as an investment in the *next* programme, run in parallel with
  C and validated against B's data — which is how a capability should be
  built.
- **If the stability requirement were relaxed or the architecture changed to
  a pintle** (inherently stable, throttleable — the Merlin/LMDE argument in
  §6.4), the dominant risk moves to performance and cooling, and more of the
  budget should go to subscale thermal testing.
- **If the liner were a new AM alloy rather than a characterised one**, the
  coupon programme becomes non-negotiable and takes the half-budget instead.

### Rubric

A strong answer must contain:

1. A **recommendation with a reason tied to the stated constraints** (no CFD
   team, no methalox database, 30 months) rather than a general preference
   for one method.
2. Recognition that **stability is the dominant risk and no listed option
   predicts it** — mitigation is architectural choice plus iteration count
   plus bomb testing.
3. A **ladder with per-rung retirements**, not a list of activities.
4. An explicit **statement of the risk accepted** and its recovery path.
5. At least one **quantitative link** — e.g. using N1's arithmetic to show
   what the subscale campaign buys in $I_{sp}$ margin, or Worked Example 2's
   peak/mean flux to justify the calorimetric section.
6. Named **change-of-mind conditions**.

Loses marks for: choosing Option A or D as primary without confronting the
validation problem; treating "we will run CFD" as a risk retirement;
producing a schedule with no iteration allowance on the injector; failing to
distinguish what is retired by analysis from what is retired by test; and
any answer in which the stability requirement is not mentioned.

Full marks are available for a recommendation of **B as primary with C's
manufacturing approach folded in**, provided the answer confronts the
schedule cost of building a subscale rig and shows it fits inside 30 months.

---

## K4. Common wrong answers

**"The CFD is higher fidelity, so it supersedes Bartz."** The most common
error in the module, and it confuses *resolution* with *accuracy*. A
three-dimensional reacting simulation with a wall-function mesh and a
two-step mechanism has more numbers in it and less information about the
wall flux than a three-page 1957 correlation. Fidelity is a claim about the
model's *equations*; accuracy is a claim about its agreement with reality,
and only validation establishes it. What this reveals: a student who has
used CFD but never had a CFD result contradicted by a test.

**Reporting a GCI for a reacting LES.** Reveals that the student has learned
the verification procedure as a ritual rather than understanding what
Richardson extrapolation assumes. In LES the grid *is* the model; there is no
single continuum solution being approached.

**Confusing calibration with validation.** "We tuned the $\eta_{c^*}$ model
until it matched the hot fire, so the model is validated." A model with $n$
free parameters can be made to match $n$ data points by construction. The
tell is that the student cannot say what the model *predicted before* the
data arrived.

**Treating margin and uncertainty as the same thing.** "We have 30 % margin,
so we are covered." Margin is a deterministic distance to a limit;
uncertainty is a distribution. A 30 % margin against a load with a 20 % 1σ is
a 1.5σ position — about a 7 % chance of exceedance — which is nothing like
"covered". Students who make this error typically also stack independent
worst cases and cannot say what reliability their design has.

**Using the circumferential mean flux for a life calculation.** Problem N6
exists to expose this. A 55 % local peak halves the life. The mean is the
right number for the *coolant energy balance* and the wrong number for the
*wall strain*, and the two calculations need different inputs from the same
analysis.

**Assuming $q\propto p_c^{0.8}$ when the throat size is also changing.**
N3's trap. At fixed thrust the throat shrinks with $p_c$ and the exponent is
effectively 0.9. A student who quotes 0.8 without checking whether the
geometry is fixed has memorised the correlation rather than read it.

**Believing $p_c$ raises vacuum $I_{sp}$.** Extremely common, and revealing:
it means the student has never written out $C_F$ and noticed that $p_e/p_c$
is a function of $\varepsilon$ and $\gamma$ only. Chamber pressure buys
thrust density and expansion ratio, not exhaust velocity.

**Claiming a $10^{-6}$ reliability from a $10^{4}$-sample Monte Carlo.**
Arithmetically impossible — no samples land in the region being quantified.
Reveals that the student treats Monte Carlo as a black box rather than as an
estimator with a known standard error.

**Treating MBSE, digital twins or ML as risk reduction.** They are
organisation, monitoring and acceleration technologies respectively. None of
them contains physics that was not put into them, and none of them has ever
made a chamber stable. Students who list "we will build a digital twin"
under risk mitigation have not asked what the twin would be calibrated on.

**Proposing topology optimisation for a strength-driven or fatigue-driven
part and expecting a large saving.** Worked Example 3's Step 6 is the
antidote: the bracket saved mass because it was stiffness-driven by a factor
of twelve. A part working at 80 % of yield has almost nothing to give.

**Extrapolating a surrogate and reporting the number.** The optimiser will
always propose the point where the surrogate is most optimistic. A student
who reports it without a high-fidelity check has not understood that the
optimiser is an adversary.

**Saying "we will do CFD" as a schedule item without naming the question.**
The single most expensive error a programme makes. Every CFD case must have
a written question, a validation basis, and a decision that depends on the
answer. Cases run without those three are decoration, and the module's
opening paragraph is what they cost.
