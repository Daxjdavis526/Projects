# Module 07 — Injectors
Part II · Prerequisites: modules 05, 06 · Estimated time: 8 h

The injector is where a rocket engine is actually designed. Everything upstream
of it is plumbing and everything downstream is consequence. It is also the
component that will humiliate you: it is a flat plate with holes in it, it looks
trivial, and it is the single most common reason a development engine is two
years late. The F-1 needed roughly 2,000 tests across 210 injector designs, 15
baffle designs and 14 injector configurations before Rocketdyne had a face that
would not tear the engine apart, and that programme was run by people who had
already built the H-1 [OY93]. Two engines with identical chamber geometry,
identical propellants, identical chamber pressure and identical mixture ratio
will differ by four points of $c^*$ efficiency, will have wall heat fluxes that
differ by a factor of two, and one of them will be unconditionally stable while
the other detonates itself — and the only difference is the hole pattern. This
module is about why, and about how to compute enough of it that your first
injector is a starting point rather than a random guess.

---

## 1. Learning objectives

By the end of this module you should be able to:

1. State the seven physical jobs an injector performs, and identify which one is
   binding for a given engine.
2. Size an injector orifice for a specified mass flow, pressure drop, discharge
   coefficient and propellant density, and state the uncertainty in the result.
3. Predict how $C_d$ varies with orifice $L/D$, inlet geometry and cavitation
   number, and recognise hydraulic flip from flow-bench data.
4. Size a manifold so that its dynamic head does not corrupt the flow
   distribution, and derive the manifold-to-orifice area-ratio rule rather than
   quoting it.
5. Derive the linear chug-stability criterion relating injector $\Delta p/p_c$,
   chamber residence time and combustion time lag, and explain why the answer
   comes out at 15–25 %.
6. Compute the Weber, Reynolds and Ohnesorge numbers of an injected jet, place
   it on the Ohnesorge breakup map, and name the regime.
7. Estimate a spray SMD from a stated correlation, convert it to a droplet
   lifetime with the $d^2$ law, and check the lifetime against the chamber stay
   time and $L^*$ from module 06.
8. Apply Rupe's momentum criterion to size the two orifices of an unlike
   doublet, and explain what to do when the criterion fights the $\Delta p$
   requirement.
9. Choose among impinging, shear-coaxial, swirl-coaxial and pintle elements for
   a stated engine, and defend the choice on mixing, stability, throttling,
   wall compatibility and manufacturability.
10. Name the failure modes an injector causes — wall streaking, face burnout,
    post fatigue, chug, hydraulic flip, hard start — and the evidence that
    identifies each.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Orifice area | $A$ | m² | geometric cross-sectional area of one injection hole |
| Discharge coefficient | $C_d$ | — | ratio of actual to ideal (Bernoulli) mass flow through an orifice |
| Contraction coefficient | $C_c$ | — | ratio of vena-contracta area to geometric orifice area, ≈ 0.61 for a sharp-edged hole |
| Injector pressure drop | $\Delta p$ | Pa | static pressure difference across the injection element, manifold to chamber |
| Injection velocity | $V$ | m/s | actual jet velocity at the orifice exit, $C_d\sqrt{2\Delta p/\rho}$ |
| Chamber pressure | $p_c$ | Pa | stagnation pressure at the injector face |
| Cavitation number | $K$ | — | $(p_1-p_v)/(p_1-p_2)$, upstream-to-vapour over upstream-to-downstream pressure margin |
| Vapour pressure | $p_v$ | Pa | saturation pressure of the liquid at its bulk temperature |
| Liquid Weber number | $\mathrm{We}_l$ | — | $\rho_l V^2 d/\sigma$; liquid inertia over surface tension |
| Gas Weber number | $\mathrm{We}_g$ | — | $\rho_g V_\mathrm{rel}^2 d/\sigma$; aerodynamic force over surface tension |
| Reynolds number | $\mathrm{Re}$ | — | $\rho_l V d/\mu_l$; inertia over viscosity |
| Ohnesorge number | $\mathrm{Oh}$ | — | $\mu_l/\sqrt{\rho_l \sigma d} = \sqrt{\mathrm{We}_l}/\mathrm{Re}$ |
| Surface tension | $\sigma$ | N/m | liquid–vapour interfacial tension |
| Sauter mean diameter | $\mathrm{SMD}$, $D_{32}$ | m | diameter of the drop whose volume-to-surface ratio equals the spray's |
| Volume mean diameter | $D_{30}$ | m | diameter of the drop with the mean volume of the spray |
| Evaporation constant | $K_v$ | m²/s | slope in the $d^2$ law, $d^2(t)=d_0^2-K_v t$ |
| Transfer number | $B$ | — | Spalding mass-transfer number driving droplet evaporation |
| Chamber stay time | $t_s$ | s | mean gas residence time, $V_c\rho_c/\dot m = L^*\rho_c c^*/p_c$ |
| Combustion time lag | $\tau$ | s | delay between injection of a mass element and its heat release |
| Characteristic length | $L^*$ | m | chamber volume divided by throat area |
| Total momentum ratio | $\mathrm{TMR}$ | — | $(\dot m_o V_o)/(\dot m_f V_f)$ for an element |
| Rupe parameter | $R_u$ | — | $(\rho_o V_o^2 d_o)/(\rho_f V_f^2 d_f)$, the momentum-balance criterion for unlike impinging elements |
| Mixing efficiency | $E_m$ | % | Rupe's cold-flow uniformity index for the collected mass-fraction distribution |
| Momentum flux ratio | $J$ | — | $\rho_g V_g^2/(\rho_l V_l^2)$ for a coaxial element |
| Velocity ratio | $\mathrm{VR}$ | — | $V_g/V_l$ for a coaxial element |
| LOX post recess | $L_r$ | m | axial setback of the oxidizer post tip behind the injector face |
| Swirl geometric parameter | $A_s$ | — | $R_n R_{in}/(n r_{in}^2)$ for a centrifugal (swirl) element |
| Filling coefficient | $\varphi$ | — | liquid-occupied fraction of a swirl element's exit area |
| Blockage factor | $\mathrm{BF}$ | — | fraction of a pintle's circumference occupied by radial orifices |
| Skip distance | $L_{sk}$ | m | axial distance from a pintle's radial orifice row to the pintle tip |
| Contraction ratio | $\varepsilon_c$ | — | chamber cross-sectional area divided by throat area |
| $c^*$ efficiency | $\eta_{c^*}$ | — | measured $c^*$ divided by the equilibrium CEA value |
| Element density | $n_A$ | 1/m² | injection elements per unit injector face area |

---

## 3. Theory

### 3.1 The seven jobs

An injector is not "the part that mixes the propellants". It is a component with
seven simultaneous and partly contradictory requirements, and every real design
is a ranking of them [F][J].

**1. Meter the flow.** The injector is the primary flow-metering restriction of
the engine. Its total effective area, together with the pump or tank discharge
pressure, sets $\dot m$ and — through the two circuits' relative areas — the
mixture ratio. An injector whose oxidizer-side effective area is 2 % high
delivers an engine whose mixture ratio is about 2 % high, which for LOX/RP-1 near
$MR=2.3$ is roughly 0.3 % of $I_{sp}$ and, more importantly, a measurable shift
in wall heat flux. Metering accuracy is a manufacturing problem (§7) as much as a
fluid-dynamics one.

**2. Atomize.** Bulk liquid does not burn. It must be broken into drops small
enough to vaporize inside the chamber's stay time. This is the job that sets
$L^*$, and therefore chamber mass, and therefore engine mass (§3.6).

**3. Distribute.** The mass flux of each propellant must be spread across the
chamber cross-section in a prescribed pattern — not a uniform one, usually, but a
prescribed one. Local excess of either propellant is local excess of temperature
or of unburned mass, and both cost you.

**4. Mix.** Distribution is a coarse-grained statement about where propellant
lands; mixing is the fine-grained statement about whether an oxidizer drop and a
fuel drop are close enough to react before either leaves. Mixing is what
$\eta_{c^*}$ measures (§3.7).

**5. Decouple the chamber from the feed system.** The injector's pressure drop is
a hydraulic resistance that makes the flow into the chamber insensitive to
chamber pressure fluctuations. Too little and the engine chugs (§3.4).

**6. Protect the wall.** The chamber wall must not see a stoichiometric flame.
The outer row of elements, or a dedicated ring of film-cooling orifices, is
deliberately run fuel-rich so that a cooler, fuel-rich boundary layer separates
the wall from the core (§3.7, and module 11).

**7. Protect its own face.** The injector face sits at the stagnation point of a
recirculating hot-gas zone. It has essentially no gas-side velocity to thin its
boundary layer and no room for a cooling jacket. Face survival is why porous
faceplates, face film orifices and element recess exist (§3.11).

Rank these for a given engine and the element type falls out almost immediately.
A deep-throttling lander ranks 5 and 2 first: pintle. A hydrogen upper stage
ranks 2 and 7 first, and gets atomization for free from the gas-side velocity:
shear coaxial. A 1960s kerosene booster ranks 4 and 3 first with a
manufacturing constraint of "drill it": impinging doublets.

### 3.2 Orifice hydraulics

#### The governing equation

For an incompressible liquid flowing from a manifold at stagnation pressure $p_1$
through an orifice into a chamber at static pressure $p_2$, Bernoulli plus
continuity give the ideal velocity $\sqrt{2\Delta p/\rho}$, and the actual flow is
smaller by the discharge coefficient:

$$\dot m = C_d\, A\, \sqrt{2\rho\,\Delta p}, \qquad \Delta p = p_1 - p_2$$

> **Eq. 3.1** — variables: $\dot m$ mass flow through one orifice (kg/s); $C_d$
> discharge coefficient (—); $A$ geometric orifice area (m²); $\rho$ liquid
> density (kg/m³); $\Delta p$ pressure drop across the orifice (Pa). Meaning: the
> orifice converts a static pressure difference into a jet, imperfectly. Assumes:
> steady, incompressible, single-phase, non-cavitating flow; manifold velocity
> negligible compared with orifice velocity; $\rho$ constant across the orifice.
> Fails when: the orifice cavitates (§3.2.4), when the propellant is a gas or
> near critical, when the manifold dynamic head is not negligible (§3.3), or
> during transients on a timescale comparable with the acoustic time of the
> manifold.

The jet velocity that leaves the orifice is

$$V = C_d\sqrt{\frac{2\Delta p}{\rho}}$$

> **Eq. 3.2** — same variables. Meaning: the momentum-carrying velocity, which is
> what atomization and mixing actually respond to. Assumes: the same as Eq. 3.1,
> and that all of the discharge deficit appears as a velocity deficit rather than
> as an area deficit. Fails when: the jet is separated from the wall, in which
> case the physical jet area is $C_c A$ with $C_c\approx 0.61$ and the velocity is
> close to ideal — the distinction matters for momentum-ratio calculations and is
> a standard source of quiet error.

That last caveat deserves emphasis, because it is the most common silent mistake
in injector arithmetic [J]. $C_d$ lumps together two physically distinct effects:
area contraction ($C_c$) and velocity loss ($C_v$), with $C_d = C_c C_v$. For a
long, reattached orifice the flow fills the bore and $C_c\approx 1$, so
$V \approx C_d\sqrt{2\Delta p/\rho}$ over the full area $A$, which is Eq. 3.2. For
a short sharp-edged orifice in which the flow never reattaches, $C_v\approx 1$
and the jet leaves at nearly ideal velocity through an area $0.61A$. Both give
the same $\dot m$, and they give *different momentum*, by a factor of
$1/C_c \approx 1.6$. If you are computing a Rupe momentum balance or a pintle
TMR, you must know which case you are in.

#### $C_d$ versus $L/D$ and inlet geometry

The physics is separation and reattachment. Flow entering a sharp-edged hole
separates at the inlet corner, forms a vena contracta at roughly $0.5$–$1$
diameters downstream, and then either exits before reattaching or reattaches to
the bore and refills it. Where it lands on that sequence is governed by $L/D$
[F][E]:

| $L/D$ | behaviour | typical $C_d$ (sharp inlet) |
|---|---|---|
| < 0.5 | thin-plate orifice, free jet, no reattachment | 0.60–0.65 |
| 0.5–2 | vena contracta near the exit, unstable reattachment | 0.61–0.75, scattered |
| 2–5 | reattached, bore refilled, wall friction still small | **0.75–0.85** |
| 5–10 | reattached, friction beginning to bite | 0.75–0.82 |
| > 10 | pipe flow; $C_d$ falls with $L/D$ | < 0.75 |

Rounding the inlet suppresses separation entirely. An inlet radius of
$r/d \gtrsim 0.1$ raises $C_d$ into the 0.85–0.95 band and — more valuably —
collapses the scatter, because the flow no longer has two possible states
[SP-8089][E]. This is why a well-made injector plate has counterbored or
electro-polished inlets and why a hastily drilled one has 10 % flow scatter
between nominally identical holes.

The design consequence: **choose $L/D$ between 3 and 5 with a controlled inlet.**
Below that you are on the unstable part of the curve; above it you are paying
friction and lengthening the plate for nothing. And [SP-8089] is blunt that
tabulated $C_d$ values are for preliminary sizing only: the number you design to
is the one you measure by water-flowing the actual hardware, hole by hole, at the
actual Reynolds number [M].

The Reynolds dependence is weak but real. Above about $\mathrm{Re}=10^4$ the
sharp-edged $C_d$ is nearly constant; below $10^4$ — small orifices, cold viscous
fuels, deep throttle points — it falls, which is one of several reasons deep
throttling is hard.

#### Cavitation and hydraulic flip

Inside the vena contracta the static pressure is below the downstream pressure by
roughly the dynamic head of the contracted jet. If that local minimum falls below
the propellant's vapour pressure, the liquid flashes and the orifice cavitates.
The controlling group is the cavitation number

$$K = \frac{p_1 - p_v}{p_1 - p_2}$$

> **Eq. 3.3** — variables: $p_1$ upstream (manifold) pressure (Pa); $p_2$
> downstream (chamber) pressure (Pa); $p_v$ liquid vapour pressure at bulk
> temperature (Pa). Meaning: the margin to vaporization measured against the
> pressure drop being taken. Assumes: bulk liquid at a known temperature, no
> dissolved gas. Fails when: the propellant is a cryogen near saturation, where
> $p_v$ is a strong function of a temperature you do not know accurately, or when
> dissolved helium from the pressurization system comes out of solution and
> triggers cavitation early.

Note $K \geq 1$ always, and $K \to 1$ means the upstream pressure is barely above
vapour pressure. Nurick's measurements on sharp-edged orifices give the picture
[Nurick76]:

- For $K$ above roughly 1.8–2.0 the orifice runs full and non-cavitating; $C_d$
  is the geometric value from the table above.
- Below that, a vapour cavity grows from the inlet corner. In this regime the
  flow is set by the *upstream-to-vapour* margin only, and Nurick's correlation
  is $C_d \approx C_c\sqrt{K}$ with $C_c\approx 0.61$, equivalently

$$\dot m = C_c A\sqrt{2\rho\,(p_1-p_v)}$$

