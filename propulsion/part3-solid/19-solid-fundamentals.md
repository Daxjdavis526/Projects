# Module 19 — Solid Propellant Fundamentals
Part III · Prerequisites: modules 01–04 · Estimated time: 6 h

A solid rocket motor is the only chemical propulsion system in which the
propellant is also a structural member of the vehicle. That sentence is the
whole module. In a liquid engine you can be wrong about the propellant's
mechanical properties and still fly, because the propellant is a fluid in a
tank and the tank carries the load. In a solid motor the grain carries its own
weight under axial acceleration, absorbs the case's pressure-induced strain,
shrinks against a bonded liner every winter, and is simultaneously expected to
burn at a predictable rate for two minutes at 3,400 K. Every propellant
decision — binder, oxidizer, metal loading, catalyst — is therefore a
simultaneous chemistry, structures, and aging decision, and the people who
have been burned by this were almost never burned by the chemistry. They were
burned by a bond line that let go at −20 °C, or by a grain that cracked and
gave them twice the burning surface they designed for. Read this module as a
materials module that happens to produce thrust.

---

## 1. Learning objectives

After this module you should be able to:

1. State the operating principle of a solid rocket motor from the mass and
   energy balances, and explain which quantities the propellant fixes and
   which the geometry fixes.
2. Classify a propellant into double-base, composite, CMDB, or
   nitrate-ester-plasticised-polyether (NEPE) family given a description of
   its constituents, and state what each family buys and costs.
3. Explain what a binder does mechanically and chemically, and rank PBAN,
   CTPB, HTPB, and energetic binders on solids loading, low-temperature
   strain capability, and processing viscosity.
4. Explain why ammonium perchlorate dominates, what ammonium nitrate and ADN
   would buy, and what each costs in burn rate, energy, or maturity.
5. Compute the condensed-phase mass fraction produced by a stated aluminium
   loading, and estimate the resulting two-phase flow loss with a stated
   bracketing model.
6. Compute density impulse for a solid propellant and for LOX/RP-1 and
   LOX/LH2, and use the comparison to argue a stage-sizing decision.
7. Estimate ideal $I_{sp}$ from assumed combustion products ($T_c$, $\bar M$,
   $\gamma$) using $c^*$ and $C_F$, and reconcile the estimate with a
   published motor figure by naming the loss mechanisms.
8. Explain why flown solids sit in the 240–300 s band and what would have to
   change physically to leave it.
9. Read a published propellant composition (the Shuttle SRB fact-sheet
   numbers) and say what each constituent is doing and which number would
   change the thrust trace most if it moved by 0.2 percentage points.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Burning rate | $r$ | m/s | linear regression speed of the burning surface normal to itself |
| Burn-rate coefficient | $a$ | m·s⁻¹·Pa⁻ⁿ | pre-exponential in Vieille's law; units follow $n$ |
| Pressure exponent | $n$ | — | exponent in $r = a p_c^n$ |
| Klemmung (area ratio) | $K_n$ | — | burning surface area / throat area, $A_b/A_t$ |
| Propellant density | $\rho_p$ | kg/m³ | cured bulk density of the grain |
| Solids loading | $\alpha$ | — | mass fraction of solid fillers (oxidizer + metal) in the propellant |
| Specific impulse | $I_{sp}$ | s | $c/g_0$; effective exhaust velocity per unit weight flow |
| Density impulse | $I_d$ | kg·s/m³ | $\rho_p I_{sp}$; impulse per unit propellant *volume* |
| Characteristic velocity | $c^*$ | m/s | $p_c A_t/\dot m$; a propellant-and-chamber property |
| Thrust coefficient | $C_F$ | — | $F/(p_c A_t)$; a nozzle-and-ambient property |
| Chamber (flame) temperature | $T_c$ | K | adiabatic flame temperature of the combustion products |
| Mean molar mass | $\bar M$ | kg/kmol | mass-weighted molar mass of the gaseous products |
| Ratio of specific heats | $\gamma$ | — | $c_p/c_v$ of the product mixture |
| Condensed-phase mass fraction | $\xi$ | — | mass fraction of the exhaust that is liquid or solid (chiefly Al₂O₃) |
| Two-phase coupling efficiency | $\lambda$ | — | fraction of the equilibrium particle momentum actually delivered |
| Glass transition temperature | $T_g$ | K | temperature below which the binder network becomes glassy and brittle |
| Maximum strain | $\varepsilon_m$ | — | uniaxial strain at maximum stress in a standard tensile test |
| Maximum stress | $\sigma_m$ | Pa | uniaxial stress maximum in a standard tensile test |
| Temperature sensitivity of burn rate | $\sigma_p$ | K⁻¹ | $(\partial \ln r/\partial T_i)_{p}$, at constant pressure |
| Temperature sensitivity of pressure | $\pi_K$ | K⁻¹ | $(\partial \ln p_c/\partial T_i)_{K_n} = \sigma_p/(1-n)$ |
| Oxygen balance | OB | — | mass of oxygen surplus or deficit per unit mass of compound, as a percentage |
| Expansion ratio | $\varepsilon$ | — | $A_e/A_t$ |

---

## 3. Theory

### 3.1 The operating principle, stated properly

A solid rocket motor is a pressure vessel containing a block of propellant (the
**grain**) which is chemically complete: fuel and oxidizer are already mixed at
the scale of tens of micrometres. Ignition raises a surface layer to its
decomposition temperature; from then on the propellant sustains its own
combustion at the surface, and the surface regresses into the grain at a rate
$r$ set almost entirely by the local pressure.

Two balances run the motor. Mass generation at the burning surface:

$$\dot m_{gen} = \rho_p A_b r$$

> **Eq. 3.1** — variables: $\dot m_{gen}$ [kg/s] gas generation rate, $\rho_p$
> [kg/m³] propellant density, $A_b$ [m²] instantaneous burning surface area,
> $r$ [m/s] burning rate. Meaning: the propellant is consumed by sweeping a
> surface through a solid of known density. Assumes: the surface burns
> uniformly and normal to itself, no unburned propellant is ejected, and the
> grain is homogeneous at the scale of the regression. Fails when: the grain
> is cracked (so $A_b$ is not the design surface), when slivers or unbonded
> chunks are expelled, when erosive burning makes $r$ a function of position,
> and near ignition and tail-off when the surface is not yet or no longer
> fully lit. [F]

Mass discharge through a choked throat (Module 02):

$$\dot m_{out} = \frac{\Gamma\, p_c A_t}{\sqrt{R T_c}} = \frac{p_c A_t}{c^*}, \qquad \Gamma = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

> **Eq. 3.2** — variables: $p_c$ [Pa] chamber stagnation pressure, $A_t$ [m²]
> throat area, $R = R_u/\bar M$ [J/(kg·K)], $T_c$ [K], $c^*$ [m/s]. Meaning:
> a choked throat is a fixed-conductance valve whose conductance depends only
> on the gas and the area. Assumes: choked, quasi-steady, calorically perfect
> single-phase gas, no throat erosion. Fails when: the throat erodes (it
> always does, a few percent over a long burn), when a large condensed fraction
> makes "the gas" a poor description, and during the transient when the
> chamber is filling. [F]

Equating them gives the equilibrium chamber pressure. With $r = a p_c^n$
(Vieille / Saint-Robert, Module 20):

$$p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{\frac{1}{1-n}}, \qquad K_n = \frac{A_b}{A_t}$$

> **Eq. 3.3** — variables as above; $K_n$ [—] the burning-area-to-throat-area
> ratio. Meaning: chamber pressure is set by the propellant ($a$, $n$,
> $\rho_p$, $c^*$) and by one geometric number ($K_n$). Assumes: steady state,
> Vieille's law valid over the pressure range, $n<1$. Fails when: $n \ge 1$,
> in which case the equilibrium is unstable and the motor either extinguishes
> or runs away — this is the single hardest constraint on propellant
> formulation and it is why no flown propellant has $n$ near unity. [F]

This is the architectural difference from a liquid engine, and it is worth
stating as a division of labour:

| quantity | fixed by | changeable in flight? |
|---|---|---|
| $c^*$, $T_c$, $\bar M$, $\gamma$ | propellant chemistry | no |
| $\rho_p$ | propellant chemistry | no |
| $a$, $n$, $\sigma_p$ | propellant chemistry (binder, oxidizer particle size, catalyst) | no |
| $K_n(t)$, hence $p_c(t)$, hence $F(t)$ | grain geometry (Module 21) | no — but it is *designed* as a function of burnt distance |
| $C_F$ | nozzle $\varepsilon$ and ambient pressure | no |

Everything in the "propellant chemistry" rows is decided years before flight,
in a mix vessel, and cannot be adjusted afterwards. That is the price of the
solid motor's simplicity: no valves, no turbopumps, no ignition sequencing
beyond a single igniter, no propellant tanks, storage for decades — and no
throttling, no restart, and no shutdown except by destroying the motor.

### 3.2 What a propellant is asked to do at once

A useful way to hold the whole subject in your head is to list the
simultaneous requirements. They conflict, and every real formulation is a
point on the resulting Pareto surface.

1. **Energy.** High $c^*$, which means high $T_c$ and low $\bar M$. Pushes
   toward energetic oxidizers, metal fuel, and hydrogen-rich binders.
2. **Density.** High $\rho_p$, because a solid motor's case volume is the
   expensive resource. Pushes toward maximum solids loading and dense
   ingredients.
3. **Mechanical integrity.** The grain must not crack. It must survive
   thermal cycling, transport vibration, and axial acceleration, at both
   temperature extremes of its specification. Pushes toward *more binder*,
   which is directly opposed to (1) and (2).
4. **Processability.** The uncured mix must be pourable or castable into the
   case. Viscosity rises steeply with solids loading; at some loading you
   simply cannot fill the mould. Again opposed to (1) and (2).
5. **Ballistic behaviour.** $n$ comfortably below 1 (typically 0.2–0.5),
   $\sigma_p$ small, $r$ in the range the grain geometry needs.
6. **Safety and life.** Hazard classification (1.3 versus 1.1) determines how
   the motor is transported and stored, and therefore how much a program
   costs. Chemical aging must be slow enough for the required service life,
   which for a strategic motor is measured in decades.

Notice that (3) and (4) are pure binder questions, (1) and (2) are pure filler
questions, and the binder-to-filler ratio is the single number that trades
them. **[J]** If you remember one thing about solid propellant design,
remember that the argument is nearly always about the last two percentage
points of binder.

### 3.3 Propellant families

#### 3.3.1 Double-base — the historical baseline [H]

A double-base propellant is a *homogeneous* material: nitrocellulose (NC)
plasticised (gelatinised) by nitroglycerine (NG). There is no separate
oxidizer phase; both components are nitrate esters carrying their own oxygen,
and the material burns because each molecule is internally oxygen-bearing.
Extruded double-base (EDB) and cast double-base (CDB) processing routes both
date from the 1930s–40s [Kubota ch. 4], [Davenas ch. 2].

What it buys: a **clean, nearly smokeless exhaust** (products are essentially
CO, CO₂, H₂, H₂O, N₂ with no chloride and no metal oxide), good ballistic
reproducibility, and mechanical homogeneity.

What it costs: modest energy. Because nitrate esters are near-oxygen-balanced
but not oxygen-rich, and because there is no metal, flame temperatures sit
around 2,400–2,900 K and $I_{sp}$ around 200–230 s at typical booster
expansion ratios. Double-base also has poor low-temperature mechanical
properties — it is a plasticised polymer that goes glassy — and NG-bearing
materials are hazard-class-1.1 (mass-detonating). [H]

