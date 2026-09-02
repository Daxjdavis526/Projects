# Module 27 — Modern Defense Propulsion Engineering
Part III · Prerequisites: modules 19–26 · Estimated time: 7 h

Everything up to here has been about making a motor work. This module is about
making a motor work *on demand, twenty years after somebody built it, at
−40 °C, after ten thousand kilometres in the back of a truck, having been
dropped once and never told about it*. That is a different engineering
problem, and it is the one that actually kills programmes. A motor that
delivers 3 % more impulse but cannot be surveilled, cannot be produced at
rate, or lights 40 ms late is not a better motor. I have watched a propellant
change that bought 4 s of Isp get thrown out because it moved the glass
transition temperature 12 K in the wrong direction and the cold-temperature
grain stress analysis stopped closing. Nobody outside the room ever heard
about the 4 s. This module is the vocabulary and the arithmetic for that
argument.

**Scope.** This is a requirements-and-engineering chapter written at the level
of the public engineering literature: what the requirement classes *are*, why
they conflict, and how you compute the consequences. It contains no
propellant formulations beyond family names that appear in NASA fact sheets,
no component dimensions, and nothing about employment. Every numerical example
uses generic parameters chosen to be representative and arithmetically clean,
not to describe any real article.

---

## 1. Learning objectives

After this module you should be able to:

- Classify a motor into one of seven public requirement classes (launch
  booster, large strategic-class stage, tactical, boost, sustain, dual-pulse,
  controllable/hybrid) from its mission statement, and name the two
  requirements that dominate each.
- Compute the equilibrium chamber pressure and thrust excursion of a solid
  motor across a stated temperature envelope from $\sigma_p$ and $n$, and
  convert that excursion into a maximum expected operating pressure (MEOP) and
  a burn-time change.
- Size a boost–sustain grain: given a required thrust ratio, a single throat
  and a pressure exponent, compute the required burning-area ratio, and show
  what changes when the sustain grain uses a slower propellant.
- Estimate a hybrid motor's regression rate, fuel flow and oxidiser-to-fuel
  ratio from a $\dot r = a G_{ox}^{\,n}$ law, and predict the direction and
  magnitude of the O/F shift over the burn.
- State what a demonstrated reliability number means statistically: what a
  zero-failure lot-acceptance record does and does not buy you, and how aging
  surveillance motors enter the estimate.
- Explain what the insensitive-munitions requirement class asks for, in terms
  of stimuli and permitted response levels, and trace at least three hardware
  consequences of it.
- Explain signature (primary and secondary smoke, plume radiance) as a
  requirement class, and state what meeting it costs in delivered performance.
- Explain the dual-pulse architecture: what the barrier between pulses must do,
  the three public barrier concepts, and the inert-mass and volumetric cost.
- State the research status of throttleable solids (pintle-throat and related
  concepts) and why the pressure exponent decides whether the concept is
  controllable at all.
- Fill in, from memory, a comparison table of the seven motor classes against
  the ten requirement dimensions of §3.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Burn rate | $r$ | m/s | linear regression speed of a burning propellant surface, normal to itself |
| Burn-rate coefficient | $a$ | m·s⁻¹·Pa⁻ⁿ | prefactor in $r = a\,p_c^{\,n}$; carries the units that make the law dimensional |
| Pressure exponent | $n$ | — | exponent in $r = a\,p_c^{\,n}$; sets ballistic stiffness and stability |
| Chamber pressure | $p_c$ | Pa | stagnation pressure in the combustion volume |
| Burning area | $A_b$ | m² | instantaneous area of burning propellant surface |
| Throat area | $A_t$ | m² | nozzle throat cross-section |
| Klemmung | $K_n$ | — | $A_b/A_t$; the single geometric number that sets $p_c$ |
| Characteristic velocity | $c^*$ | m/s | $p_c A_t/\dot m$; propellant energy content and combustion efficiency |
| Thrust coefficient | $C_F$ | — | $F/(p_c A_t)$; nozzle expansion effectiveness |
| Propellant density | $\rho_p$ | kg/m³ | cast, cured propellant density |
| Temperature sensitivity of burn rate | $\sigma_p$ | K⁻¹ | $(\partial \ln r/\partial T_i)_{p}$, at constant pressure |
| Temperature sensitivity of pressure | $\pi_K$ | K⁻¹ | $(\partial \ln p_c/\partial T_i)_{K_n} = \sigma_p/(1-n)$ |
| Initial (soak) temperature | $T_i$ | K or °C | bulk propellant temperature at ignition |
| Maximum expected operating pressure | MEOP | Pa | highest pressure the motor is credibly required to survive, including hot-day and dispersion allowances |
| Propellant mass fraction | $\zeta$ | — | propellant mass / loaded motor mass |
| Volumetric loading fraction | $\eta_V$ | — | propellant volume / available chamber volume |
| Web | $w$ | m | propellant thickness burned through during a phase |
| Action time | $t_a$ | s | time from 10 % of maximum pressure on the rise to 10 % on the tail |
| Ignition delay | $t_{ign}$ | s | time from fire signal to a stated pressure or thrust threshold |
| Total impulse | $I_t$ | N·s | $\int F\,dt$ |
| Oxidiser mass flux | $G_{ox}$ | kg·m⁻²·s⁻¹ | oxidiser mass flow per unit port cross-sectional area (hybrids) |
| Regression rate | $\dot r$ | m/s | hybrid fuel-surface regression speed |
| Oxidiser-to-fuel ratio | $O/F$ | — | $\dot m_{ox}/\dot m_f$ |
| Glass transition temperature | $T_g$ | K | temperature below which the binder behaves as a brittle glass |
| Fleet leader | — | — | the oldest, or most severely environmentally exposed, article of a population, tested to bound the rest |

---

## 3. Theory

### 3.1 Requirements, not physics, separate these motors

The internal ballistics of every solid motor in this module is the same
physics you had in modules 19–21: a pressure-dependent burn rate, a burning
area that evolves with the geometry, a choked throat, and the equilibrium
condition

$$p_c = \left( a\,\rho_p\, c^*\, K_n \right)^{\frac{1}{1-n}} , \qquad K_n = \frac{A_b}{A_t}$$

> **Eq. 3.1** — variables: $a$ [m·s⁻¹·Pa⁻ⁿ], $\rho_p$ [kg/m³], $c^*$ [m/s],
> $K_n$ [—], $n$ [—], $p_c$ [Pa]. Meaning: mass generated by the burning
> surface equals mass discharged through the choked throat. Assumes: quasi-
> steady operation (chamber filling time $\ll$ burn time), spatially uniform
> $p_c$, no erosive burning, $c^*$ independent of pressure, $n < 1$. Fails
> when: the motor is in the ignition transient or the tail-off, when the port
> Mach number is high enough to drive erosive burning, or when $n \to 1$, at
> which point the equilibrium becomes unstable and the motor either runs away
> or extinguishes. [F], from mass conservation; see [SP-8076 §2] and [SB §12.1].

Nothing in Eq. 3.1 knows whether the motor is a launch-vehicle booster or a
tactical motor. What separates the classes is the *requirement set* wrapped
around that equation: how long the motor must sit before it is used, how
quickly it must respond, over what temperature range, inside what volume,
against what statistical reliability claim, and under what constraints on
insensitivity, signature and production rate. Almost every visible design
choice in Part III — case material, binder family, nozzle concept, grain
geometry — is a consequence of that wrapper rather than of the ballistics.

The engineering reflex worth building is: **when you see an unusual design
choice, look for the requirement that forced it, not for the performance it
bought.** [J] A filament-wound composite case is not chosen because composites
are modern; it is chosen because the mass fraction requirement closed and the
storage and handling requirements permitted it. Trident's move from Kevlar to
graphite/epoxy is documented in open sources as having *two* reasons — inert
weight and eliminating an electrostatic potential difference between dissimilar
composites — and the second is exactly the kind of requirement that never
appears in a performance chart.

### 3.2 The seven classes

**(1) Launch-vehicle boosters.** Large, mass-fraction-driven, used within
months to a few years of casting, operated in a comparatively benign thermal
band because the vehicle is assembled and launched from a known site. Segmented
or monolithic; case mass and delivered vacuum impulse dominate. Examples in
this course's database: the Shuttle RSRM and its five-segment SLS descendant,
Ariane 5's EAP, the P120C, LVM3's S200 [P120C], [Hunley07].

**(2) Large strategic-class stages.** Comparable in size to a small launch
booster, but with a storage requirement measured in decades, a hard volumetric
envelope, and an insensitivity and surveillance regime that a launch booster
never sees. Public architecture-level facts — case family progression from
steel to glass-filament-wound to Kevlar/epoxy to graphite/epoxy, extendable
exit cones, single gimballed nozzles replacing four rotatable ones, liquid
injection TVC as an intermediate step — are recorded in the open literature and
in this course's verification file; formulations and dimensions are not, and
are not needed to understand the engineering.

**(3) Tactical motors.** Small, produced in quantity, stored in field
conditions across the widest temperature envelope of any class, required to
respond in milliseconds, and subject to the most severe insensitivity and
signature constraints. This is where the requirement conflicts are sharpest,
and it is the class most of this module is about.

**(4) Boost motors and (5) sustain motors.** Not motors of different physics
but of different duty: a boost phase delivers high thrust for a short time to
accelerate a vehicle to operating speed; a sustain phase delivers low thrust
for a long time to hold speed against drag. They may be separate motors in
separate cases, or two grains in one case sharing a throat (a "dual-thrust" or
"boost–sustain" motor), which is the case §3.12 and Worked Example 2 analyse.

**(6) Dual-pulse motors.** One case, two independently ignitable propellant
charges separated by a barrier, with a coast of arbitrary length in between.
The architecture buys energy management at the cost of inert mass and volume.

**(7) Controllable motors.** Anything that modulates thrust after ignition:
throttleable solids with a variable throat, gas generators feeding a controlled
valve, and hybrids. All are either research, niche, or (for hybrids) flying in
small numbers.

### 3.3 Storage life and aging surveillance

A launch booster is cast, stacked and flown. A stored motor is cast and then
asked to remain a *predictable* article for twenty to thirty years. Those are
different requirements, and the second one is a materials-science problem, not
a ballistics problem.

**What actually ages.** Three mechanisms dominate in the open literature
[SP-8064 §3], [Davenas ch. 5], [Kubota]:

1. **Continued cure and oxidative crosslinking of the binder.** Polymer network
   density keeps rising after the motor leaves the cure oven. The propellant
   gets stiffer, its modulus rises and its strain capability falls. This is the
   mechanism that eventually decides service life for most composite grains.
2. **Plasticiser and stabiliser migration.** Small molecules move down
   concentration gradients — out of the propellant and into the liner, the
   insulation or the inhibitor. The propellant near the bond line changes
   properties; the liner swells or softens. Nitrate-ester-plasticised systems
   also consume a chemical stabiliser over time, and stabiliser depletion is
   itself a surveillance metric.
3. **Bond-line degradation.** The propellant–liner–insulation–case bond is a
   chain of adhesive interfaces that must survive thermal cycling for decades.
   Unbonds are the single most consequential aging defect, because a debond at
   the grain's outer surface exposes a burning area that no ballistic
   prediction accounts for.

**Why this is a stress problem and not a chemistry problem.** The grain is a
nearly incompressible viscoelastic solid bonded to a much stiffer case. Every
temperature excursion loads it, because the propellant's coefficient of
thermal expansion is roughly an order of magnitude larger than steel's and
several times a composite's. For a case-bonded cylindrical grain the classic
first-order estimate of bore hoop strain from a temperature change is

$$\varepsilon_{\theta,\text{bore}} \;\approx\; (\alpha_p - \alpha_c)\,\Delta T \cdot f\!\left(\frac{b}{a}, \nu_p\right)$$

