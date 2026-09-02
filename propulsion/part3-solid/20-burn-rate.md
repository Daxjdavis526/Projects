# Module 20 — Solid Combustion and Burn Rate

Part III · Prerequisites: modules [03](../part1-foundations/03-performance.md), [19](19-solid-fundamentals.md) · Estimated time: 7 h

A liquid engine has a throttle. A solid motor has a *contract*: the chamber
pressure it will run at is fixed the moment the grain geometry, the throat
area, and the propellant's burn-rate law are chosen, and it is renegotiated
only by physics — by the grain burning back, by the throat eroding open, and
by whatever temperature the motor happened to be soaked at before you lit it.
Everyone who has ever been surprised by a solid motor has been surprised by
the same equation: $p_c = (a\rho_p c^* K_n)^{1/(1-n)}$. The exponent
$1/(1-n)$ is the whole story. It is an amplifier sitting between every small
error you make in propellant characterisation, grain surface area, or throat
diameter and the pressure your case has to hold. At $n = 0.35$ that amplifier
is 1.54; at $n = 0.7$ it is 3.33, and a 5 % error in burn-rate coefficient
becomes a 17 % error in chamber pressure. This module is about where that law
comes from, when it stops being true, and what the pressure trace looks like
when it does.

---

## 1. Learning objectives

After this module you should be able to:

1. **Describe the combustion-zone structure** above a burning composite or
   double-base propellant surface — condensed phase, foam/fizz zone, dark
   zone, luminous flame — and state which zone controls the pressure
   dependence of the burn rate.
2. **Explain the granular diffusion flame and BDP models** at the level of
   what physical process each says is rate-controlling, and predict from each
   how $n$ should change with pressure and with oxidiser particle size.
3. **Compute burn rate** from the Saint-Robert/Vieille law $r = a p^n$ in
   consistent SI units, and convert a burn-rate coefficient quoted in
   mm/s·(MPa)$^{-n}$ or in/s·(psi)$^{-n}$ into m/s·(Pa)$^{-n}$.
4. **Derive and apply the equilibrium chamber pressure**
   $p_c = (a\rho_p c^* K_n)^{1/(1-n)}$ from a chamber mass balance, and state
   every assumption that went into it.
5. **Prove the $n < 1$ stability requirement** both graphically (generation
   versus discharge curves) and dynamically (linearised chamber-filling
   equation), and state the relaxation time.
6. **Compute the temperature sensitivities** $\sigma_p$ and $\pi_K$, derive
   $\pi_K = \sigma_p/(1-n)$, and predict the pressure, thrust, and burn-time
   shift for a stated soak-temperature change.
7. **Identify where erosive burning appears in a grain**, estimate the port
   mass flux and port-to-throat area ratio at which it matters, and compute
   the coupled pressure rise it causes.
8. **Distinguish L\* instability from acoustic instability** in a solid motor,
   name the damping mechanisms available to the designer, and explain why
   aluminium particle size is an instability parameter and not just a
   performance parameter.
9. **Read a pressure–time trace**: identify ignition transient, equilibrium
   burn, tail-off, and sliver burn, and diagnose throat erosion, a hot
   conditioning temperature, or an erosive-burning hump from the shape.
10. **Predict $p_c(t)$ from a $K_n(t)$ table** including throat erosion, and
    say where the quasi-steady assumption behind that prediction fails.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Burn rate (linear regression rate) | $r$ | m/s | speed at which the burning surface moves normal to itself, into the solid |
| Burn-rate coefficient | $a$ | m·s⁻¹·Pa⁻ⁿ | pre-exponential constant in $r = a p^n$; units depend on $n$ |
| Pressure exponent | $n$ | — | exponent in $r = a p^n$; the single most consequential propellant number |
| Burning surface area | $A_b$ | m² | instantaneous area of propellant surface that is regressing |
| Throat area | $A_t$ | m² | nozzle throat cross-section |
| Klemmung (area ratio) | $K_n$ | — | $A_b/A_t$; German *Klemmung*, "constriction". Sets the pressure |
| Port area | $A_p$ | m² | free cross-sectional flow area inside the grain at a station |
| Port-to-throat ratio | $J$ | — | $A_p/A_t$ at the aft end of the grain |
| Propellant density | $\rho_p$ | kg/m³ | cured solid density |
| Combustion-gas density | $\rho_g$ | kg/m³ | density of gas in the port, $p_c/(R_gT_0)$ |
| Characteristic velocity | $c^*$ | m/s | $p_cA_t/\dot m$; see Module 03 |
| Chamber pressure | $p_c$ | Pa | stagnation pressure in the port (head-end, unless stated) |
| Mass generation rate | $\dot m_{gen}$ | kg/s | $\rho_pA_br$ |
| Nozzle discharge rate | $\dot m_{noz}$ | kg/s | $p_cA_t/c^*$ |
| Port mass flux | $G$ | kg/(m²·s) | $\dot m(x)/A_p(x)$ at station $x$ |
| Threshold mass flux | $G_{th}$ | kg/(m²·s) | flux below which erosive burning is negligible |
| Erosive-burning coefficient | $k$ | m³/kg | slope of $r$ against $(G - G_{th})$ in the threshold model |
| Temperature sensitivity of burn rate | $\sigma_p$ | K⁻¹ | $(\partial \ln r/\partial T_i)_p$ |
| Temperature sensitivity of pressure | $\pi_K$ | K⁻¹ | $(\partial \ln p_c/\partial T_i)_{K_n}$ |
| Initial (soak) temperature | $T_i$ | K | bulk temperature of the grain at ignition |
| Flame temperature | $T_0$ | K | adiabatic combustion temperature |
| Surface temperature | $T_s$ | K | temperature of the regressing propellant surface |
| Thermal diffusivity of propellant | $\alpha$ | m²/s | $k_p/(\rho_pc_p)$; sets the thermal-wave thickness |
| Thermal wave thickness | $\delta_{th}$ | m | $\alpha/r$; depth of the preheated layer in the solid |
| Solid-phase relaxation time | $\tau_{th}$ | s | $\alpha/r^2$; time for the thermal wave to re-establish |
| Characteristic length | $L^*$ | m | $V_c/A_t$, free chamber volume over throat area |
| Chamber filling time | $\tau_{fill}$ | s | $L^*/(c^*\Gamma^2)$; gas residence time in the port |
| Web thickness | $w$ | m | propellant thickness to be burned through before burnout |
| Action time | $t_a$ | s | time between 10 % $p_{max}$ points on the rising and falling trace |
| Burn time | $t_b$ | s | time between 50 %–75 % $p_{max}$ points, per the convention stated |
| Sliver | — | kg | propellant remaining after the web burns through, burning at falling $A_b$ |
| Vieille function $\Gamma$ | $\Gamma$ | — | $\sqrt{\gamma}\,[2/(\gamma+1)]^{(\gamma+1)/(2(\gamma-1))}$; see Module 03 |
| Maximum expected operating pressure | MEOP | Pa | pressure the case is designed and proof-tested against |

---

## 3. Theory

### 3.1 What "burning" means for a solid

A solid propellant is a premixed, self-sufficient reactant held in a rigid
matrix. It contains its own oxidiser, so there is no mixing step and no
injector; there is only a surface that consumes itself and moves. **The entire
internal ballistics of a solid motor is the statement that the burning surface
regresses normal to itself at a rate $r$ that depends almost entirely on local
pressure.** [F] That "normal to itself" statement — *Piobert's law*, 1839 — is
what makes grain design tractable: given an initial surface and a scalar $r$,
the surface at time $t$ is the offset surface at distance $\int r\,dt$.
Module 21 uses that fact to design grains; this module supplies $r$.

The mass generated per unit time is

$$\dot m_{gen} = \rho_p A_b r$$

> **Eq. 3.1** — variables: $\dot m_{gen}$ [kg/s], $\rho_p$ [kg/m³], $A_b$ [m²],
> $r$ [m/s]. Meaning: mass of solid converted to gas per second. Assumes: the
> whole surface burns at the same rate, and the propellant is homogeneous at
> the scale of the surface. Fails when: the grain has an unbonded region or a
> crack that suddenly exposes new $A_b$, when part of the surface is inhibited
> or debonded, and when erosive burning makes $r$ a function of position
> (§3.8). Strictly the gas *added to the port* is $(\rho_p - \rho_g)A_br$,
> because the vacated volume was already full of gas; at $p_c = 7.5$ MPa and
> $\rho_g \approx 8$ kg/m³ against $\rho_p = 1750$ kg/m³ that correction is
> 0.46 % and is conventionally absorbed into the $c^*$ efficiency. [A]

### 3.2 The combustion zone: what is actually happening above the surface

If you could freeze a burning AP/HTPB/Al composite and traverse a
thermocouple away from the surface, you would cross four regions in something
under a millimetre. The correct mental model is **not** a flame sitting on the
propellant; it is a stack of coupled zones, and different ones control the
rate at different pressures. [F] The structure below follows `[Kubota ch. 4–7]`
and `[SB §12.1–12.2]`.

**(a) Condensed phase / subsurface zone.** The solid is heated by conduction
from above. The temperature profile in the solid, in the frame of the moving
surface, is the classic convection–diffusion solution

$$T(x) = T_i + (T_s - T_i)\exp\!\left(\frac{r x}{\alpha}\right), \qquad x \le 0$$

> **Eq. 3.2** — variables: $x$ [m] measured into the solid (negative into the
> cold propellant), $T_i$ [K] bulk soak temperature, $T_s$ [K] surface
> temperature, $r$ [m/s], $\alpha$ [m²/s]. Meaning: the preheated layer is an
> exponential of e-folding depth $\delta_{th}=\alpha/r$. Assumes: steady
> one-dimensional regression, constant properties, no subsurface reaction, no
> radiation absorption below the surface. Fails when: the propellant contains
> an energetic plasticiser that reacts below the surface (nitrate-ester
> systems do), when $r$ changes on a time scale comparable to
> $\tau_{th}=\alpha/r^2$, and near an embedded oxidiser particle, where the
> field is not one-dimensional. [F]

With $\alpha \approx 2\times10^{-7}$ m²/s (typical for a filled polymer) and
$r = 8.15$ mm/s, $\delta_{th} = 24.5\ \mu$m and $\tau_{th} = 3.0$ ms. Two
consequences follow immediately and both matter later:

- **The soak temperature $T_i$ enters the energy balance directly.** A warmer
  grain needs less heat from the flame to reach $T_s$, so the surface
  regresses faster. That is the physical origin of $\sigma_p$ (§3.7), and it
  is why solid motors are conditioned before test and why tactical motors
  carry a qualification temperature range instead of a single performance
  point. [F]
- **The preheated layer is thin and its relaxation time is milliseconds.**
  Any pressure oscillation slower than a few hundred hertz sees a
  quasi-steady thermal wave; faster than that, the solid phase cannot keep
  up, and the phase lag between pressure and burn rate is what drives or
  damps acoustic instability (§3.9). [F]

At the surface the binder pyrolyses and the oxidiser decomposes or sublimes.
For AP, decomposition is exothermic and self-sustaining above about 2 MPa; AP
alone will deflagrate without any binder. Surface temperatures are typically
800–1000 K for composites. `[Kubota §4.3]` [E]

**(b) Foam / fizz zone.** Immediately above the surface is a thin two-phase
layer — molten binder, decomposing oxidiser, bubbles of gaseous
decomposition products, and for aluminised propellant, molten aluminium
droplets agglomerating on the surface into much larger drops than the
original 5–30 µm powder. In double-base propellants this is called the *fizz
zone*, where nitrate-ester decomposition produces NO₂ and aldehydes and
releases perhaps a third of the total energy over tens of micrometres.
`[Kubota §6.2]` [F]

**(c) Dark zone.** In double-base and nitramine propellants there is then a
region, visibly dark, where NO₂ reduction to NO proceeds slowly. The dark
zone is a chemical induction region: its thickness scales roughly as $p^{-2}$
and it can be millimetres long at low pressure and disappear entirely at high
pressure. `[Kubota §6.3]` [E] **The dark zone is why plateau and mesa
burn-rate behaviour exists**: when the luminous flame is standing off beyond
the dark zone it does not feed the surface, and $r$ becomes nearly independent
of pressure ($n \to 0$, a *plateau*) or even decreases with pressure (a
*mesa*), until the dark zone collapses and the flame re-attaches. Lead and
copper salts catalyse the NO₂→NO step and are the classical way to engineer a
plateau. [H] Composite AP propellants do not have a true dark zone; they get
their plateau behaviour, when they have it, by other routes.

**(d) Luminous flame zone.** Final oxidation to CO₂/H₂O/HCl/N₂ and, in
aluminised propellant, combustion of aluminium droplets to Al₂O₃. Aluminium
burns *slowly* compared with the gas phase — droplet burn times of
milliseconds — so aluminium combustion is not finished at the surface; it
continues down the port and into the nozzle. That is the origin of
two-phase-flow losses (Module 24), and, usefully, of particle damping
(§3.9). [F]

