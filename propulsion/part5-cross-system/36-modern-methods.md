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

### 3.5 CFD for injectors and chambers

#### 3.5.1 The three levels, and what separates them

All three solve the same conservation laws — mass, momentum, energy, species:

$$\frac{\partial \rho}{\partial t}+\nabla\!\cdot(\rho\mathbf{u})=0,\qquad
\frac{\partial(\rho\mathbf{u})}{\partial t}+\nabla\!\cdot(\rho\mathbf{u}\mathbf{u})=-\nabla p+\nabla\!\cdot\boldsymbol{\tau}$$
$$\frac{\partial(\rho Y_k)}{\partial t}+\nabla\!\cdot(\rho\mathbf{u}Y_k)=\nabla\!\cdot(\rho D_k\nabla Y_k)+\dot\omega_k$$

> **Eq. 3.6a–c** — variables: $\rho$ [kg/m³], $\mathbf{u}$ [m/s], $p$ [Pa],
> $\boldsymbol{\tau}$ viscous stress [Pa], $Y_k$ mass fraction of species $k$
> [—], $D_k$ diffusivity [m²/s], $\dot\omega_k$ net chemical production rate
> [kg/(m³·s)]. Meaning: the Navier–Stokes equations with reacting species.
> Assumes: continuum ($Kn\ll1$ — true everywhere in a chamber, not true in
> the far plume of a cold-gas thruster, see Module 30), Newtonian fluid,
> Fickian diffusion. Fails when: the equation of state is wrong (dense
> supercritical injection), when radiation is a significant energy path
> (soot-forming propellants), or when the species set is inadequate. [F].

The difference between DNS, LES and RANS is **what fraction of the turbulent
spectrum you resolve, and therefore what you must model**.

**DNS** resolves everything down to $\eta_K$. The required cell count scales
as $Re_L^{9/4}$ in three dimensions and the time-step count as $Re_L^{3/4}$,
so total work scales roughly as $Re_L^{3}$.

$$N_{\text{cells}}\sim\left(\frac{L}{\eta_K}\right)^{3}\sim Re_L^{9/4}$$

> **Eq. 3.7** — variables: $L$ integral length scale [m], $\eta_K$ Kolmogorov
> length [m], $Re_L=uL/\nu$ [—]. Meaning: resolving every eddy costs the cube
> of the scale separation. Assumes: homogeneous isotropic turbulence scaling;
> a wall-bounded flow is worse. Fails to be even a bound when combustion adds
> a flame thickness smaller than $\eta_K$, which it often does. [F].

Put a number on it. A 100 mm chamber at $Re\sim10^6$: $Re^{9/4}\approx
10^{13.5}$ cells. There is no computer. **DNS is not an engineering tool for
rocket chambers and will not become one in your career.** It is a tool for
*model development* on canonical problems — a temporally evolving jet, a
counterflow flame, a single droplet — from which the closures used by LES
and RANS are derived and tested [Poinsot].

**RANS** resolves nothing of the turbulence: it solves for the time-averaged
(or, for URANS, slowly-varying-in-time) field, and models the entire
turbulent spectrum with an eddy viscosity. The workhorse in propulsion is
Menter's **SST $k$–$\omega$** [Menter94], which uses $k$–$\omega$ near walls
(good for adverse pressure gradients and separation) and blends to
$k$–$\epsilon$ in the free stream (no free-stream sensitivity):

$$-\overline{\rho u_i'u_j'} = \mu_t\left(\frac{\partial \bar u_i}{\partial x_j}+\frac{\partial \bar u_j}{\partial x_i}-\frac{2}{3}\frac{\partial \bar u_k}{\partial x_k}\delta_{ij}\right)-\frac{2}{3}\rho k\,\delta_{ij},\qquad \mu_t=\frac{\rho a_1 k}{\max(a_1\omega,\;S F_2)}$$