Double-base survives today mainly where **signature** matters more than
energy: gun-launched and tactical applications where a smoke trail is a
targeting aid for the enemy. It is not a launch-vehicle propellant and has not
been one for sixty years.

#### 3.3.2 Composite — the workhorse [M]

A composite propellant is a *heterogeneous* material: crystalline oxidizer
particles, and usually metal powder, dispersed in a cured polymeric binder
which is itself a fuel. The archetype is **AP/Al/HTPB** — ammonium perchlorate,
aluminium, hydroxyl-terminated polybutadiene. Ammonium-perchlorate composite
propellant is abbreviated **APCP** and it is what essentially every large
flown solid booster burns [SB §12.3].

The physics is different from double-base in a way that matters. Combustion is
**diffusion-limited at the particle scale**: the oxidizer decomposes at the
surface, the binder pyrolyses, and the two vapour streams must mix before they
can react. This is why oxidizer particle size distribution is a first-order
ballistic variable in composites and is meaningless in double-base — and it is
why composite propellants have lower pressure exponents (typically $n \approx
0.3$–$0.4$) than double-base, which is a stability advantage per Eq. 3.3.

What it buys: energy (the perchlorate is strongly oxygen-rich, and aluminium
adds a very large heat of oxidation), density, excellent mechanical
properties from a rubbery binder, and hazard class 1.3 (mass-burning, not
mass-detonating) for the standard AP/Al/HTPB formulations. What it costs:
a very visible exhaust — aluminium oxide smoke plus hydrogen chloride — and
therefore a large infrared and radar signature and a corrosive, environmentally
awkward plume.

#### 3.3.3 Composite-modified double base (CMDB)

CMDB is exactly what the name says: a double-base matrix into which crystalline
solids are loaded. Add AP and aluminium and you get an energy increase over
plain double-base while keeping some of the homogeneous matrix's processing
character. Add a **nitramine** — HMX or RDX — instead, and you get a
high-energy, comparatively low-signature propellant, because nitramines are
chlorine-free and, if the aluminium is left out, produce no condensed oxide
[Kubota ch. 5], [Davenas ch. 4].

CMDB is the historical bridge from double-base to modern high-energy
composites. It is also where the hazard classification gets expensive:
nitramine and nitrate-ester content pushes a formulation toward class 1.1,
with all the storage, transport, and quantity-distance consequences that
implies. **[J]** A program that can accept 1.3 will almost always accept 1.3;
a program that goes 1.1 has usually been driven there by a range or a volume
requirement that nothing else could meet.

#### 3.3.4 The NEPE family — architecture level only

**NEPE** stands for **nitrate-ester-plasticised polyether**. Architecturally,
it is a crosslinked polyether binder (polyethylene-glycol chemistry) in which
the plasticiser is itself energetic — nitrate esters rather than the inert
plasticiser oils used in an HTPB propellant — carrying a high loading of
nitramine and, in the aluminized versions, aluminium and AP.

The architectural point, and the only one this course makes, is this: in a
conventional HTPB composite, roughly 12 % of the mass is a binder system that
contributes fuel value but no oxygen and comparatively little energy. NEPE
attacks that 12 %. By making the plasticiser fraction energetic, the "dead"
mass fraction shrinks, and the same total solids loading delivers more energy.
Open sources identify **NEPE-75** as the Trident II D-5 propellant family
[FAS], and the same open sources describe the Peacekeeper stages as
nitramine-loaded (HMX-bearing) rather than plain AP/Al/HTPB — a CMDB-class
description [FAS] (confidence: secondary, architecture only).

The cost is exactly what you would expect. Energetic plasticisers are
nitrate esters: they migrate, they age, they are sensitive, and they take the
propellant to hazard class 1.1. A NEPE-class propellant is a strategic-motor
propellant, chosen when volume-limited range is the binding requirement and
the program can afford 1.1 handling. **No launch vehicle in commercial
service uses one.** That asymmetry — strategic motors go NEPE, launchers stay
HTPB — is one of the clearest expressions in propulsion of the fact that
"performance" is not a scalar.

> **Scope note.** This course records propellant *families* and what the
> family architecture buys. It does not record formulations, ingredient
> ratios, particle size distributions, or processing for any of the
> nitramine- or nitrate-ester-based families. The one numeric composition in
> this module is the Shuttle SRB's, because NASA publishes it in a fact sheet
> (§3.10).

### 3.4 Binder systems

The binder is the continuous phase. It is a fuel — a hydrocarbon or polyether
polymer, hydrogen-rich, contributing heavily to lowering $\bar M$ — and it is
the structure. Its mechanical properties *are* the grain's mechanical
properties, modified by the filler.

The historical progression in launch-vehicle propellants is
**polysulfide → PBAA/PBAN → CTPB → HTPB → (energetic binders)**, and each step
was driven by mechanical properties and solids loading, not by energy.

| binder | chemistry | era | solids loading achievable | low-temperature strain | notes |
|---|---|---|---|---|---|
| Polysulfide | thiol-terminated polysulfide | 1940s–50s | ~75 % | poor | first practical castable binder; low energy |
| **PBAN** | polybutadiene–acrylonitrile–acrylic acid terpolymer, epoxy-cured | 1960s–present | ~86 % | fair | Shuttle SRB, SLS SRB, Titan UA120 |
| **CTPB** | carboxyl-terminated polybutadiene | 1960s–70s | ~87 % | good | Polaris A-3 class; superseded by HTPB |
| **HTPB** | hydroxyl-terminated polybutadiene, isocyanate-cured | 1970s–present | ~88–90 % | very good | the modern default for everything civil |
| Energetic (GAP, BAMO, poly-NIMMO and relatives) | azide- or nitrato-functional prepolymers | 1980s– | comparable | variable, generally worse | binder itself contributes oxygen and energy; [R] for most applications |

The mechanism behind the table is worth spelling out, because "HTPB has better
mechanical properties" is exactly the shallow sentence this course bans.

**Cure chemistry and network uniformity.** PBAN is cured by reacting its
carboxyl and acrylic-acid functionality with an epoxide. CTPB is cured through
carboxyl groups; HTPB through hydroxyl groups with a di- or tri-isocyanate.
The isocyanate–hydroxyl (urethane) cure is far better behaved: the reaction is
clean, close to stoichiometric, and produces a network of controllable
crosslink density. The carboxyl cures are more sensitive to acid–base
interactions with the filler surface — and the filler is 86–88 % of the
material — so the network you get is less uniform, with more chain ends that
do nothing mechanically. A more uniform network at the same crosslink density
gives a higher strain at failure. [F]/[E]

**Prepolymer viscosity and solids loading.** HTPB prepolymers are available at
low viscosity with narrow molar-mass distributions. Lower binder viscosity at
a given solids loading means you can go to a *higher* solids loading before the
mix becomes uncastable. Every extra point of solids loading is roughly a point
of density and a fraction of a second of $I_{sp}$. This — not chemistry — is
the main reason HTPB displaced CTPB. [E]

**Glass transition.** The binder's $T_g$ sets the cold end of the operating
envelope. Polybutadiene backbones have $T_g$ well below 200 K, which is why
they dominate; a propellant whose binder is glassy at its cold-storage
temperature is a propellant that cracks. Nitrate-ester-plasticised systems
have their own problem: the plasticiser is what keeps them compliant, and if
it migrates out (into the liner, into the insulation) the grain embrittles
locally, at the bond line, which is the worst possible place. [F]

**Aging.** Three mechanisms dominate, and they are not the same mechanism.

1. **Post-cure / continued crosslinking.** The network keeps reacting slowly.
   Modulus rises, strain capability falls. Monotonic, temperature-accelerated,
   and reasonably predictable by Arrhenius extrapolation from accelerated
   aging at elevated temperature. [E]
2. **Oxidative crosslinking of the polybutadiene backbone.** Residual double
   bonds react with oxygen. Same symptom — embrittlement — different rate law,
   and it depends on how well the case seals.
3. **Plasticiser and species migration.** Small molecules move down
   concentration gradients into the liner and insulation. This changes
   properties *at the bond line* while a bulk sample cut from the middle of
   the grain still looks fine. Surveillance programs that only do bulk
   tensile tests will miss it. [E]/[J]

The engineering consequence: **service life is set by strain capability, not
by energy**. A twenty-year-old motor has essentially the same $I_{sp}$ it had
when it was cast, and may have half the strain to failure. Aging surveillance
is a mechanical-properties program with a chemistry appendix, not the other
way around.

### 3.5 The oxidizer

The oxidizer supplies the oxygen and is the majority of the mass. Its
properties dominate density, and its decomposition behaviour dominates burn
rate.

**Ammonium perchlorate, NH₄ClO₄ (AP).** Density 1,950 kg/m³. Oxygen balance
about +34 % — strongly oxygen-rich, so it can oxidize both the binder and the
metal. It is thermally stable, cheap, manufacturable in controlled particle
size distributions from a few micrometres to several hundred, and it
self-deflagrates above roughly 2 MPa, which gives composite propellants their
characteristic ballistic behaviour. AP is the default and has been since the
1950s. [M]

Its liability is in the products: every chlorine atom leaves as **HCl**. That
is a corrosive, visible, environmentally contentious plume, and it costs
performance too — see §3.9.

**Ammonium nitrate, NH₄NO₃ (AN).** Density 1,725 kg/m³, oxygen balance about
+20 %. Chlorine-free, cheap, and low-signature. It is also a much poorer
oxidizer in practice: lower energy, much lower burn rate (AN propellants are
slow and need substantial catalysis), and — the killer — AN has **solid-state
phase transitions near room temperature**, one of them at about 32 °C, with a
volume change. A grain that cycles through that transition daily is a grain
that self-destructs. Phase-stabilised AN (PSAN, with a potassium or other
dopant that suppresses the transition) exists and is the enabling step for
AN-based gas generators; AN remains a gas-generator and low-signature-motor
oxidizer, not a booster oxidizer. [E]/[M]

**ADN, HNF, and the chlorine-free candidates.** Ammonium dinitramide
(ADN, NH₄N(NO₂)₂) and hydrazinium nitroformate (HNF) are the two most-studied
chlorine-free high-energy oxidizers. Conceptually they promise AP-class or
better energy with no HCl and much lower smoke. Both have persistent problems:
hygroscopicity, low melting point (ADN melts around 92 °C, which is inside a
plausible thermal-soak envelope), compatibility with binders and with
aluminium, and — the recurring one — the fact that nobody has qualified them
at scale for a flight motor. Treat them as [R]. The honest summary is that AP
has been about to be replaced for forty years. **[J]**

**Nitramines (HMX, RDX).** Not oxidizers in the AP sense — they are
near-oxygen-balanced energetic solids that carry their own oxygen and produce
mostly N₂, CO, CO₂, H₂O. They raise energy, they are chlorine-free, they
lower the plume signature, and they raise the hazard class. This is the
ingredient that separates the strategic-motor formulations from the
launch-vehicle ones, at family level. [H]/[M]

### 3.6 Aluminium and the two-phase flow penalty

Aluminium powder, typically a few to a few tens of micrometres, is added at
15–20 % by mass in essentially every large booster propellant. Three reasons,
in order of importance:

1. **Energy.** The heat of formation of Al₂O₃ is very large
   (−1,676 kJ/mol, i.e. about −16.4 MJ per kg of Al₂O₃). Adding aluminium
   raises $T_c$ by roughly 400–600 K in a typical AP composite.
2. **Density.** Aluminium's density is 2,700 kg/m³ against ~1,950 for AP and
   ~920 for cured HTPB. Metal loading raises $\rho_p$ directly.
3. **Combustion stability.** Aluminium droplets damp acoustic oscillations in
   the chamber. This is not a minor benefit — unmetallised composite motors
   are notoriously prone to longitudinal and tangential instabilities, and the
   particle damping from a metallised propellant is often the reason a motor
   is quiet (Module 20, and Module 15 for the mechanism).

The penalty is that Al₂O₃ **does not vaporise** at nozzle conditions (boiling
point ≈ 3,250 K, and it is condensing, not evaporating, as the flow expands).
A large fraction of the exhaust mass leaves the nozzle as liquid or solid
droplets. Those droplets:

- **do not expand.** Only the gas converts enthalpy to directed kinetic
  energy by expansion. The condensed phase can only be dragged along.
- **lag in velocity.** Momentum transfer to a droplet takes drag, which takes
  time, which the flow does not have. Larger droplets lag more.
- **lag in temperature.** They arrive at the exit hotter than the gas, so
  their sensible and latent heat is dumped overboard unrecovered.

These three effects together are the **two-phase flow loss**, and for a
typical aluminized booster it is 1–3 % of $I_{sp}$ [SP-8039], [SB §12.4].
It scales with the condensed fraction $\xi$, with droplet size, and inversely
with motor size — a big motor gives the droplets a long nozzle and plenty of
residence time to equilibrate; a small motor with a small throat does not.
Worked Example 19.3 brackets the loss.

There is a fourth cost, which is not a performance loss but is a materials
problem: molten alumina at 3,000 K impinging on the nozzle throat and on a
submerged nozzle's inner surfaces is an aggressive erosive-corrosive
environment, and it drives the choice of carbon–carbon and carbon-phenolic
throat materials (Module 24).

**The net verdict is still strongly in favour of aluminium** for boosters, and
Worked Example 19.4's variants show why: the ideal energy gain is roughly 25 s
at $\varepsilon = 50$ and the two-phase loss is roughly 2 %, i.e. about 6 s.
You pay back about a quarter of what you get. **[J]** For a *small*
upper-stage motor with a small throat, the arithmetic gets closer, and
reduced-aluminium or unmetallised formulations become defensible.

### 3.7 Burn-rate modifiers — conceptual

The formulator has three levers on $r$ and none of them are exotic:

1. **Oxidizer particle size distribution.** Finer AP burns faster: the
   diffusion length between oxidizer vapour and binder pyrolysis products is
   shorter, so the flame stands closer to the surface and the surface heat
   flux is higher. A bimodal or trimodal AP grind is standard practice — the
   coarse fraction lets you reach high solids loading (small particles fill
   the interstices between large ones), the fine fraction sets the rate.
2. **Catalysts.** Transition-metal oxides — **iron oxide** is the canonical
   one, and it is in the Shuttle SRB at 0.4 % — accelerate AP decomposition
   and raise $r$. Copper chromite is the other classic. A fraction of a
   percent changes the rate by several percent.
3. **Ballistic suppressants (rate depressants).** Materials that raise the
   diffusion length or absorb heat at the surface — oxamide is the classic —
   are used to *lower* rate when a grain design needs a long burn.

The design point to carry: **the catalyst loading is a ballistic tuning knob
measured in tenths of a percent, and it is not a rounding error.** When a
published composition disagrees with another published composition by 0.2
percentage points of iron oxide, that is not a transcription question; it is a
several-percent question about burn rate, hence about $p_c$ (amplified by
$1/(1-n)$ per Eq. 3.3), hence about the thrust trace. §3.10 returns to this.

Burn-rate modelling proper — Vieille's law, erosive burning, temperature
sensitivity, the $K_n$–pressure coupling — is Module 20.

### 3.8 Performance: why 240–300 s and not more

Start from the ideal rocket relations of Module 03:

$$I_{sp} = \frac{c^* C_F}{g_0}, \qquad c^* = \frac{\sqrt{R T_c}}{\Gamma} = \frac{1}{\Gamma}\sqrt{\frac{R_u T_c}{\bar M}}$$

> **Eq. 3.4** — variables: $c^*$ [m/s], $C_F$ [—], $g_0 = 9.80665$ m/s²,
> $R_u = 8314.46$ J/(kmol·K), $T_c$ [K], $\bar M$ [kg/kmol], $\Gamma$ from
> Eq. 3.2. Meaning: performance splits cleanly into a chemistry term ($c^*$)
> and a nozzle-and-altitude term ($C_F$). Assumes: ideal, one-dimensional,
> equilibrium or frozen single-phase expansion of a calorically perfect gas.
> Fails when: a condensed phase is present (which is exactly the solid-motor
> case — see §3.6), when the flow is not fully expanded or separates, and when
> $\gamma$ varies strongly through the nozzle. [F]/[A]

The single most important structural fact in this equation is that $c^*$ goes
as $\sqrt{T_c/\bar M}$. A propellant improves by getting hotter or by making
lighter products, and the square root punishes you: a 10 % gain in $c^*$
requires a 21 % rise in $T_c$ at fixed $\bar M$.

Now put in numbers a solid propellant can actually reach.

- **$T_c$ is capped around 3,600–3,700 K** for aluminized AP composites. Not
  by chemistry — you could go hotter — but by materials. The nozzle throat,
  the insulation, and the case must survive it for 60–150 s, and erosion rates
  climb steeply with temperature.
- **$\bar M$ has a floor around 25–30 kg/kmol.** This is the real constraint,
  and it is the direct consequence of the propellant carrying its own
  oxidizer in condensed form. See §3.9.

Compare with a liquid engine. LOX/LH2 running fuel-rich at MR ≈ 6 produces
$\bar M \approx 13$ kg/kmol at $T_c \approx 3,600$ K, which is why the RS-25
gets 452 s. The solid propellant is competing at more than twice the molar
mass. A factor of 2.1 in $\bar M$ at comparable temperature is a factor of
$\sqrt{2.1} \approx 1.45$ in $c^*$ — and $452/1.45 \approx 310$ s, which is
very close to the top of the solid band. **The 240–300 s ceiling is not an
engineering shortfall; it is the molar mass of the products of a
self-oxidizing condensed-phase mixture.** [F]

The rest of the band's width is nozzle, not chemistry:

| motor class | typical $\varepsilon$ | published $I_{sp}$ |
|---|---|---|
| Sea-level booster (Shuttle SRB) | 7.16–7.72 | 242 s SL / 268 s vac |
| High-$\varepsilon$ first stage (P120C) | high | ≈ 280 s |
| Second stage (Zefiro 40) | high | 293.5 s |
| Upper stage / AKM (Zefiro 9A; Star 48B long nozzle) | 50–70 | 295.9 s; 292.2 s |

A booster and an upper-stage motor can burn nearly the same propellant and
differ by 50 s. This is why "the $I_{sp}$ of HTPB propellant" is not a
meaningful phrase, and why the Star 48B's two published figures (286.2 s at
$\varepsilon \approx 47.7$, 292.2 s at $\varepsilon \approx 54.8$–70.4) are
both correct — they are two nozzles on the same motor [JM-LV], [EA].

**Density impulse.** The quantity that actually decides whether a solid is the
right answer is not $I_{sp}$:

$$I_d = \rho_p I_{sp}$$

> **Eq. 3.5** — variables: $I_d$ [kg·s/m³], $\rho_p$ [kg/m³] propellant bulk
> density, $I_{sp}$ [s]. Meaning: total impulse deliverable per unit *volume*
> of propellant. Assumes: nothing beyond the definitions — but the comparison
> is only fair between systems at the same expansion ratio and against the
> same back pressure. Fails as a decision metric when: the mission is
> $\Delta v$-limited with a generous volume budget (then $I_{sp}$ alone wins),
> or when the tankage/case mass, not the propellant volume, dominates. [F]

Solid propellant at ~1,770 kg/m³ against LOX/LH2's ~360 kg/m³ bulk means a
solid wins on volume by roughly 3:1 even while losing on $I_{sp}$ by 1.7:1.
Worked Example 19.1 does the arithmetic. This is why boosters, strategic
missiles in silos and tubes, and anything volume-constrained are solid, and
why upper stages that must deliver large $\Delta v$ with unconstrained volume
are not.

### 3.9 Combustion products and molar mass

Take AP/Al/HTPB. The significant products, in rough order of importance for a
typical booster propellant [CEA], [SB §12.3]:

| species | molar mass (kg/kmol) | comment |
|---|---|---|
| CO | 28.0 | major; fuel-rich operation is normal |
| H₂O | 18.0 | major |
| **HCl** | 36.5 | every chlorine from the AP; ~15–20 % by mass of the exhaust |
| N₂ | 28.0 | from AP's ammonium |
| CO₂ | 44.0 | |
| H₂ | 2.0 | the only light species, and there is not much of it |
| **Al₂O₃** | 102.0 | condensed; ~30 % of the exhaust *mass* at 16 % Al loading |

Compute the mean molar mass of the *gaseous* products and you land near
24–26 kg/kmol; include the condensed phase in the mass bookkeeping and the
effective $\bar M$ used for performance is 27–30. Contrast LOX/LH2's 13 and
LOX/RP-1's 22–24.

Three observations follow directly:

1. **HCl is a heavy, spent diluent.** At 36.5 kg/kmol it is the second-heaviest
   thing in the exhaust after alumina. It contributes essentially nothing to
   the energy release (the H–Cl bond is already formed) and drags $\bar M$ up.
   Roughly a fifth of the exhaust mass is heavy and chemically finished. This
   is the real performance cost of using a perchlorate, and it is a large part
   of why chlorine-free oxidizers are perennially interesting.
2. **Al₂O₃ is heavier still and is not even a gas.** See §3.6.
3. **Hydrogen is scarce.** In a liquid hydrogen engine you run deliberately
   fuel-rich to leave free H₂ in the exhaust, because H₂ at 2 kg/kmol drags
   $\bar M$ down enormously. A composite solid cannot do this: the hydrogen
   is bound up in a polymer at ~12 % of the mass and most of it ends up as
   H₂O.

That, in three bullets, is why solid motors sit where they sit.

### 3.10 The one concrete composition: the Space Shuttle SRB

NASA publishes the Space Shuttle solid rocket booster propellant composition
in its fact-sheet material [NASA-SRB]. It is quoted here because it is the
single most widely published real formulation in the field and because every
constituent illustrates a point already made.

| constituent | mass % | role |
|---|---|---|
| Ammonium perchlorate (AP) | 69.6 | oxidizer (§3.5) |
| Aluminium | 16.0 | metal fuel: energy, density, stability (§3.6) |
| Iron oxide | 0.4 | burn-rate catalyst (§3.7) |
| PBAN binder | 12.04 | fuel and structure (§3.4) |
| Epoxy curing agent | 1.96 | crosslinker for the PBAN |

Total solids loading (AP + Al) is 85.6 %; the polymeric binder system
(PBAN + curing agent) is 14.0 %. Published motor figures: $\rho_p$ implied
around 1,770 kg/m³, $p_c \approx 6.25$ MPa (906.8 psi) nominal, $I_{sp}$ 242 s
SL / 268 s vacuum, burn time ≈ 123–124 s (action time), propellant mass per
booster ≈ 500,000 kg (1,100,000 lb) [NASA-SRB], [WP].

