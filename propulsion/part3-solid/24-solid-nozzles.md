# Module 24 — Solid Rocket Nozzles
Part III · Prerequisites: modules 02, 03, 20 · Estimated time: 7 h

A liquid-engine nozzle is a heat exchanger with a hole in it. A solid-motor
nozzle is a *consumable*: it is deliberately built out of materials that will
be partly destroyed during the burn, sized so that what remains at web
burnout is still a nozzle. The first time you see a post-fire throat insert
you understand the module: the throat is measurably bigger than it was on the
bench, the entrance region is grooved where alumina droplets scoured it, and
the exit-cone liner is a black char layer sitting on unchanged virgin
material. Everyone who has designed one has at some point been handed a
static-fire trace whose chamber pressure decayed 15 % over the burn when the
grain was supposed to be neutral, and has had to explain that the propellant
was innocent — the throat grew. Get the erosion allowance wrong on a
tactical motor and you deliver the wrong total impulse into the wrong
trajectory; get it wrong on a launch vehicle upper stage, as Vega-C did in
December 2022, and you lose the mission. This module is about designing the
part that is allowed to be eaten, and knowing exactly how much.

---

## 1. Learning objectives

After this module you should be able to:

1. Explain, from the energy balance, why a solid nozzle cannot be
   regeneratively cooled, and enumerate the four thermal-protection
   strategies available instead (heat sink, ablation, radiation, transpiration
   /sweating) with the regime where each wins.
2. Compute the convective throat heat flux of a solid motor from Bartz, add
   the particle-radiation term, and state why the radiative fraction is much
   larger in a metallized solid than in a liquid engine.
3. Select a throat material — bulk graphite, pyrolytic graphite, 2D/3D/4D
   carbon–carbon, refractory metal, or carbon-cloth phenolic — from burn
   time, chamber pressure, aluminium loading and cost, and defend the choice.
4. Name the three throat-erosion mechanisms, write the thermochemical
   reactions responsible, and justify the $\dot s \propto p_c^{0.8}$ scaling
   from the heat/mass-transfer analogy.
5. **Derive** the coupling between throat erosion and chamber pressure through
   $K_n(t)$, and predict the $p_c$, thrust, mass-flow and burn-time histories
   of an eroding neutral-grain motor in closed form.
6. Estimate two-phase (particle lag) losses for a given aluminium loading,
   particle size and nozzle length, and explain why the loss scales roughly as
   $d_p^2$ and inversely with nozzle length.
7. Size an ablative liner from a recession rate, an action time, a bond-line
   temperature limit and a stated margin policy, and say what each term in the
   thickness stack-up is protecting against.
8. Explain the packaging benefit of a submerged nozzle in terms of volumetric
   loading, and name the two penalties that buy it.
9. Compare flexseal, gimbal-ring, liquid-injection, jet-vane and jet-tab TVC
   on side-force capability, actuation load, inert mass and performance
   penalty, and match each to a real motor.
10. Explain why a solid booster runs a much lower expansion ratio than a
    liquid upper stage, and why an extendable exit cone changes that argument.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Throat area | $A_t$ | m² | minimum flow area; in a solid it is a function of time |
| Initial throat radius | $r_{t0}$ | m | throat radius at ignition |
| Throat recession (erosion) rate | $\dot s$ | m/s | rate of radial loss of throat surface |
| Exit area | $A_e$ | m² | nozzle exit plane area |
| Expansion ratio | $\varepsilon$ | — | $A_e/A_t$; time-varying in an eroding motor |
| Burning surface area | $A_b$ | m² | instantaneous propellant burning area |
| Klemmung | $K_n$ | — | $A_b/A_t$; the ratio that sets chamber pressure |
| Chamber pressure | $p_c$ | Pa | stagnation pressure at the head end |
| Burn rate | $r_b$ | m/s | propellant surface regression rate, $r_b = a p_c^n$ |
| Burn-rate coefficient | $a$ | m·s⁻¹·Pa⁻ⁿ | Vieille coefficient (units follow $n$) |
| Pressure exponent | $n$ | — | Vieille exponent, typically 0.2–0.5 for APCP |
| Propellant density | $\rho_p$ | kg/m³ | solid propellant density |
| Characteristic velocity | $c^*$ | m/s | $p_c A_t/\dot m$ |
| Thrust coefficient | $C_F$ | — | $F/(p_c A_t)$ |
| Adiabatic wall (recovery) temperature | $T_{aw}$ | K | gas temperature felt by an insulated wall |
| Recovery factor | $r$ | — | $\approx \mathrm{Pr}^{1/3}\approx0.9$ turbulent |
| Gas-side heat-transfer coefficient | $h_g$ | W/(m²·K) | convective film coefficient |
| Heat flux | $q$ | W/m² | wall heat flux, convective plus radiative |
| Surface emissivity / cloud emissivity | $\epsilon_r$ | — | radiative emissivity of the particle-laden gas |
| Thermal diffusivity | $\alpha$ | m²/s | $k/(\rho c)$ |
| Thermal penetration depth | $\delta_{th}$ | m | depth at which the transient temperature rise reaches a stated limit |
| Condensed-phase mass fraction | $X$ | — | mass fraction of the exhaust that is condensed Al₂O₃ |
| Particle diameter | $d_p$ | m | mass-mean alumina droplet diameter |
| Particle relaxation time | $\tau_v$ | s | velocity relaxation time of a particle in the gas |
| Thermal relaxation time | $\tau_T$ | s | temperature relaxation time of a particle |
| Velocity lag | $\Delta u$ | m/s | $u_g - u_p$ at a station |
| Divergence (angularity) efficiency | $\lambda_d$ | — | axial-thrust fraction from a non-axial exit flow |
| Nozzle deflection angle | $\delta$ | rad or ° | TVC angle of the nozzle centreline |
| Flexseal spring rate | $k_s$ | N·m/rad | restoring torque per radian of nozzle deflection |
| Side-force amplification (LITVC) | $K_A$ | — | side force per unit axial thrust of the injectant alone |
| Action time | $t_a$ | s | time from ignition to a stated low-pressure cut-off |
| Web time | $t_w$ | s | time to burn through the propellant web |
| Propellant mass fraction | $\lambda_m$ | — | $m_p/(m_p+m_{inert})$ |

---

## 3. Theory

### 3.1 Why a solid nozzle is a different machine

Start with the energy balance, because it is the whole reason the hardware
looks different. In a regeneratively cooled liquid engine, the heat that
crosses the gas-side wall is carried away by propellant that is going into
the chamber anyway; the thermal design problem is a steady-state one, and the
wall runs at a temperature set by a balance between $h_g$ on one side and the
coolant film coefficient on the other. That option does not exist in a solid
motor. There is no propellant flowing anywhere except through the nozzle, and
it arrives there already burned. Every joule that enters the nozzle wall must
be either

1. **stored** in the thermal mass of the wall (heat sink),
2. **spent** breaking chemical bonds and blowing pyrolysis gas back into the
   boundary layer (ablation),
3. **re-radiated** from a hot surface (only useful for a radiation-cooled
   external skirt), or
4. **carried away by a sacrificial mass flow** produced inside the wall
   (transpiration / "sweating", the historical tungsten-infiltrated-silver
   trick).

[F] All four are transient strategies. That is acceptable only because a
solid motor burns once, for a *known* duration, and is then thrown away. The
design variable is not wall temperature; it is **how much material you are
willing to lose in $t_a$ seconds**. A solid nozzle is sized in the same units
as an ablative heat shield, not in the units of a heat exchanger.

Five further differences follow, and each drives a section below.

**The flow is loaded with condensed particles.** Aluminised composite
propellant burns to a gas plus molten aluminium oxide. At 16–19 % Al by mass
the exhaust is roughly a third condensed Al₂O₃ *by mass* (§5.2 computes it).
This changes everything downstream: the particles do not expand, they lag the
gas, they radiate as a grey cloud, and they impinge on the walls. A liquid
engine designer thinks about a gas; a solid nozzle designer thinks about a
two-phase spray moving at Mach 3.

**The throat area is a function of time.** The throat is being chemically and
mechanically eaten. Because $p_c$ in a solid motor is set by $K_n = A_b/A_t$,
a growing $A_t$ *is* a falling chamber pressure. There is no equivalent
coupling in a liquid engine, where an eroded throat would simply lower $p_c$
at fixed $\dot m$ and be caught by the feed system. §3.4 derives it.

**The nozzle is inert mass, and inert mass is the currency of the whole
vehicle.** Write the stage mass fraction

$$\lambda_m = \frac{m_p}{m_p + m_{inert}}$$

> **Eq. 3.1** — variables: $m_p$ propellant mass [kg], $m_{inert}$ everything
> else [kg]. Meaning: the fraction of stage mass that is useful. Assumes a
> single-stage accounting with no residuals. Fails as a figure of merit when
> comparing stages of very different $I_{sp}$ — use $\Delta v$ then.

For a modern filament-wound booster $\lambda_m \approx 0.92$ (P120C: 141,400
kg propellant, 11,200 kg inert, $\lambda_m = 0.924$, `[WP]`/Avio, conf B) and
the nozzle assembly is typically **10–25 % of that inert mass** — after the
case, it is the biggest single inert item. [J] Every kilogram of ablative
margin you add because you did not trust your erosion model is a kilogram of
payload. This is why the erosion prediction problem is worth as much
engineering effort as it gets.

**Packaging is a first-order constraint.** A silo, a submarine tube, a
strap-on cradle or an interstage sets the length you may occupy. A
conventional external nozzle wastes that length on a convergent section
hanging behind the aft dome. The *submerged* nozzle buries the convergent
section inside the case (§3.5). Almost every large modern solid does this,
and no liquid engine ever has, because a liquid chamber cannot be pushed
inside a tank.

**There is exactly one nozzle and it is also the aft closure.** The nozzle in
a solid motor carries the aft pressure load, seals the case, provides the
thrust-vector actuation attachment, and in a submerged design also protects
the aft dome from a re-circulating hot cavity flow. It is a structural
component with a hole through it, not a bolt-on.

### 3.2 The thermal environment

**Driving temperature.** The wall does not see the stagnation temperature; it
sees the recovery temperature,

$$T_{aw} = T_c\,\frac{1 + r\,\frac{\gamma-1}{2}M^2}{1 + \frac{\gamma-1}{2}M^2},
\qquad r \approx \mathrm{Pr}^{1/3} \approx 0.9$$

> **Eq. 3.2** — variables: $T_c$ chamber (flame) temperature [K], $M$ local
> Mach number, $r$ recovery factor, $\gamma$ specific-heat ratio. Meaning: the
> temperature an insulated wall reaches in a high-speed boundary layer.
> Assumes a calorically perfect gas and a turbulent boundary layer. Fails for
> a strongly two-phase boundary layer, where particle impacts deposit energy
> that this expression does not contain, and where the effective $\gamma$ and
> $\mathrm{Pr}$ of the mixture are not those of the gas.

At the throat ($M=1$, $\gamma = 1.18$) this gives $T_{aw} \approx 0.99\,T_c$:
for an APCP flame temperature of 3400 K, $T_{aw} \approx 3372$ K. [A] For
practical purposes the throat of a solid motor sees the flame temperature. It
is above the melting point of every metal except tungsten (3695 K) and above
the sublimation point of nothing useful except carbon (which does not melt at
these pressures — it sublimes above ~3900 K). **That single fact is why solid
throats are made of carbon.**

**Convective flux.** Use Bartz (Module 10) unchanged; nothing about a solid
invalidates it for the gas phase:

$$h_g = \frac{0.026}{D_t^{0.2}}\left(\frac{\mu^{0.2}c_p}{\mathrm{Pr}^{0.6}}\right)_0
\left(\frac{p_c}{c^*}\right)^{0.8}\left(\frac{D_t}{r_c}\right)^{0.1}
\left(\frac{A_t}{A}\right)^{0.9}\sigma$$

> **Eq. 3.3** — variables as Module 10: $D_t$ throat diameter [m], $r_c$
> throat longitudinal radius of curvature [m], $\sigma$ property-variation
> factor, subscript 0 = chamber stagnation. Meaning: turbulent pipe-flow
> correlation adapted to a nozzle. Assumes single-phase gas, attached
> turbulent boundary layer, no particles. Accuracy ±20–30 % at the throat and
> worse elsewhere; in a metallized solid it is worse still because the
> particle-laden boundary layer is not the gas it assumes. `[Bartz57]`,
> `[SP-8115]`.

The key exponent is $p_c^{0.8}$: **doubling chamber pressure raises the throat
flux by 74 %,** and (see §3.4) raises the erosion rate by about the same
factor. This is the single most important reason that solid boosters run at
4–7 MPa while liquid engines run at 10–30 MPa. It is not that solids *cannot*
run high pressure — small tactical motors run above 15 MPa for short times —
it is that a long-burning motor at high $p_c$ eats its throat.

Worked in §5.1: a 0.6 m-diameter throat at 6.0 MPa gives
$h_g \approx 1.0\times10^{4}$ W/(m²·K) and, against a 2800 K graphite surface,
$q_{conv} \approx 5.7$ MW/m². Compare an SSME throat at ~160 MW/m². The solid
is an order of magnitude gentler in flux — and yet it is the harder thermal
problem, because there is nowhere for the heat to go.

**Radiative flux.** In a liquid engine the exhaust is a thin, mostly
transparent gas and radiation contributes a few percent of the throat flux. In
a metallized solid the chamber is full of incandescent Al₂O₃ droplets and the
cloud is optically thick over a path of centimetres. Model it as a grey body:

$$q_{rad} = \epsilon_r\,\sigma_{SB}\left(T_g^4 - T_w^4\right)$$

> **Eq. 3.4** — variables: $\epsilon_r$ effective cloud emissivity (—),
> $\sigma_{SB}=5.670\times10^{-8}$ W/(m²·K⁴), $T_g$ radiating gas/particle
> temperature [K], $T_w$ wall temperature [K]. Meaning: net radiant exchange
> between an optically thick particle cloud and the wall. Assumes grey,
> optically thick, uniform-temperature cloud and a grey wall. Fails in the
> exit cone where the cloud thins and cools and the optical thickness drops
> below unity; fails at low aluminium loading. $\epsilon_r$ is commonly taken
> as 0.3–0.9 depending on loading and path length `[SP-8115]`, and is the
> weakest number in the analysis. [A]