The heat that drives regression comes back to the surface by conduction from
whichever zone is closest and hottest. **The zone that stands closest to the
surface at a given pressure is the zone that controls $n$.** [F] That single
sentence is the conceptual payoff of this section.

### 3.3 Two models you should be able to argue from

Neither model is used to *predict* burn rate for a real motor — burn rate is
always measured (strand burner, then subscale motor, then full scale, §7).
They are used to explain the trends, to extrapolate sensibly, and to argue
about what a formulation change should do.

**Granular diffusion flame (GDF), Summerfield et al., 1960.** `[Summerfield60]`
`[SB §12.2]` Treats the composite flame as a sequence: oxidiser decomposition
products leave the surface in discrete "pockets" of characteristic size set by
the AP particle size, and the flame is complete only when a pocket has mixed
with fuel vapour by diffusion. The total time is a chemical-kinetic time (fast
at high pressure) plus a diffusion-mixing time (weakly pressure dependent).
The model produces the famous linear form

$$\frac{p}{r} = a' + b'p^{1/3}$$

> **Eq. 3.3** — variables: $p$ [Pa], $r$ [m/s], $a'$, $b'$ empirical constants.
> Meaning: plotting $p/r$ against $p^{1/3}$ linearises composite burn-rate
> data over a useful pressure range; the intercept is the kinetics-controlled
> term and the slope the diffusion-controlled term. Assumes: AP-composite
> propellant, monomodal oxidiser, no metal, no erosive flow. Fails when: the
> propellant is aluminised (the metal changes the near-surface energy
> balance), at very high pressure where the flame collapses to the surface,
> and for nitramine or double-base propellants which have no granular
> diffusion structure. [E]

The GDF prediction that matters: **$n$ should sit near 0.33 when diffusion
controls and rise toward 1 when kinetics controls.** Real composite
propellants cluster at $n = 0.2$–$0.5$, which is the diffusion-dominated
regime, and this is not a coincidence — it is the regime that gives a usable
motor. [J]

**Beckstead–Derr–Price (BDP) multiple-flame model, 1970.** `[BDP70]`
`[Kubota §7.2]` The physically richer picture: three flames coexist above a
composite surface — a *primary diffusion flame* between AP decomposition
products and binder pyrolysis products, a *premixed AP monopropellant flame*
sitting directly over each AP crystal, and a *final diffusion flame* further
out. Each flame stands off at its own distance and delivers heat to the
surface in proportion to how close it is. The model resolves the surface into
AP and binder areas and solves the coupled energy balances.

BDP's predictions you should be able to state without the algebra:

- **Smaller AP particles → higher burn rate.** Reducing particle size shortens
  the diffusion length of the primary flame, moving it closer to the surface.
  This is the dominant formulation lever on $r$ and it is a *physical* lever,
  not a chemical one. [F]
- **Higher pressure → the AP monopropellant flame strengthens and moves in**,
  raising $n$ at high pressure; at low pressure the AP flame extinguishes and
  the primary diffusion flame dominates, lowering $n$. So $n$ is not truly
  constant, and quoting a single $n$ is a fit over a stated range. [E]
- **Bimodal or trimodal oxidiser distributions** — coarse AP for solids
  loading, fine AP for rate — let you move $r$ and solids loading almost
  independently. This is the practical reason production propellants are
  multimodal. [M]
- **Burn-rate catalysts** (iron oxide for AP composites, lead salts for
  double-base) act on the near-surface chemistry, not on the bulk energetics:
  they change $r$ at essentially constant $c^*$ and $T_0$. That is why a 0.2
  percentage-point change in Fe₂O₃ loading is a several-percent change in burn
  rate and therefore a several-percent change in $p_c$ — worth more attention
  than the same change in a structural ingredient. [F]

Where the field disagrees: BDP-family models with modern kinetics reproduce
measured $r(p)$ for well-characterised laboratory propellants within roughly
±10–20 %, but they do not reliably predict the effect of a new ingredient
without refitting, and the community has never converged on a first-principles
model of aluminium agglomeration at the surface. `[Kubota §7.4]`, `[Davenas]`
[R] Treat all of §3.3 as explanation, never as a design tool.

### 3.4 The Saint-Robert / Vieille law

Empirically, over a bounded pressure range and at fixed initial temperature,

$$\boxed{\,r = a\,p^{\,n}\,}$$

> **Eq. 3.4** — variables: $r$ [m/s], $p$ [Pa], $a$ [m·s⁻¹·Pa⁻ⁿ], $n$ [—].
> Meaning: the propellant's constitutive law, measured not derived. Assumes:
> fixed initial temperature $T_i$; no cross-flow over the surface; quasi-steady
> combustion (pressure changing slowly compared with $\tau_{th}$); pressure
> inside the fitted range. Fails when: outside the fitted range (extrapolation
> across a plateau is a common and expensive error), during the ignition
> transient and tail-off where $dp/dt$ is large, in the aft end of a
> high-$G$ port (§3.8), and at very low pressure where the propellant may not
> sustain combustion at all (the *deflagration limit*, typically 0.5–1.5 MPa
> for AP composites). [E]

Two independent 19th-century attributions — Vieille in France, Saint-Robert
in Italy — and the law is called by either name or both. [H]

**Units are the standard trap.** $a$ has units of m·s⁻¹·Pa⁻ⁿ only when both
$r$ and $p$ are in SI. Vendors quote it in mm/s per MPa$^n$, in/s per psi$^n$,
and occasionally cm/s per bar$^n$. Converting requires raising the pressure
unit conversion to the power $n$:

$$a_{\mathrm{SI}} = a_{[\mathrm{mm/s,MPa}]}\times 10^{-3}\times\left(10^{-6}\right)^{n}$$

> **Eq. 3.5** — meaning: unit conversion for the burn-rate coefficient.
> Assumes: same $n$ in both systems (true — $n$ is dimensionless). Fails when:
> someone has quoted "$a$" for a law written as $r = a(p/p_{ref})^n$, which is
> a different and much safer convention; always check whether a reference
> pressure is present. [F]

Throughout this module the generic propellant is

$$a = 3.2\times10^{-5}\ \mathrm{m\,s^{-1}Pa^{-0.35}},\quad n = 0.35,\quad
\rho_p = 1750\ \mathrm{kg/m^3},\quad c^* = 1500\ \mathrm{m/s},\quad
\sigma_p = 0.0020\ \mathrm{K^{-1}}$$

which gives $r = 7.96$ mm/s at 7.0 MPa (1015 psia) — an unremarkable
aluminised AP composite. These numbers are **generic**, not any real
propellant; per the course scope boundary, no module in Part III publishes a
formulation or its measured coefficients beyond fact-sheet level.

### 3.5 Equilibrium chamber pressure from a mass balance

Conservation of mass for the gas in the port:

$$\frac{d}{dt}\left(\rho_g V_c\right) = \rho_p A_b r - \frac{p_c A_t}{c^*}$$

> **Eq. 3.6** — variables: $\rho_g$ [kg/m³] port gas density, $V_c$ [m³] free
> port volume, remaining symbols as §2. Meaning: gas accumulates in the port
> at the difference between what the surface makes and what the throat passes.
> Assumes: choked nozzle, uniform port properties (a "lumped" chamber),
> $c^*$ constant, no gas storage in cracks or the igniter cavity. Fails when:
> the nozzle is not yet choked (early ignition transient), when the port is
> long and slender enough that the head-to-aft pressure drop is not negligible,
> and when significant mass is stored in an unvented crack. [F]

At equilibrium the left side is zero:

$$\rho_p A_b\,a\,p_c^{\,n} = \frac{p_c A_t}{c^*}
\;\Longrightarrow\;
p_c^{\,1-n} = a\rho_p c^*\frac{A_b}{A_t}$$

$$\boxed{\,p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{\frac{1}{1-n}},\qquad K_n \equiv \frac{A_b}{A_t}\,}$$

> **Eq. 3.7** — variables: $p_c$ [Pa], $a$ [m·s⁻¹·Pa⁻ⁿ], $\rho_p$ [kg/m³],
> $c^*$ [m/s], $K_n$ [—]. Meaning: the design equation of solid internal
> ballistics. Everything the designer controls appears once: chemistry in
> $a$, $n$, $\rho_p$, $c^*$; geometry in $K_n$. Assumes: everything in Eq. 3.6
> plus $n < 1$ (else no stable root) plus quasi-steady operation. Fails when:
> erosive burning makes $r$ position-dependent, during transients, and when
> $A_t$ is changing fast enough that "equilibrium" is not reached — which,
> given a relaxation time of a few milliseconds (§3.6), essentially never
> happens in a large motor. [F]

Three things to internalise:

1. **$p_c$ does not depend on motor size.** Double every length and $K_n$ is
   unchanged; the pressure is unchanged. Scale a motor and you scale thrust,
   not pressure. [F]
2. **The exponent $1/(1-n)$ amplifies every error in the base.** With
   $n = 0.35$ the amplification is 1.538: a 1 % error in $a$, in $c^*$, in
   $\rho_p$, or in $K_n$ becomes a 1.54 % error in $p_c$. With $n = 0.7$ it is
   3.33. **Everything anyone dislikes about high-$n$ propellants follows from
   this single number.** [F]
3. **$c^*$ appears, so a $c^*$ efficiency error moves the pressure.** Real
   motors deliver $\eta_{c^*} \approx 0.94$–$0.98$; use the *delivered* $c^*$
   in Eq. 3.7 or the predicted pressure is high. [J]

### 3.6 Why $n < 1$: the graphical and the dynamic argument

**Graphical.** Plot both sides of Eq. 3.6 against $p$ at fixed geometry:

```
  mdot
   ^                                   discharge: mdot = p At / c*   (slope 1)
   |                              /
   |                            /
   |                          /      generation, n<1: mdot = rho_p Ab a p^n
   |                        /  ,-''''''''
   |                      / ,-'
   |                    /,-'
   |                  ,X  <-- p_eq : the only crossing
   |               ,-'/
   |            ,-'  /
   |         ,-'    /
   +--------------------------------------------> p
```

The discharge line is exactly linear in $p$ (choked flow, Module 02). The
generation curve is $p^n$: **concave** for $n<1$. They cross once, at $p_{eq}$.
To the right of the crossing the linear discharge line is above the concave
generation curve, so mass leaves faster than it is made, and $p$ falls back to
$p_{eq}$. To the left, generation exceeds discharge and $p$ rises. The
equilibrium is **stable**. [F]

Now set $n>1$. The generation curve is convex; it starts below the discharge
line and crosses it going upward. To the right of the crossing, generation
exceeds discharge — pressure rises, which raises generation faster than
discharge, which raises pressure. **Runaway to case burst in milliseconds.**
The crossing is an unstable equilibrium and the motor sits on a knife edge.
[F] This is not a hypothetical: propellants with $n$ near or above 1 exist
(some high-energy nitramine and double-base formulations approach it at high
pressure), and they are precisely the ones that produce case ruptures when a
grain crack raises $A_b$ or a nozzle erodes.

**Dynamic.** The graphical argument gives stability but not a time scale. Take
Eq. 3.6, write $\rho_g = p/(R_gT_0)$ with $V_c$, $T_0$, $A_b$, $A_t$ momentarily
constant, and note from Module 03 that $c^* = \sqrt{R_gT_0}/\Gamma$, so
$R_gT_0 = (c^*\Gamma)^2$:

$$\frac{V_c}{(c^*\Gamma)^2}\frac{dp}{dt} = \rho_pA_b a p^n - \frac{pA_t}{c^*}$$

Perturb about equilibrium, $p = p_{eq}(1+\varepsilon)$, and linearise. Using
$\rho_pA_bap_{eq}^n = p_{eq}A_t/c^*$ to eliminate the coefficient:

$$\frac{d\varepsilon}{dt} = -\frac{(1-n)}{\tau_{fill}}\,\varepsilon,
\qquad \tau_{fill} \equiv \frac{V_c}{A_t c^*\Gamma^2} = \frac{L^*}{c^*\Gamma^2}$$

> **Eq. 3.8** — variables: $\varepsilon$ [—] fractional pressure perturbation,
> $\tau_{fill}$ [s], $L^*=V_c/A_t$ [m], $\Gamma$ [—]. Meaning: pressure
> perturbations decay exponentially with time constant $\tau_{fill}/(1-n)$;
> the decay rate is proportional to $(1-n)$, so the closer $n$ is to 1 the
> slower the motor recovers from an upset, and at $n>1$ the exponent changes
> sign and perturbations grow. Assumes: lumped chamber, quasi-steady burn rate
> (the surface responds instantly), constant $T_0$, choked throat, small
> perturbation. Fails when: the perturbation period approaches the solid-phase
> relaxation time $\tau_{th}=\alpha/r^2$ — then the burn rate lags the pressure
> and this analysis is invalid; that is the domain of §3.9. [F]