> **Eq. 3.8** — variables: $\mu_t$ turbulent viscosity [Pa·s], $k$ turbulent
> kinetic energy [m²/s²], $\omega$ specific dissipation rate [1/s], $S$
> strain-rate magnitude [1/s], $a_1=0.31$, $F_2$ a blending function [—].
> Meaning: the Boussinesq hypothesis — turbulent momentum transport is
> represented as a large extra viscosity aligned with the mean strain.
> Assumes: local equilibrium of turbulence production and dissipation, and
> alignment of the Reynolds stress tensor with the mean strain tensor.
> Fails when: the flow has strong streamline curvature, strong swirl,
> significant rotation, large separated regions, or strong density gradients
> — i.e. in every one of the flows a rocket injector produces. [E], and this
> is a *calibrated* model, not a derived one.

**LES** resolves the energy-containing eddies and models only the subgrid
scales, whose behaviour is closer to universal. The filtered equations look
like Eq. 3.6 with a subgrid stress $\tau^{sgs}_{ij}$ requiring closure
(Smagorinsky with dynamic coefficient, WALE, sigma). The cost scaling is
$Re^{1.8}$–$Re^{2}$ for wall-resolved LES and roughly $Re^{0.4}$–$Re^{1}$ for
wall-modelled LES — the difference between "impossible" and "expensive"
[Slotnick14, Pitsch06]. Hybrids (DES, DDES, IDDES) run RANS in the boundary
layer and LES in the separated core, which is the practical compromise for
chamber and nozzle work.

**The judgment, plainly stated.** [J]

- If you want a **mean** field — mean wall heat flux, mean mixture-ratio
  distribution, pressure drop, mean thrust — use RANS, and cross-check it
  against a correlation.
- If you want an **unsteady** field — flame response to an acoustic
  perturbation, mixing intermittency, ignition kernel transport, side loads
  during nozzle start — RANS cannot give it to you at any grid resolution,
  because the closure has already averaged out what you are asking for. You
  need LES, and you must budget accordingly.
- If someone shows you a RANS combustion-instability prediction, the model
  either has a separately supplied flame-response function (i.e. the answer
  was an input) or it is not predicting instability.

#### 3.5.2 Chemistry closure: the real cost driver

Rocket combustion is fast, hot, and (in a real chamber) not close to any
canonical regime. The choices:

**Finite-rate chemistry with a mechanism.** Integrate $\dot\omega_k$ directly
from an Arrhenius mechanism. The source term is stiff — chemical timescales
span 10⁻⁹ to 10⁻² s — so it is usually operator-split and integrated with an
implicit ODE solver per cell. Cost scales roughly with the *square* of the
species count (the chemical Jacobian) and this dominates everything else:
a detailed methane mechanism (GRI-Mech 3.0: 53 species, 325 reactions) is
already painful in 3-D; a detailed kerosene mechanism has hundreds of
species and is out of the question. Hence **reduced mechanisms**: 15–25
species skeletal sets derived by sensitivity analysis and validated against
the detailed mechanism for ignition delay, laminar flame speed and
extinction strain over the pressure and equivalence-ratio range of interest.
[M] Building and validating that reduced mechanism is a real piece of work
and is often the difference between a defensible chamber CFD and a
decorative one.

**Flamelet models (SLFM, FPV, FGM).** Assume the flame is thin relative to
the turbulence and that its local structure is that of a laminar
counterflow diffusion flame parameterised by mixture fraction $Z$ and scalar
dissipation $\chi$ (or a progress variable $C$). Precompute a library of
flamelets offline with detailed chemistry; in the CFD, transport only $Z$,
its variance, and $C$, then look up temperature and composition:

$$\tilde\phi = \int\!\!\int \phi(Z,C)\,\tilde P(Z)\,\tilde P(C)\,dZ\,dC$$

> **Eq. 3.9** — variables: $\phi$ any thermochemical quantity, $\tilde P$
> presumed sub-filter PDFs (usually a beta function for $Z$, a delta or beta
> for $C$). Meaning: replace an expensive chemistry integration with a table
> lookup and a presumed-PDF convolution. Assumes: thin flame ($Ka<1$),
> unity-ish Lewis numbers, statistical independence of $Z$ and $C$,
> equilibrium of the flame structure with the local strain. Fails when: the
> flame is thickened by turbulence ($Ka>1$), during ignition and extinction
> (transient flamelets), for partially premixed and multi-stream problems
> (a staged-combustion chamber has *three* streams — main oxidiser, main
> fuel, and preburner gas — and a single $Z$ cannot describe three streams),
> and near walls. [E]/[A]; see [Peters00], [Pitsch06].