> **Eq. 3.4** — variables as above; $C_c\approx0.61$ contraction coefficient of a
> sharp-edged orifice. Meaning: a fully cavitating orifice is hydraulically
> choked — its flow no longer depends on chamber pressure at all. Assumes:
> sharp-edged inlet, fully developed cavity, single-component liquid. Fails when:
> the inlet is rounded (cavitation inception is delayed and the transition is
> much less abrupt), or when the cavity is unsteady and the orifice oscillates
> between states.

- If the cavity reaches the orifice exit, chamber gas is ingested up the cavity
  and the jet detaches from the bore entirely. This is **hydraulic flip**. $C_d$
  drops abruptly to about 0.61, the jet becomes a smooth glassy column, the spray
  cone angle of an impinging pair collapses, and atomization gets dramatically
  worse.

Three consequences you must carry [E][J]:

1. A fully cavitating injector orifice **decouples the feed system from the
   chamber completely**, which is superb for chug stability — the injector no
   longer responds to $p_c$ at all. Some small hypergolic thrusters are
   deliberately run cavitating for exactly this reason.
2. Hydraulic flip is a *discontinuity*. An engine can flip one circuit and not
   the other during a throttle transient, shifting mixture ratio by several
   percent in milliseconds. If you see a step in measured $C_d$ or an unexplained
   $c^*$ drop at one particular operating point, suspect flip.
3. Nurick also found that cavitation degrades mixing uniformity in *circular*
   orifices but not in rectangular ones [Nurick76]. That is a strong hint that
   the mechanism is the asymmetry of the cavity, not the vapour itself, and it is
   the reason orifice $L/d$ and inlet radius are treated as design parameters
   rather than shop details.

### 3.3 Manifolds and distribution

The orifices are fed from a manifold, and the manifold has velocity in it. Static
pressure in a flowing manifold is not uniform: it falls where the flow
accelerates and recovers where it decelerates, by order $\tfrac12\rho V_{man}^2$.
Every orifice sees a slightly different $p_1$, so every orifice passes a slightly
different flow. Since $\dot m \propto \sqrt{\Delta p}$,

$$\frac{\delta \dot m}{\dot m} = \frac{1}{2}\frac{\delta(\Delta p)}{\Delta p}$$

and taking the worst-case static-pressure excursion along the manifold as one
dynamic head, $\delta(\Delta p) \approx \tfrac12\rho V_{man}^2$, while
$\Delta p = \rho V^2/(2C_d^2)$ from Eq. 3.2:

$$\frac{\delta \dot m}{\dot m} \approx \frac{1}{2}\,C_d^2\left(\frac{V_{man}}{V}\right)^2
= \frac{1}{2}\,C_d^2\left(\frac{\sum A_{or}}{A_{man}}\right)^2$$

> **Eq. 3.5** — variables: $V_{man}$ mean manifold velocity (m/s); $V$ orifice jet
> velocity (m/s); $\sum A_{or}$ total effective area of the orifices fed by that
> manifold cross-section (m²); $A_{man}$ manifold cross-sectional area (m²).
> Meaning: distribution error scales with the *square* of the manifold-to-orifice
> area ratio, so a modest oversize on the manifold buys a lot. Assumes: the
> manifold is a simple duct with no separation, and the full dynamic head appears
> as a static-pressure excursion (conservative). Fails when: the manifold has
> sharp turns, a single tangential inlet feeding a ring (which superimposes a
> swirl-driven radial gradient), or dead-ended branches that ring acoustically.

Inverting for a 1 % flow-distribution error with $C_d=0.75$ gives
$A_{man}/\sum A_{or} \geq 5.3$; for 2 %, $\geq 3.8$; for 5 %, $\geq 2.4$. That is
the derivation behind the standard rule of thumb that **manifold area should be
at least four to six times the total orifice area it feeds** [E][SP-8089]. Note
that the rule is not a mysterious constant — it is a 1 %-distribution
specification with $C_d^2/2$ in front of it, and if you can tolerate 3 % you can
use a smaller, lighter manifold.

Two practical amplifications:

- **Feed symmetry beats manifold size.** A ring manifold fed from one point has a
  circumferential pressure gradient no area ratio can remove. Two diametrically
  opposed inlets, or four, are how real engines fix this. The F-1's fuel manifold
  and the RS-25's hot-gas manifold are both symmetry exercises first and area
  exercises second.
- **Start transients are a manifold problem.** During priming, the manifold fills
  non-uniformly and orifices near the inlet flow first. If the oxidizer manifold
  primes 20 ms before the fuel manifold, you get an oxidizer-rich pocket at
  ignition, which is the classic hard start. Manifold volume, not just area, is
  therefore a design variable: small manifolds prime fast and repeatably but have
  higher velocity and worse distribution. That trade is why some engines carry
  deliberately restrictive orifices at the manifold inlet.

### 3.4 Injector pressure drop: why 15–25 %

#### The stability argument

The standard number — injector $\Delta p$ between 15 % and 25 % of chamber
pressure — is quoted everywhere and derived almost nowhere [SB][HH][SP-8089].
Here is the derivation, because the assumptions in it tell you when the rule does
not apply.

Model the chamber as a lumped gas volume with mass $m_c = p_c V_c/(R T_c)$, fed by
the injector and drained through a choked throat:

$$\frac{V_c}{R T_c}\frac{dp_c}{dt} = \dot m_{in}(t) - \dot m_{out}(t),
\qquad \dot m_{out} = \frac{p_c A_t}{c^*}$$

Linearise about the operating point with $p' = \delta p_c$. Dividing by
$\partial \dot m_{out}/\partial p_c = A_t/c^*$ and defining the **chamber stay
time**

$$t_s \equiv \frac{V_c \rho_c}{\dot m} = \frac{L^* \rho_c c^*}{p_c}$$

> **Eq. 3.6** — variables: $V_c$ chamber volume (m³); $\rho_c$ chamber gas density
> (kg/m³); $\dot m$ total mass flow (kg/s); $L^*$ characteristic length (m); $c^*$
> characteristic velocity (m/s); $p_c$ chamber pressure (Pa). Meaning: the mean
> time a gas element spends in the chamber, and the time constant with which
> chamber pressure responds to a flow imbalance. Assumes: uniform chamber
> properties, choked throat, ideal gas. Fails when: a large fraction of the
> chamber volume is occupied by liquid and unburned spray, which is exactly the
> case near the injector — $t_s$ is an upper bound on the *gas* residence time.

the chamber equation becomes $t_s \dot p' + p' = (c^*/A_t)\,\dot m'_{in}$.

Now the injector. From Eq. 3.1 with a stiff feed system (manifold pressure held
constant), a rise in $p_c$ reduces $\Delta p$ and hence the injected flow:

$$\frac{\partial \dot m_{in}}{\partial p_c} = -\frac{\dot m}{2\,\Delta p}$$

and the injected mass does not release its heat immediately — it must atomize,
vaporize and react, which takes the **combustion time lag** $\tau$. So the flow
perturbation that matters to the chamber at time $t$ is the one injected at
$t-\tau$. Substituting and defining the loop gain

$$k \equiv \frac{p_c}{2\,\Delta p}$$

gives the delay-differential equation

$$t_s\,\dot p'(t) + p'(t) + k\,p'(t-\tau) = 0$$

> **Eq. 3.7** — variables: $t_s$ stay time (s); $\tau$ combustion time lag (s);
> $k$ dimensionless injector feedback gain (—). Meaning: the chamber is a
> first-order lag closed by a delayed negative feedback through the injector.
> Assumes: single lumped chamber mode (no acoustics — this describes chug, not
> screech), stiff feed system with no line inertance or manifold compliance,
> constant $\tau$, non-cavitating injector. Fails when: feed-line inertance is
> significant (it usually is, and it makes stability *worse*), when the injector
> cavitates ($k\to 0$ and the mode disappears), or when $\tau$ itself responds to
> pressure, which is the Crocco $n$–$\tau$ generalisation covered in module 15.

Note first what happens with $\tau = 0$: the characteristic root is
$s = -(1+k)/t_s$, always stable. **The injector's pressure-drop feedback is
stabilising; it is the time lag that destabilises it.** This is the single most
important sentence in the section.

For neutral stability put $s = i\omega$ in $t_s s + 1 + k e^{-s\tau} = 0$:

$$1 + k\cos\omega\tau = 0, \qquad \omega t_s - k\sin\omega\tau = 0$$

Squaring and adding eliminates the phase:

$$k_{crit} = \sqrt{1 + (\omega t_s)^2}, \qquad \omega\tau = \pi - \arctan(\omega t_s)$$

> **Eq. 3.8** — variables as above; $\omega$ neutral-mode angular frequency
> (rad/s). Meaning: given a chamber stay time and a combustion lag, there is a
> maximum injector feedback gain the loop tolerates; exceed it and the chug mode
> grows. Assumes: everything in Eq. 3.7. Fails when: the feed system contributes
> its own resonance, which adds a second oscillator and can produce a lower
> critical gain at a different frequency.

Stability requires $k < k_{crit}$, i.e.

$$\boxed{\ \frac{\Delta p}{p_c} > \frac{1}{2\sqrt{1+(\omega t_s)^2}}\ }$$

For a representative kerosene booster chamber ($L^*=1.0$ m, $p_c = 100$ bar,
$c^*=1800$ m/s, $\rho_c = 8.2$ kg/m³, so $t_s = 1.48$ ms) the criterion evaluates
as:

| $\tau$ (ms) | chug frequency (Hz) | $k_{crit}$ | required $\Delta p/p_c$ |
|---|---|---|---|
| 0.5 | 560 | 5.30 | 9.4 % |
| 1.0 | 304 | 3.00 | **16.7 %** |
| 1.5 | 216 | 2.24 | **22.3 %** |
| 2.0 | 170 | 1.87 | 26.8 % |

Combustion time lags for storable and kerosene propellants are typically
0.7–1.5 ms, and the predicted chug frequencies of 200–500 Hz are exactly where
chug is observed. **The 15–25 % rule is not a tradition; it is this table for the
$\tau$ values that hydrocarbon and storable propellants actually have** [F][E].
It also tells you when to depart from it:

- **Hydrogen** vaporizes almost on contact and its $\tau$ is a few tenths of a
  millisecond. Hydrogen engines routinely run fuel-side $\Delta p/p_c$ of 10–15 %
  and are fine. The RL10 and other expander-cycle engines exploit this hard,
  because every bar of injector drop is a bar the turbine does not get.
- **Small chambers are the chug-prone ones.** $k_{crit}=\sqrt{1+(\omega t_s)^2}$
  rises with $t_s$, so a large chamber volume acts as a capacitance that absorbs
  flow fluctuations and *tolerates* a lower injector drop, while a short-$L^*$,
  high-$p_c$ chamber demands a higher one. At $\tau = 1.2$ ms, a chamber with
  $t_s = 2.2$ ms needs only 14 %, while one with $t_s = 0.8$ ms needs 28 %. This
  is one of the hidden costs of chasing a small, light chamber.
- **Deep throttling** collapses the margin quadratically: $\Delta p \propto
  \dot m^2$ but $p_c \propto \dot m$, so $\Delta p/p_c \propto \dot m$. A 20 %
  design point becomes 8 % at 40 % thrust and 4 % at 20 % thrust. This is the
  central difficulty of throttling and the reason pintles and dual-manifold
  injectors exist [Casiano10].

#### What the pressure drop costs

Injector $\Delta p$ is paid for twice. In a pump-fed engine it is pump discharge
pressure, and therefore turbine power, and therefore turbine flow that is either
dumped overboard (gas generator) or costs preburner temperature (staged
combustion). The hydraulic power is

$$P = \frac{\dot m\,\Delta p}{\rho\,\eta_p}$$

> **Eq. 3.9** — variables: $P$ shaft power attributable to the injector drop (W);
> $\dot m$ circuit flow (kg/s); $\Delta p$ injector drop (Pa); $\rho$ density
> (kg/m³); $\eta_p$ pump efficiency (—). Meaning: the direct energy cost of the
> injector's hydraulic resistance. Assumes: incompressible pumping, efficiency
> known. Fails when: the circuit is also the regenerative-cooling circuit and the
> jacket drop dominates, which is common — then the injector drop is a modest
> fraction of a much larger number.

For 30 kg/s of RP-1 at 20 bar drop and $\eta_p = 0.70$ this is 106 kW. Against an
F-1-class turbopump at 41 MW that is nothing; against a small pressure-fed engine
where $\Delta p$ is tankage mass, it is everything. In a **pressure-fed** system
the injector drop is added to every tank, every line and every valve, and tank
wall thickness scales with pressure: a 25 % injector drop on a 20 bar chamber
means 5 bar of extra tank pressure across the whole propellant volume. That is
why pressure-fed spacecraft engines sit at the low end of the band, and why the
Aestus runs an 11 bar chamber with a swirl injector that mixes well at low
velocity rather than an impinging one that needs velocity to work.

### 3.5 Atomization

#### The regimes

A round liquid jet issuing into a gas does not simply break up; it breaks up in
one of four qualitatively distinct ways depending on how liquid inertia, surface
tension, viscosity and aerodynamic force compare. The classical map is due to
Ohnesorge and is universally used [F][LM]:

**1. Rayleigh regime.** Low velocity. Surface tension amplifies axisymmetric
disturbances with wavelength $\lambda \approx 4.51 d$; the jet pinches into drops
of diameter about $1.89 d$ — *larger* than the jet. Breakup length increases with
velocity. Useless for rockets, but it is what a dribbling injector does at
ignition and it is why start transients atomize badly.

**2. First wind-induced regime.** Aerodynamic force begins to assist surface
tension. Drop sizes fall to order $d$. Breakup length still increases with
velocity, then peaks.

**3. Second wind-induced regime.** Short-wavelength surface waves, amplified by
the gas, strip drops much smaller than $d$ from the jet surface. Breakup length
now *decreases* with velocity. This is where a moderate-velocity liquid jet in a
low-density chamber gas sits.

**4. Atomization regime.** Breakup begins at or within a few diameters of the
orifice exit; the jet has a dense core surrounded by a spray. Drop sizes are much
smaller than $d$. Every practical rocket injector operates here.

The transitions are set by two groups. The **Weber number** compares the
disrupting aerodynamic force to the restoring surface-tension force,

$$\mathrm{We}_g = \frac{\rho_g V_{rel}^2 d}{\sigma}, \qquad
\mathrm{We}_l = \frac{\rho_l V^2 d}{\sigma}$$

> **Eq. 3.10** — variables: $\rho_g$, $\rho_l$ gas and liquid density (kg/m³);
> $V_{rel}$ relative velocity between jet and gas (m/s); $V$ jet velocity (m/s);
> $d$ jet diameter (m); $\sigma$ surface tension (N/m). Meaning: how hard the gas
> is pulling the surface apart relative to how hard surface tension is holding it
> together. Assumes: a defined characteristic length (jet diameter, sheet
> thickness, or drop diameter — say which); constant $\sigma$. Fails when: the
> chamber is near or above the propellant's critical pressure, where $\sigma \to
> 0$ and the whole framework collapses into turbulent mixing of two supercritical
> fluids — the regime in which a LOX post in a 200+ bar staged-combustion chamber
> actually operates [LRTC].

and the **Ohnesorge number** collapses the liquid's own viscosity into a single
group:

$$\mathrm{Oh} = \frac{\mu_l}{\sqrt{\rho_l \sigma d}} = \frac{\sqrt{\mathrm{We}_l}}{\mathrm{Re}}$$

