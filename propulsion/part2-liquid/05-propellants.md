# Module 05 — Propellants
Part II · Prerequisites: modules 01–04 · Estimated time: 6–8 h

Propellant selection is the only decision in engine design that you cannot
walk back. Chamber pressure can be traded, an injector can be redesigned, a
nozzle can be re-contoured — but the propellants set the tank volumes, the
tank materials, the structure that carries them, the pad, the transporter,
the fill-and-drain plumbing, the personal protective equipment, the launch
site's water table, and the number of hours between "go" and "no-go." A
programme that picks its propellants badly does not discover the mistake in
the combustion lab; it discovers it three years later when the stage is 4 m
too long for the fairing, or when the range safety officer asks how far the
nitrogen tetroxide plume travels if a tank ruptures on the pad. I have
watched a preliminary design team spend six weeks optimising injector
element spacing on an engine whose propellant combination had already made
the vehicle infeasible. Learn the fluids first.

---

## 1. Learning objectives

By the end of this module you can:

1. Compute $c^*$, vacuum $I_{sp}$ and density impulse for a given propellant
   pair from chamber temperature, mean molar mass and $\gamma$, and rank
   pairs on both mass and volume bases.
2. Explain why flight mixture ratios are fuel-rich of stoichiometric, and
   predict the direction $T_0$, $\mathcal{M}$ and $I_{sp}$ move when $r$ is
   changed.
3. Read a saturation table (from [NIST-WB] or [REFPROP]) and extract the
   numbers a feed system actually needs: density at tank conditions, vapour
   pressure at the pump inlet, latent heat, and $c_p$.
4. State the storage temperature, freezing point, vapour pressure and toxicity
   class of the twelve propellants in current or recent flight use, from memory,
   to within engineering accuracy.
5. Estimate the coolant-side wall temperature in a hydrocarbon cooling channel
   and decide whether the design violates the coking limit.
6. Estimate boil-off rate for a cryogenic tank given a heat leak, and size the
   ullage and vent consequences.
7. Argue, for a stated mission, which propellant pair a programme should pick,
   naming the constraint that decides it (Δv, volume, storage duration, restart,
   toxicity, cost, reuse).
8. Explain, in cycle terms, why LH₂ makes closed expander cycles possible, why
   kerosene pushed the Soviets into oxidiser-rich staged combustion, and why
   methane sits between the two.

---

## 2. Terminology

| term | symbol | SI unit | meaning |
|---|---|---|---|
| mixture ratio | $r$ (also $O/F$) | — | oxidiser mass flow / fuel mass flow |
| stoichiometric mixture ratio | $r_{st}$ | — | $r$ at which all fuel and oxidiser are consumed to fully oxidised products |
| chamber (stagnation) temperature | $T_0$ | K | adiabatic flame temperature at chamber conditions |
| mean molar mass of products | $\mathcal{M}$ | kg/kmol | mass-weighted molar mass of the combustion gas |
| specific gas constant | $R$ | J/(kg·K) | $R = R_u/\mathcal{M}$ |
| ratio of specific heats | $\gamma$ | — | $c_p/c_v$ of the product gas |
| characteristic velocity | $c^*$ | m/s | chamber-quality figure of merit, $p_0 A_t/\dot m$ |
| thrust coefficient | $C_F$ | — | nozzle figure of merit, $F/(p_0 A_t)$ |
| specific impulse | $I_{sp}$ | s | $c/g_0$; here always stated vacuum or sea level |
| bulk density | $\rho_b$ | kg/m³ | density of the propellant *combination* at flight mixture ratio |
| density impulse | $I_d$ | kg·s/m³ | $\rho_b I_{sp}$; the volume-basis figure of merit |
| latent heat of vaporisation | $h_{fg}$ | J/kg | enthalpy to boil saturated liquid at a given pressure |
| vapour pressure | $p_v$ | Pa | saturation pressure at the local liquid temperature |
| normal boiling point | NBP | K | saturation temperature at 101.325 kPa |
| critical point | $T_c$, $p_{crit}$ | K, Pa | above which liquid and vapour are indistinguishable |
| net positive suction head | NPSH | m | pump-inlet head margin above vapour pressure |
| tankage factor | $k_v$ | kg/m³ | tank + insulation mass per unit propellant volume |
| ignition delay | $\tau_{ign}$ | s | contact-to-pressure-rise time for a hypergolic pair |
| coking | — | — | carbon deposition from a hydrocarbon coolant on a hot channel wall |
| coolant-side wall temperature | $T_{wc}$ | K | wall temperature on the coolant side of the liner |
| heat flux | $q''$ | W/m² | local heat flow per unit wall area |
| convective coefficient | $h$ | W/(m²·K) | coolant-side film coefficient |
| hydraulic diameter | $D_h$ | m | $4A/P$ for a non-circular channel |
| Reynolds / Prandtl number | $Re$, $Pr$ | — | standard dimensionless groups |
| tank volume | $V$ | m³ | propellant volume including ullage |
| ullage fraction | $f_u$ | — | fraction of tank volume left as gas at load |
| heat leak | $\dot Q$ | W | total heat into a cryogenic tank |

---

## 3. Theory

### 3.1 What a propellant choice actually decides

Write the rocket equation and the stage mass budget together and the whole
problem appears at once. For a stage of final mass $m_f$ delivering $\Delta v$:

$$m_p = m_f\left[\exp\!\left(\frac{\Delta v}{I_{sp} g_0}\right) - 1\right]$$

> **Eq. 3.1** — variables: $m_p$ propellant mass [kg]; $m_f$ burnout mass
> [kg] (payload + structure + engine + residuals); $\Delta v$ [m/s]; $I_{sp}$
> [s]; $g_0 = 9.80665$ m/s². Meaning: the propellant a stage must carry.
> Assumes: constant $I_{sp}$, no gravity or drag losses, impulsive-equivalent
> burn. Fails when: throttling or altitude change $I_{sp}$ appreciably, or
> when the stage burns long enough that gravity loss is a first-order term —
> for those, integrate the trajectory.

$I_{sp}$ enters exponentially, which is why the naive answer is always
"pick the highest $I_{sp}$." But $m_f$ is not independent of the propellant:
tanks scale with **volume**, not mass, and volume is set by density. The
combination density is

$$\rho_b = \frac{1+r}{\dfrac{r}{\rho_{ox}} + \dfrac{1}{\rho_{f}}}$$

> **Eq. 3.2** — variables: $\rho_b$ bulk density of the loaded propellant
> [kg/m³]; $r$ mixture ratio [—]; $\rho_{ox},\rho_f$ oxidiser and fuel
> densities *at tank conditions* [kg/m³]. Meaning: the density of the
> propellant as a system, which is what sizes the tanks. Assumes: both
> propellants loaded at the stated temperatures with no residuals, ullage
> counted separately. Fails when: one propellant is densified or subcooled
> and the other is not, and you use handbook NBP densities for both — a
> 10 % error in LOX density is a 10 % error in tank length.

Multiplying by $I_{sp}$ gives the figure of merit for volume-limited stages:

$$I_d = \rho_b\, I_{sp}$$

> **Eq. 3.3** — variables: $I_d$ density impulse [kg·s/m³]; $\rho_b$ [kg/m³];
> $I_{sp}$ [s]. Meaning: impulse delivered per unit of tank volume. Assumes:
> tank mass and structural mass scale with volume — true for a first stage
> inside a fixed-diameter vehicle, false for a stage whose mass is dominated
> by a fixed avionics/engine allocation. Fails when: the vehicle is
> mass-limited rather than volume-limited; then $I_{sp}$ alone is the right
> metric. [A]

Between those two metrics lies every propellant argument ever had. LOX/LH₂
has the highest $I_{sp}$ of any practical chemical pair and one of the
*lowest* density impulses. N₂O₄/UDMH has mediocre $I_{sp}$ and excellent
$I_d$. The correct answer depends on the mission, and — this is the part
students miss — on things neither metric contains: whether the stage must sit
loaded for a year, whether a human is standing next to it, whether the engine
must restart nine times, and whether you intend to fly the hardware again next
week.

### 3.2 Where the performance numbers come from

From Module 04 you already have the equilibrium solution. The two results
this module leans on are

$$c^* = \frac{\sqrt{R T_0}}{\Gamma(\gamma)}, \qquad
\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

> **Eq. 3.4** — variables: $c^*$ [m/s]; $R = R_u/\mathcal{M}$ [J/(kg·K)];
> $T_0$ chamber stagnation temperature [K]; $\gamma$ [—]. Meaning: the
> chamber's contribution to performance, independent of the nozzle.
> Assumes: choked throat, one-dimensional, calorically perfect gas at the
> chamber state, complete and adiabatic combustion. Fails when: $\gamma$
> varies strongly through the nozzle (it does, by 0.03–0.06 for hot
> hydrocarbon flames), the combustion is incomplete ($\eta_{c^*} < 1$), or
> two-phase products are present. Real engines deliver $\eta_{c^*} =
> 0.92$–0.995 of this.

and, with $C_F$ from Module 03, $I_{sp} = c^* C_F/g_0$.

The single most important structural fact in Eq. 3.4 is that $c^*$ depends on
$\sqrt{T_0/\mathcal{M}}$. **Light products beat hot products.** Hydrogen wins
not because a hydrogen flame is hot — at flight mixture ratio it is *cooler*
than a kerosene flame — but because the exhaust is heavily loaded with
unburned H₂ at $\mathcal{M} \approx 13.5$ against kerosene's
$\mathcal{M} \approx 23$. [F]

This is also why flight mixture ratios sit fuel-rich of stoichiometric.
Stoichiometric LOX/LH₂ is $r_{st} = 7.94$; the RS-25 runs 6.03 and the J-2
ran 5.5 nominal, with a propellant-utilisation valve that could shift it
between 4.5 and 5.5 (engine database). Going fuel-rich costs flame temperature
but buys molar mass, and near the optimum the molar-mass term wins. Three
further reasons push the same direction, all practical rather than
thermodynamic [F][J]:

- **Wall temperature.** $T_0$ at stoichiometric LOX/RP-1 is roughly 3,900 K.
  Nothing cools that. Running at $r = 2.3$–2.8 knocks several hundred kelvin
  off before the injector has done anything.
- **Turbine drive gas.** A fuel-rich gas generator or preburner produces a
  cool, hydrogen-rich, non-oxidising gas that a turbine blade survives.
- **Dissociation.** Above about 3,500 K the products dissociate (CO₂ → CO +
  ½O₂, H₂O → OH + ½H₂), absorbing enthalpy that only partially recombines in
  the nozzle. Pushing $T_0$ higher returns less than the ideal calculation
  suggests.

The optimum $r$ for maximum $I_{sp}$ and the optimum $r$ for maximum $I_d$ are
**not the same**: because the oxidiser is almost always the denser fluid,
$I_d$ peaks at a higher (more oxidiser-rich) mixture ratio than $I_{sp}$ does.
Kerolox boosters live in the gap between those two optima, and which way a
programme leans tells you whether its designers were fighting mass or volume.

### 3.3 Oxidisers

#### 3.3.1 Liquid oxygen

LOX is the default oxidiser of the entire field, and it earns the position:
it is cheap (industrial gas, produced by the megatonne), non-toxic, leaves no
residue, has the best performance of any practical oxidiser except fluorine,
and its exhaust products are water and CO₂.

From [NIST-WB]: normal boiling point **90.19 K**, triple point **54.36 K**,
critical point **154.58 K / 5.043 MPa**. Saturated liquid at NBP:
$\rho = 1{,}141$ kg/m³, $c_p = 1.70$ kJ/(kg·K), $\mu = 195$ µPa·s,
$k = 0.151$ W/(m·K), $h_{fg} = 213$ kJ/kg. Subcooled to 66 K at 0.3 MPa the
density rises to **1,256 kg/m³** — a 10 % gain in tank capacity for free,
which is what "densified propellant" means and why several current programmes
do it.

Three properties dominate LOX system design:

1. **It is an oxidiser at 90 K, and cold metal is not inert.** Any
   hydrocarbon in a LOX system — a fingerprint, a grease film, a fragment of
   PTFE tape, a machining chip embedded in a weld — is a potential ignition
   source under impact or friction. LOX systems are therefore "LOX-clean":
   vapour-degreased, precision-cleaned to a stated particle and
   non-volatile-residue level, verified, then sealed and purged. Cleanliness
   is a *specification with an inspection*, not a habit; the cleaning
   procedure and its verification belong in the drawing package. [M]
2. **Materials.** Aluminium alloys (2219, 2195 Al-Li), 300-series stainless,
   Inconel and Monel are standard. Titanium is **prohibited** in LOX service:
   it is impact-sensitive in oxygen and burns. Soft goods are limited to
   PTFE, PCTFE (Kel-F) and filled fluoropolymers; ordinary elastomers freeze,
   then shatter, then burn.
3. **The critical pressure is only 5.04 MPa.** Above that, a LOX pump
   discharge or a regenerative cooling passage is *supercritical* — there is
   no boiling, no latent heat, and no two-phase flow, but there is a sharp
   density and $c_p$ excursion near the pseudo-critical line that will wreck
   an incompressible-flow calculation. Any engine with $p_c > 5$ MPa has
   supercritical oxygen somewhere in it. [F]

