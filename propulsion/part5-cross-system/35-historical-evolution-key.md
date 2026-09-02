# Module 35 — Historical evolution of rocket propulsion — answer key

All numerical results below were computed with `tools/rocket.py`; the registered
cases are in `tools/examples/35.py` and can be re-run with
`python3 tools/check_examples.py`. $g_0 = 9.80665$ m/s²,
$R_u = 8314.46$ J/(kmol·K). Propellant thermochemistry uses the module 05 §4.3
equilibrium table so that every module in the course quotes the same $c^*$.

---

## K1. Problem solutions

### Conceptual

**C1 — film cooling across three eras.**

The film-cooling fraction is set by how much heat the *wall* can pass to the
regenerative coolant without exceeding its own temperature limit. Three
distinct mechanisms reduced it:

- **V-2 → tube-wall/kerolox engines.** The V-2 has a double-wall mild-steel
  chamber: the coolant annulus gap is a manufacturing tolerance, so coolant
  velocity is neither uniform nor high where it needs to be, and mild steel has
  both low conductivity and a low allowable temperature. A brazed tube wall
  makes each coolant passage a designed cross-section, so coolant velocity —
  and hence $h_{coolant}$ through Dittus–Boelter's $Re^{0.8}$ — is highest at
  the throat where $q$ peaks. More of the flux is carried regeneratively, so
  less fuel is diverted to the film.
- **Tube wall → milled-channel copper alloy (RS-25).** NARloy-Z's conductivity
  is roughly an order of magnitude above a nickel alloy's, so the through-wall
  $\Delta T = qt/k$ collapses for the same flux and the hot-gas-side wall
  temperature drops. That permits ~100 MW/m² at 206 bar with a small film
  fraction.
- **Radiation-cooled niobium → iridium-lined rhenium (R-4D class).** Here there
  is *no* regenerative circuit; the wall runs at radiation equilibrium.
  Rhenium's much higher allowable temperature raises that equilibrium point, so
  less fuel needs to be dumped along the wall to hold the niobium below its
  limit.

$I_{sp}$ consequence: film coolant is propellant burned at a locally very fuel-
rich mixture ratio near the wall, so it contributes far less than average to
$c^*$. The V-2's ~10 % film fraction is a large part of why its $\eta_{c^*}$ is
~94 %; the RS-25 sits near 99 %; the rhenium R-4D variants gain roughly
10–15 s over the niobium originals. Full marks require naming the mechanism
(conductivity, coolant velocity, allowable wall temperature) rather than
"better cooling".

**C2 — enabler classification.**

| transition | enabler | class | note |
|---|---|---|---|
| (a) double wall → brazed tube wall | furnace brazing of thin-wall tapered tubes with controlled fillets | **manufacturing** | genuinely enabling: without a reliable braze the chamber leaks on the first thermal cycle |
| (b) GG → ORSC | alloys and passivating coatings that survive hot high-pressure oxygen | **materials** | the clearest materials-gated architecture in the field |
| (c) segmented steel → monolithic composite | large-mandrel filament winding and single-cast 140-tonne grains | **manufacturing** | but only where transport permits — the constraint that forced segmentation is a road/rail width, not physics |
| (d) GN₂ → self-pressurising R-236fa | refrigerant selection plus micro-valves and blowdown-tolerant thrusters | **propellant** (with a manufacturing rider) | the driver is launch-safety review and volume, not performance |
| (e) RS-25 → RS-68 | **none** — this is a *choice* | economics | nothing prevented Rocketdyne building another staged-combustion engine; they were told to build a cheap one |

Award marks for (e) being identified as a choice. Students who invent an
enabler for it have missed the module's central discipline.

**C3 — four chambers versus one.**

The driver is **combustion instability**, specifically the frequency of the
transverse acoustic modes of the chamber. For a cylindrical chamber the first
tangential mode frequency scales as $f \sim a/D$ with $a$ the chamber speed of
sound and $D$ the diameter. A large chamber therefore has its dangerous modes
at *low* frequency, where the propellant vaporisation and mixing response has
its largest gain — the Crocco time-lag $n$–$\tau$ picture in module 15 — so
coupling is easy and destructive. Four chambers of half the diameter put those
modes at roughly twice the frequency and much lower response gain.

The Soviets bought stability with plumbing: one turbopump, four chambers, more
joints and manifolds, more inert mass, but a design that worked on schedule in
1957. The Americans bought it with **analysis and test**: on the order of two
thousand full-scale F-1 injector configurations with bomb-pulsed stability
rating, producing both a stable engine and the design methodology that became
[SP-194]. Both are correct answers to the same problem; the difference is what
each programme had more of — hardware time or money.

**C4 — why kerosene goes ox-rich and hydrogen goes fuel-rich.**

- **Kerosene fuel-rich preburner → coking.** At preburner temperatures a
  fuel-rich hydrocarbon stream pyrolyses; the heavy fragments deposit solid
  carbon on turbine blades, in hot-gas manifolds and on injector faces. The
  deposit changes turbine efficiency and blocks passages, and it accumulates
  irreversibly. An **oxygen-rich** stream cannot coke because there is no
  surplus carbon-bearing fuel to pyrolyse. Hence RD-253, RD-170/180/191,
  NK-33, YF-100, BE-4 are all oxidiser-rich.
- **Hydrogen ox-rich preburner → no benefit, all cost.** Hydrogen does not
  coke, so the coking argument disappears; meanwhile fuel-rich hydrogen drive
  gas is extremely low molar mass, which makes it an excellent turbine working
  fluid (high $c_p$, high specific work per unit mass), and it avoids the
  oxygen-compatibility problem entirely. Hence RS-25, RD-0120, LE-7 are all
  fuel-rich.

A complete answer names *pyrolysis/carbon deposition* on one side and *turbine
working-fluid molar mass plus oxygen compatibility* on the other.

**C5 — LE-7A and Vulcain 2.1.**

