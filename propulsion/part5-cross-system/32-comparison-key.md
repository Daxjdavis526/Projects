# Module 32 — Answer key: Liquid vs Solid vs Cold Gas

All arithmetic uses $g_0$ = 9.80665 m/s². Sizing uses Eq. 3.8,

$$m_p = \frac{(m_{pay}+m_{fix})(e^{\Delta v/c}-1)}{1-k(e^{\Delta v/c}-1)},\qquad c = I_{sp}g_0$$

and every numerical result below is reproduced by `tools/examples/32.py`
against `tools/rocket.py` where the step maps onto a library function.

---

## K1. Problem solutions

### Conceptual

**C1.** The solid loses on three separate mechanisms, largest first.

1. **Two-phase flow loss (2–6 %, the largest term).** 16–19 % aluminium burns to
   Al₂O₃, which leaves the chamber as condensed droplets. A droplet accelerating
   in an expanding gas lags the gas velocity (it has inertia and only drag to
   accelerate it) and lags the gas temperature (it has heat capacity and only
   convection to cool it). Both lags are irreversible: the exhaust leaves with
   kinetic energy locked in slow droplets and thermal energy locked in hot ones,
   neither of which appears as thrust. The loss scales with particle size and
   inversely with nozzle residence length [SP-8039][Davenas]. A liquid engine
   has no analogue.
2. **Exhaust molar mass.** APCP exhaust carries HCl and Al₂O₃ and comes out
   around $\mathcal{M}$ = 26–29 kg/kmol against ~22–24 for kerolox. Since
   $c^* \propto \sqrt{T_c/\mathcal{M}}$, that is worth several percent by
   itself.
3. **Expansion ratio (a packaging penalty, not a propellant penalty).** A
   sea-level booster nozzle must start unseparated, so ε ≈ 7 (Shuttle SRB
   7.16–7.72) against 69–78 for the RS-25 [WP][NASA-SRB]. On an upper stage the
   penalty largely vanishes: Zefiro 9A reaches 295.9 s and Star 48B's long
   nozzle 292.2 s versus 286.2 s on the short nozzle with the same propellant
   [WP][JM-LV].

Full marks require the ranking and the statement that (3) is not a property of
the propellant.

**C2.** A pressure-fed hypergolic engine has, between command and thrust, only:
valve travel (a few ms), manifold and dome fill (a few ms at the feed pressure),
and hypergolic ignition delay (single-digit ms). Nothing has to be accelerated
or heated. Total: tens of milliseconds.

A pump-fed engine must, in sequence: (a) open valves and prime lines against a
much larger volume; (b) **spin up the turbopump from rest**, which requires
energy from a bootstrap source (tank head, a start cartridge, or a spin-start
gas supply) and takes rotational inertia into account; (c) **thermally
condition** the pump and lines — for a cryogenic engine, chill-down to avoid
cavitation and two-phase flow through the impeller; (d) **ramp to mainstage on a
controlled schedule**, because the coupled pump/preburner/chamber system has
positive feedback and can run away or stall if accelerated too fast. Item (b)
and item (d) dominate. The SSME start is a several-second, closed-loop,
sequenced event and is the highest-risk part of its envelope [Biggs89].

**C3.** From Eq. 3.6, $p_c = (a\rho_p c^* K_n)^{1/(1-n)}$ with $K_n = A_b/A_t$.
Opening the throat lowers $K_n$, and $p_c$ falls as $K_n^{1/(1-n)}$. With
$n$ = 0.35 the exponent is 1/(1−0.35) = 1.54, so a 20 % increase in $A_t$ gives
$p_c \to p_c(1/1.2)^{1.54}$ = 0.75 $p_c$ — a 25 % pressure drop from a 20 % area
change. The amplification $1/(1-n)$ is exactly why $n$ matters: as $n \to 1$ the
exponent diverges and the motor has no stable equilibrium pressure at all.

Thrust does not fall proportionally, because $F = C_F p_c A_t$ and $A_t$ went
up while $p_c$ went down; the net is a modest thrust reduction and a large
$c^*$-efficiency and Isp penalty (the nozzle is now badly matched: $\varepsilon
= A_e/A_t$ has fallen, so $C_F$ falls too). Structurally and thermally the
problems are severe: the throat is the highest-heat-flux, highest-erosion point
in the motor, and any moving mechanism there is bathed in 3,300 K alumina-laden
flow with no coolant. A pintle or plug in the throat must survive the whole burn
with dimensional stability, and the actuator must work through the case at
chamber pressure. It has been demonstrated; it is not flight practice on large
motors.

**C4.** Both facts follow from **low molar mass and low density of hydrogen**.
LOX/LH₂ burns fuel-rich at $O\!/\!F \approx 6$, giving an exhaust molar mass of
~10–13 kg/kmol; since $c^* \propto \sqrt{T_c/\mathcal{M}}$, the small
$\mathcal{M}$ buys 450+ s despite a flame temperature *below* kerolox's. But
liquid hydrogen is ~71 kg/m³, so by Eq. 3.4 the bulk density at $O\!/\!F$ = 6 is
only 361 kg/m³ and the impulse density is 1,600 N·s/L — the lowest in Table 3.6
and less than a third of a solid's. The vehicle consequence: hydrolox stages are
volumetrically enormous, so their tank structure, insulation and aerodynamic
surface area are large, and a significant part of the Isp advantage is paid back
in stage inert mass. That is why hydrolox is used where Isp leverage is greatest
(upper stages) and is a poor first-stage propellant on a volume-constrained
vehicle.