At 3400 K with $\epsilon_r = 0.5$, $q_{rad} = 3.8$ MW/m² — **40 % of the total
throat flux** in the example above, and a larger fraction still in the
subsonic entrance region where the gas is hot and slow and the convective
term is small. [F] Radiation is not a correction in a solid motor; it is a
comparable term. It is also why the *entrance* region and the submerged
cavity, where nothing is moving fast, can still be attacked hard.

**Particle impingement.** Where the streamlines turn, the particles do not
follow. The Stokes number

$$\mathrm{Stk} = \frac{\tau_v\,u}{L_c},\qquad
\tau_v = \frac{\rho_{Al_2O_3}\,d_p^2}{18\,\mu}$$

> **Eq. 3.5** — variables: $\tau_v$ particle velocity relaxation time [s],
> $u$ local gas speed [m/s], $L_c$ characteristic turning length [m],
> $\rho_{Al_2O_3}\approx3000$ kg/m³ for molten alumina, $d_p$ particle
> diameter [m], $\mu$ gas viscosity [Pa·s]. Meaning: ratio of particle
> response time to flow time; $\mathrm{Stk}\ll1$ particles follow the gas,
> $\mathrm{Stk}\gtrsim1$ they fly straight and hit the wall. Assumes Stokes
> drag, which requires particle Reynolds number $\lesssim1$; at nozzle
> conditions $\mathrm{Re}_p$ is 5–30, so $\tau_v$ must be corrected
> (§5.2). Fails for agglomerates and for particles that shatter on impact.

Two regions have $\mathrm{Stk}$ of order unity and both are known erosion
hot-spots: the **submerged nozzle nose**, where the flow must turn through
more than 90° to get into the throat, and the **throat entrance** itself. Any
motor with a high spin rate or a canted grain adds a centrifugal term that
makes it worse. [E] The signature of particle-driven erosion is *asymmetric*
or *streaked* wear that a purely thermochemical model cannot produce, and
seeing it on a post-fire part is diagnostic.

**Transient conduction into the wall.** The problem is one-dimensional
transient conduction into a semi-infinite solid for most of the burn, because
the thermal penetration depth is small compared with the liner thickness:

$$\frac{T(x,t)-T_i}{T_s-T_i} = \mathrm{erfc}\!\left(\frac{x}{2\sqrt{\alpha t}}\right)$$

> **Eq. 3.6** — variables: $T_i$ initial temperature [K], $T_s$ imposed
> surface temperature [K], $x$ depth [m], $\alpha=k/(\rho c)$ thermal
> diffusivity [m²/s], $t$ time [s]. Meaning: how deep the heat has got. Assumes
> constant properties, a step change in surface temperature, no ablation, no
> internal decomposition, semi-infinite body. Fails once $\delta_{th}$
> approaches the liner thickness (then use a finite-slab or numerical
> solution), and fails quantitatively in a charring ablator, where pyrolysis
> gas blowing and the moving surface both matter. It is nonetheless the right
> *sizing* tool. [A]

For virgin carbon-cloth phenolic, $\alpha \approx 1.3\times10^{-7}$ m²/s.
Over a 250 s burn-plus-soak, $\sqrt{\alpha t} = 5.7$ mm — so the heat gets
about a centimetre into the material and no further. That number is why
ablative liners are centimetres thick and not decimetres, and it is used
directly in §5.3.

### 3.3 Throat materials

The throat insert is the highest-value part of the nozzle: it sets $A_t$,
which sets $p_c$, which sets everything. Materials, in the order a designer
should consider them.

**Bulk polycrystalline graphite (ATJ, G-90, and equivalents).** [H][M]
Fine-grained, isotropic, moulded-and-baked graphite. Density 1.7–1.85 g/cm³,
sublimes rather than melts, and — the property that startles people — its
tensile strength *increases* with temperature up to roughly 2500 °C before
falling. Cheap, machinable to a real tolerance, and forgiving.
Its two weaknesses are **porosity** (open porosity of a few percent lets
oxidizing species into the bulk and turns surface recession into volumetric
loss) and **thermal-shock resistance** (the ignition transient imposes a
surface-to-interior $\Delta T$ of >2000 K in tens of milliseconds; the
figure of merit is $\sigma k/(E\alpha_{th})$ and graphite is mediocre at it).
The classic failure is a radial crack through the insert at ignition,
followed by hot-gas flow behind the insert. Bulk graphite is the correct
choice for short-burning, moderate-pressure, cost-sensitive motors and for
the entrance rings of larger ones.

**Pyrolytic graphite (PG).** [H] Deposited from the vapour phase in layers, so
it is grossly anisotropic: thermal conductivity along the deposition planes
is 100–300× that across them. Built into a throat as a stack of *washers*
with the low-conductivity direction pointing into the wall, PG is an
excellent thermal barrier, and the high in-plane conductivity spreads the
flux. It is expensive, brittle, and delaminates if you get the stress state
wrong. Largely displaced by carbon–carbon, but it is the historically
important intermediate step and still appears in small high-performance
motors.

**Carbon–carbon composite (C/C).** [M] Carbon fibre in a carbon matrix, made
by repeated cycles of resin or pitch impregnation and pyrolysis, or by
chemical vapour infiltration (CVI) of a fibre preform. This is the modern
answer for throats that must survive a long burn at high pressure. The
architecture matters and is the thing to know:

| architecture | description | why |
|---|---|---|
| **2D** | stacked or wound fabric plies | cheapest C/C; has a delamination plane, so ply-lift and preferential erosion along the interlaminar direction are the failure modes |
| **3D** | orthogonal fibre bundles woven in $x$, $y$, $z$ | no continuous delamination plane; nearly isotropic erosion; the workhorse for large throat inserts |
| **4D** | four bundle directions (the four body diagonals of a cube, or three in-plane + axial) | more nearly isotropic still, better resistance to the combined thermal-shock and shear state at a throat; expensive, long lead time |

C/C erodes 2–5× more slowly than bulk graphite at the same conditions
because it is denser, less porous, and the fibre architecture arrests the
grain-boundary attack that removes bulk graphite. It is also the most
supplier-sensitive material in the whole motor: the Vega-C VV22 failure in
December 2022 was attributed by the independent enquiry to unexpected
erosion of the Zefiro 40 **carbon–carbon throat insert**, traced to a change
of insert-material supplier (conf C on the attribution detail, `[WP]`/ESA
enquiry press material — the primary enquiry report should be read before
this is repeated as fact). Nothing else in this course connects a materials
qualification decision to a lost launch vehicle so directly.

**Refractory metals.** [H] Tungsten (melting point 3695 K, density 19,300
kg/m³) and molybdenum were used as throat inserts in the 1950s and 60s,
sometimes as **silver-infiltrated tungsten**, in which the silver boils out of
the porous tungsten matrix during the burn and transpiration-cools the
surface — genuine sweat cooling in a solid motor. It works. It is also
absurdly heavy: a tungsten insert of the same geometry as the 3D C/C insert
in §5.3 (about 56 kg at 1800 kg/m³) would mass roughly 600 kg. [J] For a
tactical motor where the throat is 30 mm across and the burn is 3 s, that
penalty is a few hundred grams and tungsten's dimensional stability may be
worth it; for anything at launch-vehicle scale the mass ends the argument
before the thermal analysis begins. Modern practice is carbon.

**Ablative liners (the rest of the nozzle).** [M] Downstream of the insert,
and usually upstream of it as well, the nozzle is lined with a **charring
ablator**: a phenolic (or occasionally a higher-char-yield polyimide) resin
reinforced with a cloth. Three reinforcements matter:

| liner | reinforcement | typical use | notes |
|---|---|---|---|
| **carbon-cloth phenolic (CCP)** | carbon or graphite fabric | throat entrance, throat backup, forward exit cone | highest char yield, lowest recession, most expensive; the RSRM and most large motors use it where flux is highest |
| **silica-cloth phenolic** | fused-silica fabric | mid and aft exit cone | lower conductivity than carbon, so a thinner *thermal* requirement; silica melts and runs above ~1900 K, so it cannot take the throat |
| **glass-cloth phenolic** | E-glass fabric | aft exit cone, low-flux regions, cheap motors | cheapest, worst recession, lowest use temperature |

The mechanism is worth stating precisely because "it ablates" is not an
explanation. Heat arriving at the surface drives four processes at once:

1. **Pyrolysis.** Below the surface, at roughly 600–900 K, the phenolic resin
   decomposes into a porous carbon char plus gaseous products (H₂O, CO, CO₂,
   CH₄, H₂, phenol fragments). The reaction is endothermic and consumes a
   large share of the incoming heat. The reaction zone is a moving front.
2. **Transpiration/blowing.** The pyrolysis gas percolates out through the
   char and into the boundary layer. Injecting cool gas into a hot boundary
   layer thickens it and cuts $h_g$ — the "blowing reduction" is typically a
   20–50 % reduction in convective flux `[SP-8115]`. This is the second
   largest heat-absorption term after pyrolysis, and it is the reason an
   ablator outperforms an inert insulator of the same thermal properties.
3. **Char reactions and mechanical removal at the surface.** The char, which
   is essentially carbon, is then attacked by exactly the same thermochemical
   reactions that eat the throat insert (§3.4), and is also removed
   mechanically by shear and particle impact. The surface recedes.
4. **Conduction into the virgin material.** Whatever is not absorbed by 1–3
   goes into the substrate as Eq. 3.6.

So a liner has three zones at any instant: **char** (porous carbon, surface),
**pyrolysis zone** (a few millimetres, resin decomposing), and **virgin
material** (unchanged, cool). A properly sized liner still has virgin material
at the bond line at the end of the soak — that is precisely the design
criterion in §5.3.

**Tape-wrap angle.** Ablative liners are built by winding a resin-impregnated
tape onto a mandrel and curing it under pressure, and the angle between the
ply and the local nozzle centreline is a design variable, not a manufacturing
detail. Plies laid **parallel to the centreline** put the low-conductivity
through-thickness direction where you want it but leave a delamination plane
aligned with the flow; plies laid **perpendicular** (across the flow) resist
ply-lift but conduct heat inward faster. Most large nozzles use a **bias
angle** somewhere between 20° and 60°, chosen per station. Getting it wrong
gives you **ply lift**: gas pressure inside the char delaminates and levers up
a ply, exposing an edge to the flow, and the erosion rate at that spot goes
up by an order of magnitude. It is the characteristic ablative failure and
it looks, on a post-fire part, like a set of raised shingles.

### 3.4 Throat erosion

**Three mechanisms, always present together, in different proportions.**

**(1) Thermochemical attack.** [F] The exhaust of an AP/Al/HTPB propellant is
fuel-rich in the sense that matters here: it contains substantial H₂O and CO₂,
plus OH and H at these temperatures. Carbon is not stable in their presence:

$$\mathrm{C(s)} + \mathrm{H_2O} \rightarrow \mathrm{CO} + \mathrm{H_2},
\qquad \Delta H^\circ_{298} = +131\ \mathrm{kJ/mol}$$
$$\mathrm{C(s)} + \mathrm{CO_2} \rightarrow 2\,\mathrm{CO},
\qquad \Delta H^\circ_{298} = +172\ \mathrm{kJ/mol}$$
$$\mathrm{C(s)} + \mathrm{OH} \rightarrow \mathrm{CO} + \mathrm{H}$$

> **Eq. 3.7** — the three reactions that consume a carbon throat. Meaning:
> the throat is not "melting" or "burning" in the O₂ sense; it is being
> gasified by steam and carbon dioxide. Both principal reactions are strongly
> endothermic, which is a partial self-limitation — the reaction cools the
> surface it is attacking. Assumes carbon is the surface material and the
> local gas is in the composition given by the chamber equilibrium; fails when
> the surface is silica or a metal, and fails to describe the low-temperature
> limit where kinetics rather than transport control the rate. `[SP-8115]`,
> `[Kubota]`.

Above about 2500 K the surface kinetics are fast compared with the rate at
which H₂O and CO₂ can be delivered across the boundary layer, so the process
is **diffusion-limited**. That is a very useful statement, because a
diffusion-limited surface reaction rate is proportional to the mass-transfer
coefficient, and by the Reynolds/Chilton–Colburn analogy the mass-transfer
coefficient scales exactly as the heat-transfer coefficient does. From Eq.
3.3, $h_g \propto p_c^{0.8} D_t^{-0.2}$, hence

$$\dot s \;\propto\; p_c^{0.8}\,D_t^{-0.2}\,\chi_{ox}$$

> **Eq. 3.8** — variables: $\dot s$ radial recession rate [m/s], $p_c$ [Pa],
> $D_t$ throat diameter [m], $\chi_{ox}$ combined mole fraction of oxidizing
> species (H₂O + CO₂ + OH) in the exhaust [—]. Meaning: erosion is a
> transport-limited surface reaction, so it inherits Bartz's pressure
> scaling. Assumes diffusion control (surface above ~2500 K), a carbon
> surface, and no particle contribution. [E] Fails at low pressure and low
> temperature (kinetics-controlled, much weaker pressure dependence), and
> fails for the entrance region of a submerged nozzle where impingement
> dominates. Reported exponents in the literature run 0.6–0.9 depending on
> motor and fit; 0.8 is the standard engineering value. `[SP-8115]`,
> `[SP-8039]`.

Eq. 3.8 carries a genuine, non-obvious design consequence: **raising the
aluminium loading reduces thermochemical erosion.** Aluminium scavenges
oxygen — each Al atom that becomes Al₂O₃ removes 1.5 O atoms from the gas
phase, converting H₂O and CO₂ to H₂ and CO, which do not attack carbon
nearly as fast. Going from 16 % to 20 % Al measurably lowers $\chi_{ox}$. But
the same change raises the condensed-phase fraction, which raises particle
impingement erosion and two-phase losses. [J] Erosion and performance pull
the aluminium loading in opposite directions and the optimum is motor-specific;
this is one of the trades that is genuinely settled by test, not analysis.