For $L^*=2$ m, $c^*=1500$ m/s, $\gamma=1.18$ ($\Gamma = 0.6446$):
$\tau_{fill} = 3.2$ ms and the relaxation time is $\tau_{fill}/(1-n) = 4.9$ ms.
**Compare that with $\tau_{th} = 3.0$ ms from §3.2. They are the same order of
magnitude, and that near-coincidence is exactly why solid motors have an
$L^*$ instability.** [F]

**$L^*$ instability.** If $L^*$ is small (a nearly-filled chamber, i.e. early
in the burn, or an inherently short motor) then $\tau_{fill}$ shrinks below the
solid-phase relaxation time. The chamber can now change pressure faster than
the propellant's thermal wave can adjust its burn rate, the quasi-steady
assumption behind Eq. 3.4 breaks, and the burn rate responds with a phase lag.
The result is a low-frequency (typically 10–100 Hz), non-acoustic, bulk-mode
oscillation — sometimes called *chuffing* in its violent form, where the motor
extinguishes and re-ignites repeatedly. It is the direct analogue of the
liquid-engine $L^*$ instability in Module 15, with the propellant's thermal
wave playing the role of the injector-to-flame lag. `[SB §13.4]`, `[Kubota §13]`
[F] The fix is architectural: raise $L^*$, raise $p_c$ (raising $r$ shrinks
$\tau_{th}$ as $1/r^2$), or reformulate. [J]

### 3.7 Temperature sensitivity: $\sigma_p$ and $\pi_K$

$T_i$ enters through the surface energy balance (§3.2), so the burn-rate
coefficient is really $a(T_i)$. Over the modest range of interest the
dependence is close to exponential, and the field defines

$$\sigma_p \equiv \left(\frac{\partial \ln r}{\partial T_i}\right)_p
\;\Longrightarrow\;
\frac{r_2}{r_1} = \exp\!\left[\sigma_p (T_{i,2}-T_{i,1})\right]
\quad\text{at constant }p$$

> **Eq. 3.9** — variables: $\sigma_p$ [K⁻¹], $T_i$ [K]. Meaning: fractional
> change in burn rate per kelvin of soak temperature, measured **at constant
> pressure** — that is, in a strand burner or a closed bomb, not in a motor.
> Assumes: $\sigma_p$ constant over the range; grain uniformly soaked. Fails
> when: the range spans a binder glass transition or an ingredient phase
> change (AP has a crystallographic transition near 513 K, far above any soak
> condition, but plasticised binders can transition inside the military
> $-54$ °C to $+71$ °C range), and when the grain is *not* uniformly soaked —
> a thick grain takes days to equilibrate and a rapid transfer from a cold
> magazine to a warm launcher leaves a gradient. [E]

Now put $a(T_i)$ into Eq. 3.7 and take logarithms:

$$\ln p_c = \frac{1}{1-n}\left[\ln a(T_i) + \ln(\rho_p c^* K_n)\right]$$

Differentiate at constant $K_n$ (fixed geometry — the same motor, a different
day):

$$\boxed{\,\pi_K \equiv \left(\frac{\partial \ln p_c}{\partial T_i}\right)_{K_n}
= \frac{\sigma_p}{1-n}\,}$$

> **Eq. 3.10** — variables: $\pi_K$ [K⁻¹], $\sigma_p$ [K⁻¹], $n$ [—]. Meaning:
> the temperature sensitivity of *chamber pressure* is the temperature
> sensitivity of *burn rate* amplified by the same $1/(1-n)$ that amplifies
> everything else. Assumes: $n$ independent of $T_i$ (good to first order),
> fixed geometry, equilibrium operation, $c^*$ and $\rho_p$ temperature
> independent (thermal expansion of the grain is a $10^{-4}$/K effect on
> $\rho_p$ and is neglected). Fails when: $n$ itself varies with temperature,
> and outside the qualified temperature range. [F]

With $\sigma_p = 0.0020$ K⁻¹ and $n = 0.35$: $\pi_K = 0.00308$ K⁻¹, i.e.
**0.31 % pressure change per kelvin**. Over a $\pm 40$ K conditioning band
that is $\times1.131$ / $\times0.884$ on chamber pressure — a 28 % spread
between the cold and hot extremes of the same motor. Push $n$ to 0.7 with the
same $\sigma_p$ and $\pi_K$ doubles to 0.67 %/K; the same band gives
$\times1.34$ / $\times0.74$, an 80 % spread. **This is the second reason
nobody wants high $n$, and for a tactical motor qualified from $-54$ °C to
$+71$ °C (a 125 K band) it is the dominant reason.** [F]

Two corollaries a grader will look for:

- **At constant $K_n$, the burn rate ratio equals the pressure ratio.** Since
  $\dot m = p_cA_t/c^*$ and $\dot m = \rho_pA_br$ with $A_b$, $A_t$ fixed,
  $r_2/r_1 = p_{c,2}/p_{c,1} = \exp(\pi_K\Delta T)$. Note this is *not*
  $\exp(\sigma_p\Delta T)$ — the strand-burner number understates what happens
  in a motor, because the motor also raises its own pressure. [F]
- **Total impulse is nearly invariant; thrust and burn time are not.** The
  propellant mass is fixed and $I_{sp}$ depends only weakly on $p_c$, so a hot
  motor delivers roughly the same total impulse as a cold one, at higher
  thrust for a shorter time: $t_b \propto \exp(-\pi_K\Delta T)$. A hot-day
  launch is a higher-max-Q launch, not a higher-energy one. [F]

### 3.8 Erosive burning

Everything above assumed the burn rate depends on pressure alone. It does not.
Where gas flows fast and parallel to a burning surface, the convective heat
flux to that surface increases, the flame is pushed closer, and the surface
regresses faster. This is **erosive burning**. [F]

**Where it appears in a grain.** Mass accumulates as gas flows from the head
end toward the nozzle, so the mass flux $G = \dot m(x)/A_p(x)$ is largest at
the **aft end of the port**, and largest of all **at the start of the burn**,
when the port is at its smallest. So erosive burning is an *aft-end,
early-time* phenomenon, and its signature on the pressure trace is a
**hump in the first few percent of the burn** that decays as the port opens
up. In a long, thin, low-$J$ grain — a tactical motor, a first-stage motor
with a high length-to-diameter ratio, an internal-burning tube with a small
initial port — the hump can be 10–30 % of nominal pressure. In a fat, short
motor with a generous port it is invisible. [F]

The standard correlation is **Lenoir–Robillard (1957)** `[Lenoir57]`,
`[SB §12.5]`, `[SP-8076]`:

$$r = \underbrace{a p^{n}}_{r_0} + \underbrace{\frac{\alpha_{LR}\,G^{0.8}}{D_h^{0.2}}\exp\!\left(-\frac{\beta_{LR}\,\rho_p r}{G}\right)}_{r_e}$$

> **Eq. 3.11** — variables: $G$ [kg/(m²·s)] local port mass flux, $D_h$ [m]
> port hydraulic diameter, $\alpha_{LR}$, $\beta_{LR}$ empirical constants
> fitted per propellant. Meaning: the erosive term is a turbulent-convection
> heat-transfer law — the $G^{0.8}D_h^{-0.2}$ group is exactly the
> Dittus–Boelter/Colburn scaling from Module 10 — multiplied by a blowing
> correction: gas leaving the surface at $\rho_p r$ thickens the boundary
> layer and *shields* the surface, which is the exponential factor. Assumes:
> turbulent port flow, fully developed, subsonic; constants fitted to this
> propellant at this pressure. Fails when: extrapolated to another propellant
> (the constants are not transferable), in the entrance region of the port,
> near a slot or fin where the flow is three-dimensional, and at transonic
> port Mach numbers. Note that $r$ appears on both sides — Eq. 3.11 is
> implicit and must be solved iteratively. [E]

For hand analysis and for this module's worked examples, a **threshold form**
is enough and is easier to defend because its two constants have obvious
meanings:

$$r = a p^n + k\,\langle G - G_{th}\rangle, \qquad
\langle x\rangle = \max(x,0)$$

> **Eq. 3.12** — variables: $k$ [m³/kg] erosive slope, $G_{th}$
> [kg/(m²·s)] threshold flux. Meaning: below a threshold flux the boundary
> layer's blowing shield wins and there is no augmentation; above it,
> augmentation is roughly linear in the excess. Assumes: constants fitted to
> data, single propellant, subsonic port. Fails when: used outside the fit,
> and it will always understate the sharp onset seen in some data. It is a
> teaching and preliminary-design model, not a qualification model. [E][A]

**The threshold in engineering terms.** Two equivalent rules of thumb are in
common use, and both should be in your head: [E][J]

- **Port-to-throat area ratio.** $J = A_p/A_t$ at the aft end. $J > 2$ is
  usually comfortable; $J < 1.5$ almost guarantees a visible erosive hump.
  $J$ is the more useful number because it is a pure geometry ratio the
  designer controls directly, and because $J$ fixes the port Mach number:
  treating the port as a subsonic duct feeding a choked throat, $J = A/A^*$,
  so $J=2$ gives $M_{port}\approx0.31$ and $J=4$ gives $M_{port}\approx0.15$
  for $\gamma = 1.18$.
- **Port Mach number.** Erosive burning becomes significant above roughly
  $M \approx 0.2$–$0.3$. This is the same criterion in different clothes.

**The feedback loop is the part students miss.** Erosive burning raises $r$,
which raises $\dot m$, which raises $p_c$ (since the throat is fixed), which
raises $G$, which raises the erosive augmentation again. The equilibrium is
still stable for $n<1$ — the discharge line still wins eventually — but the
converged pressure can be far above the non-erosive prediction. Worked
Example 4 solves this loop and finds an 18 % pressure rise from a 37 % local
augmentation. **You cannot compute the erosive hump by evaluating Eq. 3.12
once at the nominal pressure.** [F]

### 3.9 Combustion instability in solid motors

A solid motor's chamber is an acoustic cavity with a distributed energy source
on its walls. If the pressure oscillation and the heat release are in phase
over a cycle, energy feeds the oscillation — Rayleigh's criterion, exactly as
in Module 15. What is different from a liquid engine is the *source of the
phase relationship*: not an injector-to-flame convection lag but the thermal
inertia of the solid phase. [F]

**Bulk mode versus acoustic modes.** The $L^*$/bulk mode of §3.6 has no spatial
structure — the whole chamber rises and falls together, at tens of hertz.
Acoustic modes have wavelengths set by the cavity:

$$f_{1L} = \frac{a_g}{2L_c}, \qquad
f_{1T} = \frac{1.8412\,a_g}{\pi D}, \qquad
a_g = \sqrt{\gamma R_g T_0}$$

> **Eq. 3.13** — variables: $f_{1L}$, $f_{1T}$ [Hz] first longitudinal and
> first tangential frequencies, $a_g$ [m/s] speed of sound in the combustion
> gas, $L_c$ [m] chamber length, $D$ [m] port diameter, 1.8412 the first zero
> of $J_1'$. Meaning: the discrete frequencies the chamber will ring at.
> Assumes: uniform gas properties, simple cylindrical geometry, rigid walls,
> no mean flow correction. Fails when: the port is star-shaped or slotted (the
> transverse mode shapes are then not Bessel functions), when the gas is
> heavily particle-laden (the effective sound speed drops), and as the grain
> burns back and $L_c$, $D$ change — **the mode frequencies sweep during the
> burn, which is why instability often appears only in a window of the
> trace**. [F]

With $\gamma = 1.18$, $c^*=1500$ m/s ($a_g = 1050$ m/s): a 6 m chamber rings
at 88 Hz longitudinally; a 1.2 m port rings at 513 Hz in the first tangential.
Large boosters therefore have *low*-frequency problems and tactical motors
*high*-frequency ones. [F]

**Gains.** The propellant's *pressure-coupled response function* $R_p$ —
the normalised amplitude and phase of $r'$ relative to $p'$ — is the driving
gain. It peaks when the oscillation period is comparable to the solid-phase
relaxation time $\tau_{th} = \alpha/r^2$, i.e. near
$f \sim r^2/(2\pi\alpha)$; for $r=8.15$ mm/s and $\alpha = 2\times10^{-7}$
m²/s that is about 53 Hz, and the response stays significant over a decade
either side. Measuring $R_p$ is genuinely hard: the T-burner is the standard
apparatus and the field openly acknowledges scatter between laboratories and
between reduction methods. `[YA95]`, `[Culick06]`, `[SP-8039]` [R] There is
also a *velocity-coupled* response, driven by the oscillating parallel
velocity over the surface rather than the pressure — the unsteady cousin of
erosive burning — which is less well characterised and is usually the
suspect when a motor goes unstable in a way the pressure-coupled response
cannot explain. [R]