> **Eq. 3.2** — variables: $\alpha_p, \alpha_c$ [K⁻¹] propellant and case
> coefficients of thermal expansion; $\Delta T$ [K] the excursion from the
> stress-free (cure) temperature; $b/a$ outer/inner radius ratio; $\nu_p$
> propellant Poisson ratio (≈ 0.4995, i.e. nearly incompressible); $f$ is a
> geometry factor of order 1–3 that grows as the web thickens and the bore
> shrinks. Meaning: cooling a case-bonded grain puts the bore in tension
> because the propellant wants to shrink and the case will not let it.
> Assumes: linear elasticity, plane strain, perfect bond, no stress
> relaxation. Fails when: viscoelastic relaxation is significant (i.e. always,
> for slow cooldowns), near $T_g$ where the modulus changes by orders of
> magnitude, and at any geometric discontinuity — slots, fins, star points —
> where the real answer needs finite elements. Use it for scaling arguments
> only. [A], after [SP-8073 §2–3].

Two consequences follow immediately and both are requirement-driven:

- **Cold is the structural design case.** As $T$ falls the strain demand rises
  *and* the propellant's strain capability falls, and at $T_g$ the propellant
  stops being rubbery altogether. Bore cracks at cold soak are the classic
  failure, and they matter because a crack is new burning area — see §7.
- **Aging moves the allowable, not the load.** Twenty years of crosslinking
  raises modulus and cuts strain-to-failure. The cold-day analysis that closed
  with margin at delivery may not close at end of life. This is why the
  service-life argument is a *cumulative damage* argument, not a single
  calculation.

**Accelerated aging and its honest limits.** Storage at elevated temperature is
used to accelerate the chemistry, and the shift factor is usually assumed
Arrhenius:

$$t_{\text{field}} = t_{\text{oven}}\,\exp\!\left[\frac{E_a}{R_u}\left(\frac{1}{T_{\text{field}}}-\frac{1}{T_{\text{oven}}}\right)\right]$$

> **Eq. 3.3** — variables: $t$ [s], $E_a$ [J/kmol] apparent activation energy of
> the property change being tracked, $R_u = 8314.46$ J/(kmol·K), $T$ [K].
> Meaning: one dominant thermally activated process controls the property, so
> time and temperature trade logarithmically. Assumes: a single mechanism with
> a temperature-independent $E_a$, no change of mechanism over the interval, no
> diffusion limitation. Fails when: the oven temperature crosses a phase or
> glass transition, when migration (a diffusion process with a different
> temperature dependence) rather than crosslinking controls, or when the
> acceleration factor is large enough that a slow mechanism in the field never
> gets to express itself in the oven. [E]/[A]. Treat a large extrapolation
> factor as a hypothesis to be checked against real-time data, never as a
> substitute for it. [J]

**Surveillance is the requirement, not the analysis.** Because the
extrapolation is untrustworthy at the ten-fold level, stored-motor programmes
buy real-time data instead: a population of articles is set aside at
manufacture, and members are withdrawn on a schedule and destructively
evaluated — mechanical property specimens cut from the grain, bond-line peel
tests, chemical assays, non-destructive inspection for unbonds and cracks, and
static firing of a sample. The oldest and most severely exposed article is the
**fleet leader**, and the argument that the fleet is sound is an argument that
the fleet leader is sound and that the fleet's exposure is bounded by the
leader's. This is the same logic as a proof test, moved from a single article
to a population. The statistical side of it is §3.7.

### 3.4 Response time

For a launch booster, "response time" means the ignition transient must be
repeatable enough not to upset the vehicle's structural loads and hold-down
release logic — tens to a couple of hundred milliseconds is fine. For a
tactical motor it is a top-level requirement in its own right, and the numbers
are in the single-digit-to-tens of milliseconds.

The chain is: fire signal → safe-and-arm device out-of-line-to-in-line (if it
is not already armed) → initiator all-fire → igniter charge output → grain
surface ignition → chamber fill → thrust. The last two are the physics; the
rest is device design. The chamber fill time scales as

$$t_{\text{fill}} \;\sim\; \frac{V_c}{ c^*\!A_t } \ln\!\frac{p_{c}}{p_{0}}$$

> **Eq. 3.4** — variables: $V_c$ [m³] free chamber volume at ignition, $A_t$
> [m²], $c^*$ [m/s], $p_0$ ambient, $p_c$ target. Meaning: the chamber is a
> plenum being filled by the burning surface and drained by a choked throat;
> the time constant is the ratio of the volume to the throat's volumetric
> discharge capability. Assumes: the whole grain surface ignites promptly,
> constant $c^*$, no heat loss, ideal gas. Fails when: flame spreading over the
> grain is slow compared with filling (long, thin ports; low-flux igniters;
> cold grain), which is precisely the tactical cold-start case. [A], after
> [SP-8051 §2].

Three requirement consequences:

- **Low free volume helps.** High volumetric loading shortens fill time as
  well as improving mass fraction; two requirements pointing the same way, for
  once.
- **Cold soak is the sizing case.** Igniter output must be sized so the grain
  ignites at the cold limit, where surface heating to ignition takes longer and
  the propellant's ignition temperature is further away. Sizing the igniter for
  the cold case then produces an *overpressure* risk at the hot limit — the
  igniter is still delivering mass into a chamber whose grain lights faster and
  whose equilibrium pressure is already elevated by $\pi_K$. The ignition
  overpressure spike at hot, not the cold hangfire, is often the case that sets
  the case proof pressure. [J]
- **Repeatability, not speed, is usually the hard part.** A 20 ms mean with a
  ±15 ms spread is worse for a guidance loop than a 40 ms mean with ±3 ms.
  Requirements are written on the dispersion.

### 3.5 The temperature envelope and what $\sigma_p$ does to it

The operating envelope commonly cited in public standards work for field
munitions is **−54 °C to +71 °C (−65 °F to +160 °F)** as the operating
extremes, with storage and transportation cases sometimes written wider.
Launch vehicles, by contrast, are conditioned: the RSRM's propellant mean bulk
temperature was managed within a narrow band before launch, and that
conditioning is itself a launch commit criterion. The difference between a
±10 K and a 125 K envelope propagates into every other requirement.

The burn-rate coefficient is temperature sensitive:

$$r(T_i,p_c) = a_0\,e^{\sigma_p (T_i-T_{\text{ref}})}\;p_c^{\,n}$$

> **Eq. 3.5** — variables: $\sigma_p$ [K⁻¹], $T_i$ [K] bulk propellant soak
> temperature, $T_\text{ref}$ the reference temperature at which $a_0$ was
> measured. Meaning: a hotter grain starts closer to its surface reaction
> temperature, so less of the flame's heat feedback is spent warming the solid
> and the surface regresses faster. Assumes: $\sigma_p$ constant over the
> range (it is not, exactly — it usually grows slightly at cold), uniform bulk
> temperature, no change of combustion mechanism. Fails when: the grain is not
> thermally soaked (a large motor takes days to equilibrate; a partial soak
> gives a *radially varying* burn rate), or below $T_g$ where the propellant's
> physical state has changed. [E], [SB §12.2], [SP-8064 §4].

At **fixed geometry**, $K_n$ is set by the grain, so Eq. 3.1 gives the
pressure sensitivity directly:

$$\pi_K \equiv \left(\frac{\partial \ln p_c}{\partial T_i}\right)_{K_n} = \frac{\sigma_p}{1-n}, \qquad \frac{p_{c,2}}{p_{c,1}} = \exp\!\left[\frac{\sigma_p\,\Delta T}{1-n}\right]$$

> **Eq. 3.6** — variables as above. Meaning: the burn-rate shift feeds back
> through the pressure–burn-rate coupling and is *amplified* by $1/(1-n)$.
> Assumes: Eq. 3.1's assumptions plus constant $A_t$ (no significant throat
> erosion) and constant $c^*$. Fails when: $n$ is large (the amplification
> becomes violent) or the nozzle erodes appreciably during the burn, which
> lowers the effective $K_n$ and partially offsets the hot-day rise. [F] given
> [E] inputs.

Three consequences that a requirements engineer cares about more than the
equation:

1. **MEOP is a hot-day number.** The case, the joints, the nozzle attachment
   and the igniter closure are all designed to a pressure that includes the
   hot-limit excursion *plus* the manufacturing dispersion of $a$, $A_t$ and
   $A_b$, plus the ignition spike. Mass fraction is spent on temperature
   envelope, which is why a launch booster with a conditioned propellant can
   afford a thinner case than a field motor of the same performance. [J]
2. **Burn time moves the other way.** At constant $K_n$ mass conservation
   forces $r \propto p_c$ (because $\rho_p A_b r = p_c A_t/c^*$), so the burn
   time varies inversely with the pressure ratio while total impulse stays
   nearly constant — the same propellant mass is expelled, just faster or
   slower, with only a second-order Isp change through $C_F$ and $c^*$. That
   inverse relationship is the reason temperature is a first-order term in any
   trajectory or fire-control dispersion budget.
3. **A low $n$ is worth paying for.** Everything in this section improves with
   $n$ small: smaller $\pi_K$, smaller pressure excursion from $A_t$ erosion
   and from $A_b$ manufacturing tolerance, more stable equilibrium. Propellants
   in the $n \approx 0.2$–$0.4$ band are chosen for that reason as much as for
   their energy. Above $n \approx 0.8$ the equilibrium of Eq. 3.1 becomes
   fragile, and at $n \ge 1$ it does not exist as a stable point at all.

### 3.6 Mass fraction and volume

Two different constraints get confused constantly.

**Mass fraction** $\zeta = m_p/m_0$ is what the rocket equation cares about.
Large, well-designed motors reach $\zeta = 0.90$–$0.94$; the Star 48B sits at
roughly 0.94 by the reconciled mass figures in this course's database (its
published inert mass is genuinely contested — 28 kg versus 126 kg in two
secondary sources — and the mass balance supports the larger figure). Small
tactical motors are much worse, $\zeta \approx 0.6$–$0.8$, for reasons that are
pure scaling: case wall thickness has a minimum set by handling and
manufacturing, not by pressure; insulation has a minimum practical thickness;
the nozzle, igniter, S&A device and closures are nearly fixed masses. Inert
mass scales closer to area than to volume, so $\zeta$ falls as the motor
shrinks.

**Volumetric loading** $\eta_V = V_p/V_c$ is what the *envelope* cares about,
and for stored and tube-launched motors the envelope is frequently a harder
constraint than the mass. A grain geometry that gives a beautiful neutral trace
at $\eta_V = 0.75$ loses to an uglier one at $\eta_V = 0.90$ when the diameter
is fixed by something outside the propulsion engineer's control. This is the
main reason end-burning and high-loading geometries (radial-slot, finocyl with
a short fin length) keep reappearing in volume-limited applications despite
their trace shape, and it is why grain design in this class is usually a
constrained optimisation with volume as the constraint and trace shape as the
objective — the opposite of the launch-booster problem [SP-8076 §3], [SP-8075].

A useful scaling for arguing about small motors [A]:

$$\zeta \approx \frac{1}{1 + \dfrac{C_1}{D} + C_2}$$

where $C_1/D$ collects everything whose mass scales with surface area over
volume (case wall at fixed thickness, insulation, liner) and $C_2$ collects
the fixed fittings. It is not a design equation; it is a way of showing a
programme manager why the 0.94 from the big motor is not available at
one-tenth the diameter. [J]

### 3.7 Reliability targets and how they are actually demonstrated

Programmes state reliability as a number with a confidence: "0.98 at 90 %
confidence", say. Both halves matter and students routinely quote the first
without the second.

**Attribute (pass/fail) demonstration.** If $N$ motors are fired with zero
failures, the classical one-sided lower confidence bound on reliability $R$ at
confidence $C$ is

$$R_{\text{LB}} = (1-C)^{1/N}, \qquad\text{equivalently}\qquad N = \frac{\ln(1-C)}{\ln R_{\text{LB}}}$$

> **Eq. 3.7** — variables: $N$ [—] number of independent successful trials, $C$
> [—] confidence level, $R_\text{LB}$ [—] demonstrated lower bound. Meaning:
> with zero failures the binomial likelihood is $R^N$, and the $C$-level bound
> is the $R$ that would have produced this run with probability $1-C$. Assumes:
> independent, identically distributed trials from the population you are
> making claims about; no failures at all; the tested article is
> representative of the fielded one. Fails when: motors are *not* iid — the
> usual reality, because a lot shares a propellant mix, a liner batch and an
> operator. A correlated failure mechanism inside one lot makes $N$ an
> overstatement of the true information content. [F] statistics, [J] on the
> independence caveat.