> **Eq. 3.11** — variables: $\mu_l$ liquid dynamic viscosity (Pa·s); others as
> above. Meaning: viscous damping of surface waves relative to the surface-tension
> restoring force; large $\mathrm{Oh}$ means the liquid resists being broken up
> and produces ligaments rather than drops. Assumes: Newtonian liquid. Fails
> when: gelled or slurried propellants (non-Newtonian) are used, where an
> effective viscosity must be defined at the relevant shear rate.

Because $\mathrm{Oh}$ is $\sqrt{\mathrm{We}_l}/\mathrm{Re}$, plotting
$\mathrm{Oh}$ against $\mathrm{Re}$ is the same information as plotting
$\mathrm{We}$ against $\mathrm{Re}$, and the four regimes appear as bands running
diagonally across the $\mathrm{Oh}$–$\mathrm{Re}$ plane. The **Ohnesorge chart**
(reproduced in [LM] and in essentially every atomization text) has boundaries
that are conventionally drawn as:

| boundary | approximate criterion |
|---|---|
| Rayleigh → first wind-induced | $\mathrm{We}_g \approx 0.4$ |
| first → second wind-induced | $\mathrm{We}_g \approx 13$ |
| second wind-induced → atomization | $\mathrm{We}_g \approx 40.3$ |

These are gas-Weber criteria, and the reason a rocket injector is always in the
atomization regime is not the jet velocity — it is $\rho_g$. Chamber gas at 100
bar and 3500 K has a density of about 8 kg/m³, seven times ambient air. A
50 m/s kerosene jet that would sit in the second wind-induced regime on a bench
in air is deep in the atomization regime the moment the chamber comes up to
pressure [F]. Which also tells you that a cold-flow test in atmospheric air is
*not* a simulation of atomization; it is a simulation of distribution and mixing
only. That distinction is the whole reason Rupe's cold-flow programme measured
mixing rather than drop size (§3.7).

#### Sheets, not jets: impinging elements

When two jets collide they do not atomize as jets. They form a thin liquid
**sheet** in the plane perpendicular to the plane of the two jets, and the sheet
is what breaks up. The mechanism is the Squire/Dombrowski aerodynamic
instability: the sheet is a free liquid film with gas on both sides, sinuous
waves grow on it, the sheet disintegrates into **ligaments** spaced at the
dominant wavelength, and the ligaments break by Rayleigh instability into drops
of about 1.9 times the ligament diameter [F][LM].

The consequences are specific and testable:

- Drop size is set by **sheet thickness**, which is set by orifice diameter,
  impingement angle and the distance from impingement point to breakup — not
  directly by orifice diameter alone.
- The sheet has a **preferred plane**. An unlike doublet's spray fan is
  perpendicular to the plane containing the two orifice axes. Rotate the doublet
  and you rotate the fan. This is exactly how designers steer mass flux around
  the face and away from the wall, and it is why injector drawings specify hole
  *orientation* as carefully as hole position.
- Increasing velocity thins the sheet and shortens the breakup length, so SMD
  falls roughly as $V^{-0.7}$ to $V^{-1}$ across the practical range [E].
- Impingement must actually occur. Manufacturing tolerance on hole angle of a
  fraction of a degree translates into a miss at the impingement point of
  hundreds of micrometres over a 5–10 mm free jet length. A missed impingement
  is two unatomized jets travelling downstream, and that is a wall-streak
  mechanism (§7).

#### SMD correlations

The spray is characterised by the **Sauter mean diameter**, the drop diameter
with the same volume-to-surface-area ratio as the whole spray, because
evaporation rate is controlled by surface area per unit volume:

$$D_{32} = \frac{\sum_i n_i d_i^3}{\sum_i n_i d_i^2}$$

> **Eq. 3.12** — variables: $n_i$ number of drops in size class $i$; $d_i$ class
> diameter (m). Meaning: the single diameter that reproduces the spray's
> evaporation-relevant surface area. Assumes: the drop-size distribution is
> known. Fails when: the spray is strongly bimodal (common for impinging
> elements: a fine spray plus a coarse core), in which case a single SMD hides
> the very population that determines whether combustion completes.

Two families of correlation are in common use, and both should be regarded as
calibration curves with fitted constants, not as physics [E]:

**Jet-in-gas (Ingebo type).** For a liquid jet atomized by a high-velocity gas
stream, the customary form compiled in [LM] is

$$\frac{D_{30}}{d} = \frac{C}{(\mathrm{We}_g\,\mathrm{Re}_l)^{1/4}}$$

with $C$ of order 5. Be honest about the status of this: the constant and both
exponents vary between Ingebo's several NACA reports and between later
reanalyses, and the correlation was fitted to jets in cold high-speed air, not to
kerosene in 3500 K combustion gas. Use it to get an order of magnitude and a
scaling law — $D \propto d^{1/2} V^{-3/4} \rho_g^{-1/4}$ — and then measure.

**Prefilming and airblast (Lefebvre type).** For elements in which a liquid film
is sheared by a much faster gas — shear coaxial elements above all — Lefebvre's
airblast correlations have the structure

$$\mathrm{SMD} = A\,d_h\left(\frac{\sigma}{\rho_g U_R^2 d_h}\right)^{a}
\left(\frac{\rho_l}{\rho_g}\right)^{b}\left(1+\frac{1}{\mathrm{ALR}}\right)^{c}
\; + \; B\,d_h\left(\frac{\mu_l^2}{\sigma\rho_l d_h}\right)^{1/2}
\left(1+\frac{1}{\mathrm{ALR}}\right)^{c}$$

> **Eq. 3.13** — variables: $d_h$ characteristic dimension of the atomizer (film
> thickness or annulus gap, m); $U_R$ gas–liquid relative velocity (m/s);
> $\mathrm{ALR}$ gas-to-liquid mass flow ratio (—); $A$, $B$, $a$, $b$, $c$
> fitted constants ($a \approx 0.4$–$0.6$, $b \approx 0.1$, $c \approx 0.4$–$1$).
> Meaning: the first term is the surface-tension-limited size, the second is the
> viscosity-limited size; whichever is larger controls. Assumes: a prefilming or
> annular geometry with a genuine gas stream doing the work. Fails when: applied
> to an impinging element (there is no ALR), or at rocket chamber densities far
> outside the gas-turbine data on which it was fitted [LM].

The engineering reading of both: **SMD falls with relative velocity and with gas
density, and rises with surface tension, viscosity and orifice size.** Every lever
you have is in that sentence.

Representative rocket sprays land at $\mathrm{SMD} = 50$–$300\ \mu$m. That range
is worth memorising, because it is the input to the only calculation in this
section that has real consequences.

### 3.6 Vaporization, and the link to $L^*$

A drop in hot gas heats, then evaporates with its surface at the boiling point.
The quasi-steady spherically symmetric solution gives the **$d^2$ law**:

$$d^2(t) = d_0^2 - K_v t, \qquad K_v = \frac{8 k_g}{\rho_l c_{p,g}}\ln(1+B)$$

> **Eq. 3.14** — variables: $d_0$ initial drop diameter (m); $K_v$ evaporation
> constant (m²/s); $k_g$ gas thermal conductivity in the film (W/m·K); $c_{p,g}$
> gas specific heat in the film (J/kg·K); $\rho_l$ liquid density (kg/m³); $B$
> Spalding transfer number (—). Meaning: drop *area* falls linearly with time, so
> lifetime scales as $d_0^2$. Assumes: quasi-steady, spherically symmetric,
> stagnant surroundings, constant properties, no droplet interaction, no
> combustion at the drop surface. Fails when: drops are close enough to shield
> one another (dense spray near the injector — real lifetimes are longer than
> this predicts), when the drop is in supercritical surroundings (no surface
> exists), or when convection is significant, which it always is.

Convection is corrected for with the Ranz–Marshall factor:

$$K_{v,\mathrm{eff}} = K_v\left(1 + 0.3\,\mathrm{Re}_d^{1/2}\mathrm{Pr}^{1/3}\right)$$

> **Eq. 3.15** — variables: $\mathrm{Re}_d = \rho_g V_{rel} d/\mu_g$ droplet
> Reynolds number (—); $\mathrm{Pr}$ gas Prandtl number (—). Meaning: relative
> motion thins the diffusion film around the drop and speeds evaporation, by up
> to an order of magnitude in a rocket chamber. Assumes: $\mathrm{Re}_d < 10^4$,
> no drop deformation. Fails when: $\mathrm{We}_g$ on the *droplet* exceeds about
> 12, in which case the drop shatters rather than evaporating — secondary
> breakup, which is a different and faster process.

Now put it together, and this is the point of the whole module. The drop lifetime
is $t_v = d_0^2/K_{v,\mathrm{eff}}$. The chamber offers a stay time $t_s =
L^*\rho_c c^*/p_c$ (Eq. 3.6). Complete combustion requires

$$t_v \lesssim t_s \quad\Longrightarrow\quad
L^* \gtrsim \frac{p_c\,d_0^2}{\rho_c c^* K_{v,\mathrm{eff}}}$$

> **Eq. 3.16** — variables as above. Meaning: **$L^*$ is an atomization
> requirement wearing a geometric disguise.** The tabulated $L^*$ values in module
> 06 — 0.8–1.3 m for LOX/RP-1, 0.6–0.9 m for LOX/LH2, 0.5–0.8 m for storables —
> are the historical record of what SMD the injectors of the era achieved.
> Assumes: vaporization is rate-controlling, not mixing or chemical kinetics.
> Fails when: mixing is the slow step (poorly designed unlike-impinging patterns,
> or any element with badly matched momenta), or when the propellant is gaseous
> at injection, in which case there is no $d^2$ law at all and $L^*$ can be far
> smaller.

That relation explains a set of facts that otherwise look like folklore [F]:

- **Hydrogen engines have small $L^*$** because hydrogen is injected as a gas or
  near-critical fluid and needs no vaporization time; only the LOX must vaporize,
  and the shear-coaxial element gives it a very high relative velocity.
- **Storable engines have small $L^*$** because hypergolic ignition is
  liquid-phase and does not wait for full vaporization.
- **Kerosene engines have large $L^*$** because RP-1 is a heavy, low-volatility,
  relatively viscous multicomponent fuel whose lightest fractions boil off first
  and leave a slower-evaporating residue.
- **Doubling SMD quadruples the required $L^*$.** A modest atomization
  improvement is worth a large chamber-mass saving, which is the entire business
  case for spending a year on injector development.

### 3.7 Mixing

#### What mixing means and how it is measured

Atomization makes drops. Mixing decides whether an oxidizer drop and a fuel drop
end up in the same place. The two are separable, and Rupe's contribution was
demonstrating that the second can be measured **cold**, without combustion, and
that the cold measurement predicts the hot performance [Rupe65].

Rupe's apparatus collected the spray from an element in a grid of small tubes and
measured, in each cell $i$, the mass fraction of one propellant simulant,
$r_i = \dot m_{o,i}/(\dot m_{o,i}+\dot m_{f,i})$, against the overall value
$\bar r$. The **mixing efficiency** is

$$E_m = 100\left(1 - \sum_{r_i > \bar r} w_i\,\frac{r_i-\bar r}{\bar r}
- \sum_{r_i < \bar r} w_i\,\frac{\bar r - r_i}{1-\bar r}\right)$$

> **Eq. 3.17** — variables: $r_i$ collected mass fraction of the reference
> propellant in cell $i$ (—); $\bar r$ overall mass fraction (—); $w_i$ cell $i$'s
> fraction of the total collected mass (—). Meaning: a mass-weighted measure of
> how far the local mixture ratio departs from the intended one, normalised so
> that perfect uniformity is 100 % and complete segregation is 0 %. Assumes:
> non-reacting simulants with matched density and viscosity ratios; the
> collection plane is representative. Fails when: the real propellants have
> vaporization rates so different that gas-phase mixing dominates, which is the
> hydrogen case — $E_m$ is a poor predictor for shear-coaxial LOX/LH2 elements and
> a good one for impinging storable and kerosene elements.

Typical values: a well-designed unlike doublet reaches $E_m = 75$–$85$ %, and the
empirical link to performance is roughly $\eta_{c^*} \approx 0.95$–$0.99$ over
that range, rising steeply below $E_m \approx 70$ % [E][SP-8089]. Getting the last
two points of $\eta_{c^*}$ out of an injector is almost always a mixing problem,
not an atomization problem.

#### Rupe's momentum criterion

For an unlike doublet, the two jets collide and the resultant sheet goes wherever
the vector sum of the two momenta points. If one stream dominates, it punches
through and carries the other with it: the sheet is deflected, mass flux ends up
where it was not wanted, and the mixture ratio is stratified across the fan. Rupe
correlated $E_m$ against a momentum-balance parameter and found the peak near
unity of

$$R_u = \frac{\rho_o V_o^2 d_o}{\rho_f V_f^2 d_f}$$

> **Eq. 3.18** — variables: $\rho$, $V$, $d$ density, jet velocity and orifice
> diameter of the oxidizer and fuel streams (SI). Meaning: the ratio of the two
> streams' momentum fluxes weighted by their diameters — equivalently
> $\mathrm{TMR}\times(d_f/d_o)$ — with best mixing near $R_u = 1$. Assumes: equal
> impingement angles about the element axis, free jets that actually meet, and a
> non-cavitating discharge so that the jet fills the bore. Fails when: the
> impingement is asymmetric by design, when either orifice is cavitating (the
> effective jet diameter is $\sqrt{C_c}\,d$, not $d$), or for like-on-like
> doublets, where mixing is not an element-level phenomenon at all (§3.8).

The closely related **total momentum ratio**, $\mathrm{TMR} = \dot m_o V_o/(\dot
m_f V_f)$, is what most shops actually work in; it differs from $R_u$ by the
diameter ratio and is the natural variable for pintles (§3.10). Both express the
same requirement: **the two streams must arrive at the impingement point with
comparable momentum, or one will dominate the other.** Where designers disagree is
the target value — Rupe's data peak near 1 for the diameter-weighted form, while
plenty of successful hardware runs TMR of 1.5–2.5 deliberately, biasing the
resultant to steer mass flux inboard, away from the wall [J]. Worked example 3
shows what this costs.

#### Distribution, stratification and the wall

Uniform mixture ratio across the whole face is *not* the design goal. Two
deliberate departures are universal [M]:

- **Fuel-rich outer ring.** The outermost element row is biased fuel-rich — by
  giving it a larger fuel orifice, by canting its fuel jets outward, or by adding
  a separate ring of pure fuel film-cooling orifices firing along the wall. The
  cost is real: the fuel that cools the wall is fuel that does not burn at the
  design mixture ratio, and a heavy film-cooling budget costs 1–3 % of $I_{sp}$.
  The R-4D and the Marquardt R-40 both pay this explicitly, with the R-4D's
  original film-cooling penalty called out in the record as a major limitation.
- **Radial mass-flux profile.** The core is often run slightly leaner or richer
  than nominal to place the peak heat release where the chamber can survive it,
  and to keep the mean mixture ratio at the throat on target after the
  boundary-layer fuel is accounted for.

The mass-flux distribution across the face is measured on a **patternator** — a
grid of collection tubes under a cold-flowing injector — and the acceptance
criterion is usually stated as a maximum local deviation from the intended
profile rather than a global uniformity number. Streaking, the failure mode in
§7, is a distribution failure, not a mixing failure, and it is found on the
patternator long before it is found on a chamber wall.

