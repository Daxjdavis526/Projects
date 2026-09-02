# Module 11 — Cooling Systems
Part II · Prerequisites: modules 05, 06, 09, 10 · Estimated time: 7 h

Module 10 told you how much heat arrives at the wall. This module is about the
only question that matters afterwards: where does it go. Every failure I have
watched on a test stand traces back to somebody treating the cooling circuit as
plumbing bolted on after the chamber was designed. It is not plumbing. The
coolant channel geometry sets the wall temperature, the wall temperature sets
the liner life, the channel pressure drop sets the pump discharge pressure, the
pump discharge pressure sets the turbine power, and the turbine power sets the
cycle. A 15-bar error in the jacket $\Delta p$ is not a plumbing detail; it is
half a megawatt of pump power on a mid-sized booster engine and it can be the
difference between a cycle that closes and one that does not. The cooling
circuit is the structural, hydraulic and thermal spine of the thrust chamber,
and it must be designed at the same time as the contour, not after it.

---

## 1. Learning objectives

After this module you should be able to:

1. Name the seven cooling methods used in flight hardware, state the heat-flux
   and burn-duration regime each is suited to, and identify which method a
   given engine used from a photograph or a cutaway.
2. Build the 1-D series-resistance model of a regeneratively cooled wall and
   solve it for heat flux, gas-side wall temperature, through-wall $\Delta T$
   and coolant-side wall temperature.
3. Size a cooling channel: pick channel count, width, height, aspect ratio,
   land width and hot-wall thickness, and compute the fin efficiency and the
   effective coolant-side coefficient that follow.
4. Compute coolant-side heat transfer with Dittus–Boelter and Sieder–Tate,
   apply the curvature enhancement, and state where each correlation fails.
5. Compute channel pressure drop with Darcy–Weisbach, add curvature and
   manifold losses, and convert the result into required pump discharge
   pressure and pump shaft power.
6. Compare RP-1, methane and hydrogen as coolants using their transport
   properties, and explain quantitatively why the coking limit rules out
   RP-1 regenerative cooling alone above a certain chamber pressure.
7. Choose a coolant routing topology (counter-flow, parallel, 1-pass,
   1.5-pass, 2-pass, split circuits) and justify it from the heat-flux and
   bulk-temperature profiles.
8. Estimate a film-cooling flow fraction from a wall heat load and convert it
   into a specific-impulse penalty.
9. Compute the enthalpy pickup in an expander-cycle cooling jacket and show
   why it must be roughly an order of magnitude larger than the turbine shaft
   power it produces.
10. Argue, for a named historical or modern engine, why its cooling
    architecture was the right answer given its propellants, chamber pressure,
    duty cycle and manufacturing base.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Gas-side heat-transfer coefficient | $h_g$ | W/(m²·K) | convective coefficient between combustion gas and hot wall (Module 10) |
| Coolant-side heat-transfer coefficient | $h_c$ | W/(m²·K) | convective coefficient between channel wall and coolant, referenced to wetted channel area |
| Effective coolant-side coefficient | $h_{c,\mathrm{eff}}$ | W/(m²·K) | $h_c$ referenced to the **gas-side** area, after the fin/land area enhancement |
| Adiabatic wall temperature | $T_{aw}$ | K | recovery temperature the gas would drive an insulated wall to |
| Gas-side wall temperature | $T_{wg}$ | K | hot-face metal temperature |
| Coolant-side wall temperature | $T_{wc}$ | K | metal temperature at the channel floor |
| Coolant bulk temperature | $T_b$ | K | mixed-mean coolant temperature at a station |
| Heat flux | $q''$ | W/m² | local wall heat flux, referenced to gas-side area |
| Total wall heat load | $Q$ | W | $\int q''\,dA$ over the cooled surface |
| Hot-wall thickness | $t_w$ | m | metal between combustion gas and coolant |
| Wall conductivity | $k_w$ | W/(m·K) | thermal conductivity of the liner alloy |
| Channel width | $w$ | m | circumferential channel dimension |
| Channel height | $h_{ch}$ | m | radial channel dimension |
| Channel aspect ratio | $AR$ | — | $h_{ch}/w$ |
| Land width | $t_L$ | m | metal rib between adjacent channels |
| Channel pitch | $p_{ch}$ | m | $w + t_L = \pi(D+2t_w)/N_{ch}$ |
| Channel count | $N_{ch}$ | — | number of parallel channels around the circumference |
| Hydraulic diameter | $D_h$ | m | $4A_{ch}/P_{ch}$ for the channel cross-section |
| Coolant velocity | $V_c$ | m/s | bulk velocity in the channel |
| Coolant Reynolds number | $Re_c$ | — | $\rho_c V_c D_h/\mu_c$ |
| Coolant Prandtl number | $Pr_c$ | — | $c_{p,c}\mu_c/k_c$ |
| Darcy friction factor | $f$ | — | $\Delta p = f (L/D_h)(\rho V^2/2)$ |
| Fin (land) efficiency | $\eta_f$ | — | $\tanh(mL)/(mL)$ for the land treated as a straight fin |
| Area enhancement | $\Phi$ | — | $(w + 2\eta_f h_{ch})/p_{ch}$ |
| Jacket pressure drop | $\Delta p_j$ | Pa | total coolant pressure loss across the circuit |
| Film-cooling flow fraction | $x_{fc}$ | — | film coolant mass flow / total engine mass flow |
| Film effectiveness | $\eta_{fc}$ | — | $(T_{aw} - T_{aw,\mathrm{film}})/(T_{aw} - T_{c,\mathrm{inj}})$ |
| Ablation (char) rate | $\dot s$ | m/s | recession rate of an ablative liner |
| Critical heat flux | $q''_{CHF}$ | W/m² | flux at which nucleate boiling transitions to film boiling |
| Pseudo-critical temperature | $T_{pc}$ | K | temperature of peak $c_p$ at a supercritical pressure |
| Coking threshold | $T_{coke}$ | K | coolant-side wall temperature above which hydrocarbon deposits form at an unacceptable rate |

---

## 3. Theory

### 3.1 The problem, restated in the only form that matters

Module 10 gives you $h_g$ and $T_{aw}$. At the throat of a 100-bar
kerosene/oxygen engine those are of order $1.8\times10^4$ W/(m²·K) and 3570 K.
If the wall were adiabatic it would sit at 3570 K, which is above the melting
point of every metal ever made. To keep a copper alloy below about 800 K you
must remove

$$q'' = h_g\,(T_{aw} - T_{wg}) \approx 1.8\times10^4 \times (3567 - 800) \approx 5\times10^{7}\ \mathrm{W/m^2}$$

> **Eq. 3.1** — variables: $q''$ wall heat flux [W/m²]; $h_g$ gas-side
> coefficient [W/(m²·K)]; $T_{aw}$ adiabatic wall temperature [K]; $T_{wg}$
> gas-side wall temperature [K]. Meaning: Newton's law of cooling on the gas
> side; the wall temperature you *choose* fixes the flux you must *remove*.
> Assumes: $h_g$ independent of $T_{wg}$ (it is not — see the Bartz $\sigma$
> correction, Module 10), steady state, no radiation term. Fails when: the
> wall is soot-coated or carbon-deposited (both reduce the effective $h_g$),
> when radiation from soot particles is significant (hydrocarbon engines at
> low $p_c$), and near an injection film where $T_{aw}$ is not the free-stream
> recovery temperature.

50 MW/m². For scale: the surface of the Sun radiates about 63 MW/m². A rocket
throat is, in heat-flux terms, a small piece of the photosphere with a
water-jacket around it, and the jacket has about a millimetre of metal to work
with. That single number is why cooling is a design driver and not a
housekeeping task.

Three routes exist. **Steady removal**: carry the heat away continuously into a
fluid (regenerative, film, transpiration, dump). **Steady rejection**: let the
wall get hot enough to radiate the heat away (radiative). **Unsteady
absorption**: let the wall soak the heat up and accept that the burn ends
before the wall does (heat sink, ablative). Every flight engine uses one of
these or a combination, and the combination is usually the interesting part.

### 3.2 The seven methods

#### 3.2.1 Heat sink (capacitive)

The wall is thick metal — usually copper, sometimes graphite — and simply
absorbs the heat as sensible enthalpy. Wall temperature rises roughly as

$$\rho_w c_{p,w} t_w \frac{dT_w}{dt} = q''$$

> **Eq. 3.2** — variables: $\rho_w$ wall density [kg/m³]; $c_{p,w}$ wall
> specific heat [J/(kg·K)]; $t_w$ wall thickness [m]; $q''$ [W/m²]; $t$ time
> [s]. Meaning: lumped capacitance — the whole wall thickness heats uniformly.
> Assumes: Biot number $h_g t_w/k_w \ll 1$, i.e. the wall conducts far faster
> than the gas delivers heat, which for copper at $t_w \sim 20$ mm and
> $h_g \sim 10^4$ is marginal ($Bi \approx 0.5$) — the real wall has a
> significant internal gradient and the front face runs hotter than this. Fails
> for: thin walls, poor conductors, and any burn long enough for the back face
> to reach the front-face temperature.

A 25 mm copper wall ($\rho c_p \approx 3.45\times10^6$ J/(m³·K)) exposed to
50 MW/m² heats at $50\times10^6/(3.45\times10^6 \times 0.025) = 580$ K/s. From
300 K to a 900 K limit is one second. That is exactly what heat-sink hardware
is for: **injector and contour screening tests of 0.5–3 s**, where you want to
measure $c^*$ and stability without building a cooled chamber. [H][M] It is
still standard practice — most university and startup programmes fire a copper
heat-sink chamber before they commit to a cooled design, and the chamber is
usually instrumented with back-face thermocouples so the heat flux can be
inferred from $dT/dt$ (Module 18).

Graphite heat sinks buy longer runs at the cost of oxidation. Nobody flies a
heat-sink chamber on an orbital vehicle; the mass is absurd.

#### 3.2.2 Regenerative cooling

One or both propellants pass through channels or tubes in the chamber wall
before being injected. The heat is not lost — it returns to the chamber as
propellant enthalpy — hence "regenerative". [F] The thermodynamic gain is
small (a few tenths of a second of $I_{sp}$ at most; the enthalpy was going to
be released anyway) but the *cycle* gain can be enormous: in an expander cycle
the jacket pickup is the entire power source (§3.4.4, WE4).

This is the dominant method for every engine that must burn for more than about
ten seconds at high heat flux, and §§3.3–3.11 are about it.

#### 3.2.3 Film cooling

A liquid or gas film is introduced along the wall, either from dedicated
orifices in the injector face, from slots part-way down the chamber, or from a
separate flow. It works two ways: while the film is liquid it absorbs heat as
sensible enthalpy plus latent heat of vaporisation; once vaporised it lowers
the *effective* $T_{aw}$ seen by the wall by putting a cooler, usually
fuel-rich, gas layer between wall and core.

Real examples from the course engine reference:

- **V-2 (1942):** four rings of film-cooling holes injecting roughly **10 % of
  the fuel** along the wall, on top of a double-wall alcohol regen jacket. The
  reference file is blunt about it: "the film cooling does most of the work;
  the regen jacket alone was insufficient." That 10 % is a large part of why
  the V-2's $c^*$ efficiency was only ~94 %.
- **F-1 (1967):** two separate films. The injector face carries fuel film
  orifices, and the **gas-generator exhaust is dumped into the nozzle
  extension as a film curtain** — which is why the F-1's nozzle extension has
  no regenerative circuit at all and why the plume has that dark outer sheath.
  This is the single cleverest film-cooling decision in the historical record:
  the GG exhaust is *already spent*, so using it as a coolant costs nothing in
  $I_{sp}$ that had not already been paid.
- **Merlin 1D:** regenerative milled-channel chamber and nozzle with injector
  film cooling; the film budget is not published.
- **Soviet practice:** fuel-film belts fed from ring manifolds part-way down
  the chamber are standard on the RD-107/108, RD-253 and RD-170 families.
- **Vulcain 2:** film cooling was **added to the lower nozzle** relative to
  Vulcain 1, injecting turbine exhaust, because the higher chamber pressure
  (117.3 bar vs 100 bar) and richer mixture ratio (6.1 vs 5.3) raised the wall
  flux beyond what the tube-wall regen circuit could take.
- **Marquardt R-4D and R-40:** fuel-film cooling is the *primary* method,
  with radiative rejection from the chamber and nozzle.

Film cooling always costs performance when the film is live propellant,
because the film burns at a wall mixture ratio far from the optimum. Budget
1–3 % of $I_{sp}$ for a heavy film fraction. [E] WE3 quantifies this.

#### 3.2.4 Ablative cooling

The wall is a charring composite — silica- or carbon-phenolic — which pyrolyses,
absorbs heat as decomposition enthalpy, and blows pyrolysis gas into the
boundary layer (transpiration by another name), leaving a char layer that
insulates and eventually erodes. Recession is roughly linear in time once the
char front stabilises, so the design variable is thickness for a required burn
duration.

Flight examples: **Apollo SPS (AJ10-137)** — ablative chamber with a radiatively
cooled niobium/titanium nozzle extension, 750 s maximum burn; **LMDE** —
ablative chamber with a radiatively cooled skirt; **LM ascent engine** —
ablative, 200 s; **LR87-AJ-11 (Titan stage 1)** — a regeneratively fuel-cooled
chamber with a **separate ablative nozzle skirt**, an explicit "each technology
where it is cheapest" split; **RS-68/RS-68A** — regeneratively cooled main
chamber with an **ablative silica/carbon-phenolic nozzle**, whose ablated
carbon burning in atmospheric oxygen is the source of that engine's famously
bright orange plume.

A note on scope, because the record is thinner than the folklore. The task list
for this module asked about **Aestus**. The course engine reference does not
document Aestus's cooling method at all, so treat it as **not reliably
published** — I will not print a guess. Likewise **Kestrel** and **Merlin 1A**:
the reference covers Merlin 1D and gives it milled-channel regenerative
cooling; the ablative-chamber early Merlin and the ablative Kestrel are widely
reported but are not in the verified reference, so they are mentioned here as
**unverified reports, not as data**. [J]

Ablatives are unbeatable for pressure-fed storable engines with modest total
burn time and no reuse requirement. They are hopeless for reusable engines and
for anything that must burn for an hour.

#### 3.2.5 Radiative cooling

The wall runs hot and radiates to space:

$$q''_{rad} = \varepsilon_{em}\,\sigma_{SB}\,(T_w^4 - T_\infty^4)$$

> **Eq. 3.3** — variables: $\varepsilon_{em}$ surface emissivity [—];
> $\sigma_{SB} = 5.670\times10^{-8}$ W/(m²·K⁴); $T_w$ outer wall temperature
> [K]; $T_\infty$ sink temperature [K], effectively 0 for a spacecraft in
> deep space, but **not** for a nozzle extension that sees the vehicle base or
> another engine's plume. Meaning: the only heat rejection available when
> there is no coolant. Assumes: grey diffuse surface, unobstructed view to the
> sink. Fails when: view factors are blocked (nozzle extensions radiate to
> each other in a clustered stage), when the coating that provides
> $\varepsilon_{em}$ has spalled, and above the coating's service temperature.

At $\varepsilon_{em} = 0.85$ and $T_w = 1600$ K the rejection is
$0.85 \times 5.67\times10^{-8} \times 1600^4 = 3.16\times10^{5}$ W/m² — **0.32
MW/m²**. Compare that with the 50 MW/m² at a booster throat: radiative cooling
is roughly **150 times too weak** to cool a throat and is only ever used where
the flux has already fallen by two orders of magnitude, i.e. **downstream in a
high-area-ratio nozzle**, or in **small thrusters** where $h_g \propto
p_c^{0.8}/D_t^{0.2}$ is small because $p_c$ is 7–10 bar.

Flight examples: **Marquardt R-4D** (490 N, radiative chamber *and* nozzle,
with the liner material history molybdenum → silicide-coated niobium →
iridium-lined rhenium — that last change raised the allowable wall temperature
enough to cut the film fraction and buy about **10 s of $I_{sp}$**);
**Merlin 1D Vacuum** — radiatively cooled niobium-alloy nozzle extension, which
glows cherry-red in flight and is supposed to; **RL10B-2** — a 2.5 m
NOVOLTEX/SEPCARB 3D carbon–carbon extendible nozzle, uncooled and radiating,
taking the area ratio from 77:1 to 285:1 and buying about **30 s of $I_{sp}$**;
**Marquardt R-40** — silicide-coated niobium nozzle.

Radiative extensions are the cheapest specific impulse in the business, which is
why every serious upper-stage engine has one.

#### 3.2.6 Transpiration cooling

Coolant is forced through a porous or multiply-perforated wall, so it both
cools the wall by internal convection and thickens the boundary layer on the
gas side. Thermally it is the most efficient method known — it is film cooling
distributed continuously instead of injected at stations — and it has been a
research subject continuously since the 1950s. [R]

It has almost never flown as a *chamber* wall, for three reasons: porous
structures are weak, the pores clog (with coke, with contamination, with oxide),
and the flow distribution through a porous medium is very hard to control when
the pressure field along the chamber varies.

The important flown case is **partial**: the **J-2 injector face is a porous
sintered stainless-steel plate transpiration-cooled with hydrogen**, and the
same architecture reappears on the **RS-25**. This is transpiration cooling
applied to the one surface where it is both necessary (the injector face sees
recirculating hot gas and has no room for channels) and safe (the face is
structurally supported and the flow is short and well-distributed). Treat the
transpiration-cooled injector face as the canonical limited case: the method
works, and the reason it stayed small is manufacturing and fouling, not physics.
[H][J]

#### 3.2.7 Dump cooling

Coolant flows through a jacket or tube bundle and is then **expelled overboard**
rather than injected into the chamber. The Isp penalty is that of a
low-performance secondary flow, but the circuit is hydraulically simple, needs
no return manifold, and does not constrain the injector.

The best flown example in the course reference is the Chinese **YF-75**:
"split — regenerative in the combustion chamber, dump cooling in the nozzle."
The reference notes that dump cooling is "rare enough that the YF-75 is one of
the few good flown examples," which is the right calibration.