**C5.** *Strongest form of the argument:* a solid has no feed system, no
injector, no turbomachinery, no ignition timing and typically zero to two moving
parts. Its failure modes are a short list of structural ones. There is no start
transient to survive, nothing to chill down, nothing to keep pressurized, and
nothing to leak for the years it sits in storage.

*Strongest counter-argument:* the motor you fly has never been fired and can
never be fired before you fly it. Every claim about it is an inference from
process control, non-destructive inspection that cannot see burn rate, and
lot-acceptance firings of siblings — and the article has been aging in a
warehouse. A liquid engine can be acceptance-fired, inspected, and flown; the
Shuttle OMS engine was qualified for 1,000 starts across 100 missions [WP].
Further, when a solid fails there is nothing to shut down: the failure is
usually unsurvivable, as STS-51-L showed [Rogers86].

*Which one to a crewed safety board:* present both, and say that the choice
depends on the phase. For an **abort motor** the argument wins: the requirement
is instant, certain thrust after long dormancy, and the solid's short failure
list plus millisecond transient is the right answer. For a **sustained-burn
crewed stage** the counter-argument wins: you want an engine you can test, shut
down, and inspect. A board that hears only one side is being sold something.

**C6.** Total impulse is $\approx m\,\Delta v$ = a few thousand N·s at 40 m/s on
a typical bus, which is above the ≈1,300 N·s crossover of Eq. 3.10, so
monopropellant is lighter. Argue for cold gas anyway on three grounds:

1. **Contamination.** A hydrazine thruster deposits ammonia and unburnt
   hydrazine; the plume back-flow region reaches surfaces well off the thrust
   axis. An uncoated optic degrades permanently and irreversibly. Cold gas
   deposits nothing. The mass penalty is recoverable; a contaminated optic is
   not.
2. **Impulse bit and pointing.** Fine pointing needs small, repeatable impulse
   bits; a cold-gas thruster with millisecond valve transients gives them, a
   catalyst bed with a thermal transient does not.
3. **Program cost.** No toxic-servicing infrastructure, no SCAPE, no catalyst
   heaters or their power and thermostat control, shorter integration flow.

The honest closing: state the mass penalty explicitly (roughly 6× the
propulsion mass per unit impulse) and show it fits the budget, or the argument
is hand-waving.

**C7.** (i) **Regression rate.** Hybrid fuel regresses at
$\dot r \propto G_{ox}^{n}$, $n \approx 0.5$–0.8, roughly an order of magnitude
slower than a composite solid's burn rate, so a hybrid needs many ports or an
elaborate grain to generate the burning area for useful thrust — which destroys
volumetric loading and therefore the density-impulse advantage that was the
point. (ii) **Mixture-ratio drift.** As the port opens at roughly constant
oxidizer flow, $O\!/\!F$ shifts through the burn, so $c^*$ and $I_{sp}$ shift;
the engine is never at its optimum for more than an instant, and compensating
with an oxidizer flow schedule requires regression models that are still not
predictive at flight scale. (iii) **Combustion efficiency.** The flame sits in a
boundary layer over the fuel surface rather than in a well-stirred volume, so
mixing is poor; aft mixing chambers help and cost length and inert mass.
Together these give a hybrid worse delivered $I_{sp}$ and worse mass fraction
than either parent class.

**C8.** A booster grain is shaped (star, wagon-wheel, finocyl, or a
double-truncated-cone/star combination as in the Shuttle SRB) to give a thrust
trace that is high at lift-off, dips through max-Q to keep dynamic-pressure
loads inside the structural box, and tails off toward burnout. Burning area
therefore varies through the burn, and by Eq. 3.6 so does $p_c$ and thus thrust.
The peak occurs early; the time-average over the whole action time is typically
70–80 % of it. WE2 computes 0.73 for GEM-63XL and problem N7 gives 0.75 for
GEM-63.

Quoting "thrust" without qualifiers is a factor-of-two error in the worst case
because two independent ambiguities compound: `max` versus `avg` (a factor of
~1.3) and `/motor` versus `/vehicle` (a factor equal to the number of boosters,
usually 2 or 4). Wikipedia's Titan IV infobox figures of 14.234 MN and 15.12 MN
are two-booster totals presented as single-motor values
(`reference/_verify-solid-coldgas.md`, contested figures §1).

### Calculation

**N1.** $m_{pay}$ = 250 kg, Δv = 120 m/s.

*Cold gas:* $c = 70\times9.80665 = 686.47$ m/s; $R = e^{120/686.47}$ = 1.19102;
$R-1 = 0.19102$; $k(R-1) = 1.05\times0.19102 = 0.2006$; denominator
1 − 0.2006 = 0.7994 > 0, so it **closes**.
$m_p = (250+2.0)(0.19102)/0.7994$ = **60.21 kg**;
$m_i = 1.05\times60.21+2.0$ = **65.22 kg**; wet = **125.44 kg** (50 % of the
payload mass).

*Hydrazine:* $c = 225\times9.80665 = 2206.5$ m/s; $R$ = 1.05589;
$k(R-1) = 0.18\times0.05589 = 0.01006$; denominator 0.98994.
$m_p = (250+5.0)(0.05589)/0.98994$ = **14.40 kg**; $m_i$ = **7.59 kg**;
wet = **21.99 kg**.

Both close; the cold-gas margin is thin (denominator 0.799, i.e. it is 20 % of
the way to divergence) and its wet mass is **5.7× the hydrazine system**. Check:
$\Delta v = 2206.5\ln((250+21.99)/(250+7.59))$ = 120.0 m/s ✓.

