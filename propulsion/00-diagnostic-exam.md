# Diagnostic Entrance Exam

**PROPULSION — a rocket propulsion engineering course**
Sit this *before* reading any module. · **3 hours** · **100 points** · closed book

---

## Instructions

- **SI units throughout.** Answers without units, or with inconsistent units,
  lose marks even when the number is right.
- Constants you may use: $g_0 = 9.80665\ \mathrm{m/s^2}$,
  $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$,
  $p_{\text{amb,SL}} = 101325\ \mathrm{Pa}$,
  $\rho_{\mathrm{LOX}} = 1140\ \mathrm{kg/m^3}$.
  Atomic masses: H 1.008, C 12.011, N 14.007, O 15.999 kg/kmol.
- Calorically perfect gas unless a question says otherwise.
- **Show every step.** Grading is method-first: a correct setup with an
  arithmetic slip loses at most 30 % of that part's marks; a correct number
  from a wrong setup scores zero.
- Where a question asks you to *iterate*, three or four iterations by hand
  are expected and sufficient. State your convergence criterion.
- Real-engine figures quoted here are **approximate**, drawn from widely
  published sources, and are given only to set the scale of an answer.
- No answers appear anywhere in this file. Score yourself with
  [`00-diagnostic-key.md`](00-diagnostic-key.md) *after* you finish.

**Suggested time budget:** A 22 min · B 35 min · C 35 min · D 25 min ·
E 25 min · F 20 min · 18 min review.

---

## Section A — Thermodynamics (15 points)

### A1 — Multiple choice (2 pts)

A rocket exhaust is modelled as a calorically perfect gas of mean molar mass
$\mathcal{M} = 22\ \mathrm{kg/kmol}$. Its specific gas constant $R$ is closest to:

- **(a)** $8.314\ \mathrm{J/(kg\,K)}$
- **(b)** $37.8\ \mathrm{J/(kg\,K)}$
- **(c)** $378\ \mathrm{J/(kg\,K)}$
- **(d)** $287\ \mathrm{J/(kg\,K)}$

### A2 — Multiple choice (2 pts)

Hot gas flows steadily and **adiabatically** down an insulated, constant-area
duct with wall friction. Which statement is correct?

- **(a)** $T_0$ is constant, $p_0$ falls, $s$ rises.
- **(b)** $T_0$ falls, $p_0$ falls, $s$ is constant.
- **(c)** $T_0$ is constant, $p_0$ is constant, $s$ rises.
- **(d)** $T_0$ rises, $p_0$ falls, $s$ rises.

### A3 — Calculation (4 pts)

The same gas has $\gamma = 1.2$ and chamber stagnation conditions
$T_0 = 3400\ \mathrm{K}$, $p_c = 7\ \mathrm{MPa}$.

**(a)** (2 pts) Compute $c_p$ and $c_v$ in $\mathrm{J/(kg\,K)}$.

**(b)** (2 pts) At one station in the nozzle the static temperature is
$T = 2100\ \mathrm{K}$. Compute the local velocity $V$ from the stagnation
enthalpy, and state the assumption that makes your calculation valid.

### A4 — Calculation (4 pts)

A hot-fire test of the nozzle above measures an exit static temperature of
$T_e = 1450\ \mathrm{K}$ at an exit static pressure of
$p_e = 26.63\ \mathrm{kPa}$. Chamber conditions are $T_0 = 3400\ \mathrm{K}$,
$p_c = 7\ \mathrm{MPa}$; take $c_p$ and $R$ from A3.

**(a)** (2 pts) Compute the specific entropy change $s_e - s_0$ across the
nozzle in $\mathrm{J/(kg\,K)}$.

**(b)** (2 pts) Compute the exit temperature the flow *would* have reached
had the expansion to the same $p_e$ been isentropic, and from it the nozzle
efficiency $\eta_n = (T_0 - T_e)/(T_0 - T_{e,s})$.

### A5 — Short answer (3 pts)

The entropy rise you found in A4 is small — a few percent of $c_p$. In one
short paragraph, say (i) what physical processes generate it in a real
nozzle, and (ii) what that entropy generation costs the engine in a quantity
a propulsion engineer is paid to care about. Be specific: name the quantity
and say whether it goes up or down.