The **expander bleed cycle** is dump cooling with the coolant made to do work
on the way out: the **LE-5A/LE-5B** heat a *portion* of the hydrogen in the
jacket, run it through the turbine, and dump it overboard. LE-5A ran both nozzle
and chamber in the heat-exchange circuit; **LE-5B deliberately dropped the
nozzle from the circuit** to cut cost and improve reliability, paying about 5 s
of $I_{sp}$ (452 s → 446.8 s) for it. The **RD-0146**'s nozzle extension is
simply uncooled. The **BE-3U** is the American adoption of the bleed idea.

On **J-2S** and **RS-68**: the task brief for this module listed both as dump
cooling examples. The course reference documents the J-2S as a **tap-off cycle**
uprate of the J-2 and says nothing about a dump-cooled nozzle; it documents the
RS-68 as having a **gas-generator exhaust dumped through a side duct** and an
**ablative** nozzle, not a dump-cooled one. I have followed the reference. The
J-2S dump-cooled nozzle extension is widely reported in the secondary
literature; it is **not verified here** and is not printed as data. [J]

#### 3.2.8 The eighth method nobody expects: a dedicated coolant

The **SEP Viking** (Ariane 1–4) carried a **dedicated water tank and a third
pump on the turbopump shaft** and injected water to cool the chamber and
nozzle. Three coaxial pumps — oxidiser, fuel, water — on one shaft at 10,000
rpm and 2,500 kW. It is the only production launch-vehicle engine to have done
this, and the reason is entirely rational: N₂O₄/UDMH is a poor coolant (low
$c_p$, low $k$, thermally unstable), and water has the best volumetric heat
capacity and latent heat of any liquid you can put in a tank. The dead mass was
worth it. Viking flew **958 engines across 144 launches with 2 failures**.

Use this as the antidote to the assumption that there are exactly four cooling
methods. The design space is "get the heat out"; the propellants are not the
only fluids allowed in the answer.

### 3.3 The regeneratively cooled wall as a series resistance

Take a unit of gas-side area at one axial station. In steady state the same
$q''$ crosses three resistances in series: gas-side convection, wall
conduction, coolant-side convection.

$$q'' = \frac{T_{aw} - T_b}{\dfrac{1}{h_g} + \dfrac{t_w}{k_w} + \dfrac{1}{h_{c,\mathrm{eff}}}}$$

> **Eq. 3.4** — variables: $T_{aw}$ [K]; $T_b$ coolant bulk temperature at this
> station [K]; $h_g$ [W/(m²·K)]; $t_w$ hot-wall thickness [m]; $k_w$ liner
> conductivity [W/(m·K)]; $h_{c,\mathrm{eff}}$ coolant-side coefficient
> referred to gas-side area [W/(m²·K)]. Meaning: the whole regenerative
> cooling problem in one line — three resistances, and the biggest one governs.
> Assumes: 1-D radial conduction, steady state, no contact resistance at a
> braze or closeout joint, constant properties across the wall, no
> circumferential variation. Fails when: the wall is thick relative to the
> channel pitch (then the land conduction is 2-D and this underestimates
> $T_{wg}$ over the land), at a braze joint with real contact resistance, and
> transiently during start and shutdown, where the thermal time constant of the
> liner (milliseconds for 1 mm of copper) matters for low-cycle fatigue.

Then

$$T_{wg} = T_{aw} - \frac{q''}{h_g}, \qquad
\Delta T_w = \frac{q'' t_w}{k_w}, \qquad
T_{wc} = T_b + \frac{q''}{h_{c,\mathrm{eff}}}$$

> **Eq. 3.5** — the three temperatures that matter. $T_{wg}$ is limited by the
> liner alloy's strength and creep. $\Delta T_w$ drives the thermal strain that
> causes low-cycle fatigue and the "dog-house" bulge failure (§7.2). $T_{wc}$
> is limited by coolant decomposition — coking for hydrocarbons, nothing much
> for hydrogen. Assumes: as Eq. 3.4. Fails: same.

Look at the resistances for the reference engine at the throat (WE1 computes
them): $1/h_g = 5.50\times10^{-5}$, $t_w/k_w = 2.81\times10^{-6}$,
$1/h_{c,\mathrm{eff}} = 1.24\times10^{-5}$ m²K/W. The gas side is **78 %** of
the total resistance, the coolant side 18 %, the wall itself **4 %**.

Three consequences follow immediately and they govern all of regenerative
design. [F]

1. **You cannot reduce the heat flux much by improving the coolant side.**
   Doubling $h_c$ raises $q''$ (because the wall gets colder and the gas-side
   $\Delta T$ grows) and lowers $T_{wg}$ and $T_{wc}$. Cooling harder means
   *more* heat load, not less. This surprises students every single time.
2. **Thin the hot wall.** $\Delta T_w$ is linear in $t_w$, and $\Delta T_w$ is
   what cracks liners. Every generation of chamber technology has thinned the
   hot wall: V-2 double-wall steel at several millimetres, F-1 brazed tubes at
   ~0.5 mm, RS-25 NARloy-Z at ~0.7–0.9 mm, printed GRCop liners at 0.6–1.0 mm.
   The floor is set by manufacturing tolerance, erosion allowance and buckling,
   not by heat transfer.
3. **Use a high-conductivity liner.** $t_w/k_w$ for 0.9 mm of NARloy-Z
   ($k \approx 320$) is $2.8\times10^{-6}$; for 0.9 mm of Inconel 718
   ($k \approx 25$) it is $3.6\times10^{-5}$ — thirteen times larger and now
   comparable to the coolant-side resistance. That is the entire argument for
   copper liners, and the entire reason a printed Inconel chamber must run
   either at lower $p_c$ or with a thinner wall and a much better coolant side.

### 3.4 Coolant routing

The channels are the easy part. Deciding where the coolant enters, where it
leaves, and which way it flows relative to the gas is the part that gets
argued about in design reviews.

#### 3.4.1 Counter-flow versus parallel flow

**Counter-flow** means the coolant flows from the nozzle exit *upstream* toward
the throat and injector, opposite to the gas. It arrives at the throat cold —
good, because that is where $q''$ peaks — and leaves at the injector end hot,
where the flux is lower. **Parallel flow** (injector end to nozzle exit) puts
the coldest coolant where the flux is lowest and the hottest coolant at the
throat. Nobody does pure parallel flow on a hydrocarbon engine for that reason.

The catch with counter-flow is that the coolant has already absorbed the entire
nozzle heat load before it reaches the throat. In WE1 the nozzle contributes
10.9 MW of the 25.9 MW total, so the RP-1 arrives at the throat around 400 K,
having entered at 300 K. You do not get cold coolant at the throat for free;
you get *less hot* coolant.

#### 3.4.2 Pass counts

- **1-pass**: coolant enters one manifold, traverses the whole chamber once,
  exits the other. Simplest, lowest $\Delta p$, but the bulk temperature rise is
  spread over the whole length and the velocity is set by one channel area
  schedule.
- **1.5-pass**: coolant enters at an intermediate manifold — typically just
  downstream of the throat — splits, sends part down the nozzle and part up to
  the injector, and collects. Or the reverse. This halves the length any given
  particle travels and therefore cuts $\Delta p$ by roughly a factor of four at
  fixed velocity (since $\Delta p \propto L V^2$ and halving $L$ at fixed flow
  in twice the channels halves $V$ too). It costs a manifold.
- **2-pass ("up-and-back", "down-and-back")**: the coolant runs the full length
  and returns, usually in alternate channels or a separate tube set. The **F-1**
  is the canonical example: **178 brazed tubes** with a down-pass/up-pass
  routing, so alternate tubes carry flow in opposite directions. The advantage
  is that inlet and outlet manifolds are at the same end (a huge plumbing
  simplification on a gimballed engine) and the tube wall temperature is
  averaged circumferentially between a hot down-tube and a cold up-tube. The
  cost is double the length and therefore roughly four times the pressure drop
  at fixed velocity.

#### 3.4.3 Split circuits: the RS-25

The RS-25 does not have one circuit; it has two, with different construction:

- The **nozzle** is a **1,080-tube brazed tube-wall**, hydrogen-cooled.
- The **main combustion chamber** is a **milled-channel NARloy-Z liner with an
  electroformed-nickel closeout, 390 channels**, hydrogen-cooled.

Hydrogen from the high-pressure fuel turbopump is split: part goes through the
nozzle tubes and rejoins, part goes through the MCC channels; the heated
hydrogen then feeds the preburners and the chamber coolant circuit feeds the
main injector. Splitting the circuit lets each region be built the way it should
be — 1,080 thin tubes are the right way to build a large, low-flux, structurally
flexible bell, and 390 milled channels in a copper liner are the right way to
build a small, extremely-high-flux throat. The RS-25 throat sees heat fluxes of
order 160 MW/m² at 206 bar; nothing but a copper alloy with a millimetre wall
and hydrogen behind it survives that.

#### 3.4.4 The RL10: the full-nozzle pass as a power source

The **RL10** is a closed expander cycle, and the cooling jacket *is* the power
cycle. Hydrogen at pump discharge flows through the **brazed stainless-steel
tube-wall** — and it takes the whole nozzle, not just the chamber, because the
turbine needs enthalpy and the nozzle is where the *area* is. This inverts the
usual design logic: on a normal engine you route coolant to keep the wall cool
with the minimum $\Delta p$; on an expander you route coolant to *maximise
enthalpy pickup* subject to keeping the wall cool.

Stainless steel here is not a compromise, it is a choice. What the RL10 needs is
*total* pickup, and total pickup is bought with surface area, which is bought
with a long tube-wall nozzle. A copper liner would deliver a colder wall for the
same area — which is not what the cycle wants — and copper cannot be drawn into
thin tubes and brazed the way stainless can.

This is also the origin of the **expander cycle thrust limit**. Chamber heat
pickup scales with wetted area, roughly $D^2$; thrust scales with throat area,
also roughly $D^2$ — but the *heat flux* falls as the chamber gets larger at
fixed $p_c$ (Bartz: $h_g \propto D_t^{-0.2}$) while the pump power required
scales with $\dot m \Delta p$. Run the numbers and the closed expander tops out
somewhere around 300–500 kN, which is why the RL10 has sat at 73–110 kN for
sixty years and why anybody wanting more went to expander *bleed* (LE-5B,
BE-3U) or a preburner. WE4 does the enthalpy balance.

### 3.5 Channel geometry and the land as a fin

A milled channel is a rectangular duct whose floor is the hot wall and whose
side walls (the **lands**) are metal ribs connecting the hot wall to the
structural closeout. Those lands are fins. They conduct heat from the hot wall
sideways into the coolant, and they roughly double the effective cooling area —
which is the single largest lever in channel design after velocity.

Treat a land as a straight fin of thickness $t_L$ and length $h_{ch}$, adiabatic
at the tip (the closeout is much cooler and carries little flux):

$$m = \sqrt{\frac{2 h_c}{k_w t_L}}, \qquad
\eta_f = \frac{\tanh(m\,h_{ch})}{m\,h_{ch}}, \qquad
\Phi = \frac{w + 2\eta_f h_{ch}}{p_{ch}}, \qquad
h_{c,\mathrm{eff}} = \Phi\, h_c$$

> **Eq. 3.6** — variables: $m$ fin parameter [1/m]; $h_c$ coolant-side
> coefficient on the wetted channel surface [W/(m²·K)]; $k_w$ [W/(m·K)]; $t_L$
> land width [m]; $h_{ch}$ channel height [m]; $w$ channel width [m]; $p_{ch}$
> pitch [m]; $\eta_f$ fin efficiency [—]; $\Phi$ area enhancement referred to
> gas-side area [—]. Meaning: the lands are the reason a milled channel beats a
> plain annulus by a factor of two. Assumes: 1-D conduction along the land,
> uniform $h_c$ over the land, adiabatic tip, constant $k_w$. Fails when: the
> land is short and thick (then it is not a fin at all and 2-D conduction is
> needed), when the aspect ratio is very high (the tip is not adiabatic and
> $h_c$ is not uniform down a tall narrow slot), and when $k_w$ falls sharply
> with temperature, as it does for copper alloys above ~700 K.

Numbers for the reference engine at the throat (WE1): $h_c = 44{,}000$
W/(m²·K), $k_w = 320$, $t_L = 1.475$ mm, $h_{ch} = 4$ mm gives $m = 432$ 1/m,
$m h_{ch} = 1.73$, $\eta_f = 0.543$, $\Phi = 1.83$. The lands are contributing
83 % as much cooling area as the channel floor, at 54 % efficiency.

**The aspect-ratio trap.** Making channels taller looks free — more wetted
area, lower velocity, lower $\Delta p$. It is not, because $\eta_f$ collapses.
Going from $AR = 2$ to $AR = 4$ on the methane case in WE2 raises the geometric
area but drops $\eta_f$ from 0.395 to 0.269, and $h_{c,\mathrm{eff}}$ actually
*falls* from 137 kW/(m²·K) to 92 kW/(m²·K) because the velocity halved. Tall
channels buy pressure drop relief, not heat transfer, unless the coolant is
hydrogen (where the velocity is absurd and you need the area) or the land is
very conductive.

**High-aspect-ratio cooling channels (HARCC)** — $AR$ of 4–10, sometimes with
the channel narrowing at the throat only — are nonetheless real modern practice
[M], because for a fixed coolant flow they let you raise velocity locally at the
throat while keeping $\Delta p$ tolerable everywhere else. The enabling
technology is machining or printing narrow deep slots, which is exactly what
milling with a slitting saw and laser powder bed fusion are good at, and what
tube-forming is not.

**Typical geometry**, from the flown record and [SP-8087]:

| parameter | typical | comment |
|---|---|---|
| $N_{ch}$ | 80–400 | RS-25 MCC: 390; F-1: 178 tubes; RS-25 nozzle: 1,080 tubes |
| $w$ at throat | 0.8–2.5 mm | narrowed at the throat, widened elsewhere |
| $h_{ch}$ | 2–12 mm | $AR$ 1.5–3 conventional, 4–10 HARCC |
| $t_L$ | 0.8–1.8 mm | set by braze/closeout strength and milling |
| $t_w$ | 0.5–1.2 mm | thinner is better thermally, worse structurally |
| $p_{ch}$ | 2–4 mm | $=\pi(D+2t_w)/N_{ch}$; the binding constraint at a small throat |

That last row is worth dwelling on. At the reference engine's 197 mm throat
diameter the circumference is 625 mm; 180 channels gives a 3.48 mm pitch. You
*cannot* fit 390 channels there — the pitch would be 1.6 mm and the land would
vanish. Channel count is bounded above by circumference and below by the
velocity you need. Small engines run out of circumference first; this is why
very small regeneratively cooled thrusters are hard and why most small storable
thrusters are film-cooled and radiative instead.

### 3.6 Coolant-side heat transfer

#### 3.6.1 Dittus–Boelter

The workhorse:

$$h_c = 0.023\,\frac{k_c}{D_h}\,Re_c^{0.8}\,Pr_c^{n}, \qquad n = 0.4\ \text{(heating)}$$

> **Eq. 3.7** — variables: $k_c$ coolant thermal conductivity [W/(m·K)]; $D_h$
> hydraulic diameter [m]; $Re_c = \rho_c V_c D_h/\mu_c$; $Pr_c =
> c_{p,c}\mu_c/k_c$; $n = 0.4$ when the fluid is being heated, 0.3 when cooled.
> Meaning: turbulent forced convection in a smooth round tube. Assumes:
> $Re > 10^4$, $0.6 < Pr < 160$, $L/D > 10$, fully developed, **small
> property variation across the boundary layer**, smooth wall, no curvature.
> Fails when: the wall-to-bulk temperature ratio is large (always, in a rocket
> jacket — this is why we correct it), near the critical point, in boiling, in a
> strongly curved passage, and in a rectangular duct at high aspect ratio (use
> the $D_h$ form and accept ±15 %). Accuracy in a rocket channel: **±25 % at
> best**, and it is systematically optimistic for supercritical fluids near
> $T_{pc}$.

Note that $h_c \propto V^{0.8} D_h^{-0.2}$: **velocity is the lever**, and it
is a strong one, but $\Delta p \propto V^2$ — you pay for $h_c$ at a
disadvantageous exponent. That trade is §3.9.

#### 3.6.2 Sieder–Tate: the wall-viscosity correction

Because the coolant next to the wall is much hotter than the bulk, its
viscosity is much lower, the near-wall velocity profile is fuller, and the real
$h_c$ is higher than Dittus–Boelter predicts. Sieder–Tate:

$$h_c = 0.027\,\frac{k_c}{D_h}\,Re_c^{0.8}\,Pr_c^{1/3}\left(\frac{\mu_b}{\mu_w}\right)^{0.14}$$

> **Eq. 3.8** — variables: as Eq. 3.7, plus $\mu_b$ viscosity at bulk
> temperature and $\mu_w$ at wall temperature [Pa·s]. Meaning: corrects for the
> property distortion across a thermal boundary layer with a large $\Delta T$.
> Assumes: as Eq. 3.7, but tolerates larger property variation. Fails: near
> critical, in boiling, and for gases where the correction should be a
> temperature ratio rather than a viscosity ratio.

For RP-1 at $T_b = 400$ K, $T_{wc} = 960$ K, the viscosity falls by roughly a
factor of 6, so $(\mu_b/\mu_w)^{0.14} \approx 6^{0.14} \approx 1.29$. That is a
**29 % increase** in $h_c$ over plain Dittus–Boelter — not a rounding error.
For hydrogen the common form is a temperature-ratio correction,
$(T_b/T_w)^{0.55}$, applied to a Dittus–Boelter base [E]; hydrogen jackets are
usually correlated with engine-specific fits anyway.

I use plain Dittus–Boelter in the worked examples because it is what
`tools/rocket.py` implements and because it is the honest baseline; the
corrections are quoted as explicit multipliers so you can see their size.

#### 3.6.3 Curvature enhancement