- **LE-7A** dropped from 127 to 120 bar following the H-II Flight 8 loss, which
  was traced to an LH2 turbopump inducer failure. Lower chamber pressure means
  lower pump discharge pressure and lower suction-side loading, i.e. margin
  bought by giving back performance. Reliability-driven de-rating.
- **Vulcain 2.1** is a *manufacturing* redesign of the nozzle — roughly 90 %
  fewer parts and 40 % lower cost — and it produces 1,324 kN against Vulcain
  2's 1,359 kN. The programme accepted 2.6 % less thrust to make the part
  cheaper and faster to build.

The principle: **"newer" tracks the objective function, not the performance
axis.** When the objective becomes reliability or cost, later hardware can and
should be less capable on the performance axis than what it replaces. Any
answer that treats these as anomalies or errors has missed the point.

**C6 — three arguments against 500 bar by 2040.**

1. **Throat heat flux.** Bartz gives $h_g \propto p_c^{0.8}$, so $q$ at the
   throat rises nearly linearly with $p_c$. At 206 bar the RS-25 is already at
   order 100 MW/m² and needs a thin, high-conductivity copper alloy whose
   life is set by low-cycle fatigue driven by the through-wall $\Delta T$.
   Doubling $p_c$ roughly doubles $q$ and therefore $\Delta T$ at fixed wall
   thickness, and LCF life falls far faster than linearly.
2. **Turbomachinery.** Pump discharge pressure must exceed $p_c$ by the
   injector and jacket drops, so 500 bar chamber means roughly 700 bar
   discharge. Impeller tip speed, bearing DN, seal $\Delta p$ and shaft power
   all rise together; the RS-25's HPFTP already delivers 53 MW at 35,000 rpm
   and its development failures were bearings and rotordynamics.
3. **Oxygen compatibility.** In an ORSC or FFSC engine the ox-rich gas
   temperature and pressure both rise with $p_c$, and metal ignition in oxygen
   is a pressure- and temperature-thresholded process. There is a wall here
   that is chemical, not structural, and it does not yield to thicker parts.

Any three of: heat flux/LCF, turbomachinery, oxygen compatibility, injector
$\Delta p$ (which scales with $p_c$ and hence pump work), and start-transient
control. Marks for naming the *saturating quantity*, not for listing "it's
hard".

**C7 — geometric versus material fixes.**

The joint rotated open under ignition pressurisation; the O-ring's job was to
extrude into a gap that was opening faster than the elastomer could follow at
low temperature. The fix — a capture feature on the tang that mechanically
limits rotation — removes the *displacement*, so the seal is no longer
rate-critical. Replacing the elastomer with a better one would have raised the
temperature at which the same mechanism bites, not removed it.

Liquid-engine analogue: LOX-post failures in the RS-25 main injector. Treating
them as a materials problem (a stronger post) leaves the driving mechanism —
flow-induced vibration of the post in the hot-gas crossflow — intact; the
effective fix changed the flow and the support, not the alloy. Any answer that
names a mechanism-versus-symptom pair with a displacement or flow driver is
acceptable.

**C8 — cold gas losing and winning.**

What changed is the **constraint set**, not the physics.

- In the 1960s the vehicle was large and crewed, the $\Delta v$ budgets were
  tens to hundreds of m/s, and the operator had a full hazardous-processing
  infrastructure. At those $\Delta v$ values the exponential in the rocket
  equation makes a 4× $I_{sp}$ advantage decisive, and the toxicity cost is
  absorbed by an organisation that is already handling hypergolics.
- In the 2010s the vehicle is a 6U CubeSat flying as somebody else's secondary
  payload. The binding constraints are launch-safety review, volume, and
  integration, and the $\Delta v$ requirement is tens of m/s. A liquefied
  refrigerant at 2.7 bar in a thin-walled can beats a 200-bar COPV and beats a
  hypergolic system on every axis except $I_{sp}$, and $I_{sp}$ is not binding.

The general principle: **propellant selection optimises the system, not the
thruster.** State it explicitly for full marks.

---

### Calculation

**N1 — LOX/RP-1 area-ratio effect.**

$R = 8314.46/23.3 = 356.8$ J/(kg·K), $\Gamma(1.15) = 0.6387$, so

$$c^* = \frac{\sqrt{356.8 \times 3670}}{0.6387} = 1{,}791.9\ \mathrm{m/s}$$

Vacuum thrust coefficients: $C_F(\varepsilon = 8) = 1.7409$,
$C_F(\varepsilon = 36.87) = 1.9332$. Hence ideal vacuum $I_{sp}$:

- $\varepsilon = 8$: $1791.9 \times 1.7409/9.80665 = \mathbf{318.1\ s}$
- $\varepsilon = 36.87$: $1791.9 \times 1.9332/9.80665 = \mathbf{353.2\ s}$

Ideal difference **35.1 s**; published difference (H-1 289 s vac, RD-180 338 s
vac) **49 s**. The residual is +13.9 s, and it decomposes as:

- **Efficiency.** $289/318.1 = 0.908$ for the H-1; $338/353.2 = 0.957$ for the
  RD-180. The H-1 is an open gas-generator engine that dumps 2–3 % of its
  propellant through the turbine at very low $I_{sp}$, and it runs at
  $r = 2.23$ against the table's 2.65, so its real $c^*$ is below the table
  value. The RD-180 is closed-cycle: no dumped flow.
- **Chamber pressure through $c^*$.** The table is a single-pressure
  equilibrium calculation; at 267 bar dissociation is suppressed relative to
  48 bar, worth a further ~1 %.

The lesson for full marks: **roughly 70 % of the published gain is area ratio
and 30 % is cycle closure plus efficiency.** Nothing in it is chamber pressure
acting directly.

**N2 — F-1 throat area from a contested $p_c$.**

$C_F$ at $\varepsilon = 16$, $\gamma = 1.15$, $p_a = 101{,}325$ Pa:

| $p_c$ | bar | $C_F$ (SL) | $A_t = F/(p_c C_F)$ | $D_t$ |
|---|---|---|---|---|
| 965 psia | 66.5 | 1.5938 | 0.6384 m² | 0.902 m |
| 1,125 psia | 77.6 | 1.6285 | 0.5360 m² | 0.826 m |

Area ratio between the two: 1.191, so **throat diameter differs by 9.1 %**.

Verdict: yes, that matters. A 9 % error in throat diameter is a 9 % error in
every dimension that scales with it — chamber length via $L^*$, injector face
area, coolant channel count — and it propagates into mass. A preliminary sizing
exercise done with the wrong end of this range will be wrong in a way that is
not recoverable by later refinement, which is exactly why
`_verify-liquid.md` recommends printing ≈70 bar with the range footnoted rather
than silently picking one.

**N3 — P241 versus P120C.**

$\zeta_{P241} = 241{,}000/274{,}000 = \mathbf{0.8796}$;
$\zeta_{P120C} = 141{,}400/153{,}000 = \mathbf{0.9242}$.

*With their own propellant loads*, above 40,000 kg of upper stack at
$I_{sp} = 280$ s:

- P241: $m_0 = 241{,}000 + 33{,}000 + 40{,}000 = 314{,}000$ kg,
  $m_f = 73{,}000$ kg → $\Delta v = \mathbf{4{,}006\ m/s}$.
- P120C: $m_0 = 193{,}000$ kg, $m_f = 51{,}600$ kg →
  $\Delta v = \mathbf{3{,}622\ m/s}$.

*With a common 141,400 kg load*:

- at $\zeta = 0.8796$: $m_i = 19{,}362$ kg → $\Delta v = \mathbf{3{,}346\ m/s}$
- at $\zeta = 0.9242$: $m_i = 11{,}600$ kg → $\Delta v = \mathbf{3{,}622\ m/s}$

difference **+276 m/s**.

Why the comparisons look different: the first comparison is confounded by size
— P241 carries 70 % more propellant, and propellant load dominates $\Delta v$
far more than mass fraction does, so the *worse* motor "wins". Only the second
comparison isolates the architectural variable. Full marks require saying that
the first comparison answers a different question (which stage is bigger) than
the one asked (which architecture is better).

**N4 — frontier rates.**

$k = \ln(p_2/p_1)/(t_2 - t_1)$:

- 1942 → 1963: $\ln(147/15.2)/21 = \mathbf{0.1081\ yr^{-1}}$, doubling time
  **6.4 yr**.
- 2000 → 2021: $\ln(300/267)/21 = \mathbf{0.0055\ yr^{-1}}$, doubling time
  **124.9 yr** — and on a claimed endpoint at that.

Extrapolating the early rate to 267 bar: $t = 1942 + \ln(267/15.2)/0.1081 =
\mathbf{1968.5}$. The 1942–63 rate predicts a 267-bar engine in **1968**; the
first one flew in **2000**, thirty-two years late. Chamber pressure is a
saturating process and the early rate has no predictive value.

**N5 — SAFER implied $I_{sp}$.**

$$I_{sp} \approx \frac{\Delta v\, m}{m_p g_0} = \frac{3.05 \times 180}{1.4 \times 9.80665} = \mathbf{40.0\ s}$$

(using the small-$\Delta v$ approximation $\Delta v \approx I_{sp} g_0 m_p/m$,
which is accurate to better than 0.5 % here since $m_p/m < 0.01$).

Frozen ideal for N₂ at $T_0 = 300$ K, $\varepsilon = 50$ is **76.8 s**, so
SAFER realises **52 %** of ideal, against the ~90 % rule of thumb for a
steady-flow cold-gas thruster. Loss mechanisms, ranked:

1. **Pulse-mode operation.** SAFER fires millisecond bursts. Fill and blowdown
   of the valve and plenum dead volume happens at every pulse, and that gas
   leaves at far below nozzle-design conditions. This dominates.
2. **Heat transfer from the wall into the expanding gas is negative work** —
   the gas cools rapidly, the wall is warm, and at low Reynolds number in a
   small nozzle the thermal boundary layer occupies a large fraction of the
   throat.
3. **Low Reynolds number viscous losses.** A small, low-$\varepsilon$ thruster
   has a discharge coefficient and a divergence loss both worse than a
   large one.
4. **Realistic $\varepsilon$ below 50**, which alone would take 76.8 s down
   towards 75 s at $\varepsilon = 20$ — a small effect relative to the others.

The teaching point: the ~90 % factor applies to steady flow. Pulse-mode
thrusters do much worse, and MMU's published numbers do not close for
precisely this reason.

**N6 — a 1965 storable engine.**

$R = 8314.46/22.0 = 377.9$ J/(kg·K), $\Gamma(1.17) = 0.6427$,
$c^* = \sqrt{377.9 \times 3390}/0.6427 = 1{,}761.3$ m/s.

$C_F(\varepsilon = 15, p_c = 59\ \mathrm{bar}, p_a = 101{,}325) = 1.5553$;
vacuum $C_F = 1.8130$.

- Ideal: 279.3 s SL, 325.6 s vacuum.
- With $\eta_{c^*} = 0.96$: **268.2 s SL, 312.6 s vacuum.**
- Published LR87-AJ-11: **250 s SL, 302 s vacuum.**

Residual: −18.2 s at sea level, −10.6 s in vacuum, i.e. the model over-predicts
by 7 % and 3.5 %. What the residual tells you:

- The sea-level residual is much larger than the vacuum one, which points at
  **nozzle** effects rather than combustion: at $\varepsilon = 15$ and 59 bar
  the engine is over-expanded at sea level, and the one-dimensional isentropic
  $C_F$ ignores the boundary layer and any incipient separation.
