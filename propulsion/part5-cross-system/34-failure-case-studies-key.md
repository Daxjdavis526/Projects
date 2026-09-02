# Module 34 — Failure Case Studies: Answer Key

Grading note: on the reasoning and judgement items, the argument is the answer.
A correct classification with no mechanism earns little; a defensible mechanism
with a debatable classification earns most of the marks. Where the public record
is ambiguous — Antares Orb-3, Starship — a student who says so scores higher than
one who picks a cause confidently.

---

## K1. Problem solutions

### Conceptual

**C1.** *Why the field joint seal is dynamic; what qualification must add.*

The duty is not "hold pressure across a fixed gap." At ignition the case
pressurises to ~6.25 MPa in roughly 0.6 s, and the tang-and-clevis joint
**rotates** as the case membrane bulges: the gap the seal must fill is *growing*
during the pressure rise `[Rogers86 ch. IV]`. The seal therefore has to extrude
into a moving boundary, and whether it succeeds is a race between the gap-opening
rate and the elastomer's recovery rate. Both are rates; the ratio is the design
parameter. A static seal has no such race.

What qualification must add, over a static seal: **a dynamic test at the flight
pressurisation rate, at the cold end of the temperature envelope, with the actual
joint geometry** — i.e. a subscale or full-scale joint fixture pressurised on a
representative $dp/dt$ ramp, instrumented for gap opening and for leakage, run at
the minimum allowable joint temperature. Measuring O-ring compression set,
hardness and static leak rate is necessary and entirely insufficient.

Full marks require the words *rate* and *joint rotation*. An answer that focuses
on the elastomer's stiffness alone earns half.

**C2.** *Two independent failure populations at a joint.*

They are independent because they have different **functions, different loads,
different materials and different failure physics**:

| | seal (O-ring) | insulation-to-case bond |
|---|---|---|
| function | prevent gas leaving through the joint gap | prevent gas reaching the case wall anywhere |
| load | gap opening rate, squeeze, thermal | peel/cleavage from pressurisation and cure shrinkage |
| failure physics | viscoelastic response time vs duty | adhesive/cohesive fracture of a bond line |
| what defeats it | cold, joint rotation, putty blow-by | contamination, cure error, handling, ageing |
| detection before flight | leak check of the joint | essentially none — no NDE distinguishes bonded from touching |

Fixing one has no effect on the other. This is precisely why *Challenger* and
Titan 34D-9, three months apart, were **not** the same failure.

**Distinguishing them in wreckage.** A seal failure leaves an erosion/blow-by
path *through the joint gap* — soot and erosion on the O-ring and its groove, a
localised radial burn channel through the joint, and a case whose membrane away
from the joint is intact. A bond failure leaves a **case wall eroded from the
inside over an area**, with the insulation separated from the steel and a char
pattern that is not centred on the joint gap; the O-rings may be pristine. The
diagnostic is *where the case metal loss is relative to the seal groove*.

**C3.** *Structurally acceptable, chemically fatal.*

A structural assessment asks: does this feature reduce burst pressure or fatigue
life below requirement? For a liner buckle under a carbon overwrap, the answer was
no — the overwrap carries essentially all the hoop load, and a locally buckled
thin liner is not a load path `[SpaceX-AMOS6]`. That assessment is correct and
complete *as a structural assessment*.

What it does not ask is: does this feature create a **volume**? The buckle is a
gap between liner and overwrap into which subcooled LOX can pool and, at helium
loading temperatures below the oxygen triple point (54.36 K), freeze. That places
condensed oxygen in intimate contact with carbon fibre, and fibre fracture or
friction supplies an ignition energy of order millijoules against a release of
order $10^{5}$ J (WE3). The feature is a *geometric* enabler of a *chemical*
mechanism.

The general pattern: **a feature must be assessed against every function it can
participate in, not only the one it was drawn for.** Another example from the
module: the Apollo 13 oxygen tank's internal fan and heater assembly was
electrically and thermally adequate and was simultaneously an ignition source in
a high-pressure oxygen atmosphere `[Cortright70]`. A third acceptable answer:
the CRS-7 helium COPV was structurally fine and was a large buoyant mass under
axial acceleration, which is what loaded the strut.

**C4.** *Two-of-three voting and STS-51F.*

A two-of-three vote reduces the probability of a spurious shutdown from $p$ to
approximately $3p^2$ **only if the sensor failures are independent**. On STS-51F
the sensors were the same part, from the same population, in the same location,
seeing the same thermal and vibration environment, with the same failure mode
(drifting/failing high). Their failures were **common-cause**, so the joint
probability of two failing high together was far larger than $p^2$ — and because
two-high is exactly the vote condition, the redundancy actively *converted* the
common-cause failure into a commanded engine shutdown `[SSME-Orient]` `[Biggs89]`.
Redundancy against a common-cause failure is not redundancy.

**An architecture that would have worked**: a **reasonableness / analytical
redundancy** layer. Turbine discharge temperature is not an independent quantity —
it is determined by turbopump speed, preburner mixture ratio, coolant flow and
chamber pressure, all separately measured. Before a temperature channel is allowed
to vote, require it to be consistent with an engine-state model built from those
other measurements; disqualify a channel that is inconsistent. Modern engine
controllers do this.

**Cost:** the model is a new piece of flight-critical software with its own
validity envelope; it must be shown not to mask a real overtemperature (the
missed-detection error), which requires demonstrating the model across the full
throttle and off-nominal range. You trade sensor hardware reliability for
software verification effort, and you add a new failure mode — a wrong model.
An answer that names the cost as well as the fix earns full marks.

**C5.** *Ground environment supplying a benefit flight does not.*

Principle: **a ground test is a different environment, and the differences are
not all conservative.** Some are benign, some are punishing, and some are
*helpful* — and a helpful difference is the dangerous kind, because the test
passes and the flight fails.

Apollo 6: the J-2 ASI LOX line's flexible bellows accumulated a layer of
condensed and frozen air at sea level, which added mass and damping and detuned
its flow-induced resonance. In vacuum there is no air, the damping disappeared,
and the bellows failed in high-cycle fatigue `[SP-4206 ch. 9]` `[SP-8123]`.

Second example from the module: the Ariane 5 ECA Vulcain 2 nozzle. On the ground
the nozzle is loaded by atmospheric pressure over its whole external surface; in
flight that load goes away and reverses in effect, and the upper nozzle deformed
under loading it never saw on a stand `[ESA-V157]`.

Third, constructed (any defensible answer accepted): a hydrazine thruster's
catalyst bed is warmed by ambient laboratory air between pulses on a bench test;
in vacuum the only heat path is conduction through the mount, so bed temperature
before a cold pulse is lower in flight, and ignition delay and roughness are
worse than qualified. Or: a gimbal actuator's bearing is lubricated by residual
humidity on the ground; in vacuum the water desorbs and the friction coefficient
rises.