**N2.** $\Delta v_{max} = c\ln(1+1/k) = 686.47\ln(1+1/1.05)$ = **459.3 m/s**
(asymptotic, at infinite payload mass — unreachable in practice).

Wet mass 100 kg: solve $m_p + 1.05m_p + 2.0 = 100$ → $m_p$ = 47.80 kg,
$m_i$ = 52.20 kg. Then $m_0/m_f = (250+100)/(250+52.20)$ = 1.15816 and
$\Delta v = 686.47\ln(1.15816)$ = **100.8 m/s**.

The lesson: going from 100.8 m/s to 120 m/s costs 25 kg of extra wet system on a
250 kg spacecraft. Cold-gas mass grows violently with Δv well before the formal
limit.

**N3.** Eq. 3.4: $\rho_b = (1+3.6)/(3.6/1141 + 1/423) = 4.6/(0.0031551+0.0023641)
= 4.6/0.0055192$ = **833.5 kg/m³**.
$I_v = 833.5\times370\times9.80665$ = **3.024×10⁶ N·s/m³ = 3,024 N·s/L**.

Comparison: LOX/RP-1 3,099; LOX/LH₂ 1,600; APCP 4,942. Methane sits within 2.5 %
of kerosene on impulse density while offering ~370 s against RP-1's ~311 s.
For a reusable booster that combination is attractive for reasons beyond
performance: methane is a cleaner-burning fuel (no coking of regenerative
channels, which is a life-limiting issue for RP-1 engines between flights), it
is cryogenic but only mildly so (112 K against LOX's 90 K, so a common
bulkhead and shared thermal management are practical), and it is cheap and
widely available. The volumetric penalty against RP-1 is small enough to accept
for those benefits — which is the argument behind BE-4, Raptor and Archimedes.

**N4.** Point estimate $\hat p = 62/63$ = **0.98413**.
Clopper–Pearson one-sided 90 % lower bound with $f$ = 1: **$p_L$ = 0.9397**.
(Solve $\Pr(X\ge 62\mid p) = 0.10$.)

To reach $p_L \ge 0.99$ with that one failure still in the record requires
**n = 388 flights**, i.e. **325 further consecutive successes**. That is the
answer students find implausible and it is correct: a single failure early in a
record is extraordinarily expensive to demonstrate away. Note also that if the
failure was corrected by a design change, the honest treatment is to argue that
the post-change configuration is a *different* population and start the count
again — which is what the RSRM redesign did in practice, and which is a
statistical claim requiring an engineering justification, not a free pass.

**N5.** $a_1 = (1+0.25)/(45\times9.80665) = 2.8325\times10^{-3}$ kg/(N·s);
$a_2 = (1+0.18)/(225\times9.80665) = 5.3478\times10^{-4}$ kg/(N·s).

$$I_t^{*} = \frac{4.0-0.8}{2.8325\times10^{-3}-5.3478\times10^{-4}} = \frac{3.2}{2.2977\times10^{-3}} = \mathbf{1{,}393\ N\,s}$$

Against WE3's GN₂ crossover of 1,278 N·s the R-236fa system survives slightly
*longer* (to a higher total impulse) despite having 31 % lower $I_{sp}$, because
its inert fraction is 0.25 rather than 1.10 — a self-pressurising 2.7-bar liquid
needs a thin can, not a 241-bar COPV. This is Eq. 3.10 showing that **the
crossover is governed by $(1+k)/I_{sp}$, not by $I_{sp}$**, and it is the
quantitative form of the MarCO argument.

**N6.** Stored energy $E = pV = 3.00\times10^{7}\times6.0\times10^{-3}$ =
**1.80×10⁵ J**, i.e. 180 kJ = **0.043 kg TNT-equivalent** (43 g).

Ideal-gas mass: $m = pV/(RT)$ with $R = 8314.46/28.014 = 296.797$ J/(kg·K):
$m = 1.8\times10^{5}/(296.797\times293)$ = **2.070 kg**.

The real stored mass is **lower** because nitrogen at 300 bar and 293 K has a
compressibility factor $Z > 1$ (repulsive intermolecular forces dominate well
above the Boyle temperature), and $m = pV/(ZRT)$. At this state $Z$ is
approximately 1.15–1.20, so the true mass is near 1.7–1.8 kg. Students who write
"the tank holds 2.07 kg" have made a 15–20 % error in the propellant budget,
which is the entire margin on most cold-gas missions. Use REFPROP or the NIST
WebBook, never the ideal-gas law, above ~50 bar [NIST-WB].

**N7.** GEM-63: $I_t = 44{,}087\times279.1\times9.80665$ = **1.2067×10⁸ N·s**.
$\zeta = 44{,}087/49{,}342$ = **0.8935**.
$\bar F = I_t/t_b = 1.2067\times10^{8}/97.6$ = **1.236×10⁶ N**.
$\bar F/F_{max} = 1.236/1.6496$ = **0.749**.
Stage T/W at ignition $= 1{,}649.6\times10^{3}/(49{,}342\times9.80665)$ =
**3.41**.

Against GEM-63XL (WE2): $I_t$ 1.315×10⁸ N·s (+9 %), $\zeta$ 0.902 (+0.9 pt),
$\bar F$ 1.507×10⁶ N, average-to-peak 0.731, T/W 3.96. The XL is 9 % more total
impulse from 8 % more propellant at slightly better mass fraction and 25 % more
peak thrust in a 10 % longer motor — consistent with Northrop Grumman's
description of it as 15–20 % more thrust than GEM-63 and "the longest monolithic
rocket motor produced to date" [NG-COMM][WP].