The cost difference is roughly two orders of magnitude, which is why
flamelet-type closures dominate industrial chamber CFD. The failure modes
above are also why flamelet chamber CFD is not trusted for ignition,
blow-off, or instability — all three violate the core assumption.

**Well-stirred-reactor / EDC-type models.** Cheap, robust, and physically
crude: assume mixing controls and burn whatever mixes at a rate set by
turbulence. Reasonable for a global heat release field, useless for
temperature-sensitive outputs like NOx or wall flux in a hydrocarbon flame.
[A]

#### 3.5.3 Spray and dense-phase injection: Euler–Lagrange

For a subcritical liquid injection — LOX/RP-1 at moderate pressure, storables,
anything at start-up — the liquid arrives as a sheet or jet that breaks into
ligaments and then drops. The standard industrial treatment is
**Euler–Lagrange**: solve the gas phase on the Eulerian grid, and track
statistical **parcels** of droplets as Lagrangian points with their own
equations of motion, heating and vaporisation:

$$m_d\frac{d\mathbf{u}_d}{dt}=\frac{1}{2}C_D\rho_g A_d\lvert\mathbf{u}_g-\mathbf{u}_d\rvert(\mathbf{u}_g-\mathbf{u}_d)+m_d\mathbf{g},\qquad \frac{dm_d}{dt}=-\pi d\,\rho_g D\,\mathrm{Sh}\,\ln(1+B_M)$$

> **Eq. 3.10a–b** — variables: $m_d$ droplet mass [kg], $d$ diameter [m],
> $C_D$ drag coefficient [—], $A_d$ frontal area [m²], $\mathrm{Sh}$ Sherwood
> number [—], $B_M$ Spalding mass-transfer number [—]. Meaning: a droplet is
> a point that feels drag and evaporates, exchanging mass, momentum and
> energy with the gas cell it occupies. Assumes: dilute spray (droplets do
> not see each other), spherical drops much smaller than the cell, a
> subcritical droplet with a distinct surface, and a known initial droplet
> size distribution. Fails when: the spray is dense near the injector (it
> always is — the region where breakup actually happens is precisely where
> the dilute assumption is invalid), when the drop is supercritical (no
> surface, no latent heat — the whole formulation collapses), and when
> the cell size is comparable to the drop. [E]/[A]; [LM] is the reference for
> the atomisation correlations underneath.

**The honest statement about spray CFD:** the answer is dominated by the
**injected droplet size distribution**, which the CFD does not compute — it is
an *input*, taken from a correlation ([LM]) or, at best, from a cold-flow
patternation and Phase-Doppler measurement of that specific element. Primary
atomisation — the physics of how the sheet becomes ligaments — is not
resolved in any production rocket CFD. So the standing joke is fair: spray
CFD tells you what happens downstream of the assumption you made. [J]

For **supercritical** injection (LOX in any modern high-pressure chamber),
Euler–Lagrange is not merely inaccurate, it is inapplicable: above the
critical pressure there is no surface tension, no latent heat and no
droplet. The correct treatment is a single-phase real-fluid (Eulerian)
calculation with a cubic or higher equation of state and correct
high-pressure transport properties, in which the "spray" appears as
turbulent mixing of a dense fluid — the "finger" structures observed in
optically accessible experiments. [OY93] is the review that established this
framing; getting it wrong (using a droplet model above $p_c$) produces
plausible-looking, systematically wrong mixing lengths.

#### 3.5.4 The Purdue/AFRL model-combustor validation history