**C6.** *VV22 as a qualification-method finding.*

The Commission's finding was that the C–C throat insert suffered
thermo-mechanical over-erosion, most likely from a homogeneity flaw, **and** that
*the criteria used to accept the insert were not sufficient to demonstrate its
flightworthiness* `[ESA-VV22]`. The second clause is the root cause because it is
the condition whose correction prevents the class: had the acceptance criteria
been able to distinguish an acceptable insert from an unacceptable one, the flawed
insert would not have flown, whatever its provenance.

Why it is not a finding about carbon–carbon: carbon–carbon is not a material
specification but a **process family**. Fibre type, weave architecture (2D, 3D,
needled), matrix precursor (pitch, resin, CVI), the number and route of
densification cycles, and final heat-treatment temperature all change the
through-thickness conductivity, the microporosity and the oxidation/erosion
behaviour, and two billets can meet the same density and room-temperature
strength specification while differing by a factor in erosion rate.

**What the acceptance test should have measured:** the **hot-gas recession rate**
of the flight lot, at representative pressure, temperature, mass flux and
particle loading — i.e. a subscale ablation or plasma-torch test on material from
the actual billet, correlated to a motor firing. Secondary but useful: through-
thickness CT for homogeneity and delamination, and thermal diffusivity, since
recession is diffusion-limited. Density and room-temperature flexural strength
measure neither. `[SP-8115]`

**C7.** *N1's thirty engines: both sides.*

*(a) The engine count caused the failure.* Serial reliability: with no engine-out
capability worth the name, stage reliability is bounded by
$R_{\text{eng}}^{30}$. At a per-engine reliability of 0.99 that is 0.74; at 0.995
it is 0.86. No plausible per-engine reliability in 1969 gives an acceptable stage.
Worse, 30 engines mean 30 sets of feed lines, valves and a plumbing volume in
which a single leak — flight 3L — finds an ignition source. And the KORD shutdown
logic, which existed *because* of the engine count, itself precipitated losses.

*(b) The engine count was irrelevant.* Each of the four failures had a specific,
identifiable, individually fixable cause: an oxidiser line leak; a turbopump
disintegration attributed to debris; insufficient roll control authority; a water-
hammer transient from simultaneous shutdown of six engines. None of these is a
consequence of *thirty* per se — a five-engine stage with the same feed-system
design, the same absence of stage-level ground test, and the same acceptance-by-
sampling would have failed too. Falcon Heavy flies 27 engines successfully.

*(c) Which is stronger.* [J] **(b) is stronger, but only because of what it
implies.** The engine count is not itself a defect; it is a *multiplier* on
whatever process discipline you have. The N1's actual root cause was the absence
of an integrated first-stage ground test and the practice of lot-sampling
non-restartable engines, which meant every launch was the first integrated test
`[Hunley07]`. Thirty engines made that fatal; five would merely have made it
expensive. The strongest formulation is: **high engine count is only viable with
individually testable engines, genuine engine-out control authority, and a
stage-level hot fire — the N1 had none of the three.** An answer that reaches
this synthesis earns full marks; one that simply asserts (a) earns half.

**C8.** *Normalisation of deviance versus legitimate acceptance.*

Both look identical from the outside: a recurring anomaly, flights continuing.
They differ on four points, and this is the real-time criterion:

1. **Is the mechanism understood?** Legitimate acceptance requires a physical
   model of *why* the anomaly occurs and *what bounds it*. Normalisation of
   deviance substitutes the flight record for the model: "it has always been
   fine."
2. **Is there a demonstrated margin to failure, and does the observed data lie
   inside it?** Legitimate acceptance names the failure threshold and shows the
   distance. Normalisation names no threshold.
3. **Is the trend flat?** Legitimate acceptance requires that severity and rate
   are stationary, or are moving in a direction and at a rate you have bounded.
   O-ring erosion depth versus joint temperature was **not** stationary and the
   correlation was known `[Rogers86 ch. V]`.
4. **Which way is the burden of proof?** This is the decisive one. In legitimate
   acceptance, the engineer must prove the anomaly is safe. In normalisation of
   deviance, the burden has silently inverted and the engineer is asked to prove
   it is *unsafe*. The night before STS-51L, that inversion happened explicitly.

**The criterion to apply in real time**: *can I state the failure threshold, the
current margin to it, and the mechanism, in one sentence, without appealing to
flight history?* If not, you are normalising. [J]

### Calculation

**P1.** $p_2/p_1 = (A_{b,2}/A_{b,1})^{1/(1-n)}$.

$n = 0.30$: $1/(1-n) = 1.4286$. $1.22^{1.4286} = 1.3285$.
$p_2 = (8.0)(1.3285) = \mathbf{10.63\ MPa}$ — **below MEOP 12.0 MPa; survives.**

$n = 0.45$: $1/(1-n) = 1.8182$. $1.22^{1.8182} = 1.4355$.
$p_2 = (8.0)(1.4355) = \mathbf{11.48\ MPa}$ — still below 12.0 MPa, but the
margin has fallen from 1.37 MPa to 0.52 MPa, a 62 % reduction.

**Comment.** The **low-exponent propellant is more forgiving.** The amplification
factor $1/(1-n)$ is the whole story: an area error of $\epsilon$ becomes a
pressure error of $\epsilon/(1-n)$ to first order. This is one of the two main
reasons composite propellants are formulated for $n$ in the 0.2–0.4 band (the
other being temperature sensitivity and the risk of $n \ge 1$, where no stable
equilibrium exists at all). Full marks require the comment, not just the numbers.

**P2.** $p/p_1 = [A_t/(A_t+A_v)]^{1.4286}$ with $A_t = 0.020$ m², $p_1 = 8.0$ MPa,
$A_v = 0.008\,(t/4)$ m².

| $t$ (s) | $A_v$ (m²) | $A_v/A_t$ | $p/p_1$ | $p$ (MPa) |
|---|---|---|---|---|
| 0 | 0.0000 | 0 % | 1.000 | 8.00 |
| 1 | 0.0020 | 10 % | 0.873 | 6.98 |
| 2 | 0.0040 | 20 % | 0.771 | 6.17 |
| 3 | 0.0060 | 30 % | 0.687 | 5.50 |
| 4 | 0.0080 | 40 % | 0.618 | 4.95 |