- The remaining ~3.5 % common shortfall is the real $\eta$ being below 0.96
  once gas-generator flow (open cycle, dumped overboard) and divergence loss
  are included.
- Marks are lost for concluding "the published numbers are wrong". They are
  not; the model is idealised and its errors are all in the same, predictable
  direction.

**N7 — regression without the segmented motors.**

Dropping RSRM and P241 and refitting the remaining eight:

$$b_1 = -4.29\times10^{-4}\ \mathrm{yr^{-1}} = -0.0043\ \text{per decade},\qquad R^2 = 0.163,\qquad \bar\zeta = 0.9116$$

The slope **changes sign** and $R^2$ stays negligible. Within the monolithic
population there is no time trend at all; the spread (0.895 to 0.924) is set by
motor size, case diameter, nozzle mass fraction and how much of the inert mass
is TVC and interstage hardware. The original positive slope in §5.3 was
entirely produced by the two segmented-steel outliers happening to be early and
late rather than by any improvement over time — which is the classic
confounding failure, and the reason the answer to "is X improving with time?"
is almost always "compared with what, holding what fixed?"

**N8 — thrust-to-weight and which thrust.**

From the stated figures, sea-level basis:

- RD-180: $3.830\times10^6/(5480 \times 9.80665) = \mathbf{71.3}$
- F-1: $6.770\times10^6/(8400 \times 9.80665) = \mathbf{82.2}$

Published: 78.44 and 94.1. Recompute on **vacuum** thrust:

- RD-180: $4.150\times10^6/(5480 \times 9.80665) = 77.2$
- F-1: $7.770\times10^6/(8400 \times 9.80665) = 94.3$

The F-1 figure lands on the published 94.1 and the RD-180 lands within 1.6 % of
78.44. **The published thrust-to-weight ratios are vacuum-based even where the
source labels them "sea level".** This is the same class of error as the
RS-25's 73.1-versus-66 and the Titan per-motor-versus-per-vehicle problem: the
number is fine, the basis is unstated.

On a consistent vacuum basis the F-1 (94.3) actually beats the RD-180 (77.2),
so to match the RD-180 the F-1 would need to be *heavier*, about
$7.770\times10^6/(77.2 \times 9.80665) = 10{,}260$ kg, i.e. 22 % more mass.
On a consistent sea-level basis the F-1 (82.2) still beats the RD-180 (71.3).

Comment: era is the better explanation here, not cycle — but only because the
comparison is unrepresentative. The ORSC premium shows up against
*contemporaries*: RD-253's 156 in 1965 against the F-1's ~94 in 1967, and the
NK-33's 137 in 1972. The RD-180 is a heavy two-chamber assembly with a large
turbopump and a gimbal system, and it is not the right engine to demonstrate
the cycle's mass advantage. Full marks require noticing that the comparison is
badly chosen as well as getting the arithmetic right.

---

### Engineering reasoning

**R1 — colouring the $I_{sp}$-versus-year plot.**

Colour by (i) **propellant class** (hydrolox / kerolox / storable / methalox)
and (ii) **vacuum versus sea-level basis**; a strong answer adds (iii)
**expansion ratio**, which is really a continuous covariate rather than a
category and is the largest single driver.

Prediction: the apparent trend disappears almost entirely. Within hydrolox the
points sit in a flat band from 421 s (J-2, 1966) to 465.5 s (RL10B-2, 1998)
with the spread explained by $\varepsilon$ (27.5 to 285), not by year. Within
kerolox there is a genuine step around 1965–85 from ~290 to ~338 s vacuum,
which is the ORSC transition and is a *cycle* effect. Storables are flat at
302–324 s from 1962 to today. The overall upward trend in the uncoloured plot
is mostly a composition effect: the fraction of hydrogen upper stages in the
sample rises with time.

The counter-argument a good student should raise: cycle and year are genuinely
correlated, so "colour by cycle" partly launders a real historical effect into
a categorical one. The honest response is that the mechanism is identifiable —
we can say *why* ORSC gives +40 s and it is not "because it is 1985" — and a
mechanism beats a date.

**R2 — 140 bar ORSC methane engine to 220 bar.**

In order of how soon it breaks:

1. **Turbopump discharge pressure and preburner power.** Pump $\Delta p$ rises
   ~57 %, so shaft power rises at least that much at constant efficiency, so
   preburner flow rises, so ox-rich turbine inlet temperature and/or flow rise.
   This breaks first, at the system-balance stage, before any hardware is cut.
2. **Ox-rich gas-path compatibility.** Preburner and turbine metal temperature
   and oxygen partial pressure both rise, and metal ignition thresholds in
   oxygen are pressure- and temperature-dependent. BE-4's deliberately low
   140 bar is widely understood as a life-and-margin choice, and this is the
   quantity it was protecting.
3. **Throat heat flux and liner life.** $q$ rises roughly as $p_c^{0.8}$, i.e.
   ~44 %. At constant wall thickness the through-wall $\Delta T$ rises the same
   way and LCF life falls much faster. The engine may run; it will not run
   often.
4. **Injector $\Delta p$.** Stability requires $\Delta p/p_c$ in a band, so the
   absolute injector drop rises with $p_c$, which feeds back to item 1.
5. **Sea-level performance.** At fixed $\varepsilon$ you gain sea-level $I_{sp}$
   but you also raise $p_e$, moving away from optimum expansion; the whole
   point of higher $p_c$ is a *larger* $\varepsilon$, and the manager has
   forbidden that.

Measure first: **liner hot-wall temperature and cyclic life data at the current
140 bar** — instrumented wall thermocouples plus post-test metallography from
the existing life-limit test articles. It sizes item 3 directly and, through
the required coolant $\Delta p$, bounds item 1. Second choice: ox-rich turbine
inlet temperature margin against the material's ignition threshold, which sizes
item 2 but is much harder to measure.

**R3 — 73.1 versus 66.**