**Losses (what the designer can actually do).** [M][J]

- **Particle damping.** Condensed Al₂O₃ droplets lag the oscillating gas and
  dissipate energy viscously. The damping is maximised when the particle
  velocity relaxation time matches the acoustic period,
  $\omega\tau_p \approx 1$ with $\tau_p = \rho_{Al_2O_3}d^2/(18\mu)$. Solving
  for the optimum diameter at $\rho = 3960$ kg/m³ and $\mu = 8\times10^{-5}$
  Pa·s gives $d \approx 24\ \mu$m at 100 Hz, $11\ \mu$m at 500 Hz, and
  $5\ \mu$m at 2 kHz. **That range is exactly the aluminium powder size range
  used in production propellant**, and the coincidence is not accidental —
  aluminium loading and particle size are chosen for performance *and* for
  damping, and where a motor has a known instability the powder specification
  is one of the first knobs turned. Adding a few percent of inert refractory
  powder purely for damping is also done. [M]
- **Nozzle damping.** Acoustic energy convected out of the throat. Grows with
  throat area, so a high-$K_n$ motor is inherently less damped.
- **Structural / viscoelastic damping** in the grain and liner.
- **Geometry.** Axial slots, fins, and resonance rods break up transverse mode
  shapes. This is the solid-motor analogue of the liquid engine's acoustic
  cavities and baffles (Module 15), and like them it is usually retrofitted
  after a motor misbehaves rather than designed in from the start. [H]

**Symptoms on the data.** Combustion instability in a solid shows as a
high-frequency oscillation superimposed on the trace *plus*, characteristically,
a **rise in mean chamber pressure** — the "DC shift". The oscillating velocity
field increases the mean burn rate through the same convective mechanism as
erosive burning, so an unstable motor burns faster and hotter than predicted
and can exceed MEOP even when the oscillation amplitude alone looks tolerable.
**Never assess a solid-motor instability from the oscillation amplitude
without also checking the mean.** `[SP-8039]`, `[Culick06]` [F]

### 3.10 The pressure–time trace and how to read it

```
 p_c
  ^
  |        ,--''-.._                          <- equilibrium burn: p_c follows K_n(t)
  |      ,'         ''--..__
  |    ,'                   ''-.._
  |   /                           '-.
  |  |  <- ignition transient          '-.    <- tail-off (web burnout)
  |  |     (ms; igniter + fill)           '-._
  |  |                                        '--..___   <- sliver burn
  +--+--------------------------------------------------------> t
     ^ignition delay
```

**Ignition transient.** Igniter fires, hot gas and particles heat the surface
to $T_s$, flame spreads over the surface, the chamber fills. Three time scales
in series: igniter output rise (ms), flame spreading over the grain surface
(ms to tens of ms, and *this* is the term that scales badly with motor size),
and chamber filling at $\tau_{fill}$ (ms). Total: a few ms for a small tactical
motor, 100–300 ms for a large segmented booster. The transient often
**overshoots** the equilibrium pressure, because the igniter is still adding
mass after the main grain has lit and because the port is at its smallest, so
erosive burning is at its worst. The ignition overshoot and the erosive hump
are usually the peak pressure of the entire firing and therefore the number
MEOP is set against. `[SP-8051]` [F]

**Equilibrium burn.** $p_c$ tracks $K_n(t)$ through Eq. 3.7 with the
$1/(1-n)$ amplification. The trace is *progressive* if $A_b$ rises,
*neutral* if flat, *regressive* if falling — grain-design vocabulary that
Module 21 makes geometric. Superimposed on it, always, is a slow downward
drift from throat erosion (§3.11).

**Tail-off.** When the web burns through, $A_b$ collapses and the chamber
blows down through the nozzle. The blowdown is governed by Eq. 3.6 with the
generation term shrinking; the decay time constant is $\tau_{fill}$, but
$\tau_{fill} = L^*/(c^*\Gamma^2)$ is now at its *largest*, because $V_c$ is the
whole burned-out case. A large motor therefore has a long, soft tail-off. The
engineering problem with tail-off is **impulse dispersion**: the tail-off can
carry 2–5 % of total impulse, it is the least repeatable part of the trace, and
for an upper stage whose burnout velocity sets the orbit it is a direct error
source. [F]

**Sliver.** If the web does not burn through everywhere at once — and in any
grain with a non-uniform web it does not — the leftover propellant is the
*sliver*. It burns at a small and falling $A_b$, producing a long low-pressure
tail that contributes little useful impulse (low $p_c$ means low $C_f$ and low
$I_{sp}$) while adding inert-like mass. Typical slivers are 1–3 % of propellant
mass in a well-designed grain and up to 5–8 % in a poorly designed one. Sliver
elimination is one of the main objectives of grain design (Module 21). [E]

### 3.11 How $p_c$, $A_b$, and $A_t$ actually interact

Eq. 3.7 has three time-varying inputs in flight, not one:

$$p_c(t) = \left[a(T_i)\,\rho_p\,c^*\,\frac{A_b(t)}{A_t(t)}\right]^{\frac{1}{1-n}}$$

- **$A_b(t)$** from the grain geometry offset by $\int r\,dt$ (Module 21).
- **$A_t(t)$** from nozzle throat erosion. A carbon-phenolic or graphite throat
  in an aluminised, HCl-rich exhaust erodes at typically 0.05–0.25 mm/s,
  giving 2–10 % throat area growth over a long burn (Module 24). Higher for
  small throats, higher with higher $p_c$, higher with more aluminium.
- **$a(T_i)$** from the soak temperature, fixed at ignition.

The sensitivities, all of them obtained by differentiating the logarithm of
Eq. 3.7:

$$\frac{\delta p_c}{p_c} = \frac{1}{1-n}\left[\frac{\delta A_b}{A_b} - \frac{\delta A_t}{A_t} + \frac{\delta a}{a} + \frac{\delta c^*}{c^*} + \frac{\delta \rho_p}{\rho_p}\right]$$

> **Eq. 3.14** — variables: fractional perturbations of each input. Meaning:
> the influence-coefficient form of Eq. 3.7 — the equation you use to build a
> ballistic error budget. Assumes: small perturbations, $n$ constant.
> Fails when: perturbations are large (use Eq. 3.7 directly), or when the
> perturbation itself changes $n$ — a grain crack, for example, does not just
> raise $A_b$, it exposes surface at a location with different flow
> conditions. [F]

**Throat erosion is the one term with a benign second-order effect.** Growing
$A_t$ lowers $p_c$ by $1/(1-n)$ times the area growth, but thrust is
$F = C_f p_c A_t$, so to first order the $A_t$ growth partly cancels:

$$\frac{\delta F}{F} \approx \frac{\delta C_f}{C_f} + \left(1 - \frac{1}{1-n}\right)\frac{\delta A_t}{A_t}
= \frac{\delta C_f}{C_f} - \frac{n}{1-n}\frac{\delta A_t}{A_t}$$

At $n = 0.35$ the coefficient is $-0.538$: a 3 % throat growth costs 1.6 % of
thrust, not 4.4 %. (The $\delta C_f$ term is a further small loss because
growing $A_t$ at fixed $A_e$ reduces $\varepsilon$.) **Chamber pressure is the
sensitive indicator of throat erosion; thrust is not.** That is a useful
diagnostic on a static-test stand and a warning about instrumenting a flight
motor with thrust alone. [F]

**And the malign case: a grain crack.** A crack exposes new burning surface
that was not in the design $A_b$. If it adds 20 % to $A_b$, pressure rises by
$1.20^{1.538} = 1.32$, a 32 % overpressure, in the few milliseconds of
$\tau_{fill}/(1-n)$. Now do the same sum at $n = 0.7$: $1.20^{3.33} = 1.83$.
**The propellant's pressure exponent is a structural-integrity parameter.**
Module 22 sizes the case; this is the load it is being sized against. [F]

---

## 4. Typical engineering ranges

| quantity | typical range | who sits at the extreme |
|---|---|---|
| Burn rate $r$ at 7 MPa | 1–100 mm/s | Large boosters and upper-stage motors cluster at 6–12 mm/s (RSRM, GEM, Star 48B class); gas generators and slow-burn sustainers go below 2 mm/s; tactical boost motors and some high-burn-rate formulations reach 25–50 mm/s and specialist compositions higher still |
| Pressure exponent $n$ | 0.2–0.5 (AP composite); 0.3–0.7 (nitramine/high-energy); ≈0 over a band (plateau); <0 (mesa) | Large civil boosters sit deliberately low, 0.25–0.40; high-energy tactical and strategic formulations run higher and pay for it in temperature sensitivity |
| Burn-rate coefficient $a$ | propellant- and unit-specific | must be quoted with $n$ and the unit system; meaningless alone |
| Propellant density $\rho_p$ | 1600–1900 kg/m³ | AP/Al composites 1750–1850; unaluminised and gas-generator propellants lower |
| $c^*$ (delivered) | 1450–1600 m/s | AP/Al composites ≈1520–1580 ideal, $\eta_{c^*}$ 0.94–0.98 |
| Chamber pressure $p_c$ | 3–15 MPa (430–2200 psia) | RSRM ≈6.25 MPa nominal, ≈6.4 MPa peak — deliberately low for a heavy segmented steel case; tactical and upper-stage motors run higher because a filament-wound case makes pressure cheap |
| $K_n = A_b/A_t$ | 150–500 | Sets $p_c$ through Eq. 3.7 together with the propellant; low-$r$ propellants need high $K_n$ for the same pressure |
| $\sigma_p$ | 0.001–0.009 K⁻¹ (0.1–0.9 %/K) | AP composites at the low end, 0.1–0.3 %/K; double-base and nitramine systems substantially higher |
| $\pi_K$ | 0.0015–0.02 K⁻¹ | $=\sigma_p/(1-n)$; the worst combination is a high-$\sigma_p$, high-$n$ propellant in a wide-temperature tactical application |
| Port-to-throat ratio $J$ (initial, aft) | 1.5–4 | Below 1.5 expect a visible erosive hump; large boosters with generous ports sit above 3 |
| Throat erosion over a burn | 2–10 % on $A_t$ | Long-burn, high-aluminium, small-throat motors at the top; short-burn upper-stage motors at the bottom |
| Ignition transient duration | 2 ms – 300 ms | Small tactical motors at the bottom; a segmented booster with a pyrogen igniter at the top |
| Sliver fraction | 1–8 % of propellant mass | Well-designed internal-burning stars at the bottom |
| Burn time $t_b$ | 1 s – 150 s | Tactical boost pulses ≈1–3 s; RSRM ≈123–124 s action time; Star 48B ≈87 s; GEM-63 ≈97.6 s |
| Deflagration (low-pressure) limit | 0.5–1.5 MPa | Sets the pressure below which a motor simply goes out — relevant to tail-off and to thrust termination |

Real-motor figures above are from `reference/_verify-solid-coldgas.md` and
carry their confidence labels there; the RSRM chamber pressure is confidence
**B** and the burn time confidence **A**.

---

## 5. Worked examples

All five use the generic propellant of §3.4:
$a = 3.2\times10^{-5}$ m·s⁻¹·Pa⁻⁰·³⁵, $n = 0.35$, $\rho_p = 1750$ kg/m³,
$c^* = 1500$ m/s, $\sigma_p = 0.0020$ K⁻¹, $\gamma = 1.18$. The motor is
generic: throat diameter $D_t = 0.10$ m. Arithmetic is in
`tools/examples/20.py` and uses `rocket.py`.

### WE1 — Equilibrium chamber pressure, burn rate, mass flow, thrust

**Given.** $D_t = 0.10$ m; the grain presents $K_n = 350$ at this instant.

**Throat area.**
$$A_t = \frac{\pi D_t^2}{4} = \frac{\pi(0.10\ \mathrm{m})^2}{4} = 7.854\times10^{-3}\ \mathrm{m^2}$$

**Burning surface.**
$$A_b = K_nA_t = 350 \times 7.854\times10^{-3}\ \mathrm{m^2} = 2.749\ \mathrm{m^2}$$

**Equilibrium pressure** (Eq. 3.7). First the base:
$$a\rho_pc^*K_n = (3.2\times10^{-5})(1750)(1500)(350) = 2.940\times10^{4}$$
in units of Pa$^{0.65}$ (check: m·s⁻¹Pa⁻⁰·³⁵ × kg·m⁻³ × m·s⁻¹ = Pa⁻⁰·³⁵·kg·m⁻¹·s⁻² = Pa$^{0.65}$ ✓).

$$p_c = \left(2.940\times10^{4}\right)^{1/0.65} = \left(2.940\times10^{4}\right)^{1.5385} = 7.488\times10^{6}\ \mathrm{Pa}$$