**Trace description.** A monotonic decay that is **steepest at the beginning** and
flattens, because $p \propto (1+A_v/A_t)^{-1.4286}$ is convex in $A_v$ — the first
10 % of vent area costs 13 % of pressure, the last 10 % costs 7 %. It is not
exponential and not linear; a student who describes it as "exponential decay"
loses a mark. The decay would continue to the point of case structural failure,
which usually arrives long before the curve flattens.

**25 % drop:** $p/p_1 = 0.75 \Rightarrow (1+A_v/A_t) = 0.75^{-1/1.4286} = 1.223$,
so $A_v = 0.223 \times 0.020 = \mathbf{4.46\times10^{-3}\ m^2}$, a circular hole of
**75 mm diameter**. Note how small that is relative to a motor of $A_t = 0.02$ m²
(160 mm throat diameter).

**P3.** $V = 0.065$ m³, $p = 3.10\times10^{7}$ Pa, $T = 100$ K, $\gamma = 1.667$.

(a) $pV = 2.015\times10^{6}$ J; $pV/(\gamma-1) = 3.021\times10^{6}$ J;
$(p_a/p)^{(\gamma-1)/\gamma} = (3.226\times10^{-3})^{0.4} = 0.1005$.
$E = 3.021\times10^{6}(1-0.1005) = \mathbf{2.72\ MJ}$.

(b) $2.72/4.184 = \mathbf{0.65\ kg\ TNT\ equivalent}$.

(c) $R = 8314.46/4.0026 = 2077.3$ J/(kg·K);
$m = pV/(RT) = (3.10\times10^{7})(0.065)/(2077.3\times100) = \mathbf{9.70\ kg}$.

(d) **The ideal-gas assumption underestimates the mass.** Helium at 31 MPa and
100 K has a compressibility factor $Z$ of roughly 1.15–1.2, and $m = pV/(ZRT)$,
so the *ideal* value is too **high** by that factor — real mass ≈ 8.1–8.4 kg.
(Marking note: sign errors here are common. $Z>1$ means the real gas occupies
more volume per mole than ideal, hence *less* mass in a fixed volume. A student
who says "underestimates" earns zero for (d) but keeps (a)–(c).) The stored
*energy* is affected in the opposite sense to intuition: $E$ as computed depends
only on $p$, $V$ and $\gamma$, not on $m$, so (a) is unaffected — but the true
$\gamma$ of dense helium at 100 K is above 1.667, which raises $E$ slightly. Use
`[NIST-WB]`/`[REFPROP]` for anything that matters.

**P4.** $V_v = 1.2\times10^{-5}$ m³, $\rho_{\mathrm{SOX}} = 1300$ kg/m³.

$m_{\mathrm{O_2}} = (1300)(1.2\times10^{-5}) = 1.56\times10^{-2}$ kg $=$ **15.6 g**.
$m_C = (12.011/31.999)(15.6) = $ **5.86 g**.
$Q = (5.86\times10^{-3})(32.8\times10^{6}) = 1.92\times10^{5}$ J $=$ **192 kJ**.

Strain energy in 12 cm³ of overwrap at $\epsilon = 0.012$, $E = 140$ GPa:
$u = \tfrac12 E\epsilon^2 = \tfrac12 (1.4\times10^{11})(1.44\times10^{-4}) =
1.008\times10^{7}$ J/m³; $U = (1.008\times10^{7})(1.2\times10^{-5}) =$ **121 J**.

$Q/U = 1.6\times10^{3}$.

**Comment.** The chemical energy available in the trapped oxidiser exceeds the
elastic strain energy of the same volume of composite by more than three orders
of magnitude. That is the quantitative statement of why **an ignition mechanism
dominates a structural mechanism** in this component: you cannot outrun a
1,600:1 energy ratio by making the overwrap stronger. Note also that the elastic
energy is not irrelevant — it is a plausible *ignition source*, since fibre
fracture releases it locally and abruptly, which is exactly SpaceX's stated
mechanism `[SpaceX-AMOS6]`. Full marks require this two-part reading: the strain
energy is the trigger, the chemical energy is the event.

**P5.** $\Omega = 18{,}300/60 = 305.0$ Hz.
$f_{\text{exc}} = (\lambda-1)\Omega = (0.15)(305.0) = \mathbf{45.75\ Hz}$.
Cycles in 400 s: $N = (45.75)(400) = \mathbf{1.83\times10^{4}}$.
$2N = 3.66\times10^{4}$.
$\sigma_a = (1400)(3.66\times10^{4})^{-0.085}$. $\ln(3.66\times10^{4}) = 10.508$;
$(3.66\times10^{4})^{-0.085} = e^{-0.893} = 0.409$.
$\sigma_a = (1400)(0.409) = \mathbf{573\ MPa}$.

Credit for noting that the four-bladed inducer's blade-passing frequency is
$4\Omega = 1{,}220$ Hz, giving $4.9\times10^{5}$ cycles in the same burn if that
mechanism dominates instead — a 27× difference in life-consuming cycle count from
choosing the wrong excitation mechanism, which is the practical point.

**P6.** Arrhenius fit to the two Rogers points:
$1/T_2 - 1/T_1 = 1.6513\times10^{-4}$ K⁻¹, $\ln 250 = 5.521$, so
$E_a = (8.3145)(5.521)/(1.6513\times10^{-4}) = \mathbf{2.78\times10^{5}\ J/mol =
278\ kJ/mol}$.

At 40 °F $= 277.59$ K: $1/T - 1/T_1 = 2.782\times10^{-4}$ K⁻¹,
$\ln a_T = (3.344\times10^{4})(2.782\times10^{-4}) = 9.30$, $a_T = 1.10\times10^{4}$
— careful, evaluate: $a_T = 2.66\times10^{3}$, $\tau = (2.4)(2.66\times10^{3}) =
\mathbf{6.4\times10^{3}\ s \approx 1.8\ h}$.
*(Marking: accept $2.6$–$2.7\times10^{3}$ for $a_T$; the sensitive step is
$1/T-1/T_1$.)*

WLF with $T_g = 269.17$ K: $T - T_g = 8.42$ K, $T_1 - T_g = 27.87$ K.
$\log_{10}a_T = -17.44(8.42)/(51.6+8.42) + 17.44(27.87)/(51.6+27.87)
= -2.447 + 6.116 = 3.669$, $a_T = 4.66\times10^{3}$,
$\tau = \mathbf{1.12\times10^{4}\ s \approx 3.1\ h}$.

**Which would you quote?** [J] Neither, as a number. You quote the **pair**:
"two independent models fitted to the same two data points give 1.8 h and 3.1 h;
the duty is 0.6 s; the conclusion is insensitive to the model choice by a factor
of $10^4$." A launch-readiness review does not need the recovery time; it needs
to know that the margin is not close. Quoting a single number invites an argument
about the model and loses the argument that matters.

