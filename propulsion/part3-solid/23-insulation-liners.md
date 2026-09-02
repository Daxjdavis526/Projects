# Module 23 — Insulation and Liners
Part III · Prerequisites: modules 19, 20, 21, 22 (22 is essential) · Estimated time: 6–7 h

A solid rocket motor case is a pressure vessel made of a material that loses
most of its strength somewhere between 600 and 900 K, and it is filled with a
gas at 3,400 K carrying thirty percent by mass of molten aluminium oxide at a
hundred metres per second. Nothing about the case survives that. What survives
is a few tens of millimetres of filled rubber glued to the inside of it, doing
a job that has no equivalent in a liquid engine: not carrying heat away, but
*consuming itself on a schedule* so that the last millimetre of virgin rubber
is still virgin when the motor burns out. Get the schedule wrong at one station
by fifteen percent and you do not get a hot spot you can inspect afterwards —
you get a case burn-through, and everything downstream of the plume is gone. I
have watched a program spend eighteen months on a nozzle and four weeks on the
aft-dome insulation, and I have watched which of the two ended the program. The
insulation and the liner are where the thermal, structural, chemical and
ageing problems of a solid motor all meet in the same three millimetres, and
they are the reason a solid motor is a *bonded assembly* problem before it is a
combustion problem.

---

## 1. Learning objectives

After this module you should be able to:

1. Characterise the internal environment an insulator sees at any station in a
   solid motor — gas temperature, local mass flux, particle loading, and
   exposure time — and explain why exposure time is a function of axial
   position and grain burnback, not a single number.
2. Explain the ablation/char mechanism in a filled elastomer as a coupled
   pyrolysis–conduction–erosion process, and distinguish *char rate*,
   *erosion rate*, and *surface recession rate*.
3. Compare the major insulation material classes (NBR, EPDM, and their
   silica-, aramid-, and carbon-filled variants) on density, char rate,
   erosion resistance, processability, and ageing, and say why asbestos was
   used and why it was removed.
4. Size insulation thickness at a station from a char-rate model plus an
   exposure-time profile, apply the safety-factor and residual-virgin-layer
   stack, and estimate the mass penalty of failing to taper.
5. State what the liner does that the insulation cannot, describe the
   case–insulation–liner–propellant bond stack, and explain migration and its
   consequences for bond strength.
6. Explain conceptually why a case-bonded grain is in tension at its bore after
   cure cooldown, estimate the bore hoop strain from a thermal-mismatch
   argument, and say what a stress-relief flap or boot does about the
   bondline stress at a grain end.
7. Given a described defect — crack, debond, void, porosity, unbond — predict
   the failure path (added burning surface → overpressure, or gas path →
   burn-through) and quantify the pressure rise with the Vieille exponent.
8. Name the dominant ageing mechanisms in a bonded solid motor, describe how a
   service-life prediction and a surveillance programme are constructed, and
   state what each NDE method (radiography, CT, ultrasonics, tap test) can and
   cannot find.
9. Recount, at engineering level, what the Challenger joint taught the field
   about insulation and sealing at a segmented joint, and cite the monograph
   literature that codified insulation design practice.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Insulation (internal insulation) | — | — | Sacrificial, thermally ablative layer bonded to the inside of the case, protecting it from combustion gas. |
| Liner | — | — | Thin adhesive/barrier layer between insulation and propellant; provides the bond and blocks species migration. |
| Inhibitor / restrictor | — | — | Non-burning coating on a propellant surface that must *not* burn (grain ends, slots). Chemically often the same family as liner or insulation. |
| Char | — | — | Porous carbonaceous residue left by pyrolysis of the binder; the load-bearing thermal barrier during firing. |
| Virgin layer | $\delta_v$ | m | Insulation not yet heated above its pyrolysis onset temperature. |
| Char depth | $\delta_c$ | m | Distance from the original surface to the virgin/pyrolysis interface. |
| Surface recession | $\delta_r$ | m | Material physically removed from the surface (char lost to shear and particles). |
| Char rate | $\dot{s}_c$ | m/s | $d\delta_c/dt$, rate of advance of the pyrolysis front. |
| Erosion rate | $\dot{s}_e$ | m/s | $d\delta_r/dt$, rate of mechanical/chemical removal of char. |
| Local gas mass flux | $G$ | kg/(m²·s) | $\dot m_{\text{local}}/A_{\text{port}}$ past the station. |
| Exposure time | $t_e$ | s | Time from first gas exposure of a station to motor burnout. |
| Bondline temperature | $T_{bl}$ | K | Temperature at the insulation/case interface; a design limit. |
| Flame temperature | $T_f$ | K | Adiabatic combustion temperature of the propellant. |
| Particle mass fraction | $\alpha_p$ | — | Mass fraction of condensed phase (mostly Al₂O₃) in the exhaust. |
| Burning surface area | $A_b$ | m² | Total instantaneous propellant surface producing gas. |
| Throat area | $A_t$ | m² | Nozzle throat area. |
| Klemmung | $K_n$ | — | $A_b/A_t$. |
| Burn-rate coefficient / exponent | $a$, $n$ | (SI, see §5) | Vieille law $r = a\,p^n$. |
| Propellant density | $\rho_p$ | kg/m³ | Cured propellant density. |
| Characteristic velocity | $c^*$ | m/s | $p_c A_t/\dot m$. |
| Coefficient of thermal expansion | $\alpha$ | 1/K | Linear CTE; $\alpha_p$ propellant, $\alpha_c$ case. Context distinguishes from particle fraction. |
| Poisson's ratio | $\nu$ | — | For solid propellant, 0.495–0.4999 (nearly incompressible). |
| Bore hoop strain | $\varepsilon_\theta$ | — | Circumferential strain at the grain inner surface. |
| Stress-free temperature | $T_{sf}$ | K | Temperature at which the cured grain carries no thermal stress; ≈ cure temperature. |
| Glass-transition temperature | $T_g$ | K | Binder transition to glassy behaviour. |
| Heat of ablation (effective) | $H_{\text{eff}}$ | J/kg | Energy absorbed per unit mass of insulation consumed. |
| Thermal diffusivity | $\kappa$ | m²/s | $k/(\rho c_p)$. |
| Maximum expected operating pressure | MEOP | Pa | Design pressure for the case (module 22). |

---

## 3. Theory

### 3.1 What the insulation actually sees

The internal environment of a solid motor is not a single condition; it is a
field that varies with axial station and with time. Four quantities matter.

**Gas temperature.** For an AP/Al/HTPB composite at 16–19 % aluminium, the
adiabatic flame temperature is roughly 3,300–3,600 K at typical chamber
pressures [F] (module 04 gives the CEA computation; module 19 the
formulations). Double-base and minimum-smoke propellants run cooler, roughly
2,400–3,000 K. That temperature is essentially uniform through the port — the
combustion is complete within a millimetre or two of the burning surface — so
unlike a liquid engine there is no "cool boundary layer of unburned fuel" to
help you. What *does* help is the boundary layer itself and, crucially, the
gas blown off the ablating insulation.

**Condensed phase.** An aluminised propellant produces 25–35 % of its exhaust
mass as condensed Al₂O₃, molten below about 2,320 K and liquid at chamber
temperature. These droplets have far more thermal inertia than the gas, do not
follow streamlines, and impact the wall wherever the flow turns. This is
*particle impingement*, and it is the single largest reason insulation
requirements in an aluminised motor cannot be predicted from a
convective-heat-transfer calculation alone. Impingement scales with the local
turning of the flow and with droplet Stokes number, which is why the aft dome,
the submerged nozzle cavity, and any step or slot see recession rates several
times the cylindrical section at the same gas temperature [E] [SP-8115].

**Local mass flux and velocity.** At the head end of a case-bonded internal
burning grain the axial mass flux is near zero; at the aft end it is the entire
motor flow through the local port area. In a high-L/D motor the aft-end port
velocity can reach Mach 0.3–0.4, which is exactly the condition that produces
*erosive burning* of the propellant (module 20) and, on the insulation, high
shear that strips char as fast as it forms. Two stations at the same
temperature with a factor of twenty difference in $G$ will differ by a factor
of three to six in recession rate.

**Exposure time.** This is the quantity students forget. Insulation is only
attacked once the propellant covering it has burned away. In a case-bonded
motor the propellant is the insulation's insulation for most of the burn. A
station under a thick web is exposed for a few seconds at the end of the burn;
a station under a thin web — the forward dome, the aft end of a slotted grain,
the outer surface at a stress-relief flap — is exposed from within seconds of
ignition and sees the full action time.

> **Design consequence [F].** The thermal load at a station is the *product* of
> a rate that depends on local flow and a time that depends on local grain
> geometry. These two are often anticorrelated (the head end sees long exposure
> and low flux; the aft cylinder sees short exposure and high flux) and
> sometimes reinforce each other catastrophically (the aft dome under a
> submerged nozzle sees long exposure *and* the highest flux *and* impingement
> *and* slag pooling). That is why aft-dome insulation in a large motor is an
> order of magnitude thicker than forward-cylinder insulation.

**Slag.** In motors with a submerged nozzle, Al₂O₃ that fails to be entrained
collects as a molten pool in the aft dome. It is chemically aggressive, it is
at flame temperature, it sloshes under vehicle acceleration, and it can bury a
region of insulation in a stagnant hot liquid for tens of seconds. Slag pooling
is a documented driver of aft-dome insulation thickness and of the "slag
accumulation" mass bookkeeping that shows up as a residual mass at burnout
[E] [SB §12.5].

### 3.2 The ablation and char mechanism

An internal insulator is a *charring ablator*. Under heating it develops three
zones, in order from the hot surface inward:

```
 gas ──► |  char (porous carbon + refractory filler)     |
         |  ~1,500-2,800 K, no strength, gas-permeable   |
         |----------------------------------------------|  pyrolysis front
         |  reaction zone (mm), binder decomposing       |  ~700-900 K
         |----------------------------------------------|
         |  virgin rubber, still elastomeric             |
         |----------------------------------------------|
         |  liner-side / case-side bondline  T_bl < ~450 K
 case ──►
```

Four processes run simultaneously:

1. **Conduction** into the virgin material raises its temperature.
2. **Pyrolysis** of the polymer at the front absorbs a decomposition enthalpy
   and produces gaseous products.
3. **Transpiration (blowing)** of those pyrolysis gases outward through the
   porous char cools the char and thickens the boundary layer, reducing the
   convective heat transfer coefficient. This is not a small effect: blowing
   can cut the convective flux by 30–60 % [E] [SP-8115].
4. **Char removal** by aerodynamic shear, particle impingement, and chemical
   attack (oxidation by H₂O and CO₂ in the exhaust, which are present in
   quantity even in a fuel-rich AP/Al flame).

The energy bookkeeping at the surface, per unit area:

$$ q_{\text{conv}}\,\phi_b + q_{\text{rad}} = \rho_i\,\dot{s}_c\,H_{\text{eff}} + q_{\text{cond,in}} $$

> **Eq. 3.1** — variables: $q_{\text{conv}}$ convective flux with no blowing
> (W/m²); $\phi_b$ blowing-reduction factor, dimensionless, 0.4–0.7 typical;
> $q_{\text{rad}}$ radiative flux from the particle-laden gas (W/m²);
> $\rho_i$ insulation density (kg/m³); $\dot{s}_c$ char rate (m/s);
> $H_{\text{eff}}$ effective heat of ablation (J/kg); $q_{\text{cond,in}}$ flux
> conducted into the virgin substrate (W/m²). **Meaning:** the incident heat is
> split between consuming material and heating what remains. **Assumes:**
> quasi-steady ablation, one-dimensional through-thickness conduction, no
> in-depth radiation absorption. **Fails when:** the char is being stripped
> mechanically rather than thermally (particle impingement, high shear), in
> which case $\dot{s}_e$ is set by momentum, not energy, and Eq. 3.1
> underpredicts recession badly; and during the first few seconds, when the
> transient conduction term dominates.

Two distinctions that engineers get wrong and that cost hardware:

- **Char rate is not erosion rate.** The pyrolysis front can advance while the
  char layer stays in place (thermally-limited, thick char, low shear — a
  forward dome), or the char can be swept off as fast as it forms so that the
  surface recedes at the char rate (erosion-limited — an aft dome with
  impingement). In the first case the char is a working insulator and the
  bondline stays cool; in the second you get no benefit from it. *The design
  question at every station is which regime you are in.* [J]
- **Radiation matters here in a way it does not in a liquid engine.** A gas
  loaded with 30 % molten alumina is close to a grey body. At 3,400 K a
  blackbody emits about 7.6 MW/m². Even at an effective emissivity of 0.3 and
  with a hot surface re-radiating, the net radiative term is comparable to the
  convective term in low-flux regions — which is precisely why the forward
  dome, where $G \to 0$, still chars at 0.1–0.2 mm/s instead of stopping. [F]

**The engineering model.** Full ablation codes solve a moving-boundary
conduction problem with a pyrolysis kinetic law and a surface energy/mass
balance (the CMA-family codes and their descendants). For sizing, the field
uses a correlated recession rate of the form

$$ \dot{s} = \dot{s}_0 + C_G\,G^{m}\,p^{k} $$

> **Eq. 3.2 [E]** — variables: $\dot{s}$ total surface recession rate (m/s);
> $\dot{s}_0$ the zero-crossflow (radiation- and conduction-limited) rate
> (m/s); $G$ local mass flux (kg/(m²·s)); $p$ local static pressure (Pa);
> $C_G, m, k$ fitted constants for one material at one propellant flame
> condition. Typically $m \approx 0.6$–1.0 and $k \approx 0.1$–0.3.
> **Meaning:** a floor set by radiation plus a crossflow-driven term.
> **Assumes:** the fit was made on the *same* propellant, the same material lot,
> and a comparable geometry. **Fails when:** extrapolated to another propellant
> (particle size distribution changes impingement), to a stagnation or
> impingement geometry (the correlation is a boundary-layer correlation and
> impingement is not), or below the exposure time at which the char layer
> reaches quasi-steady thickness. There is no universal correlation; every
> insulation supplier maintains proprietary fits, and published constants
> should be treated as order-of-magnitude only. [J]

In the early seconds, before a steady char exists, the front advances roughly
as a conduction front:

$$ \delta_c(t) \approx C\sqrt{\kappa\, t}, \qquad \kappa = \frac{k_i}{\rho_i c_{p,i}} $$

> **Eq. 3.3 [A]** — variables: $\delta_c$ char depth (m); $\kappa$ thermal
> diffusivity of the virgin insulator (m²/s); $t$ time (s); $C$ an $O(1)$
> constant set by the ratio of pyrolysis temperature to surface temperature.
> **Meaning:** for short exposures the char depth grows as $\sqrt{t}$, not
> linearly. **Assumes:** semi-infinite solid, constant properties, surface
> temperature stepped at $t=0$. **Fails when:** the char thickness becomes
> large enough for blowing and char conduction to control, i.e. after roughly
> $\delta_c^2/\kappa$ seconds — for a filled EPDM with $\kappa \approx
> 1.6\times10^{-7}$ m²/s and $\delta_c = 3$ mm that is about 60 s, which is
> most of a booster burn. **This is why short-exposure stations are sized with
> a $\sqrt{t}$ model and long-exposure stations with a linear-rate model, and
> why using the linear rate everywhere over-thickens the short-exposure
> stations and under-thickens nothing — a conservative but heavy error.** [J]

### 3.3 Material classes

The requirement set is unusual: low density (it is all inert mass), low thermal
diffusivity, high char yield with a char that *stays put*, elastomeric enough
to follow the case as it strains 1–2 % at pressurisation without debonding,
bondable on both faces, processable as a calendered sheet or a moulded part,
and stable in storage for ten to thirty years.

| class | typical density (kg/m³) | notes |
|---|---|---|
| **NBR** (acrylonitrile-butadiene rubber), filled | 1,200–1,500 | The first-generation workhorse. Good adhesion, good processability, higher density. Asbestos-filled NBR was the Space Shuttle SRM/RSRM insulation [NASA-SLS-SRB]. |
| **EPDM** (ethylene-propylene-diene monomer), filled | 900–1,200 | The modern default. Lower density than NBR, excellent ageing and ozone resistance, low permeability, saturated backbone so it does not oxidatively crosslink the way a diene rubber does. |
| **Silica-filled EPDM/NBR** | 1,050–1,300 | Silica gives a refractory, low-conductivity char skeleton. Cheap. Poor against particle impingement — the silica char is friable. |
| **Aramid (Kevlar)-filled EPDM** | 900–1,050 | Short aramid pulp reinforces the char mechanically so it survives shear. The standard high-performance low-density insulator; "KF-EPDM" in the literature. |
| **Carbon/graphite-fibre-filled EPDM** | 1,150–1,400 | Highest erosion resistance and highest char conductivity — used locally, at aft domes and impingement zones, where erosion rather than conduction controls. |
| **Asbestos-filled NBR** | 1,300–1,500 | [H] Excellent performance, and the historical benchmark against which everything else is measured. Removed for occupational-health reasons, not technical ones. |
| **Silica- and carbon-phenolic** | 1,450–1,600 | Rigid, not elastomeric. Used in nozzles (module 24) and in local hard inserts, not as case insulation, because they cannot follow case strain. |
| **Low-density EPDM with hollow microspheres** | 700–900 | For filament-wound composite cases where insulation mass is a large fraction of inert mass. The Zefiro and P120C family use low-density EPDM [WP]. |

**Why the filler dominates the behaviour.** The binder decides the char *yield*
and the pyrolysis enthalpy; the filler decides whether the char survives. An
unfilled EPDM chars to a fluffy carbon that a 100 kg/(m²·s) crossflow removes
instantly. Add 20–30 % aramid pulp and the char becomes a felt held together by
fibres that do not pyrolyse until far above the char temperature; recession at
the same station can fall by a factor of two to three [E] [SP-8115]. Add
milled carbon fibre and it falls further, at the cost of density and of a more
thermally conductive char (which raises bondline temperature for the same
recession — a real trade, not a free lunch).

**The asbestos story [H].** Chrysotile asbestos in an NBR matrix was, on the
technical merits, close to ideal: a refractory fibrous filler that reinforced
the char, cost almost nothing, and had thirty years of qualification data
behind it. It was the Shuttle SRM/RSRM insulation for the life of the
programme. The five-segment RSRMV for SLS is explicitly described by NASA as
using **asbestos-free insulation** together with a new liner configuration
[NASA-SLS-SRB], and that substitution was not a paperwork exercise: changing
the filler changes char morphology, changes recession, changes the cure
chemistry, changes the bond to liner and case, and therefore requires
re-qualifying the entire bond system and re-sizing the thickness profile. This
is the general lesson about insulation: **you cannot change one ingredient
without re-qualifying the stack.** [J]

### 3.4 Sizing the thickness

The sizing logic is a chain, and each link is a separate analysis:

1. **Burnback analysis (module 21)** gives, for every station $x$ on the case,
   the time $t_x$ at which the propellant web above it is consumed. Exposure
   time is $t_e(x) = t_{\text{action}} - t_x$.
2. **Internal ballistics (module 20)** gives $p(t)$ and, with the port
   geometry, $G(x,t)$.
3. **A recession model** (Eq. 3.2/3.3, calibrated on subscale motors and
   char-motor tests for *this* propellant and *this* insulator) integrates to
   a predicted char depth and recession:
   $$ \delta_c(x) = \int_{t_x}^{t_{\text{action}}} \dot{s}_c\big(G(x,t),p(t)\big)\,dt $$
4. **A thermal model** — one-dimensional transient conduction with a moving
   pyrolysis boundary, run at each station — confirms that with the proposed
   thickness the bondline temperature stays under limit at the *end* of the
   soak, which is usually several seconds *after* burnout as heat continues to
   diffuse inward.
5. **The margin stack** converts prediction to drawing thickness.

$$ t_{\text{ins}}(x) = \mathrm{FS}\cdot\delta_c(x) + \delta_{\text{res}} + \delta_{\text{mfg}} $$

> **Eq. 3.4 [J]** — variables: $t_{\text{ins}}$ design thickness (m);
> FS the safety factor on predicted char depth, typically 1.5–2.0 for a new
> design, 1.25–1.5 where flight or full-scale static data exist;
> $\delta_{\text{res}}$ the required residual *virgin* layer that keeps the
> bondline below its temperature limit (m), typically 1–3 mm and properly set
> by the thermal model of step 4, not by a rule; $\delta_{\text{mfg}}$ the
> manufacturing tolerance allowance (m). **Meaning:** never let the char front
> reach the case, and never let it reach the case *plus a thermal buffer*.
> **Assumes:** the recession prediction is unbiased, so the FS covers scatter,
> not error. **Fails when:** the model is extrapolated — the FS then covers
> nothing, because the mean is wrong. This is the single most common way
> insulation sizing goes wrong: a factor of 1.5 on a prediction that is 2×
> low is not conservative. [J]

**Tapering.** Because $t_e$ and $G$ both vary along the case, the required
thickness varies along the case by a factor of five to fifteen in a large
motor. Building a uniform insulator at the maximum thickness is
straightforward, robust, and unflyable: worked example 1 shows a factor of 2.5
mass penalty on a small motor, and the ratio grows with L/D. Real motors are
built with a **tapered** insulation profile — sheet stock of several
thicknesses laid up in overlapping plies, or moulded parts at the domes — with
the ply drop-offs staggered so that no single scarf joint is a through-thickness
path. The taper is what makes the insulation an aerodynamic surface too: an
abrupt step is an impingement site that eats itself.

**Secondary functions.** The insulator is also asked to (a) accommodate case
strain at pressurisation without debonding, which is why it is an elastomer;
(b) act as the *stress-relief* medium at grain ends (§3.6); (c) in some designs
carry the case-to-grain bond entirely, with the case only bonded to insulation
and never to propellant; and (d) provide a smooth, defect-free surface for the
liner, since any surface porosity becomes a liner void becomes a bond defect.

### 3.5 The liner and the bond system

The liner is 0.2–1.5 mm of filled polymer between insulation and propellant,
and it is doing three jobs that the insulation cannot.

**Adhesion.** A cured, fully-crosslinked EPDM sheet is a chemically dead
surface; propellant cast against it does not bond. The liner is applied to the
insulation *before it is fully cured*, or over an abraded and primed insulation
surface, and is itself *partially cured* when the propellant is cast, so that
the liner and the propellant binder co-cure across the interface. The bond is
therefore chemical and continuous, not mechanical [F] [SP-8064]. The
consequence: the casting operation has a time window — the liner "tack life" —
and missing it produces a weak bond that no inspection reliably finds.

**Migration barrier.** A composite propellant is not chemically inert with
respect to its neighbours. Three species move:

- **Plasticiser** (DOA, IDP, or in nitrate-ester-plasticised systems the
  energetic plasticiser itself) diffuses out of the propellant into the liner
  and insulation down its concentration gradient. The propellant near the bond
  stiffens and loses strain capability; the liner softens. This is the dominant
  migration problem in plasticised systems and the reason NEPE-class
  propellants — Trident II D-5 uses NEPE-75 [WP] — need a liner formulated as
  a *barrier*, not just an adhesive.
- **Curative** (isocyanate, aziridine) migrates from whichever side has an
  excess, producing a locally over- or under-cured band a few hundred microns
  wide at the interface. Under-cured propellant at the bondline is a
  low-strength layer exactly where the stress is highest.
- **Ammonia and moisture.** AP slowly off-gasses ammonia; ambient humidity
  diffuses inward through the case at any penetration. Both attack ester and
  urethane linkages by hydrolysis.

**Mechanical grading.** Propellant modulus is of order 1–10 MPa; insulation
modulus is 3–20 MPa; the case is 10⁵ times stiffer. The liner is a compliant,
tough interlayer that keeps the modulus step from concentrating stress in a
zero-thickness plane. A well-designed bond system fails *cohesively in the
propellant* a millimetre from the interface, never adhesively at the interface
— that is the acceptance criterion on a bond tensile specimen. [M]

The complete stack, outside in:

```
case (steel / composite)
  └ surface prep: grit blast, solvent wipe, chemical conversion or primer
      └ case-bonding adhesive (for pre-moulded insulation) or direct-cure insulation
          └ INSULATION (filled EPDM/NBR), tapered
              └ surface prep: abrade + wipe, or partial cure state
                  └ LINER (0.2-1.5 mm, propellant-binder-based, filled)
                      └ PROPELLANT (cast, cured in place)
```

Every interface in that stack is a potential debond, every one has its own
qualification test, and the whole stack has to survive thirty years of storage.
Note that a *cartridge-loaded* motor deletes most of it: the grain is cast in a
separate mandrel, cured, machined, and slid into an insulated case with a
mechanical retention scheme. That trades bond risk for a free outer surface
(which must then be inhibited) and a lower volumetric loading. Case-bonded won
for large motors on volumetric efficiency and on grain support under
acceleration; cartridge-loaded survives in small tactical motors where the
grain is stiff enough to support itself and rapid temperature cycling would
tear a bond. [J]

### 3.6 Case-bonded structural analysis, conceptually

A case-bonded grain is a nearly incompressible viscoelastic solid glued inside
a stiff shell, and every load it sees is a *mismatch* load.

**Cure cooldown is the biggest one.** The propellant is cast and cured at
320–345 K (about 47–72 °C) and then cooled. The stress-free temperature is
approximately the cure temperature [A]. Propellant CTE is 8×10⁻⁵ to 1.2×10⁻⁴
K⁻¹; steel is 1.2×10⁻⁵, aluminium 2.3×10⁻⁵, carbon/epoxy 0.2–2×10⁻⁶ hoop. The
propellant wants to shrink about eight times as much as the case, and it
cannot: it is bonded. Because it is also nearly incompressible ($\nu \to 0.5$),
the volumetric shrinkage cannot be absorbed by uniform compression. It has to
come out somewhere, and the only free surface is the bore. **The bore opens
up, and the material at the bore goes into hoop tension.**

The geometric amplification is the point. For a case-bonded cylindrical grain
of inner radius $a$ and outer radius $b$ in a rigid case, with an incompressible
propellant, a volume balance (derived in worked example 3) gives

$$ \varepsilon_\theta(a) \;=\; \frac{\Delta T\big[\,2\alpha_c b^2 - (3\alpha_p - \alpha_c)(b^2-a^2)\,\big]}{2a^2} $$

> **Eq. 3.5 [A]** — variables: $\varepsilon_\theta(a)$ hoop strain at the bore
> (–); $\Delta T = T - T_{sf}$ (K), negative on cooldown; $\alpha_p,\alpha_c$
> linear CTE of propellant and case (1/K); $a,b$ bore and outer grain radii
> (m). **Meaning:** the linear CTE mismatch, which is of order 10⁻³ over a
> 100 K cooldown, is amplified at the bore by roughly $3(b^2-a^2)/(2a^2)$ —
> a factor of 10–25 for a thick-web grain. **Assumes:** perfectly rigid case,
> perfectly incompressible propellant ($\nu = 0.5$), plane strain with the
> axial strain following the case, uniform temperature, linear elastic
> behaviour, no liner or insulation compliance. **Fails when:** any of those
> is relaxed — a composite case is not rigid (which *helps*, since a
> low-CTE composite case shrinks less but also deforms more), $\nu = 0.4995$
> not 0.5 (which relieves a few percent), the temperature is not uniform during
> a transient, and propellant is viscoelastic so a slow cooldown relaxes stress
> that a fast one does not. Treat Eq. 3.5 as a screening number that tells you
> whether you have a problem, never as a qualification analysis. Real work is
> nonlinear viscoelastic finite-element analysis with a time–temperature-shifted
> relaxation modulus [SP-8073].

The design consequence: **grain strain capability, not propellant energy, sets
the low-temperature storage limit of most tactical and many strategic motors.**
Propellant tensile strain capability falls as temperature falls and as strain
rate rises (both move you up the master curve toward glassy behaviour). A grain
that survives 219 K (−54 °C, the standard low storage limit) at slow cooldown
may crack at the same temperature if it is thermally shocked, and will
certainly be closer to failure when the ignition pressurisation strain — a
fast, large-strain event — is superposed on the thermal strain. [F]

**Bondline stresses at grain ends.** Away from the ends, the bond carries
almost pure normal stress, and modest amounts. At a grain end — where the
bonded propellant terminates against a dome, a slot, or a segment joint —
the free surface forces a stress concentration. Elasticity gives a singular
field at the bonded bimaterial corner; in the real material it is a
high-gradient region a few millimetres across carrying both peel (normal
tension) and shear. This is where case-bonded grains debond, always. Cooldown
loads it, ignition pressurisation loads it, axial acceleration loads it, and
transport vibration fatigues it.

**Stress-relief flaps and boots.** The fix is to *unbond it deliberately*. A
**stress-relief flap** (also "boot") is a region at the grain end where the
propellant is intentionally not bonded to the insulation: a thin sheet of
release material or a folded insulation flap separates them over a defined
length, so the propellant end can move relative to the case without loading a
bondline corner. The singularity is replaced by a compliant, sliding, and
critically a *non-burning* interface. The Shuttle RSRM uses exactly this
architecture at its segment ends, and the design of the joint insulation and
the flaps in that region was part of the post-Challenger redesign
[Rogers86] [NASA-SRB].

The catch, and it is a serious one [J]: a flap creates a blind cavity that
combustion gas can enter. The flap must be long enough that gas entering it
stalls and cools before reaching the case, the insulation under the flap must
be sized for the full action time (because it is exposed from ignition), and
the flap tip must not be able to be peeled open by the pressurisation
transient. A flap is a controlled debond; an uncontrolled debond in the same
place is a burn-through. The entire art is in keeping the distinction.

**The other loads, briefly.** Ignition pressurisation strains the case
elastically by 0.5–2 % in hoop; the bonded grain must follow it, at high strain
rate, and the bore hoop strain from pressurisation adds to the thermal strain.
Axial acceleration slumps the grain and loads the aft bond in shear. Handling,
transport and rail shipping impose vibration and shock spectra. Gravity slump
during long horizontal storage is a real design case for large motors. Each is
a load case in the same nonlinear viscoelastic model, and the criterion is
cumulative-damage — the grain has a finite budget of strain-history, not a
single allowable [SP-8073].

### 3.7 Defects: what goes wrong and why it kills the motor

Every defect in this system converts into one of exactly two failure paths.

**Path A — added burning surface.** Any defect that exposes propellant surface
which the ballistic design did not account for increases $A_b$, hence $K_n$,
hence chamber pressure. From the equilibrium-pressure relation (module 20),

$$ \frac{p_2}{p_1} = \left(\frac{A_{b,2}}{A_{b,1}}\right)^{\!1/(1-n)} $$

> **Eq. 3.6 [F]** — variables: $p$ equilibrium chamber pressure (Pa); $A_b$
> burning area (m²); $n$ Vieille exponent (–). **Meaning:** the pressure
> amplifies the area error by $1/(1-n)$, typically 1.4–1.8, and up to 3+ for a
> high-exponent double-base propellant. **Assumes:** quasi-steady operation
> ($A_b$ changes slowly compared with the chamber filling time $\approx
> V_c/(c^* A_t)$), unchoked-to-choked nozzle unchanged, same $c^*$.
> **Fails when:** the area change is sudden — a crack opening at ignition is
> *not* quasi-steady, and the transient overshoot exceeds the equilibrium
> value; and when $n \geq 1$, where no equilibrium exists at all.

The severity therefore depends entirely on how much surface the defect adds.
A hairline crack adds twice its face area and is usually survivable; a debond
along the case wall can expose the *entire outer surface of the grain*, which
in a thick-web motor is several times the design burning area, and the motor
detonates the case in the first second. Worked example 2 does both numbers.

**Path B — a gas path to the case.** A defect that lets combustion gas reach
the case wall does not need to change the pressure at all. Gas at 3,400 K in
contact with steel at 0.5 MW/m² of flux will take a D6AC case from ambient to
its softening point in a fraction of a second and burn a hole through 12.7 mm
of it in a few seconds. The Challenger SRB joint failure was exactly this: not
an overpressure, a burn-through of a joint.

| defect | mechanism | path | why catastrophic |
|---|---|---|---|
| **Grain crack** (bore, radial, end) | Thermal strain exceeds capability at low temperature; or fatigue at a stress concentration | A (and B if it reaches the bondline) | Adds surface, and the crack faces are in a low-velocity cavity where pressure builds faster than it vents |
| **Propellant/liner debond** | Weak bond, migration-degraded, or peel at a grain end | A and B | Exposes the whole flank of the grain; flame spreads along the debond at hundreds of m/s |
| **Liner/insulation debond** | Bad surface prep, contamination, missed tack window | B | Gas channel straight to the insulation's cold face; the insulation is being attacked from the wrong side and its thickness margin is meaningless |
| **Insulation/case unbond** | Adhesive failure, corrosion under bond, cure shrinkage | B | Removes the thermal path and lets gas run axially along the case |
| **Void** (bulk, at interface, at a slot fillet) | Entrapped air in casting, poor vacuum, propellant slumping around a mandrel feature | A (surface it exposes) and structural (stress concentration → crack) | A void at a bondline is a pre-made debond initiation site |
| **Porosity** (distributed micro-voids) | Under-vacuum casting, moisture in ingredients, off-ratio cure | A, and burn-rate elevation | Distributed porosity raises effective burn rate and lowers strength simultaneously; it is *not* a local defect and cannot be repaired |
| **Insulation ply gap / scarf misalignment** | Layup error at a taper drop-off | B | Local thin spot exactly where the taper said thickness was needed |
| **Inclusion** (tooling debris, cured propellant chunk, glove) | Process control | A and structural | Behaves as a void plus a stress raiser plus, if metallic, a hot spot |

The uncomfortable fact for a designer [J]: **the failure severity is not
proportional to defect size in any smooth way.** A 5 mm void is nothing; a 5 mm
void 2 mm from the bondline in a region under peel stress at −40 °C is the
initiation site for a debond that unzips the length of the motor. Which is why
solid-motor quality assurance is not sampled — it is 100 % inspected, and why
the acceptance criteria are written in terms of *location and orientation*, not
just size.

### 3.8 Ageing and service life

A liquid engine sits in a bay and is inspected. A solid motor sits in a
magazine or on a silo for ten to thirty years and is expected to work the first
time, at a temperature nobody controlled, after a load history nobody recorded.
The bonded assembly is the part that ages.

**Mechanisms, in rough order of importance:**

1. **Plasticiser and species migration** (§3.5). Continuous, diffusion-limited,
   with a $\sqrt{Dt}$ penetration depth. Over years it stiffens the propellant
   at the bondline — the one place stiffening is most damaging, because it is
   where the strain concentration is.
2. **Continued cure / oxidative crosslinking.** Polyurethane and polybutadiene
   binders keep reacting. Modulus rises, strain capability falls. HTPB, with
   its unsaturated backbone, oxidatively crosslinks in the presence of oxygen
   diffusing through the case; this is one reason motors are sealed and
   sometimes nitrogen-blanketed. Saturated EPDM insulation is comparatively
   immune, which is part of why it displaced NBR.
3. **Humidity and hydrolysis.** Water attacks urethane linkages and, worse,
   moves AP: ammonium perchlorate is hygroscopic, and moisture at the bondline
   degrades adhesion directly.
4. **Cyclic thermal loads.** A motor in a desert magazine sees 40 K daily
   swings for decades. Each cycle imposes a bore-strain excursion by Eq. 3.5.
   The damage is cumulative and viscoelastic: the propellant partly relaxes
   between cycles, but a fraction of the damage is permanent (dewetting of
   filler from binder, microvoid growth).
5. **Dewetting.** At high strain the AP and Al particles separate from the
   binder, forming vacuoles. This is the microstructural mechanism behind the
   nonlinear stress–strain behaviour and behind permanent volume increase
   ("dilatation") after a strain excursion. It is measurable and it is the
   basis for cumulative-damage service-life models. [F] [SP-8073]