$$\boxed{p_c = 7.488\ \mathrm{MPa}\ (1086\ \mathrm{psia})}$$

**Burn rate** (Eq. 3.4):
$$r = 3.2\times10^{-5}\times(7.488\times10^{6})^{0.35} = 8.150\times10^{-3}\ \mathrm{m/s} = 8.150\ \mathrm{mm/s}$$

**Mass flow, both ways — this is the check that the algebra is right.**
$$\dot m_{gen} = \rho_pA_br = 1750 \times 2.749 \times 8.150\times10^{-3} = 39.21\ \mathrm{kg/s}$$
$$\dot m_{noz} = \frac{p_cA_t}{c^*} = \frac{7.488\times10^{6}\times7.854\times10^{-3}}{1500} = 39.21\ \mathrm{kg/s}\ \checkmark$$

**Thrust.** Taking $C_f = 1.55$ (a sea-level-optimised $\varepsilon \approx 8$
nozzle, Module 03):
$$F = C_fp_cA_t = 1.55\times7.488\times10^{6}\times7.854\times10^{-3} = 9.12\times10^{4}\ \mathrm{N} = 91.2\ \mathrm{kN}$$

**Sanity check.** 91 kN from a 100 mm throat at 7.5 MPa is a small
sounding-rocket or tactical-class motor. The chamber pressure sits between the
RSRM's ≈6.25 MPa and the 8–10 MPa typical of filament-wound upper-stage
motors — a plausible place for a generic motor to live. The burn rate of
8.2 mm/s is squarely in the 6–12 mm/s band that large composite-propellant
motors occupy.

### WE2 — Pressure and burn-time shift for $\pm 40$ K conditioning

**Given.** The WE1 motor, conditioned to $T_i = T_{ref} \pm 40$ K.

**Temperature sensitivity of pressure** (Eq. 3.10):
$$\pi_K = \frac{\sigma_p}{1-n} = \frac{0.0020\ \mathrm{K^{-1}}}{1-0.35} = 3.077\times10^{-3}\ \mathrm{K^{-1}} = 0.308\ \%/\mathrm{K}$$

**Hot, $\Delta T = +40$ K:**
$$\frac{p_{c,hot}}{p_{c,ref}} = \exp(\pi_K\Delta T) = \exp(3.077\times10^{-3}\times40) = \exp(0.1231) = 1.1310$$
$$p_{c,hot} = 1.1310 \times 7.488\ \mathrm{MPa} = 8.469\ \mathrm{MPa}\ (1228\ \mathrm{psia})$$

**Cold, $\Delta T = -40$ K:**
$$\frac{p_{c,cold}}{p_{c,ref}} = \exp(-0.1231) = 0.8842
\;\Longrightarrow\; p_{c,cold} = 6.621\ \mathrm{MPa}\ (960\ \mathrm{psia})$$

**Compare with the strand-burner number.** At constant pressure the burn rate
would only change by $\exp(\sigma_p\Delta T) = \exp(0.08) = 1.0833$, i.e.
8.3 %. In the motor the change is 13.1 %, because the motor also raises its own
pressure, which raises the rate again. **The factor between them is exactly
$1/(1-n)$ in the exponent.** Quoting $\sigma_p$ where $\pi_K$ is meant
understates the hot-day pressure by a third of the excursion.

**Burn time.** With $A_b$, $A_t$ fixed, $r \propto p_c$, so
$$\frac{t_{b,hot}}{t_{b,ref}} = \frac{1}{1.1310} = 0.884,\qquad
\frac{t_{b,cold}}{t_{b,ref}} = 1.131$$
A 100 s nominal burn becomes 88.4 s hot and 113.1 s cold — a 25 s spread.

**Thrust and impulse.** $F \propto p_c$ at fixed $C_f$, so hot thrust is
103.1 kN and cold thrust is 80.6 kN. Total impulse $\approx F\,t_b$ is
unchanged to first order (9.12 MJ·s in all three cases) — the propellant mass
and $I_{sp}$ did not change.

**Sanity check.** A $\pm40$ K band is modest — a launch-vehicle motor
conditioning requirement. A tactical motor qualified $-54$ °C to $+71$ °C
spans 125 K, and the same $\pi_K$ would give a factor
$\exp(0.003077\times125) = 1.47$ between the extremes, i.e. the hot motor runs
47 % higher pressure than the cold one. That factor is the reason tactical
motor cases look overbuilt for their nominal pressure. It is also the reason
this course insists that every solid-motor pressure figure be quoted with its
conditioning temperature.

### WE3 — Effect of 3 % throat erosion

**Given.** The WE1 motor at the same instant of the burn ($K_n = 350$ on the
original throat), but the throat has eroded so that $A_t$ has grown 3 %.

**New throat area.**
$$A_{t,2} = 1.03\times7.854\times10^{-3} = 8.090\times10^{-3}\ \mathrm{m^2}$$
(equivalently $D_t$ has grown 1.49 %, from 100.0 mm to 101.5 mm — a 0.74 mm
radial recession, entirely ordinary for a carbon-phenolic throat.)

**New $K_n$:** $A_b$ unchanged, so $K_{n,2} = 350/1.03 = 339.8$.

**New pressure**, from Eq. 3.7 or directly from the ratio:
$$\frac{p_{c,2}}{p_{c,1}} = \left(\frac{A_{t,1}}{A_{t,2}}\right)^{\frac{1}{1-n}}
= \left(\frac{1}{1.03}\right)^{1.5385} = 0.9555$$
$$p_{c,2} = 0.9555\times7.488 = 7.155\ \mathrm{MPa}\ (1038\ \mathrm{psia})$$

**A 3 % throat growth costs 4.45 % of chamber pressure** — the $1/(1-n)$
amplifier again, this time working against you.

**Mass flow and thrust.**
$$\frac{\dot m_2}{\dot m_1} = \frac{p_{c,2}A_{t,2}}{p_{c,1}A_{t,1}} = 0.9555\times1.03 = 0.9842$$
$$\frac{F_2}{F_1} \approx 0.9842 \quad (\text{at constant } C_f)$$
$$F_2 = 0.9842\times91.2 = 89.8\ \mathrm{kN}$$

**So pressure falls 4.4 % but thrust falls only 1.6 %.** The general result is
$\delta F/F = -[n/(1-n)]\,\delta A_t/A_t = -0.538\times0.03$, and the small
$C_f$ loss from the reduced $\varepsilon$ (exit area fixed, throat grown) makes
it slightly worse in reality.

**Burn rate and burn time.** $r_2 = 3.2\times10^{-5}(7.155\times10^6)^{0.35}
= 8.031$ mm/s, 1.5 % slower. The web takes 1.5 % longer to burn through.

**Sanity check.** This is why a static-test engineer watching a solid motor
reads the *pressure* trace for throat erosion, not the thrust trace: the
pressure signal is nearly three times larger. It is also why an eroding throat
is a slow, benign, self-correcting-looking drift rather than an alarm — and
why a throat that erodes *asymmetrically* (a gouge, a delamination) is a much
worse problem than one that erodes uniformly, because it introduces a side
force that the pressure trace does not see at all.

### WE4 — Erosive burning: coupled solution for the early-time hump

**Given.** The WE1 motor with an internal-burning grain whose initial port
diameter is $D_p = 0.14$ m. Erosive constants (generic, threshold model
Eq. 3.12): $G_{th} = 1200$ kg/(m²·s), $k = 1.8\times10^{-6}$ m³/kg. The aft
30 % of the burning surface sees the full aft-end flux; the forward 70 % is
below threshold.

**Step 1 — geometry check.**
$$A_p = \frac{\pi(0.14)^2}{4} = 1.539\times10^{-2}\ \mathrm{m^2},\qquad
J = \frac{A_p}{A_t} = \frac{1.539\times10^{-2}}{7.854\times10^{-3}} = 1.96$$
$J < 2$: **expect erosive burning.** Port Mach number from the subsonic root of
$A/A^* = 1.96$ at $\gamma = 1.18$ is $M = 0.32$ — above the 0.2–0.3 threshold.

**Step 2 — first pass, at the non-erosive pressure.**
$$G = \frac{\dot m}{A_p} = \frac{39.21\ \mathrm{kg/s}}{1.539\times10^{-2}\ \mathrm{m^2}} = 2547\ \mathrm{kg/(m^2s)}$$
$$\Delta r = k(G-G_{th}) = 1.8\times10^{-6}(2547-1200) = 2.42\times10^{-3}\ \mathrm{m/s}$$
so the aft surface burns at $8.15 + 2.42 = 10.57$ mm/s, a 30 % local
augmentation. **But this is not the answer** — the extra mass raises $p_c$,
which raises $\dot m$, which raises $G$.

**Step 3 — iterate to the coupled equilibrium.** Solve simultaneously
$$\bar r = 0.7\,ap_c^{\,n} + 0.3\left[ap_c^{\,n} + k\left(\tfrac{p_cA_t/c^*}{A_p}-G_{th}\right)\right],
\qquad p_c = \frac{\rho_pA_b\bar r\,c^*}{A_t}$$

| iteration | $p_c$ [MPa] | $G$ [kg/(m²s)] | $r_0$ [mm/s] | $\Delta r$ [mm/s] | $\bar r$ [mm/s] |
|---|---|---|---|---|---|
| start | 7.488 | 2547 | 8.150 | 2.42 | 8.878 |
| 1 | 7.822 | 2661 | 8.276 | 2.63 | 9.065 |
| 2 | 8.075 | 2747 | 8.369 | 2.78 | 9.204 |
| 5 | 8.515 | 2896 | 8.525 | 3.05 | 9.441 |
| converged | **8.822** | 3001 | 8.631 | 3.24 | 9.603 |

$$\boxed{p_{c,erosive} = 8.822\ \mathrm{MPa}\ (1280\ \mathrm{psia})}$$

**Results to quote.** Chamber pressure is 17.8 % above the non-erosive
prediction. The aft-end local burn rate is 11.87 mm/s against 8.63 mm/s
forward — a local augmentation ratio of 1.375. Mass flow rises from 39.2 to
46.2 kg/s.

**Step 4 — what happens next.** As the port opens, $A_p$ grows, $G$ falls, and
the erosive term shuts off. When $D_p$ reaches 0.20 m, $A_p = 3.14\times10^{-2}$
m², $G = 1248$ kg/(m²·s), barely above $G_{th}$, and $\Delta r$ is 0.09 mm/s —
1 % of nominal. **The hump has decayed to nothing in the first few percent of
the web.** That is the signature shape.

**Step 5 — the stack that sizes the case.** Now condition this motor 40 K hot.
Redoing the coupled solve with $a\to a\exp(\sigma_p\Delta T) = 3.467\times10^{-5}$
gives $p_c = 10.13$ MPa. Against the 7.488 MPa nominal that is **+35 %**, and
against the hot-but-non-erosive 8.469 MPa it is a further +20 %. MEOP is set
against the worst credible stack — hot grain, erosive hump, ignition
overshoot, statistical dispersion on $a$ — not against nominal.

**Sanity check.** A $J$ of 1.96 is aggressive; real designs push toward $J>2$
precisely to avoid this. The 18–35 % excursions computed here are the reason
grain designers treat initial port area as a *pressure* variable rather than a
volumetric-loading variable, and the reason a motor that is lengthened without
enlarging its port can fail its first hot firing.

### WE5 — Building a $p_c(t)$ trace from a $K_n(t)$ table

**Given.** The WE1 motor. A grain-design code (Module 21) has produced the
$K_n(t)$ table below. Throat erosion neglected for clarity; conditioning at
reference temperature.

**Method.** For each row, $p_c = (a\rho_pc^*K_n)^{1/(1-n)}$ (Eq. 3.7), then
$F = C_fp_cA_t$ with $C_f = 1.55$.

| $t$ [s] | $K_n$ | $p_c$ [MPa] | $p_c$ [psia] | $F$ [kN] | phase |
|---|---|---|---|---|---|
| 0 | 300 | 5.907 | 857 | 71.9 | end of ignition transient |
| 2 | 330 | 6.840 | 992 | 83.3 | progressive |
| 5 | 352 | 7.554 | 1096 | 92.0 | progressive |
| 10 | 358 | 7.753 | 1125 | 94.4 | **peak** |
| 20 | 350 | 7.488 | 1086 | 91.2 | near-neutral |
| 40 | 332 | 6.904 | 1001 | 84.1 | regressive |
| 60 | 296 | 5.787 | 839 | 70.4 | regressive |
| 75 | 250 | 4.462 | 647 | 54.3 | regressive |
| 85 | 190 | 2.926 | 424 | 35.6 | approaching burnout |
| 92 | 120 | 1.443 | 209 | 17.6 | tail-off |
| 96 | 55 | 0.434 | 63 | 5.3 | sliver / below deflagration limit |