**What $E_a = 278$ kJ/mol tells you:** it is the same order as a covalent bond
dissociation energy, which is physically implausible for a *relaxation* process
that breaks no bonds — the signature of near-glass-transition behaviour where the
apparent activation energy is large and is itself temperature-dependent, i.e.
where Arrhenius is an interpolation formula and not a physical law.

**P7.** $p_2/p_1 = (A_{t,2}/A_{t,1})^{-1/(1-n)} = 1.08^{-1.5385}$.
$\ln 1.08 = 0.07696$; $-1.5385 \times 0.07696 = -0.11840$; $e^{-0.11840} = 0.8883$.
**$p_2/p_1 = 0.888$**, an 11.2 % end-of-burn pressure shortfall.

**Total impulse.** Assumptions to state: (i) all the propellant burns; (ii) $c^\ast$
is unaffected by the pressure change (true to a few tenths of a percent over this
range for a composite propellant); (iii) the burn simply extends at lower
pressure and lower burn rate; (iv) $C_F$ changes only through the expansion ratio
$\varepsilon = A_e/A_t$ and the pressure ratio.

Total impulse $I = \int F\,dt = \int C_F p_c A_t\,dt$. Since
$\int p_c A_t \,dt = \int \dot m c^\ast dt = m_p c^\ast$ and $m_p$ and $c^\ast$
are fixed, **total impulse changes only through the mass-averaged $C_F$.** Two
effects, both negative and both small: $\varepsilon$ falls by 8 % (the exit area
is fixed, the throat grew), and $p_c/p_a$ falls ~11 %, so the nozzle is further
from optimum and closer to over-expansion at low altitude. For a typical
$\varepsilon \approx 16$ booster nozzle, an 8 % $\varepsilon$ reduction costs
roughly 0.5–1 % of $C_F$ in vacuum. **Estimate: total impulse down about 1 %,
delivered over a longer, lower-thrust burn.**

The examinable point is the reasoning: *throat erosion mostly redistributes
impulse in time rather than destroying it*, which is why VV22's signature was a
pressure droop with an extending burn and why the mission was lost to
**trajectory** rather than to impulse shortfall.

**P8.** From `reference/_verify-liquid.md` §5: LE-7 chamber pressure
**12.7 MPa (127 bar)**; LE-7A **12.0 MPa (120 bar)**.

Fractional reduction $= (12.7-12.0)/12.7 = 0.0551 = \mathbf{5.51\ \%}$.

With injector pressure drop at 20 % of $p_c$, pump discharge pressure
$\approx 1.2\,p_c$ (ignoring line and jacket losses, which would raise the factor
to ~1.4–1.5 for a regeneratively cooled hydrogen engine — say so):

$p_{d,\text{LE-7}} \approx 1.2(12.7) = 15.24$ MPa;
$p_{d,\text{LE-7A}} \approx 1.2(12.0) = 14.40$ MPa;
**reduction 0.84 MPa, i.e. the same 5.51 %.**

Because pump power scales as $\dot m \Delta p/(\rho\eta)$ and $\dot m$ also falls
with $p_c$ at fixed geometry, the **turbopump power** falls by roughly
$(1-0.0551)^2 \approx 10.7\ \%$ — which is the real reason the de-rate buys margin:
turbine inlet temperature, bearing loads, and shaft speed all come down together.
Credit for making that second-order point.

### Engineering reasoning

**R1.** *Smooth droop, no yaw, extended burn.*

**Class: PE/MC** (a materials or manufacturing escape). **Mechanism: nozzle
throat over-erosion.**

Reasoning. Three candidate mechanisms produce a falling head-end pressure: a
vent in the case, throat over-erosion, and (rarely) a nozzle-entry blockage
clearing. Discriminate:

- **No yaw rate** rules out a case burn-through: a vent is a sideways nozzle and
  produces an immediate, large lateral force and attitude transient. Absent that,
  the gas is still leaving through the intended throat.
- **Extended burn time** is the positive indicator. Lower pressure means lower
  burn rate ($r = ap^n$), so the web takes longer to consume. A vent *also*
  lowers pressure and would also extend the burn, but see the previous point. A
  debond adding burning area would *shorten* the burn and *raise* the pressure.
- **Progressive, accelerating shortfall** (4 %, 11 %, 26 %) is consistent with an
  erosion rate that grows as the throat grows — recession rate rises with local
  mass flux, and a larger throat at fixed $A_b$ means... actually lower flux, so
  in practice the acceleration comes from the insert degrading through its
  thickness. Either way it is smooth and has no discontinuity, which a mechanical
  breach would.

**The confirming measurement: the thrust-to-chamber-pressure ratio**, obtained
from vehicle axial acceleration and mass. For throat erosion this ratio stays
consistent with $C_F$ for the (slowly falling) $\varepsilon$; for a case vent it
is grossly inconsistent, because mass is leaving through an aperture with no
expansion. If you cannot get axial acceleration, the second-best measurement is a
**nozzle exit-plane or aft-skirt temperature/strain** channel, or post-flight
recovery of the nozzle.

This is the VV22 signature `[ESA-VV22]`.

**R2.** *Rapid droop, yaw rate, $C_F$ inconsistency.*

**Class: PE** (manufacturing escape in the insulation bond or the inhibitor).
**Mechanism: case burn-through.**

Reasoning. The three signatures are jointly conclusive:
1. **Rapid onset** (3 % → 9 % in 2 s) at *early* burn time, when throat erosion
   has barely started, rules out throat erosion.
2. **A yaw rate the TVC is fighting** means a lateral force exists that is not
   commanded. A solid motor has exactly one way to make one: gas leaving through
   an aperture that is not the nozzle.
3. **The $C_F$ inconsistency is decisive** because it is the only observable that
   distinguishes "less gas being made" from "gas going somewhere else." Chamber
   pressure alone tells you the ratio $A_b/A_t^{\text{eff}}$ has changed; it does
   not tell you *which*. Axial thrust inferred from acceleration, divided by
   $p_c A_t$, gives you the effective $C_F$: if mass is escaping through a hole
   with no expansion, the vehicle gets far less axial thrust per unit chamber
   pressure than the nozzle geometry predicts. That is a *conservation* argument
   and it does not depend on any propellant property.

Titan 34D-9 and Titan IV K-11 `[UPI-Titan34D]` `[GS-Titan]`.

**R3.** *Low $p_c$, low pump discharge, high turbine temperature, oxidiser-rich MR
shift, rising wall temperature.*

**Class: PE** (a process escape), possibly **DM** (retention design).