**(2) Mechanical removal.** Shear at the wall, thermal-stress spallation,
and — in ablatives — ply lift. Bulk graphite loses grains at the boundaries
once the binder-phase carbon between them has been gasified; the visible
result is a rougher surface and a recession rate higher than pure chemistry
predicts.

**(3) Particle impingement.** [E] Molten alumina droplets arriving at
$\mathrm{Stk}\gtrsim1$ deliver both momentum and heat. In the throat proper
the flow is nearly aligned with the wall and the contribution is modest; in
the *entrance* region of a submerged nozzle it can be the dominant term and
produces the localized "pocketing" erosion pattern.

**Typical rates.** [E] These are engineering ranges, not a specification for
any motor; erosion depends on propellant, pressure, geometry and material lot.

| material | station | typical $\dot s$ (mm/s) at 5–7 MPa |
|---|---|---|
| 3D/4D carbon–carbon | throat | 0.02–0.10 |
| bulk graphite (ATJ class) | throat | 0.05–0.25 |
| carbon-cloth phenolic | throat entrance / backup | 0.10–0.30 |
| carbon-cloth phenolic | forward exit cone ($\varepsilon\approx2$–5) | 0.05–0.15 |
| silica-cloth phenolic | aft exit cone | 0.05–0.20 |
| glass-cloth phenolic | aft exit cone, low flux | 0.10–0.40 |

A useful sanity rule: **large launch-vehicle solids lose 3–10 % of throat
*area* over a full burn**; well-designed C/C throats sit at the bottom of
that band, ablative throats at the top. If your model predicts 1 % or 30 %,
something is wrong.

**The $K_n(t)$ coupling — the derivation that matters.**

From Module 20, the equilibrium chamber pressure of a solid motor is

$$p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{\frac{1}{1-n}},\qquad K_n = \frac{A_b}{A_t}$$

> **Eq. 3.9** — variables: $a$ [m·s⁻¹·Pa⁻ⁿ], $\rho_p$ [kg/m³], $c^*$ [m/s],
> $A_b$, $A_t$ [m²], $n$ [—]. Meaning: mass generated at the grain surface
> equals mass leaving through the throat. Assumes quasi-steady operation (gas
> residence time ≪ burn time), $n<1$ for stability, uniform $p_c$, no erosive
> burning. Fails during ignition and tail-off transients and for $n\to1$.

Take logarithms and differentiate with respect to time. $a$, $\rho_p$, $c^*$
and $n$ are constants:

$$\frac{1}{p_c}\frac{dp_c}{dt} = \frac{1}{1-n}\left[\frac{1}{A_b}\frac{dA_b}{dt}
- \frac{1}{A_t}\frac{dA_t}{dt}\right]$$

> **Eq. 3.10** — the master equation of this module. Meaning: fractional
> chamber-pressure rate is the difference of the fractional burning-area rate
> and the fractional throat-area rate, amplified by $1/(1-n)$. Assumes Eq.
> 3.9's assumptions. **Read the amplification:** for a typical APCP $n=0.35$,
> $1/(1-n) = 1.54$, so *every* fractional error in throat area shows up 54 %
> larger in chamber pressure. For a high-exponent propellant ($n=0.6$) the
> amplification is 2.5. This is why the pressure exponent is a nozzle
> designer's problem and not only a propellant chemist's.

Now specialise. For a **neutral grain**, $dA_b/dt = 0$ by definition. With a
circular throat of radius $r_t$ eroding at a constant radial rate $\dot s$,

$$r_t(t) = r_{t0} + \dot s\,t, \qquad A_t(t) = \pi r_t^2, \qquad
\frac{1}{A_t}\frac{dA_t}{dt} = \frac{2\dot s}{r_{t0}+\dot s t}$$

Substituting into Eq. 3.10 and integrating from 0 to $t$:

$$\boxed{\;\frac{p_c(t)}{p_c(0)} = \left(1 + \frac{\dot s\,t}{r_{t0}}\right)^{-\frac{2}{1-n}}\;}$$

> **Eq. 3.11** — variables: $\dot s$ [m/s], $r_{t0}$ [m], $n$ [—], $t$ [s].
> Meaning: closed-form pressure decay of a neutral-grain motor with a
> constant-rate eroding throat. Assumes neutral grain, constant $\dot s$,
> circular throat, quasi-steady $p_c$, constant $c^*$. Fails when erosion is
> pressure-dependent (see below), when the grain is not neutral (superpose
> the $A_b$ term of Eq. 3.10), and once the insert is breached.

For small erosion, linearise: $\dfrac{\Delta p_c}{p_c} \approx
-\dfrac{2\dot s t}{(1-n)\,r_{t0}}$. **A 1 % growth in throat radius costs
about 3 % of chamber pressure at $n=0.35$.** That factor of three is the
number to carry in your head.

**Thrust does not fall as fast as pressure.** With $C_F$ roughly constant,

$$\frac{F(t)}{F(0)} = \frac{p_c(t)\,A_t(t)}{p_c(0)\,A_t(0)}
= \left(1+\frac{\dot s t}{r_{t0}}\right)^{2}\left(1+\frac{\dot s t}{r_{t0}}\right)^{-\frac{2}{1-n}}
= \left(1+\frac{\dot s t}{r_{t0}}\right)^{-\frac{2n}{1-n}}$$

> **Eq. 3.12** — meaning: the throat grows (raising thrust for a given
> pressure) at the same time as the pressure falls, and the two partly cancel.
> The surviving exponent is $-2n/(1-n)$, which vanishes as $n\to0$. Assumes
> constant $C_F$, i.e. it ignores the small $C_F$ loss from the falling
> $\varepsilon = A_e/A_t$. **A zero-exponent propellant would hold thrust
> perfectly constant under throat erosion** — which is one of the reasons
> low-$n$ propellants are prized, quite apart from stability.

Mass flow follows thrust: $\dot m = p_c A_t/c^*$, so
$\dot m(t)/\dot m(0) = F(t)/F(0)$ at constant $C_F$ and $c^*$. Since $\dot m$
falls, the **web takes longer to burn** than the un-eroded prediction; a
motor with a badly eroding throat delivers nearly the same total impulse over
a longer, lower, flatter trace. Total impulse is roughly conserved
(propellant mass is what it is; only the small $I_{sp}$ change matters), but
the *trajectory* is not, and for a booster whose max-Q is set by the thrust
trace, that is the whole design problem.

**Erosion is itself pressure-dependent.** Substituting Eq. 3.8,
$\dot s = \dot s_0 (p_c/p_{c0})^{0.8}$, into the throat-growth equation gives
a coupled pair that must be integrated numerically. The feedback is
*stabilising*: erosion lowers $p_c$, which lowers erosion. §5.1 shows the
effect is small (about 5 % less total recession than the constant-rate
model), which is why the closed form of Eq. 3.11 remains the right hand
calculation and the numerical model is for the final design.

**Erosion also lowers $\varepsilon$.** $A_e$ is fixed (the exit cone erodes
too, but far more slowly and at much larger radius), so
$\varepsilon(t) = A_e/A_t(t)$ falls. In §5.1 the expansion ratio drops from
16.0 to 14.8 and vacuum $C_F$ from 1.813 to 1.803 — about 1.4 s of $I_{sp}$.
Small, but it is a systematic loss that a naive constant-$\varepsilon$
performance prediction will miss, and it is in the direction that flatters
your prediction. [J] Always compute delivered impulse with the eroded
$\varepsilon$ history.

### 3.5 Submerged nozzles

A **submerged** nozzle has its throat plane forward of the case aft-dome
attachment: the convergent section, and often the whole throat assembly, sits
*inside* the motor, surrounded by propellant or by the aft cavity. Almost
every large modern solid does this — RSRM, P120C, the Zefiro family, the
Trident and Peacekeeper stages, Star 48 — for one reason.

**The packaging argument.** Vehicle length is the constrained dimension: silo
depth, submarine tube length, strap-on/core attachment geometry, fairing
volume, transport. A conventional external nozzle adds the whole convergent
length behind the aft dome. Submerging it recovers typically **half to
two-thirds of the convergent length**, and for a motor with a large
contraction ratio that is a substantial fraction of a metre on a booster,
tens of centimetres on an upper stage. Equivalently, at fixed stage length you
get more propellant. Define volumetric loading

$$\eta_V = \frac{V_p}{V_{env}}$$

> **Eq. 3.13** — variables: $V_p$ propellant volume [m³], $V_{env}$ the
> cylindrical envelope volume the stage is allowed to occupy [m³]. Meaning:
> how much of the space you were given contains propellant. Assumes a defined
> envelope. Fails as a figure of merit when the envelope is not the binding
> constraint (a strap-on limited by attach-point loads, for instance).

Submerging the nozzle raises $\eta_V$ by a few percent, and — because
propellant mass scales with $\eta_V$ while most inert mass does not —
it raises $\lambda_m$ too. For a length-limited weapon system this is not a
refinement; it is the difference between meeting range and not.

**What it costs.** Two things.

*Cavity flow losses.* The annular cavity between the nozzle's outer surface
and the aft dome/grain is a dead volume with hot gas recirculating in it. The
flow entering the nozzle must turn through more than 90°, which is a
non-isentropic turning loss, and the recirculation in the cavity dissipates
energy. Published estimates put the **submergence loss at roughly 0.5–1.5 %
of $I_{sp}$** `[SP-8115]`, conf C on the exact figure. [A] It is a real,
consistent loss and it is charged against the packaging gain.

*Cavity thermal environment and slag.* The cavity is a trap. Molten alumina
that separates from the flow collects there; for a booster with a long burn
and a high spin or acceleration environment it can accumulate as **slag** —
tens to hundreds of kilograms of retained aluminium oxide in a large motor.
Slag is triply bad: it is inert mass carried the whole way, it is unpredictable
mass (so it corrupts the propellant-mass-fraction bookkeeping and the
tail-off), and when it sloshes or ejects it makes a thrust transient. The
aft-dome and cavity insulation must survive a long soak in a recirculating,
particle-laden 3400 K environment with almost no convective cooling —
this is exactly the condition where the radiative term of Eq. 3.4 dominates.
The **nose ring** of a submerged nozzle, which faces the oncoming turning
flow, sees the worst particle impingement in the motor and is normally a
separate, thicker, carbon-cloth-phenolic or C/C part.

### 3.6 The exit cone

**Divergence loss.** For a conical nozzle of half-angle $\alpha$ the exit
velocity is not axial, and integrating the axial component over a spherical
exit surface gives

$$\lambda_d = \frac{1+\cos\alpha}{2}$$

> **Eq. 3.14** — variables: $\alpha$ cone half-angle [rad]. Meaning: the
> fraction of momentum flux that is axial. Assumes a conical nozzle with
> uniform-magnitude exit velocity on a spherical cap, no boundary layer, no
> particles. Fails for contoured (bell) nozzles, for which $\lambda_d$ must be
> computed from the actual exit-plane flow angle distribution, and fails to
> capture two-phase effects entirely. For $\alpha=15°$, $\lambda_d = 0.983$ —
> the classic 1.7 % loss. `[SB §3.4]`, `[Rao58]`.

A contoured (Rao/parabolic) bell recovers most of that 1.7 % in 75–85 % of
the conical length, and every serious solid nozzle since the 1960s is
contoured. But **the optimum contour for a two-phase flow is not the Rao
contour for the gas.** Two effects push it the other way:

1. Rapid turning immediately downstream of the throat, which is how a Rao
   contour gets its length back, is exactly what makes particles fail to
   follow the streamlines — high local $\mathrm{Stk}$, wall impingement, and
   the largest particle–gas velocity difference where the gas is accelerating
   fastest.
2. The particles need *length* to be accelerated by drag. A contour that is
   optimal for a gas is too short for the condensed phase.

[J] The practical result is that solid-motor exit cones are contoured but
with a gentler initial expansion angle and a longer relative length than a
pure gas-dynamic optimisation would give — and that the final contour comes
out of a two-phase method-of-characteristics or CFD calculation, not from the
Rao charts. `[SP-8115]` is explicit that gas-only contour optimisation is
inadequate for metallized motors.

**Why solid boosters use low expansion ratios.** RSRM ran $\varepsilon =
7.72$ (conf C; 7.16 on later motors). The P230 and P120C are in the same
region. A liquid upper stage runs 40–285. Four independent reasons, and it is
worth separating them because students usually name only the first:

1. **Ambient pressure.** A first-stage nozzle is sized so the exit pressure
   does not fall so far below ambient at sea level that the flow separates.
   For RSRM the ideal exit pressure at $\varepsilon=7.72$ and $p_c=6.25$ MPa
   is about 116 kPa — slightly *over*-expanded relative to nothing, i.e.
   essentially matched at sea level, which is exactly where a booster that
   burns out at ~45 km wants to be if you weight the trajectory correctly.
2. **Ablative mass grows with area.** The exit cone must be lined, and the
   lining thickness does not shrink as fast as the flux does. §5.3 sizes a
   447 kg liner for a modest $\varepsilon=16$ cone. Doubling $\varepsilon$
   roughly doubles the wetted area. At $\lambda_m = 0.92$, several hundred
   kilograms of nozzle is real payload.
3. **Two-phase losses grow with $\varepsilon$.** More expansion means more
   gas acceleration that the particles do not share, so the lag loss of §5.2
   grows monotonically with area ratio. A high-$\varepsilon$ metallized nozzle
   does not deliver its ideal $C_F$.
4. **Base and interstage geometry.** A booster's exit diameter is bounded by
   the vehicle's base area, the adjacent booster, or the plume-impingement
   limit on the core.

Solid *upper stages*, where none of 1 and 4 apply, do use high area ratios:
the Star 48B runs $\varepsilon \approx 47.7$ (short nozzle) or 54.8–70.4
(long nozzle) `[JM-LV]`/`[EA]`, conf C. So "solids use low $\varepsilon$" is
wrong as stated; the correct statement is that *sea-level solid boosters* use
low $\varepsilon$, for reasons 1–4, and that ablative mass and two-phase loss
shift the optimum down relative to a liquid stage even in vacuum.