### 3.8 Element types: the impinging family

All sketches below are schematic sections through the injector face; flow is left
to right (or top to bottom where marked). O denotes an oxidizer orifice, F a fuel
orifice.

#### Showerhead

```
   manifold
   ========================
     |    |    |    |    |        parallel non-impinging jets
     v    v    v    v    v
   ---O----F----O----F----   <- injector face
      :    :    :    :
      :    :    :    :        no impingement; mixing by turbulent
      v    v    v    v        entrainment only, over a long distance
```

The simplest possible pattern: straight axial holes, no impingement. Mixing
depends entirely on turbulent entrainment between adjacent streams, which is
slow. The V-2's American successors abandoned it immediately, and it survives
only where mixing is not the problem: gas-side injection, some gas generators,
and igniters. **It is also the most stable pattern there is** [H][SP-8089], for
the same reason it performs badly — the heat release is spread over a long axial
distance, so no single region of the chamber can drive an acoustic mode.
Showerhead is the reference case: everything else trades some of that stability
for mixing.

#### Like-on-like (self-impinging) doublet

```
   O     O                    F     F
    \   /                      \   /
     \ /                        \ /
      X   <- fuel-free            X   <- oxidizer-free
     / \      impingement        / \      impingement
    /   \                       /   \
   fan of O drops              fan of F drops
        \                        /
         \                      /
          `--- mix downstream --'
```

Two orifices of the **same** propellant impinge on each other. The element itself
does no inter-propellant mixing at all; it atomizes one propellant into a fan, and
mixing happens between adjacent fans further downstream. This sounds like a
disadvantage and is in fact the reason the pattern is used: because the two
propellants never meet at the injector face, there is no reactive stream
separation, no hypergolic reaction blowing the streams apart, and the heat release
is pushed downstream where it couples less strongly to the acoustic modes. The
F-1 used like-doublets in its pattern, and the Atlas LR-89 used a like-on-like
doublet face [H]. The cost is $\eta_{c^*}$: like-doublets need a longer chamber
and more careful fan-to-fan spacing to reach the same performance as unlike
elements.

#### Unlike-impinging doublet

```
       O         F
        \       /
         \     /
          \   /            impingement angle 2-theta,
           \ /             typically 2-theta = 60 deg
            X              free jet length L_j = 5-8 d
           / \
        spray fan (perpendicular to the page)
```

The workhorse. One oxidizer and one fuel jet collide, form a sheet, and atomize
and mix in a single event. Highest mixing efficiency per element of the impinging
family, and the pattern used on the Titan LR87 and LR91, the Apollo SPS, the
Shuttle OMS AJ10-190, and the R-4D and R-40 RCS thrusters — that is, on almost
every storable-propellant engine ever flown [H][M]. Design variables:
impingement half-angle $\theta$ (typically 25–35°), free jet length (5–8 orifice
diameters — shorter and the jets have not settled, longer and manufacturing
angular tolerance causes misses), and the momentum balance of Eq. 3.18.

The failure mode specific to unlike doublets with hypergolic propellants is
**reactive stream separation**: the propellants react on contact so vigorously
that the gas generated at the impingement point blows the two liquid streams
apart before they can mix. It appears at low chamber pressure and low injection
velocity — that is, at low thrust and during start — and it produces exactly the
performance loss you would expect. It is one reason hypergolic thrusters have a
minimum reliable pulse width.

#### Unlike triplet: F-O-F and O-F-O

```
      F        O        F
       \       |       /
        \      |      /
         \     |     /       two outer jets impinge on one
          \    |    /        central jet; the resultant is
           \   |   /         axial by symmetry
            \  |  /
             \ | /
              \|/
               X
               |
          axial spray fan
```

Two outer jets of one propellant impinge on a single central jet of the other.
The symmetry is the point: the transverse momentum of the two outer jets cancels,
so the resultant is axial regardless of the momentum balance, which makes the
element far less sensitive to flow variation and to throttling than a doublet.
The XLR43 that led to the Atlas lineage used **F-O-F** — two fuel streams onto one
LOX stream — and that pattern is the ancestor of every American impinging injector
through the F-1 [H]. The Titan family used unlike doublets instead.

Choosing F-O-F versus O-F-O is not arbitrary. Worked example 3 shows that at
LOX/RP-1 mixture ratios with equal pressure drop on both circuits, it is the
*oxidizer* stream that carries excess momentum, so **O-F-O** is the arrangement
that balances naturally. F-O-F was nevertheless chosen historically for two
reasons that outrank Rupe balance [J]: the locally fuel-rich element is thermally
forgiving, and the central oxidizer jet is shielded from the wall by fuel on both
sides. The engineering lesson is that the momentum criterion is one of several
constraints, and it is routinely the one that loses.

#### Quadlets and pentads

```
   quadlet (2 O on 2 F)            pentad (4 F around 1 O)

      O   F                          F   F
       \ /                            \ /
        X       <- one impingement     O   <- one central jet,
       / \         point                / \    four impinging on it
      F   O                          F   F
```

More orifices per impingement point: quadlets (two of each), pentads (four of one
around one of the other), and hexads. The gain is finer-scale interleaving of the
two propellants and therefore better mixing at a given orifice size; the cost is
hole count, drilling accuracy, and sensitivity to a single blocked orifice. The
pentad is the classic high-performance LOX/hydrocarbon element where the central
orifice carries the *oxidizer* and four fuel jets impinge on it, and it is
favoured where $\eta_{c^*}$ matters more than manufacturing simplicity
[SP-8089][H].

#### Splash plate

```
       O       F
        \     /
         \   /
   -------\ /-------
           V             <- both streams strike a small plate
      ===========           and are deflected into a sheet
       |||||||||
       spray sheet
```

Both streams are aimed at a small plate rather than at each other. The plate
turns two jets into a sheet mechanically, so atomization no longer depends on the
jets meeting precisely — which makes the element remarkably tolerant of
manufacturing error and of flow variation. It also gives up some mixing
efficiency and adds a small piece of hardware sitting in the flame that must
survive. Splash plates appear in [SP-8089] as a recognised element class and are
used where robustness beats peak performance.

### 3.9 The coaxial family

#### Shear coaxial

```
   section through one element (flow left to right)

   ============================================
      fuel (gas) annulus  ->->->->->->->->->
   ----------------------------\
      LOX post (liquid)  ->        \____  post tip
   ----------------------------/    :     recess L_r
      fuel (gas) annulus  ->->->->->:->->->
   ============================================
                                    |<-->|
                                    recess
```

A central post carries the liquid oxidizer; an annulus around it carries the fuel,
which for LOX/LH2 is a low-density gas moving 10–20 times faster. The gas shears
the liquid column, strips a film off it, and atomizes it — this is a
prefilming-airblast atomizer in a rocket, and Lefebvre's correlations (Eq. 3.13)
are the right family for it. The J-2's 614 concentric posts through a porous
faceplate is the archetype, and essentially every LOX/LH2 injector since is a
variation on it: the RS-25 (600 elements), the RL10, Vulcain, the RD-0120, LE-7A
[H][M].

The two design groups are the **velocity ratio** and the **momentum flux ratio**:

$$\mathrm{VR} = \frac{V_g}{V_l}, \qquad J = \frac{\rho_g V_g^2}{\rho_l V_l^2}$$

> **Eq. 3.19** — variables: $V_g$, $V_l$ gas-annulus and liquid-post exit
> velocities (m/s); $\rho_g$, $\rho_l$ the corresponding densities (kg/m³).
> Meaning: VR governs the shear that strips the liquid; $J$ governs whether the
> gas stream can actually penetrate and disrupt the liquid core rather than just
> flowing past it. Assumes: both streams are at their design flows and the
> annulus is concentric. Fails when: the propellant is injected supercritically
> (LOX at 200+ bar), where the density ratio is small, surface tension is
> negligible, and the element behaves as a variable-density turbulent mixing
> layer rather than as an atomizer [LRTC].

Typical design values for LOX/LH2: $\mathrm{VR} = 10$–$20$, $J = 1$–$10$.
Performance rises with both and then saturates; below $J \approx 1$ the gas
cannot disrupt the core and $\eta_{c^*}$ falls off sharply [E].

**Recess** — setting the LOX post tip back behind the face by 0–2 post diameters
— starts the shear interaction inside a small confined cup, which improves mixing
and, more importantly, improves stability by moving heat release off the face and
by decoupling the element from the transverse acoustic field. It costs face
heating and post thermal stress, and a recessed post is a post whose tip is
directly exposed to recirculating hot gas.

Shear coaxial elements are the only common element type that gets atomization
essentially free from the propellant combination itself. That is why hydrogen
engines have small $L^*$ and high $\eta_{c^*}$ and comparatively easy injector
development, and why the same architecture applied to LOX/kerosene — where the
fuel is a *liquid* and there is no high-velocity gas — performs badly.

#### Swirl coaxial

```
   section through one swirl element

   ============================================
     tangential inlets
        \     |
         v    v
      +--------------+
      |   swirl      |            hollow conical sheet
      |   chamber     \___         emerging at half-angle alpha
      |                    \___
      +---------------+        \___
                                    \__ 
   ============================================
                       gas core on the axis
```

Liquid enters a small cylindrical chamber through tangential ports, spins up, and
leaves through a central exit as a **hollow conical sheet** with a gas core on the
axis. The sheet thins as it expands, becomes unstable, and breaks into a fine
spray at a wide cone angle. Swirl elements atomize well at low injection velocity
and low pressure drop, which is exactly what a low-$p_c$ pressure-fed engine
needs.

The classical ideal-swirl theory (Abramovich's maximum-flow principle, developed
for rocket use in the Soviet school and presented for a modern audience in
[LRTC] — note that this course's bibliography flags the specific chapter
attribution as unverified, so cite the chapter you actually hold) reduces the
element to one geometric group:

$$A_s = \frac{R_n R_{in}}{n\,r_{in}^2}$$

> **Eq. 3.20** — variables: $R_n$ exit-orifice radius (m); $R_{in}$ radius from the
> element axis to the centre of the tangential inlet ports (m); $n$ number of
> tangential ports (—); $r_{in}$ tangential port radius (m). Meaning: the ratio of
> angular momentum supplied to axial throughflow, and the single parameter that
> fixes the ideal element's discharge coefficient, filling coefficient and cone
> angle. Assumes: inviscid liquid, no boundary layer in the swirl chamber, exit
> flow at maximum discharge for the given angular momentum. Fails when: viscosity
> matters (small elements, viscous fuels), where the effective $A_s$ must be
> corrected downward; and at very low $\Delta p$, where the gas core may not form
> at all.

With filling coefficient $\varphi$ (the liquid-occupied fraction of the exit area,
the rest being gas core), ideal theory gives the pair

$$A_s = \frac{(1-\varphi)\sqrt{2}}{\varphi\sqrt{\varphi}}, \qquad
C_d = \sqrt{\frac{\varphi^3}{2-\varphi}}$$

> **Eq. 3.21** — variables as above. Meaning: a strongly swirling element has a
> large gas core, a small liquid-occupied area, and therefore an intrinsically
> low $C_d$ — a swirl element with $A_s = 2$ has $\varphi = 0.5$ and $C_d = 0.29$,
> about a third of a plain orifice's. Assumes: inviscid ideal swirl. Fails when:
> viscous losses in the swirl chamber are significant, which raises $C_d$ above
> ideal in small hardware.

That low $C_d$ is the swirl element's price and its virtue at once: for the same
$\Delta p$ it needs a much larger exit area, so its orifices are big, tolerant of
contamination, and easy to make — and it atomizes them anyway.

Swirl coaxial elements — a swirled liquid oxidizer sheet inside a swirled or
axial fuel annulus — are the Soviet and Russian standard: RD-107/108, RD-253,
RD-170/171, RD-180, RD-191 all use coaxial swirl elements [H][M]. The Aestus
upper-stage engine uses 132 coaxial swirl elements to reach 324 s at only 11 bar
chamber pressure, which is a clean demonstration that a swirl injector mixes well
without the velocity a low-$p_c$ engine cannot afford. SpaceX states that Raptor
uses coaxial swirl elements from Raptor 2 onward — a company claim, like every
Raptor figure.

### 3.10 The pintle

```
   section, flow left to right; the pintle is on the engine axis

              annular AXIAL sheet (propellant 1)
   =====================>>>>>>>>>>>>>>>>>>>>>>>>
                                |
       manifold 2   ------------+---+
                                |   |  <- pintle post
                    ~~~~~~~~~~~~+   |
                     RADIAL jets ->  |======  pintle tip
                    ~~~~~~~~~~~~+   |
                                |   |
   =====================>>>>>>>>>>>>>>>>>>>>>>>>
              annular AXIAL sheet (propellant 1)

                        |<-- L_sk -->|
                         skip distance