**Two caveats, both instructive.**

*First,* a competing published figure gives AP 69.8 % and iron oxide 0.2 %,
with everything else unchanged. Both sum to 100 %. The temptation is to
dismiss a 0.2-point difference as rounding. Do not: iron oxide is a burn-rate
*catalyst*, and halving its loading is a several-percent change in $r$, which
by Eq. 3.3 becomes a change in $p_c$ amplified by $1/(1-n)$ — for $n = 0.35$,
a factor of 1.54. A 3 % burn-rate change is a ~4.7 % chamber-pressure change
and a corresponding shift in the thrust trace and the burn time. The iron
oxide number is the one number in that table worth checking against a primary
source, precisely because it is the smallest. Use the NASA fact-sheet figures
(69.6 / 0.4) and know the other exists [_verify-solid-coldgas, contested
figures §4].

*Second,* this is a **PBAN** propellant in a motor first flown in 1981, and
the SLS five-segment booster still burns the same PBAN family in 2022 and
after [NASA-SLS-SRB]. That is not conservatism for its own sake — §6 argues
the case.

### 3.11 Signature and hazard class — conceptual

Two classification axes matter to a program and neither is a performance
number.

**Signature.** Conventionally three classes:

- *Smokeless* — no metal and no chlorine. Double-base and nitramine-based
  minimum-signature propellants. No primary smoke (condensed particles from
  the propellant) and negligible secondary smoke (condensation of exhaust
  species in the atmosphere).
- *Reduced smoke* — chlorine-free or low-chlorine, unmetallised. No primary
  smoke; secondary smoke depends on humidity.
- *Smoky* — metallised AP composite. Primary smoke from Al₂O₃, secondary from
  HCl absorbing water. This is every large booster.

Signature is irrelevant to a launch vehicle and can be decisive for a tactical
motor, where a visible trail is a targeting cue and an IR plume is a seeker
cue. It is the main reason the minimum-signature families still exist.

**Hazard class.** In the UN/DoT scheme, **1.3** is a mass-*fire* hazard and
**1.1** is a mass-*detonation* hazard. Standard AP/Al/HTPB composite is 1.3;
nitramine- and nitrate-ester-rich formulations are typically 1.1. The
consequence is not academic: 1.1 material drives quantity-distance separation
at the manufacturing site, transport routing and packaging, magazine
construction, and the cost of every building in the plant. **[J]** A
propellant that gives you 5 s of $I_{sp}$ and takes you from 1.3 to 1.1 has to
be justified against the cost of rebuilding a factory. That is a genuine
reason — not merely an inertial one — why launch vehicles have stayed on
1.3 HTPB composites.

---

## 4. Typical engineering ranges

**Propellant families.** Values are typical published ranges for the family,
not for any specific formulation. $I_{sp}$ figures are quoted at the expansion
ratio stated, because the number is meaningless otherwise.

| family | $\rho_p$ (kg/m³) | $T_c$ (K) | $\bar M$ (kg/kmol) | $I_{sp}$ vac, $\varepsilon\approx10$ (s) | $I_{sp}$ vac, $\varepsilon\approx50$ (s) | mechanical class | signature | hazard class |
|---|---|---|---|---|---|---|---|---|
| Double base (EDB/CDB) | 1,550–1,650 | 2,400–2,900 | 22–25 | 200–215 | 225–245 | brittle, high modulus, poor cold | smokeless | 1.1 |
| AP/HTPB, no metal | 1,650–1,750 | 2,700–3,000 | 23–26 | 235–250 | 265–285 | rubbery, excellent | reduced smoke | 1.3 |
| **AP/Al/PBAN** | 1,750–1,800 | 3,300–3,500 | 27–30 | 255–270 | 285–305 | rubbery, fair cold | smoky | 1.3 |
| **AP/Al/HTPB** | 1,760–1,820 | 3,400–3,600 | 27–30 | 260–275 | 290–305 | rubbery, very good cold | smoky | 1.3 |
| Nitramine CMDB | 1,700–1,800 | 3,000–3,400 | 22–26 | 250–265 | 280–295 | intermediate | reduced / min. smoke | 1.1 |
| NEPE class (aluminized) | 1,800–1,900 | 3,400–3,700 | 25–29 | 265–280 | 295–315 | good, plasticiser-dependent | smoky | 1.1 |

*Confidence.* The family-level $I_{sp}$ and $T_c$ ranges are textbook
consensus [SB §12.3], [Kubota ch. 4–5], [Davenas]; the NEPE row is the least
well-attested in the open literature and should be read as an
order-of-magnitude architectural statement, not a specification.

**Constituent properties.**

| ingredient | density (kg/m³) | oxygen balance | role |
|---|---|---|---|
| AP | 1,950 | ≈ +34 % | oxidizer |
| AN | 1,725 | ≈ +20 % | oxidizer; phase-transition problem |
| ADN | 1,810 | ≈ +26 % | oxidizer, [R] |
| HMX | 1,900 | ≈ −22 % | energetic filler / nitramine |
| Aluminium | 2,700 | strongly negative (pure fuel) | metal fuel |
| HTPB (cured) | ≈ 920 | strongly negative (pure fuel) | binder |
| Al₂O₃ (product) | 3,950 solid | — | condensed exhaust |

**Motor-level ranges** (provenance and confidence in
`reference/_verify-solid-coldgas.md`; migrate to
`reference/engine-database.md` as entries reach confidence B):

| quantity | typical range | who is at the extremes |
|---|---|---|
| Solids loading $\alpha$ | 0.80–0.90 | Shuttle SRB 0.856 [NASA-SRB]; ≈ 0.88 for high-loading HTPB (P120C 19 % Al + 69 % AP) |
| $\rho_p$ | 1,650–1,850 kg/m³ | unmetallised low; aluminized NEPE high |
| $p_c$ | 3–11 MPa | Shuttle SRB ≈ 6.25 MPa nominal, ≈ 6.4 MPa peak |
| $I_{sp}$ (published, flown) | 237–301 s | PSLV S139 237 s SL; M-34b ≈ 301 s vac at high $\varepsilon$ |
| $\varepsilon$ | 7–70 | Shuttle SRB 7.16–7.72; Star 48B long nozzle 54.8–70.4 |
| Condensed fraction $\xi$ | 0.25–0.35 | follows directly from 14–19 % Al |
| Two-phase loss | 1–3 % of $I_{sp}$ | large motors low, small throats high [SP-8039] |
| Overall $I_{sp}$ efficiency | 0.94–0.97 | see WE 19.2 |
| Propellant mass fraction (motor) | 0.82–0.93 | PSLV S139 0.821 (segmented maraging steel); P120C 0.924 (monolithic composite) |

---

## 5. Worked examples

### WE 19.1 — Density impulse: solid versus LOX/RP-1 versus LOX/LH2

**Problem.** A stage must deliver a fixed total impulse. Compare the
propellant *volume* required if it is (a) an aluminized AP/HTPB solid at
$\rho_p = 1{,}770$ kg/m³ with vacuum $I_{sp} = 268$ s, (b) LOX/RP-1 at
mixture ratio 2.34 with vacuum $I_{sp} = 348$ s (Merlin 1D Vacuum), (c)
LOX/LH2 at mixture ratio 6.03 with vacuum $I_{sp} = 452.3$ s (RS-25 at 109 %).
Densities: LOX 1,141 kg/m³, RP-1 810 kg/m³, LH2 70.8 kg/m³, at normal
boiling point or storage conditions [NIST].

**Step 1 — bulk density of a bipropellant.** For a mixture ratio
$MR = \dot m_o/\dot m_f$, one kilogram of fuel is accompanied by $MR$
kilograms of oxidizer, occupying $1/\rho_f + MR/\rho_o$ cubic metres:

$$\rho_{bulk} = \frac{1+MR}{\dfrac{1}{\rho_f} + \dfrac{MR}{\rho_o}}$$

LOX/RP-1:

$$\rho_{bulk} = \frac{1+2.34}{\frac{1}{810} + \frac{2.34}{1141}} = \frac{3.34}{1.2346\times10^{-3} + 2.0508\times10^{-3}} = \frac{3.34}{3.2854\times10^{-3}} = 1{,}016.6\ \mathrm{kg/m^3}$$

LOX/LH2:

$$\rho_{bulk} = \frac{1+6.03}{\frac{1}{70.8} + \frac{6.03}{1141}} = \frac{7.03}{1.41243\times10^{-2} + 5.2848\times10^{-3}} = \frac{7.03}{1.94091\times10^{-2}} = 362.2\ \mathrm{kg/m^3}$$

**Step 2 — density impulse**, $I_d = \rho_p I_{sp}$:

| propellant | $\rho$ (kg/m³) | $I_{sp}$ vac (s) | $I_d$ (kg·s/m³) |
|---|---|---|---|
| AP/Al/HTPB solid | 1,770 | 268 | **474,400** |
| LOX/RP-1 | 1,016.6 | 348 | **353,800** |
| LOX/LH2 | 362.2 | 452.3 | **163,800** |

**Step 3 — read the ratios.** The solid delivers 1.34× the impulse per unit
volume of LOX/RP-1 and **2.90×** that of LOX/LH2, despite delivering 0.77× and
0.59× the impulse per unit *mass* respectively.

**Step 4 — put it in engineering terms.** For $10^{9}$ N·s of total impulse
(roughly one Shuttle SRB), the required propellant volume is
$I_{tot}/(g_0 I_d)$:

- solid: $10^{9}/(9.80665 \times 474{,}400) = 215\ \mathrm{m^3}$
- LOX/RP-1: $10^{9}/(9.80665 \times 353{,}800) = 288\ \mathrm{m^3}$
- LOX/LH2: $10^{9}/(9.80665 \times 163{,}800) = 623\ \mathrm{m^3}$

**Sanity check.** A Shuttle SRB carries ≈ 500,000 kg of propellant at 1,770
kg/m³, i.e. ≈ 283 m³, in a 3.71 m diameter case — that is an equivalent solid
column about 26 m long inside a 45.5 m booster, which is the right order for a
case with a large central perforation and inert ends. The 215 m³ figure above
is the *ideal* volume with no bore, no slivers, no ullage; the real motor's
283 m³ is that number after grain design (Module 21) takes its share. The
comparison also explains a familiar picture: the Shuttle stack's LH2 tank
dwarfs either SRB, and the SRBs still deliver more impulse. [F]

### WE 19.2 — Ideal $I_{sp}$ from assumed CEA-like products, and the reconciliation

**Problem.** Assume a CEA run on a Shuttle-SRB-class AP/Al/PBAN propellant at
$p_c = 6.25$ MPa returns chamber products with $T_c = 3{,}400$ K,
$\bar M = 27.5$ kg/kmol, and a frozen $\gamma = 1.18$. The nozzle has
$\varepsilon = 7.72$. Compute ideal sea-level and vacuum $I_{sp}$ and compare
with the published 242 s SL / 268 s vacuum [NASA-SRB], [WP].

**Step 1 — specific gas constant.**

$$R = \frac{R_u}{\bar M} = \frac{8314.46}{27.5} = 302.34\ \mathrm{J/(kg\,K)}$$