### 3.7 Extendable exit cones

If the binding constraint is *stowed length* rather than mass, deploy the
last section of the nozzle after separation. The **extendable exit cone
(EEC)** — also "extendible nozzle", "deployable exit cone" — is a conical or
contoured skirt stowed around or forward of the fixed nozzle and translated
aft on rails or screws after the stage separates and before or just after
ignition.

The trade is a clean one. Let the fixed nozzle have area ratio
$\varepsilon_1$ and the deployed nozzle $\varepsilon_2$. The gain is

$$\Delta I_{sp} = \frac{c^*}{g_0}\left[C_F(\varepsilon_2) - C_F(\varepsilon_1)\right]$$

> **Eq. 3.15** — variables: $c^*$ [m/s], $C_F$ vacuum thrust coefficient at
> each area ratio [—], $g_0=9.80665$ m/s². Meaning: the specific-impulse
> payoff of the extension. Assumes vacuum operation, ideal one-dimensional
> expansion, the same $c^*$, and — importantly — that the deployed cone
> achieves its ideal $C_F$, which for a two-phase flow it does not (§3.6,
> item 3). Fails if the extension is deployed at non-negligible ambient
> pressure.

and the cost is the mass of the skirt, the rails, the actuators and the
deployment redundancy, plus a mission-critical single-shot mechanism in
series with the burn. The break-even is a rocket-equation comparison: the EEC
pays when

$$\frac{\Delta I_{sp}}{I_{sp}} \;>\; \frac{\Delta m_{inert}}{m_{final}}
\cdot \frac{1}{\Delta v / (I_{sp}g_0)} \quad\text{(order-of-magnitude form)}$$

[J] In practice EECs pay on upper stages with large $\Delta v$ and a hard
length limit, and nowhere else. The flight record:

- **IUS (Inertial Upper Stage) Orbus 6 and Orbus 21** — Kevlar-epoxy cases,
  gimballed nozzles, **extendable exit cones**. This is the flight-proven
  reference for the concept in a solid motor. conf C — the Boeing IUS
  documentation or the NASA IUS user's guide should be read before quoting
  numbers.
- **Peacekeeper (LGM-118A) stages 2 and 3** use EECs. conf B. This is the
  clearest statement of the design logic anywhere: a silo sets the stage
  length, an EEC buys roughly 10–15 s of $I_{sp}$ for a deployment mechanism,
  and on a three-stage ballistic missile 10 s on the upper stages is a large
  range or throw-weight increment.
- **Trident I C-4** is credited with an extendable nozzle as well as the
  (unrelated, and constantly confused) deployable **aerospike** — which is a
  telescoping *drag-reduction spike on the nose*, not an aerospike nozzle, and
  reportedly cuts frontal drag by about half. conf B/C. Say this out loud
  every time the word appears.
- **Cross-reference, liquid side:** the **RL10B-2** carries the largest
  carbon–carbon extendible nozzle ever flown — a NOVOLTEX/SEPCARB 3D C/C
  extension about 2.5 m long that translates into place after stage
  separation, taking the engine from $\varepsilon \approx 77$ to
  $\varepsilon \approx 285$ (Wikipedia's tables say 280; the AIAA nozzle
  paper says 77→285, and the course quotes 285/77) and buying roughly 30 s
  of $I_{sp}$ to reach 465.5 s vacuum. Same idea, same materials family,
  vastly larger area-ratio jump because there is no ablative mass penalty on a
  radiation-cooled C/C skirt and no two-phase flow to spoil the expansion.
  That contrast is the point: **the EEC is worth much more to a liquid
  hydrogen upper stage than to a metallized solid**, because the solid's
  two-phase loss eats part of the gain.

**Not every long nozzle is an EEC.** The Star 48B is sold in short- and
long-nozzle *fixed* variants (§6.3). Do not confuse "a longer nozzle was
fitted" with "the nozzle extends in flight".

### 3.8 Thrust vector control

A solid motor cannot throttle, cannot restart, and cannot differentially
throttle a cluster. Steering has to come from redirecting the one jet it has.
The side force from deflecting the whole nozzle by $\delta$ is

$$F_s = F\sin\delta \approx F\delta, \qquad
\Delta F_{axial} = -F(1-\cos\delta) \approx -\tfrac{1}{2}F\delta^2$$

> **Eq. 3.16** — variables: $F$ axial thrust [N], $\delta$ deflection [rad].
> Meaning: gimballing trades a small axial loss for a linear side force.
> Assumes the whole exhaust momentum vector rotates rigidly with the nozzle
> and the flow stays attached. Fails at large $\delta$ where the internal flow
> field is genuinely asymmetric. At $\delta=8°$ the axial loss is 1.0 %; at
> $\delta=3°$ it is 0.14 %. **Gimballing is cheap in $I_{sp}$**, which is why
> it wins whenever the mechanism can be built.

**Flexible bearing (flexseal).** [M] The dominant modern solution. The nozzle
is joined to the case through a laminated stack of alternating thin
**elastomer** pads and **metal (or composite) reinforcing shims**, formed as
concentric spherical segments about a common centre of rotation. The stack is
extremely stiff in compression — it carries the full axial pressure load of
the motor, meganewtons — and comparatively soft in shear, so it allows the
nozzle to rotate about the bearing centre.

Its actuation torque is dominated by the elastic restoring torque of the
elastomer:

$$M_{act} = k_s\,\delta + c\,\dot\delta + M_{offset}(p_c)$$

> **Eq. 3.17** — variables: $M_{act}$ actuator torque [N·m], $k_s$ bearing
> spring rate [N·m/rad], $c$ damping [N·m·s/rad], $M_{offset}$ the
> pressure-dependent offset torque arising because the bearing's centre of
> rotation and the pressure-load centroid do not coincide [N·m]. Meaning: the
> actuator fights a spring, a damper, and a pressure bias. Assumes small
> deflections and a linear elastomer. Fails at low temperature, where
> elastomer stiffness rises sharply (the same temperature-dependent-elastomer
> physics that destroyed *Challenger*, in a different component), and at high
> rates where the elastomer is visco-elastic.

Two consequences a designer must internalise. First, $k_s$ rises steeply as
the bearing gets colder, so the **actuator and its power supply are sized by
the cold day, not the nominal day** — and a submarine-stored or silo-stored
motor has a wide qualification temperature range. Second, the flexseal is a
*pressure seal* as well as a bearing; the elastomer is exposed to the cavity
environment and must be protected by a boot and by the nose-ring insulation.
The RSRM uses a flexible-bearing gimballed nozzle deflecting **±8° in pitch
and yaw**, driven by two hydraulic actuators fed by two hydrazine-fuelled
APU/hydraulic power units per booster (conf B). The P120C and the Zefiro
family use a flexible joint with **electromechanical** actuators (conf B) —
the modern replacement for hydraulics, because an EMA needs only a battery
and eliminates hydrazine servicing.

**Gimbal ring / ball-and-socket.** [H] A mechanical bearing rather than an
elastomeric one, with a separate dynamic pressure seal. Lower spring torque,
but the seal is the problem: it must slide, hot, in a particle-laden
environment, for the whole burn. Used historically and on some upper stages;
displaced by flexseals at large scale.

**Liquid injection TVC (LITVC).** [H] Inject a fluid through ports in the
divergent section to produce an oblique shock and an asymmetric wall-pressure
distribution. The side force comes mostly from the pressure field, not from
the injectant's own momentum, so it is *amplified*:

$$F_s = K_A\,\dot m_i\,u_i, \qquad K_A \approx 1.5-3$$

> **Eq. 3.18** — variables: $K_A$ amplification factor [—], $\dot m_i$
> injectant mass flow [kg/s], $u_i$ injectant velocity [m/s]. Meaning: the
> shock-induced wall pressure field does most of the work. [E] Assumes
> injection into supersonic flow at an area ratio where the shock stays inside
> the nozzle. Fails when the injection port is too far aft (shock exits the
> nozzle, amplification collapses) or too far forward (interaction with the
> throat). $K_A$ is determined by test; published values vary widely with
> injectant and geometry. `[SP-8115]`.

LITVC has no moving nozzle, no flexible joint, and no torque to fight, which
is why it was the standard in the 1960s and 70s. It costs a tank of injectant,
its plumbing, its valves, and its residuals — dead mass carried the whole
burn, whether or not you steer. Injectants were chosen for density and for
what they do in the shock: **Titan's UA120-series boosters used nitrogen
tetroxide injection**; **Minuteman used Freon on the second-stage and
third-stage systems** — Minuteman III's third stage is explicitly described in
open sources as "a fixed nozzle with a liquid injection thrust vector control
system" (conf B). Polaris A-3 and Poseidon C-3 also used Freon LITVC, having
moved on from jetavators (conf C).

**Jet vanes.** [H] Refractory vanes (graphite, or tungsten in the V-2 era)
placed in the exhaust downstream of the throat and rotated to deflect the jet.
Cheap, fast, effective at zero vehicle velocity — which is why they were used
for launch from a standstill and for tactical missiles that must turn hard
immediately. They cost **2–3 % of $I_{sp}$ continuously**, because the vanes
sit in the flow whether you are steering or not, and they erode. Jet vanes
are still the right answer for a small missile that must make a 90° turn in
the first second.

**Jetavators.** [H] The Polaris A-1/A-2 solution: a ring or collar around the
nozzle exit that is rotated *into* the flow to deflect it. A variant of the
jet-vane idea with lower baseline loss (the ring is out of the flow when
neutral) and lower authority.

**Jet tabs.** [H][M] Tabs that are normally stowed outside the flow and are
inserted into the exhaust only when side force is demanded. Essentially zero
loss when not steering, high loss and high actuation force when steering,
and very fast. Used on tactical motors and on some divert-and-attitude
systems.

| concept | side-force authority | $I_{sp}$ cost when not steering | inert mass | actuation load | typical era/use |
|---|---|---|---|---|---|
| Flexseal gimbal | high (±5–10°) | ~0 | moderate (bearing + actuators) | high torque, rises when cold | modern large solids |
| Gimbal ring | high | ~0 | moderate | moderate torque, hard seal | historical / some upper stages |
| LITVC | moderate (±3–6° equiv.) | 0, but injectant is dead mass | injectant + tanks + valves | valve force only | 1960s–70s ICBM/SLBM, Titan |
| Jet vanes | high, instant | 2–3 % | low | low | V-2, tactical, launch-from-rest |
| Jetavators | moderate | small | low | moderate | Polaris A-1/A-2 |
| Jet tabs | high when deployed | ~0 stowed | low | high when deployed | tactical, divert systems |

The historical arc for submarine-launched missiles is worth memorising
because it compresses the whole trade: **jetavators (1950s, simple, lossy) →
liquid injection (1960s, no moving nozzle, injectant mass penalty) → a single
gimballed flexseal nozzle per stage (1970s onward, efficient, but needs a
flexible joint that survives years of submarine storage)** — Trident replacing
four nozzles with one being a large inert-mass and complexity win (conf B).

---

## 4. Typical engineering ranges

Ranges are engineering bands for AP/Al/HTPB-class motors unless stated. Real
motor values carry their confidence label and their `/motor` or `/vehicle`
qualifier from the verification file.

| quantity | typical range | who sits at the extreme |
|---|---|---|
| Chamber pressure, large boosters | 4–7 MPa | RSRM ≈ 6.25 MPa nominal, peak ~6.4 MPa (conf B) |
| Chamber pressure, tactical / small motors | 7–20 MPa | short burns tolerate the erosion |
| Flame temperature, APCP | 3000–3600 K | 18–20 % Al at the top |
| Throat recovery temperature | $0.98$–$0.99\,T_c$ | Eq. 3.2 at $M=1$ |
| Throat convective flux | 3–15 MW/m² | scales as $p_c^{0.8}$ |
| Throat radiative flux (metallized) | 2–5 MW/m² | 20–45 % of total; negligible in a non-metallized motor |
| Condensed Al₂O₃ mass fraction | 0.28–0.38 | 16 % Al → 0.30; 19 % Al (HTPB 1912, P120C) → 0.36 |
| Alumina particle mass-mean diameter | 1–15 µm | grows with motor size and residence time |
| Two-phase $I_{sp}$ loss | 1–3 % (large), 3–6 % (small/short) | §5.2 |
| Submergence loss | 0.5–1.5 % $I_{sp}$ | conf C `[SP-8115]` |
| Throat erosion rate, 3D C/C | 0.02–0.10 mm/s | best-in-class inserts |
| Throat erosion rate, ablative | 0.10–0.30 mm/s | carbon-cloth phenolic |
| Throat area growth over a full booster burn | 3–10 % | §5.1 gives 8.2 % |
| Chamber-pressure decay from erosion, neutral grain | 5–15 % | amplified by $1/(1-n)$ |
| Expansion ratio, sea-level solid booster | 6–16 | RSRM 7.72 initial / 7.16 later (conf C) |
| Expansion ratio, solid upper stage | 30–70 | Star 48B 47.7 short / 54.8–70.4 long (conf C) |
| Expansion ratio, cryogenic liquid upper stage (contrast) | 80–285 | RL10B-2 77 stowed / 285 deployed |
| Cone half-angle (conical) | 15–20° | $\lambda_d$ 0.983–0.970 |
| Bell length vs 15° conical | 75–85 % | contoured, two-phase-corrected |
| Nozzle assembly mass, fraction of stage inert mass | 10–25 % | after the case, the largest inert item |
| Ablative liner thickness, large exit cone | 15–40 mm | §5.3 sizes 23 mm |
| Virgin CCP thermal diffusivity | $\sim1.3\times10^{-7}$ m²/s | $\sqrt{\alpha t}\approx6$ mm over a 250 s soak |
| Flexseal deflection | ±4 to ±10° | RSRM ±8° pitch and yaw (conf B) |
| Axial loss at full gimbal | 0.2–1.5 % | Eq. 3.16 |
| Jet-vane continuous $I_{sp}$ loss | 2–3 % | in the flow whether steering or not |
| LITVC side-force amplification $K_A$ | 1.5–3 | test-determined |
| Propellant mass fraction, monolithic composite case | 0.90–0.93 | **P120C 0.924** (CALC from 141,400/153,000 kg) |
| Propellant mass fraction, segmented steel case | 0.84–0.86 | **RSRM ≈ 0.85** (CALC) |