**Mechanism 1 — fuel-side flow restriction.** A partial blockage in the fuel
feedline or an internal part (filter, screen, orifice) displaced into the flow.
Signature fit: pump discharge low **and** chamber pressure low (the pump is
working against a downstream restriction and delivering less), mixture ratio
shifts **oxidiser-rich** because it is the fuel that is starved, turbine
discharge temperature rises because a gas-generator or preburner running
oxidiser-rich is hotter, and the chamber wall temperature rises for two
independent reasons: a hotter, more oxidising gas and less coolant flow in the
regenerative jacket. **This is the Virgin Orbit LauncherOne mechanism**
`[VO-2023]`.

**Mechanism 2 — fuel turbopump degradation.** Cavitation, a damaged impeller, or
bearing drag reducing delivered head. Signature fit is similar but differs in one
respect: a degraded pump shows **low discharge pressure at nominal or high shaft
speed with rising vibration**, whereas a downstream restriction shows low flow at
nominal head coefficient. **This is the LE-7 / H-II F8 family** `[WP-LE7]`.

**How to separate them:** turbopump **shaft speed and vibration**. A restriction
downstream of the pump moves the operating point *up* the head–flow curve — head
rises, flow falls — and speed is normal; degradation moves it *down* and is
accompanied by vibration. If speed and vibration are nominal, it is a
restriction. Full marks require naming the discriminating measurement.

**R4.** *Redline shutdown on a healthy engine.*

**Leading hypothesis: instrumentation failure.** A single parameter off-nominal
while every physically coupled parameter is nominal is an instrumentation
problem until proven otherwise. Turbine discharge temperature is not independent:
it is determined by preburner mixture ratio, turbopump power (hence speed),
chamber pressure and coolant flow. All were nominal. There is no thermodynamic
path to a genuine 140 K turbine overtemperature that leaves turbopump speed and
chamber pressure untouched. This is STS-51F `[SSME-Orient]` `[Biggs89]`.

**The alternative: a genuine, highly localised hot streak** — a preburner
injector element damaged or partly blocked, producing a locally oxidiser-rich
streak that impinges on the sensor location while the *bulk* mixture ratio and
hence the bulk turbine power are essentially unchanged. This is physically real
and it is the reason you cannot simply dismiss the sensor.

**Evidence that separates them:**
1. **Post-flight sensor examination and calibration** — the direct test.
2. **The other two sensors in the same rake.** If all three read consistently and
   the engine state model disagrees with all three, you have a real localised
   phenomenon or a common-cause installation problem. If one or two diverge and
   the rest of the engine is nominal, it is the sensors.
3. **Hardware inspection of the preburner injector face** for a damaged element
   and a corresponding burn pattern on the turbine inlet hardware. A real hot
   streak leaves a witness mark; a sensor failure does not.
4. **The shutdown transient.** A clean shutdown means the engine responded
   normally to the command — consistent with healthy hardware.

A strong answer notes that the *correct real-time action* on STS-51F — inhibiting
further temperature redlines after the second engine approached the limit — was a
judgement call with an asymmetric payoff, and that it was right because the
alternative was losing a second engine and the abort mode with it.

**R5.** *Second-source carbon–carbon throat insert.*

**The argument that this is a design change.**

The drawing controls geometry and a small number of bulk properties. It does not
control the **process**, and for carbon–carbon the process *is* the material. The
function of a throat insert is to recede slowly and predictably under a
particle-laden, chemically reducing gas at ~3,400 K while remaining
dimensionally and structurally stable through a steep through-thickness thermal
gradient. The properties that govern this are:

- fibre type, sizing, and volume fraction;
- preform architecture (2D laminate, needled felt, 3D woven) and hence
  through-thickness conductivity and interlaminar strength;
- matrix precursor and route (resin char, pitch, CVI) and the resulting
  microporosity distribution;
- number of densification cycles and final graphitisation temperature, which set
  crystallite size and therefore oxidation kinetics;
- macroscopic homogeneity — the exact property the VV22 commission implicated
  `[ESA-VV22]`.

**None of these is captured by dimensions, bulk density, or room-temperature
flexural strength.** Two billets can match on all three specified quantities and
differ by a factor of two in recession rate. Therefore a supplier change changes
an uncontrolled but function-determining set of variables: it is a design change,
and it requires delta-qualification.

**Minimum test programme.**

1. **Material characterisation of the new lot:** CT or radiographic mapping for
   homogeneity, porosity and delamination on every billet; through-thickness and
   in-plane thermal diffusivity versus temperature; interlaminar tensile and shear
   strength at temperature; coefficient of thermal expansion; and open-porosity
   measurement. Establish the *distribution*, not a single value — homogeneity is
   the failure mode.
2. **Subscale ablation testing**, plasma torch or subscale motor, on material cut
   from the flight billets, at representative pressure, gas composition, mass flux
   and alumina particle loading. Measure recession rate and its scatter, and
   compare against archived data for the qualified material. This is the
   acceptance criterion the drawing lacked.
3. **At least one full-scale static firing** of a motor with the new insert,
   instrumented for chamber pressure and post-fire throat metrology, with the
   recession profile compared point-by-point against the qualified baseline.
4. **A revised acceptance specification** that includes an erosion-rate-correlated
   parameter measurable on every lot — the point of the exercise. If no such
   parameter can be found, the fallback is destructive lot testing at a defined
   sampling rate, stated explicitly in the qualification logic.
5. **Process freeze and configuration control** at the new supplier: any change to
   fibre lot, precursor, cycle count or furnace schedule reopens the
   qualification.

Marking: an answer that stops at "test the material properties" earns half. Full
marks require (a) naming *erosion rate at condition* as the property that matters
and (b) the observation that the acceptance criterion, not the material, is the
deliverable.

---

## K2. Quiz answers with explanations

**Q1 (8) — (c).** The O-ring recovered too slowly to follow the joint gap opening
during pressurisation.

- **(a) brittle fracture** — wrong. At 28 °F a fluorocarbon elastomer is stiff but
  well above the temperature at which it fractures on handling; nothing in the
  recovered hardware showed fracture. The failure was kinetic, not brittle.
- **(b) shrank below groove dimensions** — wrong by two orders of magnitude.
  Thermal contraction of an elastomer over 25 K is of order $2\times10^{-3}$ ×
  dimension, far smaller than the installed squeeze.
- **(c) correct.** The joint rotates open during the 0.6 s pressure rise; the seal
  must extrude to follow. Recovery time rises by orders of magnitude with falling
  temperature (WE1) `[Rogers86 ch. IV]`.
- **(d) chemical incompatibility** — wrong. The elastomer was compatible; the
  exposure duration is under two seconds in any case.

**Q2 (8) — (c).** Nozzle throat over-erosion.

- **(a) insulation debond** — wrong: a debond that adds burning surface *raises*
  pressure and *shortens* the burn.
