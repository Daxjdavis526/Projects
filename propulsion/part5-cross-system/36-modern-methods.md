# Module 36 — Modern Engineering Methods
Part V · Prerequisites: Parts I–IV (modules 01–31) · Estimated time: 8 h

I have twice watched a programme lose a year to a picture. The first time it
was a beautifully rendered LES of a single injector element, coloured by
temperature, shown at a design review as evidence that the mixing was fine.
It was one element out of 217, run at a chamber pressure 40 bar below the
operating point because that was what would converge, with a two-step global
mechanism and no wall heat loss, and nobody in the room asked what the
grid-convergence study looked like because there wasn't one. The second time
it was a thermostructural FEA of a liner that predicted 340 cycles to
first-crack; the chamber cracked at 41, because the analyst had used the
Bartz-average heat flux around the circumference and the real hardware had a
streak from an off-design element that ran 55 % hotter over a 12 mm band.
Both models were *correct implementations of what they modelled*. Both were
believed past the edge of what they had been validated against. This module
is about the tools that dominate modern propulsion engineering — CFD, FEA,
cycle codes, optimisation, additive design, digital twins, machine learning,
uncertainty quantification — and, more importantly, about the discipline that
makes them worth having: knowing what each one computes, what it needs, what
it has been checked against, and which of the classical hand methods from
Modules 01–31 you still have to run to catch it when it lies.

**How to read this module.** Everything here is a *method*, not a phenomenon.
The physics was in Parts I–IV. What follows is an engineering-management and
numerical-methods chapter: for each method, six questions — what it computes,
how (at a working level), what inputs it needs, what it has been validated
against, where it earns its cost, and where it fails or misleads. Nothing in
this module replaces a single equation from the earlier modules. Several of
those equations are the only reason you will catch a bad simulation.

---

## 1. Learning objectives

After this module you should be able to:

- State the difference between **verification**, **validation**, and
  **qualification** in the sense of NASA-STD-7009, and place any given
  analysis result on that ladder.
- Choose between RANS, URANS, LES and DNS for a stated propulsion question,
  and estimate the grid-count and wall-clock cost of each to within an order
  of magnitude from the Reynolds number and the resolution requirement.
- Explain what a flamelet/FGM combustion model assumes, when a rocket
  chamber violates those assumptions, and what finite-rate chemistry costs
  instead.
- Set up a lumped-parameter engine balance: write the algebraic and
  differential equations that a cycle code solves, name the closure
  correlations it needs, and say why the whole engine is sized in this model
  before any CFD is run.
- Perform a Bartz cross-check on a conjugate-heat-transfer CFD result and
  state the three things that would make you believe the CFD over Bartz, and
  the three that would make you believe Bartz over the CFD.
- Compute a low-cycle-fatigue life estimate from a Coffin–Manson relation
  and explain why liner LCF predictions are systematically optimistic.
- Propagate stated input uncertainties through a $c^*$/$C_F$ performance
  chain by Monte Carlo, report the result as a distribution, decompose the
  variance by input (first-order Sobol indices), and contrast that with a
  deterministic margin-stacking policy.
- Estimate the mass a topology-optimised, stiffness-driven bracket can
  reach, using beam theory as a lower bound, and state why real topology
  optimisation lands above that bound.
- Describe what an engine digital twin actually contains, what test data
  updates in it, and name three things it cannot predict.
- Argue, with specific cases, where classical analytical methods remain
  necessary regardless of computing power: combustion instability, ignition
  transients, cavitation inception, and additively manufactured material
  properties.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Verification | — | — | did I solve the equations right? (numerical accuracy, code correctness) |