---

## 5. Worked examples

All three use a **generic large booster** so that nothing here is a real
motor's design data. Its parameters are chosen to be representative:

| parameter | value |
|---|---|
| Propellant | AP/Al/HTPB class, $\rho_p = 1770$ kg/m³ |
| Vieille exponent | $n = 0.35$ |
| Burn rate at 6.0 MPa | $r_b = 10.0$ mm/s, hence $a = 4.243\times10^{-5}$ m·s⁻¹·Pa⁻⁰·³⁵ |
| $c^*$ (delivered) | 1550 m/s |
| $\gamma$ (nozzle) | 1.18 |
| Flame temperature | 3400 K |
| Initial throat radius | $r_{t0} = 0.300$ m ($D_t = 0.600$ m) |
| Initial expansion ratio | $\varepsilon_0 = 16.0$, so $r_e = 1.200$ m |
| Nominal chamber pressure | 6.0 MPa |
| Web time | 120 s, action time 130 s |
| Aluminium loading | 18 % by mass |

### 5.1 Throat erosion → chamber-pressure decay over the burn

**Step 1 — fix the motor.** From Eq. 3.9, solving for $K_n$ at the design
point:

$$K_n = \frac{p_c^{\,1-n}}{a\,\rho_p\,c^*}
= \frac{(6.0\times10^6)^{0.65}}{(4.243\times10^{-5})(1770)(1550)}
= \frac{2.546\times10^{4}}{116.4} = 218.7$$

$A_{t0} = \pi(0.300)^2 = 0.28274$ m², so the neutral burning area is
$A_b = 218.7 \times 0.28274 = 61.84$ m². (Check: $\dot m = p_cA_t/c^* =
(6.0\times10^6)(0.28274)/1550 = 1094$ kg/s, and $\dot m = \rho_p A_b r_b =
1770 \times 61.84 \times 0.0100 = 1095$ kg/s. Consistent.)

**Step 2 — erode the throat.** Take a carbon-cloth-phenolic-backed insert
eroding at a constant $\dot s = 0.10$ mm/s — mid-range for an ablative throat
(§3.4 table). Over the 120 s web time:

$$r_t(120) = 0.300 + (1.0\times10^{-4})(120) = 0.3120\ \mathrm{m}$$
$$A_t(120) = \pi(0.3120)^2 = 0.30582\ \mathrm{m^2},\qquad
\frac{A_t(120)}{A_{t0}} = 1.0816$$

An **8.2 % growth in throat area** from 12 mm of radial recession — inside the
3–10 % band of §3.4, at the high end because this is an ablative throat.

**Step 3 — chamber pressure, closed form.** Eq. 3.11:

$$\frac{p_c(120)}{p_c(0)} = \left(1+\frac{(1.0\times10^{-4})(120)}{0.300}\right)^{-\frac{2}{0.65}}
= (1.040)^{-3.0769} = 0.8863$$

$$p_c(120) = 0.8863 \times 6.00\ \mathrm{MPa} = 5.32\ \mathrm{MPa}$$

An 11.4 % pressure loss from a 4.0 % radius growth: the factor of about three
promised by the linearisation ($2/(1-n) = 3.08$). The linearised estimate
$2\dot s t/((1-n)r_{t0}) = 0.123$ would have said 12.3 %, 0.9 points
pessimistic — good enough for a first pass, and conservative.

**Step 4 — thrust, mass flow, burn time.** Eq. 3.12:

$$\frac{F(120)}{F(0)} = (1.040)^{-\frac{2(0.35)}{0.65}} = (1.040)^{-1.0769} = 0.9578$$

Computing it the long way as a check, with the eroded expansion ratio:
$\varepsilon(120) = A_e/A_t(120) = 4.5239/0.30582 = 14.79$, giving
$C_{F,vac} = 1.8035$ against 1.8126 initially. Then

$$F(0) = 1.8126 \times 6.00\times10^6 \times 0.28274 = 3.075\ \mathrm{MN}$$
$$F(120) = 1.8035 \times 5.32\times10^6 \times 0.30582 = 2.933\ \mathrm{MN}$$

a ratio of 0.9538 — the extra 0.4 % beyond Eq. 3.12 is precisely the $C_F$
loss from the shrinking expansion ratio. **The thrust falls 4.6 % while the
chamber pressure falls 11.4 %**: the growing throat gives back more than half
of the pressure loss. Mass flow tracks thrust: 1094 → 1049 kg/s, so the burn
rate has fallen from 10.00 to 9.59 mm/s and **the web takes about 2 % longer
to burn than the rigid-throat prediction**.

$I_{sp,vac} = c^*C_F/g_0$ falls from 286.5 s to 285.1 s — **1.4 s lost purely
to the expansion ratio walking down** as the throat opens.

**Step 5 — the erosion feedback.** Erosion is not really constant; from Eq.
3.8, $\dot s = \dot s_0(p_c/p_{c0})^{0.8}$. Integrating the coupled system
numerically (0.01 s steps) gives a total recession of **11.45 mm** instead of
12.00 mm, and $p_c(120)/p_c(0) = 0.891$ instead of 0.886. The feedback is
stabilising and worth about 5 % of the recession. [J] Use the closed form for
sizing and the numerical integration for the delivered-performance
prediction; do not use the numerical result to justify cutting margin, because
$\dot s_0$ itself is known to no better than ±30 %.

**Sanity check.** A neutral-grain motor whose measured $p_c$ trace sags 10–12 %
over a two-minute burn is completely normal for an ablative throat, and the
sag is the standard field diagnostic for throat erosion. The RSRM's trace, by
contrast, is dominated by deliberate grain shaping (11-point star forward
segment, double-truncated-cone aft segments) designed to hold the thrust
inside the max-Q box, and its erosion contribution is buried inside that.
When you see a solid trace, ask which effect you are looking at.

### 5.2 Two-phase flow loss for an 18 % aluminium propellant

**Step 1 — condensed-phase mass fraction.** All the aluminium ends as Al₂O₃
(assume complete combustion, which for a well-designed motor is good to a
percent or two):

$$X = Y_{Al}\frac{M_{Al_2O_3}}{2M_{Al}} = 0.18 \times \frac{101.96}{2(26.98)}
= 0.18 \times 1.8896 = 0.340$$

> **34 % of the exhaust mass is liquid alumina.** This is the number that
> makes solid nozzle design different, and it is worth restating: a third of
> the mass flowing through the nozzle cannot expand, cannot do $p\,dV$ work,
> and only accelerates by being dragged.

**Step 2 — velocity relaxation time.** Take a mass-mean droplet
$d_p = 5$ µm, $\rho_{p} = 3000$ kg/m³ (molten alumina), gas viscosity
$\mu = 8.5\times10^{-5}$ Pa·s:

$$\tau_{v,Stokes} = \frac{\rho_p d_p^2}{18\mu}
= \frac{3000\,(5\times10^{-6})^2}{18(8.5\times10^{-5})} = 4.90\times10^{-5}\ \mathrm{s}$$

**Step 3 — the flow time.** Throat-to-exit length $L = 1.6$ m, gas velocity
1050 m/s at the throat rising to 2600 m/s at the exit, mean 1825 m/s:

$$t_{res} = \frac{1.6}{1825} = 8.77\times10^{-4}\ \mathrm{s},\qquad
\frac{du_g}{dt} \approx \frac{2600-1050}{8.77\times10^{-4}} = 1.77\times10^{6}\ \mathrm{m/s^2}$$

**Step 4 — the lag, with a drag correction.** For a particle in a gas whose
velocity is ramping, the quasi-steady lag is $\Delta u = \tau_v\,du_g/dt$.
Using the Stokes $\tau_v$ gives $\Delta u = 86.7$ m/s, but then the particle
Reynolds number is

$$\mathrm{Re}_p = \frac{\rho_g \Delta u\,d_p}{\mu}
= \frac{2.5(86.7)(5\times10^{-6})}{8.5\times10^{-5}} = 12.7$$

which is far outside Stokes' range. Apply the standard Schiller–Naumann
correction $C_D/C_{D,Stokes} = 1+0.15\,\mathrm{Re}_p^{0.687}$, i.e.
$\tau_v = \tau_{v,Stokes}/(1+0.15\mathrm{Re}_p^{0.687})$, and iterate:

| iteration | $\Delta u$ (m/s) | $\mathrm{Re}_p$ | correction factor | $\tau_v$ (s) |
|---|---|---|---|---|
| 0 | 86.7 | 12.7 | 1.86 | $4.90\times10^{-5}$ |
| 1 | 46.5 | 6.85 | 1.56 | $2.63\times10^{-5}$ |
| 2 | 55.5 | 8.16 | 1.63 | $3.14\times10^{-5}$ |
| … | … | … | … | … |
| converged | **53.5** | 7.87 | 1.62 | $3.03\times10^{-5}$ |

So the particles exit **53.5 m/s slower than the gas**, a lag fraction
$\Delta u/u_e = 2.06$ %.

**Step 5 — the velocity-lag impulse loss.** The condensed fraction carries its
mass at $u_e - \Delta u$ instead of $u_e$:

$$\frac{\Delta I_{sp}}{I_{sp}}\bigg|_{vel} = X\frac{\Delta u}{u_e}
= 0.340 \times 0.0206 = 0.70\ \%$$

**Step 6 — the thermal-lag loss.** The particles also leave hotter than the
gas, i.e. they carry away enthalpy that was never converted to kinetic
energy. With a conduction-limited Nusselt number of 2, particle specific heat
$c_s = 1300$ J/(kg·K) and gas conductivity $k_g = 0.35$ W/(m·K):

$$\tau_T = \frac{\rho_p d_p^2 c_s}{12 k_g}
= \frac{3000(5\times10^{-6})^2(1300)}{12(0.35)} = 2.32\times10^{-5}\ \mathrm{s}$$

With the gas cooling from 3400 K to about 1900 K over $t_{res}$,
$\Delta T = \tau_T\,dT_g/dt = 39.7$ K of thermal lag. The withheld energy per
unit mixture mass is $X c_s \Delta T = 1.76\times10^{4}$ J/kg against an
available $u_e^2/2 = 3.38\times10^{6}$ J/kg, i.e. 0.52 % of the energy. Since
$I_{sp}\propto\sqrt{E}$, the impulse loss is half of that:

$$\frac{\Delta I_{sp}}{I_{sp}}\bigg|_{therm} \approx 0.26\ \%$$

**Step 7 — total.**

$$\frac{\Delta I_{sp}}{I_{sp}}\bigg|_{2\phi} \approx 0.70 + 0.26 = \mathbf{0.96\ \%}$$

**Step 8 — sensitivity, which is the real lesson.** Repeating with the same
nozzle:

| $d_p$ (µm) | velocity lag (m/s) | velocity loss | thermal loss | total |
|---|---|---|---|---|
| 2 | 12.4 | 0.16 % | 0.04 % | **0.20 %** |
| 5 | 53.5 | 0.70 % | 0.26 % | **0.96 %** |
| 10 | 125 | 1.63 % | 1.04 % | **2.67 %** |
| 15 | 189 | 2.47 % | 2.34 % | **4.81 %** |

and for a **short** nozzle ($L=0.4$ m, e.g. a submerged upper-stage design)
at $d_p = 5$ µm the total rises to **3.04 %**. The scaling is close to
$d_p^2$ (both relaxation times go as $d_p^2$) and inversely with nozzle
length. [A] The model degrades badly above ~10 µm because the quasi-steady
lag assumption ($\Delta u \ll u$) is breaking down; treat the 15 µm row as an
indication that you need a real two-phase code, not as an answer.

**Sanity check.** Published two-phase losses for large metallized solids are
1–3 % of $I_{sp}$ `[SB]`, with small motors worse. The 5 µm base case lands
at 0.96 %, at the optimistic edge, and the 10 µm case at 2.7 %, mid-band.
Both are credible. What the table really shows is that **the alumina particle
size distribution — a combustion-chamber property, not a nozzle property —
is one of the largest single uncertainties in predicted solid-motor $I_{sp}$**,
and it is why delivered $I_{sp}$ of a new solid is not predicted to better
than about 1 % before the first static fire.

### 5.3 Ablative liner thickness for the exit cone

Size the carbon-cloth phenolic liner at a station in the **forward exit cone**
($\varepsilon\approx3$) of the generic booster. Design inputs:

| input | value | source |
|---|---|---|
| Recession rate at this station | $\dot s = 0.06$ mm/s | §3.4 table, CCP forward cone |
| Action time | $t_a = 130$ s | motor definition |
| Recession margin factor | $f_r = 1.5$ | [J] policy: covers ±30 % model error plus lot variation |
| Post-burn soak time | 120 s | to peak bond-line temperature |
| Virgin CCP diffusivity | $\alpha = 1.3\times10^{-7}$ m²/s | material data |
| Char-front temperature | $T_s = 800$ K | pyrolysis onset |
| Bond-line limit | $T_{bond} = 450$ K | adhesive capability |
| Initial temperature | $T_i = 300$ K | — |
| Structural/bond allowance | 2 mm | [J] handling, machining, bond-line control |

**Step 1 — recession allowance.**

$$t_{rec} = f_r\,\dot s\,t_a = 1.5 \times (6.0\times10^{-5}) \times 130
= 1.17\times10^{-2}\ \mathrm{m} = 11.7\ \mathrm{mm}$$

**Step 2 — insulating thickness that must survive underneath.** This is the
thickness of *unconsumed* material needed to keep the bond line below its
limit at the end of the soak. Use Eq. 3.6 with the char front held at 800 K,
$t = 130 + 120 = 250$ s (conservatively treating the surface as being at
pyrolysis temperature for the whole time):