- **(b) case burn-through** — wrong: a vent produces a lateral force and an
  attitude transient, and destroys the thrust-to-pressure consistency. Both are
  stated absent.
- **(c) correct.** Falling $p_c$ with $A_b$ nominal means $A_t$ grew; lower $p$
  means lower $r$ means a longer burn; the gas still leaves through the nozzle so
  $C_F$ stays consistent. `[ESA-VV22]`
- **(d) propellant crack** — wrong: a crack adds burning area (pressure rise) and
  is usually abrupt.

**Q3 (10).** $1/(1-n) = 1/0.60 = 1.6667$. $1.15^{1.6667}$:
$\ln 1.15 = 0.13976$; $\times 1.6667 = 0.23294$; $e^{0.23294} = 1.2623$.
**$p_2/p_1 = 1.262$**; $p_2 = (7.5)(1.2623) = \mathbf{9.47\ MPa}$.
MEOP is 11.0 MPa, so **yes, it survives**, with 1.53 MPa (16 %) of margin
remaining. Full marks require the explicit MEOP comparison, not just the number.
Common slip: using $n$ rather than $1/(1-n)$ as the exponent, which gives 1.055
and a wrong "comfortable margin" conclusion.

**Q4 (10).** $V = 0.080$ m³, $p = 3.40\times10^{7}$ Pa, $\gamma = 1.667$.
$pV = 2.72\times10^{6}$ J; $pV/(\gamma-1) = 4.078\times10^{6}$ J.
$(p_a/p)^{0.4} = (2.941\times10^{-3})^{0.4} = 0.0967$.
$E = 4.078\times10^{6}(1-0.0967) = \mathbf{3.68\ MJ}$.
TNT equivalent: $3.68/4.184 = \mathbf{0.88\ kg}$.
(The 95 K is a distractor: Eq. 5.2 depends on $p$, $V$ and $\gamma$ only.
Students who compute the mass first and then go looking for a specific internal
energy usually get there too, but slower; those who conclude that temperature
must matter and invent a correction lose 3 marks.)

**Q5 (10).** $\Omega = 36{,}000/60 = 600.0$ Hz.
$f_{\text{exc}} = (1.25-1)(600.0) = 150.0$ Hz.
$N = (150.0)(150) = \mathbf{2.25\times10^{4}\ cycles}$.
Full marks require the rotating-frame reasoning — the difference frequency, not
$1.25\Omega = 750$ Hz, and not $\Omega$ itself. A student who answers
$1.125\times10^{5}$ (using 750 Hz) has the arithmetic right and the physics wrong:
half marks.

**Q6 (8).** In descending order of authority:
1. **Recovered hardware with a diagnostic feature** — e.g. the LE-7 fuel
   turbopump inducer recovered from 3,000 m of Pacific, whose fatigue fracture
   surfaces closed the branch `[WP-LE7]`; or the recovered *Challenger* SRB
   joint hardware.
2. **Telemetry** — e.g. Vega-C VV22, where the chamber-pressure droop beginning at
   151 s was the primary evidence and no hardware was recovered `[ESA-VV22]`;
   or Vega VV15, which the Commission closed on telemetry to a *most likely*
   cause only `[ESA-VV15]`.
3. **Ground test reproduction** — e.g. CRS-7's destructive testing of the strut
   population, which showed a sub-specification strength distribution
   `[SpaceX-CRS7]`; or AMOS-6's demonstration of SOX ignition by fibre friction
   `[SpaceX-AMOS6]`; or LauncherOne's reproduction of the filter dislodging
   `[VO-2023]`.
4. **Analysis and simulation** — which can close a branch only when anchored to
   the first three.

2 marks per level, with the example. Accept any correct pairing.

**Q7 (10).** *Why AMOS-6 is materials compatibility, and what follows.*

**Why.** The initiating event was **ignition**, not overload. The COPV did not
fail because the applied stress exceeded its strength; it failed because a
chemical reaction between two materials that were never intended to be in contact
— condensed oxygen and carbon fibre — was initiated by a mechanical event (fibre
fracture or friction) that supplies an energy of order millijoules against a
release of order $10^{5}$ J `[SpaceX-AMOS6]`. The buckle that enabled it was
correctly assessed as structurally acceptable and *was* structurally acceptable.

**What follows from the materials classification that would not follow from a
structural one.** A structural classification generates: increase burst margin,
add plies, tighten proof-test criteria, improve fracture control. **None of these
addresses the mechanism** — a stronger vessel with the same buckle and the same
loading procedure has the identical fault. The materials-compatibility
classification generates instead:
1. **Eliminate the oxidiser at the interface** — change the helium loading
   temperature and rate so condensed and solid oxygen cannot form (the immediate
   fix);
2. **Eliminate the volume** — redesign the liner so it cannot buckle (the design
   fix);
3. **Apply oxygen-system rules** — assess every material inside the LOX tank for
   ignition sensitivity, promoted-combustion behaviour and mechanical impact
   sensitivity at service pressure, per `[G-095]`-type guidance, rather than
   treating the assembly purely as a pressure vessel per `[AIAA-S-081]`.

Full marks require the explicit statement that structural margin does not address
an ignition mechanism.

**Q8 (12).** *Anomaly on 7 of 22 flights, no loss, weak temperature correlation.*

A strong answer contains most of the following.

**Criteria for legitimate acceptance:**
1. **A physical mechanism**, written down, that explains why the anomaly occurs.
   Without it you have a statistic, not an engineering position.
2. **A defined failure threshold** — the value of the anomaly's severity metric at
   which loss occurs — derived from analysis or test, not from the flight record.
3. **A demonstrated margin** between the worst observed value and that threshold,
   with the *distribution* characterised, not just the maximum. Seven of 22 is a
   32 % incidence rate: you have enough samples for a distribution and should fit
   one.
4. **A stationary trend.** Severity versus flight number, and severity versus
   every environmental variable you have. A weak correlation with ambient
   temperature is not "no correlation" — it is an under-powered correlation, and
   the correct response is to get more power, not to dismiss it.
5. **Burden of proof on safety.** The question must be "show me it is safe," and
   the person answering must not be the person under schedule pressure.
6. **An envelope statement.** Acceptance is always conditional: acceptable
   *within* a stated range of the correlating variables. Outside it, you do not
   fly.

**Data to demand:**
- The severity metric for **all 22 flights**, including the 15 with no anomaly
  (treat them as censored observations at the detection limit — omitting them
  biases everything).
- The correlating environmental variables **as measured on the hardware**, not as
  ambient conditions. The Rogers Commission's temperature correlation is much
  stronger against *joint* temperature than against launch-site air temperature
  `[Rogers86 ch. IV]`.