| Validation | — | — | did I solve the right equations? (agreement with physical experiment, with stated uncertainty) |
| Model-form uncertainty | — | — | error from the equations chosen, not from their inputs or their solution |
| Numerical uncertainty | — | — | error from discretisation, iteration and round-off |
| Parametric uncertainty | — | — | uncertainty in the model's inputs, propagated to its outputs |
| Reynolds number | $Re$ | — | $\rho u L/\mu$; ratio of inertial to viscous momentum transport |
| Kolmogorov length | $\eta_K$ | m | smallest dynamically significant turbulent eddy, $\eta_K = (\nu^3/\epsilon)^{1/4}$ |
| Turbulent dissipation rate | $\epsilon$ | m²/s³ | rate of turbulent kinetic energy conversion to heat |
| Kinematic viscosity | $\nu$ | m²/s | $\mu/\rho$ |
| Wall coordinate | $y^+$ | — | $y u_\tau/\nu$; non-dimensional distance of the first cell centre from a wall |
| Friction velocity | $u_\tau$ | m/s | $\sqrt{\tau_w/\rho}$ |
| Grid convergence index | GCI | — | Roache's estimator of discretisation error from two or three grid levels |
| Order of convergence | $p$ | — | observed exponent in $\text{error}\propto h^p$ for cell size $h$ |
| Mixture fraction | $Z$ | — | conserved scalar, 1 in pure fuel, 0 in pure oxidiser |
| Scalar dissipation rate | $\chi$ | 1/s | $2D\lvert\nabla Z\rvert^2$; local strain on the flame in mixture-fraction space |
| Damköhler number | $Da$ | — | ratio of flow time to chemical time; $Da\gg1$ is fast chemistry |
| Karlovitz number | $Ka$ | — | ratio of chemical time to Kolmogorov time; $Ka>1$ means turbulence penetrates the flame |
| Gas-side heat-transfer coefficient | $h_g$ | W/(m²·K) | $q/(T_{aw}-T_{wg})$ |
| Adiabatic wall temperature | $T_{aw}$ | K | recovery temperature seen by the wall |
| Heat flux | $q$ | W/m² | wall-normal energy flux |
| Cycles to failure | $N_f$ | — | number of thermal or mechanical load cycles to a defined crack |
| Plastic strain range | $\Delta\varepsilon_p$ | — | per-cycle plastic strain amplitude (peak-to-peak) |
| Campbell diagram | — | — | plot of rotor natural frequencies vs speed, with engine-order excitation lines |
| Design variable vector | $\mathbf{x}$ | mixed | the quantities an optimiser is allowed to change |
| Objective | $f(\mathbf{x})$ | mixed | the scalar being minimised |
| Pareto front | — | — | the set of designs where no objective improves without another worsening |
| Density field (topology optimisation) | $\rho_e$ | — | per-element pseudo-density in $[0,1]$; 1 = solid, 0 = void |
| Penalisation exponent | $p_{\text{SIMP}}$ | — | exponent in $E_e = \rho_e^{p}E_0$ that drives densities to 0 or 1 |
| Compliance | $C$ | J | $\mathbf{u}^\mathsf{T}\mathbf{K}\mathbf{u}$; strain energy, the inverse measure of stiffness |
| Surrogate / metamodel | $\hat f$ | mixed | cheap function fitted to expensive simulation or test samples |
| Gaussian process | GP | — | surrogate that returns a mean and a variance at every query point |
| First-order Sobol index | $S_i$ | — | fraction of output variance explained by input $i$ alone |
| Total Sobol index | $S_{Ti}$ | — | fraction of output variance involving input $i$, including interactions |
| Coefficient of variation | $CV$ | — | $\sigma/\mu$ of a distribution |
| Digital twin | — | — | a model of a *specific serial-numbered article*, updated with that article's own data |
| Model credibility | — | — | NASA-STD-7009's structured assessment of how much weight a decision may put on a model |

---

## 3. Theory

### 3.1 The vocabulary that keeps a model honest

Before any specific tool, the frame. Three words are used loosely in
industry and precisely in the standards, and using them loosely is how a
programme talks itself into flying an unvalidated model.

**Verification** asks: *did I solve the equations I wrote down, correctly?*
It is a mathematics question with no experiment in it. It splits into **code
verification** (does the solver reproduce an analytic or manufactured
solution at the design order of accuracy?) and **solution verification**
(for this particular run, how large is the discretisation and iterative
error?). Solution verification is the grid-convergence study, and its
standard estimator is Roache's Grid Convergence Index [Roache98,
ASME-V&V-20]:

$$\mathrm{GCI}_{\text{fine}} = \frac{F_s\,\lvert \epsilon_{21}\rvert}{r^{\,p}-1},\qquad \epsilon_{21}=\frac{\phi_2-\phi_1}{\phi_1},\qquad r=\frac{h_2}{h_1}$$

> **Eq. 3.1** — variables: $\phi_1,\phi_2$ the quantity of interest on the
> fine and coarse grids [any unit], $h$ representative cell size [m], $r$
> refinement ratio [—], $p$ observed order of accuracy [—], $F_s$ a safety
> factor (1.25 with three grids, 3 with two) [—]. Meaning: an error band on
> the fine-grid answer expressed as a percentage. Assumes: the grids are in
> the **asymptotic range**, i.e. the error is already dominated by the
> leading truncation term; the solution is smooth; the refinement is
> uniform. Fails when: the three grid answers are not monotone (very common
> in separated or reacting flow), when the observed $p$ comes out negative
> or far above the scheme's formal order, or when limiters and shock
> capturing make the scheme locally first-order. [F] for the estimator,
> [J] for the safety factor.

The blunt engineering consequence: **a CFD result quoted without a grid
study has no error bar, and a number without an error bar cannot be
compared to a requirement.** If a vendor or a colleague cannot tell you the
observed order of convergence for the quantity you care about, you are
being shown an illustration, not a calculation.

**Validation** asks: *are the equations I solved the right description of the
physical world, for this application, within what tolerance?* It requires an
experiment, and — this is the part routinely skipped — it requires the
*experiment's* uncertainty as well as the simulation's. ASME V&V 20 defines
the validation comparison error $E = S - D$ (simulation minus data) and the
validation uncertainty $u_{\text{val}}$ combining numerical, input and
experimental uncertainties; the model is validated at the level
$\lvert E\rvert + u_{\text{val}}$, and *that* number, not zero, is the
accuracy you are entitled to claim [ASME-V&V-20]. A CFD run that lands 4 %
from a test point measured to $\pm6\,\%$ has demonstrated agreement at the
10 % level, not at the 4 % level.

**Qualification** asks: *may this article fly?* It is a programmatic question
answered by test, inspection and analysis together. Analysis alone qualifies
almost nothing in propulsion; what analysis does is decide *which* tests to
run, interpolate between the tests you ran, and extrapolate the small number
of dimensions where extrapolation is defensible.

NASA formalised this in **NASA-STD-7009**, *Standard for Models and
Simulations*, written after the agency noticed that models were entering
flight-decision processes with no traceable statement of how much they
should be trusted [STD-7009]. Its core artefact is the **Credibility
Assessment Scale**: eight factors — verification, validation, input pedigree,
results uncertainty, results robustness, use history, M&S management,
people qualifications — each scored on a defined ladder, with the
requirement that the score be *reported alongside the result* to the
decision-maker. It does not tell you the model is right. It tells the
programme manager how far out on a limb they are standing. [M]

Two more distinctions that matter more in propulsion than almost anywhere:

- **Prediction vs postdiction.** A model tuned until it matches a hot-fire
  test has demonstrated that it has enough free parameters, not that it has
  the right physics. The only honest validation is a *blind* prediction
  submitted before the test data is opened. The programmes that do this
  (and there are few) learn something; the ones that "calibrate" learn their
  own calibration.
- **Interpolation vs extrapolation.** Every validated model has a validation
  *domain* — the region of the input space where it was checked. Almost all
  catastrophic simulation failures in this field are extrapolations: a
  chamber model validated at 40 bar run at 100 bar, a spray model validated
  on water/air run on subcritical LOX, a fatigue model validated on wrought
  material applied to a printed part. [J] Write the validation domain on the
  same slide as the result, every time.

### 3.2 The cost hierarchy, and why the engine is designed in a ROM

Every method in this module sits somewhere on a curve of cost versus
resolution. The numbers below are order-of-magnitude and will age, but the
*ratios* are stable and they are what determine how a programme is run.