**Service-life prediction.** The standard construction [M]:

- Characterise the propellant's relaxation modulus and failure envelope over
  temperature and strain rate; build a master curve with a WLF or Arrhenius
  time–temperature shift.
- Run the structural model over the specified life-cycle load history
  (cure cooldown, storage temperature-cycle spectrum, transport, tactical
  temperature excursions, then ignition) with a cumulative-damage criterion.
- Age material samples and small bonded specimens at elevated temperature to
  compress the timeline, and shift the results back with an Arrhenius
  activation energy fitted to at least three temperatures. The traditional
  factor is that 10 K of elevation roughly halves the required test time
  [E]; the trap is that at elevated temperature you can activate a mechanism
  that never operates at storage temperature, and then your accelerated test
  is measuring the wrong reaction. Every accelerated-ageing programme must
  demonstrate mechanism equivalence, not just rate scaling. [J]
- Predict the life-limiting property (usually bond strength or propellant
  strain capability at the cold limit) and set the service life where it
  crosses the requirement with margin.

**Surveillance.** Prediction is not trusted on its own. A surveillance
programme sets aside motors from each production lot, stores them alongside the
fleet, and periodically destroys them: dissect one, pull bond tensile
specimens, measure propellant mechanical properties, CT the assembly, and
statically fire one. Fleet-representative data replaces the model over time.
The programme is expensive and it is the only thing that has ever caught a real
ageing surprise. [M] [J]

### 3.9 Inspection and NDE

| method | what it sees | what it misses | notes |
|---|---|---|---|
| **X-ray radiography** (film or digital) | Density contrast: voids, cracks with a component along the beam, inclusions, gross unbonds | Planar defects perpendicular to the beam; tight debonds with no gap | Workhorse. Large motors need high-energy sources (linac) and multiple orientations. |
| **Computed tomography (CT)** | Full 3-D density map; the only method that gives defect *location and shape* unambiguously | Very tight interfacial debonds (no density change) | Now the reference method for small and medium motors; large-motor CT exists but is a facility-scale investment. [M] |
| **Ultrasonic (pulse-echo, through-transmission)** | Interfacial debonds and unbonds — the defects X-ray is worst at | Anything in highly attenuating heterogeneous propellant far from the surface; needs access to a smooth surface and a couplant | The complementary method to radiography; the two together cover the defect space. |
| **Tap test / mechanical impedance** | Near-surface debonds over an area, on accessible surfaces | Depth information; anything small; anything deep | [H] but still used, still surprisingly effective on insulation-to-case bonds, and completely operator-dependent. |
| **Thermography (flash / pulsed IR)** | Near-surface disbonds and thickness variation in insulation, from one side | Anything more than a few millimetres deep in a low-diffusivity material | Good for insulation-to-case bond on an empty case before casting. |
| **Bond witness / proof specimens** | Actual bond strength, destructively, on tabs co-processed with the motor | The motor itself — it is a proxy | The only *quantitative* bond measurement in the process. |
| **Proof pressurisation** | Gross case and bond integrity | Every defect that survives one pressurisation and fails on the second | Rare on motors; the pressurisation itself damages the grain. |
| **Acoustic emission during proof/thermal cycling** | Active cracking and debonding as it happens | Static defects | [R]/[M] Used in surveillance more than acceptance. |

The strategic point [J]: **inspect the empty insulated case before you cast.**
Once propellant is in, the insulation's cold face is behind 500 mm of an
attenuating, radiographically dense composite, and you have converted an easy
inspection into a hard one. Every large-motor process inspects the case-to-
insulation bond, the insulation thickness profile, and the liner application
*before* casting, and then inspects the propellant and the propellant-to-liner
bond afterwards.

### 3.10 The monograph literature and the Challenger lesson

**NASA SP-8115, *Solid Rocket Motor Internal Insulation* (1976)** is the design
criteria monograph for this subject: the environment definition, material
selection criteria, the recession-correlation approach, thickness sizing with
margins, bond requirements, and the required verification tests. It is dated in
its materials (asbestos-filled compounds are discussed as current practice) and
entirely current in its method. **NASA SP-8073, *Solid Propellant Grain
Structural Integrity Analysis* (1973)** is the companion for §3.6: viscoelastic
characterisation, load-case definition, bore and bondline analysis,
stress-relief boot design, and cumulative damage. Read together, they are the
skeleton of everything above. Related: **SP-8064** on propellant selection and
characterisation and **SP-8075** on processing factors, which is where the
casting-defect taxonomy comes from.

**Challenger [Rogers86] [H].** The proximate cause of the STS-51-L loss was a
failure to seal an SRB aft field joint, and the insulation and sealing
architecture at that joint is directly this module's subject. The relevant
engineering points:

- The joint was sealed by two fluorocarbon O-rings, protected from the
  combustion gas by **zinc chromate putty** packed into the insulation gap. The
  putty was intended to be a thermal barrier, so that the O-rings never saw
  flame temperature — the insulation, not the seal, was the primary thermal
  design.
- The putty did not behave as an unbroken barrier. Pressurisation could form
  **blow holes** — channels through the putty — that jetted hot gas directly at
  the primary O-ring. Whether the ring then sealed depended on how fast it could
  extrude into the joint gap, and the extrusion rate of a fluorocarbon elastomer
  is strongly temperature-dependent.
- Simultaneously, ignition pressure caused **joint rotation**: the tang and
  clevis legs deflected apart, momentarily *opening* the gap the ring had to
  seal, at exactly the moment the ring was coldest and stiffest.
- On a cold morning the cold-stiffened ring in the right-hand SRB's aft field
  joint did not seat, gas blew by, the joint burned through, and the resulting
  plume impinged on the External Tank.
- The redesign (RSRM) attacked all three: a **capture feature** on the tang to
  mechanically limit rotation, a **third O-ring** on that capture feature,
  **redesigned joint insulation** to restore the thermal barrier the putty had
  failed to provide, and **joint heaters** to keep the seals above a minimum
  temperature.

The lesson that belongs in *this* module, as opposed to the seals module: **the
insulation was the primary thermal design and the O-ring was the backup, and
the programme managed the backup.** Every discussion of blow-by focused on the
condition of the rings, because the rings were what could be inspected after
recovery. The barrier that was supposed to make the ring's temperature
irrelevant was a hand-packed putty whose as-installed condition was neither
controllable nor inspectable, and no one owned it as a thermal component. When
you design an insulation detail whose function is "the downstream part never
gets hot," you must be able to verify that it did its job, or you will end up
managing the downstream part instead. [J]

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| Flame temperature, aluminised AP composite | 3,300–3,600 K | minimum-smoke / reduced-Al formulations, 2,400–3,000 K | 19 % Al HTPB 1912 (P120C class) at the top [WP] |
| Condensed-phase mass fraction | 0.25–0.35 | non-aluminised double base, ~0 | 20 % Al composites |
| Insulation density | 700–1,500 kg/m³ | low-density microsphere EPDM, ~750 (Zefiro family) | asbestos/carbon-filled NBR, ~1,500 [H] |
| Insulation thermal conductivity (virgin) | 0.15–0.35 W/(m·K) | silica-filled | carbon-filled |
| Char rate, low-crossflow (dome) | 0.05–0.20 mm/s | carbon-filled EPDM | unfilled or silica-filled at high $T_f$ |
| Char/recession rate, high-crossflow (aft) | 0.3–1.2 mm/s | carbon-filled at moderate $G$ | silica-filled under impingement |
| Insulation thickness, forward cylinder | 2–10 mm | short-burn upper stage | long-burn booster |
| Insulation thickness, aft dome | 25–150 mm | small motor | large segmented booster with submerged nozzle |
| Insulation mass fraction of inert mass | 15–35 % | steel-case motor (case dominates) | filament-wound composite case, where insulation can rival the case |
| Liner thickness | 0.2–1.5 mm | small tactical motor | large booster with a migration-sensitive propellant |
| Bondline temperature limit | 400–480 K | composite case with epoxy matrix (lower, matrix $T_g$ limited) | steel case |
| Propellant CTE | 0.8–1.2 ×10⁻⁴ K⁻¹ | highly loaded, high solids | binder-rich |
| Case CTE (hoop) | 0.2×10⁻⁶ – 2.3×10⁻⁵ K⁻¹ | carbon/epoxy filament wound | aluminium |
| Propellant tensile modulus | 1–10 MPa (rate/temperature dependent) | soft HTPB at 320 K | stiff CTPB/PBAN at 219 K |
| Propellant strain capability | 15–55 % | cold, high rate | warm, slow |
| Propellant Poisson's ratio | 0.495–0.4999 | — | — |
| Cure (stress-free) temperature | 320–345 K | low-temperature-cure systems | PBAN-class |
| Storage temperature limits | 219–344 K (−54 to +71 °C) | military standard low limit | desert magazine high limit |
| Bond tensile strength (propellant/liner) | 0.3–1.0 MPa | aged, migration-degraded | fresh, well-cured |
| Vieille exponent $n$ | 0.2–0.5 (composite) | plateau-burning double base can be near 0 | high-$n$ double base, 0.6–0.9 |
| Case mass fraction context | $\zeta = m_p/m_0$ 0.85 (segmented steel RSRM) → 0.924 (monolithic composite P120C) | — | [WP] |

Numbers for specific motors are taken from the Part III verification worksheet
and are reproduced with their confidence labels in §6.

---

## 5. Worked examples

### WE1 — Insulation thickness profile from a char-rate model, and the cost of not tapering

**Problem.** A generic case-bonded booster: steel case, internal radius
$R_c = 0.550$ m, cylindrical section 3.0 m long between two domes each of
lateral area $2\pi R_c^2$. Action time 100 s. The burnback and internal
ballistics analyses (modules 20–21) have already produced this station table:

| station | area $A$ (m²) | local mass flux $G$ (kg/m²·s) | exposure time $t_e$ (s) |
|---|---|---|---|
| Forward dome | 1.901 | 5 | 95 |
| Forward cylinder band (1.0 m) | 3.456 | 15 | 22 |
| Mid cylinder band (1.0 m) | 3.456 | 40 | 18 |
| Aft cylinder band (1.0 m) | 3.456 | 85 | 35 |
| Aft dome (submerged nozzle) | 1.901 | 130 | 100 |

Two candidate materials, characterised on subscale char motors with this
propellant, correlated in the form of Eq. 3.2 with $m=1$, $k=0$:

- **Material A**, aramid-filled EPDM, $\rho = 1{,}100$ kg/m³:
  $\dot{s}\,[\mathrm{mm/s}] = 0.10 + 0.0060\,G$
- **Material B**, carbon-filled EPDM, $\rho = 1{,}350$ kg/m³:
  $\dot{s}\,[\mathrm{mm/s}] = 0.05 + 0.0030\,G$

Margin policy: $\mathrm{FS} = 1.5$ on predicted char depth,
$\delta_{\text{res}} = 1.5$ mm residual virgin layer (set by the thermal model
for a 450 K bondline limit), $\delta_{\text{mfg}} = 0$ for this estimate.

Find (a) the required thickness at each station with material A; (b) whether
material B is justified anywhere; (c) the tapered insulation mass against a
uniform-thickness design.

---

**(a) Material A, station by station.** With $\dot{s}$ constant in time
(the correlation has no $p$ dependence and $G$ is taken at its station value),
$\delta_c = \dot{s}\,t_e$ and $t_{\text{ins}} = 1.5\,\delta_c + 1.5$ mm.

Forward dome: $\dot{s} = 0.10 + 0.0060(5) = 0.130$ mm/s.
$\delta_c = 0.130 \times 95 = 12.35$ mm.
$t_{\text{ins}} = 1.5(12.35) + 1.5 = 20.0$ mm.

Forward cylinder: $\dot{s} = 0.10 + 0.0060(15) = 0.190$ mm/s.
$\delta_c = 0.190 \times 22 = 4.18$ mm. $t_{\text{ins}} = 7.8$ mm.

Mid cylinder: $\dot{s} = 0.10 + 0.0060(40) = 0.340$ mm/s.
$\delta_c = 0.340 \times 18 = 6.12$ mm. $t_{\text{ins}} = 10.7$ mm.