**Reading the result.**

- **The pressure trace is *more* peaked than the $K_n$ trace.** $K_n$ swings
  from 300 to 358, a factor 1.193. Pressure swings from 5.907 to 7.753 MPa, a
  factor 1.313 — exactly $1.193^{1.538}$. Always sketch $p_c$, never $K_n$,
  when arguing about case loads.
- **The trace is "progressive–neutral–regressive"**, the classic shape of an
  internal-burning star or wagon-wheel that opens out to a cylinder.
- **The last two rows are not real steady states.** At $t = 96$ s,
  $p_c = 0.434$ MPa is below the 0.5–1.5 MPa deflagration limit of a typical
  composite: the propellant would have gone out. What actually happens is a
  blowdown at the $\tau_{fill}$ time constant, not a quasi-steady sequence of
  equilibria.
- **Quasi-steady validity.** Eq. 3.7 assumes the chamber reaches equilibrium
  faster than $K_n$ changes. Relaxation time $\tau_{fill}/(1-n) \approx 5$ ms
  at $L^* = 2$ m; $K_n$ changes on a scale of seconds. Ratio $\sim 10^3$:
  **the quasi-steady assumption is excellent during the main burn and invalid
  in the last second.** Below $t \approx 92$ s, integrate Eq. 3.6 numerically
  instead.

**Sanity check.** A trace that peaks 5–10 % above the mid-burn plateau in the
first 10 s and then decays is what a real internal-burning grain does. Compare
with the RSRM, which is *deliberately* shaped the other way (§6.1): the
programme wanted the peak early and a deep mid-burn bucket, and paid for it in
grain-design complexity.

---

## 6. Real engines

### 6.1 RSRM (Space Shuttle) — the thrust trace was the requirement

**The design choice.** The RSRM's forward segment carries an **11-point star**
perforation; the aft segments carry a **double-truncated-cone** perforation.
Together they produce a trace that rises to a maximum thrust of ≈14.7 MN
(3,300,000 lbf) `/motor`, `max`, sea level at about t+20 s, then falls into a
pronounced mid-burn bucket, then partially recovers before tail-off, over an
action time of 123–124 s at a nominal chamber pressure of ≈6.25 MPa (906.8
psi). `[NASA-SRB]`, `[WP]` (conf B for thrust and pressure, A for burn time).

**Why.** The Shuttle stack passes through maximum dynamic pressure at roughly
t+55–60 s. Aerodynamic load on the orbiter and the ET is set by $q\alpha$, and
$q$ is set by velocity and air density. The SSMEs could throttle — the famous
"bucket" to 65–72 % — but two boosters supplying roughly 80 % of liftoff
thrust cannot. **So the throttle bucket had to be built into the grain
geometry.** The star point count, the star depth, and the taper of the aft
cones were chosen so that $A_b(t)$, and hence $p_c(t)$ through Eq. 3.7, and
hence thrust, dropped through the max-Q window. [F][H]

**Alternatives at the time.** (a) A neutral-burning grain and a bigger,
heavier structural margin on the ET and orbiter wings — rejected, mass.
(b) A lower overall thrust level and a longer burn — rejected, the trajectory
and abort modes need liftoff thrust-to-weight. (c) Throttling the SSMEs
harder — insufficient authority, since the boosters dominate. Grain shaping
was the only free variable, and it is free only in the sense of costing
nothing at flight time; it costs a great deal in casting-tooling complexity and
in ballistic-prediction difficulty, because a star grain's $A_b(t)$ is a much
harder function to predict to the ±1.5 % the programme needed.

**Would a modern engineer do it again?** For a booster that cannot throttle and
flies a load-limited trajectory, yes — there is still no other mechanism.
`[NASA-SLS-SRB]` The five-segment RSRMV kept the same architecture. What a
modern engineer would change is the *analysis*: the RSRM's trace was tuned with
extensive subscale and full-scale static firing; today the first ten iterations
happen in a grain-regression code with a validated $r(p)$ and a throat-erosion
model, and the static firings confirm rather than discover. [M]

**The burn-rate connection worth stating explicitly.** RSRM propellant contains
0.4 % iron oxide by mass — a burn-rate catalyst, not an energetic ingredient.
Sources disagree on whether the figure is 0.4 % with 69.6 % AP or 0.2 % with
69.8 % AP (`reference/_verify-solid-coldgas.md`, disagreement 1). That
0.2 percentage-point difference is not a rounding question: it is a
several-percent change in $a$, hence through Eq. 3.7 a several-percent change
in $p_c$, hence a several-percent change in thrust and burn time. **The
ingredient with the smallest mass fraction in the table is the one that moves
the pressure trace most.** [F]

**An inference, flagged as such.** Taking $\varepsilon = 7.72$, $\gamma = 1.18$,
$p_c = 6.4$ MPa peak and sea-level ambient gives $C_f = 1.597$, so
$A_t = F/(C_fp_c) = 14.7\times10^6/(1.597\times6.4\times10^6) = 1.44$ m², a
throat diameter of ≈1.35 m. That is an inference from published thrust and
pressure, not a published number — it is quoted here only to show that the
published figures are mutually consistent at the 1.4-m-throat scale. [A]

### 6.2 Star 48B — tail-off is the performance problem for an apogee motor

**The design choice.** Star 48B (TE-M-711-9): 2,009–2,011 kg of HTPB/AP/Al
propellant in a titanium case, fixed carbon-phenolic nozzle, ≈66.0–66.4 kN
vacuum thrust over ≈87 s. Vacuum $I_{sp}$ is **286.2 s at $\varepsilon \approx
47.7$ (short nozzle) or 292.2 s at $\varepsilon \approx 54.8$–70.4 (long
nozzle)** — the two figures are not a disagreement, they are two nozzles, and
"Star 48B $I_{sp}$" without the $\varepsilon$ is a meaningless quantity.
`[JM-LV]`, `[EA]`, `[WP]` (conf B–C; see the contested-figures section of
`reference/_verify-solid-coldgas.md`).

**Why tail-off matters here more than anywhere else.** Star 48B's job on
Delta II PAM-D and on New Horizons was a single, precise velocity increment.
Burnout velocity error maps directly into orbit insertion error or, for New
Horizons, into a mid-course correction the spacecraft has to pay for from its
own hydrazine. **Tail-off is the least repeatable few percent of a solid
motor's impulse**, because it depends on where the web breaks through first,
on sliver distribution, on the shape of the burned-out insulation, and on
blowdown through a throat whose area is now at its most eroded. For a 2-tonne
apogee motor, 3 % of total impulse in a poorly characterised tail-off is a
large velocity error.

**Alternatives at the time.** (a) A liquid or monopropellant kick stage with a
commandable shutdown — far more expensive, heavier at this impulse class, and
with its own reliability tail. (b) Thrust termination ports, as on Minuteman
stage 3 (§6.4) — violent, one-shot, and structurally destructive; acceptable
for a weapon setting terminal velocity, absurd for a spacecraft. (c) Accepting
the dispersion and correcting downstream with the spacecraft's own propulsion
— **which is what was actually done**, and is the reason PAM-D-class missions
budget a post-injection trim.

**Would a modern engineer do it again?** For a spin-stabilised, one-shot
apogee kick, yes; the Star family is still flying. But the modern trend for
precision insertion has moved toward liquid or electric stages that can shut
down on a navigation solution, precisely because the solid's tail-off
dispersion is irreducible. [M][J]

### 6.3 GEM-46 versus GEM-40 — a bigger motor with less thrust, on purpose

GEM-40: 11,770 kg propellant, 643.8 kN max thrust, 63.3 s burn. GEM-46:
16,860 kg propellant — 43 % more — but **611 kN max thrust, lower**, over
75.9 s. `[WP]`, `[NG-COMM]` (conf B).

This is not a transcription error; it is Eq. 3.7 being used as a design tool.
More propellant at lower thrust for longer means a **lower $K_n$** — a smaller
burning surface relative to the throat — which means lower $p_c$, lower $r$,
and a longer burn. The Delta III trajectory wanted sustained thrust rather
than a hard liftoff kick, and the grain and throat were sized to deliver it.
**"Bigger motor" and "more thrust" are independent choices, and $K_n$ is the
knob that separates them.** [F][M] The corollary students should carry away:
you cannot infer thrust from propellant mass, and you cannot infer burn time
from motor length.

### 6.4 Minuteman III third stage — thrust termination, and what it costs

Open sources describe the Minuteman third stage as carrying **thrust
termination ports**: shaped charges open ports in the forward dome, collapsing
chamber pressure and terminating thrust to set the final velocity. The stage
uses a fixed nozzle with liquid-injection TVC.
`reference/_verify-solid-coldgas.md` §A.17, conf B.

**Read that through this module's physics.** Opening ports multiplies the
effective $A_t$ by a large factor. From Eq. 3.7, $p_c$ falls as
$(A_{t,eff})^{-1/(1-n)}$; the pressure drops below the propellant's
deflagration limit and combustion stops. The mechanism is exactly the
throat-area sensitivity of WE3, driven to an extreme. The cost is that it is a
**pyrotechnic, one-shot, structurally violent event** that vents hot gas
forward through the payload end. It is the honest answer to "can you shut down
a solid motor?": yes, once, destructively, and only if the vehicle was designed
around it from the start. No civil launch vehicle does this. [H][M]

### 6.5 High-$n$ propellants in tactical motors — architecture-level

Tactical motors want high burn rates (short, fat motors; boost pulses of 1–3
s) and high energy. Both pushes tend to raise $n$: high-energy nitramine and
nitrate-ester systems generally run higher $n$ and higher $\sigma_p$ than plain
AP/HTPB composites. `[Kubota §6]`, `[Davenas]` [E] The engineering consequences
follow mechanically from this module and are worth stating as a list, because
they are the reason tactical solid motor design is *harder* than launch-vehicle
solid motor design despite the smaller hardware:

1. **Wider pressure band over temperature.** $\pi_K = \sigma_p/(1-n)$ with both
   factors worse. A $-54$ °C to $+71$ °C qualification band can give a
   pressure ratio approaching 2 between the extremes. The case is sized by the
   hot end and the guidance system must tolerate the cold end.
2. **Larger sensitivity to grain defects.** A 20 % $A_b$ excursion from a crack
   gives $1.2^{1.538}=1.32$ at $n=0.35$ but $1.2^{3.33}=1.83$ at $n=0.7$.
   Storage-induced cracking (Module 23) is therefore a first-order safety
   issue, not a performance issue.
3. **Slower recovery from upsets and a smaller stability margin.** Eq. 3.8's
   decay rate $\propto(1-n)$.
4. **Tighter manufacturing tolerance on $a$.** A 3 % lot-to-lot scatter in
   burn-rate coefficient — routine — becomes 4.6 % of pressure at $n=0.35$ and
   10 % at $n=0.7$.

The architectural responses are all recognisable in the open record: mixed
oxidiser distributions and catalysts to hold $n$ down; plateau formulations
where the application can accept them; a generous port ($J>2$) to keep erosive
burning out of the stack; and a case designed with margin against a hot,
erosive, cracked worst case rather than against nominal. Per the course scope
boundary, this module names the architecture and the physics and stops there.
[M][J]

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The trade-offs

| you want | you raise | it costs you |
|---|---|---|
| Higher thrust from the same motor | $K_n$ (bigger $A_b$ or smaller $A_t$) | Higher $p_c$ → heavier case; shorter burn; more throat erosion; worse erosive burning at low $J$ |
| Longer burn | Lower $K_n$, lower-$r$ propellant | Lower $p_c$ → lower $C_f$ and $I_{sp}$; risk of approaching the deflagration limit at tail-off |
| Flatter trace over temperature | Lower $\sigma_p$ and lower $n$ | Usually lower energy; catalysts and plateau chemistry constrain the formulation |
| Tolerance to grain cracks | Lower $n$ | Same |
| Less two-phase loss | Less aluminium, finer particles | Less energy; **less particle damping** — a direct instability trade |
| No erosive hump | Larger initial port ($J>2$) | Lower volumetric loading → bigger, heavier motor for the same impulse |

**The single most consequential number is $n$, and it is bought with energy.**
Nothing else in solid-motor design has as many downstream consequences from one
scalar. [J]

### 7.2 Failure modes

**Grain crack → overpressure burst.** *Mechanism*: thermal cycling, handling
shock, or a bond failure opens a crack; the crack surface ignites and adds
uncounted $A_b$. *Symptom*: pressure spike far above the predicted trace, often
within the ignition transient. *Evidence*: pressure trace exceeding the
prediction from the first milliseconds; post-test case fragments showing
propellant burned on a fracture surface rather than a cast surface;
pre-flight X-ray or CT of the grain. *Fix*: grain structural analysis over the
full thermal cycle (`[SP-8073]`), lower-$n$ propellant, liner and
stress-relief boot design, and storage-temperature control.