**N8.**

| Δv (m/s) | solid wet (kg) | biprop wet (kg) | solid − biprop |
|---|---|---|---|
| 200 | 50.0 | 57.2 | −7.2 |
| 400 | 95.9 | 99.8 | −4.0 |
| 600 | 146.0 | 146.2 | −0.2 |
| 800 | 201.0 | 196.7 | +4.2 |
| 1,200 | 327.6 | 312.2 | +15.3 |

Crossover ≈ **610 m/s**. Full marks require the observation that the difference
is under 3 % of the added mass anywhere between about 350 and 850 m/s, so in
that band the mass comparison **does not decide the trade** — restartability,
insertion accuracy, shared use with the RCS, schedule and cost do.

### Engineering reasoning

**E1.** From the propellant: $I_t = m_p I_{sp}g_0 = 3.00\times10^{5}\times286
\times9.80665$ = **8.414×10⁸ N·s**. From the thrust trace:
$\bar F = I_t/t_b = 8.414\times10^{8}/140$ = **6.01×10⁶ N = 6.01 MN**.

The sheet quotes 15.12 MN, which is **2.52× the implied average**. Two
qualifiers are missing and both are needed to reconcile it:

- **`/vehicle` versus `/motor`.** 15.12 MN is almost certainly a
  *two-booster total*. Per motor that is 7.56 MN.
- **`max` versus `avg`.** 7.56 MN peak against a 6.01 MN average is a
  peak-to-average ratio of 1.26, entirely normal for a booster trace.

So the sheet is internally consistent only if "thrust 15.12 MN" means *maximum,
two motors* and "propellant mass 300 t" means *per motor*. Either reading alone
does not close. This is exactly the Titan IV SRMU confusion documented in
`reference/_verify-solid-coldgas.md`; the fix is that every thrust figure must
carry `/motor` or `/vehicle` and `max` or `avg`, with no exceptions.

**E2.** $V$ = 1.5 L, $T$ = 291 K, $R$ = 296.797 J/(kg·K), $p_i$ = 210 bar.

*Is it thermal?* At fixed mass, $p \propto T$, so a 0.4 bar/day droop would need
$\Delta T = T\,\Delta p/p = 291\times0.4/210$ = **0.554 K per day**. The
telemetry band is ±0.4 K and the trace is flat, so within two days the required
cooling would exceed the entire band. **It is a leak.**

*Inventory:* $m = pV/(RT) = 2.10\times10^{7}\times1.5\times10^{-3}/(296.797\times291)$
= **0.3647 kg** (ideal-gas; the real value is ~13 % lower at this pressure —
say so).

*Leak rate:* $\dot m_L = \dfrac{V}{RT}\dfrac{dp}{dt}$ with
$dp/dt = 0.4\times10^{5}/86{,}400 = 0.4630$ Pa/s:

$$\dot m_L = \frac{1.5\times10^{-3}}{296.797\times291}\times0.4630 = 8.04\times10^{-9}\ \mathrm{kg/s} = \mathbf{0.695\ g/day}$$

*In standard volumetric units:* standard density
$\rho_{std} = 101{,}325/(296.797\times273.15)$ = 1.2498 kg/m³, so
$\dot V_{std} = 8.04\times10^{-9}/1.2498$ = 6.43×10⁻⁹ m³/s =
**0.386 std cm³/min**.

*Time to depletion:* $0.3647/6.95\times10^{-4}$ = **525 days** ≈ 1.4 years from
full. A 3-year mission is not achievable; the mission must be rebudgeted, the
leak isolated behind a latch valve if it is downstream of one, or the duty cycle
front-loaded.

**E3.** With the N8 models at Δv = 550 m/s and $m_{pay}$ = 480 kg:

| | solid | bipropellant |
|---|---|---|
| $m_p$ | 108.2 kg | 98.0 kg |
| $m_i$ | 19.9 kg | 31.7 kg |
| **wet** | **128.1 kg** | **129.7 kg** |

The bipropellant is **1.6 kg heavier**, i.e. 1.2 % — the claim "higher Isp,
therefore lighter" is **false at this Δv**, because 550 m/s is below the 610 m/s
crossover and the bipropellant's larger fixed and variable inert mass more than
consumes its 12 % Isp advantage.

Two-sentence response: *"At 550 m/s with our inert-mass models the bipropellant
stage is 1.6 kg heavier than the solid, not lighter — the Isp advantage does not
pay for the tanks, helium and engine until about 610 m/s, and the two options
are within 3 % of each other for ±200 m/s either side of that. If we want the
bipropellant, the justification has to be restart capability, cut-off accuracy
and RCS commonality, not mass; write it that way and I will support it."*

**E4.** Observations: pressure on prediction for 40 s, then 8 % low and stable
for 55 s; thrust down by a similar fraction; burn time +4 s; **total impulse
within 1 %**. The conserved total impulse is the key: the propellant all burned,
it just burned at a lower rate and pressure. Candidates:

1. **Nozzle throat enlargement.** Erosion or, given the step-like onset, a
   partial spall or debond of the throat insert or the entry insulation
   increasing $A_t$. By Eq. 3.6, $p_c \propto K_n^{1/(1-n)}$, so a larger $A_t$
   lowers $K_n$ and lowers $p_c$; lower $p_c$ lowers burn rate ($r = ap_c^n$)
   and extends the burn; the total propellant, and hence roughly the total
   impulse, is unchanged. The step at 40 s and the *stable* low level afterwards
   fits a discrete area change better than progressive erosion, which would give
   a continuously drooping trace.