Both use the RS-25's vacuum thrust; they use different masses. 3,177 kg is the
bare powerhead-plus-nozzle figure; 3,526 kg is the manufacturer's *installed*
mass including heat shield, gimbal bearing and controller. The general class is
**an unstated basis on a ratio**: a ratio is only meaningful when both its
numerator and denominator have stated definitions.

Two further examples from this module:

- **Thrust, per-motor versus per-vehicle.** Titan IV's UA1207 quoted at
  14.234 MN and SRMU at 15.12 MN are two-booster totals presented as single-
  motor figures — a factor-of-two error. Likewise LR87-AJ-11 quoted at 1,900 kN
  is the two-engine stage.
- **Expansion ratio, geometric versus effective.** RS-25 at 69:1 (manufacturer,
  geometric) versus ~77.5:1 (analysis literature) — exit area over *which*
  throat area, and defined how.

A third, if wanted: Redstone A-7's 75,000 / 78,000 / 82,977 lbf, which are the
nameplate, the nameplate plus turbine exhaust thrust, and the uprated flight
engine.

**R4 — American ORSC in 1970.**

*For.* The RD-253 has been flying on Proton since 1965 at 147 bar with a
published $T/W$ around 156, so the architecture is demonstrably possible, and
its advantages are exactly what a large booster wants: everything burned in the
main chamber, no turbine exhaust dumped, small turbomachinery. Kerosene rules
out fuel-rich staged combustion because of coking, so if you want closed-cycle
kerolox at all, ox-rich is the only door. The United States is about to spend
enormous sums on a reusable vehicle where engine mass is payload mass.

*Against.* You do not have the materials. Hot high-pressure oxygen ignites
structural metals, the initiation is by rub or particle impact, and the
Soviet solution is a bureau secret. Your own experience with oxygen systems
says cleanliness control at that level is not achievable in a production
environment. You have a hydrogen programme in flight already, hydrogen does not
coke, and fuel-rich staged combustion on hydrogen sidesteps the entire problem
— which is the decision actually taken, and it produced the RS-25.

*What you would need to learn.* (i) The ignition threshold — temperature,
pressure, oxygen concentration, and initiating energy — for candidate alloys in
your own test rigs, because this is a measurable material property and not a
secret. (ii) Whether a protective/passivating surface treatment can be applied
and inspected in production. (iii) What particulate cleanliness the ox-rich
gas path actually requires, which is a system-engineering question as much as a
materials one. (iv) Sub-scale ox-rich preburner and turbine test experience,
which is expensive but not exotic.

*How you might have learned it.* A dedicated materials and sub-scale preburner
programme, on the scale of a few percent of the SSME's budget, running in
parallel. The historical counterfactual is genuinely open: the RD-170's
existence proves the physics, and the eventual American answer (BE-4, 2024) was
reached without any Soviet technology transfer — just thirty years later, and
after the 1993 NK-33 inspections had forced everyone to take the architecture
seriously.

**R5 — consistency checks on 350 s / 350 bar / $T/W$ 200.**

Checks, and what each tells you:

1. **Is 350 s vacuum or sea level, and at what $\varepsilon$?** From CEA,
   LOX/CH₄ at $r \approx 3.4$ gives $c^* \approx 1{,}832$ m/s. 350 s vacuum
   needs $C_F = 350 \times 9.80665/(\eta \times 1832)$; at $\eta = 0.98$ that
   is $C_F = 1.911$, which is $\varepsilon \approx 34$ — entirely plausible for
   a sea-level engine. **350 s at *sea level* would need $C_F \approx 1.91$ with
   the ambient term subtracted**, which at 350 bar implies $\varepsilon$ around
   60–70 and an engine that is comfortably attached — possible but it should be
   stated. If they mean sea level and quote $\varepsilon = 34$, the numbers
   do not close.
2. **Does $T/W = 200$ close against the thrust?** You need thrust and dry mass
   separately. $T/W = 200$ beats Merlin's 184, which is the highest ever flown,
   and Merlin achieves it with an open cycle at 97 bar — a *light* cycle. A
   staged-combustion engine at 350 bar carries two turbopumps, a preburner and
   a much heavier structure. Raptor 3's claimed 164 at 330 bar is the closest
   comparable, and it is itself unverified.
3. **Does $p_c = 350$ bar close against the liner?** Ask for hot-fire duration
   and cycle count at rated pressure, and for wall-temperature data. 350 bar is
   above any verified engine ever built; a single 30-second demonstration
   firing is not the same claim as a qualified operating point.

Additional parameters needed: thrust (SL and vacuum), $\varepsilon$, dry mass
and what it includes, mixture ratio, cycle, and the number and duration of
firings behind each figure. Say plainly which figures are claims. The
appropriate posture is the one `_verify-liquid.md` recommends for Raptor:
present the numbers with the attribution attached, and do not launder them.

---

## K2. Quiz answers with explanations

**Q1 (8) — (a) chamber pressure.**

At $p_a = 0$ the thrust coefficient reduces to a function of $\gamma$ and
$p_e/p_c$ only, and $p_e/p_c$ is fixed by $\varepsilon$ and $\gamma$ through
the isentropic area–Mach relation. Raising $p_c$ raises $p_e$ in exact
proportion, so vacuum $C_F$ — and hence vacuum $I_{sp}$ — is unchanged.
(b) is wrong: expansion ratio is the dominant term, worth ~62 s in worked
example 2. (c) is wrong: efficiency is worth ~14 s. (d) is wrong: propellant
change is worth ~29 s through $c^*$.

*Second-order caveat worth a bonus mark:* in a real engine higher $p_c$
suppresses dissociation and raises $c^*$ by of order 1 %, so the true
contribution is small but not exactly zero. The point stands.

**Q2 (8) — 59 years (RD-253, July 1965 → BE-4, 2024); oxidiser-rich gas-path
metallurgy.**