#### 3.3.2 Nitrogen tetroxide and the MON family

N₂O₄ is the storable oxidiser. Molar mass 92.01 kg/kmol, melting point
**261.9 K (−11.2 °C)**, boiling point **294.3 K (21.15 °C)**, density
**1,443 kg/m³ at 293 K**, vapour pressure ≈ **96 kPa at 293 K**. Look hard at
those numbers: it freezes just below a cold morning and boils just above room
temperature. Its usable liquid range at one atmosphere is about 32 K wide.
Everything about N₂O₄ system design — heated tanks, heated lines, thermostats
on the spacecraft, the entire thermal control subsystem of a storable
propulsion system — follows from that 32 K window. [F]

N₂O₄ is in equilibrium with NO₂ ($\mathrm{N_2O_4 \rightleftharpoons 2NO_2}$),
which is why its vapour is brown and why the equilibrium shifts with
temperature; the fluid behaves as a reacting mixture, not a pure substance,
and its $c_p$ and $\gamma$ reflect that.

**MON** (Mixed Oxides of Nitrogen) is N₂O₄ with dissolved nitric oxide, named
by NO percentage: MON-1, MON-3, MON-25. NO does two things: it depresses the
freezing point (MON-25 freezes near 218 K, giving a spacecraft designer
enormous thermal relief) and it **suppresses stress-corrosion cracking of
titanium alloys** by nitric acid formed from trace water. That second effect
is not a footnote. Apollo-era N₂O₄ cracked Ti-6Al-4V propellant tanks in test;
the fix — specifying a minimum NO content, hence MON-1 and MON-3 — is why
essentially every flight system since uses MON rather than pure N₂O₄. [H][M]

Toxicity: NO₂ attacks the deep lung. Exposure produces few immediate symptoms
and pulmonary oedema hours later. The Apollo-Soyuz crew inhaled RCS oxidiser
during descent in 1975 and were hospitalised. Handling requires SCAPE suits
(Self-Contained Atmospheric Protective Ensemble), a trained crew, an exclusion
zone, and a scrubber for the vent. Every one of those is a cost and a schedule
line.

#### 3.3.3 Hydrogen peroxide (HTP)

High-test peroxide is H₂O₂ in water at 85–98 % concentration. Density
1,360–1,430 kg/m³ (85 % → 98 %), boiling point ~423 K, freezing point rising
from roughly 256 K at 85 % to **272 K at 98 %** — the concentrated grades
freeze at almost exactly the temperature of ice, which is a genuine
operational nuisance. The peroxide–water freezing curve is strongly non-linear
with a eutectic near 61 % at about 217 K; quote it from the phase diagram, not
from a single remembered number. [E] Vapour pressure at 293 K is negligible
(~0.3 kPa), so pump-inlet cavitation is a non-issue.

HTP's two virtues are unique in this module:

- **It is a monopropellant as well as an oxidiser.** Passed over a silver or
  platinum catalyst it decomposes to steam and oxygen at 600–1,000 K
  (depending on grade), which drives a turbine directly. The V-2, Redstone
  A-7, RD-107/108 and XLR99 all used decomposed peroxide as turbine drive gas,
  and the R-7 family still does today (engine database) — a 1940s power cycle
  still flying crews in 2026.
- **The decomposition products ignite hydrocarbons on contact.** Inject
  kerosene into 600 °C steam-plus-oxygen and it lights. The Gamma engine of
  Black Arrow had no igniter at all — the catalyst pack *was* the ignition
  system (engine database). That is a genuinely elegant architecture: storable,
  non-toxic, non-hypergolic in the tank, self-igniting in the chamber.

Its vices: performance is poor (a large fraction of the oxidiser mass is water
and the flame is cool), it decomposes slowly in storage and pressurises the
tank, and it demands cleanliness of a different kind from LOX — any transition
metal ion, rust particle or dirty valve seat is a catalyst, and catalysis in a
closed tank is a runaway. HTP systems use passivated aluminium (1060, 5254),
300-series stainless passivated with nitric acid, PTFE seals, and vented
tanks. [H]

#### 3.3.4 Nitrous oxide

N₂O deserves a mention because it dominates amateur, university and small
commercial hybrid work, and because it is the propellant most likely to hurt
someone reading this. It is self-pressurising: vapour pressure at 293 K is
**5.05 MPa** [NIST-WB], so a tank of N₂O needs no pressurisation system at
all — you open a valve and it flows. That convenience is the whole reason for
its popularity.

It is also **monopropellant-capable and exothermically decomposable**
($\mathrm{N_2O \to N_2 + \tfrac12 O_2}$, strongly exothermic), and it has a
critical temperature of only **309.5 K (36.4 °C)** — a warm afternoon puts a
"liquid" N₂O tank above its critical point, at which the delivered mass flow
and the feed dynamics change character entirely. Adiabatic compression of a
vapour bubble, a contaminated valve, or a fast-closing valve producing a
pressure spike have all initiated decomposition events; the 2007 Scaled
Composites accident, which killed three people, occurred during an N₂O flow
test. Treat N₂O as an energetic material that happens to be convenient, and
design for decomposition propagation, not just for flow. [M]

#### 3.3.5 Nitric acid, historically [H]

Red fuming nitric acid (RFNA, ~84 % HNO₃ with 13–15 % dissolved NO₂) was the
storable oxidiser of the 1940s–60s. It is denser than N₂O₄ (about
1,550–1,580 kg/m³), liquid over a much wider temperature range, and hypergolic
with amines and hydrazines. It is also violently corrosive: it dissolved
aluminium tanks, attacked stainless steel welds, and produced hydrogen in
storage that pressurised sealed missile tanks. The fix was **IRFNA** —
inhibited RFNA — with about 0.6 % **hydrogen fluoride**, which forms a
protective fluoride passivation layer on aluminium. [Clark] is the definitive
account of how that was discovered and what it cost. IRFNA flew on Agena
(IRFNA/UDMH), on many tactical missiles, and on early Soviet and Chinese
vehicles. It lost to N₂O₄ because N₂O₄ gives roughly 10–15 s more $I_{sp}$ and
corrodes less, once you accept the narrower liquid range.

#### 3.3.6 The oxidisers that lost: ClF₃ and LF₂ [H]

Every few years someone rediscovers that fluorine-bearing oxidisers give
spectacular performance. On the consistent basis used in §4.3, LOX/LH₂
delivers about 442 s at $\varepsilon = 40$ and LF₂/LH₂ about 487 s. Chlorine
trifluoride with hydrazine is storable, hypergolic with everything, and denser
than N₂O₄.

Neither flew, for reasons that are engineering, not squeamishness:

- **ClF₃** is hypergolic with, among other things, cloth, wood, asbestos,
  test engineers, sand, and previously-burned ashes. It ignites materials
  that have already been burned in oxygen. A spill cannot be extinguished
  because there is nothing to remove — it supplies its own oxidiser. It
  attacks metals except where a fluoride passivation layer holds, and the
  layer fails under flow-induced abrasion. Cleanup of a spill means letting
  it finish.