```

One propellant leaves an annular gap around a central post as an **axial sheet**;
the other leaves radial orifices in the post as a ring of **radial jets** that
punch through the axial sheet. The collision is a single, continuous, annular
event rather than a hundred discrete ones. This is Gerard Elverum's TRW invention
of the early 1960s, flown on the Apollo Lunar Module descent engine and, six
decades later, on the Merlin [Dressler00].

Three properties follow from the geometry [F][E]:

**Throttling.** Make the annular gap variable — a moving sleeve on the pintle —
and the injection area tracks the flow, so $\Delta p$ and injection velocity stay
roughly constant as thrust falls. The square-law collapse of §3.4 is defeated by
construction. The LMDE throttled 10:1, from 46.7 kN down to 4.67 kN, with chamber
pressure falling from 110 psia to 11 psia, and the variable-area pintle is *the*
reason that was possible. Merlin throttles 40–100 % on a fixed-area pintle, which
is the easier problem.

**Stability.** Pintle engines have an exceptional high-frequency stability record.
The usual explanation is that there is no azimuthal array of identical elements
for a transverse acoustic mode to couple to, that the heat release is distributed
over a comparatively long axial distance, and that the single element cannot
support the element-to-element phase relationships a spinning tangential mode
needs [Dressler00][J]. Note that this is a strong empirical record with a
plausible physical story, not a proof — and pintles are not immune to chug, which
is a feed-system phenomenon and does not care how many elements you have.

**Mixing is set by TMR and blockage.** The controlling parameter is the total
momentum ratio of the radial to the axial stream,

$$\mathrm{TMR} = \frac{\dot m_{rad} V_{rad}}{\dot m_{ax} V_{ax}}$$

> **Eq. 3.22** — variables: $\dot m$ mass flow (kg/s) and $V$ injection velocity
> (m/s) of the radial and axial streams. Meaning: TMR sets how deeply the radial
> jets penetrate the axial sheet and therefore the angle of the resulting
> combined spray cone; TMR near 1 puts the spray at roughly 45° and is the usual
> design region. Assumes: both streams' velocities computed consistently (see the
> $C_c$ warning under Eq. 3.2). Fails when: the blockage factor is so low that the
> radial jets are discrete and the sheet leaks between them, or so high that the
> radial flow becomes a sheet itself and the penetration model changes.

together with the **blockage factor** (fraction of the pintle circumference
occupied by radial orifices, typically 0.3–0.7) and the **skip distance** (axial
gap between the radial orifice row and the pintle tip, which sets how long the
combined spray is confined before it expands).

The pintle's costs are real and are usually understated by its advocates [J]:
$\eta_{c^*}$ is typically a point or two below a well-developed multi-element
face, because the mixing is coarse — a single element cannot interleave the
propellants on a millimetre scale. It puts a hot, mechanically loaded, sometimes
moving part on the engine axis. And the spray cone impinges on the chamber wall
at a defined station, which must be managed with film cooling or with the
combustion-zone geometry. Its compensations — one element to develop instead of
a thousand, deep throttling, stability, and a face that is largely just structure
— are why it dominates landers and why SpaceX built a launch business on it.

### 3.11 Protecting the face and the wall

The injector face is in the worst thermal position in the engine: a stagnation
region of recirculating combustion gas, with no coolant on the other side except
the propellant manifolds, and no velocity to thin its boundary layer. Four
mechanisms are used, usually in combination [M][SP-8089]:

- **Porous (transpiration-cooled) faceplates.** A sintered wire-mesh or sintered
  powder plate — Rigimesh is the trade name most often quoted — through which a
  small fraction of the fuel bleeds uniformly, forming a cool film over the entire
  face. The J-2 used a porous sintered stainless-steel faceplate cooled by
  hydrogen, and the architecture carried into its staged-combustion successors.
  The cost is a fuel flow that does not participate in combustion at the design
  mixture ratio, plus a plate that will clog if the fuel is not filtered
  scrupulously.
- **Face film-cooling orifices.** Discrete small holes drilled through the face,
  usually fuel, aimed to spread along it. Cruder than a porous plate, far easier
  to make, and repairable.
- **Element recess.** Setting the element exit back from the face moves the
  ignition point downstream and lets the element's own flow cool the recess.
- **Wall film-cooling ring.** The outermost row, aimed at the chamber wall
  (module 11 treats this properly). The R-40 and R-4D both carry explicit
  film-cooling rings, and both pay for them in $I_{sp}$.

**Baffles** are radial and circumferential blades standing 20–75 mm proud of the
face, dividing it into compartments. They do not improve mixing; they exist to
break the transverse acoustic modes by interrupting the azimuthal path a spinning
wave needs and by damping through vortex shedding at their tips
[SP-8113][SP-194]. The F-1's answer was a copper baffle assembly dividing the
face into 13 compartments, arrived at after 15 baffle designs, and stability was
demonstrated by detonating a bomb near the injector centre at full thrust and
requiring the engine to damp the induced oscillation within 45 ms [OY93]. The
costs: the baffles are hardware in the flame that must be cooled (hence copper,
and hence fuel passages inside them), they displace elements and so cost
performance, and they are a fatigue item.

**Acoustic cavities** — Helmholtz resonators or quarter-wave slots cut into the
injector face periphery — are the alternative, and increasingly the preference,
because they add no obstruction to the flow. The RS-25's injector face carries
acoustic-resonator cavities for exactly this purpose. Sizing and tuning are in
[SP-8113] and module 15.

### 3.12 Injector–stability coupling (preview)

Module 15 treats instability properly. What matters here is that the injector is
the actuator in all three of the classical instability bands, and that the three
are *different problems requiring opposite fixes* [F]:

| band | frequency | mechanism | injector's role | fix |
|---|---|---|---|---|
| **Chug** | 50–500 Hz | feed-system/chamber coupling through the injector resistance and the combustion time lag | $\Delta p/p_c$ is the loop gain (§3.4) | raise $\Delta p$; cavitating venturis; stiffen or detune the feed line |
| **Buzz / intermediate** | 400–1000 Hz | manifold and dome acoustics coupling to combustion | manifold volume and its acoustic modes | change manifold volume; add manifold resistance |
| **Screech / high-frequency** | 1000–10 000 Hz | chamber acoustic modes coupled to the atomization and vaporization response | element type, spacing, recess, and where the heat release sits | baffles, acoustic cavities, change element pattern, recess posts, move heat release downstream |

The trap is that the fixes conflict. Raising $\Delta p$ helps chug and does very
little for screech. Making the injector mix faster — moving heat release toward
the face — raises $\eta_{c^*}$ and makes screech *worse*, because it puts the
heat release where the transverse acoustic pressure amplitude is largest. This is
the fundamental performance-versus-stability trade of injector design, and it is
why the F-1's final pattern was a deliberately compromised performer [OY93].

### 3.13 Element count and scaling

Element size is bounded from below by manufacturing and contamination (orifices
below about 0.5 mm are difficult to make repeatably and easy to block) and from
above by atomization (SMD grows with $d$) and by mixing scale. In practice
orifice diameters cluster between 0.5 and 2.5 mm, and element count follows from
the flow:

$$N = \frac{\dot m}{\rho\,V\,A_{or}} = \frac{\dot m}{C_d\,A_{or}\sqrt{2\rho\Delta p}}$$

> **Eq. 3.23** — variables as in Eq. 3.1, with $N$ the number of orifices in that
> circuit. Meaning: once you have fixed $\Delta p$ (from stability) and orifice
> diameter (from atomization and manufacturing), element count is not a free
> choice — it is determined. Assumes: identical orifices. Fails when: the pattern
> deliberately uses several orifice sizes, which most real injectors do.

Element **density** on the face, $n_A$, is bounded by the face area available,
which is set by the contraction ratio $\varepsilon_c$ from module 06. Typical
values are 1–10 elements per cm² of face. Too dense and adjacent elements
interfere, the face cannot be cooled, and there is no room for manifold feed
passages; too sparse and there are cold unmixed regions between element sprays.

The range is enormous. The F-1's face carries on the order of a thousand orifices
of each propellant in a mixed doublet-and-triplet pattern; the RS-25 has 600
coaxial elements and the J-2 had 614; the Aestus has 132 swirl elements; a Merlin
has **one**. That last comparison is the most useful thing in this section: the
pintle replaces a thousand small mixing events with one large one, trading mixing
fineness — and therefore a point or two of $\eta_{c^*}$ — for the elimination of
element-to-element variation, of azimuthal acoustic coupling, and of most of the
manufacturing problem. Whether that is a good trade depends entirely on whether
your engine is throttled and how many of them you intend to build.

### 3.14 Manufacturing

The manufacturing process is not a downstream detail; it bounds what patterns are
possible [M][GradlAM].

- **Drilled plates.** Conventional gun-drilling or twist-drilling of a forged or
  machined plate, usually stainless steel, Inconel 718, or a copper alloy for the
  face. Cheap, well understood, and limited to straight holes at achievable
  angles with achievable $L/D$. Burrs and drill breakout at the face are the
  quality problem; the fix is deburring and inlet radiusing, which is the same
  operation that fixes $C_d$ scatter (§3.2).
- **EDM.** Electrical discharge machining cuts small, steeply angled, or shaped
  orifices that a drill cannot reach, and cuts them in hard alloys. It leaves a
  recast layer that must be characterised or removed, because a recast lip
  changes $C_d$ and can spall.
- **Brazed assemblies.** A real injector is several parts — oxidizer dome, fuel
  manifold, element bodies or posts, faceplate — furnace-brazed into one. Braze
  quality is the leading cause of injector rejection, and an unbrazed joint
  between the two propellant manifolds is a catastrophic internal leak. Every
  injector is proof-pressure and leak tested between manifolds before it ever
  sees a chamber.
- **Platelet construction.** A stack of thin photochemically etched sheets,
  each carrying part of a flow passage, diffusion-bonded into a monolith. This
  produces flow passages of essentially arbitrary two-dimensional shape at very
  fine scale — including internal turns, splits and metering sections impossible
  to drill. Aerojet developed and used it extensively for injectors and for
  film-cooled walls.
- **Additive manufacturing.** Laser powder-bed fusion prints injector bodies with
  internal manifolds, posts, and cooling passages as a single part, collapsing
  part counts from dozens to one and removing most of the braze joints that used
  to cause rejection. NASA MSFC's consolidated results include hot-fired AM
  injectors [Gradl18][GradlAM]. Rocket Lab's Rutherford is the production
  demonstration: chamber, injectors, pumps and main valves are all printed, and
  it was the first engine to fly with essentially its entire primary structure
  additively manufactured. Relativity's Aeon engines are the other frequently
  cited AM-injector example; their design details are company statements and are
  not in this course's engine data file, so no numbers are quoted here.

  The limits are real: as-built surface roughness inside small printed orifices
  changes $C_d$ relative to a drilled hole and must be calibrated by flow test;
  minimum printable feature size sets a floor on orifice diameter; and powder or
  partially sintered particles left in an internal manifold are a contamination
  source that a drilled-and-brazed injector does not have. The standard practice
  is to print the manifolds and post structure and then finish the metering
  orifices conventionally.

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| $\Delta p/p_c$, liquid circuits | 15–25 % | ~10 % on hydrogen circuits of expander engines (RL10 class) where turbine head is precious | 30 %+ on small storable thrusters and on deep-throttling engines that need margin at minimum thrust |
| $\Delta p/p_c$, gas circuits | 5–15 % | staged-combustion hot-gas side, where the drop is turbine work already spent | — |
| $C_d$, sharp-edged, $L/D\ge3$ | 0.75–0.85 | 0.61 for a thin-plate or flipped orifice | 0.95 for a well-rounded inlet |
| $C_d$, swirl element | 0.20–0.45 | 0.29 at $A_s = 2$ (ideal theory) | rises as swirl is reduced |
| Orifice diameter | 0.5–2.5 mm | ~0.4 mm in small storable thrusters | 3–5 mm in pintle radial rows and large swirl elements |
| Orifice $L/D$ | 3–5 | 1 in thin faceplates (avoid) | 10+ where the orifice doubles as a passage |
| Injection velocity, liquid | 20–60 m/s | ~15 m/s at deep throttle | 80 m/s+ on high-$p_c$ oxidizer circuits |
| Injection velocity, gas annulus | 200–400 m/s | — | near sonic on hydrogen circuits |
| Coaxial velocity ratio VR | 10–20 | ~5 (poor mixing) | 25+ |
| Coaxial momentum flux ratio $J$ | 1–10 | <1 — gas cannot disrupt the core | 20 |
| LOX post recess | 0–2 post diameters | flush (better face life) | 2–3 (better mixing, worse face life) |
| Pintle TMR | 0.5–2 | — | — |
| Pintle blockage factor | 0.3–0.7 | — | — |
| Impingement half-angle | 25–35° | 20° | 45° |
| Free jet length | 5–8 $d$ | 3 $d$ | 12 $d$ |
| Manifold/orifice area ratio | 4–6 | 2.4 (5 % distribution error) | 10 |
| Element count | see below | 1 (Merlin, LMDE pintle) | order of a thousand orifices per propellant (F-1) |
| Element density $n_A$ | 1–10 per cm² | — | — |
| Spray SMD | 50–300 μm | ~30 μm (shear coax with high VR) | 400 μm+ (poor impinging atomization at low $\Delta p$) |
| Mixing efficiency $E_m$ | 70–85 % | below 70 % — performance falls steeply | 90 % on a very well developed pattern |
| $\eta_{c^*}$ | 0.94–0.99 | 0.90 on a first-cut injector | 0.99+ on developed hydrogen coaxial faces |
| Chug frequency | 50–500 Hz | — | — |
| Screech frequency | 1–10 kHz | — | — |
| Combustion time lag $\tau$ | 0.2–2 ms | ~0.2 ms hydrogen | ~2 ms cold viscous hydrocarbons at low $p_c$ |

Engines at the extremes, from the course engine data: the **F-1** anchors the
element-count and development-effort extreme; the **Merlin** and **LMDE** anchor
the single-element extreme; the **RL10** at 32.8 bar anchors the low-$\Delta p$,
low-$p_c$ end; the **RS-25** at 206 bar and the **RD-170** at 245 bar anchor the
high-$p_c$ end, where LOX is injected supercritically and the atomization
framework of §3.5 no longer strictly applies; the **Aestus** at 11 bar shows how
far a swirl injector can carry a low-pressure engine (324 s at $\varepsilon=84$).

---

## 5. Worked examples

All five examples share a common design case unless stated: a LOX/RP-1
gas-generator booster engine with $p_c = 100$ bar, $MR = 2.27$, total fuel flow
30 kg/s, $\rho_{RP\text{-}1} = 810$ kg/m³, $\rho_{LOX} = 1140$ kg/m³,
$\sigma_{RP\text{-}1} = 0.023$ N/m, $\mu_{RP\text{-}1} = 1.62\times10^{-3}$ Pa·s,
$c^* = 1800$ m/s, $L^* = 1.0$ m, chamber gas $M = 23.9$ kg/kmol at 3500 K. The
arithmetic is in `tools/examples/07.py`.

### WE1 — Orifice sizing and the pump-power bill

**Given:** fuel circuit, $\dot m_f = 30$ kg/s total, $N = 500$ fuel orifices,
$\Delta p = 0.20\,p_c = 20$ bar $= 2.0\times10^6$ Pa, $C_d = 0.75$
($L/D = 4$, sharp inlet), $\rho = 810$ kg/m³.

**Per-orifice flow:**
$$\dot m = \frac{30}{500} = 0.0600\ \mathrm{kg/s}$$

**Area from Eq. 3.1:**
$$A = \frac{\dot m}{C_d\sqrt{2\rho\Delta p}}
= \frac{0.0600}{0.75\sqrt{2(810)(2.0\times10^6)}}
= \frac{0.0600}{0.75 \times 56\,921\ \mathrm{kg\,m^{-2}s^{-1}}}
= 1.4055\times10^{-6}\ \mathrm{m^2}$$

**Diameter:**
$$d = \sqrt{\frac{4A}{\pi}} = \sqrt{\frac{4(1.4055\times10^{-6})}{\pi}}
= 1.338\times10^{-3}\ \mathrm{m} = \mathbf{1.34\ mm}$$

**Jet velocity from Eq. 3.2:**
$$V = C_d\sqrt{\frac{2\Delta p}{\rho}} = 0.75\sqrt{\frac{4.0\times10^6}{810}}
= 0.75(70.27) = \mathbf{52.7\ m/s}$$

**Orifice length** at $L/D = 4$: $L = 5.4$ mm — which sets the minimum faceplate
thickness in the fuel circuit.

**Pump-power bill from Eq. 3.9,** at $\eta_p = 0.70$:
$$P = \frac{(30)(2.0\times10^6)}{(810)(0.70)} = 1.058\times10^{5}\ \mathrm{W}
= \mathbf{106\ kW}$$

> **Sanity check.** 1.34 mm orifices at 53 m/s and 500 fuel holes is squarely
> typical of a kerosene booster injector; the F-1's face carries orifices of this
> order in the same numbers. The 106 kW is 0.26 % of the F-1 turbopump's 41 MW —
> confirming that on a pump-fed booster the injector drop is a rounding error in
> the power budget, and that the reason not to make it larger is not power but
> pump discharge pressure and therefore pump and line weight.

### WE2 — Regime identification for the RP-1 jet

**Given:** the WE1 jet — $d = 1.338$ mm, $V = 52.7$ m/s, $\rho_l = 810$ kg/m³,
$\sigma = 0.023$ N/m, $\mu_l = 1.62\times10^{-3}$ Pa·s. Chamber gas:
$R = 8314.46/23.9 = 347.9$ J/(kg·K), $T_c = 3500$ K, $p_c = 10^7$ Pa, so
$$\rho_g = \frac{p_c}{R T_c} = \frac{10^7}{(347.9)(3500)} = 8.21\ \mathrm{kg/m^3}$$

**Liquid Weber number:**
$$\mathrm{We}_l = \frac{\rho_l V^2 d}{\sigma}
= \frac{(810)(52.7)^2(1.338\times10^{-3})}{0.023} = 1.31\times10^{5}$$

**Reynolds number:**
$$\mathrm{Re} = \frac{\rho_l V d}{\mu_l}
= \frac{(810)(52.7)(1.338\times10^{-3})}{1.62\times10^{-3}} = 3.53\times10^{4}$$

**Ohnesorge number:**
$$\mathrm{Oh} = \frac{\mu_l}{\sqrt{\rho_l\sigma d}}
= \frac{1.62\times10^{-3}}{\sqrt{(810)(0.023)(1.338\times10^{-3})}}
= \frac{1.62\times10^{-3}}{0.1579} = 1.026\times10^{-2}$$

Cross-check: $\sqrt{\mathrm{We}_l}/\mathrm{Re} = 361.8/35\,252 = 1.026\times10^{-2}$. ✓

**Gas Weber number** (the one that decides the regime), taking $V_{rel}\approx V$
since the chamber gas near the face is nearly stagnant:
$$\mathrm{We}_g = \frac{\rho_g V^2 d}{\sigma}
= \frac{(8.21)(52.7)^2(1.338\times10^{-3})}{0.023} = \mathbf{1.33\times10^{3}}$$

**Regime:** $\mathrm{We}_g = 1330 \gg 40$, so the jet is deep in the
**atomization regime** — breakup begins within a few diameters of the orifice.
$\mathrm{Oh} \approx 0.01$ places it in the low-Ohnesorge band where viscosity
plays essentially no role in the breakup and surface tension and aerodynamics
control.

**The instructive part:** repeat with atmospheric air, $\rho_g = 1.2$ kg/m³. Then
$\mathrm{We}_g = 194$ — still atomization, but 7 times weaker, and if the cold-flow
bench runs at half velocity, $\mathrm{We}_g = 48$, right at the boundary.

> **Sanity check.** The conclusion — that chamber gas density, not jet velocity,
> is what puts a rocket injector in the atomization regime — is why bench cold
> flow in air is a distribution and mixing test and not an atomization test, and
> why Rupe built his correlation on mixing uniformity rather than drop size
> [Rupe65].

### WE3 — Rupe momentum balance for an unlike doublet

**Given:** one unlike doublet feeding the WE1 fuel orifice, at $MR = 2.27$, with
**equal** $\Delta p = 20$ bar on both circuits and $C_d = 0.75$ on both.

**Oxidizer flow and velocity:**
$$\dot m_o = 2.27\times0.0600 = 0.1362\ \mathrm{kg/s}$$
$$V_o = 0.75\sqrt{\frac{4.0\times10^6}{1140}} = 0.75(59.24) = 44.43\ \mathrm{m/s}$$

**Oxidizer orifice:**
$$A_o = \frac{\dot m_o}{\rho_o V_o} = \frac{0.1362}{(1140)(44.43)}
= 2.689\times10^{-6}\ \mathrm{m^2}
\ \Rightarrow\ d_o = \mathbf{1.850\ mm}$$

**Rupe parameter, Eq. 3.18:**
$$R_u = \frac{\rho_o V_o^2 d_o}{\rho_f V_f^2 d_f}
= \frac{(1140)(44.43)^2(1.850\times10^{-3})}{(810)(52.7)^2(1.338\times10^{-3})}
= \frac{4161}{3010} = \mathbf{1.38}$$

and for comparison $\mathrm{TMR} = \dot m_o V_o/(\dot m_f V_f) =
(0.1362)(44.43)/((0.0600)(52.7)) = 1.91$.

**The oxidizer stream dominates.** Now fix it three ways.

*Option A — rebalance by pressure drop.* Since $d_o \propto V_o^{-1/2}$ at fixed
$\dot m_o$, $R_u \propto V_o^{3/2}$. Required velocity factor
$1.38^{-2/3} = 0.806$, so $V_o = 35.8$ m/s and
$$\Delta p_o = \frac{\rho_o V_o^2}{2C_d^2} = \frac{(1140)(35.8)^2}{2(0.75)^2}
= 1.30\times10^{6}\ \mathrm{Pa} = 13.0\ \mathrm{bar}$$
i.e. $\Delta p_o/p_c = 13.0$ %. **Rejected**: the chug criterion of WE5 requires
about 17 %. The mixing optimum and the stability requirement point in opposite
directions, and stability wins.

*Option B — split the oxidizer, making an O-F-O triplet.* Two oxidizer orifices
each of $\dot m_o/2$ at the same $\Delta p$ have
$d_o' = 1.850/\sqrt2 = 1.308$ mm, so
$$R_u = 1.38\times\frac{1.308}{1.850} = \mathbf{0.98}$$
Balanced, at 20 bar on both circuits, with no stability penalty. **Accepted.**

*Option C — split the fuel, making an F-O-F triplet.* $d_f' = 1.338/\sqrt2 =
0.946$ mm, so $R_u = 1.38\times(1.338/0.946) = 1.96$ — twice as unbalanced. To
balance it you would need $\Delta p_o = 8.2$ bar, or 8 % of $p_c$: chug territory.

> **Sanity check.** The historical F-O-F triplet of the XLR43 and its descendants
> is Option C, which this analysis says is the *worst* of the three on momentum
> balance. That is not an error in the analysis; it is the trade being made
> explicitly. F-O-F was chosen because a locally fuel-rich element is thermally
> forgiving and because the central oxidizer jet is shielded from the wall, and
> those considerations outranked $E_m$ [J]. It is also why those engines ran
> unequal pressure drops on the two circuits. The lesson is that the momentum
> criterion is a design *input*, not a design *answer*.

### WE4 — SMD, droplet lifetime, and the $L^*$ check

**Given:** the WE1/WE2 fuel jet, plus chamber gas $k_g = 0.20$ W/(m·K),
$c_{p,g} = 2500$ J/(kg·K), $\mu_g = 8\times10^{-5}$ Pa·s, $\mathrm{Pr} = 0.8$, and
a Spalding transfer number $B = 8$ for RP-1 in hot combustion gas.

**SMD from the Ingebo-type correlation** (Eq. from §3.5, $C = 5$):
$$(\mathrm{We}_g\,\mathrm{Re})^{1/4} = \left(1.327\times10^3\times3.525\times10^4\right)^{1/4}
= (4.68\times10^{7})^{1/4} = 82.7$$
$$D_{30} = \frac{5.0\times1.338\ \mathrm{mm}}{82.7} = 80.9\ \mu\mathrm{m},
\qquad \mathrm{SMD}\approx 1.2\,D_{30} \approx \mathbf{97\ \mu m}$$

Take $d_0 = 100\ \mu$m as the representative drop.

**Stagnant-drop evaporation constant, Eq. 3.14:**
$$K_v = \frac{8(0.20)}{(810)(2500)}\ln(9) = (7.90\times10^{-7})(2.197)
= 1.736\times10^{-6}\ \mathrm{m^2/s}$$

**Convection correction, Eq. 3.15,** with $V_{rel} = 50$ m/s:
$$\mathrm{Re}_d = \frac{(8.21)(50)(100\times10^{-6})}{8\times10^{-5}} = 513$$
$$K_{v,\mathrm{eff}} = 1.736\times10^{-6}\left(1 + 0.3\sqrt{513}\,(0.8)^{1/3}\right)
= 1.736\times10^{-6}(7.31) = 1.269\times10^{-5}\ \mathrm{m^2/s}$$

**Droplet lifetime:**
$$t_v = \frac{d_0^2}{K_{v,\mathrm{eff}}} = \frac{(100\times10^{-6})^2}{1.269\times10^{-5}}
= 7.88\times10^{-4}\ \mathrm{s} = \mathbf{0.79\ ms}$$

**Chamber stay time, Eq. 3.6,** at $L^* = 1.0$ m:
$$t_s = \frac{L^*\rho_c c^*}{p_c} = \frac{(1.0)(8.21)(1800)}{10^7}
= 1.48\times10^{-3}\ \mathrm{s} = \mathbf{1.48\ ms}$$

**Margin:** $t_s/t_v = 1.88$. Comfortable — vaporization is not the limiting
process at this SMD, and the remaining $\eta_{c^*}$ deficit will be mixing.

**Now the sensitivity that matters.** Repeat at $d_0 = 200\ \mu$m (an injector
that atomizes half as well): $\mathrm{Re}_d = 1027$, $K_{v,\mathrm{eff}} =
1.723\times10^{-5}$ m²/s, and
$$t_v = \frac{(200\times10^{-6})^2}{1.723\times10^{-5}} = 2.32\ \mathrm{ms} > t_s$$
The drops do not finish evaporating inside the chamber. To recover you need
$L^* \geq 2.32/1.48 = 1.57$ m — **a 57 % larger chamber**, and all the mass that
comes with it, because the SMD doubled.

> **Sanity check.** $L^* \approx 1.0$ m for LOX/RP-1 is the middle of the range
> quoted in module 06 (0.8–1.3 m), and this calculation reproduces it from
> atomization physics rather than from a table. The 200 μm case landing at 1.6 m
> is also consistent: the engines with the largest $L^*$ in the historical record
> are exactly the low-pressure kerosene engines with the coarsest sprays.

### WE5 — Pressure drop versus chug margin

**Given:** $t_s = 1.48$ ms from WE4, and a combustion time lag $\tau = 1.0$ ms,
typical for LOX/RP-1.

**Solve the neutral-stability phase condition, Eq. 3.8:**
$$\omega\tau + \arctan(\omega t_s) = \pi$$
Numerically, $\omega = 1911$ rad/s, i.e. $f = \omega/2\pi = \mathbf{304\ Hz}$.
Check: $\omega\tau = 1.911$, $\arctan(1911\times1.48\times10^{-3}) =
\arctan(2.825) = 1.231$, sum $= 3.142 = \pi$. ✓

**Critical gain:**
$$k_{crit} = \sqrt{1+(\omega t_s)^2} = \sqrt{1+2.825^2} = \sqrt{8.98} = 3.00$$

**Minimum pressure drop:**
$$\frac{\Delta p}{p_c} > \frac{1}{2k_{crit}} = \frac{1}{6.00} = \mathbf{16.7\ \%}$$

The design $\Delta p/p_c = 20$ % gives $k = 2.50$ against $k_{crit} = 3.00$, a
gain margin of 1.20 — about 1.6 dB. That is thin for a first design, and it is
why 20 % is a floor rather than a target on a new engine.

**Throttling check.** At 40 % thrust, $\dot m$ is 0.4 of design, so
$\Delta p \propto \dot m^2$ falls to 0.16 of design while $p_c$ falls to 0.4, and
$$\left.\frac{\Delta p}{p_c}\right|_{40\%} = 20\%\times\frac{0.16}{0.40} = \mathbf{8.0\ \%}$$
against a requirement that has, if anything, got harder: $t_s$ rises as $p_c$
falls (Eq. 3.6 has $\rho_c/p_c$ constant, so $t_s$ is roughly constant, but $\tau$
lengthens at low pressure and low velocity, which pushes $k_{crit}$ *down*).
The engine chugs. This is the quantitative statement of why deep throttling
requires either a variable-area injector, a dual-manifold injector, or cavitating
venturis [Casiano10].

> **Sanity check.** 304 Hz is squarely inside the observed chug band of 50–500 Hz,
> and the 16.7 % threshold reproduces the textbook 15–25 % rule from a
> two-parameter model. Sweeping $\tau$ from 0.5 to 2.0 ms gives thresholds of
> 9.4 %, 16.7 %, 22.3 % and 26.8 % — the entire published range of the rule of
> thumb, generated by the entire plausible range of $\tau$. That is a strong
> indication the model is capturing the right physics.

---

## 6. Real engines: why did they design it that way?

### F-1 (Rocketdyne, 1959–1973) — impinging, baffled, and beaten into submission

**The choice.** A flat-face impinging injector with a mixed doublet-and-triplet
pattern, in the final "5U(f)" configuration, with a copper baffle assembly
dividing the face into 13 compartments.

**The alternatives available in 1960.** Coaxial elements existed but were a
hydrogen technology with no LOX/kerosene heritage. Swirl elements were the Soviet
practice and essentially unknown to Rocketdyne. The pintle was invented at TRW at
almost exactly this time but was a small-engine curiosity. In practice the choice
was *which* impinging pattern, not whether.

**Why it made sense.** Rocketdyne had a decade of impinging-injector practice
running from the XLR43 through the Redstone A-7 to the H-1, all LOX/kerosene, all
flat-face impinging, all built with the same drilling and brazing shop. Scaling
that knowledge to 6.7 MN was the low-risk path, and every other path was
unexplored.

**What it actually cost.** The F-1 chamber turned out to be large enough to
support a transverse acoustic mode that the pattern drove. The fix took roughly
2,000 tests across 210 injector designs, 15 baffle designs and 14 injector
configurations under "Project Go" from 1962 to 1964, and produced a face that was
deliberately *detuned* — a compromised performer chosen for stability [OY93].
Rocketdyne then had to prove it, and invented the discipline of **dynamic
stability rating**: detonate a bomb near the injector centre at full thrust and
require the engine to damp the induced oscillation within 45 ms. That protocol,
not the thrust number, is the F-1's real legacy.

**Would a modern engineer do the same?** For a kerosene booster of that size, no
— they would run a coupled CFD and acoustic analysis first, they would very
likely consider a pintle, and they would build fewer hardware iterations. But
they would still bomb-test it, because nothing else demonstrates dynamic
stability, and they would still spend two years on it.

### J-2 and RS-25 (Rocketdyne, 1960s and 1970s) — the shear-coaxial archetype

**The choice.** The J-2 used 614 hollow oxidizer posts with concentric fuel
annuli, firing through a porous sintered stainless-steel faceplate that
transpiration-cools the face with hydrogen. The RS-25 uses the same architecture
with 600 elements, an augmented spark igniter at the face centre, and
acoustic-resonator cavities in the face.

**Why it made sense.** With LOX/LH2 the fuel arrives as a low-density gas at high
velocity. A shear coaxial element converts that velocity into atomization for
free — the fuel does the work on the oxidizer, and no impingement accuracy is
required. The face-cooling problem, which is severe for hydrogen because the
flame is hot and fast, is solved by the same fuel, bled through the porous plate.
The result is a high-$\eta_{c^*}$ injector with small $L^*$ and, critically, a
manufacturable one: the posts are turned parts, not drilled angles.

**What it cost.** LOX posts are slender cantilevers in a violent cross-flow of
hot hydrogen. On the SSME they cracked — the outer-row posts failed in
flow-induced high-cycle fatigue, and the fix was shields and dampers on the outer
rows [Biggs89]. That is a failure mode the impinging face simply does not have,
and it is the price of the geometry.

**Would a modern engineer do the same?** Yes. Every hydrogen engine since —
Vulcain, LE-7A, RD-0120, RL10, RS-68 — is a shear-coaxial variant. The
architecture is settled.

### RD-253 and RD-170 family (Glushko, 1961 onward) — swirl, everywhere

**The choice.** Coaxial swirl elements, on everything, from the RD-107/108
through the RD-253 to the RD-170/180/191.

**Why it made sense.** Two reasons, one physical and one institutional [H][J].
Physically, swirl elements atomize well at low injection velocity and low
pressure drop, which suits high-$p_c$ oxidizer-rich staged combustion where the
oxidizer arrives hot and the pressure budget is tight; and their large, tolerant
orifices are easy to manufacture consistently. Institutionally, Glushko's bureau
had swirl heritage running back to the German pot-type burner cups of the V-2 —
the V-2's 18 pre-mixing heads were each a miniature centrifugal swirl injector —
and it developed swirl theory to a depth the West did not match for decades.

**What it cost.** The RD-253's precedence as the first flown oxidizer-rich
staged-combustion engine came with an oxidizer-rich hot gas that attacks
everything it touches, and Glushko's answer — passivating enamels and specialised
alloys — was closely held. And where Glushko could not solve instability in a
single large chamber, he did not persist as Rocketdyne did with the F-1: he split
the engine into four chambers on one turbopump. The RD-170's four-chamber layout
is a combustion-stability decision showing up as an architecture decision.

**Would a modern engineer do the same?** For a kerosene ORSC engine, yes — swirl
coaxial is still the right answer and the Chinese YF-100 and the Russian RD-191
both continue it. Splitting into four chambers to avoid instability, no; modern
analysis and modern damping devices make a single large chamber tractable.

### LMDE and Merlin (TRW 1964, SpaceX 2011) — one element, sixty years apart

**The choice.** A single central pintle. On the LMDE it is a **variable-area**
pintle, with a sleeve that moves with the throttle command.

**Why it made sense for the LMDE.** The requirement was a 10:1 throttle range with
usable performance and absolute reliability at every point, on a pressure-fed
engine, for a vehicle that could not go around. No fixed-area multi-element face
can do that: $\Delta p/p_c$ collapses linearly with thrust (WE5), and at 10 %
thrust the injector has no authority left. Elverum's variable-area pintle keeps
injection velocity and $\Delta p$ roughly constant across the whole range, which
is why the engine held 285 s at 10 % thrust against 311 s at full thrust. The
chamber pressure turned down 10:1, from 110 psia to 11 psia. Nothing else in the
public record demonstrates that.

**What it cost.** A moving mechanism inside the injector, and an operational
restriction: the 60–100 % band was **prohibited** in flight because of nozzle
erosion, so the engine ran either at full thrust or within the throttle band. A
throttleable engine with a forbidden zone is a reminder that the injector was not
the only component that had to cope.

**Why SpaceX repeated it.** The Merlin uses a fixed-area pintle, throttles
40–100 %, and — crucially — is built in the hundreds per year. A pintle has one
element to develop, one element to inspect, and no azimuthal element array to go
unstable. For a company whose binding constraint is production cadence and reuse
rather than $I_{sp}$, giving up a point or two of $\eta_{c^*}$ to eliminate the
injector development programme is an obviously correct trade. The Merlin's
gas-generator cycle and 97 bar chamber pressure say the same thing: this engine
is optimised for cost, restart and reuse.

**Would a modern engineer do the same?** For a throttled lander or a
mass-produced booster engine, yes, and most new entrants do. For a
performance-limited upper stage, no.

### Aestus (Astrium/ArianeGroup) — swirl at 11 bar

**The choice.** 132 coaxial swirl elements on a storable N2O4/MMH pressure-fed
upper-stage engine, where impinging doublets are the industry norm.

**Why it made sense.** At 11 bar chamber pressure a pressure-fed engine cannot
afford injection velocity — every bar of injector $\Delta p$ is a bar of tank
pressure across the entire propellant volume, and tank mass scales with it. Swirl
elements atomize by centrifugal sheet spreading rather than by kinetic energy,
so they work at low $\Delta p$ where an impinging doublet would produce coarse
drops and poor mixing. The result is 324 s vacuum from an 11 bar chamber through
an 84:1 nozzle — a good demonstration that low chamber pressure need not mean poor
$I_{sp}$ in vacuum, provided the injector does its job.

**Would a modern engineer do the same?** Yes, and it is an under-used choice in
the West. The swirl element's tolerance of low pressure drop is exactly what
small pressure-fed in-space engines need.

### Rutherford (Rocket Lab, 2013 onward) — the printed injector

**The choice.** Chamber, injectors, pumps and main propellant valves all produced
by laser powder-bed fusion. Element type and count are not published, and this
course does not guess at them.

**Why it made sense.** For a 24.9 kN engine built in the hundreds, the dominant
cost is touch labour: drilling, deburring, brazing, inspecting, rejecting.
Printing the injector body with its manifolds as a single part removes most of
the braze joints and most of the inspection. It also removes the geometric
constraint that a drill must be able to reach the hole, which opens up internal
manifold routing that a machined-and-brazed part cannot achieve.

**What it costs.** As-built internal surface roughness shifts $C_d$ away from
handbook values, so every printed injector circuit must be flow-calibrated;
minimum feature size sets a floor on orifice diameter; and trapped powder is a
contamination mode. NASA MSFC's hot-fire programme on AM combustion devices is
the public record of what does and does not work [Gradl18][GradlAM].

**Would a modern engineer do the same?** For a small engine at high production
rate, unambiguously yes — it is now the default. For a large engine, the practice
is to print the structure and manifolds and machine the metering orifices
conventionally, because $C_d$ repeatability is worth more than the last few
percent of part-count reduction.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The four standing trade-offs

1. **Performance versus stability.** Faster mixing means heat release nearer the
   face, where the transverse acoustic modes have their largest pressure
   amplitude. Every high-$\eta_{c^*}$ pattern is closer to the stability boundary
   than the showerhead it beats. The F-1 resolved this by detuning the pattern
   and adding baffles, paying performance for margin [OY93].
2. **Pressure drop versus everything upstream.** More $\Delta p$ buys chug margin
   and distribution uniformity, and costs pump discharge pressure, turbine flow,
   tank pressure and mass.
3. **Element count versus manufacturability and inspectability.** More, smaller
   elements mix better and atomize finer, and multiply the number of holes that
   can be drilled wrong, blocked, or left with a burr.
4. **Wall protection versus $I_{sp}$.** Every kilogram of film-cooling fuel is a
   kilogram burning at the wrong mixture ratio. A 3 % film-cooling budget is worth
   roughly 1–2 % of $I_{sp}$, and is often the difference between a chamber that
   lasts and one that does not.

### 7.2 Failure modes

**Wall streaking.** *Mechanism:* an outer-row element is mis-aimed, mis-drilled,
or mis-balanced, and its spray fan — or worse, an unatomized jet from a missed
impingement — reaches the wall at near-stoichiometric mixture ratio. *Symptom:*
a local hot streak; in a regeneratively cooled chamber, a coolant-channel
temperature spike and eventually a burn-through at one axial station. *Evidence:*
axial discoloration or erosion on the wall aligned with a specific element, and
the same pattern reproducible from test to test; on the patternator, a local
mass-flux and mixture-ratio anomaly at that azimuth. *Fix:* re-aim or resize the
outer row, add or increase film-cooling orifices, cant the outer fuel jets
outward toward the wall.

**Injector face burnout.** *Mechanism:* recirculating hot gas at the face with
inadequate transpiration or film flow, often made worse by too much element
recess or by a locally fuel-lean outer region. *Symptom:* melted or eroded face
metal, usually radially between elements where the cooling film is thinnest.
*Evidence:* post-test inspection; in test, a slow $\eta_{c^*}$ drift as orifice
geometry changes. *Fix:* porous faceplate, more face film orifices, reduce recess.

**LOX post fatigue.** *Mechanism:* slender oxidizer posts in a high-velocity
hot-gas cross-flow shed vortices and are driven at their natural frequency;
high-cycle fatigue cracks the post root. *Symptom:* a cracked or departed post,
LOX dumped locally, immediate local burn-through. *Evidence:* the SSME
development record is the case study [Biggs89]. *Fix:* shields and dampers on the
outer rows, thicker post walls, changed post spacing.

**Hydraulic flip.** *Mechanism:* orifice cavitation extends to the exit and gas
is ingested; $C_d$ steps to ~0.61 (§3.2). *Symptom:* a step change in flow at
fixed $\Delta p$, a mixture-ratio shift if only one circuit flips, and a sudden
worsening of atomization. *Evidence:* on a flow bench, a discontinuity in the
$\dot m$ versus $\sqrt{\Delta p}$ line and a visible change in the jet from
frothy to glassy; in hot fire, an unexplained $c^*$ step at one operating point.
*Fix:* raise back-pressure or upstream pressure to raise $K$, round the inlet, or
lengthen the orifice so the cavity cannot reach the exit.

**Chug.** *Mechanism:* §3.4. *Symptom:* a 50–500 Hz oscillation visible on both
chamber and manifold pressure, in phase across the whole chamber. *Evidence:*
low-frequency, spatially uniform, and present on feed-line pressure — that
combination distinguishes it from an acoustic mode, which is spatially varying
and absent upstream. *Fix:* raise $\Delta p$, add a cavitating venturi in the feed
line, change line length or add a compliance to detune the feed system.

**Manifold priming asymmetry and hard start.** *Mechanism:* one manifold fills
faster than the other, or fills unevenly, so the first milliseconds of flow are at
a wildly off-design mixture ratio. *Symptom:* an ignition overpressure spike.
*Evidence:* high-speed chamber pressure trace with a spike above steady-state
$p_c$; valve-timing and manifold-pressure traces show the sequencing. *Fix:*
valve timing, manifold volume reduction, deliberate flow restrictions, or an
igniter that establishes a flame before the mains open (module 08).

**Contamination blockage.** *Mechanism:* a chip, a weld bead, or trapped powder
from an AM part blocks one orifice. *Symptom:* a single-element mixture-ratio
anomaly, a wall streak, or nothing at all until the wall fails. *Evidence:*
per-orifice flow test before and after; a small but repeatable $\eta_{c^*}$
deficit. *Fix:* filtration at the engine inlet sized to a fraction of the smallest
orifice, and cleanliness control through assembly.

### 7.3 Materials

Injector bodies and domes are usually **stainless steels (304L, 321, 347)** or
**Inconel 718** — chosen for weldability, cryogenic toughness on the LOX side, and
resistance to the oxidizer. Faceplates that see the flame directly are often
**copper alloys** (high conductivity spreads local hot spots) or **porous sintered
stainless** where transpiration cooling is used. Baffles are **copper alloy** with
internal fuel passages, for the same conductivity reason; the F-1's baffle
assembly is copper. On the LOX side, everything must be **oxygen-compatible and
oxygen-clean**: no aluminium in high-velocity oxygen service, no hydrocarbon
residues, and particle counts controlled through assembly. For AM injectors the
common alloys are **Inconel 625 and 718**, with **GRCop-42/84** where the face
needs conductivity [GradlAM].

### 7.4 Manufacturing

Covered in §3.14. The single most consequential manufacturing decision is how the
metering orifices are produced and finished, because that is what sets $C_d$
repeatability and therefore mixture-ratio control. The second is braze quality
between the two propellant manifolds, because that failure is not recoverable.

### 7.5 Testing

The test sequence for an injector is fixed and largely unchanged since the 1960s
[SP-8089][M]:

1. **Per-orifice flow check.** Water or a reference fluid through each orifice,
   measuring flow at fixed $\Delta p$. Detects burrs, blockages and drill errors.
   Reject criteria are typically a few percent on any single hole.
2. **Circuit flow calibration.** Whole-circuit $\dot m$ versus $\Delta p$ across
   the operating range, on both circuits. This is where you obtain the $C_d$ you
   will actually design to, and where hydraulic flip shows up as a knee in the
   $\dot m$–$\sqrt{\Delta p}$ line.
3. **Manifold cross-leak and proof.** Pressurise one manifold, monitor the other.
4. **Patternation.** Cold flow into a grid of collection tubes, measuring
   mass-flux distribution across the face. The output is a contour map; the
   acceptance criterion is deviation from the intended profile, especially in the
   outer row.
5. **Mixing measurement.** Two-fluid cold flow with immiscible or chemically
   distinguishable simulants, collected cell by cell, reduced to $E_m$ (Eq. 3.17)
   [Rupe65].
6. **Spray characterisation.** Laser diffraction or phase-Doppler measurement of
   drop size, usually at atmospheric back-pressure and therefore only indicative
   (WE2).
7. **Hot fire.** $\eta_{c^*}$ from measured $p_c$, $\dot m$ and $A_t$; wall
   thermocouples and, on a calorimetric chamber, per-station heat flux; and
   **high-frequency pressure transducers** — flush-mounted piezoelectric gauges
   at the chamber wall near the injector face and in each manifold, sampled at
   tens of kilohertz. What the data looks like when the thing is wrong: chug is a
   clean low-frequency sine on every transducer including the manifolds; screech
   is a sharp spectral peak at a chamber transverse-mode frequency, present on
   chamber transducers only, often with a rising envelope; a streak is not in the
   pressure data at all and appears only as a wall thermocouple divergence.
8. **Stability rating.** Bomb or pulse-gun perturbation at full thrust, with the
   requirement stated as a damping time — the F-1's was 45 ms [OY93]. An engine
   that is merely "stable in test" has not been rated; an engine that damps an
   imposed perturbation has.

---

## 8. Misconceptions and what engineers actually care about

**"The injector's job is to mix the propellants."** It is one of seven jobs, and
on many engines it is not the binding one. On a hydrogen upper stage the binding
job is face survival; on a lander it is feed-system decoupling across the throttle
range; on a mass-produced booster it is manufacturability. Naming the binding job
is the first design decision.

**"Higher injector $\Delta p$ is always more stable."** It is more stable against
chug, which is a feed-coupled low-frequency mode. It does very little against
high-frequency acoustic instability, and by raising injection velocity it can
move heat release closer to the face and make screech *worse*. The two problems
have different fixes and conflating them has wrecked development programmes.

**"$C_d$ is a property of the orifice."** $C_d$ is a property of the orifice
*and* of the flow state. The same hole has $C_d = 0.80$ running full, $0.61$
flipped, and something in between while cavitating. It also depends on Reynolds
number at low flow, which is why deep-throttled engines see $C_d$ drift.

**"Cavitation in an injector is a fault."** Sometimes it is deliberate. A fully
cavitating orifice is hydraulically choked and completely decouples the chamber
from the feed system (Eq. 3.4), which is the strongest possible chug fix.
Cavitating venturis in the feed lines are the same idea applied upstream. What is
a fault is *unsteady* or *partial* cavitation, and cavitation in one circuit but
not the other.

**"Uniform mixture ratio across the face is the goal."** It is not. Every flown
injector is deliberately stratified, with a fuel-rich outer region to protect the
wall. Perfect uniformity would give the best $\eta_{c^*}$ and destroy the chamber.

**"$L^*$ is a chamber property."** $L^*$ is an injector requirement expressed as a
chamber dimension (Eq. 3.16). A better injector permits a smaller $L^*$ at the
same efficiency, and the historical $L^*$ tables are a record of the atomization
quality of their era, not a law of nature.

**"The pintle is strictly better — one element, no instability."** The pintle
gives up mixing fineness and typically a point or two of $\eta_{c^*}$, puts a hot
loaded part on the axis, and is not immune to chug. It is an excellent trade for
throttled and mass-produced engines and a poor one for a performance-limited
upper stage.

**"You can compute your way to an injector."** You can compute your way to a
starting point that is right to within a factor that matters, which is what this
module teaches. You cannot compute $\eta_{c^*}$ to a point, or stability at all.
The F-1 took 2,000 tests [OY93]; a modern programme takes fewer, but not zero.

### What engineers actually care about

- **$\eta_{c^*}$, and where the missing percent is going.** Mixing, vaporization,
  or film cooling? Each has a different fix, and the diagnostic is comparing
  measured $c^*$ against CEA with and without the film-cooling flow accounted for.
- **Wall and face temperatures, per station and per azimuth.** The number that
  decides whether the engine has a life.
- **$\Delta p$ across the whole operating box, not just at the design point.**
  Including start, shutdown, and every throttle setting, because that is where
  the margin actually disappears.
- **Repeatability between units.** A pattern that works is worth nothing if unit
  17 has 4 % more oxidizer area than unit 1. Flow calibration data on every
  circuit of every unit is a standard deliverable.
- **What the high-frequency pressure data says.** Every hot fire is a stability
  test whether it was meant to be or not, and the first sign of a marginal
  injector is a spectral peak that grows a little from test to test.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can explain in plain language what an injector
does and why its pressure drop matters; you can name and sketch the showerhead,
like doublet, unlike doublet, triplet, shear coaxial, swirl coaxial and pintle
elements; you can say which propellant combinations go with which element type
and name a real engine for each; and you can state the 15–25 % rule and the
50–300 μm SMD range from memory.

**Level 2 — Working engineering knowledge.** You can size an orifice from
$\dot m$, $\Delta p$, $\rho$ and $C_d$ and state the uncertainty; compute
$\mathrm{We}$, $\mathrm{Re}$ and $\mathrm{Oh}$ and identify the breakup regime;
apply Rupe's criterion to an unlike doublet and diagnose an imbalance; derive the
manifold area-ratio rule; run the chug criterion for given $t_s$ and $\tau$ and
say what $\Delta p/p_c$ it demands; convert an SMD to a droplet lifetime and check
it against $L^*$; and read a flow-bench $\dot m$ versus $\sqrt{\Delta p}$ plot and
identify hydraulic flip.

**Level 3 — Interview mastery.** Given an unfamiliar engine — its propellants,
$p_c$, thrust, throttle range, cycle and mission — you can propose an element
type, defend it against the two strongest alternatives on mixing, stability,
throttling, wall compatibility and manufacturing, and say what you would measure
first to find out you were wrong. Given a described failure (a wall streak, a
$c^*$ step, a 300 Hz oscillation, a cracked post) you can name the mechanism, the
distinguishing evidence, and the fix, and name the historical programme that hit
the same thing. Given a throttling requirement you can compute where the chug
margin disappears and argue for the specific mitigation the engine should carry.

---

## 10. Problems

### Conceptual

**C1.** An injector orifice is measured on a flow bench and $C_d$ is found to be
0.79 at 15 bar and 0.62 at 40 bar, with the jet changing from frothy to glassy at
the transition. Name the phenomenon, explain the mechanism, and say what two
geometric changes would move the transition out of the operating range.

**C2.** Explain, in terms of Eq. 3.7, why the injector's pressure-drop feedback
is stabilising when the combustion time lag is zero and destabilising when it is
not. What physical quantity determines the frequency at which the instability
first appears?

**C3.** Two engines have identical chambers, propellants and chamber pressure.
Engine A uses like-on-like doublets; engine B uses unlike doublets. Predict, with
reasons, which has the higher $\eta_{c^*}$, which requires the larger $L^*$, and
which is more likely to go high-frequency unstable.

**C4.** Why does a shear coaxial element work well for LOX/LH2 and badly for
LOX/RP-1? Answer in terms of the groups in Eq. 3.19.

**C5.** A colleague proposes achieving uniform mixture ratio across the entire
injector face to maximise $\eta_{c^*}$. State the two reasons this is wrong and
what the correct target profile looks like.

**C6.** The F-1's final injector pattern was chosen for stability at a cost in
performance. Explain the physical mechanism by which a faster-mixing pattern makes
high-frequency instability more likely.

**C7.** Explain why a fully cavitating injector orifice is an excellent chug fix,
and give two reasons a designer might nevertheless refuse to use one.

**C8.** A swirl element has $C_d \approx 0.29$ where a plain orifice has 0.80.
Explain physically where the missing discharge went, and why this is not simply a
loss to be engineered away.

### Calculation

**N1.** A LOX circuit must pass 68 kg/s at $\Delta p = 18$ bar with $C_d = 0.78$
and $\rho_{LOX} = 1140$ kg/m³. Compute the total orifice area, and the number of
orifices if each is 1.6 mm in diameter. What faceplate thickness does $L/D = 4$
imply?

**N2.** For the jet of N1, compute $V$, $\mathrm{We}_l$, $\mathrm{Re}$ and
$\mathrm{Oh}$ using $\sigma_{LOX} = 0.013$ N/m and $\mu_{LOX} =
1.9\times10^{-4}$ Pa·s. Then compute $\mathrm{We}_g$ in a chamber at 90 bar and
3400 K with $M = 22$ kg/kmol, and state the breakup regime.

**N3.** An unlike doublet is to be designed for $MR = 1.65$ with N2O4
($\rho = 1440$ kg/m³) and MMH ($\rho = 875$ kg/m³), $C_d = 0.80$ on both circuits,
$\dot m_f = 0.025$ kg/s per element, and equal $\Delta p = 5$ bar. Compute both
orifice diameters, the Rupe parameter and the TMR. Is the element balanced? If
not, propose a fix and quantify it.

**N4.** A spray has SMD 150 μm in a chamber at $p_c = 70$ bar, $T_c = 3300$ K,
$M = 22$ kg/kmol, $c^* = 1750$ m/s. Using $k_g = 0.20$ W/(m·K), $c_{p,g} = 2400$
J/(kg·K), $B = 7$, $\mu_g = 7.5\times10^{-5}$ Pa·s, $\mathrm{Pr} = 0.8$,
$\rho_l = 800$ kg/m³ and $V_{rel} = 40$ m/s, compute the droplet lifetime and the
minimum $L^*$ for complete vaporization. Compare with the range in module 06.

**N5.** For a chamber with $t_s = 2.2$ ms and a combustion time lag of 1.2 ms,
compute the neutral chug frequency and the minimum $\Delta p/p_c$. Then repeat for
$t_s = 0.8$ ms and comment on the direction of the trend.

**N6.** A fuel manifold feeds 400 orifices of 1.2 mm diameter with $C_d = 0.75$.
What manifold cross-sectional area is needed to hold the flow-distribution error
below 2 %? Express the answer as an equivalent circular duct diameter.

**N7.** Using the engine data for the Lunar Module descent engine, compute the
ratio of injection $\Delta p$ at 10 % thrust to that at 100 % thrust for a
*fixed-area* injector, and hence the $\Delta p/p_c$ at 10 % thrust if the
full-thrust value was 20 %. Comment on what this proves about the LMDE's injector.

**N8.** A 100 kN methalox engine runs $p_c = 60$ bar, $MR = 3.4$, $I_{sp,vac} =
355$ s. Compute the total, oxidizer and fuel mass flows. Then, taking
$\Delta p/p_c = 0.20$, $C_d = 0.80$, $\rho_{LOX} = 1140$ kg/m³ and
$\rho_{LCH_4} = 423$ kg/m³, compute the total orifice area of each circuit and the
orifice diameters for a 90-element unlike-doublet face.

### Engineering reasoning

**R1.** A development engine shows a repeatable 2 % $c^*$ deficit and a wall
thermocouple at one azimuth reading 90 K above its neighbours, both present from
the first test and unchanged over twelve firings. Another engine of the same
design shows nominal $c^*$ but a wall thermocouple that climbs 15 K per test.
Diagnose both, state the distinguishing evidence, and give a different fix for
each.

**R2.** You are shown two high-frequency pressure spectra from the same engine.
Spectrum A has a single sharp 340 Hz peak that appears identically on the chamber
transducer and on both propellant manifold transducers. Spectrum B has a 4.2 kHz
peak on the chamber transducer only, absent from the manifolds, with an amplitude
that grew from 0.5 % to 4 % of $p_c$ over four tests. Identify both, and state
which injector change you would make for each — and which change would make the
other one worse.

**R3.** An engine passes acceptance at 100 % thrust and chugs at 55 % during the
first throttling test. The team proposes doubling the injector pressure drop.
Evaluate that proposal quantitatively (what happens to $\Delta p/p_c$ at 100 % and
at 55 %, and what it costs), and propose two alternatives.

**R4.** A supplier delivers an additively manufactured injector whose measured
circuit $C_d$ is 0.68 where the drilled prototype measured 0.81, with 6 %
scatter between nominally identical orifices. The mixture ratio comes out 3 %
oxidizer-rich. Explain the chain of causation, say what you would measure to
confirm it, and give two fixes with their consequences.

**R5.** An unlike-doublet hypergolic thruster performs well in steady state and
badly in short pulses, with $I_{sp}$ falling 12 % at minimum pulse width. Give
two candidate mechanisms rooted in this module, and describe the test that
distinguishes them.

### Mini trade study

**T1.** You must select an injector for a **100 kN vacuum methalox engine** with
these constraints: $p_c = 60$ bar, $MR = 3.4$, staged-combustion-class turbopump
feed, **required throttle range 40–100 % with five in-flight restarts**, chamber
$L^* \leq 1.1$ m, ablative-free (regeneratively cooled) chamber with a 500 s
cumulative burn life, and a production rate of 50 engines per year. Evaluate
**(a)** a fixed-area pintle, **(b)** a shear-coaxial face of ~90 elements,
**(c)** an unlike-doublet impinging face of ~180 elements, and **(d)** a
swirl-coaxial face of ~90 elements. For each, address: chug margin at 40 %
thrust; expected $\eta_{c^*}$; high-frequency stability risk; wall and face
compatibility; manufacturing cost and inspectability at 50 units/year; and
development risk. Recommend one, state the two strongest arguments against your
recommendation, and name the single test that would most quickly show you were
wrong.

---

## 11. Quiz

Ten questions, 100 points total. Show working where a calculation is required.

**Q1 (8 pts).** An orifice with a sharp inlet and $L/D = 1.2$ is most likely to
have a discharge coefficient of approximately:
(a) 0.45 (b) 0.65 (c) 0.85 (d) 0.98

**Q2 (8 pts).** The injector pressure-drop rule of 15–25 % of $p_c$ exists
primarily to:
(a) atomize the propellants finely enough
(b) provide chug margin by decoupling the chamber from the feed system
(c) suppress high-frequency acoustic instability
(d) hold the mixture ratio constant across the face

**Q3 (12 pts).** A fuel orifice passes 0.045 kg/s of a liquid of density
790 kg/m³ at $\Delta p = 14$ bar with $C_d = 0.76$. Compute the orifice diameter
and the jet velocity.

**Q4 (10 pts).** For the jet of Q3, with $\sigma = 0.025$ N/m and
$\mu = 1.1\times10^{-3}$ Pa·s, compute $\mathrm{Oh}$ two different ways and state
what the value tells you about the role of viscosity in the breakup.

**Q5 (8 pts).** Which statement about hydraulic flip is correct?
(a) it increases $C_d$ and improves atomization
(b) it makes the orifice flow independent of upstream pressure
(c) it drops $C_d$ to about 0.61 and collapses the spray cone
(d) it occurs only in cryogenic propellants

**Q6 (12 pts).** A chamber has $t_s = 1.9$ ms and a combustion time lag of
0.9 ms. Compute the neutral chug frequency and the minimum $\Delta p/p_c$.
Would a design at 18 % be acceptable?

**Q7 (10 pts).** An unlike doublet has $\rho_o V_o^2 d_o = 5200$ and
$\rho_f V_f^2 d_f = 2100$ in consistent SI units. Compute the Rupe parameter,
state what it predicts about the spray, and give one change that would balance it
without reducing either circuit's pressure drop.

**Q8 (10 pts).** Name the element type used by each of: the J-2, the RD-170, the
Merlin, the Apollo Service Propulsion System, and the Aestus. For one of them,
say in a sentence why that choice followed from the engine's requirements.

**Q9 (12 pts).** An engine designed with $\Delta p/p_c = 22$ % at full thrust must
throttle to 35 %. Compute $\Delta p/p_c$ at 35 % thrust for a fixed-area injector.
Then state, with a reason for each, two distinct hardware mitigations and one
reason a designer might reject each of them.

**Q10 (10 pts).** You are handed an injector with an excellent patternation map,
an $E_m$ of 84 %, and a hot-fire $\eta_{c^*}$ of 0.93 — well below the 0.97 the
pattern should give. Give the two most probable explanations and the single
measurement that would distinguish them.

---

## 12. Further reading

- **[SP-8089]** — Gill and Nurick, *Liquid Rocket Engine Injectors*. The primary
  document for this module. Read it for element-type taxonomy, the mixing and
  atomization design criteria, the performance-versus-stability discussion, and
  the chamber-compatibility and streaking material. Note it predates the pintle's
  general adoption and barely mentions it.
- **[Nurick76]** — Nurick, *Orifice Cavitation and Its Effect on Spray Mixing*.
  Read it for the cavitation number, the $C_d \approx C_c\sqrt{K}$ result,
  hydraulic flip, and the finding that cavitation degrades mixing in circular but
  not rectangular orifices. This is where §3.2's numbers come from.
- **[Rupe65]** — Rupe, JPL TR 32-255. Read it for the cold-flow mixing method, the
  $E_m$ definition, and the momentum criterion for impinging elements — and for
  the deeper methodological point that a non-reacting measurement can predict
  combustion performance.
- **[LM]** — Lefebvre and McDonell, *Atomization and Sprays*. The reference for
  breakup regimes, the Ohnesorge chart, sheet breakup, and the SMD correlations.
  Read it critically: the correlations were fitted to gas-turbine atomizers at
  modest pressure and need recalibration for rocket conditions.
- **[LRTC]** — Yang, Habiballah, Hulka and Popp, *Liquid Rocket Thrust Chambers*.
  The modern comprehensive treatment: coaxial and swirl element physics,
  supercritical injection, and chamber modelling. This is where to go for swirl
  design theory beyond Eq. 3.20–3.21.
- **[Dressler00]** — Dressler and Bauer, *TRW Pintle Engine Heritage and
  Performance Characteristics*. The open-literature account of the pintle: why
  one element behaves differently from a face full of them, and the LMDE-to-Merlin
  lineage. It is a vendor survey; take the design guidance as directional.
- **[Casiano10]** — Casiano, Hulka and Yang, throttling review. Read it for the
  quantitative treatment of why injector $\Delta p$ collapses faster than thrust
  and the full catalogue of mitigations, with the engines that used each.
- **[OY93]** — Oefelein and Yang, F-1 instability review. The best available case
  study of an injector-driven instability fixed by systematic testing, and honest
  that it was testing and not theory that did it.
- **[SP-8113]** — *Liquid Rocket Engine Combustion Stabilization Devices*. Baffles
  and acoustic cavities: how to size them and what they cost in performance and
  cooling. Read with module 15.
- **[GradlAM]** and **[Gradl18]** — additive manufacturing for propulsion. Read
  for what printed injectors have actually demonstrated in hot fire, and for the
  process limits that decide whether an orifice can be printed or must be
  machined.