At the throat the channel follows a tightly curved contour. Curvature drives a
secondary (Dean) vortex that scrubs the concave wall and enhances heat
transfer, typically by **10–40 %** on the concave surface. A common design
multiplier [E]:

$$\frac{h_{c,\mathrm{curved}}}{h_{c,\mathrm{straight}}} = \left[Re_c\left(\frac{D_h}{2R_c}\right)^{2}\right]^{0.05}$$

> **Eq. 3.9** — variables: $R_c$ radius of curvature of the channel centreline
> in the meridional plane [m]. Meaning: an empirical Dean-number correction.
> Assumes: turbulent, mild curvature, single phase. Fails when: the curvature is
> sharp enough to separate the flow, and on the convex side, where curvature
> *suppresses* turbulence and heat transfer falls. Use it as a design allowance,
> not as a prediction; measured values scatter by a factor of two.

The engineering point survives even if the correlation does not: **the throat
gets free extra cooling from its own curvature, and the convex nozzle wall
downstream gets less than a straight-duct correlation says.** [E]

### 3.7 Supercritical fluids, the pseudo-critical spike, boiling and CHF

Rocket cooling jackets run at pressures well above the coolant's critical
pressure — the reference engine's RP-1 sits around 150 bar, methane at 150 bar
is 3.3× its critical pressure of 45.99 bar, hydrogen at 150 bar is 11.6× its
critical pressure of 12.96 bar. Above $p_{crit}$ there is no boiling and no
phase change, which is a large safety advantage. What there is instead is a
violent, continuous variation of properties.

At a supercritical pressure, as temperature crosses the **pseudo-critical
temperature** $T_{pc}$ (the locus of peak $c_p$), the fluid transitions from
liquid-like to gas-like over a narrow temperature band: density can drop by 3×,
$c_p$ spikes to several times its far-field value, and $k$ and $\mu$ fall
sharply. Approximate values at 150 bar [NIST-WB][A]:

| fluid | $T_{crit}$ (K) | $p_{crit}$ (bar) | $T_{pc}$ at 150 bar (K) |
|---|---|---|---|
| Methane | 190.6 | 45.99 | ≈ 225–235 |
| Hydrogen | 33.15 | 12.96 | ≈ 45–50 |
| Oxygen | 154.6 | 50.4 | ≈ 190 |
| RP-1 (surrogate) | ≈ 660–680 | ≈ 21–24 | above the coking limit — never reached |

Two consequences:

1. **The $c_p$ spike is a gift and a hazard.** Near $T_{pc}$ the coolant's
   heat capacity is enormous, so the bulk temperature rise per unit heat load
   is small: a methane jacket that crosses $T_{pc}$ absorbs a lot of heat for
   little temperature rise. But the density collapse means the velocity in a
   fixed-area channel rises by the same factor, and the pressure drop with it.
   A methane channel that is comfortable at the inlet can be choking at the
   outlet. **This is the number-one methane cooling design error.** [J]
2. **Heat-transfer deterioration.** Near and above $T_{pc}$, strong
   near-wall density gradients can suppress turbulent transport — buoyancy and
   acceleration effects — and the measured $h_c$ can fall **well below**
   Dittus–Boelter, by up to a factor of two, at high heat flux and low mass
   flux. This is the supercritical analogue of the boiling crisis, it is real,
   and it has burned real hardware. Design methane channels with mass flux high
   enough to stay in the forced-convection-dominated regime. [E][R]

**Subcritical operation and CHF.** If the jacket runs *below* the coolant's
critical pressure, boiling is possible. Nucleate boiling is spectacularly good
— heat-transfer coefficients an order of magnitude above single-phase
convection — right up until the **critical heat flux**, at which the bubbles
coalesce into a vapour film, the wall is insulated by its own steam, and the
wall temperature jumps by hundreds of kelvin in milliseconds. The result is a
burn-through, and it is fast enough that no control system can react.

This is a live danger for **water-cooled research hardware** (where subcritical
operation is normal, and CHF for water at modest pressures and velocities is of
order 3–10 MW/m², well below a rocket throat flux unless the velocity is very
high) and for **RP-1 at low jacket pressure**. It is not a danger for a modern
high-$p_c$ engine, whose jacket is comfortably supercritical everywhere. If you
are firing a water-cooled calorimeter chamber (Module 18), the CHF margin is
the number your test safety case is built on. [F][E]

### 3.8 Pressure drop

$$\Delta p_f = f\,\frac{L}{D_h}\,\frac{\rho_c V_c^2}{2}$$

> **Eq. 3.10** — Darcy–Weisbach. Variables: $f$ Darcy friction factor [—]; $L$
> channel length along the path [m]; $D_h$ [m]; $\rho_c$ [kg/m³]; $V_c$ [m/s].
> Meaning: frictional loss in the channel. Assumes: fully developed,
> incompressible, constant properties, constant area. Fails when: the coolant
> density changes along the channel (always, in a heated channel — integrate in
> segments), when the channel area is tapered (integrate), and at very high
> heat flux where the near-wall viscosity change alters $f$.

For a smooth turbulent duct, $f = 0.184\,Re^{-0.2}$ ($Re > 2\times10^4$) is
accurate to a few percent [E]; for rough channels — and an as-printed AM
channel has $R_a$ of 10–25 µm, which at $D_h = 2.7$ mm is a relative roughness
of 0.004–0.009 — use Colebrook–White or the Haaland explicit form:

$$\frac{1}{\sqrt f} = -1.8\log_{10}\left[\left(\frac{\epsilon/D_h}{3.7}\right)^{1.11} + \frac{6.9}{Re}\right]$$

> **Eq. 3.11** — Haaland's explicit approximation to Colebrook. Variables:
> $\epsilon$ absolute roughness [m]. Meaning: friction factor for a rough
> turbulent duct. Assumes: fully rough or transitional turbulent, circular-duct
> equivalence via $D_h$. Fails: laminar, and for roughness elements comparable
> to $D_h$.

At $\epsilon/D_h = 0.006$ and $Re = 2\times10^5$, Haaland gives $f \approx
0.033$ against the smooth-duct 0.0159 — **more than double**. This is the
hidden cost of as-printed cooling channels, and it is why AM chambers are often
chemically polished or abrasive-flow machined internally, and why AM channel
roughness is a first-order design parameter rather than a finish note. [M] The
compensation is that roughness also raises $h_c$ (roughly with $f^{1/2}$ in the
Petukhov form), so the *thermal* effect is favourable while the hydraulic
effect is punishing — a trade you must actually compute, not assume.

**On top of friction, add:**

- **Curvature losses** at every bend in the channel path around the contour.
- **Inlet and exit manifold losses**, including the sudden contraction from one
  torus into 180 channels and the sudden expansion out.
- **Entrance-length losses** in each channel.
- **Area-change losses** wherever the channel is tapered.

Design practice is to compute the friction term properly and apply a
**1.25–1.5× multiplier** for the rest, then measure it in a flow test before
first hot fire. [J] WE1 uses 1.35.

#### Why $\Delta p_j$ is expensive

Every bar of jacket pressure drop is a bar the fuel pump must supply on top of
chamber pressure and injector $\Delta p$:

$$p_{\mathrm{pump,disch}} = p_{c,\mathrm{inj}} + \Delta p_{\mathrm{inj}} + \Delta p_j + \Delta p_{\mathrm{lines,valves}}$$