Because chamber CFD cannot be validated against a full engine — you cannot
put optical access and a hundred thermocouples into a flight chamber — the
community built **model combustors** whose whole purpose is to be measurable.
The most important open example in American work is the Purdue/AFRL family
of single- and multi-element combustors, of which the best documented is the
**Continuously Variable Resonance Combustor (CVRC)** [Yu12].

Its design logic is worth understanding because it is the template for how
this kind of validation is done:

- **One element**, so the geometry is unambiguous and the boundary conditions
  are knowable.
- **A translating oxidiser-post length**, which continuously varies the
  coupling between the injector's acoustic response and the chamber's
  longitudinal mode. The combustor can therefore be driven *deliberately*
  from stable to unstable and back within a single test, producing a
  continuous stability map rather than a binary result.
- **Measurable, publishable, unclassified**: gaseous or simple propellants at
  pressures high enough to be relevant, with high-bandwidth pressure
  instrumentation and, in related rigs, optical access for chemiluminescence
  and PIV.

What the campaign delivered, and what it did not: it produced a public data
set against which unsteady CFD could be tested on the *right question* —
does the simulation predict the onset of instability, the limit-cycle
amplitude, and the frequency, without being told the answer? Results across
the community established the pattern that: (i) URANS with a flamelet
closure could reproduce the *frequency* (that is mostly acoustics and
geometry) but not reliably the *amplitude* or the stability boundary;
(ii) LES with finite-rate chemistry could reproduce onset and limit-cycle
amplitude in specific cases, at a cost of large parallel machine time per
configuration; (iii) the answers remained sensitive to the chemical
mechanism, the subgrid model and the inflow boundary treatment at a level
comparable to the effect being predicted. [R]/[M]

The engineering lesson is the one that matters: **after decades of effort,
predicting combustion instability from first principles for a new chamber is
still a research capability, not a design tool.** That is why Module 15's
classical methods — the $n$–$\tau$ sensitive time-lag framework [CC56],
Culick's modal analysis [Culick68], and the empirical stability-rating bomb
test — remain the operational basis for stability, and why every new engine
is still bomb-tested. See §3.18.

#### 3.5.5 What a converged answer actually costs

A "converged answer" in reacting chamber CFD means four separate things,
and programmes routinely deliver one and claim all four:

1. **Iterative convergence** — residuals dropped several orders and, more
   importantly, the *quantity of interest* has stopped moving. Residuals
   alone are not evidence; monitor integrated wall heat flux or mean
   chamber pressure and show it flat.
2. **Statistical convergence** (LES/URANS) — enough flow-through times, after
   the initial transient is discarded, that the time-averaged statistics
   have settled. For a chamber with a 3 ms residence time, meaningful
   statistics need tens of milliseconds of simulated time, at time steps of
   10⁻⁸–10⁻⁷ s. That is 10⁵–10⁶ time steps.
3. **Grid convergence** — Eq. 3.1, on the quantity of interest, with at least
   three grids. In reacting LES this is almost never done, because
   refining the grid in LES changes the *model* (the filter width), not just
   the discretisation. The honest substitute is a sensitivity study plus a
   resolution metric (e.g. fraction of turbulent kinetic energy resolved
   $>80\,\%$).
4. **Model convergence** — the answer no longer changes when you change the
   subgrid model, the mechanism, or the inflow turbulence specification. This
   is the one that is almost always skipped and almost always the largest
   term.

The practical budget, [E]/[J], for a reacting multi-element chamber LES that
would survive a technical review: 10⁷–10⁹ cells, 10⁵–10⁶ time steps,
10³–10⁵ cores, weeks to months, and a team that has done it before. For a
single-element RANS case with a flamelet table: hours on a few hundred cores.
The factor between them is why the multi-element case gets run once, at the
end, to confirm a decision that was already made on other grounds.

### 3.6 Nozzle CFD: method of characteristics versus RANS

The nozzle is the one place in the engine where a classical analytic method
is *not* merely a sanity check — it is still the design method.

**Method of characteristics (MOC).** For steady, supersonic, irrotational,
isentropic flow, the governing PDE is hyperbolic and its characteristics are
the left- and right-running Mach lines, along which the compatibility
relations reduce to ordinary differential equations. The two-dimensional
irrotational relations are