Run the numbers once and the industrial consequence is obvious: 90 %
confidence in $R = 0.99$ needs $N = 229$ zero-failure firings; $R = 0.999$
needs 2302. **You cannot buy a high-reliability claim by static firing alone**
for anything expensive. Every real programme therefore builds the claim from
four sources, of which firing is only one:

1. **Lot acceptance testing.** Each production lot is sampled: propellant
   specimens from the mix (burn-rate strands, mechanical properties, density),
   plus a small number of motors from the lot fired to verify ballistics
   against the specification band. This is a *process control* argument. What
   it demonstrates is that this lot resembles the qualified population.
2. **Variables data instead of attributes.** Rather than pass/fail, measure a
   continuous margin — burst pressure minus MEOP, strain capability minus
   predicted strain, ignition delay against the requirement — and compute the
   probability that the distribution's tail crosses the limit. A modest sample
   of a measured margin is worth an enormous number of pass/fail trials,
   because it uses the distance to failure rather than just its sign. This is
   the single most useful statistical idea in the field. [J]
3. **Aging surveillance firings.** Motors withdrawn from storage and fired at
   age. These are the only data that address the failure modes that need time
   to develop, and they arrive at a rate of a handful per year. Their value is
   in the *trend* — how the measured margins move with age — not in the
   pass/fail outcome of any one of them.
4. **Physics-of-failure analysis.** Grain structural analysis, fracture
   control on the case, thermal analysis of the insulation, each with its own
   margins and factors of safety, so that the demonstrated reliability is a
   claim about analysed and bounded mechanisms rather than a black-box
   frequency.

**The uncomfortable truth.** A demonstrated reliability figure is a statement
about a *model* plus a *sample*, and the model does most of the work. When you
read "demonstrated 0.995", the right question is not "how many did you fire?"
but "which failure modes are in the model, and what is the evidence for the
tail of each?" [J]

### 3.8 Insensitive munitions: what the requirement is

The insensitive-munitions (IM) requirement class asks a specific question:
when a stored motor is subjected to a credible accident or hostile stimulus,
what is the *worst reaction it produces*? The requirement is not "do not
react" — a propellant grain contains its own oxidiser and will react. The
requirement is that the reaction be no more violent than a stated level.

Two documents define the vocabulary and the tests, and both are cited here by
name only, for what they require:

- **MIL-STD-2105** (US DoD, *Hazard Assessment Tests for Non-Nuclear
  Munitions*) specifies the stimulus tests a munition must be subjected to and
  the response levels that constitute passing.
- **STANAG 4439** (NATO, *Policy for Introduction and Assessment of
  Insensitive Munitions*) states the NATO policy: which stimuli must be
  assessed and what maximum response is acceptable for each, with the detailed
  test methods delegated to the associated Allied Ordnance Publications.

The stimuli they cover are, in the standard groupings: **fast cook-off**
(engulfing fire), **slow cook-off** (slow heating of the whole article),
**bullet impact**, **fragment impact**, **sympathetic reaction** (detonation of
an adjacent article), and **shaped-charge jet impact**. The response levels
run, from most to least benign: **burning (Type V)**, **deflagration (IV)**,
**explosion (III)**, **partial detonation (II)**, **detonation (I)**.
A "passing" response is generally burning or deflagration depending on the
stimulus, with detonation and explosion unacceptable everywhere.

**What the requirement drives in hardware.** This is the part worth
internalising, because it explains design choices that otherwise look like
performance sacrifices [Davenas ch. 3, ch. 11], [Kubota]:

- **Binder and propellant class selection.** Propellant families differ
  enormously in their response to shock and to slow heating. Systems whose
  energy comes from nitramine or nitrate-ester chemistry deliver higher Isp
  and higher density impulse, and are correspondingly harder to make
  IM-compliant; AP/HTPB composite systems are less energetic and much better
  behaved. The binder's role is not only mechanical: a rubbery,
  high-strain-capability binder that keeps the oxidiser particles bonded and
  the grain free of voids raises the shock threshold, and a binder that chars
  rather than melting changes the cook-off behaviour. A very large fraction of
  the "why not use the more energetic propellant?" conversations in this field
  end here, not in cost.
- **Case design and venting.** Slow cook-off severity depends on whether the
  case can relieve pressure before the propellant reaches a violent reaction.
  Deliberate pressure-relief features — thermally activated vents, melting
  plugs, stress-raiser lines, joints designed to open — convert a potential
  explosion into a burn. Composite cases behave very differently from steel
  ones here: a filament-wound case with a polymer matrix loses strength
  progressively in a fire and tends to vent, whereas a high-strength steel case
  holds pressure until it fails suddenly. That is an IM argument *for*
  composites that has nothing to do with mass.
- **Insulation, liner and barrier materials.** These control heat ingress in
  cook-off, and they are also what a bullet or fragment passes through on the
  way in.
- **Packaging and stacking.** Sympathetic reaction is a system-level test, so
  the container is part of the design.

The trade is explicit and it is the central tension of modern tactical
propulsion: **IM compliance and delivered performance pull in opposite
directions**, and the resolution is a system-level argument about how much
range or velocity a given insensitivity level is worth. [J]

### 3.9 Signature as a requirement class

Signature means everything an observer can detect about the motor: the visible
and infrared plume, the smoke trail, and the radar behaviour of the exhaust.
The public engineering vocabulary divides smoke into two mechanisms:

- **Primary smoke** — condensed-phase products in the exhaust itself. The
  dominant contributor is aluminium oxide from metallised propellant; also
  metal-containing burn-rate modifiers and some stabiliser residues. Primary
  smoke is unavoidable if the propellant is metallised, and metallising is
  what buys the specific impulse and the combustion stability.
- **Secondary smoke** — condensation of exhaust species in the atmosphere
  after they leave the nozzle, principally water condensing on hygroscopic
  nuclei. Hydrogen chloride from ammonium perchlorate combustion is the classic
  nucleus. Secondary smoke is therefore *weather dependent*: the same motor
  smokes heavily on a cold humid day and hardly at all on a hot dry one, which
  makes the requirement statistical rather than deterministic.

The public classification that follows is:

| class | contains | means |
|---|---|---|
| Smoky | metal fuel + AP | maximum performance, maximum signature |
| Reduced smoke | no metal fuel, AP retained | no primary smoke; secondary smoke still possible from HCl |
| Minimum smoke | neither metal fuel nor chloride-producing oxidiser | very low signature both mechanisms |

Every step down that table costs delivered performance, costs combustion
stability margin (the aluminium that makes primary smoke also damps
oscillations — see module 20), and usually costs money, because minimum-smoke
formulations lean on more expensive and more hazardous energetic ingredients
and therefore collide with §3.8. **Signature, IM and performance form a
three-cornered trade that no propellant family wins outright.** [J]

Plume *radiance* is a separate requirement from smoke: the infrared and
ultraviolet emission of the exhaust, which depends on combustion products,
afterburning of fuel-rich exhaust with atmospheric oxygen, and the presence of
condensed particles. Reducing it can drive the propellant to a lower flame
temperature or a less fuel-rich mixture — again, at the cost of Isp.

### 3.10 Environmental survivability

The environments a stored motor must survive are specified as test levels, and
the propulsion consequences are concrete:

| environment | what it does to a motor | design consequence |
|---|---|---|
| Random vibration and acoustics (transport, carriage, launch) | fatigue at bond lines and geometric discontinuities; fretting at joints; fastener loosening | grain stress analysis under vibratory load; bond-line qualification; damping of the loaded case |
| Mechanical shock (handling drop, rail impact, separation ordnance) | grain cracking, liner debond, igniter and S&A damage | drop-test qualification; NDE after handling; features that arrest crack growth |
| Thermal cycling (diurnal, seasonal, transport) | cumulative viscoelastic damage; ratcheting at bond lines | cumulative-damage service-life model; §3.3 |
| Humidity | hygroscopic ingredient absorption; moisture at bonded interfaces; corrosion under insulation | hermetic sealing; desiccation; sealed containers |
| Salt fog | corrosion of metal cases, closures, threads, and igniter housings | material and coating selection; sealing; the standard argument for keeping motors in sealed containers |
| Altitude / rapid decompression (air carriage) | trapped-gas expansion at voids and unbonds | void and unbond limits set by NDE acceptance criteria |
| Electromagnetic environment | inadvertent initiator actuation | shielded, filtered initiator circuits; out-of-line S&A |
| Solar/thermal soak | non-uniform bulk temperature; asymmetric burn rate | thermal soak analysis, not just a single $T_i$ |

For launch vehicles the equivalent qualification framework is the
launch-vehicle test standard ([SMC-S-016], with the payload vibroacoustic
criteria in [STD-7001]); the mechanics are similar but the exposure duration
is months rather than decades, and there is no salt-fog-for-twenty-years case.

### 3.11 Production scalability, surge, and cost drivers

Solid propulsion is one of the few propulsion technologies where *production
rate* is a design requirement rather than a manufacturing detail, because the
articles are consumed. The engineering consequences [SP-8075], [Davenas ch. 8]:

- **The mixer is the factory.** Batch size sets lot size, lot size sets the
  statistics of §3.7, and mixer availability sets rate. A grain that requires a
  larger single mix than the plant's largest bowl either forces multiple mixes
  into one casting (with the batch-to-batch variation that implies, and a
  ballistic dispersion penalty), or forces a plant investment.
- **Cure time is calendar time.** A multi-day cure at temperature is a
  work-in-process inventory and a tooling constraint: the mandrels, casting
  pits and ovens are occupied. Surge capacity is mostly cure and casting
  capacity, not mixing capacity.
- **Raw-material supply chains are narrow.** Oxidiser production, specific
  binder prepolymers, curatives and high-performance fibres often have one or
  two qualified suppliers worldwide. Qualifying a second source is a multi-year
  requalification because the propellant's ballistic and mechanical properties
  are sensitive to ingredient provenance — particle size distribution of the
  oxidiser being the classic example.
- **Nozzle materials are the other bottleneck.** Carbon-phenolic and the rayon
  or PAN precursor fibres behind it have their own narrow supply base, and
  requalifying an ablative is expensive because the qualification is a firing
  programme.
- **Cost drivers**, in the order they usually appear: qualification and
  requalification of any change; nozzle ablatives and the case; propellant
  ingredients (dominated by the energetic ingredients if the formulation is
  minimum-smoke or nitramine-based); NDE and acceptance testing; the S&A and
  electronics; and the facility overhead of an energetic-materials plant, which
  is largely independent of rate and therefore punishes low-rate production
  brutally.

The design-for-production reflex: **anything that changes the propellant
changes the qualification, and qualification is measured in years and
firings.** That is why fielded motors have such long formulation lifetimes and
why improvements arrive as new motors rather than as changes to old ones. [M]

### 3.12 Architectures that buy thrust-time control

A solid motor's thrust programme is baked into the grain at casting. Four
public architectures exist to get some of it back, in increasing order of cost.

#### 3.12.1 Boost–sustain (dual-thrust) grains

One case, one throat, two burning phases: a high-$K_n$ boost phase followed by
a low-$K_n$ sustain phase. Implemented either as two co-cured propellants with
different burn rates, or as a single propellant with a grain geometry whose
burning area collapses after the boost web is consumed (a slotted or finocyl
forward section burning out into a plain cylindrical or end-burning sustain
section), or both.

From Eq. 3.1, at a **fixed throat**, the thrust ratio between phases is

$$\frac{F_{b}}{F_{s}} \;=\; \frac{p_{c,b}}{p_{c,s}} \;=\; \left[\frac{a_b A_{b,b}}{a_s A_{b,s}}\right]^{\frac{1}{1-n}}$$

> **Eq. 3.8** — variables: subscripts $b$ = boost, $s$ = sustain; $a$ the
> burn-rate coefficients of the two propellants (equal if one propellant is
> used), $A_b$ the burning areas. Meaning: with a shared choked throat, thrust
> ratio is pressure ratio, and pressure ratio is the (area × rate) ratio raised
> to $1/(1-n)$. Assumes: same $c^*$, $\rho_p$ and $C_F$ for both phases,
> negligible throat erosion between phases, quasi-steady operation in each
> phase. Fails when: the two propellants have materially different $c^*$ (then
> carry it explicitly), or when the sustain pressure falls below the
> propellant's stable-combustion limit, at which point Eq. 3.1 stops describing
> anything real. [F] given [E] inputs.