> **Eq. 3.12** — variables: all pressures [Pa]. Meaning: the fuel pump discharge
> pressure budget. Assumes: fuel is the coolant and the circuit is
> jacket-then-injector, which is the usual arrangement. Fails when: the coolant
> is a separate fluid (Viking's water), or in a dump-cooled or bleed circuit
> where the jacket discharges to a turbine or overboard rather than to the
> injector.

For the reference engine WE1 finds $\Delta p_j = 48$ bar against a 105-bar
injector-end chamber pressure and a 20-bar injector drop: pump discharge 173
bar, of which **28 % exists solely to push coolant through channels**. The
extra pump shaft power is 0.46 MW out of 1.62 MW total — meaning the fuel pump
is roughly **40 % larger than it would need to be** if cooling were free. On a
gas-generator cycle that power is bought with propellant dumped overboard, so
jacket $\Delta p$ shows up directly as an $I_{sp}$ loss. On a staged-combustion
cycle it shows up as preburner flow and turbine inlet temperature, which shows
up as turbine blade life. **There is no cycle in which jacket pressure drop is
free.** [F]

### 3.9 The $h_c$–$\Delta p$ balance

Combine the scalings for a channel of fixed length at fixed coolant mass flow,
varying only the channel cross-sectional area $A_{ch}$ (so $V \propto
1/A_{ch}$, and $D_h \propto A_{ch}^{1/2}$ at fixed aspect ratio):

$$h_c \propto V^{0.8} D_h^{-0.2} \propto A_{ch}^{-0.9}, \qquad
\Delta p \propto \frac{V^{1.8}}{D_h^{1.2}} \propto A_{ch}^{-2.4}$$

> **Eq. 3.13** — Meaning: **halving the channel area buys 87 % more $h_c$ and
> costs 5.3× the pressure drop.** Assumes: Dittus–Boelter, $f = 0.184Re^{-0.2}$,
> fixed aspect ratio, fixed mass flow, constant properties. Fails: at very low
> $Re$, in the supercritical deterioration regime, and where the fin efficiency
> changes materially (it does — a taller channel at fixed width has worse
> $\eta_f$, which Eq. 3.13 ignores).

This exponent mismatch, 0.9 against 2.4, is the central economic fact of
regenerative cooling. It means:

- **Narrow the channel only where you need it.** Real channel schedules are
  tapered: minimum area at the throat, opening out by 2–4× in the barrel and
  the nozzle. WE1's $\Delta p$ table shows the 150 mm throat zone contributing
  7.9 bar of the 35.3 bar friction total — **22 % of the pressure drop in 7 %
  of the length**.
- **Raise the flow, not the velocity, if you can.** More coolant at the same
  velocity gives you more bulk-temperature margin and the same $h_c$ for the
  same $\Delta p$ per unit length. You usually cannot — the coolant flow *is*
  the fuel flow, set by mixture ratio.
- **Beyond a point, more $\Delta p$ buys nothing.** As the coolant-side
  resistance shrinks toward zero, $q''$ asymptotes to
  $(T_{aw} - T_b)/(1/h_g + t_w/k_w)$ and $T_{wg}$ asymptotes to
  $T_b + q''t_w/k_w$. In the reference engine that floor is $T_{wg} \approx
  510$ K with RP-1 — you cannot do better no matter how much pump power you
  spend, because the *gas-side* resistance dominates. Knowing where the
  asymptote is stops you chasing an impossible design.

### 3.10 Coking: the hydrocarbon wall-temperature ceiling

Kerosene decomposes on hot metal. The mechanism has two parts. **Thermal
(pyrolytic) coking** above roughly 700 K in the bulk: the hydrocarbon cracks and
deposits carbon. **Catalytic/oxidative coking** starting much lower, around
**560–590 K wall temperature**, where trace sulfur and dissolved oxygen react
with the metal surface — particularly with copper and nickel, both of which are
catalytically active — and nucleate carbon deposits.

The deposit is thin, tenacious, and has a thermal conductivity of order
0.1–1 W/(m·K) — roughly **1/1000 of copper**. A 25 µm coke layer at
$k = 0.5$ adds $5\times10^{-5}$ m²K/W of resistance, which is *comparable to
the entire gas-side resistance* in the reference engine. Coking does not
gradually degrade a channel; it strangles it. The failure sequence is: deposit
forms → coolant-side resistance rises → $T_{wc}$ and $T_{wg}$ rise → deposition
accelerates (it is Arrhenius in wall temperature) → local burn-through, usually
at the throat, usually on the second or third firing rather than the first.

**The design rule** [E]: keep $T_{wc}$ below about **560–590 K** for long-life
or reusable hardware; up to **~700 K** is tolerated for short-duration
expendable engines with a known and accepted deposition rate.

**Sulfur is the specific villain.** RP-1's specification limits total sulfur to
30 ppm; **RP-2**, introduced specifically for this reason, limits it to 0.1 ppm,
and demonstrated roughly an order-of-magnitude reduction in deposition rate in
heated-tube testing. The Soviet RG-1/naftil specification was also tightly
sulfur-controlled. If you are cooling with kerosene and you have a choice, buy
the low-sulfur grade; it is the cheapest cooling improvement available. [M]

**The consequence, and it is a big one.** WE1 shows that a 100-bar LOX/RP-1
engine **cannot** hold its coolant-side wall anywhere near 590 K at the throat
with regenerative cooling alone. Sweeping the geometry — 180 to 450 channels,
2.0 mm down to 0.5 mm wide, 4 mm to 8 mm tall, hot wall 0.9 mm down to 0.5 mm,
at pressure gradients up to 130 bar/m — the best achievable is roughly **745 K**,
and the baseline design gives **961 K**. Kerosene simply does not have the
transport properties to do the job at that flux.

That is not an academic result. It is the reason that:

- The **F-1** ran at ~70 bar, not 100, *and* film-cooled the barrel from the
  injector, *and* dumped gas-generator exhaust down the nozzle extension.
- **Merlin 1D** at 97 bar is a life-limited, inspected, refurbished component
  rather than an indefinitely reusable one.
- Soviet kerosene engines at 245 bar (**RD-170**) use fuel-film belts,
  desulfurised kerosene, small individual chamber diameters (four chambers, not
  one) and very high coolant velocities — and they are still overhauled
  between flights.
- Every clean-sheet reusable hydrocarbon engine designed since 2010 that could
  choose its fuel chose **methane**.

### 3.11 The three coolants compared

Properties at 150 bar, rounded from [NIST-WB]/[REFPROP]. **These are rounded
design-study values [A]; pull exact values from REFPROP for real work, and note
that RP-1 is a mixture with no unique equation of state — the values below come
from surrogate models and carry ±10 % at best.**

**RP-1**

| $T$ (K) | $\rho$ (kg/m³) | $c_p$ (J/kg·K) | $k$ (W/m·K) | $\mu$ (Pa·s) | $Pr$ |
|---|---|---|---|---|---|
| 300 | 805 | 2010 | 0.132 | 1.55e-3 | 23.6 |
| 400 | 738 | 2280 | 0.118 | 4.6e-4 | 8.9 |
| 500 | 665 | 2560 | 0.104 | 2.2e-4 | 5.4 |

**Methane**

| $T$ (K) | $\rho$ (kg/m³) | $c_p$ (J/kg·K) | $k$ (W/m·K) | $\mu$ (Pa·s) | $Pr$ |
|---|---|---|---|---|---|
| 150 | 400 | 3400 | 0.163 | 9.5e-5 | 1.98 |
| 250 | 190 | 3050 | 0.070 | 2.6e-5 | 1.13 |
| 350 | 100 | 2900 | 0.062 | 1.9e-5 | 0.89 |

**Hydrogen**

| $T$ (K) | $\rho$ (kg/m³) | $c_p$ (J/kg·K) | $k$ (W/m·K) | $\mu$ (Pa·s) | $Pr$ |
|---|---|---|---|---|---|
| 60 | 62 | 11,700 | 0.098 | 8.5e-6 | 1.01 |
| 150 | 22.0 | 13,600 | 0.115 | 6.6e-6 | 0.78 |
| 300 | 11.5 | 14,600 | 0.19 | 9.0e-6 | 0.69 |

What matters and why:

- **$c_p$** sets the bulk temperature rise for a given heat load. Hydrogen's
  13,600 J/(kg·K) is six times kerosene's and four times methane's, and it is
  carrying the *smallest* mass flow — yet its bulk rise is manageable. This is
  the single reason hydrogen engines can run at 206 bar.
- **$\rho$** sets velocity for a given mass flow and channel area, and
  therefore both $h_c$ and $\Delta p$. Hydrogen's low density is the price of
  its $c_p$: at the same channel geometry the reference-engine hydrogen case
  runs at **611 m/s** and 128 bar/m against RP-1's 49 m/s and 53 bar/m. This
  is why hydrogen engines use many channels, tall channels, or both.
- **$k$** enters $h_c$ linearly through $k/D_h$. Kerosene's 0.118 W/(m·K)
  against hydrogen's 0.115 looks like a wash, but hydrogen's $Re^{0.8}$ term is
  26× larger.
- **$Pr$** near 1 (methane, hydrogen) means the thermal and momentum boundary
  layers are the same thickness and Dittus–Boelter behaves. Kerosene's
  $Pr = 9$–24 means a thin thermal boundary layer riding inside a thick
  momentum layer, high sensitivity to the wall-viscosity correction, and worse
  correlation accuracy.
- **The decomposition limit** is what actually decides it. Methane's coking
  threshold is around **900–950 K** wall temperature — it cracks, but far more
  slowly and to less tenacious deposits than kerosene, and it carries no
  sulfur. Hydrogen has no decomposition limit at all; the constraint is
  hydrogen embrittlement of the liner and the closeout, which is a materials
  problem with materials answers.

**The headline result from WE2**, all three cooling the *same* gas side with the
*same* channel geometry (180 channels, 2 × 4 mm, 0.9 mm NARloy-Z wall) at the
reference engine's throat:

| coolant | $\dot m_c$ (kg/s) | $V_c$ (m/s) | $Re_c$ | $h_c$ (kW/m²K) | $h_{c,\mathrm{eff}}$ (kW/m²K) | $q''$ (MW/m²) | $T_{wg}$ (K) | $T_{wc}$ (K) | $dp/dx$ (bar/m) |
|---|---|---|---|---|---|---|---|---|---|
| RP-1 | 52.0 | 48.9 | 2.09e5 | 44.0 | 80.4 | 45.1 | **1088** | **961** | 52.6 |
| CH₄ | 39.8 | 145.4 | 2.83e6 | 92.1 | 136.7 | 53.1 | **788** | **638** | 71.0 |
| LH₂ | 19.4 | 611.3 | 5.43e6 | 219.5 | 257.2 | 60.0 | **552** | **383** | 127.6 |

RP-1 fails its coking limit by 370 K. Methane sits 300 K under its own limit
with a workable geometry. Hydrogen produces a wall so cold that the design is
limited by pressure drop, not temperature — which is exactly what the RS-25's
390 channels and the RL10's long tube-wall nozzle are responses to.

### 3.12 Construction: how the channels are actually made

#### 3.12.1 Brazed tube wall

Thin-wall tubes — typically stainless steel or a nickel alloy — are formed to
the contour, tapered so their cross-section shrinks toward the throat, laid up
side by side around a mandrel, and furnace-brazed to each other and to inlet and
outlet manifolds. An external jacket, or bands, or a wrapped structural shell
carries the hoop load. The tube itself is a small pressure vessel carrying
coolant pressure minus chamber pressure and needs only be thick enough for that.

Invented by **Edward A. Neu Jr.** at North American Aviation (patent filed
**5 April 1950**) and first flown on the Atlas/Navaho lineage; it dominated
American practice for thirty years. The flown examples in this course:

| engine | tube wall |
|---|---|
| XLR43-NA-1 / Atlas MA-5 | brazed thin-wall tube bundle, the Neu original |
| H-1, RS-27A | brazed tube bundle, fuel-cooled |
| **F-1** | **178 tubes**, down-and-back, Inconel X-750/Hastelloy in an Inconel jacket with steel bands |
| J-2 | tube wall, fuel-cooled |
| **RL10** family | **brazed stainless-steel tube wall**, and the circuit is the power cycle |
| **RS-25 nozzle** | **1,080 tubes**, hydrogen-cooled |
| Vulcain 1/2 | tube-wall chamber |

Why it dominated: it needs no exotic machining, the tube stock is drawn on
existing equipment, the wall can be made very thin (0.3–0.6 mm) because the tube
carries its own pressure in hoop, and the whole structure is compliant, so it
accommodates thermal growth without cracking. Why it faded for high-flux
chambers: the tube is round-ish, so the "land" between adjacent tubes is a braze
fillet with poor conduction, and — critically — the tube's contact patch with
the hot gas is a curved surface that runs hottest at the crown, where the
coolant-side area is smallest. At RS-25 throat fluxes the tube wall loses; at
RS-25 *nozzle* fluxes it wins on mass and cost, which is precisely why the RS-25
uses both.

Tube count is set by throat circumference and forming limits. Note the F-1's 178
tubes over a roughly 0.9 m throat diameter against the RS-25 nozzle's 1,080 over
a much larger exit — tube-wall counts scale with diameter, and a small engine
cannot be tube-walled at all.

#### 3.12.2 Milled channels in a copper liner with an electroformed closeout

The modern high-flux standard, and the RS-25 is the textbook case:

1. Forge or spin a liner of high-conductivity copper alloy — **NARloy-Z**
   (Cu–3Ag–0.5Zr) for the RS-25 — to the contour with excess wall.
2. Mill **390 axial channels** into its outer surface, leaving lands.
3. Fill the channels with a sacrificial wax or low-melting filler, and
   metallise the surface.
4. **Electroform nickel (EDNi)** over the whole thing to build the structural
   closeout, typically several millimetres thick.
5. Melt out the filler; attach manifolds.

The advantages over tubes are decisive at high flux: the hot wall is *flat*
(uniform thickness under the channel), the lands are solid copper of chosen
width and conduct as designed fins, the channel cross-section is rectangular so
$D_h$ and $A_{ch}$ are independently selectable, and the channel area schedule
can be varied continuously along the contour by varying the milling depth.

The disadvantages are cost and the electroforming step, which is slow (days),
sensitive to surface preparation, and produces a nickel deposit whose properties
depend on bath chemistry. Bond-line defects between EDNi and copper are a real
and recurring RS-25 production issue.

Copper alloy families in use:

| alloy | $k$ (W/m·K), 300 K | comment |
|---|---|---|
| OFHC copper | ~390 | best conductivity, no strength at temperature; heat-sink hardware only |
| **NARloy-Z** (Cu–Ag–Zr) | ~320 | the RS-25 liner; the historical benchmark |
| CuCrZr / C18150 | ~320 | European and commercial standard, easier to procure |
| **GRCop-84** (Cu–8Cr–4Nb) | ~280 | dispersion-strengthened; far better creep and **blanching** resistance than NARloy-Z; NASA-developed |
| **GRCop-42** (Cu–4Cr–2Nb) | ~310 | the printable variant; higher conductivity, lower strength than -84, and the current AM default |

[GRCop] is the reference for the Cu–Cr–Nb family. The important property is not
conductivity — all of these are within 30 % of each other — but **low-cycle
fatigue life and blanching resistance** at the 700–900 K hot-wall temperatures
these liners actually run at.

#### 3.12.3 Brazed jacket over a machined liner

A simpler, cheaper variant: mill the channels, then braze or weld a preformed
outer jacket over them rather than electroforming. Cheaper, faster, and used
widely on smaller and less demanding chambers. The weakness is the braze joint
along every land: it must carry the coolant pressure trying to lift the jacket
off the liner, over a very large total joint length, and a missed braze over a
few lands produces exactly the "dog-house" bulge failure described in §7.2.

#### 3.12.4 Soviet corrugated-spacer brazed liners

Soviet and Russian practice took a different route from the American tube wall.
An inner liner — commonly a **bronze** or copper alloy for high-flux chambers —
is brazed to an outer steel structural shell with a **corrugated spacer** or
with machined ribs between them, forming the coolant passages. The corrugation
is cheap to form, the braze area is large and continuous, and the steel outer
shell takes the whole hoop load so the liner can be thin and soft.

The course engine reference records the RD-170 family only as "regenerative,
kerosene-cooled" and does **not** document the liner material, so the bronze
liner is stated here as general Soviet practice from [SLPRE], not as an RD-170
data point. What the reference does establish is the architectural consequence:
the RD-170 runs **245.2 bar in four chambers** rather than one, and four small
chambers have four small throats, each with a lower $h_g$ (Bartz:
$h_g \propto D_t^{-0.2}$) and much shorter channel lengths than a single
equivalent throat would have. **The four-chamber layout is, among other things,
a cooling decision.** [H][J]

#### 3.12.5 Additively manufactured channel walls

The current frontier, and it has genuinely changed what is buildable [M]:

- **Laser powder bed fusion (L-PBF)** of a monolithic channel-wall liner:
  **Rutherford** (Rocket Lab) — "cold RP-1 through channels embedded in the
  printed chamber," with chamber, injectors, pumps and main valves all printed;
  the first engine to fly with essentially the entire primary structure
  additively manufactured. **SuperDraco** — a printed, regeneratively cooled,
  deeply throttleable abort engine, which is remarkable precisely because most
  hypergolic abort engines are ablative or film-cooled.
- **GRCop-42/84 L-PBF liners** with a superalloy closeout, the NASA MSFC
  baseline; [Gradl18] is the hot-fire summary and [GradlAM] the book-length
  treatment.
- **Blown-powder directed energy deposition (DED)** for large channel-wall
  nozzles, plus composite overwrap for the structural jacket — NASA's
  **RAMPT** project [RAMPT]. This is the route to a 2–3 m regeneratively cooled
  nozzle without 1,080 brazed tubes.
- **Inconel 625/718 printed regenerative chambers**, common in the startup
  sector because Inconel is the best-characterised printable superalloy and
  needs no bimetallic joint. The penalty is conductivity: $k \approx 25$
  W/(m·K) against copper's 320, so $t_w/k_w$ rises thirteenfold and the wall
  $\Delta T$ with it. Printed-Inconel chambers therefore run at lower $p_c$, or
  with hot walls under 0.5 mm, or with substantial film cooling — usually all
  three.
- **Relativity's Aeon** and **Launcher's E-2** are the commonly cited
  copper-alloy printed-liner development engines; neither appears in the course
  engine reference, so they are named here as **industry reports, not verified
  data**. [J]

What AM changed, precisely: **the channel geometry became free.** Tapered
sections, varying aspect ratio, bifurcating channels that split into two at the
throat to keep the land width sane, integral manifolds, and internal features
that no milling cutter could reach. What AM did not change: surface roughness
raises $f$ (§3.8), part-to-part variability is real and must be flow-tested,
and printed copper alloys have LCF properties that are still consolidating.
Treat printed-channel $\Delta p$ predictions as ±40 % until you have flowed the
part. [J]

#### 3.12.6 Liner and jacket: who carries what

A regeneratively cooled chamber is a **two-shell pressure vessel** and the load
paths must be understood separately or the structural analysis is meaningless:

- The **hot-wall liner** carries the *difference* between coolant pressure and
  chamber pressure, over the span of one channel width. Coolant pressure is
  *higher* than chamber pressure — always, because the coolant has to get to
  the injector — so the liner is pressed *inward*, toward the gas. Over a
  channel width of 2 mm and a differential of 60 bar, that is a small load. The
  liner is not the primary structure.
- The **lands** carry, in tension, the load that would otherwise separate liner
  from jacket, and they conduct heat as fins.
- The **jacket / closeout** carries the full coolant pressure as hoop stress
  and reacts the axial thrust load. It is the primary structure. On the RS-25 it
  is electroformed nickel; on the F-1 it is an Inconel jacket with steel bands;
  on RAMPT-class hardware it is a composite overwrap.

The interesting stress is neither of these. It is the **thermal strain in the
hot wall**: the hot face wants to expand relative to the cooler land and jacket,
is restrained, goes into compression, yields in compression at temperature, then
goes into tension on cooldown. That cycle is what kills liners (§7.2) and it is
proportional to $\Delta T_w$, which is proportional to $q'' t_w / k_w$ — which
brings you straight back to thin walls and copper.

$$\sigma_{th} \approx \frac{E\,\alpha\,\Delta T_w}{2(1-\nu)}$$

> **Eq. 3.14** — variables: $E$ Young's modulus [Pa]; $\alpha$ coefficient of
> thermal expansion [1/K]; $\Delta T_w$ through-wall temperature difference
> [K]; $\nu$ Poisson's ratio [—]. Meaning: the elastic thermal stress in a
> fully restrained wall with a linear through-thickness gradient. Assumes:
> elastic, fully restrained, linear gradient, temperature-independent
> properties. Fails: immediately, because a real copper liner **yields** on the
> first cycle — this equation tells you the elastic stress you would need, and
> when it exceeds the yield strength (it always does, by 2–5×) you know you are
> in the low-cycle-fatigue regime and must design to strain, not stress.

For NARloy-Z at $\Delta T_w = 127$ K (WE1): $E \approx 100$ GPa,
$\alpha \approx 1.8\times10^{-5}$/K, $\nu = 0.34$ gives
$\sigma_{th} \approx 100\times10^9 \times 1.8\times10^{-5} \times 127 /
(2\times0.66) = 173$ MPa. NARloy-Z yields around 100–150 MPa at 800 K. The
liner yields every single firing. That is normal, expected, designed for, and
the reason RS-25 liners have a defined cycle life rather than an infinite one.

### 3.13 Film cooling, quantified

Two regimes, and you need both.

**Liquid film.** While the film is liquid it is an enthalpy sink. Over the
length it survives:

$$\dot m_{film}\,\Delta h_{film} = \int q''\,dA \approx \bar q''\,\pi D_c L_{film}$$

$$\Delta h_{film} = c_{p,\ell}\,(T_{sat} - T_{inj}) + h_{fg}$$

> **Eq. 3.15** — variables: $\dot m_{film}$ film mass flow [kg/s];
> $\Delta h_{film}$ enthalpy the film can absorb per kg [J/kg]; $c_{p,\ell}$
> liquid specific heat [J/(kg·K)]; $T_{sat}$ effective vaporisation
> temperature at chamber pressure [K]; $T_{inj}$ injection temperature [K];
> $h_{fg}$ latent heat [J/kg]; $\bar q''$ mean wall flux over the filmed length
> [W/m²]; $D_c$ chamber diameter [m]; $L_{film}$ length over which the liquid
> film survives [m]. Meaning: sizes the film flow for a required covered length.
> Assumes: all the wall heat over $L_{film}$ goes into the film, the film stays
> attached and uniform, no entrainment loss into the core, no combustion of the
> film. Fails: on every one of those assumptions to some degree —
> **entrainment by the high-velocity core is the dominant loss mechanism** and
> in a real chamber can carry away 30–60 % of the film before it has done its
> job. Use Eq. 3.15 as a lower bound on the film flow and apply a 1.5–2×
> factor. [E][J]

**Gaseous film.** Once vaporised, the film mixes into the boundary layer and
lowers the effective driving temperature. Characterise by an effectiveness:

$$\eta_{fc} = \frac{T_{aw} - T_{aw,\mathrm{film}}}{T_{aw} - T_{c,\mathrm{inj}}}$$

> **Eq. 3.16** — variables: $T_{aw,\mathrm{film}}$ effective adiabatic wall
> temperature with film present [K]; $T_{c,\mathrm{inj}}$ film injection
> temperature [K]. Meaning: the fraction of the available temperature depression
> the film actually delivers. Assumes: the film mixes only with the boundary
> layer. Fails: $\eta_{fc}$ decays along the chamber roughly as $x^{-0.5}$ to
> $x^{-0.8}$ and is essentially spent within 10–20 slot heights on a
> high-shear rocket wall — which is why film is injected from the **injector
> face** for the barrel and needs a **separate slot** if you want it at the
> throat.

Typical achieved values: $\eta_{fc} \approx 0.5$–0.8 immediately downstream of
injection, decaying to 0.1–0.2 by ten chamber diameters. [E]

**The performance penalty.** Film propellant burns at a wall mixture ratio far
from optimum — deliberately fuel-rich — and much of it never mixes with the
core at all. Model the delivered performance as a two-stream mixture:

$$\frac{I_{sp}}{I_{sp,core}} = (1 - x_{fc}) + x_{fc}\,\frac{I_{sp,film}}{I_{sp,core}}
\quad\Rightarrow\quad
\frac{\Delta I_{sp}}{I_{sp}} = x_{fc}\left(1 - \frac{I_{sp,film}}{I_{sp,core}}\right)$$

> **Eq. 3.17** — variables: $x_{fc}$ film flow as a fraction of *total* engine
> flow [—]; $I_{sp,film}/I_{sp,core}$ the effective performance ratio of the
> film stream, typically **0.6–0.8** for a fuel film in a hydrocarbon engine
> [E]. Meaning: a stream-thrust weighted average. Assumes: the two streams do
> not interact, which is wrong but conservative in the right direction; ignores
> the small *benefit* that a cooler wall boundary layer slightly reduces the
> boundary-layer $I_{sp}$ loss. Fails: for gas-generator exhaust used as film
> (the F-1's nozzle curtain), where the flow was already committed as a cycle
> loss and the marginal penalty is **zero** — do not double-count it.

Rule of thumb from this: **1 % of total flow used as live fuel film costs
0.2–0.4 % of $I_{sp}$.** The V-2's 10 % *of fuel* (≈ 3.9 % of total flow at
$MR \approx 1.6$) is roughly 1 % of $I_{sp}$, and that is before counting the
$c^*$ efficiency hit from a wall region that never burns properly — the V-2's
~94 % $c^*$ efficiency is largely a film-cooling artefact.

### 3.14 Ablative and radiative sizing, briefly

**Ablative.** Design variable is thickness for a burn duration:

$$t_{abl} = FS \cdot \dot s \cdot t_{burn} + t_{residual}$$

> **Eq. 3.18** — variables: $t_{abl}$ liner thickness [m]; $FS$ factor of
> safety, typically 1.3–1.5; $\dot s$ recession rate [m/s]; $t_{burn}$ total
> accumulated burn time [s]; $t_{residual}$ virgin material that must remain at
> end of life [m]. Meaning: linear-recession sizing. Assumes: steady char-front
> recession, which is reached after a transient of a few seconds. Fails: for
> pulsed duty (the char cools and cracks between pulses, and recession per
> second is higher than in a continuous burn), at the throat where mechanical
> erosion adds to chemical ablation, and for restart-heavy profiles.

$\dot s$ for silica-phenolic in a storable-propellant chamber runs 0.02–0.15
mm/s depending on flux and location; the throat is always worst. The **LMDE**'s
forbidden 60–100 % throttle band existed because of **nozzle erosion** in that
regime, and the course reference is explicit that ablative cooling is what
capped LMDE total burn time. That is the honest ablative trade: unbeatable
simplicity, finite life, and the life is a function of a duty cycle you must
know in advance.

**Radiative.** Set $q''_{rad} = q''_{gas}$ and solve for the equilibrium wall
temperature:

$$\varepsilon_{em}\sigma_{SB}T_w^4 = h_g(T_{aw} - T_w)$$

> **Eq. 3.19** — Meaning: the wall floats at whatever temperature balances
> convective input against radiative output. Assumes: no conduction along the
> wall (a good assumption for a thin niobium skirt, a bad one near a cooled
> joint), full view to a cold sink. Fails: at the attachment joint to the
> cooled chamber, where axial conduction sets up a severe gradient and where
> radiative nozzle extensions actually crack.

The result is that the *material* chooses your area ratio. Silicide-coated
niobium is good to about 1600 K; carbon–carbon to 2000 K and beyond in a
non-oxidising plume; iridium-lined rhenium (R-4D) to about 2200 K. Each step up
lets you start the radiative section further upstream, at higher flux — which is
exactly the R-4D's history: molybdenum → coated niobium → Ir/Re, and the last
step **cut the film-cooling fraction enough to buy ~10 s of $I_{sp}$**. The
performance gain came from a materials change that let the wall run hotter.

### 3.15 Historical and modern cooling systems compared

| engine | era | propellants | $p_c$ (bar) | cooling architecture | construction | why |
|---|---|---|---|---|---|---|
| V-2 | 1942 | LOX/ethanol | 15.2 | regen + heavy film (~10 % of fuel) | double-wall mild steel | regen alone insufficient; film was the fix available |
| Redstone A-7 | 1953 | LOX/ethanol | — | regen double-wall + film | double-wall | direct V-2 descendant |
| Atlas MA-5 | 1950s | LOX/RP-1 | 40–48 | regen tube wall | brazed thin-wall tubes (Neu patent, 1950) | the invention that made large regen chambers manufacturable |
| **F-1** | 1967 | LOX/RP-1 | ~70 (contested: 66.5–77.6) | regen tube wall, 2-pass, **+ injector film + GG-exhaust nozzle curtain** | 178 brazed Inconel X-750/Hastelloy tubes, Inconel jacket, steel bands | RP-1 cannot cool a 2.5 m chamber alone; the GG exhaust was free |
| J-2 | 1966 | LOX/LH2 | 52.6 | regen tube wall + transpiration-cooled porous injector face | brazed tubes; sintered stainless face | hydrogen is a superb coolant; the face needed transpiration |
| **RL10** | 1962– | LOX/LH2 | 32.8 | regen, full nozzle pass, **circuit is the power cycle** | brazed stainless tube wall | expander cycle needs enthalpy pickup, so route for area not for minimum $\Delta p$ |
| RL10B-2 | 1998 | LOX/LH2 | not published | regen tube-wall chamber + **uncooled radiative C–C extension** | brazed tubes + 3D NOVOLTEX/SEPCARB | ε 77→285 for ~30 s of $I_{sp}$, at zero cooling cost |
| **RS-25** | 1981 | LOX/LH2 | 206.4 | **split**: 390 milled channels (MCC) + 1,080-tube nozzle | NARloy-Z liner, electroformed-nickel closeout; brazed nozzle tubes | ~160 MW/m² throat: only copper + hydrogen survives; tubes are right for the bell |
| RS-68A | 2002 | LOX/LH2 | 102.6 | regen copper-alloy chamber + **ablative nozzle** | channel-wall liner; silica/carbon-phenolic nozzle | design-for-cost: accept ε = 21.5 and a single-use nozzle |
| LR87-AJ-11 | 1960s | N2O4/A-50 | — | regen fuel-cooled chamber + **ablative skirt** | tubular chamber + ablative | each technology where it is cheapest |
| Viking | 1979 | N2O4/UH25 | 55 | **dedicated water cooling**, third pump on the shaft | — | hypergolic fuel is a poor coolant; water is the best one you can tank |
| Vulcain 2 | 2005 | LOX/LH2 | 117.3 | regen tube wall **+ turbine-exhaust film on the lower nozzle** | tube wall | higher $p_c$ and richer MR outran the tube wall |
| LE-5B | 2001 | LOX/LH2 | 35.8 | regen chamber, **expander bleed** (nozzle dropped from the circuit) | — | −5 s $I_{sp}$ bought cost and reliability |
| YF-75 | 1994 | LOX/LH2 | 37.6 | **regen chamber + dump-cooled nozzle** | — | one of the few flown dump-cooled nozzles |
| RD-170 | 1985 | LOX/RG-1 | 245.2 | regen, kerosene, **four chambers** | brazed liner/shell, Soviet corrugated practice | four small throats are far easier to cool than one big one |
| **Merlin 1D** | 2013 | LOX/RP-1 | 97 | regen milled channel, chamber + nozzle; **MVac: radiative Nb extension** | milled channel | cost and cadence; life-limited by coking, and accepted as such |
| **Rutherford** | 2017 | LOX/RP-1 | not published | regen, cold RP-1 in printed channels | **L-PBF printed chamber** | AM makes a 25 kN cooled chamber economically possible at all |
| SuperDraco | 2015 | N2O4/MMH | — | **regen** (unusual for an abort engine) | printed | must restart and be reusable; ablative cannot do that |
| **Raptor 2/3** | 2021– | LOX/CH4 | 300–330 (**claims**) | regen, methane, milled channels | milled/printed; R3 integrates plumbing into the print | methane's coking limit is what makes 300 bar reusable |

Read down the "why" column and the whole history is one argument: **the cooling
architecture is chosen by the coolant's decomposition limit, the manufacturing
base available, and the duty cycle — in that order.** Performance comes fourth.

---

## 4. Typical engineering ranges

| quantity | typical | range | extremes and who sits there |
|---|---|---|---|
| Throat heat flux $q''$ | 20–80 MW/m² | 3–200 | R-4D ~3; RS-25 at 109 % ~160 |
| Total wall heat load $Q$ | 1–5 % of chamber thermal power | 0.5–8 % | small chambers highest (area/volume) |
| $T_{wg}$, copper liner | 700–850 K | 600–900 | design limit set by LCF, not melting |
| $T_{wg}$, Inconel liner | 900–1100 K | — | lower-$p_c$ engines only |
| $T_{wg}$, radiative Nb | 1400–1600 K | — | coating service limit |
| $T_{wg}$, Ir/Re | 2000–2200 K | — | R-4D modern variants |
| $T_{wc}$ limit, RP-1 | 560–590 K long life | up to ~700 short life | coking, catalytic and thermal |
| $T_{wc}$ limit, CH₄ | 900–950 K | — | cracking, far slower than RP-1 |
| $T_{wc}$ limit, LH₂ | no chemical limit | — | limited by liner embrittlement |
| $\Delta T_w$ across hot wall | 60–200 K | 30–350 | drives LCF life directly |
| Hot-wall thickness $t_w$ | 0.6–1.0 mm | 0.3–2.5 mm | tube walls thinnest; printed Inconel thickest |
| Channel count $N_{ch}$ | 100–400 | 60–1,080 | RS-25 nozzle 1,080 tubes; F-1 178 tubes |
| Channel aspect ratio | 1.5–3 | 1–10 | HARCC designs at 4–10 |
| Coolant velocity, RP-1 | 15–60 m/s | 10–90 | throat at the top of the band |
| Coolant velocity, CH₄ | 60–180 m/s | 30–250 | density drop drives it up along the channel |
| Coolant velocity, LH₂ | 100–300 m/s | 60–600 | forces high channel count or HARCC |
| Jacket $\Delta p_j$ | 20–60 bar | 5–120 | RS-25 class highest; pressure-fed engines lowest |
| $\Delta p_j / p_c$ | 0.2–0.5 | 0.1–0.8 | expander cycles high (they want the pickup) |
| Coolant bulk rise $\Delta T_b$ | 100–250 K | 50–400 | RP-1 constrained by coking at the exit too |
| Film flow fraction $x_{fc}$ | 1–4 % of total | 0–10 % | V-2 at ~3.9 %; RS-25 at 0 |
| $I_{sp}$ penalty from film | 0.3–1.5 % | 0–3 % | zero when GG exhaust is the film |
| Ablative recession | 0.02–0.15 mm/s | — | throat worst; pulsed duty worse than continuous |
| Radiative rejection at 1600 K | 0.32 MW/m² | 0.1–0.7 | 150× short of a booster throat |

---

## 5. Worked examples

Throughout, the **Module 03 reference engine (RE-500)** is used, with the
parameters carried forward from Modules 03 and 06:

| parameter | value |
|---|---|
| Propellants | LOX / RP-1 |
| Sea-level thrust $F$ | 500 kN |
| Nozzle stagnation pressure $p_{c,\mathrm{ns}}$ | 100 bar = 10.0 MPa |
| Nozzle area ratio $\varepsilon$ | 16 |
| $T_c$, $\gamma$, $\mathcal{M}$ | 3600 K, 1.20, 22.0 kg/kmol |
| $R$ | 377.93 J/(kg·K) |
| $c^*_{ideal}$ | 1798.6 m/s |
| $A_t$, $D_t$ | 0.030582 m², 197.33 mm |
| $\dot m$ | 170.04 kg/s |
| $MR$ (from Module 07) | 2.27 → $\dot m_f$ = **52.00 kg/s**, $\dot m_o$ = 118.04 kg/s |
| $D_c$, barrel length, convergent height | 279.1 mm, 0.5229 m, 0.0708 m |
| Bell | 80 %, axial length 0.884 m to $\varepsilon = 16$ |

Gas-side inputs (Module 10 conventions): $c_{p,0} = \gamma R/(\gamma-1) =
2267.6$ J/(kg·K); $Pr_0 = 4\gamma/(9\gamma-5) = 0.8276$;
$\mu_0 = 1.184\times10^{-7}\mathcal{M}^{0.5}T_0^{0.6} = 7.557\times10^{-5}$
Pa·s; throat curvature $r_c = 1.5R_t = 0.14800$ m.

**A standing caveat.** Bartz is quoted at ±20–30 % at the throat and is
substantially worse in the barrel, where it commonly over-predicts by a factor
of 1.5–2.5 because the correlation is calibrated on throat data. I use raw
Bartz for the headline numbers so the arithmetic is reproducible from
`tools/rocket.py`, and state a corrected figure alongside wherever the
correction changes the conclusion.

---

### WE1 — A full 1-D regenerative channel design at the throat, RP-1

**Given.** Cool the RE-500 with all 52.00 kg/s of RP-1, counter-flow (1-pass,
entering at the nozzle exit at 300 K, exiting at the injector-end manifold).
Liner NARloy-Z, $k_w = 320$ W/(m·K), hot wall $t_w = 0.9$ mm. First-cut channel
schedule: $N_{ch} = 180$; at the throat $w = 2.0$ mm, $h_{ch} = 4.0$ mm.

**Step 1 — channel geometry.**

$$A_{ch} = 2.0 \times 4.0 = 8.00\ \mathrm{mm^2} = 8.00\times10^{-6}\ \mathrm{m^2}$$
$$D_h = \frac{4A_{ch}}{2(w+h_{ch})} = \frac{4\times8.00\times10^{-6}}{2\times6.0\times10^{-3}} = 2.667\ \mathrm{mm}$$
$$p_{ch} = \frac{\pi(D_t + 2t_w)}{N_{ch}} = \frac{\pi(0.19733 + 0.0018)}{180} = \frac{0.62555}{180} = 3.475\ \mathrm{mm}$$
$$t_L = p_{ch} - w = 3.475 - 2.0 = \mathbf{1.475\ mm}, \qquad AR = 2.0$$

A 1.475 mm land at a 3.475 mm pitch is comfortable to mill and comfortable to
electroform over. Note that this effectively fixes $N_{ch}$: at 240 channels the
land would be 0.61 mm, which is at the manufacturing floor.

**Step 2 — coolant state at the throat.** In counter-flow the coolant has
already absorbed the nozzle load before it reaches the throat. Step 7 computes
that as 10.94 MW, so

$$T_{b,throat} = 300 + \frac{10.94\times10^{6}}{52.00 \times 2280} = 300 + 92 \approx \mathbf{400\ K}$$

RP-1 at 400 K, 150 bar: $\rho = 738$ kg/m³, $c_p = 2280$ J/(kg·K),
$k = 0.118$ W/(m·K), $\mu = 4.6\times10^{-4}$ Pa·s. Hence
$Pr = 2280 \times 4.6\times10^{-4}/0.118 = \mathbf{8.89}$.

**Step 3 — velocity and Reynolds number.**

$$\dot m_{ch} = \frac{52.00}{180} = 0.28888\ \mathrm{kg/s}$$
$$V_c = \frac{\dot m_{ch}}{\rho A_{ch}} = \frac{0.28888}{738 \times 8.00\times10^{-6}} = \mathbf{48.93\ m/s}$$
$$Re_c = \frac{\rho V_c D_h}{\mu} = \frac{738 \times 48.93 \times 2.667\times10^{-3}}{4.6\times10^{-4}} = \mathbf{2.093\times10^{5}}$$

**Step 4 — coolant-side coefficient (Dittus–Boelter, Eq. 3.7).**

$$h_c = 0.023\,\frac{0.118}{2.667\times10^{-3}}\,(2.093\times10^{5})^{0.8}\,(8.888)^{0.4}
= 0.023 \times 44.25 \times 17{,}715 \times 2.4136 = \mathbf{4.404\times10^{4}\ W/(m^2K)}$$

**Step 5 — fin effect (Eq. 3.6).**

$$m = \sqrt{\frac{2 \times 4.404\times10^{4}}{320 \times 1.475\times10^{-3}}} = \sqrt{\frac{8.808\times10^{4}}{0.4720}} = 431.9\ \mathrm{m^{-1}}$$
$$m h_{ch} = 431.9 \times 0.004 = 1.728, \qquad \eta_f = \frac{\tanh 1.728}{1.728} = \frac{0.9389}{1.728} = \mathbf{0.5434}$$
$$\Phi = \frac{2.0 + 2(0.5434)(4.0)}{3.475} = \frac{6.347}{3.475} = 1.826$$
$$h_{c,\mathrm{eff}} = 1.826 \times 4.404\times10^{4} = \mathbf{8.043\times10^{4}\ W/(m^2K)}$$

**Step 6 — solve the wall stack (Eqs. 3.4, 3.5).** Bartz depends on $T_{wg}$
through $\sigma$, so iterate. Converged, with $T_{aw} = 3600 \times
1.09/1.10 = 3567.3$ K:

$$\sigma = 1.303, \qquad h_g = 1.820\times10^{4}\ \mathrm{W/(m^2K)}$$

Resistances:

| path | value (m²K/W) | share |
|---|---|---|
| gas side $1/h_g$ | $5.495\times10^{-5}$ | 78.3 % |
| wall $t_w/k_w = 0.0009/320$ | $2.813\times10^{-6}$ | 4.0 % |
| coolant $1/h_{c,\mathrm{eff}}$ | $1.243\times10^{-5}$ | 17.7 % |
| **total** | $7.019\times10^{-5}$ | |

$$q'' = \frac{3567.3 - 400}{7.019\times10^{-5}} = \mathbf{4.51\times10^{7}\ W/m^2 = 45.1\ MW/m^2}$$
$$T_{wg} = 3567.3 - \frac{4.512\times10^{7}}{1.820\times10^{4}} = 3567.3 - 2479.4 = \mathbf{1088\ K}$$
$$\Delta T_w = \frac{4.512\times10^{7} \times 0.0009}{320} = \mathbf{127\ K}$$
$$T_{wc} = 400 + \frac{4.512\times10^{7}}{8.043\times10^{4}} = 400 + 561 = \mathbf{961\ K}$$

**Step 7 — the total heat load and the bulk temperature rise.** Integrating
Bartz over the contour with $(A_t/A)^{0.9}$ and a fixed 900 K wall:

| zone | area (m²) | $\bar q''$ (MW/m²) | $Q$ (MW) |
|---|---|---|---|
| barrel ($\varepsilon_c = 2$) | 0.4584 | 27.7 | 12.70 |
| convergent | 0.0612 | 36.9 | 2.26 |
| divergent to $\varepsilon = 16$ | 1.7304 | 6.3 | 10.94 |
| **total** | **2.250** | 11.5 (area-mean) | **25.90** |

$$\Delta T_b = \frac{Q}{\dot m_f c_p} = \frac{25.90\times10^{6}}{52.00 \times 2280} = \mathbf{218\ K}$$

so the RP-1 leaves the jacket at 518 K. Applying the conventional Bartz chamber
correction (0.5 in the barrel, 0.75 in the convergent) gives $Q = 18.98$ MW,
$\Delta T_b = 160$ K, exit 460 K. **Either way the coolant exit bulk temperature
is at or approaching the coking threshold before the wall gradient is even
counted.**

Note also the ratio $Q/\tfrac12\dot m c^2$: the chamber's thermal power is
roughly 735 MW, so the wall is absorbing **3.5 %** of it. That is squarely in
the normal 1–5 % band, which is the first sanity check on the whole calculation.

**Step 8 — pressure drop.** Tapered channel schedule, $f = 0.184Re^{-0.2}$,
properties evaluated per zone:

| zone | channel | $\rho$ | $V_c$ (m/s) | $Re$ | $f$ | $dp/dx$ (bar/m) | $L$ (m) | $\Delta p$ (bar) |
|---|---|---|---|---|---|---|---|---|
| nozzle (inlet) | 4.0 × 4.0 mm | 795 | 22.7 | 7.22e4 | 0.0196 | 10.07 | 0.932 | 9.38 |
| throat | 2.0 × 4.0 mm | 738 | 48.9 | 2.09e5 | 0.0159 | **52.58** | 0.150 | 7.89 |
| convergent | 3.0 × 4.0 mm | 700 | 34.4 | 2.43e5 | 0.0154 | 18.60 | 0.454 | 8.45 |
| barrel | 3.0 × 4.0 mm | 680 | 35.4 | 3.06e5 | 0.0147 | 18.29 | 0.523 | 9.57 |
| | | | | | | **friction total** | 2.059 | **35.3** |

With a 1.35 multiplier for curvature, entrance and manifold losses:
$\Delta p_j = \mathbf{47.6\ bar}$.

The throat is **22 % of the pressure drop in 7 % of the length**, which is
Eq. 3.13 made visible.

**Step 9 — what it costs.** From Module 06, the injector-end chamber pressure is
~105 bar. With a 20 bar injector drop:

$$p_{\mathrm{pump}} = 105 + 20 + 48 = \mathbf{173\ bar}$$
$$P_{\mathrm{pump}} = \frac{\dot m_f \Delta p}{\rho\eta} = \frac{52.00 \times 17.0\times10^{6}}{780 \times 0.70} = 1.62\ \mathrm{MW}$$

Without the jacket the fuel pump would need 125 bar and 1.16 MW. **The cooling
circuit costs 0.46 MW of pump power**, about 40 % of the fuel pump.

> **Sanity check — and the design fails.** $T_{wg} = 1088$ K is above what
> NARloy-Z can hold for more than a handful of cycles; $T_{wc} = 961$ K is
> **370 K above the RP-1 coking threshold**. Sweeping the geometry does not
> rescue it: at $N_{ch} = 450$, $w = 0.5$ mm, $h_{ch} = 8$ mm, $t_w = 0.5$ mm —
> which is at the manufacturing limit and costs 130 bar/m at the throat — the
> best obtainable is $T_{wc} = 745$ K. **A 100-bar LOX/RP-1 engine cannot be
> regeneratively cooled at the throat within the coking limit.** The real
> answers are: reduce $p_c$ (F-1: ~70 bar), add film cooling (everybody), accept
> a life limit (Merlin), split into several small chambers (RD-170), or change
> fuel (Raptor). This is the single most useful result in the module, and it is
> not an artefact of Bartz — apply the customary 0.8 throat correction and
> $T_{wc}$ is still about 830 K.

---

### WE2 — The same channel with methane and hydrogen

**Given.** Hold the *gas side* fixed at the RE-500 values ($h_g$, $T_{aw}$, and
therefore the flux the wall must reject) and hold the channel geometry fixed at
WE1's ($N_{ch} = 180$, $2.0 \times 4.0$ mm, $t_w = 0.9$ mm NARloy-Z). Change
only the coolant, using the fuel flow a 500 kN, 100-bar engine on that
propellant combination would actually have:

| | $MR$ | $c^*_{ideal}$ (m/s) | $\dot m$ (kg/s) | $\dot m_f$ (kg/s) | $T_b$ at throat (K) |
|---|---|---|---|---|---|
| LOX/RP-1 | 2.27 | 1798.6 | 170.0 | 52.00 | 400 |
| LOX/CH₄ | 3.40 | 1820 | 168.0 | 39.78 | 250 |
| LOX/LH₂ | 6.00 | 2350 | 130.1 | 19.37 | 150 |

This is a **coolant comparison, not an engine comparison** — a real methalox or
hydrolox engine would have a different $T_{aw}$, a different $h_g$ and a
different contour. Holding the gas side fixed isolates the coolant physics,
which is the point.

**Methane.** At 250 K and 150 bar: $\rho = 190$, $c_p = 3050$, $k = 0.070$,
$\mu = 2.6\times10^{-5}$, so $Pr = 1.13$.

$$V_c = \frac{39.78/180}{190 \times 8.00\times10^{-6}} = \frac{0.22101}{1.520\times10^{-3}} = \mathbf{145.4\ m/s}$$
$$Re_c = \frac{190 \times 145.4 \times 2.667\times10^{-3}}{2.6\times10^{-5}} = \mathbf{2.833\times10^{6}}$$
$$h_c = 0.023\times\frac{0.070}{2.667\times10^{-3}}\times(2.833\times10^{6})^{0.8}\times(1.1329)^{0.4} = \mathbf{9.212\times10^{4}}\ \mathrm{W/(m^2K)}$$

Fin: $m = 624$ 1/m, $mh_{ch} = 2.499$, $\eta_f = 0.3948$, $\Phi = 1.484$,
$h_{c,\mathrm{eff}} = 1.367\times10^{5}$ W/(m²K).

$$q'' = \frac{3567.3 - 250}{1/(1.910\times10^{4}) + 2.813\times10^{-6} + 1/(1.367\times10^{5})} = \mathbf{53.1\ MW/m^2}$$
$$T_{wg} = \mathbf{788\ K},\qquad \Delta T_w = \mathbf{149\ K},\qquad T_{wc} = \mathbf{638\ K},\qquad dp/dx = \mathbf{71.0\ bar/m}$$

**Hydrogen.** At 150 K and 150 bar: $\rho = 22.0$, $c_p = 13{,}600$,
$k = 0.115$, $\mu = 6.6\times10^{-6}$, $Pr = 0.78$.

$$V_c = \frac{19.37/180}{22.0 \times 8.00\times10^{-6}} = \mathbf{611.3\ m/s}, \qquad
Re_c = \mathbf{5.434\times10^{6}}$$
$$h_c = \mathbf{2.195\times10^{5}}\ \mathrm{W/(m^2K)},\quad \eta_f = 0.259,\quad
h_{c,\mathrm{eff}} = \mathbf{2.572\times10^{5}}$$
$$q'' = \mathbf{60.0\ MW/m^2},\quad T_{wg} = \mathbf{552\ K},\quad
\Delta T_w = \mathbf{169\ K},\quad T_{wc} = \mathbf{383\ K},\quad dp/dx = \mathbf{127.6\ bar/m}$$

**Summary and the two lessons.**

| | RP-1 | CH₄ | LH₂ |
|---|---|---|---|
| $V_c$ (m/s) | 48.9 | 145.4 | 611.3 |
| $Re_c$ | 2.09e5 | 2.83e6 | 5.43e6 |
| $Pr_c$ | 8.89 | 1.13 | 0.78 |
| $h_c$ (kW/m²K) | 44.0 | 92.1 | 219.5 |
| $\eta_f$ | 0.543 | 0.395 | 0.259 |
| $h_{c,\mathrm{eff}}$ (kW/m²K) | 80.4 | 136.7 | 257.2 |
| $q''$ (MW/m²) | 45.1 | 53.1 | 60.0 |
| $T_{wg}$ (K) | 1088 | 788 | 552 |
| $T_{wc}$ (K) | **961** | **638** | **383** |
| decomposition limit (K) | 560–590 | 900–950 | none |
| **verdict** | **fails by 370 K** | **passes with 300 K margin** | **passes; $\Delta p$-limited** |
| $dp/dx$ at throat (bar/m) | 52.6 | 71.0 | 127.6 |

1. **Cooling harder increases the heat load.** RP-1 rejects 45 MW/m², hydrogen
   60 MW/m² — 33 % more heat through the same wall from the same gas. The better
   coolant does not reduce the heat; it moves the wall temperature down and
   pulls more heat through. That extra 33 % is real pump work and real coolant
   bulk rise, and it is why hydrogen engines have such large jacket $\Delta T_b$
   budgets.
2. **Hydrogen's problem is hydraulic, not thermal.** 611 m/s and 128 bar/m is
   not a design; it is a warning. Over a 2 m circuit that is 250 bar of friction
   alone. The fixes are more channels (RS-25: 390 — but the RE-500's throat
   circumference will not accept more than about 200 at a sane land width) or
   taller channels. Re-running the hydrogen case at $N_{ch} = 200$,
   $w = 1.8$ mm, $h_{ch} = 10.8$ mm ($AR = 6$, a genuine HARCC design) gives
   $V_c = 226$ m/s, $h_{c,\mathrm{eff}} = 1.47\times10^{5}$ W/(m²K),
   $T_{wc} = 536$ K and **$dp/dx = 17.9$ bar/m** — a 7× reduction in pressure
   gradient for 150 K more wall temperature, which is a trade worth taking every
   time. Note $\eta_f$ has collapsed to 0.137: the tall land is barely
   conducting, and almost all the cooling is now happening on the channel floor.

> **Sanity check.** The RS-25 runs hydrogen at 206 bar through 390 milled
> channels in a NARloy-Z liner with an electroformed-nickel closeout, and its
> throat flux is of order 160 MW/m² — about 2.7× the 60 MW/m² computed here at
> half the chamber pressure and a larger throat, which is the right ratio for
> $q'' \propto p_c^{0.8} D_t^{-0.2}$. Raptor claims 300–330 bar on methane with
> milled channels. **Nobody claims a 300-bar reusable kerosene engine, and this
> table is why.**

---

### WE3 — Sizing the injector film and its $I_{sp}$ penalty

**Given.** RE-500 barrel: $D_c = 279.1$ mm, length 0.5229 m. From WE1 the raw
Bartz barrel flux is 27.7 MW/m²; apply the conventional 0.5 chamber correction
to get a design value $\bar q'' = 13.9$ MW/m². Fuel film injected from the
injector face at 300 K, required to survive the first 0.25 m of barrel — about
half the barrel length and roughly one chamber diameter, which is the honest
limit of what an injector-face film achieves.

**Step 1 — film enthalpy capacity (Eq. 3.15).** RP-1: $c_{p,\ell} = 2100$
J/(kg·K), effective vaporisation temperature at 105 bar $\approx 500$ K,
$h_{fg} \approx 2.8\times10^{5}$ J/kg:

$$\Delta h_{film} = 2100 \times (500-300) + 2.8\times10^{5} = 4.20\times10^{5} + 2.80\times10^{5} = 7.0\times10^{5}\ \mathrm{J/kg}$$

**Step 2 — film flow.**

$$\dot m_{film} = \frac{\bar q'' \pi D_c L_{film}}{\Delta h_{film}}
= \frac{1.386\times10^{7} \times \pi \times 0.2791 \times 0.25}{7.0\times10^{5}}
= \frac{3.047\times10^{6}}{7.0\times10^{5}} = \mathbf{4.35\ kg/s}$$

That is **8.4 % of the fuel flow** and **$x_{fc} = 2.56\,\%$ of total flow**.
Applying the 1.5–2× entrainment allowance recommended under Eq. 3.15, the honest
design number is **6.5–8.7 kg/s, i.e. 4–5 % of total flow** — and now you can
see why the V-2 needed 10 % of its fuel.

**Step 3 — the $I_{sp}$ penalty (Eq. 3.17).** With
$I_{sp,film}/I_{sp,core} = 0.7$ (mid-band for a fuel film in a hydrocarbon
engine):

$$\frac{\Delta I_{sp}}{I_{sp}} = 0.0256 \times (1 - 0.7) = 0.77\,\%$$

On the RE-500's sea-level $I_{sp}$ of roughly 263 s that is **2.0 s**. The band
across $I_{sp,film}/I_{sp,core} = 0.6$–0.8 is 1.3–2.7 s; with the entrainment
allowance included it becomes roughly 2–5 s.

**Step 4 — and it does not fix the throat.** Film effectiveness decays as
roughly $x^{-0.5}$ to $x^{-0.8}$ and is spent within 10–20 slot heights. The
throat is 0.59 m from the injector face. To rescue WE1's throat you would need
$T_{aw,\mathrm{film}} \approx 1490$ K there, i.e.

$$\eta_{fc} = \frac{3567 - 1490}{3567 - 300} = 0.64\ \text{at the throat}$$

— a value achievable only within a few centimetres of an injection slot. A
dedicated slot just upstream of the throat would work, and is exactly what
Soviet chambers do with their film belts; an injector-face film will not.

> **Sanity check.** 2–5 s of $I_{sp}$ for the barrel film, and the throat still
> needs its own answer. That matches the historical record: the F-1 took both —
> injector film for the barrel *and* a gas-generator curtain for the nozzle
> extension, where the GG flow was already a cycle loss so the marginal cost was
> zero. **The right way to pay for film cooling is with propellant you have
> already written off.**

---

### WE4 — RL10 expander: how much enthalpy the jacket must pick up

**Given.** RL10A-3-3A: $F = 73.4$ kN vacuum, $I_{sp} = 444$ s, $MR = 5.0$,
$p_c = 32.8$ bar. Closed expander: **all** the hydrogen goes through the
tube-wall jacket, then the turbine, then the injector.

**Step 1 — flows.**

$$\dot m = \frac{F}{I_{sp}g_0} = \frac{73{,}400}{444 \times 9.80665} = \mathbf{16.858\ kg/s}$$
$$\dot m_f = \frac{16.858}{6.0} = \mathbf{2.810\ kg/s}, \qquad \dot m_o = \mathbf{14.048\ kg/s}$$

**Step 2 — jacket pickup.** Hydrogen enters the jacket at pump discharge,
~45 K, and leaves at the turbine inlet, ~220 K. Take $c_p = 14{,}600$ J/(kg·K)
(supercritical H₂ across that range; the value varies by ±10 % and the answer
inherits that):

$$Q_{jacket} = \dot m_f c_p \Delta T = 2.810 \times 14{,}600 \times 175 = \mathbf{7.18\ MW}$$

**Step 3 — how much shaft power that buys.** Turbine, $\gamma = 1.40$,
$\eta_t = 0.70$, at three plausible pressure ratios:

$$P_t = \eta_t \dot m_f c_p T_{in}\left[1 - pr^{-(\gamma-1)/\gamma}\right]$$

| $pr$ | $P_t$ (kW) | $P_t/Q_{jacket}$ |
|---|---|---|
| 1.35 | 519 | 7.2 % |
| 1.45 | **636** | **8.9 %** |
| 1.55 | 744 | 10.4 % |

**Step 4 — what the pumps need.** Hydrogen pump, 3 → 62 bar,
$\rho = 71$ kg/m³, $\eta_p = 0.65$:

$$P_f = \frac{2.810 \times 5.9\times10^{6}}{71 \times 0.65} = \mathbf{359\ kW}$$

LOX pump, $\Delta p = 45$ bar, $\rho = 1140$ kg/m³, $\eta_p = 0.70$:

$$P_o = \frac{14.048 \times 4.5\times10^{6}}{1140 \times 0.70} = \mathbf{79\ kW}$$

Total **438 kW**, plus gearbox and bearing losses — call it 480 kW required
against 636 kW available at $pr = 1.45$. The cycle closes with about 30 %
margin, which is what you want on an engine that must start reliably from a cold
soak.

**Step 5 — the point.** The jacket must absorb **7.18 MW** to deliver **0.64
MW** of shaft work: an **11:1 ratio**. That factor is not inefficiency in the
turbine — it is the thermodynamics of a small pressure ratio. The turbine can
only extract $c_p T_{in}[1 - pr^{-0.286}]$, and with $pr = 1.45$ that bracket is
0.10. You must put ten units of heat into the hydrogen to get one unit of work
out.

Two consequences follow, and they define the expander cycle:

- **The cooling jacket must be sized for enthalpy pickup, not for minimum wall
  temperature.** This is why the RL10 routes hydrogen through the *entire*
  nozzle — it needs the area. It is also why a copper liner would be the wrong
  choice: copper would give a colder wall for the same pickup, and a colder wall
  is not what the cycle wants.
- **The cycle has a hard thrust ceiling.** Pickup scales with wetted area;
  required pump power scales with $\dot m \Delta p \propto \dot m p_c$. Push
  $p_c$ or thrust up and the required power grows faster than the available
  pickup. The RL10 has stayed between 73 and 110 kN for sixty years. Anyone
  wanting more went to expander *bleed* (LE-5B, BE-3U) or a preburner.

> **Sanity check.** $Q_{jacket} = 7.18$ MW against the RL10's total chemical
> power of $\tfrac12\dot m(I_{sp}g_0)^2 = 160$ MW is **4.5 %** into the wall —
> at the top of the normal 1–5 % band, exactly as it should be for an engine
> that is *trying* to get heat into its coolant. That single number is the
> cleanest statement of what an expander cycle is.

---

## 6. Real engines — why did they design it that way?

### 6.1 F-1 (1967) — tube wall, two passes, and free film cooling

**The choice.** 178 brazed Inconel X-750/Hastelloy tubes in an Inconel jacket
with steel bands, fuel-cooled, in a down-and-back two-pass routing, plus
injector-face fuel film cooling and — the distinctive part — the entire
**gas-generator exhaust dumped into the nozzle extension as a film curtain**, so
that the extension carries no regenerative circuit at all.

**Alternatives available in 1962.** Milled-channel copper liners existed in the
laboratory but not at that diameter; electroforming at that scale was
unimaginable. Ablative was out for a 165 s burn at 6.8 MN. Double-wall regen —
the V-2/Redstone architecture — did not scale.

**Why it made sense.** Three reasons, in order. (1) **RP-1 could not do the job
alone**, and WE1 is the proof: even at the F-1's ~70 bar rather than 100,
kerosene at that flux drives the coolant-side wall past its coking threshold.
Something had to reduce the heat load, and film cooling was the only tool
available. (2) **The GG exhaust was free.** A gas-generator cycle throws 2–3 %
of the propellant overboard as a cycle loss; the F-1 designers noticed that this
loss could be spent twice — once as turbine work, once as a nozzle coolant — at
zero marginal $I_{sp}$ cost. Eq. 3.17 says the penalty for gas-generator film is
nil because the flow was already written off. (3) The **two-pass routing** put
inlet and outlet manifolds at the same end, which on a gimballed engine with
flex lines is worth real mass and real reliability, and it averaged the tube
temperature circumferentially between hot down-tubes and cold up-tubes.

**Would a modern engineer choose it?** No — they would print a channel-wall
GRCop-42 liner with a DED or overwrapped jacket, per [RAMPT], and skip the
brazing entirely. But they would still need the film cooling, and they would
still be tempted by the free GG curtain. The architecture is dated; the
*reasoning* is not.

### 6.2 RS-25 (1981) — milled copper where the flux is, tubes where the area is

**The choice.** Two constructions in one engine: a NARloy-Z liner with **390
milled channels** and an **electroformed-nickel closeout** for the main
combustion chamber, and a **1,080-tube brazed tube wall** for the nozzle. Both
hydrogen-cooled, at 206.4 bar and 109 % power level.

**Alternatives in 1972.** Tube wall throughout, as on the J-2. It would not have
worked: at 206 bar the throat flux is of order 160 MW/m², more than three times
the F-1's, and a round tube presents its thinnest coolant-side area at exactly
the crown that sees the highest gas-side flux. You need a *flat* hot wall of
constant thickness and solid conducting lands, and that means milling.

**Why it made sense.** The design is a straight application of Eq. 3.4. At
160 MW/m² the wall resistance $t_w/k_w$ must be tiny, so: copper alloy
($k = 320$) at 0.7–0.9 mm. The coolant resistance must be tiny, so: hydrogen at
high velocity through many small channels. The gas-side resistance is what it
is. Meanwhile the *nozzle*, at expansion ratios up to 69:1, sees fluxes two
orders of magnitude lower over an enormous area, where a copper liner would be
absurdly heavy and expensive and 1,080 thin brazed tubes are exactly right.
**Splitting the construction is the whole design insight.**

**Would a modern engineer choose it?** The copper channel-wall MCC, yes — though
in GRCop-42 rather than NARloy-Z, for the better creep and blanching resistance
[GRCop], and printed rather than milled-and-electroformed. The 1,080-tube
nozzle, no: that is precisely what RAMPT's DED channel-wall nozzles exist to
replace.

### 6.3 RL10 (1962) — stainless tubes, and the jacket is the engine

**The choice.** Brazed stainless-steel tube wall, hydrogen through the whole
chamber *and* the whole nozzle, feeding the turbine. $p_c = 32.8$ bar.

**Why it made sense.** Because in an expander cycle the cooling jacket is not a
cooling jacket — it is the boiler. WE4 shows it must absorb 7.2 MW to deliver
0.64 MW of shaft work. The design objective is **maximum enthalpy pickup**,
which means maximum wetted area, which means routing coolant through the entire
nozzle and accepting the pressure drop. Stainless steel is the right material:
drawable into thin tubes, brazeable, hydrogen-compatible, and strong enough at
temperature that the tube can be its own pressure vessel. Copper would give a
colder wall and less pickup per unit area — the wrong direction entirely.

The low chamber pressure is not a limitation to apologise for; it is the
consequence of the cycle. At 32.8 bar the flux is low, the tube wall is
adequate, and the pump discharge pressure the turbine must support is modest.

**Would a modern engineer choose it?** Yes, and they have: the RL10C-X is the
additively manufactured development variant of exactly this architecture, and
the engine has been in continuous production for six decades — the longest
service life of any rocket engine ever built. Very few 1962 design decisions
have aged that well.

### 6.4 Merlin 1D (2013) — accepting the coking limit as a business decision

**The choice.** Regenerative milled-channel chamber and nozzle, RP-1-cooled, at
97 bar; radiatively cooled niobium extension on the vacuum variant.

**Why it made sense.** WE1 says a 100-bar RP-1 engine cannot hold its
coolant-side wall under the coking threshold. SpaceX built one anyway, at 97
bar, and the answer to "how" is: they accepted a **life-limited, inspected,
refurbished component**. Merlin engines are recovered, inspected and reflown;
they are not indefinitely reusable, and the thrust chamber is one of the
reasons. Combined with injector film cooling, a milled-channel design that can
be manufactured at hundreds of units a year, and a gas-generator cycle that
keeps $p_c$ modest, the engine works and is cheap. The course reference's
verdict is blunt and correct: "the design is optimised for cost, restart and
reuse, not $I_{sp}$."

**Would a modern engineer choose it?** For a kerosene booster, yes — there is no
better answer with that fuel. But note that when SpaceX designed a clean-sheet
engine intended for **rapid** reuse at **300+ bar**, they changed fuel. Raptor is
methane, and §3.11 is the reason.

### 6.5 Rutherford (2017) — printing a cooled chamber small enough that nothing else works

**The choice.** Regeneratively cooled, cold RP-1 through channels **embedded in
a printed chamber**; chamber, injector, pumps and main valves all laser powder
bed fusion. 25 kN.

**Why it made sense.** A 25 kN engine has a throat diameter of order 40–50 mm
and therefore a circumference of 130–160 mm. At a 3 mm pitch that is **45–55
channels**. You cannot tube-wall it — the tubes would be capillaries. You can
mill it, barely, but the fixturing and the electroforming cost per engine is
brutal when you need hundreds of engines a year. Printing removes the entire
problem: the channels are grown, the manifolds are integral, and the part count
collapses.

The trade Rocket Lab accepted is the one §3.12.5 describes: as-printed channel
roughness raises the friction factor by roughly 2× over a smooth duct, and the
pressure drop with it. On an **electric-pump** engine that is a battery-mass
penalty rather than a turbine-power penalty — and battery mass scales linearly,
where turbine power does not, so the penalty is at its most tolerable in exactly
this architecture. The engine and the cycle fit each other.

**Would a modern engineer choose it?** For a small engine, this is now the only
sensible answer, and essentially every small-launch engine designed since has
copied it.

### 6.6 Printed Inconel versus printed copper — the live argument

**The choice being argued.** Print the regenerative chamber in **Inconel
625/718** (single material, best-characterised printable superalloy, no
bimetallic joint, hydrogen-tolerant, cheap) or in **GRCop-42** with a superalloy
closeout (13× the conductivity, a bimetallic interface, more process
development)?

**The physics.** $t_w/k_w$ at 0.9 mm is $2.8\times10^{-6}$ m²K/W in NARloy-Z and
$3.6\times10^{-5}$ in Inconel 718. In WE1's resistance budget the wall goes from
4 % of the total to **34 %**, and $\Delta T_w$ at 45 MW/m² would be over 1600 K
— which is impossible, meaning the flux must come down. An Inconel chamber must
therefore run at lower $p_c$, with a much thinner hot wall (0.4–0.5 mm), with
substantial film cooling, or all three.

**Who is where.** SuperDraco is printed and regeneratively cooled — Inconel is
plausible at that chamber pressure and duty cycle, though the course reference
does not state the alloy. NASA MSFC's baseline for high-flux chambers is
GRCop-42 L-PBF with a superalloy closeout [Gradl18][GradlAM]. Relativity's Aeon
and Launcher's E-2 are publicly associated with copper-alloy printed liners,
though neither is in the verified reference. The honest summary is that
**Inconel is the right answer below roughly 60–80 bar and copper is the right
answer above it**, and where exactly the crossover sits depends on your
film-cooling budget and your acceptable liner life. [J]

### 6.7 Raptor (2021–) — and what the claims do and do not establish

**The claim.** Regenerative, methane-cooled milled channels, at 300 bar
(Raptor 2) to 330 bar operational (Raptor 3), full-flow staged combustion, with
Raptor 3 integrating much of the secondary plumbing into the castings and prints.

**What is verifiable.** The cycle, the propellants, and — through FAA licensing
documents and third-party acoustic analysis — the sea-level thrust class. That
is all. **Chamber pressure, $I_{sp}$, dry mass and thrust-to-weight rest
entirely on SpaceX statements, several of which originated as tweets.** The
course reference is explicit about this and so am I.

**What the claim implies if true, thermally.** At 330 bar the throat flux would
scale as $p_c^{0.8}$ from the RS-25's 206 bar and ~160 MW/m² — with corrections
for the different gas and a smaller throat, plausibly 150–250 MW/m². That is
only survivable with a copper-alloy liner, a sub-millimetre hot wall, and a
coolant whose decomposition limit is well above 900 K. **Methane is the only
fuel that satisfies the last condition while remaining dense enough to pump
economically.** The choice of methane is not primarily about $I_{sp}$ (it beats
RP-1 by ~10 s and loses to hydrogen by ~80 s) or about ISRU; **it is a cooling
decision**, and the ~350 K difference between RP-1's and methane's coking
thresholds is the whole argument.

**Would a modern engineer choose it?** Everyone is. BE-4, Archimedes,
Prometheus, Aeon and the Chinese and European methalox programmes all made the
same call in the same decade, largely independently. When six programmes
converge on one propellant, it is usually because a physical constraint left
them no choice, and here the constraint is a wall temperature.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The five-way trade

Every regenerative cooling design is a simultaneous solution of:

1. **Wall temperature** — set by liner alloy strength, creep and LCF life.
2. **Coolant-side wall temperature** — set by the coolant's decomposition
   chemistry. For RP-1 this is usually the binding constraint, not (1).
3. **Pressure drop** — paid in pump discharge pressure, pump power, and
   therefore in cycle margin, turbine temperature or GG flow.
4. **Coolant bulk temperature rise** — the coolant must still be a sane fluid at
   the injector; and for an expander cycle this is the *objective*, not a
   constraint.
5. **Manufacturability** — channel count is bounded by circumference, land width
   by the process, aspect ratio by the cutter or the printer.

Change any one and the other four move. The classic beginner's error is to
optimise (1) alone and discover at CDR that the fuel pump has grown 40 %.

### 7.2 Failure modes

**Coking blockage and burn-through.**
*Mechanism:* hydrocarbon deposits on the coolant-side wall above ~560–590 K,
catalysed by sulfur and by copper/nickel surfaces; the deposit's conductivity is
~1/1000 of copper, so it adds resistance, raises $T_{wc}$, and accelerates its
own deposition (Arrhenius).
*Symptom:* rising jacket $\Delta p$ across the run history at constant flow, and
a hot streak at the throat.
*Evidence:* borescope shows a dark tenacious film; sectioning shows a 10–50 µm
carbon layer; the $\Delta p$/flow characteristic has shifted between tests.
*Fix:* low-sulfur fuel (RP-2 at 0.1 ppm against RP-1's 30 ppm), lower $T_{wc}$
by raising velocity, film-cool to lower the flux, or accept a defined channel
life and inspect.

**Low-cycle fatigue "dog-house" failure.**
*Mechanism:* the hot wall over each channel yields in compression when hot and
in tension on cooldown; after tens to hundreds of cycles it thins, bulges into
the channel (the deformed section looks like a doghouse in cross-section) and
splits along the channel centreline.
*Symptom:* a longitudinal crack at the throat, coolant leaking into the chamber,
a local $c^*$ or mixture-ratio shift.
*Evidence:* sectioned liners show progressive wall thinning and outward bulging
over the channel with no bulging over the land; the RS-25 programme's LCF
database is the reference dataset.
*Fix:* thinner hot wall (lower $\Delta T_w$), higher-conductivity alloy, higher
LCF-capacity alloy (GRCop-84 over NARloy-Z), lower flux, and a defined cycle
life with mandatory retirement.

**Blanching.**
*Mechanism:* cyclic oxidation and reduction of the copper hot-wall surface by
the alternating oxidising and reducing environment near the wall, roughening and
eroding the surface and reducing the effective wall thickness.
*Symptom:* a chalky, matte, light-coloured hot-wall surface (hence the name)
with measurable material loss.
*Evidence:* post-test metallography of the hot face; RS-25 liners show it.
*Fix:* GRCop alloys, which resist it far better than NARloy-Z [GRCop]; a
fuel-rich wall boundary layer; protective coatings.

**Braze or closeout debond.**
*Mechanism:* an unbrazed or poorly electroformed land does not carry the
coolant-to-chamber pressure differential; the hot wall lifts off, forms a
blister, and either bursts into the chamber or blocks the channel.
*Symptom:* a localised hot spot with no corresponding channel geometry defect;
often shows on the first hot fire.
*Evidence:* pre-test ultrasonic or X-ray inspection of the bond line; proof
pressure test to coolant pressure with the chamber vented.
*Fix:* process control on braze and electroforming, 100 % NDE of the bond line,
and a proof test that puts the real $\Delta p$ across the closeout.

**Channel flow maldistribution.**
*Mechanism:* manifold design that does not feed all channels equally, or a
blocked channel from debris or a printing defect. One starved channel at the
throat is a burn-through.
*Symptom:* a single axial hot streak; a thermocouple anomaly at one
circumferential position that repeats across tests.
*Evidence:* cold-flow test of the assembled jacket with per-channel or
sector-resolved instrumentation; thermal paint or phosphor thermography on the
gas side.
*Fix:* manifold redesign with a large plenum-to-channel area ratio, filtration,
and per-channel flow acceptance testing. **Always cold-flow the jacket before
the first hot fire.** [J]

**Film-cooling maldistribution and streaking.**
*Mechanism:* a blocked or misdrilled film orifice, or an injector element whose
spray fan impinges on the wall at near-stoichiometric mixture ratio.
*Symptom:* a discrete axial hot streak starting at the injector face — visually
distinct from a channel-flow streak, which starts at the throat.
*Evidence:* the streak's *origin* is diagnostic; so is thermal paint.
*Fix:* injector rework; see Module 07.

**Supercritical heat-transfer deterioration.**
*Mechanism:* near $T_{pc}$ at high flux and low mass flux, near-wall density
gradients suppress turbulent transport and $h_c$ falls below the Dittus–Boelter
value, sometimes by 2×.
*Symptom:* wall temperatures far above prediction in a narrow band of the
channel, at a specific bulk temperature that moves with power level.
*Evidence:* the anomaly correlates with bulk temperature crossing $T_{pc}$, not
with position.
*Fix:* raise mass flux, move $T_{pc}$ by changing jacket pressure, or reduce
flux locally. Never trust an uncorrected correlation through the pseudo-critical
region.

### 7.3 Materials — why these alloys

- **NARloy-Z (Cu–3Ag–0.5Zr):** the RS-25 liner. Chosen for $k \approx 320$
  W/(m·K) with usable strength to ~800 K. Its weaknesses are LCF life and
  blanching.
- **GRCop-84 / GRCop-42 (Cu–Cr–Nb):** dispersion-strengthened by Cr₂Nb
  precipitates that are stable to high temperature. Better creep, far better
  blanching resistance, and far better LCF life than NARloy-Z, at a modest
  conductivity cost. GRCop-42 is the printable one and is the current AM default
  [GRCop][GradlAM].
- **CuCrZr / C18150:** the commercial equivalent, easier to procure, widely used
  in European and startup hardware.
- **Electroformed nickel:** the RS-25 closeout. Chosen because it can be grown
  conformally over filled channels at any thickness, bonds metallurgically to
  copper, and has good strength. Slow and process-sensitive.
- **Inconel 625 / 718:** the closeout, the jacket, or (in printed engines) the
  entire liner. Excellent strength, weldable and printable, hydrogen-tolerant.
  $k \approx 25$ W/(m·K) is the whole problem.
- **Inconel X-750 / Hastelloy:** the F-1 tube alloys. Drawable to thin wall,
  brazeable, strong hot.
- **Stainless steels (321, 347):** RL10 tubes. Cheap, drawable, brazeable,
  compatible with hydrogen.
- **Silicide-coated niobium (C-103 class):** radiative nozzle extensions to
  ~1600 K. The coating is the life limit; scratch it and the niobium oxidises
  catastrophically.
- **Iridium-lined rhenium:** R-4D-class thrusters to ~2200 K. Expensive, slow to
  make, and worth about 10 s of $I_{sp}$ against coated niobium.
- **3D carbon–carbon (NOVOLTEX/SEPCARB):** the RL10B-2 extension. Very high
  temperature capability, very low density, and it oxidises if it ever sees
  atmospheric oxygen at temperature — which is fine for an upper stage.
- **Silica- and carbon-phenolic:** ablatives. Cheap, forgiving, single-use.

### 7.4 Manufacturing — and what each process limits

| process | limits |
|---|---|
| Tube drawing and forming | minimum wall ~0.3 mm; tube count set by circumference; tapered tubes need a mandrel per contour |
| Furnace brazing | joint quality is the failure mode; requires 100 % NDE; large parts need enormous furnaces |
| Channel milling | minimum land ~0.6–0.8 mm; aspect ratio limited by cutter reach and deflection; slitting saws extend it |
| Electroforming | days per part; bath chemistry controls deposit properties; bond-line defects are the recurring problem |
| L-PBF (GRCop, Inconel) | build volume caps part size; as-printed $R_a$ 10–25 µm roughly doubles $f$; needs HIP and stress relief; part-to-part variation must be flow-tested |
| Blown-powder DED | large parts (metres) at lower resolution; the RAMPT route for big nozzles |
| Composite overwrap | replaces a machined jacket at much lower mass; needs a compatible liner interface |

### 7.5 Testing — what is measured and what it looks like when wrong

- **Jacket cold-flow.** Water or a reference fluid at the design Reynolds
  number, measuring $\Delta p$ versus flow. Yields the friction and loss
  coefficients, and finds blocked channels. **Do this before every first hot
  fire and after any rework.** A channel blockage shows as a $\Delta p$ that is
  high at the same flow; a debond shows as one that is low.
- **Calorimeter chamber.** A short water-cooled chamber, axially segmented into
  circumferential bands, each with its own water flow and inlet/outlet
  thermocouples. $q''$ per band $= \dot m_w c_p \Delta T / A_{band}$. This is
  how $h_g$ profiles are actually measured, and it is the data Bartz gets
  compared against. The signature of a bad injector is a band-to-band flux
  profile that peaks in the barrel rather than at the throat. Watch the CHF
  margin: the calorimeter runs subcritical.
- **Wall thermocouples.** Embedded in the land or brazed to the closeout, never
  in the hot wall over a channel (you would ruin it). They measure a temperature
  from which you must *infer* the hot-wall temperature via a conduction model —
  so the model uncertainty is part of the measurement uncertainty.
- **Coolant inlet/outlet temperature and pressure.** Gives $Q$ directly
  (`coolant_bulk_rise`) and $\Delta p_j$ directly. A rising $\Delta p_j$ across a
  test series at constant flow is the coking signature and is the single most
  useful trend plot in a kerosene engine's test history.
- **Post-test borescope and, eventually, sectioning.** Coking shows as a dark
  tenacious film; blanching as a chalky matte hot face; LCF as
  channel-centreline cracks and doghouse bulges.
- **Proof pressure test.** Coolant pressure applied with the chamber vented,
  which puts the real differential across the closeout bond. Finds debonds
  before they find you.

---

## 8. Misconceptions and what engineers actually care about

**"Better cooling reduces the heat load."** It increases it. Eq. 3.4 has
$T_{aw} - T_b$ in the numerator and the resistance sum in the denominator;
improving the coolant side shrinks the denominator, so $q''$ goes *up*. What
improves is the wall temperature. WE2 shows hydrogen pulling 33 % more heat
through the same wall than RP-1 does. Cooling harder costs more pump work and
more bulk temperature rise, and buys wall life.

**"Regenerative cooling recovers the heat, so it is free."** The enthalpy
recovery is real but tiny — a fraction of a second of $I_{sp}$. The cost is
$\Delta p_j$, which in WE1 is 48 bar, 28 % of the fuel pump discharge pressure
and 0.46 MW of pump power. Regenerative cooling is not free; it is *cheap
compared to the alternatives*.

**"Thicker walls are safer."** Thicker walls are hotter on the gas face and
carry a larger $\Delta T_w$, which is what cracks them. Every generation of
chamber technology has made the hot wall thinner. The floor is set by erosion
allowance, buckling and manufacturing tolerance, never by heat transfer.

**"Copper melts, so copper chambers must run cool."** Copper's melting point
(1358 K) is not the limit; NARloy-Z's *strength and fatigue life* at 800–900 K
is. Liner design limits are set by low-cycle fatigue and creep, hundreds of
kelvin below melting. Conversely, a niobium radiative nozzle runs at 1600 K on
purpose and is nowhere near its own limit.

**"Film cooling is a patch for a bad design."** Almost every successful
high-flux engine uses it, including the F-1 and the Vulcain 2. It is a design
tool with a known, calculable cost (Eq. 3.17). What *is* a bad design is film
cooling used to cover an injector that streaks the wall — that is fixing a
mixing problem with propellant.

**"Ablatives are obsolete."** The RS-68 flew an ablative nozzle until 2024, and
essentially every pressure-fed storable spacecraft engine still uses one. For
finite total burn time with no reuse requirement, ablative is often the lowest
mass, lowest cost and lowest risk answer. It is obsolete only where reuse is
required.

**"Higher chamber pressure is always better."** $h_g \propto p_c^{0.8}$
(Bartz), so heat flux rises almost linearly with $p_c$ while the cooling
capacity available — set by the fuel flow, which also rises only as $p_c$ — does
not improve *per unit area*. Raising $p_c$ makes cooling harder about as fast as
it makes performance better, and past a point the coolant's decomposition
chemistry says no. That point, for RP-1, is roughly where the F-1 and Merlin
sit.

**"A supercritical coolant has no phase change, so its properties are
smooth."** They are not. Crossing the pseudo-critical temperature, methane's
density can fall 3× and its $c_p$ can double over 30 K. Heat-transfer
deterioration near $T_{pc}$ is a documented cause of hardware damage. A
supercritical jacket does not boil, which is a genuine advantage; it does
everything else.

### What engineers actually care about

1. **$T_{wc}$ against the coking limit** — for any hydrocarbon engine this is
   the first number computed and the one that decides whether the architecture
   is viable at all. Everything else is negotiable.
2. **$\Delta T_w$ and the resulting LCF cycle count** — because it is the liner
   life, and liner life is the reuse business case.
3. **$\Delta p_j$ and its effect on the cycle** — because it converts directly
   into pump discharge pressure, turbine power, and either GG flow (an $I_{sp}$
   loss) or preburner temperature (a turbine life loss).
4. **The channel flow distribution** — because a single starved channel is a
   burn-through and no amount of average margin protects against it. This is why
   cold-flow acceptance testing is not optional.
5. **The trend of $\Delta p_j$ across the test history** — the cheapest and most
   informative health monitor a cooled chamber has.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can name the seven cooling methods, say which
heat-flux and duration regime each suits, and identify from a cutaway whether a
chamber is tube-wall, milled-channel or ablative. You can state that heat flux
peaks at the throat, that copper liners exist because of conductivity, that
kerosene cokes and hydrogen does not, and that the RL10's jacket drives its
turbine. You can name two engines for each method.

**Level 2 — Working engineering knowledge.** Given $h_g$, $T_{aw}$, a coolant, a
flow rate and a channel geometry, you can compute $V_c$, $Re_c$, $h_c$, the fin
efficiency, $h_{c,\mathrm{eff}}$, $q''$, $T_{wg}$, $\Delta T_w$, $T_{wc}$,
$dp/dx$ and $\Delta T_b$, with correct units, and say which of the three
resistances dominates and by how much. You can quote typical ranges from memory
(channel count, aspect ratio, hot-wall thickness, jacket $\Delta p$, coking
threshold), state where Dittus–Boelter fails, size a film-cooling flow from a
heat load and convert it to an $I_{sp}$ penalty, and read a jacket $\Delta p$
trend plot and say what it means.

**Level 3 — Interview mastery.** Given an unfamiliar engine — propellants,
chamber pressure, thrust, duty cycle, era, manufacturing base — you can propose
a cooling architecture and defend it against the two obvious alternatives,
identify which constraint binds first and what measurement would confirm it, and
name the historical programme that faced the same problem and what it did. You
can explain why the same engine would be designed differently in 1965, 1985 and
2025 and attribute each difference to a specific change in coolant chemistry,
alloy availability or manufacturing process. You can diagnose a described hot
streak from its axial origin, and you can argue both sides of the
methane-versus-kerosene cooling case with numbers rather than adjectives.

---

## 10. Problems

### Conceptual

**C1.** Explain, in terms of Eq. 3.4, why improving the coolant-side heat
transfer coefficient increases the wall heat flux. Then explain why engineers do
it anyway.

**C2.** The RS-25 uses milled channels in the main combustion chamber and brazed
tubes in the nozzle. Give three physical reasons why the same construction is
not used for both.

**C3.** A colleague proposes doubling the cooling channel height at the throat
to reduce the pressure drop. Identify two effects that will partly or wholly
cancel the intended benefit, and say which dominates for (a) an RP-1-cooled and
(b) a hydrogen-cooled channel.

**C4.** Why does radiative cooling work for a 490 N thruster and not for a
6.8 MN booster throat? Answer with scalings, not with adjectives.

**C5.** The F-1 dumped gas-generator exhaust into its nozzle extension as a film
curtain. Explain why the specific-impulse penalty for this film is essentially
zero, while an injector-face fuel film on the same engine carries a real
penalty.

**C6.** Explain why the closed expander cycle has a thrust ceiling, using the
scaling of heat pickup and required pump power with engine size.

**C7.** A test engineer reports that the jacket pressure drop of a kerosene
engine has risen 8 % over twelve hot fires at constant coolant flow. Give the
most likely cause, the mechanism, and the two measurements you would make next.

**C8.** Why is a transpiration-cooled *injector face* common while a
transpiration-cooled *chamber wall* is not?

### Calculation

**N1.** A regeneratively cooled throat has $h_g = 1.5\times10^{4}$ W/(m²·K),
$T_{aw} = 3500$ K, hot wall 0.8 mm of NARloy-Z ($k_w = 320$ W/(m·K)), coolant
bulk 420 K, and $h_{c,\mathrm{eff}} = 7.0\times10^{4}$ W/(m²·K). Compute $q''$,
$T_{wg}$, $\Delta T_w$ and $T_{wc}$, and give the percentage of the total
resistance contributed by each of the three paths.

**N2.** Repeat N1 with the liner changed to Inconel 718 ($k_w = 25$ W/(m·K)) at
the same 0.8 mm thickness. By how much does $T_{wg}$ change, and what hot-wall
thickness in Inconel would restore the original $T_{wg}$? Comment on whether
that thickness is manufacturable.

**N3.** A channel is 1.6 mm wide by 4.5 mm tall with a 1.3 mm land, in a liner
with $k_w = 300$ W/(m·K). The coolant-side coefficient on the wetted surface is
$5.5\times10^{4}$ W/(m²·K). Compute $m$, $\eta_f$, the area enhancement $\Phi$
(pitch $= w + t_L$) and $h_{c,\mathrm{eff}}$. Then repeat with the channel
height increased to 9.0 mm at the same width, land and $h_c$, and comment.

**N4.** Methane at 220 K and 140 bar ($\rho = 250$ kg/m³, $c_p = 3300$
J/(kg·K), $k = 0.085$ W/(m·K), $\mu = 3.5\times10^{-5}$ Pa·s) flows at 0.18 kg/s
through a channel 1.8 mm by 5.0 mm. Compute $V_c$, $D_h$, $Re_c$, $Pr_c$, $h_c$
by Dittus–Boelter, and $dp/dx$ using $f = 0.184Re^{-0.2}$. Then recompute
$dp/dx$ if the same channel is as-printed with $\epsilon = 18$ µm, using Haaland
(Eq. 3.11).

**N5.** For the RE-500 (see §5), compute the coolant bulk temperature rise if
the total wall heat load is 20.0 MW and the coolant is (a) RP-1 at $c_p = 2280$
J/(kg·K) and $\dot m_f = 52.0$ kg/s; (b) methane at $c_p = 3050$ and
$\dot m_f = 39.8$ kg/s; (c) hydrogen at $c_p = 13{,}600$ and $\dot m_f = 19.4$
kg/s. For each, state whether the exit bulk temperature (inlets 300 K, 120 K and
50 K respectively) violates any limit in §3.11.

**N6.** A chamber barrel is 0.30 m in diameter and 0.60 m long with a design
wall heat flux of 12 MW/m². A fuel film injected at 300 K must survive the first
0.30 m. The fuel has $c_{p,\ell} = 2150$ J/(kg·K), an effective vaporisation
temperature of 505 K and $h_{fg} = 2.9\times10^{5}$ J/kg. Total engine flow is
210 kg/s. Compute the film flow, $x_{fc}$, and the $I_{sp}$ penalty for
$I_{sp,film}/I_{sp,core} = 0.65$ and 0.80. Then apply the entrainment allowance
from Eq. 3.15 and restate.

**N7.** An ablative chamber must survive 480 s of accumulated burn with a throat
recession rate of 0.11 mm/s, a factor of safety of 1.4 and 3.0 mm of residual
virgin material required. Compute the required liner thickness. If the duty
cycle is instead 600 pulses of 0.8 s each, and pulsed recession is 1.6× the
continuous rate, recompute.

**N8.** A radiatively cooled nozzle extension has $\varepsilon_{em} = 0.85$ and
sees $h_g = 220$ W/(m²·K) with $T_{aw} = 2400$ K. Find the equilibrium wall
temperature by solving Eq. 3.19 (iterate). Would silicide-coated niobium
survive? Would carbon–carbon?

**N9.** Using the RL10A-3-3A data in §5/WE4, recompute the jacket enthalpy
pickup if the turbine inlet temperature is only 180 K instead of 220 K, and find
the turbine pressure ratio needed to still deliver 480 kW of shaft power at
$\eta_t = 0.70$, $c_p = 14{,}600$ J/(kg·K), $\gamma = 1.40$. Comment on whether
that pressure ratio is compatible with a 32.8 bar chamber.

### Engineering reasoning

**R1.** You are handed post-test photographs of two chambers. Chamber A has a
single dark axial streak beginning at the injector face and fading before the
throat. Chamber B has a single bright hot streak that begins about 30 mm
upstream of the throat and continues into the divergent section. Diagnose each,
state the mechanism, and give the next measurement you would make.

**R2.** A 250 kN LOX/RP-1 engine is being uprated from 75 bar to 105 bar chamber
pressure with no change to the thrust chamber hardware. Estimate the change in
throat heat flux and in coolant-side wall temperature (state your assumptions),
and give the three design changes you would recommend in priority order.

**R3.** A test series plot shows jacket $\Delta p$ (y-axis) against cumulative
firing time (x-axis) for a kerosene engine. The curve is flat for the first
200 s, then rises with increasing slope. A second engine of the same design,
fired on RP-2 rather than RP-1, stays flat for 900 s. Interpret both curves and
say what you would conclude about the two fuels.

**R4.** Compare the cooling architectures of the RS-68A (regen chamber, ablative
nozzle) and the RS-25 (regen chamber, tube-wall nozzle). Both are LOX/LH2.
Explain why two engines with the same propellants made opposite choices, and say
which you would choose for a *reusable* booster engine and why.

**R5.** A startup proposes a 500 kN methalox engine at 250 bar with an
as-printed Inconel 718 channel-wall chamber, no film cooling, and a claimed
jacket $\Delta p$ of 25 bar. Identify the three claims you find least credible,
say what calculation or test would settle each, and state what you would expect
the real numbers to be.

### Mini trade study

**T1.** You are the chief engineer for a **900 kN, LOX/methane, 180 bar,
booster-stage engine intended for 30 flights between overhauls**. Total burn
time per flight is 160 s. The company has in-house L-PBF (400 mm build volume),
conventional CNC machining, and a vendor relationship for furnace brazing. It
has no electroforming capability and no DED. The throat diameter is
approximately 240 mm.

Four cooling architectures are on the table:

- **(A)** Milled GRCop-42 channel-wall liner with a furnace-brazed Inconel 718
  jacket. No film cooling.
- **(B)** L-PBF GRCop-42 liner in two axial segments (build-volume limited),
  joined by a circumferential weld, with an L-PBF Inconel 718 closeout, plus a
  2 % fuel film from the injector face.
- **(C)** L-PBF Inconel 718 monolithic channel wall, hot wall 0.45 mm, with a
  4 % fuel film from the injector face and a slot film upstream of the throat.
- **(D)** Brazed stainless tube wall, 220 tubes, in a wrapped structural jacket,
  with a 2 % fuel film.

**Constraints.** Coolant-side wall temperature must stay below 900 K. Jacket
$\Delta p$ must not exceed 55 bar. The liner must survive 30 flights with a
factor of 4 on LCF cycles (i.e. demonstrate 120 cycles). Recurring cost matters;
development schedule matters more.

Recommend one architecture. Justify it with at least three quantitative
arguments, state explicitly what you would need to measure or test to confirm
each, and name the strongest argument *against* your recommendation and how you
would mitigate it.

---

## 11. Quiz (100 points)

**Q1 (8 pts).** In a regeneratively cooled throat with a 0.9 mm NARloy-Z hot
wall, which of the three series resistances is normally largest, and roughly
what fraction of the total is it?
(a) gas side, ~40 %  (b) gas side, ~78 %  (c) wall, ~50 %
(d) coolant side, ~60 %

**Q2 (8 pts).** A coolant channel's cross-sectional area is halved at constant
mass flow and aspect ratio. To the nearest sensible figure, by what factors do
$h_c$ and $\Delta p$ change?

**Q3 (12 pts, calculation).** A channel has $h_g = 1.8\times10^{4}$ W/(m²·K),
$T_{aw} = 3560$ K, $t_w = 0.9$ mm, $k_w = 320$ W/(m·K),
$h_{c,\mathrm{eff}} = 8.0\times10^{4}$ W/(m²·K) and $T_b = 400$ K. Compute $q''$
and $T_{wc}$. Does this design satisfy an RP-1 coking limit of 590 K?

**Q4 (8 pts).** Which of these is **not** a reason the RL10 routes hydrogen
through its entire nozzle?
(a) the turbine needs enthalpy  (b) the nozzle provides wetted area
(c) it minimises the jacket pressure drop  (d) the jacket is the power cycle

**Q5 (12 pts, calculation).** A land is 1.4 mm wide and 5.0 mm tall in a liner
with $k_w = 320$ W/(m·K), with $h_c = 6.0\times10^{4}$ W/(m²·K) on the wetted
surface. Compute $m$, $\eta_f$, and — for a 2.0 mm channel width at a 3.4 mm
pitch — the area enhancement $\Phi$ and $h_{c,\mathrm{eff}}$.

**Q6 (8 pts).** The RS-25 nozzle is a 1,080-tube brazed tube wall while its main
combustion chamber is a 390-channel milled copper liner. State the single most
important physical reason for the difference.

**Q7 (12 pts, calculation).** An engine's wall heat load is 22 MW and it is
cooled by 45 kg/s of RP-1 at $c_p = 2280$ J/(kg·K), entering at 305 K. Compute
the exit bulk temperature. Given a coking threshold of 590 K, state whether the
coolant exit condition is acceptable and what you would change.

**Q8 (8 pts, judgment).** A methane cooling channel shows wall temperatures
150 K above prediction, but only over a 60 mm band whose position moves upstream
as power level increases. Name the most likely mechanism and one change that
would confirm the diagnosis.

**Q9 (12 pts, judgment).** You must design a 40 kN, N₂O₄/MMH, 15 bar,
pressure-fed apogee engine with a total accumulated burn time of 3,000 s and no
reuse. Choose a cooling architecture, name the two you rejected, and give one
quantitative reason for each rejection.

**Q10 (12 pts).** The V-2 used roughly 10 % of its fuel as film cooling and
achieved a $c^*$ efficiency of about 94 %. A modern engine with the same
propellants and no film cooling would achieve about 97 %. Explain the connection
between those two facts, and estimate the $I_{sp}$ cost of the V-2's film using
Eq. 3.17 with $I_{sp,film}/I_{sp,core} = 0.7$ and a mixture ratio of 1.6.

---

## 12. Further reading

- **[SP-8087]** *Liquid Rocket Engine Fluid-Cooled Combustion Chambers* (NASA
  SP-8087, 1972). The design monograph for this module: channel sizing,
  coolant-side heat transfer, pressure drop, wall temperature and stress,
  low-cycle fatigue life. Read it for the design *process*, not the materials
  data, which predates GRCop and additive manufacturing entirely.
- **[SP-8124]** *Liquid Rocket Engine Self-Cooled Combustion Chambers* (NASA
  SP-8124, 1977). The complement: ablative, radiation-cooled and
  refractory-metal chambers. This is the reference for everything in §3.2.4 and
  §3.2.5.
- **[HH]** Huzel & Huang, *Modern Engineering for Design of Liquid-Propellant
  Rocket Engines*. Chapter 4 is the classic hands-on treatment of regenerative,
  film, ablative and radiation cooling with worked numbers. Read it alongside
  [SP-8087]; where they differ, [SP-8087] is more careful and [HH] is more
  usable.
- **[SB]** Sutton & Biblarz, *Rocket Propulsion Elements*, the thrust chamber and
  heat transfer chapters. The best single overview of the method-selection logic
  in §3.2, and the source of most of the range tables in §4.
- **[Bergman]** Bergman/Incropera, *Fundamentals of Heat and Mass Transfer*. For
  Dittus–Boelter, Sieder–Tate, fin analysis and the supercritical and boiling
  material in §3.7. Cite the equation and the edition, not just the book.
- **[Bartz57]** Bartz, "A Simple Equation for Rapid Estimation of Rocket Nozzle
  Convective Heat Transfer Coefficients." The gas-side half of every calculation
  in this module. Read the original to see what he actually claimed about
  accuracy — it is more modest than the way the equation is usually quoted.
- **[GRCop]** Ellis & Nathal, *Development of GRCop-84 for Rocket Engine
  Applications*. The conductivity, creep, LCF and blanching data behind §3.12.2
  and §7.3, with a direct comparison against NARloy-Z.
- **[Gradl18]** and **[GradlAM]** — the NASA MSFC hot-fire summary and the
  book-length AM treatment. Read [Gradl18] first for "these have actually been
  fired and here is what happened," then [GradlAM] for process qualification,
  alloy behaviour and NDE.
- **[RAMPT]** NASA's Rapid Analysis and Manufacturing Propulsion Technology
  reports. Where large channel-wall nozzles are going: blown-powder DED plus
  composite overwrap, replacing brazed tube walls.
- **[NIST-WB]** / **[REFPROP]** — the property source for §3.11. Pull the real
  numbers before you design anything; the tables in this module are rounded
  design-study values and are not a substitute.
- **[SLPRE]** Sutton, *History of Liquid Propellant Rocket Engines*. The source
  for Soviet chamber construction practice (§3.12.4) and for the
  architecture-by-era story in §3.15.
- **[SP-4230]** Dawson & Bowles, *Taming Liquid Hydrogen*. Read it for how the
  RL10's cooling-as-power-cycle idea was actually arrived at, which was less
  obvious at the time than it looks now.