---

## Section B — Compressible flow (20 points)

Unless stated otherwise, Section B uses the chamber gas of Section A:
$\gamma = 1.2$, $\mathcal{M} = 22\ \mathrm{kg/kmol}$,
$T_0 = 3400\ \mathrm{K}$, $p_c = 7\ \mathrm{MPa}$.

### B1 — Multiple choice (2 pts)

The speed of sound at the *throat* of this engine is closest to:

- **(a)** $340\ \mathrm{m/s}$
- **(b)** $880\ \mathrm{m/s}$
- **(c)** $1180\ \mathrm{m/s}$
- **(d)** $1750\ \mathrm{m/s}$

### B2 — Derivation (5 pts)

Starting from **steady one-dimensional continuity**, the **isentropic
momentum (Euler) equation**, and the **definition of the speed of sound**,
derive the differential area–velocity relation

$$\frac{dA}{A} = (M^2 - 1)\,\frac{dV}{V}$$

and then derive the integrated area–Mach relation

$$\frac{A}{A^{*}} = \frac{1}{M}\left[\frac{2}{\gamma+1}\left(1 + \frac{\gamma-1}{2}M^{2}\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}.$$

State clearly (i) every assumption you use, and (ii) what the first result
tells you about why a nozzle must have a throat to reach supersonic exit
velocity.

### B3 — Calculation (5 pts)

The nozzle has an area ratio $\varepsilon = A_e/A_t = 25$ and flows full
(no separation, no shocks inside).

**(a)** (3 pts) Find the exit Mach number $M_e$ by iterating the area–Mach
relation. Report $M_e$ to three significant figures and show your iterates.

**(b)** (2 pts) From $M_e$, compute the exit static pressure $p_e$, the exit
static temperature $T_e$, and the exit velocity $V_e$.

### B4 — Calculation (4 pts)

The throat diameter is $D_t = 0.200\ \mathrm{m}$.

**(a)** (3 pts) Compute the choked mass flow rate $\dot{m}$ in $\mathrm{kg/s}$.

**(b)** (1 pt) The engine is throttled by dropping $p_c$ to $4.9\ \mathrm{MPa}$
with $T_0$ and gas properties unchanged. What is the new $\dot{m}$? Answer
without repeating the full calculation, and justify in one sentence.

### B5 — Multiple choice and short answer (4 pts)

**(a)** (1 pt) A normal shock stands in the diverging section of a nozzle.
Across it, which set of changes is correct?

- **(a)** $p$ ↑, $p_0$ ↓, $T_0$ constant, $s$ ↑
- **(b)** $p$ ↑, $p_0$ constant, $T_0$ ↓, $s$ ↑
- **(c)** $p$ ↓, $p_0$ ↓, $T_0$ constant, $s$ ↑
- **(d)** $p$ ↑, $p_0$ ↓, $T_0$ ↑, $s$ constant

**(b)** (1 pt) The nozzle of B3 is fired at sea level. Compute $p_e/p_{amb}$
and state whether it is under-expanded, over-expanded, or perfectly expanded.

**(c)** (2 pts) A common approximate criterion for flow separation in a
conical or bell nozzle is that separation occurs when $p_e$ falls below
roughly $0.3$–$0.4\,p_{amb}$. Applying it to your answer in (b), say what
the flow inside this nozzle would actually do at sea level, and name one
consequence for the hardware that a designer would have to worry about.

---

## Section C — Rocket performance (20 points)

### C1 — Multiple choice (2 pts)

For a fixed $p_c$, $T_0$, gas, and throat area, an engine's nozzle is
lengthened so $\varepsilon$ increases. Operating in **vacuum**, as
$\varepsilon \to \infty$:

- **(a)** momentum thrust → constant, pressure thrust → 0, total thrust → a finite limit
- **(b)** momentum thrust → a finite limit, pressure thrust → 0, total thrust → that same finite limit
- **(c)** momentum thrust → ∞, pressure thrust → 0, total thrust → ∞
- **(d)** momentum thrust → a finite limit, pressure thrust → a finite non-zero value, total thrust → their sum

### C2 — Calculation (7 pts)

Use the engine of Sections A–B: $\gamma = 1.2$,
$\mathcal{M} = 22\ \mathrm{kg/kmol}$, $T_0 = 3400\ \mathrm{K}$,
$p_c = 7\ \mathrm{MPa}$, $D_t = 0.200\ \mathrm{m}$, $\varepsilon = 25$.
Assume ideal one-dimensional flow, **flowing full**.

**(a)** (2 pts) Compute the characteristic velocity $c^{*}$ in $\mathrm{m/s}$.

**(b)** (2 pts) Compute the thrust coefficient $C_F$ in **vacuum** and at
**sea level**.

**(c)** (2 pts) Compute vacuum thrust, sea-level thrust, and vacuum and
sea-level $I_{sp}$ in seconds.

**(d)** (1 pt) In light of your answer to B5(c), state in one sentence how
much you would trust the sea-level number you just computed, and why.

### C3 — Calculation (5 pts)

A two-stage vehicle has, at lift-off, a total mass of
$480{,}000\ \mathrm{kg}$, made up of:

| item | mass (kg) |
|---|---|
| stage 1 propellant | 350,000 |
| stage 1 dry (structure, engines, residuals) | 25,000 |
| stage 2 propellant | 90,000 |
| stage 2 dry | 10,000 |
| payload | 5,000 |

Stage 1 has an effective (mission-average) $I_{sp} = 300\ \mathrm{s}$;
stage 2 has $I_{sp} = 350\ \mathrm{s}$. Ignore gravity and drag losses.

**(a)** (3 pts) Compute the ideal $\Delta v$ of each stage and the total.

**(b)** (2 pts) Now suppose the same total propellant ($440{,}000\ \mathrm{kg}$)
and the same total dry mass ($35{,}000\ \mathrm{kg}$) were flown as a
single stage at $I_{sp} = 350\ \mathrm{s}$ throughout. Compute its ideal
$\Delta v$ and explain, in one sentence tied to the Tsiolkovsky equation,
why staging wins despite the single stage having the *higher* $I_{sp}$ for
the whole burn.

### C4 — Calculation (3 pts)

You must size an upper-stage engine for $F_{vac} = 100\ \mathrm{kN}$ at
$I_{sp,vac} = 340\ \mathrm{s}$, with $c^{*} = 1780\ \mathrm{m/s}$ and
$p_c = 5.5\ \mathrm{MPa}$.

**(a)** (1 pt) Required propellant mass flow rate $\dot{m}$.

**(b)** (2 pts) Required throat area $A_t$ and throat diameter $D_t$.

### C5 — Short answer (3 pts)

Define, in one sentence each and with units, the three quantities $c^{*}$,
$C_F$, and $c$ (effective exhaust velocity), and give the identity that
links them. Then answer: **why does the field bother splitting performance
into $c^{*}$ and $C_F$ at all,** rather than just quoting $I_{sp}$? Name what
each of the two isolates, and what a test engineer does with that split when
a hot fire underperforms.

---

## Section D — Thermochemistry (15 points)

### D1 — Calculation (4 pts)

RP-1 is modelled as a single hydrocarbon of formula $\mathrm{CH_{1.953}}$.
The oxidiser is liquid oxygen, $\mathrm{O_2}$.

**(a)** (1 pt) Write the balanced stoichiometric (complete-combustion)
reaction of $\mathrm{CH_{1.953}}$ with $\mathrm{O_2}$ to $\mathrm{CO_2}$ and
$\mathrm{H_2O}$.

**(b)** (3 pts) Compute the stoichiometric mass mixture ratio
$(O/F)_{st}$. Show the molar masses you use.

### D2 — Calculation (3 pts)

The F-1 engine burned LOX/RP-1 at a mixture ratio of approximately
$O/F \approx 2.27$ (approximate, widely published).

**(a)** (2 pts) Compute the equivalence ratio $\phi$ using your
$(O/F)_{st}$ from D1. State whether the engine ran fuel-rich or
oxidiser-rich.

**(b)** (1 pt) Per kilogram of *total* propellant, how many kilograms of
fuel are in excess of stoichiometric?

### D3 — Multiple choice (2 pts)

Two LOX/RP-1 chambers run at the same mixture ratio and same propellant
inlet temperature, one at $p_c = 3\ \mathrm{MPa}$ and one at
$p_c = 20\ \mathrm{MPa}$. Compared with the 3 MPa chamber, the 20 MPa
chamber's adiabatic flame temperature is:

- **(a)** identical — flame temperature is a function of mixture ratio only
- **(b)** noticeably lower, because higher pressure suppresses reaction rates
- **(c)** modestly higher, because higher pressure suppresses dissociation and returns that energy to the gas
- **(d)** much higher, roughly in proportion to the pressure ratio

### D4 — Short answer (6 pts)

**(a)** (3 pts) At $3600\ \mathrm{K}$ a LOX/RP-1 combustion product mixture
contains appreciable CO, H, OH, O and H₂ alongside CO₂ and H₂O. Explain what
dissociation is, why it becomes important at these temperatures, what it does
to the chamber temperature, and — importantly — what happens to that
dissociation energy as the gas expands down a long nozzle.

**(b)** (3 pts) For LOX/RP-1 the *stoichiometric* mixture ratio is what you
computed in D1, yet real engines run near $O/F \approx 2.3$–$2.8$. Give the
two distinct physical reasons the $I_{sp}$-optimum is fuel-rich, and name a
third, non-performance reason a designer might push further fuel-rich still.

---

## Section E — Heat transfer, fluids, and structures (15 points)

### E1 — Calculation (4 pts)

The combustion chamber of Section A is a thin-walled cylinder of internal
radius $r_i = 0.225\ \mathrm{m}$ operating at $p_c = 7\ \mathrm{MPa}$.
Neglect the pressure outside.

**(a)** (2 pts) For a wall thickness $t = 8.0\ \mathrm{mm}$, compute the hoop
(circumferential) and longitudinal stresses.

**(b)** (2 pts) The wall is Inconel 718 with a yield strength of
approximately $1100\ \mathrm{MPa}$ at the relevant temperature. Compute the
minimum wall thickness for a factor of safety of 1.5 on yield against hoop
stress, and state one reason the real chamber wall is thicker than that.

### E2 — Calculation (5 pts)

A regeneratively cooled throat has a wall of copper alloy,
$k = 350\ \mathrm{W/(m\,K)}$, thickness $t = 0.90\ \mathrm{mm}$. The
gas-side adiabatic wall (recovery) temperature is
$T_{aw} = 3200\ \mathrm{K}$ with a gas-side film coefficient
$h_g = 25{,}000\ \mathrm{W/(m^2 K)}$. The coolant-side wall surface is held
at $T_{wc} = 700\ \mathrm{K}$.

**(a)** (3 pts) Compute the steady heat flux $q''$ through the wall in
$\mathrm{MW/m^2}$, treating the gas film and the wall as thermal
resistances in series.

**(b)** (1 pt) Compute the gas-side wall temperature $T_{wg}$ and the
temperature drop across the wall.

**(c)** (1 pt) Your $T_{wg}$ should come out much closer to $T_{wc}$ than to
$T_{aw}$. Say in one sentence which resistance dominates, and what design
lever that fact hands the engineer.

### E3 — Calculation (4 pts)

The engine of Sections A–C runs at $O/F = 2.40$ with total
$\dot{m} = 125.8\ \mathrm{kg/s}$. The LOX side of the injector has 300
identical circular orifices with discharge coefficient $C_d = 0.75$ and an
injection pressure drop of $\Delta p = 1.40\ \mathrm{MPa}$.
Take $\rho_{\mathrm{LOX}} = 1140\ \mathrm{kg/m^3}$.

**(a)** (1 pt) Compute the oxidiser mass flow rate $\dot{m}_{ox}$.

**(b)** (3 pts) Using the incompressible orifice equation, compute the
required area and diameter of one orifice, in mm.

### E4 — Short answer (2 pts)

Using your E2 result, explain why a thin, high-conductivity liner is
*structurally* attractive even though it is a weaker material than the
superalloy jacket behind it. Your answer must mention thermal stress and
what it scales with.

---

## Section F — Propulsion literacy (15 points)

### F1 — Cycle identification (4 pts, 1 each)

Name the engine power cycle each description matches. Choose from:
*pressure-fed, gas-generator, staged combustion (fuel-rich), staged
combustion (oxidiser-rich), full-flow staged combustion, expander,
expander bleed, electric pump-fed.*

**(a)** A small fraction of both propellants is burned very fuel-rich in a
separate device; the resulting warm gas drives the turbine and is then dumped
overboard through a duct that produces a visible dark exhaust plume of its
own. Chamber pressure is limited mostly by how much flow the designer is
willing to throw away.

**(b)** No combustion occurs upstream of the turbine at all. The fuel is
heated by picking up heat from the chamber and nozzle walls, expands through
the turbine as a gas, and is then injected and burned in the chamber. The
cycle's achievable chamber pressure is bounded by the surface area available
to pick up heat.

**(c)** *All* of the fuel and *all* of the oxidiser pass through preburners —
one fuel-rich driving the fuel turbopump, one oxidiser-rich driving the
oxidiser turbopump — and both turbine exhausts enter the main chamber. No
propellant is dumped, and the two turbopumps share no rotating seal between
dissimilar fluids.

**(d)** There is no turbine and no gas generator. Tank pressure alone drives
the propellants into the chamber, so the tanks must be built to withstand
more than chamber pressure. Simple, restartable, and heavy — which is why it
is found on upper stages, RCS, and landers rather than boosters.

### F2 — Reading described data (4 pts)

**(a)** (2 pts) *A plot of vacuum $I_{sp}$ (s) against nozzle area ratio
$\varepsilon$ for a fixed chamber and gas. The curve rises steeply from
$\varepsilon = 5$ to about $\varepsilon = 40$, gaining roughly 40 s, then
flattens: from $\varepsilon = 80$ to $\varepsilon = 200$ it gains under 8 s,
and the curve is still rising, with no maximum, at the right-hand edge of
the plot.*

Explain the shape: why the steep rise, why the flattening, and why there is
no maximum. Then state what, in the real world, actually stops a designer
from choosing $\varepsilon = 400$ on a vacuum stage.

**(b)** (2 pts) *A thrust-versus-time trace from a solid rocket motor static
firing. Thrust rises to about 1.6 MN in 0.25 s, decays smoothly and almost
linearly to about 1.1 MN over the next 105 s, then falls to zero over a
further 8 s with a long concave tail.*

Name the grain-geometry behaviour this trace indicates (progressive,
neutral, or regressive), justify it from the trace, and explain physically
what produces the long tail at the end.

### F3 — Subsystem naming (3 pts)

*Description of a liquid engine flow path:* liquid oxygen leaves the tank,
passes a valve that is opened once and never closed in flight, is raised in
pressure by a rotating machine driven off a common shaft, passes a device
that meters and atomises it into the chamber, mixes and burns; the hot gas
passes through a converging–diverging duct; meanwhile fuel from its tank is
routed through passages in the wall of that duct before reaching the same
metering device.

Name the numbered subsystems (one term each):
1. the "opened once and never closed" valve,
2. the rotating machine raising propellant pressure,
3. the device that meters and atomises,
4. the passages in the duct wall carrying fuel,
5. the flow arrangement in which fuel cools the wall and is *then* burned,
6. the point of minimum area in the converging–diverging duct.

### F4 — Engineering judgment (4 pts)

**(a)** (2 pts) An engine's hot-fire data shows measured $c^{*}$ at 94 % of
the CEA-predicted value, while the measured $C_F$ is 98 % of its ideal
value. Where in the engine is the problem, and name two specific physical
causes consistent with that signature. What would you change first?

**(b)** (2 pts) Two upper-stage options for the same mission: a pressure-fed
storable bipropellant at $I_{sp} \approx 320\ \mathrm{s}$, and a
pump-fed LOX/LH₂ expander at $I_{sp} \approx 450\ \mathrm{s}$ (both
approximate). The mission requires four restarts after coast periods of up
to 18 hours. Give the two strongest arguments *against* the higher-$I_{sp}$
option for this specific mission, and say what additional piece of
information would decide the trade for you.

---

*End of exam. Total: 100 points.*

*Score with [`00-diagnostic-key.md`](00-diagnostic-key.md), which also
contains the study-plan mapping: which foundations modules your score says
you may skim and which you must work through.*