**Debond at the liner → uncontrolled surface growth.** *Mechanism*: the
propellant–liner–insulation bond fails; gas penetrates the annulus and burns
on a surface that was supposed to be inhibited. *Symptom*: progressive
pressure rise above prediction, and case overheating at the debond because the
insulation is being burned from the wrong side. *Evidence*: case-wall
thermocouples running hot at one azimuth; the pressure excess growing rather
than decaying (unlike an erosive hump, which decays). *Fix*: bond-line process
control (Module 25), ultrasonic bond inspection, and a mechanical bond design
that does not rely on adhesion alone.

**Erosive-burning overpressure.** *Mechanism*: §3.8. *Symptom*: a pressure hump
in the first few percent of the burn that decays as the port opens. *Evidence*:
the hump's *shape* — rising fast, decaying over a few seconds, correlating with
initial $J$ across a motor family; head-end and aft-end pressure transducers
showing a larger axial $\Delta p$ than predicted. *Fix*: increase initial port
area; taper the port (larger aft); inhibit the aft-end surface; accept it and
size MEOP for it.

**Combustion instability with DC shift.** *Mechanism*: §3.9. *Symptom*:
oscillation at an acoustic mode frequency plus a rise in mean pressure and a
shortened burn. *Evidence*: high-bandwidth pressure transducers (≥10 kHz,
flush-mounted — a recessed transducer in a long passage has its own Helmholtz
resonance and will lie to you); the mean-pressure rise; frequency tracking the
predicted mode as the grain regresses. *Fix*: aluminium particle-size
specification, inert damping powder, geometric mode-breaking (slots, resonance
rods), and in the worst case a formulation change.

**Nozzle throat erosion beyond prediction.** *Mechanism*: chemical and
mechanical ablation. *Symptom*: pressure decaying faster than $K_n(t)$
predicts, thrust nearly nominal (WE3). *Evidence*: the pressure–thrust
divergence; post-test throat measurement. *Fix*: Module 24.

**Low-pressure extinction / chuffing.** *Mechanism*: pressure below the
deflagration limit, or $L^*$ instability at low $L^*$. *Symptom*: irregular
low-frequency pressure pulses, or extinction and re-ignition. *Evidence*: the
trace itself; correlation with low $K_n$ or a small free volume. *Fix*: raise
$p_c$, raise $L^*$, reformulate.

### 7.3 Materials and manufacturing, as they touch burn rate

The burn-rate law is a *manufactured* property, not a material constant.
Everything that touches it is a process control:

- **Oxidiser particle-size distribution** is the primary lever on $a$ (§3.3).
  It is set by grinding and blending, and it drifts with equipment wear. Lot
  acceptance of AP by particle-size distribution is therefore a *ballistic*
  control, not a chemistry control.
- **Mixing uniformity** sets the local variability of $r$ across the grain.
  Poor dispersion of a catalyst produces local hot spots in burn rate, which
  produce local surface irregularity, which produces additional $A_b$.
- **Cure state** affects binder pyrolysis and hence $T_s$. Under-cure and
  over-cure both move $r$.
- **Casting voids and porosity** are the origin of both structural cracks and
  local $A_b$ excursions. Radiographic and CT inspection is a ballistic
  inspection.
- **Aluminium powder specification** is simultaneously a performance, a
  two-phase-loss, and an acoustic-damping specification (§3.9). Changing the
  aluminium vendor is a ballistics change and must be re-qualified.

Module 25 covers the processes; the point here is that **a propellant lot's
$a$ and $n$ are measured, not looked up**, and every production lot is
strand-burner tested and often subscale-motor tested against the qualification
values. [M]

### 7.4 Testing: how $a$, $n$, $\sigma_p$ are actually measured

**Strand burner (Crawford bomb).** A thin inhibited strand of propellant is
burned in a nitrogen-pressurised vessel at a set pressure; fuse wires at known
spacing time the passage of the flame front. Repeat at several pressures; the
slope of $\log r$ against $\log p$ is $n$ and the intercept is $a$. Repeat the
whole matrix at several conditioning temperatures for $\sigma_p$. *What the
data look like when the thing is wrong*: curvature on the log–log plot means
either you have crossed a plateau region or the strand is not burning
one-dimensionally (side burning under the inhibitor); scatter that grows at
low pressure means you are near the deflagration limit. **Strand data
systematically differ from motor data** — typically the motor burns a few
percent faster, because of surface roughness, cross-flow, and the difference
between an inhibited strand and a real grain. The ratio is called the
*scale factor* or *burn-rate ratio* and is carried explicitly. [E][M]

**Ballistic Evaluation Motor (BEM) / subscale motor.** A small standard motor
of known $A_b(t)$ and $A_t$; measure $p_c(t)$ and invert Eq. 3.7 for $a$ and
$n$. This is the number used for design because it includes the scale factor
implicitly. `[SP-8039]`, `[SP-8041]`

**T-burner.** Two propellant discs at the ends of a tube, driven to acoustic
resonance; the growth or decay rate of the oscillation gives the
pressure-coupled response function $R_p$ (§3.9). Honest statement of the state
of the art: T-burner $R_p$ data carry large scatter, results depend on the
data-reduction method, and the field does not agree on absolute values.
`[YA95]`, `[Culick06]` [R]

**Full-scale static firing.** Measures the delivered trace, the delivered
$c^*$, and the throat erosion history (by post-test measurement and by
inverting the pressure trace). Instrumentation: head-end and aft-end pressure
transducers (both, always — the difference is the erosive-burning and
axial-flow diagnostic), a load cell for thrust, case-wall thermocouples,
strain gauges on the case, and high-bandwidth pressure for instability.
**The single most informative derived quantity is $c^*$ efficiency computed
from the integrated $\int p_c\,dt$, the propellant mass, and $A_t(t)$** —
because it closes the mass balance and exposes any error in $A_b$, $a$, or
throat erosion as a residual. [M]

---

## 8. Misconceptions and what engineers actually care about

**"Chamber pressure is set by how much propellant you load."** No. It is set by
$K_n = A_b/A_t$ and the propellant's $a$, $n$, $\rho_p$, $c^*$ — Eq. 3.7.
Propellant mass sets *total impulse* and *burn time*, not pressure. A motor
twice as long with the same cross-section and the same throat runs at the same
pressure for twice as long. (See GEM-40 versus GEM-46, §6.3.)

**"The burn rate depends on chamber pressure."** Almost, but the distinction
matters: the burn rate depends on the **local** pressure and on the **local
cross-flow**. In a long grain with an axial pressure drop and a high port mass
flux, the aft end burns faster than the head end for both reasons, and treating
$p_c$ as a single number is the assumption that erosive-burning analysis
exists to remove.

**"$n < 1$ is a convention or a rule of thumb."** It is a stability
requirement with a proof (§3.6). At $n>1$ the mass-generation curve is convex
and the equilibrium is unstable: the motor either extinguishes or bursts. Every
usable propellant has $n<1$ over its operating range, and propellants that
approach 1 at high pressure are simply not operated there.

**"Temperature sensitivity means the burn rate changes by $\sigma_p$ per
kelvin, so the motor does too."** The motor changes by $\pi_K = \sigma_p/(1-n)$
per kelvin, which is 54 % larger at $n=0.35$ and 233 % larger at $n=0.7$
(WE2). Using $\sigma_p$ where $\pi_K$ belongs understates the hot-day case,
which is the case the structure is sized against.

**"A solid motor cannot be shut down."** It can, once, by opening the throat
until pressure falls below the deflagration limit — thrust-termination ports
(§6.4). What it cannot do is shut down *non-destructively*, *repeatably*, or
*on a navigation solution*. Say the precise thing.

**"Aluminium is in the propellant for performance."** It is there for
performance *and* for acoustic damping (§3.9), and the particle size is chosen
with both in mind. Removing or refining the aluminium to chase $I_{sp}$ has
destabilised motors.

**"An erosive-burning hump can be estimated by evaluating the correlation at
nominal pressure."** No — the loop closes (WE4). Single-pass evaluation gave
30 % local augmentation and would have suggested a modest effect; the coupled
solution gave 18 % on chamber pressure, and 35 % once stacked with hot
conditioning.

**"Throat erosion is mainly a thrust problem."** It is mainly a *pressure*
problem. Thrust is nearly insensitive to it, by $n/(1-n)$ (WE3), which is
exactly why it can go unnoticed on a thrust-only instrumented test.

### What engineers actually care about

1. **$K_n(t)$ and therefore $p_c(t)$ against MEOP, with the hot-day and
   erosive stack applied.** This is the case-sizing load and it is where
   programmes lose motors.
2. **The delivered $a$ and $n$ of the actual propellant lot, and their
   scatter.** Amplified by $1/(1-n)$ into everything else. Lot acceptance is a
   ballistics activity.
3. **Whether the pressure trace matches the prediction, and if not, which term
   is wrong.** $A_b$ (grain-regression model), $a$ (propellant lot), $A_t$
   (erosion), or $c^*$ (combustion efficiency) — and the head-to-aft pressure
   difference is the instrument that separates them.
4. **Tail-off repeatability**, for anything whose burnout velocity matters.
5. **Whether the motor is going to be acoustically stable across the whole
   burn**, given that the mode frequencies sweep as the grain regresses.

---

## 9. Mastery levels

**Level 1 — Familiarity.** State $r=ap^n$ and what each symbol is. Explain in
plain language why chamber pressure is set by $A_b/A_t$ and not by propellant
mass. Say why $n$ must be less than 1. Say what erosive burning is and where in
a grain it happens. Name two real motors whose thrust trace was shaped by grain
design and say what shape they wanted.

**Level 2 — Working engineering knowledge.** Derive
$p_c=(a\rho_pc^*K_n)^{1/(1-n)}$ from a mass balance, stating every assumption.
Compute $p_c$, $r$, $\dot m$, and $F$ for a given motor and propellant in SI,
including the unit conversion of $a$ from vendor units. Derive
$\pi_K=\sigma_p/(1-n)$ and use it to compute a hot- and cold-day pressure,
thrust, and burn time. Compute the effect of a stated throat-area growth on
pressure and on thrust, and explain why they differ. Estimate whether erosive
burning will matter from $J$ or port Mach number. Read a $p$–$t$ trace and
identify ignition transient, equilibrium, tail-off, sliver, and an erosive
hump. Quote from memory the ranges in §4.

**Level 3 — Interview mastery.** Given an unfamiliar motor's $p$–$t$ trace and
a nominal prediction, diagnose which term of Eq. 3.14 is wrong and say what
measurement would confirm it. Argue both sides of a high-$n$ versus low-$n$
propellant selection for a stated mission and temperature band, and quantify
the case-mass consequence. Given a motor that went unstable, lay out the
candidate mechanisms ($L^*$/bulk, longitudinal, tangential, velocity-coupled),
say how the frequency and the mean-pressure behaviour discriminate between
them, and propose fixes in order of programme cost. Explain why the same
grain-shaping logic that produced the RSRM's max-Q bucket would not be used to
solve an upper-stage insertion-accuracy problem, and what would be used
instead. Say which historical programme faced each of these and what they did.

---

## 10. Problems

Use the generic propellant of §3.4 unless stated:
$a = 3.2\times10^{-5}$ m·s⁻¹·Pa⁻⁰·³⁵, $n=0.35$, $\rho_p=1750$ kg/m³,
$c^*=1500$ m/s, $\sigma_p = 0.0020$ K⁻¹, $\gamma=1.18$.

### Conceptual

**C1.** A colleague proposes doubling a motor's total impulse by doubling its
length, keeping the cross-section, grain type, throat area, and propellant
unchanged. Predict what happens to chamber pressure, thrust, and burn time, and
state which of your predictions is least trustworthy and why.

**C2.** Sketch, on one set of axes, mass generation rate and nozzle discharge
rate against pressure, for $n=0.4$ and for $n=1.3$. Mark the equilibria and
argue stability from the geometry of the curves alone.

**C3.** Explain physically — not algebraically — why the temperature
sensitivity of chamber pressure is larger than the temperature sensitivity of
burn rate.

**C4.** A propellant's burn-rate data, plotted as $\log r$ against $\log p$,
is straight from 3 to 8 MPa, then flattens to nearly horizontal from 8 to
12 MPa. Name the phenomenon, explain what is happening in the combustion zone,
and state one advantage and one hazard of operating a motor in the flat region.

**C5.** Erosive burning and combustion instability are usually taught in
separate sections. Identify the physical mechanism they share, and explain why
an unstable motor typically shows a *rise* in mean chamber pressure.

**C6.** Why is the aluminium particle size in a propellant a combustion-
stability specification as well as a performance specification? Give the
scaling that determines the optimum size for damping a given frequency.