- Ground-test data at the extremes of the correlating variable, deliberately
  provoking the anomaly (the F-1 bomb-test principle).
- The physical model's prediction of severity versus the correlating variable, so
  you can extrapolate rather than interpolate.

**The one-line test:** *can I state the failure threshold, the current margin and
the mechanism without appealing to "it has always been fine"?* If not, do not fly.

**Q9 (12).** *Supplier changes braze alloy to a "higher-melting-point equivalent."*

Order of actions, each justified:

1. **Stop.** Quarantine any hardware built with the new alloy and any hardware of
   unknown provenance; establish by lot traceability which articles are affected.
   *Justification:* the Voronezh solder case — a higher-melting-point substitute
   in an otherwise unchanged process left joints incompletely wetted, was
   invisible to the inspection in use, and required an engine recall `[SN-Solder]`.
   The failure signature of this exact substitution is known.
2. **Reject the equivalence claim as stated.** "Joint strength specification
   unchanged" is a claim about the *specified* property; the failure mode is
   about an *unspecified* one — wetting and capillary flow into the joint at the
   process temperature. A higher melting point means the alloy is above the
   furnace or torch profile's effective wetting window, so it does not flow.
   *Justification:* Vega-C VV22 — the acceptance criteria did not measure the
   property that governs the function `[ESA-VV22]`.
3. **Classify it as a design change and open a change request.** A consumable is
   not a part on the drawing and is exactly why substitutions escape.
   *Justification:* the general rule extracted in §3.25 lesson 7.
4. **Requalify the process, not the alloy.** Run the brazing schedule with the new
   alloy on representative joints; section and metallographically examine for
   fillet formation, void fraction, and diffusion zone; measure joint strength
   *and* leak-tightness at temperature and pressure; and thermally cycle.
   Re-derive the furnace profile if needed.
5. **Requalify the inspection.** Demonstrate that whatever NDE you use (dye
   penetrant, radiography, proof pressure) can detect the specific defect this
   substitution produces — an incompletely wetted but geometrically normal joint.
   If it cannot, the defence must be process control plus destructive lot
   sampling, and that must be written into the acceptance logic.
   *Justification:* Titan 34D-9 — an inspection that cannot see the defect is not
   a control `[UPI-Titan34D]`.
6. **Audit the supplier for other undeclared substitutions.** A supplier that
   made this change without a change notice has a configuration-control problem,
   not a braze problem. *Justification:* the Voronezh case was found by routine
   independent inspection of a mature process, which is the only defence against
   signature-free substitutions `[SN-Solder]`.

Marking: 2 marks per step with justification, capped at 12. An answer that
accepts the equivalence and merely asks for a strength coupon scores 3.

**Q10 (12).** *Three cases sharing a class; the principle; a case it would not
prevent.*

Model answer (others acceptable — the grading is on the reasoning).

**Class: PE — manufacturing / process escape.** Cases: **Titan 34D-9**
(insulation-to-case bond defect from improper fabrication), **Falcon 9 CRS-7**
(a strut that failed at one fifth of its certified load), **Proton / Voronezh
solder** (a substituted braze alloy that did not wet its joints).

**What they share at the level of mechanism, not narrative.** In all three, the
design was adequate, a specific article deviated from it, and **the deviation
produced no signature detectable by the acceptance method in use**. A bond that
is touching but unbonded passes a tap test; a strut with an internal material
defect passes a lot-sampled material certification; a joint filled with the wrong
alloy looks filled. In each case the *inspection* was the failure, not the
inspector: the method measured a proxy (contact, lot chemistry, visual fill)
rather than the function (bond strength, article strength, joint continuity).

**The single corrective-action principle that addresses all three:** *acceptance
must measure the property the function depends on, on the article that flies; if
that is impossible non-destructively, the defence is statistical process control
plus destructive lot testing, and that substitution must be stated explicitly in
the qualification logic rather than hidden inside an inspection step.* Applied:
proof-test every strut (CRS-7's actual fix); control and monitor the bond process
rather than inspect the bond (Titan); independently verify consumables and audit
the process (Voronezh).

**A case in a different class the same principle would not have prevented:**
**Ariane 5 ECA V157** (class **DM/UP**). The Vulcain 2 nozzle was built exactly as
designed; no article deviated from anything. The failure was a **load case and a
thermo-structural coupling absent from the design and qualification basis** — the
reversal of external pressure during ascent deforming the nozzle and thereby
altering the coolant flow `[ESA-V157]`. No amount of article-level proof testing
against the drawing detects a missing load case, because the drawing itself was
the error. Design-margin failures are prevented by *analysis and test coverage of
the environment*, process escapes by *control and verification of the article*.
These are different budgets, different organisations, and different skills, and
confusing them is why programmes buy the wrong protection.

Also acceptable as the contrasting case: Apollo 6's ASI bellows (**UP** — a
mechanism absent from any model), or STS-51F (**IR** — healthy hardware, faulty
decision rule).

---

## K3. Trade-study reference solution

### T1 — COPVs in a cryogenic oxidiser tank

**Recommended: Option 2** — retain the COPVs inside the LOX tank, implement the
loading-procedure change immediately, and pursue the liner redesign in parallel
for crew-rating. [J]

**The reasoning.**

**Step 1 — write down the mechanism as a conjunction.** The AMOS-6 mechanism
requires *all* of: (i) a gap between liner and overwrap (the buckle), (ii)
oxygen entering that gap, (iii) that oxygen being cold enough to condense or
freeze there, and (iv) an ignition event — fibre fracture or friction
`[SpaceX-AMOS6]`. Breaking any one link breaks the chain. This is the single most
important structural fact about the decision, and an answer that does not
identify the conjunction cannot reason properly about the options.

**Step 2 — score each option against the links.**

| option | link broken | eliminate or mitigate | mass | schedule |
|---|---|---|---|---|
| 1. Procedure only | (iii) | **mitigate** — depends on a procedure being executed correctly every flight | 0 kg | 6 weeks |
| 2. Procedure + liner redesign | (i) and (iii) | (i) **eliminated**, (iii) mitigated | ~0 kg | 6 weeks + 18 months |
| 3. Move outside the tank | (ii) — no LOX present | **eliminated** | −55 kg | 18 months+ (new structure, lines, thermal) |
| 4. Metallic vessel inside tank | (i) and the fuel: no carbon overwrap | **eliminated** | −120 kg | 18 months |

**Step 3 — apply the constraints.**

- **Mass.** 40 kg of margin. Option 3 (−55 kg) and Option 4 (−120 kg) both
  **exceed the budget**. They are not merely expensive; they are infeasible
  without a stage redesign, which is a much larger programme than 18 months.
  This eliminates 3 and 4 on the stated constraints. A student who recommends 4
  "because metal is safest" without checking the mass budget has failed the
  central discipline of the exercise.