$$\frac{T_{bond}-T_i}{T_s-T_i} = \frac{450-300}{800-300} = 0.300
= \mathrm{erfc}\!\left(\frac{\delta_{th}}{2\sqrt{\alpha t}}\right)$$

Inverting, $\mathrm{erfc}(\eta) = 0.300 \Rightarrow \eta = 0.733$. With
$\sqrt{\alpha t} = \sqrt{(1.3\times10^{-7})(250)} = 5.70\times10^{-3}$ m,

$$\delta_{th} = 2\eta\sqrt{\alpha t} = 2(0.733)(5.70\times10^{-3})
= 8.36\times10^{-3}\ \mathrm{m} = 8.4\ \mathrm{mm}$$

**Step 3 — stack up.**

$$t_{liner} = t_{rec} + \delta_{th} + t_{struct}
= 11.7 + 8.4 + 2.0 = 22.1\ \mathrm{mm} \;\Rightarrow\; \textbf{specify 23 mm}$$

**Step 4 — what it weighs, because that is the design driver.** Take the cone
as a frustum from $r_t = 0.300$ m to $r_e = 1.200$ m over an axial length of
2.70 m (a contoured cone at about 80 % of the 15° conical length). Slant
length $= \sqrt{2.70^2 + 0.90^2} = 2.846$ m; wetted area
$= \pi(r_t+r_e)\times$ slant $= \pi(1.500)(2.846) = 13.41$ m². At a CCP
density of 1450 kg/m³:

$$m_{liner} = 13.41 \times 0.023 \times 1450 = 447\ \mathrm{kg}$$

**Step 5 — read the sensitivity, and this is the point of the example.** The
recession term is 53 % of the thickness and it is *linear* in the margin
factor. Dropping $f_r$ from 1.5 to 1.2 saves 2.3 mm — **45 kg**. Raising it
to 2.0 costs 3.9 mm — **76 kg**. [J] On a stage with $\lambda_m = 0.92$,
76 kg of unnecessary liner is roughly 76 kg of payload you did not launch.
That is why every large solid programme runs subscale erosion motors: the
margin factor is bought with test data, and each 0.1 you can defensibly
remove is worth tens of kilograms per motor for the life of the programme.

**Sanity check.** 23 mm of ablative in a forward exit cone and a few hundred
kilograms of liner on a booster-class nozzle are the right orders of
magnitude; large solid nozzle assemblies are 10–25 % of stage inert mass, and
$447/11{,}200 = 4$ % of a P120C-class inert mass for this one component of one
nozzle is consistent with that. Note also that $\delta_{th}$ (8.4 mm) is
almost as large as the recession allowance: **the liner is not "mostly
sacrificial with a bit of insulation left over"; it is roughly half and half.**
Students who size a liner from recession alone under-thickness it by a factor
of about two.

---

## 6. Real engines: why did they design it that way?

### 6.1 RSRM (Space Shuttle Redesigned Solid Rocket Motor) — historical

**The choice.** A **submerged, flexible-bearing gimballed nozzle**, lined with
**carbon-phenolic and silica-phenolic ablatives** on a steel/composite shell,
$\varepsilon = 7.72$ (7.16 on later motors, conf C), deflecting **±8° in
pitch and yaw** on two hydraulic actuators fed by two hydrazine APU/HPUs per
booster (conf B). Motor: $p_c \approx 6.25$ MPa (906.8 psi) nominal, peak
~6.4 MPa; thrust ≈ 12.5 MN (2,800,000 lbf) `/motor` at liftoff, ≈ 14.7 MN
(3,300,000 lbf) `/motor` `max` at about t+20 s, both sea level; $I_{sp}$ 242 s
SL / 268 s vac; action time ≈ 123–124 s (all conf B, `[NASA-SRB]` and
secondaries).

**What that implies about the nozzle.** From $F = C_F p_c A_t$ with
$\gamma=1.18$ and $\varepsilon=7.72$, $C_{F,SL} = 1.594$, so the liftoff
figure implies $A_t \approx 1.25$ m² ($D_t \approx 1.26$ m) and the max-thrust
figure at 6.4 MPa implies $A_t \approx 1.44$ m² ($D_t \approx 1.35$ m). [CALC]
Those bracket the real throat and the growth between them is roughly what
erosion plus the pressure history would produce — but be careful, this is an
inference from two published points with different qualifiers, not a
measurement. The exit diameter at $\varepsilon = 7.72$ is about 3.5 m.

**A discrepancy worth naming.** The published 242 s SL / 268 s vac pair
implies a vacuum-to-sea-level $I_{sp}$ ratio of 1.107, whereas
one-dimensional $C_F$ at $\varepsilon=7.72$ and 6.25 MPa gives 1.079. The
published pair is not self-consistent with a single ideal $\varepsilon$; the
$\varepsilon$ figure is conf **C**, the $I_{sp}$ pair conf **B**, and the two
were probably quoted at different reference conditions (delivered vs
theoretical, different $p_c$, different nozzle revision). The lesson is the
one this course keeps repeating: **do not build a chain of inferences on a
conf-C number.**

**Alternatives available in the late 1970s.** LITVC (Titan was flying it), a
mechanical gimbal ring, or fixed nozzles with vehicle-level control from the
SSMEs alone. LITVC was rejected because a 12 MN motor needs enormous injectant
flow and the tankage is dead mass on a reusable booster; the gimbal ring loses
on the dynamic seal at 1.3 m throat diameter; fixed nozzles cannot control a
stack whose thrust is dominated by the SRBs. The flexseal was the only
architecture that gave ±8° with essentially no $I_{sp}$ penalty.

**Would a modern engineer choose the same?** [J] Yes on the flexseal —
everything large still uses one. No on the actuation: an electromechanical
actuator with a battery replaces a hydrazine APU and removes a hazardous
servicing operation, which is exactly what P120C and the Zefiro family did.
And no on the ablative-heavy architecture at the throat if the budget allows
a large 3D C/C insert, which erodes 2–5× more slowly and would have made the
motor's $p_c$ trace flatter.

### 6.2 P120C (Vega-C first stage, Ariane 6 strap-on) — modern

**The choice.** Carbon-phenolic nozzle with a **flexseal joint** and
**electromechanical TVC**, on a **monolithic carbon-fibre filament-wound
case** (conf C on the nozzle details, B on the case and TVC). Propellant HTPB
1912 — 19 % Al, 69 % AP, 12 % HTPB. Thrust ≈ 4,780 kN `/motor` `max` vacuum;
$I_{sp}\approx280$ s; 141,400 kg propellant in a 153,000 kg stage, i.e.
**$\lambda_m = 0.924$** (conf B/CALC).

**Why it matters here.** Two things. First, that mass fraction against RSRM's
0.85 is the strongest argument in Part III for monolithic composite
construction — and it puts direct pressure on the nozzle, because at
$\lambda_m = 0.924$ the *entire* inert budget is 11,200 kg and a nozzle
assembly at 10–25 % of it is 1,100–2,800 kg. There is no room for a lazy
ablative margin. Second, the 19 % aluminium loading is at the top of the
normal band: it buys density-impulse and it *suppresses* thermochemical
throat erosion by scavenging H₂O and CO₂ (§3.4), at the price of a condensed
fraction $X = 0.36$ and correspondingly larger two-phase losses. That is the
aluminium trade being made in a real modern motor, in the direction that
favours the nozzle.

**Alternatives.** A segmented steel case with a heavier, more forgiving
nozzle (the Ariane 5 EAP heritage), or a hydraulic flexseal. Europropulsion
chose monolithic winding and EMAs because the motor is built and cast in one
piece at Kourou and Colleferro and never needs rail transport — the constraint
that forced segmentation on the Shuttle SRB does not exist here.

### 6.3 Star 48B, short nozzle vs long nozzle — the cleanest teaching case in the course

Same motor, same propellant, same case, two nozzles:

| variant | $\varepsilon$ | $I_{sp}$ vac |
|---|---|---|
| short nozzle | ≈ 47.7 | **286.2 s** |
| long nozzle | 54.8–70.4 (sources differ) | **292.2 s** |

(conf C; `[JM-LV]`, `[EA]`, `[WP]`. Thrust ≈ 66.0–66.4 kN vac, burn ≈ 87 s,
propellant 2,009–2,011 kg, titanium case, fixed carbon-phenolic nozzle.)

**Why two nozzles existed.** The short-nozzle variant was built to fit inside
the Shuttle PAM-D cradle. The length available in the payload bay cradle, not
any propulsion consideration, set the expansion ratio and cost 6 s of
specific impulse. **$I_{sp}$ is a property of the motor *and its nozzle*, not
of the propellant** — this is the pair to quote whenever someone asks "what
is the $I_{sp}$ of that motor?" without naming the nozzle.

**Now check the numbers, because they discipline the sources.** With
$\gamma=1.18$, the ideal vacuum thrust coefficients are

| $\varepsilon$ | $C_{F,vac}$ | $\Delta I_{sp}$ from the $\varepsilon=47.7$ baseline |
|---|---|---|
| 47.7 | 1.9218 | — |
| 54.8 | 1.9335 | +1.8 s |
| 70.4 | 1.9538 | +4.8 s |

The published gain is 6.0 s. **An expansion ratio of 54.8 cannot produce it** —
ideal one-dimensional flow gives less than 2 s, and real effects (two-phase
loss, divergence) only make the gain smaller, not larger. An expansion ratio
of 70.4 gets to 4.8 s and is credible once you allow for the long nozzle also
having a better contour and a lower divergence loss. [J] So the internal
arithmetic favours the 70.4 figure and casts doubt on 54.8; the verification
file records both because both appear in the literature, and this is how you
adjudicate between them without a primary source. The implied $c^*$ from the
short nozzle, $286.2 \times 9.80665/1.9218 = 1460$ m/s, is a bit low for a
delivered HTPB/AP/Al $c^*$, which is itself a hint that the real $C_F$ is
below ideal — as two-phase loss says it must be.

### 6.4 Peacekeeper stages 2 and 3, and the IUS — extendable exit cones

**The choice.** Peacekeeper's second and third stages use **extendable exit
cones** on Kevlar/epoxy filament-wound cases (conf B). The IUS Orbus 6 and
Orbus 21 motors use EECs with gimballed nozzles on Kevlar-epoxy cases (conf
C — the Boeing/NASA IUS documentation is the primary that should be read).

**The constraint that produced it.** A silo fixes the missile length; a
Shuttle payload bay fixes the IUS length. In both cases the nozzle wanted to
be longer than the vehicle could be. An EEC decouples the two: stow at
$\varepsilon_1$, fly at $\varepsilon_2$, pay for a one-shot deployment
mechanism. The quoted payoff for the Peacekeeper stages is roughly 10–15 s of
$I_{sp}$ (conf B on the architecture, [J] on the magnitude), which on the
upper stages of a three-stage missile is a substantial range or throw-weight
increment.

**Alternatives at the time.** Accept a low $\varepsilon$ (lose the $I_{sp}$),
lengthen the silo (impossible), or shorten the propellant grain to make room
(lose more than you gain). The EEC was the only option that did not spend
propellant.

**Would a modern engineer choose the same?** [J] For a length-limited
high-$\Delta v$ stage, yes — and the modern version is better, because
carbon–carbon has replaced the ablative and metallic skirts of the 1970s. The
**RL10B-2** is the demonstration: a 3D NOVOLTEX/SEPCARB carbon–carbon
extension about 2.5 m long, radiation-cooled, taking the engine from
$\varepsilon\approx77$ stowed to $\varepsilon\approx285$ deployed (Wikipedia
tables say 280; the AIAA/SEP nozzle literature says 77→285 — quote 285/77),
worth about 30 s and delivering 465.5 s vacuum, the highest of any flown
chemical engine. Note what a *solid* cannot copy: the C/C skirt is
radiation-cooled, which works because a LOX/LH₂ exhaust is a transparent,
particle-free gas. Run a metallized solid exhaust through the same skirt and
you have alumina impingement and a radiation environment that will not let the
skirt cool. **This is the deepest reason solids do not chase RL10B-2 area
ratios.**

### 6.5 Minuteman and the Titan boosters — liquid-injection TVC

**The choice.** Minuteman's second and third stages steer by **liquid
injection** (Freon injectant on Minuteman II/III-era hardware); Minuteman
III's third stage is described in open sources as "a fixed nozzle with a
liquid injection thrust vector control system" (conf B). The Titan UA120-series
boosters used **N₂O₄ injection** into the nozzle (conf B/C — the UA120 numbers
in the verification file are marked NEEDS PRIMARY and are not quoted here).
Minuteman's *first* stage uses four gimballed nozzles (conf B).

**Why, in 1960?** A flexible bearing that can survive a decade of alert
storage and then work on the first try did not exist. LITVC has no moving
nozzle, no hot dynamic seal, no bearing to creep, and its only moving parts
are valves that can be checked out on the ground. For a missile that must sit
untouched for years and then work once, that reliability argument beats an
$I_{sp}$ argument. The cost — injectant, tank, valves, plumbing, dead mass
carried through the whole burn — was acceptable in an era when the alternative
was a mechanism nobody trusted.

**Also worth knowing:** Minuteman's third stage carries **thrust-termination
ports** — shaped charges that blow ports in the forward dome, collapsing
chamber pressure to end thrust and set final velocity (conf B). This is the
architectural answer to "can a solid be shut down?": yes, once, violently,
destructively, and only if you designed the ports in from the start.

**Would a modern engineer choose the same?** [J] No. Trident's move to a
**single gimballed nozzle per stage** with an elastomeric flexible joint,
qualified for submarine storage, is the demonstration that the reliability
argument for LITVC expired once flexseal technology matured — and the single
nozzle is a large inert-mass and complexity win over four (conf B). LITVC
survives today only in niches where a fixed nozzle is mandatory for other
reasons.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The trade-offs, stated as they are actually argued