Aft cylinder: $\dot{s} = 0.10 + 0.0060(85) = 0.610$ mm/s.
$\delta_c = 0.610 \times 35 = 21.35$ mm. $t_{\text{ins}} = 33.5$ mm.

Aft dome: $\dot{s} = 0.10 + 0.0060(130) = 0.880$ mm/s.
$\delta_c = 0.880 \times 100 = 88.0$ mm. $t_{\text{ins}} = 133.5$ mm.

Note immediately that the forward dome, at the *lowest* mass flux in the motor,
needs 2.6× the thickness of the forward cylinder — purely because it is exposed
for 95 s instead of 22 s. An engineer who sizes insulation from a heat-flux map
alone gets this station wrong by a factor of three.

**(b) Material B at the aft dome.**
$\dot{s} = 0.05 + 0.0030(130) = 0.440$ mm/s; $\delta_c = 44.0$ mm;
$t_{\text{ins}} = 1.5(44.0) + 1.5 = 67.5$ mm.

Material B halves the aft-dome thickness. Areal mass comparison at that station:

- A: $0.1335\ \mathrm{m} \times 1{,}100 = 146.9$ kg/m²
- B: $0.0675\ \mathrm{m} \times 1{,}350 = 91.1$ kg/m²

B wins by 38 % in areal mass despite being 23 % denser, because recession, not
density, controls the thickness there. Check the same comparison at the forward
cylinder: A gives $0.00777 \times 1{,}100 = 8.5$ kg/m²; B gives
$\dot{s} = 0.05+0.0030(15) = 0.095$ mm/s, $\delta_c = 2.09$ mm,
$t_{\text{ins}} = 4.64$ mm, areal mass $6.3$ kg/m². B still wins on paper — but
at that station the thickness is already down at the manufacturing minimum for
a calendered sheet, the carbon-filled char is more thermally conductive (raising
$T_{bl}$ for the same recession), and using two materials means two bond
qualifications and a splice. **Judgment: use B only at the aft dome and the aft
cylinder, where the mass is, and accept the splice.** [J]

**(c) Mass, tapered vs uniform.** Using material A everywhere except the aft
dome (material B, 67.5 mm):

| station | $A$ (m²) | $t$ (mm) | $\rho$ (kg/m³) | mass (kg) |
|---|---|---|---|---|
| Forward dome | 1.901 | 20.0 | 1,100 | 41.9 |
| Forward cylinder | 3.456 | 7.8 | 1,100 | 29.5 |
| Mid cylinder | 3.456 | 10.7 | 1,100 | 40.6 |
| Aft cylinder | 3.456 | 33.5 | 1,100 | 127.4 |
| Aft dome | 1.901 | 67.5 | 1,350 | 173.2 |
| **total** | 14.169 | — | — | **412.6** |

A uniform design at the governing thickness — 67.5 mm everywhere, in material A
at 1,100 kg/m³ — gives
$14.169 \times 0.0675 \times 1{,}100 = 1{,}052$ kg.

$$ \frac{m_{\text{uniform}}}{m_{\text{tapered}}} = \frac{1052}{413} = 2.55 $$

**Sanity check.** 413 kg of insulation on a motor of this size (roughly 5 t of
propellant for a 1.1 m bore, 3 m grain at 1,770 kg/m³ with a 0.30 m port) is
about 9 % of propellant mass, which is high but in family for a small
high-L/D motor with a submerged nozzle; large boosters with composite cases run
insulation at 15–35 % of *inert* mass. The uniform design's extra 639 kg is,
at a stage mass fraction of 0.9, roughly equivalent to throwing away 6 t of
propellant capability. This is why nobody builds uniform insulation, and why
insulation taper drawings are among the most heavily controlled documents in a
solid motor programme. [J]

---

### WE2 — Burning-surface increase from a crack and from a debond

**Problem.** The same class of motor: cylindrical bore $D = 0.300$ m, grain
length $L = 3.00$ m, case internal radius $R_c = 0.550$ m, propellant density
$\rho_p = 1{,}770$ kg/m³, $c^* = 1{,}550$ m/s, Vieille law $r = a p^n$ with
$n = 0.35$ and $r = 8.0$ mm/s at $p = 6.90$ MPa. The nozzle is sized for
6.90 MPa at the initial burning area. MEOP is set at $1.5 \times 6.90 =
10.35$ MPa and the case burst pressure is $1.4 \times$ MEOP $= 14.5$ MPa.

Find the equilibrium chamber pressure (i) nominally, (ii) with a longitudinal
bore crack 0.50 m long and 40 mm deep, and (iii) with a propellant/liner debond
exposing 2.0 m of the grain's outer surface.

---

**Set-up.** First the burn-rate coefficient in SI:

$$ a = \frac{r}{p^n} = \frac{8.0\times10^{-3}}{(6.90\times10^{6})^{0.35}} = 3.232\times10^{-5}\ \mathrm{m/s/Pa^{0.35}} $$

Initial burning area (cylindrical bore, ends inhibited):

$$ A_{b,1} = \pi D L = \pi(0.300)(3.00) = 2.827\ \mathrm{m^2} $$

Required $K_n$ for 6.90 MPa, from $p = (a\rho_p c^* K_n)^{1/(1-n)}$ inverted:

$$ K_n = \frac{p^{\,1-n}}{a\rho_p c^*} = \frac{(6.90\times10^6)^{0.65}}{(3.232\times10^{-5})(1770)(1550)} = 314.4 $$

$$ A_t = \frac{A_{b,1}}{K_n} = \frac{2.827}{314.4} = 8.994\times10^{-3}\ \mathrm{m^2}
\;\Rightarrow\; D_t = 107.0\ \mathrm{mm} $$

**(i) Nominal.** $p_1 = (a\rho_p c^* K_n)^{1/(1-n)} = 6.90$ MPa. ✓ (closure check)

**(ii) The crack.** A crack has two faces. Both burn:

$$ \Delta A_b = 2\,L_{\text{crack}}\,d_{\text{crack}} = 2(0.50)(0.040) = 0.0400\ \mathrm{m^2} $$

$$ A_{b,2} = 2.827 + 0.040 = 2.867\ \mathrm{m^2}, \qquad
\frac{A_{b,2}}{A_{b,1}} = 1.0141 $$

$$ \frac{p_2}{p_1} = 1.0141^{\,1/(1-0.35)} = 1.0141^{\,1.538} = 1.0218 $$

$$ p_2 = 1.0218 \times 6.90 = 7.05\ \mathrm{MPa} $$

A 2.2 % overpressure. The case does not care; MEOP has 50 % margin. **But** —
and this is the part the arithmetic hides — the crack is a slot with a small
vent area. Gas generated deep in the crack has to escape through the crack
mouth, and if the crack is deep and narrow the local pressure inside it exceeds
chamber pressure, which drives the crack open, which increases the area, which
raises the pressure. Whether a crack is benign or runs away is a
crack-propagation problem, not a $K_n$ problem, and the 2.2 % number is the
*lower bound* on the consequence. [J]

**(iii) The debond.** The grain's outer surface at the case wall, over 2.0 m:

$$ \Delta A_b = 2\pi R_c L_{\text{debond}} = 2\pi(0.550)(2.00) = 6.912\ \mathrm{m^2} $$

$$ A_{b,3} = 2.827 + 6.912 = 9.739\ \mathrm{m^2}, \qquad
\frac{A_{b,3}}{A_{b,1}} = 3.444 $$

$$ \frac{p_3}{p_1} = 3.444^{\,1.538} = 6.70
\;\Rightarrow\; p_3 = 46.3\ \mathrm{MPa} $$

Against a burst pressure of 14.5 MPa. The case fails, and it fails within a
chamber-filling time of the debond opening — for $V_c \approx 0.21$ m³ and
$c^*A_t = 13.9$ m³/s that is of order 15 ms. There is no detection, no
mitigation, and no abort. Note also that the debond does not have to be present
at ignition: a marginal bond that peels open under the pressurisation transient
produces the same result a few tens of milliseconds later.

**Sanity check.** The ratio of consequences is the lesson: 0.040 m² of added
surface is a 2 % nuisance; 6.9 m² is a 570 % overpressure. A factor of 173 in
added area became a factor of 300 in pressure excursion, because of the
$1/(1-n)$ exponent. Solid-motor acceptance criteria treat *interfacial* defects
categorically more severely than *bulk* defects for exactly this reason: a bulk
crack adds twice its own area, while a debond can add the entire flank of the
grain. And with a higher-exponent propellant the picture is worse still — at
$n=0.6$ the exponent is 2.5 and the debond case gives $3.444^{2.5} = 22\times$.

---

### WE3 — Bore hoop strain from cure cooldown

**Problem.** The same grain: bore radius $a = 0.150$ m, outer (bonded) radius
$b = 0.550$ m, cast and cured at $T_{sf} = 330$ K (57 °C), stored at the
military low limit 219 K (−54 °C, −65 °F). Propellant CTE $\alpha_p =
1.0\times10^{-4}$ K⁻¹, steel case CTE $\alpha_c = 1.2\times10^{-5}$ K⁻¹.
Treat the propellant as incompressible and the case as rigid. Estimate the bore
hoop strain and compare it with a propellant strain capability of 25 % at that
temperature.

---

**Derivation of Eq. 3.5.** Work per unit axial length on the annulus
$a \le r \le b$. Because the propellant is mechanically incompressible, the
*only* source of volume change is thermal:

$$ \frac{\Delta V}{V} = 3\alpha_p \Delta T $$

Geometrically, for an annulus with axial strain $\varepsilon_z$:

$$ \frac{\Delta V}{V} = \frac{2(\Delta b/b)b^2 - 2(\Delta a/a)a^2}{b^2 - a^2} + \varepsilon_z $$

The grain is bonded to the case, so its outer radius and its axial length
follow the case: $\Delta b/b = \alpha_c \Delta T$ and $\varepsilon_z =
\alpha_c \Delta T$. Writing $x = \Delta a/a = \varepsilon_\theta(a)$ and
solving:

$$ (3\alpha_p - \alpha_c)\Delta T\,(b^2-a^2) = 2\alpha_c \Delta T\, b^2 - 2x a^2 $$

$$ \boxed{\;x = \frac{\Delta T\big[2\alpha_c b^2 - (3\alpha_p - \alpha_c)(b^2-a^2)\big]}{2a^2}\;} $$

*Check the degenerate case first.* If $\alpha_p = \alpha_c = \alpha$, the
bracket becomes $2\alpha b^2 - 2\alpha(b^2-a^2) = 2\alpha a^2$ and
$x = \alpha \Delta T$ — the whole assembly expands uniformly with no strain
concentration, as it must. The formula is self-consistent.

**Numbers.** $\Delta T = 219 - 330 = -111$ K.
$b^2 = 0.3025$ m², $a^2 = 0.0225$ m², $b^2 - a^2 = 0.2800$ m².

$$ 2\alpha_c b^2 = 2(1.2\times10^{-5})(0.3025) = 7.260\times10^{-6} $$
$$ (3\alpha_p - \alpha_c) = 3.00\times10^{-4} - 1.2\times10^{-5} = 2.880\times10^{-4} $$
$$ (3\alpha_p-\alpha_c)(b^2-a^2) = 2.880\times10^{-4}(0.2800) = 8.064\times10^{-5} $$
$$ \text{bracket} = 7.260\times10^{-6} - 8.064\times10^{-5} = -7.338\times10^{-5} $$
$$ x = \frac{(-111)(-7.338\times10^{-5})}{2(0.0225)} = \frac{8.145\times10^{-3}}{0.0450} = 0.181 $$

$$ \varepsilon_\theta(a) = 18.1\ \% $$

**The amplification.** The raw CTE mismatch strain is only

$$ (\alpha_p - \alpha_c)|\Delta T| = (8.8\times10^{-5})(111) = 0.98\ \% $$

so the geometry has amplified it by $0.181/0.0098 = 18.5\times$. That factor is
approximately $3(b^2-a^2)/(2a^2) = 3(0.28)/(0.045) = 18.7$ — i.e. it is set
almost entirely by the **web fraction**. A thin-web grain ($a \to b$) has almost
no thermal strain problem; a thick-web, small-bore grain has an enormous one.

