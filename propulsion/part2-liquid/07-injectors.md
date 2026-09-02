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
- **Long-$L^*$ chambers** (large $t_s$) need *more* drop, not less, because
  $\omega t_s$ enters $k_{crit}$ — a sluggish chamber is more chuggable, not less.
  This surprises people.
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