| method | typical wall-clock for one answer | typical cost | what it resolves |
|---|---|---|---|
| CEA / equilibrium call | 10 ms – 1 s | free | thermochemical state, $c^*$, $T_0$, $\gamma$, $\mathcal{M}$ |
| 0-D/1-D engine balance (steady) | 0.1 – 10 s | free | whole-engine pressures, flows, powers, $I_{sp}$ |
| 1-D transient engine model (start) | minutes | free–low | valve sequencing, spin-up, chill-down, priming |
| 1-D regen cooling channel model | seconds | free | coolant $\Delta p$, $\Delta T$, wall temperature vs axial station |
| 2-D axisymmetric RANS, non-reacting | minutes – 1 h | low | nozzle contour performance, separation, boundary layer |
| 3-D RANS, reacting, single element | 1 – 10 h × 10²–10³ cores | moderate | mean flame position, mean wall flux |
| 3-D RANS, reacting, full injector face | days × 10³–10⁴ cores | high | mixture-ratio maldistribution, streaks |
| 3-D LES, reacting, single element | days – weeks × 10³–10⁴ cores | high | unsteady flame dynamics, response to acoustics |
| 3-D LES, reacting, multi-element chamber | weeks – months × 10⁴–10⁵ cores | very high | instability mechanism (research only) |
| DNS, reacting | not feasible at engine $Re$ | — | everything; used only on model problems |

> **Note on the table.** These are [E]/[J] figures assembled from what is
> publicly reported of academic and agency campaigns; a specific case can be
> an order of magnitude either way. Treat the *ordering* as reliable and the
> absolute numbers as indicative. [Slotnick14] is the honest agency
> assessment of where this curve is going and how slowly.

The consequence is the single most important structural fact about modern
engine design, and it surprises people who come in expecting CFD to be the
centre of the process:

> **The entire engine is designed, sized, balanced and mostly frozen inside
> a reduced-order model before a single CFD case is run.** CFD is then
> applied, selectively and expensively, to the three or four questions the
> ROM cannot answer and the classical correlations cannot bound.

The reason is not conservatism, it is arithmetic. A cycle balance takes
seconds, so a designer can run 10⁵ of them: sweep chamber pressure, mixture
ratio, pump efficiencies, turbine inlet temperature, expansion ratio,
channel geometry, and see the whole design space. A reacting LES of the
chamber takes a month, so you get perhaps four of them in a development
programme, and you must know in advance which four. Any process that
inverts this ordering — "let's CFD it and see" — burns the schedule on
questions that a 1-D model would have answered in an afternoon, and arrives
at the real question with no budget left.

### 3.3 Chemical equilibrium software: CEA, RPA, Cantera