**Comparison and judgment.** Against a 25 % capability, 18.1 % is a margin of
only 1.38 on strain, and that is *before* superposing the ignition
pressurisation strain (typically 2–6 % additional at the bore, applied at high
rate where the capability is *lower*), before any ageing knockdown on
capability, and before any stress concentration at a slot fillet or a grain
end. A real programme would not accept this design at 219 K. The fixes, in
order of how often they are used [J]:

1. **Open the bore** (increase $a$). Going from $a=0.150$ to $a=0.200$ m drops
   the amplification from 18.7 to $3(0.3025-0.04)/(2\times0.04) = 9.8$ and the
   strain to about 9.5 %. It costs web thickness and therefore burn time.
2. **Lower the cure temperature.** $\Delta T$ enters linearly; curing at 310 K
   instead of 330 K cuts the strain by 18 %. It costs cure time and may not be
   available for the binder chemistry.
3. **Raise the propellant strain capability** — more binder, less solids,
   different curative. It costs $I_{sp}$ and density.
4. **Relax the low-temperature requirement.** Often the right answer, and
   always the one the customer refuses.
5. **Use a stress-relief boot at the ends** — this does nothing for the bore
   strain, which is a bulk effect, but it is what protects the bondline corner,
   which is a different failure and often the governing one.

**Sanity check.** Case-bonded grains really do run bore strains in the 10–25 %
range at cold soak; that is why solid propellant mechanical-property
specifications are written at 15–50 % strain rather than the fractions of a
percent an engineer trained on metals expects. The number is large, and it is
correct. Note also that Eq. 3.5 with a *carbon/epoxy* case ($\alpha_c \approx
1\times10^{-6}$, nearly zero) gives a bracket of $-8.31\times10^{-5}$ and
$x = 20.5$ % — a composite case makes the thermal strain *worse*, not better,
because it shrinks even less than steel. Filament-wound cases buy mass
fraction and pay for it in grain structural analysis.

---

## 6. Real engines — why did they design it that way?

All motor data below come from the Part III verification worksheet with its
confidence labels; where the worksheet says a figure is unverified, it is not
quoted here.

### 6.1 Space Shuttle SRM/RSRM — asbestos-filled NBR, and a joint that was insulated by putty [H]

The Shuttle booster is a segmented D6AC steel case, ~12.7 mm (0.5 in) nominal
wall, 11 casting segments assembled into 4 flight segments with 3 field joints,
PBAN/AP/Al propellant, roughly 123–124 s action time, nominal chamber pressure
≈ 6.25 MPa (906.8 psia) [conf B, worksheet A.1]. Its internal insulation was
asbestos-filled NBR [NASA-SLS-SRB].

*Why NBR-asbestos?* The design was frozen in the mid-1970s. Asbestos-filled
NBR was the qualified, characterised, cheap, high-performance insulator of that
generation, and it had the char-reinforcement behaviour needed for a 123 s burn
with 16 % aluminium. EPDM systems existed but did not have the database. The
density penalty (≈ 1,400 vs ≈ 1,000 kg/m³) mattered less on a booster whose case
was steel and whose mass fraction was already only ~0.85 [conf CALC,
worksheet A.1] — when the case is that heavy, insulation density is a
second-order lever.

*Why the segmented architecture forced the insulation problem.* Every field
joint is a discontinuity in the insulation. The propellant grain is
discontinuous there too, so the joint region is exposed to gas from early in
the burn, and the joint has to be sealed against 6.25 MPa of 3,400 K gas by
elastomeric O-rings that cannot survive that gas. The architecture therefore
*requires* a thermal barrier upstream of the seals; in the original design that
barrier was hand-packed zinc chromate putty in the insulation gap. §3.10 covers
what happened. The RSRM redesign added a tang capture feature to limit joint
rotation, a third O-ring, **redesigned joint insulation**, and joint heaters
[conf B, worksheet A.1] [Rogers86].

*Would a modern engineer do it this way?* No — but not because of the
insulation. They would avoid the segmented steel case entirely if rail shipping
did not force it, which is exactly what P120C did (§6.4). Given a segmented
case, the modern approach to the joint is a designed, moulded, inspectable
insulation-to-insulation joint with a defined interference, not a putty whose
as-installed state is unverifiable.

### 6.2 RSRMV / SLS five-segment booster — the asbestos-free requalification [M]

NASA's SLS booster reference material is explicit that the five-segment motor
introduced **asbestos-free insulation** and a **new liner configuration**
alongside the fifth segment, a new nozzle, and new avionics, while keeping the
*same PBAN propellant formulation as 1981* [conf A, worksheet A.2]
[NASA-SLS-SRB].

That pairing is the teaching point. The programme deliberately did not touch
the propellant chemistry — the highest-risk change — and instead absorbed the
risk in the insulation and liner, because it had no choice: asbestos was not
going to be available or permissible. And the change was not local. A new
filler changes recession rate (so the thickness profile is re-derived at every
station), changes char conductivity (so the bondline thermal model is re-run),
changes cure chemistry and surface energy (so the case-to-insulation and
insulation-to-liner bonds are requalified), and changes ageing behaviour (so
the service-life model is rebuilt). It also required a new liner configuration
to go with it, which is precisely the "you cannot change one ingredient without
requalifying the stack" rule from §3.3, demonstrated on the largest solid motor
ever flown. Burn time 126 s per NASA's page; note secondaries that quote ~123 s
are carrying over the Shuttle figure [conf A, worksheet A.2].

### 6.3 Ariane 5 EAP (P230 → P238 → P241) — insulation as a growth path [H]/[M]

Steel case, 3 bolted segments, HTPB/AP/Al at roughly AP 68 / Al 18 / HTPB 14,
carbon-phenolic flexseal nozzle, ≈ 130–140 s burn, and a designation that *is*
the propellant load in tonnes [conf A/B, worksheet A.5]. The P230→P238→P241
series added propellant inside a frozen case and raised the nozzle expansion
ratio from 9.7 to 11.0 [conf B].

Where does 11 tonnes of extra propellant come from in a case you are not
allowed to change? Partly from grain geometry, and partly from every inert item
inside the case — including insulation. Squeezing a growth series like this is
in large part an exercise in re-examining insulation margins with the flight
data you now have: the first design used FS ≈ 2 on an uncalibrated recession
model; after twenty flights you have recovered boosters (the EAPs are parachute
recovered for inspection [conf C]) and can measure actual char depth station by
station, so FS drops toward 1.25 and the thickness profile is re-cut. **Post-
flight insulation measurements are the highest-value data a recoverable solid
booster produces**, and they are the reason a recovery programme can pay for
itself in performance even if the hardware is never reflown. [J]

### 6.4 P120C / Zefiro family — low-density EPDM on a composite case [M]

The Zefiro motors and P120C use carbon- or graphite-epoxy filament-wound cases,
**low-density EPDM insulation**, carbon-phenolic nozzles with carbon–carbon
throat inserts, and electromechanical TVC on a flexible joint [conf B,
worksheet A.7]. P120C is monolithic — one piece, no segments, no field joints —
and achieves a propellant mass fraction of 0.924 against ~0.85 for the
segmented steel Shuttle SRB [conf CALC/B, worksheets A.6, A.1].

*Why low-density EPDM specifically?* Two coupled reasons. First, when the case
mass has been driven down by a factor of two, the insulation becomes a large
fraction of what is left; a 25 % density reduction in the insulator is now
worth real mass fraction. Second, the composite case has a *lower* bondline
temperature limit than steel — the epoxy matrix loses properties in the
400–450 K range, well below where steel cares — so the residual-virgin-layer
requirement $\delta_{\text{res}}$ is larger, not smaller, which pushes back
against the mass saving. Low-density EPDM with hollow microspheres attacks both
at once: lower density *and* lower thermal conductivity. The price is lower
erosion resistance (the microspheres are a weak char), which is why such
motors still use a denser, more erosion-resistant compound locally at the aft
dome — exactly the two-material split of worked example 1.