The gating factor is materials compatibility with hot, high-pressure oxygen:
alloy selection plus passivating coatings plus particulate cleanliness. Answers
naming "combustion instability", "turbopump power" or "cost" score zero on the
second half; answers naming "Soviet secrecy" get partial credit, since the
secrecy is *why* the West did not copy it, but the underlying problem is the
metallurgy, which the West could in principle have solved independently — and
eventually did.

**Q3 (12).** $R = 8314.46/13.5 = 615.9$ J/(kg·K), $\Gamma(1.19) = 0.6465$,
$c^* = \sqrt{615.9 \times 3550}/0.6465 = 2{,}286.9$ m/s.

- $\varepsilon = 27.5$: $C_F = 1.8609$ → $I_{sp} = \mathbf{433.9\ s}$
- $\varepsilon = 240$: $C_F = 2.0205$ → $I_{sp} = \mathbf{471.2\ s}$

Ideal difference **37.3 s**; published difference (J-2 421 s, Vinci 457.2 s)
**36.2 s**. The agreement is remarkable: both engines realise **97.0 %** of
ideal ($421/433.9 = 0.970$, $457.2/471.2 = 0.970$).

Comment expected: essentially the entire 36 s difference between a 1966
gas-generator engine and a 2024 closed expander is **expansion ratio**. Vinci
runs at 60 bar against the J-2's 52.6 — almost nothing — and burns the same
propellants. Fifty-eight years of development bought a bigger nozzle, restart,
and the ability to close the cycle; it did not buy combustion performance.

**Q4 (10).** P120C **0.9242** > GEM-40 **0.9080** > Ariane 5 P241 **0.8796** >
Shuttle RSRM **0.8475**.

The explanatory variable is **case construction**: the two monolithic
filament-wound composite motors are first and second, the two segmented steel
motors are third and fourth. Dates do not explain it — GEM-40 (1990) beats
P241 (2006) and the ordering by year would be RSRM, GEM-40, P241, P120C, which
is not the ranking.

**Q5 (10).** All three are **SpaceX claims**. Independent corroboration exists
only for **thrust**, and only indirectly, through FAA licensing and
environmental documents that give Starship thrust and propellant loads, and
through third-party analysis of flight telemetry and launch acoustics. There is
**no independent verification of chamber pressure, specific impulse, dry mass
or thrust-to-weight at all**, and several of the version-by-version figures
originate in social-media posts rather than in any document. Note that the
question's three quoted numbers do not include thrust, so the correct answer is
that **none of the three quoted figures has independent corroboration**;
credit is given for identifying thrust as the only corroborated Raptor quantity.

**Q6 (12), 1.5 marks each.**

| engine | cycle |
|---|---|
| RL10 | closed expander |
| LE-9 | expander bleed |
| BE-3PM | tap-off |
| RD-253 | oxidiser-rich staged combustion |
| RS-25 | fuel-rich staged combustion (dual preburner, dual shaft) |
| Merlin 1D | open gas generator |
| Raptor | full-flow staged combustion |
| Vinci | closed expander |

"Expander cycle" alone for LE-9 or BE-3PM scores half: the whole point of
§3.5.2 is that the word names three different cycles with different thrust
ceilings and $I_{sp}$ penalties.

**Q7 (10).** Mechanism: under ignition pressurisation the tang-and-clevis field
joint **rotated**, opening the sealing gap faster than a cold, stiffened
fluorocarbon O-ring could extrude into it, so hot gas blew by and burned
through. Redesign feature: a **capture feature** — an inner lip on the tang
that engages the inside clevis leg and **mechanically limits joint rotation**
— supplemented by a third O-ring on that feature, redesigned insulation and
joint heaters. Full marks require "rotation" and "capture feature limits
rotation"; an answer about O-ring material or temperature alone scores at most
4.

**Q8 (12).** $m_i = m_p(1-\zeta)/\zeta$:

- $\zeta = 0.86$: $m_i = 16{,}279$ kg,
  $\Delta v = 280 \times 9.80665 \times \ln(161{,}279/61{,}279) = \mathbf{2{,}657\ m/s}$
- $\zeta = 0.92$: $m_i = 8{,}696$ kg,
  $\Delta v = 280 \times 9.80665 \times \ln(153{,}696/53{,}696) = \mathbf{2{,}888\ m/s}$

Difference **+231 m/s**. The physical change: **replacing a segmented steel
case with a monolithic filament-wound composite case**, which removes ~7.6
tonnes of case, joint hardware and field-joint insulation without changing the
propellant.

**Q9 (10).** Vulcain 2 raised $p_c$ from 100 to 117.3 bar and $\varepsilon$
from 45.1 to 58.2, yet vacuum $I_{sp}$ fell from 431 to 429 s. The responsible
design variable is **mixture ratio**, richened from 5.3 to 6.1. A higher
oxidiser fraction raises bulk density and mass flow (hence thrust and tank
volume efficiency) while moving away from the $I_{sp}$-optimal mixture ratio,
which for LOX/LH2 is well fuel-rich of stoichiometric because of the
$\bar{\mathcal M}$ benefit of excess hydrogen. The vehicle optimum and the
engine optimum are different optima, and Ariane 5 was optimising the vehicle.

**Q10 (8), 2 marks each.**

| enabler | example | date | who paid |
|---|---|---|---|
| materials | NARloy-Z copper liner permitting ~100 MW/m² at 206 bar (RS-25); *or* ox-rich compatible alloys and enamels permitting ORSC (RD-253) | 1981; 1965 | Shuttle programme; Soviet Proton/Glushko bureau |
| manufacturing | brazed tube-wall chambers (Atlas/Thor/F-1); *or* filament-wound monolithic cases (P120C) | 1955–67; 2022 | USAF ICBM programmes and Apollo; ESA/Avio |
| analysis | bomb-pulsed combustion-stability rating that made the F-1 possible | 1959–63 | Apollo |
| economics | RS-68's design-for-minimum-cost, 80 % fewer parts | 2002 | USAF EELV competition |