**What it computes.** Given a propellant pair, a mixture ratio, a chamber
pressure and (for CEA's rocket problem) an expansion condition, an
equilibrium code returns the composition, temperature, transport properties
and derived performance ($c^*$, $C_F$, $I_{sp}$, $\gamma_s$, $\mathcal{M}$)
of the combustion products. Module 04 derived the method; this section is
about it as a *tool* in the modern chain.

**How.** Not by solving reaction equations. By minimising Gibbs free energy
at fixed $(T,p)$ or maximising entropy at fixed $(H,p)$, subject to element
conservation, over the mole numbers $n_j$ of all considered species:

$$\min_{n_j}\ G=\sum_j n_j\left(\mu_j^\circ(T)+R_uT\ln\frac{n_j p}{n_{\text{tot}}p^\circ}\right)\quad\text{s.t.}\quad \sum_j a_{ij}n_j=b_i$$

> **Eq. 3.2** — variables: $n_j$ moles of species $j$ [kmol], $\mu_j^\circ$
> standard chemical potential [J/kmol] from the NASA polynomial fits,
> $a_{ij}$ atoms of element $i$ in species $j$ [—], $b_i$ total moles of
> element $i$ [kmol], $R_u=8314.46$ J/(kmol·K). Meaning: chemical equilibrium
> is the composition of lowest free energy consistent with the atoms you put
> in. Assumes: ideal-gas mixture (with optional condensed phases), infinite
> residence time, uniform state, and — critically — that every relevant
> species is *in the species list*. Fails when: chemistry is slow relative to
> the flow (recombination freeze in a nozzle), when the mixture is not
> uniform (every real injector), when real-gas effects matter (dense LOX
> near the injector), or when a species that should have been included was
> not. [F] for the thermodynamics; [RP-1311 Part I] for the derivation.

**Inputs it needs.** Reactant enthalpies of formation and reference
temperatures, an element budget, the thermodynamic polynomial database
([JANAF]-derived), and the transport database if you want $\mu$ and $k$.
The single most common user error is mixing a fitted RP-1 empirical formula
with a heat of formation fitted to a *different* formula (Module 04 §3).

**Validation status.** The equilibrium calculation itself is the best-verified
model in propulsion — it is thermodynamics with tabulated data, and CEA has
been cross-checked against independent implementations for thirty years.
What is *not* validated is the leap from theoretical performance to engine
performance. That gap is what JANNAF's efficiency decomposition exists to
book-keep [CPIA-246]: energy release efficiency, divergence, boundary layer,
kinetics, and the reference One-Dimensional-Equilibrium baseline against
which each is defined. A quoted "$\eta_{c^*}=0.97$" is meaningless unless
you know which reference it is 97 % of.

**Where it is genuinely valuable.** Everywhere, at the front of everything.
It is free, instant, and it sets the thermodynamic boundary conditions for
every downstream method: the ROM's chamber state, the CFD's inlet enthalpy
and species, the CHT's $T_{aw}$, the FEA's thermal load. It is also the only
place where the *ideal* performance is defined, and therefore the only place
where you can say how much of the shortfall is the injector's fault.

**Where it misleads.** Three places.

1. **Equilibrium vs frozen vs finite-rate.** CEA offers equilibrium and
   frozen expansion as bounds. Real nozzles are between: recombination
   proceeds until the flow cools and the residence time falls below the
   chemical time, and then freezes. The equilibrium–frozen spread is 1.5–4 %
   in $I_{sp}$, largest for hydrogen at high $\varepsilon$ (Module 04 §4).
   Quoting the equilibrium number as "the" theoretical performance
   systematically flatters the engine. **Cantera** is the modern way to
   settle this: integrate the finite-rate chemistry along the nozzle
   streamline with a real mechanism and find where the composition actually
   stops changing [Cantera]. That is a 1-D calculation that takes seconds and
   almost nobody does it, which is why "frozen or equilibrium?" is still an
   argument in design reviews.
2. **Uniformity.** CEA computes one mixture ratio. A real injector delivers a
   *distribution* of local mixture ratios; the mass-averaged performance of a
   distribution is always below the performance at the mean mixture ratio,
   because $c^*(r)$ is concave near its peak. This is the single largest
   term in $\eta_{c^*}$ for most engines and equilibrium software cannot see
   it at all.
3. **Real-fluid states.** Near the injector face of a high-pressure engine,
   oxygen is a supercritical dense fluid, not an ideal gas — for LOX,
   $p_c=5.04$ MPa, and a 100–300 bar chamber is 2–6 times critical. Ideal-gas
   equilibrium is fine for the burnt products and useless for the injection
   process [OY93].

**Tool notes.** [CEA]/[CEARUN] is the reference implementation and the thing
to cite for published theoretical performance. [RPA] wraps a CEA-equivalent
solver in engine sizing, nozzle contour generation, regen analysis and cycle
balance — it is the fastest honest route from a propellant choice to a
preliminary engine, and its author describes it as a conceptual-design tool,
which is exactly right. [Cantera] is a scriptable kinetics/thermo library:
same NASA polynomials, but it will also integrate finite-rate chemistry,
which makes it the right tool for freeze-point questions, ignition delay,
and building reduced mechanisms for CFD. [M]

### 3.4 Reduced-order models: the engine balance and the start transient

This is the workhorse and the least glamorous entry in the module. A
**reduced-order model** (ROM) of an engine represents each component as a
lumped element with a small number of states and an algebraic or
first-order-ODE constitutive law, and solves the resulting system for a
consistent operating point.

**Steady cycle balance.** The unknowns are the pressures, temperatures and
flows at every station; the equations are conservation plus component maps.
For a gas-generator engine the closure set is roughly:

$$\dot m = C_d A\sqrt{2\rho\,\Delta p}\ \ \text{(every orifice and injector)}$$
$$\Delta p_{\text{pump}} = \rho g H(\dot Q,N),\qquad P_{\text{pump}}=\frac{\dot m\,\Delta p}{\rho\,\eta_p}$$
$$P_{\text{turb}} = \eta_t\,\dot m_t c_p T_{t,\text{in}}\left[1-\left(\frac{1}{\Pi}\right)^{(\gamma-1)/\gamma}\right]$$
$$P_{\text{turb}} = P_{\text{pump,ox}}+P_{\text{pump,fuel}} \ \ \text{(shaft power balance)}$$
$$\dot m_{\text{total}} = \frac{p_c A_t}{c^*(r,p_c)}\ \ \text{(choked throat, } c^* \text{ from CEA)}$$

> **Eq. 3.3a–e** — variables as in Modules 12–13; $H$ pump head [m], $N$ shaft
> speed [rad/s], $\eta_p,\eta_t$ efficiencies [—], $\Pi$ turbine pressure
> ratio [—], $c^*$ [m/s] interpolated from an equilibrium table. Meaning: the
> engine's operating point is the simultaneous solution of "everything that
> must add up". Assumes: quasi-steady flow, lumped components, incompressible
> pumps, no distributed dynamics, maps valid at the operating point. Fails
> when: any element is choked in a way the map does not represent, when
> two-phase flow appears (chill-down, cavitation, coolant boiling), when the
> pump operates far off its map, or during any transient faster than the
> component filling times. [F] for the conservation statements, [E] for the
> maps.

That is a nonlinear algebraic system of perhaps 30–200 equations, solved by
Newton–Raphson with a good initial guess. Its virtues: it takes milliseconds,
every variable in it is a quantity an engineer names in a design review, and
its sensitivities are exact and instantly available. Its vice: **every
component map in it is empirical, and the model is only as good as the maps.**
For a new engine, the maps are scaled from previous hardware, and the scaling
is where the error lives.

**Transient models.** The start transient is where ROMs earn their keep and
where nothing else works at all. Adding capacitance and inertia to each
lumped volume gives a differential-algebraic system:

$$V\frac{d\rho}{dt} = \dot m_{\text{in}}-\dot m_{\text{out}},\qquad \frac{d}{dt}(\rho e V) = \dot H_{\text{in}}-\dot H_{\text{out}}+\dot Q$$
$$L\frac{d\dot m}{dt} = A\,(p_1-p_2) - \Delta p_{\text{loss}},\qquad I\frac{dN}{dt}=\frac{P_{\text{turb}}-P_{\text{pump}}}{N}$$

> **Eq. 3.4a–d** — variables: $V$ lumped volume [m³], $\rho$ density [kg/m³],
> $e$ specific internal energy [J/kg], $L=\ell/A$ line inertance [1/m],
> $I$ rotor polar inertia [kg·m²], $N$ shaft speed [rad/s]. Meaning: mass,
> energy and momentum storage in every volume and line, plus rotor
> spin-up. Assumes: one-dimensional lines, lumped volumes small compared to
> the acoustic wavelength of interest, a valid equation of state (usually
> [REFPROP]/[NIST] for cryogens). Fails when: acoustic behaviour matters
> (this model cannot represent a chamber acoustic mode), when the volume is
> not well-mixed, or when two-phase flow needs a real slip model rather than
> homogeneous equilibrium. [F].

This is what **ROCETS**, **NPSS**, and **EcosimPro/ESPSS** are. ROCETS
(Rocket Engine Transient Simulation) was developed under NASA MSFC contract
around 1990 as a modular transient engine simulation framework and was used
extensively on Shuttle-era and post-Shuttle engine work; **NPSS** (Numerical
Propulsion System Simulation) began at NASA Glenn as an object-oriented
airbreathing-engine framework and has been extended to rockets [NPSS];
**EcosimPro with the ESPSS library** is the European equivalent, an
equation-based DAE environment with a validated propulsion component library
used across ESA programmes [ESPSS]. All three do the same job: assemble
components into a plant, generate the DAE system, integrate it.

**What a transient ROM is used for, concretely:**

- **Valve sequencing.** The order and rate at which main valves open sets the
  mixture ratio history during start. Get it wrong and you either detonate a
  hard start (oxidiser lead with too much accumulated propellant) or fail to
  light. This is a scheduling problem in a 10–200 ms window and it is solved
  entirely in a ROM, then checked on a test stand.
- **Turbomachinery spin-up.** Does the turbine make enough power to
  accelerate the rotor through the low-flow region before the pump stalls or
  the seals overheat? Eq. 3.4d, plus off-design maps.
- **Chill-down.** How much cryogen do you dump to get the pump and lines cold
  enough that the pump does not cavitate on start? Two-phase, wall-heat-capacity
  dominated, and impossible to do in your head.
- **Priming and water-hammer.** Filling a dry line with a dense propellant
  generates a pressure surge $\Delta p=\rho a \Delta u$ that has burst
  hardware on more than one programme; the ROM predicts it, and the valve
  ramp is then designed to keep it under the proof pressure.
- **Shutdown and dribble volume.** Post-cutoff impulse and its repeatability,
  which is a guidance-accuracy requirement, not an engine requirement.

**1-D regenerative cooling models.** A special and very important ROM.
Discretise the channel axially; at each station solve

$$q = \frac{T_{aw}-T_{c}}{\dfrac{1}{h_g}+\dfrac{t_w}{k_w}+\dfrac{1}{\eta_f h_c}},\qquad \dot m_c c_p \frac{dT_c}{dx}=q\,P_{\text{heated}},\qquad \frac{dp_c}{dx}=-f\frac{\rho u^2}{2D_h}$$

> **Eq. 3.5a–c** — variables: $t_w$ wall thickness [m], $k_w$ wall
> conductivity [W/(m·K)], $h_c$ coolant-side coefficient [W/(m²·K)] from a
> Dittus–Boelter-type correlation, $\eta_f$ fin efficiency of the channel
> rib [—], $P_{\text{heated}}$ heated perimeter per unit length [m], $f$
> Darcy friction factor [—], $D_h$ hydraulic diameter [m]. Meaning: a series
> thermal resistance at every axial station, marched downstream with the
> coolant's energy and momentum. Assumes: 1-D conduction through the wall,
> circumferentially uniform gas-side flux, fully developed single-phase
> coolant, correlations valid at the local state. Fails when: the coolant is
> near-critical (methane at 100–200 bar is *not* near-critical, hydrogen at
> 40 bar is), when there is a circumferential streak, when curvature or
> secondary flows matter, when the channel is not straight, and when
> nucleate boiling or film boiling appears. [F] for the resistance network,
> [E] for every correlation in it.

This model, with Bartz for $h_g$, sizes essentially every regeneratively
cooled chamber ever built, including all the ones in the engine database. It
runs in seconds. Its known systematic weaknesses — circumferential streaks,
curvature enhancement in the throat, fin efficiency at high aspect ratio —
are exactly what conjugate CFD (§3.7) is brought in to quantify.

**Validation status of ROMs.** Excellent *within a family*, poor across
families. A cycle code tuned on Shuttle-era hydrogen turbomachinery will
reproduce the next hydrogen engine's balance to a few percent and will be
wrong about a methalox oxidiser-rich preburner in ways nobody can predict
until they test one. This is why the first thing any engine programme does
with early test data is not "did we hit the performance target" but
"**recalibrate the model**" — every hot fire is, among other things, a
validation point for the ROM that will design the next iteration.