*Monolithic and case-bonded also changes the structural problem.* No field
joints means no joint insulation and no segment-end stress-relief flaps at
three interior stations; but the near-zero CTE of the composite case makes the
cure-cooldown bore strain *worse* (WE3's sanity check), and the low-CTE case
means the grain is more strongly constrained. Vega's flight record contains two
solid-motor losses — VV15 (Zefiro 23, 2019) and VV22 (Zefiro 40 under-pressure,
2022, attributed to unexpected erosion of the carbon–carbon nozzle throat
insert traced to a supplier change) [conf B/C, worksheet A.7]. Neither is an
insulation failure, but VV22 is the same *class* of failure as an insulation
failure: a materials-qualification decision in an ablative subcomponent
destroyed a launch vehicle.

### 6.5 Titan UA1205 → SRMU — a clean generational comparison [H]

Same vehicle, same job, same 3.05 m diameter class: UA1205 was 5-segment
steel-case PBAN with liquid-injection TVC; SRMU was 3-segment
graphite/epoxy-case HTPB with a gimballed nozzle [conf B, worksheet A.4]. Fewer
segments means fewer joints means less joint insulation, fewer stress-relief
flaps, fewer inspection interfaces, and less of the failure mode that killed
Challenger. That is a large and often unstated part of the value of going to a
filament-wound case, independent of the mass saving. The worksheet flags that
SRMU development was troubled, including a case failure during a 1991
structural test, and marks the details as needing a primary source [conf C];
they are not asserted here beyond that.

### 6.6 GEM-63XL — a monolithic strap-on where insulation is inert-mass-critical [M]

Carbon-fibre filament-wound monolithic case, HTPB/AP/Al, 47,853 kg propellant,
53,030 kg gross, 87.3 s burn, described by the manufacturer as the longest
monolithic motor produced to date [conf B→A, worksheet A.8]. The mass fraction
is 0.902 [conf CALC]. On a strap-on like this the entire inert budget is
5,177 kg for a 22 m long, 1.62 m diameter motor, and the internal surface area
is of order 110 m². At even 5 kg/m² of insulation that is 550 kg — over 10 % of
the inert mass — which is why every gram of taper optimisation is worth doing
and why the aft-end insulation, sized by an 87 s exposure at high flux, is the
single biggest line item in that budget after the case itself.

### 6.7 BOLE — insulation implied by a propellant change [claim]

The Booster Obsolescence and Life Extension motor replaces the steel case with
carbon composite and PBAN with HTPB, with electric TVC, and Northrop Grumman
claims +11 % total impulse; DM-1 static fired 2025-06-26 with an anomaly
observed near the end of the burn in the nozzle [conf B, contractor claim,
worksheet A.3]. Per the course's hard rule on unflown hardware, every BOLE
number is a claim.

The insulation-relevant point: PBAN → HTPB is not just an $I_{sp}$ change. It
changes flame temperature, particle size distribution, and therefore recession;
it changes the binder chemistry that the liner must co-cure with; and combined
with a composite case it changes the bondline temperature limit. Anyone reading
the BOLE programme as "same motor, better propellant" is reading it wrong: the
insulation, liner and bond system are all new, and they are all on the critical
path.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 Trade-offs

| trade | one way | the other way | who usually wins |
|---|---|---|---|
| Insulation density vs erosion resistance | Low-density microsphere EPDM: minimum mass | Carbon-filled: minimum recession | Split the motor: low-density on the cylinder, dense on the aft dome. Two bond quals, one splice, worth it above ~1 m diameter. [J] |
| Uniform vs tapered thickness | Uniform: one sheet stock, simple layup, no ply-drop defects | Tapered: 2–3× lighter (WE1) | Tapered, always, on anything flight-weight |
| Case-bonded vs cartridge-loaded | Case-bonded: volumetric loading, grain support under g-load | Cartridge: no bond risk, replaceable grain, easier inspection | Case-bonded for large; cartridge survives in small tactical motors and in gas generators |
| Thick web (long burn) vs thermal strain | Thick web: more propellant, longer burn | Thin web: low bore strain (WE3) | Thermal strain sets the cold storage limit; a low-temperature requirement can force a bore opening that costs burn time |
| High safety factor vs mass | FS 2.0: sleep at night | FS 1.25: fly the payload | FS falls only with data — subscale char motors, then full-scale static, then flight and (if recoverable) post-flight char measurement |
| Stress-relief boot vs no boot | Boot: kills the bondline-corner singularity | No boot: no blind cavity for gas | Boot at every grain end on a large case-bonded motor; then spend the design effort on making the boot tip gas-tight and the insulation under it full-duration |
| One insulation supplier vs two | One: consistency, single qualification | Two: no single-point supply failure | One, in practice, and it is a known programme risk — the Vega VV22 supplier-change failure is the cautionary tale [conf C, worksheet A.7] |

### 7.2 Failure modes — mechanism → symptom → evidence → fix

**Case burn-through at a local thin spot.**
*Mechanism:* recession exceeded prediction, or the as-built thickness was under
drawing at a ply drop-off. *Symptom:* a plume from the case wall; in flight, a
thrust-vector transient and a rapid vehicle failure; on a static test, a hole.
*Evidence:* post-test the hole is at the *end* of a taper or at a scarf joint,
not in a field; the char depth on either side of the hole is close to
prediction. *Fix:* stagger ply drop-offs, add local thickness at every
discontinuity, and 100 % thickness-map the as-built insulation (ultrasonic or
thermographic) before casting.

**Aft-dome burn-through under a submerged nozzle.**
*Mechanism:* impingement and slag pooling recession exceeded a correlation
fitted in a boundary-layer geometry. *Symptom:* burn-through late in the burn,
in the aft dome, often near the nozzle-to-case joint. *Evidence:* the recession
profile has a maximum where the flow turns, not where $G$ is maximum. *Fix:*
this is not fixable by increasing FS on the wrong correlation; it needs an
impingement model or a subscale test in the right geometry, plus an
erosion-resistant compound locally.

**Propellant/liner debond → overpressure.**
*Mechanism:* weak or migration-degraded bond peels under pressurisation or
under cold thermal strain. *Symptom:* pressure trace departs above nominal
within the first second and diverges; case rupture. *Evidence:* on a survivable
case (rare), the fracture surface is adhesive at the liner, not cohesive in the
propellant; bond witness specimens from the same lot are low. *Fix:* surface
preparation control, tack-life control in casting, barrier liner for
plasticised systems, and bond tensile acceptance on co-processed tabs.

**Grain crack at cold soak.**
*Mechanism:* bore strain (WE3) plus ageing knockdown exceeds capability.
*Symptom:* ignition overpressure, or a "hard start" pressure spike; in a
surveillance dissection, a visible bore crack. *Evidence:* the crack is
longitudinal at the bore or radial at a slot fillet — i.e. exactly where the
structural model puts the maximum principal strain. *Fix:* open the bore, lower
the cure temperature, raise strain capability, or restrict the cold limit.

**Bondline-corner debond at a grain end.**
*Mechanism:* peel and shear singularity at the bonded bimaterial corner.
*Symptom:* a debond that grows over storage life, found by CT during
surveillance. *Evidence:* it starts at the corner, every time. *Fix:* a
stress-relief flap/boot, and insulation under the flap sized for the full
action time.

**Blow-by / joint burn-through in a segmented motor.**
*Mechanism:* the thermal barrier protecting a seal is not continuous or not
verifiable; joint rotation opens the seal gap during the pressurisation
transient. *Symptom:* soot and erosion on recovered O-rings, or a joint plume.
*Evidence:* recovered joints show blow-by paths through the barrier.
*Fix:* limit joint rotation mechanically, add a redundant seal, replace the
unverifiable barrier with a designed insulation joint, control seal temperature
[Rogers86].

### 7.3 Materials

The material choice is a three-way argument between density (inert mass), char
mechanical integrity (erosion resistance), and char thermal conductivity
(bondline temperature). Aramid pulp is the compromise that wins most of the
time: it reinforces the char without the density or the conductivity of carbon
fibre. Silica is chosen when the station is conduction-limited and cheap
matters. Carbon is chosen where erosion controls and mass is available. And the
binder is chosen for ageing and processability: EPDM's saturated backbone is
the reason it displaced NBR, more than any single-firing property. [J]

### 7.4 Manufacturing

Insulation is laid up as calendered elastomer sheet plies over a mandrel or
directly into the case, or moulded as dome parts, then vulcanised — in an
autoclave, or by pressurising the case itself, or by an inflatable bladder that
presses the layup against the case wall while it cures. Key process controls:
case surface preparation (grit blast, solvent wipe, primer, with a controlled
time-to-bond); ply orientation and stagger at drop-offs; complete air removal
at the case wall (an entrapped bubble is a manufactured unbond); and the cure
state at which the liner is applied.

Liner is sprayed, brushed, or slurry-cast onto the insulation and taken to a
partial cure. Then the mandrel goes in, propellant is vacuum-cast, and the
whole assembly cures for days. The mandrel is extracted — a mechanically
violent operation on a bonded grain, and a documented source of bore damage and
bondline damage — and the bore is inspected.

What manufacturing *limits*: minimum practical sheet thickness (below ~1.5–2 mm
plies are hard to handle and hard to verify), maximum practical local thickness
in a single moulded part, the taper rate you can lay up without wrinkling, and
the accessible geometry for a bladder or autoclave. Insulation designs that the
thermal analyst likes and the layup technician cannot build are a recurring
programme failure. [J]

### 7.5 Testing

- **Char motors / subscale motors.** Small motors with instrumented insulation
  coupons at controlled $G$ and $p$, fired with the *actual* flight propellant,
  to fit Eq. 3.2. This is where the recession correlation comes from, and its
  validity range is the range these motors covered.
- **Thermocouple plugs.** Embedded thermocouples at known depths in the
  insulation of a static-test motor. The arrival time of the temperature rise at
  each depth gives the char-front trajectory directly — the single most useful
  insulation measurement available. Instrumented bondline thermocouples verify
  $T_{bl}$ against limit.
- **Post-test dissection.** Section the motor, measure residual thickness and
  char depth on a grid, compare with prediction station by station. This is the
  data that lets FS come down.
- **Bond tensile / peel specimens.** Co-processed tabs pulled to failure; the
  requirement is cohesive failure in the propellant, and the number is the bond
  strength.
- **Structural test motors and cold/hot conditioning.** Motors conditioned at
  the temperature limits and static fired, plus non-firing thermal-cycle
  articles that are CT'd between cycles.
- **What the data looks like when it is wrong:** a bondline thermocouple that
  rises earlier than predicted at *one* station and on schedule everywhere else
  is a local thin spot or a local flow anomaly, not a material problem. A
  pressure trace above nominal from ignition that grows is added burning
  surface (§3.7 path A). A normal pressure trace with a late thrust-vector
  transient is a burn-through (path B). Those two signatures are the primary
  in-flight discriminator between the two failure paths.

---

## 8. Misconceptions and what engineers actually care about

**"The insulation's job is to conduct heat away from the case."** No — it is a
thermal *barrier and a sacrificial one*. It works by having low conductivity, by
consuming enthalpy in pyrolysis, and by blowing pyrolysis gas into the boundary
layer. It never reaches steady state; the design is a race between the char
front and the clock.

**"The hottest place needs the thickest insulation."** No — the place with the
largest product of recession rate and *exposure time* does. In WE1 the forward
dome, at the lowest mass flux in the motor, needs 2.6× the thickness of the
forward cylinder because it is exposed for 95 s instead of 22 s.

**"Char rate and recession rate are the same thing."** Only in the
erosion-limited regime. Where the char stays put, the pyrolysis front advances
while the surface does not move, and the char is doing useful work. Confusing
the two makes you over-thicken low-shear stations and under-thicken impingement
stations — an error in both directions at once.

**"A crack in the grain just makes it burn a bit faster."** A crack adds twice
its face area, which is usually a few percent of pressure (WE2 (ii)). A
*debond* can add the entire outer flank of the grain, which in WE2 (iii) is a
6.7× overpressure against a 2.1× burst margin. The severity gap between bulk
and interfacial defects is the whole basis of solid-motor acceptance criteria.

**"The liner is just glue."** It is glue, migration barrier, and mechanical
grading layer. In a plasticised (nitrate-ester) system the barrier function is
the *dominant* one, and getting it wrong shows up not on the test stand but
five years into storage as a bond strength that has fallen below requirement.

**"A composite case makes everything better."** It makes mass fraction better
(0.924 for P120C vs ~0.85 for the segmented steel SRB [conf B/CALC]). It makes
the grain thermal-strain problem *worse*, because a near-zero-CTE case shrinks
even less than steel (WE3 sanity check), and it makes the bondline temperature
limit *lower*, because the epoxy matrix degrades far below where steel cares.

**"Accelerated ageing at elevated temperature tells you the service life."**
Only if the mechanism at the elevated temperature is the same as the mechanism
at storage temperature. Every accelerated programme owes a demonstration of
mechanism equivalence; without it, the Arrhenius extrapolation is measuring a
reaction that never runs in the field.

**"The asbestos removal was a paperwork change."** Changing the filler changed
recession, char conductivity, cure chemistry, bond behaviour and ageing. NASA
describes the five-segment motor as having asbestos-free insulation *and* a new
liner configuration [conf A, worksheet A.2] — the two go together, because the
stack is qualified as a stack.

### What engineers in this area actually care about

1. **The recession correlation's validity range.** Not the correlation — the
   range. Almost every insulation surprise is an extrapolation.
2. **Exposure-time profile from burnback**, station by station, and how much it
   moves when the grain design changes. An insulation drawing is downstream of
   a grain drawing and has to be re-cut whenever the grain moves.
3. **Bond strength trend over time**, from surveillance, against the
   requirement. This is the number that decides whether the fleet is still
   flightworthy.
4. **As-built thickness maps** versus drawing, before casting. The design is
   only as good as the layup, and after casting you cannot see it.
5. **Cold-limit bore strain margin**, because it is what usually sets the
   operational temperature envelope of the whole motor and it degrades with
   age.

---

## 9. Mastery levels

**Level 1 — Familiarity.** Explain in plain language what internal insulation
and liner each do and why a solid motor needs both. Name the two dominant
material families (NBR, EPDM) and the three filler families (silica, aramid,
carbon), and say what each filler buys. State that exposure time varies along
the case and give the reason. Name two motors and one insulation-relevant design
choice each (e.g. Shuttle SRM asbestos-filled NBR; Zefiro/P120C low-density
EPDM on a composite case). Say why a debond is worse than a crack.

**Level 2 — Working engineering knowledge.** Given a station table of $G$ and
$t_e$ and a recession correlation, size the insulation thickness with a margin
stack and compute the insulation mass, tapered and untapered. Compute the
chamber-pressure rise from a stated added burning area using
$p_2/p_1 = (A_{b2}/A_{b1})^{1/(1-n)}$ and compare against MEOP and burst.
Estimate cure-cooldown bore strain from a thermal-mismatch argument and compare
with a strain capability. State the assumptions behind each of those and where
they fail. Read a bondline thermocouple trace or a post-test char-depth map and
say whether the design is on prediction. Describe the case–insulation–liner–
propellant stack and what test qualifies each interface.

**Level 3 — Interview mastery.** Given an unfamiliar motor — its diameter, burn
time, propellant family, case material, nozzle architecture — reason to an
insulation architecture: which stations govern, which material goes where,
roughly how thick, where the stress-relief boots go, and what the top three
risks are. Given a described failure (pressure trace, recovered hardware, a
surveillance CT finding), discriminate between the added-burning-surface path
and the gas-path-to-case path and say what evidence would settle it. Argue both
sides of the low-density-versus-erosion-resistant material choice for a specific
motor. Say which historical programme faced the same problem — segmented-joint
insulation and Challenger; asbestos substitution and RSRMV; ablative-supplier
qualification and Vega VV22 — and what they did about it.

---

## 10. Problems

### Conceptual

**P1.** Two stations in the same motor see the same gas temperature, the same
pressure, and the same local mass flux. One needs 8 mm of insulation and the
other needs 30 mm. Give two physically distinct reasons this can be true, and
say what data you would ask for to distinguish them.

**P2.** Explain why blowing (transpiration of pyrolysis gas) reduces the
convective heat flux, and why that effect is largest in the low-crossflow
regions of the motor rather than the high-flux ones.

**P3.** A colleague proposes eliminating the liner and casting propellant
directly against fully cured EPDM insulation, arguing that the insulation is
already an elastomer and the propellant binder will bond to it. Give three
separate reasons this fails, one chemical, one mechanical, one long-term.

**P4.** Why is a stress-relief boot a *deliberate debond*, and what three design
features must it have to keep it from behaving like an accidental one?

**P5.** A composite-cased motor and a steel-cased motor of identical internal
geometry, propellant, and burn time are both stored at 219 K. Which grain has
the higher bore strain, and why? Which has the more demanding bondline
temperature limit, and why? Are those two answers pulling the design in the same
direction?

**P6.** Distinguish char rate, erosion rate, and surface recession rate, and
describe a station in a real motor where each of the three regimes (char
retained, char partly removed, char fully swept) dominates.

**P7.** Why is distributed porosity in a cast grain a fundamentally different
problem from a single void of the same total volume? Address both the ballistic
and the structural consequence.

**P8.** Radiography and ultrasonics are described in §3.9 as complementary.
State precisely which defect class each is good at and which each is blind to,
and construct a defect that neither would find.

### Calculation

**P9.** A station has $G = 60$ kg/(m²·s) and is exposed for 45 s. Using
material A from WE1 ($\dot s\,[\mathrm{mm/s}] = 0.10 + 0.0060\,G$), FS = 1.5 and
$\delta_{\text{res}} = 2.0$ mm, find the required thickness. Then find the
exposure time at which material B ($\dot s = 0.05 + 0.0030\,G$, $\rho = 1{,}350$)
becomes lighter per unit area than material A ($\rho = 1{,}100$) at this $G$.

**P10.** A motor has $A_{b} = 4.20$ m², $A_t = 0.0125$ m², $\rho_p = 1{,}760$
kg/m³, $c^* = 1{,}520$ m/s, $n = 0.30$, and $a = 4.10\times10^{-5}$ (SI, m/s per
Pa$^n$). Compute the nominal equilibrium chamber pressure. Then a casting void
opens a cavity that adds 0.35 m² of burning surface. Compute the new pressure
and the fractional increase. If MEOP is 1.4× nominal, is the motor still inside
MEOP?

**P11.** For the WE2 motor, find the *maximum* debonded axial length that keeps
the equilibrium pressure at or below MEOP (10.35 MPa). Express it as a fraction
of grain length, and comment on what that fraction implies for acceptance
criteria on interfacial defects.

**P12.** A grain has $a = 0.120$ m, $b = 0.500$ m, $\alpha_p = 1.05\times10^{-4}$
K⁻¹, $\alpha_c = 2.3\times10^{-5}$ K⁻¹ (aluminium case), cure temperature 335 K.
Using Eq. 3.5, find the bore hoop strain at 233 K. Then find the bore radius $a$
that would bring the strain to 12 %, all else equal, and state the cost of that
change in propellant volume per unit length.

**P13.** Take the WE1 station table. Suppose the burnback analysis is revised
and the aft cylinder's exposure time increases from 35 s to 55 s while
everything else is unchanged. Recompute the aft-cylinder thickness with material
A and with material B, and recompute the total tapered insulation mass using
whichever material is lighter at that station. By how much does the total move?

**P14.** Estimate the time at which Eq. 3.3's $\sqrt{t}$ regime gives way to a
linear-rate regime for an insulator with $k_i = 0.25$ W/(m·K), $\rho_i = 1{,}100$
kg/m³, $c_{p,i} = 1{,}500$ J/(kg·K), taking the transition when the char
thickness reaches 4 mm and $C = 1$. Comment on which stations in WE1 are in
which regime for their full exposure.

**P15.** An accelerated-ageing programme finds bond strength falling with an
apparent activation energy of 85 kJ/mol. Samples at 344 K reach the minimum
acceptable bond strength in 180 days. Estimate the equivalent time at a 298 K
storage temperature, and state two reasons the answer might be badly wrong.

### Engineering reasoning

**P16.** A static test of a new booster shows a pressure trace within 1 % of
prediction for the whole burn, a normal tailoff, and, on teardown, a 40 mm
diameter hole in the case in the aft dome 300 mm forward of the nozzle
attachment. Bondline thermocouples at four cylindrical stations all read within
prediction; there was no aft-dome thermocouple. Diagnose the failure path,
explain what the normal pressure trace tells you, and list the three
measurements you would add before the next test.

**P17.** During a surveillance dissection of a ten-year-old motor, propellant
mechanical properties at the bore are within specification, but bond tensile
specimens fail *adhesively* at the liner at 60 % of the as-manufactured value,
and a 1 mm-wide band of propellant adjacent to the liner is measurably stiffer
than the bulk. Name the mechanism, explain the specific link between the stiff
band and the adhesive failure, and say what you would recommend for the fleet
and for the next production lot.

**P18.** Two motors of the same design are conditioned to 219 K and 305 K and
static fired. The cold motor's pressure trace runs 8 % low and its action time
is 9 % long; the hot motor runs high and short. Both are within family. A third
cold motor shows a 20 % pressure spike at 0.4 s that then decays to the cold
family trace. Explain both observations, and say which one is an insulation and
bonded-assembly concern rather than a burn-rate concern.

**P19.** You are handed post-flight char-depth measurements from a recovered
booster: predicted char depth was met within 10 % at every cylindrical station,
but the aft dome measured 1.7× prediction, with the peak displaced toward the
nozzle-side of where the flux model put it. What is the physical explanation,
why did the correlation fail *only* there, and what would you change in the next
design — and, separately, in the next analysis?

**P20.** Argue for and against reducing the insulation safety factor from 1.6 to
1.3 on a booster after ten successful flights, given that four of the ten were
recovered and dissected. State what evidence would make the reduction defensible
and what would make it reckless.

### Mini trade study

**P21.** You are designing internal insulation for a new 1.8 m diameter,
monolithic filament-wound (carbon/epoxy) upper-stage-class solid motor: 95 s
action time, HTPB/AP/Al at 18 % aluminium, submerged nozzle, case-bonded grain
with a nominal 200 mm web, required storage envelope 233–322 K, and an inert
mass budget that is already 4 % over allocation. The insulation station analysis
gives $G$ from 8 kg/(m²·s) at the forward dome to 140 kg/(m²·s) in the aft dome,
with exposure times of 90 s at the forward dome, 25 s on the cylinder, and 95 s
in the aft dome.

Four options are on the table:

- **(A)** Single material, aramid-filled EPDM (1,050 kg/m³), tapered.
- **(B)** Two materials: low-density microsphere EPDM (800 kg/m³, recession
  1.6× that of aramid-filled) on the cylinder and forward dome, carbon-filled
  EPDM (1,350 kg/m³, recession 0.5× aramid-filled) in the aft dome.
- **(C)** Single material, low-density microsphere EPDM everywhere, tapered,
  with the aft dome thickness taken to whatever the recession model requires.
- **(D)** Option A plus a rigid silica-phenolic hard insert bonded into the aft
  dome impingement region.

Constraints: the epoxy matrix limits bondline temperature to 425 K; the
programme has qualification data on aramid-filled EPDM only; there are 14 months
to first static test; and the grain structural analysis is already showing only
1.4 margin on cold bore strain.

Recommend one option. Justify it against inert mass, thermal risk, structural
interaction, qualification cost and schedule. State explicitly what you would
need to measure to retire the largest remaining risk in your recommendation, and
what you would do if that measurement came back unfavourable.

---

## 11. Quiz (100 points)

1. **(6)** Internal insulation protects the case primarily by
   (a) conducting heat into the case uniformly, (b) reflecting radiation,
   (c) low conductivity plus sacrificial pyrolysis and blowing, (d) phase-change
   latent heat of a metallic filler.

2. **(8)** State the two quantities whose *product* sets the thermal load at an
   insulation station, and give a one-sentence physical reason why they are often
   anticorrelated along the length of a case-bonded motor.

3. **(10)** A station has $G = 25$ kg/(m²·s) and $t_e = 60$ s. Using
   $\dot s\,[\mathrm{mm/s}] = 0.10+0.0060\,G$, FS = 1.5, $\delta_{\text{res}} =
   1.5$ mm, compute the required thickness in mm.

4. **(8)** Which is worse for a case-bonded grain's cure-cooldown bore strain, a
   steel case or a carbon/epoxy case, and why? Answer in two sentences.

5. **(12)** A motor with $n = 0.40$ suffers a defect that raises burning surface
   by 18 %. Compute the equilibrium pressure ratio $p_2/p_1$. If nominal is
   7.0 MPa and MEOP is 10.5 MPa, is the motor inside MEOP?

6. **(8)** Name the three species that migrate across the propellant/liner
   interface, and state the *specific* consequence of each for bond performance.

7. **(10)** A recovered booster shows a case burn-through with a normal pressure
   trace throughout the burn. Which of the two failure paths in §3.7 is this, and
   what does the normal pressure trace rule out? Two sentences.

8. **(12)** Using Eq. 3.5 with $a = 0.18$ m, $b = 0.60$ m, $\alpha_p =
   9.0\times10^{-5}$ K⁻¹, $\alpha_c = 1.2\times10^{-5}$ K⁻¹, and a cooldown from
   330 K to 240 K, compute the bore hoop strain. Then state one assumption in
   Eq. 3.5 that makes this an over-estimate and one that makes it an
   under-estimate.

9. **(14)** You must choose between aramid-filled EPDM and carbon-filled EPDM
   for the aft dome of a motor whose case is carbon/epoxy with a 420 K bondline
   limit. Carbon-filled has half the recession rate but 30 % higher density and a
   char with roughly three times the thermal conductivity. Which do you choose,
   what additional analysis do you insist on before committing, and under what
   result would you reverse the choice?

10. **(12)** The Shuttle SRB field joint used zinc chromate putty as the thermal
    barrier upstream of the O-rings. State the design intent, state the two
    physical mechanisms by which it failed to deliver that intent, and state the
    general engineering principle — about verifiability of a thermal component —
    that the field took from it.

---

## 12. Further reading

- **[SP-8115]** *Solid Rocket Motor Internal Insulation* (NASA design criteria
  monograph, 1976). The primary reference for this module: environment
  definition, material selection, recession correlation practice, thickness
  margins, bond requirements, verification testing. Dated on materials, current
  on method.
- **[SP-8073]** *Solid Propellant Grain Structural Integrity Analysis* (1973).
  Read for §3.6: viscoelastic characterisation, load cases, bore and bondline
  analysis, stress-relief boot design, cumulative damage.
- **[SP-8064]** *Solid Propellant Selection and Characterization* (1971). Read
  for the mechanical-property characterisation that feeds the structural model
  and for bond system requirements.
- **[SP-8075]** *Solid Propellant Processing Factors in Rocket Motor Design*
  (1971). Read for the casting-defect taxonomy and the process controls behind
  §7.4.
- **[SB §12]** Sutton & Biblarz, *Rocket Propulsion Elements*, 9th ed., solid
  motor chapters. Read for the grain/insulation/liner overview, the
  case-bonding discussion, and the slag and two-phase-flow treatment.
- **[Davenas]** *Solid Rocket Propulsion Technology*. The most complete European
  treatment of liners, bonding agents, migration and ageing; read the bonding
  and ageing chapters specifically.
- **[Kubota]** *Propellants and Explosives: Thermochemical Aspects of
  Combustion*. Read for the binder chemistry underlying pyrolysis and char
  formation.
- **[Rogers86]** Report of the Presidential Commission on the Space Shuttle
  Challenger Accident (1986), Vol. I ch. IV. Read the joint chapter for the
  putty, blow-by and joint-rotation sequence, and Appendix F for what an
  engineer should say when the analysis and the decision diverge.
- **[NASA-SLS-SRB]** NASA SLS Solid Rocket Booster reference material. Read for
  the asbestos-free insulation and new liner configuration on the five-segment
  motor, and for the fact that the propellant formulation did not change.