**C7.** A motor's pressure trace has a hump in the first 4 s that decays away,
and a second motor of the same design has a pressure excess that starts small
and grows through the burn. Both peak about 15 % above prediction. Give the
most likely cause of each and the physical reason the *shapes* differ.

**C8.** State the quasi-steady assumption behind $p_c=(a\rho_pc^*K_n)^{1/(1-n)}$
in terms of two competing time scales, evaluate both for a motor with
$L^*=1.5$ m and $r=6$ mm/s, and say where in the firing the assumption fails.

### Calculation

**N1.** A motor has $D_t = 0.075$ m and, at a given instant, $A_b = 1.85$ m².
Compute $K_n$, $p_c$, $r$, $\dot m$, and (with $C_f = 1.60$) $F$.

**N2.** A vendor data sheet quotes $r = 6.5$ mm/s at 6.9 MPa with $n = 0.30$.
Convert to a burn-rate coefficient in SI (m·s⁻¹·Pa⁻⁰·³⁰), then compute the
burn rate at 10.0 MPa.

**N3.** For the WE1 motor ($K_n = 350$, $D_t = 0.10$ m), find the throat
diameter that would raise chamber pressure to exactly 10.0 MPa with the grain
unchanged. Then state the percentage change in thrust, taking $C_f$ constant.

**N4.** A motor is qualified from $-40$ °C to $+60$ °C and is nominally
7.00 MPa at $+20$ °C. Using $\sigma_p = 0.0020$ K⁻¹ and $n = 0.35$, compute
$p_c$ at both extremes and the ratio between them. Repeat for a propellant with
$\sigma_p = 0.0045$ K⁻¹ and $n = 0.62$, and comment on the case-design
consequence.

**N5.** For the WE1 motor, throat erosion grows $A_t$ linearly by 6 % over a
90 s burn while $K_n$ (referred to the *original* throat) holds constant at
350. Tabulate $p_c$ and $F$ at $t = 0$, 30, 60, 90 s and compute the percentage
change in each over the burn.

**N6.** A grain has an aft-end port area of $1.10\times10^{-2}$ m² and a throat
area of $6.0\times10^{-3}$ m². Compute $J$ and, for $\gamma = 1.18$, the port
Mach number. Then, with $\dot m = 30$ kg/s, $G_{th} = 1200$ kg/(m²·s), and
$k = 1.8\times10^{-6}$ m³/kg, compute the first-pass erosive augmentation
$\Delta r$ and state whether a coupled solution is necessary.

**N7.** Using the $K_n(t)$ table of WE5 but with a throat that erodes linearly
to $+4$ % area by $t=90$ s, recompute $p_c$ at $t = 10$, 40, and 75 s and
compare with the non-eroding values.

**N8.** From `reference/_verify-solid-coldgas.md`, take the RSRM nominal
chamber pressure and action time and the Star 48B burn time and vacuum thrust.
(a) Estimate the RSRM's mass flow using $c^* = 1550$ m/s and the throat area
inferred in §6.1, and compare with propellant mass over action time.
(b) Estimate Star 48B's mean mass flow from propellant mass and burn time, and
from it the vacuum $c^*$ implied by a chamber pressure of 4.0 MPa and a throat
area of 0.0155 m². Comment on whether the result is credible and what it tells
you about the confidence labels on those figures.

### Engineering reasoning

**R1.** A static firing of a new motor gives a pressure trace that matches
prediction for the first 20 s and then runs 8 % high for the rest of the burn,
while measured thrust runs only 3 % high. Post-test, the throat is measured
2 % *smaller* in area than nominal. Work through Eq. 3.14 and name the two most
likely explanations, then state the single additional measurement that would
discriminate between them.

**R2.** Two motors of identical design are fired, one conditioned at $-30$ °C
and one at $+50$ °C. The hot motor's burn time is 12 % shorter and its peak
pressure 14 % higher, but its *total impulse* is 4 % higher, not equal. Explain
what physical effect the invariant-total-impulse argument of §3.7 neglected,
and estimate whether the sign of your explanation is right.

**R3.** You are handed a $p$–$t$ trace with a 400 Hz oscillation appearing
between $t = 15$ s and $t = 35$ s, amplitude ±4 % of mean, and a mean pressure
that runs 6 % above prediction over the same window and returns to prediction
afterwards. Identify the phenomenon, explain why it appears and disappears in a
window, and give three candidate fixes in increasing order of programme cost.

**R4.** A programme proposes replacing a propellant of $n = 0.32$,
$\sigma_p = 0.0018$ K⁻¹ with one of $n = 0.55$, $\sigma_p = 0.0035$ K⁻¹ that
delivers 3 % more $c^*$. The motor is qualified over a 100 K band and the case
is currently at a 1.4 safety factor on MEOP. Quantify what happens to the
required MEOP and argue whether the 3 % $c^*$ is worth it.

**R5.** Explain, using this module's equations, why the RSRM's grain shaping
strategy (§6.1) is a *pressure* design problem as well as a thrust design
problem, and what the case designer had to be told before the grain designer
could finish.

### Mini trade study

**T1.** You must design a first-stage solid motor for a small launch vehicle.
Fixed: total impulse $2.4\times10^{7}$ N·s, propellant $\rho_p = 1780$ kg/m³,
$c^* = 1520$ m/s delivered, motor outer diameter 1.6 m, sea-level operation
with $\varepsilon$ chosen for the trajectory, conditioning band $-20$ °C to
$+45$ °C, filament-wound composite case. You may pick one of four propellants:

| option | $a$ [m·s⁻¹Pa⁻ⁿ] | $n$ | $\sigma_p$ [K⁻¹] | $c^*$ relative | note |
|---|---|---|---|---|---|
| A | $7.07\times10^{-5}$ | 0.30 | 0.0018 | 1.000 | baseline AP/HTPB/Al class; $r = 8.0$ mm/s at 7 MPa |
| B | $4.92\times10^{-6}$ | 0.48 | 0.0026 | 1.010 | higher energy; $r = 9.5$ mm/s at 7 MPa |
| C | $4.10\times10^{-4}$ | 0.18 | 0.0015 | 0.985 | plateau-tailored, low exponent; $r = 7.0$ mm/s at 7 MPa |
| D | $1.42\times10^{-7}$ | 0.72 | 0.0042 | 1.030 | high-energy nitramine class; $r = 12.0$ mm/s at 7 MPa |

Choose a propellant, a nominal chamber pressure, and a $K_n$; then state the
resulting MEOP you would size the case against, showing the stack (hot day at
$+45$ °C from a $+20$ °C reference, lot scatter on $a$ of $+3$ %, $A_b$
prediction uncertainty of $+2$ %, and a combined erosive-burning and
ignition-overshoot allowance of $+8$ % on pressure). Recommend one option and justify it against
the other three. State explicitly what additional data you would demand from
the propellant supplier before committing.

---

## 11. Quiz (100 points)

**Q1 (8 pts).** In $p_c = (a\rho_pc^*K_n)^{1/(1-n)}$, a 4 % underestimate of
the burning surface area produces what percentage error in predicted chamber
pressure at $n = 0.45$?
(a) 4.0 % (b) 5.8 % (c) 7.3 % (d) 8.9 %

**Q2 (8 pts).** A propellant has $\sigma_p = 0.0025$ K⁻¹ and $n = 0.40$.
Compute $\pi_K$ and the chamber-pressure ratio between motors conditioned at
$-25$ °C and $+55$ °C.

**Q3 (10 pts).** Which statement about erosive burning is correct?
(a) It is worst at the head end because the pressure is highest there.
(b) It is worst at the aft end early in the burn, and decays as the port opens.
(c) It scales with port pressure, not port mass flux.
(d) It raises burn rate but not chamber pressure, because the throat is fixed.
Justify your choice in one sentence.

**Q4 (12 pts).** A motor with $D_t = 0.12$ m has $A_b = 3.60$ m² at a given
instant. Using the module's generic propellant, compute $K_n$, $p_c$, $r$, and
$\dot m$.

**Q5 (10 pts).** The throat of the Q4 motor erodes to $D_t = 0.1225$ m.
Compute the new chamber pressure and the percentage change in thrust at
constant $C_f$.

**Q6 (10 pts).** True or false, with one sentence each:
(a) Total impulse of a solid motor is approximately independent of
conditioning temperature.
(b) A propellant with $n = 1.1$ can be used if the case has enough margin.
(c) Tail-off contributes negligible impulse and can be ignored for orbit
insertion.
(d) $L^*$ instability in a solid motor is an acoustic phenomenon.

**Q7 (12 pts).** A motor has $L^* = 1.2$ m, $c^* = 1520$ m/s, $\gamma = 1.16$,
$n = 0.38$, propellant $\alpha = 2.2\times10^{-7}$ m²/s, and burns at
$r = 11$ mm/s. Compute the chamber filling time, the pressure relaxation time,
and the solid-phase relaxation time, and state whether you would expect this
motor to be susceptible to $L^*$ instability. Justify.

**Q8 (10 pts).** Which single measurement most directly separates
"the propellant lot burned faster than qualification" from "the throat eroded
less than predicted" as an explanation for a high-running pressure trace?
(a) Thrust from the load cell
(b) Post-test throat area measurement
(c) Case strain gauges
(d) Integrated $\int p_c\,dt$ alone
Explain why the others do not do it.

**Q9 (10 pts).** The Space Shuttle RSRM's forward segment uses an 11-point star
perforation. State what feature of the thrust–time trace this produces, why the
programme wanted it, and what the alternative would have cost. Then state one
consequence of that grain geometry for ballistic *prediction* accuracy.

**Q10 (10 pts).** A tactical motor and a large launch booster use propellants
with the same $\sigma_p$ but $n = 0.65$ and $n = 0.30$ respectively. Both are
qualified over their own temperature bands: 125 K for the tactical motor, 40 K
for the booster. Without a calculator, argue which motor has the larger ratio
of hot-day to cold-day chamber pressure, by how much roughly, and what that
implies for their respective case mass fractions.

---

## 12. Further reading

- **`[SB §12]`** Sutton & Biblarz, *Rocket Propulsion Elements*, 9th ed., ch. 12
  "Solid Propellant Rocket Fundamentals" — the standard first treatment of
  $r=ap^n$, $K_n$, temperature sensitivity, and erosive burning, with the
  worked-example style this module follows. Read §12.1–12.5 before anything
  else.
- **`[Kubota]`** Kubota, *Propellants and Explosives: Thermochemistry and
  Combustion*. The best single account of combustion-zone structure: fizz
  zone, dark zone, and the mechanism of plateau and mesa burning. Chapters 4–7
  are the ones for this module; ch. 13 for instability.
- **`[BDP70]`** Beckstead, Derr & Price, "A model of composite solid-propellant
  combustion based on multiple flames", *AIAA Journal*, 1970. Read it for the
  three-flame structure and for what a physically-grounded burn-rate model has
  to assume in order to close.
- **`[Summerfield60]`** Summerfield et al., granular diffusion flame model.
  Read it for the $p/r$ versus $p^{1/3}$ linearisation and for the argument
  that $n \approx 1/3$ is a *diffusion* signature.
- **`[Lenoir57]`** Lenoir & Robillard, erosive burning correlation. Read it for
  the blowing-correction argument — why the mass leaving the surface shields it
  — which is the part most often dropped when the correlation is quoted.
- **`[SP-8076]`** NASA SP-8076, *Solid Propellant Grain Design and Internal
  Ballistics*. The design-criteria monograph that connects $K_n(t)$ to
  $p_c(t)$ and states the practices; read alongside Module 21.
- **`[SP-8039]`** NASA SP-8039, *Solid Rocket Motor Performance Analysis and
  Prediction*. Read for what a real ballistic prediction contains, including
  the scale factors between strand, subscale, and full-scale burn rates.
- **`[SP-8051]`** NASA SP-8051, *Solid Rocket Motor Igniters*. Read for the
  ignition transient: the three time scales and why flame spreading dominates
  at large scale.
- **`[Culick06]`** Culick, *Unsteady Motions in Combustion Chambers for
  Propulsion Systems*, AGARDograph. The authoritative modern treatment of
  acoustic instability, including the solid-propellant response function and
  particle damping. Dense; read the physical-mechanism chapters first.
- **`[YA95]`** Yang & Anderson (eds.), *Liquid Rocket Engine Combustion
  Instability* and the companion solid-motor literature — read for the honest
  statements about T-burner scatter and the limits of response-function
  measurement.
- **`[Davenas]`** Davenas, *Solid Rocket Propulsion Technology*. European
  perspective, strong on propellant families and on the industrial reality of
  lot-to-lot ballistic control.
- **`reference/_verify-solid-coldgas.md`** — the course's own verification
  worksheet. Read §A.1 (RSRM), §A.8 (GEM), §A.10 (Star 48B), and the
  contested-figures section before quoting any real-motor number anywhere.