The exponent $1/(1-n)$ is the whole story: with $n = 0.35$, a burning-area
ratio of only 2.7 gives a thrust ratio of 4.6 (Worked Example 2). Small
geometric changes give large thrust changes, which is convenient for design and
inconvenient for tolerancing — the same amplification applies to manufacturing
variation in $A_b$.

**The binding constraint is the low-pressure limit.** Every propellant has a
pressure below which combustion becomes unstable (chuffing) and then
extinguishes, typically in the region of 1–3 MPa for conventional composites,
higher for some minimum-smoke systems. Sustain pressure must stay above it with
margin at the *cold* limit, where $\pi_K$ has already pushed the pressure down.
That single requirement, not the arithmetic of Eq. 3.8, is what caps the
achievable boost-to-sustain thrust ratio in a fixed-throat motor. [J]

#### 3.12.2 Dual-pulse motors

A dual-pulse motor puts two propellant charges in one case, separated by a
barrier, each with its own igniter. Pulse 1 burns, the motor coasts for an
arbitrary time under external control, then pulse 2 is ignited. Compared with
two separate motors it saves one case, one nozzle and one set of closures; the
public literature on the architecture (AIAA Joint Propulsion Conference papers
on pulse motors and on gas-generator-fed systems, and [Davenas ch. 10] for the
European hardware background) treats it as an energy-management device — it lets
the vehicle decide *when* to spend the second charge rather than committing at
design time.

**What the barrier must do**, and why it is hard:

1. **Survive pulse 1.** It sees the full pulse-1 chamber pressure from one
   side, the full flame temperature, and particle-laden flow if the propellant
   is metallised. It must not deflect enough to damage the pulse-2 grain.
2. **Insulate pulse 2 from pulse-1 heat soak.** The pulse-2 grain sits behind
   the barrier for the whole of pulse 1 and for the coast. Conducted heat
   raises its bulk temperature — which, by §3.5, changes its ballistics — and
   in the limit can cook it off. The barrier is therefore a thermal-protection
   problem as much as a structural one.
3. **Get out of the way on command.** Pulse 2's gas must reach the nozzle
   through, or past, the barrier, promptly and repeatably.

Three barrier concepts appear in the open literature:

- **Hard bulkhead with a burst/relief device.** A structural bulkhead
  carrying pulse-1 pressure, opened for pulse 2 by rupture discs or
  pyrotechnically actuated ports. Most predictable, heaviest, and it leaves
  bulkhead structure in the motor for the whole of pulse 2.
- **Frangible (consumable-on-command) bulkhead.** A structure designed to
  fracture into fragments under pulse-2 ignition pressure. Lighter, but now the
  nozzle must tolerate the fragments, and the fracture must be repeatable at
  both temperature limits and after decades of storage — the hardest
  requirement in the concept. [J]
- **Soft / consumable membrane with a separate pulse-1 nozzle path.** A thin
  membrane or an elastomeric diaphragm that is destroyed by pulse-2 ignition,
  sometimes combined with a pulse-1 charge that vents through its own passage.
  Lightest, most sensitive to aging of the membrane material.