**Step 2 — characteristic velocity.** With
$\Gamma = \sqrt{\gamma}\,(2/(\gamma+1))^{(\gamma+1)/(2(\gamma-1))}$ at
$\gamma = 1.18$, $\Gamma = 0.6446$:

$$c^* = \frac{\sqrt{R T_c}}{\Gamma} = \frac{\sqrt{302.34 \times 3400}}{0.6446} = \frac{1{,}013.9}{0.6446} = 1{,}572.9\ \mathrm{m/s}$$

**Step 3 — exit conditions.** Inverting the isentropic area relation at
$\varepsilon = 7.72$, $\gamma = 1.18$ gives $M_e = 3.048$, and

$$p_e = \frac{p_c}{\left(1+\tfrac{\gamma-1}{2}M_e^2\right)^{\gamma/(\gamma-1)}} = 1.163\times10^{5}\ \mathrm{Pa}$$

which is $1.15\,p_a$ at sea level — the SRB nozzle is slightly
*under*-expanded at liftoff, which is the correct design choice for a booster
that spends its whole life climbing.

**Step 4 — thrust coefficients.**

$$C_F = \sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}\left[1-\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]} + \frac{p_e-p_a}{p_c}\varepsilon$$

- sea level ($p_a = 101{,}325$ Pa): $C_F = 1.594$
- vacuum ($p_a = 0$): $C_F = 1.719$

**Step 5 — ideal $I_{sp}$.** $I_{sp} = c^* C_F/g_0$:

- sea level: $1572.9 \times 1.594 / 9.80665 = \mathbf{255.6\ s}$
- vacuum: $1572.9 \times 1.719 / 9.80665 = \mathbf{275.7\ s}$

**Step 6 — reconcile with the published figures.** Efficiency
$\eta = I_{sp,\text{published}} / I_{sp,\text{ideal}}$:

- sea level: $242/255.6 = 0.947$
- vacuum: $268/275.7 = 0.972$

**Step 7 — name the losses.** The ≈ 3 % vacuum shortfall decomposes roughly as
[SP-8039], [SB §12.4]:

| loss | typical magnitude | mechanism |
|---|---|---|
| Two-phase flow | 1–3 % | condensed Al₂O₃ velocity and thermal lag (§3.6, WE 19.3) |
| Nozzle divergence | 1–2 % | non-axial exit momentum; $\lambda_{div} = (1+\cos\alpha)/2$ for a conical cone |
| Boundary layer and friction | 0.5–1.5 % | viscous drag on the nozzle wall |
| Incomplete combustion, heat loss to insulation | 0.5–1 % | finite residence time |
| Throat erosion over the burn | ≈ 1 % on burn-average $I_{sp}$ | $A_t$ grows, $\varepsilon$ falls, $C_F$ falls |

That sums to 3–8 %, bracketing the observed 2.8–5.3 %, which is as close as an
ideal calculation gets.

**Sanity check.** A 95 % overall $I_{sp}$ efficiency is the number to carry for
a well-designed aluminized solid booster; a liquid engine with a well-mixed
injector reaches 97–98 %, and the difference is almost entirely the condensed
phase.

*Note on the two efficiencies.* The sea-level number (0.947) is worse than the
vacuum number (0.972) because the sea-level figure includes the pressure-thrust
term, which is small, of either sign, and very sensitive to the assumed
$\gamma$. The vacuum comparison is the cleaner one and is the one to quote.

### WE 19.3 — Bracketing the two-phase flow loss

**Problem.** For the Shuttle-SRB composition (16 % Al by mass), compute the
condensed-phase mass fraction $\xi$, then bracket the two-phase $I_{sp}$ loss
between the *equilibrium* limit (particles perfectly coupled to the gas in
velocity and temperature) and the *fully-lagging* limit (particles contribute
mass but no momentum).

**Step 1 — condensed mass fraction.** Aluminium burns to alumina:

$$2\,\mathrm{Al} + \tfrac{3}{2}\,\mathrm{O_2} \rightarrow \mathrm{Al_2O_3}$$

Per kilogram of propellant, 0.16 kg of Al produces

$$m_{\mathrm{Al_2O_3}} = 0.16 \times \frac{101.96}{2 \times 26.98} = 0.16 \times 1.8896 = 0.3023\ \mathrm{kg}$$

$$\xi = 0.302$$

Thirty percent of the exhaust mass is not a gas. This assumes all aluminium
burns and that the AP, being oxygen-rich, supplies the oxygen.

**Step 2 — gas-phase and mixture properties.** Take the gas phase alone as
$c_{p,g} = 2{,}000$ J/(kg·K), $\bar M_g = 24$ kg/kmol, so
$R_g = 8314.46/24 = 346.4$ J/(kg·K) and
$\gamma_g = c_{p,g}/(c_{p,g}-R_g) = 2000/1653.6 = 1.210$.
Take molten alumina as $c_s = 1{,}400$ J/(kg·K).

With the condensed phase in thermal and velocity equilibrium:

$$c_{p,mix} = (1-\xi)c_{p,g} + \xi c_s = 0.698(2000) + 0.302(1400) = 1{,}818.6\ \mathrm{J/(kg\,K)}$$

$$R_{eff} = (1-\xi)R_g = 0.698 \times 346.4 = 241.7\ \mathrm{J/(kg\,K)}$$

$$\gamma' = \frac{c_{p,mix}}{c_{p,mix}-R_{eff}} = \frac{1818.6}{1818.6-241.7} = 1.153$$

> Note what $\gamma'$ does: adding an incompressible, heat-absorbing condensed
> phase drives the effective ratio of specific heats *down* toward 1. The
> condensed phase acts as thermal ballast that keeps the flow hot as it
> expands, which is why a two-phase nozzle behaves like a low-$\gamma$ nozzle.

**Step 3 — equilibrium limit.** At $\varepsilon = 7.72$ with $\gamma' = 1.153$,
inverting the area relation gives $p_e/p_c = 0.0199$. The momentum-only
exhaust velocity is