2. **Grain or liner condition change at a geometric transition.** If at ~40 s
   the burning front reaches a designed geometry transition and the actual
   burning area is below the predicted area there (a casting void that has now
   been consumed, a liner debond that has changed the exposed surface, or a
   mandrel-tolerance error in that section), $K_n$ falls with the same
   consequences.
3. **A lower-than-predicted burn-rate coefficient for the lot, or a low
   conditioning temperature** — but this is a *weaker* explanation, because it
   would depress pressure from ignition, not from t = 40 s.

Distinguishing inspection: **measure the throat**. Post-fire dimensional
inspection and sectioning of the nozzle insert, compared with pre-fire
dimensions, separates mechanism 1 from mechanism 2 immediately. If the throat is
at nominal, radiograph the recovered case and inspect the bond lines and the
insulation profile in the segment that was burning at 40 s. In parallel, pull
the lot's strand-burner data and the pre-fire conditioning temperature record to
eliminate mechanism 3.

**E5.**

*Favours the solid tower:* long dormancy with no servicing; abort response in
tens of milliseconds; nothing pressurized or leaking during the mission; a short
list of well-understood failure modes; no toxic propellant near the crew;
existing certification precedent (Mercury, Apollo, Soyuz, Orion).

*Favours the integrated liquid:* abort coverage through the **whole** ascent
rather than just the tower phase; no jettison event (which is itself a critical
single-shot mechanism); throttleability for a controlled abort trajectory and
lower peak acceleration on the crew; reusability of the hardware; and — if the
program wants it — dual use for propulsive landing or on-orbit manoeuvre.

*The requirement that flips it:* **whether abort coverage is required beyond
tower-jettison, and equivalently whether the abort engines have a second
mission.** If coverage must extend to late ascent, or the engines are also the
landing engines, the liquid wins; if not, the tower's simplicity is
unanswerable. (SuperDraco exists because SpaceX wanted both [WP]; Orion has no
such requirement and uses a solid LAS.)

*What to see in the liquid data package before accepting it:* long-duration leak
and stress-rupture data on the pressurized system for the full mission duration;
check-valve and helium-system failure analysis with series redundancy and
sequencing (the April 2019 ground-test loss was NTO past a check valve into a
helium line [WP]); qualified minimum start time from a cold, long-dormant state,
with statistics not a single demonstration; throttle authority and thrust
mismatch limits across the eight engines with an engine-out abort trajectory;
and a hazard analysis for the toxic propellants with the crew aboard through
entry and landing.

---

## K2. Quiz answers

**Q1 (8).** Highest to lowest impulse density:
**APCP solid ≈ 4,940 N·s/L > N₂O₄/MMH ≈ 3,650 > hydrazine ≈ 2,170 >
LOX/LH₂ ≈ 1,600 > GN₂ at 241 bar ≈ 179.** Highest ≈ 4,940 N·s/L, lowest ≈ 179
N·s/L — a factor of 28. Two marks are lost for putting hydrolox above storables
(the commonest error, made by ranking on $I_{sp}$ instead of $\rho_b I_{sp}$).

**Q2 (10).** $c = 70\times9.80665 = 686.47$ m/s.
$\Delta v_{max} = c\ln(1+1/k) = 686.47\ln(1+1/1.2) = 686.47\times0.6061$ =
**416.1 m/s**.

Above that value the denominator of Eq. 3.8, $1-k(e^{\Delta v/c}-1)$, is zero or
negative, so the equation returns an infinite or negative propellant mass. That
is not a numerical artefact: it says each extra kilogram of propellant brings in
more than a kilogram of tank, so the mass spiral never converges and **no
spacecraft of any size can do that Δv with this class**. Full marks require the
physical statement, not just the number.

**Q3 (8).** **(b).** The booster nozzle operates at sea level; a large ε would
give an exit pressure far below ambient at lift-off, and the flow would separate
inside the nozzle with side loads that can destroy the nozzle and the vehicle.
(a) is a real Isp effect but not what sets ε. (c) is false — the nozzle is aft
of the case and is not length-limited by segmentation. (d) is a real loss
mechanism but has nothing to do with area ratio. The confirming evidence is that
the *same propellant family* in an upper-stage motor at ε ≈ 48–70 delivers
286–296 s [WP][JM-LV].

**Q4 (12).** $n$ = 84, $f$ = 0: $p_L = \alpha^{1/n} = 0.10^{1/84}$ =
**0.9730** at 90 % confidence.

The competitor's claim: 30 flights with zero failures gives
$0.10^{1/30}$ = **0.9261** at 90 % confidence, and even at 50 % confidence only
0.9772. To support $p_L$ = 0.995 at 90 % confidence with no failures requires
$n = \ln(0.10)/\ln(0.995)$ = **460 consecutive successes**. The claim of 0.995
from 30 flights is therefore **not a measurement** — it is either a point
estimate misrepresented as a demonstrated reliability, or an allocation from a
reliability model (a parts-count or fault-tree prediction). Ask which, and ask
for the model. Full marks require identifying that the number is a model output,
not evidence.

**Q5 (10).** **(b).** A solid escape motor's ignition transient is tens to a
few hundred milliseconds against seconds for a pump-fed engine, it has the
highest thrust-to-weight of any class, and it needs no pressurization,
chill-down, purge or servicing during the months it sits on the pad. (a) is
false — solids have *lower* Isp than storable bipropellants, and Isp is nearly
irrelevant for a 5-second abort burn anyway. (c) is false; solids cannot be
throttled. (d) is not the driver.