**What it costs.** Inert mass for the barrier and the second igniter; volume,
because the barrier and its attachment occupy chamber length that would
otherwise be propellant; volumetric loading, because each charge needs its own
free volume for ignition; a second ignition system with its own reliability
term (the system reliability is now a product, not a single motor's); and an
insulation penalty, since the case aft of the barrier is exposed to hot gas for
the duration of both pulses, and the case forward of it is exposed during pulse
2 only after being heat-soaked during pulse 1. A defensible planning number for
teaching purposes is that the dual-pulse architecture costs several percent of
propellant mass fraction relative to a single-pulse motor of the same envelope;
the exact number is design-specific and the public literature does not support
a single figure. [J]

#### 3.12.3 Throttleable and controllable solids

To modulate the thrust of a burning solid you can change $A_t$, or you can
change the propellant's burn rate directly. Only the first is close to
practical.

From Eq. 3.1, with $A_b$ fixed by the grain and the throat varied,

$$p_c \propto A_t^{-\frac{1}{1-n}}, \qquad F = C_F\,p_c\,A_t \;\propto\; A_t^{\,1-\frac{1}{1-n}} = A_t^{-\frac{n}{1-n}}$$

> **Eq. 3.9** — variables: $A_t$ [m²] instantaneous throat area, $n$ [—].
> Meaning: closing the throat raises chamber pressure and, provided $n > 0$,
> raises thrust — but the thrust sensitivity is governed by $n/(1-n)$, which is
> *small* for the low-exponent propellants everybody uses for stability. With
> $n = 0.35$ a two-to-one throat closure changes thrust by a factor
> $2^{0.538} = 1.45$ only, while chamber pressure changes by
> $2^{1.538} = 2.9$. Assumes: quasi-steady operation (the throat moves slowly
> compared with the chamber fill time), no change in $c^*$ or $C_F$ with
> pressure, no erosive burning. Fails when: the actuation is fast enough to
> excite the chamber's L\* dynamics, or when the pressure excursion takes the
> motor outside its stable combustion band. [F] given [E] inputs.

That equation is the entire problem of the throttleable solid, and it contains
a genuine dilemma: **the low pressure exponent that makes a motor ballistically
well-behaved is exactly what makes it hard to throttle.** A high-$n$ propellant
throttles beautifully and is unstable; a low-$n$ propellant is stable and needs
an enormous throat travel for a modest thrust range, while paying for it with a
huge pressure swing that the case must be designed for at the top and the
combustion stability at the bottom.

The **pintle-throat** concept — a movable pintle or plug translated axially
into a conical throat, varying the annular flow area — is the most-studied
mechanism, and it is the direct conceptual relative of the pintle *injector*
of liquid engines, where a single centrally translating element likewise sets
the flow area ([Dressler00] for the liquid pintle's logic, [Casiano10] for the
throttling problem in general). The hardware problems are specific and severe:

- The pintle sits in the throat, in the worst thermal environment in the motor,
  at 3000+ K with condensed alumina impinging on it if the propellant is
  metallised. Erosion of the pintle *is* a change in the control law.
- Sealing an actuator shaft that passes through the pressure boundary into a
  hot, particle-laden gas stream.
- Actuator power and response, against gas loads that scale with $p_c A_t$.
- The whole assembly must then survive the storage and IM requirements of
  §3.3 and §3.8 with a mechanism in the gas path.

**Status.** [R] Controllable solid propulsion has been demonstrated in
research and technology-demonstration programmes and appears regularly in the
conference literature under headings such as controllable solid propulsion,
variable-flow ducted rockets and gas-generator-fed systems; it is not standard
practice for fielded motors, and the open literature does not support any
claim that a particular fielded article uses it. Where genuine thrust
modulation is required in the public record, the usual answers are a liquid or
gel system, a hybrid, or a gas generator feeding a valved manifold rather than
a throttled main throat. Note also the one operational relative of throttling
that *is* well documented in the open record: **thrust termination** by opening
ports in the forward dome with shaped charges, which drops $K_n$ so violently
that the chamber depressurises and the grain extinguishes. It is a one-shot,
structurally destructive event, and it is the honest answer to "can you turn a
solid motor off?" — yes, once, and never gently.

#### 3.12.4 Hybrids

A hybrid burns a solid fuel grain with a liquid or gaseous oxidiser injected
into a port. It is worth understanding here for three requirement-driven
reasons: it is intrinsically throttleable (you throttle the oxidiser), it
cannot sustain combustion without the oxidiser flow (a large IM and
ground-safety advantage, because the fuel grain by itself is inert), and it
sidesteps the propellant-processing hazard base of a composite plant. Its
problems are equally structural.

**Regression rate.** Hybrid combustion is diffusion-limited: the flame sits in
a boundary layer above the fuel surface, and the heat that drives regression is
carried to the wall by turbulent transport, which scales with the mass flux
through the port. The classical result, from the boundary-layer analysis of
hybrid combustion and universally used in preliminary design, is

$$\dot r = a\,G_{ox}^{\,n} \qquad (\text{often with a weak } x^{-m} \text{ axial term})$$

> **Eq. 3.10** — variables: $\dot r$ [m/s] regression rate, $G_{ox} =
> \dot m_{ox}/A_{port}$ [kg·m⁻²·s⁻¹], $a$ [SI units that make the law
> dimensional], $n \approx 0.5$–$0.8$ for classical polymeric fuels. Meaning:
> regression is set by convective heat transfer through a turbulent boundary
> layer, so it follows the mass flux, not the chamber pressure. Assumes:
> diffusion-limited turbulent combustion, no radiation-dominated regime, no
> melting/entrainment mechanism, fully developed flow. Fails when: the fuel is
> a *liquefying* fuel such as paraffin, where a melt layer is entrained as
> droplets and regression rates several times the classical value are observed;
> at very low flux, where radiation and chemical kinetics take over; and near
> the port entrance, where the boundary layer is still developing. [E], see
> [Humble ch. 6] and [SB §16].

Two consequences dominate hybrid design:

1. **The regression rate is low**, typically an order of magnitude below a
   composite solid's burn rate, so a hybrid needs a large burning surface for a
   given mass flow — which means multiple ports or complex port geometry, which
   costs volumetric loading, leaves unburned fuel slivers between ports, and
   complicates the structural design of the grain.
2. **O/F shifts through the burn.** With $\dot m_{ox}$ held constant and a
   single circular port of diameter $D$ and length $L$,

$$\dot m_f = \rho_f\,\pi D L\,\dot r = \rho_f \pi D L\, a \left(\frac{4\dot m_{ox}}{\pi D^2}\right)^{n} \;\propto\; D^{\,1-2n}$$

> **Eq. 3.11** — variables: $\rho_f$ [kg/m³] fuel density, $D$ [m] port
> diameter, $L$ [m] port length. Meaning: as the port opens, its area grows
> faster than its perimeter, so the flux and hence the regression rate fall;
> whether the *fuel flow* rises or falls depends entirely on whether $n$ is
> below or above 0.5. Assumes: single circular port, uniform regression, $G$
> evaluated on oxidiser only, constant $\dot m_{ox}$. Fails when: the fuel mass
> flow is a significant part of the total flux (then use $G_{tot}$, which
> flattens the shift), when the oxidiser feed is blowdown rather than
> regulated, or with multi-port or non-circular geometry. [F] given Eq. 3.10.

At exactly $n = 0.5$ the fuel flow is *independent of port diameter* and the
O/F ratio does not shift at all — a result worth deriving once, because it
explains why $n$ near 0.5 keeps appearing in hybrid design discussions and why
measured exponents matter so much. For $n > 0.5$ fuel flow falls and O/F rises
through the burn; for $n < 0.5$ the reverse. Worked Example 3 does both.
The standard mitigations are to design the O/F excursion so that it *sweeps
through* the peak-Isp mixture ratio rather than starting at it, or to programme
the oxidiser flow to compensate — which a hybrid, uniquely among the
architectures in this module, can actually do.

**Public examples.** SpaceShipTwo's motor is the most visible flying hybrid: a
nitrous-oxide/HTPB-class system in the original RocketMotorTwo configuration,
with the programme having publicly changed motor configuration more than once,
which is itself the lesson — hybrid combustion efficiency and stability were
the difficulty, not the concept. University and small-commercial hybrids are
numerous because the ground-safety case is so much easier than a composite
solid's; the Stanford/NASA Ames paraffin work is the standard citation for
liquefying fuels and the three-to-four-fold regression-rate improvement they
offer. [M]/[R]

### 3.13 The comparison table

This is the deliverable of the module. Ranges are representative teaching
values, not specifications, and each entry is the *requirement*, not the
capability of any particular article.

| requirement | launch booster | large strategic-class stage | tactical motor | boost motor | sustain motor | dual-pulse motor | throttleable / hybrid |
|---|---|---|---|---|---|---|---|
| **Storage life** | months–few years; cast-to-fly | **decades**, with surveillance programme | years–decades in field conditions | as parent | as parent | as parent, plus barrier aging | fuel grain: benign, decades; oxidiser: separate storage problem |
| **Aging surveillance** | lot data only | fleet-leader population, periodic destructive teardown + firing | lot data + stockpile sampling | as parent | as parent | as parent + barrier function verification | grain inspection only; oxidiser system is the aging risk |
| **Response time** | 100–300 ms acceptable | short, but launch sequence dominates | **single-digit to tens of ms**, tight dispersion | ms class | inherits boost ignition | pulse 1 as tactical; pulse 2 must ignite reliably after a long, cold coast | slowest: valve opening + ignition + fill |
| **Temperature envelope** | conditioned, narrow (±10–20 K) | wide storage, controlled at use | **−54 °C to +71 °C operating**, wider storage | wide | wide | wide, plus pulse-2 soak from pulse 1 | oxidiser thermophysics set the limits |
| **$\pi_K$ consequence** | small; dispersion budget dominated by other terms | large; drives MEOP and range dispersion | **largest**; drives MEOP, burn time, ballistic dispersion | drives boost pressure peak | drives sustain low-pressure limit at cold | both, and they interact | throttle loop absorbs it |
| **Mass fraction $\zeta$** | 0.88–0.94, dominant requirement | 0.88–0.93, dominant | 0.60–0.85, scaling-limited | 0.6–0.8 | 0.6–0.8 | parent minus barrier and second igniter | poor: tanks, feed, valves |
| **Volume constraint** | moderate (aero, stack length) | **hard** (envelope fixed externally) | **hard** (tube/launcher envelope) | hard | hard | hardest: two grains + barrier in one envelope | poor volumetric loading (ports) |
| **Reliability demonstration** | small $N$, heavy analysis, high per-unit value | analysis + surveillance firings + variables data | **large $N$ lot acceptance**, process control | as tactical | as tactical | product of two ignition systems | few units; analysis-dominated |
| **Insensitive munitions** | not a driving requirement | required | **driving requirement** | driving | driving | driving, and the barrier is a new IM path | intrinsically favourable (fuel inert alone) |
| **Signature** | irrelevant | secondary | **driving**: smoke class and plume radiance | driving | driving (long duration = long trail) | driving | favourable: no metal, no chloride if oxidiser chosen so |
| **Environmental survivability** | transport + launch environments | full storage + transport + carriage | **full field spectrum**: vibration, shock, humidity, salt fog, altitude | full | full | full, plus barrier integrity through all of it | oxidiser system leakage and compatibility dominate |
| **Production scale** | units–tens per year | tens–hundreds over programme life | **thousands per year, with surge** | thousands | thousands | hundreds | tens |
| **Dominant cost driver** | case + nozzle + qualification | qualification + surveillance programme | **rate production + IM/signature ingredients** | rate | rate | barrier + second ignition + qualification | development and test, not unit cost |
| **Thrust-time controllability** | none (fixed) | none (staged) | none | none | none | **two commanded events** | continuous |

---

## 4. Typical engineering ranges

| quantity | typical range | who sits at the extreme |
|---|---|---|
| Pressure exponent $n$ | 0.2–0.5 for fielded composites; 0.5–0.8 in research and in some double-base systems | low end: motors that must hold ballistics across a wide temperature envelope; high end: anything trying to be throttleable, at the price of stability |
| $\sigma_p$ (burn rate) | 0.001–0.004 K⁻¹ | AP/HTPB composites cluster near 0.0015–0.0025 K⁻¹; nitramine and double-base systems can be higher |
| $\pi_K$ (pressure) | 0.0015–0.006 K⁻¹ | follows $\sigma_p/(1-n)$; a high-$n$ propellant with a high $\sigma_p$ is a temperature-envelope disaster |
| Operating temperature envelope | ±10–20 K (conditioned launch vehicle) to **−54 °C … +71 °C** (field munition) | the RSRM was launched within a managed propellant mean bulk temperature band; a field motor has no such luxury |
| Chamber pressure | 3–7 MPa (large boosters, e.g. RSRM class ≈ 6.4 MPa peak) to 10–20 MPa (small high-performance motors) | small motors run high pressure because $c^*$ efficiency and $C_F$ improve, and because the case is small enough for it to be affordable |
| Sustain-phase pressure | 1.5–4 MPa | bounded below by the propellant's stable combustion limit at cold |
| Boost/sustain thrust ratio | 3:1 to 10:1 in fixed-throat dual-thrust motors | limited by the low-pressure limit, not by geometry |
| Ignition delay | 5–50 ms (tactical) to 100–300 ms (large boosters) | grain surface area, igniter mass flux and free volume |
| Propellant mass fraction $\zeta$ | 0.60–0.85 (small tactical) · 0.88–0.94 (large upper-stage/booster) | Star 48B ≈ 0.94 on reconciled masses; small motors are area-limited |
| Volumetric loading $\eta_V$ | 0.75–0.95 | end-burners at the top; multi-port hybrids at the bottom (0.5–0.7) |
| Hybrid regression rate | 0.5–2 mm/s classical polymeric; 2–6 mm/s liquefying (paraffin) | an order of magnitude below composite solid burn rates (5–15 mm/s) |
| Hybrid $n$ (flux exponent) | 0.4–0.8, most often quoted near 0.5–0.62 | the O/F shift changes sign at $n = 0.5$ |
| Service life demonstrated by surveillance | 10–30 years | fleet-leader articles; the number is a claim about a specific population, not a material property |
| Reliability demonstration | 0.95–0.99 at 80–95 % confidence, from combined evidence | Eq. 3.7 shows the firing-only cost of the high end |

Solid-motor figures quoted above for real hardware come from
`reference/_verify-solid-coldgas.md` with the confidence labels recorded
there; where that file marks a number contested (Star 48B inert mass and Isp
being the standing example), this module carries the caveat rather than a
single figure.

---

## 5. Worked examples

### WE1 — Chamber pressure and thrust across the temperature envelope

**Problem.** A generic tactical motor is characterised at $T_\text{ref} =
+21$ °C with $p_c = 10.0$ MPa (1450 psia) and $F = 27.9$ kN (6270 lbf), from
$A_t = 1.80\times10^{-3}$ m² and $C_F = 1.55$. The propellant has
$\sigma_p = 0.002$ K⁻¹ and $n = 0.35$. The grain geometry is fixed. Find
$p_c$ and $F$ at $-40$ °C and $+60$ °C, the burn-time change, and the
pressure excursion across the full $-54$ °C to $+71$ °C envelope.

**Step 1 — pressure sensitivity.**
$$\pi_K = \frac{\sigma_p}{1-n} = \frac{0.002\ \mathrm{K^{-1}}}{1-0.35} = 3.077\times10^{-3}\ \mathrm{K^{-1}}$$
The exponent has amplified the burn-rate sensitivity by $1/0.65 = 1.54$.

**Step 2 — cold case, $\Delta T = -40 - 21 = -61$ K.**
$$\frac{p_c}{p_{c,\text{ref}}} = \exp\left[(3.077\times10^{-3})(-61)\right] = \exp(-0.1877) = 0.8289$$
$$p_c = 0.8289 \times 10.0\ \mathrm{MPa} = 8.29\ \mathrm{MPa}$$
$$F = C_F p_c A_t = 1.55 \times 8.29\times10^{6}\ \mathrm{Pa} \times 1.80\times10^{-3}\ \mathrm{m^2} = 23.1\ \mathrm{kN}$$

**Step 3 — hot case, $\Delta T = +60 - 21 = +39$ K.**
$$\frac{p_c}{p_{c,\text{ref}}} = \exp\left[(3.077\times10^{-3})(39)\right] = \exp(0.1200) = 1.1275$$
$$p_c = 11.27\ \mathrm{MPa}, \qquad F = 31.5\ \mathrm{kN}$$

**Step 4 — hot-to-cold ratio.**
$$\frac{p_{+60}}{p_{-40}} = \exp\left[(3.077\times10^{-3})(100)\right] = 1.360$$
A 100 K soak difference moves thrust by 36 %.

**Step 5 — burn time.** At constant $K_n$, mass conservation gives
$\rho_p A_b r = p_c A_t/c^*$, so $r \propto p_c$ and the action time scales
inversely:
$$\frac{t_{-40}}{t_{\text{ref}}} = \frac{1}{0.8289} = 1.21, \qquad \frac{t_{+60}}{t_{\text{ref}}} = \frac{1}{1.1275} = 0.887$$
The cold motor burns 21 % longer and the hot motor 11 % shorter, while total
impulse changes only through the second-order dependence of $c^*$ and $C_F$ on
pressure.

**Step 6 — full envelope, $-54$ °C to $+71$ °C, $\Delta T = 125$ K.**
$$\frac{p_{+71}}{p_{-54}} = \exp\left[(3.077\times10^{-3})(125)\right] = 1.469$$
Referred to the +21 °C characterisation, the hot limit alone gives
$\exp[(3.077\times10^{-3})(50)] = 1.166$, i.e. $p_c = 11.7$ MPa. MEOP must then
be built on top of that: hot limit × dispersion in $a$ (±3–5 % is a
representative lot spread) × dispersion in $A_b/A_t$ × ignition overshoot, and
only then multiplied by the case design factor.

**Sanity check.** $\pi_K \approx 0.3$ %/K is the number every solid-motor
engineer carries; over a 100 K envelope it gives a third more thrust, which is
the right order — this is exactly why field motors carry heavier cases than
conditioned launch boosters of the same performance, and why fire-control and
trajectory dispersion budgets always contain a propellant-temperature term.

*(Recomputed in `tools/examples/27.py` with `pressure_sensitivity_pi_K` and
`temperature_sensitivity_pressure`.)*

---

### WE2 — Boost–sustain grain arithmetic

**Problem.** A generic dual-thrust motor must deliver 45.0 kN for 1.5 s
(boost) and 9.8 kN for 12.0 s (sustain) through a single fixed throat. The
propellant has $n = 0.35$, $\rho_p = 1770$ kg/m³, $c^* = 1520$ m/s, and burns
at 8.00 mm/s at 7.00 MPa. Take $C_F = 1.60$ throughout. Find the throat area,
the two burning areas and pressures, the two webs, and then repeat the sustain
sizing with a slower co-cured propellant whose coefficient is 35 % of the
boost propellant's.

**Step 1 — burn-rate coefficient.** From $r = a p^n$ with SI units
($r$ in m/s, $p$ in Pa):
$$a = \frac{8.00\times10^{-3}}{(7.00\times10^{6})^{0.35}} = \frac{8.00\times10^{-3}}{248.8} = 3.216\times10^{-5}\ \mathrm{m\,s^{-1}Pa^{-0.35}}$$

**Step 2 — throat area from the boost point.** Choose the boost chamber
pressure at 12.0 MPa (1740 psia):
$$A_t = \frac{F_b}{C_F\,p_{c,b}} = \frac{45.0\times10^{3}}{1.60 \times 12.0\times10^{6}} = 2.344\times10^{-3}\ \mathrm{m^2}$$
(a throat diameter of 54.6 mm).

**Step 3 — boost burning area.** Invert Eq. 3.1:
$$K_{n,b} = \frac{p_{c,b}^{\,1-n}}{a\,\rho_p\,c^*} = \frac{(12.0\times10^{6})^{0.65}}{(3.216\times10^{-5})(1770)(1520)} = \frac{3.99\times10^{4}}{86.5} = 461.7$$
$$A_{b,b} = K_{n,b} A_t = 461.7 \times 2.344\times10^{-3} = 1.082\ \mathrm{m^2}$$
Boost burn rate: $r_b = a p_{c,b}^{\,n} = 9.66$ mm/s; mass flow
$\dot m = \rho_p A_{b,b} r_b = 1770 \times 1.082 \times 9.66\times10^{-3} = 18.5$ kg/s.

**Step 4 — sustain pressure and area, same propellant.** Same throat, so
$$p_{c,s} = \frac{F_s}{C_F A_t} = \frac{9.80\times10^{3}}{1.60 \times 2.344\times10^{-3}} = 2.61\ \mathrm{MPa}$$
From Eq. 3.8 rearranged, $A_{b,s} = A_{b,b}\,(p_{c,s}/p_{c,b})^{1-n}$:
$$A_{b,s} = 1.082 \times \left(\frac{2.61}{12.0}\right)^{0.65} = 1.082 \times 0.371 = 0.402\ \mathrm{m^2}$$
Check the thrust ratio against Eq. 3.8:
$(1.082/0.402)^{1/0.65} = 2.693^{1.538} = 4.59 = 45.0/9.8$. ✓

**Step 5 — webs.** $r_s = a p_{c,s}^{\,n} = 5.67$ mm/s.
$$w_b = r_b t_b = 9.66\ \mathrm{mm/s} \times 1.5\ \mathrm{s} = 14.5\ \mathrm{mm}$$
$$w_s = r_s t_s = 5.67\ \mathrm{mm/s} \times 12.0\ \mathrm{s} = 68.0\ \mathrm{mm}$$
Propellant masses: boost $18.5 \times 1.5 = 27.8$ kg; sustain
$\dot m_s = 1770 \times 0.402 \times 5.67\times10^{-3} = 4.03$ kg/s, so
$4.03 \times 12.0 = 48.4$ kg. Total impulse
$45.0\times1.5 + 9.8\times12.0 = 185$ kN·s, and with $I_{sp} = C_F c^*/g_0 =
1.60 \times 1520/9.80665 = 248$ s the implied propellant mass is 76.1 kg —
consistent with $27.8 + 48.4 = 76.2$ kg. ✓

**Step 6 — sustain with a slower propellant, $a_s = 0.35\,a$.** For the same
sustain pressure of 2.61 MPa:
$$K_{n,s} = \frac{(2.61\times10^{6})^{0.65}}{(0.35)(3.216\times10^{-5})(1770)(1520)} = \frac{1.47\times10^{4}}{30.3} = 490$$
$$A_{b,s} = 490 \times 2.344\times10^{-3} = 1.148\ \mathrm{m^2}, \qquad r_s = 1.98\ \mathrm{mm/s}, \qquad w_s = 23.8\ \mathrm{mm}$$
Same thrust, same mass flow (4.03 kg/s), same propellant mass — but the
sustain grain now needs a *burning area as large as the boost grain's* and only
a third of the web. The design choice is therefore a packaging choice: the
single-propellant solution wants a small-area, thick-web sustain section (long
axial burn, e.g. an end-burner or a small-perimeter bore), while the
dual-propellant solution wants a large-area, thin-web sustain section (a
cylindrical or slotted bore burning radially over a short distance).

**Sanity check on the constraint that matters.** The sustain pressure of
2.61 MPa is at +21 °C. At the cold limit ($-54$ °C, $\Delta T = -75$ K),
WE1's machinery gives $\exp[(3.077\times10^{-3})(-75)] = 0.794$, so
$p_{c,s} \to 2.07$ MPa. That is uncomfortably close to the 1.5–3 MPa band
where conventional composite propellants start to chuff. **The cold-day
sustain pressure, not the arithmetic, is what limits the achievable thrust
ratio** — exactly the point of §3.12.1.

*(Recomputed in `tools/examples/27.py` with `solid_equilibrium_pressure` and
`vieille_burn_rate`.)*

---

### WE3 — Hybrid regression rate and O/F shift

**Problem.** A generic single-port hybrid has a cylindrical fuel grain,
$\rho_f = 920$ kg/m³, port length $L = 1.50$ m, initial port diameter
$D_0 = 0.100$ m, burning to a final diameter of 0.220 m. The oxidiser flow is
regulated at $\dot m_{ox} = 1.50$ kg/s. The fuel regresses at 1.914 mm/s at
the initial condition. Find the O/F at the start and end of the burn for
(a) $n = 0.50$ and (b) $n = 0.62$, and comment.

**Step 1 — initial flux.**
$$A_{port,0} = \frac{\pi D_0^2}{4} = \frac{\pi (0.100)^2}{4} = 7.854\times10^{-3}\ \mathrm{m^2}$$
$$G_{ox,0} = \frac{1.50}{7.854\times10^{-3}} = 191.0\ \mathrm{kg\,m^{-2}s^{-1}}$$

**Step 2 — calibrate $a$ for each exponent** from
$\dot r_0 = 1.914\times10^{-3}$ m/s:
$$a_{(n=0.50)} = \frac{1.914\times10^{-3}}{191.0^{0.50}} = 1.385\times10^{-4}, \qquad a_{(n=0.62)} = \frac{1.914\times10^{-3}}{191.0^{0.62}} = 7.374\times10^{-5}$$
(SI units throughout; both give the same starting point by construction, which
is the whole point of the comparison.)

**Step 3 — initial fuel flow and O/F.**
$$\dot m_{f,0} = \rho_f\,\pi D_0 L\,\dot r_0 = 920 \times \pi \times 0.100 \times 1.50 \times 1.914\times10^{-3} = 0.830\ \mathrm{kg/s}$$
$$\left(\frac{O}{F}\right)_0 = \frac{1.50}{0.830} = 1.81$$

**Step 4 — final condition, $D = 0.220$ m.**
$$G_{ox} = \frac{1.50}{\pi(0.220)^2/4} = \frac{1.50}{0.03801} = 39.5\ \mathrm{kg\,m^{-2}s^{-1}}$$

*(a) $n = 0.50$:* $\dot r = 1.385\times10^{-4}\times 39.5^{0.5} = 0.870$ mm/s, and
$$\dot m_f = 920 \times \pi \times 0.220 \times 1.50 \times 0.870\times10^{-3} = 0.830\ \mathrm{kg/s}, \qquad O/F = 1.81$$
**No shift at all.** Eq. 3.11 gives $\dot m_f \propto D^{1-2n} = D^0$ — the
perimeter grows exactly as fast as the flux falls.

*(b) $n = 0.62$:* $\dot r = 7.374\times10^{-5}\times 39.5^{0.62} = 0.720$ mm/s,
$$\dot m_f = 920 \times \pi \times 0.220 \times 1.50 \times 0.720\times10^{-3} = 0.687\ \mathrm{kg/s}, \qquad O/F = \frac{1.50}{0.687} = 2.18$$
a 21 % rise in O/F over the burn, consistent with $\dot m_f \propto D^{-0.24}$:
$(0.220/0.100)^{-0.24} = 0.828$, and $0.830 \times 0.828 = 0.687$ kg/s. ✓

**Step 5 — burn time and mass-averaged O/F.** Integrating
$dD/dt = 2\dot r(D)$ numerically from 0.100 m to 0.220 m gives 56.5 s for
$n=0.62$ (50.2 s for $n=0.50$), consuming 41.6 kg of fuel in both cases, for a
mass-averaged $O/F$ of 2.04 at $n=0.62$ against 1.81 at $n=0.50$.

**Interpretation.** If the propellant combination's peak $I_{sp}$ sits near
$O/F \approx 2.3$, the $n = 0.62$ design that sweeps 1.81 → 2.18 spends the
whole burn approaching the optimum and never overshoots it, whereas a design
tuned to start *at* 2.3 would spend the entire burn drifting away from it. That
is the standard mitigation for O/F shift and it costs nothing but foresight.
The second mitigation — programming $\dot m_{ox}$ down through the burn to hold
O/F — is available only to hybrids and is the reason hybrids appear in
applications that need genuine throttling.

**Sanity check.** 1.9 mm/s falling to 0.7–0.9 mm/s is the right regime for a
classical polymeric hybrid fuel and roughly an order of magnitude below a
composite solid's 8–10 mm/s, which is exactly why hybrids need long grains or
multiple ports for the same mass flow. A liquefying paraffin-class fuel would
sit three to four times higher and change that packaging argument
substantially [R].

*(Arithmetic described as a comment in `tools/examples/27.py`; the regression
law is not in `tools/rocket.py`.)*

---

## 6. Real motors: why did they design it that way?

### 6.1 Space Shuttle RSRM and the five-segment SLS booster — the conditioned-environment case

**Choice.** A segmented D6AC steel case, PBAN-bound AP/Al propellant, an
11-point star forward segment with double-truncated-cone aft segments, and a
submerged flexseal-gimballed carbon-phenolic nozzle. Propellant mean bulk
temperature managed before launch.

**Why.** Nothing about this motor is optimised for storage or field
environments, because it does not have those requirements. It is optimised for
mass fraction at very large scale, for transportability by rail (which is what
forces segmentation and therefore field joints), and for a thrust-time trace
that limits vehicle loads through max-Q — the star point's regressive head-end
shape is a *loads* requirement expressed as a grain geometry. The steel case is
heavier than a composite one but is reusable, inspectable and cheap to qualify,
and reuse mattered more than the last few points of $\zeta$.

**Alternatives at the time.** A monolithic case (impossible to transport at
that diameter), a filament-wound case (proposed and partially developed; the
filament-wound case programme for Vandenberg launches did not fly
operationally), a different grain shape (would have raised the max-Q loads).

**Would a modern engineer choose the same?** For a rail-transported booster of
that size, segmentation is still forced. For the case material, current
practice at slightly smaller scale has moved decisively to monolithic
carbon-fibre composite — the P120C is the flying example [P120C] — because
segment joints are the RSRM's most expensive lesson and monolithic composite
cases remove them entirely. That is a requirement-driven answer, not a
materials-driven one: no field joint, no field-joint failure mode.

### 6.2 Star 48B — the mass-fraction extreme

**Choice.** A titanium case, HTPB-class composite propellant, a fixed
carbon-phenolic nozzle, and a mass fraction around 0.94 with two published
nozzle variants at $I_{sp} \approx 286$ s and $292$ s vacuum.

**Why.** An apogee-kick or third-stage motor's requirement set is nearly the
inverse of a tactical motor's: no field storage, no temperature envelope worth
speaking of, no IM, no signature, no rate production, and one requirement that
dominates everything — deliver the largest possible $\Delta v$ from a fixed
mass and a fixed volume. So everything gets spent on $\zeta$ and on expansion
ratio.

**A cautionary note the database insists on.** Two published Isp values (286.2
and 292.2 s) are both correct — they are the short- and long-nozzle variants —
and quoting "the Star 48B Isp" without naming the nozzle is a mistake this
course treats as a factual error. The published inert masses (28 kg and 126 kg)
cannot both be right; the mass balance supports the larger. Requirements
engineering starts with knowing which number you are holding.

### 6.3 Minuteman III third stage — thrust termination

**Choice.** A fixed nozzle with liquid-injection thrust vector control, and
shaped charges that open ports in the forward dome to terminate thrust.

**Why.** A staged vehicle needs to stop the final stage at a precise velocity,
and a solid motor has no valve. Opening large ports forward collapses $K_n$ and
the chamber depressurises below the propellant's deflagration limit, so the
grain goes out. It is violent, single-use and structurally destructive, and it
was accepted because the requirement — precise terminal velocity from a solid
stage — admitted no cheaper answer.

**Would a modern engineer choose the same?** For that requirement, yes:
the alternative (a restartable liquid post-boost stage) is what the same
vehicles carry anyway for the fine work, and that division of labour — solids
for the big impulse, a small liquid system for precision — remains the standard
architecture. It is also the honest counter-example to "solids cannot be turned
off": they can, once, destructively.

### 6.4 Trident D-5 — what a decades-long storage requirement does to a design

**Choice.** Graphite/epoxy cases (Kevlar/epoxy on the earlier C-4 and on early
D-5 third stages), a single gimballed composite nozzle per stage replacing the
four rotatable nozzles of the Polaris generation, an extendable nozzle, and a
deployable nose spike.

**Why.** Two arcs are visible in the open record and both are requirement
arcs. First, **nozzle control**: jetavators (simple, lossy, thrust-degrading)
→ liquid injection (no moving nozzle, but injectant mass and tankage) → a
single gimballed flexseal nozzle (efficient, one actuator set, but a flexible
joint that must survive decades of storage in a marine environment). Second,
**case material**: steel → glass-filament-wound → Kevlar/epoxy →
graphite/epoxy, each step roughly a 20–30 % case-mass reduction at equal burst
pressure. The published reason for the last change is instructive because it is
*two* reasons: inert weight, and eliminating an electrostatic potential
difference between dissimilar composite materials. The second is a storage-and-
handling requirement, invisible in any performance chart.

**Naming trap.** The Trident "aerospike" is a telescoping drag-reduction spike
deployed from the nose, reportedly cutting frontal drag by about half. It is
not an aerospike nozzle. Students conflate the two every year.

### 6.5 Peacekeeper stages 2 and 3 — extendable exit cones

**Choice.** Kevlar/epoxy filament-wound cases on all three solid stages, with
extendable exit cones (EEC) on stages 2 and 3.

**Why.** This is the cleanest example in the course of a *volume* requirement
driving a mechanism. A high expansion ratio is free performance in vacuum, but
the nozzle length it needs does not fit in a length-limited envelope. An EEC
stows the skirt around the nozzle and deploys it after staging, buying roughly
10–15 s of $I_{sp}$ for a deployment mechanism, its mass, and a new
single-point failure mode. The same concept flew on the IUS upper stage as the
open-literature reference article for extendable exit cones. A modern designer
facing the same constraint would make the same choice; the argument is entirely
about whether the deployment reliability can be demonstrated, which is §3.7's
problem.

### 6.6 SpaceShipTwo — the flying hybrid

**Choice.** A nitrous-oxide/hydroxyl-terminated-polybutadiene-class hybrid,
throttled and shut down in flight, with the motor configuration publicly
changed more than once during the programme.

**Why.** The requirement set is unusual: a crewed vehicle needs shutdown
capability and a benign ground-handling case, and cares less about mass
fraction than an orbital stage does. A hybrid gives both — the fuel grain alone
is inert, and closing the oxidiser valve stops the motor. What the programme
demonstrated in public is equally instructive: combustion efficiency,
stability, and repeatability across the burn are the hybrid's real
difficulties, not the concept. [M]

**Would a modern engineer choose the same?** For a suborbital crewed vehicle
where shutdown and ground safety dominate, hybrids remain a defensible choice.
For anything mass-fraction-limited they are not, and the regression-rate
arithmetic of WE3 is why. [J]

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The four trades that recur

1. **Energy vs insensitivity.** Higher-energy propellant families are harder
   to make IM-compliant. The resolution is always system-level: what is the
   extra range worth against the storage and transport risk?
2. **Signature vs performance and stability.** Removing metal fuel removes
   primary smoke, several seconds of $I_{sp}$, some density impulse, and a
   large part of the acoustic damping that keeps the chamber stable.
3. **Temperature envelope vs mass fraction.** A wider envelope means a higher
   MEOP for the same nominal pressure, means a heavier case.
4. **Controllability vs everything.** Every mechanism that buys thrust-time
   control — a barrier, a movable throat, a valve — costs inert mass,
   volumetric loading, a new failure mode, and a new item in the aging
   surveillance programme.

### 7.2 Failure modes

**Grain bore cracking at cold soak.**
*Mechanism*: thermal shrinkage of a case-bonded grain puts the bore in
tension; strain capability falls as $T \to T_g$; aging has already raised the
modulus. *Symptom*: a pressure trace that starts high and above prediction,
because the crack has added burning area, sometimes progressing to a
catastrophic overpressure. *Evidence*: post-fire or pre-fire NDE (radiography,
computed tomography, ultrasonics); the pressure-time trace itself compared with
the predicted trace from the same grain model. *Fix*: a lower-modulus,
higher-elongation binder system; a stress-relieving grain geometry (fillets,
boot at the ends, stress-relief flaps); a narrower cold requirement, if the
customer will accept one; a cumulative-damage service-life limit.

**Liner or insulation debond.**
*Mechanism*: adhesion loss from plasticiser migration, moisture ingress, or
cyclic thermal strain at the interface. *Symptom*: exposed case or insulation
burning through; a pressure or temperature anomaly late in the burn; case
burn-through in the worst case. *Evidence*: NDE for unbonds; peel-test
specimens from surveillance articles trending downward with age. *Fix*: bond
system requalification, sealing against moisture, tighter surveillance
sampling.

**Ignition overpressure at the hot limit.**
*Mechanism*: an igniter sized for cold ignition delivers the same mass into a
motor whose grain lights faster and whose equilibrium pressure is already
elevated. *Symptom*: a pressure spike above the steady trace within the first
tens of milliseconds. *Evidence*: high-bandwidth head-end pressure measurement
in hot-conditioned static firings. *Fix*: igniter mass and flux tailoring;
staged ignition; increasing free volume, at the cost of $\eta_V$.

**Sustain-phase chuffing or extinguishment at cold.**
*Mechanism*: cold soak lowers $p_c$ by $\pi_K$; if the sustain pressure falls
below the propellant's stable-combustion limit, combustion becomes oscillatory
and then stops. *Symptom*: low-frequency, large-amplitude pressure oscillation
during the sustain phase, or a truncated burn. *Evidence*: cold-conditioned
static firing — this is one of the failures that only appears at the
temperature extreme, which is why the qualification matrix includes it.
*Fix*: raise the sustain $K_n$, use a propellant with a lower low-pressure
limit, or reduce the boost/sustain ratio.

**Pulse-2 grain thermal damage in a dual-pulse motor.**
*Mechanism*: heat soak through the barrier during and after pulse 1 raises the
pulse-2 grain's bulk temperature non-uniformly. *Symptom*: pulse-2 ballistics
off prediction; in the worst case, an autoignition. *Evidence*: instrumented
barrier and grain thermocouples in development firings; pulse-2 pressure trace
compared with an unheated baseline. *Fix*: barrier insulation, coast-time
limits in the requirement, propellant with a higher autoignition margin.

### 7.3 Materials, briefly

Case materials follow the requirement, not fashion: high-strength steels where
inspectability, reuse and cheap qualification dominate; titanium where a small
motor needs mass fraction and can pay; glass, aramid and carbon composites in
that historical order as fibre properties improved, with carbon/epoxy now
standard where mass fraction dominates and the storage environment is
controlled. Metal-case fracture control and proof-test logic are in [SP-8025];
buckling knockdown factors for thin shells come from the structures monograph
[SP-8007] (use its 2020 revision for design); design allowables from [MMPDS],
which supersedes MIL-HDBK-5. Nozzle throat and exit materials are the ablative
carbon-phenolic family with the supply-chain caveats of §3.11; insulation is
the filled-elastomer family covered in module 23.

### 7.4 Manufacturing

The processes are module 25's subject; the *requirements* consequence is this:
lot size, cure schedule and mixer capacity determine the statistical structure
of the reliability argument in §3.7, and any change to any of them is a
requalification. Design-for-manufacture in this class means designing a grain
that a mandrel can be pulled out of, a case that can be non-destructively
inspected all over, and a bond system whose specimens can be cut from the same
article the customer buys [SP-8075].

### 7.5 Testing

What is measured, and what a bad article looks like:

- **Head-end chamber pressure**, high bandwidth. The primary diagnostic. Its
  integral gives $I_t$ with $A_t$; its shape gives the burn-back; departures
  from the predicted trace are the first evidence of cracks, debonds or
  ballistic anomalies [SP-8041].
- **Thrust**, on a calibrated stand, with the alignment and load-path
  corrections that [SP-8041] insists on. Thrust and pressure together separate
  a $C_F$ problem (nozzle) from a $K_n$ problem (grain).
- **Conditioned firings at both temperature extremes.** The single most
  informative test in the tactical qualification matrix, because $\pi_K$,
  ignition delay and the low-pressure limit all move together with $T_i$.
- **Ignition-transient instrumentation**: high-rate pressure and, where
  possible, optical measurement of flame spreading.
- **NDE before and after environmental exposure**: radiography or computed
  tomography for cracks and voids, ultrasonics for bond lines.
- **Environmental and IM tests** per the standards named in §3.8 and §3.10;
  the propulsion engineer's job is not to run them but to predict the outcome
  and to design the article so the prediction is favourable.

A worked reading of a bad trace: a firing whose pressure is 8 % high, whose
action time is 7 % short and whose total impulse is nominal is almost certainly
a *temperature* story (check the recorded soak temperature against $\pi_K$),
not a grain defect. A firing whose pressure is 8 % high, whose action time is
short and whose total impulse is *also* high is a burning-area story: a crack,
a debond, or a mis-cast grain. Learning to make that distinction from two
numbers is most of what §3.5 is for.

---

## 8. Misconceptions and what engineers actually care about

**"Solid motors cannot be shut down or throttled."** They can be terminated —
by opening the chamber, which is destructive and single-use — and they can in
principle be throttled by moving the throat, which is a research topic (§3.12.3).
What they cannot do is throttle cheaply and repeatably with the low-exponent
propellants that everything else about the design demands.

**"A wider temperature envelope just means a bigger dispersion."** It means a
heavier case. MEOP is a hot-day number and the case is sized to MEOP, so the
envelope is paid for in mass fraction before anyone gets to argue about
dispersion.

**"Insensitive munitions requirements mean the propellant will not burn."** The
requirement is about the *violence* of the reaction, not its absence. A passing
article typically burns; what it must not do is deflagrate violently, explode
or detonate.

**"Minimum-smoke propellant is just AP/HTPB without the aluminium."**
Removing the metal removes primary smoke, but chloride-producing oxidiser still
makes secondary smoke in humid air. Minimum smoke requires giving up both,
which pushes the formulation toward more energetic and more IM-hostile
chemistry — the three-cornered trade of §3.9.

**"Firing more motors is how you demonstrate reliability."** Eq. 3.7 says 229
zero-failure firings buy you 0.99 at 90 % confidence. Real programmes buy
reliability with variables data, process control, physics-of-failure analysis
and surveillance trends; firings calibrate the model.

**"Aging is a chemistry problem."** Aging chemistry changes the propellant's
*mechanical allowables*; the failure is structural, and it appears at the cold
temperature limit where the demand is highest and the capability lowest.

**"A dual-pulse motor is just two motors sharing a case, so it must be
lighter."** It is lighter than two complete motors, and heavier and less
volumetrically efficient than one — and it adds a barrier that must survive
pulse 1, insulate through the coast, and open on command decades later.

**"Hybrids are simple."** The regression rate is an order of magnitude low, the
O/F shifts through the burn, combustion efficiency is hard to achieve without a
mixing device, and the oxidiser brings a full liquid feed system with it. What
they genuinely buy is ground safety and throttleability.

### What engineers in this area actually spend their day on

1. **Margin, at the extremes.** Not nominal performance — the cold-day grain
   strain margin, the hot-day pressure margin, and how both move with age.
2. **Dispersion budgets.** Where every percent of thrust, impulse and burn-time
   variation comes from, and which term to spend money reducing.
3. **The qualification consequence of any change.** "What does this change
   force us to requalify, and how many firings is that?" is the first question
   asked about any proposal.
4. **Surveillance trends.** Whether the measured properties of the fleet-leader
   population are moving, in which direction, and how far the extrapolation
   still has to reach.
5. **Producibility.** Whether the design can be made at rate, by more than one
   supply chain, with the lot statistics the reliability argument assumes.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can name the seven motor classes and state the
two dominant requirements for each; explain in plain language why cold is the
structural design case and hot is the pressure design case; state what
insensitive-munitions requirements ask for and name the six standard stimuli;
distinguish primary from secondary smoke; and explain why a hybrid's O/F
changes during a burn.

**Level 2 — Working engineering knowledge.** Given $\sigma_p$, $n$ and a
temperature envelope, you can compute the pressure, thrust and burn-time
excursions and turn them into a MEOP argument. Given a required thrust ratio
and a pressure exponent, you can size a boost–sustain grain, check the sustain
pressure against the low-pressure limit at the cold extreme, and say what the
slower sustain propellant buys. Given a regression law you can compute hybrid
fuel flow and O/F drift and state the sign of the shift from $n$ alone. You can
compute what a zero-failure firing programme demonstrates and explain why that
is not how reliability is actually bought.

**Level 3 — Interview mastery.** Given an unfamiliar motor's requirement set,
you can predict its architecture — case family, grain type, propellant class,
nozzle concept, whether it will be dual-pulse — and defend each prediction from
the requirement that drives it. Given an anomalous static-firing trace and a
recorded soak temperature you can separate a temperature effect from a
burning-area effect. You can argue both sides of the energy-versus-insensitivity
trade and of the fixed-throat-versus-controllable trade, and say which
programme in the public record faced the same decision and what it chose.

---

## 10. Problems

### Conceptual

**C1.** A programme proposes widening a tactical motor's operating temperature
requirement from −40 °C…+60 °C to −54 °C…+71 °C at no change in nominal
performance. List, in order of severity, the four hardware consequences, and
say which one you would expect to consume the most mass.

**C2.** Explain why the same propellant property ($n$) that makes a motor
ballistically well behaved makes it a poor candidate for throttling. Use
Eq. 3.9 in your answer and state what the two competing sensitivities are.

**C3.** A colleague argues that because the barrier in a dual-pulse motor only
has to hold pressure once, it can be made very light. Give the three functional
requirements on the barrier and explain which of them, not pressure, is
usually the hardest to demonstrate over a decades-long storage life.

**C4.** Why is secondary smoke a *statistical* requirement while primary smoke
is a deterministic one? What does that do to how the requirement must be
written and verified?

**C5.** A motor passes its fast cook-off test but fails slow cook-off. Explain
physically why the slower stimulus can produce the more violent reaction, and
name two design features that address it.

**C6.** Distinguish propellant mass fraction from volumetric loading fraction.
Give one requirement that drives each, and one design decision where they
conflict.

**C7.** A fleet-leader surveillance article is 18 years old and its measured
strain capability has fallen 30 % from delivery. The requirement is a 25-year
service life. State what analysis you must do to decide whether the fleet is
still qualified, and what data you are missing.

**C8.** Why does a hybrid's ground-safety case improve on a composite solid's,
and what does the hybrid give back in mass fraction and volumetric loading to
get it?

### Calculation

**N1.** A propellant has $\sigma_p = 0.0025$ K⁻¹ and $n = 0.45$. Compute
$\pi_K$. Across an operating envelope of −54 °C to +71 °C, by what factor does
chamber pressure vary? Compare with the module's baseline case
($\sigma_p = 0.002$, $n = 0.35$) and comment on which parameter change did more
damage.

**N2.** A fixed-geometry motor is characterised at +21 °C with $p_c = 8.0$ MPa
and an action time of 9.0 s. With $\pi_K = 3.1\times10^{-3}$ K⁻¹, find $p_c$
and action time at −54 °C and +71 °C. If the case is designed to a MEOP that is
the hot-limit pressure multiplied by 1.10 (dispersion) and then by a design
factor of 1.25, what burst pressure must the case demonstrate?

**N3.** A boost–sustain motor must deliver a 6:1 thrust ratio through one
throat. The propellant has $n = 0.40$ and is used for both phases. What
burning-area ratio is required? If the boost pressure is 11.0 MPa, what is the
sustain pressure, and does it survive a cold-day excursion of $\Delta T =
-75$ K with $\pi_K = 3.1\times10^{-3}$ K⁻¹ against a stated low-pressure limit
of 1.8 MPa?

**N4.** Using $a = 3.216\times10^{-5}$ m·s⁻¹·Pa⁻⁰·³⁵, $n = 0.35$,
$\rho_p = 1770$ kg/m³, $c^* = 1520$ m/s, find the burning area required for
$p_c = 9.0$ MPa with a throat area of $1.20\times10^{-3}$ m². Then find the
mass flow and, with $C_F = 1.55$, the thrust.

**N5.** A single-port hybrid has $\dot m_{ox} = 2.0$ kg/s, $L = 1.2$ m,
$\rho_f = 930$ kg/m³, and $\dot r = a G_{ox}^{0.55}$ with
$a = 1.0\times10^{-4}$ (SI). Compute $\dot r$, $\dot m_f$ and $O/F$ at
$D = 0.12$ m and at $D = 0.20$ m. State the sign of the O/F shift and confirm
it against the exponent rule of Eq. 3.11.

**N6.** How many zero-failure firings are needed to demonstrate $R = 0.995$ at
95 % confidence? At 80 %? Comment on what the difference between those two
numbers says about how confidence levels are negotiated.

**N7.** Read the propellant mass fraction ranges from the §4 table and the
Star 48B figures from §6.2. A tactical motor of 76 kg propellant mass (the WE2
motor) is quoted at $\zeta = 0.72$. What is its loaded mass and inert mass?
What loaded mass would it have at the Star 48B's mass fraction, and what does
the difference tell you about where small-motor inert mass goes?

**N8.** A dual-pulse motor is claimed to cost 4 % of propellant mass fraction
relative to a single-pulse motor in the same envelope. Starting from a
single-pulse motor with $\zeta = 0.80$ and 100 kg loaded mass, compute the
propellant mass lost and, using $I_{sp} = 250$ s, the total impulse given up.
What capability is being bought with it?

### Engineering reasoning

**R1.** Two static firings of the same lot, at recorded soak temperatures of
−40 °C and +55 °C, give peak pressures of 7.9 MPa and 11.4 MPa and action
times of 11.2 s and 8.0 s. Total impulse agrees within 1 % between them. Infer
$\pi_K$ and $\sigma_p$ (take $n = 0.35$). Is the motor behaving as designed?
What one further measurement would most improve your confidence?

**R2.** A third firing from the same lot, at +20 °C, gives a peak pressure 9 %
above the prediction, an action time 6 % *below* prediction, and a total
impulse 4 % *above* prediction. Diagnose. What NDE would you request on the
remaining articles of the lot, and what would confirm or refute your
hypothesis?

**R3.** You are handed two propellant candidates for a tactical motor:
A has $I_{sp} = 245$ s, $\sigma_p = 0.0018$ K⁻¹, $n = 0.30$, is metallised and
AP-based; B has $I_{sp} = 258$ s, $\sigma_p = 0.0035$ K⁻¹, $n = 0.55$, is
minimum-smoke and nitramine-based. Compare them across the ten requirement
dimensions of §3.13 and say which you would take for (a) a booster for a
launcher, (b) a stored field motor with a signature requirement.

**R4.** A proposal replaces a boost–sustain motor with a dual-pulse motor of
the same envelope, arguing that commanded second-pulse ignition is worth the
inert mass. What questions would you ask before agreeing, and what evidence
would you need to see about the barrier?

**R5.** A hybrid concept is proposed to replace a solid tactical motor on IM
grounds. Draft the counter-argument on requirements grounds alone — response
time, volumetric loading, environmental survivability, storage, and production
rate — and say under what mission requirements the hybrid nevertheless wins.

### Mini trade study

**T1.** A stored motor must deliver 200 kN·s of total impulse from a fixed
external envelope, over an operating range of −54 °C to +71 °C, with a
25-year storage life, an insensitive-munitions requirement, and a reduced-smoke
signature requirement. Four architectures are on the table:

- **(a)** single-pulse fixed-throat motor, metallised AP/HTPB, steel case;
- **(b)** single-pulse fixed-throat motor, reduced-smoke AP/HTPB (no metal),
  carbon/epoxy case;
- **(c)** dual-pulse motor, reduced-smoke propellant, carbon/epoxy case;
- **(d)** hybrid, throttleable, with a storable oxidiser.

Recommend one. Your answer must address each of the ten requirement dimensions
of §3.13, quantify at least two trades (use the module's methods and generic
parameters — a $\pi_K$ calculation and a mass-fraction estimate at minimum),
state what you would need to measure to reduce the largest remaining
uncertainty, and name the requirement you would push back on if the
recommendation does not close.

---

## 11. Quiz (100 points)

**Q1 (8).** A propellant has $\sigma_p = 0.003$ K⁻¹ and $n = 0.5$. What is
$\pi_K$?
(a) 0.0015 K⁻¹ (b) 0.003 K⁻¹ (c) 0.006 K⁻¹ (d) 0.0045 K⁻¹

**Q2 (8).** Over which of the following does a *conditioned* launch booster
enjoy the largest advantage over a field-stored tactical motor?
(a) $c^*$ efficiency (b) MEOP relative to nominal pressure
(c) nozzle expansion ratio (d) ignition energy

**Q3 (12).** A fixed-geometry motor runs at 9.0 MPa and 6.0 s action time at
+21 °C, with $\pi_K = 2.8\times10^{-3}$ K⁻¹. Compute $p_c$ and action time at
+71 °C. Show the working.

**Q4 (8).** In a fixed-throat boost–sustain motor with $n = 0.35$, a
burning-area ratio of 4.0 gives a thrust ratio of approximately
(a) 4.0 (b) 5.4 (c) 8.4 (d) 16.0

**Q5 (10).** Name the six stimulus categories assessed under the
insensitive-munitions standards named in §3.8, and state the two response
levels that are unacceptable under every stimulus.

**Q6 (12).** A single-port hybrid has $n = 0.7$ in $\dot r = aG_{ox}^n$ and a
constant regulated oxidiser flow. State whether $O/F$ rises or falls as the
port opens, justify it from the exponent rule, and compute the ratio
$\dot m_f(D=0.20)/\dot m_f(D=0.10)$.

**Q7 (8).** Which statement about primary and secondary smoke is correct?
(a) Both come from condensed products in the exhaust
(b) Primary smoke depends strongly on ambient humidity
(c) Secondary smoke forms by atmospheric condensation on exhaust nuclei
(d) Removing aluminium eliminates both

**Q8 (12).** 60 motors are fired from a qualification programme with zero
failures. What reliability is demonstrated at 90 % confidence? State two
reasons why the programme's claimed reliability is nevertheless higher than
this number, and one reason it might legitimately be lower.

**Q9 (10).** A dual-pulse motor's pulse-2 grain is measured 25 K hotter than
ambient at the end of the pulse-1 coast. With $\pi_K = 3.0\times10^{-3}$ K⁻¹,
what does that do to pulse-2 chamber pressure, and name one further consequence
of the heat soak that is *not* captured by $\pi_K$.

**Q10 (12).** You are shown two static-firing traces from the same lot. Trace
A: pressure +8 %, action time −7 %, impulse +0.5 % against prediction. Trace B:
pressure +8 %, action time −7 %, impulse +7 % against prediction. Give the most
likely cause of each and the one measurement that distinguishes them.

---

## 12. Further reading

- **[SP-8064]** — *Solid Propellant Selection and Characterization*. Read it for
  what must be measured to characterise a propellant, including the ageing and
  hazard properties that §3.3 and §3.8 turn into requirements.
- **[SP-8073]** — *Solid Propellant Grain Structural Integrity Analysis*. The
  source for why cold is the structural design case; the loading cases and
  failure criteria are still the right ones even though the analysis methods
  predate general FEA.
- **[SP-8076]** — *Solid Propellant Grain Design and Internal Ballistics*. The
  grain-geometry families and burn-back analysis behind §3.12.1 and WE2.
- **[SP-8075]** — *Solid Propellant Processing Factors in Rocket Motor Design*.
  Read it for §3.11: how mixing, casting and cure constrain what you are allowed
  to draw, and therefore what production rate is achievable.
- **[SP-8051]** — *Solid Rocket Motor Igniters*. Ignition transient design and
  its failure modes; the source for §3.4's cold-ignition-versus-hot-overpressure
  trade.
- **[SP-8041]** — *Captive-Fired Testing of Solid Rocket Motors*. What a
  published motor test curve does and does not measure; read before interpreting
  any trace, including this module's problems R1 and R2.
- **[Davenas]** — *Solid Rocket Propulsion Technology*. The most complete open
  treatment of propellant chemistry, processing and motor design in one volume,
  and the best single source for the European perspective on insensitivity,
  signature and dual-pulse hardware.
- **[Kubota]** — *Propellants and Explosives: Thermochemical Aspects of
  Combustion*. The chemistry side: burning-rate mechanisms, temperature
  sensitivity, and why smoke classes and energy content are coupled.
- **[SB]** — *Rocket Propulsion Elements*, solid-motor and hybrid chapters. The
  default reference for the ballistics of §3.1 and for hybrid fundamentals;
  cite the edition, the chapter numbering moves.
- **[Humble]** — *Space Propulsion Analysis and Design*, hybrid chapter. The
  step-by-step sizing procedure behind WE3, including the regression-law
  calibration and multi-port geometry.
- **[Hunley07]** — *The Development of Propulsion Technology for U.S.
  Space-Launch Vehicles*. How solid-motor technology moved between the missile
  programmes and the space launchers, with honest sourcing; his AIAA 99-2925
  survey of what the open record does and does not contain is the right
  calibration for how much of this field is publicly knowable.
- **[Casiano10]** and **[Dressler00]** — the throttling review and the pintle
  engine account. Both are liquid-engine sources, and they are here because the
  control-authority logic of §3.12.3 is the same logic, worked out in a field
  where it succeeded.