| decision | pulls one way | pulls the other | usual resolution |
|---|---|---|---|
| Chamber pressure | higher $p_c$ → higher $C_F$ at fixed $\varepsilon$, smaller motor, better $\lambda_m$ | erosion $\propto p_c^{0.8}$, heat flux $\propto p_c^{0.8}$, case mass $\propto p_c$ | 4–7 MPa for long-burning boosters, up to 15–20 MPa for short tactical burns |
| Aluminium loading | more Al → higher $c^*$ and density impulse; scavenges H₂O/CO₂ so **less** thermochemical erosion | more condensed phase → larger two-phase loss, more impingement erosion, more slag | 16–19 %; P120C at 19 % is at the erosion-favouring end |
| Throat material | C/C erodes 2–5× less, flatter $p_c$ trace, less margin needed | C/C costs 5–20× an ablative throat and has a long lead time and supplier risk | C/C for launch vehicles and long burns; ablative for cheap or short motors |
| Expansion ratio | higher $\varepsilon$ → higher $C_F$ | ablative mass, two-phase loss, base-area and separation limits | 6–16 sea level, 30–70 solid upper stage |
| Submerged vs external | packaging, $\eta_V$, $\lambda_m$ | 0.5–1.5 % $I_{sp}$ submergence loss, slag trap, harsher cavity thermal environment | submerged for anything length-limited, i.e. almost everything large |
| Ablative margin factor | high $f_r$ → confidence | every 0.1 of $f_r$ is tens of kg on a booster | buy the margin down with subscale erosion tests |
| TVC concept | see §3.8 table | | flexseal + EMA for new large motors |

### 7.2 Failure modes

**Throat insert thermal-shock crack.** *Mechanism:* the ignition transient
imposes >2000 K across a few millimetres in tens of milliseconds; hoop
stress exceeds the material's tensile strength. *Symptom:* a $p_c$ trace with
a discontinuity or a step change in slope early in the burn; in the worst case
hot gas behind the insert. *Evidence:* post-fire radial cracks in the recovered
insert, and erosion patterns that are not axisymmetric. *Fix:* material with a
better $\sigma k/(E\alpha_{th})$ figure of merit (C/C over bulk graphite),
lower ignition pressurisation rate, segmented insert with compliant joints,
pre-heat.

**Ply lift in an ablative liner.** *Mechanism:* pyrolysis gas pressure inside
the char cannot vent through the plies, delaminates them, and levers a ply
edge into the flow. *Symptom:* a local burn-through or a step in recession
rate; a shingled appearance post-fire. *Evidence:* the raised plies
themselves; cross-sections showing gas voids at ply interfaces. *Fix:* change
the tape-wrap angle for the local pressure gradient, control cure pressure and
volatile content, add vent paths, avoid a ply orientation parallel to the
local pressure gradient.

**Pocketing / localized particle erosion.** *Mechanism:* alumina droplets with
$\mathrm{Stk}\gtrsim1$ impinging where the flow turns hardest — the submerged
nose ring and the throat entrance. *Symptom:* asymmetric, streaked or
gouged wear that no thermochemical model reproduces; on a spinning motor it is
circumferentially modulated. *Evidence:* directional scouring aligned with
the incoming particle trajectories, alumina deposits nearby. *Fix:* thicker
carbon-cloth-phenolic or C/C nose ring, geometry changes to soften the turn,
reduce spin, reconsider the aluminium loading.

**Excess throat erosion → under-pressure.** *Mechanism:* an insert that
erodes faster than predicted, whether from material lot variation, porosity,
a supplier change, or a mispredicted $\chi_{ox}$. *Symptom:* chamber pressure
below the predicted band from early in the burn and diverging, with the thrust
deficit smaller than the pressure deficit (Eq. 3.12), and an extended burn
time. *Evidence:* post-fire throat measurement; in flight, the pressure and
acceleration traces. *Fix:* qualify the insert material lot-by-lot; treat a
throat-insert supplier change as a **major** change requiring requalification.
**This is the Vega-C VV22 failure mode** (Zefiro 40, December 2022 — nozzle
throat insert erosion attributed to an insert-material supplier change, conf C
on the attribution; vehicle lost). It is the single best modern illustration
that the nozzle throat is a flight-critical part and its supply chain is part
of the design.

**Flexseal cold stiffening / actuator saturation.** *Mechanism:* elastomer
modulus rises at low temperature, raising $k_s$ in Eq. 3.17 above the
actuator's capability. *Symptom:* TVC rate limiting, phase lag, control-loop
instability, or simple failure to reach commanded deflection. *Evidence:*
actuator current/pressure at saturation in the telemetry; cold-soak bench
tests. *Fix:* size the actuator on the cold-day spring rate, control the
motor's pre-launch temperature, choose an elastomer with a lower glass
transition.

**Slag accumulation and ejection.** *Mechanism:* alumina collects in the
submerged cavity and is periodically ejected. *Symptom:* thrust and pressure
spikes, unpredictable tail-off, mass-fraction bookkeeping errors.
*Evidence:* high-frequency pressure data, post-flight mass reconciliation,
recovered slag. *Fix:* cavity geometry that does not retain liquid,
acceleration-environment-aware design, aluminium loading and particle-size
management.

### 7.3 Materials — why these, in one line each

- **3D/4D carbon–carbon at the throat:** the only material family that is
  both dimensionally stable and slow-eroding above 3000 K, with no
  delamination plane for the flow to find.
- **Bulk graphite (ATJ class) for entrance rings and cheap throats:** cheap,
  machinable, strength rises with temperature; loses on porosity and thermal
  shock.
- **Carbon-cloth phenolic where the flux is high and the part is
  sacrificial:** highest char yield of the practical ablators, and the
  pyrolysis-gas blowing does half the work.
- **Silica- and glass-cloth phenolic downstream:** lower conductivity per unit
  mass and much cheaper; silica melts above ~1900 K so it stays out of the
  throat.
- **Steel or composite structural shell:** carries the aft pressure closure
  load and the actuator reactions; the liners carry no structural load.
- **Elastomer/shim laminate in the flexseal:** stiff in compression to carry
  meganewtons, soft in shear to allow ±8°, and it is the only part of the
  nozzle whose properties are strongly temperature-dependent in the *flight*
  temperature range rather than the *combustion* range.

### 7.4 Manufacturing, and what it limits

Ablative liners are **tape-wrapped**: resin-impregnated cloth tape is wound
onto a mandrel at a controlled angle, then **debulked and cured under
pressure**, usually in an autoclave or hydroclave, then machined to the flow
contour. Three things this process limits:

1. **The ply angle is a per-station design variable** and the machine must be
   programmed for it; a continuously varying angle is possible but expensive.
2. **Volatile content and cure pressure set the porosity**, and porosity sets
   both the ply-lift susceptibility and the effective conductivity. This is
   why cure-cycle deviations are treated as major nonconformances.
3. **The final contour is machined**, so the as-built throat diameter is a
   measured quantity with a tolerance — and since $p_c \propto A_t^{-1/(1-n)}$
   (Eq. 3.9), a ±0.5 % throat-diameter tolerance is ±1.5 % on chamber
   pressure. **Throat diameter is the tightest dimensional tolerance in the
   motor**, and it is measured and recorded for every unit.

Carbon–carbon inserts are made by weaving a dry preform (2D/3D/4D) and then
densifying by repeated resin/pitch impregnation-and-pyrolysis cycles or by
CVI, over weeks to months. The long lead time and the small supplier base are
programme risks, not just cost items — see VV22.

### 7.5 Testing — what is measured and what a bad result looks like

| measurement | instrument | what "wrong" looks like |
|---|---|---|
| Head-end chamber pressure | flush-mounted or stand-off pressure transducer | a trace that sags more than the grain design predicts → throat erosion; a step → insert cracking |
| Thrust | load cell on the thrust stand | thrust deficit smaller than the pressure deficit — the Eq. 3.12 signature confirming erosion rather than a propellant problem |
| Pre- and post-fire throat diameter | CMM or bore gauge, the single most valuable measurement in a solid static fire | $\Delta A_t$ directly gives the time-averaged $\dot s$; compare against the model |
| Liner thickness, pre- and post-fire | ultrasonic thickness gauge / sectioning | char depth and remaining virgin thickness; if virgin thickness is zero anywhere, the design failed even if nothing burned through |
| Bond-line temperature | thermocouples embedded at the liner/shell interface | exceeding the adhesive limit at any station |
| Nozzle deflection and actuator load | position transducers, actuator pressure/current | torque above prediction → cold elastomer or a binding boot |
| Plume | high-speed video, radiometry | asymmetric or flaring plume → local erosion or ply lift |

[J] The single number to take from a solid static fire, if you are only
allowed one, is the **post-fire throat area**. It calibrates the erosion
model, which calibrates the $p_c$ prediction, which calibrates everything
else.

---

## 8. Misconceptions and what engineers actually care about

**"The throat melts."** No. At 3400 K nothing available melts and survives;
carbon does not melt at these pressures. The throat is *gasified* by
reaction with H₂O and CO₂ (Eq. 3.7) and *scoured* mechanically. Calling it
melting hides the fact that the rate is set by transport of oxidising species,
which is what makes $\dot s \propto p_c^{0.8}$ and what makes aluminium
loading matter.

**"More aluminium is always worse for the nozzle."** More aluminium means more
alumina, more impingement, more slag and larger two-phase losses — but it also
*reduces* thermochemical erosion by scavenging the H₂O and CO₂ that eat
carbon. Which effect dominates depends on the motor. Do not assert either
direction without knowing the exhaust composition.

**"Throat erosion loses you thrust in proportion."** It does not. Pressure
falls as $(1+\dot s t/r_{t0})^{-2/(1-n)}$ but the throat is simultaneously
getting bigger, so thrust falls only as $(1+\dot s t/r_{t0})^{-2n/(1-n)}$ —
in §5.1, 11.4 % of pressure but only 4.6 % of thrust. Total impulse is nearly
conserved; it is the *shape* of the trace, and the peak loads it drives, that
you lose.

**"Solid motors use low expansion ratios because solids are low-performance."**
No. Sea-level boosters use low $\varepsilon$ because of ambient pressure, base
geometry, ablative mass and two-phase loss. Solid *upper* stages use
$\varepsilon = 30$–70 routinely (Star 48B at 47.7–70.4), and with an EEC they
go higher.

**"An extendable exit cone is just a longer nozzle."** An EEC is a deployment
mechanism in series with the mission, stowed during the highest-load phase and
translated into place in flight. The Star 48B long nozzle is a *fixed* longer
nozzle and is not an EEC. Confusing the two makes the reliability argument
disappear, and reliability is the entire objection to EECs.

**"The Trident aerospike is an aerospike nozzle."** It is a telescoping
drag-reduction spike deployed from the *nose* of the missile, reportedly
halving frontal drag. It has nothing to do with nozzles. This confusion is
annual and universal.

**"Ablative liners are sized by how much burns away."** Roughly half the
thickness of a well-designed liner is there to stop heat reaching the bond
line *after* the burn (§5.3: 11.7 mm recession, 8.4 mm insulation). Size on
recession alone and you under-thickness by nearly a factor of two, and the
failure appears during the post-burn soak, not during the burn.

**"A flexseal is a bearing, so it is a mechanism problem."** It is an
elastomer problem. Its spring rate — the thing that sizes your actuators and
your power supply — is a strong function of temperature, and the qualification
temperature range of a stored motor is wide. Sizing on the nominal day is the
classic error.

### What engineers in this area actually spend their day on

1. **The erosion prediction and its margin.** Almost everything else follows
   from $\dot s$: liner thickness, insert selection, the $p_c$ trace, the
   delivered impulse. Most of the effort goes into justifying a margin factor
   with subscale test data because each 0.1 of $f_r$ is tens of kilograms.
2. **Throat area, as-built and as-eroded.** The tightest tolerance in the
   motor, the most valuable post-fire measurement, and the input to which
   chamber pressure is most sensitive ($1/(1-n)$ amplification).
3. **Mass.** The nozzle is the second-largest inert item after the case. Every
   design review is partly an argument about whether a millimetre of liner can
   come off.
4. **Materials qualification and supply chain.** A throat-insert supplier
   change is a flight-critical change (VV22). Lead times for 3D/4D C/C are
   months. This is a real engineering activity, not procurement paperwork.
5. **TVC actuation loads across the qualification temperature range.** Cold
   spring rate sizes the actuator, the battery or the hydraulic supply, and
   therefore a chunk of stage inert mass.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can explain in plain language why a solid
nozzle is ablative or heat-sink rather than regeneratively cooled; name
carbon–carbon, bulk graphite and carbon-cloth phenolic and say roughly where
each goes; state that the throat erodes and that erosion lowers chamber
pressure; describe what "submerged" and "flexseal" mean; and name two motors
that use each (e.g. RSRM and P120C for submerged flexseal nozzles, Minuteman
and Titan for LITVC).

**Level 2 — Working engineering knowledge.** You can compute the throat heat
flux from Bartz and add a radiation term; derive Eq. 3.10 from Eq. 3.9 and use
Eq. 3.11 and 3.12 to predict the $p_c$ and thrust histories of an eroding
neutral-grain motor; compute the condensed-phase fraction from the aluminium
loading and estimate a two-phase loss from particle size and nozzle length;
size an ablative liner from a recession rate, an action time, a margin policy
and a bond-line criterion; quote the ranges in §4 from memory; and read a
static-fire $p_c$ and thrust trace and say whether the deviation is erosion,
grain design, or something else.

**Level 3 — Interview mastery.** Given an unfamiliar motor — a stated
propellant, chamber pressure, burn time, packaging constraint and mission —
you can propose a nozzle architecture (submerged or not, insert material,
liner materials and thicknesses, $\varepsilon$, TVC concept), justify each
choice against the alternatives available, identify which single measurement
would most reduce your uncertainty, and name the historical programme that
faced the same constraint and what it did. Given a failure description you can
distinguish thermochemical erosion, particle impingement, ply lift, thermal
shock and a TVC actuation problem from the trace and the post-fire hardware,
and say what you would change.

---

## 10. Problems

### Conceptual

**C1.** A colleague proposes regeneratively cooling a solid motor's throat by
routing a small bleed of gas from the head end through channels in the nozzle
and dumping it overboard. Give two independent physical reasons this cannot
work as a cooling scheme, and one condition under which a related idea (a
sacrificial internal mass flow) does work.