Counter-example: **Crew Dragon's SuperDraco**, eight pressure-fed MMH/N₂O₄
engines at 71 kN each, 20–100 % throttleable [WP]. The driving requirement was
**abort coverage through the entire ascent with no jettison event** (and,
originally, dual use for propulsive landing), which a jettisonable tower cannot
provide.

**Q6 (12).** $c = 220\times9.80665$ = 2,157.46 m/s; $R = e^{250/2157.46}$ =
1.12295; $R-1 = 0.12295$; $k(R-1) = 0.02459$; denominator 0.97541.

$m_p = (300+6)(0.12295)/0.97541$ = **38.54 kg**
$m_i = 0.20\times38.54+6$ = **13.71 kg**
wet system = **52.25 kg**

Verification: $m_0 = 300+52.25 = 352.25$ kg, $m_f = 300+13.71 = 313.71$ kg,
$\Delta v = 2157.46\ln(352.25/313.71)$ = **250.0 m/s** ✓.

**Q7 (10).** An injector orifice obeys $\dot m = C_d A\sqrt{2\rho\,\Delta p}$,
so $\Delta p \propto \dot m^2$ at fixed area: throttling to 20 % flow leaves 4 %
of the design injector pressure drop. That drop is what hydraulically decouples
the feed system from the chamber — it makes the flow through the injector
insensitive to chamber pressure fluctuations — so when it collapses, a chamber
pressure perturbation feeds back into the propellant flow and the engine becomes
**chug**-unstable (a low-frequency, feed-system-coupled oscillation, typically
10–300 Hz). The LMDE and the Merlin both use a **pintle injector**, in which a
movable central sleeve varies the injection area with flow so that
$\Delta p$/$p_c$ is preserved across the throttle range [Dressler00][WP].

**Q8 (10).** Recommend **R-236fa (or a comparable self-pressurising
refrigerant)**, in a low-pressure blowdown module.

*Quantitative argument 1 — volume.* At $\rho$ = 1,360 kg/m³ and $I_{sp}$ = 40 s,
$I_v$ = 534 N·s/L, so 400 N·s needs **0.75 L** of propellant, comfortably inside
1.2 L with ullage. GN₂ at 241 bar gives 179 N·s/L and would need **2.2 L** —
it does not fit.

*Quantitative argument 2 — tank mass and hazard.* R-236fa self-pressurises at
~2.7 bar, so the vessel is thin-walled: a few tens of grams at minimum gauge. A
241-bar GN₂ COPV of 2.2 L masses $pV/(g_0\cdot pV/W) = 2.41\times10^{7}\times
2.2\times10^{-3}/(9.80665\times8{,}000)$ = **0.68 kg**, and it brings a COPV
qualification campaign and a stored energy of 53 kJ into a secondary-payload
safety review. The refrigerant module brings essentially none of that.

The optical payload seals the argument: a cold gas deposits nothing, whereas the
alternative that would fit on volume (a monopropellant) deposits ammonia and
unburnt propellant. This is the MarCO trade, and MarCO made the same call
[MarCO].

**Q9 (10).**

| class | response | dominant process |
|---|---|---|
| cold gas | ~10⁰ ms (2–5 ms) | solenoid armature travel plus plenum fill; nothing else happens |
| pressure-fed hypergolic | ~10¹ ms (10–50 ms) | valve travel, manifold/dome fill, hypergolic ignition delay |
| large solid motor | ~10² ms (50–300 ms) | igniter output, flame spread across the whole grain surface, free-volume pressurisation |
| pump-fed cryogenic | ~10³ ms and up (2–6 s) | turbopump spin-up from rest and thermal conditioning/chill-down, then a controlled ramp to mainstage |

**Q10 (10).** **Recommend a storable bipropellant stage (N₂O₄/MMH class,
pressure-fed).**

Justification: 900 m/s is well above the ~610 m/s solid/bipropellant crossover,
so the Isp advantage now pays for the tankage (by the N8 models at 600 kg
payload the bipropellant is several kilograms lighter and the gap widens with
Δv). Decisively, the **±0.3 % Δv accuracy** requirement is one a solid cannot
meet in a single burn: a solid's total impulse dispersion from grain tolerance
and propellant bulk temperature is typically ±0.5–1 %, so a solid would need a
liquid trim stage anyway — at which point you are carrying both systems. And the
storable is hypergolic, so after seven years of cruise there is no igniter to
fail; a cryogenic stage is excluded outright by the storage requirement.

*The requirement to challenge first:* **the ±0.3 % accuracy on the delivered
Δv.** Ask whether it is really an accuracy requirement on Δv or an accuracy
requirement on the final *state*, which can usually be met by a small trim
manoeuvre afterwards instead of by the main burn. If a trim is allowed, a solid
kick motor plus a small monopropellant trim system comes back into the trade and
may be lighter and cheaper. If the accuracy is genuinely on the single burn with
no trim available, the requirement is doing all the work and should be stated as
such in the trade study.

---

## K3. Trade-study reference solution — T1, LEO smallsat

**Requirement digest.** $m_{pay}$ = 120 kg; Δv = 150 m/s; ACS 600 N·s in bits
≤ 0.05 N·s; 3-year life; exposed front optic; ≤ 120 W to propulsion; rideshare
secondary payload; 14-month delivery.

**Step 0 — total impulse and the first filter.** $I_t \approx m\,\Delta v +
600 \approx 120\times150 + 600$ ≈ **19,000 N·s** (a more careful sizing at
$I_{sp}$ = 220 s gives 18,640 N·s for the Δv part). That is **15× the ≈1,300 N·s
cold-gas/monopropellant crossover of Eq. 3.10**. Cold gas is already in serious
trouble before any sizing is done, and this should be the first line of the
study.