- **LF₂** boils at 85 K (cryogenic, like LOX, with none of LOX's forgiveness),
  is acutely toxic at parts-per-million, and produces **HF** in the exhaust.
  A launch vehicle burning fluorine deposits hydrofluoric acid on the pad
  and downrange. No range will license it.

The lesson generalises: **a propellant's performance is a property of the
molecule; its cost is a property of the whole ground system.** Fluorine wins
the first and loses the second by an order of magnitude. [J]

### 3.4 Fuels

#### 3.4.1 Liquid hydrogen

LH₂ is the highest-$I_{sp}$ practical fuel and the most demanding fluid in
this module. [NIST-WB]: NBP **20.28 K**, triple point 13.96 K, critical point
**33.14 K / 1.296 MPa**. Saturated liquid at NBP: $\rho = 70.9$ kg/m³,
$c_p = 9.74$ kJ/(kg·K), $\mu = 13.5$ µPa·s, $k = 0.104$ W/(m·K),
$h_{fg} = 449$ kJ/kg.

Read the density again: **70.9 kg/m³**, one fourteenth of water and one
sixteenth of LOX. At $r = 6$, a LOX/LH₂ stage carries 86 % of its propellant
*mass* as oxygen but 73 % of its propellant *volume* as hydrogen. The tank
penalty compounds three ways: bigger tank (mass, cost), longer stage
(bending, drag, transport), and more insulated surface area (boil-off).
Worked Example 1 quantifies the whole chain.

Four further problems, each of which has cost a programme dearly:

- **Boil-off.** $h_{fg}$ is only 449 kJ/kg. One watt of heat leak boils
  0.19 kg per day. A stage that must loiter in orbit for days needs either
  active cooling, thick insulation, or a different propellant. This is the
  single technical reason cryogenic upper stages have not become
  general-purpose space tugs. Worked Example 3.
- **Ortho-para conversion.** Hydrogen exists as ortho and para nuclear-spin
  isomers. Normal (room-temperature) hydrogen is 75 % ortho; the equilibrium
  at 20 K is 99.8 % para, and the conversion is *exothermic*, releasing
  roughly 500 kJ/kg — more than the latent heat. Liquefy hydrogen without
  catalytic conversion and it will boil itself away in storage. All
  flight-grade LH₂ is catalytically converted para-hydrogen. [F]
- **Hydrogen embrittlement.** Atomic hydrogen diffuses into high-strength
  steels, nickel alloys and titanium, reducing ductility and fracture
  toughness, with severity peaking near room temperature and rising with
  strength level. This governs material choice for hydrogen turbopumps and
  hot-gas hardware far more than strength does. The mitigations are known:
  low-strength austenitic stainless (304L, 316L), aluminium alloys (immune
  in practice), copper alloys, gold or copper plating on susceptible
  surfaces, and avoiding high-hardness martensitic steels entirely. [G-095]
  is the reference. [F][M]
- **Flammability and invisibility.** Hydrogen's flammability range in air is
  roughly 4–75 % and its minimum ignition energy is about 0.017 mJ — a static
  spark from a synthetic sleeve is ten times more than enough. A hydrogen
  flame in daylight is invisible; test stands sweep for hydrogen fires with a
  broom held ahead of the walker. This is written procedure, not folklore.
  [G-095]

#### 3.4.2 RP-1, RP-2 and the Russian kerosenes

RP-1 (Rocket Propellant-1, MIL-DTL-25576) is a narrow-cut, highly refined
kerosene: mostly C₁₀–C₁₂ alkanes and cycloalkanes, aromatics limited, olefins
essentially absent, sulphur strictly limited. Typical properties at 293 K:
$\rho \approx 810$ kg/m³ (specification band roughly 799–815 kg/m³ at 288 K),
$c_p \approx 1.88$ kJ/(kg·K), $k \approx 0.14$ W/(m·K),
$\mu \approx 1.9$ mPa·s, vapour pressure ~2 kPa. It has no true boiling point
or critical point — it is a mixture, distilling over roughly 445–540 K, with a
pseudo-critical point near 660 K / 2.2 MPa from surrogate models. The
specification's low-temperature limit exists because the fuel gels rather than
freezes cleanly.

Why the specification is so tight is the important part. RP-1 is not "jet
fuel"; the difference between RP-1 and Jet A is the list of things RP-1 is
*not allowed to contain*, and each restriction traces to a failure:

- **Olefins and aromatics** polymerise and coke on hot walls.
- **Sulphur** catalyses coking and attacks copper channel liners. **RP-2** is
  RP-1 with sulphur cut by roughly an order of magnitude, and it is measurably
  more coke-resistant; it exists specifically to support long-life, reusable,
  high-heat-flux hydrocarbon engines. [M]
- **Distillation cut** controls both density (payload) and volatility (start
  behaviour, hot restart).

Russian practice uses **RG-1** and **T-1**-class kerosenes; the Soyuz engines
are described as burning RG-1, "a Russian refined kerosene, similar to RP-1"
(engine database). Denser naphthenic cuts and the synthetic hydrocarbon
**Sintin** were used to buy density on upper stages, and modern Russian
descriptions also refer to **TS-1 / T-6 / TS-5**-class fuels. The engineering
point for a Western reader: Russian engines were optimised around a slightly
denser, slightly different kerosene, so quoting a Russian engine's $I_{sp}$
against an RP-1 CEA run introduces a real, if small, inconsistency. [H]

**Coking** is the property that governs RP-1 engine architecture, and it gets
its own subsection (§3.6).

#### 3.4.3 Methane and LNG

Methane is the propellant of the current generation, and its case is entirely
a systems case rather than a performance case. [NIST-WB]: NBP **111.67 K**,
triple point 90.69 K, critical **190.56 K / 4.599 MPa**. Saturated liquid at
NBP: $\rho = 422$ kg/m³, $c_p = 3.48$ kJ/(kg·K), $\mu = 116$ µPa·s,
$k = 0.183$ W/(m·K), $h_{fg} = 510$ kJ/kg. Subcooled to 100 K it densifies to
**439 kg/m³**.

Its advantages line up one after another:

- **$I_{sp}$ between kerosene and hydrogen**, nearer kerosene: about 360 s
  against 355 s (RP-1) and 442 s (LH₂) on the §4.3 basis — a modest gain, but
  free.
- **Density about six times hydrogen's**, so tanks are tolerable.
- **Boiling point within 21 K of LOX's**, which is the underrated advantage:
  a methalox vehicle has one cryogenic temperature regime, can share
  insulation approaches, can use a common bulkhead without a huge thermal
  gradient, and can autogenously pressurise both tanks by tapping and heating
  their own propellant — no helium. Helium is expensive, leak-prone,
  supply-constrained, and the source of a startling number of launch scrubs.
- **It does not coke** at any temperature a cooling channel reaches; the
  limit is thermal decomposition around 1,000–1,100 K rather than carbon
  deposition near 700 K, so a methane jacket can run hotter and hence smaller.
- **Clean-burning and reuse-friendly.** No soot in the chamber, on the
  injector face, or in the turbine. For an engine intended to fly ten times
  without teardown that matters more than 5 s of $I_{sp}$.
- **In-situ production** on Mars via the Sabatier reaction is the stated
  motivation for Raptor; treat it as a real design driver for that programme
  and as irrelevant to everyone else's. [J]

Its disadvantages are real but small: bulk density below kerolox (Worked
Example 1), a critical pressure of 4.6 MPa so the coolant is supercritical in
any modern engine, and a much shorter propulsion experience base than either
of the fuels it replaces. "LNG" as flown is not pure methane — commercial LNG
carries ethane, propane and nitrogen, and a programme must specify its
composition or accept variation in density, $h_{fg}$ and cooling behaviour.

#### 3.4.4 Ethanol [H]

Ethanol was the first practical rocket fuel at scale, and the reason is not
performance. The V-2 burned **75 % ethanol / 25 % water**; the Redstone A-7
burned the same (engine database). Water in a fuel is pure performance loss —
so why?

Because it was the only way to build the engine. The V-2's chamber was mild
steel, double-walled, with four rings of film-cooling holes injecting about
10 % of the fuel along the wall — and the film cooling did most of the work;
the regenerative jacket alone was insufficient (engine database). Water is a
**thermal moderator**: it drops $T_0$ by several hundred kelvin and raises the
fuel's heat capacity and latent heat as a coolant, buying wall life. It also
made the fuel available — wartime Germany could ferment potatoes but could not
refine specialty kerosene at scale. [SLPRE] and [Hunley07] both make the point
that early propellant choices were manufacturing-base decisions.

Pure ethanol: $\rho = 789$ kg/m³ at 293 K, freezing 159 K, boiling 351.4 K,
$c_p = 2.44$ kJ/(kg·K). The 75 % aqueous blend: $\rho \approx 856$ kg/m³ —
denser than the pure fuel, one of the few cases where diluting a fuel improves
tank volume. LOX/ethanol still appears in student and small-launcher work
because it is cheap, non-toxic and forgiving of a poor cooling design.

**Mercury-Redstone deliberately reverted to ethanol** after Jupiter-C and
Juno I flew on Hydyne (60 % UDMH / 40 % diethylenetriamine), accepting lower
$I_{sp}$ to keep a toxic fuel away from a crewed vehicle (engine database).
That is a clean, early, documented example of propellant selection driven by
crew safety rather than performance.

#### 3.4.5 Isopropyl alcohol

IPA (isopropanol; $\rho = 786$ kg/m³ at 293 K, boiling 355.4 K, freezing
184 K, $c_p = 2.68$ kJ/(kg·K)) appears almost exclusively in university and
amateur LOX-fuelled engines, and it is there for the same reasons ethanol was
in 1943: it is available at any hardware store, non-toxic in the sense that
matters (you can spill it without evacuating the county), its flame is cool
enough that a thick copper or ablative chamber survives without a real cooling
design, and it tolerates poor mixture-ratio control. It performs a few seconds
below ethanol. No flight vehicle uses it and none should; its place is the
test stand, where the objective is to learn injector and ignition behaviour,
not to reach orbit. [J]

#### 3.4.6 The hydrazines: N₂H₄, MMH, UDMH, Aerozine-50

This family is not history. MMH/MON flies today on Orion (using refurbished
Shuttle OMS engines), on most GEO satellites, and on essentially every
spacecraft that must restart reliably after years in orbit. Treat these as
current propellants with an inconvenient toxicity profile, not museum pieces.

| | $\mathcal{M}$ | $\rho$ (293 K) | mp | bp | notes |
|---|---|---|---|---|---|
| hydrazine N₂H₄ | 32.05 | 1,004 | **274.7 K** | 386.7 K | best $I_{sp}$; also a monopropellant |
| MMH CH₃NHNH₂ | 46.07 | 875 | 220.7 K | 360.6 K | the spacecraft standard |
| UDMH (CH₃)₂NNH₂ | 60.10 | 791 | 216 K | 336 K | Soviet/Chinese booster standard |
| Aerozine-50 | — | 899 | ~266 K | ~343 K | 50/50 N₂H₄/UDMH; Titan and Apollo SPS |

Read the melting point of hydrazine: **274.7 K, 1.5 °C**. Neat hydrazine
freezes in a spacecraft that loses heater power, and it *expands* on freezing,
splitting lines. That single number is why MMH, not hydrazine, is the standard
bipropellant fuel for long-duration spacecraft, and why Aerozine-50 exists at
all: blending UDMH into hydrazine depresses the freezing point while keeping
most of hydrazine's performance. Every member of this family is chosen by its
phase diagram first and its $I_{sp}$ second. [F][H]

Their common virtues: hypergolic with N₂O₄/MON and with nitric acid; storable
for years; well characterised; and — decisively for spacecraft — a
pressure-fed engine using them has **no ignition system to fail**, which is
how a thruster achieves thousands of starts over fifteen years.

Their common vice: all are toxic, and MMH and UDMH are classed as probable
human carcinogens; UDMH's degradation product NDMA is a potent one. Ground
handling requires SCAPE, vapour detection, and a decontamination plan. In
Europe, REACH regulation has placed hydrazine on the authorisation track,
which is now a genuine programmatic risk for storable-propulsion spacecraft
and a live driver of the search for "green" alternatives (LMP-103S, AF-M315E)
that this course covers in Part V. [M]

#### 3.4.7 Ammonia, and the fuels that lost [H]

**Ammonia** (NBP 239.8 K; as a pressurised liquid at 293 K, $\rho = 610$ kg/m³
under its own 0.858 MPa vapour pressure; $c_p = 4.74$ kJ/(kg·K); $h_{fg}$
enormous at ~1,190 kJ/kg near ambient) flew on the XLR99 in the X-15 for one
reason: it is a **clean, non-coking, high-heat-capacity regenerative coolant**
for an engine that had to be throttled by a pilot, shut down, restarted in
flight, and inspected between sorties like an aircraft engine (engine
database). Kerosene would have sooted the chamber and the throttle valve;
ammonia does not. It cost perhaps 15–20 s of $I_{sp}$ against kerosene and
bought operability. That trade — performance for operability — is exactly the
trade the reusable-engine community is making again with methane.

**Pentaborane (B₅H₉)** and the boron hydrides were pursued hard in the 1950s
"zip fuel" programmes for their exceptional heat of combustion. They failed
comprehensively: the exhaust contains condensed boron oxides (two-phase flow
losses that eat the theoretical gain), B₂O₃ deposits on and erodes nozzles,
the fuels are spontaneously flammable in air, and pentaborane is a severe
neurotoxin with delayed effects. The programme's residue was a national
stockpile that cost more to dispose of than to make. Others in the same
graveyard: **hydrazine/beryllium slurries** (the exhaust is beryllium oxide —
acutely toxic and carcinogenic), **lithium/fluorine/hydrogen tripropellant**
(the highest chemical $I_{sp}$ ever measured in test, and completely
unflyable), and **methylacetylene** (a monopropellant that detonates).
[Clark] is the readable history; the engineering lesson is that theoretical
$I_{sp}$ is the *least* binding constraint in propellant selection. [J]

### 3.5 Ignition and hypergolicity

Ignition is Module 08's subject, but the propellant decides which ignition
architectures are available at all. Three classes:

1. **Hypergolic** — the pair ignites on contact. No igniter, no ignition
   sequence, no restart limit. This is why storables own the
   restart-after-years mission.
2. **Chemically ignited non-hypergolic** — a hypergolic slug (TEA-TEB,
   triethylaluminium/triethylborane) is injected ahead of the main
   propellants. The F-1 and every Merlin start this way (engine database).
   Restarts are limited by the number of slugs carried.
3. **Externally ignited** — spark torch (J-2, RS-25, RL10, Vinci), catalytic
   (Gamma), pyrotechnic (V-2), or hot gas from a preburner (Raptor 2 onward
   deleted the main-chamber igniter entirely). Unlimited restarts if the
   igniter is reusable, which is why LOX/CH₄ and LOX/LH₂ engines with torch
   igniters are attractive for multi-burn stages.

The quantitative property of a hypergolic pair is **ignition delay**
$\tau_{ign}$, the time from first liquid contact to pressure rise. It follows
Arrhenius behaviour:

$$\tau_{ign} = A\exp\!\left(\frac{E_a}{R_u T}\right)$$

> **Eq. 3.5** — variables: $\tau_{ign}$ [s]; $A$ pre-exponential factor [s];
> $E_a$ apparent activation energy [J/kmol]; $R_u = 8314.46$ J/(kmol·K); $T$
> propellant temperature [K]. Meaning: hypergolic ignition is a chemical rate
> process, so delay rises steeply as propellants get cold. Assumes: a single
> rate-controlling step, well-mixed contact. Fails when: mixing rather than
> chemistry limits the process (coarse injector elements), or when the
> propellants are cold enough that one freezes on contact. [E]

Typical values: N₂O₄/MMH and N₂O₄/hydrazine give $\tau_{ign}$ of a few
milliseconds at 293 K, rising by roughly an order of magnitude near 250 K.
That sensitivity is the mechanism behind **hard starts**: if the delay is long
enough for a significant mass of unburned propellant to accumulate in the
chamber before ignition, the subsequent burn is a detonation rather than a
start, and the injector face or the chamber head departs. Cold-soak ignition
delay is therefore a qualification test, not a curiosity, and it is why
spacecraft propellant lines carry heaters and why a thruster has a minimum
allowable propellant temperature in its interface document. [M]

### 3.6 Cooling-channel chemistry: coking and thermal decomposition

A regeneratively cooled engine runs the fuel through channels in the hottest
wall in the vehicle. The fuel therefore experiences temperatures no fuel
system was designed for, and it responds chemically.

**Coking.** Hydrocarbons above roughly 600 K undergo pyrolysis and oxidative
degradation at the wall, depositing carbon. The deposit is an insulator
(order 1 W/(m·K) against 300+ for a copper alloy), so a layer tens of microns
thick raises the metal temperature substantially, which accelerates deposition
— a positive feedback ending in burn-through. Copper catalyses the process,
and sulphur in the fuel catalyses it further, which is the entire reason RP-2
exists.

The engineering rule is a **limit on coolant-side wall temperature**, not on
bulk temperature:

$$T_{wc} = T_{b} + \frac{q''}{h}, \qquad
h = 0.023\,\frac{k}{D_h}\,Re^{0.8}Pr^{0.4}$$

> **Eq. 3.6** — variables: $T_{wc}$ coolant-side wall temperature [K]; $T_b$
> coolant bulk temperature [K]; $q''$ local heat flux [W/m²]; $h$ coolant-side
> film coefficient [W/(m²·K)]; $k$ coolant thermal conductivity [W/(m·K)];
> $D_h$ hydraulic diameter [m]; $Re$, $Pr$ evaluated at bulk conditions.
> Meaning: the film temperature drop that sets whether the fuel cokes.
> Assumes: fully developed turbulent single-phase flow, moderate property
> variation, smooth straight channel. Fails when: the coolant is near or above
> its critical point (property variation is violent), the channel is curved or
> has a high aspect ratio, or roughness/ribbing is used to augment $h$ —
> corrections of 1.2–2× are routine. Accuracy ±20–25 % at best. [E]
> [Bartz57] and [SP-8087] give the companion gas-side treatment.

Published coking thresholds spread widely because the phenomenon depends on
fuel grade, wall material, residence time and total exposure. Design practice
places the coolant-side wall limit for RP-1 in copper alloys at roughly
**700 K**, with sources ranging from about 600 K for conservative long-life
design to above 800 K for short-duration expendable hardware; RP-2 buys
perhaps 50–100 K. Treat any single quoted number as a starting point that must
be confirmed by long-duration hot-fire with post-test channel inspection.
[E][J] Worked Example 2 runs the check.

**Methane** does not coke in the same sense: it has no aromatics or olefins to
polymerise, and the limiting process is thermal decomposition (pyrolysis to
carbon and hydrogen) above roughly 1,000–1,100 K. That extra ~300 K of wall
temperature is worth real money — fewer channels, thinner walls, smaller
pressure drop, smaller pump — and it is one of the strongest technical
arguments for methalox in a reusable engine. [M]

**Hydrogen** has no such chemistry at all: it is already the end state of
pyrolysis. Its cooling limits are purely thermal-mechanical (wall creep,
low-cycle fatigue, the "doghouse" bulging failure of thinned channel walls)
plus embrittlement of the structure.

### 3.7 Cryogenic system behaviour

Four phenomena appear in every cryogenic vehicle and in no storable one.

**Boil-off.** Any heat that reaches saturated liquid boils it:

$$\dot m_{bo} = \frac{\dot Q}{h_{fg}}$$

> **Eq. 3.7** — variables: $\dot m_{bo}$ boil-off rate [kg/s]; $\dot Q$ heat
> leak into the liquid [W]; $h_{fg}$ latent heat at tank pressure [J/kg].
> Meaning: the vent rate needed to hold tank pressure. Assumes: saturated
> liquid, vented (constant-pressure) tank, all heat reaching the liquid rather
> than superheating the ullage. Fails when: the tank is locked up (pressure
> rises instead of mass leaving), the liquid is subcooled (heat is absorbed
> sensibly first), or thermal stratification concentrates heat in the surface
> layer — stratification can double the apparent pressure-rise rate and is a
> recurring operational surprise.

**Geysering.** A long vertical feed line full of cryogen, standing on the pad
with the engine valve closed, absorbs heat along its length. Vapour forms low
in the line, expands, and drives a slug of liquid upward; the slug falls back
and slams into the arriving liquid. The resulting water-hammer pressure spike
has destroyed feedlines. Mitigations: helium bubbling to keep the line
circulating, a recirculation line back to the tank, or continuous pre-launch
bleed. Any vehicle with a long LOX downcomer past a warm fuel tank must
address it explicitly. [H][M]

**Thermal contraction.** Cooling 6061 aluminium from 293 K to 90 K shortens it
by roughly 0.4 %; austenitic stainless by roughly 0.3 %. A 30 m LOX tank
shrinks on the order of 100 mm on chill-down.

$$\frac{\Delta L}{L} = \int_{T_1}^{T_2}\alpha(T)\,dT$$

> **Eq. 3.8** — variables: $\Delta L/L$ contraction strain [—]; $\alpha(T)$
> coefficient of thermal expansion [1/K]. Meaning: how much a structure moves
> on chill-down. Assumes: unconstrained, isotropic material. Fails when: the
> integral is replaced by $\bar\alpha \Delta T$ using a room-temperature
> $\bar\alpha$ — $\alpha$ falls by a factor of two or more toward absolute
> zero, so the room-temperature value badly overpredicts. Consequence:
> bellows, sliding joints and flexible lines are not optional; a rigidly
> plumbed cryogenic feed system tears itself apart on the first chill-down.

**Densification.** Subcooling below NBP raises density (LOX 1,141 →
1,256 kg/m³ at 66 K; CH₄ 422 → 439 kg/m³ at 100 K), improves NPSH margin, and
delays boiling in the pump. The costs are ground equipment (subcoolers), a
load that warms and expands during a hold, and a narrow launch window.
[M]

### 3.8 Feed-system consequences: vapour pressure and NPSH

The propellant property that determines whether a pump works is vapour
pressure at the inlet:

$$\mathrm{NPSH}_a = \frac{p_{tank} - p_v - \Delta p_{line}}{\rho g_0} + z\frac{a}{g_0}$$

> **Eq. 3.9** — variables: $\mathrm{NPSH}_a$ available net positive suction
> head [m]; $p_{tank}$ ullage pressure [Pa]; $p_v$ vapour pressure at the
> local liquid temperature [Pa]; $\Delta p_{line}$ feed line loss [Pa];
> $\rho$ [kg/m³]; $z$ liquid column height above the inlet [m]; $a$ vehicle
> axial acceleration [m/s²]. Meaning: the margin against cavitation at the
> impeller inlet. Assumes: steady flow, uniform inlet temperature. Fails when:
> the liquid is stratified (surface layer warmer, $p_v$ higher than bulk),
> during the start transient, or when trapped gas is ingested after a low-g
> coast.

A saturated cryogen is the hard case, because $p_{tank} \approx p_v$ by
definition and the entire margin must come from pressurisation, head, or
subcooling. A storable at 293 K with $p_v \approx 96$ kPa (N₂O₄) or ~2 kPa
(RP-1) has margin nearly for free. This is one reason pressure-fed storable
systems are simple and pump-fed cryogenic systems need boost pumps: the
RS-25's low-pressure turbopumps exist largely to give the high-pressure pumps
enough NPSH (engine database).

### 3.9 Engine-cycle implications

Propellant choice and cycle choice are not independent. Three cases explain
most of the flying hardware.

**Hydrogen makes the closed expander cycle possible.** In an expander cycle
the turbine is driven by fuel heated in the cooling jacket — no combustion,
no preburner. The available turbine power is

$$P_{turb} = \eta_t\,\dot m_f\,c_p\,T_{in}\left[1 - \pi^{-(\gamma-1)/\gamma}\right]
\quad\text{with}\quad \dot m_f c_p \Delta T = \dot Q_{jacket}$$

> **Eq. 3.10** — variables: $P_{turb}$ turbine shaft power [W]; $\eta_t$
> turbine efficiency [—]; $\dot m_f$ fuel flow [kg/s]; $c_p$ [J/(kg·K)];
> $T_{in}$ turbine inlet temperature [K]; $\pi$ turbine pressure ratio [—];
> $\dot Q_{jacket}$ heat picked up in the cooling jacket [W]. Meaning: an
> expander engine's power is capped by the heat its own chamber can deliver to
> its own fuel. Assumes: ideal-gas turbine, adiabatic ducting. Fails when: the
> coolant is strongly supercritical (use real-fluid enthalpy differences, not
> $c_p\Delta T$).

Hydrogen wins here on three counts at once: $c_p \approx 10$–14 kJ/(kg·K)
(several times any other coolant), no coking limit so $T_{in}$ can reach
500–800 K, and low molar mass so the turbine extracts a lot of work per unit
pressure ratio. Nothing else comes close, which is why every closed expander
engine ever flown — RL10, RL10B-2, Vinci — burns hydrogen (engine database).

The same equation gives the cycle's famous limit. Jacket heat scales roughly
with chamber surface area ($\propto D^2$) while thrust and required pump power
scale with throat area and $p_c$. Push $p_c$ or thrust up and the heat
available per unit of required power falls. The RL10A-3-3A sits at 32.8 bar
and 73.4 kN; Vinci, the largest closed expander ever flown, reaches only
60 bar and 180 kN after a 26-year development (engine database). That ceiling
is structural, not a lack of trying. [F]

**Kerosene pushes you toward oxidiser-rich staged combustion.** In a
fuel-rich preburner, hydrocarbon fuel at a low mixture ratio does not burn
cleanly — it pyrolyses, and the turbine gas carries soot that plates out on
blades and passages. The Soviet answer, taken with the RD-253 in 1963 and
carried through the RD-170/RD-180, NK-33 and now the BE-4, was to run the
preburner **oxidiser-rich**: excess oxygen, cool dense gas, no soot, and —
because the gas is dense — a small turbine for the same power, hence the
RD-253's 156:1 thrust-to-weight (engine database). The price is that
everything downstream of the preburner sees hot, high-pressure oxygen, which
will burn steel given an ignition source. Energomash's answer was an inert
enamel coating on every wetted surface, a technology the West did not match
for decades and the direct reason no American ORSC engine flew until the BE-4
in 2024 (engine database). American kerolox instead stayed on the
gas-generator cycle (F-1, H-1, RS-27, Merlin), accepting the few percent of
propellant dumped overboard and a modest chamber pressure in exchange for not
having to solve oxygen-rich metallurgy. [H][M]

**Methane sits between.** It is a hydrocarbon, so a fuel-rich preburner still
produces some carbon; but methane is a single small molecule with no aromatics
and it pyrolyses far less readily than kerosene, so fuel-rich operation is
practical. That is precisely what full-flow staged combustion exploits: Raptor
runs an oxidiser-rich preburner *and* a fuel-rich preburner, both exhausting
into the main chamber, which is only tolerable because methane's fuel-rich gas
is clean enough to pass through a turbine (engine database — and note that all
Raptor figures are company claims). BE-4 makes the other choice: a single
oxidiser-rich preburner, ORSC, at a deliberately low 140 bar chosen for engine
life. Two different answers to the same fluid, and the difference is a
statement about what each company is optimising — peak performance versus
inspection interval. [M][J]

---

## 4. Typical engineering ranges

### 4.1 Physical properties at storage conditions

Cryogens are quoted as saturated liquid at NBP unless noted; storables at
293 K. Values for O₂, H₂, CH₄, N₂O and NH₃ are from [NIST-WB]; RP-1, the
hydrazines, HTP, IRFNA and the alcohols are handbook and specification values
and carry the wider tolerance appropriate to mixtures. [E]

| propellant | $\mathcal{M}$ kg/kmol | storage T (K) | $\rho$ kg/m³ | mp (K) | bp/NBP (K) | $p_v$ at storage T | $c_p$ kJ/(kg·K) | $\mu$ (Pa·s) | $k$ W/(m·K) | critical point |
|---|---|---|---|---|---|---|---|---|---|---|
| **LOX** | 32.00 | 90.2 | 1,141 | 54.4 | 90.19 | 101 kPa | 1.70 | 1.95e−4 | 0.151 | 154.58 K / 5.043 MPa |
| LOX (densified) | 32.00 | 66 | 1,256 | — | — | ~0.5 kPa | 1.68 | — | — | as above |
| **N₂O₄** | 92.01 | 293 | 1,443 | 261.9 | 294.3 | 96 kPa | 1.55 | 4.2e−4 | 0.13 | 431 K / 10.1 MPa |
| MON-3 | ~91 | 293 | ~1,440 | ~259 | ~292 | ~110 kPa | ~1.55 | ~4.2e−4 | ~0.13 | ~430 K |
| **HTP 98 %** | 34.01 (pure) | 293 | 1,430 | 272 | ~423 | ~0.3 kPa | 2.6 | 1.25e−3 | 0.57 | 728 K / 21.7 MPa |
| HTP 85 % | — | 293 | 1,360 | ~256 | ~417 | ~0.6 kPa | 2.8 | 1.2e−3 | 0.58 | — |
| **N₂O** | 44.01 | 293 | 785 | 182.3 (triple) | 184.7 (subl.) | **5.05 MPa** | 3.20 | 6.8e−5 | 0.081 | 309.5 K / 7.245 MPa |
| IRFNA IIIA | ~60 | 293 | ~1,570 | ~224 | ~340 | ~15 kPa | ~1.7 | ~1.0e−3 | ~0.28 | — |
| ClF₃ | 92.45 | 293 | 1,825 | 196.8 | 284.9 | ~140 kPa | ~0.9 | ~4e−4 | ~0.10 | 447 K / 5.79 MPa |
| LF₂ | 38.00 | 85 | 1,505 | 53.5 | 85.03 | 101 kPa | 1.55 | 2.4e−4 | 0.14 | 144.4 K / 5.17 MPa |
| **LH₂** | 2.016 | 20.3 | 70.9 | 14.0 | 20.28 | 100 kPa | 9.74 | 1.35e−5 | 0.104 | 33.14 K / 1.296 MPa |
| **RP-1** | ~172 (avg) | 293 | 810 | ≲225 (gels) | 445–540 (dist.) | ~2 kPa | 1.88 | 1.9e−3 | 0.14 | ~660 K / 2.2 MPa (pseudo) |
| RP-2 | ~172 | 293 | ~807 | ≲225 | 445–540 | ~2 kPa | 1.88 | 1.9e−3 | 0.14 | as RP-1 |
| **LCH₄** | 16.04 | 111.7 | 422 | 90.7 | 111.67 | 103 kPa | 3.48 | 1.16e−4 | 0.183 | 190.56 K / 4.599 MPa |
| LCH₄ (densified) | 16.04 | 100 | 439 | — | — | 34.6 kPa | 3.41 | 1.51e−4 | 0.199 | as above |
| ethanol (100 %) | 46.07 | 293 | 789 | 159 | 351.4 | ~5.9 kPa | 2.44 | 1.20e−3 | 0.17 | 514 K / 6.15 MPa |
| ethanol 75 % aq. | — | 293 | 856 | ~200 | ~355 | ~5 kPa | ~3.4 | ~2.4e−3 | ~0.25 | — |
| IPA | 60.10 | 293 | 786 | 184 | 355.4 | ~4.4 kPa | 2.68 | 2.4e−3 | 0.14 | 508 K / 4.76 MPa |
| **MMH** | 46.07 | 293 | 875 | 220.7 | 360.6 | ~6.6 kPa | 2.93 | 7.75e−4 | 0.25 | 585 K / 8.24 MPa |
| **UDMH** | 60.10 | 293 | 791 | 216 | 336.0 | ~16 kPa | 2.73 | 4.9e−4 | 0.16 | 523 K / 5.42 MPa |
| **N₂H₄** | 32.05 | 293 | 1,004 | **274.7** | 386.7 | ~1.9 kPa | 3.08 | 9.7e−4 | 0.37 | 653 K / 14.7 MPa |
| Aerozine-50 | — | 293 | 899 | ~266 | ~343 | ~10 kPa | ~2.9 | ~7e−4 | ~0.25 | — |
| NH₃ | 17.03 | 293 | 610 | 195.5 | 239.8 | **858 kPa** | 4.74 | 1.34e−4 | 0.48 | 405.4 K / 11.33 MPa |
| pentaborane | 63.12 | 293 | 618 | 226.3 | 331 | ~23 kPa | ~1.7 | — | — | — |

### 4.2 Vapour-pressure curves for the four cryogens that matter

Saturation pressure in MPa, from [NIST-WB]. This is the table to internalise:
it sets tank pressure, NPSH margin, and whether a coolant is supercritical.

| T (K) | O₂ | T (K) | H₂ | T (K) | CH₄ | T (K) | N₂O |
|---|---|---|---|---|---|---|---|
| 90.2 | 0.101 | 20.3 | 0.100 | 111.9 | 0.103 | 184.4 | 0.100 |
| 100.0 | 0.252 | 22.0 | 0.160 | 120.3 | 0.195 | 239.9 | 1.185 |
| 110.1 | 0.546 | 25.0 | 0.321 | 130.2 | 0.371 | 273.1 | 3.118 |
| 120.1 | 1.026 | 28.0 | 0.575 | 139.9 | 0.639 | 283.0 | 3.989 |
| 130.0 | 1.748 | 30.0 | 0.804 | 149.9 | 1.036 | 293.1 | 5.050 |
| 140.0 | 2.791 | — | — | 160.0 | 1.594 | 303.0 | 6.291 |
| 150.0 | 4.219 | — | — | 170.0 | 2.328 | — | — |
| **154.58** | **5.043 (crit.)** | **33.14** | **1.296 (crit.)** | **190.56** | **4.599 (crit.)** | **309.5** | **7.245 (crit.)** |

### 4.3 Pair performance — common basis

**Basis and health warning.** The chamber states below are representative
equilibrium values at $p_c = 7$ MPa near each pair's practical optimum
mixture ratio, of the kind [CEA] / [CEARUN] produces. $c^*$, $C_F$ and
$I_{sp}$ are then computed with `tools/rocket.py` (Eq. 3.4 and Module 03) at
$\varepsilon = 40$ expanding into vacuum, ideal one-dimensional
constant-$\gamma$ flow. Because $\gamma$ is held at its chamber value this
basis runs roughly **1–2 % below** a shifting-equilibrium CEA run at the same
conditions, and it contains no combustion, divergence or boundary-layer
efficiency at all. Use the column for **ranking and ratios**, not as a
performance prediction; rerun CEA for that. [A]

| pair | $r$ | $T_0$ K | $\mathcal{M}$ | $\gamma$ | $c^*$ m/s | $I_{sp,vac}$ s ($\varepsilon$=40) | $\rho_b$ kg/m³ | $I_d = \rho_b I_{sp}$ kg·s/m³ |
|---|---|---|---|---|---|---|---|---|
| LF₂/LH₂ | 9.0 | 3,960 | 11.8 | 1.22 | 2,561 | **487** | 480 | 234,000 |
| LOX/LH₂ | 6.0 | 3,550 | 13.5 | 1.19 | 2,287 | **442** | 362 | 160,000 |
| LOX/CH₄ | 3.45 | 3,560 | 21.5 | 1.16 | 1,832 | **360** | 825 | 297,000 |
| LOX/RP-1 | 2.65 | 3,670 | 23.3 | 1.15 | 1,792 | **355** | 1,026 | 364,000 |
| N₂O₄/N₂H₄ | 1.35 | 3,260 | 19.6 | 1.19 | 1,819 | **352** | 1,207 | 425,000 |
| N₂O₄/A-50 | 2.00 | 3,390 | 22.0 | 1.17 | 1,761 | **344** | 1,183 | 407,000 |
| N₂O₄/MMH | 2.05 | 3,400 | 22.5 | 1.17 | 1,744 | **341** | 1,190 | 406,000 |
| N₂O₄/UDMH | 2.60 | 3,450 | 23.6 | 1.16 | 1,721 | **339** | 1,193 | 404,000 |
| LOX/NH₃ | 1.40 | 3,070 | 19.3 | 1.21 | 1,768 | **338** | 812 | 274,000 |
| LOX/ethanol (75 %) | 1.55 | 3,000 | 22.6 | 1.19 | 1,625 | **314** | 990 | 311,000 |
| HTP 98 %/RP-1 | 7.30 | 2,960 | 22.5 | 1.19 | 1,618 | **313** | 1,300 | 407,000 |
| N₂O/IPA | 5.00 | 3,050 | 25.0 | 1.20 | 1,553 | **298** | 785 | 234,000 |

Read the last two columns against the $I_{sp}$ column. **LOX/RP-1 beats
LOX/LH₂ by 2.3× on density impulse and loses by 1.24× on $I_{sp}$.** Every
booster-versus-upper-stage propellant argument in history is contained in
those two numbers, and the answer flips depending on which side of the
staging point you are on.

### 4.4 Handling class

An honest planning table. "Ground crew" is the crew size and protective
posture a loading operation demands; "site impact" is what the propellant does
to your facility. [J]

| propellant | toxicity | ground crew | storable? | site impact | relative propellant cost |
|---|---|---|---|---|---|
| LOX | none (asphyxiant, fire risk) | small, standard PPE | no (boils) | LOX-clean plumbing; large vaporiser plume | very low |
| LH₂ | none (asphyxiant) | trained, H₂ detection, exclusion zone | no | invisible flame; detonable cloud; large storage | moderate (liquefaction) |
| LCH₄ | none (asphyxiant) | trained, gas detection | no | visible flame; conventional LNG practice | low |
| RP-1 / RP-2 | low (fuel oil) | standard | **yes, indefinitely** | negligible | low (RP-2 higher) |
| ethanol / IPA | low | standard | yes | negligible | very low |
| HTP | moderate (severe burns) | trained, water deluge, PTFE-lined | yes, with venting | decomposes; must vent; cleanliness | moderate |
| N₂O | low (asphyxiant, anaesthetic) | trained — **decomposition risk** | yes | high-pressure vessels; energetic hazard | very low |
| N₂O₄ / MON | **high** (pulmonary) | SCAPE, scrubber, exclusion zone | yes | dedicated facility; toxic vapour plume | moderate |
| MMH / UDMH / N₂H₄ | **high**, carcinogenic | SCAPE, vapour monitoring, decon | yes | dedicated facility; regulatory exposure (REACH) | high |
| IRFNA | **high**, corrosive | SCAPE | yes | corrodes everything | moderate |
| ClF₃ / LF₂ | **extreme** | not licensable in practice | ClF₃ yes | HF deposition; unextinguishable fire | irrelevant |

---

## 5. Worked examples

### 5.1 WE1 — Tank volume and stage mass for equal Δv: LH₂ vs RP-1 vs CH₄

**Problem.** An upper stage must deliver $\Delta v = 4{,}500$ m/s to a
5,000 kg payload. Fixed stage hardware (engine, avionics, thrust structure,
separation system) is 1,200 kg regardless of propellant. Tanks plus insulation
are charged at a tankage factor $k_v$: **12 kg/m³** for LOX, RP-1 and CH₄
tanks, **18 kg/m³** for the LH₂ tank (larger, insulated, lower operating
pressure) [J]. Ullage is 3 % of propellant volume. Use the §4.3 $I_{sp}$
values and the §4.1 densities. Compare gross mass, propellant mass and tank
volume.

**Method.** $m_f$ depends on tank mass, which depends on volume, which depends
on propellant mass, which depends on $m_f$ — so iterate:

1. Guess $m_{tank} = 0$.
2. $m_f = m_{pl} + m_{fixed} + m_{tank}$.
3. $m_p = m_f\left[\exp(\Delta v/(I_{sp}g_0)) - 1\right]$  (Eq. 3.1).
4. $V = 1.03\, m_p/\rho_b$  (Eq. 3.2 plus ullage).
5. $m_{tank} = k_v V$; return to 2 until converged.

**LOX/LH₂ ($I_{sp} = 441.9$ s, $r = 6.0$).**

$$\rho_b = \frac{1+6}{\dfrac{6}{1141.3} + \dfrac{1}{70.9}}
= \frac{7}{5.257\times10^{-3} + 1.4104\times10^{-2}} = 361.5\ \mathrm{kg/m^3}$$

First pass: $m_f = 6{,}200$ kg;
$\exp[4500/(441.9\times9.80665)] = \exp(1.0384) = 2.8247$;
$m_p = 6{,}200\times1.8247 = 11{,}313$ kg;
$V = 1.03\times11{,}313/361.5 = 32.23$ m³;
$m_{tank} = 18\times32.23 = 580$ kg.

Iterating to convergence (six passes):

- $m_p = 12{,}481$ kg
- $V_{total} = 35.56$ m³ (LOX 9.65 m³, LH₂ **25.90 m³**)
- $m_{tank} = 640$ kg
- $m_0 = m_f + m_p = 6{,}840 + 12{,}481 = \mathbf{19{,}321}$ kg

**LOX/RP-1 ($I_{sp} = 354.8$ s, $r = 2.65$).**
$\rho_b = 3.65/(2.65/1141.3 + 1/810) = 1{,}026.3$ kg/m³. Converged:
$m_p = 16{,}938$ kg, $V = 17.00$ m³ (LOX 11.10, RP-1 5.90),
$m_{tank} = 204$ kg, $m_0 = \mathbf{23{,}342}$ kg.

**LOX/CH₄ ($I_{sp} = 360.3$ s, $r = 3.45$).**
$\rho_b = 4.45/(3.45/1141.3 + 1/422) = 825.2$ kg/m³. Converged:
$m_p = 16{,}596$ kg, $V = 20.71$ m³ (LOX 11.61, CH₄ 9.10),
$m_{tank} = 249$ kg, $m_0 = \mathbf{23{,}045}$ kg.

| | LOX/LH₂ | LOX/RP-1 | LOX/CH₄ |
|---|---|---|---|
| $\rho_b$ (kg/m³) | 362 | 1,026 | 825 |
| propellant (kg) | 12,481 | 16,938 | 16,596 |
| total volume (m³) | **35.6** | 17.0 | 20.7 |
| tank mass (kg) | 640 | 204 | 249 |
| gross mass (kg) | **19,321** | 23,342 | 23,045 |

**Interpretation.** At this Δv the hydrogen stage is **17 % lighter and 109 %
larger**. Methane splits the difference and lands 1.3 % below kerosene on
gross mass despite a 20 % lower bulk density — its small $I_{sp}$ edge is
enough at this Δv, which is exactly why methane is displacing kerosene on new
upper stages.

**Sensitivity — the number that decides real programmes.** Hold the kerosene
stage fixed and ask how heavy the hydrogen tankage could be before the
advantage disappears. Solving for the break-even $k_v$ of the LH₂ stage:

| Δv (m/s) | break-even $k_{v,\mathrm{LH_2}}$ (kg/m³) |
|---|---|
| 2,000 | 69 |
| 3,000 | 60 |
| 4,500 | 48 |
| 6,000 | 38 |

So the hydrogen tank can be four times heavier per unit volume than the
kerosene tank and still win — and the margin *shrinks* as Δv grows, which is
the opposite of the usual classroom claim.

**Sanity check, and what the model does not contain.** A 35.6 m³ hydrogen
stage carrying a 5 t payload is Centaur-class, and Centaur is indeed a
hydrogen stage; a 17 m³ storable-or-kerosene stage of similar capability is
Briz-M-class. Both exist, so the model is not wrong. But it also predicts that
hydrogen wins at *every* Δv, which is plainly false in practice — LOX/LH₂
first stages are rare and getting rarer. What is missing: engine
thrust-to-weight (hydrogen engines are heavy per newton, so a hydrogen booster
suffers gravity loss), stage length driving bending, drag and transport,
ground-hold boil-off, launch-site infrastructure, and reuse economics.
**Never present a stage-mass optimum as a propellant decision.** [J]

*Registered as* `05.WE1` *in* `tools/examples/05.py`.

### 5.2 WE2 — Coking-limit check on an RP-1 cooling channel

**Problem.** A LOX/RP-1 chamber at $p_c = 7$ MPa has 120 rectangular milled
channels, each 1.5 mm wide × 4.0 mm deep, in a copper-alloy liner. RP-1
coolant flow is 18 kg/s total, so 0.15 kg/s per channel; bulk temperature at
the throat station is 400 K. Peak throat heat flux is 25 MW/m². RP-1 at 400 K:
$\rho = 720$ kg/m³, $c_p = 2.40$ kJ/(kg·K), $k = 0.11$ W/(m·K),
$\mu = 3.5\times10^{-4}$ Pa·s. Is the design inside the 700 K coking limit?

**Step 1 — geometry.**
$A = 1.5\times10^{-3}\times4.0\times10^{-3} = 6.00\times10^{-6}$ m².
$D_h = \dfrac{2ab}{a+b} = \dfrac{2(1.5)(4.0)}{5.5}\ \mathrm{mm} = 2.182$ mm.

**Step 2 — flow state.**
$G = \dot m/A = 0.15/6.00\times10^{-6} = 25{,}000$ kg/(m²·s);
$v = G/\rho = 25{,}000/720 = 34.7$ m/s;
$Re = GD_h/\mu = 25{,}000\times2.182\times10^{-3}/3.5\times10^{-4}
= 1.558\times10^{5}$;
$Pr = c_p\mu/k = 2400\times3.5\times10^{-4}/0.11 = 7.64$.

**Step 3 — film coefficient (Eq. 3.6).**
$h = 0.023\,(0.11/2.182\times10^{-3})\,(1.558\times10^{5})^{0.8}(7.64)^{0.4}
= 3.73\times10^{4}$ W/(m²·K).

**Step 4 — wall temperature.**
$\Delta T_{film} = q''/h = 25\times10^{6}/3.73\times10^{4} = 670$ K, so
$T_{wc} = 400 + 670 = \mathbf{1{,}070\ K}$.

**Result.** The design exceeds the 700 K coking limit by 370 K. It will coke,
the deposit will insulate, and the liner will burn through — not on the first
test, which is what makes this failure mode expensive.

**Step 5 — what fixes it.** Raise $h$ by raising velocity
($h \propto \dot m^{0.8}$), or lower $q''$:

| per-channel $\dot m$ (kg/s) | $v$ (m/s) | $h$ W/(m²·K) | $T_{wc}$ at 25 MW/m² | $T_{wc}$ at 15 MW/m² |
|---|---|---|---|---|
| 0.15 | 34.7 | 37,300 | 1,070 K | 802 K |
| 0.25 | 57.9 | 56,100 | 846 K | 667 K |
| 0.35 | 81.0 | 73,500 | 740 K | 604 K |

Even at 81 m/s — already at the erosion and pressure-drop limit, since
$\Delta p \propto v^2$ and doubling velocity roughly quadruples pump work —
the channel is still marginal at 25 MW/m². **The conclusion is architectural,
not parametric: an RP-1 engine at this heat flux cannot be cooled by the fuel
alone.** It needs fuel film cooling at the injector periphery to knock the
gas-side flux down, which is exactly what the F-1 (film cooling plus a
gas-generator exhaust curtain over the nozzle extension) and Merlin (film
cooling) do (engine database). Substituting methane changes the answer: the
same 25 MW/m² against a ~1,050 K decomposition limit passes at 0.25 kg/s per
channel with margin. For reference, the metal temperature drop through a
0.9 mm copper-alloy wall at 25 MW/m² is only $q''t/k = 73$ K — the film drop,
not the wall drop, is what kills you.

**Sanity check.** Real RP-1 chamber coolant velocities run 20–60 m/s and real
throat fluxes 15–30 MW/m² at these chamber pressures, so these numbers sit
where they should — and so does the conclusion, since no high-$p_c$ kerosene
engine in service is cooled without film cooling.

*Registered as* `05.WE2` *in* `tools/examples/05.py`.

### 5.3 WE3 — Boil-off from an LH₂ tank

**Problem.** A 100 m³ LH₂ tank with 120 m² of insulated wetted surface has a
measured heat leak of 2.0 W/m² through its multi-layer insulation. The tank is
vented, holding saturation at 101 kPa. Find the boil-off rate in kg/day and as
a percentage of load per day, and compare with the same tank filled with LOX
or LCH₄.

**Step 1 — heat leak.** $\dot Q = q''A = 2.0\times120 = 240$ W.

**Step 2 — latent heat.** From [NIST-WB] at NBP, $h_g - h_f$ for hydrogen is
$448.42 - (-0.535) = 448.96$ kJ/kg.

**Step 3 — boil-off (Eq. 3.7).**
$\dot m_{bo} = 240/448{,}960 = 5.35\times10^{-4}$ kg/s $= 0.53$ g/s
$= \mathbf{46.2\ kg/day}$.

**Step 4 — as a fraction of load.** Load $= \rho V = 70.9\times100 =
7{,}090$ kg. Daily loss $= 46.2/7{,}090 = \mathbf{0.65\ \%/day}$.

**Step 5 — the comparison that matters.** Same tank, same insulation, same
heat leak, latent heats from [NIST-WB]:

| fluid | $h_{fg}$ kJ/kg | load in 100 m³ (kg) | boil-off kg/day | %/day |
|---|---|---|---|---|
| LH₂ | 449 | 7,090 | 46.2 | **0.65** |
| LOX | 213 | 114,130 | 97.3 | 0.085 |
| LCH₄ | 510 | 42,199 | 40.6 | 0.096 |

**Interpretation.** LOX boils off more than twice as fast *in kilograms* — it
has half the latent heat — yet loses roughly **eight times less** of its load
per day, because the same volume holds sixteen times more mass. Hydrogen's
boil-off problem is not thermodynamic weakness; it is a density problem
wearing a thermodynamic disguise. This is why a hydrogen upper stage has a
coast-time limit measured in hours while a storable stage has one measured in
years, and why long-duration cryogenic propulsion is an active-cooling problem
(zero-boil-off cryocoolers) rather than an insulation problem. [M]

**Sanity check.** Flight-tank MLI performance is roughly 0.5–3 W/m² depending
on layer count, penetrations, and whether the tank is on the pad or on orbit;
2 W/m² is a realistic pad-hold number, and sub-1 %/day is the figure quoted
for well-insulated flight hydrogen stages. If your calculation returns
10 %/day you have a penetration you have not counted — struts, feedlines and
instrumentation leads typically carry more heat than the insulated area does.

*Registered as* `05.WE3` *in* `tools/examples/05.py`.

---

## 6. Real engines — why they chose what they chose

All engine figures below are from the course engine database
(`reference/engine-database.md`, compiled in `reference/_verify-liquid.md`),
with its confidence labels carried over.

### 6.1 V-2 (1942) — LOX / 75 % ethanol

**Choice:** LOX with a deliberately diluted alcohol. **Alternatives available:**
pure alcohol, gasoline, nitric-acid oxidisers (studied), kerosene (understood
but not obtainable at the required purity and scale).

**Why it made sense:** Thiel's chamber was mild steel, double-walled, with four
rings of film-cooling holes injecting about 10 % of the fuel along the wall —
and the film cooling did most of the work; the regenerative jacket alone was
insufficient. Water in the fuel bought the wall temperature margin the
materials could not provide, and ethanol was producible at scale from
agricultural feedstock. Chamber pressure was 15.2 bar and $\varepsilon = 3.5$;
$I_{sp}$ was about 203 s sea level and 239 s vacuum, with roughly 94 % $c^*$
efficiency from the 18-pot injector. The whole design is coolant-limited, and
the propellant choice *is* the cooling solution.

**Would a modern engineer choose it?** No — but the reasoning survives intact.
Diluting a propellant to protect a wall is exactly what film cooling and
barrier cooling do today; the V-2 simply did it in the tank instead of at the
injector, which is the least mass-efficient place to do it.

### 6.2 Titan II/III/IV (1962–2005) — N₂O₄ / Aerozine-50

**Choice:** fully storable hypergolic propellants for both stages (LR87-AJ-11
at $r = 1.91$, 59.1 bar, 302 s vacuum; LR91-AJ-11 at $r = 1.86$, 59.3 bar,
316 s vacuum). **Alternatives:** LOX/RP-1, as flown on Titan I; cryogenic
upper stages.

**Why it made sense:** the mission was to sit in a silo, fuelled, for years,
and launch on command. A cryogenic vehicle cannot do that at any price —
Titan I had to be raised and fuelled first. Storables also delete the ignition
system entirely (hypergolic ignition, "none required — this is the whole point
of the propellant choice") and give an air-start of embarrassing reliability.
The $I_{sp}$ penalty against kerolox is about 10 s and the density impulse is
actually *better* (§4.3). The LR91's regen chamber with an ablative nozzle
skirt is a clean example of using two cooling technologies where each is
cheapest.

**Would a modern engineer choose it?** For a silo-based missile, yes, and they
still do. For a launch vehicle, no: Aerozine-50 and N₂O₄ are carcinogenic,
corrosive and lethal, ground handling cost is enormous, and $I_{sp}$ is
unremarkable. Titan IV flew its last mission in 2005 and nothing storable of
that scale replaced it.

### 6.3 Saturn upper stages (1966–1973) — LOX / LH₂ on the J-2

**Choice:** hydrogen for S-II and S-IVB, kerosene for S-IC. **Alternatives:**
kerolox throughout (simpler, understood, no new ground system); storables
(rejected on performance and crew safety).

**Why it made sense:** the staging arithmetic of Worked Example 1 applied at
lunar-mission Δv. Hydrogen's ~100 s of $I_{sp}$ over kerosene compounds
through two stages; the first stage, where thrust density dominates and stage
Δv is small, keeps kerosene. The J-2 (1,033 kN vacuum, 52.6 bar, 421 s,
$\varepsilon = 27.5$) also introduced the two features every hydrogen engine
has used since: the **coaxial shear injector** — 614 hollow oxidiser posts
with concentric fuel annuli through a porous sintered faceplate that
transpiration-cools the face with hydrogen — and the **augmented spark
igniter**, a small LOX/LH₂ torch at the injector centre. The ASI is what made
restart, and therefore translunar injection from a parking orbit, possible.

**Would a modern engineer choose it?** For that mission and era, yes without
hesitation; NASA's hydrogen infrastructure grew out of it ([SP-4404],
[SP-4230]). For a modern reusable architecture, increasingly no — see §6.7.

### 6.4 Soviet kerolox and the ORSC tradition (1963–today)

**Choice:** RG-1 kerosene with LOX, burned in **oxidiser-rich staged
combustion** — RD-253 (147 bar, first flight 1965, the first ORSC engine ever
flown), RD-170/171, RD-180 (267 bar, 3,830 kN sea level), RD-191, and the
Kuznetsov NK-33 (148 bar, T/W 137:1). **Alternatives:** the gas-generator
cycle the Americans used; hydrogen (no Soviet infrastructure until Energia).

**Why it made sense:** if you must have high chamber pressure with a
hydrocarbon, the obstacle is a fuel-rich preburner sooty enough to foul a
turbine. Going oxidiser-rich removes the soot, gives dense cool turbine gas,
and therefore a small turbine for a given power — the RD-253's 156:1
thrust-to-weight is the direct payoff. The West did not follow because
oxygen-rich hot gas burns metal; Energomash's inert enamel coating on every
wetted surface was the enabling technology and was closely held. The result is
that the highest-performing kerosene engines ever built are Russian by a
substantial margin, and the United States bought RD-180s for twenty years
rather than match them.

**Would a modern engineer choose it?** Yes — and they did: BE-4 is ORSC, and
its existence is the direct consequence of RD-180 supply being cut off.

### 6.5 Space Shuttle (1981–2011) — LOX / LH₂ at 206 bar

**Choice:** hydrogen in a *first*-stage engine, with solid boosters supplying
the thrust density hydrogen cannot. **Alternatives:** a kerolox core with
smaller boosters; storables (never seriously considered for a crewed
reusable).

**Why it made sense:** the RS-25 had to be reusable and had to give the
orbiter enough $I_{sp}$ to reach orbit while carrying its own engines to orbit
and back. Hydrogen is also the only coolant that survives 206 bar fuel-rich
staged combustion — $c_p \approx 10$ kJ/(kg·K) through 390 milled channels in
a NARloy-Z liner and a 1,080-tube brazed nozzle — and the exhaust is steam,
which matters when three engines fire under a crewed vehicle. The costs: the
external tank is mostly hydrogen by volume, and the SRBs exist largely to make
up the thrust.

**Would a modern engineer choose it?** No, and the programme's own history
delivers the verdict: the RS-25 now flies **expendably** on SLS. When your
reusable engine ends up expendable, the reusability premise has been
falsified.

### 6.6 Merlin (2013–) — LOX / RP-1, gas generator, on purpose

**Choice:** the least sophisticated propellant-and-cycle combination on this
list, at 97 bar. **Alternatives:** methane (SpaceX chose it later, for
Raptor); staged combustion (chosen by nobody at SpaceX).

**Why it made sense:** RP-1 is ambient-storable, dense (small tanks, short
stage, road-transportable), non-toxic, and pumped by a single-shaft
dual-impeller turbopump. The design is optimised for **cost and production
cadence**, not $I_{sp}$: 470 kg dry, 184:1 thrust-to-weight — the highest of
any flown orbital-class engine — and hundreds of units a year. Even the TVC
actuators run on RP-1 tapped from the pump discharge and returned to the
inlet, so there is no separate hydraulic fluid to run out, which is exactly
the failure that has ended other vehicles. The stated limitation is honest:
gas generator plus 97 bar means the Merlin will never be efficient.

**Would a modern engineer choose it again?** For a first-stage engine built by
the hundred and reflown quickly — arguably yes, and the flight record supports
it. But SpaceX's own next engine is methane, for the reasons in §6.7.

### 6.7 Raptor and BE-4 (2024–) — LOX / CH₄, two different answers

**Choice:** subcooled methane in staged combustion. **Raptor** is full-flow
staged combustion — an oxidiser-rich preburner and a fuel-rich preburner, both
exhausting into the chamber — with claimed 300–330 bar chamber pressure, and
it is the first FFSC engine ever flown. **BE-4** is single-preburner ORSC at a
deliberately modest 140 bar with hydrostatic rather than rolling-element
bearings. *All Raptor figures are SpaceX claims, several traceable only to
social-media statements; carry the attribution.*

**Why methane made sense for both:** no coking, so the jacket can run hotter
and the engine can be reflown without carbon in the turbine or on the injector
face; a boiling point 21 K from LOX's, so one cryogenic regime, autogenous
pressurisation, and no helium; and a few seconds of $I_{sp}$ over kerosene for
free. Raptor adds in-situ propellant production on Mars as an explicit
programme driver.

**Why they differ:** Raptor optimises performance density; BE-4 optimises
life. Blue Origin has been explicit that its low chamber pressure is a
life-and-reusability choice rather than a limitation, and the hydrostatic
bearings say the same thing. Both are defensible; they are answers to
different questions, and a student who can articulate that distinction
understands propulsion trade studies.

### 6.8 RL10 and Vinci — the expander cycle needs hydrogen

The RL10A-3-3A (1962 family, 32.8 bar, 73.4 kN, 444–445 s, $\varepsilon = 61$)
and Vinci (first flight 2024, 60 bar, 180 kN, 457.2 s, $\varepsilon = 240$)
both close their power cycle on hydrogen heated in the chamber wall — no
preburner, nothing dumped. §3.9 explains why the fuel must be hydrogen and why
$p_c$ is capped: the RL10's chamber pressure is a heat-balance result, not a
design preference, and Vinci needed a 26-year development to reach 180 kN and
is still the largest closed expander ever flown. Vinci's nozzle is about 70 %
of engine mass (550 kg total, 160 kg without it) — a striking illustration of
where the mass goes in a high-$\varepsilon$ upper-stage engine.

**Would a modern engineer choose it?** For a high-$\varepsilon$,
multi-restart, long-life upper stage where simplicity beats thrust — yes,
which is why the RL10 has been in production for over six decades.

### 6.9 Aestus and the Shuttle OMS — storables where restart is everything

Aestus (N₂O₄/MMH, $r = 1.9$, pressure-fed at **11 bar**, 324 s vacuum,
$\varepsilon = 84$, 1,100 s burn, multiple re-ignitions) and the OMS AJ10-190
(N₂O₄/MMH, $r = 1.65$, pressure-fed at 8.6 bar, 316 s, certified for
**1,000 starts and 100 missions**) show what storables buy: an engine with no
turbopump, no igniter and no power cycle that starts every time after months
in orbit. The OMS is one of very few reusable rocket engines of any kind, and
refurbished units now fly on Orion's European Service Module.

Aestus is also the cleanest available demonstration that low chamber pressure
need not mean low $I_{sp}$: 324 s from 11 bar, achieved with an
$\varepsilon = 84$ nozzle and 132 coaxial swirl elements — an unusual injector
choice for a hypergolic engine, where impinging doublets are the norm.

**Would a modern engineer choose it?** For an in-space stage that must restart
after long coast, storables still win, and MMH/MON still flies. The pressure
on this architecture is regulatory rather than technical: REACH authorisation
of hydrazine is the live threat.

### 6.10 Two outliers worth knowing: XLR99 and Gamma

**XLR99 (X-15, 1960) — LOX / anhydrous ammonia**, 250 kN, 41.4 bar, 279 s
vacuum, throttleable 50–100 % *by the pilot with a lever*, with in-flight
shutdown and restart. Ammonia gave a clean, non-sooting, high-heat-capacity
regenerative coolant for an engine turned around between sorties like an
aircraft engine. Kerosene would have coked the chamber and the throttle valve.
It cost $I_{sp}$ and bought operability — the first man-rated throttleable
restartable large liquid engine, fifty years before anyone else did it
routinely.

**Gamma (Black Arrow, 1971) — 85 % HTP / kerosene at $r = 8$.** The very high
mixture ratio is characteristic of HTP, which is mostly oxygen and water by
mass. The HTP is decomposed over a silver-plated nickel-gauze catalyst pack to
600 °C steam and oxygen, and kerosene injected into that stream ignites
spontaneously: **no igniter and no hypergolic slug — the catalyst pack is the
ignition system.** Gamma 8 reached 47.4 bar and 265 s vacuum; 128 Gamma
engines flew across 26 launches with zero failures, and Black Arrow made the
UK the only nation ever to develop orbital launch capability and then abandon
it.

**Would a modern engineer choose HTP?** For a small, storable, non-toxic,
self-igniting, catalytically started system it deserves more consideration
than it gets, and several small-launcher efforts have revisited it. For
anything performance-driven, no.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The trade-offs in one place

| if the driver is… | the propellant answer is… | because |
|---|---|---|
| maximum Δv per unit mass, volume free | LOX/LH₂ | highest $I_{sp}$ (§4.3) |
| maximum Δv per unit volume | LOX/RP-1 or storables | highest $I_d$ |
| storage for years, instant start | N₂O₄/MMH or N₂O₄/UDMH | no boil-off, hypergolic |
| many restarts, long life, rapid reuse | LOX/CH₄ | no coking, torch ignition, one cryo regime |
| minimum cost per unit thrust | LOX/RP-1 | cheapest fluids, simplest ground system |
| crewed vehicle, minimum toxic exposure | LOX + hydrocarbon, or LOX/LH₂ | no SCAPE, no exclusion zone |
| no ignition system at all | storables, or HTP + hydrocarbon | hypergolic or catalytic |
| in-situ production off Earth | LOX/CH₄ | Sabatier from CO₂ and H₂ |

### 7.2 Failure modes

**Coking burn-through.** *Mechanism:* hydrocarbon pyrolysis deposits carbon on
the coolant-side wall; the deposit insulates; metal temperature rises;
deposition accelerates. *Symptom:* rising chamber-side wall thermocouple
readings across a test series, rising coolant $\Delta p$, then a localised
burn-through. *Evidence:* borescope of channels showing black deposit, jacket
$\Delta p$ trending up run over run, post-test metallography showing a carbon
layer. *Fix:* raise coolant velocity, add fuel film cooling, move to RP-2 or
methane, or lower $q''$ by changing the near-wall mixture ratio at the
injector.

**Hard start from cold-soak hypergolic delay.** *Mechanism:* ignition delay
rises with falling propellant temperature (Eq. 3.5); unburned propellant
accumulates; it detonates. *Symptom:* a chamber-pressure spike well above
steady state in the first milliseconds, or a departed injector. *Evidence:*
high-speed $p_c$ trace with a spike-then-recover shape; propellant inlet
temperatures below the interface limit. *Fix:* propellant heaters, minimum
temperature limits in the flight rules, valve sequencing that limits
accumulated mass, and cold-soak qualification testing.

**LOX-system ignition.** *Mechanism:* a hydrocarbon contaminant or metal
particle is impacted or rubbed in high-velocity oxygen; the local energy
release ignites it; the metal itself then burns. *Symptom:* a fire that starts
inside a valve or bellows and consumes the component. *Evidence:* cleanliness
records, particle counts, and a burn pattern originating at a flow
restriction. *Fix:* precision cleaning to specification with verification,
material selection (no titanium), velocity limits in oxygen lines, and no soft
goods outside the approved list.

**Hydrogen embrittlement fracture.** *Mechanism:* atomic hydrogen enters a
high-strength alloy and reduces fracture toughness. *Symptom:* brittle
fracture well below the design allowable, often after time in service.
*Evidence:* fractography showing intergranular or quasi-cleavage fracture in a
material that should be ductile. *Fix:* substitute low-strength austenitic
stainless, aluminium or copper alloys; plate susceptible surfaces; and test in
hydrogen rather than in air. [G-095]

**N₂O₄ / titanium stress-corrosion cracking.** *Mechanism:* nitric acid formed
from trace water in N₂O₄ cracks Ti-6Al-4V under stress. *Symptom:* tank
leakage after storage, not after loading. *Evidence:* branched intergranular
cracks originating at the wetted surface. *Fix:* specify MON with a minimum NO
content; this is the historical origin of the MON family. [H]

**Geysering water-hammer.** *Mechanism:* §3.7. *Symptom:* pressure spikes in
the feedline during pad hold with the engine valve closed. *Evidence:* line
pressure transducers showing periodic spikes correlated with line wall
temperature. *Fix:* recirculation, helium bubbling, or continuous bleed.

### 7.3 Materials

The propellant chooses the material list more than the stress analysis does.

- **LOX:** aluminium 2219/2195, 300-series stainless, Inconel, Monel; PTFE and
  PCTFE seals; **no titanium**, no ordinary elastomers, and velocity limits
  where particle impact is credible.
- **LH₂:** aluminium (essentially immune), 304L/316L austenitic stainless,
  copper alloys; avoid high-strength martensitic steels and qualify nickel
  alloys *in hydrogen*. Sealing is hard: hydrogen leaks through joints that
  hold helium.
- **RP-1:** almost anything — carbon steel, stainless, aluminium, most
  elastomers (nitrile, fluorocarbon). This forgiving compatibility is a real
  and underrated part of kerosene's cost advantage.
- **N₂O₄ / MON:** 300-series stainless, aluminium 6061/2219; titanium **only**
  with MON; PTFE and PCTFE seals; no ordinary elastomers.
- **Hydrazines:** 300-series stainless and aluminium; avoid copper, cobalt,
  molybdenum and iron oxides, which catalyse decomposition. This is why a
  hydrazine system's cleanliness specification reads like a catalyst-exclusion
  list.
- **HTP:** passivated aluminium (1060, 5254), passivated 300-series stainless,
  PTFE; **no** copper, no silver except as a deliberate catalyst, no rust, and
  very few elastomers.

### 7.4 Manufacturing and ground systems

Propellant choice reaches into the factory. LOX-clean assembly means a
controlled environment, dedicated tooling, solvent handling, and verification
per joint — a measurable fraction of engine cost. Hydrogen demands
leak-tight joints, helium mass-spectrometer leak checks, and purge-inerted
volumes everywhere. Storables require a dedicated fuelling facility, a
scrubber, SCAPE suits, a trained crew and a decontamination plan, and the
facility must be maintained whether or not you are launching. Methane's
underrated advantage is that all of this is *conventional LNG practice*, with
an existing industrial base, existing codes and existing trained people. [J]

### 7.5 Testing

- **Propellant acceptance:** density and distillation (RP-1), assay and
  stability (HTP: decomposition rate under standard conditions), water content
  (N₂O₄ — the SCC driver), NO content (MON), para fraction (LH₂), sulphur
  (RP-2).
- **Cleanliness verification:** particle count and non-volatile residue on
  swab or flush samples, against a stated limit per unit surface area, before
  any LOX or HTP system is closed out.
- **Coking:** long-duration hot-fire with jacket $\Delta p$ trended run over
  run and borescope inspection between runs. The instrument that finds coking
  first is the pressure transducer across the jacket, not a thermocouple.
- **Ignition delay:** drop tests and small-scale engine starts across the
  qualification temperature range; the plot to read is chamber pressure versus
  time from valve command, with delay measured to 10 % of steady $p_c$. A
  delay that grows non-linearly as temperature falls is the signature of an
  approaching hard start.
- **Boil-off:** tank calorimetry — fill, vent or lock up, measure vent mass
  flow or pressure rise, back out $\dot Q$. A discrepancy between predicted and
  measured heat leak is almost always penetrations (struts, lines,
  instrumentation leads) rather than the insulation blanket.

---

## 8. Misconceptions and what engineers actually care about

**"Hydrogen is best because its flame is hottest."** Backwards. At flight
mixture ratio LOX/LH₂ burns *cooler* (≈ 3,550 K) than LOX/RP-1 (≈ 3,670 K).
Hydrogen wins on $\mathcal{M} \approx 13.5$ versus 23, through the
$\sqrt{T_0/\mathcal{M}}$ in Eq. 3.4.

**"Run at stoichiometric for maximum performance."** No — maximum $I_{sp}$ is
always fuel-rich of stoichiometric, because the molar-mass reduction beats the
temperature loss, and dissociation blunts the temperature gain anyway. The
engineering reasons (wall temperature, turbine drive gas) push the same way.

**"Density impulse decides boosters, so kerosene always wins below staging."**
Density impulse matters, but Worked Example 1 shows a simple stage-mass model
preferring hydrogen at every Δv. The real booster argument is about *engine*
thrust-to-weight, stage length, gravity loss and ground infrastructure — none
of which appears in $I_d$. Quote $I_d$ as a volume-efficiency metric, not as a
stage-optimisation result.

**"Storable propellants are obsolete."** MMH/MON flies today on Orion, on
essentially every GEO satellite, and on most planetary spacecraft. Nothing
else offers hypergolic ignition after years in vacuum. The threat to
hydrazines is regulatory, not technical.

**"Methane is chosen for its specific impulse."** It is worth about 5 s over
kerosene — inside the uncertainty of most preliminary designs. Methane is
chosen for coking, cryogenic commonality with LOX, autogenous pressurisation,
and reusability.

**"RP-1 is just jet fuel."** RP-1 is defined mostly by what it may *not*
contain: olefins, aromatics above a limit, and sulphur. Each of those limits
exists because the constituent cokes a cooling channel. RP-2 tightens sulphur
by roughly an order of magnitude for exactly that reason.

**"Cryogenic propellants boil off because they are poorly insulated."**
Insulation is part of it; the dominant term for hydrogen is that a given tank
volume holds very little mass, so any loss is a large *fraction*. Worked
Example 3: LOX boils twice as many kg/day as LH₂ in the same tank and loses
eight times less of its load.

**"You can substitute a propellant late in a programme if performance
requires it."** You cannot. Tank volume, structure, materials, seals,
cleanliness specification, ground equipment, launch-site licensing and crew
training are all downstream of the propellant. Changing it is a new vehicle.

### What engineers in this area actually spend their day on

1. **Coolant-side wall temperature and its margin.** Not $I_{sp}$ — $T_{wc}$.
   It sets channel geometry, coolant velocity, pump discharge pressure,
   film-cooling fraction, and engine life.
2. **Vapour pressure at the pump inlet.** Tank pressurisation, pressurant
   mass, boost pumps and start transients all trace to whether NPSH margin
   exists at every point of the mission, including the low-g coast nobody
   analysed.
3. **Bulk density and the volume it implies.** Stage diameter is usually fixed
   by the fairing or the factory, so volume becomes length, and length becomes
   bending frequency, drag and transport cost.
4. **Compatibility and cleanliness paperwork.** Unglamorous, and the source of
   more failures than combustion instability: a wrong O-ring material, an
   uncleaned valve, a titanium fitting in a LOX line.
5. **How long the propellant has to sit there.** Boil-off, decomposition,
   freezing, ullage growth, and whether the loaded vehicle can wait out a
   24-hour scrub.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can name the storage state, approximate density
and toxicity class of LOX, LH₂, CH₄, RP-1, N₂O₄/MON and MMH; explain in plain
language why hydrogen gives high $I_{sp}$ and low density impulse; say what
hypergolic means and why it matters; and name two engines for each of the four
main propellant pairs.

**Level 2 — Working engineering knowledge.** You can compute $c^*$, $I_{sp}$,
$\rho_b$ and $I_d$ for any pair given chamber conditions and densities; size a
stage's tanks including the iteration of Worked Example 1; read a NIST
saturation table and pull the right values for a feed-system or cooling
calculation; run the coking check of Worked Example 2 and say what you would
change; estimate boil-off; and state the compatibility rules and cleanliness
requirements for LOX, hydrazine and HTP systems from memory.

**Level 3 — Interview mastery.** Given an unfamiliar mission you can select a
propellant pair, name the single constraint that decides it, argue the
runner-up's case honestly, and identify what you would measure or compute to
confirm the choice. You can explain why the RL10 cannot simply be scaled to
500 kN, why the Soviets went oxidiser-rich and the Americans did not, why the
Shuttle used hydrogen in a first-stage engine and why that decision looks
different in retrospect, and why methane is displacing kerosene even though it
is barely faster. You can also say, for any propellant in §4.1, what would go
wrong first if you got its temperature wrong by 30 K.

---

## 10. Problems

### Conceptual

**C1.** LOX/LH₂ at flight mixture ratio burns cooler than LOX/RP-1 yet
delivers about 25 % more specific impulse. Explain the mechanism
quantitatively using Eq. 3.4, and state which term dominates.

**C2.** Neat hydrazine melts at 274.7 K. List three distinct system-level
consequences of that number for a spacecraft designed for a ten-year GEO
mission, and explain how Aerozine-50 and MMH each address it.

**C3.** Why is the optimum mixture ratio for maximum $I_d$ higher than the
optimum for maximum $I_{sp}$? Argue from Eq. 3.2 and Eq. 3.3 without computing
anything.

**C4.** An engineer proposes replacing RP-1 with RP-2 in an existing
regeneratively cooled engine to allow a 15 % increase in chamber pressure.
What must be re-qualified, and what would you insist on measuring across the
test series?

**C5.** Explain why a closed expander cycle is essentially restricted to
hydrogen, using Eq. 3.10. Then explain why a methane *expander bleed* cycle is
nonetheless plausible while a methane *closed* expander at 200 kN is not.

**C6.** Nitrous oxide is self-pressurising, non-toxic and cheap, yet no
orbital launch vehicle uses it as the primary oxidiser. Give three independent
technical reasons.

**C7.** Mercury-Redstone reverted from Hydyne to 75 % ethanol, giving up
performance. Reconstruct the argument that made that the right decision, and
name a modern decision with the same structure.

**C8.** A test stand reports that a kerosene engine's coolant jacket pressure
drop has risen 8 % over twelve firings while chamber pressure and flow rate
are unchanged. What is happening, what happens next, and what is the cheapest
diagnostic?

### Calculation

**N1.** Compute $\rho_b$ and $I_d$ for LOX/LH₂ at $r = 5.0$ and at $r = 6.5$,
using the §4.1 densities and taking $I_{sp}$ as 445 s and 439 s respectively.
Which mixture ratio would a volume-limited stage prefer, and by what
percentage in $I_d$?

**N2.** A propellant pair has $T_0 = 3{,}400$ K, $\mathcal{M} = 22.5$ kg/kmol,
$\gamma = 1.17$. Compute $R$, $c^*$, and vacuum $I_{sp}$ at $\varepsilon = 40$
with $p_c = 7$ MPa. Then compute $I_{sp}$ at $\varepsilon = 100$ and comment
on the diminishing return.

**N3.** Repeat Worked Example 1 for $\Delta v = 3{,}000$ m/s with all other
inputs unchanged, and report gross mass and total tank volume for all three
pairs. Which pair now gives the smallest gross mass, and by how much?

**N4.** A methane cooling channel is 1.2 mm × 3.5 mm, carries 0.08 kg/s of
supercritical methane at a bulk temperature of 250 K, and sees 30 MW/m². Take
$k = 0.075$ W/(m·K), $c_p = 3.6$ kJ/(kg·K), $\mu = 3.0\times10^{-5}$ Pa·s,
$\rho = 210$ kg/m³. Compute $Re$, $Pr$, $h$ and $T_{wc}$, and compare with a
1,050 K decomposition limit.

**N5.** An LH₂ tank of 250 m³ with 260 m² of insulated surface must hold
propellant through a 14-day orbital loiter with no more than 5 % total
boil-off. What is the maximum permissible average heat flux, in W/m²? Comment
on whether that is achievable passively.

**N6.** A saturated LOX tank is pressurised to 0.35 MPa with helium and feeds
a pump 4.0 m below the liquid surface under 3.0 g axial acceleration. Line
loss is 40 kPa. Compute NPSH available. Then recompute for LOX subcooled to
80 K (take $p_v$ from §4.2 by interpolation) and comment.

**N7.** Using §4.2, find the tank temperature at which liquid methane's vapour
pressure equals 0.8 MPa. If the tank is pressure-limited to 0.6 MPa, what is
the maximum bulk temperature the propellant may reach before venting is
mandatory, and how much sensible heat per kilogram is available between NBP
and that temperature?

**N8.** A stage carries 12,000 kg of N₂O₄/MMH at $r = 1.65$. Compute the
volume of each tank at 293 K with 4 % ullage, then the volume change if the
spacecraft cold-soaks to 268 K (take a volumetric thermal expansion
coefficient of $1.1\times10^{-3}$ /K for both fluids). Does anything freeze?

### Engineering reasoning

**R1.** A customer wants a 500 kN upper-stage engine with $I_{sp}$ above
450 s, six restarts, and a nine-month coast before the final burn. Explain
which requirements are mutually incompatible and propose the two least-bad
architectures.

**R2.** You are handed hot-fire data from a LOX/RP-1 engine: $c^*$ efficiency
falls from 0.97 to 0.94 over eight tests, jacket $\Delta p$ rises 12 %, and the
throat wall thermocouple reads 60 K hotter on the last test than the first.
Diagnose, and state the three measurements you would take before the next
firing.

**R3.** Two teams propose upper stages for the same vehicle: one LOX/LH₂ at
$I_{sp} = 460$ s, one LOX/CH₄ at 380 s. The LH₂ stage is 40 % longer. Vehicle
diameter and fairing are fixed, and the mission includes a 6-hour coast. Argue
both sides, then state the single piece of data that would settle it.

**R4.** A cubesat propulsion vendor offers an N₂O/IPA bipropellant thruster
and claims "non-toxic, self-pressurising, no ignition system needed." Evaluate
each claim, and state what you would require in the qualification programme
before flying it inside a spacecraft that visits a crewed vehicle.

### Mini trade study

**T1.** You are propulsion lead for a reusable single-stage suborbital
vehicle: 100 km apogee, 1,000 kg payload, 24-hour turnaround with inspection
but no engine teardown, launched from a coastal site with no existing
propellant infrastructure. Candidates:

- (a) LOX/RP-1
- (b) LOX/CH₄
- (c) LOX/LH₂
- (d) HTP 90 % / kerosene

Constraints: the vehicle must sit fuelled for up to 4 hours during a hold;
propellant cost must be under 5 % of per-flight cost; no SCAPE-level toxic
handling is permitted; the engine must restart in flight at least once.

Recommend one, with quantitative justification (use §4.3 and Worked Examples
1–3 where they apply), state what you are giving up, and name the single test
that would most cheaply falsify your recommendation.

---

## 11. Quiz (100 points)

**Q1 (5).** Which propellant pair in §4.3 has the highest density impulse, and
which has the highest specific impulse? State both values.

**Q2 (10).** Multiple choice. Flight mixture ratios are fuel-rich of
stoichiometric primarily because:
(a) fuel is cheaper than oxidiser;
(b) reducing mean molar mass raises $c^*$ more than the temperature loss costs;
(c) fuel-rich combustion is inherently more stable;
(d) it prevents oxidiser-rich burning of the injector face.

**Q3 (10).** Compute $c^*$ for $T_0 = 3{,}560$ K, $\mathcal{M} = 21.5$ kg/kmol,
$\gamma = 1.16$. Show units at every step.

**Q4 (10).** A tank of liquid methane at 150 K is fitted with a relief valve
set to 1.0 MPa. Using §4.2, state whether the valve will lift, and give the
temperature margin.

**Q5 (10).** Multiple choice. Titanium alloys are prohibited in liquid oxygen
systems because:
(a) they embrittle at cryogenic temperature;
(b) they are impact-sensitive in oxygen and will burn;
(c) they catalyse oxygen decomposition;
(d) they cannot be welded to aluminium.

**Q6 (15).** An RP-1 channel carries 0.20 kg/s, $D_h = 2.0$ mm, channel area
$5.5\times10^{-6}$ m², $k = 0.11$ W/(m·K), $\mu = 3.5\times10^{-4}$ Pa·s,
$c_p = 2.40$ kJ/(kg·K), bulk temperature 420 K, heat flux 18 MW/m². Compute
$T_{wc}$ and state whether the design passes a 700 K limit.

**Q7 (10).** Explain in three sentences why the RL10's chamber pressure is
32.8 bar while the RS-25's is 206 bar, when both burn LOX/LH₂.

**Q8 (10).** Judgment. A programme proposes switching a spacecraft from
MMH/MON to LOX/CH₄ to eliminate toxic handling. The spacecraft must perform a
burn after 400 days in orbit. Give the two strongest arguments against, and
say what you would need to see to be convinced.

**Q9 (10).** A 40 m³ LOX tank has a heat leak of 300 W. Compute the boil-off
in kg/day and as a percentage of load per day ($h_{fg} = 213$ kJ/kg).

**Q10 (10).** Judgment. You must choose between RP-1 and RP-2 for a new
reusable booster engine at 120 bar chamber pressure with fuel film cooling.
State the technical case for each, name the cost you are accepting, and give
your recommendation with the reasoning a chief engineer would want to hear.

---

## 12. Further reading

- **[SB]**, the propellant and thrust-chamber chapters — the standard tables of
  propellant properties and theoretical performance, and the place to check
  any number in §4 against a second source.
- **[NIST-WB]** — go here first for O₂, H₂, CH₄, N₂, N₂O and NH₃. Every
  cryogenic number in this module came from it. Learn the saturation-table
  interface; you will use it weekly.
- **[REFPROP]** — when you need supercritical hydrogen or methane properties
  inside a cooling-jacket calculation, [NIST-WB]'s fixed query set is not
  enough and this is the tool.
- **[Clark]** — *Ignition!*, for hypergolic chemistry, storability, and the
  human cost of chlorine trifluoride. Read it for judgment, not for numbers;
  it is a memoir.
- **[CEA]** / **[CEARUN]** with **[RP-1311]** Part I — rerun every performance
  number in §4.3 yourself, and read Part I first, particularly the
  frozen-versus-equilibrium distinction.
- **[G-095]** — the hydrogen safety guide: embrittlement, flammability and
  detonability limits, invisible flames, cryogenic handling, facility design.
- **[SP-4404]** (Sloop) and **[SP-4230]** (Dawson & Bowles) — how liquid
  hydrogen went from laboratory curiosity to operational propellant, and what
  Centaur cost to make routine. The best account of the operational side of
  cryogenics.
- **[SP-8087]** and **[Bartz57]** — the companion gas-side heat-transfer
  treatment for the coking calculation of §3.6, which handles only the coolant
  side.
- **[SLPRE]** and **[Hunley07]** — why early programmes chose the propellants
  they did, with the industrial and institutional context the engineering
  literature leaves out.
- **[SP-125]** and **[HH]** — regenerative cooling design practice, including
  hydrocarbon coolant limits, in the units the original programmes used.