- **Flight rate.** 20 flights a year means the exposure between now and any design
  fix is 30 flights over 18 months. That is a large exposure, and it argues
  strongly for doing *something* in 6 weeks — which only the procedure change can.
- **Crew-rating in 3 years.** A crew-rating authority will not accept a
  **procedural** control as the sole barrier against a catastrophic,
  non-detectable, single-fault-tolerant-zero mechanism. Option 1 alone therefore
  cannot meet the 3-year crew-rating requirement. This eliminates 1.

**Step 4 — the recommendation.** Option 2 is the only one that satisfies all four
constraints. Its structure is also the right *shape*: an immediate procedural
mitigation that reduces exposure now, and a design change that eliminates a link
permanently, on a schedule that fits inside the crew-rating window with margin.

**Step 5 — what I would tell a crew-rating authority.** Three things, in this
order: (i) the mechanism, stated as a conjunction, with the evidence from
reproduction testing that established it; (ii) which link the design change
eliminates and how that is verified — deliberate loading-condition variation
tests, including off-nominal helium temperature and fill rate, on production
vessels, plus a liner-buckling verification on every article; (iii) an honest
statement that the procedural control remains in place as a second barrier and
that its execution is verified by flight data every flight. What I would *not*
say is that the procedure change "fixed" anything.

**If the crew-rating requirement were removed.** [J] The answer changes to
**Option 1 plus a monitored decision point**: implement the procedure change,
instrument and trend the loading data, and defer the 18-month liner redesign
pending evidence that the procedural control is robust in practice. The
justification is that with the conjunction broken at link (iii) and no crewed
exposure, the marginal risk reduction from eliminating link (i) may not justify
18 months of qualification and the introduction of a new, less-flown vessel
design — new designs have their own infant mortality. **Note carefully what this
reveals:** the "right" technical answer is a function of the consequence class,
not of the physics. That observation is worth marks on its own.

### Rubric

| element | marks |
|---|---|
| Identifies the mechanism as a **conjunction** of independent conditions and reasons from it | 20 |
| Scores each option on *which link* it breaks, and distinguishes **eliminate** from **mitigate** | 20 |
| Checks options 3 and 4 against the 40 kg mass budget and rejects them on that basis | 15 |
| Uses the 6-week vs 18-month schedule split correctly: something now, the fix later | 10 |
| Recognises that a procedural control alone will not satisfy a crew-rating authority | 15 |
| States what would be told to the authority, including the honest limits | 10 |
| Answers the counterfactual (no crew-rating) and explains why the answer changes | 10 |
| **Total** | **100** |

**What loses marks.**
- Recommending Option 4 on "metal is safer" grounds without checking mass: −25.
  It is the emotionally satisfying answer and it violates a stated constraint.
- Treating the procedure change as a fix rather than a mitigation: −15.
- Failing to note that any option leaving the COPV in the LOX tank retains the
  *buoyancy* load case that broke the CRS-7 strut — a different mechanism in the
  same location that none of these options addresses: −10. A student who spots
  this unprompted earns a bonus 5.
- Not distinguishing "eliminates the link" from "reduces the probability": −10.
- Any answer that does not commit to a recommendation: −20. The exercise is a
  decision, not a survey.

---

## K4. Common wrong answers

**"The O-rings became brittle."** The single most common error, and it is
revealing: it substitutes a *material state* for a *rate process*. Students who
say this have not internalised that the seal's job is dynamic. The correction is
to ask them what the seal is doing during the 0.6 s pressure rise; most then get
there unaided.

**Using $n$ instead of $1/(1-n)$ as the pressure amplification exponent.**
Endemic in Q3 and P1. It gives a comfortingly small answer and a wrong
conclusion about survival. The diagnostic question: *does more burning area raise
or lower the pressure, and by more or less than proportionally?* Anyone who
answers "more than proportionally" cannot then use $n < 1$ as an exponent.

**Concluding that a falling chamber pressure means the propellant is running
out.** Reveals that the student has memorised the equilibrium-pressure relation
without understanding that it has *two* areas in it. The corrective is WE2's
discrimination table: pressure alone is one equation in two unknowns.

**Answering "the turbopump failed" for R3.** Not wrong, but not an answer. Every
propulsion mishap can be described at a level of generality where it is true and
useless. The examinable skill is to name the mechanism at the level at which a
corrective action attaches — "a displaced internal component restricting fuel
flow, causing an oxidiser-rich mixture-ratio excursion" is an answer; "the engine
failed" is not.

**Treating the AMOS-6 buckle as a structural defect.** Students want the buckle to
have been a strength problem because that is the category they have been trained
in. It was not, and the investigation said so explicitly. The error matters
because it generates the wrong corrective action — a stronger vessel — and
students who make it in an interview reveal that they cannot separate failure
*mode* from failure *category*.

**Assuming redundancy always helps.** In Q6/C4, students reflexively answer "add
more sensors." Common-cause failure is not intuitive and must be taught
explicitly. The tell is an answer that computes $p^3$ for three sensors without
asking whether the failures are independent.

**Picking a single root cause for Antares Orb-3.** The NASA IRT explicitly could
not, and identified three credible technical root causes `[Orb3-IRT]`; Orbital's
board and Aerojet Rocketdyne reached different conclusions `[SFN-Orb3]`.
A student who states one confidently has not read the sources, and — more
importantly — has not learned that "the evidence does not support a unique
conclusion" is itself a finding with consequences (here: replace the engine).

**Citing a company blog as an investigation report.** Especially on Starship and
the small launchers. The correction is the source hierarchy in §3.24: presidential
commissions and independent enquiry commissions publish *mechanisms*; regulatory
closures publish *categories and corrective actions*; company statements publish
what the company chooses. All are citable; only the first class supports "the
cause was" without a hedge.

**Confusing Ariane 501 (1996) with Ariane 517 / V157 (2002).** The first is the
famous inertial-reference software overflow and has no propulsion content
whatever; the second is the Vulcain 2 nozzle. Students who have read popular
accounts of software engineering frequently import the wrong one.

**Conflating Titan 34D-9 with Challenger.** Both 1986, both large segmented
solids, both a failure "at a joint." Different subsystem, different physics,
different fix. The error costs the most valuable single insight in §3.9: a
segmented motor joint carries **two** independent single-point failure
populations.

**Stopping at the proximate cause in any reasoning problem.** The most consistent
discriminator between a Level 2 and a Level 3 answer. The follow-up question that
exposes it is always the same: *and why was that condition present, and what
would have had to be true for it to be caught?*