**Step 1 — size everything.** Using Eq. 3.8 with the ACS propellant added at
the same $I_{sp}$:

| option | $I_{sp}$ (s) | $k$ | $m_{fix}$ | $m_p$ total (kg) | inert (kg) | **wet (kg)** | prop volume (L) |
|---|---|---|---|---|---|---|---|
| A GN₂ cold gas, 241 bar | 70 | 1.10 | 1.5 | 41.5 | 47.1 | **88.5** | 148 |
| B1 n-butane cold gas | 65 | 0.35 | 1.5 | 36.5 | 14.3 | **50.7** | 64 |
| B2 R-236fa cold gas | 40 | 0.25 | 1.5 | 65.6 | 17.9 | **83.5** | 48 |
| C hydrazine monoprop | 220 | 0.20 | 4.5 | 9.4 | 6.4 | **15.8** | 9.3 |
| C2 90 % HTP monoprop | 150 | 0.20 | 4.5 | 14.1 | 7.3 | **21.4** | 10.1 |
| D N₂O₄/MMH biprop | 300 | 0.30 | 12 | 7.2 | 14.2 | **21.4** | 6.2 |
| E Hall EP at 1,500 s | 1,500 | — | ~5 (thruster + PPU + PMS) | 1.28 | 5 | **~6.3** + ACS module | ~0.9 (Xe) |

(E's ACS is done with reaction wheels desaturated by a small butane cold-gas
module: add ~1.6 kg wet, giving ~8 kg total.)

**Step 2 — apply the non-mass requirements.** This is where the study is won or
lost, and a submission that stops at the mass table earns at most half marks.

| requirement | A | B1 | B2 | C | C2 | D | E |
|---|---|---|---|---|---|---|---|
| wet mass ≤ ~20 % of bus | ✗ (74 %) | ✗ (42 %) | ✗ (70 %) | ✓ (13 %) | ✓ (18 %) | ✓ (18 %) | ✓ (7 %) |
| volume on a 120 kg bus | ✗ 148 L | ✗ 64 L | ✗ 48 L | ✓ | ✓ | ✓ | ✓ |
| impulse bit ≤ 0.05 N·s | ✓ | ✓ | ✓ | ✓ (0.5–1 N thruster, 20 ms) | ✓ | **✗** (400 N class gives ~4 N·s) | ✓ via wheels/cold gas |
| optic contamination | ✓ best | ✓ | ✓ | ⚠ NH₃ + unburnt N₂H₄; mitigable by canting and placement | ⚠ steam/O₂, benign | ✗ worst | ✓ (EP plume is charged; needs its own analysis) |
| ≤ 120 W | ✓ | ✓ | ✓ | ✓ (heaters only, tens of W) | ✓ | ✓ | ⚠ at the limit: 7–8 mN at 120 W and 45 % efficiency |
| 3-year life | ⚠ leak budget | ⚠ leak budget | ⚠ leak budget | ✓ | ⚠ HTP decomposition in storage | ✓ | ✓ |
| rideshare safety review | ⚠ 241-bar COPV | ✓ low pressure | ✓ low pressure | ⚠ toxic loading at the range | ✓ non-toxic | ✗ toxic, two fluids | ⚠ high-voltage PPU |
| 14-month delivery | ✓ catalogue | ✓ catalogue | ✓ catalogue | ✓ mature supply base | ⚠ thinner supply base | ⚠ | ⚠ integration and plume/EMI analysis are the schedule risk |

**Step 3 — recommendation.**

**Recommend C, hydrazine monopropellant**, at ~15.8 kg wet (13 % of the bus).
It is the only option that satisfies every hard requirement with margin on
mass, volume, power and schedule, using a supply base with decades of flight
heritage that can deliver in 14 months. The contamination concern against the
optic is real but is a *placement and duty-cycle* problem, not a class-level
disqualifier: cant the ACS thrusters away from the optical boresight, forbid
firing during imaging, and run a plume-impingement analysis. Deorbit at end of
life is a single burn the class does easily.

**Second choice: E, Hall-effect electric propulsion**, at ~8 kg wet including a
small cold-gas module for wheel desaturation. It is the mass winner by a factor
of two and the propellant is inert. It loses on three counts that matter here:
the 120 W cap gives only ~7–8 mN, so the 19,000 N·s takes on the order of a
month of cumulative thrusting (acceptable over three years, but it constrains
the imaging duty cycle and the operations concept); the PPU, thermal and EMI
integration on a 120 kg bus is the largest schedule risk in a 14-month
programme; and it needs a separate attitude-control solution regardless.

**Eliminated, with reasons stated quantitatively:**
- **A (GN₂):** 88.5 kg wet on a 120 kg bus and 148 L of propellant volume. The
  total impulse is 15× the crossover. Not close.
- **B1/B2 (liquefied cold gas):** better than GN₂ by a factor of 1.7 on mass and
  3 on volume, and still 42–70 % of the bus mass. Cold gas is the right answer
  at 10² –10³ N·s, not at 2×10⁴ N·s.
- **D (bipropellant):** matches HTP on mass but **fails the impulse-bit
  requirement** with main-engine-class thrusters and is the worst contamination
  case for the optic. It also carries two toxic fluids through a rideshare
  safety review. Bipropellant earns its place above ~10⁵ N·s; this mission is an
  order of magnitude short.
