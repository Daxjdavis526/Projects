# Module 17 — Manufacturing
Part II · Prerequisites: modules 11, 12, 16 · Estimated time: 8 h

There is a moment in every engine programme when the analysis is finished, the
drawings are released, and the shop tells you the part cannot be made. Not "will
be expensive" — cannot be made, because the 1.2 mm cutter needed to reach the
throat channels breaks before it finishes one pass, or because the braze alloy
will not wet a joint with 0.15 mm of clearance, or because the 0.89 m tall
printed liner does not fit in the machine you have a contract for. Everything
you decided in modules 06 through 16 — the channel aspect ratio, the liner
alloy, the number of injector elements, the wall thickness at the throat — was
a manufacturing decision that you made while pretending it was a thermal or a
structural one. This module is the correction. It is the chapter where the
geometry you drew meets the physics of removing, melting, joining and
depositing metal, and where you learn which of your design freedoms were real.
Engineers who skip it design engines that exist only in CAD; the F-1's
combustion instability programme cost 2,000 tests, but the F-1's *tube* problem
cost Rocketdyne just as much schedule and almost nobody writes about it.

---

## 1. Learning objectives

By the end of this module you should be able to:

1. For a stated cooling-channel or tube-wall requirement, work out how many
   tubes or channels the throat circumference will accept, what section each
   must have to pass the coolant, and identify the station at which the geometry
   forces a bifurcation or a change of cooling method.
2. Explain the physical mechanism of furnace brazing — capillary rise, wetting,
   isothermal solidification — and state why joint clearance, not filler
   strength, governs braze quality.
3. Describe the electrodeposition mechanism behind an electroformed nickel
   closeout, and name the three ways it fails (adhesion, nodules, residual
   stress).
4. Predict the effect of as-built additive surface roughness on cooling-channel
   friction factor, pressure drop and heat-transfer coefficient, using a
   roughness-corrected friction correlation and a Nusselt–friction analogy, and
   state the uncertainty in that prediction.
5. Estimate the build time, part mass and powder inventory for a laser
   powder-bed-fusion combustion chamber from layer thickness, hatch spacing,
   scan speed, laser count and part volume, and identify whether the build is
   recoat-limited or exposure-limited.
6. Propagate an orifice diameter and discharge-coefficient tolerance stack into
   an element-level mixture-ratio spread and an engine-level mixture-ratio
   error, and explain why the two answers differ by $\sqrt{N}$ and which one
   burns a wall.
7. Name the defect each process introduces (recast layer, forging lap, casting
   porosity, braze void, solidification crack, lack-of-fusion, keyhole porosity)
   and the inspection method that finds it.
8. Argue where additive manufacturing genuinely changed rocket-engine design,
   and where it did not and will not.
9. Read a production-rate requirement (one engine a year versus one a day) and
   say what it does to process selection, tolerance policy and inspection plan.
10. Given an unfamiliar engine component, propose a manufacturing route, state
    its dominant defect, and specify the acceptance inspection.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Arithmetic mean roughness | $R_a$ | m | mean absolute deviation of a surface profile from its mean line |
| Equivalent sand-grain roughness | $k_s$ | m | roughness height that reproduces the measured friction factor in the Nikuradse/Colebrook framework |
| Relative roughness | $k_s/D_h$ | — | roughness height normalised by hydraulic diameter |
| Hydraulic diameter | $D_h$ | m | $4A/P$ for a duct of area $A$ and wetted perimeter $P$ |
| Darcy friction factor | $f$ | — | $\Delta p = f (L/D_h)\rho V^2/2$; four times the Fanning factor |
| Nusselt number | $\mathrm{Nu}$ | — | $hD_h/k$; dimensionless convective coefficient |
| Prandtl number | $\mathrm{Pr}$ | — | $\mu c_p/k$; momentum-to-thermal diffusivity ratio |
| Layer thickness | $t_\ell$ | m | powder-bed increment deposited per recoat in a PBF build |
| Hatch spacing | $h_s$ | m | lateral offset between adjacent laser scan vectors |
| Scan speed | $v_s$ | m/s | laser spot traverse speed |
| Volumetric energy density | $E_v$ | J/m³ | $P_\ell/(v_s h_s t_\ell)$; the first-order PBF process parameter |
| Laser power | $P_\ell$ | W | beam power delivered to the powder bed |
| Deposition rate | $\dot V$ | m³/s | $t_\ell h_s v_s$ per laser; theoretical laser-on build rate |
| Recoat time | $t_r$ | s | time to spread one powder layer and reposition |
| Overhang angle | $\theta_o$ | ° | angle of a downward-facing surface from the build plate |
| Braze joint clearance | $\delta$ | m | gap between the two faying surfaces at brazing temperature |
| Filler liquidus | $T_L$ | K | temperature at which the braze filler is fully molten |
| Current density | $j$ | A/m² | electroforming deposition current per unit cathode area |
| Faraday constant | $F$ | C/mol | 96 485 C/mol |
| Throwing power | — | — | ability of a plating bath to deposit uniformly into recesses |
| Heat-affected zone | HAZ | — | weld-adjacent region altered by thermal cycle without melting |
| Laves phase | — | — | Nb-rich brittle intermetallic that segregates in solidifying alloy 718 |
| Hot isostatic pressing | HIP | — | simultaneous high temperature and isostatic gas pressure to close internal porosity |
| Directed energy deposition | DED | — | AM class in which feedstock is melted as it is delivered to the melt pool |
| Laser powder bed fusion | L-PBF | — | AM class in which a laser fuses a pre-spread powder layer |
| Electrical discharge machining | EDM | — | material removal by controlled spark erosion in a dielectric |
| Recast layer | — | m | resolidified melt film left on an EDM'd or laser-drilled surface |
| Discharge coefficient | $C_d$ | — | actual over ideal orifice mass flow (module 07) |
| Mixture ratio | $MR$ | — | oxidizer-to-fuel mass flow ratio |
| Relative standard uncertainty | $\sigma_x/x$ | — | standard deviation normalised by the nominal value |
| Number of injection elements | $N$ | — | count of injector elements on the face |
| Coolant mass flow | $\dot m_f$ | kg/s | mass flow through the regenerative circuit |

---

## 3. Theory

### 3.1 Manufacturing is a design variable, not a downstream activity

Every propulsion component is the intersection of three constraint sets: the
thermodynamic one (what the cycle needs), the structural one (what the material
will carry), and the *process* one (what can actually be produced at the
required rate, cost and confidence). Textbooks treat the third as a footnote.
Programmes do not: the RS-68 was explicitly a "design for minimum cost"
exercise that accepted a gas-generator cycle and about **80 % fewer parts than
the RS-25** in exchange for lower performance, and it was the manufacturing
argument that won [_verify-liquid, RS-68A block] [H]. The Vulcain 2.1 nozzle
achieved **90 % fewer parts, 40 % lower cost and 30 % faster production** than
the Vulcain 2 nozzle through a laser-welded sandwich redesign with no
thermodynamic change at all [_verify-liquid, Vulcain block] [M].

The useful mental model is that each process defines a *feasible set* in the
space of geometries, and the designer's job is to place the design inside the
intersection of the feasible set and the performance requirement. Three
recurring patterns [J]:

- **A process sets a minimum feature size.** You cannot mill a 0.6 mm wide,
  6 mm deep channel with a conventional end mill: the cutter has a length-to-
  diameter ratio of 10 and will chatter, deflect or snap. That single fact
  caps the achievable channel aspect ratio, which caps the coolant-side area
  per unit wall area, which caps chamber pressure for a given liner alloy.
- **A process sets a joint count.** Every joint is a leak path and an
  inspection item. Tube-wall construction converts a cooling requirement into
  hundreds of metres of braze land (§3.5, WE1). Additive construction converts
  the same requirement into zero joints and a new set of internal defects.
- **A process sets a rate ceiling.** A furnace-brazed tube bundle is a
  multi-week operation dominated by hand fit-up. That is acceptable at five
  engines a year and impossible at five hundred.