Other defensible answers: coaxial shear injection (analysis, 1966, Apollo);
L-PBF printed chambers (manufacturing, 2014–17, SpaceX and Rocket Lab);
reuse (economics, 2015–, commercial launch market).

---

## K3. Trade-study reference solution (T1)

### Recommendation

**Option (c): LOX/CH₄ open gas generator at ~100 bar, in the Prometheus class.**

### The binding constraint, and how it was identified

Three candidate constraints: development budget, schedule (eight years to first
flight), and recovery from flight 20. Test each against history.

- **Budget and schedule together are binding.** The agency has no
  staged-combustion experience. The historical cost of acquiring it is
  documented and large: the SSME programme's development record is a catalogue
  of turbopump bearing, whirl and injector-post failures over roughly a decade
  [Biggs89]; Vinci, a *closed expander* — a far simpler closure — took
  26 years from 1998 to first flight in 2024; the LE-9's expander-bleed
  development suffered combustion-chamber and turbine cracking that delayed
  H3 by years. An agency with no prior staged-combustion hardware attempting
  ORSC in eight years on a modest budget is proposing to repeat an experiment
  whose outcome is well characterised.
- **Recovery is a real but softer constraint.** It arrives at flight 20, and it
  drives *propellant choice and restart capability* far more than it drives
  cycle choice. Falcon 9 recovers an open-cycle gas-generator engine.

So: cycle is set by budget and schedule; propellant is set by recovery.

### Why methane and not kerosene

Recovery from flight 20 makes coking a first-order criterion. RP-1 cracks and
deposits carbon in cooling channels and on the injector face, so between-flight
inspection or refurbishment is required — this is the operational difference
that drove SpaceX from Merlin to Raptor and Blue Origin to BE-4 on methane
from the start. Methane also cools better at elevated $p_c$ and shares a
thermal regime with LOX (112 K and 90 K), simplifying the stage. The $I_{sp}$
argument is nearly neutral: from module 05, LOX/CH₄ gives ~360 s vacuum at
$\varepsilon = 40$ against LOX/RP-1's ~355 s, and methane is *less* dense
(825 versus 1,026 kg/m³ bulk), so tanks grow. Methane wins on operations, not
performance, and only because recovery is a requirement.

### Quantified consequence against the best alternative

The best alternative on performance is **(b)**, ORSC methane at 140 bar.
Against option (c):

- **Specific impulse.** BE-4's company figure is 340 s at sea level;
  Prometheus's target is 360 s (condition unstated, presumably vacuum). A fair
  comparison of an ORSC engine at 140 bar with a GG engine at 100 bar on the
  same propellant is roughly **10–15 s of vacuum $I_{sp}$**, of which perhaps
  6–8 s is the cycle (no dumped turbine flow) and the rest the larger
  $\varepsilon$ the higher $p_c$ permits. Call it **3–4 % of $I_{sp}$**, which
  through the rocket equation is of order 5–8 % of payload on a first stage.
- **Thrust-to-weight.** ORSC's premium is large and historically demonstrated
  (RD-253 156, NK-33 137), but BE-4 itself computes to only ~46 at 2,460 kN /
  5,400 kg, which is *worse* than Merlin's 184 and comparable to RS-68A's 47.
  A modern GG methane engine should reach 100–150. **On the evidence
  available, option (b) does not buy $T/W$**; that is a striking result and it
  is worth stating, because the textbook argument for ORSC is $T/W$ and BE-4
  does not demonstrate it.
- **Development risk.** Not quantifiable from public data, which is itself the
  finding. Use schedule precedent instead: no first-time developer has flown a
  staged-combustion engine in eight years.

### Historical precedents, including one that went badly

1. **RS-68 (2002), for.** An explicit design-for-minimum-cost brief produced a
   gas-generator hydrogen engine with 80 % fewer parts than the RS-25, $T/W$ of
   45 and an ablative nozzle — and it won the EELV contract and flew for
   22 years. Accepting a worse engine to get a cheaper programme is a proven
   strategy.
2. **Merlin 1D (2013), for.** An open-cycle 97 bar engine with sea-level
   $I_{sp}$ *below the 1967 F-1's* became the most-flown and first routinely
   reflown orbital engine in history. Cycle choice did not prevent reuse.
3. **Titan IV SRMU (1997), against changing too much at once.** PBAN→HTPB,
   steel→graphite/epoxy, LITVC→gimballed nozzle and 5–7 segments→3, all
   simultaneously. A case failed during a 1991 structural test, killing a
   worker; the programme slipped years and early Titan IV-B flights had to use
   leftover UA1207s. **This is the precedent that went badly**, and it is the
   direct argument against an agency with no relevant experience changing
   cycle, propellant and reuse philosophy in one step.
4. **Vinci (1998–2024), against optimistic schedules on unfamiliar cycles.**
   26 years for a closed expander at 60 bar in an organisation with decades of
   cryogenic engine experience.

### Company claims versus verified figures — declared

- **Claims:** every BE-4 figure (140 bar, 340 s, 5,400 kg, ~56 MW turbopump);
  every Prometheus figure (980 kN, 100 bar, 360 s — targets for an unflown
  engine); every Archimedes and Raptor figure; Merlin's chamber pressure,
  turbopump power and $T/W$.
- **Verified or well-attested:** RS-68A (thrust, $p_c$, $I_{sp}$, mass, $T/W$),
  RD-180 and RD-170 performance sets, RS-25 thrust/$p_c$/$I_{sp}$, the F-1
  performance set except $p_c$, and the module-05 CEA table.

The trade study rests on the verified set for the *magnitude* of the ORSC
premium and on claims only for the specific competitor engines, which is the
right way round.

### The single result that would change the recommendation