- **C2 (HTP):** viable and non-toxic, 36 % heavier than hydrazine, with a
  thinner supply base and a storage-stability requirement over three years that
  needs materials-cleanliness control the programme is unlikely to have. Keep it
  as the fallback if hydrazine loading at the rideshare range is refused.

**The single requirement that would change the recommendation.** The **120 W
power cap**. Raise it to ~300 W and the EP option's thrusting time falls by more
than half, its schedule risk becomes manageable if the bus already has the power
electronics, and it becomes the recommendation on mass. Conversely, tighten the
schedule below about 10 months and EP drops out entirely.

**The largest uncertainty in the analysis.** The inert-mass models — in
particular $m_{fix}$ for the monopropellant system (4.5 kg here) and the Hall
system's hardware mass (5 kg). WE3 showed the cold-gas/monopropellant crossover
moves from 730 to 1,830 N·s as the monopropellant fixed mass goes from 3.0 to
6.0 kg; the same sensitivity applies here. A serious study replaces these with
supplier data sheets before the recommendation is defended, and states the
sensitivity of the answer to them.

### Rubric

| element | marks | what a strong answer contains |
|---|---|---|
| Total impulse computed and compared with the crossover **first** | 15 | ~19,000 N·s against ~1,300 N·s; cold gas eliminated by argument before sizing |
| All options sized with a stated inert-mass model | 20 | Eq. 3.8 applied consistently; ACS propellant included; volumes computed |
| Non-mass requirements evaluated explicitly | 25 | impulse bit, contamination, power, schedule, safety review, storage — each tied to a specific option |
| Clear recommendation with a named second choice | 15 | and the second choice's specific losing arguments |
| The requirement that would flip the decision | 10 | identified and quantified, not just named |
| Largest uncertainty in the analysis identified | 10 | inert-mass models, with the sensitivity shown |
| Numerical hygiene | 5 | SI, units carried, arithmetic verified against the rocket equation |

**Loses marks for:** ranking on $I_{sp}$ alone; omitting the ACS propellant;
choosing bipropellant without noticing the impulse-bit failure; recommending
electric propulsion without computing the thrust at the stated power; quoting a
crossover without its assumptions; declaring cold gas "simple and low risk"
without computing its mass; treating the 3-year life as automatically satisfied
by a cold-gas system when leakage is the class's characteristic failure.

---

## K4. Common wrong answers and what they reveal

**"Pick the highest specific impulse."** The single most common failure, and it
reveals that the student is optimising the propellant instead of the system.
Isp is impulse per unit propellant *weight*; the mass that flies is propellant
*plus tanks plus engine*, and the volume that has to fit is propellant volume.
WE1 kills cold gas on the inert fraction, not on Isp; WE4 picks a 40-second
propellant over a 65-second one; N8 shows a 286 s solid beating a 320 s
bipropellant below 610 m/s. Every one of those is invisible to an Isp ranking.

**Sizing a design whose denominator is negative and not noticing.** Students
plug Δv = 500 m/s into a cold-gas model, get a negative or absurd propellant
mass, and either take the absolute value or assume a sign error. The negative
denominator is the answer: the design does not close. Always compute
$k(e^{\Delta v/c}-1)$ before anything else.

**Quoting a crossover as if it were a physical constant.** "Cold gas loses above
1,300 N·s" is only true for the stated $k$ and $m_{fix}$; WE3's sensitivity
table moves it by a factor of 2.5 over a plausible range of monopropellant fixed
mass, and N5 shows a *lower*-Isp cold gas crossing over *later* because its tank
is lighter. The transferable skill is Eq. 3.10, not the number.

**Confusing engine T/W with stage T/W.** Merlin's 184:1 and GEM-63XL's 3.96 are
not comparable quantities. Students who conclude "liquids have better
thrust-to-weight, so why use solids?" have compared an engine to a stage. The
solid motor's "engine" includes all of its propellant and its tank.

**Reporting a point-estimate reliability as a demonstrated one.** "Zero failures
in thirty flights, so reliability is 1.000" or "0.995". Thirty consecutive
successes demonstrate 0.926 at 90 % confidence. The reveal is that the student
has not internalised that reliability is an inference from a sample, and a small
sample is weak evidence no matter how clean.

**Using the ideal-gas law above 50 bar.** N6's 2.07 kg is 15–20 % high because
$Z > 1$ for nitrogen at 300 bar. On a cold-gas mission that error is larger than
the entire propellant margin.

**Treating "solid = simple = reliable" or "liquid = complex = unreliable" as
axioms.** Both are half-true and the interesting engineering is in the other
half: solids cannot be tested in the configuration flown, and their failures are
rarely survivable; liquids can be inspected and shut down. Students who cannot
argue both sides have memorised a slogan.

**Forgetting that thrust figures need `/motor` and `max`/`avg` qualifiers.**
E1 is deliberately constructed so that the sheet only closes if you supply both
qualifiers. Students who conclude "the Isp must be wrong" have reached for the
least likely error; per-motor/per-vehicle confusion is the most common error in
the secondary literature by a wide margin.

**Ignoring contamination, power, schedule and safety review.** A trade study
that is only a mass table is not a trade study. In T1 the bipropellant option
fails on an impulse-bit requirement that never appears in a mass calculation,
and the electric option fails on a power cap that never appears in the rocket
equation.

**Assuming the highest-thrust option is the one to pick for a booster.** The
strap-on trade in WE2 is not won on thrust alone either — the liquid strap-on is
9 % *lighter* — it is won on thrust density (3.96 vs 1.79 stage T/W), on having
no pad fluid interfaces, and on unit cost at rate. Students who cite only one of
those three have not understood why the vehicle is shaped the way it is.