$$\theta \pm \nu(M) = \text{const along } C_\mp,\qquad \nu(M)=\sqrt{\frac{\gamma+1}{\gamma-1}}\arctan\!\sqrt{\frac{\gamma-1}{\gamma+1}(M^2-1)}-\arctan\!\sqrt{M^2-1}$$

> **Eq. 3.11** — variables: $\theta$ flow angle [rad], $\nu$ Prandtl–Meyer
> function [rad], $M$ Mach [—]. Meaning: in supersonic irrotational flow,
> $\theta\pm\nu$ is constant along characteristic lines, which turns contour
> design into a marching algebra problem. Assumes: steady, supersonic
> throughout, irrotational, isentropic, calorically perfect (or a corrected
> $\gamma$), no viscosity. Fails when: shocks appear inside the nozzle, in
> the transonic throat region (handled by a separate transonic start line),
> when the flow separates, or where the boundary layer is thick. [F]; see
> [ZH Vol. 2] and Module 09.

MOC gives you an *exact* inviscid contour: the shortest nozzle producing
uniform parallel exit flow, or — the practically important case — Rao's
thrust-optimised parabolic contour, obtained by a variational condition on
the characteristic net [Rao58, Rao60]. Nobody has improved on this. Every
production bell nozzle contour in the engine database began life as an
MOC/Rao contour, then received a **boundary-layer displacement correction**
(add $\delta^*$ to the wall) and a manufacturing smoothing.

**So what is RANS for?** Four things MOC cannot do:

1. **Boundary layer and its performance debit.** A 2-D axisymmetric RANS gives
   the momentum-thickness drag and wall heat flux directly rather than by a
   correlation. Typical boundary-layer loss in $I_{sp}$: 0.3–1.5 %, larger for
   small throats.
2. **Real-gas and finite-rate effects.** Recombination along the nozzle,
   varying $\gamma$, condensation of alumina in solid motors.
3. **Off-design and separated operation.** The one that matters most.
4. **Film-cooling and turbine-exhaust dump interactions.** The F-1's
   gas-generator exhaust curtain, the RS-68's ablative-skirt film, the
   nozzle-extension mixing layer — none of it is MOC-able.

**Separation prediction.** An overexpanded nozzle at sea level separates, and
predicting *where* determines the side load, which determines the gimbal
bearing and the nozzle structure. The classical criteria (Module 09) —
Summerfield's $p_{\text{sep}}\approx0.4\,p_a$ [SFS54], Schmucker's
$p_{\text{sep}}/p_a=(1.88M_e-1)^{-0.64}$ [Schmucker73] — are correlations
fitted to particular families of nozzles.

RANS does better in a specific and limited sense: with a well-behaved
turbulence model (SST is standard here, because $k$–$\epsilon$ notoriously
delays separation) and an adequately resolved boundary layer
($y^+\lesssim1$), 2-D axisymmetric RANS predicts the *mean* separation
location in cold-flow subscale nozzles to within a few percent of the exit
radius. What it does **not** reliably predict is:

- the transition between **free shock separation (FSS)** and **restricted
  shock separation (RSS)**, which is the physical origin of the large
  transient side loads in thrust-optimised contours, and which involves a
  bistable, hysteretic reattachment [OMK05, Ostlund02];
- the *unsteady* side load amplitude, which is a fluctuating asymmetric
  pressure integral and therefore needs at minimum a DDES/LES treatment with
  a long sample;
- separation with significant film cooling or a dumped turbine exhaust
  altering the near-wall gas.

[J] The working practice is: MOC/Rao for the contour, 2-D RANS for
performance and mean separation, an empirical criterion as the design bound
because it is conservative and traceable, and a **hot-fire side-load
measurement** as the actual qualification. This is a good example of a field
where forty years of CFD has moved the classical method from "the answer" to
"the bound", and no further.

### 3.7 Conjugate heat transfer, and the Bartz check