Throughout this module, tag the claim you are making: whether a limit is
physical (melt-pool stability, capillarity), technological (today's machines),
or economic (rate and cost). The first never moves, the second moves every few
years, and the third is a management decision wearing engineering clothes.

### 3.2 Machining

#### 3.2.1 The physics of chip formation, and why it limits you

Metal cutting is localised shear. The tool edge drives a plastic shear zone
ahead of itself; the workpiece material fails in shear along a plane inclined
at the shear angle $\phi$, and the chip flows up the rake face. Nearly all of
the work goes to heat, concentrated in the primary shear zone and the tool–chip
interface. Cutting force scales with the uncut chip area and the material's
specific cutting energy; for nickel superalloys that energy is roughly three
times that of aluminium and the thermal conductivity is roughly a tenth, so
the heat stays in the tool [F].

Two consequences dominate rocket-engine machining:

**Tool deflection sets tolerance.** A slender end mill is a cantilever. Its tip
deflection under a lateral cutting force $F_c$ is

$$\delta_{tip} = \frac{F_c L^3}{3EI},\qquad I = \frac{\pi d^4}{64}$$

> **Eq. 3.1** — variables: $\delta_{tip}$ tool tip deflection (m), $F_c$ lateral
> cutting force (N), $L$ unsupported tool length (m), $E$ tool Young's modulus
> (Pa, ≈ 600 GPa for tungsten carbide), $I$ second moment of area (m⁴), $d$ tool
> diameter (m). Meaning: the cutter bends away from the cut, so the machined
> wall is thicker than programmed and tapers with depth. Assumes: a solid
> cylindrical cantilever with a point load, elastic response, rigid holder.
> Fails when: the tool is fluted (real $I$ is 60–80 % of the solid value),
> when the holder or spindle compliance dominates, or when chatter makes the
> problem dynamic rather than static.

The $d^4$ in the denominator and $L^3$ in the numerator are the whole story: a
cutter twice as long deflects eight times as much, and a cutter half as wide
deflects sixteen times as much. This is why deep, narrow cooling channels are
*hard* rather than merely tedious, and why real milled-channel liners have
channels with depth-to-width ratios of about 2:1 to 4:1 rather than the 8:1
that the thermal analysis would like [E][J].

**Heat sets tool life and surface integrity.** In Inconel 718 or Monel, the
tool–chip interface runs hot enough that diffusion wear and notch wear at the
depth-of-cut line dominate. The practical countermeasure is a low surface speed
with high feed and through-tool high-pressure coolant. The surface left behind
carries residual stress: an abusive cut leaves *tensile* residual stress at the
surface, which reduces fatigue life exactly where a cooling channel needs it
most. A gently finished or shot-peened surface leaves compressive stress. This
is a real and frequently missed coupling between §3.2 and the low-cycle fatigue
life you computed in module 16 [E].

#### 3.2.2 Five-axis machining

Five-axis machining adds two rotary degrees of freedom to the three linear
ones, which buys three things: the tool can be kept normal (or at a controlled
lead/lag angle) to a curved surface, so the effective cutting geometry is
constant along a contour; shorter tools can reach into cavities, which by
Eq. 3.1 is worth more than any other single improvement; and a part can be
machined in one setup rather than four, eliminating the setup-to-setup datum
error that otherwise stacks.

For propulsion this is what makes **integrally bladed rotors** (blisks),
contoured chamber liners with milled channels, and complex manifold bodies
practical. A turbopump impeller with 3D-curved backswept blades and a shroud
is a five-axis part; the alternative is casting (§3.4) or a bladed disc with
individually inserted blades and a mechanical or brazed attachment.

The cost of a five-axis part is dominated by *cycle time*, and cycle time by
the finishing passes, which use a small stepover to hold surface finish. A
liner with 250 channels is 250 slot operations plus 250 finish passes; at even
90 s each that is over 12 hours of spindle time before any of the contour work.
This is why milled-channel chambers are typically the highest-touch-time
component of an engine after the injector [J].

#### 3.2.3 Injector orifice production: drilling and EDM

The injector is a plate with several hundred to several thousand holes in it,
each of which must have the right diameter, the right axis, the right inlet
edge condition and the right $L/D$ (module 07). Four routes:

**Twist drilling.** Cheapest, fastest, and adequate down to about 0.5 mm in
steels and nickel alloys with peck cycles and through-coolant. Diameter is held
by the drill, which wears; a production shop resharpens or replaces on a hole
count. Typical achievable diameter tolerance on a small hole in a superalloy is
of order **±0.013 to ±0.025 mm (±0.0005 to ±0.001 in)** including drill wear
across a lot [E][J]. The exit burr must be removed, and the inlet edge — which
controls $C_d$ and the onset of hydraulic flip (module 07) — is whatever the
drill left unless it is separately controlled by a chamfer, a radius or an
abrasive-flow pass.

**Gun drilling.** For deep holes ($L/D > 10$), a single-flute drill with
internal coolant and an external V-pad supports itself against the hole wall.
This is how long LOX post bores and manifold cross-drillings are made. It holds
straightness far better than a twist drill but is slow.

**EDM (electrical discharge machining).** A shaped electrode and the workpiece
are separated by a dielectric; a pulsed voltage breaks down the gap and each
discharge melts and vaporises a crater of material, which the dielectric flushes
away. Material removal is thermal, not mechanical, so **there is no cutting
force at all**: hole straightness and position do not depend on tool stiffness,
and hardness of the workpiece is irrelevant. This is the enabling process for
thousands of small, deep, angled orifices in hard alloys.

The physics that matters: each spark leaves a **recast layer**, a thin film of
melted and resolidified base metal, typically 5–25 µm thick depending on pulse
energy, often micro-cracked and always different in composition and hardness
from the parent [E]. Under it is a heat-affected zone. Recast is a fatigue
initiation site and, in an orifice, it changes both the effective diameter and
the edge condition. Every serious injector specification therefore either
requires the recast to be removed (abrasive flow machining, electropolish,
chemical etch) or requires a low-energy "trim" finishing setting that reduces
the recast to a few micrometres. There is no third option; leaving a
25 µm cracked recast layer in a hydrogen-wetted orifice is how you generate a
crack in a component you never expected to crack [J].

Fast-hole EDM (a rotating tubular electrode with pressurised dielectric through
its centre) is the production route for the very large hole counts. For
non-conductive or very fine work, laser drilling is used, with the same recast
issue and worse taper.

#### 3.2.4 What the tolerance does to the engine

An injector orifice's mass flow goes as $C_d d^2$. Differentiating,

$$\frac{\delta \dot m}{\dot m} = \frac{\delta C_d}{C_d} + 2\frac{\delta d}{d}$$

> **Eq. 3.2** — variables: $\dot m$ orifice mass flow (kg/s), $C_d$ discharge
> coefficient (—), $d$ orifice diameter (m). Meaning: a diameter error is
> doubled in the flow error, and the edge-condition error enters directly.
> Assumes: incompressible single-phase flow at fixed $\Delta p$ and $\rho$,
> $C_d$ independent of $d$ over the tolerance band. Fails when: the orifice
> cavitates or hydraulically flips (then $C_d$ jumps discontinuously), or when
> the flow is two-phase.

Two distinct consequences, and confusing them is a classic error:

- **Engine-level.** The total effective area of each circuit sets the engine
  mixture ratio. Random per-hole errors average: with $N$ nominally identical
  elements, the circuit's total-area error is smaller than the single-hole
  error by $\sqrt{N}$. WE4 works this out: a per-element $MR$ spread of 2.5 %
  becomes an engine $MR$ error of about 0.1 % across 562 elements.
- **Local.** Nothing averages the wall out. One outer-row oxidizer orifice
  4 % large, or one fuel orifice partially blocked by a burr, produces a
  local oxidizer-rich streak that will erode a copper liner in a handful of
  tests. This is why injector acceptance is a **flow bench** exercise on every
  circuit and often every element, not a statistical sample, and why the outer
  row usually carries tighter tolerance than the core [M][J].

Machining tolerance also drives throat area. $A_t$ sets $\dot m$ at fixed $p_c$
and $c^*$; a throat diameter 0.1 % large is 0.2 % more flow and, at fixed
propellant load, 0.2 % less burn time. Throats are therefore machined and
inspected to a much tighter band than the rest of the contour and are
re-measured after every hot fire, because erosion moves them (module 06 §7.5).

### 3.3 Forging

#### 3.3.1 Why forge at all

A cast structure is a network of dendrites with segregated interdendritic
regions, residual porosity and no preferred grain orientation. Forging is hot
working: the material is deformed above its recrystallisation temperature, so
that the cast dendritic structure is broken up, porosity is welded closed, and
the grains recrystallise fine and equiaxed. The result is a wrought structure
with roughly **20–50 % higher tensile ductility and dramatically better fatigue
and fracture toughness** than the same alloy as-cast, and — critically —
properties that are reproducible enough to have statistically derived design
allowables in [MMPDS] [F][E].

The second forging benefit is **grain flow**. Hot deformation elongates the
grains and the inclusion stringers along the material flow direction. A part
whose grain flow follows its principal stress path is markedly stronger in
fatigue than the same geometry machined from plate, where the flow lines are
cut through. This is why a turbopump impeller hub, a pump housing boss, or a
gimbal bearing block is forged to a near-net shape and then machined, rather
than hogged from a billet: you are buying the flow lines, not just the density.

#### 3.3.2 Propulsion applications

- **Pump housings and volutes.** Forged or cast-plus-HIP, then five-axis
  machined. A LOX pump housing carries full discharge pressure (7,000 psi class
  on the RS-25's HPFTP [_verify-liquid, RS-25 block]) and must not shed a
  particle into a LOX stream. Forged Inconel 718 or a stainless is the
  conservative answer; cast is the cheap one.
- **Impellers and inducers.** For high-tip-speed impellers, forged 718 machined
  from a forged puck is standard (never titanium in LOX — see module 16 on
  titanium's LOX incompatibility). The blade root fillet is the fatigue-critical
  feature and it wants grain flow turning the corner with it.
- **Turbine discs.** Powder-metallurgy or cast-and-wrought superalloy discs,
  forged to shape with tightly controlled strain and cooling to produce the
  desired grain size distribution — coarse in the rim for creep, fine in the
  bore for burst strength.

#### 3.3.3 Defects and inspection

The forging defects worth naming:

| defect | mechanism | detection |
|---|---|---|
| **Lap** | metal folded over on itself and not welded, because the die filled in the wrong order | macroetch of a sectioned first article; ultrasonic; magnetic particle or fluorescent penetrant after machining |
| **Burst** | internal tearing from tensile secondary stress in the centre of an under-heated or over-fast upset | ultrasonic C-scan |
| **Flow-through** | grain flow running out of the part surface instead of following the contour | macroetch on a sectioned sample; controlled by die design |
| **Abnormal grain growth** | critical strain (a few percent) plus high temperature produces a few enormous grains | metallographic sample; sonic attenuation ("noisy" UT) |
| **Segregation carried from the ingot** | freckles, white spots in vacuum-arc-remelted superalloy ingot | ultrasonic; billet macroetch; controlled by melt practice |

The standard flow is: forge, solution and age heat treat, ultrasonically inspect
the *forging* before machining (when the geometry is still simple enough to
scan), machine, then fluorescent penetrant inspect the machined surfaces. A
forging house delivers a macroetch and a certified grain-flow photograph on the
first article.

### 3.4 Casting

#### 3.4.1 Investment casting

Investment (lost-wax) casting produces near-net-shape parts with internal
passages, thin sections and surfaces that need little machining. A wax pattern
(itself injection-moulded in a metal die) is assembled onto a wax runner tree,
repeatedly dipped in ceramic slurry and stucco to build a shell, the wax is
steam-autoclaved out, the shell is fired, and metal is poured — under vacuum,
for superalloys, because the reactive elements (Al, Ti, Hf) will otherwise
oxidise.

For propulsion, investment casting produces:

- **Turbine blades and vanes.** Rocket turbines are partial-admission,
  high-pressure-ratio machines running on hot, often chemically aggressive gas
  (fuel-rich soot-laden gas, or oxygen-rich gas in an ORSC engine). The blades
  are cast because the airfoil geometry with internal cooling passages cannot be
  machined.
- **Housings, manifolds and volutes** where the geometry is complex and the
  loads are moderate.
- **Injector bodies** in some low-cost designs.

#### 3.4.2 Solidification structure: equiaxed, directional, single crystal

The grain structure follows the heat flow. Three regimes [F]:

- **Equiaxed:** ordinary casting; randomly oriented grains, transverse grain
  boundaries everywhere. Grain boundaries are the weak link in creep — they
  slide, and they are where cavities nucleate.
- **Directionally solidified (DS):** a chilled plate withdraws the shell slowly
  from the furnace so the solidification front moves axially. Columnar grains
  grow along the withdrawal direction; there are *no transverse grain
  boundaries* in the airfoil, which raises creep and thermal-fatigue life
  substantially.
- **Single crystal (SX):** a helical "pigtail" grain selector at the base of the
  mould allows only one grain to propagate. No grain boundaries at all,
  therefore no grain-boundary strengtheners needed (carbon, boron, zirconium are
  removed), which raises the incipient melting point and lets the alloy be
  solution-treated closer to it, which in turn allows a higher $\gamma'$ volume
  fraction. SX blades are the reason modern turbines run where they do.

This matters to Module 17's AM discussion: **you cannot print a single crystal**
at any useful rate. The melt-pool solidification in L-PBF produces fine
columnar-to-equiaxed grains with a strong texture but many boundaries. For any
component whose life is creep-governed at high homologous temperature, casting
still wins and will keep winning (§3.10.9) [M][J].

#### 3.4.3 Porosity and HIP

Two porosity mechanisms, with different signatures [F]:

- **Shrinkage porosity:** metal contracts on solidification (typically 3–6 % by
  volume for superalloys) and if the last liquid to freeze cannot be fed from a
  riser, it leaves interdendritic voids — irregular, dendritic-walled, usually
  clustered at thermal centres.
- **Gas porosity:** dissolved gas (hydrogen in aluminium, nitrogen or oxygen in
  steels) exceeds solubility on freezing and comes out as bubbles — round,
  smooth-walled, often distributed.

**Hot isostatic pressing** closes internal porosity by applying an isostatic
gas pressure (typically 100–200 MPa of argon) at a temperature high enough for
creep and diffusion bonding (typically 0.7–0.9 $T_m$; for nickel superalloys,
1,150–1,200 °C). The void collapses by creep of the surrounding metal and the
two closed surfaces then diffusion-bond. HIP raises fatigue life by a large
factor and reduces scatter, which is the more valuable effect [E].

Two limits you must remember. **HIP cannot close a pore connected to the
surface**, because the gas simply pressurises the pore from inside; surface-
connected porosity must be found and rejected. And HIP is a full thermal cycle:
it will coarsen precipitates and must be integrated into the heat-treat
sequence, not bolted on afterwards.

Inspection: real-time or film radiography for volumetric porosity; fluorescent
penetrant for surface-connected defects; computed tomography for anything
geometrically complex enough that a single radiographic view will not resolve
it (§3.12).

### 3.5 Brazing, and the tube-wall chamber

#### 3.5.1 The physics

Brazing joins two parts with a filler metal that melts below the solidus of the
base metals and is drawn into the joint by **capillary action**. The pressure
that drives the filler into a parallel-sided gap of clearance $\delta$ is

$$\Delta p_{cap} = \frac{2\sigma\cos\theta}{\delta}$$

> **Eq. 3.3** — variables: $\Delta p_{cap}$ capillary driving pressure (Pa),
> $\sigma$ liquid filler surface tension (N/m, ~1–1.9 N/m for molten braze
> alloys), $\theta$ contact angle of the filler on the base metal (rad; good
> wetting means $\theta \to 0$), $\delta$ joint clearance (m). Meaning: the
> narrower the gap, the harder the filler is pulled in. Assumes: parallel
> surfaces, clean and wettable, filler fully molten and free of oxide skin.
> Fails when: $\theta > 90°$ (no wetting: the filler balls up and does not enter
> at all), when the gap is so small that viscous resistance stalls the flow, or
> when the joint is not vented and trapped gas blocks the fill.

Two competing effects therefore set an **optimum joint clearance**, and it is
narrow. Too wide and the capillary pressure is insufficient, the filler runs out
under gravity, and the joint is filler-dominated — meaning it has the (low)
strength of the filler alloy rather than the (high) strength of a thin,
constrained, diffusion-modified layer. Too tight and viscous drag and oxide
films stop the flow, leaving voids. For most nickel and silver fillers on
superalloys the practical window is roughly **0.025–0.125 mm (0.001–0.005 in)
at brazing temperature** — which is a statement about differential thermal
expansion between two dissimilar parts, not about the room-temperature fit-up
[E]. Getting a tube bundle to hold that clearance at 1,200 K is the whole
engineering problem.

A joint is stronger than the bulk filler because it is thin: the constrained
layer cannot deform plastically in the transverse direction, so it is under
triaxial constraint and its effective yield strength is raised. Some fillers
(nickel-based, boron- or silicon-depressed) also **isothermally solidify**: the
melting point depressant (B, Si) diffuses into the base metal during a hold at
temperature, raising the filler's remaining liquidus until it freezes *at
temperature*. The joint's remelt temperature then ends up far above the brazing
temperature, which is the only way to braze a joint that will later see
1,000 K service.

#### 3.5.2 Filler families used in engines

| family | typical service | notes |
|---|---|---|
| **Silver-based (Ag–Cu–Zn, Ag–Cu–Pd)** | moderate temperature, copper and stainless | low braze temperature, easy, but limited high-temperature strength; zinc is volatile in vacuum furnaces |
| **Gold-based (Au–Ni, Au–Cu, Au–Pd–Ni)** | high-reliability joints on superalloys, including hydrogen service | excellent wetting and ductility, very low erosion of the base metal, no melting-point depressant to embrittle — and eye-watering cost. Used where a joint absolutely must not leak |
| **Nickel-based (Ni–Cr–B–Si, AMS 4777 class)** | hot-section structural joints, tube-to-tube and tube-to-jacket | high strength and temperature capability via isothermal solidification; the B and Si can erode thin base metal and form brittle borides if the hold is wrong |
| **Copper** | steel assemblies | cheap, high flow, common in general engineering; less used in engines |

The choice is a three-way trade among service temperature, base-metal erosion
(a 0.3 mm tube wall does not tolerate much dissolution), and cost. Gold-nickel
on a thin-wall hydrogen-wetted tube joint is not extravagance; it is the
recognition that the joint has to survive a hydrogen environment, thin sections,
and thousands of thermal cycles [J].

#### 3.5.3 Tube-wall chambers

The tube-wall thrust chamber (E. A. Neu's patent, filed 5 April 1950, out of the
Navaho programme [_verify-liquid, XLR43 block]) is the dominant American
architecture from the Atlas era through the Shuttle. The chamber and nozzle
contour are formed from a bundle of individually shaped, tapered, thin-wall
tubes laid side by side; the coolant flows inside them; adjacent tubes are
brazed to each other along their contact line and to an outer structural
jacket, which carries the hoop load. Real examples from the course database:

| engine | construction | count |
|---|---|---|
| Atlas LR-89/LR-105 | brazed thin-wall tube bundle | not published |
| **F-1** | brazed tubes, fuel-cooled, down-and-back routing, Inconel X-750/Hastelloy tubes in an Inconel jacket with steel bands | **178 tubes** |
| **J-2** | brazed tube wall, fuel-cooled | not published |
| **RL10A-3-3A** | brazed stainless-steel tube wall — *and the cooling circuit is the power cycle* | not published |
| **RS-25 nozzle** | brazed tube wall, hydrogen-cooled | **1,080 tubes** |

(All from `reference/_verify-liquid.md`.)

Why tubes at all? Because in 1955 there was no way to mill 250 channels into a
contoured liner and close them out, and because a tube is a naturally efficient
pressure vessel: the coolant pressure is carried as hoop stress in a small-radius
thin wall, so the wall can be very thin, and thin wall means low $\Delta T$
through it (module 10: $\Delta T = q t/k$) and therefore low thermal stress. The
tube-wall chamber is a genuinely elegant answer to the 1950s problem.

Its costs are joint count and geometry. WE1 works both through. The geometric
one is fundamental: the tube must follow a contour whose circumference varies by
a factor of $\sqrt{\varepsilon}$ from throat to exit — a factor of **4 at
$\varepsilon = 16$**. Either the tube gets four times wider (and, at constant
flow area, four times shallower, until it is an unbuildable ribbon), or it
**bifurcates** — splits into two tubes at a station where the circumference has
doubled — or the regenerative circuit simply stops and the rest of the nozzle is
film-cooled or radiation-cooled. The F-1 does the last of these: it dumps
turbine exhaust as a film-cooling curtain over the nozzle extension, which is
why it needs no regen circuit down there and why the plume has that dark outer
sheath [_verify-liquid, F-1 block].

#### 3.5.4 The braze-joint leak problem

This is the defining failure mode of the architecture, and it deserves to be
stated mechanically rather than as folklore.

**Mechanism.** A braze joint fails to fill over some length — because the local
clearance opened outside the capillary window, because an oxide film was not
reduced by the furnace atmosphere, because the flux or the vacuum was
inadequate, because the assembly moved during the thermal ramp, or because a
gas pocket was not vented. The result is a **void**: an unbrazed length of the
tube-to-tube land.

**Symptom.** In service, coolant at full pump discharge pressure (which can be
several hundred bar) is separated from the combustion gas by whatever remains
of a 0.3 mm tube wall at the void. Either the wall bulges and fails, venting
coolant into the chamber — a fuel leak into the combustion zone, which if it is
hydrogen you will see as a rising mixture-ratio anomaly and if it is kerosene
you will see as a fire — or, on the outboard side, coolant leaks out through the
jacket. On a hydrogen engine, the leak is invisible.

**Evidence.** Pre-test: X-ray of the brazed assembly (the filler is denser than
the base metal, so a filled joint is radiographically distinguishable from an
unfilled one), followed by a hydrostatic **proof pressure test** at typically
1.2–1.5× the maximum expected operating pressure, then a **helium mass
spectrometer leak test** to a specified leak rate. In test: coolant circuit
$\Delta p$ falling below prediction (flow bypassing through a breach), coolant
outlet temperature or flow anomalies, or a mixture-ratio shift.

**Fix.** Repair brazing of localised voids is standard practice and is itself a
qualified process. The systemic fixes are fixturing that holds clearance through
the ramp, controlled-atmosphere or vacuum furnaces, cleanliness protocol,
and — ultimately — going to milled channels or additive manufacture, which is
what everybody did.

The honest summary: tube-wall chambers work extremely well and have flown more
successful missions than any other architecture, but they are the highest-skill,
longest-lead, most inspection-intensive way to build a chamber, and every
programme that could leave them behind, did [H][J].

### 3.6 Electroforming

#### 3.6.1 The mechanism

Electroforming is electrodeposition used as a fabrication process rather than a
coating process: a metal is deposited from solution onto a conductive mandrel or
substrate until it is thick enough to be a structural member. Mass deposited
follows Faraday's law:

$$m = \frac{M\, I\, t\, \eta_c}{n F},\qquad
\text{thickness } \;s = \frac{M\, j\, t\, \eta_c}{n F \rho}$$

> **Eq. 3.4** — variables: $m$ deposited mass (kg), $M$ molar mass of the
> deposited metal (kg/mol; 0.05869 for Ni), $I$ current (A), $j$ current density
> (A/m²), $t$ time (s), $\eta_c$ cathode current efficiency (—; ~0.95–1.0 for
> nickel sulphamate), $n$ electrons per ion (2 for Ni²⁺), $F$ Faraday constant
> (96,485 C/mol), $\rho$ deposit density (kg/m³, 8,900 for Ni), $s$ thickness
> (m). Meaning: deposition rate is set by current density alone. Assumes:
> uniform current distribution, no side reactions, steady bath chemistry. Fails
> when: the current distribution is non-uniform (which it always is — see
> throwing power), when hydrogen evolution takes part of the current, or when
> mass transport of Ni²⁺ to the surface limits the rate.

For nickel sulphamate at a typical $j = 200$ A/m² (20 mA/cm²) the deposition
rate is about **0.25 mm per day**. A 2 mm structural closeout is therefore an
**eight-day tank residence**, unattended but not interruptible. That number is
the whole scheduling story of electroformed chambers.

The bath matters as much as the current. **Nickel sulphamate** is the standard
because it deposits with low internal stress — a sulphate (Watts) bath produces
a deposit with tensile residual stress high enough to curl or crack a thick
electroform. Stress is tuned with additives and monitored continuously with a
stress-measuring strip; a bath that drifts produces a deposit that will
delaminate months later.

**Throwing power** — the bath's ability to deposit uniformly into a recess — is
poor for nickel. Current concentrates at edges and protrusions (the field is
strongest there), so a nickel electroform grows preferentially at corners and
can bridge over a groove, trapping electrolyte. Thieves (auxiliary cathodes),
shields, and conforming anodes are used to flatten the current distribution.

#### 3.6.2 The RS-25 main combustion chamber

The RS-25 MCC is the canonical example and the one to know. From the course
database: the liner is **NARloy-Z** (Cu–Ag–Zr), with **390 coolant channels
machined into it**, hydrogen-cooled, and an **electroformed-nickel closeout**
[_verify-liquid, RS-25 block]. The sequence [H]:

1. Form the liner (a forged or spun copper-alloy shell), machine the contour
   inside and out.
2. **Mill the 390 channels** into the outside of the liner, following the
   contour, with a depth and width profile that varies axially to match the heat
   flux distribution — deep and narrow at the throat where the flux peaks.
3. **Fill the channels with a sacrificial filler** — conductive wax, or a
   low-melting alloy — machined or scraped flush with the lands, so that the
   outside of the liner is a continuous surface.
4. **Activate and strike** the copper surface: an acid activation and a thin
   Wood's-nickel strike to defeat the copper oxide and give the deposit
   something to key into. **This is the step that determines whether the part
   is any good.** Adhesion of nickel to copper is entirely a surface-preparation
   question.
5. **Electroform nickel** over the whole assembly to structural thickness. The
   nickel bridges the filled channels, so the deposit becomes a continuous
   jacket integral with the lands.
6. **Melt or dissolve out the filler**, flush the channels, and inspect.

The result is a chamber with no braze joints and no bolted jacket: a copper hot
wall with the highest available conductivity and a nickel structural jacket
metallurgically bonded to the lands. That is the highest-heat-flux chamber
architecture that has flown, and it is why the RS-25 could run at 206 bar.

#### 3.6.3 How it fails

**Adhesion loss.** If the copper was not properly activated, or if the strike was
contaminated, the nickel is mechanically interlocked but not bonded. Under
thermal cycling the differential expansion between copper ($\alpha \approx
17\times10^{-6}$/K) and nickel ($\approx 13\times10^{-6}$/K) shears the
interface, and the jacket separates from the lands. A separated land carries no
hoop load, so the channel opposite it bulges. Detection: ultrasonic C-scan of
the bond line, and destructive peel tests on process-control coupons run with
every part.

**Nodules and inclusions.** A particle in the bath becomes a growth centre; the
deposit grows a nodule around it, which shadows the surrounding area and
propagates upward as a defect column. Continuous filtration and periodic
"scrubbing" of the growing surface are the controls.

**Residual stress and cracking.** A high-stress deposit will crack through
thickness — sometimes not until the part is heat treated.

**Filler residue.** Wax left in a channel is a flow blockage that will not be
found on a flow bench unless the flow bench is per-channel. This is a genuine
and recurring problem in electroformed and, later, additive channels.

#### 3.6.4 The RS-25 liner cracks

The RS-25's copper liner is also the standard case study in coolant-channel
life. The hot wall between two channels is a thin ligament that, on every start,
goes from cryogenic to roughly 800 K on the gas side in under a second while its
back face is held near the hydrogen temperature. The through-thickness $\Delta T$
generates a compressive thermal stress that exceeds the copper's yield
(module 16), so the wall yields in compression when hot; on shutdown
it goes into tension. Each cycle ratchets the ligament: it thins, bulges into
the channel — the classic **"dog-house" deformation** — and eventually cracks
through, opening a coolant path into the chamber.

Overlaid on this is **blanching**: local loss of the silver and zirconium
strengtheners and a change of surface appearance in the hot-gas wall of copper
alloys exposed to the oxidising/reducing cycling of a hydrogen engine, which
reduces conductivity and strength [GRCop]. The combination is the
life-limiting mechanism of the whole architecture, and it is the reason
NASA developed the **GRCop** dispersion-strengthened Cu–Cr–Nb family: the
Cr₂Nb dispersoids resist the coarsening and blanching that degrade NARloy-Z
[GRCop]. GRCop-42 — the more printable of the family — is now the default
liner alloy for additively manufactured chambers.

Note the manufacturing point: none of this is a braze or electroform defect.
The electroformed closeout did its job. The liner cracked because of a thermal
cycle, and the fix was a *materials* change, not a *process* change. Do not
attribute every chamber failure to the joining process; ask which part actually
failed and why [J].

### 3.7 Welding

#### 3.7.1 Processes

**GTAW / TIG.** A non-consumable tungsten electrode strikes an arc under argon
or helium; filler is added separately or the joint is autogenous. Slow,
controllable, excellent for thin sections and repairs, and still the workhorse
for engine plumbing, small pressure vessels and repair welds. Heat input is
high relative to the deposited metal, so the HAZ is wide.

**Electron beam welding (EBW).** A focused electron beam in vacuum delivers
power densities of order $10^{10}$–$10^{11}$ W/m², enough to vaporise metal and
open a **keyhole** — a vapour cavity through the joint that the beam maintains
and the surrounding liquid closes behind. This gives a very deep, very narrow
weld: depth-to-width ratios of 20:1 and above, with a HAZ a fraction of a
millimetre wide. The consequences are the ones you want: minimal distortion,
minimal residual stress, minimal metallurgical damage, and single-pass welding
of thick sections. The consequences you do not want: it must be done in vacuum
(chamber size limits part size), fit-up must be near-perfect because there is
little filler to bridge a gap, and the keyhole can collapse and leave a root
void. EBW is the standard process for structural joints in nickel-alloy engine
hardware, turbine wheels and thick-section pressure boundaries.

**Laser beam welding.** Similar keyhole physics at somewhat lower power density,
no vacuum required, fibre-delivered and robot-friendly. Increasingly displaces
EBW where the section is thinner and the volume higher. It is the process behind
the Vulcain 2.1 laser-welded sandwich nozzle [_verify-liquid, Vulcain block].

**Friction stir welding (FSW).** A rotating, profiled, non-consumable tool is
plunged into the joint line and traversed. Frictional heat softens the material
to a plastic (not molten) state and the tool's shoulder and pin extrude and
forge the material from ahead of the tool to behind it. **There is no melting**,
which eliminates every solidification defect: no porosity, no hot cracking, no
solidification segregation. The nugget is a fine, dynamically recrystallised
grain structure with joint efficiencies of 70–95 % of parent in aluminium alloys
that are effectively unweldable by fusion (2xxx and 7xxx series). This is the
process that made modern launch-vehicle tankage practical: large-diameter
Al–Li barrel and dome longitudinal and circumferential welds, with distortion
and residual stress far below fusion welding and no filler wire to control.
Its limits: it needs heavy backing and rigid fixturing (the forge force is
large), it leaves an exit hole at the end of the run unless a retractable pin
tool is used, and it is essentially restricted to aluminium and other low-flow-
stress alloys in production practice.

#### 3.7.2 Weld metallurgy and why alloy 718 cracks

A fusion weld has three zones: the **fusion zone** (melted and resolidified,
with a cast structure), the **HAZ** (not melted but thermally cycled), and the
unaffected parent. Both of the first two crack, by different mechanisms [F][E]:

**Solidification (hot) cracking** happens in the fusion zone at the end of
solidification. As the weld pool freezes from the edges inward, the last liquid
is a thin, low-melting film between dendrites. Solidification shrinkage plus
thermal contraction pulls the solidifying weld apart; if the remaining liquid
cannot flow in to feed the gap, the film tears. Alloys with a wide freezing
range and strong segregation are the worst. **Alloy 718 is a textbook case**:
niobium segregates strongly to the interdendritic liquid and forms a
low-melting $\gamma$/Laves eutectic at about 1,150 °C. The Laves phase is
brittle, it is a niobium sink (which starves the matrix of the Nb it needs for
$\gamma''$ strengthening), and the eutectic film is exactly the low-melting
liquid that tears. Controls: minimise heat input and dilution (favouring EBW and
LBW over TIG), control the ingot/product-form segregation before you ever weld,
and homogenise after welding.

**Strain-age cracking** (post-weld heat-treatment cracking) is the second and
more insidious mechanism, and again 718 is the reference alloy — favourably.
On heating a welded precipitation-hardened superalloy to its ageing
temperature, two things race: the relaxation of weld residual stress by creep,
and the precipitation of the strengthening phase, which stops creep. If
precipitation wins, the residual stress cannot relax and instead cracks the
embrittled HAZ grain boundaries. Alloy 718's whole reason for existing is that
its $\gamma''$ (Ni₃Nb) precipitation is **sluggish** compared with the $\gamma'$
of Waspaloy or René 41, so stress relaxes before the alloy hardens, and 718 can
be welded and then aged without cracking. This — not its room-temperature
strength — is why 718 is the most-used structural superalloy in rocket engines
[E][M]. The corollary: if you weld 718 and then choose the wrong post-weld
thermal path, you lose the property you selected it for.

**Hydrogen effects.** In a hydrogen engine, welds and their HAZs are where
hydrogen environment embrittlement (module 16) shows up first, because they are
where residual stress and hardness are highest. Nickel-plating a hydrogen-wetted
surface, or copper-plating it, is the classical barrier (§3.11).

#### 3.7.3 Weld inspection

| method | finds | misses |
|---|---|---|
| Visual + weld profile | undercut, underfill, mismatch, obvious cracks | everything subsurface |
| Fluorescent penetrant (FPI/PT) | surface-connected cracks and porosity | subsurface defects; smeared surfaces hide indications |
| Radiography (RT) | volumetric defects: porosity, inclusions, lack of penetration | tight planar cracks normal to the beam — the most dangerous defect type |
| Ultrasonic (UT), incl. phased array | planar defects, lack of fusion, with depth information | requires access, couplant, and a technique developed on representative flaws; coarse-grained welds scatter |
| Eddy current | surface and near-surface cracks in conductive material | depth |
| **Proof pressure test** | gross structural inadequacy, in the actual load path | nothing about margin beyond the proof level |
| **Helium leak test** | leak paths down to $10^{-9}$ std cm³/s | structural adequacy |

A serious weld specification does not pick one; it specifies a sequence, with
the acceptance flaw size derived from a fracture-mechanics analysis of the part
(module 16). "Inspect to the smallest flaw the method can find" is not an
engineering requirement; "inspect to a flaw size below the critical flaw size
with a stated probability of detection" is.

### 3.8 Diffusion bonding and platelet devices

**Diffusion bonding** joins two clean, flat surfaces held in intimate contact at
high temperature and moderate pressure, for hours. Asperities creep flat, the
interface voids shrink by surface and volume diffusion, and grain boundaries
migrate across the original interface until it disappears. Done properly the
joint is *indistinguishable from parent metal* — no filler, no cast structure,
no melting-point depressant, no HAZ. Done improperly it is a plane of
unbonded voids and it will delaminate. The controls are surface cleanliness
(oxide films are the enemy; this is done in vacuum or dry hydrogen), flatness,
and the pressure–temperature–time schedule.

**Platelet construction** is what diffusion bonding enables, and it is the most
interesting manufacturing idea in classical injector design. Take a stack of
thin metal sheets (typically 0.25–0.75 mm). Photochemically etch each one with a
two-dimensional pattern of holes and slots — a process that is essentially free
per feature, since the whole sheet is etched at once from a photographic mask.
Stack the sheets in a defined order and diffusion-bond the stack into a
monolith. The two-dimensional patterns in successive layers combine into a
fully three-dimensional internal flow network: manifolds, distribution passages,
metering orifices, impingement geometry, and face-cooling passages, all
integral, with feature sizes and positional accuracy set by photolithography
rather than by drilling.

Aerojet developed and flew this extensively — Aerojet platelet injectors and
platelet-faced thrust chambers are the reference examples [H]. What it buys:

- Extremely fine, precisely located metering features that would be impossible
  to drill, including non-circular orifices and integral filtration screens.
- Transpiration-cooled or convectively-cooled injector faces with the coolant
  passages built in.
- Very high element densities, and elements whose internal geometry can vary
  smoothly across the face.

What it costs: a design that cannot be changed without re-etching the whole
sheet set; a bond area of tens of thousands of square millimetres that must be
inspected, essentially, by proof and leak test plus destructive coupons; and a
part with no repair path. It also has an important conceptual relationship to
additive manufacturing — **platelet construction is layer-wise manufacturing
implemented with photochemistry and diffusion bonding instead of a laser**, and
almost every geometric trick the AM injector community rediscovered in the 2010s
was known to the platelet community in the 1970s [J].

### 3.9 Spinning and flow forming

Large, thin, axisymmetric shells — nozzle extensions, jackets, tank domes,
liners before channel milling — are not machined from billet, because the chip-
to-part ratio would be absurd and the resulting part would have no useful grain
structure. They are formed.

**Spinning** presses a rotating blank against a mandrel with a roller, moving
the metal over the mandrel in successive passes. Wall thickness is roughly
preserved (conventional spinning) and the operation is incremental, so forming
loads are low and tooling is cheap.

**Shear forming / flow forming** deliberately thins the wall. In shear forming
the blank thickness follows the sine law:

$$t_f = t_0 \sin\alpha$$

> **Eq. 3.5** — variables: $t_f$ formed wall thickness (m), $t_0$ blank
> thickness (m), $\alpha$ the angle between the mandrel wall and the plane of
> the original blank. Meaning: in single-pass shear forming, the wall thins
> exactly as the sine of that angle, so a mandrel wall at 30° halves the wall
> thickness. Assumes: single-pass shear spinning of a flat blank over a conical
> mandrel, no circumferential strain, no thinning from the roller path itself.
> Fails when: multiple passes redistribute material, when the part is not
> conical, or when the material's formability is exceeded and it tears or
> wrinkles.

Flow forming over a cylindrical mandrel achieves the same thinning with axial
material flow and is the standard route for high-precision thin-wall cylinders
(also, notably, for solid-motor cases — see module 22). The advantages for a
nozzle shell are substantial: excellent thickness control (a few percent), a
work-hardened and axially aligned grain structure, and a surface finish good
enough to use as-formed. Intermediate stress-relief anneals are needed because
the process cold-works heavily.

The propulsion consequence: **a large thin nozzle shell is a formed part, not a
printed one**, and this is one of the clearest places where additive
manufacturing is the wrong answer (§3.10.9).

### 3.10 Additive manufacturing

This is the section that has changed most since the last generation of textbooks
and will change most again. Treat the *physics* as durable and the
*capability numbers* as perishable [GradlAM].

#### 3.10.1 Laser powder bed fusion: the physics

L-PBF (also DMLS, SLM) builds a part by repeating: spread a layer of powder of
thickness $t_\ell$ across a build plate with a recoater; scan a laser over the
cross-section of the part in that layer, melting the powder and re-melting some
of the layer below; lower the plate by $t_\ell$; repeat.

The controlling variable at first order is **volumetric energy density**:

$$E_v = \frac{P_\ell}{v_s\, h_s\, t_\ell}$$

> **Eq. 3.6** — variables: $E_v$ volumetric energy density (J/m³), $P_\ell$
> laser power (W), $v_s$ scan speed (m/s), $h_s$ hatch spacing (m), $t_\ell$
> layer thickness (m). Meaning: the energy deposited per unit volume of powder
> processed; the single most useful lumped process parameter. Assumes: constant
> absorptivity and a stable melt pool; ignores beam diameter, spot shape, scan
> strategy, preheat and gas flow, all of which matter. Fails when: comparing
> different machines or alloys — $E_v$ is not transferable, and two parameter
> sets with the same $E_v$ can give completely different microstructures.

Three defect regimes bracket the usable process window [F][E]:

- **Too little energy → lack of fusion.** The melt pool does not penetrate into
  the previous layer or does not overlap the adjacent track. The result is
  irregular, flat, often large voids with unmelted powder inside, aligned with
  the layer or hatch geometry. These are the worst defects: they are planar,
  they are crack-like, they can be large, and they are aligned with the build
  direction so they act as delamination planes.
- **Too much energy → keyholing.** The melt pool becomes a deep vapour
  depression (the same keyhole as in EBW). The keyhole is unstable; its tip
  collapses periodically and traps a spherical gas pore at the bottom of the
  melt pool. Keyhole porosity is round, small, deep, and reasonably tractable —
  HIP closes it, provided it is not surface-connected.
- **Marginal wetting → balling.** If the melt track does not wet the substrate,
  Rayleigh–Plateau instability breaks the liquid cylinder into a row of
  spheres. The next recoater pass then drags across the balls, damaging the
  layer or jamming.

Beyond these, **residual stress** is intrinsic. Each track heats and cools at
$10^5$–$10^7$ K/s. The material contracts on cooling but is constrained by the
solid beneath, so every layer ends in tension and imposes compression below.
The accumulated stress warps parts off the plate, cracks brittle alloys, and
must be relieved thermally *while the part is still bolted to the build plate*
(§3.10.8). It also means the residual-stress state of an as-built part is not a
small correction.

**Alloys.** Weldable alloys print; unweldable ones do not, and for the same
reason (solidification cracking, §3.7.2). Inconel 718 prints extremely well and
is the workhorse. Copper alloys were historically difficult — copper reflects
1,064 nm laser light and conducts heat away from the melt pool — which is why
green (515 nm) and blue lasers, and higher powers, were developed. **GRCop-42
and GRCop-84** are the propulsion-specific dispersion-strengthened Cu–Cr–Nb
liner alloys [GRCop]; GRCop-42 is the more printable and is now the default for
AM chambers [GradlAM][Gradl18]. Refractories and single-crystal superalloys do
not print usefully today.

**Powder.** Gas-atomised spherical powder, typically 15–45 µm for L-PBF, is
specified on particle size distribution, sphericity, satellite content,
flowability, apparent and tap density, and interstitial chemistry (O, N, H).
Powder is reused, sieved between builds, and its oxygen content climbs with
reuse. Powder lot control is a flight-hardware traceability item, not a shop
convenience: the qualification argument for an AM part is built on the powder
lot, the machine, the parameter set and the witness coupons together
[GradlAM].

#### 3.10.2 Overhangs, supports, and why they are the real design constraint

A layer melted over loose powder has nothing to conduct heat into and nothing to
hold it flat. Below a critical overhang angle from the horizontal — commonly
**about 45°**, alloy- and machine-dependent — a downward-facing surface must be
supported by a sacrificial lattice that anchors it and conducts heat away
[E][M]. Supports cost material, cost build time, and must be removed
mechanically afterwards, leaving witness marks.

For a rocket engine this is decisive, because **supports inside a closed
internal channel cannot be removed**. The entire art of designing a printable
regeneratively cooled chamber is arranging every internal passage so that it is
self-supporting: teardrop or diamond channel cross-sections instead of
rectangular ones (the "roof" of a rectangular channel is a 0° overhang and will
droop or collapse), channel routing that keeps the local overhang above the
critical angle, and part orientation chosen so the channels run steeply rather
than horizontally. A designer who draws rectangular channels and hands them to
a printer has not designed a printable part [J].

#### 3.10.3 Surface roughness, and why it is not a cosmetic issue

An as-built L-PBF surface is rough because it is made of partly melted powder
particles stuck to a solidified melt track. Typical as-built $R_a$ values,
which vary strongly with orientation [E][M][GradlAM]:

| surface | typical as-built $R_a$ |
|---|---|
| Upskin (upward-facing) | 5–12 µm |
| Vertical wall | 8–15 µm |
| **Downskin (downward-facing, unsupported)** | **15–40 µm** |
| Machined reference | 0.4–1.6 µm |

An internal cooling channel has all three orientations around its perimeter, and
its downskin roof is the worst of them. Since the roof is also the hot side in
many orientations, this is not a happy coincidence.

Roughness matters through the friction factor. In fully rough turbulent flow the
friction factor becomes independent of Reynolds number and depends only on
relative roughness; in the transitional regime the Colebrook equation applies:

$$\frac{1}{\sqrt{f}} = -2\log_{10}\!\left(\frac{k_s/D_h}{3.7} + \frac{2.51}{\mathrm{Re}\sqrt{f}}\right)$$

> **Eq. 3.7** — variables: $f$ Darcy friction factor (—), $k_s$ equivalent
> sand-grain roughness (m), $D_h$ hydraulic diameter (m), $\mathrm{Re}$
> Reynolds number based on $D_h$ (—). Meaning: implicit relation for turbulent
> friction in a rough pipe, spanning smooth to fully rough. Assumes: fully
> developed turbulent flow in a circular duct with uniform sand-grain
> roughness. Fails when: the flow is developing (the entrance region of a short
> channel is much of a rocket channel), when the duct is a high-aspect-ratio
> rectangle (use $D_h$ and accept a few percent error), when curvature induces
> secondary flow, or when the coolant is supercritical with strong property
> variation across the boundary layer — all of which are true in a real
> regenerative channel.

The bridge from the measured $R_a$ to the $k_s$ that Eq. 3.7 needs is the weak
link. There is no universal conversion. Published AM channel work fits ratios
in the range $k_s/R_a \approx 2$ to $10$; a working value of **$k_s \approx
5R_a$** is defensible for as-built L-PBF channels but must be tagged [E][A] and
carried with its uncertainty, because a factor of 2 in $k_s$ is roughly ±15 %
in $f$ in this regime.

Heat transfer follows friction, but not one-for-one. Roughness elements trip the
viscous sublayer and increase turbulent transport, but they also add form drag
which contributes to $f$ and *not* to heat transfer. The standard closure is a
friction analogy, e.g. Norris:

$$\frac{\mathrm{Nu}}{\mathrm{Nu}_{smooth}} = \left(\frac{f}{f_{smooth}}\right)^{n},
\qquad n = 0.68\,\mathrm{Pr}^{0.215}$$

> **Eq. 3.8** — variables: $\mathrm{Nu}$ rough-wall Nusselt number (—),
> $\mathrm{Nu}_{smooth}$ smooth-wall value from Dittus–Boelter or Gnielinski,
> $f$ friction factors as above, $\mathrm{Pr}$ Prandtl number (—). Meaning:
> heat transfer rises with roughness, but sublinearly in $f$ once form drag
> dominates. Assumes: $f/f_{smooth} \le 3$; beyond that the enhancement
> saturates. Fails when: the roughness is not sand-grain-like (AM roughness is
> irregular and partly re-entrant), and for high-aspect-ratio channels where
> only part of the perimeter is rough.

WE2 runs this for a real channel. The headline result — a factor of ~2.3 on
$f$ and hence on $\Delta p$, and a factor of ~2.4 on $h$ — is a **mixed
blessing that programmes routinely misread**: the pressure drop is a straight
cost, paid in pump power and therefore in turbine flow and cycle margin, while
the heat-transfer increase is a genuine benefit that lets the wall run cooler.
Measured AM channel data generally shows less heat-transfer enhancement than
Eq. 3.8 predicts (ratios of 1.3–1.8 are commonly reported) while showing the
full friction penalty, so the honest design position is: **take the whole
pressure-drop penalty in your budget, and take at most half the heat-transfer
credit** [J][GradlAM].

#### 3.10.4 Internal channel limits

The geometric envelope of L-PBF internal features, as of the mid-2020s
production state of the art [M] — expect these to improve:

| feature | practical limit |
|---|---|
| Minimum self-supporting internal channel | ~0.5–1.0 mm hydraulic diameter, teardrop or diamond section |
| Minimum wall between channels | ~0.4–0.6 mm, and thinner walls print but leak |
| Maximum unsupported horizontal span | a few millimetres before droop |
| Overhang angle without support | ≳ 40–45° from horizontal |
| Positional accuracy | ±0.1–0.2 mm typical, worse on long unsupported features |
| Achievable channel length | limited by powder removal, not by printing |

The last entry is the one that catches people. A 2 mm channel that snakes 900 mm
through a chamber, with bends, is easy to print and *hard to clean*. Unfused but
partly sintered powder cakes on the channel walls under the heat of adjacent
melting and does not simply pour out. Every AM chamber programme has a powder
removal procedure — vibration, tumbling, rotation on multiple axes, pressurised
gas, ultrasonic cleaning in solvent, and, as verification, a **per-channel flow
test compared against a CFD or empirical prediction** plus CT (§3.12). Residual
powder in a coolant channel is a blockage, and a blockage is a burn-through.

#### 3.10.5 Build volume

Machine build envelopes set a hard part-size limit. Production L-PBF machines in
current service span roughly 250 mm cubes at the small end to **600 mm-class**
platforms (600 × 600 × 600 mm; and cylindrical formats around 600 mm diameter by
up to ~1,000 mm tall). Multi-laser machines (4, 8, 12 lasers) exist mainly to
make these large volumes buildable in a tolerable time. A one-metre-class
envelope is the current frontier for L-PBF [M].

For a booster-class engine, that is small. WE3's chamber is 0.89 m tall and
0.42 m in diameter *to an area ratio of only 4* — the full $\varepsilon = 16$
nozzle is 0.79 m in exit diameter and would not fit at all. So a printed booster
chamber is either segmented and joined (which reintroduces joints), or split
at the process boundary: L-PBF for the high-detail chamber and throat, DED
(§3.10.6) or forming for the large nozzle. That is exactly what the industry
does.

#### 3.10.6 Directed energy deposition

In DED the feedstock is delivered to the melt pool rather than pre-spread.
Two families:

**Blown-powder laser DED.** Powder is carried in an inert gas stream through
nozzles coaxial with a laser, converging at the focal point, where the laser
maintains a melt pool on the existing surface. The head is on a robot or a
multi-axis gantry, so there is no build-envelope box: the part can be as large
as the machine's reach. Deposition rates are **one to two orders of magnitude
above L-PBF** (kilograms per hour rather than tens of grams), resolution is much
coarser (bead widths of millimetres), surfaces need machining, and internal
closed channels cannot be made directly — but *open* channels can be
closed out by depositing over a filler, which is the key trick.

**Wire-arc additive manufacturing (WAAM).** An arc process (GMAW/GTAW/plasma)
on a robot deposits weld beads. Very high deposition rate, very low feedstock
cost, very coarse resolution, and large heat input with correspondingly large
residual stress and distortion. It is the process for very large, structurally
simple parts.

**NASA's RAMPT project** is the propulsion exemplar and the one to know
[RAMPT]. Its purpose is large-scale AM of regeneratively cooled channel-wall
nozzles and chambers by blown-powder DED with composite overwrap. The pieces
that matter conceptually:

- **Scale.** DED removes the build-envelope limit, so metre-class channel-wall
  nozzles become a single part rather than a brazed tube bundle or a welded
  assembly.
- **Bimetallic deposition.** Because the powder feed is a stream, it can be
  changed *during the build*. RAMPT demonstrated depositing a **GRCop copper-
  alloy liner and then a nickel-superalloy (718-class) structural jacket in one
  continuous build**, with a graded or abrupt transition between them. This is
  the single most significant capability in the section: it replaces the
  entire electroform-or-braze closeout problem — the one that killed schedules
  from the F-1 to the RS-25 — with a change of powder hopper. There is no
  interface to inspect for adhesion because there is no bonded interface; there
  is a fusion transition.
- **Channel closeout.** Open channels machined or deposited into the liner are
  filled with a sacrificial material and deposited over, exactly as in the
  electroform sequence, but in hours instead of days.

Report the RAMPT results as what they are: **project progress snapshots from an
active technology programme, hot-fire tested at component scale, not a
qualified production process for a flight engine** [R]. The numbers in RAMPT
publications are explicitly expected to be superseded [RAMPT].

#### 3.10.7 Other AM processes worth knowing

**Electron-beam PBF (EB-PBF).** A powder bed fused by an electron beam in
vacuum, with the powder bed held at high temperature (700–1,000 °C). The high
bed temperature is the point: it nearly eliminates residual stress, so
crack-prone alloys (titanium aluminides, some superalloys) can be built without
cracking, and supports are needed mainly for heat conduction rather than
anchoring. Costs: vacuum, a lightly sintered powder cake that must be blasted
off, coarser resolution and worse surface finish than L-PBF, and charging
effects that restrict the process to conductive powders. Used for turbine
hardware, rarely for combustion devices.

**Binder jetting.** An inkjet head deposits binder onto a powder bed; the green
part is depowdered, debound and sintered, usually with 15–25 % linear shrinkage,
and often infiltrated. No melting means no residual stress and no
support structures at all, and the process is fast and cheap per part at
volume. The costs are severe for propulsion: sintering shrinkage must be
predicted and compensated to hold tolerance, sintered density and therefore
properties lag wrought material, and the resulting microstructure is a sintered
one. Binder jet has a real place in tooling, cores and non-structural hardware,
and essentially no place today in a hot, pressurised, fatigue-critical engine
component [J].

#### 3.10.8 Post-processing: the half of AM nobody photographs

An as-built AM part is not a part. The sequence for a flight chamber, in order,
with the reason for each step [M][GradlAM]:

1. **Stress relief on the build plate.** Thermal cycle to relax residual stress
   *before* cutting the part free, or it will distort as it is released. This is
   non-negotiable.
2. **Removal from the plate** — wire EDM or bandsaw.
3. **Powder removal.** Before any thermal cycle that would sinter trapped powder
   into a solid mass. Order matters: powder removal after HIP is powder removal
   from a part that now has an integral ceramic-hard plug in it.
4. **HIP.** Closes internal keyhole and lack-of-fusion porosity that is not
   surface-connected, dramatically reducing fatigue scatter. Not a cure for
   surface-connected defects, and not a cure for a lack-of-fusion plane that
   reaches the surface.
5. **Solution and age heat treatment** to develop the required microstructure —
   frequently combined with the HIP cycle to save a thermal excursion.
6. **Machining** of every sealing face, flange, interface diameter and the throat
   contour. AM does not hold interface tolerance; nobody expects it to.
7. **Internal surface finishing where reachable:** abrasive flow machining
   (a viscoelastic abrasive-laden putty extruded back and forth through the
   passage, which preferentially cuts the high spots and the restrictions),
   chemical or electrochemical polishing, or tumbling. AFM can take an
   internal channel from $R_a \approx 15$ µm to $R_a \approx 3$–6 µm, which by
   Eq. 3.7 recovers a large part of the pressure-drop penalty — at the cost of
   removing material non-uniformly (it cuts most where the velocity is highest,
   which is the *restriction* you may have wanted).
8. **NDE** (§3.12) and proof/leak test.

Steps 1–8 typically take longer in calendar time than the build itself, and the
programme that budgets only for machine hours will be late [J].

#### 3.10.9 Where AM is not the answer

State this plainly, because the enthusiasm in the field obscures it [J][M]:

- **Large thin nozzle shells.** A 3 m diameter, 1 mm wall bell is a spun or
  formed part in hours, for very little money, with better grain structure and
  better surface than any printed equivalent. Printing it would take weeks and
  cost more. DED can print a large *channel-wall* nozzle where the channels are
  the point (RAMPT), but a plain shell is a forming job.
- **Turbine blades requiring single-crystal or DS structure.** §3.4.2: the
  solidification physics of PBF cannot produce the structure. Investment casting
  wins on the merits.
- **Any part where the driver is cost at rate.** A machined-from-bar fitting
  produced 10,000 times a year on a Swiss lathe costs a few dollars. The same
  part printed costs orders of magnitude more and always will, because the
  process is inherently serial in a way that machining is not.
- **Very large primary structure.** Thrust structures, tank barrels: FSW'd
  aluminium plate remains far cheaper and lighter.
- **Anything where the qualification burden exceeds the design benefit.** If AM
  saves you two brazed joints on a part that already has a qualified braze
  process, and buys you a two-year AM qualification campaign, you have made a
  bad trade.

The correct framing is not "AM versus conventional" but "which process for which
feature". Modern engines are process-mixed by design: printed injector, printed
or milled chamber liner, DED or formed nozzle, forged pump housings, cast
turbine wheel, FSW'd tanks.

### 3.11 Coatings

Coatings solve problems that the base material cannot, at the cost of an
interface that can spall.

**Thermal barrier coatings (TBC).** A low-conductivity ceramic — typically
yttria-stabilised zirconia, 7–8 wt% Y₂O₃ — applied over a metallic bond coat,
either by air plasma spray (a lamellar, porous, more compliant structure) or by
electron-beam physical vapour deposition (a columnar structure that is far more
strain-tolerant). The physics is a thermal resistance in series:
$\Delta T = q\,t/k$ with $k \approx 1$ W/(m·K) versus ~20 for a superalloy, so
a 0.25 mm TBC over a wall carrying 5 MW/m² drops about 1,250 K across the
coating. Failure is by spallation, driven by growth of the thermally-grown oxide
at the bond coat and by the thermal expansion mismatch; the spalled area then
runs at full gas temperature. In liquid engines TBCs are used more on turbine
hardware and gas-generator/preburner components than on regeneratively cooled
chamber walls, where they interfere with the intended heat flux into the
coolant — a TBC on a regen chamber reduces the heat *into the coolant*, which
for an expander cycle is a direct loss of turbine power.

**Silicide coatings on niobium.** Refractory-metal radiation-cooled nozzle
extensions — C-103 niobium alloy, used on the Merlin Vacuum extension
[_verify-liquid, Merlin block] and on essentially every storable-propellant
apogee engine — oxidise catastrophically in air above ~700 K and would be
consumed by any oxygen-bearing exhaust. The protection is a **disilicide
diffusion coating** (the R512E fused-slurry silicide is the classic), applied as
a slurry and diffused at high temperature, forming an adherent
(Nb,Ti,Cr)Si₂ layer. It works by forming a thin, self-healing, glassy silica
scale in service. Its limits are the ones you would expect from a brittle
diffusion coating: it is damaged by handling and by impact, it has a finite life
governed by silicon depletion into the substrate, and its most dangerous failure
is **pesting** — accelerated intergranular oxidation at intermediate
temperatures (roughly 800–1,000 K) that can destroy an unprotected or
locally-damaged part quickly. Coated niobium extensions therefore have handling
and inspection requirements out of all proportion to their apparent robustness.

**Plating for hydrogen service.** Hydrogen environment embrittlement (module 16)
attacks susceptible alloys — high-strength steels, many nickel alloys — by
hydrogen ingress at the surface. A barrier layer of a low-permeability, low-
susceptibility metal blocks the ingress. **Copper and gold plating** are used on
threads, seal surfaces and hydrogen-wetted components; **nickel plating** is
used both as a barrier and as a build-up layer, and electroless nickel gives
uniform coverage in bores where a plating bath's throwing power would fail.
The coating must be pore-free — a pinhole is a local hydrogen entry point and
concentrates the problem instead of solving it — so plating for hydrogen
service is specified with thickness, porosity and adhesion acceptance, not just
thickness.

### 3.12 Non-destructive evaluation and acceptance

An inspection plan is a set of answers to one question: *for each credible
defect this process produces, what method finds it at a size below the critical
flaw size, with what probability of detection?* The methods:

| method | physics | best at | blind to |
|---|---|---|---|
| **Visual / borescope** | optics | surface condition, blockages, gross damage | anything subsurface |
| **Fluorescent penetrant (PT)** | capillary action draws dyed liquid into surface-connected defects | tight surface cracks in non-porous material | subsurface defects; useless on as-built AM surfaces, whose roughness holds penetrant everywhere and creates a solid false indication |
| **Radiography (RT)** | differential X-ray attenuation | volumetric defects: porosity, inclusions, **braze voids** (filler and base metal differ in density) | planar cracks aligned with the beam; thick or complex sections |
| **Computed tomography (CT)** | reconstructed 3D attenuation map | internal geometry of complex parts: **channel dimensions, residual powder, internal porosity, wall thickness** — the method that made AM qualifiable | resolution scales with part size; a 0.3 m diameter part gives voxel sizes of hundreds of micrometres, so small defects in large parts are still invisible |
| **Ultrasonic (UT)** | elastic wave reflection at an interface | planar defects with depth, bond-line disbonds (electroform adhesion, diffusion bonds) | requires access and couplant; scattering in coarse or textured grain structures — which includes many AM microstructures |
| **Eddy current** | induced-current perturbation | surface/near-surface cracks in conductors | depth, non-conductors |
| **Proof pressure test** | applied load | gross structural inadequacy in the real load path | margin beyond the proof level; it can also *damage* a marginal part |
| **Leak test (He mass spec)** | tracer gas transport | leak paths to $10^{-9}$ std cm³/s | structural adequacy |
| **Flow test** | measured $\dot m$ vs $\Delta p$ per circuit or per channel | blockages, wrong effective area, residual powder, wrong $C_d$ | the reason for the deviation |

Three propulsion-specific points:

**Brazes are X-rayed, then proofed, then leak-tested, in that order.** Each
finds something the others cannot, and the order matters because proof testing a
part with a known large void is how you turn an inspection finding into a
destroyed part.

**AM parts are CT-scanned, and CT is the reason AM parts can be flown.** No
other method sees inside a monolithic part with internal channels. The practical
constraint is that CT resolution degrades with part size and density: small
printed injectors can be scanned to tens of micrometres; a metre-class chamber
cannot. So the qualification argument for large AM parts is necessarily a
*process* argument — locked parameter sets, machine qualification, powder lot
control, witness coupons built alongside every part and destructively tested —
supported by CT where CT reaches, rather than a purely part-based argument
[GradlAM][Gradl18]. This is a genuine and unresolved difficulty in the field, and
you should say so rather than pretending the inspection problem is solved.

**Witness coupons are the load-bearing element of an AM acceptance argument.**
Tensile bars and fatigue specimens built on the same plate, from the same powder
lot, in the same parameter set, in representative orientations, and put through
the same post-processing. They are what connects the part in your hand to the
allowables in your analysis. They are also imperfect: a coupon does not
reproduce the thermal history of a thin curved wall in the middle of a large
build, and part-to-part and location-within-build variability is the known open
issue [GradlAM].

### 3.13 Production rate and cost as engineering variables

Rate is a design input, not a manufacturing consequence. Three regimes [J]:

**One to ten engines per year (RS-25, RL10, F-1 era, Vulcain).** Touch labour is
affordable. Processes that require skill — hand fit-up of tube bundles, hand
welding, per-unit tuning — are acceptable. Inspection can be exhaustive because
there are few units. Non-recurring cost dominates: the tooling for a
higher-rate process cannot be amortised. The optimisation is *performance per
unit mass*, because unit cost is a small fraction of mission cost.

**Tens to low hundreds per year (Merlin, Rutherford, RL10 in its best years).**
Now the calculus inverts. The **Merlin's stated design intent is exactly this**:
the engine is "optimised for cost, restart and reuse, not Isp", it accepts a
gas-generator cycle and $p_c = 97$ bar, and its distinguishing achievement is
"manufacturing cadence — hundreds of engines a year, an output no other liquid
engine programme has matched" [_verify-liquid, Merlin 1D block]. Every
manufacturing choice follows: milled channels rather than brazed tubes; a
**pintle** injector, which is one large machined element instead of hundreds of
drilled ones; a niobium radiative extension rather than a regeneratively cooled
one. Rocket Lab's Rutherford makes the same argument by a different route:
**chamber, injectors, pumps and main propellant valves all printed by L-PBF**,
which converts a labour-intensive assembly into machine time
[_verify-liquid, Rutherford block]. By April 2024, **369 Rutherford engines had
flown across 47 Electron flights** — a production statistic, and the real
justification for the architecture.

**Very high rate.** Not yet demonstrated for orbital-class liquid engines in the
open record; SpaceX's Raptor claims belong here but every Raptor figure in this
course is explicitly a company claim [_verify-liquid, Raptor block] and rate
claims should be treated the same way.

The historical cost data worth carrying:

- **RS-25.** "Cost and complexity" is listed as its major limitation; between-
  flight inspection was enormous, and the engine is now flown expendably on SLS
  [_verify-liquid, RS-25 block]. The **RS-25E ("Expendable") restart** is the
  interesting engineering event: the objective was to re-establish production of
  a 1970s design at substantially lower unit cost, and the levers were
  manufacturing ones — parts consolidation, replacing multi-piece welded and
  brazed assemblies with printed monolithic parts (the pogo accumulator assembly
  is the widely cited example, reported by the manufacturer as a large reduction
  in part count and weld count), modern machining, and deleting the reusability-
  driven inspection burden. Treat the specific cost-reduction percentages as
  **manufacturer claims not carried in this course's engine file** [M].
- **RS-68.** Designed under an explicit "design for minimum cost" brief,
  achieving roughly **80 % fewer parts than the RS-25**, at the price of
  performance — its Isp and $p_c$ are well below what a staged-combustion
  hydrogen engine of the era could reach, and the course file records that this
  is "the direct price of the cost-driven design" [_verify-liquid, RS-68A block].
- **Prometheus.** Europe's explicit statement of the same idea: a **€1 million
  per engine target, one tenth the cost of Vulcain 2**, with **up to 50 % of the
  engine by metal 3D printing**, and a gas-generator cycle chosen deliberately.
  "The cost target, not the performance, is the programme's stated purpose."
  Every figure is a target for an unflown engine [_verify-liquid, Prometheus
  block] [R].

A number of small and mid-size Western engine companies — Relativity (Aeon),
Launcher (E-2), Ursa Major, and others — have built their entire engineering
identity on printing most or all of an engine. Their published performance
numbers are company claims for engines that are not in this course's verified
engine file, so this module does not quote them; what is worth taking from them
is the *pattern*, which is uniform: small teams, high AM content, few joints,
and cost and iteration speed as the stated design drivers rather than $I_{sp}$
[M][R].

The general lesson, and it is the most transferable thing in this module: **when
unit cost or rate becomes the binding constraint, the engine architecture
changes, not just its manufacturing plan.** Cycle selection, injector type,
cooling method and nozzle construction all move. An engineer who treats "make it
cheaper" as a purchasing activity rather than a design activity will produce an
expensive engine with a cost-reduction programme attached.

---

## 4. Typical engineering ranges

| quantity | typical range | extremes / who sits there |
|---|---|---|
| Tube count, tube-wall chamber | 100–1,100 | F-1: 178 tubes; RS-25 nozzle: 1,080 tubes [_verify-liquid] |
| Milled channel count, chamber liner | 100–450 | RS-25 MCC: 390 channels [_verify-liquid] |
| Coolant channel width | 0.8–2.5 mm | narrower at the throat, wider in the barrel |
| Channel depth : width ratio | 2:1 to 4:1 (milled); up to ~6:1 (AM/EDM) | limited by cutter stiffness, Eq. 3.1 |
| Tube/liner hot wall thickness | 0.25–1.0 mm | 0.3 mm class for thin tubes; 0.8–1.0 mm for a milled copper liner |
| Braze joint clearance at temperature | 0.025–0.125 mm | the capillary window, Eq. 3.3 |
| Electroform nickel deposition rate | 0.15–0.4 mm/day | at 100–300 A/m² in sulphamate |
| Electroformed closeout thickness | 1.5–5 mm | structural jacket on a milled-channel liner |
| EDM recast layer thickness | 2–25 µm | low with trim settings, high with roughing |
| Injector orifice diameter | 0.4–3 mm | drilled or EDM'd |
| Orifice diameter tolerance (drilled) | ±0.013 to ±0.025 mm | tighter on the outer/wall-protection row |
| Orifice diameter tolerance (as-printed) | ±0.05 to ±0.10 mm | why printed orifices are usually finish-machined or EDM'd |
| Injector element count | 1 (pintle) to ~2,000 | Merlin: 1 pintle element; J-2: 614 posts; RS-25: 600 elements [_verify-liquid] |
| L-PBF layer thickness | 20–60 µm | 30 µm typical; 60 µm for rate at the cost of resolution |
| L-PBF hatch spacing | 80–150 µm | |
| L-PBF scan speed | 0.5–2 m/s | |
| L-PBF deposition rate | 5–20 cm³/h per laser | multiply by laser count; 4–12 lasers on production machines |
| L-PBF build envelope | 250 mm cube to ~600 mm × 1,000 mm | 1 m class is the current frontier |
| L-PBF as-built $R_a$ | 5–40 µm | downskin worst; machined reference 0.4–1.6 µm |
| DED deposition rate | 0.5–10 kg/h | 1–2 orders above L-PBF, at much coarser resolution |
| Minimum self-supporting overhang | 40–45° from horizontal | alloy and machine dependent |
| HIP conditions (Ni superalloys) | 1,150–1,200 °C, 100–200 MPa Ar | |
| Proof pressure factor | 1.2–1.5 × MEOP | per the applicable standard, e.g. [AIAA-S-080] |
| He leak-test sensitivity | $10^{-6}$ to $10^{-9}$ std cm³/s | |

---

## 5. Worked examples

The reference engine is **RE-500**, carried from modules 03 and 06:
LOX/RP-1, $F_{SL} = 500$ kN, $p_{c,ns} = 100$ bar, $\varepsilon = 16$,
$\dot m = 170.03$ kg/s, $A_t = 0.030582$ m², $D_t = 197.3$ mm,
$D_c = 279.1$ mm (contraction ratio 2.0), barrel length 0.5229 m, convergent
height 0.0708 m. Assume $MR = 2.30$, so $\dot m_f = 170.03/3.30 = 51.52$ kg/s
of RP-1 at $\rho_f = 810$ kg/m³.

Every number below is reproduced in `tools/examples/17.py`.

### WE1 — Tube-wall chamber: how many tubes, and what section?

**Given.** Build the RE-500 chamber as a brazed tube wall, single down-pass,
tube wall thickness $t_w = 0.30$ mm, coolant velocity at the throat
$V = 40$ m/s. Find the tube count, the tube section at the throat, at the
barrel and at the exit, the total braze land length, and the station at which
the geometry breaks.

**Step 1 — the binding station is the throat.** Circumference there:
$$C_t = \pi D_t = \pi \times 0.1973 = 0.61984\ \mathrm{m} = 619.8\ \mathrm{mm}$$
For comparison, the barrel and the exit:
$$C_c = \pi \times 0.2791 = 876.8\ \mathrm{mm};\qquad
D_e = D_t\sqrt{\varepsilon} = 0.1973\times 4 = 0.7892\ \mathrm{m},\quad
C_e = 2479.3\ \mathrm{mm}$$
The circumference varies by a factor of **4.00** from throat to exit and by
1.41 from throat to barrel. Hold that thought.

**Step 2 — choose the tube count from the throat pitch.** Take $N = 180$ tubes.
$$p_t = C_t/N = 619.8/180 = 3.444\ \mathrm{mm}$$
Subtracting two tube walls, the internal flow width at the throat is
$$w_t = p_t - 2t_w = 3.444 - 0.600 = 2.844\ \mathrm{mm}$$

**Step 3 — required flow area.** All the fuel passes down through all 180 tubes:
$$A_{tot} = \frac{\dot m_f}{\rho_f V} = \frac{51.52}{810 \times 40}
= 1.5903\times10^{-3}\ \mathrm{m^2} = 15.90\ \mathrm{cm^2}$$
$$A_{tube} = A_{tot}/N = 1.5903\times10^{-3}/180 = 8.835\ \mathrm{mm^2}$$

**Step 4 — tube depth at the throat.** Treating the flattened tube as
rectangular:
$$h_t = A_{tube}/w_t = 8.835/2.844 = \mathbf{3.11\ mm}$$
So a **2.84 mm wide by 3.11 mm deep** tube at the throat: aspect ratio 1.09,
entirely reasonable, and the 0.3 mm wall carries the coolant pressure as hoop
stress at a ~1.4 mm radius, which is why it can be that thin.

**Step 5 — the barrel.** Pitch $876.8/180 = 4.871$ mm, flow width
$4.871-0.600 = 4.271$ mm. Holding the same flow area (constant velocity, which
is what you want since the heat flux is lower here anyway):
$$h_c = 8.835/4.271 = 2.07\ \mathrm{mm}$$
The tube is **wider and shallower in the barrel and narrower and deeper at the
throat** — which is precisely why tube-wall tubes are individually *tapered*
and drawn to a varying section rather than cut from stock tubing. That is the
manufacturing burden of the architecture in one sentence.

**Step 6 — the exit, and where it breaks.** Pitch $2479.3/180 = 13.77$ mm,
flow width 13.17 mm, so at constant area:
$$h_e = 8.835/13.17 = \mathbf{0.67\ mm}$$
A 13 mm wide, 0.67 mm deep ribbon with a 0.3 mm wall. It will not hold coolant
pressure, it will not stay flat between the lands, and it cannot be formed
reliably. **The geometry has broken.** Three fixes, all used in practice:

- **Bifurcate.** Split each tube into two where the circumference has doubled,
  i.e. where $C = 2C_t \Rightarrow D = 2D_t = 394.6$ mm $\Rightarrow
  \varepsilon = 4$. Downstream, 360 tubes carry half the flow each; at the exit
  the pitch is 6.89 mm and the depth 0.70 mm — still marginal, so a second
  bifurcation or a different fix is needed.
- **Let the velocity fall.** Heat flux at $\varepsilon = 16$ is roughly two
  orders of magnitude below the throat value, so a slow, wide, shallow tube is
  thermally adequate; the problem is structural, not thermal.
- **Stop cooling regeneratively.** Terminate the regen circuit around
  $\varepsilon \approx 4$–10 and film-cool or radiation-cool the extension.
  **This is what the F-1 does** — it dumps fuel-rich turbine exhaust as a film
  over the nozzle extension, which is why the extension needs no regen circuit
  [_verify-liquid, F-1 block] — and what the Merlin 1D Vacuum does with a
  radiatively cooled niobium extension [_verify-liquid, Merlin block].

**Step 7 — braze land length.** Take the tube run as barrel + convergent +
divergent to $\varepsilon = 4$. The divergent length for an 80 % bell at a 15°
equivalent cone half-angle, from $R_t = 98.66$ mm to $R_4 = 197.3$ mm:
$$L_{div} = 0.8\,\frac{R_4-R_t}{\tan 15°} = 0.8\times\frac{0.09864}{0.26795}
= 0.2945\ \mathrm{m}$$
Axial length $= 0.5229 + 0.0708 + 0.2945 = 0.8882$ m; allowing 5 % for contour
path length, the tube is $L_{tube} = 0.933$ m. There are $N$ tube-to-tube lands
around a closed ring, so
$$L_{braze} = N\,L_{tube} = 180 \times 0.933 = \mathbf{168\ m}$$
of braze land per chamber, plus the tube-to-jacket braze area.

**Step 8 — what that means.** Suppose the furnace-braze process produces, on
average, one leak-path void per 50 m of land on the first pass — a plausible
mature-process number, and one you should demand real data for [J]. Then
$$\text{expected voids per chamber} = 168/50 = 3.4$$
Every one must be found by X-ray, located, and repair-brazed, and the assembly
re-proofed and re-leak-tested. That is the actual reason tube-wall chambers have
long lead times. It is not the forming of the tubes; it is the joint count.

> **Sanity check.** 180 tubes on a 197 mm throat is the right order: the F-1
> has 178 tubes on a throat roughly 4.5 times larger in area, and the RS-25
> nozzle has 1,080 tubes on a much larger, much higher-area-ratio contour
> [_verify-liquid]. A tube pitch of 3.4 mm at the throat and 13.8 mm at
> $\varepsilon = 16$ reproduces exactly the visual proportions of a real
> tube-wall nozzle, where the tubes are visibly narrow at the throat and broad
> at the exit — and reproduces the bifurcations you can see in photographs of
> F-1 and RS-25 nozzles.

### WE2 — What as-built AM roughness does to a cooling channel

**Given.** The same RE-500 chamber, built instead with rectangular-ish coolant
channels 1.5 mm wide × 3.0 mm deep, coolant velocity 25 m/s, channel run
$L = 0.9$ m. Hot RP-1 properties at bulk temperature: $\rho = 810$ kg/m³,
$\mu = 3.0\times10^{-4}$ Pa·s, $k = 0.11$ W/(m·K), $c_p = 2400$ J/(kg·K).
Compare a machined channel ($R_a = 0.8$ µm) with an as-built L-PBF channel
($R_a = 12$ µm).

**Step 1 — geometry and flow state.**
$$D_h = \frac{2ab}{a+b} = \frac{2(1.5)(3.0)}{4.5} = 2.00\ \mathrm{mm}$$
$$\mathrm{Re} = \frac{\rho V D_h}{\mu} = \frac{810 \times 25 \times 0.002}{3.0\times10^{-4}} = 1.35\times10^{5}$$
$$\mathrm{Pr} = \frac{\mu c_p}{k} = \frac{3.0\times10^{-4}\times 2400}{0.11} = 6.545$$
Turbulent, comfortably.

**Step 2 — channel count check.** With 1.5 mm channels on 1.0 mm lands the pitch
is 2.5 mm, so at the throat $N_{ch} = C_t/2.5 = 619.8/2.5 = 248$ channels —
the same order as the RS-25's 390, on a smaller throat. Consistent.

**Step 3 — equivalent sand-grain roughness.** Using $k_s \approx 5R_a$ [E][A]:
$$\text{machined: } k_s = 4\ \mu\mathrm{m},\quad k_s/D_h = 0.0020$$
$$\text{as-built L-PBF: } k_s = 60\ \mu\mathrm{m},\quad k_s/D_h = 0.0300$$

**Step 4 — friction factors** from Colebrook (Eq. 3.7), solved iteratively at
$\mathrm{Re} = 1.35\times10^5$:
$$f_{machined} = 0.02470,\qquad f_{AM} = 0.05740,\qquad
\frac{f_{AM}}{f_{machined}} = \mathbf{2.32}$$

**Step 5 — pressure drop.**
$$\Delta p = f\frac{L}{D_h}\frac{\rho V^2}{2}
= f \times \frac{0.9}{0.002}\times \frac{810\times 25^2}{2}
= f \times 450 \times 253{,}125\ \mathrm{Pa}$$
$$\Delta p_{machined} = 0.02470 \times 1.1391\times10^{8} = 28.1\ \mathrm{bar}$$
$$\Delta p_{AM} = 0.05740 \times 1.1391\times10^{8} = \mathbf{65.4\ bar}$$

A penalty of **37.3 bar**, on an engine whose chamber pressure is 100 bar. In
pump work, at 70 % pump efficiency:
$$\Delta P_{pump} = \frac{\dot m_f\,\Delta(\Delta p)}{\rho_f\,\eta_p}
= \frac{51.52 \times 37.3\times10^{5}}{810 \times 0.70} = 3.4\times10^{5}\ \mathrm{W}
= \mathbf{338\ kW}$$
For scale, the whole fuel pump on this engine at a 150 bar rise absorbs about
1.4 MW, so the roughness penalty is roughly **a quarter of the fuel pump
power**, which on a gas-generator cycle is a quarter more turbine flow dumped
overboard.

**Step 6 — heat transfer.** Smooth-wall Dittus–Boelter (heating, $n = 0.4$):
$$h_{smooth} = 0.023\frac{k}{D_h}\mathrm{Re}^{0.8}\mathrm{Pr}^{0.4}
= 0.023\times\frac{0.11}{0.002}\times(1.35\times10^5)^{0.8}\times 6.545^{0.4}$$
$$= 3.41\times10^{4}\ \mathrm{W/(m^2 K)}$$
Norris (Eq. 3.8) with $n = 0.68\,\mathrm{Pr}^{0.215} = 0.68\times 6.545^{0.215}
= 1.018$:
$$\frac{\mathrm{Nu}_{AM}}{\mathrm{Nu}_{smooth}} = 2.32^{1.018} = 2.36
\;\Rightarrow\; h_{AM} = 8.05\times10^{4}\ \mathrm{W/(m^2 K)}$$

**Step 7 — the engineering reading.** Rough channels transfer heat much better
and cost a great deal of pressure. But Eq. 3.8's $f/f_{smooth} = 2.32$ is close
to its stated validity limit of 3, AM roughness is not sand-grain-like, and the
measured enhancement in real AM channels is usually **less** than the analogy
predicts while the friction penalty is fully realised. Design position [J]:
budget the full 37 bar, credit no more than half the $h$ increase (i.e. use
$h_{AM} \approx 1.5$–1.7 $h_{smooth}$), and if the pressure budget will not
close, abrasive-flow-machine the channels to $R_a \approx 5$ µm, which brings
$k_s/D_h$ to 0.0125 and recovers most of the penalty.

> **Sanity check.** A 28 bar coolant $\Delta p$ on a 100 bar chamber is about
> right for a kerosene regen circuit — regenerative cooling typically costs
> 20–40 % of $p_c$ in pump rise. The 65 bar as-built figure is not
> right; it would drive the pump discharge to nearly 200 bar on a 100 bar
> engine, which is exactly the kind of result that sends an AM chamber to
> abrasive flow machining.

### WE3 — Build time, mass and powder inventory for an L-PBF chamber

**Given.** Print the RE-500 chamber liner-plus-jacket as one L-PBF part from
GRCop-42 ($\rho = 8756$ kg/m³), from the injector face to $\varepsilon = 4$
(the largest piece that fits a 600 mm-diameter, 1,000 mm-tall machine). Process:
$t_\ell = 30$ µm, $h_s = 110$ µm, $v_s = 0.9$ m/s, **4 lasers**, recoat time
$t_r = 9$ s per layer. Effective solid wall stack: 1.0 mm hot wall + 40 % land
fraction of the 3.0 mm channel depth + 2.0 mm jacket.

**Step 1 — wetted area of the contour.**
Barrel: $A_1 = 2\pi R_c L_{cyl} = 2\pi(0.13953)(0.5229) = 0.4584$ m².
Convergent frustum, slant $s_2 = \sqrt{(0.13953-0.098663)^2 + 0.07079^2} = 0.08174$ m:
$A_2 = \pi(R_c+R_t)s_2 = \pi(0.23819)(0.08174) = 0.0612$ m².
Divergent to $\varepsilon=4$, slant $s_3 = \sqrt{(0.1973-0.098663)^2+0.29449^2} = 0.31057$ m:
$A_3 = \pi(R_4+R_t)s_3 = \pi(0.29596)(0.31057) = 0.2888$ m².
$$A = 0.4584+0.0612+0.2888 = 0.8084\ \mathrm{m^2}$$

**Step 2 — solid volume.**
$$t_{eff} = 1.0 + 0.4\times 3.0 + 2.0 = 4.2\ \mathrm{mm}$$
$$V = A\,t_{eff} = 0.8084 \times 0.0042 = 3.395\times10^{-3}\ \mathrm{m^3} = 3395\ \mathrm{cm^3}$$
Add 800 cm³ for inlet/outlet manifolds, flanges and the injector interface ring:
$$V_{total} = 4195\ \mathrm{cm^3}$$

**Step 3 — theoretical deposition rate per laser.**
$$\dot V_1 = t_\ell h_s v_s = (30\times10^{-6})(110\times10^{-6})(0.9)
= 2.97\times10^{-9}\ \mathrm{m^3/s} = 2.97\ \mathrm{mm^3/s}$$
$$= 10.69\ \mathrm{cm^3/h\ per\ laser};\qquad 4\ \text{lasers} \to 42.8\ \mathrm{cm^3/h}$$

**Step 4 — exposure time.**
$$t_{laser} = \frac{4195}{42.8} = 98.1\ \mathrm{h}$$

**Step 5 — recoat time.** Build height is the axial length,
$H = 0.5229+0.0708+0.2945 = 0.8882$ m:
$$N_{layers} = H/t_\ell = 0.8882/(30\times10^{-6}) = 29{,}606\ \text{layers}$$
$$t_{recoat} = 29{,}606 \times 9\ \mathrm{s} = 2.664\times10^{5}\ \mathrm{s} = 74.0\ \mathrm{h}$$

**Step 6 — total build time.**
$$T_{build} = t_{recoat} + t_{laser} = 74.0 + 98.1 = \mathbf{172\ h} = 7.2\ \text{days}$$
The build is **exposure-limited but only just** — 57 % laser, 43 % recoat. This
ratio is the number to compute first on any AM part, because it tells you which
lever works. Adding lasers 5 through 8 would cut only the 98 h; it cannot touch
the 74 h, which depends solely on height and recoater speed. Doubling the layer
thickness to 60 µm halves the recoat time *and* halves the exposure time (since
$\dot V \propto t_\ell$) — but coarsens the surface, deepens the melt pool and
degrades the downskin, which by WE2 you will pay for in $\Delta p$.

**Step 7 — mass and powder inventory.**
$$m_{part} = 4195\times10^{-6}\times 8756 = \mathbf{36.7\ kg}$$
The build cylinder, at 450 mm diameter over the 0.888 m height, holds
$$V_{cyl} = \tfrac{\pi}{4}(0.45)^2(0.888) = 0.1413\ \mathrm{m^3}$$
of powder at roughly 55 % apparent density:
$$m_{powder,\,in\ machine} = 0.1413 \times 8756 \times 0.55 = \mathbf{680\ kg}$$
Only 36.7 kg of that is consumed; the rest is sieved and reused, but it is
working capital sitting in a machine, and its oxygen content rises with every
reuse cycle. **Powder inventory, not powder consumption, is the cost driver**,
and it is the reason AM shops standardise on very few alloys per machine.

**Step 8 — the honest schedule.** After the 7.2-day build: stress relief on the
plate, wire-EDM removal, powder removal and verification, HIP, solution/age,
machining of every interface and the throat, internal finishing, CT, proof and
leak. In calendar terms that is typically longer than the build. A programme
that quotes "seven days to print a chamber" is quoting the easy 40 %.

> **Sanity check.** ~170 h and ~37 kg for a 500 kN-class chamber section is
> consistent with the publicly discussed timescales for printed chambers of this
> size, and with the fact that Rocket Lab prints an entire 25 kN Rutherford
> primary structure — an engine of **35 kg total dry mass**
> [_verify-liquid, Rutherford block] — in a far smaller build. Scaling by
> thrust, RE-500 is 20 times the Rutherford, and a 37 kg chamber section on a
> ~250 kg engine is the right proportion.

### WE4 — Orifice tolerance stack to mixture-ratio spread

**Given.** RE-500's injector uses unlike-doublet elements, one fuel and one
oxidizer orifice each, $d_f = 1.60$ mm and $d_o = 2.23$ mm, $C_d = 0.80$ on
both, $\Delta p = 20$ bar on both circuits, $\rho_f = 810$, $\rho_o = 1140$
kg/m³ (LOX). Drilling tolerance $\pm 0.025$ mm on diameter, interpreted as a
$3\sigma$ band. Element-to-element $C_d$ scatter $\sigma_{C_d}/C_d = 1.5$ %.
Find the element mixture-ratio spread and the engine-level mixture-ratio error,
and repeat for as-printed orifices.

**Step 1 — nominal element flows.**
$$A_f = \tfrac{\pi}{4}(1.60\times10^{-3})^2 = 2.0106\times10^{-6}\ \mathrm{m^2},
\quad A_o = \tfrac{\pi}{4}(2.23\times10^{-3})^2 = 3.9057\times10^{-6}\ \mathrm{m^2}$$
$$\dot m = C_d A \sqrt{2\rho\,\Delta p}$$
$$\dot m_f = 0.80 \times 2.0106\times10^{-6}\sqrt{2 \times 810 \times 2.0\times10^{6}}
= 0.09156\ \mathrm{kg/s}$$
$$\dot m_o = 0.80 \times 3.9057\times10^{-6}\sqrt{2 \times 1140 \times 2.0\times10^{6}}
= 0.21099\ \mathrm{kg/s}$$
$$MR_{element} = 0.21099/0.09156 = 2.3045\quad\checkmark$$

**Step 2 — element count.** $\dot m_f^{total} = 170.03/(1+2.3045) = 51.45$ kg/s,
so
$$N = 51.45/0.09156 = 562\ \text{elements}$$
(Comparable to the RS-25's 600 main elements [_verify-liquid, RS-25 block].)

**Step 3 — per-orifice uncertainties.** With $\sigma_d = 0.025/3 = 0.00833$ mm:
$$\frac{\sigma_{d_f}}{d_f} = \frac{0.00833}{1.60} = 0.521\ \%,\qquad
\frac{\sigma_{d_o}}{d_o} = \frac{0.00833}{2.23} = 0.374\ \%$$
Area goes as $d^2$, so (Eq. 3.2) the relative area uncertainties double:
$$\frac{\sigma_{A_f}}{A_f} = 1.042\ \%,\qquad \frac{\sigma_{A_o}}{A_o} = 0.747\ \%$$
Combining with the $C_d$ scatter in quadrature (independent):
$$\frac{\sigma_{\dot m_f}}{\dot m_f} = \sqrt{1.042^2+1.5^2} = 1.826\ \%,\qquad
\frac{\sigma_{\dot m_o}}{\dot m_o} = \sqrt{0.747^2+1.5^2} = 1.676\ \%$$

**Step 4 — element mixture-ratio spread.**
$$\frac{\sigma_{MR}}{MR} = \sqrt{1.826^2 + 1.676^2} = 2.479\ \%
\;\Rightarrow\; \sigma_{MR} = 2.3045 \times 0.02479 = 0.0571$$
Across 562 elements you will see essentially the full $\pm 3\sigma$ population:
$$MR \in [2.13,\ 2.48]$$
That is a **±7.4 % local mixture-ratio band** on an engine whose nominal is
2.30, produced entirely by a $\pm 0.025$ mm hole tolerance and 1.5 % $C_d$
scatter. It is not a small effect and it is not removable by better analysis.

**Step 5 — engine-level error.** The circuit total areas are sums of $N$
independent draws, so the relative error of each *total* falls as $\sqrt{N}$:
$$\frac{\sigma_{MR,engine}}{MR} = \frac{2.479\ \%}{\sqrt{562}} = 0.105\ \%
\;\Rightarrow\; \sigma_{MR,engine} = 0.0024$$
The engine's mixture ratio is repeatable to about a tenth of a percent from
this source. **The same tolerance produces a 2.5 % element spread and a 0.1 %
engine spread**, and the two numbers answer different questions: the engine one
governs $I_{sp}$ and propellant residuals, the element one governs wall streaks
and local $\eta_{c^*}$ loss. An engineer who quotes the $\sqrt{N}$-reduced
number when asked about wall compatibility has made a serious error.

**Step 6 — as-printed orifices.** With an as-printed diameter tolerance of
$\pm 0.075$ mm ($3\sigma$, so $\sigma_d = 0.025$ mm) and a $C_d$ scatter of
3 % (as-built roughness and edge condition vary far more):
$$\frac{\sigma_{A_f}}{A_f} = 2\times\frac{0.025}{1.60} = 3.125\ \%,\qquad
\frac{\sigma_{A_o}}{A_o} = 2\times\frac{0.025}{2.23} = 2.242\ \%$$
$$\frac{\sigma_{\dot m_f}}{\dot m_f} = \sqrt{3.125^2+3^2} = 4.33\ \%,\qquad
\frac{\sigma_{\dot m_o}}{\dot m_o} = \sqrt{2.242^2+3^2} = 3.83\ \%$$
$$\frac{\sigma_{MR}}{MR} = \sqrt{4.33^2+3.83^2} = 5.78\ \%
\;\Rightarrow\; \sigma_{MR} = 0.133,\quad MR \in [1.91,\ 2.70]\ \text{at } \pm3\sigma$$
**2.33 times worse than drilled.** This is the quantitative reason that printed
injectors are printed as *bodies* — manifolds, posts, face cooling, element
geometry — and then have their **metering orifices finish-machined, EDM'd or
reamed** to tolerance. Printing the orifice itself is the one thing you should
not do [M][J].

> **Sanity check.** A 1.5–2 % element flow uncertainty and a ~0.1 % engine
> mixture-ratio uncertainty are consistent with real practice, where engine
> mixture ratio is trimmed by orifice plates in the feed lines to a few tenths
> of a percent and element-to-element scatter is controlled by 100 % flow-bench
> acceptance rather than by tolerance alone.

---

## 6. Real engines — why did they design it that way?

### 6.1 F-1 (1967) — 178 brazed tubes

**The choice.** A regenerative **tube-wall** chamber of 178 individually formed,
tapered tubes, brazed to each other and into an Inconel jacket with steel bands,
fuel-cooled with a down-and-back routing, with gas-generator exhaust film-
cooling the nozzle extension [_verify-liquid, F-1 block].

**The alternatives in 1962.** Milled channels with a brazed or bolted jacket —
but nobody could mill a contoured channel set on that scale, and there was no
five-axis machining. Electroforming — the technology existed but not at that
scale of contour. Ablative — impossible at 155 s of burn at 6.7 MN. Double-wall
"spaghetti" construction — the tube wall *is* the mature form of that idea, out
of the Navaho programme.

**Why it made sense.** The thin tube wall gives the smallest possible
through-wall $\Delta T$ at a given heat flux, and the tube's own small radius
carries coolant pressure efficiently. The architecture scales to any size by
adding tubes rather than by inventing a new process. Critically, it was
*already qualified*: the Neu patent and the Atlas and Thor engines had made
tube-wall chambers a known quantity, and the F-1 programme had enough novel
risk in the injector (about 2,000 tests across 210 injector designs
[_verify-liquid, F-1 block]) without adding a new chamber architecture.

**What it cost.** Hundreds of metres of braze land per chamber (WE1), an
enormous inspection burden, and a build that is fundamentally hand work.

**Would a modern engineer choose it?** No. A modern F-1-class chamber would be
a DED-deposited channel-wall structure or a segmented L-PBF assembly with a
formed nozzle. The tube wall is not wrong; it is simply dominated now.

### 6.2 RS-25 (1981) — milled channels and an electroformed nickel closeout

**The choice.** A NARloy-Z (Cu–Ag–Zr) liner with **390 machined coolant
channels** and an **electroformed-nickel closeout**, hydrogen-cooled, at
206 bar — plus, separately, a **1,080-tube brazed tube-wall nozzle**
[_verify-liquid, RS-25 block].

**Why not tubes in the chamber?** Because the RS-25 runs at 206 bar and the
heat flux at the throat is the highest of any flown engine. A tube wall cannot
give you the *local* channel geometry the heat-flux distribution demands: milled
channels can be deep and narrow exactly at the throat and shallow and wide in the
barrel, varying continuously. And a copper alloy liner is essential at that flux
(module 16), while a copper *tube* is far harder to form and braze than a
nickel-alloy one.

**Why electroforming rather than brazing the jacket on?** Because a brazed
jacket over 390 lands is 390 braze joints with the same clearance problem as
WE1, on a copper part where the braze would need to be low-temperature enough
not to anneal the liner. Electroforming deposits the jacket *onto* the lands,
producing a metallurgical bond with no filler, no clearance and no capillary
requirement. The price is eight days in a tank per part (§3.6.1) and total
dependence on surface preparation.

**And why tubes on the nozzle?** Because the nozzle's heat flux is orders of
magnitude lower, it is enormous, and 1,080 tubes is a cheaper way to make a big
low-flux cooled surface than milling and electroforming metres of contour. The
RS-25 is a **process-mixed engine by design**, and that is the lesson to take
from it.

**Would a modern engineer choose it?** For the chamber: no — a printed GRCop-42
liner with a DED 718 jacket does the same job with no closeout process at all
(§6.5). For the nozzle: also no — a channel-wall DED nozzle. But the design
*logic* — put the highest-precision process where the flux is highest, and the
cheapest process where it is lowest — is exactly right and should be copied.

### 6.3 RD-170 family (1985) — the Soviet answer

**The choice.** Four combustion chambers on a single turbopump, oxidizer-rich
staged combustion at **245.2 bar**, regeneratively kerosene-cooled, 7,250 kN
sea-level thrust; the highest-thrust liquid engine ever flown
[_verify-liquid, RD-170 block].

Soviet chamber construction differs from American practice in a way that is
worth knowing, with a caveat: the course's engine file records only
"regenerative, kerosene-cooled" for the RD-170 [_verify-liquid], so the
construction description below is from the general open literature on Soviet
engine practice, not from the course database, and is tagged accordingly [H].
The Energomash tradition uses a **milled or corrugated inner liner brazed to an
outer structural shell** — an inner shell of high-conductivity bronze or copper
alloy with channels formed in it, joined to a steel outer shell by furnace
brazing over the whole surface rather than by electroforming. It is
architecturally the same idea as the RS-25's milled-channel liner, closed out by
brazing rather than by plating, and executed at very large scale with a
correspondingly large national investment in brazing technology.

**Why it made sense.** The Soviet programme had deep, industrialised brazing
capability; it also had a firm institutional preference (Glushko's) for multiple
small chambers over one large one, which *reduces* the per-chamber manufacturing
difficulty enormously — an 1,800 kN chamber is far easier to cool, braze and
inspect than a 7,250 kN one. The four-chamber layout is, among other things, a
manufacturing decision.

**What it cost.** The course file names it: "four chambers where one would be
preferable; the single-turbopump-four-chamber layout means one turbopump failure
loses all thrust" [_verify-liquid]. Four chambers is four times the joint count,
four sets of inspections, and a complex hot-gas manifold.

**Would a modern engineer choose it?** The multi-chamber layout, no — Western
practice went the other way and the RD-191 shows Energomash did too, deriving a
single-chamber engine from the same design. The brazed channel-wall liner,
though, remains a perfectly sound architecture and is closely related to the
laser-welded and additively closed-out liners of today.

### 6.4 Rutherford (2017) — print the whole thing

**The choice.** **Chamber, injectors, pumps and main propellant valves all
additively manufactured** by L-PBF/DMLS; the first engine to fly with
essentially the entire primary structure printed. Electric-pump cycle, 25 kN,
35 kg dry [_verify-liquid, Rutherford block].

**Why it made sense.** At 25 kN, everything is small enough to fit a build
envelope comfortably — the build-volume constraint that dominates booster-engine
AM (§3.10.5) simply does not bite. The engine is produced in *quantity*: 369
engines across 47 flights by April 2024. And nine engines per first stage means
part-count reduction and process repeatability matter more than peak
performance. AM converts a many-part, many-joint, high-touch-labour assembly
into machine hours that scale by buying machines. That is precisely the right
trade at this size and rate.

**What it cost.** Surface roughness in the coolant channels (WE2), the powder
removal and CT burden, and the qualification effort of proving that a printed
pump impeller spinning at 40,000 rpm has adequate fatigue properties.

**Would a modern engineer choose it?** For a small engine at rate, yes,
unreservedly — this is now the default. SuperDraco makes the same point from a
different direction: a **3D-printed Inconel** regeneratively cooled hypergolic
chamber, "the first 3D-printed combustion chamber to fly on a crewed
spacecraft" [_verify-liquid, SuperDraco block]. The architecture does not scale
unchanged to booster class, for the reasons in §3.10.5.

### 6.5 RAMPT (2018–) — the bimetallic build

**The choice.** Large-scale blown-powder DED of regeneratively cooled
channel-wall nozzles and chambers, including **a GRCop copper-alloy liner and a
nickel-superalloy structural jacket deposited in one continuous build**, with
composite overwrap [RAMPT][GradlAM].

**Why it matters.** Every architecture in §§6.1–6.3 spends its difficulty on the
same problem: *how do you attach a structural jacket to a high-conductivity
liner without ruining either?* Brazing (F-1, RD-170) buys it with joint count
and inspection. Electroforming (RS-25) buys it with schedule and surface-prep
sensitivity. Bimetallic DED makes the question disappear: there is no joint,
there is a fusion transition, and the transition is made by changing the powder
feed mid-build. It also removes the build-envelope limit, so a metre-class
nozzle is a single part.

**What it costs, and the caveat.** Coarse resolution requiring extensive
machining; a graded interface whose properties are neither copper's nor
nickel's and must be separately characterised; a large deposited part with
substantial residual stress; and a qualification argument that is still being
built. RAMPT results are **project progress snapshots from an active technology
programme**, hot-fire tested at component scale, and the published numbers are
expected to be superseded [RAMPT][R].

**Would a modern engineer choose it?** For a new large regeneratively cooled
nozzle today: it is the most promising route in the open literature, and the one
to watch. It is not yet a flight-qualified production process, and saying
otherwise would be dishonest.

### 6.6 Merlin 1D (2013) — cost-first, and what that does to the hardware

**The choice.** Gas-generator cycle at 97 bar, **milled-channel** RP-1-cooled
chamber, a **single pintle** injector element, a radiatively cooled niobium
nozzle extension on the vacuum variant, and the highest thrust-to-weight of any
flown orbital engine at 184:1. Explicitly "optimised for cost, restart and
reuse, not Isp", with the standout achievement being manufacturing cadence —
"hundreds of engines a year, an output no other liquid engine programme has
matched" [_verify-liquid, Merlin 1D block].

**Read every one of those choices as a manufacturing decision:**

- **Gas generator over staged combustion.** No preburner, no hot oxygen-rich
  turbine gas, no oxygen-compatible superalloy hot-gas manifold. Fewer parts and
  vastly less process qualification, at a permanent Isp cost.
- **Pintle over a multi-element face.** WE4 shows what 562 drilled elements cost
  in tolerance control and flow-bench time. A pintle is *one* machined
  element — an annular sleeve and a central post — with metering that is
  turned and ground rather than drilled, and it throttles (40–100 %) and is
  inherently stable. SpaceX traces the lineage directly to the Apollo LM descent
  engine [_verify-liquid]. This is the single biggest manufacturing simplification
  in the engine.
- **Milled channels over brazed tubes.** WE1's 168 m of braze land, gone.
- **Niobium radiative extension over a regen extension.** WE1 Step 6's
  geometric breakdown, sidestepped entirely: a spun or formed C-103 shell with
  a silicide coating (§3.11), no channels, no joints.
- **$p_c = 97$ bar.** Chamber pressure is the master variable for
  manufacturing difficulty, because it sets the heat flux, which sets the wall
  and channel requirement. Stopping at 97 bar keeps a kerosene-cooled milled
  copper-alloy chamber comfortable.

**Would a modern engineer choose it?** For a high-rate reusable booster engine,
the logic is unimpeachable and has been widely copied. The specific choices are
already moving: printed chamber liners and printed pintle bodies do the same
job with fewer operations.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The trade

Every chamber-construction decision is the same four-way trade:

| | tube wall | milled + electroform | milled + brazed jacket | monolithic AM |
|---|---|---|---|---|
| Joint count | very high | zero (bonded deposit) | high | zero |
| Local channel tailoring | poor (tube section is continuous) | excellent | excellent | excellent |
| Max heat flux | moderate | highest flown | high | high |
| Lead time | longest | long (tank residence) | long | shortest |
| Scales to very large | yes | poorly | yes | not in L-PBF; yes in DED |
| Dominant defect | braze void | adhesion loss, filler residue | braze void | lack-of-fusion, residual powder |
| Rate capability | poor | poor | moderate | good |

### 7.2 Failure modes: mechanism → symptom → evidence → fix

| failure | mechanism | symptom | evidence | fix |
|---|---|---|---|---|
| **Braze void** | capillary fill failed (clearance, oxide, venting) | coolant leak into chamber or outboard; coolant $\Delta p$ low | X-ray shows unfilled land; proof or He leak test fails | repair braze; fixturing and atmosphere control; move to milled/AM |
| **Electroform disbond** | inadequate copper activation; interface shear from CTE mismatch on cycling | channel bulge; jacket separation | UT of the bond line; peel coupons | requalify activation/strike; process-control coupons every build |
| **Recast-layer crack** | EDM thermal damage, micro-cracked resolidified film | orifice fatigue crack; changed $C_d$ | metallographic section of a sample hole; flow-bench drift | trim-EDM settings; abrasive flow or electropolish removal |
| **Solidification crack (718 weld)** | Nb segregation → low-melting Laves eutectic film torn by shrinkage | crack at weld centreline or interdendritic | RT/PT; metallography shows Laves | low heat input (EB/laser), low dilution, control base-metal segregation, homogenise |
| **Lack of fusion (AM)** | insufficient $E_v$; poor track overlap | planar void aligned with layer; unmelted powder inside | CT; witness coupon fatigue debit | parameter requalification; HIP does **not** fix if surface-connected |
| **Residual powder in channel** | partly sintered cake not removed | local coolant blockage → burn-through | per-channel flow test vs prediction; CT | powder removal procedure before any sintering thermal cycle; verify by flow |
| **Casting porosity** | shrinkage without feeding; dissolved gas | fatigue debit; leak in a pressure wall | RT; CT | risering and gating redesign; HIP (only for non-surface-connected) |
| **Forging lap** | die fill order folded metal over | fatigue crack at an unexpected location | macroetch first article; PT after machining | die and preform redesign |
| **Silicide coating pest** | intergranular oxidation of Nb at 800–1,000 K through a damaged coating | rapid local consumption of the extension | visual; the damage is unmistakable | handling protocol; coating inspection; touch-up procedure |
| **Copper liner ratchet / dog-house** | cyclic plastic strain from through-wall $\Delta T$; blanching degrades the alloy | channel wall bulges into the channel, then cracks through | borescope; channel dimensional check; hot-fire coolant anomalies | GRCop-class alloy; reduce $\Delta T$; life-limit the part |

### 7.3 Materials, from the process side

The manufacturing-relevant selection logic (module 16 gives the property side):

- **Inconel 718** dominates structural engine hardware because it welds and
  prints without cracking (§3.7.2, §3.10.1) — a *processing* property, not a
  mechanical one.
- **Copper alloys (NARloy-Z, GRCop-42/84)** are used where conductivity is
  king; GRCop-42 is specified for AM chambers primarily because it is the more
  printable member of the family [GRCop][GradlAM].
- **C-103 niobium** is used for radiative nozzle extensions because it is
  formable and creep-resistant hot — and requires the silicide coating whose
  handling burden is the real cost (§3.11).
- **Al–Li alloys** dominate tankage because friction stir welding makes them
  joinable (§3.7.1); they are essentially unweldable by fusion.
- **Single-crystal superalloys** stay cast because the process is the property
  (§3.4.2).

### 7.4 Process selection: a working procedure

Given a component, ask in order [J]:

1. What is the peak heat flux and the local $\Delta T$ through the wall? That
   sets whether you need a copper alloy and therefore a closeout.
2. Does it have internal passages? If yes, can supports be removed and can
   powder be got out? If no, AM's advantage is much smaller.
3. What is the largest dimension? Above ~600 mm, L-PBF is out; DED, forming or
   segmentation.
4. What is the required production rate? Above ~50 per year, delete every
   hand-fitted joint.
5. What loads it? Fatigue-critical and creep-critical parts drive to forging or
   casting respectively.
6. What is the critical flaw size, and which NDE method finds it at that size
   in this geometry? If the answer is "none", the design is not producible,
   whatever the shop says.

### 7.5 Testing and acceptance

Component acceptance, in the usual order:

| test | what it proves | typical criterion |
|---|---|---|
| Dimensional (CMM, air gauge, bore gauge) | geometry, especially throat area and orifice diameters | drawing tolerance; $A_t$ to a tight band |
| **Flow bench**, per circuit and often per element | effective area and $C_d$; blockage; distribution | measured $\dot m$ vs $\Delta p$ within a few percent of nominal, and **circuit-to-circuit balance** |
| CT / RT / UT / PT as applicable | internal and surface defects | acceptance flaw size from fracture analysis |
| **Proof pressure** | structural adequacy in the real load path | 1.2–1.5 × MEOP, no yielding, no leak |
| **Helium leak** | no leak paths | specified std cm³/s |
| Cold-flow / water flow of the cooling circuit | channel $\Delta p$ vs prediction | within a stated band; a low $\Delta p$ means a breach, a high one means a blockage |
| Witness coupon tensile/fatigue (AM) | that the build produced the assumed properties | allowables from the qualification database |

The single highest-value diagnostic in this whole module is the **coolant-circuit
flow test compared against prediction**, because almost every manufacturing
defect that matters — braze void, disbond, residual powder, blocked channel,
wrong channel dimensions, roughness far from expectation — moves the
$\Delta p$–$\dot m$ curve, and it costs almost nothing to run.

---

## 8. Misconceptions and what engineers actually care about

**"Additive manufacturing lets you build any geometry."**
No. It lets you build geometry that is self-supporting above about 45°, that
can be reached for powder removal, that fits the build envelope, and whose
surfaces you can either finish or tolerate as-built. Those four constraints are
as restrictive in their own way as a milling cutter's reach, just differently
shaped. A printable part is designed for printing from the first sketch.

**"HIP fixes AM porosity."**
It closes internal, gas-filled or vacuum porosity that is not connected to a
surface. It does nothing for a lack-of-fusion plane that reaches the surface,
nothing for residual powder, and nothing for geometric error. And it is a full
thermal cycle that must be designed into the heat-treat sequence.

**"The braze holds the tubes together, so braze strength sets the chamber
strength."**
The *jacket and bands* carry the hoop load; the braze mostly seals and
transfers shear over a large area. And a thin brazed joint is stronger than the
bulk filler because it is triaxially constrained. Braze quality is a *leak*
requirement far more than a *strength* requirement.

**"Surface roughness is a finish issue, not a performance issue."**
WE2: as-built roughness in a 2 mm channel multiplied the pressure drop by 2.3
and cost 338 kW of pump power on a 500 kN engine. That is a cycle-level
consequence of a surface-finish parameter.

**"A tighter tolerance always gives a better engine."**
Tolerance costs money superlinearly and buys different things in different
places. WE4: tightening every orifice improves engine mixture ratio by a
negligible amount (it is already 0.1 %) while improving local uniformity
proportionally. Spend the tolerance on the outer row and on the throat; do not
spend it uniformly.

**"Printed parts are cheaper."**
Sometimes, at low volume, for complex parts. Never for simple parts at rate. The
cost model is machine-hours plus powder inventory plus a long post-processing
tail plus a qualification campaign; the benefit is part-count reduction and
schedule. Compute both.

**"Electroforming is plating."**
It is the same electrochemistry used for a completely different purpose. A
plating is 5–50 µm and cosmetic or protective; an electroform is 1.5–5 mm and
structural, takes a week, and fails by mechanisms (internal stress, nodules,
throwing power) that a plating shop never has to think about.

**"The RD-170's four chambers are a Soviet quirk."**
The four-chamber layout is a manufacturing and cooling decision, not an
aesthetic one: four 1,800 kN chambers are individually far easier to build and
cool than one 7,250 kN chamber, which is the same reason F-1 development was so
hard. Energomash then showed the family logic by deriving two-chamber (RD-180)
and single-chamber (RD-191) engines from the same chamber design
[_verify-liquid].

### What engineers actually care about

1. **Does the coolant-circuit flow test match prediction?** It is the cheapest
   test in the building and it detects most manufacturing defects that will
   destroy the part.
2. **What is the critical flaw size, and can I find it?** Every inspection
   requirement traces to this. If NDE cannot find a flaw smaller than critical,
   the design must change or the life must be reduced.
3. **How many joints does this part have, and what is each one's failure
   mode?** Joint count is the best single predictor of lead time, inspection
   burden and in-service leaks.
4. **What is the rate requirement, and does the process meet it?** Rate changes
   the architecture, not just the plan.
5. **Which surfaces will actually be machined?** In an AM part, the interfaces,
   seals and throat will be machined; everything else is as-built, and every
   as-built surface has a roughness consequence you must have accounted for.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can name the main manufacturing routes for a
combustion chamber (tube wall, milled + electroform, milled + brazed jacket,
L-PBF, DED) and say which real engine used each. You can explain in plain
language why brazing needs a small clearance, why a printed overhang needs
support, and why a single-crystal turbine blade cannot be printed. You can
state that as-built AM roughness increases both pressure drop and heat transfer,
and name two engines built largely by additive manufacturing.

**Level 2 — Working engineering knowledge.** Given a chamber contour and a
coolant flow, you can size a tube-wall or channel-wall design, count the tubes
or channels, compute the tube section at three stations, and identify where the
geometry forces a bifurcation or a change of cooling method. You can use
Colebrook plus a friction analogy to quantify the roughness penalty and credit,
and state their uncertainties. You can estimate an L-PBF build time from process
parameters and say whether it is recoat- or exposure-limited. You can propagate
an orifice tolerance stack to both element and engine mixture-ratio spreads and
explain why they differ. You can name the characteristic defect of each process
and the NDE method that finds it.

**Level 3 — Interview mastery.** Given an unfamiliar engine component, you can
propose a manufacturing route, defend it against two alternatives on the
grounds of heat flux, size, rate, joint count and inspectability, name the
dominant defect and the acceptance test, and say what you would change if the
production rate were multiplied by fifty. Given a hot-fire anomaly — a coolant
$\Delta p$ 12 % below prediction, or a local wall streak, or a mixture-ratio
shift — you can list the manufacturing defects consistent with it, rank them,
and specify the inspection that discriminates. You can argue, with numbers, both
where additive manufacturing changed engine design and where it did not, and
you can say which of today's AM capability claims are physics and which are
current machine limits.

---

## 10. Problems

### Conceptual

**P1.** Explain, from capillary physics, why a brazed joint that is *too* wide
is weaker than one at the optimum clearance, and why one that is *too* narrow
can also be defective. Which failure is more likely to be caught by X-ray?

**P2.** A colleague proposes eliminating the electroformed nickel closeout on a
copper chamber by brazing a machined nickel jacket over the lands instead. Give
three specific technical objections, each tied to a mechanism in §3.5 or §3.6.

**P3.** Why does alloy 718 dominate rocket-engine structural hardware in a way
that its room-temperature strength alone does not justify? Name the two weld
cracking mechanisms and explain which one 718 avoids and why.

**P4.** An AM chamber has rectangular cooling channels 2 mm wide and 3 mm deep,
oriented with the channel axis horizontal in the build. State what will happen
to the channel roof and why, and give two design changes that fix it without
changing the flow area.

**P5.** HIP is applied to two parts: an investment casting with interdendritic
shrinkage porosity 3 mm below the surface, and an L-PBF part with a
lack-of-fusion void that intersects an internal channel wall. Predict the
outcome for each and explain the difference in one sentence.

**P6.** Why is a per-channel or per-circuit flow test more informative than a
CT scan for detecting residual powder in a large printed chamber? Give one
defect that the flow test would miss and CT would catch.

**P7.** The F-1 dumps gas-generator exhaust as a film over its nozzle
extension. Explain how this choice is related to WE1's Step 6 result, and what
the F-1 would have had to do instead.

**P8.** Explain why the same orifice tolerance produces a 2.5 % element mixture-
ratio spread and a 0.1 % engine mixture-ratio spread, and give one design
decision that should be based on each number.

### Calculation

**P9.** A chamber throat diameter is 320 mm. Cooling channels are 1.8 mm wide on
1.2 mm lands. How many channels fit at the throat? If each channel is 3.5 mm
deep and the coolant is RP-1 at 810 kg/m³ flowing at 28 m/s, what total coolant
mass flow does the circuit carry?

**P10.** For the same channel as P9 ($D_h$ from a 1.8 × 3.5 mm rectangle),
coolant $\mu = 2.6\times10^{-4}$ Pa·s, $k = 0.11$ W/(m·K), $c_p = 2400$
J/(kg·K), compute Re and Pr. Then compute the Darcy friction factor for a
machined surface ($R_a = 1.0$ µm) and an as-built L-PBF surface
($R_a = 18$ µm), using $k_s = 5R_a$ and the Colebrook equation. Report the
ratio.

**P11.** Using the P10 results, compute the pressure drop over a 1.1 m channel
run for both surfaces, and the additional pump power required for the rough
case at 68 % pump efficiency for a coolant flow of 60 kg/s.

**P12.** Using the Norris analogy with the P10 friction ratio and the P10
Prandtl number, compute the Nusselt enhancement factor and the rough-wall $h$,
given the smooth-wall value from Dittus–Boelter. State one reason your answer
is probably optimistic.

**P13.** An L-PBF chamber has a solid metal volume of 2,800 cm³ and a build
height of 540 mm. The machine has 8 lasers, $t_\ell = 40$ µm, $h_s = 120$ µm,
$v_s = 1.1$ m/s, recoat time 7 s. Compute the exposure time, the recoat time,
and the total build time, and state which is limiting. Then compute the build
time if the number of lasers is doubled, and comment.

**P14.** An injector has 400 unlike-doublet elements. $d_f = 1.20$ mm,
$d_o = 1.70$ mm, both drilled to $\pm 0.020$ mm at $3\sigma$, with a $C_d$
scatter of 2 % ($1\sigma$). Compute the element-level relative mixture-ratio
standard deviation, the $\pm 3\sigma$ element $MR$ band about a nominal
$MR = 2.10$, and the engine-level $MR$ standard deviation.

**P15.** Using the engine database entry for the RS-25, compute the average
coolant channel pitch at the throat if the throat diameter is 262 mm and there
are 390 channels. If lands are 40 % of the pitch, what is the channel width?
Compare with your answer to P9 and comment on which engine has the harder
machining job.

**P16.** A nickel sulphamate bath runs at 250 A/m² with 96 % cathode efficiency.
How many days to deposit a 3.2 mm structural closeout? ($M_{Ni} = 0.05869$
kg/mol, $n = 2$, $F = 96{,}485$ C/mol, $\rho_{Ni} = 8900$ kg/m³.)

### Engineering reasoning

**P17.** A newly built AM chamber is hot-fired. The coolant circuit $\Delta p$
is 18 % *higher* than predicted and the coolant outlet temperature is 40 K
*lower* than predicted at the same inlet condition and flow. List the
manufacturing explanations consistent with both observations, rank them, and
specify the single inspection that would discriminate.

**P18.** A tube-wall chamber passes X-ray and proof test, then fails helium leak
test at $4\times10^{-4}$ std cm³/s — three orders of magnitude above
specification, but with no visible damage. Explain what kind of defect is
consistent with all three results, and describe how you would locate it.

**P19.** Two suppliers quote a 400 kN chamber. Supplier A proposes a milled
GRCop-42 liner with an electroformed nickel closeout, 14-month lead. Supplier B
proposes a monolithic L-PBF GRCop-42 chamber, 5-month lead, but has never built
a part this large and proposes to qualify by witness coupons plus partial CT.
You need six chambers for a development programme and, if it succeeds, forty per
year. Write the recommendation you would give, including what you would require
of Supplier B before selecting them.

**P20.** A programme reports that its printed injector shows 3 % lower $c^*$
efficiency than the drilled injector it replaced, with identical element
geometry on the drawing. Using §3.2.3, §3.10.3 and WE4, propose three distinct
manufacturing mechanisms that could produce this, and for each give the
measurement that would confirm it.

### Mini trade study

**P21.** You are choosing the construction of the regeneratively cooled chamber
and nozzle (to $\varepsilon = 25$) for a **new 1,200 kN LOX/methane booster
engine at $p_c = 130$ bar**, intended for a reusable first stage flying
**40 engines per year** with a 25-flight design life per engine. Available
options:

- **A.** Milled GRCop-42 liner, electroformed nickel closeout, brazed tube-wall
  nozzle above $\varepsilon = 6$.
- **B.** Milled GRCop-42 liner, laser-welded superalloy jacket; spun and
  channel-milled nozzle.
- **C.** Monolithic L-PBF GRCop-42 chamber to $\varepsilon = 4$ (fits a 600 mm
  machine), plus a DED bimetallic channel-wall nozzle to $\varepsilon = 25$.
- **D.** Full blown-powder DED bimetallic chamber and nozzle in one build.

Constraints: the throat diameter is 300 mm, the exit diameter at
$\varepsilon = 25$ is 1.5 m, the engine must reach a first hot fire in
30 months, and the programme has no existing electroforming or brazing
capability in-house. Recommend one option. Justify it on heat flux, size,
joint count, rate, qualification risk and schedule, state what you would do to
retire the largest risk in your choice, and name the condition under which you
would switch to your second choice.

---

## 11. Quiz (100 points)

**Q1 (6 pts).** Which of the following is *not* a reason brazed tube-wall
chambers were displaced by milled-channel and additive construction?
(a) joint count and inspection burden; (b) inability to tailor channel section
locally; (c) inadequate heat-transfer capability of a thin tube wall;
(d) unsuitability for high production rate.

**Q2 (8 pts).** An EDM'd injector orifice is left with a 20 µm recast layer.
Give two distinct ways this degrades engine behaviour, and name one process
used to remove it.

**Q3 (12 pts).** A cooling channel has $D_h = 1.8$ mm and runs at
$\mathrm{Re} = 1.6\times10^5$. Compute the Colebrook friction factor for
$k_s = 5$ µm and for $k_s = 70$ µm, and give the ratio. (Iterate; three
significant figures.)

**Q4 (8 pts).** An L-PBF build has a solid volume of 1,900 cm³ and a height of
310 mm, with $t_\ell = 30$ µm, $h_s = 100$ µm, $v_s = 1.0$ m/s, 4 lasers,
recoat 8 s/layer. Is the build recoat-limited or exposure-limited, and by what
margin? Show the two times.

**Q5 (10 pts).** State the mechanism of strain-age cracking and explain in two
sentences why alloy 718 resists it.

**Q6 (10 pts).** An injector's 300 elements each have one 1.4 mm fuel orifice
drilled to $\pm 0.021$ mm at $3\sigma$, with $\sigma_{C_d}/C_d = 1.8$ %.
Compute the relative standard deviation of a single element's fuel flow, and of
the total fuel circuit flow.

**Q7 (8 pts).** Which single NDE method is most responsible for making
additively manufactured combustion devices qualifiable, and what is its
principal limitation on large parts?

**Q8 (12 pts).** You must produce a nozzle extension: 1.8 m exit diameter,
1.2 mm wall, radiation-cooled C-103 niobium, 30 units per year. Choose a
manufacturing route, name the required coating and its dominant failure mode,
and justify why you did not print it. (Judgment.)

**Q9 (14 pts).** A tube-wall chamber for a 300 kN engine has a throat diameter
of 160 mm and is built from tubes with 0.28 mm walls at a pitch set by the
throat. The fuel flow is 30 kg/s of RP-1 ($\rho = 810$ kg/m³) at 35 m/s at the
throat, single-pass. Choose a tube count such that the throat tube aspect ratio
(depth/width) is between 1.0 and 1.5, and report the count, the flow width, the
depth and the aspect ratio.

**Q10 (12 pts).** A programme proposes to print the entire engine — chamber,
nozzle to $\varepsilon = 40$ (2.2 m exit diameter), turbine blades and thrust
structure — by L-PBF, arguing part-count reduction. Identify the three specific
components in that list where this is the wrong choice, and for each give the
physical or economic reason and the process you would use instead. (Judgment.)

---

## 12. Further reading

- **[GradlAM]** — *Metal Additive Manufacturing for Propulsion Applications*
  (AIAA, 2022). The book to read for this module. Process selection, GRCop
  behaviour, post-processing, NDE and — most valuable — honest treatment of
  part-to-part variability and what qualification actually requires. Expect the
  process-capability numbers to age; the methodology will not.
- **[Gradl18]** — NASA MSFC's consolidated summary of AM combustion devices with
  hot-fire results. Read it for "these have actually been fired, and here is
  what happened," which is a different and more useful claim than "these can be
  printed."
- **[RAMPT]** — Read for large-scale blown-powder DED of channel-wall nozzles
  and the bimetallic GRCop-plus-superalloy build. Treat as progress snapshots.
- **[GRCop]** — Ellis and Nathal on GRCop-84 development. Read for why copper
  alloys blanch and creep in a hydrogen engine's wall, and what the Cr₂Nb
  dispersoids do about it. The essential background to every modern AM chamber
  alloy choice.
- **[HH]** — Huzel & Huang, *Modern Engineering for Design of Liquid-Propellant
  Rocket Engines*. Read the thrust-chamber and injector fabrication sections for
  the Rocketdyne 1965–1985 practice this module's classical half describes,
  including tube forming, brazing and the drilling of injector patterns. US
  customary units throughout.
- **[SP-8087]** — *Liquid Rocket Engine Fluid-Cooled Combustion Chambers*. The
  design-criteria treatment of channel sizing, coolant pressure drop and wall
  life. Materials and NDE coverage predates GRCop and AM entirely, which makes
  it a useful measure of how much has moved and how much has not.
- **[SP-8124]** — *Liquid Rocket Engine Self-Cooled Combustion Chambers*. For
  ablative, radiation-cooled and refractory-metal chambers, and therefore for
  the coating and forming practice behind niobium extensions.
- **[SP-8089]** — Gill and Nurick on injectors. Read alongside §3.2.3 for how
  element geometry and orifice tolerance connect to mixing and to wall
  compatibility.
- **[MMPDS]** — For design allowables and the statistical basis behind them.
  Volume II of the 2024 edition begins to address process-intensive materials
  and joining, which is where AM allowables are heading. Note that it supersedes
  MIL-HDBK-5.
- **[Biggs89]** — "Space Shuttle Main Engine: The First Ten Years." Read for what
  a high-heat-flux, high-cycle-life chamber and its turbomachinery actually cost
  to develop and inspect — the counterweight to any claim that manufacturing
  difficulty is a solved problem.
- **[F1-R3896]** — The F-1 technical manual series. The best primary-source view
  of tube-wall chamber hardware at the level of actual drawings. Scans on
  archive and enthusiast sites; verify any number against a second source.