with $(\gamma'-1)/\gamma' = 0.1329$, so $(p_e/p_c)^{0.1329} = 0.5942$ and the
bracket is $0.4058$:

$$c_{eq} = \sqrt{2\,c_{p,mix}\,T_c\left[1-\left(\tfrac{p_e}{p_c}\right)^{(\gamma'-1)/\gamma'}\right]} = \sqrt{2(1818.6)(3400)(0.4058)} = 2{,}240\ \mathrm{m/s}$$

**Step 4 — fully-lagging limit.** The particles receive no acceleration and no
heat exchange: they contribute their mass to $\dot m$ but nothing to thrust,
and the gas expands with its own $\gamma_g$ and $c_{p,g}$ over the same
pressure ratio:

Here $(\gamma_g-1)/\gamma_g = 0.1732$, so $(p_e/p_c)^{0.1732} = 0.5074$ and the
bracket is $0.4926$:

$$c_{lag} = (1-\xi)\sqrt{2\,c_{p,g}\,T_c\left[1-\left(\tfrac{p_e}{p_c}\right)^{(\gamma_g-1)/\gamma_g}\right]} = 0.698 \times 2{,}588 = 1{,}806\ \mathrm{m/s}$$

**Step 5 — the bracket.**

$$\frac{c_{lag}}{c_{eq}} = \frac{1806}{2240} = 0.806 \quad\Rightarrow\quad \text{maximum possible two-phase loss} = 19.4\ \%$$

**Step 6 — where real motors sit.** Define a coupling efficiency $\lambda$
such that $c = \lambda c_{eq} + (1-\lambda)c_{lag}$. The fractional loss
relative to equilibrium is then $(1-\lambda)(1 - c_{lag}/c_{eq}) =
0.194(1-\lambda)$:

| $\lambda$ | loss versus equilibrium |
|---|---|
| 0.85 | 2.9 % |
| 0.90 | 1.9 % |
| 0.95 | 1.0 % |

A large booster with fine aluminium (a few micrometres, so the particle
relaxation time is short compared with the nozzle residence time) sits at
$\lambda \approx 0.90$–0.95, i.e. **1–2 % loss**, which is exactly the range
the literature quotes [SP-8039].

**Sanity check and the honest limits of this model.** The 19.4 % bracket is
not a prediction; it is a bound, and its value is that the *whole* two-phase
question lives inside a 19 % envelope of which real motors give away one to
three points. The absolute $c_{eq}$ here (2,240 m/s, i.e. 228 s) is *not*
comparable with WE 19.2's 275.7 s, because this model drops the
pressure-thrust term and uses a different property set — use it for the
**ratio only**. The model also assumes a single droplet size, no breakup or
coalescence, and no recovery of particle thermal energy in the divergent
section. Real two-phase nozzle codes integrate the coupled gas–particle
momentum and energy equations (the SP-8039 method, and every modern SRM
performance code) and *produce* $\lambda$ rather than assuming it.

### WE 19.4 — What aluminium is actually worth

**Problem.** Using the ideal method of WE 19.2, compare an unmetallised
AP/HTPB propellant ($T_c = 2{,}900$ K, $\bar M = 25$, $\gamma = 1.24$) with an
aluminized AP/Al/PBAN propellant ($T_c = 3{,}400$ K, $\bar M = 27.5$,
$\gamma = 1.18$), both at $p_c = 6.25$ MPa, at two expansion ratios; then
charge the aluminized case the two-phase loss from WE 19.3.

**Step 1 — ideal vacuum $I_{sp}$.**

| propellant | $c^*$ (m/s) | $I_{sp}$ vac, $\varepsilon = 7.72$ | $I_{sp}$ vac, $\varepsilon = 50$ |
|---|---|---|---|
| AP/HTPB, no metal | 1,496.6 | 257.8 s | 283.8 s |
| AP/Al/PBAN | 1,572.9 | 275.7 s | 308.9 s |
| ideal gain from Al | +76.3 | **+17.9 s** | **+25.1 s** |

Note that the aluminized propellant's $c^*$ advantage is only 5.1 % even
though $T_c$ is 500 K higher: the higher $\bar M$ eats most of the temperature
gain, exactly as Eq. 3.4 predicts. The rest of the $I_{sp}$ gain comes from
the lower $\gamma$ raising $C_F$.

**Step 2 — charge the two-phase loss** at $\lambda = 0.90$ (1.9 %, WE 19.3):
$308.9 \times 0.981 = 303.0$ s at $\varepsilon = 50$.

**Step 3 — net.** $303.0 - 283.8 = +19.2$ s. Aluminium still wins by about
19 s of the 25 s it promised: you pay back roughly a quarter of the gain in
two-phase losses, plus throat erosion and plume signature that this
calculation does not price.

**Sanity check.** A real high-expansion aluminized HTPB upper-stage motor —
Zefiro 9A, published 295.9 s vacuum — sits about 7 s below the 303 s this
calculation gives after two-phase losses, which is the right size for
divergence, boundary-layer, and throat-erosion losses on top. The unmetallised
prediction of ≈ 284 s ideal, less ≈ 3 % for the remaining losses, gives
≈ 275 s, and unmetallised reduced-smoke motors are indeed quoted in that
region. Both ends of the comparison land where they should. [A]

---

## 6. Real engines — "why did they design it that way?"

### 6.1 Shuttle SRB / RSRM: PBAN in 1973, and PBAN again in 2022

**The choice.** Thiokol's Shuttle booster propellant is
AP 69.6 / Al 16.0 / Fe₂O₃ 0.4 / PBAN 12.04 / epoxy 1.96 [NASA-SRB]. HTPB was
available and understood by the mid-1970s. NASA and Thiokol chose PBAN anyway,
and Northrop Grumman's SLS five-segment booster still burns the same family
[NASA-SLS-SRB].

**The alternatives at the time.** CTPB, then being displaced; HTPB, then new.
HTPB offers higher achievable solids loading, better low-temperature strain
capability, and lower uncured viscosity.

**Why PBAN made sense in 1973.** [J]

1. **Heritage.** PBAN was the propellant of the Titan III UA120 boosters, the
   largest solids then flying. Thiokol had a qualified mix, a qualified
   process, a qualified cure cycle, and years of ballistic data at booster
   scale. For a program whose booster was the largest solid motor ever built,
   the propellant was the part they most wanted to be boring.
2. **The performance delta is small at booster $\varepsilon$.** The SRB nozzle
   is $\varepsilon \approx 7.16$–7.72. At that expansion a family change from
   PBAN to HTPB is worth a few seconds — WE 19.4 gives the scale of the
   family-level spread — on a vehicle where the booster contributes about
   70 % of liftoff thrust for two minutes and is then dropped. The Shuttle's
   performance problem was never the SRB's $I_{sp}$.
3. **PBAN's known weakness did not appear to bind.** PBAN's inferior
   cold-temperature strain capability matters for a missile stored in a silo
   at −30 °C. It does not obviously bind for a booster assembled indoors and
   launched from Florida. That reasoning is defensible — and it is also
   exactly the class of reasoning that the Challenger accident falsified, not
   for the propellant but for the *elastomeric O-rings* in the field joints:
   the same error (assume the Florida environment is benign) applied to a
   different component [Rogers86].
4. **Hazard class.** 1.3, with all that implies for a facility in Utah that
   ships loaded segments by rail.

**Would a modern engineer choose the same?** For a clean-sheet booster, no —
HTPB, as everyone else did. But NASA's decision for SLS is not a clean sheet:
the five-segment booster reuses refurbished Shuttle-era D6AC steel case
segments, the same casting facility and tooling, and the same propellant
[NASA-SLS-SRB]. The lesson recurs through Part III: the propellant is chosen
jointly with the case, the insulation, the process, and the qualification
base. A 25 % propellant increase from the fifth segment, plus a redesigned
nozzle, bought more performance than a chemistry change would have, at a
fraction of the requalification cost. Note what *did* change for SLS:
asbestos-free insulation and a new liner configuration — i.e. the things whose
supply chain forced a change, not the things that would have improved
performance.

### 6.2 Titan UA1207 → SRMU: the cleanest controlled experiment in the field

**The choice.** Titan IV-A used UA1207 boosters: PBAN, segmented steel case,
liquid-injection TVC. Titan IV-B used the SRMU: HTPB, graphite/epoxy
filament-wound case in three segments, gimballed nozzle
[_verify-solid-coldgas A.4].

**Why it is instructive.** Same vehicle, same job, same diameter class, one
generation apart, and *every* propulsion architecture choice changed at once.
The reported $I_{sp}$ went from 272 s to 286 s — roughly +14 s — with a large
inert-mass saving on top.

**How much of the +14 s is the propellant?** Not all of it, and that is the
teaching point. A generation change from PBAN to HTPB is worth a few seconds
at equal $\varepsilon$; the rest came from the nozzle and the motor design.
Attributing the whole delta to chemistry is the standard student error.
**[J]** When you see a two-generation performance jump, decompose it into
$c^*$ (chemistry) and $C_F$ (nozzle and expansion) before crediting anything.

*Provenance warning.* The verification file marks all Titan UA120/SRMU numbers
as needing a primary source, and notes that the commonly quoted 14.234 MN and
15.12 MN thrust figures are **per-vehicle (two boosters)**, not per-motor
[_verify-solid-coldgas A.4]. Treat the 272 s / 286 s pair as indicative.

### 6.3 P120C: HTPB 1912 and what a monolithic case lets you do

**The choice.** The P120C — Vega-C first stage and Ariane 6 strap-on — burns
"HTPB 1912": Al 19 %, AP 69 %, HTPB 12 %, in a **monolithic carbon-fibre
filament-wound case** with no segments and no field joints
[_verify-solid-coldgas A.6]. Published: ≈ 4,780 kN maximum vacuum thrust
`/motor`, ≈ 280 s $I_{sp}$, 141,400 kg propellant, 153,000 kg gross — a
**propellant mass fraction of 0.924**.

**Why the composition looks the way it does.** Compare with the SRB: 19 % Al
against 16 %, 12 % binder against 14 % binder-plus-curative. Higher metal
loading and lower binder fraction is a straight energy-and-density trade that
HTPB's processing and mechanical margin permits and PBAN's does not — HTPB
tolerates a higher solids loading at castable viscosity and gives back enough
low-temperature strain capability that you can afford to spend some of it on
filler.

**Why it matters far more than the chemistry.** 0.924 against ≈ 0.85 for a
segmented steel booster is the single most consequential number-pair in Part
III. Going from 0.85 to 0.924 at fixed propellant mass removes roughly half
the inert mass. In $\Delta v$ terms that dwarfs the two or three seconds of
$I_{sp}$ separating any two composite families. **Solid-motor performance is
not won in the propellant; it is won in the case.** [J]

**Would a modern engineer choose the same?** Yes, and everyone does: GEM-63XL,
Zefiro, Orion, SRB-A3 and Castor 120 are all HTPB composite in filament-wound
composite cases. The exception is the very largest motors, where segmentation
is forced by transport — you cannot ship a monolithic 3.7 m × 45 m motor by
rail — and steel wins on cost per segment.

### 6.4 Minuteman I → II → III: generational propellant families, architecture only

**The architecture, as published** [FAS], [_verify-solid-coldgas A.17]: all
three stages of all three generations use **AP/Al composite propellant**;
stage 1 is a PBAN-class polybutadiene composite (Thiokol M55/M55A1), and the
upper stages moved to higher-energy binder systems across generations. Case
materials went from steel (stage 1, unchanged) to titanium and then to
filament-wound composite on the upper stages. TVC went from four gimballed
nozzles on stage 1 to liquid injection on stages 2 and 3.

**Why the propellant grades upward with stage number.** This is a general rule
worth internalising, and it falls straight out of the rocket equation. A stage
that acts late in the trajectory multiplies its $I_{sp}$ improvement by all
the mass it is still carrying, and its own inert mass is a larger fraction of
the remaining vehicle. An extra second of $I_{sp}$ on an upper stage is worth
several times what it is worth on a first stage. Simultaneously, upper stages
are smaller, so a hazard-class or cost penalty on a small propellant charge is
cheaper to absorb. **So: cheap, robust, 1.3-class propellant low; expensive,
high-energy, possibly 1.1-class propellant high.** [J] Every multi-stage solid
vehicle in the open literature — Minuteman, Peacekeeper, Trident, M-V, Vega —
shows this gradient.

**Why stage 1 never changed.** Stage 1 is the largest propellant charge, the
one whose $I_{sp}$ matters least per second, the one whose handling and
storage cost scales worst with hazard class, and the one with the most flight
history. Thirty years of Minuteman III service on an essentially unchanged
M55A1 stage 1 is the same argument as PBAN on SLS, made by a different
customer for a different reason.

**Scope note.** Nothing beyond family names, case material families, and TVC
concepts is recorded here, per the Part III scope boundary. The specific
propellant grades of the Minuteman upper stages are not in the open literature
in a form this course would quote, and the verification file marks the case
progression itself as confidence C.

### 6.5 Trident II D-5: NEPE, and what it bought

**The choice.** Open sources identify the D-5 propellant as **NEPE-75**, and
the case material as graphite/epoxy on stages 1 and 2, with stage 3 changed
from Kevlar/epoxy to graphite/epoxy in 1988 for two stated reasons:
inert-mass reduction *and* elimination of an electrostatic potential
difference between Kevlar and graphite [FAS] (confidence B).

**Why NEPE here and nowhere in commercial launch.** A submarine-launched
missile's binding constraint is *volume*, brutally: the missile must fit a tube
of fixed diameter and length in a hull, and range is what that tube buys. That
is exactly the constraint under which density impulse (Eq. 3.5) is the right
figure of merit and the marginal seconds are worth almost any handling cost.
Add a program that already operates 1.1-class material inside a controlled
naval supply chain, and the 1.3-versus-1.1 argument of §3.11 flips.

**Would a modern engineer choose the same?** For that mission, yes. For a
commercial launcher, no — and nobody has. The asymmetry is the point.

**And the naming trap.** The Trident "aerospike" is a **telescoping
drag-reduction spike deployed from the nose**, reportedly cutting frontal drag
by about 50 %. It is not an aerospike nozzle and has nothing to do with nozzle
design [_verify-solid-coldgas A.17]. Students confuse these every year.

### 6.6 Ariane 5 EAP → P120C: the European arc, and a warning about published numbers

The Ariane 5 EAP burned an HTPB composite published by ESA as
AP 68 % / Al 18 % / HTPB 14 % [ESA-EAP], in a **steel** segmented case, and
the P230 → P238 → P241 series squeezed performance out of a frozen case design
by increasing the propellant load and raising $\varepsilon$ from 9.7 to 11.0 —
**no chemistry change at all** [_verify-solid-coldgas A.5]. The P120C then
changed the case (monolithic composite), the process (single cast), and the
composition slightly (19/69/12), and moved the mass fraction from ≈ 0.85 to
0.924.

**The warning.** Wikipedia lists the EAP "propellant mass" as 270,000 and
273,000 kg for the P238 and P241. Those are *gross* masses. The designation
P*nnn* is by construction the propellant load in tonnes: 238 t and 241 t. If
you compute a mass fraction from the mislabelled figure you will get a
nonsense answer and nothing will tell you so [_verify-solid-coldgas, contested
figures §2].

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The four trades that recur

| trade | one side | other side | who decides |
|---|---|---|---|
| Binder fraction | less binder → higher $\rho_p$, higher $I_{sp}$ | more binder → higher strain capability, castable viscosity, longer life | structural analysis of the grain at the cold spec temperature |
| Aluminium loading | more Al → higher $T_c$, higher $\rho_p$, more acoustic damping | more Al → more two-phase loss, more throat erosion, bigger signature | motor size (residence time) and nozzle material |
| Oxidizer particle size | finer → faster burn, higher $r$ | coarser → higher achievable solids loading, lower viscosity | the $r$ the grain design requires (Module 21) |
| Energy versus hazard class | nitramine / nitrate ester → more energy per unit volume | 1.3 → 1.1 costs facilities, transport, storage | the program, not the propulsion group |

### 7.2 Failure modes

**Grain cracking (thermal).** *Mechanism:* the propellant's coefficient of
thermal expansion is an order of magnitude above the case's; cooling from the
stress-free cure temperature to cold storage puts the bore surface in tension.
If the strain exceeds $\varepsilon_m$ at that temperature — which falls with
age (§3.4) — the bore cracks. *Symptom:* on ignition, burning surface far
above design, chamber pressure spike, possible case burst. *Evidence:*
pre-flight X-ray or CT of the grain; post-failure, a pressure trace that
departs upward from the predicted trace within the first second. *Fix:*
stress-relieving grain geometry (fillets at the bore, radiused star tips),
lower-modulus binder, raise the cold spec temperature, or condition the motor
before launch.

**Bond-line failure (liner / insulation debond).** *Mechanism:* the grain is
bonded to a liner, which is bonded to insulation, which is bonded to the case.
Plasticiser migration, moisture, poor surface preparation, or simple cyclic
strain concentration at the grain ends opens an unbond. *Symptom:* burning
propagates into the unbond, exposing insulation and eventually case to the
flame; burn-through. *Evidence:* ultrasonic or X-ray inspection at the bond
line; on a static test, a localised case temperature rise ahead of any
pressure anomaly. *Fix:* stress-relief flaps or boots at the grain ends,
bond-line surveillance in the aging program, formulation control on migrating
species.

**Voids and porosity.** *Mechanism:* air entrained during mixing or casting.
*Symptom:* a void intersected by the burning surface adds area abruptly, giving
a pressure spike partway through the burn. *Evidence:* radiography; cured
density below nominal. *Fix:* vacuum casting — process, not formulation, and
so Module 25.

**Ballistic anomaly from ingredient variation.** *Mechanism:* AP particle-size
distribution or catalyst loading drifts between lots. *Symptom:* the motor
runs off its predicted $p_c$ trace — hot or cold — with correspondingly
shorter or longer burn time, at nearly constant total impulse. *Evidence:*
strand-burner and subscale-motor ballistic data per lot; the pressure trace
itself. *Fix:* lot acceptance testing against $r(p)$ at specified
temperatures, with the whole batch traced.

**Aging-driven embrittlement.** Mechanisms in §3.4. *Symptom:* the motor is
fine until the day it is fired cold. *Evidence:* periodic destructive tensile
testing of surveillance samples and, increasingly, non-destructive modulus
measurement — but see problem P17 for where a bulk-sample program goes blind.

### 7.3 Materials

The materials story of a solid propellant is short. The binder is a
polybutadiene or polyether elastomer chosen for $T_g$, cure control, and
prepolymer viscosity. The oxidizer is a crystalline salt chosen for oxygen
balance, density, and thermal stability. The metal is aluminium because
nothing else combines aluminium's oxide heat of formation, density,
availability, and tolerable handling as a powder. Boron and beryllium are the
recurring alternatives — boron for heat of combustion per unit mass,
beryllium for genuinely excellent theoretical performance — and both fail on
real grounds: boron's oxide is a liquid that blankets the particle and
impedes further combustion, and beryllium's combustion products are acutely
toxic, which ended that argument in the 1960s. [H]

The materials that the propellant *drives* are more consequential than the
propellant's own: alumina-laden exhaust at 3,400 K sets the nozzle throat
material (Module 24), and the propellant's thermal expansion and modulus set
the insulation and liner requirements (Module 23).

### 7.4 Manufacturing — what it limits, not how it is done

Two process facts constrain the formulator and belong here because they bound
§3.4.

1. **Castable viscosity.** The uncured mix must flow into the case around a
   mandrel. Viscosity rises steeply and non-linearly with solids loading; at
   some loading the mix will not fill the mould before it gels, and that
   loading — not any chemical limit — is the true ceiling on $\alpha$. A
   binder with lower prepolymer viscosity therefore *directly* buys density
   and $I_{sp}$.
2. **Pot life and cure temperature.** The mix has a working time before
   crosslinking makes it uncastable. The cure schedule sets the *stress-free
   temperature* of the grain, which is the reference from which all the
   thermal strain of §7.2 is measured. Lowering the cure temperature directly
   reduces thermal-strain loading, and formulators care about it for that
   reason and not for throughput.

Detailed processing is out of scope for this course; Module 25 covers the
manufacturing *science* at the same level of abstraction.

### 7.5 Testing: what is measured on a propellant

| measurement | instrument | what a bad result looks like |
|---|---|---|
| Burn rate versus pressure, $r(p)$ | **strand burner** (Crawford bomb): an inhibited propellant strand burned in a pressurised nitrogen vessel with wire-break timers | $n$ drifting up between lots; $a$ off nominal, which shifts the whole $p_c$ trace by the $1/(1-n)$ amplification |
| Ballistic verification at scale | subscale ballistic test motor, typically a few to tens of kilograms | $p_c$ trace departing from prediction; strand data never transfers perfectly, because a strand burner has no crossflow and therefore no erosive burning |
| Temperature sensitivity $\sigma_p$ | strand burner or test motor conditioned at cold, ambient, and hot spec temperatures | $\sigma_p$ much above ~0.003 K⁻¹ makes the cold-day/hot-day thrust spread unmanageable |
| Uniaxial tensile: $\sigma_m$, $\varepsilon_m$, modulus | JANNAF-class dogbone specimen, controlled crosshead rate, temperature chamber | $\varepsilon_m$ falling with age below the value the grain structural analysis assumed |
| Cured density | immersion or helium pycnometry | density below nominal implies voids, which implies unplanned burning surface |
| Hazard classification | card-gap and the standard UN test series | reclassification from 1.3 to 1.1, which is a program-level event, not a test result |
| Aging | accelerated aging at elevated temperature plus real-time surveillance of stored units | divergence between the Arrhenius extrapolation and the real-time data — always trust real time |

The single most useful plot in solid propellant work is $\log r$ versus
$\log p_c$: a straight line whose slope is $n$ and whose intercept is $a$.
Curvature at the top of the range is the signature of a plateau or mesa
formulation; scatter between nominally identical lots is the signature of a
process control problem, not a chemistry problem.

---

## 8. Misconceptions and what engineers actually care about

**"Solid propellant is fuel and oxidizer powders pressed together."** No. A
composite propellant is a *cast, crosslinked elastomeric composite*: the
binder is a continuous cured polymer network in which the oxidizer and metal
are dispersed, and the result is a rubber, not a powder compact. Double-base
propellant is not even heterogeneous — it is a plasticised homogeneous
nitrate-ester solid. Pressed powders are pyrotechnics and gun propellants, and
they are a different subject.

**"The binder is inert filler holding the oxidizer together."** The binder is
a fuel, and a hydrogen-rich one that does more per unit mass to reduce $\bar M$
than anything else in the formulation. It is also the entire structure. Two
jobs, both essential.

**"HTPB is a higher-energy binder than PBAN, which is why it gives more
$I_{sp}$."** The energy difference between polybutadiene backbones is small.
HTPB's advantage is mechanical and rheological: it permits a higher solids
loading at castable viscosity and gives better low-temperature strain
capability. The $I_{sp}$ gain is bought mostly by the extra solids, not by the
binder chemistry.

**"Aluminium is added to raise $I_{sp}$."** It raises $T_c$ and $\rho_p$ and
damps combustion instability; whether it raises $I_{sp}$ depends on the motor,
because the two-phase loss must be subtracted. WE 19.4 shows the balance is
clearly favourable for a large booster and gets tighter for small motors with
small throats. Aluminium is added for **density impulse and stability** at
least as much as for $I_{sp}$.

**"A solid motor cannot be shut down."** It can, exactly once, by destroying
its own pressure balance: thrust-termination ports, opened by shaped charges
in the forward dome, drop $p_c$ below the deflagration limit. Minuteman's
third stage and the crewed Titan IIIM configuration both carried them
[_verify-solid-coldgas A.17]. It is violent, one-shot, and structurally
destructive, and it is the only shutdown mechanism there is.

**"The specific impulse of HTPB propellant is 280 s."** There is no such
number. $I_{sp} = c^* C_F/g_0$, and $C_F$ belongs to the nozzle and the
altitude. The same propellant gives ≈ 250 s at $\varepsilon = 7$ at sea level
and ≈ 300 s at $\varepsilon = 50$ in vacuum. Star 48B's two published figures
(286.2 and 292.2 s) are the same motor with two nozzles.

**"A 0.2 % difference in a published composition is rounding."** Not if the
constituent is a catalyst. See §3.7 and §3.10.

**"Solid propellants are less efficient because they burn incompletely."**
Combustion efficiency in a solid motor is typically excellent — fuel and
oxidizer are premixed at micrometre scale, which is the mixing quality a
liquid injector spends its entire design life trying to approximate. The
240–300 s band is set by product molar mass (§3.9) and two-phase losses
(§3.6), not by unburned propellant.

### What engineers actually care about

1. **Strain capability at the cold spec temperature, as a function of age.**
   This is the number that ends motor service lives. Everything in an aging
   surveillance program exists to track it.
2. **$r$, $n$, and $\sigma_p$, lot to lot.** These set the pressure trace, and
   the pressure trace sets whether the case, the nozzle, and the vehicle
   structure see the loads they were designed for. A lot that burns 3 % fast
   is a real problem, amplified by $1/(1-n)$.
3. **Density impulse, not $I_{sp}$.** In almost every application where a
   solid is the right answer, case volume is the binding constraint and
   $\rho_p I_{sp}$ is the figure of merit (§3.8, WE 19.1).
4. **Hazard class.** It sets the cost of the factory, the transport, and the
   storage, and it is decided by the formulation.
5. **Bond-line integrity.** Not the propellant in the middle of the grain —
   the half-millimetre where propellant meets liner meets insulation meets
   case. That is where motors fail.

---

## 9. Mastery levels

**Level 1 — Familiarity.**
Explain in plain language why a solid motor's chamber pressure is set by
$K_n$ and the propellant and cannot be changed in flight. Name the four
constituents of a composite propellant and what each does. State that flown
solids give 240–300 s and that liquid hydrogen engines give about 450 s, and
give one physical reason. Name two real motors and their propellant family.

**Level 2 — Working engineering knowledge.**
Given $T_c$, $\bar M$, $\gamma$, $p_c$, and $\varepsilon$, compute ideal
$I_{sp}$ via $c^*$ and $C_F$ and state the loss mechanisms that separate it
from a published figure. Compute condensed-phase mass fraction from an
aluminium loading and bracket the two-phase loss. Compute and compare density
impulse across propellant classes with correct bulk-density arithmetic. Quote
from memory: typical solids loading, typical $\rho_p$, typical $n$, typical
$\xi$, the 1.3/1.1 distinction, and the binder progression with its driver.
Read a published composition and say what each ingredient is doing.

**Level 3 — Interview mastery.**
Given an unfamiliar motor's application — a silo-stored strategic stage, a
tactical seeker-defeating missile, an apogee kick motor, a commercial strap-on
— argue from first principles to a propellant family, a binder, a metal
loading, and a hazard class, and state what you would measure to confirm the
choice. Given a motor that ran 5 % hot, produce a ranked list of causes
spanning formulation, process, grain structural failure, and instrumentation,
and say what evidence discriminates them. Given a claimed performance
improvement, decompose it into $c^*$ and $C_F$ contributions before crediting
the chemistry. Argue both sides of "should this stage use a NEPE-class
propellant?" and name the program constraint that actually decides it.

---

## 10. Problems

### Conceptual

**P1.** A propellant is proposed with $n = 1.05$. Explain, from Eq. 3.3, what
happens to the motor and why no flown propellant has this property. What
physical mechanism in a composite propellant tends to keep $n$ near 0.35?

**P2.** A formulator proposes removing all the aluminium from a large booster
propellant, to eliminate the plume signature and the alumina throat erosion.
List the four consequences, in order of how much trouble each causes, and say
which one is likely to end the proposal.

**P3.** Explain, mechanistically, why oxidizer particle size distribution is a
first-order ballistic variable in a composite propellant and has no analogue in
a double-base propellant.

**P4.** A twenty-year-old strategic motor and a freshly cast one are chemically
analysed and found identical in composition. State what has nevertheless
changed, by what three mechanisms, and which measurement would detect it.

**P5.** Why does the propellant grade to higher energy as you go up the stages
of a multi-stage solid vehicle, while the first stage is left alone for
decades? Give both the rocket-equation argument and the program-cost argument.

**P6.** HCl makes up roughly 15–20 % of the exhaust mass of an APCP motor.
Explain both performance consequences of this — there are two distinct ones —
and say what a chlorine-free oxidizer would fix and what it would not.

**P7.** A student states that "the SRB and the RS-25 both run at about 3,400 K,
so the difference in $I_{sp}$ must be the nozzle." Correct this in three
sentences with a quantitative argument.

### Calculation

**P8.** A composite propellant contains 18 % aluminium by mass. Compute the
condensed-phase mass fraction $\xi$ of the exhaust, assuming complete
combustion to Al₂O₃. Compare with the Shuttle SRB's value and state what the
difference does to the two-phase loss at fixed coupling efficiency.

**P9.** A propellant has $\rho_p = 1{,}810$ kg/m³ and delivers 292 s vacuum
$I_{sp}$ at $\varepsilon = 55$. A LOX/CH₄ stage at $MR = 3.6$ delivers 380 s
vacuum; LOX 1,141 kg/m³, LCH₄ 423 kg/m³. Compute both density impulses and the
propellant volume each needs for $2.0\times10^{7}$ N·s of total impulse.

**P10.** Using Eq. 3.4 and the ideal $C_F$ relation, compute the ideal vacuum
$I_{sp}$ of a propellant with $T_c = 3{,}550$ K, $\bar M = 28.2$ kg/kmol,
$\gamma = 1.17$, at $p_c = 9.0$ MPa and $\varepsilon = 16$. Then compute the
overall efficiency required to match a published figure of 280 s, and say
whether that efficiency is credible.

**P11.** A motor's propellant has $n = 0.32$. A new lot of oxidizer raises the
burn rate by 4 % at all pressures. By what percentage does the equilibrium
chamber pressure change at fixed $K_n$? By what percentage does the thrust
change, assuming $C_F$ is unaffected? By what percentage does the burn time
change, and what happens to total impulse?

**P12.** Take the *gaseous* exhaust of an APCP motor to be, by mole fraction:
CO 0.26, H₂O 0.30, HCl 0.15, N₂ 0.09, CO₂ 0.04, H₂ 0.16. Compute the mean
molar mass of the gas. Then, given that Al₂O₃ is 30 % of the total exhaust
mass, compute the mass-weighted mean molar mass of the whole exhaust treating
alumina as a species of $M = 102$ kg/kmol. Comment on which number belongs in
Eq. 3.4 and why.

**P13.** For the two-phase bracketing model of WE 19.3, recompute $\xi$,
$c_{eq}$ and $c_{lag}$ for a propellant with 20 % aluminium (all other
assumptions unchanged) and find the maximum possible loss. Then find the
coupling efficiency $\lambda$ required to keep the loss below 2 %.

**P14.** From `reference/_verify-solid-coldgas.md`, take the P120C's
propellant and gross masses and the Shuttle SRB's, compute both propellant
mass fractions, and compute the ratio of delivered total impulse per unit
gross stage mass for the two, using published $I_{sp}$ figures. State clearly
which $I_{sp}$ you used (sea-level or vacuum) and why that choice is
defensible.

### Engineering reasoning

**P15.** A static test of a new production lot shows a pressure trace matching
prediction for the first 8 s, then running 6 % high for the remainder of the
burn, with total burn time 4 % short. The integrated impulse is within 1 % of
prediction. Propose three candidate causes, say what each predicts for the
*shape* of the trace, and state the single additional measurement that would
discriminate them.

**P16.** Two motors are built with the same propellant lot, the same grain
geometry, and nozzles of $\varepsilon = 12$ and $\varepsilon = 45$. Vacuum
$I_{sp}$ comes back as 272 s and 296 s. A colleague argues the
higher-$\varepsilon$ motor's propellant "performed better." Refute this with a
decomposition, and estimate the $c^*$ efficiency of each motor if the ideal
$c^*$ is 1,590 m/s and the ideal $C_F$ values at those expansion ratios are
1.79 and 1.92.

**P17.** An aging surveillance program tests bulk tensile samples cut from the
mid-web of stored motors annually. After fifteen years, $\sigma_m$ and
$\varepsilon_m$ are both within 10 % of the as-cast values. A motor from the
same lot fails on a cold-conditioned static test with evidence of grain motion
at the aft end. Explain what the surveillance program was not measuring, and
why the bulk data was reassuring but irrelevant.

**P18.** You are shown a plume photograph of an unknown motor: a bright, dense
white trail persisting for kilometres. Separately, you are shown a second
motor whose plume is nearly invisible. State what each observation tells you
about the propellant family, what it tells you about the likely application,
and what it tells you — if anything — about $I_{sp}$.

### Mini trade study

**P19.** You are the propulsion lead for a **ground-launched interceptor**
booster stage. Constraints: the missile is stored in an unconditioned canister
in a climate spanning −40 °C to +60 °C for a 20-year service life; total
length and diameter are fixed by the launcher, so **volume is hard-capped**;
motors must be shipped by road to dispersed sites; time-to-intercept is the
top performance metric, so **thrust-to-weight and burn rate matter more than
$I_{sp}$**; there is no signature requirement during boost.

Options:

- **A.** AP/Al/HTPB composite, 88 % solids, 18 % Al, hazard class 1.3.
- **B.** AP/Al/HTPB composite, 86 % solids, 15 % Al, higher binder fraction
  for cold margin, class 1.3.
- **C.** Nitramine CMDB, class 1.1, roughly 5 s higher $I_{sp}$ than A at
  equal $\varepsilon$ and roughly 3 % higher density.
- **D.** NEPE-class aluminized propellant, class 1.1, roughly 10 s higher
  $I_{sp}$ than A and roughly 5 % higher density.

Recommend one. Justify against every stated constraint, state explicitly what
you are giving up, and name the two measurements you would require in
qualification to retire the largest risk in your choice.

---

## 11. Quiz (100 points)

**Q1 (8).** Which single quantity in
$c^* = \frac{1}{\Gamma}\sqrt{R_u T_c/\bar M}$ most limits solid propellant
$I_{sp}$ relative to LOX/LH2, and why can a solid propellant not fix it?
(a) $T_c$ — solids burn much cooler;
(b) $\bar M$ — the products of a self-oxidizing condensed mixture are heavy;
(c) $\Gamma$ — $\gamma$ is too low;
(d) $R_u$ — it is a different gas constant.

**Q2 (8).** A composite propellant with $n = 0.40$ has its burn rate raised
5 % by a catalyst change. The percentage change in equilibrium chamber
pressure at fixed $K_n$ is closest to: (a) 3 %; (b) 5 %; (c) 8.5 %; (d) 12.5 %.

**Q3 (10).** Compute the condensed-phase mass fraction of the exhaust of a
propellant containing 14.5 % aluminium by mass, assuming complete combustion
to Al₂O₃ ($M_{\mathrm{Al}} = 26.98$, $M_{\mathrm{Al_2O_3}} = 101.96$).

**Q4 (8).** PBAN was retained for the Shuttle SRB and for the SLS booster.
Which of the following is *not* a defensible reason?
(a) an existing qualified mix, process, and ballistic database at booster
scale; (b) the $I_{sp}$ delta to HTPB is small at $\varepsilon \approx 7$;
(c) PBAN has better low-temperature strain capability than HTPB;
(d) SLS reuses Shuttle-era cases, tooling and facilities, so requalification
cost dominates.

**Q5 (12).** A propellant has $T_c = 3{,}300$ K, $\bar M = 26.8$ kg/kmol,
$\gamma = 1.19$. Compute $c^*$. Then, given a measured $c^*$ of 1,505 m/s,
compute the $c^*$ efficiency and say what physical effects it lumps together.

**Q6 (10).** State the two distinct performance penalties that HCl in the
exhaust imposes, and say which one a chlorine-free oxidizer would remove.

**Q7 (10).** Rank these by density impulse, highest first, and give the
approximate value of the highest: (i) AP/Al/HTPB at 1,800 kg/m³ and 290 s;
(ii) LOX/LH2 at 362 kg/m³ and 452 s; (iii) LOX/RP-1 at 1,017 kg/m³ and 348 s;
(iv) unmetallised AP/HTPB at 1,700 kg/m³ and 275 s.

**Q8 (12).** A grain cracks along the bore during cold conditioning. Describe
the mechanism in terms of stress-free cure temperature, coefficients of
thermal expansion, and $\varepsilon_m(T,\text{age})$; then state what the
pressure trace on the subsequent firing would look like and why.

**Q9 (12).** You are given two published $I_{sp}$ figures for the same motor:
286.2 s and 292.2 s. Explain, with no additional data, the most likely reason
both are correct, and state the one piece of information that must always
accompany a solid motor $I_{sp}$ figure.

**Q10 (10).** A program manager proposes moving a commercial launch vehicle's
strap-on boosters from AP/Al/HTPB to a NEPE-class propellant for "+10 s of
$I_{sp}$." Give the two strongest arguments against, in order, and identify
which one is a propulsion argument and which is not.

---

## 12. Further reading

1. **[SB §12.1–12.4]** — Sutton & Biblarz, *Rocket Propulsion Elements*, 9th
   ed. The solid-propellant chapters. Read §12.3 for the ingredient tables and
   §12.4 for the performance-loss breakdown that WE 19.2's loss table follows.
2. **[Kubota]** — Kubota, *Propellants and Explosives: Thermochemistry and
   Combustion*. The best single treatment of why double-base and composite
   propellants burn differently, at the flame-structure level. Chapters 4–6.
3. **[Davenas]** — Davenas, *Solid Rocket Propulsion Technology*. The European
   reference; strongest on binder chemistry, aging, and the historical
   progression of families. Read it for the material this module compresses
   into §3.4.
4. **[SP-8064]** — NASA SP-8064, *Solid Propellant Selection and
   Characterization*. The design-criteria monograph that formalises the
   selection trade of §3.2 and the test methods of §7.5. Old, and still the
   cleanest statement of what you must characterise before you commit.
5. **[SP-8039]** — NASA SP-8039, *Solid Rocket Motor Performance Analysis and
   Prediction*. The source for the two-phase and other loss models bracketed
   in WE 19.3, and for the standard efficiency bookkeeping.
6. **[NASA-SRB]** — NASA Space Shuttle SRB fact-sheet material. The published
   composition of §3.10, and the only formulation numbers this course quotes.
7. **[NASA-SLS-SRB]** — NASA SLS Solid Rocket Booster reference page. Read it
   for what changed and what did not between RSRM and the five-segment motor;
   the "what did not" is the interesting half.
8. **[CEA]** — Gordon & McBride, NASA RP-1311. The equilibrium code behind
   every $T_c$, $\bar M$, and $\gamma$ assumed in this module. Module 04
   covers its use; run it on an AP/Al/HTPB composition and watch $\bar M$
   refuse to go below 25.
9. **[FAS]** — Federation of American Scientists / GlobalSecurity strategic
   systems pages. The open-source architecture record for Minuteman,
   Peacekeeper, and Trident used in §6.4 and §6.5. Secondary; treat every
   number as indicative.
10. **`reference/_verify-solid-coldgas.md`** — the course's own verification
    worksheet. Read its "contested figures" section before quoting any solid
    motor number anywhere, in this module or another.