**C2.** Explain why the radiative heat flux is a much larger fraction of the
total in a metallized solid motor than in a LOX/LH₂ engine, and identify the
region of a solid nozzle where the radiative fraction is largest.

**C3.** Both principal throat-erosion reactions (Eq. 3.7) are strongly
endothermic. Does that make erosion self-limiting, self-accelerating, or
neither? Argue carefully, and say what the endothermicity does to the surface
temperature and hence to the assumption of diffusion control.

**C4.** Why is the pressure exponent $n$ of the propellant a *nozzle*
designer's concern? Give the quantitative statement.

**C5.** A 3D carbon–carbon throat insert costs roughly ten times a
carbon-cloth-phenolic one and has a six-month lead time. Give three distinct
technical arguments for buying it anyway, and one programme circumstance in
which the ablative is genuinely the better engineering choice.

**C6.** Explain the difference between a fixed long nozzle and an extendable
exit cone in terms of what is being traded, and say why the reliability
argument applies to one and not the other.

**C7.** Why does a submerged nozzle collect slag, and name three separate ways
that slag degrades the motor.

**C8.** Two nozzles have the same area ratio, the same propellant and the same
chamber pressure. One is 1.6 m long from throat to exit, the other 0.6 m.
Which delivers higher $I_{sp}$, and why is the answer *not* simply "the
shorter one, because less friction"?

### Calculation

Use the generic booster of §5 unless told otherwise: $n=0.35$,
$\rho_p = 1770$ kg/m³, $c^* = 1550$ m/s, $\gamma = 1.18$,
$a = 4.243\times10^{-5}$ m·s⁻¹·Pa⁻⁰·³⁵.

**N1.** A neutral-grain motor has $r_{t0} = 0.150$ m and burns for 90 s with a
constant throat recession rate of 0.15 mm/s. Compute the throat area growth,
the ratio $p_c(90)/p_c(0)$, and the ratio $F(90)/F(0)$ at constant $C_F$.
Then state how much of the pressure loss the thrust "gets back", as a
percentage of the pressure loss.

**N2.** For the same motor, what constant recession rate would hold the
chamber-pressure decay to no more than 5 % over the 90 s burn? Express your
answer in mm/s and as a total radial recession in mm, and say which material
class from §3.4 you would therefore have to specify.

**N3.** A propellant contains 20 % aluminium by mass. Compute the condensed
Al₂O₃ mass fraction $X$ in the exhaust. Then, using the §5.2 method with
$d_p = 8$ µm, $\rho_p = 3000$ kg/m³, $\mu = 8.5\times10^{-5}$ Pa·s,
$\rho_g = 2.5$ kg/m³, a throat-to-exit length of 1.2 m, $u_t = 1050$ m/s and
$u_e = 2600$ m/s, estimate the velocity-lag contribution to the $I_{sp}$ loss.
State clearly whether the Stokes drag law is valid and what you did about it.

**N4.** Size a silica-cloth-phenolic liner for an aft-exit-cone station with
$\dot s = 0.12$ mm/s, action time 95 s, margin factor 1.4, post-burn soak
90 s, $\alpha = 2.0\times10^{-7}$ m²/s, char-front temperature 900 K,
bond-line limit 420 K, initial temperature 290 K, and a 2 mm structural
allowance. Report the three components of the stack-up and the specified
thickness rounded up to the next millimetre.

**N5.** Using Bartz (Eq. 3.3) with $D_t = 0.25$ m, $\mu_0 = 8.5\times10^{-5}$
Pa·s, $c_{p0} = 1900$ J/(kg·K), $\mathrm{Pr}_0 = 0.50$, $c^* = 1550$ m/s,
$r_c = 0.19$ m, $\sigma = 1.03$, compute the throat convective flux at
$p_c = 6.0$ MPa and at $p_c = 12.0$ MPa against a 2800 K wall with
$T_c = 3400$ K. Add the radiative term with $\epsilon_r = 0.5$. By what factor
does the *total* flux increase when the pressure doubles, and why is it not
$2^{0.8}$?

**N6.** A motor's published vacuum $I_{sp}$ is 292.2 s at $\varepsilon = 70.4$.
Compute the ideal vacuum $C_F$ at that area ratio for $\gamma = 1.18$, deduce
the implied delivered $c^*$, and comment on whether it is plausible for an
AP/Al/HTPB propellant. What does the comparison tell you about the combined
two-phase, divergence and boundary-layer losses?

**N7.** A flexseal has a spring rate of $2.4\times10^{5}$ N·m/rad at +25 °C,
rising to $4.1\times10^{5}$ N·m/rad at −20 °C. One actuator drives each axis
and can supply $6.0\times10^{4}$ N·m about the bearing centre. Compute the
maximum achievable deflection in degrees at each temperature, neglecting
damping and offset torque, and state whether a ±8° requirement is met at both.
If it is not, give two ways to fix it that do not involve a bigger actuator.

**N8.** From the engine data: RSRM $p_c \approx 6.25$ MPa, $\varepsilon = 7.72$
(conf C), sea-level thrust at liftoff ≈ 12.5 MN `/motor`. Using $\gamma=1.18$,
compute $C_{F,SL}$, the implied throat area and diameter, and the exit
diameter. Then state, in one sentence each, two reasons your answer should not
be quoted as "the RSRM throat diameter".

### Engineering reasoning

**R1.** A static fire of a motor with a nominally neutral grain produces a
chamber-pressure trace that falls smoothly by 14 % from $t=5$ s to burnout at
$t=110$ s, while the thrust trace falls by only 5 % over the same interval,
and the burn lasts 4 s longer than predicted. Post-fire, the throat insert is
intact with no cracks. Diagnose. Give the quantity you would compute from the
pre- and post-fire hardware to confirm your diagnosis, and predict its value.

**R2.** A second static fire of the same design, from a different insert lot,
shows the same average pressure sag but with a visible step down at $t=2$ s
and a rougher trace thereafter. Post-fire, the insert has a single radial
crack. What changed, what is the mechanism, and what is the fix? Explain why
this failure is more dangerous than the one in R1 even though the average
pressures are similar.

**R3.** Two candidate propellants for the same motor have identical $c^*$ and
density. Propellant A has 16 % Al and $n=0.30$; propellant B has 20 % Al and
$n=0.45$. The nozzle has an ablative throat. Argue both sides and recommend
one, addressing erosion rate, erosion-to-pressure amplification, and two-phase
loss.

**R4.** You are shown a post-fire submerged nozzle. The throat is uniformly
eroded to within measurement error, but the nose ring shows deep gouging
concentrated on one side, and there is a 40 kg deposit of solidified alumina
in the aft cavity. The motor flew on a spin-stabilised stage. Explain the
pattern, say which of the three erosion mechanisms is responsible for which
feature, and give two design changes.

**R5.** A programme proposes replacing the ablative throat of an existing
qualified motor with a 3D carbon–carbon insert to recover performance, keeping
everything else identical. List the second-order consequences on the motor's
delivered performance and on the vehicle, at least four of them, and say which
one is most likely to force a redesign elsewhere.

### Mini trade study

**T1.** You are designing the nozzle for a **third stage** of a
length-limited, ground-launched, all-solid vehicle. Constraints: vacuum
operation only; stage length available for the nozzle aft of the aft dome is
**0.55 m**; motor $p_c = 5.5$ MPa; burn time 65 s; propellant AP/Al/HTPB with
18 % Al; stage propellant mass 3,000 kg; stage inert mass target 240 kg of
which the nozzle assembly may take at most 55 kg; the vehicle must be storable
at −30 °C to +50 °C for five years; and the stage must provide ±5° of thrust
vector control.

Four options are on the table:

- **(a)** Fixed contoured nozzle, $\varepsilon = 30$, ablative throat and
  liner, jet vanes for TVC.
- **(b)** Fixed contoured nozzle, $\varepsilon = 30$, 3D C/C throat insert,
  flexseal + electromechanical TVC.
- **(c)** Extendable exit cone, $\varepsilon = 25$ stowed → 60 deployed, 3D C/C
  throat insert, flexseal + EMA TVC.
- **(d)** Fixed contoured nozzle, $\varepsilon = 45$, C/C throat, LITVC.

Recommend one. Your answer must include: an estimate of the $I_{sp}$
difference between the area ratios using $\gamma = 1.18$; an argument about
whether the geometry of each option actually fits in 0.55 m; the effect of the
five-year storage and the −30 °C limit on each TVC concept; a statement of
what you would measure or test first to retire the largest uncertainty in your
recommendation; and an explicit statement of what would change your mind.

---

## 11. Quiz (100 points)

**Q1 (8 pts).** In a solid rocket motor, throat erosion of 2 % in *radius*
over the burn, with a neutral grain and $n = 0.40$, produces approximately
what change in chamber pressure?
(a) −2 % (b) −4 % (c) −6.6 % (d) −13 %

**Q2 (8 pts).** Which statement about thermochemical throat erosion is
correct?
(a) It is oxidation of carbon by O₂ in the exhaust.
(b) It is diffusion-limited above ~2500 K, so it scales roughly as
$p_c^{0.8}$.
(c) It is kinetics-limited at all rocket conditions, so it scales as
$\exp(-E_a/RT)$ only.
(d) It is independent of aluminium loading.

**Q3 (10 pts).** A propellant contains 16.0 % aluminium by mass. Compute the
condensed Al₂O₃ mass fraction in the exhaust, showing the molar arithmetic.

**Q4 (8 pts).** Rank these throat materials by expected recession rate at
6 MPa in an AP/Al/HTPB exhaust, lowest first: bulk ATJ graphite, 3D
carbon–carbon, carbon-cloth phenolic. Then state the property of the
lowest-erosion material that makes it so.

**Q5 (12 pts).** A neutral-grain motor with $n = 0.35$ and $r_{t0} = 0.20$ m
runs for 100 s with $\dot s = 0.08$ mm/s. Compute (i) $p_c(100)/p_c(0)$ and
(ii) $F(100)/F(0)$ at constant $C_F$. Show the exponents you used.

**Q6 (8 pts).** Which is *not* a reason a sea-level solid booster uses a low
expansion ratio?
(a) Flow separation at sea level.
(b) Ablative liner mass grows with wetted area.
(c) Two-phase losses grow with area ratio.
(d) Solid propellants have a low $\gamma$, which limits the achievable area
ratio.

**Q7 (12 pts).** An ablative liner station has $\dot s = 0.10$ mm/s, action
time 100 s, margin factor 1.5, and requires 7 mm of remaining virgin material
plus a 2 mm structural allowance. A design review proposes cutting the margin
factor to 1.2 on the strength of new subscale data. Compute both thicknesses,
the percentage of liner mass saved at this station, and state in one sentence
what the reviewer must have shown to justify it.

**Q8 (10 pts).** Match each TVC concept to the motor and give the single
biggest penalty of each: flexseal gimbal; liquid injection; jet vanes.
Motors: RSRM; Minuteman III third stage; V-2 (as the archetype).

**Q9 (12 pts).** A solid upper-stage motor is offered with two fixed nozzles,
$\varepsilon = 45$ and $\varepsilon = 68$, and the manufacturer claims a 7.5 s
$I_{sp}$ improvement for the larger. Using $\gamma = 1.18$ and ideal
one-dimensional flow, compute the $C_F$ ratio and the implied $I_{sp}$ gain
from a 288 s baseline. Is the claim plausible? What would make the real gain
smaller than ideal, and what could legitimately make it larger?

**Q10 (12 pts).** You are handed two static-fire records of the same motor
design. Motor A: pressure sag 12 %, thrust sag 4 %, burn time 3 % long, insert
intact. Motor B: pressure sag 12 %, thrust sag 12 %, burn time nominal,
insert intact. Both were nominally neutral grains. Explain what is happening
in each, and state which one you are more worried about and why.

---

## 12. Further reading

- `[SP-8115]` NASA SP-8115, *Solid Rocket Motor Nozzles* (NASA space vehicle
  design criteria, chemical propulsion). The single most important document
  for this module: materials, erosion, submergence losses, contour selection
  and TVC, written as design criteria rather than as a survey.
- `[SP-8039]` NASA SP-8039, *Solid Rocket Motor Performance Analysis and
  Prediction*. Read it for the loss accounting — how two-phase, divergence,
  boundary-layer, submergence and erosion losses are individually estimated
  and combined into a delivered-$I_{sp}$ prediction. This is where the
  §5.2 estimate belongs in a real programme.
- `[SB §15]` Sutton & Biblarz, *Rocket Propulsion Elements*, 9th ed., solid
  motor chapters. Read for the nozzle-materials tables, the two-phase loss
  discussion, and the TVC survey with photographs of real hardware.
- `[Kubota]` Kubota, *Propellants and Explosives*. Read for the combustion
  chemistry behind $\chi_{ox}$ — what the exhaust of an AP/Al/HTPB propellant
  actually contains as a function of loading, which is the input to Eq. 3.8.
- `[Davenas]` Davenas, *Solid Rocket Propulsion Technology*. The European
  counterpart to Sutton on solids; read it for nozzle and insulation practice
  in the Ariane/Vega lineage, which is the heritage behind P120C.
- `[Bartz57]` Bartz (1957). The original heat-transfer correlation; read the
  assumptions, because a metallized two-phase boundary layer violates several
  of them and you should know which.
- `[Rao58]` Rao (1958), optimum thrust nozzle contours. Read it to understand
  what the Rao contour optimises, and therefore why a two-phase flow needs a
  different contour.
- ESA/Arianespace independent enquiry commission material on **Vega-C VV22**
  (December 2022). Read the primary release for the Zefiro 40 nozzle-insert
  findings; this module treats the supplier-change attribution as conf C until
  that is done.
- `[NASA-SRB]` NASA Space Shuttle SRB reference material. Read for the RSRM
  nozzle architecture, the flexible bearing, and the ±8° TVC description.
- `[SP-125]` Huzel & Huang / NASA SP-125 (liquid engines). Read the nozzle and
  heat-transfer chapters *for contrast*: the same gas dynamics with an
  entirely different thermal-protection philosophy makes both clearer.