**Credible evidence that a first-time developer can qualify an oxidiser-rich
preburner and turbine within about three years** — specifically, sub-scale
ox-rich preburner and turbine hot-fire hours accumulated on the agency's own
alloys, with post-test metallography showing no ignition or attack, plus a
demonstrated production cleanliness standard. That is the item that gates
option (b), and it is testable early and relatively cheaply. If it came back
green in year two, switching to (b) would be defensible; the $I_{sp}$ is worth
having if the risk is retired.

A secondary trigger: if the recovery requirement were dropped, kerosene
(option a) becomes competitive again on density, tank size and cost, and the
recommendation would move to (a).

### Rubric

**A strong answer must contain:**

- An explicit statement of which constraint is binding, with a *reason* — not
  an assertion — that survives comparison with at least one historical case.
- A cycle recommendation and a propellant recommendation treated as
  **separate** decisions with separate drivers. Conflating them is the most
  common structural failure.
- At least three dated precedents, one of which went badly, used as evidence
  rather than decoration.
- Numerical consequences: $I_{sp}$ and $T/W$ deltas taken from §3.5 tables with
  the right sign and order of magnitude, and a statement of what that means for
  payload.
- An explicit claims-versus-verified declaration.
- A named, testable falsifier for the recommendation.

**Loses marks for:**

- Choosing (b) or (d) without addressing the ORSC materials and schedule
  precedent — (d) in particular must confront the RD-180 supply cut, which is
  the entire reason the option looks cheap and the entire reason it is
  dangerous.
- Quoting Raptor or BE-4 figures as fact.
- Arguing from $I_{sp}$ alone. A 3–4 % $I_{sp}$ advantage that arrives four
  years late has negative value.
- Asserting that reuse requires staged combustion. Falcon 9 refutes this
  directly and the student should know it.
- Recommending (c) *without* engaging with the fact that it gives up the
  performance ceiling — a right answer for unstated reasons scores like a
  wrong one.

**Defensible alternative recommendations.** (a) is defensible if the student
argues that recovery at flight 20 is aspirational and kerosene's density and
cost dominate for the first twenty flights; it must then address what happens
at flight 20. (b) is defensible only with a credible risk-retirement plan and a
schedule argument that confronts Vinci and the SSME record head-on. (d) is
defensible only for an agency with no ambition to build a domestic engine
industry, and must address supply security explicitly.

---

## K4. Common wrong answers and what they reveal

**"Chamber pressure improves specific impulse."** The single most common error
in this module, and it survives all the way to senior engineers. It reveals a
memorised association (high-$p_c$ engines *do* have high $I_{sp}$) in place of
the causal chain: high $p_c$ permits high $\varepsilon$ without sea-level
separation, and high $\varepsilon$ raises $I_{sp}$. Worked example 2's vacuum
column — where the $p_c$ term is identically zero — is the diagnostic. Students
who get this wrong will also mis-size upper-stage engines, where the coupling
is absent entirely.

**Fitting a trend line and believing it.** In worked example 1 a substantial
minority will report "chamber pressure doubles every 15 years" and predict
1,300 bar in 2025 without noticing the absurdity. This reveals no habit of
sanity-checking against the extreme value in the data set. The same error in
worked example 3 produces "solid mass fraction improves by 0.004 per decade"
from an $R^2$ of 0.06.

**Treating year as a cause.** "Newer engines are better" is the general form.
It shows up as: not colouring the $I_{sp}$ plot by propellant class (R1),
missing that GEM-40 (1990) beats P241 (2006) on mass fraction (Q4), and
treating the LE-7A's de-rating and Vulcain 2.1's thrust reduction as errors in
the source data (C5). The underlying failure is not statistical; it is a belief
that engineering has a single quality axis.

**Naming an enabler for every transition.** Students trained to look for
breakthroughs will invent one for RS-68 ("advanced cost-reduction technology")
or for the RD-107's four chambers. Recognising that some transitions are
*choices* is the whole discipline of §3.1; without it, history reads as
inevitable and cannot be used to reason about the future.

**"The O-ring failed."** Framing Challenger as a seal problem. This reveals the
habit of stopping at the last item in the causal chain — the item that visibly
broke — instead of continuing to the mechanism (joint rotation) that made the
seal's job impossible. The tell is that such students propose material fixes
for geometry problems.

**Quoting a ratio without a basis.** $T/W$ without stating which mass and which
thrust (N8, R3), expansion ratio without saying geometric or effective, thrust
without per-motor or per-vehicle, $I_{sp}$ without vacuum or sea level. Each
is individually forgivable; collectively they are the reason engine comparison
tables in the secondary literature are unreliable, and the reason this course
insists on tagging.

**Laundering claims into facts.** Writing "Raptor 3 produces 350 s at 330 bar"
with no qualifier. This is not a knowledge failure — the numbers are right as
reported — it is an epistemics failure, and it is the one that will actually
damage a trade study, because a decision built on an unaudited competitor
figure has no error bars at all.

**Assuming reuse requires high performance.** The claim that a reusable booster
needs staged combustion is refuted by Falcon 9 and was refuted before the
student was asked. It reveals reasoning from what sounds advanced rather than
from the requirement — the reusability requirements are restart, deep throttle,
thermal margin and inspection access, none of which is a cycle property.

**Confusing the three expander cycles.** Calling the LE-9 or BE-3U a "closed
expander" (Q6). It matters because the closed expander has a hard thrust
ceiling from the jacket heat balance and the bleed cycle does not; a student
who conflates them will declare a 1,471 kN expander engine impossible, which is
exactly the mistake the LE-9 was built to disprove.

**Using the MMU as a worked example.** Its published $\Delta v$ does not close
against its published propellant load at any credible cold-gas $I_{sp}$.
Students who compute an implied ~100 s $I_{sp}$ for nitrogen and report it
without flinching have not internalised that ~77 s is the frozen ideal and
~70 s the practical ceiling. SAFER is the honest example, and noticing the
difference is the skill being tested.