**What it computes.** A CHT analysis solves the gas-side flow, conduction in
the wall, and the coolant-side flow *simultaneously*, with the interfaces
enforcing continuity of temperature and heat flux rather than a prescribed
boundary condition:

$$T_{g,\text{wall}}=T_{s,\text{wall}},\qquad -k_g\left.\frac{\partial T}{\partial n}\right|_g=-k_s\left.\frac{\partial T}{\partial n}\right|_s$$

> **Eq. 3.12** — variables: $k_g,k_s$ gas and solid conductivity [W/(m·K)],
> $n$ wall-normal coordinate [m]. Meaning: the wall temperature is an
> *output* of the coupled problem, not an input to a decoupled one.
> Assumes: no contact resistance (a real issue at braze joints and in
> AM part-to-part interfaces), and that all three domains are resolved
> adequately. Fails when: the thermal time constants of the three domains
> differ by orders of magnitude and the coupling scheme is not designed for
> it (gas-side response is microseconds, wall conduction is milliseconds,
> the coolant bulk is tens of milliseconds), and whenever the coupling is
> under-relaxed to the point of a converged-looking but unconverged answer.
> [F].

**Why it matters and what it adds.** The decoupled 1-D model (Eq. 3.5)
assumes a circumferentially uniform gas-side flux and 1-D conduction. Both
are wrong in specific, quantifiable ways that CHT exposes:

- **Circumferential streaks.** A finite number of injector elements produces a
  finite number of hot stripes. The peak-to-mean flux ratio at the wall is
  the single most consequential number in liner life, and 1-D models do not
  contain it. Values of 1.3–2.0 are commonly reported for the peak/mean
  ratio in the near-injector region [J]; the number depends on element type,
  spacing, and the film-cooling scheme.
- **Rib conduction.** Heat entering the land between channels is conducted
  circumferentially into the channel side walls; the 1-D fin-efficiency
  correction is a decent approximation but degrades at high channel aspect
  ratio, which is exactly the direction modern (especially AM) channels have
  gone.
- **Curvature enhancement at the throat.** Concave streamline curvature on
  the converging side destabilises the boundary layer and raises flux;
  convex curvature downstream suppresses it. Bartz's $(D_t/r_c)^{0.1}$ term
  is a crude nod to this.
- **Coolant-side non-uniformity.** Channel-to-channel flow maldistribution
  from the manifold — a real and frequently underestimated failure path.

**The Bartz check — do this every time.** Before you believe a CHT result,
recompute the throat flux with Bartz [Bartz57]:

$$h_g=\frac{0.026}{D_t^{0.2}}\left(\frac{\mu^{0.2}c_p}{Pr^{0.6}}\right)_0\left(\frac{p_c}{c^*}\right)^{0.8}\left(\frac{D_t}{r_c}\right)^{0.1}\left(\frac{A_t}{A}\right)^{0.9}\sigma$$

> **Eq. 3.13** — as in Module 10; $\sigma$ is the property-variation
> correction. Meaning: a Dittus–Boelter-type turbulent pipe correlation
> reshaped for a nozzle. Assumes: attached turbulent boundary layer,
> chamber-stagnation properties, no film cooling, no injector-driven
> maldistribution. Fails: everywhere those hold poorly; the paper itself
> calls it a *rapid estimate*, and the honest band is $\pm20$–$30\,\%$ at the
> throat and worse elsewhere. [E].

The check is not "does the CFD match Bartz". It is: **is the CFD inside the
Bartz band, and if not, is there a physical reason I can name?** Legitimate
reasons for the CFD to sit below Bartz: film cooling, a fuel-rich boundary
layer, a low-conductivity soot layer (kerolox), a low wall temperature ratio
handled properly. Legitimate reasons to sit above: a hot streak, a
recirculation zone impinging on the wall, curvature. Illegitimate reasons —
and these are the ones you find — a first cell at $y^+=80$ with a wall
function that was never intended for a 3000 K gradient; radiation switched
off in a soot-forming flame; a mesh that is fine in the chamber and coarse
through the throat because that is where the geometry generator put the
cells. Worked Example 2 (§5.2) runs the check numerically.
